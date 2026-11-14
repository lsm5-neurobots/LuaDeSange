/* ===== ENFERMEIRA: recruta de medicina em hi-bit (golpe de maleta, Curativo de Plantão) ===== */
const ENFE=(function(){
  const {rad,ramp,lp,lerp,P2,mkPen,compose}=PIX;
  const FW=140, FH=150, GROUND=144, AX=56;
  const SKINS={media:{nome:'Pele média',hex:'#b07a52'}, escura:{nome:'Pele escura',hex:'#6e4430'}, clara:{nome:'Pele clara',hex:'#e2ae88'}};
  const RIM='#a9c8f0';
  function mats(skin){
    return {
      skin:ramp(SKINS[skin].hex),
      hair:['#6a4a34','#3e2a1c','#281a10','#140c06'],
      scrub:['#d4ecf8','#a8cde3','#7aa2c0','#4a6a8a'],
      pants:['#b4d4e8','#8fb6d2','#6690b0','#3e5e7e'],
      mask:['#d8f4f0','#a8d8d4','#78aaa6','#4a7a76'],
      steth:['#4a5260','#2b3140','#1c202c','#0e1018'],
      silver:['#ffffff','#c8ccd4','#8a8ea0','#4a4e60'],
      kit:['#f06a70','#c8323a','#82181e','#4a0a0e'],
      white:['#ffffff','#f0ece0','#b4ae9e','#6c6858'],
      pink:['#f088b0','#d0487a','#902a50','#50142a'],
      pen:['#7ab0ff','#2a62d8','#183c8a','#0a1e4a'],
      shoe:['#ffffff','#e9e5da','#b0a898','#6a6458'],
      glove:['#c0d0ff','#8ea6e0','#5a72b0','#2e3e70'],
      green:['#8ae08a','#3aa84a','#1e6a2a','#0e3a14'],
      iodo:['#e0a060','#a8682a','#6a3e14','#3a200a'],
      eye:['#ffffff','#f2efe6','#b8b4a8','#6e6a60'],
      iris:['#8a5a3a','#4a2a18','#2a180e','#140a06'],
      mouth:['#a04454','#5a1e2e','#2a0c18','#1a0610'],
      teeth:['#fffbe8','#e8e0c0','#b0a680','#6a6040'],
      smear:['#ffffff','#fff6d0','#e8d8a0','#b8a870'],
    };
  }
  const NAMES={skin:'Pele',hair:'Cabelo',scrub:'Pijama (blusa)',pants:'Pijama (calça)',mask:'Máscara',steth:'Estetoscópio',kit:'Maleta',glove:'Luvas',pink:'Xuxinha'};
  const REST={hx:0,lean:2,head:0,aFs:6,aFe:12,aBs:-8,aBe:6,lFh:4,lFk:-2,lBh:-6,lBk:-8,kit:6,kitOn:1,open:0,glove:0,band:0,syringe:0,mouth:0,brow:0,eyes:0,flash:0,smear:0,sa:0,impact:0};
  const th=(p,o)=>4+17*Math.sin(p+o), sh=(p,o)=>th(p,o)-24*Math.max(0,Math.cos(p+o));
  const GUARD={aFs:30,aFe:100,kit:150,aBs:24,aBe:70,lean:4,brow:1,lFh:12,lFk:2,lBh:-12,lBk:-18};
  const ANIMS={
    idle:{nome:'Parada',n:6,dur:()=>170,pose:i=>{ const p=i/6*Math.PI*2, s=Math.sin(p); return {lean:2+0.8*s, head:Math.sin(p-0.6), kit:6+5*Math.sin(p+0.8), aFs:6+1.5*s, aBs:-8+1.5*s, eyes:i===2?1:0}; }},
    walk:{nome:'Andar',n:8,dur:()=>115,pose:i=>{ const p=i/8*Math.PI*2;
      return {lFh:th(p,0),lFk:sh(p,0),lBh:th(p,Math.PI),lBk:sh(p,Math.PI),aFs:6-14*Math.sin(p),aFe:12-14*Math.sin(p),aBs:-6+14*Math.sin(p),aBe:6+14*Math.sin(p),kit:-14*Math.sin(p)+4,lean:4+1*Math.sin(2*p),head:Math.sin(2*p-0.6)}; }},
    guard:{nome:'Guarda (maleta erguida)',n:6,dur:()=>140,pose:i=>{ const p=i/6*Math.PI*2, s=Math.sin(p); return Object.assign({},GUARD,{lean:4+1.2*s, aFs:30+3*s, kit:150+8*Math.sin(p+0.7), head:-2+s}); }},
    combo:{nome:'Combo: golpe de maleta',n:12,hits:{2:1,6:2,10:3},dur:i=>[120,50,60,90,90,40,60,90,140,40,70,170][i],pose:i=>Object.assign({},GUARD,[
      {aFs:-40,aFe:20,kit:160,lean:-6,hx:-3,mouth:1,lFh:10,lBh:-14,lBk:-18},
      {aFs:-20,aFe:40,kit:150,lean:-4,hx:-2,mouth:1},
      {aFs:84,aFe:92,kit:96,lean:10,hx:6,mouth:2,smear:1,sa:200,lFh:22,lFk:6,lBh:-18,lBk:-26},
      {aFs:96,aFe:110,kit:110,lean:12,hx:7,mouth:2,lFh:22,lFk:6,lBh:-18,lBk:-26},
      {aFs:60,aFe:150,kit:200,lean:4,hx:4,mouth:1,lFh:16,lBh:-14,lBk:-20},
      {aFs:30,aFe:60,kit:20,lean:2,hx:3},
      {aFs:110,aFe:140,kit:150,lean:-4,hx:6,mouth:2,smear:2,sa:20,lFh:18,lFk:4,lBh:-16,lBk:-22},
      {aFs:130,aFe:160,kit:170,lean:-6,hx:6,mouth:2},
      {aFs:170,aFe:185,kit:190,lean:-10,hx:3,brow:1,mouth:1,lFh:8,lBh:-10,lBk:-14},
      {aFs:150,aFe:165,kit:175,lean:-8,hx:4},
      {aFs:70,aFe:80,kit:84,lean:22,hx:10,mouth:2,smear:3,sa:200,impact:1,lFh:28,lFk:10,lBh:-22,lBk:-32},
      {aFs:60,aFe:70,kit:60,lean:20,hx:9,mouth:1,lFh:28,lFk:10,lBh:-22,lBk:-32}][i])},
    special:{nome:'Especial: Curativo de Plantão',n:6,dur:i=>[180,200,200,220,260,260][i],pose:i=>[
      {kitOn:2,aFs:40,aFe:80,aBs:30,aBe:60,head:6,brow:0},
      {kitOn:0,open:1,glove:1,band:1,aFs:50,aFe:80,aBs:46,aBe:84,head:8,mouth:1},
      {kitOn:0,open:1,glove:1,band:2,aFs:56,aFe:86,aBs:52,aBe:90,head:8,mouth:1,brow:1},
      {kitOn:0,open:1,glove:1,syringe:1,aFs:120,aFe:160,aBs:40,aBe:70,head:-4,eyes:0},
      {kitOn:0,open:1,glove:1,aFs:40,aFe:70,aBs:30,aBe:60,head:0,eyes:2,mouth:3},
      {kitOn:0,open:1,glove:1,aFs:90,aFe:170,aBs:30,aBe:60,head:-2,eyes:2,mouth:3}][i]},
    hurt:{nome:'Dano',n:4,dur:i=>[80,110,130,160][i],pose:i=>[
      {lean:-14,head:-16,hx:-6,flash:1,aFs:-20,aFe:10,kit:-40,aBs:-30,aBe:-10,mouth:4,brow:2,eyes:1,lFh:14,lBh:-4},
      {lean:-10,head:-12,hx:-5,aFs:-10,aFe:20,kit:-30,aBs:-20,aBe:0,mouth:4,brow:2,eyes:1,lFh:12,lBh:-6},
      {lean:-4,head:-4,hx:-2,kit:-10},
      {}][i]},
  };
  function poseOf(anim,i){ return Object.assign({},REST,ANIMS[anim].pose(i)); }
  function skeleton(P){
    const hip={x:AX+P.hx,y:76};
    const hipF={x:hip.x-3,y:hip.y}, hipB={x:hip.x+3,y:hip.y};
    const kneeF=lp(hipF,P.lFh,21), ankleF=lp(kneeF,P.lFk,21), kneeB=lp(hipB,P.lBh,21), ankleB=lp(kneeB,P.lBk,21);
    const dy=GROUND-Math.max(ankleF.y+4.5, ankleB.y+4.5);
    [hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB].forEach(p=>p.y+=dy);
    const a=rad(P.lean), c=Math.cos(a), s=Math.sin(a);
    const T=(lx,ly)=>({x:hip.x+lx*c-ly*s, y:hip.y+lx*s+ly*c});
    const neck=T(1,-31), shF=T(-3,-27), shB=T(5,-28);
    const ha=rad(P.lean*0.5+P.head), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:neck.x+lx*hc-ly*hs, y:neck.y+lx*hs+ly*hc});
    const elF=lp(shF,P.aFs,13), wrF=lp(elF,P.aFe,12), elB=lp(shB,P.aBs,13), wrB=lp(elB,P.aBe,12);
    return {hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,neck,shF,shB,elF,wrF,elB,wrB,a,ha,H,T};
  }
  function hand(p,M,w,P){ p.F(P.glove?M.glove[1]:M.skin[1]); p.circle(w,3.6); }
  function drawArm(p,M,sh,el,wr,front,P){
    p.id();
    p.F(M.skin[1]); p.cap(sh,el,6.4,5.6); p.cap(el,wr,5.4,4.6);
    p.F(M.scrub[1]); p.cap(sh,lerp(sh,el,0.5),8,7.4);
    if(front){ const b=lerp(sh,el,0.38); p.F(M.white[1]); p.circle(b,3.2); p.F(M.kit[1]); p.rect(b.x-0.6,b.y-1.6,1.2,3.2); p.rect(b.x-1.6,b.y-0.6,3.2,1.2); }
    else { const w=lerp(el,wr,0.85); p.F(M.steth[1]); p.circle(w,2.6); p.F(M.white[1]); p.rect(w.x-0.8,w.y-0.8,1.6,1.6); }
    hand(p,M,wr,P);
  }
  function drawKit(p,M,sk,P){
    if(P.kitOn===0) return;
    p.id(); const w=P.kitOn===2?sk.wrB:sk.wrF; const a=P.kitOn===2?0:P.kit;
    const dir=rad(a), v={x:Math.sin(dir),y:Math.cos(dir)}, n={x:-v.y,y:v.x};
    const top={x:w.x+v.x*4,y:w.y+v.y*4};
    p.F(M.steth[1]); p.cap(w,top,1.6,1.6);
    p.xf(Math.atan2(v.y,v.x),top.x,top.y);
    p.F(M.kit[1]); p.poly([[0,-8.4],[12,-8.4],[12,8.4],[0,8.4]]);
    p.F(M.kit[2]); p.rect(0,-8.4,12,1.4); p.rect(10.6,-8.4,1.4,16.8);
    p.F(M.white[1]); p.rect(4.6,-1.2,4.4,2.4); p.rect(5.6,-2.4,2.4,4.8);
    p.F(M.silver[1]); p.rect(0.4,-1,1.4,2);
    p.id();
  }
  function drawOpenKit(p,M,sk){ p.id(); const x=sk.hip.x-34, y=GROUND;
    p.F(M.kit[1]); p.poly([[x-10,y-1],[x+10,y-1],[x+10,y-8],[x-10,y-8]]); p.F(M.kit[2]); p.poly([[x-10,y-8],[x+10,y-8],[x+12,y-17],[x-8,y-17]]);
    p.F(M.white[1]); p.rect(x-3,y-14,5,2); p.rect(x-1.5,y-15.4,2,4.8); p.F(M.white[0]); p.rect(x-7,y-6,4,3); p.F(M.pink[1]); p.rect(x+2,y-6,5,2); }
  function drawBand(p,M,sk,P){
    p.id();
    if(P.band){ p.F(M.white[1]); const a=sk.wrF, b=sk.wrB; p.cap(a,b,2.4,2.4); if(P.band===2){ const m=lerp(a,b,0.5); p.F(M.white[0]); p.circle(m,3); p.F(M.white[2]); p.circle(m,1.2); } }
    if(P.syringe){ const w=sk.wrF; p.xf(-Math.PI/2+0.3,w.x,w.y); p.F(M.white[0]); p.rect(-1,-1.6,9,3.2); p.F(M.green[1]); p.rect(1,-1,5,2); p.F(M.silver[1]); p.rect(8,-0.4,6,0.8); p.rect(-3,-2.4,2,4.8); p.id(); }
  }
  function drawLeg(p,M,hip,knee,ankle,front){
    p.id();
    p.F(M.pants[1]); p.cap(hip,knee,10,8.6); p.cap(knee,ankle,8.6,7.6);
    p.F(M.pants[0]); p.cap(lerp(hip,knee,0.1),lerp(knee,ankle,0.8),0.8,0.8);
    if(front){ p.F(M.kit[2]); p.circle({x:knee.x+1,y:knee.y},1.4); }
    p.F(M.white[1]); p.cap(lerp(knee,ankle,0.92),ankle,6.4,6.4);
    const a=ankle;
    p.F(M.shoe[1]); p.poly([[a.x-4,a.y-2.6],[a.x+3,a.y-2.8],[a.x+9,a.y+0.4],[a.x+9.8,a.y+3.4],[a.x-4.6,a.y+3.4]]);
    p.F(M.shoe[2]); p.rect(a.x-4.6,a.y+2.6,14.4,1.2);
    p.F(M.iodo[2]); p.rect(a.x+7,a.y+1,2,1.4); p.rect(a.x-4,a.y+1,1.4,1.4);
    p.F(M.shoe[3]); [0,2,4].forEach(d=>p.rect(a.x+d,a.y-1.6,0.9,0.9));
  }
  function drawTorso(p,M,sk,P){
    p.xf(sk.a,sk.hip.x,sk.hip.y);
    p.F(M.scrub[1]); p.poly([[-11,3],[10,3],[10.6,-6],[9.6,-14],[10.6,-22],[8.6,-27.6],[3,-31],[-4,-31],[-9,-27],[-10.6,-18],[-11.4,-6]]);
    p.F(M.scrub[2]); for(let y=-26;y<2;y+=3) for(let x=-9+((y/3)%2?1:0);x<9;x+=3) p.rect(x,y,0.7,0.7);
    p.F(M.skin[1]); p.poly([[-1,-31],[5,-31],[2,-25]]);
    p.F(M.scrub[3]); p.poly([[-2,-31.4],[-1,-31],[2,-25],[1,-24.4]]); p.poly([[6,-31.4],[5,-31],[2,-25],[3,-24.4]]);
    p.F(M.scrub[2]); p.rect(-8,-21,6,6);
    p.F(M.pen[1]); p.rect(-7,-23,1,3); p.F(M.kit[1]); p.rect(-5,-23,1,3); p.F(M.white[1]); p.ell(-3.2,-21.4,1.4,1.4);
    p.F(M.green[1]); p.rect(3,-25,0.8,7); p.F(M.white[1]); p.rect(1.4,-18.4,4,5); p.F(M.pen[1]); p.rect(1.4,-18.4,4,1);
    p.F(M.iodo[1]); p.ell(6,-8,1.6,1.2); p.F(M.kit[2]); p.rect(-6,0,1,1); p.rect(-3,1,1,1);
    p.F(M.scrub[2]); p.rect(-11,1,21,1);
    if(!P.glove||true){ p.F(M.steth[1]); p.cap(P2(-3,-30),P2(-5,-18),1.6,1.6); p.cap(P2(5,-30),P2(7.4,-14),1.6,1.6); p.F(M.silver[1]); p.ell(7.6,-13,2.4,2.4); p.F(M.silver[0]); p.rect(7,-14,1,1); p.F(M.silver[1]); p.rect(-6,-18,2,1); }
    p.id();
  }
  function drawHead(p,M,sk,P){
    p.xf(sk.ha,sk.neck.x,sk.neck.y);
    // coque com caneta e xuxinha
    p.F(M.pen[1]); p.cap(P2(-16,-26),P2(-6,-31),1.6,1.6); p.F(M.white[0]); p.rect(-15,-27,3,1);
    p.F(M.hair[1]); p.ell(-10,-26,6,5.4);
    p.F(M.hair[2]); p.rect(-13,-27,6,0.8); p.rect(-12,-24.6,5,0.8);
    p.F(M.pink[1]); p.ell(-7,-23,2.2,2);
    p.F(M.skin[1]); p.cap(P2(0,3),P2(1,-6),7.6,7);
    p.F(M.skin[1]); p.ell(-4.4,-12.6,2.4,3.4); p.ell(2.4,-14,9.4,9.4);
    p.poly([[-2,-8],[10.2,-9.4],[11.6,-5.6],[8.6,-1.6],[2,-1.2]]);
    p.F(M.skin[3]); p.ell(-4.4,-12.6,1,2);
    p.F(M.gold?M.white[1]:M.white[1]); p.rect(-4.4,-9.4,0.9,0.9);
    // cabelo
    p.F(M.hair[1]); p.poly([[-9.6,-14],[-9,-21],[-3,-24],[4,-24],[9.4,-21],[11,-16.6],[7,-18.6],[4,-20.4],[1,-18],[-3,-17.6],[-7,-13]]);
    p.F(M.hair[2]); p.cap(P2(9,-17),P2(10.4,-11),1,0.8);
    // olhos
    if(P.eyes===1){ p.F(M.mouth[2]); p.rect(5,-13.4,4.6,0.9); }
    else if(P.eyes===2){ p.F(M.mouth[2]); p.poly([[5,-13],[7,-15],[9.4,-13],[8.6,-12.6],[7,-14],[5.8,-12.6]]); }
    else { p.F(M.eye[1]); p.ell(7,-13.6,2.4,2.1); p.F(M.iris[1]); p.rect(7.6,-14.6,1.6,2.2); p.F(M.eye[0]); p.rect(8,-14.6,0.8,0.8); p.F(M.hair[2]); p.rect(5,-15.8,4.6,0.8); }
    p.F(M.skin[2]); p.rect(5,-11.4,4.4,0.8);
    p.F(M.kit[0]); p.ell(9,-9.4,1.4,0.9);
    p.F(M.hair[2]); if(P.brow===1) p.poly([[4.4,-18],[10,-16.6],[10,-15.8],[4.4,-17.2]]); else if(P.brow===2) p.poly([[4.4,-19],[10,-19],[10,-18.2],[4.4,-18.2]]); else p.rect(4.4,-17.4,5.6,0.8);
    p.F(M.skin[1]); p.poly([[10,-13.6],[13,-10],[10.4,-9.6]]);
    if(P.mouth===2){ p.F(M.mouth[1]); p.ell(9.4,-5.6,1.6,1.4); }
    else if(P.mouth===1){ p.F(M.teeth[1]); p.rect(7.6,-6.4,4,1.2); }
    else if(P.mouth===3){ p.F(M.mouth[1]); p.poly([[7.4,-6.6],[11.6,-7],[11,-5],[8,-5]]); }
    else if(P.mouth===4){ p.F(M.mouth[1]); p.ell(9.6,-5.4,1.2,1.4); }
    else { p.F(M.mouth[2]); p.rect(7.8,-6,3.6,0.8); }
    // máscara no queixo
    p.F(M.mask[1]); p.poly([[2,-3.4],[11.4,-4],[11,0.4],[3,1]]); p.F(M.mask[2]); p.rect(3,-2.4,8,0.7); p.rect(3,-0.8,8,0.7);
    p.F(M.white[1]); p.cap(P2(2,-2.6),P2(-4,-11),0.7,0.7);
    p.id();
  }
  function drawSmear(p,M,sk,P){
    p.id(); p.F(M.smear[1]);
    const dir=rad(P.kit), tip={x:sk.wrF.x+Math.sin(dir)*18,y:sk.wrF.y+Math.cos(dir)*18}, sh=sk.shF;
    const cur=Math.atan2(tip.x-sh.x,tip.y-sh.y)*180/Math.PI, r1=Math.hypot(tip.x-sh.x,tip.y-sh.y)+4, r0=r1-12;
    const n=10, pts=[];
    for(let k=0;k<=n;k++){ const a=P.sa+(cur-P.sa)*k/n; pts.push([sh.x+Math.sin(rad(a))*r1, sh.y+Math.cos(rad(a))*r1]); }
    for(let k=n;k>=0;k--){ const a=P.sa+(cur-P.sa)*k/n, rr=r0+(r1-r0)*(1-k/n)*0.6; pts.push([sh.x+Math.sin(rad(a))*rr, sh.y+Math.cos(rad(a))*rr]); }
    p.poly(pts);
  }
  const cache=new Map();
  function frame(skin,anim,fi,step=5){
    const K=PIX.getK(), key=skin+anim+fi+step+'@'+K; if(cache.has(key)) return cache.get(key);
    const P=poseOf(anim,fi), M=mats(skin), sk=skeleton(P);
    const parts=[];
    if(P.open) parts.push({draw:(c,u)=>drawOpenKit(mkPen(c,u),M,sk)});
    parts.push({back:true, draw:(c,u)=>drawArm(mkPen(c,u),M,sk.shB,sk.elB,sk.wrB,false,P)});
    parts.push({back:true, draw:(c,u)=>drawLeg(mkPen(c,u),M,sk.hipB,sk.kneeB,sk.ankleB,false)});
    parts.push({draw:(c,u)=>drawTorso(mkPen(c,u),M,sk,P)});
    parts.push({draw:(c,u)=>drawLeg(mkPen(c,u),M,sk.hipF,sk.kneeF,sk.ankleF,true)});
    parts.push({draw:(c,u)=>drawHead(mkPen(c,u),M,sk,P)});
    if(P.smear) parts.push({noShade:true,smear:true,draw:(c,u)=>drawSmear(mkPen(c,u),M,sk,P)});
    parts.push({draw:(c,u)=>drawKit(mkPen(c,u),M,sk,P)});
    parts.push({draw:(c,u)=>drawArm(mkPen(c,u),M,sk.shF,sk.elF,sk.wrF,true,P)});
    if(P.band||P.syringe) parts.push({draw:(c,u)=>drawBand(mkPen(c,u),M,sk,P)});
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM});
    const sc=q=>({x:q.x*K,y:q.y*K}), dir=rad(P.kit);
    cv._tip=sc({x:sk.wrF.x+Math.sin(dir)*16,y:sk.wrF.y+Math.cos(dir)*16}); cv._hand=sc(sk.wrF); cv._mouth=sc(sk.H(16,-5)); cv._head=sc(sk.H(2,-26)); cv._hip=sc(sk.hip);
    cache.set(key,cv); return cv;
  }
  return {FW,FH,GROUND,AX,SKINS,ANIMS,NAMES,poseOf,frame,mats};
})();
