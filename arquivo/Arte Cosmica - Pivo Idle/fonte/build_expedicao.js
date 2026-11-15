// monta expedicao-cosmic.html: mapa + Vigia + zumbis (antigos escalados e novos PIX) + chefes + objetos/baús/puzzle (se existirem)
const fs=require('fs'), path=require('path'); const FB=require('./fluid_build.js');
const D=path.join(__dirname,'..'), S=f=>fs.readFileSync(path.join(__dirname,f),'utf8'), A=f=>fs.readFileSync(path.join(D,f),'utf8');
const opt=f=>fs.existsSync(path.join(__dirname,f))?S(f):'';
const script=h=>h.split('<script>')[1].split('</script>')[0];
function zombieFactory(file,name,scaleK){
  let s=script(A(file)); s=s.replace(/^\s*\(function\(\)\{\s*'use strict';/,'');
  const m=s.match(/const FW=(\d+), FH=(\d+), GROUND=(\d+);/); if(!m) throw new Error('FW '+file);
  s=s.replace(m[0],'const K='+scaleK+', FW0='+m[1]+', FH0='+m[2]+', GROUND='+m[3]+', FW=Math.round(FW0*K), FH=Math.round(FH0*K);');
  const xf='const xf=(a,ox,oy)=>{ const c=Math.cos(a), s=Math.sin(a); ctx.setTransform(c,s,-s,c,ox,oy); };', id='const id=()=>ctx.setTransform(1,0,0,1,0,0);';
  if(!s.includes(xf)||!s.includes(id)) throw new Error('pen '+file);
  s=s.replace(xf,'const xf=(a,ox,oy)=>{ const c=Math.cos(a), s=Math.sin(a); ctx.setTransform(c*K,s*K,-s*K,c*K,ox*K,oy*K); };').replace(id,'const id=()=>ctx.setTransform(K,0,0,K,0,0);');
  s=s.replace(/y<(GROUND|G)-(\d+)/g,'y<($1-$2)*K');
  s=FB.oldZombiePose(s);
  const cut=s.indexOf('/* ---------- stage background'); if(cut<0) throw new Error('marker '+file);
  return `const ${name}=(function(){\n${s.slice(0,cut)}\n${FB.OLD_RETURN}\n})();`;
}
function mapFactory(){
  let s=script(A('marco-zero-fase.html')); s=s.replace(/^\s*\(function\(\)\{\s*'use strict';/,'');
  const cut=s.indexOf('const S={mode'); if(cut<0) throw new Error('map marker');
  return `const MAP=(function(){\n${s.slice(0,cut)}\nreturn {build,mid,drawFG,FGI,drawSky,AREAS,AID,WINDOWS,LAMPS,BULBS,W,H,BASE,WORLD,OUT};\n})();`;
}
const fill=(t,m)=>Object.entries(m).reduce((s,[k,v])=>s.split('{{'+k+'}}').join(v),t);
const page=S('exp_head.html').replace('<title>Demo Vigia x Zumbis</title>','<title>Expedição Marco Zero</title>')+'\n'+S('expedicao-body.html');
const out=fill(page,{PIX:S('pix.js')+'\n'+S('tween.js')+'\n'+S('gore.js'),BATON:S('baton.js'),VIGIA:S('vigia.js'),
  ERR:zombieFactory('errante-cosmic.html','ERR',0.7),RAS:zombieFactory('rastejante-cosmic.html','RAS',0.7),COR:zombieFactory('corredor-cosmic.html','COR',0.7),
  CUSP:FB.pixPose(S('cuspidor.js')),GRIT:FB.pixPose(S('gritador.js')),BARR:FB.pixPose(S('barrigudo.js')),SALT:FB.pixPose(S('saltador.js')),BRUT:FB.pixPose(S('brutamonte.js')),ACOU:FB.pixPose(S('acougueiro.js')),
  OBJ:opt('objetos.js'),BAU:opt('baus.js'),PUZZLE:opt('puzzle.js'),MAP:mapFactory()});
fs.writeFileSync(path.join(D,'expedicao-cosmic.html'),out);
const js=out.split('<script>').slice(1).map(x=>x.split('</script>')[0]).join('\n'); fs.writeFileSync(path.join(D,'chk_exp.js'),js);
console.log('expedicao-cosmic.html',(out.length/1024).toFixed(0)+' KB', 'obj:',!!opt('objetos.js'),'bau:',!!opt('baus.js'),'pz:',!!opt('puzzle.js'));
