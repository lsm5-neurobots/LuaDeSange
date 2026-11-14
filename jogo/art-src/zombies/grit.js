/* GRIT — fonte de arte (editável). Build: npm run art
   Gritador: ex-vendedor de picolé da praia, magro e comprido, boca rasgada até a orelha e papo da garganta
   inflado. Camisa de botão aberta (costelas à mostra), boné virado, bermuda cáqui, tênis de lona e o megafone
   quebrado pendurado na alça. Foge e grita chamando a horda. Hi-bit: honra PIX.getK(). */
const GRIT=(function(){
  const {rad,lerp,P2,ik,mkPen,compose}=PIX;
  const FW=184, FH=156, GROUND=148, AX=82;
  const RIM={comum:'#c4dcf4', enluarado:'#9ff6ff', plenilunar:'#ffb46a'};

  /* ---------- materiais ---------- */
  function mats(form){
    const m={
      skin:['#e2ecc0','#a8ba8c','#6a7e64','#3a4650'],
      rot:['#b6ae86','#857862','#5a4c4e','#342a38'],
      flesh:['#f6ae94','#d0645e','#8e3446','#521c34'],
      bone:['#fff4d8','#dccfa6','#a09070','#605040'],
      sac:['#f8e0d0','#dca8a0','#a06e7c','#5c3c54'],
      shirt:['#a8eadc','#4eb4aa','#2e7682','#1c4254'],
      print:['#fff6b8','#f4c84a','#b8822c','#6a4420'],
      shorts:['#ead49e','#b89a62','#7c6246','#46342a'],
      cap:['#ffa684','#e44c3a','#982a34','#521a2a'],
      capw:['#fffbea','#dcd6c6','#9e98a6','#5e5872'],
      mega:['#fffbe6','#e4d8b2','#a69a84','#5e5664'],
      grille:['#e8eef4','#98a6b8','#5c6880','#30384e'],
      strap:['#9a8670','#665446','#42342e','#241a1e'],
      shoe:['#a4ccf4','#4c7cd4','#30509c','#1c2c60'],
      sole:['#fffaea','#d8d0ba','#989078','#564e44'],
      hair:['#6a5e4e','#443a30','#2a2420','#161212'],
      eye:['#ffffff','#ece8dc','#aca89c','#68645e'],
      mouth:['#7c2e3e','#4c1828','#2e0c1a','#1a0610'],
      teeth:['#fbf0c0','#d8c27c','#9a8650','#5e4e30'],
      blood:['#c84a3e','#8e2a2c','#5e1824','#3a0e1a'],
      nail:['#8a7a62','#54463c','#342a28','#1c1618'],
      glow:['#fffbe0','#ffe6a0','#e8a860','#9a5a3c'],
    };
    if(form==='enluarado'){
      m.skin=['#dcdcff','#9ea0e2','#666aac','#3c3a76']; m.rot=['#b8a6e0','#8470b0','#56468a','#33285e'];
      m.flesh=['#f0b0ff','#b866d8','#7a3a9e','#46206a']; m.blood=['#b46ad8','#7e3ea6','#542474','#34144a'];
      m.sac=['#f0e4ff','#c4a8ec','#8a6cb8','#4c3a7a']; m.glow=['#effffe','#7af4ff','#2ab0d8','#146a96'];
      m.eye=['#ffffff','#b8fbff','#4ad8f0','#1a8aa8'];
      m.shirt=['#b4f2ff','#5cc2dc','#3a7caa','#22466e']; m.shorts=['#c8c0d8','#928aaa','#605a7e','#383454'];
      m.cap=['#9ac8ff','#4a7ae0','#30489c','#1c2860'];
    }
    if(form==='plenilunar'){
      m.skin=['#ffcaa6','#e2806a','#a4424e','#5e1e36']; m.rot=['#d0806a','#9a4a4a','#682a3a','#3e1628'];
      m.flesh=['#ffc07a','#f06a3a','#a8302e','#5e1422']; m.blood=['#ff7a3a','#d43a26','#8a1c22','#4e0c18'];
      m.sac=['#ffe0b0','#f0a070','#b05a4a','#682a34']; m.glow=['#fff6c0','#ffb43a','#e0581e','#8a2414'];
      m.eye=['#fffbe0','#ffe04a','#ff8a2a','#b83a14'];
      m.shirt=['#7ec8c0','#3e8890','#2a5468','#1a3040']; m.shorts=['#d8b48a','#a07a5a','#6a4a40','#3c2a2a'];
      m.cap=['#3e3a4c','#26222e','#18141e','#0c0a10'];
    }
    return punch(m);
  }
  const NAMES={skin:'Pele',rot:'Podridão',flesh:'Carne',bone:'Costelas',sac:'Papo da garganta',shirt:'Camisa aberta',print:'Estampa',shorts:'Bermuda cáqui',cap:'Boné',mega:'Megafone',grille:'Grade do megafone',strap:'Alça',shoe:'Tênis de lona',sole:'Sola',eye:'Olho',teeth:'Dentes',blood:'Sangue',glow:'Brilho do grito'};
  function sat(h,k){ const [r,g,b]=PIX.hexRgb(h), y=(r+g+b)/3; return PIX.toHex(y+(r-y)*k,y+(g-y)*k,y+(b-y)*k); }
  const NOPUNCH={glow:1,eye:1};
  function punch(m){ const o={}; for(const k in m){ const r=m[k]; o[k]=NOPUNCH[k]?[r[0],r[1],r[2],r[3]]:[sat(r[0],1.1),sat(r[1],1.18),PIX.mix(sat(r[2],1.12),'#2a1a4c',0.22),PIX.mix(r[3],'#140a24',0.36)]; } return o; }

  /* ---------- poses ---------- */
  // ângulos: 0 = pendurado, + = pra frente. th = papo da garganta (0..1.4). ring = ondas do grito.
  const REST={hx:0,rot:0,lift:0,lean:12,hunch:30,head:-26,jaw:26,th:0.62,aFs:8,aFe:22,aBs:0,aBe:14,lFh:16,lFk:-8,lBh:-12,lBk:-24,fF:0,fB:0,flash:0,ring:0,swing:0,flap:0,megaUp:0,grip:0,shiver:0,eyeW:0,burst:0};
  const S=Math.sin, C=Math.cos, PI=Math.PI, mx=Math.max;
  const ANIMS={
    idle:{nome:'Parado (papo pulsando)',n:8,dur:()=>140,pose:i=>{ const p=i/8*PI*2, s=S(p);
      return {hunch:30+3*s, lean:12+1.2*s, head:-26+4*S(p-0.8)+(i===5?-6:0), jaw:24+8*mx(0,S(p*2-0.4)), th:0.56+0.22*(S(p-0.5)+1)/2,
        aFs:8+4*S(p-0.6), aFe:22+7*S(p-1.1), aBs:0+3*S(p-0.3), aBe:14+5*S(p-0.8), hx:0.5*S(p+0.5), swing:4*S(p-1.2), eyeW:i===5?1:0}; }},
    walk:{nome:'Andar (esgueirando)',n:8,dur:()=>115,pose:i=>{ const p=i/8*PI*2;
      const lFh=10+24*S(p), lBh=-10+18*S(p+PI);
      return {lFh, lFk:lFh-30*mx(0,C(p))-4, lBh, lBk:lBh-12-16*mx(0,C(p+PI)), fF:-14*mx(0,C(p)), fB:24*mx(0,C(p+PI)),
        lean:14+3*Math.abs(S(p)), hunch:30+3*S(2*p-0.6), head:-26+6*S(2*p-1.4), jaw:24+6*S(2*p-1.8), th:0.5+0.08*S(2*p), hx:1.2*S(2*p),
        aFs:8-18*S(p), aFe:24-18*S(p-0.5), aBs:0+16*S(p), aBe:16+16*S(p-0.5), swing:-10*S(p-0.6), flap:0.3+0.3*S(2*p)}; }},
    flee:{nome:'Fugir (pânico)',n:8,dur:()=>80,pose:i=>{ const p=i/8*PI*2;
      const lFh=14+40*S(p), lBh=14+40*S(p+PI);
      return {lFh, lFk:lFh-12-64*mx(0,C(p)), lBh, lBk:lBh-12-64*mx(0,C(p+PI)), fF:-26*mx(0,C(p))+20*mx(0,-C(p)), fB:-26*mx(0,C(p+PI))+20*mx(0,-C(p+PI)),
        lean:22+3*S(2*p), hunch:10+4*S(2*p-0.5), head:-40+8*S(2*p-1), jaw:46+10*S(2*p), th:0.5+0.15*S(2*p), lift:4*mx(0,S(2*p-0.4)),
        aFs:150+30*S(p), aFe:175+20*S(p-0.4), aBs:140-30*S(p), aBe:170-20*S(p-0.4), swing:-40-24*S(2*p), flap:1+0.4*S(2*p), eyeW:1}; }},
    attack:{nome:'Gritar (chama a horda)',n:10,screamAt:5,dur:i=>[150,170,170,200,80,120,120,140,160,150][i],pose:i=>[
      {hunch:28,lean:12,head:-14,jaw:10,th:0.36,aFs:16,aFe:30,aBs:8,aBe:20,eyeW:1},
      {hunch:16,lean:2,head:-40,jaw:14,th:0.7,aFs:-16,aFe:-4,aBs:-22,aBe:-10,hx:-2,lFh:12,lBh:-16},
      {hunch:8,lean:-6,head:-56,jaw:10,th:1.02,aFs:-34,aFe:-24,aBs:-40,aBe:-30,hx:-4,lFh:10,lFk:-2,lBh:-18,lBk:-28,flap:0.4},
      {hunch:6,lean:-8,head:-60,jaw:8,th:1.18,aFs:-40,aFe:-30,aBs:-46,aBe:-36,hx:-4,lFh:10,lFk:-2,lBh:-18,lBk:-28,shiver:1,flap:0.4,grip:1},
      {hunch:30,lean:16,head:-18,jaw:16,th:1.24,aFs:-30,aFe:-10,aBs:-36,aBe:-16,hx:2,lFh:22,lFk:2,lBh:-20,lBk:-32,grip:1},
      {hunch:10,lean:4,head:-46,jaw:78,th:1.4,aFs:-56,aFe:-60,aBs:-62,aBe:-66,hx:3,lFh:24,lFk:4,lBh:-22,lBk:-34,ring:1,flap:1,grip:1,eyeW:1},
      {hunch:10,lean:4,head:-48,jaw:80,th:1.3,aFs:-58,aFe:-64,aBs:-64,aBe:-70,hx:3,lFh:24,lFk:4,lBh:-22,lBk:-34,ring:2,flap:1.2,grip:1,eyeW:1,shiver:1},
      {hunch:12,lean:5,head:-44,jaw:76,th:1.1,aFs:-54,aFe:-58,aBs:-60,aBe:-64,hx:3,lFh:24,lFk:4,lBh:-22,lBk:-34,ring:3,flap:0.8,grip:1,eyeW:1},
      {hunch:22,lean:10,head:-30,jaw:40,th:0.6,aFs:-10,aFe:6,aBs:-16,aBe:0,hx:1,lFh:18,lBh:-14},
      {hunch:30,lean:12,head:-26,jaw:22,th:0.5}][i]},
    scream:{nome:'Chamar no megafone (loop)',n:6,loop:true,ringAt:[1,3,5],dur:i=>[130,110,130,110,130,110][i],pose:i=>{ const o=i%2;
      return {megaUp:1,hunch:14,lean:6,head:-34+(o?-3:0),jaw:58+(o?10:0),th:1+(o?0.3:0.1),aBs:-40-(o?6:0),aBe:-50-(o?8:0),hx:1,lFh:20,lFk:0,lBh:-18,lBk:-30,ring:o?1+((i>>1)%3):0,shiver:o,flap:0.5+0.3*o,eyeW:1}; }},
    // ---- ataques extras (de perto, quando encurralado) ----
    shove:{nome:'Empurrão desesperado',n:7,hit:3,reach:30,dur:i=>[120,140,50,150,130,130,140][i],pose:i=>[
      {hunch:24,lean:8,head:-34,jaw:40,th:0.6,aFs:40,aFe:60,aBs:30,aBe:50,hx:-1,eyeW:1},
      {hunch:14,lean:-8,head:-30,jaw:50,th:0.7,aFs:70,aFe:120,aBs:60,aBe:110,hx:-5,lFh:10,lFk:-6,lBh:-16,lBk:-28,eyeW:1,shiver:1},
      {hunch:20,lean:30,head:-40,jaw:60,th:0.8,aFs:90,aFe:90,aBs:84,aBe:84,hx:8,lFh:30,lFk:4,lBh:-26,lBk:-40,flap:0.6,eyeW:1},
      {hunch:22,lean:36,head:-42,jaw:56,th:0.8,aFs:96,aFe:94,aBs:90,aBe:88,hx:12,lFh:34,lFk:6,lBh:-30,lBk:-44,flap:0.8,eyeW:1},
      {hunch:26,lean:24,head:-34,jaw:40,th:0.7,aFs:60,aFe:70,aBs:50,aBe:60,hx:8,lFh:26,lFk:2,lBh:-22,lBk:-36},
      {hunch:28,lean:14,head:-28,jaw:30,th:0.6,aFs:24,aFe:36,aBs:14,aBe:26,hx:3},
      {hunch:30,lean:12,head:-26,jaw:24,th:0.55}][i]},
    shriek:{nome:'Grito curto de perto (atordoa)',n:8,hit:4,reach:46,dur:i=>[130,150,170,60,130,150,140,140][i],pose:i=>[
      {hunch:24,lean:10,head:-20,jaw:14,th:0.6,aFs:10,aFe:20,aBs:4,aBe:14,eyeW:1},
      {hunch:12,lean:-4,head:-48,jaw:10,th:1.0,aFs:-20,aFe:-10,aBs:-26,aBe:-16,hx:-3,lFh:12,lBh:-16,flap:0.4},
      {hunch:6,lean:-10,head:-58,jaw:6,th:1.3,aFs:-36,aFe:-26,aBs:-42,aBe:-32,hx:-4,lFh:10,lBh:-18,lBk:-28,shiver:1,flap:0.5},
      {hunch:26,lean:26,head:-20,jaw:70,th:1.5,aFs:-50,aFe:-56,aBs:-56,aBe:-62,hx:6,lFh:28,lFk:4,lBh:-24,lBk:-36,ring:1,flap:1.2,eyeW:1},
      {hunch:28,lean:30,head:-16,jaw:82,th:1.6,aFs:-56,aFe:-64,aBs:-62,aBe:-70,hx:8,lFh:30,lFk:6,lBh:-26,lBk:-38,ring:2,flap:1.3,eyeW:1,shiver:1},
      {hunch:26,lean:26,head:-20,jaw:70,th:1.2,aFs:-50,aFe:-56,aBs:-56,aBe:-62,hx:6,lFh:28,lFk:4,lBh:-24,lBk:-36,ring:3,flap:0.8,eyeW:1},
      {hunch:24,lean:14,head:-30,jaw:36,th:0.6,aFs:-10,aFe:6,aBs:-16,aBe:0,hx:2},
      {hunch:30,lean:12,head:-26,jaw:24,th:0.5}][i]},
    hurt:{nome:'Dano (cabeça)',n:4,dur:i=>[80,110,130,150][i],pose:i=>[
      {lean:-12,hunch:6,head:-50,jaw:50,th:0.6,aFs:-40,aFe:-20,aBs:-46,aBe:-28,hx:-7,flash:1,lFh:14,lBh:-2,swing:30,flap:0.8},
      {lean:-8,hunch:10,head:-44,jaw:44,th:0.5,aFs:-30,aFe:-6,aBs:-34,aBe:-14,hx:-6,lFh:12,lBh:-4,swing:22,flap:0.6},
      {lean:2,hunch:18,head:-32,jaw:30,th:0.4,aFs:-4,aFe:12,aBs:-10,aBe:6,hx:-2,swing:8},
      {lean:11,hunch:29,head:-26,jaw:22,th:0.48}][i]},
    hurtB:{nome:'Dano (barriga)',n:4,dur:i=>[80,120,140,150][i],pose:i=>[
      {lean:36,hunch:44,head:-2,jaw:46,th:0.1,aFs:50,aFe:20,aBs:42,aBe:10,hx:-7,flash:1,lFh:22,lFk:-12,lBh:-12,lBk:-30,swing:-30},
      {lean:32,hunch:42,head:-6,jaw:40,th:0.12,aFs:46,aFe:24,aBs:38,aBe:14,hx:-6,lFh:20,lFk:-10,lBh:-12,lBk:-28,swing:-20},
      {lean:20,hunch:34,head:-16,jaw:30,th:0.22,aFs:28,aFe:30,aBs:20,aBe:22,hx:-3},
      {lean:12,hunch:30,head:-26,jaw:22,th:0.46,hx:-1}][i]},
    fall:{nome:'Derrubado',n:6,dur:i=>[90,90,90,110,140,260][i],pose:i=>[
      {lean:-14,hunch:6,head:-40,jaw:56,th:0.6,aFs:-50,aFe:-30,aBs:-56,aBe:-40,hx:-6,flash:1,lFh:22,lBh:0,swing:40,flap:1},
      {rot:-30,lean:-4,hunch:8,head:-30,jaw:50,aFs:-80,aFe:-60,aBs:-90,aBe:-70,hx:-4,lFh:44,lFk:30,lBh:24,lBk:10,swing:40,flap:1},
      {rot:-62,lean:0,hunch:10,head:-20,jaw:44,aFs:-120,aFe:-120,aBs:-60,aBe:-40,hx:-6,lFh:54,lFk:40,lBh:34,lBk:24,swing:30,flap:0.6},
      {rot:-90,lean:4,hunch:12,head:-8,jaw:50,aFs:-150,aFe:-168,aBs:-22,aBe:-8,hx:2,lFh:44,lFk:12,lBh:30,lBk:4,swing:0},
      {rot:-84,lean:2,hunch:16,head:-16,jaw:40,aFs:-156,aFe:-172,aBs:-18,aBe:-4,hx:2,lFh:50,lFk:22,lBh:34,lBk:10},
      {rot:-90,lean:0,hunch:14,head:-10,jaw:46,aFs:-160,aFe:-176,aBs:-20,aBe:-6,hx:2,lFh:42,lFk:8,lBh:26,lBk:0}][i]},
    getup:{nome:'Levantar',n:6,dur:i=>[200,170,170,160,160,150][i],pose:i=>[
      {rot:-90,lean:0,hunch:14,head:-10,jaw:46,aFs:-160,aFe:-176,aBs:-20,aBe:-6,hx:2,lFh:42,lFk:8,lBh:26,lBk:0},
      {rot:-60,lean:10,hunch:24,head:-28,jaw:30,aFs:-50,aFe:-10,aBs:-60,aBe:-20,hx:-8,lFh:94,lFk:10,lBh:74,lBk:0},
      {rot:-30,lean:20,hunch:28,head:-36,jaw:26,aFs:-10,aFe:10,aBs:-20,aBe:0,hx:-6,lFh:114,lFk:10,lBh:64,lBk:-60},
      {rot:0,lean:34,hunch:28,head:-38,jaw:24,aFs:30,aFe:10,aBs:20,aBe:4,hx:-4,lFh:82,lFk:-2,lBh:6,lBk:-90,fB:60},
      {rot:0,lean:20,hunch:26,head:-30,jaw:22,aFs:20,aFe:30,aBs:12,aBe:22,hx:-1,lFh:34,lFk:-14,lBh:-12,lBk:-40},
      {lean:12,hunch:30,head:-26,jaw:20}][i]},
    death:{nome:'Morte (papo estoura)',n:8,dur:i=>[90,150,120,130,150,130,150,600][i],pose:i=>[
      {lean:-10,hunch:6,head:-44,jaw:60,th:1,aFs:-40,aFe:-20,aBs:-46,aBe:-28,hx:-6,flash:1,lFh:14,lBh:-4,swing:30},
      {lean:-6,hunch:4,head:-58,jaw:74,th:1.4,aFs:-70,aFe:-90,aBs:-76,aBe:-96,hx:-6,lFh:12,lBh:-8,shiver:1,eyeW:1},
      {lean:-2,hunch:10,head:-50,jaw:70,th:0.1,burst:1,aFs:-40,aFe:-20,aBs:-50,aBe:-30,hx:-5,lFh:14,lBh:-8},
      {lean:8,hunch:24,head:-14,jaw:50,burst:2,aFs:4,aFe:6,aBs:0,aBe:2,hx:-4,lFh:40,lFk:-30,lBh:28,lBk:-50,fF:10,fB:30},
      {lean:10,hunch:30,head:-10,jaw:46,burst:2,aFs:6,aFe:4,aBs:2,aBe:0,hx:-2,lFh:14,lFk:-92,lBh:6,lBk:-96,fF:100,fB:100},
      {rot:40,lean:10,hunch:30,head:-14,jaw:44,burst:3,aFs:60,aFe:80,aBs:48,aBe:66,hx:2,lFh:-14,lFk:-76,lBh:-22,lBk:-80,fF:66,fB:66},
      {rot:86,lean:2,hunch:16,head:-6,jaw:40,burst:3,aFs:150,aFe:170,aBs:110,aBe:150,hx:4,lFh:-4,lFk:-10,lBh:-8,lBk:-14,fF:10,fB:10,swing:-60},
      {rot:90,lean:0,hunch:14,head:-2,jaw:44,burst:4,aFs:160,aFe:176,aBs:116,aBe:156,hx:4,lFh:-2,lFk:-6,lBh:-6,lBk:-10,fF:6,fB:6,swing:-70}][i]},
  };
  const EXK=['hx','lean','hunch','head','aFs','aFe','aBs','aBe','lFh','lFk','lBh','lBk'];
  function exag(P,f){ if(f===1||Math.abs(P.rot)>4) return P; EXK.forEach(k=>{ P[k]=REST[k]+(P[k]-REST[k])*f; }); P.jaw=Math.min(84,REST.jaw+(P.jaw-REST.jaw)*f); return P; }
  const EXF={idle:1.12,walk:1.15,flee:1.12,attack:1.25,shove:1.25,shriek:1.2,scream:1.1,hurt:1.3,hurtB:1.25,fall:1.1,getup:1.08,death:1.12};
  ZREACT.add(ANIMS,REST,{moves:{scratch:["swipe","Unhada desesperada"]}}); // reações (voando, agarrado) + golpe extra — art-src/shared/zreact.js
  function poseOf(anim,i){ return exag(Object.assign({},REST,ANIMS[anim].pose(i)),EXF[anim]||1); }
  function heavyOutline(cv){ const g=cv.getContext('2d'), W=cv.width, H=cv.height, im=PIX.pix(cv), d=im.data;
    const isO=i=>d[i+3]===255&&d[i]===0x17&&d[i+1]===0x0b&&d[i+2]===0x1c, fill=i=>d[i+3]===255&&!isO(i);
    const add=[]; for(let y=2;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(d[i+3]) continue; const u=((y-1)*W+x)*4, u2=((y-2)*W+x)*4; if(isO(u)&&fill(u2)) add.push(i); }
    add.forEach(i=>{ d[i]=0x17; d[i+1]=0x0b; d[i+2]=0x1c; d[i+3]=255; }); g.putImageData(im,0,0); }

  /* ---------- esqueleto (coluna curva, pernas compridas) ---------- */
  const SPINE=40, TH=21, SH=20, UA=15, FA=14, VS=0.98, US=1, HB=10, HS=1.34;
  const lp=(p,a,L)=>({x:p.x+Math.sin(rad(a))*L, y:p.y+Math.cos(rad(a))*L});
  function build(P,dy){
    const R=P.rot, hip={x:AX+P.hx+(P.shiver?0.7:0), y:dy};
    const ra=rad(R), rc=Math.cos(ra), rs=Math.sin(ra);
    const HR=(lx,ly)=>({x:hip.x+lx*rc-ly*rs, y:hip.y+lx*rs+ly*rc});
    const hipF=HR(2.4,0), hipB=HR(-2.4,0);
    const kneeF=lp(hipF,P.lFh-R,TH), ankleF=lp(kneeF,P.lFk-R,SH), kneeB=lp(hipB,P.lBh-R,TH), ankleB=lp(kneeB,P.lBk-R,SH);
    const SS=[]; let x=hip.x, y=hip.y;
    for(let k=0;k<=SPINE;k++){ const t=k/SPINE, a=rad(R+P.lean+(P.hunch+HB)*Math.pow(t,1.3)); SS.push({x,y,a}); x+=Math.sin(a); y-=Math.cos(a); }
    const SP=(u,v)=>{ const f=Math.max(0,-v), k=Math.min(SPINE,Math.floor(f)), s=SS[k], r=f-k, a=s.a;
      const px=s.x+Math.sin(a)*r, py=s.y-Math.cos(a)*r; return {x:px+Math.cos(a)*u, y:py+Math.sin(a)*u}; };
    const T=(u,v)=>SP(u*US,v*VS);
    const top=SS[SPINE], sa=top.a, neck=T(2.4,-40);
    const shF=T(3,-33), shB=T(-3.4,-34);
    const ha=sa+rad(P.head-HB*0.8), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:neck.x+(lx*hc-ly*hs)*HS, y:neck.y+(lx*hs+ly*hc)*HS});
    const jp=H(-1.4,-6.4), ja=ha+rad(P.jaw), jc=Math.cos(ja), js=Math.sin(ja);
    const J=(lx,ly)=>({x:jp.x+(lx*jc-ly*js)*HS, y:jp.y+(lx*js+ly*jc)*HS});
    let elF,wrF;
    if(P.megaUp){ const m=H(12,-2), t={x:m.x-3,y:m.y+6}; const r=ik(shF,t,UA,FA,true); elF=r.E; wrF=r.W; }
    else { elF=lp(shF,P.aFs-R,UA); wrF=lp(elF,P.aFe-R,FA); }
    const elB=lp(shB,P.aBs-R,UA), wrB=lp(elB,P.aBe-R,FA);
    const toe=(a,f)=>{ const t=rad(f+R); return {x:a.x+(11*Math.cos(t)-5*Math.sin(t))*1.3, y:a.y+(11*Math.sin(t)+5*Math.cos(t))*1.3}; };
    const hand=(e,w)=>{ const L=Math.hypot(w.x-e.x,w.y-e.y)||1; return {x:w.x+(w.x-e.x)/L*7,y:w.y+(w.y-e.y)/L*7}; };
    const hull=[[hand(elF,wrF),6.5],[hand(elB,wrB),6.5],[ankleF,5.6],[ankleB,5.6],[toe(ankleF,P.fF),0.5],[toe(ankleB,P.fB),0.5],[kneeF,5],[kneeB,5],[hip,8],[T(0,-18),10],[T(-2,-32),10],[H(1,-12),12],[J(8,4),6],[(()=>{ const an=T(-7.4,-9), a=ra+rad(118-P.swing); return {x:an.x+Math.cos(a)*16,y:an.y+Math.sin(a)*16}; })(),10],[wrF,4],[wrB,4],[elF,4],[elB,4]];
    return {R,hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,SP,T,sa,neck,shF,shB,elF,wrF,elB,wrB,ha,H,ja,J,hull,ra};
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

  /* ---------- braço ---------- */
  function drawArm(c,u,M,sk,P,front){
    const p=mkPen(c,u), sh=front?sk.shF:sk.shB, el=front?sk.elF:sk.elB, wr=front?sk.wrF:sk.wrB; p._c=c; p.id();
    limb(p,M.skin,sh,el,10.4,8.8,{});
    const n=limb(p,M.skin,el,wr,9,7.4,{});
    p.F(M.skin[0]); p.circle(lerp(el,wr,0.05),1.1);
    // tendões e veias do braço magro
    p.F(M.skin[3]); const v0=lerp(el,wr,0.2), v1=lerp(el,wr,0.75); p.cap({x:v0.x-n.nx*1,y:v0.y-n.ny*1},{x:v1.x-n.nx*0.4,y:v1.y-n.ny*0.4},0.7,0.6);
    p.F(M.rot[1]); const r1=lerp(sh,el,0.7); p.ell(r1.x-n.nx*1,r1.y-n.ny*1,1.6,1.2);
    if(front){ p.F(M.flesh[2]); const w=lerp(el,wr,0.45); p.ell(w.x+n.nx*1.2,w.y+n.ny*1.2,1.8,1.2,Math.atan2(wr.y-el.y,wr.x-el.x)); p.F(M.flesh[1]); p.rect(w.x+n.nx*1.2-0.5,w.y+n.ny*1.2-0.5,1,1); }
    // manga curta da camisa
    const s1=lerp(sh,el,0.46);
    limb(p,M.shirt,sh,s1,13.6,12.6,{hl:0.5});
    const sn=sideN(sh,el), dir={x:(el.x-sh.x)/sn.L,y:(el.y-sh.y)/sn.L};
    p.F(M.shirt[3]); p.cap({x:s1.x-sn.nx*5.2,y:s1.y-sn.ny*5.2},{x:s1.x+sn.nx*5.2,y:s1.y+sn.ny*5.2},1.1,1.1);
    p.F(M.print[1]); const pp=lerp(sh,el,0.22); p.circle({x:pp.x-sn.nx*2,y:pp.y-sn.ny*2},1); p.F(M.print[2]); p.circle({x:pp.x+sn.nx*2.4+dir.x*2,y:pp.y+sn.ny*2.4+dir.y*2},0.8);
    drawHand(p,M,el,wr,P,front);
  }
  function drawHand(p,M,el,wr,P,front){
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y); p._c.scale(1.52,1.52);
    const g=P.grip;
    p.F(M.skin[1]); p.poly([[-1,-3],[4.4,-3.6],[5.6,-0.8],[5.2,3.2],[-1,3.2]]);
    p.F(M.skin[2]); p.poly([[-1,1.2],[5.4,1],[5.2,3.2],[-1,3.2]]);
    p.F(M.skin[0]); p.rect(0.4,-2.8,3.4,0.9);
    if(front&&P.megaUp){ // segura o megafone: punho fechado
      p.F(M.skin[1]); p.ell(5.2,-0.2,2.6,3); p.F(M.skin[2]); p.rect(4,1.2,3,1.2); p.F(M.skin[3]); [[5.6,-2],[5.8,-0.2],[5.6,1.4]].forEach(([x,y])=>p.rect(x,y,1.6,0.6));
      p.id(); return; }
    for(let k=0;k<4;k++){
      const y0=-2.6+k*1.8, cv=g?1.4:0.5, L1=3.8-(k===3?1:0), L2=3.4-(k===3?0.8:0);
      const a1={x:5,y:y0}, b1={x:5+L1*(g?0.7:1),y:y0-1*cv}, c1={x:b1.x+L2*0.6*(1-g*0.8),y:b1.y-L2*cv*(g?1:0.6)};
      p.F(M.skin[1]); p.cap(a1,b1,1.8,1.6); p.cap(b1,c1,1.6,1.3);
      p.F(M.skin[2]); p.rect(a1.x+0.4,y0+0.4,L1-1,0.6);
      // unhas compridas
      p.F(M.nail[1]); p.poly([[c1.x-0.6,c1.y-0.6],[c1.x+1.8,c1.y-1.6*(g?0.4:1)],[c1.x+0.4,c1.y+0.6]]);
    }
    p.F(M.skin[1]); p.cap(P2(1.8,-2.8),P2(4.8,-5.6+g),1.8,1.4); p.F(M.nail[1]); p.ell(5.2,-6+g,0.8,0.7);
    p.id();
  }

  /* ---------- perna ---------- */
  function drawLeg(c,u,M,sk,P,front){
    const p=mkPen(c,u), hip=front?sk.hipF:sk.hipB, knee=front?sk.kneeF:sk.kneeB, ank=front?sk.ankleF:sk.ankleB; p.id();
    const n=limb(p,M.skin,knee,ank,7.6,6.2,{hl:0.5});
    p.F(M.skin[0]); p.circle({x:knee.x-n.nx*1.6,y:knee.y-n.ny*1.6+1.4},1.2);
    p.F(M.rot[1]); const r=lerp(knee,ank,0.5); p.ell(r.x-n.nx*0.8,r.y-n.ny*0.8,1.4,2.2,Math.atan2(ank.y-knee.y,ank.x-knee.x)+PI/2);
    p.F(M.rot[2]); p.circle({x:r.x-n.nx*0.4,y:r.y+1},0.7);
    if(front){ p.F(M.blood[2]); const b=lerp(knee,ank,0.7); p.rect(b.x-n.nx*1.4,b.y-1,1,2.6); }
    // meia arriada
    p.F(M.sole[2]); const so=lerp(knee,ank,0.86); p.cap({x:so.x-n.nx*3,y:so.y-n.ny*3},{x:so.x+n.nx*3,y:so.y+n.ny*3},2.4,2.4); p.F(M.sole[1]); p.rect(so.x-n.nx*2-0.5,so.y-1.4,1.4,1);
    // bermuda cáqui folgada até o joelho
    const kb=lerp(hip,knee,1.02);
    limb(p,M.shorts,hip,kb,13.6,12.4,{hl:0.55});
    const kn=sideN(hip,knee), dir={x:(knee.x-hip.x)/kn.L,y:(knee.y-hip.y)/kn.L};
    p.F(M.shorts[3]); p.cap({x:kb.x-kn.nx*5,y:kb.y-kn.ny*5},{x:kb.x+kn.nx*5,y:kb.y+kn.ny*5},1.2,1.2);
    p.F(M.shorts[2]); const f1=lerp(hip,kb,0.5); p.cap({x:f1.x-kn.nx*3.4,y:f1.y-kn.ny*3.4},{x:f1.x-kn.nx*0.4+dir.x*2.4,y:f1.y-kn.ny*0.4+dir.y*2.4},0.9,0.8);
    p.F(M.shorts[0]); const f3=lerp(hip,kb,0.28); p.cap({x:f3.x-kn.nx*3.2,y:f3.y-kn.ny*3.2},{x:f3.x-kn.nx*1.4+dir.x*3,y:f3.y-kn.ny*1.4+dir.y*3},0.9,0.8);
    // bolso lateral (cargo)
    if(front){ const t=lerp(hip,kb,0.58); p.F(M.shorts[2]); p.poly([[t.x-kn.nx*0.6-dir.x*2.6,t.y-kn.ny*0.6-dir.y*2.6],[t.x+kn.nx*3.6-dir.x*2.6,t.y+kn.ny*3.6-dir.y*2.6],[t.x+kn.nx*3.4+dir.x*3,t.y+kn.ny*3.4+dir.y*3],[t.x-kn.nx*0.4+dir.x*3,t.y-kn.ny*0.4+dir.y*3]]);
      p.F(M.shorts[3]); p.cap({x:t.x-kn.nx*0.6-dir.x*2.6,y:t.y-kn.ny*0.6-dir.y*2.6},{x:t.x+kn.nx*3.6-dir.x*2.6,y:t.y+kn.ny*3.6-dir.y*2.6},0.8,0.8); }
    // tênis de lona
    const fa=rad((front?P.fF:P.fB)+sk.R); p.xf(fa,ank.x,ank.y); c.scale(1.3,1.3);
    p.F(M.shoe[1]); p.poly([[-3.8,-1.8],[2,-2.2],[6,0.2],[10,1.4],[11.4,3],[-4.2,3]]);
    p.F(M.shoe[2]); p.poly([[-4.2,1.2],[11,1.6],[11.4,3],[-4.2,3]]);
    p.F(M.shoe[0]); p.rect(-2.4,-1.6,3.2,0.8);
    p.F(M.sole[1]); p.poly([[-4.6,2.8],[11.6,2.6],[12,4.4],[-4.8,4.6]]); p.F(M.sole[0]); p.rect(6,2.7,5.4,0.7); p.F(M.sole[3]); p.rect(-4.8,4,16.8,0.8);
    p.F(M.sole[1]); [[2.4,-0.8],[4,0],[5.6,0.6]].forEach(([x,y])=>p.rect(x,y,0.9,0.9));
    if(front){ p.F(M.skin[1]); p.ell(10.2,1.4,1.6,1.1); p.F(M.nail[1]); p.rect(10.4,0.8,0.8,0.7); } // dedão furando a lona
    p.id();
  }

  /* ---------- tronco: magro, camisa aberta, costelas ---------- */
  const FLW=[[-5,-31],[-2.4,-19],[-5.6,-9],[8.8,-24],[9.4,-12]];
  const SIL=[[-6.6,3],[-7.4,-6],[-8,-16],[-8.6,-26],[-8.2,-33],[-5.8,-38.4],[-1.2,-40.6],[3.6,-40.2],[7.4,-36.6],[8.6,-31],[8,-24],[6.2,-17],[5.6,-10],[6.6,-4],[7.2,3]];
  function drawTorso(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    // bermuda (cós) e cordão
    p.F(M.shorts[1]); p.poly(W(sk,[[-7.2,-3],[7.6,-3],[7.8,5],[-7.4,5]]));
    p.F(M.shorts[2]); p.poly(W(sk,[[-7.4,-0.6],[7.8,-0.6],[7.8,5],[-7.4,5]]));
    p.F(M.shorts[3]); p.poly(W(sk,[[-7.2,-3],[7.6,-3],[7.6,-2],[-7.2,-2]]));
    p.F(M.capw[1]); p.poly(W(sk,[[5,-2.6],[6,-2.6],[6.6,2],[5.8,2.2]]));
    // peito nu (pele) com sombra grande
    const sil=W(sk,SIL);
    p.F(M.skin[1]); p.poly(sil);
    clip(c,sil,()=>{ p.F(M.skin[2]); p.poly(W(sk,[[-12,6],[-12,-44],[-1,-44],[0,-34],[1,-26],[2,-18],[3,-10],[4,-3],[10,6]]));
      p.F(M.skin[3]); p.poly(W(sk,[[-12,6],[-12,-44],[-3,-44],[-1,-36],[0,-26],[1,-16],[0.6,-8],[1.4,6]]));
      p.F(M.skin[3]); p.poly(W(sk,[[3,-16],[6.6,-17.6],[6,-10],[4,-8]])); // barriga funda
      p.F(M.skin[0]); p.poly(W(sk,[[4,-38],[7.4,-36],[8.4,-31],[6.6,-31],[4.6,-34]])); });
    // costelas (osso aparecendo sob a pele fina)
    [[-30.6,1],[-27.2,0.8],[-23.8,0.6],[-20.4,0.4]].forEach(([v,w],k)=>{
      p.F(M.skin[3]); p.poly(W(sk,[[1.6,v+1.2],[5.4,v+0.4],[8-k*0.6,v-0.8],[7.8-k*0.6,v+0.2],[5.4,v+1.4],[1.8,v+2]]));
      p.F(M.skin[0]); p.poly(W(sk,[[2.2,v],[5.4,v-0.6],[7.6-k*0.6,v-1.6],[7.8-k*0.6,v-0.8],[5.4,v+0.4],[2,v+1]])); });
    p.F(M.skin[3]); p.poly(W(sk,[[6.2,-33],[7,-33],[6.4,-20],[5.8,-20]])); // esterno
    p.F(M.skin[3]); const nv=Wp(sk,5.2,-6); p.rect(nv.x-0.5,nv.y-0.5,1,1);
    // mordida no flanco
    p.F(M.flesh[3]); p.poly(W(sk,[[-1,-15],[2.6,-16],[3.6,-12.6],[1.6,-10],[-1.2,-11.4]]));
    p.F(M.flesh[1]); p.poly(W(sk,[[-0.4,-14.4],[2.2,-15.2],[2.8,-12.8],[1.4,-11],[-0.4,-12]]));
    p.F(M.flesh[0]); p.rect(Wp(sk,1,-14).x,Wp(sk,1,-14).y,1,0.8);
    p.F(M.blood[1]); p.poly(W(sk,[[0.6,-10.6],[1.4,-10.8],[1.2,-7.4],[0.8,-7.2]]));
    // camisa aberta: metade de trás + aba da frente
    const fl=P.flap||0;
    const back=W(sk,[[-7.6,-1.4],[-8.4,-12],[-9,-24],[-8.6,-33],[-6,-38.8],[-1.2,-41],[3.4,-40.6],[2.6,-34],[0.8,-26],[0,-16],[0.4,-6],[1.6,-1.4],[-3,0]]);
    const flap=W(sk,[[3.4,-40.4],[7.8,-37],[9.4,-30],[9.8+fl*1.4,-20],[10.8+fl*3,-9],[10+fl*3.4,-5],[7.4+fl*1.4,-5.8],[7.2,-16],[8,-26],[6.4,-33]]);
    const paint=(shape,t)=>clip(c,shape,()=>{ p.F(M.shirt[t]); p.poly(shape);
      p.F(M.print[Math.min(3,t)]); FLW.forEach(([x,y])=>{ const q=Wp(sk,x,y); p.ell(q.x-1,q.y,1.1,1.1); p.ell(q.x+1,q.y,1.1,1.1); p.ell(q.x,q.y-1,1.1,1.1); p.ell(q.x,q.y+1,1.1,1.1); });
      p.F(M.cap[Math.min(3,t+1)]); FLW.forEach(([x,y])=>{ const q=Wp(sk,x,y); p.rect(q.x-0.5,q.y-0.5,1,1); }); });
    paint(back,1);
    clip(c,back,()=>{ clip(c,W(sk,[[-14,6],[-14,-46],[-3,-46],[-4,-36],[-3,-24],[-2,-12],[0,6]]),()=>paint(back,2)); });
    clip(c,back,()=>{ clip(c,W(sk,[[-14,6],[-14,-46],[-6.4,-46],[-7.2,-34],[-6.6,-20],[-5,6]]),()=>paint(back,3)); });
    clip(c,back,()=>{ clip(c,W(sk,[[-4,-46],[4,-46],[2,-37],[-3,-38]]),()=>paint(back,0)); });
    paint(flap,1);
    clip(c,flap,()=>{ clip(c,W(sk,[[7.4,-30],[14,-30],[16,0],[7,0],[8,-16]]),()=>paint(flap,2)); });
    // dobras e gola
    p.F(M.shirt[3]); [[[-5,-16],[-1.4,-19],[-1,-18.2],[-4.6,-15.2]],[[-6,-28],[-2,-30],[-1.8,-29.2],[-5.8,-27.2]]].forEach(f=>p.poly(W(sk,f)));
    p.F(M.shirt[0]); p.poly(W(sk,[[-1.4,-41],[3.6,-40.6],[1.8,-37],[-0.4,-38.6]])); p.poly(W(sk,[[3.6,-40.4],[7.4,-37.2],[6.6,-35.6],[4,-38]]));
    p.F(M.shirt[3]); p.poly(W(sk,[[7.4,-5.8+0],[10+fl*3.4,-5],[10+fl*3.4,-4],[7.4,-4.8]]));
    p.F(M.capw[1]); [[8.6,-30],[9.4,-22],[10.2+fl*2,-12]].forEach(([x,y])=>{ const q=Wp(sk,x,y); p.rect(q.x-0.5,q.y-0.5,1.1,1.1); }); // botões soltos
    // alça do megafone atravessando o peito
    p.F(M.strap[1]); p.poly(W(sk,[[4.4,-40.4],[7,-39.2],[-6.4,-8],[-8.6,-9.6]]));
    p.F(M.strap[0]); p.poly(W(sk,[[5,-40.2],[6,-39.8],[-7.4,-8.6],[-8.2,-9.2]]));
    p.F(M.strap[3]); p.poly(W(sk,[[6.6,-39.2],[7.2,-38.8],[-6.2,-7.8],[-6.8,-7.6]]));
    p.F(M.grille[1]); const bk=Wp(sk,0.6,-25); p.rect(bk.x-1.2,bk.y-1.2,2.4,2.6); p.F(M.grille[0]); p.rect(bk.x-1.2,bk.y-1.2,1,1);
    // sangue escorrido da boca no peito
    p.F(M.blood[2]); p.poly(W(sk,[[6.6,-38],[8.4,-34],[8,-29],[7.2,-31],[6.8,-27],[6.2,-33]]));
    p.F(M.blood[1]); p.poly(W(sk,[[6.8,-37.4],[7.8,-34.6],[7.4,-32.4],[6.8,-34.6]]));
    if(form==='plenilunar'){ p.F(M.bone[1]); [[-8.4,-30,-14,-34],[-8.8,-22,-14.6,-22],[-8,-14,-13,-11]].forEach(([u0,v0,u1,v1])=>{ const a=Wp(sk,u0,v0+1.6), b=Wp(sk,u1,v1), d=Wp(sk,u0+0.6,v0-1.6); p.poly([[a.x,a.y],[b.x,b.y],[d.x,d.y]]); }); }
    if(form!=='comum'){ p.F(M.glow[1]); [[[2,-30],[4,-36],[4.6,-35.6],[2.6,-29.6]],[[2.4,-18],[5,-24],[5.6,-23.6],[3,-17.6]]].forEach(f=>p.poly(W(sk,f))); }
  }

  /* ---------- megafone quebrado ---------- */
  function megaShape(p,M,fi,up){
    // eixo +x: bocal (x=0) → campânula (x=14). Cabo pra baixo em y+.
    p.F(M.mega[2]); p.poly([[1.6,1.6],[4,1.6],[4.6,6],[2.2,6.4]]); // cabo
    p.F(M.mega[3]); p.rect(2.2,4.6,2.4,0.8);
    p.F(M.mega[1]); p.poly([[0,-2],[5,-2.4],[14,-6.6],[14.6,-6],[14.6,6],[14,6.6],[5,2.4],[0,2]]);
    p.F(M.mega[0]); p.poly([[0.4,-1.6],[5,-2],[13,-5.8],[13,-4.4],[5,-0.8],[0.4,-0.6]]);
    p.F(M.mega[2]); p.poly([[0.4,1],[5,1.2],[13.6,5.4],[13.6,6.2],[5,2.2],[0.4,1.8]]);
    p.F(M.cap[1]); p.poly([[5.6,-2.6],[7.6,-3.6],[7.6,3.6],[5.6,2.6]]); p.F(M.cap[0]); p.rect(5.6,-2.6,2,1);
    p.F(M.grille[2]); p.ell(14.4,0,1.6,6.6); p.F(M.grille[1]); p.ell(14.8,0,1,5.6); p.F(M.grille[3]); [[-3.6],[-1.2],[1.2],[3.6]].forEach(([y])=>p.rect(14.2,y-0.3,1.4,0.6));
    // rachadura e pedaço faltando
    p.F(M.mega[3]); p.poly([[9,-4.4],[10.4,-2],[9.6,0],[11.4,2.4],[11,2.8],[9,0.2],[9.8,-2]]);
    p.F(M.grille[3]); p.poly([[12,-6.2],[14.6,-6],[14.6,-3.4],[13,-4.6]]);
    // fio solto pendurado com a mola
    if(!up){ const sw=(fi%4)*0.6; p.F(M.grille[2]); p.cap(P2(1,1.4),P2(-1.4,5),0.7,0.7); p.cap(P2(-1.4,5),P2(-0.6+sw,9),0.7,0.6); p.F(M.cap[1]); p.rect(-1.2+sw,8.8,1.4,1.2); p.F(M.metal?M.metal[1]:M.grille[0]); p.rect(-1+sw,9.8,0.5,0.9); p.rect(0+sw,9.8,0.5,0.9); }
  }
  function drawMega(c,u,M,sk,P,fi){
    const p=mkPen(c,u); p.id();
    if(P.megaUp){ const w=sk.wrF, a=sk.ha+rad(-10); const m=sk.H(11,-2.6);
      p.xf(a,m.x,m.y); c.scale(1.25,1.25); megaShape(p,M,fi,true); p.id(); return; }
    const an=Wp(sk,-7.4,-9), a=sk.ra+rad(118-P.swing);
    // alça curta até a argola
    p.F(M.strap[1]); p.cap(an,{x:an.x+Math.cos(a)*1.6,y:an.y+Math.sin(a)*1.6},1.8,1.6);
    const o={x:an.x+Math.cos(a)*1.2+Math.cos(a+PI/2)*2.6,y:an.y+Math.sin(a)*1.2+Math.sin(a+PI/2)*2.6};
    p.xf(a,o.x,o.y); c.scale(1.42,1.42); megaShape(p,M,fi,false); p.id();
  }

  /* ---------- cabeça: crânio estreito, boné virado, boca rasgada até a orelha, papo ---------- */
  function drawNeck(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.xf(sk.ha,sk.neck.x,sk.neck.y); c.scale(HS,HS);
    // pescoço comprido e fino com pomo e tendões
    p.F(M.skin[1]); p.poly([[-4.6,9],[2.6,9],[3.2,0],[2.4,-7],[-3.6,-8]]);
    p.F(M.skin[2]); p.poly([[-4.6,9],[-1.6,9],[-1.4,-7.6],[-3.6,-8]]);
    p.F(M.skin[3]); p.poly([[-4.6,9],[-3.4,9],[-3.2,-7.8],[-3.6,-8]]);
    p.F(M.skin[3]); p.rect(0.6,-4,0.7,10);
    if(P.burst){ drawThroatBurst(p,M,P); p.id(); return; }
    // papo da garganta inflado (pele fina, veias e brilho por dentro)
    const t=P.th, rx=3.4+t*4.6, ry=3.4+t*4, cx=3.4+t*2.6, cy=2.4+t*1.6;
    p.F(M.sac[2]); p.ell(cx,cy,rx,ry);
    p.F(M.sac[1]); p.ell(cx+0.4,cy-0.6,rx-1,ry-1.2);
    p.F(M.sac[0]); p.ell(cx+rx*0.3,cy-ry*0.4,rx*0.32,ry*0.26);
    if(t>0.8||form!=='comum'){ const g=Math.min(1,(t-0.4)); p.F(M.glow[2]); p.ell(cx,cy+0.4,rx*0.62,ry*0.56); p.F(M.glow[1]); p.ell(cx+0.2,cy+0.2,rx*0.4*(0.6+g*0.4),ry*0.34*(0.6+g*0.4)); if(t>1) { p.F(M.glow[0]); p.ell(cx+0.4,cy,rx*0.18,ry*0.16); } }
    p.F(M.sac[3]); p.cap(P2(cx-rx*0.7,cy-ry*0.3),P2(cx-rx*0.2,cy+ry*0.3),0.6,0.5); p.cap(P2(cx-rx*0.2,cy+ry*0.3),P2(cx+rx*0.3,cy+ry*0.7),0.5,0.5); p.cap(P2(cx+rx*0.5,cy-ry*0.7),P2(cx+rx*0.7,cy),0.5,0.5);
    p.F(M.sac[2]); p.cap(P2(cx-rx*0.1,cy+ry*0.9),P2(cx+rx*0.5,cy+ry*0.8),0.6,0.6);
    p.id();
  }
  function drawThroatBurst(p,M,P){
    // papo estourado: retalhos, carne e sangue jorrando
    p.F(M.sac[2]); p.poly([[1,-4],[5,-5],[6,-1],[4.6,0],[5.4,3],[3,2],[2,5],[0.6,1]]);
    p.F(M.flesh[2]); p.ell(3,-0.6,2.6,3); p.F(M.flesh[1]); p.ell(3.4,-1,1.6,2); p.F(M.bone[1]); p.rect(2,-2.6,0.9,3.4);
    if(P.burst===1){ p.F(M.blood[1]); for(let k=0;k<7;k++){ const a=-1.4+k*0.42, L=9+(k%3)*4; p.poly([[4+Math.cos(a-0.2)*2,-1+Math.sin(a-0.2)*2],[4+Math.cos(a)*L,-1+Math.sin(a)*L],[4+Math.cos(a+0.2)*2,-1+Math.sin(a+0.2)*2]]); }
      p.F(M.blood[0]); [[14,-6,1.4],[12,6,1.2],[16,1,1]].forEach(([x,y,r])=>p.circle(P2(x,y),r)); }
    else { p.F(M.blood[1]); p.poly([[2,1],[4,1],[3.6,5+P.burst],[2.6,5+P.burst]]); p.F(M.blood[2]); p.rect(2.4,4+P.burst,1.2,1.2); }
  }
  function drawMouth(c,u,M,sk,P){
    // cavidade da boca entre as maxilas (fica atrás delas)
    const p=mkPen(c,u); p.id(); if(P.jaw<6) return;
    const cav=[...Hl(sk,[[-1.6,-7.4],[12.4,-7.6]]),...Jl(sk,[[14.4,0.4],[-0.4,0.6]])];
    p.F(M.mouth[2]); p.poly(cav);
    clip(c,cav,()=>{ p.F(M.mouth[3]); p.poly([...Hl(sk,[[-1.6,-7.4],[5,-7.4]]),...Jl(sk,[[6,1],[-0.4,1]])]);
      p.F(M.mouth[1]); const q=sk.J(7,0.4), r=sk.J(12,0.2); p.cap(q,r,3,2.4); p.F(M.mouth[0]); p.cap(sk.J(8,-0.2),sk.J(11,-0.4),1.2,1);
      if(P.jaw>40){ p.F(M.mouth[3]); const g=lerp(sk.H(0,-6),sk.J(1,0),0.5); p.ell(g.x,g.y,2.2,2.8); } });
    // fiapos de carne ligando as maxilas (bochecha rasgada)
    if(P.jaw>14){ p.F(M.flesh[2]); p.cap(sk.H(1.4,-6.6),sk.J(2,0.2),1.4,1.2); p.F(M.flesh[1]); p.cap(sk.H(3.6,-6.8),sk.J(4.6,0),0.8,0.6); p.F(M.flesh[3]); p.cap(sk.H(-0.6,-6.4),sk.J(0.2,0.4),1.1,1); }
  }
  function drawHead(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.xf(sk.ha,sk.neck.x,sk.neck.y); c.scale(HS,HS);
    // crânio estreito e comprido
    p.F(M.skin[1]); p.ell(1.6,-14.4,8.2,8.4);
    p.poly([[-4.6,-9],[12.6,-10.6],[13.4,-7.4],[-2.6,-6.4]]);
    p.F(M.skin[2]); p.poly([[-6.6,-17],[-5,-9],[-1.6,-6.4],[4,-6.4],[0,-8.6],[-2.6,-12],[-3.6,-17]]);
    p.F(M.skin[3]); p.poly([[-6.6,-16],[-6,-11],[-3.6,-6.8],[-4.4,-12]]);
    // orelha
    p.F(M.skin[1]); p.ell(-2.6,-12,2,3); p.F(M.skin[3]); p.ell(-2.4,-11.8,0.9,1.8); p.F(M.flesh[2]); p.rect(-3.4,-9.6,1,1.2);
    // maçã do rosto saltada, bochecha funda
    p.F(M.skin[3]); p.poly([[2,-9.4],[7,-10.2],[6,-8.6],[2.6,-8.2]]);
    p.F(M.skin[0]); p.poly([[4.4,-12],[8.6,-12.4],[8,-11.2],[4.8,-11]]);
    // olhos esbugalhados (pânico): órbita funda, globo grande, pupila mínima
    const ew=P.eyeW?1.18:1;
    p.F(M.skin[3]); p.ell(8,-14,3.4*ew,3*ew);
    p.F(M.mouth[3]); p.ell(8.2,-13.8,2.6*ew,2.3*ew);
    p.F(M.eye[1]); p.ell(8.6,-14.2,1.9*ew,1.8*ew); p.F(M.eye[0]); p.rect(7.8,-15.4,1,0.9);
    p.F(M.eye[2]); p.rect(7.4,-13.2,2.4,0.7);
    p.F(M.blood[1]); p.rect(9.4,-14.6,1.1,1.1); p.F(M.blood[3]); p.rect(9.8,-14.4,0.5,0.6);
    p.F(M.skin[3]); p.ell(12.4,-14.4,1,1.6*ew); p.F(M.eye[1]); p.rect(12.1,-15,0.9,1.4);
    // sobrancelha erguida (medo)
    p.F(M.skin[3]); p.poly([[5,-18.4],[11.6,-17.6],[11.6,-16.8],[5,-17.4]]);
    // nariz fino e quebrado
    p.F(M.skin[1]); p.poly([[11.6,-14],[15,-10.6],[13.6,-9.4],[11.6,-10]]);
    p.F(M.skin[3]); p.rect(13,-10.2,1.2,0.8); p.F(M.skin[0]); p.rect(12.4,-13,0.9,1.4);
    // maxila de cima: fileira longa de dentes até a orelha (rasgo)
    p.F(M.mouth[1]); p.poly([[-2,-8],[13,-9.4],[13.4,-6.8],[-2,-6]]);
    p.F(M.flesh[1]); p.poly([[-2.6,-8.6],[3,-9],[3.2,-6.6],[-2.6,-6]]);
    p.F(M.flesh[0]); p.rect(-1,-8.6,2.4,0.7);
    p.F(M.teeth[1]); for(let k=0;k<9;k++){ const x=-1.4+k*1.6, h=k%2?1.6:2.2; p.rect(x,-7.4,1.1,h); }
    p.F(M.teeth[3]); for(let k=0;k<9;k++){ const x=-1.4+k*1.6; p.rect(x+0.6,-7.4,0.5,0.6); }
    // podridão e veias
    p.F(M.rot[1]); p.ell(-1,-18,2,1.4); p.ell(5,-7.8,1.2,0.8); p.F(M.rot[2]); p.rect(-1.6,-18.4,1,1);
    p.F(M.skin[3]); p.cap(P2(1,-13),P2(3,-10.8),0.5,0.5); p.cap(P2(3,-10.8),P2(2.4,-9.2),0.5,0.5);
    // boné virado pra trás
    const dome=[]; for(let k=0;k<=12;k++){ const a=PI*1.08+k/12*PI*0.8; dome.push([1.2+Math.cos(a)*8.4,-16.2+Math.sin(a)*7.4]); }
    p.F(M.cap[1]); p.poly([...dome,[8.4,-19.4],[-6.4,-17.2]]);
    p.F(M.cap[2]); p.poly([[-7.4,-16],[-6,-20],[-3,-22.6],[-2,-21],[-4.4,-18],[-5,-15.6]]);
    p.F(M.cap[0]); p.poly([[2,-23.2],[6.4,-21.6],[8.4,-19],[5,-20.4],[1.6,-22]]);
    p.F(M.capw[1]); p.poly([[-1,-23.2],[2.6,-23.6],[3.2,-21],[-0.6,-20.6]]); // painel da frente (virado)
    p.F(M.cap[3]); p.poly([[-6.4,-17.4],[8.4,-19.6],[8.4,-18.8],[-6.4,-16.6]]);
    // aba pra trás + ajuste
    p.F(M.cap[2]); p.poly([[-6,-17.4],[-14,-15.6],[-14.6,-14.2],[-6.4,-15]]);
    p.F(M.cap[3]); p.poly([[-6.4,-15.4],[-14.6,-14.6],[-14.6,-14],[-6.4,-14.8]]);
    p.F(M.cap[0]); p.poly([[-6.6,-17.4],[-13.4,-15.8],[-13.6,-15.2],[-6.6,-16.6]]);
    p.F(M.capw[2]); p.rect(-6.4,-19.6,2.4,1.2);
    // cabelo seboso saindo por baixo
    p.F(M.hair[1]); p.poly([[-7,-15],[-4,-15],[-4.6,-12],[-6.4,-9],[-7.6,-11]]); p.F(M.hair[0]); p.rect(-6,-14.6,1,1.2);
    if(form!=='comum'){ p.F(M.glow[0]); p.rect(7.6,-15.6,1.6,1.4); p.F(M.glow[1]); p.rect(12.1,-15,0.9,1.4); }
    p.id();
  }
  function drawJaw(c,u,M,sk,P){
    const p=mkPen(c,u); p.xf(sk.ja,sk.J(0,0).x,sk.J(0,0).y); c.scale(HS,HS);
    const L=14.2;
    p.F(M.skin[1]); p.poly([[-1.6,-0.8],[L,0],[L+1,2],[L-0.6,4.8],[8,6.4],[1,6],[-2.4,2.6]]);
    p.F(M.skin[2]); p.poly([[-2.4,2.6],[1,6],[8,6.4],[L-0.6,4.8],[L-2,4.2],[4,4.4],[0,3]]);
    p.F(M.skin[3]); p.poly([[1.4,6],[8,6.4],[11,5.6],[5,5.4]]);
    p.F(M.mouth[1]); p.poly([[-1.6,-0.6],[L-0.4,0],[L-1,1.4],[-1,1.4]]);
    p.F(M.flesh[1]); p.poly([[-2,-0.8],[3,-0.6],[3,1.4],[-2,1.6]]);
    p.F(M.teeth[1]); for(let k=0;k<8;k++){ const x=-0.6+k*1.7, h=k%2?1.6:2.2; p.rect(x,-h+0.6,1.1,h); }
    p.F(M.teeth[3]); for(let k=0;k<8;k++){ p.rect(-0.6+k*1.7+0.6,-0.2,0.5,0.6); }
    p.F(M.skin[0]); p.rect(7,1.8,4,0.9);
    p.F(M.rot[1]); p.ell(3.4,4.2,1.4,1);
    const L2=2+(P.jaw>30?3:0)+(P.ring?2:0);
    p.F(M.blood[1]); p.poly([[L-1.6,4],[L,3.6],[L-0.4,4+L2],[L-1,4.8+L2]]); p.ell(L-0.7,4.8+L2,1,1);
    p.id();
  }
  /* ondas do grito (FX desenhado na arte; sem sombreamento) */
  function drawRings(c,u,M,sk,P){
    const p=mkPen(c,u); p.id();
    const m=lerp(sk.H(13,-8),sk.J(14,0),0.5), a=Math.atan2(m.y-sk.neck.y,m.x-sk.neck.x)*0.5+(sk.ha+rad(P.jaw*0.5))*0.5;
    const base=P.ring;
    for(let k=0;k<3;k++){ const r=8+k*11+base*3.4; if(m.x+r*0.9>FW-3) continue; const th=Math.max(1.4,3.2-k*0.7), sp=0.62+k*0.08, n=10, pts=[];
      for(let i=0;i<=n;i++){ const t=a-sp+2*sp*i/n; pts.push([m.x+Math.cos(t)*r,m.y+Math.sin(t)*r]); }
      for(let i=n;i>=0;i--){ const t=a-sp+2*sp*i/n, rr=r-th*(1-Math.abs(i/n-0.5)*1.2); pts.push([m.x+Math.cos(t)*rr,m.y+Math.sin(t)*rr]); }
      p.F(k===0?M.glow[0]:k===1?M.glow[1]:M.glow[2]); p.poly(pts); }
    // respingos de baba voando
    p.F(M.blood[0]); [[10,-4,1.2],[16,3,1],[13,6,0.9]].forEach(([x,y,r])=>{ const q={x:m.x+Math.cos(a)*x-Math.sin(a)*y,y:m.y+Math.sin(a)*x+Math.cos(a)*y}; if(q.x<FW-3) p.circle(q,r); });
  }

  /* ---------- montagem ---------- */
  const cache=PIX.cache();
  function frame(form,anim,fi,step=5,Pov,pk){
    const K=PIX.getK(), key=(pk!=null?'#'+pk+'|'+form:form+'|'+anim+'|'+fi+'|'+step)+'@'+K;
    const hit=cache.get(key); if(hit){ cache.delete(key); cache.set(key,hit); return hit; }
    const P=Pov?Object.assign({},REST,Pov):poseOf(anim,fi), M=mats(form), sk=skeleton(P), f=fi|0;
    const parts=[
      {back:true, draw:(c,u)=>drawArm(c,u,M,sk,P,false)},
      {back:true, draw:(c,u)=>drawLeg(c,u,M,sk,P,false)},
      ...(P.megaUp?[]:[{draw:(c,u)=>drawMega(c,u,M,sk,P,f)}]),
      {draw:(c,u)=>drawTorso(c,u,M,sk,P,form)},
      {draw:(c,u)=>drawLeg(c,u,M,sk,P,true)},
      {draw:(c,u)=>drawNeck(c,u,M,sk,P,form)},
      {draw:(c,u)=>drawMouth(c,u,M,sk,P)},
      {draw:(c,u)=>drawHead(c,u,M,sk,P,form)},
      {draw:(c,u)=>drawJaw(c,u,M,sk,P)},
    ];
    parts.push({draw:(c,u)=>drawArm(c,u,M,sk,P,true)});
    if(P.megaUp) parts.push({draw:(c,u)=>drawMega(c,u,M,sk,P,f)});
    if(P.ring) parts.push({noShade:true, noRim:true, smear:true, draw:(c,u)=>drawRings(c,u,M,sk,P)});
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM[form]}); if(step>=4) heavyOutline(cv);
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._mouth=sc(lerp(sk.H(12,-7),sk.J(12,0),0.5)); cv._eye=sc(sk.H(8.4,-14.4)); cv._hand=sc(sk.wrF); cv._head=sc(sk.H(2,-14)); cv._throat=sc(sk.H(5,0));
    cache.set(key,cv); if(cache.size>900) cache.delete(cache.keys().next().value);
    return cv;
  }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame,framePose:function(form,anim,P,key){ return frame(form,anim,0,5,P,key); }};
})();
