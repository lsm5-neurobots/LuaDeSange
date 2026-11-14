/* HEROI — fonte de arte (editável). Build: npm run art */
/* Sobrevivente customizável em hi-bit: esqueleto 2D com proporção heroica (cabeça/mãos/pés grandes,
   ombros largos), roupa com dobras/costuras, rosto expressivo, arma escolhida em cfg.arma/cfg.tier. */
const HEROI=(function(){
  const {rad,ramp,mix,lp,lerp,P2,ik,mkPen,compose}=PIX;
  const FW=184, FH=150, GROUND=144, AX=92, RIM='#a9c8f0';
  const CAT={
    pele:['#f6d7c0','#eec4a2','#e0ac84','#c8925e','#b07a4a','#96603a','#7e4f32','#643c26','#4e2e1e','#3a2216'],
    cabeloCor:['#14100c','#2a1c14','#4a3020','#7a4a28','#a8743a','#d8b060','#e8dcc0','#8a8a8a','#c83a4a','#3a6ad8','#7a3ab0','#3ab07a'],
    olhos:['#4a2a18','#24160e','#3a6a3a','#3a5a9a','#8a6a2a','#5a5a6a'],
    roupa:['#e8e4d8','#2a2a32','#c83a3a','#3a6ad0','#2f8a4a','#e8b830','#e87a30','#7a3ab0','#6a4a32','#8a8a96','#3ac0c0','#e86aa0'],
    calcaCor:['#2e3a5e','#1e1e26','#5a5a62','#6a5a3a','#3a4a2e','#8a6a4a','#c8c0b0','#7a2a2a'],
    tenis:['#e8e4d8','#1e1e26','#c83a3a','#3a6ad0','#e8b830','#2f8a4a'],
    accCor:['#c83a3a','#1e1e26','#3a6ad0','#e8b830','#2f8a4a','#e8e4d8'],
  };
  const OPT={
    corpo:{m:'Masculino',f:'Feminino'},
    cabelo:{careca:'Careca',raspado:'Raspado',curto:'Curto',black:'Black power',moicano:'Moicano',tranca:'Trança',coque:'Coque',longo:'Longo'},
    barba:{nenhuma:'Nenhuma',porfazer:'Por fazer',bigode:'Bigode',cavanhaque:'Cavanhaque',cheia:'Cheia'},
    sobr:{reta:'Reta',grossa:'Grossa',fina:'Fina',arqueada:'Arqueada'},
    top:{camiseta:'Camiseta',regata:'Regata',moletom:'Moletom'},
    calca:{calca:'Calça',bermuda:'Bermuda'},
    acc:{nenhum:'Nenhum',bone:'Boné',oculos:'Óculos',bandana:'Bandana',fone:'Fone'},
  };
  const DEFAULT={nome:'Sobrevivente',corpo:'m',pele:'#b07a4a',cabelo:'curto',cabeloCor:'#2a1c14',barba:'porfazer',sobr:'reta',olhos:'#4a2a18',top:'camiseta',topCor:'#c83a3a',calca:'calca',calcaCor:'#2e3a5e',tenis:'#e8e4d8',acc:'nenhum',accCor:'#1e1e26'};
  function random(){ const pk=a=>a[Math.floor(Math.random()*a.length)], pko=o=>pk(Object.keys(o));
    const corpo=pko(OPT.corpo); return {nome:pk(['Dona Lia','Zé Biu','Kel','Tonho','Neide','Bia','Juca','Rai']),corpo,pele:pk(CAT.pele),cabelo:pko(OPT.cabelo),cabeloCor:pk(CAT.cabeloCor),barba:corpo==='f'?'nenhuma':pko(OPT.barba),sobr:pko(OPT.sobr),olhos:pk(CAT.olhos),top:pko(OPT.top),topCor:pk(CAT.roupa),calca:pko(OPT.calca),calcaCor:pk(CAT.calcaCor),tenis:pk(CAT.tenis),acc:pko(OPT.acc),accCor:pk(CAT.accCor)}; }
  // saturação +18% mantendo o hue shift (luz → amarelo quente, sombra → roxo)
  function satb(h,k){ let [r,g,b]=PIX.hexRgb(h).map(v=>v/255); const mx=Math.max(r,g,b), mn=Math.min(r,g,b), l=(mx+mn)/2; let s=0,hh=0;
    if(mx!==mn){ const d=mx-mn; s=l>0.5?d/(2-mx-mn):d/(mx+mn); hh=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4; hh/=6; }
    s=Math.min(1,s*k); if(!s) return h; const q=l<0.5?l*(1+s):l+s-l*s, pp=2*l-q, fn=t=>{ t=(t+1)%1; return t<1/6?pp+(q-pp)*6*t:t<1/2?q:t<2/3?pp+(q-pp)*(2/3-t)*6:pp; };
    return PIX.toHex(fn(hh+1/3)*255,fn(hh)*255,fn(hh-1/3)*255); }
  const R4=(h,k=1.18)=>{ const b=satb(h,k); return [mix(b,'#fff2cc',.36),b,mix(b,'#3b2c63',.48),mix(b,'#1c1233',.74)]; };
  const RX=(h,k=1.18)=>{ const b=satb(h,k); return [mix(b,'#fff2cc',.64),mix(b,'#ffe0a8',.17),mix(b,'#4a3470',.26),mix(b,'#100a20',.86)]; };
  function mats(c){
    return {
      skin:R4(c.pele,1.15), skinX:RX(c.pele,1.15), hair:R4(c.cabeloCor), hairX:RX(c.cabeloCor), top:R4(c.topCor), topX:RX(c.topCor), pants:R4(c.calcaCor), pantsX:RX(c.calcaCor), shoe:R4(c.tenis,1.1), shoeX:RX(c.tenis,1.1),
      stub:ramp(mix(c.pele,c.cabeloCor==='#e8dcc0'?'#6a5a4a':c.cabeloCor,0.42)),
      sole:['#ffffff','#e8e4dc','#b0aaa0','#6e6a64'], iris:ramp(c.olhos), acc:ramp(c.accCor),
      belt:['#8a6440','#5a3c22','#3a2414','#1e120a'], buckle:['#fff4c0','#d8b860','#8a7030','#4a3a14'],
      eye:['#ffffff','#f4efe6','#b8b4a8','#6e6a60'], mouth:['#b04a5a','#5a1c2c','#2a0c18','#1a0610'], teeth:['#fffbe8','#e8e0c0','#b0a680','#6a6040'],
      lens:['#bfe8ff','#2a3a5a','#1a2440','#0c1222'], metal:['#ffffff','#c8ccd4','#8a8ea0','#4a4e60'],
      smear:['#ffffff','#fff6d0','#e8d8a0','#b8a870'],
    };
  }
  /* ---------------- poses ---------------- */
  const REST={hx:0,lean:-2,head:0,aFs:4,aFe:14,aBs:-8,aBe:6,lFh:4,lFk:-2,lBh:-6,lBk:-8,bat:-10,inhand:1,mouth:0,smear:0,sa:0,flash:0,impact:0,brow:0,rot:0,lift:0,blink:0,gun:0,gy:0,rk:0,mf:0,chg:0,plant:1,tw:0,br:0};
  // bA = ângulo absoluto do bastão (vira bat relativo ao antebraço)
  const K_=o=>{ const r=Object.assign({},o); if(r.bA!==undefined){ r.bat=r.bA-(r.aFe!==undefined?r.aFe:REST.aFe); delete r.bA; } return r; };
  const ST={lFh:52,lFk:8,lBh:-42,lBk:-46};                 // base de luta (larga e baixa)
  const LUNGE={lFh:62,lFk:12,lBh:-46,lBk:-48};
  const GUARD=Object.assign({},ST,K_({aFs:70,aFe:86,bA:128,aBs:46,aBe:112,lean:12,brow:1}));
  const G=o=>{ const r=K_(o); if(!r.nowide){ if(r.lFh!==undefined){ r.lFh+=14; r.lFk=(r.lFk||0)+3; } if(r.lBh!==undefined){ r.lBh-=12; r.lBk=(r.lBk!==undefined?r.lBk:-30)-10; } } return Object.assign({},GUARD,r); };
  const th=(p,o)=>6+24*Math.sin(p+o), sh=(p,o)=>th(p,o)-34*Math.max(0,Math.cos(p+o));
  const S=Math.sin;
  const ANIMS={
    idle:{nome:'Parado',n:8,dur:()=>140,pose:(i,w)=>{ const p=i/8*Math.PI*2, s=S(p);
      if(w) return {gun:1,gy:52+2*s,lean:4+1.2*s,br:s,hx:1.2*S(p/2),head:6+0.6*S(p-0.6),lFh:26,lFk:4+2*s,lBh:-22,lBk:-24+2*s,blink:i===5?1:0};
      return K_({lean:4+1.4*s,br:s,hx:1.2*S(p/2),head:1.2*S(p-0.7),lFh:26,lFk:4+2.2*s,lBh:-22,lBk:-24+2.2*s,aFs:10+2*s,aFe:36+3*s,bA:-34+3*s,aBs:-14+2*s,aBe:18+3*s,blink:i===5?1:0}); }},
    walk:{nome:'Andar',n:8,dur:()=>110,pose:(i,w)=>{ const p=i/8*Math.PI*2;
      const o={plant:0,lFh:th(p,0),lFk:sh(p,0),lBh:th(p,Math.PI),lBk:sh(p,Math.PI),lean:2+1.4*S(2*p),head:S(2*p-0.6)};
      if(w) return Object.assign(o,{gun:1,gy:48+3*S(2*p)});
      return Object.assign(o,K_({aFs:10-18*S(p),aFe:34-14*S(p),bA:-40-10*S(p),aBs:-6+20*S(p),aBe:10+22*S(p)})); }},
    run:{nome:'Correr',n:8,dur:()=>72,pose:(i,w)=>{ const p=i/8*Math.PI*2, t=o=>12+46*S(p+o), k=o=>t(o)-18-76*Math.max(0,Math.cos(p+o));
      return K_({plant:0,lFh:t(0),lFk:k(0),lBh:t(Math.PI),lBk:k(Math.PI),lean:22+3*S(2*p),head:-14,lift:2+3*Math.abs(S(p)),aFs:30-48*S(p),aFe:96-36*S(p),bA:w?110-20*S(p):60-14*S(p),aBs:10+50*S(p),aBe:90+30*S(p),brow:1,mouth:1}); }},
    guard:{nome:'Guarda',n:8,dur:()=>120,pose:(i,w)=>{ const p=i/8*Math.PI*2, s=S(p);
      if(w) return Object.assign({},ST,{gun:1,gy:2*s,lean:3+0.8*s,head:-2,lFk:5+1.5*s,lBk:-38+1.5*s,brow:1,blink:i===6?1:0});
      return Object.assign({},GUARD,K_({lean:8+1.2*s,aFs:70+3*s,aFe:86+4*s,bA:128+3*s,aBs:46+2*s,aBe:112+3*s,lFk:5+1.6*s,lBk:-38+1.6*s,head:-2+s,blink:i===6?1:0})); }},
    advance:{nome:'Avançar',n:8,dur:()=>95,pose:(i,w)=>{ const p=i/8*Math.PI*2;
      const o={plant:0,lFh:10+22*S(p),lFk:10+22*S(p)-30*Math.max(0,Math.cos(p)),lBh:10+22*S(p+Math.PI),lBk:10+22*S(p+Math.PI)-30*Math.max(0,Math.cos(p+Math.PI)),lean:7+1.5*S(2*p),head:-3};
      if(w) return Object.assign(o,{gun:1,gy:3*S(2*p),brow:1});
      return Object.assign({},GUARD,K_(Object.assign(o,{aFs:70+5*S(p),aFe:86,bA:128,aBs:46-6*S(p),aBe:112}))); }},
    combo:{nome:'Combo com bastão',n:12,hits:{2:1,6:2,10:3},dur:i=>[110,50,60,90,80,40,60,90,110,60,70,170][i],pose:i=>G([
      {tw:-0.3,aFs:-40,aFe:-130,bA:200,lean:-12,head:-4,hx:-4,lFh:22,lFk:0,lBh:-18,lBk:-28,aBs:40,aBe:100,mouth:1},
      {aFs:40,aFe:120,bA:168,lean:2,hx:1,lFh:30,lBh:-24,lBk:-34,aBs:20,aBe:60},
      {tw:0.85,aFs:84,aFe:94,bA:100,lean:30,hx:13,head:-12,mouth:2,smear:1,sa:205,aBs:-50,aBe:-20,lFh:50,lFk:10,lBh:-32,lBk:-36},
      {tw:0.7,aFs:62,aFe:46,bA:22,lean:30,hx:13,head:-10,mouth:1,aBs:-50,aBe:-10,lFh:50,lFk:10,lBh:-32,lBk:-36},
      {tw:-0.2,aFs:12,aFe:64,bA:-40,lean:4,hx:6,aBs:10,aBe:60,lFh:34,lFk:4,lBh:-26,lBk:-36},
      {aFs:44,aFe:84,bA:24,lean:2,hx:5,aBs:-10,aBe:30,lFh:36,lFk:6,lBh:-28,lBk:-38},
      {tw:0.8,aFs:128,aFe:150,bA:140,lean:-2,hx:12,head:-10,mouth:2,smear:2,sa:12,aBs:-60,aBe:-30,lFh:50,lFk:10,lBh:-32,lBk:-36},
      {tw:0.6,aFs:152,aFe:176,bA:180,lean:-6,hx:12,head:-12,mouth:1,aBs:-60,aBe:-40,lFh:50,lFk:10,lBh:-32,lBk:-36},
      {aFs:168,aFe:204,bA:232,lean:-14,hx:4,head:-8,brow:1,mouth:1,lift:2,plant:0,lFh:46,lFk:-14,lBh:-8,lBk:-56,aBs:150,aBe:170},
      {aFs:176,aFe:210,bA:244,lean:-16,hx:6,mouth:1,lift:9,plant:0,lFh:62,lFk:-8,lBh:14,lBk:-56,aBs:160,aBe:180},
      {tw:0.9,aFs:70,aFe:56,bA:18,lean:38,hx:15,head:-14,mouth:2,brow:1,smear:3,sa:232,impact:1,aBs:-60,aBe:-30,lFh:54,lFk:12,lBh:-32,lBk:-36},
      {tw:0.7,aFs:64,aFe:50,bA:22,lean:34,hx:14,head:-12,mouth:1,aBs:-50,aBe:-20,lFh:54,lFk:12,lBh:-32,lBk:-36}][i])},
    comboB:{nome:'Combo B: giro, estocada, chute',n:11,dur:i=>[100,50,60,80,90,55,80,90,60,90,140][i],
      hits:{2:1,5:2,8:3}, hitsx:{2:{m:1},5:{m:1.2,reach:52},8:{m:1.8,heavy:1}},
      pose:i=>G([
        {aFs:-60,aFe:-30,bA:140,lean:-6,head:-6,hx:-2,lFh:22,lBh:-20,lBk:-30,aBs:30,aBe:80},
        {aFs:20,aFe:40,bA:100,lean:6,hx:2,smear:1,sa:250,lFh:30,lBh:-24,lBk:-32,aBs:-10,aBe:20},
        {tw:0.8,aFs:94,aFe:98,bA:92,lean:26,hx:12,head:-10,smear:1,sa:205,mouth:2,lFh:48,lFk:10,lBh:-32,lBk:-36,aBs:-50,aBe:-20},
        {aFs:112,aFe:130,bA:110,lean:10,hx:7,lFh:40,lFk:6,lBh:-30,lBk:-44,aBs:-40,aBe:-10},
        {aFs:-24,aFe:60,bA:90,lean:-2,hx:2,lFh:26,lBh:-20,lBk:-30,aBs:40,aBe:100,brow:1},
        {tw:1,aFs:88,aFe:90,bA:92,lean:32,hx:16,head:-14,mouth:2,smear:1,sa:120,lFh:52,lFk:12,lBh:-32,lBk:-36,aBs:-60,aBe:-40},
        {tw:0.9,aFs:88,aFe:90,bA:92,lean:30,hx:16,head:-12,lFh:52,lFk:12,lBh:-32,lBk:-36,aBs:-60,aBe:-40},
        {aFs:30,aFe:72,bA:130,lean:-8,hx:5,plant:0,lFh:70,lFk:-10,lBh:-6,lBk:-10,aBs:40,aBe:90},
        {aFs:10,aFe:62,bA:130,lean:-18,hx:9,plant:0,lFh:92,lFk:96,lBh:-4,lBk:-6,mouth:2,brow:1,impact:1,aBs:50,aBe:110},
        {aFs:12,aFe:64,bA:132,lean:-14,hx:9,plant:0,lFh:84,lFk:86,lBh:-4,lBk:-6,aBs:50,aBe:110},
        {lean:2,hx:5,lFh:30,lFk:4,lBh:-22,lBk:-30}][i])},
    special:{nome:'Especial',n:8,dur:i=>[140,110,90,170,150,120,120,140][i],pose:(i,w)=>{
      if(w==='pistola') return Object.assign({},ST,[
        {gun:1,gy:8,brow:1,mouth:1,lean:2},{gun:1,gy:0,brow:1,mouth:1,lean:4},
        {gun:1,gy:-2,rk:1,mf:1,mouth:2,brow:1,lean:-2,hx:-1},{gun:1,gy:-6,rk:0.6,mf:0,mouth:2,brow:1},
        {gun:1,gy:-2,rk:1,mf:1,mouth:2,brow:1,lean:-2,hx:-1},{gun:1,gy:2,rk:1,mf:1,mouth:2,brow:1,hx:-1},
        {gun:1,gy:0,rk:0.3,mouth:1,brow:1},{gun:1,gy:6,mouth:3}][i]);
      if(w==='laser') return Object.assign({},LUNGE,[
        {gun:1,gy:4,chg:0.5,brow:1,mouth:1,lean:4},{gun:1,gy:0,chg:1,brow:1,mouth:1,lean:6},
        {gun:1,gy:0,rk:1.4,mf:2,mouth:2,brow:1,lean:-6,hx:-3},{gun:1,gy:-2,rk:1.2,mf:2,mouth:2,brow:1,lean:-6,hx:-3},
        {gun:1,gy:-2,rk:1,mf:2,mouth:2,brow:1,lean:-4,hx:-2},{gun:1,gy:-4,rk:0.6,mouth:1,lean:0},
        {gun:1,gy:0,rk:0.2,lean:2},{gun:1,gy:4,mouth:3,lean:2}][i]);
      return G([
        {aFs:150,aFe:186,bA:226,lean:-10,brow:1,mouth:1,lFh:40,lFk:-14,lBh:-14,lBk:-50,aBs:150,aBe:180},
        {aFs:176,aFe:204,bA:240,lean:-16,brow:1,mouth:2,lift:14,plant:0,lFh:64,lFk:0,lBh:18,lBk:-40,aBs:170,aBe:190},
        {aFs:66,aFe:44,bA:26,lean:34,hx:10,mouth:2,brow:1,smear:3,sa:236,impact:2,lFh:90,lFk:-14,lBh:6,lBk:-96,aBs:-30,aBe:10},
        {aFs:64,aFe:42,bA:24,lean:32,hx:10,mouth:2,brow:1,impact:1,lFh:90,lFk:-14,lBh:6,lBk:-96,aBs:-30,aBe:10},
        {aFs:62,aFe:42,bA:24,lean:30,hx:9,mouth:1,brow:1,lFh:90,lFk:-14,lBh:6,lBk:-96,aBs:-20,aBe:20},
        {aFs:50,aFe:60,bA:60,lean:20,hx:6,lFh:54,lFk:-8,lBh:-28,lBk:-62,aBs:0,aBe:40},
        {aFs:34,aFe:76,bA:110,lean:8,hx:3,lFh:34,lFk:2,lBh:-24,lBk:-34},
        {lean:5,mouth:3}][i]); }},
    roll:{nome:'Esquiva (rolamento)',n:6,dur:i=>[70,60,60,60,70,110][i],pose:i=>{
      const curl={lean:64,head:24,lFh:124,lFk:20,lBh:112,lBk:6,aFs:96,aFe:150,bA:96,aBs:80,aBe:140,plant:0,brow:1};
      return K_([
        Object.assign({},{lean:34,head:8,hx:-4,lFh:50,lFk:-20,lBh:-10,lBk:-60,aFs:40,aFe:96,bA:110,aBs:40,aBe:100,brow:1}),
        Object.assign({},curl,{rot:80,hx:0}), Object.assign({},curl,{rot:170,hx:4}),
        Object.assign({},curl,{rot:260,hx:8}), Object.assign({},curl,{rot:330,hx:11,lean:50}),
        {lean:22,hx:12,head:-2,lFh:70,lFk:-12,lBh:2,lBk:-90,aFs:30,aFe:80,bA:120,aBs:30,aBe:80,brow:1}][i]); }},
    hurt:{nome:'Dano',n:4,dur:i=>[80,110,130,160][i],pose:i=>G([
      {lean:-16,head:-16,hx:-6,flash:1,aFs:-14,aFe:24,bA:110,aBs:-36,aBe:-14,mouth:2,brow:2,lFh:18,lBh:-6,lBk:-12},
      {lean:-12,head:-12,hx:-5,aFs:-2,aFe:34,bA:110,aBs:-26,aBe:-4,mouth:2,brow:2,blink:1,lFh:18,lBh:-8,lBk:-16},
      {lean:-4,head:-4,hx:-2,aFs:16,aFe:56,bA:120,mouth:1,brow:2},
      {}][i])},
    hurtB:{nome:'Dano: cabeça pra trás',n:4,dur:i=>[80,110,130,150][i],pose:i=>G([
      {lean:-20,head:-30,hx:-7,flash:1,aFs:-34,aFe:-12,bA:100,aBs:-44,aBe:-24,mouth:2,brow:2,blink:1,lFh:22,lBh:-4,lBk:-10},
      {lean:-16,head:-24,hx:-6,aFs:-24,aFe:8,bA:110,aBs:-34,aBe:-14,mouth:2,brow:2,lFh:20,lBh:-6,lBk:-12},
      {lean:-6,head:-8,hx:-3,aFs:10,aFe:46,mouth:1,brow:2},{}][i])},
    hurtC:{nome:'Dano: dobra no estômago',n:4,dur:i=>[80,120,130,150][i],pose:i=>G([
      {lean:36,head:16,hx:-4,flash:1,aFs:54,aFe:20,bA:80,aBs:44,aBe:10,mouth:2,brow:2,blink:1,lFh:22,lFk:-10,lBh:-8,lBk:-22},
      {lean:30,head:14,hx:-3,aFs:46,aFe:24,bA:80,aBs:38,aBe:14,mouth:2,brow:2,lFh:20,lFk:-8,lBh:-8,lBk:-20},
      {lean:12,head:4,hx:-1,mouth:1,brow:2},{}][i])},
    fall:{nome:'Derrubado',n:7,dur:i=>[90,110,110,90,110,160,400][i],pose:i=>K_([
      {lean:-26,head:-20,hx:-4,flash:1,lift:4,plant:0,mouth:2,brow:2,aFs:-40,aFe:-90,bA:160,aBs:-60,aBe:-120,lFh:30,lFk:10,lBh:-4,lBk:-20},
      {rot:-38,lean:-10,head:-14,hx:2,lift:20,plant:0,mouth:2,brow:2,blink:1,aFs:150,aFe:170,bA:200,aBs:170,aBe:200,lFh:50,lFk:30,lBh:30,lBk:10},
      {rot:-72,lean:-4,head:-10,hx:12,lift:12,plant:0,mouth:2,brow:2,blink:1,aFs:160,aFe:190,bA:220,aBs:180,aBe:210,lFh:40,lFk:40,lBh:20,lBk:20},
      {rot:-90,lean:0,head:-14,hx:22,flash:0,plant:0,mouth:2,brow:2,blink:1,aFs:140,aFe:160,bA:190,aBs:170,aBe:200,lFh:30,lFk:40,lBh:14,lBk:24},
      {rot:-86,lean:-2,head:-6,hx:23,lift:4,plant:0,mouth:1,brow:2,blink:1,aFs:150,aFe:180,bA:200,aBs:176,aBe:210,lFh:24,lFk:30,lBh:10,lBk:16},
      {rot:-90,lean:0,head:-2,hx:24,plant:0,mouth:1,brow:2,blink:1,aFs:150,aFe:170,bA:150,aBs:180,aBe:200,lFh:16,lFk:16,lBh:8,lBk:6},
      {rot:-90,lean:0,head:0,hx:24,plant:0,mouth:0,brow:2,blink:1,aFs:146,aFe:166,bA:140,aBs:176,aBe:196,lFh:14,lFk:12,lBh:6,lBk:4}][i])},
    getup:{nome:'Levantar',n:6,dur:i=>[140,130,130,120,110,120][i],pose:i=>K_([
      {rot:-90,hx:24,head:4,plant:0,brow:2,aFs:146,aFe:166,bA:140,aBs:176,aBe:196,lFh:14,lFk:12,lBh:6,lBk:4},
      {lean:32,head:-6,hx:16,plant:0,brow:2,mouth:1,lFh:84,lFk:92,lBh:70,lBk:110,aFs:30,aFe:70,bA:100,aBs:-50,aBe:-30},
      {lean:24,head:-4,hx:10,brow:1,mouth:1,lFh:90,lFk:-14,lBh:6,lBk:-96,aFs:40,aFe:80,bA:110,aBs:20,aBe:50},
      {lean:20,head:-4,hx:6,brow:1,lFh:54,lFk:-8,lBh:-28,lBk:-62,aFs:30,aFe:80,bA:120,aBs:30,aBe:80},
      Object.assign({},GUARD,{lean:10,hx:2,aFs:30,aFe:80,bat:46}),
      Object.assign({},GUARD)][i])},
    victory:{nome:'Vitória',n:8,dur:i=>[140,90,90,90,120,160,200,400][i],pose:(i,w)=>{
      const top=w?{gun:0,aFs:166,aFe:176,bA:176}:{aFs:166,aFe:176,bA:178};
      return K_([
        Object.assign({},GUARD,{lean:2,mouth:3,brow:3}),
        {lFh:18,lFk:2,lBh:-16,lBk:-18,lean:-2,aFs:60,aFe:120,bA:200,aBs:-20,aBe:20,mouth:3,brow:3},
        {lFh:18,lFk:2,lBh:-16,lBk:-18,lean:-4,aFs:100,aFe:150,bA:300,aBs:-20,aBe:20,mouth:3,brow:3,smear:1,sa:40},
        {lFh:18,lFk:2,lBh:-16,lBk:-18,lean:-6,aFs:130,aFe:170,bA:400,aBs:-20,aBe:20,mouth:3,brow:3},
        Object.assign({lFh:22,lFk:4,lBh:-20,lBk:-22,lean:-8,head:-10,aBs:-30,aBe:40,mouth:2,brow:3,lift:3,plant:0},top),
        Object.assign({lFh:22,lFk:4,lBh:-20,lBk:-22,lean:-8,head:-12,aBs:-30,aBe:40,mouth:2,brow:3},top),
        Object.assign({lFh:22,lFk:4,lBh:-20,lBk:-22,lean:-6,head:-8,aBs:-34,aBe:44,mouth:3,brow:3},top),
        Object.assign({lFh:22,lFk:4,lBh:-20,lBk:-22,lean:-6,head:-6,aBs:-34,aBe:44,mouth:3,brow:3,blink:0},top)][i]); }},
    shoot:{nome:'Tiro rápido (pistola)',n:6,fireAt:[1],dur:i=>[90,60,70,80,110,120][i],gunKind:'pistola',pose:i=>Object.assign({},ST,[
      {gun:1,gy:24,lean:2,brow:1},{gun:1,gy:0,rk:1.2,mf:1,mouth:1,brow:1,lean:-2,hx:-1},
      {gun:1,gy:-4,rk:0.7,brow:1,lean:-1,hx:-1},{gun:1,gy:-1,rk:0.2,brow:1},
      {gun:1,gy:0,brow:1,lean:3},{gun:1,gy:1,brow:1,lean:3,blink:1}][i])},
    charge:{nome:'Carregar laser',n:6,dur:()=>90,gunKind:'laser',pose:i=>Object.assign({},LUNGE,
      {gun:1,gy:0,chg:0.25+0.75*(i/5),lean:5+0.6*S(i*2.1),hx:(i%2?0.6:-0.6),brow:1,mouth:i>2?1:0})},
    fire:{nome:'Disparo laser',n:5,dur:i=>[70,110,110,120,140][i],gunKind:'laser',pose:i=>Object.assign({},LUNGE,[
      {gun:1,gy:0,chg:1,rk:0.4,mf:2,mouth:2,brow:1,lean:2},{gun:1,gy:-3,rk:1.5,mf:2,mouth:2,brow:1,lean:-6,hx:-3},
      {gun:1,gy:-4,rk:1.1,mf:1,mouth:2,brow:1,lean:-5,hx:-3},{gun:1,gy:-2,rk:0.5,mouth:1,brow:1,lean:-1,hx:-1},{gun:1,gy:0,brow:1,lean:3}][i])},
    // tiro duplo: dois disparos seguidos, o segundo com o coice maior (mão sobe e o corpo recua)
    shoot2:{nome:'Tiro duplo (pistola)',n:8,gunKind:'pistola',fireAt:[1,4],fireMul:0.85,dur:i=>[90,60,60,60,60,80,110,120][i],pose:i=>Object.assign({},ST,[
      {gun:1,gy:20,lean:4,brow:1},{gun:1,gy:0,rk:1.2,mf:1,mouth:1,brow:1,lean:-2,hx:-1},
      {gun:1,gy:-4,rk:0.8,brow:1,lean:-2,hx:-1},{gun:1,gy:-1,rk:0.2,brow:1,lean:1},
      {gun:1,gy:-2,rk:1.6,mf:1,mouth:2,brow:1,lean:-5,hx:-3},{gun:1,gy:-8,rk:1,brow:1,lean:-4,hx:-3},
      {gun:1,gy:-2,rk:0.3,brow:1,lean:0,hx:-1},{gun:1,gy:1,brow:1,lean:3}][i])},
    // coronhada: de colado, ergue a arma e desce a coronha na cabeça do zumbi (empurra e derruba)
    whip:{nome:'Coronhada (de perto)',n:8,gunMelee:3,fin:'knock',hits:{4:1},hitsx:{4:{m:1.4,heavy:1,knock:1,reach:36}},move:[0,0,30,40,10,0,0,0],dur:i=>[80,100,40,50,130,90,90,110][i],pose:i=>G([
      {aFs:100,aFe:130,bA:200,lean:0,head:-4,lFh:30,lFk:4,lBh:-24,lBk:-36,aBs:60,aBe:110,brow:1},
      {aFs:160,aFe:190,bA:250,lean:-12,hx:-3,head:-8,lFh:28,lFk:2,lBh:-24,lBk:-38,aBs:110,aBe:150,brow:1,mouth:1},
      {aFs:130,aFe:140,bA:200,lean:6,hx:6,head:-10,smear:1,sa:240,lFh:44,lFk:8,lBh:-30,lBk:-36,aBs:40,aBe:90,mouth:2},
      {tw:0.9,aFs:80,aFe:50,bA:110,lean:30,hx:13,head:-12,smear:3,sa:230,lFh:54,lFk:12,lBh:-32,lBk:-36,aBs:-40,aBe:-10,mouth:2,brow:1},
      {tw:1,aFs:70,aFe:36,bA:100,lean:34,hx:14,head:-12,impact:2,lFh:56,lFk:12,lBh:-32,lBk:-36,aBs:-50,aBe:-20,mouth:2,brow:1},
      {tw:0.7,aFs:60,aFe:40,bA:110,lean:28,hx:12,lFh:52,lFk:10,lBh:-32,lBk:-36,aBs:-30,aBe:0,mouth:1},
      {tw:0.3,aFs:60,aFe:80,bA:140,lean:16,hx:6,lFh:40,lFk:6,lBh:-28,lBk:-38,aBs:20,aBe:80},
      {}][i])},
    // rajada de laser: três pulsos curtos sem carregar (cada um mais fraco que o feixe carregado)
    burst:{nome:'Rajada (laser)',n:8,gunKind:'laser',fireAt:[1,3,5],fireMul:0.42,dur:i=>[90,70,60,70,60,70,110,120][i],pose:i=>Object.assign({},LUNGE,[
      {gun:1,gy:2,chg:0.3,brow:1,lean:4},{gun:1,gy:0,rk:0.8,mf:1,mouth:1,brow:1,lean:-1,hx:-1},
      {gun:1,gy:-2,rk:0.3,chg:0.2,brow:1,lean:1},{gun:1,gy:-1,rk:0.9,mf:1,mouth:2,brow:1,lean:-2,hx:-2},
      {gun:1,gy:-3,rk:0.3,chg:0.2,brow:1,lean:0,hx:-1},{gun:1,gy:-2,rk:1.2,mf:1,mouth:2,brow:1,lean:-4,hx:-3},
      {gun:1,gy:-4,rk:0.5,brow:1,lean:-1,hx:-1},{gun:1,gy:0,brow:1,lean:3}][i])},
  };
  Object.assign(ANIMS,STRIKES.tool(G,{names:{atkH:'Bastão: golpe horizontal',atkV:'Bastão: golpe por cima',atkS:'Bastão: estocada',atkSpin:'Bastão: giro',atkFin:'Bastão: finalizador (lança)'}}));
  // kit de beat 'em up + assinaturas por arma (fam: o motor só usa a da arma equipada)
  Object.assign(ANIMS,MOVESET.kit(G,{skip:{hurtC:1}}),MOVESET.sigs(G,{},[
    ['sigRebatida','homeRun','Rebatida (manda longe)',{fam:'bastao'}],
    ['sigEstocadas','tripleJab','Estocadas triplas',{fam:'bastao'}],
    ['sigChuteTiro','kickShot','Chute e tiro à queima-roupa',{fam:'pistola'}],
    ['sigRasteira','lowSweep','Rasteira de coronha',{fam:'pistola',cd:6}],
    ['sigLamina','bladeSlash','Lâmina de plasma',{fam:'laser'}],
    ['sigChuteFeixe','kickShot','Chute e disparo de feixe',{fam:'laser',fireMul:1.1}]]));
  const GUNANIMS={idle:1,walk:1,guard:1,advance:1,special:1,victory:1,run:1};
  function poseOf(anim,i,w){ const A=ANIMS[anim]; return Object.assign({},REST,A.pose(i,GUNANIMS[anim]?w:undefined)); }

  /* ---------------- esqueleto ---------------- */
  function legIK(H,A,L1,L2){
    const dx=A.x-H.x, dy=A.y-H.y, d=Math.max(Math.abs(L1-L2)+0.5,Math.min(L1+L2-0.05,Math.hypot(dx,dy)));
    const b=Math.atan2(dy,dx), q=Math.acos(Math.max(-1,Math.min(1,(L1*L1+d*d-L2*L2)/(2*L1*d))));
    const k1={x:H.x+Math.cos(b-q)*L1,y:H.y+Math.sin(b-q)*L1}, k2={x:H.x+Math.cos(b+q)*L1,y:H.y+Math.sin(b+q)*L1};
    return k1.x>k2.x?k1:k2;
  }
  function skeleton(P,c,kind){
    const f=c.corpo==='f', L1=f?20.5:21, L2=f?20:20.5, U=f?13:14, E=f?12:13, ro=P.rot||0, br=P.br||0;
    const r=rad(ro), cr=Math.cos(r), sr=Math.sin(r);
    const hip={x:AX+P.hx,y:80};
    const R=(lx,ly)=>({x:hip.x+lx*cr-ly*sr,y:hip.y+lx*sr+ly*cr});
    const hipF=R(f?3.6:5,0.6), hipB=R(f?-3.8:-5.4,0);
    const kneeF=lp(hipF,P.lFh-ro,L1), ankleF=lp(kneeF,P.lFk-ro,L2), kneeB=lp(hipB,P.lBh-ro,L1), ankleB=lp(kneeB,P.lBk-ro,L2);
    const a=rad(P.lean+ro), co=Math.cos(a), s=Math.sin(a);
    const T=(lx,ly)=>({x:hip.x+lx*co-ly*s, y:hip.y+lx*s+ly*co});
    const tw=P.gun&&kind?1:(P.tw||0), neck=T(1,-34-br*0.8), shF=T(((f?-9:-14)*0.5+1.2)*(1-tw)-1.5*tw,(f?-29:-29.8)-br*0.8), shB=T(((f?8.6:13.6)*0.5+1.2)*(1-tw)+7*tw,(f?-29.4:-30.2)-br*0.8);
    const ha=rad(P.lean+ro+P.head), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:neck.x+lx*hc-ly*hs, y:neck.y+lx*hs+ly*hc});
    let elF,wrF,elB,wrB,gAng=null,Gp=null;
    if(P.gun && kind){
      const A0=90-P.gy, d={x:Math.sin(rad(A0)),y:Math.cos(rad(A0))}, reach=kind==='laser'?22:26;
      Gp={x:shF.x+d.x*(reach-P.rk*3.6), y:shF.y+d.y*(reach-P.rk*3.6)-P.rk*0.8};
      let q=ik(shF,Gp,U,E,true); elF=q.E; wrF=q.W;
      const tB=kind==='laser'?{x:Gp.x+d.x*10-d.y*1.4,y:Gp.y+d.y*10+d.x*1.4+0.6}:{x:Gp.x+0.8,y:Gp.y+3.4};
      q=ik(shB,tB,U,E,true); elB=q.E; wrB=q.W;
      const Ag=A0+P.rk*14; gAng=Math.atan2(Math.cos(rad(Ag)),Math.sin(rad(Ag)));
    } else {
      elF=lp(shF,P.aFs-ro,U); wrF=lp(elF,P.aFe-ro,E); elB=lp(shB,P.aBs-ro,U); wrB=lp(elB,P.aBe-ro,E);
    }
    const bAng=P.aFe+P.bat-ro, bDir=Math.atan2(Math.cos(rad(bAng)),Math.sin(rad(bAng)));
    // chão: o ponto mais baixo do corpo encosta no GROUND (deitado, ajoelhado, em pé)
    const FT=FOOT(c), cont=[[ankleF,FT],[ankleB,FT],[kneeF,6],[kneeB,6],[hip,7],[T(-13,-6),2],[T(-15,-24),2],[T(14,-24),2],[T(0,-33),3],[H(2.9,-16.4),11.8],[wrF,5.4],[wrB,5.4]];
    let low=-1e9; cont.forEach(([q,rr])=>{ low=Math.max(low,q.y+rr); });
    const dy=GROUND-low-(P.lift||0);
    const all=[hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,neck,shF,shB,elF,wrF,elB,wrB]; if(Gp) all.push(Gp);
    all.forEach(q=>q.y+=dy);
    const sk={hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,neck,shF,shB,elF,wrF,elB,wrB,a,ha,H,T,bDir,gAng,ro,L1,L2,tw,br};
    // pé plantado: perna quase no chão encosta de vez (IK)
    if(P.plant && !P.lift && Math.abs(ro)<10){
      [['kneeF','ankleF','hipF'],['kneeB','ankleB','hipB']].forEach(([kn,an,hp])=>{
        const gap=GROUND-(sk[an].y+FT); if(gap>0.05 && gap<4.5){ const A={x:sk[an].x,y:sk[an].y+gap}; const k=legIK(sk[hp],A,L1,L2); sk[kn].x=k.x; sk[kn].y=k.y; sk[an].x=A.x; sk[an].y=A.y; }
      });
    }
    return sk;
  }

  /* ---------------- desenho ---------------- */
  // faixa encostada num lado do segmento (fica dentro da silhueta): lite=false → lado da sombra (esq/baixo)
  function band(p,a,b,wa,wb,col,f,lite,ins){
    const dx=b.x-a.x, dy=b.y-a.y, L=Math.hypot(dx,dy)||1; let nx=-dy/L, ny=dx/L;
    if((-nx+0.6*ny<0)!==!!lite){ nx=-nx; ny=-ny; }
    ins=ins||0; const oa=wa*(1-f)/2-ins, ob=wb*(1-f)/2-ins;
    p.F(col); p.cap({x:a.x+nx*oa,y:a.y+ny*oa},{x:b.x+nx*ob,y:b.y+ny*ob},wa*f,wb*f);
  }
  // volume esculpido de um segmento: 7 tons (quente → meio → base → sombra roxa grande → borda funda)
  function vol(p,a,b,wa,wb,R,X,o={}){
    p.F(R[1]); p.cap(a,b,wa,wb);
    band(p,a,b,wa,wb,X[2],0.66); band(p,a,b,wa,wb,R[2],0.46); band(p,a,b,wa,wb,R[3],0.16);
    if(!o.noLite){ const a2=lerp(a,b,o.l0||0.1), b2=lerp(a,b,o.l1||0.8); band(p,a2,b2,wa,wb,X[1],0.34,true,0.4); band(p,a2,b2,wa,wb,R[0],0.2,true,0.7); band(p,lerp(a,b,o.h0||0.25),lerp(a,b,o.h1||0.55),wa,wb,X[0],0.1,true,1); }
  }
  function sideOff(a,b,w,sgn){ const dx=b.x-a.x, dy=b.y-a.y, L=Math.hypot(dx,dy)||1; let nx=-dy/L, ny=dx/L; if(-nx+0.6*ny<0){ nx=-nx; ny=-ny; } return {x:nx*w*sgn,y:ny*w*sgn}; }
  function xfs(cx,a,ox,oy,sx,sy=1){ const K=PIX.getK(), c=Math.cos(a), s=Math.sin(a); cx.setTransform(c*sx*K,s*sx*K,-s*sy*K,c*sy*K,ox*K,oy*K); }
  function dome(cx,cy,rx,ry,a0,a1,n){ const o=[]; for(let k=0;k<=n;k++){ const t=rad(a0+(a1-a0)*k/n); o.push([cx+Math.cos(t)*rx, cy-Math.sin(t)*ry]); } return o; }
  const HS=1.12;   // escala da cabeça
  const FOOT=c=>c.corpo==='f'?7.1:8;

  function fist(p,M,el,wr,f){
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x), s=f?1.2:1.55; p.xf(ang,wr.x,wr.y);
    p.F(M.skin[1]); p.ell(2*s,0.2,4.5*s,4.2*s);
    p.F(M.skinX[2]); p.poly([[-0.6*s,1*s],[6*s,0.6*s],[5.4*s,3.6*s],[1.2*s,4.2*s]]);
    p.F(M.skin[2]); p.poly([[0,2.4*s],[5.6*s,1.8*s],[5*s,3.8*s],[1.2*s,4*s]]); p.rect(3.4*s,-2.6*s,0.9,4.6*s); p.rect(5*s,-2*s,0.8,3.4*s);
    p.F(M.skin[3]); p.rect(1.6*s,3.4*s,3*s,0.8);
    p.F(M.skin[0]); p.rect(1.6*s,-3.6*s,3.4*s,1.1); p.F(M.skinX[0]); p.rect(2.4*s,-3.6*s,1.4*s,0.9);
    p.F(M.skin[1]); p.ell(0.4*s,-3.4*s,2.2*s,1.5*s); p.F(M.skin[2]); p.rect(-0.8*s,-2.6*s,2.6*s,0.8);
    p.id();
  }
  function drawArm(p,M,c,sh,el,wr){
    p.id(); const f=c.corpo==='f', wU=f?9.6:13.4, wE=f?8.2:11.4, wW=f?6.6:8.6;
    // antebraço com massa (bulbo perto do cotovelo) + braço
    vol(p,el,wr,wE,wW,M.skin,M.skinX,{l0:0.05,l1:0.6,h0:0.1,h1:0.4});
    const fb=lerp(el,wr,0.28), fo=sideOff(el,wr,wE*0.12,-1); p.F(M.skinX[1]); p.ell(fb.x+fo.x,fb.y+fo.y,wE*0.36,wE*0.3);
    vol(p,sh,el,wU,wE,M.skin,M.skinX,{l0:0.1,l1:0.85,h0:0.3,h1:0.65});
    // deltoide e bíceps
    const d=lerp(sh,el,0.12), od=sideOff(sh,el,wU*0.16,-1); p.F(M.skin[0]); p.ell(d.x+od.x,d.y+od.y,wU*0.3,wU*0.24); p.F(M.skinX[0]); p.ell(d.x+od.x*1.4,d.y+od.y*1.4-0.4,wU*0.12,wU*0.1);
    const dl=lerp(sh,el,0.34), o2=sideOff(sh,el,wU*0.1,1); p.F(M.skin[2]); p.cap({x:dl.x+o2.x-1.6,y:dl.y+o2.y},{x:dl.x+o2.x+1.6,y:dl.y+o2.y+0.6},1,1);
    if(c.top==='camiseta'){ const e=lerp(sh,el,0.55);
      vol(p,sh,e,wU+3.4,wU+2.4,M.top,M.topX,{l0:0.01,l1:0.7,h0:0.1,h1:0.45});
      p.F(M.top[2]); p.cap(lerp(sh,el,0.47),e,wU+2.6,wU+2.4); p.F(M.top[3]); p.cap(lerp(sh,el,0.53),e,wU+2.4,wU+2.4);
      const fo2=lerp(sh,e,0.5); p.F(M.top[2]); p.cap({x:fo2.x-1.5,y:fo2.y-1},{x:fo2.x+1.2,y:fo2.y+1.4},0.9,0.9); }
    if(c.top==='moletom'){ const cf=lerp(el,wr,0.72), cf2=lerp(el,wr,0.88);
      vol(p,el,cf,wE+3.4,wW+3,M.top,M.topX,{l0:0.01,l1:0.7}); vol(p,sh,el,wU+3.6,wE+3.4,M.top,M.topX,{l0:0.05,l1:0.8});
      p.F(M.top[2]); p.cap(cf,cf2,wW+2.6,wW+2.4); p.F(M.top[3]); p.cap(lerp(cf,cf2,0.7),cf2,wW+2.4,wW+2.4); p.F(M.topX[1]); p.cap(cf,lerp(cf,cf2,0.25),wW+1,wW+1);
      p.F(M.top[2]); const e1=lerp(sh,el,0.86), e2=lerp(el,wr,0.14); p.cap(e1,lerp(e1,e2,0.5),1.1,0.9); p.cap(lerp(e1,e2,0.4),lerp(e1,e2,1),0.9,0.9); }
    fist(p,M,el,wr,f);
  }
  function drawShoe(p,M,a,ang,sc){
    xfs(p.cx,ang,a.x,a.y,sc,sc);
    p.F(M.shoe[1]); p.poly([[-5,-4.4],[2.6,-4.6],[5,-1],[10.6,0.8],[12.6,3],[12.4,4.6],[-6,4.6],[-6.4,-0.6]]);
    p.F(M.shoeX[2]); p.poly([[-6.4,-0.6],[-5,-4.4],[0,-4.4],[-1,0],[0,4.6],[-6,4.6]]);
    p.F(M.shoe[2]); p.poly([[-6.4,-0.6],[-5,-4.4],[-2.4,-4.4],[-3.6,0],[-3,4.6],[-6,4.6]]); p.F(M.shoe[3]); p.rect(-6.4,1.6,1.4,3);
    p.F(M.shoe[0]); p.poly([[7.6,0.2],[10.6,0.8],[12.6,3],[12.4,3.6],[8,2.6]]); p.rect(-1.6,-4.6,4,1); p.F(M.shoeX[0]); p.rect(9.4,1,1.6,0.8);
    p.F(M.shoe[3]); p.ell(-1.4,-4.4,3.2,1);
    p.F(M.sole[1]); p.poly([[-6.6,3.6],[12.8,3.6],[13.4,5.2],[12.4,6.2],[-6.6,6.2]]); p.F(M.sole[2]); p.rect(-6.6,5.3,19,0.9); p.F(M.sole[0]); p.rect(-5,3.6,14,0.8); p.F(M.sole[3]); p.rect(-6.6,3.6,2.4,2.6);
    p.F(M.sole[1]); [[0.6,-3],[2.6,-1.8],[4.6,-0.6]].forEach(([x,y])=>p.rect(x,y,1.6,0.9));
    p.F(M.shoe[2]); p.poly([[-1,1.6],[6,0.6],[7.4,1.4],[0,2.8]]);
    p.id();
  }
  function footAng(sk,front,P,c){
    const an=front?sk.ankleF:sk.ankleB, gap=GROUND-(an.y+FOOT(c)), k=(front?P.lFk:P.lBk);
    let t=0; if(gap>1.2){ if(k<-12) t=Math.min(38,(-k-12)*0.7); else if(k>50) t=-Math.min(30,(k-50)*0.5); }
    return rad(sk.ro+t);
  }
  function calf(p,knee,ankle,w,R){ const q=lerp(knee,ankle,0.3), o=sideOff(knee,ankle,w*0.18,1); p.F(R[1]); p.ell(q.x+o.x,q.y+o.y,w*0.5,w*0.62,Math.atan2(ankle.y-knee.y,ankle.x-knee.x)); }
  function drawLeg(p,M,c,sk,front,P){
    p.id(); const f=c.corpo==='f', hip=front?sk.hipF:sk.hipB, knee=front?sk.kneeF:sk.kneeB, ankle=front?sk.ankleF:sk.ankleB;
    const wT=f?15:18, wK=f?11.4:13.4, wA=f?8.6:10.2;
    if(c.calca==='bermuda'){
      calf(p,knee,ankle,wK,M.skin); vol(p,knee,ankle,wK-1,wA-0.6,M.skin,M.skinX,{l0:0.1,l1:0.6,h0:0.15,h1:0.4});
      const cq=lerp(knee,ankle,0.32), co=sideOff(knee,ankle,wK*0.3,1); p.F(M.skin[2]); p.ell(cq.x+co.x,cq.y+co.y,wK*0.24,wK*0.4);
      const hm=lerp(hip,knee,1.0);
      vol(p,hip,hm,wT+1.2,wK+2,M.pants,M.pantsX,{l0:0.05,l1:0.75});
      p.F(M.pants[2]); p.cap(lerp(hip,knee,0.88),hm,wK+1.8,wK+2); p.F(M.pants[3]); p.cap(lerp(hip,knee,0.96),hm,wK+1.8,wK+2);
      if(front){ const q=lerp(hip,knee,0.55), ang=Math.atan2(knee.y-hip.y,knee.x-hip.x); p.xf(ang,q.x,q.y); p.F(M.pants[3]); p.rect(-4.6,-1,9.2,6.4); p.F(M.pants[1]); p.rect(-4,-0.4,8,5.2); p.F(M.pantsX[1]); p.rect(-4,-0.4,8,1.6); p.F(M.pants[0]); p.rect(-4.6,-1.8,9.2,1.4); p.F(M.metal[2]); p.rect(-0.6,-0.4,1.2,1); p.id(); }
    } else {
      calf(p,knee,ankle,wK,M.pants);
      vol(p,knee,ankle,wK,wA+1,M.pants,M.pantsX,{l0:0.05,l1:0.6,h0:0.1,h1:0.35}); vol(p,hip,knee,wT,wK,M.pants,M.pantsX,{l0:0.05,l1:0.85,h0:0.2,h1:0.6});
      // dobras grandes: atrás do joelho e sanfona no tornozelo
      const kk=knee, kb=sideOff(hip,knee,wK*0.2,1);
      p.F(M.pants[2]); p.poly([[kk.x-4,kk.y-3],[kk.x+3,kk.y-1.2],[kk.x+3.4,kk.y],[kk.x-3.6,kk.y-1.4]]); p.poly([[kk.x-3.4+kb.x,kk.y+1.6+kb.y],[kk.x+3.2,kk.y+2.4],[kk.x+2.4,kk.y+3.4],[kk.x-3.6+kb.x,kk.y+3+kb.y]]);
      p.F(M.pantsX[1]); p.poly([[kk.x-2,kk.y-1.2],[kk.x+3.4,kk.y],[kk.x+3,kk.y+1],[kk.x-2,kk.y+0.4]]);
      const t1=lerp(hip,knee,0.45), tb=sideOff(hip,knee,wT*0.1,1); p.F(M.pants[2]); p.cap({x:t1.x+tb.x-3,y:t1.y+tb.y-1.6},{x:t1.x+tb.x+2.6,y:t1.y+tb.y+1.2},1.2,0.8);
      [0.8,0.88].forEach(t=>{ const q=lerp(knee,ankle,t); p.F(M.pants[2]); p.cap({x:q.x-wA*0.55,y:q.y-0.8},{x:q.x+wA*0.5,y:q.y+0.6},1,1); });
      const c1=lerp(knee,ankle,0.9); p.F(M.pants[0]); p.cap(c1,lerp(knee,ankle,0.96),wA+2.2,wA+2.2); p.F(M.pants[3]); p.cap(lerp(knee,ankle,0.97),lerp(knee,ankle,1),wA+2,wA+2);
      if(front){ p.F(M.pantsX[0]); p.cap(lerp(hip,knee,0.25),lerp(hip,knee,0.7),0.7,0.7); }
    }
    drawShoe(p,M,ankle,footAng(sk,front,P,c),f?1.14:1.3);
  }
  function drawTorso(p,M,sk,c,P){
    const f=c.corpo==='f'; xfs(p.cx,sk.a,sk.hip.x,sk.hip.y,(f?1.2:1.45)*0.8-(f?0.08:0.26)*Math.max(0,sk.tw),1.1*(1+0.025*(sk.br||0)));
    const body=f?[[-9.6,3],[9.4,3],[9.6,-3],[7.8,-9],[8.4,-13.4],[10.6,-18],[10.8,-23],[9,-27.6],[3.8,-30.8],[-3,-30.8],[-8.6,-28.4],[-10.4,-24.4],[-9.6,-19],[-7.8,-13],[-8.2,-8],[-9.8,-2]]
                :[[-9.4,3],[9.4,3],[9.6,-3],[8.6,-9],[10.6,-15],[12.4,-21],[12.6,-25.4],[10.4,-29.4],[4.6,-32.2],[-3.6,-32.2],[-10.4,-29.8],[-12.8,-25.6],[-12.4,-20],[-10.2,-14],[-9,-8],[-10,-2]];
    const nk=f?[[-2.6,-31],[4.4,-31],[3.4,-28],[-1.8,-28]]:[[-3.2,-32.4],[5,-32.4],[3.8,-29],[-2.2,-29]];
    const R=c.top==='regata'?M.skin:M.top, X=c.top==='regata'?M.skinX:M.topX;
    // massa base + esculpido (meio-tom largo, sombra roxa grande, borda funda, luz quente)
    p.F(R[1]); p.poly(body);
    p.F(X[2]); p.poly(f?[[-10.4,-24.4],[-2,-26],[-1,-16],[-2,-6],[-2,3],[-9.6,3],[-9.8,-2],[-8.2,-8],[-7.8,-13],[-9.6,-19]]:[[-12.8,-25.6],[-2,-27.6],[-1,-17],[-2,-6],[-2,3],[-9.4,3],[-10,-2],[-9,-8],[-10.2,-14],[-12.4,-20]]);
    p.F(R[2]); p.poly(f?[[-10.4,-24.4],[-5.6,-25.6],[-5,-17],[-5.4,-8],[-4.8,3],[-9.6,3],[-9.8,-2],[-8.2,-8],[-7.8,-13],[-9.6,-19]]:[[-12.8,-25.6],[-6.4,-27.4],[-5.6,-18],[-6,-9],[-5.4,3],[-9.4,3],[-10,-2],[-9,-8],[-10.2,-14],[-12.4,-20]]);
    p.F(R[3]); p.poly(f?[[-10.4,-24.4],[-8,-25],[-8,-17],[-7.8,-13],[-9.6,-19]]:[[-12.8,-25.6],[-10,-26.6],[-9.6,-18],[-10.2,-14],[-12.4,-20]]); p.poly([[-9.6,-4],[-6,-4],[-5.4,3],[-9.4,3]]);
    p.F(R[2]); p.poly(f?[[-5,-17],[2,-14.6],[10.6,-17],[9.6,-12.4],[2,-10.6],[-5,-13]]:[[-6,-18],[2,-16.6],[12.2,-19],[11.2,-14],[2,-12.4],[-6,-14]]);
    p.F(R[3]); p.poly(f?[[-5,-17],[2,-14.6],[10.6,-17],[10.4,-16],[2,-13.6],[-5,-16]]:[[-6,-18],[2,-16.6],[12.2,-19],[12,-17.8],[2,-15.4],[-6,-16.8]]);
    p.F(X[2]); p.poly(f?[[6,-11],[9.2,-10.6],[9.6,-3],[7,-3]]:[[6.6,-12],[10,-12],[9.6,-3],[7,-3]]);
    p.F(X[1]); p.poly(f?[[0,-27.8],[8.6,-27.6],[10.6,-22.6],[10,-17.6],[2,-16],[-1,-22]]:[[0,-29.4],[9.6,-29.2],[12.2,-24],[11.8,-19.6],[2,-17.6],[-1,-23]]);
    p.F(R[0]); p.poly(f?[[2.6,-27.4],[8.4,-27.4],[10.4,-22.6],[9.6,-19.6],[5.4,-20.4],[3.2,-23]]:[[2.6,-29],[9.4,-28.6],[11.8,-23.4],[11.2,-20.4],[6,-21],[3,-24.4]]);
    p.F(X[0]); p.poly(f?[[5,-27],[8.2,-27],[9.4,-24],[6.6,-24.6]]:[[5,-28.6],[9,-28.4],[10.6,-25],[7,-25.6]]);
    p.F(X[1]); p.poly([[1,-11],[7,-11.6],[7.6,-5],[2,-4.6]]);
    if(c.top==='regata'){
      p.F(M.skin[2]); p.rect(1.6,-11,0.9,8); p.rect(-1,-8,5.6,0.8); p.rect(-1,-4.6,5.6,0.8);
      p.F(M.top[1]); p.poly(f?[[-9.4,3],[9.2,3],[9.4,-3],[7.8,-9],[8.4,-13.4],[10.2,-18],[9.2,-23],[6.4,-27.6],[4.4,-27.6],[3,-22],[-1.6,-22],[-3.6,-27.6],[-5.8,-27.6],[-8.6,-21],[-7.8,-13],[-8.2,-8],[-9.6,-2]]
                          :[[-9.2,3],[9.2,3],[9.4,-3],[8.4,-9],[10.4,-15],[11.4,-21],[9.4,-27],[7,-29.6],[4.8,-29.6],[3,-24],[-2,-24],[-4,-29.6],[-6.6,-29.6],[-9.8,-22],[-10,-14],[-9,-8],[-9.8,-2]]);
      p.F(M.topX[2]); p.poly([[-9.8,-22],[-2,-24],[-1.4,-6],[-2,3],[-9.2,3],[-9.8,-2],[-9,-8],[-10,-14]]);
      p.F(M.top[2]); p.poly([[-9.8,-22],[-6,-23],[-5.6,-10],[-6.4,3],[-9.2,3],[-9.8,-2],[-9,-8],[-10,-14]]);
      p.F(M.top[3]); p.poly([[-9.8,-22],[-8,-22.4],[-7.6,-10],[-9,-8],[-10,-14]]);
      p.F(M.topX[1]); p.poly([[1.6,-23],[9.6,-21],[10,-16],[2,-15]]); p.F(M.top[0]); p.poly([[3.6,-22],[9.6,-19.6],[9.2,-16.6],[3.4,-18]]);
      p.F(M.top[2]); p.poly([[-1,-13],[9.6,-15],[9.4,-13.6],[-1,-11.8]]); p.rect(1,-8,6,0.8); p.rect(-2,-5,5,0.8);
      if(f){ p.F(M.top[3]); p.poly([[-2,-15],[9.6,-15.4],[9.4,-14.4],[-1,-14]]); }
    } else {
      p.F(M.skin[1]); p.poly(nk); p.F(M.skin[2]); p.rect(nk[0][0]+0.6,nk[0][1],2.4,3); p.F(M.skin[3]); p.rect(nk[0][0]+0.6,nk[0][1]+2.2,4,0.8);
      // dobras grandes: do ombro pro quadril e na cintura
      p.F(R[2]); p.poly([[-5,-25],[2,-19],[1.4,-17.6],[-5.6,-23.2]]); p.poly([[5,-11],[9.6,-6],[8.4,-5],[4.2,-9.6]]); p.poly([[-4,-8],[3,-6],[2.6,-4.6],[-4.2,-6.6]]); p.poly([[2,-13],[8,-11.6],[7.6,-10.4],[1.8,-11.6]]);
      p.F(X[1]); p.poly([[-4.4,-23.8],[1.8,-18.4],[2.4,-19.2],[-3.8,-25]]); p.poly([[-3.8,-8.6],[2.8,-6.6],[3.2,-7.4],[-3.4,-9.4]]);
      if(f){ p.F(R[1]); p.poly([[3.6,-19.6],[9.6,-19.4],[9,-17.6],[4,-17.8]]); }
      p.F(R[2]); p.poly(f?[[-3.2,-31.2],[5,-31.2],[4,-27.4],[-2.2,-27.4],[-1.8,-28.4],[3.2,-28.4],[3.8,-30.2],[-2.4,-30.2]]
                            :[[-3.8,-32.8],[5.6,-32.8],[4.4,-28.4],[-2.6,-28.4],[-2.2,-29.4],[3.6,-29.4],[4.4,-31.4],[-3,-31.4]]);
      p.F(X[1]); p.rect(0,-32.8,4.4,0.8);
      p.F(R[2]); p.rect(-9.8,-3.8,19.4,1.4); p.F(R[3]); p.rect(-9.8,-2.6,6,1); p.F(X[1]); p.rect(2,-3.8,6,0.6);
      if(c.top==='moletom'){
        p.F(R[1]); p.poly(f?[[-10,-26],[-6,-33],[0,-34.4],[2.4,-32],[-3,-30],[-7.6,-25]]:[[-11.6,-27],[-7,-34.6],[0,-36],[2.6,-33.4],[-3.4,-31],[-8.6,-26]]);
        p.F(R[2]); p.poly(f?[[-8.6,-26],[-5.4,-31.4],[-1,-32.4],[-3,-30],[-6.8,-25.4]]:[[-10,-27],[-6.4,-33],[-1,-34],[-3.4,-31.4],[-8,-26.4]]);
        p.F(R[3]); p.poly(f?[[-8.6,-26],[-6.6,-29],[-5,-28],[-6.8,-25.4]]:[[-10,-27],[-8,-30],[-6.4,-29],[-8,-26.4]]);
        p.F(R[0]); p.poly(f?[[-6,-33],[0,-34.4],[0.6,-33.6],[-5,-32.4]]:[[-7,-34.6],[0,-36],[0.6,-35.2],[-6,-34]]);
        p.F(M.metal[1]); p.rect(1.4,-28.6,0.9,8); p.rect(3.6,-28.4,0.9,6.4); p.F(M.metal[2]); p.rect(1.2,-20.8,1.4,1.4); p.rect(3.4,-22.2,1.4,1.4);
        p.F(R[3]); p.poly([[-5,-13],[8.6,-13],[10,-5],[-6,-5]]); p.F(R[1]); p.poly([[-4.2,-12.2],[7.8,-12.2],[9,-5.8],[-5.2,-5.8]]); p.F(X[1]); p.poly([[0,-12.2],[7.8,-12.2],[8.2,-10],[0,-10]]);
        p.F(R[2]); p.poly([[-4.2,-12.2],[-2.6,-12.2],[-3.4,-5.8],[-5.2,-5.8]]); p.poly([[6.2,-12.2],[7.8,-12.2],[9,-5.8],[7.4,-5.8]]);
        p.F(R[2]); p.rect(-10,-3.8,20,3.4); p.F(R[3]); for(let x=-8;x<9;x+=2.4) p.rect(x,-3.6,0.8,3);
      }
    }
    // calça: cós, cinto, braguilha
    p.F(M.pants[1]); p.poly([[-10.6,-2],[10.2,-2],[10.6,4.4],[-10.8,4.4]]); p.F(M.pantsX[2]); p.poly([[-10.6,-2],[-2,-2],[-1.6,4.4],[-10.8,4.4]]); p.F(M.pants[2]); p.poly([[-10.6,-2],[-5.6,-2],[-5,4.4],[-10.8,4.4]]); p.rect(4,0,0.8,4.4);
    p.F(M.belt[1]); p.poly([[-10.8,-3],[10.4,-3],[10.6,-0.4],[-11,-0.4]]); p.F(M.belt[2]); p.rect(-10.8,-3,6,2.6); p.F(M.belt[0]); p.rect(-4,-3,13,0.7); p.F(M.belt[3]); p.rect(-10.8,-0.9,21.4,0.6);
    p.F(M.pants[2]); [-8,0.6].forEach(x=>p.rect(x,-3.4,1.2,3.6));
    p.F(M.buckle[1]); p.rect(5,-3.6,3.6,3.6); p.F(M.belt[2]); p.rect(6,-2.6,1.6,1.6); p.F(M.buckle[0]); p.rect(5,-3.6,3.6,0.8);
    p.id();
  }
  function drawHairBack(p,M,sk,c){
    if(!['longo','tranca','coque','black'].includes(c.cabelo)) return;
    xfs(p.cx,sk.ha,sk.neck.x,sk.neck.y,HS,HS);
    if(c.cabelo==='longo'){ p.F(M.hair[1]); p.poly([[-9.6,-18],[-4,-25],[3,-25],[0,-14],[-0.6,0],[-2.6,9],[-7,13.4],[-12,10],[-13,-2]]);
      p.F(M.hair[2]); p.poly([[-12.6,-2],[-9,-4],[-6,6],[-7,13.4],[-12,10]]); p.F(M.hair[0]); p.poly([[-7,-14],[-5.4,-14],[-5.6,2],[-7.2,4]]); }
    if(c.cabelo==='tranca'){ for(let k=0;k<7;k++){ p.F(M.hair[1]); p.ell(-8.4-k*0.5,-9+k*3.8,2.8,2.4); p.F(M.hair[2]); p.rect(-10.4-k*0.5,-8.4+k*3.8,4,0.9); p.F(M.hair[0]); p.rect(-8.6-k*0.5,-10.4+k*3.8,1.4,0.8); }
      p.F(M.acc[1]); p.rect(-13.2,17.4,3.6,2.2); p.F(M.hair[1]); p.poly([[-13,19.6],[-10,19.6],[-10.4,23],[-12.8,23.6]]); }
    if(c.cabelo==='coque'){ p.F(M.hair[1]); p.ell(-5.4,-25.6,5.6,4.8); p.F(M.hair[2]); p.ell(-6.6,-24,3.6,2.6); p.F(M.hair[0]); p.ell(-4,-28,2.4,1.2); p.F(M.acc[1]); p.rect(-3.4,-23.6,2.6,3.4); }
    if(c.cabelo==='black'){ p.F(M.hair[1]); p.ell(0,-19,14,12.8); p.F(M.hair[2]); p.ell(-6,-13,7,7.6); }
    p.id();
  }
  function drawHead(p,M,sk,P,c){
    const f=c.corpo==='f'; xfs(p.cx,sk.ha,sk.neck.x,sk.neck.y,HS,HS);
    // pescoço
    p.F(M.skin[1]); p.cap(P2(0.4,4),P2(1.2,-6),f?6.8:8.8,f?6.2:8);
    p.F(M.skin[2]); p.poly([[-3.8,3],[-3,-6],[-0.6,-6],[-1,3]]); p.poly([[0,-4.6],[8.4,-2.6],[7,-0.8],[0.4,-1.8]]);
    // crânio + rosto
    p.F(M.skin[1]); p.ell(2.6,-14.6,10.2,10.4);
    p.poly(f?[[-3,-9],[10.4,-10.4],[12.2,-6.6],[10.6,-2.8],[6.8,-0.6],[1.6,-0.6]]:[[-3,-9],[10.6,-10.4],[12.8,-6],[11.8,-2.2],[8,0.6],[1.4,0.6]]);
    p.F(M.skin[2]); p.poly([[-3.4,-9.4],[1.6,-8.6],[2.8,-3],[1.6,0.4],[-1.8,-2]]); p.poly([[-7.6,-12],[-5.6,-17],[-4,-13],[-5,-8]]);
    p.F(M.skin[0]); p.poly([[6,-23],[10,-21.6],[11.4,-18.6],[8,-20]]); p.ell(9,-9.2,1.8,1);
    // orelha
    p.F(M.skin[1]); p.ell(-3.4,-12.4,2.6,3.6); p.F(M.skin[2]); p.ell(-3.1,-12.2,1.3,2.3); p.F(M.skin[3]); p.rect(-3.4,-12.8,0.8,1.8);
    // barba (antes da boca)
    if(!f && c.barba==='porfazer'){ p.F(M.stub[1]); p.poly([[0.4,-8.6],[2,-4],[6,-0.2],[9.8,0],[12,-2.4],[12.6,-4.4],[11.4,-4],[9,-3.4],[6.8,-4.2],[4,-7],[2.4,-9.4]]); p.F(M.stub[2]); p.poly([[0.4,-8.6],[2,-4],[4.6,-1.6],[3,-5.6]]); }
    if(!f && c.barba==='cheia'){ p.F(M.hair[1]); p.poly([[-2.8,-10.4],[0,-7],[2,-2.6],[5.4,1.6],[9,2.8],[12.2,0],[13.2,-4.4],[12,-4.6],[10.6,-3.2],[8,-3.6],[6.6,-5],[4,-7.4],[1.6,-11.4]]);
      p.F(M.hair[2]); p.poly([[0,-7],[2,-2.6],[5.4,1.6],[9,2.8],[8.6,1],[5,-0.6],[2.6,-4]]); p.F(M.hair[0]); p.rect(6,-2.4,1,1.6); p.rect(9.6,-1.6,1,1.4); p.rect(2.6,-6,1,1.4); }
    if(!f && c.barba==='cavanhaque'){ p.F(M.hair[1]); p.poly([[7.8,-4],[12,-4.4],[11.4,0.4],[8.6,0.8]]); p.F(M.hair[2]); p.rect(8.6,-0.6,2.6,1); }
    // olhos
    const sq=P.brow===2&&P.mouth===2;
    if(P.blink>=0.5||sq){ p.F(M.skin[3]); if(sq){ p.poly([[4.6,-14.6],[9.4,-13.6],[9.4,-12.6],[4.6,-12.8]]); } else p.rect(4.4,-13.4,5,1); p.rect(10.8,-13.6,1.8,0.9); }
    else {
      p.F(M.eye[1]); p.ell(6.9,-13.3,2.7,2.2); p.F(M.eye[2]); p.rect(4.6,-12,4.8,0.9);
      p.F(M.iris[1]); p.rect(7.1,-14.8,2.2,3); p.F(M.iris[3]); p.rect(7.8,-14.2,1.1,1.8); p.F(M.eye[0]); p.rect(7.2,-14.8,0.9,0.9);
      p.F(M.skin[3]); p.poly([[4,-15.4],[9.8,-15.8],[9.8,-14.8],[4.4,-14.6]]);
      if(f){ p.rect(9.4,-16.4,1.4,1); p.rect(3.6,-15.2,1,0.9); }
      p.F(M.eye[1]); p.ell(11.7,-13.4,1.1,1.8); p.F(M.iris[1]); p.rect(11.5,-14.6,1.1,2); p.F(M.skin[3]); p.rect(10.7,-15.6,2.4,0.8);
    }
    // sobrancelhas
    const b=P.brow|0, th=c.sobr==='grossa'?2.4:c.sobr==='fina'?1:1.7;
    const yo=b===1?-18.4:b===2?-17.2:b===3?-18.6:-17.8, yi=b===1?-16.2:b===2?-19:b===3?-18:-17.4;
    p.F(M.hair[2]);
    if(c.sobr==='arqueada'){ const ym=Math.min(yo,yi)-1.2; p.poly([[3.6,yo+0.6],[6.8,ym],[10.4,yi],[10.4,yi+th],[6.8,ym+th],[3.6,yo+th+0.4]]); }
    else p.poly([[3.6,yo],[10.4,yi],[10.4,yi+th],[3.6,yo+th]]);
    p.poly([[11,yi+(b===1?0.2:0)],[13.2,yi+(b===1?-0.8:0.4)],[13.2,yi+th],[11,yi+th]]);
    // nariz
    p.F(M.skin[1]); p.poly([[10.2,-14.8],[14.4,-9.6],[13.8,-8.4],[10.4,-8.6]]);
    p.F(M.skin[2]); p.rect(10.4,-9.2,3.6,1); p.F(M.skin[3]); p.rect(11.6,-9.2,1.2,0.8); p.F(M.skin[0]); p.rect(11.4,-13.2,0.9,2.6);
    // boca
    const m=P.mouth|0;
    if(m===2){ p.F(M.mouth[2]); p.poly([[7.2,-7.6],[12.8,-7.8],[12.2,-2.2],[7.8,-2.4]]); p.F(M.teeth[1]); p.rect(7.6,-7.6,4.8,1.3); p.F(M.mouth[0]); p.ell(10,-3.2,1.9,0.9); }
    else if(m===1){ p.F(M.mouth[1]); p.rect(7.2,-7.6,5.6,3.4); p.F(M.teeth[1]); p.rect(7.6,-7.2,4.8,2.6); p.F(M.teeth[2]); p.rect(7.6,-5.9,4.8,0.6); p.rect(9.6,-7.2,0.6,2.6); }
    else if(m===3){ p.F(M.mouth[2]); p.poly([[7,-6.8],[12.8,-7.6],[11.6,-4.2],[8.2,-4.4]]); p.F(M.teeth[1]); p.rect(7.6,-6.8,4.8,1.3); p.F(M.skin[2]); p.rect(6,-7.8,1,1.6); }
    else { p.F(f?M.mouth[0]:M.mouth[2]); p.rect(7.8,-6,4.4,f?1.4:1); p.F(M.skin[2]); p.rect(8.4,-4.6,3,0.8); }
    // bigode (por cima da boca)
    if(!f && (c.barba==='bigode'||c.barba==='cheia'||c.barba==='cavanhaque')){ p.F(M.hair[1]); p.poly([[7,-8.6],[13,-8.8],[13.6,-6.6],[10.4,-7.4],[7.4,-6.4]]); p.F(M.hair[0]); p.rect(9,-8.6,2.4,0.8); }
    // cabelo (frente)
    const H=c.cabelo;
    const SIDE=[[-0.4,-15.4],[1.2,-15.4],[1,-10.4],[-0.6,-10]];
    if(H==='careca'){ p.F(M.skin[0]); p.ell(4.4,-22.4,3.6,1.4); p.F(M.skin[2]); p.poly(dome(2.6,-14.6,10.2,10.4,150,200,6).concat([[-5,-12],[-4.4,-18]])); }
    if(H==='raspado'){ p.F(M.stub[2]); p.poly(dome(2.6,-14.6,10.3,10.5,35,195,14).concat([[-4.6,-10],[-1.4,-12],[0.6,-17.6],[5,-19.6],[10.6,-19.4]])); p.poly(SIDE);
      p.F(M.stub[1]); p.poly([[0,-24],[6,-24.4],[9,-22.6],[4,-23]]); }
    if(H==='curto'){ p.F(M.hair[1]); p.poly(dome(2.6,-15,10.8,11,40,200,14).concat([[-6.6,-8.6],[-4.4,-10.2],[-2.4,-14],[0,-15.6],[2,-18.8],[5,-19.6],[7.4,-18.4],[9.6,-19.4],[12.6,-18.4]])); p.poly(SIDE);
      p.F(M.hair[2]); p.poly([[-8.2,-10],[-8.4,-14.6],[-4,-15.6],[-2.4,-14],[-4.4,-10.2],[-6.6,-8.6]]); p.poly([[2,-18.8],[5,-19.6],[4.6,-21],[1.6,-20.2]]);
      p.F(M.hair[0]); p.poly([[0,-24.8],[6,-25],[9,-23],[4,-23.4]]); p.poly([[-5,-21.8],[-2,-24],[-1,-23.2],[-4,-20.8]]);
      p.F(M.hair[1]); p.poly([[9.6,-19.4],[14,-21],[12.4,-18]]); p.poly([[5,-19.6],[8,-22],[7.4,-18.4]]); }
    if(H==='black'){ p.F(M.hair[1]); p.poly(dome(1,-21,13.4,10.6,-15,200,16).concat([[-7.6,-9],[-4.4,-12],[-1.6,-14],[1,-17.6],[5,-19.6],[10,-19.8],[13.2,-18.6]]));
      p.F(M.hair[0]); [[-2,-28],[4,-29],[9,-26],[-7,-23]].forEach(([x,y])=>p.ell(x,y,2.4,1.2)); p.F(M.hair[2]); [[-6,-15],[-9,-19],[12,-21],[2,-24]].forEach(([x,y])=>p.ell(x,y,1.6,1)); }
    if(H==='moicano'){ p.F(M.stub[2]); p.poly(dome(2.6,-14.6,10.3,10.5,35,195,14).concat([[-4.6,-10],[-1.4,-12],[0.6,-17.6],[5,-19.6],[10.6,-19.4]]));
      p.F(M.hair[1]); p.poly([[-8,-19],[-5,-27],[0,-32.6],[5,-33.4],[9.4,-30],[11.4,-24],[8,-23.6],[3,-25],[-2,-23.4],[-5.6,-19.6]]);
      p.F(M.hair[0]); p.poly([[0,-31.4],[5,-32.2],[7.6,-29.6],[3,-29.6]]); p.F(M.hair[2]); p.poly([[-8,-19],[-5.6,-19.6],[-2,-23.4],[-4,-22]]); }
    if(H==='tranca'||H==='longo'||H==='coque'){ p.F(M.hair[1]); p.poly(dome(2.6,-15,10.8,11,30,200,14).concat([[-6,-6.6],[-3,-9],[-1.6,-14],[1,-18],[4,-19.8],[8,-19.2],[11,-17.8],[13.2,-17.6]])); p.poly(SIDE);
      p.F(M.hair[2]); p.poly([[1,-18],[4,-19.8],[1.6,-24],[0,-24]]); p.poly([[-8.6,-9],[-6,-6.6],[-3,-9],[-5,-14]]);
      p.F(M.hair[0]); p.poly([[3.6,-24.6],[9,-23.4],[11,-20.6],[6,-22.4]]); p.poly([[-5.6,-21],[-3,-23.6],[-2.4,-22.6],[-4.8,-19.6]]);
      if(H==='longo'){ p.F(M.hair[1]); p.poly([[-9.6,-14],[-5.6,-10],[-5,-1],[-8,4],[-10.6,-5]]); p.F(M.hair[2]); p.poly([[-9.6,-8],[-7,-6],[-8,4],[-10.6,-5]]); } }
    // acessório
    if(c.acc==='bone'){ p.F(M.acc[1]); p.poly(dome(2.6,-17.6,11,9.6,0,180,14).concat([[-8.6,-17],[12.2,-18.6]]));
      p.F(M.acc[2]); p.poly([[-8.4,-17.6],[-6.6,-22],[-4,-21],[-5,-17.4]]); p.rect(2.2,-27,0.9,8.4);
      p.F(M.acc[0]); p.poly([[3.6,-26.6],[9,-24.6],[11,-21],[6,-23]]); p.ell(2.6,-27.4,1.4,0.9);
      p.F(M.acc[2]); p.poly([[8.6,-20],[21,-18.8],[20.2,-16.6],[9,-17.4]]); p.F(M.acc[3]); p.poly([[9,-17.4],[20.2,-16.6],[19.4,-15.8],[9.4,-16.4]]); p.F(M.acc[1]); p.rect(10,-19.8,9,0.9); }
    if(c.acc==='bandana'){ p.F(M.acc[1]); p.poly([[-9,-16.4],[-7.6,-21.6],[1,-24],[10,-22],[12.8,-18.4],[10.4,-17],[1,-19],[-7.4,-14.4]]);
      p.F(M.acc[2]); p.poly([[-9,-16.4],[-7.4,-14.4],[1,-19],[10.4,-17],[10.8,-18],[1,-20],[-7.6,-16]]); p.F(M.acc[0]); [[-4,-20.6],[2,-21.6],[7,-20.4],[-1,-21.4]].forEach(([x,y])=>p.rect(x,y,1,1));
      p.F(M.acc[1]); p.ell(-9.4,-16.6,2,1.8); p.poly([[-10,-16],[-16,-11],[-14.4,-9.6],[-9.4,-14.6]]); p.poly([[-10,-17],[-16.6,-15.4],[-15.6,-13.6],[-9.6,-15.6]]); p.F(M.acc[2]); p.rect(-15.6,-11,2,1); }
    if(c.acc==='oculos'){ p.F(M.lens[1]); p.poly([[3.8,-16.2],[10.2,-16.4],[9.8,-11.6],[4.6,-11.4]]); p.poly([[10.6,-16],[13.4,-15.8],[13,-12],[10.8,-12]]);
      p.F(M.lens[0]); p.poly([[5,-15.6],[7,-15.6],[5.6,-12.6],[4.8,-12.6]]); p.rect(11.2,-15.4,0.9,1.6); p.F(M.metal[2]); p.rect(-3,-15.4,7,0.9); p.rect(10,-15.6,0.8,1); }
    if(c.acc==='fone'){ p.F(M.acc[2]); p.poly([[-8.8,-14],[-8.6,-22.6],[-2,-27.6],[5,-27.8],[5.6,-26.4],[-1.4,-25.6],[-6.6,-21.4],[-6.6,-14]]); p.F(M.acc[0]); p.rect(-4,-25.8,4,0.9);
      p.F(M.acc[1]); p.ell(-3.6,-12.6,3.8,4.6); p.F(M.acc[3]); p.ell(-2.4,-12.6,1.6,3.8); p.F(M.acc[0]); p.ell(-4.8,-14.2,1.2,1.4); }
    p.id();
  }
  // rastro do golpe: crescente grossa (luz no gume) com borda na cor da arma
  function drawSmear(p,M,sk,P,len){
    p.id(); const tip=lp(sk.wrF,P.aFe+P.bat-sk.ro,len+2), sh=sk.shF;
    const cur=Math.atan2(tip.x-sh.x,tip.y-sh.y)*180/Math.PI, r1=Math.hypot(tip.x-sh.x,tip.y-sh.y)+3;
    const sa=P.sa;
    const wide=P.smear>=3?20:14, n=14;
    const band=(rr0,rr1,col)=>{ const pts=[]; for(let k=0;k<=n;k++){ const a=sa+(cur-sa)*k/n; pts.push([sh.x+Math.sin(rad(a))*rr1, sh.y+Math.cos(rad(a))*rr1]); }
      for(let k=n;k>=0;k--){ const a=sa+(cur-sa)*k/n, t=k/n, rr=rr1-(rr1-rr0)*t*t; pts.push([sh.x+Math.sin(rad(a))*rr, sh.y+Math.cos(rad(a))*rr]); } p.F(col); p.poly(pts); };
    band(r1-wide,r1+1.6,M.trail[1]); band(r1-wide+3,r1,M.smear[1]); band(r1-5,r1-0.6,M.smear[0]);
  }
  function star(p,c,r,col,col2){ const pts=[]; for(let k=0;k<16;k++){ const a=k/16*Math.PI*2, rr=k%2?r*0.28:(k%4?r*0.62:r); pts.push([c.x+Math.cos(a)*rr,c.y+Math.sin(a)*rr]); } p.F(col); p.poly(pts); if(col2){ p.F(col2); p.circle(c,r*0.22); } }

  // contorno de baixo com 2 px (peso na base das formas)
  function thick(cv){ const g=cv.getContext('2d'), W=cv.width, H=cv.height, im=PIX.pix(cv), d=im.data, src=new Uint8ClampedArray(d);
    const isO=i=>src[i+3]>0&&src[i]===23&&src[i+1]===11&&src[i+2]===28;
    for(let y=2;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(src[i+3]) continue; const u=i-W*4, u2=u-W*4; if(isO(u)&&src[u2+3]&&!isO(u2)){ d[i]=23; d[i+1]=11; d[i+2]=28; d[i+3]=255; } }
    g.putImageData(im,0,0); }
  const cache=PIX.cache();
  function frame(cfg,anim,fi,step=5){
    const c=Object.assign({},DEFAULT,cfg), K=PIX.getK(), key=JSON.stringify(c)+anim+fi+step+'@'+K; if(cache.has(key)) return cache.get(key);
    if(cache.size>900) cache.delete(cache.keys().next().value);
    const A=ANIMS[anim]||ANIMS.idle; if(!ANIMS[anim]) anim='idle';
    const arm=c.arma==='pistola'||c.arma==='laser'?c.arma:'bastao', tier=c.tier||'comum';
    const kind=A.gunKind||(arm==='bastao'?null:arm);
    const P=poseOf(anim,fi,kind||undefined), sk=skeleton(P,c,kind);
    const T=BATON.TIERS[tier]||BATON.TIERS.comum;
    const M=Object.assign(mats(c),T.M,GUN.M(kind||'pistola',tier),{trail:ramp(kind?GUN.TIER[tier].glow[1]:T.cor)});
    const gA=sk.gAng!=null?sk.gAng:sk.bDir;
    const parts=[
      {back:true, draw:(cx,u)=>drawArm(mkPen(cx,u),M,c,sk.shB,sk.elB,sk.wrB)},
      {back:true, draw:(cx,u)=>{ const p=mkPen(cx,u); p.cx=cx; drawLeg(p,M,c,sk,false,P); }},
      {draw:(cx,u)=>{ const p=mkPen(cx,u); p.cx=cx; drawHairBack(p,M,sk,c); }},
      {draw:(cx,u)=>{ const p=mkPen(cx,u); p.cx=cx; drawTorso(p,M,sk,c,P); }},
      {draw:(cx,u)=>{ const p=mkPen(cx,u); p.cx=cx; drawLeg(p,M,c,sk,true,P); }},
      {draw:(cx,u)=>{ const p=mkPen(cx,u); p.cx=cx; drawHead(p,M,sk,P,c); }},
    ];
    if(P.inhand) parts.push({draw:(cx,u)=>{ const p=mkPen(cx,u); if(kind) GUN.draw(p,kind,tier,sk.wrF,gA); else BATON.draw(p,tier,sk.wrF,sk.bDir); }});
    if(P.smear) parts.push({noShade:true,smear:true,draw:(cx,u)=>P.kick?MOVESET.kickSmear(mkPen(cx,u),M,sk,P):drawSmear(mkPen(cx,u),M,sk,P,kind?16:T.len)});
    parts.push({draw:(cx,u)=>drawArm(mkPen(cx,u),M,c,sk.shF,sk.elF,sk.wrF)});
    if(P.match) parts.push({noShade:true,smear:true,draw:(cx,u)=>{ const p=mkPen(cx,u), w=sk.wrF, a=rad(P.aFe-sk.ro-60), d={x:Math.sin(a),y:-Math.cos(a)}, tip={x:w.x+4+d.x*7,y:w.y+d.y*7}; p.id();
      p.F('#e8d8b0'); p.cap({x:w.x+3,y:w.y},tip,1,1); p.F('#c83a2a'); p.circle(tip,1.3);
      if(P.match>=2){ const big=P.match>=3, f={x:tip.x+d.x*2,y:tip.y-2}; p.F('#ff7a2a'); p.ell(f.x,f.y-(big?2:1),big?4.4:3,big?6:4.2); p.F('#ffd23f'); p.ell(f.x,f.y-(big?1.4:0.6),big?2.8:1.9,big?4:2.8); p.F('#fffbe8'); p.ell(f.x,f.y,1.2,1.6);
        if(big) star(p,{x:f.x,y:f.y-1},9,'#ffd23f','#fffbe8'); } }});
    if(P.inhand) parts.push({draw:(cx,u)=>{ const p=mkPen(cx,u); fist(p,M,sk.elF,sk.wrF,c.corpo==='f'); }});
    // FX: clarão do cano, carga do laser, estrela de impacto
    if(kind && P.inhand && (P.mf>=0.5||P.chg>0.05)) parts.push({noShade:true,smear:true,draw:(cx,u)=>{ const p=mkPen(cx,u), mz=GUN.muzzle(kind,sk.wrF,gA), g=M.gglow; p.id();
      if(P.mf>=0.5){ const big=P.mf>=1.5; const d={x:Math.cos(gA),y:Math.sin(gA)}; const c0={x:mz.x+d.x*(big?6:4),y:mz.y+d.y*(big?6:4)};
        if(kind==='laser'){ p.F(g[1]); p.ell(c0.x,c0.y,big?9:6,big?7:5); p.F(g[0]); p.ell(c0.x,c0.y,big?5.6:3.6,big?4:2.8); star(p,c0,big?16:10,g[0]); }
        else { star(p,c0,13,M.smear[1]); p.F(M.smear[0]); p.ell(c0.x,c0.y,3.2,2.4); p.F(M.smear[1]); p.poly([[c0.x,c0.y-1.4],[c0.x+d.x*11,c0.y+d.y*11],[c0.x,c0.y+1.4]]); } }
      else { const r=1.6+P.chg*4.4; p.F(g[2]); p.circle(mz,r+1.4); p.F(g[1]); p.circle(mz,r); p.F(g[0]); p.circle(mz,r*0.5);
        if(P.chg>0.6){ p.F(g[1]); [[0,-1],[0.8,0.6],[-0.8,0.6]].forEach(([dx,dy])=>p.rect(mz.x+dx*(r+4),mz.y+dy*(r+4),1.2,1.2)); } } }});
    if(P.impact && !P.gun) parts.push({noShade:true,smear:true,draw:(cx,u)=>{ const p=mkPen(cx,u), t=P.kick?MOVESET.kickTip(sk,P):lp(sk.wrF,P.aFe+P.bat-sk.ro,T.len); p.id(); star(p,t,P.impact>=2?15:10,M.smear[1],M.smear[0]); }});
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM}); if(step>=4) thick(cv);
    const sc=q=>({x:q.x*K,y:q.y*K});
    cv._tip=sc(kind?GUN.muzzle(kind,sk.wrF,gA):lp(sk.wrF,P.aFe+P.bat-sk.ro,T.len)); cv._head=sc(sk.H(4.5,-33.6)); cv._hand=sc(sk.wrF);
    cache.set(key,cv); return cv;
  }
  return {FW,FH,GROUND,AX,CAT,OPT,DEFAULT,ANIMS,poseOf,frame,random,mats};
})();
