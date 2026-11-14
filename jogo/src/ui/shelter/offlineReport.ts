// MODO LOOP na interface: relatório "Enquanto você estava fora", selo do loop no abrigo e o atalho que
// começa a próxima rodada. As regras ficam em game/idleLoop.ts.
import './offlineReport.css';
import { esc } from '../../core/dom';
import { go } from '../../core/router';
import { G, mutate } from '../../game/state';
import { iniciarRodada, pararLoop, simulateOffline, fmtDur, LOOP_MAX_MS, LOOP_MIN_MS, MAX_FALHAS, type OfflineReport } from '../../game/idleLoop';
import { MAPS } from '../../data/maps';
import { RESOURCES, type Bag, type ResId } from '../../data/resources';
import { ITEM_MK, type ItemMk } from '../../data/market';
import { ZOMBIES, type ZombieId } from '../../data/zombies';
import { STRUCTS } from '../../data/structures';
import { PISO_DEFESA } from '../../game/bloodmoon';
import { RECRUITS, PETS } from '../../data/recruits';
import { itemImg } from '../../art/items';
import { portrait, recruitArt, petArt } from '../../art/sprites';
import { gradeBadge } from '../widgets/grade';
import { openModal, type ModalHandle } from '../widgets/modal';
import { toast } from '../widgets/toast';

// ---------------- relatório pendente (simulado no boot, mostrado no abrigo) ----------------
let pendente: OfflineReport | null = null;
export const setPendingReport = (r: OfflineReport | null) => { pendente = r; };
export const takePendingReport = (): OfflineReport | null => { const r = pendente; pendente = null; return r; };

/** Simula a ausência (se o loop está ligado) e salva. Não repete intervalos: ultimaVisita vira `now`. */
export function simularAusencia(now = Date.now()): OfflineReport | null {
  // sem loop não mexe em nada (nem em ultimaVisita: a produção offline normal do abrigo depende dela)
  const rep = simulateOffline(G(), now);
  if (rep) mutate(() => {});
  return rep;
}

/** Começa a próxima rodada do loop (paga provisões, repõe itens) e abre a expedição. */
export function continuarLoop(): boolean {
  let ini!: ReturnType<typeof iniciarRodada>;
  mutate((s) => { ini = iniciarRodada(s); });
  if (ini.config) { go('expedition', { config: ini.config, loop: true }); return true; }
  toast(`Loop parado: ${ini.msg}`, 4200);
  return false;
}

export function pararLoopJogador(): void {
  mutate((s) => pararLoop(s, 'jogador'));
}

/**
 * Conta o tempo com a aba escondida como offline: `onAway(rep)` recebe o relatório quando o loop está ligado e a
 * ausência passou do mínimo. Devolve a função que desliga o ouvinte.
 */
export function watchAway(o: { onHide?: () => void; onShow?: (awayMs: number) => void; onAway: (rep: OfflineReport) => void }): () => void {
  let hiddenAt = 0;
  const fn = () => {
    if (document.hidden) {
      hiddenAt = Date.now();
      mutate(() => {}); // grava ultimaVisita = agora (início da ausência)
      o.onHide?.();
      return;
    }
    if (!hiddenAt) return;
    const away = Date.now() - hiddenAt;
    hiddenAt = 0;
    const rep = G().loop?.ativo && away >= LOOP_MIN_MS ? simularAusencia() : null;
    if (rep) o.onAway(rep);
    else o.onShow?.(away);
  };
  document.addEventListener('visibilitychange', fn);
  return () => document.removeEventListener('visibilitychange', fn);
}

// ---------------- selo do loop ----------------
export function loopBadgeHtml(): string {
  const L = G().loop;
  if (!L?.ativo) return '';
  const m = MAPS[L.mapId];
  return `<div class="loop-badge" role="status"><span class="lp-dot" aria-hidden="true"></span>
    <span class="lp-txt"><b>LOOP ATIVO</b><small>${esc(m?.nome ?? L.mapId)} · rodada ${L.rodadas + 1} · ${L.vitorias}V/${L.falhas}F</small></span>
    <button class="btn sm" type="button" data-loop="go">Retomar</button>
    <button class="btn sm ghost" type="button" data-loop="stop">Parar</button></div>`;
}

// ---------------- relatório ----------------
const bagHtml = (b: Bag, sinal = '+', vazio = 'nada') => {
  const it = Object.entries(b).filter(([, v]) => v);
  return it.length
    ? it.map(([k, v]) => `<div class="lt">${itemImg(k as ResId, 28)}<b>${sinal}${Math.abs(v!)}</b>${RESOURCES[k as ResId]?.nome ?? k}</div>`).join('')
    : `<div class="lt">${vazio}</div>`;
};
const saldoHtml = (b: Bag) => {
  const it = Object.entries(b).filter(([, v]) => v);
  return it.length ? it.map(([k, v]) => `<div class="lt ${v! < 0 ? 'neg' : ''}">${itemImg(k as ResId, 28)}<b>${v! > 0 ? '+' : ''}${v}</b>${RESOURCES[k as ResId]?.nome ?? k}</div>`).join('') : '<div class="lt">sem mudança</div>';
};

export function openOfflineReport(rep: OfflineReport, o: { onContinue?: () => void; onStop?: () => void } = {}): ModalHandle {
  const s = G(), L = s.loop, M = MAPS[rep.mapId];
  const ativo = !!L?.ativo;
  const itens = Object.entries(rep.itensUsados).filter(([, n]) => (n ?? 0) > 0);
  const kills = Object.entries(rep.abatesPorTipo).filter(([, n]) => n).sort((a, b) => b[1]! - a[1]!)
    .map(([k, n]) => `<span>${esc(ZOMBIES[k as ZombieId].nome)} <b>×${n}</b></span>`).join('') || '<span>nenhum</span>';
  const ataques = rep.ataques.map((a) => {
    const roub = Object.entries(a.roubado).filter(([, v]) => v).map(([k, v]) => `${itemImg(k as ResId, 18)}<b>−${v}</b>`).join(' ');
    const dmg = Object.entries(a.danoDefesas).filter(([, v]) => v).map(([k, v]) => `${esc(STRUCTS[k as keyof typeof STRUCTS].nome)} −${v}${a.piso?.includes(k as keyof typeof STRUCTS) ? ` (parou no mínimo de ${Math.round(PISO_DEFESA * 100)}%)` : ''}`).join(', ');
    return `<li class="${a.segurou ? 'ok' : 'bad'}"><b>Dia ${a.dia}</b> · horda ${a.forca} × defesa ${a.defesa} · ${a.segurou ? 'as defesas seguraram' : 'a horda entrou'}
      ${dmg ? `<small>Defesas: ${dmg}</small>` : ''}
      ${a.danificadas.length ? `<small>Danificadas: ${a.danificadas.map((id) => esc(STRUCTS[id].nome)).join(', ')}</small>` : ''}
      ${roub ? `<small class="or-roub">Roubado: ${roub}</small>` : ''}</li>`;
  }).join('');
  const motivo = rep.parada ? `<div class="or-stop" role="alert"><b>O loop parou:</b> ${esc(rep.parada.msg)}.${rep.parada.motivo === 'falhas' ? ` (caiu antes da 3ª arena ${MAX_FALHAS} vezes seguidas: fortaleça o squad ou escolha um mapa mais fácil.)` : rep.parada.motivo === 'provisoes' ? ' Produza ou colete água e comida no abrigo.' : ''}</div>` : '';

  const m = openModal({
    kicker: `Modo loop · ${esc(M?.nome ?? rep.mapId)}`,
    title: 'Enquanto você estava fora',
    wide: true,
    closable: false,
    html: `<div class="or">
      <p class="or-time">Você ficou fora <b>${fmtDur(rep.ausenteMs)}</b>${rep.cortado ? ` · o loop roda no máximo <b>${fmtDur(rep.simuladoMs)}</b> offline` : ''}. Tempo simulado: <b>${fmtDur(rep.simuladoMs)}</b>.</p>
      ${rep.cortado ? `<div class="or-warn">Passou de ${fmtDur(rep.simuladoMs)}: só as primeiras ${fmtDur(rep.simuladoMs)} contaram. Volte antes disso pra não desperdiçar tempo.</div>` : ''}
      <div class="or-stats">
        <div><span class="lbl">Rodadas</span><b>${rep.rodadas}</b></div>
        <div class="ok"><span class="lbl">Vitórias</span><b>${rep.vitorias}</b></div>
        <div class="bad"><span class="lbl">Falhas</span><b>${rep.falhas}</b></div>
        <div><span class="lbl">Dias</span><b>${rep.diaInicio} → ${rep.diaFim}</b></div>
        <div><span class="lbl">Chance média</span><b>${Math.round(rep.chanceMedia * 100)}%</b></div>
        <div><span class="lbl">Por rodada</span><b>${rep.duracaoMedia ? fmtDur(rep.duracaoMedia * 1000) : '–'}</b></div>
      </div>
      ${motivo}
      <span class="lbl">Loot trazido (quedas trazem metade; recuos trazem tudo)</span>
      <div class="xr-loot">${bagHtml(rep.loot)}<div class="lt"><b>+${rep.xp}</b>XP</div></div>
      ${rep.niveis.length ? `<p class="xr-ok">Subiu de nível: ${rep.niveis.map((n) => `${esc(n.nome)} nv ${n.de} → <b>${n.para}</b>`).join(' · ')}</p>` : ''}
      <div class="or-cols">
        <div><span class="lbl">Provisões das partidas</span><div class="xr-loot sm">${bagHtml(rep.provisoes, '−', 'nenhuma')}</div></div>
        <div><span class="lbl">Itens do plano gastos</span><div class="xr-loot sm">${itens.length ? itens.map(([k, n]) => `<div class="lt">${itemImg(k as ItemMk, 28)}<b>−${n}</b>${esc(ITEM_MK[k as ItemMk].nome)}</div>`).join('') : '<div class="lt">nenhum</div>'}</div></div>
      </div>
      <div class="or-cols">
        <div><span class="lbl">Saldo no estoque</span><div class="xr-loot sm">${saldoHtml(rep.saldo)}</div></div>
        <div><span class="lbl">Produção esperando coleta</span><div class="xr-loot sm">${bagHtml(rep.producao, '+', 'nada')}</div></div>
      </div>
      <span class="lbl">Abates (${rep.abates}) · entram no bestiário</span>
      <div class="xr-kills">${kills}</div>
      ${rep.projetos.length ? `<p class="xr-proj">${itemImg('projeto', 20)} Projetos: <b>${rep.projetos.map(esc).join(', ')}</b></p>` : ''}
      ${rep.armas.length ? `<p class="xr-proj">Armas achadas: <b>${rep.armas.map(esc).join(', ')}</b></p>` : ''}
      ${rep.lembrancas?.length ? `<p class="xr-proj">Lembrança encontrada: <b>${rep.lembrancas.map(esc).join(', ')}</b></p>` : ''}
      ${rep.conquistas?.length ? `<p class="xr-proj">Conquistas: <b>${rep.conquistas.map(esc).join(', ')}</b> (resgate em Conquistas)</p>` : ''}
      <div class="xr-new or-new"></div>
      ${rep.encontrosFalhos ? `<p class="or-dim">${rep.encontrosFalhos} sobrevivente${rep.encontrosFalhos === 1 ? '' : 's'}/pet${rep.encontrosFalhos === 1 ? '' : 's'} não quis vir.</p>` : ''}
      ${rep.semCama.length ? `<p class="xr-bad">${rep.semCama.map((t) => RECRUITS[t].nome).join(', ')} queria vir, mas não havia cama nem vaga no Alojamento. Evolua a Barraca ou faça uma fusão em Recrutas.</p>` : ''}
      ${rep.desertores.length ? `<p class="xr-bad">Foram embora por fome/sede: <b>${rep.desertores.map(esc).join(', ')}</b></p>` : ''}
      <span class="lbl">Lua de Sangue (${rep.ataques.length} ataque${rep.ataques.length === 1 ? '' : 's'} ao abrigo)</span>
      ${ataques ? `<ul class="or-moon">${ataques}</ul>` : '<p class="or-dim">Nenhuma janela de Lua de Sangue nesse período.</p>'}
      <div class="xr-actions or-actions">
        ${ativo ? `<button class="btn ghost" type="button" data-or="stop">Parar</button><button class="btn big" type="button" data-or="go">Continuar loop</button>`
          : `<button class="btn big" type="button" data-or="close">Fechar</button>`}
      </div>
    </div>`,
  });
  const nw = m.body.querySelector('.or-new')!;
  const add = (cv: HTMLCanvasElement, nome: string, nota: string | undefined, sub: string) => {
    const d = document.createElement('div'); d.className = 'xr-guy';
    const f = document.createElement('div'); f.className = 'xr-face'; f.appendChild(cv);
    if (nota) f.insertAdjacentHTML('beforeend', gradeBadge(nota as any, 'corner'));
    d.appendChild(f);
    d.insertAdjacentHTML('beforeend', `<div><b>${esc(nome)}</b> ${nota ? gradeBadge(nota as any) : ''}<span class="lbl">${sub}</span></div>`);
    nw.appendChild(d);
  };
  for (const r of rep.recrutas) add(portrait(recruitArt(r.tipo, r.skin)), r.nome, r.nota, `${RECRUITS[r.tipo].nome} · ${G().alojamento?.includes(r) ? 'no Alojamento de espera (fusão)' : 'entrou pro abrigo'} · ${RECRUITS[r.tipo].bonus}`);
  for (const p of rep.pets) add(portrait(petArt(p.tipo, p.variante)), p.nome, p.nota, `${PETS[p.tipo].nome} · virou seu pet · ${PETS[p.tipo].bonus}`);
  m.body.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-or]');
    if (!b) return;
    m.close();
    if (b.dataset.or === 'go') { if (o.onContinue) o.onContinue(); else continuarLoop(); }
    else if (b.dataset.or === 'stop') { pararLoopJogador(); o.onStop?.(); }
  });
  return m;
}
