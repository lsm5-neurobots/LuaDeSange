/* ===== BLINDADO (nº 008): tropa de choque com escudo, hi-bit ===== */
const BLIN=(function(){
  const {rad,lp,lerp,P2,mkPen,compose,OUTLINE}=PIX;
  const FW=136, FH=126, GROUND=120, AX=50;
  const RIM={comum:'#b8d4f0', enluarado:'#c8f0b0', plenilunar:'#ffe08a'};
  function mats(form){
    const m={
      skin:['#b8c4a4','#8a9a7c','#5e6e5a','#3a4640'],
      gear:['#4a4e5e','#24262e','#16181e','#0a0a10'],
      vest:['#4a5e90','#2c3c66','#1e2846','#10162a'],
      pants:['#3a3c46','#1e2028','#14161c','#0a0a0e'],
      guard:['#7a7e8e','#4e5262','#343846','#1e202a'],
      yellow:['#fff08a','#f2c230','#a8820e','#5e4806'],
      visor:['#d8f0ff','#8ab8d8','#5a82a8','#344e70'],
      eye:['#ffffff','#eef0e8','#b8bcb0','#7a7e74'],
      baton:['#5a5a66','#2a2a32','#1a1a20','#0c0c10'],
      radio:['#5a5a62','#2e2e36','#1e1e24','#0e0e12'],
      blood:['#b84a3f','#8a2c2c','#5c1a24','#3a0f1a'],
    };
    if(form==='enluarado'){ m.skin=['#b8d0a0','#86a070','#5a7050','#384630']; m.gear=['#6a7a4e','#46542e','#2e381e','#1a2010']; m.vest=['#7a8a5a','#55633c','#3a4428','#222a18']; m.pants=['#5a6440','#3a4228','#262c1a','#14180e']; }
    if(form==='plenilunar'){ m.gear=['#5a5a66','#1a1a20','#101014','#060608']; m.vest=['#3a3a44','#1c1c24','#121218','#08080c']; m.yellow=['#fff6c0','#ffd23f','#c8920e','#6a4a06']; m.guard=['#ffe27a','#d8b040','#8a6a18','#4a380c']; }
    return m;
  }
  const NAMES={skin:'Pele',gear:'Capacete',vest:'Colete',pants:'Calça',guard:'Caneleira',yellow:'Alerta',visor:'Viseira',baton:'Cassetete'};
  const SHIELD={comum:{glass:'rgba(150,200,240,.42)',rim:['#e8f4ff','#9ac0e0','#5a7aa0'],hp:3},enluarado:{glass:'rgba(160,220,190,.42)',rim:['#e8fff0','#9ad0b0','#5a8a70'],hp:3},plenilunar:{glass:'rgba(255,210,90,.5)',rim:['#fff6c0','#ffd23f','#a87a10'],hp:5}};
  const REST={hx:0,lean:4,head:2,aFs:20,aFe:60,aBs:40,aBe:80,lFh:14,lFk:2,lBh:-14,lBk:-18,flash:0,crack:0,shield:1,fall:0,swing:0};
  const ANIMS={
    idle:{nome:'Parado (escudo erguido)',n:6,dur:()=>170,pose:i=>{ const p=i/6*Math.PI*2, s=Math.sin(p); return {lean:4+0.8*s, head:2+s, aFs:20+2*s, aFe:60+2*s}; }},
    walk:{nome:'Andar (sempre de frente)',n:8,dur:()=>150,pose:i=>{ const p=i/8*Math.PI*2; const lFh=10+10*Math.sin(p), lBh=-10+10*Math.sin(p+Math.PI);
      return {lFh, lFk:lFh-12*Math.max(0,Math.cos(p)), lBh, lBk:lBh-6-12*Math.max(0,Math.cos(p+Math.PI)), lean:6+Math.abs(Math.sin(p)), head:2+Math.sin(2*p), aFs:20+5*Math.sin(p), aFe:60+5*Math.sin(p)}; }},
    block:{nome:'Golpes no escudo (3)',n:10,dur:i=>[220,70,200,70,200,70,120,120,140,260][i],hits:{1:1,3:2,5:3},pose:i=>[
      {crack:0},{crack:1,hx:-3,lean:-2,flash:0},{crack:1},{crack:2,hx:-3,lean:-2},{crack:2},{crack:3,hx:-4,lean:-4},
      {crack:3,fall:0.3,lean:-2,aBs:20,aBe:40},{crack:3,fall:0.65,aBs:0,aBe:20},{crack:3,fall:1,aBs:-6,aBe:4},{shield:0,aBs:-6,aBe:4,head:6}][i]},
    attack:{nome:'Cassetete quebrado',n:6,dur:i=>[180,70,60,120,120,140][i],pose:i=>[
      {aFs:-40,aFe:150,lean:0,hx:-2,head:0},{aFs:-60,aFe:170,lean:-2,hx:-2},
      {aFs:100,aFe:110,lean:12,hx:5,swing:1,lFh:22,lBh:-20,lBk:-26},{aFs:110,aFe:120,lean:12,hx:5,lFh:22,lBh:-20,lBk:-26},
      {aFs:60,aFe:90,lean:8,hx:3},{aFs:24,aFe:62,lean:5,hx:1}][i]},
    hurt:{nome:'Dano (por trás)',n:4,dur:i=>[80,110,120,150][i],pose:i=>[
      {lean:16,head:14,hx:5,flash:1,aFs:40,aFe:40},{lean:12,head:10,hx:4},{lean:7,head:5,hx:2},{}][i]},
  };
  function poseOf(anim,i){ return Object.assign({},REST,ANIMS[anim].pose(i)); }
  function skeleton(P){
    const hip={x:AX+P.hx,y:66};
    const hipF={x:hip.x+3,y:hip.y}, hipB={x:hip.x-3,y:hip.y};
    const kneeF=lp(hipF,P.lFh,22), ankleF=lp(kneeF,P.lFk,22), kneeB=lp(hipB,P.lBh,22), ankleB=lp(kneeB,P.lBk,22);
    const dy=GROUND-Math.max(ankleF.y+5, ankleB.y+5);
    [hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB].forEach(p=>p.y+=dy);
    const a=rad(P.lean), c=Math.cos(a), s=Math.sin(a);
    const T=(lx,ly)=>({x:hip.x+lx*c-ly*s, y:hip.y+lx*s+ly*c});
    const neck=T(1,-33), shF=T(5,-28), shB=T(-4,-29);
    const ha=rad(P.lean+P.head), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:neck.x+lx*hc-ly*hs, y:neck.y+lx*hs+ly*hc});
    const elF=lp(shF,P.aFs,14), wrF=lp(elF,P.aFe,13), elB=lp(shB,P.aBs,14), wrB=lp(elB,P.aBe,13);
    return {hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,neck,shF,shB,elF,wrF,elB,wrB,a,ha,H,T};
  }
  function drawArm(p,M,sh,el,wr,front,P){
    p.id();
    p.F(M.vest[1]); p.cap(sh,el,8,7.2);
    p.F(M.gear[1]); p.cap(el,wr,7,6.2); p.F(M.guard[1]); p.circle(el,3.4);
    p.F(M.gear[0]); p.circle(lerp(el,wr,0.2),1);
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x);
    if(front){ // cassetete quebrado, de pé na mão
      const bd=ang-rad(80); p.xf(bd,wr.x,wr.y); p.F(M.baton[1]); p.cap(P2(-4,0),P2(14,0),3.6,3.4); p.F(M.baton[0]); p.rect(-2,-1.4,14,0.8);
      p.F(M.baton[1]); p.poly([[14,-1.8],[17,-1],[15.4,0.4],[17.4,1.6],[14,1.8]]); p.id(); }
    p.xf(ang,wr.x,wr.y); p.F(M.gear[1]); p.ell(1.6,0,3.8,3.6); p.F(M.gear[0]); p.rect(2.2,-2.4,0.9,4.8); p.id();
  }
  function drawLeg(p,M,hip,knee,ankle,front){
    p.id();
    p.F(M.pants[1]); p.cap(hip,knee,10,8.8); p.cap(knee,ankle,8.8,8);
    p.F(M.guard[1]); p.cap(lerp(knee,ankle,0.05),lerp(knee,ankle,0.72),9.4,8.4); p.F(M.guard[0]); p.cap(lerp(knee,ankle,0.15),lerp(knee,ankle,0.6),1.2,1);
    p.F(M.gear[1]); p.circle(knee,3.6);
    const a=ankle; p.F(M.gear[1]); p.cap(lerp(knee,ankle,0.75),a,9,8.6);
    p.poly([[a.x-4.8,a.y-2.4],[a.x+4,a.y-2.4],[a.x+10,a.y+1],[a.x+10.6,a.y+4.4],[a.x-5,a.y+4.4]]);
    p.F(M.guard[2]); p.rect(a.x-5,a.y+3.4,15.6,1.4);
  }
  function drawTorso(p,M,sk){
    p.xf(sk.a,sk.hip.x,sk.hip.y);
    p.F(M.vest[1]); p.poly([[-11,1.6],[10.4,1.6],[11.6,-10],[12.4,-22],[9.6,-30],[3,-34],[-5,-34],[-11,-29],[-13,-18],[-12,-6]]);
    p.F(M.vest[0]); p.rect(-3,-26,12,8); p.rect(-3,-15,12,7);
    p.F(M.vest[2]); p.rect(-3,-18,12,1); p.rect(-3,-8,12,1); p.rect(3,-26,1,8);
    p.F(M.yellow[1]); p.rect(-11,-20,22,2.2);
    p.F(M.skin[2]); p.poly([[-9,-31],[-5,-33],[-6,-29]]); p.poly([[6,-32],[9.6,-30],[7,-28.6]]);
    p.F(M.radio[1]); p.rect(-12.6,-14,4,7.4); p.F(M.radio[0]); p.rect(-12,-13.4,2.6,1); p.F(M.radio[2]); p.cap(P2(-10.6,-14),P2(-8,-26),0.8,0.8);
    p.F(M.gear[1]); p.poly([[-11.4,-2.4],[10.6,-2.4],[10.8,2.4],[-11.6,2.4]]); p.F(M.yellow[2]); p.rect(5,-2,3,3);
    p.id();
  }
  function drawHead(p,M,sk,P){
    p.xf(sk.ha,sk.neck.x,sk.neck.y);
    p.F(M.gear[1]); p.cap(P2(0,3),P2(1,-6),8,7.4);
    p.F(M.skin[1]); p.ell(4,-12,7,7.4);
    p.F(M.gear[1]); p.poly([[-10,-10],[-10,-20],[-4,-26.6],[5,-27],[11.6,-22],[13,-15],[6,-15],[5,-8],[-2,-4],[-9,-5]]);
    p.F(M.gear[0]); p.poly([[-6,-23],[2,-25.6],[8,-23.6],[1,-22.6]]);
    p.F(M.visor[1]); p.poly([[5,-21],[14,-19],[15,-6],[7,-6.4]]);
    p.F(M.skin[2]); p.ell(9.6,-12.4,3.6,4.6);
    p.F(M.eye[1]); p.ell(10.6,-14,1.6,1.3);
    p.F(M.visor[0]); p.rect(7,-20,6,1); p.cap(P2(12,-18),P2(9,-13),0.7,0.7); p.cap(P2(12,-18),P2(14,-12),0.7,0.7); p.cap(P2(12,-18),P2(13.6,-19.4),0.7,0.7);
    p.F(M.gear[1]); p.poly([[4,-6],[14,-6.4],[13,-1],[6,0.6],[3,-2]]);
    p.F(M.gear[0]); p.rect(6,-4.4,6,0.9);
    p.F(M.yellow[1]); p.rect(-6,-19,3,1.4);
    p.id();
  }
  function drawShieldOverlay(cv,sk,P,form,step){
    if(!P.shield) return; const K=PIX.getK(), g=cv.getContext('2d'), Sh=SHIELD[form];
    const fall=P.fall||0, x0=(sk.hip.x+13+fall*8)*K, yb=(sk.hip.y+8+fall*24)*K, h=46*K, w=13*K, sk2=6*K;
    const rot=fall*1.2;
    g.save(); g.translate(x0,yb); g.rotate(rot); g.translate(-x0,-yb);
    const quad=[[x0,yb-h],[x0+w,yb-h+sk2],[x0+w,yb+sk2*0.3],[x0,yb]];
    const path=()=>{ g.beginPath(); quad.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1])); g.closePath(); };
    if(step>=2){ path(); g.fillStyle=Sh.glass; g.fill(); }
    g.lineWidth=Math.max(1,K); g.strokeStyle=OUTLINE; path(); g.stroke();
    g.strokeStyle=Sh.rim[1]; g.lineWidth=Math.max(1,K); g.beginPath(); g.moveTo(quad[0][0]+K,quad[0][1]+2*K); g.lineTo(quad[3][0]+K,quad[3][1]-2*K); g.stroke();
    if(step>=3){ g.fillStyle=Sh.rim[0]; for(let k=0;k<4;k++) g.fillRect(Math.round(x0+3*K+k*K),Math.round(yb-h+6*K+k*2*K),Math.max(1,K),Math.max(1,K*3)); }
    // riscos
    g.strokeStyle='rgba(255,255,255,.55)'; g.lineWidth=1; g.beginPath(); g.moveTo(x0+4*K,yb-30*K); g.lineTo(x0+9*K,yb-36*K); g.moveTo(x0+5*K,yb-12*K); g.lineTo(x0+10*K,yb-15*K); g.stroke();
    // rachadura em teia: cresce com crack
    const cr=P.crack, cx=x0+7*K, cy=yb-24*K;
    if(cr>0){ g.strokeStyle='#ffffff'; g.lineWidth=1; const arms=cr===1?4:cr===2?7:10, L=(cr===1?6:cr===2?11:16)*K;
      g.beginPath(); for(let k=0;k<arms;k++){ const a=k/arms*Math.PI*2+0.3; g.moveTo(cx,cy); g.lineTo(cx+Math.cos(a)*L*0.55,cy+Math.sin(a)*L*1.1); } g.stroke();
      if(cr>=2){ g.beginPath(); g.ellipse(cx,cy,L*0.25,L*0.45,0,0,Math.PI*2); g.stroke(); }
      if(cr>=3){ g.beginPath(); g.ellipse(cx,cy,L*0.42,L*0.8,0,0,Math.PI*2); g.stroke(); } }
    g.restore();
  }
  const cache=new Map();
  function frame(form,anim,fi,step=5){
    const K=PIX.getK(), key=form+anim+fi+step+'@'+K; if(cache.has(key)) return cache.get(key);
    const P=poseOf(anim,fi), M=mats(form), sk=skeleton(P);
    const parts=[
      {back:true, draw:(c,u)=>drawArm(mkPen(c,u),M,sk.shB,sk.elB,sk.wrB,false,P)},
      {back:true, draw:(c,u)=>drawLeg(mkPen(c,u),M,sk.hipB,sk.kneeB,sk.ankleB,false)},
      {draw:(c,u)=>drawTorso(mkPen(c,u),M,sk)},
      {draw:(c,u)=>drawLeg(mkPen(c,u),M,sk.hipF,sk.kneeF,sk.ankleF,true)},
      {draw:(c,u)=>drawHead(mkPen(c,u),M,sk,P)},
      {draw:(c,u)=>drawArm(mkPen(c,u),M,sk.shF,sk.elF,sk.wrF,true,P)},
    ];
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM[form]});
    if(step>=2 && !P.flash) drawShieldOverlay(cv,sk,P,form,step);
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._shield=sc({x:sk.hip.x+19,y:sk.hip.y-16}); cv._hand=sc(sk.wrF); cv._head=sc(sk.H(4,-26));
    cache.set(key,cv); return cv;
  }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,SHIELD,mats,poseOf,frame};
})();
