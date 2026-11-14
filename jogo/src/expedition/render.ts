// Render da expedição: céu, cenário em camadas, poças/avisos, entidades ordenadas por y, projéteis, feixes, partículas.
import { makeCanvas } from '../core/dom';
import { anchor, petArt, type ActorArt } from '../art/sprites';
import { withHubK } from '../art/legacy';
import { fighterFrame, fAnim } from './fighter';
import { settings } from '../core/settings';
import { drawGolpes } from './golpes';
import { frameStore } from '../art/frameStore';
import { KS, LOOP, RS, SK, animFrac, corpseT, spawnFx, type Fighter, type Pickup, type Vfx, type World, type Zombie } from './world';

const TINT: Record<string, string | null> = { manha: null, tarde: 'rgba(255,184,96,.08)', anoitecer: 'rgba(110,30,90,.3)', noite: 'rgba(16,12,58,.56)', lua: 'rgba(78,6,20,.5)' };
const CTINT: Record<string, string | null> = { manha: 'rgba(255,206,214,.04)', tarde: 'rgba(255,190,100,.06)', anoitecer: 'rgba(120,30,90,.12)', noite: 'rgba(16,12,58,.22)', lua: 'rgba(78,6,20,.18)' };
/** postes e janelas só acendem no escuro (anoitecer, noite e Lua de Sangue) */
const DARK: Record<string, number> = { manha: 0, tarde: 0, anoitecer: 0.6, noite: 1, lua: 1 };

export interface Renderer { draw(dt: number): void; zFrame(z: Zombie): any }

export function makeRenderer(w: World, g: CanvasRenderingContext2D): Renderer {
  // camadas em alta resolução (RS×); todo o desenho usa unidades lógicas via transform
  const [bgCv, BG] = makeCanvas(w.W * RS, w.H * RS), [chCv, CH] = makeCanvas(w.W * RS, w.H * RS), [fgCv, FG] = makeCanvas(w.W * RS, w.H * RS);
  const LG = (c: CanvasRenderingContext2D) => c.setTransform(RS, 0, 0, RS, 0, 0);
  /** escala de geração de um frame de zumbi (factories antigas "assam" a própria escala em KB) */
  const zs = (z: Zombie) => (z.K.F.KB ?? SK) / RS;
  const T = w.A.TWEEN, MAP = w.MAP, GORE = w.A.GORE;
  let pet: { art: ActorArt; x: number; y: number; fi: number; acc: number; face: 1 | -1; anim?: string } | null = null;
  if (w.cfg.pet) pet = { art: petArt(w.cfg.pet.tipo, w.cfg.pet.variante), x: w.cam + 60, y: 196, fi: 0, acc: 0, face: 1 };
  /** lista de desenho reaproveitada (sem fechar uma função nova por zumbi a cada quadro) */
  const slots: { y: number; x: number; w0: number; z: number; k: number; i: number }[] = [];
  const gv: Vfx[] = [], av: Vfx[] = [];
  let nearF: Fighter = w.fs[0];
  const compact = <T,>(a: T[], ok: (t: T) => boolean) => { let j = 0; for (let i = 0; i < a.length; i++) if (ok(a[i])) a[j++] = a[i]; a.length = j; };

  function zFrame(z: Zombie) {
    // zumbis: 2 sub-quadros de tween (metade do custo de geração; diferença visual mínima)
    // Desempenho: só as poses-chave (sem sub-quadro) — metade dos quadros a gerar
    const F = z.K.F, fr = settings.q.tween ? Math.floor(animFrac(z, F.ANIMS[z.anim]) * 2) / 2 : 0, loop = !!LOOP[z.anim];
    const FP = F.framePose;
    // forma da arte: sufixo pedido pela IA ('<forma>~<sfx>'), ex.: açaizeiro com paneiro quebrado = '~vazio', seresteiro sem violão / garçom sem bandeja = '~sem'
    const zx = z as Zombie & { broken?: boolean; formSfx?: string };
    const fm = zx.formSfx ? z.form + '~' + zx.formSfx : zx.broken && z.kind === 'acaizeiro' ? z.form + '~vazio' : z.form;
    const gen = FP && F.ANIMS[z.anim]
      ? () => FP.call(F,fm, z.anim, T.poseAt(F, z.anim, z.fi, fr, loop), z.anim + z.fi + '.' + fr)
      : () => F.frame(fm, z.anim, z.fi, 5);
    // quadro salvo no disco (cache persistente) que ainda não chegou: segura o anterior um instante em vez de gerar
    const zz = z as Zombie & { _cv?: any };
    const pk = frameStore.peek(gen);
    if (pk && pk !== 'wait') return (zz._cv = pk.v);
    if (pk === 'wait' && zz._cv) return zz._cv;
    return (zz._cv = gen());
  }

  function drawApart(c: CanvasRenderingContext2D, e: Zombie, cv: any, ax: number, G: number, sx: number, alpha: number) {
    const t = Math.min(0.9, e.deadT), dir = e.deathDir || 1, h = cv.height / RS, bands = [[0, 0.36], [0.36, 0.68], [0.68, 1]], vel = [[38, 110], [16, 60], [4, 0]];
    bands.forEach((b, i) => {
      const y0 = Math.round(h * b[0]), hh = Math.max(1, Math.round(h * (b[1] - b[0])));
      const dx = vel[i][0] * dir * t, dz = Math.max(-(G - (y0 + hh)), vel[i][1] * t - 260 * t * t), rot = i === 2 ? 0 : (i === 0 ? 2.2 : 1) * t * dir;
      c.save(); c.globalAlpha = alpha; c.translate(sx + dx, Math.round(e.y - dz)); c.rotate(rot); if (e.face < 0) c.scale(-1, 1);
      c.drawImage(cv, 0, y0 * RS, cv.width, hh * RS, -ax, -G + y0, cv.width / RS, hh); c.restore();
    });
  }

  function drawZombie(c: CanvasRenderingContext2D, e: Zombie, dt: number) {
    const cv = zFrame(e), ax = e.K.ax * zs(e), G = e.K.G * zs(e), sx = Math.round(e.x - w.cam);
    let alpha = 1, ang = 0, ox = 0, sxs = 1, sys = 1;
    const oy = -(e.z || 0), prone = e.kind === 'rastejante';
    if (e.dead) { const ct = corpseT(e); alpha = ct < 1 ? 1 : Math.max(0, 1 - (ct - 1) / 0.6); if (alpha <= 0) return; }
    const near = nearF;
    if (e.react) {
      e.react.t += dt;
      const p = Math.min(1, e.react.t / e.react.dur), s = Math.sin(p * Math.PI), dir = Math.sign(e.x - near.x) || 1;
      if (e.react.k === 'back') { ang = -0.34 * s * e.face; ox = Math.round(dir * 4 * s); }
      else if (e.react.k === 'gut') { ang = 0.3 * s * e.face; sys = 1 - 0.1 * s; sxs = 1 + 0.06 * s; }
      else if (e.react.k === 'spin') sxs = Math.cos(p * Math.PI * 2) || 0.01;
      else { ang = -0.1 * s * e.face; ox = Math.round(dir * 2 * s); }
      if (p >= 1) e.react = null;
    }
    if (e.air) ang = e.air.thrown ? -e.face * e.air.spin * 11 : -e.face * Math.min(e.anim === 'tumble' ? 1 : 1.5, e.air.spin * 3.4); // arremessado gira; lançado tomba
    const animated = e.anim === 'fall' || e.anim === 'getup';
    if (e.down && !animated) { const t = e.down.t, r = t < 0.28 ? T.ease(t / 0.28) : t < 1.1 ? 1 : Math.max(0, 1 - T.ease((t - 1.1) / 0.45)); ang = r * (prone ? 0.25 : Math.PI / 2) * -e.face; }
    else if (e.dead && e.anim === 'death') { /* morte animada pela arte */ }
    else if (e.dead && !e.boss && e.kind !== 'barrigudo') {
      const r = T.ease(Math.min(1, e.deadT / 0.32)), dk = e.deathK || 'back';
      if (dk === 'apart') { drawApart(c, e, cv, ax, G, sx, alpha); return; }
      ang = r * (prone ? 0.25 : Math.PI / 2) * (dk === 'face' ? e.face : -e.face);
    }
    const draw = (comp: GlobalCompositeOperation | null, a: number) => {
      c.save(); if (comp) c.globalCompositeOperation = comp; c.globalAlpha = a; c.translate(sx + ox, Math.round(e.y + oy));
      if (ang) c.rotate(ang); if (sxs !== 1 || sys !== 1) c.scale(sxs, sys); if (e.face < 0) c.scale(-1, 1);
      c.drawImage(cv, -ax, -G, cv.width / RS, cv.height / RS); c.restore();
    };
    draw(null, alpha);
    if (e.flash > 0) { e.flash -= 0.016; draw('lighter', 0.7); }
  }

  function drawFighter(c: CanvasRenderingContext2D, f: Fighter) {
    const fr0 = fighterFrame(w, f), cv = fr0.cv, ax = fr0.ax / RS, G = fr0.G / RS, sx = Math.round(f.x - w.cam), A = fAnim(w, f), fr = animFrac(f, A);
    let ang = 0, sxs = 1, sys = 1;
    if (A) { // pulo (z), achatar/esticar e giro vindos da anim — qualquer rig (moveset: chute voador, mergulho, juggle...)
      if (A.squash) { sys = T.track(A.squash, f.fi, fr, 1); sxs = 1 + (1 - sys) * 0.7; }
      if (A.spin) ang = T.track(A.spin, f.fi, fr, 0) * Math.PI / 180 * f.face;
      f.z = A.z ? T.track(A.z, f.fi, fr, 0) : 0;
    }
    if (f.down && !f.downAnim) { f.downT = Math.min(1, (f.downT || 0) + 0.04); ang = -f.face * Math.PI / 2 * T.ease(f.downT); }
    c.save(); c.translate(sx, Math.round(f.y - (f.z || 0))); if (ang) c.rotate(ang); if (sxs !== 1 || sys !== 1) c.scale(sxs, sys); if (f.face < 0) c.scale(-1, 1);
    if (f.state === 'charge') { c.globalAlpha = 1; }
    c.drawImage(cv, -ax, -G, cv.width / RS, cv.height / RS); c.restore();
    // nome + vida em cima de cada lutador
    const top = Math.round(f.y - 118 * KS - 4); // ~altura de um personagem comum (108 un.) + folga
    c.fillStyle = '#000'; c.fillRect(sx - 12, top, 24, 4);
    c.fillStyle = f.slot ? '#3ed4ff' : '#6fdc7a'; c.fillRect(sx - 11, top + 1, Math.max(0, Math.round(22 * f.hp / f.maxhp)), 2);
  }

  function drawSpots(c: CanvasRenderingContext2D) {
    const O = w.A.OBJ, B = w.A.BAU;
    for (const sp of w.spots) {
      const sx = Math.round(sp.x - w.cam);
      if (sx < -80 || sx > w.W + 80) continue;
      let cv: any = null, an: any = null;
      try {
        if (sp.t === 'obj' && O) { cv = O.frame(sp.kind, sp.state, Math.floor((sp.anim || 0) * 8) % 4, 5); an = O.ANCHOR(sp.kind); }
        if (sp.t === 'bau' && B) {
          const f = sp.state === 'abrindo' ? Math.min(4, Math.floor((sp.anim || 0) * 5)) : sp.state === 'trancado' ? ((sp.anim || 0) < 0.6 ? Math.floor((sp.anim || 0) * 10) % 3 : 0) : 0;
          cv = B.frame(sp.tipo, sp.state, f, 5); an = B.ANCHOR(sp.tipo);
        }
      } catch { cv = null; }
      if (cv) c.drawImage(cv, sx - (an ? an.ax : cv.width / 2) / RS, sp.y - (an ? an.gy : cv.height) / RS, cv.width / RS, cv.height / RS);
      if (sp.state === 'vasculhando' && sp.tm) {
        const pr = Math.min(1, (sp.anim || 0) / sp.tm), top = Math.round(sp.y - 52);
        c.strokeStyle = '#170b1c'; c.lineWidth = 3; c.beginPath(); c.arc(sx, top, 6, 0, Math.PI * 2); c.stroke();
        c.strokeStyle = '#3ed4ff'; c.lineWidth = 2; c.beginPath(); c.arc(sx, top, 6, -Math.PI / 2, -Math.PI / 2 + pr * Math.PI * 2); c.stroke();
      }
      if (!sp.done && w.phase !== 'fight') { c.fillStyle = sp.t === 'bau' ? '#ffd23f' : '#3ed4ff'; c.fillRect(sx - 1, sp.y - 34 + Math.round(Math.sin(w.clock * 5) * 2), 3, 6); }
    }
  }

  const petFrame = (art: ActorArt, an: string, fi: number) => withHubK(SK, () => art.frame(an, fi));
  const ITEMS = w.A.ITEMS;
  const FX = (w.A as any).FX;
  /** Desenha um quadro da arte FX em (x, y) lógicos já relativos à câmera; opções e espelhamento. */
  function fxAt(c: CanvasRenderingContext2D, kind: string, fi: number, x: number, y: number, face = 1, opts?: any, alpha = 1, add = false) {
    if (!FX) return false;
    const n = FX.N[kind] || 1, cv = FX.frame(kind, Math.max(0, Math.min(n - 1, fi)), opts), a = FX.ANCHOR(kind, opts);
    c.save(); if (add) c.globalCompositeOperation = 'lighter'; c.globalAlpha = alpha;
    c.translate(x, y); if (face < 0) c.scale(-1, 1);
    c.drawImage(cv, -a.ax / RS, -a.ay / RS, cv.width / RS, cv.height / RS); c.restore();
    return true;
  }
  function drawVfx(c: CanvasRenderingContext2D, list: Vfx[], cam: number, dt: number) {
    const minor = !settings.q.vfx2; // Desempenho/Equilibrado: poeira não aparece
    for (const v of list) { v.t += dt; const fi = Math.floor(v.t * v.fps); if (minor && (v.kind === 'dust' || v.kind === 'dustRun')) continue; if (FX && fi < (FX.N[v.kind] || 1)) fxAt(c, v.kind, fi, v.x - cam, v.y, v.face, v.opts, 1, v.add); }
  }
  let runDust = 0, wxT = 0;
  function drawItem(c: CanvasRenderingContext2D, it: Pickup, cam: number) {
    const bob = it.state === 'rest' ? Math.sin(it.t * 9) * 1.2 : 0, x = it.x - cam, y = it.y - it.z - bob;
    if (ITEMS) {
      const cv = ITEMS.frame(it.id, Math.floor(it.fi) % ITEMS.N, 5), a = ITEMS.ANCHOR(it.id);
      c.drawImage(cv, Math.round((x - a.ax / RS) * RS) / RS, Math.round((y - a.gy / RS) * RS) / RS, cv.width / RS, cv.height / RS);
    } else { c.fillStyle = '#170b1c'; c.fillRect(Math.round(x) - 4, Math.round(y) - 8, 8, 8); c.fillStyle = '#ffd23f'; c.fillRect(Math.round(x) - 3, Math.round(y) - 7, 6, 6); }
  }
  function updatePet(dt: number) {
    if (!pet) return;
    const lead = w.fs.find((f) => !f.down) ?? w.fs[0];
    const tx = lead.x - lead.face * 26, dx = tx - pet.x;
    const moving = Math.abs(dx) > 6;
    if (moving) { pet.x += Math.sign(dx) * Math.min(Math.abs(dx), (Math.abs(dx) > 60 ? 90 : 50) * dt); pet.face = dx > 0 ? 1 : -1; }
    pet.y += (Math.min(206, lead.y + 14) - pet.y) * Math.min(1, dt * 2);
    const an = moving ? (pet.art.has('walk') ? 'walk' : pet.art.has('fly') ? 'fly' : 'idle') : 'idle';
    const A = pet.art.F.ANIMS[an];
    pet.acc += dt * 1000;
    if (A) { let d = A.dur(pet.fi % A.n); while (pet.acc >= d) { pet.acc -= d; pet.fi++; d = A.dur(pet.fi % A.n); } }
    pet.anim = an;
  }

  return {
    zFrame,
    draw(dt: number) {
      const cam = Math.round(w.cam), shk = w.shake > 0 ? Math.round((Math.random() - 0.5) * 6) : 0;
      const MRS = MAP.RS || 1; // cenário pode vir em resolução própria
      LG(g); LG(BG); LG(CH); LG(FG);
      const Q = settings.q; // preset gráfico (só enfeite: clima, sangue, brilho, poeira, sombras, céu animado)
      MAP.drawSky(g, w.mode, cam, Q.skyAnim ? w.clock : 0);
      const rnow = performance.now() / 1000, rdt = Math.min(0.1, rnow - (wxT || rnow)); wxT = rnow; // clima anda em tempo real (não acelera no 8×)
      if (w.wx) { w.wx.update(rdt); if (Q.clima) w.wx.sky(g, cam, rnow); } // update sempre: raio/clima mexem no jogo
      BG.clearRect(0, 0, w.W, w.H);
      if (MAP.drawMid) MAP.drawMid(BG, cam); // cenário em blocos (mundo largo demais pra um canvas só)
      else BG.drawImage(MAP.mid, cam * MRS, 0, w.W * MRS, w.H * MRS, 0, 0, w.W, w.H);
      if (Q.gore >= 2) GORE.drawWall(BG, cam, w.W);
      if (Q.gore >= 1) GORE.drawGround(BG, cam, w.W);
      const TN: Record<string, string | null> = MAP.TINT ?? TINT; // o cenário novo já vem com a noite pintada
      if (TN[w.mode]) { BG.globalCompositeOperation = 'source-atop'; BG.fillStyle = TN[w.mode]!; BG.fillRect(0, 0, w.W, w.H); BG.globalCompositeOperation = 'source-over'; }
      if (w.wx && Q.clima >= 2) w.wx.ground(BG, cam, rnow); // chão molhado, poças com reflexo e respingos (antes dos personagens)
      g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(bgCv, shk * RS, 0); LG(g);
      g.save(); g.globalCompositeOperation = 'lighter';
      if (Q.glow && (DARK[w.mode] ?? 1)) for (const win of MAP.WINDOWS) { const x = win.x - cam + shk; if (x < -20 || x > w.W + 20 || !win.lit) continue; g.fillStyle = w.mode === 'lua' ? 'rgba(255,90,60,.55)' : 'rgba(255,214,120,.55)'; g.fillRect(x, win.y, win.w, win.h); }
      g.restore();
      if (MAP.drawLights && Q.glow) MAP.drawLights(g, cam, w.mode, w.clock); // halos aditivos de postes, lâmpadas e neon

      CH.clearRect(0, 0, w.W, w.H);
      const TR = MAP.AID?.travessia;
      if (TR && cam + w.W / 2 > TR.x0 - 40 && cam + w.W / 2 < TR.x1 + 40) {
        const bx = 40, by = 196, bob = Math.round(Math.sin(w.clock * 2) * 1.5);
        CH.fillStyle = '#170b1c'; CH.fillRect(bx - 1, by - 22 + bob, 306, 34); CH.fillStyle = '#c89a6a'; CH.fillRect(bx, by - 21 + bob, 304, 10);
        CH.fillStyle = '#3a8ae8'; CH.fillRect(bx + 4, by - 11 + bob, 296, 20); CH.fillStyle = '#f2f2f2'; CH.fillRect(bx + 4, by + 6 + bob, 296, 3);
      }
      for (const p of w.pools) {
        const a = Math.max(0, 1 - p.t / 3.2), x = Math.round(p.x - cam);
        if (!fxAt(CH, 'acidSplash', Math.floor(p.t * 12), p.x - cam, p.y, 1, { cor: p.c }, a)) { CH.globalAlpha = a; CH.fillStyle = '#170b1c'; CH.fillRect(x - 17, p.y - 1, 34, 4); CH.fillStyle = p.c; CH.fillRect(x - 16, p.y - 1, 32, 3); CH.globalAlpha = 1; }
        if (Q.vfx2 && Math.random() < 0.2) w.sparks.push({ x: p.x + (Math.random() - 0.5) * 26, y: p.y - 1, vx: 0, vy: -12, t: 0.3, c: p.c });
      }
      for (const t of w.warns) {
        const pulse = 0.35 + 0.25 * Math.sin(w.clock * 18);
        const wf = Math.floor(w.clock * 12);
        if (FX && t.kind === 'circle') { fxAt(CH, 'warnCircle', wf % 4, t.x! - cam, t.y, 1, { r: t.r! * RS / SK }); continue; }
        if (FX && t.kind === 'lane') { const x0 = Math.min(t.x0!, t.x1!) - cam, x1 = Math.max(t.x0!, t.x1!) - cam; fxAt(CH, 'warnLane', wf % 4, x0, t.y, 1, { w: (x1 - x0) * RS / SK }); continue; }
        if (t.kind === 'circle') { CH.strokeStyle = (t.c || 'rgba(255,40,60,') + (0.5 + pulse) + ')'; CH.fillStyle = (t.c || 'rgba(255,40,60,') + pulse * 0.45 + ')'; CH.beginPath(); CH.ellipse(Math.round(t.x! - cam), t.y, t.r!, t.r! * 0.4, 0, 0, Math.PI * 2); CH.fill(); CH.stroke(); }
        if (t.kind === 'lane') { const x0 = Math.min(t.x0!, t.x1!) - cam, x1 = Math.max(t.x0!, t.x1!) - cam; CH.fillStyle = 'rgba(255,40,60,' + pulse * 0.5 + ')'; CH.fillRect(Math.round(x0), t.y - 6, Math.round(x1 - x0), 12); CH.fillStyle = 'rgba(255,90,90,' + (0.5 + pulse) + ')'; CH.fillRect(Math.round(x0), t.y - 6, Math.round(x1 - x0), 1); CH.fillRect(Math.round(x0), t.y + 5, Math.round(x1 - x0), 1); }
      }
      drawSpots(CH);
      gv.length = 0; av.length = 0;
      for (let i = 0; i < w.vfx.length; i++) { const v = w.vfx[i]; if (v.ground) gv.push(v); else av.push(v); }
      drawVfx(CH, gv, cam, dt);
      runDust += dt;
      if (runDust > 0.16 && Q.vfx2) { runDust = 0; for (const f of w.fs) if (!f.down && (f.anim === 'run' || f.anim === 'dash')) spawnFx(w, 'dustRun', f.x - f.face * 4, f.y, f.face); }
      updatePet(dt);
      nearF = w.fs.find((f) => !f.down) ?? w.fs[0];
      const vis = (x: number) => x > cam - 56 && x < cam + w.W + 56;
      let n = 0;
      const put = (y: number, x: number, w0: number, z: number, k: number, i: number) => {
        const s = slots[n] ?? (slots[n] = { y, x, w0, z, k, i });
        s.y = y; s.x = x; s.w0 = w0; s.z = z; s.k = k; s.i = i; n++;
      };
      for (let i = 0; i < w.fs.length; i++) { const f = w.fs[i]; if (vis(f.x)) put(f.y, f.x, 13, f.z || 0, 1, i); }
      for (let i = 0; i < w.zs.length; i++) { const z = w.zs[i]; if (z.dead && corpseT(z) > 1.6) continue; if (vis(z.x)) put(z.y, z.x, z.boss ? 36 : z.kind === 'rastejante' ? 26 : 12, z.z || 0, 2, i); }
      for (let i = 0; i < w.items.length; i++) { const it = w.items[i]; if (vis(it.x)) put(it.y, it.x, 5, it.z, 3, i); }
      if (pet && vis(pet.x)) put(pet.y, pet.x, 8, 0, 4, 0);
      const actors = w.actors ?? [];
      for (let i = 0; i < actors.length; i++) { const X = actors[i]; if (!X.hide && vis(X.x)) put(X.y, X.x, X.w0, 0, 5, i); }
      for (let i = 1; i < n; i++) { const s = slots[i]; let j = i; while (j > 0 && slots[j - 1].y > s.y) { slots[j] = slots[j - 1]; j--; } slots[j] = s; }
      if (Q.shadows) for (let i = 0; i < n; i++) { const e = slots[i], ww = Math.max(4, Math.round(e.w0 * (1 - e.z / 90))); CH.fillStyle = 'rgba(10,4,16,.5)'; for (let y = -1; y <= 1; y++) CH.fillRect(Math.round(e.x - cam) - ww + (y ? 2 : 0), Math.round(e.y) + y, ww * 2 - (y ? 4 : 0), 1); }
      for (let i = 0; i < n; i++) {
        const e = slots[i];
        if (e.k === 1) drawFighter(CH, w.fs[e.i]);
        else if (e.k === 2) drawZombie(CH, w.zs[e.i], dt);
        else if (e.k === 3) drawItem(CH, w.items[e.i], cam);
        else if (e.k === 4 && pet) { const P = pet, cv = petFrame(P.art, P.anim ?? 'idle', P.fi), a = anchor(P.art.F, cv); CH.save(); CH.translate(Math.round(P.x - cam), Math.round(P.y - (P.art.has('fly') && P.anim === 'fly' ? 18 : 0))); if (P.face < 0) CH.scale(-1, 1); CH.drawImage(cv, -a.ax / RS, -a.gy / RS, cv.width / RS, cv.height / RS); CH.restore(); }
        else if (e.k === 5) actors[e.i].draw(CH, cam);
      }
      if (Q.gore >= 1) GORE.drawAir(CH, cam);
      // projéteis
      for (const p of w.proj) {
        const x = Math.round(p.x - cam), y = Math.round(p.y);
        if (FX && p.kind === 'bullet') { fxAt(CH, 'bullet', Math.floor(w.clock * 20) % 2, p.x - cam, p.y, p.vx! > 0 ? 1 : -1, undefined, 1, true); continue; }
        if (FX && p.kind === 'hook') {
          const ox = p.owner.x + p.owner.face * 30 - cam, oy = p.owner.y - 90, dx = (p.x - cam) - ox, dy = p.y - oy, d = Math.hypot(dx, dy), step = 7;
          for (let s = step / 2; s < d - 6; s += step) fxAt(CH, 'chain', 0, ox + dx * s / d, oy + dy * s / d, dx >= 0 ? 1 : -1);
          fxAt(CH, 'hook', 0, p.x - cam, p.y, dx >= 0 ? 1 : -1); continue;
        }
        if (FX && p.kind === 'rock') { fxAt(CH, 'rock', Math.floor(p.t * 16) % 4, p.x - cam, p.y); continue; }
        if (FX && p.kind === 'acid') { fxAt(CH, 'acid', Math.floor(p.t * 16) % 4, p.x - cam, p.y, p.x1 >= p.x0 ? 1 : -1, { cor: p.c }); continue; }
        if (p.kind === 'bullet') { CH.fillStyle = '#fff4c0'; CH.fillRect(x - 4, y, 8, 1); CH.fillStyle = '#ffd23f'; CH.fillRect(x - (p.vx! > 0 ? 8 : -4), y, 4, 1); continue; }
        if (p.kind === 'hook') { CH.strokeStyle = '#5e5e78'; CH.lineWidth = 2; CH.beginPath(); CH.moveTo(Math.round(p.owner.x + p.owner.face * 30 - cam), p.owner.y - 90); CH.lineTo(x, y); CH.stroke(); CH.fillStyle = '#c8ccd8'; CH.fillRect(x - 3, y - 3, 6, 6); continue; }
        if (p.kind === 'rock') { CH.fillStyle = '#170b1c'; CH.fillRect(x - 7, y - 6, 14, 12); CH.fillStyle = '#8a8494'; CH.fillRect(x - 6, y - 5, 12, 10); CH.fillStyle = '#b4aeb8'; CH.fillRect(x - 6, y - 5, 12, 2); continue; }
        CH.fillStyle = '#170b1c'; CH.fillRect(x - 3, y - 3, 6, 6); CH.fillStyle = p.c!; CH.fillRect(x - 2, y - 2, 4, 4);
      }
      // feixes de laser
      for (const b of w.beams) {
        b.t += dt;
        const a = Math.max(0, 1 - b.t / b.d), x0 = Math.round(Math.min(b.x0, b.x1) - cam), x1 = Math.round(Math.max(b.x0, b.x1) - cam), hh = b.wide ? 10 : 4;
        if (FX) { const seg = FX.frame('laserBeam', 0, { cor: b.c, wide: b.wide }).width / RS, fi = Math.floor(b.t * 30) % 3; for (let sx = x0; sx < x1; sx += seg) fxAt(CH, 'laserBeam', fi, sx, b.y, 1, { cor: b.c, wide: b.wide }, a, true); continue; }
        CH.save(); CH.globalCompositeOperation = 'lighter'; CH.globalAlpha = a;
        CH.fillStyle = b.c; CH.fillRect(x0, Math.round(b.y - hh), x1 - x0, hh * 2);
        CH.fillStyle = '#ffffff'; CH.fillRect(x0, Math.round(b.y - 1), x1 - x0, 2);
        CH.restore();
      }
      compact(w.beams, (b) => b.t < b.d);
      drawGolpes(CH, w, cam); // golpes especiais (onda, raios, esfera...)
      if (CTINT[w.mode]) { CH.globalCompositeOperation = 'source-atop'; CH.fillStyle = CTINT[w.mode]!; CH.fillRect(0, 0, w.W, w.H); CH.globalCompositeOperation = 'source-over'; }
      // barras e marcadores dos zumbis
      for (const z of w.zs) {
        if (z.dead || z.boss) continue;
        const x = Math.round(z.x - cam);
        if (x < -48 || x > w.W + 48) continue;
        const top = Math.round(z.y - z.K.top * zs(z));
        if (FX && z.stun > 0 && !z.down) { fxAt(CH, 'stun', Math.floor(w.clock * 12) % 6, x, top - 6); }
        else if (z.stun > 0 && !z.down) for (let k = 0; k < 3; k++) { const a = w.clock * 6 + k * 2.1; CH.fillStyle = '#ffd23f'; CH.fillRect(Math.round(x + Math.cos(a) * 9), Math.round(top - 6 + Math.sin(a) * 3), 2, 2); }
        if (z.hp < z.maxhp) { CH.fillStyle = '#000'; CH.fillRect(x - 11, top - 12, 22, 4); CH.fillStyle = '#3a0c18'; CH.fillRect(x - 10, top - 11, 20, 2); CH.fillStyle = z.form === 'plenilunar' ? '#ff6a42' : z.form === 'enluarado' ? '#c8a0ff' : '#ff4a5a'; CH.fillRect(x - 10, top - 11, Math.max(0, Math.round(20 * z.hp / z.maxhp)), 2); }
      }
      if (FX && w.boss && w.boss.state === 'dazed') { const z = w.boss; fxAt(CH, 'stun', Math.floor(w.clock * 12) % 6, z.x - cam, z.y - z.K.top * zs(z)); }
      else if (w.boss && w.boss.state === 'dazed') { const z = w.boss, x = Math.round(z.x - cam), top = Math.round(z.y - z.K.top * zs(z)); for (let k = 0; k < 4; k++) { const a = w.clock * 6 + k * 1.6; CH.fillStyle = '#ffd23f'; CH.fillRect(Math.round(x + Math.cos(a) * 16), Math.round(top + Math.sin(a) * 4), 3, 3); } }
      for (const f of w.fs) if (FX && f.state === 'stun' && !f.down) fxAt(CH, 'stun', Math.floor(w.clock * 12) % 6, f.x - cam, f.y - 62);
      for (const f of w.fs) if (!FX && f.state === 'stun' && !f.down) { const x = Math.round(f.x - cam), top = Math.round(f.y - 84); for (let k = 0; k < 3; k++) { const a = w.clock * 7 + k * 2.1; CH.fillStyle = '#ffd23f'; CH.fillRect(Math.round(x + Math.cos(a) * 10), Math.round(top + Math.sin(a) * 3), 2, 2); } }
      for (const r of w.rings) if (FX) { r.t += dt; fxAt(CH, 'whistle', Math.floor(r.t * 9), r.x - cam, r.y + 60, 1, undefined, 1, true); }
      if (!FX) for (const r of w.rings) { r.t += dt; for (let k = 0; k < 3; k++) { const rr = r.t * 200 - k * 14; if (rr < 4) continue; CH.strokeStyle = 'rgba(255,255,255,' + Math.max(0, 0.9 - r.t * 1.3) + ')'; CH.lineWidth = 1; CH.beginPath(); CH.ellipse(r.x - cam, r.y + 60, rr, rr * 0.5, 0, 0, Math.PI * 2); CH.stroke(); } }
      compact(w.rings, (r) => r.t < 0.7);
      if (!Q.sparks) w.sparks.length = 0;
      for (const p of w.sparks) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 160 * dt; CH.fillStyle = p.c; CH.globalAlpha = Math.max(0, 1 - p.t * 1.6); CH.fillRect(Math.round(p.x - cam), Math.round(p.y), 2, 2); CH.globalAlpha = 1; }
      compact(w.sparks, (p) => p.t < 0.6);
      drawVfx(CH, av, cam, dt);
      compact(w.vfx, (v) => Math.floor(v.t * v.fps) < (FX?.N[v.kind] || 1));
      g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(chCv, shk * RS, 0); LG(g);
      FG.clearRect(0, 0, w.W, w.H); MAP.drawFG(FG, cam);
      if (TN[w.mode]) { FG.globalCompositeOperation = 'source-atop'; FG.fillStyle = TN[w.mode]!; FG.fillRect(0, 0, w.W, w.H); FG.globalCompositeOperation = 'source-over'; }
      g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(fgCv, shk * RS, 0); LG(g);
      // WARNING: pisca vermelho na tela inteira
      if (w.wx && Q.clima) w.wx.front(g, cam, performance.now() / 1000); // chuva, neblina, véu das nuvens e relâmpago
      if (w.phase === 'warning') { g.fillStyle = `rgba(255,20,40,${0.12 + 0.12 * Math.max(0, Math.sin(w.clock * 14))})`; g.fillRect(0, 0, w.W, w.H); }
      if (w.fade > 0) { g.fillStyle = 'rgba(0,0,0,' + w.fade + ')'; g.fillRect(0, 0, w.W, w.H); }
    },
  };
}
