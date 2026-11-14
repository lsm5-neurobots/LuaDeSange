/* GARCOM — fonte de arte (editável). Build: npm run art
   Zumbi Garçom (comum da Lapa): o garçom de boteco carioca que continua servindo depois de morto.
   Vertical e magro, em ponta de pé. Camisa branca de manga arregaçada, COLETE PRETO de botões, gravata borboleta
   vinho, AVENTAL LONGO branco até a canela (bloco de pedidos no bolso, abridor pendurado no cordão), calça preta e
   sapato de verniz. Careca lustrosa com franja grisalha, BIGODÃO de garçom português, olheiras fundas.
   BANDEJA REDONDA de alumínio erguida na mão de trás (acima do ombro) com tulipas de chope; garrafa de cerveja
   na mão da frente, pano de prato no cordão do avental. Corrupção: olhos de lua, chope virou sangue/ácido, costelas no rasgo
   do colete, copos rachados.
   Diferente do Malandro (terno de linho branco + panamá) e do Seresteiro (paletó creme + boina + violão): aqui o
   bloco escuro é o tronco (colete) e o claro é a parte de baixo (avental); a bandeja faz a silhueta.
   Golpes: leque de copos (fan, throwAt), bandejada (slam), giro de desvio (spin), bandeja vazia (empty, fraqueza).
   Sem bandeja (quebrada): idleX, walkX, slamX (garrafada). Adereços: xGlass (tulipa voando), xShard (cacos).
   Hi-bit: honra PIX.getK(). */
const GARCOM=(function(){
  const {rad,lerp,P2,mkPen,compose}=PIX;
  const FW=196, FH=160, GROUND=150, AX=80;
  const RIM={comum:'#d8e4f4', enluarado:'#9ff6ff', plenilunar:'#ffb46a'};

  /* ---------- materiais ---------- */
  // forma pode vir com sufixo do motor ('comum~sem' = bandeja quebrada): a paleta usa só a base
  const baseOf=form=>String(form).split('~')[0];
  function mats(form){
    form=baseOf(form);
    const m={
      skin:['#c9d6bc','#8c9c80','#5c6a66','#363c50'],
      vein:['#9ab4c8','#62809a','#40567a','#283052'],
      rot:['#bab68c','#807c5c','#565452','#322c3a'],
      flesh:['#f6ae94','#c25a5e','#7a3a4a','#4a1c34'],
      bone:['#fff4d8','#dccfa6','#a09070','#605040'],
      shirt:['#fffaf0','#e4dccc','#a69cba','#5c5280'],
      vest:['#6c6484','#363044','#221e30','#110d1a'],
      button:['#fff2c4','#d8b45a','#946a2a','#4e3416'],
      apron:['#fffef6','#f0e8d2','#bcb0b4','#706288'],
      pants:['#5a5670','#2c2838','#1c1826','#0e0a16'],
      shoe:['#a8a0bc','#2c2030','#1a1220','#0a060c'],
      tie:['#f0687a','#b0303e','#6c1a30','#3a0c1c'],
      tray:['#ffffff','#c6ccd4','#7c8498','#3e4460'],
      glass:['#f4feff','#c4e4f0','#86b0c8','#486a8c'],
      beer:['#ffe680','#eab020','#b2681a','#6c3410'],
      foam:['#fffdf0','#fff0c8','#d8c49a','#9a8868'],
      bottle:['#eaa860','#8c4a1c','#582a12','#30140a'],
      label:['#fff4cc','#e6c25a','#a6802e','#5e4418'],
      hair:['#ffffff','#d2cedc','#8e88a2','#4e4862'],
      stache:['#ffffff','#dcd8e4','#9a94ae','#585270'],
      eye:['#ffffff','#fff4a8','#e0b448','#8a6420'],
      mouth:['#7c2e3e','#4c1828','#2e0c1a','#1a0610'],
      teeth:['#fbf0c0','#d8c27c','#9a8650','#5e4e30'],
      towel:['#fffbea','#e2e6ea','#a8b0c4','#646a8a'],
      check:['#e86a5a','#b23a3a','#742434','#401426'],
      steel:['#f6faff','#c5cdd9','#7b8599','#3f4559'],
      dirt:['#caa97a','#95754f','#674d35','#3d2b1f'],
      blood:['#c84a3e','#8e2a2c','#5e1824','#3a0e1a'],
      acid:['#d8f070','#9cc83a','#5e8a2a','#2e4a1c'],
      nail:['#8a7a72','#54484a','#342a30','#1c161a'],
      glow:['#fffbe0','#e8ecb0','#a8b07a','#646c4a'],
      swish:['#fdfdff','#e6f0ff','#b4c4e8','#7484b0'],
    };
    if(form==='enluarado'){
      m.skin=['#dcdcff','#a0a2e4','#686cae','#3c3a76']; m.vein=['#a8f4ff','#4ad8f0','#2a8ab0','#1a4a7a'];
      m.rot=['#b8a6e0','#8470b0','#56468a','#33285e']; m.flesh=['#f0b0ff','#b866d8','#7a3a9e','#46206a']; m.blood=['#b46ad8','#7e3ea6','#542474','#34144a'];
      m.eye=['#ffffff','#b8fbff','#4ad8f0','#1a8aa8']; m.glow=['#effffe','#7af4ff','#2ab0d8','#146a96']; m.swish=['#ffffff','#c8fbff','#6ae4f4','#2a9ab8'];
      m.vest=['#b49ade','#7a5eaa','#4e3a7e','#2a1c4e']; m.shirt=['#f2f0ff','#c8c4e6','#8a84b6','#4c467a'];
      m.apron=['#f8f8ff','#d6d6f0','#9c9ac6','#5a5688']; m.tie=['#c8f8ff','#5ad0ec','#2a86b0','#164a7a'];
      m.beer=['#e8ffff','#6ef0ff','#20a8d0','#0e5a8a']; m.foam=['#ffffff','#d8fcff','#8adcf0','#3a8ab0'];
      m.glass=['#ffffff','#d0f4ff','#7ac8e8','#3a6aa0']; m.tray=['#ffffff','#c4c8ec','#7a7eb6','#3c3e7a'];
      m.pants=['#5a5a8a','#2c2a50','#1c1a3a','#0e0c22']; m.hair=['#f0f0ff','#b0b0dc','#7070a8','#40406e']; m.stache=['#e0e0f8','#9494c4','#5a5a90','#30305e'];
      m.dirt=['#a8a0c8','#76709a','#4e4a70','#2e2a48']; m.towel=['#ffffff','#d8e0f4','#9aa4d0','#5a6296'];
    }
    if(form==='plenilunar'){
      m.skin=['#ffcaa6','#e2806a','#a4424e','#5e1e36']; m.vein=['#fff0a0','#ffb43a','#e0581e','#8a2414'];
      m.rot=['#d0806a','#9a4a4a','#682a3a','#3e1628']; m.flesh=['#ffc07a','#f06a3a','#a8302e','#5e1422']; m.blood=['#ff7a3a','#d43a26','#8a1c22','#4e0c18'];
      m.eye=['#fffbe0','#ffe04a','#ff8a2a','#b83a14']; m.glow=['#fff6c0','#ffb43a','#e0581e','#8a2414']; m.swish=['#fffbe6','#ffe6a8','#ffb460','#d0602a'];
      m.vest=['#6a3a48','#331a26','#22101a','#10040a']; m.shirt=['#fff0dc','#e8c8aa','#a87a76','#5e3a48'];
      m.apron=['#fff2e0','#ecd0b4','#b88a84','#6a3e4c']; m.tie=['#ffd47c','#f28c3b','#b24b27','#63231b'];
      m.beer=['#fff4b0','#ffb43a','#f0581e','#8a1e10']; m.foam=['#fffbe0','#ffe0a0','#f0a060','#a04a2a'];
      m.glass=['#fffbe6','#ffd8a8','#e8905a','#904030']; m.tray=['#fff6ea','#e4c4b0','#a0726e','#5a344a'];
      m.dirt=['#b4705a','#844a3e','#5a2e2e','#36181e']; m.towel=['#fff4e4','#f0cdb6','#b6807a','#6a3a44'];
    }
    return punch(m);
  }
  const NAMES={skin:'Pele',vein:'Veias',rot:'Podridão',flesh:'Carne',bone:'Osso',shirt:'Camisa branca',vest:'Colete',button:'Botões',apron:'Avental',pants:'Calça',shoe:'Sapato de verniz',tie:'Gravata borboleta',tray:'Bandeja de alumínio',glass:'Tulipa (vidro)',beer:'Chope',foam:'Colarinho',bottle:'Garrafa',label:'Rótulo',hair:'Franja grisalha',stache:'Bigodão',eye:'Olho',teeth:'Dentes',towel:'Pano de prato',check:'Xadrez do pano',steel:'Abridor/relógio',dirt:'Sujeira',blood:'Sangue',acid:'Ácido',glow:'Brilho',swish:'Rastro'};
  function sat(h,k){ const [r,g,b]=PIX.hexRgb(h), y=(r+g+b)/3; return PIX.toHex(y+(r-y)*k,y+(g-y)*k,y+(b-y)*k); }
  const NOPUNCH={swish:1,glow:1};
  function punch(m){ const o={}; for(const k in m){ const r=m[k]; o[k]=NOPUNCH[k]?[r[0],r[1],r[2],r[3]]:[sat(r[0],1.1),sat(r[1],1.16),PIX.mix(sat(r[2],1.1),'#2a1a4c',0.2),PIX.mix(r[3],'#140a24',0.34)]; } return o; }
  const GL={comum:3,enluarado:4,plenilunar:5};

  /* ---------- poses ---------- */
  // 0 = pendurado, + = pra frente. Braço de trás segura a bandeja (aBs pra trás/cima, aBe = antebraço pra cima).
  // tr = inclinação da bandeja (graus); tray = bandeja na mão; gl = copos na bandeja (-1 = pela forma: 3/4/5);
  // bot = garrafa na mão da frente; rz = ângulo da garrafa; tloose/tdx/tdy/tdr/tsx = bandeja caída girando (morte);
  // turn = giro do corpo (1 de lado, 0 de frente, -1 de costas: espelha); swirl = rastro circular do giro;
  // smear = rastro da bandeja (golpe); shards = cacos no chão (morte).
  const REST={hx:0,rot:0,lift:0,lean:1,hunch:3,head:-4,jaw:8,aFs:8,aFe:26,aBs:-112,aBe:178,rz:0,lFh:8,lFk:-2,lBh:-6,lBk:-12,fF:0,fB:0,tr:0,tray:1,gl:-1,bot:1,tloose:0,tdx:0,tdy:0,tdr:0,tsx:1,turn:1,swirl:0,smear:0,shards:0,flash:0,drool:0,watch:0};
  const S=Math.sin, C=Math.cos, PI=Math.PI, mx=Math.max;
  const ANIMS={
    idle:{nome:'Parado (equilibra a bandeja, olha o relógio)',n:8,dur:()=>150,pose:i=>{ const p=i/8*PI*2, s=S(p), look=i>=4&&i<=6;
      return {hx:0.8*s, lean:1+1.2*S(p+0.6), hunch:3+1.2*S(2*p), head:look?-14:-4+3*S(p-0.8), jaw:look?4:6+4*mx(0,S(p)), drool:i%4,
        aFs:look?54:8+4*s, aFe:look?128:26+6*S(p+0.4), watch:look?1:0, aBs:-112+4*S(p+1), aBe:178-4*S(p+1), tr:3*S(p+0.5),
        lFh:8+2*s, lFk:-2+3*s, lBh:-6-2*s, lBk:-12+2*s}; }},
    walk:{nome:'Andar (passos curtos, ponta de pé, bandeja nivelada)',n:8,dur:()=>112,pose:i=>{ const p=i/8*PI*2;
      const lFh=6+15*S(p), lBh=-6+11*S(p+PI);
      return {lFh, lFk:lFh-20*mx(0,C(p))-4, lBh, lBk:lBh-10-12*mx(0,C(p+PI)), fF:6-12*mx(0,C(p)), fB:16*mx(0,C(p+PI))+4,
        lean:3+1.5*S(2*p), hunch:3+1.2*S(2*p-0.6), head:-5+2*S(2*p-1.4), jaw:7+3*S(2*p-1.8), hx:1*S(p), lift:1.6*mx(0,S(2*p)),
        aFs:8+16*S(p+PI), aFe:26+12*S(p+PI), rz:6*S(p), aBs:-112+3*S(2*p), aBe:178-3*S(2*p), tr:-2*S(2*p-1), drool:i%4}; }},
    alert:{nome:'Alerta (gira a bandeja no dedo, reverência torta)',n:6,dur:i=>[160,120,120,140,200,170][i],pose:i=>[
      {},
      {aBs:-150,aBe:182,tr:20,head:-2,jaw:14,lean:-2,swirl:1},
      {aBs:-158,aBe:186,tr:-20,head:0,jaw:18,lean:-3,swirl:1},
      {aBs:-120,aBe:176,lean:22,hunch:10,head:-18,jaw:20,aFs:60,aFe:90,hx:2,lFh:12,lBh:-10},
      {aBs:-118,aBe:176,lean:28,hunch:12,head:-22,jaw:28,aFs:66,aFe:96,hx:3,lFh:14,lBh:-12},
      {jaw:14,lean:4}][i]},
    // ---- golpes (hit = quadro do dano, reach = alcance; throwAt = quadro em que os copos saem da bandeja) ----
    fan:{nome:'Leque de copos',n:9,throwAt:4,reach:110,dur:i=>[80,80,60,40,60,120,140,140,150][i],pose:i=>[
      {lean:-6,hunch:2,head:-2,jaw:14,aBs:-130,aBe:190,tr:10,aFs:-10,aFe:10,hx:-2,lFh:12,lBh:-14},
      {lean:-14,hunch:0,head:2,jaw:20,aBs:-150,aBe:206,tr:22,aFs:-24,aFe:0,hx:-4,lFh:16,lFk:-6,lBh:-18,lBk:-24},
      {lean:-18,hunch:-2,head:4,jaw:26,aBs:-160,aBe:214,tr:28,aFs:-30,aFe:-10,hx:-5,lFh:18,lFk:-6,lBh:-20,lBk:-26},
      {lean:10,hunch:8,head:-8,jaw:32,aBs:150,aBe:120,tr:-12,smear:1,aFs:-20,aFe:10,hx:2,lFh:22,lFk:2,lBh:-18,lBk:-28},
      {lean:20,hunch:12,head:-12,jaw:40,aBs:104,aBe:96,tr:-24,gl:0,smear:1,aFs:-30,aFe:-6,hx:6,lFh:26,lFk:4,lBh:-22,lBk:-32,fB:10},
      {lean:22,hunch:12,head:-12,jaw:30,aBs:96,aBe:92,tr:-18,gl:0,aFs:-20,aFe:4,hx:6,lFh:26,lFk:4,lBh:-22,lBk:-32,fB:10},
      {lean:12,hunch:8,head:-8,jaw:20,aBs:60,aBe:110,tr:-6,gl:0,hx:3,lFh:18,lBh:-14},
      {lean:6,hunch:6,head:-6,jaw:14,aBs:-40,aBe:150,tr:0,gl:0,hx:1},
      {gl:0,aBs:-100,aBe:174}][i]},
    slam:{nome:'Bandejada (golpe chapado de lado)',n:8,hit:4,reach:34,dur:i=>[130,110,90,50,70,110,130,150][i],pose:i=>[
      {lean:-6,head:-2,jaw:12,aBs:-140,aBe:200,tr:20,hx:-2,lFh:12,lBh:-12},
      {lean:-14,hunch:0,head:2,jaw:20,aBs:-120,aBe:240,tr:70,gl:0,hx:-4,lFh:14,lFk:-6,lBh:-18,lBk:-26},
      {lean:-18,hunch:-2,head:4,jaw:24,aBs:-100,aBe:260,tr:86,gl:0,hx:-5,lFh:16,lBh:-20,lBk:-28},
      {lean:16,hunch:10,head:-10,jaw:34,aBs:70,aBe:96,tr:88,gl:0,smear:1,hx:4,lFh:24,lFk:2,lBh:-20,lBk:-30},
      {lean:24,hunch:12,head:-12,jaw:40,aBs:92,aBe:90,tr:90,gl:0,smear:1,hx:7,lFh:28,lFk:4,lBh:-24,lBk:-34,fB:12},
      {lean:22,hunch:12,head:-10,jaw:28,aBs:96,aBe:94,tr:84,gl:0,hx:7,lFh:28,lFk:4,lBh:-24,lBk:-34,fB:12},
      {lean:10,hunch:6,head:-6,jaw:16,aBs:10,aBe:150,tr:30,gl:0,hx:3,lFh:16,lBh:-12},
      {gl:0,aBs:-100,aBe:176,tr:6}][i]},
    spin:{nome:'Giro de desvio (roda com a bandeja)',n:8,dur:i=>[50,60,60,60,60,60,80,120][i],pose:i=>[
      {turn:1,lean:-4,aBs:-160,aBe:184,tr:10,jaw:16,hx:-2,lFh:14,lBh:-14},
      {turn:0.45,lean:-6,aBs:-170,aBe:180,tr:-14,jaw:22,swirl:1,hx:-4,lFh:20,lFk:-14,lBh:-4,fF:20,lift:3},
      {turn:-0.4,lean:-4,aBs:-176,aBe:178,tr:14,jaw:26,swirl:1,hx:-6,lFh:4,lFk:-20,lBh:10,fB:30,lift:5},
      {turn:-1,lean:-2,aBs:-170,aBe:182,tr:-10,jaw:26,swirl:1,hx:-7,lFh:-6,lBh:16,lift:4},
      {turn:-0.45,lean:-4,aBs:-176,aBe:178,tr:12,jaw:24,swirl:1,hx:-8,lFh:18,lFk:-14,lBh:-4,lift:3},
      {turn:0.4,lean:-2,aBs:-168,aBe:180,tr:-10,jaw:20,swirl:1,hx:-8,lFh:10,lBh:-10,lift:1},
      {turn:1,lean:4,aBs:-130,aBe:182,tr:6,jaw:16,hx:-7,lFh:14,lBh:-14},
      {turn:1,lean:2,jaw:10,hx:-4}][i]},
    empty:{nome:'Bandeja vazia (procura os copos)',n:6,dur:i=>[200,230,230,220,220,200][i],pose:i=>[
      {gl:0,aBs:-60,aBe:120,tr:-30,head:-16,jaw:20,lean:6,hunch:8},
      {gl:0,aBs:-40,aBe:104,tr:-40,head:-24,jaw:26,lean:10,hunch:10,aFs:150,aFe:200,bot:0},
      {gl:0,aBs:-40,aBe:104,tr:-40,head:-20,jaw:30,lean:10,hunch:10,aFs:156,aFe:212,bot:0},
      {gl:0,aBs:-46,aBe:110,tr:-34,head:-24,jaw:24,lean:10,hunch:10,aFs:150,aFe:200,bot:0},
      {gl:0,aBs:-70,aBe:140,tr:-16,head:-8,jaw:20,lean:4,hunch:6,aFs:30,aFe:60},
      {gl:0,aBs:-100,aBe:172,tr:-4,jaw:12}][i]},
    hurt:{nome:'Dano (cabeça)',n:4,dur:i=>[80,110,130,150][i],pose:i=>[
      {lean:-10,hunch:0,head:8,jaw:30,aFs:-10,aFe:20,aBs:-130,aBe:200,tr:-22,hx:-6,flash:1,lFh:12,lBh:-4},
      {lean:-6,hunch:2,head:4,jaw:26,aFs:0,aFe:30,aBs:-124,aBe:194,tr:14,hx:-5,lFh:10,lBh:-6},
      {lean:-1,hunch:3,head:-2,jaw:20,aFs:6,aFe:26,aBs:-116,aBe:184,tr:-6,hx:-2},
      {lean:1,hunch:3,head:-4,jaw:10,hx:0}][i]},
    hurtB:{nome:'Dano (barriga, dobra)',n:4,dur:i=>[80,120,140,150][i],pose:i=>[
      {lean:28,hunch:22,head:6,jaw:40,aFs:40,aFe:10,aBs:-80,aBe:150,tr:-26,hx:-8,flash:1,lFh:18,lFk:-14,lBh:-12,lBk:-28},
      {lean:24,hunch:20,head:2,jaw:36,aFs:36,aFe:14,aBs:-86,aBe:156,tr:-18,hx:-7,lFh:16,lFk:-12,lBh:-12,lBk:-26},
      {lean:12,hunch:12,head:-6,jaw:24,aFs:20,aFe:30,aBs:-100,aBe:168,tr:-6,hx:-3},
      {lean:4,hunch:5,head:-6,jaw:12,hx:-1}][i]},
    fall:{nome:'Derrubado (a bandeja voa)',n:5,dur:i=>[90,100,110,150,260][i],pose:i=>[
      {lean:-12,hunch:0,head:6,jaw:34,aFs:-40,aFe:-20,aBs:-150,aBe:210,tr:-40,gl:0,hx:-6,flash:1,lFh:18,lBh:0},
      {rot:-36,lean:-4,hunch:4,head:0,jaw:30,aFs:-60,aFe:-40,aBs:-170,aBe:-150,tray:0,tloose:1,tdx:-22,tdy:40,tdr:-60,hx:-4,lFh:40,lFk:30,lBh:20,lBk:10},
      {rot:-70,lean:0,hunch:6,head:-4,jaw:28,aFs:-90,aFe:-70,aBs:-150,aBe:-120,tray:0,tloose:1,tdx:-34,tdy:22,tdr:-150,tsx:0.6,hx:-6,lFh:50,lFk:40,lBh:30,lBk:24},
      {rot:-90,lean:4,hunch:8,head:-2,jaw:36,aFs:-110,aFe:-120,aBs:-120,aBe:-110,tray:0,tloose:1,tdx:-40,tdy:4,tdr:-180,tsx:1,hx:2,lFh:40,lFk:10,lBh:30,lBk:4},
      {rot:-90,lean:0,hunch:8,head:-4,jaw:34,aFs:-130,aFe:-150,aBs:-110,aBe:-136,tray:0,tloose:1,tdx:-42,tdy:0,tdr:-180,hx:2,lFh:40,lFk:6,lBh:26,lBk:0}][i]},
    getup:{nome:'Levantar (pega a bandeja)',n:5,dur:i=>[200,170,170,160,150][i],pose:i=>[
      {rot:-90,lean:0,hunch:8,head:-4,jaw:34,aFs:-130,aFe:-150,aBs:-110,aBe:-136,tray:0,tloose:1,tdx:-42,tdy:0,tdr:-180,hx:2,lFh:40,lFk:6,lBh:26,lBk:0},
      {rot:-50,lean:10,hunch:16,head:-16,jaw:24,aFs:-50,aFe:-10,aBs:-40,aBe:-10,tray:0,tloose:1,tdx:-30,tdy:0,tdr:-180,hx:-8,lFh:90,lFk:10,lBh:70,lBk:0},
      {rot:-20,lean:24,hunch:20,head:-22,jaw:20,aFs:-10,aFe:10,aBs:-20,aBe:-60,tr:-90,gl:0,hx:-6,lFh:100,lFk:10,lBh:50,lBk:-60},
      {rot:0,lean:24,hunch:18,head:-24,jaw:20,aFs:30,aFe:10,aBs:-80,aBe:120,tr:-30,gl:0,hx:-4,lFh:70,lFk:-2,lBh:6,lBk:-80,fB:50},
      {lean:4,hunch:5,head:-6,jaw:10,aBs:-110,aBe:176,gl:0}][i]},
    death:{nome:'Morte (a bandeja gira no chão, copos quebram)',n:8,dur:i=>[90,150,160,170,150,140,160,600][i],pose:i=>[
      {lean:-10,hunch:0,head:8,jaw:40,aFs:-34,aFe:-16,aBs:-150,aBe:214,tr:-40,hx:-5,flash:1,lFh:12,lBh:-4},
      {lean:-4,hunch:4,head:10,jaw:48,aFs:-10,aFe:4,aBs:-150,aBe:-150,tray:0,tloose:1,tdx:-14,tdy:50,tdr:-40,shards:1,hx:-6,lFh:10,lBh:-8},
      {lean:6,hunch:14,head:-2,jaw:46,aFs:4,aFe:6,aBs:-60,aBe:-30,tray:0,tloose:1,tdx:-26,tdy:26,tdr:-110,tsx:0.5,shards:1,hx:-4,lFh:40,lFk:-30,lBh:28,lBk:-50,fF:10,fB:30},
      {lean:10,hunch:22,head:-8,jaw:48,aFs:6,aFe:4,aBs:2,aBe:0,tray:0,tloose:1,tdx:-36,tdy:2,tdr:-180,tsx:-0.6,shards:1,hx:-2,lFh:14,lFk:-92,lBh:6,lBk:-96,fF:100,fB:100},
      {rot:16,lean:12,hunch:26,head:-8,jaw:48,aFs:24,aFe:20,aBs:16,aBe:14,tray:0,tloose:1,tdx:-40,tdy:0,tdr:-180,tsx:1,shards:2,hx:0,lFh:2,lFk:-92,lBh:-6,lBk:-96,fF:90,fB:90},
      {rot:50,lean:10,hunch:22,head:-12,jaw:44,aFs:70,aFe:90,aBs:56,aBe:76,tray:0,tloose:1,tdx:-42,tdy:0,tdr:-180,tsx:0.5,shards:2,hx:4,lFh:-20,lFk:-70,lBh:-28,lBk:-74,fF:60,fB:60},
      {rot:86,lean:2,hunch:10,head:-4,jaw:40,aFs:150,aFe:170,aBs:110,aBe:150,tray:0,tloose:1,tdx:-44,tdy:0,tdr:-180,tsx:-0.4,shards:2,hx:8,lFh:-4,lFk:-10,lBh:-8,lBk:-14,fF:10,fB:10},
      {rot:90,lean:0,hunch:8,head:0,jaw:42,aFs:160,aFe:176,aBs:116,aBe:156,tray:0,tloose:1,tdx:-44,tdy:0,tdr:-180,tsx:1,shards:2,hx:8,lFh:-2,lFk:-6,lBh:-6,lBk:-10,fF:6,fB:6,drool:3}][i]},
    // ---- sem bandeja (quebrada depois de 4 acertos de frente): braço de trás livre, golpe com a garrafa ----
    idleX:{nome:'Parado sem bandeja',n:8,dur:()=>150,pose:i=>{ const p=i/8*PI*2, s=S(p);
      return {tray:0,hx:0.8*s,lean:4+1.5*S(p+0.6),hunch:6+1.5*S(2*p),head:-6+3*S(p-0.8),jaw:10+5*mx(0,S(p)),drool:i%4,
        aFs:14+5*s,aFe:40+8*S(p+0.4),aBs:-14-5*s,aBe:10+6*s,lFh:8+2*s,lFk:-2+3*s,lBh:-6-2*s,lBk:-12+2*s}; }},
    walkX:{nome:'Andar sem bandeja',n:8,dur:()=>112,pose:i=>{ const P=ANIMS.walk.pose(i), p=i/8*PI*2;
      return Object.assign(P,{tray:0,aBs:-10+16*S(p),aBe:6+14*S(p),lean:5+1.5*S(2*p),hunch:6}); }},
    slamX:{nome:'Garrafada (sem bandeja)',n:7,hit:3,reach:32,dur:i=>[140,110,50,90,120,130,150][i],pose:i=>[
      {tray:0,lean:-6,head:-2,jaw:14,aFs:140,aFe:170,rz:20,aBs:-30,aBe:-10,hx:-2,lFh:12,lBh:-12},
      {tray:0,lean:-14,head:4,jaw:22,aFs:170,aFe:200,rz:30,aBs:-40,aBe:-20,hx:-4,lFh:14,lBh:-18,lBk:-26},
      {tray:0,lean:16,hunch:10,head:-10,jaw:34,aFs:96,aFe:70,rz:-10,smear:1,aBs:-20,aBe:0,hx:4,lFh:24,lFk:2,lBh:-20,lBk:-30},
      {tray:0,lean:24,hunch:12,head:-12,jaw:40,aFs:60,aFe:30,rz:-20,smear:1,aBs:-10,aBe:10,hx:7,lFh:28,lFk:4,lBh:-24,lBk:-34,fB:12},
      {tray:0,lean:22,hunch:12,head:-10,jaw:28,aFs:40,aFe:20,rz:-30,aBs:-10,aBe:10,hx:7,lFh:28,lFk:4,lBh:-24,lBk:-34,fB:12},
      {tray:0,lean:10,hunch:8,head:-6,jaw:16,aFs:20,aFe:40,hx:3,lFh:16,lBh:-12},
      {tray:0,lean:4,hunch:6,jaw:12}][i]},
    // ---- adereços (desenhados pelo motor como atores extras; âncora em cv._ax/_gy) ----
    xGlass:{nome:'Tulipa voando (adereço)',n:4,prop:true,dur:()=>60,pose:i=>({st:i})},
    xShard:{nome:'Cacos no chão (adereço)',n:3,prop:true,dur:()=>120,pose:i=>({st:i})},
  };
  const EXK=['hx','lean','hunch','head','aFs','aFe','aBs','aBe','lFh','lFk','lBh','lBk'];
  function exag(P,f){ if(f===1||Math.abs(P.rot)>4) return P; EXK.forEach(k=>{ P[k]=REST[k]+(P[k]-REST[k])*f; }); P.jaw=Math.min(58,mx(0,REST.jaw+(P.jaw-REST.jaw)*f)); return P; }
  const EXF={idle:1.04,walk:1.08,alert:1.1,fan:1.14,slam:1.16,spin:1.05,empty:1.05,hurt:1.3,hurtB:1.25,fall:1.1,getup:1.06,death:1.1,idleX:1.04,walkX:1.08,slamX:1.15};
  ZREACT.add(ANIMS,REST,{});
  // ZREACT (tumble/grabbed) não conhece a bandeja: nas reações ela cai da mão
  ['tumble','grabbed'].forEach(k=>{ const A=ANIMS[k]; if(!A) return; const f=A.pose; A.pose=i=>Object.assign({},f(i),{tray:0}); });
  function poseOf(anim,i){ const A=ANIMS[anim]; if(A&&A.prop) return Object.assign({},REST,A.pose(i)); return exag(Object.assign({},REST,A.pose(i)),EXF[anim]||1); }
  function heavyOutline(cv){ const g=cv.getContext('2d'), W=cv.width, H=cv.height, im=PIX.pix(cv), d=im.data;
    const isO=i=>d[i+3]===255&&d[i]===0x17&&d[i+1]===0x0b&&d[i+2]===0x1c, fill=i=>d[i+3]===255&&!isO(i);
    const add=[]; for(let y=2;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(d[i+3]) continue; const u=((y-1)*W+x)*4, u2=((y-2)*W+x)*4; if(isO(u)&&fill(u2)) add.push(i); }
    add.forEach(i=>{ d[i]=0x17; d[i+1]=0x0b; d[i+2]=0x1c; d[i+3]=255; }); g.putImageData(im,0,0); }

  /* ---------- esqueleto (magro, tronco reto, pernas longas) ---------- */
  const SPINE=36, TH=19, SH=18.6, UA=13.6, FA=12.8, VS=SPINE/37, US=1.06, HB=4, HS=1.36;
  const lp=(p,a,L)=>({x:p.x+Math.sin(rad(a))*L, y:p.y+Math.cos(rad(a))*L});
  function build(P,dy){
    const R=P.rot, hip={x:AX+P.hx, y:dy};
    const ra=rad(R), rc=Math.cos(ra), rs=Math.sin(ra);
    const HR=(lx,ly)=>({x:hip.x+lx*rc-ly*rs, y:hip.y+lx*rs+ly*rc});
    const hipF=HR(2.6,0), hipB=HR(-2.6,0);
    const kneeF=lp(hipF,P.lFh-R,TH), ankleF=lp(kneeF,P.lFk-R,SH), kneeB=lp(hipB,P.lBh-R,TH), ankleB=lp(kneeB,P.lBk-R,SH);
    const SS=[]; let x=hip.x, y=hip.y;
    for(let k=0;k<=SPINE;k++){ const t=k/SPINE, a=rad(R+P.lean+(P.hunch+HB)*Math.pow(t,1.4)); SS.push({x,y,a}); x+=Math.sin(a); y-=Math.cos(a); }
    const SP=(u,v)=>{ if(v>0){ const s=SS[0], a=s.a, px=s.x-Math.sin(a)*v, py=s.y+Math.cos(a)*v; return {x:px+Math.cos(a)*u, y:py+Math.sin(a)*u}; }
      const f=-v, k=Math.min(SPINE,Math.floor(f)), s=SS[k], r=f-k, a=s.a;
      const px=s.x+Math.sin(a)*r, py=s.y-Math.cos(a)*r; return {x:px+Math.cos(a)*u, y:py+Math.sin(a)*u}; };
    const T=(u,v)=>SP(u*US,v*VS);
    const top=SS[SPINE], neck=T(1.4,-37), sa=top.a;
    const shF=T(0.8,-32.6), shB=T(-5.6,-33.6);
    const elF=lp(shF,P.aFs-R,UA), wrF=lp(elF,P.aFe-R,FA), elB=lp(shB,P.aBs-R,UA), wrB=lp(elB,P.aBe-R,FA);
    const ha=sa+rad(P.head-HB*0.8+7), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:neck.x+(lx*hc-ly*hs)*HS, y:neck.y+(lx*hs+ly*hc)*HS});
    // bandeja: apoiada nas pontas dos dedos da mão de trás
    const fd={x:(wrB.x-elB.x)/FA, y:(wrB.y-elB.y)/FA}, tc={x:wrB.x+fd.x*5.2, y:wrB.y+fd.y*5.2};
    // garrafa: pega pelo gargalo na mão da frente
    const fa=Math.atan2(wrF.x-elF.x,wrF.y-elF.y)*180/PI, ba=rad(fa+P.rz), bd={x:Math.sin(ba),y:Math.cos(ba)};
    const bh={x:wrF.x+(wrF.x-elF.x)/FA*3.6, y:wrF.y+(wrF.y-elF.y)/FA*3.6};
    const toe=(a,f)=>{ const t=rad(f+R); return {x:a.x+(10*Math.cos(t)-4*Math.sin(t))*1.3, y:a.y+(10*Math.sin(t)+4*Math.cos(t))*1.3}; };
    const hull=[[ankleF,5.6],[ankleB,5.6],[toe(ankleF,P.fF),0.8],[toe(ankleB,P.fB),0.8],[kneeF,5],[kneeB,5],[hip,9],[T(0,-18),10],[T(-2,-30),10],[H(3,-11),11],[wrF,4],[elF,4],[elB,4]];
    return {R,hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,SP,T,sa,neck,shF,shB,elF,wrF,elB,wrB,ha,H,hull,ra,tc,fd,bh,bd,toeF:toe(ankleF,P.fF)};
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
    const {nx,ny}=sideN(a,b), sh=o.sh!=null?o.sh:0.62;
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
  const pt=q=>[q.x,q.y];

  /* ---------- tulipa de chope (coordenadas locais: origem no pé do copo, y pra cima negativo) ---------- */
  // fill = nível do chope (0..1); crack = copo rachado (enluarado); form muda o líquido
  function drawGlass(p,M,x,y,sc,form,o){
    o=o||{}; const k=sc||1, fill=o.fill!=null?o.fill:0.78;
    const G=(pts)=>pts.map(([a,b])=>[x+a*k,y+b*k]);
    // pé e haste
    p.F(M.glass[2]); p.poly(G([[-2.2,0],[2.2,0],[1.8,-0.9],[-1.8,-0.9]]));
    p.F(M.glass[1]); p.poly(G([[-0.6,-0.9],[0.6,-0.9],[0.7,-2.6],[-0.7,-2.6]]));
    // bojo da tulipa (estreita embaixo, abre em cima, fecha levemente na boca)
    const bowl=[[-1.2,-2.6],[1.2,-2.6],[2.6,-5],[3,-8.4],[2.6,-11.4],[-2.6,-11.4],[-3,-8.4],[-2.6,-5]];
    p.F(M.glass[2]); p.poly(G(bowl));
    const lv=-2.6-(11.4-2.6)*fill;
    if(fill>0){ const liq=[[-1,-2.8],[1,-2.8],[2.3,-5],[2.6,Math.max(lv,-8.4)],[2.4,lv],[-2.4,lv],[-2.6,Math.max(lv,-8.4)],[-2.3,-5]];
      p.F(M.beer[1]); p.poly(G(liq));
      p.F(M.beer[2]); p.poly(G([[-1,-2.8],[0,-2.8],[-0.4,lv],[-2.4,lv],[-2.6,Math.max(lv,-8.4)],[-2.3,-5]]));
      p.F(M.beer[0]); p.poly(G([[1.2,-4],[1.9,-4.6],[2,lv+0.6],[1.4,lv+0.6]]));
      // colarinho (espuma) transbordando
      p.F(M.foam[1]); p.poly(G([[-2.8,lv+0.6],[2.8,lv+0.6],[3,lv-1.2],[1.6,lv-2.4],[-0.6,lv-2.2],[-2.4,lv-1.6]]));
      p.F(M.foam[0]); p.poly(G([[-1.4,lv-1.6],[1.4,lv-2],[2.2,lv-1],[0,lv-0.8]]));
      p.F(M.foam[2]); p.poly(G([[-2.8,lv+0.6],[2.8,lv+0.6],[2.6,lv],[-2.6,lv]]));
      if(form!=='comum'){ p.F(M.glow[1]); p.rect(x-0.4*k,y+(lv+1.6)*k,0.9*k,1.4*k); }
    }
    // vidro: reflexo vertical e borda da boca
    p.F(M.glass[0]); p.poly(G([[-2.2,-5],[-1.5,-5],[-1.8,-10.4],[-2.4,-10.4]]));
    p.F(M.glass[0]); p.poly(G([[-2.6,-11.4],[2.6,-11.4],[2.6,-10.8],[-2.6,-10.8]]));
    if(o.crack){ p.F(M.glow[0]); p.poly(G([[1.4,-10.8],[2,-10.8],[0.8,-7.4],[1.6,-6],[1.2,-5.8],[0.2,-7.4]])); }
  }

  /* ---------- bandeja (coordenadas locais: origem no centro da face de cima, x = diâmetro) ---------- */
  function drawTray(c,p,M,cx,cy,ang,gl,form,o){
    o=o||{}; const sx=o.sx!=null?o.sx:1, ry=3.6+(o.ry||0), RX=15.6;
    p.xf(ang,cx,cy); c.scale(sx,1);
    const E=(dy,rx,r2)=>{ const pts=[]; for(let i=0;i<28;i++){ const a=i/28*PI*2; pts.push([Math.cos(a)*rx, Math.sin(a)*r2+dy]); } return pts; };
    // espessura/aba (de baixo) e face de cima
    p.F(M.tray[3]); p.poly(E(1.8,RX,ry));
    p.F(M.tray[2]); p.poly(E(1,RX,ry));
    p.F(M.tray[1]); p.poly(E(0,RX,ry));
    const face=E(0,RX-1.6,ry-0.9);
    p.F(M.tray[2]); p.poly(face);
    clip(c,face,()=>{
      p.F(M.tray[1]); p.poly(E(0.9,RX-1.6,ry-0.9));
      p.F(M.tray[0]); p.poly([[2,-ry],[11,-ry],[13,-0.8],[6,-1.4]]); // reflexo de luz
      p.F(M.tray[3]); p.ell(-7,0.6,2.6,0.8); p.F(M.tray[2]); p.ell(-6.4,0.4,1.6,0.5); // amassado
      p.F(M.beer[2]); p.ell(4,1.2,3,0.8); // chope derramado
      p.F(M.blood[1]); p.ell(-2,1.4,2.2,0.6);
    });
    p.F(M.tray[0]); p.poly([[-RX+1,1.4],[RX-1,1.4],[RX-2.4,2.4],[-RX+2.4,2.4]].map(([a,b])=>[a,b+ry-2.4]));
    p.F(M.tray[0]); p.poly([[5,-ry-0.2],[12,-ry+0.8],[12.6,-ry+1.6],[5,-ry+0.6]]);
    // copos (de trás pra frente: os de trás ficam mais altos)
    if(gl>0){
      const slots=[[-9.4,-0.9],[-4.6,0.7],[0.2,-1],[5,0.7],[9.6,-0.6]];
      const use=gl>=5?[0,1,2,3,4]:gl===4?[0,1,3,4]:gl===3?[0,2,4]:gl===2?[1,3]:[2];
      use.map(i=>slots[i]).sort((a,b)=>a[1]-b[1]).forEach(([gx,gy],j)=>{ p.xf(ang,cx,cy); c.scale(sx,1); drawGlass(p,M,gx,gy+0.2,gl>=5?1.06:1.22,form,{crack:form==='enluarado'&&j%2===0}); });
    }
    p.id();
  }

  /* ---------- garrafa (mão da frente, pega pelo gargalo, fundo pra baixo) ---------- */
  function drawBottle(p,M,sk,form){
    const h=sk.bh, d=sk.bd, n={nx:-d.y,ny:d.x};
    const at=(t,s)=>({x:h.x+d.x*t+n.nx*s, y:h.y+d.y*t+n.ny*s});
    // gargalo (boca acima da mão) e corpo (abaixo)
    const Q=(list)=>list.map(([t,s])=>pt(at(t,s)));
    p.F(M.bottle[1]); p.poly(Q([[-4.6,-1],[-4.6,1],[4,1.2],[6.6,3.4],[17.4,3.4],[18.4,2.6],[18.4,-2.6],[17.4,-3.4],[6.6,-3.4],[4,-1.2]]));
    p.F(M.bottle[2]); p.poly(Q([[6.6,1.2],[17.4,1.4],[18.4,2.6],[17.4,3.4],[6.6,3.4]]));
    p.F(M.bottle[3]); p.poly(Q([[8,2.4],[17,2.6],[17.4,3.4],[8,3.4]]));
    p.F(M.bottle[0]); p.poly(Q([[7,-2.6],[16.4,-2.6],[16.4,-1.8],[7,-1.8]])); p.poly(Q([[-3.6,-0.8],[2.6,-0.8],[2.6,-0.2],[-3.6,-0.2]]));
    // rótulo
    p.F(M.label[1]); p.poly(Q([[9.6,-3.5],[14.4,-3.5],[14.4,3.5],[9.6,3.5]]));
    p.F(M.label[2]); p.poly(Q([[9.6,1.4],[14.4,1.4],[14.4,3.5],[9.6,3.5]]));
    p.F(M.blood[1]); p.poly(Q([[11.2,-1.6],[12.8,-1.6],[12.8,0.4],[11.2,0.4]]));
    p.F(M.label[0]); p.poly(Q([[9.6,-3.5],[14.4,-3.5],[14.4,-2.6],[9.6,-2.6]]));
    // boca aberta: escorre chope/sangue
    p.F(form==='comum'?M.foam[1]:M.glow[1]); p.poly(Q([[-5.4,-1.2],[-4.4,-1.2],[-4.4,1.2],[-5.4,1.2]]));
  }

  /* ---------- braços: manga branca arregaçada, antebraço podre ---------- */
  function drawArm(c,u,M,sk,P,front,form){
    const p=mkPen(c,u), sh=front?sk.shF:sk.shB, el=front?sk.elF:sk.elB, wr=front?sk.wrF:sk.wrB; p._c=c; p.id();
    const sn=sideN(sh,el);
    // antebraço: pele com veias
    const n=limb(p,M.skin,el,wr,9.6,8.2,{sh:0.7});
    p.F(M.vein[1]); const v0=lerp(el,wr,0.3), v1=lerp(el,wr,0.85); p.cap(off(v0,n,-1),off(v1,n,-1.4),0.7,0.5);
    p.F(M.rot[1]); const r1=lerp(el,wr,0.55); p.ell(r1.x+n.nx*1.4,r1.y+n.ny*1.4,1.5,1);
    if(front){ const wq=lerp(el,wr,0.86); p.F(M.pants[1]); p.cap(off(wq,n,-4),off(wq,n,4),2.2,2.2); p.F(M.steel[1]); p.circle(off(wq,n,-1.2),1.7); p.F(M.steel[0]); p.rect(wq.x-n.nx*1.2-0.5,wq.y-n.ny*1.2-0.6,1,0.8); }
    // manga branca arregaçada: tecido cheio, sombra grande de um lado, 2 dobras macias e rolo grosso no cotovelo
    p.F(M.shirt[1]); p.cap(sh,el,13.2,13.6);
    p.F(M.shirt[2]); p.cap(off(sh,sn,3),off(el,sn,3.2),7,7.6);
    p.F(M.shirt[0]); p.cap(off(lerp(sh,el,0.12),sn,-4),off(lerp(sh,el,0.5),sn,-4.4),2.2,1.6);
    p.F(M.shirt[2]); [0.45,0.72].forEach(t=>{ const q=lerp(sh,el,t), q2=lerp(sh,el,t+0.12); p.poly([[q.x-sn.nx*5,q.y-sn.ny*5],[q2.x-sn.nx*1,q2.y-sn.ny*1],[q2.x+sn.nx*2,q2.y+sn.ny*2],[q.x-sn.nx*3.4,q.y-sn.ny*3.4]]); });
    const rl=lerp(sh,el,1.0); p.F(M.shirt[1]); p.cap(off(rl,sn,-6.6),off(rl,sn,6.6),4.6,4.6);
    p.F(M.shirt[0]); p.cap(off(lerp(sh,el,0.94),sn,-6),off(lerp(sh,el,0.94),sn,1),1.2,1.2);
    p.F(M.shirt[2]); p.cap(off(lerp(sh,el,1.07),sn,-6),off(lerp(sh,el,1.07),sn,6.4),1.6,1.6);
    if(front){ p.F(M.beer[2]); const b=lerp(sh,el,0.5); p.ell(b.x-sn.nx*2.4,b.y-sn.ny*2.4,1.4,1.1); }
    if(front){ if(P.bot>=0.5){ drawBottle(p,M,sk,form); drawFist(p,M,el,wr); } else drawHandOpen(p,M,el,wr); }
    else if(P.tray>=0.5) drawHandUp(p,M,el,wr); else drawFist(p,M,el,wr);
  }
  function drawFist(p,M,el,wr){
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y); p._c.scale(1.3,1.3);
    p.F(M.skin[1]); p.poly([[-1,-3.2],[4,-3.6],[5.6,-1],[5.2,3.2],[-1,3.4]]);
    p.F(M.skin[2]); p.poly([[-1,1.2],[5.4,1],[5.2,3.2],[-1,3.4]]);
    p.F(M.skin[0]); p.rect(0.4,-3,3.4,0.9);
    for(let k=0;k<4;k++){ const y0=-2.6+k*1.8; p.F(M.skin[1]); p.ell(5.6,y0,1.6,1); p.F(M.skin[2]); p.rect(5,y0+0.4,1.5,0.5); p.F(M.nail[1]); p.rect(6.2,y0-0.4,0.8,0.7); }
    p.F(M.skin[1]); p.cap(P2(1.6,-3),P2(4.6,-4.4),1.7,1.3);
    p.id();
  }
  function drawHandOpen(p,M,el,wr){
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y); p._c.scale(1.28,1.28);
    p.F(M.skin[1]); p.poly([[-1,-3],[4.4,-3.2],[5.4,2.8],[-1,3.2]]);
    p.F(M.skin[2]); p.poly([[-1,1],[5.2,1],[5.4,2.8],[-1,3.2]]);
    [[-2.4,9],[-0.8,10],[0.8,9.6],[2.4,8.4]].forEach(([y,L])=>{ p.F(M.skin[1]); p.cap(P2(4.4,y),P2(L,y+0.4),1.6,1.2); p.F(M.nail[1]); p.rect(L-0.6,y-0.2,0.9,0.8); });
    p.F(M.skin[1]); p.cap(P2(2,-3),P2(5,-5.6),1.8,1.3); p.F(M.skin[0]); p.rect(0.4,-2.8,3.4,0.8);
    p.id();
  }
  // mão de trás espalmada pra cima (dedos abertos sustentando a bandeja)
  function drawHandUp(p,M,el,wr){
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y); p._c.scale(1.28,1.28);
    p.F(M.skin[1]); p.poly([[-1,-2.8],[3.6,-3.4],[4.6,3.2],[-1,3]]);
    p.F(M.skin[2]); p.poly([[-1,0.8],[4.4,0.8],[4.6,3.2],[-1,3]]);
    [[-3.6,-1.6],[-1.4,-0.6],[0.8,0.2],[2.8,1.4]].forEach(([y,a])=>{ p.F(M.skin[1]); p.cap(P2(3.6,y+1),P2(6.4,y+a),1.5,1.1); p.F(M.nail[1]); p.rect(5.8,y+a-0.4,0.8,0.8); });
    p.id();
  }

  /* ---------- pernas: calça preta de vinco, sapato de verniz ---------- */
  function drawLeg(c,u,M,sk,P,front){
    const p=mkPen(c,u), hip=front?sk.hipF:sk.hipB, knee=front?sk.kneeF:sk.kneeB, ank=front?sk.ankleF:sk.ankleB; p.id();
    const nS=limb(p,M.pants,knee,lerp(knee,ank,0.96),11.2,10.2,{hl:0.5,sh:0.7});
    const nT=limb(p,M.pants,hip,knee,13.4,11.8,{hl:0.55,sh:0.7});
    p.F(M.pants[1]); p.circle(knee,5.2);
    p.F(M.pants[0]); p.cap(off(knee,nS,-2.6),off(lerp(knee,ank,0.86),nS,-2.8),0.7,0.7); // vinco
    const cb=lerp(knee,ank,0.92); p.F(M.pants[2]); p.cap(off(cb,nS,-5),off(cb,nS,5),1.2,1.2);
    if(front){ p.F(M.dirt[2]); const d0=lerp(knee,ank,0.7); p.ell(d0.x+nS.nx*2,d0.y+nS.ny*2,1.8,1.2); }
    // sapato de verniz (bico fino, brilho branco)
    const fa=rad((front?P.fF:P.fB)+sk.R); p.xf(fa,ank.x,ank.y); c.scale(1.3,1.3);
    p.F(M.shoe[1]); p.poly([[-3.2,-1.8],[2.4,-2],[6.4,0.2],[10.6,1.8],[11.2,3.4],[-3.6,3.4]]);
    p.F(M.shoe[2]); p.poly([[-3.6,2],[10.8,2.2],[11.2,3.4],[-3.6,3.4]]);
    p.F(M.shoe[0]); p.poly([[1,-1.4],[3,-1.6],[6.4,0.6],[6,1.1],[2.6,-0.5],[1,-0.6]]); p.rect(8.2,1.4,1.6,0.6); p.rect(-2.6,-1,0.8,1.6);
    p.F(M.shoe[3]); p.poly([[-4,3.4],[11.6,3.4],[11.4,4.4],[-3.8,4.4]]);
    p.id();
  }

  /* ---------- avental longo (da cintura até a canela; a perna da frente empurra o pano) ---------- */
  function drawApron(c,u,M,sk0,P,form){
    // desenha no referencial do quadril (desfaz a rotação do corpo): a mesma forma serve em pé e caído
    const p=mkPen(c,u), h0=sk0.hip, ca=Math.cos(sk0.ra), sa=Math.sin(sk0.ra);
    const L=q=>({x:ca*(q.x-h0.x)+sa*(q.y-h0.y), y:-sa*(q.x-h0.x)+ca*(q.y-h0.y)});
    const sk={kneeF:L(sk0.kneeF),kneeB:L(sk0.kneeB),ankleF:L(sk0.ankleF),ankleB:L(sk0.ankleB),T:(uu,vv)=>L(sk0.T(uu,vv))};
    p.xf(sk0.ra,h0.x,h0.y);
    const w1=Wp(sk,-10,-1.6), w2=Wp(sk,12.4,-2);
    const hF=lerp(sk.kneeF,sk.ankleF,0.5), hB=lerp(sk.kneeB,sk.ankleB,0.5);
    const kx1=Math.max(sk.kneeF.x,sk.kneeB.x), kx0=Math.min(sk.kneeF.x,sk.kneeB.x), ky=(sk.kneeF.y+sk.kneeB.y)/2;
    const hx1=Math.max(hF.x,hB.x), hx0=Math.min(hF.x,hB.x), hy=Math.max(hF.y,hB.y)-1;
    const shape=[pt(w1),pt(w2),[kx1+6.4,ky-2],[hx1+7.4,hy],[ (hx0+hx1)/2+2,hy+1.6],[hx0-5,hy+0.4],[kx0-6,ky-1]];
    p.F(M.apron[1]); p.poly(shape);
    clip(c,shape,()=>{
      // sombra fria do lado de trás e embaixo (bloco grande), luz no lado da frente
      p.F(M.apron[2]); p.poly([[w1.x-6,w1.y-4],[w1.x+4,w1.y-4],[kx0+2,ky],[hx0+3,hy+4],[hx0-12,hy+4]]);
      p.F(M.apron[3]); p.poly([[w1.x-6,w1.y-4],[w1.x+0.6,w1.y-4],[kx0-2.6,ky],[hx0-1.6,hy+4],[hx0-12,hy+4]]);
      p.F(M.apron[2]); p.poly([[hx0-12,hy-2.4],[hx1+12,hy-2.4],[hx1+12,hy+4],[hx0-12,hy+4]]);
      p.F(M.apron[0]); p.poly([[w2.x-4.6,w2.y],[w2.x-1,w2.y],[kx1+5,ky-2],[hx1+5.4,hy-2.6],[hx1+2.6,hy-2.6],[kx1+1.6,ky-2]]);
      // pregas verticais (caimento)
      const mid=lerp(w1,w2,0.5);
      [[0.34,-1],[0.62,1.4]].forEach(([t,dx])=>{ const a=lerp(w1,w2,t); p.F(M.apron[2]); p.poly([[a.x,a.y+3],[a.x+1,a.y+3],[lerp({x:hx0,y:hy},{x:hx1,y:hy},t).x+dx+1,hy-2],[lerp({x:hx0,y:hy},{x:hx1,y:hy},t).x+dx,hy-2]]); });
      // dobra da perna da frente (o joelho empurra o pano)
      const kf=sk.kneeF; p.F(M.apron[0]); p.ell(kf.x+2,kf.y-1,2.2,3.4); p.F(M.apron[2]); p.poly([[kf.x-1.6,kf.y+2],[kf.x+0.4,kf.y+2],[kf.x-0.6,hy-2.4],[kf.x-2.4,hy-2.4]]);
      // bolso com bloco de pedidos e lápis
      const pk=Wp(sk,3,7.6); p.F(M.apron[2]); p.poly([[pk.x-4.4,pk.y-1],[pk.x+4.6,pk.y-1.4],[pk.x+4.6,pk.y+4.4],[pk.x-4.4,pk.y+4.6]]);
      p.F(M.apron[0]); p.poly([[pk.x-3,pk.y-3.4],[pk.x+0.6,pk.y-3.6],[pk.x+0.8,pk.y-0.8],[pk.x-3,pk.y-0.6]]);
      p.F(M.blood[2]); p.rect(pk.x-2.6,pk.y-2.6,2.6,0.5); p.rect(pk.x-2.6,pk.y-1.7,2,0.5);
      p.F(M.label[1]); p.poly([[pk.x+1.6,pk.y-5],[pk.x+2.4,pk.y-5.2],[pk.x+2.8,pk.y-0.8],[pk.x+2,pk.y-0.8]]); p.F(M.dirt[3]); p.rect(pk.x+1.6,pk.y-5.6,0.9,0.7);
      p.F(M.apron[3]); p.poly([[pk.x-4.4,pk.y-1],[pk.x+4.6,pk.y-1.4],[pk.x+4.6,pk.y-0.6],[pk.x-4.4,pk.y-0.2]]);
      // manchas: chope, gordura e sangue
      p.F(M.beer[2]); p.ell(mid.x+5,mid.y+16,2.4,1.6); p.F(M.beer[3]); p.ell(mid.x+5.6,mid.y+16.6,1,0.7);
      p.F(M.dirt[1]); p.ell(mid.x-4,hy-5,2.6,1.4);
      p.F(M.blood[1]); p.ell(mid.x+1,mid.y+24,1.6,2.4); p.poly([[mid.x+0.4,mid.y+25],[mid.x+1.6,mid.y+25],[mid.x+1.2,mid.y+30],[mid.x+0.6,mid.y+30]]);
      if(form==='plenilunar'){ p.F(M.blood[1]); p.poly([[mid.x-5,mid.y+2],[mid.x+1,mid.y+1],[mid.x+8,mid.y+3],[mid.x+7,mid.y+8],[mid.x+9,mid.y+12],[mid.x+5,mid.y+11],[mid.x+4.6,mid.y+20],[mid.x+3,mid.y+20],[mid.x+2.6,mid.y+12],[mid.x-1,mid.y+10],[mid.x-1.4,mid.y+16],[mid.x-2.6,mid.y+16],[mid.x-3,mid.y+8],[mid.x-6,mid.y+6]]); p.ell(mid.x+3.8,mid.y+20,1.2,1.2); p.ell(mid.x-2,mid.y+16,1,1); p.ell(mid.x+10,mid.y+16,1.2,0.9);
        p.F(M.blood[2]); p.poly([[mid.x-1,mid.y+5],[mid.x+5,mid.y+5],[mid.x+4,mid.y+9],[mid.x,mid.y+8]]); p.F(M.blood[0]); p.rect(mid.x+3,mid.y+5,2,1); }
      // barra rasgada
      p.F(M.apron[3]); [[0.15,2.4],[0.45,1.4],[0.78,2.8]].forEach(([t,L])=>{ const x=hx0-4+(hx1-hx0+10)*t; p.poly([[x-1.4,hy+4],[x+1.4,hy+4],[x,hy-L]]); });
    });
    // cordão na cintura (amarrado atrás, pontas soltas) + abridor pendurado
    p.F(M.apron[1]); p.poly(W(sk,[[-10.4,-3.4],[12.8,-3.8],[12.6,-1.6],[-10.4,-1.2]]));
    p.F(M.apron[2]); p.poly(W(sk,[[-10.4,-2],[12.8,-2.4],[12.6,-1.6],[-10.4,-1.2]]));
    const kb=Wp(sk,-10.4,-2.6); p.F(M.apron[1]); p.ell(kb.x-1,kb.y,2.2,1.6); p.poly([[kb.x-1,kb.y],[kb.x-4.6,kb.y+9],[kb.x-2.6,kb.y+9.6],[kb.x,kb.y+1]]); p.F(M.apron[2]); p.poly([[kb.x,kb.y+1],[kb.x-2,kb.y+11],[kb.x-0.6,kb.y+11],[kb.x+1,kb.y+1]]);
    const ob=Wp(sk,6,-1.6); p.F(M.steel[2]); p.rect(ob.x-0.4,ob.y,0.8,3); p.F(M.steel[1]); p.poly([[ob.x-1.6,ob.y+3],[ob.x+1.6,ob.y+3],[ob.x+1.2,ob.y+7.4],[ob.x-1.2,ob.y+7.4]]); p.F(M.steel[3]); p.rect(ob.x-0.6,ob.y+4.2,1.2,1.4); p.F(M.steel[0]); p.rect(ob.x-1.2,ob.y+3.2,0.6,3.6);
  }

  /* ---------- tronco: camisa branca + colete preto largo (ombro largo, barriga), rasgo com costelas ---------- */
  const TORSO=[[-9.8,1],[-10.6,-10],[-11.4,-22],[-11.8,-30],[-10.6,-35.6],[-6.6,-39],[0,-40.2],[5.8,-39.6],[9.2,-36.2],[11,-30.6],[11.8,-25],[12.8,-19],[13.6,-12],[13.2,-5],[11.8,1]];
  const VEST=[[-10,2.8],[-10.8,-10],[-11.6,-22],[-12,-30],[-10.8,-35.8],[-6.4,-39.2],[0.2,-40],[2.8,-35.6],[5.4,-30.4],[8.4,-27],[11.8,-25.4],[13,-19],[14,-12],[13.6,-5],[13,1.6],[11.8,4.6],[7,3],[2,3.8],[-3.6,3]];
  function drawTorso(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    const shape=W(sk,TORSO);
    p.F(M.shirt[1]); p.poly(shape);
    clip(c,shape,()=>{
      // uma dobra macia grande saindo do colarinho e luz no peito
      p.F(M.shirt[2]); p.poly(W(sk,[[1,-38],[4.4,-33],[6.4,-27],[3.4,-27.6],[1.2,-32]]));
      p.F(M.shirt[0]); p.poly(W(sk,[[5.6,-39.4],[9.2,-36],[10.8,-30.4],[8.6,-30],[6.8,-34.6]]));
    });
    // colete: bloco escuro largo, metade em sombra fria
    const vs=W(sk,VEST);
    p.F(M.vest[1]); p.poly(vs);
    clip(c,vs,()=>{
      p.F(M.vest[2]); p.poly(W(sk,[[-14,6],[-14,-42],[-2,-42],[-1.4,-32],[0.6,-22],[1.4,-12],[2.6,-4],[6,0.6],[15,0.6],[15,6]]));
      p.F(M.vest[3]); p.poly(W(sk,[[-14,6],[-14,-42],[-7.4,-42],[-8,-30],[-7.2,-18],[-6,-6],[-4.4,6]]));
      p.F(M.vest[3]); p.poly(W(sk,[[-14,2],[15,2],[15,6],[-14,6]]));
      // cetim: luz grande no ombro e na barriga
      p.F(M.vest[0]); p.poly(W(sk,[[-4.4,-39.2],[0.4,-40],[2,-35.6],[-0.6,-33],[-3.6,-34.6]]));
      p.F(M.vest[0]); p.poly(W(sk,[[8.6,-26],[11.8,-25],[13.4,-17],[13.6,-10],[11.6,-12.6],[10,-19]]));
      // rasgo do colete com costelas à mostra
      p.F(M.vest[3]); p.poly(W(sk,[[-7,-29],[-2,-31],[0.6,-26],[0,-18],[-3.6,-16],[-7.4,-20]]));
      p.F(M.flesh[2]); p.poly(W(sk,[[-6,-27.6],[-2.6,-28.8],[-0.8,-25],[-1.2,-19.4],[-3.6,-18],[-6.2,-21]]));
      p.F(M.flesh[3]); p.poly(W(sk,[[-6.2,-21],[-3.6,-18],[-1.2,-19.4],[-1.4,-21.4],[-4,-20.2]]));
      p.F(form==='plenilunar'?M.bone[0]:M.bone[1]); [[-26],[-22.8]].forEach(([v])=>p.poly(W(sk,[[-6,v],[-0.8,v-1],[-0.8,v+0.4],[-6,v+1.4]])));
      p.F(M.blood[1]); p.poly(W(sk,[[-3.4,-17],[-2.2,-17.2],[-2.4,-11],[-3.2,-10.8]]));
      if(form!=='comum'){ p.F(M.glow[1]); p.poly(W(sk,[[-6.6,-24],[-9,-29],[-8.2,-29.4],[-6,-24.6]])); }
    });
    // vivo da frente do colete e botões dourados acompanhando a barriga
    p.F(M.vest[0]); p.poly(W(sk,[[0.2,-40],[2.8,-35.6],[5.4,-30.4],[8.4,-27],[8,-26.2],[4.6,-29.6],[2,-34.8],[-0.6,-39.6]]));
    [[12.2,-20],[13.2,-14],[13,-8],[12.4,-2.4]].forEach(([uu,v])=>{ const q=Wp(sk,uu,v); p.F(M.button[2]); p.circle(q,1.3); p.F(M.button[0]); p.rect(q.x-0.2,q.y-0.9,0.8,0.7); });
  }

  /* ---------- colarinho + gravata borboleta (por cima do pescoço) ---------- */
  function drawCollar(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    p.F(M.shirt[1]); p.poly(W(sk,[[-2.4,-40.4],[8,-40.4],[9.6,-37],[7,-36],[-1.6,-37]]));
    p.F(M.shirt[2]); p.poly(W(sk,[[-2.4,-38.4],[7,-38.4],[7,-36],[-1.6,-37]]));
    p.F(M.shirt[0]); p.poly(W(sk,[[3,-40.4],[8,-40.4],[8.6,-39.4],[3,-39.6]]));
    p.F(M.shirt[1]); p.poly(W(sk,[[7.2,-40],[11,-37.4],[8.6,-36.4]])); // ponta do colarinho
    // borboleta: nó + duas asas (frente/trás)
    const k=Wp(sk,9.4,-37.6), sw=Math.sin(P.hx*0.6+P.lean*0.06)*0.5;
    const B=(list)=>list.map(([a,b])=>[k.x+a,k.y+b+sw]);
    p.F(M.tie[1]); p.poly(B([[0,0],[4.4,-3.6],[5.2,-0.2],[4.6,3.4]])); p.poly(B([[0,0],[-3.4,-3.4],[-3.8,0],[-3.2,3.4]]));
    p.F(M.tie[2]); p.poly(B([[0,0],[4.6,3.4],[5.2,0.6],[2,0.6]])); p.poly(B([[0,0],[-3.2,3.4],[-3.8,0.4]]));
    p.F(M.tie[3]); p.poly(B([[-3.4,-3.4],[-3.8,0],[-3.2,3.4],[-2.6,3]]));
    p.F(M.tie[0]); p.poly(B([[1.2,-1.2],[4,-3],[4.4,-2.2],[1.6,-0.6]]));
    p.F(M.tie[1]); p.ell(k.x,k.y+sw,1.6,1.9); p.F(M.tie[0]); p.rect(k.x-0.4,k.y-1.4+sw,0.9,0.8);
    p.F(M.blood[2]); p.rect(k.x+2.4,k.y+1.2+sw,1.2,1);
  }

  /* ---------- pano de prato enfiado no cordão do avental (atrás) ---------- */
  function drawTowel(c,u,M,sk,P){
    const p=mkPen(c,u); p.id();
    const s=Wp(sk,-8.4,1), sw=Math.sin(P.hx*0.8+P.lean*0.08)*0.8; // enfiado no cordão do avental, atrás
    const top=[[s.x-3.4,s.y-2.4],[s.x+3,s.y-2.8],[s.x+3.6+sw,s.y+10.6],[s.x+0.4+sw,s.y+11.4],[s.x-2.8+sw,s.y+10.8]];
    p.F(M.towel[1]); p.poly(top);
    clip(c,top,()=>{
      p.F(M.towel[2]); p.poly([[s.x-6,s.y-4],[s.x-0.6,s.y-4],[s.x-0.2+sw,s.y+13],[s.x-6,s.y+13]]);
      p.F(M.towel[3]); p.rect(s.x-6,s.y-4,20,2.2);
      // duas listras vermelhas perto da barra (pano de prato de boteco)
      p.F(M.check[1]); p.rect(s.x-6,s.y+6.4,14,1.3); p.rect(s.x-6,s.y+8.6,14,0.8);
    });
  }

  /* ---------- cabeça: careca redonda e larga, nariz batatudo, bigodão branco, papada, orelha ---------- */
  function drawHead(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.xf(sk.ha,sk.neck.x,sk.neck.y); c.scale(HS,HS);
    // pescoço grosso
    p.F(M.skin[1]); p.poly([[-4.6,4],[4.8,4],[5.6,-3],[-4.2,-5.4]]);
    p.F(M.skin[2]); p.poly([[-4.6,4],[0,4],[-0.4,-4.6],[-4.2,-5.4]]);
    p.F(M.flesh[2]); p.ell(-2,-0.6,1.6,1.8);
    // crânio redondo e largo (testa e nuca arredondadas)
    const SK=[]; for(let i=0;i<24;i++){ const a=i/24*PI*2; SK.push([1.2+Math.cos(a)*10.2, -12.6+Math.sin(a)*9.6]); }
    const FACE=[[-4.4,-7],[10.6,-8.4],[11.2,-4.6],[9.6,-2],[2.6,-1.4],[-3.4,-3]];
    p.F(M.skin[1]); p.poly(SK); p.poly(FACE);
    const shade=()=>{
      // sombra fria grande na nuca e embaixo; luz grande no domo
      p.F(M.skin[2]); p.poly([[-12,-30],[-1.4,-30],[-3,-20],[-1.6,-12],[2,-6.6],[12,-5.4],[12,4],[-12,4]]);
      p.F(M.skin[3]); p.poly([[-12,-30],[-6.4,-26],[-7.6,-16],[-5.2,-7],[-12,4]]);
      p.F(M.skin[0]); p.poly([[-2.4,-21.6],[4,-22.4],[9.4,-19],[10.6,-15],[7.6,-16.4],[3,-19.4],[-1.6,-19.8]]);
      p.F(M.skin[0]); p.poly([[5.6,-8.4],[9.8,-9],[10.4,-6.8],[6.4,-6.6]]); // bochecha cheia
    };
    clip(c,SK,shade); clip(c,FACE,shade);
    // rachadura na testa (corrupção)
    p.F(M.vein[2]); p.poly([[2.4,-21.6],[3.4,-21.6],[4,-18.2],[3,-18]]);
    p.F(form==='comum'?M.vein[1]:M.glow[1]); p.rect(3,-19.2,1,0.9);
    // franja grisalha em ferradura (atrás da orelha)
    p.F(M.hair[1]); p.poly([[-9.4,-16],[-6.6,-18.2],[-3,-17.6],[-1,-14.6],[-1.2,-9.6],[-4,-7.6],[-7.6,-8],[-9.8,-11.6]]);
    p.F(M.hair[2]); p.poly([[-9.8,-11.6],[-7.6,-8],[-4,-7.6],[-5.6,-10.4],[-8.6,-12]]);
    p.F(M.hair[0]); p.poly([[-6.6,-18],[-3,-17.4],[-2.6,-16.4],[-6.2,-16.8]]);
    // orelha grande, bem visível
    p.F(M.skin[1]); p.ell(-1.4,-11,2.8,3.8); p.F(M.skin[2]); p.ell(-1.8,-10.4,1.8,2.8); p.F(M.skin[3]); p.ell(-1.2,-10.8,1,1.8);
    // sobrancelha branca grossa
    p.F(M.stache[1]); p.poly([[4.4,-14.4],[8.6,-15.4],[11.4,-14.2],[11.2,-12.4],[8.2,-13],[4.8,-12.4]]);
    p.F(M.stache[0]); p.poly([[5.6,-14.6],[9,-15.2],[9.6,-14.4],[6,-13.8]]);
    // olho de lua fundo + olheira
    p.F(M.skin[3]); p.ell(7.8,-10.4,2.8,2.2);
    p.F(M.eye[2]); p.ell(8.2,-10.3,2,1.5); p.F(M.eye[1]); p.ell(8.4,-10.4,1.4,1); p.F(M.eye[0]); p.rect(8.4,-11,1,0.8);
    p.F(M.flesh[3]); p.poly([[5.8,-8.6],[10,-8.6],[9.2,-7.6],[6.4,-7.8]]);
    if(form!=='comum'){ p.F(M.glow[0]); p.rect(7.6,-11,1.8,1.2); }
    // nariz batatudo (vermelho de boteco)
    p.F(M.skin[1]); p.ell(13.2,-7.6,3.6,3.2); p.ell(11.8,-10,1.8,2);
    p.F(M.skin[2]); p.poly([[9.6,-6.4],[15.6,-6.4],[15,-4.6],[12.6,-4.2],[10.2,-5]]);
    p.F(M.flesh[1]); p.ell(14.4,-8,1.8,1.4);
    p.F(M.skin[0]); p.ell(13.6,-9.6,1.3,0.9);
    p.F(M.skin[3]); p.ell(12.4,-5.2,1.1,0.6);
    p.F(M.rot[1]); p.ell(0.6,-6.6,1.6,1.2);
    p.id();
  }
  // bigodão branco grosso: massa clara sob o nariz, com sombra embaixo separando do queixo
  function drawStache(c,u,M,sk,P){
    const p=mkPen(c,u); p.xf(sk.ha,sk.neck.x,sk.neck.y); c.scale(HS,HS);
    p.F(M.mouth[1]); p.poly([[6,0],[15.4,0.4],[14.6,3.4],[6.6,3.4]]);
    const ST=[[6,-4],[9.4,-5.6],[13,-5.6],[15.6,-4.6],[16.8,-2.4],[16.6,1.8],[15.2,3],[14.2,0.8],[12,-0.2],[10,0.2],[8.2,1],[7,2.8],[5.6,1.2],[5.4,-2]];
    p.F(M.stache[1]); p.poly(ST);
    p.F(M.stache[2]); p.poly([[5.4,-1],[10,-1.4],[13.6,-1.4],[16.7,-0.6],[16.6,1.8],[15.2,3],[14.2,0.8],[12,-0.2],[10,0.2],[8.2,1],[7,2.8],[5.6,1.2]]);
    p.F(M.stache[0]); p.poly([[7.6,-4.8],[11,-5.4],[14.4,-5],[16,-3.6],[11,-3.4],[7.8,-3.4]]);
    p.F(M.stache[3]); p.poly([[5.6,1.2],[7,2.8],[7.4,0.8]]); p.poly([[15.2,3],[16.6,1.8],[15.6,1]]);
    p.id();
  }
  // queixo largo + papada (gira com a boca)
  function drawJaw(c,u,M,sk,P){
    const p=mkPen(c,u); const h=sk.H(2.6,-3.6); p.xf(sk.ha+rad(P.jaw),h.x,h.y); c.scale(HS,HS);
    p.F(M.skin[1]); p.poly([[-3,-1.4],[10.2,-0.8],[11.4,1.6],[10.6,4.6],[7,6.2],[1,6.4],[-3.4,4.6]]);
    p.F(M.skin[2]); p.poly([[-3.4,4.6],[1,6.4],[7,6.2],[10.6,4.6],[10.8,3.4],[6,4.2],[0,3.6],[-3.2,2.4]]);
    // papada
    p.F(M.skin[2]); p.poly([[-3.4,4.6],[1,6.4],[6,6.4],[4.6,8.6],[0,9],[-3.6,7.4]]);
    p.F(M.skin[3]); p.poly([[-3.6,7.4],[0,9],[4.6,8.6],[3.6,9.6],[-0.4,10],[-3.4,8.8]]);
    p.F(M.skin[0]); p.ell(7.6,2.4,2.2,1);
    p.F(M.mouth[1]); p.poly([[2.6,-0.8],[9.6,-0.4],[9.6,1.2],[3,1]]);
    p.F(M.teeth[1]); [[4.4,-1,1.3,1.6],[6.4,-1,1.3,2],[8.2,-1,1,1.6]].forEach(([x,y,w,hh])=>p.rect(x,y,w,hh));
    const L=2+(P.drool%4)*1.2+(P.jaw>30?2:0);
    p.F(M.blood[1]); p.poly([[9.2,4.4],[10.6,3.8],[10.4,3.8+L],[9.8,4.8+L]]); p.ell(10.1,4.8+L,1,1);
    p.id();
  }
  function drawMouthIn(c,u,M,sk,P){
    if(P.jaw<14) return; const p=mkPen(c,u); p.id();
    const a=sk.H(4.6,-2), b=sk.H(13,-2), h=sk.H(2.6,-3.6), ja=sk.ha+rad(P.jaw), jc=Math.cos(ja), js=Math.sin(ja);
    const J=(x,y)=>({x:h.x+(x*jc-y*js)*HS,y:h.y+(x*js+y*jc)*HS}), d=J(10,0.6), e=J(3,0.6);
    p.F(M.mouth[2]); p.poly([[a.x,a.y],[b.x,b.y],[d.x,d.y],[e.x,e.y]]);
    p.F(M.mouth[3]); const m=lerp(lerp(a,b,0.3),lerp(e,d,0.3),0.5); p.circle(m,1.6);
  }

  /* ---------- rastros ---------- */
  function drawSmear(c,u,M,sk,P){
    const p=mkPen(c,u); p.id();
    const sh=sk.shB, w=P.tray>=0.5?sk.tc:(P.bot>=0.5?{x:sk.bh.x+sk.bd.x*18,y:sk.bh.y+sk.bd.y*18}:sk.wrF), o=P.tray>=0.5?sh:sk.shF;
    const r=Math.hypot(w.x-o.x,w.y-o.y)+(P.tray>=0.5?12:2), a1=Math.atan2(w.y-o.y,w.x-o.x);
    const n=10, pts=[]; for(let i=0;i<=n;i++){ const a=a1-1.6+1.65*i/n; pts.push([o.x+Math.cos(a)*r,o.y+Math.sin(a)*r]); }
    for(let i=n;i>=0;i--){ const a=a1-1.6+1.65*i/n, rr=r-2-10*(i/n); pts.push([o.x+Math.cos(a)*rr,o.y+Math.sin(a)*rr]); }
    p.F(M.swish[0]); p.poly(pts.map(([x,y])=>[Math.max(1,Math.min(FW-2,x)),Math.max(1,Math.min(GROUND,y))]));
    p.F(M.swish[2]); const q=pts.slice(n-3,n+1); for(let k=0;k<q.length-1;k++) p.cap({x:q[k][0],y:q[k][1]},{x:q[k+1][0],y:q[k+1][1]},0.9,0.9);
  }
  // giro: anel de rastro em volta da bandeja/corpo (atrás e na frente)
  function drawSwirl(c,u,M,sk,P,front){
    const p=mkPen(c,u); p.id(); const cx=sk.hip.x, cy=sk.T(0,-30).y, R=26, r=5;
    const pts=[]; const a0=front?0.15:PI+0.15, a1=front?PI-0.15:2*PI-0.15;
    for(let i=0;i<=12;i++){ const a=a0+(a1-a0)*i/12; pts.push([cx+Math.cos(a)*R, cy+Math.sin(a)*r]); }
    for(let i=12;i>=0;i--){ const a=a0+(a1-a0)*i/12; pts.push([cx+Math.cos(a)*(R-4), cy+Math.sin(a)*(r-1.6)+1.2]); }
    p.F(front?M.swish[0]:M.swish[2]); p.poly(pts);
  }
  // cacos de vidro e chope no chão (na morte, perto da bandeja caída)
  function drawShards(p,M,x,y,st,form,spread){
    const k=spread||1;
    p.F(M.beer[2]); p.ell(x,y,11*k,2.2); p.F(M.beer[1]); p.ell(x-1,y-0.4,7*k,1.4); p.F(M.foam[1]); p.ell(x+3,y-0.6,2.4,0.7);
    [[-8,-1,1],[ -3,-2.6,0],[2,-1.4,1],[6,-2.2,0],[9,-0.6,1],[-11,-0.4,0]].forEach(([dx,dy,t],i)=>{ const X=x+dx*k, Y=y+dy;
      p.F(M.glass[1]); p.poly([[X-1.6,Y+1],[X+1.4,Y+1],[X+0.4,Y-1.8-t]]); p.F(M.glass[0]); p.rect(X-0.4,Y-0.8,0.7,0.7+((i+st)%3===0?0.6:0));
      if((i+st)%3===0){ p.F(M.glow[0]); p.rect(X-0.4,Y-2.6-t,0.8,0.8); } });
    if(form==='plenilunar'){ p.F(M.glow[1]); p.ell(x+5,y-0.2,1.6,0.6); }
  }

  /* ---------- adereços ---------- */
  const PW=34, PH=34, PG=22, PAX=17;
  function frameProp(form,anim,st,K){
    const M=mats(form); let parts;
    if(anim==='xGlass'){ // tulipa girando no ar com rastro de chope
      const ang=[0,0.9,1.8,2.7][((st|0)%4+4)%4];
      parts=[
        {noShade:true,noRim:true,smear:true,draw:(c,u)=>{ const p=mkPen(c,u); p.id(); p.F(M.swish[1]); p.poly([[1,PG-4],[9,PG-6],[9,PG-2],[2,PG-1.6]]); p.F(M.beer[1]); [[4,PG-8],[7,PG-1],[2,PG-5]].forEach(([x,y])=>p.ell(x,y,1,0.8)); }},
        {draw:(c,u)=>{ const p=mkPen(c,u); p.xf(ang,PAX+2,PG-5); drawGlass(p,M,0,7.4,1.5,form,{fill:0.7,crack:form!=='comum'}); p.id(); }},
      ];
      const cv=compose({FW:Math.round(PW*K),FH:Math.round(PH*K),GROUND:PH*K,parts,M,step:5,flash:0,rim:RIM[form]});
      cv._ax=PAX*K; cv._gy=PG*K; return cv;
    }
    // xShard: cacos + poça (chão)
    const SW=40, SHh=12, SG=8, SAX=20;
    parts=[{noRim:true,draw:(c,u)=>{ const p=mkPen(c,u); p.id(); drawShards(p,M,SAX,SG,st|0,form,1); }}];
    const cv=compose({FW:Math.round(SW*K),FH:Math.round(SHh*K),GROUND:SHh*K,parts,M,step:4,flash:0,rim:RIM[form]});
    cv._ax=SAX*K; cv._gy=SG*K; return cv;
  }

  /* ---------- montagem ---------- */
  // espelha/encolhe o quadro inteiro em volta do eixo (giro do corpo); mantém pixel duro
  function turnCanvas(cv,t,K){
    if(t>=0.999) return cv; const s=Math.sign(t)*Math.max(0.6,Math.abs(t));
    const o=document.createElement('canvas'); o.width=cv.width; o.height=cv.height; const g=o.getContext('2d'); g.imageSmoothingEnabled=false;
    g.translate(AX*K,0); g.scale(s,1); g.drawImage(cv,-AX*K,0); return o;
  }
  // bandeja quebrada (~sem): nada de bandeja, copos, bandeja caída nem cacos; o braço de trás que a erguia
  // desce pra uma pose solta (base do idleX + um pouco do movimento original) e a mão vira punho
  const wrapA=a=>((a+540)%360)-180;
  function noTray(P){
    if(P.tray>=0.5){ P.aBs=-14+0.35*wrapA(P.aBs-REST.aBs); P.aBe=10+0.35*wrapA(P.aBe-REST.aBe); }
    P.tray=0; P.gl=0; P.tloose=0; P.shards=0;
    return P;
  }
  const cache=PIX.cache();
  function frame(form,anim,fi,step=5,Pov,pk){
    const K=PIX.getK(), key=(pk!=null?'#'+pk+'|'+form:form+'|'+anim+'|'+fi+'|'+step)+'@'+K;
    const hit=cache.get(key); if(hit){ cache.delete(key); cache.set(key,hit); return hit; }
    const fm=String(form).split('~'), sem=fm[1]==='sem'; form=fm[0];
    if(ANIMS[anim]&&ANIMS[anim].prop){ const st=Pov&&Pov.st!=null?Math.round(Pov.st):fi; const cv=frameProp(form,anim,st,K); cache.set(key,cv); return cv; }
    const P=Pov?Object.assign({},REST,Pov):poseOf(anim,fi);
    if(sem) noTray(P);
    const M=mats(form), sk=skeleton(P);
    const gl=P.gl<0?GL[form]||3:Math.round(P.gl), trayOn=P.tray>=0.5;
    const parts=[];
    if(P.swirl>=0.5) parts.push({noShade:true, smear:true, noRim:true, draw:(c,u)=>drawSwirl(c,u,M,sk,P,false)});
    if(P.shards>=0.5) parts.push({noRim:true, draw:(c,u)=>{ const p=mkPen(c,u); p.id(); drawShards(p,M,AX+P.tdx+6,GROUND-1.6,P.shards|0,form,P.shards>=2?1.3:0.8); }});
    parts.push(
      {back:true, draw:(c,u)=>drawArm(c,u,M,sk,P,false,form)},
      {back:true, draw:(c,u)=>drawLeg(c,u,M,sk,P,false)},
      {draw:(c,u)=>drawLeg(c,u,M,sk,P,true)},
      {draw:(c,u)=>drawApron(c,u,M,sk,P,form)},
      {draw:(c,u)=>drawTorso(c,u,M,sk,P,form)},
      {draw:(c,u)=>{ drawHead(c,u,M,sk,P,form); drawMouthIn(c,u,M,sk,P); }},
      {draw:(c,u)=>drawJaw(c,u,M,sk,P)},
      {draw:(c,u)=>{ drawStache(c,u,M,sk,P); drawCollar(c,u,M,sk,P,form); }},
    );
    if(trayOn) parts.push({draw:(c,u)=>{ const p=mkPen(c,u); drawTray(c,p,M,sk.tc.x,sk.tc.y,rad(P.tr),gl,form,{}); }});
    if(P.smear>=0.5) parts.push({noShade:true, smear:true, noRim:true, draw:(c,u)=>drawSmear(c,u,M,sk,P)});
    parts.push({draw:(c,u)=>drawArm(c,u,M,sk,P,true,form)}, {draw:(c,u)=>drawTowel(c,u,M,sk,P)});
    if(P.tloose>=0.5) parts.push({draw:(c,u)=>{ const p=mkPen(c,u); drawTray(c,p,M,AX+P.tdx,GROUND-3-P.tdy,rad(P.tdr),0,form,{sx:P.tsx}); }});
    if(P.swirl>=0.5) parts.push({noShade:true, smear:true, noRim:true, draw:(c,u)=>drawSwirl(c,u,M,sk,P,true)});
    let cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM[form]}); if(step>=4) heavyOutline(cv);
    const t=P.turn; if(t<0.999) cv=turnCanvas(cv,t,K);
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._eye=sc(sk.H(8.4,-10.4)); cv._mouth=sc(sk.H(10,-2)); cv._hand=sc(sk.wrF); cv._head=sc(sk.H(3,-13)); cv._handB=sc(sk.wrB); cv._tray=sc(sk.tc);
    cache.set(key,cv); if(cache.size>900) cache.delete(cache.keys().next().value);
    return cv;
  }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame,framePose:function(form,anim,P,key){ return frame(form,anim,0,5,P,key); }};
})();
