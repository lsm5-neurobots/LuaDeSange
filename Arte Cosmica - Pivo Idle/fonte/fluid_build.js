// helpers de build pra fluidez: patch dos zumbis antigos (framePose) e dos zumbis PIX (framePose aditivo)
function oldZombiePose(s){
  const re=/function buildFrame\(form,anim,fi,step\)\{(\s*)const P=poseOf\(anim,fi\),/;
  if(!re.test(s)) throw new Error('buildFrame pattern');
  return s.replace(re,'function buildFrame(form,anim,fi,step,Pov){$1const P=Pov||poseOf(anim,fi),');
}
const OLD_RETURN='return {frame,ANIMS,FW,FH,GROUND,poseOf,mats,framePose:(function(){ const pc=new Map(); return function(form,anim,P,key){ const k=form+"|"+key; let c=pc.get(k); if(c){ pc.delete(k); pc.set(k,c); return c; } c=buildFrame(form,anim,0,5,Object.assign({},REST,P)); pc.set(k,c); if(pc.size>700) pc.delete(pc.keys().next().value); return c; }; })()};';
function pixPose(src){
  const re=/function frame\(form,anim,fi,step=5\)\{(\s*)const K=PIX\.getK\(\), key=form\+anim\+fi\+step\+'@'\+K;/;
  if(!re.test(src)) return src;
  src=src.replace(re,"function frame(form,anim,fi,step=5,Pov,pk){$1const K=PIX.getK(), key=(pk!=null?'#'+pk+'|'+form:form+anim+fi+step)+'@'+K;");
  src=src.replace("const P=poseOf(anim,fi), M=mats(form)","const P=Pov||poseOf(anim,fi), M=mats(form)");
  src=src.replace("return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame};","return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame,framePose:function(form,anim,P,key){ if(cache.size>1400) cache.delete(cache.keys().next().value); return frame(form,anim,0,5,P,key); }};");
  return src;
}
module.exports={oldZombiePose,OLD_RETURN,pixPose};
