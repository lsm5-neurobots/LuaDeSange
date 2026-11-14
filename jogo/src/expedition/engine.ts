// Engine da expedição: monta o palco + HUD no host, roda o loop com velocidade/pausa e entrega o resultado.
import { initPlan, planKeys, planLeftover, updatePlan, querRecuar } from './plan';
import { h } from '../core/dom';
import { EXP } from '../art/legacy';
import { MAPS } from '../data/maps';
import { ZOMBIES, type ZombieId } from '../data/zombies';
import type { ExpeditionConfig, ExpeditionResult } from './types';
import { buildArenas, buildSpots, director, manualSpot, startArena, updateProj } from './director';
import { makeFighter, updateBullets, updateFighter, fighterFrame } from './fighter';
import { golpeHud, primeManualGolpes } from './golpes';
import { golpeSlots } from '../data/golpes';
import { attachPad, bindManual, manualKeysHtml } from './manual';
import { updateZombie } from './ai';
import { makeRenderer } from './render';
import { ambienteHud, initAmbiente, tickAmbiente } from './ambiente';
import { golpeImg, itemImg } from '../art/items';
import { updatePickups } from './pickups';
import { makeEncounters } from './encounters';
import { curArena, RS, SK, type World, type ZKind } from './world';
import { Warmer, expeditionJobs, fighterJobs, arenaJobs, arenaKinds, furyJobs, zombieJobs } from './warm';
import { petArt } from '../art/sprites';
import { probe, settings } from '../core/settings';

export interface ExpeditionHandle { destroy(): void; retreat(): void; setSpeed(s: number): void; togglePause(): boolean; log(): string[]; world: World }

export function startExpedition(host: HTMLElement, cfg: ExpeditionConfig, onFinish: (r: ExpeditionResult) => void): ExpeditionHandle {
  const A = EXP(), map0 = MAPS[cfg.mapId], map = cfg.ondas ? { ...map0, ondas: cfg.ondas } : map0, MAP = (A as any)[map.art] ?? A.MAP;
  A.PIX.setK(SK);
  // MAP.build() (cenário, ~0,5 s) roda dentro da tela de carregamento, depois que ela aparece

  host.innerHTML = '';
  const root = h(`<div class="xp">
    <div class="xp-stage">
      <div class="xp-view"><canvas class="pix" width="${MAP.W * RS}" height="${MAP.H * RS}"></canvas><div class="xp-fx"></div></div>
      <div class="xp-hud">
        <div class="xp-team"></div>
        <div class="xp-wave"><b class="xp-area"></b><span class="xp-info"></span></div>
        <div class="xp-clock" aria-live="off"></div>
      </div>
      <div class="xp-bossbar"><span class="xp-bossname"></span><div class="bar"><i></i></div></div>
      <div class="xp-banner"></div>
      <div class="xp-golpe" aria-live="polite"></div>
      <div class="xp-warning" aria-live="assertive">
        <div class="xp-stripes"></div>
        <div class="xp-wtitle">WARNING</div>
        <div class="xp-wsub"></div>
        <div class="xp-stripes b"></div>
      </div>
      <div class="xp-ia"></div>
      ${cfg.manual ? '<div class="xp-keys" aria-label="Controles do modo manual"></div>' : ''}
      <div class="xp-overlay"><div class="xp-pz"></div></div>
    </div>
    <div class="xp-route"></div>
    <div class="xp-bag"></div>
  </div>`);
  host.appendChild(root);
  const q = <T extends HTMLElement>(s: string) => root.querySelector(s) as T;
  const cv = q<HTMLCanvasElement>('canvas'), g = cv.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  const fxEl = q('.xp-fx'), bannerEl = q('.xp-banner'), warnEl = q('.xp-warning'), iaEl = q('.xp-ia');
  const logLines: string[] = [];

  const zk: Partial<Record<ZombieId, ZKind>> = {};
  for (const [id, d] of Object.entries(ZOMBIES)) if (d.art && (A as any)[d.art]) zk[id as ZombieId] = { ...d, id: id as ZombieId, F: (A as any)[d.art] };

  let bannerT = 0;

  let golpeHudT = 0;
  const w: World = {
    cfg, map, A, MAP, W: MAP.W, H: MAP.H, BASE: MAP.BASE, mode: cfg.lua ? 'lua' : 'noite', zk,
    cam: 0, clock: 0, phase: 'fight', phaseT: 0, hitstop: 0, shake: 0, fade: 0, speed: 1, paused: false, pzOpen: false,
    fs: [], zs: [], proj: [], pools: [], warns: [], rings: [], sparks: [], beams: [], items: [], vfx: [], spots: [], arenas: [], ai: 0, boss: null, pendingWave: null,
    kills: 0, killsBy: {}, bag: {}, projetos: [], keys: (() => { const pk = planKeys(cfg.plano); return { comum: 1 + cfg.bonus.chaves + pk.comum, medico: pk.medico, militar: pk.militar, raro: pk.raro }; })(), miniBoss: false, chefe: false, cleared: 0, maxArea: 1, uid: 0,
    fx(kind, text, wx, y) {
      if (kind === 'burst' && Math.random() < 0.5) return;
      const el = document.createElement('div');
      el.className = 'fx ' + kind;
      el.textContent = text;
      const sc = cv.clientWidth / w.W;
      el.style.left = (wx - w.cam) * sc + 'px';
      el.style.top = y * sc + 'px';
      fxEl.appendChild(el);
      setTimeout(() => el.remove(), 650);
    },
    log(t) { if (logLines[0] !== t) { logLines.unshift(t); logLines.length = Math.min(logLines.length, 40); } },
    banner(t, d, cls = '') { bannerEl.className = 'xp-banner on ' + cls; bannerEl.textContent = t; bannerT = d; },
    warning(title, sub) {
      warnEl.querySelector('.xp-wsub')!.textContent = `${title} · ${sub}`;
      warnEl.classList.remove('on'); void warnEl.offsetWidth; warnEl.classList.add('on');
      setTimeout(() => warnEl.classList.remove('on'), 3100);
    },
    setIA(t) { if (iaEl.textContent !== t) iaEl.textContent = t; },
    golpeHud(quem, golpe, cor) { // faixa curta no topo: quem usou qual golpe (no máx. 1 a cada 2,5 s, senão em 8× fica fixa)
      const now = performance.now();
      if (now - golpeHudT < 2500) return;
      golpeHudT = now;
      const el = q('.xp-golpe');
      el.innerHTML = `<small>${quem}</small><b>${golpe}</b>`;
      el.style.setProperty('--gc', cor);
      el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
    },
    openPuzzle(tipo, nome, done) {
      const ov = q('.xp-overlay'), host2 = q('.xp-pz');
      ov.classList.add('on'); host2.innerHTML = '';
      let finished = false;
      const end = (ok: boolean, skip: boolean) => { if (finished) return; finished = true; ov.classList.remove('on'); host2.innerHTML = ''; done(ok, skip); };
      const PZ = A.PUZZLE, tipoPz: Record<string, string> = { comum: 'fio', medico: 'num', militar: 'sym', raro: 'sym' };
      if (PZ) { try { PZ.mount(host2, { tipo: tipoPz[tipo] || 'fio', tempo: 5, bau: nome, auto: false, onDone: (r: any) => end(!!r?.ok, !!r?.skip) }); return; } catch (e) { console.warn(e); } }
      let left = 5;
      host2.innerHTML = `<b>${nome}</b><br>sem chave · puzzle<div class="t">5</div><small>pula sozinho</small>`;
      const iv = setInterval(() => { left--; const t = host2.querySelector('.t'); if (t) t.textContent = String(left); if (left <= 0) { clearInterval(iv); end(false, true); } }, 1000);
    },
  };

  // squad
  A.GORE.clear();
  buildArenas(w);
  if (cfg.ausentes?.length) w.log(`Rastros: ${cfg.ausentes.length} tipo${cfg.ausentes.length > 1 ? 's' : ''} de zumbi deste mapa não ${cfg.ausentes.length > 1 ? 'apareceram' : 'apareceu'} nesta noite.`);
  initPlan(w);
  buildSpots(w);
  w.fs = cfg.team.map((m, i) => makeFighter(w, m, i));
  if (cfg.manual && w.fs[0]) primeManualGolpes(w.fs[0]);
  const manualPad = cfg.manual ? bindManual() : null;
  if (manualPad) attachPad(w, manualPad);
  w.ai = Math.max(0, Math.min(w.arenas.length - 1, cfg.inicio ?? 0));
  const first = w.arenas[w.ai];
  w.cam = first.cam;
  w.fs.forEach((f, i) => { f.x = w.cam + 110 - i * 26; f.y = 178 + (i ? 16 : 0); });
  w.spots.forEach((s) => { if (s.x < w.cam + w.W) s.done = true; });
  startArena(w);
  initAmbiente(w); // dia, clima e Lua de Sangue pelo relógio do mundo (antes de pré-gerar os tiles)
  w.banner(cfg.lua ? 'LUA DE SANGUE' : map.nome.toUpperCase(), 2, cfg.lua ? 'fail' : '');

  const renderer = makeRenderer(w, g);
  // ---- carregamento: gera antes o que aparece nos primeiros segundos; o resto vai em segundo plano ----
  const warm = new Warmer();
  (w as any).warm = warm; (window as any).__xpw = w; // diagnóstico/testes
  let loadEl!: HTMLElement, loadBar!: HTMLElement, loadMsg!: HTMLElement;
  const openLoad = (small: string, title: string, msg: string) => {
    loadEl = h(`<div class="xp-loading" role="status" aria-live="polite"><div class="xp-lbox">
      <small>${small}</small><b>${title}</b><div class="xp-lbar"><i></i></div><span class="xp-lmsg">${msg}</span></div></div>`);
    root.querySelector('.xp-stage')!.appendChild(loadEl);
    loadBar = loadEl.querySelector('i') as HTMLElement; loadMsg = loadEl.querySelector('.xp-lmsg') as HTMLElement;
  };
  openLoad(cfg.lua ? 'Noite de Lua de Sangue' : 'Expedição', map.nome, 'Preparando a rota…');
  probe.reset();
  const petW = cfg.pet ? { art: petArt(cfg.pet.tipo, cfg.pet.variante), id: cfg.pet.tipo + cfg.pet.variante } : null;
  // chefes: quadros de ~1 MB, ~30 ms cada mesmo em máquina boa — não dá pra gerar em segundo plano sem pico,
  // então a arena de chefe sempre carrega o kit da forma normal inteiro (aqui ou num "WARNING" de carga ao chegar nela)
  const bossKinds = (i: number) => arenaKinds(w, i).filter((k) => ZOMBIES[k].boss);
  const bossDone = new Set<number>();
  let loading = true, loadT0 = performance.now(), jobsRest: ReturnType<typeof expeditionJobs>['rest'] = [], essN = 0, coreN = 0, loadBase = 0, mustAll = false, prep = 0;
  const PREP: [string, () => void][] = [
    ['Montando o cenário…', () => { if (!MAP._built) { MAP.build(); MAP._built = true; } }],
    ['Montando o cenário…', () => { MAP.warm?.(w.cam); }],
    ['Acordando os mortos…', () => {
      const j = expeditionJobs(w, petW), bk = bossKinds(w.ai);
      coreN = warm.add(j.essential); essN = coreN + warm.add(j.extended) + warm.add(bk.flatMap((k) => zombieJobs(w, k, ['normal'])));
      mustAll = bk.length > 0; bossDone.add(w.ai); jobsRest = j.rest;
    }],
  ];
  /** Chegou numa arena de chefe que ainda não foi gerada: tela de carga curta antes do WARNING. */
  function bossGate(): boolean {
    if (bossDone.has(w.ai)) return false;
    bossDone.add(w.ai);
    const bk = bossKinds(w.ai);
    if (!bk.length) return false;
    loadBase = warm.done; coreN = essN = warm.add(bk.flatMap((k) => zombieJobs(w, k, ['normal'])), true);
    if (!essN) return false;
    openLoad('WARNING', ZOMBIES[bk[0]].nome, 'O chefe está chegando…');
    loadT0 = performance.now(); mustAll = true; jobsRest = []; loading = true;
    return true;
  }
  function loadStep(): boolean { // true = terminou
    const t0 = performance.now();
    while (prep < PREP.length && performance.now() - t0 < 8) { loadMsg.textContent = PREP[prep][0]; PREP[prep++][1](); }
    if (prep < PREP.length) { loadBar.style.width = (prep / PREP.length) * 25 + '%'; return false; }
    warm.run(Math.max(2, 10 - (performance.now() - t0)), Infinity); // carregando: sempre pelo menos 1 quadro por fatia
    const got = warm.done - loadBase, p = essN ? Math.min(1, got / essN) : 1;
    loadBar.style.width = 25 + p * 75 + '%';
    // Fecha quando: tudo pronto; ou o núcleo (squad/zumbis chegando) pronto e já passou 2,5 s — máquina rápida segue
    // o resto em segundo plano sem picos; máquina lenta espera também os golpes/reações da 1ª arena (senão a 1ª luta
    // gera tudo na hora e despenca). Arena de chefe espera o kit do chefe. Teto de 20 s; o que faltar vai pra fila de segundo plano.
    const el = performance.now() - loadT0, coreDone = got >= coreN, fast = warm.avgCost() < 18; // ~10 ms por personagem numa máquina boa, ~40 ms numa lenta
    const wait = got < essN && warm.pending > 0 && el < 20000 && (!coreDone || mustAll || el < 2500 || !fast);
    if (wait) { loadMsg.textContent = mustAll && !jobsRest.length ? 'O chefe está chegando…' : coreDone ? 'Afiando as armas…' : 'Acordando os mortos…'; return false; }
    warm.add(jobsRest);
    loadEl.classList.add('off'); setTimeout(() => loadEl.remove(), 400);
    return true;
  }
  let warnedAi = -1, furyQ = false;
  /** Teto do quadro com folga: o trabalho de fundo para antes de 25 ms, para o intervalo ficar acima de 30 fps. */
  const FRAME_MS = 22;
  /** Segundo plano: no máximo uns milissegundos de sobra. Job que não cabe é pulado (warm.run puxa um mais barato). */
  function idleWork(frameStart: number, _rawDt: number) {
    if (w.ai !== warnedAi) { warnedAi = w.ai; warm.add(arenaJobs(w, w.ai, true), true); warm.add(arenaJobs(w, w.ai + 1, true)); }
    if (w.boss && !furyQ && w.boss.hp < w.boss.maxhp * 0.6) { furyQ = true; warm.add(furyJobs(w, w.boss.kind).filter((j) => /\|(idle|walk)\|/.test(j.k)), true); }
    let left = FRAME_MS - (performance.now() - frameStart);
    if (left < 2) return;
    if (MAP.idle && MAP.idle(Math.min(3, left - 1))) return;
    if (!warm.pending) return;
    left = FRAME_MS - (performance.now() - frameStart);
    if (left < 1.5) return;
    warm.run(Math.min(6, left - 0.4), 0);
  }
  const enc = makeEncounters(w, q('.xp-stage')); // sobreviventes/pets no mapa: diálogo + missão + chance de recrutar
  w.manualJ = (f, commit) => enc.prompt(f, commit) ?? manualSpot(w, f, commit);


  const teamEl = q('.xp-team');
  const renderTeam = () => {
    teamEl.innerHTML = w.fs.map((f, i) => `<div class="xp-card"><b>${f.m.nome}</b> <span>nv ${f.m.lv} · ${f.w.nome}</span>
    <div class="bar hp"><i data-hp="${i}"></i></div><div class="bar sp"><i data-sp="${i}"></i></div>
    <div class="xp-gs">${golpeHud(f).map((g, k) => `<i data-g="${i}.${k}" style="--gc:${g.cor}" title="${g.nome}">${golpeImg(g.id, 28)}</i>`).join('')}</div></div>`).join('');
  };
  renderTeam();
  // recruta resgatado com vaga no squad: entra na hora, onde ele está, e passa a lutar (quadros gerados em segundo plano)
  w.addFighter = (m, x, y) => {
    if (w.fs.length >= 2 || w.fs.some((f) => f.m.id === m.id)) return false;
    const f = makeFighter(w, m, w.fs.length);
    f.x = x; f.y = y; f.face = 1;
    w.fs.push(f);
    warm.add(fighterJobs(w, f, f.rig === 'vigia' ? ['idle', 'run', 'guard', 'advance', 'combo', 'hurt'] : ['idle', 'walk', 'run', 'combo', 'guard', 'hurt']), true);
    warm.add(fighterJobs(w, f));
    renderTeam();
    w.fx('burst', 'NO SQUAD!', x, y - 80);
    w.log(`<b>${m.nome}</b> entrou no squad e vai lutar junto até o fim da expedição.`);
    return true;
  };
  const routeEl = q('.xp-route');
  const buildRoute = () => {
    routeEl.innerHTML = w.arenas.map((a, i) => {
      const b = a.list.some((k) => ZOMBIES[k].boss === 'chefe'), mb = a.list.some((k) => ZOMBIES[k].boss === 'mini');
      return `<i class="${i < w.ai ? 'done' : i === w.ai ? 'now' : ''} ${mb ? 'mb' : ''} ${b ? 'b' : ''}" title="${a.area.n} ${a.area.short} · arena ${a.k + 1}"></i>`;
    }).join('');
  };
  buildRoute();
  let lastAi = -1;
  let t0 = performance.now();

  let hudT = 0;
  // HUD: só escreve no DOM quando o valor muda (evita estilo/layout a cada 100 ms)
  const memo = new WeakMap<Element, string>();
  const put = (el: HTMLElement, k: 'w' | 't' | 'h', v: string) => { const key = k + v; if (memo.get(el) === key) return; memo.set(el, key); if (k === 'w') el.style.width = v; else if (k === 't') el.textContent = v; else el.innerHTML = v; };
  function hud() {
    w.fs.forEach((f, i) => {
      put(teamEl.querySelector(`[data-hp="${i}"]`) as HTMLElement, 'w', ((f.hp / f.maxhp) * 100).toFixed(1) + '%');
      const sp = teamEl.querySelector(`[data-sp="${i}"]`) as HTMLElement;
      put(sp, 'w', f.sp.toFixed(1) + '%');
      sp.parentElement!.classList.toggle('full', f.sp >= 100);
      golpeHud(f).forEach((g, k) => {
        const el = teamEl.querySelector(`[data-g="${i}.${k}"]`) as HTMLElement | null;
        if (!el) return;
        el.style.setProperty('--p', String(g.pronto));
        el.classList.toggle('ok', g.pronto >= 1);
        el.classList.toggle('now', f.state === 'golpe' && f.gr?.id === g.id);
      });
    });
    const ar = curArena(w);
    put(q('.xp-area'), 't', `ÁREA ${ar.area.n}/${MAP.AREAS.length} · ${ar.area.short}`);
    { const ah = ambienteHud(w), ce = q('.xp-clock'); put(ce, 'h', ah.html); ce.classList.toggle('lua', ah.lua); ce.classList.toggle('warn', ah.warn); }
    put(q('.xp-info'), 't', `arena ${w.ai + 1}/${w.arenas.length} · abates ${w.kills} · chaves ${w.keys.comum + w.keys.militar}`);
    const bag = Object.entries(w.bag).filter(([, v]) => v);
    put(q('.xp-bag'), 'h', (bag.length ? '<span class="lbl">Mochila</span> ' + bag.map(([k, v]) => `<span title="${k.replace('_', ' ')}">${itemImg(k as any, 18)}<b>×${v}</b></span>`).join(' ') : '<span class="lbl">Mochila vazia</span>')
      + (w.projetos.length ? ` <span class="proj">${itemImg('projeto', 18)}${w.projetos.join(', ')}</span>` : ''));
    const bb = q('.xp-bossbar');
    if (w.boss && !w.boss.dead) {
      bb.classList.add('on'); bb.classList.toggle('furia', !!w.boss.fury);
      put(q('.xp-bossname'), 't', w.boss.K.nome + (w.boss.fury ? ' · FÚRIA' : '') + (w.boss.state === 'dazed' ? ' · ATORDOADO' : w.boss.vuln ? ' · VULNERÁVEL' : ''));
      put(bb.querySelector('i') as HTMLElement, 'w', Math.max(0, (w.boss.hp / w.boss.maxhp) * 100).toFixed(1) + '%');
    } else bb.classList.remove('on');
    if (w.phase === 'go' || (w.phase === 'walk' && bannerT <= 0)) { if (bannerEl.className !== 'xp-banner on go') { bannerEl.className = 'xp-banner on go'; bannerEl.textContent = 'GO ➜'; } }
    else if (bannerT <= 0 && bannerEl.className !== 'xp-banner') bannerEl.className = 'xp-banner';
    if (w.ai !== lastAi) { lastAi = w.ai; buildRoute(); }
    if (cfg.manual && w.fs[0]) {
      const keys = q('.xp-keys');
      if (keys) put(keys, 'h', manualKeysHtml(golpeHud(w.fs[0]), w.manualJ?.(w.fs[0], false) ?? null, golpeSlots(w.fs[0].m.lv)));
    }
    enc.hud();
  }

  let finished = false, recuou = false;
  function finish(sucesso: boolean) {
    if (finished) return;
    finished = true;
    alive = false;
    const r: ExpeditionResult = {
      mapId: cfg.mapId, sucesso, areaAlcancada: w.maxArea, totalAreas: MAP.AREAS.length, arenasLimpas: w.cleared, totalArenas: w.arenas.length,
      abates: w.kills, abatesPorTipo: { ...w.killsBy }, abatesPorForma: { ...(w.killsForm ?? {}) }, itensSobra: planLeftover(w), kitsUsados: w.kitsUsados ?? 0, loot: { ...w.bag }, projetos: [...w.projetos], armas: [...(w.armasAchadas ?? [])],
      miniBoss: w.miniBoss, chefe: w.chefe, lua: cfg.lua, primeira: cfg.primeira, recuou: !sucesso && recuou, duracao: (performance.now() - t0) / 1000, teamIds: cfg.team.map((m) => m.id), // quem entrou no caminho ganha o XP via encontros (entrou)
      encontros: enc.results(),
    };
    if (sucesso) for (const [k, v] of Object.entries(map.loot.vitoria)) r.loot[k as keyof typeof r.loot] = (r.loot[k as keyof typeof r.loot] ?? 0) + (v ?? 0);
    onFinish(r);
  }

  let alive = true, last = performance.now();
  const prof = { n: 0, sum: 0, worst: 0, workSum: 0, workWorst: 0, manual: !!cfg.manual, preset: '' };
  (w as any).prof = prof;
  function loop(now: number) {
    if (!alive) return;
    const rawDt = now - last, dt = Math.min(0.05, rawDt / 1000);
    last = now;
    if (loading) {
      try { if (loadStep()) { loading = false; if (!w.clock) t0 = performance.now(); last = performance.now(); } } catch (e) { console.error(e); loading = false; loadEl.remove(); }
      requestAnimationFrame(loop);
      return;
    }
    if (bossGate()) { requestAnimationFrame(loop); return; }
    probe.frame(rawDt); // modo gráfico automático (fora das telas de carga)
    try {
      if (!w.paused && !w.pzOpen) {
        const steps = w.speed > 4 ? Math.ceil(w.speed / 4) : 1, sdt = (dt * w.speed) / steps;
        for (let i = 0; i < steps; i++) {
          w.clock += sdt;
          w.shake = Math.max(0, w.shake - sdt);
          if (bannerT > 0) bannerT -= sdt;
          if (w.hitstop > 0) w.hitstop -= sdt;
          else {
            w.fs.forEach((f) => updateFighter(w, f, sdt));
            w.zs.forEach((z) => updateZombie(w, z, sdt));
            updateBullets(w, sdt);
            updateProj(w, sdt);
            director(w, sdt);
            updatePlan(w, sdt);
            updatePickups(w, sdt);
            enc.update(sdt);
          }
        }
      }
      renderer.draw(w.paused ? 0 : dt * w.speed);
      tickAmbiente(w, dt);
      hudT -= dt;
      if (hudT <= 0) { hudT = 0.1; hud(); } // HUD em DOM a 10 Hz
      if (w.phase === 'done') { finish(w.chefe); return; }
      if (!finished && querRecuar(w)) { recuou = true; w.log('<b>Recuo</b> (plano): vida do squad baixa e sem kits; voltando com o loot.'); finish(false); return; }
      if (!w.pzOpen) idleWork(now, rawDt);
      const work = performance.now() - now;
      if (!w.paused && rawDt > 0 && rawDt < 200 && w.clock > 1.2) {
        prof.n++; prof.sum += rawDt; if (rawDt > prof.worst) prof.worst = rawDt;
        prof.workSum += work; if (work > prof.workWorst) prof.workWorst = work;
        prof.preset = settings.preset;
      }
    } catch (e) { console.error(e); }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  void fighterFrame;

  return {
    world: w,
    destroy() { alive = false; manualPad?.destroy(); warm.clear(); enc.destroy(); host.innerHTML = ''; },
    retreat() { if (!finished) { recuou = true; w.log('O squad recuou com o loot.'); finish(false); } },
    setSpeed(s) { w.speed = s; },
    togglePause() { w.paused = !w.paused; return w.paused; },
    log: () => logLines,
  };
}
