/* BUGIO — fonte de arte (editável). Build: npm run art
   Bugio Zumbi (Amazônia, comum animal): guariba-vermelho (Alouatta seniculus) levantado pela Lua de Sangue.
   Anatomia das refs (referencias/zumbis-amazonia/bugio/): corpo atarracado de pelagem ruiva longa e desgrenhada
   (mais clara/dourada no dorso e nos ombros), braços compridos de primata, pernas curtas e fortes, mãos e pés
   pretos de agarrar (dedão opositor), cauda preênsil muito longa com a ponta nua por baixo, cabeça baixa à frente
   dos ombros com o rosto preto quase sem pelo, focinho saliente, testa estreita, mandíbula enorme e a barba/papo
   do osso hioide (caixa de ressonância do urro). Anda de quatro (apoia as palmas) ou semi-ereto; levanta o tronco
   pra urrar. Corrupção da Lua: olho de lua, papo roído com a pele rasgando e o hioide aparecendo como uma caixa de
   osso pulsando, falhas na pelagem com pele cinza-esverdeada e costelas, veias roxas, musgo/fungo no ombro e na barba.
   Esqueleto próprio de primata: coluna curva (lean 0 = em pé, 60–90 = de quatro), 2 braços longos (ombro/cotovelo),
   2 pernas (quadril/joelho) + pés preênseis, cabeça com mandíbula articulada (jaw), papo inflável (sac) e cauda
   preênsil em 11 segmentos (tA = base, tC = curvatura, tW/tP = onda, tK = enrolar a ponta). Os nomes das juntas
   seguem o molde dos zumbis (lean, hunch, head, jaw, aFs/aFe, aBs/aBe, lFh/lFk, lBh/lBk) pra ZREACT funcionar.
   Desenhado em unidades de desenho × S (escala do rig) sobre PIX.getK(): FW/FH/GROUND/AX ficam crus.
   Golpes: urro do bando (howl, callAt), salto de galho (leap, air/land/drop), fruto podre (throw, toss + adereço
   xFruit), arranhão duplo (claw, hit [2,4]); pendurado pela cauda no galho (hang) e ABERTO depois de errar o salto (open). */
const BUGIO=(function(){
  const {rad,lerp,P2,mkPen,compose}=PIX;
  const FW=240, FH=220, GROUND=204, AX=128;
  const S=1.3; // escala do rig: unidades de desenho -> unidades cruas
  const DG=GROUND/S, DAX=AX/S;
  const RIM={comum:'#d8e4f4', enluarado:'#9ff6ff', plenilunar:'#ffb46a'};

  /* ---------- materiais ---------- */
  function mats(form){
    const m={
      fur:['#de8040','#9a3b1e','#5e2412','#34130c'],
      gold:['#ffc98a','#e89850','#b8622c','#713619'],
      face:['#8e7e74','#4c403a','#2c2220','#140e0c'],
      rot:['#bcc8ac','#8e9e86','#5a685c','#343c3c'],
      flesh:['#f2a48e','#ba525c','#7a2c40','#46182c'],
      bone:['#fff6e0','#d8d0b8','#a09478','#5e5444'],
      hyoid:['#fff6e0','#d8d0b8','#a09478','#5e5444'],
      vein:['#c6a6e6','#8a5ab8','#5a3a8a','#2e1e50'],
      fungus:['#efffb8','#a6f03a','#5aa82a','#2e6a1e'],
      eye:['#fff6c8','#ffc24a','#e07a1a','#7a3810'],
      mouth:['#8a2a3a','#561424','#300a16','#1a0610'],
      teeth:['#fff2b8','#e0c070','#a08a48','#5e4e2c'],
      blood:['#c84a3e','#8e2a2c','#5e1824','#3a0e1a'],
      nail:['#a8988a','#665850','#3a302c','#1e1814'],
      fruit:['#d8b070','#9a6a34','#5e3a1c','#2e1a0c'],
      pulp:['#fff4d8','#f0dcae','#c4a46e','#7a6040'],
      mold:['#e6f4a8','#a8c84a','#6a8a2e','#3a4a1c'],
      wood:['#ccbc9a','#8e7a5a','#5a4a36','#30261c'],
      leaf:['#acdc74','#5e9a3a','#33622a','#1a3a1e'],
      dirt:['#caa97a','#95754f','#674d35','#3d2b1f'],
      glow:['#fffbe0','#ffd88a','#e8a050','#a0602a'],
      swish:['#fdfdff','#e6f0ff','#b4c4e8','#7484b0'],
      wave:['#fff8e8','#ffe0b0','#f0b070','#b06a38'],
    };
    if(form==='enluarado'){
      m.fur=['#a77ab6','#62406f','#3c2652','#1f1333']; m.gold=['#d2bcf0','#9480c4','#5e4e92','#30285c'];
      m.face=['#7a74a0','#3e3a5a','#24203a','#100c1e']; m.rot=['#c8c0ec','#9488c4','#5e5492','#33305e'];
      m.flesh=['#f0b0ff','#b866d8','#7a3a9e','#46206a']; m.blood=['#b46ad8','#7e3ea6','#542474','#34144a'];
      m.vein=['#c8fbff','#4ad8f0','#2a8ab0','#1a4a7a']; m.fungus=['#effffe','#7af4ff','#2ab0d8','#146a96'];
      m.eye=['#ffffff','#b8fbff','#4ad8f0','#1a8aa8']; m.glow=['#effffe','#7af4ff','#2ab0d8','#146a96'];
      m.wave=['#f4ffff','#b8f8ff','#5ad8f0','#2a8ab8']; m.swish=['#ffffff','#c8fbff','#6ae4f4','#2a9ab8'];
      m.mold=['#e0fcff','#7ad8f0','#3a8ab8','#1e4a7a']; m.hyoid=['#eef0ff','#b8bce8','#7c80b4','#464a78'];
      m.fruit=['#b8a6d8','#76649e','#4a3c70','#261c44']; m.pulp=['#f0f4ff','#c8d4f0','#8a98c4','#525e88'];
      m.dirt=['#a8a0c8','#76709a','#4e4a70','#2e2a48']; m.leaf=['#9ad8c8','#4a8a8a','#2a5a66','#163444'];
    }
    if(form==='plenilunar'){
      m.fur=['#ff7a52','#bc2028','#701024','#3c0716']; m.gold=['#ffbe78','#f06a3a','#ae3428','#62161e'];
      m.face=['#946060','#4e2a2c','#2e1416','#140608']; m.rot=['#e8b4a0','#b8786a','#7a4448','#44222c'];
      m.flesh=['#ffc07a','#f06a3a','#a8302e','#5e1422']; m.blood=['#ff7a3a','#d43a26','#8a1c22','#4e0c18'];
      m.vein=['#fff0a0','#ffb43a','#e0581e','#8a2414']; m.fungus=['#fff6c0','#ffb43a','#e0581e','#8a2414'];
      m.eye=['#fffbe0','#ffe04a','#ff8a2a','#b83a14']; m.glow=['#fff6c0','#ffb43a','#e0581e','#8a2414'];
      m.hyoid=['#fff8d0','#ffd070','#f08a30','#a0401a']; m.wave=['#fffbe6','#ffe6a8','#ffb460','#d0602a'];
      m.swish=['#fffbe6','#ffe6a8','#ffb460','#d0602a']; m.mold=['#fff0a0','#ffb43a','#e0581e','#8a2414'];
      m.fruit=['#e8905a','#a8482e','#6a2420','#381012']; m.pulp=['#fff0c8','#ffd08a','#e08a4a','#8a4424'];
      m.dirt=['#b4705a','#844a3e','#5a2e2e','#36181e'];
    }
    return punch(m);
  }
  const NAMES={fur:'Pelagem ruiva',gold:'Pelo dourado do dorso',face:'Rosto/mãos/pés (pele preta)',rot:'Pele podre',flesh:'Carne',bone:'Osso',hyoid:'Hioide (caixa do urro)',vein:'Veias',fungus:'Fungo/musgo lunar',eye:'Olho',mouth:'Boca',teeth:'Dentes',blood:'Sangue',nail:'Unhas',fruit:'Fruto podre (casca)',pulp:'Polpa',mold:'Mofo',wood:'Galho',leaf:'Folha',dirt:'Terra',glow:'Brilho',swish:'Rastro do golpe',wave:'Onda do urro'};
  function sat(h,k){ const [r,g,b]=PIX.hexRgb(h), y=(r+g+b)/3; return PIX.toHex(y+(r-y)*k,y+(g-y)*k,y+(b-y)*k); }
  const NOPUNCH={swish:1,glow:1,wave:1,fungus:1};
  function punch(m){ const o={}; for(const k in m){ const r=m[k]; o[k]=NOPUNCH[k]?[r[0],r[1],r[2],r[3]]:[sat(r[0],1.1),sat(r[1],1.14),PIX.mix(sat(r[2],1.1),'#2a1a4c',0.18),PIX.mix(r[3],'#140a24',0.3)]; } return o; }

  /* ---------- poses ---------- */
  // ângulos de membro: 0 = pendurado, + = pra frente (mesmo molde dos zumbis). lean: 0 = tronco em pé, 90 = deitado pra frente.
  // sac = papo inflado (0..1); wave = ondas do urro (0 = nada); smear = rastro do arranhão (1 = braço da frente, 2 = de trás);
  // fruit = fruto na mão da frente; dust = poeira do pouso; branch = galho preso na ponta da cauda (pendurado).
  const REST={hx:0,lift:0,rot:0,lean:48,hunch:10,head:-8,jaw:4,sac:0.15,aFs:14,aFe:2,aBs:2,aBe:-8,lFh:78,lFk:2,lBh:64,lBk:-8,fF:0,fB:0,
    tA:-66,tC:-9,tW:5,tP:0,tK:34,fur:0,flash:0,smear:0,wave:0,fruit:0,dust:0,branch:0,drool:0,blink:0};
  const S_=Math.sin, C_=Math.cos, PI=Math.PI, mx=Math.max;
  const ANIMS={
    idle:{nome:'Parado (semi-ereto, nós das mãos no chão, cauda enrolando)',n:8,dur:()=>150,pose:i=>{ const p=i/8*PI*2, s=S_(p);
      return {lean:48+2.5*s, hunch:10+1.5*S_(p+0.8), head:-8+4*S_(p-0.9), jaw:4+3*mx(0,S_(p+1.4)), sac:0.15+0.08*mx(0,s), hx:0.6*s, lift:0.5*mx(0,s),
        aFs:14+2*s, aFe:2+3*S_(p+0.5), aBs:2-2*s, aBe:-8+2*s, lFh:78+2*s, lFk:2+1.5*s, lBh:64-2*s, lBk:-8,
        tA:-66+6*S_(p), tC:-9+2.5*S_(p+1), tW:5, tP:p, tK:34+10*S_(p+2), fur:i%4, drool:i%4, blink:i===5?1:0}; }},
    walk:{nome:'Andar de quatro (apoia as palmas)',n:8,dur:()=>120,pose:i=>{ const p=i/8*PI*2;
      const aF=10+24*S_(p), aB=10+24*S_(p+PI), lF=44+22*S_(p+PI), lB=44+22*S_(p);
      return {lean:70+3*S_(2*p), hunch:4+2*S_(2*p+0.6), head:-24+3*S_(2*p-1), jaw:6+3*S_(2*p-1.6), hx:1.2*S_(p), lift:1.6*mx(0,S_(2*p)),
        aFs:aF, aFe:aF-12-26*mx(0,C_(p)), aBs:aB, aBe:aB-12-26*mx(0,C_(p+PI)),
        lFh:lF, lFk:lF-62-18*mx(0,C_(p+PI)), lBh:lB, lBk:lB-62-18*mx(0,C_(p)), fF:-10*mx(0,C_(p+PI)), fB:-10*mx(0,C_(p)),
        tA:-78+5*S_(p), tC:-5, tW:9, tP:p*1.0+1, tK:40, fur:i%4, drool:i%4, sac:0.15}; }},
    alert:{nome:'Alerta (levanta o tronco, olhos fixos)',n:7,dur:i=>[150,130,130,170,220,200,170][i],pose:i=>[
      {},
      {lean:34,hunch:8,head:-4,aFs:30,aFe:20,lFh:62,lFk:-6,jaw:8},
      {lean:14,hunch:6,head:4,aFs:20,aFe:40,aBs:10,aBe:30,lFh:34,lFk:-10,lBh:26,lBk:-18,jaw:12,sac:0.3,tA:-50,tC:-14},
      {lean:4,hunch:2,head:8,aFs:16,aFe:46,aBs:4,aBe:36,lFh:26,lFk:-8,lBh:18,lBk:-16,jaw:20,sac:0.45,tA:-40,tC:-16,tK:50},
      {lean:2,hunch:0,head:10,aFs:14,aFe:48,aBs:2,aBe:38,lFh:24,lFk:-8,lBh:16,lBk:-16,jaw:10,sac:0.4,tA:-38,tC:-16,tK:56,fur:1},
      {lean:16,hunch:6,head:0,aFs:22,aFe:30,lFh:40,lFk:-8,lBh:36,lBk:-16,jaw:14,sac:0.3,fur:2},
      {lean:40,hunch:9,head:-6,jaw:8}][i]},
    // ---- urro do bando: inspira e infla o papo (0–5 = aviso), urra (6–10, onda), recupera ----
    howl:{nome:'Urro do bando (infla o papo e chama o bando)',n:12,callAt:6,warnTo:5,dur:i=>[140,130,130,130,130,140,110,110,110,110,120,150][i],pose:i=>[
      {lean:40,hunch:8,head:-4,jaw:6,sac:0.25,aFs:20,aFe:16},
      {lean:24,hunch:4,head:6,jaw:2,sac:0.4,aFs:24,aFe:40,aBs:12,aBe:34,lFh:50,lFk:-8,lBh:40,lBk:-16,tA:-50,tC:-12},
      {lean:12,hunch:-2,head:14,jaw:0,sac:0.6,aFs:30,aFe:62,aBs:18,aBe:50,lFh:34,lFk:-10,lBh:28,lBk:-18,tA:-44,tC:-14,fur:1},
      {lean:6,hunch:-6,head:20,jaw:0,sac:0.78,aFs:40,aFe:76,aBs:26,aBe:62,lFh:28,lFk:-10,lBh:22,lBk:-18,tA:-40,tC:-15,fur:2},
      {lean:2,hunch:-8,head:24,jaw:2,sac:0.92,aFs:46,aFe:84,aBs:30,aBe:70,lFh:26,lFk:-10,lBh:20,lBk:-18,tA:-38,tC:-16,fur:3},
      {lean:0,hunch:-10,head:26,jaw:4,sac:1,aFs:48,aFe:88,aBs:32,aBe:72,lFh:24,lFk:-10,lBh:18,lBk:-18,tA:-36,tC:-16,tK:60},
      {lean:22,hunch:14,head:-26,jaw:58,sac:1,aFs:-4,aFe:30,aBs:-14,aBe:16,lFh:40,lFk:-10,lBh:30,lBk:-20,tA:-30,tC:-18,tK:60,wave:1,hx:3,flash:0},
      {lean:24,hunch:16,head:-28,jaw:62,sac:0.96,aFs:-8,aFe:26,aBs:-18,aBe:12,lFh:42,lFk:-10,lBh:30,lBk:-20,tA:-28,tC:-18,tK:62,wave:2,hx:3,fur:1},
      {lean:22,hunch:15,head:-26,jaw:60,sac:1,aFs:-6,aFe:28,aBs:-16,aBe:14,lFh:40,lFk:-10,lBh:30,lBk:-20,tA:-30,tC:-18,tK:62,wave:3,hx:3,fur:2},
      {lean:24,hunch:16,head:-28,jaw:62,sac:0.96,aFs:-8,aFe:26,aBs:-18,aBe:12,lFh:42,lFk:-10,lBh:30,lBk:-20,tA:-28,tC:-18,tK:62,wave:4,hx:3,fur:3},
      {lean:34,hunch:12,head:-14,jaw:30,sac:0.6,aFs:6,aFe:14,lFh:60,lFk:-4,tA:-50,tC:-12,wave:5,hx:1},
      {lean:44,hunch:10,head:-8,jaw:10,sac:0.25}][i]},
    // ---- salto de galho: agacha (0–2), salta (3), sobe encolhido (4–5), cai de braços abertos (6–7), pouso (8), recupera ----
    leap:{nome:'Salto de galho (sombra no chão, cai em cima)',n:10,air:[3,4,5,6,7],land:8,drop:5,dur:i=>[130,120,110,70,90,90,90,80,170,190][i],pose:i=>[
      {lean:58,hunch:12,head:-14,jaw:10,aFs:2,aFe:-10,lFh:96,lFk:8,lBh:88,lBk:0,tA:-60,tC:-12},
      {lean:66,hunch:16,head:-20,jaw:16,aFs:-10,aFe:-24,aBs:-16,aBe:-30,lFh:104,lFk:14,lBh:98,lBk:6,tA:-56,tC:-14,lift:-2},
      {lean:70,hunch:18,head:-22,jaw:20,aFs:-18,aFe:-34,aBs:-24,aBe:-40,lFh:110,lFk:18,lBh:104,lBk:10,tA:-52,tC:-14,lift:-3},
      {lean:30,hunch:-8,head:-6,jaw:34,aFs:140,aFe:150,aBs:120,aBe:136,lFh:-10,lFk:-20,lBh:-20,lBk:-34,fF:30,fB:30,tA:-30,tC:-4,tW:12,fur:1,dust:1},
      {lean:40,hunch:20,head:-10,jaw:24,aFs:70,aFe:120,aBs:56,aBe:100,lFh:80,lFk:-30,lBh:70,lBk:-40,tA:-60,tC:-18,tK:70,fur:2},
      {lean:50,hunch:24,head:-14,jaw:20,aFs:60,aFe:110,aBs:50,aBe:96,lFh:90,lFk:-20,lBh:80,lBk:-30,tA:-80,tC:-20,tK:80,fur:3},
      {lean:56,hunch:6,head:-24,jaw:44,aFs:110,aFe:96,aBs:94,aBe:80,lFh:30,lFk:-10,lBh:20,lBk:-20,tA:-110,tC:-6,tW:10,tP:1,fur:0},
      {lean:62,hunch:4,head:-26,jaw:54,aFs:96,aFe:70,aBs:84,aBe:56,lFh:36,lFk:-6,lBh:26,lBk:-16,tA:-120,tC:-4,tW:12,tP:2.4,fur:1,smear:1},
      {lean:82,hunch:16,head:-30,jaw:40,aFs:46,aFe:30,aBs:36,aBe:20,lFh:96,lFk:18,lBh:90,lBk:8,tA:-90,tC:-6,lift:-4,dust:2,fur:2},
      {lean:66,hunch:12,head:-18,jaw:22,aFs:26,aFe:10,aBs:16,aBe:0,lFh:84,lFk:8,lBh:74,lBk:-2,tA:-72,tC:-8,dust:3,fur:3}][i]},
    // ---- fruto podre: arranca o fruto do galho (0), arma atrás (1–2), arremessa (3 = rastro), solta (4), acompanha ----
    throw:{nome:'Fruto podre (arremesso em arco)',n:8,toss:4,dur:i=>[120,110,140,60,70,120,130,140][i],pose:i=>[
      {lean:22,hunch:4,head:12,jaw:10,aFs:170,aFe:176,aBs:6,aBe:20,lFh:46,lFk:-8,lBh:36,lBk:-16,fruit:1,tA:-46,tC:-14},
      {lean:16,hunch:2,head:4,jaw:14,aFs:-60,aFe:-110,aBs:30,aBe:60,lFh:40,lFk:-8,lBh:30,lBk:-18,fruit:1,hx:-2,tA:-44,tC:-14},
      {lean:8,hunch:-4,head:0,jaw:22,aFs:-90,aFe:-140,aBs:44,aBe:80,lFh:34,lFk:-10,lBh:24,lBk:-20,fruit:1,hx:-4,tA:-40,tC:-16,fur:1},
      {lean:30,hunch:12,head:-10,jaw:34,aFs:120,aFe:110,aBs:-10,aBe:10,lFh:56,lFk:-6,lBh:30,lBk:-26,fruit:1,hx:4,smear:1,fur:2},
      {lean:42,hunch:16,head:-14,jaw:40,aFs:96,aFe:70,aBs:-24,aBe:-4,lFh:64,lFk:-2,lBh:32,lBk:-28,hx:6,fur:3},
      {lean:48,hunch:14,head:-14,jaw:30,aFs:60,aFe:30,aBs:-10,aBe:-6,lFh:70,lFk:0,lBh:46,lBk:-20,hx:5},
      {lean:48,hunch:12,head:-10,jaw:16,aFs:30,aFe:12,lFh:74,lFk:2,lBh:56,lBk:-12,hx:2},
      {lean:48,hunch:10,head:-8,jaw:8}][i]},
    // ---- arranhão duplo em X: braço atrás (0–1), corte da frente (2), braço de trás arma (3), corte de trás (4), recupera ----
    claw:{nome:'Arranhão duplo (2 cortes em X)',n:7,hit:[2,4],reach:30,dur:i=>[150,110,60,110,60,130,150][i],pose:i=>[
      {lean:30,hunch:6,head:-2,jaw:20,aFs:150,aFe:170,aBs:10,aBe:30,lFh:56,lFk:-6,lBh:44,lBk:-16,hx:-2},
      {lean:20,hunch:2,head:4,jaw:28,aFs:170,aFe:196,aBs:20,aBe:50,lFh:50,lFk:-8,lBh:38,lBk:-18,hx:-3,fur:1},
      {lean:46,hunch:14,head:-12,jaw:40,aFs:60,aFe:20,aBs:60,aBe:110,lFh:66,lFk:-2,lBh:40,lBk:-26,hx:5,smear:1,fur:2},
      {lean:40,hunch:12,head:-8,jaw:30,aFs:30,aFe:-10,aBs:150,aBe:176,lFh:62,lFk:-4,lBh:40,lBk:-24,hx:3,fur:3},
      {lean:52,hunch:16,head:-14,jaw:44,aFs:20,aFe:-14,aBs:56,aBe:16,lFh:70,lFk:0,lBh:42,lBk:-28,hx:7,smear:2},
      {lean:50,hunch:12,head:-10,jaw:24,aFs:24,aFe:4,aBs:30,aBe:6,lFh:74,lFk:2,lBh:54,lBk:-14,hx:4},
      {lean:48,hunch:10,head:-8,jaw:10}][i]},
    // ---- pendurado pela cauda no galho (lá no alto, antes de descer em salto) ----
    hang:{nome:'Pendurado pela cauda (no galho)',n:6,loop:1,dur:()=>170,pose:i=>{ const p=i/6*PI*2, s=S_(p);
      return {rot:180, lean:-14+4*s, hunch:-10, head:-58+6*S_(p+1), jaw:14+10*mx(0,S_(p+0.6)), sac:0.3, hx:0,
        aFs:-170+10*s, aFe:-160+14*S_(p+0.4), aBs:-176-8*s, aBe:-150-10*s, lFh:-120+8*s, lFk:-150+6*s, lBh:-110-6*s, lBk:-140,
        tA:2*s, tC:0.5, tW:1.6, tP:p, tK:120, branch:1, fur:i%4, drool:i%4}; }},
    // ---- ABERTO: errou o salto e caiu esparramado, cauda embolada, sacode a cabeça ----
    open:{nome:'Aberto (errou o salto, esparramado)',n:8,dur:i=>[110,130,120,120,120,120,130,150][i],pose:i=>[
      {lean:92,hunch:0,head:-6,jaw:40,aFs:120,aFe:110,aBs:-60,aBe:-70,lFh:40,lFk:-40,lBh:-20,lBk:-60,tA:-110,tC:10,tW:14,tP:0,lift:0,dust:2},
      {lean:94,hunch:-2,head:4,jaw:30,aFs:100,aFe:96,aBs:-50,aBe:-60,lFh:36,lFk:-46,lBh:-24,lBk:-64,tA:-100,tC:12,tW:14,tP:1.4,dust:3},
      {lean:92,hunch:0,head:-12,jaw:20,aFs:90,aFe:90,aBs:-40,aBe:-50,lFh:40,lFk:-40,lBh:-20,lBk:-60,tA:-96,tC:14,tW:14,tP:2.8,fur:1},
      {lean:90,hunch:2,head:10,jaw:24,aFs:70,aFe:80,aBs:-30,aBe:-40,lFh:44,lFk:-36,lBh:-14,lBk:-56,tA:-100,tC:12,tW:12,tP:4.2,fur:2},
      {lean:90,hunch:2,head:-14,jaw:18,aFs:50,aFe:60,aBs:-20,aBe:-30,lFh:50,lFk:-30,lBh:0,lBk:-50,tA:-96,tC:10,tW:12,tP:5.6,fur:3},
      {lean:84,hunch:6,head:6,jaw:22,aFs:30,aFe:30,aBs:10,aBe:0,lFh:70,lFk:-10,lBh:40,lBk:-40,tA:-90,tC:4,tW:10,tP:7},
      {lean:70,hunch:8,head:-12,jaw:14,aFs:20,aFe:10,aBs:10,aBe:0,lFh:84,lFk:4,lBh:64,lBk:-14,tA:-80,tC:-4},
      {lean:52,hunch:10,head:-8,jaw:8}][i]},
    hurt:{nome:'Dano (cabeça pra trás)',n:4,dur:i=>[80,110,130,150][i],pose:i=>[
      {lean:22,hunch:-6,head:24,jaw:46,aFs:-30,aFe:10,aBs:-40,aBe:-10,hx:-6,flash:1,lFh:60,lFk:-10,tA:-40,tC:-16,sac:0.4},
      {lean:28,hunch:-2,head:16,jaw:40,aFs:-16,aFe:20,aBs:-30,aBe:0,hx:-5,lFh:64,lFk:-8,tA:-46,tC:-14,sac:0.35},
      {lean:38,hunch:6,head:2,jaw:24,aFs:4,aFe:6,aBs:-10,aBe:-10,hx:-2},
      {lean:46,hunch:9,head:-6,jaw:10}][i]},
    hurtB:{nome:'Dano (barriga, encolhe)',n:4,dur:i=>[80,120,140,150][i],pose:i=>[
      {lean:72,hunch:30,head:10,jaw:44,aFs:50,aFe:90,aBs:40,aBe:80,hx:-7,flash:1,lFh:96,lFk:10,lBh:86,lBk:0,tA:-40,tC:-20,tK:80},
      {lean:68,hunch:26,head:6,jaw:40,aFs:44,aFe:84,aBs:36,aBe:74,hx:-6,lFh:92,lFk:8,lBh:82,lBk:-2,tA:-46,tC:-18,tK:70},
      {lean:58,hunch:16,head:-4,jaw:24,aFs:26,aFe:30,aBs:16,aBe:10,hx:-3},
      {lean:50,hunch:11,head:-8,jaw:10,hx:-1}][i]},
    fall:{nome:'Derrubado (de costas)',n:6,dur:i=>[90,90,90,110,140,260][i],pose:i=>[
      {lean:20,hunch:-6,head:24,jaw:50,aFs:-40,aFe:-10,aBs:-50,aBe:-30,hx:-6,flash:1,lFh:50,lFk:-10,tA:-40,tC:-16},
      {rot:-30,lean:20,hunch:0,head:20,jaw:44,aFs:-60,aFe:-40,aBs:-70,aBe:-50,hx:-4,lFh:70,lFk:20,lBh:60,lBk:10,tA:-30,tC:-10},
      {rot:-62,lean:16,hunch:4,head:14,jaw:40,aFs:-90,aFe:-70,aBs:-96,aBe:-80,hx:-6,lFh:90,lFk:40,lBh:80,lBk:30,tA:-20,tC:-6},
      {rot:-90,lean:10,hunch:8,head:16,jaw:46,aFs:-120,aFe:-130,aBs:-104,aBe:-120,hx:2,lFh:100,lFk:50,lBh:86,lBk:40,tA:-10,tC:-4,tW:10,dust:2},
      {rot:-84,lean:10,hunch:10,head:6,jaw:36,aFs:-126,aFe:-150,aBs:-108,aBe:-130,hx:2,lFh:96,lFk:40,lBh:82,lBk:30,tA:-14,tC:-6,tW:8,tP:1.4,dust:3},
      {rot:-90,lean:8,hunch:8,head:10,jaw:40,aFs:-130,aFe:-156,aBs:-112,aBe:-140,hx:2,lFh:100,lFk:46,lBh:86,lBk:36,tA:-10,tC:-4,tW:6,tP:2}][i]},
    getup:{nome:'Levantar (rola e fica de quatro)',n:6,dur:i=>[200,170,160,160,160,150][i],pose:i=>[
      {rot:-90,lean:8,hunch:8,head:10,jaw:40,aFs:-130,aFe:-156,aBs:-112,aBe:-140,hx:2,lFh:100,lFk:46,lBh:86,lBk:36,tA:-10,tC:-4},
      {rot:-50,lean:30,hunch:20,head:-6,jaw:24,aFs:-40,aFe:-10,aBs:-60,aBe:-30,hx:-4,lFh:110,lFk:30,lBh:96,lBk:20,tA:-40,tC:-8},
      {rot:-14,lean:66,hunch:24,head:-18,jaw:20,aFs:0,aFe:-10,aBs:-20,aBe:-24,hx:-4,lFh:110,lFk:20,lBh:100,lBk:10,tA:-60,tC:-10},
      {rot:0,lean:78,hunch:18,head:-24,jaw:18,aFs:14,aFe:0,aBs:4,aBe:-10,hx:-2,lFh:96,lFk:10,lBh:84,lBk:0,tA:-70,tC:-10},
      {lean:62,hunch:14,head:-14,jaw:14,aFs:16,aFe:4,aBs:4,aBe:-8,lFh:86,lFk:6,lBh:70,lBk:-6,fur:1},
      {lean:50,hunch:10,head:-8,jaw:8}][i]},
    death:{nome:'Morte (cai de lado, a cauda ainda agarra)',n:8,dur:i=>[90,150,160,170,150,140,160,600][i],pose:i=>[
      {lean:20,hunch:-6,head:26,jaw:56,aFs:-34,aFe:-6,aBs:-44,aBe:-20,hx:-5,flash:1,lFh:56,lFk:-10,tA:-40,tC:-16,sac:0.6},
      {lean:14,hunch:-10,head:30,jaw:62,aFs:-20,aFe:30,aBs:-30,aBe:10,hx:-6,lFh:40,lFk:-14,lBh:30,lBk:-20,tA:-36,tC:-18,sac:0.9,wave:1},
      {lean:30,hunch:10,head:10,jaw:54,aFs:10,aFe:40,aBs:0,aBe:20,hx:-4,lFh:80,lFk:-10,lBh:70,lBk:-20,tA:-50,tC:-12,sac:0.5},
      {rot:20,lean:50,hunch:24,head:-10,jaw:50,aFs:40,aFe:60,aBs:30,aBe:50,hx:-2,lFh:100,lFk:10,lBh:90,lBk:0,tA:-70,tC:-8,sac:0.3},
      {rot:50,lean:50,hunch:26,head:-14,jaw:50,aFs:70,aFe:90,aBs:56,aBe:76,hx:0,lFh:96,lFk:20,lBh:84,lBk:10,tA:-80,tC:-6,dust:2},
      {rot:80,lean:40,hunch:22,head:-10,jaw:46,aFs:130,aFe:150,aBs:110,aBe:140,hx:4,lFh:80,lFk:30,lBh:70,lBk:20,tA:-96,tC:-2,tK:90,dust:3},
      {rot:88,lean:36,hunch:20,head:-8,jaw:44,aFs:150,aFe:170,aBs:118,aBe:150,hx:6,lFh:70,lFk:30,lBh:60,lBk:20,tA:-100,tC:0,tK:110},
      {rot:90,lean:34,hunch:20,head:-6,jaw:46,aFs:156,aFe:174,aBs:120,aBe:154,hx:6,lFh:66,lFk:28,lBh:56,lBk:18,tA:-100,tC:0,tK:130,drool:3}][i]},
    // adereço: o fruto podre girando no ar (desenhado pelo motor como ator extra; âncora em cv._ax/_gy)
    xFruit:{nome:'Fruto podre voando (adereço)',n:4,prop:true,dur:()=>60,pose:i=>({st:i})},
  };
  const EXK=['hx','lean','hunch','head','aFs','aFe','aBs','aBe','lFh','lFk','lBh','lBk'];
  function exag(P,f){ if(f===1||Math.abs(P.rot)>4) return P; EXK.forEach(k=>{ P[k]=REST[k]+(P[k]-REST[k])*f; }); P.jaw=Math.min(66,mx(0,REST.jaw+(P.jaw-REST.jaw)*f)); return P; }
  const EXF={idle:1.04,walk:1.06,alert:1.06,howl:1.08,leap:1.06,throw:1.1,claw:1.12,open:1.04,hurt:1.24,hurtB:1.2,fall:1.06,getup:1.04,death:1.06};
  ZREACT.add(ANIMS,REST,{}); // tumble (voando) e grabbed (agarrado) no molde comum
  function poseOf(anim,i){ const A=ANIMS[anim]; if(A&&A.prop) return Object.assign({},REST,A.pose(i)); return exag(Object.assign({},REST,A.pose(i)),EXF[anim]||1); }
  function heavyOutline(cv){ const g=cv.getContext('2d'), W=cv.width, H=cv.height, im=PIX.pix(cv), d=im.data;
    const isO=i=>d[i+3]===255&&d[i]===0x17&&d[i+1]===0x0b&&d[i+2]===0x1c, fill=i=>d[i+3]===255&&!isO(i);
    const add=[]; for(let y=2;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(d[i+3]) continue; const u=((y-1)*W+x)*4, u2=((y-2)*W+x)*4; if(isO(u)&&fill(u2)) add.push(i); }
    add.forEach(i=>{ d[i]=0x17; d[i+1]=0x0b; d[i+2]=0x1c; d[i+3]=255; }); g.putImageData(im,0,0); }

  /* ---------- esqueleto de primata ---------- */
  const SPINE=48, TH=23, SH=22, UA=27, FA=25, HS=1.56, TN=11, TL=6.6;
  const lp=(p,a,L)=>({x:p.x+Math.sin(rad(a))*L, y:p.y+Math.cos(rad(a))*L});
  function build(P,dy,fin){
    const R=P.rot, hip={x:DAX+P.hx, y:dy};
    const ra=rad(R), rc=Math.cos(ra), rs=Math.sin(ra);
    const HR=(lx,ly)=>({x:hip.x+lx*rc-ly*rs, y:hip.y+lx*rs+ly*rc});
    const hipF=HR(2.5,0), hipB=HR(-2.5,0);
    const kneeF=lp(hipF,P.lFh-R,TH), ankleF=lp(kneeF,P.lFk-R,SH), kneeB=lp(hipB,P.lBh-R,TH), ankleB=lp(kneeB,P.lBk-R,SH);
    const SS=[]; let x=hip.x, y=hip.y;
    for(let k=0;k<=SPINE;k++){ const t=k/SPINE, a=rad(R+P.lean+P.hunch*Math.pow(t,1.3)); SS.push({x,y,a}); x+=Math.sin(a); y-=Math.cos(a); }
    const SP=(u,v)=>{ if(v>0){ const s=SS[0], a=s.a, px=s.x-Math.sin(a)*v, py=s.y+Math.cos(a)*v; return {x:px+Math.cos(a)*u, y:py+Math.sin(a)*u}; }
      const f=-v, k=Math.min(SPINE,Math.floor(f)), s=SS[k], r=f-k, a=s.a;
      const px=s.x+Math.sin(a)*r, py=s.y-Math.cos(a)*r; return {x:px+Math.cos(a)*u, y:py+Math.sin(a)*u}; };
    const T=SP;
    const sa=SS[SPINE].a;
    const shF=T(3,-42), shB=T(-2,-43);
    const elF=lp(shF,P.aFs-R,UA), wrF=lp(elF,P.aFe-R,FA), elB=lp(shB,P.aBs-R,UA), wrB=lp(elB,P.aBe-R,FA);
    const neck=T(8,-46);
    const ha=rad(R+0.32*(P.lean+P.hunch)+P.head), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:neck.x+(lx*hc-ly*hs)*HS, y:neck.y+(lx*hs+ly*hc)*HS});
    // cauda preênsil: segmentos a partir da base (atrás do quadril)
    const tail=[T(-8,3)];
    for(let k=0;k<TN;k++){ let a=P.tA+P.tC*k+P.tW*Math.sin(P.tP+k*0.7); if(k>=TN-4) a+=P.tK*(k-(TN-5))/4; let q=lp(tail[k],a-R,TL);
      if(fin && q.y>DG-1.6) q={x:q.x+(q.x-tail[k].x)*0.25,y:DG-1.6}; tail.push(q); }
    const hull=[[ankleF,3.2],[ankleB,3.2],[wrF,3.6],[wrB,3.6],[kneeF,6],[kneeB,6],[hip,10],[T(0,-22),13],[T(-3,-42),13],[H(4,-9),11],[H(6,8),6],[elF,5],[elB,5]];
    return {R,hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,SP,T,sa,neck,shF,shB,elF,wrF,elB,wrB,ha,H,tail,hull};
  }
  function skeleton(P){
    const a=build(P,0,false); let m=-1e9; a.hull.forEach(([p,r])=>{ m=Math.max(m,p.y+r); });
    return build(P,DG-m-(P.lift||0),true);
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
  const hsh=n=>{ const s=Math.sin(n*127.1+311.7)*43758.5453; return s-Math.floor(s); };
  // tufos de pelo ao longo de um segmento a->b, pendendo pro lado n (comprimento L, quantidade k)
  function tufts(p,col,a,b,n,L,k,seed,droop){
    p.F(col); for(let i=0;i<k;i++){ const t=(i+0.5)/k, q=lerp(a,b,t), l=L*(0.8+0.4*hsh(seed+i)), w=2.4+1.2*hsh(seed+i*3);
      const dx=b.x-a.x, dy=b.y-a.y, d=Math.hypot(dx,dy)||1, ux=dx/d, uy=dy/d;
      // mecha: tufo arredondado com uma pontinha curta (cai com o peso)
      const cx=q.x+n.nx*l*0.62-ux*l*0.12, cy=q.y+n.ny*l*0.62-uy*l*0.12+(droop?l*0.12:0);
      p.ell(cx,cy,w,Math.max(1.4,l*0.42),Math.atan2(n.ny,n.nx));
      const tx=q.x+n.nx*(l+1.4)-ux*(l*0.3), ty=q.y+n.ny*(l+1.4)-uy*(l*0.3)+(droop?1.2:0);
      p.poly([[cx-ux*w*0.7,cy-uy*w*0.7],[cx+ux*w*0.5,cy+uy*w*0.5],[tx,ty]]); }
  }

  // mechas de pelo dentro do membro (luz em cima, sombra embaixo), seguindo o sentido do osso
  function strands(p,M,a,b,w,seed){
    const n=sideN(a,b); for(let i=0;i<9;i++){ const t=0.08+0.8*hsh(seed+i*2.3), side=(hsh(seed+i*5.1)-0.5)*w*0.7, q=off(lerp(a,b,t),n,side), e=off(lerp(a,b,Math.min(1,t+0.16)),n,side+w*0.12);
      p.F(side<0?(i%3?M.fur[0]:M.gold[1]):(i%2?M.fur[2]:M.fur[3])); p.cap(q,e,0.9,0.5); }
  }
  /* ---------- cauda preênsil ---------- */
  function drawTail(c,u,M,sk,P,form){
    const p=mkPen(c,u), t=sk.tail; p.id();
    const wd=k=>9.4-5.6*(k/TN);
    for(let k=0;k<TN;k++){ p.F(M.fur[1]); p.cap(t[k],t[k+1],wd(k),wd(k+1)); }
    for(let k=0;k<TN;k++){ const a=t[k], b=t[k+1], n=sideN(a,b), w0=wd(k), w1=wd(k+1);
      if(k>=TN-4){ // ponta nua por baixo (almofada de agarrar)
        p.F(M.face[1]); p.cap(off(a,n,w0*0.28),off(b,n,w1*0.28),w0*0.42,w1*0.42); p.F(M.face[0]); p.cap(off(a,n,w0*0.18),off(lerp(a,b,0.6),n,w1*0.18),0.5,0.5);
      } else { p.F(M.fur[2]); p.cap(off(a,n,w0*0.3),off(b,n,w1*0.3),w0*0.36,w1*0.36); }
      p.F(M.fur[0]); p.cap(off(a,n,-w0*0.3),off(lerp(a,b,0.7),n,-w1*0.3),w0*0.16,w1*0.14);
      if(k<TN-3){ p.F(M.fur[2]); const q=lerp(a,b,0.5); p.poly([[q.x-n.nx*w0*0.2,q.y-n.ny*w0*0.2],[q.x+(b.x-a.x)*0.2+n.nx*w0*0.6,q.y+(b.y-a.y)*0.2+n.ny*w0*0.6],[q.x+n.nx*w0*0.3,q.y+n.ny*w0*0.3]]); }
      if(k%3===1 && k<TN-3) tufts(p,M.fur[1],a,b,n,2.4,1,k*7+P.fur,true);
    }
    // falha na pelagem: pele podre e osso das vértebras perto da base
    const q0=lerp(t[2],t[3],0.5), n0=sideN(t[2],t[3]);
    p.F(M.rot[2]); p.poly([[q0.x-3,q0.y+n0.ny*2],[q0.x+3,q0.y],[q0.x+n0.nx*3,q0.y+n0.ny*3]]);
    if(form!=='comum'){ p.F(M.vein[0]); p.cap(off(t[4],n0,-1),off(t[6],n0,-1),0.6,0.5); }
  }
  function drawBranch(c,u,M,sk,P){
    const p=mkPen(c,u), t=sk.tail, tip=t[TN], q=t[TN-2]; p.id();
    const y=Math.min(tip.y,q.y)-1, x=(tip.x+q.x)/2;
    p.F(M.wood[1]); p.cap(P2(x-22,y+1.6),P2(x+20,y-1.4),5,4.2);
    p.F(M.wood[2]); p.cap(P2(x-22,y+3),P2(x+20,y),1.6,1.4); p.F(M.wood[0]); p.cap(P2(x-18,y-0.2),P2(x+16,y-2.6),0.8,0.6);
    p.F(M.wood[3]); [[x-12,y+0.4],[x+8,y-0.6]].forEach(([a,b])=>p.ell(a,b,1,0.8));
    p.F(M.wood[1]); p.cap(P2(x+12,y-1),P2(x+18,y-8),2,1.2);
    // folhas de embaúba
    [[x+18,y-9,-0.6],[x-20,y-1,2.6]].forEach(([lx,ly,an])=>{ p.F(M.leaf[1]); p.ell(lx,ly,5.4,2.4,an); p.F(M.leaf[2]); p.ell(lx+Math.cos(an)*1.4,ly+Math.sin(an)*1.4+0.8,4,1,an); p.F(M.leaf[0]); p.ell(lx-Math.cos(an)*1.6,ly-Math.sin(an)*1.6-0.4,2.4,0.6,an); });
    // a ponta da cauda enrola no galho
    p.F(M.fur[1]); p.ell(x+1,y-0.4,3.4,4.2); p.F(M.face[1]); p.ell(x+2,y+1.8,2.2,1.4); p.F(M.fur[0]); p.rect(x-1,y-4,2.4,0.8);
  }

  // massa muscular: bojo ao longo do osso (a->b, em t), com luz em cima e sombra embaixo + mechas por cima
  function muscle(p,M,a,b,t,L,Wd,seed){
    const q=lerp(a,b,t), n=sideN(a,b), an=Math.atan2(b.y-a.y,b.x-a.x);
    p.F(M.fur[1]); p.ell(q.x,q.y,L,Wd,an);
    p.F(M.fur[2]); p.ell(q.x+n.nx*Wd*0.42,q.y+n.ny*Wd*0.42,L*0.82,Wd*0.5,an);
    p.F(M.fur[3]); p.ell(q.x+n.nx*Wd*0.72,q.y+n.ny*Wd*0.72,L*0.55,Wd*0.2,an);
    p.F(M.fur[0]); p.ell(q.x-n.nx*Wd*0.5,q.y-n.ny*Wd*0.5,L*0.62,Wd*0.22,an);
    p.F(M.gold[0]); p.ell(q.x-n.nx*Wd*0.62+Math.cos(an)*L*0.2,q.y-n.ny*Wd*0.62+Math.sin(an)*L*0.2,L*0.26,Wd*0.1,an);
    const d={x:Math.cos(an),y:Math.sin(an)};
    for(let i=0;i<4;i++){ const sd=(hsh(seed+i*1.7)-0.5)*Wd*1.1, l0=(hsh(seed+i*2.9)-0.6)*L*1.2, s0={x:q.x+d.x*l0+n.nx*sd,y:q.y+d.y*l0+n.ny*sd};
      p.F(sd<0?M.fur[0]:M.fur[2]); p.cap(s0,{x:s0.x+d.x*L*0.55+n.nx*0.8,y:s0.y+d.y*L*0.55+n.ny*0.8},0.9,0.5); }
  }
  /* ---------- braços longos, mãos pretas de agarrar ---------- */
  function drawArm(c,u,M,sk,P,front,form){
    const p=mkPen(c,u), sh=front?sk.shF:sk.shB, el=front?sk.elF:sk.elB, wr=front?sk.wrF:sk.wrB; p._c=c; p.id();
    const nU=sideN(sh,el), nF=sideN(el,wr);
    // pelo longo pendendo (desenhado antes: só as pontas escapam do membro)
    tufts(p,M.fur[1],lerp(el,wr,0.05),lerp(el,wr,0.8),nF,5.8+2.6,4,front?11:21,true);
    tufts(p,M.fur[1],lerp(sh,el,0.1),lerp(sh,el,1.0),nU,8+3,5,front?3:13,true);
    tufts(p,M.fur[2],lerp(sh,el,0.4),lerp(sh,el,0.9),nU,8+1.6,2,front?5:15,true);
    limb(p,M.fur,el,wr,11.6,9,{hi:false,deep:false}); muscle(p,M,el,wr,0.3,8,7.2,front?71:81); strands(p,M,el,wr,11,front?7:17);
    p.F(M.fur[2]); [0.3,0.55].forEach(t=>{ const q=lerp(el,wr,t); p.cap(off(q,nF,0.6),off(lerp(el,wr,t+0.12),nF,2.2),0.6,0.5); });
    limb(p,M.fur,sh,el,16,12.4,{hi:false,deep:false}); muscle(p,M,sh,el,0.28,10.6,9.6,front?73:83); muscle(p,M,sh,el,0.66,8,8,front?75:85); strands(p,M,sh,el,15,front?9:19);
    p.F(M.fur[0]); p.cap(off(lerp(sh,el,0.15),nU,-3.4),off(lerp(sh,el,0.6),nU,-3),0.8,0.6);
    if(front){ p.F(M.gold[1]); p.cap(off(lerp(sh,el,0.05),nU,-2.8),off(lerp(sh,el,0.35),nU,-3.2),2,1.2);
      // falha: pele podre no cotovelo com veia
      const q=lerp(sh,el,0.7); p.F(M.rot[2]); p.poly([[q.x+nU.nx*1,q.y+nU.ny*1-2],[q.x+nU.nx*4,q.y+nU.ny*4],[q.x+nU.nx*1.4,q.y+nU.ny*1.4+2.6]]);
      p.F(M.vein[1]); p.cap(off(q,nU,1.6),off(lerp(sh,el,0.95),nU,2.4),0.5,0.4); }
    drawHand(p,M,sk,el,wr,P,front);
    if(front && P.fruit>=0.5){ const hd=Math.hypot(wr.x-el.x,wr.y-el.y)||1, f={x:wr.x+(wr.x-el.x)/hd*5,y:wr.y+(wr.y-el.y)/hd*5}; drawFruit(p,M,f.x,f.y,0.2,1); }
  }
  function drawHand(p,M,sk,el,wr,P,front){
    let ang=Math.atan2(wr.y-el.y,wr.x-el.x);
    if(wr.y>DG-9 && Math.abs(sk.R)<25) ang=lerp({x:ang,y:0},{x:0,y:0},Math.min(1,(wr.y-(DG-9))/6)).x; // apoiada: palma no chão, dedos pra frente
    p.xf(ang,wr.x,wr.y); p._c.scale(1.18,1.18);
    p.F(M.fur[1]); p.ell(-1.4,-1.6,4,2.8); p.F(M.fur[0]); p.rect(-3,-3.4,2.6,0.7); // pelo do dorso da mão
    p.F(M.face[1]); p.poly([[-0.6,-2.8],[5,-3],[6.6,-0.8],[6.4,2.6],[-0.6,3]]);
    p.F(M.face[2]); p.poly([[-0.6,1],[6.4,0.8],[6.4,2.6],[-0.6,3]]);
    p.F(M.face[0]); p.rect(0.6,-2.6,3.8,0.7);
    // 4 dedos longos com falanges (nó, ponta, unha)
    [[-2.2,12.2],[-0.6,13.2],[1,12.8],[2.6,11.2]].forEach(([y,L],k)=>{ const mid=6+(L-6)*0.52;
      p.F(M.face[3]); p.cap(P2(5.6,y+0.9),P2(L,y+1.3),0.6,0.5);
      p.F(M.face[1]); p.cap(P2(5.4,y),P2(mid,y+0.3),1.9,1.7); p.cap(P2(mid,y+0.3),P2(L,y+0.9),1.7,1.3);
      p.F(M.face[0]); p.rect(6,y-0.8,2,0.5); p.rect(mid-0.4,y-0.5,1,0.5);
      p.F(M.face[2]); p.rect(mid-0.2,y+0.4,0.6,0.8);
      p.F(M.nail[1]); p.rect(L-0.3,y+0.2,1,0.9); p.F(M.nail[0]); p.rect(L-0.1,y+0.2,0.5,0.4); });
    p.F(M.face[1]); p.cap(P2(2,-2.6),P2(6,-5.4),1.9,1.4); p.F(M.face[0]); p.rect(3,-3.8,1.6,0.5); p.F(M.nail[1]); p.rect(5.6,-6,0.9,0.8); // polegar
    if(front){ p.F(M.blood[1]); p.rect(9,0.4,1.4,0.8); }
    p.id();
  }

  /* ---------- pernas curtas e fortes, pés preênseis ---------- */
  function drawLeg(c,u,M,sk,P,front){
    const p=mkPen(c,u), hip=front?sk.hipF:sk.hipB, knee=front?sk.kneeF:sk.kneeB, ank=front?sk.ankleF:sk.ankleB; p.id();
    tufts(p,M.fur[1],lerp(knee,ank,0.2),lerp(knee,ank,0.8),sideN(knee,ank),5.7+2.2,2,front?31:41,true);
    tufts(p,M.fur[1],lerp(hip,knee,0.2),lerp(hip,knee,1.0),sideN(hip,knee),9+2.8,4,front?33:43,true);
    const nS=limb(p,M.fur,knee,ank,11.4,8.4,{hi:false,deep:false});
    muscle(p,M,knee,ank,0.3,7.6,7.2,front?91:95);
    const nT=limb(p,M.fur,hip,knee,18,13,{hi:false,deep:false}); muscle(p,M,hip,knee,0.48,12,10.6,front?93:97); strands(p,M,hip,knee,17,front?27:37); strands(p,M,knee,ank,11,front?29:39);
    p.F(M.fur[2]); p.cap(off(lerp(hip,knee,0.4),nT,1),off(lerp(hip,knee,0.8),nT,4),0.7,0.6);
    p.F(M.fur[0]); p.cap(off(lerp(hip,knee,0.2),nT,-4),off(lerp(hip,knee,0.7),nT,-3.4),0.8,0.6);
    if(front){ const q=lerp(knee,ank,0.4); p.F(M.flesh[2]); p.poly([[q.x+nS.nx*1,q.y+nS.ny*1-1.6],[q.x+nS.nx*3.6,q.y+nS.ny*3.6],[q.x+nS.nx*1.2,q.y+nS.ny*1.2+2]]); }
    // pé preto preênsil
    let fa=Math.atan2(ank.y-knee.y,ank.x-knee.x)-PI/2+rad(front?P.fF:P.fB);
    if(ank.y>DG-8 && Math.abs(sk.R)<25) fa=rad(front?P.fF:P.fB)*0.5;
    p.xf(fa,ank.x,ank.y);
    p.F(M.face[1]); p.poly([[-3.2,-1.4],[2,-2],[7,-0.6],[10.6,1],[11,3],[-3.6,3.2]]);
    p.F(M.face[2]); p.poly([[-3.6,1.8],[11,1.8],[11,3],[-3.6,3.2]]);
    p.F(M.face[0]); p.poly([[0,-1.6],[5,-1.4],[4.6,-0.6],[0.4,-0.8]]);
    [[8.4,0.4],[9.8,1.2],[10.8,2.2]].forEach(([x,y])=>{ p.F(M.face[2]); p.rect(x,y-1.2,0.5,1.4); });
    p.F(M.face[1]); p.cap(P2(-1,2.4),P2(-4.6,3.6),2,1.4); // dedão opositor
    p.F(M.nail[1]); p.rect(10.6,2,0.9,0.8); p.rect(-5,3,0.8,0.7);
    p.F(M.fur[1]); p.ell(-1.6,-1.8,3.4,1.8); p.F(M.fur[2]); p.rect(-3.6,-1.4,3,0.6);
    p.id();
  }

  /* ---------- tronco: pelagem longa desgrenhada, dorso dourado, falhas com costelas ---------- */
  function backEdge(P){ // borda das costas com tufos (v de cima pra baixo)
    const pts=[]; const n=12;
    for(let i=0;i<=n;i++){ const t=i/n, v=-53+t*58, u=-(13.6+3.4*Math.sin(t*PI)+(t<0.3?1.6:0)-(t>0.85?3:0));
      pts.push([u,v]); if(i<n){ const L=3.2+1.6*hsh(i*5+P.fur*0.37); pts.push([u-1.6-0.8*hsh(i*3),v+2.2+L*0.6]); pts.push([u+0.6,v+2.6]); } }
    return pts;
  }
  function drawTorso(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    const FRONT=[[3,8],[10,6],[13.6,-4],[15,-16],[15.6,-28],[15,-38],[11.6,-47],[6,-52.6],[-4,-55],[-11,-54.6]];
    const shape=W(sk,FRONT.concat(backEdge(P)));
    p.F(M.fur[1]); p.poly(shape);
    clip(c,shape,()=>{
      // dorso dourado-claro e ombros (A. seniculus)
      p.F(M.gold[1]); p.poly(W(sk,[[-20,-58],[-2,-58],[-4,-48],[-8,-38],[-11,-26],[-13,-14],[-20,-14]]));
      p.F(M.gold[0]); p.poly(W(sk,[[-20,-58],[-6,-58],[-8,-50],[-12,-42],[-20,-40]]));
      p.F(M.fur[1]); for(let k=0;k<7;k++){ const v=-50+k*6.4, uu=-5-k*1.1; p.poly(W(sk,[[uu,v],[uu+1.6,v+0.4],[uu-3.2,v+6],[uu-4.4,v+5.2]])); }
      p.F(M.gold[2]); for(let k=0;k<6;k++){ const v=-47+k*6.4, uu=-9-k*0.9; p.poly(W(sk,[[uu,v],[uu+0.9,v+0.4],[uu-2.4,v+4.6],[uu-3,v+4]])); }
      // barriga/peito mais escuros (pelo ralo)
      p.F(M.fur[2]); p.poly(W(sk,[[6,8],[16,8],[16,-46],[10,-44],[8,-30],[7,-16],[6,-4]]));
      p.F(M.fur[3]); p.poly(W(sk,[[10,8],[16,8],[16,-36],[12,-34],[11,-20],[10,-6]]));
      // mechas de pelo seguindo a coluna (2 tons)
      for(let k=0;k<30;k++){ const uu=-12+24*hsh(k*3.1), vv=-50+52*hsh(k*7.7+1), L=4+3*hsh(k*1.3);
        p.F(hsh(k*9.2)<0.55?M.fur[2]:M.fur[0]); p.poly(W(sk,[[uu,vv],[uu+0.9,vv],[uu-1.4,vv+L],[uu-2,vv+L-0.6]])); }
      // falha na pelagem do flanco: pele podre, costelas, carne
      p.F(M.rot[2]); p.poly(W(sk,[[-1,-33],[3,-34.6],[7,-31],[8,-25],[6,-20],[2,-19],[0,-23],[-2.4,-26],[-1.6,-29]]));
      p.F(M.rot[1]); p.poly(W(sk,[[0,-32],[3,-33.4],[6.2,-30.4],[6.8,-25.6],[5,-21.6],[2.4,-21],[1,-24]]));
      p.F(M.flesh[3]); p.poly(W(sk,[[1.4,-30],[4.6,-31],[6,-28],[5.6,-23.6],[3,-23],[1.6,-26]]));
      p.F(M.flesh[2]); p.poly(W(sk,[[2.2,-29.4],[4.4,-30],[5.2,-27.6],[4.8,-24.6],[3.2,-24.4]]));
      p.F(form==='plenilunar'?M.bone[0]:M.bone[1]); [-28.6,-25.4].forEach(v=>p.poly(W(sk,[[1,v+0.4],[6,v-1],[6.2,v],[1.2,v+1.4]])));
      p.F(M.bone[2]); [-27.6,-24.4].forEach(v=>p.poly(W(sk,[[1.4,v+0.8],[5.8,v-0.4],[5.8,v],[1.4,v+1.2]])));
      p.F(M.fur[1]); [[-1,-33,0],[3,-34.6,0],[6,-31,1]].forEach(([uu,vv])=>p.poly(W(sk,[[uu-1.2,vv],[uu+1.4,vv-0.4],[uu+0.6,vv+3]])));
      p.F(M.vein[1]); p.poly(W(sk,[[7,-20],[9,-14],[8.4,-13.6],[6.4,-19.4]])); p.poly(W(sk,[[-4,-18],[-7,-12],[-6.4,-11.6],[-3.6,-17.6]]));
      p.F(M.blood[1]); p.poly(W(sk,[[2,-18],[3.4,-18],[3,-12],[2.4,-11.6]])); { const q=Wp(sk,2.7,-11.4); p.ell(q.x,q.y,0.9,1); }
      // musgo/fungo lunar no ombro
      p.F(M.fungus[2]); p.poly(W(sk,[[-8,-50],[-2,-51],[1,-47],[-3,-44],[-8,-45]]));
      p.F(M.fungus[1]); [[-6,-49],[-3,-48.6],[-1,-47.4],[-5,-46.4]].forEach(([uu,vv])=>{ const q=Wp(sk,uu,vv); p.ell(q.x,q.y,1.2,1); });
      p.F(M.fungus[0]); [[-6,-49.6],[-1,-48]].forEach(([uu,vv])=>{ const q=Wp(sk,uu,vv); p.rect(q.x-0.4,q.y-0.4,0.8,0.7); });
      if(form==='plenilunar'){ p.F(M.blood[1]); p.poly(W(sk,[[6,-12],[12,-14],[12,0],[7,2]])); p.F(M.blood[2]); p.poly(W(sk,[[8,-6],[12,-7],[12,0],[8,1]])); }
    });
    // tufos que escapam da silhueta (peito/barriga)
    const fr=[[9,4],[11.6,-6],[12.8,-18],[13.4,-30]];
    for(let k=0;k<fr.length-1;k++){ const a=Wp(sk,fr[k][0],fr[k][1]), b=Wp(sk,fr[k+1][0],fr[k+1][1]); const n=sideN(a,b); const nn={nx:-n.nx,ny:-n.ny};
      const out=(nn.nx*Math.cos(sk.sa)+nn.ny*Math.sin(sk.sa))>0?nn:n; tufts(p,M.fur[1],a,b,out,2.2,2,k*5+P.fur,true); }
    if(form!=='comum'){ p.F(M.glow[1]); [[[-1,-30],[-4,-36],[-3.4,-36.4],[-0.4,-30.6]],[[6,-19],[9,-13],[8.4,-12.6],[5.4,-18.6]]].forEach(f=>p.poly(W(sk,f))); }
  }

  /* ---------- papo/hioide (caixa do urro) ---------- */
  function drawSac(c,u,M,sk,P,form){
    const p=mkPen(c,u), s=Math.max(0,Math.min(1,P.sac)); const o=sk.H(2.4,3.4);
    p.xf(sk.ha,o.x,o.y); c.scale(HS,HS);
    const rx=2.8+4.6*s, ry=3+5*s, cy=1+2.2*s;
    p.F(M.fur[1]); p.ell(-0.5,cy,rx+1.2,ry+0.8);
    p.F(M.rot[1]); p.ell(0,cy,rx,ry);
    p.F(M.rot[2]); p.ell(-rx*0.3,cy+ry*0.3,rx*0.7,ry*0.6);
    p.F(M.rot[0]); p.ell(rx*0.3,cy-ry*0.45,rx*0.4,ry*0.22);
    // pele rasgada mostrando o hioide (caixa de osso oca)
    const bx=rx*0.62, by=ry*0.62;
    p.F(M.flesh[2]); p.ell(0.6,cy+0.4,bx+1.1,by+1.1);
    p.F(M.hyoid[1]); p.ell(0.6,cy+0.4,bx,by);
    p.F(M.hyoid[2]); p.ell(0.2,cy+0.4+by*0.3,bx*0.8,by*0.55);
    p.F(M.hyoid[0]); p.ell(1.4,cy-by*0.4,bx*0.42,by*0.24);
    p.F(M.hyoid[3]); for(let k=-1;k<=1;k++) p.rect(0.6+k*bx*0.45-0.3,cy-by*0.5,0.6,by*1.1); // estrias da caixa
    p.F(M.hyoid[3]); p.ell(0.8,cy+0.6,Math.max(0.6,bx*0.3),Math.max(0.6,by*0.25)); // abertura
    // bordas rasgadas da pele
    p.F(M.rot[1]); [[-bx-0.6,cy-1],[bx+1.4,cy+1.6],[0,cy+by+1]].forEach(([x,y])=>p.poly([[x-1.2,y],[x+1.2,y-0.4],[x+0.2,y+1.6]]));
    // veias pulsando
    p.F(s>0.5?M.vein[0]:M.vein[1]); p.cap(P2(-rx*0.8,cy-ry*0.3),P2(-bx-0.6,cy+0.6),0.5,0.5); p.cap(P2(rx*0.7,cy+ry*0.5),P2(bx+0.8,cy+by*0.6),0.5,0.5);
    if(form==='plenilunar' && s>0.4){ p.F(M.glow[0]); p.ell(1.2,cy-by*0.3,bx*0.3,by*0.2); }
    p.id();
  }

  /* ---------- cabeça: rosto preto, focinho saliente, testa estreita, franja ruiva ---------- */
  function drawHead(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.xf(sk.ha,sk.neck.x,sk.neck.y); c.scale(HS,HS);
    // pescoço peludo ligando ao tronco
    p.F(M.fur[1]); p.poly([[-9,6],[6,6],[8,-4],[-6,-8]]);
    p.F(M.fur[2]); p.poly([[2,6],[6,6],[7.4,-2],[3,-2]]);
    // crânio baixo, testa estreita inclinada pra trás; pelo longo caindo pra nuca
    p.F(M.fur[1]); p.ell(-1.4,-9.6,8.8,8.2);
    p.poly([[-9,-8],[-12.6,-1],[-9.6,4],[-4,4],[0,0]]);
    p.F(M.fur[2]); p.poly([[-9,-8],[-12.6,-1],[-9.6,4],[-5,3.6],[-7.4,-3]]);
    p.F(M.fur[3]); p.poly([[-12,-2],[-9.6,3],[-8,3.2],[-10,-1.6]]);
    p.F(M.gold[1]); p.poly([[-7,-14.6],[-2,-17.6],[2,-17],[-1,-15],[-5,-12.6]]);
    p.F(M.fur[0]); [[-5,-15],[-1,-16]].forEach(([x,y])=>p.poly([[x,y],[x+1,y-0.4],[x-2.4,y+4],[x-3,y+3.4]]));
    p.F(M.fur[2]); [[-6,-11],[-3,-7.4],[-8,-5]].forEach(([x,y])=>p.poly([[x,y],[x+0.9,y],[x-1.8,y+4],[x-2.4,y+3.4]]));
    // rosto nu de pele preta-acinzentada: planos (bochecha, focinho projetado, arco da sobrancelha)
    p.F(M.face[1]); p.poly([[2.6,-14],[7,-15.2],[10.6,-14.4],[12.4,-12],[15,-10.4],[16.8,-8.4],[16.6,-5.6],[13,-4.2],[7,-4.4],[3.6,-6.4],[2.2,-10]]);
    p.F(M.face[2]); p.poly([[2.6,-14],[4.6,-14.2],[4,-10.4],[5.6,-6.2],[3.6,-6.4],[2.2,-10]]); // lado da cara na sombra
    p.F(M.face[2]); p.poly([[5,-10],[9.6,-9.2],[11.6,-6.6],[8,-4.8],[5.4,-6]]); // bochecha
    // focinho projetado com volume
    p.F(M.face[1]); p.ell(13.2,-7.8,4.2,3.3,-0.2);
    p.F(M.face[0]); p.poly([[10.8,-10.4],[14.6,-10.6],[16.6,-9],[16.4,-8.2],[13.8,-9.2],[10.6,-9.6]]);
    p.F(M.face[2]); p.poly([[10.4,-6],[16.2,-6.2],[16.4,-5.2],[11,-4.8]]);
    p.F(M.face[3]); p.rect(15.6,-8,1.1,1); p.rect(14,-7.6,0.9,0.8); // narinas
    p.F(M.face[0]); p.rect(15.8,-8.6,0.7,0.5);
    // arco da sobrancelha saliente e órbita funda
    p.F(M.face[1]); p.poly([[5,-14.2],[10.8,-14.6],[12.2,-12.8],[10.6,-12.6],[5.6,-12.8]]);
    p.F(M.face[0]); p.poly([[5.6,-14.4],[10.6,-14.8],[11.6,-13.6],[10.4,-13.8],[6,-13.6]]);
    p.F(M.face[2]); p.poly([[10.6,-14.2],[13.2,-11.6],[12.4,-11.2],[10.2,-13]]); // vinco olho-focinho
    p.F(M.face[3]); p.ell(8.8,-11.2,2.8,1.8);
    p.F(M.face[2]); [[4.6,-9],[6.4,-8.6]].forEach(([x,y])=>p.rect(x,y,1.6,0.5)); // rugas
    // olho de lua
    if(P.blink>=0.5){ p.F(M.face[0]); p.rect(7,-11.8,4,0.8); }
    else { p.F(M.eye[2]); p.ell(9.2,-11.2,1.6,1.05); p.F(M.eye[1]); p.ell(9.4,-11.3,1.1,0.8); p.F(M.eye[0]); p.rect(9.3,-11.7,0.7,0.5); p.F(M.face[3]); p.poly([[7,-12.4],[11.4,-12.6],[11,-11.9],[7.4,-11.8]]); }
    if(form!=='comum'){ p.F(M.glow[1]); p.rect(11,-11.8,2.6,0.6); }
    // narinas, lábio de cima, rugas
    p.F(M.face[3]); p.rect(14.8,-7.4,1.2,0.9); p.rect(13.2,-7,0.8,0.6);
    p.F(M.face[2]); p.poly([[7,-8.6],[12,-7.4],[11.8,-6.8],[7.2,-7.8]]);
    p.F(M.face[0]); p.rect(11.8,-6.2,3,0.6);
    // bochecha roída: carne e dentes à mostra
    p.F(M.flesh[2]); p.poly([[6,-8],[8.2,-8.4],[9.6,-6.6],[8.6,-5.2],[6.6,-5.6]]);
    p.F(M.flesh[1]); p.poly([[6.8,-7.4],[8,-7.6],[8.6,-6.4],[7.2,-6.2]]);
    p.F(M.teeth[2]); p.rect(7.6,-5.8,0.8,1); p.F(M.teeth[1]); p.rect(8.6,-5.9,0.8,1.1);
    // boca de cima: canino grande
    p.F(M.face[2]); p.poly([[9,-5.6],[16.4,-5.8],[16.2,-4.6],[9.4,-4.4]]); // lábio
    if(P.jaw>=12){ p.F(M.mouth[1]); p.poly([[9.6,-4.8],[15.8,-5],[15.6,-4],[9.6,-4]]); p.F(M.teeth[1]); p.rect(14.6,-4.8,0.7,0.9); p.rect(11,-4.8,0.8,0.9); }
    p.F(M.teeth[1]); p.poly([[12.6,-4.8],[13.8,-4.8],[13.3,-2.2]]); p.F(M.teeth[0]); p.rect(12.7,-4.8,0.5,0.9); // canino
    // tons quentes e rugas da pele (não chapado)
    p.F(M.face[0]); p.poly([[11,-9.6],[12.6,-8.4],[12,-7.6],[10.8,-8.6]]); p.rect(6.6,-9.6,2.4,0.5);
    p.F(M.flesh[3]); p.rect(7,-12.8,3.6,0.6); // pálpebra avermelhada
    p.F(M.face[2]); [[11.4,-7],[12.8,-6.6]].forEach(([x,y])=>p.poly([[x,y],[x+2,y-1.6],[x+2.3,y-1.2],[x+0.4,y+0.4]]));
    // borda irregular pelo/rosto: mechas da testa e das costeletas invadindo a pele (nada de contorno de capuz)
    p.F(M.fur[1]); [[2,-15,6,-14.8,4.4,-12.6],[4.6,-16.4,9.6,-15.6,7.4,-14.6],[1.4,-12,3.4,-11,1.8,-7.4],[1.8,-8,4.2,-6.6,3.4,-3.4],[8.6,-16,11.4,-14.8,10.2,-14.2]].forEach(([a,b2,c2,d,e,f2])=>p.poly([[a,b2],[c2,d],[e,f2]]));
    p.F(M.fur[1]); [[0.6,-14.6,3.6,-13.4,1.6,-10.6],[2,-5,4.6,-3.6,2.4,-0.6],[9.6,-15.8,12.6,-14,11,-13.6],[6.4,-17,10,-16.6,8.2,-15]].forEach(([a,b2,c2,d,e,f2])=>p.poly([[a,b2],[c2,d],[e,f2]]));
    p.F(M.fur[0]); p.poly([[4.8,-16.2],[7.4,-15.8],[6.4,-15.2]]); p.poly([[9.8,-15.6],[11.6,-14.6],[10.8,-14.4]]); p.poly([[1.6,-11.6],[2.6,-11],[1.8,-9]]);
    p.F(M.fur[2]); p.poly([[2.2,-7.6],[3.6,-6.8],[3,-4.4]]);
    // costeleta ruiva descendo pra barba
    p.F(M.gold[1]); p.poly([[2,-6],[5.4,-4.6],[5,-1],[1.4,0.4],[0,-3]]); p.F(M.fur[2]); p.poly([[0.6,-2],[3,-1.4],[1.6,0.6]]);
    p.id();
  }
  function drawJaw(c,u,M,sk,P,form){
    const p=mkPen(c,u); const h=sk.H(5,-5.6); p.xf(sk.ha+rad(P.jaw),h.x,h.y); c.scale(HS,HS);
    // mandíbula enorme (pele preta) com dentes de baixo
    p.F(M.face[1]); p.poly([[-1.4,-1.2],[11.6,-0.8],[13.4,0.8],[12.6,2.6],[5,3.6],[-1.6,2.6]]);
    p.F(M.face[2]); p.poly([[-1.6,1.8],[5,3.2],[12,2.6],[12,3.6],[5,4.6],[-1.6,3.2]]);
    p.F(M.face[0]); p.rect(6,0.8,4.4,0.6);
    if(P.jaw>=12){ p.F(M.mouth[1]); p.poly([[3,-1],[12.4,-0.6],[12.2,0.8],[3.6,0.6]]);
      p.F(M.teeth[1]); [[5,-1.2,1,1.4],[6.6,-1.2,1,1.2],[8.2,-1.2,1,1.4],[10.6,-1.6,1.2,2]].forEach(([x,y,w,hh])=>p.rect(x,y,w,hh)); }
    else { p.F(M.face[0]); p.rect(4,-1,7.6,0.6); p.F(M.teeth[1]); p.rect(10.6,-1.4,1,1.4); } // lábio de baixo + presa
    // barba ruiva longa pendendo do queixo (por baixo, pra trás)
    const sw=Math.sin(P.fur*1.6)*0.8;
    const beard=[[-7,0.6],[3,1.6],[8,2.2],[12.4,1.8],[13.6,4],[12.6,9],[10.6,13+sw],[9,18+sw],[7,15.4],[5.4,21+sw],[3.4,16.4],[1.4,20+sw*0.6],[0,15],[-2.6,17.6],[-4,12],[-7.4,11],[-8.4,4]];
    p.F(M.fur[1]); p.poly(beard);
    clip(c,beard,()=>{ p.F(M.fur[2]); p.poly([[-5,4],[3,6],[2,18],[-5,18]]); p.F(M.fur[3]); p.poly([[-5,8],[0,10],[-1,18],[-5,18]]);
      p.F(M.gold[1]); p.poly([[3,2],[12.6,2],[11,9],[8,14],[5,11]]); p.F(M.gold[0]); p.poly([[7,2.6],[12,2.6],[10.4,6],[8.4,7]]); p.F(M.fur[0]); [[9,9],[6,12],[11,11]].forEach(([x,y])=>p.poly([[x,y],[x+0.9,y],[x-0.3,y+5],[x-0.9,y+4.4]]));
      p.F(M.fur[2]); [[4,6],[7,8],[2,9]].forEach(([x,y])=>p.poly([[x,y],[x+0.8,y],[x-0.2,y+5],[x-0.8,y+4.6]]));
      p.F(M.fungus[2]); p.ell(4.4,10.6,2.6,1.8); p.F(M.fungus[1]); p.ell(3.8,10.2,1.4,1.1); p.ell(6,11.4,1,0.8); p.F(M.fungus[0]); p.rect(3.4,9.6,0.7,0.6);
    });
    const L=1.6+(P.drool%4)*1.1+(P.jaw>30?2:0);
    p.F(M.blood[1]); p.poly([[11.6,2.6],[12.8,2.2],[12.6,2.6+L],[12,3.4+L]]); p.ell(12.3,3.4+L,0.9,0.9);
    p.id();
  }
  function drawMouthIn(c,u,M,sk,P){
    if(P.jaw<14) return; const p=mkPen(c,u); p.id();
    const a=sk.H(9,-4.6), b=sk.H(15.4,-4.8), h=sk.H(5,-5.6), ja=sk.ha+rad(P.jaw), jc=Math.cos(ja), js=Math.sin(ja);
    const J=(x,y)=>({x:h.x+(x*jc-y*js)*HS,y:h.y+(x*js+y*jc)*HS}), d=J(12.6,0.2), e=J(3,0.4);
    p.F(M.mouth[2]); p.poly([[a.x,a.y],[b.x,b.y],[d.x,d.y],[e.x,e.y]]);
    p.F(M.mouth[3]); const m=lerp(lerp(a,b,0.25),lerp(e,d,0.25),0.5); p.circle(m,P.jaw>40?2.6:1.6);
    if(P.jaw>40){ p.F(M.flesh[1]); const t=lerp(e,d,0.45); p.ell(t.x,t.y-0.6,2.2,1); } // língua
  }

  /* ---------- efeitos desenhados no quadro ---------- */
  function drawClawSmear(c,u,M,sk,P){
    const p=mkPen(c,u); p.id(); const front=P.smear<1.5;
    const sh=front?sk.shF:sk.shB, el=front?sk.elF:sk.elB, wr=front?sk.wrF:sk.wrB;
    const L=Math.hypot(wr.x-el.x,wr.y-el.y)||1, tip={x:wr.x+(wr.x-el.x)/L*10,y:wr.y+(wr.y-el.y)/L*10};
    const r=Math.hypot(tip.x-sh.x,tip.y-sh.y)+2, a1=Math.atan2(tip.y-sh.y,tip.x-sh.x);
    const n=10, pts=[]; for(let i=0;i<=n;i++){ const a=a1-1.5+1.55*i/n; pts.push([sh.x+Math.cos(a)*r,sh.y+Math.sin(a)*r]); }
    for(let i=n;i>=0;i--){ const a=a1-1.5+1.55*i/n, rr=r-2-8*(i/n); pts.push([sh.x+Math.cos(a)*rr,sh.y+Math.sin(a)*rr]); }
    p.F(M.swish[0]); p.poly(pts.map(([x,y])=>[Math.max(1,Math.min(FW/S-2,x)),Math.max(1,Math.min(DG,y))]));
    // 3 riscos de unha no fim do arco
    p.F(M.swish[2]); for(let k=0;k<3;k++){ const a=a1-0.25+k*0.12, r0=r-9, r1=r+1; p.cap({x:sh.x+Math.cos(a)*r0,y:sh.y+Math.sin(a)*r0},{x:sh.x+Math.cos(a+0.18)*r1,y:sh.y+Math.sin(a+0.18)*r1},0.8,0.5); }
  }
  function drawWaves(c,u,M,sk,P){
    const p=mkPen(c,u); p.id(); const o=sk.H(17,-3), a0=sk.ha+rad(P.jaw*0.35), k0=P.wave;
    for(let j=0;j<3;j++){ const r=6+j*9+(k0%2)*3+k0*1.5, th=2.4-j*0.5; if(r>46) continue; const pts=[], n=12, sp=0.75+j*0.12;
      for(let i=0;i<=n;i++){ const a=a0-sp+2*sp*i/n; pts.push([o.x+Math.cos(a)*r,o.y+Math.sin(a)*r]); }
      for(let i=n;i>=0;i--){ const a=a0-sp+2*sp*i/n; pts.push([o.x+Math.cos(a)*(r-th),o.y+Math.sin(a)*(r-th)]); }
      p.F(j===0?M.wave[0]:j===1?M.wave[1]:M.wave[2]); p.poly(pts); }
    // gotas de baba/sangue espirrando
    p.F(M.blood[1]); for(let k=0;k<3;k++){ const a=a0-0.4+k*0.4, r=8+((k0+k)%3)*5; p.ell(o.x+Math.cos(a)*r,o.y+Math.sin(a)*r,0.9,0.9); }
  }
  function drawDust(c,u,M,sk,P){
    const p=mkPen(c,u); p.id(); const k=P.dust, x0=sk.hip.x, sp=6+k*7;
    p.F(M.dirt[0]); [[-sp-10,0,3.4,2],[sp+14,0,3.2,1.8],[-sp*0.4-2,-1,2.6,1.6],[sp*0.6+6,-1.2,2.4,1.4]].forEach(([dx,dy,a,b])=>p.ell(x0+dx,DG-2+dy-k*0.6,a*(1+k*0.15),b));
    p.F(M.dirt[1]); [[-sp-12,1,1.6,1],[sp+16,1,1.6,1]].forEach(([dx,dy,a,b])=>p.ell(x0+dx,DG-2+dy,a,b));
  }
  // fruto podre (cupuaçu passado): casca marrom rachada, polpa creme à mostra, mofo e baba
  function drawFruit(p,M,x,y,ang,sc){
    p.xf(ang,x,y); const k=sc||1;
    p.F(M.fruit[1]); p.ell(0,0,4.6*k,3.6*k);
    p.F(M.fruit[2]); p.ell(-0.8*k,1*k,3.6*k,2.4*k);
    p.F(M.fruit[0]); p.ell(1.2*k,-1.6*k,2*k,0.9*k);
    p.F(M.pulp[1]); p.poly([[1*k,-0.6*k],[4.2*k,0.2*k],[3.6*k,2*k],[1.6*k,1.6*k]]); p.F(M.pulp[2]); p.rect(1.8*k,0.8*k,1.6*k,0.6*k);
    p.F(M.mold[1]); p.ell(-2.4*k,-1*k,1.2*k,0.9*k); p.ell(-0.6*k,2*k,0.9*k,0.7*k); p.F(M.mold[0]); p.rect(-2.8*k,-1.6*k,0.7*k,0.5*k);
    p.F(M.fruit[3]); p.rect(-4.4*k,-0.4*k,0.8*k,0.8*k); // pedúnculo
    p.id();
  }

  /* ---------- adereço: fruto girando ---------- */
  const PW=26, PH=26, PG=13, PAX=13;
  function frameProp(form,st,K){
    const M=mats(form), s=((st|0)%4+4)%4;
    const parts=[
      {noShade:true, noRim:true, smear:true, draw:(c,u)=>{ const p=mkPen(c,u); p.id(); p.F(M.swish[2]); p.poly([[1,PG/S-1.4],[6,PG/S-2.4],[6,PG/S+1],[1.6,PG/S+0.6]]); }},
      {draw:(c,u)=>{ const p=mkPen(c,u); drawFruit(p,M,PAX/S+1,PG/S,s*PI/2,1.05); }},
    ];
    PIX.setK(K*S);
    let cv; try{ cv=compose({FW:Math.round(PW*K),FH:Math.round(PH*K),GROUND:PH*K,parts,M,step:5,flash:0,rim:RIM[form]}); } finally { PIX.setK(K); }
    cv._ax=PAX*K; cv._gy=PG*K; return cv;
  }

  /* ---------- montagem ---------- */
  const cache=PIX.cache();
  function frame(form,anim,fi,step=5,Pov,pk){
    const K=PIX.getK(), key=(pk!=null?'#'+pk+'|'+form:form+'|'+anim+'|'+fi+'|'+step)+'@'+K;
    const hit=cache.get(key); if(hit){ cache.delete(key); cache.set(key,hit); return hit; }
    if(ANIMS[anim]&&ANIMS[anim].prop){ const st=Pov&&Pov.st!=null?Math.round(Pov.st):fi; const cv=frameProp(form,st,K); cache.set(key,cv); return cv; }
    const P=Pov?Object.assign({},REST,Pov):poseOf(anim,fi), M=mats(form), sk=skeleton(P);
    const parts=[{back:true, draw:(c,u)=>drawTail(c,u,M,sk,P,form)}];
    if(P.branch>=0.5) parts.push({draw:(c,u)=>drawBranch(c,u,M,sk,P)});
    parts.push(
      {back:true, draw:(c,u)=>drawArm(c,u,M,sk,P,false,form)},
      {back:true, draw:(c,u)=>drawLeg(c,u,M,sk,P,false)},
      {draw:(c,u)=>drawTorso(c,u,M,sk,P,form)},
      {draw:(c,u)=>drawLeg(c,u,M,sk,P,true)},
      {draw:(c,u)=>{ drawHead(c,u,M,sk,P,form); drawMouthIn(c,u,M,sk,P); }},
      {draw:(c,u)=>drawSac(c,u,M,sk,P,form)},
      {draw:(c,u)=>drawJaw(c,u,M,sk,P,form)},
    );
    if(P.smear>=1.5) parts.push({noShade:true, smear:true, noRim:true, draw:(c,u)=>drawClawSmear(c,u,M,sk,P)});
    parts.push({draw:(c,u)=>drawArm(c,u,M,sk,P,true,form)});
    if(P.smear>=0.5 && P.smear<1.5) parts.push({noShade:true, smear:true, noRim:true, draw:(c,u)=>drawClawSmear(c,u,M,sk,P)});
    if(P.wave>=0.5) parts.push({noShade:true, smear:true, noRim:true, draw:(c,u)=>drawWaves(c,u,M,sk,P)});
    if(P.dust>=0.5) parts.push({noShade:true, noRim:true, draw:(c,u)=>drawDust(c,u,M,sk,P)});
    PIX.setK(K*S);
    let cv; try{ cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM[form]}); } finally { PIX.setK(K); }
    if(step>=4) heavyOutline(cv);
    const sc=q=>({x:q.x*K*S,y:q.y*K*S});
    cv._eye=sc(sk.H(9.4,-11.5)); cv._mouth=sc(sk.H(15,-4)); cv._hand=sc(sk.wrF); cv._head=sc(sk.H(3,-11)); cv._handB=sc(sk.wrB); cv._tail=sc(sk.tail[TN]);
    cache.set(key,cv); if(cache.size>900) cache.delete(cache.keys().next().value);
    return cv;
  }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame,framePose:function(form,anim,P,key){ return frame(form,anim,0,5,P,key); }};
})();
