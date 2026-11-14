// monta abrigo-cosmic.html (mapa do abrigo + cena da fogueira)
const fs=require('fs'), path=require('path');
const D=path.join(__dirname,'..'), S=f=>fs.readFileSync(path.join(__dirname,f),'utf8');
const fill=(t,m)=>Object.entries(m).reduce((s,[k,v])=>s.split('{{'+k+'}}').join(v),t);
const out=fill(S('abrigo-page.html'),{PIX:S('pix.js'),BATON:S('baton.js'),HEROI:S('heroi.js'),ABRIGO:S('abrigo.js')});
fs.writeFileSync(path.join(D,'abrigo-cosmic.html'),out);
fs.writeFileSync(path.join(D,'chk_abrigo.js'),out.split('<script>').slice(1).map(x=>x.split('</script>')[0]).join('\n'));
console.log('abrigo-cosmic.html',(out.length/1024).toFixed(0)+' KB');
