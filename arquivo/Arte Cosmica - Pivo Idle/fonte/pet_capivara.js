/* ===== PET: Capivara (calma demais pro apocalipse) ===== */
const PET_CAPIVARA=(function(){
  const {rad,ramp,lp,lerp,P2,mkPen,compose}=PIX;
  const FW=128, FH=92, GROUND=86, AX=58;
  const CFG={AX,GROUND,bodyY:58,shX:15,hipX:-17,fl:[8,7],hl:[8,8],neck:[20,-6],tailRoot:[-30,-4],paw:1.2,legY:6};
  const VARS={
    marrom:{nome:'Marrom',fur:'#8c5c36',dark:'#6b4428',light:'#a87648',snout:'#5c3a24',paw:'#4a3020'},
    ruiva:{nome:'Ruiva',fur:'#a8643a',dark:'#7a4424',light:'#c8884e',snout:'#6a3a20',paw:'#4a2a18'},
    escura:{nome:'Escura',fur:'#5e4634',dark:'#44322a',light:'#7a5c44',snout:'#3a2a20',paw:'#2a1e16'},
  };
  const RIM='#a9c8f0';
  function mats(v){ const V=VARS[v]; return {
    fur:ramp(V.fur), dark:ramp(V.dark), light:ramp(V.light), snout:ramp(V.snout), paw:ramp(V.paw),
    ear:ramp('#4a2c1c'), orange:ramp('#f08a1c'), leaf:ramp('#4f9a3a'), bag:ramp('#6e6a3a'), strap:ramp('#4a3020'), label:ramp('#e8dcb8'), cross:ramp('#d8373a'),
    eye:['#ffffff','#2a1a12','#1a100a','#0c0604'], white:['#ffffff','#f4efe6','#c8c0b4','#8a8478'], tongue:ramp('#e2707c') }; }
  const REST={bx:0,by:0,tilt:0,head:0,jaw:0,ear:0,fN:[4,-2],fF:[-4,-4],bN:[8,-8],bF:[2,-12],eye:0,flash:0,mex:0,mexX:0,mexY:0,tongue:0,tail:0,curl:0};
  const ANIMS={
    idle:{nome:'Parado',n:4,dur:i=>[300,260,260,300][i],pose:i=>({by:[0,-0.5,-0.6,0][i],head:[0,-1,-1,0][i],ear:i===2?-14:0,eye:i===3?1:0})},
    walk:{nome:'Gingado',n:8,dur:()=>150,pose:i=>{ const p=i/8*Math.PI*2;
      const fl=ph=>{ const h=4+12*Math.sin(ph); return [h,h-14*Math.max(0,Math.cos(ph))-2]; };
      const hl=ph=>{ const h=8+12*Math.sin(ph); return [h,h-16-6*Math.max(0,-Math.cos(ph))]; };
      return {fN:fl(p),bF:hl(p),fF:fl(p+Math.PI),bN:hl(p+Math.PI),by:-0.8*Math.abs(Math.sin(2*p)),tilt:2*Math.sin(2*p),head:-2*Math.sin(2*p),mex:6*Math.sin(2*p+0.6)}; }},
    attack:{nome:'Cabeçada',n:5,dur:i=>[160,280,80,150,180][i],pose:i=>[
      {},
      {bx:-5,tilt:6,head:18,ear:-20,by:1,mex:-12,fN:[-8,-14],bN:[16,-4]},
      {bx:8,tilt:-6,head:14,ear:-16,eye:1,mex:20,fN:[40,20],bN:[-10,-24]},
      {bx:10,tilt:-2,head:10,eye:1,mex:28,mexY:-3},
      {bx:4,mex:8}][i]},
    special:{nome:'Aura da calmaria',n:6,dur:i=>[200,240,260,260,260,260][i],pose:i=>[
      {},{eye:2,by:-0.4},{eye:2,by:-1},{eye:2,by:-0.6},{eye:2,by:-1},{eye:0}][i]},
    hurt:{nome:'Dano',n:4,dur:i=>[80,130,130,160][i],pose:i=>[
      {flash:1,eye:3,bx:-3},
      {bx:-5,head:-14,tilt:6,eye:1,ear:-16,mex:-18},
      {bx:-4,head:-6,tilt:3,eye:1,mex:-8},
      {bx:-1}][i]},
    ko:{nome:'Desmaio',n:6,dur:i=>[80,180,160,140,120,600][i],pose:i=>[
      {flash:1,eye:3},
      {eye:4,head:-10,tilt:-6,bx:-3,mex:-30,mexX:-4},
      {eye:4,head:8,tilt:4,by:3,mex:-80,mexX:-18,mexY:-14},
      {eye:5,free:1,by:14,head:16,fN:[84,84],fF:[78,82],bN:[-80,-84],bF:[-74,-80],mex:-180,mexX:-38,mexY:20,tongue:1},
      {eye:5,free:1,by:13,head:15,fN:[86,86],fF:[80,84],bN:[-82,-86],bF:[-76,-82],mex:-200,mexX:-42,mexY:21,tongue:1},
      {eye:5,free:1,by:14,head:16,fN:[84,84],fF:[78,82],bN:[-80,-84],bF:[-74,-80],mex:-200,mexX:-42,mexY:21,tongue:1}][i]},
  };
  function poseOf(anim,i){ return Object.assign({},REST,ANIMS[anim].pose(i)); }
  function drawBody(p,M,sk){ p.xf(sk.a,sk.base.x,sk.base.y);
    p.F(M.fur[1]); p.ell(-17,-4,15,14); p.ell(0,0,18,12); p.ell(15,-1,11,11);
    p.F(M.light[1]); p.ell(2,8,15,3.6);
    p.F(M.dark[1]); [[-20,-14],[-13,-15.6],[-6,-13.4],[2,-12],[9,-11]].forEach(([x,y])=>p.rect(x,y,3,1));
    p.id(); p.F(M.fur[1]); p.cap(sk.T(16,-4),sk.H(-1,-4),16,14); }
  function drawBag(p,M,sk){ p.xf(sk.a,sk.base.x,sk.base.y);
    p.F(M.strap[1]); p.poly([[10,-11],[13,-11],[-6,6],[-9,6]]);
    p.F(M.bag[1]); p.poly([[-12,-2],[4,-3],[5,10],[-11,11]]);
    p.F(M.bag[2]); p.poly([[-12,-2],[4,-3],[4.4,2],[-11.6,3]]); p.F(M.label[1]); p.rect(-2,-1.4,1.2,1.2);
    p.F(M.label[1]); p.rect(-8,4,7,5); p.F(M.cross[1]); p.rect(-5.4,4.6,1.6,3.8); p.rect(-6.8,5.8,4.4,1.4);
    p.id(); }
  function drawHead(p,M,sk,P){
    p.xf(sk.ha,sk.neck.x,sk.neck.y);
    p.F(M.fur[1]); p.poly([[-6,-16],[14,-16],[19,-13],[20,-2],[16,1],[-4,1],[-7,-6]]);
    p.F(M.light[1]); p.ell(4,-4,6,3.6);
    p.F(M.snout[1]); p.poly([[11,-15.4],[18.4,-13.4],[19.6,-2.4],[15.6,0.4],[11,0]]);
    p.F(M.eye[3]); p.rect(15.4,-12.4,3,1.4); p.rect(17,-4,2.4,0.9); p.rect(13.4,-3,1,1); p.rect(12,-5,1,1); p.rect(13.6,-6.4,1,1);
    if(P.tongue){ p.F(M.tongue[1]); p.rect(16.4,-3.6,2,3); }
    if(P.eye===0){ p.F(M.eye[1]); p.ell(7.4,-12.6,1.8,1.8); p.F(M.white[0]); p.rect(6.8,-13.4,0.9,0.9); p.F(M.fur[2]); p.rect(5.4,-14.4,4.2,1.6); }
    else if(P.eye===1||P.eye===2){ p.F(M.eye[3]); if(P.eye===2) p.poly([[5.6,-12],[7.4,-13.2],[9.2,-12],[8.6,-11.6],[7.4,-12.4],[6.2,-11.6]]); else p.rect(5.6,-12.4,3.6,0.9); }
    else if(P.eye===3){ p.F(M.white[1]); p.ell(7.4,-12.6,2.4,2.2); p.F(M.eye[1]); p.ell(7.6,-12.6,1.2,1.2); }
    else if(P.eye===4){ p.F(M.eye[3]); p.ell(7.4,-12.6,2.2,2.2); p.F(M.white[1]); p.ell(7.4,-12.6,1.1,1.1); }
    else { p.F(M.eye[3]); p.poly([[6,-14],[7,-14],[9.6,-11],[8.6,-11]]); p.poly([[8.6,-14],[9.6,-14],[7,-11],[6,-11]]); }
    const q=sk.H(-2,-15.6); p.xf(sk.ha+rad(P.ear),q.x,q.y); p.F(M.fur[1]); p.ell(0,-1.6,3.4,3); p.F(M.ear[1]); p.ell(0.4,-1.4,1.8,1.6);
    p.id(); }
  function drawEarFar(p,M,sk,P){ const q=sk.H(-5,-15); p.xf(sk.ha+rad(P.ear),q.x,q.y); p.F(M.dark[1]); p.ell(0,-1.6,3.2,2.8); p.id(); }
  function drawMex(p,M,sk,P){ const q=sk.H(3+P.mexX,-19+P.mexY); p.xf(sk.ha+rad(P.mex),q.x,q.y);
    p.F(M.orange[1]); p.ell(0,0,5,4.4); p.F(M.orange[0]); p.rect(-2.6,-2.6,2,1); p.F(M.orange[2]); [[-2,1],[1,2],[2,-1]].forEach(([x,y])=>p.rect(x,y,0.8,0.8));
    p.F(M.leaf[1]); p.rect(-0.4,-5.6,1,2); p.poly([[0.6,-5.4],[4.4,-6.6],[2.4,-4]]);
    p.id(); }
  const cache=new Map();
  function frame(v,anim,fi,step=5){
    const K=PIX.getK(), key=v+anim+fi+step+'@'+K; if(cache.has(key)) return cache.get(key);
    const P=poseOf(anim,fi), M=mats(v), sk=PETCORE.skeleton(P,CFG), L=sk.legs;
    const parts=[
      {back:true,draw:(c,u)=>{ const p=mkPen(c,u); PETCORE.drawLeg(p,M.dark[1],M.paw[1],L.fF,8,7,4); PETCORE.drawLeg(p,M.dark[1],M.paw[1],L.bF,10,7.4,4); }},
      {back:true,draw:(c,u)=>drawEarFar(mkPen(c,u),M,sk,P)},
      {draw:(c,u)=>drawBody(mkPen(c,u),M,sk)},
      {draw:(c,u)=>{ const p=mkPen(c,u); PETCORE.drawLeg(p,M.fur[1],M.paw[1],L.bN,11,8,4.4); PETCORE.drawLeg(p,M.fur[1],M.paw[1],L.fN,9,7.6,4.4); }},
      {draw:(c,u)=>drawBag(mkPen(c,u),M,sk)},
      {draw:(c,u)=>drawHead(mkPen(c,u),M,sk,P)},
      {draw:(c,u)=>drawMex(mkPen(c,u),M,sk,P)},
    ];
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM});
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._mouth=sc(sk.H(20,-6)); cv._head=sc(sk.H(4,-22)); cv._paw=sc(L.fN.f); cv._center=sc(sk.base);
    cache.set(key,cv); return cv;
  }
  return {id:'capivara',FW,FH,GROUND,AX,VARS,ANIMS,poseOf,frame,mats,RIM};
})();
