// Extrai as factories de arte (pipeline PIX) dos protótipos gerados em "Arte Cosmica - Pivo Idle"
// e grava dois pacotes isolados em public/art/: ART_EXP (expedição) e ART_HUB (herói, recrutas, pets, abrigo).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(here, '../../Arte Cosmica - Pivo Idle');
const OUT = path.resolve(here, '../public/art');
fs.mkdirSync(OUT, { recursive: true });

const script = (file) => {
  const h = fs.readFileSync(path.join(SRC, file), 'utf8');
  return h.replace(/\r\n/g, '\n').split('<script')[1].split('</script>')[0].replace(/^[^>]*>/, '');
};
function cutBefore(s, marker, file) {
  const i = s.indexOf(marker);
  if (i < 0) throw new Error(`marcador não encontrado em ${file}: ${marker.slice(0, 40)}`);
  return s.slice(0, i);
}
function pack(name, body, names) {
  const ret = names.map((n) => `${n}:typeof ${n}!=='undefined'?${n}:null`).join(',');
  return `/* gerado por tools/extract-art.mjs — não editar */\nwindow.${name}=(function(){\n${body}\nreturn {${ret}};\n})();\n`;
}

// ---------- expedição ----------
{
  const f = 'demos/expedicao-completa.html';
  const s = cutBefore(script(f), "(function(){\n'use strict';\nconst W=MAP.W", f);
  const names = ['PIX', 'TWEEN', 'GORE', 'BATON', 'VIGIA', 'ERR', 'RAS', 'COR', 'CUSP', 'GRIT', 'BARR', 'SALT', 'BRUT', 'ACOU', 'OBJ', 'BAU', 'PUZZLE', 'MAP'];
  fs.writeFileSync(path.join(OUT, 'art-exp.js'), pack('ART_EXP', s, names));
}

// ---------- hub (herói, recrutas, pets, abrigo) ----------
{
  const f = 'jogo.html';
  let s = cutBefore(script(f), "(function(){\n'use strict';\nPIX.setK(0.7);", f);
  // GUN: pistola e laser desenhados no mesmo referencial do BATON (eixo x = cano)
  const GUN = `
const GUN=(function(){
  const {P2}=PIX;
  const KINDS={
    pistola:{body:['#8a8a96','#4a4a56','#2a2a34','#16161e'],acc:['#c8a060','#8a6430','#5a3e18','#2e1e0a']},
    laser:{body:['#e8f4ff','#9ab8d8','#5a7898','#2a3a58'],acc:['#7af0ff','#2ad0f0','#1880a8','#0a4058']},
  };
  const TINT={comum:null,incomum:'#4fb06a',raro:'#4a8fe0',lunar:'#c8323a'};
  function draw(p,kind,tier,base,ang){
    const K=KINDS[kind]||KINDS.pistola, t=TINT[tier];
    p.xf(ang,base.x,base.y);
    p.F(K.acc[2]); p.rect(-2.5,0,4,6.5);
    p.F(K.body[1]); p.rect(-3,-2.6,kind==='laser'?17:14,4.6);
    p.F(K.body[0]); p.rect(-2,-2.6,kind==='laser'?15:12,1.1);
    p.F(K.body[2]); p.rect(kind==='laser'?13:10,-1.6,kind==='laser'?5:4,2.6);
    if(kind==='laser'){ p.F(K.acc[1]); p.rect(2,-1.4,8,1.6); p.F(K.acc[0]); p.ell(17.5,-0.4,1.4,1.4); }
    if(t){ p.F(t); p.rect(0,1,3,1); }
    p.id();
  }
  return {KINDS,draw};
})();
`;
  const bi = s.indexOf('const HEROI=');
  if (bi < 0) throw new Error('HEROI não encontrado');
  s = s.slice(0, bi) + GUN + s.slice(bi);
  // HEROI: raridade do bastão via cfg.tier e arma via cfg.arma
  const hs = s.indexOf('const HEROI='), he = s.indexOf('const VIGIA=', hs);
  let H = s.slice(hs, he);
  const n0 = H.length;
  H = H.replace("M=Object.assign(mats(c),BATON.TIERS.comum.M)", "M=Object.assign(mats(c),BATON.TIERS[c.tier||'comum'].M)")
       .replace("if(P.inhand) parts.push({draw:(cx,u)=>BATON.draw(mkPen(cx,u),'comum',sk.wrF,sk.bDir)});",
                "if(P.inhand) parts.push({draw:(cx,u)=>{ const a=c.arma||'bastao'; if(a==='bastao') BATON.draw(mkPen(cx,u),c.tier||'comum',sk.wrF,sk.bDir); else GUN.draw(mkPen(cx,u),a,c.tier||'comum',sk.wrF,-0.08); }});")
       .replace("BATON.TIERS.comum.len", "BATON.TIERS[c.tier||'comum'].len");
  if (H === s.slice(hs, he) || H.length === n0) console.warn('aviso: patch do HEROI pode não ter aplicado');
  for (const k of ["TIERS[c.tier||'comum'].M", 'GUN.draw', "TIERS[c.tier||'comum'].len"]) if (!H.includes(k)) throw new Error('patch HEROI falhou: ' + k);
  s = s.slice(0, hs) + H + s.slice(he);
  const names = ['PIX', 'BATON', 'GUN', 'HEROI', 'VIGIA', 'SERRALHEIRO', 'PEDREIRA', 'LENHADOR', 'CATA', 'AGRI', 'CAPO', 'ENFE',
    'PET_CACHORRO', 'PET_GATO', 'PET_CAPIVARA', 'JABU', 'PAPA', 'SAGU', 'CUSP', 'GRIT', 'BARR', 'ABRIGO'];
  fs.writeFileSync(path.join(OUT, 'art-hub.js'), pack('ART_HUB', s, names));
}
for (const f of fs.readdirSync(OUT)) console.log(f, (fs.statSync(path.join(OUT, f)).size / 1024).toFixed(0) + ' KB');
