/* ===== GRITADOR (nº 005): zumbi que grita e chama reforço, hi-bit ===== */
const GRIT=(function(){
  const {rad,lp,lerp,P2,mkPen,compose}=PIX;
  const FW=124, FH=128, GROUND=122, AX=52;
  const RIM={comum:'#b8d0f8', enluarado:'#ffd0f0', plenilunar:'#ff8a7a'};
  function mats(form){
    const m={
      skin:['#d8e2ec','#a8b6c8','#76849c','#4a5670'],
      hair:['#3a3446','#1c1822','#121016','#08060a'],
      top:['#f6c8d8','#d898b0','#a06a84','#64405a'],
      hood:['#b8b6c0','#86848e','#5c5a66','#383640'],
      skirt:['#7a98c8','#4e6898','#344670','#1e2a48'],
      tights:['#5a5060','#3a3242','#26202c','#16121a'],
      shoe:['#ffffff','#d8d4cc','#9a948a','#5a564e'],
      eye:['#ffffff','#e8ecf0','#b0b8c0','#6a7480'],
      mouth:['#5a1a2a','#2e0a16','#1c060e','#100308'],
      teeth:['#f0e8c0','#cdbf88','#948658','#5a5034'],
      blood:['#b84a3f','#8a2c2c','#5c1a24','#3a0f1a'],
      bead:['#ffe27a','#4ab8f0','#e85a8a','#5a3a20'],
      nail:['#5a4848','#3a2e30','#261c20','#140e12'],
    };
    if(form==='enluarado'){ m.skin=['#ffd8ec','#f0a0c8','#c06a98','#80406a']; m.eye=['#ffffff','#ffffff','#e8e0f0','#b0a0c8']; }
    if(form==='plenilunar'){ m.skin=['#5a5068','#2e2838','#1c1824','#0e0a12']; m.hair=['#ff6a5a','#d82a2a','#8a141c','#4a080e']; m.mouth=['#ff4a3a','#c81a24','#7a0a14','#40040a']; m.eye=['#fffbe0','#ffd23f','#ff8a2a','#c2401a']; }
    return m;
  }
  const NAMES={skin:'Pele',hair:'Cabelo',top:'Blusa',hood:'Moletom',skirt:'Saia jeans',tights:'Meia-calça',shoe:'Tênis',mouth:'Boca',bead:'Miçangas'};
  const REST={hx:0,lean:6,head:4,jaw:14,aFs:30,aFe:150,aBs:24,aBe:140,lFh:6,lFk:0,lBh:-8,lBk:-14,flash:0,hairSw:0,scream:0};
  const ANIMS={
    idle:{nome:'Parada',n:6,dur:()=>150,pose:i=>{ const p=i/6*Math.PI*2, s=Math.sin(p); return {lean:6+1.5*s, head:4+3*Math.sin(p-0.7), jaw:13+2*s, aFs:30+3*s, aFe:150+4*s, aBs:24+3*Math.sin(p+0.5), aBe:140+3*s, hairSw:s}; }},
    walk:{nome:'Fugir',n:8,dur:()=>95,pose:i=>{ const p=i/8*Math.PI*2; const lFh=8+28*Math.sin(p), lBh=8+28*Math.sin(p+Math.PI);
      return {lFh, lFk:lFh-10-50*Math.max(0,Math.cos(p)), lBh, lBk:lBh-10-50*Math.max(0,Math.cos(p+Math.PI)), lean:16+2*Math.sin(2*p), head:-2+3*Math.sin(2*p-0.8), jaw:14,
        aFs:20-30*Math.sin(p), aFe:110-30*Math.sin(p), aBs:20+30*Math.sin(p), aBe:110+30*Math.sin(p), hairSw:-2+Math.sin(2*p)}; }},
    attack:{nome:'Gritar',n:8,screamAt:3,dur:i=>[180,160,160,90,260,260,200,160][i],pose:i=>[
      {lean:2,head:10,jaw:6,aFs:40,aFe:160,aBs:34,aBe:150,hairSw:1},
      {lean:-4,head:-8,jaw:10,aFs:50,aFe:170,aBs:44,aBe:160,hairSw:2},
      {lean:-10,head:-22,jaw:16,aFs:56,aFe:176,aBs:50,aBe:166,hairSw:3,lFh:10,lBh:-12},
      {lean:-16,head:-36,jaw:34,aFs:64,aFe:186,aBs:58,aBe:176,hairSw:5,scream:1,lFh:12,lBh:-14,lBk:-20},
      {lean:-16,head:-38,jaw:36,aFs:64,aFe:186,aBs:58,aBe:176,hairSw:6,scream:1,hx:-1,lFh:12,lBh:-14,lBk:-20},
      {lean:-15,head:-36,jaw:35,aFs:62,aFe:184,aBs:56,aBe:174,hairSw:5,scream:1,hx:1,lFh:12,lBh:-14,lBk:-20},
      {lean:-6,head:-14,jaw:22,aFs:46,aFe:164,aBs:40,aBe:156,hairSw:2},
      {lean:2,head:2,jaw:14,hairSw:1}][i]},
    hurt:{nome:'Dano',n:4,dur:i=>[80,110,120,150][i],pose:i=>[
      {lean:-12,head:-24,jaw:24,hx:-6,flash:1,aFs:0,aFe:40,aBs:-10,aBe:30,hairSw:4},
      {lean:-8,head:-16,jaw:20,hx:-5,aFs:10,aFe:80,aBs:0,aBe:70,hairSw:3},
      {lean:0,head:-4,jaw:16,hx:-2},
      {}][i]},
  };
  function poseOf(anim,i){ return Object.assign({},REST,ANIMS[anim].pose(i)); }
  function skeleton(P){
    const hip={x:AX+P.hx,y:66};
    const hipF={x:hip.x+2,y:hip.y}, hipB={x:hip.x-2,y:hip.y};
    const kneeF=lp(hipF,P.lFh,23), ankleF=lp(kneeF,P.lFk,23), kneeB=lp(hipB,P.lBh,23), ankleB=lp(kneeB,P.lBk,23);
    const dy=GROUND-Math.max(ankleF.y+4, ankleB.y+4);
    [hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB].forEach(p=>p.y+=dy);
    const a=rad(P.lean), c=Math.cos(a), s=Math.sin(a);
    const T=(lx,ly)=>({x:hip.x+lx*c-ly*s, y:hip.y+lx*s+ly*c});
    const neckB=T(1,-29), shF=T(4,-26), shB=T(-3,-27);
    const na=rad(P.lean+P.head*0.4), neck={x:neckB.x+Math.sin(na)*7, y:neckB.y-Math.cos(na)*7};
    const ha=rad(P.lean+P.head), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:neck.x+lx*hc-ly*hs, y:neck.y+lx*hs+ly*hc});
    const elF=lp(shF,P.aFs,13), wrF=lp(elF,P.aFe,12), elB=lp(shB,P.aBs,13), wrB=lp(elB,P.aBe,12);
    return {hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,neckB,neck,shF,shB,elF,wrF,elB,wrB,a,ha,H,T,mouth:H(10,-4),eye:H(6.6,-14)};
  }
  function drawArm(p,M,sh,el,wr,front){
    p.id();
    p.F(M.hood[1]); p.cap(sh,el,6.4,5.6); p.cap(el,lerp(el,wr,0.55),5.6,5);
    p.F(M.hood[0]); p.cap(lerp(el,wr,0.48),lerp(el,wr,0.6),5.8,5.6);
    p.F(M.skin[1]); p.cap(lerp(el,wr,0.58),wr,3.6,3.2);
    if(front){ const b=lerp(el,wr,0.82); p.F(M.bead[0]); p.circle(P2(b.x-1,b.y),0.9); p.F(M.bead[1]); p.circle(b,0.9); p.F(M.bead[2]); p.circle(P2(b.x+1,b.y+0.6),0.9); }
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y);
    p.F(M.skin[1]); p.poly([[0,-2.4],[4,-2.6],[4.4,2.6],[0,2.4]]);
    for(let k=0;k<4;k++){ const y0=-2+k*1.4, A=rad(-18+k*12); const t=P2(4+Math.cos(A)*7,y0+Math.sin(A)*7);
      p.F(M.skin[1]); p.cap(P2(3.8,y0),t,1.5,1.2); p.F(M.nail[1]); p.ell(t.x+Math.cos(A)*0.8,t.y+Math.sin(A)*0.8,0.8,0.7); }
    p.F(M.skin[1]); p.cap(P2(1.4,-2.2),P2(3,-5),1.5,1.3);
    p.id();
  }
  function drawLeg(p,M,hip,knee,ankle,front){
    p.id();
    p.F(M.tights[1]); p.cap(hip,knee,6.4,5.4); p.cap(knee,ankle,5.4,4);
    p.F(M.skin[1]); const r1=lerp(hip,knee,front?0.75:0.55); p.ell(r1.x,r1.y,1.8,1.4); const r2=lerp(knee,ankle,front?0.3:0.5); p.ell(r2.x+0.6,r2.y,1.4,1.8);
    p.F(M.tights[0]); p.cap(lerp(knee,ankle,0.4),P2(lerp(knee,ankle,0.4).x+2,lerp(knee,ankle,0.4).y+3),0.6,0.6);
    const a=ankle;
    if(front){ p.F(M.shoe[1]); p.poly([[a.x-3.4,a.y-1.4],[a.x+3,a.y-1.6],[a.x+8,a.y+1],[a.x+8.6,a.y+3.6],[a.x-3.6,a.y+3.6]]); p.F(M.shoe[3]); p.rect(a.x-3.6,a.y+2.8,12.2,1); p.F(M.shoe[2]); p.rect(a.x+0.6,a.y-0.6,1,1); p.rect(a.x+2.4,a.y,1,1); }
    else { p.F(M.skin[2]); p.poly([[a.x-2.6,a.y-1],[a.x+2.6,a.y-1],[a.x+7,a.y+1.6],[a.x+7.4,a.y+3.4],[a.x-2.8,a.y+3.4]]); p.F(M.nail[2]); p.rect(a.x+5.6,a.y+2.4,1,1); }
  }
  function drawTorso(p,M,sk){
    p.xf(sk.a,sk.hip.x,sk.hip.y);
    p.F(M.skirt[1]); p.poly([[-8,-3],[7.4,-3],[9.6,8],[-10,8]]);
    p.F(M.skirt[2]); p.rect(-1,-2,0.9,9); p.rect(4,0,0.9,6); p.F(M.skirt[0]); p.rect(-8,-3,15.4,1);
    p.F(M.top[1]); p.poly([[-7,-2.6],[6.6,-2.6],[7,-12],[6,-22],[3,-26.6],[-3,-26.6],[-6.6,-21],[-7.6,-12]]);
    p.F(M.skin[1]); p.poly([[-2.4,-27],[3,-27.6],[4.2,-24],[-1.6,-23.6]]); p.F(M.top[2]); p.rect(-1.6,-24,0.8,3.6); p.rect(3.4,-24,0.8,3.6);
    p.F(M.skin[2]); p.rect(-0.6,-25.4,3,0.8);
    p.F(M.hood[1]); p.poly([[-8.6,-1],[-5,-1],[-5.2,-20],[-3,-26.6],[-6.6,-28],[-10.4,-22],[-10.6,-10]]);
    p.poly([[5,-1],[8,-1],[8.6,-12],[8,-22],[5.6,-27],[3.6,-26],[5.8,-20]]);
    p.F(M.hood[0]); p.rect(-5.6,-20,0.9,18); p.rect(5,-20,0.9,18);
    p.F(M.skin[1]); p.ell(-8.4,-25,1.8,1.4); p.F(M.hood[3]); p.rect(-9.8,-26.4,1,3);
    p.F(M.hood[2]); p.poly([[-8,-28.4],[-2,-30],[3,-29],[-3,-28]]);
    p.id();
  }
  function drawHair(p,M,sk,P,back){
    p.xf(sk.ha,sk.neck.x,sk.neck.y);
    const sw=P.hairSw;
    p.F(M.hair[1]);
    if(back){ p.poly([[-7,-22],[-2,-25],[6,-24],[3,-18],[-1,-12],[-3,-2],[-6+sw*0.6,8],[-9+sw,14],[-12+sw*1.2,10],[-12+sw,0],[-10,-12]]); }
    else { p.poly([[-6,-22.6],[0,-25.6],[7,-24.4],[10,-20],[9,-16.6],[6.4,-19.4],[3,-18.6],[0,-19.6],[-2,-14],[-4,-6],[-5+sw*0.4,0],[-7,-8],[-7.6,-16]]);
      p.poly([[7.6,-19],[9,-14],[8.4,-7],[7.4,-10],[6.8,-16]]); }
    p.id();
  }
  function drawHead(p,M,sk,P){
    p.id(); p.F(M.skin[1]); p.cap(sk.neckB,sk.neck,4.4,3.8);
    p.F(M.skin[2]); p.cap(lerp(sk.neckB,sk.neck,0.1),lerp(sk.neckB,sk.neck,0.9),0.9,0.9); const n2=lerp(sk.neckB,sk.neck,0.5); p.rect(n2.x+1,n2.y,0.9,2);
    p.xf(sk.ha,sk.neck.x,sk.neck.y);
    p.F(M.skin[1]); p.ell(1.6,-14,7.6,8.6); p.poly([[-2,-9],[9.6,-10],[10.6,-7],[4,-5],[-0.6,-6]]);
    p.ell(-3.4,-12.4,1.8,2.6);
    p.F(M.skin[3]); p.ell(6.6,-14,2.6,2.4);
    p.F(M.eye[1]); p.ell(6.8,-14,2.1,2); p.F(M.mouth[3]); p.rect(7.4,-14.6,0.8,0.8);
    p.F(M.skin[3]); p.ell(10.4,-14.2,1,1.4); p.F(M.eye[1]); p.rect(10.2,-14.6,0.9,0.9);
    p.F(M.skin[1]); p.poly([[9.2,-13.6],[12,-10.4],[9.6,-9.8]]);
    p.F(M.mouth[1]); p.poly([[3,-8.4],[10.6,-9],[11,-6],[4,-5]]);
    p.F(M.teeth[1]); p.rect(5,-8.8,1.2,1.4); p.rect(7,-8.9,1.2,1.4); p.rect(9,-9,1,1.2);
    p.F(M.blood[1]); p.rect(9.6,-7,1.6,1);
    p.id();
  }
  function drawJaw(p,M,sk,P){
    const h=sk.H(0,-7.6); p.xf(sk.ha+rad(P.jaw),h.x,h.y);
    const L=10+P.jaw*0.14;
    p.F(M.skin[1]); p.poly([[-1.4,-0.8],[L,0],[L+0.8,2.4],[L-2,5.4],[3,6],[-1.4,2.8]]);
    p.F(M.mouth[1]); p.poly([[3,-0.6],[L,0],[L-1,1.6],[3.6,1.4]]);
    p.F(M.teeth[1]); p.rect(5.4,-0.4,1.2,1.4); p.rect(7.6,-0.3,1.2,1.4);
    p.F(M.blood[1]); p.rect(L-0.6,1,1,2.6);
    p.F(M.skin[2]); p.rect(2.6,4.6,5,0.9);
    p.id();
  }
  const cache=new Map();
  function frame(form,anim,fi,step=5){
    const K=PIX.getK(), key=form+anim+fi+step+'@'+K; if(cache.has(key)) return cache.get(key);
    const P=poseOf(anim,fi), M=mats(form), sk=skeleton(P);
    const parts=[
      {back:true, draw:(c,u)=>drawHair(mkPen(c,u),M,sk,P,true)},
      {back:true, draw:(c,u)=>drawArm(mkPen(c,u),M,sk.shB,sk.elB,sk.wrB,false)},
      {back:true, draw:(c,u)=>drawLeg(mkPen(c,u),M,sk.hipB,sk.kneeB,sk.ankleB,false)},
      {draw:(c,u)=>drawTorso(mkPen(c,u),M,sk)},
      {draw:(c,u)=>drawLeg(mkPen(c,u),M,sk.hipF,sk.kneeF,sk.ankleF,true)},
      {draw:(c,u)=>drawHead(mkPen(c,u),M,sk,P)},
      {draw:(c,u)=>drawJaw(mkPen(c,u),M,sk,P)},
      {draw:(c,u)=>drawHair(mkPen(c,u),M,sk,P,false)},
      {draw:(c,u)=>drawArm(mkPen(c,u),M,sk.shF,sk.elF,sk.wrF,true)},
    ];
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM[form]});
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._mouth=sc(sk.mouth); cv._eye=sc(sk.eye); cv._head=sc(sk.H(2,-24));
    cache.set(key,cv); return cv;
  }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame};
})();
