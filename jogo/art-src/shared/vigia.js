/* VIGIA — fonte de arte (editável). Build: npm run art */
/* Seu vigia de prédio do Recife em hi-bit: camisa de segurança, quepe, bigode, barriguinha, cassetete.
   Mesmo esqueleto do HEROI (ombros largos, mãos/pés grandes); framePose() aceita pose interpolada (TWEEN). */
const VIGIA=(function(){
  const {rad,ramp,lp,lerp,P2,ik,mkPen,compose}=PIX;
  const FW=184, FH=150, GROUND=144, AX=92;
  const SKINS={media:{nome:'Pele média',hex:'#c08458'}, escura:{nome:'Pele escura',hex:'#7e4f32'}, clara:{nome:'Pele clara',hex:'#e6b28a'}};
  const RIM='#a9c8f0';
  function satb(h,k){ let [r,g,b]=PIX.hexRgb(h).map(v=>v/255); const mx=Math.max(r,g,b), mn=Math.min(r,g,b), l=(mx+mn)/2; let s=0,hh=0;
    if(mx!==mn){ const d=mx-mn; s=l>0.5?d/(2-mx-mn):d/(mx+mn); hh=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4; hh/=6; }
    s=Math.min(1,s*k); if(!s) return h; const q=l<0.5?l*(1+s):l+s-l*s, pp=2*l-q, fn=t=>{ t=(t+1)%1; return t<1/6?pp+(q-pp)*6*t:t<1/2?q:t<2/3?pp+(q-pp)*(2/3-t)*6:pp; };
    return PIX.toHex(fn(hh+1/3)*255,fn(hh)*255,fn(hh-1/3)*255); }
  const mix=PIX.mix;
  const R4=(h,k=1.18)=>{ const b=satb(h,k); return [mix(b,'#fff2cc',.36),b,mix(b,'#3b2c63',.48),mix(b,'#1c1233',.74)]; };
  const RX=(h,k=1.18)=>{ const b=satb(h,k); return [mix(b,'#fff2cc',.64),mix(b,'#ffe0a8',.17),mix(b,'#4a3470',.26),mix(b,'#100a20',.86)]; };
  const HS=1.12, FOOT=8;
  function mats(skin){
    return {
      skin:R4(SKINS[skin].hex,1.15), skinX:RX(SKINS[skin].hex,1.15),
      hair:['#5a4a40','#2a201c','#1a1412','#0e0a08'],
      stub:ramp(PIX.mix(SKINS[skin].hex,'#2a201c',0.4)),
      shirt:R4('#2f4c84',1.2), shirtX:RX('#2f4c84',1.2),
      collar:['#6a8ac0','#41618f','#2a4470','#18284a'],
      cap:['#4a5f94','#22345a','#172440','#0c1222'],
      band:['#4a4a54','#15161c','#0e0e12','#060608'],
      visor:['#7a7e8a','#141418','#0c0c10','#040406'],
      gold:['#fff0a0','#d8b040','#8a6a18','#4a380c'],
      silver:['#ffffff','#c8ccd4','#8a8ea0','#4a4e60'],
      pants:R4('#2c3350',1.15), pantsX:RX('#2c3350',1.15),
      patch:['#5a6280','#363c54','#22263a','#10121c'],
      boot:['#6a6672','#221e24','#141016','#060508'], bootX:['#9a94a0','#3a343e','#1c1820','#030203'],
      sole:['#8a8488','#4a4448','#322c30','#1c181a'],
      belt:['#4a4a54','#1c1c22','#101012','#060608'],
      paper:['#ffffff','#f0ece0','#b4ae9e','#6c6858'],
      blue:['#7ab0ff','#2f6db5','#1f4a80','#102a4a'],
      led:['#d8ffe0','#6fdc7a','#3a9a48','#1a5022'],
      eye:['#ffffff','#f2efe6','#b8b4a8','#6e6a60'],
      iris:['#8a5a3a','#4a2a18','#2a180e','#140a06'],
      mouth:['#b04a5a','#5a1c2c','#2a0c18','#1a0610'],
      teeth:['#fffbe8','#e8e0c0','#b0a680','#6a6040'],
      smear:['#ffffff','#fff6d0','#e8d8a0','#b8a870'],
    };
  }
  /* ---------------- poses ---------------- */
  const REST={hx:0,lean:-3,head:0,aFs:4,aFe:14,aBs:-8,aBe:6,lFh:4,lFk:-2,lBh:-6,lBk:-8,bat:-10,inhand:0,mouth:0,brow:0,smear:0,sa:0,flash:0,whistle:0,impact:0,rot:0,lift:0,blink:0,plant:1,tw:0,br:0};
  const K_=o=>{ const r=Object.assign({},o); if(r.bA!==undefined){ r.bat=r.bA-(r.aFe!==undefined?r.aFe:REST.aFe); delete r.bA; } return r; };
  const ST={lFh:52,lFk:8,lBh:-42,lBk:-46};
  const GUARD=Object.assign({inhand:1},ST,K_({aFs:70,aFe:86,bA:128,aBs:46,aBe:112,lean:12,brow:1}));
  // poses legadas (ângulos do rig antigo) ganham base mais larga e baixa
  const G2=o=>{ const r=K_(o); if(!r.nowide){ if(r.lFh!==undefined){ r.lFh+=14; r.lFk=(r.lFk||0)+3; } if(r.lBh!==undefined){ r.lBh-=12; r.lBk=(r.lBk!==undefined?r.lBk:-30)-10; } } delete r.nowide; return Object.assign({},GUARD,r); };
  const S=Math.sin;
  const th=(p,o)=>6+24*Math.sin(p+o), sh=(p,o)=>th(p,o)-34*Math.max(0,Math.cos(p+o));
  const ANIMS={
    idle:{nome:'Parado (posto)',n:8,dur:()=>150,pose:i=>{ const p=i/8*Math.PI*2, s=S(p); return {lean:1+1.4*s, br:s, hx:1.2*S(p/2), head:1.2*S(p-0.7), lFh:26,lFk:4+2.2*s,lBh:-22,lBk:-24+2.2*s, aFs:8+3*s, aFe:30+4*s, aBs:-16+3*s, aBe:20+4*s, blink:i===5?1:0}; }},
    walk:{nome:'Ronda',n:8,dur:()=>115,pose:i=>{ const p=i/8*Math.PI*2;
      return {plant:0,lFh:th(p,0), lFk:sh(p,0), lBh:th(p,Math.PI), lBk:sh(p,Math.PI), aFs:6-18*S(p), aFe:22-16*S(p), aBs:-6+18*S(p), aBe:6+18*S(p), lean:-1+1.4*S(2*p), head:S(2*p-0.6)}; }},
    guard:{nome:'Guarda (bastão na mão)',n:8,dur:()=>125,pose:i=>{ const p=i/8*Math.PI*2, s=S(p); return Object.assign({},GUARD,K_({lean:12+1.2*s, aFs:70+3*s, aFe:86+4*s, bA:128+3*s, aBs:46+2*s, aBe:112+3*s, lFk:5+1.6*s, lBk:-38+1.6*s, head:-2+s, blink:i===6?1:0})); }},
    advance:{nome:'Avançar',n:8,dur:()=>95,pose:i=>{ const p=i/8*Math.PI*2;
      return Object.assign({},GUARD,{plant:0,lFh:10+22*S(p), lFk:10+22*S(p)-30*Math.max(0,Math.cos(p)), lBh:10+22*S(p+Math.PI), lBk:10+22*S(p+Math.PI)-30*Math.max(0,Math.cos(p+Math.PI)), lean:12+1.5*S(2*p), aFs:70+5*S(p), aBs:46-5*S(p), head:-3}); }},
    combo:{nome:'Combo de 3 golpes',n:12,hits:{2:1,6:2,10:3},dur:i=>[110,50,60,90,80,40,60,90,110,60,70,170][i],pose:i=>G2([
      {tw:-0.3,aFs:-40,aFe:-130,bA:200,lean:-12,head:-4,hx:-4,lFh:22,lFk:0,lBh:-18,lBk:-28,aBs:40,aBe:100,mouth:1},
      {aFs:40,aFe:120,bA:168,lean:2,hx:1,lFh:30,lBh:-24,lBk:-34,aBs:20,aBe:60},
      {tw:0.85,aFs:84,aFe:94,bA:100,lean:30,hx:13,head:-12,mouth:2,smear:1,sa:205,aBs:-50,aBe:-20,lFh:50,lFk:10,lBh:-32,lBk:-36},
      {tw:0.7,aFs:62,aFe:46,bA:22,lean:30,hx:13,head:-10,mouth:1,aBs:-50,aBe:-10,lFh:50,lFk:10,lBh:-32,lBk:-36},
      {tw:-0.2,aFs:12,aFe:64,bA:-40,lean:4,hx:6,aBs:10,aBe:60,lFh:34,lFk:4,lBh:-26,lBk:-36},
      {aFs:44,aFe:84,bA:24,lean:2,hx:5,aBs:-10,aBe:30,lFh:36,lFk:6,lBh:-28,lBk:-38},
      {tw:0.8,aFs:128,aFe:150,bA:140,lean:-2,hx:12,head:-10,mouth:2,smear:2,sa:12,aBs:-60,aBe:-30,lFh:50,lFk:10,lBh:-32,lBk:-36},
      {tw:0.6,aFs:152,aFe:176,bA:180,lean:-6,hx:12,head:-12,mouth:1,aBs:-60,aBe:-40,lFh:50,lFk:10,lBh:-32,lBk:-36},
      {aFs:168,aFe:204,bA:232,lean:-14,hx:4,head:-8,brow:1,mouth:1,plant:0,lFh:46,lFk:-14,lBh:-8,lBk:-56,aBs:150,aBe:170},
      {aFs:176,aFe:210,bA:244,lean:-16,hx:6,mouth:1,plant:0,lFh:50,lFk:-12,lBh:-4,lBk:-52,aBs:160,aBe:180},
      {tw:0.9,aFs:70,aFe:56,bA:18,lean:38,hx:15,head:-14,mouth:2,brow:1,smear:3,sa:232,impact:1,aBs:-60,aBe:-30,lFh:54,lFk:12,lBh:-32,lBk:-36},
      {tw:0.7,aFs:64,aFe:50,bA:22,lean:34,hx:14,head:-12,mouth:1,aBs:-50,aBe:-20,lFh:54,lFk:12,lBh:-32,lBk:-36}][i])},
    special:{nome:'Especial: apito',n:7,dur:i=>[120,110,220,220,220,150,150][i],pose:i=>G2([
      {aFs:30,aFe:70,bA:130,aBs:50,aBe:110,brow:2,mouth:1},
      {whistle:1,aFs:150,aFe:170,bA:180,lean:-8,head:-6,brow:1},
      {whistle:2,aFs:155,aFe:175,bA:185,lean:-10,head:-8,brow:1,hx:-1},
      {whistle:2,aFs:150,aFe:170,bA:180,lean:-10,head:-8,brow:1},
      {whistle:2,aFs:155,aFe:175,bA:185,lean:-10,head:-8,brow:1,hx:-1},
      {aFs:90,aFe:110,bA:130,lean:0,mouth:1},
      {}][i])},
    hurt:{nome:'Dano',n:4,dur:i=>[80,110,130,160][i],pose:i=>G2([
      {lean:-16,head:-16,hx:-6,flash:1,aFs:-14,aFe:24,bA:110,aBs:-36,aBe:-14,mouth:2,brow:2,lFh:18,lBh:-6,lBk:-12},
      {lean:-12,head:-12,hx:-5,aFs:-2,aFe:34,bA:110,aBs:-26,aBe:-4,mouth:2,brow:2,blink:1,lFh:18,lBh:-8,lBk:-16},
      {lean:-4,head:-4,hx:-2,aFs:16,aFe:56,bA:120,mouth:1,brow:2},
      {}][i])},
  };
  ANIMS.combo.hitsx={2:{m:1},6:{m:1},10:{m:2,heavy:1}};
  Object.assign(ANIMS,STRIKES.tool(G2,{names:{atkH:'Cassetete: golpe lateral',atkV:'Cassetete: pancada por cima',atkS:'Cassetete: estocada',atkSpin:'Cassetete: giro',atkFin:'Cassetete: gancho que lança'}}));
  Object.assign(ANIMS,{
    comboB:{nome:'Combo B: giro, estocada, chute',n:11,dur:i=>[100,50,60,80,90,55,80,90,60,90,140][i],
      hitsx:{2:{m:1},5:{m:1.2,reach:52},8:{m:1.8,heavy:1}},
      pose:i=>G2([
        {aFs:-60,aFe:-30,bA:140,lean:-6,head:-6,hx:-2,lFh:22,lBh:-20,lBk:-30,aBs:30,aBe:80},
        {aFs:20,aFe:40,bA:100,lean:6,hx:2,smear:1,sa:250,lFh:30,lBh:-24,lBk:-32,aBs:-10,aBe:20},
        {tw:0.8,aFs:94,aFe:98,bA:92,lean:26,hx:12,head:-10,smear:1,sa:205,mouth:2,lFh:48,lFk:10,lBh:-32,lBk:-36,aBs:-50,aBe:-20},
        {aFs:112,aFe:130,bA:110,lean:10,hx:7,lFh:40,lFk:6,lBh:-30,lBk:-44,aBs:-40,aBe:-10},
        {aFs:-24,aFe:60,bA:90,lean:-2,hx:2,lFh:26,lBh:-20,lBk:-30,aBs:40,aBe:100,brow:1},
        {tw:1,aFs:88,aFe:90,bA:92,lean:32,hx:16,head:-14,mouth:2,smear:1,sa:120,lFh:52,lFk:12,lBh:-32,lBk:-36,aBs:-60,aBe:-40},
        {tw:0.9,aFs:88,aFe:90,bA:92,lean:30,hx:16,head:-12,lFh:52,lFk:12,lBh:-32,lBk:-36,aBs:-60,aBe:-40},
        {aFs:30,aFe:72,bA:130,lean:-8,hx:5,plant:0,lFh:70,lFk:-10,lBh:-6,lBk:-10,aBs:40,aBe:90,nowide:1},
        {aFs:10,aFe:62,bA:130,lean:-18,hx:9,plant:0,lFh:92,lFk:96,lBh:-4,lBk:-6,mouth:2,brow:1,impact:1,aBs:50,aBe:110,nowide:1},
        {aFs:12,aFe:64,bA:132,lean:-14,hx:9,plant:0,lFh:84,lFk:86,lBh:-4,lBk:-6,aBs:50,aBe:110,nowide:1},
        {lean:2,hx:5,lFh:30,lFk:4,lBh:-22,lBk:-30}][i])},
    jump:{nome:'Pulo',n:7,dur:i=>[100,60,120,120,120,80,110][i],z:[0,8,28,36,18,0,0],squash:[0.92,1.06,1.04,1,1.02,0.86,0.97],
      pose:i=>G2([
        {lean:16,head:-6,lFh:50,lFk:-30,lBh:16,lBk:-60,aFs:-20,aFe:30,bA:130,aBs:-30,aBe:10,brow:1,nowide:1},
        {lean:4,head:-10,plant:0,lFh:6,lFk:-6,lBh:-14,lBk:-22,aFs:40,aFe:110,bA:160,aBs:-40,aBe:-10,nowide:1},
        {lean:-2,plant:0,lFh:56,lFk:-16,lBh:12,lBk:-62,aFs:60,aFe:140,bA:170,aBs:40,aBe:90,nowide:1},
        {lean:2,plant:0,lFh:70,lFk:-24,lBh:24,lBk:-72,aFs:70,aFe:150,bA:170,aBs:50,aBe:100,nowide:1},
        {lean:6,plant:0,lFh:34,lFk:10,lBh:-6,lBk:-22,aFs:50,aFe:110,bA:150,aBs:30,aBe:70,nowide:1},
        {lean:18,lFh:50,lFk:-26,lBh:16,lBk:-56,aFs:20,aFe:70,bA:130,mouth:1,nowide:1},
        {lean:6,lFh:30,lFk:4,lBh:-22,lBk:-30}][i])},
    air:{nome:'Ataque aéreo descendo',n:6,dur:i=>[90,120,70,70,90,140][i],z:[10,34,20,6,0,0],squash:[1.04,1,1.02,1,0.86,0.97],
      hitsx:{2:{m:1.6,heavy:1,air:1,reach:48}},
      pose:i=>G2([
        {lean:-4,plant:0,lFh:56,lFk:-16,lBh:12,lBk:-62,aFs:-60,aFe:-20,bA:150,brow:1,nowide:1},
        {lean:-8,plant:0,lFh:66,lFk:-26,lBh:22,lBk:-72,aFs:170,aFe:190,bA:200,mouth:1,brow:1,nowide:1},
        {lean:24,plant:0,lFh:44,lFk:-6,lBh:0,lBk:-44,aFs:70,aFe:80,bA:100,smear:1,sa:200,mouth:2,brow:1,nowide:1},
        {lean:26,plant:0,aFs:60,aFe:70,bA:100,lFh:34,lFk:2,lBh:-10,lBk:-32,nowide:1},
        {lean:22,lFh:48,lFk:-28,lBh:18,lBk:-54,aFs:60,aFe:60,bA:40,impact:1,mouth:2,nowide:1},
        {lean:6}][i])},
    run:{nome:'Corrida',n:8,dur:()=>75,pose:i=>{ const p=i/8*Math.PI*2, t=o=>12+46*S(p+o), k=o=>t(o)-18-76*Math.max(0,Math.cos(p+o));
      return Object.assign({},GUARD,K_({plant:0,lFh:t(0),lFk:k(0),lBh:t(Math.PI),lBk:k(Math.PI),lean:22+3*S(2*p),head:-14,aFs:30-48*S(p),aFe:96-36*S(p),bA:150-14*S(p),aBs:10+50*S(p),aBe:90+30*S(p),mouth:1})); }},
    dash:{nome:'Investida com estocada',n:6,dur:i=>[110,60,70,100,110,120][i],move:[0,170,170,90,20,0],
      hitsx:{2:{m:1.4,heavy:1,reach:56}},
      pose:i=>G2([
        {lean:16,hx:-2,lFh:30,lFk:-20,lBh:-10,lBk:-40,aFs:-30,aFe:40,bA:80,brow:1},
        {lean:26,hx:6,plant:0,lFh:40,lFk:20,lBh:-36,lBk:-50,aFs:70,aFe:80,bA:90,mouth:1},
        {lean:28,hx:12,lFh:44,lFk:24,lBh:-40,lBk:-56,aFs:86,aFe:88,bA:92,smear:1,sa:150,mouth:2},
        {lean:24,hx:12,lFh:40,lFk:20,lBh:-36,lBk:-52,aFs:84,aFe:88,bA:92},
        {lean:12,hx:6,lFh:24,lFk:4,lBh:-18,lBk:-28},
        {lean:6}][i])},
    launcher:{nome:'Lançador',n:6,dur:i=>[110,50,60,100,120,120][i],
      hitsx:{2:{m:1.1,launch:1,reach:44}},
      pose:i=>G2([
        {lean:22,head:4,hx:-2,lFh:34,lFk:-24,lBh:-6,lBk:-40,aFs:-10,aFe:-30,bA:-150,brow:1},
        {lean:14,aFs:20,aFe:10,bA:-50,lFh:30,lFk:-10,lBh:-10,lBk:-30},
        {lean:-10,head:-12,hx:4,aFs:140,aFe:170,bA:180,smear:1,sa:20,mouth:2,lFh:10,lFk:0,lBh:-20,lBk:-26},
        {lean:-14,aFs:160,aFe:185,bA:195,lFh:6,lBh:-22,lBk:-28,mouth:1},
        {lean:-4,aFs:100,aFe:120,bA:150},
        {lean:4}][i])},
    roll:{nome:'Esquiva (rolamento)',n:6,dur:i=>[70,60,60,60,60,110][i],spin:[0,70,160,250,330,360],move:[60,150,150,150,120,20],
      pose:i=>{ const curl={lean:64,head:24,plant:0,lFh:124,lFk:20,lBh:112,lBk:6,aFs:96,aFe:150,bA:96,aBs:80,aBe:140,brow:1,nowide:1};
        return G2(i===0?{lean:30,head:6,lFh:40,lFk:-30,lBh:10,lBk:-50,aFs:30,aFe:90,bA:150,brow:1}:i===5?{lean:16,lFh:30,lFk:-20,lBh:0,lBk:-40}:curl); }},
    hurtB:{nome:'Dano: cabeça pra trás',n:4,dur:i=>[80,110,130,150][i],pose:i=>G2([
      {lean:-20,head:-30,hx:-7,flash:1,aFs:-34,aFe:-12,bA:100,aBs:-44,aBe:-24,mouth:2,brow:2,blink:1,lFh:22,lBh:-4,lBk:-10},
      {lean:-16,head:-24,hx:-6,aFs:-24,aFe:8,bA:110,aBs:-34,aBe:-14,mouth:2,brow:2,lFh:20,lBh:-6,lBk:-12},
      {lean:-6,head:-8,hx:-3,aFs:10,aFe:46,bA:120,mouth:1,brow:2},{}][i])},
    hurtC:{nome:'Dano: dobra no estômago',n:4,dur:i=>[80,120,130,150][i],pose:i=>G2([
      {lean:36,head:16,hx:-4,flash:1,aFs:54,aFe:20,bA:80,aBs:44,aBe:10,mouth:2,brow:2,blink:1,lFh:22,lFk:-10,lBh:-8,lBk:-22},
      {lean:30,head:14,hx:-3,aFs:46,aFe:24,bA:80,aBs:38,aBe:14,mouth:2,brow:2,lFh:20,lFk:-8,lBh:-8,lBk:-20},
      {lean:12,head:4,hx:-1,mouth:1,brow:2},{}][i])},
    fall:{nome:'Derrubado',n:7,dur:i=>[90,110,110,90,110,160,400][i],pose:i=>Object.assign({},GUARD,K_([
      {lean:-26,head:-20,hx:-4,flash:1,lift:4,plant:0,mouth:2,brow:2,aFs:-40,aFe:-90,bA:160,aBs:-60,aBe:-120,lFh:30,lFk:10,lBh:-4,lBk:-20},
      {rot:-38,lean:-10,head:-14,hx:2,lift:20,plant:0,mouth:2,brow:2,blink:1,aFs:150,aFe:170,bA:200,aBs:170,aBe:200,lFh:50,lFk:30,lBh:30,lBk:10},
      {rot:-72,lean:-4,head:-10,hx:12,lift:12,plant:0,mouth:2,brow:2,blink:1,aFs:160,aFe:190,bA:220,aBs:180,aBe:210,lFh:40,lFk:40,lBh:20,lBk:20},
      {rot:-90,lean:0,head:-14,hx:22,plant:0,mouth:2,brow:2,blink:1,aFs:140,aFe:160,bA:190,aBs:170,aBe:200,lFh:30,lFk:40,lBh:14,lBk:24},
      {rot:-86,lean:-2,head:-6,hx:23,lift:4,plant:0,mouth:1,brow:2,blink:1,aFs:150,aFe:180,bA:200,aBs:176,aBe:210,lFh:24,lFk:30,lBh:10,lBk:16},
      {rot:-90,lean:0,head:-2,hx:24,plant:0,mouth:1,brow:2,blink:1,aFs:150,aFe:170,bA:150,aBs:180,aBe:200,lFh:16,lFk:16,lBh:8,lBk:6},
      {rot:-90,lean:0,head:0,hx:24,plant:0,mouth:0,brow:2,blink:1,aFs:146,aFe:166,bA:140,aBs:176,aBe:196,lFh:14,lFk:12,lBh:6,lBk:4}][i]))},
    getup:{nome:'Levantar',n:6,dur:i=>[140,130,130,120,110,120][i],pose:i=>Object.assign({},GUARD,K_([
      {rot:-90,hx:24,head:4,plant:0,brow:2,blink:1,aFs:146,aFe:166,bA:140,aBs:176,aBe:196,lFh:14,lFk:12,lBh:6,lBk:4},
      {lean:32,head:-6,hx:16,plant:0,brow:2,mouth:1,lFh:84,lFk:92,lBh:70,lBk:110,aFs:30,aFe:70,bA:100,aBs:-50,aBe:-30},
      {lean:24,head:-4,hx:10,brow:1,mouth:1,lFh:90,lFk:-14,lBh:6,lBk:-96,aFs:40,aFe:80,bA:110,aBs:20,aBe:50},
      {lean:20,head:-4,hx:6,brow:1,lFh:54,lFk:-8,lBh:-28,lBk:-62,aFs:30,aFe:80,bA:120,aBs:30,aBe:80},
      {lean:10,hx:2,aFs:50,aFe:96,bA:120},
      {}][i]))},
    victory:{nome:'Vitória: apito e continência',n:8,dur:i=>[140,100,100,160,160,180,220,400][i],pose:i=>K_([
      Object.assign({},GUARD,{lean:2,mouth:3,brow:3}),
      {inhand:1,lFh:18,lFk:2,lBh:-16,lBk:-18,lean:-2,aFs:60,aFe:120,bA:200,aBs:-20,aBe:20,mouth:3,brow:3},
      {inhand:1,lFh:18,lFk:2,lBh:-16,lBk:-18,lean:-4,aFs:100,aFe:150,bA:300,aBs:-20,aBe:20,mouth:3,brow:3,smear:1,sa:40},
      {inhand:0,lFh:16,lFk:2,lBh:-14,lBk:-16,lean:-6,head:-6,whistle:2,aFs:20,aFe:40,brow:1},
      {inhand:0,lFh:16,lFk:2,lBh:-14,lBk:-16,lean:-7,head:-8,whistle:2,aFs:22,aFe:44,brow:1},
      {inhand:0,lFh:16,lFk:2,lBh:-14,lBk:-16,lean:-2,head:-2,aFs:110,aFe:158,aBs:-10,aBe:10,mouth:3,brow:3},
      {inhand:0,lFh:16,lFk:2,lBh:-14,lBk:-16,lean:-2,head:-2,aFs:112,aFe:160,aBs:-10,aBe:10,mouth:3,brow:3},
      {inhand:0,lFh:16,lFk:2,lBh:-14,lBk:-16,lean:-2,head:-2,aFs:112,aFe:160,aBs:-10,aBe:10,mouth:3,brow:3}][i])},
  });
  // kit de beat 'em up (o Vigia já tem pulo, aéreo, investida, lançador e rolamento próprios) + assinaturas
  Object.assign(ANIMS,MOVESET.kit(G2,{skip:{dash:1,launcher:1,hurtC:1}}),MOVESET.sigs(G2,{},[
    ['sigJoelho','lowSweep','Cassetetada no joelho'],
    ['sigOmbro','shoulderCharge','Ombrada de plantão']]));
  function poseOf(anim,i){ return Object.assign({},REST,ANIMS[anim].pose(i)); }

  /* ---------------- esqueleto ---------------- */
  function legIK(H,A,L1,L2){
    const dx=A.x-H.x, dy=A.y-H.y, d=Math.max(Math.abs(L1-L2)+0.5,Math.min(L1+L2-0.05,Math.hypot(dx,dy)));
    const b=Math.atan2(dy,dx), q=Math.acos(Math.max(-1,Math.min(1,(L1*L1+d*d-L2*L2)/(2*L1*d))));
    const k1={x:H.x+Math.cos(b-q)*L1,y:H.y+Math.sin(b-q)*L1}, k2={x:H.x+Math.cos(b+q)*L1,y:H.y+Math.sin(b+q)*L1};
    return k1.x>k2.x?k1:k2;
  }
  function skeleton(P){
    const L1=21, L2=20.5, U=14, E=13, br=P.br||0, ro=P.rot||0, r=rad(ro), cr=Math.cos(r), sr=Math.sin(r);
    const hip={x:AX+P.hx,y:80};
    const R=(lx,ly)=>({x:hip.x+lx*cr-ly*sr,y:hip.y+lx*sr+ly*cr});
    const hipF=R(5,0.6), hipB=R(-5.4,0);
    const kneeF=lp(hipF,P.lFh-ro,L1), ankleF=lp(kneeF,P.lFk-ro,L2), kneeB=lp(hipB,P.lBh-ro,L1), ankleB=lp(kneeB,P.lBk-ro,L2);
    const a=rad(P.lean+ro), c=Math.cos(a), s=Math.sin(a);
    const T=(lx,ly)=>({x:hip.x+lx*c-ly*s, y:hip.y+lx*s+ly*c});
    const tw=P.tw||0, neck=T(1,-34.6-br*0.8), shF=T((-14*0.5+1.2)*(1-tw)-1.5*tw,-30-br*0.8), shB=T((13.6*0.5+1.2)*(1-tw)+7*tw,-30.4-br*0.8);
    const ha=rad(P.lean+ro+P.head), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:neck.x+lx*hc-ly*hs, y:neck.y+lx*hs+ly*hc});
    const elF=lp(shF,P.aFs-ro,U), wrF=lp(elF,P.aFe-ro,E);
    let elB=lp(shB,P.aBs-ro,U), wrB=lp(elB,P.aBe-ro,E);
    if(P.whistle>=0.5){ const q=ik(shB,H(12.4,-6.6),U,E,true); elB=q.E; wrB=q.W; }
    const bAng=P.aFe+P.bat-ro, bDir=Math.atan2(Math.cos(rad(bAng)),Math.sin(rad(bAng)));
    const cont=[[ankleF,FOOT],[ankleB,FOOT],[kneeF,6],[kneeB,6],[hip,7],[T(-13,-6),2],[T(-15,-24),2],[T(16,-10),2],[T(0,-33),3],[H(2.9,-16.4),11.8],[wrF,5.4],[wrB,5.4]];
    let low=-1e9; cont.forEach(([q,rr])=>{ low=Math.max(low,q.y+rr); });
    const dy=GROUND-low-(P.lift||0);
    [hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,neck,shF,shB,elF,wrF,elB,wrB].forEach(q=>q.y+=dy);
    const sk={hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,neck,shF,shB,elF,wrF,elB,wrB,a,ha,H,T,bDir,ro,tw,br,eye:H(8.3,-15.7)};
    if(P.plant>=0.5 && !(P.lift>0.5) && Math.abs(ro)<10){
      [['kneeF','ankleF','hipF'],['kneeB','ankleB','hipB']].forEach(([kn,an,hp])=>{
        const gap=GROUND-(sk[an].y+FOOT); if(gap>0.05 && gap<4.5){ const A={x:sk[an].x,y:sk[an].y+gap}; const k=legIK(sk[hp],A,L1,L2); sk[kn].x=k.x; sk[kn].y=k.y; sk[an].x=A.x; sk[an].y=A.y; }
      });
    }
    return sk;
  }

  /* ---------------- desenho ---------------- */
  function band(p,a,b,wa,wb,col,f,lite,ins){
    const dx=b.x-a.x, dy=b.y-a.y, L=Math.hypot(dx,dy)||1; let nx=-dy/L, ny=dx/L;
    if((-nx+0.6*ny<0)!==!!lite){ nx=-nx; ny=-ny; }
    ins=ins||0; const oa=wa*(1-f)/2-ins, ob=wb*(1-f)/2-ins;
    p.F(col); p.cap({x:a.x+nx*oa,y:a.y+ny*oa},{x:b.x+nx*ob,y:b.y+ny*ob},wa*f,wb*f);
  }
  // volume esculpido: meio-tom largo, sombra roxa grande, borda funda, luz e ponto quente
  function vol(p,a,b,wa,wb,R,X,o={}){
    p.F(R[1]); p.cap(a,b,wa,wb);
    band(p,a,b,wa,wb,X[2],0.66); band(p,a,b,wa,wb,R[2],0.46); band(p,a,b,wa,wb,R[3],0.16);
    if(!o.noLite){ const a2=lerp(a,b,o.l0||0.1), b2=lerp(a,b,o.l1||0.8); band(p,a2,b2,wa,wb,X[1],0.34,true,0.4); band(p,a2,b2,wa,wb,R[0],0.2,true,0.7); band(p,lerp(a,b,o.h0||0.25),lerp(a,b,o.h1||0.55),wa,wb,X[0],0.1,true,1); }
  }
  function sideOff(a,b,w,sgn){ const dx=b.x-a.x, dy=b.y-a.y, L=Math.hypot(dx,dy)||1; let nx=-dy/L, ny=dx/L; if(-nx+0.6*ny<0){ nx=-nx; ny=-ny; } return {x:nx*w*sgn,y:ny*w*sgn}; }
  function xfs(cx,a,ox,oy,sx,sy=1){ const K=PIX.getK(), c=Math.cos(a), s=Math.sin(a); cx.setTransform(c*sx*K,s*sx*K,-s*sy*K,c*sy*K,ox*K,oy*K); }
  function fist(p,M,el,wr){
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x), s=1.55; p.xf(ang,wr.x,wr.y);
    p.F(M.skin[1]); p.ell(2*s,0.2,4.5*s,4.2*s);
    p.F(M.skinX[2]); p.poly([[-0.6*s,1*s],[6*s,0.6*s],[5.4*s,3.6*s],[1.2*s,4.2*s]]);
    p.F(M.skin[2]); p.poly([[0,2.4*s],[5.6*s,1.8*s],[5*s,3.8*s],[1.2*s,4*s]]); p.rect(3.4*s,-2.6*s,0.9,4.6*s); p.rect(5*s,-2*s,0.8,3.4*s);
    p.F(M.skin[3]); p.rect(1.6*s,3.4*s,3*s,0.8);
    p.F(M.skin[0]); p.rect(1.6*s,-3.6*s,3.4*s,1.1); p.F(M.skinX[0]); p.rect(2.4*s,-3.6*s,1.4*s,0.9);
    p.F(M.skin[1]); p.ell(0.4*s,-3.4*s,2.2*s,1.5*s); p.F(M.skin[2]); p.rect(-0.8*s,-2.6*s,2.6*s,0.8);
    p.id();
  }
  function drawArm(p,M,sh,el,wr,front){
    p.id(); const wU=13.4, wE=11.4, wW=8.6;
    vol(p,el,wr,wE,wW,M.skin,M.skinX,{l0:0.05,l1:0.6,h0:0.1,h1:0.4});
    const fb=lerp(el,wr,0.28), fo=sideOff(el,wr,wE*0.12,-1); p.F(M.skinX[1]); p.ell(fb.x+fo.x,fb.y+fo.y,wE*0.36,wE*0.3);
    p.F(M.hair[2]); [0.35,0.55].forEach(t=>{ const q=lerp(el,wr,t); p.rect(q.x-1,q.y-0.4,1.2,0.8); });
    vol(p,sh,el,wU,wE,M.skin,M.skinX,{l0:0.3,l1:0.9});
    // manga curta com punho dobrado
    const e=lerp(sh,el,0.62);
    vol(p,sh,e,wU+3.6,wU+2.8,M.shirt,M.shirtX,{l0:0.01,l1:0.75,h0:0.1,h1:0.45});
    p.F(M.collar[1]); p.cap(lerp(sh,el,0.52),e,wU+3,wU+2.8); p.F(M.collar[2]); p.cap(lerp(sh,el,0.6),e,wU+2.8,wU+2.8); p.F(M.collar[0]); p.cap(lerp(sh,el,0.52),lerp(sh,el,0.55),wU+1.6,wU+1.6);
    const fo2=lerp(sh,e,0.55); p.F(M.shirt[2]); p.cap({x:fo2.x-1.6,y:fo2.y-1.2},{x:fo2.x+1.4,y:fo2.y+1.4},1,0.9);
    if(front){ const q=lerp(sh,el,0.3); p.F(M.gold[3]); p.ell(q.x,q.y,4,4.4); p.F(M.gold[1]); p.ell(q.x,q.y-0.3,3.3,3.7); p.F(M.gold[0]); p.ell(q.x+0.8,q.y-1.4,1.4,1.2); p.F(M.blue[1]); p.ell(q.x,q.y-0.2,1.9,2.2); p.F(M.blue[0]); p.rect(q.x-0.4,q.y-1.4,0.9,0.9); p.F(M.paper[1]); p.rect(q.x-2.8,q.y+1.8,5.6,1.1); }
    fist(p,M,el,wr);
  }
  function drawBoot(p,M,a,ang){
    xfs(p.cx,ang,a.x,a.y,1.3,1.3);
    p.F(M.boot[1]); p.poly([[-5.4,-7],[3,-7],[3.6,-2],[6,-0.6],[11,0.6],[12.8,3],[12.6,4.6],[-6,4.6],[-6.2,-2]]);
    p.F(M.bootX[2]); p.poly([[-6.2,-2],[-5.4,-7],[0,-7],[-0.6,4.6],[-6,4.6]]);
    p.F(M.boot[2]); p.poly([[-6.2,-2],[-5.4,-7],[-3,-7],[-3.6,4.6],[-6,4.6]]); p.F(M.boot[3]); p.rect(-6.2,0,1.4,4.6);
    p.F(M.boot[0]); p.poly([[7.6,0.2],[11,0.6],[12.8,3],[12.4,3.4],[8,2]]); p.rect(-4,-7,6,1); p.F(M.bootX[0]); p.rect(9.6,0.8,1.6,0.8);
    p.F(M.boot[3]); p.rect(-5.4,-4,8.6,0.8);
    p.F(M.sole[0]); [[-1,-5.4],[0.4,-3.4],[2,-1.6]].forEach(([x,y])=>p.rect(x,y,1.8,0.8));
    p.F(M.sole[1]); p.poly([[-6.6,3.6],[13,3.6],[13.4,5.2],[12.4,6.2],[-6.6,6.2]]); p.F(M.sole[2]); p.rect(-6.6,5.3,19,0.9); for(let x=-5;x<12;x+=2.6) p.rect(x,5.2,1.2,1);
    p.id();
  }
  function footAng(sk,front,P){
    const an=front?sk.ankleF:sk.ankleB, gap=GROUND-(an.y+FOOT), k=(front?P.lFk:P.lBk);
    let t=0; if(gap>1.2){ if(k<-12) t=Math.min(38,(-k-12)*0.7); else if(k>50) t=-Math.min(30,(k-50)*0.5); }
    return rad(sk.ro+t);
  }
  function drawLeg(p,M,sk,front,P){
    p.id(); const hip=front?sk.hipF:sk.hipB, knee=front?sk.kneeF:sk.kneeB, ankle=front?sk.ankleF:sk.ankleB, wT=18, wK=13.4, wA=11;
    const q0=lerp(knee,ankle,0.3), o0=sideOff(knee,ankle,wK*0.18,1); p.F(M.pants[1]); p.ell(q0.x+o0.x,q0.y+o0.y,wK*0.5,wK*0.62,Math.atan2(ankle.y-knee.y,ankle.x-knee.x));
    vol(p,knee,ankle,wK,wA,M.pants,M.pantsX,{l0:0.05,l1:0.6,h0:0.1,h1:0.35}); vol(p,hip,knee,wT,wK,M.pants,M.pantsX,{l0:0.05,l1:0.85,h0:0.2,h1:0.6});
    // vinco, dobras grandes, bolso cargo e remendo
    p.F(M.pantsX[0]); p.cap(lerp(hip,knee,0.25),lerp(hip,knee,0.7),0.7,0.7);
    const kk=knee; p.F(M.pants[2]); p.poly([[kk.x-4,kk.y-3],[kk.x+3,kk.y-1.2],[kk.x+3.4,kk.y],[kk.x-3.6,kk.y-1.4]]);
    [0.75,0.85].forEach(t=>{ const q=lerp(knee,ankle,t); p.F(M.pants[2]); p.cap({x:q.x-wA*0.55,y:q.y-0.8},{x:q.x+wA*0.5,y:q.y+0.6},1,1); });
    if(front){ const q=lerp(hip,knee,0.5), ang=Math.atan2(knee.y-hip.y,knee.x-hip.x); p.xf(ang,q.x,q.y);
      p.F(M.pants[3]); p.rect(-5,-0.6,10,7); p.F(M.pants[1]); p.rect(-4.4,0,8.8,5.8); p.F(M.pantsX[1]); p.rect(-4.4,0,8.8,1.6); p.F(M.pants[0]); p.rect(-5,-1.8,10,1.6); p.F(M.silver[2]); p.rect(-0.6,-0.6,1.2,1); p.id();
      p.F(M.patch[1]); p.ell(knee.x+0.8,knee.y,4.4,3.8); p.F(M.patch[0]); p.ell(knee.x+1.8,knee.y-1.2,2,1.4); p.F(M.patch[3]); [[-3,-3],[2.8,-2.6],[3,2.4],[-2.8,2.6]].forEach(([x,y])=>p.rect(knee.x+0.8+x,knee.y+y,0.8,0.8)); }
    drawBoot(p,M,ankle,footAng(sk,front,P));
  }
  function drawTorso(p,M,sk,P){
    xfs(p.cx,sk.a,sk.hip.x,sk.hip.y,1.45*0.8-0.26*Math.max(0,sk.tw),1.1*(1+0.025*(sk.br||0)));
    const R=M.shirt, X=M.shirtX;
    // camisa com barriguinha: massa + sombra roxa grande + luz quente
    p.F(R[1]); p.poly([[-9.6,3],[9.6,3],[10.6,-2],[11.8,-8],[11,-14],[12.2,-20],[12.6,-25.4],[10.4,-29.6],[4.6,-32.6],[-3.6,-32.6],[-10.4,-29.8],[-12.8,-25.6],[-12.4,-20],[-10.2,-14],[-9.6,-8],[-10.2,-2]]);
    p.F(X[2]); p.poly([[-12.8,-25.6],[-2,-27.6],[-1,-17],[-2,-6],[-2,3],[-9.6,3],[-10.2,-2],[-9.6,-8],[-10.2,-14],[-12.4,-20]]);
    p.F(R[2]); p.poly([[-12.8,-25.6],[-6.4,-27.4],[-5.6,-18],[-6,-9],[-5.4,3],[-9.6,3],[-10.2,-2],[-9.6,-8],[-10.2,-14],[-12.4,-20]]);
    p.F(R[3]); p.poly([[-12.8,-25.6],[-10,-26.6],[-9.6,-18],[-10.2,-14],[-12.4,-20]]); p.poly([[-9.6,-4],[-6,-4],[-5.4,3],[-9.6,3]]);
    p.F(R[2]); p.poly([[-6,-17],[2,-15.6],[11,-17.4],[10.6,-13.4],[2,-12],[-6,-13.6]]); p.poly([[2,-6.4],[11.6,-8.4],[10.8,-5.4],[2.4,-4]]);
    p.F(R[3]); p.poly([[-6,-17],[2,-15.6],[11,-17.4],[10.8,-16.4],[2,-14.6],[-6,-16]]);
    p.F(X[1]); p.poly([[0,-29.6],[9.6,-29.4],[12.2,-24],[11.8,-19.6],[2,-18],[-1,-23]]); p.poly([[3,-12],[11,-12.4],[11.6,-8.4],[3.6,-7]]);
    p.F(R[0]); p.poly([[2.6,-29.2],[9.4,-28.8],[11.8,-23.6],[11.2,-20.6],[6,-21.2],[3,-24.6]]); p.poly([[6,-11.6],[11,-11.8],[11.4,-9.4],[6.6,-9]]);
    p.F(X[0]); p.poly([[5,-28.8],[9,-28.6],[10.6,-25.2],[7,-25.8]]);
    // vista com botões
    p.F(R[3]); p.rect(3.6,-28.6,1,27); p.F(X[1]); p.rect(4.6,-28.6,0.6,27); p.F(M.silver[1]); [-24,-18,-12,-6].forEach(y=>p.rect(4.4,y,1.2,1.2));
    // bolsos com lapela
    [[-5.8,-24],[6.2,-24]].forEach(([x,y],k)=>{ p.F(R[3]); p.rect(x,y,5.4,6.4); p.F(k?X[1]:R[2]); p.rect(x+0.5,y+1.6,4.4,4.2); p.F(M.collar[1]); p.rect(x-0.2,y,5.8,1.8); p.F(M.collar[0]); p.rect(x,y,5.4,0.6); p.F(M.silver[2]); p.rect(x+2.2,y+1.2,1,0.8); });
    // distintivo + crachá
    p.F(M.silver[3]); p.poly([[-5,-28],[-0.8,-28],[-0.6,-24.4],[-2.9,-22.6],[-5.2,-24.4]]); p.F(M.silver[1]); p.poly([[-4.4,-27.4],[-1.4,-27.4],[-1.4,-24.8],[-2.9,-23.6],[-4.4,-24.8]]); p.F(M.silver[0]); p.rect(-4,-27,1.4,1); p.F(M.blue[1]); p.rect(-3.4,-26,1,1);
    p.F(M.paper[1]); p.rect(6.6,-21.2,4.4,2.4); p.F(M.blue[1]); p.rect(6.6,-19.4,4.4,0.8);
    // dobras grandes do tecido
    p.F(R[2]); p.poly([[-5,-25],[1,-20],[0.4,-18.8],[-5.6,-23.4]]); p.poly([[-4,-8],[2.6,-6],[2.2,-4.8],[-4.2,-6.8]]);
    p.F(X[1]); p.poly([[-4.4,-24],[0.8,-19.6],[1.4,-20.4],[-3.8,-25]]);
    // gola em V + cordão do apito
    p.F(M.skin[1]); p.poly([[-0.6,-32.8],[5.6,-33],[3,-27.4]]); p.F(M.skin[2]); p.poly([[-0.6,-32.8],[1.6,-32.8],[2.6,-28.4]]);
    p.F(M.collar[1]); p.poly([[-3.4,-33.2],[1.6,-34.6],[2.6,-28.4],[-0.4,-30]]); p.poly([[4,-34.6],[8.4,-33.2],[5.6,-29.6],[3.4,-28.4]]); p.F(M.collar[0]); p.rect(-2.6,-33.4,3,0.8); p.F(M.collar[3]); p.rect(-3.4,-31,2,0.8);
    if(!(P.whistle>=0.5)){ p.F(M.gold[1]); p.poly([[2.4,-29],[3.2,-29],[3.6,-19],[2.8,-19]]); p.F(M.silver[1]); p.ell(4.4,-18.6,2.2,1.4); p.F(M.silver[0]); p.rect(3.4,-19.4,1.4,0.6); }
    // dragona + rádio no ombro de trás
    p.F(M.collar[1]); p.rect(-11,-31.6,8,2); p.F(M.silver[1]); p.rect(-4.4,-31.4,1,1);
    p.F(M.belt[1]); p.rect(-12.2,-30.8,5,8); p.F(M.belt[0]); p.rect(-12.2,-30.8,5,1); p.rect(-10.4,-37.8,1,7); p.F(M.belt[2]); [-28,-26.4,-24.8].forEach(y=>p.rect(-11.4,y,3.4,0.6)); p.F(M.led[1]); p.rect(-8.6,-29.8,1.2,1.2);
    // cinto de serviço
    p.F(M.belt[1]); p.poly([[-11.2,-3.8],[10.8,-3.8],[11,1.2],[-11.4,1.2]]);
    p.F(M.belt[0]); p.rect(-4,-3.6,14,0.8); p.F(M.belt[3]); p.rect(-11.2,0.4,22,0.8); p.F(M.belt[2]); p.rect(-11.2,-3.8,6,4);
    p.F(M.silver[1]); p.rect(5,-3.2,3.6,3.8); p.F(M.belt[2]); p.rect(6,-2.2,1.6,1.8); p.F(M.silver[0]); p.rect(5,-3.2,3.6,0.8);
    p.F(M.belt[1]); p.rect(-12.8,-2.8,4.4,7.4); p.F(M.belt[0]); p.rect(-12.6,-2.6,4,1.2); p.F(M.silver[2]); p.rect(-11.2,-1.2,1.2,1.2);
    p.F(M.silver[1]); p.ell(-4,2.6,1.6,1.6); p.F(M.belt[2]); p.ell(-4,2.6,0.8,0.8); p.F(M.gold[1]); p.rect(-4.6,3.8,1,3); p.F(M.silver[1]); p.rect(-3.4,3.6,1,2.6);
    p.id();
  }
  function drawHead(p,M,sk,P){
    xfs(p.cx,sk.ha,sk.neck.x,sk.neck.y,HS,HS);
    p.F(M.skin[1]); p.cap(P2(0.4,4),P2(1.2,-6),9.4,8.4);
    p.F(M.skin[2]); p.poly([[-4,3],[-3.2,-6],[-0.6,-6],[-1,3]]); p.poly([[0,-4.6],[8.6,-2.4],[7,-0.6],[0.4,-1.8]]);
    p.F(M.skin[1]); p.ell(2.6,-14.6,10.2,10.4);
    p.poly([[-3,-9],[10.8,-10.4],[13,-6],[12,-2],[8.2,1],[1.2,1]]);
    p.F(M.skin[2]); p.poly([[-3.4,-9.4],[1.6,-8.6],[2.8,-3],[1.6,0.6],[-1.8,-2]]);
    p.F(M.skin[0]); p.ell(9.2,-9.4,1.8,1);
    // orelha + cabelo grisalho rente
    p.F(M.skin[1]); p.ell(-3.4,-12.4,2.6,3.6); p.F(M.skin[2]); p.ell(-3.1,-12.2,1.3,2.3); p.F(M.skin[3]); p.rect(-3.4,-12.8,0.8,1.8);
    p.F(M.hair[1]); p.poly([[-8.6,-18],[-1.6,-18],[-0.4,-12],[-1.4,-9],[-6,-7.6],[-8.6,-11]]); p.F(M.hair[0]); [[-6.4,-16],[-4,-14.6],[-6.6,-12]].forEach(([x,y])=>p.rect(x,y,1.2,0.8)); p.F(M.hair[1]); p.rect(-0.6,-17.6,2,6);
    // barba por fazer
    p.F(M.stub[1]); p.poly([[0.4,-8.6],[2,-4],[6,0],[10,0.4],[12.4,-2],[13,-4.4],[11.6,-4],[9,-3.4],[6.8,-4.2],[4,-7],[2.4,-9.4]]); p.F(M.stub[2]); p.poly([[0.4,-8.6],[2,-4],[4.6,-1.4],[3,-5.6]]);
    // olhos
    const sq=P.brow>=1.5&&P.brow<2.5&&P.mouth>=1.5&&P.mouth<2.5;
    if(P.blink>=0.5||sq){ p.F(M.skin[3]); if(sq) p.poly([[4.6,-14.6],[9.4,-13.6],[9.4,-12.6],[4.6,-12.8]]); else p.rect(4.4,-13.4,5,1); p.rect(10.8,-13.6,1.8,0.9); }
    else {
      p.F(M.eye[1]); p.ell(6.9,-13.3,2.7,2.2); p.F(M.eye[2]); p.rect(4.6,-12,4.8,0.9);
      p.F(M.iris[1]); p.rect(7.1,-14.8,2.2,3); p.F(M.iris[3]); p.rect(7.8,-14.2,1.1,1.8); p.F(M.eye[0]); p.rect(7.2,-14.8,0.9,0.9);
      p.F(M.skin[3]); p.poly([[4,-15.4],[9.8,-15.8],[9.8,-14.8],[4.4,-14.6]]); p.F(M.skin[2]); p.rect(4.4,-11,4.6,0.8);
      p.F(M.eye[1]); p.ell(11.7,-13.4,1.1,1.8); p.F(M.iris[1]); p.rect(11.5,-14.6,1.1,2); p.F(M.skin[3]); p.rect(10.7,-15.6,2.4,0.8);
    }
    // sobrancelha grossa grisalha
    const b=Math.round(P.brow||0), yo=b===1?-18.6:b===2?-17.2:b===3?-18.8:-17.8, yi=b===1?-16.2:b===2?-19.2:b===3?-18.2:-17.4;
    p.F(M.hair[1]); p.poly([[3.4,yo],[10.6,yi],[10.6,yi+2.2],[3.4,yo+2]]); p.poly([[11.2,yi],[13.4,yi+(b===1?-0.8:0.4)],[13.4,yi+2],[11.2,yi+2]]); p.F(M.hair[0]); p.rect(4.4,yo+0.2,2.4,0.7);
    // nariz largo
    p.F(M.skin[1]); p.poly([[10.2,-14.8],[14.8,-9.6],[14.2,-8.2],[10.2,-8.4]]);
    p.F(M.skin[2]); p.rect(10.4,-9,4,1); p.F(M.skin[3]); p.rect(11.8,-9,1.2,0.8); p.F(M.skin[0]); p.rect(11.6,-13.2,0.9,2.8);
    // boca
    const m=Math.round(P.mouth||0);
    if(m===2){ p.F(M.mouth[2]); p.poly([[7.2,-7.4],[12.8,-7.6],[12.2,-2],[7.8,-2.2]]); p.F(M.teeth[1]); p.rect(7.6,-7.4,4.8,1.3); p.F(M.mouth[0]); p.ell(10,-3,1.9,0.9); }
    else if(m===1){ p.F(M.mouth[1]); p.rect(7.2,-7.2,5.6,3.4); p.F(M.teeth[1]); p.rect(7.6,-6.8,4.8,2.6); p.F(M.teeth[2]); p.rect(7.6,-5.5,4.8,0.6); }
    else if(m===3){ p.F(M.mouth[2]); p.poly([[7,-6.6],[12.8,-7.4],[11.6,-4],[8.2,-4.2]]); p.F(M.teeth[1]); p.rect(7.6,-6.6,4.8,1.3); }
    else { p.F(M.mouth[2]); p.rect(7.8,-5.8,4.4,1); p.F(M.skin[2]); p.rect(8.4,-4.4,3,0.8); }
    // bigodão
    p.F(M.hair[1]); p.poly([[6.4,-9],[13.6,-9.2],[14.6,-6.4],[13,-5.6],[10.4,-7],[7.6,-6],[6,-6.8]]); p.F(M.hair[0]); p.rect(8.6,-9,3.4,0.8); p.F(M.hair[2]); p.rect(12.6,-6.4,1.6,0.8);
    if(P.whistle>=0.5){ p.F(M.silver[2]); p.poly([[11.4,-6.8],[18,-7],[18.2,-3.6],[11.6,-3.6]]); p.F(M.silver[1]); p.rect(11.6,-6.8,6.2,1.4); p.F(M.silver[3]); p.rect(16.2,-6,1.2,1.4); p.F(M.skin[0]); p.ell(9.2,-5.4,1.8,1.4); }
    // quepe
    p.F(M.cap[1]); p.poly([[-10.4,-19.4],[-9.8,-27],[0,-31],[10.4,-29.4],[13.2,-23.4],[11.4,-19.8]]);
    p.F(M.cap[2]); p.poly([[-10.4,-19.4],[-9.8,-27],[-6,-28.6],[-6.6,-19.6]]);
    p.F(M.cap[0]); p.poly([[-4,-28.6],[2,-30.4],[8.4,-29.2],[2,-28]]);
    p.F(M.band[1]); p.poly([[-10.6,-21.8],[11.8,-22.2],[12.2,-18.4],[-10.4,-18]]);
    p.F(M.band[0]); p.rect(-10,-20.6,21.6,0.8); p.F(M.gold[1]); p.rect(-9.6,-22.6,21,0.8);
    p.F(M.visor[1]); p.poly([[8,-19.8],[21,-18.2],[19.6,-15.8],[8.4,-17]]); p.F(M.visor[0]); p.rect(11,-19,7,0.9); p.F(M.visor[3]); p.rect(9,-17.2,10,0.8);
    p.F(M.gold[2]); p.poly([[2.8,-25.6],[7.6,-25.6],[7.4,-21.8],[5.2,-20.2],[3,-21.8]]); p.F(M.gold[0]); p.poly([[3.4,-25],[7,-25],[6.8,-22.4],[5.2,-21.2],[3.6,-22.4]]); p.F(M.blue[1]); p.rect(4.6,-24,1.4,1.4);
    p.id();
  }
  function drawSmear(p,M,sk,P,len){
    p.id(); const tip=lp(sk.wrF,P.aFe+P.bat-sk.ro,len+2), sh=sk.shF;
    const cur=Math.atan2(tip.x-sh.x,tip.y-sh.y)*180/Math.PI, r1=Math.hypot(tip.x-sh.x,tip.y-sh.y)+3, sa=P.sa;
    const wide=P.smear>=2.5?20:14, n=14;
    const bd=(rr0,rr1,col)=>{ const pts=[]; for(let k=0;k<=n;k++){ const a=sa+(cur-sa)*k/n; pts.push([sh.x+Math.sin(rad(a))*rr1, sh.y+Math.cos(rad(a))*rr1]); }
      for(let k=n;k>=0;k--){ const a=sa+(cur-sa)*k/n, t=k/n, rr=rr1-(rr1-rr0)*t*t; pts.push([sh.x+Math.sin(rad(a))*rr, sh.y+Math.cos(rad(a))*rr]); } p.F(col); p.poly(pts); };
    bd(r1-wide,r1+1.6,M.trail[1]); bd(r1-wide+3,r1,M.smear[1]); bd(r1-5,r1-0.6,M.smear[0]);
  }
  function star(p,c,r,col,col2){ const pts=[]; for(let k=0;k<16;k++){ const a=k/16*Math.PI*2, rr=k%2?r*0.28:(k%4?r*0.62:r); pts.push([c.x+Math.cos(a)*rr,c.y+Math.sin(a)*rr]); } p.F(col); p.poly(pts); if(col2){ p.F(col2); p.circle(c,r*0.22); } }
  // contorno de baixo com 2 px (peso na base das formas)
  function thick(cv){ const g=cv.getContext('2d'), W=cv.width, H=cv.height, im=PIX.pix(cv), d=im.data, src=new Uint8ClampedArray(d);
    const isO=i=>src[i+3]>0&&src[i]===23&&src[i+1]===11&&src[i+2]===28;
    for(let y=2;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(src[i+3]) continue; const u=i-W*4, u2=u-W*4; if(isO(u)&&src[u2+3]&&!isO(u2)){ d[i]=23; d[i+1]=11; d[i+2]=28; d[i+3]=255; } }
    g.putImageData(im,0,0); }
  const cache=PIX.cache();
  function frame(skin,tier,anim,fi,step=5){
    const K=PIX.getK(), key=skin+tier+anim+fi+step+'@'+K; if(cache.has(key)) return cache.get(key);
    if(cache.size>700) cache.delete(cache.keys().next().value);
    const cv=renderPose(skin,tier,poseOf(anim,fi),step,K); cache.set(key,cv); return cv;
  }
  // pose arbitrária (interpolada) com cache LRU por chave quantizada
  const pcache=(function(){ const m=PIX.cache(); return {get(k){ const v=m.get(k); if(v){ m.delete(k); m.set(k,v); } return v; }, set(k,v){ m.set(k,v); if(m.size>900) m.delete(m.keys().next().value); }}; })();
  function framePose(skin,tier,P,step=5,key){
    const K=PIX.getK(), k=key!=null?skin+tier+key+step+'@'+K:null; if(k){ const c=pcache.get(k); if(c) return c; }
    const cv=renderPose(skin,tier,Object.assign({},REST,P),step,K); if(k) pcache.set(k,cv); return cv;
  }
  function renderPose(skin,tier,P,step,K){
    const T=BATON.TIERS[tier]||BATON.TIERS.comum;
    const M=Object.assign(mats(skin),T.M,{trail:ramp(T.cor)}), sk=skeleton(P), inh=P.inhand>=0.5;
    const pen=(c,u)=>{ const p=mkPen(c,u); p.cx=c; return p; };
    const parts=[
      {back:true, draw:(c,u)=>drawArm(pen(c,u),M,sk.shB,sk.elB,sk.wrB,false)},
      {back:true, draw:(c,u)=>drawLeg(pen(c,u),M,sk,false,P)},
      {draw:(c,u)=>drawTorso(pen(c,u),M,sk,P)},
      {draw:(c,u)=>drawLeg(pen(c,u),M,sk,true,P)},
      {draw:(c,u)=>drawHead(pen(c,u),M,sk,P)},
      {draw:(c,u)=>{ const p=pen(c,u); if(inh) BATON.draw(p,tier,sk.wrF,sk.bDir); else BATON.draw(p,tier,sk.T(9,-1),Math.PI/2+sk.a-0.14,{noCord:true}); }},
    ];
    if(P.smear>=0.5) parts.push({noShade:true,smear:true,draw:(c,u)=>P.kick?MOVESET.kickSmear(pen(c,u),M,sk,P):drawSmear(pen(c,u),M,sk,P,T.len)});
    parts.push({draw:(c,u)=>drawArm(pen(c,u),M,sk.shF,sk.elF,sk.wrF,true)});
    if(inh) parts.push({draw:(c,u)=>{ const p=pen(c,u); fist(p,M,sk.elF,sk.wrF); }});
    if(P.impact>=0.5) parts.push({noShade:true,smear:true,draw:(c,u)=>{ const p=pen(c,u); p.id(); star(p,P.kick?MOVESET.kickTip(sk,P):lp(sk.wrF,P.aFe+P.bat-sk.ro,T.len),P.impact>=2?14:10,M.smear[1],M.smear[0]); }});
    if(P.whistle>=1.5) parts.push({noShade:true,smear:true,draw:(c,u)=>{ const p=pen(c,u); p.id(); const m=sk.H(21,-5.6); p.F(M.smear[0]); [[3,-4,3,1],[4,0,4,1],[3,4,3,1]].forEach(([dx,dy,w,h])=>{ p.cap({x:m.x+dx,y:m.y+dy},{x:m.x+dx+w,y:m.y+dy*1.5},1.2,1.2); }); }});
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash>=0.5,rim:RIM}); if(step>=4) thick(cv);
    const tip=lp(sk.wrF,P.aFe+P.bat-sk.ro,T.len);
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._tip=sc(tip); cv._hand=sc(sk.wrF); cv._mouth=sc(sk.H(18,-5.6)); cv._head=sc(sk.H(4.5,-33.6)); cv._hip=sc(sk.hip);
    return cv;
  }
  return {FW,FH,GROUND,AX,SKINS,ANIMS,poseOf,frame,framePose,mats};
})();
