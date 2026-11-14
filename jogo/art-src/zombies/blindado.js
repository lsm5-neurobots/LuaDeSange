/* BLINDADO — fonte de arte (editável). Build: npm run art
   Blindado: policial de tropa de choque zumbi (design genérico, sem brasão nem marca). Farda azul-marinho,
   colete de choque preto remendado, ombreiras e caneleiras de plástico rachado, capacete com viseira trincada
   e suja de sangue. Escudo retangular grande de acrílico fumê (rachaduras em teia, borda de borracha) no braço
   esquerdo, cassetete no direito. Sem escudo (depois que cai): alça presa no antebraço, postura curvada e
   agressiva. A factory tem duas "vistas": BLINDADO (com escudo) e BLINDADO.N (sem escudo, mesmos nomes de
   animação: idle/walk/hurt/... mapeados para idleN/walkN/...). Hi-bit: honra PIX.getK(). */
const BLINDADO=(function(){
  const {rad,lerp,P2,mkPen,compose}=PIX;
  const FW=214, FH=160, GROUND=150, AX=82;
  const RIM={comum:'#b4d4f4', enluarado:'#9ff6ff', plenilunar:'#ffb46a'};

  /* ---------- materiais ---------- */
  function mats(form){
    const m={
      skin:['#c8d4b4','#94a48a','#62726a','#36424a'],
      rot:['#aca686','#7a705c','#524a4a','#30283a'],
      flesh:['#f6ae94','#c25a5e','#7c3a4a','#4a1c34'],
      bone:['#fff4d8','#dccfa6','#a09070','#605040'],
      uni:['#5a6c94','#2c3a56','#1e283e','#121828'],
      vest:['#4a4e5c','#24262e','#16171e','#0c0c12'],
      pad:['#7a7e8c','#4a4e5a','#30323c','#1c1c24'],
      helm:['#5c6070','#2a2c36','#1a1b22','#0e0e14'],
      visor:['#d8f0ff','#6ea7c4','#3a6280','#1e3448'],
      shield:['#e6f6ff','#8cc0d8','#5a8aa8','#34566e'],
      rubber:['#5a5a64','#2c2c34','#1c1c22','#101014'],
      crack:['#ffffff','#c8d0d8','#9aa0a8','#5a6068'],
      baton:['#6a6c78','#32343e','#1e2028','#101016'],
      boot:['#5a5660','#2e2a32','#1c1a20','#0e0c12'],
      sole:['#8a8478','#5a544c','#3a3632','#201e1c'],
      strap:['#6a6460','#3e3a38','#28242a','#161418'],
      letter:['#c8ccd4','#8a8e9a','#5e626e','#3a3c48'],
      mouth:['#7c2e3e','#4c1828','#2e0c1a','#1a0610'],
      teeth:['#fbf0c0','#d8c27c','#9a8650','#5e4e30'],
      blood:['#b4483e','#7c3a3a','#521c24','#320e18'],
      eye:['#fffbe8','#e6e2c8','#a8a48c','#68645a'],
      nail:['#8a7a62','#54463c','#342a28','#1c1618'],
      glow:['#fffbe0','#e8e4b0','#aaa47a','#66644a'],
    };
    if(form==='enluarado'){
      m.skin=['#dcdcff','#9ea0e2','#666aac','#3c3a76']; m.flesh=['#f0b0ff','#b866d8','#7a3a9e','#46206a']; m.blood=['#b46ad8','#7e3ea6','#542474','#34144a'];
      m.crack=['#ffffff','#9ff6ff','#4ad0e8','#1a7a9c']; m.eye=['#ffffff','#b8fbff','#4ad8f0','#1a8aa8']; m.glow=['#effffe','#7af4ff','#2ab0d8','#146a96'];
      m.uni=['#6a6ab0','#3a3a7a','#262656','#16163a']; m.shield=['#f0fcff','#9ad0ec','#6098c0','#3a6288'];
    }
    if(form==='plenilunar'){
      m.skin=['#ffcaa6','#e2806a','#a4424e','#5e1e36']; m.flesh=['#ffc07a','#f06a3a','#a8302e','#5e1422']; m.blood=['#ff7a3a','#d43a26','#8a1c22','#4e0c18'];
      m.eye=['#fffbe0','#ffe04a','#ff8a2a','#b83a14']; m.glow=['#fff6c0','#ffb43a','#e0581e','#8a2414'];
      // o escudo vira uma placa de costelas e osso soldada ao colete
      m.shield=['#fff4d8','#dccfa6','#a09070','#605040']; m.crack=['#fffbe0','#ffb43a','#e0581e','#8a2414'];
      m.uni=['#6a4a5a','#44303e','#2c1e2a','#1a1018'];
    }
    return punch(m);
  }
  const NAMES={skin:'Pele',flesh:'Carne',bone:'Osso',uni:'Farda',vest:'Colete de choque',pad:'Ombreira e caneleira',helm:'Capacete',visor:'Viseira',shield:'Escudo de acrílico',rubber:'Borracha',crack:'Rachadura',baton:'Cassetete',boot:'Coturno',strap:'Alça',letter:'Letreiro apagado',teeth:'Dentes',blood:'Sangue seco',eye:'Olho',glow:'Brilho'};
  function sat(h,k){ const [r,g,b]=PIX.hexRgb(h), y=(r+g+b)/3; return PIX.toHex(y+(r-y)*k,y+(g-y)*k,y+(b-y)*k); }
  const NOPUNCH={crack:1,eye:1,glow:1,shield:1};
  function punch(m){ const o={}; for(const k in m){ const r=m[k]; o[k]=NOPUNCH[k]?[r[0],r[1],r[2],r[3]]:[sat(r[0],1.08),sat(r[1],1.14),PIX.mix(sat(r[2],1.1),'#2a1a4c',0.2),PIX.mix(r[3],'#140a24',0.34)]; } return o; }

  /* ---------- poses ---------- */
  // sh = escudo no braço (1) ou não (0). sx/sy/sa = deslocamento/giro do escudo. drop = escudo caindo (0..1).
  // bat = ângulo absoluto do cassetete (0 baixo, 90 frente, 180 cima). crk = rachadura extra. hoff = capacete rolando.
  const REST={hx:0,rot:0,lean:6,hunch:10,head:-8,jaw:6,aFs:10,aFe:120,aBs:56,aBe:96,lFh:18,lFk:-6,lBh:-14,lBk:-22,fF:0,fB:0,sh:1,sx:0,sy:0,sa:0,drop:0,bat:170,flash:0,smear:0,crk:0,hoff:0,grip:0};
  const S=Math.sin, C=Math.cos, PI=Math.PI, mx=Math.max;
  const NREST={sh:0,lean:14,hunch:22,head:-20,aBs:24,aBe:50,aFs:20,aFe:80,bat:120};
  const N=o=>Object.assign({},NREST,o);
  const ANIMS={
    idle:{nome:'Parado atrás do escudo',n:8,dur:()=>150,pose:i=>{ const p=i/8*PI*2, s=S(p);
      return {hunch:10+2*s, lean:6+1*s, head:-8+3*S(p-0.8), jaw:5+3*mx(0,S(p-0.4)), sy:1.4*S(p-0.6), aBs:56+2*S(p-0.6), aFs:10+3*S(p-0.3), aFe:120+4*S(p-0.9), bat:170+5*S(p-0.9), hx:0.4*S(p+0.5)}; }},
    walk:{nome:'Marcha pesada',n:8,dur:()=>162,pose:i=>{ const p=i/8*PI*2;
      const lFh=12+16*S(p), lBh=-12+12*S(p+PI);
      return {lFh, lFk:lFh-20*mx(0,C(p))-3, lBh, lBk:lBh-8-12*mx(0,C(p+PI)), fF:-10*mx(0,C(p)), fB:20*mx(0,C(p+PI)),
        lean:8+2*Math.abs(S(p)), hunch:10+2*S(2*p-0.6), head:-8+3*S(2*p-1.4), jaw:6, hx:1*S(2*p), sy:1.6*Math.abs(S(p)), sa:2*S(p),
        aFs:10+6*S(p), aFe:118+6*S(p-0.5), bat:168+6*S(p-0.5), aBs:56+2*S(2*p)}; }},
    alert:{nome:'Alerta (bate o cassetete no escudo)',n:7,dur:i=>[160,140,160,80,160,80,200][i],pose:i=>[
      {},
      {hunch:6,head:-2,jaw:14,lean:2,aFs:-10,aFe:150,bat:200,hx:-1},
      {hunch:6,head:0,jaw:20,lean:2,aFs:-20,aFe:160,bat:220,hx:-1},
      {hunch:10,head:-6,jaw:30,lean:8,aFs:40,aFe:100,bat:110,sx:1,hx:1},
      {hunch:6,head:-2,jaw:16,lean:2,aFs:-20,aFe:160,bat:220,hx:-1},
      {hunch:10,head:-6,jaw:34,lean:8,aFs:40,aFe:100,bat:110,sx:1,hx:1},
      {hunch:10,head:-8,jaw:8,lean:6}][i]},
    block:{nome:'Bloqueio (escudo recua, faísca)',n:4,dur:i=>[70,90,110,130][i],pose:i=>[
      {lean:-6,hunch:4,head:2,jaw:20,sx:-6,sa:-12,sy:-1,aBs:48,aBe:86,hx:-4,lFh:12,lBh:-18,crk:1},
      {lean:-4,hunch:6,head:0,jaw:16,sx:-4,sa:-8,aBs:50,aBe:90,hx:-3,lFh:14,lBh:-16},
      {lean:2,hunch:8,head:-4,jaw:10,sx:-1,sa:-3,hx:-1},
      {lean:6,hunch:10,head:-8,jaw:6}][i]},
    // ---- golpes (IA escolhe por distância/peso; hit = quadro do dano, reach = alcance em px) ----
    bash:{nome:'Empurrão de escudo',n:8,hit:4,reach:40,dur:i=>[130,130,120,120,140,130,130,140][i],pose:i=>[
      {lean:2,hunch:8,head:-6,jaw:10,sx:-4,sa:-6,aBs:48,aBe:84,hx:-2,lFh:14,lBh:-16},
      {lean:-8,hunch:4,head:0,jaw:20,sx:-9,sa:-12,aBs:36,aBe:70,hx:-5,lFh:10,lFk:-10,lBh:-10,lBk:-24},
      {lean:10,hunch:10,head:-10,jaw:24,sx:-2,sa:-2,aBs:60,aBe:96,hx:2,lFh:26,lFk:0,lBh:-22,lBk:-30,fB:14},
      {lean:22,hunch:14,head:-16,jaw:30,sx:9,sa:8,aBs:80,aBe:96,hx:8,lFh:34,lFk:6,lBh:-28,lBk:-34,fB:22},
      {lean:24,hunch:14,head:-14,jaw:4,sx:13,sa:10,aBs:86,aBe:94,hx:10,lFh:34,lFk:6,lBh:-28,lBk:-34,fB:22},
      {lean:20,hunch:14,head:-12,jaw:6,sx:10,sa:6,aBs:80,aBe:96,hx:8,lFh:30,lFk:4,lBh:-26,lBk:-32,fB:18},
      {lean:12,hunch:12,head:-10,jaw:8,sx:4,sa:2,aBs:64,aBe:96,hx:4,lFh:22,lBh:-20},
      {lean:6,hunch:10,head:-8,jaw:6,hx:1}][i]},
    rush:{nome:'Investida de escudo',n:9,hit:4,reach:30,dur:i=>[180,160,130,130,130,130,140,140,140][i],pose:i=>[
      {lean:16,hunch:16,head:-14,jaw:16,sx:-2,sy:4,aBs:60,aBe:92,hx:-2,lFh:30,lFk:-30,lBh:-6,lBk:-40,fB:20},
      {lean:24,hunch:18,head:-18,jaw:26,sx:2,sy:4,sa:4,aBs:66,aBe:94,hx:0,lFh:40,lFk:-36,lBh:0,lBk:-50,fB:30},
      {lean:28,hunch:16,head:-18,jaw:30,sx:6,sy:2,sa:6,aBs:74,aBe:96,hx:6,lFh:40,lFk:-4,lBh:-30,lBk:-44,fB:30},
      {lean:30,hunch:16,head:-18,jaw:34,sx:9,sy:2,sa:8,aBs:78,aBe:96,hx:8,lFh:-6,lFk:-40,lBh:30,lBk:-10,fF:20},
      {lean:30,hunch:16,head:-16,jaw:6,sx:12,sy:1,sa:10,aBs:82,aBe:96,hx:10,lFh:38,lFk:-4,lBh:-30,lBk:-44,fB:30,crk:1},
      {lean:24,hunch:14,head:-14,jaw:10,sx:9,sa:6,aBs:76,aBe:96,hx:8,lFh:30,lFk:2,lBh:-26,lBk:-34,fB:20},
      {lean:16,hunch:12,head:-12,jaw:10,sx:5,sa:3,aBs:66,aBe:96,hx:5,lFh:24,lBh:-22},
      {lean:10,hunch:10,head:-10,jaw:8,sx:2,hx:2,lFh:20,lBh:-16},
      {lean:6,hunch:10,head:-8,jaw:6,hx:1}][i]},
    turn:{nome:'Virar (lento: janela pra bater nas costas)',n:5,dur:()=>160,pose:i=>[
      {lean:4,hunch:10,head:-4,jaw:10,sx:-4,sa:-6,aBs:44,aBe:80,hx:-1},
      {lean:0,hunch:8,head:4,jaw:14,sx:-12,sa:-16,sy:2,aBs:20,aBe:50,hx:-3,lFh:6,lBh:-6},
      {lean:-2,hunch:8,head:10,jaw:16,sx:-18,sa:-22,sy:3,aBs:4,aBe:30,hx:-4,lFh:2,lBh:-2,fB:10},
      {lean:0,hunch:8,head:4,jaw:14,sx:-12,sa:-16,sy:2,aBs:20,aBe:50,hx:-3,lFh:6,lBh:-6},
      {lean:4,hunch:10,head:-4,jaw:10,sx:-4,sa:-6,aBs:44,aBe:80,hx:-1}][i]},
    shieldBreak:{nome:'Escudo racha e cai',n:8,dur:i=>[90,140,160,140,130,130,160,220][i],pose:i=>[
      {lean:-8,hunch:4,head:4,jaw:24,sx:-6,sa:-12,crk:2,hx:-5,flash:1,lFh:12,lBh:-18},
      {lean:-6,hunch:6,head:2,jaw:30,sx:-4,sa:-8,sy:2,crk:3,hx:-4,lFh:12,lBh:-18},
      {lean:-2,hunch:10,head:-6,jaw:36,sx:-2,sa:6,sy:6,crk:3,aBs:30,aBe:60,hx:-3},
      {lean:4,hunch:14,head:-12,jaw:30,drop:0.25,crk:3,aBs:10,aBe:30,aFs:-20,aFe:60,bat:60,hx:-2,lFh:20,lBh:-10},
      {lean:8,hunch:18,head:-18,jaw:26,drop:0.5,crk:3,aBs:-10,aBe:10,aFs:-30,aFe:40,bat:40,hx:-1,lFh:22,lBh:-14},
      {lean:10,hunch:20,head:-22,jaw:30,drop:0.75,crk:3,aBs:0,aBe:20,aFs:-10,aFe:60,bat:70,hx:0},
      {lean:12,hunch:22,head:-20,jaw:40,drop:1,crk:3,aBs:10,aBe:40,aFs:10,aFe:80,bat:100,hx:1},
      {lean:14,hunch:22,head:-20,jaw:20,drop:1,crk:3,aBs:24,aBe:50,aFs:20,aFe:80,bat:120,hx:1}][i]},
    hurt:{nome:'Dano (cabeça)',n:4,dur:i=>[80,110,130,150][i],pose:i=>[
      {lean:-8,hunch:2,head:6,jaw:24,sx:-4,sa:-8,aFs:-20,aFe:90,bat:150,hx:-6,flash:1,lFh:14,lBh:-6},
      {lean:-4,hunch:6,head:0,jaw:20,sx:-3,sa:-5,aFs:-10,aFe:100,hx:-5,lFh:12,lBh:-8},
      {lean:4,hunch:8,head:-6,jaw:12,sx:-1,hx:-2},
      {lean:6,hunch:10,head:-8,jaw:6}][i]},
    hurtB:{nome:'Dano (barriga)',n:4,dur:i=>[80,120,140,150][i],pose:i=>[
      {lean:24,hunch:24,head:4,jaw:30,sx:-6,sy:6,sa:10,aFs:30,aFe:60,bat:80,hx:-7,flash:1,lFh:20,lFk:-14,lBh:-14,lBk:-30},
      {lean:20,hunch:22,head:0,jaw:26,sx:-5,sy:5,sa:8,aFs:26,aFe:70,bat:90,hx:-6,lFh:18,lFk:-12,lBh:-14,lBk:-28},
      {lean:12,hunch:16,head:-6,jaw:14,sx:-2,sy:2,sa:3,hx:-3},
      {lean:7,hunch:11,head:-8,jaw:7,hx:-1}][i]},
    fall:{nome:'Derrubado',n:6,dur:i=>[90,90,90,110,140,260][i],pose:i=>[
      {lean:-12,hunch:4,head:4,jaw:30,aFs:-40,aFe:60,bat:100,aBs:30,aBe:60,hx:-6,flash:1,lFh:20,lBh:0},
      {rot:-30,lean:-4,hunch:6,head:0,jaw:26,aFs:-60,aFe:30,bat:60,aBs:10,aBe:40,hx:-4,lFh:40,lFk:30,lBh:20,lBk:10},
      {rot:-62,lean:0,hunch:8,head:-4,jaw:24,aFs:-90,aFe:-10,bat:0,aBs:-10,aBe:20,hx:-6,lFh:50,lFk:40,lBh:30,lBk:24},
      {rot:-90,lean:4,hunch:10,head:-2,jaw:30,aFs:-110,aFe:-60,bat:-40,aBs:-20,aBe:10,hx:2,lFh:40,lFk:10,lBh:30,lBk:4},
      {rot:-84,lean:2,hunch:12,head:-8,jaw:26,aFs:-120,aFe:-80,bat:-60,aBs:-24,aBe:4,hx:2,lFh:46,lFk:20,lBh:34,lBk:10},
      {rot:-90,lean:0,hunch:10,head:-6,jaw:30,aFs:-130,aFe:-90,bat:-70,aBs:-30,aBe:0,hx:2,lFh:40,lFk:6,lBh:26,lBk:0}][i]},
    getup:{nome:'Levantar',n:6,dur:i=>[200,170,170,160,160,150][i],pose:i=>[
      {rot:-90,lean:0,hunch:10,head:-6,jaw:30,aFs:-130,aFe:-90,bat:-70,aBs:-30,aBe:0,hx:2,lFh:40,lFk:6,lBh:26,lBk:0},
      {rot:-60,lean:10,hunch:20,head:-18,jaw:20,aFs:-50,aFe:20,bat:40,aBs:10,aBe:40,hx:-8,lFh:90,lFk:10,lBh:70,lBk:0},
      {rot:-30,lean:20,hunch:22,head:-24,jaw:16,aFs:-10,aFe:60,bat:90,aBs:30,aBe:60,hx:-6,lFh:110,lFk:10,lBh:60,lBk:-60},
      {rot:0,lean:28,hunch:22,head:-24,jaw:16,aFs:20,aFe:80,bat:120,aBs:50,aBe:84,hx:-4,lFh:78,lFk:-2,lBh:6,lBk:-86,fB:60},
      {rot:0,lean:14,hunch:14,head:-14,jaw:10,aFs:14,aFe:110,bat:160,hx:-1,lFh:34,lFk:-14,lBh:-12,lBk:-40},
      {lean:6,hunch:10,head:-8,jaw:6}][i]},
    death:{nome:'Morte (capacete rola, colete afunda)',n:10,dur:i=>[90,150,160,170,150,130,140,150,170,600][i],pose:i=>[
      {lean:-10,hunch:4,head:4,jaw:30,aFs:-34,aFe:60,bat:90,hx:-5,flash:1,lFh:14,lBh:-4},
      {lean:-4,hunch:8,head:10,jaw:40,aFs:-10,aFe:30,bat:40,aBs:30,aBe:50,hx:-6,lFh:10,lBh:-8},
      {lean:6,hunch:16,head:-4,jaw:44,aFs:4,aFe:10,bat:20,aBs:10,aBe:20,hx:-4,lFh:40,lFk:-30,lBh:28,lBk:-50,fF:10,fB:30},
      {lean:10,hunch:24,head:-12,jaw:46,aFs:6,aFe:4,bat:4,aBs:2,aBe:0,hx:-2,lFh:14,lFk:-92,lBh:6,lBk:-96,fF:100,fB:100},
      {rot:16,lean:12,hunch:28,head:-14,jaw:46,aFs:24,aFe:20,bat:20,aBs:16,aBe:14,hx:0,lFh:2,lFk:-92,lBh:-6,lBk:-96,fF:90,fB:90,hoff:0.15},
      {rot:50,lean:10,hunch:24,head:-16,jaw:44,aFs:70,aFe:90,bat:90,aBs:56,aBe:76,hx:4,lFh:-20,lFk:-70,lBh:-28,lBk:-74,fF:60,fB:60,hoff:0.35},
      {rot:80,lean:4,hunch:16,head:-8,jaw:40,aFs:140,aFe:160,bat:160,aBs:100,aBe:140,hx:8,lFh:-6,lFk:-14,lBh:-10,lBk:-18,fF:14,fB:14,hoff:0.55},
      {rot:90,lean:0,hunch:12,head:-4,jaw:42,aFs:156,aFe:172,bat:172,aBs:112,aBe:150,hx:8,lFh:-2,lFk:-6,lBh:-6,lBk:-10,fF:6,fB:6,hoff:0.75},
      {rot:90,lean:0,hunch:10,head:-2,jaw:42,aFs:160,aFe:176,bat:176,aBs:116,aBe:156,hx:8,lFh:-2,lFk:-6,lBh:-6,lBk:-10,fF:6,fB:6,hoff:0.92},
      {rot:90,lean:0,hunch:10,head:-2,jaw:44,aFs:160,aFe:176,bat:176,aBs:116,aBe:156,hx:8,lFh:-2,lFk:-6,lBh:-6,lBk:-10,fF:6,fB:6,hoff:1}][i]},

    /* ---------- sem escudo (vista BLINDADO.N) ---------- */
    idleN:{nome:'Parado sem escudo (curvado)',n:8,dur:()=>140,pose:i=>{ const p=i/8*PI*2, s=S(p);
      return N({hunch:22+3*s, lean:14+1*s, head:-20+4*S(p-0.8), jaw:10+5*mx(0,S(p-0.4)), aBs:24+5*S(p-0.6), aBe:50+6*S(p-1.1), aFs:20+4*S(p-0.3), aFe:80+5*S(p-0.9), bat:120+6*S(p-0.9), hx:0.6*S(p+0.5)}); }},
    walkN:{nome:'Andar sem escudo (mais rápido)',n:8,dur:()=>118,pose:i=>{ const p=i/8*PI*2;
      const lFh=14+20*S(p), lBh=-12+14*S(p+PI);
      return N({lFh, lFk:lFh-24*mx(0,C(p))-3, lBh, lBk:lBh-10-12*mx(0,C(p+PI)), fF:-12*mx(0,C(p)), fB:22*mx(0,C(p+PI)),
        lean:16+3*Math.abs(S(p)), hunch:22+3*S(2*p-0.6), head:-20+5*S(2*p-1.4), jaw:12, hx:1.2*S(2*p),
        aFs:20-16*S(p), aFe:80-14*S(p-0.5), bat:110-14*S(p-0.5), aBs:24+16*S(p), aBe:50+14*S(p-0.5)}); }},
    alertN:{nome:'Alerta sem escudo (rosna)',n:6,dur:i=>[160,140,200,160,200,180][i],pose:i=>[
      N({}), N({hunch:14,head:-8,jaw:20,lean:8,hx:-1}), N({hunch:12,head:-4,jaw:40,lean:6,aBs:50,aBe:90,aFs:40,aFe:120,bat:170,hx:-2}),
      N({hunch:16,head:-10,jaw:46,lean:8,aBs:60,aBe:100,aFs:50,aFe:130,bat:180,hx:-1}), N({hunch:22,head:-18,jaw:30,lean:14,hx:2}), N({})][i]},
    baton:{nome:'Cassetete (dois golpes)',n:8,hit:[3,5],reach:36,dur:i=>[140,120,90,110,90,120,130,140][i],pose:i=>[
      N({lean:8,hunch:18,head:-14,jaw:16,aFs:-30,aFe:150,bat:220,hx:-2,lFh:16,lBh:-16}),
      N({lean:2,hunch:14,head:-8,jaw:26,aFs:-50,aFe:170,bat:250,aBs:40,aBe:70,hx:-4,lFh:14,lBh:-14}),
      N({lean:20,hunch:22,head:-20,jaw:30,aFs:60,aFe:120,bat:150,hx:4,lFh:28,lFk:4,lBh:-24,lBk:-32,fB:16,smear:1}),
      N({lean:28,hunch:26,head:-24,jaw:6,aFs:90,aFe:80,bat:60,hx:8,lFh:32,lFk:6,lBh:-26,lBk:-34,fB:20}),
      N({lean:26,hunch:24,head:-22,jaw:20,aFs:100,aFe:150,bat:220,hx:7,lFh:32,lFk:6,lBh:-26,lBk:-34,fB:20,smear:1}),
      N({lean:30,hunch:26,head:-24,jaw:6,aFs:70,aFe:40,bat:20,hx:9,lFh:32,lFk:6,lBh:-26,lBk:-34,fB:20}),
      N({lean:20,hunch:24,head:-22,jaw:14,aFs:40,aFe:70,bat:90,hx:5,lFh:24,lBh:-20}),
      N({lean:14,hunch:22,head:-20,jaw:10,hx:1})][i]},
    kick:{nome:'Pisão de coturno (empurra)',n:7,hit:3,reach:34,dur:i=>[150,150,80,150,130,130,140][i],pose:i=>[
      N({lean:6,hunch:18,head:-14,jaw:16,lFh:30,lFk:-30,hx:-2,aBs:0,aBe:20,aFs:0,aFe:60,bat:90}),
      N({lean:-8,hunch:12,head:-6,jaw:26,lFh:70,lFk:-30,lBh:-6,lBk:-16,hx:-5,aBs:-20,aBe:0,aFs:-20,aFe:40,bat:60}),
      N({lean:-14,hunch:10,head:-4,jaw:30,lFh:88,lFk:70,fF:-60,lBh:-4,lBk:-14,hx:-4,aBs:-30,aBe:-10,aFs:-30,aFe:30,bat:50,smear:0}),
      N({lean:-16,hunch:10,head:-6,jaw:6,lFh:90,lFk:88,fF:-80,lBh:-4,lBk:-14,hx:-3,aBs:-30,aBe:-10,aFs:-30,aFe:30,bat:50}),
      N({lean:-6,hunch:14,head:-12,jaw:12,lFh:50,lFk:10,lBh:-8,lBk:-18,hx:-2}),
      N({lean:8,hunch:20,head:-18,jaw:10,lFh:26,lBh:-14,hx:0}),
      N({lean:14,hunch:22,head:-20,jaw:10,hx:1})][i]},
    hurtN:{nome:'Dano sem escudo (cabeça)',n:4,dur:i=>[80,110,130,150][i],pose:i=>[
      N({lean:-6,hunch:8,head:2,jaw:30,aFs:-30,aFe:40,bat:60,aBs:-36,aBe:-20,hx:-6,flash:1,lFh:14,lBh:-4}),
      N({lean:-2,hunch:12,head:-6,jaw:26,aFs:-20,aFe:50,bat:70,aBs:-26,aBe:-8,hx:-5,lFh:12,lBh:-6}),
      N({lean:8,hunch:18,head:-14,jaw:18,hx:-2}), N({lean:13,hunch:21,head:-19,jaw:12})][i]},
    hurtBN:{nome:'Dano sem escudo (barriga)',n:4,dur:i=>[80,120,140,150][i],pose:i=>[
      N({lean:32,hunch:36,head:-4,jaw:36,aFs:40,aFe:30,bat:40,aBs:34,aBe:-16,hx:-7,flash:1,lFh:20,lFk:-14,lBh:-14,lBk:-30}),
      N({lean:28,hunch:34,head:-8,jaw:32,aFs:36,aFe:40,bat:50,aBs:30,aBe:-10,hx:-6,lFh:18,lFk:-12,lBh:-14,lBk:-28}),
      N({lean:20,hunch:28,head:-16,jaw:20,hx:-3}), N({lean:15,hunch:23,head:-19,jaw:12,hx:-1})][i]},
  };
  // sem escudo: queda/levantar/morte reaproveitam as poses com escudo, só que sem o escudo
  ['fall','getup','death'].forEach(k=>{ const A=ANIMS[k]; ANIMS[k+'N']=Object.assign({},A,{nome:A.nome+' (sem escudo)',pose:i=>Object.assign({},A.pose(i),{sh:0})}); });
  const MAPN={shieldBreak:'shieldBreak',idle:'idleN',walk:'walkN',alert:'alertN',hurt:'hurtN',hurtB:'hurtBN',fall:'fallN',getup:'getupN',death:'deathN',baton:'baton',kick:'kick'};

  const EXK=['hx','lean','hunch','head','aFs','aFe','aBs','aBe','lFh','lFk','lBh','lBk'];
  function exag(P,f){ if(f===1||Math.abs(P.rot)>4) return P; EXK.forEach(k=>{ const r=P.sh?REST[k]:(NREST[k]!=null?NREST[k]:REST[k]); P[k]=r+(P[k]-r)*f; }); P.jaw=Math.min(52,mx(0,REST.jaw+(P.jaw-REST.jaw)*f)); return P; }
  const EXF={idle:1.1,walk:1.12,alert:1.2,block:1.25,bash:1.25,rush:1.2,turn:1,shieldBreak:1.15,hurt:1.3,hurtB:1.25,fall:1.1,getup:1.08,death:1.1,idleN:1.12,walkN:1.14,alertN:1.2,baton:1.25,kick:1.2,hurtN:1.3,hurtBN:1.25,fallN:1.1,getupN:1.08,deathN:1.1};
  ZREACT.add(ANIMS,REST,{}); // reações (voando, agarrado) + golpe extra — art-src/shared/zreact.js
  function poseOf(anim,i){ return exag(Object.assign({},REST,ANIMS[anim].pose(i)),EXF[anim]||1); }
  function heavyOutline(cv){ const g=cv.getContext('2d'), W=cv.width, H=cv.height, im=PIX.pix(cv), d=im.data;
    const isO=i=>d[i+3]===255&&d[i]===0x17&&d[i+1]===0x0b&&d[i+2]===0x1c, fill=i=>d[i+3]===255&&!isO(i);
    const add=[]; for(let y=2;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(d[i+3]) continue; const u=((y-1)*W+x)*4, u2=((y-2)*W+x)*4; if(isO(u)&&fill(u2)) add.push(i); }
    add.forEach(i=>{ d[i]=0x17; d[i+1]=0x0b; d[i+2]=0x1c; d[i+3]=255; }); g.putImageData(im,0,0); }

  /* ---------- esqueleto (largo e pesado, mais ereto que o Errante) ---------- */
  const SPINE=40, TH=20, SH=19, UA=15, FA=14, VS=1.0, US=1.3, HB=8, HS=1.2;
  const lp=(p,a,L)=>({x:p.x+Math.sin(rad(a))*L, y:p.y+Math.cos(rad(a))*L});
  function build(P,dy){
    const R=P.rot, hip={x:AX+P.hx, y:dy};
    const ra=rad(R), rc=Math.cos(ra), rs=Math.sin(ra);
    const HR=(lx,ly)=>({x:hip.x+lx*rc-ly*rs, y:hip.y+lx*rs+ly*rc});
    const hipF=HR(3.4,0), hipB=HR(-3.4,0);
    const kneeF=lp(hipF,P.lFh-R,TH), ankleF=lp(kneeF,P.lFk-R,SH), kneeB=lp(hipB,P.lBh-R,TH), ankleB=lp(kneeB,P.lBk-R,SH);
    const SS=[]; let x=hip.x, y=hip.y;
    for(let k=0;k<=SPINE;k++){ const t=k/SPINE, a=rad(R+P.lean+(P.hunch+HB)*Math.pow(t,1.25)); SS.push({x,y,a}); x+=Math.sin(a); y-=Math.cos(a); }
    const SP=(u,v)=>{ const f=Math.max(0,-v), k=Math.min(SPINE,Math.floor(f)), s=SS[k], r=f-k, a=s.a;
      const px=s.x+Math.sin(a)*r, py=s.y-Math.cos(a)*r; return {x:px+Math.cos(a)*u, y:py+Math.sin(a)*u}; };
    const T=(u,v)=>SP(u*US,v*VS);
    const top=SS[SPINE], neck=T(1,-39), sa=top.a;
    const shF=T(4,-31), shB=T(-4,-32);
    const elF=lp(shF,P.aFs-R,UA), wrF=lp(elF,P.aFe-R,FA), elB=lp(shB,P.aBs-R,UA), wrB=lp(elB,P.aBe-R,FA);
    const ha=sa+rad(P.head-HB*0.8), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:neck.x+(lx*hc-ly*hs)*HS, y:neck.y+(lx*hs+ly*hc)*HS});
    const jp=H(1.6,-5), ja=ha+rad(P.jaw), jc=Math.cos(ja), js=Math.sin(ja);
    const J=(lx,ly)=>({x:jp.x+(lx*jc-ly*js)*HS, y:jp.y+(lx*js+ly*jc)*HS});
    const toe=(a,f)=>{ const t=rad(f+R); return {x:a.x+(11*Math.cos(t)-5*Math.sin(t))*1.35, y:a.y+(11*Math.sin(t)+5*Math.cos(t))*1.35}; };
    const hull=[[ankleF,6],[ankleB,6],[toe(ankleF,P.fF),0.6],[toe(ankleB,P.fB),0.6],[kneeF,6],[kneeB,6],[hip,10],[T(0,-18),13],[T(-2,-30),13],[H(2,-12),13],[wrF,4.6],[wrB,4.6],[elF,5],[elB,5]];
    return {R,hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,SP,T,sa,neck,shF,shB,elF,wrF,elB,wrB,ha,H,ja,J,hull,ra};
  }
  function skeleton(P){
    const a=build(P,0); let m=-1e9; a.hull.forEach(([p,r])=>{ m=Math.max(m,p.y+r); });
    return build(P,GROUND-m);
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
  // placa arredondada de plástico (ombreira, joelheira) com rachadura
  function plate(p,M,c0,ang,rx,ry,crack){
    p.F(M.pad[1]); p.ell(c0.x,c0.y,rx,ry,ang);
    p.F(M.pad[2]); p.ell(c0.x+Math.cos(ang+PI/2)*ry*0.35,c0.y+Math.sin(ang+PI/2)*ry*0.35,rx*0.9,ry*0.6,ang);
    p.F(M.pad[0]); p.ell(c0.x-Math.cos(ang+PI/2)*ry*0.45+Math.cos(ang)*rx*0.2,c0.y-Math.sin(ang+PI/2)*ry*0.45+Math.sin(ang)*rx*0.2,rx*0.5,ry*0.22,ang);
    if(crack){ p.F(M.pad[3]); const a={x:c0.x-Math.cos(ang)*rx*0.2,y:c0.y-Math.sin(ang)*rx*0.2}; p.cap(a,{x:a.x+Math.cos(ang+1.2)*ry*0.8,y:a.y+Math.sin(ang+1.2)*ry*0.8},0.6,0.4); }
  }

  /* ---------- braços ---------- */
  function drawArm(c,u,M,sk,P,front){
    const p=mkPen(c,u), sh=front?sk.shF:sk.shB, el=front?sk.elF:sk.elB, wr=front?sk.wrF:sk.wrB; p._c=c; p.id();
    // manga da farda inteira até o punho
    limb(p,M.uni,sh,el,13.4,12,{});
    const n=limb(p,M.uni,el,wr,12,10.4,{});
    p.F(M.uni[3]); const cf=lerp(el,wr,0.88); p.cap({x:cf.x-n.nx*5,y:cf.y-n.ny*5},{x:cf.x+n.nx*5,y:cf.y+n.ny*5},1.2,1.2);
    // cotoveleira e ombreira de plástico
    plate(p,M,el,Math.atan2(wr.y-el.y,wr.x-el.x),5.6,4.4,front);
    plate(p,M,lerp(sh,el,0.18),Math.atan2(el.y-sh.y,el.x-sh.x)+PI/2,8,6.2,!front);
    if(!front && !P.sh){ // alça do escudo ainda presa no antebraço
      p.F(M.strap[1]); const s0=lerp(el,wr,0.45); p.cap({x:s0.x-n.nx*6,y:s0.y-n.ny*6},{x:s0.x+n.nx*6,y:s0.y+n.ny*6},2.4,2.4);
      p.F(M.strap[0]); p.cap({x:s0.x-n.nx*5,y:s0.y-n.ny*5-0.6},{x:s0.x+n.nx*1,y:s0.y+n.ny*1-0.6},0.8,0.8);
      p.F(M.rubber[1]); const s1=lerp(s0,{x:s0.x+n.nx*6,y:s0.y+n.ny*6},1); p.cap(s1,{x:s1.x+2,y:s1.y+5},1.4,1); }
    if(front) drawBaton(p,M,wr,P);
    drawHand(p,M,el,wr,P,front);
  }
  function drawBaton(p,M,wr,P){
    // cassetete: ângulo absoluto (0 = pra baixo, + = pra frente)
    const a=rad(P.bat), d={x:Math.sin(a),y:Math.cos(a)}, b0={x:wr.x-d.x*4,y:wr.y-d.y*4}, b1={x:wr.x+d.x*24,y:wr.y+d.y*24};
    p.F(M.baton[1]); p.cap(b0,b1,3.2,3);
    const n=sideN(b0,b1); p.F(M.baton[2]); p.cap({x:b0.x+n.nx*0.7,y:b0.y+n.ny*0.7},{x:b1.x+n.nx*0.7,y:b1.y+n.ny*0.7},1.6,1.4);
    p.F(M.baton[0]); p.cap({x:lerp(b0,b1,0.3).x-n.nx*0.8,y:lerp(b0,b1,0.3).y-n.ny*0.8},{x:lerp(b0,b1,0.9).x-n.nx*0.8,y:lerp(b0,b1,0.9).y-n.ny*0.8},0.7,0.6);
    p.F(M.baton[3]); p.circle(b0,1.8); p.F(M.blood[1]); const bs=lerp(b0,b1,0.8); p.rect(bs.x-0.8,bs.y-0.8,1.6,1.6);
  }
  function drawHand(p,M,el,wr,P,front){
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y); p._c.scale(1.36,1.36);
    // luva tática rasgada, dedos à mostra
    p.F(M.vest[1]); p.poly([[-1.6,-3.6],[4,-4],[5.4,-1],[5,3.6],[-1.6,3.8]]);
    p.F(M.vest[2]); p.poly([[-1.6,1.4],[5.2,1.2],[5,3.6],[-1.6,3.8]]);
    p.F(M.vest[0]); p.rect(0,-3.4,3.4,0.9);
    const closed=front||P.sh||P.grip;
    for(let k=0;k<4;k++){ const y0=-2.8+k*1.9;
      if(closed){ p.F(M.skin[1]); p.ell(5.6,y0,1.6,1); p.F(M.skin[2]); p.rect(5,y0+0.4,1.6,0.5); }
      else { const a1={x:5,y:y0}, b1={x:8.4,y:y0-0.8}, c1={x:10,y:y0-2.4}; p.F(M.skin[1]); p.cap(a1,b1,1.9,1.7); p.cap(b1,c1,1.7,1.3); p.F(M.nail[1]); p.ell(c1.x,c1.y,0.8,0.7); } }
    p.F(M.skin[1]); p.cap(P2(1.6,-3.4),P2(4.4,-5.6),1.8,1.4);
    p.id();
  }

  /* ---------- pernas: farda, joelheira, caneleira, coturno ---------- */
  function drawLeg(c,u,M,sk,P,front){
    const p=mkPen(c,u), hip=front?sk.hipF:sk.hipB, knee=front?sk.kneeF:sk.kneeB, ank=front?sk.ankleF:sk.ankleB; p.id();
    limb(p,M.uni,hip,knee,15,13.4,{hl:0.6});
    const n=limb(p,M.uni,knee,ank,12.6,11,{hl:0.5});
    const kn=sideN(hip,knee);
    // bolso cargo e rasgo com pele à mostra
    if(front){ const t=lerp(hip,knee,0.55); p.F(M.uni[2]); p.ell(t.x-kn.nx*2,t.y-kn.ny*2,3.6,2.8,Math.atan2(knee.y-hip.y,knee.x-hip.x)); p.F(M.uni[3]); p.rect(t.x-kn.nx*2-3,t.y-kn.ny*2-2.6,6,0.9);
      const r=lerp(hip,knee,0.25); p.F(M.uni[3]); p.ell(r.x+kn.nx*3,r.y+kn.ny*3,2.2,1.5); p.F(M.skin[2]); p.ell(r.x+kn.nx*3,r.y+kn.ny*3,1.4,0.9); }
    // caneleira (placa comprida) + joelheira
    const sa=Math.atan2(ank.y-knee.y,ank.x-knee.x);
    const g0=lerp(knee,ank,0.2), g1=lerp(knee,ank,0.82), off=-2.4;
    p.F(M.pad[1]); p.cap({x:g0.x-n.nx*off,y:g0.y-n.ny*off},{x:g1.x-n.nx*off,y:g1.y-n.ny*off},9,8);
    p.F(M.pad[2]); p.cap({x:g0.x+n.nx*1.6,y:g0.y+n.ny*1.6},{x:g1.x+n.nx*1.6,y:g1.y+n.ny*1.6},4,3.4);
    p.F(M.pad[0]); p.cap({x:g0.x-n.nx*(off+2.6),y:g0.y-n.ny*(off+2.6)},{x:lerp(g0,g1,0.7).x-n.nx*(off+2.6),y:lerp(g0,g1,0.7).y-n.ny*(off+2.6)},1.2,1);
    if(front){ p.F(M.pad[3]); const cr=lerp(g0,g1,0.55); p.cap({x:cr.x-n.nx*4,y:cr.y-n.ny*4},{x:cr.x+n.nx*1+2,y:cr.y+n.ny*1+1.4},0.7,0.5); }
    plate(p,M,{x:knee.x-kn.nx*2,y:knee.y-kn.ny*2},sa+PI/2,5.6,5,front);
    // coturno de sola grossa
    const fa=rad((front?P.fF:P.fB)+sk.R); p.xf(fa,ank.x,ank.y); c.scale(1.35,1.35);
    p.F(M.boot[1]); p.poly([[-4.4,-4.4],[3,-4.6],[4.4,-1],[9,0.6],[11.6,2.4],[11.6,4],[-4.8,4]]);
    p.F(M.boot[2]); p.poly([[-4.8,1.6],[11.4,2],[11.6,4],[-4.8,4]]);
    p.F(M.boot[0]); p.rect(-2.8,-4,3.4,0.8); p.rect(6,0.4,3,0.7);
    p.F(M.boot[3]); [[0,-3],[1.4,-1.6],[2.8,-0.2]].forEach(([x,y])=>p.rect(x,y,1.6,0.6)); // cadarço
    p.F(M.sole[1]); p.poly([[-5.2,3.6],[12.2,3.6],[12.6,5.8],[-5.4,6]]); p.F(M.sole[3]); p.rect(-5.4,5.2,18,0.8); p.F(M.sole[0]); p.rect(6,3.8,5.4,0.6);
    p.id();
  }

  /* ---------- tronco: colete de choque preto sobre a farda ---------- */
  const SIL=[[-10.4,3],[-11.2,-8],[-12,-20],[-12.4,-30],[-10.2,-37],[-4,-40.4],[4.4,-40],[9.8,-36],[11.6,-28],[11.8,-18],[11.2,-8],[10.4,3]];
  function drawTorso(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    // farda (camisa) aparece no cós e nas bordas
    p.F(M.uni[1]); p.poly(W(sk,[[-10.4,-6],[10.6,-6],[10.6,5],[-10.6,5]]));
    p.F(M.uni[2]); p.poly(W(sk,[[-10.6,0],[10.6,0],[10.6,5],[-10.6,5]]));
    // cinto tático com porta-algemas e bolsas
    p.F(M.vest[1]); p.poly(W(sk,[[-10.8,-5],[11,-5],[11,-1.4],[-10.8,-1.4]])); p.F(M.vest[0]); p.poly(W(sk,[[-10.8,-5],[11,-5],[11,-4.2],[-10.8,-4.2]]));
    p.F(M.pad[2]); p.poly(W(sk,[[4,-6],[9,-6],[9,0.6],[4,0.6]])); p.F(M.pad[0]); p.poly(W(sk,[[4,-6],[9,-6],[9,-5],[4,-5]]));
    p.F(M.pad[2]); p.poly(W(sk,[[-9,-6],[-5,-6],[-5,0],[-9,0]]));
    p.F(M.sole[1]); const fv=Wp(sk,1.4,-3.2); p.rect(fv.x-1.4,fv.y-1.2,2.8,2.4);
    // colete com 3 passadas de tom
    const vest=W(sk,[[-10.6,-5],[-11.4,-12],[-12.2,-22],[-12.4,-30],[-10.2,-37],[-4,-40.4],[4.4,-40],[9.8,-36],[11.6,-28],[11.8,-18],[11.4,-8],[11,-5]]);
    p.F(M.vest[1]); p.poly(vest);
    clip(c,vest,()=>{ p.F(M.vest[2]); p.poly(W(sk,[[-16,6],[-16,-46],[-5,-46],[-6,-34],[-4,-22],[-2,-10],[2,6]]));
      p.F(M.vest[3]); p.poly(W(sk,[[-16,6],[-16,-46],[-9.4,-46],[-10.4,-32],[-9,-18],[-7,6]]));
      p.F(M.vest[0]); p.poly(W(sk,[[2,-38],[8,-36],[10.6,-28],[10.6,-20],[7.6,-26],[4,-33]]));
      // painéis acolchoados (costuras)
      p.F(M.vest[3]); [-14,-23,-32].forEach(v=>p.poly(W(sk,[[-13,v],[13,v],[13,v-0.8],[-13,v-0.8]])));
      p.F(M.vest[2]); p.poly(W(sk,[[1,-40],[1.8,-40],[1.8,-5],[1,-5]]));
      // remendo de fita
      p.F(M.pad[1]); p.poly(W(sk,[[-6,-27],[-1.4,-28.4],[-1,-25.4],[-5.6,-24.2]])); p.F(M.pad[0]); p.poly(W(sk,[[-6,-27],[-1.4,-28.4],[-1.4,-27.8],[-6,-26.4]]));
      // letreiro genérico apagado nas costas (blocos, ilegível)
      p.F(M.letter[2]); [[-10.6,-20],[-8.8,-20],[-7,-20],[-5.2,-20],[-3.4,-20]].forEach(([x,y],k)=>{ if(k===2) return; p.poly(W(sk,[[x,y],[x+1.3,y],[x+1.3,y-3],[x,y-3]])); });
      // furos e sangue seco
      p.F(M.uni[2]); p.ell(Wp(sk,6,-14).x,Wp(sk,6,-14).y,1.4,1.2); p.F(M.flesh[2]); p.rect(Wp(sk,6,-14).x-0.5,Wp(sk,6,-14).y-0.5,1,1);
      p.F(M.blood[2]); p.poly(W(sk,[[7,-36],[10,-30],[9.4,-24],[8.4,-28],[7.6,-22],[6.6,-30]])); p.F(M.blood[1]); p.poly(W(sk,[[7.6,-35],[9,-31],[8.6,-29],[8,-31]])); });
    // gola alta do colete
    p.F(M.vest[2]); p.poly(W(sk,[[-5,-40.6],[5,-40.2],[6,-37.4],[-5.4,-37.6]])); p.F(M.vest[0]); p.poly(W(sk,[[-4,-40.6],[4.6,-40.2],[4.6,-39.4],[-4,-39.8]]));
    if(form==='plenilunar'){ p.F(M.bone[1]); [[-11.6,-30,-17,-34],[-12,-22,-17.6,-22],[-11,-14,-16,-11]].forEach(([u0,v0,u1,v1])=>{ const a=Wp(sk,u0,v0+1.6), b=Wp(sk,u1,v1), d=Wp(sk,u0+0.6,v0-1.6); p.poly([[a.x,a.y],[b.x,b.y],[d.x,d.y]]); }); }
    if(form!=='comum'){ p.F(M.glow[1]); [[[5,-16],[8,-12],[7.4,-11.6],[4.6,-15.4]],[[-4,-34],[-1,-30],[-1.6,-29.6],[-4.4,-33.4]]].forEach(f=>p.poly(W(sk,f))); }
  }

  /* ---------- cabeça: capacete de choque com viseira ---------- */
  function drawHead(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.xf(sk.ha,sk.neck.x,sk.neck.y); c.scale(HS,HS);
    // pescoço grosso
    p.F(M.skin[1]); p.poly([[-5,4],[5.6,4],[6,-4],[-4.4,-6]]); p.F(M.skin[2]); p.poly([[-5,4],[-1,4],[-1.6,-5.4],[-4.4,-6]]);
    // rosto por baixo (parte de baixo aparece sob a viseira)
    p.F(M.skin[1]); p.ell(4,-10,8.4,7.6); p.poly([[-2,-5],[12.6,-7],[13.4,-3.6],[-1,-2.6]]);
    p.F(M.skin[2]); p.poly([[-4,-12],[-3,-5],[2,-2.6],[6,-2.6],[1,-5],[-1,-10]]);
    p.F(M.rot[1]); p.ell(9,-5.6,1.6,1); p.F(M.flesh[1]); p.poly([[10.4,-6],[13,-6.4],[12.6,-4.2],[10.6,-4]]);
    p.F(M.mouth[1]); p.poly([[5,-5.6],[13.2,-6],[13.2,-3],[5,-2.8]]);
    p.F(M.teeth[1]); [[7,-5.8,1.3,1.8],[8.6,-5.8,1.3,2.1],[10.2,-5.8,1.2,1.6],[11.6,-5.8,1.1,1.4]].forEach(([x,y,w,h])=>p.rect(x,y,w,h));
    if(P.hoff>0){ // sem capacete: crânio pelado e podre
      p.F(M.skin[1]); p.ell(2.6,-13.4,9.6,9.2); p.F(M.skin[2]); p.poly([[-7,-16],[-5,-6],[0,-3],[-2,-9],[-3,-16]]);
      p.F(M.rot[1]); p.ell(1,-18,2.6,1.6); p.ell(5,-20,1.6,1); p.F(M.skin[0]); p.ell(5,-20.4,4,1.4,-0.2);
      p.F(M.skin[3]); p.ell(9,-11.6,2.6,2); p.F(M.eye[1]); p.ell(9.2,-11.6,1.6,1.2);
      p.id(); return; }
    // capacete: casco preto
    const dome=[]; for(let k=0;k<=14;k++){ const a=PI*0.94+k/14*PI*1.04; dome.push([2.2+Math.cos(a)*10.6,-12.4+Math.sin(a)*10.4]); }
    p.F(M.helm[1]); p.poly([...dome,[12.8,-8],[-8.4,-6]]);
    p.F(M.helm[2]); p.poly([[-8.6,-8],[-9.6,-14],[-7,-20],[-4,-21.6],[-5,-17],[-5.4,-11],[-4,-6.6]]);
    p.F(M.helm[3]); p.poly([[-8.6,-8],[-8.6,-12],[-6.6,-9],[-5.4,-6.4]]);
    p.F(M.helm[0]); p.poly([[1,-22.4],[7,-21],[10,-17.6],[6.6,-18.4],[2,-20.6]]);
    p.F(M.helm[3]); p.poly([[-8.4,-7],[13,-9],[13,-7.8],[-8.4,-5.6]]);
    // protetor de nuca
    p.F(M.vest[1]); p.poly([[-9,-8],[-3,-7],[-2,-1],[-8,0.6],[-10.6,-3]]); p.F(M.vest[2]); p.poly([[-10.6,-3],[-8,0.6],[-2,-1],[-2,0],[-8,1.6]]);
    // viseira fumê trincada (cobre os olhos; o brilho do olho atravessa)
    const vis=[[3.4,-17.4],[13.6,-16.4],[15,-12],[14.4,-7.6],[4,-7.2]];
    p.F(M.visor[2]); p.poly(vis);
    clip(c,vis,()=>{ p.F(M.visor[3]); p.poly([[3,-10],[16,-10],[16,-6],[3,-6]]);
      p.F(M.skin[3]); p.ell(9.4,-12,2.6,2);
      p.F(M.eye[1]); p.ell(9.6,-12,1.5,1.1); p.F(M.eye[0]); p.rect(9.2,-12.6,0.8,0.7);
      p.F(M.skin[3]); p.ell(13.4,-12,0.9,1.3); p.F(M.eye[2]); p.rect(13.1,-12.4,0.7,0.9);
      p.F(M.visor[0]); p.poly([[5,-17.4],[7.6,-17.4],[5.4,-7],[4,-7.4]]); p.F(M.visor[1]); p.poly([[8.4,-17],[9.4,-17],[7.4,-7.2],[6.6,-7.2]]);
      // trinca em teia + sangue seco
      p.F(M.crack[1]); const o={x:11.6,y:-14}; [[-2.6],[-1],[0.6],[2.2]].forEach(([a])=>p.cap(o,{x:o.x+Math.cos(a)*5,y:o.y+Math.sin(a)*5},0.6,0.4));
      p.F(M.crack[0]); p.circle(o,0.8);
      p.F(M.blood[1]); p.poly([[12,-10.4],[15,-11],[15,-8],[13.6,-7.6]]); p.F(M.blood[2]); p.rect(13.6,-8.2,0.8,2); });
    p.F(M.rubber[1]); p.poly([[3,-17.8],[13.8,-16.8],[13.8,-16],[3.4,-17]]);
    p.F(M.pad[1]); p.circle(P2(3.4,-12.4),1.4); p.F(M.pad[0]); p.rect(2.8,-13.2,0.8,0.8);
    if(form!=='comum'){ p.F(M.glow[0]); p.rect(9,-12.6,1.6,1.2); }
    p.id();
  }
  function drawJaw(c,u,M,sk,P){
    const p=mkPen(c,u); const o=sk.J(0,0); p.xf(sk.ja,o.x,o.y); c.scale(HS,HS);
    p.F(M.skin[1]); p.poly([[-2,-1],[10.6,-0.6],[11.6,1.6],[10.6,5.6],[6,7.4],[0.4,6.4],[-2.6,2.6]]);
    p.F(M.skin[2]); p.poly([[-2.6,2.6],[0.4,6.4],[6,7.4],[10.6,5.6],[8.6,5],[3,5.4],[0,3.6]]);
    p.F(M.mouth[1]); p.poly([[2,-0.8],[10,-0.4],[10,1.4],[2.4,1]]);
    p.F(M.teeth[1]); [[3.6,-1,1.2,1.6],[5.2,-1,1.2,2],[6.8,-1,1.2,1.6],[8.4,-1,1.1,2]].forEach(([x,y,w,h])=>p.rect(x,y,w,h));
    // jugular do capacete (correia no queixo, arrebentada)
    p.F(M.strap[1]); p.poly([[-2,0],[0,0],[1,6],[-1,6.4]]); p.F(M.strap[0]); p.rect(-1.6,0.4,0.6,3);
    p.F(M.blood[1]); p.poly([[9.6,5],[11,4.4],[10.6,7.6],[10,8]]);
    p.id();
  }
  // capacete rolando no chão (morte)
  function drawHelmOff(c,u,M,P){
    const p=mkPen(c,u); p.id(); const t=P.hoff, x=AX+22+t*38, y=GROUND-9-Math.abs(S(t*PI*2))*8, a=t*PI*2.4;
    p.xf(a,x,y);
    const dome=[]; for(let k=0;k<=12;k++){ const b=PI+k/12*PI; dome.push([Math.cos(b)*10,Math.sin(b)*9+2]); }
    p.F(M.helm[1]); p.poly(dome); p.F(M.helm[2]); p.poly([[-10,2],[10,2],[9,4],[-9,4]]); p.F(M.helm[0]); p.poly([[-2,-6],[4,-5],[6,-3],[1,-4]]);
    p.F(M.visor[2]); p.poly([[2,-6],[10,-1],[10,3],[2,3]]); p.F(M.visor[0]); p.poly([[4,-4],[5.2,-3.4],[4,2],[3,2]]);
    p.id();
  }

  /* ---------- escudo de acrílico ---------- */
  function shieldXf(sk,P){
    if(P.drop<=0){ const g=sk.wrB, a=sk.ra+rad(P.sa); return {x:g.x+3+P.sx, y:g.y+9+P.sy, a}; }
    // caindo: sai do braço, gira e deita no chão à frente
    const g=sk.wrB, t=Math.min(1,P.drop), e=t*t, gx=AX+26, gy=GROUND-4;
    return {x:lerp({x:g.x+4,y:0},{x:gx,y:0},t).x, y:(g.y+9)+(gy-(g.y+9))*e - S(t*PI)*6, a:sk.ra+rad(P.sa)+e*PI*0.5};
  }
  function drawShield(c,u,M,sk,P,form){
    const p=mkPen(c,u), X=shieldXf(sk,P);
    const T=(lx,ly)=>({x:X.x+lx*Math.cos(X.a)-ly*Math.sin(X.a), y:X.y+lx*Math.sin(X.a)+ly*Math.cos(X.a)});
    const L=list=>list.map(([x,y])=>{ const q=T(x,y); return [q.x,q.y]; });
    p.id();
    const H2=34, SW=17, face=L([[-3,-H2],[SW,-H2+3],[SW,H2-3],[-3,H2]]);
    const split=P.crk>=3 && P.drop>0;
    // borda de borracha (espessura visível na lateral da frente)
    p.F(M.rubber[2]); p.poly(L([[SW,-H2+3],[SW+3,-H2+4],[SW+3,H2-4],[SW,H2-3]]));
    p.F(M.rubber[0]); p.poly(L([[SW+0.4,-H2+3.4],[SW+1.4,-H2+3.6],[SW+1.4,H2-4],[SW+0.4,H2-3.6]]));
    p.F(M.shield[1]); p.poly(face);
    clip(c,face,()=>{
      // "transparência": o que está atrás aparece escurecido no acrílico (perna e tronco)
      if(P.drop<=0){ p.F(M.shield[2]); p.cap(sk.kneeF,sk.ankleF,12,10); p.cap(sk.hipF,sk.kneeF,14,12); p.poly(W(sk,[[-6,0],[12,0],[12,-36],[-6,-36]]));
        p.F(M.shield[3]); p.cap(lerp(sk.kneeF,sk.ankleF,0.5),sk.ankleF,6,5); }
      p.F(M.shield[2]); p.poly(L([[-4,H2*0.35],[SW+4,H2*0.2],[SW+4,H2+2],[-4,H2+2]]));
      if(form==='plenilunar'){ // placa de costelas soldada
        p.F(M.shield[2]); for(let k=-3;k<=3;k++){ const y=k*8; p.poly(L([[-4,y-1.6],[SW+4,y-3],[SW+4,y+0.6],[-4,y+2]])); }
        p.F(M.shield[0]); for(let k=-3;k<=3;k++){ const y=k*8; p.poly(L([[-4,y-1.6],[SW+4,y-3],[SW+4,y-2.2],[-4,y-0.8]])); }
        p.F(M.shield[3]); p.poly(L([[3,-H2],[5,-H2],[5,H2],[3,H2]]));
      } else {
        // reflexos diagonais
        p.F(M.shield[0]); p.poly(L([[-4,-H2+6],[2,-H2],[6,-H2],[-4,-H2+16]])); p.poly(L([[-4,-4],[SW+4,-24],[SW+4,-20],[-4,0]]));
        // janela de visão e letreiro apagado
        p.F(M.shield[3]); p.poly(L([[-1,-H2+5],[8,-H2+6],[8,-H2+7],[-1,-H2+6]]));
        p.F(M.shield[0]); [0,2,4,6].forEach(x=>p.poly(L([[x-0.6,-6],[x+0.8,-6.2],[x+0.8,-3.4],[x-0.6,-3.2]])));
      }
      // rachaduras em teia (mais com crk)
      const o=T(4,-8+(P.crk>1?6:0)), arms=4+P.crk*2;
      p.F(M.crack[2]); for(let k=0;k<arms;k++){ const a=X.a+k/arms*PI*2+0.3, Lr=8+(k%3)*5+P.crk*3; p.cap(o,{x:o.x+Math.cos(a)*Lr,y:o.y+Math.sin(a)*Lr},0.8,0.4); }
      p.F(M.crack[1]); p.circle(o,1.4+P.crk*0.4); [6,11].forEach(r=>{ for(let k=0;k<arms;k++){ const a0=X.a+k/arms*PI*2+0.3, a1=a0+PI*2/arms; p.cap({x:o.x+Math.cos(a0)*r,y:o.y+Math.sin(a0)*r},{x:o.x+Math.cos(a1)*r*0.9,y:o.y+Math.sin(a1)*r*0.9},0.5,0.5); } });
      p.F(M.crack[0]); p.circle(o,0.7);
      if(split){ p.F(M.shield[3]); p.poly(L([[-4,2],[SW+4,-4],[SW+4,-2.6],[-4,3.6]])); }
      // sangue seco
      p.F(M.blood[1]); p.poly(L([[1,10],[7,8],[8,14],[5,20],[4,15],[2,18]])); p.F(M.blood[2]); p.rect(T(5,19).x,T(5,19).y,1.2,3);
    });
    p.F(M.rubber[1]); p.poly(L([[-3,-H2],[SW,-H2+3],[SW,-H2+4.6],[-3,-H2+1.6]])); p.poly(L([[-3,H2-1.6],[SW,H2-4.6],[SW,H2-3],[-3,H2]]));
    p.F(M.rubber[1]); p.poly(L([[-3,-H2],[-1.6,-H2],[-1.6,H2],[-3,H2]]));
  }
  // mão de trás segurando a alça por cima do escudo (punho)
  function drawGrip(c,u,M,sk){
    const p=mkPen(c,u); p.id(); const w=sk.wrB;
    p.F(M.vest[1]); p.ell(w.x+2,w.y+1,3.4,3); p.F(M.vest[0]); p.rect(w.x,w.y-1.6,3,1); p.F(M.skin[1]); p.ell(w.x+4.4,w.y+1,1.6,2.4);
  }
  function drawSmear(c,u,M,sk,P){
    const p=mkPen(c,u); p.id();
    const sh=sk.shF, w=sk.wrF, r=Math.hypot(w.x-sh.x,w.y-sh.y)+6, a1=Math.atan2(w.y-sh.y,w.x-sh.x);
    const n=10, pts=[]; for(let i=0;i<=n;i++){ const a=a1-1.6+1.65*i/n; pts.push([sh.x+Math.cos(a)*r,sh.y+Math.sin(a)*r]); }
    for(let i=n;i>=0;i--){ const a=a1-1.6+1.65*i/n, rr=r-2-7*(i/n); pts.push([sh.x+Math.cos(a)*rr,sh.y+Math.sin(a)*rr]); }
    p.F(M.baton[0]); p.poly(pts);
  }

  /* ---------- montagem ---------- */
  const cache=PIX.cache();
  function frame(form,anim,fi,step=5,Pov,pk){
    const K=PIX.getK(), key=(pk!=null?'#'+pk+'|'+form:form+'|'+anim+'|'+fi+'|'+step)+'@'+K;
    const hit=cache.get(key); if(hit){ cache.delete(key); cache.set(key,hit); return hit; }
    const P=Pov?Object.assign({},REST,Pov):poseOf(anim,fi), M=mats(form), sk=skeleton(P);
    const held=P.sh&&P.drop<=0;
    const parts=[];
    if(P.sh&&P.drop>0) parts.push({draw:(c,u)=>drawShield(c,u,M,sk,P,form)});
    parts.push({back:true, draw:(c,u)=>drawArm(c,u,M,sk,P,false)});
    parts.push({back:true, draw:(c,u)=>drawLeg(c,u,M,sk,P,false)});
    parts.push({draw:(c,u)=>drawTorso(c,u,M,sk,P,form)});
    parts.push({draw:(c,u)=>drawLeg(c,u,M,sk,P,true)});
    parts.push({draw:(c,u)=>drawHead(c,u,M,sk,P,form)});
    parts.push({draw:(c,u)=>drawJaw(c,u,M,sk,P)});
    if(held) parts.push({draw:(c,u)=>{ drawShield(c,u,M,sk,P,form); drawGrip(c,u,M,sk); }});
    if(P.smear) parts.push({noShade:true, smear:true, noRim:true, draw:(c,u)=>drawSmear(c,u,M,sk,P)});
    parts.push({draw:(c,u)=>drawArm(c,u,M,sk,P,true)});
    if(P.hoff>0) parts.push({draw:(c,u)=>drawHelmOff(c,u,M,P)});
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM[form]}); if(step>=4) heavyOutline(cv);
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._eye=sc(sk.H(9.6,-12)); cv._mouth=sc(sk.H(10,-3)); cv._hand=sc(sk.wrF); cv._head=sc(sk.H(3,-14));
    if(held){ const X=shieldXf(sk,P); cv._shield=sc({x:X.x+6,y:X.y}); }
    cache.set(key,cv); if(cache.size>1200) cache.delete(cache.keys().next().value);
    return cv;
  }
  const API={FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame,framePose:function(form,anim,P,key){ return frame(form,anim,0,5,P,key); }};
  // vista sem escudo: mesmos nomes de animação que o motor usa (idle/walk/hurt/fall...) apontando pras versões N
  const ANIMS_N={}; for(const k in MAPN) ANIMS_N[k]=ANIMS[MAPN[k]];
  const mapN=a=>MAPN[a]||a;
  API.N={FW,FH,GROUND,AX,ANIMS:ANIMS_N,NAMES,RIM,mats,semEscudo:true,
    poseOf:(a,i)=>poseOf(mapN(a),i),
    frame:(form,a,fi,step,Pov,pk)=>frame(form,mapN(a),fi,step,Pov,pk),
    framePose:(form,a,P,key)=>frame(form,mapN(a),0,5,P,String(key).replace(a,mapN(a)))};
  API.MAPN=MAPN;
  return API;
})();
