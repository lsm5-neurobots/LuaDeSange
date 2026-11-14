/* FREVISTA — fonte de arte (editável). Build: npm run art
   Zumbi Frevista (variante local de Olinda): passista de frevo de rua preso na folia pela Lua de Sangue.
   Magro, pernas longas em passo aberto, joelhos dobrados, tronco inclinado e braços abertos. Na mão da frente, ALTA,
   a SOMBRINHA DE FREVO (pequena, oito gomos vermelho/amarelo/azul/verde, varetas de metal, cabo curto com castão):
   é o "disco" que se lê de longe. Camisa de cetim de manga curta em gomos (vermelho e amarelo) com gola bordada,
   calça curta 3/4 de cetim verde com barra bordada, meias listradas até o joelho, tênis de sola fina, faixa azul
   na cintura (pontas soltas atrás), chapéu de palha de aba curta com fita, tombado. Confete no cabelo, serpentina
   no pescoço (e uma "serpentina" de tripa). Olhos de lua amarelo-pálidos. Brincante de rua, sem paródia de ninguém.
   Golpes: sombrinhada (attack), giro da sombrinha (twirl: defende e rebate projétil; fechada nos quadros 1 e 8),
   passo de tesoura (tesoura: agacha, desliza com a perna esticada e passa por trás) e ajeito (open: de costas,
   ajeita o chapéu ~1 s, a janela de dano). Hi-bit: honra PIX.getK(). */
const FREVISTA=(function(){
  const {rad,lerp,P2,mkPen,compose}=PIX;
  const FW=224, FH=184, GROUND=172, AX=98;
  const RIM={comum:'#d8e4f4', enluarado:'#9ff6ff', plenilunar:'#ffb46a'};

  /* ---------- materiais ---------- */
  function mats(form){
    const m={
      skin:['#b4c4a6','#8a9a82','#56684c','#2e3a30'],
      vein:['#e4f0b0','#b0c87a','#6a8a5a','#3a4a3a'],
      rot:['#a8a47a','#706c50','#48443c','#28242c'],
      flesh:['#f4a28e','#c4545c','#7a3048','#44182e'],
      bone:['#fff4d8','#dccfa6','#a09070','#605040'],
      satR:['#ff9a86','#e0303c','#9c1838','#560c2a'],   // cetim vermelho-frevo
      satY:['#fff6b8','#f6c42c','#e07a1c','#8e3a1c'],   // cetim amarelo
      pants:['#8ef0a8','#2f9a5a','#1a6248','#0e3434'],  // cetim verde
      embr:['#fffbe0','#f6e8a8','#c4a86a','#7a6040'],   // bordado/galão
      sash:['#9ad8ff','#2f8fd8','#1c58a4','#122e66'],   // faixa azul
      sockW:['#fffcf0','#e8e0c8','#a8a0a8','#5e5870'],
      sockR:['#ff8a7a','#d02c3a','#8e1834','#4e0c26'],
      shoe:['#ffffff','#e4e4ec','#9a9ab4','#56567a'],
      sole:['#7a7488','#3c3646','#24202c','#141018'],
      straw:['#fff0b8','#d8b878','#9a7848','#5a4230'],
      band:['#ff7a6a','#c8323c','#801c34','#460c22'],
      hair:['#5e4e5a','#2e2430','#1e1820','#120c14'],
      uR:['#ff9a7a','#e8402e','#a41c2a','#5a0c22'],     // gomos da sombrinha
      uY:['#fff8b0','#f2c230','#b8781c','#6a3a14'],
      uB:['#a6e4ff','#2f8fd8','#1a54a8','#102a66'],
      uG:['#9cf4a4','#2f9a5a','#18604a','#0c3236'],
      steel:['#f6faff','#b8b0a8','#7a7488','#3e3a50'],
      knob:['#8a6a5a','#4a3030','#2c1c22','#180e14'],
      eye:['#fffff0','#fff2a8','#d8c060','#8a7438'],
      mouth:['#7c2e3e','#4c1828','#2e0c1a','#1a0610'],
      teeth:['#fbf0c0','#d8c27c','#9a8650','#5e4e30'],
      conf:['#ff5ab4','#38d8ff','#ffe03a','#7cff6a'],    // confete (cores soltas, sem sombra)
      dirt:['#b8a080','#85704f','#5a4a38','#352a22'],
      blood:['#c43a3e','#7a1020','#541020','#340a18'],
      nail:['#8a7a72','#54484a','#342a30','#1c161a'],
      glow:['#fffbe0','#fff2a8','#d8d08a','#8a8456'],
      swish:['#fdfdff','#e6f0ff','#b4c4e8','#7484b0'],
    };
    if(form==='enluarado'){
      m.skin=['#dcdcff','#a0a2e4','#686cae','#3c3a76']; m.vein=['#a8f4ff','#4ad8f0','#2a8ab0','#1a4a7a'];
      m.rot=['#b8a6e0','#8470b0','#56468a','#33285e']; m.flesh=['#f0b0ff','#b866d8','#7a3a9e','#46206a']; m.blood=['#b46ad8','#7e3ea6','#542474','#34144a'];
      m.eye=['#ffffff','#b8fbff','#4ad8f0','#1a8aa8']; m.glow=['#effffe','#7af4ff','#2ab0d8','#146a96']; m.swish=['#ffffff','#c8fbff','#6ae4f4','#2a9ab8'];
      m.satR=['#e8b4ff','#a868e0','#6a3cae','#3a2072']; m.satY=['#e4f0ff','#a8b8f0','#6a74c0','#3a3c80'];
      m.pants=['#a8f0ff','#4aa8d0','#2a6aa0','#183a6a']; m.embr=['#f4fcff','#c8e0f8','#8aa0d0','#4c5a8e'];
      m.sash=['#c8f4ff','#5ac8f0','#2a7ab8','#164078']; m.straw=['#eef4ff','#bac6e2','#7f8ab2','#4b5179']; m.band=['#d8a8ff','#9a5ad8','#5e329e','#341a62'];
      m.uR=['#ffb8e8','#d850b8','#8e2a8a','#4c1658']; m.uY=['#f0f8ff','#b8d0f8','#7488c8','#3c4486']; m.uB=['#b8f8ff','#40c8f0','#1e7ab8','#123e7a']; m.uG=['#b8ffe8','#3ad0b0','#1a8890','#0e4660'];
      m.sockR=['#d8a8ff','#9a5ad8','#5e329e','#341a62']; m.sockW=['#f4f4ff','#c8c8ec','#8a8ab8','#4c4a7a']; m.dirt=['#a8a0c8','#76709a','#4e4a70','#2e2a48'];
      m.hair=['#5a5878','#2c2a44','#1c1a30','#100e1e'];
    }
    if(form==='plenilunar'){
      m.skin=['#ffcaa6','#e2806a','#a4424e','#5e1e36']; m.vein=['#fff0a0','#ffb43a','#e0581e','#8a2414'];
      m.rot=['#d0806a','#9a4a4a','#682a3a','#3e1628']; m.flesh=['#ffc07a','#f06a3a','#a8302e','#5e1422']; m.blood=['#ff7a3a','#d43a26','#8a1c22','#4e0c18'];
      m.eye=['#fffbe0','#ffe04a','#ff8a2a','#b83a14']; m.glow=['#fff6c0','#ffb43a','#e0581e','#8a2414']; m.swish=['#fffbe6','#ffe6a8','#ffb460','#d0602a'];
      m.satR=['#ff7a5a','#c81a24','#7e0c22','#420618']; m.satY=['#ffc480','#e8642a','#a43420','#5a1418'];
      m.pants=['#d87a9a','#82204c','#4e1236','#2a0a20']; m.embr=['#fff4c0','#ffd47a','#d08a3a','#7a4020'];
      m.sash=['#fff09a','#f2b230','#b46a1c','#5e3014']; m.straw=['#ffe4b2','#ddaa79','#9d6b4f','#5f3b33']; m.band=['#ffd47c','#f28c3b','#b24b27','#63231b'];
      m.uR=['#ffd0a0','#ff6a2a','#c02a18','#6a1012']; m.uY=['#fffad0','#ffd040','#e8801c','#8a3a10']; m.uB=['#e0a8ff','#9440d0','#5a228e','#301052']; m.uG=['#ffb060','#e86a1e','#a03a14','#58180e'];
      m.sockR=['#ff9a6a','#d83a2a','#8e1a22','#4c0a18']; m.sockW=['#ffe8d0','#e8b898','#a87060','#5e3438']; m.dirt=['#b4705a','#844a3e','#5a2e2e','#36181e'];
    }
    return punch(m);
  }
  const NAMES={skin:'Pele',vein:'Veias',rot:'Podridão',flesh:'Carne',bone:'Osso',satR:'Cetim vermelho',satY:'Cetim amarelo',pants:'Calça de cetim',embr:'Bordado',sash:'Faixa',sockW:'Meia (creme)',sockR:'Meia (listra)',shoe:'Tênis',sole:'Sola',straw:'Palha do chapéu',band:'Fita do chapéu',hair:'Cabelo',uR:'Gomo vermelho',uY:'Gomo amarelo',uB:'Gomo azul',uG:'Gomo verde',steel:'Varetas',knob:'Cabo da sombrinha',eye:'Olho de lua',mouth:'Boca',teeth:'Dentes',conf:'Confete',dirt:'Sujeira',blood:'Sangue',nail:'Unhas',glow:'Brilho',swish:'Rastro'};
  function sat(h,k){ const [r,g,b]=PIX.hexRgb(h), y=(r+g+b)/3; return PIX.toHex(y+(r-y)*k,y+(g-y)*k,y+(b-y)*k); }
  const NOPUNCH={swish:1,glow:1,conf:1};
  function punch(m){ const o={}; for(const k in m){ const r=m[k]; o[k]=NOPUNCH[k]?[r[0],r[1],r[2],r[3]]:[sat(r[0],1.08),sat(r[1],1.14),PIX.mix(sat(r[2],1.1),'#2a1a4c',0.22),PIX.mix(r[3],'#140a24',0.36)]; } return o; }

  /* ---------- poses ---------- */
  // ângulos: 0 = pendurado, + = pra frente. Sombrinha (na mão da frente): uA = ângulo do eixo no mundo (0 = copa pra
  // cima, + = pra frente), uo = aberta (0 fechada..1 aberta), us = giro (em gomos), ut = quanto se vê de cima,
  // ub = desenhada atrás do corpo; ul/udx/udy/udr = sombrinha solta (morte). ht = inclinação do chapéu, hat = na
  // cabeça, hh = chapéu na mão de trás. smear = arco da sombrinhada, spin = rastro do giro, lsmear = rastro da tesoura.
  const REST={hx:0,rot:0,lift:0,lean:15,hunch:7,head:-6,jaw:10,aBs:160,aBe:176,aFs:56,aFe:36,lFh:40,lFk:-4,lBh:-26,lBk:-66,fF:0,fB:0,
    uA:22,uo:1,us:0,ut:0.34,ub:0,ul:0,udx:0,udy:0,udr:0,ht:-10,hat:1,hh:0,smear:0,spin:0,lsmear:0,flash:0,drool:0};
  const S=Math.sin, C=Math.cos, PI=Math.PI, mx=Math.max;
  const ANIMS={
    idle:{nome:'Parado (passo no lugar, sombrinha girando)',n:8,dur:()=>140,pose:i=>{ const p=i/8*PI*2, s=S(p), b=mx(0,S(2*p));
      return {hx:1.4*s, lift:1.6*b, lean:15+2*S(p+0.6), hunch:7+1.5*S(2*p), head:-6+3*S(p-0.8), jaw:8+5*mx(0,S(p)), drool:i%4,
        aBs:160+4*s, aBe:176+4*S(p+0.4), uA:22+8*S(p), us:i*0.5, aFs:56+6*s, aFe:36+8*S(p+0.5),
        lFh:40+5*s, lFk:-4-6*b, lBh:-26-4*s, lBk:-66+5*s, fF:4*mx(0,s), ht:-10+2*S(p-1)}; }},
    walk:{nome:'Passo de frevo (zigue-zague)',n:8,dur:()=>110,pose:i=>{ const p=i/8*PI*2;
      const lFh=32+28*mx(0,S(p))-8*mx(0,-S(p)), lBh=-24+30*mx(0,S(p+PI))-6*mx(0,-S(p+PI));
      return {lFh, lFk:lFh-40*mx(0,S(p))-12, lBh, lBk:lBh-40*mx(0,S(p+PI))-14, fF:-14*mx(0,S(p)), fB:-14*mx(0,S(p+PI)),
        lean:15+3*S(2*p), hunch:7+2*S(2*p-0.6), head:-6+3*S(2*p-1.4), jaw:10+4*S(2*p-1.8), hx:2*S(p), lift:3*mx(0,S(2*p)),
        aBs:156+6*S(p), aBe:174+6*S(p+0.6), uA:14+14*S(p), us:i*0.5, aFs:58-14*S(p+PI), aFe:40-14*S(p+PI), ht:-10+2*S(2*p), drool:i%4}; }},
    alert:{nome:'Alerta (estala a sombrinha e tira o chapéu)',n:6,dur:i=>[150,110,90,150,220,170][i],pose:i=>[
      {aBs:100,aBe:120,uA:20,uo:0.5,jaw:14,lean:2},
      {aBs:70,aBe:96,uA:40,uo:0.08,jaw:18,lean:-2,head:0,lFh:18,lBh:-16},
      {aBs:176,aBe:190,uA:-4,uo:1,us:1,jaw:30,lean:8,head:-10,lift:3,flash:0},
      {aBs:172,aBe:184,uA:6,us:2,jaw:24,aFs:150,aFe:176,hat:0,hh:1,head:-2,lean:2},
      {aBs:170,aBe:182,uA:2,us:3,jaw:34,aFs:82,aFe:77,hat:0,hh:1,lean:10,hunch:6,head:-12,lFh:30,lBh:-26},
      {aBs:170,aBe:182,us:4,jaw:16,aFs:160,aFe:190,hat:1,hh:0,ht:-16}][i]},
    // ---- golpes (IA escolhe por distância/peso; hit = quadro(s) do dano, reach = alcance em px) ----
    // sombrinhada: arma a sombrinha atrás da cabeça (~150 ms), desce em arco (smear 2 quadros), recupera 3 quadros
    attack:{nome:'Sombrinhada',n:9,hit:4,reach:34,dur:i=>[100,80,70,50,60,80,120,130,140][i],pose:i=>[
      {aBs:170,aBe:200,uA:-30,uo:0.9,lean:-4,hunch:2,head:-2,jaw:16,hx:-2,aFs:30,aFe:33,lFh:20,lBh:-24},
      {aBs:196,aBe:226,uA:-70,uo:0.8,ub:1,lean:-12,hunch:0,head:4,jaw:24,hx:-4,aFs:15,aFe:16,lFh:18,lFk:-4,lBh:-26,lBk:-40},
      {aBs:204,aBe:236,uA:-92,uo:0.75,ub:1,lean:-14,hunch:-2,head:6,jaw:28,hx:-5,aFs:8,aFe:11,lFh:16,lFk:-2,lBh:-28,lBk:-42},
      {aBs:150,aBe:150,uA:30,uo:0.8,smear:1,lean:14,hunch:10,head:-10,jaw:34,hx:4,aFs:60,aFe:55,lFh:30,lFk:2,lBh:-24,lBk:-38},
      {aBs:96,aBe:84,uA:96,uo:0.8,smear:1,lean:24,hunch:14,head:-14,jaw:40,hx:8,aFs:75,aFe:66,lFh:36,lFk:8,lBh:-30,lBk:-42,fB:12},
      {aBs:74,aBe:56,uA:124,uo:0.85,lean:26,hunch:14,head:-14,jaw:30,hx:9,aFs:78,aFe:69,lFh:36,lFk:8,lBh:-30,lBk:-42,fB:12},
      {aBs:90,aBe:90,uA:80,uo:0.8,lean:16,hunch:10,head:-10,jaw:22,hx:5,aFs:68,aFe:55,lFh:30,lBh:-26},
      {aBs:120,aBe:136,uA:30,uo:0.95,lean:10,hunch:6,head:-8,jaw:16,hx:2},
      {aBs:160,aBe:176,uA:10,jaw:12}][i]},
    // giro da sombrinha: abre (quadro 1, fechada), 6 quadros de disco girando à frente, fecha (quadro 8)
    twirl:{nome:'Giro da sombrinha (defende e rebate)',n:8,hit:[3,5],reach:40,guard:[1,6],dur:i=>[180,110,120,110,120,110,130,150][i],pose:i=>[
      {aBs:60,aBe:80,uA:70,uo:0.06,lean:-2,hunch:2,head:-4,jaw:18,aFs:22,aFe:22,lFh:20,lBh:-22},
      {aBs:84,aBe:86,uA:80,uo:1,us:0.6,ut:0.55,spin:1,lean:6,hunch:6,head:-8,jaw:30,aFs:68,aFe:61,lFh:28,lFk:-6,lBh:-26,lBk:-40},
      {aBs:88,aBe:88,uA:78,uo:1,us:1.9,ut:0.55,spin:1,lean:8,hunch:6,head:-8,jaw:34,hx:2,aFs:72,aFe:66,lFh:30,lFk:-8,lBh:-24,lBk:-42,lift:2},
      {aBs:90,aBe:90,uA:82,uo:1,us:3.2,ut:0.55,spin:1,lean:10,hunch:8,head:-10,jaw:38,hx:3,aFs:75,aFe:68,lFh:32,lFk:-6,lBh:-26,lBk:-40},
      {aBs:88,aBe:88,uA:78,uo:1,us:4.5,ut:0.55,spin:1,lean:8,hunch:6,head:-8,jaw:34,hx:2,aFs:72,aFe:66,lFh:30,lFk:-8,lBh:-24,lBk:-42,lift:2},
      {aBs:90,aBe:90,uA:82,uo:1,us:5.8,ut:0.55,spin:1,lean:10,hunch:8,head:-10,jaw:38,hx:3,aFs:75,aFe:68,lFh:32,lFk:-6,lBh:-26,lBk:-40},
      {aBs:86,aBe:88,uA:80,uo:1,us:7.1,ut:0.55,spin:1,lean:6,hunch:6,head:-8,jaw:28,aFs:68,aFe:61,lFh:28,lBh:-24},
      {aBs:70,aBe:90,uA:60,uo:0.06,lean:2,hunch:4,head:-6,jaw:16,aFs:38,aFe:33}][i]},
    // passo de tesoura: agacha (faixa no chão ~260 ms), desliza com a perna esticada, levanta
    tesoura:{nome:'Passo de tesoura (desliza por trás)',n:8,hit:3,reach:52,slide:[2,4],dur:i=>[130,130,90,90,100,140,150,150][i],pose:i=>[
      {lean:16,hunch:12,head:-12,jaw:16,hx:-2,aBs:120,aBe:140,uA:20,aFs:38,aFe:38,lFh:40,lFk:-34,lBh:-6,lBk:-60,lift:0},
      {lean:24,hunch:16,head:-16,jaw:22,hx:-3,aBs:110,aBe:130,uA:30,aFs:30,aFe:33,lFh:56,lFk:-50,lBh:4,lBk:-76,fB:20},
      {lean:6,hunch:8,head:-8,jaw:30,hx:4,aBs:150,aBe:170,uA:-6,aFs:75,aFe:61,lFh:84,lFk:80,lBh:-70,lBk:-80,fF:-10,fB:40,lsmear:1},
      {lean:2,hunch:6,head:-6,jaw:36,hx:6,aBs:156,aBe:176,uA:-10,us:1,aFs:81,aFe:65,lFh:90,lFk:88,lBh:-80,lBk:-86,fF:-14,fB:50,lsmear:1},
      {lean:4,hunch:6,head:-6,jaw:34,hx:5,aBs:150,aBe:170,uA:-6,us:2,aFs:75,aFe:62,lFh:86,lFk:82,lBh:-74,lBk:-82,fF:-12,fB:44,lsmear:1},
      {lean:20,hunch:14,head:-14,jaw:24,hx:0,aBs:120,aBe:140,uA:20,us:2,aFs:38,aFe:38,lFh:50,lFk:-40,lBh:0,lBk:-70,fB:20},
      {lean:12,hunch:8,head:-10,jaw:16,aBs:130,aBe:150,us:3,aFs:45,aFe:41,lFh:30,lFk:-16,lBh:-14,lBk:-40},
      {jaw:12,us:3}][i]},
    // ajeito (depois da tesoura, de costas pro alvo): levanta, ajeita o chapéu, sacode a sombrinha (~1 s)
    open:{nome:'Ajeito (ajeita o chapéu, de costas)',n:8,dur:i=>[120,130,140,140,140,130,120,120][i],pose:i=>[
      {lean:14,hunch:10,head:-10,jaw:10,lFh:30,lFk:-16,lBh:-10,lBk:-40,aBs:100,aBe:120,uA:40,uo:0.7},
      {lean:6,hunch:8,head:-16,jaw:8,aFs:150,aFe:186,aBs:90,aBe:110,uA:50,uo:0.6,ht:-22},
      {lean:4,hunch:8,head:-20,jaw:6,aFs:156,aFe:196,aBs:92,aBe:112,uA:44,uo:0.6,ht:-4},
      {lean:4,hunch:8,head:-18,jaw:8,aFs:150,aFe:184,aBs:96,aBe:116,uA:40,uo:0.6,ht:-14},
      {lean:2,hunch:6,head:-8,jaw:10,aFs:30,aFe:28,aBs:110,aBe:140,uA:20,uo:0.9,us:1},
      {lean:4,hunch:4,head:-6,jaw:14,aFs:45,aFe:38,aBs:130,aBe:156,uA:-10,us:2},
      {lean:6,hunch:4,head:-4,jaw:12,aBs:160,aBe:176,uA:12,us:3},
      {jaw:10,us:4}][i]},
    hurt:{nome:'Dano (cabeça)',n:4,dur:i=>[80,110,130,150][i],pose:i=>[
      {lean:-10,hunch:-2,head:10,jaw:30,aBs:100,aBe:110,uA:40,uo:0.8,aFs:22,aFe:6,hx:-6,flash:1,lFh:14,lBh:-8,ht:-24},
      {lean:-6,hunch:0,head:6,jaw:26,aBs:110,aBe:124,uA:30,uo:0.85,aFs:30,aFe:16,hx:-5,lFh:14,lBh:-10,ht:-18},
      {lean:0,hunch:2,head:-2,jaw:20,aBs:124,aBe:146,uA:14,aFs:38,aFe:33,hx:-2,ht:-12},
      {lean:4,hunch:3,head:-5,jaw:12,hx:0}][i]},
    hurtB:{nome:'Dano (barriga, dobra)',n:4,dur:i=>[80,120,140,150][i],pose:i=>[
      {lean:32,hunch:22,head:8,jaw:40,aBs:60,aBe:40,uA:90,uo:0.7,aFs:30,aFe:10,hx:-8,flash:1,lFh:20,lFk:-20,lBh:-14,lBk:-36,ht:0},
      {lean:28,hunch:20,head:4,jaw:36,aBs:66,aBe:46,uA:80,uo:0.75,aFs:24,aFe:16,hx:-7,lFh:18,lFk:-18,lBh:-14,lBk:-34},
      {lean:16,hunch:12,head:-4,jaw:24,aBs:100,aBe:110,uA:40,aFs:15,aFe:16,hx:-3},
      {lean:8,hunch:6,head:-6,jaw:12,hx:-1}][i]},
    fall:{nome:'Derrubado',n:5,dur:i=>[90,100,110,140,280][i],pose:i=>[
      {lean:-14,hunch:-2,head:8,jaw:34,aBs:160,aBe:170,uA:-20,uo:0.7,aFs:-80,aFe:-60,hx:-6,flash:1,lFh:24,lBh:0,ht:-26},
      {rot:-36,lean:-4,hunch:4,head:2,jaw:30,aBs:170,aBe:180,uA:-40,uo:0.6,aFs:-100,aFe:-80,hx:-4,lFh:44,lFk:30,lBh:20,lBk:10,ht:-28},
      {rot:-70,lean:0,hunch:6,head:-2,jaw:30,aBs:176,aBe:186,uA:-70,uo:0.5,aFs:-110,aFe:-100,hx:-6,lFh:50,lFk:40,lBh:30,lBk:20,ht:-30},
      {rot:-90,lean:4,hunch:8,head:-2,jaw:36,aBs:180,aBe:190,uA:-90,uo:0.5,aFs:-120,aFe:-130,hx:2,lFh:40,lFk:10,lBh:30,lBk:4,ht:-30},
      {rot:-90,lean:0,hunch:8,head:-4,jaw:34,aBs:184,aBe:192,uA:-92,uo:0.45,aFs:-126,aFe:-140,hx:2,lFh:40,lFk:6,lBh:26,lBk:0,ht:-30}][i]},
    getup:{nome:'Levantar (pula de volta no passo)',n:5,dur:i=>[200,170,160,160,150][i],pose:i=>[
      {rot:-90,lean:0,hunch:8,head:-4,jaw:34,aBs:184,aBe:192,uA:-92,uo:0.45,aFs:-126,aFe:-140,hx:2,lFh:40,lFk:6,lBh:26,lBk:0,ht:-30},
      {rot:-56,lean:10,hunch:14,head:-14,jaw:24,aBs:150,aBe:160,uA:-40,uo:0.6,aFs:-60,aFe:-20,hx:-8,lFh:90,lFk:10,lBh:70,lBk:0,ht:-20},
      {rot:-24,lean:22,hunch:18,head:-20,jaw:20,aBs:130,aBe:140,uA:0,uo:0.8,aFs:-20,aFe:0,hx:-6,lFh:100,lFk:10,lBh:50,lBk:-60},
      {rot:0,lean:24,hunch:16,head:-18,jaw:18,aBs:130,aBe:150,uA:10,aFs:-50,aFe:-70,hx:-3,lFh:70,lFk:-10,lBh:4,lBk:-80,fB:50},
      {lean:8,hunch:6,head:-8,jaw:12,lift:3}][i]},
    death:{nome:'Morte (gira, a sombrinha voa, cai de joelhos e de costas)',n:8,dur:i=>[90,140,150,160,150,150,170,600][i],pose:i=>[
      {lean:-12,hunch:-2,head:10,jaw:40,aBs:170,aBe:190,uA:-20,aFs:-50,aFe:-30,hx:-5,flash:1,lFh:14,lBh:-8,ht:-24},
      {lean:-6,hunch:2,head:12,jaw:48,aBs:176,aBe:200,uA:-40,uo:0.8,aFs:-90,aFe:-110,hx:-6,lFh:20,lBh:-14,lift:4,ht:-30},
      {lean:4,hunch:10,head:2,jaw:46,aBs:150,aBe:160,aFs:-120,aFe:-140,hx:-4,lFh:40,lFk:-30,lBh:24,lBk:-50,fF:10,fB:30,ul:1,udx:-18,udy:70,udr:-80,hat:0},
      {lean:8,hunch:16,head:-8,jaw:48,aBs:40,aBe:20,aFs:-20,aFe:0,hx:-2,lFh:14,lFk:-92,lBh:6,lBk:-96,fF:100,fB:100,ul:1,udx:-30,udy:56,udr:-170,hat:0},
      {rot:14,lean:10,hunch:20,head:-8,jaw:48,aBs:24,aBe:20,aFs:16,aFe:14,lFh:2,lFk:-92,lBh:-6,lBk:-96,fF:90,fB:90,ul:1,udx:-40,udy:34,udr:-260,hat:0},
      {rot:46,lean:8,hunch:18,head:-12,jaw:44,aBs:70,aBe:90,aFs:56,aFe:76,hx:4,lFh:-20,lFk:-70,lBh:-28,lBk:-74,fF:60,fB:60,ul:1,udx:-48,udy:12,udr:-330,hat:0},
      {rot:84,lean:2,hunch:10,head:-4,jaw:40,aBs:150,aBe:170,aFs:110,aFe:150,hx:8,lFh:-4,lFk:-10,lBh:-8,lBk:-14,fF:10,fB:10,ul:1,udx:-54,udy:2,udr:-380,hat:0},
      {rot:90,lean:0,hunch:8,head:0,jaw:42,aBs:160,aBe:176,aFs:116,aFe:156,hx:8,lFh:-2,lFk:-6,lBh:-6,lBk:-10,fF:6,fB:6,ul:1,udx:-56,udy:0,udr:-390,hat:0,drool:3}][i]},
  };
  const EXK=['hx','lean','hunch','head','aFs','aFe','aBs','aBe','lFh','lFk','lBh','lBk'];
  function exag(P,f){ if(f===1||Math.abs(P.rot)>4) return P; EXK.forEach(k=>{ P[k]=REST[k]+(P[k]-REST[k])*f; }); P.jaw=Math.min(58,mx(0,REST.jaw+(P.jaw-REST.jaw)*f)); return P; }
  const EXF={idle:1.04,walk:1.08,alert:1.1,attack:1.15,twirl:1.06,tesoura:1.05,open:1.04,hurt:1.25,hurtB:1.2,fall:1.08,getup:1.06,death:1.08};
  ZREACT.add(ANIMS,REST,{});
  function poseOf(anim,i){ const A=ANIMS[anim]; return exag(Object.assign({},REST,A.pose(i)),EXF[anim]||1); }
  function heavyOutline(cv){ const g=cv.getContext('2d'), W=cv.width, H=cv.height, im=PIX.pix(cv), d=im.data;
    const isO=i=>d[i+3]===255&&d[i]===0x17&&d[i+1]===0x0b&&d[i+2]===0x1c, fill=i=>d[i+3]===255&&!isO(i);
    const add=[]; for(let y=2;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(d[i+3]) continue; const u=((y-1)*W+x)*4, u2=((y-2)*W+x)*4; if(isO(u)&&fill(u2)) add.push(i); }
    add.forEach(i=>{ d[i]=0x17; d[i+1]=0x0b; d[i+2]=0x1c; d[i+3]=255; }); g.putImageData(im,0,0); }

  /* ---------- esqueleto (magro, pernas longas, cabeça pequena) ---------- */
  const SPINE=36, TH=23, SH=22.5, UA=14.4, FA=13.4, VS=SPINE/37, US=0.96, HB=8, HS=1.12;
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
    const top=SS[SPINE], neck=T(1,-37.4), sa=top.a;
    const shF=T(0,-32), shB=T(-5.4,-32.6);
    const elF=lp(shF,P.aFs-R,UA), wrF=lp(elF,P.aFe-R,FA), elB=lp(shB,P.aBs-R,UA), wrB=lp(elB,P.aBe-R,FA);
    const ha=sa+rad(P.head-HB*0.8), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:neck.x+(lx*hc-ly*hs)*HS, y:neck.y+(lx*hs+ly*hc)*HS});
    // sombrinha: empunhadura um pouco além do punho, eixo no ângulo absoluto uA (+ rotação do corpo)
    const grip={x:wrB.x+(wrB.x-elB.x)/FA*4, y:wrB.y+(wrB.y-elB.y)/FA*4}, ua=rad(P.uA+R);
    const toe=(a,f)=>{ const t=rad(f+R); return {x:a.x+(10*Math.cos(t)-4.6*Math.sin(t))*1.3, y:a.y+(10*Math.sin(t)+4.6*Math.cos(t))*1.3}; };
    const hull=[[ankleF,5],[ankleB,5],[toe(ankleF,P.fF),1],[toe(ankleB,P.fB),1],[kneeF,5],[kneeB,5],[hip,8],[T(0,-18),10],[T(-2,-30),10],[H(3,-11),10],[wrF,4],[wrB,4],[elF,4],[elB,4]];
    return {R,hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,SP,T,sa,neck,shF,shB,elF,wrF,elB,wrB,ha,H,hull,ra,grip,ua,toeF:toe(ankleF,P.fF),toeB:toe(ankleB,P.fB)};
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

  /* ---------- sombrinha de frevo (local: origem na empunhadura, eixo pra cima = -y) ---------- */
  const UR=24, NG=8, GC=['uR','uY','uB','uG'];
  function drawUmbrella(c,p,M,form,P){
    const o=Math.max(0,Math.min(1,P.uo)), R=UR*(0.16+0.84*o), Hd=7.5+(1-o)*15, ut=P.ut*(0.4+0.6*o);
    const ry=-17+(1-o)*8, ay=ry-Hd;           // centro da borda e ápice
    // cabo curto com castão (abaixo da mão) e haste
    p.F(M.knob[1]); p.cap(P2(0,1),P2(0,5.4),2.6,3); p.F(M.knob[0]); p.rect(-1,1.4,0.8,3); p.F(M.knob[3]); p.rect(0.6,2,0.7,3);
    p.F(M.steel[2]); p.cap(P2(0,0),P2(0,ay+1),1.2,1.1); p.F(M.steel[0]); p.rect(-0.6,ay+3,0.5,-ay-4);
    const rim=(phi)=>[Math.cos(phi)*R, ry+Math.sin(phi)*R*ut];
    const sag=(phi,k)=>{ const q=rim(phi); return [q[0]*(1-k), q[1]-(q[1]-ay)*k*0.5]; };
    const L=[0.86,0.5];                      // direção da luz no plano (frente-cima)
    const gores=[];
    for(let g=0;g<NG;g++){ const a0=(g+P.us)/NG*PI*2, a1=(g+1+P.us)/NG*PI*2, am=(a0+a1)/2;
      gores.push({g,a0,a1,am,front:Math.sin(am)>0,depth:Math.sin(am)}); }
    gores.sort((A,B)=>A.depth-B.depth);
    for(const G of gores){
      const R4=M[GC[((G.g%4)+4)%4]];
      const pts=[[0,ay]]; for(let k=0;k<=6;k++){ const t=k/6, ph=G.a0+(G.a1-G.a0)*t, s=Math.sin(t*PI)*0.1*o; pts.push(sag(ph,s)); }
      const b=Math.cos(G.am)*L[0]+Math.sin(G.am)*L[1]*0.6;
      const tone=G.front?(b>0.45?0:b>-0.25?1:b>-0.7?2:3):(b>0.2?1:2);
      p.F(R4[tone]); p.poly(pts);
      if(G.front && o>0.4){
        // faixa escura perto da borda (curvatura) e brilho de cetim perto do ápice
        const band=[]; for(let k=0;k<=6;k++){ const t=k/6, ph=G.a0+(G.a1-G.a0)*t, s=Math.sin(t*PI)*0.1*o; band.push(sag(ph,s)); }
        for(let k=6;k>=0;k--){ const t=k/6, ph=G.a0+(G.a1-G.a0)*t, q=rim(ph); band.push([q[0]*0.8, q[1]-(q[1]-ay)*0.2]); }
        p.F(R4[Math.min(3,tone+1)]); p.poly(band);
        if(tone<=1){ const q0=rim(G.a0+(G.a1-G.a0)*0.25), q1=rim(G.a0+(G.a1-G.a0)*0.6);
          p.F(R4[0]); p.poly([[0,ay+0.4],[q0[0]*0.55,ay+(q0[1]-ay)*0.55],[q1[0]*0.5,ay+(q1[1]-ay)*0.5]]); }
      }
    }
    if(o>0.4){
      // varetas aparentes (frente) e pontas de metal
      for(const G of gores){ if(!G.front) continue; const q=rim(G.a0); p.F(M.steel[2]); p.cap(P2(0,ay),P2(q[0],q[1]),0.5,0.6); p.F(M.steel[0]); p.circle(P2(q[0],q[1]),0.9); }
      { const q=rim(gores[gores.length-1].a1); p.F(M.steel[0]); p.circle(P2(q[0],q[1]),0.9); }
      // rasgo num gomo da frente (pano rasgado e vareta torta à mostra)
      const Gt=gores.find(G=>G.front&&G.g%NG===2);
      if(Gt){ const q=rim(Gt.am), h=[q[0]*0.62, ay+(q[1]-ay)*0.62];
        p.F(M.knob[3]); p.poly([[h[0]-2.2,h[1]-0.6],[h[0]+0.4,h[1]-2],[h[0]+2.6,h[1]+0.4],[h[0]+0.6,h[1]+2.4],[h[0]-1.2,h[1]+1.6]]);
        p.F(M.steel[1]); p.cap(P2(h[0]-1.6,h[1]-0.2),P2(h[0]+2,h[1]+1.2),0.5,0.5); }
      if(form==='enluarado'){ for(const G of gores){ if(!G.front||G.g%3) continue; const q=rim(G.am); p.F(M.glow[1]);
        p.poly([[q[0]*0.3,ay+(q[1]-ay)*0.3],[q[0]*0.55+0.8,ay+(q[1]-ay)*0.55],[q[0]*0.5,ay+(q[1]-ay)*0.6],[q[0]*0.8+1,ay+(q[1]-ay)*0.85],[q[0]*0.78,ay+(q[1]-ay)*0.88],[q[0]*0.46-0.4,ay+(q[1]-ay)*0.62],[q[0]*0.52,ay+(q[1]-ay)*0.52]]); } }
      // fiapos/fitas soltas na borda
      p.F(M.uY[1]); { const q=rim(PI*0.62); p.poly([[q[0],q[1]],[q[0]-1,q[1]+4.6],[q[0]+0.6,q[1]+3.8],[q[0]+0.8,q[1]]]); }
      p.F(M.uR[1]); { const q=rim(PI*0.3); p.poly([[q[0],q[1]],[q[0]+0.6,q[1]+3.8],[q[0]+1.6,q[1]+3],[q[0]+1,q[1]]]); }
    } else {
      // fechada: pano enrolado com dobras
      p.F(M.uB[2]); p.poly([[-R*0.6,ry],[0,ay],[R*0.2,ry+1]]); p.F(M.uY[0]); p.poly([[R*0.15,ry+0.5],[0,ay+2],[R*0.55,ry]]);
      p.F(M.steel[0]); [-1,1].forEach(s=>p.circle(P2(s*R*0.8,ry+0.6),0.7));
    }
    // ponteira no ápice
    p.F(M.steel[1]); p.cap(P2(0,ay),P2(0,ay-2.6),1.4,0.8); p.F(M.steel[0]); p.rect(-0.5,ay-2.4,0.5,1.4);
    if(form==='plenilunar' && o>0.4){ // chamas lunares lambendo a borda
      for(let k=0;k<5;k++){ const ph=PI*(0.05+k*0.22)+P.us*0.3, q=rim(ph), h=4+((k*7+Math.round(P.us*3))%3)*1.6;
        p.F(M.glow[1]); p.poly([[q[0]-1.8,q[1]],[q[0]-0.6,q[1]-h],[q[0]+0.4,q[1]-h*0.5],[q[0]+1.4,q[1]-h*0.9],[q[0]+2,q[1]]]);
        p.F(M.glow[0]); p.poly([[q[0]-0.8,q[1]],[q[0]-0.2,q[1]-h*0.55],[q[0]+0.8,q[1]]]); }
      p.F(M.glow[1]); p.poly([[-2,ay],[-1,ay-6],[0,ay-3.4],[1.2,ay-7],[2,ay]]);
    }
  }
  function umbAt(c,p,M,form,P,x,y,a){ p.xf(a,x,y); drawUmbrella(c,p,M,form,P); p.id(); }

  /* ---------- chapéu de palha de aba curta com fita (local: centro da aba, x pra frente) ---------- */
  function drawHat(c,p,M,form){
    const brim=(dy,k)=>{ const pts=[]; for(let i=0;i<20;i++){ const a=i/20*PI*2, ca=Math.cos(a); pts.push([ca*12.6*k, Math.sin(a)*2.6*k+dy+(ca>0.4?(ca-0.4)*1.6:0)]); } return pts; };
    p.F(M.straw[2]); p.poly(brim(1.2,1));
    p.F(M.straw[1]); p.poly(brim(0,1));
    clip(c,brim(0,1),()=>{ p.F(M.straw[0]); p.poly([[4,1.6],[12.6,0.4],[12.6,1.8],[5,2.6]]); p.F(M.straw[2]); p.poly([[-14,-2],[-5,-2],[-5,4],[-14,4]]);
      p.F(M.straw[3]); for(let k=0;k<8;k++) p.rect(-11+k*3,-2+(k%2)*0.5,0.5,4.4); });
    const crown=[[-7.4,0.4],[-7.6,-4.2],[-6.4,-7.4],[-2,-8.4],[3,-8.4],[6.6,-7],[7.6,-3.6],[7.6,0.4],[0,1.4]];
    p.F(M.straw[1]); p.poly(crown);
    clip(c,crown,()=>{
      p.F(M.straw[2]); p.poly([[-9,-10],[-3.6,-10],[-4.2,3],[-9,3]]);
      p.F(M.straw[3]); p.poly([[-9,-10],[-6,-10],[-6.4,3],[-9,3]]);
      p.F(M.straw[0]); p.poly([[1.6,-8.2],[6,-7.2],[7.2,-4],[4.4,-6.2]]);
      p.F(M.straw[2]); for(let r=0;r<2;r++) for(let k=0;k<6;k++) p.rect(-5+k*2.4+(r%2)*1.2,-6.6+r*1.8,0.7,0.6);
      p.F(M.band[1]); p.poly([[-9,-2.8],[9,-2.8],[9,0.8],[-9,0.8]]);
      p.F(M.band[0]); p.poly([[-1,-2.8],[7.6,-2.8],[7.6,-2.2],[-1,-2.2]]);
      p.F(M.band[2]); p.poly([[-9,-0.6],[-3,0],[-3,0.8],[-9,0.8]]);
    });
    // pontas da fita soltas atrás
    p.F(M.band[1]); p.poly([[-7.2,-2.4],[-10.4,3.6],[-9,4.4],[-6.2,-0.6]]); p.poly([[-6.6,-1.6],[-8,6],[-6.6,6.4],[-5.6,-0.8]]);
    p.F(M.band[2]); p.poly([[-10.4,3.6],[-9,4.4],[-9.6,4.8]]);
    // confete grudado na palha
    p.F(M.conf[0]); p.rect(2,-5,1.1,1); p.F(M.conf[1]); p.rect(-2.6,-6.4,1,1); p.F(M.conf[2]); p.rect(9,1,1,0.9);
    if(form==='plenilunar'){ p.F(M.blood[1]); p.ell(4.6,-4,1.4,1); }
  }
  function hatAt(c,p,M,form,ox,oy,ang,sc){ p.xf(ang,ox,oy); c.scale(sc,sc); drawHat(c,p,M,form); p.id(); }

  /* ---------- braços: manga curta de cetim (bufante), antebraço de pele ---------- */
  function drawArm(c,u,M,sk,P,front,form){
    const p=mkPen(c,u), sh=front?sk.shF:sk.shB, el=front?sk.elF:sk.elB, wr=front?sk.wrF:sk.wrB; p._c=c; p.id();
    const SR=front?M.satR:M.satY, sn=sideN(sh,el);
    // braço de pele (podre, veia), manga até meio braço
    const n=limb(p,M.skin,el,wr,7.4,6.4,{});
    p.F(M.vein[1]); p.cap(off(lerp(el,wr,0.25),n,-1),off(lerp(el,wr,0.8),n,-1.3),0.6,0.5);
    const up=limb(p,M.skin,sh,el,8,7.4,{hl:0.6});
    p.F(M.skin[2]); p.circle(el,3.4);
    const m1=lerp(sh,el,0.62);
    limb(p,SR,lerp(sh,el,0),m1,9.6,8.6,{hl:0.55,sh:0.55});
    // galão bordado na barra da manga
    p.F(M.embr[1]); p.cap(off(m1,sn,-5.4),off(m1,sn,5.4),1.6,1.6); p.F(M.embr[2]); p.cap(off(m1,sn,0.6),off(m1,sn,5.4),1.2,1.2);
    // vincos do cetim
    p.F(SR[0]); const c3=lerp(sh,el,0.2); p.cap(off(c3,sn,-4),off(lerp(sh,el,0.45),sn,-2.6),0.9,0.7);
    p.F(SR[2]); const c4=lerp(sh,el,0.36); p.cap(off(c4,sn,1.4),off(lerp(sh,el,0.52),sn,4),0.8,0.7);
    if(!front){ p.F(M.rot[1]); const r=lerp(el,wr,0.5); p.ell(r.x+n.nx*1.2,r.y+n.ny*1.2,1.5,1); p.F(M.flesh[2]); p.rect(r.x+n.nx*1.2-0.5,r.y+n.ny*1.2-0.4,1,0.8); }
    else { p.F(M.blood[1]); const b=lerp(el,wr,0.45); p.ell(b.x+n.nx*1.6,b.y+n.ny*1.6,1.2,1.6); }
    if(front) drawHandB(c,p,M,el,wr,P,form); else if(P.ul>=0.5) drawFist(p,M,el,wr);
  }
  function drawFist(p,M,el,wr){
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y); p._c.scale(1.2,1.2);
    p.F(M.skin[1]); p.poly([[-1,-3.2],[4,-3.6],[5.6,-1],[5.2,3.2],[-1,3.4]]);
    p.F(M.skin[2]); p.poly([[-1,1.2],[5.4,1],[5.2,3.2],[-1,3.4]]);
    p.F(M.skin[0]); p.rect(0.4,-3,3.4,0.9);
    for(let k=0;k<4;k++){ const y0=-2.6+k*1.8; p.F(M.skin[1]); p.ell(5.6,y0,1.6,1); p.F(M.skin[2]); p.rect(5,y0+0.4,1.5,0.5); p.F(M.nail[1]); p.rect(6.2,y0-0.4,0.8,0.7); }
    p.F(M.skin[1]); p.cap(P2(1.6,-3),P2(4.6,-4.4),1.7,1.3);
    p.id();
  }
  function drawHandB(c,p,M,el,wr,P,form){
    // mão aberta de dançarino, dedos esticados
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y); p._c.scale(1.2,1.2);
    p.F(M.skin[1]); p.poly([[-1,-2.8],[4.2,-3],[5,2.6],[-1,3]]);
    p.F(M.skin[2]); p.poly([[-1,0.8],[4.8,0.8],[5,2.6],[-1,3]]);
    [[-2.2,9.6],[-0.7,10.6],[0.8,10.2],[2.3,8.8]].forEach(([y,L])=>{ p.F(M.skin[1]); p.cap(P2(4,y),P2(L,y+0.4),1.5,1.1); p.F(M.nail[1]); p.rect(L-0.6,y-0.2,0.9,0.8); });
    p.F(M.skin[1]); p.cap(P2(2,-2.8),P2(4.6,-5.4),1.7,1.2); p.F(M.skin[0]); p.rect(0.4,-2.6,3.2,0.8);
    p.id();
    if(P.hh>=0.5){ const ang2=Math.atan2(wr.y-el.y,wr.x-el.x), hp={x:wr.x+(wr.x-el.x)/FA*7,y:wr.y+(wr.y-el.y)/FA*7}; hatAt(c,p,M,form,hp.x,hp.y,ang2+PI/2,HS*0.95); }
  }

  /* ---------- pernas: calça 3/4 de cetim verde (barra bordada), meia listrada, tênis ---------- */
  function drawLeg(c,u,M,sk,P,front){
    const p=mkPen(c,u), hip=front?sk.hipF:sk.hipB, knee=front?sk.kneeF:sk.kneeB, ank=front?sk.ankleF:sk.ankleB; p.id();
    // meia listrada (canela inteira) por baixo
    const nS=limb(p,M.sockW,knee,ank,7.6,6.2,{hl:0.5,sh:0.5});
    const sd=sideN(knee,ank);
    for(let k=0;k<5;k++){ const a=lerp(knee,ank,0.32+k*0.14); p.F(M.sockR[1]); p.cap(off(a,sd,-3.6),off(a,sd,3.6),1.7,1.7); p.F(M.sockR[2]); p.cap(off(a,sd,0.4),off(a,sd,3.6),1.7,1.7); }
    // calça: coxa e começo da canela (barra logo abaixo do joelho)
    const hem=lerp(knee,ank,0.28);
    const nT=limb(p,M.pants,hip,knee,12.6,10.4,{hl:0.55});
    limb(p,M.pants,knee,hem,10.4,10.2,{hi:false});
    p.F(M.pants[1]); p.circle(knee,5.2);
    // brilho de cetim (faixa forte) e dobras
    p.F(M.pants[0]); p.cap(off(lerp(hip,knee,0.08),nT,-3.6),off(lerp(hip,knee,0.8),nT,-3),1.2,1);
    p.F(M.pants[2]); p.cap(off(lerp(hip,knee,0.45),nT,0.6),off(lerp(hip,knee,0.6),nT,4.4),0.9,0.8); p.cap(off(lerp(hip,knee,0.7),nT,-1),off(lerp(hip,knee,0.86),nT,4),0.8,0.7);
    // barra bordada (galão creme com zigue-zague)
    p.F(M.embr[1]); p.cap(off(hem,sd,-5.8),off(hem,sd,5.8),2.6,2.6);
    p.F(M.embr[2]); p.cap(off(hem,sd,1),off(hem,sd,5.8),2.6,2.6);
    const h1=lerp(knee,ank,0.25); p.F(M.embr[3]); for(let k=-2;k<=2;k++){ const q=off(h1,sd,k*2.2); p.rect(q.x-0.5,q.y-0.5,1,1); }
    p.F(M.embr[0]); { const q=off(hem,sd,-3.6); p.rect(q.x-0.6,q.y-0.8,1.6,0.8); }
    if(front){ p.F(M.blood[1]); const b0=lerp(hip,knee,0.4); p.ell(b0.x+nT.nx*2.6,b0.y+nT.ny*2.6,1.3,2);
      p.F(M.pants[3]); const k0=lerp(hip,knee,0.9); p.poly([[k0.x+nT.nx*3.4,k0.y+nT.ny*3.4],[k0.x-1,k0.y-1.6],[k0.x+1.4,k0.y+2.6]]); p.F(M.skin[2]); p.ell(k0.x+nT.nx*1.6,k0.y+nT.ny*1.6+0.6,1.2,1); }
    else { p.F(M.dirt[2]); const d0=lerp(knee,ank,0.7); p.ell(d0.x,d0.y,1.8,1.2); }
    // tênis de sola fina
    const fa=rad((front?P.fF:P.fB)+sk.R); p.xf(fa,ank.x,ank.y); c.scale(1.3,1.3);
    p.F(M.shoe[1]); p.poly([[-3.2,-1.6],[2.4,-1.8],[6.4,0.2],[9.6,1.2],[10.6,3],[-3.6,3]]);
    p.F(M.shoe[2]); p.poly([[-3.6,1.8],[10.4,2],[10.6,3],[-3.6,3]]);
    p.F(M.shoe[0]); p.poly([[0,-1.4],[2.4,-1.6],[6,0.4],[5.8,1],[2.2,-0.4],[0,-0.6]]);
    p.F(M.sockR[1]); p.poly([[4.6,0.2],[8.6,1.2],[8.8,2],[4.4,1.2]]); // faixa colorida do tênis
    p.F(M.sole[1]); p.poly([[-4,3],[11,3],[10.8,4.2],[-3.8,4.2]]); p.F(M.sole[0]); p.rect(-3.6,3,13,0.5);
    p.F(M.sole[2]); [[2.8,-0.9],[4.2,-0.3],[5.4,0.3]].forEach(([x,y])=>p.rect(x,y,0.8,0.7));
    p.F(M.dirt[1]); p.ell(7,2.4,1.4,0.7);
    p.id();
  }
  function drawLegSmear(c,u,M,sk,P){
    const p=mkPen(c,u); p.id();
    const h=sk.hipF, t=sk.toeF, r=Math.hypot(t.x-h.x,t.y-h.y)+2, a1=Math.atan2(t.y-h.y,t.x-h.x);
    const n=10, pts=[]; for(let i=0;i<=n;i++){ const a=a1+0.9*i/n; pts.push([h.x+Math.cos(a)*r,Math.min(GROUND,h.y+Math.sin(a)*r)]); }
    for(let i=n;i>=0;i--){ const a=a1+0.9*i/n, rr=r-2.4-6*(i/n); pts.push([h.x+Math.cos(a)*rr,Math.min(GROUND,h.y+Math.sin(a)*rr)]); }
    p.F(M.swish[1]); p.poly(pts);
    // rastro horizontal rente ao chão (deslize)
    p.F(M.swish[2]); p.poly([[t.x-40,GROUND-3],[t.x-4,GROUND-4],[t.x-4,GROUND-1.5],[t.x-34,GROUND-1.6]]);
    p.F(M.dirt[0]); [[0,0],[-9,1],[-17,0.6],[-26,1]].forEach(([dx,dy])=>p.ell(t.x+dx-6,GROUND-2+dy,2.4,1.4));
  }

  /* ---------- tronco: camisa de cetim em gomos, gola bordada, faixa azul ---------- */
  const SHIRT=[[-8.4,-1],[-8.6,-6],[-9,-16],[-9.6,-25],[-10.2,-31],[-9.2,-36],[-5.6,-39],[0,-40.4],[5.6,-39.6],[9,-36.6],[10.4,-31],[10.6,-23],[10,-14],[9.6,-6],[9.8,-1],[0,-0.4]];
  function drawTorso(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    // assento da calça (sob a camisa)
    p.F(M.pants[1]); p.poly(W(sk,[[-9.4,9],[-8.8,-2],[9.8,-2],[10.4,9],[0,11]]));
    p.F(M.pants[2]); p.poly(W(sk,[[-9.4,9],[-8.8,-2],[-3,-2],[-3.6,10.4]]));
    const shape=W(sk,SHIRT);
    p.F(M.satR[1]); p.poly(shape);
    clip(c,shape,()=>{
      // gomos verticais: vermelho / amarelo alternados
      [[-3,4]].forEach(([a,b])=>{ p.F(M.satY[1]); p.poly(W(sk,[[a,-42],[b,-42],[b+0.4,6],[a+0.4,6]])); });
      // costas na sombra (frio), faixa mais funda
      p.F(M.satR[2]); p.poly(W(sk,[[-12,6],[-12,-42],[-5.2,-42],[-5.6,-30],[-5,-16],[-4.4,6]]));
      p.F(M.satR[3]); p.poly(W(sk,[[-12,6],[-12,-42],[-8,-42],[-8.6,-30],[-8.2,-16],[-7.6,6]]));
      p.F(M.satY[2]); p.poly(W(sk,[[-3,-42],[-1,-42],[-0.8,6],[-2.6,6]]));
      p.F(M.satR[2]); p.poly(W(sk,[[4,-42],[5.4,-42],[5.6,6],[4.4,6]]));
      p.F(M.embr[2]); [-3,4].forEach(a=>p.poly(W(sk,[[a-0.3,-42],[a+0.3,-42],[a+0.7,6],[a+0.1,6]]))); // costura dourada entre os gomos
      // sombra embaixo do peito/barriga (frio, área grande)
      p.F(M.satR[2]); p.poly(W(sk,[[-6,-12],[0,-14],[6,-13],[12,-15],[12,6],[-6,6]])); p.F(M.satY[2]); [[-3,4]].forEach(([a2,b2])=>p.poly(W(sk,[[a2,-13.6],[b2,-14],[b2+0.4,6],[a2+0.4,6]])));
      p.F(M.satR[3]); p.poly(W(sk,[[7,-15.4],[12,-17],[12,-8],[7.4,-10]])); p.F(M.satY[3]); p.poly(W(sk,[[-0.8,-13.8],[1.6,-14],[1.8,6],[-0.4,6]]));
      // brilho de cetim em diagonal (forte e limpo)
      p.F(M.satR[0]); p.poly(W(sk,[[6,-36],[8.6,-36],[9.8,-28],[7.4,-22],[6.4,-26]]));
      p.F(M.satY[0]); p.poly(W(sk,[[0.6,-35],[2.6,-37],[3.6,-31],[2,-24],[1,-28]]));
      // vincos do cetim
      p.F(M.satY[2]); p.poly(W(sk,[[0.4,-21],[3.4,-23],[3.6,-22.2],[0.6,-20.2]]));
      p.F(M.satR[3]); p.poly(W(sk,[[6,-30],[9.6,-32],[9.8,-31],[6.2,-29.2]])); p.poly(W(sk,[[-4.4,-22],[-3.2,-23],[-3,-22.2],[-4.2,-21.2]]));
      // rasgo nas costas com costelas
      p.F(M.flesh[3]); p.poly(W(sk,[[-9.6,-27],[-6.4,-29],[-4.4,-25],[-5,-19.6],[-7.6,-18],[-9.4,-21]]));
      p.F(M.flesh[2]); p.poly(W(sk,[[-9,-26],[-6.6,-27.4],[-5.2,-24.4],[-5.6,-20.6],[-7.4,-19.4],[-8.8,-21.6]]));
      p.F(form==='plenilunar'?M.bone[0]:M.bone[1]); [[-24.4],[-21.8]].forEach(([v])=>p.poly(W(sk,[[-9,v],[-5.4,v-0.8],[-5.4,v],[-9,v+0.8]])));
      p.F(M.blood[1]); p.poly(W(sk,[[-7.2,-18.6],[-6.2,-18.8],[-6.4,-13.4],[-7,-13.2]]));
      // confete grudado no sangue do peito
      p.F(M.blood[1]); [[8,-18,1.6,1.2],[9,-15,1,0.9],[3,-10,1.2,1]].forEach(([uu,vv,a,b])=>{ const q=Wp(sk,uu,vv); p.ell(q.x,q.y,a,b); });
      p.F(M.conf[1]); { const q=Wp(sk,8.4,-17.4); p.rect(q.x-0.5,q.y-0.5,1,1); } p.F(M.conf[0]); { const q=Wp(sk,3,-10); p.rect(q.x-0.5,q.y-0.5,1,1); }
      if(form==='plenilunar'){ p.F(M.blood[1]); p.poly(W(sk,[[3,-16],[10,-18],[11,-6],[6,-4],[3,-8]])); p.F(M.bone[0]); [[-14],[-11]].forEach(([v])=>p.poly(W(sk,[[4,v],[9.6,v-1],[9.6,v],[4,v+1]]))); }
      if(form!=='comum'){ p.F(M.glow[1]); p.poly(W(sk,[[-9,-26],[-11,-31],[-10.4,-31.4],[-8.6,-26.4]])); p.poly(W(sk,[[-5,-19],[-2,-14],[-2.6,-13.4],[-5.4,-18.4]])); }
    });
    // gola bordada em V
    p.F(M.embr[1]); p.poly(W(sk,[[-1,-40.6],[2.4,-40.8],[5.2,-34],[7.6,-40.2],[9.2,-38.6],[5.6,-31],[4.6,-31]]));
    p.F(M.embr[2]); p.poly(W(sk,[[-1,-40.6],[0.6,-40.6],[4.4,-32.6],[4.6,-31]]));
    p.F(M.skin[2]); p.poly(W(sk,[[2.4,-40.4],[7.4,-40],[5.2,-34.2]])); p.F(M.skin[3]); p.poly(W(sk,[[3.4,-40.2],[5,-40],[4.8,-36.6]]));
    p.F(M.embr[0]); [[6.4,-37],[7.8,-38.8],[3.6,-37.4]].forEach(([uu,vv])=>{ const q=Wp(sk,uu,vv); p.rect(q.x-0.5,q.y-0.5,1,1); });
    // faixa azul na cintura (nó na frente, pontas soltas atrás)
    p.F(M.sash[1]); p.poly(W(sk,[[-9.4,-1],[-9.2,-7],[10.2,-7.6],[10.4,-0.6]]));
    p.F(M.sash[2]); p.poly(W(sk,[[-9.4,-1],[-9.2,-7],[-3.6,-7.2],[-3.4,-0.8]])); p.poly(W(sk,[[-3.4,-3],[10.4,-3.2],[10.4,-0.6],[-3.4,-0.8]]));
    p.F(M.sash[0]); p.poly(W(sk,[[0,-6.8],[9.6,-7.2],[9.6,-6],[0,-5.8]]));
    p.F(M.sash[3]); p.poly(W(sk,[[-9.4,-1.4],[-3.4,-1.2],[-3.4,-0.8],[-9.4,-1]]));
    const sw=Math.sin(P.hx*0.8+P.lean*0.1)*1.4;
    p.F(M.sash[1]); p.poly(W(sk,[[-8.6,-5],[-11+sw,4],[-14+sw,10.4],[-11.6+sw,10.8],[-8,1],[-6.6,-4]]));
    p.F(M.sash[2]); p.poly(W(sk,[[-7.6,-4.6],[-8+sw,6],[-9+sw,12],[-6.8+sw,12],[-5.6,-3.6]]));
    p.F(M.sash[3]); p.poly(W(sk,[[-14+sw,10.4],[-11.6+sw,10.8],[-12.6+sw,12]]));
    p.F(M.embr[1]); p.poly(W(sk,[[-14.2+sw,10],[-11.4+sw,10.4],[-11.6+sw,11],[-14.2+sw,10.6]]));
    p.F(M.sash[1]); p.circle(Wp(sk,-7,-4),2.2); p.F(M.sash[0]); { const q=Wp(sk,-7.4,-5); p.rect(q.x-0.5,q.y-0.5,1.2,0.8); }
  }
  // serpentina enrolada no pescoço (papel colorido) + tripa
  function drawSerp(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    const sw=Math.sin(P.hx*0.7+P.lean*0.08)*0.9;
    p.F(M.uY[1]); p.poly(W(sk,[[-2,-39.6],[7,-39.6],[7.6,-37.6],[-1.6,-37.6]])); p.F(M.uY[0]); p.poly(W(sk,[[1,-39.6],[5,-39.6],[5,-39],[1,-39]]));
    p.F(M.uB[1]); for(let k=0;k<4;k++) p.poly(W(sk,[[-1+k*2.4,-39.8],[0.2+k*2.4,-39.8],[-0.4+k*2.4,-37.4],[-1.6+k*2.4,-37.4]]));
    // fita caindo em zigue-zague no peito
    p.F(M.uY[1]); p.poly(W(sk,[[6.6,-38],[8,-37.6],[10+sw,-33],[8.4+sw,-30],[10.4+sw,-26],[9.2+sw,-25.4],[7+sw,-30],[8.4+sw,-33]]));
    p.F(M.uY[2]); p.poly(W(sk,[[8.4+sw,-30],[10.4+sw,-26],[9.8+sw,-25.8],[7.8+sw,-29.6]]));
    // tripa (serpentina de carne) pendurada do outro lado
    p.F(M.flesh[1]); p.poly(W(sk,[[-1.6,-38],[0,-37.6],[-0.6,-33],[0.6,-30],[-1.2,-27],[-2.4,-27.4],[-1.4,-30],[-2.6,-33]]));
    p.F(M.flesh[2]); p.poly(W(sk,[[-1.4,-30],[-1.2,-27],[-2.4,-27.4]])); p.F(M.flesh[0]); { const q=Wp(sk,-1,-34); p.rect(q.x-0.4,q.y-0.6,0.8,1.2); }
    p.F(M.blood[1]); { const q=Wp(sk,-1.8,-26.4); p.ell(q.x,q.y,0.8,1.2); }
  }

  /* ---------- cabeça: pequena, cabelo cacheado com confete, olhos de lua, chapéu tombado ---------- */
  function drawHead(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.xf(sk.ha,sk.neck.x,sk.neck.y); c.scale(HS,HS);
    // pescoço magro
    p.F(M.skin[1]); p.poly([[-3.6,4],[4.2,4],[4.8,-4],[-3.2,-6]]);
    p.F(M.skin[2]); p.poly([[-3.6,4],[-0.4,4],[-1,-5.4],[-3.2,-6]]);
    p.F(M.vein[1]); p.rect(2,-3,0.8,5);
    // cabelo cacheado atrás (volume) — tufos redondos
    p.F(M.hair[1]); [[-6.4,-16,4.4],[-7.6,-11.4,3.6],[-3,-19.6,4.2],[2.4,-20.8,4],[6.8,-19,3.4],[-5.4,-7.6,2.8]].forEach(([x,y,r])=>p.circle(P2(x,y),r));
    p.F(M.hair[2]); [[-8.2,-12,2.2],[-7.4,-17.4,2],[-4.6,-8,1.8]].forEach(([x,y,r])=>p.circle(P2(x,y),r));
    // crânio pequeno
    p.F(M.skin[1]); p.ell(2.4,-12.2,8.4,8.6);
    p.poly([[-3.2,-6],[10.4,-7.4],[11.6,-4.4],[6,-2.6],[-2,-3]]);
    p.F(M.skin[2]); p.poly([[-6,-14],[-4.4,-6],[0,-2.6],[5.6,-2.6],[2,-5],[-1.6,-9],[-2.6,-14],[-4.6,-17]]);
    p.F(M.skin[3]); p.poly([[-6,-13],[-5.4,-8.6],[-3.8,-5.4],[-4.4,-10.6]]);
    p.F(M.skin[0]); p.poly([[4.6,-8],[9,-8.6],[8.2,-7.2],[5,-7]]); p.poly([[5,-17.6],[8.6,-16],[9.6,-13.4],[7.4,-15]]);
    // franja cacheada por cima da testa
    p.F(M.hair[1]); [[-1,-18.4,3.2],[3.4,-19.4,3],[7.2,-17.6,2.4],[-4,-15.6,3]].forEach(([x,y,r])=>p.circle(P2(x,y),r));
    p.F(M.hair[0]); [[3.4,-21,1],[-1,-20.4,1],[6.6,-19,0.8]].forEach(([x,y,r])=>p.circle(P2(x,y),r));
    // confete no cabelo
    p.F(M.conf[0]); p.rect(-6,-18,1.2,1); p.F(M.conf[1]); p.rect(1,-21.6,1.1,1); p.F(M.conf[2]); p.rect(-8.6,-12,1,1.1); p.F(M.conf[3]); p.rect(5.4,-20.6,1,1);
    // orelha
    p.F(M.skin[1]); p.ell(-2.2,-10.8,2,2.8); p.F(M.skin[3]); p.ell(-2,-10.6,0.9,1.6); p.F(M.flesh[2]); p.rect(-3.2,-8.6,1,1.2);
    // sobrancelha e OLHO DE LUA grande (lê a 130 px)
    p.F(M.hair[1]); p.poly([[4,-13.6],[8,-14.6],[11.4,-13.4],[11.2,-12.6],[8,-13.6],[4.2,-12.8]]);
    p.F(M.skin[3]); p.ell(8,-10.4,3,2.4);
    p.F(M.eye[2]); p.ell(8.4,-10.2,2.4,1.8); p.F(M.eye[1]); p.ell(8.6,-10.4,1.9,1.4); p.F(M.eye[0]); p.rect(8.2,-11,1.2,0.9);
    p.F(M.mouth[2]); p.rect(9.2,-10.2,0.8,0.8);
    p.F(M.skin[3]); p.ell(11.8,-10.2,0.9,1.3); p.F(M.eye[1]); p.rect(11.5,-10.6,0.9,0.9);
    // nariz
    p.F(M.skin[1]); p.poly([[10.6,-10.6],[13.6,-7],[12.8,-6],[10.8,-6.4]]);
    p.F(M.skin[3]); p.rect(12,-6.4,1.2,0.8); p.F(M.skin[0]); p.rect(11.2,-9.4,0.8,1.4);
    // boca de cima: dentes
    p.F(M.mouth[1]); p.poly([[5,-5],[12.6,-5.2],[12.4,-2.4],[5,-2.2]]);
    p.F(M.teeth[1]); [[6.4,-5.2,1.2,1.7],[8,-5.2,1.2,1.4],[9.6,-5.2,1.2,1.8],[11.2,-5.2,1,1.3]].forEach(([x,y,w,h])=>p.rect(x,y,w,h));
    // podridão e confete preso na ferida da bochecha
    p.F(M.rot[1]); p.ell(1.6,-8,1.8,1.4); p.F(M.flesh[2]); p.ell(1.8,-7.8,1,0.8); p.F(M.conf[3]); p.rect(1.2,-8.8,0.9,0.9);
    if(form!=='comum'){ p.F(M.glow[0]); p.rect(7.8,-11,1.8,1.2); p.F(M.glow[1]); p.rect(11.5,-10.6,0.9,0.9); }
    p.id();
    if(P.hat>=0.5){ const o=sk.H(1.6,-18.6); hatAt(c,p,M,form,o.x,o.y,sk.ha+rad(P.ht),HS); }
  }
  function drawJaw(c,u,M,sk,P){
    const p=mkPen(c,u); const h=sk.H(2.6,-3.6); p.xf(sk.ha+rad(P.jaw),h.x,h.y); c.scale(HS,HS);
    p.F(M.skin[1]); p.poly([[-2,-1.4],[10.2,-0.8],[11,1.6],[10,4.6],[6,6],[0.6,5.4],[-2.4,2.6]]);
    p.F(M.skin[2]); p.poly([[-2.4,2.6],[0.6,5.4],[6,6],[10,4.6],[8.6,4],[4,4.4],[0,3.2]]);
    p.F(M.skin[3]); p.poly([[1,5.4],[6,6],[9,5.4],[4,5.4]]);
    p.F(M.mouth[1]); p.poly([[2.6,-0.8],[9.6,-0.4],[9.6,1.4],[3,1.2]]);
    p.F(M.teeth[1]); [[4,-1,1.2,1.5],[5.6,-1,1.2,1.9],[7.2,-1,1.2,1.5],[8.6,-1,1,1.8]].forEach(([x,y,w,h])=>p.rect(x,y,w,h));
    p.F(M.skin[0]); p.rect(5.4,1.8,3.2,0.8);
    const L=2+(P.drool%4)*1.2+(P.jaw>30?2:0);
    p.F(M.blood[1]); p.poly([[9.2,4.4],[10.6,3.8],[10.4,3.8+L],[9.8,4.8+L]]); p.ell(10.1,4.8+L,1,1);
    p.id();
  }
  function drawMouthIn(c,u,M,sk,P){
    if(P.jaw<16) return; const p=mkPen(c,u); p.id();
    const a=sk.H(5,-2.4), b=sk.H(12.4,-2.6), h=sk.H(2.6,-3.6), ja=sk.ha+rad(P.jaw), jc=Math.cos(ja), js=Math.sin(ja);
    const J=(x,y)=>({x:h.x+(x*jc-y*js)*HS,y:h.y+(x*js+y*jc)*HS}), d=J(10,0.6), e=J(3,0.6);
    p.F(M.mouth[2]); p.poly([[a.x,a.y],[b.x,b.y],[d.x,d.y],[e.x,e.y]]);
    p.F(M.mouth[3]); const m=lerp(lerp(a,b,0.3),lerp(e,d,0.3),0.5); p.circle(m,1.5);
  }

  /* ---------- sombrinha na mão (parte própria) + rastros ---------- */
  function drawUmbHeld(c,u,M,sk,P,form){ const p=mkPen(c,u); p._c=c; p.id(); umbAt(c,p,M,form,P,sk.grip.x,sk.grip.y,sk.ua); drawFist(p,M,sk.elB,sk.wrB); }
  function umbTip(sk,P){ const o=Math.max(0,Math.min(1,P.uo)), ay=-17+(1-o)*8-(7.5+(1-o)*15); const a=sk.ua; return {x:sk.grip.x-Math.sin(a)*ay, y:sk.grip.y+Math.cos(a)*ay}; }
  function drawSmear(c,u,M,sk,P){
    const p=mkPen(c,u); p.id();
    const sh=sk.shB, w=umbTip(sk,P), r=Math.hypot(w.x-sh.x,w.y-sh.y)+8, a1=Math.atan2(w.y-sh.y,w.x-sh.x);
    const n=12, pts=[]; for(let i=0;i<=n;i++){ const a=a1-1.6+1.6*i/n; pts.push([sh.x+Math.cos(a)*r,sh.y+Math.sin(a)*r]); }
    for(let i=n;i>=0;i--){ const a=a1-1.6+1.6*i/n, rr=r-3-14*(i/n); pts.push([sh.x+Math.cos(a)*rr,sh.y+Math.sin(a)*rr]); }
    const cl=pts.map(([x,y])=>[Math.max(1,Math.min(FW-2,x)),Math.max(1,Math.min(GROUND,y))]);
    p.F(M.swish[0]); p.poly(cl);
    // listras coloridas no rastro (os gomos borrados)
    const band=(k0,k1,col)=>{ const q=[]; for(let i=0;i<=n;i++){ const a=a1-1.6+1.6*i/n, rr=r-3-14*(i/n)*k0; q.push([sh.x+Math.cos(a)*rr,sh.y+Math.sin(a)*rr]); } for(let i=n;i>=0;i--){ const a=a1-1.6+1.6*i/n, rr=r-3-14*(i/n)*k1; q.push([sh.x+Math.cos(a)*rr,sh.y+Math.sin(a)*rr]); } p.F(col); p.poly(q.map(([x,y])=>[Math.max(1,Math.min(FW-2,x)),Math.max(1,Math.min(GROUND,y))])); };
    band(0.25,0.45,M.uR[1]); band(0.55,0.72,M.uY[1]);
    p.F(M.swish[2]); const q=cl.slice(n-3,n+1); for(let k=0;k<q.length-1;k++) p.cap({x:q[k][0],y:q[k][1]},{x:q[k+1][0],y:q[k+1][1]},0.9,0.9);
  }
  function drawSpin(c,u,M,sk,P){
    // linhas de giro em volta do disco
    const p=mkPen(c,u); p.xf(sk.ua,sk.grip.x,sk.grip.y);
    const ry=-17, R=UR+3.4, ut=P.ut, ph=P.us*0.8;
    for(let k=0;k<3;k++){ const a0=ph+k*2.1, pts=[]; for(let i=0;i<=8;i++){ const a=a0+i*0.12; pts.push([Math.cos(a)*R,ry+Math.sin(a)*R*ut]); }
      for(let i=8;i>=0;i--){ const a=a0+i*0.12, rr=R-1.6*(i/8); pts.push([Math.cos(a)*rr,ry+Math.sin(a)*rr*ut-0.8]); }
      p.F(k%2?M.swish[1]:M.swish[0]); p.poly(pts); }
    p.id();
  }
  function drawLooseUmb(c,u,M,sk,P,form){
    const p=mkPen(c,u); const Q=Object.assign({},P,{uo:0.75,us:P.udr/40,ut:0.34});
    umbAt(c,p,M,form,Q,AX+P.udx,GROUND-4-P.udy,rad(P.udr));
  }

  /* ---------- montagem ---------- */
  const cache=PIX.cache();
  function frame(form,anim,fi,step=5,Pov,pk){
    const K=PIX.getK(), key=(pk!=null?'#'+pk+'|'+form:form+'|'+anim+'|'+fi+'|'+step)+'@'+K;
    const hit=cache.get(key); if(hit){ cache.delete(key); cache.set(key,hit); return hit; }
    const P=Pov?Object.assign({},REST,Pov):poseOf(anim,fi), M=mats(form), sk=skeleton(P);
    const umb=P.ul<0.5;
    const parts=[];
    if(umb && P.ub>=0.5) parts.push({back:true, draw:(c,u)=>drawUmbHeld(c,u,M,sk,P,form)});
    parts.push(
      {back:true, draw:(c,u)=>drawArm(c,u,M,sk,P,false,form)},
      {back:true, draw:(c,u)=>drawLeg(c,u,M,sk,P,false)},
      {draw:(c,u)=>drawLeg(c,u,M,sk,P,true)},
      {draw:(c,u)=>drawTorso(c,u,M,sk,P,form)});
    if(P.lsmear>=0.5) parts.push({noShade:true, smear:true, noRim:true, draw:(c,u)=>drawLegSmear(c,u,M,sk,P)});
    parts.push({draw:(c,u)=>{ drawHead(c,u,M,sk,P,form); drawMouthIn(c,u,M,sk,P); }}, {draw:(c,u)=>drawJaw(c,u,M,sk,P)}, {draw:(c,u)=>drawSerp(c,u,M,sk,P,form)});
    if(P.smear>=0.5) parts.push({noShade:true, smear:true, noRim:true, draw:(c,u)=>drawSmear(c,u,M,sk,P)});
    parts.push({draw:(c,u)=>drawArm(c,u,M,sk,P,true,form)});
    if(umb && P.ub<0.5) parts.push({draw:(c,u)=>drawUmbHeld(c,u,M,sk,P,form)});
    if(umb && P.spin>=0.5) parts.push({noShade:true, smear:true, noRim:true, draw:(c,u)=>drawSpin(c,u,M,sk,P)});
    if(!umb) parts.push({draw:(c,u)=>drawLooseUmb(c,u,M,sk,P,form)});
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM[form]}); if(step>=4) heavyOutline(cv);
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._eye=sc(sk.H(8.6,-10.4)); cv._mouth=sc(sk.H(10,-2)); cv._hand=sc(sk.wrF); cv._head=sc(sk.H(3,-13)); cv._handB=sc(sk.wrB); cv._umb=sc(umbTip(sk,P));
    cache.set(key,cv); if(cache.size>900) cache.delete(cache.keys().next().value);
    return cv;
  }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame,framePose:function(form,anim,P,key){ return frame(form,anim,0,5,P,key); }};
})();
