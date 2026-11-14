/* ===== BRUTAMONTE (mini chefe M01): massa de músculo do tamanho de uma porta ===== */
const BRUT=(function(){
  const {rad,lp,lerp,P2,mkPen,compose}=PIX;
  const FW=244, FH=228, GROUND=220, AX=96;
  const RIM={normal:'#c8d8f0', furia:'#ff8a60'};
  function mats(form){
    const m={
      skin:['#cbb9a6','#967f6c','#665246','#3e302a'],
      flesh:['#ffa8a8','#dc5c6c','#9a3040','#5a1424'],
      suit:['#ffb878','#d8823a','#9a5422','#5a2e10'],
      concrete:['#d4d4d8','#9c9ca4','#6a6a74','#3e3e48'],
      bone:['#fff2d8','#e0cfa8','#a8946c','#6a5a40'],
      eye:['#ffd8c8','#ff3a2a','#a8140e','#5a0806'],
      teeth:['#f4ecc8','#d6c48a','#9a8a58','#5a4e30'],
      mouth:['#6a2028','#3a0c14','#24060c','#140306'],
      vein:['#a08878','#7a6252','#54443a','#342a24'],
    };
    if(form==='furia'){ m.skin=['#d8b0a0','#a87264','#744640','#46282a']; m.vein=['#ffe0a0','#ff5a2a','#c81a10','#6a0a06']; m.eye=['#fff0c0','#ffd23f','#ff6a1a','#a8300a']; }
    return m;
  }
  const NAMES={skin:'Pele',flesh:'Carne viva',suit:'Macacão',concrete:'Concreto',bone:'Placas de osso',eye:'Olhos',vein:'Veias'};
  const REST={hx:0,lean:22,head:-8,jaw:4,aFs:12,aFe:4,aBs:6,aBe:30,lFh:12,lFk:0,lBh:-12,lBk:-10,flash:0,rock:0,roar:0,impact:0,charge:0,throwF:0,dazed:0};
  const run=(i,o)=>{ const p=i/4*Math.PI*2; return {lFh:10+30*Math.sin(p), lFk:10+30*Math.sin(p)-30*Math.max(0,Math.cos(p)), lBh:10+30*Math.sin(p+Math.PI), lBk:10+30*Math.sin(p+Math.PI)-30*Math.max(0,Math.cos(p+Math.PI)), hx:o}; };
  const ANIMS={
    idle:{nome:'Parado',n:6,dur:()=>190,pose:i=>{ const p=i/6*Math.PI*2, s=Math.sin(p); return {lean:22+2*s, head:-8+1.5*Math.sin(p-0.6), jaw:4+3*Math.max(0,s), aFs:12+3*s, aFe:4+4*Math.sin(p-0.4), aBs:6+3*Math.sin(p+0.5), aBe:30+4*s}; }},
    walk:{nome:'Andar',n:8,dur:()=>150,pose:i=>{ const p=i/8*Math.PI*2; const lFh=12+14*Math.sin(p), lBh=-12+14*Math.sin(p+Math.PI);
      return {lFh, lFk:lFh-14*Math.max(0,Math.cos(p)), lBh, lBk:lBh-4-14*Math.max(0,Math.cos(p+Math.PI)), lean:24+3*Math.abs(Math.sin(p)), head:-8+2*Math.sin(2*p), aFs:14+6*Math.sin(p+Math.PI), aFe:6+6*Math.sin(p+Math.PI), aBs:6+10*Math.sin(p), aBe:30+8*Math.sin(p), jaw:5}; }},
    charge:{nome:'Investida',n:9,warn:[0,1,2,3],run:[4,5,6,7],slam:1,dur:i=>[220,80,170,440,90,90,90,90,200][i],pose:i=>[
      {aFs:165,aFe:160,lean:2,head:-16,jaw:8,hx:-4,lFh:16,lBh:-16},
      {aFs:70,aFe:36,lean:42,head:2,jaw:14,hx:8,impact:1,lFh:20,lFk:6,lBh:-20,lBk:-18},
      {aFs:66,aFe:32,lean:40,head:0,jaw:10,hx:8,lFh:20,lFk:6,lBh:-20,lBk:-18},
      {lean:-8,head:-36,jaw:24,roar:1,aFs:34,aFe:50,aBs:50,aBe:90,hx:2},
      Object.assign({lean:46,head:8,jaw:12,aFs:74,aFe:72,aBs:-20,aBe:20,charge:1},run(0,10)),
      Object.assign({lean:48,head:8,jaw:12,aFs:76,aFe:74,aBs:-24,aBe:16,charge:1},run(1,10)),
      Object.assign({lean:46,head:8,jaw:12,aFs:74,aFe:72,aBs:-20,aBe:20,charge:1},run(2,10)),
      Object.assign({lean:48,head:8,jaw:12,aFs:76,aFe:74,aBs:-24,aBe:16,charge:1},run(3,10)),
      {lean:30,head:0,jaw:8,aFs:40,aFe:30,hx:6,lFh:30,lFk:20,lBh:-24,lBk:-30}][i]},
    throw:{nome:'Arremesso de entulho',n:6,rip:1,toss:3,dur:i=>[220,200,240,80,200,180][i],pose:i=>[
      {lean:58,head:12,aFs:30,aFe:6,aBs:20,aBe:40,lFh:24,lFk:8,lBh:-18,lBk:-16},
      {lean:50,head:6,aFs:24,aFe:-4,rock:1,hx:-2,jaw:12,lFh:24,lFk:8,lBh:-18,lBk:-16},
      {lean:-6,head:-18,aFs:172,aFe:182,rock:1,jaw:10,aBs:40,aBe:80},
      {lean:36,head:4,aFs:62,aFe:82,throwF:1,hx:8,jaw:18,lFh:22,lFk:6,lBh:-22,lBk:-24},
      {lean:30,head:0,aFs:40,aFe:50,hx:6,jaw:8},
      {}][i]},
    dazed:{nome:'Atordoado (bateu na parede)',n:6,dur:()=>160,pose:i=>{ const p=i/6*Math.PI*2, s=Math.sin(p); return {lean:12+6*s, head:-22+10*Math.sin(p+1), jaw:14, hx:2*s, aFs:6+4*s, aFe:-2, aBs:-6, aBe:10, dazed:1}; }},
    hurt:{nome:'Dano',n:4,dur:i=>[80,110,130,160][i],pose:i=>[
      {lean:6,head:-24,jaw:16,hx:-5,flash:1,aFs:0,aFe:-10},
      {lean:10,head:-18,jaw:12,hx:-4,aFs:4,aFe:-4},
      {lean:18,head:-12,jaw:8,hx:-1},
      {}][i]},
  };
  function poseOf(anim,i){ return Object.assign({},REST,ANIMS[anim].pose(i)); }
  function skeleton(P){
    const hip={x:AX+P.hx,y:120};
    const hipF={x:hip.x+8,y:hip.y}, hipB={x:hip.x-8,y:hip.y};
    const kneeF=lp(hipF,P.lFh,24), ankleF=lp(kneeF,P.lFk,24), kneeB=lp(hipB,P.lBh,24), ankleB=lp(kneeB,P.lBk,24);
    const dy=GROUND-Math.max(ankleF.y+8, ankleB.y+8);
    [hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB].forEach(p=>p.y+=dy);
    const a=rad(P.lean), c=Math.cos(a), s=Math.sin(a);
    const T=(lx,ly)=>({x:hip.x+lx*c-ly*s, y:hip.y+lx*s+ly*c});
    const neck=T(24,-54), shF=T(6,-48), shB=T(-12,-54);
    const ha=rad(P.lean*0.4+P.head), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:neck.x+lx*hc-ly*hs, y:neck.y+lx*hs+ly*hc});
    const elF=lp(shF,P.aFs,30), wrF=lp(elF,P.aFe,28), elB=lp(shB,P.aBs,18), wrB=lp(elB,P.aBe,16);
    return {hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,neck,shF,shB,elF,wrF,elB,wrB,a,ha,H,T,eye:H(9,-11),mouth:H(12,-4)};
  }
  function drawBigArm(p,M,sh,el,wr,P,form){
    p.id();
    p.F(M.skin[1]); p.cap(sh,el,30,24); p.cap(el,wr,22,28);
    const bic=lerp(sh,el,0.45); p.ell(bic.x,bic.y,15,13);
    p.F(M.flesh[1]); const t=lerp(sh,el,0.3); p.ell(t.x+3,t.y,5,3); const t2=lerp(el,wr,0.5); p.ell(t2.x,t2.y+2,4,2.6);
    p.F(M.vein[1]); p.cap(lerp(sh,el,0.2),lerp(sh,el,0.7),1.4,1.2); p.cap(lerp(el,wr,0.1),lerp(el,wr,0.8),1.4,1.2);
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y);
    p.F(M.skin[1]); p.ell(10,0,18,16);
    p.F(M.flesh[1]); [0,1,2,3].forEach(k=>p.ell(25,-9+k*6,3.4,2.6));
    p.F(M.concrete[1]); p.poly([[8,-17],[22,-13],[18,-6],[6,-10]]); p.poly([[0,12],[14,15],[6,19]]); p.poly([[-4,-6],[2,-12],[4,-4]]);
    p.F(M.concrete[2]); p.rect(13,-11,2,2);
    p.F(M.skin[2]); p.rect(20,-10,1.2,20); p.rect(14,-12,1,24);
    if(P.rock){ p.F(M.concrete[1]); p.poly([[14,-16],[34,-14],[38,2],[30,14],[12,12],[8,-4]]); p.F(M.concrete[2]); p.rect(20,-8,6,1.5); p.rect(26,2,5,1.5); p.F(M.concrete[3]); p.rect(15,-2,1.5,6); p.F(M.flesh[2]); p.rect(30,10,4,3); }
    p.id();
  }
  function drawSmallArm(p,M,sh,el,wr){
    p.id(); p.F(M.skin[1]); p.cap(sh,el,9,8); p.cap(el,wr,7.6,6.4); p.ell(wr.x,wr.y,4.2,4);
  }
  function drawLeg(p,M,hip,knee,ankle,front){
    p.id();
    p.F(M.skin[1]); p.cap(hip,knee,20,18); p.cap(knee,ankle,17,15);
    p.F(M.suit[1]); p.cap(hip,lerp(hip,knee,0.85),21,19);
    p.F(M.suit[2]); [[0.3,-4],[0.6,3]].forEach(([t,o])=>{ const q=lerp(hip,knee,t); p.rect(q.x+o,q.y-1,4,1.2); });
    p.F(M.suit[1]); const k=lerp(hip,knee,0.85); p.poly([[k.x-10,k.y-1],[k.x+10,k.y-1],[k.x+8,k.y+4],[k.x+3,k.y+2],[k.x,k.y+6],[k.x-4,k.y+2],[k.x-9,k.y+5]]);
    const a=ankle; p.F(M.skin[1]); p.poly([[a.x-9,a.y-4],[a.x+8,a.y-5],[a.x+18,a.y+2],[a.x+19,a.y+8],[a.x-10,a.y+8]]);
    p.F(M.skin[2]); [[10,5],[13,5.4],[16,5.6]].forEach(([dx,dy])=>p.rect(a.x+dx,a.y+dy,1,2.6));
    p.F(M.flesh[1]); if(front) p.rect(a.x-2,a.y-2,4,2);
  }
  function drawTorso(p,M,sk,form){
    p.xf(sk.a,sk.hip.x,sk.hip.y);
    p.F(M.skin[1]); p.poly([[-24,2],[22,2],[26,-12],[30,-30],[30,-46],[22,-58],[6,-64],[-14,-62],[-28,-52],[-32,-34],[-30,-14]]);
    p.F(M.skin[2]); p.poly([[2,-46],[20,-48],[24,-34],[10,-30],[2,-36]]); p.poly([[4,-24],[22,-26],[22,-12],[6,-10]]);
    p.F(M.skin[0]); p.rect(8,-44,10,1.4); p.rect(8,-22,10,1.2);
    p.F(M.flesh[1]); [[-8,-40,4,8],[14,-38,3,5],[-16,-22,3,7],[20,-16,2.4,4]].forEach(([x,y,rx,ry])=>p.ell(x,y,rx,ry));
    p.F(M.flesh[2]); p.rect(-9,-41,2,6);
    p.F(M.vein[1]); p.cap(P2(-20,-48),P2(-6,-28),1.4,1.2); p.cap(P2(-6,-28),P2(0,-14),1.2,1.2); p.cap(P2(18,-48),P2(26,-30),1.4,1.2);
    p.F(M.bone[1]); [[-26,-50,8],[-30,-38,10],[-30,-24,9],[-26,-10,7]].forEach(([x,y,h])=>p.poly([[x,y-4],[x,y+4],[x-h,y-2]]));
    p.F(M.bone[1]); p.poly([[-18,-60],[-10,-63],[-16,-72]]);
    p.F(M.suit[1]); p.poly([[-26,-6],[24,-6],[25,4],[-27,4]]);
    p.F(M.suit[2]); p.poly([[14,-6],[22,-6],[18,8],[12,10]]); p.poly([[-20,-6],[-14,-6],[-18,10],[-24,8]]);
    p.F(M.suit[0]); p.rect(-24,-6,46,1.4);
    p.id();
  }
  function drawHead(p,M,sk,P){
    p.xf(sk.ha,sk.neck.x,sk.neck.y);
    p.F(M.skin[1]); p.ell(4,-8,10,9); p.poly([[-2,-4],[16,-6],[17,2],[4,4]]);
    p.F(M.skin[2]); p.poly([[0,-14],[14,-13],[14,-11],[0,-11.4]]);
    p.F(M.skin[3]); p.ell(9,-10.6,2.6,2); p.F(M.eye[1]); p.ell(9.2,-10.6,1.5,1.1); p.F(M.eye[0]); p.rect(9,-11.2,0.8,0.8);
    p.F(M.skin[3]); p.ell(14,-10.4,1.4,1.4); p.F(M.eye[1]); p.rect(13.6,-10.8,1,1);
    const j=P.jaw*0.12;
    p.F(M.mouth[1]); p.poly([[6,-4],[17,-5],[17,-2+j*4],[6,-1+j*3]]);
    p.F(M.skin[1]); p.poly([[4,-1+j*3],[18,-2+j*4],[18,3+j*4],[5,4+j*3]]);
    p.F(M.teeth[1]); [8,11,14].forEach(x=>p.rect(x,-3+j*3.6,2,2.4));
    if(P.roar){ p.F(M.teeth[1]); [9,12,15].forEach(x=>p.rect(x,-5,1.6,1.4)); }
    p.id();
  }
  const cache=new Map();
  function frame(form,anim,fi,step=5){
    const K=PIX.getK(), key=form+anim+fi+step+'@'+K; if(cache.has(key)) return cache.get(key);
    const P=poseOf(anim,fi), M=mats(form), sk=skeleton(P);
    const parts=[
      {back:true, draw:(c,u)=>drawSmallArm(mkPen(c,u),M,sk.shB,sk.elB,sk.wrB)},
      {back:true, draw:(c,u)=>drawLeg(mkPen(c,u),M,sk.hipB,sk.kneeB,sk.ankleB,false)},
      {draw:(c,u)=>drawTorso(mkPen(c,u),M,sk,form)},
      {draw:(c,u)=>drawLeg(mkPen(c,u),M,sk.hipF,sk.kneeF,sk.ankleF,true)},
      {draw:(c,u)=>drawHead(mkPen(c,u),M,sk,P)},
      {draw:(c,u)=>drawBigArm(mkPen(c,u),M,sk.shF,sk.elF,sk.wrF,P,form)},
    ];
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM[form]});
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._eye=sc(sk.eye); cv._mouth=sc(sk.mouth); cv._fist=sc(lp(sk.wrF,P.aFe,10)); cv._back=sc(sk.T(-26,-50)); cv._head=sc(sk.H(4,-20));
    cache.set(key,cv); return cv;
  }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame};
})();
