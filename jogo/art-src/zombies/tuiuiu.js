/* TUIUIU — fonte de arte (editável). Build: npm run art
   Tuiuiú Zumbi (Pantanal, comum animal — ave): a ave-símbolo do Pantanal, caída e levantada com a lua no olho.
   Anatomia do jaburu real (refs referencias/zumbis-pantanal/tuiuiu/): pernas pretas muito longas com o "joelho"
   (calcanhar) dobrando pra trás, corpo branco em ovo inclinado, pescoço grosso nu e preto com a faixa vermelha
   inchada (papo) na base, cabeça preta pequena e o bico enorme preto, reto e levemente arrebitado. Asa larga
   (primárias pretas, como pede a ficha), cauda curta. Corrupção da Lua de Sangue: olho de lua, papo rasgado
   pulsando com veias, penas faltando mostrando pele roxa e costelas, osso exposto na asa, musgo-lunar nas costas,
   bico rachado com sangue seco e ponta lascada.
   Esqueleto próprio de ave: coluna (corpo rígido com inclinação), pescoço em 3 segmentos (curva em S via hunch,
   estica via nk), cabeça+bico (jaw = mandíbula), 2 pernas (tibiotarso + tarso, calcanhar pra trás, dedos) e
   2 asas (aFs = ângulo de abertura, aFe = envergadura; dobrada quando aFe é pequeno). Nomes das juntas seguem o
   molde dos zumbis (lean, hunch, head, jaw, aFs/aFe, aBs/aBe, lFh/lFk, lBh/lBk) pra ZREACT (voando/agarrado) funcionar.
   Golpes: bicada (attack), bicada longa que perfura (lunge), voo rasante (dive) + pouso esparramado (land).
   Hi-bit: honra PIX.getK(). */
const TUIUIU=(function(){
  const {rad,lerp,compose}=PIX;
  const FW=224, FH=178, GROUND=166, AX=100;           // canvas cru (o que o motor usa)
  const AX0=92, G0=158, SC=0.97;                       // espaço de projeto do esqueleto -> ampliado SC em volta do pé
  const OX=AX-AX0*SC, OY=GROUND-G0*SC;
  function mkPen(ctx,used){ const p=PIX.mkPen(ctx,used), K=PIX.getK();
    p.id=()=>ctx.setTransform(K*SC,0,0,K*SC,OX*K,OY*K);
    p.xf=(a,ox,oy)=>{ const c=Math.cos(a), s=Math.sin(a); ctx.setTransform(c*K*SC,s*K*SC,-s*K*SC,c*K*SC,(OX+ox*SC)*K,(OY+oy*SC)*K); };
    return p; }
  const RIM={comum:'#d8e4f4', enluarado:'#9ff6ff', plenilunar:'#ffb46a'};

  /* ---------- materiais ---------- */
  function mats(form){
    const m={
      fea:['#fffef6','#e3dccf','#a297b6','#574c70'],     // pena branca (suja)
      feaD:['#cfc6c0','#a2968e','#6e6280','#3e3456'],    // pena encardida / sombra de pena
      prim:['#686676','#33313d','#211f29','#131119'],    // primárias pretas
      neck:['#5e5a6c','#2b2933','#1b1a23','#0d0c13'],    // pescoço nu preto
      pouch:['#ff6a4e','#e8102a','#9a0c2c','#4e0420'],   // papo vermelho
      bill:['#74727e','#3a3a42','#232329','#111116'],    // bico
      leg:['#64626e','#363440','#22202a','#121018'],     // pernas
      skin:['#d2a4e0','#9462b4','#5e3a80','#341c4e'],    // pele roxa (penas faltando)
      flesh:['#f6a090','#c24a56','#7a2a44','#46142e'],
      bone:['#fff4d8','#dccfa6','#a09070','#605040'],
      moss:['#d4ffb0','#7ed08a','#3e8a6a','#1e4a44'],    // musgo-lunar
      vein:['#ffd0e0','#ff6a8a','#b02a5a','#5a1236'],
      eye:['#ffffff','#f0f6ff','#b0c8ff','#5a6aa8'],
      mouth:['#7c2e3e','#4c1828','#2e0c1a','#1a0610'],
      dirt:['#b8a27a','#86704e','#5c4a36','#352a20'],
      blood:['#c84a3e','#8e2a2c','#5e1824','#3a0e1a'],
      acid:['#e8ffb0','#a8e05a','#5e9a3a','#2e5222'],
      glow:['#fffbe8','#fff2a0','#e8c860','#9a7a30'],
      swish:['#fdfdff','#e6f0ff','#b4c4e8','#7484b0'],
    };
    if(form==='enluarado'){
      m.fea=['#f4faff','#cfd8f2','#8e96c4','#4c4f84']; m.feaD=['#c2c8e8','#9298c8','#62669c','#383a6c'];
      m.prim=['#5e6488','#2c2f4c','#1c1e36','#100f22']; m.neck=['#565e80','#262a40','#181a2e','#0c0c1a'];
      m.pouch=['#ff8ab0','#c8306a','#7e1c50','#440e30']; m.bill=['#6c7896','#343a52','#20243a','#101222'];
      m.leg=['#5c6284','#30344c','#1e2036','#100f20'];
      m.skin=['#c8c0ff','#8a7ae0','#5646a8','#2e2470']; m.flesh=['#f0b0ff','#b866d8','#7a3a9e','#46206a'];
      m.blood=['#b46ad8','#7e3ea6','#542474','#34144a']; m.vein=['#c8fbff','#4ad8f0','#2a8ab0','#1a4a7a'];
      m.moss=['#d0fff8','#6ae4e0','#2a9ab0','#16507a'];
      m.eye=['#ffffff','#b8fbff','#4ad8f0','#1a8aa8']; m.glow=['#effffe','#7af4ff','#2ab0d8','#146a96']; m.swish=['#ffffff','#c8fbff','#6ae4f4','#2a9ab8'];
      m.dirt=['#a8a0c8','#76709a','#4e4a70','#2e2a48'];
    }
    if(form==='plenilunar'){
      m.fea=['#fff0dc','#e8cbb4','#b4847e','#6a3c4a']; m.feaD=['#d49a84','#a8625a','#743844','#44182a'];
      m.prim=['#6e4a4a','#3a2228','#26141a','#16080e']; m.neck=['#64444c','#30202a','#1e141c','#100810'];
      m.pouch=['#ffb45a','#ff5a26','#b02a1a','#5e1210']; m.bill=['#7a5c5c','#3e2a2e','#28181c','#140a0e'];
      m.leg=['#6a4e52','#3a2a30','#24181e','#140a10'];
      m.skin=['#ffbca0','#e0705e','#a03a46','#5a1a30']; m.flesh=['#ffc07a','#f06a3a','#a8302e','#5e1422'];
      m.blood=['#ff7a3a','#d43a26','#8a1c22','#4e0c18']; m.vein=['#fff0a0','#ffb43a','#e0581e','#8a2414'];
      m.moss=['#ffe0a0','#e09a4a','#a0562e','#5a2a1e'];
      m.eye=['#fffbe0','#ffe04a','#ff8a2a','#b83a14']; m.glow=['#fff6c0','#ffb43a','#e0581e','#8a2414']; m.swish=['#fffbe6','#ffe6a8','#ffb460','#d0602a'];
      m.dirt=['#b4705a','#844a3e','#5a2e2e','#36181e'];
    }
    return punch(m);
  }
  const NAMES={fea:'Pena branca',feaD:'Pena encardida',prim:'Primárias',neck:'Pescoço nu',pouch:'Papo vermelho',bill:'Bico',leg:'Pernas',skin:'Pele sem penas',flesh:'Carne',bone:'Osso',moss:'Musgo-lunar',vein:'Veias',eye:'Olho de lua',mouth:'Boca',dirt:'Lama',blood:'Sangue',acid:'Ácido',glow:'Brilho',swish:'Rastro do golpe'};
  function sat(h,k){ const [r,g,b]=PIX.hexRgb(h), y=(r+g+b)/3; return PIX.toHex(y+(r-y)*k,y+(g-y)*k,y+(b-y)*k); }
  const NOPUNCH={swish:1,glow:1,eye:1};
  function punch(m){ const o={}; for(const k in m){ const r=m[k]; o[k]=NOPUNCH[k]?[r[0],r[1],r[2],r[3]]:[sat(r[0],1.15),sat(r[1],1.3),PIX.mix(sat(r[2],1.25),'#2a1050',0.3),PIX.mix(r[3],'#12062a',0.45)]; } return o; }

  /* ---------- poses ---------- */
  // lean = inclinação do corpo (+ = frente pra baixo) · hunch = curva em S do pescoço (+ recolhe) · nk = pescoço pra frente
  // head = ângulo da cabeça/bico · jaw = abertura do bico · aFs/aBs = abertura da asa (0 dobrada pra trás, 90 pra cima,
  // negativo pra baixo) · aFe/aBe = envergadura (0 dobrada … 120 aberta) · lFh/lFk = tibiotarso/tarso (0 = vertical,
  // + = pra frente) · fF/fB = dedos · pulse = papo pulsando · smear 1 = rastro do bico, 2 = rastro do rasante ·
  // feath = penas espalhadas no chão (morte)
  const REST={hx:0,lift:0,rot:0,lean:4,hunch:10,nk:14,head:14,jaw:12,aFs:0,aFe:0,aBs:0,aBe:0,lFh:-3,lFk:4,lBh:-3,lBk:4,fF:0,fB:0,pulse:0,flash:0,smear:0,feath:0};
  const S=Math.sin, C=Math.cos, PI=Math.PI, mx=Math.max, mn=Math.min;
  const FLY={lean:2,nk:74,hunch:-8,head:-24,jaw:6,lFh:-74,lFk:-92,lBh:-80,lBk:-96,fF:-60,fB:-60};
  const ANIMS={
    idle:{nome:'Parado (solene, pescoço em S, bico entreaberto)',n:8,dur:()=>160,pose:i=>{ const p=i/8*PI*2, s=S(p);
      return {hx:0.6*s, lean:4+1.5*S(p+0.5), hunch:10+3*S(p), nk:14+2*S(p-0.6), head:14+3*S(p-1.2), jaw:12+6*mx(0,S(p*2)), pulse:mx(0,S(p*2+0.4)),
        aFs:6+3*mx(0,S(p)), aFe:10+4*mx(0,S(p)), lFh:-3+2*s, lFk:4+2*s, lBh:-3-2*s, lBk:4-1.5*s, fF:i===3||i===4?-8:0}; }},
    walk:{nome:'Andar (passada longa e solene)',n:8,dur:()=>135,pose:i=>{ const p=i/8*PI*2;
      const lFh=-2+18*S(p), lBh=-2+18*S(p+PI);
      return {lFh, lFk:lFh+6-48*mx(0,C(p)), lBh, lBk:lBh+6-48*mx(0,C(p+PI)), fF:-34*mx(0,C(p)), fB:-34*mx(0,C(p+PI)),
        lean:6+2*S(2*p), hunch:10+4*S(2*p+0.8), nk:16+8*S(2*p+0.3), head:14-3*S(2*p+0.3), jaw:12+4*mx(0,S(2*p)), hx:1.2*S(p), lift:1.4*mx(0,S(2*p+PI/2)),
        aFs:8+3*S(2*p), aFe:12+4*S(2*p), pulse:0.5+0.5*S(2*p)}; }},
    alert:{nome:'Alerta (bate o bico: clac-clac)',n:7,dur:i=>[150,90,90,90,90,140,170][i],pose:i=>[
      {head:-6,hunch:8,nk:-4,jaw:10},
      {head:-24,hunch:2,nk:-10,jaw:36,lean:-18,aFs:24,aFe:36,aBs:20,aBe:30,pulse:1},
      {head:-20,hunch:2,nk:-10,jaw:0,lean:-18,aFs:30,aFe:50,aBs:26,aBe:44,flash:0},
      {head:-26,hunch:0,nk:-12,jaw:40,lean:-20,aFs:34,aFe:60,aBs:30,aBe:50,pulse:1},
      {head:-20,hunch:0,nk:-12,jaw:0,lean:-20,aFs:30,aFe:56,aBs:26,aBe:46},
      {head:-10,hunch:6,nk:0,jaw:20,lean:-14,aFs:14,aFe:24,pulse:0.6},
      {head:-2,hunch:12,jaw:8}][i]},
    // ---- golpes (hit = quadro do dano; warn = quadros de aviso; reach = alcance em px lógicos) ----
    attack:{nome:'Bicada (pescoço recua em S e dispara)',n:9,hit:4,warn:[0,3],reach:40,dur:i=>[70,60,60,70,60,120,120,130,150][i],pose:i=>[
      {lean:-16,hunch:22,nk:-10,head:-4,jaw:8},
      {lean:-20,hunch:30,nk:-20,head:-8,jaw:12,aFs:14,aFe:26,lFh:-8,lBh:2},
      {lean:-22,hunch:34,nk:-24,head:-10,jaw:16,aFs:18,aFe:34,lFh:-10,lBh:4},
      {lean:-22,hunch:36,nk:-26,head:-10,jaw:18,aFs:20,aFe:36,lFh:-10,lBh:4,hx:-1},
      {lean:8,hunch:-12,nk:70,head:-22,jaw:2,hx:4,smear:1,aFs:34,aFe:60,aBs:40,aBe:64,lFh:10,lFk:14,lBh:-14,lBk:-6},
      {lean:6,hunch:-10,nk:66,head:-18,jaw:30,hx:4,aFs:30,aFe:54,aBs:36,aBe:58,lFh:10,lFk:14,lBh:-14,lBk:-6},
      {lean:-2,hunch:0,nk:40,head:-10,jaw:16,hx:2,aFs:20,aFe:40,lFh:4,lBh:-8},
      {lean:-8,hunch:8,nk:14,head:-4,jaw:8,aFs:10,aFe:24},
      {lean:-11,hunch:12,nk:4,jaw:5}][i]},
    lunge:{nome:'Bicada longa (corpo e pescoço se estendem, perfura)',n:8,hit:4,warn:[0,3],reach:100,dur:i=>[100,100,100,100,60,170,150,150][i],pose:i=>[
      {lean:-20,hunch:24,nk:-16,head:-4,jaw:6,lFh:-10,lFk:-4,lBh:6,lBk:12},
      {lean:-24,hunch:32,nk:-24,head:-6,jaw:10,aFs:20,aFe:40,aBs:16,aBe:34,lFh:-14,lFk:-10,lBh:8,lBk:14},
      {lean:-26,hunch:36,nk:-28,head:-8,jaw:12,aFs:24,aFe:46,aBs:20,aBe:40,lFh:-16,lFk:-14,lBh:10,lBk:14,hx:-2},
      {lean:-27,hunch:37,nk:-29,head:-8,jaw:14,aFs:26,aFe:50,aBs:22,aBe:44,lFh:-16,lFk:-14,lBh:10,lBk:14,hx:-3,pulse:1},
      {lean:20,hunch:-14,nk:80,head:-30,jaw:2,hx:12,smear:1,lFh:30,lFk:16,lBh:-34,lBk:-24,fB:-30,aFs:44,aFe:96,aBs:54,aBe:96},
      {lean:20,hunch:-14,nk:80,head:-30,jaw:10,hx:13,lFh:30,lFk:16,lBh:-34,lBk:-24,fB:-30,aFs:40,aFe:90,aBs:50,aBe:90},
      {lean:6,hunch:0,nk:42,head:-12,jaw:8,hx:7,lFh:14,lFk:10,lBh:-16,lBk:-10,aFs:22,aFe:50},
      {lean:-8,hunch:10,nk:10,head:-4,jaw:5,hx:2,aFs:8,aFe:16}][i]},
    // z = altura de voo por quadro (px lógicos; o motor ergue o zumbi e deixa a sombra no chão)
    dive:{nome:'Voo rasante (decola, plana em linha reta, pousa)',n:10,warn:[0,3],fly:[4,8],land:9,reach:280,
      z:[0,0,0,6,26,32,33,31,20,0],dur:i=>[130,130,120,120,110,110,110,110,110,120][i],pose:i=>[
      {lean:-6,hunch:8,nk:10,head:-6,jaw:10,lFh:8,lFk:-18,lBh:4,lBk:-22,aFs:30,aFe:60,aBs:26,aBe:56,lift:-3},
      {lean:-2,hunch:4,nk:20,head:-10,jaw:14,lFh:18,lFk:-40,lBh:14,lBk:-44,aFs:112,aFe:124,aBs:118,aBe:124,lift:-6,pulse:1},
      {lean:0,hunch:2,nk:30,head:-14,jaw:10,lFh:20,lFk:-46,lBh:16,lBk:-50,aFs:70,aFe:124,aBs:76,aBe:124,lift:-7},
      {lean:2,hunch:-2,nk:46,head:-18,jaw:8,lFh:-20,lFk:-40,lBh:-26,lBk:-46,fF:-40,fB:-40,aFs:-46,aFe:124,aBs:-40,aBe:124},
      Object.assign({},FLY,{aFs:104,aFe:124,aBs:110,aBe:124}),
      Object.assign({},FLY,{aFs:48,aFe:124,aBs:54,aBe:124,smear:2}),
      Object.assign({},FLY,{aFs:-52,aFe:124,aBs:-46,aBe:124,smear:2}),
      Object.assign({},FLY,{aFs:18,aFe:124,aBs:24,aBe:124,smear:2,jaw:20}),
      Object.assign({},FLY,{aFs:96,aFe:124,aBs:102,aBe:124,lFh:-30,lFk:-30,lBh:-36,lBk:-40,fF:-10,fB:-10,lean:-8,nk:44}),
      {lean:-6,hunch:6,nk:30,head:-8,jaw:16,lFh:24,lFk:22,lBh:-10,lBk:6,aFs:120,aFe:116,aBs:124,aBe:116,lift:-2}][i]},
    land:{nome:'Pouso esparramado (vulnerável)',n:5,dur:()=>160,pose:i=>[
      {lean:22,hunch:22,nk:16,head:34,jaw:24,lFh:30,lFk:-54,lBh:-36,lBk:-74,fB:-40,aFs:-62,aFe:124,aBs:-56,aBe:124,lift:-12,flash:0},
      {lean:20,hunch:24,nk:14,head:38,jaw:30,lFh:30,lFk:-54,lBh:-36,lBk:-74,fB:-40,aFs:-66,aFe:124,aBs:-60,aBe:124,lift:-13},
      {lean:16,hunch:22,nk:12,head:30,jaw:20,lFh:26,lFk:-48,lBh:-32,lBk:-68,fB:-36,aFs:-34,aFe:110,aBs:-30,aBe:110,lift:-11},
      {lean:6,hunch:18,nk:6,head:16,jaw:12,lFh:14,lFk:-20,lBh:-14,lBk:-30,aFs:-10,aFe:70,aBs:-6,aBe:64,lift:-6},
      {lean:-8,hunch:14,nk:2,head:4,jaw:8,lFh:0,lFk:2,lBh:-4,lBk:0,aFs:6,aFe:20,lift:-1}][i]},
    hurt:{nome:'Dano (cabeça)',n:4,dur:i=>[80,110,130,150][i],pose:i=>[
      {lean:-24,hunch:0,nk:-14,head:-26,jaw:30,aFs:24,aFe:46,aBs:20,aBe:40,hx:-5,flash:1,lFh:-10,lBh:4},
      {lean:-20,hunch:4,nk:-10,head:-20,jaw:24,aFs:20,aFe:36,hx:-4,lFh:-8,lBh:2},
      {lean:-15,hunch:10,nk:-4,head:-8,jaw:14,aFs:8,aFe:14,hx:-2},
      {lean:-12,hunch:13,jaw:6}][i]},
    hurtB:{nome:'Dano (corpo, dobra)',n:4,dur:i=>[80,120,140,150][i],pose:i=>[
      {lean:16,hunch:34,nk:8,head:30,jaw:34,aFs:46,aFe:90,aBs:52,aBe:90,hx:-6,flash:1,lFh:8,lFk:-10,lBh:-12,lBk:-20,pulse:1},
      {lean:12,hunch:30,nk:6,head:26,jaw:30,aFs:40,aFe:80,aBs:44,aBe:80,hx:-5,lFh:6,lFk:-8,lBh:-10,lBk:-18},
      {lean:0,hunch:22,nk:2,head:12,jaw:16,aFs:18,aFe:36,hx:-2},
      {lean:-10,hunch:15,jaw:6}][i]},
    fall:{nome:'Derrubado (tomba de lado, asa esparramada, pescoço caído)',n:6,dur:i=>[90,90,100,110,150,260][i],pose:i=>[
      {lean:-24,hunch:2,nk:-10,head:-24,jaw:34,aFs:60,aFe:90,aBs:66,aBe:90,hx:-6,flash:1,lFh:10,lBh:-6},
      {rot:-14,lean:-10,hunch:8,nk:20,head:0,jaw:30,aFs:110,aFe:110,aBs:120,aBe:110,hx:-4,lFh:40,lFk:20,lBh:24,lBk:6},
      {rot:-10,lean:0,hunch:0,nk:60,head:30,jaw:34,aFs:40,aFe:124,aBs:130,aBe:110,hx:0,lFh:80,lFk:60,lBh:64,lBk:40,lift:-2},
      {rot:-8,lean:6,hunch:-4,nk:90,head:50,jaw:30,aFs:-10,aFe:124,aBs:110,aBe:96,hx:3,lFh:-60,lFk:-80,lBh:-56,lBk:-74,fF:-60,fB:-50,lift:-3},
      {rot:-6,lean:6,hunch:-6,nk:94,head:54,jaw:24,aFs:-22,aFe:120,aBs:100,aBe:88,hx:4,lFh:-80,lFk:-94,lBh:-74,lBk:-88,fF:-70,fB:-64},
      {rot:-6,lean:6,hunch:-6,nk:96,head:56,jaw:22,aFs:-26,aFe:116,aBs:96,aBe:84,hx:4,lFh:-84,lFk:-96,lBh:-78,lBk:-90,fF:-74,fB:-66,pulse:0.4}][i]},
    getup:{nome:'Levantar (bate as asas)',n:6,dur:i=>[200,150,150,160,160,150][i],pose:i=>[
      {rot:-6,lean:6,hunch:-6,nk:96,head:56,jaw:22,aFs:-26,aFe:116,aBs:96,aBe:84,hx:4,lFh:-84,lFk:-96,lBh:-78,lBk:-90,fF:-74,fB:-66,pulse:0.4},
      {rot:-6,lean:10,hunch:16,nk:30,head:14,jaw:20,aFs:40,aFe:124,aBs:110,aBe:120,hx:0,lFh:40,lFk:-40,lBh:30,lBk:-50,lift:-4},
      {rot:-22,lean:4,hunch:16,head:10,jaw:16,aFs:118,aFe:124,aBs:124,aBe:124,hx:-4,lFh:30,lFk:-40,lBh:10,lBk:-40,lift:-6},
      {rot:0,lean:10,hunch:20,head:8,jaw:12,aFs:-30,aFe:124,aBs:-24,aBe:124,hx:-2,lFh:16,lFk:-30,lBh:-6,lBk:-34,lift:-6},
      {rot:0,lean:-4,hunch:16,head:2,jaw:10,aFs:30,aFe:60,aBs:26,aBe:50,lFh:4,lFk:-6,lBh:-6,lBk:-4,lift:-2},
      {lean:-11,hunch:14,jaw:6,aFs:6,aFe:10}][i]},
    death:{nome:'Morte (asa quebrada, cai de bico, penas espalham)',n:8,dur:i=>[90,150,160,170,150,140,160,600][i],pose:i=>[
      {lean:-24,hunch:0,nk:-14,head:-28,jaw:40,aFs:40,aFe:80,aBs:44,aBe:80,hx:-5,flash:1,lFh:-10,lBh:4},
      {lean:-18,hunch:4,nk:-8,head:-30,jaw:46,aFs:150,aFe:70,aBs:60,aBe:110,hx:-6,lFh:-8,lBh:6,feath:0.15,pulse:1},
      {lean:8,hunch:20,nk:10,head:10,jaw:40,aFs:-60,aFe:60,aBs:30,aBe:90,hx:-3,lFh:20,lFk:-20,lBh:-10,lBk:-30,feath:0.35},
      {lean:22,hunch:24,nk:20,head:28,jaw:36,aFs:-80,aFe:50,aBs:10,aBe:80,hx:0,lFh:30,lFk:-50,lBh:-6,lBk:-60,feath:0.55},
      {rot:8,lean:30,hunch:16,nk:34,head:40,jaw:36,aFs:-90,aFe:50,aBs:20,aBe:80,hx:2,lFh:30,lFk:-40,lBh:0,lBk:-50,lift:-4,feath:0.7},
      {rot:12,lean:34,hunch:6,nk:52,head:52,jaw:30,aFs:-40,aFe:70,aBs:60,aBe:70,hx:6,lFh:44,lFk:-70,lBh:30,lBk:-80,fF:-60,fB:-60,feath:0.85},
      {rot:10,lean:36,hunch:2,nk:58,head:56,jaw:26,aFs:-24,aFe:80,aBs:80,aBe:60,hx:8,lFh:50,lFk:-86,lBh:40,lBk:-90,fF:-80,fB:-80,feath:0.95},
      {rot:10,lean:38,hunch:0,nk:60,head:60,jaw:24,aFs:-20,aFe:84,aBs:86,aBe:56,hx:8,lFh:52,lFk:-88,lBh:42,lBk:-92,fF:-82,fB:-82,feath:1}][i]},
  };
  const EXK=['hx','lean','hunch','nk','head','aFs','aFe','aBs','aBe','lFh','lFk','lBh','lBk'];
  function exag(P,f){ if(f===1||Math.abs(P.rot)>4) return P; EXK.forEach(k=>{ P[k]=REST[k]+(P[k]-REST[k])*f; }); P.jaw=mn(50,mx(0,REST.jaw+(P.jaw-REST.jaw)*f)); P.aFe=mn(126,P.aFe); P.aBe=mn(126,P.aBe); return P; }
  const EXF={idle:1.04,walk:1.08,alert:1.12,attack:1.15,lunge:1.08,dive:1.04,land:1.05,hurt:1.25,hurtB:1.2,fall:1.05,getup:1.05,death:1.05};
  ZREACT.add(ANIMS,REST,{}); // tumble (voando) e grabbed (agarrado) no molde comum
  function poseOf(anim,i){ const A=ANIMS[anim]; return exag(Object.assign({},REST,A.pose(i)),EXF[anim]||1); }
  function heavyOutline(cv){ const g=cv.getContext('2d'), W=cv.width, H=cv.height, im=PIX.pix(cv), d=im.data;
    const isO=i=>d[i+3]===255&&d[i]===0x17&&d[i+1]===0x0b&&d[i+2]===0x1c, fill=i=>d[i+3]===255&&!isO(i);
    const add=[]; for(let y=2;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(d[i+3]) continue; const u=((y-1)*W+x)*4, u2=((y-2)*W+x)*4; if(isO(u)&&fill(u2)) add.push(i); }
    add.forEach(i=>{ d[i]=0x17; d[i+1]=0x0b; d[i+2]=0x1c; d[i+3]=255; }); g.putImageData(im,0,0); }

  /* ---------- esqueleto de ave ---------- */
  const BS=1.3, TB=28, TS=28, NL1=15, NL2=15, NL3=12;
  const lp=(p,a,L)=>({x:p.x+S(rad(a))*L, y:p.y+C(rad(a))*L});   // 0 = pra baixo, + = pra frente
  const upv=(p,t,L)=>({x:p.x+S(rad(t))*L, y:p.y-C(rad(t))*L});  // 0 = pra cima, + = pra frente
  const add=(p,v,k)=>({x:p.x+v.x*k, y:p.y+v.y*k});
  const rotA=(p,o,a)=>{ const c=C(a), s=S(a), dx=p.x-o.x, dy=p.y-o.y; return {x:o.x+dx*c-dy*s, y:o.y+dx*s+dy*c}; };
  function wingGeo(A,ws,ra,sp){
    const s=mx(0,mn(1.05,sp/120));
    if(s<0.28) return {folded:true,s,ra,ws};
    const phi=PI+rad(A+ra), d={x:C(phi),y:S(phi)}, fw={x:C(rad(A)),y:S(rad(A))};
    let n={x:-d.y,y:d.x}; const dot=n.x*fw.x+n.y*fw.y;
    if(Math.abs(d.x*fw.x+d.y*fw.y)>0.9){ if(n.y<0) n={x:-n.x,y:-n.y}; } else if(dot>0) n={x:-n.x,y:-n.y};
    const L1=12+15*s, L2=14+24*s, wr=add(ws,d,L1), bend=rad((1-s)*34+6);
    const d2={x:d.x*C(bend)+n.x*S(bend), y:d.y*C(bend)+n.y*S(bend)};
    const tip=add(wr,d2,L2);
    return {folded:false,s,ws,d,n,d2,wr,tip,L1,L2};
  }
  function build(P,dy){
    const R=P.rot, hip={x:AX0+P.hx, y:dy}, A=R+P.lean, a=rad(A);
    const fw={x:C(a),y:S(a)}, up={x:S(a),y:-C(a)};
    const B=(u,v)=>({x:hip.x+(fw.x*u+up.x*v)*BS, y:hip.y+(fw.y*u+up.y*v)*BS});
    const hipF=B(3,6), hipB=B(-3,6.5);
    const heelF=lp(hipF,P.lFh-R,TB), ankF=lp(heelF,P.lFk-R,TS), heelB=lp(hipB,P.lBh-R,TB), ankB=lp(heelB,P.lBk-R,TS);
    const k=R+P.lean*0.5;
    const t1=25+P.nk+k+P.hunch*0.9, t2=-5+P.nk+k-P.hunch*1.4, t3=10+P.nk+k+P.hunch*0.5;
    const n0=B(16,18.5), n1=upv(n0,t1,NL1), n2=upv(n1,t2,NL2), n3=upv(n2,t3,NL3);
    const ha=rad(24+P.head+R+P.lean*0.3), hc=C(ha), hs=S(ha);
    const H=(x,y)=>({x:n3.x+x*hc-y*hs, y:n3.y+x*hs+y*hc});
    const wsF=B(6,20), wsB=B(8,22);
    const wF=wingGeo(A,wsF,P.aFs,P.aFe), wB=wingGeo(A,wsB,P.aBs,P.aBe);
    const toe=(an,f)=>{ const t=rad(f+R); return {x:an.x+10*C(t), y:an.y+10*S(t)}; };
    const toeF=toe(ankF,P.fF), toeB=toe(ankB,P.fB);
    const hull=[[ankF,1.6],[ankB,1.6],[toeF,0.8],[toeB,0.8],[heelF,2],[heelB,2],[B(0,-1),1],[B(-22,6),1],[B(16,4),1],[B(-30,10),1],[B(6,25),1],[H(35,-1),1],[H(2,-2),6]];
    [wF,wB].forEach(g=>{ if(!g.folded){ hull.push([g.tip,1],[g.wr,1]); } });
    return {R,A,fw,up,hip,B,hipF,hipB,heelF,ankF,heelB,ankB,toeF,toeB,n0,n1,n2,n3,ha,H,wsF,wsB,wF,wB,hull};
  }
  function skeleton(P){
    const a=build(P,0); let m=-1e9; a.hull.forEach(([p,r])=>{ m=mx(m,p.y+r); });
    return build(P,G0-m-(P.lift||0));
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
  const PT=q=>[q.x,q.y];
  const off=(q,n,k)=>({x:q.x+n.nx*k,y:q.y+n.ny*k});
  function erase(c,fn){ c.save(); c.globalCompositeOperation='destination-out'; fn(); c.restore(); }

  /* ---------- asa ---------- */
  // dobrada: forma no referencial do corpo, girada em volta do ombro pela abertura (ra)
  // uma pena: base a -> ponta b, largura w; preenchimento + sombra do lado de baixo + brilho de cima + raque
  function feather(p,R,a,b,w,o){ o=o||{};
    const dx=b.x-a.x, dy=b.y-a.y, L=Math.hypot(dx,dy)||1, ux=dx/L, uy=dy/L; let nx=-uy, ny=ux; if(ny<0){ nx=-nx; ny=-ny; }
    const P=(t,k)=>[a.x+dx*t+nx*k*w/2, a.y+dy*t+ny*k*w/2];
    p.F(R[1]); p.poly([P(0,-1),P(0.78,-1),P(0.95,-0.55),P(1,0),P(0.95,0.55),P(0.78,1),P(0,1)]);
    p.F(R[2]); p.poly([P(0.05,0.15),P(0.8,0.2),P(0.95,0.5),P(0.78,1),P(0.05,1)]);
    if(o.deep!==false){ p.F(R[3]); p.poly([P(0.4,0.78),P(0.8,0.8),P(0.78,1),P(0.4,1)]); }
    p.F(R[0]); p.poly([P(0.08,-0.85),P(0.7,-0.8),P(0.7,-0.45),P(0.08,-0.5)]);
    if(o.rq){ const r0=P(0.05,0), r1=P(0.85,0.05); p.F(o.rq); p.cap({x:r0[0],y:r0[1]},{x:r1[0],y:r1[1]},0.45,0.35); }
  }
  // escama de pena (crescente): sombra embaixo, corpo, brilho em cima
  function scale(p,M,q,rx,ry,ang,R){ R=R||M.fea; p.F(R[2]); p.ell(q.x,q.y+ry*0.45,rx,ry,ang); p.F(R[1]); p.ell(q.x,q.y-ry*0.15,rx*0.9,ry*0.8,ang); p.F(R[0]); p.ell(q.x-rx*0.25,q.y-ry*0.55,rx*0.45,ry*0.28,ang); }
  // dobrada: penas em camadas no referencial do corpo, girada em volta do ombro pela abertura (ra)
  function drawFolded(c,p,M,sk,g,front,form){
    const B=sk.B, o=g.ws, ra=rad(g.ra), lift=g.s*10, dv=front?0:1.8, ang=rad(sk.A+g.ra);
    const W=(u,v)=>rotA(B(u,v+dv+(u<0?-u*lift*0.02:0)),o,ra);
    const Q=l=>l.map(([u,v])=>PT(W(u,v)));
    // primárias: 5 penas pretas empilhadas, pontas separadas
    p.F(M.prim[2]); p.poly(Q([[-16,18.4],[-24,16.8],[-33,13],[-41,10],[-37,8.4],[-27,8.8],[-16,10]]));
    for(let k=0;k<5;k++) feather(p,M.prim,W(-15-k*0.6,17-k*1.6),W(-41+k*2.6,10.4-k*0.5),4.4,{rq:M.prim[0]});
    if(!front) return;
    const outer=[[13,19],[8,22.6],[-2,23.6],[-14,21.8],[-22,18],[-25,13],[-21,10],[-3,10.6],[7,12.4],[13,15]];
    p.F(M.fea[2]); p.poly(Q(outer));
    // secundárias: 6 penas brancas inclinadas pra trás (a da frente cobre a de trás)
    for(let k=5;k>=0;k--) feather(p,M.fea,W(9-k*4.2,17.6),W(-6-k*3.6,11-k*0.2),6.2,{rq:M.feaD[1]});
    clip(c,Q(outer),()=>{
      // coberteiras maiores: fileira de escamas
      p.F(M.fea[1]); p.poly(Q([[13,19],[8,22.6],[-2,23.6],[-14,21.8],[-18,18.6],[-10,17],[2,16.4],[12,16.4]]));
      for(let k=5;k>=0;k--) scale(p,M,W(10-k*5,17.2+(k%2)*0.5),3.4,2.1,ang);
      // coberteiras menores (2 fileiras) e dorso iluminado
      for(let r=1;r>=0;r--) for(let k=0;k<4;k++) scale(p,M,W(8-k*5.4-r*2.7,20.4+r*2),2.6,1.5,ang);
      p.F(M.fea[0]); p.poly(Q([[12.4,18.8],[7,21.8],[-3,22.8],[-3,22.2],[6,21],[11.6,18.4]]));
      p.F(M.feaD[0]); [[-6,21.4],[2,22],[-12,20]].forEach(([u,v])=>{ const q=W(u,v); p.rect(q.x-0.5,q.y-0.4,1,0.7); });
      // corrupção: penas faltando com pele roxa e osso
      p.F(M.skin[3]); p.poly(Q([[-5,16.6],[-2,18],[1.6,16.8],[2.4,15],[-0.6,13.8],[-3,15],[-5.4,14.6]]));
      p.F(M.skin[2]); p.poly(Q([[-4.2,16.2],[-2,17.2],[1,16.4],[1.6,15.2],[-0.6,14.4],[-3,15.4]]));
      p.F(M.skin[1]); p.poly(Q([[-2.6,16.4],[-0.6,16.6],[0,16],[-2,15.8]]));
      p.F(M.bone[2]); { const a=W(-4.6,15.8), b=W(2.4,16.8); p.cap(a,b,1.5,1.3); }
      p.F(M.bone[1]); { const a=W(-4.4,16.2), b=W(2.2,17.2); p.cap(a,b,1,0.9); p.F(M.bone[0]); p.circle(b,0.8); }
      p.F(M.skin[0]); { const q=W(-1.6,15.2); p.rect(q.x-0.4,q.y-0.4,0.8,0.6); }
      p.F(M.dirt[2]); { const q=W(-12,12.2); p.ell(q.x,q.y,2.8,1.2,ang); } p.F(M.dirt[1]); { const q=W(-11.4,12.6); p.ell(q.x,q.y,1.6,0.6,ang); }
      if(form==='plenilunar'){ p.F(M.blood[2]); p.poly(Q([[-21,14],[-10,11.2],[-3,11],[-3,12.6],[-12,13.4],[-19,16]])); p.F(M.blood[1]); p.poly(Q([[-16,13.4],[-9,12],[-5,12],[-10,13]])); p.F(M.blood[2]); p.poly(Q([[6,13],[10,14],[9,15],[5,14.2]])); }
      p.F(M.feaD[2]); [[13,15,-3,10.8],[-3,10.8,-21,10.2]].forEach(([u0,v0,u1,v1])=>p.cap(W(u0,v0),W(u1,v1),1.2,1.1));
      if(form==='enluarado'){ p.F(M.glow[1]); p.poly(Q([[-8,20.6],[-4,18.6],[-2,19],[-6,21]])); p.poly(Q([[-14,16],[-11,14],[-10.4,14.6],[-13.4,16.6]])); p.F(M.glow[0]); { const q=W(-5,19.6); p.rect(q.x-0.4,q.y-0.4,0.8,0.8); } }
    });
  }
  function drawOpen(c,p,M,sk,g,front,form){
    const {ws,d,n,d2,wr,tip,s,L2}=g, m=lerp(ws,wr,0.5);
    const e=add(m,n,-1.4), h=add(lerp(wr,tip,0.5),n,-0.8);
    const rootB=sk.B(-15,front?20:22), tw=add(wr,n,6+14*s), tm=add(m,n,7+12*s);
    // primárias: 7 dedos (base branca, ponta preta) abrindo em leque do punho
    for(let i=6;i>=0;i--){
      const t=i/6, b=lerp(wr,tw,t*0.92), en=lerp(tip,add(tw,d2,L2*0.6),t);
      p.F(M.prim[1]); p.cap(b,en,5.2-t*0.8,3);
      if(i%2) { p.F(M.prim[2]); p.cap(add(lerp(b,en,0.55),n,1.4),add(en,n,1),1,0.8); }
      p.F(M.prim[0]); p.cap(add(lerp(b,en,0.5),n,-1.2),add(lerp(b,en,0.9),n,-0.9),0.6,0.5);
      p.F(M.fea[1]); p.cap(b,lerp(b,en,0.42),5.2-t*0.8,4);
      p.F(M.fea[2]); p.cap(add(b,n,1.2),add(lerp(b,en,0.42),n,1),1.4,1.2);
    }
    // secundárias brancas (borda de trás serrilhada), raiz larga presa no dorso
    const sec=[PT(ws),PT(e),PT(wr),PT(tw),PT(tm),PT(rootB)];
    p.F(M.fea[1]); p.poly(sec);
    for(let k=0;k<=6;k++){ const q=k<=3?lerp(tw,tm,k/3):lerp(tm,rootB,(k-3)/3.4), dd=k<=3?d:{x:(rootB.x-tm.x)/9,y:(rootB.y-tm.y)/9};
      const L=Math.hypot(dd.x,dd.y)||1, u={x:dd.x/L,y:dd.y/L}; p.poly([PT(add(q,u,-1.8)),PT(add(q,n,2.4)),PT(add(q,u,1.8))]); }
    clip(c,sec.concat([PT(add(tw,n,3))]),()=>{
      p.F(M.fea[2]); p.poly([PT(add(ws,n,7)),PT(add(wr,n,9)),PT(add(tw,n,4)),PT(add(tm,n,4)),PT(add(rootB,n,3))]); // metade de trás na sombra
      for(let k=0;k<6;k++){ const a=add(lerp(ws,wr,0.05+k/6.2),n,6), b=lerp(rootB,tw,0.12+k*0.17); feather(p,M.fea,a,add(b,n,1.5),5.6,{rq:M.feaD[1],deep:false}); }
      // coberteiras (borda de ataque) em duas fileiras de escamas
      p.F(M.fea[0]); p.poly([PT(ws),PT(e),PT(wr),PT(add(wr,n,6)),PT(add(m,n,7)),PT(add(ws,n,6))]);
      p.F(M.fea[2]); for(let r=0;r<2;r++) for(let k=0;k<4;k++){ const q=add(lerp(ws,wr,0.12+k*0.24+r*0.1),n,3.4+r*3); p.cap(add(q,d,-1.6),add(q,d,1.2),0.7,0.6); }
      if(front){ // pele roxa sem pena + osso exposto (ulna)
        const a=add(lerp(ws,wr,0.3),n,8.5), b=add(lerp(ws,wr,0.85),n,9);
        p.F(M.skin[2]); p.cap(a,b,5.4,4.6); p.F(M.skin[1]); p.cap(add(a,n,-0.6),add(b,n,-0.6),3.6,3.2);
        p.F(M.bone[1]); p.cap(a,b,1.7,1.5); p.F(M.bone[0]); p.circle(a,1.3); p.circle(b,1.2); p.F(M.bone[2]); p.cap(add(a,n,0.7),add(b,n,0.7),0.5,0.5);
        p.F(M.blood[2]); p.circle(add(b,n,2.6),1.1);
      }
      p.F(M.dirt[1]); { const q=add(lerp(rootB,tm,0.5),n,-1); p.ell(q.x,q.y,2.6,1.2); }
      if(form==='plenilunar'){ p.F(M.blood[1]); p.poly([PT(add(rootB,n,-2)),PT(add(tm,n,-3)),PT(add(tw,n,-3)),PT(add(tw,n,3)),PT(add(rootB,n,3))]); }
      if(form==='enluarado'){ p.F(M.glow[1]); p.cap(add(lerp(ws,wr,0.15),n,2.4),add(lerp(ws,wr,0.45),n,4.4),0.7,0.6); p.cap(add(lerp(ws,wr,0.55),n,10),add(lerp(ws,wr,0.75),n,13),0.7,0.6); }
    });
    p.F(M.fea[0]); p.cap(ws,e,2,1.8); p.cap(e,wr,1.8,1.6); // borda de ataque iluminada
    p.F(M.feaD[0]); p.circle(wr,1.8); p.F(M.feaD[1]); p.circle(add(wr,n,0.8),1); // punho
  }
  function drawWing(c,u,M,sk,P,front,form){
    const p=mkPen(c,u); p.id(); const g=front?sk.wF:sk.wB;
    if(g.folded) drawFolded(c,p,M,sk,g,front,form); else drawOpen(c,p,M,sk,g,front,form);
  }

  /* ---------- corpo, cauda, musgo ---------- */
  const BODY=[[18,12],[20.4,16],[19.4,20],[14,23.6],[4,25.6],[-8,25],[-18,21.6],[-24,16],[-24.6,10],[-18,4.4],[-8,0.6],[4,0],[12,2.6],[16.6,7]];
  function drawBody(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id(); const B=sk.B, Q=l=>l.map(([a,b])=>PT(B(a,b)));
    // cauda curta (branca, encardida)
    p.F(M.fea[1]); p.poly(Q([[-18,17],[-30,14],[-33.6,10.6],[-31,7.6],[-20,7.4]]));
    p.F(M.fea[2]); p.poly(Q([[-31,7.6],[-33.6,10.6],[-31.4,11.4],[-22,9.4]]));
    p.F(M.feaD[1]); [[-26,13],[-28,10.4]].forEach(([a,b])=>{ const q=B(a,b), r=B(a-5,b-1.4); p.cap(q,r,0.6,0.5); });
    // corpo em ovo
    p.F(M.fea[1]); p.poly(Q(BODY));
    clip(c,Q(BODY),()=>{
      p.F(M.fea[2]); p.poly(Q([[-28,10],[-16,2.6],[0,-1],[14,0.6],[22,6],[22,-4],[-28,-4]])); // barriga na sombra
      p.F(M.fea[3]); p.poly(Q([[-28,4],[-14,-0.2],[0,-2],[14,-0.4],[22,2],[22,-4],[-28,-4]]));
      p.F(M.fea[0]); p.poly(Q([[19,17],[14,22.4],[4,24.6],[-6,24.2],[-4,22.6],[6,22.2],[14,19.4],[18,14]])); // luz no peito/dorso
      // escamas de pena no peito
      for(let r=3;r>=0;r--) for(let k=0;k<4;k++){ const q=B(17-k*4.2-r*1.9-(r%2)*2, 19-r*3.4); scale(p,M,q,2.2,1.3,rad(sk.A+18)); }
      p.F(M.feaD[2]); p.poly(Q([[-24,8],[-14,3],[0,0.6],[14,2],[20,7],[20,5],[14,0.4],[0,-1],[-14,1.4],[-24,6]]));
      p.F(M.feaD[1]); for(let k=0;k<6;k++){ const q=B(12-k*6,1.6+(k%2)*0.8); p.poly([[q.x-1.2,q.y-1],[q.x+1.2,q.y-1.2],[q.x+0.2,q.y+1.8]]); }
      // penas faltando: pele roxa com costelas (barriga, abaixo da asa)
      p.F(M.skin[3]); p.poly(Q([[3,8],[7,9],[10.6,6.4],[9.6,3.4],[6,4.6],[3.4,3.4],[1.6,5.6]]));
      p.F(M.skin[2]); p.poly(Q([[3.6,7.4],[7,8.2],[9.8,6.2],[9,4.2],[6,5.2],[3.6,4.2],[2.4,5.6]]));
      p.F(form==='plenilunar'?M.bone[0]:M.bone[1]); [[3.6,6.8,9,7.4],[3.6,5,9,5.6]].forEach(([a,b,c2,d])=>p.cap(B(a,b),B(c2,d),0.9,0.7));
      p.F(M.flesh[2]); { const q=B(5,3.6); p.ell(q.x,q.y,1.6,0.7); }
      p.F(M.feaD[0]); [[1,9.4],[12,9.2],[0.4,3.6]].forEach(([a,b])=>{ const q=B(a,b); p.poly([[q.x-1.2,q.y],[q.x+1.2,q.y-0.6],[q.x+0.4,q.y+1.4]]); }); // fiapos de pena
      // lama e sangue
      p.F(M.dirt[1]); { const q=B(-14,4); p.ell(q.x,q.y,4,1.4,rad(sk.A)); } p.F(M.dirt[2]); { const q=B(-12,2.6); p.ell(q.x,q.y,2.2,0.8); }
      p.F(M.blood[1]); { const q=B(16,10); p.ell(q.x,q.y,1.4,2); const r=B(15.4,6.6); p.rect(r.x-0.5,r.y,1,2.2); }
      if(form==='plenilunar'){ p.F(M.blood[1]); p.poly(Q([[19,15],[12,19],[2,20],[-6,18],[2,15],[12,13]])); p.F(M.blood[2]); p.poly(Q([[-20,8],[-12,6],[-10,8],[-18,10]])); }
    });
    // rasgo grande no flanco: costelas à mostra
    const RG=l=>Q(l.map(([a,b])=>[a+19,b-2.6]));
    clip(c,Q(BODY),()=>{
    p.F(M.flesh[3]); p.poly(RG([[-12,15.6],[-4,17.4],[-1,15],[0,9.4],[-2,6.4],[-10,8],[-14,11.4]]));
    p.F(M.flesh[2]); p.poly(RG([[-11,14.6],[-4,16.2],[-1.6,14.2],[-0.8,10],[-2,7.6],[-9,9],[-12.6,11.8]]));
    p.F(M.flesh[1]); p.poly(RG([[-8,13],[-4,13.6],[-3,12.4],[-7,12]]));
    p.F(form==='plenilunar'?M.bone[0]:M.bone[1]); [[-11,13,-1,14],[-11.4,10.8,-0.6,11.6],[-10,8.8,-1.4,9.4]].forEach(([a,b,c2,d])=>{ p.cap(B(a+19,b-2.6),B(c2+19,d-2.6),1.4,1.1); });
    p.F(M.bone[2]); [[-11,12.2,-1,13.2],[-11.4,10,-0.6,10.8]].forEach(([a,b,c2,d])=>p.cap(B(a+19,b-2.6),B(c2+19,d-2.6),0.6,0.5));
    });
    p.F(M.fea[1]); [[7,12.6,5,15],[15,14.8,14.6,17.4],[18.6,12,20.6,14]].forEach(([a,b,c2,d])=>{ const q=B(a,b), r=B(c2,d), m=B((a+c2)/2+1,(b+d)/2); p.poly([PT(q),PT(r),PT(m)]); }); // fiapos de pena na borda do rasgo
    p.F(M.blood[1]); p.poly(Q([[-6,6.6],[-4,6.8],[-4.4,1],[-5.6,0.4]]));
    // penas arrepiadas no dorso e na base do pescoço
    [[-19,22.4,-24.6,26.4],[-11,25.4,-14.4,30.2],[-4,26.6,-5.6,29.6],[5,25.6,7.4,28.6]].forEach(([a,b,c2,d],i)=>{ const q=B(a-2,b), r=B(c2,d), m=B(a+2,b); p.F(M.fea[i%2?1:2]); p.poly([PT(q),PT(r),PT(m)]); p.F(M.fea[0]); p.cap(lerp(q,r,0.2),lerp(m,r,0.7),0.5,0.3); });
    // musgo-lunar nas costas (por cima do dorso)
    p.F(M.moss[2]); p.poly(Q([[-16,22.4],[-12,25],[-6,26.2],[2,26.4],[6,25.4],[0,24],[-8,23.4]]));
    p.F(M.moss[1]); p.poly(Q([[-13,23.6],[-9,25.4],[-3,26],[2,25.8],[-3,24.6],[-9,24]]));
    p.F(M.moss[0]); [[-8,25.4],[-2,25.8],[-12,24.6]].forEach(([a,b])=>{ const q=B(a,b); p.rect(q.x-0.5,q.y-0.5,1,1); });
    p.F(M.moss[2]); [[-6,26.6],[0,27],[-11,25.6]].forEach(([a,b])=>{ const q=B(a,b); p.circle(q,0.8); });
    // penas da coxa ("calção" branco curto)
    [sk.hipF].forEach(h=>{ const k=lerp(h,sk.heelF,0.2); p.F(M.fea[1]); p.poly([[h.x-4,h.y-3],[h.x+4.6,h.y-2.6],[k.x+2.2,k.y],[k.x-0.4,k.y+1.4],[k.x-2.6,k.y]]); p.F(M.fea[2]); p.poly([[h.x-4,h.y-1],[k.x-2.6,k.y],[k.x-0.4,k.y+1.4],[h.x-1,h.y]]); });
  }

  /* ---------- pernas ---------- */
  function drawLeg(c,u,M,sk,P,front){
    const p=mkPen(c,u); p.id();
    const hip=front?sk.hipF:sk.hipB, heel=front?sk.heelF:sk.heelB, ank=front?sk.ankF:sk.ankB, f=(front?P.fF:P.fB)+sk.R;
    limb(p,M.leg,hip,heel,4.6,3.6,{hl:0.8});
    const n=limb(p,M.leg,heel,ank,3.4,3,{hl:0.85});
    p.F(M.leg[1]); p.circle(heel,2.5); p.F(M.leg[0]); p.circle(off(heel,sideN(hip,heel),-0.9),0.8); p.F(M.leg[2]); p.circle(off(heel,sideN(hip,heel),1),0.8);
    for(let k=1;k<9;k++){ const q=lerp(heel,ank,k/9.6); p.F(M.leg[2]); p.cap(off(q,n,-1.5),off(q,n,1.3),0.5,0.5); p.F(M.leg[0]); p.rect(q.x-n.nx*0.9-0.4,q.y-n.ny*0.9-0.9,0.8,0.5); } // escamas reticuladas
    { const n2=sideN(hip,heel); for(let k=1;k<5;k++){ const q=lerp(lerp(hip,heel,0.35),heel,k/5); p.F(M.leg[2]); p.cap(off(q,n2,-1.6),off(q,n2,1.5),0.5,0.5); } }
    p.F(M.leg[3]); p.circle(off(heel,sideN(hip,heel),1.4),1);
    p.F(M.dirt[1]); p.cap(lerp(heel,ank,0.78),ank,3.2,3.2); p.F(M.dirt[2]); p.cap(lerp(heel,ank,0.9),ank,2.4,2.6); // lama na canela
    // pé: 2 dedos visíveis pra frente + dedo de trás, garras
    p.xf(rad(f),ank.x,ank.y);
    p.F(M.leg[2]); p.cap({x:0,y:0},{x:7.6,y:0.5},2,1.1); p.F(M.bone[2]); p.rect(7.4,0.2,1.4,0.7);
    p.F(M.leg[2]); p.cap({x:0,y:0},{x:-3.8,y:0.8},1.8,1); p.F(M.bone[2]); p.rect(-4.8,0.6,1.2,0.6);
    p.F(M.leg[1]); p.cap({x:0,y:0},{x:10,y:0.9},2.2,1.2); p.F(M.leg[0]); p.rect(2,-0.8,5,0.5);
    p.F(M.bone[1]); p.poly([[9.6,0.2],[11.8,1.2],[9.6,1.6]]);
    p.F(M.dirt[1]); p.ell(1.6,0.9,2.4,1.1);
    p.id();
  }

  /* ---------- pescoço nu + papo ---------- */
  function drawNeck(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id(); const {n0,n1,n2,n3}=sk;
    limb(p,M.neck,n2,n3,11.6,10.4,{hl:0.5});
    limb(p,M.neck,n1,n2,13.4,11.6,{hl:0.5});
    const nA=limb(p,M.neck,n0,n1,15.4,13.4,{hl:0.5});
    p.F(M.neck[1]); p.circle(n1,6.6); p.circle(n2,5.7);
    // rugas da pele (lado iluminado)
    p.F(M.neck[0]); [[n1,n2,0.3],[n1,n2,0.6],[n2,n3,0.4],[n0,n1,0.85]].forEach(([a,b,t])=>{ const q=lerp(a,b,t), sn=sideN(a,b); p.cap(off(q,sn,-3.4),off(lerp(a,b,t+0.06),sn,-1.8),0.5,0.4); });
    p.F(M.neck[2]); [[n1,n2,0.45],[n2,n3,0.6]].forEach(([a,b,t])=>{ const q=lerp(a,b,t), sn=sideN(a,b); p.cap(off(q,sn,1.4),off(lerp(a,b,t+0.08),sn,3),0.5,0.4); });
    // anéis/rugas ao longo do pescoço (sombra + brilho deslocado)
    [[n1,n2,9.8],[n2,n3,8.6]].forEach(([a,b,wd])=>{ const sn=sideN(a,b); for(let t=0.15;t<0.95;t+=0.22){ const q=lerp(a,b,t), q2=lerp(a,b,t+0.06);
      p.F(M.neck[2]); p.cap(off(q,sn,-wd*0.42),off(q,sn,wd*0.3),0.6,0.6); p.F(M.neck[0]); p.cap(off(q2,sn,-wd*0.4),off(q2,sn,-wd*0.1),0.5,0.5); } });
    { const sn=sideN(n2,n3); p.F(M.neck[3]); p.cap(off(n2,sn,4.4),off(n3,sn,4),1,0.9); }
    // papo vermelho inchado na base
    const pr=1+(P.pulse||0)*0.1, pt=lerp(n0,n1,0.4);
    limb(p,M.pouch,n0,pt,16.4*pr,15*pr,{hl:0.5,sh:0.5});
    p.F(M.pouch[2]); { const q=off(lerp(n0,pt,0.45),nA,3.6); p.ell(q.x,q.y,3.4*pr,4.6*pr); }
    p.F(M.pouch[3]); { const q=off(lerp(n0,pt,0.5),nA,5.2*pr); p.ell(q.x,q.y,1.4,3.6*pr); }
    p.F(M.pouch[3]); [0.2,0.45,0.7].forEach(t=>{ const q=lerp(n0,pt,t); p.cap(off(q,nA,-4.4*pr),off(q,nA,-1.6),0.6,0.5); });
    p.F(M.pouch[0]); [[0.3,-4],[0.36,-3],[0.55,-4.4],[0.62,-3.4],[0.78,-3.8],[0.12,-3.2]].forEach(([t,k])=>{ const q=off(lerp(n0,pt,t),nA,k*pr); p.rect(q.x-0.45,q.y-0.45,0.9,0.9); });
    p.F(M.pouch[0]); { const q=off(lerp(n0,pt,0.5),nA,-3.6); p.ell(q.x,q.y,1.4,0.9); }
    // papo rasgado: carne exposta pulsando com veias
    const tq=off(lerp(n0,pt,0.45),nA,1.6);
    p.F(M.flesh[3]); p.ell(tq.x,tq.y,3.4*pr,2.4*pr); p.F(M.flesh[2]); p.ell(tq.x-0.4,tq.y-0.3,2.6*pr,1.7*pr);
    p.F(M.vein[1]); p.cap({x:tq.x-2,y:tq.y-0.6},{x:tq.x+1.6,y:tq.y+0.8},0.6,0.5); p.F(M.vein[0]); p.rect(tq.x-0.4,tq.y-0.6,0.8,0.7);
    p.F(M.pouch[3]); [[0.2,2.6],[0.6,3.2],[0.9,2.2]].forEach(([t,k])=>{ const q=off(lerp(n0,pt,t),nA,k); p.rect(q.x-0.4,q.y-0.4,0.8,0.8); }); // textura granulosa
    if(form==='enluarado'){ p.F(M.glow[1]); const a=off(lerp(n0,pt,0.2),nA,-2), b=off(lerp(n0,pt,0.7),nA,-0.4); p.cap(a,b,0.6,0.5); p.cap(b,off(lerp(n0,pt,0.9),nA,-2.6),0.5,0.4); }
    // gola de penas brancas cobrindo a base do papo
    p.F(M.fea[1]); const sb=sideN(n0,n1), dir={x:(n1.x-n0.x)/sb.L,y:(n1.y-n0.y)/sb.L};
    for(let k=-3;k<=3;k++){ const q=off(add(n0,dir,-3),sb,k*1.9), L=0.9+(k%2?0.6:0); p.poly([[q.x-dir.x*2.4-sb.nx,q.y-dir.y*2.4-sb.ny],[q.x+dir.x*L,q.y+dir.y*L],[q.x-dir.x*2.4+sb.nx,q.y-dir.y*2.4+sb.ny]]); }
    p.F(M.fea[2]); for(let k=-3;k<=3;k+=2){ const q=off(add(n0,dir,-1.6),sb,k*1.9+0.6); p.rect(q.x-0.4,q.y-0.4,0.8,0.8); }
  }

  /* ---------- cabeça + bico ---------- */
  const UPPER=[[5.4,-6.4],[14,-5],[24,-3.2],[32,-1.8],[36,-2],[35.4,-0.4],[26,0],[16,0.6],[5.4,1.6]];
  const LOWER=[[5.4,1.4],[16,0.6],[26,0],[35,-0.2],[29,2],[19,3.6],[9,4.8],[4.6,3.8]];
  function drawJaw(c,u,M,sk,P,form){
    const p=mkPen(c,u); const h=sk.H(5,1.6); p.xf(sk.ha+rad(P.jaw),h.x,h.y);
    const L=LOWER.map(([x,y])=>[x-5,y-1.6]);
    if(P.jaw>8){ p.F(M.mouth[1]); p.poly([[0,-0.6],[26,-2],[29,-1.6],[0,1.4]]); } // boca por dentro (escura)
    p.F(M.bill[1]); p.poly(L);
    p.F(M.bill[2]); p.poly([[0,2.6],[14,2],[24,0.4],[29.8,-1.6],[24,1.4],[14,3.2],[4,3.2]]);
    p.F(M.bill[0]); p.rect(6,-0.6,14,0.6);
    p.F(M.blood[2]); p.poly([[20,0.4],[26,-1],[27,0.2],[22,1.4]]);
    p.F(M.blood[1]); p.poly([[9,2.4],[16,1.6],[18,2.4],[12,4.4]]); p.poly([[24,0.6],[26.4,0],[26,5],[25,6.4],[24.4,3]]); p.ell(25.2,6.4,1,1.1);
    p.id();
  }
  function drawHead(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.xf(sk.ha,sk.n3.x,sk.n3.y);
    // crânio preto nu
    p.F(M.neck[1]); p.ell(1.6,-2.2,6.8,5.8); p.poly([[-3,2],[6,-7],[8,-3],[6,2.6]]);
    p.F(M.neck[2]); p.poly([[-5,0],[-3.6,3.4],[2,3.6],[0,1.4],[-3,-2]]); p.F(M.neck[0]); p.poly([[-1.6,-6.4],[3,-7.6],[6,-6.4],[2,-6.6]]);
    p.F(M.neck[0]); p.rect(-2.6,-3.4,0.6,2); p.rect(-1,-6,1.6,0.5); // rugas
    // bico enorme (mandíbula de cima), arrebitado na ponta
    p.F(M.bill[1]); p.poly(UPPER);
    clip(c,UPPER,()=>{
      p.F(M.bill[2]); p.poly([[5,-0.6],[16,-0.8],[26,-1.2],[36,-1.6],[36,1],[5,2]]);
      p.F(M.bill[0]); p.poly([[6,-6.2],[14,-4.8],[24,-3],[30,-2.2],[24,-2.4],[14,-4],[6,-5.2]]); // lombada polida
      p.F(M.bill[3]); p.poly([[5.4,-6.4],[7.2,-6],[7,1.6],[5.4,1.6]]); // base do bico (junta com a cabeça)
      // rachadura com sangue seco
      p.F(M.bill[3]); p.poly([[15,-4.8],[16.4,-3],[15.4,-2.2],[17.4,-0.4],[16.8,-0.2],[14.8,-2],[15.6,-2.8],[14.4,-4.6]]);
      p.F(M.blood[2]); p.poly([[16.6,-2.4],[20,-1.6],[19,-0.4],[16.8,-0.8]]); p.F(M.blood[1]); p.rect(28,-1.4,3,1);
      if(form==='enluarado'){ p.F(M.glow[1]); p.poly([[8,-5.6],[24,-2.8],[31,-1.8],[24,-2.2],[8,-4.8]]); }
    });
    // ponta lascada
    erase(c,()=>{ p.F(M.bill[3]); p.poly([[33.2,-2.4],[36.4,-2.4],[36.4,-0.6],[34.4,-1]]); });
    if(form==='plenilunar'){ p.F(M.bone[1]); [[10,-5.4],[16,-4.4],[22,-3.2]].forEach(([x,y])=>p.poly([[x-1.6,y+0.4],[x+1.4,y-3.4],[x+1.2,y+0.2]])); p.F(M.bone[0]); [[10,-5.4],[16,-4.4]].forEach(([x,y])=>p.rect(x,y-2,0.6,1)); }
    // olho de lua
    p.F(M.neck[3]); p.ell(1.8,-3,3.6,2.9); p.F(M.glow[2]); p.ell(1.9,-3.1,2.9,2.3); p.F(M.eye[1]); p.ell(2,-3.2,2.3,1.8); p.F(M.eye[0]); p.ell(1.6,-3.6,1.2,0.9); p.F(M.eye[2]); p.rect(3,-2.5,1,0.7);
    p.F(M.neck[3]); p.poly([[-1.6,-5.8],[5,-6.4],[5.4,-5],[-1,-4.8]]); // sobrancelha franzida
    if(form!=='comum'){ p.F(M.glow[1]); p.rect(3.4,-3.4,1.6,0.6); }
    // carne exposta atrás da cabeça
    p.F(M.flesh[2]); p.ell(-3.6,-2.4,1.6,1.2); p.F(M.flesh[1]); p.rect(-4,-2.8,0.8,0.7);
    p.id();
  }

  /* ---------- rastros e penas soltas ---------- */
  function drawSmear(c,u,M,sk,P){
    const p=mkPen(c,u); p.id(); const cl=q=>[mx(OX/-SC+1,mn((FW-OX)/SC-2,q.x)),mx(1,mn(G0,q.y))];
    if(P.smear===1){ // rastro do bico disparando
      const a=sk.H(36,-0.6), b=sk.H(36,1), r=sk.H(-14,-9), s=sk.H(-18,-2), t=sk.H(-12,5);
      p.F(M.swish[0]); p.poly([a,r,s,t,b].map(cl));
      p.F(M.swish[2]); [[-10,-6,20,-2.4],[-14,-1,16,0],[-10,3.6,20,1.6]].forEach(([x0,y0,x1,y1])=>p.cap(sk.H(x0,y0),sk.H(x1,y1),0.8,0.5));
    } else { // rasante: linhas de velocidade atrás do corpo
      const B=sk.B;
      p.F(M.swish[1]); [[2,-30,-74],[10,-34,-84],[18,-30,-70],[24,-24,-56]].forEach(([v,u0,u1])=>p.cap(B(u0,v),B(u1,v),1.4,0.4));
      p.F(M.swish[0]); [[6,-36,-62],[14,-38,-66]].forEach(([v,u0,u1])=>p.cap(B(u0,v),B(u1,v),0.9,0.3));
    }
  }
  const LOOSE=[[-38,0,20,0],[-24,3,-40,1],[-8,1,70,0],[14,2,-20,1],[30,0,40,0],[46,2,-60,1],[-50,1,10,0]];
  function drawLoose(c,u,M,P){
    const p=mkPen(c,u); const f=P.feath;
    LOOSE.forEach(([x,yy,r,pr],i)=>{ const k=mn(1,f*1.3-i*0.04); if(k<=0) return;
      const x0=AX0+x*k*0.9, y0=G0-1.6-yy-(1-k)*26;
      p.xf(rad(r*k+i*30*(1-k)),x0,y0);
      p.F(pr?M.prim[1]:M.fea[1]); p.poly([[-4,0],[-1,-1.4],[4,-0.4],[4.4,0.4],[-1,1]]);
      p.F(pr?M.prim[0]:M.fea[2]); p.rect(-4,-0.2,8,0.5);
      p.id(); });
  }

  /* ---------- montagem ---------- */
  const cache=PIX.cache();
  function frame(form,anim,fi,step=5,Pov,pk){
    const K=PIX.getK(), key=(pk!=null?'#'+pk+'|'+form:form+'|'+anim+'|'+fi+'|'+step)+'@'+K;
    const hit=cache.get(key); if(hit){ cache.delete(key); cache.set(key,hit); return hit; }
    const P=Pov?Object.assign({},REST,Pov):poseOf(anim,fi), M=mats(form), sk=skeleton(P);
    const parts=[];
    if(P.feath>0) parts.push({draw:(c,u)=>drawLoose(c,u,M,P)});
    parts.push(
      {back:true, draw:(c,u)=>drawWing(c,u,M,sk,P,false,form)},
      {back:true, draw:(c,u)=>drawLeg(c,u,M,sk,P,false)},
      {draw:(c,u)=>drawBody(c,u,M,sk,P,form)},
      {draw:(c,u)=>drawLeg(c,u,M,sk,P,true)});
    if(P.smear>=0.5) parts.push({noShade:true, smear:true, noRim:true, draw:(c,u)=>drawSmear(c,u,M,sk,P)});
    parts.push(
      {draw:(c,u)=>drawNeck(c,u,M,sk,P,form)},
      {draw:(c,u)=>drawJaw(c,u,M,sk,P,form)},
      {draw:(c,u)=>drawHead(c,u,M,sk,P,form)},
      {draw:(c,u)=>drawWing(c,u,M,sk,P,true,form)});
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM[form]}); if(step>=4) heavyOutline(cv);
    const sc=q=>({x:(OX+q.x*SC)*K,y:(OY+q.y*SC)*K});
    cv._eye=sc(sk.H(1.8,-3.1)); cv._mouth=sc(sk.H(14,1)); cv._hand=sc(sk.H(35,-0.6)); cv._head=sc(sk.H(1.6,-2.2)); cv._beak=cv._hand; cv._pouch=sc(lerp(sk.n0,sk.n1,0.35));
    cache.set(key,cv); if(cache.size>900) cache.delete(cache.keys().next().value);
    return cv;
  }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame,framePose:function(form,anim,P,key){ return frame(form,anim,0,5,P,key); }};
})();
