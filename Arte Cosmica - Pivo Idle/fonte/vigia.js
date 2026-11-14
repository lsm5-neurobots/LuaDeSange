/* ===== VIGIA: recruta em hi-bit (esqueleto, poses, desenho) ===== */
const VIGIA=(function(){
  const {rad,ramp,lp,lerp,P2,ik,mkPen,compose}=PIX;
  const FW=136, FH=150, GROUND=144, AX=56;
  const SKINS={media:{nome:'Pele média',hex:'#c08458'}, escura:{nome:'Pele escura',hex:'#7e4f32'}, clara:{nome:'Pele clara',hex:'#e6b28a'}};
  const RIM='#a9c8f0';
  function mats(skin){
    return {
      skin:ramp(SKINS[skin].hex),
      hair:['#4a3a30','#2a201c','#1a1412','#0e0a08'],
      shirt:['#4a6aa0','#2f4a7a','#1f3256','#121c38'],
      collar:['#5a7ab0','#41618f','#2a4470','#18284a'],
      cap:['#34497a','#22345a','#172440','#0c1222'],
      band:['#3a3a44','#15161c','#0e0e12','#060608'],
      visor:['#6a6e7a','#141418','#0c0c10','#040406'],
      gold:['#ffe27a','#d8b040','#8a6a18','#4a380c'],
      silver:['#ffffff','#c8ccd4','#8a8ea0','#4a4e60'],
      pants:['#3a4058','#232838','#161a28','#0a0e18'],
      patch:['#4a5070','#2e3448','#1e2232','#10121c'],
      boot:['#5a5862','#1c1a1e','#121014','#060508'],
      sole:['#7a7478','#4a4448','#322c30','#1c181a'],
      belt:['#3a3a42','#18181c','#101012','#060608'],
      paper:['#ffffff','#f0ece0','#b4ae9e','#6c6858'],
      blue:['#6aa0f0','#2f6db5','#1f4a80','#102a4a'],
      led:['#c8ffd0','#6fdc7a','#3a9a48','#1a5022'],
      eye:['#ffffff','#f2efe6','#b8b4a8','#6e6a60'],
      iris:['#8a5a3a','#4a2a18','#2a180e','#140a06'],
      mouth:['#8a3444','#4a1828','#2a0c18','#1a0610'],
      teeth:['#fffbe8','#e8e0c0','#b0a680','#6a6040'],
      smear:['#ffffff','#fff6d0','#e8d8a0','#b8a870'],
    };
  }
  const REST={hx:0,lean:-3,head:0,aFs:4,aFe:14,aBs:-8,aBe:6,lFh:4,lFk:-2,lBh:-6,lBk:-8,bat:-10,inhand:0,mouth:0,brow:0,smear:0,sa:0,flash:0,whistle:0,impact:0};
  const GUARD={inhand:1,aFs:24,aFe:72,bat:58,aBs:28,aBe:84,lean:2,brow:1};
  const th=(p,o)=>4+18*Math.sin(p+o), sh=(p,o)=>th(p,o)-26*Math.max(0,Math.cos(p+o));
  const ANIMS={
    idle:{nome:'Parado (posto)',n:6,dur:()=>160,pose:i=>{ const p=i/6*Math.PI*2, s=Math.sin(p); return {lean:-3+0.8*s, head:0.8*Math.sin(p-0.7), aFs:4+1.5*s, aFe:14+2*s, aBs:-8+1.5*s, aBe:6+2*s}; }},
    walk:{nome:'Ronda',n:8,dur:()=>115,pose:i=>{ const p=i/8*Math.PI*2;
      return {lFh:th(p,0), lFk:sh(p,0), lBh:th(p,Math.PI), lBk:sh(p,Math.PI), aFs:4-16*Math.sin(p), aFe:20-16*Math.sin(p), aBs:-6+16*Math.sin(p), aBe:4+16*Math.sin(p), lean:-2+1.2*Math.sin(2*p), head:Math.sin(2*p-0.6)}; }},
    guard:{nome:'Guarda (bastão na mão)',n:6,dur:()=>130,pose:i=>{ const p=i/6*Math.PI*2, s=Math.sin(p); return Object.assign({},GUARD,{lean:2+1.2*s, aFs:24+3*s, aFe:72+4*s, aBs:28+2*s, lFh:12, lFk:2, lBh:-12, lBk:-18, head:-2+s}); }},
    advance:{nome:'Avançar',n:8,dur:()=>95,pose:i=>{ const p=i/8*Math.PI*2;
      return Object.assign({},GUARD,{lFh:6+20*Math.sin(p), lFk:6+20*Math.sin(p)-28*Math.max(0,Math.cos(p)), lBh:6+20*Math.sin(p+Math.PI), lBk:6+20*Math.sin(p+Math.PI)-28*Math.max(0,Math.cos(p+Math.PI)), lean:6+1.5*Math.sin(2*p), aFs:24+5*Math.sin(p), aBs:28-5*Math.sin(p), head:-3}); }},
    combo:{nome:'Combo de 3 golpes',n:12,hits:{2:1,6:2,10:3},dur:i=>[120,50,60,90,90,40,60,90,130,40,70,170][i],pose:i=>Object.assign({},GUARD,[
      {aFs:-50,aFe:-10,bat:150,lean:-8,head:-4,hx:-3,lFh:10,lBh:-14,lBk:-18},
      {aFs:-30,aFe:30,bat:120,lean:-6,hx:-2,lFh:12,lBh:-14,lBk:-18},
      {aFs:86,aFe:92,bat:0,lean:10,hx:6,mouth:1,smear:1,sa:200,lFh:22,lFk:6,lBh:-18,lBk:-26},
      {aFs:100,aFe:112,bat:-6,lean:12,hx:7,mouth:1,lFh:22,lFk:6,lBh:-18,lBk:-26},
      {aFs:60,aFe:150,bat:40,lean:4,hx:4,lFh:16,lBh:-14,lBk:-20},
      {aFs:20,aFe:40,bat:-50,lean:2,hx:3,lFh:16,lBh:-14,lBk:-20},
      {aFs:120,aFe:150,bat:20,lean:-4,hx:6,mouth:1,smear:2,sa:10,lFh:18,lFk:4,lBh:-16,lBk:-22},
      {aFs:140,aFe:170,bat:10,lean:-6,hx:6,mouth:1,lFh:18,lFk:4,lBh:-16,lBk:-22},
      {aFs:170,aFe:190,bat:10,lean:-10,hx:3,brow:1,lFh:8,lBh:-10,lBk:-14,mouth:1},
      {aFs:150,aFe:160,bat:20,lean:-8,hx:4,lFh:8,lBh:-10,lBk:-14},
      {aFs:70,aFe:80,bat:20,lean:22,hx:10,mouth:2,smear:3,sa:200,impact:1,lFh:28,lFk:10,lBh:-22,lBk:-32},
      {aFs:60,aFe:70,bat:30,lean:20,hx:9,mouth:1,lFh:28,lFk:10,lBh:-22,lBk:-32}][i])},
    special:{nome:'Especial: apito',n:7,dur:i=>[120,110,220,220,220,150,150][i],pose:i=>Object.assign({},GUARD,[
      {aFs:30,aFe:70,bat:60,aBs:50,aBe:110,brow:2},
      {whistle:1,aFs:150,aFe:170,bat:10,lean:-8,head:-6,brow:1},
      {whistle:2,aFs:155,aFe:175,bat:10,lean:-9,head:-7,brow:1,hx:-1},
      {whistle:2,aFs:150,aFe:170,bat:10,lean:-9,head:-7,brow:1},
      {whistle:2,aFs:155,aFe:175,bat:10,lean:-9,head:-7,brow:1,hx:-1},
      {aFs:90,aFe:110,bat:20,lean:0,mouth:1},
      {}][i])},
    hurt:{nome:'Dano',n:4,dur:i=>[80,110,130,160][i],pose:i=>Object.assign({},GUARD,[
      {lean:-14,head:-16,hx:-6,flash:1,aFs:-10,aFe:20,bat:90,aBs:-30,aBe:-10,mouth:2,brow:2,lFh:14,lBh:-4},
      {lean:-10,head:-12,hx:-5,aFs:0,aFe:30,bat:80,aBs:-20,aBe:0,mouth:1,brow:2,lFh:12,lBh:-6},
      {lean:-4,head:-4,hx:-2,aFs:14,aFe:50,mouth:0},
      {}][i])},
  };
  /* --- animações extras (aditivas): combo B, pulo, aéreo, corrida, investida, lançador, esquiva, 2 danos --- */
  const G2=(o)=>Object.assign({},GUARD,o);
  ANIMS.combo.hitsx={2:{m:1},6:{m:1},10:{m:2,heavy:1}};
  Object.assign(ANIMS,{
    comboB:{nome:'Combo B: giro, estocada, chute',n:11,dur:i=>[100,50,60,80,90,55,80,90,60,90,140][i],
      hitsx:{2:{m:1},5:{m:1.2,reach:52},8:{m:1.8,heavy:1}},
      pose:i=>G2([
        {aFs:-60,aFe:-30,bat:170,lean:-4,head:-6,hx:-2,lFh:8,lBh:-14,lBk:-18},
        {aFs:20,aFe:40,bat:60,lean:6,hx:2,smear:1,sa:250,lFh:14,lBh:-16,lBk:-20},
        {aFs:95,aFe:100,bat:-10,lean:12,hx:6,smear:1,sa:200,mouth:1,lFh:20,lFk:4,lBh:-18,lBk:-26},
        {aFs:110,aFe:130,bat:-20,lean:10,hx:6,lFh:20,lFk:4,lBh:-18,lBk:-26},
        {aFs:-20,aFe:60,bat:30,lean:-2,hx:2,lFh:10,lBh:-12,lBk:-18},
        {aFs:80,aFe:85,bat:5,lean:18,hx:12,mouth:1,smear:1,sa:120,lFh:30,lFk:12,lBh:-24,lBk:-34},
        {aFs:82,aFe:88,bat:5,lean:18,hx:12,lFh:30,lFk:12,lBh:-24,lBk:-34},
        {aFs:30,aFe:70,bat:60,lean:-8,hx:4,lFh:70,lFk:-10,lBh:-6,lBk:-8},
        {aFs:10,aFe:60,bat:70,lean:-16,hx:8,lFh:88,lFk:92,lBh:-4,lBk:-6,mouth:2},
        {aFs:12,aFe:62,bat:70,lean:-14,hx:8,lFh:80,lFk:84,lBh:-4,lBk:-6},
        {lean:0,hx:4,lFh:20,lFk:4,lBh:-14,lBk:-20}][i])},
    jump:{nome:'Pulo',n:7,dur:i=>[100,60,120,120,120,80,110][i],z:[0,8,28,36,18,0,0],squash:[0.92,1.06,1.04,1,1.02,0.86,0.97],
      pose:i=>G2([
        {lean:14,head:-6,lFh:44,lFk:-34,lBh:22,lBk:-56,aFs:-20,aFe:30,bat:100,aBs:-30,aBe:10},
        {lean:4,head:-10,lFh:6,lFk:-6,lBh:-14,lBk:-22,aFs:40,aFe:110,bat:50,aBs:-40,aBe:-10},
        {lean:-2,lFh:50,lFk:-20,lBh:10,lBk:-60,aFs:60,aFe:140,bat:30,aBs:40,aBe:90},
        {lean:2,lFh:60,lFk:-30,lBh:20,lBk:-70,aFs:70,aFe:150,bat:20,aBs:50,aBe:100},
        {lean:6,lFh:30,lFk:10,lBh:-6,lBk:-20,aFs:50,aFe:110,bat:40,aBs:30,aBe:70},
        {lean:16,lFh:40,lFk:-30,lBh:20,lBk:-50,aFs:20,aFe:70,bat:60},
        {lean:4,lFh:14,lFk:2,lBh:-12,lBk:-18}][i])},
    air:{nome:'Ataque aéreo descendo',n:6,dur:i=>[90,120,70,70,90,140][i],z:[10,34,20,6,0,0],squash:[1.04,1,1.02,1,0.86,0.97],
      hitsx:{2:{m:1.6,heavy:1,air:1,reach:48}},
      pose:i=>G2([
        {lean:-4,lFh:50,lFk:-20,lBh:10,lBk:-60,aFs:-60,aFe:-20,bat:170,brow:1},
        {lean:-8,lFh:60,lFk:-30,lBh:20,lBk:-70,aFs:170,aFe:190,bat:10,mouth:1},
        {lean:24,lFh:40,lFk:-10,lBh:0,lBk:-40,aFs:70,aFe:80,bat:20,smear:1,sa:200,mouth:2},
        {lean:26,aFs:60,aFe:70,bat:30,lFh:30,lFk:0,lBh:-10,lBk:-30},
        {lean:22,lFh:40,lFk:-30,lBh:20,lBk:-50,aFs:60,aFe:70,bat:30,impact:1},
        {lean:6}][i])},
    run:{nome:'Corrida',n:8,dur:()=>75,pose:i=>{ const p=i/8*Math.PI*2, th=o=>8+32*Math.sin(p+o), sh=o=>th(o)-12-64*Math.max(0,Math.cos(p+o));
      return G2({lFh:th(0),lFk:sh(0),lBh:th(Math.PI),lBk:sh(Math.PI),lean:14+2*Math.sin(2*p),head:-8,aFs:30-24*Math.sin(p),aFe:90-20*Math.sin(p),bat:40,aBs:10+30*Math.sin(p),aBe:80+20*Math.sin(p)}); }},
    dash:{nome:'Investida com estocada',n:6,dur:i=>[110,60,70,100,110,120][i],move:[0,170,170,90,20,0],
      hitsx:{2:{m:1.4,heavy:1,reach:56}},
      pose:i=>G2([
        {lean:16,hx:-2,lFh:30,lFk:-20,lBh:-10,lBk:-40,aFs:-30,aFe:40,bat:40},
        {lean:26,hx:6,lFh:40,lFk:20,lBh:-36,lBk:-50,aFs:70,aFe:80,bat:10,mouth:1},
        {lean:28,hx:12,lFh:44,lFk:24,lBh:-40,lBk:-56,aFs:86,aFe:88,bat:4,smear:1,sa:150,mouth:2},
        {lean:24,hx:12,lFh:40,lFk:20,lBh:-36,lBk:-52,aFs:84,aFe:88,bat:4},
        {lean:12,hx:6,lFh:24,lFk:4,lBh:-18,lBk:-28},
        {lean:4}][i])},
    launcher:{nome:'Lançador',n:6,dur:i=>[110,50,60,100,120,120][i],
      hitsx:{2:{m:1.1,launch:1,reach:44}},
      pose:i=>G2([
        {lean:22,head:4,hx:-2,lFh:34,lFk:-24,lBh:-6,lBk:-40,aFs:-10,aFe:-30,bat:-120},
        {lean:14,aFs:20,aFe:10,bat:-60,lFh:30,lFk:-10,lBh:-10,lBk:-30},
        {lean:-10,head:-12,hx:4,aFs:140,aFe:170,bat:10,smear:1,sa:20,mouth:2,lFh:10,lFk:0,lBh:-20,lBk:-26},
        {lean:-14,aFs:160,aFe:185,bat:10,lFh:6,lBh:-22,lBk:-28},
        {lean:-4,aFs:100,aFe:120,bat:30},
        {lean:2}][i])},
    roll:{nome:'Esquiva (rolamento)',n:6,dur:i=>[70,60,60,60,60,110][i],spin:[0,70,160,250,330,360],move:[60,150,150,150,120,20],
      pose:i=>{ const curl={lean:70,head:20,lFh:90,lFk:-40,lBh:70,lBk:-60,aFs:60,aFe:120,bat:80,aBs:60,aBe:120};
        return G2(i===0?{lean:30,head:6,lFh:40,lFk:-30,lBh:10,lBk:-50,aFs:30,aFe:90,bat:70}:i===5?{lean:14,lFh:30,lFk:-20,lBh:0,lBk:-40}:curl); }},
    hurtB:{nome:'Dano: cabeça pra trás',n:4,dur:i=>[80,110,130,150][i],pose:i=>G2([
      {lean:-18,head:-30,hx:-7,flash:1,aFs:-30,aFe:-10,bat:110,aBs:-40,aBe:-20,mouth:2,brow:2,lFh:18,lBh:-2},
      {lean:-14,head:-24,hx:-6,aFs:-20,aFe:10,bat:100,aBs:-30,aBe:-10,mouth:1,brow:2,lFh:16,lBh:-4},
      {lean:-6,head:-8,hx:-3,aFs:10,aFe:40},{}][i])},
    hurtC:{nome:'Dano: dobra no estômago',n:4,dur:i=>[80,120,130,150][i],pose:i=>G2([
      {lean:34,head:18,hx:-4,flash:1,aFs:50,aFe:20,bat:90,aBs:40,aBe:10,mouth:2,lFh:20,lFk:-10,lBh:-6,lBk:-20},
      {lean:30,head:14,hx:-3,aFs:44,aFe:24,bat:90,aBs:36,aBe:14,mouth:1,lFh:18,lFk:-8,lBh:-6,lBk:-18},
      {lean:12,head:4,hx:-1},{}][i])},
  });
  function poseOf(anim,i){ return Object.assign({},REST,ANIMS[anim].pose(i)); }

  function skeleton(P){
    const hip={x:AX+P.hx,y:76};
    const hipF={x:hip.x-3,y:hip.y}, hipB={x:hip.x+3,y:hip.y};
    const kneeF=lp(hipF,P.lFh,22), ankleF=lp(kneeF,P.lFk,22), kneeB=lp(hipB,P.lBh,22), ankleB=lp(kneeB,P.lBk,22);
    const dy=GROUND-Math.max(ankleF.y+5.5, ankleB.y+5.5);
    [hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB].forEach(p=>p.y+=dy);
    const a=rad(P.lean), c=Math.cos(a), s=Math.sin(a);
    const T=(lx,ly)=>({x:hip.x+lx*c-ly*s, y:hip.y+lx*s+ly*c});
    const neck=T(1,-33), shF=T(-4,-29), shB=T(6,-30);
    const ha=rad(P.lean+P.head), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:neck.x+lx*hc-ly*hs, y:neck.y+lx*hs+ly*hc});
    const elF=lp(shF,P.aFs,14), wrF=lp(elF,P.aFe,13);
    let elB=lp(shB,P.aBs,14), wrB=lp(elB,P.aBe,13);
    if(P.whistle){ const r=ik(shB,H(11,-6),14,13,true); elB=r.E; wrB=r.W; }
    const bAng=P.aFe+P.bat; const bDir=Math.atan2(Math.cos(rad(bAng)),Math.sin(rad(bAng)));
    return {hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,neck,shF,shB,elF,wrF,elB,wrB,a,ha,H,T,bDir,eye:H(7.4,-14)};
  }
  function drawArm(p,M,sh,el,wr,front,fist){
    p.id();
    p.F(M.shirt[1]); p.cap(sh,el,8,7);
    const cuff=lerp(el,wr,0.22);
    p.cap(el,cuff,7,6.6);
    p.F(M.skin[1]); p.cap(cuff,wr,5,4.4);
    p.F(M.collar[1]); p.cap(lerp(el,wr,0.14),lerp(el,wr,0.3),7.2,7);
    p.F(M.shirt[2]); p.circle(lerp(sh,el,0.55),1);
    if(front){ const e=lerp(sh,el,0.35); p.F(M.gold[1]); p.ell(e.x,e.y,2.6,3); p.F(M.blue[1]); p.ell(e.x,e.y-0.3,1.2,1.4); p.F(M.paper[1]); p.rect(e.x-2,e.y+1,4,0.9); }
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x);
    p.xf(ang,wr.x,wr.y);
    p.F(M.skin[1]); p.ell(1.6,0,3.8,3.6);
    p.F(M.skin[2]); p.rect(2.4,-2.4,0.9,4.8);
    p.F(M.skin[1]); p.ell(0.4,-3.2,1.6,1.2);
    p.id();
  }
  function drawLeg(p,M,hip,knee,ankle,front){
    p.id();
    p.F(M.pants[1]); p.cap(hip,knee,10,8.6); p.cap(knee,ankle,8.6,8);
    if(front){ p.F(M.pants[0]); p.cap(lerp(hip,knee,0.1),lerp(knee,ankle,0.6),0.9,0.9); p.F(M.patch[1]); p.ell(knee.x+0.6,knee.y,3,2.6); p.F(M.patch[3]); p.rect(knee.x-2,knee.y-2.4,0.8,0.8); p.rect(knee.x+2,knee.y+1.6,0.8,0.8); }
    const a=ankle;
    p.F(M.boot[1]); p.cap(lerp(knee,ankle,0.58),a,9.4,9);
    p.poly([[a.x-4.6,a.y-3],[a.x+4,a.y-3],[a.x+9.6,a.y+0.6],[a.x+10.4,a.y+3.6],[a.x-5,a.y+3.6]]);
    p.F(M.sole[1]); p.rect(a.x-5.2,a.y+3.4,15.8,2);
    p.F(M.boot[0]); p.rect(a.x+4.6,a.y-0.4,3,1);
    p.F(M.sole[0]); const k=lerp(knee,ankle,0.7); [0,1,2].forEach(j=>{ const q=lerp(k,a,j*0.3); p.rect(q.x+2,q.y-1,1.6,0.9); });
  }
  function drawTorso(p,M,sk,P){
    p.xf(sk.a,sk.hip.x,sk.hip.y);
    p.F(M.shirt[1]); p.poly([[-10.5,1],[9.5,1],[10.6,-8],[12.6,-16],[13,-23],[10.4,-29.6],[4,-33.4],[-4.6,-33.4],[-10.4,-29],[-11.6,-19],[-11,-8]]);
    p.F(M.shirt[2]); p.rect(5.6,-27.6,1,26); p.rect(-6,-20,1,18);
    p.F(M.silver[1]); [-24,-18,-12,-6].forEach(y=>p.rect(6.6,y,1.2,1.2));
    p.F(M.shirt[0]); p.rect(9.6,-21,1,12);
    // bolsos + crachá + tarja SEG
    p.F(M.shirt[2]); p.rect(-2,-24,7,1); p.rect(-2,-23,1,7); p.rect(4,-23,1,7);
    p.F(M.paper[1]); p.rect(-1,-22.4,4.4,6); p.F(M.blue[1]); p.rect(-1,-17.8,4.4,1.4); p.F(M.skin[2]); p.rect(-0.2,-21.6,1.6,2); p.F(M.silver[1]); p.rect(0.6,-23.6,1,1.6);
    p.F(M.belt[1]); p.rect(-2,-28.4,7,2.6); p.F(M.gold[1]); [0,1.6,3.2].forEach(x=>p.rect(-1.4+x,-27.6,1,1.2));
    // gola em V + cordão do apito
    p.F(M.skin[1]); p.poly([[0.6,-33],[5.2,-33.2],[3.4,-28.4]]);
    p.F(M.collar[1]); p.poly([[-1.4,-33.6],[3,-34.6],[1.8,-29.4]]); p.poly([[3.6,-34.6],[7.4,-33.4],[4.4,-29]]);
    if(!P.whistle){ p.F(M.gold[1]); p.rect(2.8,-29,0.9,9); p.F(M.silver[1]); p.ell(4.2,-19.6,2,1.3); }
    // dragona + rádio no ombro de trás
    p.F(M.shirt[2]); p.rect(-9,-31.6,8,2);
    p.F(M.belt[1]); p.rect(-10.6,-31,4.6,7.4); p.rect(-9.4,-37,0.9,6); p.F(M.led[1]); p.rect(-8,-30,1.2,1.2);
    // remendo
    p.F(M.collar[1]); p.rect(-9.6,-9,5,5); p.F(M.shirt[3]); [[-9.6,-9],[-6,-9],[-9.6,-5],[-6,-5]].forEach(([x,y])=>p.rect(x,y,0.8,0.8));
    // cinto
    p.F(M.belt[1]); p.poly([[-11.2,-3.6],[10.2,-3.6],[10.4,1.2],[-11.4,1.2]]);
    p.F(M.silver[1]); p.rect(5,-3,3.4,3.6); p.F(M.belt[2]); p.rect(6,-2,1.4,1.6);
    p.F(M.belt[0]); p.rect(-10,-3.4,19,0.8);
    p.F(M.belt[1]); p.rect(-12.6,-2.6,4,7.4); p.F(M.belt[0]); p.rect(-12.4,-2.4,3.6,1);
    p.id();
  }
  function drawHead(p,M,sk,P){
    p.xf(sk.ha,sk.neck.x,sk.neck.y);
    p.F(M.skin[1]); p.cap(P2(0,3),P2(1,-6),8.4,7.6);
    p.F(M.skin[2]); p.rect(3,-4,1,5);
    p.F(M.skin[1]); p.ell(-4.4,-12.6,2.4,3.4); p.ell(2.4,-14,9.6,9.6);
    p.poly([[-2,-8],[10.6,-9.4],[12.4,-5],[9.4,-1.2],[2,-1]]);
    p.F(M.skin[3]); p.ell(-4.4,-12.6,1,2);
    p.F(M.hair[1]); p.poly([[-8.4,-17.6],[-3.6,-17.6],[-2.4,-11],[-4,-9],[-7.6,-10]]); p.rect(-1.4,-17.4,2.4,4.6);
    p.F(M.hair[2]); [[4,-3],[6,-2.4],[8,-2.6],[2.6,-4.6],[10,-4]].forEach(([x,y])=>p.rect(x,y,0.9,0.9));
    // olho + sobrancelha
    p.F(M.eye[1]); p.ell(7,-13.6,2.5,2.1);
    p.F(M.iris[1]); p.rect(7.6,-14.6,1.6,2.2);
    p.F(M.eye[0]); p.rect(8,-14.6,0.8,0.8);
    p.F(M.skin[2]); p.ell(11.6,-13.8,1.2,1.8);
    p.F(M.hair[2]);
    if(P.brow===1) p.poly([[3.6,-18.4],[10,-16.2],[10,-14.6],[3.6,-16.4]]);
    else if(P.brow===2) p.poly([[3.6,-19.4],[10,-19.4],[10,-17.6],[3.6,-17.6]]);
    else p.poly([[3.6,-17.6],[10,-17],[10,-15.4],[3.6,-15.8]]);
    // nariz + vinco
    p.F(M.skin[1]); p.poly([[10,-14],[14,-9.6],[10.4,-9]]);
    p.F(M.skin[2]); p.rect(9.6,-9.4,1,2.6);
    // boca + bigode
    if(P.mouth===2){ p.F(M.mouth[1]); p.poly([[7,-7.6],[12.4,-7.8],[12,-2.6],[7.6,-3]]); p.F(M.teeth[1]); p.rect(7.6,-7.6,4.4,1.2); p.rect(8,-3.8,3.6,1); }
    else if(P.mouth===1){ p.F(M.mouth[1]); p.poly([[7.4,-7.2],[12.2,-7.4],[11.8,-4.4],[7.8,-4.6]]); p.F(M.teeth[1]); p.rect(7.8,-7.2,4,1.2); }
    else { p.F(M.mouth[2]); p.rect(8,-6.2,3.8,0.9); }
    p.F(M.hair[1]); p.poly([[6.2,-9.6],[13.4,-9.8],[14,-7.2],[10,-7.8],[6.4,-6.8]]);
    if(P.whistle){ p.F(M.silver[1]); p.poly([[11.4,-6.6],[17,-6.8],[17.2,-4],[11.6,-4]]); p.F(M.silver[3]); p.rect(15.4,-6,1,1.2); p.F(M.skin[0]); p.ell(9.4,-5.6,1.6,1.2); }
    // quepe
    p.F(M.cap[1]); p.poly([[-10,-19.4],[-9.4,-26.6],[0,-30],[10,-28.4],[12.6,-23],[11,-19.8]]);
    p.F(M.cap[0]); p.poly([[-6,-27],[0,-29.2],[7,-28.2],[0,-27]]);
    p.F(M.band[1]); p.poly([[-10.2,-21.6],[11.4,-22],[11.8,-18.4],[-10,-18]]);
    p.F(M.band[0]); p.rect(-9.6,-20.2,20.6,0.8);
    p.F(M.visor[1]); p.poly([[8,-19.6],[19.6,-18.2],[18.4,-16.2],[8.4,-17.2]]);
    p.F(M.visor[0]); p.rect(11,-18.8,6,0.9);
    p.F(M.gold[1]); p.poly([[3.2,-24.6],[7.2,-24.6],[7,-21.6],[5.2,-20.2],[3.4,-21.6]]);
    p.F(M.silver[0]); p.rect(4.8,-23.2,1,1);
    p.id();
  }
  function drawSmear(p,M,sk,P){
    p.id(); p.F(M.smear[1]);
    const tip=lp(sk.wrF,P.aFe+P.bat,28), sh=sk.shF;
    const cur=Math.atan2(tip.x-sh.x,tip.y-sh.y)*180/Math.PI, r1=Math.hypot(tip.x-sh.x,tip.y-sh.y)+4, r0=r1-12;
    let a0=P.sa, a1=cur; const n=10, pts=[];
    for(let k=0;k<=n;k++){ const a=a0+(a1-a0)*k/n; pts.push([sh.x+Math.sin(rad(a))*r1, sh.y+Math.cos(rad(a))*r1]); }
    for(let k=n;k>=0;k--){ const a=a0+(a1-a0)*k/n, rr=r0+(r1-r0)*(1-k/n)*0.6; pts.push([sh.x+Math.sin(rad(a))*rr, sh.y+Math.cos(rad(a))*rr]); }
    p.poly(pts);
  }
  const cache=new Map();
  function frame(skin,tier,anim,fi,step=5){
    const K=PIX.getK(), key=skin+tier+anim+fi+step+'@'+K; if(cache.has(key)) return cache.get(key);
    const cv=renderPose(skin,tier,poseOf(anim,fi),step,K); cache.set(key,cv); return cv;
  }
  // pose arbitrária (interpolada) com cache LRU por chave quantizada
  const pcache=(function(){ const m=new Map(); return {get(k){ const v=m.get(k); if(v){ m.delete(k); m.set(k,v); } return v; }, set(k,v){ m.set(k,v); if(m.size>900) m.delete(m.keys().next().value); }}; })();
  function framePose(skin,tier,P,step=5,key){
    const K=PIX.getK(), k=key!=null?skin+tier+key+step+'@'+K:null; if(k){ const c=pcache.get(k); if(c) return c; }
    const cv=renderPose(skin,tier,Object.assign({},REST,P),step,K); if(k) pcache.set(k,cv); return cv;
  }
  function renderPose(skin,tier,P,step,K){
    const M=Object.assign(mats(skin),BATON.TIERS[tier].M), sk=skeleton(P);
    const parts=[
      {back:true, draw:(c,u)=>drawArm(mkPen(c,u),M,sk.shB,sk.elB,sk.wrB,false)},
      {back:true, draw:(c,u)=>drawLeg(mkPen(c,u),M,sk.hipB,sk.kneeB,sk.ankleB,false)},
      {draw:(c,u)=>drawTorso(mkPen(c,u),M,sk,P)},
      {draw:(c,u)=>drawLeg(mkPen(c,u),M,sk.hipF,sk.kneeF,sk.ankleF,true)},
      {draw:(c,u)=>drawHead(mkPen(c,u),M,sk,P)},
      {draw:(c,u)=>{ const p=mkPen(c,u); if(P.inhand) BATON.draw(p,tier,sk.wrF,sk.bDir); else BATON.draw(p,tier,sk.T(7,-1),Math.PI/2+sk.a-0.12,{noCord:true}); }},
    ];
    if(P.smear) parts.push({noShade:true,smear:true,draw:(c,u)=>drawSmear(mkPen(c,u),M,sk,P)});
    parts.push({draw:(c,u)=>drawArm(mkPen(c,u),M,sk.shF,sk.elF,sk.wrF,true)});
    if(P.inhand){ // punho por cima do cabo
      parts.push({draw:(c,u)=>{ const p=mkPen(c,u); const ang=Math.atan2(sk.wrF.y-sk.elF.y,sk.wrF.x-sk.elF.x); p.xf(ang,sk.wrF.x,sk.wrF.y); p.F(M.skin[1]); p.ell(1.6,0,3.8,3.6); p.F(M.skin[2]); p.rect(2.4,-2.4,0.9,4.8); p.id(); }});
    }
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM});
    const tip=lp(sk.wrF,P.aFe+P.bat,BATON.TIERS[tier].len);
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._tip=sc(tip); cv._hand=sc(sk.wrF); cv._mouth=sc(sk.H(16,-5)); cv._head=sc(sk.H(4,-30)); cv._hip=sc(sk.hip);
    return cv;
  }
  return {FW,FH,GROUND,AX,SKINS,ANIMS,poseOf,frame,framePose,mats};
})();
