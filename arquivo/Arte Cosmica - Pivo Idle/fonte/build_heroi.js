// monta heroi-cosmic.html (criação do recruta inicial)
const fs=require('fs'), path=require('path');
const D=path.join(__dirname,'..'), S=f=>fs.readFileSync(path.join(__dirname,f),'utf8'), A=f=>fs.readFileSync(path.join(D,f),'utf8');
const script=h=>h.split('<script>')[1].split('</script>')[0];
const err=A('errante-cosmic.html'), es=script(err);
const CSS=err.match(/<style>[\s\S]*?<\/style>/)[0];
const BG=es.slice(es.indexOf('/* ---------- stage background'),es.indexOf('/* ---------- state & loop'));
const fill=(t,m)=>Object.entries(m).reduce((s,[k,v])=>s.split('{{'+k+'}}').join(v),t);
const out=fill(S('heroi-page.html'),{CSS,PIX:S('pix.js'),BATON:S('baton.js'),HEROI:S('heroi.js'),BG});
fs.writeFileSync(path.join(D,'heroi-cosmic.html'),out);
fs.writeFileSync(path.join(D,'chk_heroi.js'),out.split('<script>').slice(1).map(x=>x.split('</script>')[0]).join('\n'));
console.log('heroi-cosmic.html',(out.length/1024).toFixed(0)+' KB');
