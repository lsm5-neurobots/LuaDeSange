/* ===== CATADORA: recruta em hi-bit (gancho de vergalhão + bag de ráfia) ===== */
const CATA=(function(){
  const {rad,ramp,lp,lerp,P2,ik,mkPen,compose}=PIX;
  const FW=136, FH=150, GROUND=144, AX=58;
  const SKINS={media:{nome:'Pele média',hex:'#b47a4e'}, escura:{nome:'Pele escura',hex:'#7a4a2e'}, clara:{nome:'Pele clara',hex:'#e2ac84'}};
  const RIM='#a9c8f0', HOOKLEN=36;
  function mats(skin){
    return {
      skin:ramp(SKINS[skin].hex),
      hair:['#4a3428','#2a1c16','#1a100c','#0e0806'],
      scarf:['#e0574a','#c4372c','#8a2420','#4e1410'],
      flower:['#fff6c0','#f2c230','#a8801a','#5a420a'],
      leaf:['#6abf5a','#3f8a3a','#2a5e28','#163418'],
      shirt:['#7fa070','#4f7d4a','#365a34','#1f3620'],
      patch:['#ecdcb4','#d8c49a','#a08a62','#6a4a2a'],
      jeans:['#8a9ab0','#5d6f86','#40506a','#262e42'],
      red:['#e86a5a','#c03a2a','#7a1e18','#40100c'],
      cord:['#e0cc94','#c8b27a','#8e7a4e','#54482a'],
      glove:['#fff0a0','#e8b830','#a8781a','#5a3e0a'],
      sole:['#4ab05a','#2f8a3a','#1e5e26','#103418'],
      strap:['#4a74d0','#2a4fa0','#1a3470','#0e1c40'],
      bag:['#f6f0e0','#e6dfcc','#c8bfa6','#8a8270'],
      bagblue:['#5a84c8','#3a64a8','#284678','#162848'],
      brown:['#8a6040','#6a4428','#4a2e18','#2a1a0c'],
      pet:['#9ae0b0','#5fb07a','#3a7a52','#1e4a30'],
      can:['#ff8a7a','#d83a2a','#8a1a14','#4a0a08'],
      steel:['#e0e6ee','#a8b0ba','#6e7682','#3e4450'],
      rust:['#c07a4a','#8a4a24','#5a2e14','#30180a'],
      tape:['#4a4a52','#1a1a1e','#101012','#060608'],
      gold:['#ffe27a','#e3b23c','#9a7418','#4a380c'],
      eye:['#ffffff','#f2efe6','#b8b4a8','#6e6a60'],
      iris:['#8a5a3a','#4a2a18','#2a180e','#140a06'],
      mouth:['#8a3444','#4a1828','#2a0c18','#1a0610'],
      teeth:['#fffbe8','#e8e0c0','#b0a680','#6a6040'],
      smear:['#ffffff','#fff6d0','#e8d8a0','#b8a870'],
    };
  }
  const REST={hx:0,lean:4,head:2,aFs:14,aFe:10,aBs:-6,aBe:4,lFh:6,lFk:-2,lBh:-8,lBk:-10,bat:-6,mouth:0,brow:0,smear:0,sa:0,flash:0,can:0,bagB:0,tail:0,eyes:0};
  const GUARD={aFs:26,aFe:74,bat:52,aBs:20,aBe:60,lean:6,brow:1,mouth:3,lFh:12,lFk:2,lBh:-12,lBk:-18};
  const th=(p,o)=>5+17*Math.sin(p+o), sh=(p,o)=>th(p,o)-24*Math.max(0,Math.cos(p+o));
  const ANIMS={
    idle:{nome:'Parada (gancho de bengala)',n:6,dur:()=>160,pose:i=>{ const p=i/6*Math.PI*2, s=Math.sin(p); return {lean:4+0.8*s, head:2+Math.sin(p-0.7), aFs:14+1.5*s, aFe:10+1.5*s, aBs:-6+2*s, aBe:4+2*s, tail:Math.sin(p)*0.6, bagB:Math.round(s*0.6), eyes:i===3?1:0}; }},
    walk:{nome:'Andar',n:8,dur:()=>115,pose:i=>{ const p=i/8*Math.PI*2;
      return {lFh:th(p,0), lFk:sh(p,0), lBh:th(p,Math.PI), lBk:sh(p,Math.PI), aFs:14+8*Math.sin(p+Math.PI), aFe:8+10*Math.sin(p+Math.PI), aBs:-6+16*Math.sin(p), aBe:4+16*Math.sin(p), lean:5+1.5*Math.sin(2*p), head:2+Math.sin(2*p-0.6), tail:Math.sin(p+Math.PI), bagB:Math.round(Math.sin(2*p-1)*1.4)}; }},
    guard:{nome:'Guarda',n:6,dur:()=>130,pose:i=>{ const p=i/6*Math.PI*2, s=Math.sin(p); return Object.assign({},GUARD,{lean:6+1.2*s, aFs:26+3*s, aFe:74+4*s, aBs:20+2*s, head:-1+s, tail:s*0.5}); }},
    combo:{nome:'Combo de 3 ganchadas',n:12,hits:{2:1,6:2,10:3},dur:i=>[120,50,60,90,90,40,60,90,130,40,70,170][i],pose:i=>Object.assign({},GUARD,[
      {aFs:-40,aFe:0,bat:150,lean:-6,head:-4,hx:-3,lFh:10,lBh:-14,lBk:-18,tail:-1},
      {aFs:-20,aFe:40,bat:120,lean:-4,hx:-2,lFh:12,lBh:-14,lBk:-18,tail:-1},
      {aFs:96,aFe:110,bat:-10,lean:12,hx:6,mouth:1,smear:1,sa:190,lFh:22,lFk:6,lBh:-18,lBk:-26,tail:1},
      {aFs:104,aFe:122,bat:-14,lean:14,hx:7,mouth:1,lFh:22,lFk:6,lBh:-18,lBk:-26,tail:1},
      {aFs:70,aFe:140,bat:40,lean:6,hx:4,lFh:16,lBh:-14,lBk:-20},
      {aFs:30,aFe:50,bat:-40,lean:4,hx:3,lFh:16,lBh:-14,lBk:-20},
      {aFs:116,aFe:146,bat:16,lean:-2,hx:6,mouth:1,smear:2,sa:20,lFh:18,lFk:4,lBh:-16,lBk:-22,tail:-1},
      {aFs:136,aFe:166,bat:10,lean:-4,hx:6,mouth:1,lFh:18,lFk:4,lBh:-16,lBk:-22},
      {aFs:168,aFe:190,bat:8,lean:-8,hx:3,brow:1,lFh:8,lBh:-10,lBk:-14,mouth:1,tail:-1},
      {aFs:150,aFe:162,bat:18,lean:-6,hx:4,lFh:8,lBh:-10,lBk:-14},
      {aFs:74,aFe:82,bat:18,lean:22,hx:10,mouth:2,smear:3,sa:200,impact:1,lFh:28,lFk:10,lBh:-22,lBk:-32,tail:1.4,bagB:2},
      {aFs:64,aFe:72,bat:26,lean:20,hx:9,mouth:1,lFh:28,lFk:10,lBh:-22,lBk:-32,tail:1}][i])},
    special:{nome:'Especial: fisgar sucata',n:7,dur:i=>[180,140,130,150,130,170,150][i],pose:i=>[
      {brow:2,mouth:4,lean:10,head:12,aFs:20,aFe:20,bat:-4},
      {lean:24,head:16,aFs:56,aFe:44,bat:-4,lFh:16,lFk:4,lBh:-14,lBk:-20,brow:2,mouth:4},
      {lean:24,head:14,aFs:62,aFe:48,bat:-10,can:1,lFh:16,lFk:4,lBh:-14,lBk:-20,mouth:3},
      {lean:0,head:-6,aFs:150,aFe:172,bat:6,can:1,lFh:10,lBh:-10,mouth:3},
      {lean:-6,head:-10,aFs:190,aFe:216,bat:4,can:1,lFh:8,lBh:-8,mouth:1},
      {lean:2,head:-2,aFs:40,aFe:50,bat:10,bagB:-3,mouth:5,eyes:2},
      {lean:4,mouth:5,eyes:2,bagB:1}][i]},
    hurt:{nome:'Dano',n:4,dur:i=>[80,110,130,160][i],pose:i=>Object.assign({},GUARD,[
      {lean:-14,head:-16,hx:-6,flash:1,aFs:-10,aFe:20,bat:90,aBs:-30,aBe:-10,mouth:6,brow:2,lFh:14,lBh:-4,tail:-1.6,bagB:-2},
      {lean:-10,head:-12,hx:-5,aFs:0,aFe:30,bat:80,aBs:-20,aBe:0,mouth:6,brow:2,lFh:12,lBh:-6,tail:-1.2},
      {lean:-4,head:-4,hx:-2,aFs:14,aFe:50,mouth:0},
      {}][i])},
  };
  function poseOf(anim,i){ return Object.assign({},REST,ANIMS[anim].pose(i)); }
  function skeleton(P){
    const hip={x:AX+P.hx,y:76};
    const hipF={x:hip.x-3,y:hip.y}, hipB={x:hip.x+3,y:hip.y};
    const kneeF=lp(hipF,P.lFh,22), ankleF=lp(kneeF,P.lFk,22), kneeB=lp(hipB,P.lBh,22), ankleB=lp(kneeB,P.lBk,22);
    const dy=GROUND-Math.max(ankleF.y+4.5, ankleB.y+4.5);
    [hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB].forEach(p=>p.y+=dy);
    const a=rad(P.lean), c=Math.cos(a), s=Math.sin(a);
    const T=(lx,ly)=>({x:hip.x+lx*c-ly*s, y:hip.y+lx*s+ly*c});
    const neck=T(1,-31), shF=T(-4,-27), shB=T(5,-28);
    const ha=rad(P.lean+P.head), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:neck.x+lx*hc-ly*hs, y:neck.y+lx*hs+ly*hc});
    const elF=lp(shF,P.aFs,13), wrF=lp(elF,P.aFe,13), elB=lp(shB,P.aBs,13), wrB=lp(elB,P.aBe,12);
    const bAng=P.aFe+P.bat, bDir=Math.atan2(Math.cos(rad(bAng)),Math.sin(rad(bAng)));
    return {hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,neck,shF,shB,elF,wrF,elB,wrB,a,ha,H,T,bDir,bAng};
  }
  function drawHook(p,M,base,ang,P){
    const L=HOOKLEN; p.xf(ang,base.x,base.y);
    p.F(M.tape[1]); p.cap(P2(-5,0),P2(6,0),3.8,3.8); p.F(M.red[1]); p.rect(1,-1.9,1.6,3.8);
    p.F(M.steel[1]); p.cap(P2(6,0),P2(L-5,0),2.4,2.2);
    p.F(M.steel[0]); p.rect(8,-1,L-14,0.8);
    p.F(M.rust[1]); [[12,0],[20,0.2],[27,-0.4]].forEach(([x,y])=>p.rect(x,y-1,1.6,1.6));
    p.F(M.steel[1]); p.cap(P2(L-5,0),P2(L-1,-1.6),2.2,2.2); p.cap(P2(L-1,-1.6),P2(L-1,-5),2.2,2); p.cap(P2(L-1,-5),P2(L-4.4,-6.6),2,1.6);
    if(P.can){ p.F(M.can[1]); p.poly([[L-6,-8],[L+1,-8.6],[L+1.4,-3],[L-5.6,-2.4]]); p.F(M.steel[0]); p.rect(L-6,-8.4,7,1); p.F(M.can[0]); p.rect(L-4,-7,1,3.6); }
    p.id();
  }
  function drawArm(p,M,sh,el,wr,front){
    p.id();
    p.F(M.skin[1]); p.cap(sh,el,5,4.4); p.cap(el,wr,4.2,3.6);
    p.F(M.shirt[1]); p.cap(sh,lerp(sh,el,0.62),7.4,6.6);
    p.F(M.shirt[2]); p.cap(lerp(sh,el,0.5),lerp(sh,el,0.62),7,6.6);
    p.F(M.glove[1]); p.cap(lerp(el,wr,0.66),wr,5,5.2);
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y);
    p.F(M.glove[1]); p.ell(1.6,0,4.2,4); p.F(M.glove[2]); p.rect(2.6,-2.4,0.9,4.8); p.F(M.glove[0]); p.ell(0.6,-2,1.2,0.8);
    p.F(M.brown[2]); p.rect(0,1,1.2,1.2);
    p.id();
  }
  function drawLeg(p,M,hip,knee,ankle,front){
    p.id();
    p.F(M.jeans[1]); p.cap(hip,knee,11.4,10); p.cap(knee,lerp(knee,ankle,0.62),10,9.4);
    p.F(M.jeans[0]); p.cap(lerp(knee,ankle,0.55),lerp(knee,ankle,0.7),10.4,10);
    if(front){ p.F(M.red[1]); p.ell(knee.x+0.6,knee.y,3.2,2.8); p.F(M.tape[1]); p.rect(knee.x-1,knee.y-2.6,0.9,5.2); p.rect(knee.x-3,knee.y-0.4,6,0.9); }
    p.F(M.skin[1]); p.cap(lerp(knee,ankle,0.7),ankle,5.6,5);
    const a=ankle;
    p.F(M.skin[1]); p.poly([[a.x-3,a.y-1],[a.x+3,a.y-1.4],[a.x+8.4,a.y+1.8],[a.x+8.6,a.y+3.6],[a.x-3.4,a.y+3.6]]);
    p.F(M.sole[1]); p.rect(a.x-4,a.y+3.2,13.4,1.8); p.F(M.flower[1]); p.rect(a.x-4,a.y+3.2,13.4,0.7);
    p.F(M.strap[1]); p.poly([[a.x+4,a.y+0.4],[a.x+5,a.y+0.4],[a.x+1,a.y+3.4],[a.x-0.4,a.y+3.4]]); p.poly([[a.x+4,a.y+0.4],[a.x+5,a.y+0.4],[a.x+7.6,a.y+3.2],[a.x+6.4,a.y+3.2]]);
  }
  function drawBag(p,M,sk,P){
    p.xf(sk.a,sk.hip.x,sk.hip.y); const b=P.bagB||0;
    // itens saindo da boca
    p.F(M.pet[1]); p.cap(P2(-16,-44+b),P2(-15,-34+b),4.6,5); p.F(M.bagblue[1]); p.rect(-17.4,-47.6+b,3.4,2.4);
    p.F(M.can[1]); p.poly([[-10,-41+b],[-5,-42+b],[-4.6,-35+b],[-9.6,-34+b]]); p.F(M.steel[0]); p.rect(-10,-41.6+b,5.4,1);
    p.F(M.brown[1]); p.poly([[-23,-40+b],[-17,-43+b],[-16,-34+b],[-22,-33+b]]);
    p.F(M.red[0]); p.ell(-12.6,-35+b,3,1.6);
    // saco
    p.F(M.bag[1]); p.poly([[-25,-37+b],[-6,-38+b],[-4,-26+b],[-5,-10+b],[-11,-5+b],[-23,-6+b],[-27,-14+b],[-27,-28+b]]);
    p.F(M.bag[2]); for(let y=-34;y<-6;y+=3) p.rect(-26,y+b,21,0.8); for(let x=-24;x<-6;x+=3) p.rect(x,-36+b,0.8,30);
    p.F(M.bagblue[1]); p.poly([[-27,-21+b],[-4.4,-22+b],[-4.4,-18.6+b],[-27,-17.6+b]]);
    p.F(M.bag[0]); p.rect(-25,-36.6+b,18,1.2);
    p.id();
  }
  function drawTorso(p,M,sk,P){
    p.xf(sk.a,sk.hip.x,sk.hip.y);
    p.F(M.shirt[1]); p.poly([[-10.4,1],[9.4,1],[10,-7],[11.4,-15],[11,-22],[8.6,-28.6],[3,-31.6],[-4.4,-31.6],[-9.6,-27.6],[-11,-18],[-10.6,-8]]);
    p.F(M.shirt[0]); [[-6,-24],[2,-12],[-3,-6],[6,-20]].forEach(([x,y])=>p.ell(x,y,2.2,1.4));
    p.F(M.shirt[0]); p.ell(3,-20,3,3); p.F(M.shirt[2]); p.ell(3,-20,1.6,1.6);
    p.F(M.patch[1]); p.rect(-3,-10,7,6); p.F(M.patch[3]); for(let x=-3;x<4;x+=2){ p.rect(x,-10,1,0.7); p.rect(x,-4.6,1,0.7); }
    p.F(M.brown[2]); p.rect(-10,-1.6,19.6,1.6);
    // gola
    p.F(M.skin[1]); p.poly([[-0.6,-31.4],[4.6,-31.6],[2.6,-28.4]]); p.F(M.shirt[0]); p.rect(-1.4,-32.2,7,1);
    // alça do bag
    p.F(M.brown[1]); p.poly([[-7,-30],[-3.6,-31],[10,-6],[7,-4.6]]);
    // barbante na cintura
    p.F(M.cord[1]); p.poly([[-11,-1],[10,-1],[10.2,1.2],[-11.2,1.2]]); p.cap(P2(4,0.4),P2(6,5),1,1); p.cap(P2(4,0.4),P2(2.6,5.4),1,1);
    p.id();
  }
  function drawHead(p,M,sk,P){
    p.xf(sk.ha,sk.neck.x,sk.neck.y);
    p.F(M.skin[1]); p.cap(P2(0,3),P2(1,-6),7.6,7);
    // rabo de cavalo atrás
    const t=P.tail||0; p.F(M.hair[1]); p.cap(P2(-8,-18),P2(-13-t*2,-6+Math.abs(t)),5.6,4.4);
    p.F(M.skin[1]); p.ell(-4.4,-12.6,2.4,3.4); p.ell(2.2,-14,9.4,9.4);
    p.poly([[-2,-8],[10.4,-9.4],[12,-5],[9,-1.6],[2,-1.2]]);
    p.F(M.skin[3]); p.ell(-4.4,-12.6,1,2);
    p.F(M.gold[1]); p.ell(-4,-8.4,1.6,1.6); p.F(M.skin[2]); p.ell(-4,-8.4,0.6,0.6);
    p.F(M.hair[1]); p.poly([[-7.6,-16],[-3.4,-16],[-2.4,-10.6],[-6.6,-11]]); p.poly([[3,-19],[6,-19],[5,-15.6],[3.4,-16.4]]);
    p.F(M.skin[2]); p.ell(-1.6,-8.6,2,1.2);
    // olhos
    if(P.eyes===1){ p.F(M.skin[2]); p.rect(5,-13.6,4.6,1); }
    else if(P.eyes===2){ p.F(M.iris[1]); p.poly([[4.6,-13],[6.8,-15],[9,-13],[8,-13],[6.8,-14],[5.6,-13]]); }
    else { p.F(M.eye[1]); p.ell(6.8,-13.4,2.4,2.1); p.F(M.iris[1]); p.rect(7.4,-14.4,1.6,2.2); p.F(M.eye[0]); p.rect(7.8,-14.4,0.8,0.8); p.F(M.hair[2]); p.rect(4.6,-15.8,1,1.2); }
    p.F(M.skin[2]); p.ell(11.6,-13.6,1.1,1.6);
    p.F(M.hair[2]);
    if(P.brow===1) p.poly([[3.8,-18],[9.8,-16],[9.8,-14.8],[3.8,-16.6]]);
    else if(P.brow===2) p.poly([[3.8,-19.4],[9.8,-19],[9.8,-17.8],[3.8,-18.2]]);
    else p.poly([[3.8,-17.4],[9.8,-17],[9.8,-15.8],[3.8,-16.2]]);
    p.F(M.skin[1]); p.poly([[10,-13.6],[13.4,-9.8],[10.4,-9.2]]);
    // boca
    if(P.mouth===1||P.mouth===6){ p.F(M.mouth[1]); p.ell(9,-5,2,P.mouth===6?2:1.6); }
    else if(P.mouth===2){ p.F(M.mouth[1]); p.poly([[6.6,-7],[12,-7.2],[11.6,-2.4],[7.2,-2.8]]); p.F(M.teeth[1]); p.rect(7,-7,4.6,1.2); }
    else if(P.mouth===3){ p.F(M.teeth[1]); p.rect(7,-6.6,4.4,1.6); p.F(M.mouth[2]); p.rect(7,-5.2,4.4,0.7); }
    else if(P.mouth===4){ p.F(M.mouth[1]); p.ell(9.2,-5.2,1.4,1.4); }
    else if(P.mouth===5){ p.F(M.mouth[1]); p.poly([[6.6,-6.6],[12,-7.4],[10.6,-4],[7.6,-4.4]]); p.F(M.teeth[1]); p.rect(7.4,-6.6,4,1); }
    else { p.F(M.mouth[2]); p.poly([[7,-5.6],[11.6,-6.6],[11.6,-5.6],[7,-4.8]]); }
    // lenço de chita
    p.F(M.scarf[1]); p.poly([[-10,-17],[-9.6,-23],[-3,-25.4],[5,-25],[11,-21],[11.6,-17.4],[4,-18.6],[-3,-18.2]]);
    p.F(M.scarf[0]); p.poly([[-6,-23],[0,-24.6],[6,-23.4],[0,-22.6]]);
    p.F(M.flower[1]); [[-6,-20],[-1,-22],[4,-21],[8,-19],[0,-19.4],[-4,-23.4],[6,-23.6]].forEach(([x,y])=>{ p.rect(x-0.5,y-1.4,1,3); p.rect(x-1.4,y-0.5,3,1); });
    p.F(M.flower[0]); [[-6,-20],[-1,-22],[4,-21],[8,-19]].forEach(([x,y])=>p.rect(x-0.4,y-0.4,0.9,0.9));
    p.F(M.leaf[1]); [[-3,-20.6],[2,-23],[6,-20.4]].forEach(([x,y])=>p.rect(x,y,1.4,1));
    // nó + pontas
    p.F(M.scarf[1]); p.ell(-10,-21,2.8,2.2); p.cap(P2(-11,-20),P2(-17-t*3,-17+Math.abs(t)),2.6,1.6); p.cap(P2(-11,-21),P2(-16-t*3,-24+t),2.4,1.4);
    p.id();
  }
  function drawSmear(p,M,sk,P){
    p.id(); p.F(M.smear[1]);
    const tip=lp(sk.wrF,P.aFe+P.bat,HOOKLEN), sh=sk.shF;
    const cur=Math.atan2(tip.x-sh.x,tip.y-sh.y)*180/Math.PI, r1=Math.hypot(tip.x-sh.x,tip.y-sh.y)+4, r0=r1-12;
    const a0=P.sa, a1=cur, n=10, pts=[];
    for(let k=0;k<=n;k++){ const a=a0+(a1-a0)*k/n; pts.push([sh.x+Math.sin(rad(a))*r1, sh.y+Math.cos(rad(a))*r1]); }
    for(let k=n;k>=0;k--){ const a=a0+(a1-a0)*k/n, rr=r0+(r1-r0)*(1-k/n)*0.6; pts.push([sh.x+Math.sin(rad(a))*rr, sh.y+Math.cos(rad(a))*rr]); }
    p.poly(pts);
  }
  const cache=new Map();
  function frame(skin,anim,fi,step=5){
    const K=PIX.getK(), key=skin+anim+fi+step+'@'+K; if(cache.has(key)) return cache.get(key);
    const P=poseOf(anim,fi), M=mats(skin), sk=skeleton(P);
    const parts=[
      {back:true, draw:(c,u)=>drawArm(mkPen(c,u),M,sk.shB,sk.elB,sk.wrB,false)},
      {draw:(c,u)=>drawBag(mkPen(c,u),M,sk,P)},
      {back:true, draw:(c,u)=>drawLeg(mkPen(c,u),M,sk.hipB,sk.kneeB,sk.ankleB,false)},
      {draw:(c,u)=>drawTorso(mkPen(c,u),M,sk,P)},
      {draw:(c,u)=>drawLeg(mkPen(c,u),M,sk.hipF,sk.kneeF,sk.ankleF,true)},
      {draw:(c,u)=>drawHead(mkPen(c,u),M,sk,P)},
      {draw:(c,u)=>drawHook(mkPen(c,u),M,sk.wrF,sk.bDir,P)},
    ];
    if(P.smear) parts.push({noShade:true,smear:true,draw:(c,u)=>drawSmear(mkPen(c,u),M,sk,P)});
    parts.push({draw:(c,u)=>drawArm(mkPen(c,u),M,sk.shF,sk.elF,sk.wrF,true)});
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM});
    const tip=lp(sk.wrF,sk.bAng,HOOKLEN), sc=q=>({x:q.x*K,y:q.y*K});
    cv._tip=sc(tip); cv._hand=sc(sk.wrF); cv._mouth=sc(sk.H(13,-5)); cv._head=sc(sk.H(4,-26)); cv._hip=sc(sk.hip); cv._bag=sc(sk.T(-15,-36));
    cache.set(key,cv); return cv;
  }
  return {FW,FH,GROUND,AX,SKINS,ANIMS,poseOf,frame,mats};
})();
