// Dia, clima e Lua de Sangue na expedição: lê o relógio do mundo (worldClock), troca o céu/luz do cenário,
// liga as camadas de clima (art-src/shared/clima.js) e vira modo 'lua' quando a janela nasce no meio da corrida.
import {
  CLIMA_EFEITO, CLIMA_NOME, PHASE_NOME, ambienteAt, fmtClock, fmtCountdown, fmtWorldHour, nextBloodMoon, serverNow, type Ambiente,
} from '../game/worldClock';
import { RS, type World } from './world';

/** Monta o ambiente na criação do mundo (antes do pré-aquecimento dos tiles). */
export function initAmbiente(w: World): void {
  const amb = ambienteAt(serverNow(), w.cfg.mapId);
  w.amb = amb;
  w.mode = w.cfg.lua || amb.lua ? 'lua' : amb.ceu;
  if (w.mode === 'lua') w.cfg.lua = true;
  w.MAP.setLight?.(w.mode, true);
  const C = (w.A as any).CLIMA;
  if (C) {
    const wx = C.make({ W: w.W * RS, H: w.H * RS, RS, HZ: Math.round(w.BASE * RS), Y0: Math.round(150 * RS), Y1: Math.round(212 * RS) });
    wx.set(amb.clima, w.mode, true);
    wx.onBolt = (px: number) => onBolt(w, px);
    w.wx = wx;
    C.prewarm?.(w.mode, w.W * RS, w.H * RS, Math.round(w.BASE * RS));
  }
  w.alcCuspe = CLIMA_EFEITO[amb.clima].alcanceCuspe;
}

/** Relâmpago (CLM-08 + CLM-15): trovão treme a tela e atordoa até 2 zumbis comuns perto do raio. */
function onBolt(w: World, px: number): void {
  w.shake = Math.max(w.shake, 0.18);
  const wx = w.cam + px / RS + 80 / RS;
  let n = 0;
  for (const z of w.zs) {
    if (n >= 2 || z.dead || z.boss || Math.abs(z.x - wx) > 70) continue;
    z.stun = Math.max(z.stun, 0.8); n++;
  }
  if (n) w.log(`Um raio caiu perto: ${n} zumbi${n > 1 ? 's' : ''} atordoado${n > 1 ? 's' : ''}`);
}

let acc = 0;
/** Chamado a cada quadro com o dt REAL (s): de segundo em segundo confere o relógio. */
export function tickAmbiente(w: World, dt: number): void {
  acc += dt;
  if (acc < 1) return;
  acc = 0;
  const amb = ambienteAt(serverNow(), w.cfg.mapId), prev = w.amb;
  w.amb = amb;
  if (amb.lua && w.mode !== 'lua') { // a Lua de Sangue nasceu no meio da expedição (LUA-04)
    w.mode = 'lua'; w.cfg.lua = true;
    w.MAP.setLight?.('lua');
    w.banner('A LUA DE SANGUE NASCEU', 3, 'fail');
    w.log('<b>A Lua de Sangue nasceu</b>: zumbis enluarados e plenilunares, mais loot. O abrigo vai ser atacado.');
    w.shake = Math.max(w.shake, 0.3);
  } else if (w.mode !== 'lua' && amb.ceu !== w.mode) { // troca de fase do dia
    w.mode = amb.ceu;
    w.MAP.setLight?.(w.mode);
  }
  if (w.wx && (!prev || prev.clima !== amb.clima || w.wx.clima !== amb.clima || w.wxMode !== w.mode)) {
    w.wx.set(amb.clima, w.mode);
    w.wxMode = w.mode;
    w.alcCuspe = CLIMA_EFEITO[amb.clima].alcanceCuspe;
    if (prev && prev.clima !== amb.clima && CLIMA_EFEITO[amb.clima].texto) w.log('Clima: ' + CLIMA_EFEITO[amb.clima].texto);
  }
}

/** Chip do HUD da expedição: hora, período, clima e contagem da Lua de Sangue. */
export function ambienteHud(w: World): { html: string; lua: boolean; warn: boolean } {
  const now = serverNow(), amb: Ambiente = w.amb ?? ambienteAt(now, w.cfg.mapId), j = nextBloodMoon(now);
  const ativa = now >= j.inicio;
  const moon = ativa ? `<b>LUA DE SANGUE</b> · ${fmtClock(j.fim - now)}` : `Lua de Sangue em <b>${fmtCountdown(j.inicio - now)}</b>`;
  const ceu = w.mode === 'lua' ? 'Lua de Sangue' : PHASE_NOME[amb.fase];
  return { html: `<span class="xp-hora">${fmtWorldHour(now)} · ${ceu} · ${CLIMA_NOME[amb.clima]}</span><span class="xp-lua">${moon}</span>`, lua: ativa, warn: !ativa && j.inicio - now < 10 * 60_000 };
}
