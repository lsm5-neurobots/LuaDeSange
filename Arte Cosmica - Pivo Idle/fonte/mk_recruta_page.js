// helper: monta <id>-cosmic.html a partir de recruta-page.html (usado por build_serralheiro/pedreira/lenhador)
const fs=require('fs'), path=require('path');
const SRC=__dirname, D=path.join(__dirname,'..');
const script=h=>h.split('<script>')[1].split('</script>')[0];
module.exports=function(o){
  const err=fs.readFileSync(path.join(D,'errante-cosmic.html'),'utf8');
  const CSS=err.match(/<style>[\s\S]*?<\/style>/)[0];
  const sc=script(err), BG=sc.slice(sc.indexOf('/* ---------- stage background'),sc.indexOf('/* ---------- state & loop'));
  const png=fs.readFileSync('C:/Users/lucas/Desktop/CerebroNB/LuadeSangue/Herói e Recrutas da Lua de Sangue/recrutas/'+o.id+'.png').toString('base64');
  const m={CSS,BG,OLDPNG:png,PIX:fs.readFileSync(path.join(SRC,'pix.js'),'utf8'),BASE:fs.readFileSync(path.join(SRC,'recruta_base.js'),'utf8'),RJS:fs.readFileSync(path.join(SRC,o.id+'.js'),'utf8'),
    ID:o.id,NAME:o.name,VAR:o.v,APT:o.apt,LEDE:o.lede,FALA:o.fala,FW:o.FW,FH:o.FH,FW7:Math.round(o.FW*0.7),FH7:Math.round(o.FH*0.7),
    COMBAT:o.combat.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join(''),FICHA:o.ficha.map(x=>`<li>${x}</li>`).join('')};
  let t=fs.readFileSync(path.join(SRC,'recruta-page.html'),'utf8');
  Object.entries(m).forEach(([k,v])=>{ t=t.split('{{'+k+'}}').join(String(v)); });
  fs.writeFileSync(path.join(D,o.id+'-cosmic.html'),t);
  fs.writeFileSync(path.join(D,'chk_'+o.id+'.js'),t.split('<script>').slice(1).map(x=>x.split('</script>')[0]).join('\n'));
  console.log(o.id,(t.length/1024|0)+' KB');
};
