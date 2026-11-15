// helper compartilhado pelos builds do Estalador e do Blindado (não altera build.js)
const fs=require('fs'), path=require('path');
module.exports=function(cfg){
  const D=path.join(__dirname,'..'), S=f=>fs.readFileSync(path.join(__dirname,f),'utf8'), A=f=>fs.readFileSync(path.join(D,f),'utf8');
  const script=h=>h.split('<script>')[1].split('</script>')[0];
  const err=A('errante-cosmic.html');
  const CSS=err.match(/<style>[\s\S]*?<\/style>/)[0];
  const es=script(err), BG=es.slice(es.indexOf('/* ---------- stage background'),es.indexOf('/* ---------- state & loop'));
  const old=fs.readFileSync('C:/Users/lucas/Desktop/CerebroNB/LuadeSangue/Zumbis da Lua de Sangue/sprites/'+cfg.slug+'.png').toString('base64');
  const m=Object.assign({CSS,PIX:S('pix.js'),ZJS:S(cfg.slug+'.js'),BG,OLDPNG:old},cfg.fill);
  let t=S('zpage-eb.html'); Object.entries(m).forEach(([k,v])=>{ t=t.split('{{'+k+'}}').join(v); });
  const out=path.join(D,cfg.slug+'-cosmic.html'); fs.writeFileSync(out,t);
  fs.writeFileSync(path.join(D,'chk_'+cfg.slug+'.js'),t.split('<script>').slice(1).map(x=>x.split('</script>')[0]).join('\n'));
  console.log(out,(t.length/1024|0)+' KB');
};
