// gera chorona-cosmic.html a partir de chorona-page.html (+ cabeçalho/estilo da página do Cuspidor)
const fs=require('fs'), path=require('path');
const D=path.join(__dirname,'..'), S=f=>fs.readFileSync(path.join(__dirname,f),'utf8'), A=f=>fs.readFileSync(path.join(D,f),'utf8');
const script=h=>h.split('<script>')[1].split('</script>')[0];
const err=A('errante-cosmic.html'), es=script(err);
const CSS=err.match(/<style>[\s\S]*?<\/style>/)[0];
const BG=es.slice(es.indexOf('/* ---------- stage background'),es.indexOf('/* ---------- state & loop'));
let head=S('cuspidor-page.html').split('<div class="wrap">')[0]
  .replace('<title>Cuspidor Nº 004</title>','<title>A Chorona M02</title>')
  .replace(/\.seg\.forms button\[data-form="enluarado"\][^<]*/, '.seg.forms button[data-form="furia"][aria-pressed="true"]{background:#ff3a3a;color:#fff}');
const png=fs.readFileSync('C:/Users/lucas/Desktop/CerebroNB/LuadeSangue/Zumbis da Lua de Sangue/sprites/chorona.png').toString('base64');
const fill=(t,m)=>Object.entries(m).reduce((s,[k,v])=>s.split('{{'+k+'}}').join(v),t);
fs.writeFileSync(path.join(D,'chorona-cosmic.html'),fill(head+S('chorona-page.html'),{CSS,PIX:S('pix.js'),CHOR:S('chorona.js'),BG,OLDPNG:png}));
const h=fs.readFileSync(path.join(D,'chorona-cosmic.html'),'utf8');
fs.writeFileSync(path.join(D,'chk_chorona.js'),h.split('<script>').slice(1).map(x=>x.split('</script>')[0]).join('\n'));
console.log('chorona-cosmic.html',(h.length/1024|0)+' KB');
