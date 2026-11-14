/* SERESTEIRO — fonte de arte (editável). Build: npm run art
   Zumbi Seresteiro (Lapa): o cantor de serenata da boemia carioca, morto e de pé de novo, curvado sobre o violão.
   Silhueta própria (≠ Malandro): boina de feltro escura (cabeça baixa e redonda, sem aba), paletó CURTO de linho
   creme-caramelo com sombra fria, camisa branca e gravata borboleta vinho solta, calça de pregas marrom, sapato de
   couro marrom de bico fino. O violão clássico grande (tampo laranja, aro e fundo de jacarandá, braço escuro) fica na
   frente do corpo e domina a silhueta. Pele cinza-esverdeada, olhos de lua semicerrados, nariz redondo, sobrancelha
   caída de romântico, boca aberta cantando. Corrupção: cordas viram nervos que sangram, notas de luz flutuando.
   Design próprio, não imita pessoa real; as "notas" são só visuais.
   Golpes: serenata (canto em área, atordoa), acorde (strum, empurra), quebra o violão (smash, de perto; depois fica
   sem violão: idleNo/walkNo/punch). Forma 'X~sem' (z.formSfx='sem'): qualquer anim sem violão nem notas, mãos
   livres em punho; a paleta vem da base X. Hi-bit: honra PIX.getK(). */
const SERESTEIRO=(function(){
  const {rad,lerp,P2,mkPen,compose}=PIX;
  const FW=196, FH=160, GROUND=150, AX=80;
  const RIM={comum:'#e4dcf4', enluarado:'#9ff6ff', plenilunar:'#ffb46a'};

  /* ---------- materiais ---------- */
  function mats(form){
    form=String(form).split('~')[0]; // 'comum~sem' etc.: a paleta vem da forma base
    const m={
      skin:['#c8d6bc','#8a9c84','#5a6a62','#323a48'],
      vein:['#94b0c8','#5e7896','#3e5274','#262e50'],
      rot:['#b8b48e','#7e7a5e','#545252','#302a38'],
      flesh:['#f6ae94','#c25a5e','#7a3a4a','#4a1c34'],
      bone:['#fff4d8','#dccfa6','#a09070','#605040'],
      coat:['#fbe8b8','#dcbc80','#a07e5c','#56426a'],
      shirt:['#fdf8ee','#ddd8cc','#9c98aa','#57536e'],
      tie:['#e0586e','#9a2c40','#5e1630','#32091c'],
      pants:['#a8805a','#6e4c32','#46301f','#24181e'],
      beret:['#7a6088','#45324e','#2a1c32','#140c1a'],
      hair:['#544246','#2c2024','#1a1216','#0c0808'],
      shoe:['#b07a4a','#6a3c22','#3e2016','#1c0c0c'],
      wood:['#d4783a','#9c4e20','#622c12','#32140a'],
      top:['#ffe0a0','#eaa452','#b8682a','#6e3416'],
      fret:['#6a4a34','#33201a','#1c110c','#0a0505'],
      string:['#fffbe6','#efdcaa','#b09c6c','#6a5a3a'],
      eye:['#ffffff','#e6e8d8','#a8aca0','#686c66'],
      mouth:['#7c2e3e','#4c1828','#2e0c1a','#1a0610'],
      teeth:['#fbf0c0','#d8c27c','#9a8650','#5e4e30'],
      dirt:['#caa97a','#95754f','#674d35','#3d2b1f'],
      blood:['#c84a3e','#8e2a2c','#5e1824','#3a0e1a'],
      nail:['#8a7a72','#54484a','#342a30','#1c161a'],
      glow:['#fffbe0','#fff2cc','#e8c870','#a07830'],
      note:['#ffffff','#fff2cc','#f0c860','#b08030'],
      swish:['#fdfdff','#e6f0ff','#b4c4e8','#7484b0'],
    };
    if(form==='enluarado'){
      m.skin=['#dcdcff','#a0a2e4','#686cae','#3c3a76']; m.vein=['#a8f4ff','#4ad8f0','#2a8ab0','#1a4a7a'];
      m.rot=['#b8a6e0','#8470b0','#56468a','#33285e']; m.flesh=['#f0b0ff','#b866d8','#7a3a9e','#46206a']; m.blood=['#b46ad8','#7e3ea6','#542474','#34144a'];
      m.eye=['#ffffff','#b8fbff','#4ad8f0','#1a8aa8']; m.glow=['#effffe','#7af4ff','#2ab0d8','#146a96']; m.swish=['#ffffff','#c8fbff','#6ae4f4','#2a9ab8'];
      m.note=['#ffffff','#9cf8ff','#3ad0f0','#1a78b0'];
      m.coat=['#ece0ff','#bca6e4','#7c68aa','#423670']; m.shirt=['#ecebff','#b6b4dc','#7c78a8','#46426e'];
      m.tie=['#7ae0f4','#2a9ac0','#1a5a8a','#0e2e5a']; m.pants=['#8c7aa8','#584a78','#382e54','#1e1834'];
      m.beret=['#5a5a9a','#33305e','#211e40','#130f28'];
      m.top=['#f6e6cc','#d0a67c','#8e647a','#4a3258']; m.wood=['#a06c6a','#6c3e58','#44264c','#22122e'];
      m.dirt=['#a8a0c8','#76709a','#4e4a70','#2e2a48']; m.shoe=['#7a6a9a','#45385e','#2a2040','#140e24'];
    }
    if(form==='plenilunar'){
      m.skin=['#ffcaa6','#e2806a','#a4424e','#5e1e36']; m.vein=['#fff0a0','#ffb43a','#e0581e','#8a2414'];
      m.rot=['#d0806a','#9a4a4a','#682a3a','#3e1628']; m.flesh=['#ffc07a','#f06a3a','#a8302e','#5e1422']; m.blood=['#ff7a3a','#d43a26','#8a1c22','#4e0c18'];
      m.eye=['#fffbe0','#ffe04a','#ff8a2a','#b83a14']; m.glow=['#fff6c0','#ffb43a','#e0581e','#8a2414']; m.swish=['#fffbe6','#ffe6a8','#ffb460','#d0602a'];
      m.note=['#fffbe0','#ffc04a','#f06a20','#a02a10'];
      m.coat=['#f6a89a','#c8464e','#7c1c32','#3e0c1e']; m.shirt=['#f6d8c0','#d09a84','#8a5452','#4c2630'];
      m.tie=['#3a2a30','#201418','#140a10','#0a0408'];
      m.top=['#ffd890','#f48a3a','#b4401e','#621a12']; m.wood=['#c8502a','#8a2a18','#561410','#2e080a'];
      m.beret=['#7a3a44','#4a1e2a','#2e101c','#160610'];
      m.dirt=['#b4705a','#844a3e','#5a2e2e','#36181e'];
    }
    return punch(m);
  }
  const NAMES={skin:'Pele',vein:'Veias',rot:'Podridão',flesh:'Carne',bone:'Osso',coat:'Paletó de linho',shirt:'Camisa',tie:'Gravata borboleta',pants:'Calça de pregas',beret:'Boina de feltro',hair:'Cabelo',shoe:'Sapato de couro',wood:'Aro e fundo do violão',top:'Tampo do violão',fret:'Braço e escala',string:'Cordas',eye:'Olho',mouth:'Boca',teeth:'Dentes',dirt:'Barro',blood:'Sangue',nail:'Unhas',glow:'Brilho',note:'Notas de luz',swish:'Rastro'};
  function sat(h,k){ const [r,g,b]=PIX.hexRgb(h), y=(r+g+b)/3; return PIX.toHex(y+(r-y)*k,y+(g-y)*k,y+(b-y)*k); }
  const NOPUNCH={swish:1,glow:1,note:1};
  function punch(m){ const o={}; for(const k in m){ const r=m[k]; o[k]=NOPUNCH[k]?[r[0],r[1],r[2],r[3]]:[sat(r[0],1.1),sat(r[1],1.18),PIX.mix(sat(r[2],1.1),'#2a1a4c',0.22),PIX.mix(r[3],'#140a24',0.36)]; } return o; }

  /* ---------- poses ---------- */
  // ângulos: 0 = pendurado, + = pra frente.
  // gm = modo do violão: 0 no corpo (mãos presas por IK), 1 nas mãos girando (smash), 2 solto no chão (morte), 3 sem violão.
  // ga = giro do violão (gm 0: soma ao ângulo de repouso; gm 1: direção mãos→corpo do violão em graus de tela, -90 = pra cima).
  // gx/gy = deslocamento do violão no corpo; st = mão do dedilhado atravessando as cordas; fr = mão da escala (ao longo do braço).
  // gb = violão quebrado (só o braço na mão); shard = estilhaços voando; notes = fase das notas de luz (-1 nenhuma);
  // wave = ondas do canto; chord = rajada do acorde; lid = pálpebra (0 aberta, 1 fechada); smile = sorriso torto; bt = boina.
  const REST={hx:0,rot:0,lift:0,lean:2,hunch:12,head:-4,jaw:6,aFs:20,aFe:50,aBs:20,aBe:50,lFh:12,lFk:-4,lBh:-10,lBk:-18,fF:0,fB:0,
    gm:0,ga:0,gx:0,gy:0,st:0,fr:21,gb:0,shard:0,notes:-1,wave:0,chord:0,smear:0,flash:0,drool:0,lid:0.5,smile:0,bt:0,snap:0,gdx:0,gdy:0,gdr:0};
  const S=Math.sin, C=Math.cos, PI=Math.PI, mx=Math.max;
  const ANIMS={
    idle:{nome:'Parado (dedilha e canta baixinho)',n:8,dur:()=>140,pose:i=>{ const p=i/8*PI*2, s=S(p);
      return {hx:0.8*s, lean:2+1.4*S(p+0.6), hunch:12+1.6*S(p), head:-4+3.4*S(p-0.8), jaw:5+9*mx(0,S(2*p+1)), drool:i%4, notes:i,
        st:-4+8*mx(0,S(2*p)), fr:21+(i%4<2?0:1.6), ga:1.6*s, lFh:12+1.4*s, lBh:-10-1.4*s, bt:1.5*S(p-1), lid:0.5+0.1*s}; }},
    walk:{nome:'Andar lento tocando (curvado)',n:8,dur:()=>150,pose:i=>{ const p=i/8*PI*2;
      const lFh=10+14*S(p), lBh=-10+10*S(p+PI);
      return {lFh, lFk:lFh-18*mx(0,C(p))-3, lBh, lBk:lBh-8-10*mx(0,C(p+PI)), fF:-10*mx(0,C(p)), fB:18*mx(0,C(p+PI)),
        lean:4+2*S(p), hunch:15+1.6*S(2*p-0.6), head:-6+2.6*S(2*p-1.4), jaw:6+5*mx(0,S(2*p)), hx:1*S(p), lift:1*mx(0,S(2*p)),
        st:-3+6*mx(0,S(2*p)), ga:2*S(p), notes:i, drool:i%4, bt:1.5*S(2*p)}; }},
    alert:{nome:'Alerta (afina uma corda e sorri torto)',n:6,dur:i=>[160,170,190,190,240,170][i],pose:i=>[
      {},
      {fr:36,head:4,ga:-8,gy:-2,lean:-1,st:-2},
      {fr:39,head:9,ga:-10,gy:-2,st:-6,lean:-2,jaw:4,lid:0.7},
      {fr:39,head:9,ga:-10,gy:-2,st:4,lean:-2,jaw:8,lid:0.7,notes:1},
      {fr:22,head:-1,jaw:14,lid:0.25,smile:1,lean:3,bt:5,notes:2},
      {jaw:8,smile:1,notes:3}][i]},
    // ---- golpes (hit = quadro do dano; sing = quadro em que a serenata atordoa; sing2 = segunda onda na plenilunar) ----
    serenata:{nome:'Serenata (canto em área, atordoa)',n:10,hit:3,sing:3,sing2:5,warnEnd:3,reach:80,dur:i=>[120,140,140,110,110,120,120,140,150,160][i],pose:i=>[
      {lean:-3,hunch:8,head:2,jaw:4,st:-6,lFh:16,lFk:-2,lBh:-15,lBk:-22,hx:-1,lid:0.7},
      {lean:-7,hunch:4,head:10,jaw:10,st:-9,ga:-6,lFh:18,lFk:-2,lBh:-17,lBk:-24,hx:-2,lid:0.85,lift:1},
      {lean:-9,hunch:2,head:14,jaw:14,st:-11,ga:-8,lFh:18,lFk:-2,lBh:-17,lBk:-24,hx:-2,lid:0.9,lift:1.6},
      {lean:-6,hunch:4,head:12,jaw:40,st:7,ga:-4,lFh:18,lFk:-2,lBh:-17,lBk:-24,hx:-1,wave:1,notes:0,lid:1},
      {lean:-5,hunch:5,head:10,jaw:44,st:-6,ga:-6,lFh:18,lFk:-2,lBh:-17,lBk:-24,wave:2,notes:1,lid:1},
      {lean:-6,hunch:4,head:13,jaw:40,st:7,ga:-4,lFh:18,lFk:-2,lBh:-17,lBk:-24,wave:3,notes:2,lid:1},
      {lean:-4,hunch:6,head:9,jaw:44,st:-6,ga:-5,lFh:18,lFk:-2,lBh:-17,lBk:-24,wave:4,notes:3,lid:1},
      {lean:0,hunch:10,head:2,jaw:20,st:0,lFh:16,lBh:-15,notes:0,lid:0.6},
      {lean:3,hunch:14,head:-6,jaw:10,st:-2,hx:0.6,lid:0.5},
      {lean:2,hunch:12,head:-4,jaw:6}][i]},
    strum:{nome:'Acorde (golpe de cordas que empurra)',n:8,hit:2,reach:40,dur:i=>[80,90,60,90,110,120,120,130][i],pose:i=>[
      {lean:-4,hunch:8,head:0,jaw:16,st:-12,ga:-10,gy:-2,hx:-1,lFh:16,lBh:-14},
      {lean:-8,hunch:6,head:4,jaw:22,st:-15,ga:-14,gy:-3,hx:-2,lFh:18,lBh:-16,lBk:-24},
      {lean:14,hunch:16,head:-8,jaw:34,st:10,ga:8,gx:4,hx:5,lFh:24,lFk:2,lBh:-18,lBk:-28,fB:8,chord:1,smear:1},
      {lean:16,hunch:16,head:-10,jaw:30,st:11,ga:8,gx:5,hx:6,lFh:26,lFk:4,lBh:-20,lBk:-30,fB:10,chord:2},
      {lean:12,hunch:15,head:-8,jaw:20,st:8,ga:5,gx:3,hx:5,lFh:24,lBh:-18,lBk:-28,fB:8,chord:3},
      {lean:7,hunch:13,head:-6,jaw:12,st:3,ga:2,gx:1,hx:2,lFh:18,lBh:-14},
      {lean:4,hunch:12,head:-5,jaw:8,st:0,hx:1},
      {}][i]},
    smash:{nome:'Quebra o violão (de perto)',n:8,hit:3,reach:34,dur:i=>[90,90,80,90,120,140,180,200][i],pose:i=>[
      {gm:1,ga:-150,aFs:148,aFe:160,lean:-6,hunch:6,head:6,jaw:20,hx:-1,lFh:16,lBh:-16,lid:0.2},
      {gm:1,ga:-176,aFs:156,aFe:172,lean:-12,hunch:2,head:10,jaw:28,hx:-3,lFh:18,lFk:-2,lBh:-18,lBk:-26,lid:0.1},
      {gm:1,ga:-70,aFs:122,aFe:118,lean:12,hunch:14,head:-6,jaw:36,hx:3,lFh:24,lFk:2,lBh:-20,lBk:-30,smear:1},
      {gm:1,ga:22,aFs:76,aFe:64,lean:26,hunch:20,head:-14,jaw:44,hx:7,lFh:30,lFk:6,lBh:-24,lBk:-34,fB:12,gb:1,shard:1,flash:0,smear:1},
      {gm:1,ga:30,aFs:66,aFe:56,lean:28,hunch:22,head:-14,jaw:40,hx:8,lFh:32,lFk:8,lBh:-26,lBk:-36,fB:14,gb:1,shard:2},
      {gm:1,ga:36,aFs:58,aFe:52,lean:22,hunch:20,head:-12,jaw:30,hx:7,lFh:28,lFk:6,lBh:-24,lBk:-34,fB:12,gb:1,shard:3},
      {gm:1,ga:70,aFs:40,aFe:70,lean:12,hunch:16,head:-18,jaw:14,hx:4,lFh:20,lBh:-16,gb:1,shard:4,lid:0.4},
      {gm:3,aFs:10,aFe:30,aBs:-6,aBe:10,lean:6,hunch:14,head:-10,jaw:12,hx:2,lid:0.4}][i]},
    // ---- sem violão (4 s depois do smash): só socos ----
    idleNo:{nome:'Parado sem violão',n:6,dur:()=>160,pose:i=>{ const p=i/6*PI*2, s=S(p);
      return {gm:3, hx:0.8*s, lean:6+1.6*s, hunch:16+1.4*S(p+0.4), head:-10+3*S(p-0.6), jaw:10+5*mx(0,s), drool:i%4,
        aFs:20+6*s, aFe:70+10*S(p+0.4), aBs:-6-5*s, aBe:16+6*s, lFh:12+1.4*s, lBh:-10-1.4*s, lid:0.4}; }},
    walkNo:{nome:'Andar sem violão',n:8,dur:()=>140,pose:i=>{ const p=i/8*PI*2;
      const lFh=10+16*S(p), lBh=-10+12*S(p+PI);
      return {gm:3, lFh, lFk:lFh-20*mx(0,C(p))-3, lBh, lBk:lBh-8-12*mx(0,C(p+PI)), fF:-10*mx(0,C(p)), fB:20*mx(0,C(p+PI)),
        lean:7+2*S(p), hunch:16, head:-8+2.6*S(2*p-1.4), jaw:10, hx:1*S(p), lift:1*mx(0,S(2*p)),
        aFs:20+20*S(p+PI), aFe:60+12*S(p+PI), aBs:-10+18*S(p), aBe:14+16*S(p), drool:i%4}; }},
    punch:{nome:'Soco (sem violão)',n:6,hit:3,reach:30,dur:i=>[110,110,60,110,130,140][i],pose:i=>[
      {gm:3,lean:-4,hunch:12,head:-4,jaw:16,aFs:-30,aFe:60,aBs:30,aBe:70,hx:-2,lFh:16,lBh:-14},
      {gm:3,lean:-8,hunch:10,head:-2,jaw:22,aFs:-50,aFe:70,aBs:40,aBe:80,hx:-3,lFh:18,lBh:-16},
      {gm:3,lean:16,hunch:16,head:-10,jaw:30,aFs:86,aFe:90,aBs:-20,aBe:10,hx:5,lFh:24,lBh:-20,lBk:-28,smear:1},
      {gm:3,lean:18,hunch:16,head:-12,jaw:26,aFs:90,aFe:92,aBs:-24,aBe:6,hx:6,lFh:26,lBh:-22,lBk:-30},
      {gm:3,lean:10,hunch:14,head:-8,jaw:14,aFs:40,aFe:80,aBs:-6,aBe:20,hx:3},
      {gm:3,lean:6,hunch:16,head:-10,jaw:10,aFs:20,aFe:70,aBs:-6,aBe:16}][i]},
    hurt:{nome:'Dano (cabeça)',n:4,dur:i=>[80,110,130,150][i],pose:i=>[
      {lean:-10,hunch:4,head:10,jaw:30,st:-10,ga:-10,hx:-6,flash:1,lFh:14,lBh:-4,bt:-8,lid:0},
      {lean:-6,hunch:6,head:6,jaw:26,st:-6,ga:-6,hx:-5,lFh:12,lBh:-6,bt:-4,lid:0.1},
      {lean:-1,hunch:9,head:0,jaw:18,ga:-2,hx:-2,bt:-1,lid:0.3},
      {lean:1,hunch:11,head:-3,jaw:10,hx:0}][i]},
    hurtB:{nome:'Dano (barriga, dobra por cima do violão)',n:4,dur:i=>[80,120,140,150][i],pose:i=>[
      {lean:26,hunch:28,head:4,jaw:40,st:6,ga:16,gy:3,hx:-8,flash:1,lFh:20,lFk:-14,lBh:-14,lBk:-30,lid:0},
      {lean:22,hunch:26,head:0,jaw:36,st:6,ga:14,gy:3,hx:-7,lFh:18,lFk:-12,lBh:-14,lBk:-28,lid:0.1},
      {lean:12,hunch:18,head:-6,jaw:24,ga:6,hx:-3},
      {lean:4,hunch:13,head:-5,jaw:12,hx:-1}][i]},
    fall:{nome:'Derrubado',n:5,dur:i=>[90,100,110,150,260][i],pose:i=>[
      {lean:-12,hunch:4,head:6,jaw:34,st:-10,ga:-14,hx:-6,flash:1,lFh:20,lBh:0,bt:-10,lid:0},
      {rot:-34,lean:-4,hunch:8,head:2,jaw:30,ga:-10,hx:-4,lFh:40,lFk:30,lBh:20,lBk:10,bt:-12},
      {rot:-70,lean:0,hunch:10,head:-2,jaw:28,ga:-6,hx:-4,lFh:50,lFk:40,lBh:30,lBk:24,bt:-14},
      {rot:-90,lean:4,hunch:12,head:0,jaw:36,ga:-2,hx:2,lFh:40,lFk:10,lBh:30,lBk:4,bt:-16},
      {rot:-90,lean:0,hunch:12,head:-2,jaw:34,ga:0,hx:2,lFh:40,lFk:6,lBh:26,lBk:0,bt:-16,lid:0.8}][i]},
    getup:{nome:'Levantar (abraçado ao violão)',n:6,dur:i=>[200,170,170,160,160,150][i],pose:i=>[
      {rot:-90,lean:0,hunch:12,head:-2,jaw:34,hx:2,lFh:40,lFk:6,lBh:26,lBk:0,bt:-16,lid:0.8},
      {rot:-60,lean:10,hunch:18,head:-14,jaw:24,hx:-8,lFh:90,lFk:10,lBh:70,lBk:0,bt:-8},
      {rot:-30,lean:20,hunch:22,head:-20,jaw:20,hx:-6,lFh:110,lFk:10,lBh:60,lBk:-60},
      {rot:0,lean:28,hunch:22,head:-24,jaw:20,hx:-4,lFh:78,lFk:-2,lBh:6,lBk:-86,fB:60},
      {rot:0,lean:12,hunch:16,head:-12,jaw:14,hx:-1,lFh:30,lFk:-12,lBh:-12,lBk:-34},
      {lean:4,hunch:13,head:-6,jaw:10}][i]},
    death:{nome:'Morte (o violão cai e as cordas rebentam; cai de joelhos)',n:8,dur:i=>[90,150,160,170,150,140,160,600][i],pose:i=>[
      {lean:-10,hunch:4,head:10,jaw:40,st:-10,ga:-12,hx:-5,flash:1,lFh:14,lBh:-4,bt:-10,lid:0},
      {gm:2,gdx:22,gdy:26,gdr:-40,lean:-4,hunch:8,head:12,jaw:48,aFs:20,aFe:40,aBs:30,aBe:60,hx:-6,lFh:10,lBh:-8,bt:-12,lid:0.3},
      {gm:2,gdx:30,gdy:10,gdr:-12,lean:6,hunch:18,head:-2,jaw:46,aFs:10,aFe:16,aBs:6,aBe:10,hx:-4,lFh:40,lFk:-30,lBh:28,lBk:-50,fF:10,fB:30,bt:-14,lid:0.5},
      {gm:2,gdx:34,gdy:0,gdr:0,snap:1,lean:10,hunch:26,head:-8,jaw:48,aFs:6,aFe:4,aBs:2,aBe:0,hx:-2,lFh:14,lFk:-92,lBh:6,lBk:-96,fF:100,fB:100,bt:-16,lid:0.6},
      {gm:2,gdx:34,gdy:0,gdr:0,snap:2,rot:16,lean:12,hunch:30,head:-8,jaw:48,aFs:24,aFe:20,aBs:16,aBe:14,lFh:2,lFk:-92,lBh:-6,lBk:-96,fF:90,fB:90,bt:-16,lid:0.7},
      {gm:2,gdx:34,gdy:0,gdr:0,snap:3,rot:50,lean:10,hunch:24,head:-12,jaw:44,aFs:70,aFe:90,aBs:56,aBe:76,hx:4,lFh:-20,lFk:-70,lBh:-28,lBk:-74,fF:60,fB:60,bt:-16,lid:0.8},
      {gm:2,gdx:34,gdy:0,gdr:0,snap:3,rot:86,lean:2,hunch:12,head:-4,jaw:40,aFs:150,aFe:170,aBs:110,aBe:150,hx:8,lFh:-4,lFk:-10,lBh:-8,lBk:-14,fF:10,fB:10,bt:-16,lid:1},
      {gm:2,gdx:34,gdy:0,gdr:0,snap:3,rot:90,lean:0,hunch:10,head:0,jaw:42,aFs:160,aFe:176,aBs:116,aBe:156,hx:8,lFh:-2,lFk:-6,lBh:-6,lBk:-10,fF:6,fB:6,bt:-16,lid:1,drool:3}][i]},
  };
  const EXK=['hx','lean','hunch','head','aFs','aFe','aBs','aBe','lFh','lFk','lBh','lBk','st','ga'];
  function exag(P,f){ if(f===1||Math.abs(P.rot)>4) return P; EXK.forEach(k=>{ P[k]=REST[k]+(P[k]-REST[k])*f; }); P.jaw=Math.min(52,mx(0,REST.jaw+(P.jaw-REST.jaw)*f)); return P; }
  const EXF={idle:1.06,walk:1.08,alert:1.1,serenata:1.12,strum:1.16,smash:1.1,idleNo:1.04,walkNo:1.08,punch:1.15,hurt:1.3,hurtB:1.22,fall:1.08,getup:1.06,death:1.08};
  ZREACT.add(ANIMS,REST,{});
  function poseOf(anim,i){ const A=ANIMS[anim]; return exag(Object.assign({},REST,A.pose(i)),EXF[anim]||1); }
  function heavyOutline(cv){ const g=cv.getContext('2d'), W=cv.width, H=cv.height, im=PIX.pix(cv), d=im.data;
    const isO=i=>d[i+3]===255&&d[i]===0x17&&d[i+1]===0x0b&&d[i+2]===0x1c, fill=i=>d[i+3]===255&&!isO(i);
    const add=[]; for(let y=2;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(d[i+3]) continue; const u=((y-1)*W+x)*4, u2=((y-2)*W+x)*4; if(isO(u)&&fill(u2)) add.push(i); }
    add.forEach(i=>{ d[i]=0x17; d[i+1]=0x0b; d[i+2]=0x1c; d[i+3]=255; }); g.putImageData(im,0,0); }

  /* ---------- esqueleto (ereto e curvado sobre o violão; braços um pouco mais longos pra alcançar o braço do violão) ---------- */
  const SPINE=42, TH=21, SH=20, UA=16.6, FA=15.6, VS=SPINE/37, US=1.16, HB=10, HS=1.3, GS=1.3;
  const lp=(p,a,L)=>({x:p.x+Math.sin(rad(a))*L, y:p.y+Math.cos(rad(a))*L});
  // IK de dois ossos: cotovelo dobrado pra baixo/trás (bend +1)
  function ik(S0,T0,L1,L2,bend){
    const dx=T0.x-S0.x, dy=T0.y-S0.y, d0=Math.hypot(dx,dy)||1, d=Math.max(2,Math.min(L1+L2-0.2,d0)), b=Math.atan2(dy,dx);
    const ca=Math.max(-1,Math.min(1,(L1*L1+d*d-L2*L2)/(2*L1*d))), a=b+bend*Math.acos(ca);
    const el={x:S0.x+Math.cos(a)*L1, y:S0.y+Math.sin(a)*L1}, wr={x:S0.x+Math.cos(b)*d, y:S0.y+Math.sin(b)*d};
    return {el,wr};
  }
  function build(P,dy){
    const R=P.rot, hip={x:AX+P.hx, y:dy};
    const ra=rad(R), rc=Math.cos(ra), rs=Math.sin(ra);
    const HR=(lx,ly)=>({x:hip.x+lx*rc-ly*rs, y:hip.y+lx*rs+ly*rc});
    const hipF=HR(3,0), hipB=HR(-3,0);
    const kneeF=lp(hipF,P.lFh-R,TH), ankleF=lp(kneeF,P.lFk-R,SH), kneeB=lp(hipB,P.lBh-R,TH), ankleB=lp(kneeB,P.lBk-R,SH);
    const SS=[]; let x=hip.x, y=hip.y;
    for(let k=0;k<=SPINE;k++){ const t=k/SPINE, a=rad(R+P.lean+(P.hunch+HB)*Math.pow(t,1.3)); SS.push({x,y,a}); x+=Math.sin(a); y-=Math.cos(a); }
    const SP=(u,v)=>{ if(v>0){ const s=SS[0], a=s.a, px=s.x-Math.sin(a)*v, py=s.y+Math.cos(a)*v; return {x:px+Math.cos(a)*u, y:py+Math.sin(a)*u}; }
      const f=-v, k=Math.min(SPINE,Math.floor(f)), s=SS[k], r=f-k, a=s.a;
      const px=s.x+Math.sin(a)*r, py=s.y-Math.cos(a)*r; return {x:px+Math.cos(a)*u, y:py+Math.sin(a)*u}; };
    const T=(u,v)=>SP(u*US,v*VS);
    const top=SS[SPINE], neck=T(1.4,-37), sa=top.a;
    const shF=T(-0.6,-31.4), shB=T(-5.6,-32.2);
    let elF=lp(shF,P.aFs-R,UA), wrF=lp(elF,P.aFe-R,FA), elB=lp(shB,P.aBs-R,UA), wrB=lp(elB,P.aBe-R,FA);
    const ha=sa+rad(P.head-HB*0.8), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:neck.x+(lx*hc-ly*hs)*HS, y:neck.y+(lx*hs+ly*hc)*HS});
    // violão: origem (cintura do violão) + ângulo do eixo corpo→cabeça
    let go, gang;
    if(P.gm===1){ gang=rad(P.ga+180); const d={x:Math.cos(gang),y:Math.sin(gang)}; go={x:wrF.x-d.x*33*GS, y:wrF.y-d.y*33*GS}; }
    else if(P.gm===2){ gang=rad(P.gdr); go={x:AX+P.gdx, y:GROUND-6-P.gdy}; }
    else { const k=Math.min(SPINE,15), a=SS[k].a; gang=a+rad(-36+P.ga); go=T(11.4+P.gx,-13.6+P.gy); }
    const gc=Math.cos(gang), gs=Math.sin(gang);
    const G=(lx,ly)=>({x:go.x+(lx*gc-ly*gs)*GS, y:go.y+(lx*gs+ly*gc)*GS});
    if(P.gm===0){ // mãos presas no violão: dedilhado na boca, mão de trás na escala
      const a=ik(shF,G(-2.4,P.st),UA,FA,1); elF=a.el; wrF=a.wr;
      const b=ik(shB,G(P.fr,2.6),UA,FA,1); elB=b.el; wrB=b.wr;
    } else if(P.gm===1){ const b=ik(shB,G(P.gb?26:27,1.4),UA,FA,1); elB=b.el; wrB=b.wr; }
    const toe=(a,f)=>{ const t=rad(f+R); return {x:a.x+(11*Math.cos(t)-5*Math.sin(t))*1.3, y:a.y+(11*Math.sin(t)+5*Math.cos(t))*1.3}; };
    const hull=[[ankleF,6],[ankleB,6],[toe(ankleF,P.fF),0.8],[toe(ankleB,P.fB),0.8],[kneeF,5],[kneeB,5],[hip,9],[T(0,-18),11],[T(-2,-30),11],[H(3,-11),11],[wrF,4],[wrB,4],[elF,4],[elB,4]];
    return {R,hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,SP,T,sa,neck,shF,shB,elF,wrF,elB,wrB,ha,H,hull,go,gang,G,toeF:toe(ankleF,P.fF)};
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

  /* ---------- violão (local: x ao longo do eixo, + = cabeça; y = transversal, + = lado de baixo) ---------- */
  // contorno do corpo em oito: bojo de baixo (x -9), cintura (x 0), bojo de cima (x 9)
  const BODY=(()=>{ const hw=x=>{ const a=1-Math.pow((x+8)/10.5,2), b=1-Math.pow((x-8)/7.6,2); return Math.max(a>0?12.4*Math.sqrt(a):0, b>0?9.6*Math.sqrt(b):0); };
      const top=[], bot=[], n=26; for(let i=0;i<=n;i++){ const t=i/n, x=-18.5+t*34.1; const w=hw(x); top.push([x,-w]); bot.push([x,w]); }
      return top.concat(bot.reverse()); })();
  function bodyPts(k,dx,dy){ return BODY.map(([x,y])=>[x*k+(dx||0), y*k+(dy||0)]); }
  function drawGuitar(c,p,M,form,o){
    o=o||{};
    if(!o.broken){
      // aro/fundo (espessura vista de 3/4, lado de baixo) e filete creme
      p.F(M.wood[3]); p.poly(bodyPts(1.04,0.4,3.4));
      p.F(M.wood[2]); p.poly(bodyPts(1.02,0.2,2.4));
      p.F(M.wood[1]); p.poly(bodyPts(1,0,1.4));
      p.F(M.string[1]); p.poly(bodyPts(1.04,0,-0.1));
      const topP=bodyPts(1,0,0);
      p.F(M.top[1]); p.poly(topP);
      clip(c,topP,()=>{
        // volume do tampo: luz em cima à esquerda, sombra fria embaixo, faixa funda na borda de baixo
        p.F(M.top[2]); p.poly([[-22,3.4],[18,1.2],[18,14],[-22,14]]);
        p.F(M.top[3]); p.poly(bodyPts(1,0.6,9.6));
        p.F(M.top[2]); p.poly(bodyPts(0.92,-0.2,7.8));
        p.F(M.top[1]); p.poly(bodyPts(0.84,-0.6,1.8));
        p.F(M.top[0]); p.poly([[-16,-8.4],[-8,-11.6],[-2,-7.8],[-10,-5.6]]);
        p.F(M.top[0]); p.poly([[3,-8.6],[10,-8],[11.6,-6.4],[5,-6.2]]);
        // veios do pinho
        p.F(M.top[2]); for(let k=-3;k<=2;k++) p.rect(-18,k*2.6+0.4,36,0.45);
        // craquelê do verniz
        p.F(M.wood[2]); [[[-14,-4],[-10,-2],[-6,-3.4],[-6,-2.8],[-10,-1.4],[-14,-3.4]],[[-4,5],[1,7],[1.4,7.6],[-4,5.8]],[[6,-5],[9,-2],[8.6,-1.6],[5.6,-4.6]]].forEach(f=>p.poly(f));
        // lasca arrancada no bojo de baixo (madeira crua)
        p.F(M.wood[3]); p.poly([[-19,4],[-15.6,6],[-16.4,9.6],[-19.6,8.4]]); p.F(M.bone[2]); p.poly([[-18.6,4.8],[-16.4,6.2],[-17,8.4],[-18.8,7.6]]);
        if(form==='enluarado'){ p.F(M.glow[1]); [[[-12,-6],[-7,-1],[-3,-2],[-3.4,-1.2],[-7.4,-0.2],[-12.4,-5.2]],[[2,4],[6,8],[5.4,8.6],[1.4,4.6]]].forEach(f=>p.poly(f)); }
        if(form==='plenilunar'){ p.F(M.glow[1]); [[[-14,-3],[-9,2],[-4,1],[-4,1.8],[-9.4,3],[-14.4,-2]],[[3,3],[8,6],[7.4,6.8],[2.6,3.8]],[[-2,-9],[0,-5],[-0.8,-4.6],[-2.8,-8.6]]].forEach(f=>p.poly(f)); p.F(M.glow[0]); p.rect(-10,1.2,1.4,0.8); }
      });
      // roseta e boca
      p.F(M.wood[3]); p.ell(6.4,0,5.2,5);
      p.F(M.string[2]); p.ell(6.4,0,4.4,4.2);
      p.F(M.top[3]); p.ell(6.4,0,3.8,3.6);
      p.F(M.fret[3]); p.ell(6.4,0.2,3.1,2.9);
      // cavalete e rastilho
      p.F(M.fret[1]); p.poly([[-12.4,-5.6],[-10,-5.6],[-9.6,5.6],[-12,5.6]]);
      p.F(M.fret[0]); p.rect(-12.2,-5.4,0.8,10.6);
      p.F(M.string[0]); p.rect(-10.4,-4.6,0.8,9.2);
    }
    // braço e escala
    const nx0=o.broken?9:12.6;
    p.F(M.fret[2]); p.poly([[nx0,-2.6],[38,-2.1],[38,2.9],[nx0,3.4]]);
    p.F(M.fret[1]); p.poly([[nx0,-2.6],[38,-2.1],[38,1.9],[nx0,2.4]]);
    p.F(M.fret[0]); p.poly([[nx0,-2.4],[38,-2],[38,-1.3],[nx0,-1.6]]);
    p.F(M.string[2]); for(let x=16;x<37;x+=3.2-(x-16)*0.03) p.rect(x,-2.2,0.5,4.2);
    // cabeça vazada com tarraxas
    p.F(M.fret[2]); p.poly([[37.6,-2.6],[46.6,-3.2],[47.2,3.2],[37.6,2.8]]);
    p.F(M.fret[1]); p.poly([[37.6,-2.6],[46.6,-3.2],[46.8,1.4],[37.6,1.6]]);
    p.F(M.fret[3]); p.rect(39.4,-1.2,6,1.2);
    p.F(M.string[1]); [40,42.4,44.8].forEach(x=>{ p.rect(x,-4.6,1.4,1.6); p.rect(x,3,1.4,1.6); });
    p.F(M.string[0]); p.rect(37.6,-2.2,0.8,4.4); // pestana
    // cordas (uma virou nervo e sangra)
    if(!o.broken){
      if(o.snap){ const s=o.snap; p.F(M.string[1]);
        for(let k=0;k<3;k++){ const yy=-1.4+k*1.4; for(let j=0;j<6;j++){ const a=j/6*PI*(1+s*0.4); p.cap(P2(-11+j*1.8,yy-S(a)*s*2.2),P2(-9.2+j*1.8,yy-S(a+0.5)*s*2.2),0.5,0.5); } p.cap(P2(28,yy),P2(37.6,yy),0.5,0.5); }
      } else {
        p.F(M.string[0]); [-1.6,0,1.6].forEach((yy,k)=>{ if(k===1) return; p.cap(P2(-10.6,yy*1.6),P2(37.8,yy),0.5,0.5); });
        p.F(M.blood[1]); p.cap(P2(-10.6,0),P2(37.8,0),0.7,0.6);
        p.F(M.blood[0]); p.cap(P2(-2,0),P2(10,0),0.4,0.4);
        p.F(M.blood[1]); p.ell(-9.8,1.6,0.9,1.4); p.poly([[-9.4,1.6],[-8.4,1.6],[-8.6,5.4],[-9.2,5.6]]);
      }
    } else {
      // ponta lascada e cordas soltas penduradas
      p.F(M.wood[2]); p.poly([[nx0,-2.6],[nx0-3,-3.6],[nx0-1.4,-1],[nx0-4.6,0.4],[nx0-1.6,1.8],[nx0-2.8,3.8],[nx0,3.4]]);
      p.F(M.bone[1]); p.poly([[nx0-1,-1.6],[nx0-3.4,-0.4],[nx0-1,1]]);
      p.F(M.string[1]); for(let k=0;k<3;k++){ let q=P2(nx0+2,-1+k); for(let j=1;j<5;j++){ const q2=P2(nx0+2-j*2.6,-1+k+j*j*0.6+S(j+k)*1.2); p.cap(q,q2,0.5,0.5); q=q2; } }
    }
  }
  function guitarAt(c,p,M,form,sk,o){ p.xf(sk.gang,sk.go.x,sk.go.y); c.scale(GS,GS); drawGuitar(c,p,M,form,o); p.id(); }

  // estilhaços do violão (quadros depois do smash): tampo, aro, cordas enroladas
  function drawShards(c,u,M,P){
    const p=mkPen(c,u); p.id(); const s=P.shard, ox=AX+34, oy=GROUND-6;
    const pcs=[[-16,-30,0.5,5,M.top],[10,-36,-0.7,4,M.top],[22,-14,1.2,4.4,M.wood],[-8,-12,2,3.2,M.top],[26,-28,-1.6,3,M.wood],[4,-44,0.9,3,M.top],[-22,-10,2.6,3.6,M.wood]];
    pcs.forEach(([vx,vy,rr,sz,R],k)=>{ const t=s*0.34, x=ox+vx*t*1.4, y=Math.min(GROUND-2,oy+vy*t*1.6+9*t*t*4), a=rr*s;
      if(s>=4&&k%2) return;
      p.xf(a,x,y); p.F(R[1]); p.poly([[-sz,-sz*0.5],[sz*0.6,-sz*0.7],[sz,sz*0.3],[-sz*0.2,sz*0.6]]); p.F(R[2]); p.poly([[-sz*0.2,sz*0.1],[sz,sz*0.3],[-sz*0.2,sz*0.6]]); p.F(R[0]); p.rect(-sz*0.6,-sz*0.5,sz*0.7,0.6); p.id(); });
    p.F(M.string[1]); for(let k=0;k<2;k++){ let q={x:ox-2+k*6,y:oy-4}; for(let j=1;j<6;j++){ const q2={x:q.x+C(j*1.4+k)*3*s*0.5,y:q.y-S(j*1.4+k)*2.6-j*0.3*s}; p.cap(q,q2,0.5,0.5); q=q2; } }
    if(s<=2){ p.F(M.swish[0]); for(let k=0;k<6;k++){ const a=-PI*0.1-k*PI/7, r0=6+s*4, r1=r0+6; p.cap({x:ox+C(a)*r0,y:oy+S(a)*r0*0.7},{x:ox+C(a)*r1,y:oy+S(a)*r1*0.7},1.4,0.6); } }
  }

  /* ---------- notas de luz, ondas do canto, rajada do acorde ---------- */
  function noteGlyph(p,M,x,y,k,big){ const s=big?1.25:1;
    p.F(M.note[2]); p.ell(x+0.4,y+0.5,2.1*s,1.5*s,-0.4);
    p.F(M.note[1]); p.ell(x,y,2*s,1.4*s,-0.4); p.F(M.note[0]); p.rect(x-1,y-0.8,1,0.6);
    p.F(M.note[1]); p.rect(x+1.4*s,y-7*s,0.9*s,7*s);
    if(k%2){ p.poly([[x+1.4*s,y-7*s],[x+4.6*s,y-4.4*s],[x+4*s,y-3.4*s],[x+2.2*s,y-5*s]]); }
    else { p.ell(x-4*s,y+1.2*s,2*s,1.4*s,-0.4); p.rect(x-2.6*s,y-6*s,0.9*s,7*s); p.poly([[x-2.6*s,y-7*s],[x+2.2*s,y-7.6*s],[x+2.2*s,y-6.2*s],[x-2.6*s,y-5.6*s]]); }
  }
  function drawFx(c,u,M,sk,P){
    const p=mkPen(c,u); p.id();
    const mo=sk.H(13,-2.6), ha=sk.ha;
    if(P.notes>=0){ const ph=P.notes, hd=sk.H(-2,-24);
      [[0,0],[1,10],[2,-9]].forEach(([k,dx])=>{ const t=((ph+k*1.4)%4)/4; const x=hd.x+dx+S(t*PI*2+k)*2, y=hd.y-2-t*16; if(P.wave||k<2) noteGlyph(p,M,x,y,k+ph,P.wave>0); });
      p.F(M.note[1]); [[-6,4],[14,-4],[-12,-10]].forEach(([dx,dy],k)=>{ const t=((ph+k)%4)/4; p.rect(hd.x+dx,hd.y+dy-t*10,1.2,1.2); }); }
    if(P.wave>0){ // ondas do canto saindo da boca, abrindo em leque pra frente e pra cima
      for(let k=0;k<3;k++){ const r=6+((P.wave-1)%2)*3.4+k*7, a0=ha-1.7, a1=ha+0.3, n=9; p.F(k===0?M.swish[0]:M.swish[1]);
        for(let j=0;j<n;j++){ const a=a0+(a1-a0)*j/n, b=a0+(a1-a0)*(j+1)/n; if(j%3===2&&k>0) continue;
          p.cap({x:mo.x+C(a)*r,y:mo.y+S(a)*r},{x:mo.x+C(b)*r,y:mo.y+S(b)*r},1.8-k*0.35,1.8-k*0.35); } }
    }
    if(P.chord>0){ // rajada do acorde: arcos saindo da boca do violão pra frente
      const o=sk.G(6.4,0); for(let k=0;k<3;k++){ const r=8+P.chord*5+k*5.4; p.F(k===1?M.note[1]:M.swish[0]);
        for(let j=0;j<7;j++){ const a=-0.7+1.4*j/7, b=-0.7+1.4*(j+1)/7; p.cap({x:o.x+C(a)*r,y:o.y+S(a)*r*0.9},{x:o.x+C(b)*r,y:o.y+S(b)*r*0.9},2-k*0.4,2-k*0.4); } }
      if(P.chord===1){ p.F(M.note[0]); p.circle(o,3); }
      noteGlyph(p,M,o.x+16+P.chord*6,o.y-10-P.chord*2,P.chord,true);
    }
  }
  function drawSmear(c,u,M,sk,P){
    const p=mkPen(c,u); p.id();
    if(P.gm===1){ // arco do violão descendo
      const sh=sk.shF, w=sk.G(-6,0), r=Math.hypot(w.x-sh.x,w.y-sh.y)+4, a1=Math.atan2(w.y-sh.y,w.x-sh.x);
      const n=10, pts=[]; for(let i=0;i<=n;i++){ const a=a1-1.6+1.6*i/n; pts.push([sh.x+Math.cos(a)*r,sh.y+Math.sin(a)*r]); }
      for(let i=n;i>=0;i--){ const a=a1-1.6+1.6*i/n, rr=r-4-12*(i/n); pts.push([sh.x+Math.cos(a)*rr,sh.y+Math.sin(a)*rr]); }
      p.F(M.swish[0]); p.poly(pts.map(([x,y])=>[Math.max(1,Math.min(FW-2,x)),Math.max(1,Math.min(GROUND,y))]));
      p.F(M.swish[2]); const q=pts.slice(n-3,n+1); for(let k=0;k<q.length-1;k++) p.cap({x:q[k][0],y:q[k][1]},{x:q[k+1][0],y:q[k+1][1]},1,1);
    } else if(P.gm===3){ const a=sk.elF, b=sk.wrF; const d={x:b.x-a.x,y:b.y-a.y};
      p.F(M.swish[1]); p.cap({x:b.x-d.x*1.6,y:b.y-d.y*1.6-2},{x:b.x,y:b.y-1},1.4,5); p.cap({x:b.x-d.x*1.4,y:b.y-d.y*1.4+3},{x:b.x,y:b.y+2},1,3);
    } else { const w=sk.wrF, a=sk.gang+PI/2; p.F(M.swish[1]); p.cap({x:w.x-C(a)*14,y:w.y-S(a)*14},{x:w.x,y:w.y},1.2,4.2); }
  }

  /* ---------- mãos ---------- */
  function drawFist(p,M,el,wr){
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y); p._c.scale(1.3,1.3);
    p.F(M.skin[1]); p.poly([[-1,-3.4],[4.4,-3.8],[6,-1],[5.6,3.4],[-1,3.6]]);
    p.F(M.skin[2]); p.poly([[-1,1.4],[5.8,1.2],[5.6,3.4],[-1,3.6]]);
    p.F(M.skin[0]); p.rect(0.4,-3.2,3.6,0.9);
    for(let k=0;k<4;k++){ const y0=-2.8+k*1.9; p.F(M.skin[1]); p.ell(6,y0,1.7,1.05); p.F(M.skin[2]); p.rect(5.4,y0+0.4,1.6,0.5); p.F(M.nail[1]); p.rect(6.6,y0-0.4,0.8,0.7); }
    p.F(M.skin[1]); p.cap(P2(1.6,-3.2),P2(5,-4.6),1.8,1.4); p.F(M.skin[3]); p.rect(2,0.6,3,0.6);
    p.id();
  }
  // mão do dedilhado: dedos compridos caídos sobre as cordas, unhas compridas de violonista
  function drawPluck(p,M,el,wr){
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y); p._c.scale(1.28,1.28);
    p.F(M.skin[1]); p.poly([[-1.2,-3.2],[4,-3.4],[5,2.8],[-1.2,3.2]]);
    p.F(M.skin[2]); p.poly([[-1.2,1],[4.8,1],[5,2.8],[-1.2,3.2]]);
    [[-2.2,6.4,2.4],[-0.6,7.6,3.2],[1,7.2,3],[2.6,6,2.2]].forEach(([y,L,cv])=>{ p.F(M.skin[1]); p.cap(P2(4,y),P2(L,y+cv),1.6,1.2); p.F(M.skin[2]); p.cap(P2(L-0.4,y+cv),P2(L-1.4,y+cv+1.6),1.1,0.9); p.F(M.nail[0]); p.rect(L-1.8,y+cv+1.2,1,0.9); });
    p.F(M.skin[1]); p.cap(P2(2,-3),P2(6.4,-4.4),1.8,1.3); p.F(M.skin[0]); p.rect(0.2,-2.8,3.4,0.8);
    p.id();
  }
  // palma da mão da escala (atrás do braço do violão); os dedos vêm depois, por cima da escala
  function drawPalm(p,M,el,wr){
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y); p._c.scale(1.28,1.28);
    p.F(M.skin[2]); p.poly([[-1,-3],[4.6,-3.4],[5.6,2.6],[-1,3.2]]);
    p.F(M.skin[3]); p.poly([[-1,1],[5.4,1],[5.6,2.6],[-1,3.2]]);
    p.F(M.skin[1]); p.cap(P2(3,2.4),P2(6.6,3.4),1.8,1.4); // polegar atrás do braço
    p.id();
  }
  function drawFretFingers(c,p,M,sk,P){
    const pts=[P.fr-2.6,P.fr-0.6,P.fr+1.4,P.fr+3.2];
    pts.forEach((x,k)=>{ const a=sk.G(x,3.2), b=sk.G(x+0.6,-1.2-(k%2)*0.6), t=sk.G(x+1,-2.8);
      p.F(M.skin[2]); p.cap(a,b,2.2,1.9); p.F(M.skin[1]); p.cap(lerp(a,b,0.2),b,1.6,1.4); p.F(M.skin[1]); p.cap(b,t,1.5,1.2); p.F(M.nail[1]); p.circle(t,0.6); });
    p.F(M.skin[0]); { const a=sk.G(P.fr-1.6,2.4), b=sk.G(P.fr+2,2.6); p.cap(a,b,0.6,0.6); }
  }

  /* ---------- braços: manga do paletó curto, punho branco ---------- */
  function drawArm(c,u,M,sk,P,front,form){
    const p=mkPen(c,u), sh=front?sk.shF:sk.shB, el=front?sk.elF:sk.elB, wr=front?sk.wrF:sk.wrB; p._c=c; p.id();
    const sn=sideN(sh,el);
    if(front){
      // manga rasgada no antebraço: pele podre com veias aparecendo pelo rasgo
      limb(p,M.coat,sh,el,12.4,11.2,{hl:0.6});
      const e2=lerp(el,wr,0.5);
      const n=limb(p,M.skin,e2,wr,8.8,8,{});
      p.F(M.vein[1]); p.cap(off(lerp(e2,wr,0.2),n,-1),off(lerp(e2,wr,0.9),n,-1.4),0.7,0.5);
      limb(p,M.coat,el,e2,11.2,10.4,{hl:0.6});
      const en=sideN(el,wr), ed={x:(wr.x-el.x)/en.L,y:(wr.y-el.y)/en.L};
      p.F(M.coat[3]); for(let k=-2;k<=2;k++){ const b={x:e2.x+en.nx*k*2.1,y:e2.y+en.ny*k*2.1}, L=k%2?2.6:1.2; p.poly([[b.x-en.nx,b.y-en.ny],[b.x+en.nx,b.y+en.ny],[b.x+ed.x*L,b.y+ed.y*L]]); }
      p.F(M.rot[1]); const r1=lerp(e2,wr,0.55); p.ell(r1.x+n.nx*1.4,r1.y+n.ny*1.4,1.5,1);
      p.F(M.blood[1]); p.ell(e2.x+ed.x*1.6,e2.y+ed.y*1.6,1.2,0.9);
    } else {
      limb(p,M.coat,sh,el,12,10.8,{hl:0.6});
      const n=limb(p,M.coat,el,wr,10.6,9.4,{hl:0.6});
      const cf=lerp(el,wr,0.98), cf0=lerp(el,wr,0.86);
      p.F(M.shirt[2]); p.cap(cf0,cf,8.2,8); p.F(M.shirt[1]); p.cap(off(cf0,n,-1),off(cf,n,-1),4,4);
      p.F(M.coat[3]); p.cap(off(lerp(el,wr,0.82),n,-4.8),off(lerp(el,wr,0.82),n,4.8),1.2,1.2);
    }
    p.F(M.coat[2]); const c1=lerp(sh,el,0.86); p.cap(off(c1,sn,-4),off(c1,sn,1),0.8,0.7);
    const c2=lerp(sh,el,0.6); p.cap(off(c2,sn,2),off(c2,sn,5),0.8,0.7);
    p.F(M.coat[0]); const c3=lerp(sh,el,0.3); p.cap(off(c3,sn,-4.2),off(c3,sn,-1.4),0.7,0.6);
    if(P.gm===0){ if(front) drawPluck(p,M,el,wr); else drawPalm(p,M,el,wr); }
    else if(P.gm===1){ drawFist(p,M,el,wr); }
    else drawFist(p,M,el,wr);
  }

  /* ---------- pernas: calça de pregas marrom, sapato de bico fino ---------- */
  function drawLeg(c,u,M,sk,P,front){
    const p=mkPen(c,u), hip=front?sk.hipF:sk.hipB, knee=front?sk.kneeF:sk.kneeB, ank=front?sk.ankleF:sk.ankleB; p.id();
    p.F(M.hair[2]); p.cap(lerp(knee,ank,0.86),ank,6.6,6.2); // meia
    const nS=limb(p,M.pants,knee,lerp(knee,ank,0.93),11.4,11.8,{hl:0.5});
    const nT=limb(p,M.pants,hip,knee,14.4,12,{hl:0.55});
    p.F(M.pants[1]); p.circle(knee,5.8);
    p.F(M.pants[0]); p.cap(off(lerp(hip,knee,0.1),nT,-3.4),off(knee,nT,-3),0.7,0.7); // prega
    p.cap(off(knee,nS,-2.8),off(lerp(knee,ank,0.84),nS,-3),0.7,0.7);
    p.F(M.pants[2]); p.cap(off(lerp(hip,knee,0.08),nT,1),off(lerp(hip,knee,0.4),nT,2.4),0.8,0.6); // pregas da cintura
    const cb=lerp(knee,ank,0.9); p.F(M.pants[3]); p.cap(off(cb,nS,-6),off(cb,nS,6),1.2,1.2); // barra
    p.F(M.pants[2]); const f1=lerp(hip,knee,0.55), f2=lerp(knee,ank,0.45);
    p.cap(off(f1,nT,1.4),off(lerp(hip,knee,0.7),nT,4.6),0.8,0.7); p.cap(off(f2,nS,1),off(lerp(knee,ank,0.62),nS,4),0.8,0.7);
    if(front){ p.F(M.dirt[1]); const d0=lerp(knee,ank,0.72); p.ell(d0.x+nS.nx*2.4,d0.y+nS.ny*2.4,2.4,1.5);
      p.F(M.blood[2]); const b0=lerp(hip,knee,0.44); p.ell(b0.x+nT.nx*2.6,b0.y+nT.ny*2.6,1.4,2.2); }
    // sapato de couro marrom de bico fino, sola fina
    const fa=rad((front?P.fF:P.fB)+sk.R); p.xf(fa,ank.x,ank.y); c.scale(1.3,1.3);
    p.F(M.shoe[1]); p.poly([[-3.4,-1.8],[2.4,-2],[6.4,0.2],[10.6,1.6],[12.4,3.2],[-3.8,3.4]]);
    p.F(M.shoe[2]); p.poly([[-3.8,1.8],[11.6,2.4],[12.4,3.2],[-3.8,3.4]]);
    p.F(M.shoe[0]); p.poly([[0,-1.6],[2.4,-1.8],[6.4,0.4],[9.6,1.4],[6,1],[2.2,-0.4],[0,-0.6]]);
    p.F(M.shoe[3]); p.poly([[-4.2,3.4],[12.8,3.2],[12.4,4.4],[-4,4.4]]);
    p.F(M.shoe[2]); [[3,-1],[4.4,-0.4]].forEach(([x,y])=>p.rect(x,y,0.8,0.7));
    p.F(M.dirt[1]); p.ell(4,2.6,1.6,0.8);
    p.id();
  }

  /* ---------- tronco: paletó curto creme, camisa branca aberta ---------- */
  const JACKET=[[-9.2,3.6],[-9.4,-4],[-9.8,-12],[-10.4,-20],[-11,-28],[-10.6,-33.4],[-7.6,-37.4],[-1.6,-39.2],[4.6,-38.8],[9,-36.4],[11.6,-31],[12.4,-24],[12,-16],[11.4,-8],[11.4,-1],[11.6,3.4],[7,2.4],[2,4],[-3,2.6]];
  const OPEN=[[4.6,-38.8],[9,-36.4],[11.6,-31],[12.4,-24],[12.2,-18],[9.6,-17],[8.4,-24],[7.4,-30],[6,-35]];
  function drawTorso(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    const shape=W(sk,JACKET);
    p.F(M.coat[1]); p.poly(shape);
    clip(c,shape,()=>{
      p.F(M.coat[0]); p.poly(W(sk,[[2,-34],[6,-40],[12,-33],[13,-24],[12,-18],[9,-20],[6,-28]]));
      p.F(M.coat[0]); p.poly(W(sk,[[-4,-38],[2,-40],[3,-36],[-3,-35]]));
      p.F(M.coat[2]); p.poly(W(sk,[[-14,8],[-14,-40],[-6.6,-40],[-7.6,-30],[-6.8,-18],[-5.4,-8],[-3,-2],[14,-2],[14,8]]));
      p.F(M.coat[3]); p.poly(W(sk,[[-14,8],[-14,-40],[-9.6,-40],[-10,-30],[-9.2,-18],[-8.4,-6],[-7.6,8]]));
      p.F(M.coat[3]); p.poly(W(sk,[[-14,1.4],[15,1.4],[15,8],[-14,8]]));
      p.F(M.coat[2]); [[[-2,-14],[3,-17],[3.6,-16.2],[-1.4,-13.2]],[[0,-26],[5.4,-28],[5.8,-27.2],[0.4,-25.2]],[[-4,-31],[-1,-33],[-0.6,-32.2],[-3.6,-30.4]]].forEach(f=>p.poly(W(sk,f)));
      p.F(M.coat[0]); [[[-1,-21],[4,-23],[4.4,-22.2],[-0.6,-20.2]]].forEach(f=>p.poly(W(sk,f)));
      // botão único e bolso
      p.F(M.coat[3]); p.poly(W(sk,[[2,-6],[9,-6.4],[9.2,-4.8],[2.2,-4.4]]));
      p.F(M.dirt[1]); [[-1,0,3,1.6],[-6.4,-10,1.4,2.2]].forEach(([uu,vv,a,b])=>{ const q=Wp(sk,uu,vv); p.ell(q.x,q.y,a,b); });
      p.F(M.blood[1]); [[8,-12,1.6,1.2],[9.6,-9,1,0.8]].forEach(([uu,vv,a,b])=>{ const q=Wp(sk,uu,vv); p.ell(q.x,q.y,a,b); });
      if(form==='plenilunar'){ p.F(M.blood[1]); p.poly(W(sk,[[1,-24],[12,-26],[13,2],[4,3],[0,-8]])); p.F(M.blood[2]); p.poly(W(sk,[[4,-14],[12,-16],[13,2],[6,2]])); p.F(M.blood[0]); p.poly(W(sk,[[6,-22],[9,-23],[8,-18]])); }
    });
    // camisa branca aberta no peito
    const op=W(sk,OPEN);
    clip(c,op,()=>{ p.F(M.shirt[1]); p.poly(op);
      p.F(M.shirt[2]); p.poly(W(sk,[[4,-40],[7,-40],[9,-30],[10,-17],[4,-17]]));
      p.F(M.shirt[0]); p.poly(W(sk,[[10.4,-32],[12,-28],[12.2,-22],[11.2,-22]]));
      p.F(M.skin[2]); p.poly(W(sk,[[7,-38],[10.4,-37],[9.6,-33],[8,-33]])); // pele do peito no colarinho aberto
      p.F(M.blood[1]); { const q=Wp(sk,11,-25); p.ell(q.x,q.y,1.2,1.8); }
    });
    p.F(M.coat[2]); p.poly(W(sk,[[4.6,-38.8],[6,-35],[7.4,-30],[8.4,-24],[9.6,-17],[8.2,-16.4],[7,-23],[5.6,-30],[3.6,-36]])); // lapela de cá
    p.F(M.coat[0]); p.poly(W(sk,[[6.6,-28],[7.4,-28],[8.6,-19],[8,-19]]));
    p.F(M.coat[0]); p.poly(W(sk,[[9,-36.4],[11.6,-31],[12,-28],[10,-31.6],[8,-34.6]]));
    // lenço vinho no bolso do peito
    p.F(M.coat[3]); p.poly(W(sk,[[5.6,-25.6],[9.6,-25],[9.4,-24.2],[5.4,-24.8]]));
    p.F(M.tie[1]); p.poly(W(sk,[[6,-25.4],[6.6,-28],[7.6,-26.2],[8.6,-28.4],[9.2,-25.2]])); p.F(M.tie[0]); p.poly(W(sk,[[6.6,-27.6],[7.4,-26.4],[6.6,-26]]));
    // rasgo nas costas com costelas
    p.F(M.coat[3]); p.poly(W(sk,[[-10.4,-26],[-6.6,-28],[-4.2,-24],[-4.8,-18.6],[-7.6,-16.6],[-10,-20]]));
    p.F(M.flesh[3]); p.poly(W(sk,[[-9.8,-25.2],[-6.8,-27],[-5,-23.6],[-5.4,-19.4],[-7.6,-17.8],[-9.6,-20.4]]));
    p.F(M.flesh[2]); p.poly(W(sk,[[-9.2,-24.4],[-7,-25.8],[-5.6,-23],[-6,-20.2],[-7.6,-19],[-9,-21]]));
    p.F(form==='plenilunar'?M.bone[0]:M.bone[1]); [[-23.4],[-20.8]].forEach(([v])=>p.poly(W(sk,[[-9.2,v],[-5.6,v-0.8],[-5.6,v],[-9.2,v+0.8]])));
    p.F(M.blood[1]); p.poly(W(sk,[[-7.4,-17.4],[-6.4,-17.6],[-6.6,-12.4],[-7.2,-12.2]]));
    if(form!=='comum'){ p.F(M.glow[1]); [[[-9.6,-25],[-11.6,-30],[-10.8,-30.4],[-9,-25.6]],[[-5,-18],[-1.6,-13],[-2.2,-12.4],[-5.4,-17.4]]].forEach(f=>p.poly(W(sk,f))); }
  }
  // gravata borboleta vinho, solta e torta (por cima do pescoço)
  function drawTie(c,u,M,sk,P){
    const p=mkPen(c,u); p.id();
    const k=Wp(sk,7.6,-37.6), a=sk.sa+rad(8), ca=Math.cos(a), sa=Math.sin(a);
    const L=(x,y)=>[k.x+x*ca-y*sa, k.y+x*sa+y*ca];
    p.F(M.tie[2]); p.poly([L(0,0),L(-5.4,-3.2),L(-6,2.4)]); p.poly([L(0,0),L(4.6,-1.6),L(5.6,4.4)]);
    p.F(M.tie[1]); p.poly([L(0,-0.4),L(-5,-3),L(-5.2,1)]); p.poly([L(0,-0.4),L(4.4,-1.4),L(4.8,2.6)]);
    p.F(M.tie[0]); p.poly([L(-1,-1),L(-4.2,-2.6),L(-3.8,-1.6)]); p.poly([L(1,-0.8),L(3.6,-1.2),L(3.4,-0.4)]);
    p.F(M.tie[2]); p.ell(k.x,k.y,1.7,1.5); p.F(M.tie[0]); p.rect(k.x-0.8,k.y-1,0.9,0.7);
    p.F(M.tie[3]); p.poly([L(5.6,4.4),L(6,7.6),L(5,7.8),L(4.6,4.4)]); // ponta solta pendurada
  }

  /* ---------- cabeça: rosto redondo, nariz bulboso, sobrancelha caída, boina de feltro ---------- */
  function drawHead(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.xf(sk.ha,sk.neck.x,sk.neck.y); c.scale(HS,HS);
    // pescoço
    p.F(M.skin[1]); p.poly([[-4,4],[4.6,4],[5.2,-4],[-3.6,-6]]);
    p.F(M.skin[2]); p.poly([[-4,4],[-0.6,4],[-1.2,-5.4],[-3.6,-6]]);
    p.F(M.vein[1]); p.rect(2.2,-3,0.8,5);
    // crânio redondo
    p.F(M.skin[1]); p.ell(2.4,-12,9.6,9.4);
    p.poly([[-3.6,-6],[11.4,-7.4],[12.4,-4],[6,-2.4],[-2,-3]]);
    p.F(M.skin[2]); p.poly([[-7.6,-15],[-5.4,-6],[0,-2.4],[6,-2.4],[2,-5],[-2,-9],[-3,-14],[-5.4,-18]]);
    p.F(M.skin[3]); p.poly([[-7.4,-14],[-6.6,-9],[-4.6,-5],[-5,-11]]);
    p.F(M.skin[0]); p.poly([[4.6,-17.6],[9,-16],[10.4,-13.6],[6,-15]]); // testa
    p.F(M.skin[0]); p.poly([[5,-7.6],[9.6,-8.2],[8.8,-7],[5.4,-6.8]]);
    // bochecha funda com podridão
    p.F(M.skin[2]); p.poly([[3.4,-8.4],[7,-7],[6.6,-4.4],[3.6,-5.2]]);
    p.F(M.rot[1]); p.ell(4.4,-6.4,1.5,1.1); p.F(M.rot[2]); p.rect(3.8,-6.6,0.9,0.8);
    // orelha
    p.F(M.skin[1]); p.ell(-2.8,-10.8,2.2,3.1); p.F(M.skin[3]); p.ell(-2.6,-10.6,1,1.8); p.F(M.flesh[2]); p.rect(-3.8,-8.4,1.1,1.2);
    // cabelo crespo saindo da boina atrás e costeleta
    p.F(M.hair[1]); p.poly([[-8.6,-17],[-4,-19],[-2.4,-15],[-4.4,-11],[-7.4,-8.6],[-9.4,-12]]);
    p.F(M.hair[1]); [[-9,-9.4],[-8,-7.6],[-6.4,-8.6]].forEach(([x,y])=>p.circle(P2(x,y),1.5));
    p.F(M.hair[0]); [[-7.6,-15],[-8.4,-12],[-6,-13]].forEach(([x,y])=>p.rect(x,y,1.2,0.7));
    p.F(M.hair[1]); p.poly([[-1.4,-15.4],[0.8,-15.6],[0.8,-8.4],[-0.6,-9]]);
    // sobrancelha grossa e caída (romântico triste)
    p.F(M.hair[1]); p.poly([[4.4,-13.8],[8,-13.4],[12,-11.6],[11.6,-10.6],[8,-12.2],[4.6,-12.6]]);
    // olho de lua semicerrado
    const lid=Math.max(0,Math.min(1,P.lid));
    p.F(M.skin[3]); p.ell(8.4,-9.2,3.4,2.7);
    p.F(M.glow[2]); p.ell(8.9,-8.9,2.7,1.9);
    p.F(form==='comum'?M.glow[1]:M.eye[1]); p.ell(8.8,-9.2,2.4,1.6);
    p.F(M.eye[0]); p.rect(8.2,-9.8,1.4,1);
    p.F(M.skin[2]); p.poly([[5.6,-11.6],[11.4,-11.6],[11.4,-11.6+lid*3.4],[5.6,-11.4+lid*2.6]]); // pálpebra pesada
    p.F(M.skin[3]); p.poly([[5.6,-11.4+lid*2.6],[11.4,-11.6+lid*3.4],[11.4,-11+lid*3.4],[5.6,-10.8+lid*2.6]]);
    p.F(M.skin[3]); p.ell(12.2,-9.4,0.9,1.2); p.F(form==='comum'?M.glow[1]:M.eye[1]); p.rect(11.9,-9.6+lid*0.8,0.8,0.8);
    // nariz redondo de batata
    p.F(M.skin[1]); p.poly([[10.8,-10.4],[13.4,-7.6],[14.6,-5.6],[13,-4.4],[11,-5.2]]);
    p.F(M.skin[1]); p.circle(P2(13.4,-5.6),2);
    p.F(M.skin[0]); p.rect(12.6,-7.6,1.2,1.2);
    p.F(M.skin[3]); p.rect(11.8,-4.6,1.6,0.9);
    // boca de cima (sorriso torto quando smile)
    p.F(M.mouth[1]); p.poly([[5.4,-4.2],[12.8,-4],[12.6,-2],[5.4,-2.2]]);
    p.F(M.teeth[1]); [[6.8,-4.2,1.3,1.6],[8.6,-4.2,1.3,1.4],[10.4,-4.2,1.1,1.7]].forEach(([x,y,w,h])=>p.rect(x,y,w,h));
    if(P.smile>=0.5){ p.F(M.skin[2]); p.poly([[11.6,-4.4],[13.4,-5.6],[13.6,-4.2],[12.4,-3.2]]); }
    if(form!=='comum'){ p.F(M.glow[0]); p.rect(8.2,-9.6,1.4,0.9); }
    // boina de feltro (achatada, caindo pra trás, com cabinho)
    p.xf(sk.ha+rad(-8+P.bt),...(()=>{ const q=sk.H(1.4,-19.6); return [q.x,q.y]; })()); c.scale(HS,HS);
    p.F(M.beret[3]); p.ell(-0.4,1.6,11.6,3.2);
    p.F(M.beret[1]); p.ell(-1,-0.8,12.2,4.6);
    p.F(M.beret[2]); p.poly([[-13.2,-0.4],[-2,1.6],[10.6,1],[10.6,3],[-12.6,2.6]]);
    p.F(M.beret[0]); p.poly([[-2,-4.6],[6,-4.2],[9.6,-2],[3,-3]]);
    p.F(M.beret[2]); p.poly([[-12.4,-2],[-7,-4.4],[-5,-4.6],[-10,-1.4]]);
    p.F(M.beret[3]); p.rect(-11,2.4,22,1); // carneira (faixa de baixo)
    p.F(M.beret[1]); p.cap(P2(-0.6,-4.8),P2(-1.4,-7.4),1.2,0.9); // cabinho
    p.F(M.dirt[1]); p.ell(4,-2.4,1.6,0.8);
    if(form==='plenilunar'){ p.F(M.blood[1]); p.ell(-6,-1,2.2,1.2); }
    if(form==='enluarado'){ p.F(M.glow[1]); p.rect(-4,-4,3,0.6); }
    p.id();
  }
  function drawJaw(c,u,M,sk,P){
    const p=mkPen(c,u); const h=sk.H(2.6,-3.4); p.xf(sk.ha+rad(P.jaw),h.x,h.y); c.scale(HS,HS);
    p.F(M.skin[1]); p.poly([[-2,-1.4],[10.8,-0.8],[11.8,1.8],[10.6,5.4],[6.4,7],[0.6,6],[-2.4,2.8]]);
    p.F(M.skin[2]); p.poly([[-2.4,2.8],[0.6,6],[6.4,7],[10.6,5.4],[9,4.6],[4,5],[0,3.4]]);
    p.F(M.skin[3]); p.poly([[1,6],[6.4,7],[9.4,6.2],[4,6.2]]);
    p.F(M.mouth[1]); p.poly([[2.6,-0.8],[10.2,-0.4],[10,1.6],[3,1.4]]);
    p.F(M.teeth[1]); [[4.4,-1,1.2,1.5],[6.2,-1,1.2,1.8],[8,-1,1.1,1.4]].forEach(([x,y,w,h])=>p.rect(x,y,w,h));
    p.F(M.skin[0]); p.rect(5.6,2,3.4,0.8);
    p.F(M.hair[2]); [[3,3.2],[5,4],[7.2,4.2],[9,3.4]].forEach(([x,y])=>p.rect(x,y,0.7,0.6)); // barba por fazer
    const L=2+(P.drool%4)*1.2+(P.jaw>30?2:0);
    p.F(M.blood[1]); p.poly([[9.6,4.6],[11,4],[10.8,4+L],[10.2,5+L]]); p.ell(10.5,5+L,1,1);
    p.id();
  }
  function drawMouthIn(c,u,M,sk,P){
    if(P.jaw<14) return; const p=mkPen(c,u); p.id();
    const a=sk.H(5.4,-2.2), b=sk.H(12.6,-2.4), h=sk.H(2.6,-3.4), ja=sk.ha+rad(P.jaw), jc=Math.cos(ja), js=Math.sin(ja);
    const J=(x,y)=>({x:h.x+(x*jc-y*js)*HS,y:h.y+(x*js+y*jc)*HS}), d=J(10.2,0.6), e=J(3,0.6);
    p.F(M.mouth[2]); p.poly([[a.x,a.y],[b.x,b.y],[d.x,d.y],[e.x,e.y]]);
    p.F(M.mouth[3]); const m=lerp(lerp(a,b,0.4),lerp(e,d,0.4),0.5); p.circle(m,P.jaw>30?2.4:1.4);
    p.F(M.flesh[1]); const t=lerp(e,d,0.5); p.circle({x:t.x+(m.x-t.x)*0.3,y:t.y+(m.y-t.y)*0.3},1.3); // língua
  }

  /* ---------- sem violão (forma '~sem'): solta as mãos e apaga violão/notas ---------- */
  // poses feitas com o violão no corpo (gm 0) não trazem ângulo de braço: usa a guarda de punho do idleNo,
  // mexida pelo tranco do corpo (lean/hunch) pra não ficar dura. Morte (gm 2) já traz os braços.
  function semPose(P){
    if(P.gm===0||P.gm===1){
      const armless=P.aFs===REST.aFs&&P.aFe===REST.aFe&&P.aBs===REST.aBs&&P.aBe===REST.aBe;
      if(P.gm===1||armless){ const k=(P.lean-REST.lean)*0.6, j=(P.hunch-REST.hunch)*0.5;
        P.aFs=20+k; P.aFe=70+j; P.aBs=-6+k*0.8; P.aBe=16+j; }
    }
    P.gm=3; P.gb=0; P.shard=0; P.notes=-1; P.wave=0; P.chord=0; P.snap=0;
  }

  /* ---------- montagem ---------- */
  const cache=PIX.cache();
  function frame(form,anim,fi,step=5,Pov,pk){
    const K=PIX.getK(), key=(pk!=null?'#'+pk+'|'+form:form+'|'+anim+'|'+fi+'|'+step)+'@'+K;
    const hit=cache.get(key); if(hit){ cache.delete(key); cache.set(key,hit); return hit; }
    const fm=String(form).split('~'), sem=fm[1]==='sem'; form=fm[0]; // sufixo '~sem': violão quebrado
    const P=Pov?Object.assign({},REST,Pov):poseOf(anim,fi), M=mats(form);
    P.gm=Math.round(P.gm);
    if(sem) semPose(P);
    const sk=skeleton(P);
    const gOn=P.gm!==3;
    const parts=[];
    if(P.gm===2) parts.push({back:true, draw:(c,u)=>{ const p=mkPen(c,u); guitarAt(c,p,M,form,sk,{snap:P.snap}); }});
    parts.push(
      {back:true, draw:(c,u)=>drawArm(c,u,M,sk,P,false,form)},
      {back:true, draw:(c,u)=>drawLeg(c,u,M,sk,P,false)},
      {draw:(c,u)=>drawLeg(c,u,M,sk,P,true)},
      {draw:(c,u)=>drawTorso(c,u,M,sk,P,form)},
      {draw:(c,u)=>{ drawHead(c,u,M,sk,P,form); drawMouthIn(c,u,M,sk,P); }},
      {draw:(c,u)=>drawJaw(c,u,M,sk,P)},
      {draw:(c,u)=>drawTie(c,u,M,sk,P)});
    if(P.smear>=0.5) parts.push({noShade:true, smear:true, noRim:true, draw:(c,u)=>drawSmear(c,u,M,sk,P)});
    if(gOn&&P.gm!==2) parts.push({draw:(c,u)=>{ const p=mkPen(c,u); guitarAt(c,p,M,form,sk,{broken:P.gb>=0.5}); if(P.gm===0){ p.id(); drawFretFingers(c,p,M,sk,P); } }});
    parts.push({draw:(c,u)=>drawArm(c,u,M,sk,P,true,form)});
    if(P.shard>=0.5) parts.push({draw:(c,u)=>drawShards(c,u,M,P)});
    if(P.notes>=0||P.wave>0||P.chord>0) parts.push({noShade:true, noRim:true, draw:(c,u)=>drawFx(c,u,M,sk,P)});
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM[form]}); if(step>=4) heavyOutline(cv);
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._eye=sc(sk.H(8.8,-9.2)); cv._mouth=sc(sk.H(10,-1.6)); cv._hand=sc(sk.wrF); cv._head=sc(sk.H(3,-13)); cv._handB=sc(sk.wrB); cv._guitar=sc(sk.G(6.4,0));
    cache.set(key,cv); if(cache.size>900) cache.delete(cache.keys().next().value);
    return cv;
  }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame,framePose:function(form,anim,P,key){ return frame(form,anim,0,5,P,key); }};
})();
