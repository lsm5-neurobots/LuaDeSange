// monta pet_sagui-cosmic.html
const fs=require('fs'), path=require('path');
const D=path.join(__dirname,'..'), S=f=>fs.readFileSync(path.join(__dirname,f),'utf8');
const script=h=>h.split('<script>')[1].split('</script>')[0];
const err=fs.readFileSync(path.join(D,'errante-cosmic.html'),'utf8'), es=script(err);
const CSS=err.match(/<style>[\s\S]*?<\/style>/)[0], BG=es.slice(es.indexOf('/* ---------- stage background'),es.indexOf('/* ---------- state & loop'));
const png=fs.readFileSync('C:/Users/lucas/Desktop/CerebroNB/LuadeSangue/Pets da Lua de Sangue/sprites/sagui.png').toString('base64');
const fill=(t,m)=>Object.entries(m).reduce((s,[k,v])=>s.split('{{'+k+'}}').join(v),t);
const out=fill(S('pet_sagui-page.html'),{CSS,BG,PIX:S('pix.js'),BATON:S('baton.js'),VIGIA:S('vigia.js'),PETJS:S('pet_sagui.js'),OLDPNG:png});
fs.writeFileSync(path.join(D,'pet_sagui-cosmic.html'),out);
fs.writeFileSync(path.join(D,'chk_pet_sagui.js'),out.split('<script>').slice(1).map(x=>x.split('</script>')[0]).join('\n'));
console.log('pet_sagui-cosmic.html',(out.length/1024|0)+' KB');
