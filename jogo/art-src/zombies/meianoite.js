/* MEIANOITE — fonte de arte (editável). Build: npm run art
   Chefe de Olinda "O Boneco da Meia-Noite": boneco gigante de carnaval (~3,5 m) tomado pela Lua de Sangue.
   Cabeça enorme de papel machê rachada (sorriso pintado virou boca de zumbi), cartola amassada, fraque
   verde-escuro com lapela roxa desbotada, camisa de babado, gravata, relógio de bolso gigante parado na
   meia-noite (brilha), braços de pano longos e moles com luvas de pano, saia de pano rasgada e o carregador
   humano zumbi aparecendo por baixo (canelas, chinelo). Fúria: cabeça racha e mostra a armação de madeira,
   olhos e relógio vermelhos, pano rasgado em chamas lunares. Releitura nossa, sem marca nem texto. */
const MEIANOITE=(function(){
  const {rad,lp,lerp,P2,mkPen,compose}=PIX;
  const FW=480, FH=334, GROUND=322, AX=232;
  const RIM={normal:'#d8ccff', furia:'#ff8a8a'};

  /* ---- cor: saturação +15% e rampas intermediárias (6 tons por material) ---- */
  function hsl(h){ const [r,g,b]=PIX.hexRgb(h).map(v=>v/255), mx=Math.max(r,g,b), mn=Math.min(r,g,b), l=(mx+mn)/2; let s=0,hh=0;
    if(mx!==mn){ const d=mx-mn; s=l>0.5?d/(2-mx-mn):d/(mx+mn); hh=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4; hh/=6; } return [hh,s,l]; }
  function hex(hh,s,l){ const f=(p,q,t)=>{ if(t<0)t+=1; if(t>1)t-=1; return t<1/6?p+(q-p)*6*t:t<1/2?q:t<2/3?p+(q-p)*(2/3-t)*6:p; };
    let r,g,b; if(s===0){ r=g=b=l; } else { const q=l<0.5?l*(1+s):l+s-l*s, p=2*l-q; r=f(p,q,hh+1/3); g=f(p,q,hh); b=f(p,q,hh-1/3); } return PIX.toHex(r*255,g*255,b*255); }
  const sat=(h,k=1.15)=>{ const [a,s,l]=hsl(h); return hex(a,Math.min(1,s*k),l); };
  function finish(m,skip){ const used=new Set(), uniq=h=>{ let x=h, k=0; while(used.has(x)){ const [r,g,b]=PIX.hexRgb(h); k++; x=PIX.toHex(r>128?r-k:r+k,g,b>128?b-(k>>1):b+(k>>1)); } used.add(x); return x; };
    for(const k of Object.keys(m)){ if(!skip.includes(k)) m[k]=m[k].map(h=>sat(h)); }
    const keys=Object.keys(m);
    for(const k of keys){ if(skip.includes(k)) continue; const r=m[k];
      m[k+'Q']=[PIX.mix(PIX.mix(r[0],r[1],0.5),'#ffd9a0',0.12), PIX.mix(PIX.mix(r[1],r[2],0.5),'#6a3ca0',0.16), PIX.mix(r[2],'#3b2c63',0.3), PIX.mix(r[3],'#1c1233',0.35)]; }
    for(const k of Object.keys(m)) m[k]=m[k].map(uniq);
    return m; }
  let QM=null; const qOf=R=>{ if(!QM) return R; for(const k in QM) if(QM[k]===R) return QM[k+'Q']||R; return R; };
  const MC={};
  function mats(form){ return MC[form]||(MC[form]=mats0(form)); }
  function mats0(form){
    const m={
      coat:['#88c290','#3f7c5c','#264c42','#152733'],
      lapel:['#d4b4e0','#9476ae','#5e4882','#30264c'],
      pano:['#b6a8ca','#776a98','#4c426c','#282342'],
      shirt:['#fffbea','#e4d8c0','#ab9b92','#5f5266'],
      tie:['#f58a86','#bc3e50','#76223e','#40102a'],
      gold:['#fff2b4','#e8b44e','#aa722e','#5c3622'],
      paint:['#fae6c8','#d4ac90','#967280','#4e3854'],
      paper:['#f2e8d2','#c2b29c','#88786c','#4c4048'],
      hair:['#7a6a7e','#433548','#2a1f32','#160f1e'],
      hat:['#8e86ac','#4c4468','#2e2846','#18142a'],
      glove:['#ffffff','#e8e2d8','#b0a6aa','#635c70'],
      skin:['#d6dcaa','#98a47e','#60705e','#343c46'],
      jeans:['#a0b8d0','#5c7698','#3c4e70','#202a42'],
      sandal:['#d8f2ff','#5caade','#306ca0','#1a3c5e'],
      wood:['#dca870','#9c6c40','#64422c','#38241c'],
      mouth:['#7c2c3c','#4c1a2a','#2e0e1a','#1c0712'],
      teeth:['#fff6d2','#e2ce92','#aa9450','#68562a'],
      blood:['#aa3c33','#76212b','#4b131f','#2b0913'],
      fresh:['#ff8c7c','#d63c46','#901b31','#500d1f'],
      eye:['#ffffff','#eeffa0','#aad83e','#4c7a1c'],
      dial:['#ffffff','#fff4c4','#ffd56a','#b88420'],
      flame:['#fff6fa','#ffb0cc','#ff5078','#b41c50'],
      fx:['#fffef2','#fff2aa','#ffc24c','#e27c24'],
      dust:['#eadecd','#c6b6a0','#968671','#605448'],
    };
    if(form==='furia'){
      m.coat=['#8cbc86','#40704e','#283f3c','#16202c'];
      m.paint=['#ffd8c0','#e09a8a','#a45a6a','#58283e'];
      m.pano=['#c8a2c0','#8a5e8a','#583c62','#2e2040'];
      m.hat=['#9a7c9e','#56405e','#33263e','#1a1226'];
      m.eye=['#ffffff','#ffe250','#ff3c2c','#a8100e'];
      m.dial=['#ffffff','#ffb4a4','#ff4636','#a01018'];
      m.blood=['#e0503a','#a8282c','#6c1420','#3c0a14'];
    }
    return finish(m,['fx','dust','eye','dial','flame']);
  }
  const NAMES={coat:'Fraque de pano',lapel:'Lapela desbotada',pano:'Saia de pano',shirt:'Camisa de babado',tie:'Gravata',gold:'Relógio/botões',
    paint:'Papel machê pintado',paper:'Papel machê exposto',hair:'Cabelo/bigode pintado',hat:'Cartola',glove:'Luva de pano',skin:'Pele do carregador',
    jeans:'Bermuda do carregador',sandal:'Chinelo',wood:'Armação de madeira',eye:'Olho',dial:'Mostrador',flame:'Chama lunar'};

  /* ---------------- poses ---------------- */
  const S=Math.sin, C=Math.cos, PI=Math.PI;
  const REST={hx:0,drop:0,tilt:4,hd:0,hatT:0,lFh:14,lFk:-4,lBh:-6,lBk:-20,fF:0,fB:0,
    aF:12,kF:-12,wF:5,lsF:1,aB:-8,kB:10,wB:5,lsB:1,ph:0,sway:0,
    sink:0,flash:0,roar:0,ring:0,impact:0,smear:0,spin:0,th:0,steam:0,crack:0,dead:0,
    headOff:0,hdX:0,hdY:0,roll:0,hatOff:0,htX:0,htY:0,htR:0,run:null,crawl:0,t:0};
  const ANIMS={
    idle:{nome:'Parado (balanço de boneco)',n:8,dur:()=>170,pose:i=>{ const p=i/8*PI*2;
      return {tilt:4+3*S(p), hd:-2+4*S(p-0.9), drop:1.5-1.5*C(2*p), sway:5*S(p-1), hx:1.5*S(p),
        aF:10+12*S(p-1.1), kF:-10+14*S(p-1.9), wF:6, aB:-6+12*S(p-1.4), kB:8-12*S(p-2.1), wB:6, ph:p, hatT:2*S(p-1.6)}; }},
    walk:{nome:'Andar (passos pesados)',n:8,stomp:[0,4],dur:()=>170,pose:i=>{ const p=i/8*PI*2+PI/2;
      const lFh=8+18*S(p), lBh=-4+18*S(p+PI);
      return {lFh, lFk:lFh-22*Math.max(0,C(p))-6, lBh, lBk:lBh-22*Math.max(0,C(p+PI))-10, fF:-6*C(p), fB:-6*C(p+PI),
        drop:2-2.5*C(2*(p-PI/2)), tilt:6+4*S(2*p), hd:2+4*S(2*p-1), sway:7*S(p+1.4), hx:1.5*S(2*p),
        aF:14-18*S(p), kF:-10+18*S(p-0.9), wF:7, aB:-4+18*S(p), kB:8-18*S(p-0.9), wB:7, ph:2*p, hatT:3*S(2*p-1.8)}; }},
    stomp:{nome:'Pisão em área',n:11,warn:[1,2,3],hit:5,vuln:[6,7,8],dur:i=>[170,150,150,170,70,130,240,240,240,190,170][i],pose:i=>[
      {tilt:12,hd:12,lFh:40,lFk:-30,lBh:16,lBk:-56,aF:40,kF:70,wF:3,aB:-40,kB:-70,wB:3,sway:6,drop:2},
      {tilt:-4,hd:-10,lFh:20,lFk:-8,lBh:2,lBk:-18,aF:146,kF:40,wF:8,aB:-146,kB:-40,wB:8,sway:-8,roar:1,drop:-8,ph:1},
      {tilt:-8,hd:-14,lFh:56,lFk:-14,lBh:34,lBk:-56,aF:160,kF:46,wF:10,aB:-160,kB:-46,wB:10,sway:-12,roar:1,drop:-26,ph:2,hatT:-8},
      {tilt:-6,hd:-14,lFh:58,lFk:-12,lBh:36,lBk:-58,aF:164,kF:50,wF:10,aB:-164,kB:-50,wB:10,sway:-12,roar:1,drop:-30,ph:3,hatT:-10},
      {tilt:10,hd:8,lFh:20,lFk:2,lBh:-2,lBk:-12,aF:128,kF:-50,wF:6,aB:-120,kB:50,wB:6,sway:10,smear:1,drop:-10,ph:4,hatT:-12},
      {tilt:18,hd:18,lFh:40,lFk:-24,lBh:-18,lBk:-52,aF:74,kF:40,wF:4,aB:-66,kB:-36,wB:4,sway:14,impact:1,drop:3,ph:5,hatT:8},
      {tilt:24,hd:32,lFh:42,lFk:-28,lBh:-20,lBk:-56,aF:30,kF:50,wF:3,aB:-34,kB:-30,wB:3,sway:6,steam:1,drop:3,ph:5.5,hatT:10},
      {tilt:26,hd:36,lFh:42,lFk:-28,lBh:-20,lBk:-56,aF:26,kF:54,wF:3,aB:-30,kB:-34,wB:3,sway:4,steam:1,drop:3,ph:6.2,hatT:12},
      {tilt:22,hd:30,lFh:40,lFk:-26,lBh:-18,lBk:-52,aF:24,kF:46,wF:3,aB:-24,kB:-26,wB:3,sway:2,steam:1,drop:3,ph:6.9,hatT:9},
      {tilt:12,hd:12,lFh:26,lFk:-12,lBh:-8,lBk:-30,aF:14,kF:6,aB:-10,kB:12,sway:-4,ph:7.6,hatT:4},
      {tilt:5,hd:2,aF:10,kF:-10,aB:-8,kB:10,sway:-2,ph:8.3}][i]},
    spin:{nome:'Giro de chicote',n:12,run:[2,3,4,5,6,7,8,9],dur:i=>[170,110,70,70,70,70,70,70,70,70,200,180][i],pose:i=>{
      if(i===0) return {tilt:-8,hd:-8,lFh:24,lFk:-14,lBh:-10,lBk:-34,aF:-70,kF:-40,wF:4,aB:-96,kB:-30,wB:4,sway:-10,spin:1,th:-20};
      if(i===1) return {tilt:-4,hd:-4,lFh:20,lFk:-10,lBh:-6,lBk:-28,aF:-100,kF:-20,wF:6,aB:-110,kB:-10,wB:6,sway:-12,spin:1,th:-50,roar:1};
      if(i>=10) return [{tilt:-10,hd:-20,aF:40,kF:60,wF:8,aB:-30,kB:-50,wB:8,sway:12,hatT:-14,ph:3},{tilt:8,hd:14,aF:6,kF:-20,aB:10,kB:20,sway:-6,hatT:6,ph:4}][i-10];
      const th=(i-2)*86+30, d=((th%360)+360)%360, sn=S(rad(d)), sg=sn>=0?1:-1, ls=Math.max(0.72,Math.abs(sn));
      return {spin:1,th,tilt:2,hd:-2,roar:1,lFh:16+8*S(i*1.7),lFk:-8,lBh:-4-8*S(i*1.7),lBk:-24,drop:-2-2*S(i*1.3),
        aF:80*sg,kF:-18*sg,wF:8,lsF:ls,aB:-80*sg,kB:18*sg,wB:8,lsB:ls,ph:i*1.1,sway:-14*sg,smear:1,hatT:-10*sg}; }},
    clock:{nome:'Badaladas da meia-noite',n:10,ringAt:[2,5,8],dur:i=>[180,150,170,150,150,170,150,150,220,200][i],pose:i=>{
      const up={tilt:-10,hd:-14,aF:150,kF:-24,wF:8,aB:-152,kB:24,wB:8,roar:1,lFh:18,lFk:-8,lBh:-8,lBk:-26,ring:0.35,hatT:-6};
      const hit=k=>({tilt:4,hd:6+k*2,aF:104,kF:44,wF:12,aB:-104,kB:-44,wB:12,roar:1,ring:1+k*0.25,drop:2,sway:6,lFh:24,lFk:-16,lBh:-12,lBk:-34,hatT:6,ph:k*2});
      return [{tilt:-4,hd:-6,aF:-30,kF:20,aB:-40,kB:20,lFh:16,lFk:-6,sway:-4},
        up, hit(0), Object.assign({},up,{ring:0.3,ph:1}), Object.assign({},up,{tilt:-12,hd:-16,ring:0.5,ph:2}),
        hit(1), Object.assign({},up,{ring:0.3,ph:3}), Object.assign({},up,{tilt:-12,hd:-18,ring:0.6,ph:4}),
        hit(2), {tilt:2,hd:4,aF:30,kF:30,aB:-20,kB:-30,sway:4,ring:0.2,ph:6}][i]; }},
    rage:{nome:'Entrar em fúria',n:8,dur:i=>[180,120,120,200,220,220,220,200][i],pose:i=>[
      {tilt:16,hd:26,lFh:34,lFk:-26,lBh:-10,lBk:-44,aF:-10,kF:40,aB:10,kB:-40,sway:4,hatT:8},
      {tilt:18,hd:30,lFh:36,lFk:-28,lBh:-12,lBk:-46,aF:-8,kF:44,aB:12,kB:-44,hx:-2,crack:1,steam:1,sway:-4,hatT:10},
      {tilt:18,hd:28,lFh:36,lFk:-28,lBh:-12,lBk:-46,aF:-12,kF:40,aB:8,kB:-40,hx:2,crack:1,steam:1,sway:4,hatT:8},
      {tilt:-10,hd:-22,aF:166,kF:20,wF:12,aB:-166,kB:-20,wB:12,roar:1,crack:1,ring:0.7,drop:-4,hatT:-14,ph:1},
      {tilt:-14,hd:-28,aF:170,kF:30,wF:14,aB:-170,kB:-30,wB:14,roar:1,crack:1,ring:1,hx:-3,steam:1,hatT:-18,ph:2.2},
      {tilt:-14,hd:-30,aF:168,kF:24,wF:14,aB:-168,kB:-24,wB:14,roar:1,crack:1,ring:1,hx:3,steam:1,hatT:-16,ph:3.4},
      {tilt:-12,hd:-26,aF:164,kF:30,wF:14,aB:-164,kB:-30,wB:14,roar:1,crack:1,ring:0.8,hx:-2,hatT:-14,ph:4.6},
      {tilt:4,hd:0,aF:20,kF:-10,aB:-10,kB:10,crack:1,ph:6}][i]},
    hurt:{nome:'Dano',n:4,dur:i=>[80,110,130,160][i],pose:i=>[
      {flash:1,tilt:-12,hd:-20,hx:-6,aF:-40,kF:-40,wF:8,aB:-70,kB:-30,wB:8,sway:-12,roar:1,hatT:-10},
      {tilt:-8,hd:-14,hx:-4,aF:-24,kF:-30,aB:-50,kB:-20,sway:-8,roar:1,hatT:-8,ph:1},
      {tilt:0,hd:-2,hx:-1,aF:30,kF:40,aB:10,kB:30,sway:6,hatT:4,ph:2},
      {ph:3}][i]},
    intro:{nome:'Entrada (WARNING): erguido como num cortejo',n:12,dur:i=>[300,220,160,140,140,180,180,180,220,160,300,260][i],pose:i=>[
      {sink:1.15,tilt:10,hd:44,lFh:70,lFk:-80,lBh:56,lBk:-90,aF:70,kF:40,aB:-80,kB:-30,wF:2,wB:2,hatT:20},
      {sink:1.05,tilt:6,hd:38,lFh:66,lFk:-74,lBh:52,lBk:-86,aF:60,kF:40,aB:-70,kB:-30,wF:2,wB:2,hatT:18},
      {sink:0.78,tilt:-4,hd:24,lFh:52,lFk:-58,lBh:34,lBk:-72,aF:30,kF:40,aB:-30,kB:-20,hatT:12,ph:1},
      {sink:0.45,tilt:-8,hd:8,lFh:36,lFk:-30,lBh:16,lBk:-46,aF:10,kF:30,aB:-10,kB:-10,sway:-6,hatT:6,ph:2},
      {sink:0.15,tilt:-6,hd:-4,lFh:22,lFk:-12,lBh:0,lBk:-26,aF:0,kF:10,aB:0,kB:0,sway:-8,ph:3},
      {tilt:10,hd:12,aF:40,kF:40,wF:8,aB:-30,kB:-30,wB:8,sway:10,hatT:8,ph:4},
      {tilt:-6,hd:-10,aF:-40,kF:-40,wF:8,aB:-60,kB:30,wB:8,sway:-10,hatT:-8,ph:5},
      {tilt:8,hd:10,aF:60,kF:50,wF:8,aB:40,kB:-30,wB:8,sway:10,hatT:8,ph:6},
      {tilt:-8,hd:-16,aF:158,kF:-20,wF:10,aB:-158,kB:20,wB:10,roar:1,ring:1,drop:-2,hatT:-10,ph:7},
      {tilt:-6,hd:-14,aF:150,kF:-30,wF:10,aB:-150,kB:30,wB:10,roar:1,ring:0.5,hatT:-8,ph:8},
      {tilt:-12,hd:-22,aF:164,kF:20,wF:12,aB:-164,kB:-20,wB:12,roar:1,ring:1.4,drop:-3,hatT:-14,ph:9},
      {tilt:4,hd:0,aF:12,kF:-12,aB:-8,kB:10,ph:10}][i]},
    death:{nome:'Morte (desaba, cabeça rola, carregador foge)',n:14,dur:i=>[90,160,180,200,180,140,120,140,180,140,140,140,400,700][i],pose:i=>{
      const H=(x,y,r)=>({headOff:1,hdX:x,hdY:y,roll:r}), T=(x,y,r)=>({hatOff:1,htX:x,htY:y,htR:r});
      const pile={sink:1.05,tilt:4,lFh:70,lFk:-80,lBh:56,lBk:-90,aF:50,kF:40,wF:3,aB:-46,kB:-44,wB:3,hd:20};
      return [
        {flash:1,tilt:-12,hd:-22,hx:-6,aF:-40,kF:-40,aB:-60,kB:-30,roar:1,sway:-10},
        {tilt:-16,hd:-28,hx:-8,aF:160,kF:-30,wF:12,aB:-160,kB:30,wB:12,roar:1,crack:1,sway:-12,ph:1},
        {tilt:14,hd:26,hx:-2,aF:40,kF:60,aB:-30,kB:-60,crack:1,sway:10,ph:2},
        {sink:0.25,tilt:-6,hd:-12,lFh:30,lFk:-24,lBh:6,lBk:-40,aF:20,kF:20,aB:-10,kB:-10,crack:1,ph:3},
        {sink:0.5,tilt:8,hd:34,lFh:44,lFk:-44,lBh:24,lBk:-60,aF:40,kF:30,aB:-40,kB:-20,crack:1,ph:4,hatT:16},
        Object.assign({sink:0.75,tilt:10,lFh:56,lFk:-62,lBh:40,lBk:-76,aF:60,kF:30,aB:-60,kB:-30,crack:1,ph:5},H(46,168,30),T(-10,232,-40)),
        Object.assign({sink:0.95,tilt:8,lFh:66,lFk:-74,lBh:50,lBk:-86,aF:76,kF:20,aB:-76,kB:-20,crack:1,ph:6},H(82,96,80),T(-46,150,-90)),
        Object.assign({},pile,{crack:1},H(112,41,140),T(-74,31,-100)),
        Object.assign({},pile,{crack:1,run:-56,crawl:1},H(138,41,200),T(-74,31,-100)),
        Object.assign({},pile,{crack:1,run:-96,crawl:0.3},H(154,41,248),T(-74,31,-100)),
        Object.assign({},pile,{crack:1,run:-134,t:1},H(160,41,262),T(-74,31,-100)),
        Object.assign({},pile,{crack:1,run:-172,t:2,dead:0.5},H(160,41,258),T(-74,31,-100)),
        Object.assign({},pile,{crack:1,dead:0.8,sink:1.1},H(160,41,260),T(-74,31,-100)),
        Object.assign({},pile,{crack:1,dead:1,sink:1.1},H(160,41,260),T(-74,31,-100))][i]; }},
  };
  function poseOf(anim,i){ const P=Object.assign({},REST,ANIMS[anim].pose(i)); if(P.t===REST.t) P.t=i; P.anim=anim; return P; }

  /* ---------------- esqueleto (carregador + armação) ---------------- */
  const THI=28, SHN=27, HS=1.12;
  const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
  function bodyL(P){ const s=cl(P.sink,0,1.25), sh=1-0.62*s; return {wd:1.12+0.2*s, wy:-52*sh, sy:-101*sh, ny:-101*sh-7}; }
  function bones(P,hy){
    const hip={x:AX+P.hx,y:hy};
    const hipF={x:hip.x+6,y:hip.y+1}, hipB={x:hip.x-6,y:hip.y};
    const kneeF=lp(hipF,P.lFh,THI), ankleF=lp(kneeF,P.lFk,SHN), kneeB=lp(hipB,P.lBh,THI), ankleB=lp(kneeB,P.lBk,SHN);
    const a=rad(P.tilt), c=C(a), s=S(a);
    const T=(lx,ly)=>({x:hip.x+lx*c-ly*s, y:hip.y+lx*s+ly*c});
    const L=bodyL(P);
    const neck=T(16,L.ny), shF=T(42*L.wd,L.sy+12), shB=T(-40*L.wd,L.sy+10);
    const ha=a*0.6+rad(P.hd), hc=C(ha), hs=S(ha);
    const H=(lx,ly)=>({x:neck.x+(lx*hc-ly*hs)*HS, y:neck.y+(lx*hs+ly*hc)*HS});
    return {hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,a,T,L,neck,shF,shB,ha,H};
  }
  function skeleton(P){
    const b0=bones(P,200);
    const foot=(an,fa)=>Math.max(an.y+7, an.y+7+S(rad(fa))*16);
    const dy=GROUND-Math.max(foot(b0.ankleF,P.fF),foot(b0.ankleB,P.fB))+P.drop;
    const sk=bones(P,200+dy);
    sk.hemY=Math.min(GROUND-1, lerp({x:0,y:sk.hip.y+20},{x:0,y:GROUND-1},cl(P.sink*1.5,0,1)).y);
    return sk;
  }

  /* ---------------- utilidades ---------------- */
  const LIGHT={x:0.6,y:-0.8};
  let CTX=null, SX=1, PXc=AX, BACK=false;
  // caneta com giro (spin): escala horizontal em torno do eixo do corpo; w()/xw() = mundo sem giro
  function pen(c,u){ const p=mkPen(c,u), K=PIX.getK(), xw=p.xf;
    p.xw=xw; p.w=()=>c.setTransform(K,0,0,K,0,0);
    p.xf=(a,ox,oy)=>{ const cc=C(a), s=S(a), ex=PXc+(ox-PXc)*SX; c.setTransform(cc*SX*K,s*K,-s*SX*K,cc*K,ex*K,oy*K); };
    p.id=()=>c.setTransform(SX*K,0,0,K,PXc*(1-SX)*K,0);
    return p; }
  const Wd=q=>({x:PXc+(q.x-PXc)*SX, y:q.y});
  function band(p,pts,w){ for(let k=0;k<pts.length-1;k++) p.cap(pts[k],pts[k+1],w,w); }
  const bandA=(p,arr,w)=>band(p,arr.map(q=>P2(q[0],q[1])),w);
  function lightLocal(ang){ return [LIGHT.x*C(-ang)-LIGHT.y*S(-ang), LIGHT.x*S(-ang)+LIGHT.y*C(-ang)]; }
  function shadeIn(p,R,Q,cx,cy,rx,ry,ang,hi,rot){
    const [lx,ly]=lightLocal(ang);
    p.F(Q[1]); p.ell(cx-lx*rx*0.8,cy-ly*ry*0.8,rx,ry,rot);
    p.F(R[2]); p.ell(cx-lx*rx*1.05,cy-ly*ry*1.05,rx,ry,rot);
    p.F(R[3]); p.ell(cx-lx*rx*1.45,cy-ly*ry*1.45,rx,ry,rot);
    if(hi){ p.F(Q[0]); p.ell(cx+lx*rx*1.12,cy+ly*ry*1.12,rx,ry,rot); p.F(R[0]); p.ell(cx+lx*rx*1.5,cy+ly*ry*1.5,rx*(0.7+0.3*hi),ry*(0.7+0.3*hi),rot); }
  }
  function mass(p,R,cx,cy,rx,ry,ang,hi=1,rot=0){
    const Q=qOf(R);
    p.F(R[1]); p.ell(cx,cy,rx,ry,rot);
    CTX.save(); CTX.beginPath(); CTX.ellipse(cx,cy,rx,ry,rot,0,PI*2); CTX.clip();
    shadeIn(p,R,Q,cx,cy,rx,ry,ang,hi,rot);
    CTX.restore();
  }
  function platePoly(p,R,pts,ang,hi=1){
    const Q=qOf(R); let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9; pts.forEach(([x,y])=>{ x0=Math.min(x0,x); y0=Math.min(y0,y); x1=Math.max(x1,x); y1=Math.max(y1,y); });
    const cx=(x0+x1)/2, cy=(y0+y1)/2, rx=(x1-x0)/2+0.5, ry=(y1-y0)/2+0.5;
    p.F(R[1]); p.poly(pts);
    CTX.save(); CTX.beginPath(); pts.forEach((q,i)=>i?CTX.lineTo(q[0],q[1]):CTX.moveTo(q[0],q[1])); CTX.closePath(); CTX.clip();
    shadeIn(p,R,Q,cx,cy,rx,ry,ang,hi,0); CTX.restore();
  }
  function clipPoly(pts,fn){ CTX.save(); CTX.beginPath(); pts.forEach((q,i)=>i?CTX.lineTo(q[0],q[1]):CTX.moveTo(q[0],q[1])); CTX.closePath(); CTX.clip(); fn(); CTX.restore(); }
  function heavyBase(cv){ const g=cv.getContext('2d'), W=cv.width, H=cv.height, im=PIX.pix(cv), d=im.data, O=[0x17,0x0b,0x1c];
    const isO=i=>d[i+3]===255&&d[i]===O[0]&&d[i+1]===O[1]&&d[i+2]===O[2];
    for(let y=H-1;y>=2;y--) for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(d[i+3]) continue; const a=((y-1)*W+x)*4, b=((y-2)*W+x)*4; if(isO(a)&&d[b+3]&&!isO(b)){ d[i]=O[0]; d[i+1]=O[1]; d[i+2]=O[2]; d[i+3]=255; } }
    g.putImageData(im,0,0); }
  const rnd=(s,k)=>{ const v=Math.sin(s*12.9898+k*78.233)*43758.5453; return v-Math.floor(v); };
  function stain(p,M,x,y,r,drips,seed=1){
    p.F(M.blood[2]);
    for(let k=0;k<5;k++){ const a=rnd(seed,k)*PI*2, d=rnd(seed,k+9)*r*0.7; p.ell(x+C(a)*d,y+S(a)*d*0.7,r*(0.35+rnd(seed,k+3)*0.35),r*(0.25+rnd(seed,k+5)*0.3)); }
    for(let k=0;k<drips;k++){ const dx=(rnd(seed,k+20)-0.5)*r*1.4, L=r*(0.8+rnd(seed,k+30)*1.6); p.rect(x+dx-0.7,y,1.4,L); p.ell(x+dx,y+L,1.2,1.4); }
    p.F(M.blood[1]); for(let k=0;k<2;k++){ const a=rnd(seed,k+40)*PI*2, d=rnd(seed,k+50)*r*0.4; p.ell(x+C(a)*d,y+S(a)*d*0.6-r*0.1,r*0.3,r*0.2); }
  }
  // costura: linha + pontos
  function seam(p,R,pts,step=4){ p.F(R[3]); bandA(p,pts,1); p.F(R[0]);
    for(let s=0;s<pts.length-1;s++){ const a=pts[s], b=pts[s+1], L=Math.hypot(b[0]-a[0],b[1]-a[1]), n=Math.max(1,Math.floor(L/step));
      for(let k=0;k<n;k++){ const t=(k+0.5)/n; p.rect(a[0]+(b[0]-a[0])*t-0.4,a[1]+(b[1]-a[1])*t-1.6,0.9,1); } } }
  // rachadura no papel machê: sulco escuro + borda clara de tinta lascada
  function crack(p,M,pts,w=1.2){ p.F(M.paint[0]); bandA(p,pts.map(q=>[q[0]+0.9,q[1]-0.9]),w*0.8); p.F(M.paper[3]); bandA(p,pts,w); }

  /* ---------------- carregador: pernas ---------------- */
  function drawLeg(p,M,hip,knee,ankle,fa,front){
    let ang=Math.atan2(knee.y-hip.y,knee.x-hip.x), L=Math.hypot(knee.x-hip.x,knee.y-hip.y);
    p.xw(ang,hip.x,hip.y); const J=M.jeans, R=M.skin;
    p.F(J[2]); p.cap(P2(0,0),P2(L,0),18,15); mass(p,J,L*0.45,-1,12,7.5,ang,0.7);
    // barra desfiada da bermuda
    p.F(J[0]); p.rect(L*0.78,-7.4,1.2,14.8); p.F(J[3]); [[-6,2],[-2,3],[2,2.4],[5,3.2]].forEach(([y,l])=>p.rect(L*0.84,y,l,1));
    p.F(R[2]); p.ell(L+1,0,7.6,7); mass(p,R,L+1,-1,6.4,5.6,ang,0.7);
    ang=Math.atan2(ankle.y-knee.y,ankle.x-knee.x); L=Math.hypot(ankle.x-knee.x,ankle.y-knee.y);
    p.xw(ang,knee.x,knee.y);
    p.F(R[2]); p.cap(P2(0,0),P2(L,0),12,9); mass(p,R,L*0.32,-1.4,9,4.4,ang,0.8); mass(p,R,L*0.7,0.6,6,3.4,ang,0.4);
    p.F(R[3]); p.cap(P2(L*0.2,3.6),P2(L*0.85,2.8),1,0.8); p.F(qOf(R)[0]); p.rect(L*0.25,-4.6,L*0.4,1);
    // atadura suja e ferida
    p.F(M.shirt[2]); p.poly([[L*0.42,-6],[L*0.58,-5.4],[L*0.6,5],[L*0.44,5.6]]); p.F(M.shirt[1]); p.poly([[L*0.44,-5.6],[L*0.56,-5],[L*0.57,1],[L*0.45,1.4]]);
    p.F(M.shirt[3]); p.rect(L*0.5,-5,1,10); p.F(M.blood[1]); p.ell(L*0.52,2,2,1.6);
    if(front){ p.F(M.blood[2]); p.ell(L*0.22,-2,2.4,1.6); p.F(M.fresh[1]); p.rect(L*0.2,-3,1.4,1); }
    p.F(R[3]); [[0.7,-3],[0.78,2]].forEach(([u,y])=>p.rect(L*u,y,1.2,1.2));
    // pé
    p.xw(rad(fa),ankle.x,ankle.y);
    if(front){ // chinelo de dedo
      const Sd=M.sandal;
      p.F(Sd[2]); p.poly([[-7,4],[17,4],[20,6],[19,8.6],[-8,8.6],[-9,6]]); p.F(Sd[0]); p.rect(-7,4,25,1.2); p.F(Sd[3]); p.rect(-8,7.6,27,1);
      p.F(R[2]); p.poly([[-6,-5],[4,-4],[13,-1],[17,1.4],[17,4],[-7,4]]); mass(p,R,4,-0.5,8,4,0,0.8);
      p.F(R[3]); [9,12,15].forEach(x=>p.rect(x,2,0.9,2));
      p.F(Sd[1]); p.cap(P2(12,1.4),P2(4,-3.6),1.6,1.6); p.cap(P2(12,1.4),P2(2,3),1.4,1.4);
    } else { // pé descalço podre
      p.F(R[2]); p.poly([[-6,-5],[4,-4],[13,-1],[18,2],[19,6.6],[-7,6.6],[-8,2]]); mass(p,R,4,0,9,4.6,0,0.6);
      p.F(R[3]); [10,13,16].forEach(x=>p.rect(x,4,0.9,2.6)); p.rect(-7,5.6,26,1);
      p.F(M.blood[2]); p.ell(1,3,2.4,1.4);
    }
  }

  /* ---------------- braços de pano ---------------- */
  function armPts(s,P,side){
    const a=P['a'+side], k=P['k'+side], w=P['w'+side], ls=P['ls'+side], off=side==='F'?0:1.3;
    const N=7, L=16*ls, pts=[{x:s.x,y:s.y}]; let q=pts[0];
    for(let j=0;j<N;j++){ const ang=a+k*(j+1)/N+w*S(P.ph*1.0-j*0.8+off)*(0.4+j/N); q=lp(q,ang,L); if(q.y>GROUND-11) q={x:q.x,y:GROUND-11}; pts.push(q); }
    return pts;
  }
  const armW=j=>24-j*1.15;
  function drawArm(p,M,pts,fur,P,front){
    p.w(); const R=M.coat, Q=qOf(R), N=pts.length-1;
    p.F(R[1]); for(let j=0;j<N;j++) p.cap(pts[j],pts[j+1],armW(j),armW(j+1));
    for(let j=0;j<N;j++){ const a=pts[j], b=pts[j+1], m=lerp(a,b,0.5), an=Math.atan2(b.y-a.y,b.x-a.x), L=Math.hypot(b.x-a.x,b.y-a.y)||1;
      mass(p,R,m.x,m.y,L/2+3.5,armW(j)/2-0.4,0,0.8,an); }
    // dobras do pano: rugas penduradas em cada junta
    for(let j=1;j<N;j++){ const a=pts[j-1], b=pts[j], c=pts[j+1]; const an=Math.atan2(c.y-a.y,c.x-a.x), nx=-S(an), ny=C(an), tx=C(an), ty=S(an), w=armW(j)/2;
      p.F(R[3]); p.cap(P2(b.x+nx*w*0.85-tx,b.y+ny*w*0.85-ty),P2(b.x-nx*w*0.3+tx*2,b.y-ny*w*0.3+ty*2),1.8,0.9);
      p.F(Q[2]); p.cap(P2(b.x+nx*w*0.6+tx*1.5,b.y+ny*w*0.6+ty*1.5),P2(b.x+tx*3.5,b.y+ty*3.5),1.4,0.8);
      p.F(R[0]); p.cap(P2(b.x-nx*w*0.75+tx*3,b.y-ny*w*0.75+ty*3),P2(b.x-nx*w*0.2+tx*4.5,b.y-ny*w*0.2+ty*4.5),1.2,0.8);
      if(j%2) { p.F(R[2]); p.rect(b.x+nx*w*0.2+tx*6,b.y+ny*w*0.2+ty*6,1.2,1.2); }
    }
    // costura longa do braço de pano
    p.F(R[3]); for(let j=0;j<N;j++){ const a=pts[j], b=pts[j+1], an=Math.atan2(b.y-a.y,b.x-a.x), nx=-S(an), ny=C(an), w=armW(j)/2-2.5;
      for(let k=0;k<3;k++){ const t=(k+0.3)/3, x=a.x+(b.x-a.x)*t+nx*w, y=a.y+(b.y-a.y)*t+ny*w; p.rect(x-0.5,y-0.5,1.4,1); } }
    // remendo e rasgos
    { const a=pts[2], b=pts[3], m=lerp(a,b,0.5), an=Math.atan2(b.y-a.y,b.x-a.x); p.xw(an,m.x,m.y);
      p.F(M.pano[2]); p.poly([[-5,-6],[5,-7],[6,4],[-4,5]]); p.F(M.pano[1]); p.poly([[-4,-5],[4,-6],[4.6,1],[-3.4,2]]);
      p.F(M.shirt[2]); [[-5,-6],[5,-7],[6,4],[-4,5]].forEach(([x,y])=>p.rect(x-0.5,y-0.5,1.2,1.2)); p.w(); }
    if(fur){ const a=pts[4], b=pts[5], m=lerp(a,b,0.5), an=Math.atan2(b.y-a.y,b.x-a.x); p.xw(an,m.x,m.y);
      p.F(M.mouth[3]); p.poly([[-6,-3],[0,-7],[6,-4],[4,3],[-2,5],[-7,2]]); p.F(M.paper[1]); p.ell(0,-1,3,2.4); p.F(M.paper[0]); p.rect(-1,-2.4,2,1.2); p.w(); }
    // punho de babado + luva
    const a=pts[N-1], b=pts[N]; let an=Math.atan2(b.y-a.y,b.x-a.x); if(b.y>GROUND-28 && S(an)>0.2){ const dx=b.x-pts[0].x; an=(Math.abs(C(an))>0.3?C(an)>0:dx>=0)?0.12:PI-0.12; }
    drawGlove(p,M,b,an,fur,P,front);
    // ombreira (encaixe do braço na armação)
    p.w(); p.F(R[2]); p.ell(pts[0].x,pts[0].y,12.5,11); p.F(R[1]); p.ell(pts[0].x+1.6,pts[0].y-1.6,9,7.4); p.F(R[0]); p.ell(pts[0].x+3.4,pts[0].y-4,4,2);
    p.F(M.gold[1]); p.circle(P2(pts[0].x+2,pts[0].y+2),2); p.F(M.gold[0]); p.rect(pts[0].x+1.4,pts[0].y+1,1,1);
  }
  function drawGlove(p,M,at,ang,fur,P,front){
    p.xw(ang,at.x,at.y); const G=M.glove, Sh=M.shirt;
    // babado do punho
    p.F(Sh[2]); for(let k=-2;k<=2;k++) p.ell(-1,k*4,4.4,3.2);
    p.F(Sh[1]); for(let k=-2;k<=2;k++) p.ell(-1.6,k*4-0.8,3.2,2.2);
    p.F(Sh[0]); for(let k=-2;k<=2;k++) p.rect(-3,k*4-2,2,1);
    // luva de pano recheada, dedos grossos moles
    p.F(G[2]); p.ell(8,0,9.4,8.6); mass(p,G,8,-0.6,8.6,7.8,ang,0.8);
    const fing=[[-7,-0.25,11],[-2.4,-0.05,12.5],[2.4,0.08,12],[6.6,0.25,10]];
    fing.forEach(([y,a,L],k)=>{ const e=P2(13+C(a)*L,y+S(a)*L); p.F(G[2]); p.cap(P2(12,y*0.8),e,5.4,4.8); p.F(G[1]); p.cap(P2(12,y*0.8-0.8),P2(e.x-0.6,e.y-0.8),3.4,2.8); p.F(G[3]); p.circle(P2(e.x+1.2,e.y+0.8),0.9);
      if(fur&&k===1){ p.F(M.paper[1]); p.ell(e.x+1,e.y,2.6,2.2); p.F(M.blood[1]); p.ell(e.x-1,e.y+1.4,1.6,1); } });
    p.F(G[2]); p.cap(P2(7,-7),P2(12,-13),5.6,4.6); p.F(G[1]); p.cap(P2(7,-7.6),P2(11.6,-12.8),3.4,2.6);
    // três costuras de luva
    p.F(G[2]); [-3.6,0,3.6].forEach(y=>p.cap(P2(3,y*0.8),P2(10,y),1,1));
    p.F(M.blood[2]); p.ell(16,3,2.4,1.6); p.F(M.blood[1]); p.ell(6,5,1.6,1.2);
  }

  /* ---------------- fraque: abas, saia de pano, paletó ---------------- */
  function drawTails(p,M,sk,P){
    p.id(); const {wd,wy}=sk.L, R=M.coat, sw=P.sway*1.4, hy=sk.hemY-6;
    const a=sk.T(-30*wd,wy+4), b=sk.T(-47*wd,wy-2), x0=b.x-6+sw;
    const tl=[[a.x,a.y],[b.x,b.y],[x0-8,hy-4],[x0-3,hy+2],[x0+2,hy-10],[x0+7,hy-2],[x0+12,hy-8],[a.x+4,a.y+20]];
    p.F(R[1]); p.poly(tl);
    clipPoly(tl,()=>{ platePoly(p,R,[[b.x-2,b.y],[x0-10,hy+4],[x0+2,hy+4],[b.x+8,b.y]],0,0.6); p.F(R[3]); bandA(p,[[b.x+6,b.y+4],[x0+2,hy-10]],1.6); p.F(R[0]); bandA(p,[[b.x+1,b.y+6],[x0-6,hy-6]],1); });
  }
  function hemPts(sk,P){
    const {wd,wy}=sk.L, wl=sk.T(-44*wd,wy+8), wr=sk.T(50*wd,wy+4), s=cl(P.sink,0,1.2), sw=P.sway;
    const xL=wl.x-10-16*s, xR=wr.x+12+18*s, N=12, off=[0,6,1,8,2,5,0,7,1,4,2,6,0], out=[];
    for(let j=0;j<=N;j++){ const t=j/N; out.push([lerp({x:xL,y:0},{x:xR,y:0},t).x+sw*(0.6+0.4*S(t*PI)), Math.min(GROUND-1,sk.hemY+off[j]*(1-0.5*s))]); }
    return {wl,wr,out};
  }
  function drawSkirt(p,M,sk,P,fur){
    p.id(); const R=M.pano, Q=qOf(R), {wl,wr,out}=hemPts(sk,P), {wd,wy}=sk.L;
    const top=[]; for(let k=0;k<=6;k++){ const q=sk.T(lerp({x:-44*wd,y:0},{x:50*wd,y:0},k/6).x, wy+8-Math.sin(k/6*PI)*3); top.push([q.x,q.y]); }
    const sk0=[...top,...out.slice().reverse()];
    p.F(R[1]); p.poly(sk0);
    clipPoly(sk0,()=>{
      const cx=(wl.x+wr.x)/2, cy=(wl.y+sk.hemY)/2, rx=(wr.x-wl.x)/2+20, ry=(sk.hemY-wl.y)/2+8;
      mass(p,R,cx+4,cy,rx,ry,0,0.9);
      // painéis de pano pendurados (pregas)
      for(let k=0;k<6;k++){ const t0=k/6, t1=(k+1)/6, a0=lerp({x:top[0][0],y:top[0][1]},{x:top[6][0],y:top[6][1]},t0), a1=lerp({x:top[0][0],y:top[0][1]},{x:top[6][0],y:top[6][1]},t1);
        const h0=out[Math.round(t0*12)], h1=out[Math.round(t1*12)];
        if(k%2===0) platePoly(p,R,[[a0.x,a0.y],[a1.x,a1.y],[h1[0],h1[1]+8],[h0[0],h0[1]+8]],0,0.7);
        p.F(R[3]); band(p,[P2(a1.x,a1.y),P2((a1.x+h1[0])/2+P.sway*0.3,(a1.y+h1[1])/2),P2(h1[0],h1[1])],1.6);
        p.F(Q[0]); band(p,[P2(a1.x+2.4,a1.y+4),P2((a1.x+h1[0])/2+P.sway*0.3+2.6,(a1.y+h1[1])/2)],1.1); }
      // listras desbotadas do pano
      p.F(Q[1]); for(let k=1;k<12;k+=2){ const t=k/12, a=lerp({x:top[0][0],y:top[0][1]},{x:top[6][0],y:top[6][1]},t), h=out[k]; band(p,[P2(a.x,a.y+6),P2(h[0],h[1]-2)],1); }
      // remendo, manchas
      const m=sk.T(-24*wd,wy+30); p.F(R[3]); p.poly([[m.x-7,m.y-6],[m.x+6,m.y-7],[m.x+7,m.y+6],[m.x-6,m.y+7]]); p.F(M.coat[2]); p.poly([[m.x-6,m.y-5],[m.x+5,m.y-6],[m.x+6,m.y+5],[m.x-5,m.y+6]]);
      p.F(M.shirt[2]); [[-6,-5],[5,-6],[6,5],[-5,6],[0,-6],[0,6]].forEach(([x,y])=>p.rect(m.x+x-0.5,m.y+y-0.5,1.2,1.2));
      stain(p,M,sk.T(34*wd,wy+26).x,sk.T(34*wd,wy+26).y,5,3,3); stain(p,M,sk.T(-6*wd,wy+40).x,sk.T(-6*wd,wy+40).y,4,2,4);
      // bainha escura e sombra embaixo
      p.F(R[3]); band(p,out.map(q=>P2(q[0],q[1]-1.6)),2.4); p.F(Q[3]); band(p,out.map(q=>P2(q[0],q[1]-0.4)),1.2);
      // fiapos/franjas rasgadas
      p.F(R[2]); out.forEach((q,j)=>{ if(j%2) p.rect(q[0]-0.6,q[1]-6,1.2,6); });
      if(fur){ p.F(M.mouth[3]); [[0.3,0.2],[0.72,0.1]].forEach(([u,v])=>{ const q=out[Math.round(u*12)]; p.poly([[q[0]-5,q[1]-2],[q[0],q[1]-12-v*20],[q[0]+5,q[1]-3]]); }); }
    });
    // janela de tela: o carregador espia por dentro
    const wn=sk.T(14*wd,-40*(1-0.5*cl(P.sink,0,1))); p.xf(sk.a,wn.x,wn.y);
    if(P.sink<0.6){
      p.F(R[3]); p.poly([[-11,-7],[11,-8],[12,7],[-10,8]]); p.F(M.hat[3]); p.poly([[-9,-5.6],[10,-6.4],[10.6,5.6],[-8.6,6.4]]);
      p.F(M.hat[1]); for(let x=-8;x<10;x+=3) p.rect(x,-5.6,0.8,11.6); for(let y=-5;y<6;y+=3) p.rect(-8.6,y,19,0.8);
      if(P.dead<0.5){ p.F(M.eye[2]); p.ell(-2,0,1.8,1.4); p.ell(4.6,-0.4,1.8,1.4); p.F(M.eye[0]); p.rect(-2.4,-0.6,1,1); p.rect(4.2,-1,1,1); }
      p.F(R[0]); p.rect(-10,-8,21,1);
    }
  }
  function drawJacket(p,M,sk,P,fur){
    const {wd,wy,sy,ny}=sk.L, H=wy-sy, Ys=t=>sy+H*t, X=x=>x*wd, A=sk.a, R=M.coat, Q=qOf(R);
    p.xf(A,sk.hip.x,sk.hip.y);
    const jk=[[X(-43),wy+10],[X(-47),Ys(0.6)],[X(-46),Ys(0.18)],[X(-38),sy+1],[X(-22),sy-5],[-8,ny+1],[26,ny+2],[X(38),sy-3],[X(48),sy+5],[X(53),Ys(0.25)],[X(54),Ys(0.8)],[X(50),wy+3],[X(36),wy+9],[X(10),wy+13]];
    p.F(R[1]); p.poly(jk);
    clipPoly(jk,()=>{
      mass(p,R,X(12),Ys(0.5),X(46),H*0.5+16,A,1);
      platePoly(p,R,[[X(-50),sy-6],[X(-24),sy-6],[X(-18),Ys(0.5)],[X(-22),wy+14],[X(-50),wy+14]],A,0.15);
      mass(p,R,X(-30),sy+7,17,10,A,0.7); mass(p,R,X(40),sy+8,15,10,A,1);
      platePoly(p,R,[[X(32),Ys(0.32)],[X(54),Ys(0.25)],[X(56),Ys(0.92)],[X(38),wy+10]],A,0.9);
      // rugas de tensão do pano sobre a armação
      [[[X(-30),Ys(0.25)],[X(-23),Ys(0.5)],[X(-25),Ys(0.82)]],[[X(-8),Ys(0.35)],[X(-3),Ys(0.62)],[X(2),Ys(0.95)]],[[X(42),Ys(0.4)],[X(46),Ys(0.62)],[X(44),Ys(0.86)]],[[X(-38),Ys(0.08)],[X(-24),Ys(0.18)]]].forEach(f=>{
        p.F(R[0]); bandA(p,f.map(q=>[q[0]+1.6,q[1]-1]),1.1); p.F(R[3]); bandA(p,f,1.7); });
      // bolso com aba
      p.F(R[3]); p.poly([[X(-36),Ys(0.76)],[X(-14),Ys(0.73)],[X(-13),Ys(0.84)],[X(-35),Ys(0.87)]]); p.F(Q[1]); p.poly([[X(-35),Ys(0.75)],[X(-15),Ys(0.72)],[X(-15),Ys(0.78)],[X(-35),Ys(0.81)]]);
      p.F(R[0]); p.rect(X(-35),Ys(0.75)-1,X(20),1);
      // costura lateral e da cava
      seam(p,R,[[X(-20),sy-2],[X(-16),Ys(0.4)],[X(-18),wy+10]],4);
      // poeira e mofo na lapela traseira
      p.F(Q[2]); [[X(-32),Ys(0.45)],[X(-10),Ys(0.2)],[X(-40),Ys(0.66)]].forEach(([x,y])=>p.ell(x,y,3,2));
      if(fur){ [[X(-20),Ys(0.42),6,5],[X(44),Ys(0.72),5,6]].forEach(([x,y,rx,ry])=>{ p.F(R[3]); p.ell(x,y,rx+1.4,ry+1.4); p.F(M.mouth[3]); p.ell(x,y,rx,ry); p.F(M.paper[1]); p.ell(x-1,y+1,rx*0.5,ry*0.45); p.F(M.paper[0]); p.rect(x-2,y,2,1); p.F(M.wood[1]); p.rect(x-rx,y-1,rx*2,1.6); }); }
    });
    if(BACK){ // costas do fraque: costura central e botões da cintura
      p.F(R[3]); bandA(p,[[X(4),sy-2],[X(6),Ys(0.5)],[X(4),wy+12]],1.6); p.F(R[0]); bandA(p,[[X(6),sy],[X(8),Ys(0.5)]],0.9);
      p.F(M.gold[2]); [X(-6),X(16)].forEach(x=>p.circle(P2(x,wy+6),2.4)); p.F(M.gold[0]); [X(-6),X(16)].forEach(x=>p.rect(x-0.4,wy+4.6,1,1));
      p.F(M.shirt[2]); p.poly([[-8,ny+1],[26,ny+2],[22,ny+6],[-4,ny+6]]); p.F(M.shirt[1]); p.rect(-6,ny+2,28,2);
      return;
    }
    const cx=24, Sh=M.shirt, Lp=M.lapel;
    // colete roxo (embaixo do V)
    const vest=[[12,Ys(0.42)],[cx,Ys(0.58)],[34,Ys(0.42)],[37,wy+5],[cx,wy+10],[10,wy+5]];
    platePoly(p,Lp,vest,A,0.7); p.F(Lp[3]); bandA(p,[[cx,Ys(0.6)],[cx+1,wy+9]],1.2);
    p.F(M.gold[1]); [0.68,0.8,0.92].forEach(t=>p.circle(P2(cx+3,Ys(t)),1.7)); p.F(M.gold[0]); [0.68,0.8,0.92].forEach(t=>p.rect(cx+2.4,Ys(t)-1.2,1,1));
    // camisa de babado
    const sh=[[13,ny+3],[35,ny+3],[34,Ys(0.45)],[cx,Ys(0.6)],[13,Ys(0.45)]];
    platePoly(p,Sh,sh,A,1);
    const n=6; for(let j=0;j<n;j++){ const y=ny+7+j*(Ys(0.48)-ny-8)/n, wv=j%2?1:-1;
      p.F(Sh[2]); p.ell(cx-6+wv,y+1.6,5.4,3.2); p.ell(cx+6+wv,y+1.6,5,3);
      p.F(Sh[1]); p.ell(cx-6.4+wv,y+0.6,4.4,2.4); p.ell(cx+5.6+wv,y+0.6,4,2.2);
      p.F(Sh[0]); p.rect(cx-9+wv,y-0.6,4,1); p.rect(cx+4+wv,y-0.6,3,1); }
    // gravata listrada
    const tie=[[cx-3.4,ny+7],[cx+3.4,ny+7],[cx+5,Ys(0.5)],[cx,Ys(0.6)],[cx-4.6,Ys(0.5)]];
    platePoly(p,M.tie,tie,A,1);
    p.F(M.tie[0]); for(let k=0;k<4;k++){ const y=ny+12+k*(Ys(0.5)-ny-12)/4; p.cap(P2(cx-3.6,y+2.4),P2(cx+3.8,y-0.4),1.2,1.2); }
    p.F(M.tie[2]); p.ell(cx,ny+6,4.6,3.4); p.F(M.tie[1]); p.ell(cx+0.6,ny+5.4,3.4,2.4); p.F(M.tie[0]); p.rect(cx+0.6,ny+4,1.6,1);
    stain(p,M,cx+1,Ys(0.3),2.6,2,6);
    // lapelas pontudas roxas
    const lL=[[1,ny+4],[13,ny+2],[16,Ys(0.45)],[11,Ys(0.6)],[5,Ys(0.32)],[-4,Ys(0.16)],[1,Ys(0.07)]];
    const lR=[[34,ny+2],[42,ny],[50,Ys(0.1)],[44,Ys(0.18)],[48,Ys(0.27)],[35,Ys(0.62)],[32,Ys(0.45)]];
    platePoly(p,Lp,lL,A,0.4); platePoly(p,Lp,lR,A,1);
    p.F(Lp[0]); bandA(p,[[34,ny+3],[41,ny+1.4],[48.4,Ys(0.1)]],1); p.F(Lp[3]); bandA(p,[[44,Ys(0.18)],[47,Ys(0.27)],[35,Ys(0.6)]],1.2); bandA(p,[[13,ny+2],[15.4,Ys(0.45)]],1.1);
    p.F(Lp[2]); bandA(p,[[-3,Ys(0.16)],[1,Ys(0.08)]],1.4);
    // flor murcha na lapela
    const fx=44, fy=Ys(0.2)+2; p.F(M.tie[2]); [[0,-3],[3,0],[0,3],[-3,0]].forEach(([dx,dy])=>p.ell(fx+dx,fy+dy,2.6,2.2)); p.F(M.tie[1]); p.ell(fx+0.6,fy-0.6,2.2,2); p.F(M.gold[1]); p.rect(fx-0.6,fy-0.6,1.4,1.4); p.F(M.coat[2]); p.cap(P2(fx-1,fy+3),P2(fx-4,fy+9),1.2,1);
    // botões de latão e casas
    p.F(R[3]); [0.62,0.8].forEach(t=>p.rect(X(46),Ys(t)-0.6,4,1.2));
    p.F(M.gold[2]); [0.62,0.8].forEach(t=>p.circle(P2(X(42),Ys(t)),2.6)); p.F(M.gold[1]); [0.62,0.8].forEach(t=>p.circle(P2(X(42)+0.4,Ys(t)-0.4),1.7)); p.F(M.gold[0]); [0.62,0.8].forEach(t=>p.rect(X(42)+0.4,Ys(t)-1.4,1,1));
    // gola alta da camisa
    p.F(Sh[2]); p.poly([[8,ny+4],[12,ny-4],[24,ny+1],[36,ny-4],[38,ny+4],[24,ny+7]]); p.F(Sh[1]); p.poly([[10,ny+2],[13,ny-2],[22,ny+2],[13,ny+3]]); p.poly([[26,ny+2],[35,ny-2],[36,ny+2]]); p.F(Sh[0]); p.rect(13,ny-2,3,1);
  }
  // relógio de bolso gigante (corrente + caixa); mostrador é outra camada sem sombreamento
  function watchAt(sk){ const {wd,wy,sy}=sk.L; return sk.T(26*wd, wy-8+ (wy-sy)*0.0); }
  const RW=14;
  function drawWatch(p,M,sk,P){
    const {wd,wy,sy}=sk.L, H=wy-sy, c=watchAt(sk), A=sk.a, G=M.gold;
    // corrente da casa da lapela até a alça
    p.id(); const an=sk.T(38*wd,sy+H*0.4); const top={x:c.x,y:c.y-RW-6};
    const ch=[]; for(let k=0;k<=6;k++){ const t=k/6, u=1-t; ch.push({x:u*u*an.x+2*u*t*(an.x+4)+t*t*top.x, y:u*u*an.y+2*u*t*(top.y+4)+t*t*top.y}); }
    for(let k=0;k<ch.length-1;k++){ const q=lerp(ch[k],ch[k+1],0.5); p.F(k%2?G[2]:G[1]); p.ell(q.x,q.y,2.2,1.4,Math.atan2(ch[k+1].y-ch[k].y,ch[k+1].x-ch[k].x)); }
    p.xf(0,c.x,c.y);
    p.F(G[2]); p.ell(0,-RW-5,4.4,4.4); p.F(M.coat[2]); p.ell(0,-RW-5,2,2); p.F(G[1]); p.rect(-2.4,-RW-3,4.8,4); p.F(G[0]); p.rect(-2,-RW-2.6,1.4,1);
    p.F(G[3]); p.ell(0,0,RW+2.4,RW+2.4); mass(p,G,0,0,RW+1.6,RW+1.6,0,1);
    p.F(G[0]); for(let k=0;k<5;k++){ const t=rad(-70+k*14); p.rect(C(t)*(RW+0.6)-0.5,S(t)*(RW+0.6)-0.5,1.4,1.4); }
    p.F(G[3]); for(let k=0;k<6;k++){ const t=rad(110+k*14); p.rect(C(t)*(RW+0.8)-0.5,S(t)*(RW+0.8)-0.5,1.4,1.4); }
  }
  function drawDial(p,M,sk,P,fur){
    const c=watchAt(sk), D=M.dial, gl=1-P.dead; p.xf(0,c.x,c.y);
    p.F(gl>0.3?D[2]:M.paper[2]); p.ell(0,0,RW-1,RW-1); p.F(gl>0.3?D[1]:M.paper[1]); p.ell(0.6,-0.6,RW-2.6,RW-2.6);
    if(gl>0.3){ p.F(D[0]); p.ell(1.6,-1.6,RW-7,RW-7); }
    p.F(M.hair[3]); for(let k=0;k<12;k++){ const t=k/12*PI*2, r=RW-4, big=k%3===0; p.rect(S(t)*r-(big?1:0.5),-C(t)*r-(big?1.5:0.5),big?2:1,big?3:1); }
    // ponteiros parados na meia-noite (ambos no XII); na fúria o minuto treme
    const wob=fur?rad(6*S(P.t*2.7)):0;
    p.F(M.hair[3]); p.cap(P2(0,0),P2(0,-RW+6),3,1.6); p.cap(P2(0,0),P2(S(wob)*(RW-3),-C(wob)*(RW-3)),1.8,1); p.circle(P2(0,0),1.8);
    p.F(D[3]); p.rect(-0.5,-0.5,1,1);
    // vidro rachado
    p.F(gl>0.3?D[3]:M.paper[3]); bandA(p,[[-RW+3,-2],[-4,1],[2,6],[6,RW-4]],0.8);
    if(P.ring>0.6 && gl>0.3){ p.F(D[0]); p.ell(-4,-5,3,2); }
  }

  /* ---------------- cabeça de papel machê ---------------- */
  function drawHatShape(p,M,P,fur,ang){
    const R=M.hat, Q=qOf(R);
    p.F(R[2]); p.ell(0,0,31,6.4);  // aba
    const cr=[[-20,-1],[-22,-14],[-24,-30],[-19,-36],[-8,-33],[-2,-38],[10,-36],[18,-38],[23,-30],[21,-14],[20,-1]];
    p.F(R[1]); p.poly(cr);
    clipPoly(cr,()=>{ mass(p,R,2,-18,22,24,ang,0.9);
      p.F(R[3]); bandA(p,[[-8,-33],[-6,-22],[-10,-10]],1.6); bandA(p,[[10,-35],[8,-26]],1.4);
      p.F(R[0]); bandA(p,[[-6,-32],[-4,-23]],1); bandA(p,[[15,-34],[17,-14]],1.2);
      // fita
      p.F(M.lapel[2]); p.poly([[-24,-12],[24,-12],[24,-3],[-24,-3]]); p.F(M.lapel[1]); p.poly([[-24,-11],[24,-11],[24,-8],[-24,-8]]); p.F(M.lapel[0]); p.rect(6,-11,12,1);
      p.F(M.lapel[3]); p.rect(-24,-4.4,48,1.4);
      // amassado no topo e furo
      p.F(Q[2]); p.poly([[-2,-38],[6,-30],[10,-36]]);
      if(fur){ p.F(M.mouth[3]); p.poly([[2,-36],[10,-35],[12,-28],[4,-27]]); p.F(R[0]); p.rect(3,-36,7,1); }
    });
    // pena de carnaval quebrada
    p.F(M.tie[2]); p.cap(P2(-18,-8),P2(-30,-30),3,1.4); p.F(M.tie[1]); p.cap(P2(-19,-10),P2(-28,-28),1.6,0.8);
    // aba da frente
    p.F(R[1]); p.poly([[-31,0],[-26,3.6],[0,6.4],[26,3.6],[31,0],[20,1.6],[0,2.6],[-20,1.6]]); p.F(R[0]); p.rect(6,3.6,16,1); p.F(R[3]); p.rect(-28,2,14,1);
  }
  function drawHead(p,M,sk,P,fur,det){
    let ang;
    if(det){ const c={x:AX+P.hdX,y:GROUND-P.hdY}; ang=rad(P.roll); const o={x:c.x-(8*C(ang)+32*S(ang))*HS, y:c.y-(8*S(ang)-32*C(ang))*HS}; p.xw(ang,o.x,o.y); }
    else { ang=sk.ha; p.xf(ang,sk.neck.x,sk.neck.y); }
    CTX.scale(HS,HS);
    const R=M.paint, Q=qOf(R), Pp=M.paper, Hh=M.hair, crk=fur||P.crack>0.5, glow=1-P.dead;
    // pescoço de pano (sumido na gola)
    if(!det){ p.F(M.coat[2]); p.ell(8,2,14,7); }
    // volume da cabeça: crânio + queixo + nariz
    p.F(R[1]); p.ell(8,-32,29,30); if(!BACK){ p.ell(22,-10,16,10); }
    mass(p,R,8,-32,29,30,ang,1);
    if(!BACK){ mass(p,R,22,-9,15,9,ang,0.7); }
    // cabelo pintado (nuca/costeleta)
    const hr=BACK?[[-21,-38],[-14,-54],[0,-60],[16,-58],[30,-46],[34,-30],[28,-14],[10,-6],[-12,-10],[-20,-22]]:[[-21,-38],[-14,-54],[-2,-60],[-8,-48],[-10,-36],[-6,-22],[-12,-10],[-20,-22]];
    platePoly(p,Hh,hr,ang,0.6);
    p.F(Hh[0]); bandA(p,BACK?[[-4,-54],[8,-50],[18,-42]]:[[-14,-46],[-12,-36]],1);
    // orelha
    const ex=BACK?28:-4;
    p.F(R[2]); p.ell(ex,-28,6,8.4); p.F(R[1]); p.ell(ex+1,-29,4.4,6.4); p.F(R[3]); p.ell(ex+1.4,-28,1.8,3.4);
    // tinta lascada (papel exposto) e rachaduras
    const flakes=BACK?[[[2,-44],[12,-46],[14,-38],[6,-36]],[[-10,-26],[-2,-28],[-2,-20]]]:[[[0,-46],[10,-50],[12,-44],[4,-40]],[[30,-52],[38,-48],[34,-44]],[[6,-16],[12,-18],[12,-12],[7,-11]]];
    flakes.forEach(f=>{ p.F(Pp[1]); p.poly(f); p.F(Pp[2]); p.poly(f.map(([x,y])=>[x+0.8,y+0.8]).slice(0,3)); p.F(R[3]); bandA(p,[f[f.length-1],f[0]],0.9); });
    crack(p,M,[[-4,-62],[0,-52],[-3,-46],[2,-38],[0,-30]],1.3); crack(p,M,[[0,-52],[8,-56],[14,-60]],1);
    if(!BACK){ crack(p,M,[[14,-14],[18,-22],[16,-30]],1); }
    if(crk){ crack(p,M,[[0,-30],[6,-24],[4,-14],[8,-6]],1.4); crack(p,M,[[-4,-46],[-14,-44],[-20,-34]],1.2); }
    if(fur){ // racha mostra a armação de madeira por dentro
      const hole=[[-18,-40],[-13,-54],[-2,-58],[6,-48],[2,-38],[-8,-31]];
      p.F(M.mouth[3]); p.poly(hole);
      clipPoly(hole,()=>{ p.F(M.wood[2]); band(p,[P2(-20,-50),P2(8,-38)],4); band(p,[P2(-12,-30),P2(-4,-60)],3.6); p.F(M.wood[0]); band(p,[P2(-20,-51.4),P2(8,-39.4)],1); band(p,[P2(-13.4,-31),P2(-5.4,-61)],0.9);
        p.F(M.wood[3]); p.rect(-8,-45,3,3); p.F(M.eye[2]); p.ell(-12,-36,2.4,1.6); p.ell(0,-52,1.6,1.2); });
      p.F(Pp[0]); bandA(p,hole.concat([hole[0]]),1.2); p.F(Pp[2]); hole.forEach(([x,y],k)=>{ if(k%2) p.poly([[x,y],[x+3,y+1],[x+1,y+4]]); });
    }
    if(!BACK){
      // sobrancelhas pintadas, grossas
      p.F(Hh[2]); p.poly([[12,-46],[18,-50],[28,-50],[31,-46],[26,-47],[18,-46]]); p.poly([[33,-47],[37,-49],[40,-46],[37,-46]]);
      p.F(Hh[0]); p.rect(18,-50,6,1);
      // olhos pintados (olhar fixo) com brilho de zumbi
      p.F(Pp[3]); p.ell(22,-36,7.6,8.6); p.F(M.glove[1]); p.ell(22.4,-36.4,6.4,7.4); p.F(M.glove[0]); p.ell(23,-38,3.6,3.4);
      p.F(Pp[3]); p.ell(37,-36,3.6,7.6); p.F(M.glove[1]); p.ell(37.4,-36.4,2.6,6.4);
      p.F(Hh[2]); p.ell(25.4,-35,3.6,4.4); p.ell(38.4,-35,1.8,4);
      if(glow>0.3){ const big=fur||P.roar>0.5;
        p.F(M.eye[2]); p.ell(25.6,-35.2,2.6,3.2); p.ell(38.6,-35.2,1.2,2.8); p.F(M.eye[1]); p.ell(25.8,-35.6,1.6,2); p.F(M.eye[0]); p.rect(25.4,-37,1.4,1.4);
        if(big){ p.F(M.eye[2]); p.rect(12,-36,8,1.2); p.rect(14,-34,5,1); } }
      if(crk){ p.F(Pp[3]); bandA(p,[[18,-44],[22,-38],[19,-30]],1); }
      // bochechas pintadas desbotadas
      p.F(M.tie[0]); p.ell(15,-22,5,3.4); p.F(Q[0]); p.rect(14,-23,2,1);
      // narigão
      mass(p,R,37,-24,8.4,7.4,ang,1); p.F(R[3]); p.ell(38,-19,2.4,1.4); p.F(R[0]); p.ell(40,-27,2,1.6);
      // boca: sorriso pintado rachado que virou bocarra
      const open=P.roar>0.5?7:0;
      const mo=[[13,-12],[22,-11],[32,-12],[42,-14],[40,-6+open*0.4],[32,-2+open],[22,-2+open],[16,-6+open*0.4]];
      p.F(M.tie[2]); bandA(p,[[10,-15],[13,-12],[22,-11],[32,-12],[42,-14],[45,-17]],2.6);
      p.F(M.mouth[2]); p.poly(mo); p.F(M.mouth[3]); p.poly(mo.map(([x,y])=>[x+1,y+2]).slice(2,7));
      p.F(M.teeth[1]); [15,19,23,27,31,35,38.6].forEach((x,k)=>p.poly([[x,-11.6-(k===3?0.4:0)],[x+3.2,-11.8],[x+1.6,-7-(k%2)*1.6]]));
      p.F(M.gold[1]); p.poly([[27,-11.8],[30.2,-12],[28.6,-7.4]]); p.F(M.gold[0]); p.rect(27.6,-11.6,1,1);
      p.F(M.teeth[2]); [18,24,30,36].forEach((x,k)=>p.poly([[x,-2.6+open],[x+3,-2.8+open],[x+1.6,-6+open-(k%2)]]));
      p.F(M.teeth[0]); [15,23,31].forEach(x=>p.rect(x+0.6,-11.4,1,1));
      // queixo
      p.F(Q[2]); p.cap(P2(18,-1+open),P2(34,-1+open),1.4,1.4);
      // bigodão pintado com pontas enroladas
      const ms=[[18,-17],[28,-20],[37,-18],[45,-20],[50,-27],[52,-21],[47,-15],[38,-13],[29,-15],[20,-12],[12,-14],[9,-21],[13,-17]];
      platePoly(p,Hh,ms,ang,0.8); p.F(Hh[0]); bandA(p,[[22,-17],[30,-18],[38,-16]],1); p.F(Hh[3]); bandA(p,[[20,-13],[29,-14.4],[38,-12.6]],1);
      // baba e sangue no queixo
      p.F(M.blood[2]); p.poly([[22,-2+open],[27,-2+open],[26,4+open],[24.6,2+open],[23.6,8+open],[22.6,2+open]]); p.F(M.blood[1]); p.rect(23.4,-1+open,1.2,6);
    }
    // cartola amassada
    if(!P.hatOff){ CTX.save(); CTX.translate(2,-56); CTX.rotate(rad(-12+P.hatT)); CTX.scale(0.82,0.82); drawHatShape(p,M,P,fur,ang+rad(-12+P.hatT)); CTX.restore(); }
  }
  function drawLooseHat(p,M,P,fur){ const c={x:AX+P.htX,y:GROUND-P.htY}, a=rad(P.htR); p.xw(a,c.x,c.y); CTX.scale(HS*0.82,HS*0.82); CTX.translate(0,2); drawHatShape(p,M,P,fur,a); }

  /* ---------------- carregador fugindo (morte) ---------------- */
  function drawCarrier(p,M,P){
    const x=AX+P.run, cr=P.crawl, t=P.t, R=M.skin, J=M.jeans;
    p.xw(0,x,GROUND); CTX.scale(-1,1); // corre pra esquerda
    const ph=t*1.9, hipY=-(48-14*cr), lean=rad(20+50*cr);
    const hip=P2(0,hipY), T=(lx,ly)=>P2(hip.x+lx*C(lean)-ly*S(lean), hip.y+lx*S(lean)+ly*C(lean));
    const leg=(a1,a2,front)=>{ const k=lp(hip,a1,24), an=lp(k,a2,23); p.F(front?R[1]:R[2]); p.cap(hip,k,11,9); p.cap(k,an,9,7); p.F(J[front?1:2]); p.cap(hip,lerp(hip,k,0.6),13,11);
      p.F(front?R[2]:R[3]); p.poly([[an.x-4,an.y-2],[an.x+10,an.y-1],[an.x+11,an.y+4],[an.x-5,an.y+4]]); };
    leg(cr?60:-30+40*S(ph),cr?-40:-60+30*S(ph),false);
    // armação de madeira ainda nas costas
    const s1=T(-4,-38), s2=T(4,-40); p.F(M.wood[2]); p.cap(s1,P2(s1.x-10,s1.y-30),3.4,3); p.cap(s2,P2(s2.x-4,s2.y-32),3.4,3); p.F(M.wood[1]); p.cap(P2(s1.x-9,s1.y-24),P2(s2.x-3,s2.y-26),3,3);
    p.F(M.wood[0]); p.rect(s2.x-5,s2.y-30,1,20);
    // tronco com regata rasgada
    p.F(R[2]); p.cap(hip,T(0,-40),20,18); mass(p,R,T(0,-22).x,T(0,-22).y,10,18,lean,0.8,lean);
    p.F(M.shirt[2]); p.poly([[T(-9,-34).x,T(-9,-34).y],[T(9,-36).x,T(9,-36).y],[T(10,-4).x,T(10,-4).y],[T(-10,-2).x,T(-10,-2).y]]);
    p.F(M.shirt[1]); p.poly([[T(-3,-33).x,T(-3,-33).y],[T(9,-35).x,T(9,-35).y],[T(9,-8).x,T(9,-8).y],[T(-2,-6).x,T(-2,-6).y]]);
    stain(p,M,T(4,-20).x,T(4,-20).y,4,2,9);
    leg(cr?30:-30+40*S(ph+PI),cr?-60:-60+30*S(ph+PI),true);
    // cabeça careca com boca aberta
    const h=T(4,-50); mass(p,R,h.x,h.y,9,9.4,0,1); p.F(M.mouth[2]); p.ell(h.x+6,h.y+4,3,2.4); p.F(M.eye[1]); p.ell(h.x+5,h.y-2,1.6,1.4); p.F(R[3]); p.rect(h.x-6,h.y-1,3,1);
    // braços balançando
    const sh=T(2,-36), e=lp(sh,cr?40:60+40*S(ph+PI),16), w=lp(e,cr?10:120+30*S(ph+PI),15);
    p.F(R[1]); p.cap(sh,e,8,7); p.cap(e,w,7,6); p.F(R[2]); p.circle(w,3.6);
  }

  /* ---------------- FX ---------------- */
  function drawFlames(p,M,list,t,amp){
    p.w(); const L2=[]; list.forEach(([x,y,s],k)=>{ L2.push([x-s*5.4,y+1,s*0.5,k+7]); L2.push([x,y,s,k]); });
    L2.forEach(([x,y,s,k])=>{ s*=amp; if(s<0.15) return; const h=s*(19+7*S(t*2.3+k*1.7)), w=s*5.2, lean=3*S(t*1.9+k*2.1), ph=t*2.6+k;
      const shape=sc=>{ const L=[], R=[], n=7; for(let j=0;j<=n;j++){ const u=j/n, half=w*sc*Math.pow(1-u,0.7)*(1+0.25*S(u*PI*3+ph)), cx=x+lean*sc*u*u+1.6*sc*S(u*PI*2.2+ph)*u;
          const yy=y+w*0.4*sc-(h*sc+w*0.4*sc)*u; L.push([cx-half,yy]); R.push([cx+half*0.9,yy]); }
        return L.concat(R.reverse()); };
      p.F(M.flame[3]); p.poly(shape(1)); p.F(M.flame[2]); p.poly(shape(0.72)); p.F(M.flame[1]); p.poly(shape(0.46)); p.F(M.flame[0]); p.poly(shape(0.22));
      p.F(M.flame[2]); p.rect(x+lean*1.3-1,y-h*1.22,2,2); p.F(M.flame[1]); p.rect(x-lean-w*0.5,y-h*0.9,1.4,1.4); });
  }
  function drawRings(p,M,c,ring,P){
    p.w(); const D=M.dial, k=Math.min(1.6,ring);
    if(ring>=1){ [RW+10,RW+26,RW+46].forEach((r,j)=>{ const rr=r*(0.7+0.3*k); p.F(j===1?D[1]:D[2]); band(p,Array.from({length:25},(_,i)=>{ const a=i/24*PI*2; return P2(c.x+C(a)*rr,c.y+S(a)*rr); }),j===0?3:2);
        p.F(D[0]); band(p,Array.from({length:9},(_,i)=>{ const a=rad(-80+i*10); return P2(c.x+C(a)*rr,c.y+S(a)*rr); }),1); });
      p.F(D[0]); for(let j=0;j<10;j++){ const a=j/10*PI*2+0.3; p.cap(P2(c.x+C(a)*(RW+4),c.y+S(a)*(RW+4)),P2(c.x+C(a)*(RW+14+6*k),c.y+S(a)*(RW+14+6*k)),2,0.6); }
      // onda de choque no chão, saindo pra frente
      const gx=c.x+34, gy=GROUND-2; p.F(D[3]); band(p,Array.from({length:13},(_,i)=>{ const a=rad(180+i*15); return P2(gx+C(a)*60*k,gy+S(a)*7); }),3);
      p.F(D[1]); band(p,Array.from({length:13},(_,i)=>{ const a=rad(190+i*13.3); return P2(gx+C(a)*56*k,gy+S(a)*5); }),1.4);
    } else if(ring>0.2){ p.F(D[2]); band(p,Array.from({length:21},(_,i)=>{ const a=i/20*PI*2; return P2(c.x+C(a)*(RW+5),c.y+S(a)*(RW+5)); }),1.6*ring+0.6);
      p.F(D[1]); [0,1,2,3].forEach(j=>{ const a=rad(-60+j*40); p.cap(P2(c.x+C(a)*(RW+7),c.y+S(a)*(RW+7)),P2(c.x+C(a)*(RW+11),c.y+S(a)*(RW+11)),1.4,0.6); }); }
  }
  function drawImpact(p,M,x){
    p.w(); const g=GROUND;
    p.F(M.dust[2]); [[-70,-6,20,8],[64,-7,22,9],[-34,-12,16,10],[30,-14,16,10],[0,-5,40,8]].forEach(([dx,dy,rx,ry])=>p.ell(x+dx,g+dy,rx,ry));
    p.F(M.dust[1]); [[-66,-9,14,6],[60,-10,15,6],[-30,-16,11,7],[26,-18,11,7],[0,-8,30,6]].forEach(([dx,dy,rx,ry])=>p.ell(x+dx,g+dy,rx,ry));
    p.F(M.dust[0]); [[-62,-13,7,3],[56,-14,8,3],[-26,-21,6,3],[22,-23,6,3]].forEach(([dx,dy,rx,ry])=>p.ell(x+dx,g+dy,rx,ry));
    p.F(M.dust[3]); [[-90,-30],[84,-34],[-50,-44],[46,-40],[96,-16],[-100,-14],[0,-36]].forEach(([dx,dy],k)=>{ const s=2+(k%3); p.poly([[x+dx-s,g+dy],[x+dx,g+dy-s],[x+dx+s,g+dy+s*0.4],[x+dx,g+dy+s]]); });
    p.F(M.fx[1]); [[-80,-4,-112,-2],[80,-4,114,-1],[-40,-18,-56,-38],[42,-20,58,-40],[0,-22,2,-46]].forEach(([a,b,c,d])=>p.cap(P2(x+a,g+b),P2(x+c,g+d),2.6,0.6));
    p.F(M.dust[3]); [[-10,-1,-46,0],[10,-1,48,1],[-30,-1,-60,2]].forEach(([a,b,c,d])=>p.cap(P2(x+a,g+b),P2(x+c,g+d),1.4,0.6));
  }
  function drawSpinSmear(p,M,cx,cy,front){
    p.w(); const a0=front?10:190, a1=front?170:350, ring=(rx,ry,w,col)=>{ p.F(col); band(p,Array.from({length:17},(_,i)=>{ const a=rad(a0+(a1-a0)*i/16); return P2(cx+C(a)*rx,cy+S(a)*ry); }),w); };
    ring(176,30,5,M.fx[1]); ring(176,30,2,M.fx[0]); ring(150,22,2,M.fx[1]); ring(196,36,1.2,M.fx[2]);
  }
  function drawFallSmear(p,M,sk){ p.w(); p.F(M.fx[1]); [-40,-14,14,40].forEach((dx,k)=>{ const x=sk.hip.x+dx, y=sk.hip.y-150-(k%2)*16; p.cap(P2(x,y-30),P2(x,y),0.8,2.6); }); }
  function drawSteam(p,M,sk,P){
    p.w(); const c=Wd(sk.T(14,-40));
    p.F(M.dust[1]); [[14,-2,4,3],[22,-8,5,3.6],[28,-16,3.4,2.6]].forEach(([dx,dy,rx,ry])=>p.ell(c.x+dx,c.y+dy,rx,ry));
    p.F(M.dust[0]); [[14,-3,2,1.4],[22,-9,2.6,1.6]].forEach(([dx,dy,rx,ry])=>p.ell(c.x+dx,c.y+dy,rx,ry));
    if(P.crack){ const h=Wd(sk.H(-6,-58)); p.F(M.dust[0]); [[-4,0,4,3],[4,-8,5,3.4],[-2,-16,3,2.4]].forEach(([dx,dy,rx,ry])=>p.ell(h.x+dx,h.y+dy,rx,ry)); }
  }

  /* ---------------- frame ---------------- */
  const cache=PIX.cache();
  function frame(form,anim,fi,step=5,Pov,pk){
    const K=PIX.getK(), key=(pk!=null?'#'+pk+'|'+form:form+anim+fi+step)+'@'+K; if(cache.has(key)) return cache.get(key);
    const P=Pov||poseOf(anim,fi), M=mats(form), sk=skeleton(P), fur=form==='furia'; QM=M;
    SX=1; PXc=sk.hip.x; BACK=false;
    if(P.spin){ const c=C(rad(P.th)); SX=(c<0?-1:1)*Math.max(0.55,Math.abs(c)); const d=((P.th%360)+360)%360; BACK=d>40&&d<140; }
    const armF=armPts(Wd(sk.shF),P,'F'), armB=armPts(Wd(sk.shB),P,'B');
    const sX=SX, pX=PXc, bk=BACK;
    const parts=[]; const add=(o,fn)=>parts.push(Object.assign(o,{draw:(c,u)=>{ CTX=c; SX=sX; PXc=pX; BACK=bk; fn(pen(c,u)); }}));
    const spinRun=P.spin&&P.smear;
    if(spinRun) add({noShade:true,smear:true,noRim:true},p=>drawSpinSmear(p,M,PXc,sk.shF.y+10,false));
    add({back:true},p=>drawArm(p,M,armB,fur,P,false));
    add({back:true},p=>drawLeg(p,M,Wd(sk.hipB),Wd(sk.kneeB),Wd(sk.ankleB),P.fB,false));
    add({},p=>drawTails(p,M,sk,P));
    add({},p=>drawLeg(p,M,Wd(sk.hipF),Wd(sk.kneeF),Wd(sk.ankleF),P.fF,true));
    add({},p=>drawSkirt(p,M,sk,P,fur));
    add({},p=>drawJacket(p,M,sk,P,fur));
    if(!bk){ add({},p=>drawWatch(p,M,sk,P)); add({noShade:true},p=>drawDial(p,M,sk,P,fur)); }
    if(P.hatOff) add({},p=>drawLooseHat(p,M,P,fur));
    add({},p=>drawHead(p,M,sk,P,fur,P.headOff>0.5));
    if(P.run!=null) add({},p=>drawCarrier(p,M,P));
    add({},p=>drawArm(p,M,armF,fur,P,true));
    // chamas lunares (fúria; e começando na transformação)
    const flAmp=fur?1.3*(1-0.7*P.dead):(anim==='rage'&&fi>=3?0.6:0);
    if(flAmp>0){ const fl=[]; const {out}=hemPts(sk,P); out.forEach((q,j)=>{ if(j%4===1) fl.push([Wd({x:q[0],y:q[1]}).x,q[1],0.9+0.3*(j%2)]); });
      [armF,armB].forEach(a=>{ fl.push([a[a.length-2].x,a[a.length-2].y,0.8]); fl.push([a[4].x,a[4].y,0.6]); });
      if(fur&&!P.headOff){ const h=Wd(sk.H(-6,-46)); fl.push([h.x,h.y,1.1]); }
      if(fur&&P.headOff){ fl.push([AX+P.hdX-4,GROUND-P.hdY-14,0.9]); }
      if(fur){ const {wd,wy,sy}=sk.L; [Wd(sk.T(-20*wd,sy+(wy-sy)*0.42)),Wd(sk.T(44*wd,sy+(wy-sy)*0.72))].forEach(q=>fl.push([q.x,q.y,0.7])); }
      add({noShade:true,noRim:true},p=>drawFlames(p,M,fl,P.t+(anim.length),flAmp)); }
    if(P.ring>0.2&&!bk) add({noShade:true,noRim:true,smear:true},p=>drawRings(p,M,Wd(watchAt(sk)),P.ring,P));
    if(P.impact) add({noShade:true,smear:true,noRim:true},p=>drawImpact(p,M,sk.hip.x+6));
    if(P.smear&&!P.spin) add({noShade:true,smear:true,noRim:true},p=>drawFallSmear(p,M,sk));
    if(spinRun) add({noShade:true,smear:true,noRim:true},p=>drawSpinSmear(p,M,PXc,sk.shF.y+10,true));
    if(P.steam>0.5) add({noShade:true,noRim:true},p=>drawSteam(p,M,sk,P));
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM[form]});
    if(step>=4 && !P.flash) heavyBase(cv);
    const sc=q=>({x:q.x*K,y:q.y*K});
    const hc=P.headOff?{x:AX+P.hdX,y:GROUND-P.hdY}:Wd(sk.H(8,-32));
    cv._eye=sc(P.headOff?hc:Wd(sk.H(25,-35))); cv._head=sc(hc); cv._back=sc(Wd(sk.T(-30,-80))); cv._watch=sc(Wd(watchAt(sk)));
    cv._handF=sc(armF[armF.length-1]); cv._handB=sc(armB[armB.length-1]); cv._stomp=sc({x:sk.hip.x+6,y:GROUND});
    SX=1; PXc=AX; BACK=false;
    cache.set(key,cv); return cv;
  }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame,framePose:function(form,anim,P,key){ if(cache.size>1400) cache.delete(cache.keys().next().value); return frame(form,anim,0,5,P,key); }};
})();
