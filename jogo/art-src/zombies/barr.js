/* BARR — fonte de arte (editável). Build: npm run art
   Barrigudo: farofeiro de Boa Viagem que inchou até virar balão. Barriga translúcida e esticada com gases
   brilhando por dentro, regata enrolada no peito, short de praia florido, chinelo, óculos escuros na testa.
   Explode ao morrer (anim `explode`, evento boomAt). Hi-bit: honra PIX.getK(). */
const BARR=(function(){
  const {rad,lp,lerp,P2,mkPen,compose}=PIX;
  const FW=216, FH=168, GROUND=158, AX=98, HS=1.5;
  const RIM={comum:'#dcf0b0', enluarado:'#9ff6ff', plenilunar:'#ffb46a'};

  function mats(form){
    const m={
      skin:['#ece8ac','#b8b474','#787c56','#3e4446'],
      rot:['#bcae7c','#887a58','#5a4c48','#342a34'],
      bruise:['#c4a0d8','#8a66a8','#5a4278','#32244a'],
      flesh:['#f6ae94','#d0645e','#8e3446','#521c34'],
      bone:['#fff4d8','#dccfa6','#a09070','#605040'],
      gas:['#fdffd8','#e6f47c','#9cbc3c','#3e5a2a'],
      film:['#f4f6d0','#c8d098','#8a9a6a','#4a5644'],
      tank:['#fbf8ee','#d8d2c0','#9c96a2','#5c5672'],
      trim:['#a4d8ff','#3e8ee0','#285aa2','#163268'],
      shorts:['#ffc07a','#f07a30','#ac4428','#5e2020'],
      flower:['#fffaf0','#ffc8d8','#d47898','#7a3a5a'],
      strap:['#ff9a8a','#e0443c','#9a2634','#521626'],
      sole:['#fffaea','#d8d0ba','#989078','#564e44'],
      lens:['#9ae0ff','#3a5c9e','#24305c','#121630'],
      frame:['#fff4a0','#f0c030','#a8782a','#5e3e1e'],
      hair:['#6a5e4e','#443a30','#2a2420','#161212'],
      eye:['#ffffe0','#f0e070','#b09030','#6a5018'],
      mouth:['#7c2e3e','#4c1828','#2e0c1a','#1a0610'],
      teeth:['#fbf0c0','#d8c27c','#9a8650','#5e4e30'],
      blood:['#c84a3e','#8e2a2c','#5e1824','#3a0e1a'],
      nail:['#8a7a62','#54463c','#342a28','#1c1618'],
      smoke:['#f4f4d8','#c4c8a4','#8a9078','#50564c'],
    };
    if(form==='enluarado'){
      m.skin=['#dcdcff','#9ea0e2','#666aac','#3c3a76']; m.rot=['#b8a6e0','#8470b0','#56468a','#33285e'];
      m.gas=['#effffe','#7af4ff','#2ab0d8','#146a96']; m.film=['#e4ecff','#a8b8ec','#6a78b4','#3a4278'];
      m.flesh=['#f0b0ff','#b866d8','#7a3a9e','#46206a']; m.blood=['#b46ad8','#7e3ea6','#542474','#34144a'];
      m.bruise=['#f0b0e0','#c070b0','#86408a','#4c2458']; m.eye=['#ffffff','#b8fbff','#4ad8f0','#1a8aa8'];
      m.shorts=['#a8f0d8','#46b8a0','#2a7a7a','#1a4450']; m.tank=['#e8ecff','#b8bedc','#7c80a8','#454872'];
      m.smoke=['#eaffff','#a8d8e8','#6a94b4','#3a5274'];
    }
    if(form==='plenilunar'){
      m.skin=['#ffcaa6','#e2806a','#a4424e','#5e1e36']; m.rot=['#d0806a','#9a4a4a','#682a3a','#3e1628'];
      m.gas=['#fff6c0','#ffb43a','#e0581e','#8a2414']; m.film=['#ffe4c4','#f0a888','#b0605a','#682a38'];
      m.flesh=['#ffc07a','#f06a3a','#a8302e','#5e1422']; m.blood=['#ff7a3a','#d43a26','#8a1c22','#4e0c18'];
      m.bruise=['#a85a6a','#7a3448','#521e34','#300e20']; m.eye=['#fffbe0','#ffe04a','#ff8a2a','#b83a14'];
      m.shorts=['#8ad0ff','#3a7ad8','#2a4c98','#182a5c']; m.tank=['#3e3a4c','#2a2634','#1a1622','#0e0a14'];
      m.smoke=['#fff0c8','#e8b088','#a46858','#5e3438'];
    }
    return punch(m);
  }
  const NAMES={skin:'Pele inchada',rot:'Podridão',bruise:'Hematoma',gas:'Gases',film:'Pele da barriga',tank:'Regata',trim:'Friso da regata',shorts:'Short de praia',flower:'Flores do short',strap:'Chinelo',sole:'Sola',lens:'Lente',frame:'Armação',eye:'Olho',blood:'Sangue',smoke:'Fumaça'};
  function sat(h,k){ const [r,g,b]=PIX.hexRgb(h), y=(r+g+b)/3; return PIX.toHex(y+(r-y)*k,y+(g-y)*k,y+(b-y)*k); }
  const NOPUNCH={gas:1,eye:1,smoke:1};
  function punch(m){ const o={}; for(const k in m){ const r=m[k]; o[k]=NOPUNCH[k]?[r[0],r[1],r[2],r[3]]:[sat(r[0],1.1),sat(r[1],1.16),PIX.mix(sat(r[2],1.12),'#2a1a4c',0.22),PIX.mix(r[3],'#140a24',0.36)]; } return o; }

  /* ---------- poses ---------- */
  // belly 0..1.5 (inchaço), glow 0..1 (gases acesos), crack 0..1 (rachaduras da explosão), thrust = barriga pra frente.
  const REST={hx:0,rot:0,lift:0,lean:-6,head:4,jaw:10,belly:0.12,glow:0.5,crack:0,thrust:0,sway:0,aFs:50,aFe:96,aBs:20,aBe:40,lFh:10,lFk:-4,lBh:-10,lBk:-14,fF:0,fB:0,flash:0,shiver:0,burp:0,boom:0,remains:0,smear:0};
  const S=Math.sin, C=Math.cos, PI=Math.PI, mx=Math.max;
  const ANIMS={
    idle:{nome:'Parado (barriga pulsando)',n:8,dur:()=>160,pose:i=>{ const p=i/8*PI*2, s=S(p);
      return {belly:0.12+0.07*(s+1)/2, glow:0.42+0.22*(S(p-0.6)+1)/2, lean:-6+1.4*s, head:4+3*S(p-0.8), jaw:9+5*mx(0,S(p-1.4)), aFs:50+3*S(p-0.5), aFe:96+5*S(p-0.9), aBs:20+3*S(p-0.3), aBe:40+4*S(p-0.8), hx:0.6*S(p)}; }},
    walk:{nome:'Andar (gingando)',n:8,dur:()=>140,pose:i=>{ const p=i/8*PI*2;
      const lFh=6+16*S(p), lBh=-6+16*S(p+PI);
      return {lFh, lFk:lFh-14*mx(0,C(p))-6, lBh, lBk:lBh-14*mx(0,C(p+PI))-6, fF:-10*mx(0,C(p)), fB:12*mx(0,C(p+PI)),
        sway:5*S(p), lean:-6+2*S(2*p), head:4-5*S(p), belly:0.12+0.06*Math.abs(S(2*p-0.6)), glow:0.5+0.12*S(2*p), lift:1.6*mx(0,S(2*p)),
        aFs:50+8*S(p), aFe:96+8*S(p-0.4), aBs:20-16*S(p), aBe:40-14*S(p-0.4), jaw:10, hx:1.2*S(p)}; }},
    attack:{nome:'Barrigada',n:8,hitAt:4,hit:4,reach:44,dur:i=>[180,160,150,70,130,140,150,140][i],pose:i=>[
      {lean:-12,head:10,jaw:8,belly:0.2,glow:0.35,aFs:0,aFe:10,aBs:-10,aBe:0,hx:-2,lFh:8,lBh:-14},
      {lean:-22,head:16,jaw:12,belly:0.32,glow:0.5,aFs:-30,aFe:-20,aBs:-40,aBe:-30,hx:-6,lFh:14,lFk:0,lBh:-16,lBk:-20},
      {lean:-26,head:18,jaw:10,belly:0.4,glow:0.6,aFs:-40,aFe:-30,aBs:-50,aBe:-40,hx:-7,lFh:16,lFk:2,lBh:-18,lBk:-22,shiver:1},
      {lean:8,head:-6,jaw:22,belly:0.36,glow:0.7,thrust:6,aFs:-50,aFe:-40,aBs:-60,aBe:-50,hx:6,lFh:28,lFk:4,lBh:-24,lBk:-34,fB:16,smear:1},
      {lean:14,head:-10,jaw:26,belly:0.42,glow:0.8,thrust:10,aFs:-56,aFe:-46,aBs:-64,aBe:-54,hx:10,lFh:30,lFk:6,lBh:-28,lBk:-38,fB:20},
      {lean:10,head:-6,jaw:20,belly:0.3,glow:0.5,thrust:6,aFs:-30,aFe:-20,aBs:-40,aBe:-30,hx:9,lFh:26,lFk:4,lBh:-24,lBk:-34,fB:16},
      {lean:0,head:0,jaw:10,belly:0.18,glow:0.35,aFs:6,aFe:20,aBs:-4,aBe:10,hx:4,lFh:16,lBh:-14},
      {lean:-6,head:4,jaw:5,belly:0.12,hx:1}][i]},
    burp:{nome:'Arrotar (nuvem de gás)',n:6,gasAt:3,dur:i=>[160,160,120,140,160,160][i],pose:i=>[
      {lean:-10,head:8,jaw:4,belly:0.24,glow:0.4,aFs:30,aFe:60,aBs:20,aBe:50},
      {lean:-16,head:14,jaw:2,belly:0.36,glow:0.6,aFs:36,aFe:76,aBs:26,aBe:66,shiver:1},
      {lean:-4,head:-2,jaw:16,belly:0.3,glow:0.7,aFs:30,aFe:60,aBs:20,aBe:50,burp:1},
      {lean:2,head:-14,jaw:30,belly:0.16,glow:0.6,aFs:24,aFe:50,aBs:14,aBe:40,burp:2},
      {lean:-2,head:-8,jaw:20,belly:0.12,glow:0.35,burp:3},
      {lean:-6,head:4,jaw:6,belly:0.12,glow:0.25}][i]},
    // ---- ataques extras ----
    stomp:{nome:'Pisão (esmagada no chão)',n:9,hit:5,reach:40,warn:[1,2,3,4],dur:i=>[160,170,180,160,60,180,150,140,140][i],pose:i=>[
      {lean:-8,head:6,jaw:8,belly:0.18,glow:0.4,aFs:40,aFe:80,aBs:14,aBe:30,hx:-1},
      {lean:-14,head:10,jaw:12,belly:0.26,glow:0.5,aFs:70,aFe:120,aBs:50,aBe:90,hx:-3,lFh:50,lFk:-20,lBh:-12,lBk:-16},
      {lean:-20,head:14,jaw:14,belly:0.34,glow:0.6,aFs:100,aFe:150,aBs:80,aBe:130,hx:-4,lift:4,lFh:76,lFk:-10,lBh:-10,lBk:-14,shiver:1},
      {lean:-22,head:16,jaw:10,belly:0.38,glow:0.7,aFs:110,aFe:160,aBs:90,aBe:140,hx:-4,lift:6,lFh:84,lFk:-6,lBh:-10,lBk:-14,shiver:1},
      {lean:6,head:-4,jaw:24,belly:0.3,glow:0.8,aFs:60,aFe:80,aBs:40,aBe:60,hx:4,lift:2,lFh:40,lFk:10,lBh:-14,lBk:-20,smear:1},
      {lean:16,head:-12,jaw:30,belly:0.5,glow:0.9,aFs:20,aFe:40,aBs:0,aBe:20,hx:6,lFh:30,lFk:20,lBh:-20,lBk:-30,fF:10,shiver:1},
      {lean:12,head:-8,jaw:20,belly:0.3,glow:0.6,aFs:30,aFe:60,aBs:10,aBe:30,hx:5,lFh:28,lFk:14,lBh:-18,lBk:-26},
      {lean:0,head:0,jaw:12,belly:0.18,glow:0.4,aFs:44,aFe:84,aBs:16,aBe:34,hx:2,lFh:16,lBh:-12},
      {lean:-6,head:4,jaw:8,belly:0.12,hx:1}][i]},
    vomit:{nome:'Vômito em cone',n:8,hit:4,reach:70,warn:[1,2,3],dur:i=>[160,170,170,90,200,180,150,150][i],pose:i=>[
      {lean:-8,head:8,jaw:6,belly:0.26,glow:0.45,aFs:40,aFe:70,aBs:24,aBe:50},
      {lean:-14,head:16,jaw:2,belly:0.42,glow:0.65,aFs:20,aFe:40,aBs:10,aBe:30,shiver:1},
      {lean:-18,head:20,jaw:0,belly:0.5,glow:0.8,aFs:10,aFe:20,aBs:0,aBe:10,hx:-3,shiver:1},
      {lean:20,head:-24,jaw:36,belly:0.36,glow:0.9,thrust:6,aFs:30,aFe:50,aBs:20,aBe:40,hx:6,lFh:24,lFk:4,lBh:-20,lBk:-30,burp:2},
      {lean:26,head:-30,jaw:40,belly:0.22,glow:0.8,thrust:8,aFs:30,aFe:50,aBs:20,aBe:40,hx:8,lFh:26,lFk:4,lBh:-22,lBk:-32,burp:3},
      {lean:20,head:-24,jaw:34,belly:0.16,glow:0.6,thrust:4,aFs:30,aFe:56,aBs:20,aBe:44,hx:6,lFh:22,lFk:2,lBh:-18,lBk:-28,burp:3},
      {lean:6,head:-8,jaw:18,belly:0.12,glow:0.4,aFs:40,aFe:80,aBs:20,aBe:40,hx:3},
      {lean:-6,head:4,jaw:8,belly:0.12,glow:0.3}][i]},
    hurt:{nome:'Dano (cabeça)',n:4,dur:i=>[80,110,130,150][i],pose:i=>[
      {lean:-20,head:-22,jaw:24,hx:-6,flash:1,belly:0.22,glow:0.6,aFs:-30,aFe:-14,aBs:-36,aBe:-20,lFh:12,lBh:-4},
      {lean:-16,head:-16,jaw:20,hx:-5,belly:0.2,glow:0.5,aFs:-20,aFe:0,aBs:-26,aBe:-8,lFh:10,lBh:-6},
      {lean:-10,head:-4,jaw:12,hx:-2,belly:0.15,glow:0.35,aFs:8,aFe:24,aBs:0,aBe:14},
      {lean:-7,head:2,jaw:6,belly:0.13}][i]},
    hurtB:{nome:'Dano (barriga)',n:4,dur:i=>[80,120,140,150][i],pose:i=>[
      {lean:16,head:20,jaw:28,hx:-6,flash:1,belly:0.02,glow:0.9,aFs:60,aFe:20,aBs:50,aBe:10,lFh:16,lFk:-10,lBh:-16,lBk:-30},
      {lean:12,head:16,jaw:24,hx:-5,belly:0.3,glow:0.8,aFs:50,aFe:30,aBs:40,aBe:20,lFh:14,lFk:-8,lBh:-14,lBk:-26},
      {lean:2,head:8,jaw:14,hx:-2,belly:0.18,glow:0.5,aFs:34,aFe:40,aBs:24,aBe:30},
      {lean:-5,head:4,jaw:7,hx:-1,belly:0.13}][i]},
    fall:{nome:'Derrubado',n:5,dur:i=>[90,110,120,150,260][i],pose:i=>[
      {lean:-22,head:-20,jaw:26,hx:-6,flash:1,belly:0.24,glow:0.7,aFs:-40,aFe:-20,aBs:-50,aBe:-30,lFh:18,lBh:0},
      {rot:-40,lean:-10,head:-14,jaw:24,hx:-4,belly:0.26,glow:0.6,aFs:-90,aFe:-80,aBs:-100,aBe:-90,lFh:40,lFk:30,lBh:24,lBk:14},
      {rot:-76,lean:-4,head:-8,jaw:22,hx:2,belly:0.22,glow:0.5,aFs:-130,aFe:-140,aBs:-30,aBe:-10,lFh:46,lFk:24,lBh:30,lBk:14},
      {rot:-92,lean:0,head:2,jaw:18,hx:6,belly:0.2,glow:0.4,aFs:-150,aFe:-170,aBs:-10,aBe:6,lFh:40,lFk:14,lBh:26,lBk:6},
      {rot:-90,lean:0,head:0,jaw:16,hx:6,belly:0.18,glow:0.35,aFs:-156,aFe:-176,aBs:-12,aBe:4,lFh:36,lFk:10,lBh:22,lBk:2}][i]},
    getup:{nome:'Levantar (rola e empurra)',n:6,dur:i=>[200,170,170,160,160,150][i],pose:i=>[
      {rot:-90,lean:0,head:0,jaw:16,hx:6,belly:0.18,glow:0.35,aFs:-156,aFe:-176,aBs:-12,aBe:4,lFh:36,lFk:10,lBh:22,lBk:2},
      {rot:-62,lean:6,head:-6,jaw:14,hx:0,belly:0.18,aFs:-40,aFe:-10,aBs:-50,aBe:-20,lFh:80,lFk:10,lBh:64,lBk:0},
      {rot:-34,lean:14,head:-10,jaw:12,hx:-4,belly:0.16,aFs:0,aFe:20,aBs:-10,aBe:0,lFh:96,lFk:0,lBh:50,lBk:-50},
      {rot:-8,lean:20,head:-8,jaw:12,hx:-4,belly:0.15,aFs:30,aFe:20,aBs:20,aBe:10,lFh:70,lFk:-6,lBh:6,lBk:-70,fB:50},
      {lean:6,head:0,jaw:8,hx:-1,belly:0.13,aFs:30,aFe:40,aBs:18,aBe:30,lFh:26,lFk:-10,lBh:-12,lBk:-30},
      {lean:-6,head:4,jaw:5,belly:0.12}][i]},
    explode:{nome:'Explodir (morte)',n:9,boomAt:6,dur:i=>[90,160,150,140,120,110,70,260,600][i],pose:i=>[
      {lean:-18,head:-18,jaw:24,hx:-5,flash:1,belly:0.3,glow:0.7,aFs:-30,aFe:-14,aBs:-36,aBe:-20,lFh:14,lBh:-6},
      {lean:-14,head:-24,jaw:16,hx:-3,belly:0.55,glow:0.8,crack:0.15,aFs:40,aFe:70,aBs:30,aBe:60,shiver:1},
      {lean:-12,head:-28,jaw:22,hx:-3,belly:0.8,glow:0.9,crack:0.35,aFs:56,aFe:84,aBs:46,aBe:74,shiver:1},
      {lean:-10,head:-32,jaw:30,hx:-2,belly:1.05,glow:1,crack:0.6,aFs:70,aFe:96,aBs:60,aBe:86,shiver:1,lift:2},
      {lean:-8,head:-36,jaw:36,hx:-2,belly:1.28,glow:1,crack:0.85,aFs:84,aFe:110,aBs:74,aBe:100,shiver:1,lift:4},
      {lean:-8,head:-40,jaw:40,hx:-2,belly:1.45,glow:1,crack:1,aFs:96,aFe:120,aBs:86,aBe:110,shiver:1,lift:5},
      {boom:1},
      {remains:1,boom:2},
      {remains:2,boom:3}][i]},
  };
  const EXK=['hx','lean','head','aFs','aFe','aBs','aBe','lFh','lFk','lBh','lBk'];
  function exag(P,f){ if(f===1||Math.abs(P.rot)>4) return P; EXK.forEach(k=>{ P[k]=REST[k]+(P[k]-REST[k])*f; }); P.jaw=Math.min(44,REST.jaw+(P.jaw-REST.jaw)*f); return P; }
  const EXF={idle:1.12,walk:1.15,attack:1.25,burp:1.15,stomp:1.15,vomit:1.15,hurt:1.3,hurtB:1.2,fall:1.05,getup:1.05,explode:1.1};
  ZREACT.add(ANIMS,REST,{moves:{bellyFlop:["flop","Barrigada voadora"]}}); // reações (voando, agarrado) + golpe extra — art-src/shared/zreact.js
  function poseOf(anim,i){ return exag(Object.assign({},REST,ANIMS[anim].pose(i)),EXF[anim]||1); }
  function heavyOutline(cv){ const g=cv.getContext('2d'), W=cv.width, H=cv.height, im=PIX.pix(cv), d=im.data;
    const isO=i=>d[i+3]===255&&d[i]===0x17&&d[i+1]===0x0b&&d[i+2]===0x1c, fill=i=>d[i+3]===255&&!isO(i);
    const add=[]; for(let y=2;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(d[i+3]) continue; const u=((y-1)*W+x)*4, u2=((y-2)*W+x)*4; if(isO(u)&&fill(u2)) add.push(i); }
    add.forEach(i=>{ d[i]=0x17; d[i+1]=0x0b; d[i+2]=0x1c; d[i+3]=255; }); g.putImageData(im,0,0); }

  /* ---------- esqueleto: quadril na origem, giro total + apoio no chão ---------- */
  const TH=18, SH=15, UA=15, FA=14, TW=1.42, BRX=26, BRY=23;
  function build(P,dy){
    const R=P.rot, ra=rad(R), rc=Math.cos(ra), rs=Math.sin(ra);
    const hip={x:AX+P.hx+(P.shiver?0.8:0), y:dy};
    const HR=(lx,ly)=>({x:hip.x+lx*rc-ly*rs, y:hip.y+lx*rs+ly*rc});
    const hipF=HR(7,0), hipB=HR(-8,-1);
    const kneeF=lp(hipF,P.lFh-R,TH), ankleF=lp(kneeF,P.lFk-R,SH), kneeB=lp(hipB,P.lBh-R,TH), ankleB=lp(kneeB,P.lBk-R,SH);
    const a=rad(R+P.lean+P.sway*0.5), c=Math.cos(a), s=Math.sin(a);
    const T=(lx,ly)=>{ lx*=TW; return {x:hip.x+lx*c-ly*s, y:hip.y+lx*s+ly*c}; };
    const bs=1+P.belly*0.3, bc=T(8+P.thrust,-20-P.belly*2);
    const shF=T(5,-38), shB=T(-7,-39), hpv=T(3,-40);
    const ha=a+rad(P.head), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:hpv.x+(lx*hc-ly*hs)*HS, y:hpv.y+(lx*hs+ly*hc)*HS});
    const elF=lp(shF,P.aFs-R,UA), wrF=lp(elF,P.aFe-R,FA), elB=lp(shB,P.aBs-R,UA), wrB=lp(elB,P.aBe-R,FA);
    const hand=(e,w)=>{ const L=Math.hypot(w.x-e.x,w.y-e.y)||1; return {x:w.x+(w.x-e.x)/L*6,y:w.y+(w.y-e.y)/L*6}; };
    const toe=(q,f)=>{ const t=rad(f+R); return {x:q.x+(11*Math.cos(t)-4*Math.sin(t))*1.3, y:q.y+(11*Math.sin(t)+4*Math.cos(t))*1.3}; };
    const hull=[[ankleF,8.6],[ankleB,8.6],[toe(ankleF,P.fF),0.5],[toe(ankleB,P.fB),0.5],[kneeF,8],[kneeB,8],[hip,12],[bc,BRY*bs],[T(-6,-28),17],[T(-22,-20),4],[T(-21,-32),4],[H(3,-10),12],[H(4,-1),9],[hand(elF,wrF),6],[hand(elB,wrB),6]];
    return {R,ra,a,hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,T,bs,bc,shF,shB,hpv,ha,H,elF,wrF,elB,wrB,hull};
  }
  function skeleton(P){
    const b=build(P,0); let m=-1e9; b.hull.forEach(([p,r])=>{ m=Math.max(m,p.y+r); });
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
    const k2a=wa*0.33, k2b=wb*0.33; p.F(R[3]); p.cap({x:a.x+nx*k2a,y:a.y+ny*k2a},{x:b.x+nx*k2b,y:b.y+ny*k2b},wa*0.3,wb*0.3);
    if(o.hi!==false){ const e=lerp(a,b,o.hl!=null?o.hl:0.7), ha=wa*0.22, hb=wb*0.22; p.F(R[0]); p.cap({x:a.x-nx*ha,y:a.y-ny*ha},{x:e.x-nx*hb,y:e.y-ny*hb},wa*0.18,wb*0.16); }
    return {nx,ny};
  }
  function clip(c,pts,fn){ c.save(); c.beginPath(); pts.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])); c.closePath(); c.clip(); fn(); c.restore(); }
  function clipE(c,x,y,rx,ry,fn){ c.save(); c.beginPath(); c.ellipse(x,y,rx,ry,0,0,PI*2); c.clip(); fn(); c.restore(); }
  const W=(sk,list)=>list.map(([u,v])=>{ const q=sk.T(u,v); return [q.x,q.y]; });
  const Wp=(sk,u,v)=>sk.T(u,v);

  /* ---------- braço: grosso e curto, mão gorda ---------- */
  function drawArm(c,u,M,sk,P,front){
    const p=mkPen(c,u), sh=front?sk.shF:sk.shB, el=front?sk.elF:sk.elB, wr=front?sk.wrF:sk.wrB; p.id();
    const n=limb(p,M.skin,el,wr,16,14,{});
    limb(p,M.skin,sh,el,20,17,{hl:0.5});
    // papada do braço e hematoma
    const bz=lerp(sh,el,0.55); p.F(M.skin[2]); p.ell(bz.x+n.nx*3,bz.y+n.ny*3,4.4,3,Math.atan2(el.y-sh.y,el.x-sh.x));
    p.F(M.bruise[1]); const b=lerp(el,wr,0.45); p.ell(b.x-n.nx*1.6,b.y-n.ny*1.6,2.4,1.6); p.F(M.bruise[2]); p.rect(b.x-n.nx*1.6-0.5,b.y-n.ny*1.6,1,1);
    p.F(M.skin[0]); p.circle({x:el.x-n.nx*2.6,y:el.y-n.ny*2.6},1.2);
    if(front){ p.F(M.rot[1]); const r=lerp(sh,el,0.3); p.ell(r.x-n.nx*2,r.y-n.ny*2,2,1.4); p.F(M.flesh[2]); const f=lerp(el,wr,0.75); p.ell(f.x+n.nx*2,f.y+n.ny*2,1.8,1.3); p.F(M.flesh[1]); p.rect(f.x+n.nx*2-0.5,f.y+n.ny*2-0.5,1,1); }
    // cava da regata no ombro
    p.F(M.tank[1]); p.cap({x:sh.x-3,y:sh.y-4.6},{x:sh.x+3.4,y:sh.y-4},4,3.4); p.F(M.trim[1]); p.cap({x:sh.x-3,y:sh.y-2.6},{x:sh.x+3.4,y:sh.y-2},1.2,1.2);
    // mão gorda
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y); c.scale(1.7,1.7);
    p.F(M.skin[1]); p.ell(2.6,0,4.2,4);
    p.F(M.skin[2]); p.ell(2.6,1.6,3.8,2.2);
    p.F(M.skin[0]); p.ell(1.6,-2,2,1);
    for(let k=0;k<4;k++){ const y0=-2.6+k*1.8, t=P2(8-(k===3?1:0),y0+0.8);
      p.F(M.skin[1]); p.cap(P2(5.4,y0),t,2.1,1.9); p.F(M.skin[2]); p.rect(5.6,y0+0.4,2,0.6); p.F(M.nail[1]); p.ell(t.x+0.3,t.y,0.8,0.7); }
    p.F(M.skin[1]); p.cap(P2(2,-3),P2(4.8,-5.4),2.2,1.8); p.F(M.nail[1]); p.ell(5.2,-5.6,0.8,0.7);
    p.id();
  }

  /* ---------- perna: coxa grossa no short florido, canela inchada, chinelo ---------- */
  function shortsLeg(p,M,hip,kb,front){
    limb(p,M.shorts,hip,kb,25,22,{hl:0.55});
    const kn=sideN(hip,kb), dir={x:(kb.x-hip.x)/kn.L,y:(kb.y-hip.y)/kn.L};
    const at=(t,o)=>{ const q=lerp(hip,kb,t); return {x:q.x-kn.nx*o,y:q.y-kn.ny*o}; };
    // flores de hibisco
    [[0.25,4.4],[0.62,-4],[0.8,6],[0.42,-8],[0.15,-2]].forEach(([t,o],k)=>{ const q=at(t,o), tn=(o<0)?2:1;
      p.F(M.flower[tn]); [0,1,2,3,4].forEach(j=>{ const a=j/5*PI*2+k; p.circle({x:q.x+Math.cos(a)*1.3,y:q.y+Math.sin(a)*1.3},1.1); });
      p.F(M.frame[1]); p.rect(q.x-0.5,q.y-0.5,1,1); });
    p.F(M.shorts[3]); p.cap({x:kb.x-kn.nx*10,y:kb.y-kn.ny*10},{x:kb.x+kn.nx*10,y:kb.y+kn.ny*10},1.3,1.3);
    p.F(M.shorts[2]); const f=at(0.55,-1); p.cap(f,{x:f.x+dir.x*4+kn.nx*2,y:f.y+dir.y*4+kn.ny*2},0.9,0.8);
    p.F(M.shorts[0]); const g=at(0.3,5); p.cap(g,{x:g.x+dir.x*3,y:g.y+dir.y*3},0.9,0.8);
  }
  function drawLeg(c,u,M,sk,P,front){
    const p=mkPen(c,u), hip=front?sk.hipF:sk.hipB, knee=front?sk.kneeF:sk.kneeB, ank=front?sk.ankleF:sk.ankleB; p.id();
    const n=limb(p,M.skin,knee,ank,16,12,{hl:0.5});
    const cf=lerp(knee,ank,0.3); p.F(M.skin[1]); p.ell(cf.x+n.nx*1.6,cf.y+n.ny*1.6,7.6,5.6,Math.atan2(ank.y-knee.y,ank.x-knee.x)); p.F(M.skin[2]); p.ell(cf.x+n.nx*2.8,cf.y+n.ny*2.8,5,4,Math.atan2(ank.y-knee.y,ank.x-knee.x));
    // varizes e manchas
    p.F(M.bruise[2]); const v=lerp(knee,ank,0.5); p.cap({x:v.x-n.nx*2,y:v.y-2},{x:v.x-n.nx*1,y:v.y+2},0.8,0.7); p.cap({x:v.x-n.nx*1,y:v.y+2},{x:v.x-n.nx*2.4,y:v.y+4.6},0.7,0.6);
    p.F(M.rot[1]); const r=lerp(knee,ank,0.7); p.ell(r.x+n.nx*0.6,r.y,1.6,2);
    if(!P.remains||true) shortsLeg(p,M,hip,lerp(hip,knee,1.0),front);
    // pé inchado + chinelo
    const fa=rad((front?P.fF:P.fB)+sk.R); p.xf(fa,ank.x,ank.y); c.scale(1.5,1.5);
    p.F(M.sole[1]); p.poly([[-5,3],[11.2,3],[11.8,5],[-5.4,5]]); p.F(M.sole[3]); p.rect(-5.4,4.4,17.2,0.8); p.F(M.sole[0]); p.rect(-4.4,3,13,0.7);
    p.F(M.skin[1]); p.poly([[-4,-2.4],[2.6,-2.6],[7,0],[10.6,1.4],[11,3.2],[-4.6,3.2]]);
    p.F(M.skin[2]); p.poly([[-4.6,1.2],[3,1.6],[11,2.2],[11,3.2],[-4.6,3.2]]); p.F(M.skin[0]); p.rect(0,-1.8,3.4,0.9);
    p.F(M.nail[1]); [[7.8,1.6],[9.2,1.9],[10.4,2.2]].forEach(([x,y])=>p.rect(x,y,0.9,0.7));
    p.F(M.strap[1]); p.poly([[4.6,1.6],[5.8,2.2],[1,-0.6],[-2.6,3],[-3.6,2.6],[0.6,-1.6]]); p.F(M.strap[0]); p.rect(-0.2,-1.2,2.2,0.7);
    p.id();
  }

  /* ---------- tronco (costas, regata enrolada, cós) ---------- */
  function drawTorso(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    // cós do short (atrás da barriga)
    p.F(M.shorts[1]); p.poly(W(sk,[[-15,-6],[12,-6],[13,6],[-14,6]]));
    p.F(M.shorts[2]); p.poly(W(sk,[[-15,0],[13,0],[13,6],[-14,6]])); p.F(M.shorts[3]); p.poly(W(sk,[[-15,-6],[12,-6],[12,-4.8],[-15,-4.8]]));
    p.F(M.sole[1]); p.poly(W(sk,[[-2,-4.6],[-1,-4.6],[0,2],[-1,2.4]])); p.poly(W(sk,[[0.4,-4.6],[1.2,-4.6],[2.6,1.4],[1.8,1.8]]));
    // corpo: costas largas e corcunda de gordura
    const body=W(sk,[[-14,2],[-17.4,-8],[-19,-20],[-18,-31],[-14,-39],[-6,-44.4],[3,-44.6],[9,-41],[12,-34],[14,-24],[12,-8],[6,0]]);
    p.F(M.skin[1]); p.poly(body);
    clip(c,body,()=>{ p.F(M.skin[2]); p.poly(W(sk,[[-24,6],[-24,-50],[-10,-50],[-13,-38],[-12,-26],[-8,-14],[-2,-6],[10,6]]));
      p.F(M.skin[3]); p.poly(W(sk,[[-24,6],[-24,-50],[-15,-50],[-17,-36],[-16,-22],[-12,-10],[-8,6]])); });
    // dobras de gordura nas costas
    p.F(M.skin[3]); p.poly(W(sk,[[-18.6,-14],[-12,-12.6],[-12,-11.6],[-18.4,-12.8]])); p.poly(W(sk,[[-18.8,-21],[-13,-20],[-13,-19],[-18.8,-20]]));
    p.F(M.skin[1]); p.poly(W(sk,[[-18.4,-12.6],[-12,-11.4],[-12.4,-10.4],[-18,-11.6]]));
    // regata enrolada no peito (rolo de pano) + alças
    const tank=W(sk,[[-18.4,-26],[-18,-32],[-14,-39.6],[-6,-44.8],[-1,-45],[-0.6,-41],[3,-38],[8,-39],[12,-33.6],[13,-29],[6,-27],[-4,-25.4],[-12,-24]]);
    p.F(M.tank[1]); p.poly(tank);
    clip(c,tank,()=>{ p.F(M.tank[2]); p.poly(W(sk,[[-24,-20],[-24,-50],[-10,-50],[-12,-36],[-8,-28],[4,-30],[14,-30],[14,-20]]));
      p.F(M.tank[3]); p.poly(W(sk,[[-24,-20],[-24,-50],[-15,-50],[-17,-34],[-14,-26],[14,-27.4],[14,-20]]));
      p.F(M.tank[0]); p.poly(W(sk,[[-6,-46],[0,-46],[-1,-41],[-6,-42.4]])); });
    // rolo enrolado
    p.F(M.tank[2]); p.poly(W(sk,[[-18.6,-27.4],[-12,-25.6],[-4,-27],[6,-28.4],[13.2,-30.4],[13.6,-28],[6,-25.6],[-4,-24],[-12,-22.6],[-18.4,-24]]));
    p.F(M.tank[0]); p.poly(W(sk,[[-17,-27],[-12,-25.4],[-4,-26.6],[6,-28],[12,-30],[12.4,-29.2],[6,-27.2],[-4,-25.8],[-12,-24.6],[-17,-26]]));
    p.F(M.tank[3]); [-14,-8,-2,5,10].forEach(x=>{ const q=Wp(sk,x,-25.6+(x>0?-1.4:0)); p.rect(q.x-0.4,q.y-0.4,0.9,1.6); });
    p.F(M.trim[1]); p.poly(W(sk,[[-1.2,-45],[0,-45],[0.4,-41],[3,-38.2],[2.6,-37.2],[-0.8,-40.6]])); p.poly(W(sk,[[-18.2,-30],[-17.6,-32],[-15,-26],[-16,-25]]));
    // logo desbotado (coqueiro) nas costas
    p.F(M.trim[2]); const lg=Wp(sk,-10,-35); p.rect(lg.x-0.5,lg.y-1,1,4); p.poly([[lg.x,lg.y-1],[lg.x-3,lg.y-2.4],[lg.x-2.6,lg.y-1]]); p.poly([[lg.x,lg.y-1],[lg.x+3,lg.y-2.6],[lg.x+2.6,lg.y-0.8]]);
    // nuca e pescoço gordo
    p.F(M.skin[2]); p.poly(W(sk,[[-6,-44.6],[3,-44.8],[2,-42],[-5,-42.4]]));
    if(form==='plenilunar'){ p.F(M.bone[1]); [[-17,-30,-23,-33],[-18.6,-20,-24.6,-20],[-17,-10,-22,-7]].forEach(([u0,v0,u1,v1])=>{ const a=Wp(sk,u0,v0+1.8), b=Wp(sk,u1,v1), d=Wp(sk,u0+0.6,v0-1.8); p.poly([[a.x,a.y],[b.x,b.y],[d.x,d.y]]); }); }
    if(form!=='comum'){ p.F(M.gas[1]); [[[-16,-20],[-12,-16],[-12.6,-15.4],[-16.4,-19.4]],[[-14,-10],[-10,-6],[-10.6,-5.4],[-14.4,-9.4]]].forEach(f=>p.poly(W(sk,f))); }
  }

  /* ---------- barriga translúcida (brilho próprio, sem sombreamento automático) ---------- */
  function drawBelly(c,u,M,sk,P,fi){
    const p=mkPen(c,u); p.id();
    const bs=sk.bs, cx=sk.bc.x+(P.shiver?((fi%2)?0.7:-0.7):0), cy=sk.bc.y, rx=BRX*bs, ry=BRY*bs, g=P.glow, a=sk.a;
    // membrana: aro de pele grossa
    p.F(M.skin[3]); p.ell(cx,cy,rx,ry,a);
    p.F(M.film[2]); p.ell(cx,cy,rx-1,ry-1,a);
    clipE(c,cx,cy,rx-1.2,ry-1.2,()=>{
      // interior translúcido com gás aceso
      p.F(M.film[1]); p.ell(cx+1,cy+1,rx-2.6,ry-2.6);
      // nuvens de gás que brilham através da pele
      p.F(M.gas[3]); p.ell(cx+1.4,cy+1,rx*(0.66+g*0.22),ry*(0.6+g*0.24)); p.ell(cx-rx*0.3,cy+ry*0.3,rx*0.34,ry*0.3);
      p.F(M.gas[2]); p.ell(cx+1.8,cy+0.6,rx*(0.46+g*0.24),ry*(0.42+g*0.24)); p.ell(cx-rx*0.28,cy+ry*0.34,rx*0.2,ry*0.16);
      p.F(M.gas[1]); p.ell(cx+2.4,cy,rx*(0.22+g*0.22),ry*(0.2+g*0.2));
      if(g>0.5){ p.F(M.gas[0]); p.ell(cx+2.8,cy-0.6,rx*(0.06+g*0.1),ry*(0.06+g*0.08)); }
      // bolhas de gás subindo
      const t=(fi*1.7)%6;
      [[-0.5,0.4,2.2],[0.3,0.55,1.6],[0.45,0.1,1.4],[-0.2,-0.1,1.2],[-0.6,-0.2,1],[0.1,0.7,1.1]].forEach(([bx,by,r],k)=>{ const yy=cy+ry*by-((t+k*1.3)%6)*1.4;
        p.F(M.gas[k%2?1:0]); p.circle({x:cx+rx*bx,y:yy},r*(0.8+g*0.4)); p.F(M.gas[2]); p.rect(cx+rx*bx+r*0.3,yy+r*0.2,0.8,0.8); });
      // película de pele por cima (mais opaca em cima, sombra embaixo)
      p.F(M.film[1]); p.poly([[cx-rx,cy-ry*0.3],[cx-rx*0.6,cy-ry*1.1],[cx+rx*0.3,cy-ry*1.1],[cx+rx*0.9,cy-ry*0.6],[cx+rx*0.4,cy-ry*0.56],[cx-rx*0.3,cy-ry*0.5],[cx-rx*0.7,cy-ry*0.2]]);
      p.F(M.film[0]); p.poly([[cx-rx*0.1,cy-ry*1],[cx+rx*0.5,cy-ry*0.9],[cx+rx*0.7,cy-ry*0.66],[cx+rx*0.2,cy-ry*0.72]]);
      p.F(M.film[3]); p.poly([[cx-rx,cy+ry*0.4],[cx-rx*0.4,cy+ry*0.82],[cx+rx*0.5,cy+ry*0.84],[cx+rx,cy+ry*0.5],[cx+rx,cy+ry*1.1],[cx-rx,cy+ry*1.1]]);
      p.F(M.film[2]); p.poly([[cx-rx,cy+ry*0.1],[cx-rx*0.6,cy+ry*0.5],[cx-rx*0.4,cy+ry*0.82],[cx-rx,cy+ry*0.6]]);
      p.poly([[cx-rx,cy-ry*0.3],[cx-rx*0.7,cy-ry*0.2],[cx-rx*0.62,cy+ry*0.3],[cx-rx,cy+ry*0.2]]);
      // veias por cima
      p.F(M.film[3]);
      const ln=(x0,y0,x1,y1,w)=>p.cap({x:cx+rx*x0,y:cy+ry*y0},{x:cx+rx*x1,y:cy+ry*y1},w,w*0.8);
      ln(-0.7,-0.5,-0.35,0,0.9); ln(-0.35,0,-0.45,0.5,0.8); ln(-0.35,0,0.05,0.25,0.7); ln(0.4,-0.6,0.62,-0.1,0.9); ln(0.62,-0.1,0.5,0.4,0.7); ln(0.62,-0.1,0.86,0.1,0.6);
      // estrias claras
      p.F(M.film[0]); [[0.72,0.2],[0.78,0.32],[0.66,0.44]].forEach(([x,y])=>p.cap({x:cx+rx*x,y:cy+ry*y},{x:cx+rx*(x+0.1),y:cy+ry*(y+0.06)},0.7,0.6));
      // umbigo saltado
      const nx=cx+rx*0.78, ny=cy+ry*0.3; p.F(M.film[3]); p.ell(nx,ny,1.8,2.2); p.F(M.film[1]); p.ell(nx+0.6,ny-0.4,1,1.2);
      // rachaduras da explosão (luz vazando)
      if(P.crack>0){ const nC=Math.round(3+P.crack*6); for(let k=0;k<nC;k++){ const an=k/nC*PI*2+0.4, L=(0.4+P.crack*0.55)*(k%2?0.8:1);
        const x1=cx+Math.cos(an)*rx*0.25, y1=cy+Math.sin(an)*ry*0.25, x2=cx+Math.cos(an+0.15)*rx*L, y2=cy+Math.sin(an+0.15)*ry*L, x3=cx+Math.cos(an-0.1)*rx*Math.min(1,L+0.2), y3=cy+Math.sin(an-0.1)*ry*Math.min(1,L+0.2);
        p.F(M.gas[1]); p.cap({x:x1,y:y1},{x:x2,y:y2},1.6,1.2); p.cap({x:x2,y:y2},{x:x3,y:y3},1.2,0.8); p.F(M.gas[0]); p.cap({x:x1,y:y1},{x:x2,y:y2},0.7,0.6); } }
    });
    // brilho molhado na borda
    p.F(M.film[0]); p.ell(cx+rx*0.56,cy-ry*0.5,1.6,1,a+0.7); p.rect(cx+rx*0.78,cy-ry*0.26,1,1.6);
  }

  /* ---------- cabeça pequena afundada nos ombros, papada, óculos na testa ---------- */
  function drawHead(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.xf(sk.ha,sk.hpv.x,sk.hpv.y); c.scale(HS,HS);
    // papada / pescoço gordo
    p.F(M.skin[1]); p.ell(1,-1,10,5.4);
    p.F(M.skin[2]); p.ell(1,1,9,3.8); p.F(M.skin[3]); p.poly([[-8,0],[-2,3.6],[6,3.4],[9,1],[9,2.6],[4,5],[-3,5],[-8.6,1.6]]);
    // crânio
    p.F(M.skin[1]); p.ell(2,-10,8.4,8.2); p.poly([[-4,-6],[10.6,-7.4],[11.6,-3.6],[4,-1],[-3,-2]]);
    p.F(M.skin[2]); p.poly([[-6.4,-13],[-5,-6],[-1,-2.4],[4,-1.6],[0,-4.4],[-2.6,-8],[-3.4,-13]]);
    p.F(M.skin[3]); p.poly([[-6.4,-12],[-6,-7],[-3.6,-3.4],[-4.4,-8]]);
    p.F(M.skin[0]); p.ell(4,-16,4,1.6,-0.2);
    // orelha
    p.F(M.skin[1]); p.ell(-2.8,-9,2,2.8); p.F(M.skin[3]); p.ell(-2.6,-8.8,0.9,1.6);
    // cabelinho ralo grudado
    p.F(M.hair[1]); p.poly([[-7,-12],[-4,-16.6],[-2.6,-15.6],[-5,-11],[-6,-8]]); p.poly([[-1,-17.4],[2,-18.2],[0,-16.6]]);
    // bochechas inchadas, olhos espremidos
    p.F(M.skin[0]); p.ell(8,-5.4,2.6,1.6);
    p.F(M.skin[3]); p.ell(7.4,-9.8,2.8,1.8);
    p.F(M.eye[2]); p.ell(7.6,-9.8,1.9,1.2); p.F(M.eye[1]); p.ell(7.8,-9.9,1.2,0.8); p.F(M.eye[0]); p.rect(7.6,-10.4,0.8,0.7);
    p.F(M.skin[1]); p.poly([[4,-13.4],[11,-12.4],[10.6,-11],[4.4,-11.6]]); p.F(M.skin[3]); p.poly([[4.4,-11.6],[10.6,-11],[10.2,-10.4],[5,-10.8]]);
    p.F(M.skin[3]); p.rect(10.4,-10.4,1.2,0.9); p.F(M.eye[1]); p.rect(10.6,-10.2,0.7,0.6);
    p.F(M.skin[2]); p.poly([[4.6,-8.4],[10,-8],[9,-7],[5,-7.4]]);
    // nariz de batata queimado de sol
    p.F(M.flesh[1]); p.ell(11.4,-7,2,1.8); p.F(M.flesh[0]); p.rect(11,-8,1,0.8); p.F(M.skin[3]); p.rect(11.4,-5.6,1,0.6);
    // óculos escuros na testa
    p.F(M.frame[2]); p.poly([[-1,-15.6],[10,-15],[10,-13.8],[-1,-14.6]]);
    p.F(M.lens[2]); p.ell(5,-15.4,2.6,1.8); p.ell(9.6,-15,1.6,1.6);
    p.F(M.lens[1]); p.rect(4,-16.6,1.4,0.8); p.F(M.lens[0]); p.rect(9.2,-16,0.8,0.7);
    p.F(M.frame[1]); p.rect(7.4,-15.6,1.2,0.7); p.rect(-1,-15.6,5,0.7);
    // podridão e hematoma
    p.F(M.bruise[1]); p.ell(-1,-6,1.8,1.2); p.F(M.rot[1]); p.ell(0,-12,1.6,1.2); p.F(M.rot[2]); p.rect(-0.4,-12.4,1,1);
    // lábio de cima
    p.F(M.mouth[1]); p.poly([[5,-4.2],[11.6,-4.4],[11.8,-2.6],[5.4,-2.4]]); p.F(M.teeth[1]); p.rect(7,-4.4,1.2,1.2); p.rect(9,-4.4,1.2,1.4);
    if(form!=='comum'){ p.F(M.gas[0]); p.rect(6.4,-10.6,2.6,1.2); p.F(M.gas[1]); p.rect(10.4,-10.4,1,0.9); }
    p.id();
  }
  function drawJaw(c,u,M,sk,P){
    const p=mkPen(c,u), h=sk.H(3.6,-3.4); p.xf(sk.ha+rad(P.jaw),h.x,h.y); c.scale(HS,HS);
    p.F(M.mouth[2]); p.poly([[1,-0.8],[8,-0.8],[7.6,1.4],[1.4,1.2]]);
    p.F(M.skin[1]); p.poly([[-1,0.8],[8.6,0.6],[9,2.6],[6,4.4],[0,4],[-1.6,2.4]]);
    p.F(M.skin[2]); p.poly([[-1.6,2.4],[0,4],[6,4.4],[9,2.6],[7,2.6],[1,2.6]]);
    p.F(M.teeth[1]); p.rect(3,-0.2,1.2,1.2); p.rect(5.4,-0.2,1.2,1);
    p.F(M.gas[1]); if(P.jaw>14){ p.rect(8,2.6,1,2); p.circle(P2(8.5,5),0.9); }
    p.id();
  }
  /* nuvem do arroto */
  function drawBurp(c,u,M,sk,P){
    const p=mkPen(c,u); p.id(); const m=sk.H(13,-2), b=P.burp;
    [[4,0,3],[9,-3,4],[15,-1,5],[20,-5,4.4],[12,4,3.4]].slice(0,b+2).forEach(([x,y,r],k)=>{ const q={x:m.x+x*(0.6+b*0.25),y:m.y+y-b*2}; if(q.x+r>FW-3) return;
      p.F(M.gas[3]); p.circle(q,r+1); p.F(M.gas[2]); p.circle(q,r); p.F(M.gas[1]); p.circle({x:q.x-r*0.25,y:q.y-r*0.25},r*0.6); p.F(M.gas[0]); p.rect(q.x-r*0.4,q.y-r*0.5,1,1); });
  }
  /* smear da barrigada */
  function drawSmear(c,u,M,sk){
    const p=mkPen(c,u); p.id(); const cx=sk.bc.x, cy=sk.bc.y, rx=BRX*sk.bs;
    for(let k=0;k<3;k++){ p.F(M.film[k===0?0:1]); p.poly([[cx-rx-6-k*5,cy-8+k*6],[cx-6,cy-5+k*5],[cx-6,cy-3+k*5],[cx-rx-2-k*5,cy-6.6+k*6]]); }
  }

  /* ---------- explosão e restos ---------- */
  function drawBoom(c,u,M,sk,P){
    const p=mkPen(c,u); p.id(); const cx=AX+10, cy=GROUND-50;
    if(P.boom===1){
      // onda de choque no chão + estrela de luz + nuvem
      p.F(M.gas[3]); p.ell(cx,GROUND-3,74,7); p.F(M.gas[2]); p.ell(cx,GROUND-3,66,4.6); p.F(M.gas[3]); p.ell(cx,GROUND-3,56,3);
      p.F(M.gas[2]); for(let k=0;k<12;k++){ const a=k/12*PI*2+0.2, L=(k%2?50:68); p.poly([[cx+Math.cos(a-0.2)*16,cy+Math.sin(a-0.2)*16],[cx+Math.cos(a)*L,Math.min(GROUND-2,cy+Math.sin(a)*L)],[cx+Math.cos(a+0.2)*16,cy+Math.sin(a+0.2)*16]]); }
      p.F(M.gas[3]); p.circle({x:cx,y:cy},40); p.F(M.gas[1]); p.circle({x:cx,y:cy},34); p.F(M.gas[0]); p.circle({x:cx,y:cy},22);
      p.F(M.smoke[1]); [[-32,-22,11],[30,-26,10],[38,12,10],[-38,14,10],[0,-40,11]].forEach(([x,y,r])=>p.circle({x:cx+x,y:cy+y},r));
      p.F(M.smoke[0]); [[-30,-24,6],[28,-28,5.4],[0,-42,6]].forEach(([x,y,r])=>p.circle({x:cx+x,y:cy+y},r));
      // pedaços voando
      [[-56,-36],[58,-30],[52,26],[-50,28],[12,-58],[-16,-56]].forEach(([x,y],k)=>{ const q={x:cx+x,y:cy+y}; p.F(k%2?M.flesh[1]:M.skin[1]); p.ell(q.x,q.y,2.6,1.8,k); p.F(k%2?M.flesh[2]:M.blood[1]); p.rect(q.x,q.y,1.2,1.2); });
      return; }
    // fumaça subindo dos restos
    const k=P.boom-1;
    p.F(M.smoke[2]); [[-6,-30,7],[6,-40,6],[-2,-52,5]].forEach(([x,y,r],j)=>{ if(j<4-k) p.circle({x:cx+x,y:cy+y-k*6},r-k*0.6); });
    p.F(M.smoke[1]); [[-7,-32,4],[5,-42,3.4],[-3,-54,3]].forEach(([x,y,r],j)=>{ if(j<4-k) p.circle({x:cx+x,y:cy+y-k*6},r-k*0.4); });
    p.F(M.gas[1]); [[-14,-18],[16,-24],[4,-60]].forEach(([x,y])=>p.rect(cx+x,cy+y-k*4,1.2,1.2));
  }
  function drawRemains(c,u,M,sk,P){
    // poça de gosma e sangue + pedaços no chão
    const p=mkPen(c,u); p.id(); const cx=AX+4, w=P.remains===1?0.7:1;
    p.F(M.blood[3]); p.ell(cx,GROUND-1,30*w+6,3.2); p.F(M.blood[2]); p.ell(cx+2,GROUND-1.4,24*w+4,2.4); p.F(M.gas[2]); p.ell(cx-6,GROUND-1.6,10*w,1.4); p.F(M.blood[1]); p.ell(cx+8,GROUND-1.8,6,1);
    [[-26,0],[22,-1],[34,0],[-14,-1]].forEach(([x,y],k)=>{ p.F(k%2?M.flesh[1]:M.shorts[1]); p.ell(cx+x,GROUND-2.4+y,2.4,1.6); p.F(k%2?M.flesh[2]:M.flower[1]); p.rect(cx+x,GROUND-3+y,1,1); });
    // chinelo sozinho
    p.F(M.sole[1]); p.poly([[cx+12,GROUND-3],[cx+26,GROUND-3],[cx+26.6,GROUND-0.6],[cx+11.6,GROUND-0.6]]); p.F(M.strap[1]); p.poly([[cx+17,GROUND-3],[cx+20,GROUND-6],[cx+21,GROUND-5.4],[cx+19,GROUND-3]]);
  }
  function drawStumps(c,u,M,sk,P,front){
    // sobra as pernas em pé (frame 7) com o short rasgado
    const p=mkPen(c,u); p.id(); drawLeg(c,u,M,sk,P,front); p.id();
    const hip=front?sk.hipF:sk.hipB; p.F(M.flesh[2]); p.ell(hip.x,hip.y-2,8,3.4); p.F(M.flesh[1]); p.ell(hip.x+1,hip.y-2.6,5,2); p.F(M.bone[1]); p.ell(hip.x,hip.y-3,1.6,1.2);
    p.F(M.shorts[2]); [[-7,0],[-3,1],[2,0],[6,1]].forEach(([x,y])=>p.poly([[hip.x+x-1.6,hip.y+y-1],[hip.x+x+1.6,hip.y+y-1],[hip.x+x,hip.y+y+2.6]]));
  }

  /* ---------- montagem ---------- */
  const cache=PIX.cache();
  function frame(form,anim,fi,step=5,Pov,pk){
    const K=PIX.getK(), key=(pk!=null?'#'+pk+'|'+form:form+'|'+anim+'|'+fi+'|'+step)+'@'+K;
    const hit=cache.get(key); if(hit){ cache.delete(key); cache.set(key,hit); return hit; }
    const P=Pov?Object.assign({},REST,Pov):poseOf(anim,fi), M=mats(form), f=fi|0;
    let sk=skeleton(P), parts;
    if(P.boom){
      const Q=Object.assign({},REST,{belly:0}); sk=skeleton(Q);
      parts=[];
      if(P.remains) parts.push({draw:(c,u)=>drawRemains(c,u,M,sk,P)});
      if(P.remains===1){ parts.push({back:true, draw:(c,u)=>drawStumps(c,u,M,sk,Q,false)}); parts.push({draw:(c,u)=>drawStumps(c,u,M,sk,Q,true)}); }
      parts.push({noShade:true, noRim:true, smear:true, draw:(c,u)=>drawBoom(c,u,M,sk,P)});
    } else {
      parts=[
        {back:true, draw:(c,u)=>drawArm(c,u,M,sk,P,false)},
        {back:true, draw:(c,u)=>drawLeg(c,u,M,sk,P,false)},
        {draw:(c,u)=>drawTorso(c,u,M,sk,P,form)},
        {draw:(c,u)=>drawLeg(c,u,M,sk,P,true)},
        {noShade:true, draw:(c,u)=>drawBelly(c,u,M,sk,P,f)},
        {draw:(c,u)=>drawHead(c,u,M,sk,P,form)},
        {draw:(c,u)=>drawJaw(c,u,M,sk,P)},
      ];
      if(P.smear) parts.push({noShade:true, smear:true, noRim:true, draw:(c,u)=>drawSmear(c,u,M,sk)});
      parts.push({draw:(c,u)=>drawArm(c,u,M,sk,P,true)});
      if(P.burp) parts.push({noShade:true, noRim:true, smear:true, draw:(c,u)=>drawBurp(c,u,M,sk,P)});
    }
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM[form]}); if(step>=4) heavyOutline(cv);
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._belly=sc(sk.bc); cv._bellyR=BRX*sk.bs*K; cv._glow=P.glow; cv._eye=sc(sk.H(7.6,-10)); cv._mouth=sc(sk.H(10,-2)); cv._head=sc(sk.H(2,-10)); cv._hand=sc(sk.wrF);
    cache.set(key,cv); if(cache.size>900) cache.delete(cache.keys().next().value);
    return cv;
  }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame,framePose:function(form,anim,P,key){ return frame(form,anim,0,5,P,key); }};
})();
