// Tela inicial (site que rola): logo + desfile animado, "feito pra quem não tem tempo", Lua de Sangue,
// mecânicas, bestiário e chamada final. Com Firebase, "Jogar" abre o login antes da criação ou do abrigo.
import './landing.css';
import type { Screen } from '../../core/router';
import { go } from '../../core/router';
import { startLoop, type Loop } from '../../core/loop';
import { settings } from '../../core/settings';
import { esc, h, makeCanvas } from '../../core/dom';
import { EXP, HUB, type Factory } from '../../art/legacy';
import { anchor } from '../../art/sprites';
import { hasGame, startNewGame, resetGame } from '../../game/state';
import { authExigida, temSessao } from '../../services/authEstado';
import { Warmer } from '../../expedition/warm';
import { frameStore } from '../../art/frameStore';
import { hubJobs } from '../hubWarm';
import { preloadModalCache, zombieIconURL, mapPreviewSrc, mapZombies } from '../shelter/mapSelect';
import { ZOMBIES, type ZombieId } from '../../data/zombies';
import { MAPS, type MapDef } from '../../data/maps';
import { RECRUITS, PETS } from '../../data/recruits';
import { STRUCTS } from '../../data/structures';
import { LEMBRANCAS } from '../../data/lembrancas';
import { msUntilBloodMoon, nextIsBloodMoon } from '../../game/bloodmoon';
import { serverNow, textoContagemLua } from '../../game/worldClock';

interface Cast { F: Factory; x: number; me: boolean; frame: (t: number) => HTMLCanvasElement }

const hsh = (n: number) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };
const R = (g: CanvasRenderingContext2D, x: number, y: number, w: number, hh: number, c: string) => { g.fillStyle = c; g.fillRect(x, y, w, hh); };

// Desfile em alta resolução (mesma escala da expedição) sobre o cenário novo do Marco Zero, em noite de Lua de Sangue.
const RS = 2.5, SK = 1.25, PW = 384, PH = 216, FLOOR = 196;

function buildCast(): Cast[] {
  const e = EXP(), a = HUB();
  const fi = (F: Factory, anim: string, t: number) => Math.floor(t * 8) % F.ANIMS[anim].n;
  const pick = (F: Factory, ...names: string[]) => names.find((n) => F.ANIMS[n]) ?? 'idle';
  const vg = pick(a.VIGIA, 'guard'), cp = pick(a.CAPO, 'guard', 'idle'), dg = pick(a.PET_CACHORRO, 'idle');
  return [
    { F: e.ERR, x: 40, me: false, frame: (t) => e.ERR.frame('enluarado', 'idle', fi(e.ERR, 'idle', t), 5) },
    { F: e.CUSP, x: 92, me: false, frame: (t) => e.CUSP.frame('plenilunar', 'idle', fi(e.CUSP, 'idle', t), 5) },
    { F: e.COR, x: 140, me: false, frame: (t) => e.COR.frame('comum', 'idle', fi(e.COR, 'idle', t), 5) },
    { F: a.VIGIA, x: 228, me: true, frame: (t) => a.VIGIA.frame('media', 'lunar', vg, fi(a.VIGIA, vg, t)) },
    { F: a.CAPO, x: 284, me: true, frame: (t) => a.CAPO.frame('media', cp, fi(a.CAPO, cp, t)) },
    { F: a.PET_CACHORRO, x: 330, me: true, frame: (t) => a.PET_CACHORRO.frame('caramelo', dg, fi(a.PET_CACHORRO, dg, t)) },
  ];
}

function drawParade(g: CanvasRenderingContext2D, cast: Cast[], t: number) {
  const MAP = EXP().MAP;
  g.setTransform(RS, 0, 0, RS, 0, 0);
  g.imageSmoothingEnabled = false;
  const A = MAP.AID?.marco, cam = (A ? A.x0 + 120 : 0) + ((t * 14) % 520); // Praça do Marco Zero, rolando devagar
  g.save(); g.translate(0, PH - 216); // recorta a faixa de baixo da cena (chão + fachadas)
  MAP.setLight?.('lua', true);
  const Q = settings.q;
  MAP.drawSky(g, 'lua', cam, Q.skyAnim ? t : 0);
  if (MAP.drawMid) MAP.drawMid(g, cam); else g.drawImage(MAP.mid, cam * (MAP.RS || 1), 0, PW * (MAP.RS || 1), 216 * (MAP.RS || 1), 0, 0, PW, 216);
  if (MAP.TINT?.lua) { g.fillStyle = MAP.TINT.lua; g.fillRect(0, 0, PW, 216); }
  if (MAP.drawLights && Q.glow) MAP.drawLights(g, cam, 'lua', t);
  for (const o of cast) {
    const cv = o.frame(t), { ax, gy } = anchor(o.F, cv);
    if (Q.shadows) { g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(o.x - 12, FLOOR - 1, 24, 3); }
    g.save(); g.translate(o.x, FLOOR); if (!o.me) g.scale(-1, 1);
    g.drawImage(cv, -ax / RS, -gy / RS, cv.width / RS, cv.height / RS); g.restore();
  }
  if (MAP.drawFG) MAP.drawFG(g, cam);
  g.restore();
}

/** onde fica cada mapa (rótulo do cartão da rota) */
const LOCAL: Record<string, string> = { marco_zero: 'Recife · PE', olinda: 'Olinda · PE', pelourinho: 'Salvador · BA', veropeso: 'Belém · PA', lapa: 'Rio de Janeiro · RJ', amazonia: 'Manaus · AM', pantanal: 'Mato Grosso · MT' };
const comArte = (k: ZombieId) => !!(ZOMBIES[k]?.art && (EXP() as any)[ZOMBIES[k].art!]);
/** mapas na ordem em que liberam (cada um pede o anterior) */
function rota(): MapDef[] {
  const all = Object.values(MAPS), out: MapDef[] = [];
  let cur = all.find((m) => !m.requer);
  while (cur && !out.includes(cur)) { out.push(cur); const id: string = cur.id; cur = all.find((m) => m.requer === id); }
  for (const m of all) if (!out.includes(m)) out.push(m);
  return out;
}
/** números do jogo, tirados dos dados (não desatualizam quando entra conteúdo) */
function numeros(): [number, string][] {
  const ms = Object.values(MAPS), zs = (Object.keys(ZOMBIES) as ZombieId[]).filter(comArte);
  return [
    [ms.length, 'mapas'], [ms.reduce((n, m) => n + m.areas, 0), 'áreas'], [zs.length, 'zumbis'],
    [zs.filter((k) => ZOMBIES[k].boss).length, 'chefes e mini bosses'], [Object.keys(RECRUITS).length, 'ofícios'], [Object.keys(PETS).length, 'pets'],
  ];
}
function mecs(): [string, string][] {
  const nm = Object.keys(MAPS).length, ne = Object.keys(STRUCTS).length;
  return [
    ['Abrigo', `Começa só com a fogueira. São ${ne} construções entre moradia, produção, oficina e defesa, cada uma com 5 níveis.`],
    ['Expedições automáticas', "O squad atravessa o mapa sozinho: arenas de beat 'em up, objetos pra vasculhar, baús com puzzle de 5 s, mini boss e chefe."],
    ['Plano de expedição', 'Você decide antes de sair: quando usar kit de cura, se gasta chave nos baús, quem aceitar no caminho, com quanta vida recuar e por quantas horas o loop roda.'],
    ['Recrutas com ofício', 'Serralheiro, pedreira, lenhador, catadora, agricultor, capoeirista, enfermeira e vigia: cada ofício dá um bônus pro abrigo ou pro squad.'],
    ['Pets', 'Cachorro, gato, capivara, jabuti, papagaio e sagui acompanham o squad: mais dano, mais loot, mais vida, mais chaves.'],
    ['Armas e forja', 'Bastão, pistola e laser em raridades até lunar. A Oficina evolui a força até ★5, e a forja lunar vai além.'],
    ['Golpes especiais', 'Cada membro libera e equipa golpes assinatura do ofício. O combo automático usa o que você deixou pronto.'],
    ['Fusão e notas', 'Recrutas repetidos se fundem e sobem de nota, de E até S. Quem não tem cama espera no Alojamento.'],
    ['Conquistas e lembranças', `Séries de conquistas com prêmio pra resgatar e ${LEMBRANCAS.length} lembranças escondidas nos ${nm} mapas, cada uma com um bônus pequeno pra sempre.`],
  ];
}
/** formas da Lua (combat.formFor + FMUL em expedition/world.ts) */
const FORMAS = [
  { id: 'comum', nome: 'Comum', pct: '30% na Lua', st: ['Vida normal', 'Dano normal'], txt: 'O de sempre. Fora da Lua de Sangue, é o único que aparece.' },
  { id: 'enluarado', nome: 'Enluarado', pct: '45% na Lua', st: ['Vida <b>×1,3</b>', 'Dano normal'], txt: 'Brilho prateado. Aguenta mais pancada e cada espécie ganha um extra: o Estalador ouve mais longe, o ritmo do Percussionista dura mais.' },
  { id: 'plenilunar', nome: 'Plenilunar', pct: '25% na Lua', st: ['Vida <b>×1,6</b>', 'Dano <b>×1,5</b>'], txt: 'Tom de brasa, o mais perigoso. O Cuspidor solta 3 cuspes, o escudo do Blindado aguenta 4 golpes e as redes e agarrões prendem por mais tempo.' },
];
/* ---------- desfile de zumbis passando pela rua (só o visual) ---------- */
const MW = 384, MH = 150, MFLOOR = 138;
interface Walker { k: ZombieId; F: Factory; form: string; frames: HTMLCanvasElement[]; w: number; x: number; t: number; v: number; dur: number }
/** fila dos que vão passar: comuns com forma sorteada da Lua; mini bosses e chefes de vez em quando */
function marchQueue(): { k: ZombieId; form: string }[] {
  const A = EXP() as any, forms = ['comum', 'enluarado', 'plenilunar'];
  const ks: ZombieId[] = [];
  for (const m of rota()) for (const k of mapZombies(m)) if (!ks.includes(k) && comArte(k) && A[ZOMBIES[k].art!]?.ANIMS?.walk) ks.push(k);
  return ks.map((k, i) => ({ k, form: ZOMBIES[k].boss ? 'normal' : forms[i % 3] }));
}
function drawStreet(g: CanvasRenderingContext2D, t: number): void {
  const gr = g.createLinearGradient(0, 0, 0, MH);
  gr.addColorStop(0, '#1a0610'); gr.addColorStop(0.55, '#3a0c18'); gr.addColorStop(0.56, '#2a1420'); gr.addColorStop(1, '#120810');
  g.fillStyle = gr; g.fillRect(0, 0, MW, MH);
  // lua e silhueta de casario ao fundo
  g.fillStyle = 'rgba(255,74,58,.18)'; g.beginPath(); g.arc(318, 30, 26, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#c4342a'; g.beginPath(); g.arc(318, 30, 14, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#22080f';
  for (let x = 0, i = 0; x < MW; i++) { const w = 18 + hsh(i * 3.1) * 30, h = 26 + hsh(i * 7.7) * 34; g.fillRect(x, 82 - h, w, h + 2); x += w + 2; }
  g.fillStyle = 'rgba(255,190,90,.5)';
  for (let i = 0; i < 26; i++) if (hsh(i * 9.3) > 0.55) g.fillRect(Math.floor(hsh(i * 5.1) * MW), 50 + Math.floor(hsh(i * 2.3) * 26), 2, 3);
  // calçada e paralelepípedos
  R(g, 0, 82, MW, 4, '#4a2430'); R(g, 0, 86, MW, 2, '#1a0810');
  for (let y = 92; y < MH; y += 8) for (let x = ((y / 8) % 2) * 7; x < MW; x += 14) R(g, x, y, 12, 6, y < 120 ? '#2e1620' : '#26121c');
  // névoa passando
  g.fillStyle = 'rgba(255,120,120,.05)';
  for (let i = 0; i < 4; i++) { const x = ((i * 130 - t * 9) % (MW + 160) + MW + 160) % (MW + 160) - 80; g.beginPath(); g.ellipse(x, 120 + i * 5, 90, 10, 0, 0, Math.PI * 2); g.fill(); }
}
function tickMoon(el: HTMLElement): void {
  const n = el.querySelector('#nextMoon'); if (!n) return;
  const pub = textoContagemLua(serverNow());
  if (pub) { n.innerHTML = pub; return; }
  if (nextIsBloodMoon()) { n.innerHTML = '<b>A Lua de Sangue está no céu agora.</b>'; return; }
  const m = Math.round(msUntilBloodMoon() / 60_000), hh = Math.floor(m / 60), mm = m % 60;
  n.innerHTML = `Próxima Lua de Sangue em <b>${hh ? hh + ' h ' : ''}${mm} min</b>.`;
}

export function landingScreen(): Screen {
  let loop: Loop | null = null;
  let root: HTMLElement;
  let moonT = 0, iconT = 0;

  function render() {
    loop?.stop(); loop = null;
    const saved = hasGame(), R7 = rota();
    const cta = (end = false) => `<div class="cta"><button class="btn big" type="button" data-play>${saved ? 'Continuar' : end ? 'Acender a fogueira' : 'Jogar agora'}</button>${saved && !end ? '<button class="reset" type="button" id="reset">Recomeçar do zero</button>' : ''}</div>`;
    root.innerHTML = '';
    // Landing em formato de site (rola); o jogo em tela cheia começa na criação do recruta.
    const el = h(`<section class="screen landing" aria-label="Início">
      <div class="wrap hero">
        <p class="eyebrow">Idle beat 'em up de zumbis · pixel art brasileira</p>
        <h1 class="logo">LUA DE SANGUE<small>Sobreviva ao Brasil</small></h1>
        <p class="pitch">O squad luta sozinho. <b>Você gerencia.</b> Monte o abrigo em volta da fogueira, mande recrutas em <b>expedições automáticas</b> do Recife Antigo ao Pantanal e prepare a defesa antes da próxima <b>Lua de Sangue</b>.</p>
        <ul class="chips" aria-label="Destaques">
          <li>Sessões de 2 a 5 min</li><li>Roda offline até 8 h</li><li>Decisão, não reflexo</li>
        </ul>
        ${cta()}
        <div class="parade" id="paradeBox"></div>
        <dl class="nums" aria-label="O jogo em números">${numeros().map(([n, l]) => `<div><dt>${l}</dt><dd>${n}</dd></div>`).join('')}</dl>
      </div>

      <section class="band busy" aria-labelledby="t-busy"><div class="wrap">
        <p class="kicker">Feito pra quem estuda ou trabalha</p>
        <h2 id="t-busy">Sem tempo pra jogar? Esse jogo foi feito pra isso.</h2>
        <p class="lead">Lua de Sangue é um jogo de <b>gerenciar</b>, não de apertar botão. As lutas acontecem sozinhas; o que conta são as suas escolhas: quem vai, o que levar, o que construir e quando arriscar. Dá pra jogar no intervalo da aula, no ônibus ou antes de dormir.</p>
        <ol class="day">
          <li><span class="when">Antes da aula ou do expediente</span><b class="dur">2 min</b><p>Monte o squad, escolha o mapa e o plano (usar chaves, kits de cura, recrutar no caminho) e ligue o <b>loop</b>.</p></li>
          <li><span class="when">No intervalo</span><b class="dur">1 min</b><p>Colete a horta e o coletor, gaste o loot em construções e mande a Oficina forjar armas.</p></li>
          <li><span class="when">À noite</span><b class="dur">5 min</b><p>Repare o que a horda quebrou, evolua golpes, funda recrutas repetidos e reforce a defesa pra próxima Lua.</p></li>
        </ol>
        <div class="offline"><b>Fechou o jogo?</b> O loop segue resolvendo expedições por até 8 h (rendendo 60% do online) e, quando você volta, um relatório mostra tudo o que aconteceu.</div>
      </div></section>

      <section class="band dark" aria-labelledby="t-rota"><div class="wrap">
        <p class="kicker">A rota</p>
        <h2 id="t-rota">${R7.length} mapas, do cais do Recife ao rio Cuiabá.</h2>
        <p class="lead">Cada mapa libera o seguinte e leva uns <b>3 dias</b> pra vencer. Todos têm cenário, clima e zumbis próprios, um mini boss no meio do caminho e um chefe no fim. Nos dois últimos a cidade acaba, e <b>os bichos também voltaram</b>.</p>
        <ol class="rota">
          ${R7.map((m, i) => { const zs = mapZombies(m).filter(comArte), cm = zs.filter((k) => !ZOMBIES[k].boss);
            const bs = [...cm.filter((k) => ZOMBIES[k].mapa === m.id), ...cm.filter((k) => ZOMBIES[k].mapa !== m.id)].slice(0, 3), mais = zs.length - bs.length;
            return `<li class="mp"><div class="mp-img"><img ${mapPreviewSrc(m)} alt="Cenário de ${esc(m.nome)}" width="480" height="270"><span class="mp-n">${i + 1}</span></div>
            <div class="mp-b"><h3>${esc(m.nome)}</h3><p class="mp-l">${LOCAL[m.id] ?? ''}</p>
            <p class="mp-s">${m.areas} áreas</p>
            <ul class="mp-z">${bs.map((k) => `<li><img data-z="${k}" data-px="72" alt="${esc(ZOMBIES[k].nome)}" title="${esc(ZOMBIES[k].nome)}" width="56" height="56"></li>`).join('')}${mais > 0 ? `<li class="mp-more">+${mais} zumbis</li>` : ''}</ul></div></li>`; }).join('')}
        </ol>
      </div></section>

      <section class="band moon" aria-labelledby="t-moon"><div class="wrap moon-grid">
        <div class="moon-art" aria-hidden="true"><div class="moon-disc"></div></div>
        <div>
          <p class="kicker red">O que é a Lua de Sangue</p>
          <h2 id="t-moon">Duas vezes por dia, a lua fica vermelha.</h2>
          <p class="lead">Desde a primeira Lua de Sangue, os mortos do Brasil não ficam mais no chão. Ela volta <b>todo dia às 9h e às 21h</b> (horário de Brasília) e fica 30 minutos no céu. Nessa hora a horda vem atrás da luz da sua fogueira, <b>esteja você online ou não</b>.</p>
          <ul class="rules">
            <li><b>Defesa × Horda.</b> Muralha, portão, barricada e posto de guarda somam a defesa do abrigo. Se a horda for mais forte, ela entra.</li>
            <li><b>Invasão custa caro.</b> Estruturas danificadas param de produzir até você reparar, e a horda rouba recursos do estoque.</li>
            <li><b>Expedição sob a Lua.</b> Sair na janela vermelha traz zumbis <b>enluarados</b> e <b>plenilunares</b> (veja abaixo), mais fortes, e o loot vem maior.</li>
          </ul>
          <p class="next" id="nextMoon"></p>
        </div>
      </div>
      <div class="wrap forms">
        <h3 class="forms-t">As três formas da Lua</h3>
        <p class="lead">Fora da Lua, todo zumbi comum é <b>comum</b>. Na janela vermelha, cada um que aparece sorteia uma forma, e o mesmo Errante pode vir de três jeitos:</p>
        <div class="fgrid">
          ${FORMAS.map((f) => `<article class="fc ${f.id}"><div class="fi"><img data-z="errante" data-f="${f.id}" alt="Errante ${esc(f.nome)}" width="120" height="120"></div>
            <div class="fh"><h4>${f.nome}</h4><span class="pct">${f.pct}</span></div>
            <ul class="fst">${f.st.map((x) => `<li>${x}</li>`).join('')}</ul><p>${f.txt}</p></article>`).join('')}
        </div>
        <p class="fnote">Cada forma derrotada vira uma carta no <b>Bestiário</b>, então completar a coleção pede caçar na Lua. Mini bosses e chefes não sorteiam forma: abaixo de metade da vida entram em <b>Fúria</b>, mais rápidos e mais fortes.</p>
      </div></section>

      <section class="band" aria-labelledby="t-mec"><div class="wrap">
        <p class="kicker">Mecânicas</p>
        <h2 id="t-mec">Tudo gira em volta da fogueira.</h2>
        <div class="mecs">
          ${mecs().map(([t, d]) => `<article class="mec"><h3>${t}</h3><p>${d}</p></article>`).join('')}
        </div>
      </div></section>

      <section class="band dark" aria-labelledby="t-zs"><div class="wrap">
        <p class="kicker" id="t-zs">Quem vem pela rua</p>
        <div class="march" id="marchBox"></div>
      </div></section>

      <section class="band final"><div class="wrap">
        <h2>A fogueira está apagada.</h2>
        <p class="lead">Crie seu recruta, acenda o fogo e veja quanto tempo o seu abrigo aguenta.</p>
        ${cta(true)}
      </div></section>
    </section>`);
    const [cv, g] = makeCanvas(PW * RS, PH * RS);
    // escala de alta resolução + cenário do Marco Zero construído uma vez
    EXP().PIX.setK(SK); HUB().PIX.setK(SK);
    { const MAP = EXP().MAP; if (!MAP._built) { MAP.build(); MAP._built = true; } }
    cv.className = 'pix'; cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', 'Recrutas e zumbis em pixel art');
    el.querySelector('#paradeBox')!.appendChild(cv);
    root.appendChild(el);
    tickMoon(el);
    clearInterval(moonT); moonT = window.setInterval(() => tickMoon(el), 30_000);
    // ícones do bestiário: do cache do disco se houver; senão gera 1 por vez no tempo livre (não engasga o desfile)
    const imgs = [...el.querySelectorAll<HTMLImageElement>('img[data-z]')];
    const fill = () => {
      const im = imgs.shift(); if (!im || !root.contains(el)) return;
      const k = im.dataset.z as ZombieId;
      im.src = zombieIconURL(k, false, Number(im.dataset.px ?? 120), im.dataset.f ?? (ZOMBIES[k].boss ? 'normal' : 'comum')); im.classList.add('on');
      iconT = window.setTimeout(fill, 40);
    };
    clearTimeout(iconT);
    void preloadModalCache().finally(() => { iconT = window.setTimeout(fill, 300); });

    el.querySelectorAll('[data-play]').forEach((b) => b.addEventListener('click', () => {
      if (authExigida() && !temSessao()) { go('login'); return; }
      if (hasGame()) go('shelter', { intro: 'chegada' });
      else { startNewGame(); go('create'); }
    }));
    el.querySelector('#reset')?.addEventListener('click', async () => {
      if (!confirm('Apagar o save e recomeçar do zero?')) return;
      await resetGame();
      render();
    });

    const cast = buildCast();
    // desfile de zumbis: os quadros de andar são gerados 1 por vez no tempo livre; cada zumbi só entra quando está pronto
    const [mcv, mg] = makeCanvas(MW * RS, MH * RS);
    mcv.className = 'pix'; mcv.setAttribute('role', 'img'); mcv.setAttribute('aria-label', 'Zumbis do jogo passando pela rua');
    el.querySelector('#marchBox')?.appendChild(mcv);
    const queue = marchQueue(), ready: Walker[] = [], walkers: Walker[] = [];
    let gen: Walker | null = null, qi = 0, nextIdx = 0;
    const genStep = () => { // gera 1 quadro do próximo zumbi da fila
      if (!gen) { if (qi >= queue.length) return false; const q = queue[qi++], F = (EXP() as any)[ZOMBIES[q.k].art!] as Factory; if (!F?.ANIMS?.walk) return true;
        gen = { k: q.k, F, form: q.form, frames: [], w: 0, x: 0, t: 0, v: ZOMBIES[q.k].boss ? 24 : 32, dur: (F.ANIMS.walk.dur?.(0) ?? 130) / 1000 }; }
      const fi = gen.frames.length;
      gen.frames.push(gen.F.frame(gen.form, 'walk', fi, 5));
      if (gen.frames.length >= gen.F.ANIMS.walk.n) { gen.w = gen.frames[0].width / RS; ready.push(gen); gen = null; }
      return true;
    };
    const drawMarch = (dt: number, t: number) => {
      mg.setTransform(RS, 0, 0, RS, 0, 0); mg.imageSmoothingEnabled = false;
      drawStreet(mg, t);
      // entra o próximo quando o último já abriu espaço
      const last = walkers[walkers.length - 1];
      if (ready.length && (!last || last.x < MW - last.w * 0.35 - 8)) { const base = ready[nextIdx++ % ready.length]; walkers.push({ ...base, x: MW + base.w * 0.5, t: 0 }); }
      for (const z of walkers) {
        z.x -= z.v * dt; z.t += dt;
        const cv = z.frames[Math.floor(z.t / z.dur) % z.frames.length], { ax, gy } = anchor(z.F, cv);
        if (settings.q.shadows) { mg.fillStyle = 'rgba(0,0,0,.45)'; mg.fillRect(z.x - 12, MFLOOR - 1, 24, 3); }
        mg.save(); mg.translate(z.x, MFLOOR); mg.scale(-1, 1); mg.drawImage(cv, -ax / RS, -gy / RS, cv.width / RS, cv.height / RS); mg.restore();
      }
      while (walkers.length && walkers[0].x < -walkers[0].w * 0.6) walkers.shift();
      const vg = mg.createLinearGradient(0, 0, MW, 0); vg.addColorStop(0, 'rgba(12,7,22,.9)'); vg.addColorStop(0.08, 'rgba(12,7,22,0)'); vg.addColorStop(0.92, 'rgba(12,7,22,0)'); vg.addColorStop(1, 'rgba(12,7,22,.9)');
      mg.fillStyle = vg; mg.fillRect(0, 0, MW, MH);
    };
    // tempo livre: prepara a próxima tela (criação/abrigo) e os ícones dos modais; só o que cabe no quadro (meta 30 fps)
    const warm = new Warmer();
    warm.add(hubJobs());
    let bank = 0, last = 0;
    // 1º quadro depois de trazer do disco (cache persistente) os quadros do desfile — senão ele engasga gerando
    const castCalls = cast.flatMap((o) => Array.from({ length: 16 }, (_, i) => () => { o.frame(i / 8); }));
    const begin = () => { if (loop || !root.contains(el)) return; loop = startLoop((_dt, t) => {
      const t0 = performance.now();
      drawParade(g, cast, t);
      drawMarch(Math.min(0.05, _dt), t);
      const dt = last ? t0 - last : 16; last = t0;
      bank = Math.max(-100, Math.min(150, bank + 30 - dt));
      if (performance.now() - t0 < 14) genStep(); // desfile de zumbis antes do aquecimento das próximas telas
      else if (warm.pending && bank > 0) bank -= warm.run(Math.max(0, Math.min(bank, 31 - (performance.now() - t0))));
    }); };
    if (frameStore.on) void Promise.race([frameStore.hydrate(castCalls), new Promise((r) => setTimeout(r, 600))]).then(begin, begin);
    else begin();
  }

  return {
    mount(r) { root = r; render(); },
    unmount() { loop?.stop(); loop = null; clearInterval(moonT); clearTimeout(iconT); },
  };
}
