// monta saltador-cosmic.html (mesmo esquema da linha do cuspidor em build.js)
const fs=require('fs'), path=require('path');
const D=path.join(__dirname,'..'), S=f=>fs.readFileSync(path.join(__dirname,f),'utf8'), A=f=>fs.readFileSync(path.join(D,f),'utf8');
const script=h=>h.split('<script>')[1].split('</script>')[0];
const err=A('errante-cosmic.html'), es=script(err);
const CSS=err.match(/<style>[\s\S]*?<\/style>/)[0];
const BG=es.slice(es.indexOf('/* ---------- stage background'),es.indexOf('/* ---------- state & loop'));
const fill=(t,m)=>Object.entries(m).reduce((s,[k,v])=>s.split('{{'+k+'}}').join(v),t);
const png=fs.readFileSync('C:/Users/lucas/Desktop/CerebroNB/LuadeSangue/Zumbis da Lua de Sangue/sprites/saltador.png').toString('base64');
fs.writeFileSync(path.join(D,'saltador-cosmic.html'),fill(S('saltador-page.html'),{CSS,PIX:S('pix.js'),SALT:S('saltador.js'),BG,OLDPNG:png}));
console.log('saltador-cosmic.html ok');
