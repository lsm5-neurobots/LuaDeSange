/* TURISTA — fonte de arte (editável). Build: npm run art
   Zumbi Turista (Pelourinho, raro): viajante genérico de roupa leve, preso no instante da foto. Sem nacionalidade
   marcada nem caricatura. Magro, tronco curvado pra frente, chapéu de aba larga bege (aba caída e rasgada), óculos
   escuros quebrados na testa, camisa florida de manga curta aberta (folhas laranja sobre azul), regata suja por baixo,
   colete de viagem com bolsos, crachá "GRUPO" num cordão, pochete na frente, mochila pequena nas costas, bermuda
   cargo, meias brancas com sandália. Câmera compacta com flash na mão da frente (alça no pescoço); a lente brilha como
   um olho. Fotos "impressas" grudadas no colete como carne; fita de câmera enrolada no pescoço.
   Golpes: flash (ergue a câmera ao rosto 300 ms, clarão; evento flashAt), mochilada (gira o corpo e bate com a
   mochila; hit/reach), foge (corrida em semicurva) e fotografa (agacha pra enquadrar, clique; evento snapAt).
   Morte: cai, a câmera rola no chão e o flash dispara sozinho. Hi-bit: honra PIX.getK(). */
const TURISTA=(function(){
  const {rad,lerp,P2,mkPen,compose}=PIX;
  const FW=196, FH=160, GROUND=150, AX=80;
  const RIM={comum:'#e4ecf6', enluarado:'#9ff6ff', plenilunar:'#ffb46a'};

  /* ---------- materiais ---------- */
  function mats(form){
    const m={
      skin:['#c4d2bc','#8a9a82','#5c6c60','#343e44'],
      vein:['#9ab4c4','#5e7a92','#3e5470','#262e4c'],
      rot:['#b4b088','#7c785a','#52504e','#2e2a36'],
      flesh:['#f4ac92','#c2585c','#7a3848','#481c32'],
      bone:['#fff4d8','#dccfa6','#a09070','#605040'],
      hat:['#f4ecc4','#d8c898','#a09466','#625a44'],
      hband:['#8e7a56','#5e4e36','#3e3226','#241c18'],
      shirt:['#7cd2e6','#2f9ab8','#216a8a','#1a3c5e'],
      print:['#ffb07c','#e8603a','#a8382e','#5e1c22'],
      leaf:['#d8f0a0','#8cc060','#4e8048','#2a4836'],
      tank:['#fbf6ea','#ddd4c0','#a49a88','#625a52'],
      vest:['#c8b884','#8a7a4a','#5e5236','#363022'],
      shorts:['#dccaa0','#a8946a','#76664a','#463c30'],
      sock:['#ffffff','#e8e0d8','#b0a8a6','#6c6670'],
      sandal:['#8a6c54','#5a4232','#3a2a22','#1e1614'],
      pack:['#8e9c62','#5a6a3a','#3c4a2c','#222c1e'],
      strap:['#5c5866','#34303c','#221f28','#141218'],
      cam:['#6e6878','#2a2630','#1c1a22','#100e14'],
      chrome:['#ffffff','#c8ccd8','#8088a0','#444a5e'],
      lens:['#d8f0ff','#4fa3ff','#2a5ec0','#1a2c6a'],
      lanyard:['#ff8a6a','#d83a3a','#8e1e2e','#4e0e1e'],
      badge:['#ffffff','#ece8dc','#b4ae9e','#6e6a62'],
      photo:['#fff6e0','#e8dcc0','#a89c80','#64584a'],
      glass:['#8a94b8','#3a3e5c','#24243c','#141426'],
      tape:['#3e3a46','#24202c','#16141c','#0c0a10'],
      hair:['#7a6e64','#4a4038','#2e2824','#1a1614'],
      eye:['#ffffff','#e6e8d8','#a8aca0','#686c66'],
      mouth:['#7c2e3e','#4c1828','#2e0c1a','#1a0610'],
      teeth:['#fbf0c0','#d8c27c','#9a8650','#5e4e30'],
      dirt:['#caa97a','#95754f','#674d35','#3d2b1f'],
      blood:['#c84a3e','#8e2a2c','#5e1824','#3a0e1a'],
      acid:['#e8ff9a','#a8e04a','#5e9a2a','#2e5a1a'],
      nail:['#8a7a72','#54484a','#342a30','#1c161a'],
      glow:['#fffbe0','#e8ecb0','#a8b07a','#646c4a'],
      burst:['#ffffff','#fff8e0','#fff2cc','#e8dcae'],
      swish:['#fdfdff','#e6f0ff','#b4c4e8','#7484b0'],
    };
    if(form==='enluarado'){
      m.skin=['#dcdcff','#a0a2e4','#686cae','#3c3a76']; m.vein=['#a8f4ff','#4ad8f0','#2a8ab0','#1a4a7a'];
      m.rot=['#b8a6e0','#8470b0','#56468a','#33285e']; m.flesh=['#f0b0ff','#b866d8','#7a3a9e','#46206a']; m.blood=['#b46ad8','#7e3ea6','#542474','#34144a'];
      m.eye=['#ffffff','#b8fbff','#4ad8f0','#1a8aa8']; m.glow=['#effffe','#7af4ff','#2ab0d8','#146a96']; m.swish=['#ffffff','#c8fbff','#6ae4f4','#2a9ab8'];
      m.burst=['#ffffff','#e0fdff','#9ff6ff','#4ad8f0']; m.lens=['#e8ffff','#7af4ff','#2aa8d8','#145a8a'];
      m.shirt=['#e0c8ff','#a87ee0','#6e4ea8','#40306e']; m.print=['#c8f8ff','#7ad8f0','#3a8ab8','#1e4a7a']; m.leaf=['#d8d0ff','#9a90d8','#5e58a0','#363466'];
      m.hat=['#eef0ff','#c0c4e4','#8288b4','#4c5078']; m.vest=['#b8b4e0','#7e78ae','#544e80','#322e52']; m.shorts=['#cac8f0','#9490c4','#625e92','#3a3862'];
      m.tank=['#f0f0ff','#c8c8e8','#8c8cb8','#545478']; m.pack=['#8e9ac8','#5a6494','#3c4268','#222842']; m.dirt=['#a8a0c8','#76709a','#4e4a70','#2e2a48'];
    }
    if(form==='plenilunar'){
      m.skin=['#ffcaa6','#e2806a','#a4424e','#5e1e36']; m.vein=['#fff0a0','#ffb43a','#e0581e','#8a2414'];
      m.rot=['#d0806a','#9a4a4a','#682a3a','#3e1628']; m.flesh=['#ffc07a','#f06a3a','#a8302e','#5e1422']; m.blood=['#ff7a3a','#d43a26','#8a1c22','#4e0c18'];
      m.eye=['#fffbe0','#ffe04a','#ff8a2a','#b83a14']; m.glow=['#fff6c0','#ffb43a','#e0581e','#8a2414']; m.swish=['#fffbe6','#ffe6a8','#ffb460','#d0602a'];
      m.burst=['#ffffff','#fff0c0','#ffc46a','#ff8a2a']; m.lens=['#fff0c0','#ffb43a','#d0582a','#7a2414'];
      m.shirt=['#e86a5a','#b02a2e','#741826','#420c1a']; m.print=['#ffd47c','#f28c3b','#b24b27','#63231b']; m.leaf=['#f0a070','#c05a3a','#82302a','#4a1620'];
      m.hat=['#ffe4b2','#ddaa79','#9d6b4f','#5f3b33']; m.vest=['#c08a5e','#8a5636','#5e3428','#381c1a']; m.shorts=['#d8a27a','#a46c4e','#704238','#422424'];
      m.tank=['#f4d4bc','#d09c82','#905e52','#523234']; m.dirt=['#b4705a','#844a3e','#5a2e2e','#36181e'];
    }
    return punch(m);
  }
  const NAMES={skin:'Pele',vein:'Veias',rot:'Podridão',flesh:'Carne',bone:'Osso',hat:'Chapéu de aba larga',hband:'Fita do chapéu',shirt:'Camisa florida',print:'Estampa (flores)',leaf:'Estampa (folhas)',tank:'Regata',vest:'Colete de viagem',shorts:'Bermuda cargo',sock:'Meia branca',sandal:'Sandália',pack:'Mochila',strap:'Alças/nylon',cam:'Câmera (plástico)',chrome:'Metal da câmera',lens:'Lente',lanyard:'Cordão do crachá',badge:'Crachá',photo:'Fotos impressas',glass:'Óculos escuros',tape:'Fita de câmera',hair:'Cabelo',eye:'Olho',mouth:'Boca',teeth:'Dentes',dirt:'Barro',blood:'Sangue',acid:'Ácido',nail:'Unha',glow:'Brilho',burst:'Clarão do flash',swish:'Rastro do golpe'};
  function sat(h,k){ const [r,g,b]=PIX.hexRgb(h), y=(r+g+b)/3; return PIX.toHex(y+(r-y)*k,y+(g-y)*k,y+(b-y)*k); }
  const NOPUNCH={swish:1,glow:1,burst:1,lens:1};
  function punch(m){ const o={}; for(const k in m){ const r=m[k]; o[k]=NOPUNCH[k]?[r[0],r[1],r[2],r[3]]:[sat(r[0],1.1),sat(r[1],1.16),PIX.mix(sat(r[2],1.1),'#2a1a4c',0.2),PIX.mix(r[3],'#140a24',0.34)]; } return o; }

  /* ---------- poses ---------- */
  // ângulos: 0 = pendurado, + = pra frente. cr = giro da câmera (graus, 0 = lente pra frente); cam2 = câmera nas duas mãos.
  // fl = flash aceso (0 apagado, 0,5 clique pequeno, 1 clarão); bag = mochila na mão de trás (golpe); bsw = balanço da mochila nas costas.
  // cloose/cdx/cdy/cdr = câmera caída (morte); hdrop = chapéu caído.
  const REST={hx:0,rot:0,lift:0,lean:6,hunch:12,head:-4,jaw:8,aFs:34,aFe:96,aBs:-8,aBe:14,lFh:10,lFk:-2,lBh:-10,lBk:-18,fF:0,fB:0,cr:0,cam2:0,fl:0,bag:0,bsw:0,ht:4,cloose:0,cdx:0,cdy:0,cdr:0,hdrop:0,smear:0,flash:0,drool:0};
  const S=Math.sin, C=Math.cos, PI=Math.PI, mx=Math.max;
  const ANIMS={
    idle:{nome:'Parado (ergue a câmera, ajusta o foco, balança)',n:8,dur:()=>160,pose:i=>{ const p=i/8*PI*2, s=S(p), up=mx(0,S(p-0.6));
      return {hx:1.4*s, lean:6+2*S(p+0.6), hunch:12+1.5*S(2*p), head:-4+5*up-2*s, jaw:6+4*mx(0,S(p+1)), drool:i%4,
        aFs:34+30*up, aFe:96+40*up, cr:-6*up, aBs:-8+24*up, aBe:14+70*up, cam2:up>0.7?1:0,
        lFh:10+3*s, lFk:-2+3*s, lBh:-10-3*s, lBk:-18+3*s, bsw:s, ht:4+1.5*S(p-1)}; }},
    walk:{nome:'Andar curvado (passos curtos, olhando pra cima)',n:8,dur:()=>124,pose:i=>{ const p=i/8*PI*2;
      const lFh=8+14*S(p), lBh=-8+10*S(p+PI);
      return {lFh, lFk:lFh-20*mx(0,C(p))-3, lBh, lBk:lBh-10-12*mx(0,C(p+PI)), fF:-10*mx(0,C(p)), fB:18*mx(0,C(p+PI)),
        lean:7+2*S(p), hunch:13+2*S(2*p-0.6), head:2+3*S(2*p-1.4), jaw:8+3*S(2*p-1.8), hx:1.2*S(p), lift:1*mx(0,S(2*p)),
        aFs:34+8*S(p+PI), aFe:96+8*S(p+PI), cr:3*S(p), aBs:-8+18*S(p), aBe:14+16*S(p), bsw:S(2*p), ht:4+1.5*S(2*p), drool:i%4}; }},
    alert:{nome:'Alerta (vê o squad e aponta a câmera)',n:6,dur:i=>[170,130,150,160,200,160][i],pose:i=>[
      {head:4,jaw:14},
      {head:10,jaw:24,lean:-2,hunch:6,hx:-1,aBs:20,aBe:60},
      {head:6,jaw:20,lean:0,aFs:70,aFe:130,aBs:60,aBe:120,cam2:1,cr:-4},
      {head:2,jaw:12,lean:4,aFs:96,aFe:176,aBs:80,aBe:160,cam2:1,cr:-2,hx:1},
      {head:0,jaw:10,lean:4,aFs:98,aFe:180,aBs:82,aBe:164,cam2:1,cr:0,hx:1,fl:0.5},
      {head:0,jaw:12,aFs:60,aFe:120,aBs:20,aBe:60}][i]},
    // ---- golpes (flashAt = quadro do clarão; hit = quadro do dano; snapAt = clique da foto) ----
    flash:{nome:'Flash (ergue ao rosto, franze, clarão)',n:8,flashAt:4,reach:90,dur:i=>[110,100,90,70,60,90,180,170][i],pose:i=>[
      {head:2,jaw:12,lean:2,aFs:60,aFe:120,aBs:30,aBe:90,cam2:1,hx:-1},
      {head:0,jaw:6,lean:0,hunch:10,aFs:92,aFe:172,aBs:76,aBe:156,cam2:1,cr:-2,hx:-2,lFh:12,lBh:-14},
      {head:-2,jaw:4,lean:-2,hunch:8,aFs:98,aFe:180,aBs:84,aBe:166,cam2:1,cr:0,hx:-3,lFh:14,lBh:-16},
      {head:-2,jaw:4,lean:-3,hunch:8,aFs:100,aFe:182,aBs:86,aBe:168,cam2:1,cr:0,hx:-3,lFh:14,lBh:-16},
      {head:-4,jaw:18,lean:-6,hunch:6,aFs:102,aFe:184,aBs:88,aBe:170,cam2:1,cr:-2,hx:-4,fl:1,lFh:16,lBh:-18},
      {head:-2,jaw:22,lean:-8,hunch:6,aFs:100,aFe:180,aBs:86,aBe:168,cam2:1,cr:-4,hx:-5,fl:1,lFh:16,lBh:-18},
      {head:-16,jaw:12,lean:8,hunch:16,aFs:56,aFe:92,aBs:40,aBe:96,cam2:1,cr:-30,hx:-2},
      {head:-12,jaw:10,lean:6,hunch:14,aFs:44,aFe:96,aBs:20,aBe:70,cr:-20}][i]},
    bag:{nome:'Mochilada (gira o corpo)',n:8,hit:4,reach:30,dur:i=>[130,110,90,50,70,110,140,150][i],pose:i=>[
      {lean:0,hunch:10,head:0,jaw:14,aBs:-30,aBe:-10,hx:-1,bag:1},
      {lean:-8,hunch:6,head:4,jaw:20,aBs:-80,aBe:-60,hx:-3,bag:1,lFh:16,lBh:-16,aFs:20,aFe:60},
      {lean:-12,hunch:4,head:6,jaw:24,aBs:-110,aBe:-100,hx:-4,bag:1,lFh:18,lBh:-20,lBk:-30,aFs:10,aFe:50},
      {lean:16,hunch:16,head:-8,jaw:30,aBs:40,aBe:60,hx:5,bag:1,smear:1,lFh:24,lFk:2,lBh:-22,lBk:-30,fB:10},
      {lean:22,hunch:18,head:-10,jaw:34,aBs:100,aBe:110,hx:7,bag:1,smear:1,lFh:26,lFk:4,lBh:-24,lBk:-32,fB:12},
      {lean:20,hunch:18,head:-8,jaw:24,aBs:120,aBe:140,hx:6,bag:1,lFh:24,lBh:-22},
      {lean:10,hunch:14,head:-4,jaw:16,aBs:40,aBe:80,hx:3,bag:1},
      {lean:6,hunch:12,jaw:10,aBs:-8,aBe:14,bag:0}][i]},
    flee:{nome:'Foge (corre em semicurva, mochila balançando)',n:8,dur:()=>90,pose:i=>{ const p=i/8*PI*2;
      const lFh=24*S(p)+6, lBh=24*S(p+PI)+6;
      return {lFh, lFk:lFh-36*mx(0,C(p))-6, lBh, lBk:lBh-36*mx(0,C(p+PI))-6, fF:-14*mx(0,C(p)), fB:-14*mx(0,C(p+PI)),
        lean:18+2*S(2*p), hunch:16, head:-2+4*S(2*p), jaw:26+8*S(2*p), hx:2*S(p), lift:3*mx(0,S(2*p)),
        aFs:30+40*S(p+PI), aFe:90+30*S(p+PI), cr:-10+8*S(p), aBs:20+50*S(p), aBe:70+40*S(p), bsw:3*S(2*p+0.6), ht:2+3*S(2*p), drool:i%4}; }},
    snap:{nome:'Fotografa (agacha pra enquadrar, clique)',n:7,snapAt:4,dur:i=>[140,150,160,170,90,180,160][i],pose:i=>[
      {lean:8,hunch:12,head:0,jaw:10,aFs:70,aFe:130,aBs:40,aBe:100,cam2:1,lFh:20,lFk:-10,lBh:-6,lBk:-30},
      {lean:6,hunch:10,head:-2,jaw:6,aFs:96,aFe:178,aBs:80,aBe:162,cam2:1,lFh:40,lFk:-24,lBh:4,lBk:-54},
      {lean:4,hunch:8,head:-4,jaw:4,aFs:100,aFe:184,aBs:86,aBe:168,cam2:1,cr:2,lFh:54,lFk:-30,lBh:10,lBk:-70,hx:-1},
      {lean:4,hunch:8,head:-4,jaw:4,aFs:100,aFe:184,aBs:86,aBe:168,cam2:1,cr:2,lFh:56,lFk:-30,lBh:10,lBk:-72,hx:-1},
      {lean:2,hunch:8,head:-2,jaw:16,aFs:100,aFe:184,aBs:86,aBe:168,cam2:1,cr:0,lFh:56,lFk:-30,lBh:10,lBk:-72,hx:-2,fl:0.5},
      {lean:4,hunch:8,head:-4,jaw:10,aFs:100,aFe:184,aBs:86,aBe:168,cam2:1,cr:2,lFh:56,lFk:-30,lBh:10,lBk:-72,hx:-1},
      {lean:8,hunch:12,head:-8,jaw:8,aFs:50,aFe:100,aBs:30,aBe:90,cr:-24,lFh:24,lFk:-10,lBh:-6,lBk:-30}][i]},
    hurt:{nome:'Dano (cabeça)',n:4,dur:i=>[80,110,130,150][i],pose:i=>[
      {lean:-8,hunch:4,head:12,jaw:30,aFs:-10,aFe:40,aBs:-20,aBe:10,hx:-6,flash:1,lFh:14,lBh:-4,ht:-8,cr:30},
      {lean:-4,hunch:6,head:8,jaw:26,aFs:0,aFe:50,aBs:-12,aBe:20,hx:-5,lFh:12,lBh:-6,ht:-4,cr:20},
      {lean:2,hunch:9,head:0,jaw:20,aFs:20,aFe:70,aBs:-10,aBe:14,hx:-2,ht:2},
      {lean:5,hunch:11,head:-3,jaw:10,hx:0}][i]},
    hurtB:{nome:'Dano (barriga, dobra)',n:4,dur:i=>[80,120,140,150][i],pose:i=>[
      {lean:30,hunch:28,head:8,jaw:40,aFs:50,aFe:30,aBs:44,aBe:14,hx:-8,flash:1,lFh:20,lFk:-14,lBh:-14,lBk:-30,ht:12,cr:-40},
      {lean:26,hunch:26,head:4,jaw:36,aFs:46,aFe:34,aBs:40,aBe:20,hx:-7,lFh:18,lFk:-12,lBh:-14,lBk:-28,ht:10,cr:-30},
      {lean:16,hunch:18,head:-2,jaw:24,aFs:36,aFe:70,aBs:20,aBe:40,hx:-3},
      {lean:8,hunch:13,head:-4,jaw:12,hx:-1}][i]},
    fall:{nome:'Derrubado',n:5,dur:i=>[90,100,110,150,260][i],pose:i=>[
      {lean:-12,hunch:2,head:8,jaw:34,aFs:-40,aFe:-20,aBs:-46,aBe:-30,hx:-6,flash:1,lFh:20,lBh:0,ht:-8,cr:40},
      {rot:-34,lean:-4,hunch:6,head:2,jaw:30,aFs:-60,aFe:-40,aBs:-70,aBe:-50,hx:-4,lFh:40,lFk:30,lBh:20,lBk:10,ht:-10,cr:60},
      {rot:-70,lean:0,hunch:8,head:-4,jaw:28,aFs:-96,aFe:-80,aBs:-96,aBe:-80,hx:-6,lFh:50,lFk:40,lBh:30,lBk:24,ht:-12,cr:80},
      {rot:-90,lean:4,hunch:10,head:-2,jaw:36,aFs:-110,aFe:-120,aBs:-100,aBe:-110,hx:2,lFh:40,lFk:10,lBh:30,lBk:4,ht:-14,cr:90},
      {rot:-90,lean:0,hunch:10,head:-4,jaw:34,aFs:-130,aFe:-150,aBs:-110,aBe:-136,hx:2,lFh:40,lFk:6,lBh:26,lBk:0,ht:-14,cr:100}][i]},
    getup:{nome:'Levantar (procura a câmera)',n:5,dur:i=>[200,170,170,160,160][i],pose:i=>[
      {rot:-90,lean:0,hunch:10,head:-4,jaw:34,aFs:-130,aFe:-150,aBs:-110,aBe:-136,hx:2,lFh:40,lFk:6,lBh:26,lBk:0,ht:-14,cr:100},
      {rot:-56,lean:12,hunch:18,head:-16,jaw:24,aFs:-50,aFe:-10,aBs:-60,aBe:-20,hx:-8,lFh:90,lFk:10,lBh:70,lBk:0,ht:-6,cr:40},
      {rot:-24,lean:22,hunch:22,head:-24,jaw:20,aFs:10,aFe:30,aBs:-20,aBe:0,hx:-6,lFh:110,lFk:10,lBh:60,lBk:-60,cr:10},
      {rot:0,lean:28,hunch:22,head:-24,jaw:16,aFs:40,aFe:80,aBs:20,aBe:4,hx:-4,lFh:78,lFk:-2,lBh:6,lBk:-86,fB:60,cr:-20},
      {lean:10,hunch:14,head:-8,jaw:10,aFs:40,aFe:100,aBs:10,aBe:40,cr:-10}][i]},
    death:{nome:'Morte (a câmera cai e o flash dispara no chão)',n:7,dur:i=>[90,150,160,170,160,120,600][i],pose:i=>[
      {lean:-10,hunch:2,head:10,jaw:40,aFs:-34,aFe:-16,aBs:-40,aBe:-24,hx:-5,flash:1,lFh:14,lBh:-4,ht:-10,cr:60},
      {lean:-2,hunch:8,head:14,jaw:48,aFs:-10,aFe:4,aBs:-16,aBe:0,hx:-6,lFh:10,lBh:-8,cloose:1,cdx:16,cdy:40,cdr:60},
      {lean:8,hunch:18,head:0,jaw:46,aFs:4,aFe:6,aBs:0,aBe:2,hx:-4,lFh:40,lFk:-30,lBh:28,lBk:-50,fF:10,fB:30,cloose:1,cdx:26,cdy:16,cdr:150},
      {lean:12,hunch:26,head:-8,jaw:48,aFs:6,aFe:4,aBs:2,aBe:0,hx:-2,lFh:14,lFk:-92,lBh:6,lBk:-96,fF:100,fB:100,cloose:1,cdx:32,cdy:0,cdr:180},
      {rot:50,lean:10,hunch:24,head:-12,jaw:44,aFs:70,aFe:90,aBs:56,aBe:76,hx:4,lFh:-20,lFk:-70,lBh:-28,lBk:-74,fF:60,fB:60,cloose:1,cdx:36,cdy:0,cdr:180,hdrop:1},
      {rot:86,lean:2,hunch:12,head:-4,jaw:40,aFs:150,aFe:170,aBs:110,aBe:150,hx:8,lFh:-4,lFk:-10,lBh:-8,lBk:-14,fF:10,fB:10,cloose:1,cdx:38,cdy:0,cdr:180,fl:1,hdrop:1},
      {rot:90,lean:0,hunch:10,head:0,jaw:42,aFs:160,aFe:176,aBs:116,aBe:156,hx:8,lFh:-2,lFk:-6,lBh:-6,lBk:-10,fF:6,fB:6,cloose:1,cdx:38,cdy:0,cdr:180,hdrop:1,drool:3}][i]},
  };
  const EXK=['hx','lean','hunch','head','aFs','aFe','aBs','aBe','lFh','lFk','lBh','lBk'];
  function exag(P,f){ if(f===1||Math.abs(P.rot)>4) return P; EXK.forEach(k=>{ P[k]=REST[k]+(P[k]-REST[k])*f; }); P.jaw=Math.min(58,mx(0,REST.jaw+(P.jaw-REST.jaw)*f)); return P; }
  const EXF={idle:1.04,walk:1.08,alert:1.06,flash:1.04,bag:1.15,flee:1.08,snap:1.02,hurt:1.3,hurtB:1.25,fall:1.1,getup:1.08,death:1.1};
  ZREACT.add(ANIMS,REST,{}); // reações (voando, agarrado) — art-src/shared/zreact.js
  function poseOf(anim,i){ const A=ANIMS[anim]; return exag(Object.assign({},REST,A.pose(i)),EXF[anim]||1); }
  function heavyOutline(cv){ const g=cv.getContext('2d'), W=cv.width, H=cv.height, im=PIX.pix(cv), d=im.data;
    const isO=i=>d[i+3]===255&&d[i]===0x17&&d[i+1]===0x0b&&d[i+2]===0x1c, fill=i=>d[i+3]===255&&!isO(i);
    const add=[]; for(let y=2;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(d[i+3]) continue; const u=((y-1)*W+x)*4, u2=((y-2)*W+x)*4; if(isO(u)&&fill(u2)) add.push(i); }
    add.forEach(i=>{ d[i]=0x17; d[i+1]=0x0b; d[i+2]=0x1c; d[i+3]=255; }); g.putImageData(im,0,0); }

  /* ---------- esqueleto (magro, curvado, pernas finas) ---------- */
  const SPINE=40, TH=21.5, SH=21.5, UA=15, FA=14, VS=SPINE/37, US=1.04, HB=10, HS=1.2;
  const lp=(p,a,L)=>({x:p.x+Math.sin(rad(a))*L, y:p.y+Math.cos(rad(a))*L});
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
    const top=SS[SPINE], neck=T(1,-37), sa=top.a;
    const shF=T(-0.6,-31.6), shB=T(-5.6,-32.4);
    const elF=lp(shF,P.aFs-R,UA), wrF=lp(elF,P.aFe-R,FA), elB=lp(shB,P.aBs-R,UA), wrB=lp(elB,P.aBe-R,FA);
    const ha=sa+rad(P.head-HB*0.8), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:neck.x+(lx*hc-ly*hs)*HS, y:neck.y+(lx*hs+ly*hc)*HS});
    // câmera: na frente do punho, girada por P.cr (absoluto + giro do corpo)
    const fd={x:(wrF.x-elF.x)/FA, y:(wrF.y-elF.y)/FA};
    const camO={x:wrF.x+fd.x*2.6, y:wrF.y+fd.y*2.6-2.6}, camA=rad(P.cr+R);
    const CW=(lx,ly)=>({x:camO.x+(lx*Math.cos(camA)-ly*Math.sin(camA))*1.45, y:camO.y+(lx*Math.sin(camA)+ly*Math.cos(camA))*1.45});
    const toe=(a,f)=>{ const t=rad(f+R); return {x:a.x+(10*Math.cos(t)-5*Math.sin(t))*1.3, y:a.y+(10*Math.sin(t)+5*Math.cos(t))*1.3}; };
    const hull=[[ankleF,5],[ankleB,5],[toe(ankleF,P.fF),0.8],[toe(ankleB,P.fB),0.8],[kneeF,5],[kneeB,5],[hip,8],[T(0,-18),10],[T(-2,-30),10],[H(3,-11),10],[wrF,4],[wrB,4],[elF,4],[elB,4]];
    return {R,hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,SP,T,sa,neck,shF,shB,elF,wrF,elB,wrB,ha,H,hull,ra,camO,camA,CW,toeF:toe(ankleF,P.fF)};
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
  // florzinha da estampa (5 pétalas) e folha
  function flower(p,M,x,y,r){ p.F(M.print[1]); for(let k=0;k<5;k++){ const a=k/5*PI*2+0.3; p.ell(x+Math.cos(a)*r*0.7,y+Math.sin(a)*r*0.7,r*0.55,r*0.55); } p.F(M.print[0]); p.rect(x-r*0.5,y-r*0.6,r*0.6,r*0.4); p.F(M.badge[1]); p.rect(x-0.4,y-0.4,0.8,0.8); }
  function leaf(p,M,x,y,a,L){ const c=Math.cos(a), s=Math.sin(a); p.F(M.leaf[1]); p.poly([[x,y],[x+c*L*0.5-s*L*0.28,y+s*L*0.5+c*L*0.28],[x+c*L,y+s*L],[x+c*L*0.5+s*L*0.28,y+s*L*0.5-c*L*0.28]]); p.F(M.leaf[2]); p.poly([[x,y],[x+c*L,y+s*L],[x+c*L*0.5+s*L*0.28,y+s*L*0.5-c*L*0.28]]); }

  /* ---------- chapéu de aba larga (coordenadas locais: origem no centro da aba, x pra frente) ---------- */
  function drawHat(c,p,M,form,o){
    o=o||{}; const sx=o.sx!=null?o.sx:1;
    // aba larga e mole: cai na frente e atrás, rasgo na frente
    const brim=(dy,k)=>{ const pts=[]; for(let i=0;i<28;i++){ const a=i/28*PI*2, ca=Math.cos(a), sa=Math.sin(a); pts.push([ca*20*k, sa*3.2*k+dy+Math.abs(ca)*Math.abs(ca)*3.4+(ca>0.6?(ca-0.6)*2.4:0)]); } return pts; };
    p.F(M.hat[2]); p.poly(brim(1.4,1));
    p.F(M.hat[1]); p.poly(brim(0,1));
    clip(c,brim(0,1),()=>{ p.F(M.hat[2]); p.poly([[-22,-2],[-8,-2],[-8,8],[-22,8]]); p.F(M.hat[3]); p.poly([[-22,1],[-14,1.6],[-14,8],[-22,8]]);
      p.F(M.hat[0]); p.poly([[6,1.4],[19,2.8],[19,4.4],[7,3]]);
      p.F(M.hat[2]); for(let k=0;k<4;k++){ const x=-17+k*11; p.rect(x,2.6+(k%2)*0.6,4,0.5); } // costura da aba (pesponto)
    });
    // rasgo triangular na aba da frente e fiapos
    p.F(M.hat[3]); p.poly([[11.4,3.2],[14.6,3.8],[13,6.4]]);
    p.F(M.hat[2]); [[16.6,5.6],[18.8,6],[-18,4.8]].forEach(([x,y])=>p.poly([[x,y],[x+1.2,y],[x+0.6,y+1.4]]));
    // copa redonda (bucket/safari), amassada
    const crown=[[-9.6,0.6],[-9.8,-4],[-8.6,-8],[-5.2,-10.6],[0,-11.4],[5,-10.8],[8.6,-8.4],[10,-4],[10.2,0.8],[5,1.8],[0,2],[-5,1.8]].map(([x,y])=>[x*sx,y]);
    p.F(M.hat[1]); p.poly(crown);
    clip(c,crown,()=>{
      p.F(M.hat[2]); p.poly([[-11,-12],[-4.6*sx,-12],[-5.4*sx,3],[-11,3]]);
      p.F(M.hat[3]); p.poly([[-11,-12],[-8.2*sx,-12],[-8.6*sx,3],[-11,3]]);
      p.F(M.hat[0]); p.poly([[1.6*sx,-10.8],[6.4*sx,-10],[8.6*sx,-6.6],[5*sx,-8.6]]);
      p.F(M.hat[2]); p.poly([[-3*sx,-10.6],[1*sx,-8.8],[3.4*sx,-9.4],[1*sx,-7.8],[-2.6*sx,-9.6]]); // amassado
      // fita
      p.F(M.hband[1]); p.poly([[-11,-2.8],[11,-2.8],[11,1],[-11,1]]);
      p.F(M.hband[0]); p.poly([[-1*sx,-2.8],[10*sx,-2.8],[10*sx,-2.2],[-1*sx,-2.2]]);
      p.F(M.hband[2]); p.poly([[-11,-0.6],[-3*sx,0],[-3*sx,1],[-11,1]]);
      p.F(M.hat[2]); [[-6,-5.6],[-2,-6],[2,-5.6],[6,-5.8]].forEach(([x,y])=>p.rect(x*sx,y,0.8,0.8)); // ilhoses de ventilação
      p.F(M.dirt[1]); p.ell(4*sx,-6.4,2.4,1.3); p.F(M.dirt[2]); p.rect(3.2*sx,-6,1.2,0.8);
    });
    if(form==='plenilunar'){ p.F(M.blood[1]); p.poly([[2,-2.8],[4.6,-2.8],[4.2,1],[3.4,3.2],[2.8,0.4]]); p.ell(-12,3.4,1.8,0.9); }
    else { p.F(M.blood[1]); p.ell(-12,3.4,1.4,0.7); }
    if(form==='enluarado'){ p.F(M.glow[1]); p.rect(-6*sx,-9.6,2.4,0.6); }
  }
  function hatAt(c,p,M,form,ox,oy,ang,sc,o){ p.xf(ang,ox,oy); c.scale(sc,sc); drawHat(c,p,M,form,o); p.id(); }

  /* ---------- câmera compacta (coordenadas locais: origem no punho, x = lente) ---------- */
  function drawCamera(c,p,M,form,ox,oy,ang,fused){
    p.xf(ang,ox,oy); c.scale(1.45,1.45);
    // corpo
    p.F(M.cam[1]); p.poly([[-4.4,-4.6],[4.6,-4.8],[5.4,-4],[5.4,3.6],[4.6,4.2],[-4.4,4.2],[-5,3.4],[-5,-3.8]]);
    p.F(M.cam[2]); p.poly([[-5,1.4],[5.4,1.2],[5.4,3.6],[4.6,4.2],[-4.4,4.2],[-5,3.4]]);
    p.F(M.cam[0]); p.poly([[-4.2,-4.6],[4.4,-4.8],[4.8,-4.2],[-4,-4]]);
    p.F(M.cam[3]); p.rect(-5,-0.4,0.8,3.6);
    p.F(M.cam[0]); p.rect(-3.6,-3.4,2,0.6); // textura do grip
    // botão do disparo e dial
    p.F(M.chrome[2]); p.rect(-3.4,-5.8,2.4,1.2); p.F(M.chrome[0]); p.rect(-3,-5.8,1,0.5);
    p.F(M.chrome[1]); p.rect(0.4,-5.4,2.6,0.8);
    // flash na sapata (soquete): caixinha clara em cima, na frente
    p.F(M.cam[1]); p.rect(1.4,-8.2,3.8,3.6); p.F(M.cam[0]); p.rect(1.6,-8.2,3.4,0.6);
    p.F(M.burst[form==='comum'?2:1]); p.rect(4.2,-7.6,1.2,2.6); p.F(M.burst[0]); p.rect(4.6,-7.2,0.6,1.2);
    // anel da lente e vidro
    p.F(M.chrome[2]); p.poly([[5.4,-3.6],[8.6,-3.2],[8.6,2.8],[5.4,3.2]]);
    p.F(M.chrome[1]); p.poly([[5.6,-3.4],[8.4,-3],[8.4,-1.6],[5.6,-1.8]]);
    p.F(M.chrome[3]); p.poly([[5.6,1.6],[8.4,1.4],[8.4,2.8],[5.6,3.2]]);
    p.F(M.cam[2]); p.rect(6.6,-3.2,0.6,6.2);
    p.F(M.lens[2]); p.ell(9.4,-0.2,1.6,3.2);
    p.F(M.lens[1]); p.ell(9.6,-0.4,1.2,2.6);
    p.F(M.lens[0]); p.rect(9.4,-2.2,0.8,1.2); p.F(M.burst[0]); p.rect(9.8,-1.8,0.6,0.6); // reflexo (olho)
    // trinca no vidro e fita
    p.F(M.lens[3]); p.poly([[9,0.6],[10.2,1.4],[9.4,2.2]]);
    p.F(M.tape[1]); p.poly([[-1.4,-4.8],[0.6,-4.8],[0.6,4.2],[-1.4,4.2]]); p.F(M.tape[0]); p.rect(-1.2,-4.6,0.6,8.6);
    // fotos impressas saindo como língua (por baixo) + sangue
    p.F(M.photo[1]); p.poly([[-2.6,4.2],[3,4.2],[2.4,7.4],[-2.2,7]]); p.F(M.photo[2]); p.rect(-1.8,5,3.6,1.6); p.F(M.flesh[2]); p.rect(-1.4,5.4,1.6,0.8);
    p.F(M.blood[1]); p.ell(4.2,3.4,1,0.8);
    if(fused){ // plenilunar: câmera "fundida" à mão por carne
      p.F(M.flesh[1]); p.poly([[-5.6,-2],[-2.6,-3.4],[-1.4,0],[-2.6,4.8],[-5.6,4.4]]);
      p.F(M.flesh[2]); p.poly([[-5.6,1.4],[-2,2],[-2.6,4.8],[-5.6,4.4]]);
      p.F(M.vein[1]); p.rect(-4.6,-1.4,0.6,3.6); p.rect(-3.4,0.4,2.4,0.6);
    }
    if(form!=='comum'){ p.F(M.glow[1]); p.rect(8.8,-0.8,0.8,0.8); }
    p.id();
  }
  // estouro do flash (parte sem sombra): estrela de raios
  function drawBurst(c,u,M,x,y,k){
    const p=mkPen(c,u); p.id();
    const ray=(a,L,w)=>{ const ca=Math.cos(a), sa=Math.sin(a); p.poly([[x+ca*L,y+sa*L],[x-sa*w,y+ca*w],[x+sa*w,y-ca*w]]); };
    p.F(M.burst[3]); for(let i=0;i<8;i++) ray(i/8*PI*2+0.2,22*k,3.4*k);
    p.F(M.burst[2]); for(let i=0;i<8;i++) ray(i/8*PI*2+0.2+PI/8,15*k,2.6*k);
    p.F(M.burst[2]); p.circle({x,y},8*k);
    p.F(M.burst[1]); p.circle({x,y},6*k);
    p.F(M.burst[0]); p.circle({x,y},3.6*k);
  }

  /* ---------- mochila (coordenadas locais: origem no topo, y pra baixo ao longo das costas) ---------- */
  function drawPack(c,p,M,form){
    // corpo arredondado
    p.F(M.pack[1]); p.poly([[-3.4,0],[3,-0.6],[5.6,2],[6.4,10],[6,17],[4,19],[-4,19],[-6,16],[-6.4,6],[-5.4,1.4]]);
    p.F(M.pack[2]); p.poly([[-6.4,6],[-6,16],[-4,19],[4,19],[2,17],[-3.4,16],[-4.6,8]]);
    p.F(M.pack[3]); p.poly([[-6.4,10],[-6,16],[-4,19],[-2,19],[-4.4,15]]);
    p.F(M.pack[0]); p.poly([[-1,0.4],[3,-0.2],[5,2],[1,2]]);
    // bolso da frente com zíper
    p.F(M.pack[2]); p.poly([[-4.4,9],[4.4,8.6],[4.8,16],[-4.2,16.4]]);
    p.F(M.pack[1]); p.poly([[-4,9.4],[4,9],[4.4,15.2],[-3.8,15.6]]);
    p.F(M.strap[1]); p.rect(-4.2,9,8.6,0.8); p.F(M.chrome[1]); p.rect(2.6,8.6,1,1.8);
    // alça de mão no topo, fivela, garrafa d'água no bolso lateral
    p.F(M.strap[1]); p.cap(P2(-2,0.4),P2(1.6,-2.4),0.9,0.9); p.cap(P2(1.6,-2.4),P2(3,0),0.9,0.9);
    p.F(M.chrome[2]); p.rect(-1,4.6,2,1.4);
    p.F(M.lens[2]); p.poly([[5,5],[7.6,5],[7.8,12],[5.2,12]]); p.F(M.lens[1]); p.rect(5.6,5.6,1,5.6); p.F(M.badge[1]); p.rect(5.2,3.6,2.2,1.6);
    // rasgo com fotos saindo e sangue
    p.F(M.pack[3]); p.poly([[-5.6,3],[-3,2.4],[-2.6,5.4],[-5,6]]);
    p.F(M.photo[1]); p.poly([[-5,3.4],[-3.4,3],[-3.2,5],[-4.8,5.2]]);
    p.F(M.blood[1]); p.ell(-4,17.4,1.4,0.8); p.F(M.dirt[1]); p.ell(2,18,2,0.8);
    if(form!=='comum'){ p.F(M.glow[1]); p.rect(-5.4,12,0.6,2.4); }
  }
  function packOnBack(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    const top=Wp(sk,-9.6,-33+P.bsw*0.6), a=sk.sa+rad(P.bsw*3);
    p.xf(a,top.x,top.y); c.scale(1.12,1.12); drawPack(c,p,M,form); p.id();
  }

  /* ---------- braços: manga curta florida, antebraço podre ---------- */
  function drawArm(c,u,M,sk,P,front,form){
    const p=mkPen(c,u), sh=front?sk.shF:sk.shB, el=front?sk.elF:sk.elB, wr=front?sk.wrF:sk.wrB; p._c=c; p.id();
    const sn=sideN(sh,el);
    // antebraço de pele (fino, cotovelo ossudo)
    const n=limb(p,M.skin,el,wr,7.6,6.8,{});
    p.F(M.vein[1]); const v0=lerp(el,wr,0.25), v1=lerp(el,wr,0.85); p.cap(off(v0,n,-1),off(v1,n,-1.3),0.6,0.5);
    p.F(M.skin[1]); p.circle(el,3.8);
    if(front){ p.F(M.rot[1]); const r1=lerp(el,wr,0.55); p.ell(r1.x+n.nx*1.2,r1.y+n.ny*1.2,1.5,1.1); p.F(M.flesh[2]); p.rect(r1.x+n.nx*1.2-0.5,r1.y+n.ny*1.2-0.3,1,0.8); }
    else { p.F(M.rot[1]); const r1=lerp(el,wr,0.4); p.ell(r1.x,r1.y,1.4,1); }
    // relógio de pulso (plástico) no braço de trás
    if(!front){ const wq=lerp(el,wr,0.86); p.F(M.strap[1]); p.cap(off(wq,n,-3.2),off(wq,n,3.2),1.4,1.4); p.F(M.chrome[1]); p.circle(off(wq,n,-1.6),1.2); }
    // manga curta da camisa florida (larga, com barra dobrada)
    const sl=lerp(sh,el,0.72);
    limb(p,M.shirt,sh,sl,11.6,10.6,{hl:0.6});
    clip(c,[[sh.x+sn.nx*7,sh.y+sn.ny*7],[sh.x-sn.nx*7,sh.y-sn.ny*7],[sl.x-sn.nx*6,sl.y-sn.ny*6],[sl.x+sn.nx*6,sl.y+sn.ny*6]],()=>{
      const m=lerp(sh,sl,0.45); flower(p,M,m.x-sn.nx*1.6,m.y-sn.ny*1.6,2.2); leaf(p,M,m.x+sn.nx*2,m.y+sn.ny*2,Math.atan2(sl.y-sh.y,sl.x-sh.x)+0.8,4.4);
      const m2=lerp(sh,sl,0.9); p.F(M.print[2]); p.circle({x:m2.x-sn.nx*3,y:m2.y-sn.ny*3},1.2);
    });
    p.F(M.shirt[2]); p.cap(off(sl,sn,-5.6),off(sl,sn,5.6),1.2,1.2);
    p.F(M.shirt[3]); const sl2=lerp(sh,el,0.76); p.cap(off(sl2,sn,-5),off(sl2,sn,5),0.6,0.6);
    if(front){ p.F(M.blood[1]); const b=lerp(sh,el,0.4); p.ell(b.x+sn.nx*2.6,b.y+sn.ny*2.6,1.4,1); }
    if(front){
      drawCamera(c,p,M,form,sk.camO.x,sk.camO.y,sk.camA,form==='plenilunar');
      drawGrip(p,M,el,wr);
    } else if(P.bag>=0.5){
      const ang=Math.atan2(wr.y-el.y,wr.x-el.x); const hp={x:wr.x+(wr.x-el.x)/FA*3,y:wr.y+(wr.y-el.y)/FA*3};
      p.xf(ang-PI/2,hp.x,hp.y); c.scale(1.12,1.12); drawPack(c,p,M,form); p.id();
      drawGrip(p,M,el,wr);
    } else if(P.cam2>=0.5){ drawGrip(p,M,el,wr); }
    else drawHandB(p,M,el,wr);
  }
  function drawGrip(p,M,el,wr){ // mão fechada segurando (câmera/alça)
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y); p._c.scale(1.25,1.25);
    p.F(M.skin[1]); p.poly([[-1,-3],[4,-3.4],[5.4,-1],[5,3],[-1,3.2]]);
    p.F(M.skin[2]); p.poly([[-1,1.2],[5.2,1],[5,3],[-1,3.2]]);
    p.F(M.skin[0]); p.rect(0.4,-2.8,3.2,0.8);
    for(let k=0;k<4;k++){ const y0=-2.4+k*1.7; p.F(M.skin[1]); p.ell(5.4,y0,1.5,0.95); p.F(M.nail[1]); p.rect(6,y0-0.3,0.7,0.6); }
    p.F(M.skin[1]); p.cap(P2(1.4,-2.8),P2(4.6,-4.2),1.6,1.2);
    p.id();
  }
  function drawHandB(p,M,el,wr){
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y); p._c.scale(1.25,1.25);
    p.F(M.skin[1]); p.poly([[-1,-2.8],[4.2,-3],[5.2,2.6],[-1,3]]);
    p.F(M.skin[2]); p.poly([[-1,1],[5,1],[5.2,2.6],[-1,3]]);
    [[-2.2,8.6],[-0.7,9.6],[0.8,9.2],[2.2,8]].forEach(([y,L])=>{ p.F(M.skin[1]); p.cap(P2(4.2,y),P2(L,y+0.4),1.4,1.1); p.F(M.nail[1]); p.rect(L-0.6,y-0.2,0.8,0.7); });
    p.F(M.skin[1]); p.cap(P2(2,-2.8),P2(4.6,-5.2),1.6,1.2);
    p.id();
  }
  function drawCamStrap(c,u,M,sk,P){
    if(P.cloose>=0.5) return;
    const p=mkPen(c,u); p.id();
    const a=Wp(sk,3,-35.4), lug=sk.CW(-4.6,-2), mid=lerp(a,lug,0.5), sag={x:mid.x-1,y:mid.y+3+Math.abs(lug.x-a.x)*0.08};
    p.F(M.strap[1]); p.cap(a,sag,0.9,0.9); p.cap(sag,lug,0.9,0.9);
    p.F(M.strap[0]); p.cap(lerp(a,sag,0.2),lerp(a,sag,0.6),0.35,0.35);
  }

  /* ---------- pernas: bermuda cargo, canela fina, meia branca, sandália ---------- */
  function drawLeg(c,u,M,sk,P,front){
    const p=mkPen(c,u), hip=front?sk.hipF:sk.hipB, knee=front?sk.kneeF:sk.kneeB, ank=front?sk.ankleF:sk.ankleB; p.id();
    // canela de pele fina e meia branca até a metade da canela
    const nS=limb(p,M.skin,knee,ank,7.4,6.2,{hl:0.5});
    p.F(M.vein[1]); p.cap(off(lerp(knee,ank,0.15),nS,-1),off(lerp(knee,ank,0.5),nS,-1.2),0.5,0.5);
    if(front){ p.F(M.rot[1]); const r=lerp(knee,ank,0.35); p.ell(r.x+nS.nx*1.4,r.y+nS.ny*1.4,1.6,1.2); p.F(M.flesh[2]); p.rect(r.x+nS.nx*1.4-0.4,r.y+nS.ny*1.4,1,0.8); }
    const s0=lerp(knee,ank,0.56);
    limb(p,M.sock,s0,ank,7.6,7,{hl:0.6});
    p.F(M.sock[2]); p.cap(off(s0,nS,-3.8),off(s0,nS,3.8),0.9,0.9); // elástico
    p.F(M.sock[2]); const sr=lerp(s0,ank,0.5); p.cap(off(sr,nS,-3.4),off(sr,nS,-1),0.5,0.5);
    p.F(M.dirt[1]); p.ell(lerp(s0,ank,0.8).x,lerp(s0,ank,0.8).y,1.6,1.1);
    // coxa: bermuda larga até abaixo do joelho, bolso cargo
    const kb=lerp(hip,knee,1.14);
    const nT=limb(p,M.shorts,hip,kb,14,12.6,{hl:0.55});
    p.F(M.shorts[2]); p.cap(off(kb,nT,-6.6),off(kb,nT,6.6),1.4,1.4); // barra
    p.F(M.shorts[3]); p.cap(off(lerp(hip,knee,1.1),nT,-6),off(lerp(hip,knee,1.1),nT,6),0.6,0.6);
    // bolso cargo com aba
    const pk=lerp(hip,knee,0.6), pd={x:(knee.x-hip.x)/TH,y:(knee.y-hip.y)/TH};
    const PQ=(a,b)=>({x:pk.x+nT.nx*a+pd.x*b,y:pk.y+nT.ny*a+pd.y*b});
    const pq=[PQ(-4,-3),PQ(3.4,-3),PQ(3.6,4),PQ(-3.8,4.2)].map(q=>[q.x,q.y]);
    p.F(M.shorts[1]); p.poly(pq); p.F(M.shorts[2]); p.poly([PQ(-4,-3),PQ(3.4,-3),PQ(3.4,-1.2),PQ(-4,-1)].map(q=>[q.x,q.y]));
    p.F(M.shorts[3]); p.poly([PQ(-4,4),PQ(3.6,3.8),PQ(3.6,4.6),PQ(-3.8,4.8)].map(q=>[q.x,q.y]));
    p.F(M.shorts[0]); p.poly([PQ(-4,-3.6),PQ(3.4,-3.6),PQ(3.4,-3),PQ(-4,-3)].map(q=>[q.x,q.y]));
    p.F(M.chrome[2]); { const q=PQ(-0.4,-2); p.rect(q.x-0.5,q.y-0.5,1,1); }
    // dobras
    p.F(M.shorts[2]); const f1=lerp(hip,knee,0.25); p.cap(off(f1,nT,1),off(lerp(hip,knee,0.4),nT,5),0.7,0.6);
    p.F(M.shorts[0]); p.cap(off(lerp(hip,knee,0.15),nT,-4),off(lerp(hip,knee,0.5),nT,-5),0.6,0.5);
    if(front){ p.F(M.blood[1]); const b0=lerp(hip,knee,0.9); p.ell(b0.x+nT.nx*3,b0.y+nT.ny*3,1.6,1.2); p.F(M.dirt[1]); p.ell(b0.x-nT.nx*3,b0.y-nT.ny*3+1,2,1.2); }
    // sandália: sola grossa, tiras cruzadas sobre a meia
    const fa=rad((front?P.fF:P.fB)+sk.R); p.xf(fa,ank.x,ank.y); c.scale(1.3,1.3);
    p.F(M.sock[1]); p.poly([[-3.2,-1.6],[2.4,-1.8],[6,0],[9.4,1.4],[10,2.8],[-3.6,2.8]]);
    p.F(M.sock[2]); p.poly([[-3.6,1.6],[10,1.8],[10,2.8],[-3.6,2.8]]);
    p.F(M.sock[0]); p.poly([[0,-1.4],[2.4,-1.6],[5.6,0],[5.4,0.8],[2,-0.4]]);
    p.F(M.sandal[1]); p.poly([[-4.2,2.8],[10.6,2.8],[10.4,4.4],[-4,4.4]]); p.F(M.sandal[2]); p.poly([[-4,3.8],[10.4,3.8],[10.4,4.4],[-4,4.4]]); p.F(M.sandal[0]); p.rect(-3.6,2.8,13,0.6);
    p.F(M.sandal[1]); p.poly([[2.6,-1.8],[4,-1.6],[7.6,2.8],[6.2,2.8]]); p.poly([[5.6,-0.4],[7,0.2],[4.6,2.8],[3.2,2.8]]); p.poly([[-3.2,-0.6],[-1.8,-1],[-1.4,2.8],[-2.8,2.8]]);
    p.F(M.sandal[0]); p.rect(3,-1.4,1,0.6); p.F(M.chrome[2]); p.rect(-2.8,0.6,1,1);
    p.F(M.dirt[1]); p.ell(7,2.4,1.4,0.6);
    p.id();
  }
  function drawSmear(c,u,M,sk,P){ // rastro da mochila
    const p=mkPen(c,u); p.id();
    const sh=sk.shB, w=sk.wrB, r=Math.hypot(w.x-sh.x,w.y-sh.y)+14, a1=Math.atan2(w.y-sh.y,w.x-sh.x);
    const n=10, pts=[]; for(let i=0;i<=n;i++){ const a=a1-1.5+1.55*i/n; pts.push([sh.x+Math.cos(a)*r,sh.y+Math.sin(a)*r]); }
    for(let i=n;i>=0;i--){ const a=a1-1.5+1.55*i/n, rr=r-3-10*(i/n); pts.push([sh.x+Math.cos(a)*rr,sh.y+Math.sin(a)*rr]); }
    p.F(M.swish[1]); p.poly(pts.map(([x,y])=>[Math.max(1,Math.min(FW-2,x)),Math.max(1,Math.min(GROUND,y))]));
    p.F(M.swish[2]); const q=pts.slice(n-3,n+1); for(let k=0;k<q.length-1;k++) p.cap({x:q[k][0],y:q[k][1]},{x:q[k+1][0],y:q[k+1][1]},0.9,0.9);
  }

  /* ---------- tronco: camisa florida aberta, regata, colete de bolsos, crachá, pochete ---------- */
  const SHIRT=[[-9,10],[-9.2,0],[-9.6,-10],[-10,-20],[-10.6,-28],[-10.2,-33.4],[-7.6,-37.4],[-2,-39.2],[4,-38.8],[8.4,-36],[10.8,-30],[11.4,-22],[11,-14],[10.6,-6],[10.8,2],[11.2,8],[10,11],[5,9.6],[1,11],[-3,9.6],[-6,11]];
  const OPEN=[[3.6,-38.8],[8.4,-36],[10.8,-30],[11.4,-22],[11,-14],[10.6,-6],[10.8,2],[8.6,2.4],[8,-6],[7.2,-14],[6.2,-24],[4.8,-32]];
  const VEST=[[-8.6,4],[-9,-6],[-9.6,-16],[-10.2,-26],[-9.8,-31],[-7,-33.6],[-4.4,-33],[-5.6,-26],[-5.4,-16],[-4,-6],[-2,2],[4,2.4],[6.4,-6],[7,-14],[7.8,-24],[8.6,-33.2],[10.4,-30],[11.6,-22],[11.4,-14],[11.2,-6],[11.6,3.6],[10.8,6.4],[2,6],[-6,6.4]];
  function drawTorso(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    const shape=W(sk,SHIRT);
    p.F(M.shirt[1]); p.poly(shape);
    clip(c,shape,()=>{
      p.F(M.shirt[0]); p.poly(W(sk,[[2,-34],[6,-39],[11,-32],[12,-22],[11,-16],[8,-20],[5,-28]]));
      p.F(M.shirt[2]); p.poly(W(sk,[[-14,12],[-14,-40],[-7.4,-40],[-8,-30],[-7.2,-18],[-6,-6],[-4,4],[14,4],[14,12]]));
      p.F(M.shirt[3]); p.poly(W(sk,[[-14,12],[-14,-40],[-9.6,-40],[-10,-30],[-9.4,-18],[-8.6,-6],[-8,12]]));
      // estampa: flores laranja e folhas (padrão fixo)
      [[-4,-34,3],[2,-27,3.2],[-6,-19,2.8],[4,-13,3],[-2,-6,2.8],[8,-31,2.6],[-7,6,2.6],[6,6,2.8],[-1,-21,2.4]].forEach(([uu,vv,r])=>{ const q=Wp(sk,uu,vv); flower(p,M,q.x,q.y,r); });
      [[-1,-31,0.9,5],[-8,-26,-0.6,4.6],[6,-20,2.2,5],[-3,-14,1.4,4.4],[2,-2,-0.4,4.8],[-9,-8,0.6,4],[9,-6,2.6,4]].forEach(([uu,vv,a,L])=>{ const q=Wp(sk,uu,vv); leaf(p,M,q.x,q.y,a+sk.sa,L); });
      // dobras e barra
      p.F(M.shirt[2]); [[[-2,-16],[3,-19],[3.6,-18.2],[-1.4,-15.2]],[[0,-26],[5,-28],[5.4,-27.2],[0.4,-25.2]],[[-4,-30],[-1,-32],[-0.6,-31.2],[-3.6,-29.4]]].forEach(f=>p.poly(W(sk,f)));
      p.F(M.shirt[3]); p.poly(W(sk,[[-14,8.6],[15,8.6],[15,12],[-14,12]]));
      p.F(M.dirt[1]); [[-1,6,3,1.6],[-6.4,-10,1.4,2]].forEach(([uu,vv,a,b])=>{ const q=Wp(sk,uu,vv); p.ell(q.x,q.y,a,b); });
      if(form==='plenilunar'){ p.F(M.blood[1]); p.poly(W(sk,[[-6,-20],[2,-24],[4,-8],[-2,-2],[-7,-6]])); p.F(M.blood[2]); p.poly(W(sk,[[-4,-12],[2,-14],[3,-6],[-2,-3]])); }
    });
    // abertura: regata suja e peito podre
    const op=W(sk,OPEN);
    clip(c,op,()=>{ p.F(M.tank[1]); p.poly(op);
      p.F(M.tank[2]); p.poly(W(sk,[[3,-40],[6,-40],[8,-28],[8.6,-14],[8.6,3],[3,3]]));
      p.F(M.tank[0]); p.poly(W(sk,[[9.6,-30],[11,-26],[11.2,-18],[10.2,-18]]));
      p.F(M.skin[1]); p.poly(W(sk,[[5,-39],[9,-37],[9.6,-33],[7,-33],[5.4,-35]])); // pescoço/peito no decote
      p.F(M.rot[1]); p.ell(Wp(sk,9.6,-12).x,Wp(sk,9.6,-12).y,1.8,2.6); p.F(M.flesh[2]); { const q=Wp(sk,9.8,-12); p.ell(q.x,q.y,1,1.6); } p.F(M.bone[1]); { const q=Wp(sk,10,-13); p.rect(q.x-0.8,q.y,1.6,0.6); }
      p.F(M.dirt[1]); { const q=Wp(sk,9.6,-4); p.ell(q.x,q.y,1.6,1.2); }
      p.F(M.blood[1]); { const q=Wp(sk,10.4,-22); p.ell(q.x,q.y,1.2,1.8); }
    });
    // gola da camisa aberta (lapela mole)
    p.F(M.shirt[2]); p.poly(W(sk,[[3.6,-39],[5,-33],[6.4,-26],[7.4,-16],[8,-6],[8.6,2.4],[7,2.4],[6.4,-8],[5.4,-20],[3.6,-31],[2.4,-37]]));
    p.F(M.shirt[0]); p.poly(W(sk,[[8.4,-36],[10.8,-30],[11,-27.6],[9,-31.4],[7.6,-34.4]]));
    // colete de viagem (por cima), com cava e bolsos
    const vs=W(sk,VEST);
    p.F(M.vest[1]); p.poly(vs);
    clip(c,vs,()=>{
      p.F(M.vest[2]); p.poly(W(sk,[[-14,10],[-14,-36],[-6,-36],[-7,-26],[-6.6,-14],[-5,-4],[-3,8]]));
      p.F(M.vest[3]); p.poly(W(sk,[[-14,10],[-14,-36],[-9,-36],[-9.4,-24],[-8.6,-12],[-7.6,10]]));
      p.F(M.vest[0]); p.poly(W(sk,[[8.6,-33],[10.6,-30],[11.8,-22],[10.6,-22],[9.2,-28]]));
      p.F(M.vest[3]); p.poly(W(sk,[[-14,4.6],[14,4.6],[14,8],[-14,8]]));
      // bolsos do peito (aba + botão) e de baixo
      const pocket=(u0,v0,w,h)=>{ p.F(M.vest[2]); p.poly(W(sk,[[u0,v0],[u0+w,v0],[u0+w,v0+h],[u0,v0+h]])); p.F(M.vest[1]); p.poly(W(sk,[[u0+0.4,v0+1.6],[u0+w-0.4,v0+1.6],[u0+w-0.4,v0+h-0.4],[u0+0.4,v0+h-0.4]]));
        p.F(M.vest[0]); p.poly(W(sk,[[u0,v0],[u0+w,v0],[u0+w,v0+0.5],[u0,v0+0.5]])); p.F(M.vest[3]); p.poly(W(sk,[[u0,v0+1.4],[u0+w,v0+1.4],[u0+w,v0+1.8],[u0,v0+1.8]])); p.F(M.chrome[2]); { const q=Wp(sk,u0+w/2,v0+1); p.rect(q.x-0.5,q.y-0.5,1,1); } };
      pocket(7.6,-26,3.8,6); pocket(6.6,-8,4.8,7); pocket(-3.4,-6,4,7);
      // costuras e argola (D-ring)
      p.F(M.vest[2]); p.poly(W(sk,[[-4,-32],[-3.4,-32],[-2,2],[-2.6,2]]));
      p.F(M.chrome[1]); { const q=Wp(sk,9.4,-30.4); p.rect(q.x-0.8,q.y-0.6,1.6,1.2); }
      // fotos impressas grudadas como carne (uma descolando)
      p.F(M.photo[1]); p.poly(W(sk,[[-8.6,-22],[-5,-22.6],[-4.6,-17.4],[-8.2,-17]])); p.F(M.photo[2]); p.poly(W(sk,[[-8,-21.2],[-5.4,-21.6],[-5.2,-19],[-7.8,-18.6]]));
      p.F(M.flesh[1]); p.poly(W(sk,[[-7.6,-20.8],[-6,-21],[-5.8,-19.4],[-7.4,-19.2]])); p.F(M.flesh[2]); p.poly(W(sk,[[-7.6,-19.8],[-5.8,-20],[-5.8,-19.4],[-7.4,-19.2]]));
      p.F(M.photo[0]); p.poly(W(sk,[[-1.4,-14],[1.8,-13.2],[1,-9.2],[-2,-10]])); p.F(M.photo[2]); p.poly(W(sk,[[-0.8,-13.2],[1.2,-12.6],[0.8,-10.6],[-1.2,-11.2]])); p.F(M.blood[1]); { const q=Wp(sk,0.2,-11.8); p.ell(q.x,q.y,0.8,0.6); }
      p.F(M.dirt[1]); [[-6,0,2,1.2],[9,-2,1.6,1]].forEach(([uu,vv,a,b])=>{ const q=Wp(sk,uu,vv); p.ell(q.x,q.y,a,b); });
      p.F(M.blood[1]); [[10,-16,1.4,1],[8.4,-12,0.9,0.8]].forEach(([uu,vv,a,b])=>{ const q=Wp(sk,uu,vv); p.ell(q.x,q.y,a,b); });
      if(form!=='comum'){ p.F(M.glow[1]); p.poly(W(sk,[[-6,-14],[-3,-9],[-3.6,-8.4],[-6.4,-13.4]])); }
    });
    // rasgo nas costas do colete com costelas
    p.F(M.vest[3]); p.poly(W(sk,[[-10,-14],[-7,-15.4],[-5.6,-11],[-6.4,-6],[-9.4,-6.6]]));
    p.F(M.flesh[3]); p.poly(W(sk,[[-9.6,-13.4],[-7.2,-14.6],[-6.2,-11],[-6.8,-7],[-9.2,-7.4]]));
    p.F(M.flesh[2]); p.poly(W(sk,[[-9,-12.6],[-7.4,-13.4],[-6.8,-11],[-7.2,-8],[-8.8,-8.4]]));
    p.F(form==='plenilunar'?M.bone[0]:M.bone[1]); [[-11.6],[-9.4]].forEach(([v])=>p.poly(W(sk,[[-9,v],[-6.6,v-0.6],[-6.6,v],[-9,v+0.6]])));
    // alça da mochila sobre o ombro
    p.F(M.strap[1]); p.poly(W(sk,[[-4.4,-38],[-1.6,-38.4],[-2.4,-26],[-4,-14],[-6,-14.4],[-4.8,-26]]));
    p.F(M.strap[0]); p.poly(W(sk,[[-3.4,-37.8],[-2.4,-37.8],[-3.2,-26],[-4,-26]]));
    p.F(M.chrome[2]); p.poly(W(sk,[[-5.8,-20],[-3.4,-20],[-3.6,-18.4],[-6,-18.4]]));
    // cordão do crachá e crachá "GRUPO" (sem marca: só faixa colorida e linhas)
    p.F(M.lanyard[1]); p.poly(W(sk,[[4,-38.4],[5,-38.4],[6,-28],[5.4,-24],[4.6,-24],[5,-28]])); p.poly(W(sk,[[7.6,-36.6],[8.6,-36],[7,-28],[6,-24],[5.4,-24.4],[6.4,-28.6]]));
    p.F(M.lanyard[0]); p.poly(W(sk,[[4.4,-37],[4.8,-37],[5.6,-29],[5.2,-29]]));
    { const b=W(sk,[[3.2,-24.4],[8.4,-24.8],[8.6,-17.6],[3.4,-17.2]]); p.F(M.badge[1]); p.poly(b);
      p.F(M.badge[2]); p.poly(W(sk,[[3.2,-18.4],[8.6,-18.8],[8.6,-17.6],[3.4,-17.2]]));
      p.F(M.lanyard[1]); p.poly(W(sk,[[3.4,-23.8],[8.4,-24.2],[8.4,-22.4],[3.4,-22]]));
      p.F(M.badge[3]); p.poly(W(sk,[[4.2,-21],[7.6,-21.2],[7.6,-20.6],[4.2,-20.4]])); p.poly(W(sk,[[4.2,-19.8],[6.4,-19.9],[6.4,-19.4],[4.2,-19.3]]));
      p.F(M.blood[1]); { const q=Wp(sk,7.4,-19); p.ell(q.x,q.y,0.9,0.7); } }
    // pochete na frente (cintura), alça em volta
    p.F(M.strap[1]); p.poly(W(sk,[[-10,1],[11,0.6],[11,2.4],[-10,2.8]]));
    { p.F(M.pack[1]); p.poly(W(sk,[[5,-2.2],[12.4,-2.6],[13.6,0.4],[13.4,4.4],[11.6,5.6],[5.6,5.6],[4.4,3.6],[4.4,0]]));
      p.F(M.pack[2]); p.poly(W(sk,[[4.4,2.8],[13.4,2.6],[13.4,4.4],[11.6,5.6],[5.6,5.6],[4.4,3.6]]));
      p.F(M.pack[0]); p.poly(W(sk,[[6,-2],[12,-2.4],[12.6,-1.4],[6.4,-1.2]]));
      p.F(M.strap[2]); p.poly(W(sk,[[5,0.4],[13.4,0],[13.4,0.6],[5,1]])); p.F(M.chrome[1]); { const q=Wp(sk,11.6,0.4); p.rect(q.x-0.5,q.y-0.6,1,1.4); }
      p.F(M.photo[1]); p.poly(W(sk,[[7,-2.4],[9.6,-2.6],[9.4,-0.2],[7.2,0]])); /* mapa dobrado saindo */ p.F(M.print[1]); { const q=Wp(sk,8.2,-1.6); p.rect(q.x-0.5,q.y-0.4,1,0.6); } }
  }
  // fita de câmera enrolada no pescoço (por cima da cabeça/pescoço)
  function drawNeckTape(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    p.F(M.tape[1]); p.poly(W(sk,[[-2,-40.2],[7,-39.8],[7.6,-37.6],[-1.6,-37.8]]));
    p.F(M.tape[0]); p.poly(W(sk,[[0,-40],[5,-39.8],[5,-39.2],[0,-39.4]]));
    p.F(M.tape[2]); p.poly(W(sk,[[-1.6,-38.4],[7.4,-38.2],[7.6,-37.6],[-1.6,-37.8]]));
    // ponta solta pendurada
    const sw=Math.sin(P.hx*0.7+P.lean*0.08)*0.8;
    p.F(M.tape[1]); p.poly(W(sk,[[6,-38],[7.4,-37.8],[8.6+sw,-33],[7.6+sw,-32.6]]));
    p.F(M.tape[0]); p.poly(W(sk,[[6.4,-37.8],[6.8,-37.8],[8+sw,-33.4],[7.6+sw,-33.2]]));
    if(form!=='comum'){ p.F(M.glow[1]); { const q=Wp(sk,3,-39); p.rect(q.x-0.6,q.y-0.4,1.2,0.6); } }
  }

  /* ---------- cabeça: rosto magro, óculos escuros quebrados na testa, olhos de lua ---------- */
  function drawHead(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.xf(sk.ha,sk.neck.x,sk.neck.y); c.scale(HS,HS);
    p.F(M.skin[1]); p.poly([[-3.6,4],[4.2,4],[4.8,-4],[-3.2,-6]]);
    p.F(M.skin[2]); p.poly([[-3.6,4],[-0.4,4],[-1,-5.4],[-3.2,-6]]);
    p.F(M.vein[1]); p.rect(2,-3,0.7,5);
    // crânio (testa alta, rosto comprido)
    p.F(M.skin[1]); p.ell(2.2,-12.6,9,9.4);
    p.poly([[-3.4,-6],[10.6,-7.6],[11.8,-4.4],[6,-2.6],[-2,-3]]);
    p.F(M.skin[2]); p.poly([[-7,-15],[-4.8,-6],[0,-2.6],[6,-2.6],[2,-5],[-2,-9],[-3,-14],[-5.4,-18]]);
    p.F(M.skin[3]); p.poly([[-7,-14],[-6.2,-9],[-4.2,-5.2],[-4.8,-11]]);
    p.F(M.skin[0]); p.poly([[5,-8.4],[9.2,-9],[8.4,-7.8],[5.4,-7.6]]);
    // bochecha funda (podre) e orelha
    p.F(M.skin[2]); p.poly([[4.2,-7],[8.4,-6.4],[7.4,-4.4],[4.6,-4.8]]);
    p.F(M.skin[1]); p.ell(-2.6,-11.2,2.2,3); p.F(M.skin[3]); p.ell(-2.4,-11,1,1.7); p.F(M.flesh[2]); p.rect(-3.6,-8.8,1.1,1.2);
    // cabelo ralo saindo debaixo do chapéu, costeleta grisalha
    const hatOn=P.hdrop<0.5;
    p.F(M.hair[1]); p.poly([[-7.6,-14.4],[-6.4,-17.4],[-1,-18],[-2.6,-15.4],[-5,-11.6],[-7.4,-9.8]]);
    p.F(M.hair[0]); p.rect(-6,-14.4,2.2,0.6); p.poly([[-1.2,-15.6],[0.4,-15.8],[0.4,-10.6],[-0.6,-11]]);
    if(!hatOn){ p.F(M.skin[1]); p.ell(2,-18.6,8,4.2); p.F(M.hair[1]); p.poly([[-6,-19],[-2,-22],[4,-22.4],[8,-20],[3,-20.4],[-2,-19.6]]); p.F(M.rot[1]); p.ell(4,-20,2,1); }
    // sobrancelha franzida, olho de lua arregalado
    p.F(M.hair[1]); p.poly([[4.6,-12.8],[8.4,-12.4],[11.6,-13.2],[11.6,-12.4],[8.4,-11.6],[4.8,-12]]);
    p.F(M.skin[3]); p.ell(8.2,-9.8,2.6,2.1);
    p.F(M.eye[1]); p.ell(8.6,-9.6,1.9,1.5);
    p.F(M.eye[0]); p.rect(8.4,-10,1,0.8); p.F(M.eye[2]); p.rect(9.4,-9.4,0.7,0.6);
    p.F(M.skin[3]); p.ell(12,-9.8,0.9,1.3); p.F(M.eye[1]); p.rect(11.7,-10.1,0.8,0.9);
    // nariz queimado de sol (ponta descascando)
    p.F(M.skin[1]); p.poly([[11,-10.4],[14.4,-6.6],[13.4,-5.6],[11.2,-6.2]]);
    p.F(M.flesh[1]); p.rect(13,-7.2,1.2,1); p.F(M.skin[3]); p.rect(12.6,-6.2,1.2,0.8);
    // óculos escuros quebrados empurrados pra testa (uma lente faltando, haste torta)
    p.F(M.glass[1]); p.poly([[4.4,-15.2],[8.6,-15.6],[8.8,-13.2],[5,-13]]);
    p.F(M.glass[0]); p.rect(5.2,-15,1.6,0.6);
    p.F(M.strap[2]); p.poly([[8.6,-14.8],[10.6,-14.8],[10.6,-14.2],[8.6,-14.2]]);
    p.F(M.strap[2]); p.poly([[10.6,-15.4],[13.6,-15.6],[13.6,-12.8],[10.8,-13]]); p.F(M.skin[1]); p.poly([[11.2,-14.8],[13,-15],[12.6,-13.4],[11.4,-13.6]]); // aro vazio
    p.F(M.glass[2]); p.poly([[6.4,-15.4],[7,-15.4],[5.8,-13.2],[5.4,-13.4]]); // trinca
    p.F(M.strap[2]); p.poly([[4.4,-14.6],[-1.6,-15.6],[-1.4,-14.8],[4.4,-14]]);
    // boca
    p.F(M.mouth[1]); p.poly([[5,-5],[13,-5.2],[12.8,-2.4],[5,-2.2]]);
    p.F(M.teeth[1]); [[6.6,-5.2,1.2,1.6],[8.2,-5.2,1.2,1.4],[9.8,-5.2,1.2,1.7],[11.4,-5.2,1,1.3]].forEach(([x,y,w,h])=>p.rect(x,y,w,h));
    p.F(M.rot[1]); p.ell(1,-8,1.6,1.2); p.F(M.rot[2]); p.rect(0.4,-8.4,1,0.9);
    if(form!=='comum'){ p.F(M.glow[0]); p.rect(8,-10,1.6,1); p.F(M.glow[1]); p.rect(11.7,-10.1,0.8,0.9); }
    p.id();
    if(hatOn){ const o=sk.H(2.4,-17); hatAt(c,p,M,form,o.x,o.y,sk.ha+rad(P.ht),HS,{}); }
  }
  function drawJaw(c,u,M,sk,P){
    const p=mkPen(c,u); const h=sk.H(2.6,-3.6); p.xf(sk.ha+rad(P.jaw),h.x,h.y); c.scale(HS,HS);
    p.F(M.skin[1]); p.poly([[-2,-1.4],[10.4,-0.8],[11.2,1.6],[10.2,5.4],[6,7],[0.6,6],[-2.4,2.8]]);
    p.F(M.skin[2]); p.poly([[-2.4,2.8],[0.6,6],[6,7],[10.2,5.4],[8.6,4.6],[4,5],[0,3.4]]);
    p.F(M.skin[3]); p.poly([[1,6],[6,7],[9,6],[4,6]]);
    p.F(M.mouth[1]); p.poly([[2.6,-0.8],[9.6,-0.4],[9.6,1.4],[3,1.2]]);
    p.F(M.teeth[1]); [[4.2,-1,1.2,1.5],[5.8,-1,1.2,1.9],[7.4,-1,1.2,1.5]].forEach(([x,y,w,h])=>p.rect(x,y,w,h));
    p.F(M.hair[2]); [[3,3.6],[5,4.4],[7,4.2],[8.8,3.6]].forEach(([x,y])=>p.rect(x,y,0.7,0.6)); // barba por fazer
    const L=2+(P.drool%4)*1.2+(P.jaw>30?2:0);
    p.F(M.blood[1]); p.poly([[9.2,4.8],[10.6,4.2],[10.4,4.2+L],[9.8,5.2+L]]); p.ell(10.1,5.2+L,1,1);
    p.id();
  }
  function drawMouthIn(c,u,M,sk,P){
    if(P.jaw<16) return; const p=mkPen(c,u); p.id();
    const a=sk.H(5,-2.4), b=sk.H(12.8,-2.6), h=sk.H(2.6,-3.6), ja=sk.ha+rad(P.jaw), jc=Math.cos(ja), js=Math.sin(ja);
    const J=(x,y)=>({x:h.x+(x*jc-y*js)*HS,y:h.y+(x*js+y*jc)*HS}), d=J(10,0.6), e=J(3,0.6);
    p.F(M.mouth[2]); p.poly([[a.x,a.y],[b.x,b.y],[d.x,d.y],[e.x,e.y]]);
    p.F(M.mouth[3]); const m=lerp(lerp(a,b,0.3),lerp(e,d,0.3),0.5); p.circle(m,1.6);
  }
  function drawLooseCam(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id(); const x=AX+P.cdx, y=GROUND-9-P.cdy;
    // alça arrastando
    p.F(M.strap[1]); p.cap({x:x-8,y:GROUND-1},{x:x-2,y:y+3},0.8,0.8);
    drawCamera(c,p,M,form,x,y,rad(P.cdr),false);
  }
  function drawLooseHat(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id(); hatAt(c,p,M,form,AX-30,GROUND-10,rad(-8),HS,{});
  }

  /* ---------- montagem ---------- */
  const cache=PIX.cache();
  function frame(form,anim,fi,step=5,Pov,pk){
    const K=PIX.getK(), key=(pk!=null?'#'+pk+'|'+form:form+'|'+anim+'|'+fi+'|'+step)+'@'+K;
    const hit=cache.get(key); if(hit){ cache.delete(key); cache.set(key,hit); return hit; }
    const P=Pov?Object.assign({},REST,Pov):poseOf(anim,fi), M=mats(form), sk=skeleton(P);
    const parts=[];
    if(P.bag<0.5) parts.push({back:true, draw:(c,u)=>drawArm(c,u,M,sk,P,false,form)}, {draw:(c,u)=>packOnBack(c,u,M,sk,P,form)});
    parts.push(
      {back:true, draw:(c,u)=>drawLeg(c,u,M,sk,P,false)},
      {draw:(c,u)=>drawLeg(c,u,M,sk,P,true)},
      {draw:(c,u)=>drawTorso(c,u,M,sk,P,form)},
      {draw:(c,u)=>{ drawHead(c,u,M,sk,P,form); drawMouthIn(c,u,M,sk,P); }},
      {draw:(c,u)=>drawJaw(c,u,M,sk,P)},
      {draw:(c,u)=>drawNeckTape(c,u,M,sk,P,form)});
    if(P.smear>=0.5) parts.push({noShade:true, smear:true, noRim:true, draw:(c,u)=>drawSmear(c,u,M,sk,P)});
    if(P.bag>=0.5) parts.push({draw:(c,u)=>drawArm(c,u,M,sk,P,false,form)}); // mochila na mão: braço de trás passa pra frente no giro
    if(P.cloose>=0.5) parts.push({draw:(c,u)=>drawLooseCam(c,u,M,sk,P,form)});
    else parts.push({draw:(c,u)=>drawCamStrap(c,u,M,sk,P)}, {draw:(c,u)=>drawArm(c,u,M,sk,P,true,form)});
    if(P.hdrop>=0.5) parts.push({draw:(c,u)=>drawLooseHat(c,u,M,sk,P,form)});
    // clarão do flash (na sapata da câmera, ou na câmera caída)
    let fx=null;
    if(P.fl>0){ fx=P.cloose>=0.5?(()=>{ const a=rad(P.cdr), x=AX+P.cdx, y=GROUND-9-P.cdy; return {x:x+(3.3*Math.cos(a)+6.4*Math.sin(a))*1.45, y:y+(3.3*Math.sin(a)-6.4*Math.cos(a))*1.45}; })():sk.CW(4.8,-6.4);
      const k=P.fl>=1?1:0.55; parts.push({noShade:true, noRim:true, draw:(c,u)=>drawBurst(c,u,M,fx.x,fx.y,k)}); }
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM[form]}); if(step>=4) heavyOutline(cv);
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._eye=sc(sk.H(8.6,-9.6)); cv._mouth=sc(sk.H(10,-2)); cv._hand=sc(sk.wrF); cv._head=sc(sk.H(3,-13)); cv._handB=sc(sk.wrB);
    cv._lens=sc(sk.CW(9.6,-0.4)); if(fx) cv._flash=sc(fx);
    cache.set(key,cv); if(cache.size>900) cache.delete(cache.keys().next().value);
    return cv;
  }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame,framePose:function(form,anim,P,key){ return frame(form,anim,0,5,P,key); }};
})();
