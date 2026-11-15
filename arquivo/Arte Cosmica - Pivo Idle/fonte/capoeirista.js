/* ===== CAPOEIRISTA: recruta de combate em hi-bit (ginga, martelo, bênção, meia-lua, berimbau) ===== */
const CAPO=(function(){
  const {rad,ramp,lp,lerp,P2,mkPen,compose}=PIX;
  const FW=150, FH=150, GROUND=144, AX=60;
  const SKINS={media:{nome:'Pele média',hex:'#a86a42'}, escura:{nome:'Pele escura',hex:'#6a4028'}, clara:{nome:'Pele clara',hex:'#d8a27a'}};
  const RIM='#a9c8f0';
  function mats(skin){
    return {
      skin:ramp(SKINS[skin].hex),
      hair:['#4a3628','#24180f','#160e08','#0a0604'],
      abada:['#fffaf0','#e8e2d0','#b8b0a0','#7a7268'],
      green:['#6ad874','#2f9a3a','#1e6a28','#0e3a14'],
      yellow:['#ffe07a','#f2c230','#a8821a','#5a440a'],
      gold:['#ffe68a','#e3b23c','#9a7418','#4a380a'],
      red:['#ff7a7a','#c9343a','#82181e','#4a0a0e'],
      wood:['#c89458','#9a6a34','#6a4420','#3a2410'],
      gourd:['#f0c070','#d09a48','#a0682a','#5a3814'],
      wire:['#ffffff','#c8ccd4','#8a8ea0','#4a4e60'],
      eye:['#ffffff','#f2efe6','#b8b4a8','#6e6a60'],
      iris:['#8a5a3a','#4a2a18','#2a180e','#140a06'],
      mouth:['#8a3444','#4a1828','#2a0c18','#1a0610'],
      teeth:['#fffbe8','#e8e0c0','#b0a680','#6a6040'],
      sole:['#f0b8a0','#d89a84','#a87060','#6a4038'],
      smear:['#ffffff','#fff6d0','#e8d8a0','#b8a870'],
    };
  }
  const NAMES={skin:'Pele',hair:'Dreads',abada:'Abadá',green:'Cordão verde',yellow:'Cordão amarelo',gold:'Contas/brinco',wood:'Verga',gourd:'Cabaça'};
  const REST={hx:0,lean:2,head:0,aFs:12,aFe:30,aBs:-10,aBe:10,lFh:8,lFk:-4,lBh:-10,lBk:-16,mouth:0,brow:0,eyes:0,flash:0,smear:0,sa:0,leg:'F',kF:0,kB:0,berim:0,pluck:0,impact:0,sway:0};
  const ANIMS={
    idle:{nome:'Parado',n:6,dur:()=>150,pose:i=>{ const p=i/6*Math.PI*2, s=Math.sin(p); return {lean:2+1.5*s, head:Math.sin(p-0.6), aFs:12+3*s, aFe:30+4*s, aBs:-10+3*s, aBe:10+3*s, lFh:10, lFk:-2, lBh:-12, lBk:-18, eyes:i===2?1:0, sway:s}; }},
    walk:{nome:'Andar',n:8,dur:()=>110,pose:i=>{ const p=i/8*Math.PI*2, t=o=>8+18*Math.sin(p+o), k=o=>t(o)-24*Math.max(0,Math.cos(p+o));
      return {lFh:t(0),lFk:k(0),lBh:t(Math.PI),lBk:k(Math.PI),aFs:10-18*Math.sin(p),aFe:30-18*Math.sin(p),aBs:-8+18*Math.sin(p),aBe:12+18*Math.sin(p),lean:4+1.5*Math.sin(2*p),head:Math.sin(2*p-0.6),sway:Math.sin(p)}; }},
    guard:{nome:'Ginga (guarda)',n:8,dur:()=>140,pose:i=>{ const p=i/8*Math.PI*2, s=Math.sin(p), up=Math.max(0,-s), dn=Math.max(0,s);
      return {hx:4*s, lean:8-5*s, head:-3+2*s, lFh:14+22*s, lFk:14+22*s-22-10*dn, lBh:-22+12*s, lBk:-36+12*s,
        aFs:30+40*up, aFe:80+70*up, aBs:-30+50*dn, aBe:-10+110*dn, brow:0, sway:s}; }},
    combo:{nome:'Combo: martelo · bênção · meia-lua',n:12,hits:{2:1,6:2,10:3},dur:i=>[110,50,70,100,90,50,70,90,120,50,70,160][i],pose:i=>[
      {lean:-4,lFh:30,lFk:-30,lBh:-14,lBk:-20,aFs:30,aFe:120,aBs:-40,aBe:-20,mouth:1,brow:1},
      {lean:-10,lFh:70,lFk:20,lBh:-10,lBk:-14,aFs:28,aFe:116,aBs:-50,aBe:-30,mouth:1,brow:1},
      {lean:-18,lFh:95,lFk:92,kF:1,lBh:-6,lBk:-8,aFs:20,aFe:100,aBs:-60,aBe:-40,mouth:2,brow:1,smear:1,sa:20,leg:'F'},
      {lean:-16,lFh:90,lFk:82,kF:1,lBh:-6,lBk:-8,aFs:20,aFe:100,aBs:-60,aBe:-40,mouth:2,brow:1},
      {lean:2,lFh:20,lFk:-10,lBh:-20,lBk:-30,aFs:30,aFe:110,aBs:-20,aBe:20,brow:1},
      {lean:4,lFh:46,lFk:-6,lBh:-16,lBk:-24,aFs:34,aFe:120,aBs:-30,aBe:0,mouth:1,brow:1},
      {lean:-8,lFh:84,lFk:86,kF:1,lBh:-10,lBk:-14,aFs:24,aFe:110,aBs:-50,aBe:-30,mouth:2,brow:1,smear:1,sa:40,leg:'F'},
      {lean:-8,lFh:80,lFk:82,kF:1,lBh:-10,lBk:-14,aFs:24,aFe:110,aBs:-50,aBe:-30,mouth:2,brow:1},
      {lean:16,hx:4,lFh:10,lFk:-6,lBh:-30,lBk:-30,aFs:60,aFe:80,aBs:40,aBe:60,brow:1,mouth:1},
      {lean:10,hx:3,lFh:4,lFk:-6,lBh:30,lBk:24,kB:1,aFs:40,aFe:80,aBs:10,aBe:40,brow:1,mouth:1},
      {lean:-14,hx:2,lFh:-4,lFk:-6,lBh:110,lBk:116,kB:1,aFs:0,aFe:40,aBs:-70,aBe:-50,mouth:2,brow:1,smear:2,sa:-20,leg:'B',impact:1},
      {lean:-8,lFh:-2,lFk:-6,lBh:70,lBk:60,kB:1,aFs:10,aFe:60,aBs:-50,aBe:-30,mouth:0}][i]},
    special:{nome:'Especial: toque de berimbau',n:7,dur:i=>[140,140,180,150,180,220,150][i],pose:i=>[
      {aFs:-150,aFe:-170,aBs:-6,aBe:10,lean:-2,head:-4,brow:0},
      {berim:1,aFs:34,aFe:150,aBs:50,aBe:96,lean:-2,head:-6,mouth:0},
      {berim:1,pluck:1,aFs:34,aFe:150,aBs:54,aBe:84,lean:-3,head:-8,eyes:1,mouth:3,hx:-1},
      {berim:1,aFs:34,aFe:150,aBs:46,aBe:110,lean:-2,head:-6,eyes:1,mouth:3},
      {berim:1,pluck:1,aFs:34,aFe:150,aBs:54,aBe:84,lean:-3,head:-8,eyes:1,mouth:3,hx:-1},
      {berim:1,aFs:34,aFe:150,aBs:46,aBe:104,lean:-2,head:-4,eyes:2,mouth:0},
      {aFs:12,aFe:30,aBs:-10,aBe:10}][i]},
    hurt:{nome:'Dano',n:4,dur:i=>[80,110,130,160][i],pose:i=>[
      {lean:-14,head:-16,hx:-6,flash:1,aFs:-20,aFe:10,aBs:-30,aBe:-10,mouth:4,brow:2,eyes:1,lFh:14,lBh:-4},
      {lean:-10,head:-12,hx:-5,aFs:-10,aFe:20,aBs:-20,aBe:0,mouth:4,brow:2,eyes:1,lFh:12,lBh:-6},
      {lean:-4,head:-4,hx:-2,mouth:0},
      {}][i]},
  };
  function poseOf(anim,i){ return Object.assign({},REST,ANIMS[anim].pose(i)); }
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const shinDir=k=>Math.atan2(Math.cos(rad(k)),Math.sin(rad(k)));
  function skeleton(P){
    const hip={x:AX+P.hx,y:76};
    const hipF={x:hip.x-3,y:hip.y}, hipB={x:hip.x+3,y:hip.y};
    const kneeF=lp(hipF,P.lFh,22), ankleF=lp(kneeF,P.lFk,22), kneeB=lp(hipB,P.lBh,22), ankleB=lp(kneeB,P.lBk,22);
    const dy=GROUND-Math.max(ankleF.y+4, ankleB.y+4);
    [hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB].forEach(p=>p.y+=dy);
    const a=rad(P.lean), c=Math.cos(a), s=Math.sin(a);
    const T=(lx,ly)=>({x:hip.x+lx*c-ly*s, y:hip.y+lx*s+ly*c});
    const neck=T(1,-33), shF=T(-4,-29), shB=T(6,-30);
    const ha=rad(P.lean*0.5+P.head), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:neck.x+lx*hc-ly*hs, y:neck.y+lx*hs+ly*hc});
    const elF=lp(shF,P.aFs,14), wrF=lp(elF,P.aFe,13), elB=lp(shB,P.aBs,14), wrB=lp(elB,P.aBe,13);
    const footF=P.kF?shinDir(P.lFk):rad(clamp(-P.lFk*0.8,-10,75));
    const footB=P.kB?shinDir(P.lBk):rad(clamp(-P.lBk*0.8,-10,75));
    return {hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,neck,shF,shB,elF,wrF,elB,wrB,a,ha,H,T,footF,footB};
  }
  function drawArm(p,M,sh,el,wr,front){
    p.id();
    p.F(M.skin[1]); p.cap(sh,el,8,7); p.cap(el,wr,7,6);
    p.F(M.skin[2]); const d=lerp(sh,el,0.32); p.circle(d,1);
    p.F(M.skin[0]); p.cap(lerp(sh,el,0.15),lerp(sh,el,0.55),1.4,1.2);
    if(front){ p.F(M.yellow[1]); p.cap(lerp(el,wr,0.82),lerp(el,wr,0.92),6.4,6.2); }
    p.F(M.skin[1]); p.circle(wr,4);
    p.F(M.skin[2]); p.circle({x:wr.x+1.2,y:wr.y+1},1);
  }
  function drawLeg(p,M,hip,knee,ankle,front,footAng){
    p.id();
    p.F(M.abada[1]); p.cap(hip,knee,15,13); p.cap(knee,ankle,13,14);
    p.F(M.abada[2]); p.cap(lerp(hip,knee,0.2),lerp(hip,knee,0.75),1,1); p.cap(lerp(knee,ankle,0.3),lerp(knee,ankle,0.8),1,1);
    p.F(M.abada[3]); const hem=lerp(knee,ankle,0.96); p.circle(hem,1);
    p.xf(footAng,ankle.x,ankle.y);
    p.F(M.skin[1]); p.poly([[-4,-2],[3,-2.4],[9,0.4],[10,2.6],[9,3.6],[-4.4,3.6]]);
    p.F(M.sole[1]); p.rect(-4.4,2.8,13.4,1);
    p.F(M.skin[2]); p.rect(6.4,1.2,0.8,1.6); p.rect(8,1.4,0.8,1.4);
    p.id();
  }
  function drawBerimbau(p,M,sk,P){
    p.id();
    let A,B,G;
    if(P.berim){ const w=sk.wrF; A={x:w.x+1,y:w.y+22}; B={x:w.x-6,y:w.y-52}; G={x:w.x+2,y:w.y+8}; }
    else { A=sk.T(-13,10); B=sk.T(18,-64); G=sk.T(-10,4); }
    const mid=lerp(A,B,0.5), dx=B.x-A.x, dy=B.y-A.y, L=Math.hypot(dx,dy), nx=-dy/L, ny=dx/L, bow=5;
    const pts=[]; for(let k=0;k<=8;k++){ const t=k/8, q=lerp(A,B,t), o=Math.sin(t*Math.PI)*bow; pts.push({x:q.x+nx*o,y:q.y+ny*o}); }
    p.F(M.wood[1]); for(let k=0;k<8;k++) p.cap(pts[k],pts[k+1],3,3);
    p.F(M.wire[1]); p.cap(A,B,1,1);
    p.F(M.gourd[1]); p.ell(G.x-nx*5,G.y-ny*5,6,7,Math.atan2(dy,dx));
    p.F(M.gourd[3]); p.ell(G.x-nx*8,G.y-ny*8,2.4,2.8,Math.atan2(dy,dx));
    p.F(M.gourd[2]); p.cap({x:G.x-nx*2,y:G.y-ny*2},{x:G.x-nx*8,y:G.y-ny*8},1,1);
  }
  function drawStick(p,M,sk,P){ // baqueta + caxixi na mão de trás
    if(!P.berim) return; p.id(); const w=sk.wrB, e=sk.elB, ang=Math.atan2(w.y-e.y,w.x-e.x);
    p.xf(ang-0.5,w.x,w.y); p.F(M.wood[2]); p.cap(P2(-2,0),P2(14,0),1.4,1.2);
    p.F(M.gourd[0]); p.ell(-3,4,3.2,4); p.F(M.gourd[2]); p.rect(-5,3,4,1); p.id();
  }
  function drawTorso(p,M,sk){
    p.xf(sk.a,sk.hip.x,sk.hip.y);
    p.F(M.skin[1]); p.poly([[-9.6,1],[9,1],[9.6,-8],[12,-16],[13,-24],[10.4,-30],[4,-33.4],[-4.6,-33.4],[-10.4,-29],[-11.6,-19],[-10.6,-8]]);
    p.F(M.skin[2]); p.poly([[-1,-22],[4,-20],[10,-21],[10,-19.6],[4,-18.6],[-1,-20.6]]); p.rect(3,-24,1,7);
    p.rect(1.6,-15,6,0.9); p.rect(1.8,-11,6,0.9); p.rect(4.2,-17,0.9,12); p.ell(4.6,-4,0.9,0.9);
    p.F(M.skin[0]); p.rect(-2,-25,8,1); p.rect(0,-31,6,1);
    // cós do abadá + cordão
    p.F(M.abada[1]); p.poly([[-11,-2.6],[10,-2.6],[10.4,2.4],[-11.4,2.4]]);
    p.F(M.green[1]); p.poly([[-11.2,-3.6],[10.2,-3.6],[10.4,-1],[-11.4,-1]]);
    p.F(M.yellow[1]); for(let x=-10;x<10;x+=2.4) p.rect(x,-3.4,1.2,1.2);
    p.F(M.green[1]); p.ell(7,-2.2,2.6,2.2);
    p.F(M.yellow[1]); p.cap(P2(7,-1),P2(8.4,9),1.6,1.6); p.F(M.green[1]); p.cap(P2(6,-1),P2(5,11),1.6,1.6);
    p.F(M.yellow[0]); p.ell(8.6,10.4,2,2.8); p.F(M.green[0]); p.ell(5,12.4,2,2.8);
    p.id();
  }
  function drawHead(p,M,sk,P){
    p.xf(sk.ha,sk.neck.x,sk.neck.y);
    // dreads de trás
    p.F(M.hair[1]); [[-7,-10,-11,10],[-5,-9,-7.4,12],[-3,-8,-3.6,13],[-8.6,-12,-14,5],[-1,-8,0.4,9]].forEach(([x0,y0,x1,y1])=>p.cap(P2(x0,y0),P2(x1,y1),4.2,3.6));
    p.F(M.gold[1]); p.ell(-7.4,8,1.4,1.4); p.F(M.red[1]); p.ell(-3.4,10,1.4,1.4);
    p.F(M.skin[1]); p.cap(P2(0,3),P2(1,-6),8.4,7.6);
    p.F(M.skin[2]); p.rect(3,-4,1,5);
    p.F(M.skin[1]); p.ell(-4.4,-12.6,2.4,3.4); p.ell(2.4,-14,9.6,9.6);
    p.poly([[-2,-8],[10.6,-9.4],[12.4,-5],[9.4,-1.2],[2,-1]]);
    p.F(M.gold[1]); p.ell(-4.4,-9,1.2,1.4);
    // touca de dreads
    p.F(M.hair[1]); p.poly([[-10,-14],[-9,-21],[-3,-24.6],[4,-24.6],[9.6,-21.4],[10.6,-17],[7,-18.6],[3,-19.4],[-2,-18.6],[-6,-15]]);
    p.F(M.hair[2]); [[-6,-22,-8,-15],[-2,-23.6,-4,-17],[2,-24,1,-18.6],[6,-23,6,-18.4]].forEach(([a,b,c,d])=>p.cap(P2(a,b),P2(c,d),0.9,0.9));
    p.F(M.hair[1]); p.cap(P2(-8,-14),P2(-9,-6),4,3.6); p.cap(P2(-5,-15),P2(-5.6,-9),3.6,3.2);
    // olhos
    if(P.eyes===1){ p.F(M.mouth[2]); p.rect(5,-13.6,4.6,0.9); }
    else if(P.eyes===2){ p.F(M.mouth[2]); p.poly([[5,-13],[7,-15],[9.4,-13],[8.6,-12.6],[7,-14],[5.8,-12.6]]); }
    else { p.F(M.eye[1]); p.ell(7,-13.6,2.5,2.1); p.F(M.iris[1]); p.rect(7.6,-14.6,1.6,2.2); p.F(M.eye[0]); p.rect(8,-14.6,0.8,0.8); }
    p.F(M.skin[2]); p.ell(11.6,-13.8,1.2,1.8);
    p.F(M.hair[2]); if(P.brow===1) p.poly([[4,-18],[10,-16.4],[10,-15.4],[4,-17]]); else if(P.brow===2) p.poly([[4,-19],[10,-19],[10,-18],[4,-18]]); else p.poly([[4,-17.4],[10,-17],[10,-16],[4,-16.4]]);
    p.F(M.skin[1]); p.poly([[10,-14],[14,-9.6],[10.4,-9]]);
    // boca
    if(P.mouth===2||P.mouth===3){ p.F(M.mouth[1]); p.poly([[7.4,-7.4],[12.2,-7.6],[11.6,-3],[8,-3.4]]); p.F(M.teeth[1]); p.rect(7.8,-7.4,4,1.1); }
    else if(P.mouth===1){ p.F(M.teeth[1]); p.rect(7.6,-6.8,4.6,1.4); p.F(M.mouth[2]); p.rect(7.6,-5.6,4.6,0.6); }
    else if(P.mouth===4){ p.F(M.mouth[1]); p.ell(9.6,-5.4,1.4,1.6); }
    else { p.F(M.mouth[2]); p.poly([[7.6,-6.4],[11.4,-6.8],[12.4,-7.8],[12,-5.8],[7.8,-5.6]]); }
    p.F(M.hair[1]); p.poly([[8,-3.6],[12,-3.8],[11.4,-1.2],[8.6,-1.2]]);
    p.id();
  }
  function drawSmear(p,M,sk,P){
    p.id(); p.F(M.smear[1]);
    const hip=P.leg==='B'?sk.hipB:sk.hipF, foot=P.leg==='B'?sk.ankleB:sk.ankleF;
    const cur=Math.atan2(foot.x-hip.x,foot.y-hip.y)*180/Math.PI, r1=Math.hypot(foot.x-hip.x,foot.y-hip.y)+8, r0=r1-12;
    const n=10, pts=[];
    for(let k=0;k<=n;k++){ const a=P.sa+(cur-P.sa)*k/n; pts.push([hip.x+Math.sin(rad(a))*r1, hip.y+Math.cos(rad(a))*r1]); }
    for(let k=n;k>=0;k--){ const a=P.sa+(cur-P.sa)*k/n, rr=r0+(r1-r0)*(1-k/n)*0.6; pts.push([hip.x+Math.sin(rad(a))*rr, hip.y+Math.cos(rad(a))*rr]); }
    p.poly(pts);
  }
  const cache=new Map();
  function frame(skin,anim,fi,step=5){
    const K=PIX.getK(), key=skin+anim+fi+step+'@'+K; if(cache.has(key)) return cache.get(key);
    const P=poseOf(anim,fi), M=mats(skin), sk=skeleton(P);
    const parts=[];
    if(!P.berim) parts.push({draw:(c,u)=>drawBerimbau(mkPen(c,u),M,sk,P)});
    parts.push({back:true, draw:(c,u)=>drawArm(mkPen(c,u),M,sk.shB,sk.elB,sk.wrB,false)});
    parts.push({back:true, draw:(c,u)=>drawLeg(mkPen(c,u),M,sk.hipB,sk.kneeB,sk.ankleB,false,sk.footB)});
    parts.push({draw:(c,u)=>drawTorso(mkPen(c,u),M,sk)});
    parts.push({draw:(c,u)=>drawLeg(mkPen(c,u),M,sk.hipF,sk.kneeF,sk.ankleF,true,sk.footF)});
    parts.push({draw:(c,u)=>drawHead(mkPen(c,u),M,sk,P)});
    if(P.berim){ parts.push({draw:(c,u)=>drawBerimbau(mkPen(c,u),M,sk,P)}); parts.push({draw:(c,u)=>drawStick(mkPen(c,u),M,sk,P)}); }
    if(P.smear) parts.push({noShade:true,smear:true,draw:(c,u)=>drawSmear(mkPen(c,u),M,sk,P)});
    parts.push({draw:(c,u)=>drawArm(mkPen(c,u),M,sk.shF,sk.elF,sk.wrF,true)});
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM});
    const sc=q=>({x:q.x*K,y:q.y*K}), foot=P.leg==='B'?sk.ankleB:sk.ankleF;
    cv._tip=sc(foot); cv._mouth=sc(sk.H(16,-5)); cv._head=sc(sk.H(2,-26)); cv._hip=sc(sk.hip); cv._gourd=sc(P.berim?{x:sk.wrF.x-4,y:sk.wrF.y+10}:sk.T(-12,2));
    cache.set(key,cv); return cv;
  }
  return {FW,FH,GROUND,AX,SKINS,ANIMS,NAMES,poseOf,frame,mats};
})();
