/* ACAIZEIRO — fonte de arte (editável). Build: npm run art
   Zumbi Açaizeiro (comum do Ver-o-Peso, Belém): carregador ribeirinho da Feira do Açaí, morto e de pé de novo,
   ainda curvado sob o paneiro cheio. Silhueta em "C": corcunda, tronco muito inclinado, braços longos e fortes,
   PANEIRO de arumã alto nas costas (cesto cônico que abre pra cima, borda verde amarrada, forrado de folha e
   coroado de açaí), passando acima da cabeça. Alça de cipó na testa (por baixo do chapéu de palha) e outra no
   peito. Camisa de manga curta cor de barro, bermuda de brim escura com corda na cintura, pés descalços com lama
   roxa, peconha de fibra no tornozelo, facão curto de coleta embainhado no quadril.
   Corrupção da Lua: olhos de lua, açaí vazando do paneiro como sangue roxo brilhante, caroços com olhos, raízes
   de cipó nascendo nas costas (plenilunar: cipós vivos se mexendo). Trabalhador do rio, sem estereótipo.
   Golpes: rasteira do paneiro (sweep, termina de joelho: wobble), paneirada (bash, cotovelada com o paneiro
   erguido), derramar o açaí (spill: inclina o paneiro por cima do ombro → adereço xBlob voando e poça xPool).
   Forma "<forma>~vazio" = paneiro quebrado (sem açaí, rachado) — o motor escolhe a forma.
   Hi-bit: honra PIX.getK(). */
const ACAIZEIRO=(function(){
  const {rad,lerp,P2,mkPen,compose}=PIX;
  const FW=212, FH=172, GROUND=158, AX=96;
  const RIM={comum:'#d6c8f4', enluarado:'#9ff6ff', plenilunar:'#ffb46a'};

  /* ---------- materiais ---------- */
  function mats(form){
    const m={
      skin:['#c4d8a4','#86a070','#56705a','#2e3a40'],
      vein:['#a8bcc8','#6a86a0','#46587a','#28304e'],
      rot:['#b8b088','#80785a','#565050','#302a38'],
      flesh:['#f6a894','#c25460','#7a344c','#4a1a36'],
      bone:['#fff4d8','#dccfa6','#a09070','#605040'],
      shirt:['#f0c888','#bc8a4c','#78543c','#3e2a34'],
      shorts:['#74a2d6','#3a64a2','#283e70','#141c3a'],
      cord:['#e2c27e','#a8803e','#6a4c2a','#3a2618'],
      straw:['#fbd486','#cc8e3e','#84542a','#472818'],
      weave:['#fff0b8','#e6b864','#a4682e','#5e341c'],
      rimg:['#b4f08a','#46a84e','#26703e','#123c2a'],
      leaf:['#d0f08e','#74b84a','#3e7c3a','#1e4428'],
      acai:['#d48cff','#7a2aaa','#481670','#22083a'],
      bloom:['#f0e6ff','#a69ce8','#5e56a6','#2e2860'],
      juice:['#f2b8ff','#b44ae8','#7a1eb0','#40086a'],
      hat:['#fff2bc','#dcb874','#9c7644','#5a4026'],
      band:['#9a4a3a','#6a2a26','#441a1e','#260e14'],
      vine:['#b6d07a','#6e8a40','#465a28','#262e18'],
      mud:['#9c7c5c','#66503a','#42322a','#241a18'],
      steel:['#f6fcff','#c8d0d4','#6a7078','#3a3e4a'],
      handle:['#9a7050','#5e4030','#3a281e','#1e140e'],
      eye:['#ffffff','#fff4b4','#f2c43e','#a8681e'],
      mouth:['#7a2a4a','#4a1430','#2c0a1e','#18040e'],
      teeth:['#fbf0c0','#d8c27c','#9a8650','#5e4e30'],
      hair:['#4a4450','#2c2832','#1e1a24','#100c16'],
      blood:['#b8303a','#7a1020','#561020','#320818'],
      acid:['#c8f070','#8ab840','#5a7a2a','#34461a'],
      glow:['#f6ecff','#d8a8ff','#a060e0','#5a2aa0'],
      swish:['#fdfdff','#ece6ff','#bcb0ec','#7c70b4'],
    };
    if(form==='enluarado'){
      m.skin=['#d8d8ff','#9c9ee2','#6668ac','#3a3874']; m.vein=['#a8f4ff','#4ad8f0','#2a8ab0','#1a4a7a'];
      m.rot=['#b8a6e0','#8470b0','#56468a','#33285e']; m.flesh=['#f0b0ff','#b866d8','#7a3a9e','#46206a']; m.blood=['#b46ad8','#7e3ea6','#542474','#34144a'];
      m.straw=['#d8e6ff','#8aa2d8','#56669e','#2e3666']; m.weave=['#f0f8ff','#b4c8f0','#6a7cba','#384274'];
      m.acai=['#c8fbff','#6a5ae8','#3a2cae','#1a1266']; m.juice=['#eaffff','#7af4ff','#3a9ce0','#1a3e94']; m.bloom=['#ffffff','#a8f8ff','#4ac0e8','#1e5a9a'];
      m.eye=['#ffffff','#b8fbff','#4ad8f0','#1a8aa8']; m.glow=['#effffe','#7af4ff','#2ab0d8','#146a96']; m.swish=['#ffffff','#c8fbff','#6ae4f4','#2a9ab8'];
      m.shirt=['#ccc6ec','#8e88bc','#5c5888','#343256']; m.shorts=['#8aa4dc','#4c62a2','#323e76','#1a2048'];
      m.hat=['#eceaff','#aeb2e0','#7276aa','#40426e']; m.rimg=['#b8fff0','#4ad0c0','#2a8a96','#164a62'];
      m.leaf=['#c8fff0','#5ac8b0','#2e7e86','#16425a']; m.vine=['#b8e8f0','#6aa0b8','#3e6486','#203454'];
      m.mud=['#a8a0c8','#76709a','#4e4a70','#2e2a48'];
    }
    if(form==='plenilunar'){
      m.skin=['#ffcaa6','#e2806a','#a4424e','#5e1e36']; m.vein=['#fff0a0','#ffb43a','#e0581e','#8a2414'];
      m.rot=['#d0806a','#9a4a4a','#682a3a','#3e1628']; m.flesh=['#ffc07a','#f06a3a','#a8302e','#5e1422']; m.blood=['#ff7a3a','#d43a26','#8a1c22','#4e0c18'];
      m.straw=['#ffd890','#ee8a3a','#a63e22','#5a1a16']; m.weave=['#fff4c0','#ffc060','#d4642a','#7a2a18'];
      m.acai=['#ff9ab0','#b0183c','#6c0c28','#380616']; m.juice=['#ffc0a8','#e8283e','#940e2c','#4c0818']; m.bloom=['#fff0e0','#ff9a8a','#c0404a','#6a1a28'];
      m.eye=['#fffbe0','#ffe04a','#ff8a2a','#b83a14']; m.glow=['#fff6c0','#ffb43a','#e0581e','#8a2414']; m.swish=['#fffbe6','#ffe6a8','#ffb460','#d0602a'];
      m.shirt=['#f0b490','#b8705a','#7a3e3e','#44202a']; m.hat=['#ffe0a0','#e8a05a','#a85a36','#5e2a20'];
      m.rimg=['#e0f080','#90a838','#5a6a24','#2e3414']; m.leaf=['#e8e070','#a0a040','#62602a','#323016']; m.vine=['#ff9a6a','#c8402e','#842028','#461018'];
      m.teeth=['#fffbe0','#ffe680','#ffb43a','#b86a20']; m.mud=['#b4705a','#844a3e','#5a2e2e','#36181e'];
    }
    return punch(m);
  }
  const NAMES={skin:'Pele',vein:'Veias',rot:'Podridão',flesh:'Carne',bone:'Osso',shirt:'Camisa de algodão (barro)',shorts:'Bermuda de brim',cord:'Alça de cipó / corda',straw:'Paneiro (arumã)',weave:'Trama do paneiro',rimg:'Borda amarrada',leaf:'Folha do forro',acai:'Açaí (caroços)',bloom:'Brilho do caroço',juice:'Suco de açaí',hat:'Chapéu de palha',band:'Fita do chapéu',vine:'Raízes de cipó',mud:'Lama',steel:'Lâmina do facão',handle:'Cabo/bainha',eye:'Olho de lua',mouth:'Boca',teeth:'Dentes',hair:'Cabelo',blood:'Sangue',acid:'Ácido',glow:'Brilho',swish:'Rastro do golpe'};
  function sat(h,k){ const [r,g,b]=PIX.hexRgb(h), y=(r+g+b)/3; return PIX.toHex(y+(r-y)*k,y+(g-y)*k,y+(b-y)*k); }
  const NOPUNCH={swish:1,glow:1,juice:1,eye:1};
  function punch(m){ const o={}; for(const k in m){ const r=m[k]; o[k]=NOPUNCH[k]?[r[0],r[1],r[2],r[3]]:[sat(r[0],1.12),sat(r[1],1.24),PIX.mix(sat(r[2],1.2),'#2a1a4c',0.26),PIX.mix(r[3],'#140a24',0.38)]; } return o; }

  /* ---------- poses ---------- */
  // ângulos: 0 = pendurado, + = pra frente (relativos ao corpo, como no Malandro/Peixeiro).
  // bk = inclinação do paneiro (+ = tomba pra frente por cima do ombro), bl = paneiro erguido (px no eixo da coluna),
  // pour = jorro de açaí saindo da boca do paneiro (0..1), drop = paneiro solto no chão (0..1; ddx/drot = onde/como
  // cai), spill = poça de açaí no chão (morte/queda), smear = rastro (1 cotovelada, 2 rasteira rente ao chão,
  // 3 jato de suco), vt = fase dos cipós vivos.
  const REST={hx:0,rot:0,lift:0,lean:14,hunch:16,head:-24,jaw:8,aFs:12,aFe:26,aBs:-6,aBe:12,lFh:16,lFk:-4,lBh:-8,lBk:-18,fF:0,fB:0,bk:0,bl:0,pour:0,drop:0,ddx:-34,drot:-84,spill:0,smear:0,flash:0,drool:0,ct:0,vt:0};
  const S=Math.sin, C=Math.cos, PI=Math.PI, mx=Math.max;
  const ANIMS={
    idle:{nome:'Parado (rebola o paneiro, ajeita a alça)',n:8,dur:()=>150,pose:i=>{ const p=i/8*PI*2, s=S(p), s2=S(2*p), up=mx(0,S(p-1.2));
      return {hx:0.6*s, lean:14+1.4*S(p+0.5), hunch:16+1.4*s2, head:-24+2*S(p-0.8), jaw:6+5*mx(0,S(p+1)), drool:i%4, vt:i,
        bl:1.4*mx(0,s2), bk:1.6*S(p+0.4),
        aFs:12+58*up, aFe:26+120*up, aBs:-6+3*s, aBe:12+5*s,
        lFh:16+2*s, lFk:-4+2*s, lBh:-8-2*s, lBk:-18+2*s}; }},
    walk:{nome:'Andar pesado (passo curto, paneiro balança)',n:8,dur:()=>150,pose:i=>{ const p=i/8*PI*2;
      const lFh=12+14*S(p), lBh=-6+11*S(p+PI);
      return {lFh, lFk:lFh-18*mx(0,C(p))-6, lBh, lBk:lBh-10-12*mx(0,C(p+PI)), fF:-8*mx(0,C(p)), fB:16*mx(0,C(p+PI)),
        lean:16+2*S(2*p), hunch:16+2*S(2*p-0.6), head:-24+2.5*S(2*p-1.4), jaw:7+3*S(2*p-1.8), hx:1.2*S(p), lift:1.4*mx(0,S(2*p)),
        bk:3*S(2*p-1), bl:1.6*mx(0,S(2*p-0.8)), vt:i,
        aFs:12+16*S(p+PI), aFe:26+12*S(p+PI), aBs:-6+16*S(p), aBe:12+14*S(p), drool:i%4}; }},
    alert:{nome:'Alerta (vira o tronco e ruge)',n:6,dur:i=>[150,140,170,120,200,170][i],pose:i=>[
      {head:-18,jaw:12,lean:10,bk:-2},
      {head:-10,jaw:20,lean:4,hunch:12,hx:-2,aFs:40,aFe:70,aBs:30,aBe:60,lFh:18,lBh:-12,bk:-6,bl:2},
      {head:-4,jaw:34,lean:0,hunch:10,hx:-3,aFs:70,aFe:96,aBs:60,aBe:90,lFh:20,lBh:-14,bk:-8,bl:3},
      {head:-2,jaw:44,lean:2,hunch:10,hx:-2,aFs:84,aFe:100,aBs:74,aBe:96,lFh:20,lBh:-14,bk:-6,bl:3,vt:3},
      {head:-6,jaw:46,lean:6,hunch:12,hx:-1,aFs:76,aFe:90,aBs:64,aBe:84,lFh:20,lBh:-14,bk:-4,bl:2,vt:5},
      {head:-18,jaw:16,lean:12,hunch:15,aFs:30,aFe:50,aBs:10,aBe:30}][i]},
    // ---- golpes (IA escolhe por distância/peso; hit = quadro do dano, reach = alcance em px, toss = quadro do jato) ----
    sweep:{nome:'Rasteira do paneiro (varre baixo, cai de joelho)',n:9,hit:3,reach:48,dur:i=>[120,140,60,90,90,120,140,150,160][i],pose:i=>[
      {lean:2,hunch:10,head:-10,jaw:14,hx:-3,aFs:-30,aFe:-10,aBs:-46,aBe:-24,lFh:24,lFk:2,lBh:-14,lBk:-26,bk:-8,bl:2},
      {lean:-4,hunch:8,head:-4,jaw:22,hx:-5,aFs:-60,aFe:-40,aBs:-70,aBe:-50,lFh:30,lFk:-14,lBh:-18,lBk:-34,bk:-16,bl:3,fB:10},
      {lean:30,hunch:14,head:-26,jaw:28,hx:2,aFs:20,aFe:20,aBs:-30,aBe:-20,lFh:56,lFk:34,lBh:34,lBk:-40,bk:4,smear:2},
      {lean:44,hunch:12,head:-34,jaw:36,hx:6,aFs:72,aFe:70,aBs:30,aBe:40,lFh:80,lFk:88,lBh:56,lBk:-52,fF:-70,bk:16,smear:2},
      {lean:46,hunch:12,head:-34,jaw:34,hx:8,aFs:96,aFe:86,aBs:50,aBe:56,lFh:84,lFk:90,lBh:58,lBk:-56,fF:-74,bk:20},
      {lean:40,hunch:16,head:-30,jaw:26,hx:8,aFs:60,aFe:20,aBs:40,aBe:20,lFh:86,lFk:30,lBh:30,lBk:-74,bk:14},
      {lean:34,hunch:20,head:-24,jaw:22,hx:6,aFs:44,aFe:0,aBs:30,aBe:10,lFh:84,lFk:2,lBh:6,lBk:-84,bk:10},
      {lean:30,hunch:20,head:-20,jaw:18,hx:5,aFs:40,aFe:-2,aBs:24,aBe:8,lFh:82,lFk:0,lBh:2,lBk:-88,bk:8},
      {lean:28,hunch:20,head:-22,jaw:16,hx:5,aFs:38,aFe:0,aBs:22,aBe:8,lFh:82,lFk:0,lBh:2,lBk:-88,bk:8}][i]},
    // desequilibrado de joelho depois da rasteira (janela de dano): loop
    wobble:{nome:'Desequilibrado (de joelho, ofegando)',n:6,dur:()=>200,pose:i=>{ const p=i/6*PI*2, s=S(p);
      return {lean:28+3*s,hunch:20+2*S(p+1),head:-20+3*S(p+0.5),jaw:14+8*mx(0,S(p)),hx:5+1.5*s,aFs:38+6*s,aFe:0+4*s,aBs:22,aBe:8,lFh:82,lFk:0,lBh:2,lBk:-88,bk:8+5*s,drool:i%4,vt:i}; }},
    bash:{nome:'Paneirada (cotovelada com o paneiro erguido)',n:8,hit:3,reach:34,dur:i=>[70,100,50,100,90,120,130,150][i],pose:i=>[
      {lean:6,hunch:12,head:-16,jaw:14,hx:-1,aFs:70,aFe:-30,aBs:20,aBe:40,lFh:18,lBh:-12,bl:3,bk:-4},
      {lean:-6,hunch:8,head:-8,jaw:22,hx:-4,aFs:110,aFe:-10,aBs:40,aBe:70,lFh:20,lFk:-6,lBh:-16,lBk:-26,bl:6,bk:-10},
      {lean:30,hunch:16,head:-28,jaw:32,hx:6,aFs:86,aFe:-56,aBs:-20,aBe:0,lFh:30,lFk:4,lBh:-22,lBk:-32,fB:12,bl:4,bk:10,smear:1},
      {lean:36,hunch:18,head:-30,jaw:38,hx:9,aFs:82,aFe:-64,aBs:-30,aBe:-10,lFh:32,lFk:6,lBh:-24,lBk:-34,fB:14,bl:3,bk:14},
      {lean:34,hunch:18,head:-28,jaw:30,hx:8,aFs:70,aFe:-40,aBs:-24,aBe:0,lFh:30,lBh:-24,lBk:-34,fB:12,bk:12},
      {lean:24,hunch:17,head:-26,jaw:20,hx:5,aFs:50,aFe:10,aBs:-10,aBe:10,lFh:24,lBh:-16,bk:6},
      {lean:18,hunch:16,head:-24,jaw:14,hx:2,aFs:30,aFe:24,lFh:18,lBh:-12,bk:2},
      {lean:15,hunch:16,head:-24,jaw:10}][i]},
    spill:{nome:'Derramar o açaí (tomba o paneiro por cima do ombro)',n:9,toss:4,reach:90,dur:i=>[60,90,80,70,80,120,130,130,150][i],pose:i=>[
      {lean:6,hunch:12,head:-14,jaw:12,hx:-2,aFs:120,aFe:160,aBs:130,aBe:170,lFh:18,lBh:-14,bl:2},
      {lean:0,hunch:8,head:-8,jaw:20,hx:-4,aFs:160,aFe:196,aBs:166,aBe:200,lFh:20,lFk:-8,lBh:-16,lBk:-28,bl:5,bk:-8},
      {lean:16,hunch:12,head:-20,jaw:26,hx:0,aFs:150,aFe:180,aBs:150,aBe:180,lFh:24,lBh:-18,bl:4,bk:24},
      {lean:30,hunch:16,head:-30,jaw:30,hx:4,aFs:130,aFe:150,aBs:126,aBe:150,lFh:28,lFk:2,lBh:-22,lBk:-32,fB:10,bl:7,bk:40,pour:0.4},
      {lean:38,hunch:18,head:-36,jaw:40,hx:6,aFs:110,aFe:126,aBs:104,aBe:120,lFh:30,lFk:4,lBh:-24,lBk:-34,fB:14,bl:10,bk:52,pour:1,smear:3},
      {lean:38,hunch:18,head:-36,jaw:36,hx:6,aFs:108,aFe:124,aBs:100,aBe:118,lFh:30,lFk:4,lBh:-24,lBk:-34,fB:14,bl:10,bk:50,pour:0.8},
      {lean:30,hunch:17,head:-30,jaw:26,hx:4,aFs:120,aFe:146,aBs:110,aBe:140,lFh:26,lBh:-20,bl:6,bk:32,pour:0.25},
      {lean:20,hunch:16,head:-26,jaw:16,hx:2,aFs:70,aFe:90,aBs:50,aBe:70,lFh:20,lBh:-14,bk:12},
      {lean:15,hunch:16,head:-24,jaw:10,aFs:20,aFe:34}][i]},
    hurt:{nome:'Dano (cabeça)',n:4,dur:i=>[80,110,130,150][i],pose:i=>[
      {lean:0,hunch:10,head:-10,jaw:32,aFs:-10,aFe:20,aBs:-20,aBe:4,hx:-5,flash:1,lFh:18,lBh:-4,ct:-8,bk:-8,bl:2},
      {lean:4,hunch:12,head:-14,jaw:28,aFs:0,aFe:24,aBs:-14,aBe:10,hx:-4,lFh:16,lBh:-6,ct:-4,bk:-5},
      {lean:10,hunch:14,head:-20,jaw:18,aFs:6,aFe:24,aBs:-10,aBe:12,hx:-2,bk:-2},
      {lean:13,hunch:16,head:-23,jaw:10,hx:0}][i]},
    hurtB:{nome:'Dano (barriga, dobra)',n:4,dur:i=>[80,120,140,150][i],pose:i=>[
      {lean:36,hunch:26,head:-8,jaw:40,aFs:40,aFe:20,aBs:34,aBe:14,hx:-7,flash:1,lFh:22,lFk:-12,lBh:-14,lBk:-30,bk:10,bl:3},
      {lean:32,hunch:24,head:-12,jaw:36,aFs:38,aFe:22,aBs:32,aBe:18,hx:-6,lFh:20,lFk:-10,lBh:-14,lBk:-28,bk:8},
      {lean:22,hunch:20,head:-18,jaw:24,aFs:26,aFe:30,aBs:14,aBe:20,hx:-3,bk:4},
      {lean:16,hunch:17,head:-22,jaw:12,hx:-1}][i]},
    fall:{nome:'Derrubado (o paneiro rola das costas)',n:5,dur:i=>[90,100,110,150,280][i],pose:i=>[
      {lean:-8,hunch:6,head:4,jaw:34,aFs:-40,aFe:-20,aBs:-46,aBe:-30,hx:-6,flash:1,lFh:22,lBh:0,ct:-8,bk:-14,bl:3},
      {rot:-34,lean:-2,hunch:8,head:0,jaw:30,aFs:-60,aFe:-40,aBs:-70,aBe:-50,hx:-4,lFh:44,lFk:30,lBh:20,lBk:10,drop:0.35,ddx:34,drot:50},
      {rot:-66,lean:0,hunch:8,head:-2,jaw:30,aFs:-120,aFe:-110,aBs:-120,aBe:-110,hx:-6,lFh:52,lFk:40,lBh:30,lBk:24,drop:0.75,ddx:36,drot:80,spill:0.2},
      {rot:-90,lean:4,hunch:10,head:-2,jaw:36,aFs:-150,aFe:-170,aBs:-140,aBe:-160,hx:2,lFh:42,lFk:10,lBh:30,lBk:4,drop:1,ddx:36,drot:88,spill:0.45},
      {rot:-90,lean:0,hunch:10,head:-4,jaw:34,aFs:-172,aFe:-186,aBs:-160,aBe:-176,hx:2,lFh:40,lFk:6,lBh:26,lBk:0,drop:1,ddx:36,drot:90,spill:0.55}][i]},
    getup:{nome:'Levantar (joga o paneiro de volta nas costas)',n:6,dur:i=>[200,170,170,160,160,150][i],pose:i=>[
      {rot:-90,lean:0,hunch:10,head:-4,jaw:34,aFs:-172,aFe:-186,aBs:-160,aBe:-176,hx:2,lFh:40,lFk:6,lBh:26,lBk:0,drop:1,ddx:36,drot:90,spill:0.55},
      {rot:-60,lean:10,hunch:18,head:-16,jaw:24,aFs:-50,aFe:-10,aBs:-80,aBe:-60,hx:-8,lFh:90,lFk:10,lBh:70,lBk:0,drop:1,ddx:36,drot:90,spill:0.5},
      {rot:-30,lean:24,hunch:22,head:-24,jaw:20,aFs:-10,aFe:10,aBs:-120,aBe:-150,hx:-6,lFh:100,lFk:10,lBh:60,lBk:-60,drop:0.9,ddx:30,drot:70,spill:0.4},
      {rot:0,lean:34,hunch:22,head:-30,jaw:20,aFs:40,aFe:10,aBs:-150,aBe:-170,hx:-4,lFh:74,lFk:-2,lBh:6,lBk:-80,fB:50,drop:0.4,ddx:10,drot:30,spill:0.25},
      {rot:0,lean:20,hunch:18,head:-26,jaw:14,aFs:30,aFe:50,aBs:-20,aBe:10,hx:-1,lFh:28,lFk:-10,lBh:-12,lBk:-30,bl:3,bk:-6},
      {lean:15,hunch:16,head:-24,jaw:10}][i]},
    death:{nome:'Morte (cai de cara, o paneiro despeja o açaí em cima dele)',n:8,dur:i=>[90,150,150,140,150,170,200,600][i],pose:i=>[
      {lean:0,hunch:10,head:-6,jaw:40,aFs:-30,aFe:-10,aBs:-40,aBe:-24,hx:-5,flash:1,lFh:16,lBh:-4,ct:-8,bk:-10,bl:2},
      {lean:24,hunch:18,head:-12,jaw:46,aFs:20,aFe:40,aBs:10,aBe:30,hx:-2,lFh:30,lFk:20,lBh:-10,lBk:-20,bk:0},
      {rot:20,lean:30,hunch:18,head:-14,jaw:48,aFs:60,aFe:70,aBs:50,aBe:70,hx:2,lFh:20,lFk:30,lBh:-20,lBk:-10,bk:10},
      {rot:52,lean:24,hunch:16,head:-10,jaw:46,aFs:110,aFe:120,aBs:100,aBe:120,hx:4,lFh:0,lFk:10,lBh:-26,lBk:-16,bk:16,pour:0.2},
      {rot:80,lean:10,hunch:12,head:-4,jaw:44,aFs:150,aFe:170,aBs:130,aBe:150,hx:4,lFh:-6,lFk:4,lBh:-20,lBk:-10,bk:20,pour:0.6,spill:0.3},
      {rot:88,lean:4,hunch:10,head:0,jaw:40,aFs:160,aFe:178,aBs:140,aBe:160,hx:4,lFh:-4,lFk:0,lBh:-16,lBk:-6,bk:22,pour:1,spill:0.6},
      {rot:90,lean:2,hunch:10,head:2,jaw:40,aFs:164,aFe:180,aBs:142,aBe:162,hx:4,lFh:-4,lFk:0,lBh:-14,lBk:-4,bk:24,pour:0.6,spill:0.9},
      {rot:90,lean:0,hunch:10,head:2,jaw:42,aFs:166,aFe:182,aBs:144,aBe:164,hx:4,lFh:-4,lFk:0,lBh:-14,lBk:-4,bk:24,pour:0,spill:1,drool:3}][i]},
    // adereços (desenhados pelo motor como ator extra; âncora em cv._ax/_gy)
    xBlob:{nome:'Bolo de açaí voando (adereço)',n:4,prop:true,dur:()=>60,pose:i=>({st:i})},
    xPool:{nome:'Poça roxa de açaí (adereço)',n:3,prop:true,dur:()=>160,pose:i=>({st:i})},
  };
  const EXK=['hx','lean','hunch','head','aFs','aFe','aBs','aBe','lFh','lFk','lBh','lBk'];
  function exag(P,f){ if(f===1||Math.abs(P.rot)>4) return P; EXK.forEach(k=>{ P[k]=REST[k]+(P[k]-REST[k])*f; }); P.jaw=Math.min(56,mx(0,REST.jaw+(P.jaw-REST.jaw)*f)); return P; }
  const EXF={idle:1.04,walk:1.08,alert:1.1,sweep:1.08,wobble:1.04,bash:1.14,spill:1.08,hurt:1.26,hurtB:1.2,fall:1.06,getup:1.04,death:1.04};
  ZREACT.add(ANIMS,REST,{moves:{backhand:["swipe","Tapa de revés"]}});
  // corcunda em C: todas as poses ganham inclinação extra (o paneiro pesa); deitado (rot grande) não
  function poseOf(anim,i){ const A=ANIMS[anim]; if(A&&A.prop) return Object.assign({},REST,A.pose(i)); const P=exag(Object.assign({},REST,A.pose(i)),EXF[anim]||1);
    if(Math.abs(P.rot)<30){ P.lean+=8; P.hunch+=6; P.head-=10; } return P; }
  function heavyOutline(cv){ const g=cv.getContext('2d'), W=cv.width, H=cv.height, im=PIX.pix(cv), d=im.data;
    const isO=i=>d[i+3]===255&&d[i]===0x17&&d[i+1]===0x0b&&d[i+2]===0x1c, fill=i=>d[i+3]===255&&!isO(i);
    const add=[]; for(let y=2;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(d[i+3]) continue; const u=((y-1)*W+x)*4, u2=((y-2)*W+x)*4; if(isO(u)&&fill(u2)) add.push(i); }
    add.forEach(i=>{ d[i]=0x17; d[i+1]=0x0b; d[i+2]=0x1c; d[i+3]=255; }); g.putImageData(im,0,0); }

  /* ---------- esqueleto (corcunda em C, braços longos, pernas curtas e fortes) ---------- */
  const SPINE=36, TH=19, SH=18.6, UA=16.4, FAF=16.8, FAB=15.6, VS=SPINE/37, US=1.14, HB=9, HS=1.2;
  const lp=(p,a,L)=>({x:p.x+Math.sin(rad(a))*L, y:p.y+Math.cos(rad(a))*L});
  // paneiro: contorno no espaço local (x = pra frente do corpo, h = pra cima no eixo do cesto)
  const BHK=0.94;
  const BASK=[[1.4,1.6],[0.6,-1.4],[-3.4,-3],[-10,-3.2],[-14.6,-1.4],[-16.6,3],[-19.4,18],[-22.6,34],[-25.4,48],[-26,55],[3.2,55],[3.2,48],[2.8,34],[2.2,18]];
  function basketFrame(O,a){ const F={x:Math.cos(a),y:Math.sin(a)}, U={x:Math.sin(a),y:-Math.cos(a)};
    return {O,a,B:(x,h)=>({x:O.x+F.x*x+U.x*h*BHK, y:O.y+F.y*x+U.y*h*BHK})}; }
  function build(P,dy){
    const R=P.rot, hip={x:AX+P.hx, y:dy};
    const ra=rad(R), rc=Math.cos(ra), rs=Math.sin(ra);
    const HR=(lx,ly)=>({x:hip.x+lx*rc-ly*rs, y:hip.y+lx*rs+ly*rc});
    const hipF=HR(3.6,0), hipB=HR(-3.6,0);
    const kneeF=lp(hipF,P.lFh-R,TH), ankleF=lp(kneeF,P.lFk-R,SH), kneeB=lp(hipB,P.lBh-R,TH), ankleB=lp(kneeB,P.lBk-R,SH);
    const SS=[]; let x=hip.x, y=hip.y;
    for(let k=0;k<=SPINE;k++){ const t=k/SPINE, a=rad(R+P.lean+(P.hunch+HB)*Math.pow(t,1.3)); SS.push({x,y,a}); x+=Math.sin(a); y-=Math.cos(a); }
    const SP=(u,v)=>{ if(v>0){ const s=SS[0], a=s.a, px=s.x-Math.sin(a)*v, py=s.y+Math.cos(a)*v; return {x:px+Math.cos(a)*u, y:py+Math.sin(a)*u}; }
      const f=-v, k=Math.min(SPINE,Math.floor(f)), s=SS[k], r=f-k, a=s.a;
      const px=s.x+Math.sin(a)*r, py=s.y-Math.cos(a)*r; return {x:px+Math.cos(a)*u, y:py+Math.sin(a)*u}; };
    const T=(u,v)=>SP(u*US,v*VS);
    const top=SS[SPINE], neck=T(2,-35.6), sa=top.a;
    const shF=T(2.4,-30.4), shB=T(-5.6,-31.6);
    const elF=lp(shF,P.aFs-R,UA), wrF=lp(elF,P.aFe-R,FAF), elB=lp(shB,P.aBs-R,UA), wrB=lp(elB,P.aBe-R,FAB);
    const ha=sa+rad(P.head-HB*0.8), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:neck.x+(lx*hc-ly*hs)*HS, y:neck.y+(lx*hs+ly*hc)*HS});
    const ba=SS[Math.round(SPINE*0.6)].a-rad(6)+rad(P.bk), bk=basketFrame(T(-12.4,-1.6-P.bl),ba);
    const toe=(a,f)=>{ const t=rad(f+R); return {x:a.x+(11*Math.cos(t)-4*Math.sin(t))*1.3, y:a.y+(11*Math.sin(t)+4*Math.cos(t))*1.3}; };
    const hull=[[ankleF,5],[ankleB,5],[toe(ankleF,P.fF),1.6],[toe(ankleB,P.fB),1.6],[kneeF,6],[kneeB,6],[hip,9],[T(0,-18),11],[T(-2,-30),11],[H(3,-11),11],[wrF,5],[wrB,5],[elF,5],[elB,5]];
    return {R,hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,SS,SP,T,sa,neck,shF,shB,elF,wrF,elB,wrB,ha,H,hull,ra,bk,toeF:toe(ankleF,P.fF)};
  }
  function skeleton(P){
    const a=build(P,0); let m=-1e9; a.hull.forEach(([p,r])=>{ m=Math.max(m,p.y+r); });
    const sk=build(P,GROUND-m-(P.lift||0));
    if(P.drop>0){ // paneiro solto: interpola do encaixe nas costas até deitado no chão (quique no meio)
      const d=Math.min(1,P.drop), ag=rad(P.drot), g=basketFrame({x:AX+P.ddx,y:GROUND},ag);
      let my=-1e9; BASK.concat([[-12,62]]).forEach(([x,h])=>{ my=Math.max(my,g.B(x,h).y); });
      const Og={x:AX+P.ddx, y:GROUND-(my-GROUND)-1}, O0=sk.bk.O;
      const O={x:lerp(O0,Og,d).x, y:lerp(O0,Og,d).y-Math.sin(PI*d)*12};
      let da=ag-sk.bk.a; while(da>PI) da-=2*PI; while(da<-PI) da+=2*PI;
      sk.bk=basketFrame(O,sk.bk.a+da*d);
    }
    return sk;
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
  const dot=(p,q,w,h)=>p.rect(q.x-w/2,q.y-h/2,w,h);
  // caroço de açaí: bolinha escura com reflexo azulado (cera) e ponto de luz
  function berry(p,M,x,y,r,lit){ p.F(M.acai[3]); p.circle({x:x+0.3,y:y+0.4},r); p.F(lit?M.acai[1]:M.acai[2]); p.circle({x,y},r*0.86);
    p.F(lit?M.bloom[1]:M.bloom[2]); p.rect(x-r*0.6,y-r*0.7,r*0.7,r*0.5); if(lit){ p.F(M.acai[0]); p.rect(x-r*0.5,y-r*0.6,r*0.42,r*0.42); } }

  /* ---------- paneiro (arumã trançado, borda amarrada, forro de folha, coroa de açaí) ---------- */
  function drawBasket(c,u,M,sk,P,form,broken){
    const p=mkPen(c,u); p.id(); const B=sk.bk.B, Q=(x,h)=>{ const q=B(x,h); return [q.x,q.y]; };
    const out=BASK.map(([x,h])=>Q(x,h));
    p.F(M.straw[1]); p.poly(out);
    clip(c,out,()=>{
      // volume: lado de trás em sombra fria grande, quina de luz na frente
      p.F(M.straw[2]); p.poly([Q(-30,-6),Q(-9,-6),Q(-11,20),Q(-13,40),Q(-14,58),Q(-30,58)]);
      p.F(M.straw[3]); p.poly([Q(-30,-6),Q(-14,-6),Q(-17.4,20),Q(-21,40),Q(-22.6,58),Q(-30,58)]);
      p.F(M.straw[0]); p.poly([Q(-2.4,10),Q(4,10),Q(4,50),Q(-4.6,50),Q(-4,30)]);
      // trama: faixas horizontais (talas) com tiras inclinadas alternadas
      for(let r=0, h=7; h<49; h+=4.4, r++){
        const xb=-15.8-(h/55)*10.2;
        for(let x=xb+0.4+(r%2)*1.7, k=0; x<3; x+=3.4, k++){
          const reg=x<xb+5.2?3:x<-10?2:x>-3.4?0:1;
          p.F(M.weave[reg]); p.poly([Q(x,h+0.5),Q(x+1.8,h+0.5),Q(x+2.2,h+3.4),Q(x+0.4,h+3.4)]); }
        // tala horizontal: sombra só na metade de trás, fio de luz na de cima
        p.F(M.straw[3]); p.poly([Q(xb-2,h-0.2),Q(-9,h-0.2),Q(-9,h+0.5),Q(xb-2,h+0.5)]);
        p.F(M.straw[2]); p.poly([Q(-9,h-0.2),Q(4,h-0.2),Q(4,h+0.4),Q(-9,h+0.4)]);
      }
      // montantes verticais (varetas que abrem em leque até a borda)
      [0.12,0.36,0.6,0.84].forEach(t=>{ const xa=-15+t*16, xb2=-26+t*29.4; p.F(t<0.4?M.straw[3]:M.straw[2]); p.poly([Q(xa-0.35,3),Q(xa+0.35,3),Q(xb2+0.35,50),Q(xb2-0.35,50)]); });
      // amarração do fundo (aro de cipó)
      p.F(M.cord[2]); p.poly([Q(-18,3.4),Q(4,3.4),Q(4,6),Q(-18,6)]); p.F(M.cord[0]); p.poly([Q(-6,3.6),Q(2.6,3.6),Q(2.6,4.4),Q(-6,4.4)]);
      if(!broken){
        // açaí escorrendo pela trama (sangue roxo)
        [[1,46,20,2.4],[-9,47,28,2.2],[-18.6,46,12,2]].forEach(([x,h,L,w],k)=>{
          p.F(M.juice[2]); p.poly([Q(x-w,h+2),Q(x+w,h+2),Q(x+w*0.6,h-L+2),Q(x,h-L),Q(x-w*0.6,h-L+2)]);
          p.F(M.juice[1]); p.poly([Q(x-w*0.6,h+2),Q(x+w*0.3,h+2),Q(x+w*0.1,h-L+3),Q(x-w*0.4,h-L+3)]);
          p.F(M.juice[1]); const t=B(x,h-L+0.4); p.circle(t,w*1.05); p.F(M.juice[0]); p.rect(t.x-0.5,t.y-0.9,0.8,0.8);
          if(form!=='comum'){ p.F(M.glow[1]); const g=B(x-w*0.2,h-L*0.5); p.rect(g.x-0.4,g.y-1.2,0.8,2.4); }
        });
      } else {
        // racha grande com talas partidas e açaí seco
        p.F(M.straw[3]); p.poly([Q(-24,40),Q(-14,34),Q(-10,38),Q(-2,26),Q(4,28),Q(4,22),Q(-3,20),Q(-11,31),Q(-15,28),Q(-25,35)]);
        p.F(M.acai[3]); p.poly([Q(-20,36),Q(-14,32),Q(-11,34.6),Q(-4,25),Q(-2,25.6),Q(-11,33),Q(-15,30.4),Q(-20,34)]);
        p.F(M.juice[2]); p.poly([Q(-1,24),Q(1,24),Q(0.4,12),Q(-0.4,12)]);
      }
      if(form==='enluarado'){ p.F(M.glow[1]); p.poly([Q(-20,14),Q(-17,22),Q(-14,21),Q(-11,30),Q(-11.6,30.6),Q(-14.6,22.4),Q(-17.6,23.4),Q(-20.6,14.6)]); }
      if(form==='plenilunar'){ p.F(M.glow[1]); [[-14,12],[-6,22],[-19,30],[-3,38],[-12,44]].forEach(([x,h])=>{ p.poly([Q(x,h),Q(x+1.6,h+0.6),Q(x+3.4,h-0.4),Q(x+3.6,h+0.4),Q(x+1.4,h+1.4),Q(x-0.2,h+0.8)]); }); }
    });
    // borda amarrada (aro verde trançado) — quebrada: aro torto, talas espetadas
    const rim=broken?[Q(-26.6,50),Q(-12,50.6),Q(-6,48),Q(3.8,50),Q(3.8,55),Q(-6,53.6),Q(-12,56.4),Q(-26.6,55.6)]:[Q(-26.8,50),Q(3.8,50),Q(3.8,56.4),Q(-26.8,56.4)];
    p.F(M.rimg[1]); p.poly(rim);
    clip(c,rim,()=>{
      p.F(M.rimg[0]); p.poly([Q(-27,55),Q(4,55),Q(4,56.6),Q(-27,56.6)]);
      p.F(M.rimg[2]); p.poly([Q(-27,49.8),Q(4,49.8),Q(4,51.2),Q(-27,51.2)]);
      p.F(M.rimg[3]); p.poly([Q(-28,49),Q(-21,49),Q(-21.6,57),Q(-28,57)]);
      p.F(M.rimg[2]); for(let x=-25;x<4;x+=3.2) p.poly([Q(x,51.2),Q(x+1,51.2),Q(x+2.2,55),Q(x+1.2,55)]);
    });
    if(broken){ p.F(M.weave[1]); [[-20,56,-24,63],[-8,54,-5,61],[0,55,4,60],[-14,55,-16,60]].forEach(([a,b,c2,d])=>p.cap(B(a,b),B(c2,d),0.7,0.4)); return; }
    // folhas do forro aparecendo na borda
    [[-25,56,-30,61,-22,57],[2.6,56,7,61,-1,57],[-14,62,-17,67,-10,62.4]].forEach(([x0,h0,x1,h1,x2,h2])=>{
      p.F(M.leaf[2]); p.poly([Q(x0,h0),Q(x1,h1),Q(x2,h2)]);
      p.F(M.leaf[1]); p.poly([Q(x0,h0),Q(x1,h1),Q((x0+x2)/2,(h0+h2)/2+0.4)]);
      p.F(M.leaf[0]); p.cap(B((x0+x2)/2,(h0+h2)/2),B(x1,h1),0.45,0.2);
    });
    // coroa de açaí: monte escuro com caroços; luz do lado da frente
    const mound=[Q(-26.6,56),Q(-25,60.6),Q(-19,65),Q(-11,66.6),Q(-3,65),Q(2,61.6),Q(4,56)];
    p.F(M.acai[2]); p.poly(mound);
    clip(c,mound,()=>{ p.F(M.acai[3]); p.poly([Q(-28,55),Q(-18,55),Q(-20,68),Q(-28,68)]); p.F(M.acai[1]); p.poly([Q(-10,59),Q(5,57),Q(5,68),Q(-8,68)]); p.F(M.acai[0]); p.poly([Q(-6,63.6),Q(-1,62.6),Q(0,64),Q(-5,65.4)]); });
    const rows=[[57.8,-23.6,2],[60.6,-21.4,2.1],[63.4,-17,2.2],[59.6,-15.6,2.3],[64.8,-11,2.3],[61.6,-9.4,2.4],[58.4,-5.4,2.2],[63,-4,2.2],[59.6,0,2.1],[57.2,2.4,1.9],[58.2,-19,2],[57.4,-11.4,2]];
    rows.forEach(([h,x,r])=>{ const q=B(x,h); berry(p,M,q.x,q.y,r*0.66,x>-13); });
    // caroços com olho (corrupção)
    [[-12,60.4],[-3.6,58.8]].forEach(([x,h])=>{ const q=B(x,h); p.F(M.acai[3]); p.circle(q,1.5); p.F(M.eye[1]); p.circle(q,1); p.F(M.eye[3]); p.rect(q.x-0.3,q.y-0.6,0.6,1.2); });
    // açaí transbordando pela borda da frente
    { const a=B(3.4,55.6), b=B(4.6,49); p.F(M.juice[2]); p.cap(a,b,1.6,1.2); p.F(M.juice[1]); p.cap(a,lerp(a,b,0.7),1,0.7); p.F(M.juice[1]); p.circle(b,1.4); p.F(M.juice[0]); p.rect(b.x-0.6,b.y-1,0.8,0.8); }
  }
  // alças de cipó: testa → boca do paneiro (por trás da cabeça); peito → fundo do paneiro
  function drawStraps(c,u,M,sk,P){
    const p=mkPen(c,u); p.id(); const B=sk.bk.B;
    if(P.drop>0.3) return;
    const a=sk.H(-5.6,-15.6), b=B(1.6,50.6), m={x:(a.x+b.x)/2+1.4,y:(a.y+b.y)/2+1.6};
    p.F(M.cord[2]); p.cap(a,m,1.5,1.4); p.cap(m,b,1.4,1.4);
    p.F(M.cord[1]); p.cap(a,m,0.8,0.8); p.cap(m,b,0.8,0.8);
    p.F(M.cord[0]); p.cap(lerp(a,m,0.3),lerp(a,m,0.7),0.4,0.4);
  }

  /* ---------- raízes de cipó nascendo das costas (plenilunar: cipós vivos) ---------- */
  function drawVines(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id(); const B=sk.bk.B;
    if(P.drop<0.3){ [[[-0.4,8],[-10.6,-2],[-11.6,4]],[[0,20],[-11.4,-12],[-10,-6]],[[0.2,30],[-11,-22],[-9.4,-17]]].forEach(([[x,h],[u1,v1],[u2,v2]],k)=>{
      const a=B(x,h), m=Wp(sk,u1,v1), e=Wp(sk,u2,v2);
      p.F(M.vine[2]); p.cap(a,m,1.6,1.2); p.cap(m,e,1.2,0.7);
      p.F(M.vine[1]); p.cap(a,m,0.9,0.6); p.F(M.vine[0]); p.rect(m.x-0.4,m.y-0.4,0.8,0.8);
      if(k===1){ p.F(M.leaf[1]); p.poly([[m.x,m.y],[m.x-3.4,m.y-2.6],[m.x-0.6,m.y-3.4]]); }
    }); }
    if(form==='plenilunar'){ // cipós vivos: saem do alto do paneiro e serpenteiam
      const t=(P.vt||0)/8*PI*2;
      [[-24,40,-1],[-25,30,1]].forEach(([x,h,s],k)=>{ let q=B(x,h); for(let j=1;j<=4;j++){ const n=B(x-j*3.6,h+Math.sin(t+j*1.3+k)*3*s+j*1.4);
        p.F(M.vine[2]); p.cap(q,n,1.4-j*0.22,1.2-j*0.22); p.F(M.vine[1]); p.cap(q,n,0.7-j*0.1,0.5-j*0.1); q=n; }
        p.F(M.eye[1]); p.circle(q,0.9); });
    }
  }

  /* ---------- braços: longos e fortes, manga curta, mãos grandes ---------- */
  function drawArm(c,u,M,sk,P,front,form){
    const p=mkPen(c,u), sh=front?sk.shF:sk.shB, el=front?sk.elF:sk.elB, wr=front?sk.wrF:sk.wrB; p._c=c; p.id();
    // antebraço (pele, veias de lua)
    const nF=limb(p,M.skin,el,wr,10.6,9,{hl:0.55});
    p.F(M.vein[1]); p.cap(off(lerp(el,wr,0.15),nF,-1.6),off(lerp(el,wr,0.85),nF,-1.2),0.6,0.5);
    if(form!=='comum'){ p.F(M.glow[1]); p.cap(off(lerp(el,wr,0.3),nF,-1.6),off(lerp(el,wr,0.6),nF,-1.4),0.4,0.4); }
    p.F(M.mud[1]); dot(p,off(lerp(el,wr,0.8),nF,2),2,1.4);
    if(front){ p.F(M.flesh[2]); const s0=lerp(el,wr,0.4); p.cap(off(s0,nF,0.6),off(lerp(el,wr,0.55),nF,3.4),1,0.7); p.F(M.bone[1]); dot(p,off(lerp(el,wr,0.47),nF,2),0.9,0.9); }
    // braço: bíceps grosso, manga curta de algodão
    const nU=limb(p,M.skin,sh,el,12.4,10.8,{hl:0.6});
    p.F(M.skin[1]); p.circle(el,5.2);
    const sl=lerp(sh,el,0.56);
    const nS=limb(p,M.shirt,sh,sl,14.4,13.4,{hl:0.5});
    p.F(M.shirt[1]); p.circle(sh,7.4); p.F(M.shirt[0]); p.circle(off(sh,nS,-2.6),2.6);
    p.F(M.shirt[2]); p.cap(off(sl,nS,-6.6),off(sl,nS,6.6),1.6,1.6); p.F(M.shirt[3]); p.cap(off(lerp(sh,el,0.6),nS,-6),off(lerp(sh,el,0.6),nS,6),0.6,0.6);
    p.F(M.shirt[2]); p.cap(off(lerp(sh,sl,0.3),nS,1),off(lerp(sh,sl,0.8),nS,4),0.7,0.6);
    if(!front){ p.F(M.rot[1]); const r=lerp(sl,el,0.5); p.ell(r.x-nU.nx*1.6,r.y-nU.ny*1.6,2,1.4); p.F(M.flesh[2]); p.ell(r.x-nU.nx*1.6,r.y-nU.ny*1.6+0.3,0.9,0.7); }
    drawHand(p,M,el,wr,front);
  }
  function drawHand(p,M,el,wr,front){
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y); p._c.scale(1.34,1.34);
    p.F(M.skin[1]); p.poly([[-1,-3.4],[4.6,-3.8],[6.2,2.4],[-1,3.4]]);
    p.F(M.skin[2]); p.poly([[-1,0.8],[6,0.8],[6.2,2.4],[-1,3.4]]);
    // dedos longos meio curvados (garra), unhas sujas de açaí
    [[-2.4,9.4],[-0.8,10.2],[0.8,9.8],[2.4,8.6]].forEach(([y,L])=>{ p.F(M.skin[1]); p.cap(P2(4.4,y),P2(L,y+0.8),1.7,1.3); p.F(M.skin[2]); p.rect(L-1.6,y+0.4,1.2,0.8); p.F(M.acai[2]); p.rect(L-0.4,y+0.2,1,1); });
    p.F(M.skin[1]); p.cap(P2(2,-3.2),P2(5.4,-5.8),1.8,1.3); p.F(M.skin[0]); p.rect(0.4,-3,3.4,0.8);
    p.id();
  }

  /* ---------- pernas: bermuda de brim, canela de fora, pé descalço sujo de lama roxa, peconha ---------- */
  function drawLeg(c,u,M,sk,P,front){
    const p=mkPen(c,u), hip=front?sk.hipF:sk.hipB, knee=front?sk.kneeF:sk.kneeB, ank=front?sk.ankleF:sk.ankleB; p.id();
    // canela (pele) com lama subindo
    const nS=limb(p,M.skin,knee,ank,10,8.4,{hl:0.5});
    p.F(M.mud[1]); p.poly([[off(lerp(knee,ank,0.62),nS,-5).x,off(lerp(knee,ank,0.62),nS,-5).y],[off(lerp(knee,ank,0.56),nS,0).x,off(lerp(knee,ank,0.56),nS,0).y],[off(lerp(knee,ank,0.66),nS,5).x,off(lerp(knee,ank,0.66),nS,5).y],[off(ank,nS,4.4).x,off(ank,nS,4.4).y],[off(ank,nS,-4.4).x,off(ank,nS,-4.4).y]]);
    p.F(M.mud[2]); dot(p,off(lerp(knee,ank,0.86),nS,2.4),2,2.2); p.F(M.acai[2]); dot(p,off(lerp(knee,ank,0.78),nS,-1.4),1.8,1.4); p.F(M.mud[0]); dot(p,off(lerp(knee,ank,0.7),nS,-3),1,0.8);
    p.F(M.vein[1]); p.cap(off(lerp(knee,ank,0.1),nS,-2),off(lerp(knee,ank,0.45),nS,-2.4),0.5,0.5);
    if(front){ // peconha de fibra amarrada no tornozelo
      const a=lerp(knee,ank,0.86); p.F(M.cord[2]); p.cap(off(a,nS,-5),off(a,nS,5),1.6,1.6); p.F(M.cord[1]); p.cap(off(a,nS,-4.6),off(a,nS,4.6),0.8,0.8);
      p.F(M.cord[0]); [-2.6,0.4,3].forEach(k=>dot(p,off(a,nS,k),0.8,0.8)); p.F(M.cord[1]); p.cap(off(a,nS,4.6),{x:off(a,nS,4.6).x-2,y:off(a,nS,4.6).y+5},0.8,0.4);
    }
    // coxa: bermuda até o joelho, barra desfiada
    const kh=lerp(hip,knee,1.08);
    const nT=limb(p,M.shorts,hip,kh,15.2,13.6,{hl:0.5});
    p.F(M.shorts[2]); p.cap(off(kh,nT,-7),off(kh,nT,7),1.6,1.6); p.F(M.shorts[0]); p.cap(off(lerp(hip,knee,0.3),nT,-4.6),off(lerp(hip,knee,0.7),nT,-4.2),0.8,0.8);
    p.F(M.shorts[3]); [-5,-1.6,2,5.4].forEach(k=>{ const q=off(kh,nT,k); p.poly([[q.x-0.7,q.y],[q.x+0.7,q.y],[q.x+(nT.ny)*0,q.y+2.2]]); });
    p.F(M.shorts[2]); p.cap(off(lerp(hip,knee,0.45),nT,2),off(lerp(hip,knee,0.8),nT,5.4),0.7,0.6);
    if(front){ p.F(M.mud[1]); dot(p,off(lerp(hip,knee,0.7),nT,3),2,1.4); p.F(M.acai[2]); dot(p,off(lerp(hip,knee,0.5),nT,-2),1.4,1.6); }
    // pé descalço (dedos abertos, sola de lama)
    const fa=rad((front?P.fF:P.fB)+sk.R); p.xf(fa,ank.x,ank.y); c.scale(1.3,1.3);
    p.F(M.skin[1]); p.poly([[-3.6,-2.8],[2,-3],[6,-1.4],[9.6,0.2],[11.6,1.4],[11.8,3.4],[-4,3.4]]);
    p.F(M.skin[2]); p.poly([[-4,1.4],[11.8,1.8],[11.8,3.4],[-4,3.4]]);
    p.F(M.skin[0]); p.poly([[0.6,-2.6],[2.4,-2.6],[6,-1],[5.4,-0.4],[2,-1.6]]);
    p.F(M.skin[3]); [8.2,10].forEach(x=>p.rect(x,0.4,0.5,2.4));
    p.F(M.rot[0]); p.rect(10.6,0.6,0.9,0.7);
    p.F(M.mud[1]); p.poly([[-4.2,2.6],[12,2.8],[12,4.2],[-4.2,4.2]]); p.F(M.mud[2]); p.rect(-4,3.6,16,0.6);
    p.F(M.acai[2]); p.ell(4,2.4,2.4,0.9); p.F(M.juice[1]); p.rect(6,1.8,1,0.6);
    p.id();
  }

  /* ---------- tronco: camisa de manga curta cor de barro, corda na cintura, facão curto embainhado ---------- */
  const TORSO=[[-10.6,7],[-11,-2],[-11.6,-12],[-12,-22],[-11.6,-29],[-10,-34],[-6.6,-37.6],[-1,-39.4],[4.8,-39],[9.4,-36],[12.2,-30],[13.2,-22],[13.4,-14],[13,-6],[12.4,0],[11.2,7]];
  const SHIRT=[[-10.6,5],[-11,-2],[-11.6,-12],[-12,-22],[-11.6,-29],[-10,-34],[-7,-36.8],[-3.6,-33.6],[1.6,-33],[5.4,-36.4],[9.4,-36],[12.2,-30],[13.2,-22],[13.4,-14],[13,-6],[12.6,0],[12,5]];
  function drawTorso(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    const shape=W(sk,TORSO);
    p.F(M.skin[1]); p.poly(shape);
    clip(c,shape,()=>{
      p.F(M.skin[2]); p.poly(W(sk,[[-14,-40],[-6,-40],[-7,-30],[-14,-30]]));
      p.F(M.skin[0]); p.poly(W(sk,[[3,-38],[8,-38],[9.6,-34],[5,-34]]));
      p.F(M.vein[1]); p.poly(W(sk,[[2,-36.6],[5,-34.6],[4.6,-34],[1.8,-35.8]]));
      const sh=W(sk,SHIRT); p.F(M.shirt[1]); p.poly(sh);
      clip(c,sh,()=>{
        // sombra fria grande nas costas (embaixo do paneiro) e luz no peito
        p.F(M.shirt[2]); p.poly(W(sk,[[-14,10],[-14,-40],[-4,-40],[-4.6,-28],[-3.6,-14],[-2,-2],[0,10]]));
        p.F(M.shirt[3]); p.poly(W(sk,[[-14,10],[-14,-40],[-8.6,-40],[-9,-26],[-8.4,-10],[-7.6,10]]));
        p.F(M.shirt[0]); p.poly(W(sk,[[6,-33],[10.6,-34],[12.4,-26],[12.4,-18],[8,-20],[6,-27]]));
        // dobras diagonais (o tronco curvado amassa a camisa)
        p.F(M.shirt[2]); [[[2,-24],[9,-28],[9.2,-27],[2.4,-23]],[[1,-14],[11,-18],[11.2,-17],[1.4,-13]],[[3,-6],[12,-8],[12.2,-7],[3.4,-5]]].forEach(f=>p.poly(W(sk,f)));
        p.F(M.shirt[0]); [[[3,-22],[9,-25.6],[9,-25],[3.2,-21.4]],[[2,-12],[10.6,-15.6],[10.6,-15],[2.2,-11.4]]].forEach(f=>p.poly(W(sk,f)));
        // manchas: barro, suor e açaí
        p.F(M.mud[1]); [[8,-10,2.4,1.6],[-2,-6,1.8,2.2]].forEach(([uu,vv,a,b])=>{ const q=Wp(sk,uu,vv); p.ell(q.x,q.y,a,b); });
        p.F(M.acai[2]); [[6,-15,2.8,2]].forEach(([uu,vv,a,b])=>{ const q=Wp(sk,uu,vv); p.ell(q.x,q.y,a,b); });
        p.F(M.juice[2]); p.poly(W(sk,[[9.6,-24],[10.6,-24],[10.4,-17],[9.8,-17.6]]));
        // rasgo do lado com costela (corrupção)
        p.F(M.shirt[3]); p.poly(W(sk,[[-9,-22],[-4.4,-23],[-3.4,-17.6],[-5.4,-14],[-8.8,-15]]));
        p.F(M.flesh[2]); p.poly(W(sk,[[-8.4,-21.4],[-5,-22.2],[-4,-17.8],[-5.6,-14.8],[-8.2,-15.6]]));
        p.F(form==='plenilunar'?M.bone[0]:M.bone[1]); [-20,-17.6].forEach(v=>p.poly(W(sk,[[-8.2,v],[-4.4,v-0.6],[-4.4,v+0.5],[-8.2,v+1]])));
        if(form!=='comum'){ p.F(M.glow[1]); p.poly(W(sk,[[-5,-14.6],[-2.6,-10],[-3.2,-9.6],[-5.6,-14]])); }
        // barra da camisa
        p.F(M.shirt[2]); p.poly(W(sk,[[-14,2.4],[14,2.4],[14,5.4],[-14,5.4]])); p.F(M.shirt[0]); p.poly(W(sk,[[2,2.2],[12,2.2],[12,2.8],[2,2.8]]));
      });
      // gola e pescoço com veias
      p.F(M.shirt[2]); p.poly(W(sk,[[-7,-36.8],[-3.6,-33.6],[1.6,-33],[5.4,-36.4],[5.6,-35.2],[1.8,-31.8],[-3.8,-32.4],[-7.2,-35.6]]));
    });
    // cintura da bermuda + corda amarrada
    const wb=W(sk,[[-11,4.4],[12.4,4.4],[12,9],[-10.8,9]]); p.F(M.shorts[1]); p.poly(wb);
    clip(c,wb,()=>{ p.F(M.shorts[2]); p.poly(W(sk,[[-12,3],[-3,3],[-3,10],[-12,10]])); p.F(M.shorts[3]); p.poly(W(sk,[[-12,3],[-7.6,3],[-7.6,10],[-12,10]])); });
    p.F(M.cord[1]); p.poly(W(sk,[[-11,5],[12.6,5],[12.6,6.8],[-11,6.8]])); p.F(M.cord[2]); p.poly(W(sk,[[-11,6.2],[12.6,6.2],[12.6,6.8],[-11,6.8]]));
    p.F(M.cord[0]); [-6,-1,4,9].forEach(uu=>{ const q=Wp(sk,uu,5.4); p.rect(q.x-0.6,q.y-0.3,1.2,0.6); });
    { const k=Wp(sk,10,6.4); p.F(M.cord[1]); p.circle(k,1.4); p.cap(k,{x:k.x+1,y:k.y+5.4},0.8,0.6); p.cap(k,{x:k.x+2.6,y:k.y+4.4},0.8,0.6); }
    // alça do peito (cipó trançado) do ombro da frente até debaixo do braço
    p.F(M.cord[2]); p.poly(W(sk,[[2.6,-33.4],[5.6,-34.6],[-6.6,-17],[-9.6,-17.6]]));
    p.F(M.cord[1]); p.poly(W(sk,[[3.4,-33.6],[5,-34.2],[-7.4,-17.2],[-9,-17.4]]));
    p.F(M.cord[0]); [0.2,0.45,0.7].forEach(t=>{ const q=lerp(Wp(sk,4.2,-34),Wp(sk,-8.2,-17.4),t); p.rect(q.x-0.5,q.y-0.5,1,0.8); });
    // facão curto de coleta embainhado no quadril (cabo pra cima)
    { const a=Wp(sk,7.4,1), b=Wp(sk,12,15.6), h0=Wp(sk,6,-5);
      p.F(M.handle[1]); p.cap(a,b,2.8,2.2); p.F(M.handle[2]); p.cap(lerp(a,b,0.1),b,1.2,1); p.F(M.handle[0]); p.cap(lerp(a,b,0.2),lerp(a,b,0.6),0.5,0.4);
      p.F(M.cord[1]); p.cap(lerp(a,b,0.32),lerp(a,b,0.36),3,3);
      p.F(M.steel[2]); p.cap(a,{x:a.x-(b.x-a.x)*0.06,y:a.y-(b.y-a.y)*0.06},3.4,3.4);
      p.F(M.handle[2]); p.cap(a,h0,2.2,2); p.F(M.handle[0]); p.cap(lerp(a,h0,0.2),lerp(a,h0,0.8),0.6,0.5); p.F(M.steel[1]); dot(p,h0,2,1.6); }
  }

  /* ---------- cabeça: chapéu de palha, alça na testa, olho de lua grande, boca roxa de açaí ---------- */
  function drawHat(c,p,M,form){
    // aba larga e meio caída
    const brim=[[-12.6,-15.4],[-6,-17.6],[4,-18.2],[13,-17],[18.4,-14.6],[17.6,-13.4],[10,-14.6],[0,-15],[-8,-14],[-12.4,-13.6]];
    p.F(M.hat[1]); p.poly(brim);
    clip(c,brim,()=>{ p.F(M.hat[2]); p.poly([[-14,-12],[-14,-19],[-4,-19],[-6,-12]]); p.F(M.hat[3]); p.poly([[-14,-12],[-14,-19],[-9,-19],[-10,-12]]);
      p.F(M.hat[0]); p.poly([[6,-18],[14,-17],[16,-15.4],[8,-16.4]]);
      p.F(M.hat[2]); for(let x=-10;x<17;x+=2.6) p.rect(x,-16.4+Math.abs(x-3)*0.04,1.2,0.6); });
    // copa
    const crown=[[-7.6,-16.4],[-8,-20.4],[-5.6,-24],[0,-25.6],[5.6,-24.6],[8.6,-21],[8.8,-16.8]];
    p.F(M.hat[1]); p.poly(crown);
    clip(c,crown,()=>{
      p.F(M.hat[2]); p.poly([[-9,-15],[-2.6,-15],[-2.2,-27],[-9,-27]]); p.F(M.hat[3]); p.poly([[-9,-15],[-6,-15],[-5.6,-27],[-9,-27]]);
      p.F(M.hat[0]); p.poly([[2,-25],[5.6,-24],[7.6,-21],[4,-21.6]]);
      // trama da palha
      p.F(M.hat[2]); for(let y=-24;y<-17;y+=2) p.poly([[-8,y],[9,y-0.4],[9,y+0.3],[-8,y+0.7]]);
      p.F(M.band[1]); p.poly([[-9,-19.6],[9,-20],[9,-17.4],[-9,-17]]); p.F(M.band[0]); p.poly([[2,-19.8],[8.6,-20],[8.6,-19.4],[2,-19.2]]); p.F(M.band[3]); p.poly([[-9,-19.6],[-4,-19.7],[-4,-17],[-9,-17]]);
    });
    // furo na copa com açaí escorrendo
    p.F(M.hat[3]); p.ell(-1,-23.4,1.4,0.9); p.F(M.juice[1]); p.poly([[-1.6,-23],[-0.4,-23],[-0.8,-19]]);
    if(form==='plenilunar'){ p.F(M.blood[1]); p.poly([[3,-24],[6,-23.4],[5,-19.4],[3.6,-20]]); }
    if(form==='enluarado'){ p.F(M.glow[1]); p.rect(-4,-22.6,3,0.6); }
  }
  function drawHead(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.xf(sk.ha,sk.neck.x,sk.neck.y); c.scale(HS,HS);
    // pescoço magro com tendões
    p.F(M.skin[1]); p.poly([[-4.6,4.6],[5.4,4.6],[6,-4.6],[-4,-6.6]]);
    p.F(M.skin[2]); p.poly([[-4.6,4.6],[-0.6,4.6],[-1.2,-6],[-4,-6.6]]);
    p.F(M.skin[0]); p.rect(2.4,-3.6,0.9,6); p.F(M.vein[1]); p.rect(0.4,-4,0.7,6.4);
    // crânio, maçã do rosto saltada, bochecha funda
    p.F(M.skin[1]); p.ell(2,-11.6,9.4,9.2);
    p.poly([[-4,-6],[11.4,-8],[12.6,-4.6],[6,-2.4],[-2.4,-2.8]]);
    p.F(M.skin[2]); p.poly([[-7.4,-14.6],[-5.2,-6],[0,-2.6],[5,-2.6],[1.6,-5],[-1.6,-9],[-2.6,-14],[-5.6,-17.6]]);
    p.F(M.skin[3]); p.poly([[-7.4,-13.6],[-6.6,-9],[-4.6,-5.2],[-5.2,-11]]);
    p.F(M.skin[3]); p.poly([[4.4,-6.6],[8.6,-7.4],[7.6,-4.2],[4.6,-4]]); // bochecha funda
    p.F(M.skin[0]); p.poly([[5,-9.2],[10.4,-9.6],[9.6,-8.2],[5.4,-8]]);
    // orelha
    p.F(M.skin[1]); p.ell(-3,-10.6,2.3,3.1); p.F(M.skin[3]); p.ell(-2.8,-10.4,1,1.8); p.F(M.flesh[2]); p.rect(-4,-8.2,1.1,1.2);
    // cabelo curto preto na nuca
    p.F(M.hair[1]); p.poly([[-8.6,-15],[-7.8,-17],[-2,-17],[-2.6,-14],[-5,-10],[-8.2,-9.6]]); p.F(M.hair[0]); p.rect(-7,-15.6,2,0.6);
    // testa pesada e olho de lua grande (brilha), órbita funda
    p.F(M.skin[2]); p.poly([[4,-13.8],[12.6,-14.4],[12.8,-12.6],[4.2,-12.2]]);
    p.F(M.skin[3]); p.ell(8.4,-10,3.6,3.2);
    p.F(M.eye[3]); p.ell(8.6,-9.8,3,2.7); p.F(M.eye[2]); p.ell(8.8,-9.8,2.5,2.2); p.F(M.eye[1]); p.ell(9,-9.9,1.8,1.6); p.F(M.eye[0]); p.ell(9.2,-10,1,0.9);
    p.F(M.skin[3]); p.rect(9.8,-8.6,0.6,0.6);
    p.F(M.skin[3]); p.ell(12.8,-10,1,1.4); p.F(M.eye[2]); p.rect(12.4,-10.4,0.9,1); // olho de trás (perfil)
    // nariz adunco
    p.F(M.skin[1]); p.poly([[11.2,-11],[15,-7],[14.4,-5.2],[11.6,-5.8]]);
    p.F(M.skin[3]); p.rect(12.8,-5.8,1.6,0.9); p.F(M.skin[0]); p.rect(12,-9.6,0.8,1.8);
    // podridão na têmpora
    p.F(M.rot[1]); p.ell(0.4,-8,1.8,1.3); p.F(M.flesh[2]); p.rect(-0.2,-8.4,1.2,0.9);
    // boca de cima roxa de açaí
    p.F(M.mouth[1]); p.poly([[5.2,-4.6],[13.4,-5],[13.2,-2.4],[5.2,-2.2]]);
    p.F(M.acai[2]); p.poly([[5.2,-5.2],[13.4,-5.6],[13.4,-4.8],[5.2,-4.4]]);
    p.F(M.teeth[1]); [[6.8,-4.8,1.2,1.6],[8.4,-4.8,1.1,1.3],[10,-4.8,1.2,1.9],[11.6,-4.8,1,1.3]].forEach(([x,y,w,h])=>p.rect(x,y,w,h));
    p.F(M.acai[1]); p.rect(8.4,-3.6,1,0.8);
    if(form!=='comum'){ p.F(M.glow[0]); p.ell(9,-9.9,1.4,1.2); p.F(M.glow[1]); p.rect(12.4,-10.4,0.9,1); }
    // chapéu (inclinação ct) e alça de cipó na testa, por baixo da aba
    p.xf(sk.ha+rad(P.ct||0),sk.neck.x,sk.neck.y); c.scale(HS,HS);
    if(P.drop<0.3){ p.F(M.cord[2]); p.poly([[-7.6,-16],[12.6,-15.4],[12.6,-13.2],[-7.2,-13.6]]); p.F(M.cord[1]); p.poly([[-7.4,-15.6],[12.4,-15],[12.4,-14],[-7.2,-14.4]]); p.F(M.cord[0]); [ -4,0,4,8,11].forEach(x=>p.rect(x,-15.2,1,0.6)); }
    drawHat(c,p,M,form);
    p.id();
  }
  function drawJaw(c,u,M,sk,P){
    const p=mkPen(c,u); const h=sk.H(2.6,-3.6); p.xf(sk.ha+rad(P.jaw),h.x,h.y); c.scale(HS,HS);
    p.F(M.skin[1]); p.poly([[-2.4,-1.4],[10.6,-0.8],[11.6,1.8],[10.4,5],[6,6.4],[0,6],[-2.8,3]]);
    p.F(M.skin[2]); p.poly([[-2.8,3],[0,6],[6,6.4],[10.4,5],[9,4.4],[4,4.8],[0,3.4]]);
    p.F(M.skin[3]); p.poly([[0.6,6],[6,6.4],[9.2,5.6],[4,5.6]]);
    p.F(M.mouth[1]); p.poly([[2.6,-0.8],[10.2,-0.4],[10.2,1.4],[3,1.2]]);
    p.F(M.teeth[1]); [[4.2,-1,1.2,1.5],[5.8,-1,1.1,1.9],[7.4,-1,1.2,1.4],[9,-1,1,1.8]].forEach(([x,y,w,h])=>p.rect(x,y,w,h));
    p.F(M.skin[0]); p.rect(5.4,2,3.4,0.8);
    p.F(M.hair[2]); [[2,4.4],[4,5],[6,5.4],[8,5],[3,3]].forEach(([x,y])=>p.rect(x,y,0.6,0.6));
    // baba roxa de açaí escorrendo
    const L=2+(P.drool%4)*1.3+(P.jaw>30?2.4:0);
    p.F(M.juice[2]); p.poly([[9,4.2],[11,3.6],[10.6,4+L],[9.8,5+L]]); p.F(M.juice[1]); p.ell(10.2,5+L,1.1,1.1); p.F(M.juice[0]); p.rect(9.8,4.4+L,0.6,0.6);
    p.id();
  }
  function drawMouthIn(c,u,M,sk,P){
    if(P.jaw<16) return; const p=mkPen(c,u); p.id();
    const a=sk.H(5.2,-2.4), b=sk.H(13.2,-2.6), h=sk.H(2.6,-3.6), ja=sk.ha+rad(P.jaw), jc=Math.cos(ja), js=Math.sin(ja);
    const J=(x,y)=>({x:h.x+(x*jc-y*js)*HS,y:h.y+(x*js+y*jc)*HS}), d=J(10.2,0.6), e=J(3,0.6);
    p.F(M.mouth[2]); p.poly([[a.x,a.y],[b.x,b.y],[d.x,d.y],[e.x,e.y]]);
    p.F(M.acai[2]); const m=lerp(lerp(a,b,0.3),lerp(e,d,0.3),0.5); p.circle(m,1.8); p.F(M.mouth[3]); p.circle({x:m.x+0.6,y:m.y+0.4},1);
  }

  /* ---------- jorro de açaí (spill/morte), poça no chão, rastros ---------- */
  function drawPour(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id(); const k=Math.min(1,P.pour);
    const lip=sk.bk.B(-4,60), dir=Math.sign(sk.bk.B(10,60).x-sk.bk.B(-10,60).x)||1;
    const g={x:lip.x+dir*(10+26*k), y:GROUND-1}, cp={x:lip.x+dir*(8+14*k), y:lip.y+4};
    const N=8, pts=[]; for(let i=0;i<=N;i++){ const t=i/N, a=(1-t)*(1-t), b=2*(1-t)*t, cc=t*t; pts.push({x:a*lip.x+b*cp.x+cc*g.x, y:a*lip.y+b*cp.y+cc*g.y}); }
    const wd=1.6+3.2*k;
    for(let i=0;i<N;i++){ const w0=wd*(1-i/N*0.35), w1=wd*(1-(i+1)/N*0.35); p.F(M.juice[2]); p.cap(pts[i],pts[i+1],w0,w1); }
    for(let i=0;i<N;i++){ p.F(M.juice[1]); p.cap(pts[i],pts[i+1],wd*0.6,wd*0.5); }
    p.F(M.juice[0]); p.cap(pts[1],pts[4],0.6,0.5);
    // caroços caindo junto
    [[0.25,2],[0.5,-2],[0.75,1.4]].forEach(([t,o])=>{ const q=pts[Math.round(t*N)]; berry(p,M,q.x+o,q.y,1.1,true); });
    // respingo no chão
    p.F(M.juice[2]); p.ell(g.x,GROUND-0.6,6+8*k,1.8); p.F(M.juice[1]); p.ell(g.x-1,GROUND-1,4+5*k,1.1);
    p.F(M.juice[1]); [[-6,-5],[5,-7],[9,-3],[-10,-2]].forEach(([dx,dy])=>p.circle({x:g.x+dx*k,y:GROUND-2+dy*k},0.9));
  }
  function drawSpill(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id(); const k=Math.min(1,P.spill);
    const cx=P.drop>0.5?sk.bk.B(-12,62).x:sk.H(10,-8).x+4;
    p.F(M.juice[3]); p.ell(cx,GROUND-0.6,40*k,3.4*k+0.6); p.F(M.juice[2]); p.ell(cx-1,GROUND-1,34*k,2.6*k+0.4);
    p.F(M.juice[1]); p.ell(cx+6*k,GROUND-1.4,14*k,1.1*k+0.3); p.F(M.juice[0]); p.rect(cx-10*k,GROUND-2,6*k,0.8);
    [[-24,0.4],[-14,-1],[12,0.6],[22,-0.6],[30,0.2],[-30,-0.2]].forEach(([dx,dy],i)=>{ if(k<0.3+i*0.1) return; berry(p,M,cx+dx*k,GROUND-1.6+dy,1.1,i%2===0); });
  }
  function drawSmear(c,u,M,sk,P){
    const p=mkPen(c,u); p.id();
    if(P.smear>=1.5&&P.smear<2.5){ // rasteira: crescente baixo rente ao chão, na frente
      const x0=AX-6, x1=AX+60, pts=[]; const n=10;
      for(let i=0;i<=n;i++){ const t=i/n; pts.push([lerp({x:x0,y:0},{x:x1,y:0},t).x, GROUND-3-Math.sin(t*PI)*9]); }
      for(let i=n;i>=0;i--){ const t=i/n; pts.push([lerp({x:x0,y:0},{x:x1,y:0},t).x, GROUND-2-Math.sin(t*PI)*3]); }
      p.F(M.swish[0]); p.poly(pts.map(([x,y])=>[Math.max(1,Math.min(FW-2,x)),Math.min(GROUND,y)]));
      p.F(M.swish[2]); for(let i=6;i<n;i++) p.cap({x:pts[i][0],y:pts[i][1]},{x:pts[i+1][0],y:pts[i+1][1]},0.8,0.8);
      p.F(M.mud[1]); [[0.3,-2],[0.6,-4],[0.85,-1]].forEach(([t,dy])=>p.rect(x0+(x1-x0)*t,GROUND-4+dy,1.6,1.4));
      return;
    }
    // 1 = cotovelada (arco do cotovelo da frente), 3 = jato de suco (arco da boca do paneiro)
    const isJ=P.smear>=2.5, sh=isJ?sk.bk.B(-8,30):sk.shF, w=isJ?sk.bk.B(-4,62):sk.elF, r=Math.hypot(w.x-sh.x,w.y-sh.y)+(isJ?4:6), a1=Math.atan2(w.y-sh.y,w.x-sh.x);
    const n=10, pts=[]; for(let i=0;i<=n;i++){ const a=a1-1.4+1.5*i/n; pts.push([sh.x+Math.cos(a)*r,sh.y+Math.sin(a)*r]); }
    for(let i=n;i>=0;i--){ const a=a1-1.4+1.5*i/n, rr=r-2-7*(i/n); pts.push([sh.x+Math.cos(a)*rr,sh.y+Math.sin(a)*rr]); }
    p.F(isJ?M.juice[1]:M.swish[0]); p.poly(pts.map(([x,y])=>[Math.max(1,Math.min(FW-2,x)),Math.max(1,Math.min(GROUND,y))]));
    p.F(isJ?M.juice[0]:M.swish[2]); const q=pts.slice(n-3,n+1); for(let k=0;k<q.length-1;k++) p.cap({x:q[k][0],y:q[k][1]},{x:q[k+1][0],y:q[k+1][1]},0.9,0.9);
    if(isJ){ p.F(M.juice[1]); [[0.3,-4],[0.55,5],[0.8,-3]].forEach(([t,dd])=>{ const a=a1-1.4+1.5*t; p.circle({x:sh.x+Math.cos(a)*(r+dd),y:sh.y+Math.sin(a)*(r+dd)},1); }); }
  }

  /* ---------- adereços: bolo de açaí voando, poça roxa ---------- */
  const PW=36, PH=30, PG=18, PAX=18;
  function frameBlob(form,st,K){
    const M=mats(form), s=((st|0)%4+4)%4, a=s*0.8;
    const parts=[
      {noShade:true, noRim:true, smear:true, draw:(c,u)=>{ const p=mkPen(c,u); p.id(); p.F(M.juice[1]); p.poly([[1,PG-2],[9,PG-4],[9,PG+1],[2,PG+1]]); p.F(M.juice[0]); p.rect(3,PG-6,2,1.2); p.rect(5,PG+3,1.6,1.2); }},
      {draw:(c,u)=>{ const p=mkPen(c,u); p.xf(a,PAX+2,PG); c.scale(1.1,1.1);
        p.F(M.juice[2]); p.poly([[-7,0],[-4,-5.4],[2,-6.4],[6.6,-3],[7,2],[3,5.6],[-3,5.2],[-6.6,3]]);
        p.F(M.juice[1]); p.poly([[-5,-1],[-2.4,-4.6],[2,-5.2],[5,-2],[3,1],[-2,1.4]]);
        p.F(M.juice[0]); p.rect(-1,-4.4,2.6,1.2);
        [[-3,1],[1,2.6],[4,-0.6],[-4.4,-2.6]].forEach(([x,y],k)=>berry(p,M,x,y,1.3,k%2===0));
        p.F(M.juice[1]); p.circle({x:-9,y:-2+s},1); p.circle({x:-11,y:2-s*0.5},0.8);
        p.id(); }},
    ];
    const cv=compose({FW:Math.round(PW*K),FH:Math.round(PH*K),GROUND:PH*K,parts,M,step:5,flash:0,rim:RIM[form]});
    cv._ax=PAX*K; cv._gy=PG*K; return cv;
  }
  const QW=80, QH=24, QG=12, QAX=40;
  function framePool(form,st,K){
    const M=mats(form), s=((st|0)%3+3)%3;
    const parts=[{noRim:true, draw:(c,u)=>{ const p=mkPen(c,u); p.id();
      p.F(M.juice[3]); p.ell(QAX,QG+0.6,36,7.6); p.F(M.juice[2]); p.ell(QAX-1,QG,32,6.2);
      p.F(M.juice[3]); p.ell(QAX+10,QG+1.6,10,2); p.ell(QAX-16,QG+0.6,8,1.6);
      p.F(M.juice[1]); p.ell(QAX+4,QG-1.6,16,2.2); p.ell(QAX-14,QG-1,6,1.2);
      p.F(M.juice[0]); [[-18,-2],[6,-3],[18,-1],[-4,1.6]].forEach(([dx,dy],k)=>{ const w=(k+s)%3===0?6:3; p.rect(QAX+dx-w/2,QG+dy,w,0.8); });
      [[-12,-1.6],[3,2.6],[22,-1.4],[-24,2.4],[12,-3.2],[-4,-3.6]].forEach(([dx,dy],k)=>berry(p,M,QAX+dx+((k+s)%2),QG+dy,1.2,k%2===0));
      if(form!=='comum'){ p.F(M.glow[0]); p.rect(QAX-4+s*4,QG-1,2,1); p.rect(QAX+16-s*3,QG+1,2,1); }
    }}];
    const cv=compose({FW:Math.round(QW*K),FH:Math.round(QH*K),GROUND:QH*K,parts,M,step:4,flash:0,rim:null});
    cv._ax=QAX*K; cv._gy=QG*K; return cv;
  }

  /* ---------- montagem ---------- */
  const cache=PIX.cache();
  function frame(form,anim,fi,step=5,Pov,pk){
    const K=PIX.getK(), key=(pk!=null?'#'+pk+'|'+form:form+'|'+anim+'|'+fi+'|'+step)+'@'+K;
    const hit=cache.get(key); if(hit){ cache.delete(key); cache.set(key,hit); return hit; }
    const fm=String(form).split('~'), base=fm[0], broken=fm[1]==='vazio';
    if(ANIMS[anim]&&ANIMS[anim].prop){ const st=Pov&&Pov.st!=null?Math.round(Pov.st):fi; const cv=anim==='xPool'?framePool(base,st,K):frameBlob(base,st,K); cache.set(key,cv); return cv; }
    const P=Pov?Object.assign({},REST,Pov):poseOf(anim,fi), M=mats(base), sk=skeleton(P);
    const parts=[];
    if(P.spill>0) parts.push({draw:(c,u)=>drawSpill(c,u,M,sk,P,base)});
    if(P.drop>=0.5) parts.push({draw:(c,u)=>drawBasket(c,u,M,sk,P,base,broken)});
    parts.push(
      {back:true, draw:(c,u)=>drawArm(c,u,M,sk,P,false,base)},
      {back:true, draw:(c,u)=>drawLeg(c,u,M,sk,P,false)});
    const over=P.bk>28&&Math.abs(P.rot)<30; // tombado por cima do ombro: o paneiro passa na frente da cabeça
    if(P.drop<0.5&&!over) parts.push({draw:(c,u)=>{ drawBasket(c,u,M,sk,P,base,broken); drawStraps(c,u,M,sk,P); }});
    parts.push(
      {draw:(c,u)=>drawVines(c,u,M,sk,P,base)},
      {draw:(c,u)=>drawLeg(c,u,M,sk,P,true)},
      {draw:(c,u)=>drawTorso(c,u,M,sk,P,base)},
      {draw:(c,u)=>{ drawHead(c,u,M,sk,P,base); drawMouthIn(c,u,M,sk,P); }},
      {draw:(c,u)=>drawJaw(c,u,M,sk,P)});
    if(P.drop<0.5&&over) parts.push({draw:(c,u)=>{ drawBasket(c,u,M,sk,P,base,broken); drawStraps(c,u,M,sk,P); }});
    if(P.pour>0&&!broken) parts.push({noRim:true, draw:(c,u)=>drawPour(c,u,M,sk,P,base)});
    if(P.smear>=0.5) parts.push({noShade:true, smear:true, noRim:true, draw:(c,u)=>drawSmear(c,u,M,sk,P)});
    parts.push({draw:(c,u)=>drawArm(c,u,M,sk,P,true,base)});
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM[base]}); if(step>=4) heavyOutline(cv);
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._eye=sc(sk.H(9,-9.9)); cv._mouth=sc(sk.H(10,-2)); cv._hand=sc(sk.wrF); cv._head=sc(sk.H(3,-13)); cv._handB=sc(sk.wrB); cv._basket=sc(sk.bk.B(-11,60)); cv._lip=sc(sk.bk.B(-4,60));
    cache.set(key,cv); if(cache.size>900) cache.delete(cache.keys().next().value);
    return cv;
  }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame,framePose:function(form,anim,P,key){ return frame(form,anim,0,5,P,key); }};
})();
