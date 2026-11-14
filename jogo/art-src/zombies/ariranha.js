/* ARIRANHA — fonte de arte (editável). Build: npm run art
   Ariranha Zumbi (Pantanal, comum animal): lontra gigante (Pteronura brasiliensis) morta e de pé de novo.
   Esqueleto próprio de quadrúpede: coluna curva (quadril -> ombro, com arco), pescoço grosso, cabeça larga e
   achatada com mandíbula articulada, 4 patas curtas de 2 juntas com pés palmados, cauda achatada em remo de 7 gomos.
   Corpo de torpedo, pelo curto molhado (brilho de água no dorso, tufos espetados), babador creme manchado na
   garganta (único de cada animal), focinho preto com bigodes. Ergue-se nas patas traseiras ("periscópio") pra
   vigiar e guinchar. Corrupção da Lua de Sangue: olhos de lua, pelo caindo com pele roxa e costelas à mostra,
   osso da mandíbula exposto, aguapé e algas pendurados no dorso, sangue na boca.
   Formas: comum (marrom molhado), enluarado (pelo azul-escuro, rachaduras ciano), plenilunar (pelo vermelho-sangue,
   espinhos de osso na espinha, olhos laranja). Hi-bit: honra PIX.getK().
   Ângulos do corpo: graus "pra cima" a partir da frente (0 = horizontal pra frente, 90 = em pé).
   Ângulos das patas: graus a partir da vertical pra baixo (+ = pra frente). */
const ARIRANHA=(function(){
  const {rad,lerp,mkPen,compose}=PIX;
  const FW=224, FH=164, GROUND=156, AX=112;
  // escala do desenho: a geometria é feita em unidades /SC e o PIX desenha com K*SC (ancorada em AX/GROUND)
  const SC=1.2, G0=GROUND/SC, A0=AX/SC, FW0=FW/SC;
  const RIM={comum:'#d8e4f4', enluarado:'#9ff6ff', plenilunar:'#ffb46a'};

  /* ---------- materiais ---------- */
  function mats(form){
    const m={
      fur:['#c08e64','#5e3a28','#321c16','#160a12'],
      sheen:['#fffaee','#eccca6','#9a7860','#4a3634'],
      bib:['#fffcee','#f2e4c4','#c4a886','#7a624c'],
      nose:['#6e5e62','#2c2022','#1a1012','#0e0808'],
      skin:['#c4a2c4','#80588c','#523666','#301c42'],
      flesh:['#f6ae94','#c25a5e','#7a3a4a','#4a1c34'],
      bone:['#fff4d8','#dccfa6','#a09070','#605040'],
      teeth:['#fffbe6','#ece2c2','#ac9c72','#665a40'],
      mouth:['#a43c4c','#6a1e30','#3e0e1c','#200610'],
      tongue:['#f48c98','#c44c5a','#8a2a3e','#521428'],
      eye:['#ffffff','#fff2b0','#e8b830','#8a5a14'],
      glow:['#fffbe0','#f4e8a0','#b8a860','#6a6034'],
      algae:['#a2b866','#5e7e38','#38522a','#1e3020'],
      leaf:['#b0dc78','#62a040','#356a30','#1a3a20'],
      flower:['#f4dcff','#bc8ee2','#7c56b2','#46307a'],
      claw:['#ece0cc','#ac9e8c','#6c6058','#3a3034'],
      blood:['#c84a3e','#8e2a2c','#5e1824','#3a0e1a'],
      acid:['#d8f070','#9ac040','#5a8030','#30481e'],
      water:['#ffffff','#d6efff','#86bee0','#4878a8'],
      swish:['#fdfdff','#e6f0ff','#b4c4e8','#7484b0'],
      wave:['#ffffff','#ffe6f0','#f4a4c4','#a85484'],
    };
    if(form==='enluarado'){
      m.fur=['#8c9ce2','#3e4a8c','#26285e','#141436']; m.sheen=['#f0faff','#a8c4f0','#6a82c0','#3a4880'];
      m.bib=['#eef4ff','#b8c6ea','#7c88b8','#464e7a']; m.skin=['#b8e8ff','#5aa8d8','#2e6a9e','#1a3a68'];
      m.flesh=['#f0b0ff','#b866d8','#7a3a9e','#46206a']; m.blood=['#b46ad8','#7e3ea6','#542474','#34144a'];
      m.eye=['#ffffff','#b8fbff','#4ad8f0','#1a8aa8']; m.glow=['#effffe','#7af4ff','#2ab0d8','#146a96'];
      m.algae=['#8adcc8','#3a9a8a','#22605e','#123a40']; m.leaf=['#9ae0d0','#46a090','#286660','#143a3a'];
      m.mouth=['#8a4a9a','#52226a','#30104a','#1a0830']; m.tongue=['#e09ae8','#a85ab8','#6e3482','#40185a'];
      m.nose=['#5e6488','#22254a','#141634','#0a0a1e'];
    }
    if(form==='plenilunar'){
      m.fur=['#e6825e','#8e2c26','#581420','#2e0a14']; m.sheen=['#fff0d0','#f4b08a','#b8604e','#6a2a2a'];
      m.bib=['#ffe4c4','#eab494','#aa6c5a','#5e3434']; m.skin=['#ffb08a','#d8603e','#9a2c2c','#5a1420'];
      m.eye=['#fffbe0','#ffe04a','#ff8a2a','#b83a14']; m.glow=['#fff6c0','#ffb43a','#e0581e','#8a2414'];
      m.blood=['#ff7a3a','#d43a26','#8a1c22','#4e0c18']; m.algae=['#c0a060','#7a6a30','#4a3e22','#2a2014'];
      m.bone=['#fff8e0','#f0d8a8','#b89070','#6a4a3a'];
    }
    return punch(m);
  }
  const NAMES={fur:'Pelo molhado',sheen:'Brilho da água',bib:'Babador',nose:'Focinho/pés',skin:'Pele exposta',flesh:'Carne',bone:'Osso',teeth:'Dentes',mouth:'Boca',tongue:'Língua',eye:'Olho de lua',glow:'Brilho',algae:'Algas',leaf:'Aguapé (folha)',flower:'Aguapé (flor)',claw:'Garras',blood:'Sangue',acid:'Ácido',water:'Água',swish:'Rastro da mordida',wave:'Onda do guincho'};
  function sat(h,k){ const [r,g,b]=PIX.hexRgb(h), y=(r+g+b)/3; return PIX.toHex(y+(r-y)*k,y+(g-y)*k,y+(b-y)*k); }
  const NOPUNCH={swish:1,glow:1,water:1,wave:1};
  function punch(m){ const o={}; for(const k in m){ const r=m[k]; o[k]=NOPUNCH[k]?[r[0],r[1],r[2],r[3]]:[sat(r[0],1.1),sat(r[1],1.16),PIX.mix(sat(r[2],1.1),'#2a1a4c',0.2),PIX.mix(r[3],'#140a24',0.34)]; } return o; }

  /* ---------- poses ---------- */
  // pitch = inclinação do tronco; arch = arco do dorso; neck/head relativos; jaw = boca aberta (graus).
  // fF*/fB* = pata dianteira de cá/de lá (s = braço, e = antebraço, p = mão); hF*/hB* = traseiras (s coxa, k canela, p pé).
  // t1 = caimento da base da cauda (+ desce), t2 = curva por gomo, tw/tp = onda da cauda.
  // sub = afundado na água (0..1, some abaixo do chão); splash/bub = espirro e bolhas; wave = onda do guincho; dust = esguicho do deslize.
  const REST={hx:0,lift:0,rot:0,pitch:2,arch:2,neck:26,head:-18,jaw:4,
    fFs:4,fFe:-4,fFp:0,fBs:-10,fBe:-14,fBp:0,hFs:-14,hFk:22,hFp:0,hBs:4,hBk:32,hBp:0,
    t1:4,t2:-1.5,tw:0,tp:0,flash:0,smear:0,wave:0,sub:0,splash:0,bub:0,drool:0,dust:0,ear:0};
  const S=Math.sin, C=Math.cos, PI=Math.PI, mx=Math.max;
  // periscópio: tronco em pé sentado nos quadris, cauda no chão, mãos recolhidas no peito
  const PERI={pitch:72,arch:-3,neck:12,head:-84,jaw:6,fFs:24,fFe:72,fFp:70,fBs:14,fBe:60,fBp:70,hFs:44,hFk:-62,hFp:-6,hBs:30,hBk:-70,hBp:-6,t1:-58,t2:4,tw:3};
  const PE=o=>Object.assign({},PERI,o);
  // deitada de lado (patas pro alto)
  const LIE={pitch:-2,arch:2,neck:4,head:-6,jaw:22,fFs:120,fFe:150,fFp:-30,fBs:100,fBe:130,fBp:-30,hFs:-120,hFk:-150,hFp:30,hBs:-100,hBk:-128,hBp:30,t1:8,t2:2};
  const LI=o=>Object.assign({},LIE,o);
  const ANIMS={
    idle:{nome:'Periscópio (ergue o tronco e vigia)',n:8,dur:()=>160,pose:i=>{ const p=i/8*PI*2, s=S(p);
      return PE({head:-84+12*s, neck:12+4*S(p+0.8), pitch:72+2*S(2*p), jaw:5+5*mx(0,S(3*p)), hx:0.6*s, fFe:72+8*S(p+1), fBe:60+8*S(p+1.4), tw:3+2*S(p), tp:p, ear:i%4===1?1:0, drool:i%4}); }},
    walk:{nome:'Gingado de lontra (dorso arqueia)',n:8,dur:()=>110,pose:i=>{ const p=i/8*PI*2;
      const hF=-12+24*S(p), hB=-12+24*S(p-0.6), fF=6+24*S(p+PI), fB=6+24*S(p+PI-0.6);
      return {arch:3+5*mx(0,S(p+0.4)), pitch:2+3*S(p+0.6), lift:1.6*mx(0,S(2*p)), hx:1.2*S(p),
        hFs:hF, hFk:hF+28+18*mx(0,C(p)), hFp:-14*mx(0,C(p)), hBs:hB, hBk:hB+28+18*mx(0,C(p-0.6)), hBp:-14*mx(0,C(p-0.6)),
        fFs:fF, fFe:fF-8-22*mx(0,C(p+PI)), fFp:-30*mx(0,C(p+PI)), fBs:fB, fBe:fB-8-22*mx(0,C(p+PI-0.6)), fBp:-30*mx(0,C(p+PI-0.6)),
        neck:26+5*S(2*p+0.6), head:-18-4*S(2*p+0.6), jaw:6+4*mx(0,S(2*p)), t1:2, t2:-1, tw:7, tp:p*1.0, drool:i%4}; }},
    alert:{nome:'Alerta (sobe no periscópio e guincha)',n:7,dur:i=>[140,120,120,110,120,150,170][i],pose:i=>[
      {neck:34,head:-26,jaw:8,hx:-1},
      {pitch:36,arch:-1,neck:22,head:-52,jaw:12,fFs:20,fFe:50,fFp:40,fBs:10,fBe:40,fBp:40,hFs:20,hFk:-30,hBs:10,hBk:-40,t1:-30,t2:2},
      PE({jaw:18,head:-80,neck:16}),
      PE({jaw:40,head:-62,neck:22,pitch:76,wave:1,hx:-1}),
      PE({jaw:46,head:-58,neck:24,pitch:78,wave:2,hx:-1,fFe:90,fBe:80}),
      PE({jaw:32,head:-70,neck:18,wave:1}),
      {pitch:20,arch:0,neck:30,head:-30,jaw:14,fFs:16,fFe:6,hFs:4,hFk:20,t1:-10}][i]},
    // ---- golpes (IA: hit = quadros do dano, warn = aviso, reach = alcance em px) ----
    attack:{nome:'Mordidas em rajada (3; 4 no plenilunar)',n:9,warn:[0,2],hit:[3,5,7],reach:30,dur:i=>[130,120,90,70,90,70,90,80,170][i],pose:i=>[
      {neck:34,head:-14,jaw:20,hx:-2,pitch:6,arch:7,hFs:-20,hFk:20,fFs:-4,fFe:-10},
      {neck:44,head:-6,jaw:36,hx:-5,pitch:10,arch:9,hFs:-24,hFk:18,fFs:-10,fFe:-16,fBs:-16},
      {neck:50,head:-4,jaw:44,hx:-6,pitch:12,arch:10,hFs:-26,hFk:16,fFs:-14,fFe:-20,fBs:-18,ear:1},
      {neck:2,head:-6,jaw:2,hx:7,pitch:-2,arch:1,smear:1,hFs:-30,hFk:6,hBs:-20,hBk:10,fFs:30,fFe:24,fBs:22,fBe:16,drool:1},
      {neck:20,head:-4,jaw:38,hx:4,pitch:2,arch:4,fFs:16,fFe:8},
      {neck:-2,head:-10,jaw:0,hx:9,pitch:-4,arch:0,smear:1,hFs:-32,hFk:4,fFs:34,fFe:28,fBs:26,fBe:20,drool:2},
      {neck:18,head:4,jaw:40,hx:6,pitch:2,arch:4,fFs:18,fFe:10},
      {neck:-6,head:-16,jaw:2,hx:11,pitch:-6,arch:-1,smear:1,hFs:-34,hFk:2,hBs:-24,hBk:6,fFs:38,fFe:30,fBs:28,fBe:22,drool:3},
      {neck:30,head:-30,jaw:16,hx:5,pitch:2,arch:5,tw:8,tp:2}][i]},
    dash:{nome:'Arrancada (desliza de barriga)',n:8,warn:[0,2],run:[3,6],reach:120,dur:i=>[140,130,110,70,70,70,70,170][i],pose:i=>[
      {arch:10,pitch:-2,neck:10,head:-8,jaw:10,hFs:-2,hFk:34,hBs:6,hBk:40,fFs:-6,fFe:-12,hx:-1},
      {arch:13,pitch:-4,neck:4,head:-6,jaw:16,hFs:6,hFk:44,hBs:12,hBk:48,fFs:-12,fFe:-20,fBs:-16,fBe:-22,hx:-3,lift:-1},
      {arch:-2,pitch:6,neck:8,head:-8,jaw:24,hFs:-60,hFk:-40,hBs:-50,hBk:-30,fFs:50,fFe:60,fFp:-20,fBs:40,fBe:50,hx:2,lift:4,tw:6},
      {arch:-3,pitch:-3,neck:4,head:-6,jaw:30,hFs:-88,hFk:-100,hFp:60,hBs:-82,hBk:-96,hBp:60,fFs:-70,fFe:-90,fFp:40,fBs:-64,fBe:-84,fBp:40,t1:-4,t2:-2,tw:5,tp:0,dust:1},
      {arch:-3,pitch:-3,neck:6,head:-6,jaw:34,hFs:-88,hFk:-100,hFp:60,hBs:-82,hBk:-96,hBp:60,fFs:-70,fFe:-90,fFp:40,fBs:-64,fBe:-84,fBp:40,t1:-4,t2:-2,tw:5,tp:1.5,dust:2},
      {arch:-3,pitch:-3,neck:4,head:-4,jaw:30,hFs:-88,hFk:-100,hFp:60,hBs:-82,hBk:-96,hBp:60,fFs:-70,fFe:-90,fFp:40,fBs:-64,fBe:-84,fBp:40,t1:-4,t2:-2,tw:5,tp:3,dust:1},
      {arch:-2,pitch:-2,neck:8,head:-8,jaw:22,hFs:-80,hFk:-92,hFp:50,hBs:-76,hBk:-90,hBp:50,fFs:-40,fFe:-60,fFp:20,fBs:-36,fBe:-56,t1:-2,tw:5,tp:4.5,dust:2},
      {arch:6,pitch:4,neck:22,head:-16,jaw:10,hFs:-20,hFk:20,fFs:10,fFe:0,tw:6,tp:5}][i]},
    call:{nome:'Guincho (ergue-se e chama o bando)',n:8,warn:[0,3],call:4,dur:i=>[110,110,120,110,200,200,200,200][i],pose:i=>[
      {pitch:24,arch:0,neck:26,head:-40,jaw:8,fFs:14,fFe:30,fFp:30,hFs:10,hFk:-10,hBs:4,hBk:-20,t1:-20,t2:2},
      {pitch:50,arch:-2,neck:18,head:-64,jaw:10,fFs:20,fFe:56,fFp:50,fBs:12,fBe:46,fBp:50,hFs:30,hFk:-46,hBs:20,hBk:-56,t1:-40,t2:3},
      PE({pitch:74,neck:18,head:-68,jaw:18,ear:1}),
      PE({pitch:78,neck:22,head:-58,jaw:28,hx:-1,fFe:84,fBe:76}),
      PE({pitch:80,neck:28,head:-44,jaw:50,hx:-2,wave:1,fFe:100,fBe:92,drool:1}),
      PE({pitch:80,neck:30,head:-42,jaw:54,hx:-2,wave:2,fFe:104,fBe:96,drool:2,tw:5,tp:1}),
      PE({pitch:79,neck:28,head:-46,jaw:48,hx:-1,wave:3,fFe:98,fBe:90,drool:3,tw:5,tp:2}),
      PE({pitch:66,neck:20,head:-62,jaw:20,wave:0,tw:4,tp:3})][i]},
    // mergulho (IA-40): afunda na água e some; o último quadro é só bolhas (fica parado nele enquanto está submerso)
    dive:{nome:'Mergulho (some na água)',n:6,dur:i=>[120,100,100,110,130,160][i],pose:i=>[
      {arch:10,pitch:-2,neck:6,head:-10,jaw:6,hFs:4,hFk:40,hBs:10,hBk:44,fFs:-8,fFe:-14,hx:-2},
      {arch:8,pitch:-26,neck:-6,head:-6,jaw:4,hFs:-50,hFk:-30,hBs:-40,hBk:-24,fFs:30,fFe:40,hx:4,lift:6,t1:-10,t2:-3,tw:6},
      {arch:6,pitch:-48,neck:-8,head:-4,jaw:4,hFs:-70,hFk:-60,hBs:-60,hBk:-50,fFs:40,fFe:50,hx:8,lift:2,t1:-20,t2:-4,tw:8,tp:1,sub:0.35,splash:1},
      {arch:4,pitch:-56,neck:-6,head:-4,hFs:-80,hFk:-80,hBs:-70,hBk:-70,fFs:40,fFe:50,hx:10,t1:-24,t2:-5,tw:10,tp:2,sub:0.72,splash:2},
      {pitch:-60,hx:12,t1:-30,t2:-6,tw:12,tp:3,sub:1,splash:3},
      {sub:1,bub:1}][i]},
    // emergir atrás do alvo mordendo (hit = quadro do dano)
    emerge:{nome:'Emerge mordendo (atrás do alvo)',n:7,hit:3,reach:34,dur:i=>[150,90,90,80,130,140,150][i],pose:i=>[
      {sub:1,bub:2},
      PE({sub:0.62,splash:1,jaw:30,head:-70,neck:18,pitch:62,fFe:30,fBe:20}),
      PE({sub:0.18,splash:2,jaw:44,head:-50,neck:28,pitch:58,hx:2,fFs:40,fFe:20,fBs:30,fBe:10,lift:4}),
      {pitch:14,arch:0,neck:-4,head:-14,jaw:2,hx:9,smear:1,splash:3,hFs:-30,hFk:6,hBs:-20,hBk:10,fFs:40,fFe:34,fBs:30,fBe:24,drool:2,tw:8},
      {pitch:8,arch:4,neck:14,head:-8,jaw:30,hx:6,fFs:20,fFe:10,tw:8,tp:1,drool:3},
      {pitch:4,arch:5,neck:22,head:-14,jaw:14,hx:3,tw:6,tp:2},
      {neck:26,head:-18,jaw:8,tw:4,tp:3}][i]},
    hurt:{nome:'Dano (cabeça)',n:4,dur:i=>[80,110,130,150][i],pose:i=>[
      {neck:58,head:16,jaw:34,hx:-6,pitch:12,arch:-2,flash:1,fFs:20,fFe:30,hFs:-24,hFk:10,ear:1},
      {neck:50,head:8,jaw:30,hx:-5,pitch:10,arch:0,fFs:14,fFe:20},
      {neck:38,head:-6,jaw:18,hx:-2,pitch:6,arch:2},
      {neck:30,head:-14,jaw:8,hx:-1}][i]},
    hurtB:{nome:'Dano (corpo, se encolhe)',n:4,dur:i=>[80,120,140,150][i],pose:i=>[
      {arch:14,pitch:-6,neck:2,head:10,jaw:36,hx:-7,flash:1,hFs:10,hFk:40,fFs:-20,fFe:-30,t1:20,t2:4},
      {arch:12,pitch:-5,neck:6,head:6,jaw:30,hx:-6,hFs:6,hFk:38,fFs:-16,fFe:-24,t1:16,t2:3},
      {arch:8,pitch:-2,neck:16,head:-6,jaw:18,hx:-3},
      {arch:5,neck:24,head:-14,jaw:8,hx:-1}][i]},
    fall:{nome:'Derrubada (rola de lado)',n:5,dur:i=>[90,100,110,140,260][i],pose:i=>[
      {neck:56,head:16,jaw:36,hx:-6,pitch:20,arch:-4,flash:1,fFs:40,fFe:60,hFs:-30,hFk:0,t1:10},
      {rot:24,neck:40,head:10,jaw:34,hx:-8,pitch:10,arch:-2,fFs:90,fFe:110,fBs:70,fBe:90,hFs:-60,hFk:-80,hBs:-50,hBk:-70,t1:10,t2:4,tw:6},
      LI({hx:-10,lift:4,jaw:30,tw:10,tp:1}),
      LI({hx:-11,lift:1,jaw:34,neck:-2,tw:8,tp:2}),
      LI({hx:-12,jaw:26,tw:2,tp:3,drool:2})][i]},
    getup:{nome:'Levantar (rola e sacode)',n:5,dur:i=>[180,150,140,140,150][i],pose:i=>[
      LI({hx:-12,jaw:20}),
      {rot:16,hx:-10,pitch:6,arch:8,neck:10,head:-4,jaw:14,fFs:60,fFe:80,fBs:40,fBe:60,hFs:-40,hFk:-50,hBs:-30,hBk:-40,t1:10},
      {hx:-7,arch:12,pitch:-2,neck:16,head:-10,jaw:10,hFs:4,hFk:40,fFs:-6,fFe:-14,tw:10,tp:1},
      {hx:-4,arch:6,pitch:2,neck:30,head:-6,jaw:16,head2:0,tw:12,tp:2.5},
      {hx:-1,neck:28,head:-20,jaw:6,tw:6,tp:4}][i]},
    death:{nome:'Morte (cai de lado, a cauda se debate)',n:8,dur:i=>[90,140,150,140,140,150,180,600][i],pose:i=>[
      {neck:60,head:20,jaw:44,hx:-6,pitch:24,arch:-4,flash:1,fFs:40,fFe:70,hFs:-30,hFk:0,t1:10},
      {pitch:44,arch:-6,neck:40,head:10,jaw:48,hx:-8,fFs:70,fFe:110,fBs:60,fBe:100,hFs:20,hFk:-30,hBs:10,hBk:-40,t1:-30,t2:4,tw:10},
      {rot:30,pitch:10,neck:20,head:4,jaw:46,hx:-10,lift:6,fFs:110,fFe:140,fBs:90,fBe:120,hFs:-80,hFk:-110,hBs:-70,hBk:-100,t1:10,tw:12,tp:1},
      LI({hx:-12,lift:2,jaw:30,tw:18,tp:0,neck:6}),
      LI({hx:-12,jaw:30,tw:18,tp:2.2,fFe:120,hFk:-130,neck:6}),
      LI({hx:-12,jaw:30,tw:14,tp:4.4,neck:6}),
      LI({hx:-12,jaw:30,tw:6,tp:5.6,fFs:110,fFe:140,hFs:-110,hFk:-140,neck:6}),
      LI({hx:-12,jaw:30,tw:0,neck:2,head:-4,drool:3,fFs:104,fFe:136,hFs:-108,hFk:-136})][i]},
    // reações do motor (voando / agarrada pelo cangote)
    tumble:{nome:'Voando (lançada)',n:4,loop:1,dur:()=>70,pose:i=>[
      {rot:0,flash:1,arch:-6,neck:40,head:10,jaw:34,fFs:120,fFe:150,hFs:-120,hFk:-140,t1:-20,tw:10,tp:0},
      {rot:90,arch:-6,neck:30,head:10,jaw:30,fFs:150,fFe:170,hFs:-90,hFk:-120,t1:-20,tw:10,tp:1.5},
      {rot:180,arch:-6,neck:40,head:10,jaw:34,fFs:110,fFe:140,hFs:-140,hFk:-150,t1:-20,tw:10,tp:3},
      {rot:270,arch:-6,neck:30,head:10,jaw:30,fFs:140,fFe:160,hFs:-110,hFk:-130,t1:-20,tw:10,tp:4.5}][i]},
    grabbed:{nome:'Agarrada (pendurada pelo cangote, morde o ar)',n:4,loop:1,dur:()=>110,pose:i=>{ const s=[0,1,0,-1][i];
      return {pitch:82,arch:-4+2*s,neck:6,head:-60+8*s,jaw:20+14*Math.abs(s),fFs:6+10*s,fFe:20+16*s,fFp:30,fBs:-4-8*s,fBe:10-10*s,fBp:30,
        hFs:6-10*s,hFk:2-14*s,hFp:20,hBs:-6+10*s,hBk:-4+10*s,hBp:20,t1:8,t2:2,tw:14,tp:i*1.6,lift:4,drool:i}; }},
  };
  function poseOf(anim,i){ const A=ANIMS[anim]; return Object.assign({},REST,A.pose(i)); }

  /* ---------- esqueleto ---------- */
  const SL=48, NL=13, HU=8, HL=6.6, FU=7.6, FL=6.4, TS=7, TL=4.7, HS=1.15;
  const TW=[19,17,15.2,13.4,11.8,10.4,9.2,8];
  const dA=a=>({x:Math.cos(rad(a)), y:-Math.sin(rad(a))});
  const dn=a=>({x:Math.sin(rad(a)), y:Math.cos(rad(a))});
  const ad=(p,v,k)=>({x:p.x+v.x*k, y:p.y+v.y*k});
  const angOf=(a,b)=>Math.atan2(-(b.y-a.y),b.x-a.x)*180/PI;
  // espessura do corpo (meia, em unidades): dorso e ventre ao longo do tronco (t 0..1) e do pescoço (s 0..1)
  const topT=t=>10.6+1.2*S(PI*Math.min(1,t*1.1)), botT=t=>9.8+4*S(PI*Math.min(1,t*1.05)*0.92);
  const topN=s=>10.6-0.8*s, botN=s=>lerp({x:botT(1),y:0},{x:9.6,y:0},s).x;
  function build(P,oy){
    const R=P.rot||0, hip={x:A0-20+P.hx, y:oy};
    const pa=P.pitch+R, sd=dA(pa), up=dA(pa+90);
    const sh=ad(hip,sd,SL), mid=ad(lerp(hip,sh,0.5),up,P.arch);
    const B=t=>lerp(lerp(hip,mid,t),lerp(mid,sh,t),t);
    const Ba=t=>angOf(lerp(hip,mid,t),lerp(mid,sh,t));
    const na=Ba(1)+P.neck, nd=dA(na), nk=ad(sh,nd,NL), ha=na+P.head;
    // corpo como faixa: u 0..1 tronco, 1..2 pescoço; v -1 ventre .. +1 dorso
    const Q=(u,v)=>{ let p,a,th;
      if(u<=1){ const t=Math.max(0,u); p=B(t); a=Ba(t); th=v>0?topT(t):botT(t); }
      else { const s=Math.min(1,u-1); p=ad(sh,nd,NL*s); a=lerp({x:Ba(1),y:0},{x:na,y:0},Math.min(1,s*3)).x; th=v>0?topN(s):botN(s); }
      return ad(p,dA(a+90),v*th); };
    // patas
    const hj=ad(B(0.14),up,-4), sj=ad(B(0.88),up,-5);
    const kneeF=ad(hj,dn(P.hFs-R),HU), ankF=ad(kneeF,dn(P.hFk-R),HL), kneeB=ad(hj,dn(P.hBs-R),HU), ankB=ad(kneeB,dn(P.hBk-R),HL);
    const elF=ad(sj,dn(P.fFs-R),FU), wrF=ad(elF,dn(P.fFe-R),FL), elB=ad(sj,dn(P.fBs-R),FU), wrB=ad(elB,dn(P.fBe-R),FL);
    // pés: ângulo de tela (rad) do pé; + = ponta pra baixo
    const footA=(p)=>rad(p-R), toe=(a,p,L)=>({x:a.x+Math.cos(footA(p))*L, y:a.y+Math.sin(footA(p))*L});
    // cauda
    const tail=[hip]; let tp=hip;
    for(let k=0;k<TS;k++){ const a=pa+180+P.t1+k*P.t2+P.tw*Math.sin(k*1.05+P.tp)*(0.3+k*0.18); tp=ad(tp,dA(a),TL); tail.push(tp); }
    const hc=Math.cos(-rad(ha)), hs=Math.sin(-rad(ha));
    const H=(lx,ly)=>({x:nk.x+(lx*hc-ly*hs)*HS, y:nk.y+(lx*hs+ly*hc)*HS});
    const hull=[[ankF,2.6],[ankB,2.6],[toe(ankF,P.hFp,10),1],[toe(ankB,P.hBp,10),1],[wrF,2.4],[wrB,2.4],[toe(wrF,P.fFp,7),1],[toe(wrB,P.fBp,7),1],
      [H(13,-2),3],[H(4,4),5],[H(4,-8),2],[ad(hip,up,(topT(0)-botT(0))/2),(topT(0)+botT(0))/2]];
    for(let k=0;k<=10;k++){ const u=k/10*2; hull.push([Q(u,-1),0],[Q(u,1),0]); }
    tail.forEach((q,k)=>hull.push([q,TW[k]/2]));
    return {R,hip,pa,sd,up,sh,mid,B,Ba,na,nd,nk,ha,Q,hj,sj,kneeF,ankF,kneeB,ankB,elF,wrF,elB,wrB,footA,toe,tail,H,hull};
  }
  function skeleton(P){
    const a=build(P,0); let m=-1e9; a.hull.forEach(([p,r])=>{ m=Math.max(m,p.y+r); });
    return build(P,G0-m-(P.lift||0)+(P.sub||0)*62);
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
    if(o.hi!==false){ const e=lerp(a,b,o.hl!=null?o.hl:0.7), ha=wa*0.22, hb=wb*0.22; p.F(o.hiR?o.hiR[1]:R[0]); p.cap({x:a.x-nx*ha,y:a.y-ny*ha},{x:e.x-nx*hb,y:e.y-ny*hb},wa*0.18,wb*0.16); }
    return {nx,ny};
  }
  function clip(c,pts,fn){ c.save(); c.beginPath(); pts.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])); c.closePath(); c.clip(); fn(); c.restore(); }
  const off=(q,n,k)=>({x:q.x+n.nx*k,y:q.y+n.ny*k});
  const WQ=(sk,list)=>list.map(([u,v])=>{ const q=sk.Q(u,v); return [q.x,q.y]; });
  const XY=q=>[q.x,q.y];
  // tufo de pelo molhado (triângulo fino apontando pra trás ao longo do corpo)
  function tuft(p,sk,u,v,L,w){ const a=sk.Q(u,v), b=sk.Q(u-L,v+(w||0)*0.5), c=sk.Q(u-L*0.3,v-0.12); p.poly([XY(a),XY(b),XY(c)]); }

  /* ---------- patas ---------- */
  // pé traseiro palmado (coordenadas locais: x pra frente, origem no tornozelo)
  function drawFoot(p,M,L,front){
    const k=L/8.2;
    p.F(M.fur[1]); p.poly([[-2.6,-2.6],[2.6,-2.8],[6,-1.6],[9.4,-0.2],[10.6,1.4],[10.4,2.6],[-2.8,2.6]].map(([x,y])=>[x*k,y]));
    p.F(M.fur[0]); p.poly([[-1.4,-2.4],[2.4,-2.6],[5,-1.6],[2.4,-1.6]].map(([x,y])=>[x*k,y]));
    // membrana entre os dedos (pele escura) e dedos com nós
    p.F(M.nose[1]); p.poly([[3.6,0.2],[10.4,1],[10.6,2.6],[3.6,2.6]].map(([x,y])=>[x*k,y]));
    p.F(M.nose[0]); [[5.2,0.4],[7.4,0.8],[9.4,1.2]].forEach(([x,y])=>p.rect(x*k,y,0.8,0.6));
    p.F(M.fur[2]); [[4.4,-1.2],[6.6,-0.8],[8.6,-0.2]].forEach(([x,y])=>p.cap({x:x*k,y},{x:(x+1.6)*k,y:y+1.6},0.7,0.6));
    p.F(M.fur[3]); p.rect(-2.8,2,13*k,0.7);
    p.F(M.claw[1]); [[10.2,0.6],[10.8,1.8],[9.6,2.4]].forEach(([x,y])=>p.poly([[x*k,y-0.5],[(x+1.8)*k,y+0.3],[x*k,y+0.6]]));
    p.F(M.claw[0]); p.rect(10.6*k,0.4,0.6,0.4);
    if(front){ p.F(M.nose[2]); p.rect(0,1.2,3*k,1); }
  }
  function drawLeg(c,u,M,sk,P,front,hind,form){
    const p=mkPen(c,u); p.id();
    let j,m,e,fp,L,w0,w1,w2;
    if(hind){ j=sk.hj; m=front?sk.kneeF:sk.kneeB; e=front?sk.ankF:sk.ankB; fp=front?P.hFp:P.hBp; L=10.6; w0=11.4; w1=8.2; w2=6.8; }
    else { j=sk.sj; m=front?sk.elF:sk.elB; e=front?sk.wrF:sk.wrB; fp=front?P.fFp:P.fBp; L=7.6; w0=11.6; w1=7.4; w2=6; }
    const n1=limb(p,M.fur,j,m,w0,w1,{hl:0.6,hiR:M.sheen});
    const n2=limb(p,M.fur,m,e,w1,w2,{hl:0.8});
    p.F(M.fur[1]); p.circle(m,w1/2-0.4);
    // tufos de pelo molhado na coxa/braço e brilho de água
    p.F(M.fur[2]); const t1=lerp(j,m,0.55); p.poly([[t1.x-n1.nx*2,t1.y-n1.ny*2],[t1.x+n1.nx*1.6+(m.x-j.x)*0.3,t1.y+n1.ny*1.6+(m.y-j.y)*0.3],[t1.x+n1.nx*0.4,t1.y+n1.ny*0.4]]);
    p.F(M.sheen[0]); const s1=lerp(m,e,0.3); p.rect(s1.x-n2.nx*1.6-0.4,s1.y-n2.ny*1.6-0.4,0.9,0.9);
    if(hind&&front){ p.F(M.fur[3]); const r=lerp(j,m,0.75); p.poly([[r.x+n1.nx*3,r.y+n1.ny*3],[r.x+n1.nx*0.6+1.4,r.y+n1.ny*0.6+1],[r.x+n1.nx*1.2-0.6,r.y+n1.ny*1.2+2.2]]); }
    if(form==='enluarado'&&front){ p.F(M.glow[1]); const g=lerp(j,m,0.4); p.cap(off(g,n1,-1),off(lerp(m,e,0.3),n2,-1),0.6,0.5); }
    p.xf(sk.footA(fp),e.x,e.y); drawFoot(p,M,L,!hind); p.id();
  }

  /* ---------- cauda achatada em remo ---------- */
  function drawTail(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id(); const T=sk.tail;
    // normais por ponto (lado de cima = luz), contorno único (sem emendas entre gomos)
    const N=T.map((q,k)=>{ const a=T[Math.max(0,k-1)], b=T[Math.min(TS,k+1)]; return sideN(a,b); });
    const side=(f,g)=>T.map((q,k)=>off(q,N[k],TW[k]*f+(g||0)));
    const A=side(-0.5), Bv=side(0.5), poly=(L,R)=>L.map(XY).concat(R.slice().reverse().map(XY));
    p.F(M.fur[1]); p.poly(poly(A,Bv)); p.circle(T[TS],TW[TS]/2);
    clip(c,poly(A,Bv),()=>{
      p.F(M.fur[2]); p.poly(poly(side(0.06),side(0.6)));
      p.F(M.fur[3]); p.poly(poly(side(0.3),side(0.6)));
      p.F(M.fur[0]); p.poly(poly(side(-0.6),side(-0.32)).slice(0));
      p.F(M.sheen[1]); for(let k=1;k<TS-1;k+=1){ const a=off(T[k],N[k],-TW[k]*0.3), b=off(lerp(T[k],T[k+1],0.6),N[k],-TW[k+1]*0.3); p.cap(a,b,1,0.8); }
      p.F(M.sheen[0]); { const q=off(lerp(T[1],T[2],0.4),N[1],-TW[1]*0.32); p.rect(q.x-0.6,q.y-0.4,1.4,0.8); }
      // tufos de pelo molhado e ranhuras do remo
      p.F(M.fur[2]); [1,2,3,4,5].forEach(k=>{ const q=off(T[k],N[k],-TW[k]*0.1), d={x:T[k-1].x-T[k].x,y:T[k-1].y-T[k].y}; p.poly([XY(off(q,N[k],-1.4)),XY({x:q.x+d.x*0.5,y:q.y+d.y*0.5}),XY(off(q,N[k],0.8))]); });
      if(form!=='plenilunar'){ const q=lerp(T[3],T[4],0.5), n=N[3]; p.F(M.flesh[2]); p.ell(q.x+n.nx*1,q.y+n.ny*1,2,1.3); p.F(M.flesh[1]); p.ell(q.x+n.nx*0.6,q.y+n.ny*0.6,1.2,0.8); p.F(M.bone[1]); p.rect(q.x+n.nx*0.4-0.5,q.y+n.ny*0.4-0.3,1,0.6); }
    });
    if(form==='plenilunar'){ p.F(M.bone[1]); for(let k=1;k<5;k++){ const n=N[k], q=lerp(T[k],T[k+1],0.5), b=off(q,n,-TW[k]*0.46); p.poly([[b.x-0.9,b.y],[b.x+0.9,b.y],[b.x-n.nx*2.6,b.y-n.ny*2.6]]); } }
    const tip=T[TS]; p.F(M.algae[1]); p.cap(tip,{x:tip.x-1.4,y:tip.y+4.4},1,0.6); p.F(M.algae[2]); p.cap({x:tip.x+0.6,y:tip.y},{x:tip.x+1.2,y:tip.y+3.4},0.8,0.5);
  }

  /* ---------- tronco + pescoço ---------- */
  function bodyPoly(sk){ const top=[], bot=[]; for(let k=0;k<=14;k++){ const u=k/14*2; top.push(XY(sk.Q(u,1))); bot.push(XY(sk.Q(u,-1))); } return top.concat(bot.reverse()); }
  function drawBody(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    const shape=bodyPoly(sk), hc=ad(sk.hip,sk.up,(topT(0)-botT(0))/2), hr=(topT(0)+botT(0))/2;
    p.F(M.fur[1]); p.poly(shape); p.circle(hc,hr);
    const all=()=>{ c.beginPath(); shape.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])); c.closePath(); c.moveTo(hc.x+hr,hc.y); c.arc(hc.x,hc.y,hr,0,PI*2); };
    c.save(); all(); c.clip('nonzero');
    // volume: ventre na sombra (2 tons), dorso com brilho de água
    p.F(M.fur[2]); p.poly(WQ(sk,[[-0.3,-1.4],[2.1,-1.4],[2.1,-0.5],[1.6,-0.42],[1.0,-0.36],[0.5,-0.3],[0.1,-0.24],[-0.3,-0.2]]));
    p.F(M.fur[3]); p.poly(WQ(sk,[[-0.3,-1.4],[1.9,-1.4],[1.9,-0.86],[1.3,-0.8],[0.7,-0.72],[0.2,-0.66],[-0.3,-0.6]]));
    // massa da coxa e do ombro (crescentes de sombra) e pelo da garupa
    p.F(M.fur[2]); p.poly(WQ(sk,[[0.2,0.5],[0.25,0.2],[0.26,-0.1],[0.24,-0.4],[0.29,-0.4],[0.31,-0.1],[0.3,0.22],[0.25,0.52]]));
    p.poly(WQ(sk,[[0.8,0.56],[0.84,0.24],[0.85,-0.1],[0.83,-0.4],[0.88,-0.4],[0.9,-0.1],[0.89,0.26],[0.85,0.58]]));
    p.F(M.fur[0]); p.poly(WQ(sk,[[0.06,0.5],[0.16,0.56],[0.2,0.3],[0.12,0.2],[0.04,0.3]]));
    p.poly(WQ(sk,[[0.9,0.6],[1.0,0.62],[1.02,0.4],[0.94,0.34]]));
    p.F(M.sheen[1]); p.poly(WQ(sk,[[0.08,0.46],[0.13,0.5],[0.15,0.36],[0.1,0.34]]));
    // tufos molhados pendendo na linha da sombra da barriga
    p.F(M.fur[2]); for(let k=0;k<11;k++){ const u0=0.1+k*0.085, v0=-0.28-(k%2)*0.06; p.poly(WQ(sk,[[u0-0.03,v0+0.08],[u0+0.03,v0+0.08],[u0+0.005,v0-0.14-(k%3)*0.04]])); }
    p.F(M.fur[3]); for(let k=0;k<10;k++){ const u0=0.14+k*0.085, v0=-0.7; p.poly(WQ(sk,[[u0-0.025,v0+0.06],[u0+0.025,v0+0.06],[u0,v0-0.16]])); }
    // fios de pelo (pinceladas curtas ao longo do corpo) e gotas de água
    p.F(M.fur[2]); [[0.14,0.12],[0.3,0.62],[0.4,-0.04],[0.66,0.6],[0.78,0.1],[0.96,0.44],[1.06,0.0],[1.2,0.5],[0.22,-0.16],[0.88,-0.2],[1.36,0.36],[1.12,-0.24]].forEach(([u0,v0])=>{ const a=sk.Q(u0,v0), b=sk.Q(u0-0.05,v0+0.05); p.cap(a,b,0.8,0.6); });
    p.F(M.fur[0]); [[0.18,0.66],[0.42,0.56],[0.7,0.7],[1.02,0.74],[1.3,0.7],[0.56,0.28],[0.84,0.36],[1.1,0.3]].forEach(([u0,v0])=>{ const a=sk.Q(u0,v0), b=sk.Q(u0-0.04,v0+0.03); p.cap(a,b,0.7,0.5); });
    p.F(M.sheen[0]); [[0.24,0.6],[0.58,0.66],[0.92,0.56],[1.18,0.62],[0.46,0.12],[1.0,0.18]].forEach(([u0,v0])=>{ const q=sk.Q(u0,v0); p.rect(q.x-0.4,q.y-0.4,0.8,0.8); });
    p.F(M.fur[0]); p.poly(WQ(sk,[[0.08,0.62],[0.5,0.7],[0.95,0.66],[1.3,0.66],[1.7,0.62],[1.7,0.86],[1.3,0.9],[0.9,0.92],[0.5,0.94],[0.08,0.88]]));
    p.F(M.sheen[1]); [[0.18,0.42],[0.62,0.36],[1.06,0.3],[1.42,0.22]].forEach(([u0,L])=>p.poly(WQ(sk,[[u0,0.74],[u0+L*0.5,0.76],[u0+L,0.8],[u0+L,0.88],[u0+L*0.5,0.9],[u0,0.86]])));
    p.F(M.sheen[0]); [[0.3,0.82],[0.78,0.84],[1.22,0.86]].forEach(([u0,v0])=>p.poly(WQ(sk,[[u0,v0],[u0+0.12,v0+0.02],[u0+0.12,v0+0.06],[u0,v0+0.05]])));
    // tufos de pelo molhado espetado (linhas de pelo do corpo pra trás)
    p.F(M.fur[2]); [[0.32,0.3],[0.52,0.06],[0.72,0.36],[0.92,0.1],[1.12,0.4],[0.42,-0.2],[0.82,-0.14],[1.3,0.1],[1.5,-0.1],[0.2,0.0]].forEach(([u0,v0])=>tuft(p,sk,u0,v0,0.1,0.3));
    p.F(M.fur[0]); [[0.36,0.46],[0.76,0.52],[1.16,0.56],[0.6,0.22],[1.0,0.24]].forEach(([u0,v0])=>tuft(p,sk,u0,v0,0.07,0.2));
    p.F(M.fur[3]); [[0.46,-0.5],[0.66,-0.56],[0.86,-0.5],[1.08,-0.46]].forEach(([u0,v0])=>tuft(p,sk,u0,v0,0.08,-0.3));
    // babador creme manchado na garganta e no peito (desenho único, com pintas escuras)
    p.F(M.bib[3]); p.poly(WQ(sk,[[0.7,-1.2],[2.05,-1.2],[2.05,0.12],[1.86,0.16],[1.72,-0.02],[1.56,0.2],[1.4,-0.06],[1.24,-0.24],[1.08,-0.4],[0.9,-0.6],[0.76,-0.84]]));
    p.F(M.bib[2]); p.poly(WQ(sk,[[0.76,-1.2],[2.05,-1.2],[2.05,0.04],[1.86,0.08],[1.72,-0.1],[1.56,0.1],[1.4,-0.14],[1.24,-0.32],[1.08,-0.48],[0.92,-0.68],[0.8,-0.9]]));
    p.F(M.bib[1]); p.poly(WQ(sk,[[0.84,-1.0],[2.05,-1.0],[2.05,-0.06],[1.88,-0.02],[1.74,-0.2],[1.58,0.0],[1.42,-0.24],[1.26,-0.4],[1.1,-0.56],[0.96,-0.76]]));
    p.F(M.bib[0]); p.poly(WQ(sk,[[1.3,-0.6],[1.5,-0.44],[1.7,-0.34],[1.9,-0.18],[2.04,-0.24],[2.04,-0.6],[1.8,-0.7],[1.5,-0.76]]));
    p.F(M.fur[2]); [[1.3,-0.72,0.06,0.16],[1.62,-0.8,0.05,0.14],[1.48,-0.5,0.04,0.1],[1.9,-0.62,0.06,0.18],[1.18,-0.86,0.04,0.1]].forEach(([u0,v0,du,dv])=>p.poly(WQ(sk,[[u0,v0],[u0+du,v0+dv*0.4],[u0+du*0.6,v0+dv],[u0-du*0.4,v0+dv*0.6]])));
    p.F(M.fur[3]); [[1.36,-0.74],[1.94,-0.6]].forEach(([u0,v0])=>{ const q=sk.Q(u0,v0); p.rect(q.x-0.4,q.y-0.4,0.9,0.9); });
    p.F(M.blood[1]); { const q=sk.Q(1.85,-0.7); p.ell(q.x,q.y,1.4,1.0); const q2=sk.Q(1.7,-0.86); p.ell(q2.x,q2.y,0.8,1.3); }
    // pelo caindo: pele roxa exposta (borda rasgada, irregular) com duas costelas aparecendo
    const patch=[[0.44,0.26],[0.48,0.4],[0.53,0.34],[0.57,0.46],[0.62,0.38],[0.67,0.42],[0.69,0.24],[0.73,0.12],[0.68,0.02],[0.66,-0.14],[0.6,-0.06],[0.55,-0.2],[0.5,-0.04],[0.45,0.06]];
    p.F(M.fur[3]); p.poly(WQ(sk,patch.map(([u0,v0])=>[u0+(u0-0.585)*0.12,v0+(v0-0.14)*0.18])));
    p.F(M.skin[2]); p.poly(WQ(sk,patch));
    p.F(M.skin[1]); p.poly(WQ(sk,[[0.48,0.24],[0.53,0.3],[0.58,0.36],[0.64,0.32],[0.67,0.18],[0.64,0.02],[0.58,-0.02],[0.52,0.04]]));
    p.F(M.skin[0]); p.poly(WQ(sk,[[0.55,0.3],[0.6,0.32],[0.62,0.27],[0.57,0.26]]));
    p.F(M.skin[3]); p.poly(WQ(sk,[[0.53,0.2],[0.565,0.24],[0.6,0.06],[0.57,0.0]])); p.poly(WQ(sk,[[0.6,0.24],[0.625,0.26],[0.645,0.08],[0.625,0.06]]));
    p.F(form==='plenilunar'?M.bone[0]:M.bone[1]); p.poly(WQ(sk,[[0.555,0.26],[0.575,0.27],[0.6,0.08],[0.585,0.06]])); p.poly(WQ(sk,[[0.615,0.26],[0.632,0.26],[0.642,0.12],[0.628,0.1]]));
    p.F(M.flesh[1]); p.poly(WQ(sk,[[0.64,-0.02],[0.67,0.02],[0.66,-0.1]]));
    p.F(M.fur[1]); [[0.45,0.08],[0.5,0.38],[0.6,0.42],[0.68,0.3],[0.62,-0.08],[0.52,-0.1]].forEach(([u0,v0])=>p.poly(WQ(sk,[[u0,v0],[u0+0.04,v0+0.04],[u0+0.015,v0-0.08]]))); // pelo ralo invadindo a borda
    p.F(M.skin[2]); [[0.38,0.12],[0.41,-0.06],[0.76,0.2],[0.72,0.46]].forEach(([u0,v0])=>{ const q=sk.Q(u0,v0); p.ell(q.x,q.y,0.9,0.7); }); // falhas pequenas em volta
    p.F(M.flesh[2]); p.poly(WQ(sk,[[0.14,0.1],[0.22,0.2],[0.28,0.08],[0.24,-0.12],[0.16,-0.1]]));
    p.F(M.flesh[1]); p.poly(WQ(sk,[[0.17,0.08],[0.22,0.14],[0.25,0.04],[0.22,-0.06],[0.18,-0.04]]));
    p.F(M.blood[1]); p.poly(WQ(sk,[[0.2,-0.1],[0.23,-0.1],[0.22,-0.42],[0.205,-0.4]]));
    if(form==='enluarado'){ p.F(M.glow[1]); [[[0.3,0.84],[0.42,0.62],[0.5,0.7],[0.62,0.5]],[[0.9,0.86],[1.0,0.66],[1.1,0.72],[1.18,0.52]]].forEach(L=>{ for(let k=0;k<L.length-1;k++) p.cap(sk.Q(L[k][0],L[k][1]),sk.Q(L[k+1][0],L[k+1][1]),0.8,0.8); });
      p.F(M.glow[0]); { const q=sk.Q(0.42,0.62); p.rect(q.x-0.4,q.y-0.4,0.9,0.9); } }
    if(form==='plenilunar'){ p.F(M.blood[2]); p.poly(WQ(sk,[[1.2,-0.9],[1.6,-0.9],[1.7,-0.3],[1.5,-0.5],[1.3,-0.4]])); }
    c.restore();
    // pelo molhado espetado quebrando a silhueta (dorso e barriga)
    p.F(M.fur[1]); [0.2,0.4,0.6,0.8,1.0,1.2,1.4].forEach(u0=>tuft(p,sk,u0,1.0,0.06,0.16));
    p.F(M.fur[2]); [0.2,0.4,0.62].forEach(u0=>tuft(p,sk,u0,-1.0,0.06,-0.18));
  }
  // espinhos de osso (plenilunar), algas e aguapé presos no dorso: por cima do corpo, saem da silhueta
  function drawBack(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    if(form==='plenilunar'){ [0.2,0.36,0.52,0.68,0.84,1.0].forEach((u0,k)=>{ const a=sk.Q(u0-0.035,0.92), b=sk.Q(u0+0.035,0.92), t=sk.Q(u0-0.06,1.5+(k%2)*0.25);
      p.F(M.bone[1]); p.poly([XY(a),XY(b),XY(t)]); p.F(M.bone[2]); p.poly([XY(b),XY(t),XY(sk.Q(u0+0.005,1.1))]); p.F(M.blood[1]); p.rect(a.x-0.3,a.y-0.3,1,0.8); }); }
    // algas penduradas (caem pra baixo do mundo, balançando com o corpo)
    const sway=Math.sin(P.tp*1.3+P.hx*0.4)*1.4;
    [[0.74,10,0],[0.98,13,1],[1.34,9,2]].forEach(([u0,L,k])=>{ const a=sk.Q(u0,0.95);
      const m={x:a.x+sway*0.5-1,y:a.y+L*0.5}, b={x:a.x+sway-2+k*0.6,y:a.y+L};
      p.F(M.algae[2]); p.cap(a,m,2.2,1.6); p.cap(m,b,1.6,0.8);
      p.F(M.algae[1]); p.cap({x:a.x+0.5,y:a.y},{x:m.x+0.5,y:m.y},1.2,0.9); p.cap({x:m.x+0.4,y:m.y},{x:b.x+0.3,y:b.y-1},0.8,0.5);
      p.F(M.algae[0]); p.rect(a.x+0.2,a.y+1.4,0.8,1.6);
      p.F(M.algae[3]); p.rect(m.x-0.8,m.y,0.7,1.6); });
    // gotas pingando da barriga e do queixo
    if(P.sub<0.05&&!P.dust){ [[0.42,0],[0.7,1],[1.86,2]].forEach(([u0,k])=>{ const q=sk.Q(u0,-1), y=Math.min(G0-1.5,q.y+2+((P.tp*3+k*1.7)%3)*1.6);
      p.F(M.water[2]); p.ell(q.x,y,0.7,1.0); p.F(M.water[0]); p.rect(q.x-0.3,y-0.7,0.6,0.5); }); }
    // aguapé grudado no ombro: roseta de folhas redondas + espiga de flor lilás
    const g=sk.Q(1.06,1.0);
    p.F(M.leaf[2]); p.ell(g.x-3.2,g.y-1.2,3,2.2,-0.4); p.ell(g.x+3,g.y-0.6,2.8,2,0.5);
    p.F(M.leaf[1]); p.ell(g.x-2.8,g.y-1.6,2.4,1.7,-0.4); p.ell(g.x+2.6,g.y-1,2.2,1.6,0.5); p.ell(g.x,g.y-2.4,2.4,2);
    p.F(M.leaf[0]); p.rect(g.x-3.6,g.y-2.8,1.4,0.7); p.rect(g.x-0.6,g.y-3.8,1.4,0.7);
    p.F(M.leaf[3]); p.cap({x:g.x,y:g.y-2.2},{x:g.x-0.4,y:g.y+0.4},0.6,0.5); p.cap({x:g.x+2.6,y:g.y-1},{x:g.x+1,y:g.y},0.5,0.5);
    p.F(M.algae[2]); p.cap({x:g.x+0.4,y:g.y-3.6},{x:g.x+1.4,y:g.y-8},0.9,0.7);
    p.F(M.flower[1]); [[1.6,-8.4],[1.0,-7.2],[2.2,-7],[1.4,-6]].forEach(([x,y])=>p.circle({x:g.x+x,y:g.y+y},1.05));
    p.F(M.flower[0]); p.rect(g.x+1.2,g.y-8.8,0.8,0.6); p.F(M.flower[2]); p.rect(g.x+1.8,g.y-6.4,0.8,0.6);
    p.F(M.glow[1]); p.rect(g.x+1.4,g.y-7.4,0.5,0.5);
  }

  /* ---------- cabeça de lontra: redonda e larga, focinho curto, nariz preto grande, bigodes claros, orelhinha ---------- */
  const SKULL=[[-7.4,-7],[-4.6,-9.8],[0,-11.2],[4.6,-11],[8.4,-9.4],[11,-7],[12.6,-4.6],[13.4,-2],[13.2,0.6],[11.8,2.4],[8.4,3.4],[4,4.6],[-1,6.4],[-7.4,7.8]];
  const JA=0.72; // a boca abre menos que o ângulo da pose (lontra, não réptil)
  function drawHead(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.xf(-rad(sk.ha),sk.nk.x,sk.nk.y); c.scale(HS,HS);
    // orelhinha redonda atrás, saliente
    const ey=P.ear?-10.6:-9.8;
    p.F(M.fur[1]); p.ell(-3.4,ey,2.5,2.3); p.F(M.fur[3]); p.ell(-3.1,ey+0.5,1.2,1.1); p.F(M.fur[0]); p.rect(-4.8,ey-2,2,0.7);
    p.F(M.fur[1]); p.poly(SKULL);
    clip(c,SKULL,()=>{
      p.F(M.fur[2]); p.poly([[-8,0.4],[0,-0.4],[5,1.6],[10,2],[14,1],[14,6],[-8,9]]);
      p.F(M.fur[3]); p.poly([[-8,3.6],[-3,3],[1,5.6],[-8,9]]);
      // cúpula redonda com brilho de água
      p.F(M.fur[0]); p.poly([[-5,-9],[0,-10.8],[5,-10.6],[9,-8.8],[5.6,-8.8],[0.6,-9.2],[-3.6,-8.2]]);
      p.F(M.sheen[1]); p.poly([[-1,-10.4],[4,-10.6],[7.6,-9.4],[4,-9.6],[-0.4,-9.8]]);
      p.F(M.sheen[0]); p.poly([[1,-10.6],[4,-10.6],[3.6,-10],[1.2,-10]]);
      p.F(M.fur[2]); p.poly([[-7.4,-6],[-5,-8.6],[-4.6,-6.4],[-6,-3]]);
      // focinho curto e claro (almofada dos bigodes, lábio creme)
      p.F(M.bib[2]); p.poly([[7.6,-0.6],[11.6,-1.2],[13.4,0],[12.6,2.2],[9.6,3.4],[7,2.6]]);
      p.F(M.bib[1]); p.poly([[8.6,0],[11.8,-0.6],[12.8,0.6],[11.6,1.8],[9.4,2.4]]);
      p.F(M.fur[3]); [[9,0.2],[10.2,-0.2],[11.4,-0.4],[9.6,1.4],[10.8,1]].forEach(([x,y])=>p.rect(x,y,0.6,0.6));
      // olho de lua com olheira
      p.F(M.fur[3]); p.ell(6.4,-5.6,2.4,1.9); p.F(M.fur[2]); p.poly([[3.6,-8],[6.6,-8.6],[9.2,-7.6],[8.8,-7],[6.4,-7.6],[3.8,-7.2]]);
      // pele roxa sem pelo atrás do olho, borda rasgada
      p.F(M.fur[3]); p.poly([[-5.8,-3.4],[-3.4,-4.6],[-1.8,-3.4],[0,-3.8],[0.8,-1.6],[-0.2,0.2],[0.4,1.8],[-2,2.4],[-3.4,1.4],[-5.6,1.8],[-6.4,-0.6]]);
      p.F(M.skin[2]); p.poly([[-5.2,-2.8],[-3.4,-3.8],[-2,-2.8],[-0.4,-3],[0.2,-1.4],[-0.8,0.2],[-0.4,1.4],[-2,1.8],[-3.4,0.8],[-5,1.2],[-5.6,-0.6]]);
      p.F(M.skin[1]); p.poly([[-4.2,-2.4],[-2.2,-2.2],[-0.8,-1.4],[-1.6,0.4],[-3.6,0.2]]);
      p.F(M.skin[0]); p.rect(-3.4,-2.2,1.6,0.5); p.F(M.flesh[1]); p.poly([[-2.6,-1],[-1.6,-0.8],[-2,0.4]]);
      p.F(M.fur[1]); [[-5.2,-2.8],[-2,-2.8],[0.2,-1.4],[-2,1.8]].forEach(([x,y])=>p.poly([[x,y],[x+1,y+0.4],[x+0.2,y+1.2]]));
      if(form==='enluarado'){ p.F(M.glow[1]); p.cap({x:-4.6,y:-1.6},{x:-1.2,y:0.8},0.6,0.6); }
    });
    // nariz preto grande no alto do focinho
    p.F(M.nose[1]); p.poly([[10.4,-6],[12.8,-5.6],[14.2,-3.6],[14,-1.4],[12,-1.6],[10.4,-3.6]]);
    p.F(M.nose[0]); p.rect(11.2,-5.6,1.6,0.6); p.F(M.nose[2]); p.poly([[11.6,-2],[14,-1.6],[13.8,-1.2],[11.4,-1.4]]);
    p.F(M.nose[3]); p.ell(13.3,-2.6,0.7,0.6); p.ell(11.6,-2.8,0.5,0.5);
    // olho de lua
    p.F(M.eye[3]); p.ell(6.5,-5.6,1.7,1.3); p.F(M.eye[1]); p.ell(6.7,-5.7,1.3,1); p.F(M.eye[0]); p.rect(6.8,-6.2,0.9,0.7); p.F(M.eye[2]); p.rect(5.6,-5.2,1,0.5);
    if(form!=='comum'){ p.F(M.glow[1]); p.rect(7.8,-6,1.4,0.5); }
    // linha da boca e dentes de cima pequenos
    p.F(M.fur[3]); p.poly([[3.6,4.2],[8.6,3],[12.4,1.8],[12.2,2.4],[8.8,3.6],[4,4.8]]);
    p.F(M.teeth[1]); p.poly([[9.6,2.8],[10.8,2.6],[10.3,4.2]]); p.rect(11.4,2,0.9,0.9);
    p.F(M.teeth[0]); p.rect(9.9,2.8,0.5,0.8);
    // bigodes claros: atravessam a bochecha e escapam pra frente
    p.F(M.bib[0]); [[[10,0.6],[4.6,2]],[[9.6,1.4],[4,3.4]],[[10.4,-0.2],[5.6,0.4]]].forEach(([a,b])=>p.cap({x:a[0],y:a[1]},{x:b[0],y:b[1]},0.55,0.45));
    p.cap({x:12,y:0.6},{x:17,y:-0.4},0.55,0.4); p.cap({x:12,y:1.2},{x:16.6,y:2.4},0.55,0.4); p.cap({x:11.6,y:1.8},{x:15,y:4.4},0.5,0.4);
    p.F(M.blood[1]); p.poly([[12,2],[12.8,1.8],[12.6,3.4],[12.1,3]]);
    p.id();
  }
  function jawXf(p,sk,P){ const h=sk.H(1,3.2); p.xf(-rad(sk.ha)+rad(P.jaw*JA),h.x,h.y); }
  function drawMouthIn(c,u,M,sk,P){
    if(P.jaw<10) return; const p=mkPen(c,u); p.id();
    const a=sk.H(2,3.8), b=sk.H(12.2,2.2), h=sk.H(1,3.2), ja=-rad(sk.ha)+rad(P.jaw*JA), jc=Math.cos(ja), js=Math.sin(ja);
    const J=(x,y)=>({x:h.x+(x*jc-y*js)*HS,y:h.y+(x*js+y*jc)*HS}), d=J(10.6,-0.4), e=J(1,-0.4);
    p.F(M.mouth[2]); p.poly([XY(a),XY(b),XY(d),XY(e)]);
    p.F(M.mouth[3]); p.poly([XY(a),XY(lerp(a,b,0.4)),XY(lerp(e,d,0.4)),XY(e)]);
    p.F(M.tongue[1]); const m1=lerp(lerp(a,b,0.45),lerp(e,d,0.45),0.62), m2=lerp(lerp(a,b,0.85),lerp(e,d,0.85),0.6); p.cap(m1,m2,2.6,2);
    p.F(M.tongue[0]); p.cap(lerp(m1,m2,0.3),lerp(m1,m2,0.8),0.8,0.6);
  }
  const JAW=[[-5,0.2],[2,-0.6],[6.6,-0.8],[10,-0.6],[11.4,0.6],[10.8,2.6],[7.6,3.6],[3,3.8],[-2,3.6],[-5,3]];
  function drawJaw(c,u,M,sk,P,form){
    const p=mkPen(c,u); jawXf(p,sk,P); c.scale(HS,HS);
    p.F(M.fur[1]); p.poly(JAW);
    clip(c,JAW,()=>{
      p.F(M.bib[1]); p.poly([[2,1],[8,0.4],[12,0.6],[12,5],[2,5]]); // queixo e lábio de baixo creme
      p.F(M.bib[2]); p.poly([[2,2.8],[11,2.2],[12,5],[2,5]]);
      p.F(M.fur[2]); p.poly([[-6,2],[1,2.2],[2,5],[-6,5]]);
      // osso da mandíbula exposto (carne roída)
      p.F(M.flesh[2]); p.poly([[0.6,-0.4],[5.6,-0.6],[6,1.8],[1,2.2]]);
      p.F(M.bone[1]); p.poly([[1,-0.3],[5.2,-0.5],[5.6,1.4],[1.4,1.8]]);
      p.F(M.bone[0]); p.rect(1.6,-0.2,3.2,0.5); p.F(M.bone[3]); p.circle({x:2.6,y:0.8},0.4); p.circle({x:4.2,y:0.7},0.4);
    });
    p.F(M.teeth[1]); p.poly([[8.6,-0.6],[9.8,-0.6],[9.2,-2.6]]); p.rect(10.2,-1,0.9,0.7);
    [[2,-0.4],[3.6,-0.5],[5.2,-0.6]].forEach(([x,y])=>p.poly([[x,y],[x+1,y],[x+0.5,y-1.1]]));
    const L=1.2+(P.drool%4)*1+(P.jaw>30?1.4:0);
    p.F(M.blood[1]); p.poly([[9.8,2.4],[11,1.8],[10.8,2.2+L],[10.3,2.8+L]]); p.ell(10.5,2.8+L,0.8,0.8);
    if(form==='plenilunar'){ p.F(M.blood[2]); p.rect(6,2.2,3,1); }
    p.id();
  }

  /* ---------- efeitos ---------- */
  function drawSmear(c,u,M,sk,P){
    const p=mkPen(c,u); p.id();
    const o=sk.nk, tip=sk.H(15,2), r=Math.hypot(tip.x-o.x,tip.y-o.y)+1.5, a1=Math.atan2(tip.y-o.y,tip.x-o.x);
    const n=10, pts=[]; for(let i=0;i<=n;i++){ const a=a1-0.9+1.2*i/n; pts.push([o.x+Math.cos(a)*r,o.y+Math.sin(a)*r]); }
    for(let i=n;i>=0;i--){ const a=a1-0.9+1.2*i/n, rr=r-1.5-5*Math.sin(PI*i/n); pts.push([o.x+Math.cos(a)*rr,o.y+Math.sin(a)*rr]); }
    p.F(M.swish[0]); p.poly(pts.map(([x,y])=>[Math.max(1,Math.min(FW0-2,x)),Math.max(1,Math.min(G0,y))]));
    p.F(M.swish[2]); for(let k=n-3;k<n;k++) p.cap({x:pts[k][0],y:pts[k][1]},{x:pts[k+1][0],y:pts[k+1][1]},0.8,0.8);
  }
  function arc(p,cx,cy,r,w,a0,a1,n){ const pts=[]; for(let i=0;i<=n;i++){ const a=a0+(a1-a0)*i/n; pts.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]); } for(let i=n;i>=0;i--){ const a=a0+(a1-a0)*i/n; pts.push([cx+Math.cos(a)*(r-w),cy+Math.sin(a)*(r-w)]); } p.poly(pts); }
  function drawWave(c,u,M,sk,P){
    const p=mkPen(c,u); p.id(); const m=sk.H(14,1.6), a=-rad(sk.ha)+rad(P.jaw*0.3);
    for(let k=0;k<3;k++){ const r=6+k*7+P.wave*2.4; if(k>P.wave) break;
      p.F(M.wave[k===0?0:1]); arc(p,m.x,m.y,r,2,a-0.7,a+0.7,10);
      p.F(M.wave[2]); arc(p,m.x,m.y,r-2,0.8,a-0.6,a+0.6,10); }
    p.F(M.wave[0]); [[-0.9,10],[0.95,12]].forEach(([da,rr])=>{ const q={x:m.x+Math.cos(a+da)*(rr+P.wave*3),y:m.y+Math.sin(a+da)*(rr+P.wave*3)}; p.rect(q.x-0.6,q.y-0.6,1.3,1.3); });
  }
  function ring(p,cx,cy,rx,ry,n,s){ for(let i=0;i<n;i++){ const a=i/n*PI*2; p.rect(cx+Math.cos(a)*rx-s/2,cy+Math.sin(a)*ry-s/2,s,s*0.7); } }
  function drawWater(c,u,M,sk,P){
    const p=mkPen(c,u); p.id(); const g=G0-0.8;
    const cx=P.sub>0.5||P.bub?A0+P.hx-2:sk.nk.x-4;
    if(P.splash){ const s=P.splash;
      p.F(M.water[3]); ring(p,cx,g,10+s*5,2.4+s*0.6,22,1.4);
      p.F(M.water[2]); ring(p,cx,g-0.4,7+s*4,1.8+s*0.4,18,1.2);
      for(let k=0;k<8;k++){ const f=(k-3.5)/3.5, h=(1-f*f)*(4+s*5)*(s===3?0.7:1)+(k%2)*2, x=cx+f*(5+s*4);
        p.F(M.water[1]); p.ell(x,g-h,1.2+(k%3)*0.3,1.6); p.F(M.water[0]); p.rect(x-0.4,g-h-1,0.8,0.8);
        if(s>=2){ p.F(M.water[2]); p.ell(x+f*3,g-h*0.4,0.8,1); } }
      p.F(M.water[0]); p.cap({x:cx-2,y:g},{x:cx-1,y:g-6-s*3},2,1); p.cap({x:cx+2,y:g},{x:cx+1.4,y:g-5-s*2},1.6,0.8);
    }
    if(P.bub){ p.F(M.water[3]); ring(p,cx,g,9,2.2,20,1.2); p.F(M.water[2]); ring(p,cx,g,5,1.4,14,1);
      const B=P.bub===2?[[-4,-3,1.6],[2,-5,1.2],[5,-2,1],[-1,-8,0.9],[0,-1.4,1.4]]:[[-3,-2,1.2],[3,-4,1],[0,-1,1.1]];
      B.forEach(([dx,dy,r])=>{ p.F(M.water[2]); p.circle({x:cx+dx,y:g+dy},r); p.F(M.water[0]); p.rect(cx+dx-r*0.5,g+dy-r*0.6,0.7,0.6); });
    }
    if(P.dust){ const d=P.dust, hx=sk.hip.x;
      for(let k=0;k<6;k++){ const x=hx-6-k*4.4, h=(2+k*1.4)*(0.8+0.2*d)+(k+d)%2;
        p.F(M.water[1]); p.ell(x,g-h,1.3,1.1); p.F(M.water[0]); p.rect(x-0.4,g-h-0.8,0.7,0.6); }
      p.F(M.water[2]); p.cap({x:hx-2,y:g},{x:hx-26,y:g-1},2,0.6);
      p.F(M.water[0]); p.cap({x:sk.nk.x+6,y:g-0.6},{x:sk.nk.x+12,y:g-2-d},1.2,0.6);
    }
  }
  function heavyOutline(cv){ const g=cv.getContext('2d'), W=cv.width, H=cv.height, im=PIX.pix(cv), d=im.data;
    const isO=i=>d[i+3]===255&&d[i]===0x17&&d[i+1]===0x0b&&d[i+2]===0x1c, fill=i=>d[i+3]===255&&!isO(i);
    const add=[]; for(let y=2;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(d[i+3]) continue; const u=((y-1)*W+x)*4, u2=((y-2)*W+x)*4; if(isO(u)&&fill(u2)) add.push(i); }
    add.forEach(i=>{ d[i]=0x17; d[i+1]=0x0b; d[i+2]=0x1c; d[i+3]=255; }); g.putImageData(im,0,0); }

  /* ---------- montagem ---------- */
  const cache=PIX.cache();
  function frame(form,anim,fi,step=5,Pov,pk){
    const K=PIX.getK(), key=(pk!=null?'#'+pk+'|'+form:form+'|'+anim+'|'+fi+'|'+step)+'@'+K;
    const hit=cache.get(key); if(hit){ cache.delete(key); cache.set(key,hit); return hit; }
    const P=Pov?Object.assign({},REST,Pov):poseOf(anim,fi), M=mats(form), sk=skeleton(P), K2=K*SC;
    // afundando: tudo do corpo some abaixo da linha d'água (chão)
    const W=fn=>(P.sub>0)?(c,u)=>{ c.save(); c.setTransform(K2,0,0,K2,0,0); c.beginPath(); c.rect(0,0,FW0,G0-0.6); c.clip(); fn(c,u); c.restore(); }:fn;
    const parts=[];
    if(P.sub<0.99){
      parts.push({back:true, draw:W((c,u)=>drawLeg(c,u,M,sk,P,false,true,form))});
      parts.push({back:true, draw:W((c,u)=>drawLeg(c,u,M,sk,P,false,false,form))});
      parts.push({draw:W((c,u)=>drawTail(c,u,M,sk,P,form))});
      parts.push({draw:W((c,u)=>drawBody(c,u,M,sk,P,form))});
      parts.push({draw:W((c,u)=>drawBack(c,u,M,sk,P,form))});
      parts.push({draw:W((c,u)=>drawLeg(c,u,M,sk,P,true,true,form))});
      parts.push({draw:W((c,u)=>{ drawHead(c,u,M,sk,P,form); drawMouthIn(c,u,M,sk,P); })});
      parts.push({draw:W((c,u)=>drawJaw(c,u,M,sk,P,form))});
      parts.push({draw:W((c,u)=>drawLeg(c,u,M,sk,P,true,false,form))});
      if(P.smear>=0.5) parts.push({noShade:true, smear:true, noRim:true, draw:(c,u)=>drawSmear(c,u,M,sk,P)});
      if(P.wave>=0.5) parts.push({noShade:true, smear:true, noRim:true, draw:(c,u)=>drawWave(c,u,M,sk,P)});
    }
    if(P.splash||P.bub||P.dust) parts.push({noShade:true, smear:true, noRim:true, draw:(c,u)=>drawWater(c,u,M,sk,P)});
    PIX.setK(K2); let cv; try { cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM[form]}); } finally { PIX.setK(K); }
    if(step>=4) heavyOutline(cv);
    const sc=q=>({x:q.x*K2,y:q.y*K2}); cv._eye=sc(sk.H(6.6,-5.6)); cv._mouth=sc(sk.H(12,2.4)); cv._hand=sc(sk.wrF); cv._head=sc(sk.H(5,-3)); cv._tail=sc(sk.tail[TS]);
    cache.set(key,cv); if(cache.size>900) cache.delete(cache.keys().next().value);
    return cv;
  }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame,framePose:function(form,anim,P,key){ return frame(form,anim,0,5,P,key); }};
})();
