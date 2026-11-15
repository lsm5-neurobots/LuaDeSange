/* ===== PET: Gato (tabby de telhado) ===== */
const PET_GATO=(function(){
  const {rad,ramp,lp,lerp,P2,mkPen,compose}=PIX;
  const FW=124, FH=92, GROUND=86, AX=62;
  const CFG={AX,GROUND,bodyY:56,shX:14,hipX:-15,fl:[10,10],hl:[10,11],neck:[17,-5],tailRoot:[-24,-5],paw:1.2,legY:3};
  const VARS={
    tabby:{nome:'Tabby cinza',fur:'#7c7884',stripe:'#46424f',far:'#5f5b69',cream:'#ddd4c6',eye:'#c9d84a'},
    laranja:{nome:'Laranja',fur:'#d88a3a',stripe:'#9a5420',far:'#a86828',cream:'#f4dcb4',eye:'#7ad86a'},
    preto:{nome:'Preto',fur:'#34303c',stripe:'#1e1a24',far:'#26222c',cream:'#4a4452',eye:'#ffd23f'},
  };
  const RIM='#a9c8f0';
  function mats(v){ const V=VARS[v]; return {
    fur:ramp(V.fur), stripe:ramp(V.stripe), far:ramp(V.far), cream:ramp(V.cream), iris:ramp(V.eye),
    ear:ramp('#d98a92'), nose:ramp('#c86a78'), mouth:['#8a2a34','#4a1420','#2a0c14','#14060a'],
    band:ramp('#b3263a'), tag:ramp('#c8b27a'), white:['#ffffff','#f4efe6','#c8c0b4','#8a8478'], pupil:['#3a3a3a','#141014','#0c080c','#040204'] }; }
  const REST={bx:0,by:0,tilt:0,head:0,jaw:0,tail:62,curl:22,ear:0,fN:[2,-2],fF:[-6,-4],bN:[16,-18],bF:[8,-24],eye:0,flash:0,brow:0,claw:0,alpha:1,shift:0};
  const ANIMS={
    idle:{nome:'Parado',n:4,dur:i=>[260,220,140,240][i],pose:i=>({by:[0,0.6,0.8,0.2][i],tail:[60,66,58,64][i],curl:[22,26,18,24][i],eye:i===2?1:0,ear:i===2?-6:0})},
    walk:{nome:'Andar',n:8,dur:()=>100,pose:i=>{ const p=i/8*Math.PI*2;
      const fl=ph=>{ const h=2+16*Math.sin(ph); return [h,h-24*Math.max(0,Math.cos(ph))-2]; };
      const hl=ph=>{ const h=12+14*Math.sin(ph); return [h,h-30-10*Math.max(0,-Math.cos(ph))]; };
      return {fN:fl(p),bN:hl(p+Math.PI*0.5),fF:fl(p+Math.PI),bF:hl(p+Math.PI*1.5),by:-1.4*Math.abs(Math.sin(2*p)),tilt:1.2*Math.sin(2*p),tail:62+6*Math.sin(2*p),curl:22+8*Math.sin(2*p+1)}; }},
    attack:{nome:'Patada',n:6,dur:i=>[140,220,70,130,130,150][i],pose:i=>[
      {brow:1,ear:-20,head:4},
      {brow:1,ear:-36,bx:-5,tilt:8,head:10,jaw:16,tail:80,curl:6,fN:[40,90],claw:1,bN:[26,-6]},
      {brow:1,ear:-30,bx:8,tilt:-10,head:-4,jaw:12,fN:[110,100],claw:1,bN:[-10,-36],bF:[-18,-40]},
      {brow:1,ear:-24,bx:10,tilt:-4,jaw:4,fN:[70,50],claw:1},
      {ear:-10,bx:5,fN:[20,0]},
      {}][i]},
    special:{nome:'Sumiço de telhado',n:6,dur:i=>[220,160,200,200,160,200][i],pose:i=>[
      {eye:2,tail:84,curl:30,ear:4},
      {eye:2,alpha:0.5,tail:84,curl:30},
      {alpha:0},
      {alpha:0.35,shift:46,eye:2},
      {alpha:1,shift:46,eye:2,tail:86,curl:34},
      {alpha:1,shift:46}][i]},
    hurt:{nome:'Dano',n:4,dur:i=>[80,130,130,160][i],pose:i=>[
      {flash:1,eye:1,bx:-3},
      {bx:-6,head:-18,tilt:8,ear:-40,eye:1,jaw:14,tail:96,curl:6},
      {bx:-5,head:-8,tilt:4,ear:-30,eye:1,tail:80},
      {bx:-2}][i]},
    ko:{nome:'Desmaio',n:6,dur:i=>[80,180,160,140,120,600][i],pose:i=>[
      {flash:1,eye:1},
      {eye:3,head:-14,tilt:-8,bx:-4,ear:-30},
      {eye:3,head:10,tilt:6,by:4,fN:[30,30],bN:[-10,-30],ear:-30},
      {eye:4,free:1,by:26,head:26,fN:[84,84],fF:[78,82],bN:[-80,-84],bF:[-74,-80],tail:0,curl:0,ear:-40,jaw:8},
      {eye:4,free:1,by:24,head:24,fN:[86,86],fF:[80,84],bN:[-82,-86],bF:[-76,-82],tail:0,curl:0,ear:-40,jaw:8},
      {eye:4,free:1,by:26,head:26,fN:[84,84],fF:[78,82],bN:[-80,-84],bF:[-74,-80],tail:0,curl:0,ear:-40,jaw:8}][i]},
  };
  function poseOf(anim,i){ return Object.assign({},REST,ANIMS[anim].pose(i)); }
  function drawBody(p,M,sk,V){ p.xf(sk.a,sk.base.x,sk.base.y);
    p.F(M.fur[1]); p.ell(-14,-1,11,9.4); p.ell(0,0,14,8.6); p.ell(13,-2,10,10);
    p.F(M.cream[1]); p.ell(15,1,6,7); p.F(M.fur[0]); p.ell(0,6,12,2.6);
    p.F(M.stripe[1]); [-16,-10,-4,2,8].forEach(x=>p.poly([[x,-9.4],[x+2.4,-9.6],[x+1.4,-2],[x,-2.4]]));
    p.id(); p.F(M.fur[1]); p.cap(sk.T(12,-4),sk.H(0,-4),11,9); }
  function drawHead(p,M,sk,P){
    p.xf(sk.ha,sk.neck.x,sk.neck.y);
    p.F(M.fur[1]); p.ell(2,-8,9.6,8.4); p.ell(4,-4,8,5);
    p.F(M.cream[1]); p.ell(9.4,-4.4,4.6,3.6);
    p.F(M.stripe[1]); [[-1,-15],[2,-16],[5,-15]].forEach(([x,y])=>p.rect(x,y,1,3)); p.rect(-6,-8,4,1); p.rect(-6,-5.6,4,1);
    p.F(M.nose[1]); p.poly([[12,-6.6],[14.6,-6.6],[13.4,-4.8]]);
    p.F(M.pupil[1]); p.rect(12.6,-4,1,1.6); p.rect(11.4,-2.6,1.4,0.8); p.rect(13.4,-2.6,1.4,0.8);
    if(P.jaw>4){ p.F(M.mouth[1]); p.poly([[9.6,-3],[14,-3.4],[13.4,-3+P.jaw*0.25],[10,-3+P.jaw*0.25]]); p.F(M.white[0]); p.rect(10,-3,0.8,1.4); p.rect(12.6,-3.2,0.8,1.4); }
    if(P.eye===0){ p.F(M.iris[1]); p.ell(6.6,-10,2.6,3); p.F(M.pupil[1]); p.rect(6.4,-12,1,4); p.F(M.white[0]); p.rect(5.4,-12,0.9,0.9); p.F(M.iris[2]); p.ell(11.4,-10,1.2,1.6); }
    else if(P.eye===1){ p.F(M.pupil[1]); p.rect(4.6,-9.6,4,0.9); }
    else if(P.eye===2){ p.F(M.pupil[1]); p.poly([[4.4,-9],[6.6,-11.2],[8.8,-9],[8,-9],[6.6,-10.2],[5.2,-9]]); }
    else if(P.eye===3){ p.F(M.pupil[1]); p.ell(6.6,-10,2.4,2.4); p.F(M.iris[1]); p.ell(6.6,-10,1.2,1.2); }
    else { p.F(M.pupil[1]); p.poly([[5,-12],[6,-12],[9,-8.6],[8,-8.6]]); p.poly([[8,-12],[9,-12],[6,-8.6],[5,-8.6]]); }
    if(P.brow){ p.F(M.stripe[2]); p.poly([[4,-14],[9,-12.4],[9,-11.6],[4,-13]]); }
    // bigodes
    p.F(M.white[0]); p.rect(12,-3.6,6,0.6); p.rect(12,-2.4,5.4,0.6); p.rect(-2,-3.8,4,0.6);
    // orelha da frente (rasgada)
    const q=sk.H(1,-15); p.xf(sk.ha+rad(P.ear),q.x,q.y);
    p.F(M.fur[1]); p.poly([[-4,1],[4,1],[1.4,-10]]); p.F(M.ear[1]); p.poly([[-1.6,0],[2.4,0],[1,-6]]);
    p.F(M.fur[3]); p.rect(1.4,-9.2,1.2,1.4);
    p.id(); }
  function drawEarFar(p,M,sk,P){ const q=sk.H(-4,-14); p.xf(sk.ha+rad(P.ear*0.8),q.x,q.y); p.F(M.far[1]); p.poly([[-3,1],[3,1],[0.6,-9]]); p.id(); }
  function drawBandana(p,M,sk){ p.xf(sk.a,sk.base.x,sk.base.y);
    p.F(M.band[1]); p.poly([[11,-9],[19,-7.4],[21,-5],[16,3],[11.6,-4]]);
    p.F(M.band[0]); p.rect(14,-5,1,1); p.rect(17,-3,1,1); p.rect(15,-1,1,1);
    p.F(M.band[2]); p.rect(8,-10,3,2); p.poly([[8,-9],[4,-12],[5,-7]]);
    p.F(M.tag[1]); p.ell(16,4.2,1.6,1.6);
    p.id(); }
  function drawClaws(p,M,sk,P){ if(!P.claw) return; const f=sk.legs.fN.f; p.id(); p.F(M.white[0]); for(let k=0;k<3;k++){ p.poly([[f.x+2,f.y-1+k*1.4],[f.x+6,f.y-2+k*1.6],[f.x+2.6,f.y+k*1.4]]); } }
  const cache=new Map();
  function frame(v,anim,fi,step=5){
    const K=PIX.getK(), key=v+anim+fi+step+'@'+K; if(cache.has(key)) return cache.get(key);
    const P=poseOf(anim,fi), V=VARS[v], M=mats(v), sk=PETCORE.skeleton(P,CFG), L=sk.legs;
    const tp=PETCORE.tailPts(sk.tailRoot,P,7,5);
    const parts=[
      {back:true,draw:(c,u)=>{ const p=mkPen(c,u); PETCORE.drawLeg(p,M.far[1],M.far[2],L.fF,5.4,4.2,2.8); PETCORE.drawLeg(p,M.far[1],M.far[2],L.bF,7,4.4,2.8); }},
      {back:true,draw:(c,u)=>drawEarFar(mkPen(c,u),M,sk,P)},
      {draw:(c,u)=>PETCORE.drawTail(mkPen(c,u),M.fur[1],M.stripe[1],tp,6,4,true,M.stripe[1])},
      {draw:(c,u)=>drawBody(mkPen(c,u),M,sk,V)},
      {draw:(c,u)=>{ const p=mkPen(c,u); PETCORE.drawLeg(p,M.fur[1],M.fur[1],L.bN,8,4.6,3.2); PETCORE.drawLeg(p,M.cream[1],M.cream[1],L.fN,5.8,4.6,3.2); }},
      {draw:(c,u)=>drawHead(mkPen(c,u),M,sk,P)},
      {draw:(c,u)=>drawBandana(mkPen(c,u),M,sk)},
      {draw:(c,u)=>drawClaws(mkPen(c,u),M,sk,P)},
    ];
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM});
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._mouth=sc(sk.H(14,-4)); cv._head=sc(sk.H(2,-20)); cv._paw=sc(L.fN.f); cv._center=sc(sk.base);
    cache.set(key,cv); return cv;
  }
  return {id:'gato',FW,FH,GROUND,AX,VARS,ANIMS,poseOf,frame,mats,RIM};
})();
