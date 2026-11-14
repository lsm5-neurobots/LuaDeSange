/* PERCUSSIONISTA — fonte de arte (editável). Build: npm run art
   Zumbi Percussionista (variante local do Pelourinho): músico de rua de bloco. Camisa de bloco amarela com
   estampa vermelha desbotada, faixa de pano na testa, calça de linho curta, tamancos de madeira. Surdo grande
   pendurado na cintura por alça de couro (pele rachada, aro sujo de sangue), duas baquetas (a de trás partida).
   Pele cinza-azulada com veias marcadas nos antebraços, boca aberta num ritmo mudo.
   Golpes: baquetada (smash), golpe de tambor (onda sonora em volta: empurra e atordoa) e ritmo (batida que
   acelera os zumbis perto). Hi-bit: honra PIX.getK(). */
const PERCUSSIONISTA=(function(){
  const {rad,lerp,P2,mkPen,compose}=PIX;
  const FW=196, FH=156, GROUND=148, AX=80;
  const RIM={comum:'#c4dcf4', enluarado:'#9ff6ff', plenilunar:'#ffb46a'};

  /* ---------- materiais ---------- */
  function mats(form){
    const m={
      skin:['#d4e0ee','#9aa8bc','#66748e','#3a4262'],
      vein:['#8aa0d0','#5a6a9e','#3e4878','#262a52'],
      rot:['#b4b096','#7e7864','#545056','#30283a'],
      flesh:['#f6ae94','#c25a5e','#7a3a4a','#4a1c34'],
      bone:['#fff4d8','#dccfa6','#a09070','#605040'],
      shirt:['#ffe08a','#e2a646','#a8682e','#62381e'],
      print:['#f27a5e','#b8403a','#7c2430','#4a1424'],
      band:['#ff8a6a','#c8423a','#86222e','#4c1020'],
      linen:['#f2ead2','#c8bc9c','#8e8270','#55493e'],
      clog:['#d8a868','#9c6a3a','#664226','#3a2216'],
      shell:['#c08a5a','#8a5a36','#5a3824','#341e16'],
      head:['#fff6dc','#e6dcc0','#b4a684','#706246'],
      hoop:['#f4f2ec','#b8bcc6','#767c8e','#40445a'],
      strap:['#a07a54','#6a4a34','#462e22','#281a14'],
      stick:['#f0d49a','#c09a60','#86643a','#4c3622'],
      hair:['#5a5048','#3a322e','#24201e','#141012'],
      eye:['#ffffff','#e6e8d8','#a8aca0','#686c66'],
      mouth:['#7c2e3e','#4c1828','#2e0c1a','#1a0610'],
      teeth:['#fbf0c0','#d8c27c','#9a8650','#5e4e30'],
      blood:['#c84a3e','#8e2a2c','#5e1824','#3a0e1a'],
      nail:['#8a7a72','#54484a','#342a30','#1c161a'],
      wave:['#fffbe8','#ffe9a8','#f2c060','#b8803a'],
      glow:['#fffbe0','#e8ecb0','#a8b07a','#646c4a'],
    };
    if(form==='enluarado'){
      m.skin=['#dcdcff','#a0a2e4','#686cae','#3c3a76']; m.vein=['#a8f4ff','#4ad8f0','#2a8ab0','#1a4a7a'];
      m.rot=['#b8a6e0','#8470b0','#56468a','#33285e']; m.flesh=['#f0b0ff','#b866d8','#7a3a9e','#46206a']; m.blood=['#b46ad8','#7e3ea6','#542474','#34144a'];
      m.eye=['#ffffff','#b8fbff','#4ad8f0','#1a8aa8']; m.glow=['#effffe','#7af4ff','#2ab0d8','#146a96']; m.wave=['#ffffff','#b8fbff','#5ae0f4','#1a8aa8'];
      m.shirt=['#e0d0b4','#a8987e','#706a6e','#40384e']; m.print=['#c896c8','#8e5a9e','#5e3a76','#38204e'];
      m.band=['#d0a0e0','#9a62b8','#663c8a','#3c2058']; m.linen=['#dcdcf0','#a8a8c8','#72729a','#444466'];
      m.head=['#f4ffff','#c8f0f4','#8ab8c8','#4e7088'];
    }
    if(form==='plenilunar'){
      m.skin=['#ffcaa6','#e2806a','#a4424e','#5e1e36']; m.vein=['#fff0a0','#ffb43a','#e0581e','#8a2414'];
      m.rot=['#d0806a','#9a4a4a','#682a3a','#3e1628']; m.flesh=['#ffc07a','#f06a3a','#a8302e','#5e1422']; m.blood=['#ff7a3a','#d43a26','#8a1c22','#4e0c18'];
      m.eye=['#fffbe0','#ffe04a','#ff8a2a','#b83a14']; m.glow=['#fff6c0','#ffb43a','#e0581e','#8a2414']; m.wave=['#fffbe0','#ffe08a','#ffa040','#c8501e'];
      m.shirt=['#f0d0a0','#c0905e','#84563e','#4a2a26']; m.print=['#7a3a3a','#52222a','#38141e','#220a12'];
      m.band=['#e8c8a0','#b08a6a','#785a4a','#44302e']; m.linen=['#d8c4b0','#a48e80','#6e5a56','#402e30'];
      m.stick=['#fff4d8','#dccfa6','#a09070','#605040'];
    }
    return punch(m);
  }
  const NAMES={skin:'Pele',vein:'Veias',rot:'Podridão',flesh:'Carne',bone:'Osso',shirt:'Camisa de bloco',print:'Estampa',band:'Faixa da testa',linen:'Calça de linho',clog:'Tamanco',shell:'Casco do surdo',head:'Pele do tambor',hoop:'Aro e tirantes',strap:'Alça de couro',stick:'Baquetas',hair:'Cabelo',eye:'Olho',teeth:'Dentes',blood:'Sangue',wave:'Onda sonora',glow:'Brilho'};
  function sat(h,k){ const [r,g,b]=PIX.hexRgb(h), y=(r+g+b)/3; return PIX.toHex(y+(r-y)*k,y+(g-y)*k,y+(b-y)*k); }
  const NOPUNCH={wave:1,glow:1};
  function punch(m){ const o={}; for(const k in m){ const r=m[k]; o[k]=NOPUNCH[k]?[r[0],r[1],r[2],r[3]]:[sat(r[0],1.1),sat(r[1],1.16),PIX.mix(sat(r[2],1.1),'#2a1a4c',0.2),PIX.mix(r[3],'#140a24',0.34)]; } return o; }

  /* ---------- poses ---------- */
  // ângulos: 0 = pendurado, + = pra frente. sF/sB = ângulo da baqueta somado ao do antebraço.
  // ring = anéis da onda saindo do surdo (0 = nada). dt = inclinação do surdo. dx/dr = surdo solto (morte).
  // burst = pele do surdo estourada. hit = clarão da batida na pele.
  const REST={hx:0,rot:0,lift:0,lean:8,hunch:18,head:-22,jaw:22,aFs:70,aFe:92,aBs:60,aBe:86,sF:-130,sB:-120,lFh:18,lFk:-8,lBh:-12,lBk:-22,fF:0,fB:0,dt:0,ring:0,hit:0,burst:0,grip:1,smear:0,flash:0,drool:0};
  const S=Math.sin, C=Math.cos, PI=Math.PI, mx=Math.max;
  const ANIMS={
    idle:{nome:'Parado (batucando)',n:8,dur:i=>[150,150,140,90,70,140,150,150][i],pose:i=>{ const p=i/8*PI*2, s=S(p);
      // a baqueta da frente sobe devagar e desce seca no quadro 4 (batida); a de trás repica
      const up=[0.2,0.5,0.8,1,0,0.1,0.15,0.2][i];
      return {hunch:18+2*s, lean:8+1*s, head:-22+5*S(p-0.6), jaw:16+8*mx(0,S(p-0.4)), hx:0.5*S(p+0.5), drool:i%4,
        aFs:70+36*up, aFe:92+70*up, sF:-130+120*up, aBs:60+8*S(p*2), aBe:86+14*S(p*2), sB:-120+24*S(p*2), hit:i===4?1:0, ring:i===4?1:0, dt:i===4?2:0}; }},
    walk:{nome:'Andar batucando',n:8,dur:()=>130,pose:i=>{ const p=i/8*PI*2;
      const lFh=12+18*S(p), lBh=-12+12*S(p+PI), up=mx(0,S(p*2+1));
      return {lFh, lFk:lFh-22*mx(0,C(p))-3, lBh, lBk:lBh-10-12*mx(0,C(p+PI)), fF:-12*mx(0,C(p)), fB:22*mx(0,C(p+PI)),
        lean:9+2*Math.abs(S(p)), hunch:18+3*S(2*p-0.6), head:-22+5*S(2*p-1.4), jaw:16+5*S(2*p-1.8), hx:1.1*S(2*p), dt:2*S(2*p),
        aFs:70+32*up, aFe:92+64*up, sF:-130+110*up, aBs:60+30*(1-up), aBe:86+60*(1-up), sB:-120+100*(1-up), hit:i===3||i===7?1:0, drool:i%4}; }},
    alert:{nome:'Alerta (repique)',n:7,dur:i=>[180,90,90,90,90,200,180][i],pose:i=>[
      {},
      {hunch:12,head:-10,jaw:10,lean:4,aFs:60,aFe:140,sF:-10,aBs:50,aBe:130,sB:-10,hx:-1},
      {hunch:14,head:-14,jaw:30,lean:6,aFs:70,aFe:92,sF:-130,aBs:56,aBe:136,sB:-6,hit:1,ring:1,hx:0},
      {hunch:14,head:-14,jaw:34,lean:6,aFs:62,aFe:142,sF:-8,aBs:62,aBe:88,sB:-122,hit:1,ring:2,hx:0},
      {hunch:14,head:-16,jaw:40,lean:6,aFs:70,aFe:92,sF:-130,aBs:56,aBe:136,sB:-6,hit:1,ring:3,hx:0},
      {hunch:20,head:-26,jaw:44,lean:10,aFs:70,aFe:92,sF:-128,aBs:60,aBe:86,sB:-120,hx:2,lFh:14,lBh:-16},
      {hunch:18,head:-22,jaw:24,lean:8,hx:1}][i]},
    // ---- golpes (IA escolhe por distância/peso; hit = quadro do dano, reach = alcance em px) ----
    attack:{nome:'Baquetada',n:7,hit:3,reach:34,dur:i=>[150,150,50,110,130,130,140][i],pose:i=>[
      {lean:4,hunch:14,head:-18,jaw:20,aFs:70,aFe:150,sF:0,aBs:20,aBe:70,hx:-2,lFh:14,lBh:-14},
      {lean:-8,hunch:6,head:-8,jaw:34,aFs:150,aFe:200,sF:10,aBs:10,aBe:60,hx:-5,lFh:12,lFk:-10,lBh:-10,lBk:-22},
      {lean:20,hunch:22,head:-26,jaw:40,aFs:110,aFe:110,sF:-10,aBs:16,aBe:60,hx:6,lFh:28,lFk:4,lBh:-22,lBk:-32,fB:14,smear:1},
      {lean:28,hunch:26,head:-28,jaw:10,aFs:76,aFe:60,sF:-20,aBs:10,aBe:50,hx:10,lFh:32,lFk:6,lBh:-26,lBk:-34,fB:18,smear:1},
      {lean:28,hunch:26,head:-24,jaw:6,aFs:60,aFe:40,sF:-20,aBs:10,aBe:50,hx:10,lFh:30,lFk:6,lBh:-26,lBk:-34,fB:18},
      {lean:18,hunch:22,head:-24,jaw:16,aFs:46,aFe:80,sF:-30,aBs:18,aBe:70,hx:5,lFh:22,lBh:-18},
      {lean:8,hunch:18,head:-22,jaw:20,hx:1}][i]},
    drum:{nome:'Golpe de tambor (onda que empurra)',n:9,hit:5,reach:52,dur:i=>[150,150,170,130,60,90,110,140,160][i],pose:i=>[
      {lean:4,hunch:14,head:-16,jaw:16,aFs:60,aFe:130,sF:-20,aBs:50,aBe:120,sB:-20,hx:-1},
      {lean:-6,hunch:4,head:-4,jaw:30,aFs:120,aFe:180,sF:10,aBs:110,aBe:170,sB:10,hx:-4,lFh:12,lBh:-8},
      {lean:-12,hunch:0,head:4,jaw:44,aFs:160,aFe:200,sF:20,aBs:150,aBe:196,sB:20,hx:-6,lFh:10,lBh:-6,lift:2},
      {lean:-12,hunch:0,head:6,jaw:50,aFs:166,aFe:206,sF:24,aBs:156,aBe:200,sB:24,hx:-6,lFh:10,lBh:-6,lift:3},
      {lean:16,hunch:22,head:-20,jaw:30,aFs:70,aFe:100,sF:-30,aBs:62,aBe:96,sB:-26,hx:4,lFh:24,lFk:2,lBh:-18,lBk:-30,smear:1,dt:4},
      {lean:22,hunch:26,head:-28,jaw:54,aFs:72,aFe:86,sF:-128,aBs:64,aBe:84,sB:-120,hx:6,lFh:28,lFk:4,lBh:-22,lBk:-32,fB:12,hit:1,ring:3,dt:6,flash:0},
      {lean:20,hunch:26,head:-26,jaw:50,aFs:72,aFe:86,sF:-128,aBs:64,aBe:84,sB:-120,hx:6,lFh:28,lFk:4,lBh:-22,lBk:-32,fB:12,ring:4,dt:4},
      {lean:14,hunch:22,head:-24,jaw:30,aFs:70,aFe:90,sF:-128,aBs:62,aBe:86,sB:-120,hx:3,lFh:20,lBh:-16,ring:5,dt:2},
      {lean:8,hunch:18,head:-22,jaw:22,hx:1}][i]},
    beat:{nome:'Ritmo (acelera a horda)',n:10,hit:[3,5,7],reach:60,dur:i=>[160,140,120,90,120,90,120,90,170,160][i],pose:i=>[
      {lean:2,hunch:12,head:-12,jaw:20,aFs:60,aFe:140,sF:-10,aBs:50,aBe:130,sB:-10,hx:-1},
      {lean:-4,hunch:6,head:-2,jaw:40,aFs:110,aFe:180,sF:10,aBs:40,aBe:100,sB:-30,hx:-3},
      {lean:-4,hunch:6,head:0,jaw:46,aFs:120,aFe:186,sF:14,aBs:44,aBe:104,sB:-30,hx:-3},
      {lean:8,hunch:16,head:-14,jaw:30,aFs:70,aFe:92,sF:-130,aBs:110,aBe:180,sB:10,hit:1,ring:1,dt:3,hx:1},
      {lean:6,hunch:14,head:-12,jaw:48,aFs:110,aFe:180,sF:10,aBs:120,aBe:186,sB:14,ring:2,hx:0},
      {lean:8,hunch:16,head:-14,jaw:30,aFs:110,aFe:180,sF:10,aBs:62,aBe:88,sB:-122,hit:1,ring:3,dt:-3,hx:1},
      {lean:6,hunch:12,head:-8,jaw:52,aFs:130,aFe:196,sF:18,aBs:126,aBe:192,sB:18,ring:4,hx:-1,lift:2},
      {lean:14,hunch:20,head:-24,jaw:56,aFs:72,aFe:88,sF:-128,aBs:64,aBe:86,sB:-120,hit:1,ring:5,dt:5,hx:3,lFh:22,lBh:-16},
      {lean:12,hunch:20,head:-24,jaw:40,aFs:70,aFe:90,sF:-128,aBs:62,aBe:86,sB:-120,ring:6,dt:2,hx:2},
      {lean:8,hunch:18,head:-22,jaw:22,hx:1}][i]},
    hurt:{nome:'Dano (cabeça)',n:4,dur:i=>[80,110,130,150][i],pose:i=>[
      {lean:-8,hunch:4,head:-2,jaw:34,aFs:-10,aFe:30,sF:30,aBs:-16,aBe:20,sB:30,hx:-6,flash:1,lFh:14,lBh:-4,dt:-6},
      {lean:-4,hunch:8,head:-8,jaw:30,aFs:0,aFe:40,sF:20,aBs:-6,aBe:30,sB:20,hx:-5,lFh:12,lBh:-6,dt:-4},
      {lean:4,hunch:14,head:-18,jaw:26,aFs:20,aFe:70,sF:-10,aBs:12,aBe:60,hx:-2,dt:-2},
      {lean:7,hunch:17,head:-21,jaw:22,hx:0}][i]},
    hurtB:{nome:'Dano (no surdo, dobra)',n:4,dur:i=>[80,120,140,150][i],pose:i=>[
      {lean:30,hunch:34,head:-2,jaw:40,aFs:50,aFe:20,sF:40,aBs:44,aBe:14,sB:40,hx:-8,flash:1,lFh:20,lFk:-14,lBh:-14,lBk:-30,dt:10},
      {lean:26,hunch:32,head:-6,jaw:36,aFs:46,aFe:24,sF:30,aBs:40,aBe:20,sB:30,hx:-7,lFh:18,lFk:-12,lBh:-14,lBk:-28,dt:8},
      {lean:16,hunch:26,head:-16,jaw:28,aFs:40,aFe:70,aBs:30,aBe:66,hx:-3,dt:4},
      {lean:9,hunch:19,head:-21,jaw:22,hx:-1}][i]},
    fall:{nome:'Derrubado',n:6,dur:i=>[90,90,90,110,140,260][i],pose:i=>[
      {lean:-12,hunch:4,head:-2,jaw:34,aFs:-40,aFe:-20,sF:20,aBs:-46,aBe:-30,sB:20,hx:-6,flash:1,lFh:20,lBh:0,dt:-8},
      {rot:-30,lean:-4,hunch:8,head:-4,jaw:30,aFs:-60,aFe:-40,aBs:-70,aBe:-50,hx:-4,lFh:40,lFk:30,lBh:20,lBk:10},
      {rot:-62,lean:0,hunch:10,head:-8,jaw:28,aFs:-90,aFe:-70,aBs:-96,aBe:-80,hx:-6,lFh:50,lFk:40,lBh:30,lBk:24},
      {rot:-90,lean:4,hunch:12,head:-6,jaw:36,aFs:-110,aFe:-120,aBs:-100,aBe:-110,hx:2,lFh:40,lFk:10,lBh:30,lBk:4},
      {rot:-84,lean:2,hunch:14,head:-12,jaw:30,aFs:-120,aFe:-140,aBs:-104,aBe:-126,hx:2,lFh:46,lFk:20,lBh:34,lBk:10},
      {rot:-90,lean:0,hunch:12,head:-8,jaw:34,aFs:-130,aFe:-150,aBs:-110,aBe:-136,hx:2,lFh:40,lFk:6,lBh:26,lBk:0}][i]},
    getup:{nome:'Levantar',n:6,dur:i=>[200,170,170,160,160,150][i],pose:i=>[
      {rot:-90,lean:0,hunch:12,head:-8,jaw:34,aFs:-130,aFe:-150,aBs:-110,aBe:-136,hx:2,lFh:40,lFk:6,lBh:26,lBk:0},
      {rot:-60,lean:10,hunch:20,head:-20,jaw:24,aFs:-50,aFe:-10,aBs:-60,aBe:-20,hx:-8,lFh:90,lFk:10,lBh:70,lBk:0},
      {rot:-30,lean:20,hunch:24,head:-30,jaw:20,aFs:-10,aFe:10,aBs:-20,aBe:0,hx:-6,lFh:110,lFk:10,lBh:60,lBk:-60},
      {rot:0,lean:30,hunch:24,head:-34,jaw:20,aFs:30,aFe:10,aBs:20,aBe:4,hx:-4,lFh:78,lFk:-2,lBh:6,lBk:-86,fB:60},
      {rot:0,lean:18,hunch:22,head:-28,jaw:18,aFs:30,aFe:70,aBs:20,aBe:60,hx:-1,lFh:34,lFk:-14,lBh:-12,lBk:-40},
      {lean:8,hunch:18,head:-22,jaw:20}][i]},
    death:{nome:'Morte (o surdo rola e estoura)',n:8,dur:i=>[90,150,160,170,150,140,160,600][i],pose:i=>[
      {lean:-10,hunch:4,head:2,jaw:40,aFs:-34,aFe:-16,sF:30,aBs:-40,aBe:-24,sB:30,hx:-5,flash:1,lFh:14,lBh:-4,dt:-10},
      {lean:-4,hunch:8,head:8,jaw:48,aFs:-10,aFe:4,aBs:-16,aBe:0,hx:-6,lFh:10,lBh:-8,dx:14,dr:20,burst:1},
      {lean:6,hunch:18,head:-4,jaw:46,aFs:4,aFe:6,aBs:0,aBe:2,hx:-4,lFh:40,lFk:-30,lBh:28,lBk:-50,fF:10,fB:30,dx:26,dr:50,burst:1},
      {lean:10,hunch:26,head:-10,jaw:48,aFs:6,aFe:4,aBs:2,aBe:0,hx:-2,lFh:14,lFk:-92,lBh:6,lBk:-96,fF:100,fB:100,dx:38,dr:80,burst:1},
      {rot:16,lean:12,hunch:30,head:-10,jaw:48,aFs:24,aFe:20,aBs:16,aBe:14,hx:0,lFh:2,lFk:-92,lBh:-6,lBk:-96,fF:90,fB:90,dx:46,dr:96,burst:1},
      {rot:50,lean:10,hunch:26,head:-14,jaw:44,aFs:70,aFe:90,aBs:56,aBe:76,hx:4,lFh:-20,lFk:-70,lBh:-28,lBk:-74,fF:60,fB:60,dx:52,dr:104,burst:1},
      {rot:86,lean:2,hunch:14,head:-6,jaw:40,aFs:150,aFe:170,aBs:110,aBe:150,hx:8,lFh:-4,lFk:-10,lBh:-8,lBk:-14,fF:10,fB:10,dx:56,dr:96,burst:1},
      {rot:90,lean:0,hunch:12,head:-2,jaw:42,aFs:160,aFe:176,aBs:116,aBe:156,hx:8,lFh:-2,lFk:-6,lBh:-6,lBk:-10,fF:6,fB:6,dx:56,dr:90,burst:1,drool:3}][i]},
  };
  const EXK=['hx','lean','hunch','head','aFs','aFe','aBs','aBe','lFh','lFk','lBh','lBk'];
  function exag(P,f){ if(f===1||Math.abs(P.rot)>4) return P; EXK.forEach(k=>{ P[k]=REST[k]+(P[k]-REST[k])*f; }); P.jaw=Math.min(58,mx(0,REST.jaw+(P.jaw-REST.jaw)*f)); return P; }
  const EXF={idle:1.06,walk:1.1,alert:1.15,attack:1.22,drum:1.15,beat:1.1,hurt:1.3,hurtB:1.25,fall:1.1,getup:1.08,death:1.1};
  ZREACT.add(ANIMS,REST,{moves:{backhand:["swipe","Tapa de revés (com a baqueta)"]}}); // reações (voando, agarrado) + golpe extra
  function poseOf(anim,i){ return exag(Object.assign({},REST,ANIMS[anim].pose(i)),EXF[anim]||1); }
  function heavyOutline(cv){ const g=cv.getContext('2d'), W=cv.width, H=cv.height, im=PIX.pix(cv), d=im.data;
    const isO=i=>d[i+3]===255&&d[i]===0x17&&d[i+1]===0x0b&&d[i+2]===0x1c, fill=i=>d[i+3]===255&&!isO(i);
    const add=[]; for(let y=2;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(d[i+3]) continue; const u=((y-1)*W+x)*4, u2=((y-2)*W+x)*4; if(isO(u)&&fill(u2)) add.push(i); }
    add.forEach(i=>{ d[i]=0x17; d[i+1]=0x0b; d[i+2]=0x1c; d[i+3]=255; }); g.putImageData(im,0,0); }

  /* ---------- esqueleto (corpo médio, ombros fortes de quem bate tambor) ---------- */
  const SPINE=40, TH=20, SH=19, UA=15, FA=14, VS=SPINE/37, US=1.16, HB=12, HS=1.2;
  const lp=(p,a,L)=>({x:p.x+Math.sin(rad(a))*L, y:p.y+Math.cos(rad(a))*L});
  function build(P,dy){
    const R=P.rot, hip={x:AX+P.hx, y:dy};
    const ra=rad(R), rc=Math.cos(ra), rs=Math.sin(ra);
    const HR=(lx,ly)=>({x:hip.x+lx*rc-ly*rs, y:hip.y+lx*rs+ly*rc});
    const hipF=HR(3,0), hipB=HR(-3,0);
    const kneeF=lp(hipF,P.lFh-R,TH), ankleF=lp(kneeF,P.lFk-R,SH), kneeB=lp(hipB,P.lBh-R,TH), ankleB=lp(kneeB,P.lBk-R,SH);
    const SS=[]; let x=hip.x, y=hip.y;
    for(let k=0;k<=SPINE;k++){ const t=k/SPINE, a=rad(R+P.lean+(P.hunch+HB)*Math.pow(t,1.3)); SS.push({x,y,a}); x+=Math.sin(a); y-=Math.cos(a); }
    const SP=(u,v)=>{ const f=Math.max(0,-v), k=Math.min(SPINE,Math.floor(f)), s=SS[k], r=f-k, a=s.a;
      const px=s.x+Math.sin(a)*r, py=s.y-Math.cos(a)*r; return {x:px+Math.cos(a)*u, y:py+Math.sin(a)*u}; };
    const T=(u,v)=>SP(u*US,v*VS);
    const top=SS[SPINE], neck=T(1,-37), sa=top.a;
    const shF=T(4,-31), shB=T(-4,-32);
    const elF=lp(shF,P.aFs-R,UA), wrF=lp(elF,P.aFe-R,FA), elB=lp(shB,P.aBs-R,UA), wrB=lp(elB,P.aBe-R,FA);
    const ha=sa+rad(P.head-HB*0.8), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:neck.x+(lx*hc-ly*hs)*HS, y:neck.y+(lx*hs+ly*hc)*HS});
    // surdo: preso na cintura, pende quase na vertical (alça), segue o giro do corpo
    const loose=P.dx!=null;
    const dA=loose?{x:AX+P.dx,y:GROUND-13}:T(8.6,-3), dR=loose?rad(P.dr):ra+(SS[8].a-ra)*0.3+rad(P.dt);
    const D=(lx,ly)=>({x:dA.x+lx*Math.cos(dR)-ly*Math.sin(dR), y:dA.y+lx*Math.sin(dR)+ly*Math.cos(dR)});
    const toe=(a,f)=>{ const t=rad(f+R); return {x:a.x+(11*Math.cos(t)-5*Math.sin(t))*1.3, y:a.y+(11*Math.sin(t)+5*Math.cos(t))*1.3}; };
    const hull=[[ankleF,6],[ankleB,6],[toe(ankleF,P.fF),0.8],[toe(ankleB,P.fB),0.8],[kneeF,5],[kneeB,5],[hip,9],[T(0,-18),11],[T(-2,-30),11],[H(3,-11),11],[wrF,4],[wrB,4],[elF,4],[elB,4]];
    if(!loose) hull.push([D(12,13),2]);
    return {R,hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,SP,T,sa,neck,shF,shB,elF,wrF,elB,wrB,ha,H,hull,ra,dA,dR,D,loose};
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
  const Dl=(sk,list)=>list.map(([u,v])=>{ const q=sk.D(u,v); return [q.x,q.y]; });

  /* ---------- braços: antebraço com veias saltadas, baqueta na mão ---------- */
  function drawArm(c,u,M,sk,P,front,form){
    const p=mkPen(c,u), sh=front?sk.shF:sk.shB, el=front?sk.elF:sk.elB, wr=front?sk.wrF:sk.wrB; p._c=c; p.id();
    limb(p,M.skin,sh,el,11.6,10.2,{});
    const n=limb(p,M.skin,el,wr,10.6,8.8,{});
    p.F(M.skin[0]); p.circle(lerp(el,wr,0.06),1.1);
    // veias marcadas (de tanto bater)
    p.F(M.vein[1]); const v0=lerp(el,wr,0.15), v1=lerp(el,wr,0.5), v2=lerp(el,wr,0.85);
    p.cap({x:v0.x-n.nx*1.6,y:v0.y-n.ny*1.6},{x:v1.x-n.nx*0.6,y:v1.y-n.ny*0.6},0.7,0.6); p.cap({x:v1.x-n.nx*0.6,y:v1.y-n.ny*0.6},{x:v2.x-n.nx*1.8,y:v2.y-n.ny*1.8},0.6,0.5);
    p.cap({x:v1.x-n.nx*0.6,y:v1.y-n.ny*0.6},{x:v2.x+n.nx*0.4,y:v2.y+n.ny*0.4},0.5,0.5);
    if(form!=='comum'){ p.F(M.vein[0]); p.cap({x:v1.x-n.nx*0.8,y:v1.y-n.ny*0.8},{x:v2.x-n.nx*1.9,y:v2.y-n.ny*1.9},0.4,0.3); }
    p.F(M.rot[1]); const r1=lerp(sh,el,0.7); p.ell(r1.x+n.nx*1,r1.y+n.ny*1,1.6,1.2);
    if(front){ p.F(M.flesh[2]); const w=lerp(el,wr,0.62); p.ell(w.x+n.nx*1.6,w.y+n.ny*1.6,1.8,1.2,Math.atan2(wr.y-el.y,wr.x-el.x)); p.F(M.flesh[1]); p.rect(w.x+n.nx*1.6-0.5,w.y+n.ny*1.6-0.5,1,1); }
    // manga curta da camisa de bloco
    const s1=lerp(sh,el,0.46);
    limb(p,M.shirt,sh,s1,14.6,13.4,{hl:0.5});
    const sn=sideN(sh,el), sd={x:(el.x-sh.x)/sn.L,y:(el.y-sh.y)/sn.L};
    p.F(M.print[1]); const pm=lerp(sh,el,0.24); p.ell(pm.x-sn.nx*2,pm.y-sn.ny*2,2,1.4); p.ell(pm.x+sn.nx*3,pm.y+sn.ny*3+1,1.6,1.2);
    p.F(M.shirt[3]); p.cap({x:s1.x-sn.nx*6,y:s1.y-sn.ny*6},{x:s1.x+sn.nx*6,y:s1.y+sn.ny*6},1,1);
    p.F(M.shirt[2]); for(let k=-2;k<=2;k++){ const b={x:s1.x+sn.nx*k*2.4,y:s1.y+sn.ny*k*2.4}, L=k%2?2.2:1; p.poly([[b.x-sn.nx,b.y-sn.ny],[b.x+sn.nx,b.y+sn.ny],[b.x+sd.x*L,b.y+sd.y*L]]); }
    drawStick(p,M,el,wr,P,front);
    drawHand(p,M,el,wr,P,front);
  }
  function drawStick(p,M,el,wr,P,front){
    // baqueta: sai do punho no ângulo do antebraço + sF/sB; a de trás é partida (ponta lascada)
    const fa=Math.atan2(wr.x-el.x,wr.y-el.y)*180/PI, a=rad(fa+(front?P.sF:P.sB)), d={x:Math.sin(a),y:Math.cos(a)};
    const L=front?19:13, h={x:wr.x+(wr.x-el.x)/14*5,y:wr.y+(wr.y-el.y)/14*5};
    const b0={x:h.x-d.x*4,y:h.y-d.y*4}, b1={x:h.x+d.x*L,y:h.y+d.y*L};
    p.F(M.stick[1]); p.cap(b0,b1,2.6,front?2.2:2.4);
    const n=sideN(b0,b1); p.F(M.stick[2]); p.cap({x:b0.x+n.nx*0.6,y:b0.y+n.ny*0.6},{x:b1.x+n.nx*0.6,y:b1.y+n.ny*0.6},1.2,1);
    p.F(M.stick[0]); p.cap({x:lerp(b0,b1,0.3).x-n.nx*0.6,y:lerp(b0,b1,0.3).y-n.ny*0.6},{x:lerp(b0,b1,0.85).x-n.nx*0.6,y:lerp(b0,b1,0.85).y-n.ny*0.6},0.6,0.5);
    if(front){ // cabeça de feltro da maceta, suja de sangue
      p.F(M.linen[1]); p.circle(b1,3.4); p.F(M.linen[2]); p.circle({x:b1.x+n.nx*0.9,y:b1.y+n.ny*0.9},2.4); p.F(M.linen[0]); p.circle({x:b1.x-n.nx*1.2,y:b1.y-n.ny*1.2},1);
      p.F(M.blood[1]); p.rect(b1.x+d.x*1.2-0.8,b1.y+d.y*1.2-0.6,1.6,1.4);
    } else { // ponta lascada
      p.F(M.stick[3]); p.poly([[b1.x-n.nx*1.3,b1.y-n.ny*1.3],[b1.x+d.x*3.6,b1.y+d.y*3.6],[b1.x+n.nx*0.2+d.x*1.4,b1.y+n.ny*0.2+d.y*1.4],[b1.x+n.nx*1.3+d.x*2.6,b1.y+n.ny*1.3+d.y*2.6],[b1.x+n.nx*1.3,b1.y+n.ny*1.3]]);
      p.F(M.stick[0]); p.rect(b1.x+d.x*2-0.4,b1.y+d.y*2-0.4,0.8,0.8);
    }
    p.F(M.strap[2]); const g=lerp(b0,b1,0.06); p.cap({x:g.x-n.nx*1.6,y:g.y-n.ny*1.6},{x:g.x+n.nx*1.6,y:g.y+n.ny*1.6},1.1,1.1); // fita na empunhadura
  }
  function drawHand(p,M,el,wr,P,front){
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y); p._c.scale(1.34,1.34);
    // punho fechado na baqueta
    p.F(M.skin[1]); p.poly([[-1,-3.4],[4.4,-3.8],[6,-1],[5.6,3.4],[-1,3.6]]);
    p.F(M.skin[2]); p.poly([[-1,1.4],[5.8,1.2],[5.6,3.4],[-1,3.6]]);
    p.F(M.skin[0]); p.rect(0.4,-3.2,3.6,0.9);
    for(let k=0;k<4;k++){ const y0=-2.8+k*1.9; p.F(M.skin[1]); p.ell(6,y0,1.7,1.05); p.F(M.skin[2]); p.rect(5.4,y0+0.4,1.6,0.5); p.F(M.nail[1]); p.rect(6.6,y0-0.4,0.8,0.7); }
    p.F(M.skin[1]); p.cap(P2(1.6,-3.2),P2(5,-4.6),1.8,1.4); p.F(M.skin[3]); p.rect(2,0.6,3,0.6);
    p.id();
  }

  /* ---------- pernas: calça de linho curta, tamancos ---------- */
  function drawLeg(c,u,M,sk,P,front){
    const p=mkPen(c,u), hip=front?sk.hipF:sk.hipB, knee=front?sk.kneeF:sk.kneeB, ank=front?sk.ankleF:sk.ankleB; p.id();
    const n=limb(p,M.skin,knee,ank,8.2,7,{hl:0.5});
    p.F(M.rot[1]); const r=lerp(knee,ank,0.7); p.ell(r.x-n.nx*0.8,r.y-n.ny*0.8,1.3,1.9,Math.atan2(ank.y-knee.y,ank.x-knee.x)+PI/2);
    if(front){ p.F(M.vein[1]); p.cap(lerp(knee,ank,0.6),lerp(knee,ank,0.95),0.5,0.4); p.F(M.blood[2]); const b=lerp(knee,ank,0.66); p.rect(b.x+n.nx*1.4,b.y-1,1,2.4); }
    // calça de linho até o meio da canela, barra dobrada
    const kb=lerp(hip,knee,1.34);
    limb(p,M.linen,hip,kb,13.6,11.6,{hl:0.55});
    const kn=sideN(hip,knee), dir={x:(knee.x-hip.x)/kn.L,y:(knee.y-hip.y)/kn.L};
    const cuff=lerp(hip,knee,1.24);
    p.F(M.linen[2]); p.cap({x:cuff.x-kn.nx*6,y:cuff.y-kn.ny*6},{x:cuff.x+kn.nx*6,y:cuff.y+kn.ny*6},3,3);
    p.F(M.linen[0]); p.cap({x:cuff.x-kn.nx*5.6-dir.x*0.8,y:cuff.y-kn.ny*5.6-dir.y*0.8},{x:cuff.x+kn.nx*2-dir.x*0.8,y:cuff.y+kn.ny*2-dir.y*0.8},0.8,0.8);
    p.F(M.linen[3]); p.cap({x:kb.x-kn.nx*5.6,y:kb.y-kn.ny*5.6},{x:kb.x+kn.nx*5.6,y:kb.y+kn.ny*5.6},0.9,0.9);
    // dobras do linho amassado
    p.F(M.linen[2]); const f1=lerp(hip,kb,0.4), f2=lerp(hip,kb,0.66);
    p.cap({x:f1.x-kn.nx*3.6,y:f1.y-kn.ny*3.6},{x:f1.x-kn.nx*0.4+dir.x*2.6,y:f1.y-kn.ny*0.4+dir.y*2.6},0.8,0.7);
    p.cap({x:f2.x+kn.nx*1.6,y:f2.y+kn.ny*1.6},{x:f2.x+kn.nx*4.4+dir.x*1.4,y:f2.y+kn.ny*4.4+dir.y*1.4},0.8,0.7);
    p.F(M.linen[0]); const f3=lerp(hip,kb,0.22); p.cap({x:f3.x-kn.nx*3.4,y:f3.y-kn.ny*3.4},{x:f3.x-kn.nx*1.4+dir.x*3,y:f3.y-kn.ny*1.4+dir.y*3},0.8,0.7);
    if(front){ const t=lerp(hip,kb,0.5); p.F(M.blood[2]); p.ell(t.x+kn.nx*2.4,t.y+kn.ny*2.4,1.6,2.2,Math.atan2(dir.y,dir.x)); p.F(M.rot[2]); p.ell(t.x-kn.nx*3,t.y-kn.ny*3+3,1.2,0.9); }
    // tamanco: sola grossa de madeira + tira de couro
    const fa=rad((front?P.fF:P.fB)+sk.R); p.xf(fa,ank.x,ank.y); c.scale(1.3,1.3);
    p.F(M.skin[1]); p.poly([[-3.4,-1.6],[2.6,-1.8],[6.4,0.6],[10.2,1.8],[11,3],[-3.8,3]]);
    p.F(M.skin[2]); p.poly([[-3.8,1.6],[10.6,2.2],[11,3],[-3.8,3]]);
    p.F(M.skin[0]); p.rect(0.8,-1.2,3,0.8);
    p.F(M.clog[1]); p.poly([[-4.6,3],[11.6,2.8],[12.4,4.2],[11.6,6.2],[-4.4,6.2],[-5,4.4]]);
    p.F(M.clog[2]); p.poly([[-4.4,5],[12,4.8],[11.6,6.2],[-4.4,6.2]]); p.F(M.clog[3]); p.rect(-4.4,5.8,16,0.6);
    p.F(M.clog[0]); p.rect(-3.4,3,13.6,0.7);
    p.F(M.strap[1]); p.poly([[2.2,-1.4],[7.2,0.6],[8.4,3],[2.6,3]]); p.F(M.strap[0]); p.rect(3,-1,2.8,0.6); p.F(M.strap[3]); p.rect(6.6,1.6,1,1.4);
    [[9.2,2.2],[10.4,2.5]].forEach(([x,y])=>{ p.F(M.nail[1]); p.rect(x,y,0.8,0.6); });
    p.id();
  }

  /* ---------- tronco: camisa de bloco estampada, alça do surdo ---------- */
  const SHIRT=[[-8.4,3],[-9.4,-6],[-10.2,-16],[-10.8,-25],[-10,-32],[-7,-36.4],[-1.6,-38.4],[4,-37.8],[7.8,-34.6],[9.4,-28],[10.2,-20],[10.8,-12],[11,-4],[10.4,3]];
  function drawTorso(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    // cós da calça e cordão
    p.F(M.linen[1]); p.poly(W(sk,[[-8.8,-3],[10.8,-3],[10.6,5],[-8.8,5]]));
    p.F(M.linen[2]); p.poly(W(sk,[[-8.8,0.4],[10.8,0.4],[10.6,5],[-8.8,5]]));
    p.F(M.linen[3]); p.poly(W(sk,[[-8.8,-3.2],[10.8,-3.2],[10.8,-2.2],[-8.8,-2.2]]));
    const shape=W(sk,SHIRT);
    const paint=t=>clip(c,shape,()=>{ p.F(M.shirt[t]); p.poly(shape);
      // estampa de bloco: flores de 4 pétalas em grade escalonada (vermelho sobre amarelo)
      for(let row=0;row<6;row++) for(let col=0;col<4;col++){ const uu=-9+col*6.2+(row%2)*3.1, vv=-4-row*6.2;
        p.F(M.print[Math.min(3,t)]); [[0,-1.6],[1.6,0],[0,1.6],[-1.6,0]].forEach(([a,b])=>{ const q=Wp(sk,uu+a,vv+b); p.circle(q,1.25); });
        p.F(M.shirt[Math.min(3,t+1)]); const q=Wp(sk,uu,vv); p.rect(q.x-0.5,q.y-0.5,1,1); }
      // faixa horizontal vermelha da barra
      p.F(M.print[Math.min(3,t+1)]); p.poly(W(sk,[[-14,-1],[14,-1],[14,1],[-14,1]])); });
    paint(1);
    clip(c,W(sk,[[1,-30],[5,-39],[12,-30],[12,-20],[13,-12],[9,-16],[5,-26]]),()=>paint(0));
    clip(c,W(sk,[[-14,4],[-14,-40],[-5,-40],[-6.6,-32],[-5.4,-22],[-3,-12],[1,-5],[13,-6],[13,4]]),()=>paint(2));
    clip(c,W(sk,[[-14,4],[-14,-40],[-9,-40],[-10,-30],[-8.6,-18],[-7,-8],[-5,4]]),()=>paint(3));
    // dobras / rasgos
    p.F(M.shirt[3]); [[[-5,-14],[0,-17],[0.6,-16.2],[-4.4,-13.2]],[[3,-24],[7.4,-26],[7.8,-25.2],[3.4,-23.2]]].forEach(f=>p.poly(W(sk,f)));
    p.F(M.shirt[0]); [[[-2,-21],[3,-23],[3.4,-22.2],[-1.6,-20.2]]].forEach(f=>p.poly(W(sk,f)));
    // gola aberta mostrando o peito podre
    p.F(M.shirt[2]); p.poly(W(sk,[[-2.2,-38.4],[4.4,-37.8],[6.4,-35],[3.6,-29],[1.2,-34],[-1.2,-35.6]]));
    p.F(M.skin[1]); p.poly(W(sk,[[-1,-37.8],[3.8,-37.2],[3.4,-30.6],[1.4,-34.4]]));
    p.F(M.skin[2]); p.poly(W(sk,[[-1,-37.8],[0.6,-37.6],[1.6,-34],[1.4,-34.4]]));
    p.F(M.rot[1]); const pr=Wp(sk,2.6,-34); p.ell(pr.x,pr.y,1.2,1.4);
    // rasgo nas costas com costelas
    p.F(M.shirt[3]); p.poly(W(sk,[[-9.6,-26],[-6,-28],[-3.6,-24.6],[-4.4,-18.6],[-7.4,-17],[-9.6,-20]]));
    p.F(M.flesh[3]); p.poly(W(sk,[[-9,-25.2],[-6.2,-27],[-4.4,-24.2],[-5,-19.4],[-7.4,-18],[-9,-20.4]]));
    p.F(M.flesh[1]); p.poly(W(sk,[[-8.4,-24.4],[-6.4,-25.8],[-5,-23.6],[-5.6,-20.2],[-7.4,-19],[-8.4,-21]]));
    p.F(form==='plenilunar'?M.bone[0]:M.bone[1]); [[-23.6],[-21]].forEach(([v])=>p.poly(W(sk,[[-8.6,v],[-5,v-0.8],[-5,v],[-8.6,v+0.8]])));
    p.F(M.blood[1]); p.poly(W(sk,[[-7,-17.4],[-6,-17.6],[-6.2,-13.4],[-6.8,-13.2]]));
    // alça de couro do surdo: do ombro de trás atravessando o peito até a cintura da frente
    if(!sk.loose){
      p.F(M.strap[1]); p.poly(W(sk,[[-5.4,-38],[-2,-38.6],[9.6,-6],[6.6,-5]]));
      p.F(M.strap[0]); p.poly(W(sk,[[-4.6,-38.2],[-3.6,-38.4],[7.8,-6.2],[7,-5.8]]));
      p.F(M.strap[3]); p.poly(W(sk,[[-2.4,-38.4],[-2,-38.6],[9.6,-6],[9,-5.8]]));
      p.F(M.hoop[1]); const fv=Wp(sk,3.4,-20); p.rect(fv.x-1.4,fv.y-1.4,2.8,2.8); p.F(M.hoop[3]); p.rect(fv.x-0.6,fv.y-0.6,1.2,1.2);
    }
    if(form==='plenilunar'){ p.F(M.bone[1]); [[-10.2,-30,-15,-33],[-10.6,-22,-15.6,-22]].forEach(([u0,v0,u1,v1])=>{ const a=Wp(sk,u0,v0+1.6), b=Wp(sk,u1,v1), d=Wp(sk,u0+0.6,v0-1.6); p.poly([[a.x,a.y],[b.x,b.y],[d.x,d.y]]); }); }
    if(form!=='comum'){ p.F(M.glow[1]); [[[-9,-25],[-11,-30],[-10.2,-30.4],[-8.4,-25.6]],[[-4.6,-18],[-1,-13],[-1.6,-12.4],[-5,-17.4]]].forEach(f=>p.poly(W(sk,f))); }
  }

  /* ---------- surdo ---------- */
  function drawDrum(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    const L=0, R=27, T=-12, B=12, cx=(L+R)/2, rx=(R-L)/2, ry=3.6;
    const ellP=(y0,top,k)=>{ k=k||1; const pts=[]; for(let i=0;i<=16;i++){ const a=(top?PI:0)+i/16*PI; pts.push([cx+Math.cos(a)*rx*k,y0+Math.sin(a)*ry*k]); } return pts; };
    // casco: cilindro com bandas verticais de luz (luz vem da direita/alto)
    const shellPts=Dl(sk,[[L,T],[R,T],...ellP(B,false)]);
    p.F(M.shell[1]); p.poly(shellPts);
    clip(c,shellPts,()=>{
      p.F(M.shell[2]); p.poly(Dl(sk,[[L-2,T-6],[L+7,T-6],[L+6,B+6],[L-2,B+6]]));
      p.F(M.shell[3]); p.poly(Dl(sk,[[L-2,T-6],[L+2.4,T-6],[L+2.4,B+6],[L-2,B+6]]));
      p.F(M.shell[0]); p.poly(Dl(sk,[[R-7,T-6],[R-4.4,T-6],[R-4.4,B+6],[R-7,B+6]]));
      // faixa pintada do bloco no meio do casco (vermelho e amarelo)
      p.F(M.print[1]); p.poly(Dl(sk,[[L-2,-3.4],[R+2,-3.4],[R+2,3.4],[L-2,3.4]]));
      p.F(M.shirt[1]); p.poly(Dl(sk,[[L-2,-1.2],[R+2,-1.2],[R+2,1.2],[L-2,1.2]]));
      p.F(M.print[3]); p.poly(Dl(sk,[[L-2,-3.4],[L+4,-3.4],[L+4,3.4],[L-2,3.4]]));
      p.F(M.print[0]); p.poly(Dl(sk,[[R-7,-3.4],[R-4.6,-3.4],[R-4.6,3.4],[R-7,3.4]]));
      // tirantes de metal
      [3.2,9.4,15.6,21.8].forEach((x,k)=>{ p.F(M.hoop[k===3?0:k===0?3:2]); p.poly(Dl(sk,[[x,T+2],[x+1.2,T+2],[x+1.2,B-2],[x,B-2]])); p.F(M.hoop[1]); p.poly(Dl(sk,[[x-0.6,B-4.4],[x+1.8,B-4.4],[x+1.8,B-2.6],[x-0.6,B-2.6]])); });
      // arranhões e sangue escorrido do aro
      p.F(M.blood[1]); p.poly(Dl(sk,[[17,T+1],[19,T+1],[18.6,T+8],[17.6,T+9]])); p.poly(Dl(sk,[[6,T+1],[7.4,T+1],[7,T+5]]));
      p.F(M.blood[2]); p.poly(Dl(sk,[[17.6,T+8],[18.6,T+8],[18.2,T+10.6]]));
      p.F(M.shell[3]); p.poly(Dl(sk,[[11,6],[15,5],[15.2,5.8],[11.2,6.8]]));
    });
    // aro de baixo
    p.F(M.hoop[2]); p.poly(Dl(sk,[[L-0.6,B-2.4],[R+0.6,B-2.4],...ellP(B+0.4,false,1.04)]));
    p.F(M.hoop[1]); p.poly(Dl(sk,[[R-9,B-2],[R+0.6,B-2],[R+0.6,B+0.4],[R-9,B+0.4]]));
    // pele de cima (vista de cima, elipse) e aro de cima
    p.F(M.hoop[2]); p.poly(Dl(sk,[...ellP(T,true),...ellP(T,false)].map(([x,y])=>[cx+(x-cx)*1.06,T+(y-T)*1.3])));
    p.F(M.hoop[1]); p.poly(Dl(sk,ellP(T-0.6,true).map(([x,y])=>[cx+(x-cx)*1.06,T-0.6+(y-T+0.6)*1.3])));
    if(P.burst){
      // pele estourada: buraco escuro com farrapos
      p.F(M.head[2]); p.poly(Dl(sk,[...ellP(T,true),...ellP(T,false)]));
      p.F(M.shell[3]); p.poly(Dl(sk,[[cx-9,T],[cx-5,T-2.2],[cx-1,T-1],[cx+3,T-2.6],[cx+8,T-0.6],[cx+5,T+1.6],[cx+1,T+2.6],[cx-5,T+2]]));
      p.F(M.head[1]); p.poly(Dl(sk,[[cx-9,T],[cx-6.6,T-1.2],[cx-6,T+0.6]])); p.poly(Dl(sk,[[cx+8,T-0.6],[cx+5.6,T-1.6],[cx+5.4,T+0.6]]));
    } else {
      p.F(M.head[1]); p.poly(Dl(sk,[...ellP(T,true),...ellP(T,false)]));
      p.F(M.head[0]); p.poly(Dl(sk,[[cx+2,T-2.6],[cx+9,T-1.8],[cx+11,T-0.4],[cx+5,T-1]]));
      p.F(M.head[2]); p.poly(Dl(sk,[[L+1,T],[cx-3,T+2.6],[cx+4,T+3.4],[L+4,T+2.4]]));
      // rachadura e mancha de sangue na pele
      p.F(M.head[3]); p.poly(Dl(sk,[[cx-6,T-1.6],[cx-2,T],[cx+1,T-0.4],[cx+4,T+1.6],[cx+3.6,T+2],[cx+0.6,T+0.4],[cx-2.2,T+0.8],[cx-6.4,T-1]]));
      p.F(M.blood[1]); p.ell(sk.D(cx+6,T+0.8).x,sk.D(cx+6,T+0.8).y,2,1.1);
      if(P.hit){ p.F(M.wave[0]); p.poly(Dl(sk,[[cx-5,T-1],[cx+5,T-1.6],[cx+7,T+0.6],[cx-3,T+1.4]])); }
    }
    if(form==='plenilunar'){ // ossos amarrados no aro
      p.F(M.bone[1]); [[4,T+3],[22,T+3]].forEach(([x,y])=>{ p.poly(Dl(sk,[[x-1.6,y-2],[x+1.6,y-2],[x+1,y+5],[x-1,y+5]])); p.F(M.bone[0]); p.poly(Dl(sk,[[x-1.6,y-2.8],[x+1.6,y-2.8],[x+1.6,y-1.6],[x-1.6,y-1.6]])); p.F(M.bone[1]); });
    }
    if(form!=='comum' && !P.burst){ p.F(M.glow[1]); p.poly(Dl(sk,[[cx-6,T-1.6],[cx-2,T],[cx+1,T-0.4],[cx+4,T+1.6],[cx+3.4,T+1.8],[cx+0.6,T+0.2],[cx-2.4,T+0.6]])); }
  }
  /* onda sonora saindo do surdo (FX na arte, sem sombreamento) */
  function drawRings(c,u,M,sk,P){
    const p=mkPen(c,u); p.id();
    const o=sk.D(13.5,-12), n=P.ring>=3?3:2;
    for(let k=0;k<n;k++){ const r=10+k*9+P.ring*6, ry=r*0.42, th=Math.max(1.4,3.2-k*0.7), pts=[];
      const sp=PI*0.62;
      for(let i=0;i<=14;i++){ const a=-PI/2-sp+2*sp*i/14; pts.push([o.x+Math.cos(a)*r,o.y+Math.sin(a)*ry]); }
      for(let i=14;i>=0;i--){ const a=-PI/2-sp+2*sp*i/14; pts.push([o.x+Math.cos(a)*(r-th),o.y+Math.sin(a)*(ry-th*0.6)]); }
      if(o.x+r>FW-2||o.x-r<2) continue;
      p.F(k===0?M.wave[0]:k===1?M.wave[1]:M.wave[2]); p.poly(pts);
      // arco de baixo (onda no chão em volta)
      if(P.ring>=3){ const q=[]; for(let i=0;i<=14;i++){ const a=PI/2-sp*0.7+1.4*sp*i/14; q.push([o.x+Math.cos(a)*r,o.y+20+Math.sin(a)*ry*0.6]); } for(let i=14;i>=0;i--){ const a=PI/2-sp*0.7+1.4*sp*i/14; q.push([o.x+Math.cos(a)*(r-th),o.y+20+Math.sin(a)*(ry*0.6-th*0.5)]); } p.F(M.wave[2]); p.poly(q); }
    }
    // notas/estalos: faíscas da batida
    p.F(M.wave[1]); [[-14,-8,1.1],[15,-10,1],[2,-16,1.2]].forEach(([x,y,r])=>p.circle({x:o.x+x*(1+P.ring*0.12),y:o.y+y},r));
  }

  /* ---------- cabeça: faixa de pano na testa, cabelo curto, boca no ritmo ---------- */
  function drawHead(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.xf(sk.ha,sk.neck.x,sk.neck.y); c.scale(HS,HS);
    // pescoço
    p.F(M.skin[1]); p.poly([[-4.4,4],[5,4],[5.6,-4],[-4,-6]]);
    p.F(M.skin[2]); p.poly([[-4.4,4],[-0.6,4],[-1.2,-5.4],[-4,-6]]);
    p.F(M.vein[1]); p.rect(2.4,-3,0.8,5);
    // crânio
    p.F(M.skin[1]); p.ell(2.2,-12.4,9.4,9.4);
    p.poly([[-3.6,-6],[11.2,-7.6],[12.4,-4.4],[6,-2.6],[-2,-3]]);
    p.F(M.skin[2]); p.poly([[-7.4,-15],[-5.2,-6],[0,-2.6],[6,-2.6],[2,-5],[-2,-9],[-3,-14],[-5.4,-18]]);
    p.F(M.skin[3]); p.poly([[-7.4,-14],[-6.6,-9],[-4.4,-5.2],[-5,-11]]);
    // orelha
    p.F(M.skin[1]); p.ell(-3,-11.4,2.3,3.2); p.F(M.skin[3]); p.ell(-2.8,-11.2,1,1.9); p.F(M.flesh[2]); p.rect(-4,-9,1.1,1.2);
    // cabelo curto crespo (cachos em massa) aparecendo acima da faixa
    p.F(M.hair[1]); p.poly([[-7.6,-14],[-6.6,-19.6],[-2,-22.6],[4,-22.8],[9,-20.4],[10.8,-17],[4,-18],[-3,-17.4],[-5.6,-13]]);
    p.F(M.hair[0]); [[-4,-21],[0,-22.2],[4,-22.2],[7.4,-21]].forEach(([x,y])=>p.circle(P2(x,y),1));
    p.F(M.hair[2]); [[-6,-17],[-2.6,-19.4],[2,-20],[6,-19.6]].forEach(([x,y])=>p.circle(P2(x,y),0.9));
    // faixa de pano (bloco) amarrada, com as pontas soltas atrás
    p.F(M.band[1]); p.poly([[-7.8,-15.4],[10.6,-17.6],[11.4,-14.4],[-7,-12]]);
    p.F(M.band[0]); p.poly([[-2,-15],[10.6,-17.6],[10.8,-16.6],[-1.6,-14.2]]);
    p.F(M.band[2]); p.poly([[-7.8,-15.4],[-3,-15.4],[-2.6,-12.6],[-7,-12]]);
    p.F(M.shirt[1]); [[2,-15.6],[6,-16.2]].forEach(([x,y])=>p.circle(P2(x,y),0.8));
    const sw=Math.sin(P.hx*0.8+P.jaw*0.05)*1.2;
    p.F(M.band[1]); p.poly([[-7.4,-14.6],[-12.6,-13+sw],[-13.4,-10.4+sw],[-7.2,-12.4]]); p.poly([[-7.4,-13.6],[-11,-8.6+sw],[-12.4,-6.4+sw],[-7,-12.2]]);
    p.F(M.band[3]); p.poly([[-12.6,-13+sw],[-13.4,-10.4+sw],[-12.4,-10.8+sw]]); p.rect(-8.2,-14.6,1.6,2.4);
    // sobrancelha pesada e olhos opacos
    p.F(M.skin[3]); p.poly([[4,-12.2],[11.6,-12.8],[11.8,-11.6],[4.4,-11.2]]);
    p.F(M.skin[3]); p.ell(8.2,-9.6,2.6,2);
    p.F(M.eye[1]); p.ell(8.6,-9.6,1.8,1.3); p.F(M.eye[0]); p.rect(8.2,-10.2,0.9,0.7); p.F(M.eye[2]); p.rect(9.4,-9.4,0.7,0.7);
    p.F(M.skin[3]); p.ell(12,-9.8,0.9,1.3); p.F(M.eye[1]); p.rect(11.7,-10.2,0.8,0.9);
    p.F(M.skin[2]); p.poly([[6,-8],[10.6,-7.6],[9.6,-6.8],[6.6,-6.8]]);
    // nariz largo
    p.F(M.skin[1]); p.poly([[11,-10],[14.4,-6.6],[13.6,-5.4],[11.2,-6]]);
    p.F(M.skin[3]); p.rect(12.6,-6,1.4,0.9); p.F(M.skin[0]); p.rect(12,-9,0.9,1.4);
    // boca de cima
    p.F(M.mouth[1]); p.poly([[5,-5],[13.2,-5.2],[13,-2.4],[5,-2.2]]);
    p.F(M.teeth[1]); [[6.8,-5.2,1.2,1.6],[8.4,-5.2,1.2,2],[10,-5.2,1.2,1.6],[11.6,-5.2,1,1.3]].forEach(([x,y,w,h])=>p.rect(x,y,w,h));
    p.F(M.rot[1]); p.ell(1,-8,1.6,1.2); p.F(M.rot[2]); p.rect(0.4,-8.4,1,0.9);
    if(form!=='comum'){ p.F(M.glow[0]); p.rect(8,-10.2,1.6,1.2); p.F(M.glow[1]); p.rect(11.7,-10.2,0.8,1); }
    p.id();
  }
  function drawJaw(c,u,M,sk,P){
    const p=mkPen(c,u); const h=sk.H(2.6,-3.6); p.xf(sk.ha+rad(P.jaw),h.x,h.y); c.scale(HS,HS);
    p.F(M.skin[1]); p.poly([[-2,-1.4],[10.8,-0.8],[11.8,1.6],[10.8,5.6],[6.4,7.4],[0.6,6.4],[-2.4,2.8]]);
    p.F(M.skin[2]); p.poly([[-2.4,2.8],[0.6,6.4],[6.4,7.4],[10.8,5.6],[9,5],[4,5.4],[0,3.6]]);
    p.F(M.skin[3]); p.poly([[1,6.4],[6.4,7.4],[9.4,6.4],[4,6.4]]);
    p.F(M.mouth[1]); p.poly([[2.6,-0.8],[10,-0.4],[10,1.4],[3,1.2]]);
    p.F(M.teeth[1]); [[4.2,-1,1.2,1.5],[5.8,-1,1.2,1.9],[7.4,-1,1.2,1.5],[9,-1,1,1.8]].forEach(([x,y,w,h])=>p.rect(x,y,w,h));
    p.F(M.skin[0]); p.rect(5.6,1.8,3.4,0.8);
    const L=2+(P.drool%4)*1.2+(P.jaw>30?2:0);
    p.F(M.blood[1]); p.poly([[9.6,4.8],[11.2,4.2],[10.8,4.2+L],[10.2,5.2+L]]); p.ell(10.5,5.2+L,1,1);
    p.id();
  }
  function drawMouthIn(c,u,M,sk,P){
    // interior da boca aberta (entre cabeça e mandíbula)
    if(P.jaw<16) return; const p=mkPen(c,u); p.id();
    const a=sk.H(5,-2.4), b=sk.H(13,-2.6), h=sk.H(2.6,-3.6), ja=sk.ha+rad(P.jaw), jc=Math.cos(ja), js=Math.sin(ja);
    const J=(x,y)=>({x:h.x+(x*jc-y*js)*HS,y:h.y+(x*js+y*jc)*HS}), d=J(10.4,0.6), e=J(3,0.6);
    p.F(M.mouth[2]); p.poly([[a.x,a.y],[b.x,b.y],[d.x,d.y],[e.x,e.y]]);
    p.F(M.mouth[3]); const m=lerp(lerp(a,b,0.3),lerp(e,d,0.3),0.5); p.circle(m,1.6);
  }
  function drawSmear(c,u,M,sk,P){
    const p=mkPen(c,u); p.id();
    const sh=sk.shF, w=sk.wrF, r=Math.hypot(w.x-sh.x,w.y-sh.y)+22, a1=Math.atan2(w.y-sh.y,w.x-sh.x);
    const n=10, pts=[]; for(let i=0;i<=n;i++){ const a=a1-1.5+1.55*i/n; pts.push([sh.x+Math.cos(a)*r,sh.y+Math.sin(a)*r]); }
    for(let i=n;i>=0;i--){ const a=a1-1.5+1.55*i/n, rr=r-3-6*(i/n); pts.push([sh.x+Math.cos(a)*rr,sh.y+Math.sin(a)*rr]); }
    p.F(M.stick[0]); p.poly(pts);
  }

  /* ---------- montagem ---------- */
  const cache=PIX.cache();
  function frame(form,anim,fi,step=5,Pov,pk){
    const K=PIX.getK(), key=(pk!=null?'#'+pk+'|'+form:form+'|'+anim+'|'+fi+'|'+step)+'@'+K;
    const hit=cache.get(key); if(hit){ cache.delete(key); cache.set(key,hit); return hit; }
    const P=Pov?Object.assign({},REST,Pov):poseOf(anim,fi), M=mats(form), sk=skeleton(P);
    const parts=[
      {back:true, draw:(c,u)=>drawArm(c,u,M,sk,P,false,form)},
      {back:true, draw:(c,u)=>drawLeg(c,u,M,sk,P,false)},
      {draw:(c,u)=>drawTorso(c,u,M,sk,P,form)},
      {draw:(c,u)=>drawLeg(c,u,M,sk,P,true)},
    ];
    const drum={draw:(c,u)=>drawDrum(c,u,M,sk,P,form)};
    if(!sk.loose) parts.push(drum);
    parts.push({draw:(c,u)=>{ drawHead(c,u,M,sk,P,form); drawMouthIn(c,u,M,sk,P); }}, {draw:(c,u)=>drawJaw(c,u,M,sk,P)});
    if(P.smear) parts.push({noShade:true, smear:true, noRim:true, draw:(c,u)=>drawSmear(c,u,M,sk,P)});
    parts.push({draw:(c,u)=>drawArm(c,u,M,sk,P,true,form)});
    if(sk.loose) parts.push(drum);
    if(P.ring) parts.push({noShade:true, noRim:true, smear:true, draw:(c,u)=>drawRings(c,u,M,sk,P)});
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM[form]}); if(step>=4) heavyOutline(cv);
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._eye=sc(sk.H(8.6,-9.6)); cv._mouth=sc(sk.H(10,-2)); cv._hand=sc(sk.wrF); cv._head=sc(sk.H(3,-13)); cv._drum=sc(sk.D(13.5,-12));
    cache.set(key,cv); if(cache.size>900) cache.delete(cache.keys().next().value);
    return cv;
  }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame,framePose:function(form,anim,P,key){ return frame(form,anim,0,5,P,key); }};
})();
