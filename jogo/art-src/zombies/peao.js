/* PEAO — fonte de arte (editável). Build: npm run art
   Zumbi Peão Pantaneiro (Pantanal): peão de comitiva que tocava gado entre fazendas e continua tocando, a pé e morto.
   Chapéu de couro de aba larga (com barbicacho solto e musgo), lenço vermelho desbotado, camisa xadrez de manga
   comprida rasgada, colete de couro, calça de brim desbotado por dentro das perneiras de couro, botas altas com
   esporas, cinto largo com fivela e bainha da faca pantaneira. Laço de couro trançado enrolado no ombro (e uma
   argola dele na mão de trás) e berrante de chifre de boi (aros de metal, alça de couro) pendurado na cintura.
   Corrupção: pele cinza-oliva com veias roxas, olhos de lua, mandíbula caída, carne exposta no antebraço.
   Golpes: facada (2 cortes), laço (gira sobre a cabeça, lança e puxa: adereço xLaco) e berrante (sopra a onda
   que enfurece o rebanho: adereço xBerrante). Hi-bit: honra PIX.getK(). */
const PEAO=(function(){
  const {rad,lerp,P2,mkPen,compose}=PIX;
  const FW=204, FH=164, GROUND=154, AX=82;
  const RIM={comum:'#e4dcc4', enluarado:'#9ff6ff', plenilunar:'#ffb46a'};

  /* ---------- materiais ---------- */
  function mats(form){
    const m={
      skin:['#c4d0ac','#8a9a7a','#5e6e58','#3a4440'],
      vein:['#c8a4e8','#9468c0','#64428e','#3a2660'],
      rot:['#b4b07c','#7c7a52','#525040','#302a30'],
      flesh:['#f2a890','#c0585a','#7a3446','#481a30'],
      bone:['#fff4d8','#dccfa6','#a09070','#605040'],
      hat:['#dcb47e','#a67a4a','#74522f','#4a3220'],
      plaid:['#a6b690','#7a8a6a','#56624e','#363e36'],
      check:['#f0e8c8','#c8c0a0','#948a70','#5e5648'],
      redc:['#c46a52','#8e3c30','#5e2626','#381620'],
      vest:['#a07848','#6a4a2a','#4a321e','#2c1c14'],
      scarf:['#e47c62','#b04030','#782828','#46161e'],
      jeans:['#8494b4','#4a5a7a','#344060','#202840'],
      chaps:['#c48c54','#8a5a30','#603c22','#3a2416'],
      boot:['#86664a','#523a28','#36261c','#1e1410'],
      steel:['#f6f8ff','#b4b6c2','#727484','#3e3e4e'],
      brass:['#fff0a4','#d6ae48','#987228','#58401a'],
      rope:['#e8c890','#b08a5a','#7c5c38','#4a3422'],
      horn:['#fff6e0','#e4d2aa','#a89272','#625040'],
      hornT:['#7a6a5e','#4c3e36','#30262a','#1a1418'],
      wood:['#dcac6c','#9c6c3c','#6a4426','#3c2618'],
      hair:['#7a7470','#4a4646','#2e2a2e','#1a161a'],
      eye:['#ffffff','#fff4c4','#e8cc6c','#9a7c3a'],
      mouth:['#7c2e3e','#4c1828','#2e0c1a','#1a0610'],
      teeth:['#f6eabc','#d2bc7a','#968250','#5a4a30'],
      moss:['#b4cc78','#74904a','#4c6432','#2c3c20'],
      dirt:['#c8a678','#93734d','#654b33','#3b2a1e'],
      blood:['#c84a3e','#8e2a2c','#5e1824','#3a0e1a'],
      nail:['#8a7a72','#54484a','#342a30','#1c161a'],
      glow:['#fffbe0','#f0e8a8','#b4a870','#6c6446'],
      swish:['#fdfdff','#e6f0ff','#b4c4e8','#7484b0'],
    };
    if(form==='enluarado'){
      m.skin=['#d4d8ff','#9ca0e0','#6468ac','#3a3a74']; m.vein=['#a8f4ff','#4ad8f0','#2a8ab0','#1a4a7a'];
      m.rot=['#b4a6dc','#8070ac','#544686','#32285c']; m.flesh=['#f0b0ff','#b866d8','#7a3a9e','#46206a']; m.blood=['#b46ad8','#7e3ea6','#542474','#34144a'];
      m.eye=['#ffffff','#c8fcff','#4ad8f0','#1a8aa8']; m.glow=['#effffe','#7af4ff','#2ab0d8','#146a96']; m.swish=['#ffffff','#c8fbff','#6ae4f4','#2a9ab8'];
      m.hat=['#c6c4e0','#8e8ab2','#5e5a86','#3a3660']; m.plaid=['#9cb0c8','#6c80a0','#4c5a7e','#30385a']; m.check=['#e6e8f6','#b6bad4','#7e82a6','#4c4e72'];
      m.redc=['#a888c8','#745c9c','#4e3c74','#2e2450']; m.vest=['#8a84a8','#5a5480','#3c385c','#24203c'];
      m.scarf=['#c896e0','#8e5ab0','#5e3a84','#382056']; m.jeans=['#8ca0d0','#506498','#36446e','#202848'];
      m.chaps=['#a8a0c8','#76709c','#4e4a72','#2e2a4a']; m.boot=['#6c6a94','#403e66','#2a2846','#16142a'];
      m.rope=['#d0cce8','#9c96c0','#6a6492','#3e3a62']; m.horn=['#f0f4ff','#c2cae8','#868eb8','#4e5480'];
      m.moss=['#a8f0e0','#5ab8b0','#38787e','#204650']; m.dirt=['#a8a0c8','#76709a','#4e4a70','#2e2a48'];
    }
    if(form==='plenilunar'){
      m.skin=['#ffc8a4','#dc7c66','#a0404c','#5c1c34']; m.vein=['#fff0a0','#ffb43a','#e0581e','#8a2414'];
      m.rot=['#d0806a','#9a4a4a','#682a3a','#3e1628']; m.flesh=['#ffc07a','#f06a3a','#a8302e','#5e1422']; m.blood=['#ff7a3a','#d43a26','#8a1c22','#4e0c18'];
      m.eye=['#fffbe0','#ffe04a','#ff8a2a','#b83a14']; m.glow=['#fff6c0','#ffb43a','#e0581e','#8a2414']; m.swish=['#fffbe6','#ffe6a8','#ffb460','#d0602a'];
      m.hat=['#e4a07a','#a85e40','#723a2e','#461e1e']; m.plaid=['#c08070','#8e4e48','#5e3036','#3a1a24']; m.check=['#f0c8a8','#c4987e','#8a5e52','#523236'];
      m.vest=['#9a5838','#6a3222','#48201a','#2a1012']; m.scarf=['#ff7a4a','#d03a26','#8a1c22','#4e0c18'];
      m.jeans=['#9c7c98','#6a4a6a','#48304e','#2a1a32']; m.chaps=['#cc7a48','#8e4628','#602a1e','#3a1414'];
      m.steel=['#fffbe0','#ffd24a','#ff8a2a','#b83a14']; m.brass=['#fff6c0','#ffb43a','#e0581e','#8a2414'];
      m.horn=['#ffe8c8','#f0b884','#b06a4c','#6a3430']; m.rope=['#f0b880','#b0704a','#7a4430','#4a2420'];
      m.moss=['#c8a060','#8a6a3a','#5a4428','#34261a']; m.dirt=['#b4705a','#844a3e','#5a2e2e','#36181e'];
    }
    return punch(m);
  }
  const NAMES={skin:'Pele',vein:'Veias',rot:'Podridão',flesh:'Carne',bone:'Osso',hat:'Chapéu de couro',plaid:'Xadrez (verde)',check:'Xadrez (creme)',redc:'Xadrez (fio vermelho)',vest:'Colete de couro',scarf:'Lenço',jeans:'Calça de brim',chaps:'Perneiras',boot:'Botas',steel:'Faca/esporas',brass:'Fivela/aros',rope:'Laço trançado',horn:'Berrante (chifre)',hornT:'Ponta do chifre',wood:'Cabo da faca',hair:'Barba/bigode',eye:'Olho',teeth:'Dentes',moss:'Musgo',dirt:'Barro',blood:'Sangue',glow:'Brilho',swish:'Rastro do corte'};
  function sat(h,k){ const [r,g,b]=PIX.hexRgb(h), y=(r+g+b)/3; return PIX.toHex(y+(r-y)*k,y+(g-y)*k,y+(b-y)*k); }
  const NOPUNCH={swish:1,glow:1};
  function punch(m){ const o={}; for(const k in m){ const r=m[k]; o[k]=NOPUNCH[k]?[r[0],r[1],r[2],r[3]]:[sat(r[0],1.1),sat(r[1],1.16),PIX.mix(sat(r[2],1.1),'#2a1a4c',0.2),PIX.mix(r[3],'#140a24',0.34)]; } return o; }

  /* ---------- poses ---------- */
  // ângulos: 0 = pendurado, + = pra frente. rz = ângulo da faca somado ao do antebraço.
  // lz = laço: 0 argola pendurada na mão de trás, 1 girando sobre a cabeça, 2 esticado (puxando), 3 sem laço na mão.
  // lsp = fase do giro (0..3); lsw = balanço da argola; horn: 0 na cintura, 1 na mão de trás, 2 na boca (soprando).
  // hat/hloose/hdx/hdy/hdr = chapéu (cai na morte); spill = laço espalhado no chão; coil = rolo do laço no ombro.
  const REST={hx:0,rot:0,lift:0,lean:4,hunch:10,head:-6,jaw:10,aFs:14,aFe:36,aBs:-8,aBe:12,rz:84,lFh:16,lFk:-6,lBh:-10,lBk:-20,fF:0,fB:0,ht:3,hat:1,hloose:0,hdx:0,hdy:0,hdr:0,smear:0,flash:0,drool:0,lz:0,lsp:0,lsw:0,horn:0,coil:1,spill:0,blow:0,wave:0};
  const S=Math.sin, C=Math.cos, PI=Math.PI, mx=Math.max;
  const ANIMS={
    idle:{nome:'Parado (pernas arqueadas, balança o laço)',n:8,dur:()=>150,pose:i=>{ const p=i/8*PI*2, s=S(p);
      return {hx:1.2*s, lean:4+2*S(p+0.5), hunch:10+1.5*S(2*p), head:-6+3*S(p-0.8), jaw:8+5*mx(0,S(p)), drool:i%4,
        aFs:14+4*s, aFe:36+6*S(p+0.4), rz:84+8*S(p), aBs:-8+10*S(p+0.6), aBe:12+14*S(p+0.9), lsw:S(p+1.4),
        lFh:16+3*s, lFk:-6+4*s, lBh:-10-3*s, lBk:-20+3*s, ht:3+1.5*S(p-1)}; }},
    walk:{nome:'Andar arqueado (esporas tilintando)',n:8,dur:()=>132,pose:i=>{ const p=i/8*PI*2;
      const lFh=14+18*S(p), lBh=-10+14*S(p+PI);
      return {lFh, lFk:lFh-24*mx(0,C(p))-6, lBh, lBk:lBh-10-14*mx(0,C(p+PI)), fF:-10*mx(0,C(p)), fB:20*mx(0,C(p+PI)),
        lean:6+2*S(p), hunch:10+2*S(2*p-0.6), head:-6+3*S(2*p-1.4), jaw:9+3*S(2*p-1.8), hx:1.8*S(p), lift:1.4*mx(0,S(2*p)),
        aFs:14+16*S(p+PI), aFe:36+12*S(p+PI), aBs:-8+18*S(p), aBe:12+16*S(p), lsw:S(p+0.6)*1.4, ht:3+1.5*S(2*p), drool:i%4}; }},
    alert:{nome:'Alerta (saca o berrante e olha o alvo)',n:7,dur:i=>[170,140,150,170,160,220,170][i],pose:i=>[
      {},
      {head:-2,jaw:14,lean:0,aBs:-30,aBe:-10,hx:-1,horn:0},
      {head:2,jaw:18,lean:-2,aBs:30,aBe:70,horn:1,lz:3,hx:-1},
      {head:4,jaw:24,lean:-4,aBs:50,aBe:96,horn:1,lz:3,ht:8,hx:-2,aFs:30,aFe:70},
      {head:0,jaw:30,lean:-2,aBs:46,aBe:90,horn:1,lz:3,ht:8,aFs:36,aFe:80,rz:70},
      {head:-4,jaw:20,lean:2,aBs:40,aBe:84,horn:1,lz:3,ht:6,aFs:30,aFe:66},
      {jaw:12,aBs:-10,aBe:10,ht:4}][i]},
    // ---- golpes: hit = quadros do dano; laço: warn 0–3, throwAt 4, pull 5–8; berrante: warn 0–3, call 4 ----
    attack:{nome:'Facada (dois cortes)',n:9,hit:[4,7],reach:34,dur:i=>[90,110,80,50,110,90,50,120,170][i],pose:i=>[
      {lean:-4,hunch:8,head:-2,jaw:14,aFs:110,aFe:150,rz:70,aBs:20,aBe:50,hx:-2,lFh:18,lBh:-14},
      {lean:-10,hunch:6,head:2,jaw:22,aFs:156,aFe:190,rz:60,aBs:36,aBe:70,hx:-4,lFh:18,lFk:-10,lBh:-14,lBk:-28,flash:0},
      {lean:-12,hunch:6,head:2,jaw:26,aFs:162,aFe:198,rz:60,aBs:40,aBe:76,hx:-5,lFh:20,lFk:-10,lBh:-16,lBk:-30},
      {lean:14,hunch:14,head:-10,jaw:30,aFs:110,aFe:100,rz:80,smear:1,hx:4,lFh:26,lFk:2,lBh:-20,lBk:-30},
      {lean:22,hunch:16,head:-12,jaw:16,aFs:74,aFe:40,rz:90,smear:1,hx:7,lFh:30,lFk:4,lBh:-22,lBk:-32,fB:10},
      {lean:12,hunch:12,head:-6,jaw:24,aFs:30,aFe:-10,rz:110,hx:5,lFh:26,lBh:-20},
      {lean:20,hunch:14,head:-10,jaw:34,aFs:60,aFe:96,rz:100,smear:2,hx:8,lFh:30,lFk:6,lBh:-24,lBk:-34,fB:12},
      {lean:26,hunch:16,head:-14,jaw:40,aFs:96,aFe:120,rz:90,smear:2,hx:10,lFh:34,lFk:8,lBh:-26,lBk:-36,fB:16},
      {lean:10,hunch:12,head:-6,jaw:16,aFs:40,aFe:70,rz:200,hx:3}][i]},
    laco:{nome:'Laço (gira, lança e puxa)',n:10,warn:[0,3],throwAt:4,pull:[5,8],reach:180,dur:i=>[110,110,115,115,90,130,130,130,130,170][i],pose:i=>[
      {lean:-2,hunch:8,head:-2,jaw:16,aBs:120,aBe:150,lz:1,lsp:0,hx:-1,lFh:18,lBh:-14},
      {lean:-6,hunch:6,head:2,jaw:20,aBs:150,aBe:176,lz:1,lsp:1,hx:-2,lFh:18,lBh:-16,ht:6},
      {lean:-8,hunch:6,head:4,jaw:24,aBs:160,aBe:184,lz:1,lsp:2,hx:-3,lFh:20,lFk:-8,lBh:-18,lBk:-28,ht:6},
      {lean:-10,hunch:4,head:6,jaw:28,aBs:164,aBe:190,lz:1,lsp:3,hx:-4,lFh:20,lFk:-10,lBh:-20,lBk:-30,ht:8},
      {lean:18,hunch:14,head:-8,jaw:36,aBs:100,aBe:96,lz:3,hx:6,lFh:30,lFk:4,lBh:-24,lBk:-34,fB:12,smear:3},
      {lean:-14,hunch:6,head:4,jaw:30,aBs:70,aBe:60,aFs:60,aFe:70,rz:150,lz:2,hx:-4,lFh:24,lFk:10,lBh:-26,lBk:-38,fF:12},
      {lean:-20,hunch:4,head:6,jaw:34,aBs:40,aBe:30,aFs:44,aFe:56,rz:150,lz:2,hx:-6,lFh:28,lFk:14,lBh:-28,lBk:-40,fF:14},
      {lean:-22,hunch:4,head:8,jaw:36,aBs:20,aBe:16,aFs:30,aFe:46,rz:150,lz:2,hx:-7,lFh:30,lFk:16,lBh:-30,lBk:-42,fF:16},
      {lean:-14,hunch:6,head:4,jaw:28,aBs:30,aBe:44,aFs:30,aFe:50,rz:130,lz:2,hx:-4,lFh:24,lFk:8,lBh:-24,lBk:-34},
      {lean:2,hunch:9,head:-4,jaw:14,aBs:0,aBe:24,lz:0,hx:-1}][i]},
    berrante:{nome:'Berrante (sopra e enfurece o rebanho)',n:9,warn:[0,3],call:4,dur:i=>[120,120,130,130,160,170,150,150,180][i],pose:i=>[
      {lean:0,hunch:8,head:-2,jaw:14,aBs:40,aBe:84,horn:1,lz:3,aFs:24,aFe:50},
      {lean:-6,hunch:4,head:4,jaw:10,aBs:90,aBe:150,horn:2,lz:3,aFs:60,aFe:110,rz:40,hx:-1},
      {lean:-12,hunch:0,head:10,jaw:6,aBs:96,aBe:156,horn:2,lz:3,aFs:66,aFe:118,rz:40,hx:-2,lift:1,blow:1},
      {lean:-16,hunch:-2,head:14,jaw:6,aBs:100,aBe:160,horn:2,lz:3,aFs:70,aFe:124,rz:40,hx:-3,lift:1.5,blow:1,ht:8},
      {lean:-8,hunch:2,head:6,jaw:6,aBs:92,aBe:152,horn:2,lz:3,aFs:66,aFe:118,rz:40,hx:0,blow:2,wave:1,ht:10},
      {lean:-6,hunch:2,head:4,jaw:6,aBs:92,aBe:152,horn:2,lz:3,aFs:66,aFe:118,rz:40,hx:1,blow:2,wave:2,ht:10},
      {lean:-4,hunch:4,head:2,jaw:8,aBs:88,aBe:148,horn:2,lz:3,aFs:64,aFe:114,rz:40,blow:1,wave:3,ht:8},
      {lean:4,hunch:10,head:-6,jaw:20,aBs:40,aBe:80,horn:1,lz:3,aFs:30,aFe:60,ht:6},
      {lean:4,hunch:10,head:-6,jaw:14,aBs:-6,aBe:14,horn:0,lz:0}][i]},
    hurt:{nome:'Dano (cabeça)',n:4,dur:i=>[80,110,130,150][i],pose:i=>[
      {lean:-12,hunch:2,head:8,jaw:30,aFs:-10,aFe:20,aBs:-20,aBe:10,hx:-6,flash:1,lFh:14,lBh:-4,ht:-8},
      {lean:-8,hunch:4,head:4,jaw:26,aFs:0,aFe:30,aBs:-14,aBe:20,hx:-5,lFh:12,lBh:-6,ht:-4},
      {lean:-1,hunch:7,head:-2,jaw:20,aFs:10,aFe:34,aBs:-12,aBe:12,hx:-2,ht:2},
      {lean:3,hunch:9,head:-5,jaw:12,hx:0}][i]},
    hurtB:{nome:'Dano (barriga, dobra)',n:4,dur:i=>[80,120,140,150][i],pose:i=>[
      {lean:30,hunch:26,head:8,jaw:40,aFs:40,aFe:10,aBs:44,aBe:14,hx:-8,flash:1,lFh:22,lFk:-14,lBh:-14,lBk:-30,ht:14},
      {lean:26,hunch:24,head:4,jaw:36,aFs:40,aFe:16,aBs:40,aBe:20,hx:-7,lFh:20,lFk:-12,lBh:-14,lBk:-28,ht:12},
      {lean:14,hunch:16,head:-4,jaw:24,aFs:30,aFe:40,aBs:20,aBe:36,hx:-3},
      {lean:6,hunch:11,head:-6,jaw:12,hx:-1}][i]},
    fall:{nome:'Derrubado',n:6,dur:i=>[90,90,90,110,140,260][i],pose:i=>[
      {lean:-14,hunch:2,head:6,jaw:34,aFs:-40,aFe:-20,aBs:-46,aBe:-30,hx:-6,flash:1,lFh:22,lBh:0,ht:-10},
      {rot:-30,lean:-4,hunch:6,head:0,jaw:30,aFs:-60,aFe:-40,aBs:-70,aBe:-50,hx:-4,lFh:40,lFk:30,lBh:20,lBk:10,ht:-12},
      {rot:-62,lean:0,hunch:8,head:-4,jaw:28,aFs:-90,aFe:-70,aBs:-96,aBe:-80,hx:-6,lFh:50,lFk:40,lBh:30,lBk:24,ht:-14},
      {rot:-90,lean:4,hunch:10,head:-2,jaw:36,aFs:-110,aFe:-120,aBs:-100,aBe:-110,hx:2,lFh:40,lFk:10,lBh:30,lBk:4,ht:-16},
      {rot:-84,lean:2,hunch:12,head:-8,jaw:30,aFs:-120,aFe:-140,aBs:-104,aBe:-126,hx:2,lFh:46,lFk:20,lBh:34,lBk:10,ht:-14},
      {rot:-90,lean:0,hunch:10,head:-4,jaw:34,aFs:-130,aFe:-150,aBs:-110,aBe:-136,hx:2,lFh:40,lFk:6,lBh:26,lBk:0,ht:-16}][i]},
    getup:{nome:'Levantar (apoia no joelho)',n:6,dur:i=>[200,170,170,160,160,150][i],pose:i=>[
      {rot:-90,lean:0,hunch:10,head:-4,jaw:34,aFs:-130,aFe:-150,aBs:-110,aBe:-136,hx:2,lFh:40,lFk:6,lBh:26,lBk:0,ht:-16},
      {rot:-60,lean:10,hunch:18,head:-16,jaw:24,aFs:-50,aFe:-10,aBs:-60,aBe:-20,hx:-8,lFh:90,lFk:10,lBh:70,lBk:0,ht:-8},
      {rot:-30,lean:20,hunch:22,head:-22,jaw:20,aFs:-10,aFe:10,aBs:-20,aBe:0,hx:-6,lFh:110,lFk:10,lBh:60,lBk:-60},
      {rot:0,lean:30,hunch:22,head:-26,jaw:20,aFs:30,aFe:10,aBs:20,aBe:4,hx:-4,lFh:78,lFk:-2,lBh:6,lBk:-86,fB:60},
      {rot:0,lean:14,hunch:16,head:-14,jaw:14,aFs:30,aFe:60,aBs:10,aBe:30,hx:-1,lFh:30,lFk:-12,lBh:-12,lBk:-34},
      {lean:5,hunch:11,head:-7,jaw:10}][i]},
    death:{nome:'Morte (chapéu voa, cai de joelhos e de lado)',n:8,dur:i=>[90,150,160,170,150,140,160,600][i],pose:i=>[
      {lean:-12,hunch:2,head:8,jaw:40,aFs:-34,aFe:-16,aBs:-40,aBe:-24,hx:-5,flash:1,lFh:14,lBh:-4,ht:-10},
      {lean:-4,hunch:6,head:12,jaw:48,aFs:-10,aFe:4,aBs:-16,aBe:0,hx:-6,lFh:10,lBh:-8,hat:0,hloose:1,hdx:-12,hdy:48,hdr:-30,lz:3},
      {lean:6,hunch:16,head:-2,jaw:46,aFs:4,aFe:6,aBs:0,aBe:2,hx:-4,lFh:40,lFk:-30,lBh:28,lBk:-50,fF:10,fB:30,hat:0,hloose:1,hdx:-26,hdy:38,hdr:-110,lz:3,spill:1},
      {lean:10,hunch:24,head:-8,jaw:48,aFs:6,aFe:4,aBs:2,aBe:0,hx:-2,lFh:14,lFk:-92,lBh:6,lBk:-96,fF:100,fB:100,hat:0,hloose:1,hdx:-36,hdy:16,hdr:-200,lz:3,spill:2},
      {rot:16,lean:12,hunch:28,head:-8,jaw:48,aFs:24,aFe:20,aBs:16,aBe:14,hx:0,lFh:2,lFk:-92,lBh:-6,lBk:-96,fF:90,fB:90,hat:0,hloose:1,hdx:-42,hdy:2,hdr:-280,lz:3,spill:3,coil:0},
      {rot:50,lean:10,hunch:24,head:-12,jaw:44,aFs:70,aFe:90,aBs:56,aBe:76,hx:4,lFh:-20,lFk:-70,lBh:-28,lBk:-74,fF:60,fB:60,hat:0,hloose:1,hdx:-46,hdy:4,hdr:-330,lz:3,spill:3,coil:0},
      {rot:86,lean:2,hunch:12,head:-4,jaw:40,aFs:150,aFe:170,aBs:110,aBe:150,hx:8,lFh:-4,lFk:-10,lBh:-8,lBk:-14,fF:10,fB:10,hat:0,hloose:1,hdx:-50,hdy:0,hdr:-352,lz:3,spill:3,coil:0},
      {rot:90,lean:0,hunch:10,head:0,jaw:42,aFs:160,aFe:176,aBs:116,aBe:156,hx:8,lFh:-2,lFk:-6,lBh:-6,lBk:-10,fF:6,fB:6,hat:0,hloose:1,hdx:-52,hdy:0,hdr:-360,drool:3,lz:3,spill:3,coil:0}][i]},
    // adereços (desenhados pelo motor como atores extras; âncora em cv._ax/_gy)
    xLaco:{nome:'Laço voando (adereço: argola fechando)',n:4,prop:true,dur:()=>70,pose:i=>({st:i})},
    xBerrante:{nome:'Onda do berrante (adereço)',n:3,prop:true,dur:()=>90,pose:i=>({st:i})},
  };
  const EXK=['hx','lean','hunch','head','aFs','aFe','aBs','aBe','lFh','lFk','lBh','lBk'];
  function exag(P,f){ if(f===1||Math.abs(P.rot)>4) return P; EXK.forEach(k=>{ P[k]=REST[k]+(P[k]-REST[k])*f; }); P.jaw=Math.min(58,mx(0,REST.jaw+(P.jaw-REST.jaw)*f)); return P; }
  const EXF={idle:1.05,walk:1.1,alert:1.1,attack:1.16,laco:1.1,berrante:1.08,hurt:1.3,hurtB:1.25,fall:1.1,getup:1.08,death:1.1};
  ZREACT.add(ANIMS,REST,{});
  function poseOf(anim,i){ const A=ANIMS[anim]; if(A&&A.prop) return Object.assign({},REST,A.pose(i)); return exag(Object.assign({},REST,A.pose(i)),EXF[anim]||1); }
  function heavyOutline(cv){ const g=cv.getContext('2d'), W=cv.width, H=cv.height, im=PIX.pix(cv), d=im.data;
    const isO=i=>d[i+3]===255&&d[i]===0x17&&d[i+1]===0x0b&&d[i+2]===0x1c, fill=i=>d[i+3]===255&&!isO(i);
    const add=[]; for(let y=2;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(d[i+3]) continue; const u=((y-1)*W+x)*4, u2=((y-2)*W+x)*4; if(isO(u)&&fill(u2)) add.push(i); }
    add.forEach(i=>{ d[i]=0x17; d[i+1]=0x0b; d[i+2]=0x1c; d[i+3]=255; }); g.putImageData(im,0,0); }

  /* ---------- esqueleto (atarracado, ombro caído, pernas arqueadas) ---------- */
  const SPINE=36, TH=19, SH=18.6, UA=14.4, FA=13.4, VS=SPINE/37, US=1.2, HB=10, HS=1.13;
  const lp=(p,a,L)=>({x:p.x+Math.sin(rad(a))*L, y:p.y+Math.cos(rad(a))*L});
  function build(P,dy){
    const R=P.rot, hip={x:AX+P.hx, y:dy};
    const ra=rad(R), rc=Math.cos(ra), rs=Math.sin(ra);
    const HR=(lx,ly)=>({x:hip.x+lx*rc-ly*rs, y:hip.y+lx*rs+ly*rc});
    const hipF=HR(3.4,0), hipB=HR(-3.4,0);
    const kneeF=lp(hipF,P.lFh-R,TH), ankleF=lp(kneeF,P.lFk-R,SH), kneeB=lp(hipB,P.lBh-R,TH), ankleB=lp(kneeB,P.lBk-R,SH);
    const SS=[]; let x=hip.x, y=hip.y;
    for(let k=0;k<=SPINE;k++){ const t=k/SPINE, a=rad(R+P.lean+(P.hunch+HB)*Math.pow(t,1.3)); SS.push({x,y,a}); x+=Math.sin(a); y-=Math.cos(a); }
    const SP=(u,v)=>{ if(v>0){ const s=SS[0], a=s.a, px=s.x-Math.sin(a)*v, py=s.y+Math.cos(a)*v; return {x:px+Math.cos(a)*u, y:py+Math.sin(a)*u}; }
      const f=-v, k=Math.min(SPINE,Math.floor(f)), s=SS[k], r=f-k, a=s.a;
      const px=s.x+Math.sin(a)*r, py=s.y-Math.cos(a)*r; return {x:px+Math.cos(a)*u, y:py+Math.sin(a)*u}; };
    const T=(u,v)=>SP(u*US,v*VS);
    const top=SS[SPINE], neck=T(1,-37), sa=top.a;
    const shF=T(-0.6,-31.4), shB=T(-6,-32.2);
    const elF=lp(shF,P.aFs-R,UA), wrF=lp(elF,P.aFe-R,FA), elB=lp(shB,P.aBs-R,UA), wrB=lp(elB,P.aBe-R,FA);
    const ha=sa+rad(P.head-HB*0.8), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:neck.x+(lx*hc-ly*hs)*HS, y:neck.y+(lx*hs+ly*hc)*HS});
    // faca: punho -> cabo -> lâmina
    const fa=Math.atan2(wrF.x-elF.x,wrF.y-elF.y)*180/PI, za=rad(fa+P.rz), zd={x:Math.sin(za),y:Math.cos(za)};
    const zh={x:wrF.x+(wrF.x-elF.x)/FA*4.6, y:wrF.y+(wrF.y-elF.y)/FA*4.6};
    const zg={x:zh.x+zd.x*4.6, y:zh.y+zd.y*4.6}, ztip={x:zg.x+zd.x*14, y:zg.y+zd.y*14};
    const toe=(a,f)=>{ const t=rad(f+R); return {x:a.x+(11*Math.cos(t)-5*Math.sin(t))*1.3, y:a.y+(11*Math.sin(t)+5*Math.cos(t))*1.3}; };
    const hull=[[ankleF,6.5],[ankleB,6.5],[toe(ankleF,P.fF),0.8],[toe(ankleB,P.fB),0.8],[kneeF,5.5],[kneeB,5.5],[hip,9],[T(0,-18),11],[T(-2,-30),11],[H(3,-11),11],[wrF,4],[wrB,4],[elF,4],[elB,4]];
    return {R,hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,SP,T,sa,neck,shF,shB,elF,wrF,elB,wrB,ha,H,hull,ra,zh,zd,zg,ztip,toeF:toe(ankleF,P.fF)};
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
  // xadrez ao longo de um membro (faixas cruzando + fio vertical), dentro do volume já pintado
  function plaidLimb(p,M,a,b,wa,wb,ph){
    const n=sideN(a,b), L=n.L, k=Math.max(2,Math.round(L/3.6));
    for(let i=0;i<k;i++){ const t=(i+0.5+(ph||0))/k; if(t>0.98) continue; const q=lerp(a,b,t), w=(wa+(wb-wa)*t)*0.42;
      p.F(M.check[1]); p.cap(off(q,n,-w),off(q,n,w*0.2),1.1,1.1);
      p.F(M.check[2]); p.cap(off(q,n,w*0.2),off(q,n,w),1.1,1.1);
      p.F(M.redc[1]); p.cap(off(lerp(a,b,t+0.5/k),n,-w),off(lerp(a,b,t+0.5/k),n,w*0.6),0.45,0.45); }
    p.F(M.check[2]); p.cap(off(a,n,-wa*0.1),off(b,n,-wb*0.1),0.9,0.9);
    p.F(M.plaid[3]); p.cap(off(a,n,wa*0.22),off(b,n,wb*0.22),0.5,0.5);
  }
  // anel de corda (pontos numa elipse) com trança
  function ropeRing(p,M,cx,cy,rx,ry,ang,th,ph,open){
    const N=22, pts=[]; const ca=Math.cos(ang), sa=Math.sin(ang);
    for(let i=0;i<=N;i++){ const t=i/N*PI*2*(open||1)+(ph||0); const x=Math.cos(t)*rx, y=Math.sin(t)*ry; pts.push({x:cx+x*ca-y*sa, y:cy+x*sa+y*ca, s:Math.sin(t)}); }
    for(let i=0;i<N;i++){ const a=pts[i], b=pts[i+1]; p.F(a.s<0?M.rope[2]:M.rope[1]); p.cap(a,b,th,th); }
    for(let i=0;i<N;i+=2){ const a=pts[i], b=pts[i+1]; p.F(a.s<0?M.rope[1]:M.rope[0]); p.cap(lerp(a,b,0.2),lerp(a,b,0.6),th*0.4,th*0.4); }
    return pts;
  }

  /* ---------- chapéu de couro pantaneiro (local: origem no centro da aba, x pra frente) ---------- */
  function drawHat(c,p,M,form,o){
    o=o||{}; const sx=o.sx!=null?o.sx:1;
    const brim=(dy,k)=>{ const pts=[]; for(let i=0;i<28;i++){ const a=i/28*PI*2, ca=Math.cos(a), sa=Math.sin(a); pts.push([ca*21*k, sa*3.6*k+dy+(Math.abs(ca)>0.55?(Math.abs(ca)-0.55)*3.2:0)]); } return pts; };
    // aba larga, caída na ponta da frente e de trás
    p.F(M.hat[3]); p.poly(brim(1.6,1));
    p.F(M.hat[2]); p.poly(brim(0.8,1));
    p.F(M.hat[1]); p.poly(brim(0,1));
    clip(c,brim(0,1),()=>{
      p.F(M.hat[2]); p.poly([[-22,-2],[-8,-2],[-8,6],[-22,6]]);
      p.F(M.hat[0]); p.poly([[6,-2.6],[18,-1.2],[19,0.6],[8,0.4]]);
      p.F(M.hat[3]); p.poly([[-22,1.6],[22,1.6],[22,5],[-22,5]]);
      p.F(M.hat[2]); [[-14,-0.6],[-4,1.2],[10,1.4]].forEach(([x,y])=>p.rect(x,y,2.6,0.5)); // costura da beirada
      p.F(M.moss[1]); p.ell(-12,0.4,3.4,1.2); p.F(M.moss[2]); p.rect(-13.6,0.6,2.4,0.7); p.F(M.moss[0]); p.rect(-11.8,-0.4,1.2,0.5);
    });
    p.F(M.hat[3]); p.poly([[17,1.6],[19.6,2.4],[18.6,3.6]]); // rasgo na aba
    // copa arredondada com vinco (pinçada na frente)
    const crown=[[-9.6,0.6],[-10,-4],[-9.2,-8.2],[-6.4,-10.6],[-2,-11.2],[1.4,-10],[4.4,-11],[7.8,-9.6],[9.6,-6],[9.8,0.6],[5,1.6],[0,1.8],[-5,1.6]].map(([x,y])=>[x*sx,y]);
    p.F(M.hat[1]); p.poly(crown);
    clip(c,crown,()=>{
      p.F(M.hat[2]); p.poly([[-11,-12],[-4.4*sx,-12],[-5.4*sx,3],[-11,3]]);
      p.F(M.hat[3]); p.poly([[-11,-12],[-8.2*sx,-12],[-8.6*sx,3],[-11,3]]);
      p.F(M.hat[0]); p.poly([[2.6*sx,-10.4],[7.4*sx,-9.4],[9*sx,-6.2],[6*sx,-8]]);
      p.F(M.hat[2]); p.poly([[-4.6*sx,-10.6],[-1*sx,-10],[1.4*sx,-8.6],[-1.2*sx,-9]]); // vinco
      p.F(M.hat[0]); p.rect(-1*sx,-7,4*sx,0.6);
      // barbela trançada de couro na base da copa
      p.F(M.rope[2]); p.poly([[-11,-2.6],[11,-2.6],[11,1.2],[-11,1.2]]);
      p.F(M.rope[1]); for(let k=0;k<9;k++){ const x=(-9+k*2.3)*sx; p.poly([[x,-2.4],[x+1.4*sx,-2.4],[x+0.6*sx,1]]); }
      p.F(M.rope[0]); for(let k=0;k<9;k++){ const x=(-8.4+k*2.3)*sx; p.rect(x,-2.2,0.6,0.6); }
      p.F(M.hat[3]); p.poly([[-11,1.2],[11,1.2],[11,3],[-11,3]]);
      // musgo e barro
      p.F(M.moss[1]); p.ell(-4*sx,-9.4,3.6,1.6); p.ell(3*sx,-10.2,2,1); p.F(M.moss[2]); p.rect(-6*sx,-8.6,3,0.8); p.F(M.moss[0]); p.rect(-4.6*sx,-10.6,1.6,0.6);
      p.F(M.dirt[1]); p.ell(5*sx,-4.6,1.8,1.2);
    });
    if(form==='plenilunar'){ p.F(M.blood[1]); p.poly([[4,-4],[6.6,-4],[6,-0.4],[5,1.6],[4.4,-1]]); p.ell(12,2.6,1.6,0.8); }
    if(form==='enluarado'){ p.F(M.glow[1]); p.poly([[-7*sx,-9],[-5*sx,-6],[-6*sx,-3],[-6.6*sx,-6]]); }
  }
  function hatAt(c,p,M,form,ox,oy,ang,sc,o){ p.xf(ang,ox,oy); c.scale(sc,sc); drawHat(c,p,M,form,o); p.id(); }

  /* ---------- berrante (local: bocal na origem, chifre crescendo pra +x e curvando pra cima) ---------- */
  function drawHorn(c,p,M,form,glow){
    const N=12, top=[], bot=[], mid=[];
    for(let i=0;i<=N;i++){ const t=i/N, x=24*t, y=-7*t*t+1.4*t, r=0.7+2.9*Math.pow(t,1.5); const dx=24, dy=-14*t+1.4, L=Math.hypot(dx,dy), nx=-dy/L, ny=dx/L;
      top.push([x-nx*r,y-ny*r]); bot.push([x+nx*r,y+ny*r]); mid.push({x,y,r,nx,ny}); }
    const body=top.concat(bot.slice().reverse());
    p.F(M.horn[1]); p.poly(body);
    clip(c,body,()=>{
      p.F(M.horn[2]); p.poly(mid.map(q=>[q.x+q.nx*q.r*0.2,q.y+q.ny*q.r*0.2]).concat(bot.slice().reverse()));
      p.F(M.horn[3]); p.poly(mid.map(q=>[q.x+q.nx*q.r*0.65,q.y+q.ny*q.r*0.65]).concat(bot.slice().reverse()));
      p.F(M.horn[0]); p.poly(mid.slice(3,11).map(q=>[q.x-q.nx*q.r*0.55,q.y-q.ny*q.r*0.55]).concat(mid.slice(3,11).reverse().map(q=>[q.x-q.nx*q.r*0.85,q.y-q.ny*q.r*0.85])));
      // ponta escura do chifre (bocal) e veios
      p.F(M.hornT[1]); p.poly([[-2,-4],[7,-4],[6,4],[-2,4]]); p.F(M.hornT[0]); p.rect(0,-1,5,0.6);
      p.F(M.horn[2]); [[10,-0.4],[14,-1.8],[18,-3.4]].forEach(([x,y])=>p.rect(x,y,2.4,0.4));
      if(form==='enluarado'){ p.F(M.glow[1]); p.poly([[12,-2.4],[15,-4],[15.6,-3.4],[13,-1.6]]); p.poly([[17,-4.4],[20,-7],[20.4,-6.2],[17.6,-3.8]]); }
    });
    // aros de metal (bocal, meio, boca)
    const ring=(i,w)=>{ const q=mid[i]; p.F(M.brass[1]); p.cap({x:q.x-q.nx*(q.r+0.5),y:q.y-q.ny*(q.r+0.5)},{x:q.x+q.nx*(q.r+0.5),y:q.y+q.ny*(q.r+0.5)},w,w); p.F(M.brass[0]); p.rect(q.x-q.nx*q.r-0.5,q.y-q.ny*q.r-0.4,1,0.6); };
    ring(1,1.4); ring(6,1.3); ring(N,1.6);
    // boca do chifre (abertura escura)
    const e=mid[N]; p.F(M.hornT[2]); p.ell(e.x+0.4,e.y,0.9,e.r*0.9,Math.atan2(e.ny,e.nx));
    if(glow){ p.F(M.glow[0]); p.ell(e.x+0.6,e.y,0.6,e.r*0.6,Math.atan2(e.ny,e.nx)); }
    if(form==='plenilunar'){ p.F(M.glow[1]); [3,9].forEach(i=>{ const q=mid[i]; p.rect(q.x-0.5,q.y-q.r*0.5,1,q.r); }); }
  }
  function hornAt(c,p,M,form,ox,oy,ang,sc,glow){ p.xf(ang,ox,oy); c.scale(sc,sc); drawHorn(c,p,M,form,glow); p.id(); }

  /* ---------- faca pantaneira ---------- */
  function drawKnife(p,M,sk,form){
    const h=sk.zh, d=sk.zd, g=sk.zg, tip=sk.ztip;
    const b0={x:h.x-d.x*3,y:h.y-d.y*3};
    p.F(M.wood[1]); p.cap(b0,g,2.8,2.6);
    const n=sideN(b0,g); p.F(M.wood[2]); p.cap(off(b0,n,0.7),off(g,n,0.7),1.2,1);
    p.F(M.wood[0]); p.cap(off(lerp(b0,g,0.2),n,-0.7),off(lerp(b0,g,0.7),n,-0.7),0.6,0.5);
    p.F(M.brass[1]); p.cap(off(g,n,-2.2),off(g,n,2.2),1.4,1.4); p.F(M.brass[0]); p.rect(g.x-0.5,g.y-0.5,0.9,0.7); // guarda
    p.F(M.brass[2]); p.circle(b0,1.1);
    // lâmina: dorso reto, fio curvo até a ponta
    const n2=sideN(g,tip), side=1, w0=2.6;
    const eA={x:g.x+n2.nx*side*w0,y:g.y+n2.ny*side*w0}, eM={x:lerp(g,tip,0.7).x+n2.nx*side*w0*0.9,y:lerp(g,tip,0.7).y+n2.ny*side*w0*0.9};
    const blade=[[g.x,g.y],[tip.x,tip.y],[eM.x,eM.y],[eA.x,eA.y]];
    p.F(M.steel[1]); p.poly(blade);
    p.F(M.steel[2]); p.poly([[lerp(g,eA,0.55).x,lerp(g,eA,0.55).y],[lerp(tip,eM,0.4).x,lerp(tip,eM,0.4).y],[eM.x,eM.y],[eA.x,eA.y]]);
    p.F(M.steel[0]); p.cap(lerp(g,tip,0.1),lerp(g,tip,0.86),0.6,0.5);
    p.F(M.steel[3]); p.poly([[eA.x,eA.y],[eM.x,eM.y],[lerp(eM,tip,0.3).x,lerp(eM,tip,0.3).y]]);
    p.F(M.blood[1]); const s1=lerp(eA,eM,0.5); p.poly([[s1.x,s1.y],[eM.x,eM.y],[lerp(eM,tip,0.5).x,lerp(eM,tip,0.5).y],[lerp(s1,g,0.3).x,lerp(s1,g,0.3).y]]);
    if(form!=='comum'){ p.F(M.glow[1]); p.cap(lerp(eA,eM,0.15),lerp(eA,eM,0.45),0.5,0.5); }
  }

  /* ---------- mãos ---------- */
  function drawFist(p,M,el,wr,sc){
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y); p._c.scale(sc||1.3,sc||1.3);
    p.F(M.skin[1]); p.poly([[-1,-3.6],[4.4,-4],[6.2,-1],[5.8,3.6],[-1,3.8]]);
    p.F(M.skin[2]); p.poly([[-1,1.4],[6,1.2],[5.8,3.6],[-1,3.8]]);
    p.F(M.skin[0]); p.rect(0.4,-3.4,3.6,0.9);
    for(let k=0;k<4;k++){ const y0=-2.9+k*2; p.F(M.skin[1]); p.ell(6.2,y0,1.8,1.1); p.F(M.skin[2]); p.rect(5.6,y0+0.4,1.6,0.5); p.F(M.nail[1]); p.rect(6.8,y0-0.4,0.8,0.7); }
    p.F(M.skin[1]); p.cap(P2(1.6,-3.4),P2(5,-4.8),1.9,1.5); p.F(M.skin[3]); p.rect(2,0.6,3,0.6);
    p.F(M.vein[1]); p.rect(0.2,-1.6,2.6,0.5); p.F(M.dirt[2]); p.rect(3.4,2.2,1.4,0.7);
    p.id();
  }

  /* ---------- braços: manga xadrez; da frente rasgada (carne exposta) ---------- */
  function drawArm(c,u,M,sk,P,front,form){
    const p=mkPen(c,u), sh=front?sk.shF:sk.shB, el=front?sk.elF:sk.elB, wr=front?sk.wrF:sk.wrB; p._c=c; p.id();
    const sn=sideN(sh,el);
    if(front){
      // antebraço: manga rasgada até o meio, pele podre e carne exposta com osso
      const mid=lerp(el,wr,0.46);
      const n=limb(p,M.skin,mid,wr,9,8,{});
      p.F(M.flesh[2]); const f0=lerp(el,wr,0.58), f1=lerp(el,wr,0.86); p.cap(off(f0,n,1.2),off(f1,n,1),3.4,2.6);
      p.F(M.flesh[1]); p.cap(off(f0,n,0.6),off(f1,n,0.4),1.8,1.4);
      p.F(form==='plenilunar'?M.bone[0]:M.bone[1]); p.cap(off(lerp(el,wr,0.62),n,1.4),off(lerp(el,wr,0.8),n,1.2),0.9,0.8);
      p.F(M.vein[1]); p.cap(off(lerp(el,wr,0.5),n,-2.4),off(lerp(el,wr,0.95),n,-2),0.6,0.5);
      limb(p,M.plaid,sh,el,12.2,11,{hl:0.6}); plaidLimb(p,M,sh,el,12.2,11,0);
      limb(p,M.plaid,el,mid,11,10.4,{hi:false}); plaidLimb(p,M,el,mid,11,10.4,0.3);
      // franja rasgada da manga
      const en=sideN(el,wr), ed={x:(wr.x-el.x)/en.L,y:(wr.y-el.y)/en.L};
      p.F(M.plaid[2]); for(let k=-2;k<=2;k++){ const b={x:mid.x+en.nx*k*2,y:mid.y+en.ny*k*2}, L=k%2?2.6:1.4; p.poly([[b.x-en.nx,b.y-en.ny],[b.x+en.nx,b.y+en.ny],[b.x+ed.x*L,b.y+ed.y*L]]); }
      p.F(M.blood[1]); const b=lerp(sh,el,0.5); p.ell(b.x+sn.nx*2.6,b.y+sn.ny*2.6,1.4,1);
      drawKnife(p,M,sk,form); drawFist(p,M,el,wr);
    } else {
      // braço de trás: manga inteira com punho abotoado
      limb(p,M.plaid,el,wr,10.4,9.6,{hl:0.6}); plaidLimb(p,M,el,wr,10.4,9.6,0.2);
      const cf=lerp(el,wr,0.9); p.F(M.plaid[2]); p.cap(off(cf,sideN(el,wr),-4.6),off(cf,sideN(el,wr),4.6),1.4,1.4);
      limb(p,M.plaid,sh,el,11.6,10.6,{hl:0.6}); plaidLimb(p,M,sh,el,11.6,10.6,0.1);
      drawHandB(c,p,M,sk,P,el,wr,form);
    }
    p.F(M.plaid[2]); const c1=lerp(sh,el,0.86); p.cap(off(c1,sn,-4),off(c1,sn,1),0.8,0.7);
  }
  // mão de trás: segura a argola do laço / o berrante / gira o laço
  function drawHandB(c,p,M,sk,P,el,wr,form){
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x), gp={x:wr.x+(wr.x-el.x)/FA*4.4,y:wr.y+(wr.y-el.y)/FA*4.4};
    if(P.horn===1){ hornAt(c,p,M,form,gp.x,gp.y,ang+PI/2+0.9,0.85,false); }
    if(P.lz===0){ // argola pendurada balançando
      const sw=P.lsw||0; p.F(M.rope[1]); p.cap(gp,{x:gp.x+sw*1.6,y:gp.y+3},1.4,1.4);
      ropeRing(p,M,gp.x+sw*2.2+1,gp.y+11,4.6,8.6,sw*0.2,1.5,0);
      p.F(M.rope[2]); p.cap({x:gp.x+sw*2,y:gp.y+3},{x:gp.x+sw*2.8+2,y:gp.y+5},1.8,1.8); // nó (ilhós)
    }
    drawFist(p,M,el,wr,1.24);
  }
  // laço girando sobre a cabeça (parte própria, na frente de tudo)
  function drawSpin(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id(); const wr=sk.wrB, el=sk.elB, gp={x:wr.x+(wr.x-el.x)/FA*4,y:wr.y+(wr.y-el.y)/FA*4};
    const cx=gp.x+8, cy=gp.y-9, ph=(P.lsp||0)*PI/2;
    // rastro do giro: só dois arcos finos atrás da corda (lado que acabou de passar)
    for(let k=0;k<2;k++){ const a0=ph+PI*0.15+k*PI, arc=[]; for(let i=0;i<=8;i++){ const t=a0+i/8*1.5; arc.push({x:cx+Math.cos(t)*(20+k), y:cy+Math.sin(t)*(6+k*0.4)}); }
      p.F(M.swish[1]); for(let i=0;i<8;i++) p.cap(arc[i],arc[i+1],1.6-i*0.15,1.4-i*0.15); }
    const pts=ropeRing(p,M,cx,cy,20,5.6,-0.12,1.8,ph);
    p.F(M.rope[2]); p.cap(gp,pts[0],1.6,1.6);
    const k=pts[0]; p.F(M.rope[3]); p.ell(k.x,k.y,1.6,1.2); p.F(M.rope[1]); p.rect(k.x-0.6,k.y-0.8,1,0.6); // ilhós
  }
  // corda esticada (puxando): da mão de trás, passando pela mão da frente, até a borda da frente
  function drawTaut(c,u,M,sk){
    const p=mkPen(c,u); p.id(); const gp={x:sk.wrB.x+(sk.wrB.x-sk.elB.x)/FA*4.4,y:sk.wrB.y+(sk.wrB.y-sk.elB.y)/FA*4.4};
    const fr={x:sk.wrF.x+(sk.wrF.x-sk.elF.x)/FA*4.4,y:sk.wrF.y+(sk.wrF.y-sk.elF.y)/FA*4.4}, d=Math.hypot(fr.x-gp.x,fr.y-gp.y)||1;
    const t={x:fr.x+(fr.x-gp.x)/d*30,y:fr.y+(fr.y-gp.y)/d*30};
    p.F(M.rope[2]); p.cap(gp,fr,1.7,1.7); p.cap(fr,t,1.7,1.5);
    p.F(M.rope[0]); for(let k=0;k<9;k++){ const q=lerp(gp,t,0.06+k*0.11); p.rect(q.x-0.5,q.y-0.7,1,0.5); }
    p.F(M.skin[1]); p.circle(fr,2.2); p.F(M.skin[2]); p.rect(fr.x-1.6,fr.y+0.4,3.2,0.8); // punho fechado na corda
  }
  function drawSmear(c,u,M,sk,P){
    const p=mkPen(c,u); p.id();
    const sh=sk.shF, w=sk.ztip, r=Math.hypot(w.x-sh.x,w.y-sh.y)+2, a1=Math.atan2(w.y-sh.y,w.x-sh.x), dir=P.smear===2?1:-1;
    const n=10, pts=[]; for(let i=0;i<=n;i++){ const a=a1+dir*(-1.5+1.55*i/n); pts.push([sh.x+Math.cos(a)*r,sh.y+Math.sin(a)*r]); }
    for(let i=n;i>=0;i--){ const a=a1+dir*(-1.5+1.55*i/n), rr=r-2-8*(i/n); pts.push([sh.x+Math.cos(a)*rr,sh.y+Math.sin(a)*rr]); }
    p.F(M.swish[0]); p.poly(pts.map(([x,y])=>[Math.max(1,Math.min(FW-2,x)),Math.max(1,Math.min(GROUND,y))]));
    p.F(M.swish[2]); const q=pts.slice(n-3,n+1); for(let k=0;k<q.length-1;k++) p.cap({x:q[k][0],y:q[k][1]},{x:q[k+1][0],y:q[k+1][1]},0.9,0.9);
  }
  // arremesso do laço: rastro em arco da mão de trás pra frente
  function drawThrowSmear(c,u,M,sk){
    const p=mkPen(c,u); p.id(); const s=sk.shB, w=sk.wrB, r=Math.hypot(w.x-s.x,w.y-s.y)+6, a1=Math.atan2(w.y-s.y,w.x-s.x);
    const n=10, pts=[]; for(let i=0;i<=n;i++){ const a=a1-1.8+1.8*i/n; pts.push([s.x+Math.cos(a)*r,s.y+Math.sin(a)*r]); }
    for(let i=n;i>=0;i--){ const a=a1-1.8+1.8*i/n, rr=r-3-6*(i/n); pts.push([s.x+Math.cos(a)*rr,s.y+Math.sin(a)*rr]); }
    p.F(M.swish[1]); p.poly(pts);
    p.F(M.rope[1]); p.cap(w,{x:w.x+14,y:w.y-2},1.4,1.2); // a corda indo embora
  }

  /* ---------- pernas: brim + perneira de couro + bota com espora ---------- */
  function drawLeg(c,u,M,sk,P,front,form){
    const p=mkPen(c,u), hip=front?sk.hipF:sk.hipB, knee=front?sk.kneeF:sk.kneeB, ank=front?sk.ankleF:sk.ankleB; p.id();
    // coxa de brim
    const nT=limb(p,M.jeans,hip,knee,14.4,12.6,{hl:0.55});
    p.F(M.jeans[0]); p.cap(off(lerp(hip,knee,0.3),nT,-3.6),off(lerp(hip,knee,0.8),nT,-3),1.2,1); // desbotado
    p.F(M.jeans[2]); p.cap(off(lerp(hip,knee,0.5),nT,1.4),off(lerp(hip,knee,0.66),nT,4.8),0.8,0.7);
    p.F(M.jeans[3]); p.cap(off(hip,nT,5.6),off(knee,nT,5),0.6,0.6); // costura
    if(front){ p.F(M.dirt[1]); const d=lerp(hip,knee,0.6); p.ell(d.x+nT.nx*2,d.y+nT.ny*2,2.4,1.4); p.F(M.blood[2]); const b=lerp(hip,knee,0.34); p.ell(b.x-nT.nx*2,b.y-nT.ny*2,1.4,2); }
    // perneira de couro: do joelho até o peito do pé, com tiras e fivelas
    const top=lerp(hip,knee,0.86), bot=lerp(knee,ank,1.02);
    const nS=limb(p,M.chaps,top,bot,13.6,12.4,{hl:0.5,sh:0.55});
    p.F(M.chaps[1]); p.circle(knee,6.8); p.F(M.chaps[0]); p.ell(knee.x-nS.nx*2,knee.y-nS.ny*2,2.6,2);
    p.F(M.chaps[3]); p.cap(off(top,nS,-6.4),off(top,nS,6.4),1.2,1.2); // borda de cima
    // tiras
    [0.36,0.74].forEach(t=>{ const q=lerp(knee,ank,t); p.F(M.boot[2]); p.cap(off(q,nS,-6.6),off(q,nS,6.6),1.6,1.6); p.F(M.boot[0]); p.cap(off(q,nS,-6.2),off(q,nS,2),0.5,0.5);
      p.F(M.brass[1]); p.rect(q.x-nS.nx*4.6-0.8,q.y-nS.ny*4.6-0.8,1.6,1.6); p.F(M.brass[3]); p.rect(q.x-nS.nx*4.6-0.2,q.y-nS.ny*4.6-0.2,0.6,0.6); });
    // franja lateral (atrás)
    p.F(M.chaps[2]); for(let k=0;k<5;k++){ const q=off(lerp(knee,ank,0.12+k*0.17),nS,6.6); p.poly([[q.x,q.y],[q.x+nS.nx*2.4,q.y+nS.ny*2.4+0.6],[q.x+nS.nx*1.2,q.y+nS.ny*1.2+1.6]]); }
    p.F(M.chaps[2]); p.cap(off(lerp(knee,ank,0.5),nS,-1),off(lerp(knee,ank,0.6),nS,3),0.7,0.6); // vinco do couro
    if(front){ p.F(M.moss[1]); const q=lerp(knee,ank,0.9); p.ell(q.x+nS.nx*3,q.y+nS.ny*3,2.6,1.4); p.F(M.moss[0]); p.rect(q.x+nS.nx*2,q.y+nS.ny*2-0.6,1.2,0.5);
      p.F(M.rot[1]); const r=lerp(knee,ank,0.55); p.ell(r.x-nS.nx*3.6,r.y-nS.ny*3.6,1.2,1.6); }
    // bota de cano alto: pé com bico, salto, espora
    const fa=rad((front?P.fF:P.fB)+sk.R); p.xf(fa,ank.x,ank.y); c.scale(1.3,1.3);
    p.F(M.boot[1]); p.poly([[-3.8,-2.6],[2.4,-2.6],[6.4,-0.4],[10.6,1.2],[11.8,3],[-4.2,3]]);
    p.F(M.boot[2]); p.poly([[-4.2,1.4],[11.4,1.8],[11.8,3],[-4.2,3]]);
    p.F(M.boot[0]); p.poly([[0,-2.4],[2.4,-2.4],[6.2,-0.4],[6,0.4],[2.2,-1.2],[0,-1.4]]); p.rect(8,0.8,2.2,0.6);
    p.F(M.boot[3]); p.poly([[-4.6,3],[1.8,3],[1.4,5],[-4.4,5]]); // salto
    p.F(M.boot[2]); p.poly([[1.8,3],[12.2,3],[12,4.2],[1.6,4.2]]); // sola
    p.F(M.dirt[1]); p.ell(5,3.4,2.2,0.8); p.F(M.dirt[2]); p.rect(8.6,3.2,1.6,0.6);
    if(front){ p.F(M.moss[1]); p.ell(-1.4,3.2,2.2,0.9); }
    // espora: haste + roseta
    p.F(M.steel[2]); p.cap(P2(-3.6,0.4),P2(-7,0.2),0.9,0.9);
    p.F(M.boot[3]); p.cap(P2(-3.4,0.2),P2(3,1.2),0.8,0.8); // correia
    const sp=form==='plenilunar';
    p.F(M.steel[1]); for(let k=0;k<6;k++){ const a=k/6*PI*2+(P.lsw||0)*0.4; p.cap(P2(-7.4,0.2),P2(-7.4+Math.cos(a)*2.4,0.2+Math.sin(a)*2.4),0.6,0.4); }
    p.F(sp?M.glow[0]:M.steel[0]); p.circle(P2(-7.4,0.2),0.9);
    p.id();
  }

  /* ---------- tronco: camisa xadrez, colete de couro, cinto, bainha, berrante, rolo do laço ---------- */
  const TORSO=[[-10.2,8.4],[-10.6,0],[-11,-10],[-11.6,-20],[-12,-28],[-11.2,-34],[-8,-38.2],[-2,-40],[4.6,-39.6],[9.6,-37],[12.4,-31],[13.4,-24],[13.6,-16],[13.4,-8],[13,0],[12.4,8.4]];
  const VEST=[[-12.4,-1.6],[-11.8,-20],[-12.4,-28],[-11.6,-34],[-8.4,-38.6],[-3,-40.2],[1.6,-38.6],[3.6,-33],[5.6,-24],[6.8,-14],[7.8,-5],[8.4,0.2],[2,0.6],[-6,0.4]];
  const VEST2=[[12.6,-30],[13.6,-24],[13.8,-16],[13.6,-8],[13.4,-1],[11.2,-0.6],[11.4,-8],[11.8,-18],[11.6,-27]];
  function plaidFill(p,M,sk,u0,u1,v0,v1,t){
    const L=k=>M.plaid[Math.min(3,k+t)], CK=k=>M.check[Math.min(3,k+t)];
    p.F(L(1)); p.poly(W(sk,[[u0,v0],[u1,v0],[u1,v1],[u0,v1]]));
    for(let v=v0+1;v<v1;v+=4.4){ p.F(CK(1)); p.poly(W(sk,[[u0,v],[u1,v],[u1,v+1.6],[u0,v+1.6]])); }
    for(let uu=u0+1.4;uu<u1;uu+=4.2){ p.F(CK(1)); p.poly(W(sk,[[uu,v0],[uu+1.4,v0],[uu+1.4,v1],[uu,v1]]));
      for(let v=v0+1;v<v1;v+=4.4){ p.F(CK(0)); p.poly(W(sk,[[uu,v],[uu+1.4,v],[uu+1.4,v+1.6],[uu,v+1.6]])); } }
    p.F(M.redc[Math.min(3,1+t)]); for(let uu=u0+3.4;uu<u1;uu+=8.4) p.poly(W(sk,[[uu,v0],[uu+0.5,v0],[uu+0.5,v1],[uu,v1]]));
  }
  function drawTorso(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    const shape=W(sk,TORSO);
    p.F(M.plaid[1]); p.poly(shape);
    clip(c,shape,()=>{
      plaidFill(p,M,sk,-14,16,-42,10,0);
      // sombra: costas e barriga (xadrez escurecido)
      clip(c,W(sk,[[-14,12],[-14,-42],[-7.4,-42],[-8.4,-30],[-7.6,-18],[-6.4,-6],[-4,4],[16,4],[16,12]]),()=>plaidFill(p,M,sk,-14,16,-42,10,1));
      p.F(M.plaid[3]); p.poly(W(sk,[[-14,9],[16,9],[16,12],[-14,12]]));
      // dobras da camisa no peito
      p.F(M.plaid[3]); [[[8.6,-20],[12.6,-22],[12.8,-21.2],[8.8,-19.2]],[[9,-12],[13,-13.6],[13.2,-12.8],[9.2,-11.2]]].forEach(f=>p.poly(W(sk,f)));
      // botões e rasgo com pele
      p.F(M.check[0]); [-32,-24,-16,-8].forEach(v=>{ const q=Wp(sk,11,v); p.rect(q.x-0.5,q.y-0.5,1,1); });
      p.F(M.plaid[3]); p.poly(W(sk,[[9.4,-17],[12.6,-15.6],[12.8,-11],[10,-12.4]]));
      p.F(M.skin[2]); p.poly(W(sk,[[9.8,-16.2],[12.2,-15.2],[12.4,-12],[10.4,-13]])); p.F(M.vein[1]); p.poly(W(sk,[[10.6,-15.4],[11.2,-15.2],[11.6,-12.6],[11,-12.8]]));
      p.F(M.blood[1]); [[12,-26,1.4,1.8],[11.6,-6,1.6,1.1]].forEach(([uu,vv,a,b])=>{ const q=Wp(sk,uu,vv); p.ell(q.x,q.y,a,b); });
      if(form==='plenilunar'){ p.F(M.blood[1]); p.poly(W(sk,[[8,-30],[14,-30],[14,-2],[9,-4],[8.6,-14]])); p.F(M.blood[2]); p.poly(W(sk,[[9,-12],[14,-14],[14,-4],[10,-5]])); }
      // calça (abaixo do cinto)
      p.F(M.jeans[1]); p.poly(W(sk,[[-14,0.4],[16,0.4],[16,12],[-14,12]])); p.F(M.jeans[2]); p.poly(W(sk,[[-14,0.4],[-4,0.4],[-4,12],[-14,12]]));
    });
    // colete de couro
    const vs=W(sk,VEST);
    p.F(M.vest[1]); p.poly(vs);
    clip(c,vs,()=>{
      p.F(M.vest[0]); p.poly(W(sk,[[-4,-40],[2,-39],[3.4,-34],[-2,-34.6]])); p.poly(W(sk,[[1,-30],[4.6,-28],[6.4,-14],[4,-16]]));
      p.F(M.vest[2]); p.poly(W(sk,[[-14,2],[-14,-42],[-8.6,-42],[-9.4,-30],[-8.6,-18],[-7.6,-6],[-5,2]]));
      p.F(M.vest[3]); p.poly(W(sk,[[-14,2],[-14,-42],[-11,-42],[-11.6,-30],[-10.8,-18],[-10,2]]));
      // costura pespontada e bolso
      p.F(M.vest[2]); for(let v=-36;v<-2;v+=3){ const q=Wp(sk,1.8+((v+36)/34)*5.2,v); p.rect(q.x-0.4,q.y,0.8,1.2); }
      p.F(M.vest[2]); p.poly(W(sk,[[-2,-20],[4,-20.6],[4.4,-15],[-1.6,-14.6]])); p.F(M.vest[3]); p.poly(W(sk,[[-2,-20],[4,-20.6],[4,-19.6],[-2,-19]]));
      p.F(M.vest[0]); p.poly(W(sk,[[-1.4,-18.6],[3.2,-19],[3.2,-18.4],[-1.4,-18]]));
      // couro gasto, mofo e rasgo nas costas com carne
      p.F(M.vest[0]); [[-4,-28,1.8,1.2],[2,-8,2.4,1.2]].forEach(([uu,vv,a,b])=>{ const q=Wp(sk,uu,vv); p.ell(q.x,q.y,a,b); });
      p.F(M.moss[2]); { const q=Wp(sk,-9,-6); p.ell(q.x,q.y,2.2,3); } p.F(M.moss[1]); { const q=Wp(sk,-8.4,-7); p.ell(q.x,q.y,1.2,1.6); }
      p.F(M.vest[3]); p.poly(W(sk,[[-11,-26],[-7,-28.4],[-4.6,-24],[-5.4,-17.6],[-8.6,-16],[-11,-19.4]]));
      p.F(M.flesh[3]); p.poly(W(sk,[[-10.4,-25.4],[-7.2,-27.4],[-5.4,-23.6],[-6,-18.6],[-8.6,-17.2],[-10.4,-19.8]]));
      p.F(M.flesh[2]); p.poly(W(sk,[[-9.8,-24.6],[-7.4,-26.2],[-6,-23.2],[-6.6,-19.6],[-8.6,-18.4],[-9.6,-20.4]])); p.F(M.flesh[1]); p.poly(W(sk,[[-9,-22.4],[-6.8,-23],[-6.6,-22],[-8.8,-21.6]]));
      p.F(form==='plenilunar'?M.bone[0]:M.bone[1]); [[-23.4],[-20.8]].forEach(([v])=>p.poly(W(sk,[[-9.8,v],[-6,v-0.8],[-6,v],[-9.8,v+0.8]])));
      if(form==='enluarado'){ p.F(M.glow[1]); [[[-10,-24],[-12,-31],[-11.2,-31.4],[-9.4,-24.6]],[[-6,-18],[-2.6,-12],[-3.2,-11.4],[-6.4,-17.4]],[[-11,-12],[-8,-6],[-8.6,-5.6],[-11.4,-11]]].forEach(f=>p.poly(W(sk,f))); }
      if(form==='plenilunar'){ p.F(M.blood[1]); p.poly(W(sk,[[-2,-14],[6,-16],[7.6,-2],[0,0]])); }
    });
    p.F(M.vest[3]); p.poly(W(sk,[[1.6,-38.6],[3.6,-33],[5.6,-24],[6.8,-14],[7.8,-5],[8.4,0.2],[7.4,0.2],[6.8,-5],[5.8,-14],[4.6,-24],[2.6,-33],[0.6,-38]])); // borda do colete
    const v2=W(sk,VEST2); p.F(M.vest[1]); p.poly(v2); p.F(M.vest[0]); p.poly(W(sk,[[12.4,-28],[13.2,-24],[13.2,-18],[12.4,-18]])); p.F(M.vest[3]); p.poly(W(sk,[[11.2,-0.6],[11.4,-8],[11.8,-18],[11.6,-27],[12.2,-27],[12.4,-18],[12,-8],[11.8,-0.6]]));
    // cinto largo com fivela
    p.F(M.boot[1]); p.poly(W(sk,[[-12.4,-3.6],[13.6,-3.6],[13.4,0.8],[-12.2,0.8]]));
    p.F(M.boot[0]); p.poly(W(sk,[[-4,-3.6],[13.6,-3.6],[13.6,-2.8],[-4,-2.8]])); p.F(M.boot[3]); p.poly(W(sk,[[-12.2,0],[13.4,0],[13.4,0.8],[-12.2,0.8]]));
    p.F(M.boot[2]); for(let k=0;k<5;k++){ const q=Wp(sk,-9+k*4,-1.4); p.rect(q.x-0.4,q.y-0.4,0.8,0.8); }
    p.F(M.brass[2]); p.poly(W(sk,[[10.6,-4.4],[14,-4.4],[14,1.6],[10.6,1.6]])); p.F(M.brass[1]); p.poly(W(sk,[[11,-4],[13.6,-4],[13.6,1.2],[11,1.2]]));
    p.F(M.brass[3]); p.poly(W(sk,[[11.8,-3],[12.8,-3],[12.8,0.2],[11.8,0.2]])); p.F(M.brass[0]); p.poly(W(sk,[[11.2,-4],[13,-4],[13,-3.4],[11.2,-3.4]]));
    // bainha da faca (vazia) no quadril da frente
    p.F(M.vest[2]); p.poly(W(sk,[[4,-3.8],[8,-3.8],[7.2,6],[5.6,13],[4.6,12.6],[3.8,4]]));
    p.F(M.vest[1]); p.poly(W(sk,[[4.6,-3],[7.2,-3],[6.6,5],[5.4,11.4],[4.8,11],[4.4,4]]));
    p.F(M.vest[3]); [[-1],[3],[7]].forEach(([v])=>{ const q=Wp(sk,5.6,v); p.rect(q.x-0.4,q.y,0.8,0.8); });
    p.F(M.brass[1]); { const q=Wp(sk,5.8,-2.6); p.rect(q.x-0.8,q.y-0.6,1.6,1.2); }
    // berrante pendurado na cintura (atrás)
    if(P.horn===0){ const q=Wp(sk,-5,-1); p.F(M.rope[2]); p.cap(Wp(sk,-4,-3),Wp(sk,-10,1),1,1); hornAt(c,p,M,form,q.x+2,q.y+3,sk.sa+PI+rad(8),0.74,false); }
    // espinhos de osso nas costas (plenilunar)
    if(form==='plenilunar'){ p.F(M.bone[1]); [[-11.4,-32,-16.6,-35],[-12,-24,-17.4,-24.6],[-11.4,-16,-16,-14]].forEach(([u0,v0,u1,v1])=>{ const a=Wp(sk,u0,v0+1.8), b=Wp(sk,u1,v1), d=Wp(sk,u0+0.6,v0-1.8); p.poly([[a.x,a.y],[b.x,b.y],[d.x,d.y]]); });
      p.F(M.bone[0]); [[-11.6,-32,-15,-34],[-12,-24,-15.6,-24.4]].forEach(([u0,v0,u1,v1])=>{ const a=Wp(sk,u0,v0-0.4), b=Wp(sk,u1,v1), d=Wp(sk,u0+0.4,v0-1.4); p.poly([[a.x,a.y],[b.x,b.y],[d.x,d.y]]); }); }
  }
  // rolo do laço no ombro (atravessado nas costas) — parte própria por cima do tronco
  function drawCoil(c,u,M,sk,P){
    if(!P.coil) return; const p=mkPen(c,u); p.id();
    const ctr=Wp(sk,-3.4,-22), a=sk.sa+rad(8);
    for(let k=0;k<3;k++) ropeRing(p,M,ctr.x+k*0.9,ctr.y+k*0.5,6.6+k*0.9,12.6+k*0.6,a,1.5,k*0.7);
    p.F(M.rope[3]); const t=Wp(sk,-4,-9); p.cap(t,Wp(sk,-2.4,-6),1.4,1.2); p.F(M.rope[1]); p.cap(Wp(sk,-4.6,-9.6),Wp(sk,-3.8,-5.6),1.2,1); // ponta solta
    p.F(M.rope[2]); const b0=Wp(sk,-6,-35), b1=Wp(sk,-2,-34); p.cap(b0,b1,2,2); // amarração
  }

  /* ---------- cabeça: barba rala, bigode, olhos de lua, chapéu de couro com barbicacho ---------- */
  function drawHead(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.xf(sk.ha,sk.neck.x,sk.neck.y); c.scale(HS,HS);
    // pescoço grosso com veias
    p.F(M.skin[1]); p.poly([[-4.6,4],[5,4],[5.6,-4],[-4,-6]]);
    p.F(M.skin[2]); p.poly([[-4.6,4],[-1,4],[-1.4,-5.4],[-4,-6]]);
    p.F(M.vein[1]); p.poly([[2,-3],[2.8,-3],[3.6,3],[2.8,3]]); p.rect(-0.6,-1,0.7,4);
    // crânio
    p.F(M.skin[1]); p.ell(2.4,-12.2,9.4,9.2);
    p.poly([[-3.6,-6],[11.4,-7.6],[12.6,-4.2],[6,-2.4],[-2,-3]]);
    p.F(M.skin[2]); p.poly([[-7.4,-15],[-5.2,-6],[0,-2.4],[6,-2.4],[2,-5],[-2,-9],[-3,-14],[-5.6,-18]]);
    p.F(M.skin[3]); p.poly([[-7.4,-14],[-6.6,-9],[-4.6,-5.2],[-5.2,-11]]);
    p.F(M.skin[0]); p.poly([[5,-8.4],[9.6,-9],[8.8,-7.6],[5.4,-7.4]]); // maçã do rosto
    p.F(M.vein[1]); p.poly([[2,-17],[3,-14],[2.4,-11],[1.8,-13.6]]); p.poly([[5.4,-16],[6.6,-14.6],[6.2,-14]]);
    // orelha
    p.F(M.skin[1]); p.ell(-2.6,-11,2.3,3.2); p.F(M.skin[3]); p.ell(-2.4,-10.8,1,1.8); p.F(M.flesh[2]); p.rect(-3.6,-8.6,1.1,1.2);
    // cabelo grisalho aparecendo sob o chapéu, costeleta, barba rala
    p.F(M.hair[1]); p.poly([[-7.8,-14.6],[-6.6,-17.6],[-1,-18],[-2.4,-15.6],[-4.8,-11.6],[-7.6,-9.6]]);
    p.F(M.hair[0]); p.rect(-6.4,-15.4,2.4,0.6);
    p.F(M.hair[1]); p.poly([[-1.2,-15.4],[0.8,-15.6],[1,-8],[-0.6,-8.6]]);
    p.F(M.hair[2]); for(let k=0;k<7;k++){ const x=1+k*1.5, y=-4.6+(k%2)*0.8; p.rect(x,y,0.7,0.7); } // barba por fazer
    // sobrancelha grossa, olho de lua
    p.F(M.hair[1]); p.poly([[4.4,-12.8],[8.4,-13.8],[12,-12.6],[11.8,-11.8],[8.4,-12.6],[4.6,-11.8]]);
    p.F(M.skin[3]); p.ell(8.4,-9.8,2.8,2.1);
    p.F(M.eye[1]); p.ell(8.6,-9.8,2,1.5); p.F(M.eye[0]); p.rect(8.2,-10.4,1.2,0.8); p.F(M.eye[2]); p.rect(9.4,-9.4,0.9,0.7);
    p.F(M.skin[3]); p.ell(12.2,-9.8,0.9,1.3); p.F(M.eye[1]); p.rect(11.9,-10.1,0.8,0.9);
    // nariz largo
    p.F(M.skin[1]); p.poly([[11,-10.6],[14.6,-6.6],[13.6,-5.4],[11.2,-6]]);
    p.F(M.skin[3]); p.rect(12.6,-6,1.4,0.8); p.F(M.skin[0]); p.rect(11.8,-9.4,0.8,1.6);
    // boca de cima e bigode cerrado
    p.F(M.mouth[1]); p.poly([[5,-5],[13.4,-5.2],[13.2,-2.4],[5,-2.2]]);
    p.F(M.teeth[1]); [[6.6,-5.2,1.2,1.8],[8.2,-5.2,1.2,1.4],[10,-5.2,1.1,1.8],[11.6,-5.2,1,1.2]].forEach(([x,y,w,h])=>p.rect(x,y,w,h));
    p.F(M.hair[1]); p.poly([[7.6,-6.4],[14,-6.8],[14.6,-5],[13,-4.6],[11.6,-5.4],[9.4,-5.2],[7.8,-5.4]]);
    p.F(M.hair[0]); p.rect(9,-6.4,3,0.5);
    p.F(M.rot[1]); p.ell(1,-8,1.6,1.2); p.F(M.rot[2]); p.rect(0.4,-8.4,1,0.9);
    if(form!=='comum'){ p.F(M.glow[0]); p.rect(8,-10.2,1.6,1); p.F(M.glow[1]); p.rect(11.9,-10.1,0.8,0.9); }
    p.id();
    if(P.hat>=0.5){
      const o=sk.H(2.4,-16.6); hatAt(c,p,M,form,o.x,o.y,sk.ha+rad(P.ht),HS,{});
      // barbicacho: cordão solto do chapéu, pendurado sob o queixo com a conta
      const a=sk.H(-3,-15), b=sk.H(1.4,1.8), d=sk.H(6,-1.4); p.F(M.rope[3]); p.cap(a,b,0.8,0.8); p.cap(b,d,0.8,0.8);
      p.F(M.rope[1]); p.circle(b,1.1); p.F(M.rope[0]); p.rect(b.x-0.6,b.y-0.8,0.8,0.6);
    }
  }
  function drawJaw(c,u,M,sk,P){
    const p=mkPen(c,u); const h=sk.H(2.6,-3.6); p.xf(sk.ha+rad(P.jaw),h.x,h.y); c.scale(HS,HS);
    p.F(M.skin[1]); p.poly([[-2,-1.4],[11.2,-0.8],[12,1.6],[11,5.2],[6.4,6.8],[0.6,6],[-2.4,2.8]]);
    p.F(M.skin[2]); p.poly([[-2.4,2.8],[0.6,6],[6.4,6.8],[11,5.2],[9,4.6],[4,5],[0,3.6]]);
    p.F(M.skin[3]); p.poly([[1,6],[6.4,6.8],[9.4,6],[4,6]]);
    p.F(M.mouth[1]); p.poly([[2.6,-0.8],[10.4,-0.4],[10.4,1.4],[3,1.2]]);
    p.F(M.teeth[1]); [[4.2,-1,1.2,1.5],[6,-1,1.2,1.9],[7.8,-1,1.2,1.4],[9.4,-1,1,1.7]].forEach(([x,y,w,h])=>p.rect(x,y,w,h));
    p.F(M.hair[2]); for(let k=0;k<6;k++) p.rect(1.4+k*1.7,3+(k%2)*1.2,0.8,0.8); // barba rala
    p.F(M.hair[1]); p.rect(9.6,3.6,1.6,1.4);
    const L=2+(P.drool%4)*1.2+(P.jaw>30?2:0);
    p.F(M.blood[1]); p.poly([[10,4.6],[11.4,4],[11.2,4+L],[10.6,5+L]]); p.ell(10.9,5+L,1,1);
    p.id();
  }
  function drawMouthIn(c,u,M,sk,P){
    if(P.jaw<16) return; const p=mkPen(c,u); p.id();
    const a=sk.H(5,-2.4), b=sk.H(13,-2.6), h=sk.H(2.6,-3.6), ja=sk.ha+rad(P.jaw), jc=Math.cos(ja), js=Math.sin(ja);
    const J=(x,y)=>({x:h.x+(x*jc-y*js)*HS,y:h.y+(x*js+y*jc)*HS}), d=J(10.4,0.6), e=J(3,0.6);
    p.F(M.mouth[2]); p.poly([[a.x,a.y],[b.x,b.y],[d.x,d.y],[e.x,e.y]]);
    p.F(M.mouth[3]); const m=lerp(lerp(a,b,0.3),lerp(e,d,0.3),0.5); p.circle(m,1.6);
  }
  // lenço vermelho desbotado no pescoço (nó na frente, pontas no peito)
  function drawScarf(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    p.F(M.scarf[1]); p.poly(W(sk,[[-2.4,-40.4],[8,-40],[9,-36.4],[-2,-36.4]]));
    p.F(M.scarf[2]); p.poly(W(sk,[[-2.4,-37.6],[8.6,-37.2],[9,-36.4],[-2,-36.4]])); p.F(M.scarf[3]); p.poly(W(sk,[[-2.4,-40.4],[0.6,-40.4],[0.8,-36.4],[-2,-36.4]]));
    p.F(M.scarf[0]); p.poly(W(sk,[[2,-40.2],[7,-39.8],[6.8,-39.2],[2.2,-39.4]]));
    const sw=Math.sin(P.hx*0.7+P.lean*0.08)*0.8;
    // triângulo caído no peito
    p.F(M.scarf[1]); p.poly(W(sk,[[5.6,-37.6],[10.6,-37.2],[12+sw,-29.6],[9.4+sw,-27.4],[7.4+sw,-30.4]]));
    p.F(M.scarf[2]); p.poly(W(sk,[[9.4+sw,-27.4],[12+sw,-29.6],[11.4+sw,-30.8],[9.6+sw,-29]])); p.poly(W(sk,[[5.6,-37.6],[7.4,-37.4],[8+sw,-31.4],[7.4+sw,-30.4]]));
    p.F(M.scarf[0]); p.poly(W(sk,[[8.4,-37],[9.4,-37],[10.6+sw,-31],[10+sw,-30.8]]));
    p.F(M.scarf[3]); [[9.4+sw,-27.4],[10.6+sw,-28.6]].forEach(([uu,vv])=>{ const q=Wp(sk,uu,vv); p.rect(q.x-0.4,q.y,0.8,1.2); }); // fiapos
    p.F(M.scarf[2]); p.circle(Wp(sk,8,-37.8),2.1); p.F(M.scarf[0]); { const q=Wp(sk,7.6,-38.6); p.rect(q.x-0.4,q.y-0.4,1,0.8); }
    p.F(M.blood[1]); { const q=Wp(sk,10.6,-32); p.ell(q.x,q.y,0.9,1.3); }
    if(form==='enluarado'){ p.F(M.glow[1]); { const q=Wp(sk,9,-34); p.rect(q.x,q.y,1,0.6); } }
  }
  // berrante na boca (soprando) — parte própria por cima da cabeça
  function drawBlow(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id(); const o=sk.H(12.6,-3.4);
    hornAt(c,p,M,form,o.x,o.y,sk.ha-rad(18),HS*1.7,P.blow>=2);
    if(P.blow>=1){ p.F(M.skin[0]); const ch=sk.H(9,-4.6); p.ell(ch.x,ch.y,1.6,1.4); } // bochecha estufada
  }
  function drawLooseHat(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id(); const y=GROUND-4-P.hdy;
    hatAt(c,p,M,form,AX+P.hdx,y,rad(P.hdr),HS,{});
  }
  // laço espalhado no chão (morte)
  function drawSpill(c,u,M,sk,P){
    const p=mkPen(c,u); p.id(); const n=P.spill|0;
    const L=[[AX+14,GROUND-3,10,2.4],[AX+30,GROUND-2.4,8,2],[AX+44,GROUND-2,6,1.6]];
    for(let k=0;k<Math.min(3,n);k++){ const [x,y,rx,ry]=L[k]; ropeRing(p,M,x,y,rx,ry,0.05*k,1.4,k); }
    if(n>=2){ p.F(M.rope[1]); p.cap(P2(AX+4,GROUND-2),P2(AX+24,GROUND-1.6),1.3,1.3); }
  }

  /* ---------- adereços: argola do laço voando (xLaco) e onda do berrante (xBerrante) ---------- */
  const LW=44, LH=30, LG=18, LAX=22;
  const WW=84, WH=60, WG=34, WAX=10;
  function frameProp(form,anim,st,K){
    const M=mats(form); let parts, PW, PH, PG, PAX;
    if(anim==='xLaco'){ PW=LW; PH=LH; PG=LG; PAX=LAX; const s=((st|0)%4+4)%4, R=[[13,5.6],[11,5],[8.4,4.2],[5.6,3.4]][s];
      parts=[
        {noShade:true,noRim:true,smear:true,draw:(c,u)=>{ const p=mkPen(c,u); p.id(); if(s<2){ p.F(M.swish[1]); p.ell(PAX,PG,R[0]+3,R[1]+1.6); p.F(M.swish[0]); p.ell(PAX,PG,R[0]+1.4,R[1]+0.6); } }},
        {draw:(c,u)=>{ const p=mkPen(c,u); p.id(); const pts=ropeRing(p,M,PAX,PG,R[0],R[1],0,1.7,s*0.9);
          const k=pts[0]; p.F(M.rope[3]); p.ell(k.x,k.y,1.8,1.4); p.F(M.rope[1]); p.rect(k.x-0.6,k.y-0.8,1.2,0.6); // ilhós
          p.F(M.rope[2]); p.cap(k,P2(0,PG-1-s*0.4),1.6,1.6); }},
      ];
    } else { PW=WW; PH=WH; PG=WG; PAX=WAX; const s=((st|0)%3+3)%3;
      parts=[{noShade:true,noRim:true,smear:true,draw:(c,u)=>{ const p=mkPen(c,u); p.id();
        for(let k=0;k<3;k++){ const r=10+k*14+s*6; if(r>WW-PAX-6) continue; const th=3.4-k*0.8-s*0.4;
          const arc=[]; for(let i=0;i<=12;i++){ const a=-0.9+1.8*i/12; arc.push([PAX+Math.cos(a)*r,PG+Math.sin(a)*r]); }
          for(let i=12;i>=0;i--){ const a=-0.9+1.8*i/12; arc.push([PAX+Math.cos(a)*(r-th),PG+Math.sin(a)*(r-th)]); }
          p.F(k===0?M.glow[0]:M.glow[1]); p.poly(arc); if(th>2){ p.F(M.glow[2]); const a0=arc.slice(4,9); a0.forEach(([x,y])=>p.rect(x-0.4,y-0.4,0.9,0.9)); } }
        p.F(M.glow[1]); [[30,-14],[44,10],[56,-4]].forEach(([dx,dy],i)=>{ if(i>s) return; p.poly([[PAX+dx,PG+dy],[PAX+dx+3,PG+dy-1],[PAX+dx+1,PG+dy+2]]); });
      }}];
    }
    const cv=compose({FW:Math.round(PW*K),FH:Math.round(PH*K),GROUND:PH*K,parts,M,step:5,flash:0,rim:RIM[form]});
    cv._ax=PAX*K; cv._gy=PG*K; return cv;
  }

  /* ---------- montagem ---------- */
  const cache=PIX.cache();
  function frame(form,anim,fi,step=5,Pov,pk){
    const K=PIX.getK(), key=(pk!=null?'#'+pk+'|'+form:form+'|'+anim+'|'+fi+'|'+step)+'@'+K;
    const hit=cache.get(key); if(hit){ cache.delete(key); cache.set(key,hit); return hit; }
    if(ANIMS[anim]&&ANIMS[anim].prop){ const st=Pov&&Pov.st!=null?Math.round(Pov.st):fi; const cv=frameProp(form,anim,st,K); cache.set(key,cv); return cv; }
    const P=Pov?Object.assign({},REST,Pov):poseOf(anim,fi), M=mats(form), sk=skeleton(P);
    const parts=[
      {back:true, draw:(c,u)=>drawArm(c,u,M,sk,P,false,form)},
      {back:true, draw:(c,u)=>drawLeg(c,u,M,sk,P,false,form)},
      {draw:(c,u)=>drawLeg(c,u,M,sk,P,true,form)},
      {draw:(c,u)=>drawTorso(c,u,M,sk,P,form)},
      {draw:(c,u)=>drawCoil(c,u,M,sk,P)},
      {draw:(c,u)=>{ drawHead(c,u,M,sk,P,form); drawMouthIn(c,u,M,sk,P); }}, {draw:(c,u)=>drawJaw(c,u,M,sk,P)}, {draw:(c,u)=>drawScarf(c,u,M,sk,P,form)},
    ];
    if(P.horn===2) parts.push({draw:(c,u)=>drawBlow(c,u,M,sk,P,form)});
    if(P.smear===1||P.smear===2) parts.push({noShade:true, smear:true, noRim:true, draw:(c,u)=>drawSmear(c,u,M,sk,P)});
    if(P.smear===3) parts.push({noShade:true, smear:true, noRim:true, draw:(c,u)=>drawThrowSmear(c,u,M,sk)});
    parts.push({draw:(c,u)=>drawArm(c,u,M,sk,P,true,form)});
    if(P.lz===1) parts.push({draw:(c,u)=>drawSpin(c,u,M,sk,P,form)});
    if(P.lz===2) parts.push({draw:(c,u)=>drawTaut(c,u,M,sk)});
    if(P.hloose>=0.5) parts.push({draw:(c,u)=>drawLooseHat(c,u,M,sk,P,form)});
    if(P.spill>=1) parts.push({draw:(c,u)=>drawSpill(c,u,M,sk,P)});
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM[form]}); if(step>=4) heavyOutline(cv);
    const sc=q=>({x:q.x*K,y:q.y*K}), gp={x:sk.wrB.x+(sk.wrB.x-sk.elB.x)/FA*4.4,y:sk.wrB.y+(sk.wrB.y-sk.elB.y)/FA*4.4};
    cv._eye=sc(sk.H(8.6,-9.8)); cv._mouth=sc(sk.H(10,-2)); cv._hand=sc(sk.wrF); cv._head=sc(sk.H(3,-13)); cv._blade=sc(sk.ztip); cv._handB=sc(sk.wrB); cv._rope=sc(gp); cv._horn=sc(sk.H(36,-12));
    cache.set(key,cv); if(cache.size>900) cache.delete(cache.keys().next().value);
    return cv;
  }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame,framePose:function(form,anim,P,key){ return frame(form,anim,0,5,P,key); }};
})();
