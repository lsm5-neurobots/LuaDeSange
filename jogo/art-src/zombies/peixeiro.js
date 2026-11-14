/* PEIXEIRO — fonte de arte (editável). Build: npm run art
   Zumbi Peixeiro (comum do Ver-o-Peso, Belém): peixeiro de balcão do Mercado de Peixe, morto e de pé de novo.
   Silhueta "bloco": ombros largos, tronco grosso, avental de borracha amarelo até o joelho, braço do facão mais
   longo, boné de aba curva desbotado, botas de borracha brancas pesadas. Regata branca amarelada (sangue de peixe e
   escamas), luvas de borracha amarelas, calça de moletom arregaçada, isopor de gelo às costas (rabo de peixe pra
   fora), balança de gancho no cinto. Facão largo de ponta quadrada. Corrupção da Lua: olhos de peixe leitosos,
   guelras no pescoço, escamas grudadas na pele, barbatana saindo do antebraço de trás, boca de peixe mordendo a barra
   do avental, gelo-fantasma azul no cinto. Trabalhador do mercado, sem estereótipo.
   Golpes: facão em duas (chop), arremesso de peixe pela cauda (throw → adereço xFish, poça xPool), golpe de cima
   com finta (hack). Depois do arremesso abre o isopor atrás de outro peixe (restock: janela de dano).
   Hi-bit: honra PIX.getK(). */
const PEIXEIRO=(function(){
  const {rad,lerp,P2,mkPen,compose}=PIX;
  const FW=200, FH=164, GROUND=152, AX=84;
  const RIM={comum:'#d8eef4', enluarado:'#9ff6ff', plenilunar:'#ffb46a'};

  /* ---------- materiais ---------- */
  function mats(form){
    const m={
      skin:['#c6d0b6','#8e9c84','#5e6c62','#363e46'],
      vein:['#9ab4c4','#5e7a90','#3e5470','#262e4c'],
      rot:['#b4b08a','#7e7a5c','#545250','#302a38'],
      flesh:['#f6ae94','#c25a5e','#7a3a4a','#4a1c34'],
      bone:['#fff4d8','#dccfa6','#a09070','#605040'],
      scale:['#f0fff8','#a8d8e0','#6a9eb4','#3a5a78'],
      fin:['#eab4a0','#b0706c','#70404c','#3e2030'],
      tank:['#fffbea','#e0d6ba','#a89c80','#625850'],
      apron:['#fbe878','#d8b82a','#93801e','#4e4218'],
      glove:['#fff4a0','#f0c428','#bc7e1a','#6a4014'],
      pants:['#a6aebc','#6e7686','#474c5e','#282a3a'],
      boot:['#ffffff','#e8e4dc','#b0aca8','#66646e'],
      sole:['#8e8c96','#504e5a','#302e3a','#1a1824'],
      cap:['#74b8d2','#2f6a8a','#214a68','#132c44'],
      strap:['#eab474','#aa703c','#6e4428','#3e2418'],
      steel:['#f6fcff','#c8d0d4','#6a7078','#3a3e4a'],
      handle:['#806050','#4c3628','#2e2018','#1a120e'],
      brass:['#fff0a0','#d8a840','#946a24','#553a14'],
      foam:['#ffffff','#e4e8ee','#aeb4c2','#6a7082'],
      tape:['#86d6f4','#2a8ac8','#1c5a8a','#103656'],
      ice:['#ffffff','#c8f0ff','#78c4e6','#3a76a6'],
      fish:['#dfe8ea','#9aa8b0','#5e6a78','#323a4a'],
      belly:['#8a8a96','#4e4e5c','#33323e','#1e1c26'],
      eye:['#ffffff','#dee6e0','#a6b2ac','#687270'],
      mouth:['#7c2e3e','#4c1828','#2e0c1a','#1a0610'],
      teeth:['#fbf0c0','#d8c27c','#9a8650','#5e4e30'],
      hair:['#5a5662','#34303a','#221e28','#141018'],
      water:['#f0feff','#a4dcec','#5e9cbc','#2e5a7c'],
      dirt:['#caa97a','#95754f','#674d35','#3d2b1f'],
      blood:['#c84a3e','#8e2026','#5e1424','#3a0a18'],
      glow:['#f4fffa','#c0f4e4','#76ccc0','#3a8a8a'],
      swish:['#fdfdff','#e6f0ff','#b4c4e8','#7484b0'],
    };
    if(form==='enluarado'){
      m.skin=['#dcdcff','#a0a2e4','#686cae','#3c3a76']; m.vein=['#a8f4ff','#4ad8f0','#2a8ab0','#1a4a7a'];
      m.rot=['#b8a6e0','#8470b0','#56468a','#33285e']; m.flesh=['#f0b0ff','#b866d8','#7a3a9e','#46206a']; m.blood=['#b46ad8','#7e3ea6','#542474','#34144a'];
      m.eye=['#ffffff','#b8fbff','#4ad8f0','#1a8aa8']; m.glow=['#effffe','#7af4ff','#2ab0d8','#146a96']; m.swish=['#ffffff','#c8fbff','#6ae4f4','#2a9ab8'];
      m.apron=['#d8d4ff','#8c86d8','#5a52a2','#332c6a']; m.tank=['#eceaf8','#b8b2d4','#7c76a2','#48426c'];
      m.scale=['#ffffff','#9ff6ff','#3ac8e8','#1a6a9a']; m.fin=['#d8b4f4','#9a6ac8','#62408e','#36205a'];
      m.glove=['#f4f0c8','#c8c48a','#86825c','#4c4838']; m.pants=['#a4a8d4','#6c6e9e','#46466e','#282844'];
      m.cap=['#a8c8f4','#5a76b8','#3a4c86','#202a54']; m.fish=['#d0e4f4','#7c96c0','#4a5a8a','#262e56'];
      m.water=['#f4ffff','#9ff6ff','#3ac8e8','#1a6a9a']; m.ice=['#ffffff','#9ff6ff','#3ac8e8','#1a6a9a'];
      m.dirt=['#a8a0c8','#76709a','#4e4a70','#2e2a48'];
    }
    if(form==='plenilunar'){
      m.skin=['#ffcaa6','#e2806a','#a4424e','#5e1e36']; m.vein=['#fff0a0','#ffb43a','#e0581e','#8a2414'];
      m.rot=['#d0806a','#9a4a4a','#682a3a','#3e1628']; m.flesh=['#ffc07a','#f06a3a','#a8302e','#5e1422']; m.blood=['#ff7a3a','#d43a26','#8a1c22','#4e0c18'];
      m.eye=['#fffbe0','#ffe04a','#ff8a2a','#b83a14']; m.glow=['#fff6c0','#ffb43a','#e0581e','#8a2414']; m.swish=['#fffbe6','#ffe6a8','#ffb460','#d0602a'];
      m.apron=['#ff8a6a','#c82a2a','#7e1622','#440a16']; m.tank=['#f6d6c0','#c89c84','#88584e','#4c2c30'];
      m.scale=['#fff6d0','#ffc87a','#e07a3a','#8a3420']; m.fin=['#ffb08a','#e0603a','#9a2e2a','#561420'];
      m.cap=['#7a8aa8','#3a4462','#262c44','#141828']; m.fish=['#ffb49a','#d0503e','#86283a','#4a1428']; m.belly=['#b06a5a','#6e3a3a','#46222c','#26121a'];
      m.teeth=['#fffbe0','#ffe680','#ffb43a','#b86a20']; m.water=['#fff0d0','#ffb07a','#e0603a','#8a2a20']; m.ice=['#fff6e0','#ffd0a0','#e0905a','#8a4a2a'];
      m.dirt=['#b4705a','#844a3e','#5a2e2e','#36181e'];
    }
    return punch(m);
  }
  const NAMES={skin:'Pele',vein:'Veias',rot:'Podridão',flesh:'Carne',bone:'Osso',scale:'Escamas',fin:'Barbatana',tank:'Regata',apron:'Avental de borracha',glove:'Luvas de borracha',pants:'Calça de moletom',boot:'Bota de borracha',sole:'Solado',cap:'Boné',strap:'Alça/cinto',steel:'Lâmina do facão',handle:'Cabo do facão',brass:'Rebites',foam:'Isopor',tape:'Fita do isopor',ice:'Gelo',fish:'Peixe',belly:'Barriga do peixe',eye:'Olho de peixe',mouth:'Boca',teeth:'Dentes',hair:'Barba rala',water:'Água/poça',dirt:'Sujeira',blood:'Sangue',glow:'Brilho',swish:'Rastro do corte'};
  function sat(h,k){ const [r,g,b]=PIX.hexRgb(h), y=(r+g+b)/3; return PIX.toHex(y+(r-y)*k,y+(g-y)*k,y+(b-y)*k); }
  const NOPUNCH={swish:1,glow:1,water:1};
  function punch(m){ const o={}; for(const k in m){ const r=m[k]; o[k]=NOPUNCH[k]?[r[0],r[1],r[2],r[3]]:[sat(r[0],1.1),sat(r[1],1.14),PIX.mix(sat(r[2],1.1),'#2a1a4c',0.2),PIX.mix(r[3],'#140a24',0.34)]; } return o; }

  /* ---------- poses ---------- */
  // ângulos: 0 = pendurado, + = pra frente (absolutos, como no Malandro). kz = ângulo do facão somado ao do antebraço.
  // fish = peixe na mão de trás (pela cauda), fsw = balanço do peixe; lid = tampa do isopor (0 fechada, 1 aberta).
  // knife = facão na mão (0 = caiu: kdx/kdr posição/giro no chão); spill = peixes espalhados no chão (morte).
  // smear = rastro do facão; sc = escamas caindo (idle).
  const REST={hx:0,rot:0,lift:0,lean:4,hunch:6,head:-6,jaw:6,aFs:18,aFe:46,aBs:-8,aBe:14,kz:76,lFh:12,lFk:-6,lBh:-10,lBk:-20,fF:0,fB:0,fish:0,fsw:0,lid:0,knife:1,kdx:0,kdr:0,spill:0,smear:0,sc:0,flash:0,drool:0,ct:0};
  const S=Math.sin, C=Math.cos, PI=Math.PI, mx=Math.max;
  const ANIMS={
    idle:{nome:'Parado (amola o facão no avental)',n:8,dur:()=>140,pose:i=>{ const p=i/8*PI*2, s=S(p), s2=S(2*p);
      return {hx:0.8*s, lean:4+1.5*S(p+0.5), hunch:6+1.2*s2, head:-6+2*S(p-0.8), jaw:5+4*mx(0,S(p+1)), drool:i%4, sc:i,
        aFs:28+10*s2, aFe:84+14*s2, kz:64-24*s2, aBs:18+3*s, aBe:96+4*s,
        lFh:12+2*s, lFk:-6+2*s, lBh:-10-2*s, lBk:-20+2*s}; }},
    walk:{nome:'Andar pesado (bota chapinha)',n:8,dur:()=>134,pose:i=>{ const p=i/8*PI*2;
      const lFh=10+16*S(p), lBh=-10+12*S(p+PI);
      return {lFh, lFk:lFh-20*mx(0,C(p))-4, lBh, lBk:lBh-10-12*mx(0,C(p+PI)), fF:-10*mx(0,C(p)), fB:18*mx(0,C(p+PI)),
        lean:6+2*S(2*p), hunch:6+2*S(2*p-0.6), head:-6+2.5*S(2*p-1.4), jaw:6+3*S(2*p-1.8), hx:1.2*S(p), lift:1.6*mx(0,S(2*p)),
        aFs:16+14*S(p+PI), aFe:50+12*S(p+PI), kz:76+8*S(p), aBs:-8+16*S(p), aBe:14+16*S(p), drool:i%4}; }},
    alert:{nome:'Alerta (bate o facão e rosna)',n:6,dur:i=>[150,140,190,60,180,170][i],pose:i=>[
      {head:-2,jaw:12,lean:0},
      {head:2,jaw:18,lean:-4,hx:-2,aFs:150,aFe:190,kz:100,aBs:30,aBe:70,lFh:16,lBh:-14},
      {head:4,jaw:26,lean:-6,hx:-3,aFs:166,aFe:206,kz:96,aBs:40,aBe:84,lFh:18,lBh:-16},
      {head:-8,jaw:30,lean:16,hunch:12,hx:4,aFs:80,aFe:60,kz:30,aBs:20,aBe:60,smear:1,lFh:22,lBh:-18},
      {head:-10,jaw:38,lean:18,hunch:14,hx:4,aFs:60,aFe:30,kz:40,aBs:10,aBe:50,lFh:22,lBh:-18},
      {head:-6,jaw:16,lean:8,hunch:8,hx:1,aFs:30,aFe:60,kz:70}][i]},
    // ---- golpes (IA escolhe por distância/peso; hit = quadro(s) do dano, reach = alcance em px) ----
    chop:{nome:'Facão em duas (corte e revés)',n:9,hit:[3,6],reach:38,dur:i=>[70,170,50,110,80,90,60,130,160][i],pose:i=>[
      {lean:-4,hunch:4,head:-2,jaw:14,hx:-1,aFs:120,aFe:160,kz:90,aBs:20,aBe:50,lFh:16,lBh:-14},
      {lean:-10,hunch:2,head:2,jaw:22,hx:-3,aFs:168,aFe:204,kz:94,aBs:30,aBe:66,lFh:16,lFk:-8,lBh:-14,lBk:-26},
      {lean:14,hunch:14,head:-10,jaw:28,hx:3,aFs:110,aFe:110,kz:40,smear:1,aBs:0,aBe:30,lFh:24,lFk:2,lBh:-20,lBk:-30},
      {lean:20,hunch:16,head:-12,jaw:14,hx:5,aFs:56,aFe:26,kz:20,smear:1,aBs:-14,aBe:10,lFh:26,lFk:2,lBh:-22,lBk:-32,fB:10},
      {lean:18,hunch:14,head:-10,jaw:16,hx:4,aFs:30,aFe:-20,kz:40,aBs:-10,aBe:10,lFh:26,lBh:-22,lBk:-32,fB:10},
      {lean:6,hunch:10,head:-4,jaw:26,hx:3,aFs:-30,aFe:-60,kz:110,aBs:20,aBe:50,lFh:20,lBh:-18},
      {lean:26,hunch:14,head:-14,jaw:36,hx:10,aFs:84,aFe:96,kz:-10,smear:1,aBs:-30,aBe:-10,lFh:34,lFk:8,lBh:-28,lBk:-36,fB:16},
      {lean:28,hunch:16,head:-14,jaw:40,hx:11,aFs:96,aFe:104,kz:-14,aBs:-30,aBe:-14,lFh:34,lFk:8,lBh:-28,lBk:-36,fB:16},
      {lean:10,hunch:9,head:-7,jaw:14,hx:3,aFs:30,aFe:60,kz:70}][i]},
    throw:{nome:'Arremesso de peixe (pela cauda)',n:9,toss:4,reach:120,dur:i=>[90,80,80,80,60,120,130,130,150][i],pose:i=>[
      {lean:-2,hunch:6,head:-4,jaw:12,hx:-1,aBs:-50,aBe:-150,lid:0.8,aFs:24,aFe:60,lFh:14,lBh:-12},
      {lean:-8,hunch:4,head:0,jaw:18,hx:-3,aBs:-80,aBe:-170,fish:1,fsw:20,lid:0.5,aFs:30,aFe:70,lFh:16,lBh:-16},
      {lean:-14,hunch:2,head:4,jaw:24,hx:-4,aBs:-150,aBe:-200,fish:1,fsw:-60,aFs:40,aFe:80,lFh:18,lFk:-6,lBh:-18,lBk:-28},
      {lean:-8,hunch:4,head:2,jaw:30,hx:-3,aBs:170,aBe:200,fish:1,fsw:-110,aFs:30,aFe:60,lFh:20,lBh:-20,lBk:-30},
      {lean:20,hunch:14,head:-10,jaw:40,hx:5,aBs:110,aBe:96,fish:0,smear:2,aFs:-10,aFe:20,lFh:28,lFk:4,lBh:-24,lBk:-34,fB:12},
      {lean:24,hunch:16,head:-12,jaw:34,hx:6,aBs:70,aBe:40,aFs:-16,aFe:10,lFh:28,lFk:4,lBh:-24,lBk:-34,fB:12},
      {lean:18,hunch:14,head:-10,jaw:24,hx:5,aBs:40,aBe:30,aFs:0,aFe:30,lFh:24,lBh:-20},
      {lean:10,hunch:10,head:-8,jaw:16,hx:2,aBs:10,aBe:24,aFs:10,aFe:40,lFh:16,lBh:-14},
      {lean:5,hunch:7,head:-6,jaw:10}][i]},
    hack:{nome:'Golpe de cima (finta e cutelada)',n:8,hit:3,reach:34,dur:i=>[90,80,90,60,150,120,130,150][i],pose:i=>[
      {lean:14,hunch:10,head:-8,jaw:20,hx:4,aFs:70,aFe:80,kz:10,aBs:-10,aBe:20,lFh:22,lFk:0,lBh:-16,lBk:-28},
      {lean:-6,hunch:4,head:0,jaw:18,hx:-2,aFs:120,aFe:150,kz:80,aBs:20,aBe:60,lFh:14,lBh:-14},
      {lean:-14,hunch:0,head:4,jaw:30,hx:-4,aFs:176,aFe:214,kz:100,aBs:150,aBe:180,lFh:30,lFk:-30,lBh:-16,lBk:-26,fF:-10,lift:3},
      {lean:30,hunch:18,head:-16,jaw:44,hx:9,aFs:76,aFe:50,kz:30,aBs:40,aBe:70,smear:1,lFh:34,lFk:6,lBh:-26,lBk:-34,fB:14},
      {lean:32,hunch:20,head:-16,jaw:40,hx:10,aFs:50,aFe:4,kz:60,aBs:30,aBe:60,lFh:34,lFk:6,lBh:-26,lBk:-34,fB:14},
      {lean:24,hunch:16,head:-12,jaw:24,hx:8,aFs:40,aFe:10,kz:70,aBs:20,aBe:50,lFh:28,lBh:-22},
      {lean:12,hunch:10,head:-8,jaw:16,hx:4,aFs:30,aFe:40,kz:70,lFh:18,lBh:-14},
      {lean:5,hunch:7,head:-6,jaw:10}][i]},
    restock:{nome:'Abre o isopor atrás de outro peixe (aberto!)',n:6,dur:i=>[140,160,170,170,140,120][i],pose:i=>[
      {lean:-4,hunch:6,head:-14,jaw:10,hx:-1,aBs:-50,aBe:-140,lid:0.4,aFs:10,aFe:30,kz:90},
      {lean:-8,hunch:10,head:-24,jaw:16,hx:-2,aBs:-70,aBe:-160,lid:1,aFs:6,aFe:24,kz:90},
      {lean:-6,hunch:12,head:-28,jaw:20,hx:-2,aBs:-60,aBe:-176,lid:1,aFs:6,aFe:20,kz:90},
      {lean:-8,hunch:10,head:-26,jaw:14,hx:-2,aBs:-74,aBe:-150,lid:1,aFs:6,aFe:24,kz:90},
      {lean:-4,hunch:8,head:-16,jaw:12,hx:-1,aBs:-60,aBe:-130,lid:0.8,fish:1,fsw:30,aFs:10,aFe:30,kz:86},
      {lean:2,hunch:6,head:-8,jaw:10,aBs:-20,aBe:10,lid:0,fish:1,fsw:10}][i]},
    hurt:{nome:'Dano (cabeça)',n:4,dur:i=>[80,110,130,150][i],pose:i=>[
      {lean:-10,hunch:2,head:8,jaw:30,aFs:-10,aFe:30,kz:60,aBs:-20,aBe:10,hx:-5,flash:1,lFh:14,lBh:-4,ct:-6},
      {lean:-6,hunch:4,head:4,jaw:26,aFs:0,aFe:36,aBs:-12,aBe:16,hx:-4,lFh:12,lBh:-6,ct:-3},
      {lean:0,hunch:5,head:-2,jaw:18,aFs:10,aFe:44,aBs:-10,aBe:14,hx:-2},
      {lean:3,hunch:6,head:-5,jaw:10,hx:0}][i]},
    hurtB:{nome:'Dano (barriga, dobra)',n:4,dur:i=>[80,120,140,150][i],pose:i=>[
      {lean:28,hunch:22,head:6,jaw:40,aFs:50,aFe:20,kz:40,aBs:44,aBe:14,hx:-7,flash:1,lFh:20,lFk:-14,lBh:-14,lBk:-30},
      {lean:24,hunch:20,head:2,jaw:36,aFs:46,aFe:24,kz:40,aBs:40,aBe:20,hx:-6,lFh:18,lFk:-12,lBh:-14,lBk:-28},
      {lean:14,hunch:14,head:-4,jaw:24,aFs:34,aFe:54,aBs:20,aBe:36,hx:-3},
      {lean:6,hunch:8,head:-6,jaw:12,hx:-1}][i]},
    fall:{nome:'Derrubado',n:6,dur:i=>[90,90,90,110,140,260][i],pose:i=>[
      {lean:-12,hunch:2,head:6,jaw:34,aFs:-40,aFe:-20,kz:60,aBs:-46,aBe:-30,hx:-6,flash:1,lFh:20,lBh:0,ct:-8},
      {rot:-30,lean:-4,hunch:6,head:0,jaw:30,aFs:-60,aFe:-40,aBs:-70,aBe:-50,hx:-4,lFh:40,lFk:30,lBh:20,lBk:10},
      {rot:-62,lean:0,hunch:8,head:-4,jaw:28,aFs:-90,aFe:-70,aBs:-96,aBe:-80,hx:-6,lFh:50,lFk:40,lBh:30,lBk:24},
      {rot:-90,lean:4,hunch:10,head:-2,jaw:36,aFs:-110,aFe:-120,aBs:-100,aBe:-110,hx:2,lFh:40,lFk:10,lBh:30,lBk:4},
      {rot:-84,lean:2,hunch:12,head:-8,jaw:30,aFs:-120,aFe:-140,aBs:-104,aBe:-126,hx:2,lFh:46,lFk:20,lBh:34,lBk:10},
      {rot:-90,lean:0,hunch:10,head:-4,jaw:34,aFs:-130,aFe:-150,aBs:-110,aBe:-136,hx:2,lFh:40,lFk:6,lBh:26,lBk:0}][i]},
    getup:{nome:'Levantar (apoia no facão)',n:6,dur:i=>[200,170,170,160,160,150][i],pose:i=>[
      {rot:-90,lean:0,hunch:10,head:-4,jaw:34,aFs:-130,aFe:-150,aBs:-110,aBe:-136,hx:2,lFh:40,lFk:6,lBh:26,lBk:0},
      {rot:-60,lean:10,hunch:18,head:-16,jaw:24,aFs:-50,aFe:-10,aBs:-60,aBe:-20,hx:-8,lFh:90,lFk:10,lBh:70,lBk:0},
      {rot:-30,lean:20,hunch:22,head:-24,jaw:20,aFs:-10,aFe:10,aBs:-20,aBe:0,hx:-6,lFh:100,lFk:10,lBh:60,lBk:-60},
      {rot:0,lean:30,hunch:22,head:-26,jaw:20,aFs:40,aFe:10,kz:120,aBs:20,aBe:4,hx:-4,lFh:74,lFk:-2,lBh:6,lBk:-80,fB:50},
      {rot:0,lean:12,hunch:14,head:-14,jaw:14,aFs:30,aFe:60,aBs:30,aBe:60,hx:-1,lFh:28,lFk:-12,lBh:-12,lBk:-30},
      {lean:5,hunch:7,head:-6,jaw:10}][i]},
    death:{nome:'Morte (escorrega na própria água, peixes se espalham)',n:8,dur:i=>[90,150,150,140,140,150,170,600][i],pose:i=>[
      {lean:-10,hunch:2,head:8,jaw:40,aFs:-30,aFe:-10,kz:40,aBs:-40,aBe:-24,hx:-5,flash:1,lFh:14,lBh:-4,ct:-8},
      {lean:-4,hunch:4,head:10,jaw:46,aFs:60,aFe:120,aBs:-20,aBe:-4,hx:-6,lFh:40,lFk:30,lBh:-8,lBk:-20,knife:0,kdx:18,kdr:30,spill:0.3},
      {lean:-14,hunch:2,head:14,jaw:48,aFs:110,aFe:150,aBs:60,aBe:100,hx:-8,lFh:70,lFk:60,lBh:10,lBk:-10,fF:20,lift:4,knife:0,kdx:26,kdr:120,spill:0.6},
      {rot:-24,lean:-14,hunch:4,head:12,jaw:46,aFs:120,aFe:160,aBs:90,aBe:130,hx:-8,lFh:84,lFk:70,lBh:40,lBk:20,fF:30,lift:6,knife:0,kdx:30,kdr:200,spill:1},
      {rot:-56,lean:-8,hunch:6,head:8,jaw:44,aFs:-90,aFe:-70,aBs:-96,aBe:-80,hx:-6,lFh:60,lFk:44,lBh:36,lBk:24,knife:0,kdx:30,kdr:270,spill:1},
      {rot:-84,lean:-2,hunch:8,head:2,jaw:40,aFs:-110,aFe:-120,aBs:-100,aBe:-110,hx:-2,lFh:44,lFk:16,lBh:30,lBk:6,knife:0,kdx:30,kdr:280,spill:1},
      {rot:-90,lean:2,hunch:10,head:-4,jaw:40,aFs:-126,aFe:-146,aBs:-106,aBe:-130,hx:0,lFh:36,lFk:6,lBh:24,lBk:0,knife:0,kdx:30,kdr:280,spill:1},
      {rot:-90,lean:0,hunch:10,head:-2,jaw:42,aFs:-132,aFe:-152,aBs:-110,aBe:-136,hx:0,lFh:34,lFk:4,lBh:22,lBk:-2,knife:0,kdx:30,kdr:280,spill:1,drool:3}][i]},
    // adereços (desenhados pelo motor como ator extra; âncora em cv._ax/_gy)
    xFish:{nome:'Peixe voando (adereço)',n:4,prop:true,dur:()=>60,pose:i=>({st:i})},
    xPool:{nome:'Poça de água e escamas (adereço)',n:3,prop:true,dur:()=>160,pose:i=>({st:i})},
  };
  const EXK=['hx','lean','hunch','head','aFs','aFe','aBs','aBe','lFh','lFk','lBh','lBk'];
  function exag(P,f){ if(f===1||Math.abs(P.rot)>4) return P; EXK.forEach(k=>{ P[k]=REST[k]+(P[k]-REST[k])*f; }); P.jaw=Math.min(56,mx(0,REST.jaw+(P.jaw-REST.jaw)*f)); return P; }
  const EXF={idle:1.04,walk:1.08,alert:1.1,chop:1.14,throw:1.1,hack:1.14,restock:1.04,hurt:1.28,hurtB:1.22,fall:1.08,getup:1.06,death:1.06};
  ZREACT.add(ANIMS,REST,{moves:{backhand:["swipe","Revés de facão"]}});
  function poseOf(anim,i){ const A=ANIMS[anim]; if(A&&A.prop) return Object.assign({},REST,A.pose(i)); return exag(Object.assign({},REST,A.pose(i)),EXF[anim]||1); }
  function heavyOutline(cv){ const g=cv.getContext('2d'), W=cv.width, H=cv.height, im=PIX.pix(cv), d=im.data;
    const isO=i=>d[i+3]===255&&d[i]===0x17&&d[i+1]===0x0b&&d[i+2]===0x1c, fill=i=>d[i+3]===255&&!isO(i);
    const add=[]; for(let y=2;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(d[i+3]) continue; const u=((y-1)*W+x)*4, u2=((y-2)*W+x)*4; if(isO(u)&&fill(u2)) add.push(i); }
    add.forEach(i=>{ d[i]=0x17; d[i+1]=0x0b; d[i+2]=0x1c; d[i+3]=255; }); g.putImageData(im,0,0); }

  /* ---------- esqueleto (tronco grosso, ombros largos, pernas curtas e fortes) ---------- */
  const SPINE=38, TH=19.5, SH=19, UA=15.4, FAF=15.6, FAB=13.6, VS=SPINE/37, US=1.3, HB=9, HS=1.16;
  const lp=(p,a,L)=>({x:p.x+Math.sin(rad(a))*L, y:p.y+Math.cos(rad(a))*L});
  function build(P,dy){
    const R=P.rot, hip={x:AX+P.hx, y:dy};
    const ra=rad(R), rc=Math.cos(ra), rs=Math.sin(ra);
    const HR=(lx,ly)=>({x:hip.x+lx*rc-ly*rs, y:hip.y+lx*rs+ly*rc});
    const hipF=HR(4,0), hipB=HR(-4,0);
    const kneeF=lp(hipF,P.lFh-R,TH), ankleF=lp(kneeF,P.lFk-R,SH), kneeB=lp(hipB,P.lBh-R,TH), ankleB=lp(kneeB,P.lBk-R,SH);
    const SS=[]; let x=hip.x, y=hip.y;
    for(let k=0;k<=SPINE;k++){ const t=k/SPINE, a=rad(R+P.lean+(P.hunch+HB)*Math.pow(t,1.4)); SS.push({x,y,a}); x+=Math.sin(a); y-=Math.cos(a); }
    const SP=(u,v)=>{ if(v>0){ const s=SS[0], a=s.a, px=s.x-Math.sin(a)*v, py=s.y+Math.cos(a)*v; return {x:px+Math.cos(a)*u, y:py+Math.sin(a)*u}; }
      const f=-v, k=Math.min(SPINE,Math.floor(f)), s=SS[k], r=f-k, a=s.a;
      const px=s.x+Math.sin(a)*r, py=s.y-Math.cos(a)*r; return {x:px+Math.cos(a)*u, y:py+Math.sin(a)*u}; };
    const T=(u,v)=>SP(u*US,v*VS);
    const top=SS[SPINE], neck=T(1.6,-36.4), sa=top.a;
    const shF=T(1.2,-31), shB=T(-7.6,-32.4);
    const elF=lp(shF,P.aFs-R,UA), wrF=lp(elF,P.aFe-R,FAF), elB=lp(shB,P.aBs-R,UA), wrB=lp(elB,P.aBe-R,FAB);
    const ha=sa+rad(P.head-HB*0.8), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:neck.x+(lx*hc-ly*hs)*HS, y:neck.y+(lx*hs+ly*hc)*HS});
    // facão: punho -> cabo -> lâmina
    const fa=Math.atan2(wrF.x-elF.x,wrF.y-elF.y)*180/PI, za=rad(fa+P.kz), zd={x:Math.sin(za),y:Math.cos(za)};
    const zh={x:wrF.x+(wrF.x-elF.x)/FAF*5.4, y:wrF.y+(wrF.y-elF.y)/FAF*5.4};
    const zg={x:zh.x+zd.x*5.6, y:zh.y+zd.y*5.6}, ztip={x:zg.x+zd.x*26, y:zg.y+zd.y*26};
    const toe=(a,f)=>{ const t=rad(f+R); return {x:a.x+(12*Math.cos(t)-5*Math.sin(t))*1.34, y:a.y+(12*Math.sin(t)+5*Math.cos(t))*1.34}; };
    const hull=[[ankleF,6],[ankleB,6],[toe(ankleF,P.fF),1.6],[toe(ankleB,P.fB),1.6],[kneeF,6],[kneeB,6],[hip,10],[T(0,-18),12],[T(-2,-30),12],[H(3,-11),11],[wrF,5],[wrB,5],[elF,5],[elB,5]];
    return {R,hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,SS,SP,T,sa,neck,shF,shB,elF,wrF,elB,wrB,ha,H,hull,ra,zh,zd,zg,ztip,toeF:toe(ankleF,P.fF)};
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
  const dot=(p,q,w,h)=>p.rect(q.x-w/2,q.y-h/2,w,h);
  // escamas: losangos pequenos com brilho
  function scales(p,M,list,big){ const s=big||1; list.forEach(([x,y],k)=>{ p.F(M.scale[k%3===0?0:1]); p.poly([[x,y-1.1*s],[x+1.2*s,y],[x,y+1.1*s],[x-1.2*s,y]]); p.F(M.scale[2]); p.rect(x-0.4*s,y+0.2*s,0.8*s,0.6*s); }); }

  /* ---------- peixe (tambaqui: corpo alto, cinza em cima e barriga escura; coordenadas locais, x = cabeça) ---------- */
  function drawFish(p,M,form,o){
    o=o||{}; const L=o.L||1;
    const body=[[-9,0],[-6,-4.6],[-1,-6.6],[4,-6.2],[8,-4],[10.4,-1],[10.6,1.4],[8.4,4],[4,5.8],[-1,6],[-6,4.2]].map(([x,y])=>[x*L,y*L]);
    // cauda e nadadeiras
    p.F(M.fish[2]); p.poly([[-8.4*L,0],[-13.6*L,-5.4*L],[-12.2*L,0],[-13.8*L,5.2*L]].map(q=>q));
    p.F(M.fish[3]); p.poly([[-10*L,-1*L],[-13.2*L,-4.6*L],[-12.2*L,0]]);
    p.F(M.fish[2]); p.poly([[-2*L,-6.2*L],[1*L,-9.4*L],[4.4*L,-6]]); p.poly([[-3*L,5.4*L],[-1*L,8.4*L],[1.6*L,5.6*L]]);
    p.F(M.fish[1]); p.poly(body);
    p.F(M.belly[1]); p.poly([[-7,2.4],[-2,3],[4,2.6],[8.6,3.4],[4,5.8],[-1,6],[-6,4.2]].map(([x,y])=>[x*L,y*L]));
    p.F(M.fish[0]); p.poly([[-4*L,-4*L],[2*L,-5.6*L],[6*L,-4*L],[1*L,-3.8*L]]);
    // escamas em fileiras
    p.F(M.fish[2]); for(let r=0;r<3;r++) for(let k=0;k<4;k++){ const x=(-5+k*3+(r%2)*1.5)*L, y=(-2.6+r*2.2)*L; p.rect(x,y,1.2*L,0.5*L); }
    // opérculo, olho e boca
    p.F(M.fish[3]); p.poly([[5*L,-4*L],[6.4*L,0],[5*L,3.6*L],[5.8*L,0]]);
    p.F(M.eye[1]); p.circle({x:7.6*L,y:-1.6*L},1.5*L); p.F(M.eye[3]); p.circle({x:7.8*L,y:-1.5*L},0.7*L); p.F(M.eye[0]); p.rect(7*L,-2.4*L,0.7*L,0.7*L);
    p.F(M.mouth[1]); p.poly([[9.6*L,0.4*L],[11*L,0.6*L],[10.2*L,1.8*L]]);
    if(form==='plenilunar'||o.teeth){ p.F(M.teeth[1]); for(let k=0;k<3;k++) p.poly([[(8.6+k*0.8)*L,0.6*L],[(9.2+k*0.8)*L,0.6*L],[(8.9+k*0.8)*L,1.8*L]]); }
    p.F(M.blood[1]); p.ell(6.4*L,2.6*L,1.2*L,0.8*L);
    if(form==='enluarado'){ p.F(M.glow[1]); p.rect(-3*L,-4.4*L,4*L,0.6*L); }
  }

  /* ---------- isopor nas costas (caixa com tampa azul, gelo e rabo de peixe pra fora) ---------- */
  function drawCooler(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    const box=W(sk,[[-25,-35],[-9.6,-35],[-9.2,-14],[-24.6,-13.4]]);
    p.F(M.foam[1]); p.poly(box);
    clip(c,box,()=>{
      p.F(M.foam[2]); p.poly(W(sk,[[-27,-36],[-21,-36],[-21.4,-12],[-27,-12]]));
      p.F(M.foam[3]); p.poly(W(sk,[[-27,-36],[-23.6,-36],[-23.8,-12],[-27,-12]]));
      p.F(M.foam[0]); p.poly(W(sk,[[-19,-33.6],[-11.4,-33.6],[-11.2,-31.8],[-19,-32]]));
      p.F(M.foam[2]); [[-18,-26],[-14,-21],[-20,-18]].forEach(([uu,vv])=>{ const q=Wp(sk,uu,vv); p.ell(q.x,q.y,1.4,0.9); }); // amassados
      p.F(M.tape[1]); p.poly(W(sk,[[-27,-24.6],[-8,-24.6],[-8,-22.6],[-27,-22.6]])); p.F(M.tape[0]); p.poly(W(sk,[[-18,-24.6],[-10,-24.6],[-10,-24],[-18,-24]]));
      p.F(M.blood[2]); p.poly(W(sk,[[-14,-14],[-12,-18],[-11,-14]])); p.F(M.water[1]); { const q=Wp(sk,-16,-15.6); p.ell(q.x,q.y,1.2,0.7); }
    });
    // tampa (abre pra trás no restock)
    const hg=Wp(sk,-25,-35), fr=Wp(sk,-9.4,-35), ang=Math.atan2(fr.y-hg.y,fr.x-hg.x)-rad(70)*P.lid, L=Math.hypot(fr.x-hg.x,fr.y-hg.y)+1.4;
    const dx=Math.cos(ang), dy=Math.sin(ang), nx=dy, ny=-dx, e={x:hg.x+dx*L,y:hg.y+dy*L};
    const lid=[[hg.x,hg.y],[e.x,e.y],[e.x+nx*4.6,e.y+ny*4.6],[hg.x+nx*4.6,hg.y+ny*4.6]];
    if(P.lid>0.2){ // gelo e peixes aparecendo na boca do isopor
      p.F(M.ice[1]); const a=Wp(sk,-23,-35.6), b=Wp(sk,-11,-35.6); p.poly([[a.x,a.y],[b.x,b.y],[b.x,b.y-2.4],[a.x,a.y-2.4]]);
      p.F(M.ice[0]); [0.2,0.5,0.8].forEach(t=>{ const q=lerp(a,b,t); p.rect(q.x-1,q.y-3,2,1.6); });
      p.F(M.fish[1]); { const q=lerp(a,b,0.35); p.poly([[q.x-2,q.y-1],[q.x+3,q.y-4],[q.x+5,q.y-1]]); }
      if(form!=='comum'){ p.F(M.glow[1]); const q=lerp(a,b,0.65); p.rect(q.x-1.4,q.y-3.4,2.8,1); }
    }
    p.F(M.tape[1]); p.poly(lid);
    p.F(M.tape[2]); p.poly([[hg.x,hg.y],[e.x,e.y],[e.x+nx*1.2,e.y+ny*1.2],[hg.x+nx*1.2,hg.y+ny*1.2]]);
    p.F(M.tape[0]); p.poly([[hg.x+nx*2.8+dx*4,hg.y+ny*2.8+dy*4],[e.x+nx*2.8-dx*2,e.y+ny*2.8-dy*2],[e.x+nx*3.4-dx*2,e.y+ny*3.4-dy*2],[hg.x+nx*3.4+dx*4,hg.y+ny*3.4+dy*4]]);
    if(P.lid<0.2){ // rabo de peixe saindo pela fresta e cubo de gelo
      const t=lerp(hg,e,0.62); p.F(M.fish[2]); p.poly([[t.x,t.y+nx*0],[t.x-3.4,t.y-6],[t.x-0.6,t.y-4.4],[t.x+1.8,t.y-7],[t.x+1.4,t.y]]);
      p.F(M.fish[1]); p.poly([[t.x-0.4,t.y],[t.x-2.4,t.y-4.8],[t.x-0.4,t.y-3.6],[t.x+1,t.y]]);
      p.F(M.ice[0]); const q=lerp(hg,e,0.3); p.rect(q.x-1,q.y-2.2,2.2,1.8); p.F(M.ice[2]); p.rect(q.x+0.2,q.y-1,1,0.8);
    }
  }

  /* ---------- braços: musculosos, regata, luva de borracha amarela; facão na mão da frente ---------- */
  function drawArm(c,u,M,sk,P,front,form){
    const p=mkPen(c,u), sh=front?sk.shF:sk.shB, el=front?sk.elF:sk.elB, wr=front?sk.wrF:sk.wrB; p._c=c; p.id();
    const g0=lerp(el,wr,0.36);
    // antebraço (pele até o punho da luva)
    const nF=limb(p,M.skin,el,g0,11.6,11,{hi:false});
    // luva até o meio do antebraço, com punho dobrado
    const nG=limb(p,M.glove,g0,wr,11,10,{hl:0.6});
    p.F(M.glove[2]); p.cap(off(g0,nG,-5.4),off(g0,nG,5.4),2.4,2.4); p.F(M.glove[0]); p.cap(off(lerp(g0,wr,0.04),nG,-5),off(lerp(g0,wr,0.04),nG,0),0.9,0.9);
    p.F(M.glove[0]); const gh=lerp(g0,wr,0.55); dot(p,off(gh,nG,-2.6),1.2,1.2); // brilho de borracha molhada
    p.F(M.glove[2]); const gf=lerp(g0,wr,0.7); p.cap(off(gf,nG,1),off(lerp(g0,wr,0.85),nG,3.4),0.7,0.6); // dobra
    if(!front){
      // barbatana podre saindo do antebraço (corrupção), raios e membrana
      const b0=lerp(el,wr,0.06), b1=lerp(el,wr,0.5); const k=-1, n=nF;
      const tipA={x:b0.x+n.nx*k*9+(wr.x-el.x)*-0.12,y:b0.y+n.ny*k*9+(wr.y-el.y)*-0.12}, tipB={x:lerp(b0,b1,0.6).x+n.nx*k*7,y:lerp(b0,b1,0.6).y+n.ny*k*7};
      p.F(M.fin[1]); p.poly([[b0.x,b0.y],[tipA.x,tipA.y],[tipB.x,tipB.y],[b1.x,b1.y]]);
      p.F(M.fin[2]); p.poly([[lerp(b0,b1,0.3).x,lerp(b0,b1,0.3).y],[lerp(tipA,tipB,0.5).x,lerp(tipA,tipB,0.5).y],[b1.x,b1.y]]);
      p.F(M.bone[1]); p.cap(b0,tipA,0.9,0.5); p.cap(lerp(b0,b1,0.5),tipB,0.8,0.4);
      if(form!=='comum'){ p.F(M.glow[1]); p.cap(lerp(b0,tipA,0.4),lerp(b0,tipA,0.8),0.5,0.4); }
    } else {
      p.F(M.vein[1]); p.cap(off(lerp(el,g0,0.15),nF,-1.4),off(lerp(el,g0,0.9),nF,-2),0.7,0.6);
    }
    // braço (bíceps grosso; deltoide largo)
    const nU=limb(p,M.skin,sh,el,14.4,12,{hl:0.6});
    p.F(M.skin[1]); p.circle(sh,7.6); p.F(M.skin[0]); p.circle(off(sh,nU,-2.6),2.4);
    p.F(M.skin[2]); const bc=lerp(sh,el,0.62); p.cap(off(bc,nU,1.4),off(lerp(sh,el,0.9),nU,3.4),1,0.8); // sulco do bíceps
    p.F(M.skin[1]); p.circle(el,5.6);
    if(front){ // escamas grudadas e cicatriz no braço da frente
      const q=lerp(sh,el,0.4); scales(p,M,[[q.x+nU.nx*2.6,q.y+nU.ny*2.6],[q.x+nU.nx*4.4+1,q.y+nU.ny*4.4+1.6],[q.x+nU.nx*1+1.6,q.y+nU.ny*1+2.4]]);
      p.F(M.flesh[2]); const s0=lerp(sh,el,0.72); p.cap(off(s0,nU,-3.4),off(s0,nU,-0.4),0.9,0.7);
      p.F(M.blood[1]); const bb=lerp(el,g0,0.5); p.ell(bb.x-nF.nx*2,bb.y-nF.ny*2,1.4,1.1);
    } else {
      p.F(M.rot[1]); const r=lerp(sh,el,0.5); p.ell(r.x-nU.nx*2,r.y-nU.ny*2,2.2,1.6); p.F(M.flesh[2]); p.ell(r.x-nU.nx*2,r.y-nU.ny*2+0.4,1,0.8);
      const q=lerp(sh,el,0.78); scales(p,M,[[q.x+nU.nx*2,q.y+nU.ny*2],[q.x+nU.nx*3.6+1.2,q.y+nU.ny*3.6]]);
    }
    if(front){ if(P.knife>=0.5) drawMachete(p,M,sk,P,form); drawFist(p,M,el,wr); }
    else { drawHandB(p,M,el,wr,P,form); }
  }
  function drawFist(p,M,el,wr){
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y); p._c.scale(1.36,1.36);
    p.F(M.glove[1]); p.poly([[-1,-3.8],[4.4,-4.2],[6.2,-1.2],[5.8,3.6],[-1,3.8]]);
    p.F(M.glove[2]); p.poly([[-1,1.4],[6,1.2],[5.8,3.6],[-1,3.8]]);
    p.F(M.glove[0]); p.rect(0.4,-3.6,3.6,0.9);
    for(let k=0;k<4;k++){ const y0=-3+k*2; p.F(M.glove[1]); p.ell(6.2,y0,1.8,1.1); p.F(M.glove[2]); p.rect(5.6,y0+0.5,1.6,0.5); }
    p.F(M.glove[1]); p.cap(P2(1.6,-3.4),P2(5.2,-4.8),2,1.5); p.F(M.glove[3]); p.rect(2,0.8,3,0.6);
    p.id();
  }
  function drawHandB(p,M,el,wr,P,form){
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x);
    if(P.fish>=0.5){ // peixe pendurado pela cauda (o corpo segue o antebraço + balanço)
      const fa=ang+rad(P.fsw||0); p.xf(fa,wr.x+Math.cos(ang)*5,wr.y+Math.sin(ang)*5); p._c.scale(1.2,1.2);
      p._c.translate(13,0); drawFish(p,M,form,{});
      p.id();
    }
    p.xf(ang,wr.x,wr.y); p._c.scale(1.32,1.32);
    p.F(M.glove[1]); p.poly([[-1,-3.4],[4.6,-3.6],[6,2.8],[-1,3.4]]);
    p.F(M.glove[2]); p.poly([[-1,1],[5.8,1],[6,2.8],[-1,3.4]]);
    if(P.fish>=0.5){ for(let k=0;k<4;k++){ const y0=-2.6+k*1.8; p.F(M.glove[1]); p.ell(6,y0,1.6,1); p.F(M.glove[2]); p.rect(5.4,y0+0.4,1.4,0.5); } }
    else { [[-2.4,9],[-0.8,9.8],[0.8,9.4],[2.4,8.2]].forEach(([y,L])=>{ p.F(M.glove[1]); p.cap(P2(4.4,y),P2(L,y+0.6),1.8,1.4); p.F(M.glove[2]); p.rect(L-1,y+0.2,1,0.7); }); }
    p.F(M.glove[1]); p.cap(P2(2,-3.2),P2(5.2,-5.6),1.9,1.4); p.F(M.glove[0]); p.rect(0.4,-3,3.4,0.8);
    p.id();
  }
  /* ---------- facão largo de ponta quadrada ---------- */
  function drawMachete(p,M,sk,P,form){
    const h=sk.zh, d=sk.zd, g=sk.zg, tip=sk.ztip;
    const b0={x:h.x-d.x*3.4,y:h.y-d.y*3.4};
    // cabo de madeira escura com rebites de latão
    p.F(M.handle[1]); p.cap(b0,g,3.4,3.2);
    const n=sideN(b0,g); p.F(M.handle[2]); p.cap(off(b0,n,0.8),off(g,n,0.8),1.4,1.2);
    p.F(M.handle[0]); p.cap(off(lerp(b0,g,0.2),n,-0.8),off(lerp(b0,g,0.7),n,-0.8),0.6,0.5);
    p.F(M.brass[1]); [0.15,0.8].forEach(t=>{ const q=lerp(b0,g,t); dot(p,q,1.1,1.1); }); p.F(M.brass[0]); { const q=lerp(b0,g,0.15); p.rect(q.x-0.5,q.y-0.5,0.5,0.5); }
    // lâmina: dorso reto, fio do lado (-dy,dx), alarga até a ponta quadrada
    const ex=-d.y, ey=d.x, w0=3.6, w1=7.8;
    const s0={x:g.x-ex*0.8,y:g.y-ey*0.8}, s1={x:tip.x-ex*0.8,y:tip.y-ey*0.8};
    const e0={x:g.x+ex*w0,y:g.y+ey*w0}, e1={x:tip.x+ex*w1-d.x*1.2,y:tip.y+ey*w1-d.y*1.2};
    const blade=[[s0.x,s0.y],[s1.x,s1.y],[e1.x,e1.y],[e0.x,e0.y]];
    p.F(M.steel[1]); p.poly(blade);
    const m0=lerp(s0,e0,0.55), m1=lerp(s1,e1,0.6);
    p.F(M.steel[2]); p.poly([[m0.x,m0.y],[m1.x,m1.y],[lerp(m1,e1,0.6).x,lerp(m1,e1,0.6).y],[lerp(m0,e0,0.6).x,lerp(m0,e0,0.6).y]]);
    p.F(M.steel[0]); p.cap(lerp(s0,s1,0.08),lerp(s0,s1,0.94),0.7,0.7); // dorso polido
    p.F(M.steel[0]); p.poly([[lerp(m0,e0,0.65).x,lerp(m0,e0,0.65).y],[lerp(m1,e1,0.65).x,lerp(m1,e1,0.65).y],[e1.x,e1.y],[e0.x,e0.y]]); // fio afiado
    p.F(M.steel[3]); p.cap(lerp(s1,e1,0.05),lerp(s1,e1,0.95),0.6,0.6); // ponta quadrada (quina)
    // guarda e manchas
    p.F(M.steel[2]); p.cap({x:g.x-ex*1.6,y:g.y-ey*1.6},{x:g.x+ex*(w0+0.8),y:g.y+ey*(w0+0.8)},1.4,1.4);
    p.F(M.blood[1]); const q1=lerp(lerp(s0,e0,0.5),lerp(s1,e1,0.5),0.62); p.ell(q1.x,q1.y,2,1.2); const q2=lerp(e0,e1,0.84); p.ell(q2.x,q2.y,1.4,1);
    p.F(M.blood[2]); const q3=lerp(lerp(s0,e0,0.6),lerp(s1,e1,0.6),0.3); p.rect(q3.x-0.6,q3.y-0.6,1.2,1.2);
    p.F(M.scale[0]); const q4=lerp(lerp(s0,e0,0.4),lerp(s1,e1,0.4),0.45); dot(p,q4,1,1); // escama grudada na lâmina
    if(form!=='comum'){ p.F(M.glow[1]); p.cap(lerp(e0,e1,0.2),lerp(e0,e1,0.55),0.6,0.6); }
  }
  function drawLooseMachete(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    const x=AX+P.kdx, y=GROUND-2, a=rad(P.kdr), d={x:Math.cos(a)*0.25+0.97*Math.sign(Math.cos(a)||1)*0, y:0};
    const dir={x:1,y:0}, s=Math.sin(a)*0.3;
    const zh={x:x-12,y:y-1+s}, zg={x:x-6,y:y-1}, tip={x:x+15,y:y-1-s};
    const sk2={zh,zd:dir,zg,ztip:tip}; drawMachete(p,M,sk2,P,form);
  }
  function drawSpill(c,u,M,sk,P,form){
    const p=mkPen(c,u); const k=Math.min(1,P.spill);
    [[-26,0,0.85,-0.3],[30,-1,0.75,0.4],[-6,1,0.7,3]].forEach(([dx,dy,L,r],i)=>{ if(k<(i+1)/3-0.01) return;
      p.xf(r,AX+dx*k,GROUND-3+dy); c.scale(1.1,1.1); drawFish(p,M,form,{L}); });
    p.id();
    p.F(M.water[1]); p.ell(AX,GROUND-1,34*k,2.6*k); p.F(M.water[0]); p.rect(AX-10*k,GROUND-2,6*k,0.8);
  }

  /* ---------- pernas: calça de moletom arregaçada, bota de borracha branca pesada ---------- */
  function drawLeg(c,u,M,sk,P,front){
    const p=mkPen(c,u), hip=front?sk.hipF:sk.hipB, knee=front?sk.kneeF:sk.kneeB, ank=front?sk.ankleF:sk.ankleB; p.id();
    const bt=lerp(knee,ank,0.34); // boca da bota
    // cano da bota
    const nB=limb(p,M.boot,bt,ank,13.4,12,{hl:0.6});
    p.F(M.boot[2]); p.cap(off(bt,nB,-6.6),off(bt,nB,6.6),2.4,2.4); p.F(M.boot[3]); p.cap(off(lerp(bt,ank,0.06),nB,-6),off(lerp(bt,ank,0.06),nB,6),0.8,0.8);
    p.F(M.boot[0]); p.cap(off(lerp(bt,ank,0.2),nB,-3.4),off(lerp(bt,ank,0.75),nB,-3.6),1,0.8); // brilho de borracha
    p.F(M.boot[2]); p.cap(off(lerp(bt,ank,0.6),nB,-1),off(lerp(bt,ank,0.72),nB,4),0.7,0.6); // vinco
    p.F(M.water[1]); dot(p,off(lerp(bt,ank,0.5),nB,2.4),1,1.6);
    // calça arregaçada (rolo grosso na canela)
    const nS=limb(p,M.pants,knee,lerp(knee,ank,0.3),13.6,13,{hl:0.5});
    const roll=lerp(knee,ank,0.3); p.F(M.pants[1]); p.cap(off(roll,nS,-7.4),off(roll,nS,7.4),3.6,3.6); p.F(M.pants[0]); p.cap(off(roll,nS,-6.6),off(roll,nS,2),1,1); p.F(M.pants[3]); p.cap(off(lerp(knee,ank,0.34),nS,-7),off(lerp(knee,ank,0.34),nS,7),0.8,0.8);
    // coxa
    const nT=limb(p,M.pants,hip,knee,15.4,13.6,{hl:0.55});
    p.F(M.pants[1]); p.circle(knee,6.8);
    p.F(M.pants[2]); p.cap(off(lerp(hip,knee,0.55),nT,1.6),off(lerp(hip,knee,0.75),nT,5),0.8,0.7); p.cap(off(knee,nS,-2),off(lerp(knee,ank,0.2),nS,3),0.7,0.6);
    p.F(M.pants[0]); p.cap(off(lerp(hip,knee,0.3),nT,-4.4),off(lerp(hip,knee,0.6),nT,-4),0.7,0.7);
    if(front){ p.F(M.blood[2]); const b=lerp(knee,ank,0.12); p.ell(b.x+nS.nx*2,b.y+nS.ny*2,1.4,1.1); p.F(M.dirt[1]); dot(p,off(lerp(hip,knee,0.8),nT,3),1.6,1.2); }
    // bota (pé grande, bico redondo, solado grosso)
    const fa=rad((front?P.fF:P.fB)+sk.R); p.xf(fa,ank.x,ank.y); c.scale(1.34,1.34);
    p.F(M.boot[1]); p.poly([[-4.6,-3.2],[3,-3.4],[7.4,-1],[11,0.6],[12.6,2.4],[12.4,3.8],[-4.8,3.8]]);
    p.F(M.boot[2]); p.poly([[-4.8,1.8],[12.4,2],[12.4,3.8],[-4.8,3.8]]);
    p.F(M.boot[0]); p.poly([[0.4,-2.8],[3,-3],[7,-0.8],[6.6,0],[2.6,-1.6],[0.4,-1.6]]); p.rect(9.6,0.6,1.6,0.6);
    p.F(M.boot[3]); p.rect(-4.6,-3.2,1,7);
    p.F(M.sole[1]); p.poly([[-5.2,3.6],[13,3.6],[12.8,5.4],[-5,5.4]]); p.F(M.sole[2]); p.rect(-5,4.6,18,0.8);
    p.F(M.sole[0]); [[-3,5.2],[1,5.2],[5,5.2],[9,5.2]].forEach(([x,y])=>p.rect(x,y,1.6,0.4)); // cravos do solado
    p.F(M.blood[1]); p.ell(6,1.2,1.4,0.8); p.F(M.scale[0]); p.rect(2,0.2,0.9,0.9); p.F(M.water[1]); p.rect(8,2.4,1.6,0.6);
    p.id();
  }

  /* ---------- tronco: regata branca, alça do isopor, avental de borracha (peitilho + saia até o joelho) ---------- */
  const TORSO=[[-11.4,8],[-11.8,0],[-12.4,-10],[-12.8,-20],[-12.6,-28],[-11,-33.6],[-7.4,-37.8],[-1.4,-39.6],[5,-39.4],[10,-36.4],[13.2,-30.4],[14.6,-22],[15.4,-14],[15.4,-6],[14.8,2],[13.4,8]];
  const TANK=[[-11.4,8],[-11.8,0],[-12.4,-10],[-12.8,-20],[-12.6,-28],[-11.2,-33],[-8.4,-35.2],[-6.4,-31],[-3,-28],[1.6,-27.6],[5,-31.6],[7,-35.6],[10,-35],[12.6,-29.6],[14.6,-22],[15.4,-14],[15.4,-6],[14.8,2],[13.4,8]];
  function drawTorso(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    const shape=W(sk,TORSO);
    p.F(M.skin[1]); p.poly(shape);
    clip(c,shape,()=>{
      p.F(M.skin[0]); p.poly(W(sk,[[2,-38],[8,-38],[11,-33],[6,-33]]));
      p.F(M.skin[2]); p.poly(W(sk,[[-14,-40],[-8,-40],[-9,-30],[-14,-30]]));
      p.F(M.vein[1]); p.poly(W(sk,[[3,-36],[6,-34],[5.6,-33.4],[2.8,-35.2]]));
      const tk=W(sk,TANK); p.F(M.tank[1]); p.poly(tk);
      clip(c,tk,()=>{
        p.F(M.tank[2]); p.poly(W(sk,[[-14,12],[-14,-40],[-7.6,-40],[-8.2,-28],[-7.6,-14],[-6,-2],[-4,10]]));
        p.F(M.tank[3]); p.poly(W(sk,[[-14,12],[-14,-40],[-10.6,-40],[-11,-26],[-10.4,-10],[-9.6,12]]));
        p.F(M.tank[0]); p.poly(W(sk,[[-4,-27],[1,-27],[0,-20],[-4,-18]]));
        p.F(M.tank[2]); [[[-6,-20],[-1,-22],[-0.6,-21.2],[-5.6,-19.2]],[[-7,-10],[-2,-12],[-1.6,-11.2],[-6.6,-9.2]],[[-5,-2],[0,-4],[0.4,-3.2],[-4.6,-1.4]]].forEach(f=>p.poly(W(sk,f)));
        // manchas de sangue de peixe e escamas na regata
        p.F(M.blood[2]); [[-4,-14,2.4,1.6],[-8,-6,1.6,2.2],[-2,-25,1.2,0.9]].forEach(([uu,vv,a,b])=>{ const q=Wp(sk,uu,vv); p.ell(q.x,q.y,a,b); });
        p.F(M.dirt[1]); { const q=Wp(sk,-6,-30); p.ell(q.x,q.y,1.8,1.2); }
        scales(p,M,[[Wp(sk,-2,-17).x,Wp(sk,-2,-17).y],[Wp(sk,-6,-24).x,Wp(sk,-6,-24).y],[Wp(sk,-9,-13).x,Wp(sk,-9,-13).y]],0.8);
        // rasgo do lado com costela (corrupção)
        p.F(M.tank[3]); p.poly(W(sk,[[-11.6,-24],[-7.6,-25],[-6.4,-19.6],[-8.4,-16],[-11.4,-17]]));
        p.F(M.flesh[2]); p.poly(W(sk,[[-11,-23.4],[-8,-24.2],[-7,-19.8],[-8.6,-16.8],[-10.8,-17.6]]));
        p.F(form==='plenilunar'?M.bone[0]:M.bone[1]); [-22,-19.6].forEach(v=>p.poly(W(sk,[[-10.8,v],[-7.4,v-0.6],[-7.4,v+0.4],[-10.8,v+1]])));
        if(form!=='comum'){ p.F(M.glow[1]); p.poly(W(sk,[[-8,-16.6],[-5.6,-12],[-6.2,-11.6],[-8.6,-16]])); }
      });
      // guelras no pescoço/peito (corrupção): 3 fendas
      [0,1,2].forEach(k=>{ const a=Wp(sk,1.4+k*1.8,-36.6+k*0.4), b=Wp(sk,2.6+k*1.8,-33.4+k*0.4); p.F(M.flesh[2]); p.cap(a,b,1.1,0.9); p.F(M.flesh[1]); p.cap(a,lerp(a,b,0.5),0.5,0.4); });
    });
    // alça do isopor atravessando o peito (some debaixo do peitilho)
    p.F(M.strap[1]); p.poly(W(sk,[[-8,-36.6],[-5,-37.6],[5,-24],[2.4,-22.6]]));
    p.F(M.strap[2]); p.poly(W(sk,[[-8,-36.6],[-7,-37],[3.4,-23.2],[2.4,-22.6]])); p.F(M.strap[0]); p.poly(W(sk,[[-5.6,-37.4],[-5,-37.6],[1,-29.6],[0.4,-29.4]]));
    p.F(M.brass[1]); { const q=Wp(sk,-1.6,-31.6); dot(p,q,2,1.6); } p.F(M.brass[0]); { const q=Wp(sk,-2,-32); p.rect(q.x-0.4,q.y-0.4,0.8,0.6); }
  }
  // avental: peitilho + saia (cobre a frente da coxa até o joelho); amarração e cinto com balança de gancho
  function drawApron(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    // cinto de trás (amarração do avental) e balança de gancho pendurada
    p.F(M.strap[1]); p.poly(W(sk,[[-12.6,-4.6],[2,-4.6],[2,-2.4],[-12.6,-2.4]])); p.F(M.strap[2]); p.poly(W(sk,[[-12.6,-3],[2,-3],[2,-2.4],[-12.6,-2.4]]));
    { const k=Wp(sk,-13.2,-3.6); p.F(M.strap[1]); p.circle(k,1.8); p.cap(k,{x:k.x-2.4,y:k.y+6},1.6,1.2); p.cap(k,{x:k.x-0.6,y:k.y+7.4},1.4,1); p.F(M.strap[0]); p.rect(k.x-0.8,k.y-1.2,1.2,0.8); }
    // gelo-fantasma azul no cinto
    { const q=Wp(sk,-9.4,-1.6); p.F(M.ice[2]); p.poly([[q.x-2.6,q.y-1.4],[q.x+1.4,q.y-2.6],[q.x+2.6,q.y+1.6],[q.x-1.6,q.y+2.6]]); p.F(M.ice[1]); p.poly([[q.x-1.8,q.y-1],[q.x+1,q.y-1.8],[q.x+1.6,q.y+0.8],[q.x-1,q.y+1.4]]); p.F(M.ice[0]); p.rect(q.x-1,q.y-1,1,0.8);
      if(form!=='comum'){ p.F(M.glow[0]); p.rect(q.x-0.4,q.y-0.4,1,1); } }
    // balança de gancho (mostrador redondo) no quadril de trás
    { const sw=P.hx*0.6+P.lean*0.05, h0=Wp(sk,-4.6,-2.4), h1={x:h0.x-sw*0.6,y:h0.y+4.6}, cc={x:h1.x-sw*0.4,y:h1.y+4.2};
      p.F(M.steel[2]); p.cap(h0,h1,0.9,0.9); p.F(M.steel[1]); p.circle(cc,4); p.F(M.steel[3]); p.circle({x:cc.x+0.6,y:cc.y+0.6},3.2);
      p.F(M.foam[0]); p.circle(cc,2.8); p.F(M.blood[1]); p.cap(cc,{x:cc.x+1.8,y:cc.y-1.2},0.6,0.4); p.F(M.steel[3]); dot(p,cc,0.8,0.8);
      p.F(M.foam[2]); [[0,-2.2],[2.2,0],[0,2.2],[-2.2,0]].forEach(([dx,dy])=>p.rect(cc.x+dx-0.3,cc.y+dy-0.3,0.6,0.6));
      p.F(M.steel[0]); p.rect(cc.x-3,cc.y-2.6,1.2,1); p.F(M.steel[2]); p.cap({x:cc.x,y:cc.y+4},{x:cc.x+1.6,y:cc.y+6.6},0.9,0.9); p.cap({x:cc.x+1.6,y:cc.y+6.6},{x:cc.x+0.2,y:cc.y+7.8},0.9,0.8); }
    // saia do avental: do quadril até o joelho, acompanha as coxas
    const a0=sk.SS[0].a, fw={x:Math.cos(a0),y:Math.sin(a0)}, dn={x:-Math.sin(a0),y:Math.cos(a0)};
    const kfw=q=>(q.x-sk.hip.x)*fw.x+(q.y-sk.hip.y)*fw.y;
    const shift=Math.max(-4,Math.min(9,(kfw(sk.kneeF)+kfw(sk.kneeB))*0.5*0.8)), L=23;
    const Bc={x:sk.hip.x+dn.x*L+fw.x*shift, y:sk.hip.y+dn.y*L+fw.y*shift};
    const bF={x:Bc.x+fw.x*18,y:Bc.y+fw.y*18}, bB={x:Bc.x-fw.x*3,y:Bc.y-fw.y*3};
    const tF=Wp(sk,15.8,-2), tB=Wp(sk,-0.6,-2), mF=Wp(sk,16.4,6);
    const sway=Math.sin(P.hx*0.8+P.lean*0.06)*0.8;
    const skirt=[[tB.x,tB.y],[tF.x,tF.y],[mF.x,mF.y],[bF.x+dn.x*0.6,bF.y+dn.y*0.6],[lerp(bF,bB,0.33).x,lerp(bF,bB,0.33).y+1+sway],[lerp(bF,bB,0.66).x,lerp(bF,bB,0.66).y-0.4],[bB.x,bB.y+0.8]];
    p.F(M.apron[1]); p.poly(skirt);
    clip(c,skirt,()=>{
      const Lp=(t,s)=>{ const top=lerp(tB,tF,s), bot=lerp(bB,bF,s); return lerp(top,bot,t); };
      // volume: sombra atrás, luz na frente da coxa, borracha molhada
      p.F(M.apron[2]); p.poly([[tB.x-4,tB.y],[lerp(tB,tF,0.22).x,lerp(tB,tF,0.22).y],[lerp(bB,bF,0.18).x,lerp(bB,bF,0.18).y+2],[bB.x-4,bB.y+3]]);
      p.F(M.apron[3]); p.poly([[tB.x-4,tB.y],[lerp(tB,tF,0.08).x,lerp(tB,tF,0.08).y],[lerp(bB,bF,0.05).x,lerp(bB,bF,0.05).y+2],[bB.x-4,bB.y+3]]);
      p.F(M.apron[0]); { const a=Lp(0.12,0.62), b=Lp(0.72,0.7), d=Lp(0.7,0.78), e=Lp(0.1,0.7); p.poly([[a.x,a.y],[b.x,b.y],[d.x,d.y],[e.x,e.y]]); }
      // pregas verticais (borracha dobra em canos)
      p.F(M.apron[2]); [0.36,0.55,0.84].forEach(s=>{ const a=Lp(0.2,s), b=Lp(1.02,s+0.04); p.cap(a,b,0.8,1.3); });
      p.F(M.apron[0]); [0.4,0.88].forEach(s=>{ const a=Lp(0.35,s+0.02), b=Lp(0.9,s+0.05); p.cap(a,b,0.5,0.6); });
      // brilhos de água
      p.F(M.water[0]); [[0.3,0.74],[0.52,0.66],[0.62,0.9]].forEach(([t,s])=>{ const q=Lp(t,s); p.rect(q.x-0.5,q.y-0.8,1,1.6); });
      // sangue escorrido e escamas
      p.F(M.blood[1]); { const q=Lp(0.08,0.7); p.poly([[q.x-2,q.y],[q.x+3,q.y],[q.x+2,q.y+9],[q.x+0.6,q.y+12],[q.x-0.4,q.y+6]]); }
      p.F(M.blood[2]); { const q=Lp(0.45,0.3); p.ell(q.x,q.y,1.8,2.6); }
      { const q1=Lp(0.55,0.5), q2=Lp(0.3,0.9), q3=Lp(0.8,0.4); scales(p,M,[[q1.x,q1.y],[q2.x,q2.y],[q3.x,q3.y]]); }
      // barra grossa
      p.F(M.apron[2]); p.poly([[bB.x-4,bB.y-1.4],[bF.x+4,bF.y-1.4],[bF.x+4,bF.y+4],[bB.x-4,bB.y+4]].map(([x,y])=>[x,y]));
      p.F(M.apron[3]); p.poly([[bB.x-4,bB.y+0.4],[bF.x+4,bF.y+0.4],[bF.x+4,bF.y+4],[bB.x-4,bB.y+4]]);
      if(form==='plenilunar'){ p.F(M.blood[1]); const q=Lp(0.3,0.5); p.poly([[q.x-4,q.y-2],[q.x+5,q.y-3],[q.x+4,q.y+8],[q.x-3,q.y+6]]); }
    });
    // boca de peixe mordendo a barra (corrupção): lábio, dentinhos e olho leitoso
    { const q=lerp(bB,bF,0.62); p.F(M.fish[2]); p.ell(q.x,q.y+1.6,3.6,2.6); p.F(M.fish[1]); p.ell(q.x-0.6,q.y+1,3,1.8);
      p.F(M.mouth[2]); p.ell(q.x+1.4,q.y+2.2,1.6,1); p.F(M.teeth[1]); p.rect(q.x+0.4,q.y+1.4,0.6,0.8); p.rect(q.x+1.6,q.y+1.4,0.6,0.8);
      p.F(M.eye[1]); dot(p,{x:q.x-1.6,y:q.y+0.4},1.2,1.2); }
    // peitilho (frente do peito) e alça do pescoço
    const bib=W(sk,[[3,-29.6],[11.8,-30.4],[14,-24],[15,-15],[15.4,-6],[15.8,-1],[-0.6,-1],[-0.4,-8],[0.8,-16],[1.8,-24]]);
    p.F(M.apron[2]); p.cap(Wp(sk,3.2,-29),Wp(sk,0.4,-38.4),2.4,2); p.F(M.apron[3]); p.cap(Wp(sk,2.4,-30),Wp(sk,0,-36),0.8,0.8);
    p.F(M.apron[1]); p.poly(bib);
    clip(c,bib,()=>{
      p.F(M.apron[2]); p.poly(W(sk,[[-2,-32],[3.6,-32],[2.6,-20],[1.6,-8],[1.6,1],[-2,1]]));
      p.F(M.apron[3]); p.poly(W(sk,[[-2,-32],[1.6,-32],[0.6,-20],[0.4,1],[-2,1]]));
      p.F(M.apron[0]); p.poly(W(sk,[[7,-29],[11.4,-29.6],[13,-24],[13.6,-17],[10.6,-17],[9,-24]]));
      p.F(M.water[0]); [[12.4,-26],[12.8,-21],[10,-22]].forEach(([uu,vv])=>{ const q=Wp(sk,uu,vv); p.rect(q.x-0.5,q.y-0.8,1,1.4); });
      p.F(M.apron[2]); p.poly(W(sk,[[5,-12],[13,-13],[13.2,-11.8],[5.2,-10.8]])); // dobra da barriga
      p.F(M.apron[2]); p.poly(W(sk,[[4,-4.8],[15,-5.4],[15,-3.8],[4,-3.4]]));
      p.F(M.blood[1]); [[8,-20,2.4,1.6],[12,-8,1.6,2.4],[6,-26,1.2,1]].forEach(([uu,vv,a,b])=>{ const q=Wp(sk,uu,vv); p.ell(q.x,q.y,a,b); });
      p.F(M.blood[2]); p.poly(W(sk,[[11.4,-9],[12.6,-9],[12.4,-1],[11.8,-1.6]]));
      scales(p,M,[[Wp(sk,6,-16).x,Wp(sk,6,-16).y],[Wp(sk,10.4,-14.6).x,Wp(sk,10.4,-14.6).y],[Wp(sk,13,-27).x,Wp(sk,13,-27).y]]);
      if(form==='plenilunar'){ p.F(M.blood[1]); p.poly(W(sk,[[6,-18],[14,-20],[15,-6],[9,-4],[7,-10]])); }
      if(form==='enluarado'){ p.F(M.glow[1]); p.poly(W(sk,[[4,-22],[6,-23],[6.4,-22.4],[4.4,-21.4]])); }
    });
    // borda dobrada do peitilho
    p.F(M.apron[0]); p.poly(W(sk,[[3,-29.6],[11.8,-30.4],[11.8,-29.4],[3.2,-28.8]]));
  }

  /* ---------- cabeça: boné de aba curva, olho de peixe leitoso, barba rala, escamas no rosto ---------- */
  function drawCap(c,p,M,form,P){
    // copa
    const crown=[[-8.6,-13.4],[-9.4,-17.6],[-7.4,-21.6],[-2,-24.2],[4.4,-24],[8.8,-21.6],[11,-17.8],[11.2,-15.2],[2,-14.8],[-4,-14.4]];
    p.F(M.cap[1]); p.poly(crown);
    clip(c,crown,()=>{
      p.F(M.cap[2]); p.poly([[-11,-12],[-4,-12],[-3,-25],[-11,-25]]);
      p.F(M.cap[3]); p.poly([[-11,-12],[-7.4,-12],[-6.6,-25],[-11,-25]]);
      p.F(M.cap[0]); p.poly([[2,-23.4],[6.4,-23],[9.6,-19.6],[5.6,-20.6]]);
      p.F(M.cap[2]); p.poly([[1.4,-24.4],[2.2,-24.4],[3.8,-15],[3,-15]]); // costura central
      p.F(M.cap[2]); p.poly([[-5,-23],[-4.2,-23.4],[-6,-14.6],[-6.8,-14.6]]);
      p.F(M.foam[1]); p.poly([[-6,-17],[4,-17.6],[8,-16.4],[0,-16]]); // mancha de sal/suor
      p.F(M.cap[3]); p.ell(-2.6,-20.6,0.9,0.7); // ilhós
      p.F(M.dirt[1]); p.ell(7,-18.6,1.6,1);
    });
    p.F(M.cap[2]); p.ell(1.6,-24.2,1.6,0.8); // botão
    p.F(M.hair[1]); p.poly([[-9.6,-14.6],[-8.6,-17],[-7.4,-14]]); // regulador de trás aberto
    // aba curva
    const brim=[[7.6,-16.8],[14,-17.2],[18.4,-15.6],[19.2,-13.6],[16,-13.2],[11,-13.6],[7.4,-14.4]];
    p.F(M.cap[1]); p.poly(brim);
    p.F(M.cap[3]); p.poly([[7.4,-14.6],[11,-13.8],[16,-13.4],[19.2,-13.6],[19,-12.8],[15.6,-12.4],[10.6,-12.8],[7.4,-13.6]]);
    p.F(M.cap[0]); p.poly([[10,-16.8],[15,-16.8],[17.6,-15.6],[14,-15.8]]);
    p.F(M.cap[2]); p.poly([[8,-15.6],[18.4,-15],[18.6,-14.4],[8,-15]]); // pesponto
    scales(p,M,[[13.4,-15.2]],0.8);
    if(form==='plenilunar'){ p.F(M.blood[1]); p.poly([[4,-22],[7,-22],[6.4,-17],[5,-15.6]]); }
    if(form==='enluarado'){ p.F(M.glow[1]); p.rect(-4,-22.6,3,0.6); }
  }
  function drawHead(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.xf(sk.ha,sk.neck.x,sk.neck.y); c.scale(HS,HS);
    // pescoço grosso com guelras
    p.F(M.skin[1]); p.poly([[-5.4,4.6],[6,4.6],[6.6,-4.6],[-4.6,-6.6]]);
    p.F(M.skin[2]); p.poly([[-5.4,4.6],[-1,4.6],[-1.6,-6],[-4.6,-6.6]]);
    [0,1,2].forEach(k=>{ p.F(M.flesh[2]); p.poly([[0.6+k*1.8,-3.8],[1.6+k*1.8,-4],[2.4+k*1.8,1.8],[1.4+k*1.8,2]]); p.F(M.flesh[1]); p.rect(1.2+k*1.8,-2.6,0.6,2.4); });
    // crânio largo, maxilar quadrado
    p.F(M.skin[1]); p.ell(2.4,-12.4,9.8,9.6);
    p.poly([[-4.4,-6],[11.6,-7.6],[13,-4.4],[6,-2.4],[-2.6,-2.8]]);
    p.F(M.skin[2]); p.poly([[-7.6,-15],[-5.4,-6],[0,-2.6],[6,-2.6],[2,-5],[-2,-9],[-3,-14],[-5.6,-18]]);
    p.F(M.skin[3]); p.poly([[-7.6,-14],[-6.8,-9],[-4.8,-5.2],[-5.4,-11]]);
    p.F(M.skin[0]); p.poly([[5,-8.2],[10,-8.8],[9.2,-7.4],[5.4,-7.2]]);
    // orelha
    p.F(M.skin[1]); p.ell(-3,-11,2.4,3.2); p.F(M.skin[3]); p.ell(-2.8,-10.8,1.1,1.9); p.F(M.flesh[2]); p.rect(-4,-8.6,1.1,1.2);
    // cabelo raspado na nuca e costeleta
    p.F(M.hair[1]); p.poly([[-8.4,-14.4],[-7.6,-16],[-2,-16.4],[-2.6,-14],[-5,-10.4],[-8,-9]]);
    p.F(M.hair[2]); p.rect(-1.4,-14.6,1.6,4.6);
    // testa pesada, olho de peixe leitoso (redondo, sem pupila)
    p.F(M.skin[2]); p.poly([[4.4,-13.4],[12.4,-13.8],[12.6,-12.4],[4.6,-12]]);
    p.F(M.skin[3]); p.ell(8.6,-10,3.2,2.8);
    p.F(M.eye[1]); p.ell(8.8,-9.8,2.6,2.3); p.F(M.eye[2]); p.ell(9.2,-9.4,1.6,1.3); p.F(M.eye[1]); p.ell(9.4,-9.6,0.9,0.8);
    p.F(M.eye[0]); p.rect(7.6,-11,1,0.8);
    p.F(M.skin[3]); p.ell(12.8,-10,1,1.4); p.F(M.eye[1]); p.rect(12.4,-10.4,0.9,1);
    // nariz largo, amassado
    p.F(M.skin[1]); p.poly([[11.4,-10.6],[14.8,-7],[14.2,-5.4],[11.6,-5.8]]);
    p.F(M.skin[3]); p.rect(12.8,-6,1.6,0.9); p.F(M.skin[0]); p.rect(12,-9.4,0.8,1.6);
    // escamas grudadas na bochecha
    scales(p,M,[[4.6,-7.4],[6.4,-6],[3.6,-5.2],[5.8,-8.6]],0.85);
    // barba rala (pontilhado) e boca de cima
    p.F(M.hair[2]); [[4,-3.6],[6,-4],[8,-3.4],[10,-4],[2.6,-5],[11.6,-3.6]].forEach(([x,y])=>p.rect(x,y,0.7,0.7));
    p.F(M.mouth[1]); p.poly([[5.4,-4.8],[13.6,-5],[13.4,-2.4],[5.4,-2.2]]);
    p.F(M.teeth[1]); [[7,-5,1.2,1.6],[8.6,-5,1.2,1.4],[10.2,-5,1.2,1.8],[11.8,-5,1,1.3]].forEach(([x,y,w,h])=>p.rect(x,y,w,h));
    p.F(M.rot[1]); p.ell(0.6,-8,1.6,1.2); p.F(M.rot[2]); p.rect(0,-8.4,1,0.9);
    if(form!=='comum'){ p.F(M.glow[0]); p.ell(8.8,-9.8,1.6,1.4); p.F(M.glow[1]); p.rect(12.4,-10.4,0.9,1); }
    // boné (com inclinação ct)
    p.xf(sk.ha+rad(P.ct||0),sk.neck.x,sk.neck.y); c.scale(HS,HS); drawCap(c,p,M,form,P);
    p.id();
  }
  function drawJaw(c,u,M,sk,P){
    const p=mkPen(c,u); const h=sk.H(2.6,-3.6); p.xf(sk.ha+rad(P.jaw),h.x,h.y); c.scale(HS,HS);
    p.F(M.skin[1]); p.poly([[-2.4,-1.4],[11,-0.8],[12,1.8],[11,5.4],[6.4,7],[0,6.4],[-2.8,3]]);
    p.F(M.skin[2]); p.poly([[-2.8,3],[0,6.4],[6.4,7],[11,5.4],[9.4,4.6],[4,5.2],[0,3.6]]);
    p.F(M.skin[3]); p.poly([[0.6,6.4],[6.4,7],[9.6,6.2],[4,6.2]]);
    p.F(M.mouth[1]); p.poly([[2.6,-0.8],[10.4,-0.4],[10.4,1.4],[3,1.2]]);
    p.F(M.teeth[1]); [[4.2,-1,1.2,1.5],[5.8,-1,1.2,1.9],[7.4,-1,1.2,1.5],[9,-1,1,1.8]].forEach(([x,y,w,h])=>p.rect(x,y,w,h));
    p.F(M.hair[2]); [[2,4.6],[4,5.4],[6,5.8],[8,5.4],[10,4.6],[3,3],[7,4]].forEach(([x,y])=>p.rect(x,y,0.7,0.7)); // barba rala
    p.F(M.skin[0]); p.rect(5.6,2,3.4,0.8);
    const L=2+(P.drool%4)*1.2+(P.jaw>30?2:0);
    p.F(M.blood[1]); p.poly([[9.6,4.6],[11,4],[10.8,4+L],[10.2,5+L]]); p.ell(10.5,5+L,1,1);
    p.id();
  }
  function drawMouthIn(c,u,M,sk,P){
    if(P.jaw<16) return; const p=mkPen(c,u); p.id();
    const a=sk.H(5.4,-2.4), b=sk.H(13.4,-2.6), h=sk.H(2.6,-3.6), ja=sk.ha+rad(P.jaw), jc=Math.cos(ja), js=Math.sin(ja);
    const J=(x,y)=>({x:h.x+(x*jc-y*js)*HS,y:h.y+(x*js+y*jc)*HS}), d=J(10.4,0.6), e=J(3,0.6);
    p.F(M.mouth[2]); p.poly([[a.x,a.y],[b.x,b.y],[d.x,d.y],[e.x,e.y]]);
    p.F(M.mouth[3]); const m=lerp(lerp(a,b,0.3),lerp(e,d,0.3),0.5); p.circle(m,1.6);
  }
  function drawSmear(c,u,M,sk,P){
    const p=mkPen(c,u); p.id();
    // smear 1 = facão (ombro da frente → ponta); 2 = arremesso (mão de trás)
    const sh=P.smear>=1.5?sk.shB:sk.shF, w=P.smear>=1.5?sk.wrB:sk.ztip, r=Math.hypot(w.x-sh.x,w.y-sh.y)+2, a1=Math.atan2(w.y-sh.y,w.x-sh.x);
    const n=10, pts=[]; for(let i=0;i<=n;i++){ const a=a1-1.5+1.55*i/n; pts.push([sh.x+Math.cos(a)*r,sh.y+Math.sin(a)*r]); }
    for(let i=n;i>=0;i--){ const a=a1-1.5+1.55*i/n, rr=r-2-8*(i/n); pts.push([sh.x+Math.cos(a)*rr,sh.y+Math.sin(a)*rr]); }
    p.F(P.smear>=1.5?M.water[1]:M.swish[0]); p.poly(pts.map(([x,y])=>[Math.max(1,Math.min(FW-2,x)),Math.max(1,Math.min(GROUND,y))]));
    p.F(P.smear>=1.5?M.water[0]:M.swish[2]); const q=pts.slice(n-3,n+1); for(let k=0;k<q.length-1;k++) p.cap({x:q[k][0],y:q[k][1]},{x:q[k+1][0],y:q[k+1][1]},0.9,0.9);
    if(P.smear>=1.5){ p.F(M.water[0]); [[0.3,-3],[0.55,4],[0.8,-2]].forEach(([t,dd])=>{ const a=a1-1.5+1.55*t; p.rect(sh.x+Math.cos(a)*(r+dd)-0.8,sh.y+Math.sin(a)*(r+dd)-0.8,1.6,1.6); }); }
  }
  function drawScalesFall(c,u,M,sk,P){
    const p=mkPen(c,u); p.id(); const k=(P.sc|0)%8, h=lerp(sk.wrF,sk.wrB,0.5);
    [[0,0],[3,2.6],[-2,5]].forEach(([dx,dy],j)=>{ const t=((k+j*3)%8)/8; const y=h.y+6+t*(GROUND-h.y-8)+dy; if(y>GROUND-2) return; p.F(M.scale[j%2?0:1]); p.rect(h.x+dx+Math.sin(t*6+j)*2-0.6,y,1.2,1.2); });
  }

  /* ---------- adereços: peixe voando, poça ---------- */
  const PW=40, PH=30, PG=18, PAX=20;
  function frameFish(form,st,K){
    const M=mats(form), a=[-0.5,0.3,1.1,1.9][((st|0)%4+4)%4];
    const parts=[
      {noShade:true, noRim:true, smear:true, draw:(c,u)=>{ const p=mkPen(c,u); p.id(); p.F(M.water[1]); p.poly([[1,PG-1],[8,PG-3],[8,PG+2],[2,PG+1]]); p.F(M.water[0]); p.rect(3,PG-5,2,1.2); p.rect(5,PG+3,1.6,1.2); }},
      {draw:(c,u)=>{ const p=mkPen(c,u); p.xf(a,PAX+2,PG); c.scale(1.2,1.2); drawFish(p,M,form,{teeth:form==='plenilunar'}); p.id(); }},
    ];
    const cv=compose({FW:Math.round(PW*K),FH:Math.round(PH*K),GROUND:PH*K,parts,M,step:5,flash:0,rim:RIM[form]});
    cv._ax=PAX*K; cv._gy=PG*K; return cv;
  }
  const QW=96, QH=24, QG=12, QAX=48;
  function framePool(form,st,K){
    const M=mats(form), s=((st|0)%3+3)%3;
    const parts=[{noRim:true, draw:(c,u)=>{ const p=mkPen(c,u); p.id();
      p.F(M.water[2]); p.ell(QAX,QG,44,8.6); p.F(M.water[1]); p.ell(QAX-1,QG-0.6,40,7);
      p.F(M.water[2]); p.ell(QAX+10,QG+1.4,12,2.2); p.ell(QAX-20,QG,9,1.8);
      p.F(M.water[0]); [[-22,-3],[6,-4],[24,-1],[-6,2]].forEach(([dx,dy],k)=>{ const w=(k+s)%3===0?7:4; p.rect(QAX+dx-w/2,QG+dy,w,0.8); });
      p.F(M.blood[2]); p.ell(QAX+18,QG+2,5,1.4); p.ell(QAX-30,QG+1.6,3,0.9);
      scales(p,M,[[QAX-12,QG-2],[QAX+4,QG+3],[QAX+28,QG-2.4],[QAX-26,QG+3],[QAX+14,QG-4]].map(([x,y],k)=>[x+((k+s)%2),y]),1.1);
      p.F(M.glow[0]); if(form!=='comum'){ p.rect(QAX-4+s*4,QG-1,2,1); p.rect(QAX+20-s*3,QG+1,2,1); }
    }}];
    const cv=compose({FW:Math.round(QW*K),FH:Math.round(QH*K),GROUND:QH*K,parts,M,step:4,flash:0,rim:null});
    cv._ax=QAX*K; cv._gy=QG*K; return cv;
  }

  /* ---------- montagem ---------- */
  const cache=PIX.cache();
  function frame(form,anim,fi,step=5,Pov,pk){
    const K=PIX.getK(), key=(pk!=null?'#'+pk+'|'+form:form+'|'+anim+'|'+fi+'|'+step)+'@'+K;
    const hit=cache.get(key); if(hit){ cache.delete(key); cache.set(key,hit); return hit; }
    if(ANIMS[anim]&&ANIMS[anim].prop){ const st=Pov&&Pov.st!=null?Math.round(Pov.st):fi; const cv=anim==='xPool'?framePool(form,st,K):frameFish(form,st,K); cache.set(key,cv); return cv; }
    const P=Pov?Object.assign({},REST,Pov):poseOf(anim,fi), M=mats(form), sk=skeleton(P);
    const parts=[];
    if(P.spill>0) parts.push({draw:(c,u)=>drawSpill(c,u,M,sk,P,form)});
    if(P.knife<0.5) parts.push({draw:(c,u)=>drawLooseMachete(c,u,M,sk,P,form)});
    parts.push(
      {draw:(c,u)=>drawCooler(c,u,M,sk,P,form)},
      {back:true, draw:(c,u)=>drawArm(c,u,M,sk,P,false,form)},
      {back:true, draw:(c,u)=>drawLeg(c,u,M,sk,P,false)},
      {draw:(c,u)=>drawLeg(c,u,M,sk,P,true)},
      {draw:(c,u)=>drawTorso(c,u,M,sk,P,form)},
      {draw:(c,u)=>drawApron(c,u,M,sk,P,form)},
      {draw:(c,u)=>{ drawHead(c,u,M,sk,P,form); drawMouthIn(c,u,M,sk,P); }},
      {draw:(c,u)=>drawJaw(c,u,M,sk,P)});
    if(P.smear>=0.5) parts.push({noShade:true, smear:true, noRim:true, draw:(c,u)=>drawSmear(c,u,M,sk,P)});
    parts.push({draw:(c,u)=>drawArm(c,u,M,sk,P,true,form)});
    if(P.sc>0 && anim==='idle') parts.push({noShade:true, noRim:true, draw:(c,u)=>drawScalesFall(c,u,M,sk,P)});
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM[form]}); if(step>=4) heavyOutline(cv);
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._eye=sc(sk.H(8.8,-9.8)); cv._mouth=sc(sk.H(10,-2)); cv._hand=sc(sk.wrF); cv._head=sc(sk.H(3,-13)); cv._blade=sc(sk.ztip); cv._handB=sc(sk.wrB);
    cache.set(key,cv); if(cache.size>900) cache.delete(cache.keys().next().value);
    return cv;
  }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame,framePose:function(form,anim,P,key){ return frame(form,anim,0,5,P,key); }};
})();
