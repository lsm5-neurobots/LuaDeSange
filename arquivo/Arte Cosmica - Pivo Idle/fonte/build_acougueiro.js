// gera acougueiro-cosmic.html (não mexe em build.js)
const fs=require('fs'), path=require('path');
const D=path.join(__dirname,'..'), S=f=>fs.readFileSync(path.join(__dirname,f),'utf8');
const err=fs.readFileSync(path.join(D,'errante-cosmic.html'),'utf8');
const script=h=>h.split('<script>')[1].split('</script>')[0];
const CSS=err.match(/<style>[\s\S]*?<\/style>/)[0];
const es=script(err), BG=es.slice(es.indexOf('/* ---------- stage background'),es.indexOf('/* ---------- state & loop'));
const OLD=fs.readFileSync('C:/Users/lucas/Desktop/CerebroNB/LuadeSangue/Zumbis da Lua de Sangue/sprites/acougueiro.png').toString('base64');
const map={CSS,PIX:S('pix.js'),ACOU:S('acougueiro.js'),BG,OLDPNG:OLD};
const out=Object.entries(map).reduce((s,[k,v])=>s.split('{{'+k+'}}').join(v),S('acougueiro-page.html'));
fs.writeFileSync(path.join(D,'acougueiro-cosmic.html'),out);
fs.writeFileSync(path.join(D,'chk_acou.js'),out.split('<script>').slice(1).map(x=>x.split('</script>')[0]).join('\n'));
console.log('acougueiro-cosmic.html',(out.length/1024|0)+' KB');
