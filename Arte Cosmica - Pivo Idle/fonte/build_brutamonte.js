// monta brutamonte-cosmic.html (mesmo esquema da linha do cuspidor em build.js) + Errante a 70% pra comparação de escala
const fs=require('fs'), path=require('path');
const D=path.join(__dirname,'..'), S=f=>fs.readFileSync(path.join(__dirname,f),'utf8'), A=f=>fs.readFileSync(path.join(D,f),'utf8');
const script=h=>h.split('<script>')[1].split('</script>')[0];
const err=A('errante-cosmic.html'), es=script(err);
const CSS=err.match(/<style>[\s\S]*?<\/style>/)[0];
const BG=es.slice(es.indexOf('/* ---------- stage background'),es.indexOf('/* ---------- state & loop'));
function errFactory(K){
  let s=es.replace(/^\s*\(function\(\)\{\s*'use strict';/,'');
  const m=s.match(/const FW=(\d+), FH=(\d+), GROUND=(\d+);/);
  s=s.replace(m[0],'const K='+K+', FW0='+m[1]+', FH0='+m[2]+', GROUND='+m[3]+', FW=Math.round(FW0*K), FH=Math.round(FH0*K);');
  s=s.replace('const xf=(a,ox,oy)=>{ const c=Math.cos(a), s=Math.sin(a); ctx.setTransform(c,s,-s,c,ox,oy); };','const xf=(a,ox,oy)=>{ const c=Math.cos(a), s=Math.sin(a); ctx.setTransform(c*K,s*K,-s*K,c*K,ox*K,oy*K); };').replace('const id=()=>ctx.setTransform(1,0,0,1,0,0);','const id=()=>ctx.setTransform(K,0,0,K,0,0);');
  s=s.replace(/y<(GROUND|G)-(\d+)/g,'y<($1-$2)*K');
  return 'const ERRF=(function(){\n'+s.slice(0,s.indexOf('/* ---------- stage background'))+'\nreturn {frame};\n})();';
}
const fill=(t,m)=>Object.entries(m).reduce((s,[k,v])=>s.split('{{'+k+'}}').join(v),t);
const png=fs.readFileSync('C:/Users/lucas/Desktop/CerebroNB/LuadeSangue/Zumbis da Lua de Sangue/sprites/brutamonte.png').toString('base64');
fs.writeFileSync(path.join(D,'brutamonte-cosmic.html'),fill(S('brutamonte-page.html'),{CSS,PIX:S('pix.js'),BRUT:S('brutamonte.js'),ERRF:errFactory(0.7),BG,OLDPNG:png}));
console.log('brutamonte-cosmic.html ok');
