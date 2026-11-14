/* ESTALADOR — fonte de arte (editável). Build: npm run art
   Estalador: ex-guia de turismo do Pelourinho, cego. Colete de guia desbotado (ocre com listras azuis),
   boné de aba mole, crachá sem nome, mochila pequena com megafone de mão. Fungo branco-leitoso cobre os olhos
   (filamentos saindo das órbitas) e abre em leque nas orelhas quando "escuta". Pescoço comprido, mandíbula que
   estala (anel sonoro visível), mãos de dedos longos tateando. Descalço, sandália só no pé esquerdo.
   Hi-bit: honra PIX.getK(). */
const ESTALADOR=(function(){
  const {rad,lerp,P2,mkPen,compose}=PIX;
  const FW=188, FH=156, GROUND=148, AX=84;
  const RIM={comum:'#c0e4f4', enluarado:'#9ff6ff', plenilunar:'#ffb46a'};

  /* ---------- materiais ---------- */
  function mats(form){
    const m={
      skin:['#e4ecdc','#bcc7bd','#7e8e86','#46525a'],
      rot:['#b2b494','#7e7e66','#545050','#30283a'],
      flesh:['#f6ae94','#c25a5e','#7a3a4a','#4a1c34'],
      bone:['#fff4d8','#dccfa6','#a09070','#605040'],
      fung:['#ffffff','#e8f0e0','#b4c4b0','#6e8076'],
      vest:['#f8da90','#d6a64a','#9a6c34','#5a3a24'],
      vstripe:['#86b0e2','#3f6ea8','#2a4a7c','#18284c'],
      tee:['#ece8dc','#b2aea4','#78747c','#44404e'],
      pants:['#b8b28a','#86805e','#5a5642','#34312a'],
      cap:['#eee4c2','#c2b28c','#88785e','#4e4238'],
      badge:['#ffffff','#dcd8cc','#9a968c','#5a5650'],
      pack:['#b0906c','#745840','#4a362a','#2a1c1a'],
      metal:['#f4f4f0','#bcc0c6','#7c808e','#444858'],
      sandal:['#e8a874','#ac663c','#703e26','#3e1e16'],
      hair:['#6a6252','#443c32','#2a2420','#161212'],
      mouth:['#7c2e3e','#4c1828','#2e0c1a','#1a0610'],
      teeth:['#fbf0c0','#d8c27c','#9a8650','#5e4e30'],
      blood:['#c84a3e','#8e2a2c','#5e1824','#3a0e1a'],
      nail:['#8a7a62','#54463c','#342a28','#1c1618'],
      ring:['#ffffff','#c4f0ff','#6ac8f0','#2a7ab0'],
      glow:['#fffbe0','#e8f0c0','#b0bc8a','#687250'],
    };
    if(form==='enluarado'){
      m.skin=['#dce0ff','#a2a8e2','#6a70ac','#3c3e76']; m.rot=['#b8a6e0','#8470b0','#56468a','#33285e'];
      m.flesh=['#f0b0ff','#b866d8','#7a3a9e','#46206a']; m.blood=['#b46ad8','#7e3ea6','#542474','#34144a'];
      m.fung=['#f4ffff','#9ff6ff','#4ad0e8','#1a7a9c']; m.ring=['#ffffff','#e8f2ff','#a8bce0','#6a7aa8'];
      m.glow=['#effffe','#7af4ff','#2ab0d8','#146a96'];
      m.vest=['#e0c8b4','#a4886e','#6e5a5a','#423446']; m.vstripe=['#8aa0e8','#4a5cb8','#323e86','#1e2458'];
      m.pants=['#a6a6c4','#74749a','#4c4c70','#2c2c46']; m.tee=['#d8d8f0','#a0a0c4','#6c6c94','#3e3e62'];
    }
    if(form==='plenilunar'){
      m.skin=['#ffd0ac','#e2866e','#a4464e','#5e1e36']; m.rot=['#d0806a','#9a4a4a','#682a3a','#3e1628'];
      m.flesh=['#ffc07a','#f06a3a','#a8302e','#5e1422']; m.blood=['#ff7a3a','#d43a26','#8a1c22','#4e0c18'];
      m.fung=['#fff6b8','#ffbc4a','#e2602a','#8a2414']; m.ring=['#fffbe0','#ffe08a','#ffa040','#b85a1e'];
      m.glow=['#fff6c0','#ffb43a','#e0581e','#8a2414'];
      m.vest=['#e8c890','#b08a50','#7a5236','#462a22']; m.vstripe=['#6a6aa0','#44447a','#2c2c54','#1a1a34'];
      m.pants=['#9a8a7a','#6a5a52','#46383a','#2a1e22']; m.cap=['#cab8a0','#968068','#665048','#3c2c2c'];
    }
    return punch(m);
  }
  const NAMES={skin:'Pele',rot:'Podridão',flesh:'Carne',bone:'Osso',fung:'Fungo (olhos e orelhas)',vest:'Colete de guia',vstripe:'Listra azul',tee:'Camiseta',pants:'Calça cargo',cap:'Boné de aba mole',badge:'Crachá',pack:'Mochila',metal:'Megafone',sandal:'Sandália',teeth:'Dentes',blood:'Sangue',ring:'Anel do estalo',glow:'Brilho'};
  function sat(h,k){ const [r,g,b]=PIX.hexRgb(h), y=(r+g+b)/3; return PIX.toHex(y+(r-y)*k,y+(g-y)*k,y+(b-y)*k); }
  const NOPUNCH={ring:1,fung:1,glow:1};
  function punch(m){ const o={}; for(const k in m){ const r=m[k]; o[k]=NOPUNCH[k]?[r[0],r[1],r[2],r[3]]:[sat(r[0],1.1),sat(r[1],1.16),PIX.mix(sat(r[2],1.1),'#2a1a4c',0.2),PIX.mix(r[3],'#140a24',0.34)]; } return o; }

  /* ---------- poses ---------- */
  // ângulos: 0 = pendurado, + = pra frente. na/nl = ângulo e esticada do pescoço. ear = leque de fungo (0..1).
  // ring = anéis do estalo (0 = nada). feel = dedos abertos tateando. spore = esporos subindo (morte).
  const REST={hx:0,rot:0,lift:0,lean:12,hunch:26,head:-18,na:14,nl:0,jaw:3,ear:0.35,ring:0,aFs:44,aFe:66,aBs:6,aBe:24,lFh:14,lFk:-8,lBh:-12,lBk:-22,fF:0,fB:0,flash:0,grip:0,feel:1,smear:0,spore:0,tilt:0};
  const S=Math.sin, C=Math.cos, PI=Math.PI, mx=Math.max;
  const ANIMS={
    idle:{nome:'Parado (escutando)',n:8,dur:i=>[170,170,170,150,70,110,150,170][i],pose:i=>{ const p=i/8*PI*2, s=S(p);
      return {hunch:26+2*s, lean:12+1*s, head:-18+7*S(p-0.6), tilt:5*S(p*0.5), ear:0.35+0.3*mx(0,S(p-1)), jaw:i===4?34:i===5?0:3+2*S(p), ring:i===5?1:i===6?2:0,
        aFs:44+6*S(p-0.4), aFe:66+8*S(p-1), aBs:6+3*S(p-0.3), aBe:24+5*S(p-0.8), hx:0.5*S(p+0.5), feel:1}; }},
    walk:{nome:'Andar tateando',n:8,dur:()=>135,pose:i=>{ const p=i/8*PI*2;
      const lFh=10+14*S(p), lBh=-10+10*S(p+PI);
      return {lFh, lFk:lFh-20*mx(0,C(p))-4, lBh, lBk:lBh-8-10*mx(0,C(p+PI)), fF:-10*mx(0,C(p)), fB:26*mx(0,C(p+PI))+6,
        lean:13+2*Math.abs(S(p)), hunch:26+2*S(2*p-0.6), head:-16+6*S(p-1.2), tilt:4*S(p), jaw:4+2*S(2*p), ear:0.3+0.15*S(p),
        aFs:52+16*S(p+0.6), aFe:76+12*S(p+0.2), aBs:8+10*S(p), aBe:24+10*S(p-0.5), hx:1*S(2*p), feel:1}; }},
    alert:{nome:'Ouviu! (estalo duplo)',n:7,dur:i=>[150,130,200,90,160,90,200][i],pose:i=>[
      {},
      {hunch:22,head:-8,tilt:10,ear:0.7,jaw:6,lean:8,aFs:30,aFe:50,hx:-1},
      {hunch:18,head:-2,tilt:16,ear:1,jaw:4,lean:6,aFs:20,aFe:40,aBs:4,aBe:16,hx:-2,lFh:6,lBh:-8},
      {hunch:18,head:-4,tilt:16,ear:1,jaw:38,lean:6,aFs:24,aFe:44,hx:-2},
      {hunch:18,head:-2,tilt:14,ear:1,jaw:0,ring:2,lean:6,aFs:24,aFe:44,hx:-2},
      {hunch:20,head:-6,tilt:12,ear:1,jaw:40,ring:3,lean:8,aFs:30,aFe:52,hx:-1},
      {hunch:24,head:-14,tilt:6,ear:0.9,jaw:0,ring:4,lean:12,aFs:50,aFe:74,aBs:20,aBe:40,hx:1}][i]},
    // ---- golpes (IA escolhe por distância/peso; hit = quadro do dano, reach = alcance em px) ----
    attack:{nome:'Mordida seca (pescoço de cobra)',n:8,hit:4,reach:34,dur:i=>[150,140,110,100,120,130,130,140][i],pose:i=>[
      {lean:6,hunch:20,head:-10,na:-6,nl:-2,jaw:10,ear:0.8,aFs:30,aFe:50,aBs:0,aBe:16,hx:-2,lFh:12,lBh:-14},
      {lean:-4,hunch:14,head:-4,na:-20,nl:-3,jaw:20,ear:1,aFs:10,aFe:30,aBs:-10,aBe:8,hx:-4,lFh:10,lFk:-10,lBh:-10,lBk:-22},
      {lean:22,hunch:28,head:-24,na:40,nl:6,jaw:44,ear:0.8,aFs:40,aFe:58,aBs:-14,aBe:-4,hx:4,lFh:26,lFk:4,lBh:-22,lBk:-30,fB:16},
      {lean:30,hunch:30,head:-30,na:58,nl:11,jaw:52,ear:0.6,aFs:50,aFe:62,aBs:-18,aBe:-8,hx:8,lFh:30,lFk:6,lBh:-26,lBk:-34,fB:20,smear:1},
      {lean:32,hunch:30,head:-26,na:60,nl:12,jaw:0,ear:0.6,ring:1,aFs:54,aFe:60,aBs:-18,aBe:-8,hx:9,lFh:30,lFk:6,lBh:-26,lBk:-34,fB:20},
      {lean:30,hunch:30,head:-22,na:54,nl:10,jaw:2,ear:0.6,ring:2,aFs:52,aFe:62,aBs:-14,aBe:-4,hx:8,lFh:28,lFk:6,lBh:-24,lBk:-32,fB:18},
      {lean:20,hunch:28,head:-20,na:30,nl:4,jaw:20,ear:0.5,aFs:46,aFe:64,aBs:0,aBe:16,hx:4,lFh:20,lBh:-18},
      {lean:13,hunch:26,head:-18,na:16,nl:0,jaw:10,hx:1}][i]},
    grab:{nome:'Agarrão forte (abraço de fungo)',n:10,hit:5,reach:36,dur:i=>[140,140,100,90,150,160,180,180,150,150][i],pose:i=>[
      {lean:4,hunch:20,head:-12,jaw:16,ear:0.9,aFs:-20,aFe:0,aBs:-30,aBe:-10,hx:-3,lFh:12,lBh:-12},
      {lean:-8,hunch:12,head:-4,jaw:28,ear:1,aFs:-50,aFe:-30,aBs:-60,aBe:-40,hx:-6,lFh:8,lFk:-12,lBh:-6,lBk:-20},
      {lean:20,hunch:24,head:-20,jaw:36,ear:1,aFs:100,aFe:118,aBs:90,aBe:110,hx:4,lFh:26,lFk:2,lBh:-22,lBk:-32,fB:14,smear:1},
      {lean:30,hunch:28,head:-24,jaw:40,ear:0.9,aFs:96,aFe:104,aBs:88,aBe:100,hx:9,lFh:32,lFk:8,lBh:-28,lBk:-36,fB:22},
      {lean:34,hunch:30,head:-24,jaw:20,ear:0.9,aFs:84,aFe:40,aBs:80,aBe:44,hx:11,lFh:32,lFk:8,lBh:-28,lBk:-36,fB:22,grip:1},
      {lean:36,hunch:32,head:-20,jaw:0,ear:1,aFs:76,aFe:20,aBs:72,aBe:24,hx:12,lFh:32,lFk:8,lBh:-28,lBk:-36,fB:22,grip:1,feel:0},
      {lean:34,hunch:34,head:-28,jaw:30,ear:1,ring:1,aFs:72,aFe:16,aBs:68,aBe:20,hx:11,lFh:30,lFk:6,lBh:-26,lBk:-34,fB:20,grip:1,feel:0},
      {lean:36,hunch:34,head:-22,jaw:4,ear:1,ring:2,aFs:74,aFe:18,aBs:70,aBe:22,hx:12,lFh:30,lFk:6,lBh:-26,lBk:-34,fB:20,grip:1,feel:0},
      {lean:24,hunch:28,head:-20,jaw:14,ear:0.7,aFs:60,aFe:60,aBs:40,aBe:50,hx:6,lFh:22,lBh:-18},
      {lean:13,hunch:26,head:-18,jaw:8,hx:1}][i]},
    screech:{nome:'Estalo sônico (atordoa em cone)',n:9,hit:4,reach:70,dur:i=>[160,180,200,160,110,110,120,150,160][i],pose:i=>[
      {lean:6,hunch:20,head:-6,na:0,jaw:10,ear:0.9,aFs:20,aFe:40,aBs:0,aBe:14,hx:-2},
      {lean:-6,hunch:10,head:10,na:-14,jaw:30,ear:1,aFs:-10,aFe:10,aBs:-20,aBe:-4,hx:-4,lFh:10,lBh:-8},
      {lean:-10,hunch:6,head:16,na:-20,jaw:60,ear:1,aFs:-24,aFe:-6,aBs:-30,aBe:-14,hx:-5,lFh:8,lBh:-6,lBk:-18},
      {lean:16,hunch:22,head:-20,na:30,nl:6,jaw:70,ear:1,aFs:-34,aFe:-20,aBs:-40,aBe:-26,hx:4,lFh:24,lFk:2,lBh:-20,lBk:-30,fB:14,ring:1},
      {lean:20,hunch:24,head:-24,na:36,nl:8,jaw:74,ear:1,aFs:-40,aFe:-26,aBs:-46,aBe:-30,hx:6,lFh:26,lFk:4,lBh:-22,lBk:-32,fB:16,ring:3,flash:0},
      {lean:20,hunch:24,head:-22,na:36,nl:8,jaw:70,ear:1,aFs:-40,aFe:-26,aBs:-46,aBe:-30,hx:6,lFh:26,lFk:4,lBh:-22,lBk:-32,fB:16,ring:4},
      {lean:18,hunch:24,head:-20,na:30,nl:6,jaw:56,ear:1,aFs:-30,aFe:-14,aBs:-36,aBe:-20,hx:5,lFh:24,lBh:-20,ring:5},
      {lean:14,hunch:26,head:-18,na:20,nl:2,jaw:24,ear:0.7,aFs:20,aFe:40,aBs:0,aBe:16,hx:2},
      {lean:12,hunch:26,head:-18,na:14,jaw:8,hx:1}][i]},
    hurt:{nome:'Dano (cabeça)',n:4,dur:i=>[80,110,130,150][i],pose:i=>[
      {lean:-8,hunch:8,head:6,na:-10,jaw:30,ear:0,aFs:-20,aFe:0,aBs:-30,aBe:-14,hx:-6,flash:1,lFh:12,lBh:-4},
      {lean:-4,hunch:12,head:0,na:-4,jaw:24,ear:0.1,aFs:-10,aFe:10,aBs:-20,aBe:-4,hx:-5,lFh:10,lBh:-6},
      {lean:6,hunch:20,head:-12,na:6,jaw:16,ear:0.2,aFs:20,aFe:40,aBs:-4,aBe:12,hx:-2},
      {lean:11,hunch:25,head:-17,jaw:10,ear:0.3,hx:0}][i]},
    hurtB:{nome:'Dano (desorientado, cabeça pro lado errado)',n:4,dur:i=>[80,120,140,150][i],pose:i=>[
      {lean:30,hunch:36,head:20,na:-30,tilt:-20,jaw:36,ear:1,aFs:30,aFe:-10,aBs:24,aBe:-16,hx:-7,flash:1,lFh:18,lFk:-14,lBh:-14,lBk:-30},
      {lean:26,hunch:34,head:16,na:-24,tilt:-18,jaw:30,ear:1,aFs:26,aFe:-4,aBs:20,aBe:-10,hx:-6,lFh:16,lFk:-12,lBh:-14,lBk:-28},
      {lean:18,hunch:30,head:-2,na:0,tilt:-6,jaw:20,ear:0.6,aFs:30,aFe:40,aBs:10,aBe:14,hx:-3},
      {lean:13,hunch:27,head:-16,jaw:10,ear:0.4,hx:-1}][i]},
    fall:{nome:'Derrubado',n:6,dur:i=>[90,90,90,110,140,260][i],pose:i=>[
      {lean:-12,hunch:8,head:4,jaw:34,ear:0,aFs:-40,aFe:-20,aBs:-46,aBe:-30,hx:-6,flash:1,lFh:20,lBh:0},
      {rot:-30,lean:-4,hunch:10,head:0,jaw:30,ear:0,aFs:-60,aFe:-40,aBs:-70,aBe:-50,hx:-4,lFh:40,lFk:30,lBh:20,lBk:10},
      {rot:-62,lean:0,hunch:12,head:-4,jaw:28,ear:0,aFs:-90,aFe:-70,aBs:-96,aBe:-80,hx:-6,lFh:50,lFk:40,lBh:30,lBk:24},
      {rot:-90,lean:4,hunch:14,head:-2,jaw:36,ear:0,aFs:-110,aFe:-120,aBs:-100,aBe:-110,hx:2,lFh:40,lFk:10,lBh:30,lBk:4},
      {rot:-84,lean:2,hunch:18,head:-10,jaw:30,ear:0.2,aFs:-120,aFe:-140,aBs:-104,aBe:-126,hx:2,lFh:46,lFk:20,lBh:34,lBk:10},
      {rot:-90,lean:0,hunch:16,head:-6,jaw:34,ear:0.1,aFs:-130,aFe:-150,aBs:-110,aBe:-136,hx:2,lFh:40,lFk:6,lBh:26,lBk:0}][i]},
    getup:{nome:'Levantar (tateando o chão)',n:6,dur:i=>[200,170,170,160,160,150][i],pose:i=>[
      {rot:-90,lean:0,hunch:16,head:-6,jaw:34,ear:0.1,aFs:-130,aFe:-150,aBs:-110,aBe:-136,hx:2,lFh:40,lFk:6,lBh:26,lBk:0},
      {rot:-60,lean:10,hunch:26,head:-20,jaw:20,ear:0.6,aFs:-50,aFe:-10,aBs:-60,aBe:-20,hx:-8,lFh:90,lFk:10,lBh:70,lBk:0},
      {rot:-30,lean:20,hunch:30,head:-30,jaw:16,ear:0.9,aFs:-10,aFe:10,aBs:-20,aBe:0,hx:-6,lFh:110,lFk:10,lBh:60,lBk:-60},
      {rot:0,lean:34,hunch:30,head:-34,jaw:30,ear:1,ring:1,aFs:30,aFe:10,aBs:20,aBe:4,hx:-4,lFh:78,lFk:-2,lBh:6,lBk:-86,fB:60},
      {rot:0,lean:22,hunch:28,head:-26,jaw:0,ear:0.8,ring:2,aFs:40,aFe:56,aBs:14,aBe:24,hx:-1,lFh:34,lFk:-14,lBh:-12,lBk:-40},
      {lean:12,hunch:26,head:-18,jaw:8}][i]},
    death:{nome:'Morte (orelhas murcham em esporos)',n:8,dur:i=>[90,150,160,170,150,140,160,600][i],pose:i=>[
      {lean:-10,hunch:8,head:8,jaw:40,ear:1,aFs:-34,aFe:-16,aBs:-40,aBe:-24,hx:-5,flash:1,lFh:14,lBh:-4},
      {lean:-4,hunch:12,head:14,jaw:50,ear:0.9,tilt:-14,aFs:-10,aFe:4,aBs:-16,aBe:0,hx:-6,lFh:10,lBh:-8,spore:1},
      {lean:6,hunch:22,head:0,jaw:46,ear:0.7,tilt:-20,aFs:4,aFe:6,aBs:0,aBe:2,hx:-4,lFh:40,lFk:-30,lBh:28,lBk:-50,fF:10,fB:30,spore:2},
      {lean:10,hunch:30,head:-6,jaw:48,ear:0.5,aFs:6,aFe:4,aBs:2,aBe:0,hx:-2,lFh:14,lFk:-92,lBh:6,lBk:-96,fF:100,fB:100,spore:3},
      {rot:16,lean:12,hunch:34,head:-8,jaw:48,ear:0.35,aFs:24,aFe:20,aBs:16,aBe:14,hx:0,lFh:2,lFk:-92,lBh:-6,lBk:-96,fF:90,fB:90,spore:4},
      {rot:50,lean:10,hunch:30,head:-12,jaw:44,ear:0.2,aFs:70,aFe:90,aBs:56,aBe:76,hx:4,lFh:-20,lFk:-70,lBh:-28,lBk:-74,fF:60,fB:60,spore:5},
      {rot:86,lean:2,hunch:16,head:-4,jaw:40,ear:0.05,aFs:150,aFe:170,aBs:110,aBe:150,hx:8,lFh:-4,lFk:-10,lBh:-8,lBk:-14,fF:10,fB:10,spore:6},
      {rot:90,lean:0,hunch:14,head:-2,jaw:42,ear:0,aFs:160,aFe:176,aBs:116,aBe:156,hx:8,lFh:-2,lFk:-6,lBh:-6,lBk:-10,fF:6,fB:6,spore:0,feel:0}][i]},
  };
  const EXK=['hx','lean','hunch','head','aFs','aFe','aBs','aBe','lFh','lFk','lBh','lBk','na'];
  function exag(P,f){ if(f===1||Math.abs(P.rot)>4) return P; EXK.forEach(k=>{ P[k]=REST[k]+(P[k]-REST[k])*f; }); P.jaw=Math.min(80,mx(0,REST.jaw+(P.jaw-REST.jaw)*f)); return P; }
  const EXF={idle:1.1,walk:1.12,alert:1.2,attack:1.25,grab:1.22,screech:1.2,hurt:1.3,hurtB:1.25,fall:1.1,getup:1.08,death:1.12};
  ZREACT.add(ANIMS,REST,{moves:{flail:["swipe","Braçada às cegas"]}}); // reações (voando, agarrado) + golpe extra — art-src/shared/zreact.js
  function poseOf(anim,i){ return exag(Object.assign({},REST,ANIMS[anim].pose(i)),EXF[anim]||1); }
  function heavyOutline(cv){ const g=cv.getContext('2d'), W=cv.width, H=cv.height, im=PIX.pix(cv), d=im.data;
    const isO=i=>d[i+3]===255&&d[i]===0x17&&d[i+1]===0x0b&&d[i+2]===0x1c, fill=i=>d[i+3]===255&&!isO(i);
    const add=[]; for(let y=2;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(d[i+3]) continue; const u=((y-1)*W+x)*4, u2=((y-2)*W+x)*4; if(isO(u)&&fill(u2)) add.push(i); }
    add.forEach(i=>{ d[i]=0x17; d[i+1]=0x0b; d[i+2]=0x1c; d[i+3]=255; }); g.putImageData(im,0,0); }

  /* ---------- esqueleto (magro, pernas compridas, pescoço longo) ---------- */
  const SPINE=40, TH=21, SH=20, UA=16, FA=15, VS=0.98, US=1, HB=10, HS=1.3, NL=4.4;
  const lp=(p,a,L)=>({x:p.x+Math.sin(rad(a))*L, y:p.y+Math.cos(rad(a))*L});
  function build(P,dy){
    const R=P.rot, hip={x:AX+P.hx, y:dy};
    const ra=rad(R), rc=Math.cos(ra), rs=Math.sin(ra);
    const HR=(lx,ly)=>({x:hip.x+lx*rc-ly*rs, y:hip.y+lx*rs+ly*rc});
    const hipF=HR(2.4,0), hipB=HR(-2.4,0);
    const kneeF=lp(hipF,P.lFh-R,TH), ankleF=lp(kneeF,P.lFk-R,SH), kneeB=lp(hipB,P.lBh-R,TH), ankleB=lp(kneeB,P.lBk-R,SH);
    const SS=[]; let x=hip.x, y=hip.y;
    for(let k=0;k<=SPINE;k++){ const t=k/SPINE, a=rad(R+P.lean+(P.hunch+HB)*Math.pow(t,1.3)); SS.push({x,y,a}); x+=Math.sin(a); y-=Math.cos(a); }
    const SP=(u,v)=>{ const f=Math.max(0,-v), k=Math.min(SPINE,Math.floor(f)), s=SS[k], r=f-k, a=s.a;
      const px=s.x+Math.sin(a)*r, py=s.y-Math.cos(a)*r; return {x:px+Math.cos(a)*u, y:py+Math.sin(a)*u}; };
    const T=(u,v)=>SP(u*US,v*VS);
    const top=SS[SPINE], sa=top.a, nb=T(2,-38);
    // pescoço: sai do topo da coluna num ângulo próprio e estica (mordida de cobra)
    const nA=sa+rad(P.na), nL=(NL+P.nl)*HS, neck={x:nb.x+Math.sin(nA)*nL, y:nb.y-Math.cos(nA)*nL};
    const shF=T(3,-32), shB=T(-3.4,-33);
    const ha=sa+rad(P.head-HB*0.8+P.tilt), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:neck.x+(lx*hc-ly*hs)*HS, y:neck.y+(lx*hs+ly*hc)*HS});
    const jp=H(-0.6,-5.6), ja=ha+rad(P.jaw), jc=Math.cos(ja), js=Math.sin(ja);
    const J=(lx,ly)=>({x:jp.x+(lx*jc-ly*js)*HS, y:jp.y+(lx*js+ly*jc)*HS});
    const elF=lp(shF,P.aFs-R,UA), wrF=lp(elF,P.aFe-R,FA), elB=lp(shB,P.aBs-R,UA), wrB=lp(elB,P.aBe-R,FA);
    const toe=(a,f)=>{ const t=rad(f+R); return {x:a.x+(11*Math.cos(t)-5*Math.sin(t))*1.3, y:a.y+(11*Math.sin(t)+5*Math.cos(t))*1.3}; };
    const hand=(e,w)=>{ const L=Math.hypot(w.x-e.x,w.y-e.y)||1; return {x:w.x+(w.x-e.x)/L*9,y:w.y+(w.y-e.y)/L*9}; };
    const hull=[[hand(elF,wrF),6],[hand(elB,wrB),6],[ankleF,5.6],[ankleB,5.6],[toe(ankleF,P.fF),0.5],[toe(ankleB,P.fB),0.5],[kneeF,5],[kneeB,5],[hip,8],[T(0,-18),10],[T(-2,-30),10],[H(1,-12),12],[J(8,4),6],[wrF,4],[wrB,4],[elF,4],[elB,4]];
    return {R,hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,SP,T,sa,nb,neck,nA,shF,shB,elF,wrF,elB,wrB,ha,H,ja,J,hull,ra};
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
  const Hl=(sk,list)=>list.map(([u,v])=>{ const q=sk.H(u,v); return [q.x,q.y]; });
  const Jl=(sk,list)=>list.map(([u,v])=>{ const q=sk.J(u,v); return [q.x,q.y]; });

  /* ---------- braço: comprido e fino, dedos longos tateando ---------- */
  function drawArm(c,u,M,sk,P,front){
    const p=mkPen(c,u), sh=front?sk.shF:sk.shB, el=front?sk.elF:sk.elB, wr=front?sk.wrF:sk.wrB; p._c=c; p.id();
    limb(p,M.skin,sh,el,9.6,8.2,{});
    const n=limb(p,M.skin,el,wr,8.4,6.8,{});
    p.F(M.skin[0]); p.circle(lerp(el,wr,0.05),1.1);
    p.F(M.skin[3]); const v0=lerp(el,wr,0.2), v1=lerp(el,wr,0.8); p.cap({x:v0.x-n.nx*0.9,y:v0.y-n.ny*0.9},{x:v1.x-n.nx*0.3,y:v1.y-n.ny*0.3},0.6,0.5);
    // manchas de fungo subindo pelo braço (micélio)
    p.F(M.fung[2]); const f0=lerp(el,wr,0.55); p.ell(f0.x+n.nx*1.4,f0.y+n.ny*1.4,1.6,1.1); p.F(M.fung[1]); p.rect(f0.x+n.nx*1.4-0.5,f0.y+n.ny*1.4-0.6,1,0.8);
    p.F(M.rot[1]); const r1=lerp(sh,el,0.72); p.ell(r1.x-n.nx*0.8,r1.y-n.ny*0.8,1.5,1.1);
    if(front){ p.F(M.flesh[2]); const w=lerp(el,wr,0.32); p.ell(w.x+n.nx*1.1,w.y+n.ny*1.1,1.8,1.2,Math.atan2(wr.y-el.y,wr.x-el.x)); p.F(M.flesh[1]); p.rect(w.x+n.nx*1.1-0.5,w.y+n.ny*1.1-0.5,1,1); }
    // manga da camiseta saindo do colete
    const s1=lerp(sh,el,0.4);
    limb(p,M.tee,sh,s1,12.6,11.4,{hl:0.5});
    const sn=sideN(sh,el);
    p.F(M.tee[3]); p.cap({x:s1.x-sn.nx*4.8,y:s1.y-sn.ny*4.8},{x:s1.x+sn.nx*4.8,y:s1.y+sn.ny*4.8},1,1);
    drawHand(p,M,el,wr,P,front);
  }
  function drawHand(p,M,el,wr,P,front){
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y); p._c.scale(1.5,1.5);
    const g=P.grip, fe=P.feel;
    p.F(M.skin[1]); p.poly([[-1,-2.8],[4.2,-3.2],[5.2,-0.8],[4.8,3],[-1,3]]);
    p.F(M.skin[2]); p.poly([[-1,1.2],[5,1],[4.8,3],[-1,3]]);
    p.F(M.skin[0]); p.rect(0.4,-2.6,3.2,0.8);
    // dedos compridos: abertos em leque quando tateia, fechados no agarrão
    for(let k=0;k<4;k++){
      const y0=-2.4+k*1.7, spread=fe?(k-1.5)*0.9:0, cv=g?1.5:0.35, L1=4.6-(k===3?1:0), L2=4.2-(k===3?0.9:0);
      const a1={x:4.8,y:y0}, b1={x:4.8+L1*(g?0.7:1),y:y0-cv+spread*0.8}, c1={x:b1.x+L2*(g?0.3:0.9),y:b1.y-L2*cv*(g?1:0.4)+spread*0.9};
      p.F(M.skin[1]); p.cap(a1,b1,1.6,1.4); p.cap(b1,c1,1.4,1.1);
      p.F(M.skin[2]); p.rect(a1.x+0.4,y0+0.3,L1-1,0.5);
      p.F(M.skin[3]); p.rect(b1.x-0.3,b1.y-0.2,0.6,0.6);
      p.F(M.nail[1]); p.ell(c1.x+0.3,c1.y,0.8,0.6);
    }
    p.F(M.skin[1]); p.cap(P2(1.6,-2.6),P2(4.6,-5.6+g*1.4),1.6,1.3); p.F(M.nail[1]); p.ell(5,-6+g*1.4,0.7,0.6);
    p.id();
  }

  /* ---------- perna: calça cargo puída; pé da frente descalço, de trás com sandália ---------- */
  function drawLeg(c,u,M,sk,P,front){
    const p=mkPen(c,u), hip=front?sk.hipF:sk.hipB, knee=front?sk.kneeF:sk.kneeB, ank=front?sk.ankleF:sk.ankleB; p.id();
    const n=limb(p,M.skin,knee,ank,7,5.8,{hl:0.5});
    p.F(M.rot[1]); const r=lerp(knee,ank,0.62); p.ell(r.x-n.nx*0.8,r.y-n.ny*0.8,1.3,2,Math.atan2(ank.y-knee.y,ank.x-knee.x)+PI/2);
    if(front){ p.F(M.fung[2]); const f=lerp(knee,ank,0.78); p.ell(f.x+n.nx*1.2,f.y+n.ny*1.2,1.4,1); p.F(M.blood[2]); const b=lerp(knee,ank,0.7); p.rect(b.x-n.nx*1.4,b.y-1,1,2.6); }
    // calça cargo até a canela, barra esfiapada (frente rasgada acima do joelho)
    const kb=lerp(hip,knee,front?1.18:1.32);
    limb(p,M.pants,hip,kb,12.4,10.8,{hl:0.55});
    const kn=sideN(hip,knee), dir={x:(knee.x-hip.x)/kn.L,y:(knee.y-hip.y)/kn.L};
    p.F(M.pants[3]); for(let k=-2;k<=2;k++){ const b={x:kb.x+kn.nx*k*2,y:kb.y+kn.ny*k*2}, L=k%2?2.4:1.2; p.poly([[b.x-kn.nx,b.y-kn.ny],[b.x+kn.nx,b.y+kn.ny],[b.x+dir.x*L,b.y+dir.y*L]]); }
    p.F(M.pants[2]); const f1=lerp(hip,kb,0.42); p.cap({x:f1.x-kn.nx*3,y:f1.y-kn.ny*3},{x:f1.x-kn.nx*0.4+dir.x*2.4,y:f1.y-kn.ny*0.4+dir.y*2.4},0.9,0.8);
    p.F(M.pants[0]); const f3=lerp(hip,kb,0.22); p.cap({x:f3.x-kn.nx*3,y:f3.y-kn.ny*3},{x:f3.x-kn.nx*1.2+dir.x*3,y:f3.y-kn.ny*1.2+dir.y*3},0.9,0.8);
    // bolso cargo + rasgo no joelho mostrando pele
    if(front){ const t=lerp(hip,kb,0.5); p.F(M.pants[2]); p.poly([[t.x-kn.nx*0.4-dir.x*2.4,t.y-kn.ny*0.4-dir.y*2.4],[t.x+kn.nx*3.4-dir.x*2.4,t.y+kn.ny*3.4-dir.y*2.4],[t.x+kn.nx*3.2+dir.x*3,t.y+kn.ny*3.2+dir.y*3],[t.x-kn.nx*0.2+dir.x*3,t.y-kn.ny*0.2+dir.y*3]]);
      p.F(M.pants[3]); p.cap({x:t.x-kn.nx*0.4-dir.x*2.4,y:t.y-kn.ny*0.4-dir.y*2.4},{x:t.x+kn.nx*3.4-dir.x*2.4,y:t.y+kn.ny*3.4-dir.y*2.4},0.8,0.8);
      const kk=lerp(hip,kb,0.86); p.F(M.pants[3]); p.ell(kk.x-kn.nx*1.6,kk.y-kn.ny*1.6,2.4,1.6,Math.atan2(dir.y,dir.x)); p.F(M.skin[2]); p.ell(kk.x-kn.nx*1.6,kk.y-kn.ny*1.6,1.6,1,Math.atan2(dir.y,dir.x)); }
    const fa=rad((front?P.fF:P.fB)+sk.R); p.xf(fa,ank.x,ank.y); c.scale(1.3,1.3);
    if(!front){
      // sandália de couro no pé esquerdo
      p.F(M.sandal[2]); p.poly([[-4.4,3],[11,2.8],[11.8,4.4],[-4.6,4.6]]); p.F(M.sandal[3]); p.rect(-4.6,4,16.4,0.7);
      p.F(M.skin[1]); p.poly([[-3.4,-1.6],[2.6,-1.8],[6.4,0.6],[10,2],[10.8,3],[-3.8,3]]);
      p.F(M.skin[2]); p.poly([[-3.8,1.6],[10.6,2.2],[10.8,3],[-3.8,3]]);
      p.F(M.sandal[1]); p.poly([[0.6,-1],[2.2,-1.2],[6.4,2.6],[5,3]]); p.poly([[-2.6,-0.6],[-1.4,-0.8],[-1,3],[-2.4,3]]);
      p.F(M.sandal[0]); p.rect(1,-0.8,1,0.6);
    } else {
      // pé descalço, comprido, dedos de unha grossa, fungo entre os dedos
      p.F(M.skin[1]); p.poly([[-3.6,-1.6],[3,-2],[8,0.6],[11.6,2.4],[11.6,4.6],[-4.2,4.8]]);
      p.F(M.rot[2]); p.poly([[-4.2,3.4],[11.6,3.6],[11.6,4.6],[-4.2,4.8]]);
      [[8.6,3],[10,3.4],[11.2,3.8]].forEach(([x,y])=>{ p.F(M.skin[1]); p.circle(P2(x,y),1); p.F(M.nail[2]); p.rect(x+0.1,y-0.4,0.7,0.7); });
      p.F(M.fung[2]); p.rect(9.2,2.4,0.8,0.8); p.F(M.skin[0]); p.rect(1,-1.2,3,0.9);
    }
    p.id();
  }

  /* ---------- tronco: camiseta + colete de guia listrado, crachá, mochila ---------- */
  const SIL=[[-6.6,3],[-7.4,-6],[-8,-16],[-8.6,-26],[-8.2,-33],[-5.8,-38.4],[-1.2,-40.6],[3.6,-40.2],[7.4,-36.6],[8.6,-31],[8.4,-24],[7.2,-17],[6.8,-10],[7.4,-4],[7.6,3]];
  function drawPack(c,u,M,sk,P){
    // mochila pequena nas costas com o megafone de mão espetado
    const p=mkPen(c,u); p.id();
    const bp=W(sk,[[-7,-34],[-12.6,-33],[-15,-28],[-15.4,-16],[-13.6,-12],[-7.4,-12.6]]);
    p.F(M.pack[1]); p.poly(bp);
    clip(c,bp,()=>{ p.F(M.pack[2]); p.poly(W(sk,[[-20,-30],[-13,-30],[-12.4,-10],[-20,-10]])); p.F(M.pack[3]); p.poly(W(sk,[[-20,-16],[-6,-16],[-6,-10],[-20,-10]]));
      p.F(M.pack[0]); p.poly(W(sk,[[-12,-33.4],[-8,-33.6],[-8,-32.6],[-12.6,-32.2]])); });
    p.F(M.pack[3]); p.poly(W(sk,[[-14.6,-22],[-8,-22.4],[-8,-21.6],[-14.6,-21.2]]));
    p.F(M.metal[2]); const z=Wp(sk,-12,-21.4); p.rect(z.x-0.6,z.y-0.4,1.2,1.4);
    // megafone: campânula pra cima e pra trás
    const m0=Wp(sk,-11,-33), m1=Wp(sk,-15.6,-41);
    p.F(M.metal[2]); p.cap(m0,lerp(m0,m1,0.5),2.4,3);
    p.F(M.metal[1]); p.cap(lerp(m0,m1,0.4),m1,3.6,9.6);
    p.F(M.metal[0]); p.cap(lerp(m0,m1,0.5),lerp(m0,m1,0.92),1,2.2);
    p.F(M.metal[3]); p.circle(m1,3.6); p.F(M.metal[2]); p.circle(m1,2.2); p.F(M.vstripe[1]); p.cap(lerp(m0,m1,0.34),lerp(m0,m1,0.44),3.8,4.6);
  }
  function drawTorso(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    // cós da calça e cinto
    p.F(M.pants[1]); p.poly(W(sk,[[-7.2,-3],[7.6,-3],[7.8,5],[-7.4,5]]));
    p.F(M.pants[2]); p.poly(W(sk,[[-7.4,-0.6],[7.8,-0.6],[7.8,5],[-7.4,5]]));
    p.F(M.pack[2]); p.poly(W(sk,[[-7.2,-3.4],[7.8,-3.4],[7.8,-1.6],[-7.2,-1.6]])); p.F(M.metal[1]); const fv=Wp(sk,5.2,-2.6); p.rect(fv.x-1,fv.y-1,2,2);
    // camiseta por baixo (aparece na frente, entre as abas do colete)
    const sil=W(sk,SIL);
    p.F(M.tee[1]); p.poly(sil);
    clip(c,sil,()=>{ p.F(M.tee[2]); p.poly(W(sk,[[-12,6],[-12,-44],[-1,-44],[0,-34],[1,-24],[2,-14],[3,-4],[10,6]]));
      p.F(M.tee[0]); p.poly(W(sk,[[3,-38],[7,-36],[8.6,-30],[7,-26],[4.6,-32]]));
      p.F(M.tee[3]); p.poly(W(sk,[[3.4,-16],[7.6,-17],[7.4,-10],[4.4,-8]]));
      // rasgo com costelas à mostra
      p.F(M.flesh[3]); p.poly(W(sk,[[2.4,-26],[6.8,-27],[7.4,-20],[3.4,-18.6]]));
      p.F(M.skin[2]); p.poly(W(sk,[[3,-25.4],[6.4,-26.2],[6.8,-20.6],[3.6,-19.4]]));
      p.F(form==='plenilunar'?M.bone[0]:M.bone[1]); [[-25],[-23],[-21]].forEach(([v])=>p.poly(W(sk,[[3,v],[6.8,v-0.8],[6.8,v],[3,v+0.8]])));
      p.F(M.blood[1]); p.poly(W(sk,[[4.6,-18.8],[5.4,-19],[5.2,-15],[4.8,-14.8]])); });
    // colete de guia (metade de trás inteira + aba da frente), listras horizontais azuis
    const back=W(sk,[[-7.6,-3],[-8.4,-12],[-9,-24],[-8.6,-33],[-6,-38.8],[-1.2,-41],[2.4,-40.6],[1.6,-34],[0.4,-26],[-0.2,-16],[0.2,-6],[1,-3]]);
    const flap=W(sk,[[3.6,-40.4],[7.8,-37],[9.2,-30],[9,-22],[8.2,-14],[8.4,-6],[8.6,-3],[5.6,-3],[5.4,-12],[6,-22],[6.2,-32],[4.6,-37]]);
    const paint=(shape,t)=>clip(c,shape,()=>{ p.F(M.vest[t]); p.poly(shape);
      for(let v=-8;v>=-38;v-=7.4){ p.F(M.vstripe[Math.min(3,t)]); p.poly(W(sk,[[-14,v],[14,v],[14,v-2.4],[-14,v-2.4]])); }
      p.F(M.vest[Math.min(3,t+1)]); [[-4,-30],[-5,-18]].forEach(([x,y])=>{ const q=Wp(sk,x,y); p.rect(q.x-0.6,q.y-0.6,1.2,1.2); }); });
    paint(back,1);
    clip(c,back,()=>{ clip(c,W(sk,[[-14,6],[-14,-46],[-3,-46],[-4,-36],[-3,-24],[-2,-12],[0,6]]),()=>paint(back,2)); });
    clip(c,back,()=>{ clip(c,W(sk,[[-14,6],[-14,-46],[-6.6,-46],[-7.4,-34],[-6.8,-20],[-5.2,6]]),()=>paint(back,3)); });
    clip(c,back,()=>{ clip(c,W(sk,[[-4,-46],[3,-46],[1.4,-37],[-3,-38]]),()=>paint(back,0)); });
    paint(flap,1);
    clip(c,flap,()=>{ clip(c,W(sk,[[7.4,-34],[14,-34],[14,0],[7.6,0],[8,-16]]),()=>paint(flap,2)); });
    clip(c,flap,()=>{ clip(c,W(sk,[[3,-42],[9,-42],[9,-34],[5,-34]]),()=>paint(flap,0)); });
    // bolsos do colete, costura e barra puída
    p.F(M.vest[3]); p.poly(W(sk,[[-6.6,-14],[-1.6,-14.4],[-1.4,-13.6],[-6.4,-13.2]])); p.poly(W(sk,[[5.8,-12],[8.2,-12.2],[8.2,-11.4],[5.8,-11.2]]));
    p.F(M.vest[2]); p.poly(W(sk,[[-6.4,-13.2],[-1.4,-13.6],[-1.6,-8.6],[-6.2,-8.4]]));
    p.F(M.vest[3]); for(let k=0;k<6;k++){ const q=Wp(sk,-7+k*1.6,-3); p.poly([[q.x-0.7,q.y-1],[q.x+0.7,q.y-1],[q.x,q.y+(k%2?1.6:0.8)]]); }
    // cordão do crachá em volta do pescoço + crachá balançando (sem nome legível)
    p.F(M.vstripe[1]); p.poly(W(sk,[[1.6,-40.8],[3,-40.6],[5.4,-26],[4.4,-25.8]])); p.poly(W(sk,[[4.4,-40.4],[5.6,-40],[6,-26],[5,-25.8]]));
    const bd=W(sk,[[3.4,-26.4],[8.2,-26.6],[8.4,-19],[3.6,-18.8]]);
    p.F(M.badge[1]); p.poly(bd);
    clip(c,bd,()=>{ p.F(M.badge[2]); p.poly(W(sk,[[3,-22],[9,-22],[9,-18],[3,-18]])); p.F(M.badge[0]); p.poly(W(sk,[[3.4,-26.4],[8.2,-26.6],[8.2,-25.6],[3.4,-25.4]]));
      p.F(M.vstripe[2]); p.poly(W(sk,[[3.4,-25.4],[8.4,-25.6],[8.4,-24],[3.4,-23.8]])); p.F(M.badge[3]); p.poly(W(sk,[[4.4,-22.6],[7.4,-22.8],[7.4,-22.2],[4.4,-22]])); p.poly(W(sk,[[4.4,-21.2],[6.6,-21.4],[6.6,-20.8],[4.4,-20.6]]));
      p.F(M.blood[1]); p.poly(W(sk,[[6.6,-20],[8.4,-20.4],[8.4,-18.6],[7,-18.8]])); });
    // alças da mochila
    p.F(M.pack[2]); p.poly(W(sk,[[-1.4,-40.6],[1,-40.6],[-3.4,-14],[-5.6,-14.6]])); p.F(M.pack[0]); p.poly(W(sk,[[-0.8,-40.4],[0,-40.4],[-4.4,-14.4],[-5,-14.6]]));
    // fungo brotando no ombro e manchas de bolor no colete
    p.F(M.fung[2]); p.ell(Wp(sk,-4,-38).x,Wp(sk,-4,-38).y,2.6,1.6); p.F(M.fung[1]); p.ell(Wp(sk,-3.4,-38.6).x,Wp(sk,-3.4,-38.6).y,1.4,0.9);
    p.F(M.rot[2]); p.ell(Wp(sk,-5,-24).x,Wp(sk,-5,-24).y,1.6,1.2);
    if(form==='plenilunar'){ p.F(M.bone[1]); [[-8.4,-30,-13,-34],[-8.8,-22,-13.6,-22]].forEach(([u0,v0,u1,v1])=>{ const a=Wp(sk,u0,v0+1.6), b=Wp(sk,u1,v1), d=Wp(sk,u0+0.6,v0-1.6); p.poly([[a.x,a.y],[b.x,b.y],[d.x,d.y]]); }); }
    if(form!=='comum'){ p.F(M.glow[1]); [[[-3,-38],[-1,-34],[-1.6,-33.6],[-3.6,-37.6]],[[-6,-14],[-3,-10],[-3.4,-9.6],[-6.4,-13.6]]].forEach(f=>p.poly(W(sk,f))); }
  }

  /* ---------- pescoço comprido ---------- */
  function drawNeck(c,u,M,sk,P){
    const p=mkPen(c,u); p.id();
    const a=sk.nb, b=sk.H(0.6,-2.6);
    const n=limb(p,M.skin,a,b,10,7.6,{hl:0.4});
    // tendões e pomo, anel de fungo no pescoço
    p.F(M.skin[3]); p.cap(lerp(a,b,0.15),lerp(a,b,0.85),0.7,0.6);
    p.F(M.skin[0]); const ad=lerp(a,b,0.5); p.circle({x:ad.x-n.nx*2.2,y:ad.y-n.ny*2.2},1.1);
    p.F(M.rot[1]); const r=lerp(a,b,0.3); p.ell(r.x+n.nx*1.6,r.y+n.ny*1.6,1.6,1.2);
  }

  /* ---------- cabeça: cega, fungo nos olhos, orelhas em leque, boné de aba mole ---------- */
  function drawEar(c,u,M,sk,P,form){
    // leque de fungo saindo da orelha (abre quando escuta); fica atrás do crânio
    const p=mkPen(c,u); p.xf(sk.ha,sk.neck.x,sk.neck.y); c.scale(HS,HS);
    const e=P.ear, big=form==='plenilunar'?1.3:1, o={x:-3,y:-12};
    const n=5, sp=0.5+e*1.1, base=-PI*0.62;
    for(let k=0;k<n;k++){ const t=n>1?k/(n-1):0.5, a=base-sp/2+sp*t, L=(7+e*9)*big*(k===2?1.15:1-Math.abs(t-0.5)*0.3);
      const tip={x:o.x+Math.cos(a)*L,y:o.y+Math.sin(a)*L}, s1={x:o.x+Math.cos(a-0.22)*L*0.55,y:o.y+Math.sin(a-0.22)*L*0.55}, s2={x:o.x+Math.cos(a+0.22)*L*0.55,y:o.y+Math.sin(a+0.22)*L*0.55};
      p.F(M.fung[2]); p.poly([[o.x,o.y],[s1.x,s1.y],[tip.x,tip.y],[s2.x,s2.y]]);
      p.F(M.fung[1]); p.poly([[o.x,o.y],[lerp(o,s1,0.9).x,lerp(o,s1,0.9).y],[lerp(o,tip,0.86).x,lerp(o,tip,0.86).y]]);
      p.F(M.fung[0]); p.circle(lerp(o,tip,0.92),0.7);
      if(e>0.6){ p.F(M.fung[3]); p.cap(lerp(o,tip,0.2),lerp(o,tip,0.7),0.5,0.4); } }
    // orelha deformada, grande
    p.F(M.skin[1]); p.ell(-3,-12,2.8,3.8); p.F(M.skin[3]); p.ell(-2.8,-11.6,1.3,2.2); p.F(M.fung[1]); p.ell(-2.8,-12.2,0.9,1.2);
  }
  function drawHead(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.xf(sk.ha,sk.neck.x,sk.neck.y); c.scale(HS,HS);
    // crânio estreito, testa alta
    p.F(M.skin[1]); p.ell(1.6,-13.6,7.8,8.2);
    p.poly([[-4.4,-8.6],[11.8,-10.2],[12.6,-7],[-2.4,-6]]);
    p.F(M.skin[2]); p.poly([[-6.4,-16],[-5,-8.6],[-1.6,-6],[4,-6],[0,-8.2],[-2.4,-11.6],[-3.4,-16.4]]);
    p.F(M.skin[3]); p.poly([[-6.4,-15],[-5.8,-10.6],[-3.4,-6.4],[-4.2,-11.6]]);
    // bochecha funda, maçã saltada
    p.F(M.skin[3]); p.poly([[2,-8.8],[7,-9.6],[6,-8],[2.6,-7.6]]);
    p.F(M.skin[0]); p.poly([[4.4,-11.2],[8.4,-11.6],[7.8,-10.6],[4.8,-10.4]]);
    // órbitas tomadas pelo fungo (cego): massa leitosa com filamentos escorrendo
    p.F(M.skin[3]); p.ell(7.8,-13.6,3.4,2.8);
    p.F(M.fung[2]); p.ell(8.2,-13.8,2.9,2.4);
    p.F(M.fung[1]); p.ell(8.4,-14.2,2.2,1.7); p.F(M.fung[0]); p.rect(7.6,-15.2,1.2,0.9);
    p.F(M.fung[3]); p.rect(9.4,-13.6,0.8,0.8);
    p.F(M.fung[2]); p.cap(P2(7.6,-12),P2(6.8,-8.6),0.7,0.4); p.cap(P2(9.4,-12.2),P2(10.2,-9.2),0.6,0.4); p.cap(P2(5.2,-14.4),P2(3,-15.2),0.6,0.4);
    p.F(M.skin[3]); p.ell(12.2,-14,1,1.5); p.F(M.fung[1]); p.ell(12.2,-14,0.7,1.1);
    // nariz fino e quebrado
    p.F(M.skin[1]); p.poly([[11.6,-13.6],[14.8,-10.2],[13.4,-9],[11.6,-9.6]]);
    p.F(M.skin[3]); p.rect(12.8,-9.8,1.2,0.8); p.F(M.skin[0]); p.rect(12.4,-12.6,0.9,1.4);
    // maxila de cima: dentes que estalam
    p.F(M.mouth[1]); p.poly([[-1.4,-7.4],[12.6,-8.8],[13,-6.2],[-1.4,-5.4]]);
    p.F(M.teeth[1]); for(let k=0;k<8;k++){ const x=0.4+k*1.6, h=k%2?1.5:2.1; p.rect(x,-6.8,1.1,h); }
    p.F(M.teeth[3]); for(let k=0;k<8;k++){ p.rect(0.4+k*1.6+0.6,-6.8,0.5,0.6); }
    // podridão
    p.F(M.rot[1]); p.ell(-1,-17.4,2,1.4); p.F(M.rot[2]); p.rect(-1.6,-17.8,1,1);
    // boné de aba mole, caído pra frente (sem logo)
    const dome=[]; for(let k=0;k<=12;k++){ const a=PI*1.02+k/12*PI*0.92; dome.push([1.4+Math.cos(a)*8.6,-15.6+Math.sin(a)*7.6]); }
    p.F(M.cap[1]); p.poly([...dome,[9.4,-18.4],[-6.8,-16.2]]);
    p.F(M.cap[2]); p.poly([[-7.4,-15.6],[-6,-19.6],[-3,-22.2],[-2,-20.6],[-4.4,-17.6],[-5,-15.2]]);
    p.F(M.cap[0]); p.poly([[2.4,-23],[6.4,-21.4],[8.6,-18.6],[5,-20],[1.8,-21.6]]);
    p.F(M.cap[3]); p.poly([[-6.8,-16.4],[9.4,-18.6],[9.4,-17.8],[-6.8,-15.6]]);
    p.F(M.cap[3]); p.rect(1,-23.6,1.2,1); // botão
    // aba mole e caída, borda desfiada
    p.F(M.cap[2]); p.poly([[7,-18.6],[13.8,-17.8],[17,-15.4],[16.4,-14.4],[12.6,-15.8],[7,-16.6]]);
    p.F(M.cap[1]); p.poly([[7,-18.6],[13.8,-17.8],[16.6,-15.6],[13,-16.6],[7,-17.6]]);
    p.F(M.cap[3]); p.poly([[12.6,-15.8],[16.4,-14.4],[16,-13.8],[12.4,-15.2]]);
    p.F(M.cap[0]); p.rect(9,-18.4,3,0.6);
    // cabelo ralo na nuca
    p.F(M.hair[1]); p.poly([[-6.8,-15],[-4,-15],[-4.6,-12],[-6.2,-9.4],[-7.2,-11.4]]);
    if(form!=='comum'){ p.F(M.glow[0]); p.rect(7.8,-14.8,1.8,1.4); p.F(M.glow[1]); p.rect(12,-14.6,0.8,1.2); }
    p.id();
  }
  function drawMouth(c,u,M,sk,P){
    const p=mkPen(c,u); p.id(); if(P.jaw<6) return;
    const cav=[...Hl(sk,[[-1,-6.6],[12.2,-7]]),...Jl(sk,[[13.6,0.4],[0,0.6]])];
    p.F(M.mouth[2]); p.poly(cav);
    clip(c,cav,()=>{ p.F(M.mouth[3]); p.poly([...Hl(sk,[[-1,-6.6],[5,-6.6]]),...Jl(sk,[[6,1],[0,1]])]);
      p.F(M.mouth[1]); p.cap(sk.J(6,0.4),sk.J(11,0.2),2.6,2); p.F(M.mouth[0]); p.cap(sk.J(7,-0.2),sk.J(10,-0.4),1,0.8); });
    if(P.jaw>16){ p.F(M.flesh[2]); p.cap(sk.H(1.4,-6),sk.J(2,0.2),1.2,1); }
  }
  function drawJaw(c,u,M,sk,P){
    const p=mkPen(c,u); const o=sk.J(0,0); p.xf(sk.ja,o.x,o.y); c.scale(HS,HS);
    const L=13.4;
    p.F(M.skin[1]); p.poly([[-1.4,-0.8],[L,0],[L+0.8,2],[L-0.6,4.4],[8,5.8],[1,5.4],[-2,2.4]]);
    p.F(M.skin[2]); p.poly([[-2,2.4],[1,5.4],[8,5.8],[L-0.6,4.4],[L-2,3.8],[4,4],[0,2.8]]);
    p.F(M.skin[3]); p.poly([[1.4,5.4],[8,5.8],[11,5],[5,4.8]]);
    p.F(M.mouth[1]); p.poly([[-1,-0.6],[L-0.4,0],[L-1,1.4],[-0.6,1.4]]);
    p.F(M.teeth[1]); for(let k=0;k<7;k++){ const x=0.6+k*1.7, h=k%2?1.6:2.2; p.rect(x,-h+0.6,1.1,h); }
    p.F(M.skin[0]); p.rect(6,1.8,4,0.8);
    p.F(M.fung[2]); p.ell(3,4.2,1.4,1); // bolor no queixo
    const L2=2+(P.jaw>30?2.4:0);
    p.F(M.blood[1]); p.poly([[L-1.6,3.8],[L,3.4],[L-0.4,3.8+L2],[L-1,4.6+L2]]); p.ell(L-0.7,4.6+L2,0.9,0.9);
    p.id();
  }
  /* anéis do estalo (FX na arte, sem sombreamento) */
  function drawRings(c,u,M,sk,P){
    const p=mkPen(c,u); p.id();
    const m=lerp(sk.H(12,-7),sk.J(12,0),0.5), a=sk.ha+rad(P.jaw*0.5)-0.1;
    const big=P.ring>=3, n0=big?3:2;
    for(let k=0;k<n0;k++){ const r=6+k*(big?10:7)+P.ring*(big?4.4:3); if(m.x+r*0.86>FW-3) continue;
      const th=Math.max(1.2,(big?3.4:2.4)-k*0.6), sp=big?0.72+k*0.06:0.5+k*0.08, nn=10, pts=[];
      for(let i=0;i<=nn;i++){ const t=a-sp+2*sp*i/nn; pts.push([m.x+Math.cos(t)*r,m.y+Math.sin(t)*r]); }
      for(let i=nn;i>=0;i--){ const t=a-sp+2*sp*i/nn, rr=r-th*(1-Math.abs(i/nn-0.5)*1.2); pts.push([m.x+Math.cos(t)*rr,m.y+Math.sin(t)*rr]); }
      p.F(k===0?M.ring[0]:k===1?M.ring[1]:M.ring[2]); p.poly(pts); }
    // faíscas do estalo
    p.F(M.ring[1]); [[6,-5,0.9],[8,4,0.8]].forEach(([x,y,r])=>{ const q={x:m.x+Math.cos(a)*x-Math.sin(a)*y,y:m.y+Math.sin(a)*x+Math.cos(a)*y}; p.circle(q,r); });
  }
  /* esporos subindo das orelhas (morte) */
  function drawSpores(c,u,M,sk,P){
    const p=mkPen(c,u); p.id(); const o=sk.H(-3,-14), s=P.spore;
    for(let k=0;k<7;k++){ const x=o.x+((k*37)%13-6)+Math.sin(s+k)*2, y=o.y-4-s*4-((k*23)%9)*1.6; if(y<3||x<2||x>FW-3) continue;
      p.F(k%3?M.fung[1]:M.fung[0]); p.circle({x,y},k%2?0.9:1.3); }
  }
  function drawSmear(c,u,M,sk){
    const p=mkPen(c,u); p.id();
    const sh=sk.nb, w=sk.H(10,-4), r=Math.hypot(w.x-sh.x,w.y-sh.y)+4, a1=Math.atan2(w.y-sh.y,w.x-sh.x);
    const n=8, pts=[]; for(let i=0;i<=n;i++){ const a=a1-1.2+1.25*i/n; pts.push([sh.x+Math.cos(a)*r,sh.y+Math.sin(a)*r]); }
    for(let i=n;i>=0;i--){ const a=a1-1.2+1.25*i/n, rr=r-2-5*(i/n); pts.push([sh.x+Math.cos(a)*rr,sh.y+Math.sin(a)*rr]); }
    p.F(M.skin[0]); p.poly(pts);
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
      {draw:(c,u)=>{ drawPack(c,u,M,sk,P); drawTorso(c,u,M,sk,P,form); }},
      {draw:(c,u)=>drawLeg(c,u,M,sk,P,true)},
      {draw:(c,u)=>drawNeck(c,u,M,sk,P)},
      {draw:(c,u)=>{ drawEar(c,u,M,sk,P,form); drawMouth(c,u,M,sk,P); drawHead(c,u,M,sk,P,form); }},
      {draw:(c,u)=>drawJaw(c,u,M,sk,P)},
    ];
    if(P.smear) parts.push({noShade:true, smear:true, noRim:true, draw:(c,u)=>drawSmear(c,u,M,sk)});
    parts.push({draw:(c,u)=>drawArm(c,u,M,sk,P,true)});
    if(P.ring) parts.push({noShade:true, noRim:true, smear:true, draw:(c,u)=>drawRings(c,u,M,sk,P)});
    if(P.spore) parts.push({noShade:true, noRim:true, smear:true, draw:(c,u)=>drawSpores(c,u,M,sk,P)});
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM[form]}); if(step>=4) heavyOutline(cv);
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._mouth=sc(lerp(sk.H(12,-7),sk.J(12,0),0.5)); cv._eye=sc(sk.H(8.2,-13.8)); cv._hand=sc(sk.wrF); cv._head=sc(sk.H(2,-14)); cv._ear=sc(sk.H(-3,-12));
    cache.set(key,cv); if(cache.size>900) cache.delete(cache.keys().next().value);
    return cv;
  }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame,framePose:function(form,anim,P,key){ return frame(form,anim,0,5,P,key); }};
})();
