/* MALANDRO — fonte de arte (editável). Build: npm run art
   Zumbi Malandro (variante local da Lapa): boêmio da roda de samba do Rio antigo, morto e de pé de novo.
   Terno de linho branco amassado (paletó de ombro largo e calça vincada), sujo de barro e sangue, rasgado nas
   costas (costelas à mostra) e no joelho. Camisa de seda listrada (vinho sobre creme) na abertura da lapela,
   lenço de seda dourado amarrado no pescoço, chapéu panamá de palha com fita preta, tombado "de banda".
   Sapato bicolor (branco com biqueira e calcanhar pretos). Navalha de cabo de osso na mão da frente.
   Pele cinza-esverdeada, bigode fino, cicatriz no rosto, dente de ouro. Design próprio (não é figura religiosa).
   Golpes: navalhada em sequência (3 cortes), revés de navalha, rasteira (derruba; depois fica aberto ajeitando o
   terno), ginga (esquiva de lado) e chapéu arremessado (vai e volta, adereço xHat). Hi-bit: honra PIX.getK(). */
const MALANDRO=(function(){
  const {rad,lerp,P2,mkPen,compose}=PIX;
  const FW=196, FH=160, GROUND=150, AX=80;
  const RIM={comum:'#d8e4f4', enluarado:'#9ff6ff', plenilunar:'#ffb46a'};

  /* ---------- materiais ---------- */
  function mats(form){
    const m={
      skin:['#cbd8d0','#90a49c','#5e706e','#36404c'],
      vein:['#94b0c8','#5e7896','#3e5274','#262e50'],
      rot:['#b8b48e','#7e7a5e','#545252','#302a38'],
      flesh:['#f6ae94','#c25a5e','#7a3a4a','#4a1c34'],
      bone:['#fff4d8','#dccfa6','#a09070','#605040'],
      suit:['#fffbf0','#ece4cf','#b4a88f','#6e6258'],
      shirt:['#f6eedb','#d6c8aa','#988872','#5c4e45'],
      stripe:['#ec6c5e','#b43744','#76213b','#451327'],
      scarf:['#ffe47c','#eaa93b','#aa672b','#5f3519'],
      straw:['#fff3ca','#e3d099','#a9956b','#67563f'],
      band:['#5c5468','#2f2939','#1f1b27','#130f19'],
      shoeW:['#fffdf6','#f2efe8','#bcb8b4','#6e6a72'],
      shoeB:['#6c667a','#2d2935','#1d1923','#110d15'],
      steel:['#f6faff','#c5cdd9','#7b8599','#3f4559'],
      handle:['#fff8e5','#e1d5b1','#a59571','#635541'],
      hair:['#5c5462','#302b35','#1f1b23','#130f15'],
      eye:['#ffffff','#e6e8d8','#a8aca0','#686c66'],
      mouth:['#7c2e3e','#4c1828','#2e0c1a','#1a0610'],
      teeth:['#fbf0c0','#d8c27c','#9a8650','#5e4e30'],
      gold:['#fff7b2','#f1c141','#b17b1d','#6b4511'],
      dirt:['#caa97a','#95754f','#674d35','#3d2b1f'],
      blood:['#c84a3e','#8e2a2c','#5e1824','#3a0e1a'],
      nail:['#8a7a72','#54484a','#342a30','#1c161a'],
      glow:['#fffbe0','#e8ecb0','#a8b07a','#646c4a'],
      swish:['#fdfdff','#e6f0ff','#b4c4e8','#7484b0'],
    };
    if(form==='enluarado'){
      m.skin=['#dcdcff','#a0a2e4','#686cae','#3c3a76']; m.vein=['#a8f4ff','#4ad8f0','#2a8ab0','#1a4a7a'];
      m.rot=['#b8a6e0','#8470b0','#56468a','#33285e']; m.flesh=['#f0b0ff','#b866d8','#7a3a9e','#46206a']; m.blood=['#b46ad8','#7e3ea6','#542474','#34144a'];
      m.eye=['#ffffff','#b8fbff','#4ad8f0','#1a8aa8']; m.glow=['#effffe','#7af4ff','#2ab0d8','#146a96']; m.swish=['#ffffff','#c8fbff','#6ae4f4','#2a9ab8'];
      m.suit=['#eceefc','#b4b4da','#7676a6','#47456f']; m.shirt=['#e2dcf0','#aea6c8','#77709a','#463f66'];
      m.stripe=['#c896d8','#8e5aa8','#5e3a7e','#382054']; m.scarf=['#c8f8ff','#7ad8f0','#3a8ab8','#1e4a7a'];
      m.straw=['#eef4ff','#bac6e2','#7f8ab2','#4b5179']; m.dirt=['#a8a0c8','#76709a','#4e4a70','#2e2a48'];
      m.shoeB=['#6a6a9a','#33305a','#211e40','#130f28'];
    }
    if(form==='plenilunar'){
      m.skin=['#ffcaa6','#e2806a','#a4424e','#5e1e36']; m.vein=['#fff0a0','#ffb43a','#e0581e','#8a2414'];
      m.rot=['#d0806a','#9a4a4a','#682a3a','#3e1628']; m.flesh=['#ffc07a','#f06a3a','#a8302e','#5e1422']; m.blood=['#ff7a3a','#d43a26','#8a1c22','#4e0c18'];
      m.eye=['#fffbe0','#ffe04a','#ff8a2a','#b83a14']; m.glow=['#fff6c0','#ffb43a','#e0581e','#8a2414']; m.swish=['#fffbe6','#ffe6a8','#ffb460','#d0602a'];
      m.suit=['#f4dcc6','#cf9f88','#8e5b55','#53303a']; m.shirt=['#f0d4b4','#c49c7e','#865e52','#4c3030'];
      m.stripe=['#7c2a34','#561c28','#3a121e','#240a12']; m.scarf=['#ffd47c','#f28c3b','#b24b27','#63231b'];
      m.straw=['#ffe4b2','#ddaa79','#9d6b4f','#5f3b33']; m.band=['#e2483a','#a42430','#68142a','#3a0a1a'];
      m.dirt=['#b4705a','#844a3e','#5a2e2e','#36181e']; m.handle=['#fff4d0','#e8c08a','#a8784e','#664430'];
    }
    return punch(m);
  }
  const NAMES={skin:'Pele',vein:'Veias',rot:'Podridão',flesh:'Carne',bone:'Osso',suit:'Terno de linho',shirt:'Camisa',stripe:'Listras da camisa',scarf:'Lenço de seda',straw:'Palha do panamá',band:'Fita do chapéu',shoeW:'Sapato (branco)',shoeB:'Sapato (biqueira)',steel:'Lâmina da navalha',handle:'Cabo de osso',hair:'Cabelo/bigode',eye:'Olho',teeth:'Dentes',gold:'Dente de ouro',dirt:'Barro',blood:'Sangue',glow:'Brilho',swish:'Rastro do corte'};
  function sat(h,k){ const [r,g,b]=PIX.hexRgb(h), y=(r+g+b)/3; return PIX.toHex(y+(r-y)*k,y+(g-y)*k,y+(b-y)*k); }
  const NOPUNCH={swish:1,glow:1};
  function punch(m){ const o={}; for(const k in m){ const r=m[k]; o[k]=NOPUNCH[k]?[r[0],r[1],r[2],r[3]]:[sat(r[0],1.1),sat(r[1],1.16),PIX.mix(sat(r[2],1.1),'#2a1a4c',0.2),PIX.mix(r[3],'#140a24',0.34)]; } return o; }

  /* ---------- poses ---------- */
  // ângulos: 0 = pendurado, + = pra frente. rz = ângulo da navalha somado ao do antebraço; bl = lâmina dobrada (0 aberta).
  // ht = inclinação do chapéu; hat = chapéu na cabeça (>0,5); hh = chapéu na mão de trás; hloose/hdx/hdy/hdr = chapéu caído (morte).
  // smear = rastro da navalha; lsmear = rastro da perna (rasteira).
  const REST={hx:0,rot:0,lift:0,lean:3,hunch:8,head:-8,jaw:8,aFs:24,aFe:64,aBs:-12,aBe:8,rz:-60,bl:0,lFh:14,lFk:-4,lBh:-12,lBk:-22,fF:0,fB:0,ht:7,hat:1,hh:0,hloose:0,hdx:0,hdy:0,hdr:0,smear:0,lsmear:0,flash:0,drool:0};
  const S=Math.sin, C=Math.cos, PI=Math.PI, mx=Math.max;
  const ANIMS={
    idle:{nome:'Parado (gingado, gira a navalha)',n:8,dur:()=>150,pose:i=>{ const p=i/8*PI*2, s=S(p);
      return {hx:1.6*s, lean:3+2*S(p+0.6), hunch:8+1.5*S(2*p), head:-8+3*S(p-0.8), jaw:6+4*mx(0,S(p)), drool:i%4,
        aFs:24+6*s, aFe:64+10*S(p+0.4), rz:-60+46*mx(0,S(2*p)), aBs:-12-6*s, aBe:8+8*s,
        lFh:14+5*s, lFk:-4+6*s, lBh:-12-4*s, lBk:-22+4*s, fF:3*mx(0,s), ht:7+1.5*S(p-1)}; }},
    walk:{nome:'Andar malemolente',n:8,dur:()=>128,pose:i=>{ const p=i/8*PI*2;
      const lFh=12+18*S(p), lBh=-12+12*S(p+PI);
      return {lFh, lFk:lFh-22*mx(0,C(p))-3, lBh, lBk:lBh-10-12*mx(0,C(p+PI)), fF:-12*mx(0,C(p)), fB:22*mx(0,C(p+PI)),
        lean:4+3*S(p), hunch:8+2*S(2*p-0.6), head:-8+3*S(2*p-1.4), jaw:8+3*S(2*p-1.8), hx:1.4*S(p), lift:1.2*mx(0,S(2*p)),
        aFs:24+18*S(p+PI), aFe:64+14*S(p+PI), rz:-60+10*S(p), aBs:-12+20*S(p), aBe:8+18*S(p), ht:7+1.5*S(2*p), drool:i%4}; }},
    alert:{nome:'Alerta (ajeita o chapéu e abre a navalha)',n:7,dur:i=>[170,130,180,110,70,220,170][i],pose:i=>[
      {},
      {head:-2,jaw:14,lean:-2,aBs:150,aBe:186,hx:-1,rz:-40,bl:160},
      {head:2,jaw:20,lean:-3,aBs:156,aBe:196,ht:16,hx:-1,rz:-40,bl:160},
      {head:-2,jaw:22,lean:0,aBs:60,aBe:100,ht:14,aFs:70,aFe:130,rz:-150,bl:165},
      {head:-4,jaw:26,lean:2,aBs:30,aBe:60,ht:14,aFs:64,aFe:112,rz:-10,bl:0,smear:1},
      {head:-6,jaw:30,lean:-4,hx:-2,aBs:-30,aBe:-4,ht:12,aFs:58,aFe:100,rz:-30,lFh:18,lBh:-18},
      {jaw:18,ht:9,hx:-1}][i]},
    // ---- golpes (IA escolhe por distância/peso; hit = quadro(s) do dano, reach = alcance em px) ----
    attack:{nome:'Navalhada em sequência (3 cortes)',n:10,hit:[3,5,8],reach:36,dur:i=>[150,130,50,100,60,110,120,50,140,170][i],pose:i=>[
      {lean:-4,hunch:6,head:-4,jaw:16,aFs:100,aFe:150,rz:-20,aBs:30,aBe:60,hx:-2,lFh:18,lBh:-16},
      {lean:-10,hunch:4,head:0,jaw:24,aFs:150,aFe:196,rz:20,aBs:40,aBe:70,hx:-4,lFh:16,lFk:-8,lBh:-14,lBk:-26},
      {lean:14,hunch:14,head:-12,jaw:30,aFs:110,aFe:112,rz:-10,smear:1,hx:4,lFh:26,lFk:2,lBh:-20,lBk:-30},
      {lean:20,hunch:16,head:-14,jaw:12,aFs:66,aFe:36,rz:-30,smear:1,hx:6,lFh:28,lFk:4,lBh:-22,lBk:-32,fB:10},
      {lean:22,hunch:18,head:-12,jaw:16,aFs:20,aFe:-16,rz:-70,hx:5,lFh:26,lFk:2,lBh:-22,lBk:-32,fB:10},
      {lean:8,hunch:10,head:-4,jaw:34,aFs:122,aFe:152,rz:0,smear:1,hx:6,lFh:24,lBh:-20},
      {lean:-4,hunch:8,head:-6,jaw:20,aFs:-20,aFe:60,rz:30,hx:-1,lFh:16,lBh:-16},
      {lean:26,hunch:14,head:-14,jaw:40,aFs:86,aFe:90,rz:0,hx:10,lFh:34,lFk:8,lBh:-28,lBk:-36,fB:16,smear:1},
      {lean:30,hunch:16,head:-16,jaw:44,aFs:90,aFe:92,rz:2,hx:12,lFh:36,lFk:10,lBh:-30,lBk:-38,fB:18},
      {lean:10,hunch:10,head:-8,jaw:16,aFs:40,aFe:80,rz:-40,hx:3}][i]},
    rasteira:{nome:'Rasteira (derruba)',n:9,hit:5,reach:44,dur:i=>[150,120,120,60,60,140,160,160,150][i],pose:i=>[
      {lean:-6,hunch:4,head:-2,jaw:16,hx:-3,aFs:40,aFe:90,rz:-40,aBs:-40,aBe:-10,lFh:20,lFk:0,lBh:-24,lBk:-34,ht:12},
      {lean:14,hunch:12,head:-12,jaw:20,hx:-2,aFs:60,aFe:120,rz:-60,aBs:20,aBe:0,lFh:60,lFk:-20,lBh:50,lBk:-40,fB:10},
      {lean:6,hunch:10,head:-10,jaw:24,hx:-4,aFs:110,aFe:150,rz:-40,aBs:-20,aBe:-10,lFh:84,lFk:-6,lBh:100,lBk:-8,ht:14},
      {lean:-8,hunch:8,head:-4,jaw:30,hx:-6,aFs:130,aFe:160,rz:-30,aBs:-40,aBe:-24,lFh:50,lFk:56,lBh:100,lBk:-6,lsmear:1,fF:10,ht:16},
      {lean:-12,hunch:6,head:-2,jaw:36,hx:-7,aFs:136,aFe:166,rz:-30,aBs:-46,aBe:-28,lFh:66,lFk:76,lBh:100,lBk:-6,lsmear:1,fF:16,ht:16},
      {lean:-14,hunch:6,head:0,jaw:44,hx:-8,aFs:140,aFe:170,rz:-30,aBs:-50,aBe:-30,lFh:74,lFk:86,lBh:100,lBk:-6,lsmear:1,fF:20,ht:18},
      {lean:-12,hunch:6,head:-2,jaw:36,hx:-8,aFs:136,aFe:166,rz:-30,aBs:-48,aBe:-28,lFh:72,lFk:84,lBh:100,lBk:-6,fF:20,ht:18},
      {lean:12,hunch:12,head:-12,jaw:20,aFs:40,aFe:80,rz:-60,aBs:10,aBe:30,lFh:40,lFk:10,lBh:50,lBk:-30},
      {lean:12,hunch:12,head:-10,jaw:12,aFs:10,aFe:40,lFh:30,lFk:-4,lBh:10,lBk:-30}][i]},
    ginga:{nome:'Ginga (esquiva de lado)',n:7,dur:i=>[70,90,120,140,110,100,120][i],pose:i=>[
      {lean:-6,hunch:6,head:-4,jaw:14,hx:-3,aFs:50,aFe:100,rz:-40,aBs:-40,aBe:-10,lFh:18,lFk:-2,lBh:-22,lBk:-30},
      {lean:-20,hunch:2,head:4,jaw:22,hx:-8,aFs:80,aFe:130,rz:-30,aBs:-70,aBe:-40,lFh:30,lFk:8,lBh:-30,lBk:-46,fB:10,ht:14},
      {lean:-26,hunch:0,head:8,jaw:30,hx:-10,aFs:90,aFe:140,rz:-30,aBs:-80,aBe:-50,lFh:36,lFk:12,lBh:-34,lBk:-52,fB:14,ht:16},
      {lean:-22,hunch:2,head:6,jaw:34,hx:-9,aFs:84,aFe:132,rz:-30,aBs:-76,aBe:-44,lFh:34,lFk:10,lBh:-32,lBk:-50,fB:12,ht:16},
      {lean:-8,hunch:6,head:-2,jaw:26,hx:-4,aFs:50,aFe:96,rz:-40,aBs:-30,aBe:0,lFh:20,lBh:-20},
      {lean:6,hunch:8,head:-8,jaw:18,hx:1,aFs:30,aFe:70,aBs:-10,aBe:16,lFh:10,lBh:-8,ht:10},
      {}][i]},
    hatThrow:{nome:'Chapéu arremessado (vai e volta)',n:10,throwAt:3,catchAt:8,reach:84,dur:i=>[140,120,130,60,160,160,160,150,110,170][i],pose:i=>[
      {aBs:150,aBe:180,head:-2,jaw:12,lean:0,hx:-1},
      {aBs:-40,aBe:-70,lean:-6,hunch:6,head:-2,jaw:16,hx:-3,hat:0,hh:1,lFh:18,lBh:-18},
      {aBs:-70,aBe:-100,lean:-10,hunch:4,head:0,jaw:20,hx:-4,hat:0,hh:1,lFh:20,lBh:-22,lBk:-30},
      {aBs:96,aBe:96,lean:16,hunch:12,head:-10,jaw:30,hx:5,hat:0,hh:0,lFh:28,lFk:4,lBh:-24,lBk:-34,fB:10},
      {aBs:90,aBe:104,aFs:40,aFe:80,lean:10,hunch:10,head:-6,jaw:36,hx:3,hat:0,lFh:22,lBh:-20},
      {aBs:70,aBe:124,lean:2,hunch:8,head:-4,jaw:30,hat:0,hx:1},
      {aBs:76,aBe:142,lean:0,hunch:8,head:-2,jaw:24,hat:0},
      {aBs:110,aBe:140,lean:2,hunch:8,head:-4,jaw:20,hat:0},
      {aBs:124,aBe:152,lean:0,hunch:8,head:-4,jaw:26,hat:0,hh:1},
      {aBs:150,aBe:182,hat:1,hh:0,ht:14,jaw:14,head:-6}][i]},
    open:{nome:'Aberto (ajeita o terno depois da rasteira)',n:8,dur:i=>[200,220,180,180,180,220,220,200][i],pose:i=>[
      {lean:14,hunch:12,head:-10,jaw:10,lFh:30,lFk:-4,lBh:10,lBk:-30,aFs:10,aFe:40},
      {lean:6,hunch:12,head:-18,jaw:6,aBs:70,aBe:140,aFs:20,aFe:60,lFh:16,lBh:-10},
      {lean:4,hunch:14,head:-22,jaw:8,aBs:60,aBe:118,aFs:20,aFe:58},
      {lean:4,hunch:14,head:-20,jaw:6,aBs:72,aBe:150,aFs:22,aFe:60},
      {lean:4,hunch:14,head:-22,jaw:8,aBs:60,aBe:118,aFs:20,aFe:58},
      {lean:0,hunch:8,head:-4,jaw:10,aBs:150,aBe:186,ht:2},
      {lean:-2,hunch:6,head:-2,jaw:16,aBs:156,aBe:194,ht:13},
      {jaw:12}][i]},
    hurt:{nome:'Dano (cabeça)',n:4,dur:i=>[80,110,130,150][i],pose:i=>[
      {lean:-10,hunch:2,head:6,jaw:30,aFs:-10,aFe:30,rz:-20,aBs:-20,aBe:10,hx:-6,flash:1,lFh:14,lBh:-4,ht:-6},
      {lean:-6,hunch:4,head:2,jaw:26,aFs:0,aFe:40,rz:-30,aBs:-12,aBe:20,hx:-5,lFh:12,lBh:-6,ht:-2},
      {lean:0,hunch:6,head:-4,jaw:20,aFs:14,aFe:56,aBs:-12,aBe:12,hx:-2,ht:4},
      {lean:2,hunch:7,head:-7,jaw:10,hx:0}][i]},
    hurtB:{nome:'Dano (barriga, dobra)',n:4,dur:i=>[80,120,140,150][i],pose:i=>[
      {lean:30,hunch:26,head:6,jaw:40,aFs:50,aFe:20,rz:-30,aBs:44,aBe:14,hx:-8,flash:1,lFh:20,lFk:-14,lBh:-14,lBk:-30,ht:16},
      {lean:26,hunch:24,head:2,jaw:36,aFs:46,aFe:24,rz:-30,aBs:40,aBe:20,hx:-7,lFh:18,lFk:-12,lBh:-14,lBk:-28,ht:14},
      {lean:14,hunch:16,head:-6,jaw:24,aFs:36,aFe:60,aBs:20,aBe:40,hx:-3},
      {lean:5,hunch:9,head:-8,jaw:12,hx:-1}][i]},
    fall:{nome:'Derrubado',n:6,dur:i=>[90,90,90,110,140,260][i],pose:i=>[
      {lean:-12,hunch:2,head:4,jaw:34,aFs:-40,aFe:-20,rz:20,aBs:-46,aBe:-30,hx:-6,flash:1,lFh:20,lBh:0,ht:-8},
      {rot:-30,lean:-4,hunch:6,head:0,jaw:30,aFs:-60,aFe:-40,aBs:-70,aBe:-50,hx:-4,lFh:40,lFk:30,lBh:20,lBk:10,ht:-10},
      {rot:-62,lean:0,hunch:8,head:-4,jaw:28,aFs:-90,aFe:-70,aBs:-96,aBe:-80,hx:-6,lFh:50,lFk:40,lBh:30,lBk:24,ht:-12},
      {rot:-90,lean:4,hunch:10,head:-2,jaw:36,aFs:-110,aFe:-120,aBs:-100,aBe:-110,hx:2,lFh:40,lFk:10,lBh:30,lBk:4,ht:-14},
      {rot:-84,lean:2,hunch:12,head:-8,jaw:30,aFs:-120,aFe:-140,aBs:-104,aBe:-126,hx:2,lFh:46,lFk:20,lBh:34,lBk:10,ht:-12},
      {rot:-90,lean:0,hunch:10,head:-4,jaw:34,aFs:-130,aFe:-150,aBs:-110,aBe:-136,hx:2,lFh:40,lFk:6,lBh:26,lBk:0,ht:-14}][i]},
    getup:{nome:'Levantar (bate a poeira)',n:6,dur:i=>[200,170,170,160,160,150][i],pose:i=>[
      {rot:-90,lean:0,hunch:10,head:-4,jaw:34,aFs:-130,aFe:-150,aBs:-110,aBe:-136,hx:2,lFh:40,lFk:6,lBh:26,lBk:0,ht:-14},
      {rot:-60,lean:10,hunch:18,head:-16,jaw:24,aFs:-50,aFe:-10,aBs:-60,aBe:-20,hx:-8,lFh:90,lFk:10,lBh:70,lBk:0,ht:-6},
      {rot:-30,lean:20,hunch:22,head:-24,jaw:20,aFs:-10,aFe:10,aBs:-20,aBe:0,hx:-6,lFh:110,lFk:10,lBh:60,lBk:-60},
      {rot:0,lean:30,hunch:22,head:-28,jaw:20,aFs:30,aFe:10,aBs:20,aBe:4,hx:-4,lFh:78,lFk:-2,lBh:6,lBk:-86,fB:60},
      {rot:0,lean:12,hunch:14,head:-16,jaw:14,aFs:30,aFe:70,aBs:70,aBe:140,hx:-1,lFh:30,lFk:-12,lBh:-12,lBk:-34},
      {lean:4,hunch:9,head:-8,jaw:10,aBs:20,aBe:60}][i]},
    death:{nome:'Morte (o chapéu voa e rola)',n:8,dur:i=>[90,150,160,170,150,140,160,600][i],pose:i=>[
      {lean:-10,hunch:2,head:6,jaw:40,aFs:-34,aFe:-16,rz:30,aBs:-40,aBe:-24,hx:-5,flash:1,lFh:14,lBh:-4,ht:-10},
      {lean:-4,hunch:6,head:10,jaw:48,aFs:-10,aFe:4,aBs:-16,aBe:0,hx:-6,lFh:10,lBh:-8,hat:0,hloose:1,hdx:-10,hdy:44,hdr:-40},
      {lean:6,hunch:16,head:-2,jaw:46,aFs:4,aFe:6,aBs:0,aBe:2,hx:-4,lFh:40,lFk:-30,lBh:28,lBk:-50,fF:10,fB:30,hat:0,hloose:1,hdx:-22,hdy:36,hdr:-120},
      {lean:10,hunch:24,head:-8,jaw:48,aFs:6,aFe:4,aBs:2,aBe:0,hx:-2,lFh:14,lFk:-92,lBh:6,lBk:-96,fF:100,fB:100,hat:0,hloose:1,hdx:-32,hdy:16,hdr:-220},
      {rot:16,lean:12,hunch:28,head:-8,jaw:48,aFs:24,aFe:20,aBs:16,aBe:14,hx:0,lFh:2,lFk:-92,lBh:-6,lBk:-96,fF:90,fB:90,hat:0,hloose:1,hdx:-38,hdy:2,hdr:-300},
      {rot:50,lean:10,hunch:24,head:-12,jaw:44,aFs:70,aFe:90,aBs:56,aBe:76,hx:4,lFh:-20,lFk:-70,lBh:-28,lBk:-74,fF:60,fB:60,hat:0,hloose:1,hdx:-44,hdy:6,hdr:-340},
      {rot:86,lean:2,hunch:12,head:-4,jaw:40,aFs:150,aFe:170,aBs:110,aBe:150,hx:8,lFh:-4,lFk:-10,lBh:-8,lBk:-14,fF:10,fB:10,hat:0,hloose:1,hdx:-48,hdy:0,hdr:-356},
      {rot:90,lean:0,hunch:10,head:0,jaw:42,aFs:160,aFe:176,aBs:116,aBe:156,hx:8,lFh:-2,lFk:-6,lBh:-6,lBk:-10,fF:6,fB:6,hat:0,hloose:1,hdx:-50,hdy:0,hdr:-360,drool:3}][i]},
    // adereço: o chapéu girando no ar (desenhado pelo motor como ator extra; âncora em cv._ax/_gy)
    xHat:{nome:'Chapéu voando (adereço)',n:4,prop:true,dur:()=>60,pose:i=>({st:i})},
  };
  const EXK=['hx','lean','hunch','head','aFs','aFe','aBs','aBe','lFh','lFk','lBh','lBk'];
  function exag(P,f){ if(f===1||Math.abs(P.rot)>4) return P; EXK.forEach(k=>{ P[k]=REST[k]+(P[k]-REST[k])*f; }); P.jaw=Math.min(58,mx(0,REST.jaw+(P.jaw-REST.jaw)*f)); return P; }
  const EXF={idle:1.06,walk:1.1,alert:1.12,attack:1.18,rasteira:1.08,ginga:1.15,hatThrow:1.12,open:1.05,hurt:1.3,hurtB:1.25,fall:1.1,getup:1.08,death:1.1};
  ZREACT.add(ANIMS,REST,{moves:{backhand:["swipe","Revés de navalha"]}}); // reações (voando, agarrado) + golpe extra
  function poseOf(anim,i){ const A=ANIMS[anim]; if(A&&A.prop) return Object.assign({},REST,A.pose(i)); return exag(Object.assign({},REST,A.pose(i)),EXF[anim]||1); }
  function heavyOutline(cv){ const g=cv.getContext('2d'), W=cv.width, H=cv.height, im=PIX.pix(cv), d=im.data;
    const isO=i=>d[i+3]===255&&d[i]===0x17&&d[i+1]===0x0b&&d[i+2]===0x1c, fill=i=>d[i+3]===255&&!isO(i);
    const add=[]; for(let y=2;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(d[i+3]) continue; const u=((y-1)*W+x)*4, u2=((y-2)*W+x)*4; if(isO(u)&&fill(u2)) add.push(i); }
    add.forEach(i=>{ d[i]=0x17; d[i+1]=0x0b; d[i+2]=0x1c; d[i+3]=255; }); g.putImageData(im,0,0); }

  /* ---------- esqueleto (magro, ombro de paletó largo, peito pra fora) ---------- */
  const SPINE=42, TH=21.5, SH=20.5, UA=15.6, FA=14.4, VS=SPINE/37, US=1.16, HB=10, HS=1.2;
  const lp=(p,a,L)=>({x:p.x+Math.sin(rad(a))*L, y:p.y+Math.cos(rad(a))*L});
  function build(P,dy){
    const R=P.rot, hip={x:AX+P.hx, y:dy};
    const ra=rad(R), rc=Math.cos(ra), rs=Math.sin(ra);
    const HR=(lx,ly)=>({x:hip.x+lx*rc-ly*rs, y:hip.y+lx*rs+ly*rc});
    const hipF=HR(3,0), hipB=HR(-3,0);
    const kneeF=lp(hipF,P.lFh-R,TH), ankleF=lp(kneeF,P.lFk-R,SH), kneeB=lp(hipB,P.lBh-R,TH), ankleB=lp(kneeB,P.lBk-R,SH);
    const SS=[]; let x=hip.x, y=hip.y;
    for(let k=0;k<=SPINE;k++){ const t=k/SPINE, a=rad(R+P.lean+(P.hunch+HB)*Math.pow(t,1.3)); SS.push({x,y,a}); x+=Math.sin(a); y-=Math.cos(a); }
    // v>0 = abaixo do quadril (barra do paletó): prolonga a direção da base da coluna
    const SP=(u,v)=>{ if(v>0){ const s=SS[0], a=s.a, px=s.x-Math.sin(a)*v, py=s.y+Math.cos(a)*v; return {x:px+Math.cos(a)*u, y:py+Math.sin(a)*u}; }
      const f=-v, k=Math.min(SPINE,Math.floor(f)), s=SS[k], r=f-k, a=s.a;
      const px=s.x+Math.sin(a)*r, py=s.y-Math.cos(a)*r; return {x:px+Math.cos(a)*u, y:py+Math.sin(a)*u}; };
    const T=(u,v)=>SP(u*US,v*VS);
    const top=SS[SPINE], neck=T(1,-37), sa=top.a;
    const shF=T(-1.4,-31.6), shB=T(-6.4,-32.4);
    const elF=lp(shF,P.aFs-R,UA), wrF=lp(elF,P.aFe-R,FA), elB=lp(shB,P.aBs-R,UA), wrB=lp(elB,P.aBe-R,FA);
    const ha=sa+rad(P.head-HB*0.8), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:neck.x+(lx*hc-ly*hs)*HS, y:neck.y+(lx*hs+ly*hc)*HS});
    // navalha: punho -> cabo -> lâmina (dobrável no pino)
    const fa=Math.atan2(wrF.x-elF.x,wrF.y-elF.y)*180/PI, za=rad(fa+P.rz), zd={x:Math.sin(za),y:Math.cos(za)};
    const zh={x:wrF.x+(wrF.x-elF.x)/FA*5, y:wrF.y+(wrF.y-elF.y)/FA*5};
    const zp={x:zh.x+zd.x*6.4, y:zh.y+zd.y*6.4}, ba=za+rad(P.bl), bd={x:Math.sin(ba),y:Math.cos(ba)};
    const ztip={x:zp.x+bd.x*13, y:zp.y+bd.y*13};
    const toe=(a,f)=>{ const t=rad(f+R); return {x:a.x+(11*Math.cos(t)-5*Math.sin(t))*1.3, y:a.y+(11*Math.sin(t)+5*Math.cos(t))*1.3}; };
    const hull=[[ankleF,6],[ankleB,6],[toe(ankleF,P.fF),0.8],[toe(ankleB,P.fB),0.8],[kneeF,5],[kneeB,5],[hip,9],[T(0,-18),11],[T(-2,-30),11],[H(3,-11),11],[wrF,4],[wrB,4],[elF,4],[elB,4]];
    return {R,hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,SP,T,sa,neck,shF,shB,elF,wrF,elB,wrB,ha,H,hull,ra,zh,zd,zp,bd,ztip,toeF:toe(ankleF,P.fF)};
  }
  function skeleton(P){
    const a=build(P,0); let m=-1e9; a.hull.forEach(([p,r])=>{ m=Math.max(m,p.y+r); });
    return build(P,GROUND-m-(P.lift||0));
  }

  /* ---------- utilitários ---------- */
  const LV={x:0.55,y:-0.83};
  function sideN(a,b){ const dx=b.x-a.x, dy=b.y-a.y, L=Math.hypot(dx,dy)||1; let nx=-dy/L, ny=dx/L; if(nx*LV.x+ny*LV.y>0){ nx=-nx; ny=-ny; } return {nx,ny,L}; }
  function limb(p,R,a,b,wa,wb,o){ o=o||{};
    p.F(R[1]); p.cap(a,b,wa,wb);
    const {nx,ny}=sideN(a,b), sh=o.sh!=null?o.sh:0.6;
    const ka=wa*(0.5-sh/2), kb=wb*(0.5-sh/2);
    p.F(R[2]); p.cap({x:a.x+nx*ka,y:a.y+ny*ka},{x:b.x+nx*kb,y:b.y+ny*kb},wa*sh,wb*sh);
    if(o.deep!==false){ const k2a=wa*0.33, k2b=wb*0.33; p.F(R[3]); p.cap({x:a.x+nx*k2a,y:a.y+ny*k2a},{x:b.x+nx*k2b,y:b.y+ny*k2b},wa*0.3,wb*0.3); }
    if(o.hi!==false){ const e=lerp(a,b,o.hl!=null?o.hl:0.7), ha=wa*0.22, hb=wb*0.22; p.F(R[0]); p.cap({x:a.x-nx*ha,y:a.y-ny*ha},{x:e.x-nx*hb,y:e.y-ny*hb},wa*0.18,wb*0.16); }
    return {nx,ny};
  }
  function clip(c,pts,fn){ c.save(); c.beginPath(); pts.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])); c.closePath(); c.clip(); fn(); c.restore(); }
  const W=(sk,list)=>list.map(([u,v])=>{ const q=sk.T(u,v); return [q.x,q.y]; });
  const Wp=(sk,u,v)=>sk.T(u,v);
  const off=(q,n,k)=>({x:q.x+n.nx*k,y:q.y+n.ny*k});

  /* ---------- chapéu panamá (coordenadas locais: origem no centro da aba, x pra frente) ---------- */
  // o: {kx: posição do laço (-7.5 = atrás), sx: escala da copa (giro), dip: quanto a aba cai na frente}
  function drawHat(c,p,M,form,o){
    o=o||{}; const sx=o.sx!=null?o.sx:1, kx=o.kx!=null?o.kx:-7.6, dip=o.dip!=null?o.dip:2.6;
    const brim=(dy,k)=>{ const pts=[]; for(let i=0;i<24;i++){ const a=i/24*PI*2, ca=Math.cos(a); pts.push([ca*17*k, Math.sin(a)*3.4*k+dy+(ca>0.35?(ca-0.35)*dip:0)+(ca<-0.6?(ca+0.6)*0.8:0)]); } return pts; };
    // aba: espessura de baixo, face de cima, borda desfiada
    p.F(M.straw[2]); p.poly(brim(1.3,1));
    p.F(M.straw[1]); p.poly(brim(0,1));
    clip(c,brim(0,1),()=>{ p.F(M.straw[2]); p.poly([[-18,-1.6],[-6,-1.6],[-6,6],[-18,6]]); p.F(M.straw[0]); p.poly([[6,2.2],[17,0.6],[17,2.4],[7,3.6]]);
      p.F(M.straw[2]); for(let k=0;k<10;k++){ const x=-14+k*3.2; p.rect(x,-3+(k%2)*0.6,0.5,5.6); } });
    p.F(M.straw[3]); p.poly([[-14.4,-0.2],[-12.2,-1.2],[-11,0.4],[-12.8,1.4]]); // buraco na aba
    p.F(M.straw[2]); [[9.6,4.2],[12.6,3.6],[4,4.6]].forEach(([x,y])=>p.poly([[x,y],[x+1.4,y],[x+0.8,y+1.4]])); // palha desfiada
    // copa com vinco no meio (pinça na frente)
    const crown=[[-9.4,0.4],[-9.6,-4.6],[-8.6,-8.6],[-5.4,-10.6],[-1.6,-10],[1,-8.8],[3.6,-10.4],[7.4,-9.8],[9.6,-6.6],[9.8,0.6],[6,1.6],[0,2],[-6,1.6]].map(([x,y])=>[x*sx,y]);
    p.F(M.straw[1]); p.poly(crown);
    clip(c,crown,()=>{
      p.F(M.straw[2]); p.poly([[-11,-12],[-4.6*sx,-12],[-5.6*sx,3],[-11,3]]);
      p.F(M.straw[3]); p.poly([[-11,-12],[-8.2*sx,-12],[-8.6*sx,3],[-11,3]]);
      p.F(M.straw[0]); p.poly([[2*sx,-9.8],[7.2*sx,-9.4],[8.8*sx,-6.4],[6*sx,-8]]);
      p.F(M.straw[2]); p.poly([[-5*sx,-9.8],[-1.6*sx,-9.2],[0.8*sx,-8],[-1.4*sx,-8.4]]); // vinco
      p.F(M.straw[2]); for(let r=0;r<2;r++) for(let k=0;k<7;k++){ const x=(-6+k*2.6+(r%2)*1.3)*sx; p.rect(x,-7.6+r*1.8,0.7,0.6); } // trama
      // fita preta
      p.F(M.band[1]); p.poly([[-11,-2.6],[11,-2.6],[11,3],[-11,3]]);
      p.F(M.band[0]); p.poly([[-2*sx,-2.6],[9.8*sx,-2.6],[9.8*sx,-2],[-2*sx,-2]]);
      p.F(M.band[2]); p.poly([[-11,-0.4],[-3*sx,0.4],[-3*sx,3],[-11,3]]);
      p.F(M.dirt[1]); p.ell(-2.6*sx,-5.6,2.2,1.3); p.F(M.dirt[2]); p.rect(-3.4*sx,-5.2,1.2,0.8);
    });
    // laço da fita (gira junto com a copa)
    if(Math.abs(kx)<10.5){ const x=kx*sx;
      p.F(M.band[2]); p.poly([[x-1.8,-3.6],[x+1.8,-3.6],[x+1.2,-0.4],[x-1.2,-0.4]]);
      p.F(M.band[1]); p.poly([[x-0.6,-3.2],[x+0.6,-3.2],[x+1.4,1.8],[x+0.2,2.6],[x-0.4,-0.6]]);
      p.F(M.band[0]); p.rect(x-1.2,-3.4,1.6,0.6); }
    if(form==='plenilunar'){ p.F(M.blood[1]); p.poly([[3,-3.8],[5.6,-3.8],[5,-0.6],[4.4,1.6],[3.6,-1]]); p.F(M.blood[1]); p.ell(9,2.8,1.6,0.8); }
    else { p.F(M.blood[1]); p.ell(9,2.8,1.4,0.7); }
    if(form==='enluarado'){ p.F(M.glow[1]); p.rect(-6*sx,-9.6,2.4,0.6); }
  }
  function hatAt(c,p,M,form,ox,oy,ang,sc,o){ p.xf(ang,ox,oy); c.scale(sc,sc); drawHat(c,p,M,form,o); p.id(); }

  /* ---------- navalha ---------- */
  function drawRazor(p,M,sk,P,form){
    const h=sk.zh, d=sk.zd, zp=sk.zp, bd=sk.bd, tip=sk.ztip;
    const b0={x:h.x-d.x*2.6,y:h.y-d.y*2.6};
    // cabo de osso (curvo, com dois pinos)
    p.F(M.handle[1]); p.cap(b0,zp,3,2.6);
    const n=sideN(b0,zp); p.F(M.handle[2]); p.cap(off(b0,n,0.7),off(zp,n,0.7),1.2,1);
    p.F(M.handle[0]); p.cap(off(lerp(b0,zp,0.25),n,-0.7),off(lerp(b0,zp,0.8),n,-0.7),0.6,0.5);
    p.F(M.steel[2]); p.rect(zp.x-0.6,zp.y-0.6,1.2,1.2);
    // lâmina larga de ponta quadrada: o fio fica do lado de baixo (normal "n2")
    const n2=sideN(zp,tip), side=(n2.nx*d.x+n2.ny*d.y)>0?-1:1, w0=1.4, w1=4.6;
    const eA={x:zp.x+n2.nx*side*w0,y:zp.y+n2.ny*side*w0}, eB={x:tip.x+n2.nx*side*w1,y:tip.y+n2.ny*side*w1};
    const blade=[[zp.x,zp.y],[tip.x,tip.y],[eB.x,eB.y],[eA.x,eA.y]];
    p.F(M.steel[1]); p.poly(blade);
    p.F(M.steel[2]); p.poly([[lerp(zp,eA,0.5).x,lerp(zp,eA,0.5).y],[lerp(tip,eB,0.45).x,lerp(tip,eB,0.45).y],[eB.x,eB.y],[eA.x,eA.y]]);
    p.F(M.steel[0]); p.cap(lerp(zp,tip,0.2),lerp(zp,tip,0.92),0.6,0.6); // dorso polido
    p.F(M.steel[3]); p.poly([[eA.x,eA.y],[eB.x,eB.y],[lerp(eB,tip,0.15).x,lerp(eB,tip,0.15).y]]);
    // sangue no fio
    p.F(M.blood[1]); const s1=lerp(eA,eB,0.55), s2=lerp(eA,eB,0.92); p.poly([[s1.x,s1.y],[s2.x,s2.y],[lerp(s2,tip,0.3).x,lerp(s2,tip,0.3).y],[lerp(s1,zp,0.2).x,lerp(s1,zp,0.2).y]]);
    if(form!=='comum'){ p.F(M.glow[1]); p.cap(lerp(eA,eB,0.2),lerp(eA,eB,0.5),0.5,0.5); }
    // espiga (gancho do polegar)
    p.F(M.steel[2]); const tg=lerp(zp,eA,0.9); p.poly([[zp.x,zp.y],[tg.x-d.x*2,tg.y-d.y*2],[tg.x-d.x*2.6+n2.nx*side*0.8,tg.y-d.y*2.6+n2.ny*side*0.8]]);
  }

  /* ---------- braços: manga do paletó, punho listrado ---------- */
  function drawArm(c,u,M,sk,P,front,form){
    const p=mkPen(c,u), sh=front?sk.shF:sk.shB, el=front?sk.elF:sk.elB, wr=front?sk.wrF:sk.wrB; p._c=c; p.id();
    const sn=sideN(sh,el);
    if(!front){
      // braço de trás: manga rasgada no antebraço, pele podre com veias
      const n=limb(p,M.skin,el,wr,9.8,8.4,{});
      p.F(M.vein[1]); const v0=lerp(el,wr,0.3), v1=lerp(el,wr,0.85); p.cap(off(v0,n,-1.2),off(v1,n,-1.6),0.7,0.5);
      p.F(M.rot[1]); const r1=lerp(el,wr,0.5); p.ell(r1.x+n.nx*1.2,r1.y+n.ny*1.2,1.6,1.1);
      limb(p,M.suit,sh,el,12.6,11.4,{hl:0.6});
      const e2=lerp(el,wr,0.42); limb(p,M.suit,el,e2,11.4,11,{hi:false});
      const en=sideN(el,wr), ed={x:(wr.x-el.x)/en.L,y:(wr.y-el.y)/en.L};
      p.F(M.suit[3]); for(let k=-2;k<=2;k++){ const b={x:e2.x+en.nx*k*2.2,y:e2.y+en.ny*k*2.2}, L=k%2?2.4:1.2; p.poly([[b.x-en.nx,b.y-en.ny],[b.x+en.nx,b.y+en.ny],[b.x+ed.x*L,b.y+ed.y*L]]); }
    } else {
      limb(p,M.suit,sh,el,12.8,11.6,{hl:0.6});
      const n=limb(p,M.suit,el,wr,11.2,9.8,{hl:0.6});
      // punho da camisa listrada saindo da manga
      const cf=lerp(el,wr,0.98), cf0=lerp(el,wr,0.86);
      p.F(M.shirt[1]); p.cap(cf0,cf,8.6,8.4); p.F(M.stripe[1]); p.cap(off(cf0,n,-1.6),off(cf,n,-1.6),1,1); p.cap(off(cf0,n,1.6),off(cf,n,1.6),1,1);
      p.F(M.suit[2]); p.cap(off(lerp(el,wr,0.8),n,-5),off(lerp(el,wr,0.8),n,5),1.2,1.2); // barra da manga
      p.F(M.dirt[1]); const dm=lerp(el,wr,0.4); p.ell(dm.x+n.nx*2,dm.y+n.ny*2,1.8,1.2);
    }
    // dobras do linho no cotovelo
    p.F(M.suit[2]); const c1=lerp(sh,el,0.86); p.cap(off(c1,sn,-4),off(c1,sn,1),0.8,0.7);
    const c2=lerp(sh,el,0.62); p.cap(off(c2,sn,2),off(c2,sn,5),0.8,0.7);
    p.F(M.suit[0]); const c3=lerp(sh,el,0.3); p.cap(off(c3,sn,-4.4),off(c3,sn,-1.6),0.7,0.6);
    if(front){ p.F(M.blood[1]); const b=lerp(sh,el,0.5); p.ell(b.x+sn.nx*2.6,b.y+sn.ny*2.6,1.4,1); p.rect(b.x+sn.nx*1-0.5,b.y+sn.ny*1+1,1,1); }
    if(front){ drawRazor(p,M,sk,P,form); drawFist(p,M,el,wr); }
    else { drawHandB(p,M,el,wr,P); if(P.hh>=0.5){ const ang=Math.atan2(wr.y-el.y,wr.x-el.x); const hpos={x:wr.x+(wr.x-el.x)/FA*7,y:wr.y+(wr.y-el.y)/FA*7}; hatAt(c,p,M,form,hpos.x,hpos.y,ang+PI/2,0.82,{dip:1.6}); } }
  }
  function drawFist(p,M,el,wr){
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y); p._c.scale(1.3,1.3);
    p.F(M.skin[1]); p.poly([[-1,-3.4],[4.4,-3.8],[6,-1],[5.6,3.4],[-1,3.6]]);
    p.F(M.skin[2]); p.poly([[-1,1.4],[5.8,1.2],[5.6,3.4],[-1,3.6]]);
    p.F(M.skin[0]); p.rect(0.4,-3.2,3.6,0.9);
    for(let k=0;k<4;k++){ const y0=-2.8+k*1.9; p.F(M.skin[1]); p.ell(6,y0,1.7,1.05); p.F(M.skin[2]); p.rect(5.4,y0+0.4,1.6,0.5); p.F(M.nail[1]); p.rect(6.6,y0-0.4,0.8,0.7); }
    p.F(M.skin[1]); p.cap(P2(1.6,-3.2),P2(5,-4.6),1.8,1.4); p.F(M.skin[3]); p.rect(2,0.6,3,0.6);
    p.F(M.gold[1]); p.rect(3,-3.6,1.4,1.2); p.F(M.gold[0]); p.rect(3.2,-3.6,0.6,0.5); // anel de ouro
    p.id();
  }
  function drawHandB(p,M,el,wr,P){
    // mão aberta, dedos compridos (gesto, pega o chapéu)
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y); p._c.scale(1.28,1.28);
    p.F(M.skin[1]); p.poly([[-1,-3],[4.4,-3.2],[5.4,2.8],[-1,3.2]]);
    p.F(M.skin[2]); p.poly([[-1,1],[5.2,1],[5.4,2.8],[-1,3.2]]);
    [[-2.4,9.4],[-0.8,10.4],[0.8,10],[2.4,8.6]].forEach(([y,L])=>{ p.F(M.skin[1]); p.cap(P2(4.4,y),P2(L,y+0.4),1.6,1.2); p.F(M.nail[1]); p.rect(L-0.6,y-0.2,0.9,0.8); });
    p.F(M.skin[1]); p.cap(P2(2,-3),P2(5,-5.6),1.8,1.3); p.F(M.skin[0]); p.rect(0.4,-2.8,3.4,0.8);
    p.id();
  }

  /* ---------- pernas: calça de linho vincada, sapato bicolor ---------- */
  function drawLeg(c,u,M,sk,P,front){
    const p=mkPen(c,u), hip=front?sk.hipF:sk.hipB, knee=front?sk.kneeF:sk.kneeB, ank=front?sk.ankleF:sk.ankleB; p.id();
    // meia escura aparecendo no tornozelo
    p.F(M.band[2]); p.cap(lerp(knee,ank,0.86),ank,7,6.6);
    const nS=limb(p,M.suit,knee,lerp(knee,ank,0.94),12,11.6,{hl:0.5});
    const nT=limb(p,M.suit,hip,knee,13.8,12.4,{hl:0.55});
    p.F(M.suit[1]); p.circle(knee,6);
    p.F(M.suit[0]); p.cap(off(lerp(hip,knee,0.1),nT,-3.6),off(knee,nT,-3.2),0.7,0.7); // vinco
    p.cap(off(knee,nS,-3),off(lerp(knee,ank,0.86),nS,-3.2),0.7,0.7);
    // quebra da barra em cima do sapato
    const cb=lerp(knee,ank,0.9); p.F(M.suit[2]); p.cap(off(cb,nS,-6),off(cb,nS,6),1.4,1.4);
    p.F(M.suit[3]); p.cap(off(lerp(knee,ank,0.95),nS,-6),off(lerp(knee,ank,0.95),nS,6),0.9,0.9);
    // dobras amassadas
    p.F(M.suit[2]); const f1=lerp(hip,knee,0.5), f2=lerp(knee,ank,0.45);
    p.cap(off(f1,nT,1.4),off(lerp(hip,knee,0.66),nT,4.6),0.8,0.7); p.cap(off(f2,nS,1),off(lerp(knee,ank,0.6),nS,4),0.8,0.7);
    if(front){ // rasgo no joelho com pele podre + barro na canela
      const k0=lerp(hip,knee,0.94); p.F(M.suit[3]); p.poly([[k0.x+nT.nx*3.6,k0.y+nT.ny*3.6],[k0.x-1,k0.y-2],[k0.x-nT.nx*2,k0.y-nT.ny*2+1],[k0.x+1.4,k0.y+3],[k0.x+nT.nx*2,k0.y+nT.ny*2+2.4]]);
      p.F(M.skin[2]); p.ell(k0.x+nT.nx*0.6,k0.y+nT.ny*0.6+0.4,1.8,1.4); p.F(M.rot[1]); p.rect(k0.x,k0.y,1,1);
      p.F(M.dirt[1]); const d0=lerp(knee,ank,0.7); p.ell(d0.x+nS.nx*2.4,d0.y+nS.ny*2.4,2.4,1.6); p.F(M.dirt[2]); p.rect(d0.x+nS.nx*3,d0.y+nS.ny*3,1.2,1);
      p.F(M.blood[2]); const b0=lerp(hip,knee,0.4); p.ell(b0.x+nT.nx*2.8,b0.y+nT.ny*2.8,1.4,2.2);
    } else { p.F(M.dirt[2]); const d0=lerp(knee,ank,0.6); p.ell(d0.x,d0.y,2,1.4); }
    // sapato bicolor: gáspea branca, biqueira e calcanhar pretos de verniz, sola fina
    const fa=rad((front?P.fF:P.fB)+sk.R); p.xf(fa,ank.x,ank.y); c.scale(1.3,1.3);
    p.F(M.shoeW[1]); p.poly([[-3.4,-1.8],[2.6,-2],[6.6,0.4],[10.4,1.6],[11.4,3.4],[-3.8,3.4]]);
    p.F(M.shoeW[2]); p.poly([[-3.8,2],[11,2.2],[11.4,3.4],[-3.8,3.4]]);
    p.F(M.shoeW[0]); p.poly([[0,-1.6],[2.6,-1.8],[6.4,0.4],[6.2,1.2],[2.4,-0.4],[0,-0.6]]);
    p.F(M.shoeB[1]); p.poly([[6.8,0.5],[10.4,1.6],[11.4,3.4],[7.4,3.4],[6.6,2]]); // biqueira
    p.F(M.shoeB[1]); p.poly([[-3.4,-1.8],[-0.8,-1.9],[0.2,0.6],[-0.4,3.4],[-3.8,3.4]]); // calcanhar
    p.F(M.shoeB[0]); p.rect(8.4,1.4,1.4,0.6); p.rect(-2.8,-1,1,0.6);
    p.F(M.shoeB[2]); p.poly([[-4.4,3.4],[11.8,3.4],[11.6,4.6],[-4.2,4.6]]); p.F(M.shoeB[3]); p.rect(-4.2,4.6,3.6,0.8);
    p.F(M.shoeB[2]); [[3.2,-1],[4.6,-0.4],[5.8,0.2]].forEach(([x,y])=>p.rect(x,y,0.8,0.7)); // cadarço
    p.F(M.shoeW[3]); p.poly([[6.6,0.4],[6.8,0.5],[6.6,2],[7.4,3.4],[7,3.4],[6.2,2]]); // costura da biqueira
    p.F(M.dirt[1]); p.ell(4,2.6,1.6,0.8); if(front){ p.F(M.blood[1]); p.rect(1.6,0.4,1,1.2); }
    p.id();
  }
  function drawLegSmear(c,u,M,sk,P){
    const p=mkPen(c,u); p.id();
    const h=sk.hipF, t=sk.toeF, r=Math.hypot(t.x-h.x,t.y-h.y)+2, a1=Math.atan2(t.y-h.y,t.x-h.x);
    const n=10, pts=[]; for(let i=0;i<=n;i++){ const a=a1+1.1*i/n; pts.push([h.x+Math.cos(a)*r,Math.min(GROUND,h.y+Math.sin(a)*r)]); }
    for(let i=n;i>=0;i--){ const a=a1+1.1*i/n, rr=r-2.4-6*(i/n); pts.push([h.x+Math.cos(a)*rr,Math.min(GROUND,h.y+Math.sin(a)*rr)]); }
    p.F(M.swish[1]); p.poly(pts);
    p.F(M.dirt[0]); [[0,0],[-8,1],[-15,0.6]].forEach(([dx,dy])=>p.ell(t.x+dx,GROUND-2+dy,2.4,1.4)); // poeira rente ao chão
  }

  /* ---------- tronco: paletó de linho branco (peito estufado), camisa listrada, lapela, lenço ---------- */
  // frente do peito vai até u≈14 (peito pra fora, pose de malandro); a abertura (V) fica na frente do braço
  const JACKET=[[-9.4,9.6],[-9.6,0],[-10,-10],[-10.6,-20],[-11.4,-28],[-11,-33.4],[-8,-37.4],[-2,-39.4],[4.6,-39],[9.6,-36.4],[12.8,-31],[14,-24],[13.6,-17],[12.8,-10],[12.6,-2],[13,6],[12,10.4],[7,9.2],[3,10.8],[-1,9.2],[-5,10.6]];
  const OPEN=[[5.4,-39],[9.8,-36.4],[12.8,-31],[13.8,-24.6],[13.6,-17],[12.8,-10],[12.6,-2.6],[9.4,-2],[9.2,-10],[8.8,-18],[7.8,-27],[6.4,-34]];
  function drawTorso(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    const shape=W(sk,JACKET);
    p.F(M.suit[1]); p.poly(shape);
    clip(c,shape,()=>{
      // volumes: luz no peito e no ombro, sombra só na faixa das costas e na barra
      p.F(M.suit[0]); p.poly(W(sk,[[2,-34],[6,-40],[13,-33],[15,-24],[14,-16],[11,-18],[7,-28]]));
      p.F(M.suit[0]); p.poly(W(sk,[[-4,-38],[2,-40],[3,-36],[-3,-35]]));
      p.F(M.suit[2]); p.poly(W(sk,[[-14,12],[-14,-40],[-7.4,-40],[-8.4,-30],[-7.6,-18],[-6.4,-6],[-4,4],[14,4],[14,12]]));
      p.F(M.suit[3]); p.poly(W(sk,[[-14,12],[-14,-40],[-10,-40],[-10.6,-30],[-9.8,-18],[-8.8,-6],[-8,12]]));
      p.F(M.suit[3]); p.poly(W(sk,[[-14,9],[15,9],[15,12],[-14,12]]));
      // dobras de linho amassado, costura lateral
      p.F(M.suit[2]); [[[-2,-14],[3,-17],[3.6,-16.2],[-1.4,-13.2]],[[0,-24],[5.4,-26],[5.8,-25.2],[0.4,-23.2]],[[3,-5],[8,-8],[8.4,-7],[3.4,-4.2]],[[-4,-30],[-1,-32],[-0.6,-31.2],[-3.6,-29.4]]].forEach(f=>p.poly(W(sk,f)));
      p.F(M.suit[0]); [[[-1,-20],[4,-22],[4.4,-21.2],[-0.6,-19.2]],[[4,-1],[9,-3],[9.2,-2.2],[4.4,-0.4]]].forEach(f=>p.poly(W(sk,f)));
      // bolso com aba no quadril
      p.F(M.suit[2]); p.poly(W(sk,[[1,-3.6],[8.4,-4],[8.6,-2.2],[1.2,-1.8]])); p.F(M.suit[3]); p.poly(W(sk,[[1,-2],[8.6,-2.4],[8.6,-1.8],[1.2,-1.4]]));
      // barro e sangue no linho
      p.F(M.dirt[1]); [[-1,5,3,1.8],[8,6.4,2,1.2],[-6.4,-8,1.4,2.2]].forEach(([uu,vv,a,b])=>{ const q=Wp(sk,uu,vv); p.ell(q.x,q.y,a,b); });
      p.F(M.dirt[2]); { const q=Wp(sk,-1.6,6); p.ell(q.x,q.y,1.4,0.9); }
      p.F(M.blood[1]); [[9,-14,1.8,1.2],[10.6,-11,1,0.8],[7.4,-12,0.8,0.8],[11,-6,1.4,1]].forEach(([uu,vv,a,b])=>{ const q=Wp(sk,uu,vv); p.ell(q.x,q.y,a,b); });
      p.F(M.blood[2]); p.poly(W(sk,[[9.2,-13],[10,-13],[9.8,-7],[9.4,-7.4]]));
      if(form==='plenilunar'){ p.F(M.blood[1]); p.poly(W(sk,[[4,-14],[12,-16],[13,-4],[8,-2],[5,-6]])); p.F(M.blood[2]); p.poly(W(sk,[[6,-8],[11,-10],[12,-4],[8,-3]])); }
    });
    // abertura do paletó: camisa de seda listrada (listras verticais), lapela larga dobrada
    const op=W(sk,OPEN);
    clip(c,op,()=>{ p.F(M.shirt[1]); p.poly(op);
      for(let k=0;k<5;k++){ const uu=6.2+k*1.9; p.F(M.stripe[1]); p.poly(W(sk,[[uu,-40],[uu+0.8,-40],[uu+0.8,0],[uu,0]])); }
      p.F(M.band[1]); p.poly(W(sk,[[4,-4.6],[15,-4.6],[15,-2.6],[4,-2.6]])); p.F(M.gold[1]); p.poly(W(sk,[[11,-4.4],[12.4,-4.4],[12.4,-2.8],[11,-2.8]])); // cinto e fivela
      p.F(M.shirt[2]); p.poly(W(sk,[[4,-40],[7,-40],[9.4,-28],[10.2,-14],[10.4,-4.6],[4,-4.6]])); // sombra da lapela
      p.F(M.stripe[2]); [[7.6,-30],[9.5,-24]].forEach(([uu,vv])=>p.poly(W(sk,[[uu,vv],[uu+0.8,vv],[uu+0.8,vv+3.6],[uu,vv+3.6]])));
      p.F(M.shirt[0]); p.poly(W(sk,[[11.8,-32],[13.2,-28],[13.4,-22],[12.6,-22]]));
      p.F(M.blood[1]); { const q=Wp(sk,11.6,-20); p.ell(q.x,q.y,1.2,1.8); } { const q=Wp(sk,12,-12); p.ell(q.x,q.y,1.6,1.1); } p.F(M.shirt[3]); p.poly(W(sk,[[10,-9],[12.6,-8],[12.4,-7.2],[10,-8.2]])); // rasgo da camisa
    });
    p.F(M.suit[2]); p.poly(W(sk,[[4.6,-39],[6.4,-34],[8,-27.6],[8.8,-20],[9.2,-10],[9.4,-2],[8,-2],[7.8,-12],[7,-22],[4.4,-33],[3.4,-37]])); // lapela/frente de cá
    p.F(M.suit[0]); p.poly(W(sk,[[7.4,-22],[8.2,-22],[8.6,-8],[8,-8]]));
    p.F(M.suit[0]); p.poly(W(sk,[[9.8,-36.4],[12.8,-31],[13.4,-27.6],[11,-31.6],[8.8,-34.6]])); // lapela de lá
    p.F(M.suit[3]); p.poly(W(sk,[[5.6,-35],[7.6,-35.6],[7,-33.6]])); // entalhe
    // lenço vermelho no bolso do peito (na frente)
    p.F(M.suit[2]); p.poly(W(sk,[[6.6,-26.4],[10.4,-25.6],[10.2,-24.8],[6.4,-25.6]]));
    p.F(M.stripe[0]); p.poly(W(sk,[[7,-26.2],[7.6,-28.6],[8.4,-26.8],[9.4,-28.8],[10,-25.8]]));
    // rasgo nas costas com costelas
    p.F(M.suit[3]); p.poly(W(sk,[[-10.6,-27],[-6.6,-29],[-4,-25],[-4.6,-18.6],[-7.6,-16.6],[-10.2,-20]]));
    p.F(M.flesh[3]); p.poly(W(sk,[[-10,-26.2],[-6.8,-28],[-4.8,-24.6],[-5.2,-19.4],[-7.6,-17.8],[-9.8,-20.4]]));
    p.F(M.flesh[2]); p.poly(W(sk,[[-9.4,-25.4],[-7,-26.8],[-5.4,-24],[-5.8,-20.2],[-7.6,-19],[-9.2,-21]])); p.F(M.flesh[1]); p.poly(W(sk,[[-8.6,-23],[-6.4,-23.6],[-6.2,-22.6],[-8.4,-22.2]]));
    p.F(form==='plenilunar'?M.bone[0]:M.bone[1]); [[-24],[-21.4]].forEach(([v])=>p.poly(W(sk,[[-9.4,v],[-5.4,v-0.8],[-5.4,v],[-9.4,v+0.8]])));
    p.F(M.suit[0]); p.poly(W(sk,[[-6.6,-29],[-5.6,-31.4],[-5.2,-28.6]])); p.poly(W(sk,[[-7.6,-16.6],[-8.2,-14],[-6.8,-15.6]])); // fiapos
    p.F(M.blood[1]); p.poly(W(sk,[[-7.4,-17.4],[-6.4,-17.6],[-6.6,-12.4],[-7.2,-12.2]]));
    if(form==='plenilunar'){ p.F(M.bone[1]); [[-11,-30,-15.6,-33],[-11.4,-22,-16.2,-22]].forEach(([u0,v0,u1,v1])=>{ const a=Wp(sk,u0,v0+1.6), b=Wp(sk,u1,v1), d=Wp(sk,u0+0.6,v0-1.6); p.poly([[a.x,a.y],[b.x,b.y],[d.x,d.y]]); }); }
    if(form!=='comum'){ p.F(M.glow[1]); [[[-9.6,-25],[-11.6,-30],[-10.8,-30.4],[-9,-25.6]],[[-5,-18],[-1.6,-13],[-2.2,-12.4],[-5.4,-17.4]]].forEach(f=>p.poly(W(sk,f))); }
  }
  // lenço de seda dourado no pescoço (por cima do pescoço da cabeça), pontas soltas no peito
  function drawScarf(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    p.F(M.scarf[1]); p.poly(W(sk,[[-1.6,-40],[7.6,-39.6],[8.4,-36.6],[-1.2,-36.6]]));
    p.F(M.scarf[2]); p.poly(W(sk,[[-1.6,-37.6],[8.2,-37.2],[8.4,-36.6],[-1.2,-36.6]]));
    p.F(M.scarf[0]); p.poly(W(sk,[[2,-39.8],[6.6,-39.4],[6.4,-38.8],[2.2,-39]]));
    const sw=Math.sin(P.hx*0.7+P.lean*0.08)*0.8;
    p.F(M.scarf[1]); p.poly(W(sk,[[6,-37.4],[8.2,-37.2],[10.6+sw,-30.4],[8.6+sw,-29.8]])); p.poly(W(sk,[[6.6,-37],[8.4,-36.6],[8+sw,-31.6],[6+sw,-32.2]]));
    p.F(M.scarf[2]); p.poly(W(sk,[[8.2,-37.2],[8.8,-36],[10.6+sw,-30.4],[10+sw,-30.2]])); p.poly(W(sk,[[6+sw,-32.2],[8+sw,-31.6],[7.6+sw,-31],[6.2+sw,-31.6]]));
    p.F(M.scarf[0]); p.poly(W(sk,[[7,-36.6],[7.6,-36.6],[9.4+sw,-31.4],[9+sw,-31.2]]));
    p.F(M.scarf[1]); p.circle(Wp(sk,7.2,-37.6),2); p.F(M.scarf[0]); { const q=Wp(sk,7,-38.2); p.rect(q.x-0.4,q.y-0.4,0.9,0.8); }
    p.F(M.blood[1]); { const q=Wp(sk,9.2,-33); p.ell(q.x,q.y,0.9,1.2); }
  }

  /* ---------- cabeça: cabelo com brilhantina, bigode fino, cicatriz, dente de ouro, panamá de banda ---------- */
  function drawHead(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.xf(sk.ha,sk.neck.x,sk.neck.y); c.scale(HS,HS);
    // pescoço magro
    p.F(M.skin[1]); p.poly([[-4,4],[4.6,4],[5.2,-4],[-3.6,-6]]);
    p.F(M.skin[2]); p.poly([[-4,4],[-0.6,4],[-1.2,-5.4],[-3.6,-6]]);
    p.F(M.vein[1]); p.rect(2.2,-3,0.8,5);
    // crânio
    p.F(M.skin[1]); p.ell(2.2,-12.4,9.2,9.2);
    p.poly([[-3.6,-6],[11,-7.6],[12.2,-4.4],[6,-2.6],[-2,-3]]);
    p.F(M.skin[2]); p.poly([[-7.2,-15],[-5,-6],[0,-2.6],[6,-2.6],[2,-5],[-2,-9],[-3,-14],[-5.4,-18]]);
    p.F(M.skin[3]); p.poly([[-7.2,-14],[-6.4,-9],[-4.4,-5.2],[-5,-11]]);
    p.F(M.skin[0]); p.poly([[5,-8],[9.4,-8.6],[8.6,-7.4],[5.4,-7.2]]); // maçã do rosto
    // orelha
    p.F(M.skin[1]); p.ell(-2.8,-11.2,2.2,3.1); p.F(M.skin[3]); p.ell(-2.6,-11,1,1.8); p.F(M.flesh[2]); p.rect(-3.8,-8.8,1.1,1.2);
    // cabelo liso com brilhantina e costeleta
    const hatOn=P.hat>=0.5;
    if(hatOn){ p.F(M.hair[1]); p.poly([[-7.8,-14.6],[-6.4,-17.6],[-1,-18],[-2.6,-15.6],[-5,-11.6],[-7.6,-9.6]]); }
    else {
      p.F(M.hair[1]); p.poly([[-7.8,-13.6],[-7,-19.4],[-2.4,-22.4],[4,-22.6],[9,-20.6],[10.8,-17.4],[4,-18.6],[-1,-18.4],[-2.6,-15.6],[-5,-11.6],[-7.6,-9.6]]);
      p.F(M.hair[0]); p.poly([[-4,-20.6],[2,-21.8],[7,-20.6],[2,-20.8]]); p.poly([[-6.4,-16.4],[-4,-19.4],[-3.6,-18.6],[-5.6,-15.6]]);
      p.F(M.hair[2]); p.poly([[3,-22.2],[3.8,-22.4],[2.4,-18.6],[1.8,-18.8]]); // risca
      p.F(M.rot[1]); p.ell(-1,-20,1.4,0.8);
    }
    p.F(M.hair[1]); p.poly([[-1.2,-15.6],[0.6,-15.8],[0.6,-9],[-0.6,-9.6]]); // costeleta
    p.F(M.hair[0]); p.rect(-6,-14.6,2.4,0.6);
    // sobrancelha arqueada e olho meio fechado (pose de malandro)
    p.F(M.hair[1]); p.poly([[4.4,-12.6],[8.4,-13.6],[11.8,-12.6],[11.6,-11.8],[8.4,-12.6],[4.6,-11.8]]);
    p.F(M.skin[3]); p.ell(8.2,-9.8,2.6,1.9);
    p.F(M.eye[1]); p.ell(8.6,-9.6,1.8,1.1); p.F(M.skin[2]); p.poly([[6,-10.8],[10.6,-11],[10.4,-10],[6.2,-10]]); // pálpebra
    p.F(M.eye[0]); p.rect(8.4,-9.8,0.9,0.6); p.F(M.eye[2]); p.rect(9.4,-9.4,0.7,0.6);
    p.F(M.skin[3]); p.ell(12,-9.8,0.9,1.2); p.F(M.eye[1]); p.rect(11.7,-10,0.8,0.8);
    // nariz fino
    p.F(M.skin[1]); p.poly([[11,-10.4],[14.2,-6.8],[13.4,-5.8],[11.2,-6.2]]);
    p.F(M.skin[3]); p.rect(12.6,-6.2,1.2,0.8); p.F(M.skin[0]); p.rect(11.8,-9.2,0.8,1.4);
    // cicatriz de navalha na bochecha (com pontos)
    p.F(M.flesh[2]); p.poly([[3.6,-10.4],[4.4,-10.8],[7.6,-4.6],[6.8,-4.2]]);
    p.F(M.flesh[1]); [[4.6,-9.2],[5.6,-7.4],[6.6,-5.6]].forEach(([x,y])=>p.rect(x-0.6,y,1.6,0.5));
    // boca de cima: dentes com um de ouro
    p.F(M.mouth[1]); p.poly([[5,-5],[13.2,-5.2],[13,-2.4],[5,-2.2]]);
    p.F(M.teeth[1]); [[6.8,-5.2,1.2,1.6],[10,-5.2,1.2,1.6],[11.6,-5.2,1,1.3]].forEach(([x,y,w,h])=>p.rect(x,y,w,h));
    p.F(M.gold[1]); p.rect(8.4,-5.2,1.2,2); p.F(M.gold[0]); p.rect(8.4,-5.2,0.6,0.6);
    // palito no canto da boca
    p.F(M.handle[1]); p.poly([[12.4,-3.6],[17.4,-5.6],[17.6,-5],[12.6,-3]]); p.F(M.handle[0]); p.rect(15,-5,1.2,0.5);
    // bigode fino
    p.F(M.hair[1]); p.poly([[8.4,-6],[13.8,-6.4],[14.2,-5.4],[13,-5.4],[9,-5.2]]);
    p.F(M.rot[1]); p.ell(1,-8,1.6,1.2); p.F(M.rot[2]); p.rect(0.4,-8.4,1,0.9);
    if(form!=='comum'){ p.F(M.glow[0]); p.rect(8,-10,1.6,1); p.F(M.glow[1]); p.rect(11.7,-10,0.8,0.9); }
    p.id();
    if(hatOn){ const o=sk.H(2.2,-16.4); hatAt(c,p,M,form,o.x,o.y,sk.ha+rad(P.ht),HS,{}); }
  }
  function drawJaw(c,u,M,sk,P){
    const p=mkPen(c,u); const h=sk.H(2.6,-3.6); p.xf(sk.ha+rad(P.jaw),h.x,h.y); c.scale(HS,HS);
    p.F(M.skin[1]); p.poly([[-2,-1.4],[10.8,-0.8],[11.6,1.6],[10.6,5],[6.4,6.6],[0.6,5.8],[-2.4,2.8]]);
    p.F(M.skin[2]); p.poly([[-2.4,2.8],[0.6,5.8],[6.4,6.6],[10.6,5],[9,4.4],[4,4.8],[0,3.4]]);
    p.F(M.skin[3]); p.poly([[1,5.8],[6.4,6.6],[9.4,5.8],[4,5.8]]);
    p.F(M.mouth[1]); p.poly([[2.6,-0.8],[10,-0.4],[10,1.4],[3,1.2]]);
    p.F(M.teeth[1]); [[4.2,-1,1.2,1.5],[5.8,-1,1.2,1.9],[7.4,-1,1.2,1.5],[9,-1,1,1.8]].forEach(([x,y,w,h])=>p.rect(x,y,w,h));
    p.F(M.skin[0]); p.rect(5.6,1.8,3.4,0.8);
    p.F(M.hair[2]); p.rect(9.4,3.2,1.2,1.6); // cavanhaque ralo
    const L=2+(P.drool%4)*1.2+(P.jaw>30?2:0);
    p.F(M.blood[1]); p.poly([[9.6,4.6],[11,4],[10.8,4+L],[10.2,5+L]]); p.ell(10.5,5+L,1,1);
    p.id();
  }
  function drawMouthIn(c,u,M,sk,P){
    if(P.jaw<16) return; const p=mkPen(c,u); p.id();
    const a=sk.H(5,-2.4), b=sk.H(13,-2.6), h=sk.H(2.6,-3.6), ja=sk.ha+rad(P.jaw), jc=Math.cos(ja), js=Math.sin(ja);
    const J=(x,y)=>({x:h.x+(x*jc-y*js)*HS,y:h.y+(x*js+y*jc)*HS}), d=J(10.4,0.6), e=J(3,0.6);
    p.F(M.mouth[2]); p.poly([[a.x,a.y],[b.x,b.y],[d.x,d.y],[e.x,e.y]]);
    p.F(M.mouth[3]); const m=lerp(lerp(a,b,0.3),lerp(e,d,0.3),0.5); p.circle(m,1.6);
  }
  function drawSmear(c,u,M,sk,P){
    const p=mkPen(c,u); p.id();
    const sh=sk.shF, w=sk.ztip, r=Math.hypot(w.x-sh.x,w.y-sh.y)+2, a1=Math.atan2(w.y-sh.y,w.x-sh.x);
    const n=10, pts=[]; for(let i=0;i<=n;i++){ const a=a1-1.4+1.45*i/n; pts.push([sh.x+Math.cos(a)*r,sh.y+Math.sin(a)*r]); }
    for(let i=n;i>=0;i--){ const a=a1-1.4+1.45*i/n, rr=r-2-7*(i/n); pts.push([sh.x+Math.cos(a)*rr,sh.y+Math.sin(a)*rr]); }
    p.F(M.swish[0]); p.poly(pts.map(([x,y])=>[Math.max(1,Math.min(FW-2,x)),Math.max(1,Math.min(GROUND,y))]));
    p.F(M.swish[2]); const q=pts.slice(n-3,n+1); for(let k=0;k<q.length-1;k++) p.cap({x:q[k][0],y:q[k][1]},{x:q[k+1][0],y:q[k+1][1]},0.9,0.9);
  }
  function drawLooseHat(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id(); const y=GROUND-4-P.hdy;
    hatAt(c,p,M,form,AX+P.hdx,y,rad(P.hdr),HS,{});
  }

  /* ---------- adereço: chapéu girando ---------- */
  const PW=56, PH=34, PG=20, PAX=28;
  const SPIN=[{sx:1,kx:-7.6,t:-10},{sx:0.86,kx:0,t:-2},{sx:1,kx:7.6,t:8},{sx:0.86,kx:12,t:-2}];
  function frameProp(form,st,K){
    const M=mats(form), s=SPIN[((st|0)%4+4)%4];
    const parts=[
      {noShade:true, noRim:true, smear:true, draw:(c,u)=>{ const p=mkPen(c,u); p.id(); p.F(M.swish[1]); p.poly([[2,PG-2],[12,PG-4],[12,PG+2],[3,PG+1]]); p.F(M.swish[2]); p.poly([[6,PG-6],[13,PG-7],[13,PG-5.6],[6,PG-5]]); }},
      {draw:(c,u)=>{ const p=mkPen(c,u); hatAt(c,p,M,form,PAX+2,PG,rad(s.t),HS,{sx:s.sx,kx:s.kx,dip:1.2}); }},
    ];
    const cv=compose({FW:Math.round(PW*K),FH:Math.round(PH*K),GROUND:PH*K,parts,M,step:5,flash:0,rim:RIM[form]});
    cv._ax=PAX*K; cv._gy=PG*K; return cv;
  }

  /* ---------- montagem ---------- */
  const cache=PIX.cache();
  function frame(form,anim,fi,step=5,Pov,pk){
    const K=PIX.getK(), key=(pk!=null?'#'+pk+'|'+form:form+'|'+anim+'|'+fi+'|'+step)+'@'+K;
    const hit=cache.get(key); if(hit){ cache.delete(key); cache.set(key,hit); return hit; }
    if(ANIMS[anim]&&ANIMS[anim].prop){ const st=Pov&&Pov.st!=null?Math.round(Pov.st):fi; const cv=frameProp(form,st,K); cache.set(key,cv); return cv; }
    const P=Pov?Object.assign({},REST,Pov):poseOf(anim,fi), M=mats(form), sk=skeleton(P);
    const parts=[
      {back:true, draw:(c,u)=>drawArm(c,u,M,sk,P,false,form)},
      {back:true, draw:(c,u)=>drawLeg(c,u,M,sk,P,false)},
      {draw:(c,u)=>drawLeg(c,u,M,sk,P,true)},
      {draw:(c,u)=>drawTorso(c,u,M,sk,P,form)},
    ];
    if(P.lsmear>=0.5) parts.push({noShade:true, smear:true, noRim:true, draw:(c,u)=>drawLegSmear(c,u,M,sk,P)});
    parts.push({draw:(c,u)=>{ drawHead(c,u,M,sk,P,form); drawMouthIn(c,u,M,sk,P); }}, {draw:(c,u)=>drawJaw(c,u,M,sk,P)}, {draw:(c,u)=>drawScarf(c,u,M,sk,P,form)});
    if(P.smear>=0.5) parts.push({noShade:true, smear:true, noRim:true, draw:(c,u)=>drawSmear(c,u,M,sk,P)});
    parts.push({draw:(c,u)=>drawArm(c,u,M,sk,P,true,form)});
    if(P.hloose>=0.5) parts.push({draw:(c,u)=>drawLooseHat(c,u,M,sk,P,form)});
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM[form]}); if(step>=4) heavyOutline(cv);
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._eye=sc(sk.H(8.6,-9.6)); cv._mouth=sc(sk.H(10,-2)); cv._hand=sc(sk.wrF); cv._head=sc(sk.H(3,-13)); cv._blade=sc(sk.ztip); cv._handB=sc(sk.wrB);
    cache.set(key,cv); if(cache.size>900) cache.delete(cache.keys().next().value);
    return cv;
  }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame,framePose:function(form,anim,P,key){ return frame(form,anim,0,5,P,key); }};
})();
