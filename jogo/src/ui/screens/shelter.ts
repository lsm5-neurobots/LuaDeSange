// Tela do abrigo: cena (fogueira, estruturas, atores), HUD, loop idle e painéis.
import { openBestiary } from '../shelter/bestiary';
import { openConquistas } from '../shelter/conquistas';
import { bindSettings } from '../widgets/settings';
import { bindDockKeys, dockHtml, markDock, updateDock } from '../shelter/dock';
import { openMarket } from '../shelter/market';
import { openRecrutas, openPets } from '../shelter/recrutas';
import { continuarLoop, loopBadgeHtml, openOfflineReport, pararLoopJogador, takePendingReport, watchAway } from '../shelter/offlineReport';
import type { OfflineReport } from '../../game/idleLoop';
import './shelter.css';
import { go, type Screen } from '../../core/router';
import { startLoop, type Loop } from '../../core/loop';
import { $, esc, h } from '../../core/dom';
import { on } from '../../core/events';
import { G, addLog, mutate, resetGame, save } from '../../game/state';
import { collect, lvl, tickObra, tickProduction } from '../../game/shelter';
import { tickUpkeep } from '../../game/upkeep';
import { pendingBloodMoons, resolvePendingAttacks, type AttackReport } from '../../game/bloodmoon';
import { ambienteAt, serverNow } from '../../game/worldClock';
import type { RewardSummary } from '../../game/rewards';
import type { Bag } from '../../data/resources';
import { RESOURCES } from '../../data/resources';
import { RECRUITS, PETS } from '../../data/recruits';
import { STRUCTS, STRUCT_IDS, type StructId } from '../../data/structures';
import { toast } from '../widgets/toast';
import { renderHud } from '../widgets/hud';
import { ShelterScene } from '../shelter/scene';
import {
  closeAllPanels, initPanels, openAttackReport, openBuild, openExpedition, openRepairs, openWeapons, openOficina, openGolpes, renderLog, renderRoster,
} from '../shelter/panels';

interface Params { intro?: 'chegada' | 'volta' | 'acender'; lider?: string; ataque?: AttackReport; recompensa?: RewardSummary; offline?: OfflineReport }

const plainBag = (b: Bag) =>
  Object.entries(b).filter(([, v]) => (v ?? 0) > 0).map(([k, v]) => `${RESOURCES[k as keyof typeof RESOURCES].nome} ${v}`).join(' · ');

export function shelterScreen(): Screen {
  let loop: Loop | null = null;
  let scene: ShelterScene | null = null;
  const offs: (() => void)[] = [];

  return {
    mount(root, params?: Params) {
      const p: Params = params ?? {};
      if (!G().hero) { go('create'); return; }
      const s0 = G();
      // modo loop: o tempo fora já foi simulado (boot ou aba escondida) e ultimaVisita = agora, então o bloco abaixo não conta de novo
      const offRep = p.offline ?? takePendingReport();

      // produção offline (máx. 8 h)
      const snap = () => {
        const o: Partial<Record<keyof typeof RESOURCES, number>> = {};
        for (const id of STRUCT_IDS) { const d = STRUCTS[id].prod; if (d) o[d.res] = (o[d.res] ?? 0) + (s0.prodBuf[id] ?? 0); }
        return o;
      };
      let offlineMsg = '';
      const mins = Math.min(480, (Date.now() - s0.ultimaVisita) / 60000);
      if (mins >= 1) {
        const antes = { agua: s0.res.agua, comida: s0.res.comida };
        tickUpkeep(s0, mins * 60000);
        const ga = Math.round(antes.agua - s0.res.agua), gc = Math.round(antes.comida - s0.res.comida);
        if (ga > 0 || gc > 0) addLog(s0, `Enquanto você estava fora, o abrigo consumiu ${ga} de água e ${gc} de comida.`);
        const before = snap();
        tickProduction(s0, mins);
        const after = snap();
        const gain: Bag = {};
        for (const k of Object.keys(after) as (keyof typeof RESOURCES)[]) { const d = Math.floor((after[k] ?? 0) - (before[k] ?? 0)); if (d > 0) gain[k] = d; }
        const t = Object.entries(gain).map(([k, v]) => `+${v} ${RESOURCES[k as keyof typeof RESOURCES].nome}`).join(', ');
        if (t) offlineMsg = `Enquanto você estava fora: ${t}`;
      }
      save();

      root.innerHTML = '';
      // Tela cheia (imersiva): a cena ocupa a viewport inteira e todos os menus flutuam por cima dela.
      const el = h(`<section class="sh">
        <div class="sh-stage">
          <div class="sh-view"><canvas class="pix" width="960" height="540" aria-label="Cena do abrigo"></canvas></div>
          <div class="sh-banner" aria-hidden="true">LUA DE SANGUE</div>
        </div>
        <header class="sh-hud" aria-label="Recursos"></header>
        <div class="sh-reward" hidden></div>
        <button class="btn sm sh-skip" type="button" hidden>Pular</button>
        <button class="cam u" type="button" aria-label="Câmera para cima">▲</button>
        <button class="cam l" type="button" aria-label="Câmera para a esquerda">◀</button>
        <button class="cam r" type="button" aria-label="Câmera para a direita">▶</button>
        <button class="cam d" type="button" aria-label="Câmera para baixo">▼</button>
        <div class="sh-tag" aria-live="polite"></div>
        <div class="sh-loop"></div>
        <nav class="sh-actions sh-dock" aria-label="Ações do abrigo">${dockHtml()}</nav>
        <aside class="sh-drawer" aria-label="Squad e diário">
          <button class="sh-dclose" type="button" data-a="drawer" aria-label="Fechar">×</button>
          <section><div class="lbl">Squad</div><div class="roster"></div></section>
          <section><div class="lbl">Diário</div><ul class="log"></ul></section>
          <div class="sh-foot"><button class="btn ghost sm" type="button" data-a="reset">Apagar progresso</button></div>
        </aside>
      </section>`);
      root.appendChild(el);
      bindSettings(el);

      const hud = $('.sh-hud', el), tag = $('.sh-tag', el), banner = $('.sh-banner', el), skip = $<HTMLButtonElement>('.sh-skip', el);
      const actions = $('.sh-actions', el), reward = $('.sh-reward', el);

      const sc = new ShelterScene($<HTMLCanvasElement>('canvas', el), {
        onStructClick(id) { sc.focusStruct(id); if (id === 'serralheria' && lvl(G(), id) > 0) openOficina(); else openBuild(id); },
        onCollect(id) {
          let got: Bag = {};
          mutate((s) => { got = collect(s, id); });
          const t = Object.entries(got).map(([k, v]) => `+${v} ${RESOURCES[k as keyof typeof RESOURCES].nome}`).join(' ');
          toast(t || 'Nada pra coletar');
        },
        onAttackStart() {
          banner.classList.remove('on'); void banner.offsetWidth; banner.classList.add('on');
          skip.hidden = false; actions.setAttribute('inert', '');
        },
        onAttackEnd(rep) {
          banner.classList.remove('on'); skip.hidden = true; actions.removeAttribute('inert');
          save(); refresh();
          openAttackReport(rep);
        },
        onIntroEnd() { refresh(); },
      });
      scene = sc;
      initPanels({ focus: (id: StructId) => sc.focusStruct(id) });

      const refresh = () => {
        const s = G();
        renderHud(hud, s);
        renderRoster($('.roster', el));
        renderLog($('.log', el));
        updateButtons();
        const lb = $('.sh-loop', el), html = loopBadgeHtml();
        if (lb.innerHTML !== html) lb.innerHTML = html;
      };
      $('.sh-loop', el).addEventListener('click', (e) => {
        const b = (e.target as HTMLElement).closest<HTMLElement>('[data-loop]');
        if (!b) return;
        if (b.dataset.loop === 'go') continuarLoop();
        else { pararLoopJogador(); toast('Loop parado.'); }
      });
      const updateButtons = () => updateDock(actions, G());
      offs.push(bindDockKeys(actions));

      // ações
      el.addEventListener('click', (e) => {
        const b = (e.target as HTMLElement).closest<HTMLElement>('[data-a]');
        if (!b) return;
        const a = b.dataset.a!;
        if (b.closest('.sh-dock') && a !== 'collect' && a !== 'drawer') markDock(actions, a);
        if (a === 'build') openBuild();
        else if (a === 'repair') openRepairs();
        else if (a === 'weapons') openWeapons();
        else if (a === 'golpes') openGolpes();
        else if (a === 'exp') openExpedition();
        else if (a === 'bestiary') openBestiary();
        else if (a === 'conquistas') openConquistas();
        else if (a === 'recrutas') openRecrutas();
        else if (a === 'pets') openPets();
        else if (a === 'market') openMarket();
        else if (a === 'drawer') {
          const open = el.classList.toggle('drawer-on');
          markDock(actions, 'drawer', open);
          el.querySelectorAll('[data-a=drawer]').forEach((x) => x.setAttribute('aria-expanded', String(open)));
        }
        else if (a === 'collect') {
          let got: Bag = {};
          mutate((s) => { got = collect(s); });
          toast('Coletado: ' + (plainBag(got) || 'nada'));
        } else if (a === 'reset') {
          if (!confirm('Apagar todo o progresso? Isso não pode ser desfeito.')) return;
          loop?.stop(); loop = null;
          void resetGame().then(() => go('landing'));
        }
      });
      $('.cam.l', el).addEventListener('click', () => sc.panBy(-140, 0));
      $('.cam.r', el).addEventListener('click', () => sc.panBy(140, 0));
      $('.cam.u', el).addEventListener('click', () => sc.panBy(0, -140));
      $('.cam.d', el).addEventListener('click', () => sc.panBy(0, 140));
      skip.addEventListener('click', () => sc.skipAttack());
      $('.sh-reward', el).addEventListener('click', (e) => { if ((e.target as HTMLElement).closest('.x')) reward.hidden = true; });

      offs.push(on('state:changed', () => { sc.syncActors(); refresh(); }));
      // aba escondida com o loop ligado: o tempo fora vira simulação offline (uma vez só)
      offs.push(watchAway({ onAway: (rep) => openOfflineReport(rep) }));

      // estado inicial da cena
      sc.syncActors('idle');
      refresh();
      if (p.ataque) { sc.setFire(true); sc.startAttack(p.ataque); }
      else if (p.intro === 'chegada' || p.intro === 'volta' || p.intro === 'acender') sc.startIntro(p.intro, p.lider);
      else sc.setFire(true);

      if (offRep) openOfflineReport(offRep);

      // resumo não bloqueante
      const lines: string[] = [];
      if (offlineMsg) { lines.push(offlineMsg); toast(offlineMsg, 4500); }
      const r = p.recompensa;
      if (r) {
        const l = plainBag(r.loot);
        lines.push(`<b>De volta da expedição.</b> Loot: ${l || 'nada'}${r.xp ? ` · +${r.xp} XP` : ''}`);
        if (r.ups.length) lines.push('Subiu de nível: ' + r.ups.join(', '));
        if (r.novoRecruta) lines.push(`Novo recruta: <b>${r.novoRecruta.nome}</b> (${RECRUITS[r.novoRecruta.tipo].nome}, nota <b>${r.novoRecruta.nota ?? 'C'}</b>)`);
        if (r.novoPet) lines.push(`Novo pet: <b>${r.novoPet.nome}</b> (${PETS[r.novoPet.tipo].nome}, nota <b>${r.novoPet.nota ?? 'C'}</b>)`);
        if (r.semCama) lines.push(`Achou um ${RECRUITS[r.semCama].nome}, mas não tem cama. Evolua a Barraca.`);
        if (r.projetosNovos.length) lines.push('Projeto novo: ' + r.projetosNovos.join(', '));
        for (const lb of r.lembrancas ?? []) lines.push(`Lembrança encontrada: <b>${esc(lb.nome)}</b>`);
        if (r.conquistas?.length) lines.push(`Conquista: <b>${r.conquistas.map(esc).join('</b>, <b>')}</b>`);
      }
      if (lines.length) {
        reward.innerHTML = `<button class="x" type="button" aria-label="Dispensar">×</button>${lines.map((x) => `<div>${x}</div>`).join('')}`;
        reward.hidden = false;
      }

      // Lua de Sangue pelo relógio real (LUA-10): 1 ataque por janela. No abrigo, a cena do ataque roda na hora;
      // quem estava fora vê o ataque ao voltar (depois da intro). Céu e clima seguem o relógio do mundo.
      const luaCheck = () => {
        const now = serverNow();
        sc.setAmbiente(ambienteAt(now, 'abrigo'));
        if (sc.attackOn || sc.introOn) return;
        const s = G();
        if (!pendingBloodMoons(s, now).length) return;
        let reps: AttackReport[] = [];
        mutate((st) => { reps = resolvePendingAttacks(st, now); });
        const rep = reps[reps.length - 1];
        if (rep) { closeAllPanels(); sc.setFire(true); sc.startAttack(rep); }
        else { banner.classList.remove('on'); void banner.offsetWidth; banner.classList.add('on'); toast('A Lua de Sangue nasceu. A horda ainda não achou o abrigo: faça a primeira expedição e prepare as defesas.', 5000); }
        save();
      };
      sc.setAmbiente(ambienteAt(serverNow(), 'abrigo'));

      // loop idle
      let saveAcc = 0, uiAcc = 0, lastTag = '';
      // 1º quadro só depois de trazer do disco (cache persistente) os sprites da cena — senão ele engasga gerando
      const begin = () => { if (scene !== sc || loop) return; loop = startLoop((dt) => {
        const s = G();
        tickProduction(s, dt / 60);
        tickUpkeep(s, dt * 1000);
        if (s.obra && Date.now() >= s.obra.fim) {
          const done: { id: StructId | null } = { id: null };
          mutate((st) => { done.id = tickObra(st); });
          if (done.id) { toast(`Obra pronta: ${STRUCTS[done.id].nome} nv ${lvl(G(), done.id)}`, 2800); sc.focusStruct(done.id); }
        }
        saveAcc += dt; uiAcc += dt;
        if (saveAcc > 5) { saveAcc = 0; save(); }
        if (uiAcc > 0.5) { uiAcc = 0; renderHud(hud, s); updateButtons(); luaCheck(); }
        sc.update(dt);
        sc.draw();
        if (sc.tag !== lastTag) { lastTag = sc.tag; tag.innerHTML = lastTag; }
      }); };
      void sc.prepare().then(begin, begin);
    },

    unmount() {
      loop?.stop(); loop = null;
      offs.splice(0).forEach((f) => f());
      scene?.dispose(); scene = null;
      closeAllPanels();
      save();
    },
  };
}
