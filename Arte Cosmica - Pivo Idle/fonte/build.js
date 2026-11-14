// monta vigia-cosmic.html, bastao-cosmic.html e demo-vigia.html a partir dos fontes + artefatos já publicados
const fs=require('fs'), path=require('path'); const FB=require('./fluid_build.js');
const D=path.join(__dirname,'..'), S=f=>fs.readFileSync(path.join(__dirname,f),'utf8'), A=f=>fs.readFileSync(path.join(D,f),'utf8');
const script=h=>h.split('<script>')[1].split('</script>')[0];
const err=A('errante-cosmic.html');
const CSS=err.match(/<style>[\s\S]*?<\/style>/)[0];
function zombieFactory(file,name,scaleK){
  let s=script(A(file)); s=s.replace(/^\s*\(function\(\)\{\s*'use strict';/,'');
  if(scaleK){ const m=s.match(/const FW=(\d+), FH=(\d+), GROUND=(\d+);/); if(!m) throw new Error('FW '+file);
    s=s.replace(m[0],'const K='+scaleK+', FW0='+m[1]+', FH0='+m[2]+', GROUND='+m[3]+', FW=Math.round(FW0*K), FH=Math.round(FH0*K);');
    const xf='const xf=(a,ox,oy)=>{ const c=Math.cos(a), s=Math.sin(a); ctx.setTransform(c,s,-s,c,ox,oy); };', id='const id=()=>ctx.setTransform(1,0,0,1,0,0);';
    if(!s.includes(xf)||!s.includes(id)) throw new Error('pen '+file);
    s=s.replace(xf,'const xf=(a,ox,oy)=>{ const c=Math.cos(a), s=Math.sin(a); ctx.setTransform(c*K,s*K,-s*K,c*K,ox*K,oy*K); };').replace(id,'const id=()=>ctx.setTransform(K,0,0,K,0,0);');
    s=s.replace(/y<(GROUND|G)-(\d+)/g,'y<($1-$2)*K'); }
  s=FB.oldZombiePose(s);
  const cut=s.indexOf('/* ---------- stage background'); if(cut<0) throw new Error('marker '+file);
  return `const ${name}=(function(){\n${s.slice(0,cut)}\n${FB.OLD_RETURN}\n})();`;
}
function mapFactory(){
  let s=script(A('marco-zero-fase.html')); s=s.replace(/^\s*\(function\(\)\{\s*'use strict';/,'');
  const cut=s.indexOf('const S={mode'); if(cut<0) throw new Error('map marker');
  return `const MAP=(function(){\n${s.slice(0,cut)}\nreturn {build,mid,drawFG,FGI,drawSky,AREAS,AID,WINDOWS,LAMPS,BULBS,W,H,BASE,WORLD,OUT};\n})();`;
}
const bgStart=script(err).indexOf('/* ---------- stage background'), bgEnd=script(err).indexOf('/* ---------- state & loop');
const BGCODE=script(err).slice(bgStart,bgEnd);
const PIXJ=S('pix.js')+'\n'+S('tween.js')+'\n'+S('gore.js'), BAT=S('baton.js'), VIG=S('vigia.js');
const oldPng=fs.readFileSync('C:/Users/lucas/Desktop/CerebroNB/LuadeSangue/Herói e Recrutas da Lua de Sangue/recrutas/vigia.png').toString('base64');
const fill=(t,m)=>Object.entries(m).reduce((s,[k,v])=>s.split('{{'+k+'}}').join(v),t);
fs.writeFileSync(path.join(D,'vigia-cosmic.html'),fill(S('vigia-page.html'),{CSS,PIX:PIXJ,BATON:BAT,VIGIA:VIG,BG:BGCODE,OLDPNG:oldPng}));
fs.writeFileSync(path.join(D,'bastao-cosmic.html'),fill(S('bastao-page.html'),{CSS,PIX:PIXJ,BATON:BAT,VIGIA:VIG}));
fs.writeFileSync(path.join(D,'demo-vigia.html'),fill(S('demo-page.html'),{PIX:PIXJ,BATON:BAT,VIGIA:VIG,ERR:zombieFactory('errante-cosmic.html','ERR',0.7),RAS:zombieFactory('rastejante-cosmic.html','RAS',0.7),COR:zombieFactory('corredor-cosmic.html','COR',0.7),MAP:mapFactory()}));
fs.writeFileSync(path.join(D,'cuspidor-cosmic.html'),fill(S('cuspidor-page.html'),{CSS,PIX:PIXJ,CUSP:S('cuspidor.js'),BG:BGCODE,OLDPNG:fs.readFileSync('C:/Users/lucas/Desktop/CerebroNB/LuadeSangue/Zumbis da Lua de Sangue/sprites/cuspidor.png').toString('base64')}));
['vigia-cosmic.html','bastao-cosmic.html','demo-vigia.html','cuspidor-cosmic.html'].forEach(f=>{ const h=fs.readFileSync(path.join(D,f),'utf8'); const js=h.split('<script>').slice(1).map(x=>x.split('</script>')[0]).join('\n'); fs.writeFileSync(path.join(D,'chk_'+f+'.js'),js); console.log(f,(h.length/1024).toFixed(0)+' KB'); });
