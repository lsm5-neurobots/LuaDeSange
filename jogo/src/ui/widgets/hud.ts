// HUD do abrigo: recursos, dia, camas, contagem da Lua de Sangue e defesa × horda.
import { RESOURCES, RES_HUD, RES_IDS } from '../../data/resources';
import { comSede, famintos, fluxo } from '../../game/upkeep';
import { camas, populacao } from '../../game/shelter';
import { defenseTotal, hordeStrength, hordeDia } from '../../game/bloodmoon';
import { CLIMA_NOME, PHASE_NOME, ambienteAt, fmtClock, fmtCountdown, fmtWorldHour, nextBloodMoon, serverNow, textoContagemLua } from '../../game/worldClock';
import type { GameState } from '../../game/state';
import { itemImg } from '../../art/items';

export function hudHtml(s: GameState): string {
  const fl = fluxo(s);
  const res = RES_IDS.filter((k) => RES_HUD.includes(k) || (s.res[k] ?? 0) > 0)
    .map((k) => {
      const r = RESOURCES[k];
      const f = fl[k];
      const d = f ? ` <small class="hud-d">(−${Math.round(f.porDia * 10) / 10}/dia)</small>` : "";
      const tt = f ? `${r.nome}: consumo ${Math.round(f.porDia * 10) / 10}/dia · dura ${f.dias.toFixed(1)} dia(s)` : r.nome;
      return `<span class="hud-res${f?.critico ? " crit" : ""}" title="${tt}">${itemImg(k, 20)}<span class="hud-nm">${r.nome}</span> <b>${Math.floor(s.res[k] ?? 0)}</b>${d}</span>`;
    }).join('');
  const now = serverNow(), amb = ambienteAt(now, 'abrigo'), lua = nextBloodMoon(now);
  const moon = moonChip(now, s.luaAtacada);
  const blood = !!amb.lua;
  const def = Math.round(defenseTotal(s)), forca = hordeStrength(hordeDia(s));
  const bad = def < forca;
  const pop = s.recs.length, cm = camas(s);
  return `<div class="hud-row">${res}</div>
    <div class="hud-row hud-meta">
      <span class="hud-chip">Dia <b>${s.dia}</b></span>
      ${famintos(s) ? `<span class="hud-chip bad" title="Vida, dano e produção reduzidos">Famintos</span>` : ""}${comSede(s) ? `<span class="hud-chip bad" title="Vida, dano e produção reduzidos">Com sede</span>` : ""}
      <span class="hud-chip${pop > cm ? ' bad' : ''}" title="Recrutas com cama / camas da Barraca (recrutas repetidos podem esperar no Alojamento)">Camas <b>${pop}/${cm}</b></span>
      <span class="hud-chip hud-time" title="Hora do mundo (1 dia = 24 min reais) e clima do Recife">${fmtWorldHour(now)} · ${amb.lua ? 'Lua de Sangue' : PHASE_NOME[amb.fase]} · ${CLIMA_NOME[amb.clima]}</span>
      <span class="hud-chip hud-moon${blood ? ' blood' : lua.inicio - now < 10 * 60_000 ? ' warn' : ''}" title="A Lua de Sangue nasce a cada 12 h (00h e 12h UTC) e dura 30 min">${moon}</span>
      <span class="hud-chip${bad ? ' bad' : ' good'}" title="Vida das defesas × força prevista da próxima horda">Defesa <b>${def}</b> × Horda <b>${forca}</b></span>
    </div>`;
}

/** Chip da Lua de Sangue: contagem regressiva ou "LUA DE SANGUE · 18:42" (tempo que falta da janela). */
export function moonChip(now: number = serverNow(), luaAtacada?: number): string {
  const remoto = textoContagemLua(now, luaAtacada);
  if (remoto) return remoto;
  const j = nextBloodMoon(now);
  return now >= j.inicio ? `<b>LUA DE SANGUE</b> · ${fmtClock(j.fim - now)}` : `Lua de Sangue em <b>${fmtCountdown(j.inicio - now)}</b>`;
}

export function renderHud(el: HTMLElement, s: GameState): void {
  const html = hudHtml(s);
  if (el.dataset.h !== html) { el.dataset.h = html; el.innerHTML = html; }
}
