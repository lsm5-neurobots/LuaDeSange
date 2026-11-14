// gera baus-cosmic.html (baús, chaves e puzzles)
const fs=require('fs'), path=require('path');
const D=path.join(__dirname,'..'), S=f=>fs.readFileSync(path.join(__dirname,f),'utf8');
const err=fs.readFileSync(path.join(D,'errante-cosmic.html'),'utf8');
const script=h=>h.split('<script>')[1].split('</script>')[0];
const CSS=err.match(/<style>[\s\S]*?<\/style>/)[0];
const es=script(err), BG=es.slice(es.indexOf('/* ---------- stage background'),es.indexOf('/* ---------- state & loop'));
const fill=(t,m)=>Object.entries(m).reduce((s,[k,v])=>s.split('{{'+k+'}}').join(v),t);
const out=fill(S('baus-page.html'),{CSS,BG,PIX:S('pix.js'),BATON:S('baton.js'),VIGIA:S('vigia.js'),BAU:S('baus.js'),PUZZLE:S('puzzle.js')});
fs.writeFileSync(path.join(D,'baus-cosmic.html'),out);
fs.writeFileSync(path.join(D,'chk_baus.js'),out.split('<script>').slice(1).map(x=>x.split('</script>')[0]).join('\n'));
console.log('baus-cosmic.html',(out.length/1024).toFixed(0)+' KB');
