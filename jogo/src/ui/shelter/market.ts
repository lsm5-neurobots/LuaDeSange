// Mercado do abrigo (feira de troca): chaves de baú, kits de cura, presentes de recrutamento, bônus e armas.
import { ITEM_MK, type ItemMk } from '../../data/market';
import { esc } from '../../core/dom';
import { G, mutate } from '../../game/state';
import { bagText } from '../../game/economy';
import { buy, buyBlock, itemCount, marketList } from '../../game/market';
import { toast } from '../widgets/toast';
import { itemImg, weaponImg } from '../../art/items';
import { live } from './panels';
import './market.css';

const CATS: [string, string][] = [['chaves', 'Chaves de baú'], ['consumiveis', 'Consumíveis'], ['armas', 'Armas']];

export function openMarket(): void {
  let tab = 'chaves';
  live({ title: 'Mercado', kicker: 'Feira de troca do abrigo', wide: true }, () => {
    const s = G(), list = marketList(s).filter((m) => m.cat === tab);
    const inv = (Object.keys(ITEM_MK) as ItemMk[]).filter((k) => itemCount(s, k) > 0)
      .map((k) => `<span class="mk-inv" style="--c:${ITEM_MK[k].cor}">${itemImg(k, 22)} ${esc(ITEM_MK[k].nome)} <b>×${itemCount(s, k)}</b></span>`).join('') || '<span class="lbl">Mochila vazia</span>';
    const cards = list.map((m) => {
      const bl = buyBlock(s, m.id), have = m.id.startsWith('arma_') ? s.armas.filter((a) => 'arma_' + a.familia === m.id).length : itemCount(s, m.id as ItemMk);
      return `<article class="mk-card" style="--c:${m.cor}">
        <div class="mk-ic">${m.id.startsWith('arma_') ? weaponImg(m.id.slice(5), 'comum', 48) : itemImg(m.id as ItemMk, 48)}</div>
        <div class="mk-txt"><b>${esc(m.nome)}</b><p>${esc(m.desc)}</p><small>Você tem: ${have}</small></div>
        <div class="mk-buy"><span class="cost">${bagText(m.preco, s.res)}</span><button class="btn" data-act="buy" data-id="${m.id}" ${bl ? 'disabled' : ''}>Comprar</button></div>
      </article>`;
    }).join('');
    return `<p class="mk-hint">Troque recursos por itens que a expedição usa sozinha. Chaves abrem baús na hora, kits curam o squad, presentes aumentam a chance de recrutar. No plano da expedição você escolhe o que levar.</p>
      <div class="mk-invs"><span class="lbl">Mochila do abrigo</span>${inv}</div>
      <div class="btabs">${CATS.map(([k, l]) => `<button class="btab" data-act="tab" data-id="${k}" aria-selected="${tab === k}">${l}</button>`).join('')}</div>
      <div class="mk-list">${cards || '<p class="lbl">Nada à venda aqui ainda. Vença mais mapas.</p>'}</div>`;
  }, (el) => {
    const a = el.dataset.act, id = el.dataset.id ?? '';
    if (a === 'tab') tab = id;
    else if (a === 'buy') {
      let ok = false;
      mutate((s) => { ok = buy(s, id); });
      toast(ok ? 'Comprado!' : 'Recursos insuficientes');
    }
  });
}
