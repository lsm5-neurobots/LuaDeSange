// Pré-aquecimento do hub no tempo livre da landing: o que a próxima tela (criação ou abrigo) desenha logo de cara.
// Na 1ª sessão gera (só o que cabe no quadro); da 2ª em diante o Warmer traz do cache persistente (IndexedDB).
import { HUB, withHubK } from '../art/legacy';
import { heroArt, petArt, recruitArt, type ActorArt } from '../art/sprites';
import { G, hasGame } from '../game/state';
import { equipped } from '../game/weapons';
import { sceneK } from './shelter/scene';
import type { WarmJob } from '../expedition/warm';
import { itemIconURL } from '../art/items';
import { RESOURCES, type ResId } from '../data/resources';

export function hubJobs(): WarmJob[] {
  const out: WarmJob[] = [], AB = HUB().ABRIGO;
  const actor = (id: string, art: ActorArt, K: number, anims: string[]) => {
    for (const an of anims) {
      const A = art.F.ANIMS[an];
      // c: palpite alto até medir (o 1º quadro de cada ator não pode estourar o quadro da landing)
      if (A) for (let fi = 0; fi < A.n; fi++) out.push({ k: `hub|${id}|${an}|${fi}@${K}`, g: 'hub:' + id + '@' + K, c: 12 * K * K, run: () => { withHubK(K, () => art.frame(an, fi)); } });
    }
  };
  const sprite = (id: string, nv: number) => out.push({ k: `ab|${id}|${nv}`, g: 'abrigo', c: 25, run: () => { AB.sprite(id, nv); } });
  const k1 = sceneK(1);
  // ícones do HUD (recursos, 20 px em tela = 40 px de imagem): o abrigo monta o HUD na hora em que abre
  for (const id of Object.keys(RESOURCES) as ResId[]) out.push({ k: `ic|${id}|40`, g: 'icone', c: 12, again: true, run: () => { itemIconURL(id, 40); } });
  if (hasGame()) {
    const s = G(), est = s.estruturas as Record<string, { nv: number } | undefined>;
    if (s.hero) { const w = equipped(s, 'hero'); actor('hero', heroArt(s.hero, { familia: w.familia, tier: w.tier }), k1, ['idle', 'walk']); }
    for (const r of s.recs) actor('rec' + r.id, recruitArt(r.tipo, r.skin), k1, ['idle', 'walk']);
    for (const p of s.pets) actor('pet' + p.id, petArt(p.tipo, p.variante), k1, ['idle', 'walk', 'fly']);
    for (const sl of AB.SLOTS as { id: string }[]) if (sl.id !== 'fogueira') { const nv = est[sl.id]?.nv ?? 0; sprite(nv ? sl.id : 'vazio', nv || 1); }
  } else {
    // criação: aparência padrão (mesma chave que a tela de criação pede), com zoom; abertura: escala normal
    const H = HUB().HEROI, art = heroArt({ ...H.DEFAULT, nome: 'Sobrevivente' }, { familia: 'bastao', tier: 'comum' });
    sprite('vazio', 1);
    actor('hero', art, k1, ['idle', 'walk']);
    actor('heroz', art, sceneK(2.4), ['idle']);
  }
  return out;
}
