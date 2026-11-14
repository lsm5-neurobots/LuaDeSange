// Encontros no motor da expedição: o sobrevivente/pet espera no cenário, o squad chega, abre o diálogo e o squad
// ACEITA ou RECUSA a missão (botões com contagem curta que segue o plano: recrutar ligado = aceitar). Aceitou: a missão
// roda com HUD (progresso + chance de recrutar subindo/descendo). No fim, se ele sobreviveu: diálogo de agradecimento,
// rolagem da chance e o resultado.
import { aceitaEncontro } from './plan';
import { anchor, petArt, portrait, recruitArt, type ActorArt } from '../art/sprites';
import { withHubK } from '../art/legacy';
import { GRADE_INFO } from '../data/grades';
import { RECRUITS, PETS } from '../data/recruits';
import {
  choiceLines, encounterLines, missionMeta, missionPerf, missionText, outcomeLine, pct, progressText, recruitChance, rollRecruit, thanksLines,
  type EncounterOutcome, type EncounterPlan, type Fala, type MissionState,
} from '../game/encounters';
import { openDialog, showChoice, showRecruitRoll, type DialogHandle, type DialogLine } from '../ui/expedition/dialog';
import { gradeBadge } from '../ui/widgets/grade';
import { setF } from './fighter';
import { RS, SK, aliveZ, clampY, type Spot, type World } from './world';

/** wait → talk → choice → (mission → thanksWait → thanks → roll → follow|leave) ou (leave, recusou) */
type EState = 'wait' | 'talk' | 'choice' | 'mission' | 'thanksWait' | 'thanks' | 'roll' | 'follow' | 'leave' | 'gone';

interface Enc {
  plan: EncounterPlan;
  art: ActorArt;
  x: number; y: number; face: 1 | -1;
  anim: string; fi: number; acc: number; alpha: number;
  state: EState;
  /** arena antes da qual ele espera / última arena do prazo */
  target: number; endAi: number;
  st: MissionState;
  t0: number; base: number; startX: number;
  chest?: Spot | null;
  hurtT: number;
  chance: number; prevChance: number; prevT: number; trend: number;
  out?: EncounterOutcome;
}

export interface EncounterRuntime {
  update(dt: number): void;
  hud(): void;
  results(): EncounterOutcome[];
  destroy(): void;
  /** manual: verbo se o líder está no alcance de quem espera; commit abre a fala */
  prompt(f: { x: number; y: number; down?: boolean }, commit: boolean): string | null;
}

const COR = { npc: '#ffb030', hero: '#ff4a5a', sys: '#ac9dca' };
/** Segundos (tempo real) da contagem que escolhe sozinha Aceitar/Recusar. */
export const CHOICE_S = 4;

export function makeEncounters(w: World, stage: HTMLElement): EncounterRuntime {
  const encs: Enc[] = [];
  let dlg: DialogHandle | null = null;
  const areaNome = (id: string) => w.MAP.AREAS.find((a: any) => a.id === id)?.short ?? id;
  const lead = () => w.fs.find((f) => !f.down) ?? w.fs[0];
  const squadHp = () => (w.fs.length ? w.fs.reduce((a, f) => a + (f.down ? 0 : f.hp / f.maxhp), 0) / w.fs.length : 0);

  // plano da expedição (modal antes de sair): recrutar=false passa reto; isca soma pontos à chance
  const plano = w.cfg.plano;
  const isca = plano?.isca ?? 0;
  // o encontro aparece sempre; com recrutar=false a contagem escolhe Recusar (o jogador ainda pode aceitar na hora)
  const padrao = plano?.recrutar !== false;
  for (const plan of w.cfg.encontros ?? []) {
    const target = w.arenas.findIndex((a) => a.area.id === plan.area && a.k === 0);
    if (target < 1 || target <= w.ai) continue; // precisa chegar andando
    let endAi = -1;
    w.arenas.forEach((a, i) => { if (a.area.id === plan.ate) endAi = i; });
    if (endAi < target) endAi = plan.missao.tipo === 'escolta' ? target : w.arenas.length - 1;
    const art = plan.kind === 'rec' ? recruitArt(plan.recTipo!, plan.skin ?? 'media') : petArt(plan.petTipo!, plan.variante ?? '');
    encs.push({
      plan, art, x: w.arenas[target].cam + 130, y: 174, face: -1, anim: 'idle', fi: 0, acc: 0, alpha: 1, state: 'wait', target, endAi,
      st: { feito: 0, meta: missionMeta(plan.missao) }, t0: 0, base: 0, startX: 0, hurtT: 0, chance: 0, prevChance: 0, prevT: 0, trend: 0,
    });
  }

  // ---------- desenho no palco ----------
  w.actors = encs.map((e) => ({
    get x() { return e.x; }, get y() { return e.y; }, w0: e.plan.kind === 'pet' ? 8 : 12,
    get hide() { return e.state === 'gone'; },
    draw(c: CanvasRenderingContext2D, cam: number) {
      const sx = Math.round(e.x - cam);
      if (sx < -60 || sx > w.W + 60) return;
      const cv = withHubK(SK, () => e.art.frame(e.anim, e.fi)), a = anchor(e.art.F, cv);
      c.save(); c.globalAlpha = e.alpha; c.translate(sx, Math.round(e.y)); if (e.face < 0) c.scale(-1, 1);
      c.drawImage(cv, -a.ax / RS, -a.gy / RS, cv.width / RS, cv.height / RS); c.restore();
      const top = Math.round(e.y - Math.min(a.gy / RS, e.plan.kind === 'pet' ? 24 : 52) - 8), gc = GRADE_INFO[e.plan.nota].cor;
      if (e.state === 'wait' || e.state === 'talk' || e.state === 'choice') {
        // balão de fala com "!" piscando + selo da nota
        const bob = Math.round(Math.sin(w.clock * 5) * 1.5);
        c.fillStyle = '#000'; c.fillRect(sx - 8, top - 14 + bob, 16, 11); c.fillRect(sx - 2, top - 4 + bob, 4, 3);
        c.fillStyle = '#fff'; c.fillRect(sx - 7, top - 13 + bob, 14, 9); c.fillRect(sx - 1, top - 4 + bob, 2, 2);
        c.fillStyle = '#170b1c'; c.fillRect(sx - 1, top - 12 + bob, 2, 4); c.fillRect(sx - 1, top - 7 + bob, 2, 2);
        c.fillStyle = '#000'; c.fillRect(sx + 7, top - 17 + bob, 9, 9); c.fillStyle = gc; c.fillRect(sx + 8, top - 16 + bob, 7, 7);
        c.fillStyle = '#120a1f'; c.font = 'bold 7px monospace'; c.textAlign = 'center'; c.fillText(e.plan.nota, sx + 11.5, top - 10 + bob);
      } else if (e.state === 'mission' && e.plan.missao.tipo === 'escolta') {
        c.fillStyle = '#000'; c.fillRect(sx - 12, top, 24, 4);
        c.fillStyle = '#ffb030'; c.fillRect(sx - 11, top + 1, Math.max(0, Math.round(22 * (e.st.hp ?? 0) / (e.st.hpMax || 1))), 2);
      } else if (e.state === 'mission') {
        c.fillStyle = '#000'; c.fillRect(sx - 3, top - 6, 7, 7); c.fillStyle = '#ffd23f'; c.fillRect(sx - 2, top - 5, 5, 5);
      }
    },
  }));

  // ---------- HUD da missão ----------
  const hudEl = document.createElement('div');
  hudEl.className = 'xmis';
  hudEl.setAttribute('aria-live', 'polite');
  stage.appendChild(hudEl);
  let hudFor: Enc | null = null;

  function anim(e: Enc, an: string, dt: number) {
    const a = e.art.has(an) ? an : e.art.has('fly') && an === 'walk' ? 'fly' : 'idle';
    if (a !== e.anim) { e.anim = a; e.fi = 0; e.acc = 0; }
    const A = e.art.F.ANIMS[a];
    if (!A) return;
    e.acc += dt * 1000;
    let d = A.dur(e.fi % A.n) || 100;
    while (e.acc >= d) { e.acc -= d; e.fi++; d = A.dur(e.fi % A.n) || 100; }
  }

  function moveTo(e: Enc, tx: number, ty: number, dt: number, sp = 70) {
    const dx = tx - e.x, moving = Math.abs(dx) > 5;
    if (moving) { e.x += Math.sign(dx) * Math.min(Math.abs(dx), (Math.abs(dx) > 60 ? sp * 1.6 : sp) * dt); e.face = dx > 0 ? 1 : -1; }
    e.y += (clampY(ty) - e.y) * Math.min(1, dt * 2);
    anim(e, moving ? 'walk' : 'idle', dt);
  }

  const heroArtOf = (): ActorArt => {
    const f = w.fs[0];
    return f.art ?? recruitArt('vigia', f.m.skin ?? 'media');
  };
  const toLine = (e: Enc, f: Fala): DialogLine => {
    if (f.quem === 'hero') return { nome: w.fs[0].m.nome, cor: COR.hero, retrato: portrait(heroArtOf(), 88), texto: f.texto, lado: 'r' };
    if (f.quem === 'sys') return { nome: 'Squad', cor: COR.sys, texto: f.texto };
    return { nome: e.plan.nome, cor: COR.npc, nota: e.plan.nota, retrato: portrait(e.art, 88), texto: f.texto };
  };
  const kicker = (e: Enc) => (e.plan.kind === 'rec' ? RECRUITS[e.plan.recTipo!].nome : PETS[e.plan.petTipo!].nome);

  function startTalk(e: Enc) {
    e.state = 'talk'; e.face = -1;
    w.pzOpen = true;
    w.fs.forEach((f) => { if (!f.down) { setF(f, 'idle'); f.face = e.x >= f.x ? 1 : -1; } });
    w.log(`<b>${e.plan.nome}</b> (${kicker(e)}, nota ${e.plan.nota}) pediu ajuda`);
    const lines = encounterLines(e.plan, w.fs[0].m.nome, areaNome(e.plan.ate)).map((f) => toLine(e, f));
    dlg = openDialog(stage, lines, {
      kicker: kicker(e), paused: () => w.paused, pace: () => w.speed,
      onEnd: () => { dlg = null; askChoice(e); },
    });
  }

  /** Aceitar/Recusar: contagem curta segue o plano; aba escondida = decide na hora pelo plano. */
  function askChoice(e: Enc) {
    e.state = 'choice';
    const decide = (aceitou: boolean, auto: boolean) => {
      w.log(`${aceitou ? 'Missão aceita' : 'Missão recusada'}${auto ? ' (plano)' : ''}: ${e.plan.nome}`);
      const lines = choiceLines(e.plan, aceitou).map((f) => toLine(e, f));
      dlg = openDialog(stage, lines, {
        kicker: kicker(e), hold: 1100, paused: () => w.paused, pace: () => w.speed,
        onEnd: () => { dlg = null; w.pzOpen = false; if (aceitou) startMission(e); else refuse(e); },
      });
    };
    // plano: ofício/pet na lista e vida do squad acima do mínimo
    const quer = padrao && aceitaEncontro(plano, e.plan) && squadHp() >= (plano?.recrutarVidaMin ?? 0);
    if (typeof document !== 'undefined' && document.hidden) { decide(quer, true); return; }
    showChoice(stage, {
      titulo: `${e.plan.nome} · ${kicker(e)}`, texto: missionText(e.plan.missao, areaNome(e.plan.ate)),
      padrao: quer, segundos: CHOICE_S, paused: () => w.paused, onPick: decide,
    });
  }

  function refuse(e: Enc) {
    e.out = { plan: e.plan, ok: false, recusada: true, progresso: 'recusada', motivo: 'o squad recusou', desempenho: 0, chance: 0, roll: 1 };
    e.state = 'leave';
  }

  function startMission(e: Enc) {
    const m = e.plan.missao;
    e.state = 'mission'; e.t0 = w.clock; e.startX = e.x;
    if (m.tipo === 'escolta') { e.st.hp = e.st.hpMax = m.hp; }
    if (m.tipo === 'cacar') e.base = w.killsBy[m.alvo] ?? 0;
    if (m.tipo === 'coletar') e.base = w.bag[m.item] ?? 0;
    if (m.tipo === 'vasculhar') e.base = 0;
    if (m.tipo === 'bau') {
      const lastCam = w.arenas[e.endAi]?.cam ?? Infinity;
      e.chest = w.spots.find((s) => s.t === 'bau' && !s.done && s.x >= e.x - 40 && s.x <= lastCam + w.W) ?? null;
      if (!e.chest) { e.plan.missao = { tipo: 'vasculhar', n: 2 }; e.st.meta = 2; } // sem baú na rota
    }
    e.chance = e.prevChance = recruitChance(e.plan.nota, perfOf(e), false, isca); e.prevT = w.clock;
    w.banner('MISSÃO: ' + missionText(e.plan.missao, areaNome(e.plan.ate)).toUpperCase(), 2.2, 'go');
    w.log(`Missão aceita: ${missionText(e.plan.missao, areaNome(e.plan.ate))}`);
  }

  const perfOf = (e: Enc) => missionPerf({ m: e.plan.missao, st: e.st, t: w.clock - e.t0, squadHp: squadHp() });

  function progress(e: Enc) {
    const m = e.plan.missao;
    if (m.tipo === 'cacar') e.st.feito = Math.max(0, (w.killsBy[m.alvo] ?? 0) - e.base);
    else if (m.tipo === 'coletar') e.st.feito = Math.max(0, (w.bag[m.item] ?? 0) - e.base);
    else if (m.tipo === 'vasculhar') e.st.feito = w.spots.filter((s) => s.x >= e.startX - 40 && (s.state === 'vasculhado' || s.state === 'aberto')).length;
    else if (m.tipo === 'bau') e.st.feito = e.chest?.state === 'aberto' ? 1 : 0;
  }

  /**
   * Fecha a missão: desempenho → chance (a rolagem é sorteada aqui, o resultado já vale mesmo se a expedição acabar).
   * `show`: sobreviveu → agradecimento (AGR-1) → rolagem animada → resultado; morto → sem agradecimento.
   */
  function resolve(e: Enc, motivo: string, show = true) {
    if (e.out) return;
    progress(e);
    const morto = e.plan.missao.tipo === 'escolta' && (e.st.hp ?? 0) <= 0;
    const desempenho = perfOf(e), chance = recruitChance(e.plan.nota, desempenho, morto, isca), { ok, roll } = rollRecruit(chance);
    e.out = { plan: e.plan, ok, progresso: progressText(e.plan.missao, e.st), motivo, desempenho, chance, roll };
    w.log(`${e.plan.nome}: desempenho ${pct(desempenho)} · chance ${pct(chance)} → ${ok ? '<b>recrutado</b>' : 'não veio'}`);
    if (!show) { e.state = ok ? 'follow' : 'leave'; return; } // fechamento da expedição: só recruta, não entra no squad
    if (morto) { e.state = 'leave'; w.banner('NÃO RESISTIU…', 1.8, 'fail'); return; }
    if (w.phase === 'failed') { roll_(e); return; } // squad caiu: sem conversa, só a rolagem
    e.state = 'thanksWait'; // espera o palco ficar livre (baú/puzzle/outro diálogo) pra agradecer
  }

  function startThanks(e: Enc) {
    e.state = 'thanks'; e.face = -1;
    w.pzOpen = true;
    const lines = thanksLines(e.plan).map((f) => toLine(e, f));
    dlg = openDialog(stage, lines, {
      kicker: kicker(e), hold: 1300, paused: () => w.paused, pace: () => w.speed,
      onEnd: () => { dlg = null; w.pzOpen = false; roll_(e); },
    });
  }

  /** Recrutado com vaga no squad: vira lutador (sai do cenário como ator e entra em w.fs). */
  function join(e: Enc): boolean {
    const m = e.plan.reforco;
    if (!m || !e.out?.ok || w.phase === 'failed' || !w.addFighter?.(m, e.x, clampY(e.y))) return false;
    e.out.entrou = true;
    e.state = 'gone';
    return true;
  }

  function roll_(e: Enc) {
    const o = e.out!;
    e.state = 'roll';
    showRecruitRoll(stage, {
      nome: e.plan.nome, nota: e.plan.nota, chance: o.chance, roll: o.roll, desempenho: o.desempenho,
      onEnd: () => {
        e.state = o.ok ? 'follow' : 'leave';
        const entrou = o.ok && join(e);
        w.banner(o.ok ? (e.plan.kind === 'pet' ? 'NOVO PET!' : entrou ? 'RECRUTADO! ENTROU NO SQUAD' : 'RECRUTADO!') : 'FOI EMBORA…', 1.8, o.ok ? 'go' : 'fail');
        const L = toLine(e, outcomeLine(e.plan, o.ok));
        if (!dlg) dlg = openDialog(stage, [L], { hold: 1500, paused: () => w.paused, pace: () => w.speed, onEnd: () => { dlg = null; } });
      },
    });
  }

  function prompt(f: { x: number; y: number; down?: boolean }, commit: boolean): string | null {
    if (!w.cfg.manual || w.phase !== 'walk' || f.down) return null;
    let best: Enc | null = null, bd = 1e9;
    for (const e of encs) {
      if (e.state !== 'wait' || e.target !== w.ai + 1) continue;
      const dx = Math.abs(f.x - e.x), dy = Math.abs(f.y - e.y);
      if (dx > 42 || dy > 28) continue;
      const d = dx + dy * 2;
      if (d < bd) { bd = d; best = e; }
    }
    if (!best) return null;
    const verb = best.plan.kind === 'pet' ? 'chamar' : 'falar';
    if (commit) {
      const lead = w.fs[0];
      if (lead) lead.face = best.x >= lead.x ? 1 : -1;
      startTalk(best);
    }
    return verb;
  }

  return {
    prompt,
    update(dt) {
      for (const e of encs) {
        if (e.state === 'gone') continue;
        const L = lead();
        if (e.state === 'wait') {
          anim(e, 'idle', dt);
          // no manual o jogador anda até lá e aperta J; o automático fala sozinho ao chegar
          if (!w.cfg.manual && ((w.phase === 'walk' && w.ai === e.target - 1 && L.x >= e.x - 34) || w.ai >= e.target)) startTalk(e);
          continue;
        }
        if (e.state === 'talk' || e.state === 'choice' || e.state === 'thanks') { anim(e, 'idle', dt); continue; }
        if (e.state === 'thanksWait' && !w.pzOpen && !dlg) { startThanks(e); continue; }
        // segue o squad (atrás de quem estiver mais pra trás)
        if (e.state === 'mission' || e.state === 'follow' || e.state === 'roll' || e.state === 'thanksWait') {
          const alive = w.fs.filter((f) => !f.down), rear = alive.length ? Math.min(...alive.map((f) => f.x)) : L.x;
          moveTo(e, rear - (e.plan.kind === 'pet' ? 22 : 30), L.y + 10, dt);
        }
        if (e.state === 'leave') {
          e.face = -1; e.x -= 60 * dt; anim(e, 'walk', dt);
          e.alpha = Math.max(0, e.alpha - dt * 0.6);
          if (e.alpha <= 0 || e.x < w.cam - 60) e.state = 'gone';
          continue;
        }
        if (e.state !== 'mission') continue;
        const m = e.plan.missao;
        progress(e);
        if (m.tipo === 'escolta') {
          // zumbi encostado machuca o protegido
          for (const z of aliveZ(w)) {
            if (z.stun > 0 || z.down || Math.abs(z.x - e.x) > 16 || Math.abs(z.y - e.y) > 10) continue;
            e.st.hp = Math.max(0, (e.st.hp ?? 0) - z.K.dmg * (z.dmgMul ?? 1) * 0.5 * dt);
            e.hurtT -= dt;
            if (e.hurtT <= 0) { e.hurtT = 0.5; w.fx('hurt', 'socorro!', e.x, e.y - 70); }
          }
          if ((e.st.hp ?? 0) <= 0) { w.log(`${e.plan.nome} não resistiu…`); resolve(e, 'o protegido caiu'); continue; }
        } else if (e.st.feito >= e.st.meta) { resolve(e, 'missão cumprida'); continue; }
        else if (m.tipo === 'bau' && e.chest?.state === 'trancado') { resolve(e, 'baú ficou trancado'); continue; }
        // prazo: passou da última arena do prazo (ou a limpou) / squad caiu
        const cleared = w.ai > e.endAi || (w.ai === e.endAi && ['go', 'walk', 'approach', 'search', 'chest', 'victory'].includes(w.phase));
        if (w.phase === 'failed') resolve(e, 'o squad caiu');
        else if (cleared) resolve(e, m.tipo === 'escolta' ? 'chegou ao fim da área' : 'acabou o prazo');
        // chance atual (tendência a cada ~1 s)
        else if (!e.out) {
          e.chance = recruitChance(e.plan.nota, perfOf(e), false, isca);
          if (w.clock - e.prevT >= 1) { e.trend = e.chance - e.prevChance; e.prevChance = e.chance; e.prevT = w.clock; }
        }
      }
    },

    hud() {
      const e = encs.find((x) => x.state === 'mission' || x.state === 'thanksWait' || x.state === 'thanks' || x.state === 'roll') ?? null;
      if (!e) { hudEl.classList.remove('on'); hudFor = null; return; }
      if (hudFor !== e) {
        hudFor = e;
        hudEl.innerHTML = `<div class="xmis-face"></div><div class="xmis-body"><b class="xmis-nm"></b> <span class="xmis-g"></span>
          <span class="xmis-obj"></span><span class="xmis-pr"></span><div class="bar"><i></i></div><span class="xmis-ch"></span></div>`;
        const f = hudEl.querySelector('.xmis-face')!;
        f.appendChild(portrait(e.art, 48)); f.insertAdjacentHTML('beforeend', gradeBadge(e.plan.nota, 'corner'));
        hudEl.querySelector('.xmis-nm')!.textContent = e.plan.nome;
      }
      hudEl.classList.add('on');
      const m = e.plan.missao, o = e.out, sus = e.state !== 'mission' && e.state !== 'follow' && e.state !== 'leave'; // suspense até a rolagem parar
      hudEl.classList.toggle('ok', !!o?.ok && !sus); hudEl.classList.toggle('bad', !!o && !o.ok && !sus);
      (hudEl.querySelector('.xmis-obj') as HTMLElement).textContent = missionText(m, areaNome(e.plan.ate));
      (hudEl.querySelector('.xmis-pr') as HTMLElement).textContent = progressText(m, e.st);
      const fr = m.tipo === 'escolta' ? (e.st.hp ?? 0) / (e.st.hpMax || 1) : e.st.feito / (e.st.meta || 1);
      (hudEl.querySelector('.bar i') as HTMLElement).style.width = Math.max(0, Math.min(1, fr)) * 100 + '%';
      const ch = o ? o.chance : e.chance, tr = o ? 0 : e.trend;
      const arrow = tr > 0.004 ? '<span class="up">▲</span>' : tr < -0.004 ? '<span class="down">▼</span>' : '';
      (hudEl.querySelector('.xmis-ch') as HTMLElement).innerHTML = o ? `Chance final: <b>${pct(ch)}</b> · ${e.state === 'roll' ? 'rolando…' : e.state === 'thanks' || e.state === 'thanksWait' ? 'agradecendo…' : o.ok ? 'recrutado!' : 'não deu'}` : `Chance de recrutar: <b>${pct(ch)}</b> ${arrow}${isca > 0 ? ` <small>(isca +${isca}%)</small>` : ''}`;
    },

    results() {
      for (const e of encs) if (e.state === 'mission') resolve(e, w.phase === 'failed' ? 'o squad caiu' : 'a expedição acabou', false);
      return encs.filter((e) => e.out).map((e) => e.out!);
    },

    destroy() { dlg?.close(); dlg = null; hudEl.remove(); w.actors = []; },
  };
}
