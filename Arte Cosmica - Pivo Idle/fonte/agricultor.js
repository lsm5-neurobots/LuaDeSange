/* ===== AGRICULTOR: recruta em hi-bit (enxada, chapéu de palha, regador) ===== */
const AGRI=(function(){
  const {rad,ramp,lp,lerp,P2,ik,mkPen,compose}=PIX;
  const FW=168, FH=156, GROUND=150, AX=56;
  const SKINS={media:{nome:'Pele média',hex:'#b4784c'}, escura:{nome:'Pele escura',hex:'#7a4a2e'}, clara:{nome:'Pele clara',hex:'#e4ae86'}};
  const RIM='#a9c8f0', HOE=44, BUTT=-10;
  function mats(skin){
    return {
      skin:ramp(SKINS[skin].hex),
      hair:['#5a4232','#3a2a20','#241a14','#140e0a'],
      straw:['#f0d890','#d9b860','#a07c3a','#5e4620'],
      band:['#a03a2a','#7a2a1e','#521a12','#2e0e0a'],
      kerchief:['#e05a4a','#b8322a','#7a1e18','#40100c'],
      dot:['#ffffff','#f4f0e6','#c8c4b8','#8a8678'],
      shirt:['#8fae4a','#6f8f2f','#4c6420','#2c3a12'],
      patch:['#d8c898','#b8a678','#8a7a52','#544a30'],
      lettuce:['#b4e878','#9fdc68','#3f7f22','#1e4a10'],
      pants:['#a8885c','#8a6a44','#5e4428','#3a2814'],
      blue:['#7e9aaa','#5e7a8a','#405866','#243440'],
      boot:['#7a5432','#5a3a22','#3a2414','#20140a'],
      sole:['#4a3020','#2a1a10','#1a100a','#0e0804'],
      belt:['#6a4a2e','#4a2e1a','#301c10','#1a0e08'],
      gold:['#ffe27a','#c9a24a','#8a6a18','#4a380c'],
      wood:['#c08a50','#9a6a3a','#6a4422','#3e2812'],
      iron:['#c8ccd0','#5e6266','#3e4246','#24282c'],
      rust:['#c07a4a','#8a4a24','#5a2e14','#30180a'],
      tin:['#d8e2dc','#9aa6a0','#68746e','#3e4844'],
      mud:['#8a6a4a','#6a4a2a','#4a321a','#2a1a0c'],
      eye:['#ffffff','#f2efe6','#b8b4a8','#6e6a60'],
      iris:['#8a5a3a','#4a2a18','#2a180e','#140a06'],
      mouth:['#8a3444','#4a1828','#2a0c18','#1a0610'],
      teeth:['#fffbe8','#e8e0c0','#b0a680','#6a6040'],
      smear:['#ffffff','#fff6d0','#e8d8a0','#b8a870'],
    };
  }
  const REST={hx:0,lean:6,head:2,aFs:30,aFe:2,aBs:-6,aBe:6,lFh:6,lFk:-2,lBh:-6,lBk:-8,bat:0,mouth:0,brow:0,smear:0,sa:0,flash:0,two:0,stand:0,can:0,tilt:0,hand:0,eyes:0,blade:1};
  const GUARD={aFs:30,aFe:80,bat:40,two:1,lean:8,brow:1,lFh:12,lFk:2,lBh:-12,lBk:-18,blade:1};
  const th=(p,o)=>4+16*Math.sin(p+o), sh=(p,o)=>th(p,o)-24*Math.max(0,Math.cos(p+o));
  const ANIMS={
    idle:{nome:'Parado (apoiado na enxada)',n:6,dur:()=>170,pose:i=>{ const p=i/6*Math.PI*2, s=Math.sin(p); return {lean:6+0.8*s, head:2+Math.sin(p-0.7), aBs:-6+2*s, aBe:6+2*s, eyes:i===2?1:0, blade:-1}; }},
    walk:{nome:'Andar (enxada no ombro)',n:8,dur:()=>120,pose:i=>{ const p=i/8*Math.PI*2;
      return {lFh:th(p,0), lFk:sh(p,0), lBh:th(p,Math.PI), lBk:sh(p,Math.PI), aFs:-12+3*Math.sin(p), aFe:150, bat:52, aBs:-6+16*Math.sin(p), aBe:4+16*Math.sin(p), lean:5+1.2*Math.sin(2*p), head:2+Math.sin(2*p-0.6), blade:1}; }},
    guard:{nome:'Guarda (duas mãos)',n:6,dur:()=>140,pose:i=>{ const p=i/6*Math.PI*2, s=Math.sin(p); return Object.assign({},GUARD,{lean:8+1.2*s, aFs:30+3*s, aFe:80+3*s, head:-1+s}); }},
    combo:{nome:'Combo de 3 enxadadas',n:12,hits:{2:1,6:2,10:3},dur:i=>[130,60,60,100,110,60,60,100,150,50,70,180][i],pose:i=>Object.assign({},GUARD,[
      {aFs:150,aFe:180,bat:20,lean:-8,head:-6,hx:-2,mouth:3,lFh:10,lBh:-14,lBk:-18},
      {aFs:160,aFe:196,bat:14,lean:-10,hx:-3,mouth:3,lFh:10,lBh:-14,lBk:-18},
      {aFs:84,aFe:70,bat:40,lean:20,hx:6,mouth:1,smear:1,sa:200,lFh:22,lFk:6,lBh:-18,lBk:-26},
      {aFs:80,aFe:62,bat:46,lean:22,hx:7,mouth:1,lFh:22,lFk:6,lBh:-18,lBk:-26},
      {aFs:140,aFe:176,bat:24,lean:-4,hx:3,mouth:3,lFh:14,lBh:-14,lBk:-20},
      {aFs:156,aFe:192,bat:16,lean:-8,hx:2,mouth:3,lFh:14,lBh:-14,lBk:-20},
      {aFs:86,aFe:72,bat:42,lean:22,hx:7,mouth:1,smear:2,sa:200,lFh:22,lFk:6,lBh:-18,lBk:-26},
      {aFs:82,aFe:64,bat:46,lean:24,hx:7,mouth:1,lFh:22,lFk:6,lBh:-18,lBk:-26},
      {aFs:170,aFe:206,bat:10,lean:-14,hx:0,brow:1,mouth:3,lFh:6,lBh:-10,lBk:-14},
      {aFs:176,aFe:214,bat:8,lean:-16,hx:-1,mouth:3,lFh:6,lBh:-10,lBk:-14},
      {aFs:76,aFe:56,bat:50,lean:28,hx:10,mouth:2,smear:3,sa:210,impact:1,lFh:30,lFk:12,lBh:-22,lBk:-34},
      {aFs:72,aFe:52,bat:52,lean:26,hx:9,mouth:1,lFh:30,lFk:12,lBh:-22,lBk:-34}][i])},
    special:{nome:'Especial: plantar e regar',n:8,dur:i=>[160,150,170,150,170,170,220,200][i],pose:i=>[
      {stand:1,aFs:20,aFe:-30,hand:0,lean:4,brow:2,mouth:0},
      {stand:1,aFs:60,aFe:100,hand:1,lean:10,head:8,mouth:4,seeds:1},
      {stand:1,aFs:96,aFe:106,hand:1,lean:14,head:12,mouth:4,seeds:2},
      {stand:1,aFs:40,aFe:70,can:1,tilt:0,lean:8,head:8},
      {stand:1,aFs:56,aFe:84,can:1,tilt:40,lean:12,head:12,water:1},
      {stand:1,aFs:58,aFe:86,can:1,tilt:50,lean:12,head:12,water:1},
      {stand:1,aFs:40,aFe:70,can:1,tilt:10,lean:6,head:6,mouth:5,eyes:2,sprout:1},
      {stand:1,aFs:30,aFe:20,lean:4,mouth:5,eyes:2,sprout:2}][i]},
    hurt:{nome:'Dano',n:4,dur:i=>[80,110,130,160][i],pose:i=>Object.assign({},GUARD,[
      {lean:-14,head:-16,hx:-6,flash:1,aFs:-10,aFe:30,bat:80,two:0,aBs:-30,aBe:-10,mouth:6,brow:2,lFh:14,lBh:-4},
      {lean:-10,head:-12,hx:-5,aFs:0,aFe:40,bat:70,two:0,aBs:-20,aBe:0,mouth:6,brow:2,lFh:12,lBh:-6},
      {lean:-4,head:-4,hx:-2,aFs:20,aFe:70,mouth:0},
      {}][i])},
  };
  function poseOf(anim,i){ return Object.assign({},REST,ANIMS[anim].pose(i)); }
  function skeleton(P){
    const hip={x:AX+P.hx,y:76};
    const hipF={x:hip.x-3,y:hip.y}, hipB={x:hip.x+3,y:hip.y};
    const kneeF=lp(hipF,P.lFh,22), ankleF=lp(kneeF,P.lFk,22), kneeB=lp(hipB,P.lBh,22), ankleB=lp(kneeB,P.lBk,22);
    const dy=GROUND-Math.max(ankleF.y+5, ankleB.y+5);
    [hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB].forEach(p=>p.y+=dy);
    const a=rad(P.lean), c=Math.cos(a), s=Math.sin(a);
    const T=(lx,ly)=>({x:hip.x+lx*c-ly*s, y:hip.y+lx*s+ly*c});
    const neck=T(1,-32), shF=T(-4,-28), shB=T(5,-29);
    const ha=rad(P.lean+P.head), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:neck.x+lx*hc-ly*hs, y:neck.y+lx*hs+ly*hc});
    const elF=lp(shF,P.aFs,14), wrF=lp(elF,P.aFe,13);
    let elB=lp(shB,P.aBs,14), wrB=lp(elB,P.aBe,13);
    let tBase=wrF, tDir, tAng=P.aFe+P.bat;
    if(P.stand){ tBase={x:hip.x+18,y:GROUND-HOE-2}; tAng=0; }
    else if(P.aFe+P.bat<20 && !P.two){ tAng=0; tBase={x:wrF.x,y:Math.min(wrF.y,GROUND-HOE-1)}; }
    tDir=Math.atan2(Math.cos(rad(tAng)),Math.sin(rad(tAng)));
    if(P.two && !P.stand){ const g={x:tBase.x+Math.cos(tDir)*(BUTT+4),y:tBase.y+Math.sin(tDir)*(BUTT+4)}; const r=ik(shB,g,14,13,true); elB=r.E; wrB=r.W; }
    if(P.stand){ const g={x:tBase.x+Math.cos(tDir)*(BUTT+2),y:tBase.y+Math.sin(tDir)*(BUTT+2)}; const r=ik(shB,g,14,13,true); elB=r.E; wrB=r.W; }
    return {hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,neck,shF,shB,elF,wrF,elB,wrB,a,ha,H,T,tBase,tDir,tAng};
  }
  function drawHoe(p,M,base,ang,blade){
    p.xf(ang,base.x,base.y);
    p.F(M.wood[1]); p.cap(P2(BUTT,0),P2(HOE-1,0),3.4,3.2);
    p.F(M.wood[0]); p.rect(BUTT+2,-1.4,HOE-BUTT-6,0.8); p.F(M.wood[2]); [[4,0.4],[14,-0.4],[26,0.4]].forEach(([x,y])=>p.rect(x,y,4,0.7));
    p.F(M.iron[2]); p.ell(HOE,0,2.4,2.4);
    const b=blade||1;
    p.F(M.iron[1]); p.poly([[HOE-2,0],[HOE+3,0],[HOE+5,b*10],[HOE-5,b*10]]);
    p.F(M.iron[0]); p.poly([[HOE-5,b*9],[HOE+5,b*9],[HOE+5,b*10.2],[HOE-5,b*10.2]]);
    p.F(M.rust[1]); p.rect(HOE-2,b*4,2,2*b>0?2:-2); p.rect(HOE+1.6,b*6.4,1.4,1.4);
    p.id();
  }
  function drawCan(p,M,wr,ang,tilt){
    p.xf(ang-rad(tilt)*0.6,wr.x,wr.y);
    p.F(M.tin[1]); p.poly([[1,-1],[11,-1],[11.6,8],[0.4,8]]);
    p.F(M.tin[0]); p.rect(1,-1,10,1.2); p.F(M.tin[2]); [3,6,9].forEach(x=>p.rect(x,0,0.8,8));
    p.cap(P2(11,4),P2(18,-2),1.8,1.4); p.F(M.tin[1]); p.ell(18.4,-2.4,1.6,1.6);
    p.F(M.tin[2]); p.cap(P2(2,-1),P2(6,-5),1,1); p.cap(P2(6,-5),P2(10,-1),1,1);
    p.id();
  }
  function drawArm(p,M,sh,el,wr,front,P){
    p.id();
    p.F(M.shirt[1]); p.cap(sh,el,8,7); p.cap(el,lerp(el,wr,0.8),7,6.2);
    p.F(M.shirt[0]); p.cap(lerp(el,wr,0.72),lerp(el,wr,0.82),6.8,6.6);
    p.F(M.skin[1]); p.cap(lerp(el,wr,0.8),wr,4.6,4.2);
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y);
    p.F(M.skin[1]);
    if(front && P.hand){ p.poly([[0,-2.6],[4.4,-3],[4.8,3],[0,2.6]]); for(let k=0;k<4;k++){ const y0=-2.2+k*1.5; p.cap(P2(4.2,y0),P2(7.6,y0+(k-1.5)*0.9),1.6,1.4); } }
    else { p.ell(1.6,0,4,3.8); p.F(M.mud[1]); p.rect(2.6,-2.4,0.9,4.8); }
    p.id();
  }
  function drawLeg(p,M,hip,knee,ankle,front){
    p.id();
    p.F(M.pants[1]); p.cap(hip,knee,11,9.6); p.cap(knee,lerp(knee,ankle,0.65),9.6,8.6);
    p.F(M.pants[0]); p.cap(lerp(knee,ankle,0.58),lerp(knee,ankle,0.7),9.6,9.2);
    if(front){ p.F(M.blue[1]); p.ell(knee.x+0.6,knee.y,3,2.6); p.F(M.mud[1]); p.ell(knee.x+2,knee.y+2,1.6,1); }
    p.F(M.skin[1]); p.cap(lerp(knee,ankle,0.7),lerp(knee,ankle,0.85),5.4,5.2);
    const a=ankle;
    p.F(M.boot[1]); p.cap(lerp(knee,ankle,0.82),a,7.6,7.4);
    p.poly([[a.x-4,a.y-2.4],[a.x+3,a.y-2.6],[a.x+8.6,a.y+0.8],[a.x+9.4,a.y+3.6],[a.x-4.4,a.y+3.6]]);
    p.F(M.sole[1]); p.rect(a.x-4.6,a.y+3.4,14.4,1.4);
    p.F(M.mud[1]); p.rect(a.x+5,a.y+1.4,2,1.2); p.rect(a.x-2,a.y-1,1.4,1.2);
  }
  function drawTorso(p,M,sk,P){
    p.xf(sk.a,sk.hip.x,sk.hip.y);
    p.F(M.shirt[1]); p.poly([[-10.6,1],[9.6,1],[10.6,-8],[12,-16],[12,-23],[9.6,-29.6],[3.6,-32.6],[-4.6,-32.6],[-10,-28.6],[-11.4,-18],[-11,-8]]);
    p.F(M.shirt[2]); p.rect(5,-27,1,25);
    p.F(M.patch[1]); [-24,-18,-12,-6].forEach(y=>p.rect(5.8,y,1.2,1.2));
    p.F(M.shirt[2]); p.rect(-3,-24,7,1); p.rect(-3,-23,1,6); p.rect(3,-23,1,6);
    p.F(M.lettuce[1]); p.ell(-1,-25,2.4,3,-0.4); p.F(M.lettuce[0]); p.ell(1.6,-26,2,2.8,0.4); p.F(M.lettuce[2]); p.ell(0.4,-23.6,2,1.6);
    p.F(M.patch[1]); p.rect(-10,-16,6,6); p.F(M.patch[3]); [[-10,-16],[-5,-16],[-10,-11],[-5,-11]].forEach(([x,y])=>p.rect(x,y,0.8,0.8));
    p.F(M.mud[1]); p.ell(4,-8,2,1.2); p.ell(-6,-4,1.6,1);
    // lenço no pescoço
    p.F(M.kerchief[1]); p.poly([[-3,-33.4],[7,-33.6],[7.6,-30.4],[-3,-30]]); p.poly([[1,-31],[7,-31],[4,-24]]);
    p.F(M.dot[1]); [[-1,-32],[3,-32.4],[6,-32],[3,-29],[4.6,-27]].forEach(([x,y])=>p.rect(x,y,1,1));
    // cinto
    p.F(M.belt[1]); p.poly([[-11.2,-3.4],[10.2,-3.4],[10.4,1],[-11.4,1]]);
    p.F(M.gold[1]); p.rect(4.6,-3,3.4,3.6); p.F(M.belt[2]); p.rect(5.6,-2,1.4,1.6);
    p.id();
  }
  function drawHead(p,M,sk,P){
    p.xf(sk.ha,sk.neck.x,sk.neck.y);
    p.F(M.skin[1]); p.cap(P2(0,3),P2(1,-6),8.4,7.6);
    p.ell(-4.4,-12.6,2.4,3.4); p.ell(2.4,-14,9.6,9.6);
    p.poly([[-2,-8],[10.6,-9.4],[12.4,-5],[9.4,-1.2],[2,-1]]);
    p.F(M.skin[3]); p.ell(-4.4,-12.6,1,2);
    p.F(M.hair[1]); p.poly([[-7.6,-16],[-3.8,-16],[-3,-10],[-6.8,-10.6]]); p.rect(-9,-15,2,5);
    p.F(M.skin[2]); p.rect(2,-19,10,2);
    p.F(M.kerchief[0]); p.ell(9.8,-10,1.6,1);
    // olhos
    if(P.eyes===1){ p.F(M.skin[2]); p.rect(5,-13.6,4.6,1); }
    else if(P.eyes===2){ p.F(M.iris[1]); p.poly([[4.6,-13],[6.8,-15],[9,-13],[8,-13],[6.8,-14],[5.6,-13]]); }
    else { p.F(M.eye[1]); p.ell(7,-13.4,2.4,2); p.F(M.iris[1]); p.rect(7.6,-14.4,1.6,2.2); p.F(M.eye[0]); p.rect(8,-14.4,0.8,0.8); }
    p.F(M.skin[2]); p.rect(9.6,-12.4,1.6,0.8);
    p.F(M.skin[2]); p.ell(11.6,-13.6,1.2,1.6);
    p.F(M.hair[2]);
    if(P.brow===1) p.poly([[3.8,-17.8],[10,-15.8],[10,-14.6],[3.8,-16.4]]);
    else if(P.brow===2) p.poly([[3.8,-19],[10,-18.8],[10,-17.6],[3.8,-17.8]]);
    else p.poly([[3.8,-17],[10,-16.6],[10,-15.4],[3.8,-15.8]]);
    p.F(M.skin[1]); p.poly([[10,-14],[14,-9.6],[10.4,-9]]);
    // boca + bigode ferradura
    if(P.mouth===1||P.mouth===6){ p.F(M.mouth[1]); p.ell(9.4,-4.6,2,P.mouth===6?2.2:1.6); }
    else if(P.mouth===2){ p.F(M.mouth[1]); p.poly([[7,-7],[12.4,-7.2],[12,-2.4],[7.6,-2.8]]); p.F(M.teeth[1]); p.rect(7.4,-7,4.6,1.2); }
    else if(P.mouth===3){ p.F(M.teeth[1]); p.rect(7.4,-6.6,4.4,1.6); p.F(M.mouth[2]); p.rect(7.4,-5.2,4.4,0.7); }
    else if(P.mouth===4){ p.F(M.mouth[1]); p.ell(9.4,-5,1.2,1.2); }
    else if(P.mouth===5){ p.F(M.mouth[1]); p.poly([[7,-6.6],[12.4,-7.4],[11,-4],[8,-4.4]]); p.F(M.teeth[1]); p.rect(7.6,-6.6,4,1); }
    else { p.F(M.mouth[2]); p.rect(8,-6,3.8,0.9); }
    p.F(M.hair[1]); p.poly([[6,-9.6],[13.2,-9.8],[13.6,-7.6],[12.6,-3.6],[11.6,-3.6],[11.8,-7.6],[7,-7.6],[6.8,-3.8],[5.8,-3.8]]);
    // chapéu de palha
    p.F(M.straw[1]); p.poly([[-20,-18.4],[-8,-21],[8,-21],[24,-18],[25,-15.6],[10,-17.4],[-6,-17.6],[-19,-16]]);
    p.F(M.straw[1]); p.poly([[-9,-20],[-8,-28],[0,-31.6],[9,-29.6],[11,-20.4]]);
    p.F(M.straw[0]); p.poly([[-5,-28],[0,-30.4],[6,-29.2],[0,-27.4]]);
    p.F(M.straw[2]); for(let k=0;k<6;k++) p.rect(-6+k*3,-28+((k%2)*2),1,1); [[-17,-17.6],[-12,-18.6],[16,-17.6],[21,-17],[0,-19]].forEach(([x,y])=>p.rect(x,y,1,1));
    p.F(M.straw[1]); [[-21,-17],[25.6,-16.4],[-18,-15.4]].forEach(([x,y])=>p.rect(x,y,1.4,1));
    p.F(M.band[1]); p.poly([[-9,-21.6],[11,-22.2],[11.2,-20],[-9,-19.6]]); p.F(M.band[2]); p.ell(-8,-20.6,1.4,1.4);
    p.F(M.straw[3]); p.ell(4,-27,1,0.8);
    p.id();
  }
  function drawSmear(p,M,sk,P){
    p.id(); p.F(M.smear[1]);
    const tip={x:sk.tBase.x+Math.cos(sk.tDir)*HOE,y:sk.tBase.y+Math.sin(sk.tDir)*HOE}, sh=sk.shF;
    const cur=Math.atan2(tip.x-sh.x,tip.y-sh.y)*180/Math.PI, r1=Math.hypot(tip.x-sh.x,tip.y-sh.y)+6, r0=r1-14;
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
      {back:true, draw:(c,u)=>drawArm(mkPen(c,u),M,sk.shB,sk.elB,sk.wrB,false,P)},
      {back:true, draw:(c,u)=>drawLeg(mkPen(c,u),M,sk.hipB,sk.kneeB,sk.ankleB,false)},
      {draw:(c,u)=>drawTorso(mkPen(c,u),M,sk,P)},
      {draw:(c,u)=>drawLeg(mkPen(c,u),M,sk.hipF,sk.kneeF,sk.ankleF,true)},
      {draw:(c,u)=>drawHead(mkPen(c,u),M,sk,P)},
      {draw:(c,u)=>drawHoe(mkPen(c,u),M,sk.tBase,sk.tDir,P.blade)},
    ];
    if(P.smear) parts.push({noShade:true,smear:true,draw:(c,u)=>drawSmear(mkPen(c,u),M,sk,P)});
    if(P.can) parts.push({draw:(c,u)=>drawCan(mkPen(c,u),M,sk.wrF,Math.atan2(sk.wrF.y-sk.elF.y,sk.wrF.x-sk.elF.x)-Math.PI/2,P.tilt)});
    parts.push({draw:(c,u)=>drawArm(mkPen(c,u),M,sk.shF,sk.elF,sk.wrF,true,P)});
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM});
    const tip={x:sk.tBase.x+Math.cos(sk.tDir)*HOE,y:sk.tBase.y+Math.sin(sk.tDir)*HOE}, sc=q=>({x:q.x*K,y:q.y*K});
    cv._tip=sc(tip); cv._hand=sc(sk.wrF); cv._mouth=sc(sk.H(13,-5)); cv._head=sc(sk.H(4,-30)); cv._hip=sc(sk.hip);
    const ca=Math.atan2(sk.wrF.y-sk.elF.y,sk.wrF.x-sk.elF.x)-Math.PI/2-rad(P.tilt)*0.6; cv._spout=sc({x:sk.wrF.x+Math.cos(ca)*18-Math.sin(ca)*(-2),y:sk.wrF.y+Math.sin(ca)*18+Math.cos(ca)*(-2)});
    cache.set(key,cv); return cv;
  }
  return {FW,FH,GROUND,AX,SKINS,ANIMS,poseOf,frame,mats};
})();
