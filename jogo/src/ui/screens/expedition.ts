// Tela da expedição automática + resultado (aplica recompensas e encaminha a Lua de Sangue pro abrigo).
import './expedition.css';
import type { Screen } from '../../core/router';
import { openPlanoVivo } from '../shelter/expPlan';
import { go } from '../../core/router';
import { esc } from '../../core/dom';
import { startExpedition, type ExpeditionHandle } from '../../expedition/engine';
import type { ExpeditionConfig, ExpeditionResult } from '../../expedition/types';
import { G, mutate, startNewGame, hasGame } from '../../game/state';
import { modoRemoto } from '../../services/api';
import { msgErro, resolver } from '../../services/intent';
import { toast } from '../widgets/toast';
import { buildExpedition } from '../../game/team';
import { applyExpedition, type RewardSummary } from '../../game/rewards';
import { MAPS } from '../../data/maps';
import { WEAPONS, type WeaponFamily } from '../../data/weapons';
import { ZOMBIES, type ZombieId } from '../../data/zombies';
import { RESOURCES, type ResId } from '../../data/resources';
import { RECRUITS, PETS } from '../../data/recruits';
import { portrait, recruitArt, petArt, type ActorArt } from '../../art/sprites';

/** Retrato justo pra carta do resultado: recorta o quadro idle pelo alfa e amplia em passo inteiro (pixel limpo). */
function cardPortrait(art: ActorArt, size = 120): HTMLCanvasElement {
  const src = art.frame('idle', 0), w = src.width, h = src.height;
  let d: Uint8ClampedArray;
  try { d = src.getContext('2d')!.getImageData(0, 0, w, h).data; } catch { return portrait(art, size); }
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  if (x1 < 0) return portrait(art, size);
  const bw = x1 - x0 + 1, bh = y1 - y0 + 1, fit = Math.min((size * 0.9) / bh, (size * 0.9) / bw), s = fit >= 1 ? Math.max(1, Math.floor(fit)) : fit;
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d')!; g.imageSmoothingEnabled = false;
  const dw = Math.round(bw * s), dh = Math.round(bh * s);
  g.drawImage(src, x0, y0, bw, bh, Math.round((size - dw) / 2), Math.round(size * 0.96 - dh), dw, dh);
  return c;
}
import { itemImg, weaponImg } from '../../art/items';
import { openModal, type ModalHandle } from '../widgets/modal';
import { gearButton, bindSettings } from '../widgets/settings';
import { gradeBadge } from '../widgets/grade';
import type { Grade } from '../../data/grades';
import { missionText, pct } from '../../game/encounters';
import '../expedition/dialog.css';
import { fecharRodada, PAUSA_RODADA_S, type Parada } from '../../game/idleLoop';
import { continuarLoop, pararLoopJogador, watchAway } from '../shelter/offlineReport';
import { save } from '../../game/state';
import { STRUCTS } from '../../data/structures';

/** A expedição roda sempre em 1× para o jogador; os botões 2×/4×/8× só existem com ?debug (testes/medições). */
/** recruta nº 1 do squad: na volta é ele quem acende a fogueira do abrigo */
let lastLider = 'hero';
const SPEED_DEV = typeof location !== 'undefined' && new URLSearchParams(location.search).has('debug');

export function expeditionScreen(): Screen {
  let handle: ExpeditionHandle | null = null, modal: ModalHandle | null = null, logTimer = 0, cdTimer = 0, offAway = () => {}, pausedByHide = false;

  function showResult(r: ExpeditionResult, sum: RewardSummary, parada: Parada | null = null, emLoop = false) {
    const kills = Object.entries(r.abatesPorTipo).map(([k, n]) => `<span>${ZOMBIES[k as ZombieId].nome} <b>×${n}</b></span>`).join('') || '<span>nenhum</span>';
    const loot = Object.entries(sum.loot).filter(([, v]) => (v ?? 0) > 0).map(([k, v]) => `<div class="lt">${itemImg(k as ResId, 32)}<b>+${v}</b>${RESOURCES[k as ResId].nome}</div>`).join('');
    const head = r.sucesso
      ? (() => { const m = MAPS[r.mapId], bosses = [...new Set(Object.values(m?.ondas ?? {}).flat(2))].filter((k) => ZOMBIES[k as ZombieId]?.boss && (k !== 'brutamonte' && ZOMBIES[k as ZombieId].boss !== 'mini' || r.miniBoss)).map((k) => ZOMBIES[k as ZombieId].nome);
          return `<p class="xr-ok">${esc(m?.nome ?? 'Mapa')} limpo! ${esc(bosses.join(' e '))} ${bosses.length > 1 ? 'derrotados' : 'derrotado'}.</p>`; })()
      : r.primeira
        ? `<p class="xr-ok">Primeira saída! O squad recuou na área ${r.areaAlcancada}/${r.totalAreas} e trouxe <b>todo o loot</b>. Construa e evolua o abrigo, fique mais forte e volte pra ir mais longe.</p>`
        : r.recuou ? `<p class="xr-ok">O squad <b>recuou</b> na área ${r.areaAlcancada}/${r.totalAreas} e trouxe <b>todo o loot</b>.</p>`
        : `<p class="xr-bad">O squad caiu na área ${r.areaAlcancada}/${r.totalAreas} e voltou com metade do loot.</p>`;
    const seguir = emLoop && !parada && !!G().loop?.ativo;
    modal = openModal({
      kicker: r.lua ? 'Noite de Lua de Sangue' : `Dia ${G().dia}`,
      title: r.sucesso ? 'Expedição concluída' : r.primeira ? 'Recuou com o loot' : 'Expedição falhou',
      wide: true,
      closable: false,
      html: `${head}
        <div class="xr-grid">
          <div><span class="lbl">Progresso</span><p>Área <b>${r.areaAlcancada}</b>/${r.totalAreas} · arenas <b>${r.arenasLimpas}</b>/${r.totalArenas} · <b>${Math.round(r.duracao)}</b> s</p></div>
          <div><span class="lbl">Abates (${r.abates})</span><div class="xr-kills">${kills}</div></div>
        </div>
        <span class="lbl">Loot que volta pro abrigo</span>
        <div class="xr-loot">${loot || '<div class="lt">nada</div>'}<div class="lt"><b>+${sum.xp}</b>XP</div></div>
        ${sum.projetosNovos.length ? `<p class="xr-proj">${itemImg('projeto', 20)} Projeto: <b>${sum.projetosNovos.join(', ')}</b> · use na Oficina pra evoluir a raridade</p>` : ''}
        ${sum.armasNovas?.length ? `<p class="xr-proj">Arma comum: <b>${sum.armasNovas.map((n) => { const f = (Object.keys(WEAPONS) as WeaponFamily[]).find((k) => n.startsWith(WEAPONS[k].nomes.comum) || n.startsWith(WEAPONS[k].nome)); return (f ? weaponImg(f, 'comum', 20) : '') + n; }).join(', ')}</b> · evolua na Oficina</p>` : ''}
        ${sum.ups.length ? `<p class="xr-ok">Subiu de nível: ${sum.ups.map(esc).join(' · ')}</p>` : ''}
        <div class="xr-new"></div>
        ${sum.semCama ? `<p class="xr-bad">${RECRUITS[sum.semCama].genero === 'f' ? 'Uma' : 'Um'} ${RECRUITS[sum.semCama].nome} queria vir, mas não havia cama nem vaga no Alojamento. Evolua a Barraca ou faça uma fusão em Recrutas.</p>` : ''}
        ${sum.ataque && seguir ? `<div class="xr-moon"><b>A Lua de Sangue atacou o abrigo:</b> ${sum.ataque.segurou ? 'as defesas seguraram' : `a horda entrou${sum.ataque.danificadas.length ? ' e danificou ' + sum.ataque.danificadas.map((id) => STRUCTS[id].nome).join(', ') : ''}`}. Confira os reparos depois.</div>`
          : sum.ataque ? `<div class="xr-moon"><b>A Lua de Sangue nasceu.</b> A horda está chegando no abrigo…</div>` : ''}
        ${emLoop && parada ? `<p class="xr-bad"><b>Loop parado:</b> ${esc(G().loop?.parada?.msg ?? '')}.</p>` : ''}
        ${seguir ? `<div class="xr-loopbar" role="status"><b class="cd">${PAUSA_RODADA_S}</b><span>LOOP · rodada ${(G().loop?.rodadas ?? 0) + 1} começa sozinha (mesmo mapa, squad, pet e plano).</span>
          <button class="btn ghost sm" type="button" data-loopstop>Parar loop</button></div>` : ''}
        <div class="xr-actions">${seguir ? `<button class="btn" type="button" data-loopnow>Próxima rodada agora</button>` : `<button class="btn big ${sum.ataque ? 'red' : ''}" type="button" data-back>${sum.ataque ? 'Defender o abrigo' : 'Voltar ao abrigo'}</button>`}</div>`,
    });
    const nw = modal.body.querySelector('.xr-new')!;
    // carta do encontro: retrato grande e iluminado numa moldura (como as cartas do bestiário), selo da nota no canto da moldura
    const add = (cv: HTMLCanvasElement, nome: string, nota: Grade | undefined, tipo: string, sub: string, fim: string, ok = true, kind = 'rec') => {
      const d = document.createElement('div'); d.className = 'xr-guy' + (ok ? '' : ' bad');
      const f = document.createElement('div'); f.className = `xr-face xr-${kind}`; cv.className = 'px'; f.appendChild(cv);
      if (nota) f.insertAdjacentHTML('beforeend', gradeBadge(nota, 'corner lg'));
      d.appendChild(f);
      d.insertAdjacentHTML('beforeend', `<div class="xr-info"><b class="xr-name">${esc(nome)}</b><span class="xr-tipo">${tipo}</span>
        <p class="xr-sub">${sub}</p><p class="xr-fim">${fim}</p></div>`); nw.appendChild(d);
    };
    // encontros do mapa: missão → desempenho → chance → rolagem
    for (const o of sum.encontros ?? []) {
      const p = o.plan, rec = p.kind === 'rec';
      const art = rec ? recruitArt(p.recTipo!, p.skin ?? 'media') : petArt(p.petTipo!, p.variante ?? '');
      const tipo = rec ? RECRUITS[p.recTipo!].nome : PETS[p.petTipo!].nome;
      const fim = o.recusada ? 'missão recusada' : o.ok ? (rec ? (sum.semCama === p.recTipo ? 'queria vir, mas faltou cama e vaga no Alojamento' : sum.alojado && sum.novoRecruta?.nome === p.nome ? 'entrou no Alojamento de espera (sem cama, pronto pra fusão)' : 'entrou pro abrigo') : 'virou seu pet') : 'foi embora';
      const bonus = o.ok ? `<span class="xr-bonus">${rec ? RECRUITS[p.recTipo!].bonus : PETS[p.petTipo!].bonus}</span>` : '';
      add(cardPortrait(art, 120), p.nome, p.nota, tipo, o.recusada ? `${missionText(p.missao)} · o squad não aceitou` : `${missionText(p.missao)} (${o.progresso}) · desempenho <b>${pct(o.desempenho)}</b> · chance <b>${pct(o.chance)}</b>`,
        `<b>${fim}</b>${bonus}`, o.ok, rec ? 'rec' : 'pet');
    }
    const back = () => {
      clearInterval(cdTimer);
      modal?.close(); modal = null;
      go('shelter', { intro: 'volta', lider: lastLider, ataque: sum.ataque ?? undefined, recompensa: sum });
    };
    modal.body.querySelector('[data-back]')?.addEventListener('click', back);
    if (!seguir) return;
    // loop: contagem regressiva (parada enquanto a aba está escondida) e reinício automático
    let left = PAUSA_RODADA_S;
    const cd = modal.body.querySelector('.cd') as HTMLElement;
    const next = () => { clearInterval(cdTimer); modal?.close(); modal = null; if (!continuarLoop()) go('shelter'); };
    cdTimer = window.setInterval(() => {
      if (document.hidden) return;
      left--; cd.textContent = String(Math.max(0, left));
      if (left <= 0) next();
    }, 1000);
    modal.body.querySelector('[data-loopnow]')!.addEventListener('click', next);
    modal.body.querySelector('[data-loopstop]')!.addEventListener('click', () => {
      clearInterval(cdTimer);
      pararLoopJogador();
      const bar = modal?.body.querySelector('.xr-loopbar');
      if (bar) bar.innerHTML = '<span>Loop parado. A expedição não vai se repetir.</span>';
      const act = modal?.body.querySelector('.xr-actions');
      if (act) { act.innerHTML = '<button class="btn big" type="button" data-back>Voltar ao abrigo</button>'; act.querySelector('[data-back]')!.addEventListener('click', back); }
    });
  }

  return {
    mount(root, params?: { config?: ExpeditionConfig; loop?: boolean }) {
      if (!hasGame()) { startNewGame(); go('create'); return; }
      const cfg = params?.config ?? buildExpedition(G(), ['hero'], null);
      lastLider = cfg.team[0]?.id ?? 'hero';
      const emLoop = !!params?.loop && !!G().loop?.ativo;
      const map = MAPS[cfg.mapId];
      // Tela cheia: o palco cobre a viewport; controles, HUD e diário flutuam por cima.
      root.innerHTML = `<section class="xps${cfg.lua ? ' lua' : ''}">
        <div class="xps-host"></div>
        <header class="xps-top">
          <div class="xps-title"><small>${cfg.manual ? 'Manual · ' : ''}${cfg.lua ? 'Lua de Sangue · dia ' + cfg.dia : 'Expedição · dia ' + cfg.dia}</small>${map.nome}</div>
          ${cfg.plano ? `<button class="btn sm xps-plan" type="button" data-plan title="${cfg.manual ? 'Cura, baús, recrutas e loop desta saída' : 'Mudar o que o squad decide sozinho: cura, baús, recrutas, loop'}">${cfg.manual ? '⚙ Plano' : '⚙ Plano do automático'}</button>` : ''}
          <div class="xps-ctl">
            ${SPEED_DEV ? `<div class="seg" role="group" aria-label="Velocidade (só ?debug)">${[1, 2, 4, 8].map((s) => `<button type="button" data-s="${s}" aria-pressed="${s === 1}">${s}×</button>`).join('')}</div>` : ''}
            <button class="btn ghost sm" type="button" data-pause>❚❚ Pausar</button>
            <button class="btn ghost sm" type="button" data-retreat>Recuar</button>
            ${gearButton('btn ghost sm')}
            ${emLoop ? `<span class="xps-loop" title="Modo loop: a expedição se repete sozinha, inclusive offline (até 8 h)">LOOP · rodada ${(G().loop?.rodadas ?? 0) + 1}</span><button class="btn ghost sm" type="button" data-loopoff>Parar loop</button>` : ''}
          </div>
        </header>
        <details class="xps-log"><summary class="lbl">Diário</summary><ul></ul></details>
      </section>`;
      const host = root.querySelector('.xps-host') as HTMLElement;
      bindSettings(root.querySelector('.xps-ctl') as HTMLElement);
      handle = startExpedition(host, cfg, (r) => {
        if (modoRemoto()) {
          // A luta ficou no cliente (FPS). O prêmio é a simulação do mesmo squad/mapa; o relatório da tela não é enviado.
          void resolver({}).then((res) => {
            if (!res.ok || !res.resultado || !res.resumo) { toast(res.erro || 'O servidor não fechou a expedição'); go('shelter'); return; }
            showResult(res.resultado as ExpeditionResult, res.resumo as RewardSummary, (res.parada as Parada | null) ?? null, emLoop);
          }).catch((e) => { toast(msgErro(e)); go('shelter'); });
          return;
        }
        let sum!: RewardSummary, parada: Parada | null = null;
        // a rodada pertence ao loop se foi iniciada por ele (mesmo que o jogador tenha parado no meio)
        mutate((s) => { sum = applyExpedition(s, r); if (emLoop) parada = fecharRodada(s, r); });
        const dbg = (window as any).__lds;
        if (dbg) dbg.lastExp = { clock: handle?.world.clock ?? 0, r };
        showResult(r, sum, parada, emLoop);
      });
      if (emLoop) {
        const v = SPEED_DEV ? G().loop?.velocidade ?? 1 : 1;
        if (v !== 1) { handle.setSpeed(v); root.querySelectorAll<HTMLElement>('[data-s]').forEach((x) => x.setAttribute('aria-pressed', String(+x.dataset.s! === v))); }
        root.querySelector('[data-loopoff]')?.addEventListener('click', (e) => {
          pararLoopJogador();
          const b = e.currentTarget as HTMLButtonElement; b.disabled = true; b.textContent = 'Loop parado';
          root.querySelector('.xps-loop')?.setAttribute('hidden', '');
        });
      }
      // aba escondida: pausa o motor; com o loop ligado, o tempo fora vira simulação offline (uma vez só)
      offAway = watchAway({
        onHide: () => { if (handle && !handle.world.paused) { handle.togglePause(); pausedByHide = true; } },
        onShow: () => { if (pausedByHide && handle?.world.paused) handle.togglePause(); pausedByHide = false; },
        onAway: (rep) => { pausedByHide = false; go('shelter', { offline: rep }); },
      });
      root.querySelectorAll<HTMLButtonElement>('[data-s]').forEach((b) => b.addEventListener('click', () => {
        handle?.setSpeed(+b.dataset.s!);
        if (emLoop) { const L = G().loop; if (L) L.velocidade = +b.dataset.s!; }
        root.querySelectorAll('[data-s]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      }));
      const pb = root.querySelector('[data-pause]') as HTMLButtonElement;
      pb.addEventListener('click', () => { const p = handle?.togglePause(); pb.textContent = p ? '▶ Continuar' : '❚❚ Pausar'; });
      // plano do automático: pausa enquanto edita; o que mudar vale na hora (o motor lê cfg.plano a cada decisão)
      root.querySelector('[data-plan]')?.addEventListener('click', () => {
        if (!handle || !cfg.plano) return;
        const pausei = !handle.world.paused;
        if (pausei) { handle.togglePause(); pb.textContent = '▶ Continuar'; }
        openPlanoVivo({
          plano: cfg.plano, mapId: cfg.mapId, loop: emLoop && !!G().loop?.ativo,
          onClose: () => { if (pausei && handle?.world.paused) { handle.togglePause(); pb.textContent = '❚❚ Pausar'; } },
        });
      });
      root.querySelector('[data-retreat]')!.addEventListener('click', () => {
        if (confirm('Recuar agora? O squad volta com o loot que já pegou (não conta como vitória).')) handle?.retreat();
      });
      const ul = root.querySelector('.xps-log ul')!;
      let saveAcc = 0;
      logTimer = window.setInterval(() => {
        if (handle) ul.innerHTML = handle.log().map((l) => `<li>${l}</li>`).join('');
        // loop: grava a cada ~10 s (ultimaVisita certa se o jogo fechar); escondida não grava (é o início da ausência)
        if (emLoop && !document.hidden && (saveAcc += 0.7) >= 10) { saveAcc = 0; save(); }
      }, 700);
    },
    unmount() {
      clearInterval(logTimer); clearInterval(cdTimer);
      offAway(); offAway = () => {};
      handle?.destroy(); handle = null;
      modal?.close(); modal = null;
    },
  };
}
