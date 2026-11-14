/* ERR — fonte de arte (editável). Build: npm run art
   Errante: ex-ambulante do Recife Antigo. Corpo pesado e arqueado, barriga, camisa de time desbotada
   (listras), bermuda tactel, pochete, um chinelo só, mandíbula frouxa. Hi-bit: honra PIX.getK(). */
const ERR=(function(){
  const {rad,lerp,P2,mkPen,compose}=PIX;
  const FW=172, FH=150, GROUND=142, AX=74;
  const RIM={comum:'#b4d8f4', enluarado:'#9ff6ff', plenilunar:'#ffb46a'};

  /* ---------- materiais ---------- */
  function mats(form){
    const m={
      skin:['#d2dba4','#9cac74','#667c5a','#3a4a46'],
      rot:['#b4ac80','#81745c','#574a4a','#332836'],
      flesh:['#f6ae94','#d0645e','#8e3446','#521c34'],
      bone:['#fff4d8','#dccfa6','#a09070','#605040'],
      shirt:['#f2a48a','#c65e52','#8a3a4a','#52223a'],
      stripe:['#7c7488','#4e4862','#332e46','#1e1a2e'],
      trim:['#fffbe8','#d6cfbe','#9a92a2','#5e5672'],
      shorts:['#8cc0cc','#5088a4','#365c86','#22365c'],
      pouch:['#a4846a','#6c503e','#46322a','#2a1a1e'],
      metal:['#fff4c0','#cbae52','#8a6c30','#4c3a1e'],
      sandal:['#fff27e','#e8b232','#a8702a','#5e3a1e'],
      strap:['#94e48e','#3c9e5c','#2a6848','#163c30'],
      hair:['#70644e','#463c30','#2c2420','#181414'],
      eye:['#ffffff','#e6e8c8','#aaac8c','#6a6c58'],
      mouth:['#7c2e3e','#4c1828','#2e0c1a','#1a0610'],
      teeth:['#fbf0c0','#d8c27c','#9a8650','#5e4e30'],
      blood:['#c84a3e','#8e2a2c','#5e1824','#3a0e1a'],
      nail:['#8a7a62','#54463c','#342a28','#1c1618'],
      glow:['#fffbe0','#e8ecb0','#a8b07a','#646c4a'],
    };
    if(form==='enluarado'){
      m.skin=['#dcdcff','#9ea0e2','#666aac','#3c3a76']; m.rot=['#b8a6e0','#8470b0','#56468a','#33285e'];
      m.flesh=['#f0b0ff','#b866d8','#7a3a9e','#46206a']; m.blood=['#b46ad8','#7e3ea6','#542474','#34144a'];
      m.eye=['#ffffff','#b8fbff','#4ad8f0','#1a8aa8']; m.glow=['#effffe','#7af4ff','#2ab0d8','#146a96'];
      m.shirt=['#d6a6c6','#9a6292','#683e70','#3e2450']; m.stripe=['#6c6c96','#46466e','#2e2e52','#1a1a36'];
      m.shorts=['#8aa6e0','#5468b0','#3a4486','#22285a']; m.hair=['#5a4e74','#3a3052','#262038','#161224'];
    }
    if(form==='plenilunar'){
      m.skin=['#ffcaa6','#e2806a','#a4424e','#5e1e36']; m.rot=['#d0806a','#9a4a4a','#682a3a','#3e1628'];
      m.flesh=['#ffc07a','#f06a3a','#a8302e','#5e1422']; m.blood=['#ff7a3a','#d43a26','#8a1c22','#4e0c18'];
      m.eye=['#fffbe0','#ffe04a','#ff8a2a','#b83a14']; m.glow=['#fff6c0','#ffb43a','#e0581e','#8a2414'];
      m.shirt=['#f2dccc','#c4a29c','#8a6874','#523c50']; m.stripe=['#6a4458','#44283a','#2c1a28','#1a0e18'];
      m.shorts=['#7e98b0','#4c5e84','#343e62','#20243e']; m.hair=['#4e2e2a','#30191a','#1e0f10','#120808'];
    }
    return punch(m);
  }
  const NAMES={skin:'Pele',rot:'Podridão',flesh:'Carne',bone:'Osso',shirt:'Camisa de time',stripe:'Listra',trim:'Friso',shorts:'Bermuda tactel',pouch:'Pochete',metal:'Fivela',sandal:'Chinelo',strap:'Tira do chinelo',hair:'Cabelo',eye:'Olho',teeth:'Dentes',blood:'Sangue',glow:'Brilho'};

  /* ---------- poses ---------- */
  // ângulos de membros: 0 = pendurado pra baixo, + = pra frente. lean/hunch/head: + = pra frente.
  // rot = giro do corpo inteiro (queda/chão); fF/fB = ângulo dos pés.
  const REST={hx:0,rot:0,lean:12,hunch:26,head:-30,jaw:22,aFs:16,aFe:30,aBs:8,aBe:22,lFh:22,lFk:-10,lBh:-14,lBk:-26,fF:0,fB:0,grip:0,smear:0,flash:0,drool:0};
  const S=Math.sin, C=Math.cos, PI=Math.PI, mx=Math.max;
  const ANIMS={
    idle:{nome:'Parado',n:8,dur:()=>165,pose:i=>{ const p=i/8*PI*2, s=S(p);
      return {hunch:26+3*s, lean:12+1*s, head:-30+4*S(p-0.9), jaw:14+5*mx(0,S(p-0.4)), aFs:16+4*S(p-0.6), aFe:30+6*S(p-1.1), aBs:8+3*S(p-0.3), aBe:22+5*S(p-0.8), hx:0.6*S(p+0.5), drool:i%4}; }},
    walk:{nome:'Andar',n:8,dur:()=>125,pose:i=>{ const p=i/8*PI*2;
      const lFh=12+20*S(p), lBh=-12+14*S(p+PI);
      return {lFh, lFk:lFh-24*mx(0,C(p))-3, lBh, lBk:lBh-10-12*mx(0,C(p+PI)), fF:-14*mx(0,C(p)), fB:22*mx(0,C(p+PI)),
        lean:13+3*Math.abs(S(p)), hunch:26+3*S(2*p-0.6), head:-30+6*S(2*p-1.4), jaw:15+4*S(2*p-1.8), hx:1.2*S(2*p),
        aFs:16-14*S(p), aFe:32-16*S(p-0.5), aBs:8+12*S(p), aBe:24+14*S(p-0.5), drool:i%4}; }},
    alert:{nome:'Alerta (fareja e rosna)',n:7,dur:i=>[200,90,260,120,300,200,180][i],pose:i=>[
      {},
      {hunch:18,head:-16,jaw:6,lean:8,aFs:12,aFe:20,hx:-1},
      {hunch:10,head:-6,jaw:4,lean:4,aFs:10,aFe:16,aBs:6,aBe:14,hx:-2,lFh:4,lBh:-8},
      {hunch:14,head:-22,jaw:34,lean:6,aFs:40,aFe:64,aBs:30,aBe:56,hx:-1},
      {hunch:16,head:-26,jaw:40,lean:8,aFs:52,aFe:78,aBs:42,aBe:70,hx:0,drool:3},
      {hunch:24,head:-30,jaw:30,lean:16,aFs:60,aFe:84,aBs:50,aBe:76,hx:3,lFh:14,lBh:-16},
      {hunch:26,head:-30,jaw:20,lean:14,aFs:34,aFe:56,aBs:24,aBe:44,hx:1}][i]},
    attack:{nome:'Agarrão + mordida',n:9,hit:4,reach:38,dur:i=>[200,170,90,60,190,120,140,140,150][i],pose:i=>[
      {lean:2,hunch:18,head:-20,jaw:18,aFs:120,aFe:150,aBs:110,aBe:140,hx:-3,lFh:14,lFk:-6,lBh:-14,lBk:-24},
      {lean:-6,hunch:12,head:-14,jaw:34,aFs:150,aFe:176,aBs:140,aBe:166,hx:-5,lFh:16,lFk:-8,lBh:-12,lBk:-22},
      {lean:20,hunch:24,head:-30,jaw:40,aFs:100,aFe:104,aBs:94,aBe:100,hx:5,lFh:28,lFk:6,lBh:-22,lBk:-30,fB:14},
      {lean:30,hunch:28,head:-34,jaw:42,aFs:88,aFe:92,aBs:84,aBe:90,hx:10,lFh:32,lFk:8,lBh:-26,lBk:-34,fB:18,smear:1},
      {lean:34,hunch:30,head:-26,jaw:0,aFs:78,aFe:58,aBs:74,aBe:62,hx:12,lFh:30,lFk:6,lBh:-26,lBk:-34,fB:18,grip:1},
      {lean:34,hunch:32,head:-20,jaw:2,aFs:76,aFe:54,aBs:72,aBe:58,hx:12,lFh:30,lFk:6,lBh:-26,lBk:-34,fB:18,grip:1},
      {lean:24,hunch:24,head:-44,jaw:30,aFs:66,aFe:70,aBs:62,aBe:74,hx:8,lFh:22,lBh:-20,lBk:-28,drool:3},
      {lean:16,hunch:24,head:-34,jaw:24,aFs:40,aFe:52,aBs:30,aBe:44,hx:3,lFh:12,lBh:-14},
      {lean:12,hunch:26,head:-30,jaw:18,hx:1}][i]},
    // ---- ataques extras (IA escolhe por distância/peso; hit = quadro do dano, reach = alcance em px) ----
    claw2:{nome:'Arranhão com as duas mãos',n:8,hit:4,reach:36,dur:i=>[150,130,150,50,90,130,130,140][i],pose:i=>[
      {lean:4,hunch:18,head:-22,jaw:20,aFs:110,aFe:140,aBs:100,aBe:130,hx:-2,lFh:16,lFk:-6,lBh:-14,lBk:-26},
      {lean:-8,hunch:10,head:-12,jaw:36,aFs:160,aFe:196,aBs:150,aBe:186,hx:-5,lFh:14,lFk:-8,lBh:-12,lBk:-24},
      {lean:-12,hunch:6,head:-8,jaw:42,aFs:170,aFe:208,aBs:160,aBe:198,hx:-6,lFh:12,lFk:-8,lBh:-10,lBk:-22,drool:2},
      {lean:26,hunch:26,head:-32,jaw:46,aFs:100,aFe:84,aBs:116,aBe:104,hx:7,lFh:28,lFk:4,lBh:-22,lBk:-30,smear:1,fB:12},
      {lean:38,hunch:32,head:-36,jaw:30,aFs:40,aFe:4,aBs:58,aBe:22,hx:12,lFh:32,lFk:8,lBh:-26,lBk:-34,fB:18,smear:1},
      {lean:40,hunch:34,head:-30,jaw:24,aFs:22,aFe:-12,aBs:34,aBe:2,hx:12,lFh:32,lFk:8,lBh:-26,lBk:-34,fB:18},
      {lean:24,hunch:28,head:-32,jaw:22,aFs:16,aFe:24,aBs:10,aBe:20,hx:6,lFh:24,lBh:-18,lBk:-28},
      {lean:12,hunch:26,head:-30,jaw:20,hx:1}][i]},
    headbutt:{nome:'Cabeçada',n:7,hit:3,reach:30,dur:i=>[170,190,50,170,130,130,150][i],pose:i=>[
      {lean:2,hunch:14,head:-18,jaw:14,aFs:-10,aFe:10,aBs:-20,aBe:0,hx:-3,lFh:16,lFk:-6,lBh:-14,lBk:-26},
      {lean:-14,hunch:2,head:-2,jaw:30,aFs:-34,aFe:-14,aBs:-44,aBe:-24,hx:-7,lFh:10,lFk:-10,lBh:-6,lBk:-20,drool:1},
      {lean:40,hunch:34,head:-44,jaw:10,aFs:-50,aFe:-30,aBs:-60,aBe:-40,hx:10,lFh:34,lFk:8,lBh:-30,lBk:-40,fB:20,smear:0},
      {lean:50,hunch:44,head:-20,jaw:4,aFs:-56,aFe:-36,aBs:-66,aBe:-46,hx:14,lFh:36,lFk:10,lBh:-32,lBk:-42,fB:24},
      {lean:40,hunch:38,head:-30,jaw:36,aFs:-30,aFe:-6,aBs:-40,aBe:-16,hx:12,lFh:32,lFk:6,lBh:-28,lBk:-38,fB:18,drool:3},
      {lean:24,hunch:30,head:-32,jaw:26,aFs:0,aFe:20,aBs:-6,aBe:14,hx:6,lFh:24,lBh:-18,lBk:-30},
      {lean:12,hunch:26,head:-30,jaw:20,hx:1}][i]},
    grabLow:{nome:'Agarrão baixo (prende a perna)',n:8,hit:4,reach:34,dur:i=>[160,150,170,60,220,180,150,150][i],pose:i=>[
      {lean:16,hunch:30,head:-26,jaw:22,aFs:40,aFe:50,aBs:30,aBe:40,hx:0,lFh:30,lFk:-20,lBh:-10,lBk:-40},
      {lean:30,hunch:40,head:-18,jaw:30,aFs:20,aFe:20,aBs:10,aBe:10,hx:-2,lFh:56,lFk:-40,lBh:4,lBk:-70},
      {lean:34,hunch:44,head:-14,jaw:38,aFs:-10,aFe:-6,aBs:-20,aBe:-14,hx:-4,lFh:64,lFk:-50,lBh:10,lBk:-80,drool:2},
      {lean:52,hunch:44,head:-30,jaw:44,aFs:60,aFe:50,aBs:54,aBe:44,hx:10,lFh:70,lFk:-30,lBh:-10,lBk:-80,smear:1,fB:30},
      {lean:56,hunch:46,head:-26,jaw:6,aFs:44,aFe:20,aBs:40,aBe:14,hx:14,lFh:72,lFk:-30,lBh:-12,lBk:-82,grip:1,fB:30},
      {lean:40,hunch:40,head:-34,jaw:10,aFs:20,aFe:-4,aBs:16,aBe:-10,hx:8,lFh:60,lFk:-36,lBh:-6,lBk:-70,grip:1},
      {lean:24,hunch:32,head:-34,jaw:26,aFs:10,aFe:20,aBs:4,aBe:14,hx:4,lFh:34,lFk:-16,lBh:-12,lBk:-40},
      {lean:12,hunch:26,head:-30,jaw:20,hx:1}][i]},
    hurt:{nome:'Dano (cabeça)',n:4,dur:i=>[80,110,130,150][i],pose:i=>[
      {lean:-8,hunch:6,head:-6,jaw:30,aFs:-30,aFe:-12,aBs:-36,aBe:-20,hx:-6,flash:1,lFh:14,lBh:-4},
      {lean:-4,hunch:10,head:-12,jaw:26,aFs:-20,aFe:0,aBs:-26,aBe:-8,hx:-5,lFh:12,lBh:-6},
      {lean:6,hunch:20,head:-24,jaw:22,aFs:4,aFe:18,aBs:-4,aBe:10,hx:-2},
      {lean:11,hunch:25,head:-29,jaw:17,hx:0}][i]},
    hurtB:{nome:'Dano (barriga)',n:4,dur:i=>[80,120,140,150][i],pose:i=>[
      {lean:34,hunch:40,head:-6,jaw:36,aFs:40,aFe:-10,aBs:34,aBe:-16,hx:-7,flash:1,lFh:20,lFk:-14,lBh:-14,lBk:-30},
      {lean:30,hunch:38,head:-10,jaw:32,aFs:36,aFe:-4,aBs:30,aBe:-10,hx:-6,lFh:18,lFk:-12,lBh:-14,lBk:-28},
      {lean:20,hunch:32,head:-22,jaw:24,aFs:24,aFe:20,aBs:18,aBe:14,hx:-3},
      {lean:13,hunch:27,head:-29,jaw:18,hx:-1}][i]},
    fall:{nome:'Derrubado',n:6,dur:i=>[90,90,90,110,140,260][i],pose:i=>[
      {lean:-12,hunch:8,head:-4,jaw:34,aFs:-40,aFe:-20,aBs:-46,aBe:-30,hx:-6,flash:1,lFh:20,lBh:0},
      {rot:-30,lean:-4,hunch:10,head:-6,jaw:30,aFs:-60,aFe:-40,aBs:-70,aBe:-50,hx:-4,lFh:40,lFk:30,lBh:20,lBk:10},
      {rot:-62,lean:0,hunch:12,head:-10,jaw:28,aFs:-90,aFe:-70,aBs:-96,aBe:-80,hx:-6,lFh:50,lFk:40,lBh:30,lBk:24},
      {rot:-90,lean:4,hunch:14,head:-6,jaw:36,aFs:-110,aFe:-120,aBs:-100,aBe:-110,hx:2,lFh:40,lFk:10,lBh:30,lBk:4},
      {rot:-84,lean:2,hunch:18,head:-14,jaw:30,aFs:-120,aFe:-140,aBs:-104,aBe:-126,hx:2,lFh:46,lFk:20,lBh:34,lBk:10},
      {rot:-90,lean:0,hunch:16,head:-10,jaw:34,aFs:-130,aFe:-150,aBs:-110,aBe:-136,hx:2,lFh:40,lFk:6,lBh:26,lBk:0}][i]},
    getup:{nome:'Levantar',n:6,dur:i=>[200,170,170,160,160,150][i],pose:i=>[
      {rot:-90,lean:0,hunch:16,head:-10,jaw:34,aFs:-130,aFe:-150,aBs:-110,aBe:-136,hx:2,lFh:40,lFk:6,lBh:26,lBk:0},
      {rot:-60,lean:10,hunch:26,head:-24,jaw:24,aFs:-50,aFe:-10,aBs:-60,aBe:-20,hx:-8,lFh:90,lFk:10,lBh:70,lBk:0},
      {rot:-30,lean:20,hunch:30,head:-36,jaw:20,aFs:-10,aFe:10,aBs:-20,aBe:0,hx:-6,lFh:110,lFk:10,lBh:60,lBk:-60},
      {rot:0,lean:34,hunch:30,head:-40,jaw:20,aFs:30,aFe:10,aBs:20,aBe:4,hx:-4,lFh:78,lFk:-2,lBh:6,lBk:-86,fB:60},
      {rot:0,lean:22,hunch:28,head:-34,jaw:18,aFs:24,aFe:30,aBs:14,aBe:24,hx:-1,lFh:34,lFk:-14,lBh:-12,lBk:-40},
      {lean:12,hunch:26,head:-30,jaw:16}][i]},
    death:{nome:'Morte',n:8,dur:i=>[90,150,160,170,150,120,140,600][i],pose:i=>[
      {lean:-10,hunch:8,head:-2,jaw:36,aFs:-34,aFe:-16,aBs:-40,aBe:-24,hx:-5,flash:1,lFh:14,lBh:-4},
      {lean:-4,hunch:12,head:4,jaw:44,aFs:-10,aFe:4,aBs:-16,aBe:0,hx:-6,lFh:10,lBh:-8},
      {lean:6,hunch:22,head:-8,jaw:46,aFs:4,aFe:6,aBs:0,aBe:2,hx:-4,lFh:40,lFk:-30,lBh:28,lBk:-50,fF:10,fB:30},
      {lean:10,hunch:30,head:-14,jaw:48,aFs:6,aFe:4,aBs:2,aBe:0,hx:-2,lFh:14,lFk:-92,lBh:6,lBk:-96,fF:100,fB:100},
      {rot:16,lean:12,hunch:34,head:-12,jaw:48,aFs:24,aFe:20,aBs:16,aBe:14,hx:0,lFh:2,lFk:-92,lBh:-6,lBk:-96,fF:90,fB:90},
      {rot:50,lean:10,hunch:30,head:-16,jaw:44,aFs:70,aFe:90,aBs:56,aBe:76,hx:4,lFh:-20,lFk:-70,lBh:-28,lBk:-74,fF:60,fB:60},
      {rot:86,lean:2,hunch:16,head:-6,jaw:40,aFs:150,aFe:170,aBs:110,aBe:150,hx:8,lFh:-4,lFk:-10,lBh:-8,lBk:-14,fF:10,fB:10},
      {rot:90,lean:0,hunch:14,head:-2,jaw:42,aFs:160,aFe:176,aBs:116,aBe:156,hx:8,lFh:-2,lFk:-6,lBh:-6,lBk:-10,fF:6,fB:6,drool:3}][i]},
  };

  /* acabamento: mais saturação nos tons claros e massas de sombra mais fundas (hue shift pro roxo) */
  function sat(h,k){ const [r,g,b]=PIX.hexRgb(h), y=(r+g+b)/3; return PIX.toHex(y+(r-y)*k,y+(g-y)*k,y+(b-y)*k); }
  function punch(m){ const o={}; for(const k in m){ const r=m[k]; o[k]=[sat(r[0],1.1),sat(r[1],1.18),PIX.mix(sat(r[2],1.12),'#2a1a4c',0.2),PIX.mix(r[3],'#140a24',0.34)]; } return o; }
  // exagero de pose: amplia o desvio em relação ao REST (só em pé)
  const EXK=['hx','lean','hunch','head','aFs','aFe','aBs','aBe','lFh','lFk','lBh','lBk'];
  function exag(P,f){ if(f===1||Math.abs(P.rot)>4) return P; EXK.forEach(k=>{ P[k]=REST[k]+(P[k]-REST[k])*f; }); P.jaw=Math.min(52,REST.jaw+(P.jaw-REST.jaw)*f); return P; }
  // contorno de baixo com 2 px (assenta o peso, como na referência)
  function heavyOutline(cv){ const g=cv.getContext('2d'), W=cv.width, H=cv.height, im=PIX.pix(cv), d=im.data;
    const isO=i=>d[i+3]===255&&d[i]===0x17&&d[i+1]===0x0b&&d[i+2]===0x1c, fill=i=>d[i+3]===255&&!isO(i);
    const add=[]; for(let y=2;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(d[i+3]) continue; const u=((y-1)*W+x)*4, u2=((y-2)*W+x)*4; if(isO(u)&&fill(u2)) add.push(i); }
    add.forEach(i=>{ d[i]=0x17; d[i+1]=0x0b; d[i+2]=0x1c; d[i+3]=255; }); g.putImageData(im,0,0); }
  const EXF={idle:1.12,walk:1.15,alert:1.25,attack:1.3,claw2:1.3,headbutt:1.25,grabLow:1.2,miss:1.2,hurt:1.3,hurtB:1.25,fall:1.15,getup:1.1,death:1.15};
  ZREACT.add(ANIMS,REST,{moves:{backhand:["swipe","Tapa de revés"]}}); // reações (voando, agarrado) + golpe extra — art-src/shared/zreact.js
  function poseOf(anim,i){ return exag(Object.assign({},REST,ANIMS[anim].pose(i)),EXF[anim]||1); }

  /* ---------- esqueleto ---------- */
  const SPINE=40, TH=20, SH=19, UA=15, FA=14, VS=SPINE/36, US=1.3, HB=16, HS=1.22;
  const lp=(p,a,L)=>({x:p.x+Math.sin(rad(a))*L, y:p.y+Math.cos(rad(a))*L});
  function build(P,dy){
    const R=P.rot, hip={x:AX+P.hx, y:dy};
    const ra=rad(R), rc=Math.cos(ra), rs=Math.sin(ra);
    const HR=(lx,ly)=>({x:hip.x+lx*rc-ly*rs, y:hip.y+lx*rs+ly*rc});
    const hipF=HR(3,0), hipB=HR(-3,0);
    const kneeF=lp(hipF,P.lFh-R,TH), ankleF=lp(kneeF,P.lFk-R,SH), kneeB=lp(hipB,P.lBh-R,TH), ankleB=lp(kneeB,P.lBk-R,SH);
    // coluna curva: lean na base, +hunch crescente até o pescoço
    const SS=[]; let x=hip.x, y=hip.y;
    for(let k=0;k<=SPINE;k++){ const t=k/SPINE, a=rad(R+P.lean+(P.hunch+HB)*Math.pow(t,1.25)); SS.push({x,y,a}); x+=Math.sin(a); y-=Math.cos(a); }
    const SP=(u,v)=>{ const f=Math.max(0,-v), k=Math.min(SPINE,Math.floor(f)), s=SS[k], r=f-k, a=s.a;
      const px=s.x+Math.sin(a)*r, py=s.y-Math.cos(a)*r; return {x:px+Math.cos(a)*u, y:py+Math.sin(a)*u}; };
    const T=(u,v)=>SP(u*US,v*VS);
    const top=SS[SPINE], neck=T(1,-37), sa=top.a;
    const shF=T(4,-30), shB=T(-4,-31);
    const elF=lp(shF,P.aFs-R,UA), wrF=lp(elF,P.aFe-R,FA), elB=lp(shB,P.aBs-R,UA), wrB=lp(elB,P.aBe-R,FA);
    const ha=sa+rad(P.head-HB*0.8), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:neck.x+lx*hc-ly*hs, y:neck.y+lx*hs+ly*hc});
    const toe=(a,f)=>{ const t=rad(f+R); return {x:a.x+(11*Math.cos(t)-5*Math.sin(t))*1.3, y:a.y+(11*Math.sin(t)+5*Math.cos(t))*1.3}; };
    const hull=[[ankleF,5.6],[ankleB,5.6],[toe(ankleF,P.fF),0.5],[toe(ankleB,P.fB),0.5],[kneeF,5],[kneeB,5],[hip,9],[T(0,-18),12],[T(-2,-30),12],[H(3,-11),12],[wrF,4],[wrB,4],[elF,4],[elB,4]];
    return {R,hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,SP,T,sa,neck,shF,shB,elF,wrF,elB,wrB,ha,H,hull,ra};
  }
  function skeleton(P){
    const a=build(P,0); let m=-1e9; a.hull.forEach(([p,r])=>{ m=Math.max(m,p.y+r); });
    return build(P,GROUND-m);
  }

  /* ---------- utilitários de desenho ---------- */
  const LV={x:0.55,y:-0.83};
  function sideN(a,b){ const dx=b.x-a.x, dy=b.y-a.y, L=Math.hypot(dx,dy)||1; let nx=-dy/L, ny=dx/L; if(nx*LV.x+ny*LV.y>0){ nx=-nx; ny=-ny; } return {nx,ny,L}; }
  // membro com volume: base, massa de sombra do lado oposto à luz e filete de luz
  function limb(p,R,a,b,wa,wb,o){ o=o||{};
    p.F(R[o.base!=null?o.base:1]); p.cap(a,b,wa,wb);
    const {nx,ny}=sideN(a,b), sh=o.sh!=null?o.sh:0.6;
    const ka=wa*(0.5-sh/2), kb=wb*(0.5-sh/2);
    p.F(R[2]); p.cap({x:a.x+nx*ka,y:a.y+ny*ka},{x:b.x+nx*kb,y:b.y+ny*kb},wa*sh,wb*sh);
    if(o.deep){ const k2a=wa*0.33, k2b=wb*0.33; p.F(R[3]); p.cap({x:a.x+nx*k2a,y:a.y+ny*k2a},{x:b.x+nx*k2b,y:b.y+ny*k2b},wa*0.32,wb*0.32); }
    if(o.hi!==false){ const e=lerp(a,b,o.hl!=null?o.hl:0.7), ha=wa*0.22, hb=wb*0.22; p.F(R[0]); p.cap({x:a.x-nx*ha,y:a.y-ny*ha},{x:e.x-nx*hb,y:e.y-ny*hb},wa*0.18,wb*0.16); }
  }
  function clip(c,pts,fn){ c.save(); c.beginPath(); pts.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])); c.closePath(); c.clip(); fn(); c.restore(); }
  const W=(sk,list)=>list.map(([u,v])=>{ const q=sk.T(u,v); return [q.x,q.y]; });
  const Wp=(sk,u,v)=>sk.T(u,v);

  /* ---------- braço ---------- */
  function drawArm(c,u,M,sk,P,front){
    const p=mkPen(c,u), sh=front?sk.shF:sk.shB, el=front?sk.elF:sk.elB, wr=front?sk.wrF:sk.wrB; p._c=c; p.id();
    // braço (pele) com volume
    limb(p,M.skin,sh,el,12.6,11,{deep:true});
    limb(p,M.skin,el,wr,11.4,9.6,{deep:true});
    // cotovelo ossudo e veias
    p.F(M.skin[0]); p.circle(lerp(el,wr,0.06),1.2);
    const n=sideN(el,wr);
    p.F(M.rot[1]); const r1=lerp(el,wr,0.32); p.ell(r1.x-n.nx*1.2,r1.y-n.ny*1.2,1.8,1.3);
    if(front){
      // mordida aberta no antebraço: carne + osso
      const w=lerp(el,wr,0.55); p.F(M.skin[3]); p.ell(w.x+n.nx*0.6,w.y+n.ny*0.6,3.2,2.5,Math.atan2(wr.y-el.y,wr.x-el.x));
      p.F(M.flesh[1]); p.ell(w.x+n.nx*0.4,w.y+n.ny*0.4,2.5,1.9,Math.atan2(wr.y-el.y,wr.x-el.x));
      p.F(M.flesh[2]); p.ell(w.x+n.nx*1,w.y+n.ny*1,1.6,1,Math.atan2(wr.y-el.y,wr.x-el.x));
      p.F(M.bone[1]); const b0=lerp(el,wr,0.47), b1=lerp(el,wr,0.63); p.cap({x:b0.x-n.nx*0.4,y:b0.y-n.ny*0.4},{x:b1.x-n.nx*0.4,y:b1.y-n.ny*0.4},1,1);
      p.F(M.blood[1]); const d=lerp(el,wr,0.7); p.rect(d.x+n.nx*1.6,d.y,1,2.4);
    }
    // manga rasgada da camisa (listrada)
    const s1=lerp(sh,el,0.5);
    limb(p,M.shirt,sh,s1,15.4,14,{hl:0.5,deep:true});
    const sn=sideN(sh,el);
    p.F(M.stripe[1]); const st=lerp(sh,el,0.3); p.cap({x:st.x-sn.nx*4.6,y:st.y-sn.ny*4.6},{x:st.x+sn.nx*4.6,y:st.y+sn.ny*4.6},2.2,2.2);
    p.F(M.trim[1]); const st2=lerp(sh,el,0.18); p.cap({x:st2.x-sn.nx*4.8,y:st2.y-sn.ny*4.8},{x:st2.x+sn.nx*4.8,y:st2.y+sn.ny*4.8},0.9,0.9);
    // barra rasgada: dentes de pano
    p.F(M.shirt[2]); const e0=lerp(sh,el,0.5), dir={x:(el.x-sh.x)/sn.L,y:(el.y-sh.y)/sn.L};
    for(let k=-2;k<=2;k++){ const b={x:e0.x+sn.nx*k*2.1,y:e0.y+sn.ny*k*2.1}; const L=k%2?2.6:1.4; p.poly([[b.x-sn.nx*1,b.y-sn.ny*1],[b.x+sn.nx*1,b.y+sn.ny*1],[b.x+dir.x*L,b.y+dir.y*L]]); }
    drawHand(p,M,el,wr,P,front);
  }
  function drawHand(p,M,el,wr,P,front){
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y); p._c.scale(1.36,1.36);
    // mão grande e caída; dedos curvam pro lado -y (frente quando o braço pende)
    const g=P.grip;
    p.F(M.skin[1]); p.poly([[-1,-3.6],[4.6,-4.2],[6,-1],[5.6,3.6],[-1,3.8]]);
    p.F(M.skin[2]); p.poly([[-1,1.6],[5.8,1.4],[5.6,3.6],[-1,3.8]]);
    p.F(M.skin[0]); p.rect(0.6,-3.4,3.6,1);
    for(let k=0;k<4;k++){
      const y0=-3+k*2, cv=g?1:0.6, L1=3.4-(k===3?0.9:0), L2=3-(k===3?0.8:0);
      const a1={x:5.4,y:y0}, b1={x:5.4+L1,y:y0-1.2*cv}, c1={x:b1.x+L2*0.5*(1-g*0.6),y:b1.y-L2*cv};
      p.F(M.skin[1]); p.cap(a1,b1,2.1,1.9); p.cap(b1,c1,1.9,1.6);
      p.F(M.skin[2]); p.rect(a1.x+0.4,y0+0.5,L1-0.6,0.6);
      p.F(M.nail[1]); p.ell(c1.x,c1.y-0.2,0.9,0.8);
    }
    // polegar (lado da frente)
    p.F(M.skin[1]); p.cap(P2(2,-3.4),P2(5,-6.4+g),2,1.6); p.F(M.nail[1]); p.ell(5.2,-6.8+g,0.8,0.7);
    p.id();
  }

  /* ---------- perna ---------- */
  function drawLeg(c,u,M,sk,P,front){
    const p=mkPen(c,u), hip=front?sk.hipF:sk.hipB, knee=front?sk.kneeF:sk.kneeB, ank=front?sk.ankleF:sk.ankleB; p.id();
    // canela com pele manchada
    limb(p,M.skin,knee,ank,9.2,7.6,{deep:true,hl:0.5});
    const n=sideN(knee,ank);
    { const cv=lerp(knee,ank,0.3); p.F(M.skin[1]); p.ell(cv.x+n.nx*1.6,cv.y+n.ny*1.6,4.4,3.2,Math.atan2(ank.y-knee.y,ank.x-knee.x)); p.F(M.skin[2]); p.ell(cv.x+n.nx*2.4,cv.y+n.ny*2.4,3,2.4,Math.atan2(ank.y-knee.y,ank.x-knee.x)); }
    p.F(M.rot[1]); const r=lerp(knee,ank,0.45); p.ell(r.x-n.nx*1.2,r.y-n.ny*1.2,1.7,2.4,Math.atan2(ank.y-knee.y,ank.x-knee.x)+PI/2);
    p.F(M.rot[2]); p.circle({x:r.x-n.nx*0.8,y:r.y-n.ny*0.8+1},0.8);
    if(front){ p.F(M.blood[2]); const b=lerp(knee,ank,0.72); p.rect(b.x-n.nx*1.6,b.y-1,1,3); p.F(M.flesh[1]); const f=lerp(knee,ank,0.25); p.ell(f.x+n.nx*1.2,f.y+n.ny*1.2,1.4,1.1); }
    // bermuda tactel larga até abaixo do joelho
    const kb=lerp(hip,knee,1.04);
    limb(p,M.shorts,hip,kb,15.8,13.8,{deep:true,hl:0.6});
    const kn=sideN(hip,knee), dir={x:(knee.x-hip.x)/kn.L,y:(knee.y-hip.y)/kn.L};
    // friso lateral branco
    p.F(M.trim[1]); p.cap(lerp(hip,kb,0.05),lerp(hip,kb,0.92),1.1,1);
    // barra (bainha) + dobras
    p.F(M.shorts[3]); p.cap({x:kb.x-kn.nx*5.4,y:kb.y-kn.ny*5.4},{x:kb.x+kn.nx*5.4,y:kb.y+kn.ny*5.4},1.1,1.1);
    p.F(M.shorts[2]); const f1=lerp(hip,kb,0.55), f2=lerp(hip,kb,0.75);
    p.cap({x:f1.x-kn.nx*3.6,y:f1.y-kn.ny*3.6},{x:f1.x-kn.nx*0.6+dir.x*2,y:f1.y-kn.ny*0.6+dir.y*2},0.9,0.8);
    p.cap({x:f2.x+kn.nx*1,y:f2.y+kn.ny*1},{x:f2.x+kn.nx*4,y:f2.y+kn.ny*4+1.4},0.9,0.8);
    p.F(M.shorts[0]); const f3=lerp(hip,kb,0.3); p.cap({x:f3.x-kn.nx*3.4,y:f3.y-kn.ny*3.4},{x:f3.x-kn.nx*1.6+dir.x*3,y:f3.y-kn.ny*1.6+dir.y*3},0.9,0.8);
    // rasgo na bermuda mostrando a coxa
    if(front){ const t=lerp(hip,kb,0.62); p.F(M.shorts[3]); p.ell(t.x-kn.nx*2.4,t.y-kn.ny*2.4,2.2,1.5,Math.atan2(dir.y,dir.x)); p.F(M.skin[2]); p.ell(t.x-kn.nx*2.4,t.y-kn.ny*2.4,1.5,0.9,Math.atan2(dir.y,dir.x)); }
    // pé
    const fa=rad((front?P.fF:P.fB)+sk.R); p.xf(fa,ank.x,ank.y); c.scale(1.3,1.3);
    if(front){
      // chinelo + pé descalço por cima, dedos à mostra
      p.F(M.sandal[1]); p.poly([[-4.6,3.4],[10.8,3.2],[11.6,4.6],[10.6,5.8],[-4.8,5.8],[-5.4,4.6]]);
      p.F(M.sandal[3]); p.rect(-4.8,5.2,15.6,0.9); p.F(M.sandal[0]); p.rect(-3.6,3.3,12.6,0.8);
      p.F(M.skin[1]); p.poly([[-3.4,-1.6],[2.4,-1.8],[6,0.6],[9.4,1.8],[11.6,2.6],[11.8,3.6],[-4,3.6]]);
      p.F(M.skin[2]); p.poly([[-4,2],[3,2.4],[8,3],[11.8,3.2],[11.8,3.6],[-4,3.6]]);
      p.F(M.skin[0]); p.rect(0.6,-1.2,3.4,0.9); p.rect(6.4,0.8,2,0.7);
      p.F(M.skin[3]); [[8.4,2.2],[9.8,2.5],[11,2.8]].forEach(([x,y])=>p.rect(x,y,0.5,1.2));
      p.F(M.nail[1]); [[9.2,2.2],[10.5,2.5],[11.6,2.8]].forEach(([x,y])=>p.rect(x-0.4,y-0.1,0.8,0.7));
      p.F(M.strap[1]); p.poly([[0.4,0.6],[6.6,1.4],[7.6,2.8],[6.8,3.2],[5.6,2.4],[0.6,2]]); p.F(M.strap[0]); p.rect(1.4,0.6,3.4,0.6);
      p.F(M.strap[2]); p.rect(6.6,2.4,1,1.2);
    } else {
      // pé descalço, sujo, dedos tortos
      p.F(M.skin[1]); p.poly([[-3.6,-1.6],[3,-2],[8,0.6],[10.6,2.6],[10.4,4.8],[-4.2,5]]);
      p.F(M.rot[2]); p.poly([[-4.2,3.4],[10.4,3.6],[10.4,4.8],[-4.2,5]]);
      [[8.4,3.2],[9.8,3.6],[10.9,4]].forEach(([x,y])=>{ p.F(M.skin[1]); p.circle(P2(x,y),1); p.F(M.nail[2]); p.rect(x+0.1,y-0.4,0.7,0.7); });
      p.F(M.skin[0]); p.rect(1,-1.2,3,0.9);
    }
    p.id();
  }

  /* ---------- tronco ---------- */
  const TORSO=[[-9,3],[-10.4,-6],[-11.4,-16],[-12.4,-24],[-11.6,-31],[-8,-36],[-2,-38.4],[4.6,-37.6],[8.6,-34],[10,-28],[11,-22],[14,-16],[15.4,-9],[14,-2],[10,3.4]];
  function drawTorso(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    const out=W(sk,TORSO);
    // bermuda (cós) por baixo
    p.F(M.shorts[1]); p.poly(W(sk,[[-9.6,-3],[13.4,-3],[11,5],[-9.6,5]]));
    p.F(M.shorts[3]); p.poly(W(sk,[[-9.6,-3],[13.4,-3],[13.2,-1.8],[-9.6,-1.8]]));
    // camisa: corpo listrado; 3 passadas (luz, base, sombra) recortadas
    const shirtShape=W(sk,[[-9,-1],[-10.4,-6],[-11.4,-16],[-12.4,-24],[-11.6,-31],[-8,-36],[-2,-38.4],[4.6,-37.6],[8.6,-34],[10,-28],[11.4,-23],[15.6,-16.4],[16.8,-10],[15,-6],[11,-5.6],[8.6,-3.4],[5,-5],[2,-2.6],[-1.6,-3.6],[-5,-1.2]]);
    const paint=t=>clip(c,shirtShape,()=>{ p.F(M.shirt[t]); p.poly(shirtShape);
      for(let v=-8;v>=-36;v-=6.4){ p.F(M.stripe[t]); p.poly(W(sk,[[-14,v],[17,v],[17,v-2.6],[-14,v-2.6]])); p.F(M.trim[Math.min(3,t+(t===0?0:0))]); p.poly(W(sk,[[-14,v-2.6],[17,v-2.6],[17,v-3.4],[-14,v-3.4]])); }
    });
    paint(1);
    // luz no ombro/peito da frente
    clip(c,W(sk,[[0,-30],[6,-38],[12,-30],[12,-22],[16,-14],[15,-10],[10,-18],[6,-26]]),()=>paint(0));
    // sombra grande: costas e debaixo da barriga
    clip(c,W(sk,[[-14,4],[-14,-40],[-6,-40],[-8,-32],[-6.6,-22],[-4,-12],[2,-6],[16,-8],[16,4]]),()=>paint(2));
    clip(c,W(sk,[[-14,4],[-14,-40],[-10.4,-40],[-11.4,-30],[-10,-18],[-8,-8],[-6,4]]),()=>paint(3));
    // dobras / costuras (cor de sombra do material)
    p.F(M.shirt[3]);
    [[[-6,-14],[-1,-17],[-0.4,-16.2],[-5.4,-13.2]],[[2,-9],[8,-12],[8.4,-11.2],[2.6,-8.2]],[[4,-26],[8.6,-24],[8.6,-23.2],[4,-25.2]]].forEach(f=>p.poly(W(sk,f)));
    p.F(M.shirt[0]); [[[-3,-19],[2,-21.4],[2.4,-20.6],[-2.6,-18.2]],[[9,-17],[12,-14],[11.6,-13.4],[8.6,-16.4]]].forEach(f=>p.poly(W(sk,f)));
    // gola V branca
    p.F(M.trim[1]); p.poly(W(sk,[[-2.4,-38.4],[4.8,-37.6],[6.4,-35.6],[3.4,-32],[0.8,-35.4],[-1.6,-35.6]]));
    p.F(M.skin[2]); p.poly(W(sk,[[-1,-37.8],[4,-37.2],[3.2,-34.2],[1.2,-35.8]]));
    // barriga de fora (camisa subiu): pele, umbigo, pelos
    p.F(M.skin[1]); p.poly(W(sk,[[2,-2.6],[5,-5],[8.6,-3.4],[11,-5.6],[15,-6],[15.4,-2.4],[12,-1.6],[4,-1.4]]));
    p.F(M.skin[0]); p.poly(W(sk,[[9,-4.6],[13.4,-6],[13.6,-4.8],[10,-3.8]]));
    p.F(M.skin[2]); p.poly(W(sk,[[2,-1.4],[14,-2.4],[13.6,-1.6],[3,-0.8]]));
    p.F(M.skin[3]); const nv=Wp(sk,9.6,-2.6); p.rect(nv.x-0.5,nv.y-0.5,1.1,1.1);
    // rasgo grande na lateral (costas/flanco): borda de pano, carne viva, 2 costelas
    p.F(M.trim[2]); p.poly(W(sk,[[-10,-27],[-6.4,-29],[-3,-27.6],[-1,-24],[-1.6,-19],[-3.6,-15.4],[-7,-14.6],[-9.4,-17],[-10.6,-22]]));
    p.F(M.shirt[3]); p.poly(W(sk,[[-9.4,-26.4],[-6.4,-28.2],[-3.4,-27],[-1.8,-24],[-2.2,-19.4],[-4,-16],[-7,-15.4],[-9,-17.4],[-10,-22]]));
    p.F(M.flesh[3]); p.poly(W(sk,[[-8.8,-25.6],[-6.4,-27.2],[-4,-26],[-2.8,-23.4],[-3,-19.6],[-4.6,-16.8],[-7,-16.2],[-8.6,-18],[-9.4,-22]]));
    p.F(M.flesh[1]); p.poly(W(sk,[[-8,-24.6],[-6,-26],[-4.4,-25],[-3.6,-22.6],[-3.8,-20],[-5,-18],[-7,-17.4],[-8.2,-19],[-8.8,-22]]));
    p.F(M.flesh[0]); p.poly(W(sk,[[-5.6,-25.4],[-4.4,-24.6],[-4,-23],[-5,-23.6]]));
    p.F(M.flesh[2]); p.poly(W(sk,[[-8,-19.6],[-5,-18.6],[-6,-17.4],[-7.6,-18]]));
    p.F(M.bone[1]); p.poly(W(sk,[[-8.4,-22.8],[-4,-23.8],[-3.6,-22.6],[-8.2,-21.6]])); p.poly(W(sk,[[-8.2,-20],[-4.2,-20.8],[-4,-19.8],[-8,-19]]));
    p.F(M.bone[0]); p.poly(W(sk,[[-6.6,-23.3],[-4.6,-23.7],[-4.4,-23.1],[-6.4,-22.8]]));
    p.F(M.bone[3]); p.poly(W(sk,[[-8.2,-21.8],[-3.8,-22.6],[-3.8,-22.2],[-8.2,-21.4]]));
    p.F(M.blood[1]); p.poly(W(sk,[[-6.4,-15.6],[-5.4,-15.8],[-5.6,-11.4],[-6.2,-11]])); p.poly(W(sk,[[-3.6,-16.4],[-2.8,-16.8],[-3,-14],[-3.4,-13.8]]));
    p.F(M.blood[2]); p.poly(W(sk,[[-6.4,-11.6],[-5.4,-11.6],[-5.6,-10.4],[-6.2,-10.4]]));
    // manchas de sangue escorrido da boca no peito
    p.F(M.blood[2]); p.poly(W(sk,[[8.4,-34],[10.6,-30],[10.6,-26.4],[9.6,-27.6],[9.4,-24],[8.6,-28],[8,-31]]));
    p.F(M.blood[1]); p.poly(W(sk,[[8.8,-33.4],[10,-31],[9.8,-29],[9.2,-30.6]]));
    // pochete: alça + bolsa com zíper e fivela
    p.F(M.pouch[2]); p.poly(W(sk,[[-11,-6.4],[12,-7.6],[12,-5.8],[-11,-4.4]]));
    p.F(M.pouch[1]); p.poly(W(sk,[[4.6,-9.2],[13.6,-10],[16.6,-7.4],[16.4,-1.6],[13.6,0.4],[6,0.4],[3.8,-2.4],[3.8,-7]]));
    p.F(M.pouch[2]); p.poly(W(sk,[[3.8,-2.4],[16.4,-2.6],[16.4,-1.6],[13.6,0.4],[6,0.4]]));
    p.F(M.pouch[0]); p.poly(W(sk,[[6,-8.8],[13.6,-9.4],[15,-8],[6.4,-7.6]]));
    p.F(M.pouch[3]); p.poly(W(sk,[[4.4,-5.6],[16.2,-6.2],[16.2,-5.4],[4.4,-4.8]]));
    p.F(M.metal[1]); const zp=Wp(sk,14.8,-5.8); p.rect(zp.x-0.6,zp.y-0.4,1.4,2.2); p.F(M.metal[0]); p.rect(zp.x-0.6,zp.y-0.4,0.8,0.8);
    p.F(M.metal[2]); const bk=Wp(sk,-2,-5.6); p.rect(bk.x-1,bk.y-1.4,2.2,2.4);
    if(form==='plenilunar'){
      // espinhos de osso rompendo as costas
      p.F(M.bone[1]); [[-11.6,-30,-17,-34],[-12,-23,-18,-24],[-11,-16,-16.4,-14]].forEach(([u0,v0,u1,v1])=>{ const a=Wp(sk,u0,v0+1.6), b=Wp(sk,u1,v1), d=Wp(sk,u0+0.6,v0-1.6); p.poly([[a.x,a.y],[b.x,b.y],[d.x,d.y]]); });
      p.F(M.bone[0]); [[-12.4,-31],[-13,-24]].forEach(([u0,v0])=>{ const a=Wp(sk,u0,v0); p.rect(a.x-0.5,a.y-0.5,1.2,1); });
    }
    if(form!=='comum'){
      // veias que brilham saindo do rasgo
      p.F(M.glow[1]); [[[-9.4,-25],[-11.4,-30],[-10.6,-30.4],[-8.8,-25.6]],[[-2.4,-18],[1,-13],[0.4,-12.4],[-2.8,-17.4]],[[-2,-25],[2,-28],[2.4,-27.2],[-1.6,-24.2]]].forEach(f=>p.poly(W(sk,f)));
    }
  }

  /* ---------- cabeça ---------- */
  function drawHead(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.xf(sk.ha,sk.neck.x,sk.neck.y); c.scale(HS,HS);
    // pescoço grosso
    p.F(M.skin[1]); p.poly([[-5,4],[5.4,4],[6,-4],[-4.4,-6]]);
    p.F(M.skin[2]); p.poly([[-5,4],[-1,4],[-1.6,-5.4],[-4.4,-6]]);
    p.F(M.skin[3]); p.rect(2.4,-3,0.9,5);
    // crânio
    p.F(M.skin[1]); p.ell(2.4,-12.6,10.4,10);
    p.poly([[-4,-6],[11.6,-8],[13,-4.6],[6,-2.6],[-2,-3]]);
    // sombra da parte de trás/baixo do crânio
    p.F(M.skin[2]); p.poly([[-8,-16],[-5.6,-6],[0,-2.6],[6,-2.6],[2,-5],[-2,-9],[-3.4,-15],[-6,-19]]);
    p.F(M.skin[3]); p.poly([[-8,-15],[-7,-9],[-4.6,-5.2],[-5.4,-11]]);
    // luz no topo da careca
    p.F(M.skin[0]); p.ell(5,-20,4.6,1.8,-0.2);
    // orelha
    p.F(M.skin[1]); p.ell(-3.4,-11.6,2.4,3.4); p.F(M.skin[3]); p.ell(-3.2,-11.4,1.1,2); p.F(M.flesh[2]); p.rect(-4.4,-9,1.2,1.4);
    // cabelo ralo nas laterais/nuca
    p.F(M.hair[1]); p.poly([[-9.6,-15],[-6,-19.4],[-4.6,-18],[-7.4,-14],[-7.6,-9.6],[-9.2,-10.4]]);
    p.poly([[-6,-21],[-2,-22.6],[-3,-21],[-5.4,-19.6]]);
    p.F(M.hair[0]); p.rect(-7.6,-17,1,1.4); p.rect(-4,-21.6,1.4,0.8);
    // manchas de podridão
    p.F(M.rot[1]); p.ell(-1,-17,2.4,1.6); p.ell(4,-8,1.6,1.2); p.F(M.rot[2]); p.rect(-1.6,-17.4,1.2,1);
    // testa franzida pesada (sobrancelha)
    p.F(M.skin[3]); p.poly([[4,-15.4],[12.4,-15.2],[12.6,-13.8],[4.4,-14]]);
    p.F(M.skin[0]); p.poly([[4.6,-17.6],[11.6,-17.2],[11.8,-16.2],[4.6,-16.4]]);
    // olhos fundos e leitosos (o de trás menor)
    p.F(M.skin[3]); p.ell(8.4,-12,2.8,2.2);
    p.F(M.eye[1]); p.ell(8.8,-12,1.9,1.4); p.F(M.eye[0]); p.rect(8.4,-12.6,0.9,0.8);
    p.F(M.eye[2]); p.rect(9.6,-11.8,0.8,0.8);
    p.F(M.skin[3]); p.ell(12.4,-12,1,1.4); p.F(M.eye[1]); p.rect(12.1,-12.4,0.9,1);
    // olheira caída
    p.F(M.skin[2]); p.poly([[6,-10],[11,-9.6],[10,-8.6],[6.6,-8.8]]);
    // nariz apodrecido
    p.F(M.skin[1]); p.poly([[11.4,-12],[14.8,-8.4],[13.6,-7.2],[11.6,-8]]);
    p.F(M.skin[3]); p.rect(12.8,-8,1.2,0.9); p.F(M.skin[0]); p.rect(12.4,-11,1,1.4);
    // boca / dentes de cima / bochecha rasgada
    p.F(M.mouth[1]); p.poly([[5,-6.4],[13.6,-6.6],[13.4,-3],[5,-2.8]]);
    p.F(M.teeth[1]); [[7.4,-6.6,1.3,1.8],[9,-6.6,1.3,2.2],[10.6,-6.6,1.2,1.7],[12,-6.6,1.1,1.4]].forEach(([x,y,w,h])=>p.rect(x,y,w,h));
    p.F(M.teeth[3]); p.rect(9.8,-5,0.4,0.6);
    p.F(M.flesh[1]); p.poly([[3.4,-7],[6.4,-7.6],[7,-5.4],[5,-3.4],[3,-4.6]]);
    p.F(M.teeth[1]); p.rect(4.6,-6.8,1,1.4); p.rect(5.8,-6.6,0.9,1.2);
    p.F(M.flesh[2]); p.rect(3.4,-5,2,0.9);
    if(form!=='comum'){
      p.F(M.glow[0]); p.rect(8.2,-12.6,1.6,1.2); p.F(M.glow[1]); p.rect(12.1,-12.6,0.9,1.1);
      p.F(M.glow[2]); p.poly([[-2,-15],[1,-13],[0.6,-12.4],[-2.4,-14.4]]);
    }
    p.id();
  }
  function drawJaw(c,u,M,sk,P){
    const p=mkPen(c,u); const h=sk.H(2.6*HS,-4.6*HS); p.xf(sk.ha+rad(P.jaw),h.x,h.y); c.scale(HS,HS);
    // mandíbula frouxa e pesada, queixo
    p.F(M.skin[1]); p.poly([[-2,-1.6],[11.4,-0.8],[12.6,1.6],[11.6,6.4],[7,8.6],[0.6,7.4],[-2.6,3]]);
    p.F(M.skin[2]); p.poly([[-2.6,3],[0.6,7.4],[7,8.6],[11.6,6.4],[9.6,5.8],[4,6.2],[0,4]]);
    p.F(M.skin[3]); p.poly([[1,7.4],[7,8.6],[10,7.4],[4,7.4]]);
    p.F(M.rot[1]); p.ell(3.6,4,1.6,1.1); p.F(M.flesh[1]); p.poly([[8.6,3.4],[11.4,3],[11,5.4],[9,5.2]]); p.F(M.teeth[1]); p.rect(9.4,3.2,0.9,1.2);
    p.F(M.mouth[1]); p.poly([[2.6,-0.8],[10.6,-0.4],[10.6,1.6],[3,1.2]]);
    p.F(M.teeth[1]); [[4.4,-1,1.2,1.6],[6,-1,1.2,2],[7.6,-1,1.2,1.6],[9.2,-1,1.1,2.2]].forEach(([x,y,w,h])=>p.rect(x,y,w,h));
    p.F(M.skin[0]); p.rect(6,1.6,3.6,0.9);
    // baba/sangue pingando
    const L=2+(P.drool%4)*1.4+(P.jaw>26?2.4:0);
    p.F(M.blood[1]); p.poly([[10.4,5.6],[12,5],[11.6,5+L],[11,6+L]]); p.ell(11.3,6+L,1.1,1.1);
    p.F(M.blood[0]); p.rect(11,5.6,0.7,0.9);
    p.id();
  }
  function arcBand(p,c0,a0,a1,r0,r1,col,col2){ const n=10, pts=[]; for(let i=0;i<=n;i++){ const a=a0+(a1-a0)*i/n, rr=r1-(r1-r0)*0.15*(1-i/n); pts.push([c0.x+Math.cos(a)*rr,c0.y+Math.sin(a)*rr]); }
    for(let i=n;i>=0;i--){ const a=a0+(a1-a0)*i/n, rr=r0+(r1-r0)*(0.75*(1-i/n)); pts.push([c0.x+Math.cos(a)*rr,c0.y+Math.sin(a)*rr]); }
    p.F(col); p.poly(pts);
    if(col2){ const q=[]; for(let i=3;i<=n;i++){ const a=a0+(a1-a0)*i/n; q.push([c0.x+Math.cos(a)*(r1-0.6),c0.y+Math.sin(a)*(r1-0.6)]); } for(let i=n;i>=3;i--){ const a=a0+(a1-a0)*i/n; q.push([c0.x+Math.cos(a)*(r1-2.6),c0.y+Math.sin(a)*(r1-2.6)]); } p.F(col2); p.poly(q); } }
  function drawSmear(c,u,M,sk){
    const p=mkPen(c,u); p.id();
    [[sk.shF,sk.wrF],[sk.shB,sk.wrB]].forEach(([sh,w],k)=>{ const r=Math.hypot(w.x-sh.x,w.y-sh.y)+6, a1=Math.atan2(w.y-sh.y,w.x-sh.x);
      arcBand(p,sh,a1-2.1,a1+0.05,r-9,r,k?M.skin[1]:M.skin[0],k?null:M.trim[0]); });
  }

  /* ---------- montagem ---------- */
  const cache=PIX.cache();
  function frame(form,anim,fi,step=5,Pov,pk){
    const K=PIX.getK(), key=(pk!=null?'#'+pk+'|'+form:form+'|'+anim+'|'+fi+'|'+step)+'@'+K;
    const hit=cache.get(key); if(hit){ cache.delete(key); cache.set(key,hit); return hit; }
    const P=Pov?Object.assign({},REST,Pov):poseOf(anim,fi), M=mats(form), sk=skeleton(P);
    const parts=[
      {back:true, draw:(c,u)=>drawArm(c,u,M,sk,P,false)},
      {back:true, draw:(c,u)=>drawLeg(c,u,M,sk,P,false)},
      {draw:(c,u)=>drawTorso(c,u,M,sk,P,form)},
      {draw:(c,u)=>drawLeg(c,u,M,sk,P,true)},
      {draw:(c,u)=>drawHead(c,u,M,sk,P,form)},
      {draw:(c,u)=>drawJaw(c,u,M,sk,P)},
    ];
    if(P.smear) parts.push({noShade:true, smear:true, noRim:true, draw:(c,u)=>drawSmear(c,u,M,sk)});
    parts.push({draw:(c,u)=>drawArm(c,u,M,sk,P,true)});
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM[form]}); if(step>=4) heavyOutline(cv);
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._eye=sc(sk.H(8.8,-12)); cv._mouth=sc(sk.H(10,-3)); cv._hand=sc(sk.wrF); cv._head=sc(sk.H(3,-14));
    cache.set(key,cv); if(cache.size>900) cache.delete(cache.keys().next().value);
    return cv;
  }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame,framePose:function(form,anim,P,key){ return frame(form,anim,0,5,P,key); }};
})();
