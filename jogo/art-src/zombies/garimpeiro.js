/* GARIMPEIRO — fonte de arte (editável). Build: npm run art
   Zumbi Garimpeiro (variante local da Amazônia): garimpeiro que ficou na cava quando a Lua nasceu.
   Largo e musculoso, ombros pesados, inclinado pra frente. Regata rasgada sobre pele cinza-esverdeada, crosta de
   lama laranja-ocre rachada no tronco e nos braços, bermuda de brim surrada, botas de borracha cheias de barro.
   Picareta de cabo de madeira e ferro enferrujado na mão da frente; bateia de metal (cone raso) presa na cintura
   com lama prateada dentro; capacete de obra amassado; saco de pano com pepitas no ombro de trás.
   Barba empastada de barro, olhos brancos fundos, veias prateadas de mercúrio no pescoço e nos braços, dentes
   marrons, língua cinza. Corrupção da Lua: raízes saindo das costelas, pepitas encravadas na pele.
   Figura de ofício, sem pessoa real. Golpes: picaretada (racha o chão), lama de mercúrio (gira a bateia e lança),
   cava (some na terra) e surge embaixo do alvo, ficando preso puxando a picareta (ABERTO).
   Hi-bit: honra PIX.getK(). Adereços: xMud (lama de mercúrio voando) e xMound (terra se mexendo). */
const GARIMPEIRO=(function(){
  const {rad,lerp,P2,mkPen,compose}=PIX;
  const FW=204, FH=168, GROUND=154, AX=84;
  const RIM={comum:'#d8e4f4', enluarado:'#9ff6ff', plenilunar:'#ffb46a'};

  /* ---------- materiais ---------- */
  function mats(form){
    const m={
      skin:['#d2d8c8','#a8aea0','#727a70','#444a4a'],
      vein:['#f4f8fb','#c8d0d6','#8a96a2','#4e5866'],
      mud:['#e8a060','#b4642c','#8a4a22','#552a14'],
      earth:['#a87a52','#76523a','#4e3426','#2c1c14'],
      tank:['#bcbca4','#8a8a74','#5e5e50','#38382f'],
      denim:['#7e90a4','#4a5a6a','#323e4c','#1e2630'],
      rubber:['#62626c','#2e2e34','#1e1e22','#121216'],
      iron:['#c4ccd0','#7c8488','#4c5258','#2a2e34'],
      rust:['#d88e4e','#a05a2a','#6a3818','#3c1e0e'],
      wood:['#e4bc82','#ac7e4a','#76522e','#46301c'],
      helm:['#fff2a6','#e8b838','#a8781e','#5e4012'],
      gold:['#fff7b2','#f2c230','#b17b1d','#6b4511'],
      merc:['#ffffff','#dde5eb','#9ca9b5','#5c6876'],
      pan:['#dce2e4','#9aa4a8','#646e74','#3a4248'],
      sack:['#dcc89e','#ac966c','#78664a','#483c2c'],
      beard:['#94826a','#62543f','#40362a','#261f18'],
      root:['#cdb48c','#927a58','#604c36','#382a1e'],
      flesh:['#f2a890','#bc565a','#783848','#481c32'],
      bone:['#fff4d8','#dccfa6','#a09070','#605040'],
      eye:['#ffffff','#e8ece2','#aab0a2','#6a6e66'],
      mouth:['#7c2e3e','#4c1828','#2e0c1a','#1a0610'],
      teeth:['#d8b886','#9c7848','#6a4e30','#3c2a1a'],
      tongue:['#bebec8','#8a8a98','#5e5e6c','#383844'],
      blood:['#c84a3e','#8e2a2c','#5e1824','#3a0e1a'],
      nail:['#8a7a62','#5a4c3c','#3a3028','#201a16'],
      glow:['#fffbe0','#e8ecb0','#a8b07a','#646c4a'],
      swish:['#fdfdff','#e6f0ff','#b4c4e8','#7484b0'],
    };
    if(form==='enluarado'){
      m.skin=['#dcdcf6','#a6a8d6','#6c6ea6','#3e3c70']; m.vein=['#effffe','#7af4ff','#2ab0d8','#146a96'];
      m.mud=['#cec2e2','#9c90bc','#6a5e8c','#3c3460']; m.earth=['#8e86ac','#625a82','#403a5e','#24203a'];
      m.tank=['#c8c8dc','#9494b0','#62627e','#3a3a52']; m.denim=['#8a9ac4','#56628e','#3a4268','#222844'];
      m.gold=['#f4feff','#bfe8f4','#72acc8','#3c5c80']; m.merc=['#ffffff','#c8fbff','#6ae4f4','#2a8ab0'];
      m.pan=['#e4e8f8','#a6aac8','#6c7094','#40445e']; m.sack=['#d2cce4','#a29ac0','#706890','#443e5e'];
      m.beard=['#8e86a6','#605878','#403a56','#242036']; m.root=['#c4b8e0','#8c80b0','#5c5282','#342e52'];
      m.flesh=['#f0b0ff','#b866d8','#7a3a9e','#46206a']; m.blood=['#b46ad8','#7e3ea6','#542474','#34144a'];
      m.eye=['#ffffff','#b8fbff','#4ad8f0','#1a8aa8']; m.glow=['#effffe','#7af4ff','#2ab0d8','#146a96']; m.swish=['#ffffff','#c8fbff','#6ae4f4','#2a9ab8'];
      m.helm=['#f4f0c8','#c8bc7c','#8c8058','#544a3a']; m.rust=['#c09ab0','#8a6680','#5a4258','#342636'];
    }
    if(form==='plenilunar'){
      m.skin=['#ffcaa6','#e2806a','#a4424e','#5e1e36']; m.vein=['#fff6c0','#ffb43a','#e0581e','#8a2414'];
      m.mud=['#ee7e52','#b83e26','#7c2018','#460e10']; m.earth=['#a8523a','#7a3428','#50201c','#2e1012'];
      m.tank=['#c8a090','#946a62','#644448','#3c262e']; m.denim=['#7a6a88','#4e4060','#342a44','#1e182a'];
      m.gold=['#fffbe0','#ffb43a','#e0581e','#8a2414']; m.merc=['#fffbe6','#ffe6a8','#ffb460','#c0602a'];
      m.pan=['#f0d8c8','#c09c8c','#80605a','#4a3434']; m.sack=['#e4b896','#b0806a','#78524a','#48302e'];
      m.beard=['#9a5a48','#683830','#442424','#281418']; m.root=['#fff4d8','#dccfa6','#a09070','#605040'];
      m.flesh=['#ffc07a','#f06a3a','#a8302e','#5e1422']; m.blood=['#ff7a3a','#d43a26','#8a1c22','#4e0c18'];
      m.eye=['#fffbe0','#ffe04a','#ff8a2a','#b83a14']; m.glow=['#fff6c0','#ffb43a','#e0581e','#8a2414']; m.swish=['#fffbe6','#ffe6a8','#ffb460','#d0602a'];
      m.helm=['#ffe0a0','#e89838','#a85a1e','#5e2c12']; m.rust=['#ff9a52','#c8502a','#80281a','#46120e'];
    }
    return punch(m);
  }
  const NAMES={skin:'Pele',vein:'Veias de mercúrio',mud:'Crosta de lama',earth:'Terra/barro',tank:'Regata',denim:'Bermuda de brim',rubber:'Bota de borracha',iron:'Ferro da picareta',rust:'Ferrugem',wood:'Cabo de madeira',helm:'Capacete de obra',gold:'Pepitas de ouro',merc:'Mercúrio',pan:'Bateia',sack:'Saco de pano',beard:'Barba empastada',root:'Raízes',flesh:'Carne',bone:'Osso',eye:'Olho',teeth:'Dentes',tongue:'Língua',blood:'Sangue',glow:'Brilho',swish:'Rastro do golpe'};
  function sat(h,k){ const [r,g,b]=PIX.hexRgb(h), y=(r+g+b)/3; return PIX.toHex(y+(r-y)*k,y+(g-y)*k,y+(b-y)*k); }
  const NOPUNCH={swish:1,glow:1,merc:1};
  function punch(m){ const o={}; for(const k in m){ const r=m[k]; o[k]=NOPUNCH[k]?[r[0],r[1],r[2],r[3]]:[sat(r[0],1.1),sat(r[1],1.16),PIX.mix(sat(r[2],1.1),'#2a1a4c',0.2),PIX.mix(r[3],'#140a24',0.34)]; } return o; }

  /* ---------- poses ---------- */
  // ângulos: 0 = pendurado, + = pra frente. rz = ângulo da picareta somado ao do antebraço da frente.
  // sink = afundado no chão (unidades; >=200 some, só a terra); mound = monte de terra (0..1); mx = deslocamento do monte;
  // debris = torrões voando (0..1); pan = bateia na mão de trás (>0,5) · pt = inclinação da bateia · spill = lama saindo;
  // crack = rachadura no chão na frente; helm = capacete na cabeça; hloose/hdx/hdy/hdr = capacete caído; pool = poça de mercúrio.
  const REST={hx:0,rot:0,lift:0,lean:6,hunch:12,head:-10,jaw:10,aFs:16,aFe:36,aBs:-8,aBe:8,rz:-18,lFh:14,lFk:-2,lBh:-12,lBk:-20,fF:0,fB:0,
    smear:0,flash:0,drool:0,sink:0,mound:0,mx:0,debris:0,pan:0,pt:0,spill:0,crack:0,helm:1,hloose:0,hdx:0,hdy:0,hdr:0,pool:0,drip:0};
  const S=Math.sin, C=Math.cos, PI=Math.PI, mx=Math.max;
  const ANIMS={
    idle:{nome:'Parado (balança o peso, a bateia pinga)',n:8,dur:()=>160,pose:i=>{ const p=i/8*PI*2, s=S(p);
      return {hx:1.4*s, lean:6+2*S(p+0.5), hunch:12+2*S(2*p), head:-10+3*S(p-0.8), jaw:8+5*mx(0,S(p)), drool:i%4, drip:i,
        aFs:16+5*s, aFe:36+6*S(p+0.4), rz:-18+5*S(p+1), aBs:-8-5*s, aBe:8+7*s,
        lFh:14+3*s, lFk:-2+4*s, lBh:-12-3*s, lBk:-20+3*s, fF:2*mx(0,s)}; }},
    walk:{nome:'Andar de bota de lama (ombros pesados)',n:8,dur:()=>136,pose:i=>{ const p=i/8*PI*2;
      const lFh=10+17*S(p), lBh=-10+13*S(p+PI);
      return {lFh, lFk:lFh-20*mx(0,C(p))-4, lBh, lBk:lBh-10-12*mx(0,C(p+PI)), fF:-10*mx(0,C(p)), fB:20*mx(0,C(p+PI)),
        lean:8+2.5*S(2*p), hunch:13+2*S(2*p-0.6), head:-10+3*S(2*p-1.4), jaw:9+3*S(2*p-1.8), hx:2*S(p), lift:1.6*mx(0,S(2*p)),
        aFs:16+12*S(p+PI), aFe:36+10*S(p+PI), rz:-18+8*S(p), aBs:-8+16*S(p), aBe:8+14*S(p), drool:i%4, drip:i}; }},
    alert:{nome:'Alerta (ergue a picareta e estala o pescoço)',n:7,dur:i=>[170,140,120,180,90,240,160][i],pose:i=>[
      {head:-4,jaw:12},
      {head:8,jaw:16,lean:-2,hunch:8,aFs:40,aFe:90,rz:10},
      {head:-16,jaw:6,lean:2,aFs:60,aFe:120,rz:30,hx:-1},
      {head:12,jaw:30,lean:-6,hunch:6,aFs:90,aFe:160,rz:30,aBs:40,aBe:80,hx:-2},
      {head:4,jaw:36,lean:-8,hunch:6,aFs:110,aFe:180,rz:24,aBs:60,aBe:110,hx:-2,lFh:18,lBh:-18},
      {head:-4,jaw:40,lean:-4,hunch:8,aFs:104,aFe:172,rz:26,aBs:30,aBe:70,hx:-1,lFh:18,lBh:-18},
      {jaw:18,head:-8,aFs:40,aFe:80,rz:0}][i]},
    // ---- golpes (IA: ai/garimpeiro.ts) ----
    attack:{nome:'Picaretada (racha o chão)',n:10,hit:5,reach:40,dur:i=>[140,120,200,60,50,90,150,130,120,150][i],pose:i=>[
      {lean:-4,hunch:8,head:-2,jaw:16,aFs:130,aFe:180,rz:8,aBs:120,aBe:170,hx:-1,lFh:16,lBh:-14},
      {lean:-14,hunch:4,head:6,jaw:24,aFs:176,aFe:220,rz:14,aBs:166,aBe:212,hx:-4,lFh:20,lFk:-6,lBh:-18,lBk:-28},
      {lean:-18,hunch:2,head:8,jaw:30,aFs:186,aFe:232,rz:18,aBs:176,aBe:222,hx:-5,lFh:22,lFk:-6,lBh:-20,lBk:-30},
      {lean:8,hunch:14,head:-6,jaw:36,aFs:130,aFe:140,rz:8,aBs:122,aBe:134,smear:1,hx:2,lFh:24,lFk:0,lBh:-20,lBk:-30},
      {lean:26,hunch:20,head:-14,jaw:40,aFs:84,aFe:88,rz:2,aBs:78,aBe:84,smear:1,hx:7,lFh:30,lFk:4,lBh:-24,lBk:-34,fB:10},
      {lean:40,hunch:24,head:-20,jaw:44,aFs:36,aFe:30,rz:-8,aBs:32,aBe:28,crack:1,hx:10,lFh:40,lFk:-6,lBh:-24,lBk:-44,fB:14},
      {lean:40,hunch:24,head:-18,jaw:34,aFs:36,aFe:30,rz:-8,aBs:32,aBe:28,crack:1,hx:10,lFh:40,lFk:-6,lBh:-24,lBk:-44,fB:14},
      {lean:22,hunch:18,head:-12,jaw:22,aFs:56,aFe:84,rz:-6,aBs:40,aBe:70,crack:1,hx:6,lFh:26,lBh:-20},
      {lean:12,hunch:14,head:-10,jaw:16,aFs:34,aFe:60,rz:-12,aBs:10,aBe:30,hx:3,lFh:18,lBh:-14},
      {lean:8,hunch:12,head:-10,jaw:12,aFs:20,aFe:40,hx:1}][i]},
    throw:{nome:'Lama de mercúrio (gira a bateia e lança)',n:9,throwAt:4,reach:130,dur:i=>[130,110,110,140,60,120,130,130,150][i],pose:i=>[
      {aBs:-30,aBe:30,pan:1,pt:10,lean:4,head:-6,jaw:12,hx:-1},
      {aBs:30,aBe:80,pan:1,pt:-20,lean:2,head:-4,jaw:18,hx:-2,drip:1},
      {aBs:60,aBe:110,pan:1,pt:20,lean:0,head:-2,jaw:22,hx:-2,drip:2},
      {aBs:-50,aBe:-20,pan:1,pt:-30,lean:-12,hunch:6,head:2,jaw:26,hx:-5,lFh:20,lBh:-20,lBk:-30,aFs:30,aFe:60},
      {aBs:66,aBe:76,pan:1,pt:40,spill:1,smear:0,lean:18,hunch:16,head:-12,jaw:40,hx:6,lFh:30,lFk:4,lBh:-24,lBk:-34,fB:12,aFs:0,aFe:20},
      {aBs:78,aBe:90,pan:1,pt:60,spill:0.5,lean:20,hunch:16,head:-12,jaw:34,hx:7,lFh:30,lFk:4,lBh:-24,lBk:-34,fB:12},
      {aBs:60,aBe:80,pan:1,pt:30,lean:12,hunch:14,head:-10,jaw:22,hx:4,lFh:22,lBh:-18},
      {aBs:20,aBe:50,pan:1,pt:10,lean:8,head:-10,jaw:16,hx:2},
      {aBs:-8,aBe:8,pan:0,jaw:12}][i]},
    dig:{nome:'Cava (mergulha a picareta e some na terra)',n:10,sink:6,dur:i=>[130,140,90,140,120,110,120,100,100,100][i],pose:i=>[
      {lean:16,hunch:18,head:-14,jaw:16,lFh:40,lFk:-30,lBh:20,lBk:-50,fB:30,aFs:60,aFe:120,rz:30,aBs:60,aBe:110},
      {lean:-8,hunch:8,head:4,jaw:28,aFs:170,aFe:210,rz:16,aBs:160,aBe:200,lFh:30,lFk:-14,lBh:6,lBk:-40,hx:-3},
      {lean:40,hunch:26,head:-22,jaw:40,aFs:40,aFe:20,rz:-30,aBs:36,aBe:16,lFh:56,lFk:-40,lBh:30,lBk:-70,fB:40,hx:6,debris:0.4,crack:1,smear:1},
      {lean:44,hunch:28,head:-24,jaw:36,aFs:20,aFe:0,rz:-40,aBs:16,aBe:-4,lFh:60,lFk:-50,lBh:40,lBk:-80,fB:50,hx:6,sink:12,mound:0.5,debris:0.7},
      {lean:50,hunch:30,head:-26,jaw:44,aFs:0,aFe:-10,rz:-50,aBs:-4,aBe:-14,lFh:60,lFk:-50,lBh:40,lBk:-80,hx:6,sink:36,mound:0.8,debris:1},
      {lean:56,hunch:30,head:-26,jaw:48,aFs:150,aFe:170,rz:0,aBs:140,aBe:170,lFh:60,lFk:-50,lBh:40,lBk:-80,hx:6,sink:70,mound:1,debris:0.8},
      {sink:999,mound:1,debris:0.5,mx:0},
      {sink:999,mound:0.9,mx:3},
      {sink:999,mound:1,mx:6},
      {sink:999,mound:0.9,mx:9}][i]},
    under:{nome:'Terra se mexendo (debaixo do chão)',n:4,dur:()=>90,pose:i=>({sink:999,mound:[0.85,1,0.9,1.05][i],mx:[0,1.5,3,1.5][i],debris:[0.2,0,0.3,0][i]})},
    emerge:{nome:'Surge (explode de baixo, picareta no alto)',n:8,hit:1,dur:i=>[110,80,90,110,120,130,140,150][i],pose:i=>[
      {sink:999,mound:1.2,debris:0.6},
      {sink:46,mound:1.3,debris:1,lean:-10,hunch:4,head:10,jaw:46,aFs:176,aFe:190,rz:0,aBs:166,aBe:186,lFh:10,lBh:-10},
      {sink:18,mound:1,debris:1,lean:-14,hunch:2,head:12,jaw:52,aFs:186,aFe:196,rz:4,aBs:176,aBe:196,lift:6,lFh:24,lFk:-20,lBh:-6,lBk:-40},
      {sink:0,mound:0.7,debris:0.8,lean:-8,hunch:6,head:6,jaw:44,aFs:180,aFe:200,rz:8,aBs:170,aBe:200,lift:10,lFh:40,lFk:-40,lBh:10,lBk:-50,fB:30},
      {sink:0,mound:0.5,debris:0.4,lean:20,hunch:20,head:-14,jaw:30,aFs:90,aFe:80,rz:-10,aBs:80,aBe:70,lFh:44,lFk:-34,lBh:20,lBk:-60,fB:30,smear:1},
      {sink:0,mound:0.4,lean:34,hunch:24,head:-18,jaw:26,aFs:38,aFe:32,rz:-8,aBs:34,aBe:30,lFh:40,lFk:-28,lBh:18,lBk:-56,fB:24,crack:1},
      {sink:0,mound:0.3,lean:32,hunch:24,head:-16,jaw:22,aFs:38,aFe:32,rz:-8,aBs:34,aBe:30,lFh:36,lFk:-20,lBh:14,lBk:-48,fB:20,crack:1},
      {sink:0,mound:0.2,lean:30,hunch:22,head:-14,jaw:18,aFs:38,aFe:32,rz:-8,aBs:34,aBe:30,lFh:32,lFk:-14,lBh:10,lBk:-40,fB:16,crack:1}][i]},
    // FRAQUEZA: picareta presa no chão, puxa com as duas mãos (ABERTO)
    open:{nome:'Preso (puxa a picareta cravada)',n:8,dur:()=>150,pose:i=>{ const t=[0,1,0.4,1.2,0.2,1,0.5,1.3][i];
      return {lean:38-10*t,hunch:24-4*t,head:-16+10*t,jaw:14+20*t,aFs:36-6*t,aFe:30-2*t,rz:-8+4*t,aBs:32-8*t,aBe:28-6*t,
        hx:-2*t,lFh:30+4*t,lFk:-12,lBh:6-14*t,lBk:-36-8*t,fB:14,crack:1,drool:i%4}; }},
    hurt:{nome:'Dano (cabeça)',n:4,dur:i=>[80,110,130,150][i],pose:i=>[
      {lean:-8,hunch:6,head:8,jaw:32,aFs:-6,aFe:30,rz:-10,aBs:-20,aBe:10,hx:-6,flash:1,lFh:14,lBh:-4},
      {lean:-4,hunch:8,head:4,jaw:28,aFs:4,aFe:36,rz:-16,aBs:-14,aBe:16,hx:-5,lFh:12,lBh:-6},
      {lean:2,hunch:10,head:-4,jaw:20,aFs:12,aFe:36,aBs:-12,aBe:10,hx:-2},
      {lean:5,hunch:11,head:-8,jaw:12,hx:0}][i]},
    hurtB:{nome:'Dano (barriga, dobra)',n:4,dur:i=>[80,120,140,150][i],pose:i=>[
      {lean:32,hunch:28,head:6,jaw:42,aFs:46,aFe:20,rz:-30,aBs:40,aBe:14,hx:-8,flash:1,lFh:20,lFk:-14,lBh:-14,lBk:-30},
      {lean:28,hunch:26,head:2,jaw:36,aFs:42,aFe:24,rz:-30,aBs:38,aBe:20,hx:-7,lFh:18,lFk:-12,lBh:-14,lBk:-28},
      {lean:16,hunch:18,head:-6,jaw:24,aFs:30,aFe:46,aBs:20,aBe:36,hx:-3},
      {lean:8,hunch:13,head:-9,jaw:12,hx:-1}][i]},
    fall:{nome:'Derrubado',n:6,dur:i=>[90,90,90,110,140,260][i],pose:i=>[
      {lean:-12,hunch:4,head:6,jaw:36,aFs:-40,aFe:-20,rz:20,aBs:-46,aBe:-30,hx:-6,flash:1,lFh:20,lBh:0},
      {rot:-30,lean:-4,hunch:8,head:2,jaw:30,aFs:-60,aFe:-40,rz:30,aBs:-70,aBe:-50,hx:-4,lFh:40,lFk:30,lBh:20,lBk:10,helm:1},
      {rot:-62,lean:0,hunch:10,head:-4,jaw:28,aFs:-90,aFe:-70,rz:40,aBs:-96,aBe:-80,hx:-6,lFh:50,lFk:40,lBh:30,lBk:24},
      {rot:-90,lean:4,hunch:12,head:-2,jaw:36,aFs:-110,aFe:-120,rz:40,aBs:-100,aBe:-110,hx:2,lFh:40,lFk:10,lBh:30,lBk:4},
      {rot:-84,lean:2,hunch:14,head:-8,jaw:30,aFs:-120,aFe:-140,rz:40,aBs:-104,aBe:-126,hx:2,lFh:46,lFk:20,lBh:34,lBk:10},
      {rot:-90,lean:0,hunch:12,head:-4,jaw:34,aFs:-130,aFe:-150,rz:40,aBs:-110,aBe:-136,hx:2,lFh:40,lFk:6,lBh:26,lBk:0}][i]},
    getup:{nome:'Levantar (apoia na picareta)',n:6,dur:i=>[200,170,170,160,160,150][i],pose:i=>[
      {rot:-90,lean:0,hunch:12,head:-4,jaw:34,aFs:-130,aFe:-150,rz:40,aBs:-110,aBe:-136,hx:2,lFh:40,lFk:6,lBh:26,lBk:0},
      {rot:-60,lean:10,hunch:20,head:-16,jaw:24,aFs:-50,aFe:-10,rz:20,aBs:-60,aBe:-20,hx:-8,lFh:90,lFk:10,lBh:70,lBk:0},
      {rot:-30,lean:22,hunch:24,head:-24,jaw:20,aFs:30,aFe:20,rz:-60,aBs:-20,aBe:0,hx:-6,lFh:110,lFk:10,lBh:60,lBk:-60},
      {rot:0,lean:32,hunch:24,head:-26,jaw:20,aFs:60,aFe:40,rz:-70,aBs:20,aBe:4,hx:-4,lFh:78,lFk:-2,lBh:6,lBk:-86,fB:60},
      {rot:0,lean:14,hunch:16,head:-16,jaw:14,aFs:30,aFe:50,rz:-30,aBs:30,aBe:70,hx:-1,lFh:30,lFk:-12,lBh:-12,lBk:-34},
      {lean:7,hunch:12,head:-10,jaw:10}][i]},
    death:{nome:'Morte (lama escorre, cai de bruços na poça)',n:8,dur:i=>[90,150,160,170,150,140,160,600][i],pose:i=>[
      {lean:-10,hunch:4,head:8,jaw:42,aFs:-30,aFe:-10,rz:20,aBs:-40,aBe:-24,hx:-5,flash:1,lFh:14,lBh:-4},
      {lean:-4,hunch:8,head:12,jaw:50,aFs:-10,aFe:4,rz:10,aBs:-16,aBe:0,hx:-6,lFh:10,lBh:-8,helm:0,hloose:1,hdx:-8,hdy:40,hdr:-30,drip:1},
      {lean:10,hunch:18,head:-2,jaw:48,aFs:4,aFe:6,rz:-10,aBs:0,aBe:2,hx:-4,lFh:40,lFk:-30,lBh:28,lBk:-50,fF:10,fB:30,helm:0,hloose:1,hdx:-18,hdy:28,hdr:-110,pool:0.3,drip:2},
      {lean:14,hunch:26,head:-8,jaw:50,aFs:6,aFe:4,rz:-20,aBs:2,aBe:0,hx:-2,lFh:14,lFk:-92,lBh:6,lBk:-96,fF:100,fB:100,helm:0,hloose:1,hdx:-26,hdy:10,hdr:-200,pool:0.5,drip:3},
      {rot:20,lean:14,hunch:28,head:-8,jaw:50,aFs:24,aFe:20,rz:-30,aBs:16,aBe:14,hx:0,lFh:2,lFk:-92,lBh:-6,lBk:-96,fF:90,fB:90,helm:0,hloose:1,hdx:-30,hdy:0,hdr:-260,pool:0.7},
      {rot:54,lean:10,hunch:24,head:-12,jaw:44,aFs:80,aFe:96,rz:-40,aBs:60,aBe:80,hx:4,lFh:-20,lFk:-70,lBh:-28,lBk:-74,fF:60,fB:60,helm:0,hloose:1,hdx:-34,hdy:0,hdr:-270,pool:0.85},
      {rot:86,lean:2,hunch:12,head:-4,jaw:40,aFs:150,aFe:170,rz:-40,aBs:110,aBe:150,hx:8,lFh:-4,lFk:-10,lBh:-8,lBk:-14,fF:10,fB:10,helm:0,hloose:1,hdx:-36,hdy:0,hdr:-270,pool:1},
      {rot:90,lean:0,hunch:10,head:0,jaw:42,aFs:160,aFe:176,rz:-40,aBs:116,aBe:156,hx:8,lFh:-2,lFk:-6,lBh:-6,lBk:-10,fF:6,fB:6,helm:0,hloose:1,hdx:-36,hdy:0,hdr:-270,pool:1.1,drool:3}][i]},
    // adereços (desenhados pelo motor como ator extra; âncora em cv._ax/_gy)
    xMud:{nome:'Lama de mercúrio voando (adereço)',n:4,prop:true,dur:()=>60,pose:i=>({st:i})},
    xMound:{nome:'Terra se mexendo (adereço)',n:4,prop:true,dur:()=>80,pose:i=>({st:i})},
  };
  const EXK=['hx','lean','hunch','head','aFs','aFe','aBs','aBe','lFh','lFk','lBh','lBk'];
  function exag(P,f){ if(f===1||Math.abs(P.rot)>4||P.sink>0) return P; EXK.forEach(k=>{ P[k]=REST[k]+(P[k]-REST[k])*f; }); P.jaw=Math.min(58,mx(0,REST.jaw+(P.jaw-REST.jaw)*f)); return P; }
  const EXF={idle:1.05,walk:1.08,alert:1.12,attack:1.16,throw:1.12,dig:1.06,emerge:1.1,open:1.06,hurt:1.3,hurtB:1.25,fall:1.1,getup:1.08,death:1.1};
  ZREACT.add(ANIMS,REST,{moves:{shove:['swipe','Cabo da picareta (revés)']}});
  function poseOf(anim,i){ const A=ANIMS[anim]; if(A&&A.prop) return Object.assign({},REST,A.pose(i)); return exag(Object.assign({},REST,A.pose(i)),EXF[anim]||1); }
  function heavyOutline(cv){ const g=cv.getContext('2d'), W=cv.width, H=cv.height, im=PIX.pix(cv), d=im.data;
    const isO=i=>d[i+3]===255&&d[i]===0x17&&d[i+1]===0x0b&&d[i+2]===0x1c, fill=i=>d[i+3]===255&&!isO(i);
    const add=[]; for(let y=2;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(d[i+3]) continue; const u=((y-1)*W+x)*4, u2=((y-2)*W+x)*4; if(isO(u)&&fill(u2)) add.push(i); }
    add.forEach(i=>{ d[i]=0x17; d[i+1]=0x0b; d[i+2]=0x1c; d[i+3]=255; }); g.putImageData(im,0,0); }

  /* ---------- esqueleto (largo, ombro pesado, peito de barril, inclinado pra frente) ---------- */
  const SPINE=42, TH=20.5, SH=20.5, UA=15.4, FA=14.6, VS=SPINE/37, US=1.3, HB=12, HS=1.22;
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
    const top=SS[SPINE], neck=T(2,-35), sa=top.a;
    const shF=T(0,-31), shB=T(-6.6,-32);
    const elF=lp(shF,P.aFs-R,UA), wrF=lp(elF,P.aFe-R,FA), elB=lp(shB,P.aBs-R,UA), wrB=lp(elB,P.aBe-R,FA);
    const ha=sa+rad(P.head-HB*0.8), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:neck.x+(lx*hc-ly*hs)*HS, y:neck.y+(lx*hs+ly*hc)*HS});
    // picareta: punho -> cabo -> cabeça de ferro (perpendicular)
    const fa=Math.atan2(wrF.x-elF.x,wrF.y-elF.y)*180/PI, pa=rad(fa+P.rz), pd={x:Math.sin(pa),y:Math.cos(pa)};
    const grip={x:wrF.x+(wrF.x-elF.x)/FA*4.6, y:wrF.y+(wrF.y-elF.y)/FA*4.6};
    const hb={x:grip.x-pd.x*7, y:grip.y-pd.y*7}, ht={x:grip.x+pd.x*27, y:grip.y+pd.y*27};
    const pn={x:-pd.y, y:pd.x};
    const spike={x:ht.x+pn.x*15-pd.x*3.4, y:ht.y+pn.y*15-pd.y*3.4}, adze={x:ht.x-pn.x*10-pd.x*1.4, y:ht.y-pn.y*10-pd.y*1.4};
    const toe=(a,f)=>{ const t=rad(f+R); return {x:a.x+(11*Math.cos(t)-5*Math.sin(t))*1.34, y:a.y+(11*Math.sin(t)+5*Math.cos(t))*1.34}; };
    const hull=[[ankleF,6.4],[ankleB,6.4],[toe(ankleF,P.fF),1],[toe(ankleB,P.fB),1],[kneeF,5.6],[kneeB,5.6],[hip,10],[T(0,-18),12],[T(-2,-30),12],[H(3,-11),11],[wrF,4.4],[wrB,4.4],[elF,4.4],[elB,4.4]];
    return {R,hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,SP,T,sa,neck,shF,shB,elF,wrF,elB,wrB,ha,H,hull,ra,grip,pd,pn,hb,ht,spike,adze,toeF:toe(ankleF,P.fF)};
  }
  function skeleton(P){
    const a=build(P,0); let m=-1e9; a.hull.forEach(([p,r])=>{ m=Math.max(m,p.y+r); });
    return build(P,GROUND-m-(P.lift||0)+(P.sink>0&&P.sink<200?P.sink:0));
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
  // rachaduras na crosta de lama (linhas finas em zigue-zague no tom escuro)
  function cracks(p,M,pts){ p.F(M.mud[3]); pts.forEach(([a,b])=>p.cap(a,b,0.7,0.5)); }
  // pepita encravada na pele (brilha)
  function nugget(p,M,q,r,form){ p.F(M.gold[3]); p.ell(q.x,q.y+0.4,r+0.6,r*0.8+0.5); p.F(M.gold[1]); p.ell(q.x,q.y,r,r*0.8); p.F(M.gold[0]); p.rect(q.x-r*0.5,q.y-r*0.6,r*0.7,r*0.5); if(form==='plenilunar'){ p.F(M.glow[0]); p.rect(q.x-0.4,q.y-0.4,0.8,0.8); } }

  /* ---------- picareta ---------- */
  function drawPick(p,M,sk,P,form){
    const {hb,ht,pd,pn,spike,adze}=sk;
    // cabo de madeira (curvo leve), com fita de borracha no punho
    const n=sideN(hb,ht);
    p.F(M.wood[1]); p.cap(hb,ht,3.4,3);
    p.F(M.wood[2]); p.cap(off(hb,n,0.8),off(ht,n,0.8),1.4,1.2);
    p.F(M.wood[0]); p.cap(off(lerp(hb,ht,0.2),n,-0.8),off(lerp(hb,ht,0.85),n,-0.8),0.7,0.6);
    p.F(M.wood[3]); [0.35,0.5,0.62].forEach(t=>{ const q=lerp(hb,ht,t); p.rect(q.x-0.4,q.y-0.4,0.9,0.9); }); // nós da madeira
    p.F(M.earth[1]); { const q=lerp(hb,ht,0.72); p.ell(q.x,q.y,1.8,1.4); }
    p.F(M.rubber[1]); p.cap(lerp(hb,ht,0.02),lerp(hb,ht,0.16),3.8,3.8); p.F(M.rubber[0]); { const q=lerp(hb,ht,0.08); p.rect(q.x-0.5,q.y-1,1,1); }
    // olho da picareta (alvado) e cabeça: ponta curva pra frente, enxó chata pra trás
    const eye0={x:ht.x-pd.x*2.6,y:ht.y-pd.y*2.6}, eye1={x:ht.x+pd.x*2.4,y:ht.y+pd.y*2.4};
    const sp1={x:ht.x+pn.x*7-pd.x*0.6,y:ht.y+pn.y*7-pd.y*0.6};
    const head=[[eye0.x+pn.x*2.4,eye0.y+pn.y*2.4],[sp1.x-pd.x*2.2,sp1.y-pd.y*2.2],[spike.x,spike.y],[sp1.x+pd.x*1.8,sp1.y+pd.y*1.8],[eye1.x+pn.x*2.4,eye1.y+pn.y*2.4],
      [eye1.x-pn.x*2.6,eye1.y-pn.y*2.6],[adze.x+pd.x*2.2,adze.y+pd.y*2.2],[adze.x-pd.x*2.4,adze.y-pd.y*2.4],[eye0.x-pn.x*2.6,eye0.y-pn.y*2.6]];
    p.F(M.iron[1]); p.poly(head);
    // sombra no lado de baixo da cabeça, brilho no dorso, fio
    p.F(M.iron[2]); p.poly([[eye1.x+pn.x*2.4,eye1.y+pn.y*2.4],[sp1.x+pd.x*1.8,sp1.y+pd.y*1.8],[spike.x,spike.y],[sp1.x+pd.x*0.4,sp1.y+pd.y*0.4],[ht.x+pn.x*2,ht.y+pn.y*2],
      [ht.x-pn.x*2,ht.y-pn.y*2],[adze.x+pd.x*0.6,adze.y+pd.y*0.6],[adze.x+pd.x*2.2,adze.y+pd.y*2.2],[eye1.x-pn.x*2.6,eye1.y-pn.y*2.6]]);
    p.F(M.iron[0]); p.cap({x:eye0.x+pn.x*3,y:eye0.y+pn.y*3},{x:sp1.x-pd.x*1.6+pn.x*2,y:sp1.y-pd.y*1.6+pn.y*2},0.7,0.5);
    p.cap({x:eye0.x-pn.x*3,y:eye0.y-pn.y*3},{x:adze.x-pd.x*1.8+pn.x*1.4,y:adze.y-pd.y*1.8+pn.y*1.4},0.6,0.5);
    p.F(M.iron[3]); p.rect(adze.x-0.6,adze.y-0.6,1.2,1.2);
    // ferrugem e barro na cabeça
    p.F(M.rust[1]); [[0.45,0.3],[0.7,-0.2]].forEach(([t,k])=>{ const q=lerp(ht,spike,t); p.ell(q.x+pd.x*k,q.y+pd.y*k,1.4,1); });
    p.F(M.rust[2]); { const q=lerp(ht,adze,0.5); p.ell(q.x,q.y,1.3,0.9); }
    p.F(M.mud[1]); { const q=lerp(ht,spike,0.82); p.ell(q.x,q.y,1.2,0.9); }
    // cunha do alvado
    p.F(M.wood[2]); p.rect(ht.x-pd.x*3.4-0.7,ht.y-pd.y*3.4-0.7,1.4,1.4);
    if(form!=='comum'){ p.F(M.glow[1]); const a=lerp(ht,spike,0.55), b=lerp(ht,spike,0.9); p.cap(a,b,0.5,0.4); }
  }

  /* ---------- bateia (cone raso de metal com lama prateada) ---------- */
  // local: origem no centro da boca, x pra frente; tilt em graus (positivo = boca virada pra frente)
  function drawPan(c,p,M,ox,oy,ang,sc,P,form,sy){
    p.xf(ang,ox,oy); c.scale(sc,sc*(sy||1));
    const rimF=[]; for(let i=0;i<20;i++){ const a=i/20*PI*2; rimF.push([Math.cos(a)*10,Math.sin(a)*2.4]); }
    p.F(M.pan[2]); p.poly([[-10,0],[10,0],[3.6,5.4],[-3.6,5.4]]);           // cone por baixo
    p.F(M.pan[3]); p.poly([[-3.6,5.4],[3.6,5.4],[2.8,6.2],[-2.8,6.2]]);
    p.F(M.pan[1]); p.poly([[-10,0],[-3,0],[-1,5.4],[-3.6,5.4]]);
    p.F(M.pan[0]); p.poly([[-8.6,0.6],[-6.4,0.6],[-3,4.6],[-3.8,4.8]]);       // reflexo
    p.F(M.pan[1]); p.poly(rimF);                                              // boca
    p.F(M.pan[3]); p.poly(rimF.map(([x,y])=>[x*0.86,y*0.7+0.3]));
    p.F(M.merc[2]); p.poly(rimF.map(([x,y])=>[x*0.74,y*0.56+0.4]));          // lama de mercúrio dentro
    p.F(M.merc[1]); p.ell(-1.4,0.2,4,0.8); p.F(M.merc[0]); p.rect(-3,-0.2,1.6,0.5); p.rect(2.4,0.3,0.8,0.4);
    p.F(M.mud[2]); p.ell(4.2,0.6,1.8,0.6);
    p.F(M.pan[0]); p.rect(-9,-0.6,5,0.5);
    p.F(M.earth[1]); p.ell(6,2.2,1.6,0.8); // barro na lateral
    p.id();
  }

  /* ---------- braços: musculosos, crosta de lama, veias de mercúrio ---------- */
  function drawArm(c,u,M,sk,P,front,form){
    const p=mkPen(c,u), sh=front?sk.shF:sk.shB, el=front?sk.elF:sk.elB, wr=front?sk.wrF:sk.wrB; p._c=c; p.id();
    const nU=limb(p,M.skin,sh,el,13.6,11.4,{hl:0.55});
    const nF=limb(p,M.skin,el,wr,11.6,9.4,{hl:0.6});
    p.F(M.skin[1]); p.circle(el,5.4);
    // músculo: deltoide e bíceps com luz, tríceps na sombra
    p.F(M.skin[0]); const d0=lerp(sh,el,0.18); p.ell(d0.x-nU.nx*2.6,d0.y-nU.ny*2.6,2.2,1.6);
    const b0=lerp(sh,el,0.55); p.cap(off(b0,nU,-3.6),off(lerp(sh,el,0.8),nU,-3),1,0.8);
    p.F(M.skin[2]); p.cap(off(lerp(sh,el,0.35),nU,3.6),off(lerp(sh,el,0.85),nU,3.2),1.4,1.1);
    // crosta de lama no antebraço (rachada) e respingos no braço
    const m0=lerp(el,wr,0.28), m1=lerp(el,wr,0.96);
    p.F(M.mud[1]); p.cap(m0,m1,11,9.4);
    p.F(M.mud[2]); p.cap(off(m0,nF,2.4),off(m1,nF,2),5,4.2);
    p.F(M.mud[0]); p.cap(off(lerp(el,wr,0.36),nF,-3),off(lerp(el,wr,0.7),nF,-2.6),1.2,1);
    p.F(M.mud[1]); p.poly([[m0.x-nF.nx*5,m0.y-nF.ny*5],[m0.x-nF.nx*2+(el.x-wr.x)*0.16,m0.y-nF.ny*2+(el.y-wr.y)*0.16],[m0.x+nF.nx*1,m0.y+nF.ny*1],[m0.x+nF.nx*4+(el.x-wr.x)*0.1,m0.y+nF.ny*4+(el.y-wr.y)*0.1],[m0.x+nF.nx*5.4,m0.y+nF.ny*5.4]]); // borda irregular
    { const a=lerp(el,wr,0.45), b=lerp(el,wr,0.62), e=lerp(el,wr,0.8); cracks(p,M,[[off(a,nF,-4),off(lerp(a,b,0.5),nF,-1)],[off(lerp(a,b,0.5),nF,-1),off(b,nF,1.6)],[off(b,nF,-3.6),off(e,nF,-0.6)],[off(e,nF,-0.6),off(lerp(e,wr,0.6),nF,2)]]); }
    p.F(M.mud[2]); const sp=lerp(sh,el,0.66); p.ell(sp.x+nU.nx*1,sp.y+nU.ny*1,1.6,1.1); p.F(M.mud[1]); p.ell(sp.x-nU.nx*2.6,sp.y-nU.ny*2.6+2,1.1,0.8);
    // veias de mercúrio descendo do ombro
    p.F(M.vein[1]); const v0=lerp(sh,el,0.12), v1=lerp(sh,el,0.5), v2=lerp(sh,el,0.9);
    p.cap(off(v0,nU,-1),off(v1,nU,-0.2),0.8,0.7); p.cap(off(v1,nU,-0.2),off(v2,nU,-1.4),0.7,0.6); p.cap(off(v1,nU,-0.2),off(lerp(sh,el,0.7),nU,1.8),0.6,0.5);
    p.F(M.vein[0]); { const q=off(v1,nU,-0.2); p.rect(q.x-0.4,q.y-0.4,0.8,0.8); }
    if(form!=='comum'){ p.F(M.glow[1]); p.cap(off(v1,nU,-0.2),off(v2,nU,-1.4),0.5,0.4); }
    if(front){ nugget(p,M,off(lerp(sh,el,0.38),nU,1.6),1.2,form); }
    else { p.F(M.flesh[2]); const r=lerp(sh,el,0.4); p.ell(r.x+nU.nx*2,r.y+nU.ny*2,1.8,1.2); p.F(M.flesh[1]); p.rect(r.x+nU.nx*2-0.5,r.y+nU.ny*2-0.6,1,0.8); }
    if(front){ drawPick(p,M,sk,P,form); drawFist(p,M,el,wr,true); }
    else {
      if(P.pan>=0.5){ const ang=Math.atan2(wr.y-el.y,wr.x-el.x); const hp={x:wr.x+(wr.x-el.x)/FA*7.5,y:wr.y+(wr.y-el.y)/FA*7.5};
        drawPan(c,p,M,hp.x,hp.y,rad(-(P.pt||0)),1.3,P,form,1.7); p.id(); drawFist(p,M,el,wr,false); }
      else drawFist(p,M,el,wr,false);
    }
  }
  function drawFist(p,M,el,wr,front){
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y); p._c.scale(1.36,1.36);
    p.F(M.skin[1]); p.poly([[-1,-3.6],[4.6,-4],[6.4,-1],[6,3.6],[-1,3.8]]);
    p.F(M.skin[2]); p.poly([[-1,1.4],[6.2,1.2],[6,3.6],[-1,3.8]]);
    p.F(M.skin[0]); p.rect(0.4,-3.4,3.8,0.9);
    for(let k=0;k<4;k++){ const y0=-3+k*2; p.F(M.skin[1]); p.ell(6.2,y0,1.8,1.1); p.F(M.skin[2]); p.rect(5.6,y0+0.4,1.6,0.5); p.F(M.nail[1]); p.rect(6.8,y0-0.4,0.9,0.7); }
    p.F(M.skin[1]); p.cap(P2(1.6,-3.4),P2(5.2,-4.8),2,1.5); p.F(M.skin[3]); p.rect(2,0.6,3,0.6);
    p.F(M.mud[1]); p.ell(2.4,1.8,1.8,1.2); p.F(M.mud[2]); p.rect(1.6,2.2,1.4,0.6);
    p.id();
  }

  /* ---------- pernas: bermuda de brim surrada, joelho de fora, bota de borracha com barro ---------- */
  function drawLeg(c,u,M,sk,P,front){
    const p=mkPen(c,u), hip=front?sk.hipF:sk.hipB, knee=front?sk.kneeF:sk.kneeB, ank=front?sk.ankleF:sk.ankleB; p.id();
    // canela de pele (entre a bermuda e a bota)
    const nS=limb(p,M.skin,knee,lerp(knee,ank,0.5),11.4,10,{hl:0.6});
    p.F(M.skin[1]); p.circle(knee,5.8); p.F(M.skin[0]); p.ell(knee.x+nS.nx*-1.6,knee.y+nS.ny*-1.6-0.6,2,1.4);
    p.F(M.mud[1]); { const q=lerp(knee,ank,0.3); p.ell(q.x+nS.nx*1.4,q.y+nS.ny*1.4,2.6,1.6); } p.F(M.vein[1]); { const a=lerp(knee,ank,0.08), b=lerp(knee,ank,0.42); p.cap(off(a,nS,-2.6),off(b,nS,-1.6),0.6,0.5); }
    // bota de borracha (cano alto até meia canela)
    const b0=lerp(knee,ank,0.42);
    const nB=limb(p,M.rubber,b0,ank,11.6,11,{hl:0.5,sh:0.55});
    p.F(M.rubber[2]); p.cap(off(b0,nB,-6),off(b0,nB,6),2.2,2.2); p.F(M.rubber[0]); p.cap(off(b0,nB,-5.4),off(b0,nB,-1),0.8,0.8); // borda do cano
    p.F(M.rubber[0]); p.cap(off(lerp(b0,ank,0.2),nB,-3.4),off(lerp(b0,ank,0.7),nB,-3.6),0.8,0.7); // brilho da borracha
    // dobras e barro subindo pela bota
    p.F(M.rubber[2]); { const q=lerp(b0,ank,0.55); p.cap(off(q,nB,-1),off(q,nB,4),0.8,0.8); }
    p.F(M.earth[1]); p.cap(off(lerp(b0,ank,0.62),nB,-5.6),off(lerp(b0,ank,0.62),nB,5.6),2.4,2.4);
    p.F(M.mud[1]); p.poly([[lerp(b0,ank,0.66).x-nB.nx*5.6,lerp(b0,ank,0.66).y-nB.ny*5.6],[lerp(b0,ank,0.5).x-nB.nx*3,lerp(b0,ank,0.5).y-nB.ny*3],[lerp(b0,ank,0.6).x,lerp(b0,ank,0.6).y],[lerp(b0,ank,0.44).x+nB.nx*3,lerp(b0,ank,0.44).y+nB.ny*3],[lerp(b0,ank,0.66).x+nB.nx*5.6,lerp(b0,ank,0.66).y+nB.ny*5.6]]);
    // coxa: bermuda de brim
    const kb=lerp(hip,knee,1.02);
    const nT=limb(p,M.denim,hip,kb,15.6,13.8,{hl:0.55});
    p.F(M.denim[2]); p.cap(off(kb,nT,-7),off(kb,nT,7),1.8,1.8); // barra
    p.F(M.denim[0]); [[-6,-4],[-3,1],[1,-3],[4,2],[6.4,-2]].forEach(([k,d])=>{ const q=off(kb,nT,k); p.rect(q.x-0.4,q.y+0.6,0.8,1.6+(d>0?1:0)); }); // fiapos da barra
    p.F(M.denim[2]); p.cap(off(lerp(hip,knee,0.25),nT,1.4),off(lerp(hip,knee,0.5),nT,4.6),0.9,0.8); p.cap(off(lerp(hip,knee,0.55),nT,-1),off(lerp(hip,knee,0.8),nT,3),0.9,0.8);
    p.F(M.denim[0]); p.cap(off(lerp(hip,knee,0.15),nT,-4),off(lerp(hip,knee,0.6),nT,-4.4),0.9,0.8); // desbotado
    p.F(M.denim[3]); p.cap(off(lerp(hip,knee,0.1),nT,6),off(lerp(hip,knee,0.9),nT,5.6),0.6,0.6); // costura lateral
    p.F(M.mud[1]); { const q=lerp(hip,knee,0.6); p.ell(q.x+nT.nx*2,q.y+nT.ny*2,2.4,1.6); } p.F(M.mud[2]); { const q=lerp(hip,knee,0.65); p.rect(q.x+nT.nx*2.6,q.y+nT.ny*2.6,1.2,1); }
    if(front){ p.F(M.denim[3]); const r=lerp(hip,knee,0.45); p.poly([[r.x-nT.nx*3,r.y-nT.ny*3],[r.x-nT.nx*0.6+1,r.y-nT.ny*0.6-1.6],[r.x+nT.nx*1.6,r.y+nT.ny*1.6],[r.x-nT.nx*0.6,r.y-nT.ny*0.6+2]]); p.F(M.skin[2]); p.ell(r.x-nT.nx*0.6,r.y-nT.ny*0.6,1.2,0.9); }
    // pé da bota (bico redondo, sola grossa de garra)
    const fa=rad((front?P.fF:P.fB)+sk.R); p.xf(fa,ank.x,ank.y); c.scale(1.34,1.34);
    p.F(M.rubber[1]); p.poly([[-4,-2.6],[3,-2.6],[7.2,-0.6],[10.4,1],[11.2,3.4],[-4.4,3.4]]);
    p.F(M.rubber[2]); p.poly([[-4.4,1.8],[11,2],[11.2,3.4],[-4.4,3.4]]);
    p.F(M.rubber[0]); p.poly([[0,-2.2],[3,-2.2],[6.8,-0.4],[6.4,0.4],[2.6,-1.2],[0,-1.2]]);
    p.F(M.rubber[3]); p.poly([[-4.8,3.4],[11.8,3.4],[11.6,4.8],[-4.6,4.8]]); [0,3,6,9].forEach(x=>p.rect(-3.6+x,4.8,1.6,0.7)); // sola com garra
    p.F(M.earth[1]); p.poly([[-4.8,2.6],[3,2.2],[6,3],[11.6,3],[11.8,4.8],[-4.6,4.8]]); p.F(M.mud[1]); p.ell(2,2.6,2.2,0.9); p.ell(8.4,2.8,1.6,0.7); p.F(M.earth[2]); p.rect(-2,4,3,0.8);
    p.id();
  }

  /* ---------- tronco: peito de barril, regata rasgada, crosta de lama, cinto de corda, saco ---------- */
  const BODY=[[-9.6,7],[-10.4,-4],[-11.4,-14],[-12.4,-24],[-12.4,-31],[-10,-36.4],[-5,-39.4],[2,-40],[8,-38.4],[12,-34],[14,-27],[14.8,-19],[14.2,-11],[13.2,-4],[12.6,3],[10.4,7.6],[0,8.4]];
  const TANK=[[-10.4,-2],[-11.2,-12],[-12,-22],[-11.6,-30],[-9.4,-35],[-7,-37.6],[-5.4,-33],[-2,-29],[3,-28.4],[7.4,-30],[9.4,-35.4],[11.4,-33],[13.6,-26],[14.4,-19],[13.8,-11],[12.4,-6],[9,-4],[5.4,-7],[2,-3.4],[-2,-6],[-5,-2.6]];
  function drawSack(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    const a=Wp(sk,-11,-30), b=Wp(sk,-16.4,-14), cc=Wp(sk,-12,-8);
    p.F(M.sack[1]); p.poly([[a.x,a.y],[a.x-4,a.y+3],[b.x-2,b.y],[b.x+1,b.y+5],[cc.x,cc.y+2],[cc.x+3,cc.y-6]]);
    p.F(M.sack[2]); p.poly([[b.x-2,b.y],[b.x+1,b.y+5],[cc.x,cc.y+2],[cc.x-1,cc.y-2],[b.x+1,b.y]]);
    p.F(M.sack[0]); p.poly([[a.x-2,a.y+3],[a.x-1,a.y+2],[b.x+1,b.y-6],[b.x,b.y-4]]);
    p.F(M.sack[3]); p.rect(a.x-1.2,a.y+0.4,2.4,1.4); // amarração
    p.F(M.sack[2]); [[0.4,0.3],[0.6,0.6]].forEach(([t,k])=>{ const q=lerp(a,b,t); p.cap({x:q.x-1.6,y:q.y},{x:q.x+1.2,y:q.y+k*2},0.6,0.5); }); // dobras
    // pepitas aparecendo pelo rasgo
    p.F(M.sack[3]); const r=lerp(b,cc,0.4); p.ell(r.x,r.y-1,2.4,1.6);
    nugget(p,M,{x:r.x-0.8,y:r.y-1.2},1.2,form); nugget(p,M,{x:r.x+1.2,y:r.y-0.4},0.9,form);
    p.F(M.earth[1]); p.ell(b.x+0.6,b.y+3.6,1.6,1);
  }
  function drawTorso(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    const shape=W(sk,BODY);
    p.F(M.skin[1]); p.poly(shape);
    clip(c,shape,()=>{
      // volumes da pele: peitoral com luz, sombra nas costas e sob o peito
      p.F(M.skin[0]); p.poly(W(sk,[[3,-36],[9,-38],[13.4,-30],[14,-24],[9,-23],[4,-27]]));
      p.F(M.skin[2]); p.poly(W(sk,[[-14,10],[-14,-42],[-8,-40],[-9,-30],[-8.4,-18],[-7.4,-6],[-6,10]]));
      p.F(M.skin[3]); p.poly(W(sk,[[-14,10],[-14,-42],[-10.6,-40],[-11,-30],[-10.4,-18],[-9.6,-6],[-9,10]]));
      p.F(M.skin[2]); p.poly(W(sk,[[4,-23],[14,-22.6],[14.4,-21],[5,-21.6]]));
      // barriga (abdômen pesado)
      p.F(M.skin[2]); p.poly(W(sk,[[6,-12],[13.6,-12.6],[13.4,-11],[7,-10.6]])); p.poly(W(sk,[[7,-6],[13,-6.6],[12.8,-5.2],[7.4,-4.8]]));
      // regata rasgada (alças, buracos), suada e manchada de barro
      const tk=W(sk,TANK);
      p.F(M.tank[1]); p.poly(tk);
      clip(c,tk,()=>{
        p.F(M.tank[0]); p.poly(W(sk,[[4,-30],[9,-33],[13,-27],[14,-19],[10,-20],[6,-25]]));
        p.F(M.tank[2]); p.poly(W(sk,[[-13,0],[-13,-36],[-7,-36],[-8,-26],[-7,-14],[-6,0]]));
        p.F(M.tank[3]); p.poly(W(sk,[[-13,0],[-13,-36],[-10,-36],[-10.4,-26],[-9.8,-14],[-9.4,0]]));
        p.F(M.tank[2]); [[[-2,-20],[4,-22],[4.4,-21],[-1.6,-19.2]],[[0,-12],[6,-14],[6.2,-13],[0.4,-11.2]],[[6,-17],[12,-18],[12,-17],[6.4,-16.2]]].forEach(f=>p.poly(W(sk,f))); // dobras
        p.F(M.tank[0]); p.poly(W(sk,[[2,-16],[8,-17.4],[8.2,-16.6],[2.4,-15.4]]));
        // mancha de suor/barro escorrida
        p.F(M.earth[1]); p.poly(W(sk,[[-4,-26],[0,-27],[1,-18],[-1,-12],[-3,-16]])); p.F(M.earth[2]); p.poly(W(sk,[[-2.6,-20],[-0.6,-20.4],[-1,-13.4],[-2,-15]]));
        // buraco rasgado mostrando a pele + pepita encravada
        p.F(M.tank[3]); p.poly(W(sk,[[7,-24],[11,-25],[12.4,-20],[9.6,-17.4],[7,-19]]));
        p.F(M.skin[1]); p.poly(W(sk,[[7.6,-23.4],[10.6,-24.2],[11.6,-20.4],[9.6,-18.4],[7.6,-19.6]]));
        nugget(p,M,Wp(sk,9.6,-21.4),1.4,form);
      });
      // borda esfiapada da regata (embaixo)
      p.F(M.tank[2]); [[-9,-2],[-5,-2.6],[-1,-5],[4,-5],[8,-4]].forEach(([uu,vv])=>{ const q=Wp(sk,uu,vv); p.rect(q.x-0.5,q.y,1,1.8); });
      // crosta de lama laranja no ventre e no flanco (rachada)
      const crust=W(sk,[[-12,8],[-12,-10],[-9,-14],[-5,-11],[-1,-15],[3,-12],[7,-15],[11,-12],[14,-14],[15,-6],[14,8]]);
      p.F(M.mud[1]); p.poly(crust);
      clip(c,crust,()=>{
        p.F(M.mud[0]); p.poly(W(sk,[[3,-12],[8,-14],[12,-12],[13,-8],[8,-8],[4,-9]]));
        p.F(M.mud[2]); p.poly(W(sk,[[-14,10],[-14,-14],[-7,-14],[-7.4,-4],[-6,10]]));
        p.F(M.mud[3]); p.poly(W(sk,[[-14,10],[-14,-14],[-10,-14],[-10.4,-4],[-9.6,10]]));
        p.F(M.mud[2]); p.poly(W(sk,[[-2,-4],[14,-4],[14,-2.6],[-2,-2.6]]));
        // placas de barro seco (lascas claras) e manchas molhadas escuras
        p.F(M.mud[2]); [[1,-7,2.2,1.4],[10,-6,1.8,1.2],[-3,-10,1.6,1],[6,-11,1.4,0.9]].forEach(([uu,vv,a,b])=>{ const q=Wp(sk,uu,vv); p.ell(q.x,q.y,a,b); });
        p.F(M.earth[2]); [[-1,-6,1.2,0.8],[12,-9,1,0.7]].forEach(([uu,vv,a,b])=>{ const q=Wp(sk,uu,vv); p.ell(q.x,q.y,a,b); });
        p.F(M.mud[0]); [[4,-6],[8,-10],[-1,-12],[12,-4]].forEach(([uu,vv])=>{ const q=Wp(sk,uu,vv); p.rect(q.x-0.8,q.y-0.4,1.6,0.6); });
      });
      // escorridos de lama pendurados na borda de cima da crosta
      p.F(M.mud[1]); [[-5,-11,3],[3,-12,2.4],[11,-12,2]].forEach(([uu,vv,L])=>{ const a=Wp(sk,uu,vv), b=Wp(sk,uu+0.4,vv-L); p.cap(a,b,1.6,1); });
      p.F(M.mud[2]); [[-5,-11],[3,-12]].forEach(([uu,vv])=>{ const q=Wp(sk,uu,vv); p.rect(q.x-0.4,q.y-1,0.8,1); });
      cracks(p,M,[[Wp(sk,-9,-6),Wp(sk,-7,-2)],[Wp(sk,9,-2),Wp(sk,12,1)],[Wp(sk,0,-11),Wp(sk,3,-8)],[Wp(sk,3,-8),Wp(sk,2,-4)],[Wp(sk,3,-8),Wp(sk,7,-7)],[Wp(sk,7,-7),Wp(sk,10,-9)],[Wp(sk,10,-9),Wp(sk,12,-6)],[Wp(sk,-6,-9),Wp(sk,-4,-5)],[Wp(sk,-4,-5),Wp(sk,-6,-1)]]);
      p.F(M.mud[1]); [[13,-20,1.4,1],[-3,-30,1,0.8],[5,-33,1.2,0.9]].forEach(([uu,vv,a,b])=>{ const q=Wp(sk,uu,vv); p.ell(q.x,q.y,a,b); }); // respingos
      // costelas expostas no flanco de trás com raízes saindo
      p.F(M.flesh[3]); p.poly(W(sk,[[-11.6,-26],[-7.4,-28],[-5,-23],[-5.6,-16],[-8.6,-14.6],[-11.4,-18]]));
      p.F(M.flesh[2]); p.poly(W(sk,[[-11,-25],[-7.8,-26.6],[-6,-22.6],[-6.6,-17.4],[-8.6,-16.2],[-10.6,-18.6]]));
      p.F(form==='plenilunar'?M.bone[0]:M.bone[1]); [-23.4,-20.6,-17.8].forEach(v=>p.poly(W(sk,[[-10.6,v],[-6.2,v-0.9],[-6.2,v+0.1],[-10.6,v+0.9]])));
      p.F(M.bone[2]); [-22.6,-19.8].forEach(v=>p.poly(W(sk,[[-10.4,v],[-6.4,v-0.6],[-6.4,v+0.1],[-10.4,v+0.6]])));
    });
    // raízes brotando das costelas (pra fora da silhueta)
    p.F(M.root[1]); [[[-10,-24],[-15.4,-27.4],[-17.6,-26]],[[-9,-19],[-14.6,-17.6],[-16.4,-19.6]],[[-7,-15.4],[-10,-11],[-12.6,-11.4]]].forEach(r=>{ const a=Wp(sk,r[0][0],r[0][1]), b=Wp(sk,r[1][0],r[1][1]), d=Wp(sk,r[2][0],r[2][1]); p.cap(a,b,1.6,1); p.cap(b,d,1,0.6); });
    p.F(M.root[0]); { const a=Wp(sk,-10,-24.6), b=Wp(sk,-14.6,-27.4); p.cap(a,b,0.5,0.4); }
    p.F(M.root[3]); { const a=Wp(sk,-9,-18.4), b=Wp(sk,-14,-17); p.cap(a,b,0.5,0.4); }
    if(form!=='comum'){ p.F(M.glow[1]); [[[-10.2,-22],[-7,-22.6]],[[-10.2,-19.2],[-7,-19.8]]].forEach(([a,b])=>p.cap(Wp(sk,a[0],a[1]),Wp(sk,b[0],b[1]),0.5,0.5)); }
    // alça do saco atravessando o peito (diagonal)
    p.F(M.sack[2]); p.poly(W(sk,[[-8,-37],[-5,-38],[13,-10],[10.6,-9]])); p.F(M.sack[1]); p.poly(W(sk,[[-7,-37.6],[-5.6,-38],[12.4,-10.6],[11.4,-10]]));
    p.F(M.sack[3]); p.poly(W(sk,[[2,-26],[4,-26.6],[4.4,-25],[2.4,-24.6]]));
    // cós da bermuda + cinto de corda + fivela improvisada
    p.F(M.denim[1]); p.poly(W(sk,[[-10.6,0],[13,-1],[13.4,9],[-10.4,9]]));
    p.F(M.denim[2]); p.poly(W(sk,[[-10.6,0],[-4,-0.4],[-4,9],[-10.4,9]])); p.F(M.denim[0]); p.poly(W(sk,[[4,-0.6],[12,-1],[12.2,0],[4,0.4]]));
    p.F(M.denim[3]); p.poly(W(sk,[[6,1],[6.8,1],[7,9],[6.2,9]])); // braguilha
    p.F(M.root[1]); p.poly(W(sk,[[-11,-1.6],[13.4,-2.6],[13.6,0],[-10.8,0.8]])); p.F(M.root[0]); [-8,-2,4,10].forEach(uu=>{ const q=Wp(sk,uu,-1.4); p.rect(q.x-0.6,q.y-0.4,1.2,0.6); });
    p.F(M.root[2]); { const q=Wp(sk,12.4,-1); p.ell(q.x,q.y,1.6,1.4); p.F(M.root[1]); p.cap(q,{x:q.x+1,y:q.y+5},0.8,0.6); }
    p.F(M.mud[1]); { const q=Wp(sk,2,4); p.ell(q.x,q.y,2.6,1.6); } p.F(M.earth[1]); { const q=Wp(sk,-6,6); p.ell(q.x,q.y,1.8,1.2); }
    // bateia pendurada na cintura (de lado, atrás do quadril)
    if(P.pan<0.5){ const q=Wp(sk,-12.4,3); drawPan(c,p,M,q.x,q.y,sk.sa+rad(-28),0.8,P,form,1.5); p.id();
      p.F(M.root[1]); { const a=Wp(sk,-10.6,-0.6); p.cap(a,{x:q.x+1,y:q.y-2},0.8,0.6); }
      // gota de mercúrio pingando da bateia (idle)
      const dp=(P.drip|0)%4; if(dp<3){ p.F(M.merc[1]); p.ell(q.x-2.6,q.y+5+dp*3,0.9,1.2); p.F(M.merc[0]); p.rect(q.x-3,q.y+4.6+dp*3,0.6,0.6); } }
  }

  /* ---------- cabeça: capacete amassado, barba empastada, olhos brancos fundos, veias de mercúrio ---------- */
  function drawHelmet(c,p,M,form,o){
    o=o||{};
    // aba da frente e casco (amassado em cima), barro escorrendo
    p.F(M.helm[2]); p.poly([[-10,1],[-11,-1],[12,-1.6],[17.4,0.2],[16,1.8],[4,1.6]]);
    p.F(M.helm[1]); p.poly([[-10.6,0],[-10.4,-6],[-8,-11],[-3,-13.6],[2,-12.4],[4.6,-14.2],[9,-13.2],[12.4,-9],[13.4,-3],[12,-0.6],[-10,-0.2]]);
    const dome=[[-10.6,0],[-10.4,-6],[-8,-11],[-3,-13.6],[2,-12.4],[4.6,-14.2],[9,-13.2],[12.4,-9],[13.4,-3],[12,-0.6],[-10,-0.2]];
    clip(c,dome,()=>{
      p.F(M.helm[2]); p.poly([[-12,2],[-12,-16],[-5,-16],[-6.6,-8],[-6,2]]);
      p.F(M.helm[3]); p.poly([[-12,2],[-12,-16],[-8.4,-16],[-9.4,-8],[-9,2]]);
      p.F(M.helm[0]); p.poly([[3,-12.6],[8.4,-12.6],[11,-9],[7,-10]]); p.rect(5,-8.6,4,0.8);
      p.F(M.helm[2]); p.poly([[0.4,-13],[2,-12.4],[3,-9.6],[1.2,-10]]); // amassado
      p.F(M.helm[3]); p.poly([[1,-12.2],[2,-12],[2.4,-10.4],[1.6,-10.6]]);
      p.F(M.helm[2]); p.poly([[-3,-14],[-1.6,-14],[-1.2,0],[-2.8,0]]); // nervura central
      p.F(M.helm[0]); p.poly([[-1.4,-13.6],[-0.8,-13.6],[-0.6,-1],[-1.2,-1]]);
      p.F(M.earth[1]); p.poly([[-9,-4],[-5,-6],[-4,0],[-9,0]]); p.F(M.mud[1]); p.poly([[6,-3],[10,-4],[10.6,-1],[8.6,2],[8,-1],[6.6,0]]); // barro
      p.F(M.mud[2]); p.ell(-6,-9,1.6,1); p.F(M.rust[2]); p.rect(9.4,-11,1.4,1);
    });
    p.F(M.helm[0]); p.poly([[2,-0.8],[15,-0.6],[16.4,0.2],[3,0.4]]); // luz na aba
    p.F(M.helm[3]); p.poly([[-10,1],[16,1.8],[15.4,2.6],[-9.6,2]]);
    if(form==='enluarado'){ p.F(M.glow[1]); p.rect(4,-12,3,0.6); }
    if(form==='plenilunar'){ p.F(M.blood[1]); p.poly([[10,-6],[12.4,-6],[12,-1],[11,1.6],[10.6,-2]]); }
  }
  function drawHead(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.xf(sk.ha,sk.neck.x,sk.neck.y); c.scale(HS,HS);
    // pescoço grosso de touro com veias de mercúrio
    p.F(M.skin[1]); p.poly([[-5.4,5],[5.4,5],[6.2,-4],[-4.6,-7]]);
    p.F(M.skin[2]); p.poly([[-5.4,5],[-1,5],[-1.6,-6],[-4.6,-7]]);
    p.F(M.vein[1]); p.poly([[2.4,-4],[3.2,-4],[3.6,4],[2.6,4]]); p.poly([[3,0],[5.6,2.4],[5.2,3],[2.8,1]]); p.poly([[-0.4,-2],[0.2,-2],[-0.6,4.6],[-1.2,4.6]]);
    p.F(M.vein[0]); p.rect(2.6,-1.6,0.6,1.2);
    if(form!=='comum'){ p.F(M.glow[1]); p.rect(2.6,0,0.7,3); }
    // crânio (largo, testa baixa)
    p.F(M.skin[1]); p.ell(2.4,-12,9.8,9.4);
    p.poly([[-4,-6],[11.6,-7.8],[13,-4.4],[6,-2.6],[-2.4,-3]]);
    p.F(M.skin[2]); p.poly([[-7.4,-15],[-5.4,-6],[0,-2.6],[6,-2.6],[2,-5],[-2,-9],[-3,-14],[-5.4,-18]]);
    p.F(M.skin[3]); p.poly([[-7.4,-14],[-6.6,-9],[-4.6,-5.2],[-5.2,-11]]);
    p.F(M.skin[0]); p.poly([[5,-8.4],[9.8,-9],[9,-7.6],[5.4,-7.4]]);
    // orelha
    p.F(M.skin[1]); p.ell(-2.8,-11,2.4,3.2); p.F(M.skin[3]); p.ell(-2.6,-10.8,1.1,1.9); p.F(M.mud[1]); p.rect(-4,-9,1.2,1.2);
    // sobrancelha pesada (testa franzida), órbita funda, olho branco sem pupila
    p.F(M.skin[2]); p.poly([[4,-13.4],[12.6,-13.2],[12.8,-11.4],[4.4,-11.6]]);
    p.F(M.beard[1]); p.poly([[4.6,-13.4],[8.6,-14.2],[12.8,-13],[12.6,-12.2],[8.6,-12.8],[4.8,-12.2]]);
    p.F(M.skin[3]); p.ell(8.6,-9.8,2.8,2.1);
    p.F(M.eye[1]); p.ell(8.8,-9.6,1.9,1.2); p.F(M.eye[0]); p.rect(8.2,-10.2,1.2,0.7); p.F(M.eye[2]); p.rect(9.6,-9.2,0.8,0.6);
    p.F(M.skin[3]); p.ell(12.4,-9.8,0.9,1.3); p.F(M.eye[1]); p.rect(12.1,-10,0.8,0.8);
    // nariz largo, quebrado
    p.F(M.skin[1]); p.poly([[11,-10.6],[14.6,-6.4],[14,-5.2],[11,-5.8]]);
    p.F(M.skin[3]); p.rect(12.8,-5.8,1.4,0.9); p.F(M.skin[0]); p.rect(11.8,-9.4,0.8,1.4);
    // bigode e barba de cima empastados de barro
    p.F(M.beard[1]); p.poly([[6,-6],[14.4,-6.2],[14.6,-4.6],[11,-3.6],[6.4,-4]]);
    p.F(M.beard[2]); p.poly([[7,-4.6],[14.2,-5],[14,-4.2],[7.4,-4]]); p.F(M.beard[0]); p.rect(9,-5.8,2.4,0.6);
    p.F(M.beard[1]); p.poly([[-0.6,-9.8],[1.6,-9.6],[4,-4],[1,-3]]); // costeleta/barba lateral
    p.F(M.mud[1]); p.ell(12,-4.6,1.4,0.8);
    // boca de cima: dentes marrons
    p.F(M.mouth[1]); p.poly([[6.4,-4],[13.6,-4.2],[13.4,-2.2],[6.4,-2]]);
    p.F(M.teeth[1]); [[7.6,-4.2,1.2,1.6],[9.2,-4.2,1.2,1.3],[10.8,-4.2,1.2,1.8],[12.4,-4.2,0.9,1.2]].forEach(([x,y,w,h])=>p.rect(x,y,w,h));
    p.F(M.teeth[2]); p.rect(10.8,-2.8,1.2,0.5);
    p.F(M.rot?M.rot[1]:M.mud[2]); p.ell(1,-8,1.6,1.2);
    if(form!=='comum'){ p.F(M.glow[0]); p.rect(8.2,-10,1.8,1); p.F(M.glow[1]); p.rect(12.1,-10,0.8,0.9); }
    p.id();
    if(P.helm>=0.5){ const o=sk.H(2.4,-15.6); p.xf(sk.ha+rad(4),o.x,o.y); c.scale(HS,HS); drawHelmet(c,p,M,form); p.id(); }
    else { // careca suja com cabelo ralo
      p.xf(sk.ha,sk.neck.x,sk.neck.y); c.scale(HS,HS);
      p.F(M.beard[1]); p.poly([[-7.6,-13],[-6,-19],[-1,-21.4],[5,-21.2],[9.6,-18.6],[4,-19.6],[-2,-19],[-5,-13]]);
      p.F(M.mud[1]); p.ell(2,-19.6,2,1); p.id();
    }
  }
  function drawJaw(c,u,M,sk,P){
    const p=mkPen(c,u); const h=sk.H(2.6,-3.6); p.xf(sk.ha+rad(P.jaw),h.x,h.y); c.scale(HS,HS);
    // queixo largo coberto pela barba empastada
    p.F(M.skin[1]); p.poly([[-2,-1.4],[11,-0.8],[12,1.6],[11,5],[6.4,6.6],[0.6,5.8],[-2.4,2.8]]);
    p.F(M.mouth[1]); p.poly([[3,-0.8],[10.4,-0.4],[10.4,1.4],[3.4,1.2]]);
    p.F(M.tongue[1]); p.poly([[4,0.4],[9,0.2],[10,1.4],[5,1.6]]); p.F(M.tongue[0]); p.rect(6,0.2,2,0.5);
    p.F(M.teeth[1]); [[4.6,-1,1.2,1.4],[6.4,-1,1.2,1.8],[8.2,-1,1.2,1.3],[9.8,-1,0.9,1.6]].forEach(([x,y,w,h])=>p.rect(x,y,w,h));
    p.F(M.beard[1]); p.poly([[-2.4,1],[2,2],[5,2.4],[10,2.2],[12,1.6],[12.6,4.6],[11.4,8.6],[9,11.4],[6.4,9.4],[4,11],[1.6,8.4],[-0.6,7.6],[-2.6,4]]);
    p.F(M.beard[2]); p.poly([[-2.6,4],[2,5.4],[6,6],[11,5.6],[11.4,8.6],[9,11.4],[6.4,9.4],[4,11],[1.6,8.4],[-0.6,7.6]]);
    p.F(M.beard[0]); p.poly([[6,3],[10.6,2.8],[10.2,4],[6.4,4.2]]); p.rect(2,3,1.4,0.6);
    p.F(M.mud[1]); p.poly([[4,6],[8,6.4],[7.6,9],[5.4,10.4],[4.6,8]]); p.F(M.mud[2]); p.ell(9.6,8.4,1.2,1.2); p.F(M.mud[0]); p.rect(5.4,6.4,1.4,0.6); // barro grudado
    const L=2+(P.drool%4)*1.2+(P.jaw>30?2:0);
    p.F(M.merc[1]); p.poly([[10.6,5.4],[11.6,5],[11.4,5+L],[10.8,6+L]]); p.ell(11.1,6+L,0.9,0.9); // baba prateada
    p.id();
  }
  function drawMouthIn(c,u,M,sk,P){
    if(P.jaw<16) return; const p=mkPen(c,u); p.id();
    const a=sk.H(6.4,-2.4), b=sk.H(13.4,-2.6), h=sk.H(2.6,-3.6), ja=sk.ha+rad(P.jaw), jc=Math.cos(ja), js=Math.sin(ja);
    const J=(x,y)=>({x:h.x+(x*jc-y*js)*HS,y:h.y+(x*js+y*jc)*HS}), d=J(10.4,0.6), e=J(3,0.6);
    p.F(M.mouth[2]); p.poly([[a.x,a.y],[b.x,b.y],[d.x,d.y],[e.x,e.y]]);
    p.F(M.mouth[3]); const m=lerp(lerp(a,b,0.3),lerp(e,d,0.3),0.5); p.circle(m,1.6);
  }
  function drawSmear(c,u,M,sk,P){
    const p=mkPen(c,u); p.id();
    const sh=sk.shF, w=sk.spike, r=Math.hypot(w.x-sh.x,w.y-sh.y)+2, a1=Math.atan2(w.y-sh.y,w.x-sh.x);
    const n=10, pts=[]; for(let i=0;i<=n;i++){ const a=a1-1.5+1.55*i/n; pts.push([sh.x+Math.cos(a)*r,sh.y+Math.sin(a)*r]); }
    for(let i=n;i>=0;i--){ const a=a1-1.5+1.55*i/n, rr=r-3-9*(i/n); pts.push([sh.x+Math.cos(a)*rr,sh.y+Math.sin(a)*rr]); }
    p.F(M.swish[0]); p.poly(pts.map(([x,y])=>[Math.max(1,Math.min(FW-2,x)),Math.max(1,Math.min(GROUND,y))]));
    p.F(M.swish[2]); const q=pts.slice(n-3,n+1); for(let k=0;k<q.length-1;k++) p.cap({x:q[k][0],y:q[k][1]},{x:q[k+1][0],y:q[k+1][1]},1,1);
  }
  // lama de mercúrio saindo da bateia (no quadro do lançamento)
  function drawSpill(c,u,M,sk,P){
    const p=mkPen(c,u); p.id();
    const wr=sk.wrB, el=sk.elB, d={x:(wr.x-el.x)/FA,y:(wr.y-el.y)/FA}, o={x:wr.x+d.x*9,y:wr.y+d.y*9}, k=P.spill;
    // jato em arco: bolhas que crescem e se separam (lama prateada com barro)
    const B=[[4,-3,2.6],[10,-7,3.2],[17,-9,3.4],[24,-9,3],[30,-7,2.4],[35,-4,1.8],[39,-1,1.2]];
    B.forEach(([x,y,r],i)=>{ const q={x:o.x+x*k,y:o.y+y*k}, rr=r*(0.6+0.4*k);
      p.F(M.merc[3]); p.ell(q.x+0.4,q.y+0.6,rr,rr*0.75); p.F(M.merc[2]); p.ell(q.x,q.y,rr,rr*0.75);
      p.F(M.merc[1]); p.ell(q.x-rr*0.3,q.y-rr*0.25,rr*0.5,rr*0.35); if(i%2===0){ p.F(M.merc[0]); p.rect(q.x-rr*0.5,q.y-rr*0.5,0.8,0.6); }
      if(i===2||i===4){ p.F(M.mud[1]); p.ell(q.x+rr*0.3,q.y+rr*0.2,rr*0.4,rr*0.3); } });
    p.F(M.merc[1]); [[14,-14,1],[28,-13,0.9],[42,-6,0.8],[20,-3,0.8]].forEach(([x,y,r])=>p.circle({x:o.x+x*k,y:o.y+y*k},r));
  }

  /* ---------- chão: rachadura, monte de terra, torrões, poça ---------- */
  function drawCrack(c,u,M,sk,P){
    const p=mkPen(c,u); p.id();
    const x0=sk.spike.x, y=GROUND-1;
    p.F(M.earth[3]); p.poly([[x0-12,y],[x0-4,y-1.4],[x0,y-0.4],[x0+6,y-1.6],[x0+13,y],[x0+6,y+0.8],[x0,y+1.2],[x0-6,y+0.8]]);
    p.F(M.earth[2]); p.poly([[x0-16,y+0.2],[x0-12,y-0.4],[x0-10,y+0.4]]); p.poly([[x0+12,y-0.2],[x0+18,y-1],[x0+16,y+0.6]]);
    p.F(M.earth[1]); [[-8,-3,1.6,1.1],[7,-4,1.4,1],[11,-2.6,1,0.8],[-3,-4.6,1.2,0.9]].forEach(([dx,dy,a,b])=>p.ell(x0+dx,y+dy,a,b));
    p.F(M.earth[0]); p.rect(x0-9,y-4,1,0.6); p.rect(x0+6.4,y-4.8,1,0.6);
  }
  function moundAt(p,M,x,k,form){
    if(k<=0) return;
    const w=17*k+4, h=8*k+1, y=GROUND;
    const pts=[]; for(let i=0;i<=16;i++){ const a=PI*i/16, j=1+0.12*Math.sin(i*2.7); pts.push([x-Math.cos(a)*w*j, y-Math.sin(a)*h*j]); }
    p.F(M.earth[1]); p.poly(pts);
    p.F(M.earth[2]); p.poly(pts.slice(0,7).concat([[x-w*0.3,y],[x-w,y]]));
    p.F(M.earth[3]); p.poly([[x-w,y],[x-w*0.7,y-h*0.4],[x-w*0.5,y]]);
    p.F(M.earth[0]); p.poly([[x+w*0.05,y-h*0.98],[x+w*0.45,y-h*0.78],[x+w*0.2,y-h*0.62],[x-w*0.1,y-h*0.8]]);
    p.F(M.mud[1]); p.ell(x+w*0.3,y-h*0.4,2.4*k+0.6,1.4*k+0.4); p.ell(x-w*0.35,y-h*0.55,1.8*k+0.4,1*k+0.4);
    p.F(M.mud[2]); p.rect(x-w*0.1,y-h*0.4,1.4,0.8);
    // rachaduras no topo e torrões soltos na base
    p.F(M.earth[3]); p.cap({x:x-w*0.2,y:y-h*0.85},{x:x+w*0.1,y:y-h*0.6},0.7,0.5); p.cap({x:x+w*0.1,y:y-h*0.6},{x:x+w*0.32,y:y-h*0.75},0.6,0.5);
    p.F(M.earth[1]); [[-1.15,-0.8],[1.1,-1],[1.3,-0.6],[-1.3,-0.5]].forEach(([dx,r])=>p.ell(x+dx*w,y+r,1.6,1.1));
    p.F(M.earth[2]); [[-1.15,-0.2],[1.1,-0.4]].forEach(([dx,r])=>p.rect(x+dx*w-0.8,y+r,1.6,0.6));
    if(form!=='comum'){ p.F(M.glow[1]); p.rect(x-1,y-h*0.7,2,0.6); }
  }
  function drawMound(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    const x=AX+(P.mx||0)+6;
    moundAt(p,M,x,P.mound,form);
  }
  function drawDebris(c,u,M,sk,P,seed){
    const p=mkPen(c,u); p.id();
    const x=AX+(P.mx||0)+6, k=P.debris;
    const CL=[[-22,-18,2.4],[-14,-34,2],[-4,-44,2.8],[8,-40,2.2],[18,-28,2.6],[26,-14,1.8],[-28,-8,1.6],[12,-52,1.6],[-10,-56,1.4],[30,-30,1.4]];
    CL.forEach(([dx,dy,r],i)=>{ const j=((i*37+seed*11)%7)/7-0.5; const q={x:x+dx*(0.6+0.5*k)+j*4,y:GROUND+dy*k-2+j*3};
      p.F(M.earth[2]); p.ell(q.x+0.4,q.y+0.5,r,r*0.8); p.F(M.earth[1]); p.ell(q.x,q.y,r,r*0.8); p.F(M.earth[0]); p.rect(q.x-r*0.5,q.y-r*0.6,r*0.6,r*0.4);
      if(i%3===0){ p.F(M.mud[1]); p.rect(q.x+r*0.2,q.y,r*0.6,r*0.5); } });
    p.F(M.earth[0]); [[-6,-22],[4,-30],[16,-18],[-16,-26]].forEach(([dx,dy])=>p.rect(x+dx*(0.6+0.5*k),GROUND+dy*k,1,1));
  }
  function drawPool(c,u,M,sk,P){
    const p=mkPen(c,u); p.id();
    const k=P.pool, x=AX+20, w=24*k+4, h=3.4*k+1;
    p.F(M.merc[3]); p.ell(x,GROUND-0.6,w+1.2,h+0.8);
    p.F(M.merc[2]); p.ell(x,GROUND-0.8,w,h);
    p.F(M.merc[1]); p.ell(x-w*0.2,GROUND-1.2,w*0.55,h*0.5);
    p.F(M.merc[0]); p.rect(x-w*0.4,GROUND-1.8,w*0.3,0.6); p.rect(x+w*0.3,GROUND-1.2,2,0.5);
    p.F(M.mud[1]); p.ell(x+w*0.5,GROUND-0.8,3*k,1.1*k+0.2);
  }
  function drawLooseHelm(c,u,M,sk,P,form){
    const p=mkPen(c,u); const y=GROUND-6-P.hdy;
    p.xf(rad(P.hdr),AX+P.hdx,y); c.scale(HS,HS); drawHelmet(c,p,M,form); p.id();
  }

  /* ---------- adereços ---------- */
  const PW=58, PH=40, PG=22, PAX=29;
  function frameProp(form,anim,st,K){
    const M=mats(form), s=((st|0)%4+4)%4;
    let parts;
    if(anim==='xMound'){
      parts=[{draw:(c,u)=>{ const p=mkPen(c,u); p.id(); moundAtP(p,M,PAX,PH-4,[0.9,1,0.85,1.05][s],form);
        p.F(M.earth[1]); [[-14,-6],[12,-9],[-6,-12],[16,-4]].forEach(([dx,dy],i)=>{ if((i+s)%2) return; p.ell(PAX+dx,PH-4+dy-(s%2)*2,1.6,1.2); }); }}];
      const cv=compose({FW:Math.round(PW*K),FH:Math.round(PH*K),GROUND:PH*K,parts,M,step:5,flash:0,rim:RIM[form]}); cv._ax=PAX*K; cv._gy=(PH-4)*K; return cv;
    }
    // xMud: bolha de lama de mercúrio girando (com respingos)
    parts=[
      {noShade:true, noRim:true, smear:true, draw:(c,u)=>{ const p=mkPen(c,u); p.id(); p.F(M.merc[2]); p.poly([[4,PG-1],[16,PG-4],[18,PG+2],[6,PG+2]]); p.F(M.merc[1]); [[8,PG-6],[12,PG+5]].forEach(([x,y])=>p.ell(x,y,1.2,0.9)); }},
      {draw:(c,u)=>{ const p=mkPen(c,u); p.id(); const sq=[1,0.86,1,1.12][s], a=s*PI/4;
        p.F(M.merc[2]); p.ell(PAX,PG,7*sq,5.4/sq,a);
        p.F(M.merc[1]); p.ell(PAX-1,PG-1,5.4*sq,3.8/sq,a);
        p.F(M.mud[1]); p.ell(PAX+2.4*Math.cos(a),PG+2*Math.sin(a),2.6,1.8,a); p.F(M.mud[2]); p.rect(PAX+2,PG+1,1.2,0.8);
        p.F(M.merc[0]); p.rect(PAX-3,PG-3,2,1); p.rect(PAX+1.6,PG-2.6,0.8,0.8);
        p.F(M.merc[1]); [[10,-6,1.6],[-10,5,1.2],[12,6,1]].forEach(([dx,dy,r],i)=>{ if((i+s)%3===2) return; p.circle({x:PAX+dx,y:PG+dy},r); }); }},
    ];
    const cv=compose({FW:Math.round(PW*K),FH:Math.round(PH*K),GROUND:PH*K,parts,M,step:5,flash:0,rim:RIM[form]});
    cv._ax=PAX*K; cv._gy=PG*K; return cv;
  }
  function moundAtP(p,M,x,y,k,form){ // monte no canvas do adereço (chão em y)
    const w=17*k+4, h=8*k+1;
    const pts=[]; for(let i=0;i<=16;i++){ const a=PI*i/16, j=1+0.12*Math.sin(i*2.7); pts.push([x-Math.cos(a)*w*j, y-Math.sin(a)*h*j]); }
    p.F(M.earth[1]); p.poly(pts); p.F(M.earth[2]); p.poly(pts.slice(0,7).concat([[x-w*0.3,y],[x-w,y]]));
    p.F(M.earth[0]); p.poly([[x+w*0.05,y-h*0.98],[x+w*0.45,y-h*0.78],[x+w*0.2,y-h*0.62],[x-w*0.1,y-h*0.8]]);
    p.F(M.mud[1]); p.ell(x+w*0.3,y-h*0.4,2.4*k+0.6,1.4*k+0.4);
    p.F(M.earth[3]); p.cap({x:x-w*0.2,y:y-h*0.85},{x:x+w*0.1,y:y-h*0.6},0.7,0.5);
    if(form!=='comum'){ p.F(M.glow[1]); p.rect(x-1,y-h*0.7,2,0.6); }
  }

  /* ---------- montagem ---------- */
  const cache=PIX.cache();
  function frame(form,anim,fi,step=5,Pov,pk){
    const K=PIX.getK(), key=(pk!=null?'#'+pk+'|'+form:form+'|'+anim+'|'+fi+'|'+step)+'@'+K;
    const hit=cache.get(key); if(hit){ cache.delete(key); cache.set(key,hit); return hit; }
    if(ANIMS[anim]&&ANIMS[anim].prop){ const st=Pov&&Pov.st!=null?Math.round(Pov.st):fi; const cv=frameProp(form,anim,st,K); cache.set(key,cv); return cv; }
    const P=Pov?Object.assign({},REST,Pov):poseOf(anim,fi), M=mats(form), sk=skeleton(P);
    const gone=P.sink>=200, sunk=P.sink>0&&!gone;
    // afundado: o corpo é recortado na linha do chão
    const G=fn=>(c,u)=>{ if(!sunk) return fn(c,u); c.save(); c.setTransform(1,0,0,1,0,0); c.beginPath(); c.rect(0,0,c.canvas.width,Math.round((GROUND+0.5)*K)); c.clip(); fn(c,u); c.restore(); };
    const parts=[];
    if(P.pool>0) parts.push({draw:(c,u)=>drawPool(c,u,M,sk,P)});
    if(P.crack>=0.5 && !gone) parts.push({draw:(c,u)=>drawCrack(c,u,M,sk,P)});
    if(!gone){
      parts.push(
        {back:true, draw:G((c,u)=>drawSack(c,u,M,sk,P,form))},
        ...(P.pan>=0.5?[]:[{back:true, draw:G((c,u)=>drawArm(c,u,M,sk,P,false,form))}]),
        {back:true, draw:G((c,u)=>drawLeg(c,u,M,sk,P,false))},
        {draw:G((c,u)=>drawLeg(c,u,M,sk,P,true))},
        {draw:G((c,u)=>drawTorso(c,u,M,sk,P,form))},
        {draw:G((c,u)=>{ drawHead(c,u,M,sk,P,form); drawMouthIn(c,u,M,sk,P); })}, {draw:G((c,u)=>drawJaw(c,u,M,sk,P))});
      if(P.pan>=0.5) parts.push({draw:G((c,u)=>drawArm(c,u,M,sk,P,false,form))});
      if(P.spill>0) parts.push({noShade:true, smear:true, noRim:true, draw:(c,u)=>drawSpill(c,u,M,sk,P)});
      if(P.smear>=0.5) parts.push({noShade:true, smear:true, noRim:true, draw:(c,u)=>drawSmear(c,u,M,sk,P)});
      parts.push({draw:G((c,u)=>drawArm(c,u,M,sk,P,true,form))});
      if(P.hloose>=0.5) parts.push({draw:(c,u)=>drawLooseHelm(c,u,M,sk,P,form)});
    }
    if(P.mound>0) parts.push({draw:(c,u)=>drawMound(c,u,M,sk,P,form)});
    if(P.debris>0) parts.push({draw:(c,u)=>drawDebris(c,u,M,sk,P,fi|0)});
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM[form]}); if(step>=4) heavyOutline(cv);
    const sc=q=>({x:q.x*K,y:q.y*K});
    if(gone){ const g={x:AX+(P.mx||0)+6,y:GROUND-8}; cv._eye=sc(g); cv._mouth=sc(g); cv._hand=sc(g); cv._head=sc(g); cv._blade=sc(g); cv._handB=sc(g); }
    else { cv._eye=sc(sk.H(8.8,-9.6)); cv._mouth=sc(sk.H(10,-2)); cv._hand=sc(sk.wrF); cv._head=sc(sk.H(3,-13)); cv._blade=sc(sk.spike); cv._handB=sc(sk.wrB); }
    cache.set(key,cv); if(cache.size>900) cache.delete(cache.keys().next().value);
    return cv;
  }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame,framePose:function(form,anim,P,key){ return frame(form,anim,0,5,P,key); }};
})();
