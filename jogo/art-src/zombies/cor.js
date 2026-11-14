/* COR — fonte de arte (editável). Build: npm run art
   Corredor: ex-entregador de app. Magro, nervoso, pernas longas, tronco jogado pra frente,
   mochila térmica rasgada (silhueta quadrada), capacete de bike rachado, luva sem dedos.
   Hi-bit: honra PIX.getK(). */
const COR=(function(){
  const {rad,lerp,P2,mkPen,compose}=PIX;
  const FW=184, FH=150, GROUND=142, AX=74;
  const RIM={comum:'#b8dcf6', enluarado:'#9ff6ff', plenilunar:'#ffb46a'};

  /* ---------- materiais ---------- */
  function mats(form){
    const m={
      skin:['#e2e2bc','#a8ae8c','#6e7a76','#424a5a'],
      rot:['#b8a890','#857462','#5a4a50','#352838'],
      vein:['#9a7ab0','#6a4a88','#463066','#2a1a44'],
      flesh:['#f6ae94','#d0645e','#8e3446','#521c34'],
      bone:['#fff4d8','#dccfa6','#a09070','#605040'],
      jacket:['#7cd0c4','#3c9496','#2a6276','#1c3a54'],
      refl:['#ffffff','#d8e2ea','#98a6b8','#5c6680'],
      pants:['#8a8a9a','#5a5a6e','#3c3c50','#242436'],
      box:['#ffd070','#f0922e','#b05a2a','#683022'],
      boxIn:['#f0f4f8','#b8c4d0','#7c8aa0','#4a5470'],
      strap:['#6a6a7c','#3e3e50','#28283a','#161624'],
      helm:['#ffa494','#de4a3e','#962c38','#561a2c'],
      visor:['#a8e0ff','#4a86c0','#2c4e86','#1a2a52'],
      glove:['#5a5a68','#323240','#20202c','#121218'],
      shoe:['#f6f6f0','#c2c4c8','#84889a','#4c5064'],
      sole:['#ff9ab8','#e0507e','#9a2e5a','#5a1a3c'],
      hair:['#5a5048','#38302c','#24201e','#141212'],
      eye:['#fffbd0','#ecd86e','#b6a040','#6e6020'],
      mouth:['#8a3444','#4a1828','#2a0c18','#1a0610'],
      teeth:['#f8ecb8','#d6c27c','#9a8650','#5e4e30'],
      blood:['#c84a3e','#8e2a2c','#5e1824','#3a0e1a'],
      nail:['#7a6a5a','#4a3e38','#2e2626','#1a1418'],
      glow:['#fffbe0','#ecd86e','#b6a040','#6e6020'],
    };
    if(form==='enluarado'){
      m.skin=['#e0e4ff','#a4a8e6','#6a6eb0','#3e3e7a']; m.rot=['#b8a6e0','#8470b0','#56468a','#33285e'];
      m.vein=['#c8fbff','#5ad8f0','#2a90c0','#164e86']; m.flesh=['#f0b0ff','#b866d8','#7a3a9e','#46206a'];
      m.blood=['#b46ad8','#7e3ea6','#542474','#34144a']; m.eye=['#ffffff','#b8fbff','#4ad8f0','#1a8aa8'];
      m.glow=['#effffe','#7af4ff','#2ab0d8','#146a96']; m.jacket=['#9aa8e0','#5a64aa','#3c4282','#24265a'];
      m.box=['#e8c0f0','#b07ac8','#784e9a','#46306a']; m.helm=['#e8f0ff','#a8b4d8','#6a74a6','#3e4274']; m.pants=['#7a7aa0','#4e4e76','#343456','#20203a'];
    }
    if(form==='plenilunar'){
      m.skin=['#ffcaa6','#e2806a','#a4424e','#5e1e36']; m.rot=['#d0806a','#9a4a4a','#682a3a','#3e1628'];
      m.vein=['#fff0a0','#ffb43a','#e0581e','#8a2414']; m.flesh=['#ffc07a','#f06a3a','#a8302e','#5e1422'];
      m.blood=['#ff7a3a','#d43a26','#8a1c22','#4e0c18']; m.eye=['#fffbe0','#ffe04a','#ff8a2a','#b83a14'];
      m.glow=['#fff6c0','#ffb43a','#e0581e','#8a2414']; m.jacket=['#8aa0a8','#52646e','#36444e','#202a32'];
      m.box=['#f0e0c0','#c2a68a','#86685e','#4e3a3e']; m.helm=['#4e4a5a','#2e2a38','#1e1a26','#120e18']; m.pants=['#6e6070','#463c4c','#2e2634','#1c161e'];
    }
    return punch(m);
  }
  const NAMES={skin:'Pele',rot:'Podridão',vein:'Veias',flesh:'Carne',bone:'Osso',jacket:'Corta-vento',refl:'Faixa refletiva',pants:'Calça',box:'Mochila térmica',boxIn:'Forro térmico',strap:'Alça',helm:'Capacete',visor:'Viseira',glove:'Luva',shoe:'Tênis',sole:'Sola',eye:'Olho',teeth:'Dentes',blood:'Sangue',glow:'Brilho'};

  /* ---------- poses ---------- */
  const REST={hx:0,rot:0,lean:30,hunch:12,head:-34,jaw:10,aFs:-14,aFe:36,aBs:-24,aBe:24,lFh:28,lFk:-8,lBh:-20,lBk:-40,fF:0,fB:0,claw:0,smear:0,flash:0};
  const S=Math.sin, C=Math.cos, PI=Math.PI, mx=Math.max;
  const th=ph=>12+40*S(ph), shk=ph=>th(ph)-14-86*mx(0,C(ph));
  const ANIMS={
    idle:{nome:'Parado (tique nervoso)',n:8,dur:i=>[110,90,110,70,110,90,110,70][i],pose:i=>{ const p=i/8*PI*2, s=S(p), b=mx(0,S(2*p));
      const tw=i===3?1:i===7?-1:0;
      return {lean:30+2*s, hunch:12+2*S(p-0.6), head:-34+3*S(p-1)+tw*10, jaw:8+6*mx(0,S(p*2-0.4))+(tw?8:0), lFh:22+4*b, lFk:-4-8*b, lBh:-14+2*b, lBk:-34-6*b,
        aFs:-14+6*S(p-0.5)+tw*6, aFe:36+8*S(p-1), aBs:-24+5*S(p+0.4), aBe:24+6*S(p), hx:0.5*s, claw:i%2}; }},
    walk:{nome:'Correr',n:8,dur:()=>72,pose:i=>{ const p=i/8*PI*2;
      return {lFh:th(p), lFk:shk(p), lBh:th(p+PI), lBk:shk(p+PI), fF:-26*mx(0,-C(p))+30*mx(0,C(p)), fB:-26*mx(0,-C(p+PI))+30*mx(0,C(p+PI)),
        aFs:-20-46*S(p), aFe:-20-46*S(p)+80+10*S(p), aBs:-20+46*S(p), aBe:-20+46*S(p)+80-10*S(p),
        lean:36+3*S(2*p), hunch:14+3*S(2*p-0.5), head:-40+5*S(2*p-1.2), jaw:12+6*S(2*p), claw:1}; }},
    attack:{nome:'Investida',n:7,hit:3,reach:24,dur:i=>[180,70,60,120,120,130,140][i],pose:i=>[
      {lean:14,hunch:20,head:-26,jaw:20,aFs:-70,aFe:-30,aBs:-80,aBe:-40,lFh:44,lFk:-24,lBh:-4,lBk:-60,hx:-6,fB:30},
      {lean:52,hunch:10,head:-46,jaw:34,aFs:40,aFe:70,aBs:20,aBe:50,lFh:50,lFk:30,lBh:-46,lBk:-60,hx:6,fB:40},
      {lean:56,hunch:6,head:-62,jaw:42,aFs:84,aFe:90,aBs:74,aBe:84,lFh:56,lFk:40,lBh:-52,lBk:-70,hx:12,fB:50,smear:1,claw:1,smF:16,smB:6},
      {lean:54,hunch:6,head:-64,jaw:4,aFs:96,aFe:86,aBs:86,aBe:80,lFh:54,lFk:20,lBh:-48,lBk:-66,hx:16,fB:50,claw:1},
      {lean:46,hunch:14,head:-44,jaw:20,aFs:70,aFe:96,aBs:60,aBe:90,lFh:40,lFk:0,lBh:-34,lBk:-56,hx:12},
      {lean:36,hunch:14,head:-38,jaw:14,aFs:20,aFe:60,aBs:4,aBe:44,lFh:28,lFk:-6,lBh:-20,lBk:-40,hx:5},
      {lean:31,hunch:12,head:-34,jaw:10,hx:1}][i]},
    miss:{nome:'Tropeço',n:8,dur:i=>[80,100,120,150,150,140,150,140][i],pose:i=>[
      {lean:58,hunch:10,head:-46,jaw:30,aFs:90,aFe:100,aBs:70,aBe:90,lFh:56,lFk:30,lBh:-50,lBk:-70,hx:16,fB:50},
      {lean:64,hunch:16,head:-40,jaw:36,aFs:40,aFe:70,aBs:110,aBe:140,lFh:20,lFk:-10,lBh:-60,lBk:-100,hx:18,fB:80},
      {rot:24,lean:56,hunch:20,head:-56,jaw:40,aFs:60,aFe:20,aBs:40,aBe:4,lFh:30,lFk:-40,lBh:-40,lBk:-90,hx:18,fF:-20,fB:60},
      {rot:30,lean:50,hunch:24,head:-62,jaw:30,aFs:40,aFe:-6,aBs:24,aBe:-16,lFh:60,lFk:-40,lBh:-10,lBk:-80,hx:16,fF:-30,fB:40},
      {rot:16,lean:50,hunch:20,head:-56,jaw:24,aFs:20,aFe:-10,aBs:10,aBe:-20,lFh:70,lFk:-20,lBh:0,lBk:-60,hx:14,fF:-14},
      {lean:44,hunch:18,head:-30,jaw:30,aFs:10,aFe:40,aBs:-10,aBe:30,lFh:36,lFk:-14,lBh:-16,lBk:-44,hx:10},
      {lean:34,hunch:14,head:-20,jaw:20,aFs:-10,aFe:30,aBs:-20,aBe:20,lFh:26,lFk:-6,lBh:-14,lBk:-36,hx:6},
      {lean:31,hunch:12,head:-34,jaw:10,hx:3}][i]},
    // ---- ataques extras ----
    tackle:{nome:'Voadora (tackle de corpo inteiro)',n:8,hit:3,reach:30,warn:[0,1],dur:i=>[170,120,70,90,110,150,140,140][i],pose:i=>[
      {lean:20,hunch:24,head:-24,jaw:16,aFs:-60,aFe:-20,aBs:-70,aBe:-30,lFh:56,lFk:-40,lBh:6,lBk:-74,hx:-6,fB:40},
      {lean:30,hunch:30,head:-20,jaw:30,aFs:-80,aFe:-50,aBs:-90,aBe:-60,lFh:70,lFk:-50,lBh:16,lBk:-90,hx:-8,fB:50},
      {lean:72,hunch:4,head:-70,jaw:40,aFs:90,aFe:96,aBs:80,aBe:90,lFh:20,lFk:-10,lBh:-80,lBk:-86,hx:14,fF:20,fB:60,smear:1,claw:1,smF:-50,smB:-60},
      {lean:80,hunch:2,head:-74,jaw:46,aFs:100,aFe:100,aBs:92,aBe:96,lFh:10,lFk:-20,lBh:-90,lBk:-96,hx:20,fF:20,fB:60,claw:1},
      {lean:70,hunch:10,head:-60,jaw:30,aFs:70,aFe:60,aBs:60,aBe:50,lFh:40,lFk:10,lBh:-60,lBk:-80,hx:18,fB:50},
      {lean:52,hunch:16,head:-44,jaw:22,aFs:30,aFe:40,aBs:20,aBe:30,lFh:44,lFk:-10,lBh:-34,lBk:-60,hx:12},
      {lean:38,hunch:14,head:-36,jaw:14,aFs:0,aFe:40,aBs:-10,aBe:30,lFh:32,lFk:-8,lBh:-24,lBk:-44,hx:5},
      {lean:31,hunch:12,head:-34,jaw:10,hx:1}][i]},
    slaps:{nome:'Sequência de tapas',n:9,hit:[2,4,6],reach:28,dur:i=>[140,60,80,60,80,60,90,130,140][i],pose:i=>[
      {lean:22,hunch:16,head:-30,jaw:20,aFs:-40,aFe:20,aBs:60,aBe:110,lFh:30,lFk:-8,lBh:-22,lBk:-40,hx:-2},
      {lean:20,hunch:12,head:-28,jaw:30,aFs:150,aFe:180,aBs:-30,aBe:10,lFh:30,lFk:-8,lBh:-22,lBk:-40,hx:-1,claw:1},
      {lean:40,hunch:16,head:-40,jaw:36,aFs:70,aFe:40,aBs:-40,aBe:0,lFh:36,lFk:-4,lBh:-26,lBk:-44,hx:6,smear:1,claw:1,smF:150},
      {lean:24,hunch:12,head:-30,jaw:30,aFs:-30,aFe:10,aBs:150,aBe:180,lFh:32,lFk:-6,lBh:-24,lBk:-42,hx:3,claw:1},
      {lean:42,hunch:16,head:-42,jaw:40,aFs:-40,aFe:0,aBs:76,aBe:40,lFh:38,lFk:-2,lBh:-28,lBk:-46,hx:8,smear:1,claw:1,smB:150},
      {lean:20,hunch:10,head:-26,jaw:30,aFs:160,aFe:190,aBs:-30,aBe:10,lFh:34,lFk:-6,lBh:-26,lBk:-44,hx:6,claw:1},
      {lean:48,hunch:20,head:-46,jaw:44,aFs:80,aFe:30,aBs:-50,aBe:-10,lFh:44,lFk:0,lBh:-30,lBk:-50,hx:12,smear:1,claw:1,smF:160},
      {lean:40,hunch:16,head:-40,jaw:24,aFs:40,aFe:40,aBs:-20,aBe:20,lFh:36,lFk:-4,lBh:-26,lBk:-44,hx:8},
      {lean:31,hunch:12,head:-34,jaw:10,hx:2}][i]},
    hurt:{nome:'Dano (cabeça)',n:4,dur:i=>[80,110,120,150][i],pose:i=>[
      {lean:0,hunch:4,head:-6,jaw:26,aFs:-40,aFe:-10,aBs:-50,aBe:-20,hx:-6,flash:1,lFh:20,lFk:4,lBh:-6,lBk:-20},
      {lean:6,hunch:6,head:-14,jaw:22,aFs:-30,aFe:4,aBs:-40,aBe:-6,hx:-5,lFh:20,lFk:0,lBh:-8,lBk:-24},
      {lean:20,hunch:10,head:-26,jaw:16,aFs:-20,aFe:24,aBs:-30,aBe:14,hx:-2},
      {lean:28,hunch:12,head:-32,jaw:12,hx:0}][i]},
    hurtB:{nome:'Dano (barriga)',n:4,dur:i=>[80,120,130,150][i],pose:i=>[
      {lean:50,hunch:34,head:-20,jaw:34,aFs:50,aFe:-10,aBs:40,aBe:-16,hx:-7,flash:1,lFh:30,lFk:-20,lBh:-10,lBk:-40},
      {lean:46,hunch:30,head:-24,jaw:30,aFs:44,aFe:-4,aBs:36,aBe:-10,hx:-6,lFh:28,lFk:-16,lBh:-10,lBk:-38},
      {lean:36,hunch:20,head:-30,jaw:20,aFs:20,aFe:30,aBs:4,aBe:20,hx:-3},
      {lean:31,hunch:13,head:-34,jaw:12,hx:-1}][i]},
    fall:{nome:'Derrubado',n:6,dur:i=>[90,90,90,110,140,260][i],pose:i=>[
      {lean:-6,hunch:4,head:-4,jaw:30,aFs:-50,aFe:-30,aBs:-60,aBe:-40,hx:-6,flash:1,lFh:24,lFk:10,lBh:0,lBk:-10},
      {rot:-32,lean:0,hunch:6,head:-10,jaw:28,aFs:-80,aFe:-60,aBs:-90,aBe:-70,hx:-6,lFh:50,lFk:40,lBh:30,lBk:20},
      {rot:-64,lean:4,hunch:8,head:-14,jaw:26,aFs:-110,aFe:-90,aBs:-120,aBe:-100,hx:-4,lFh:60,lFk:50,lBh:40,lBk:30},
      {rot:-90,lean:6,hunch:8,head:-10,jaw:34,aFs:-130,aFe:-140,aBs:-120,aBe:-130,hx:8,lFh:50,lFk:16,lBh:34,lBk:6},
      {rot:-84,lean:4,hunch:12,head:-18,jaw:28,aFs:-140,aFe:-160,aBs:-124,aBe:-146,hx:8,lFh:56,lFk:26,lBh:40,lBk:14},
      {rot:-90,lean:2,hunch:10,head:-12,jaw:32,aFs:-150,aFe:-168,aBs:-130,aBe:-156,hx:8,lFh:50,lFk:10,lBh:30,lBk:2}][i]},
    getup:{nome:'Levantar',n:6,dur:i=>[180,140,140,130,130,130][i],pose:i=>[
      {rot:-90,lean:2,hunch:10,head:-12,jaw:32,aFs:-150,aFe:-168,aBs:-130,aBe:-156,hx:8,lFh:50,lFk:10,lBh:30,lBk:2},
      {rot:-60,lean:12,hunch:20,head:-26,jaw:22,aFs:-50,aFe:-10,aBs:-60,aBe:-20,hx:-4,lFh:100,lFk:10,lBh:76,lBk:0},
      {rot:-28,lean:24,hunch:24,head:-38,jaw:18,aFs:-10,aFe:10,aBs:-20,aBe:0,hx:-4,lFh:120,lFk:10,lBh:64,lBk:-70},
      {rot:0,lean:44,hunch:22,head:-44,jaw:20,aFs:40,aFe:14,aBs:30,aBe:6,hx:-2,lFh:84,lFk:-6,lBh:4,lBk:-92,fB:90},
      {rot:0,lean:38,hunch:16,head:-38,jaw:16,aFs:10,aFe:40,aBs:-6,aBe:30,hx:0,lFh:40,lFk:-16,lBh:-14,lBk:-46},
      {lean:31,hunch:12,head:-34,jaw:10}][i]},
    death:{nome:'Morte',n:8,dur:i=>[90,130,140,150,140,120,140,600][i],pose:i=>[
      {lean:-4,hunch:4,head:-2,jaw:34,aFs:-40,aFe:-20,aBs:-50,aBe:-30,hx:-5,flash:1,lFh:20,lFk:4,lBh:-4,lBk:-18},
      {lean:6,hunch:8,head:6,jaw:42,aFs:-20,aFe:0,aBs:-30,aBe:-10,hx:-6,lFh:16,lFk:0,lBh:-8,lBk:-24},
      {lean:16,hunch:20,head:-6,jaw:44,aFs:0,aFe:4,aBs:-6,aBe:0,hx:-4,lFh:44,lFk:-34,lBh:30,lBk:-56,fF:10,fB:30},
      {lean:20,hunch:26,head:-14,jaw:46,aFs:4,aFe:2,aBs:0,aBe:0,hx:-2,lFh:14,lFk:-92,lBh:6,lBk:-96,fF:100,fB:100},
      {rot:16,lean:22,hunch:30,head:-14,jaw:46,aFs:24,aFe:20,aBs:14,aBe:12,hx:0,lFh:2,lFk:-92,lBh:-6,lBk:-96,fF:90,fB:90},
      {rot:50,lean:16,hunch:26,head:-18,jaw:42,aFs:70,aFe:90,aBs:56,aBe:76,hx:6,lFh:-20,lFk:-70,lBh:-28,lBk:-74,fF:60,fB:60},
      {rot:86,lean:4,hunch:12,head:-8,jaw:38,aFs:150,aFe:170,aBs:110,aBe:150,hx:10,lFh:-4,lFk:-10,lBh:-8,lBk:-14,fF:10,fB:10},
      {rot:90,lean:0,hunch:10,head:-4,jaw:40,aFs:160,aFe:176,aBs:116,aBe:156,hx:10,lFh:-2,lFk:-6,lBh:-6,lBk:-10,fF:6,fB:6}][i]},
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
  const EXF={idle:1.12,walk:1.15,alert:1.25,attack:1.3,tackle:1.2,slaps:1.25,miss:1.2,hurt:1.3,hurtB:1.25,fall:1.15,getup:1.1,death:1.15};
  ZREACT.add(ANIMS,REST,{moves:{divebomb:["flop","Peixinho (mergulho de cara)"]}}); // reações (voando, agarrado) + golpe extra — art-src/shared/zreact.js
  function poseOf(anim,i){ return exag(Object.assign({},REST,ANIMS[anim].pose(i)),EXF[anim]||1); }

  /* ---------- esqueleto ---------- */
  const SPINE=34, TH=27, SH=26, UA=16, FA=16, HS=1.15;
  const lp=(p,a,L)=>({x:p.x+Math.sin(rad(a))*L, y:p.y+Math.cos(rad(a))*L});
  function build(P,dy){
    const R=P.rot, hip={x:AX+P.hx, y:dy};
    const ra=rad(R), rc=Math.cos(ra), rs=Math.sin(ra);
    const HR=(lx,ly)=>({x:hip.x+lx*rc-ly*rs, y:hip.y+lx*rs+ly*rc});
    const hipF=HR(2,0), hipB=HR(-2,0);
    const kneeF=lp(hipF,P.lFh-R,TH), ankleF=lp(kneeF,P.lFk-R,SH), kneeB=lp(hipB,P.lBh-R,TH), ankleB=lp(kneeB,P.lBk-R,SH);
    const SS=[]; let x=hip.x, y=hip.y;
    for(let k=0;k<=SPINE;k++){ const t=k/SPINE, a=rad(R+P.lean+P.hunch*Math.pow(t,1.4)); SS.push({x,y,a}); x+=Math.sin(a); y-=Math.cos(a); }
    const SP=(u,v)=>{ const f=Math.max(0,-v), k=Math.min(SPINE,Math.floor(f)), s=SS[k], r=f-k, a=s.a;
      const px=s.x+Math.sin(a)*r, py=s.y-Math.cos(a)*r; return {x:px+Math.cos(a)*u, y:py+Math.sin(a)*u}; };
    const T=SP, sa=SS[SPINE].a, neck=T(2,-SPINE);
    const shF=T(3,-29), shB=T(-3,-30);
    const elF=lp(shF,P.aFs-R,UA), wrF=lp(elF,P.aFe-R,FA), elB=lp(shB,P.aBs-R,UA), wrB=lp(elB,P.aBe-R,FA);
    const ha=sa+rad(P.head), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:neck.x+(lx*hc-ly*hs)*HS, y:neck.y+(lx*hs+ly*hc)*HS});
    const toe=(a,f)=>{ const t=rad(f+R); return {x:a.x+(12*Math.cos(t)-5.6*Math.sin(t))*1.2, y:a.y+(12*Math.sin(t)+5.6*Math.cos(t))*1.2}; };
    const hull=[[ankleF,6],[ankleB,6],[toe(ankleF,P.fF),0.5],[toe(ankleB,P.fB),0.5],[kneeF,4],[kneeB,4],[hip,7],[T(0,-16),8],[T(-14,-20),12],[H(3,-12),11],[wrF,3],[wrB,3],[elF,3],[elB,3]];
    return {R,hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,SP,T,sa,neck,shF,shB,elF,wrF,elB,wrB,ha,H,hull};
  }
  function skeleton(P){
    // em pé, só os pés (e a ponta do pé) tocam o chão; deitado, o corpo todo conta
    const a=build(P,0), lying=Math.abs(P.rot)>8; let m=-1e9;
    a.hull.forEach(([p,r],k)=>{ if(lying||k<4) m=Math.max(m,p.y+r); });
    return build(P,GROUND-m);
  }

  /* ---------- utilitários ---------- */
  const LV={x:0.55,y:-0.83};
  function sideN(a,b){ const dx=b.x-a.x, dy=b.y-a.y, L=Math.hypot(dx,dy)||1; let nx=-dy/L, ny=dx/L; if(nx*LV.x+ny*LV.y>0){ nx=-nx; ny=-ny; } return {nx,ny,L}; }
  function limb(p,R,a,b,wa,wb,o){ o=o||{};
    p.F(R[1]); p.cap(a,b,wa,wb);
    const {nx,ny}=sideN(a,b), sh=o.sh!=null?o.sh:0.6, ka=wa*(0.5-sh/2), kb=wb*(0.5-sh/2);
    p.F(R[2]); p.cap({x:a.x+nx*ka,y:a.y+ny*ka},{x:b.x+nx*kb,y:b.y+ny*kb},wa*sh,wb*sh);
    if(o.deep){ const k2a=wa*0.33, k2b=wb*0.33; p.F(R[3]); p.cap({x:a.x+nx*k2a,y:a.y+ny*k2a},{x:b.x+nx*k2b,y:b.y+ny*k2b},wa*0.32,wb*0.32); }
    if(o.hi!==false){ const e=lerp(a,b,o.hl!=null?o.hl:0.7), ha=wa*0.22, hb=wb*0.22; p.F(R[0]); p.cap({x:a.x-nx*ha,y:a.y-ny*ha},{x:e.x-nx*hb,y:e.y-ny*hb},wa*0.18,wb*0.16); }
  }
  const off=(q,n,k)=>({x:q.x+n.nx*k,y:q.y+n.ny*k});
  function clip(c,pts,fn){ c.save(); c.beginPath(); pts.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])); c.closePath(); c.clip(); fn(); c.restore(); }
  const W=(sk,list)=>list.map(([u,v])=>{ const q=sk.T(u,v); return [q.x,q.y]; });
  const Wp=(sk,u,v)=>sk.T(u,v);

  /* ---------- braço ---------- */
  function drawArm(c,u,M,sk,P,front,form){
    const p=mkPen(c,u), sh=front?sk.shF:sk.shB, el=front?sk.elF:sk.elB, wr=front?sk.wrF:sk.wrB; p._c=c; p.id();
    limb(p,M.skin,sh,el,7.6,6.6,{deep:true});
    limb(p,M.skin,el,wr,7,5.6,{deep:true,hl:0.5});
    const n=sideN(el,wr);
    // veias e tendões no antebraço magro
    p.F(M.vein[1]); p.cap(off(lerp(el,wr,0.2),n,-1),off(lerp(el,wr,0.5),n,-0.4),0.8,0.7); p.cap(off(lerp(el,wr,0.5),n,-0.4),off(lerp(el,wr,0.66),n,-1.2),0.7,0.6);
    p.F(M.skin[0]); p.circle(lerp(el,wr,0.04),1);
    // manga do corta-vento (rasgada no meio do braço)
    const s1=lerp(sh,el,front?0.62:0.9);
    limb(p,M.jacket,sh,s1,11,10,{hl:0.6,deep:true});
    const sn=sideN(sh,el), dir={x:(el.x-sh.x)/sn.L,y:(el.y-sh.y)/sn.L};
    p.F(M.refl[1]); const r0=lerp(sh,el,0.36); p.cap(off(r0,sn,-3.8),off(r0,sn,3.8),1.6,1.6);
    p.F(M.jacket[3]); for(let k=-2;k<=2;k++){ const b=off(s1,sn,k*1.8), L=k%2?2.4:1.2; p.poly([[b.x-sn.nx*0.9,b.y-sn.ny*0.9],[b.x+sn.nx*0.9,b.y+sn.ny*0.9],[b.x+dir.x*L,b.y+dir.y*L]]); }
    p.F(M.jacket[0]); const f0=lerp(sh,el,0.15); p.cap(off(f0,sn,-2),off(lerp(sh,el,0.28),sn,-0.6),0.8,0.7);
    if(front){ const w=lerp(el,wr,0.32); p.F(M.flesh[2]); p.ell(w.x+n.nx*0.4,w.y+n.ny*0.4,1.8,1.3); p.F(M.flesh[1]); p.ell(w.x,w.y,1.2,0.8); }
    drawHand(p,M,el,wr,P,form);
  }
  function drawHand(p,M,el,wr,P,form){
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y); p._c.scale(1.36,1.36);
    const cl=P.claw;
    // luva sem dedos
    p.F(M.glove[1]); p.poly([[-1.6,-2.8],[4.4,-3.2],[5,2.8],[-1.6,2.8]]);
    p.F(M.glove[2]); p.poly([[-1.6,0.8],[5,0.6],[5,2.8],[-1.6,2.8]]);
    p.F(M.glove[0]); p.rect(0,-2.6,3,0.8);
    p.F(M.strap[0]); p.rect(-1.2,-2.8,1,5.6);
    // dedos longos em garra
    for(let k=0;k<4;k++){ const y0=-2.4+k*1.5, A=rad(-24+k*14+(cl?18:0));
      const m1={x:4.4+Math.cos(A)*3,y:y0+Math.sin(A)*3}, A2=A+rad(cl?50:24), t={x:m1.x+Math.cos(A2)*2.8,y:m1.y+Math.sin(A2)*2.8};
      p.F(M.skin[1]); p.cap(P2(4.2,y0),m1,1.9,1.6); p.cap(m1,t,1.6,1.2);
      if(form==='plenilunar'){ p.F(M.bone[1]); p.cap(t,{x:t.x+Math.cos(A2)*2.6,y:t.y+Math.sin(A2)*2.6},1,0.4); } else { p.F(M.nail[1]); p.ell(t.x,t.y,0.7,0.6); }
    }
    p.F(M.skin[1]); p.cap(P2(1.6,-2.8),P2(4,-5.4),1.6,1.2); p.F(M.nail[1]); p.ell(4.2,-5.6,0.6,0.6);
    p.id();
  }

  /* ---------- perna ---------- */
  function drawLeg(c,u,M,sk,P,front){
    const p=mkPen(c,u), hip=front?sk.hipF:sk.hipB, knee=front?sk.kneeF:sk.kneeB, ank=front?sk.ankleF:sk.ankleB; p.id();
    // calça jogger fina, rasgada no joelho da frente
    limb(p,M.pants,hip,knee,11,8.6,{deep:true,hl:0.6});
    limb(p,M.pants,knee,lerp(knee,ank,0.86),8.4,7,{deep:true,hl:0.5});
    const n=sideN(hip,knee), n2=sideN(knee,ank);
    // dobras e costura lateral
    p.F(M.pants[3]); p.cap(off(lerp(hip,knee,0.1),n,0.6),off(lerp(knee,ank,0.7),n2,0.6),0.7,0.6);
    p.F(M.pants[2]); [0.35,0.6].forEach(t=>{ const q=lerp(hip,knee,t); p.cap(off(q,n,-3.4),off(lerp(hip,knee,t+0.08),n,-0.6),0.9,0.7); });
    p.F(M.pants[0]); const q0=lerp(hip,knee,0.22); p.cap(off(q0,n,-3),off(lerp(hip,knee,0.3),n,-1.2),0.8,0.7);
    // punho elástico
    const cf=lerp(knee,ank,0.84); p.F(M.pants[3]); p.cap(off(cf,n2,-3.2),off(cf,n2,3.2),1.6,1.6);
    // canela à mostra
    limb(p,M.skin,lerp(knee,ank,0.86),ank,5.6,5,{hi:false});
    if(front){
      // rasgo no joelho: pele, ralado, osso da patela
      p.F(M.pants[3]); p.ell(knee.x,knee.y,4,3.2,Math.atan2(ank.y-knee.y,ank.x-knee.x));
      p.F(M.skin[1]); p.ell(knee.x,knee.y,3,2.3,Math.atan2(ank.y-knee.y,ank.x-knee.x));
      p.F(M.flesh[1]); p.ell(knee.x+0.6,knee.y+0.2,1.8,1.4); p.F(M.bone[1]); p.ell(knee.x+1,knee.y-0.4,1,0.8);
      p.F(M.blood[1]); p.rect(knee.x+0.4,knee.y+1.6,0.9,3.2);
      p.F(M.refl[2]); const rf=lerp(knee,ank,0.6); p.cap(off(rf,n2,-3),off(rf,n2,3),1.1,1.1);
    }
    // tênis de corrida grandão
    const fa=rad((front?P.fF:P.fB)+sk.R); p.xf(fa,ank.x,ank.y); c.scale(1.2,1.2);
    p.F(M.shoe[1]); p.poly([[-4,-2.6],[2.4,-3],[6,-1],[10.4,1],[12,3],[11.6,4.4],[-4.6,4.4],[-5,1]]);
    p.F(M.shoe[2]); p.poly([[-5,1.6],[11.8,2.8],[11.6,4.4],[-4.6,4.4]]);
    p.F(M.shoe[0]); p.poly([[0,-2.4],[3,-2.6],[6,-0.6],[3.6,-0.4]]);
    p.F(M.sole[1]); p.poly([[-5,3.6],[12,3.6],[12.4,5.6],[-5.2,5.6]]);
    p.F(M.sole[0]); p.rect(-4,3.6,14,0.8); p.F(M.sole[3]); p.rect(-5,5,17.2,0.7);
    p.F(M.strap[1]); [[2.4,-1.8],[4.2,-1],[6,-0.2]].forEach(([x,y])=>p.rect(x,y,1.2,0.8));
    p.F(M.box[1]); p.poly([[-3.6,0],[1,0.6],[3.6,2.6],[-3.4,2.4]]);
    p.id();
  }

  /* ---------- mochila térmica ---------- */
  function drawBox(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    const B=[[-23,-4],[-6,-4],[-5,-35],[-22.6,-36]];
    const box=W(sk,B);
    p.F(M.box[1]); p.poly(box);
    // face lateral clara (topo) e sombra
    p.F(M.box[0]); p.poly(W(sk,[[-22.6,-36],[-5,-35],[-5.4,-32.6],[-22.6,-33.6]]));
    p.F(M.box[2]); p.poly(W(sk,[[-23,-4],[-6,-4],[-6,-7],[-23,-7]])); p.poly(W(sk,[[-23,-4],[-20,-4],[-19.6,-36],[-22.6,-36]]));
    p.F(M.box[3]); p.poly(W(sk,[[-23,-4],[-21.6,-4],[-21.2,-36],[-22.6,-36]]));
    // costuras/viés
    p.F(M.box[3]); p.poly(W(sk,[[-20,-30],[-7.6,-29.6],[-7.6,-29],[-20,-29.4]])); p.poly(W(sk,[[-19.6,-10],[-7.4,-10],[-7.4,-9.4],[-19.6,-9.4]]));
    p.F(M.box[0]); p.poly(W(sk,[[-19,-28.6],[-9,-28.4],[-9,-27.8],[-19,-28]]));
    // faixa refletiva
    p.F(M.refl[1]); p.poly(W(sk,[[-20,-19],[-6,-19],[-6,-16.6],[-20,-16.6]])); p.F(M.refl[0]); p.poly(W(sk,[[-20,-19],[-12,-19],[-12,-18.2],[-20,-18.2]]));
    // rasgo com forro térmico prateado e a tampa caída
    p.F(M.box[3]); p.poly(W(sk,[[-17.4,-27],[-11,-26],[-9,-22],[-13,-21],[-16,-23.4]]));
    p.F(M.boxIn[1]); p.poly(W(sk,[[-16.6,-26.2],[-11.4,-25.4],[-10,-22.4],[-13,-21.8],[-15.6,-23.4]]));
    p.F(M.boxIn[0]); p.poly(W(sk,[[-15,-25.6],[-12.4,-25],[-12.8,-24],[-14.6,-24.4]]));
    p.F(M.boxIn[3]); p.poly(W(sk,[[-15.6,-23.4],[-13,-21.8],[-12,-22.4],[-14.4,-23.6]]));
    // amassado e sujeira
    p.F(M.box[2]); p.poly(W(sk,[[-18,-13],[-14,-14.4],[-11,-12],[-14,-11.4]]));
    p.F(M.blood[2]); p.poly(W(sk,[[-9,-14],[-7,-15],[-6.4,-8],[-7.4,-7.4],[-8,-11]]));
    // zíper/alça de cima
    p.F(M.strap[1]); p.poly(W(sk,[[-18,-36.4],[-11,-36],[-10.4,-38.6],[-17,-39]])); p.F(M.strap[3]); p.poly(W(sk,[[-16.4,-37],[-12,-36.8],[-12,-37.6],[-16.4,-37.8]]));
    if(form!=='comum'){ p.F(M.glow[1]); p.poly(W(sk,[[-15.4,-24.4],[-12,-23.6],[-12.4,-23],[-15,-23.8]])); }
  }

  /* ---------- tronco ---------- */
  function drawTorso(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    // calça (cós)
    p.F(M.pants[1]); p.poly(W(sk,[[-6.6,-3],[7.4,-3],[6.6,4],[-6.6,4]]));
    p.F(M.pants[3]); p.poly(W(sk,[[-6.6,-3],[7.4,-3],[7.4,-2],[-6.6,-2]]));
    const J=W(sk,[[-6.8,-1],[-7.4,-10],[-8,-20],[-7.6,-28],[-4.6,-34],[1,-36],[6.2,-34.6],[8,-30],[7.4,-22],[8.4,-14],[8.6,-6],[7.6,-0.6]]);
    const paint=t=>clip(c,J,()=>{ p.F(M.jacket[t]); p.poly(J);
      p.F(M.refl[Math.min(3,t)]); p.poly(W(sk,[[-9,-20],[10,-20],[10,-17.6],[-9,-17.6]])); });
    paint(1);
    clip(c,W(sk,[[1,-36],[8,-32],[9,-14],[4,-10],[3,-24]]),()=>paint(0));
    clip(c,W(sk,[[-10,6],[-10,-38],[-3,-38],[-4.6,-28],[-3,-16],[-1,-6],[10,-4],[10,6]]),()=>paint(2));
    clip(c,W(sk,[[-10,6],[-10,-38],[-6.4,-38],[-6.6,-26],[-5.4,-12],[-4,6]]),()=>paint(3));
    // zíper central + gola alta
    p.F(M.jacket[3]); p.poly(W(sk,[[5.4,-33],[6,-33],[6.6,-1],[6,-1]]));
    p.F(M.refl[2]); [-30,-26,-22,-14,-10,-6].forEach(v=>p.poly(W(sk,[[5.2,v],[6.6,v],[6.6,v-0.6],[5.2,v-0.6]])));
    p.F(M.jacket[1]); p.poly(W(sk,[[-3,-34],[2,-37.4],[7.4,-35.6],[7,-32.4],[2,-34],[-2,-32]]));
    p.F(M.jacket[0]); p.poly(W(sk,[[1,-37],[6.6,-35.4],[6.6,-34.6],[1,-36]]));
    // dobras
    p.F(M.jacket[3]); [[[-5,-26],[0,-24],[0.2,-23.4],[-5,-25.2]],[[0,-12],[5,-9],[4.6,-8.4],[-0.2,-11.2]],[[-4,-8],[1,-5],[0.6,-4.4],[-4.2,-7.2]]].forEach(f=>p.poly(W(sk,f)));
    p.F(M.jacket[0]); [[[2,-28],[5,-26],[4.8,-25.4],[1.8,-27.4]]].forEach(f=>p.poly(W(sk,f)));
    // rasgo na barriga com costelas magras
    p.F(M.jacket[3]); p.poly(W(sk,[[0.6,-15.6],[5,-16],[7.4,-12],[6,-6.6],[2,-7],[0.4,-11]]));
    p.F(M.skin[2]); p.poly(W(sk,[[1.2,-15],[4.8,-15.2],[6.6,-12],[5.4,-7.4],[2.4,-7.8],[1,-11]]));
    p.F(M.skin[1]); [[-14.2],[-12],[-9.8]].forEach(([v])=>p.poly(W(sk,[[1.6,v],[6,v-0.4],[6,v+0.6],[1.8,v+1]])));
    p.F(M.flesh[2]); p.poly(W(sk,[[3,-9],[5.6,-9.4],[5.2,-7.6],[3.2,-7.8]]));
    p.F(M.blood[1]); p.poly(W(sk,[[3.6,-7.6],[4.6,-7.8],[4.4,-3],[3.8,-2.6]]));
    // alças da mochila (por cima do ombro e do peito)
    p.F(M.strap[1]); p.poly(W(sk,[[-6,-33],[-2,-35],[3,-30],[4,-21],[2.4,-21],[1.2,-29],[-3,-32]]));
    p.F(M.strap[2]); p.poly(W(sk,[[3,-30],[4,-21],[3.2,-21],[2.2,-29]]));
    p.F(M.strap[0]); p.poly(W(sk,[[-4,-33.6],[-2,-34.4],[0,-32.4],[-2,-32]]));
    p.F(M.refl[0]); const bk=Wp(sk,3,-24); p.rect(bk.x-0.9,bk.y-0.9,1.9,1.6);
    p.F(M.strap[1]); p.poly(W(sk,[[-6.8,-8],[8,-9.6],[8,-8],[-6.8,-6.4]]));
    if(form!=='comum'){ p.F(M.glow[1]); p.poly(W(sk,[[1,-15],[-2,-19],[-1.4,-19.4],[1.6,-15.4]])); p.poly(W(sk,[[5.6,-7.4],[7.6,-4],[7,-3.8],[5.2,-7]])); }
  }

  /* ---------- cabeça ---------- */
  function drawHead(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.xf(sk.ha,sk.neck.x,sk.neck.y); c.scale(HS,HS);
    // pescoço fino, tendões
    p.F(M.skin[1]); p.poly([[-3.6,4],[3.6,4],[4,-5],[-2.6,-6]]);
    p.F(M.skin[2]); p.poly([[-3.6,4],[-0.6,4],[-1,-5.6],[-2.6,-6]]);
    p.F(M.vein[1]); p.rect(1.6,-4,0.8,6); p.F(M.skin[3]); p.rect(0.2,-3,0.7,5);
    // crânio alongado, rosto chupado
    p.F(M.skin[1]); p.ell(2,-12.4,8.8,9.2);
    p.poly([[-2.6,-6],[10,-8.6],[12.4,-5],[7,-2],[0,-2.4]]);
    p.F(M.skin[2]); p.poly([[-6.4,-14],[-4,-6],[0,-2.4],[4,-2.2],[1,-5],[-2,-9],[-3,-14]]);
    p.F(M.skin[3]); p.poly([[-6.6,-13],[-5.8,-8.4],[-3.6,-5],[-4.4,-10]]);
    // bochecha funda
    p.F(M.skin[3]); p.poly([[3.6,-9],[8,-8.6],[7,-6.6],[4,-6.8]]);
    p.F(M.skin[0]); p.poly([[5,-11.6],[9.6,-11],[9,-10.2],[5.4,-10.6]]);
    // orelha
    p.F(M.skin[1]); p.ell(-2.8,-11,2,3); p.F(M.skin[3]); p.ell(-2.6,-10.8,0.9,1.8);
    // olhos esbugalhados, nervosos
    p.F(M.skin[3]); p.ell(7.6,-13.2,2.8,2.4);
    p.F(M.eye[1]); p.ell(8,-13.2,2.1,1.8); p.F(M.eye[0]); p.rect(7.4,-14,1,0.8);
    p.F(M.mouth[3]); p.rect(8.8,-13.4,1,1);
    p.F(M.skin[3]); p.ell(11.4,-13.4,1,1.5); p.F(M.eye[1]); p.rect(11.1,-14,0.9,1.1);
    p.F(M.vein[1]); p.rect(5.2,-12.6,1.4,0.6); p.rect(9.4,-11.6,1,0.6);
    // nariz em ponta
    p.F(M.skin[1]); p.poly([[10.6,-13],[14,-9],[12.6,-8.2],[10.8,-9]]);
    p.F(M.skin[3]); p.rect(12,-8.8,1.2,0.8);
    // boca sem lábio: dentes à mostra de orelha a orelha
    p.F(M.mouth[1]); p.poly([[3.6,-7],[12.6,-7.2],[12.4,-4],[4,-3.8]]);
    p.F(M.teeth[1]); p.poly([[4.6,-7],[12.4,-7.2],[12.4,-5.6],[4.6,-5.6]]);
    p.F(M.teeth[3]); [6.4,8,9.6,11].forEach(x=>p.rect(x,-7,0.5,1.4));
    p.F(M.flesh[1]); p.poly([[2.6,-7.6],[4.8,-8],[5,-5.4],[3,-4.6]]);
    // capacete de bike rachado
    p.F(M.helm[1]); p.poly([[-8,-13],[-7,-19],[-3,-23.6],[3,-25],[9,-23.4],[12.4,-19],[12.2,-16.6],[6,-17.6],[0,-17.4],[-4.4,-15.6],[-6.6,-12]]);
    p.F(M.helm[2]); p.poly([[-8,-13],[-7,-19],[-5.4,-17],[-4.4,-15.6],[-6.6,-12]]); p.poly([[-4.4,-15.6],[0,-17.4],[6,-17.6],[12.2,-16.6],[12.2,-15.8],[6,-16.6],[0,-16.4],[-4,-14.8]]);
    p.F(M.helm[0]); p.poly([[0,-23.6],[5,-24.4],[9,-22.6],[6,-22],[1,-22.4]]);
    // aberturas de ventilação
    p.F(M.helm[3]); [[-2.6,-21],[1.6,-22.4],[6,-21.8]].forEach(([x,y])=>p.poly([[x,y],[x+2.6,y-0.4],[x+2.2,y+1.6],[x-0.2,y+1.8]]));
    // rachadura e pedaço faltando (couro cabeludo e sangue)
    p.F(M.helm[3]); p.poly([[8,-23.6],[9,-20],[7.6,-18.6],[8.6,-18]]); p.poly([[8.4,-21],[11,-19.6],[10.6,-19.2],[8.2,-20.4]]);
    p.F(M.hair[1]); p.poly([[-8.2,-13],[-6.6,-12],[-6,-9],[-7.6,-10]]);
    p.F(M.flesh[2]); p.poly([[-7,-19],[-5,-21.6],[-3.2,-20],[-5,-18]]); p.F(M.blood[1]); p.rect(-6,-18.6,0.9,2.4);
    // viseira quebrada
    p.F(M.visor[1]); p.poly([[9,-17.4],[13.6,-17],[14.4,-15.6],[11,-15.8]]); p.F(M.visor[0]); p.rect(11,-17.2,1.6,0.6);
    // jugular / alça solta
    p.F(M.strap[1]); p.cap(P2(-4.4,-14),P2(-2,-4),0.9,0.9); p.cap(P2(-2,-4),P2(0.6,1.6),0.9,0.8);
    if(form!=='comum'){ p.F(M.glow[0]); p.rect(7.4,-13.8,1.8,1.2); p.F(M.glow[1]); p.rect(11.1,-14,0.9,1.1); p.F(M.vein[1]); p.poly([[-4,-12],[-1,-9],[-1.6,-8.6],[-4.4,-11.4]]); }
    p.id();
  }
  function drawJaw(c,u,M,sk,P){
    const p=mkPen(c,u); const h=sk.H(2.4,-4.4); p.xf(sk.ha+rad(P.jaw),h.x,h.y); c.scale(HS,HS);
    p.F(M.skin[1]); p.poly([[-2,-1.4],[10.4,-0.8],[10.8,1.4],[9,4.6],[4,5.6],[-1,4],[-2.4,1.6]]);
    p.F(M.skin[2]); p.poly([[-2.4,1.6],[-1,4],[4,5.6],[9,4.6],[7.6,3.8],[3.4,4.2]]);
    p.F(M.skin[3]); p.poly([[0,4.4],[4,5.6],[7,5],[3.4,4.8]]);
    p.F(M.mouth[1]); p.poly([[2,-0.8],[10.2,-0.6],[10,1.2],[2.4,1]]);
    p.F(M.teeth[1]); p.poly([[2.4,-1],[10.2,-0.8],[10.2,0.6],[2.4,0.4]]);
    p.F(M.teeth[3]); [4.4,6,7.6,9].forEach(x=>p.rect(x,-1,0.5,1.4));
    p.F(M.blood[1]); const L=1.4+(P.jaw>20?2.4:0); p.poly([[8.4,4],[9.6,3.6],[9.4,4+L],[8.8,4.6+L]]);
    p.id();
  }
  // rastro do golpe: crescente que segue o arco da mão em volta do ombro, de onde o braço veio (smF/smB = ângulo inicial
  // do ombro) até a mão, engrossando na direção do impacto, com núcleo claro e 3 riscos de garra acompanhando a curva
  function drawSmear(c,u,M,sk,form,P){
    const p=mkPen(c,u); p.id(); const A=form==='plenilunar'?M.bone:M.skin;
    let list=[]; if(P.smF!=null) list.push([sk.shF,sk.wrF,P.smF-P.aFs]); if(P.smB!=null) list.push([sk.shB,sk.wrB,P.smB-P.aBs]);
    if(!list.length) list=[[sk.shF,sk.wrF,70]];
    list.forEach(([sh,wr,d0],li)=>{
      const r=Math.hypot(wr.x-sh.x,wr.y-sh.y)+5, a1=Math.atan2(wr.x-sh.x,wr.y-sh.y)*180/PI, a0=a1+d0, n=14, out=[], inn=[], mid=[];
      for(let k=0;k<=n;k++){ const t=k/n, a=rad(a0+(a1-a0)*t), w=16*Math.pow(t,1.3)*(li?0.75:1), rr=r+2*t;
        out.push([sh.x+Math.sin(a)*(rr+w*0.35), sh.y+Math.cos(a)*(rr+w*0.35)]); inn.unshift([sh.x+Math.sin(a)*(rr-w*0.65), sh.y+Math.cos(a)*(rr-w*0.65)]);
        mid.push({x:sh.x+Math.sin(a)*(rr+w*0.05), y:sh.y+Math.cos(a)*(rr+w*0.05), w}); }
      // ponta arredondada na mão
      const e=mid[n], ae=rad(a1+Math.sign(-d0||1)*6), cap=[]; for(let k=1;k<5;k++){ const q=k/5*PI; cap.push([e.x+Math.sin(ae)*Math.sin(q)*e.w*0.5, e.y+Math.cos(ae)*Math.sin(q)*e.w*0.5]); }
      p.F(A[1]); p.poly([...out,...inn]);
      p.F(A[0]); p.poly([...mid.slice(4).map(q=>[q.x,q.y]), ...mid.slice(4).reverse().map((q,k)=>{ const a=Math.atan2(q.x-sh.x,q.y-sh.y); return [q.x-Math.sin(a)*q.w*0.45, q.y-Math.cos(a)*q.w*0.45]; })]);
      p.F(M.refl[0]); for(let k=8;k<n;k++){ const q=mid[k], q2=mid[k+1]; p.cap(P2(q.x,q.y),P2(q2.x,q2.y),Math.max(0.8,q.w*0.18),Math.max(0.8,q2.w*0.18)); }
      // riscos de garra (paralelos ao arco), chegando até a mão
      p.F(A[0]); [-0.9,0.3].forEach((o,j)=>{ for(let k=6+j*2;k<n;k++){ const t=k/n, a=rad(a0+(a1-a0)*t), a2=rad(a0+(a1-a0)*(k+1)/n), rr=r+2*t+o*9*t;
        p.cap(P2(sh.x+Math.sin(a)*rr,sh.y+Math.cos(a)*rr),P2(sh.x+Math.sin(a2)*rr,sh.y+Math.cos(a2)*rr),0.6+t*0.8,0.6+t*0.9); } });
      // faíscas de impacto na direção do golpe
      const ta=rad(a1), dir=-(Math.sign(d0)||1), tx=Math.cos(ta)*dir, ty=-Math.sin(ta)*dir;
      p.F(M.refl[0]); [[-0.5,8],[0,11],[0.5,7]].forEach(([o,L])=>{ const bx=e.x+tx*3, by=e.y+ty*3, ox=-ty*o*6, oy=tx*o*6; p.cap(P2(bx+ox,by+oy),P2(bx+ox+tx*L,by+oy+ty*L),1.4,0.4); });
    });
  }

  /* ---------- montagem ---------- */
  const cache=PIX.cache();
  function frame(form,anim,fi,step=5,Pov,pk){
    const K=PIX.getK(), key=(pk!=null?'#'+pk+'|'+form:form+'|'+anim+'|'+fi+'|'+step)+'@'+K;
    const hit=cache.get(key); if(hit){ cache.delete(key); cache.set(key,hit); return hit; }
    const P=Pov?Object.assign({},REST,Pov):poseOf(anim,fi), M=mats(form), sk=skeleton(P);
    const parts=[];
    if(P.smear) parts.push({noShade:true, smear:true, noRim:true, draw:(c,u)=>drawSmear(c,u,M,sk,form,P)});
    parts.push(
      {back:true, draw:(c,u)=>drawArm(c,u,M,sk,P,false,form)},
      {back:true, draw:(c,u)=>drawLeg(c,u,M,sk,P,false)},
      {draw:(c,u)=>drawBox(c,u,M,sk,P,form)},
      {draw:(c,u)=>drawTorso(c,u,M,sk,P,form)},
      {draw:(c,u)=>drawLeg(c,u,M,sk,P,true)},
      {draw:(c,u)=>drawHead(c,u,M,sk,P,form)},
      {draw:(c,u)=>drawJaw(c,u,M,sk,P)},
      {draw:(c,u)=>drawArm(c,u,M,sk,P,true,form)});
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM[form]}); if(step>=4) heavyOutline(cv);
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._eye=sc(sk.H(8,-13)); cv._mouth=sc(sk.H(9,-4)); cv._hand=sc(sk.wrF); cv._head=sc(sk.H(2,-16)); cv._hip=sc(sk.hip); cv._feet=[sc(sk.ankleF),sc(sk.ankleB)];
    cache.set(key,cv); if(cache.size>900) cache.delete(cache.keys().next().value);
    return cv;
  }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame,framePose:function(form,anim,P,key){ return frame(form,anim,0,5,P,key); }};
})();
