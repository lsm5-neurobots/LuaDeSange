/* BAIANA — fonte de arte (editável). Build: npm run art
   Zumbi Baiana do Acarajé (variante local do Pelourinho): trabalhadora de rua de Salvador tomada pela Lua.
   O foco é o OFÍCIO (patrimônio imaterial): turbante branco alto, bata de renda branca com babado no decote
   (ombro rasgado), saia rodada em sino com três camadas de babado (barra queimada e manchada de dendê), avental
   com bolso, pano da costa listrado no ombro, contas simples e neutras, pulseiras de metal, chinelo de couro.
   Carrega o TABULEIRO de madeira (com toalhinha de renda, acarajés queimados e a panela de dendê fervendo) na mão
   de trás, na altura da cintura, como defesa da frente; na mão da frente, a concha grande.
   Nada de objeto/símbolo ritual nem referência a entidade ou religião (design próprio, como o Malandro).
   Golpes: conchada (attack), tabuleirada (bash, empurra), panela de dendê (splash: ergue a panela e arremessa o
   dendê fervendo em arco; adereço xDende), reabastecimento (refill: põe a panela de volta e mexe, ~1 s, aberta).
   Hi-bit: honra PIX.getK(). */
const BAIANA=(function(){
  const {rad,lerp,P2,mkPen,compose}=PIX;
  const FW=216, FH=164, GROUND=154, AX=92;
  const RIM={comum:'#d8e4f4', enluarado:'#9ff6ff', plenilunar:'#ffb46a'};

  /* ---------- materiais ---------- */
  function mats(form){
    const m={
      skin:['#8a8a74','#55493f','#35282b','#1c1218'],
      vein:['#e4f0b0','#a8c87a','#6a8a5a','#3a4a3a'],
      rot:['#8c8c6a','#626048','#423e38','#26222a'],
      flesh:['#e89a88','#b0525a','#70304a','#40182e'],
      bone:['#fff4d8','#dccfa6','#a09070','#605040'],
      lace:['#fff6e6','#d9cfe6','#9a8cc0','#5a4c86'],
      skirt:['#fff6e6','#d6cce4','#968abf','#574a86'],
      apron:['#fbeedc','#cfc0d0','#8e80aa','#4e4278'],
      soot:['#8e8496','#5e566a','#3c3648','#221e2c'],
      dende:['#ffd070','#ec841e','#b8500c','#6a2608'],
      wood:['#d29a60','#965f32','#62391c','#36200e'],
      akara:['#f6b462','#c8681e','#8a3c12','#4c1e08'],
      iron:['#b29a8c','#5a3c36','#321e20','#160a0e'],
      steel:['#f2f6fc','#bcc4d0','#78829a','#3e4454'],
      blue:['#7ac4ff','#1f6ee8','#163fa8','#0c1c5e'],
      yel:['#fff27a','#ffcc1a','#d08a10','#7a420a'],
      red:['#ff8a6a','#e0282a','#9a1024','#520818'],
      bead:['#fffaf0','#e8dcc4','#9c8670','#4a3c30'],
      beadD:['#d29a6a','#8a4e2c','#562a18','#2a140c'],
      metal:['#fff6d8','#dcc690','#9a8458','#5a4a30'],
      leather:['#c48c5c','#8a5a36','#5a3a22','#321e12'],
      eye:['#ffffff','#fffbd0','#ffe066','#c8901c'],
      mouth:['#5a2030','#34101e','#1e0812','#10040a'],
      tongue:['#5c5462','#2e2834','#1c1822','#0e0c12'],
      teeth:['#f6eac0','#d0bc80','#968450','#5a4c30'],
      blood:['#b8443e','#7e1424','#560c1e','#340814'],
      smoke:['#f6f2f2','#d2cad8','#9c96aa','#686078'],
      glow:['#fffbe0','#ffe08a','#e8a040','#9a5a20'],
      swish:['#fdfdff','#e6f0ff','#b4c4e8','#7484b0'],
      hair:['#3c3640','#221e26','#16121a','#0c0a10'],
      nail:['#a89a8c','#6a5c58','#42363a','#221a1e'],
    };
    if(form==='enluarado'){
      m.skin=['#aeacd0','#7a76a2','#4e4876','#2a244a']; m.vein=['#d8fdff','#7af4ff','#2ab0d8','#146a96'];
      m.rot=['#a898d0','#7a68a6','#4e407e','#2c2454']; m.flesh=['#f0b0ff','#b866d8','#7a3a9e','#46206a']; m.blood=['#b46ad8','#7e3ea6','#542474','#34144a'];
      m.lace=['#f4f6ff','#c6c0f0','#8478c8','#463a8a']; m.skirt=['#f0f2ff','#c0b8ec','#7e72c2','#423684']; m.apron=['#e8eaff','#b4acdc','#766cb0','#3e3478'];
      m.dende=['#dcfff6','#5ae8d0','#1fa0a0','#0e5466']; m.soot=['#8a8cb4','#5a5a88','#3a3866','#201e40'];
      m.eye=['#ffffff','#c8fbff','#4ad8f0','#1a8aa8']; m.glow=['#effffe','#7af4ff','#2ab0d8','#146a96']; m.swish=['#ffffff','#c8fbff','#6ae4f4','#2a9ab8'];
      m.blue=['#a8e6ff','#4aa8e8','#2a64a8','#163466']; m.yel=['#e8f4ff','#a8c8f0','#6a84b8','#384878'];
      m.akara=['#c8b8e8','#8a74b8','#56448a','#2e2458']; m.smoke=['#f0fbff','#bcecf6','#7ab0cc','#4a6c96'];
    }
    if(form==='plenilunar'){
      m.skin=['#d8a48c','#a4645a','#6c3442','#3a1628']; m.vein=['#fff0a0','#ffb43a','#e0581e','#8a2414'];
      m.rot=['#d0806a','#9a4a4a','#682a3a','#3e1628']; m.flesh=['#ffc07a','#f06a3a','#a8302e','#5e1422']; m.blood=['#ff7a3a','#d43a26','#8a1c22','#4e0c18'];
      m.lace=['#fff0d8','#e8b8a8','#a8607a','#5e2a4a']; m.skirt=['#ffe8c8','#e6a890','#a0546a','#58223e']; m.apron=['#fbd8bc','#d49a8a','#8e4e64','#4e2238'];
      m.dende=['#ffe680','#ff5a1e','#c0200e','#6a0a08']; m.soot=['#a46a5a','#6e3c3a','#46222c','#26101c'];
      m.eye=['#fffbe0','#ffe04a','#ff8a2a','#b83a14']; m.glow=['#fff6c0','#ffb43a','#e0581e','#8a2414']; m.swish=['#fffbe6','#ffe6a8','#ffb460','#d0602a'];
      m.iron=['#b0868a','#5e3a42','#3a2028','#1e0c14']; m.smoke=['#fff0dc','#e8c0a8','#a87a72','#6a4048'];
      m.akara=['#ffb05a','#e05a1a','#9a2a10','#541208'];
    }
    return punch(m);
  }
  const NAMES={red:'Pano da costa (vermelho)',skin:'Pele',vein:'Veias',rot:'Podridão',flesh:'Carne',bone:'Osso',lace:'Renda da bata e do turbante',skirt:'Saia rodada',apron:'Avental',soot:'Fuligem',dende:'Dendê fervendo',wood:'Madeira do tabuleiro',akara:'Acarajé',iron:'Panela de ferro',steel:'Concha',blue:'Pano da costa (azul)',yel:'Pano da costa (amarelo)',bead:'Contas claras',beadD:'Contas de madeira',metal:'Pulseira/argola',leather:'Chinelo de couro',eye:'Olho de lua',mouth:'Boca',tongue:'Língua',teeth:'Dentes',blood:'Sangue',smoke:'Fumaça',glow:'Brilho',swish:'Rastro do golpe',hair:'Cabelo',nail:'Unha'};
  function sat(h,k){ const [r,g,b]=PIX.hexRgb(h), y=(r+g+b)/3; return PIX.toHex(y+(r-y)*k,y+(g-y)*k,y+(b-y)*k); }
  const NOPUNCH={swish:1,glow:1,eye:1,smoke:1};
  function punch(m){ const o={}; for(const k in m){ const r=m[k]; const q=NOPUNCH[k]?[r[0],r[1],r[2],r[3]]:[sat(r[0],1.08),sat(r[1],1.14),PIX.mix(sat(r[2],1.1),'#2a1a4c',0.18),PIX.mix(r[3],'#140a24',0.32)]; q.push(PIX.mix(PIX.mix(q[1],q[2],0.5),'#4a3a7a',0.08)); o[k]=q; } return o; }

  /* ---------- poses ---------- */
  // ângulos: 0 = pendurado, + = pra frente. rz = ângulo da concha somado ao do antebraço; cz = concha na mão.
  // ta = inclinação do tabuleiro; pot: 1 = panela no tabuleiro, 2 = panela na mão da frente, 0 = sem panela;
  // pa = giro da panela na mão; pf = quanto de dendê tem na panela (0..1); dpour = jato de dendê saindo;
  // stm = fase da fumaça/bolhas; sw = balanço da saia; tl/tdx/tdy/tdr = tabuleiro caído (morte); spill = poça; pdx = panela rolando.
  const REST={hx:0,rot:0,lift:0,lean:-3,hunch:0,head:-2,jaw:6,aFs:52,aFe:104,aBs:12,aBe:94,rz:-74,cz:1,lFh:6,lFk:-2,lBh:-6,lBk:-10,fF:0,fB:0,
    ta:0,pot:1,pa:0,pf:1,dpour:0,stm:0,sw:0,smear:0,tsmear:0,flash:0,drool:0,tl:0,tdx:0,tdy:0,tdr:0,spill:0,pdx:0,pr:0};
  const S=Math.sin, C=Math.cos, PI=Math.PI, mx=Math.max;
  const ANIMS={
    idle:{nome:'Parado (mexe o tacho com a concha)',n:8,dur:()=>140,pose:i=>{ const p=i/8*PI*2, s=S(p);
      return {hx:0.8*s, lean:-3+1.2*S(p+0.6), hunch:0.6*S(2*p), head:-2+2*S(p-0.8), jaw:5+4*mx(0,S(p)), drool:i%4, stm:i,
        aFs:52+6*s, aFe:104+12*C(p), rz:-74+10*S(p+1), aBs:14-2*s, aBe:96+3*s, ta:1.5*S(p), sw:1.2*S(p),
        lFh:6+2*s, lFk:-2+2*s, lBh:-6-2*s, lBk:-10+2*s}; }},
    walk:{nome:'Andar (passo largo, a saia balança)',n:8,dur:()=>134,pose:i=>{ const p=i/8*PI*2;
      const lFh=8+15*S(p), lBh=-8+12*S(p+PI);
      return {lFh, lFk:lFh-18*mx(0,C(p))-3, lBh, lBk:lBh-8-10*mx(0,C(p+PI)), fF:-10*mx(0,C(p)), fB:18*mx(0,C(p+PI)),
        lean:-1+1.5*S(p), hunch:1+1.2*S(2*p-0.6), head:-2+2.4*S(2*p-1.4), jaw:7+3*S(2*p-1.8), hx:1.2*S(p), lift:1*mx(0,S(2*p)),
        aFs:26+12*S(p+PI), aFe:84+10*S(p+PI), rz:96+8*S(p), aBs:14+5*S(p), aBe:96+4*S(p), ta:3*S(2*p), sw:-4*S(p), stm:i, drool:i%4}; }},
    alert:{nome:'Alerta (ergue a concha e rosna)',n:6,dur:i=>[160,130,120,220,160,150][i],pose:i=>[
      {},
      {head:2,jaw:14,lean:-3,aFs:110,aFe:150,rz:40,hx:-1},
      {head:6,jaw:30,lean:-6,aFs:160,aFe:190,rz:20,hx:-2,sw:2},
      {head:8,jaw:40,lean:-7,aFs:168,aFe:196,rz:10,hx:-2,ta:-4,sw:3,drool:2},
      {head:2,jaw:30,lean:-2,aFs:120,aFe:150,rz:50,ta:-2},
      {jaw:16,aFs:40,aFe:96,rz:90}][i]},
    // ---- golpes (IA escolhe por distância/peso; hit = quadro do dano, reach = alcance em px) ----
    attack:{nome:'Conchada',n:8,hit:3,reach:36,dur:i=>[90,110,40,80,110,120,130,140][i],pose:i=>[
      {lean:-6,hunch:3,head:2,jaw:16,aFs:130,aFe:190,rz:40,hx:-2,lFh:10,lBh:-10,sw:2},
      {lean:-12,hunch:1,head:6,jaw:28,aFs:156,aFe:226,rz:50,hx:-4,lFh:12,lFk:-6,lBh:-12,lBk:-20,sw:4,ta:-3},
      {lean:12,hunch:10,head:-8,jaw:34,aFs:116,aFe:126,rz:10,smear:1,hx:3,lFh:18,lBh:-16,sw:-2},
      {lean:20,hunch:14,head:-12,jaw:22,aFs:86,aFe:84,rz:-4,smear:1,hx:6,lFh:22,lFk:2,lBh:-18,lBk:-26,fB:8,sw:-5},
      {lean:22,hunch:16,head:-10,jaw:18,aFs:58,aFe:30,rz:-20,hx:6,lFh:22,lFk:2,lBh:-18,lBk:-26,fB:8,sw:-4},
      {lean:14,hunch:12,head:-6,jaw:14,aFs:44,aFe:40,rz:-40,hx:4,lFh:16,lBh:-12,sw:-2},
      {lean:6,hunch:8,head:-4,jaw:10,aFs:40,aFe:80,rz:20,hx:2},
      {lean:3,jaw:8,aFs:34,aFe:90,rz:80}][i]},
    bash:{nome:'Tabuleirada (empurra com o tabuleiro)',n:8,hit:3,reach:40,dur:i=>[120,130,50,90,120,120,130,140][i],pose:i=>[
      {lean:-6,hunch:4,head:2,jaw:14,aBs:-16,aBe:52,ta:12,hx:-2,aFs:30,aFe:80,rz:90,lFh:10,lBh:-10,sw:2},
      {lean:-12,hunch:2,head:4,jaw:24,aBs:-34,aBe:30,ta:18,hx:-4,aFs:20,aFe:60,rz:90,lFh:14,lFk:-4,lBh:-14,lBk:-22,sw:4},
      {lean:12,hunch:8,head:-6,jaw:30,aBs:40,aBe:98,ta:-6,hx:4,tsmear:1,aFs:40,aFe:100,rz:80,lFh:20,lBh:-16,sw:-3},
      {lean:20,hunch:12,head:-10,jaw:36,aBs:66,aBe:92,ta:-14,hx:8,tsmear:1,aFs:50,aFe:110,rz:70,lFh:26,lFk:4,lBh:-22,lBk:-30,fB:10,sw:-6},
      {lean:22,hunch:12,head:-10,jaw:28,aBs:70,aBe:88,ta:-16,hx:9,aFs:50,aFe:110,rz:70,lFh:26,lFk:4,lBh:-22,lBk:-30,fB:10,sw:-5},
      {lean:14,hunch:10,head:-6,jaw:18,aBs:48,aBe:96,ta:-8,hx:6,lFh:18,lBh:-14,sw:-2},
      {lean:6,hunch:7,head:-4,jaw:12,aBs:24,aBe:96,ta:-2,hx:2},
      {lean:3,jaw:8}][i]},
    splash:{nome:'Panela de dendê (arremessa o dendê fervendo)',n:9,throwAt:5,reach:110,dur:i=>[70,70,60,50,60,60,130,150,160][i],pose:i=>[
      {lean:6,hunch:8,head:-6,jaw:10,aFs:64,aFe:92,cz:0,stm:0},
      {lean:0,hunch:6,head:-2,jaw:16,aFs:70,aFe:150,cz:0,pot:2,pa:-10,stm:1,ta:-2},
      {lean:-6,hunch:3,head:2,jaw:22,aFs:120,aFe:186,cz:0,pot:2,pa:-24,stm:2,hx:-2,sw:2,lFh:10,lBh:-10},
      {lean:-12,hunch:1,head:6,jaw:32,aFs:156,aFe:214,cz:0,pot:2,pa:-40,stm:3,hx:-4,sw:4,lFh:12,lFk:-6,lBh:-12,lBk:-20,drool:2},
      {lean:-13,hunch:1,head:7,jaw:38,aFs:160,aFe:220,cz:0,pot:2,pa:-44,stm:4,hx:-4,sw:4,lFh:12,lFk:-6,lBh:-12,lBk:-20},
      {lean:16,hunch:12,head:-10,jaw:40,aFs:92,aFe:66,cz:0,pot:2,pa:96,dpour:1,stm:5,hx:5,lFh:22,lFk:2,lBh:-18,lBk:-26,fB:8,sw:-5},
      {lean:20,hunch:14,head:-12,jaw:28,aFs:70,aFe:36,cz:0,pot:2,pa:120,pf:0,hx:6,lFh:22,lFk:2,lBh:-18,lBk:-26,fB:8,sw:-4},
      {lean:12,hunch:10,head:-8,jaw:16,aFs:50,aFe:70,cz:0,pot:2,pa:40,pf:0,hx:3,sw:-2},
      {lean:6,hunch:8,head:-6,jaw:10,aFs:58,aFe:110,cz:0,pot:2,pa:6,pf:0,hx:1}][i]},
    refill:{nome:'Reabastece (põe a panela e mexe; aberta)',n:8,dur:()=>125,pose:i=>{ const p=i/8*PI*2, s=S(p);
      if(i===0) return {lean:4,hunch:5,head:-6,jaw:8,aFs:64,aFe:96,cz:0,pot:1,pf:0.1,stm:0};
      return {lean:2+1.5*s,hunch:4,head:-8+2*s,jaw:6+3*mx(0,s),aFs:54+7*s,aFe:104+14*C(p),rz:-76+12*S(p+1),pot:1,pf:Math.min(1,i/7),stm:i,ta:1.5*s,hx:0.6*s}; }},
    hurt:{nome:'Dano (cabeça)',n:4,dur:i=>[80,110,130,150][i],pose:i=>[
      {lean:-10,hunch:1,head:8,jaw:30,aFs:20,aFe:60,rz:40,aBs:4,aBe:84,ta:6,hx:-6,flash:1,lFh:12,lBh:-4,sw:4},
      {lean:-6,hunch:3,head:4,jaw:26,aFs:30,aFe:70,rz:20,aBs:8,aBe:88,ta:4,hx:-5,lFh:10,lBh:-6,sw:3},
      {lean:-1,hunch:4,head:-2,jaw:18,aFs:44,aFe:96,rz:-20,hx:-2,sw:1},
      {lean:1,hunch:5,head:-4,jaw:10}][i]},
    hurtB:{nome:'Dano (barriga, dobra)',n:4,dur:i=>[80,120,140,150][i],pose:i=>[
      {lean:26,hunch:20,head:10,jaw:40,aFs:40,aFe:30,rz:-20,aBs:30,aBe:70,ta:-10,hx:-8,flash:1,lFh:16,lFk:-12,lBh:-12,lBk:-26,sw:5},
      {lean:22,hunch:18,head:6,jaw:36,aFs:42,aFe:40,rz:-30,aBs:28,aBe:76,ta:-8,hx:-7,lFh:14,lFk:-10,lBh:-12,lBk:-24,sw:4},
      {lean:12,hunch:12,head:-2,jaw:22,aFs:50,aFe:80,aBs:20,aBe:90,hx:-3,sw:2},
      {lean:4,hunch:6,head:-4,jaw:12,hx:-1}][i]},
    fall:{nome:'Derrubada',n:5,dur:i=>[90,100,110,150,260][i],pose:i=>[
      {lean:-12,hunch:1,head:6,jaw:34,aFs:-20,aFe:10,rz:40,aBs:-20,aBe:40,ta:20,hx:-6,flash:1,lFh:18,lBh:0,sw:5},
      {rot:-34,lean:-4,hunch:5,head:2,jaw:30,aFs:-50,aFe:-30,aBs:-50,aBe:-10,ta:40,hx:-4,lFh:40,lFk:30,lBh:20,lBk:10},
      {rot:-66,lean:0,hunch:7,head:-2,jaw:28,aFs:-90,aFe:-70,aBs:-90,aBe:-50,ta:70,hx:-6,lFh:46,lFk:36,lBh:28,lBk:22},
      {rot:-90,lean:4,hunch:9,head:0,jaw:36,aFs:-110,aFe:-120,aBs:-100,aBe:-80,ta:90,hx:2,lFh:36,lFk:10,lBh:26,lBk:4},
      {rot:-90,lean:0,hunch:9,head:-2,jaw:34,aFs:-126,aFe:-146,aBs:-104,aBe:-90,ta:90,hx:2,lFh:38,lFk:6,lBh:24,lBk:0}][i]},
    getup:{nome:'Levantar (ajeita o turbante)',n:6,dur:i=>[200,170,170,160,160,150][i],pose:i=>[
      {rot:-90,lean:0,hunch:9,head:-2,jaw:34,aFs:-126,aFe:-146,aBs:-104,aBe:-90,ta:90,hx:2,lFh:38,lFk:6,lBh:24,lBk:0},
      {rot:-60,lean:10,hunch:16,head:-14,jaw:24,aFs:-50,aFe:-10,aBs:-40,aBe:10,ta:50,hx:-8,lFh:86,lFk:10,lBh:66,lBk:0},
      {rot:-30,lean:20,hunch:20,head:-20,jaw:20,aFs:-10,aFe:10,aBs:-10,aBe:40,ta:20,hx:-6,lFh:100,lFk:10,lBh:56,lBk:-50},
      {rot:0,lean:26,hunch:20,head:-22,jaw:18,aFs:30,aFe:10,aBs:20,aBe:70,ta:6,hx:-4,lFh:70,lFk:-2,lBh:6,lBk:-76,fB:50},
      {rot:0,lean:10,hunch:12,head:-12,jaw:12,aFs:150,aFe:200,rz:60,aBs:14,aBe:96,hx:-1,lFh:26,lFk:-10,lBh:-10,lBk:-28},
      {lean:4,hunch:7,head:-6,jaw:8,aFs:60,aFe:110}][i]},
    death:{nome:'Morte (derruba o tabuleiro, o dendê se espalha, cai sentada)',n:8,dur:i=>[90,140,150,160,160,150,170,600][i],pose:i=>[
      {lean:-10,hunch:1,head:8,jaw:40,aFs:10,aFe:40,rz:40,aBs:0,aBe:70,ta:14,hx:-5,flash:1,lFh:12,lBh:-4,sw:4},
      {lean:-4,hunch:6,head:10,jaw:46,aFs:0,aFe:20,cz:0,aBs:-6,aBe:20,pot:0,tl:1,tdx:26,tdy:22,tdr:30,pdx:44,pr:40,hx:-6,lFh:10,lBh:-8,sw:3},
      {lean:8,hunch:14,head:-2,jaw:44,aFs:6,aFe:10,cz:0,aBs:0,aBe:6,pot:0,tl:1,tdx:34,tdy:6,tdr:12,pdx:58,pr:90,spill:0.3,hx:-4,lFh:30,lFk:-24,lBh:20,lBk:-40,sw:-2},
      {lean:12,hunch:22,head:-8,jaw:46,aFs:10,aFe:6,cz:0,aBs:4,aBe:4,pot:0,tl:1,tdx:36,tdy:0,tdr:6,pdx:70,pr:180,spill:0.55,hx:-2,lFh:60,lFk:-10,lBh:50,lBk:-30,lift:-2},
      {rot:-8,lean:12,hunch:26,head:-10,jaw:44,aFs:24,aFe:20,cz:0,aBs:14,aBe:10,pot:0,tl:1,tdx:36,tdy:0,tdr:4,pdx:80,pr:260,spill:0.75,hx:0,lFh:82,lFk:70,lBh:76,lBk:60},
      {rot:-14,lean:10,hunch:24,head:-16,jaw:40,aFs:30,aFe:24,cz:0,aBs:20,aBe:16,pot:0,tl:1,tdx:36,tdy:0,tdr:4,pdx:86,pr:320,spill:0.9,hx:2,lFh:88,lFk:84,lBh:84,lBk:80},
      {rot:-16,lean:8,hunch:28,head:-24,jaw:42,aFs:24,aFe:16,cz:0,aBs:16,aBe:10,pot:0,tl:1,tdx:36,tdy:0,tdr:4,pdx:88,pr:350,spill:1,hx:2,lFh:90,lFk:88,lBh:86,lBk:84},
      {rot:-16,lean:6,hunch:30,head:-30,jaw:44,aFs:20,aFe:12,cz:0,aBs:12,aBe:8,pot:0,tl:1,tdx:36,tdy:0,tdr:4,pdx:88,pr:360,spill:1,hx:2,lFh:90,lFk:88,lBh:86,lBk:84,drool:3}][i]},
    // adereço: o dendê fervendo voando (desenhado pelo motor como ator extra; âncora em cv._ax/_gy)
    xDende:{nome:'Dendê voando (adereço)',n:4,prop:true,dur:()=>60,pose:i=>({st:i})},
  };
  const EXK=['hx','lean','hunch','head','aFs','aFe','aBs','aBe','lFh','lFk','lBh','lBk'];
  function exag(P,f){ if(f===1||Math.abs(P.rot)>4) return P; EXK.forEach(k=>{ P[k]=REST[k]+(P[k]-REST[k])*f; }); P.jaw=Math.min(56,mx(0,REST.jaw+(P.jaw-REST.jaw)*f)); return P; }
  const EXF={idle:1.05,walk:1.08,alert:1.1,attack:1.14,bash:1.1,splash:1.1,refill:1.04,hurt:1.25,hurtB:1.2,fall:1.05,getup:1.05,death:1.04};
  ZREACT.add(ANIMS,REST,{moves:{}}); // reações (voando, agarrado)
  function poseOf(anim,i){ const A=ANIMS[anim]; if(A&&A.prop) return Object.assign({},REST,A.pose(i)); return exag(Object.assign({},REST,A.pose(i)),EXF[anim]||1); }
  function heavyOutline(cv){ const g=cv.getContext('2d'), W=cv.width, H=cv.height, im=PIX.pix(cv), d=im.data;
    const isO=i=>d[i+3]===255&&d[i]===0x17&&d[i+1]===0x0b&&d[i+2]===0x1c, fill=i=>d[i+3]===255&&!isO(i);
    const add=[]; for(let y=2;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(d[i+3]) continue; const u=((y-1)*W+x)*4, u2=((y-2)*W+x)*4; if(isO(u)&&fill(u2)) add.push(i); }
    add.forEach(i=>{ d[i]=0x17; d[i+1]=0x0b; d[i+2]=0x1c; d[i+3]=255; }); g.putImageData(im,0,0); }

  /* ---------- esqueleto (ombro mais baixo, quadril largo, base volumosa) ---------- */
  const SPINE=35, TH=19, SH=18.5, UA=13.4, FA=12.6, VS=SPINE/37, US=1.2, HB=4, HS=1.25, TS=1.22;
  const lp=(p,a,L)=>({x:p.x+Math.sin(rad(a))*L, y:p.y+Math.cos(rad(a))*L});
  function build(P,dy){
    const R=P.rot, hip={x:AX+P.hx, y:dy};
    const ra=rad(R), rc=Math.cos(ra), rs=Math.sin(ra);
    const HR=(lx,ly)=>({x:hip.x+lx*rc-ly*rs, y:hip.y+lx*rs+ly*rc});
    const HL=q=>{ const dx=q.x-hip.x, dy2=q.y-hip.y; return {x:dx*rc+dy2*rs, y:-dx*rs+dy2*rc}; };
    const hipF=HR(3,0), hipB=HR(-3,0);
    const kneeF=lp(hipF,P.lFh-R,TH), ankleF=lp(kneeF,P.lFk-R,SH), kneeB=lp(hipB,P.lBh-R,TH), ankleB=lp(kneeB,P.lBk-R,SH);
    const SS=[]; let x=hip.x, y=hip.y;
    for(let k=0;k<=SPINE;k++){ const t=k/SPINE, a=rad(R+P.lean+(P.hunch+HB)*Math.pow(t,1.3)); SS.push({x,y,a}); x+=Math.sin(a); y-=Math.cos(a); }
    const SP=(u,v)=>{ if(v>0){ const s=SS[0], a=s.a, px=s.x-Math.sin(a)*v, py=s.y+Math.cos(a)*v; return {x:px+Math.cos(a)*u, y:py+Math.sin(a)*u}; }
      const f=-v, k=Math.min(SPINE,Math.floor(f)), s=SS[k], r=f-k, a=s.a;
      const px=s.x+Math.sin(a)*r, py=s.y-Math.cos(a)*r; return {x:px+Math.cos(a)*u, y:py+Math.sin(a)*u}; };
    const T=(u,v)=>SP(u*US,v*VS);
    const top=SS[SPINE], neck=T(1,-37), sa=top.a;
    const shF=T(0.4,-31.4), shB=T(-5.6,-32.2);
    const elF=lp(shF,P.aFs-R,UA), wrF=lp(elF,P.aFe-R,FA), elB=lp(shB,P.aBs-R,UA), wrB=lp(elB,P.aBe-R,FA);
    const ha=sa+rad(P.head-HB*0.8), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:neck.x+(lx*hc-ly*hs)*HS, y:neck.y+(lx*hs+ly*hc)*HS});
    // concha: punho -> cabo -> concha
    const fa=Math.atan2(wrF.x-elF.x,wrF.y-elF.y)*180/PI, za=rad(fa+P.rz), zd={x:Math.sin(za),y:Math.cos(za)};
    const zh={x:wrF.x+(wrF.x-elF.x)/FA*3.4, y:wrF.y+(wrF.y-elF.y)/FA*3.4};
    const ltip={x:zh.x+zd.x*17, y:zh.y+zd.y*17};
    // tabuleiro: pega na mão de trás (frente do pulso)
    const tg={x:wrB.x+(wrB.x-elB.x)/FA*3, y:wrB.y+(wrB.y-elB.y)/FA*3}, tang=rad(P.ta+R);
    const TL=(lx,ly)=>({x:tg.x+(lx*Math.cos(tang)-ly*Math.sin(tang))*TS, y:tg.y+(lx*Math.sin(tang)+ly*Math.cos(tang))*TS});
    const toe=(a,f)=>{ const t=rad(f+R); return {x:a.x+(9*Math.cos(t)-4*Math.sin(t))*1.25, y:a.y+(9*Math.sin(t)+4*Math.cos(t))*1.25}; };
    const hull=[[ankleF,5],[ankleB,5],[toe(ankleF,P.fF),0.8],[toe(ankleB,P.fB),0.8],[kneeF,5],[kneeB,5],[hip,8],[T(0,-18),11],[T(-2,-30),11],[H(0,-14),12],[wrF,4],[wrB,4],[elF,4],[elB,4]];
    return {R,hip,HR,HL,hipF,hipB,kneeF,ankleF,kneeB,ankleB,SP,T,sa,neck,shF,shB,elF,wrF,elB,wrB,ha,H,hull,ra,zh,zd,ltip,tg,tang,TL,toeF:toe(ankleF,P.fF)};
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
    if(R[4]){ const ma=wa*(0.5-0.8/2), mb=wb*(0.5-0.8/2); p.F(R[4]); p.cap({x:a.x+nx*ma,y:a.y+ny*ma},{x:b.x+nx*mb,y:b.y+ny*mb},wa*0.8,wb*0.8); }
    p.F(R[2]); p.cap({x:a.x+nx*ka,y:a.y+ny*ka},{x:b.x+nx*kb,y:b.y+ny*kb},wa*sh,wb*sh);
    if(o.deep!==false){ const k2a=wa*0.33, k2b=wb*0.33; p.F(R[3]); p.cap({x:a.x+nx*k2a,y:a.y+ny*k2a},{x:b.x+nx*k2b,y:b.y+ny*k2b},wa*0.3,wb*0.3); }
    if(o.hi!==false){ const e=lerp(a,b,o.hl!=null?o.hl:0.7), ha=wa*0.22, hb=wb*0.22; p.F(R[0]); p.cap({x:a.x-nx*ha,y:a.y-ny*ha},{x:e.x-nx*hb,y:e.y-ny*hb},wa*0.18,wb*0.16); }
    return {nx,ny};
  }
  function clip(c,pts,fn){ c.save(); c.beginPath(); pts.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])); c.closePath(); c.clip(); fn(); c.restore(); }
  const W=(sk,list)=>list.map(([u,v])=>{ const q=sk.T(u,v); return [q.x,q.y]; });
  const Wp=(sk,u,v)=>sk.T(u,v);
  const off=(q,n,k)=>({x:q.x+n.nx*k,y:q.y+n.ny*k});
  const Hl=(sk,list)=>list.map(([x,y])=>{ const q=sk.HR(x,y); return [q.x,q.y]; });
  // furinhos da renda (richelieu): florzinha = miolo + 4 pétalas, em grade desencontrada
  function eyelets(p,M,R,toW,x0,x1,y0,y1,dx,dy,sc){
    sc=sc||1; let r=0;
    for(let y=y0;y<=y1;y+=dy,r++) for(let x=x0+(r%2)*dx*0.5;x<=x1;x+=dx){
      const q=toW(x,y); p.F(R[2]); p.ell(q.x,q.y,0.9*sc,0.7*sc);
      if(r%2===0){ const e1=toW(x-1.7*sc,y+0.2), e2=toW(x+1.7*sc,y+0.2); p.rect(e1.x-0.3,e1.y-0.3,0.6,0.6); p.rect(e2.x-0.3,e2.y-0.3,0.6,0.6); }
      p.F(R[0]); const h=toW(x+0.3*sc,y+1*sc); p.rect(h.x-0.4,h.y-0.25,0.8,0.5);
    }
  }

  /* ---------- panela de dendê (origem: centro do fundo; x pra frente) ---------- */
  function drawPot(c,p,M,form,fill,stm,o){
    o=o||{};
    const body=[[-6,0],[6,0],[7.2,-2],[7.4,-6.4],[6.8,-7.4],[-6.8,-7.4],[-7.4,-6.4],[-7.2,-2]];
    // alças
    p.F(M.iron[2]); p.ell(-8.2,-5.6,1.8,1.3); p.ell(8.2,-5.6,1.8,1.3); p.F(M.iron[3]); p.ell(-8.2,-5.6,0.8,0.5); p.ell(8.2,-5.6,0.8,0.5);
    p.F(M.iron[1]); p.poly(body);
    clip(c,body,()=>{
      p.F(M.iron[2]); p.poly([[-8,1],[-2.6,1],[-3.4,-8],[-8,-8]]);
      p.F(M.iron[3]); p.poly([[-8,1],[-5.6,1],[-6,-8],[-8,-8]]);
      p.F(M.iron[0]); p.poly([[2.6,-6.6],[4.4,-6.6],[4.8,-1.2],[3.4,-1]]);
      p.F(M.iron[2]); p.poly([[-8,-0.8],[8,-0.8],[8,1],[-8,1]]);
      p.F(M.iron[3]); p.rect(-8,-4.4,16,0.7); // aro forjado
      p.F(M.dende[2]); p.poly([[4.8,-7.4],[6.4,-7.4],[6,-3.6],[5.4,-2.4],[5,-4.2]]); // dendê escorrendo por fora
      p.F(M.dende[1]); p.rect(5.2,-7.4,0.8,2.6);
      if(form==='plenilunar'){ p.F(M.glow[1]); p.poly([[-1,-7.4],[0.4,-5],[-0.6,-3.6],[0.8,-1.4],[0.2,-1.2],[-1.2,-3.6],[-0.2,-5],[-1.6,-7.4]]); }
    });
    // boca: aro + dendê (ou fundo vazio)
    p.F(M.iron[2]); p.ell(0,-7.6,7.4,2.2);
    p.F(M.iron[0]); p.rect(1,-9.6,4.6,0.7);
    if(fill>0.15){ const lv=Math.min(1,fill); p.F(M.dende[2]); p.ell(0,-7.6+(1-lv)*0.8,6.4,1.5);
      p.F(M.dende[1]); p.ell(0.6,-7.8+(1-lv)*0.8,5.2,1.1); p.F(M.dende[0]); p.rect(1.4,-8.4+(1-lv)*0.8,2.6,0.6);
      // bolhas fervendo
      const s=stm|0; p.F(M.dende[0]); [[-3,0],[2.4,3],[-0.6,5],[3.8,1]].forEach(([bx,ph])=>{ const k=(s+ph)%4; if(k<2) p.circle({x:bx,y:-7.8-k*0.5},0.7+k*0.3); });
      p.F(M.dende[3]); p.rect(-4.6,-7.4,1.2,0.6);
    } else { p.F(M.iron[3]); p.ell(0,-7.4,6.2,1.4); p.F(M.dende[3]); p.ell(-1,-7.2,2.4,0.6); }
    if(form==='plenilunar'&&!o.noSpark){ p.F(M.glow[0]); const s=stm|0; [[-3,-11],[4,-12],[1,-14]].forEach(([x,y],k)=>{ if((s+k)%3===0) p.rect(x,y,0.8,0.8); }); }
  }
  // fumaça subindo da panela (local da panela)
  function drawSteam(p,M,stm,fill){
    if(fill<0.5) return; const s=(stm|0)%8;
    p.F(M.smoke[2]); p.ell(-1+S(s)*1.2,-12-s*0.4,2.2,1.6); p.F(M.smoke[1]); p.ell(-1.4+S(s)*1.2,-12.6-s*0.4,1.6,1.2);
    p.F(M.smoke[1]); p.ell(2+S(s+2)*1.4,-17-((s+4)%8)*0.5,1.8,1.3); p.F(M.smoke[0]); p.rect(1.4+S(s+2)*1.4,-17.8-((s+4)%8)*0.5,1.2,0.6);
  }
  function potAt(c,p,M,form,ox,oy,ang,sc,fill,stm,o){ p.xf(ang,ox,oy); c.scale(sc,sc); if(o&&o.grip) c.translate(8.2,5.6); drawPot(c,p,M,form,fill,stm,o); if(!(o&&o.noSteam)) drawSteam(p,M,stm,fill); p.id(); }

  /* ---------- tabuleiro (local: origem na mão, x pra frente, y pra baixo) ---------- */
  function drawTray(c,u,M,sk,P,form,loose){
    const p=mkPen(c,u);
    if(loose){ const ox=AX+P.tdx, oy=GROUND-2-P.tdy; p.xf(rad(P.tdr),ox,oy); c.scale(TS,TS); c.translate(-10,0); }
    else { p.xf(sk.tang,sk.tg.x,sk.tg.y); c.scale(TS,TS); }
    const top=[[-11,0],[29,0],[31.6,-5.4],[-8.4,-5.4]];
    // espessura da madeira e borda de baixo
    p.F(M.wood[2]); p.poly([[-11,0],[29,0],[29,2.8],[-11,2.8]]); p.F(M.wood[3]); p.rect(-11,2,40,0.8);
    p.F(M.wood[3]); p.poly([[29,0],[31.6,-5.4],[31.6,-2.6],[29,2.8]]);
    // tampo
    p.F(M.wood[1]); p.poly(top);
    clip(c,top,()=>{
      p.F(M.wood[2]); [[-6,-1.2],[4,-3.8],[14,-2],[22,-4.2]].forEach(([x,y])=>p.rect(x,y,7,0.5)); // veio da madeira
      p.F(M.wood[0]); p.poly([[-11,-0.8],[29,-0.8],[29.4,0],[-11,0]]);
      p.F(M.wood[2]); p.poly([[-9,-5.4],[31.6,-5.4],[31,-4.4],[-8.6,-4.4]]);
    });
    p.F(M.wood[0]); p.rect(-10.6,0,1.2,1); p.rect(27.6,0,1.2,1);
    // toalhinha de renda pendurada na frente do tabuleiro
    const cl=[[-6,0.4],[16,0.4],[15.4,4.6],[13,6],[10.6,4.6],[8,6],[5.4,4.6],[2.8,6],[0.2,4.6],[-2.4,6],[-5,4.6]];
    p.F(M.lace[1]); p.poly(cl);
    clip(c,cl,()=>{ p.F(M.lace[2]); p.poly([[-7,3.6],[17,3.6],[17,7],[-7,7]]); p.F(M.lace[0]); p.rect(-6,0.4,22,0.8);
      p.F(M.lace[3]); [[-2.4,2.6],[3,2.4],[8.4,2.6],[13.4,2.4]].forEach(([x,y])=>p.ell(x,y,0.8,0.6)); });
    p.F(M.soot[1]); p.ell(11,4.8,1.6,0.8); p.F(M.dende[2]); p.ell(1,3.6,1,1.2);
    // acarajés queimados (e um rachado com recheio)
    if(!loose||P.tdr<20){
      [[-4.6,-2.6,0],[0.4,-3.2,1],[5.2,-2.4,2],[-1.6,-1.2,3]].forEach(([x,y,k])=>{
        p.F(M.akara[2]); p.ell(x,y+0.5,2.8,1.7); p.F(M.akara[1]); p.ell(x,y,2.6,1.5); p.F(M.akara[0]); p.ell(x+0.6,y-0.6,1.2,0.5);
        p.F(M.soot[2]); p.rect(x-1.6+k*0.4,y-0.2,1,0.6); if(k===1){ p.F(M.dende[2]); p.poly([[x-1.8,y-0.2],[x+1.8,y-0.4],[x+1.2,y+0.4],[x-1.2,y+0.4]]); p.F(M.flesh[1]); p.rect(x-0.4,y-0.4,1,0.5); }
      });
    }
    // panela no tabuleiro
    if(P.pot===1&&!loose){ p.F(M.wood[3]); p.ell(19,-2.6,7,1.4); c.save(); c.translate(19,-2.2); drawPot(c,p,M,form,P.pf,P.stm,{}); drawSteam(p,M,P.stm,P.pf); c.restore(); }
    if(form==='enluarado'){ p.F(M.glow[1]); p.rect(20,-0.4,5,0.6); }
    if(form==='plenilunar'){ p.F(M.blood[1]); p.ell(24,-2,1.8,0.7); }
    p.id();
  }
  // mão de trás segurando a borda do tabuleiro (por cima dele)
  function drawTrayHand(c,u,M,sk){
    const p=mkPen(c,u); p.xf(sk.tang,sk.tg.x,sk.tg.y); c.scale(TS,TS);
    p.F(M.skin[2]); p.poly([[-4,0.6],[3,0.6],[3.4,3.6],[-4.4,3.6]]);
    [[-2.6,0],[-0.6,0],[1.4,0]].forEach(([x])=>{ p.F(M.skin[1]); p.cap(P2(x,3),P2(x+0.4,-1.6),1.6,1.4); p.F(M.nail[1]); p.rect(x-0.1,-2,0.9,0.7); });
    p.F(M.skin[0]); p.rect(-3,0.8,1.2,0.6);
    p.id();
  }

  /* ---------- concha ---------- */
  function drawLadle(p,M,sk,P,form){
    const h=sk.zh, d=sk.zd, tip=sk.ltip;
    const b0={x:h.x-d.x*3,y:h.y-d.y*3}, e={x:h.x+d.x*13,y:h.y+d.y*13};
    p.F(M.steel[2]); p.cap(b0,e,1.9,1.5);
    const n=sideN(b0,e); p.F(M.steel[0]); p.cap(off(lerp(b0,e,0.2),n,-0.5),off(lerp(b0,e,0.85),n,-0.4),0.5,0.5);
    p.F(M.steel[3]); p.rect(b0.x-0.6,b0.y-0.6,1.2,1.2); // furo de pendurar
    // cuia da concha (aberta pra cima do lado da luz)
    const cx=tip.x, cy=tip.y;
    p.F(M.steel[2]); p.circle({x:cx,y:cy},3.6);
    p.F(M.steel[1]); p.circle({x:cx-n.nx*0.6,y:cy-n.ny*0.6},2.8);
    p.F(M.steel[3]); p.circle({x:cx+n.nx*1.6,y:cy+n.ny*1.6},1.6);
    p.F(M.dende[1]); p.circle({x:cx-n.nx*0.8,y:cy-n.ny*0.8},1.7); p.F(M.dende[0]); p.rect(cx-n.nx*1.2-0.4,cy-n.ny*1.2-0.4,0.9,0.7);
    p.F(M.steel[0]); p.rect(cx-n.nx*2.6-0.5,cy-n.ny*2.6-0.5,1,1);
    p.F(M.dende[2]); p.poly([[cx-0.6,cy+3],[cx+0.6,cy+3],[cx+0.3,cy+5.4],[cx-0.2,cy+5.6]]); // pingo
    if(form!=='comum'){ p.F(M.glow[1]); p.rect(cx-0.6,cy-0.6,1.2,1.2); }
  }

  /* ---------- braços: manga bufante de renda, braço de pele escura, pulseiras ---------- */
  function sleeve(p,M,sh,el,front){
    const s=lerp(sh,el,0.56), n=sideN(sh,el);
    p.F(M.lace[1]); p.cap(sh,s,front?13:12,front?12.4:11.4);
    p.F(M.lace[2]); p.cap(off(sh,n,3),off(s,n,3),5,5);
    p.F(M.lace[0]); p.cap(off(sh,n,-3.2),off(lerp(sh,s,0.7),n,-3.2),2.2,2);
    // babado da manga (borda recortada)
    const L=Math.hypot(el.x-sh.x,el.y-sh.y)||1, d={x:(el.x-sh.x)/L,y:(el.y-sh.y)/L};
    for(let k=-3;k<=3;k++){ const b={x:s.x+n.nx*k*1.9,y:s.y+n.ny*k*1.9}; p.F(k>1?M.lace[2]:M.lace[1]); p.circle({x:b.x+d.x*1.4,y:b.y+d.y*1.4},1.4); }
    p.F(M.lace[2]); p.cap(off(s,n,-6),off(s,n,6),0.7,0.7);
    if(front) eyelets(p,M,M.lace,(a,b)=>({x:sh.x+d.x*b+n.nx*a,y:sh.y+d.y*b+n.ny*a}),-3.6,2.4,1.2,5.2,3.6,3.2,0.9);
  }
  function bangles(p,M,el,wr,n){ const L=Math.hypot(wr.x-el.x,wr.y-el.y)||1, d={x:(wr.x-el.x)/L,y:(wr.y-el.y)/L};
    [[0.7,'metal'],[0.8,'bead'],[0.88,'metal']].forEach(([t,k])=>{ const q=lerp(el,wr,t); const R=M[k];
      p.F(R[2]); p.cap(off(q,n,-4.4),off(q,n,4.4),1.6,1.6); p.F(R[1]); p.cap(off(q,n,-4.2),off({x:q.x-d.x*0.3,y:q.y-d.y*0.3},n,3.6),1.1,1.1); p.F(R[0]); const h=off(q,n,-2.6); p.rect(h.x-0.4,h.y-0.4,0.9,0.8); }); }
  function drawArmUpper(c,u,M,sk,P,front){
    const p=mkPen(c,u), sh=front?sk.shF:sk.shB, el=front?sk.elF:sk.elB; p.id();
    limb(p,M.skin,sh,el,10.6,9.2,{hl:0.6});
    const n=sideN(sh,el); p.F(M.vein[2]); p.cap(off(lerp(sh,el,0.6),n,1.6),off(lerp(sh,el,0.95),n,1.2),0.6,0.5);
    sleeve(p,M,sh,el,front);
  }
  function drawForearm(c,u,M,sk,P,front,form){
    const p=mkPen(c,u), el=front?sk.elF:sk.elB, wr=front?sk.wrF:sk.wrB; p._c=c; p.id();
    const n=limb(p,M.skin,el,wr,9,7.8,{});
    p.F(M.skin[1]); p.circle(el,4.4);
    p.F(M.vein[1]); p.cap(off(lerp(el,wr,0.2),n,-1.4),off(lerp(el,wr,0.62),n,-1.8),0.6,0.5);
    p.F(M.rot[1]); const r1=lerp(el,wr,0.42); p.ell(r1.x+n.nx*1.4,r1.y+n.ny*1.4,1.6,1.1); p.F(M.flesh[2]); p.rect(r1.x+n.nx*1.4-0.5,r1.y+n.ny*1.4-0.4,1,0.8);
    bangles(p,M,el,wr,n);
    if(front){
      if(P.cz>=0.5) drawLadle(p,M,sk,P,form);
      drawFist(p,M,el,wr);
      if(P.pot===2){ potAt(c,p,M,form,sk.zh.x,sk.zh.y,rad(P.pa)+sk.ra,1,P.pf,P.stm,{grip:true}); drawFist(p,M,el,wr); }
    }
  }
  function drawFist(p,M,el,wr){
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y); p._c.scale(1.24,1.24);
    p.F(M.skin[1]); p.poly([[-1,-3.2],[4.2,-3.6],[5.8,-1],[5.4,3.2],[-1,3.4]]);
    p.F(M.skin[2]); p.poly([[-1,1.4],[5.6,1.2],[5.4,3.2],[-1,3.4]]);
    p.F(M.skin[0]); p.rect(0.4,-3,3.4,0.8);
    for(let k=0;k<4;k++){ const y0=-2.6+k*1.8; p.F(M.skin[1]); p.ell(5.8,y0,1.6,1); p.F(M.skin[2]); p.rect(5.2,y0+0.4,1.5,0.5); p.F(M.nail[1]); p.rect(6.4,y0-0.4,0.8,0.7); }
    p.F(M.skin[1]); p.cap(P2(1.6,-3),P2(4.8,-4.4),1.7,1.3); p.F(M.skin[3]); p.rect(2,0.6,3,0.6);
    p.id();
  }

  /* ---------- pernas: pele escura (aparece só no pé e quando cai), chinelo de couro ---------- */
  function drawLeg(c,u,M,sk,P,front){
    const p=mkPen(c,u), hip=front?sk.hipF:sk.hipB, knee=front?sk.kneeF:sk.kneeB, ank=front?sk.ankleF:sk.ankleB; p.id();
    limb(p,M.skin,knee,ank,9.4,7.6,{hl:0.5});
    limb(p,M.skin,hip,knee,12,10,{hl:0.55});
    p.F(M.skin[1]); p.circle(knee,4.8);
    const nS=sideN(knee,ank); p.F(M.vein[2]); p.cap(off(lerp(knee,ank,0.2),nS,-1.4),off(lerp(knee,ank,0.7),nS,-1.6),0.6,0.5);
    if(front){ p.F(M.rot[1]); const r=lerp(knee,ank,0.45); p.ell(r.x+nS.nx*1.6,r.y+nS.ny*1.6,1.4,2); }
    // pé com chinelo de couro (tira em V, sola grossa)
    const fa=rad((front?P.fF:P.fB)+sk.R); p.xf(fa,ank.x,ank.y); c.scale(1.25,1.25);
    p.F(M.leather[2]); p.poly([[-4,3.2],[10.6,3.2],[10.4,4.6],[-3.8,4.6]]); p.F(M.leather[3]); p.rect(-3.8,4.2,14,0.5);
    p.F(M.skin[1]); p.poly([[-3.2,-1.6],[1.6,-1.8],[6,0.4],[9.6,1.4],[10.4,3.2],[-3.6,3.2]]);
    p.F(M.skin[2]); p.poly([[-3.6,1.6],[10.2,2],[10.4,3.2],[-3.6,3.2]]);
    p.F(M.skin[0]); p.poly([[0,-1.4],[2,-1.6],[5.6,0.4],[5.2,1]]);
    p.F(M.nail[1]); [[9.2,1.4],[7.6,1],[6.2,0.6]].forEach(([x,y])=>p.rect(x,y,0.9,0.7));
    p.F(M.leather[1]); p.poly([[4.4,-0.6],[5.4,-0.4],[7.6,3.2],[6.6,3.2]]); p.poly([[4.4,-0.6],[5.4,-0.4],[3.4,3.2],[2.4,3.2]]); // tira em V
    p.F(M.leather[0]); p.rect(4.4,-0.4,0.8,0.6);
    p.id();
  }

  /* ---------- saia rodada (local do quadril: x pra frente, y pra baixo) ---------- */
  function skirtShape(sk,P){
    const aF=sk.HL(sk.ankleF), aB=sk.HL(sk.ankleB);
    let L=TH+SH+1; if(Math.abs(sk.R)<6) L=Math.min(L+6, (GROUND-sk.hip.y)/Math.cos(sk.ra)-0.6);
    L=Math.max(5,L);
    const sw=P.sw||0, k=Math.min(1,L/30);
    const fx=Math.max(24+5*k, aF.x+10)+sw*0.4, bx=Math.min(-23-5*k, aB.x-10)+sw;
    const wf=Math.max(fx-9,L>18?19:fx-2), wb=Math.min(bx+9,L>18?-18:bx+2);
    const pts=[[-9,-7],[9.2,-7],[13.6,-1],[wf,L*0.4],[fx-1.6,L*0.78],[fx,L]];
    const N=9; for(let i=0;i<N;i++){ const xa=fx+(bx-fx)*i/N, xb=fx+(bx-fx)*(i+1)/N; for(let k=1;k<4;k++){ const t=k/4; pts.push([xa+(xb-xa)*t, L-1.6+2.6*Math.sin(t*PI)]); } pts.push([xb,L-1.6]); }
    pts.push([bx,L],[bx+1.6,L*0.78],[wb,L*0.4],[-13.4,-1]);
    return {pts,L,fx,bx,sw};
  }
  function drawSkirt(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    const {pts,L,fx,bx,sw}=skirtShape(sk,P), HP=q=>sk.HR(q[0],q[1]), toW=(x,y)=>sk.HR(x,y);
    const shape=Hl(sk,pts);
    p.F(M.skirt[1]); p.poly(shape);
    clip(c,shape,()=>{
      // volume: frente iluminada, costas na sombra
      p.F(M.skirt[0]); p.poly(Hl(sk,[[6,-8],[11,-8],[fx*0.78,L*0.5],[fx*0.88,L+2],[fx*0.5,L+2],[5,L*0.4]]));
      p.F(M.skirt[4]); p.poly(Hl(sk,[[-30,-8],[3,-8],[2,L*0.4],[bx*0.05,L+2],[-30,L+2]]));
      p.F(M.skirt[2]); p.poly(Hl(sk,[[-30,-8],[-4,-8],[-6,L*0.4],[bx*0.36,L+2],[-30,L+2]]));
      p.F(M.skirt[3]); p.poly(Hl(sk,[[-30,-8],[-10.6,-8],[-14,L*0.4],[bx+4,L+2],[-30,L+2]]));
      // volume de cada camada (babado): faixa de meio-tom na base, sombra nas costas, crescente de luz no topo da frente
      if(L>14) [[0,0.34],[0.34,0.67],[0.67,1]].forEach(([a,b])=>{ const y0=L*a, y1=L*b, ym=y0+(y1-y0)*0.62;
        p.F(M.skirt[4]); p.poly(Hl(sk,[[fx+3,ym],[bx-3,ym+0.6],[bx-3,y1+2],[fx+3,y1+2]]));
        p.F(M.skirt[2]); p.poly(Hl(sk,[[-4,ym+0.4],[bx-3,ym+0.6],[bx-3,y1+2],[-6,y1+2]]));
        p.F(M.skirt[0]); p.poly(Hl(sk,[[1+y0*0.1,y0+1.4],[fx*0.82*(0.5+b*0.5),y0+1],[fx*0.7*(0.5+b*0.5),y0+3.2],[2+y0*0.1,y0+3.4]])); });
      // franzido de cada camada: dobras em cunha subindo da base do babado (sombra do lado de trás, luz do lado da frente)
      const tiers=L>14?[[0,0.34],[0.34,0.67],[0.67,1]]:[[0,1]];
      tiers.forEach(([a,b],ti)=>{ const y0=L*a, y1=L*b, hw=(t)=>[fx*(0.55+0.45*t)+(t>0.9?0:0), bx*(0.55+0.45*t)];
        const [xr,xl]=hw(b), n=7+ti; for(let i=1;i<n;i++){ const x=xl+(xr-xl)*i/n+sw*b*0.5+(ti%2)*1.4, top=y0+(y1-y0)*(0.22+0.18*((i*5+ti)%3)/2);
          const back=x<-4;
          p.F(back?M.skirt[3]:M.skirt[2]); p.poly(Hl(sk,[[x-1.3,y1+1.2],[x+0.2,top],[x+0.5,y1+1.2]]));
          if(!back){ p.F(M.skirt[0]); p.poly(Hl(sk,[[x+0.6,y1+1.2],[x+0.5,top+2],[x+1.6,y1+1.2]])); } } });
      // três camadas de babado: sombra recortada + borda clara + renda logo acima
      if(L>14) [0.34,0.67].forEach(t=>{ const y=L*t, x0=fx+4, x1=bx-4, n=11;
        p.F(M.skirt[2]); p.poly(Hl(sk,[[x0,y+0.6],[x1,y+0.6],[x1,y+3.6],[x0,y+3.6]])); // sombra do babado na camada de baixo
        for(let i=0;i<n;i++){ const xa=x0+(x1-x0)*i/n, xb=x0+(x1-x0)*(i+1)/n, xm=(xa+xb)/2, back=xm<-5;
          const sc=[]; for(let k=0;k<=6;k++){ const tt=k/6; sc.push([xa+(xb-xa)*tt, y-1.2+2.8*Math.sin(tt*PI)]); }
          sc.push([xb,y-1.2]); p.F(M.skirt[3]); p.poly(Hl(sk,sc.map(([u,v])=>[u,v+0.9])));
          p.F(back?M.skirt[2]:M.skirt[1]); p.poly(Hl(sk,sc));
          if(!back){ p.F(M.skirt[0]); p.poly(Hl(sk,[[xa+0.6,y-1],[xb-0.6,y-1],[xm,y+0.2]])); }
          const h=toW(xm,y+0.4); p.F(M.skirt[3]); p.rect(h.x-0.45,h.y-0.4,0.9,0.8); }
      });
      // barra: renda de baixo + fuligem queimada + manchas de dendê
      p.F(M.soot[1]); const sb=[[fx+2,L+2],[fx+2,L-1.6]]; for(let i=1;i<10;i++){ const x=fx+(bx-fx)*i/10; sb.push([x,L-1.4-((i*7)%4)*0.6]); } sb.push([bx-2,L-1.6],[bx-2,L+2]); p.poly(Hl(sk,sb));
      p.F(M.soot[2]); p.poly(Hl(sk,[[fx+2,L+2],[fx+2,L-0.2],[bx-2,L-0.2],[bx-2,L+2]]));
      for(let i=0;i<9;i++){ const xm=fx+(bx-fx)*(i+0.5)/9, h=toW(xm,L-2.4); p.F(M.skirt[3]); p.rect(h.x-0.5,h.y-0.4,1,0.8); }
      p.F(M.dende[2]); [[fx*0.55,L-4,2.2,1.6],[fx*0.2,L-2.6,1.4,1.2],[bx*0.3,L-6,1.6,2.2],[fx*0.7,L*0.7,1.2,1.6]].forEach(([x,y,a,b])=>{ const q=toW(x,y); p.ell(q.x,q.y,a,b); });
      p.F(M.dende[1]); [[fx*0.56,L-4.4,1.2,0.8],[bx*0.3,L-6.6,0.8,1]].forEach(([x,y,a,b])=>{ const q=toW(x,y); p.ell(q.x,q.y,a,b); });
      p.F(M.blood[1]); { const q=toW(fx*0.4,L*0.3); p.ell(q.x,q.y,1.2,1.6); }
      if(form==='plenilunar'){ p.F(M.glow[1]); for(let i=0;i<8;i++){ const q=toW(fx+(bx-fx)*(i+0.5)/8,L-0.8-(i%3)*0.5); p.rect(q.x-0.6,q.y-0.5,1.4,0.9); } p.F(M.glow[0]); [[fx*0.3,L-2.2],[bx*0.5,L-1.6]].forEach(([x,y])=>{ const q=toW(x,y); p.rect(q.x,q.y,0.8,0.8); }); }
      if(form==='enluarado'){ p.F(M.glow[1]); p.poly(Hl(sk,[[fx*0.4,L-1],[fx*0.45,L*0.62],[fx*0.5,L*0.62],[fx*0.48,L-1]])); }
    });
    // avental de pano com bolso (na frente)
    if(L>14){
      const ap=Hl(sk,[[1,-6.4],[12.6,-6.4],[14.8,L*0.5],[13.4,L*0.58],[3.6,L*0.62],[1.6,L*0.5]]);
      p.F(M.apron[1]); p.poly(ap);
      clip(c,ap,()=>{ p.F(M.apron[0]); p.poly(Hl(sk,[[8,-7],[13,-7],[16,L],[11,L]]));
        p.F(M.apron[4]); p.poly(Hl(sk,[[0,-7],[6,-7],[7.4,L],[0,L]])); p.F(M.apron[2]); p.poly(Hl(sk,[[0,-7],[3.4,-7],[4.4,L],[0,L]]));
        p.F(M.blue[1]); p.poly(Hl(sk,[[0,L*0.5],[16,L*0.46],[16,L*0.5],[0,L*0.54]])); p.F(M.blue[2]); p.poly(Hl(sk,[[0,L*0.54],[16,L*0.5],[16,L*0.53],[0,L*0.57]]));
        // bolso
        p.F(M.apron[2]); p.poly(Hl(sk,[[5.2,L*0.15],[11.4,L*0.15],[11.6,L*0.36],[5.4,L*0.36]])); p.F(M.apron[1]); p.poly(Hl(sk,[[5.6,L*0.15+0.8],[11,L*0.15+0.8],[11.2,L*0.36-0.4],[5.8,L*0.36-0.4]]));
        p.F(M.apron[3]); p.poly(Hl(sk,[[5.2,L*0.15],[11.4,L*0.15],[11.4,L*0.15+0.7],[5.2,L*0.15+0.7]]));
        p.F(M.dende[2]); { const q=sk.HR(9,L*0.42); p.ell(q.x,q.y,1.6,1.1); } p.F(M.soot[1]); { const q=sk.HR(4,L*0.1); p.ell(q.x,q.y,1.2,1.8); }
        p.F(M.apron[2]); p.poly(Hl(sk,[[7,L*0.4],[8,L*0.4],[8.8,L*0.6],[7.8,L*0.6]]));
      });
      p.F(M.apron[2]); p.poly(Hl(sk,[[0,-7.4],[13.4,-7.4],[13.4,-5.6],[0,-5.6]])); p.F(M.apron[0]); p.poly(Hl(sk,[[3,-7.4],[12,-7.4],[12,-6.8],[3,-6.8]])); // cós
    }
  }

  /* ---------- tronco: bata de renda (decote com babado, ombro rasgado), contas, pano da costa ---------- */
  const BODY=[[-9,6],[-9.6,-4],[-9.4,-14],[-10.4,-24],[-10.8,-31],[-8.6,-36.4],[-3,-38.6],[3,-38.4],[7.6,-36],[10.4,-31],[12.2,-25],[12,-20],[9.6,-15],[8.8,-6],[10,6]];
  const BATA=[[-11.6,6.6],[-11.2,-6],[-10.6,-20],[-11.8,-29],[-12.6,-33.2],[-6,-34.6],[2,-34.4],[9.8,-32],[13.2,-26],[13.8,-19.4],[11.6,-14.4],[11,-6],[12.6,6.6]];
  function drawTorso(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    // pele (pescoço/colo/ombros acima do decote)
    const body=W(sk,BODY); p.F(M.skin[1]); p.poly(body);
    clip(c,body,()=>{ p.F(M.skin[2]); p.poly(W(sk,[[-14,8],[-14,-40],[-4,-40],[-6,-34],[-6,8]])); p.F(M.skin[0]); p.poly(W(sk,[[3,-38],[7,-36.4],[8,-34],[4,-35]]));
      p.F(M.vein[1]); p.poly(W(sk,[[1,-38],[1.8,-38],[3.4,-34.4],[2.6,-34.2]])); });
    // bata
    const bata=W(sk,BATA); p.F(M.lace[1]); p.poly(bata);
    clip(c,bata,()=>{
      p.F(M.lace[0]); p.poly(W(sk,[[2,-30],[8,-31],[13,-26],[14,-20],[11,-18],[6,-24]])); // peito iluminado
      p.F(M.lace[4]); p.poly(W(sk,[[-14,8],[-14,-36],[-1,-36],[-2.6,-26],[-1,-16],[0,-4],[1,8]]));
      p.F(M.lace[2]); p.poly(W(sk,[[-14,8],[-14,-36],[-6.4,-36],[-7.4,-26],[-6.8,-16],[-5.6,-4],[-4,8]]));
      p.F(M.lace[3]); p.poly(W(sk,[[-14,8],[-14,-36],[-10.4,-36],[-11,-26],[-10.4,-14],[-9.6,8]]));
      p.F(M.lace[4]); p.poly(W(sk,[[-14,-30],[14,-27.6],[14,-25],[4,-25.6],[-14,-26.6]])); // sombra do babado
      p.F(M.lace[4]); p.poly(W(sk,[[-5,-24],[2,-20],[4,-12],[2,-2],[-4,4],[-6,-10]])); // meio-tom do flanco
      p.F(M.lace[2]); p.poly(W(sk,[[3,-17],[11,-15.6],[12.6,-14],[9,-13],[4,-14.6]])); // sombra sob o busto
      p.F(M.lace[3]); p.poly(W(sk,[[5,-15.4],[11,-14.6],[11.4,-13.8],[6,-14.2]]));
      p.F(M.lace[2]); [[[0,-10],[5,-12],[5.4,-11.2],[0.4,-9.2]],[[2,-4],[8,-6],[8.2,-5.2],[2.4,-3.4]],[[-4,-22],[-1,-24],[-0.6,-23.2],[-3.6,-21.4]]].forEach(f=>p.poly(W(sk,f)));
      // ombro rasgado (costas): pele e carne à mostra
      p.F(M.lace[3]); p.poly(W(sk,[[-11.4,-29],[-7,-30.6],[-5,-26],[-6.6,-21],[-9.6,-20.4],[-11.6,-24]]));
      p.F(M.skin[2]); p.poly(W(sk,[[-10.8,-28.4],[-7.4,-29.6],[-5.8,-26],[-7,-22],[-9.4,-21.4],[-10.8,-24.4]]));
      p.F(M.flesh[2]); p.poly(W(sk,[[-9.8,-27],[-7.6,-27.8],[-6.6,-25.4],[-7.6,-23],[-9.4,-23.4]])); p.F(M.flesh[1]); p.poly(W(sk,[[-9,-26],[-7.8,-26.4],[-7.6,-25],[-8.8,-24.8]]));
      if(form==='plenilunar'){ p.F(M.bone[1]); p.poly(W(sk,[[-9.6,-24.6],[-6.8,-25.4],[-6.8,-24.8],[-9.6,-24]])); }
      p.F(M.blood[1]); p.poly(W(sk,[[-7.4,-21.6],[-6.6,-21.8],[-6.8,-16],[-7.2,-15.8]]));
      // manchas
      p.F(M.dende[2]); [[8,-8,1.6,1.2],[10,-4,1,0.8]].forEach(([a,b,rx,ry])=>{ const q=Wp(sk,a,b); p.ell(q.x,q.y,rx,ry); });
      p.F(M.blood[1]); [[10,-22,1.4,1],[11.4,-19,0.9,1.4]].forEach(([a,b,rx,ry])=>{ const q=Wp(sk,a,b); p.ell(q.x,q.y,rx,ry); });
      if(form==='plenilunar'){ p.F(M.blood[1]); p.poly(W(sk,[[5,-16],[12,-17],[12.6,-8],[8,-6],[5.6,-10]])); p.F(M.blood[2]); p.poly(W(sk,[[7,-10],[11.4,-11],[12,-7],[8.6,-6.4]])); }
      if(form!=='comum'){ p.F(M.glow[1]); [[[-9.4,-24],[-11.4,-29],[-10.6,-29.4],[-8.8,-24.6]],[[-6.6,-20],[-3,-15],[-3.6,-14.4],[-7,-19.4]]].forEach(f=>p.poly(W(sk,f))); }
    });
    // babado do decote (por cima dos ombros), borda recortada
    const fr=[[-13.8,-35.2],[-6,-36.4],[2,-36.2],[9.6,-33.8],[13.6,-30.4]], fb=[];
    for(let i=0;i<=12;i++){ const t=i/12, u=13.8-27.4*t, v=-28.6-3.6*t+((i%2)?1.3:0)+(t<0.5?0:-1.2*(t-0.5)); fb.push([u,v]); }
    const frill=W(sk,fr.concat(fb));
    p.F(M.lace[1]); p.poly(frill);
    clip(c,frill,()=>{ p.F(M.lace[0]); p.poly(W(sk,[[0,-37],[10,-34.6],[14,-30],[8,-31],[0,-33.6]]));
      p.F(M.lace[2]); p.poly(W(sk,[[-16,-38],[-6,-38],[-6.6,-28],[-16,-28]])); p.F(M.lace[3]); p.poly(W(sk,[[-16,-38],[-10.4,-38],[-10.8,-28],[-16,-28]]));
      eyelets(p,M,M.lace,(a,b)=>Wp(sk,a,b),-8,12,-34,-31.4,4.4,2.6,0.85);
      p.F(M.lace[2]); fb.forEach(([a,b],i)=>{ if(i%2) { const q=Wp(sk,a,b-0.9); p.rect(q.x-0.5,q.y-0.5,1,1); } }); });
    // babado da barra (peplum) por cima da saia
    const pb=[[-12.4,1.6],[12.8,1.6]]; for(let i=0;i<=10;i++){ const t=i/10; pb.push([12.8-25.6*t, 6.6+((i%2)?1.4:0)]); }
    const pep=W(sk,pb); p.F(M.lace[1]); p.poly(pep);
    clip(c,pep,()=>{ p.F(M.lace[2]); p.poly(W(sk,[[-16,0],[-5,0],[-4,10],[-16,10]])); p.F(M.lace[0]); p.poly(W(sk,[[4,1.6],[12.8,1.6],[12.8,2.4],[4,2.4]])); p.F(M.lace[2]); p.poly(W(sk,[[-16,6.4],[16,6.4],[16,10],[-16,10]])); });
    // pano da costa listrado no ombro de trás, descendo pelas costas
    const pc=W(sk,[[-7.6,-37],[-2.4,-37.6],[-6.6,-30],[-10.4,-18],[-12.2,-6],[-14.6,-4],[-14.4,-16],[-12.6,-30]]);
    p.F(M.blue[1]); p.poly(pc);
    clip(c,pc,()=>{ for(let k=0;k<6;k++){ const v=-35+k*5.4; p.F(M.red[1]); p.poly(W(sk,[[-16,v-1.6],[0,v-3.6],[0,v-2.4],[-16,v-0.4]])); p.F(M.yel[1]); p.poly(W(sk,[[-16,v],[0,v-2],[0,v-0.6],[-16,v+1.4]])); p.F(M.blue[0]); p.poly(W(sk,[[-16,v+2.2],[0,v+0.2],[0,v+0.8],[-16,v+2.8]])); }
      p.F(M.blue[2]); p.poly(W(sk,[[-16,-40],[-11,-40],[-12.4,-4],[-16,-4]])); p.F(M.soot[2]); { const q=Wp(sk,-11,-12); p.ell(q.x,q.y,1.6,2.2); } });
    p.F(M.blue[2]); [[-14.4,-4],[-13.4,-3],[-12.4,-4]].forEach(([a,b])=>{ const q=Wp(sk,a,b); p.rect(q.x-0.4,q.y,0.8,2); }); // franja
    // contas simples e neutras (dois fios) + veias brilhando no colo
    const strand=(pts,R,r,step)=>{ for(let t=0;t<=1.0001;t+=step){ const a=pts[0],b=pts[1],d=pts[2]; const u=(1-t)*(1-t)*a[0]+2*(1-t)*t*b[0]+t*t*d[0], v=(1-t)*(1-t)*a[1]+2*(1-t)*t*b[1]+t*t*d[1]; const q=Wp(sk,u,v);
      p.F(R[2]); p.circle({x:q.x+0.3,y:q.y+0.3},r); p.F(R[1]); p.circle(q,r*0.8); p.F(R[0]); p.rect(q.x-r*0.6,q.y-r*0.6,r*0.7,r*0.6); } };
    strand([[-3.4,-37.4],[5,-28],[10.6,-33.6]],M.bead,1.15,0.09);
    strand([[-4.6,-36.4],[6,-21],[12.4,-30]],M.beadD,1.25,0.08);
  }

  /* ---------- cabeça: turbante alto, rosto de pele escura podre, olhos de lua, argola ---------- */
  function drawHead(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.xf(sk.ha,sk.neck.x,sk.neck.y); c.scale(HS,HS);
    // pescoço
    p.F(M.skin[1]); p.poly([[-3.6,4],[4.6,4],[5.4,-4.4],[-3.4,-6]]);
    p.F(M.skin[2]); p.poly([[-3.6,4],[-0.4,4],[-1,-5.4],[-3.4,-6]]);
    p.F(M.vein[0]); p.poly([[2,-4],[2.8,-4],[3.6,2],[2.8,2.2]]); p.F(M.vein[1]); p.poly([[3.4,-1],[4,-1],[5,2.6],[4.4,2.8]]);
    // crânio e rosto
    p.F(M.skin[1]); p.ell(2.4,-12.6,8.8,9);
    p.poly([[-3.4,-6],[10.6,-7.6],[11.8,-4.2],[6,-2.4],[-2,-3]]);
    p.F(M.skin[2]); p.poly([[-6.6,-15],[-4.6,-6],[0,-2.4],[6,-2.4],[2,-5],[-1.6,-9],[-2.6,-14],[-5,-18]]);
    p.F(M.skin[3]); p.poly([[-6.6,-14],[-6,-9],[-4,-5.2],[-4.6,-11]]);
    p.F(M.skin[0]); p.poly([[5.4,-8.4],[9.4,-9],[8.8,-7.6],[5.6,-7.4]]); // maçã do rosto
    p.F(M.skin[0]); p.rect(9.6,-15.4,1.2,2.6); // testa
    // orelha + argola
    p.F(M.skin[1]); p.ell(-2,-10.6,2.1,3); p.F(M.skin[3]); p.ell(-1.8,-10.4,1,1.7);
    p.F(M.metal[2]); p.ell(-2.2,-5.6,2,2.4); p.F(M.skin[2]); p.ell(-2.2,-5.6,1.2,1.6); p.F(M.metal[0]); p.rect(-4,-6.4,0.8,1.2);
    // sobrancelha + olho de lua
    p.F(M.hair[1]); p.poly([[5,-13],[8.6,-13.8],[11.4,-13],[11.2,-12.3],[8.6,-13],[5.2,-12.3]]);
    p.F(M.skin[4]); p.poly([[3,-12],[9,-12.6],[10.4,-8],[7,-6.6],[3.4,-7.6]]); // plano da face na meia-luz
    p.F(M.skin[3]); p.ell(8.4,-10.2,3,2.2);
    p.F(M.glow[2]); p.ell(8.8,-10,2.8,1.9); p.F(M.eye[3]); p.ell(8.8,-10,2.3,1.5); p.F(M.eye[2]); p.ell(8.9,-10,1.9,1.2); p.F(M.eye[1]); p.ell(9,-10.1,1.3,0.8); p.F(M.eye[0]); p.rect(8.7,-10.6,1.1,0.7);
    p.F(M.skin[2]); p.poly([[5.8,-11.6],[11,-11.8],[10.8,-10.8],[6,-10.9]]); // pálpebra pesada
    p.F(M.skin[3]); p.poly([[6.4,-8.4],[10,-8.6],[10,-8],[6.8,-7.8]]); // olheira funda
    p.F(M.skin[3]); p.poly([[10.8,-6],[11.4,-6],[10.2,-3.6],[9.6,-3.8]]); // sulco do nariz à boca
    p.F(M.skin[3]); p.rect(6.8,-14.6,3,0.5); p.rect(7.6,-13.9,2.2,0.4); // rugas da testa
    p.F(M.skin[0]); p.rect(9.6,-12.2,1.6,0.5); // osso da sobrancelha
    // rasgo na bochecha: gengiva e dentes à mostra
    p.F(M.mouth[2]); p.poly([[3.4,-6.6],[6.4,-6.2],[6.8,-3.6],[3.8,-3.8]]); p.F(M.flesh[2]); p.poly([[3.4,-6.6],[6.4,-6.2],[6.2,-5.6],[3.6,-5.8]]);
    p.F(M.teeth[1]); p.rect(4.2,-5.6,0.9,1.4); p.rect(5.4,-5.4,0.9,1.4); p.F(M.teeth[2]); p.rect(4.2,-4.4,2.1,0.4);
    p.F(M.rot[1]); p.ell(4.8,-9.8,1.1,0.8);
    // nariz largo
    p.F(M.skin[1]); p.poly([[10.8,-11],[13.4,-7.6],[13.6,-6],[11,-5.6]]);
    p.F(M.skin[3]); p.ell(12.2,-6.2,1.2,0.7); p.F(M.skin[0]); p.rect(11.4,-9.6,0.8,1.6);
    // lábio de cima carnudo
    p.F(M.mouth[1]); p.poly([[6,-4.6],[12.8,-5],[12.6,-2.6],[6,-2.4]]);
    p.F(M.skin[2]); p.poly([[7,-5.6],[12.6,-5.8],[13.2,-4.6],[7.4,-4.4]]); p.F(M.skin[0]); p.rect(9,-5.8,2.4,0.5);
    p.F(M.teeth[1]); [[8,-4.6,1.1,1.4],[9.6,-4.6,1.1,1.6],[11.2,-4.6,1,1.2]].forEach(([x,y,w,h])=>p.rect(x,y,w,h));
    p.F(M.rot[1]); p.ell(1.6,-8.4,1.6,1.2); p.F(M.rot[2]); p.rect(1,-8.8,1,0.9);
    p.F(M.flesh[2]); p.poly([[4,-6],[6,-6.6],[6.6,-5],[4.6,-4.8]]);
    if(form!=='comum'){ p.F(M.glow[0]); p.rect(8.2,-10.4,1.8,1.1); }
    // nuca: cabelo crespo aparecendo embaixo do turbante
    p.F(M.hair[1]); p.poly([[-7.6,-12.6],[-4.6,-12],[-2.4,-13.4],[-3.6,-8.4],[-6.4,-8.4]]); p.F(M.hair[0]); p.rect(-6,-11.6,1,0.6); p.rect(-4.4,-10.4,1,0.6);
    p.F(M.skin[3]); p.poly([[2,-16],[10.6,-14.6],[10.8,-13.2],[6,-13.6],[2,-14.6]]); // sombra do turbante na testa
    drawTurban(c,p,M,form);
    p.id();
  }
  function drawTurban(c,p,M,form){
    // torço de baiana: volume largo e arredondado, 2–3 voltas grandes na diagonal e o leque do laço no alto de trás
    c.save(); c.translate(2,-14); c.scale(0.86,0.8); c.translate(-2,14);
    const fan=[[-6,-29.6],[-14,-35.4],[-12.4,-39.6],[-7.4,-41.8],[-1.6,-40.6],[1.4,-35.6],[-1.6,-31]];
    p.F(M.lace[1]); p.poly(fan);
    clip(c,fan,()=>{ p.F(M.lace[0]); p.poly([[-7.4,-41.8],[-1.6,-40.6],[0.8,-37],[-4,-37.4]]);
      p.F(M.lace[4]); p.poly([[-16,-36],[-10,-40],[-6,-31],[-16,-30]]); p.F(M.lace[2]); p.poly([[-16,-36.4],[-12.6,-38],[-6,-30],[-16,-29]]);
      p.F(M.lace[2]); [[-12.2,-39.4],[-7.4,-41.4],[-2.6,-40.2]].forEach(([x,y])=>p.poly([[-5.6,-31],[x,y],[x+1.4,y+0.6],[-4.6,-31.4]])); // pregas do leque
      p.F(M.lace[3]); p.poly([[-6.6,-31.6],[-4,-33],[-2.6,-31],[-5,-29.6]]); });
    const T0=[[10.8,-14],[13,-19],[13.6,-25],[11.6,-30.4],[6.6,-33.8],[0,-34.8],[-6.6,-33.6],[-12,-29.6],[-15,-23.6],[-14.6,-17.4],[-11.6,-13],[-7.6,-11.6],[-4,-12.6],[-1,-14.8],[5,-15.6]];
    p.F(M.lace[1]); p.poly(T0);
    clip(c,T0,()=>{
      p.F(M.lace[4]); p.poly([[-16,-36],[2,-36],[-1,-26],[1,-12],[-16,-11]]);
      p.F(M.lace[2]); p.poly([[-16,-36],[-6,-36],[-8.4,-26],[-6.4,-12],[-16,-11]]);
      p.F(M.lace[3]); p.poly([[-16,-30],[-12.6,-30],[-14.2,-22],[-12.4,-13],[-16,-12]]);
      p.F(M.lace[0]); p.poly([[1,-35],[8,-33],[12.6,-27],[11.4,-24.6],[5,-28.6],[-1,-31.6]]);
      // volta de cima (sombra larga embaixo da sobreposição, luz na borda)
      p.F(M.lace[2]); p.poly([[14,-23.6],[3,-26],[-7,-30.6],[-16,-29.6],[-16,-26],[-7,-27],[3,-22.6],[14,-20.6]]);
      p.F(M.lace[3]); p.poly([[-16,-29.6],[-7,-30.6],[-3,-28.8],[-8,-28.2],[-16,-27.8]]);
      p.F(M.lace[0]); p.poly([[14,-24.6],[3,-27],[-6,-31.4],[-5,-32.2],[4,-28.2],[14,-25.6]]);
      // volta de baixo, sobre a testa
      p.F(M.lace[4]); p.poly([[12,-17.4],[1,-19.4],[-9,-23],[-16,-22.4],[-16,-19.8],[-9,-20],[1,-16.2],[12,-14.4]]);
      p.F(M.lace[2]); p.poly([[-16,-22.4],[-9,-23],[-6,-21.6],[-16,-20.6]]);
      p.F(M.lace[0]); p.poly([[12,-18.4],[2,-20.4],[-4,-22.6],[-3,-23.2],[3,-21.2],[12.4,-19.2]]);
      p.F(M.blood[2]); p.ell(10.6,-15.6,1,1.2);
      if(form==='enluarado'){ p.F(M.glow[1]); p.poly([[-3,-33],[-1,-27.6],[-1.6,-27.2],[-3.6,-32.6]]); }
      if(form==='plenilunar'){ p.F(M.dende[2]); p.ell(-10,-18,1.6,1.2); }
    });
    c.restore();
  }
  function drawJaw(c,u,M,sk,P){
    const p=mkPen(c,u); const h=sk.H(2.8,-3.4); p.xf(sk.ha+rad(P.jaw),h.x,h.y); c.scale(HS,HS);
    p.F(M.skin[1]); p.poly([[-2,-1.4],[10.4,-0.8],[11.2,1.6],[10.2,5],[6.2,6.4],[0.6,5.6],[-2.4,2.8]]);
    p.F(M.skin[2]); p.poly([[-2.4,2.8],[0.6,5.6],[6.2,6.4],[10.2,5],[8.8,4.4],[4,4.6],[0,3.4]]);
    p.F(M.skin[3]); p.poly([[1,5.6],[6.2,6.4],[9.2,5.6],[4,5.6]]);
    p.F(M.mouth[1]); p.poly([[3,-0.8],[10,-0.4],[10,1.6],[3.4,1.4]]);
    // lábio de baixo carnudo
    p.F(M.skin[1]); p.poly([[4.4,1.4],[10.6,1],[11,2.6],[5,2.8]]); p.F(M.skin[0]); p.rect(6.6,1.4,2.6,0.5);
    p.F(M.teeth[1]); [[5,-1,1.1,1.5],[6.6,-1,1.1,1.8],[8.2,-1,1.1,1.4]].forEach(([x,y,w,h])=>p.rect(x,y,w,h));
    p.F(M.tongue[1]); p.poly([[4.4,0.6],[8.6,0.4],[9.6,1.2],[5,1.4]]);
    const L=2+(P.drool%4)*1.1+(P.jaw>30?2:0);
    p.F(M.dende[2]); p.poly([[9.4,4.4],[10.6,3.8],[10.4,3.8+L],[9.8,4.8+L]]); p.ell(10.1,4.8+L,0.9,0.9);
    p.id();
  }
  function drawMouthIn(c,u,M,sk,P){
    if(P.jaw<16) return; const p=mkPen(c,u); p.id();
    const a=sk.H(6,-2.4), b=sk.H(12.6,-2.6), h=sk.H(2.8,-3.4), ja=sk.ha+rad(P.jaw), jc=Math.cos(ja), js=Math.sin(ja);
    const J=(x,y)=>({x:h.x+(x*jc-y*js)*HS,y:h.y+(x*js+y*jc)*HS}), d=J(10.2,0.6), e=J(3.2,0.6);
    p.F(M.mouth[2]); p.poly([[a.x,a.y],[b.x,b.y],[d.x,d.y],[e.x,e.y]]);
    p.F(M.tongue[1]); const m=lerp(lerp(a,b,0.35),lerp(e,d,0.35),0.6); p.ell(m.x,m.y,2,1.2); p.F(M.tongue[0]); p.rect(m.x-0.6,m.y-0.6,1,0.5);
  }

  /* ---------- rastros (smear) e jato de dendê ---------- */
  function arcSmear(p,M,o,w,span,th){
    const r=Math.hypot(w.x-o.x,w.y-o.y)+2, a1=Math.atan2(w.y-o.y,w.x-o.x);
    const n=10, pts=[]; for(let i=0;i<=n;i++){ const a=a1-span+span*1.04*i/n; pts.push([o.x+Math.cos(a)*r,o.y+Math.sin(a)*r]); }
    for(let i=n;i>=0;i--){ const a=a1-span+span*1.04*i/n, rr=r-2-th*(i/n); pts.push([o.x+Math.cos(a)*rr,o.y+Math.sin(a)*rr]); }
    p.F(M.swish[0]); p.poly(pts.map(([x,y])=>[Math.max(1,Math.min(FW-2,x)),Math.max(1,Math.min(GROUND,y))]));
    p.F(M.swish[2]); const q=pts.slice(n-3,n+1); for(let k=0;k<q.length-1;k++) p.cap({x:q[k][0],y:q[k][1]},{x:q[k+1][0],y:q[k+1][1]},0.9,0.9);
  }
  function drawSmear(c,u,M,sk,P){ const p=mkPen(c,u); p.id(); arcSmear(p,M,sk.shF,sk.ltip,1.4,8); }
  function drawTraySmear(c,u,M,sk,P){ const p=mkPen(c,u); p.id(); arcSmear(p,M,sk.shB,sk.TL(31,-3),1.0,10); }
  function drawPour(c,u,M,sk,P){
    // jato de dendê saindo da boca da panela e indo pra frente em arco
    const p=mkPen(c,u); p.id(); const ga=rad(P.pa)+sk.ra, o={x:sk.zh.x+15*Math.cos(ga)+2*Math.sin(ga),y:sk.zh.y+15*Math.sin(ga)-2*Math.cos(ga)};
    const pts=[], n=8; for(let i=0;i<=n;i++){ const t=i/n; pts.push([o.x+t*44, o.y-10*Math.sin(t*PI*0.9)+t*4-1.6]); }
    for(let i=n;i>=0;i--){ const t=i/n; pts.push([o.x+t*44, o.y-10*Math.sin(t*PI*0.9)+t*4+1.6+t*3]); }
    p.F(M.dende[1]); p.poly(pts);
    p.F(M.dende[0]); for(let i=1;i<n;i++){ const t=i/n; p.rect(o.x+t*44-1,o.y-10*Math.sin(t*PI*0.9)+t*4-1.2,2.4,0.8); }
    p.F(M.dende[2]); [[14,4],[24,6],[34,5],[42,8]].forEach(([dx,dy])=>p.circle({x:o.x+dx,y:o.y+dy},1.2));
    p.F(M.smoke[1]); [[8,-8],[20,-12],[32,-9]].forEach(([dx,dy])=>p.ell(o.x+dx,o.y+dy,2,1.4));
  }
  // dendê derramado no chão + panela rolando (morte)
  function drawSpill(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    if(P.spill>0){ const s=P.spill, x=AX+58+14*s, y=GROUND-1.4;
      p.F(M.dende[3]); p.ell(x,y+0.6,8+22*s,2+2.6*s); p.F(M.dende[2]); p.ell(x,y,7+20*s,1.6+2.2*s); p.F(M.dende[1]); p.ell(x+2,y-0.4,4+14*s,1+1.4*s);
      p.F(M.dende[0]); [[-6,0],[4,-0.6],[12,0.2]].forEach(([dx,dy])=>p.rect(x+dx*s,y+dy,1.6,0.6)); }
    if(P.pdx>0){ potAt(c,p,M,form,AX+P.pdx,GROUND-7.4,rad(90+P.pr*0.1),1,0,P.stm,{noSteam:true,noSpark:true}); }
  }

  /* ---------- adereço: dendê voando ---------- */
  const PW=40, PH=32, PG=18, PAX=20;
  function frameProp(form,st,K){
    const M=mats(form), s=((st|0)%4+4)%4;
    const parts=[
      {noShade:true, noRim:true, smear:true, draw:(c,u)=>{ const p=mkPen(c,u); p.id(); p.F(M.dende[2]); p.poly([[2,PG-2],[12,PG-4+s*0.4],[12,PG+2],[3,PG+1]]); p.F(M.smoke[1]); p.ell(8,PG-7-s,2.4,1.6); }},
      {draw:(c,u)=>{ const p=mkPen(c,u); p.id(); const w=[1,0.86,1.08,0.94][s];
        p.F(M.dende[2]); p.ell(PAX,PG,8*w,5.6/w); p.F(M.dende[1]); p.ell(PAX+0.6,PG-0.6,6.6*w,4.4/w); p.F(M.dende[0]); p.ell(PAX+2,PG-2,2.6,1.4);
        p.F(M.dende[1]); [[-9,2],[-7,-4],[8,4]].forEach(([dx,dy],k)=>p.circle({x:PAX+dx*w,y:PG+dy+((s+k)%2)},1.6));
        p.F(M.dende[0]); p.rect(PAX-3,PG-3+s%2,1.2,1.2); if(form==='plenilunar'){ p.F(M.glow[0]); p.rect(PAX+5,PG-5,1,1); p.rect(PAX-6,PG-6+s,1,1); } }},
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
      {back:true, draw:(c,u)=>drawArmUpper(c,u,M,sk,P,false)},
      {back:true, draw:(c,u)=>drawLeg(c,u,M,sk,P,false)},
      {draw:(c,u)=>drawLeg(c,u,M,sk,P,true)},
    ];
    if(P.spill>0||P.pdx>0) parts.push({draw:(c,u)=>drawSpill(c,u,M,sk,P,form)});
    parts.push({draw:(c,u)=>drawSkirt(c,u,M,sk,P,form)}, {draw:(c,u)=>drawTorso(c,u,M,sk,P,form)});
    parts.push({draw:(c,u)=>{ drawHead(c,u,M,sk,P,form); drawMouthIn(c,u,M,sk,P); }}, {draw:(c,u)=>drawJaw(c,u,M,sk,P)});
    if(P.tl>=0.5) parts.push({draw:(c,u)=>drawTray(c,u,M,sk,P,form,true)});
    parts.push({draw:(c,u)=>drawForearm(c,u,M,sk,P,false,form)});
    if(P.tl<0.5) parts.push({draw:(c,u)=>drawTray(c,u,M,sk,P,form,false)}, {draw:(c,u)=>drawTrayHand(c,u,M,sk)});
    if(P.tsmear>=0.5) parts.push({noShade:true, smear:true, noRim:true, draw:(c,u)=>drawTraySmear(c,u,M,sk,P)});
    if(P.smear>=0.5&&P.cz>=0.5) parts.push({noShade:true, smear:true, noRim:true, draw:(c,u)=>drawSmear(c,u,M,sk,P)});
    parts.push({draw:(c,u)=>drawArmUpper(c,u,M,sk,P,true)}, {draw:(c,u)=>drawForearm(c,u,M,sk,P,true,form)});
    if(P.dpour>=0.5) parts.push({noShade:true, smear:true, noRim:true, draw:(c,u)=>drawPour(c,u,M,sk,P)});
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM[form]}); if(step>=4) heavyOutline(cv);
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._eye=sc(sk.H(8.8,-10)); cv._mouth=sc(sk.H(10,-2)); cv._hand=sc(sk.wrF); cv._head=sc(sk.H(2,-14)); cv._handB=sc(sk.wrB); cv._tray=sc(sk.TL(19,-6));
    cache.set(key,cv); if(cache.size>900) cache.delete(cache.keys().next().value);
    return cv;
  }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame,framePose:function(form,anim,P,key){ return frame(form,anim,0,5,P,key); }};
})();
