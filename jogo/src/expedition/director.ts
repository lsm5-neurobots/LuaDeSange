// Diretor da expedição: rota de arenas, ondas, WARNING de chefe, vasculhar/baús, projéteis e fases.
import { ZOMBIES, type ZombieId } from '../data/zombies';
import { LOOT_TO_RES } from '../data/resources';
import { WEAPONS, type WeaponFamily } from '../data/weapons';
import { aiOf } from './ai';
import { mkZ } from './combat';
import { hurtF, stunF, VMAX } from './fighter';
import { dropItem, flushArenaLoot, rollArenaLoot } from './pickups';
import { aliveF, aliveZ, clampY, corpseT, curArena, rnd, setAnim, spawnFx, sprTarget, type Arena, type Spot, type World } from './world';

export function buildArenas(w: World): void {
  const pos = w.map.arenaPos ?? {};
  w.arenas = [];
  w.MAP.AREAS.forEach((A: any) => {
    const rels = pos[A.id] ?? [0.5, 1];
    (w.map.ondas[A.id] ?? []).forEach((list, k) => {
      w.arenas.push({ cam: Math.max(A.x0, Math.min(A.x1 - w.W, Math.round(A.x0 + (rels[k] ?? 1) * A.len - w.W / 2))), area: A, k, list });
    });
  });
  w.arenas.sort((a, b) => a.cam - b.cam);
}

export function buildSpots(w: World): void {
  const O = w.A.OBJ, KINDS = O ? Object.keys(O.KINDS) : ['lixeira', 'caixa', 'carro'];
  const CHEST: Record<string, string> = { comum: 'comum', escondido: 'comum', 'médico': 'medico', medico: 'medico', militar: 'militar', raro: 'raro', chefe: 'raro' };
  w.spots = [];
  w.MAP.AREAS.forEach((A: any) => {
    if ((w.map.semVasculhar ?? []).includes(A.id)) return;
    // objetos de vasculhar espalhados ao longo da área (3–4), longe dos baús e das arenas
    const ks = O ? KINDS.filter((k) => (O.KINDS[k].areas || []).includes(A.id)) : [];
    const pool = ks.length ? ks : KINDS;
    const busy: number[] = [...(A.chests || []).map((c: [number, string]) => c[0]), ...((w.map.arenaPos ?? {})[A.id] ?? [0.35, 0.7])];
    const slots = [0.14, 0.27, 0.42, 0.56, 0.68, 0.82, 0.93].filter((r) => busy.every((b) => Math.abs(b - r) > 0.07));
    const n = Math.min(slots.length, 3 + (A.n % 2));
    for (let i = 0; i < n; i++) {
      const r = slots[Math.floor((i + 0.5) * slots.length / n)];
      w.spots.push({ t: 'obj', kind: pool[(i + A.id.length + A.n) % pool.length], x: A.x0 + A.len * r, y: 146 + ((i + A.n) % 3) * 6, state: 'fechado', done: false });
    }
    // toda área tem pelo menos um baú no mapa
    const chests: [number, string][] = (A.chests && A.chests.length) ? A.chests : [[0.5, A.n % 4 === 0 ? 'militar' : 'comum']];
    chests.forEach(([rel, k]: [number, string]) => w.spots.push({ t: 'bau', tipo: CHEST[k] || 'comum', x: A.x0 + A.len * Math.min(0.92, Math.max(0.08, rel)), y: 152, state: 'fechado', done: false }));
  });
  w.spots.sort((a, b) => a.x - b.x);
}

const hasBoss = (a: Arena) => a.list.some((k) => ZOMBIES[k].boss);

/** Começa a arena atual: chefe passa antes pela tela de WARNING. */
export function startArena(w: World): void {
  const A = curArena(w);
  w.maxArea = Math.max(w.maxArea, A.area.n);
  if (hasBoss(A)) {
    const bk = A.list.find((k) => ZOMBIES[k].boss)!, def = ZOMBIES[bk];
    w.phase = 'warning'; w.phaseT = 3.2; w.pendingWave = A;
    w.warning(def.boss === 'chefe' ? 'CHEFE' : 'MINI BOSS', def.nome);
    w.log(`<b>WARNING</b>: ${def.nome} se aproxima!`);
    return;
  }
  w.phase = 'fight';
  spawnWave(w, A);
}

export function spawnWave(w: World, A: Arena, emb = false): void {
  // mini boss traz um errante junto: conta na divisão do loot · emboscada rende metade de uma arena
  rollArenaLoot(w, A.list.length + A.list.filter((k) => w.zk[k]?.boss === 'mini').length, emb ? 0.5 : 1);
  A.list.forEach((k: ZombieId, i) => {
    const K = w.zk[k]!, AI = aiOf(K), fromLeft = i % 3 === 2 && w.ai > 2;
    if (K.boss) {
      const s = AI.spawn!(w, i, false);
      const z = mkZ(w, k, s.x, s.y, s.face, s.state, s.anim);
      w.boss = z; w.shake = 0.5;
      w.banner(K.nome.toUpperCase(), 2.2);
      if (K.boss === 'mini') mkZ(w, 'errante', w.cam + w.W + 30, 160, -1, 'chase', 'walk');
      return;
    }
    if (AI.spawn) { const s = AI.spawn(w, i, fromLeft); mkZ(w, k, s.x, s.y, s.face, s.state, s.anim); return; }
    // todo zumbi de onda nasce fora da tela (margem > meia largura do sprite) e entra andando
    mkZ(w, k, fromLeft ? w.cam - 26 - i * 14 : w.cam + w.W + 26 + i * 18, 150 + rnd() * 52, fromLeft ? 1 : -1, AI.rest, 'walk');
  });
  w.log(`${A.area.n}·${A.area.short} ${emb ? '<b>emboscada</b> no vasculhar' : `arena ${A.k + 1}`}: ${A.list.map((k) => ZOMBIES[k].nome).join(', ')}`);
}

// ---------------- emboscada no vasculhar ----------------
/** chance de o barulho do vasculhar atrair zumbis (fora a emboscada garantida de cada área) */
export const EMBOSCADA_P = 0.3;
const areaDe = (w: World, x: number): any => w.MAP.AREAS.find((A: any) => x >= A.x0 && x < A.x1) ?? curArena(w).area;

/** Depois de vasculhar: às vezes (e pelo menos uma vez por área) 2–4 zumbis comuns da área chegam pelo barulho. */
export function talvezEmboscada(w: World, sp: Spot): boolean {
  const A = areaDe(w, sp.x), feitas = (w.embAreas ??= []);
  // garantida no último objeto da área se ela ainda não teve emboscada
  const ultimo = !w.spots.some((s) => s.t === 'obj' && !s.done && s !== sp && areaDe(w, s.x) === A);
  if (!(rnd() < EMBOSCADA_P || (ultimo && !feitas.includes(A.id)))) return false;
  // zumbis das ondas desta área (sem chefes); sem ondas próprias, usa as da próxima arena
  const daArea = (w.map.ondas[A.id] ?? []).flat().filter((k) => w.zk[k] && !ZOMBIES[k].boss);
  const pool = daArea.length ? daArea : (w.arenas[w.ai + 1]?.list ?? []).filter((k) => w.zk[k] && !ZOMBIES[k].boss);
  if (!pool.length) return false;
  const n = Math.min(4, 2 + (w.ai > 4 ? 1 : 0) + (rnd() < 0.35 ? 1 : 0));
  const list = Array.from({ length: n }, () => pool[Math.floor(rnd() * pool.length)]);
  feitas.push(A.id);
  w.emb = true; w.phase = 'fight';
  w.fs.forEach((f) => { if (!f.down) f.state = 'guard'; });
  w.banner('EMBOSCADA!', 1.4); w.setIA('emboscada · o barulho atraiu zumbis');
  spawnWave(w, { cam: w.cam, area: A, k: -1, list }, true);
  return true;
}

// ---------------- projéteis inimigos e poças ----------------
export function updateProj(w: World, dt: number): void {
  for (const p of w.proj) {
    if (p.kind === 'bullet') continue;
    p.t += dt / p.d;
    const t = Math.min(1, p.t);
    if (p.kind === 'hook') {
      p.x = p.x0 + (p.x1 - p.x0) * t; p.y = p.y0 + (p.y1 - 60 - p.y0) * t;
      if (!p.hit) for (const f of aliveF(w)) {
        if (Math.abs(f.x - p.x) < 14 && Math.abs(f.y - 60 - p.y) < 40) {
          p.hit = true; hurtF(w, f, p.dmg);
          if (!f.down) { stunF(w, f, 0.7, 'PUXADO!'); f.x = p.owner.x + p.owner.face * 48; f.y = clampY(p.owner.y); w.log(`O gancho puxou ${f.m.nome}!`); }
          break;
        }
      }
      if (t >= 1) p.done = true;
      continue;
    }
    p.x = p.x0 + (p.x1 - p.x0) * t;
    p.y = p.y0 + (p.y1 - p.y0) * t - Math.sin(t * Math.PI) * (p.kind === 'rock' ? 60 : 34);
    if (t >= 1) {
      p.done = true;
      if (p.kind === 'acid') w.pools.push({ x: p.x1, y: p.y1, t: 0, c: p.c, dmg: p.dmg });
      if (p.kind === 'rock') {
        w.shake = 0.25;
        w.warns = w.warns.filter((x) => !(x.kind === 'circle' && Math.abs(x.x! - p.x1) < 1));
        w.fx('burst', 'KRAK!', p.x1, p.y1 - 30);
        spawnFx(w, 'rockBreak', p.x1, p.y1 - 6);
        for (let i = 0; i < 14; i++) w.sparks.push({ x: p.x1, y: p.y1 - 6, vx: (rnd() - 0.5) * 120, vy: -30 - rnd() * 70, t: 0, c: '#8a8494' });
        for (const f of aliveF(w)) if (Math.hypot(f.x - p.x1, (f.y - p.y1) * 2) < 30) hurtF(w, f, p.dmg);
      }
    }
  }
  w.proj = w.proj.filter((p) => !p.done);
  for (const p of w.pools) {
    p.t += dt;
    for (const f of aliveF(w)) {
      if (Math.abs(f.x - p.x) < 18 && Math.abs(f.y - p.y) < 9) {
        f.poolT = (f.poolT || 0) + dt;
        // lodo do Barqueiro: lentidão enquanto pisa e 1,2 s depois de sair
        if (p.slow) { if (!(f.slowT > 0)) w.fx('hurt', 'lento', f.x, f.y - 110); f.slowT = 1.2; f.slowK = p.slow; }
        if (f.poolT > 0.5) { f.poolT = 0; hurtF(w, f, p.dmg * 0.5); w.fx('hurt', 'veneno', f.x, f.y - 96); }
      }
    }
  }
  w.pools = w.pools.filter((p) => p.t < 3.2);
  w.warns = w.warns.filter((x) => !x.owner || (!x.owner.dead && ['charge', 'attack', 'throw', 'leap', 'wail', 'dash', 'stomp', 'clock'].includes(x.owner.state)));
}

// ---------------- vasculhar e baús ----------------
function addItem(w: World, item: string, n = 1, at?: { x: number; y: number }): string {
  const r = LOOT_TO_RES[item] ?? 'sucata';
  const q = Math.max(1, Math.round(n * w.cfg.bonus.loot * (w.mode === 'lua' ? 1.25 : 1)));
  w.bag[r] = (w.bag[r] ?? 0) + q;
  if (at) dropItem(w, r, q, at.x, at.y + 4, 1.4);
  return `+${q} ${item}`;
}

function rollProjeto(w: World, tipo: string): void {
  const p = w.map.loot.projeto * (tipo === 'militar' || tipo === 'raro' ? 1.6 : 0.6);
  if (rnd() >= p) return;
  // cada projeto conta (vira projeto de melhoria na Oficina); o bastão também tem projeto agora
  const r = rnd(), fam: WeaponFamily = r < 0.45 ? 'pistola' : r < 0.75 ? 'laser' : 'bastao';
  w.projetos.push(fam);
  const spo = w.spots.find((s) => s.state === 'aberto'); if (spo) dropItem(w, 'projeto', 1, spo.x, spo.y + 4, 1.4);
  w.banner(`PROJETO: ${WEAPONS[fam].nome.toUpperCase()}`, 1.8, 'go');
  w.log(`Achou um projeto de <b>${WEAPONS[fam].nome.toLowerCase()}</b>!`);
}

/** Arma achada em baú: sempre raridade COMUM (evoluir é na Oficina). */
function rollArma(w: World, tipo: string, at?: { x: number; y: number }): void {
  const p = tipo === 'militar' || tipo === 'raro' ? 0.3 : 0.1;
  if (rnd() >= p) return;
  const r = rnd(), fam: WeaponFamily = r < 0.45 ? 'pistola' : r < 0.7 ? 'bastao' : 'laser';
  (w.armasAchadas ??= []).push(fam);
  w.banner(`ARMA: ${WEAPONS[fam].nomes.comum.toUpperCase()}`, 1.8, 'go');
  if (at) w.fx('tag', 'ARMA COMUM', at.x, at.y - 70);
  w.log(`Achou a arma <b>${WEAPONS[fam].nomes.comum}</b> (comum)`);
}

function openChest(w: World, sp: any): void {
  const B = w.A.BAU, tipo = sp.tipo, nome = B?.TIPOS?.[tipo]?.nome ?? 'Baú ' + tipo;
  // Sempre aparece o puzzle do baú com 5 s (botão Pular). Resolver = abre com loot extra.
  // Pular/acabar o tempo/errar: abre com chave se tiver; senão fica trancado.
  // plano: com chave e "usar chaves" ligado, abre na hora sem puzzle
  if (w.cfg.plano?.usarChaves && (w.keys[tipo] ?? 0) > 0) {
    w.keys[tipo]--; sp.state = 'abrindo'; sp.anim = 0; w.phase = 'chest'; w.phaseT = 1.4;
    w.fx('tag', 'CHAVE · ' + nome, sp.x, sp.y - 60); w.log(`${nome} aberto com chave (automático)`);
    return;
  }
  if (w.cfg.plano?.semChave === 'pular') { // plano: sem chave, nem tenta o puzzle
    sp.state = 'trancado'; sp.anim = 0; w.phase = 'chest'; w.phaseT = 0.6;
    w.fx('tag', 'SEM CHAVE · PASSOU', sp.x, sp.y - 60); w.log(`${nome}: sem chave, passou reto (plano)`);
    return;
  }
  w.phase = 'chest'; w.phaseT = 99; w.pzOpen = true;
  w.fx('bubble', 'BAÚ!', sp.x, sp.y - 50);
  w.openPuzzle(tipo, nome, (ok: boolean, skip: boolean) => {
    if (sp.closed) return;
    sp.closed = true; w.pzOpen = false;
    if (ok) { sp.state = 'abrindo'; sp.anim = 0; sp.bonus = true; w.log(`${nome}: puzzle resolvido · loot extra`); w.fx('tag', 'LOOT EXTRA', sp.x, sp.y - 60); w.phaseT = 1.4; }
    else if (w.cfg.plano?.usarChaves !== false && (w.keys[tipo] ?? 0) > 0) { w.keys[tipo]--; sp.state = 'abrindo'; sp.anim = 0; w.fx('tag', 'CHAVE · ' + nome, sp.x, sp.y - 60); w.log(`${nome} aberto com chave`); w.phaseT = 1.4; }
    else { sp.state = 'trancado'; sp.anim = 0; w.log(`${nome}: sem chave, puzzle ${skip ? 'pulado' : 'errado'}`); w.fx('tag', 'TRANCADO', sp.x, sp.y - 60); w.phaseT = 0.8; }
  });
}

const REACH_X = 34, REACH_Y = 26;

/** Começa a vasculhar ou o baú com o líder já em cima do objeto (o manual não anda sozinho até lá). */
function beginSpot(w: World, sp: Spot, f: { x: number; y: number; face: 1 | -1 }): void {
  const t = sprTarget(sp);
  f.x = t.x; f.y = t.y; f.face = sp.x >= t.x ? 1 : -1;
  sp.done = true;
  w.appr = null;
  if (sp.t === 'obj') {
    const O = w.A.OBJ, tm = ((O?.KINDS[sp.kind!]?.tempo || 1) * 1.4);
    w.phase = 'search'; w.phaseT = tm; sp.tm = tm; sp.state = 'vasculhando'; sp.anim = 0;
    w.log('Vasculhando: ' + (O?.KINDS[sp.kind!]?.nome ?? sp.kind));
  } else openChest(w, sp);
}

/**
 * Manual: J no alcance de um objeto ou baú ainda fechado.
 * Sem commit, só devolve o verbo ("vasculhar" / "abrir").
 */
export function manualSpot(w: World, f: { x: number; y: number; down?: boolean; face: 1 | -1 }, commit: boolean): string | null {
  if (!w.cfg.manual || w.phase !== 'walk' || f.down) return null;
  let best: Spot | null = null, bd = 1e9;
  for (const sp of w.spots) {
    if (sp.done || sp.state !== 'fechado') continue;
    const t = sprTarget(sp);
    const dx = Math.abs(f.x - t.x), dy = Math.abs(f.y - t.y);
    const dx2 = Math.abs(f.x - sp.x), dy2 = Math.abs(f.y - sp.y);
    if ((dx > REACH_X || dy > REACH_Y) && (dx2 > REACH_X || dy2 > REACH_Y)) continue;
    const d = Math.min(dx + dy * 2, dx2 + dy2 * 2);
    if (d < bd) { bd = d; best = sp; }
  }
  if (!best) return null;
  const verb = best.t === 'bau' ? 'abrir' : 'vasculhar';
  if (commit) beginSpot(w, best, f);
  return verb;
}

export function updateSpots(w: World, dt: number): void {
  const O = w.A.OBJ, B = w.A.BAU, lead = w.fs[0];
  if (w.phase === 'walk' && !w.cfg.manual) {
    const sp = w.spots.find((s) => !s.done && lead.x >= s.x - 26 && s.x < w.cam + w.W);
    if (sp) { sp.done = true; w.appr = { sp, f: aliveF(w)[0] ?? lead, t: 0 }; w.phase = 'approach'; }
  }
  if (w.phase === 'approach' && w.appr) {
    // o lutador anda até ficar em cima do objeto; só então vasculha/abre (timeout de segurança 4 s)
    const a = w.appr, sp = a.sp, f = a.f, t = sprTarget(sp);
    a.t += dt;
    if ((Math.abs(f.x - t.x) < 3 && Math.abs(f.y - t.y) < 3) || a.t > 4 || f.down) {
      w.appr = null;
      if (sp.t === 'obj') {
        const tm = (O?.KINDS[sp.kind!]?.tempo || 1) * 1.4;
        w.phase = 'search'; w.phaseT = tm; sp.tm = tm; sp.state = 'vasculhando'; sp.anim = 0;
        w.log('Vasculhando: ' + (O?.KINDS[sp.kind!]?.nome ?? sp.kind));
      } else openChest(w, sp);
    }
  }
  if (w.phase === 'search') {
    w.phaseT -= dt;
    const sp = w.spots.find((s) => s.state === 'vasculhando');
    if (sp) sp.anim = (sp.anim ?? 0) + dt;
    if (w.phaseT <= 0) {
      if (sp) {
        sp.state = 'vasculhado';
        const L: string[] = O?.KINDS[sp.kind!]?.loot ?? ['sucata', 'comida', 'madeira'];
        const lootP = w.cfg.pet?.tipo === 'gato' ? 0.95 : 0.85;
        if (rnd() < lootP) addItem(w, L[Math.floor(rnd() * L.length)], 1, sp);
        else w.fx('tag', 'nada…', sp.x, sp.y - 60);
        if (rnd() < 0.12) { w.keys.comum = (w.keys.comum ?? 0) + 1; dropItem(w, 'chave', 1, sp.x, sp.y + 4, 1.4); }
      }
      w.phase = 'walk';
      if (sp) talvezEmboscada(w, sp);
    }
  }
  if (w.phase === 'chest') {
    w.phaseT -= dt;
    for (const s of w.spots) {
      if (s.state === 'abrindo') {
        s.anim = (s.anim ?? 0) + dt;
        if (s.anim > 1) {
          s.state = 'aberto';
          const L: string[] = B?.TIPOS?.[s.tipo!]?.loot ?? ['sucata', 'pecas'];
          addItem(w, L[Math.floor(rnd() * L.length)], 2, s);
          if (s.bonus) { addItem(w, L[Math.floor(rnd() * L.length)], 2, s); rollProjeto(w, s.tipo!); }
          rollProjeto(w, s.tipo!);
          rollArma(w, s.tipo!, s);
        }
      }
      if (s.state === 'trancado') s.anim = (s.anim ?? 0) + dt;
    }
    if (w.phaseT <= 0 && !w.pzOpen) w.phase = 'walk';
  }
}

// ---------------- fases ----------------
export function director(w: World, dt: number): void {
  w.A.GORE.update(dt);
  if (w.phase === 'warning') {
    w.phaseT -= dt;
    if (w.phaseT <= 0 && w.pendingWave) { const A = w.pendingWave; w.pendingWave = null; w.phase = 'fight'; spawnWave(w, A); }
    return;
  }
  if (w.phase === 'fight') {
    if (!aliveF(w).length) { w.phase = 'failed'; w.phaseT = 3.5; w.banner('EXPEDIÇÃO FALHOU', 3.5, 'fail'); w.log(`EXPEDIÇÃO FALHOU em ${curArena(w).area.short}`); return; }
    if (!aliveZ(w).length && w.zs.every((z) => corpseT(z) > 1.6)) {
      w.zs = []; w.proj = w.proj.filter((p) => p.kind === 'bullet'); w.warns = [];
      if (w.emb) { // emboscada limpa: segue a caminhada (não conta arena, sem cura de arena)
        w.emb = false; flushArenaLoot(w);
        for (const f of w.fs) {
          if (f.down) { f.down = false; f.downAnim = false; f.hold = false; f.hp = VMAX(w, f) * 0.3; w.log(`${f.m.nome} se levantou`); }
          f.state = 'idle'; setAnim(f, 'idle');
        }
        w.phase = 'walk'; w.log('Emboscada limpa → segue');
        return;
      }
      w.cleared++;
      // loot da arena + cura
      flushArenaLoot(w); // o loot já saiu dos corpos; aqui só o resto
      for (const f of w.fs) {
        if (f.down) { f.down = false; f.downAnim = false; f.hold = false; f.state = 'idle'; setAnim(f, 'idle'); f.hp = VMAX(w, f) * 0.3; w.log(`${f.m.nome} se levantou`); }
        else f.hp = Math.min(f.maxhp, f.hp + (4 + f.m.lv * 2) * w.cfg.bonus.cura);
      }
      if (w.ai >= w.arenas.length - 1) { // última arena sem chefe: conclui (senão o loot repetiria todo quadro)
        w.phase = 'victory'; w.phaseT = 6; w.banner('EXPEDIÇÃO CONCLUÍDA', 6); w.log('Rota limpa. EXPEDIÇÃO CONCLUÍDA!');
        return;
      }
      w.phase = 'go'; w.phaseT = 1.2; w.log('Arena limpa → GO');
    }
    return;
  }
  if (w.phase === 'failed' || w.phase === 'victory') {
    w.phaseT -= dt;
    if (w.phase === 'failed') w.fade = Math.min(0.6, (3.5 - w.phaseT) * 0.25);
    if (w.phaseT <= 0) w.phase = 'done';
    return;
  }
  if (w.phase === 'go') { w.phaseT -= dt; if (w.phaseT <= 0) { w.phase = 'walk'; w.fs.forEach((f) => { if (!f.down) f.state = 'idle'; }); } }
  else if (w.phase === 'walk') {
    const next = w.arenas[w.ai + 1].cam, lead = w.fs.find((f) => !f.down) ?? w.fs[0];
    if (w.cfg.manual) {
      // segue o líder nos dois sentidos, dentro do trecho já aberto, sem o arrasto de 150 px/s
      const floor = w.arenas[w.ai]?.cam ?? 0;
      const want = Math.min(next, Math.max(floor, lead.x - 120));
      const d = want - w.cam;
      w.cam += Math.abs(d) < 0.6 ? d : Math.sign(d) * Math.min(Math.abs(d), 640 * dt);
      if (w.cam > next) w.cam = next;
    } else {
      // câmera desliza (no máx. 150 px/s) até o líder/próxima arena — antes ela pulava direto pro líder
      // quando ele terminava a luta lá na direita, e parecia que o squad teleportava pra próxima região
      const want = Math.min(next, Math.max(w.cam, lead.x - 140)), d = want - w.cam;
      w.cam += Math.sign(d) * Math.min(Math.abs(d), 150 * dt);
      if (Math.abs(next - w.cam) < 0.5) w.cam = next;
    }
    if (w.cam >= next - 0.4) { w.cam = next; w.ai++; w.fs.forEach((f) => { f.state = 'guard'; }); startArena(w); }
  }
  updateSpots(w, dt);
}
