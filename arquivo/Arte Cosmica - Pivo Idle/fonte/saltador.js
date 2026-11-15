/* ===== SALTADOR (nº 009): agachado de capuz que salta 4 tiles e prende ===== */
const SALT=(function(){
  const {rad,lp,lerp,P2,ik,mkPen,compose}=PIX;
  const FW=128, FH=110, GROUND=104, AX=52;
  const RIM={comum:'#b8e8a0', enluarado:'#c8f8ff', plenilunar:'#ffb0d8'};
  function mats(form){
    const m={
      skin:['#a8b874','#6e7e46','#48562e','#2a341c'],
      hood:['#76767e','#48484f','#2f2f36','#1a1a20'],
      pants:['#62626c','#3e3e48','#2a2a30','#16161a'],
      tape:['#f2f2fa','#b8b8c4','#7e7e8c','#4a4a58'],
      eye:['#efffd8','#a6ff6a','#4ac83a','#1a7a1a'],
      mouth:['#5a1a22','#300c12','#1e060a','#100306'],
      teeth:['#f4ecc0','#d4c48a','#9a8a58','#5a4e30'],
      claw:['#e0d8b8','#aa9c72','#6c6042','#3a3020'],
      cord:['#d8d8e0','#9a9aa6','#62626e','#383844'],
    };
    if(form==='enluarado'){ m.skin=['#c0f4ff','#5ac8e0','#2e8aa8','#185870']; m.eye=['#ffffff','#f0faff','#b0d8f0','#6a9ab8']; }
    if(form==='plenilunar'){ m.skin=['#d07aa4','#8a3a6a','#5a1e48','#34102a']; m.eye=['#ffe8f4','#ff6aa8','#c83a6a','#7a1a3a']; }
    return m;
  }
  const NAMES={skin:'Pele',hood:'Moletom/capuz',pants:'Calça de moletom',tape:'Fita adesiva',eye:'Olhos',claw:'Garras',teeth:'Dentes'};
  // pose: agachado tipo sapo — coxa apontando pra cima/frente, canela pra baixo, mãos no chão entre os pés
  const REST={hx:0,lean:66,head:-56,lFh:150,lFk:8,lBh:140,lBk:-2,hfx:24,hbx:17,air:0,armF:0,flash:0,jaw:0,shake:0};
  const ANIMS={
    idle:{nome:'Parado (agachado)',n:6,dur:()=>160,pose:i=>{ const p=i/6*Math.PI*2, s=Math.sin(p); return {hx:1.6*s, lean:66+2*Math.sin(p+0.6), head:-56-3*Math.sin(p-0.4), hfx:20+1.2*s, jaw:Math.max(0,s)*0.6}; }},
    walk:{nome:'Andar (aos saltinhos)',n:6,dur:()=>110,pose:i=>[
      {hfx:28,hbx:22,lean:60,lFh:150,lBh:140},
      {hfx:30,hbx:24,lean:56,lFh:120,lFk:20,lBh:110,lBk:14,hx:2},
      {hfx:24,hbx:20,lean:62,lFh:100,lFk:30,lBh:95,lBk:22,hx:5},
      {hfx:18,hbx:14,lean:68,lFh:140,lFk:10,lBh:130,lBk:2,hx:6},
      {hfx:16,hbx:12,lean:70,lFh:156,lFk:6,lBh:146,lBk:-4,hx:4},
      {hfx:22,hbx:16,lean:66,lFh:150,lFk:8,lBh:140,lBk:-2,hx:1}][i]},
    attack:{nome:'Salto e bote',n:10,warn:[0,1,2,3],air:[5,6],land:7,dur:i=>[200,200,200,200,70,280,220,220,170,170][i],pose:i=>[
      {lean:74,head:-62,lFh:162,lFk:2,lBh:154,lBk:-8,hfx:16,hbx:10,shake:1,jaw:1},
      {lean:76,head:-64,lFh:164,lFk:0,lBh:156,lBk:-10,hfx:15,hbx:9,shake:-1,jaw:1, hx:-1},
      {lean:77,head:-64,lFh:165,lFk:0,lBh:157,lBk:-10,hfx:14,hbx:9,shake:1,jaw:1, hx:1},
      {lean:78,head:-66,lFh:166,lFk:-2,lBh:158,lBk:-12,hfx:14,hbx:8,shake:-1,jaw:1, hx:-1},
      {lean:40,head:-34,lFh:40,lFk:10,lBh:20,lBk:-10,armF:1,jaw:2},
      {air:1,lean:20,head:-14,lFh:-40,lFk:-80,lBh:-30,lBk:-70,armF:1,jaw:3},
      {air:1,lean:34,head:-24,lFh:30,lFk:-30,lBh:10,lBk:-40,armF:2,jaw:3},
      {lean:82,head:-70,lFh:168,lFk:-4,lBh:160,lBk:-14,hfx:34,hbx:28,jaw:3},
      {lean:74,head:-62,lFh:160,lFk:2,lBh:150,lBk:-6,hfx:28,hbx:22,jaw:2},
      {lean:68,head:-58,lFh:152,lFk:6,lBh:142,lBk:-2,hfx:22,hbx:16,jaw:1}][i]},
    hurt:{nome:'Dano',n:4,dur:i=>[80,110,120,150][i],pose:i=>[
      {lean:40,head:-20,hx:-6,flash:1,lFh:120,lFk:20,jaw:3,hfx:6,hbx:2},
      {lean:48,head:-30,hx:-5,lFh:130,lFk:14,jaw:2,hfx:10,hbx:6},
      {lean:60,head:-48,hx:-2},
      {}][i]},
  };
  function poseOf(anim,i){ return Object.assign({},REST,ANIMS[anim].pose(i)); }
  function skeleton(P){
    const hip={x:AX+P.hx,y:64};
    const hipF={x:hip.x+2,y:hip.y}, hipB={x:hip.x-2,y:hip.y};
    const kneeF=lp(hipF,P.lFh,25), ankleF=lp(kneeF,P.lFk,26), kneeB=lp(hipB,P.lBh,25), ankleB=lp(kneeB,P.lBk,26);
    let dy=P.air?(GROUND-36)-hip.y:GROUND-Math.max(ankleF.y+3.5, ankleB.y+3.5);
    [hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB].forEach(p=>p.y+=dy);
    const a=rad(P.lean), c=Math.cos(a), s=Math.sin(a);
    const T=(lx,ly)=>({x:hip.x+lx*c-ly*s, y:hip.y+lx*s+ly*c});
    const neck=T(2,-29), shF=T(5,-25), shB=T(-3,-26);
    const ha=rad(P.lean+P.head), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:neck.x+lx*hc-ly*hs, y:neck.y+lx*hs+ly*hc});
    let tF,tB;
    if(P.armF){ const r=P.armF===2?28:24; tF={x:shF.x+r,y:shF.y+(P.armF===2?10:-2)}; tB={x:shB.x+r-4,y:shB.y+(P.armF===2?12:0)}; }
    else { tF={x:hip.x+P.hfx,y:GROUND-3}; tB={x:hip.x+P.hbx,y:GROUND-3}; if(P.air){ tF.y=shF.y+20; tB.y=shB.y+20; } }
    const F=ik(shF,tF,18,18,false), B=ik(shB,tB,18,18,false);
    return {hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,neck,shF,shB,elF:F.E,wrF:F.W,elB:B.E,wrB:B.W,a,ha,H,T,eye:H(7,-13.5),mouth:H(9,-7),air:P.air};
  }
  function drawArm(p,M,sh,el,wr,front,P){
    p.id();
    p.F(M.hood[1]); p.cap(sh,el,7,6.2); p.cap(el,lerp(el,wr,0.7),6,5.2);
    p.F(M.skin[1]); p.circle(el,1.8); p.cap(lerp(el,wr,0.68),wr,4.2,3.8);
    p.F(M.hood[2]); p.circle(lerp(sh,el,0.5),1);
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y);
    p.F(M.skin[1]); p.poly([[-0.6,-2.6],[4,-3],[4.8,3],[-0.6,2.6]]);
    const flat=!P.armF && !P.air;
    for(let k=0;k<3;k++){ const y0=-2+k*2; const t=flat?P2(7.4,y0+2.4):P2(10.4,y0*1.4);
      p.F(M.skin[1]); p.cap(P2(4.2,y0),t,1.7,1.3); p.F(M.claw[1]); p.poly([[t.x-0.6,t.y-0.9],[t.x+2.6,t.y+(flat?1.6:0.4)],[t.x-0.4,t.y+0.9]]); }
    p.id();
  }
  function drawLeg(p,M,hip,knee,ankle,front){
    p.id();
    p.F(M.pants[1]); p.cap(hip,knee,9,7.6); p.cap(knee,ankle,7.4,6);
    if(front){ p.F(M.skin[2]); p.ell(knee.x,knee.y,2.4,2); p.F(M.pants[0]); p.cap(lerp(hip,knee,0.2),lerp(hip,knee,0.8),0.8,0.8); }
    p.F(M.pants[2]); p.rect(ankle.x-3.6,ankle.y-2.6,7.2,1.4);
    const a=ankle; p.F(M.skin[1]); p.poly([[a.x-3,a.y-1.4],[a.x+3,a.y-1.4],[a.x+9,a.y+1.6],[a.x+9.6,a.y+3.4],[a.x-3.4,a.y+3.4]]);
    p.F(M.claw[1]); [[8.6,2.4],[6.8,2.8],[5,3]].forEach(([dx,dy])=>p.rect(a.x+dx,a.y+dy,1.2,1));
    p.F(M.skin[2]); p.rect(a.x+4,a.y+1,1,2.2); p.rect(a.x+6.2,a.y+1.2,1,2);
  }
  function drawTorso(p,M,sk){
    p.xf(sk.a,sk.hip.x,sk.hip.y);
    p.F(M.hood[1]); p.poly([[-9.6,2],[9,2],[9.6,-8],[9,-16],[10,-22],[7,-28],[0,-31],[-7,-30],[-11,-24],[-12,-14],[-11,-5]]);
    p.F(M.hood[2]); p.poly([[-9,-3],[6,-3],[5,4],[-8,4]]); p.rect(-2,-26,1,20);
    // rasgos nas costas
    p.F(M.skin[2]); p.poly([[-11,-20],[-8,-22],[-7.4,-16],[-10.6,-14]]); p.poly([[-10.6,-10],[-8.6,-11],[-8,-7],[-10.4,-6.4]]);
    // fita adesiva no peito
    p.F(M.tape[1]); p.poly([[1,-23],[9.4,-17],[8.4,-15],[0,-21]]);
    p.F(M.tape[2]); p.rect(3.6,-19.8,0.8,1.6); p.rect(6.2,-18,0.8,1.6);
    p.F(M.hood[0]); p.rect(-1,-29,8,1);
    p.id();
  }
  function drawHead(p,M,sk,P){
    p.xf(sk.ha,sk.neck.x,sk.neck.y);
    p.F(M.hood[1]); p.ell(1,-12.6,10.2,10.8); p.poly([[-9,-6],[8,-4],[12,-6],[10,2],[-6,3]]);
    p.F(M.hood[0]); p.ell(5.6,-11.4,7.4,8.4);
    p.F(M.mouth[2]); p.ell(6.2,-11.2,6.2,7.2);
    p.F(M.eye[1]); p.ell(5.4,-13.6,1.9,1.5); p.ell(9.8,-13.4,1.5,1.2);
    p.F(M.eye[0]); p.rect(5.2,-14,0.8,0.8);
    const o=P.jaw; p.F(M.mouth[0]); p.poly([[4,-8.6],[11,-8.8],[10.6,-6.6+o*0.9],[4.6,-6.4+o*0.9]]);
    p.F(M.teeth[1]); for(let k=0;k<4;k++){ p.rect(4.8+k*1.6,-8.6,1,1.2); p.rect(5.2+k*1.5,-7.6+o*0.9,1,1); }
    p.F(M.cord[1]); p.cap(P2(4,-2),P2(4.6,4),0.9,0.9); p.cap(P2(8,-2),P2(8.4,3.4),0.9,0.9); p.F(M.cord[0]); p.rect(4.2,4,1,1); p.rect(8,3.4,1,1);
    p.F(M.hood[2]); p.poly([[-8,-18],[-3,-23],[-1,-22],[-6,-15]]);
    p.id();
  }
  const cache=new Map();
  function frame(form,anim,fi,step=5){
    const K=PIX.getK(), key=form+anim+fi+step+'@'+K; if(cache.has(key)) return cache.get(key);
    const P=poseOf(anim,fi), M=mats(form), sk=skeleton(P);
    const parts=[
      {back:true, draw:(c,u)=>drawArm(mkPen(c,u),M,sk.shB,sk.elB,sk.wrB,false,P)},
      {back:true, draw:(c,u)=>drawLeg(mkPen(c,u),M,sk.hipB,sk.kneeB,sk.ankleB,false)},
      {draw:(c,u)=>drawTorso(mkPen(c,u),M,sk)},
      {draw:(c,u)=>drawHead(mkPen(c,u),M,sk,P)},
      {draw:(c,u)=>drawLeg(mkPen(c,u),M,sk.hipF,sk.kneeF,sk.ankleF,true)},
      {draw:(c,u)=>drawArm(mkPen(c,u),M,sk.shF,sk.elF,sk.wrF,true,P)},
    ];
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM[form]});
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._eye=sc(sk.eye); cv._eye2=sc(sk.H(9.6,-13.4)); cv._mouth=sc(sk.mouth); cv._hand=sc(sk.wrF);
    cache.set(key,cv); return cv;
  }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame};
})();
