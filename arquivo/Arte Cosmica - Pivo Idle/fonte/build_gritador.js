const fs=require('fs'),path=require('path');const D=path.join(__dirname,'..'),S=f=>fs.readFileSync(path.join(__dirname,f),'utf8'),A=f=>fs.readFileSync(path.join(D,f),'utf8');
const script=h=>h.split('<script>')[1].split('</script>')[0];const err=A('errante-cosmic.html');const CSS=err.match(/<style>[\s\S]*?<\/style>/)[0];
const e=script(err),BG=e.slice(e.indexOf('/* ---------- stage background'),e.indexOf('/* ---------- state & loop'));
const fill=(t,m)=>Object.entries(m).reduce((s,[k,v])=>s.split('{{'+k+'}}').join(v),t);
const png=fs.readFileSync('C:/Users/lucas/Desktop/CerebroNB/LuadeSangue/Zumbis da Lua de Sangue/sprites/gritador.png').toString('base64');
const out=fill(S('gritador-page.html'),{CSS,PIX:S('pix.js'),FAC:S('gritador.js'),BG,OLDPNG:png});
fs.writeFileSync(path.join(D,'gritador-cosmic.html'),out);fs.writeFileSync(path.join(D,'chk_gritador.js'),out.split('<script>').slice(1).map(x=>x.split('</script>')[0]).join('\n'));console.log('gritador',(out.length/1024|0)+'KB');
