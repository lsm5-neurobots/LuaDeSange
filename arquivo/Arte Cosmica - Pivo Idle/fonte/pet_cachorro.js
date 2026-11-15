/* ===== PET: Cachorro (vira-lata caramelo) ===== */
const PET_CACHORRO=(function(){
  const {rad,ramp,lp,lerp,P2,mkPen,compose}=PIX;
  const FW=124, FH=92, GROUND=86, AX=64;
  const CFG={AX,GROUND,bodyY:52,shX:15,hipX:-17,fl:[11,11],hl:[11,12],neck:[19,-6],tailRoot:[-27,-5],paw:1.5,legY:4};
  const VARS={
    caramelo:{nome:'Caramelo',fur:'#c98a3e',dark:'#9c5f28',far:'#7d4a20',cream:'#f0d6a4'},
    malhado:{nome:'Malhado P&B',fur:'#e8e2d6',dark:'#2c2a30',far:'#9a948a',cream:'#ffffff',spots:true},
    pretinho:{nome:'Pretinho',fur:'#3a3438',dark:'#24202a',far:'#1c181e',cream:'#c8a070'},
  };
  const RIM='#a9c8f0';
  function mats(v){ const V=VARS[v]; return {
    fur:ramp(V.fur), dark:ramp(V.dark), far:ramp(V.far), cream:ramp(V.cream),
    ear:ramp('#8a4a2a'), nose:['#6a6070','#2a1a1c','#1a1012','#0c0608'], tongue:ramp('#e2707c'), mouth:['#6a2a34','#3a1420','#240c14','#14060a'],
    eye:['#ffffff','#4a2a14','#2a160a','#140a04'], band:ramp('#b3263a'), tag:ramp('#cfc6b0'), white:['#ffffff','#f4efe6','#c8c0b4','#8a8478'] }; }
  const REST={bx:0,by:0,tilt:0,head:0,jaw:4,tongue:1,tail:44,curl:16,ear:0,fN:[4,-2],fF:[-5,-6],bN:[16,-16],bF:[8,-22],eye:0,flash:0,brow:0};
  const ANIMS={
    idle:{nome:'Parado',n:4,dur:()=>200,pose:i=>({by:[0,-0.6,-0.8,-0.2][i],jaw:[3,7,8,4][i],tail:[34,48,40,54][i],ear:[0,2,0,-2][i]})},
    walk:{nome:'Trotar',n:8,dur:()=>90,pose:i=>{ const p=i/8*Math.PI*2, f=ph=>({h:4+18*Math.sin(ph)}), A=p, B=p+Math.PI;
      const fl=ph=>{ const h=4+18*Math.sin(ph); return [h,h-26*Math.max(0,Math.cos(ph))-2]; };
      const hl=ph=>{ const h=12+16*Math.sin(ph); return [h,h-30-12*Math.max(0,-Math.cos(ph))]; };
      return {fN:fl(A),bF:hl(A),fF:fl(B),bN:hl(B),by:-1.2*Math.abs(Math.sin(2*p)),tilt:1.5*Math.sin(2*p),head:-2*Math.sin(2*p),tail:44+14*Math.sin(4*p),jaw:8,tongue:1}; }},
    attack:{nome:'Mordida',n:5,dur:i=>[140,200,70,140,160][i],pose:i=>[
      {brow:1,ear:4,head:4,jaw:2,tongue:0},
      {brow:1,bx:-5,tilt:7,head:12,jaw:8,tongue:0,ear:-6,fN:[-6,-10],bN:[24,-10],tail:20},
      {brow:1,bx:9,tilt:-12,head:-6,jaw:32,tongue:0,fN:[62,40],fF:[50,30],bN:[-14,-34],bF:[-22,-40],free:0},
      {brow:1,bx:11,tilt:-4,head:2,jaw:0,tongue:0,fN:[30,10],fF:[20,6]},
      {bx:4,jaw:6}][i]},
    special:{nome:'Latido de alerta',n:6,dur:i=>[160,160,200,220,160,160][i],pose:i=>[
      {ear:10,head:-4,tail:60},
      {ear:12,tilt:-6,head:-10,tail:72,jaw:2,tongue:0,by:-1},
      {ear:12,tilt:-8,head:-16,tail:74,jaw:28,tongue:0,by:-2},
      {ear:12,tilt:-12,head:-20,tail:78,jaw:32,tongue:0,by:-3,fN:[46,24]},
      {ear:8,tilt:-4,head:-8,tail:64,jaw:8},
      {}][i]},
    hurt:{nome:'Dano',n:4,dur:i=>[80,130,130,160][i],pose:i=>[
      {flash:1,eye:1,bx:-3},
      {bx:-6,head:-20,tilt:6,ear:10,eye:1,tail:-50,curl:-10,fN:[30,10],jaw:10,tongue:0},
      {bx:-5,head:-10,tilt:4,eye:1,tail:-40,curl:-8},
      {bx:-2}][i]},
    ko:{nome:'Desmaio',n:6,dur:i=>[80,180,160,140,120,600][i],pose:i=>[
      {flash:1,eye:1},
      {eye:3,head:-12,tilt:-8,bx:-3,jaw:14,tongue:2},
      {eye:3,head:8,tilt:6,by:4,fN:[30,30],bN:[-10,-30],jaw:14,tongue:2},
      {eye:2,free:1,by:24,head:30,tilt:2,fN:[84,84],fF:[78,82],bN:[-80,-84],bF:[-74,-80],tail:-6,curl:0,jaw:14,tongue:2},
      {eye:2,free:1,by:22,head:28,tilt:2,fN:[86,86],fF:[80,84],bN:[-82,-86],bF:[-76,-82],tail:-6,curl:0,jaw:14,tongue:2},
      {eye:2,free:1,by:24,head:30,tilt:2,fN:[84,84],fF:[78,82],bN:[-80,-84],bF:[-74,-80],tail:-6,curl:0,jaw:14,tongue:2}][i]},
  };
  function poseOf(anim,i){ return Object.assign({},REST,ANIMS[anim].pose(i)); }
  function drawBody(p,M,sk,V){ p.xf(sk.a,sk.base.x,sk.base.y);
    p.F(M.fur[1]); p.ell(-16,-1,13,11); p.ell(0,1,16,10); p.ell(15,-3,12,12);
    p.F(M.cream[1]); p.ell(2,7,14,3.4); p.ell(18,2,7,8);
    p.F(M.dark[1]); p.ell(-2,-9,17,2.6);
    if(V.spots){ p.F(M.dark[1]); p.ell(-14,-3,6,5); p.ell(4,-4,5,4); }
    p.id(); p.F(M.fur[1]); p.cap(sk.T(14,-4),sk.H(0,-4),13,11); }
  function drawHead(p,M,sk,P,V){
    p.xf(sk.ha,sk.neck.x,sk.neck.y);
    p.F(M.fur[1]); p.ell(2,-9,10,9);
    if(V.spots){ p.F(M.dark[1]); p.ell(-1,-12,6,5); }
    p.F(M.cream[1]); p.poly([[5,-10],[17,-8.6],[19,-5],[17,-2],[6,-1]]);
    p.F(M.cream[2]); p.rect(7,-10,9,1);
    p.F(M.nose[1]); p.ell(18.4,-7.4,2.1,1.9); p.F(M.nose[0]); p.rect(18,-8.6,1,0.8);
    // olho
    if(P.eye===0){ p.F(M.white[1]); p.ell(6.4,-11.6,2.3,2.1); p.F(M.eye[1]); p.ell(7,-11.4,1.6,1.6); p.F(M.eye[3]); p.rect(7,-11.6,1,1); p.F(M.white[0]); p.rect(6.2,-12.6,0.9,0.9); }
    else if(P.eye===1){ p.F(M.eye[3]); p.rect(4.8,-11.4,3.6,0.9); }
    else if(P.eye===2){ p.F(M.eye[3]); p.poly([[5,-13],[6,-13],[9,-10],[8,-10]]); p.poly([[8,-13],[9,-13],[6,-10],[5,-10]]); }
    else { p.F(M.eye[3]); p.ell(6.8,-11.4,2.2,2.2); p.F(M.white[1]); p.ell(6.8,-11.4,1.2,1.2); p.F(M.eye[3]); p.rect(6.6,-11.6,0.6,0.6); }
    p.F(P.brow?M.dark[2]:M.cream[1]); if(P.brow) p.poly([[4,-15],[9,-13.4],[9,-12.6],[4,-14]]); else p.rect(4.8,-14.6,3,1.1);
    // orelha da frente (semicaída)
    const e=rad(P.ear*3); p.xf(sk.ha+e,sk.H(-2,-15).x,sk.H(-2,-15).y);
    p.F(M.fur[1]); p.poly([[-3,1],[4,0],[2,-8],[0,-8.4]]);
    p.F(M.ear[1]); p.poly([[-1,0],[2.4,-0.4],[1.2,-5.6]]);
    if(P.ear<8){ p.F(M.fur[2]); p.poly([[1,-8],[5,-6.4],[2.4,-5]]); }
    p.id(); }
  function drawEarFar(p,M,sk,P){ const q=sk.H(-4,-14); p.xf(sk.ha+rad(P.ear*2),q.x,q.y); p.F(M.far[1]); p.poly([[-3,1],[3,0],[0,-8]]); p.id(); }
  function drawJaw(p,M,sk,P){ const h=sk.H(6,-2.6); p.xf(sk.ha+rad(P.jaw),h.x,h.y);
    p.F(M.mouth[1]); p.poly([[0,-1],[11,-1.6],[11,1],[1,1.6]]);
    p.F(M.cream[1]); p.poly([[0,0.4],[11,0],[10.4,3],[1,3.4]]);
    p.F(M.white[0]); p.rect(9.4,-1.2,1,1.2);
    if(P.tongue){ p.F(M.tongue[1]); const L=P.tongue>1?9:6; p.poly([[4,0.6],[8,0.4],[8.4,L],[5,L+0.6]]); p.F(M.tongue[2]); p.rect(6,1.4,0.8,L-2); }
    p.id(); }
  function drawBandana(p,M,sk){ p.xf(sk.a,sk.base.x,sk.base.y);
    p.F(M.band[1]); p.poly([[12,-11],[22,-9],[24,-6],[18,4],[13,-5]]);
    p.F(M.band[2]); p.rect(14,-11,9,1.4); p.F(M.band[0]); p.rect(16,-6,1,1); p.rect(19,-3,1,1);
    p.F(M.tag[1]); p.ell(17.6,5.6,1.8,1.8); p.F(M.white[0]); p.rect(17,4.8,0.8,0.8);
    p.id(); }
  const cache=new Map();
  function frame(v,anim,fi,step=5){
    const K=PIX.getK(), key=v+anim+fi+step+'@'+K; if(cache.has(key)) return cache.get(key);
    const P=poseOf(anim,fi), V=VARS[v], M=mats(v), sk=PETCORE.skeleton(P,CFG), L=sk.legs;
    const tp=PETCORE.tailPts(sk.tailRoot,P,5,4.6);
    const parts=[
      {back:true,draw:(c,u)=>{ const p=mkPen(c,u); PETCORE.drawLeg(p,M.far[1],M.far[2],L.fF,6.4,5,3.2); PETCORE.drawLeg(p,M.far[1],M.far[2],L.bF,8,5,3.2); }},
      {back:true,draw:(c,u)=>drawEarFar(mkPen(c,u),M,sk,P)},
      {draw:(c,u)=>PETCORE.drawTail(mkPen(c,u),M.fur[1],M.cream[1],tp,7,3)},
      {draw:(c,u)=>drawBody(mkPen(c,u),M,sk,V)},
      {draw:(c,u)=>{ const p=mkPen(c,u); PETCORE.drawLeg(p,M.fur[1],M.cream[1],L.bN,9,5.4,3.6); PETCORE.drawLeg(p,M.fur[1],M.cream[1],L.fN,7,5.6,3.6); }},
      {draw:(c,u)=>drawHead(mkPen(c,u),M,sk,P,V)},
      {draw:(c,u)=>drawJaw(mkPen(c,u),M,sk,P)},
      {draw:(c,u)=>drawBandana(mkPen(c,u),M,sk)},
    ];
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM});
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._mouth=sc(sk.H(19,-3)); cv._head=sc(sk.H(2,-20)); cv._paw=sc(L.fN.f); cv._center=sc(sk.base);
    cache.set(key,cv); return cv;
  }
  return {id:'cachorro',FW,FH,GROUND,AX,VARS,ANIMS,poseOf,frame,mats,RIM};
})();
