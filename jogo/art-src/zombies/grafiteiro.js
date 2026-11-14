/* GRAFITEIRO — fonte de arte (editável). Build: npm run art
   Zumbi Grafiteiro (Lapa, RJ): artista de rua consumido pela Lua de Sangue. Moletom com capuz levantado (manchas de
   tinta), boné de aba reta por baixo do capuz, máscara semifacial com dois filtros amarelos, bandana no pescoço,
   luvas de pano sem dedo sujas de tinta, calça larga de sarja, tênis grandes respingados e mochila de latas nas costas.
   Lata de spray (cromada, faixa colorida) na mão da frente. Olhos de lua por cima da máscara, veias de tinta neon no
   antebraço, tinta escorrendo como sangue colorido. Glifo inventado (olho de lua estilizado), nada de tag/assinatura real.
   Golpes: nuvem de spray (cone que cega), marca no chão (agacha e pinta o glifo que atrai zumbis), golpe de lata.
   Adereços (atores extras no palco): xCloud (nuvem no ar), xGlyph (glifo no chão), xCan (lata caída). Honra PIX.getK(). */
const GRAFITEIRO=(function(){
  const {rad,lerp,mkPen,compose}=PIX;
  const FW=196, FH=160, GROUND=150, AX=80;
  const RIM={comum:'#d8e4f4', enluarado:'#9ff6ff', plenilunar:'#ffb46a'};

  /* ---------- materiais ---------- */
  function mats(form){
    const m={
      skin:['#c8d4bc','#8a9a82','#5e6c62','#38404a'],
      vein:['#a8fff4','#2fd8c8','#1a8a8c','#10485a'],
      rot:['#b8b48e','#7e7a5e','#545252','#302a38'],
      flesh:['#f6ae94','#c25a5e','#7a3a4a','#4a1c34'],
      bone:['#fff4d8','#dccfa6','#a09070','#605040'],
      hood:['#9090a8','#5e5e74','#3c3c50','#22222e'],
      cap:['#625a6e','#3e3848','#28232f','#17121c'],
      mask:['#9aa4aa','#626c72','#404a4e','#232a2e'],
      filt:['#fff2a2','#d8b83a','#9a7a1e','#5a4412'],
      can:['#ffffff','#d2d6e2','#8c92a6','#4a4e62'],
      pants:['#b8bcc8','#80869a','#565a70','#30324a'],
      shoe:['#ffffff','#e4e0dc','#aaa6aa','#605c68'],
      sole:['#f2ead8','#bcb09a','#7e7262','#463e36'],
      glove:['#d8d0b6','#a09880','#6c6652','#3e3a30'],
      band:['#f490f8','#c83ae0','#8a2aa0','#4e1660'],
      pack:['#74745e','#4a4a3c','#2e2e28','#18181a'],
      p1:['#ff9a7a','#e8402e','#a8241e','#601018'],
      p2:['#fff2a0','#f2c230','#b88418','#6a4410'],
      p3:['#b4fff4','#2fd8c8','#1a948c','#0e5258'],
      p4:['#f8a8ff','#c83ae0','#8a24a8','#4c1262'],
      mist:['#ffe0ff','#f080f4','#c040d8','#7a1a9a'],
      glyph:['#e8fffc','#5af0e0','#20b0b0','#106070'],
      eye:['#ffffff','#fff4c8','#e8d070','#a08a3a'],
      mouth:['#7c2e3e','#4c1828','#2e0c1a','#1a0610'],
      teeth:['#fbf0c0','#d8c27c','#9a8650','#5e4e30'],
      dirt:['#caa97a','#95754f','#674d35','#3d2b1f'],
      blood:['#b8303a','#7a1020','#4e0a1a','#2e0612'],
      acid:['#c8fff4','#4af0d8','#1aa8a0','#0e5a5e'],
      nail:['#8a7a72','#54484a','#342a30','#1c161a'],
      glow:['#fffbe0','#e8ecb0','#a8b07a','#646c4a'],
      swish:['#fdfdff','#e6f0ff','#b4c4e8','#7484b0'],
    };
    if(form==='enluarado'){
      m.skin=['#dcdcff','#a0a2e4','#686cae','#3c3a76']; m.vein=['#effffe','#7af4ff','#2ab0d8','#146a96'];
      m.rot=['#b8a6e0','#8470b0','#56468a','#33285e']; m.flesh=['#f0b0ff','#b866d8','#7a3a9e','#46206a'];
      m.blood=['#b46ad8','#7e3ea6','#542474','#34144a']; m.acid=['#e8ffff','#7af4ff','#2ab0d8','#146a96'];
      m.hood=['#d6c4f6','#9a82cc','#66509c','#3a2a64']; m.cap=['#5e5880','#3a3456','#26223c','#161228'];
      m.pants=['#a8a6cc','#706e98','#4a4870','#2a2848']; m.pack=['#6e6a90','#46426a','#2c2a48','#18162a'];
      m.p1=['#c8f8ff','#5ad8ff','#2a86c8','#16467a']; m.p2=['#e8f4ff','#9ac4ff','#5a7ad8','#2e3a8a'];
      m.p3=['#e0fffe','#7af4ff','#2ab0d8','#146a96']; m.p4=['#f0d0ff','#b884ff','#7448d0','#3c2280'];
      m.mist=['#f0ffff','#8af0ff','#3ab8e8','#1a62a0']; m.glyph=['#f0f8ff','#6ab8ff','#2a6ae0','#1a2e8a'];
      m.band=['#d0c0ff','#9a7af0','#6448b8','#34227a'];
      m.eye=['#ffffff','#b8fbff','#4ad8f0','#1a8aa8']; m.glow=['#effffe','#7af4ff','#2ab0d8','#146a96'];
      m.swish=['#ffffff','#c8fbff','#6ae4f4','#2a9ab8'];
    }
    if(form==='plenilunar'){
      m.skin=['#ffcaa6','#e2806a','#a4424e','#5e1e36']; m.vein=['#fff0a0','#ffb43a','#e0581e','#8a2414'];
      m.rot=['#d0806a','#9a4a4a','#682a3a','#3e1628']; m.flesh=['#ffc07a','#f06a3a','#a8302e','#5e1422'];
      m.blood=['#ff7a3a','#d43a26','#8a1c22','#4e0c18']; m.acid=['#fff0a0','#ffb43a','#e0581e','#8a2414'];
      m.hood=['#cc6a78','#92304a','#5e1a34','#320c1e']; m.cap=['#5e3a40','#3c2028','#28141c','#180a10'];
      m.pants=['#a88a92','#745c66','#4c3a46','#2c1e2a']; m.pack=['#6e5048','#4a3230','#2e1e20','#1a0e12'];
      m.p1=['#ffc89a','#ff6a2a','#c43418','#6a1410']; m.p2=['#fff4a8','#ffc030','#d4740e','#7a3a0a'];
      m.p3=['#ffd8a0','#ff9a3a','#d0501a','#7a2210']; m.p4=['#ffb0a0','#ff4a4a','#b81e2e','#640e1e'];
      m.mist=['#fff2c8','#ffa04a','#e85a22','#9a2414']; m.glyph=['#fff8d0','#ffb43a','#f0601e','#8a2414'];
      m.band=['#ffb08a','#f05a2a','#a82e1e','#5a1410'];
      m.eye=['#fffbe0','#ffe04a','#ff8a2a','#b83a14']; m.glow=['#fff6c0','#ffb43a','#e0581e','#8a2414'];
      m.swish=['#fffbe6','#ffe6a8','#ffb460','#d0602a'];
    }
    return punch(m);
  }
  const NAMES={skin:'Pele',vein:'Veias de tinta',rot:'Podridão',flesh:'Carne',bone:'Osso',hood:'Moletom com capuz',cap:'Boné de aba reta',mask:'Máscara respiratória',filt:'Filtros da máscara',can:'Lata de spray (cromo)',pants:'Calça de sarja',shoe:'Tênis',sole:'Sola do tênis',glove:'Luva de pano',band:'Bandana',pack:'Mochila de latas',p1:'Tinta vermelha',p2:'Tinta amarela',p3:'Tinta ciano',p4:'Tinta magenta',mist:'Névoa de spray',glyph:'Glifo luminoso',eye:'Olho de lua',mouth:'Boca',teeth:'Dentes',dirt:'Sujeira',blood:'Sangue',acid:'Tinta viva',nail:'Unha',glow:'Brilho',swish:'Rastro do golpe'};
  function sat(h,k){ const [r,g,b]=PIX.hexRgb(h), y=(r+g+b)/3; return PIX.toHex(y+(r-y)*k,y+(g-y)*k,y+(b-y)*k); }
  const NOPUNCH={swish:1,glow:1,mist:1,glyph:1,eye:1};
  function punch(m){ const o={}; for(const k in m){ const r=m[k]; o[k]=NOPUNCH[k]?[r[0],r[1],r[2],r[3]]:[sat(r[0],1.1),sat(r[1],1.16),PIX.mix(sat(r[2],1.1),'#2a1a4c',0.2),PIX.mix(r[3],'#140a24',0.34)]; } return o; }
  // cor de tinta "principal" de cada forma (faixa da lata, névoa, respingos grandes)
  const PAINT={comum:'p4', enluarado:'p3', plenilunar:'p1'};

  /* ---------- poses ---------- */
  // ângulos: 0 = pendurado, + = pra frente. cz = giro da lata somado ao antebraço (0: lata em pé com o bico pra frente;
  // 90: lata deitada pra frente, como porrete). spray = cone de tinta saindo do bico (0..1); sa = desvio do cone.
  // shake = chacoalhando a lata; gly = glifo sendo pintado no chão (0..1); mask = máscara puxada pro queixo;
  // burst = lata explodindo (morte); splat = mancha de tinta no chão; pack = balanço da mochila; drip = pingo de tinta.
  const REST={hx:0,rot:0,lift:0,lean:6,hunch:14,head:-14,jaw:0,aFs:28,aFe:76,aBs:-8,aBe:12,lFh:12,lFk:-6,lBh:-10,lBk:-22,fF:0,fB:0,cz:0,spray:0,sa:0,shake:0,smear:0,flash:0,gly:0,mask:0,burst:0,splat:0,pack:0,drip:0};
  const S=Math.sin, C=Math.cos, PI=Math.PI, mx=Math.max;
  const CROUCH={lean:30,hunch:22,head:-2,lFh:84,lFk:-6,lBh:34,lBk:-84,fB:70,hx:4};
  const ANIMS={
    idle:{nome:'Parado (chacoalha a lata, olha pros lados, bate o pé)',n:8,dur:()=>140,pose:i=>{ const p=i/8*PI*2, s=S(p), s2=S(2*p);
      return {hx:1.2*s, lean:6+1.5*S(p+0.6), hunch:14+1.5*S(2*p), head:-14+6*S(p-0.8), drip:i%4,
        aFs:30+6*s2, aFe:84+22*S(2*p+0.5), cz:-10+10*s2, shake:(i%2===0)?1:0, aBs:-8-4*s, aBe:12+6*s,
        lFh:12+2*s, lFk:-6+2*s, lBh:-10-2*s, lBk:-22+2*s, fF:-12*mx(0,S(2*p+1)), pack:0.6*s}; }},
    walk:{nome:'Andar arrastado (ombros caídos, mochila chacoalha)',n:8,dur:()=>132,pose:i=>{ const p=i/8*PI*2;
      const lFh=10+15*S(p), lBh=-10+11*S(p+PI);
      return {lFh, lFk:lFh-18*mx(0,C(p))-4, lBh, lBk:lBh-10-10*mx(0,C(p+PI)), fF:-6*mx(0,C(p)), fB:16*mx(0,C(p+PI)),
        lean:7+2*S(p), hunch:15+2*S(2*p-0.6), head:-14+3*S(2*p-1.4), hx:1.2*S(p), lift:0.8*mx(0,S(2*p)),
        aFs:24+12*S(p+PI), aFe:70+8*S(p+PI), cz:-14, aBs:-8+14*S(p), aBe:12+12*S(p), pack:S(2*p+0.8), drip:i%4}; }},
    alert:{nome:'Alerta (puxa a máscara e acena a lata)',n:6,dur:i=>[160,150,200,130,150,200][i],pose:i=>[
      {head:-10,lean:3},
      {head:-4,lean:0,aBs:110,aBe:168,hx:-1},
      {head:-2,lean:-2,aBs:118,aBe:176,mask:1,hx:-1},
      {head:-6,lean:-3,aBs:-14,aBe:6,aFs:150,aFe:150,cz:-30,mask:1,lFh:16,lBh:-14},
      {head:-8,lean:-2,aFs:162,aFe:196,cz:-60,shake:1,mask:0},
      {head:-10,lean:0,aFs:150,aFe:136,cz:0,shake:1}][i]},
    // ---- golpes (sprayAt = quadro em que a nuvem nasce; glyphAt = quadro em que o glifo nasce; hit = dano) ----
    cloud:{nome:'Nuvem de spray (cone que cega)',n:9,sprayAt:3,sprayEnd:6,reach:70,warnMs:280,dur:i=>[100,90,90,90,110,110,110,140,170][i],pose:i=>[
      {lean:0,hunch:12,head:-8,aFs:60,aFe:124,cz:-40,shake:1,hx:-1,aBs:-20,aBe:0},
      {lean:-4,hunch:10,head:-6,aFs:84,aFe:156,cz:-70,shake:1,hx:-2,aBs:-26,aBe:-6,lFh:16,lBh:-14},
      {lean:4,hunch:12,head:-6,aFs:84,aFe:88,cz:0,hx:0,aBs:-30,aBe:-10,lFh:18,lFk:-4,lBh:-16,lBk:-26},
      {lean:8,hunch:14,head:-6,aFs:88,aFe:92,cz:0,spray:0.6,hx:2,aBs:-34,aBe:-14,lFh:20,lFk:-2,lBh:-18,lBk:-28},
      {lean:10,hunch:14,head:-8,aFs:92,aFe:96,cz:2,spray:1,hx:3,aBs:-36,aBe:-16,lFh:22,lFk:0,lBh:-20,lBk:-30},
      {lean:12,hunch:14,head:-10,aFs:100,aFe:104,cz:2,spray:1,sa:6,hx:4,aBs:-36,aBe:-16,lFh:22,lFk:0,lBh:-20,lBk:-30},
      {lean:10,hunch:14,head:-10,aFs:94,aFe:98,cz:0,spray:0.7,sa:-4,hx:3,aBs:-32,aBe:-12,lFh:20,lBh:-18},
      {lean:6,hunch:14,head:-12,aFs:58,aFe:100,cz:-20,hx:1,aBs:-18,aBe:2},
      {lean:6,hunch:14,head:-13,aFs:36,aFe:84,cz:-10}][i]},
    tag:{nome:'Marca no chão (agacha e pinta o glifo)',n:9,crouch:[2,6],glyphAt:6,dur:i=>[140,120,120,120,120,120,120,150,160][i],pose:i=>[
      {lean:14,hunch:16,head:-10,aFs:50,aFe:112,cz:-40,shake:1,lFh:30,lFk:-12,lBh:0,lBk:-40,hx:1},
      {lean:24,hunch:18,head:-6,aFs:70,aFe:96,cz:-20,shake:1,lFh:62,lFk:-14,lBh:20,lBk:-70,fB:40,hx:2},
      Object.assign({},CROUCH,{aFs:58,aFe:30,cz:-10,spray:0.7,sa:0,gly:0.2}),
      Object.assign({},CROUCH,{aFs:72,aFe:50,cz:-10,spray:0.8,sa:-6,gly:0.4,hx:5}),
      Object.assign({},CROUCH,{aFs:50,aFe:22,cz:-10,spray:0.8,sa:6,gly:0.6,hx:3}),
      Object.assign({},CROUCH,{aFs:66,aFe:44,cz:-10,spray:0.8,sa:-4,gly:0.8,hx:5}),
      Object.assign({},CROUCH,{aFs:60,aFe:34,cz:-10,spray:0.5,gly:1,hx:4}),
      {lean:22,hunch:20,head:-8,aFs:40,aFe:80,cz:-20,lFh:44,lFk:-10,lBh:10,lBk:-56,fB:30,hx:2},
      {lean:10,hunch:16,head:-12,aFs:30,aFe:80,cz:-10,lFh:18,lBh:-12}][i]},
    hit:{nome:'Golpe de lata (porrete)',n:8,hit:4,reach:30,dur:i=>[130,120,80,80,70,110,130,150][i],pose:i=>[
      {lean:-2,hunch:12,head:-8,aFs:120,aFe:168,cz:60,hx:-1},
      {lean:-8,hunch:10,head:-4,aFs:160,aFe:204,cz:90,hx:-3,lFh:18,lBh:-16,aBs:-24,aBe:0},
      {lean:-12,hunch:8,head:-2,aFs:176,aFe:222,cz:90,hx:-4,lFh:20,lFk:-6,lBh:-18,lBk:-28,aBs:-30,aBe:-6},
      {lean:10,hunch:16,head:-12,aFs:132,aFe:122,cz:90,smear:1,hx:3,lFh:24,lFk:0,lBh:-20,lBk:-30,aBs:10,aBe:30},
      {lean:22,hunch:20,head:-18,aFs:80,aFe:60,cz:90,smear:1,hx:7,lFh:30,lFk:4,lBh:-24,lBk:-34,fB:10,aBs:20,aBe:40},
      {lean:24,hunch:20,head:-18,aFs:40,aFe:12,cz:90,hx:7,lFh:30,lFk:4,lBh:-24,lBk:-34,fB:10,aBs:16,aBe:34},
      {lean:12,hunch:16,head:-14,aFs:20,aFe:50,cz:40,hx:3,lFh:20,lBh:-16},
      {lean:8,hunch:14,head:-14,aFs:26,aFe:70,cz:10}][i]},
    hurt:{nome:'Dano (cabeça)',n:4,dur:i=>[80,110,130,150][i],pose:i=>[
      {lean:-8,hunch:6,head:2,aFs:-6,aFe:30,cz:-20,aBs:-20,aBe:10,hx:-6,flash:1,lFh:14,lBh:-4,pack:-1},
      {lean:-4,hunch:8,head:-2,aFs:4,aFe:44,cz:-20,aBs:-12,aBe:20,hx:-5,lFh:12,lBh:-6,pack:-0.6},
      {lean:2,hunch:10,head:-8,aFs:16,aFe:60,aBs:-10,aBe:14,hx:-2,pack:0.4},
      {lean:5,hunch:13,head:-12,hx:0}][i]},
    hurtB:{nome:'Dano (barriga, dobra)',n:4,dur:i=>[80,120,140,150][i],pose:i=>[
      {lean:30,hunch:28,head:2,aFs:50,aFe:20,cz:-30,aBs:44,aBe:14,hx:-8,flash:1,lFh:20,lFk:-14,lBh:-14,lBk:-30,pack:1},
      {lean:26,hunch:26,head:-2,aFs:46,aFe:24,cz:-30,aBs:40,aBe:20,hx:-7,lFh:18,lFk:-12,lBh:-14,lBk:-28,pack:0.6},
      {lean:16,hunch:20,head:-8,aFs:36,aFe:60,aBs:20,aBe:40,hx:-3},
      {lean:8,hunch:15,head:-12,hx:-1}][i]},
    fall:{nome:'Derrubado',n:5,dur:i=>[90,100,110,140,280][i],pose:i=>[
      {lean:-12,hunch:4,head:2,aFs:-40,aFe:-20,cz:20,aBs:-46,aBe:-30,hx:-6,flash:1,lFh:20,lBh:0,pack:-1},
      {rot:-34,lean:-4,hunch:8,head:-2,aFs:-60,aFe:-40,aBs:-70,aBe:-50,hx:-4,lFh:40,lFk:30,lBh:20,lBk:10},
      {rot:-70,lean:0,hunch:10,head:-6,aFs:-96,aFe:-80,aBs:-100,aBe:-84,hx:-6,lFh:50,lFk:40,lBh:30,lBk:24},
      {rot:-90,lean:4,hunch:12,head:-4,aFs:-112,aFe:-124,aBs:-100,aBe:-112,hx:2,lFh:42,lFk:12,lBh:30,lBk:4},
      {rot:-90,lean:0,hunch:12,head:-6,aFs:-128,aFe:-148,aBs:-110,aBe:-136,hx:2,lFh:40,lFk:6,lBh:26,lBk:0}][i]},
    getup:{nome:'Levantar (ajeita o capuz)',n:5,dur:i=>[200,170,170,160,160][i],pose:i=>[
      {rot:-90,lean:0,hunch:12,head:-6,aFs:-128,aFe:-148,aBs:-110,aBe:-136,hx:2,lFh:40,lFk:6,lBh:26,lBk:0},
      {rot:-56,lean:12,hunch:20,head:-16,aFs:-50,aFe:-10,aBs:-60,aBe:-20,hx:-8,lFh:90,lFk:10,lBh:70,lBk:0},
      {rot:-24,lean:22,hunch:24,head:-22,aFs:-10,aFe:10,aBs:-20,aBe:0,hx:-6,lFh:108,lFk:10,lBh:60,lBk:-60},
      {rot:0,lean:28,hunch:22,head:-24,aFs:30,aFe:10,aBs:20,aBe:4,hx:-4,lFh:76,lFk:-2,lBh:6,lBk:-86,fB:60},
      {rot:0,lean:12,hunch:16,head:-14,aFs:30,aFe:72,aBs:110,aBe:170,hx:-1,lFh:28,lFk:-10,lBh:-12,lBk:-30}][i]},
    death:{nome:'Morte (a lata explode em tinta, cai de joelhos)',n:8,dur:i=>[90,120,150,170,160,150,170,600][i],pose:i=>[
      {lean:-10,hunch:6,head:2,aFs:70,aFe:110,cz:-20,aBs:-40,aBe:-24,hx:-5,flash:1,lFh:14,lBh:-4,burst:0.3},
      {lean:-14,hunch:4,head:8,aFs:110,aFe:150,cz:-40,aBs:-30,aBe:-10,hx:-6,lFh:12,lBh:-8,burst:1,splat:0.2},
      {lean:-4,hunch:10,head:4,aFs:60,aFe:80,aBs:-6,aBe:10,hx:-4,lFh:40,lFk:-30,lBh:28,lBk:-50,fF:10,fB:30,burst:0.6,splat:0.4},
      {lean:8,hunch:22,head:-6,aFs:10,aFe:6,aBs:4,aBe:2,hx:-2,lFh:14,lFk:-92,lBh:6,lBk:-96,fF:100,fB:100,splat:0.6},
      {rot:14,lean:12,hunch:28,head:-10,aFs:20,aFe:16,aBs:16,aBe:12,hx:0,lFh:2,lFk:-92,lBh:-6,lBk:-96,fF:90,fB:90,splat:0.8},
      {rot:48,lean:10,hunch:24,head:-14,aFs:70,aFe:90,aBs:56,aBe:76,hx:4,lFh:-20,lFk:-70,lBh:-28,lBk:-74,fF:60,fB:60,splat:0.9},
      {rot:84,lean:2,hunch:14,head:-6,aFs:150,aFe:170,aBs:110,aBe:150,hx:8,lFh:-4,lFk:-10,lBh:-8,lBk:-14,fF:10,fB:10,splat:1},
      {rot:90,lean:0,hunch:12,head:-2,aFs:160,aFe:176,aBs:116,aBe:156,hx:8,lFh:-2,lFk:-6,lBh:-6,lBk:-10,fF:6,fB:6,splat:1,drip:3}][i]},
    // adereços (desenhados pelo motor como atores extras; âncora em cv._ax/_gy)
    xCloud:{nome:'Nuvem de spray no ar (adereço)',n:4,prop:true,dur:()=>90,pose:i=>({st:i})},
    xGlyph:{nome:'Glifo no chão (adereço)',n:4,prop:true,dur:()=>120,pose:i=>({st:i})},
    xCan:{nome:'Lata caída (adereço)',n:2,prop:true,dur:()=>200,pose:i=>({st:i})},
  };
  const EXK=['hx','lean','hunch','head','aFs','aFe','aBs','aBe','lFh','lFk','lBh','lBk'];
  function exag(P,f){ if(f===1||Math.abs(P.rot)>4) return P; EXK.forEach(k=>{ P[k]=REST[k]+(P[k]-REST[k])*f; }); return P; }
  const EXF={idle:1.05,walk:1.08,alert:1.1,cloud:1.12,tag:1.04,hit:1.16,hurt:1.3,hurtB:1.25,fall:1.1,getup:1.06,death:1.08};
  ZREACT.add(ANIMS,REST,{}); // reações (voando, agarrado)
  function poseOf(anim,i){ const A=ANIMS[anim]; if(A&&A.prop) return Object.assign({},REST,A.pose(i)); return exag(Object.assign({},REST,A.pose(i)),EXF[anim]||1); }
  function heavyOutline(cv){ const g=cv.getContext('2d'), W=cv.width, H=cv.height, im=PIX.pix(cv), d=im.data;
    const isO=i=>d[i+3]===255&&d[i]===0x17&&d[i+1]===0x0b&&d[i+2]===0x1c, fill=i=>d[i+3]===255&&!isO(i);
    const add=[]; for(let y=2;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(d[i+3]) continue; const u=((y-1)*W+x)*4, u2=((y-2)*W+x)*4; if(isO(u)&&fill(u2)) add.push(i); }
    add.forEach(i=>{ d[i]=0x17; d[i+1]=0x0b; d[i+2]=0x1c; d[i+3]=255; }); g.putImageData(im,0,0); }

  /* ---------- esqueleto (magro, ombros caídos, cabeça pra frente) ---------- */
  const SPINE=34, TH=20, SH=19, UA=14, FA=13, VS=SPINE/37, US=1.12, HB=10, HS=1.17, CS=1.24;
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
    const top=SS[SPINE], neck=T(1.6,-36.4), sa=top.a;
    const shF=T(-1,-29.8), shB=T(-6.4,-30.6); // ombros caídos
    const elF=lp(shF,P.aFs-R,UA), wrF=lp(elF,P.aFe-R,FA), elB=lp(shB,P.aBs-R,UA), wrB=lp(elB,P.aBe-R,FA);
    const ha=sa+rad(P.head-HB*0.8), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:neck.x+(lx*hc-ly*hs)*HS, y:neck.y+(lx*hs+ly*hc)*HS});
    // lata: punho -> lata (eixo local y = em pé; x = direção do bico)
    const ang=Math.atan2(wrF.y-elF.y,wrF.x-elF.x), hand={x:wrF.x+Math.cos(ang)*4, y:wrF.y+Math.sin(ang)*4};
    const cr=ang+rad(P.cz), cc=Math.cos(cr), cs=Math.sin(cr);
    const CL=(lx,ly)=>({x:hand.x+(lx*cc-ly*cs)*CS, y:hand.y+(lx*cs+ly*cc)*CS});
    const noz=CL(3.2,-15), canTop=CL(0.4,-16.2), canBot=CL(0.4,2.6), sprA=cr+rad(P.sa);
    const toe=(a,f)=>{ const t=rad(f+R); return {x:a.x+(11*Math.cos(t)-5*Math.sin(t))*1.4, y:a.y+(11*Math.sin(t)+5*Math.cos(t))*1.4}; };
    const hull=[[ankleF,6.6],[ankleB,6.6],[toe(ankleF,P.fF),1],[toe(ankleB,P.fB),1],[kneeF,5.6],[kneeB,5.6],[hip,9],[T(0,-18),12],[T(-2,-30),12],[H(3,-12),13],[wrF,4],[wrB,4],[elF,4],[elB,4]];
    return {R,hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,SP,T,sa,neck,shF,shB,elF,wrF,elB,wrB,ha,H,hull,ra,hand,cr,CL,noz,canTop,canBot,sprA,toeF:toe(ankleF,P.fF)};
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
  // respingo de tinta (cluster limpo: gota + 2 satélites)
  function splash(p,R,x,y,r,seed){ p.F(R[1]); p.ell(x,y,r,r*0.8); p.F(R[0]); p.rect(x-r*0.4,y-r*0.6,Math.max(0.6,r*0.5),Math.max(0.5,r*0.35));
    const a=seed*2.4; p.F(R[1]); p.circle({x:x+Math.cos(a)*r*1.6,y:y+Math.sin(a)*r*1.2},Math.max(0.7,r*0.4)); }
  const PCOL=M=>[M.p1,M.p2,M.p3,M.p4];

  /* ---------- lata de spray (coordenadas locais da mão: y pra cima negativo = topo, x = lado do bico) ---------- */
  function drawCanLocal(p,M,form,o){
    o=o||{}; const PC=M[PAINT[form]];
    // corpo cromado
    p.F(M.can[1]); p.poly([[-2.6,-8],[3.4,-8],[3.4,5.2],[2.6,6.2],[-1.8,6.2],[-2.6,5.2]]);
    p.F(M.can[2]); p.poly([[-2.6,-8],[-1,-8],[-1,6.2],[-1.8,6.2],[-2.6,5.2]]);
    p.F(M.can[3]); p.rect(-2.6,-8,0.7,13.2);
    p.F(M.can[0]); p.rect(1,-7.6,0.8,12.6);
    // faixa colorida (rótulo genérico: listras, sem marca)
    p.F(PC[1]); p.rect(-2.6,-5.6,6,6.8); p.F(PC[2]); p.rect(-2.6,-5.6,1.6,6.8); p.F(PC[0]); p.rect(1,-5.4,0.8,6.2);
    p.F(PC[3]); p.rect(-2.6,-1.4,6,0.7); p.F(M.can[1]); p.rect(-2.6,-4.4,6,0.5);
    // ombro abaulado e bico
    p.F(M.can[2]); p.poly([[-2.6,-8],[-1.6,-10.2],[2.6,-10.2],[3.4,-8]]); p.F(M.can[0]); p.rect(0.4,-9.8,1.4,0.6);
    p.F(M.can[3]); p.rect(-0.4,-11,1.8,1); p.F(PC[1]); p.poly([[-0.8,-13],[2.6,-13],[2.8,-11],[-0.8,-11]]); p.F(PC[0]); p.rect(-0.4,-12.8,1.6,0.6);
    p.F(M.can[3]); p.rect(2.4,-12.4,0.8,0.8); // furo do bico
    // tinta escorrida do bico
    p.F(PC[1]); p.poly([[2.6,-10.6],[3.4,-10.6],[3.4,-6.4],[3,-5.6],[2.6,-6.6]]);
    p.F(M.can[3]); p.poly([[-1.8,6.2],[2.6,6.2],[2.2,6.8],[-1.4,6.8]]);
    if(form!=='comum' && !o.dull){ p.F(M.glow[1]); p.rect(2.6,-4,0.6,2.4); }
  }
  function drawFistLocal(p,M){
    // luva de pano sem dedo segurando a lata pela cintura
    p.F(M.glove[1]); p.poly([[-3.8,-3.8],[1.6,-4.6],[4.8,-3.2],[5,3],[1.6,4.4],[-3.8,3.8]]);
    p.F(M.glove[2]); p.poly([[-3.8,1.2],[5,1.4],[5,3],[1.6,4.4],[-3.8,3.8]]);
    p.F(M.glove[0]); p.rect(-2.6,-3.8,3.4,0.8);
    for(let k=0;k<4;k++){ const y0=-2.8+k*1.85; p.F(M.glove[1]); p.ell(4.8,y0,1.5,1); p.F(M.glove[3]); p.rect(3.6,y0+0.7,2,0.4); p.F(M.skin[1]); p.rect(5.6,y0-0.6,1.1,1); p.F(M.nail[1]); p.rect(6.3,y0-0.5,0.6,0.7); }
    p.F(M.glove[1]); p.cap({x:-2,y:-3.6},{x:1.8,y:-5.6},2,1.6); p.F(M.skin[1]); p.circle({x:2.2,y:-5.8},0.9);
    p.F(M.p2[1]); p.ell(-1.4,1.8,1.2,0.8); p.F(M.p3[1]); p.rect(0.8,-2,1,0.8); p.F(M.p1[1]); p.rect(-3,-1,0.8,1.2);
  }
  function drawCanHand(c,p,M,sk,P,form){
    p.xf(sk.cr,sk.hand.x,sk.hand.y); c.scale(CS,CS);
    c.translate(0,-3.8); drawCanLocal(p,M,form); c.translate(0,3.8); drawFistLocal(p,M);
    if(P.shake>=0.5){ p.F(M.swish[1]); p.rect(-5.6,-9,1,3); p.rect(-6.8,-6,0.8,2); p.rect(5.2,-10,1,2.4); }
    p.id();
  }

  /* ---------- braços: manga do moletom (frente) e manga arregaçada com veias de tinta (trás) ---------- */
  function drawArm(c,u,M,sk,P,front,form){
    const p=mkPen(c,u), sh=front?sk.shF:sk.shB, el=front?sk.elF:sk.elB, wr=front?sk.wrF:sk.wrB; p.id();
    const sn=sideN(sh,el);
    if(!front){
      const n=limb(p,M.skin,el,wr,8.6,7.6,{});
      p.F(M.vein[1]); const v0=lerp(el,wr,0.2), v1=lerp(el,wr,0.9); p.cap(off(v0,n,-1),off(v1,n,-1.4),0.7,0.5);
      p.F(M.vein[2]); const v2=lerp(el,wr,0.5); p.cap(off(v2,n,-1.2),off(lerp(el,wr,0.7),n,1.6),0.6,0.5);
      p.F(M.rot[1]); const r1=lerp(el,wr,0.6); p.ell(r1.x+n.nx*1.6,r1.y+n.ny*1.6,1.4,1);
      limb(p,M.hood,sh,el,13,12.4,{hl:0.6});
      // manga embolada no cotovelo
      const e2=lerp(el,wr,0.22); p.F(M.hood[1]); p.cap(el,e2,12.6,11.4); p.F(M.hood[2]); p.cap(off(el,sn,1.6),off(e2,sn,1.6),6,5); p.F(M.hood[3]);
      const en=sideN(el,wr); p.cap(off(e2,en,-5),off(e2,en,5),1,1); p.F(M.hood[0]); p.cap(off(lerp(el,e2,0.4),en,-4.6),off(lerp(el,e2,0.4),en,-1),0.7,0.6);
      drawHandB(c,p,M,el,wr,form);
    } else {
      limb(p,M.hood,sh,el,13.4,12.4,{hl:0.6});
      const n=limb(p,M.hood,el,wr,12.2,10.6,{hl:0.6});
      // punho canelado
      const cf0=lerp(el,wr,0.8), cf=lerp(el,wr,1.02);
      p.F(M.hood[2]); p.cap(cf0,cf,9.8,9.4); p.F(M.hood[3]); [0.86,0.93].forEach(t=>{ const q=lerp(el,wr,t); p.cap(off(q,n,-4.2),off(q,n,4.2),0.6,0.6); });
      p.F(M.hood[1]); p.cap(off(lerp(el,wr,0.82),n,-3.6),off(lerp(el,wr,1),n,-3.4),0.8,0.8);
      // respingos de tinta na manga
      const PC=PCOL(M); [[0.35,2,0],[0.6,-2.4,1],[0.25,-1,2]].forEach(([t,k,ci],i)=>{ const q=off(lerp(el,wr,t),n,k); splash(p,PC[(ci+1)%4],q.x,q.y,1.2,i+1); });
      { const q=off(lerp(sh,el,0.5),sn,2.4); splash(p,M.p2,q.x,q.y,1.3,4); }
    }
    // dobras do moletom no cotovelo
    p.F(M.hood[2]); const c1=lerp(sh,el,0.86); p.cap(off(c1,sn,-4),off(c1,sn,1),0.8,0.7);
    const c2=lerp(sh,el,0.6); p.cap(off(c2,sn,2),off(c2,sn,5),0.8,0.7);
    p.F(M.hood[0]); const c3=lerp(sh,el,0.3); p.cap(off(c3,sn,-4.6),off(c3,sn,-1.6),0.7,0.6);
    if(front) drawCanHand(c,p,M,sk,P,form);
  }
  function drawHandB(c,p,M,el,wr,form){
    // luva sem dedo, mão meio aberta (dedos compridos e podres)
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y); c.scale(1.26,1.26);
    p.F(M.glove[1]); p.poly([[-1.4,-3],[4,-3.2],[4.8,2.8],[-1.4,3.2]]);
    p.F(M.glove[2]); p.poly([[-1.4,1],[4.6,1],[4.8,2.8],[-1.4,3.2]]); p.F(M.glove[0]); p.rect(-0.6,-2.8,3.4,0.7);
    [[-2.4,8.8],[-0.8,9.8],[0.8,9.4],[2.4,8.2]].forEach(([y,L])=>{ p.F(M.skin[1]); p.cap({x:4,y},{x:L,y:y+0.6},1.5,1.1); p.F(M.nail[1]); p.rect(L-0.6,y,0.9,0.8); });
    p.F(M.glove[3]); p.rect(3.4,-2.6,0.6,5); p.F(M.skin[1]); p.cap({x:2,y:-3},{x:4.6,y:-5.4},1.7,1.2);
    p.F(M.p3[1]); p.rect(0.4,0.2,1.2,1); p.F(M.p1[1]); p.rect(2.2,-2,0.8,0.8);
    p.id();
  }

  /* ---------- pernas: calça larga de sarja com bolso, tênis grandes respingados ---------- */
  function drawLeg(c,u,M,sk,P,front){
    const p=mkPen(c,u), hip=front?sk.hipF:sk.hipB, knee=front?sk.kneeF:sk.kneeB, ank=front?sk.ankleF:sk.ankleB; p.id();
    const nS=limb(p,M.pants,knee,lerp(knee,ank,0.92),13,13.6,{hl:0.5});
    const nT=limb(p,M.pants,hip,knee,15,13.4,{hl:0.55});
    p.F(M.pants[1]); p.circle(knee,6.6);
    p.F(M.pants[0]); p.cap(off(lerp(hip,knee,0.15),nT,-4),off(lerp(hip,knee,0.8),nT,-3.6),0.7,0.7);
    // barra embolada em cima do tênis (calça larga)
    [0.72,0.82,0.9].forEach((t,i)=>{ const q=lerp(knee,ank,t); p.F(M.pants[i%2?3:2]); p.cap(off(q,nS,-6.6),off(lerp(knee,ank,t+0.04),nS,6.6),1,1); });
    // dobras e costura
    p.F(M.pants[2]); const f1=lerp(hip,knee,0.5), f2=lerp(knee,ank,0.4);
    p.cap(off(f1,nT,1.6),off(lerp(hip,knee,0.68),nT,5),0.8,0.7); p.cap(off(f2,nS,1),off(lerp(knee,ank,0.56),nS,4.4),0.8,0.7);
    p.F(M.pants[3]); p.cap(off(knee,nS,4.6),off(lerp(knee,ank,0.3),nS,5.6),0.6,0.6);
    if(front){ // bolso cargo na coxa + respingos
      const q0=lerp(hip,knee,0.42), q1=lerp(hip,knee,0.78);
      p.F(M.pants[2]); p.poly([[off(q0,nT,-1).x,off(q0,nT,-1).y],[off(q0,nT,5.4).x,off(q0,nT,5.4).y],[off(q1,nT,5).x,off(q1,nT,5).y],[off(q1,nT,-1.2).x,off(q1,nT,-1.2).y]]);
      p.F(M.pants[1]); p.poly([[off(q0,nT,-1).x,off(q0,nT,-1).y],[off(q0,nT,5.4).x,off(q0,nT,5.4).y],[off(lerp(q0,q1,0.25),nT,5.2).x,off(lerp(q0,q1,0.25),nT,5.2).y],[off(lerp(q0,q1,0.25),nT,-1).x,off(lerp(q0,q1,0.25),nT,-1).y]]);
      p.F(M.pants[3]); const qb=lerp(q0,q1,0.25); p.cap(off(qb,nT,-1),off(qb,nT,5.2),0.5,0.5);
      const PC=PCOL(M); [[0.3,-2,0],[0.6,1.6,2],[0.85,-1,3]].forEach(([t,k,ci],i)=>{ const q=off(lerp(knee,ank,t*0.8),nS,k); splash(p,PC[ci],q.x,q.y,1.1,i+2); });
      { const q=off(lerp(hip,knee,0.2),nT,-3); splash(p,M.p2,q.x,q.y,1.2,5); }
      p.F(M.blood[1]); const b0=lerp(hip,knee,0.88); p.ell(b0.x+nT.nx*3,b0.y+nT.ny*3,1.2,1.8);
    } else { p.F(M.dirt[2]); const d0=lerp(knee,ank,0.6); p.ell(d0.x,d0.y,2,1.4); }
    // tênis grande: cano médio, sola grossa (entressola clara + solado), cadarço, respingos
    const fa=rad((front?P.fF:P.fB)+sk.R); p.xf(fa,ank.x,ank.y); c.scale(1.4,1.4);
    p.F(M.shoe[1]); p.poly([[-4,-3.4],[1.8,-3.8],[4.6,-1.6],[9,0],[11.6,1.4],[12,3.2],[-4.4,3.2]]);
    p.F(M.shoe[2]); p.poly([[-4.4,1.4],[12,1.8],[12,3.2],[-4.4,3.2]]); p.F(M.shoe[0]); p.poly([[0.4,-3.2],[2.2,-3.4],[4.6,-1.2],[8.6,0.4],[8.4,1],[4,-0.2],[0.6,-2.2]]);
    p.F(M.shoe[3]); p.poly([[-4,-3.4],[-1.6,-3.6],[-1.2,-2.4],[-4.2,-2.2]]); // gola acolchoada
    p.F(M[PAINT_SHOE(front)][1]); p.poly([[-3.4,-1.2],[2.6,-0.6],[6.4,1],[2,1.4],[-3.6,0.8]]); // recorte lateral (genérico)
    p.F(M.sole[1]); p.poly([[-4.8,3.2],[12.4,3.2],[12.6,4.8],[11.6,5.6],[-4.6,5.6]]); p.F(M.sole[0]); p.rect(-4.2,3.3,15.6,0.6);
    p.F(M.sole[3]); p.poly([[-4.8,5],[12,5],[11.6,5.8],[-4.6,5.8]]); p.F(M.sole[2]); [0,3,6,9].forEach(x=>p.rect(x-3,4.4,1.2,0.6));
    p.F(M.shoe[3]); [[2.6,-2.6],[4,-1.8],[5.4,-1]].forEach(([x,y])=>p.rect(x,y,1,0.7)); // cadarço
    p.F(M.shoe[2]); p.rect(9.6,1.6,1.6,0.6);
    const PC=PCOL(M); splash(p,PC[front?0:2],7.4,2.2,0.9,3); splash(p,PC[front?3:1],-1.6,1.8,0.8,1); if(front) splash(p,M.p2,3.4,0.6,0.7,6);
    p.id();
  }
  const PAINT_SHOE=front=>front?'p3':'p1';

  /* ---------- tronco: moletom largo com bolso canguru, cordão do capuz, alça da mochila ---------- */
  const HOODIE=[[-11,5.4],[-11.8,0],[-12.6,-10],[-13.2,-20],[-13.6,-28],[-12.8,-34],[-9,-38.6],[-3,-40.4],[4,-40],[9.4,-37.4],[12.6,-32],[13.8,-25],[14.4,-17],[14.8,-9],[14.6,-1],[14,3],[12.8,6],[6,6.6],[0,6.8],[-6,6.4]];
  function drawPack(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id(); const sw=P.pack||0;
    // latas saindo por cima (tampas coloridas)
    const PC=PCOL(M);
    [[-21,-41.4,1],[-17.4,-42.6,0],[-13.8,-41.2,3]].forEach(([uu,vv,ci],i)=>{
      const a=Wp(sk,uu,vv), b=Wp(sk,uu+0.6,vv+8), n=sideN(a,b);
      p.F(M.can[1]); p.cap(a,b,4.4,4.4); p.F(M.can[2]); p.cap(off(a,n,1.2),off(b,n,1.2),1.6,1.6); p.F(M.can[0]); p.cap(off(a,n,-1),off(lerp(a,b,0.7),n,-1),0.7,0.6);
      const t=Wp(sk,uu-0.1,vv-1.6); p.F(PC[ci][1]); p.ell(t.x,t.y,2.6,2); p.F(PC[ci][0]); p.rect(t.x-1.2,t.y-1.6,1.4,0.7); p.F(PC[ci][2]); p.rect(t.x-2,t.y+0.6,4,0.8);
      if(i===1){ p.F(PC[ci][1]); p.rect(t.x+1.2,t.y+1,0.8,2.6); }
    });
    // corpo da mochila
    const bag=W(sk,[[-9.6,-37.6],[-15,-38.6],[-21,-37.8],[-24.4,-33],[-25.2,-22],[-24.4,-13.4],[-20.6,-10.6],[-12,-11],[-9.6,-14]]);
    p.F(M.pack[1]); p.poly(bag);
    clip(c,bag,()=>{
      p.F(M.pack[2]); p.poly(W(sk,[[-27,-40],[-21.4,-40],[-22.6,-30],[-22,-16],[-19,-9],[-27,-9]]));
      p.F(M.pack[3]); p.poly(W(sk,[[-27,-40],[-24,-40],[-24.6,-28],[-24,-14],[-27,-9]]));
      p.F(M.pack[0]); p.poly(W(sk,[[-17,-37.6],[-11,-37],[-11.4,-30],[-15,-33]]));
      // aba de cima e zíper
      p.F(M.pack[2]); p.poly(W(sk,[[-25,-31],[-10,-30.4],[-10,-29.2],[-25,-29.6]]));
      p.F(M.pack[3]); p.poly(W(sk,[[-23,-24],[-11,-23.4],[-11,-22.8],[-23,-23.4]]));
      p.F(M.can[2]); { const q=Wp(sk,-12.6,-23.2); p.rect(q.x-0.6,q.y-0.4,1.2,1.6); }
      // bolso da frente
      p.F(M.pack[2]); p.poly(W(sk,[[-23.6,-20],[-15,-19.6],[-14.6,-12],[-23,-12.4]])); p.F(M.pack[0]); p.poly(W(sk,[[-23.4,-20],[-15,-19.6],[-15,-18.8],[-23.4,-19.2]]));
      splash(p,PC[1],Wp(sk,-19,-34).x,Wp(sk,-19,-34).y,1.3,2); splash(p,PC[2],Wp(sk,-21,-16).x,Wp(sk,-21,-16).y,1.1,4); splash(p,PC[0],Wp(sk,-14,-27).x,Wp(sk,-14,-27).y,0.9,1);
    });
    // lata pendurada no cordão (balança)
    const h0=Wp(sk,-24.4,-14), h1={x:h0.x-2-sw*2.4,y:h0.y+5};
    p.F(M.pack[3]); p.cap(h0,h1,0.7,0.7);
    const a=h1, b={x:h1.x-0.4-sw*1.4,y:h1.y+7.6}, n=sideN(a,b);
    p.F(M.can[1]); p.cap(a,b,4,4); p.F(M.can[2]); p.cap(off(a,n,1),off(b,n,1),1.4,1.4); p.F(PC[3][1]); p.cap(lerp(a,b,0.3),lerp(a,b,0.62),4.1,4.1); p.F(PC[3][0]); p.rect(a.x-0.6,a.y+2.6,0.8,1.4);
  }
  function drawTorso(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    const shape=W(sk,HOODIE), PC=PCOL(M);
    p.F(M.hood[1]); p.poly(shape);
    clip(c,shape,()=>{
      p.F(M.hood[0]); p.poly(W(sk,[[2,-36],[6,-40],[12.6,-33],[14.6,-24],[14,-16],[11,-18],[7,-28]]));
      p.F(M.hood[0]); p.poly(W(sk,[[-5,-39],[1,-41],[2,-37],[-4,-36]]));
      p.F(M.hood[2]); p.poly(W(sk,[[-15,13],[-15,-41],[-8,-41],[-8.8,-30],[-8,-18],[-6.6,-6],[-4,4],[16,4],[16,13]]));
      p.F(M.hood[3]); p.poly(W(sk,[[-15,13],[-15,-41],[-10.8,-41],[-11.4,-30],[-10.6,-18],[-9.6,-6],[-8.6,13]]));
      // barra canelada
      p.F(M.hood[2]); p.poly(W(sk,[[-15,1.4],[16,1],[16,13],[-15,13]])); p.F(M.hood[3]); for(let k=-10;k<=13;k+=2.6) p.poly(W(sk,[[k,1.8],[k+0.7,1.8],[k+0.7,6.4],[k,6.4]]));
      p.F(M.hood[1]); p.poly(W(sk,[[-4,1.2],[13.6,0.8],[13.6,2],[-4,2.4]]));
      // bolso canguru
      p.F(M.hood[2]); p.poly(W(sk,[[0.6,-19.6],[10.6,-20.6],[14.8,-10],[14.8,0.6],[1.4,1]]));
      p.F(M.hood[1]); p.poly(W(sk,[[1.4,-18.6],[10,-19.4],[13.6,-10],[13.6,-0.2],[2,0.2]]));
      p.F(M.hood[3]); p.poly(W(sk,[[10,-19.4],[10.8,-20.4],[14.8,-10],[13.8,-9.6]])); // boca do bolso
      p.F(M.hood[0]); p.poly(W(sk,[[2.6,-17.6],[8.4,-18.2],[8.6,-17.4],[2.8,-16.8]]));
      // dobras do moletom
      p.F(M.hood[2]); [[[-2,-12],[3,-16],[3.6,-15.2],[-1.4,-11.2]],[[0,-24],[5.4,-27],[5.8,-26.2],[0.4,-23.2]],[[-4,-31],[-1,-33],[-0.6,-32.2],[-3.6,-30.4]],[[4,-4],[9,-6],[9.2,-5.2],[4.4,-3.4]]].forEach(f=>p.poly(W(sk,f)));
      p.F(M.hood[0]); [[[-1,-20],[4,-22.6],[4.4,-21.8],[-0.6,-19.2]]].forEach(f=>p.poly(W(sk,f)));
      // respingos de tinta (cores vivas)
      [[6,-30,1.9,0],[11,-24,1.5,1],[-3,-26,1.6,2],[8,-10,1.7,3],[-6,-6,1.5,1]].forEach(([uu,vv,r,ci],i)=>{ const q=Wp(sk,uu,vv); splash(p,PC[ci],q.x,q.y,r,i); });
      // pingos escorrendo do peito
      p.F(PC[0][1]); p.poly(W(sk,[[5.4,-29.4],[6.6,-29.4],[6.4,-23],[5.8,-22.4]])); p.F(PC[3][1]); p.poly(W(sk,[[10.4,-21.4],[11.4,-21.4],[11.2,-16.4],[10.6,-16]]));
      // rasgo nas costas com carne e tinta escorrendo como sangue colorido
      p.F(M.hood[3]); p.poly(W(sk,[[-12,-26],[-8,-28],[-5.6,-24],[-6,-18],[-9,-16.4],[-11.6,-19.6]]));
      p.F(M.flesh[3]); p.poly(W(sk,[[-11.4,-25.4],[-8.2,-27],[-6.4,-23.8],[-6.8,-19],[-9,-17.6],[-11.2,-20.2]]));
      p.F(M.flesh[2]); p.poly(W(sk,[[-10.8,-24.6],[-8.4,-25.8],[-7,-23.2],[-7.4,-20],[-9,-19],[-10.6,-20.8]])); p.F(M.flesh[1]); p.poly(W(sk,[[-10,-22.6],[-7.8,-23],[-7.6,-22.2],[-9.8,-21.8]]));
      p.F(form==='plenilunar'?M.bone[0]:M.bone[1]); [[-23.6],[-21]].forEach(([v])=>p.poly(W(sk,[[-10.6,v],[-6.8,v-0.8],[-6.8,v],[-10.6,v+0.8]])));
      p.F(M.acid[1]); p.poly(W(sk,[[-8.6,-17.4],[-7.4,-17.6],[-7.6,-11],[-8.2,-10.6]])); p.F(M.acid[0]); p.rect(Wp(sk,-8.2,-16).x,Wp(sk,-8.2,-16).y,0.6,1.4);
      if(form==='plenilunar'){ p.F(M.blood[1]); p.poly(W(sk,[[4,-14],[12,-16],[13,-4],[8,-2],[5,-6]])); p.F(M.blood[2]); p.poly(W(sk,[[6,-8],[11,-10],[12,-4],[8,-3]])); }
      if(form!=='comum'){ p.F(M.glow[1]); [[[-10.6,-25],[-12.6,-30],[-11.8,-30.4],[-10,-25.6]],[[-6,-18],[-2.6,-13],[-3.2,-12.4],[-6.4,-17.4]]].forEach(f=>p.poly(W(sk,f))); }
    });
    // alça da mochila por cima do ombro
    const st=W(sk,[[-3.4,-40.8],[0.6,-41],[5.6,-32],[6.4,-24],[3,-17],[-1,-15.4],[-1.6,-17.6],[2.4,-23.6],[2,-31],[-2,-38]]);
    p.F(M.pack[1]); p.poly(st); p.F(M.pack[2]); p.poly(W(sk,[[-1.6,-17.6],[2.4,-23.6],[2,-31],[-2,-38],[-1,-38.4],[3,-31],[3.6,-24],[0.2,-17]]));
    p.F(M.pack[0]); p.poly(W(sk,[[0.4,-40.2],[4.6,-32.4],[5.2,-26],[4.4,-26],[3.8,-32],[-0.4,-39.6]]));
    p.F(M.can[2]); { const q=Wp(sk,4.6,-28); p.rect(q.x-1.2,q.y-0.8,2.6,1.6); } p.F(M.can[0]); { const q=Wp(sk,4.6,-28); p.rect(q.x-0.8,q.y-0.6,1,0.5); }
    // cordão do capuz
    const s1=Wp(sk,8.6,-37.6), s2=Wp(sk,9.6,-26), s3=Wp(sk,11,-37), s4=Wp(sk,12.4,-28.4);
    p.F(M.hood[3]); p.cap(s1,s2,1,0.9); p.cap(s3,s4,1,0.9); p.F(M.can[1]); p.cap(s2,{x:s2.x,y:s2.y+2},1.3,1.2); p.cap(s4,{x:s4.x,y:s4.y+2},1.3,1.2);
  }

  /* ---------- cabeça: capuz levantado, boné de aba reta, máscara com filtros, olhos de lua ---------- */
  function drawHead(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.xf(sk.ha,sk.neck.x,sk.neck.y); c.scale(HS,HS);
    const PC=PCOL(M);
    // massa de trás do capuz (cai sobre os ombros)
    const hoodO=[[-10,6],[-12.6,-4],[-13,-14],[-10.6,-21.6],[-4.4,-26.4],[3,-27.4],[9.6,-25],[12.8,-20.6],[12.6,-17.6],[7,-18.2],[5,-13],[4.6,-5],[6.4,2.4],[3,6.4],[-5,7]];
    p.F(M.hood[1]); p.poly(hoodO);
    clip(c,hoodO,()=>{
      p.F(M.hood[2]); p.poly([[-14,8],[-14,-16],[-8,-22],[-6,-14],[-4,-4],[0,4],[4,8]]);
      p.F(M.hood[3]); p.poly([[-14,8],[-14,-10],[-11,-12],[-9,-2],[-6,8]]);
      p.F(M.hood[0]); p.poly([[-2,-25.6],[4,-27],[9.6,-24.6],[11.6,-21.4],[6,-22.6],[0,-23.6]]);
      p.F(M.hood[2]); p.poly([[2.4,-27],[3.2,-27],[-2.6,-16],[-5.6,-6],[-6.4,-6.4],[-3.4,-16.6]]); // costura do capuz
      p.F(M.hood[0]); p.poly([[-9,-18],[-6,-21.6],[-5.4,-20.8],[-8.4,-17.2]]);
      splash(p,PC[2],-6,-12,1.4,3); splash(p,PC[0],1,-21,1.1,1);
    });
    // borda de dentro do capuz (sombra funda em volta do rosto)
    p.F(M.hood[3]); p.poly([[4.4,-17.8],[7.4,-18.6],[6.6,-12],[6,-3.6],[6.8,2],[4.6,2.6],[4,-5],[4.4,-12]]);
    p.F(M.hood[2]); p.poly([[3.6,-18.2],[4.8,-18.2],[4.2,-11],[4,-3],[5,2.6],[3.8,3],[3,-4],[3.2,-11]]);
    // rosto (pele pálida) entre a aba e a máscara
    p.F(M.skin[1]); p.poly([[6,-16.2],[10.6,-16.6],[13.8,-14.8],[15,-11.6],[15.2,-8.6],[14.4,-4.8],[12.8,-1.2],[9,0.6],[6.4,0],[5.6,-6]]);
    p.F(M.skin[2]); p.poly([[6,-16.2],[8.4,-16.4],[7.6,-10],[7.4,-2],[6.4,0],[5.6,-6]]);
    p.F(M.skin[2]); p.poly([[7,-15.2],[15,-15.2],[15,-13.8],[7,-13.6]]); // sombra da aba
    // olhos de lua (brilham por cima da máscara)
    p.F(M.skin[3]); p.ell(10.8,-12.6,2.6,1.7); p.ell(14.2,-12.6,1.1,1.4);
    p.F(M.skin[3]); p.ell(11,-12.6,3,2); p.F(M.eye[2]); p.ell(11.1,-12.6,2.4,1.5); p.F(M.eye[1]); p.ell(11.3,-12.6,1.8,1.1); p.F(M.eye[0]); p.ell(11.4,-12.7,1,0.7);
    p.F(M.eye[2]); p.ell(14.2,-12.6,0.9,1.2); p.F(M.eye[0]); p.rect(14,-13.1,0.7,0.8);
    p.F(M.vein[1]); p.poly([[8,-12],[8.6,-12.2],[7.8,-9.6],[7.2,-9.8]]); p.poly([[8.6,-11],[9.2,-10.8],[9.8,-9.6],[9.2,-9.6]]);
    p.F(M.rot[1]); p.ell(7.8,-14.4,1.2,0.8);
    // boné de aba reta (por baixo do capuz)
    p.F(M.cap[1]); p.poly([[5,-21],[9.6,-21.4],[12.6,-18.2],[13,-16.4],[5.6,-16.6]]);
    p.F(M.cap[0]); p.poly([[6.4,-20.6],[9.4,-20.8],[11.4,-18.6],[8.4,-19.2]]);
    p.F(M.cap[2]); p.poly([[5,-17.6],[13,-17.4],[13,-16.4],[5.6,-16.6]]);
    p.F(M.cap[1]); p.poly([[6,-17],[18.6,-17.6],[18.8,-16],[6.2,-15.4]]); // aba
    p.F(M.cap[0]); p.poly([[8,-17.2],[18.4,-17.6],[18.4,-17],[8,-16.6]]);
    p.F(M.cap[3]); p.poly([[6.2,-15.8],[18.8,-16.4],[18.8,-16],[6.2,-15.4]]);
    splash(p,PC[1],15.6,-16.8,0.8,2);
    // máscara semifacial com filtros
    const md=P.mask>=0.5?4.2:0;
    if(md){ // boca podre aparecendo
      p.F(M.mouth[1]); p.poly([[8.6,-8],[14.4,-8.4],[14.6,-5.6],[9,-5]]); p.F(M.mouth[3]); p.ell(11.4,-6.4,1.6,0.9);
      p.F(M.teeth[1]); [[9.6,-8.2,1,1.4],[11.2,-8.3,1,1.2],[12.8,-8.4,1,1.5],[10.4,-6,1,1.1],[12,-6.1,1,1.2]].forEach(([x,y,w,h])=>p.rect(x,y,w,h));
      p.F(M.skin[0]); p.rect(14.6,-10.2,1,1.4);
      p.F(M.acid[1]); p.poly([[13.4,-5.4],[14.2,-5.6],[14,-2.6],[13.6,-2.4]]);
    }
    p.F(M.mask[1]); p.poly([[6.4,-10.6+md],[11,-11+md],[14.6,-9.6+md],[16.4,-7+md],[16.2,-3.6+md],[14.6,-0.6+md],[11,0.6+md],[7.4,-0.6+md],[6,-4.4+md]]);
    p.F(M.mask[2]); p.poly([[6,-4.4+md],[16.2,-4+md],[14.6,-0.6+md],[11,0.6+md],[7.4,-0.6+md]]);
    p.F(M.mask[0]); p.poly([[9,-10.4+md],[13.6,-9.6+md],[15.4,-7.6+md],[12.4,-8.6+md]]);
    p.F(M.mask[3]); p.poly([[6.4,-10.6+md],[7.6,-10.6+md],[7,-4.4+md],[7.8,-0.4+md],[7.4,-0.6+md],[6,-4.4+md]]);
    // válvula de exalação na frente
    p.F(M.mask[2]); p.circle({x:15,y:-4.4+md},2.2); p.F(M.mask[3]); [[-5.4],[-4.4],[-3.4]].forEach(([y])=>p.rect(14,y+md,2,0.5)); p.F(M.mask[0]); p.rect(14.2,-6.4+md,1.4,0.5);
    // filtro do lado de cá (cartucho amarelo com grade)
    p.F(M.filt[3]); p.ell(9.4,-4.4+md,3.9,4.1); p.F(M.filt[2]); p.ell(9.6,-4.4+md,3.4,3.7); p.F(M.filt[1]); p.ell(9.9,-4.6+md,2.7,3);
    p.F(M.filt[3]); [[-6.4],[-5],[-3.6],[-2.2]].forEach(([y])=>p.rect(8.2,y+md,3.4,0.5)); p.F(M.filt[0]); p.poly([[8.2,-7.4+md],[10.6,-7.6+md],[11.2,-7+md],[8.6,-6.8+md]]);
    // filtro do lado de lá aparecendo na frente
    p.F(M.filt[2]); p.poly([[15.6,-1.8+md],[17.4,-2.6+md],[17.6,0.2+md],[16,0.8+md]]); p.F(M.filt[1]); p.rect(16.2,-1.8+md,0.8,2);
    // alça entrando no capuz
    p.F(M.mask[3]); p.cap({x:6.6,y:-7.8+md},{x:4.4,y:-8.8},1.4,1.4);
    // queixo e pingo de tinta escorrendo de baixo da máscara
    if(!md){ p.F(M.skin[2]); p.poly([[8,0.6],[12.4,-0.4],[12,1.8],[8.6,2.4]]); }
    const L=1.6+(P.drip%4)*1.1; p.F(M.acid[1]); p.poly([[11.6,0.4+md],[12.6,0.2+md],[12.4,0.4+md+L],[11.8,0.8+md+L]]); p.ell(12.1,0.8+md+L,0.8,0.8);
    if(form!=='comum'){ p.F(M.glow[0]); p.rect(10.6,-13,1.6,0.8); }
    // bandana no pescoço
    p.F(M.band[1]); p.poly([[2.6,0.8],[9.4,2],[10.6,4.4],[6,7.6],[1.4,5.6]]);
    p.F(M.band[2]); p.poly([[1.4,5.6],[6,7.6],[10.6,4.4],[9.6,6],[5.4,8.6]]); p.F(M.band[0]); p.poly([[4,1.4],[8.6,2.4],[8.2,3],[4,2.2]]);
    p.F(M.band[3]); [[4.6,4.2],[7.4,4.6]].forEach(([x,y])=>p.rect(x,y,0.8,0.8));
    p.id();
  }

  /* ---------- efeitos dentro do quadro ---------- */
  function drawSpray(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id(); const R=M.mist, N=sk.noz, a=sk.sprA, L=54*P.spray, d={x:Math.cos(a),y:Math.sin(a)}, n={x:-d.y,y:d.x};
    const cl=(x,y)=>({x:Math.max(1,Math.min(FW-2,x)),y:Math.max(1,Math.min(GROUND,y))});
    const pts=[]; // tufos de névoa soltos ao longo do cone (borda irregular, não um balão liso)
    for(let k=0;k<=11;k++){ const t=k/11, j=((k*37)%7-3)/3, r=1.2+L*0.2*t+(k%3)*0.7*t, cx=N.x+d.x*(3+L*t), cy=N.y+d.y*(3+L*t); pts.push({cx:cx+n.x*j*L*0.22*t,cy:cy+n.y*j*L*0.22*t,r}); }
    pts.forEach(({cx,cy,r})=>{ p.F(R[2]); const q=cl(cx+n.x*r*0.25,cy+n.y*r*0.25+r*0.15); p.ell(q.x,q.y,r*1.05,r*0.9); });
    pts.forEach(({cx,cy,r})=>{ p.F(R[1]); const q=cl(cx-n.x*r*0.1,cy-n.y*r*0.1-r*0.1); p.ell(q.x,q.y,r*0.82,r*0.68); });
    pts.forEach(({cx,cy,r},k)=>{ if(k<2||k%2) return; p.F(R[0]); const q=cl(cx-r*0.35,cy-r*0.42); p.ell(q.x,q.y,r*0.34,r*0.22); });
    p.F(R[1]); for(let k=0;k<9;k++){ const t=0.5+0.07*k, s=((k*37)%11-5)/5, q=cl(N.x+d.x*(L*t+6)+n.x*s*L*0.42, N.y+d.y*(L*t+6)+n.y*s*L*0.42); p.circle(q,0.8+((k*13)%3)*0.35); }
    p.F(R[3]); p.circle(cl(N.x+d.x*2,N.y+d.y*2),1.4);
  }
  // glifo inventado: olho de lua estilizado (anel, crescente, pupila em losango, raios) — local, centro (0,0)
  function drawGlyphLocal(p,M,rx,ry,prog,pulse){
    const G=M.glyph, segs=Math.max(0,Math.min(1,prog));
    const ring=(r0,r1,col,a0,a1)=>{ const n=28, pts=[]; for(let i=0;i<=n;i++){ const a=a0+(a1-a0)*i/n; pts.push([Math.cos(a)*rx*r1,Math.sin(a)*ry*r1]); } for(let i=n;i>=0;i--){ const a=a0+(a1-a0)*i/n; pts.push([Math.cos(a)*rx*r0,Math.sin(a)*ry*r0]); } p.F(col); p.poly(pts); };
    const A0=-PI/2;
    // anel externo (traço de spray, desenhado em sentido horário conforme o progresso)
    ring(0.86,1,G[2],A0,A0+PI*2*Math.min(1,segs*1.6));
    ring(0.89,0.97,G[1],A0,A0+PI*2*Math.min(1,segs*1.6));
    if(segs>0.35){ // olho (amêndoa) + crescente
      const k=Math.min(1,(segs-0.35)/0.35), w=0.62*k;
      p.F(G[2]); p.poly([[-rx*w,0],[-rx*w*0.4,-ry*0.42],[rx*w*0.4,-ry*0.42],[rx*w,0],[rx*w*0.4,ry*0.42],[-rx*w*0.4,ry*0.42]]);
      p.F(G[1]); p.poly([[-rx*w*0.86,0],[-rx*w*0.34,-ry*0.32],[rx*w*0.34,-ry*0.32],[rx*w*0.86,0],[rx*w*0.34,ry*0.32],[-rx*w*0.34,ry*0.32]]);
      p.F(G[3]); p.poly([[-rx*w*0.5,0],[-rx*w*0.2,-ry*0.2],[rx*w*0.2,-ry*0.2],[rx*w*0.5,0],[rx*w*0.2,ry*0.2],[-rx*w*0.2,ry*0.2]]);
    }
    if(segs>0.7){ // pupila em losango brilhando + raios
      const k=Math.min(1,(segs-0.7)/0.3);
      p.F(G[0]); p.poly([[0,-ry*0.2*k],[rx*0.1*k,0],[0,ry*0.2*k],[-rx*0.1*k,0]]);
      p.F(G[1]); [[0],[PI*0.5],[PI],[PI*1.5]].forEach(([a])=>{ const c0=Math.cos(a), s0=Math.sin(a); p.poly([[c0*rx*1.02-s0*rx*0.04,s0*ry*1.02+c0*ry*0.06],[c0*rx*(1.18+0.06*pulse),s0*ry*(1.18+0.06*pulse)],[c0*rx*1.02+s0*rx*0.04,s0*ry*1.02-c0*ry*0.06]]); });
      p.F(G[2]); [[0.8],[2.3],[3.9],[5.5]].forEach(([a])=>{ p.ell(Math.cos(a)*rx*1.08,Math.sin(a)*ry*1.08,1.2,0.8); }); // respingos
    }
    if(pulse>0.5){ p.F(G[0]); p.rect(-rx*0.3,-ry*0.93,rx*0.18,0.8); p.rect(rx*0.5,ry*0.78,rx*0.14,0.8); }
  }
  function drawGlyphFrame(c,u,M,sk,P){
    const p=mkPen(c,u); p.id(); const gx=AX+48, gy=GROUND-1;
    p.xf(0,gx,gy); drawGlyphLocal(p,M,30,9,P.gly,0); p.id();
  }
  function drawSmear(c,u,M,sk,P){
    const p=mkPen(c,u); p.id();
    const sh=sk.shF, w=sk.canTop, r=Math.hypot(w.x-sh.x,w.y-sh.y)+2, a1=Math.atan2(w.y-sh.y,w.x-sh.x);
    const n=10, pts=[]; for(let i=0;i<=n;i++){ const a=a1-1.5+1.55*i/n; pts.push([sh.x+Math.cos(a)*r,sh.y+Math.sin(a)*r]); }
    for(let i=n;i>=0;i--){ const a=a1-1.5+1.55*i/n, rr=r-2-8*(i/n); pts.push([sh.x+Math.cos(a)*rr,sh.y+Math.sin(a)*rr]); }
    p.F(M.swish[0]); p.poly(pts.map(([x,y])=>[Math.max(1,Math.min(FW-2,x)),Math.max(1,Math.min(GROUND,y))]));
    p.F(M.swish[2]); const q=pts.slice(n-3,n+1); for(let k=0;k<q.length-1;k++) p.cap({x:q[k][0],y:q[k][1]},{x:q[k+1][0],y:q[k+1][1]},0.9,0.9);
  }
  function drawBurst(c,u,M,sk,P){
    const p=mkPen(c,u); p.id(); const h=sk.hand, b=P.burst, PC=PCOL(M);
    for(let k=0;k<11;k++){ const a=k/11*PI*2+0.3, r=(6+((k*7)%5)*2.4)*b, q={x:h.x+Math.cos(a)*r,y:Math.min(GROUND-1,h.y+Math.sin(a)*r*0.9)}; p.F(PC[k%4][1]); p.circle(q,1.4+((k*5)%3)*0.7*b); p.F(PC[k%4][0]); p.rect(q.x-0.6,q.y-0.8,0.9,0.6); }
    p.F(M.can[1]); p.poly([[h.x-3,h.y-2],[h.x+1,h.y-5],[h.x+3,h.y-1],[h.x-1,h.y+2]]); p.F(M.can[3]); p.poly([[h.x-1,h.y-1],[h.x+1.6,h.y-3],[h.x+2,h.y-1.6]]); // lata rasgada
    p.F(M[PAINT_OF.cur][0]); p.circle(h,2.6*b+1);
  }
  const PAINT_OF={cur:'p4'};
  function drawSplat(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id(); const s=P.splat, cx=AX+14, cy=GROUND-1.4, PC=PCOL(M), main=M[PAINT[form]];
    p.F(main[2]); p.ell(cx,cy,30*s,4.4*s); p.F(main[1]); p.ell(cx+2,cy-0.4,26*s,3.4*s);
    [[-22,0.8,0],[18,0.6,1],[-8,1.6,2],[28,1.4,3],[6,-1.2,1]].forEach(([dx,dy,ci],i)=>{ p.F(PC[ci][1]); p.ell(cx+dx*s,cy+dy,(4+i%3)*s,1.6*s); p.F(PC[ci][0]); p.rect(cx+dx*s-1,cy+dy-0.8,1.6,0.6); });
  }

  /* ---------- adereços ---------- */
  const PROP={
    xCloud:{PW:150,PH:96,G:80,AXp:8},
    xGlyph:{PW:168,PH:60,G:32,AXp:84},
    xCan:{PW:40,PH:24,G:18,AXp:20},
  };
  function frameProp(form,anim,st,K){
    const M=mats(form), D=PROP[anim], parts=[];
    if(anim==='xCloud'){
      // nuvem de tinta: cone de névoa (≈70 px de jogo = 140 unidades) que deriva e se desfaz
      const R=M.mist, s=st%4, puffs=[];
      for(let k=0;k<9;k++){ const t=k/8, x=D.AXp+8+t*124+s*2, y=D.G-34-Math.sin(t*PI)*4+(k%2?3:-3)+s*0.6, r=5+t*16+(k%3)*2; puffs.push({x,y,r}); }
      parts.push({noRim:true, draw:(c,u)=>{ const p=mkPen(c,u); p.id();
        puffs.forEach(q=>{ p.F(R[2]); p.ell(q.x,q.y+q.r*0.15,q.r*1.05,q.r*0.86); });
        puffs.forEach(q=>{ p.F(R[1]); p.ell(q.x-q.r*0.12,q.y-q.r*0.08,q.r*0.84,q.r*0.66); });
        puffs.forEach((q,k)=>{ if(k%2) return; p.F(R[0]); p.ell(q.x-q.r*0.36,q.y-q.r*0.34,q.r*0.32,q.r*0.22); });
        p.F(R[1]); for(let k=0;k<14;k++){ const x=D.AXp+20+((k*53+s*17)%126), y=D.G-12+((k*29+s*7)%14)-6; p.circle({x,y},0.8+(k%3)*0.4); } // pingos caindo
        p.F(R[3]); for(let k=0;k<5;k++){ const x=D.AXp+30+k*22+s*3; p.rect(x,D.G-4,2+(k%2),1); } // respingos no chão
      }});
    } else if(anim==='xGlyph'){
      parts.push({noShade:true, draw:(c,u)=>{ const p=mkPen(c,u); p.xf(rad((st%4)*2-3)*0.1,D.AXp,D.G); drawGlyphLocal(p,M,72,22,1,st%2); p.id(); }});
    } else {
      // lata caída e poça de tinta
      parts.push({draw:(c,u)=>{ const p=mkPen(c,u); p.id(); const PC=M[PAINT[form]]; p.F(PC[2]); p.ell(D.AXp+4,D.G-0.6,12,2.4); p.F(PC[1]); p.ell(D.AXp+6,D.G-1,8,1.6);
        p.xf(rad(84+(st%2)*6),D.AXp-2,D.G-4); drawCanLocal(p,M,form,{dull:true}); p.id(); }});
    }
    const cv=compose({FW:Math.round(D.PW*K),FH:Math.round(D.PH*K),GROUND:D.PH*K,parts,M,step:5,flash:0,rim:RIM[form]});
    cv._ax=D.AXp*K; cv._gy=D.G*K; return cv;
  }

  /* ---------- montagem ---------- */
  const cache=PIX.cache();
  function frame(form,anim,fi,step=5,Pov,pk){
    const K=PIX.getK(), key=(pk!=null?'#'+pk+'|'+form:form+'|'+anim+'|'+fi+'|'+step)+'@'+K;
    const hit=cache.get(key); if(hit){ cache.delete(key); cache.set(key,hit); return hit; }
    if(ANIMS[anim]&&ANIMS[anim].prop){ const st=Pov&&Pov.st!=null?Math.round(Pov.st):fi; const cv=frameProp(form,anim,st,K); cache.set(key,cv); return cv; }
    const P=Pov?Object.assign({},REST,Pov):poseOf(anim,fi), M=mats(form), sk=skeleton(P);
    PAINT_OF.cur=PAINT[form];
    const parts=[];
    if(P.splat>0.05) parts.push({noShade:true, noRim:true, draw:(c,u)=>drawSplat(c,u,M,sk,P,form)});
    if(P.gly>0.05) parts.push({noShade:true, noRim:true, draw:(c,u)=>drawGlyphFrame(c,u,M,sk,P)});
    parts.push(
      {back:true, draw:(c,u)=>drawArm(c,u,M,sk,P,false,form)},
      {back:true, draw:(c,u)=>drawLeg(c,u,M,sk,P,false)},
      {draw:(c,u)=>drawPack(c,u,M,sk,P,form)},
      {draw:(c,u)=>drawLeg(c,u,M,sk,P,true)},
      {draw:(c,u)=>drawTorso(c,u,M,sk,P,form)},
      {draw:(c,u)=>drawHead(c,u,M,sk,P,form)},
    );
    if(P.smear>=0.5) parts.push({noShade:true, smear:true, noRim:true, draw:(c,u)=>drawSmear(c,u,M,sk,P)});
    parts.push({draw:(c,u)=>drawArm(c,u,M,sk,P,true,form)});
    if(P.spray>0.05) parts.push({smear:true, noRim:true, draw:(c,u)=>drawSpray(c,u,M,sk,P,form)});
    if(P.burst>0.05) parts.push({noShade:true, smear:true, noRim:true, draw:(c,u)=>drawBurst(c,u,M,sk,P)});
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM[form]}); if(step>=4) heavyOutline(cv);
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._eye=sc(sk.H(11,-12.6)); cv._mouth=sc(sk.H(15,-4.4)); cv._hand=sc(sk.wrF); cv._head=sc(sk.H(4,-13)); cv._nozzle=sc(sk.noz); cv._handB=sc(sk.wrB);
    cache.set(key,cv); if(cache.size>900) cache.delete(cache.keys().next().value);
    return cv;
  }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame,framePose:function(form,anim,P,key){ return frame(form,anim,0,5,P,key); }};
})();
