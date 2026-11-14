/* BARQUEIRO — fonte de arte (editável). Build: npm run art
   Zumbi Barqueiro (variante local do Ver-o-Peso): barqueiro da doca, encharcado. Chapéu de palha de aba larga
   esfarrapado, regata azul-esverdeada molhada colada no corpo, calça arregaçada, pés descalços com lodo e alga.
   Remo comprido de madeira escura (pá larga com sangue seco e um pedaço de rede enrolado) e rede de pesca no
   ombro com peixes secos. Pele verde-acinzentada úmida com brilho de limo; gotas caindo.
   Golpes: remada (arco de cima pra baixo, alcance longo), varrida (remo rente ao chão, acerta a fila) e rede
   (arremesso que prende). Hi-bit: honra PIX.getK(). */
const BARQUEIRO=(function(){
  const {rad,lerp,P2,mkPen,compose}=PIX;
  const FW=244, FH=160, GROUND=150, AX=88;
  const RIM={comum:'#bfe6e0', enluarado:'#9ff6ff', plenilunar:'#ffb46a'};

  /* ---------- materiais ---------- */
  function mats(form){
    const m={
      skin:['#d6e4d0','#98ac98','#62786a','#38484a'],
      slime:['#c8f0c0','#7ec89a','#4a8c70','#2a5448'],
      rot:['#b0b08e','#7a7860','#525050','#2e2836'],
      flesh:['#f6ae94','#c25a5e','#7a3a4a','#4a1c34'],
      bone:['#fff4d8','#dccfa6','#a09070','#605040'],
      straw:['#f4e2a0','#c8b06a','#8a7444','#524228'],
      tank:['#8ad0d8','#3e8a9a','#2a5c72','#183448'],
      pants:['#b8aa8c','#857a62','#5a5244','#34302a'],
      oar:['#a88a68','#6e5640','#48382c','#28201c'],
      blade:['#c4a47e','#8a6e4e','#5a4636','#32261e'],
      net:['#e6dcb4','#b4a67a','#7c6e50','#4a4030'],
      fish:['#e8e0c8','#b0a890','#787060','#463e38'],
      hair:['#4a5444','#30382e','#1e241e','#121612'],
      eye:['#f2fff0','#cce8c4','#8ab090','#506a58'],
      mouth:['#6e2e3a','#461826','#2a0c18','#18060e'],
      teeth:['#f4ecc0','#d0bc7c','#968450','#5a4c30'],
      blood:['#c84a3e','#8e2a2c','#5e1824','#3a0e1a'],
      nail:['#7a7a62','#4c4c3e','#30302a','#1a1a18'],
      water:['#f4ffff','#b8ecf4','#6ac0d8','#2a7aa0'],
      glow:['#fffbe0','#e8ecb0','#a8b07a','#646c4a'],
    };
    if(form==='enluarado'){
      m.skin=['#dcdcff','#a0a2e4','#686cae','#3c3a76']; m.slime=['#e8ffff','#7af4ff','#2ab0d8','#146a96'];
      m.rot=['#b8a6e0','#8470b0','#56468a','#33285e']; m.flesh=['#f0b0ff','#b866d8','#7a3a9e','#46206a']; m.blood=['#b46ad8','#7e3ea6','#542474','#34144a'];
      m.eye=['#ffffff','#b8fbff','#4ad8f0','#1a8aa8']; m.glow=['#effffe','#7af4ff','#2ab0d8','#146a96']; m.water=['#ffffff','#b8fbff','#5ae0f4','#1a8aa8'];
      m.tank=['#a8b0e8','#5c64b0','#3a4080','#22264e']; m.straw=['#e0dcd0','#aaa498','#74707a','#46424e'];
      m.pants=['#a6a6c4','#74749a','#4c4c70','#2c2c46']; m.net=['#e8ffff','#9ff0f4','#5ab8cc','#2a6a88'];
    }
    if(form==='plenilunar'){
      m.skin=['#ffcaa6','#e2806a','#a4424e','#5e1e36']; m.slime=['#ffb08a','#e2483a','#9a1e28','#56101a'];
      m.rot=['#d0806a','#9a4a4a','#682a3a','#3e1628']; m.flesh=['#ffc07a','#f06a3a','#a8302e','#5e1422']; m.blood=['#ff7a3a','#d43a26','#8a1c22','#4e0c18'];
      m.eye=['#fffbe0','#ffe04a','#ff8a2a','#b83a14']; m.glow=['#fff6c0','#ffb43a','#e0581e','#8a2414']; m.water=['#ffd0b0','#f06a4a','#b42a2a','#6a1018'];
      m.tank=['#a88070','#764a46','#4c2c34','#2c1822']; m.straw=['#e8c890','#b08a50','#7a5236','#462a22'];
      m.pants=['#9a8a7a','#6a5a52','#46383a','#2a1e22'];
    }
    return punch(m);
  }
  const NAMES={skin:'Pele',slime:'Limo e alga',rot:'Podridão',flesh:'Carne',bone:'Osso',straw:'Chapéu de palha',tank:'Regata molhada',pants:'Calça arregaçada',oar:'Cabo do remo',blade:'Pá do remo',net:'Rede de pesca',fish:'Peixe seco',hair:'Cabelo',eye:'Olho',teeth:'Dentes',blood:'Sangue',water:'Água',glow:'Brilho'};
  function sat(h,k){ const [r,g,b]=PIX.hexRgb(h), y=(r+g+b)/3; return PIX.toHex(y+(r-y)*k,y+(g-y)*k,y+(b-y)*k); }
  const NOPUNCH={water:1,glow:1};
  function punch(m){ const o={}; for(const k in m){ const r=m[k]; o[k]=NOPUNCH[k]?[r[0],r[1],r[2],r[3]]:[sat(r[0],1.1),sat(r[1],1.16),PIX.mix(sat(r[2],1.1),'#2a1a4c',0.2),PIX.mix(r[3],'#140a24',0.34)]; } return o; }

  /* ---------- poses ---------- */
  // ângulos: 0 = pendurado, + = pra frente. oa = ângulo absoluto do remo (0 = pá pra baixo, 90 = pra frente,
  // 180 = pra cima), preso na mão da frente. net = rede voando (0 = no ombro, 0..1 = no ar, 2 = aberta no chão).
  // drip = fase das gotas. splash = água espirrando da pá (impacto). puddle = poça (morte).
  const REST={hx:0,rot:0,lift:0,lean:10,hunch:22,head:-20,jaw:18,aFs:30,aFe:70,aBs:-6,aBe:14,oa:32,lFh:16,lFk:-8,lBh:-12,lBk:-24,fF:0,fB:0,net:0,drip:0,splash:0,puddle:0,grip:1,smear:0,flash:0};
  const S=Math.sin, C=Math.cos, PI=Math.PI, mx=Math.max;
  const ANIMS={
    idle:{nome:'Parado (apoiado no remo, pingando)',n:8,dur:()=>165,pose:i=>{ const p=i/8*PI*2, s=S(p);
      return {hunch:22+3*s, lean:10+1*s, head:-20+4*S(p-0.8), jaw:12+6*mx(0,S(p-0.4)), hx:0.5*S(p+0.5), oa:32+2*S(p),
        aFs:30+3*S(p-0.6), aFe:70+3*S(p-1), aBs:-6+3*S(p-0.3), aBe:14+4*S(p-0.8), drip:i}; }},
    walk:{nome:'Andar arrastando o remo',n:8,dur:()=>140,pose:i=>{ const p=i/8*PI*2;
      const lFh=12+18*S(p), lBh=-12+12*S(p+PI);
      return {lFh, lFk:lFh-22*mx(0,C(p))-3, lBh, lBk:lBh-10-12*mx(0,C(p+PI)), fF:-12*mx(0,C(p)), fB:22*mx(0,C(p+PI)),
        lean:12+2*Math.abs(S(p)), hunch:22+3*S(2*p-0.6), head:-20+5*S(2*p-1.4), jaw:14+4*S(2*p-1.8), hx:1.1*S(2*p),
        aFs:22+8*S(p+0.4), aFe:58+8*S(p), oa:-52+6*S(p), aBs:-4+14*S(p), aBe:14+12*S(p-0.5), drip:i}; }},
    alert:{nome:'Alerta (ergue o remo)',n:7,dur:i=>[180,110,160,120,200,180,170][i],pose:i=>[
      {},
      {hunch:16,head:-12,jaw:10,lean:6,aFs:40,aFe:90,oa:60,hx:-1},
      {hunch:10,head:-6,jaw:30,lean:4,aFs:70,aFe:130,oa:120,aBs:30,aBe:60,hx:-2,lFh:8,lBh:-10},
      {hunch:12,head:-10,jaw:44,lean:6,aFs:80,aFe:140,oa:150,aBs:40,aBe:80,hx:-2},
      {hunch:14,head:-14,jaw:48,lean:8,aFs:80,aFe:140,oa:156,aBs:40,aBe:80,hx:-1,drip:3},
      {hunch:20,head:-20,jaw:30,lean:10,aFs:50,aFe:100,oa:80,aBs:10,aBe:30,hx:1,lFh:14,lBh:-14},
      {hunch:22,head:-20,jaw:20,lean:10,hx:1}][i]},
    // ---- golpes (IA escolhe por distância/peso; hit = quadro do dano, reach = alcance em px) ----
    attack:{nome:'Remada (arco de cima pra baixo)',n:9,hit:4,reach:52,dur:i=>[150,150,170,60,90,120,130,140,150][i],pose:i=>[
      {lean:6,hunch:18,head:-16,jaw:14,aFs:40,aFe:90,oa:80,aBs:20,aBe:40,hx:-1},
      {lean:-6,hunch:8,head:-6,jaw:30,aFs:110,aFe:170,oa:170,aBs:60,aBe:110,hx:-4,lFh:12,lFk:-10,lBh:-10,lBk:-22},
      {lean:-12,hunch:2,head:2,jaw:40,aFs:150,aFe:200,oa:210,aBs:90,aBe:140,hx:-6,lFh:10,lFk:-10,lBh:-8,lBk:-22,lift:1},
      {lean:16,hunch:22,head:-20,jaw:44,aFs:100,aFe:120,oa:130,aBs:50,aBe:80,hx:6,lFh:26,lFk:4,lBh:-22,lBk:-32,fB:14,smear:1},
      {lean:28,hunch:28,head:-26,jaw:10,aFs:70,aFe:80,oa:76,aBs:30,aBe:50,hx:10,lFh:32,lFk:6,lBh:-26,lBk:-34,fB:18,smear:1,splash:1},
      {lean:28,hunch:28,head:-24,jaw:6,aFs:66,aFe:74,oa:70,aBs:26,aBe:46,hx:10,lFh:30,lFk:6,lBh:-26,lBk:-34,fB:18,splash:2},
      {lean:22,hunch:26,head:-22,jaw:12,aFs:56,aFe:72,oa:56,aBs:20,aBe:40,hx:7,lFh:26,lBh:-22,splash:3},
      {lean:14,hunch:24,head:-22,jaw:16,aFs:40,aFe:70,oa:34,aBs:6,aBe:24,hx:3,lFh:20,lBh:-16},
      {lean:10,hunch:22,head:-20,jaw:18,hx:1}][i]},
    sweep:{nome:'Varrida (remo rente ao chão)',n:9,hit:4,reach:50,dur:i=>[150,160,160,60,100,120,130,140,150][i],pose:i=>[
      {lean:8,hunch:22,head:-18,jaw:14,aFs:10,aFe:40,oa:-20,aBs:0,aBe:20,hx:-1},
      {lean:-4,hunch:14,head:-10,jaw:28,aFs:-30,aFe:-10,oa:-70,aBs:-20,aBe:0,hx:-5,lFh:14,lFk:-10,lBh:-8,lBk:-22},
      {lean:-8,hunch:10,head:-6,jaw:36,aFs:-50,aFe:-30,oa:-96,aBs:-30,aBe:-10,hx:-7,lFh:12,lFk:-10,lBh:-6,lBk:-22},
      {lean:20,hunch:30,head:-22,jaw:44,aFs:30,aFe:50,oa:40,aBs:10,aBe:30,hx:5,lFh:30,lFk:-6,lBh:-24,lBk:-36,fB:16,smear:1},
      {lean:30,hunch:36,head:-26,jaw:12,aFs:66,aFe:86,oa:96,aBs:40,aBe:60,hx:10,lFh:38,lFk:-10,lBh:-28,lBk:-40,fB:20,smear:1,splash:1},
      {lean:30,hunch:36,head:-24,jaw:8,aFs:80,aFe:100,oa:110,aBs:50,aBe:70,hx:11,lFh:38,lFk:-10,lBh:-28,lBk:-40,fB:20,splash:2},
      {lean:24,hunch:30,head:-22,jaw:14,aFs:70,aFe:90,oa:96,aBs:30,aBe:50,hx:8,lFh:30,lBh:-22,splash:3},
      {lean:14,hunch:24,head:-20,jaw:16,aFs:46,aFe:74,oa:44,aBs:6,aBe:22,hx:3,lFh:20,lBh:-16},
      {lean:10,hunch:22,head:-20,jaw:18,hx:1}][i]},
    net:{nome:'Rede (arremesso que prende)',n:9,hit:5,reach:66,dur:i=>[150,160,170,90,80,90,140,160,160][i],pose:i=>[
      {lean:6,hunch:18,head:-16,jaw:14,aFs:20,aFe:50,oa:0,aBs:20,aBe:60,hx:-1},
      {lean:-8,hunch:8,head:-6,jaw:28,aFs:10,aFe:30,oa:-10,aBs:-60,aBe:-20,hx:-4,lFh:12,lFk:-10,lBh:-10,lBk:-22,net:0.01},
      {lean:-12,hunch:4,head:-2,jaw:36,aFs:0,aFe:20,oa:-14,aBs:-110,aBe:-80,hx:-6,lFh:10,lFk:-10,lBh:-8,lBk:-22,net:0.02},
      {lean:16,hunch:22,head:-20,jaw:44,aFs:10,aFe:36,oa:-6,aBs:60,aBe:110,hx:6,lFh:28,lFk:4,lBh:-22,lBk:-32,fB:14,net:0.25},
      {lean:24,hunch:26,head:-24,jaw:30,aFs:20,aFe:46,oa:0,aBs:100,aBe:120,hx:8,lFh:30,lFk:6,lBh:-26,lBk:-34,fB:18,net:0.6},
      {lean:24,hunch:26,head:-24,jaw:20,aFs:20,aFe:46,oa:0,aBs:96,aBe:104,hx:8,lFh:30,lFk:6,lBh:-26,lBk:-34,fB:18,net:1},
      {lean:20,hunch:24,head:-22,jaw:16,aFs:24,aFe:56,oa:6,aBs:70,aBe:80,hx:6,lFh:24,lBh:-20,net:2},
      {lean:14,hunch:22,head:-20,jaw:16,aFs:28,aFe:64,oa:12,aBs:30,aBe:40,hx:3,lFh:20,lBh:-16},
      {lean:10,hunch:22,head:-20,jaw:18,hx:1}][i]},
    hurt:{nome:'Dano (cabeça)',n:4,dur:i=>[80,110,130,150][i],pose:i=>[
      {lean:-8,hunch:6,head:-2,jaw:30,aFs:0,aFe:30,oa:40,aBs:-30,aBe:-14,hx:-6,flash:1,lFh:14,lBh:-4,drip:2},
      {lean:-4,hunch:10,head:-8,jaw:26,aFs:10,aFe:40,oa:34,aBs:-20,aBe:-4,hx:-5,lFh:12,lBh:-6,drip:3},
      {lean:4,hunch:18,head:-16,jaw:22,aFs:24,aFe:60,oa:24,aBs:-10,aBe:8,hx:-2},
      {lean:9,hunch:21,head:-19,jaw:18,hx:0}][i]},
    hurtB:{nome:'Dano (barriga)',n:4,dur:i=>[80,120,140,150][i],pose:i=>[
      {lean:32,hunch:38,head:-4,jaw:36,aFs:40,aFe:20,oa:-10,aBs:34,aBe:-16,hx:-8,flash:1,lFh:20,lFk:-14,lBh:-14,lBk:-30,drip:4},
      {lean:28,hunch:36,head:-8,jaw:32,aFs:36,aFe:24,oa:-6,aBs:30,aBe:-10,hx:-7,lFh:18,lFk:-12,lBh:-14,lBk:-28,drip:5},
      {lean:18,hunch:30,head:-16,jaw:24,aFs:30,aFe:60,oa:10,aBs:18,aBe:14,hx:-3},
      {lean:11,hunch:23,head:-19,jaw:18,hx:-1}][i]},
    fall:{nome:'Derrubado',n:6,dur:i=>[90,90,90,110,140,260][i],pose:i=>[
      {lean:-12,hunch:6,head:-2,jaw:34,aFs:-40,aFe:-20,oa:-40,aBs:-46,aBe:-30,hx:-6,flash:1,lFh:20,lBh:0},
      {rot:-30,lean:-4,hunch:10,head:-4,jaw:30,aFs:-60,aFe:-40,oa:-70,aBs:-70,aBe:-50,hx:-4,lFh:40,lFk:30,lBh:20,lBk:10},
      {rot:-62,lean:0,hunch:12,head:-8,jaw:28,aFs:-90,aFe:-70,oa:-100,aBs:-96,aBe:-80,hx:-6,lFh:50,lFk:40,lBh:30,lBk:24},
      {rot:-90,lean:4,hunch:14,head:-6,jaw:36,aFs:-110,aFe:-120,oa:-92,aBs:-100,aBe:-110,hx:2,lFh:40,lFk:10,lBh:30,lBk:4,splash:1},
      {rot:-84,lean:2,hunch:16,head:-12,jaw:30,aFs:-120,aFe:-140,oa:-88,aBs:-104,aBe:-126,hx:2,lFh:46,lFk:20,lBh:34,lBk:10,splash:2},
      {rot:-90,lean:0,hunch:14,head:-8,jaw:34,aFs:-130,aFe:-150,oa:-90,aBs:-110,aBe:-136,hx:2,lFh:40,lFk:6,lBh:26,lBk:0}][i]},
    getup:{nome:'Levantar (apoiado no remo)',n:6,dur:i=>[200,170,170,160,160,150][i],pose:i=>[
      {rot:-90,lean:0,hunch:14,head:-8,jaw:34,aFs:-130,aFe:-150,oa:-90,aBs:-110,aBe:-136,hx:2,lFh:40,lFk:6,lBh:26,lBk:0},
      {rot:-60,lean:10,hunch:24,head:-20,jaw:24,aFs:-50,aFe:-10,oa:-20,aBs:-60,aBe:-20,hx:-8,lFh:90,lFk:10,lBh:70,lBk:0},
      {rot:-30,lean:20,hunch:28,head:-30,jaw:20,aFs:-10,aFe:10,oa:0,aBs:-20,aBe:0,hx:-6,lFh:110,lFk:10,lBh:60,lBk:-60},
      {rot:0,lean:32,hunch:28,head:-34,jaw:20,aFs:40,aFe:60,oa:10,aBs:20,aBe:4,hx:-4,lFh:78,lFk:-2,lBh:6,lBk:-86,fB:60},
      {rot:0,lean:20,hunch:26,head:-26,jaw:18,aFs:34,aFe:70,oa:16,aBs:4,aBe:20,hx:-1,lFh:34,lFk:-14,lBh:-12,lBk:-40},
      {lean:10,hunch:22,head:-20,jaw:18}][i]},
    death:{nome:'Morte (desaba numa poça)',n:8,dur:i=>[90,150,160,170,150,140,160,600][i],pose:i=>[
      {lean:-10,hunch:6,head:2,jaw:40,aFs:-34,aFe:-16,oa:40,aBs:-40,aBe:-24,hx:-5,flash:1,lFh:14,lBh:-4,drip:1},
      {lean:-4,hunch:10,head:8,jaw:48,aFs:-10,aFe:4,oa:60,aBs:-16,aBe:0,hx:-6,lFh:10,lBh:-8,drip:2},
      {lean:6,hunch:20,head:-4,jaw:46,aFs:4,aFe:6,oa:80,aBs:0,aBe:2,hx:-4,lFh:40,lFk:-30,lBh:28,lBk:-50,fF:10,fB:30,puddle:1},
      {lean:10,hunch:28,head:-10,jaw:48,aFs:6,aFe:4,oa:94,aBs:2,aBe:0,hx:-2,lFh:14,lFk:-92,lBh:6,lBk:-96,fF:100,fB:100,puddle:2},
      {rot:16,lean:12,hunch:32,head:-10,jaw:48,aFs:24,aFe:20,oa:96,aBs:16,aBe:14,hx:0,lFh:2,lFk:-92,lBh:-6,lBk:-96,fF:90,fB:90,puddle:3,splash:1},
      {rot:50,lean:10,hunch:28,head:-14,jaw:44,aFs:70,aFe:90,oa:96,aBs:56,aBe:76,hx:4,lFh:-20,lFk:-70,lBh:-28,lBk:-74,fF:60,fB:60,puddle:4,splash:2},
      {rot:86,lean:2,hunch:16,head:-6,jaw:40,aFs:150,aFe:170,oa:92,aBs:110,aBe:150,hx:8,lFh:-4,lFk:-10,lBh:-8,lBk:-14,fF:10,fB:10,puddle:5,splash:3},
      {rot:90,lean:0,hunch:14,head:-2,jaw:42,aFs:160,aFe:176,oa:90,aBs:116,aBe:156,hx:8,lFh:-2,lFk:-6,lBh:-6,lBk:-10,fF:6,fB:6,puddle:5}][i]},
  };
  const EXK=['hx','lean','hunch','head','aFs','aFe','aBs','aBe','lFh','lFk','lBh','lBk'];
  function exag(P,f){ if(f===1||Math.abs(P.rot)>4) return P; EXK.forEach(k=>{ P[k]=REST[k]+(P[k]-REST[k])*f; }); P.jaw=Math.min(54,mx(0,REST.jaw+(P.jaw-REST.jaw)*f)); return P; }
  const EXF={idle:1.06,walk:1.1,alert:1.15,attack:1.18,sweep:1.15,net:1.15,hurt:1.3,hurtB:1.25,fall:1.1,getup:1.08,death:1.1};
  ZREACT.add(ANIMS,REST,{moves:{shove:["swipe","Empurrão com o cabo"]}}); // reações (voando, agarrado) + golpe extra
  function poseOf(anim,i){ return exag(Object.assign({},REST,ANIMS[anim].pose(i)),EXF[anim]||1); }
  function heavyOutline(cv){ const g=cv.getContext('2d'), W=cv.width, H=cv.height, im=PIX.pix(cv), d=im.data;
    const isO=i=>d[i+3]===255&&d[i]===0x17&&d[i+1]===0x0b&&d[i+2]===0x1c, fill=i=>d[i+3]===255&&!isO(i);
    const add=[]; for(let y=2;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(d[i+3]) continue; const u=((y-1)*W+x)*4, u2=((y-2)*W+x)*4; if(isO(u)&&fill(u2)) add.push(i); }
    add.forEach(i=>{ d[i]=0x17; d[i+1]=0x0b; d[i+2]=0x1c; d[i+3]=255; }); g.putImageData(im,0,0); }

  /* ---------- esqueleto (magro e comprido, braços de remador) ---------- */
  const SPINE=40, TH=21, SH=20, UA=16, FA=15, VS=SPINE/37, US=1.1, HB=12, HS=1.2;
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
    // remo: preso no punho da frente; cabo curto pra trás, pá comprida pra frente
    const oa=rad(P.oa-R), od={x:Math.sin(oa),y:Math.cos(oa)}, gp={x:wrF.x+(wrF.x-elF.x)/FA*5,y:wrF.y+(wrF.y-elF.y)/FA*5};
    const o0={x:gp.x-od.x*14,y:gp.y-od.y*14}, o1={x:gp.x+od.x*40,y:gp.y+od.y*40}, o2={x:gp.x+od.x*62,y:gp.y+od.y*62};
    const toe=(a,f)=>{ const t=rad(f+R); return {x:a.x+(11*Math.cos(t)-5*Math.sin(t))*1.3, y:a.y+(11*Math.sin(t)+5*Math.cos(t))*1.3}; };
    const hull=[[ankleF,5.6],[ankleB,5.6],[toe(ankleF,P.fF),0.6],[toe(ankleB,P.fB),0.6],[kneeF,5],[kneeB,5],[hip,8],[T(0,-18),10],[T(-2,-30),10],[H(3,-11),12],[wrF,4],[wrB,4],[elF,4],[elB,4]];
    return {R,hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,SP,T,sa,neck,shF,shB,elF,wrF,elB,wrB,ha,H,hull,ra,od,gp,o0,o1,o2};
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

  /* ---------- braços: magros, molhados, com limo ---------- */
  function drawArm(c,u,M,sk,P,front,form){
    const p=mkPen(c,u), sh=front?sk.shF:sk.shB, el=front?sk.elF:sk.elB, wr=front?sk.wrF:sk.wrB; p._c=c; p.id();
    limb(p,M.skin,sh,el,10.4,9.2,{});
    const n=limb(p,M.skin,el,wr,9.4,8,{});
    p.F(M.skin[0]); p.circle(lerp(el,wr,0.06),1.1);
    // limo escorrendo e alga grudada
    p.F(M.slime[2]); const s0=lerp(sh,el,0.5); p.ell(s0.x+n.nx*1.6,s0.y+n.ny*1.6,1.8,2.6,Math.atan2(el.y-sh.y,el.x-sh.x));
    p.F(M.slime[1]); p.rect(s0.x+n.nx*1.6-0.5,s0.y+n.ny*1.6-1,1,1.4);
    p.F(M.slime[0]); const g=lerp(el,wr,0.4); p.rect(g.x-n.nx*1.6-0.5,g.y-n.ny*1.6-0.5,1,1); // brilho molhado
    p.F(M.rot[1]); const r1=lerp(el,wr,0.7); p.ell(r1.x+n.nx*1.2,r1.y+n.ny*1.2,1.6,1.1);
    if(front){ p.F(M.flesh[2]); const w=lerp(sh,el,0.3); p.ell(w.x-n.nx*1.2,w.y-n.ny*1.2,1.6,1.1); p.F(M.flesh[1]); p.rect(w.x-n.nx*1.2-0.5,w.y-n.ny*1.2-0.4,1,0.8); }
    if(!front) drawNetHand(p,M,el,wr,P);
    drawHand(p,M,el,wr,P,front);
  }
  function drawNetHand(p,M,el,wr,P){
    // mão de trás segura o bolo da rede enquanto ela não foi lançada
    if(P.net>0.2) return;
    const d={x:(wr.x-el.x)/FA,y:(wr.y-el.y)/FA}, c0={x:wr.x+d.x*6,y:wr.y+d.y*6};
    p.F(M.net[2]); p.ell(c0.x,c0.y+2,5,4);
    p.F(M.net[1]); p.ell(c0.x-0.6,c0.y+1.2,3.6,2.8);
    p.F(M.net[3]); for(let k=-2;k<=2;k++) p.rect(c0.x+k*1.8-0.3,c0.y-1,0.6,5);
    p.F(M.net[0]); p.rect(c0.x-2,c0.y,1.2,0.8);
  }
  function drawHand(p,M,el,wr,P,front){
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y); p._c.scale(1.34,1.34);
    p.F(M.skin[1]); p.poly([[-1,-3.4],[4.4,-3.8],[6,-1],[5.6,3.4],[-1,3.6]]);
    p.F(M.skin[2]); p.poly([[-1,1.4],[5.8,1.2],[5.6,3.4],[-1,3.6]]);
    p.F(M.skin[0]); p.rect(0.4,-3.2,3.6,0.9);
    for(let k=0;k<4;k++){ const y0=-2.8+k*1.9; p.F(M.skin[1]); p.ell(6,y0,1.7,1.05); p.F(M.skin[2]); p.rect(5.4,y0+0.4,1.6,0.5); p.F(M.nail[1]); p.rect(6.6,y0-0.4,0.8,0.7); }
    p.F(M.skin[1]); p.cap(P2(1.6,-3.2),P2(5,-4.6),1.8,1.4);
    p.F(M.slime[1]); p.rect(1,1.8,1.4,1);
    p.id();
  }
  /* ---------- remo ---------- */
  function drawOar(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    const {o0,o1,o2,od}=sk, n=sideN(o0,o2);
    // cabo
    p.F(M.oar[1]); p.cap(o0,o1,3,3.2);
    p.F(M.oar[2]); p.cap({x:o0.x+n.nx*0.8,y:o0.y+n.ny*0.8},{x:o1.x+n.nx*0.8,y:o1.y+n.ny*0.8},1.4,1.4);
    p.F(M.oar[0]); p.cap({x:lerp(o0,o1,0.15).x-n.nx*0.8,y:lerp(o0,o1,0.15).y-n.ny*0.8},{x:lerp(o0,o1,0.8).x-n.nx*0.8,y:lerp(o0,o1,0.8).y-n.ny*0.8},0.6,0.6);
    p.F(M.oar[3]); p.circle(o0,1.8); // ponta do cabo (punho em T gasto)
    p.cap({x:o0.x-n.nx*2.4,y:o0.y-n.ny*2.4},{x:o0.x+n.nx*2.4,y:o0.y+n.ny*2.4},1.4,1.4);
    // pá larga: losango alongado
    const m=lerp(o1,o2,0.55), wd=form==='plenilunar'?6.6:5.8;
    const blade=[[o1.x,o1.y],[m.x-n.nx*wd,m.y-n.ny*wd],[o2.x-n.nx*wd*0.7+od.x*1.6,o2.y-n.ny*wd*0.7+od.y*1.6],[o2.x+od.x*2.6,o2.y+od.y*2.6],[o2.x+n.nx*wd*0.7+od.x*1.6,o2.y+n.ny*wd*0.7+od.y*1.6],[m.x+n.nx*wd,m.y+n.ny*wd]];
    p.F(M.blade[1]); p.poly(blade);
    clip(c,blade,()=>{
      p.F(M.blade[2]); p.poly([[o1.x,o1.y],[m.x+n.nx*wd*1.2,m.y+n.ny*wd*1.2],[o2.x+n.nx*wd+od.x*4,o2.y+n.ny*wd+od.y*4],[o2.x+od.x*4,o2.y+od.y*4]]);
      p.F(M.blade[0]); p.poly([[lerp(o1,o2,0.2).x-n.nx*1.6,lerp(o1,o2,0.2).y-n.ny*1.6],[m.x-n.nx*wd*0.7,m.y-n.ny*wd*0.7],[lerp(o1,o2,0.86).x-n.nx*3.4,lerp(o1,o2,0.86).y-n.ny*3.4],[lerp(o1,o2,0.7).x-n.nx*1.4,lerp(o1,o2,0.7).y-n.ny*1.4]]);
      p.F(M.blade[3]); p.cap(lerp(o1,o2,0.1),lerp(o1,o2,0.96),0.6,0.6); // nervura
      // sangue seco e lodo na ponta
      p.F(M.blood[2]); p.poly([[lerp(o1,o2,0.7).x+n.nx*4,lerp(o1,o2,0.7).y+n.ny*4],[o2.x+n.nx*4+od.x*3,o2.y+n.ny*4+od.y*3],[o2.x+od.x*3,o2.y+od.y*3],[lerp(o1,o2,0.8).x,lerp(o1,o2,0.8).y]]);
      p.F(M.blood[1]); const bs=lerp(o1,o2,0.78); p.ell(bs.x+n.nx*2.4,bs.y+n.ny*2.4,1.4,1);
      p.F(M.slime[2]); p.poly([[o2.x-n.nx*6+od.x*1,o2.y-n.ny*6+od.y*1],[o2.x+od.x*4,o2.y+od.y*4],[lerp(o1,o2,0.86).x-n.nx*2,lerp(o1,o2,0.86).y-n.ny*2]]);
    });
    // pedaço de rede enrolado no pescoço do remo
    const r0=lerp(o1,o2,0.02); p.F(M.net[2]); p.cap({x:r0.x-n.nx*4,y:r0.y-n.ny*4},{x:r0.x+n.nx*4,y:r0.y+n.ny*4},2.6,2.6);
    p.F(M.net[1]); p.cap({x:r0.x-n.nx*3.6-od.x,y:r0.y-n.ny*3.6-od.y},{x:r0.x+n.nx*2-od.x,y:r0.y+n.ny*2-od.y},0.9,0.9);
    p.F(M.net[3]); p.cap({x:r0.x+n.nx*3,y:r0.y+n.ny*3},{x:r0.x+n.nx*4+od.x*7,y:r0.y+n.ny*4+od.y*7},0.6,0.5);
    if(form==='plenilunar'){ p.F(M.bone[1]); [0.3,0.55].forEach(t=>{ const q=lerp(o0,o1,t); p.cap({x:q.x-n.nx*4,y:q.y-n.ny*4},{x:q.x+n.nx*3.6+od.x*2,y:q.y+n.ny*3.6+od.y*2},1.2,0.9); }); p.F(M.bone[0]); const q=lerp(o0,o1,0.3); p.rect(q.x-n.nx*3-0.5,q.y-n.ny*3-0.5,1,1); }
    if(form!=='comum'){ p.F(M.slime[0]); p.cap(lerp(o1,o2,0.3),lerp(o1,o2,0.6),0.6,0.5); }
  }
  /* água espirrando da pá (impacto) */
  function drawSplash(c,u,M,sk,P){
    const p=mkPen(c,u); p.id();
    const o=sk.o2, s=P.splash;
    for(let k=0;k<9;k++){ const a=-PI*0.95+k/8*PI*0.9, r=4+s*6+(k%3)*2.4, x=o.x+Math.cos(a)*r*1.2, y=Math.min(GROUND-1,o.y+Math.sin(a)*r-s*2);
      if(x<2||x>FW-3||y<2) continue; p.F(k%3?M.water[1]:M.water[0]); p.circle({x,y},Math.max(0.8,2.2-s*0.4-(k%2)*0.5)); }
    if(s<=2){ p.F(M.water[2]); p.ell(o.x,Math.min(GROUND-1.5,o.y+2),6+s*3,1.6); p.F(M.water[1]); p.ell(o.x-1,Math.min(GROUND-2,o.y+1.4),3+s*2,0.8); }
  }
  /* gotas pingando (idle, andar, dano) */
  function drawDrips(c,u,M,sk,P){
    const p=mkPen(c,u); p.id();
    const srcs=[sk.H(-6,-16),sk.H(14,-15),sk.wrB,sk.T(4,0)], f=P.drip|0;
    srcs.forEach((s,k)=>{ const t=((f+k*3)%8)/8; if(t>0.7) return; const y=s.y+4+t*30, x=s.x+(k===1?2:0); if(y>GROUND-2) return;
      p.F(M.water[1]); p.ell(x,y,0.9,1.4); p.F(M.water[0]); p.rect(x-0.4,y-0.8,0.6,0.6); });
  }
  /* rede no ar / aberta no chão */
  function drawNet(c,u,M,sk,P){
    const p=mkPen(c,u); p.id();
    const t=Math.min(1,P.net), open=P.net>=2;
    const sx=sk.wrB.x, sy=sk.wrB.y, ex=AX+122, ey=GROUND-4;
    const cx=open?ex:lerp({x:sx,y:sy},{x:ex,y:ey},t).x, cy=open?ey:sy+(ey-sy)*t-Math.sin(t*PI)*26;
    const rx=open?27:6+t*18, ry=open?5.2:4.4+t*7;
    // corda até a mão
    if(!open){ p.F(M.net[2]); const n=8; for(let k=0;k<=n;k++){ const q={x:sx+(cx-sx)*k/n,y:sy+(cy-sy)*k/n+Math.sin(k/n*PI)*3}; p.circle(q,0.7); } }
    // malha: anel de chumbadas + raios + anéis concêntricos
    p.F(M.net[3]); p.ell(cx,cy,rx+0.8,ry+0.8);
    clip(c,(()=>{ const q=[]; for(let k=0;k<20;k++){ const a=k/20*PI*2; q.push([cx+Math.cos(a)*rx,cy+Math.sin(a)*ry]); } return q; })(),()=>{
      p.F(M.net[1]);
      for(let k=0;k<12;k++){ const a=k/12*PI*2; p.cap({x:cx,y:cy},{x:cx+Math.cos(a)*rx,y:cy+Math.sin(a)*ry},0.55,0.55); }
      [0.35,0.65,0.95].forEach(f=>{ for(let k=0;k<24;k++){ const a=k/24*PI*2, b=(k+1)/24*PI*2; p.cap({x:cx+Math.cos(a)*rx*f,y:cy+Math.sin(a)*ry*f},{x:cx+Math.cos(b)*rx*f,y:cy+Math.sin(b)*ry*f},0.5,0.5); } });
      p.F(M.net[0]); [0.65].forEach(f=>{ for(let k=0;k<6;k++){ const a=-PI*0.9+k*0.16; p.cap({x:cx+Math.cos(a)*rx*f,y:cy+Math.sin(a)*ry*f},{x:cx+Math.cos(a+0.16)*rx*f,y:cy+Math.sin(a+0.16)*ry*f},0.4,0.4); } });
    });
    // chumbadas na borda
    p.F(M.oar[3]); for(let k=0;k<10;k++){ const a=k/10*PI*2; p.circle({x:cx+Math.cos(a)*rx,y:cy+Math.sin(a)*ry},open?1.1:0.9); }
    // peixes secos presos na rede
    p.F(M.fish[1]); [[-0.4,0.2],[0.5,-0.3]].forEach(([a,b])=>{ const q={x:cx+a*rx,y:cy+b*ry}; p.ell(q.x,q.y,2.4,1); p.F(M.fish[2]); p.poly([[q.x+2,q.y],[q.x+3.6,q.y-1.2],[q.x+3.6,q.y+1.2]]); p.F(M.fish[1]); });
  }

  /* ---------- pernas: calça arregaçada, pés descalços com lodo ---------- */
  function drawLeg(c,u,M,sk,P,front){
    const p=mkPen(c,u), hip=front?sk.hipF:sk.hipB, knee=front?sk.kneeF:sk.kneeB, ank=front?sk.ankleF:sk.ankleB; p.id();
    const n=limb(p,M.skin,knee,ank,7.6,6.4,{hl:0.5});
    p.F(M.slime[2]); const r=lerp(knee,ank,0.75); p.ell(r.x+n.nx*0.8,r.y+n.ny*0.8,2.2,2.8,Math.atan2(ank.y-knee.y,ank.x-knee.x)); p.F(M.slime[1]); p.rect(r.x+n.nx*0.8-0.5,r.y+n.ny*0.8-1,1,1.2);
    if(front){ p.F(M.blood[2]); const b=lerp(knee,ank,0.45); p.rect(b.x-n.nx*1.4,b.y-1,1,2.6); }
    // calça arregaçada até o joelho, barra enrolada grossa e molhada
    const kb=lerp(hip,knee,1.12);
    limb(p,M.pants,hip,kb,12.8,11.4,{hl:0.55});
    const kn=sideN(hip,knee), dir={x:(knee.x-hip.x)/kn.L,y:(knee.y-hip.y)/kn.L};
    p.F(M.pants[2]); p.cap({x:kb.x-kn.nx*6,y:kb.y-kn.ny*6},{x:kb.x+kn.nx*6,y:kb.y+kn.ny*6},3.4,3.4);
    p.F(M.pants[0]); p.cap({x:kb.x-kn.nx*5.4-dir.x,y:kb.y-kn.ny*5.4-dir.y},{x:kb.x+kn.nx*1.6-dir.x,y:kb.y+kn.ny*1.6-dir.y},0.8,0.8);
    p.F(M.pants[3]); p.cap({x:kb.x-kn.nx*5,y:kb.y-kn.ny*5+1.6},{x:kb.x+kn.nx*5,y:kb.y+kn.ny*5+1.6},0.7,0.7);
    // parte molhada mais escura embaixo + dobras
    clip(c,(()=>{ const a=lerp(hip,kb,0.55); return [[a.x-kn.nx*9,a.y-kn.ny*9],[a.x+kn.nx*9,a.y+kn.ny*9],[kb.x+kn.nx*9+dir.x*4,kb.y+kn.ny*9+dir.y*4],[kb.x-kn.nx*9+dir.x*4,kb.y-kn.ny*9+dir.y*4]]; })(),()=>{ limb(p,M.pants,hip,kb,12.8,11.4,{hl:2,deep:true,sh:0.8}); });
    p.F(M.pants[2]); const f1=lerp(hip,kb,0.3); p.cap({x:f1.x-kn.nx*3.4,y:f1.y-kn.ny*3.4},{x:f1.x-kn.nx*0.4+dir.x*2.6,y:f1.y-kn.ny*0.4+dir.y*2.6},0.8,0.7);
    if(front){ p.F(M.slime[2]); const t=lerp(hip,kb,0.62); p.ell(t.x+kn.nx*3,t.y+kn.ny*3,1.6,2.4,Math.atan2(dir.y,dir.x)); p.F(M.rot[2]); p.rect(t.x-kn.nx*3,t.y-kn.ny*3,1.2,1); }
    // pé descalço comprido, lodo e alga nos dedos
    const fa=rad((front?P.fF:P.fB)+sk.R); p.xf(fa,ank.x,ank.y); c.scale(1.3,1.3);
    p.F(M.skin[1]); p.poly([[-3.6,-1.6],[3,-2],[8,0.6],[11.4,2.4],[11.4,4.6],[-4.2,4.8]]);
    p.F(M.skin[2]); p.poly([[-4.2,3],[11.4,3.4],[11.4,4.6],[-4.2,4.8]]);
    p.F(M.slime[2]); p.poly([[-4.2,3.6],[11.4,3.8],[11.4,4.6],[-4.2,4.8]]); p.F(M.slime[1]); p.rect(-2,2.8,3,0.8); p.rect(6,3,2,0.7);
    [[8.6,3],[10,3.4],[11.1,3.8]].forEach(([x,y])=>{ p.F(M.skin[1]); p.circle(P2(x,y),1); p.F(M.nail[2]); p.rect(x+0.1,y-0.4,0.7,0.7); });
    p.F(M.skin[0]); p.rect(1,-1.2,3,0.9);
    p.id();
  }

  /* ---------- tronco: regata molhada colada, rede no ombro ---------- */
  const TANK=[[-7.6,3],[-8.4,-6],[-9,-16],[-9.6,-25],[-8.8,-32],[-6.4,-36.6],[-4,-37.6],[-2.6,-31],[2,-30],[3.6,-37.4],[6.2,-35],[7.8,-28],[8.4,-20],[8.8,-12],[9.2,-4],[8.6,3]];
  function drawTorso(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    // ombros e peito à mostra (regata cavada)
    p.F(M.skin[1]); p.poly(W(sk,[[-8.4,-30],[-6,-38],[-1.6,-39],[4,-38.6],[7.6,-35],[8,-28],[-8.6,-26]]));
    p.F(M.skin[2]); p.poly(W(sk,[[-8.4,-30],[-6,-38],[-3.6,-38.6],[-5.6,-28]]));
    p.F(M.skin[3]); p.poly(W(sk,[[-1,-34],[3.4,-33.2],[1.4,-31]])); // clavícula
    p.F(M.slime[2]); p.ell(Wp(sk,5,-33).x,Wp(sk,5,-33).y,1.6,1.2);
    // cós da calça e cordinha amarrada
    p.F(M.pants[1]); p.poly(W(sk,[[-8,-3],[9.2,-3],[9,5],[-8,5]]));
    p.F(M.pants[2]); p.poly(W(sk,[[-8,0.6],[9.2,0.6],[9,5],[-8,5]]));
    p.F(M.net[2]); p.poly(W(sk,[[-8,-3.4],[9.2,-3.4],[9.2,-2.2],[-8,-2.2]])); p.F(M.net[1]); const kn=Wp(sk,6,-2.6); p.rect(kn.x-1,kn.y-1,2,2); p.poly(W(sk,[[6,-2],[7,-2],[7.6,3],[6.8,3]]));
    // regata: base + luz + sombra; colada no corpo (dobras molhadas)
    const shape=W(sk,TANK);
    const paint=t=>clip(c,shape,()=>{ p.F(M.tank[t]); p.poly(shape);
      p.F(M.tank[Math.min(3,t+1)]); [[-6,-10],[-2,-15],[2,-8],[4,-22]].forEach(([a,b])=>p.poly(W(sk,[[a,b],[a+4,b-2],[a+4.4,b-1.2],[a+0.4,b+0.8]]))); });
    paint(1);
    clip(c,W(sk,[[0,-30],[4,-38],[10,-30],[10,-14],[5,-18],[2,-26]]),()=>paint(0));
    clip(c,W(sk,[[-14,4],[-14,-40],[-5,-40],[-6,-30],[-4.6,-20],[-2,-10],[2,-5],[12,-6],[12,4]]),()=>paint(2));
    clip(c,W(sk,[[-14,4],[-14,-40],[-8.6,-40],[-9,-30],[-8,-18],[-6.4,-8],[-4.6,4]]),()=>paint(3));
    // brilhos de água na regata
    p.F(M.water[1]); [[5,-24],[6.6,-16],[-1,-20]].forEach(([a,b])=>{ const q=Wp(sk,a,b); p.rect(q.x-0.4,q.y-0.8,0.8,1.6); });
    // rasgo com carne e costela
    p.F(M.tank[3]); p.poly(W(sk,[[1,-14],[6,-15],[7,-9],[2.4,-7.6]]));
    p.F(M.flesh[1]); p.poly(W(sk,[[1.6,-13.4],[5.6,-14.2],[6.4,-9.4],[2.8,-8.2]]));
    p.F(form==='plenilunar'?M.bone[0]:M.bone[1]); [[-12.6],[-10.6]].forEach(([v])=>p.poly(W(sk,[[2,v],[6,v-0.6],[6,v+0.2],[2,v+0.8]])));
    p.F(M.blood[1]); p.poly(W(sk,[[3.4,-8],[4.2,-8.2],[4,-4.6],[3.6,-4.4]]));
    // barra da regata esfiapada
    p.F(M.tank[3]); for(let k=0;k<8;k++){ const q=Wp(sk,-7+k*2,-3); p.poly([[q.x-0.8,q.y-1],[q.x+0.8,q.y-1],[q.x,q.y+(k%2?2:1)]]); }
    // rede de pesca no ombro (de trás), caindo pelas costas, com peixes secos
    if(P.net<=0.02 || P.net>=2){
      const drape=W(sk,[[-3,-39],[1.4,-39.4],[-2,-26],[-6,-14],[-10.4,-12],[-11.4,-20],[-10,-32]]);
      p.F(M.net[2]); p.poly(drape);
      clip(c,drape,()=>{ p.F(M.net[3]); for(let k=0;k<7;k++){ p.poly(W(sk,[[-14+k*2.6,-42],[-13+k*2.6,-42],[-19+k*2.6,-8],[-20+k*2.6,-8]])); p.poly(W(sk,[[-14+k*2.6,-8],[-13+k*2.6,-8],[-7+k*2.6,-42],[-8+k*2.6,-42]])); }
        p.F(M.net[0]); p.poly(W(sk,[[-3,-39],[1.4,-39.4],[0.6,-36],[-3,-36]])); });
      // peixe seco pendurado
      const f0=Wp(sk,-9,-18); p.F(M.fish[1]); p.ell(f0.x,f0.y+3,1.6,3.4); p.F(M.fish[2]); p.ell(f0.x+0.6,f0.y+3.4,0.9,2.6); p.F(M.fish[3]); p.poly([[f0.x-1.6,f0.y+6],[f0.x+1.6,f0.y+6],[f0.x,f0.y+8]]); p.F(M.fish[0]); p.rect(f0.x-0.6,f0.y+1,1,1);
      p.F(M.oar[3]); [[-10.4,-12.6],[-6.4,-14.4],[-11,-20]].forEach(([a,b])=>{ const q=Wp(sk,a,b); p.circle(q,1); });
    }
    if(form==='plenilunar'){ p.F(M.bone[1]); [[-9.4,-28,-14,-31],[-9.6,-20,-14.6,-20]].forEach(([u0,v0,u1,v1])=>{ const a=Wp(sk,u0,v0+1.6), b=Wp(sk,u1,v1), d=Wp(sk,u0+0.6,v0-1.6); p.poly([[a.x,a.y],[b.x,b.y],[d.x,d.y]]); }); }
    if(form!=='comum'){ p.F(M.glow[1]); [[[-6,-30],[-3,-26],[-3.4,-25.6],[-6.4,-29.6]],[[-2,-18],[1,-13],[0.4,-12.6],[-2.4,-17.6]]].forEach(f=>p.poly(W(sk,f))); }
  }

  /* ---------- cabeça: chapéu de palha de aba larga, cabelo molhado com alga ---------- */
  function drawHead(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.xf(sk.ha,sk.neck.x,sk.neck.y); c.scale(HS,HS);
    p.F(M.skin[1]); p.poly([[-4,4],[4.6,4],[5.2,-4],[-3.6,-6]]);
    p.F(M.skin[2]); p.poly([[-4,4],[-0.6,4],[-1.2,-5.4],[-3.6,-6]]);
    p.F(M.skin[3]); p.rect(2.2,-3,0.8,5);
    // crânio comprido
    p.F(M.skin[1]); p.ell(2.4,-12,8.8,9);
    p.poly([[-3.4,-6],[11.4,-7.4],[12.6,-4.2],[6,-2.4],[-2,-3]]);
    p.F(M.skin[2]); p.poly([[-6.6,-14],[-5,-6],[0,-2.6],[6,-2.6],[2,-5],[-2,-9],[-3,-14]]);
    p.F(M.skin[3]); p.poly([[-6.6,-13],[-6,-9],[-4.2,-5.2],[-4.6,-10.6]]);
    p.F(M.skin[0]); p.poly([[5,-7.6],[9,-8.2],[8.4,-7],[5.4,-6.8]]);
    // orelha
    p.F(M.skin[1]); p.ell(-2.6,-10.8,2.2,3); p.F(M.skin[3]); p.ell(-2.4,-10.6,1,1.8);
    // cabelo molhado escorrido + alga pendurada
    p.F(M.hair[1]); p.poly([[-7.2,-14],[-3,-16],[2,-16.4],[-1,-14],[-4,-10],[-5.4,-5.4],[-7.6,-8]]);
    p.F(M.hair[2]); p.poly([[-7.6,-8],[-5.4,-5.4],[-6.4,-3],[-8,-5]]);
    p.F(M.slime[1]); p.poly([[-6,-12],[-4.8,-12],[-5.4,-4],[-6.4,-1.6],[-6.8,-4]]); p.F(M.slime[2]); p.rect(-6.4,-6,1,2.6);
    // olho opaco esverdeado, olheira funda
    p.F(M.skin[3]); p.ell(8,-10.6,2.8,2.2);
    p.F(M.eye[1]); p.ell(8.4,-10.6,1.9,1.4); p.F(M.eye[0]); p.rect(8,-11.2,0.9,0.7); p.F(M.eye[3]); p.rect(9.2,-10.4,0.7,0.7);
    p.F(M.skin[3]); p.ell(12,-10.8,0.9,1.3); p.F(M.eye[1]); p.rect(11.7,-11.2,0.8,0.9);
    // nariz e boca
    p.F(M.skin[1]); p.poly([[11.2,-11],[14.6,-7.4],[13.6,-6.2],[11.4,-7]]);
    p.F(M.skin[3]); p.rect(12.6,-6.8,1.4,0.9);
    p.F(M.mouth[1]); p.poly([[5,-5.4],[13.2,-5.6],[13,-2.6],[5,-2.4]]);
    p.F(M.teeth[1]); [[6.8,-5.6,1.2,1.4],[8.4,-5.6,1.2,1.9],[10,-5.6,1.1,1.5],[11.6,-5.6,1,1.2]].forEach(([x,y,w,h])=>p.rect(x,y,w,h));
    p.F(M.rot[1]); p.ell(1.6,-8.4,1.6,1.2); p.F(M.slime[2]); p.rect(3,-14.6,1.4,1);
    if(form!=='comum'){ p.F(M.glow[0]); p.rect(7.8,-11.2,1.6,1.2); p.F(M.glow[1]); p.rect(11.7,-11.2,0.8,1); }
    // chapéu de palha: copa + aba larga caída, trama, rasgos
    p.F(M.straw[1]); p.poly([[-4.6,-15.6],[-3.8,-21.4],[0,-24],[5,-24],[8.6,-21.6],[9.4,-16.4]]);
    p.F(M.straw[2]); p.poly([[-4.6,-15.6],[-3.8,-21.4],[-1,-23.4],[-1.6,-16]]);
    p.F(M.straw[0]); p.poly([[3,-23.6],[7,-22.6],[8.6,-19.6],[5.4,-21]]);
    p.F(M.band? M.band[1]:M.tank[2]); p.poly([[-4.6,-17.6],[9.2,-18.4],[9.4,-16.4],[-4.6,-15.6]]); // fita da copa
    p.F(M.straw[3]); for(let k=0;k<5;k++){ p.rect(-3+k*2.6,-22+((k%2)*0.6),0.6,4.4); }
    // aba: elipse larga, levemente caída na frente e atrás, borda desfiada com buracos
    const brim=[]; for(let k=0;k<=18;k++){ const a=k/18*PI*2; brim.push([2.6+Math.cos(a)*16.4,-15.6+Math.sin(a)*3.2+(Math.cos(a)>0?Math.cos(a)*1.6:-Math.cos(a)*1)]); }
    p.F(M.straw[1]); p.poly(brim);
    clip(c,brim,()=>{ p.F(M.straw[2]); p.poly([[-16,-15],[20,-15],[20,-8],[-16,-8]]); p.F(M.straw[0]); p.poly([[4,-19.4],[18,-17.4],[18,-16.4],[4,-18.2]]);
      p.F(M.straw[3]); for(let k=0;k<9;k++){ const x=-12+k*3.6; p.rect(x,-18.6,0.5,6); } });
    p.F(M.straw[3]); p.poly([[-14,-13.4],[-12.4,-11.4],[-11.4,-13],[-9.4,-11.6],[-8.6,-13.2]]); p.poly([[14,-13],[15.6,-10.6],[16.6,-12.6],[18.2,-11.4],[18.6,-13]]);
    p.F(M.straw[2]); p.rect(15.6,-12,1.2,2.4); p.rect(-12.6,-12.2,1.2,1.6); // palha solta
    p.id();
  }
  function drawJaw(c,u,M,sk,P){
    const p=mkPen(c,u); const h=sk.H(2.6,-3.8); p.xf(sk.ha+rad(P.jaw),h.x,h.y); c.scale(HS,HS);
    p.F(M.skin[1]); p.poly([[-2,-1.4],[10.8,-0.8],[11.6,1.6],[10.4,5.2],[6,6.8],[0.6,6],[-2.4,2.6]]);
    p.F(M.skin[2]); p.poly([[-2.4,2.6],[0.6,6],[6,6.8],[10.4,5.2],[8.6,4.6],[4,5],[0,3.4]]);
    p.F(M.skin[3]); p.poly([[1,6],[6,6.8],[9,6],[4,6]]);
    p.F(M.mouth[1]); p.poly([[2.6,-0.8],[10,-0.4],[10,1.4],[3,1.2]]);
    p.F(M.teeth[1]); [[4.2,-1,1.2,1.4],[5.8,-1,1.2,1.8],[7.4,-1,1.2,1.4],[9,-1,1,1.7]].forEach(([x,y,w,h])=>p.rect(x,y,w,h));
    p.F(M.slime[1]); p.poly([[9,4.8],[10.6,4.2],[10.2,8.4],[9.6,9]]); p.ell(9.9,9,1,1); // baba de lodo
    p.id();
  }
  function drawSmear(c,u,M,sk,P){
    const p=mkPen(c,u); p.id();
    const sh=sk.shF, w=sk.o2, r=Math.hypot(w.x-sh.x,w.y-sh.y), a1=Math.atan2(w.y-sh.y,w.x-sh.x);
    const n=12, pts=[]; for(let i=0;i<=n;i++){ const a=a1-1.3+1.35*i/n; pts.push([sh.x+Math.cos(a)*r,sh.y+Math.sin(a)*r]); }
    for(let i=n;i>=0;i--){ const a=a1-1.3+1.35*i/n, rr=r-3-9*(i/n); pts.push([sh.x+Math.cos(a)*rr,sh.y+Math.sin(a)*rr]); }
    p.F(M.water[0]); p.poly(pts.map(([x,y])=>[Math.max(1,Math.min(FW-2,x)),Math.max(1,Math.min(GROUND,y))]));
  }
  function drawPuddle(c,u,M,sk,P){
    const p=mkPen(c,u); p.id(); const k=P.puddle/5, cx=AX+10+k*16, rx=8+k*30;
    p.F(M.water[3]); p.ell(cx,GROUND-1.2,rx,2.4+k*1.6); p.F(M.water[2]); p.ell(cx-2,GROUND-1.6,rx*0.8,1.8+k*1.2); p.F(M.water[1]); p.ell(cx+rx*0.3,GROUND-2,rx*0.25,0.7);
    p.F(M.slime[2]); p.ell(cx-rx*0.5,GROUND-1.4,rx*0.2,0.8);
  }

  /* ---------- montagem ---------- */
  const cache=PIX.cache();
  function frame(form,anim,fi,step=5,Pov,pk){
    const K=PIX.getK(), key=(pk!=null?'#'+pk+'|'+form:form+'|'+anim+'|'+fi+'|'+step)+'@'+K;
    const hit=cache.get(key); if(hit){ cache.delete(key); cache.set(key,hit); return hit; }
    const P=Pov?Object.assign({},REST,Pov):poseOf(anim,fi), M=mats(form), sk=skeleton(P);
    const parts=[];
    if(P.puddle) parts.push({noShade:true, noRim:true, smear:true, draw:(c,u)=>drawPuddle(c,u,M,sk,P)});
    parts.push(
      {back:true, draw:(c,u)=>drawArm(c,u,M,sk,P,false,form)},
      {back:true, draw:(c,u)=>drawLeg(c,u,M,sk,P,false)},
      {draw:(c,u)=>drawTorso(c,u,M,sk,P,form)},
      {draw:(c,u)=>drawLeg(c,u,M,sk,P,true)},
      {draw:(c,u)=>drawHead(c,u,M,sk,P,form)},
      {draw:(c,u)=>drawJaw(c,u,M,sk,P)},
    );
    if(P.smear) parts.push({noShade:true, smear:true, noRim:true, draw:(c,u)=>drawSmear(c,u,M,sk,P)});
    parts.push({draw:(c,u)=>drawOar(c,u,M,sk,P,form)});
    parts.push({draw:(c,u)=>drawArm(c,u,M,sk,P,true,form)});
    if(P.net>0.02) parts.push({noRim:true, draw:(c,u)=>drawNet(c,u,M,sk,P)});
    if(P.splash) parts.push({noShade:true, noRim:true, smear:true, draw:(c,u)=>drawSplash(c,u,M,sk,P)});
    if(!Pov || P.drip) parts.push({noShade:true, noRim:true, smear:true, draw:(c,u)=>drawDrips(c,u,M,sk,P)});
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM[form]}); if(step>=4) heavyOutline(cv);
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._eye=sc(sk.H(8.4,-10.6)); cv._mouth=sc(sk.H(10,-2)); cv._hand=sc(sk.wrF); cv._head=sc(sk.H(3,-13)); cv._blade=sc(sk.o2);
    cache.set(key,cv); if(cache.size>900) cache.delete(cache.keys().next().value);
    return cv;
  }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame,framePose:function(form,anim,P,key){ return frame(form,anim,0,5,P,key); }};
})();
