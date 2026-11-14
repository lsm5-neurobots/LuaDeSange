/* QUEIXADA — fonte de arte (editável). Build: npm run art
   Queixada Zumbi (Pantanal, comum animal — porco-do-mato em bando, IA-39).
   Anatomia do Tayassu pecari real (refs referencias/zumbis-pantanal/queixada/): corpo em barril/cunha, pesado na
   frente (cernelha alta, garupa caindo), cabeça grande e baixa em cunha que termina no focinho de disco, orelhas
   pequenas e redondas, QUEIXO BRANCO (lábio de baixo, mandíbula e bochecha baixa), caninos retos que se cruzam
   (o de cima desce, o de baixo sobe por fora do lábio), crina de cerdas duras do topo da cabeça ao meio das costas,
   cauda minúscula, pernas finas e curtas com cascos fendidos e jarrete alto atrás.
   Corrupção da Lua de Sangue: olhos de lua, costelas expostas no flanco (janela de pelo arrancado com veias),
   mandíbula rachada com osso aparecendo, musgo-lunar na crina, baba de sangue.
   Esqueleto próprio de quadrúpede: coluna rígida (lean = inclinação, + = frente pra baixo; rot = giro total),
   pescoço curto (nk avança a cabeça), cabeça (head, + = focinho pra baixo) e mandíbula (jaw), 4 patas com 2 parâmetros
   cada (h = balanço da pata, + = pra frente; k = dobra/erguida): dianteira perto fN, dianteira longe fF, traseira
   perto bN, traseira longe bF. A traseira tem 3 segmentos (coxa, perna, canela) com o jarrete dobrando pra trás.
   crest = cerdas eriçadas (0 deitadas … 1 em pé), ear = orelha (negativo = deitada pra trás).
   Golpes: presada (attack), investida (charge) e estalo de dentes (snap); pant = ofegante/vulnerável depois da investida.
   Hi-bit: honra PIX.getK(). */
const QUEIXADA=(function(){
  const {rad,lerp,mkPen,compose}=PIX;
  const FW=204, FH=142, GROUND=130, AX=100;
  const HS=1.12, BS=1.22, AXS=AX/BS, GS=GROUND/BS; // escala do rig (porte ~130 px de largura na tela)
  const RIM={comum:'#d8e0f0', enluarado:'#9ff6ff', plenilunar:'#ffb46a'};

  /* ---------- materiais ---------- */
  function mats(form){
    const m={
      fur:['#4e3e3a','#2a1f1d','#1e1624','#100a16'],      // pelo preto-acastanhado (sombra fria)
      furW:['#a07a5a','#6e5040','#4a3630','#2e2024'],     // luz quente no dorso
      furT:['#a08a78','#7a6656','#5a4a40','#3e322c'],     // pontas grisalhas das cerdas
      crest:['#5a4a42','#2e221c','#1a120e','#0c0806'],    // crina de cerdas duras
      chin:['#fffaf0','#e8e0d0','#a89c9c','#625664'],     // queixo branco
      snout:['#7a6060','#4e3836','#3a2a28','#1e1416'],    // focinho
      nose:['#e8b0b0','#b07878','#744650','#3e1e2c'],     // disco do focinho
      tusk:['#fffbe6','#e8e0b0','#aa9c70','#5e5038'],     // presas
      leg:['#6a5a52','#3e322e','#2a201e','#161010'],      // canelas finas
      hoof:['#7a7078','#46404a','#2a2630','#141218'],     // cascos
      flesh:['#f6a090','#c24a56','#7a2a44','#46142e'],
      bone:['#fff4d8','#dccfa6','#a09070','#605040'],
      moss:['#d4ffb0','#7ed08a','#3e8a6a','#1e4a44'],     // musgo-lunar
      vein:['#ffd0e0','#ff6a8a','#b02a5a','#5a1236'],
      eye:['#ffffff','#f0f0d8','#c0c09a','#6a6a52'],
      mouth:['#7c2e3e','#4c1828','#2e0c1a','#1a0610'],
      dirt:['#b8a27a','#86704e','#5c4a36','#352a20'],
      blood:['#c84a3e','#8e2a2c','#5e1824','#3a0e1a'],
      acid:['#e8ffb0','#a8e05a','#5e9a3a','#2e5222'],
      glow:['#fffbe0','#f0f0c0','#b0b08a','#6a6a52'],
      swish:['#fdfdff','#e6f0ff','#b4c4e8','#7484b0'],
      dust:['#f4e8d0','#d8c4a0','#a8906c','#6e5a44'],
    };
    if(form==='enluarado'){
      m.fur=['#6a7290','#3c4260','#262a44','#14162a']; m.furW=['#a8b4dc','#7880a8','#525a80','#30365a']; m.furT=['#b0b8d8','#8890b4','#646c90','#3c4262'];
      m.crest=['#5a6488','#2a3050','#181c34','#0c0e1e']; m.chin=['#f4faff','#cfd8f2','#8e96c4','#4c4f84'];
      m.snout=['#6a7090','#3e4260','#2a2e48','#16182a']; m.nose=['#d8c0ff','#9a84d0','#64529a','#342a62'];
      m.leg=['#646a88','#383c56','#24283e','#121420']; m.hoof=['#6c7090','#3a3e58','#24273a','#10121e'];
      m.flesh=['#f0b0ff','#b866d8','#7a3a9e','#46206a']; m.blood=['#b46ad8','#7e3ea6','#542474','#34144a'];
      m.vein=['#c8fbff','#4ad8f0','#2a8ab0','#1a4a7a']; m.moss=['#d0fff8','#6ae4e0','#2a9ab0','#16507a'];
      m.eye=['#ffffff','#b8fbff','#4ad8f0','#1a8aa8']; m.glow=['#effffe','#7af4ff','#2ab0d8','#146a96']; m.swish=['#ffffff','#c8fbff','#6ae4f4','#2a9ab8'];
      m.dirt=['#a8a0c8','#76709a','#4e4a70','#2e2a48']; m.dust=['#e8ecff','#bcc4e4','#8890b8','#545c84'];
    }
    if(form==='plenilunar'){
      m.fur=['#6a443c','#3e2420','#2a1420','#160810']; m.furW=['#d0805a','#a05440','#703434','#40181e']; m.furT=['#c08060','#8e5444','#6a3a34','#40201e'];
      m.crest=['#ff8a4a','#d8401e','#8a1c16','#44080c']; m.chin=['#fff0dc','#e8cbb4','#b4847e','#6a3c4a'];
      m.snout=['#7a4a46','#4e2a2a','#361c1e','#1e0c10']; m.nose=['#ffb0a0','#d0705e','#8a3a3a','#4a1a22'];
      m.tusk=['#fff4d8','#e8d4a6','#b09068','#6a4a34']; m.leg=['#6a4e4a','#3e2a2a','#281a1c','#140a0c'];
      m.flesh=['#ffc07a','#f06a3a','#a8302e','#5e1422']; m.blood=['#ff7a3a','#d43a26','#8a1c22','#4e0c18'];
      m.vein=['#fff0a0','#ffb43a','#e0581e','#8a2414']; m.moss=['#ffe0a0','#e09a4a','#a0562e','#5a2a1e'];
      m.eye=['#fffbe0','#ffe04a','#ff8a2a','#b83a14']; m.glow=['#fff6c0','#ffb43a','#e0581e','#8a2414']; m.swish=['#fffbe6','#ffe6a8','#ffb460','#d0602a'];
      m.dirt=['#b4705a','#844a3e','#5a2e2e','#36181e']; m.dust=['#ffe8c8','#e0b48c','#b07a5a','#6e4234'];
    }
    return punch(m);
  }
  const NAMES={fur:'Pelo',furW:'Luz do dorso',furT:'Pontas das cerdas',crest:'Crina',chin:'Queixo branco',snout:'Focinho',nose:'Disco do focinho',tusk:'Presas',leg:'Canelas',hoof:'Cascos',flesh:'Carne',bone:'Osso',moss:'Musgo-lunar',vein:'Veias',eye:'Olho de lua',mouth:'Boca',dirt:'Lama',blood:'Sangue',acid:'Ácido',glow:'Brilho',swish:'Rastro do golpe',dust:'Poeira'};
  function sat(h,k){ const [r,g,b]=PIX.hexRgb(h), y=(r+g+b)/3; return PIX.toHex(y+(r-y)*k,y+(g-y)*k,y+(b-y)*k); }
  const NOPUNCH={swish:1,glow:1,eye:1,dust:1};
  function punch(m){ const o={}; for(const k in m){ const r=m[k]; o[k]=NOPUNCH[k]?[r[0],r[1],r[2],r[3]]:[sat(r[0],1.08),sat(r[1],1.14),PIX.mix(sat(r[2],1.1),'#2a1a4c',0.18),PIX.mix(r[3],'#140a24',0.3)]; } return o; }

  /* ---------- poses ---------- */
  // smear 1 = arco das presas subindo, 2 = linhas de velocidade da investida · dust = poeira raspando o chão ·
  // clack = faísca do estalo de dentes · tongue = língua pra fora · tw = tremida do queixo (avanço da cabeça em px)
  const REST={hx:0,lift:0,rot:0,lean:0,head:16,jaw:0,nk:0,crest:0.35,ear:0,
    fNh:3,fNk:0,fFh:-3,fFk:0,bNh:-3,bNk:0,bFh:3,bFk:0,flash:0,smear:0,dust:0,clack:0,tongue:0,tw:0};
  const S=Math.sin, C=Math.cos, PI=Math.PI, mx=Math.max, mn=Math.min;
  // patas esparramadas (caído de barriga)
  const SPLAY={fNh:76,fNk:-6,fFh:66,fFk:-4,bNh:-74,bNk:-20,bFh:-64,bFk:-16};
  const gal=(ext,o)=>Object.assign(ext?{fNh:42,fNk:8,fFh:32,fFk:18,bNh:-40,bNk:2,bFh:-30,bFk:10,lift:4}:{fNh:-22,fNk:54,fFh:-12,fFk:42,bNh:26,bNk:44,bFh:18,bFk:32,lift:1},{head:30,lean:4,crest:1,jaw:10,smear:2},o||{});
  const ANIMS={
    idle:{nome:'Parado (fuça o chão, mexe as orelhas)',n:8,dur:()=>150,pose:i=>{ const p=i/8*PI*2, s=S(p);
      return {head:24+9*s, nk:1.2*S(2*p), jaw:2+4*mx(0,S(2*p+0.6)), lean:2+1.4*s, hx:0.4*S(p+1), crest:0.35+0.08*S(p+0.4),
        ear:(i===2||i===6)?-28:(i===3||i===7)?-10:0, fNh:i===4?8:3, fNk:i===4?16:0, dust:i===5?0.5:0}; }},
    walk:{nome:'Trote (pares diagonais)',n:8,dur:()=>95,pose:i=>{ const p=i/8*PI*2;
      const ah=15*S(p), ak=28*mx(0,C(p)), bh=15*S(p+PI), bk=28*mx(0,C(p+PI));
      return {fNh:ah, fNk:ak, bFh:ah*0.9, bFk:ak*0.9, fFh:bh, fFk:bk, bNh:bh*0.9, bNk:bk*0.9,
        lift:1.2*mx(0,S(2*p)), head:18+3*S(2*p+0.6), lean:1*S(2*p), ear:-8*mx(0,S(2*p)), crest:0.42, jaw:3, hx:0.6*S(p)}; }},
    alert:{nome:'Alerta (estala os dentes, crina em pé)',n:6,dur:i=>[150,100,80,100,80,180][i],pose:i=>[
      {head:8,crest:0.7,ear:-20,jaw:6,lean:-1},
      {head:2,crest:1,ear:-32,jaw:20,lean:-4,fNh:8,fNk:22},
      {head:5,crest:1,ear:-32,jaw:0,lean:-3,clack:1,fNh:2},
      {head:0,crest:1,ear:-32,jaw:22,lean:-4,fFh:6,fFk:20},
      {head:5,crest:1,ear:-30,jaw:0,lean:-3,clack:1},
      {head:12,crest:0.85,ear:-14,jaw:4}][i]},
    // ---- golpes (hit = quadro do dano; warn = quadros de aviso; reach = alcance em px lógicos) ----
    attack:{nome:'Presada (abaixa a cabeça, sobe com as presas)',n:8,hit:3,warn:[0,2],reach:32,dur:i=>[90,90,90,60,110,110,100,130][i],pose:i=>[
      {head:32,lean:4,hx:-1,crest:0.6,jaw:4},
      {head:42,lean:7,hx:-3,crest:0.85,jaw:6,fNh:-8,fFh:-12,bNh:-8,bFh:-2,bNk:10},
      {head:46,lean:8,hx:-4,crest:1,jaw:8,fNh:-10,fFh:-14,bNh:-10,bNk:14,bFh:-4},
      {head:-24,lean:-13,hx:6,crest:1,jaw:24,smear:1,fNh:18,fNk:26,fFh:8,fFk:10,bNh:-16,bFh:-20},
      {head:-18,lean:-10,hx:6,crest:1,jaw:16,fNh:14,fNk:20,bNh:-12,bFh:-16},
      {head:6,lean:-3,hx:4,crest:0.9,jaw:8},
      {head:28,lean:1,hx:2,crest:0.7,jaw:4,ear:-20},
      {head:12,hx:1,crest:0.5,jaw:3}][i]},
    charge:{nome:'Investida (raspa o chão, corre em linha reta)',n:10,warn:[0,3],run:[4,8],reach:240,dur:i=>[120,110,120,110,90,90,90,90,90,150][i],pose:i=>[
      {head:34,lean:5,hx:-2,crest:0.85,jaw:6,fNh:12,fNk:34},
      {head:36,lean:6,hx:-2,crest:1,jaw:8,fNh:-18,fNk:6,dust:1},
      {head:36,lean:6,hx:-2,crest:1,jaw:6,fNh:12,fNk:34},
      {head:38,lean:7,hx:-3,crest:1,jaw:10,fNh:-18,fNk:6,dust:1,ear:-30},
      gal(true), gal(false,{head:32,jaw:12}), gal(true,{head:28}), gal(false), gal(true,{jaw:14}),
      {head:16,lean:-7,crest:0.9,jaw:12,fNh:34,fNk:0,fFh:26,fFk:4,bNh:12,bNk:26,bFh:18,bFk:18,dust:1}][i]},
    snap:{nome:'Estalo de dentes (queixo treme, estala os caninos)',n:6,hit:3,warn:[0,2],reach:40,dur:i=>[100,90,100,70,120,150][i],pose:i=>[
      {head:10,jaw:5,crest:0.8,ear:-24,tw:1},
      {head:8,jaw:1,crest:0.9,ear:-28,tw:-1},
      {head:6,jaw:9,crest:1,ear:-30,tw:1,lean:-1},
      {head:-6,jaw:0,crest:1,ear:-30,lean:-5,hx:3,clack:1,flash:0},
      {head:14,jaw:16,crest:0.9,ear:-20,nk:-1},
      {head:12,jaw:3,crest:0.6}][i]},
    pant:{nome:'Ofegante (vulnerável depois da investida)',n:6,dur:()=>160,pose:i=>{ const p=i/6*PI*2;
      return {head:34+3*S(p), jaw:12+4*S(p), tongue:1, lean:5+1*S(p), crest:0.2, ear:-6, nk:0.6*S(p), hx:-0.4*S(p),
        fNh:10, fFh:4, bNh:-10, bFh:-4, fNk:4*mx(0,S(p)), bNk:6}; }},
    hurt:{nome:'Dano (cabeça)',n:4,dur:i=>[80,110,130,150][i],pose:i=>[
      {head:-8,lean:-8,hx:-4,jaw:18,flash:1,crest:1,ear:-32},
      {head:-2,lean:-6,hx:-3,jaw:12,crest:0.9,ear:-24},
      {head:10,lean:-2,hx:-1,jaw:6,crest:0.6},
      {head:15,jaw:3}][i]},
    hurtB:{nome:'Dano (corpo, dobra)',n:4,dur:i=>[80,120,140,150][i],pose:i=>[
      {lean:9,head:36,hx:-5,jaw:20,flash:1,crest:1,bNk:22,bFk:22,bNh:6,bFh:8,ear:-30},
      {lean:7,head:30,hx:-4,jaw:14,crest:0.9,bNk:14,bFk:14},
      {lean:3,head:22,hx:-2,jaw:6},
      {head:17,jaw:3}][i]},
    fall:{nome:'Derrubado',n:5,dur:i=>[90,100,120,160,260][i],pose:i=>[
      {head:-12,lean:-10,hx:-4,jaw:22,flash:1,crest:1,ear:-32},
      {rot:-16,lean:-8,head:2,jaw:26,crest:1,hx:-4,fNh:40,fNk:10,fFh:30,fFk:10,bNh:-12,bFh:-24},
      Object.assign({rot:-4,lean:4,head:34,jaw:22,crest:0.8,hx:-2},SPLAY),
      Object.assign({rot:-2,lean:5,head:42,jaw:18,crest:0.6,hx:-2},SPLAY,{fNk:-12,bNk:-26}),
      Object.assign({rot:-2,lean:5,head:44,jaw:14,crest:0.5,hx:-2},SPLAY)][i]},
    getup:{nome:'Levantar',n:5,dur:i=>[180,140,140,140,150][i],pose:i=>[
      Object.assign({rot:-2,lean:5,head:44,jaw:14,crest:0.5,hx:-2},SPLAY),
      {rot:-2,lean:2,head:30,jaw:10,crest:0.6,hx:-2,fNh:40,fNk:30,fFh:34,fFk:30,bNh:-50,bNk:-10,bFh:-40,bFk:-6},
      {lean:-4,head:18,jaw:8,crest:0.8,fNh:14,fNk:8,fFh:8,fFk:6,bNh:-30,bNk:20,bFh:-20,bFk:20},
      {lean:-2,head:10,jaw:6,crest:0.9,ear:-20,fNh:4,bNh:-10,bNk:12,bFh:-4,bFk:10},
      {head:15,jaw:3,crest:0.6}][i]},
    death:{nome:'Morte (desaba de lado, patas tremem)',n:7,dur:i=>[90,140,160,150,140,160,700][i],pose:i=>[
      {head:-14,lean:-10,hx:-4,jaw:28,flash:1,crest:1,ear:-32},
      {rot:-18,lean:-8,head:0,jaw:30,crest:1,hx:-4,fNh:44,fNk:14,fFh:32,fFk:14,bNh:-14,bFh:-26},
      Object.assign({rot:-6,lean:6,head:40,jaw:30,crest:0.7,hx:-2,tongue:1},SPLAY),
      Object.assign({rot:-3,lean:6,head:46,jaw:26,crest:0.5,hx:-2,tongue:1},SPLAY,{fNk:-22,bNk:-34,bFk:-6}),
      Object.assign({rot:-3,lean:6,head:46,jaw:26,crest:0.4,hx:-2,tongue:1},SPLAY,{fNk:4,fFk:-14,bNk:-8,bFk:-26}),
      Object.assign({rot:-3,lean:6,head:47,jaw:24,crest:0.3,hx:-2,tongue:1},SPLAY,{fNk:-14,bNk:-28}),
      Object.assign({rot:-3,lean:6,head:48,jaw:24,crest:0.25,hx:-2,tongue:1},SPLAY)][i]},
    tumble:{nome:'Voando (lançado)',n:4,dur:()=>70,loop:1,pose:i=>[
      {rot:0,flash:1,head:-10,jaw:24,crest:1,ear:-32,fNh:40,fNk:30,fFh:-20,fFk:40,bNh:30,bNk:30,bFh:-40,bFk:10},
      {rot:-90,head:-6,jaw:28,crest:1,ear:-32,fNh:-10,fNk:50,fFh:50,fFk:10,bNh:-40,bNk:10,bFh:30,bFk:40},
      {rot:-180,head:-12,jaw:20,crest:1,ear:-32,fNh:50,fNk:20,fFh:-10,fFk:50,bNh:20,bNk:40,bFh:-30,bFk:20},
      {rot:-270,head:-8,jaw:26,crest:1,ear:-32,fNh:-20,fNk:40,fFh:40,fFk:20,bNh:-30,bNk:20,bFh:40,bFk:30}][i]},
    grabbed:{nome:'Agarrado (esperneia)',n:4,dur:()=>110,loop:1,pose:i=>[
      {lean:-8,head:-6,jaw:22,crest:1,ear:-30,lift:6,fNh:30,fNk:30,fFh:-10,fFk:20,bNh:-30,bNk:10,bFh:10,bFk:30},
      {lean:-12,head:2,jaw:8,crest:1,ear:-30,lift:7,fNh:-10,fNk:20,fFh:30,fFk:30,bNh:10,bNk:30,bFh:-30,bFk:10},
      {lean:-9,head:-10,jaw:26,crest:1,ear:-30,lift:6,fNh:24,fNk:40,fFh:-6,fFk:10,bNh:-24,bNk:20,bFh:16,bFk:20},
      {lean:-13,head:4,jaw:10,crest:1,ear:-30,lift:7,fNh:-14,fNk:10,fFh:26,fFk:40,bNh:16,bNk:20,bFh:-26,bFk:30}][i]},
  };
  function poseOf(anim,i){ const A=ANIMS[anim]; return Object.assign({},REST,A.pose(i)); }
  function heavyOutline(cv){ const g=cv.getContext('2d'), W=cv.width, H=cv.height, im=PIX.pix(cv), d=im.data;
    const isO=i=>d[i+3]===255&&d[i]===0x17&&d[i+1]===0x0b&&d[i+2]===0x1c, fill=i=>d[i+3]===255&&!isO(i);
    const add=[]; for(let y=2;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(d[i+3]) continue; const u=((y-1)*W+x)*4, u2=((y-2)*W+x)*4; if(isO(u)&&fill(u2)) add.push(i); }
    add.forEach(i=>{ d[i]=0x17; d[i+1]=0x0b; d[i+2]=0x1c; d[i+3]=255; }); g.putImageData(im,0,0); }

  /* ---------- esqueleto de quadrúpede ---------- */
  const lp=(p,a,L)=>({x:p.x+S(rad(a))*L, y:p.y+C(rad(a))*L});   // 0 = pra baixo, + = pra frente
  const rotA=(p,o,a)=>{ const c=C(a), s=S(a), dx=p.x-o.x, dy=p.y-o.y; return {x:o.x+dx*c-dy*s, y:o.y+dx*s+dy*c}; };
  const clampT=(v,a,b)=>mx(a,mn(b,v));
  function front(B,R,h,k,far){
    const sh=far?B(15,10):B(19,9);
    const ua=h-2+k*0.35, la=h-k*1.1;
    const knee=lp(sh,ua-R,12), fet=lp(knee,la-R,8.6);
    return {sh,knee,fet,hr:R+clampT(-la*0.8,-16,80)};
  }
  function hind(B,R,h,k,far){
    const hp=far?B(-19,12):B(-22,11);
    const ta=h+20+k*0.4, ga=h-28-k*0.9, ca=h+2+k*0.3;
    const st=lp(hp,ta-R,9), hock=lp(st,ga-R,9.4), fet=lp(hock,ca-R,6);
    return {hp,st,hock,fet,hr:R+clampT(-ca*0.8,-16,80)};
  }
  const hoofPts=(L)=>[[-1.8,3.4],[3.6,3.4],[3.8,2.4]].map(([x,y])=>{ const a=rad(L.hr), c=C(a), s=S(a); return {x:L.fet.x+x*c-y*s, y:L.fet.y+x*s+y*c}; });
  function build(P,dy){
    const R=P.rot, hip={x:AXS+P.hx, y:dy}, A=R+P.lean, a=rad(A);
    const fw={x:C(a),y:S(a)}, up={x:S(a),y:-C(a)};
    const B=(u,v)=>({x:hip.x+fw.x*u+up.x*v, y:hip.y+fw.y*u+up.y*v});
    const fN=front(B,R,P.fNh,P.fNk,false), fF=front(B,R,P.fFh,P.fFk,true);
    const bN=hind(B,R,P.bNh,P.bNk,false), bF=hind(B,R,P.bFh,P.bFk,true);
    const N=B(25+P.nk+(P.tw||0)*0.8,22), ha=rad(A+P.head), hc=C(ha), hs=S(ha);
    const H=(x,y)=>({x:N.x+(x*hc-y*hs)*HS, y:N.y+(x*hs+y*hc)*HS});
    const ja=ha+rad(P.jaw), jc=C(ja), js=S(ja), JP=H(2,5.5);
    const J=(x,y)=>({x:JP.x+(x*jc-y*js)*HS, y:JP.y+(x*js+y*jc)*HS});
    const hull=[];
    [fN,fF,bN,bF].forEach(L=>hoofPts(L).forEach(q=>hull.push(q)));
    [[-26,2.5],[-14,0],[0,-0.5],[12,0.5],[22,3],[-33,7],[-35.5,14],[12,39],[-24,28]].forEach(([u,v])=>hull.push(B(u,v)));
    hull.push(H(30.6,-2),H(30.4,1.6),H(-4,-12),J(26,0.4),J(8,4.6));
    return {R,A,fw,up,hip,B,fN,fF,bN,bF,N,ha,H,ja,JP,J,hull};
  }
  function skeleton(P){
    const a=build(P,0); let m=-1e9; a.hull.forEach(p=>{ m=mx(m,p.y); });
    return build(P,GS-m-(P.lift||0));
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
  const PT=q=>[q.x,q.y];
  // ruído determinístico (fios de pelo / pontas grisalhas sempre no mesmo lugar)
  let seed=7; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
  const STROKES=[]; for(let i=0;i<70;i++){ STROKES.push([-33+rnd()*62, 2+rnd()*31, 0.6+rnd()*0.6, rnd()]); }
  const TIPS=[]; for(let i=0;i<80;i++){ TIPS.push([-32+rnd()*58, 6+rnd()*29, rnd()]); }

  /* ---------- patas ---------- */
  function drawHoof(p,M,L,far){
    p.xf(rad(L.hr),L.fet.x,L.fet.y);
    p.F(M.hoof[far?2:1]); p.poly([[-1.8,-0.6],[2.4,-0.8],[3.8,2.4],[3.6,3.4],[-1.8,3.4],[-2.2,1]]);
    p.F(M.hoof[far?3:2]); p.poly([[-1.8,2],[3.7,2.4],[3.6,3.4],[-1.8,3.4]]); p.rect(0.8,-0.4,0.6,3.6); // casco fendido
    if(!far){ p.F(M.hoof[0]); p.rect(-1,-0.4,1.4,0.7); p.rect(1.8,0,0.7,1.4); }
    p.F(M.hoof[far?3:2]); p.ell(-2.4,0.6,0.9,0.7); // unha de trás (paradigito)
    p.F(M.dirt[far?2:1]); p.rect(-1.4,2.6,4.4,0.8);
    p.id();
  }
  function drawFront(c,u,M,sk,P,far){
    const p=mkPen(c,u); p.id(); const L=far?sk.fF:sk.fN;
    const RF=far?[M.fur[2],M.fur[2],M.fur[3],M.fur[3]]:M.fur, RL=far?[M.leg[2],M.leg[2],M.leg[3],M.leg[3]]:M.leg;
    limb(p,RF,L.sh,L.knee,far?7:9,4.4,{hl:0.6});
    const n=limb(p,RL,L.knee,L.fet,3.4,2.6,{deep:false,hl:0.85,hi:!far});
    p.F(RL[1]); p.circle(L.knee,2.2); if(!far){ p.F(RL[0]); p.rect(L.knee.x-n.nx*1-0.6,L.knee.y-n.ny*1-0.6,1,1); }
    p.F(far?M.fur[3]:M.fur[2]); p.cap(lerp(L.sh,L.knee,0.55),L.knee,3.2,2.6); // pelo descendo até o joelho
    if(!far){ p.F(M.furT[2]); [0.3,0.55].forEach(t=>{ const q=lerp(L.sh,L.knee,t); p.rect(q.x-n.nx*2.2-0.4,q.y-n.ny*2.2-0.3,0.9,0.6); }); }
    p.F(M.dirt[far?3:2]); p.cap(lerp(L.knee,L.fet,0.75),L.fet,2.8,2.6);
    drawHoof(p,M,L,far);
  }
  function drawHind(c,u,M,sk,P,far){
    const p=mkPen(c,u); p.id(); const L=far?sk.bF:sk.bN;
    const RF=far?[M.fur[2],M.fur[2],M.fur[3],M.fur[3]]:M.fur, RL=far?[M.leg[2],M.leg[2],M.leg[3],M.leg[3]]:M.leg;
    limb(p,RF,L.hp,L.st,far?10:13,6.4,{hl:0.5});   // presunto/coxa
    limb(p,RF,L.st,L.hock,5.4,3.4,{hl:0.7,hi:!far});
    const n=limb(p,RL,L.hock,L.fet,3,2.6,{deep:false,hl:0.85,hi:!far});
    p.F(RL[1]); p.circle(L.hock,2); p.F(far?M.leg[3]:M.bone[2]); p.circle({x:L.hock.x-n.nx*0.4,y:L.hock.y-n.ny*0.4},0.8); // ponta do jarrete
    if(!far){ p.F(M.furT[2]); [0.25,0.5,0.75].forEach(t=>{ const q=lerp(L.hp,L.st,t); p.rect(q.x-1.6,q.y-2.4,1,0.6); }); p.F(M.fur[3]); p.cap(lerp(L.hp,L.st,0.2),lerp(L.st,L.hock,0.3),1,0.8); }
    p.F(M.dirt[far?3:2]); p.cap(lerp(L.hock,L.fet,0.6),L.fet,2.6,2.6);
    drawHoof(p,M,L,far);
  }

  /* ---------- corpo em barril (pesado na frente) ---------- */
  const BODY=[[22,36.4],[12,39],[0,36.6],[-12,32.4],[-24,27.6],[-31.6,21.6],[-34.6,14],[-32.4,7.6],[-26,3.6],[-14,1.4],[0,0],[12,-0.6],[22,1.4],[29,6.6],[32.4,15],[31.4,23.4],[28,30.6]];
  // rasgo irregular no flanco (costelas aparecendo)
  const TEAR=[[-4.6,10.6],[-2,9.4],[0.6,10.4],[3,8.8],[5.6,10],[7.8,11.6],[8.2,14],[9.4,15.6],[7.4,17.4],[5.4,19],[2.4,18.2],[0,19.6],[-2.6,18],[-4.8,17.6],[-5.4,15],[-6.6,13.2]];
  // mechas de pelo (tufos que descem pra trás): [u, v, comprimento, largura, tom]
  const TUFTS=[]; for(let i=0;i<34;i++){ const u=-31+rnd()*58, v=3+rnd()*31; TUFTS.push([u,v,3.4+rnd()*2.6,1.4+rnd()*0.8,rnd()]); }
  function tuft(p,B,u,v,L,W){ const a=B(u,v), b=B(u-L,v-L*0.42), m=B(u-L*0.35,v-L*0.15+W*0.5), n=B(u-L*0.35,v-L*0.15-W*0.5); p.poly([PT(a),PT(m),PT(b),PT(n)]); }
  function drawBody(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id(); const B=sk.B, Q=l=>l.map(([a,b])=>PT(B(a,b)));
    // cauda minúscula
    p.F(M.fur[2]); p.cap(B(-33,21),B(-37,16.6),2.6,1.6); p.F(M.crest[2]); p.cap(B(-36,17.6),B(-37.6,14.6),1.4,0.8);
    // pescoço grosso (liga o peito à nuca e à garganta)
    const H=sk.H, NK=[PT(B(20,38)),PT(H(0,-12.8)),PT(H(-5,-4)),PT(H(-1,8)),PT(B(29,7.6)),PT(B(32,18))];
    p.F(M.fur[1]); p.poly(NK);
    p.F(M.fur[2]); p.poly([PT(H(-1,8)),PT(B(29,7.6)),PT(B(32,14)),PT(H(-4,2))]);
    p.F(M.fur[1]); p.poly(Q(BODY));
    clip(c,Q(BODY),()=>{
      // volumes: barriga e garupa na sombra fria, dorso na luz quente
      p.F(M.fur[2]); p.poly(Q([[-38,13],[-26,8],[-10,6],[8,6.4],[22,8],[36,10],[36,-4],[-38,-4]]));
      p.F(M.fur[3]); p.poly(Q([[-38,5.4],[-22,3.4],[-6,2],[10,1.6],[26,3.6],[36,4.6],[36,-4],[-38,-4]]));
      p.F(M.fur[3]); p.poly(Q([[-38,24],[-33,20],[-30.6,11],[-34,4],[-38,4]]));
      p.F(M.furW[2]); p.poly(Q([[22,36.4],[12,39],[0,36.6],[-12,32.4],[-24,27.6],[-30,24],[-22,25],[-10,28.8],[2,32],[12,34],[22,33]]));
      p.F(M.furW[1]); p.poly(Q([[22,36.4],[12,39],[2,37],[-8,34],[-4,33.6],[6,35.6],[14,36.6],[21,35]]));
      // ombro em massa (pesado na frente)
      p.F(M.fur[0]); p.poly(Q([[18,30],[26,27],[29,20],[26,14],[22,20],[18,26]]));
      // mechas de pelo em blocos limpos
      TUFTS.forEach(([x,y,L,W,r])=>{
        const top=y>27, low=y<12;
        p.F(top?(r<0.5?M.furW[1]:M.furW[2]):low?(r<0.5?M.fur[3]:M.fur[2]):(r<0.25?M.fur[0]:r<0.6?M.fur[2]:M.fur[3]));
        tuft(p,B,x,y,L,W);
        if(!low&&r>0.7){ p.F(top?M.furW[0]:M.furT[1]); const a=B(x,y), b=B(x-L*0.5,y-L*0.2); p.cap(a,b,0.7,0.4); }
      });
      // divisões de músculo (ombro e presunto)
      p.F(M.fur[3]); p.cap(B(26,13),B(17,6),1.2,0.6); p.cap(B(-19,25),B(-29,10),1.2,0.6); p.cap(B(18,30),B(22,20),0.9,0.6);
      // glândula de almíscar nas costas
      p.F(M.crest[3]); { const q=B(-16,30.4); p.ell(q.x,q.y,1.8,1); } p.F(M.flesh[3]); { const q=B(-16,30.2); p.rect(q.x-0.5,q.y-0.4,1,0.6); }
      // rasgo com costelas curvas em perspectiva
      p.F(M.flesh[3]); p.poly(Q(TEAR));
      p.F(M.mouth[2]); p.poly(Q([[-3,12],[6,11.4],[7.6,15],[5,17.8],[-2,17.4],[-4.4,15]]));
      [-2.6,1.4,5.2].forEach((x,i)=>{ const a=B(x+0.6,18-(i===2?0.8:0)), m=B(x+1.4,14.6), b=B(x,10.6+(i===2?0.8:0));
        p.F(M.mouth[3]); p.cap(B(x+2.2,17.6),B(x+2.6,11.4),1.2,1); // sombra entre as costelas
        p.F(M.bone[2]); p.cap(a,m,1.9,1.9); p.cap(m,b,1.9,1.6);
        p.F(form==='plenilunar'?M.bone[0]:M.bone[1]); p.cap(lerp(a,m,0.15),m,1,1); p.cap(m,lerp(m,b,0.6),1,0.8);
        p.F(M.bone[0]); { const q=lerp(m,b,0.2); p.rect(q.x-0.4,q.y-0.4,0.8,0.8); } });
      p.F(M.flesh[2]); [[-4.6,11.6,-2,10.4],[5.6,10.6,8,12.4],[7.8,16.6,5.4,18.4],[-2,18.4,-4.6,17]].forEach(([a,b,c2,d])=>p.cap(B(a,b),B(c2,d),0.9,0.7)); // borda de carne
      p.F(M.vein[1]); p.cap(B(-6.4,13.4),B(-10,11),0.6,0.4); p.cap(B(9,15.6),B(12.6,17.6),0.6,0.4);
      p.F(M.vein[0]); { const q=B(-6.4,13.4); p.rect(q.x-0.4,q.y-0.4,0.8,0.8); }
      // pelo rasgado pendurado na borda
      p.F(M.fur[1]); [[-4,19.4,1.6],[1,20.6,1.2],[6,19.8,1.8],[9.6,16.4,1.2],[-6.8,14,1.4]].forEach(([x,y,k])=>{ const q=B(x,y); p.poly([[q.x-k,q.y-0.4],[q.x+k,q.y-0.4],[q.x+0.3,q.y+k*1.4]]); });
      p.F(M.blood[2]); { const q=B(2.6,8.8); p.ell(q.x,q.y,1.2,0.6); const r=B(3,8); p.rect(r.x-0.4,r.y,0.8,2); }
      // lama só na barriga baixa
      p.F(M.dirt[3]); p.poly(Q([[-22,3.4],[-10,2],[2,1.6],[14,2.4],[8,3.4],[-4,3],[-14,3.8]]));
      if(form==='enluarado'){ p.F(M.glow[1]); [[-24,22,-20,18],[-20,18,-23,14],[-23,14,-19,10],[-14,25,-11,21],[16,28,20,23]].forEach(([a,b,c2,d])=>p.cap(B(a,b),B(c2,d),0.7,0.6)); p.F(M.glow[0]); { const q=B(-20,18); p.rect(q.x-0.4,q.y-0.4,0.8,0.8); } }
      if(form==='plenilunar'){ p.F(M.blood[2]); p.poly(Q([[18,29],[24,25],[26,17],[22,19],[18,25]])); p.poly(Q([[-28,20],[-22,16],[-20,18],[-26,23]])); p.F(M.blood[1]); [[22,24],[-24,19]].forEach(([x,y])=>{ const q=B(x,y); p.rect(q.x-0.4,q.y,0.8,2.4); }); }
    });
    // musgo-lunar no dorso (atrás da crina)
    p.F(M.moss[2]); p.poly(Q([[-6,34.6],[-2,37],[4,37.6],[8,36.6],[2,35.4]])); p.F(M.moss[1]); p.poly(Q([[-4,35.6],[0,37],[4,36.9],[1,35.6]]));
    p.F(M.moss[0]); { const q=B(1,36.9); p.rect(q.x-0.5,q.y-0.5,1,1); }
  }

  /* ---------- crina (cerdas eriçadas em mechas grossas) ---------- */
  function drawCrest(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id(); const B=sk.B, H=sk.H, e=mx(0,mn(1.2,P.crest));
    const line=[H(12,-11.2),H(7,-12.6),H(2,-13.2),H(-3,-12.6),B(22,37.6),B(16,39.6),B(10,39.2),B(4,37.8),B(-2,36),B(-8,34),B(-14,32),B(-20,29.4)];
    const n=line.length;
    // base da crina (faixa escura sobre a espinha)
    p.F(M.crest[3]); for(let i=0;i<n-1;i++) p.cap(line[i],line[i+1],2.4,2);
    for(let i=0;i<n-1;i++){
      const a=line[i], b=line[i+1], dx=b.x-a.x, dy=b.y-a.y, L=Math.hypot(dx,dy)||1, tx=dx/L, ty=dy/L;
      let nx=ty, ny=-tx; if(ny>0){ nx=-nx; ny=-ny; } // normal pra cima
      const t=i/(n-1), q=lerp(a,b,0.5), w=Math.min(2.8,L*0.62);
      const len=(i<3?2.6:3.6)*(1-0.5*t*t)*(1+1.3*e)*(1+0.2*S(i*2.1)), back=(1-e)*0.95+0.3;
      const tip={x:q.x+nx*len+tx*len*back, y:q.y+ny*len+ty*len*back};
      // mecha grossa: base larga, ponta
      p.F(M.crest[2]); p.poly([[q.x-tx*w,q.y-ty*w],[tip.x,tip.y],[q.x+tx*w,q.y+ty*w]]);
      p.F(M.crest[1]); p.poly([[q.x-tx*w*0.7,q.y-ty*w*0.7],[lerp(q,tip,0.7).x,lerp(q,tip,0.7).y],[q.x-tx*w*0.05,q.y-ty*w*0.05]]);
      if(i%3===1){ p.F(M.crest[0]); const h=lerp(q,tip,0.35); p.rect(h.x-0.5,h.y-0.5,1,1); }
    }
    // musgo-lunar preso nas cerdas
    p.F(M.moss[2]); [5,8].forEach(i=>{ const q=line[i]; p.ell(q.x,q.y-1.2,2.4,1.3); });
    p.F(M.moss[1]); [5,8].forEach(i=>{ const q=line[i]; p.ell(q.x-0.4,q.y-1.7,1.4,0.8); });
    p.F(M.moss[0]); { const q=line[5]; p.rect(q.x-0.6,q.y-2.3,1,0.8); }
    if(form==='enluarado'){ p.F(M.glow[1]); [2,6,9].forEach(i=>{ const q=line[i]; p.rect(q.x-0.5,q.y-2.4-e*2,1,1.4); }); }
    if(form==='plenilunar'){ p.F(M.crest[0]); [1,3,5,8].forEach(i=>{ const q=line[i]; p.rect(q.x-0.5,q.y-2.6-e*3,1,1.6); }); }
  }

  /* ---------- cabeça ---------- */
  const UP=[[-7,-5],[-4,-12],[3,-13.4],[10,-12],[17,-9.4],[23,-6.6],[27.4,-5],[29.6,-4.6],[30.6,-2],[30.4,1.6],[28.6,3],[22,3.8],[14,5],[6,7],[-2,7.6],[-7,4]];
  function drawHead(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.xf(sk.ha,sk.N.x,sk.N.y); c.scale(HS,HS);
    // boca por dentro (aparece quando a mandíbula abre)
    if(P.jaw>5){ p.F(M.mouth[3]); p.poly([[2,5],[27,2.6],[28,8],[4,11]]); p.F(M.mouth[1]); p.poly([[6,5.4],[25,3.2],[25,5.4],[8,7.4]]); p.F(M.flesh[2]); p.ell(14,7,4,1.2);
      p.F(M.tusk[2]); for(let x=9;x<20;x+=3.2) p.rect(x,4.6-x*0.06,2,1); }
    // orelha de trás
    p.F(M.fur[3]); p.poly([[-2,-11],[-6,-17],[-8,-12.4]]);
    p.F(M.fur[1]); p.poly(UP);
    clip(c,UP,()=>{
      p.F(M.fur[2]); p.poly([[-8,-1],[6,-2.4],[16,-1.6],[26,-0.6],[32,0],[32,9],[-8,9]]);     // bochecha/maxilar na sombra
      p.F(M.fur[0]); p.poly([[1,-13],[10,-11.6],[17,-9],[23,-6.2],[27.4,-4.6],[23,-5.4],[17,-7.8],[10,-10.4],[1,-11.8]]); // cana do nariz na luz
      p.F(M.fur[2]); p.poly([[-8,-4],[-4,-8],[-1,0],[-3,7],[-8,7]]);                     // nuca
      // pelo da cara (riscos e pontas grisalhas)
      [[3,-8,-1,-5],[7,-4,2,-1],[13,-7,9,-4],[18,-6,14,-3],[5,1,1,3],[-1,-9,-4,-6]].forEach(([a,b,c2,d],i)=>{ p.F(i%2?M.fur[3]:M.furT[2]); p.cap({x:a,y:b},{x:c2,y:d},0.7,0.3); });
      p.F(M.furT[1]); [[5,-10.4],[11,-9.6],[15,-7.6],[2,-7],[-2,-3]].forEach(([x,y])=>p.rect(x,y,1.2,0.6));
      // focinho (pele nua mais clara perto do disco)
      p.F(M.snout[1]); p.poly([[21,-6.8],[30,-4.8],[31,3],[21,4],[19,0]]);
      p.F(M.snout[2]); p.poly([[20,0.8],[31,0.4],[31,3],[21,4]]);
      p.F(M.snout[0]); p.rect(22,-6.2,5,0.6);
      p.F(M.snout[3]); [[22.6,-4,24,-2.4],[25,-4.2,26.2,-2.6]].forEach(([a,b,c2,d])=>p.cap({x:a,y:b},{x:c2,y:d},0.5,0.4)); // rugas
      // queixo branco: lábio de cima e bochecha baixa
      p.F(M.chin[2]); p.poly([[8,6.2],[14,4.2],[20,3.4],[26,3.1],[29.4,2.9],[29.4,4],[8,7.4]]);
      p.F(M.chin[1]); p.poly([[12,5],[18,3.8],[24,3.3],[29.4,3.1],[29.4,3.7],[18,4.4],[12,5.8]]);
      p.F(M.chin[0]); p.rect(19,3.4,5,0.5);
    });
    // disco do focinho
    p.F(M.nose[2]); p.ell(29.9,-1.3,1.9,3.5);
    p.F(M.nose[1]); p.ell(30.2,-1.6,1.4,2.9);
    p.F(M.nose[0]); p.rect(30.3,-3.8,0.8,1.2);
    p.F(M.nose[3]); p.ell(30.7,-0.8,0.6,1); p.ell(30.3,-2.8,0.5,0.6);
    // olho de lua
    p.F(M.snout[3]); p.ell(9,-6.4,2.4,1.7);
    p.F(M.eye[2]); p.ell(9.2,-6.4,1.6,1.2); p.F(M.eye[1]); p.ell(9.4,-6.6,1.2,0.9); p.F(M.eye[0]); p.rect(9.2,-7.1,0.8,0.6);
    p.F(M.fur[3]); p.poly([[6,-8.6],[12,-8.2],[11,-7.4],[7,-7.6]]); // sobrancelha franzida
    if(form!=='comum'){ p.F(M.glow[1]); p.rect(11,-6.8,2.6,0.6); p.F(M.glow[2]); p.rect(13.6,-6.6,1.4,0.5); }
    // orelha da frente (pequena e redonda)
    const ea=rad(P.ear||0), ce=C(ea), se=S(ea), E=(x,y)=>[0+x*ce-y*se, -12+x*se+y*ce];
    p.F(M.fur[1]); p.poly([E(1,0),E(-1.6,-6),E(-4.2,-6.6),E(-5.6,-3.4),E(-4,0.4)]);
    p.F(M.flesh[3]); p.poly([E(-0.6,-0.8),E(-2,-5),E(-3.8,-5.2),E(-4.2,-1.4)]);
    p.F(M.furT[1]); p.poly([E(-1.6,-6),E(-4.2,-6.6),E(-3.4,-5.8)]);
    // presa de cima (desce reta, lascada)
    const tl=form==='plenilunar'?9.4:6.4, T=form==='plenilunar'?M.bone:M.tusk;
    p.F(T[2]); p.poly([[20.4,3],[23,3.2],[23,3.2+tl*0.6],[21.8,3.2+tl],[20.8,3.2+tl*0.9]]);
    p.F(T[1]); p.poly([[20.6,3],[22.2,3.1],[22,3.2+tl*0.8],[21,3.2+tl*0.85]]);
    p.F(T[0]); p.rect(20.9,3.8,0.6,tl*0.5); p.F(T[3]); p.cap({x:23,y:3.4},{x:21.9,y:3.2+tl},0.6,0.5);
    p.F(M.blood[2]); p.rect(20.6,3.2,2.4,0.8);
    // osso exposto na têmpora + carne
    p.F(M.flesh[2]); p.ell(3,-5.4,2,1.4); p.F(M.bone[1]); p.ell(3.4,-5.6,1.2,0.8); p.F(M.bone[0]); p.rect(3,-6,0.6,0.5);
    if(form==='plenilunar'){ p.F(M.bone[1]); [[5,-12.4],[10,-11.4]].forEach(([x,y])=>p.poly([[x-1.4,y+0.6],[x-0.6,y-3.4],[x+1,y+0.4]])); }
    p.id();
  }
  function drawJaw(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.xf(sk.ja,sk.JP.x,sk.JP.y); c.scale(HS,HS);
    const JAW=[[-6,0],[4,0],[12,-0.5],[19,-0.9],[25,-1],[25.4,0.4],[22.4,1.8],[14,3],[6,3.8],[0,4],[-5,2.6]];
    p.F(M.snout[2]); p.poly(JAW);
    clip(c,JAW,()=>{
      p.F(M.snout[1]); p.poly([[-2,-2],[28,-2],[28,0.6],[16,1.4],[4,2],[-2,2]]);
      p.F(M.snout[3]); p.poly([[-8,3.4],[10,3.4],[20,2.2],[28,1.2],[28,8],[-8,8]]);
      p.F(M.fur[2]); p.poly([[-8,-1],[4,-1],[2,2],[6,8],[-8,8]]); // garganta escura
      // faixa branca-creme do lábio de baixo e do queixo
      p.F(M.chin[1]); p.poly([[8,-0.2],[25.4,-1.2],[25.4,0.6],[22.4,2],[18,2.6],[16,1.2],[8,1]]);
      p.F(M.chin[2]); p.poly([[16,1.2],[22.4,2],[18,2.6]]);
      p.F(M.chin[0]); p.rect(12,-0.2,6,0.5);
      // mandíbula rachada: osso aparecendo
      p.F(M.flesh[3]); p.poly([[11,-0.4],[14,0.2],[13,2],[15,4.6],[12.4,4.6],[11.6,2]]);
      p.F(M.bone[2]); p.poly([[11.8,0.2],[13.2,0.6],[12.4,2],[13.6,4.2],[12.8,4.2],[12,2]]);
      if(form==='enluarado'){ p.F(M.glow[1]); p.cap({x:14,y:2},{x:19,y:3},0.6,0.5); }
    });
    // presa de baixo (sobe por fora do lábio)
    const tl=form==='plenilunar'?8:5.6, T=form==='plenilunar'?M.bone:M.tusk;
    p.F(T[2]); p.poly([[21.4,-0.6],[24,-0.8],[23.4,-0.8-tl*0.8],[22.4,-0.8-tl]]);
    p.F(T[1]); p.poly([[21.8,-0.6],[23.2,-0.7],[22.8,-0.8-tl*0.75],[22.4,-0.8-tl*0.9]]);
    p.F(T[0]); p.rect(22.2,-0.8-tl*0.6,0.5,tl*0.4);
    p.F(T[3]); p.cap({x:24,y:-0.8},{x:22.6,y:-0.8-tl},0.6,0.5); p.rect(22.6,-0.8-tl,0.9,0.7); // lasca na ponta
    // baba de sangue pingando do canto da boca
    const dl=2+P.jaw*0.12;
    p.F(M.blood[1]); p.cap({x:6,y:4.4},{x:6.6,y:4.4+dl},1,0.7); p.F(M.blood[2]); p.circle({x:6.6,y:4.4+dl},0.9);
    p.F(M.blood[1]); p.cap({x:17,y:3.2},{x:17.4,y:4.6+dl*0.4},0.8,0.6);
    if(P.tongue>0){ p.F(M.flesh[1]); p.cap({x:15,y:0.6},{x:24,y:3.2},2.2,1.8); p.F(M.flesh[0]); p.rect(17,0.4,4,0.6); p.F(M.flesh[2]); p.cap({x:19,y:2.4},{x:24,y:3.6},0.6,0.6); }
    p.id();
  }

  /* ---------- efeitos ---------- */
  function drawFx(c,u,M,sk,P){
    const p=mkPen(c,u); p.id(); const cl=q=>[mx(1,mn(FW/BS-2,q.x)),mx(1,mn(GS+1,q.y))];
    if(P.smear===1){ // arco das presas subindo
      const o=sk.H(10,2), R1=24, R2=17, A0=sk.ha;
      const arc=(r,t)=>({x:o.x+C(A0+t)*r, y:o.y+S(A0+t)*r});
      const pts=[]; for(let i=0;i<=8;i++) pts.push(cl(arc(R1,rad(70-i*17.5))));
      for(let i=8;i>=0;i--) pts.push(cl(arc(R2+(i/8)*4,rad(70-i*17.5))));
      p.F(M.swish[1]); p.poly(pts);
      p.F(M.swish[0]); const p2=[]; for(let i=1;i<=7;i++) p2.push(cl(arc(R1-0.6,rad(70-i*17.5)))); for(let i=7;i>=1;i--) p2.push(cl(arc(R1-3,rad(70-i*17.5)))); p.poly(p2);
      p.F(M.swish[2]); [20,-10,-40].forEach(d=>p.cap(arc(R2-1,rad(d)),arc(R2-6,rad(d+12)),0.7,0.4));
    }
    if(P.smear===2){ // linhas de velocidade atrás da investida
      const B=sk.B;
      p.F(M.swish[1]); [[6,-40,-78],[14,-42,-88],[22,-38,-72],[30,-30,-56]].forEach(([v,u0,u1])=>p.cap(B(u0,v),B(u1,v),1.4,0.4));
      p.F(M.swish[0]); [[10,-44,-66],[18,-46,-70]].forEach(([v,u0,u1])=>p.cap(B(u0,v),B(u1,v),0.9,0.3));
      // poeira levantada pelos cascos
      p.F(M.dust[2]); p.ell(sk.hip.x-40,GS-3,7,3); p.F(M.dust[1]); p.ell(sk.hip.x-37,GS-4.4,5,2.4); p.F(M.dust[0]); p.ell(sk.hip.x-35,GS-5.4,2.4,1.2);
      p.F(M.dust[3]); p.ell(sk.hip.x-50,GS-2,4,1.6);
    }
    if(P.dust>0){ // raspando o chão com a pata
      const f=sk.fN.fet, k=P.dust;
      p.F(M.dust[3]); p.ell(f.x-7,GS-2,6*k,2.4*k);
      p.F(M.dust[2]); p.ell(f.x-9,GS-3.6,4.6*k,2.4*k); p.ell(f.x-3,GS-2.6,3*k,1.6*k);
      p.F(M.dust[1]); p.ell(f.x-10,GS-4.6,2.8*k,1.4*k); p.F(M.dust[0]); p.rect(f.x-11,GS-5.6,1.6,0.8);
      p.F(M.dirt[1]); [[-14,-7],[-16,-4],[-12,-9]].forEach(([dx,dy])=>p.rect(f.x+dx,GS+dy,1,1));
    }
    if(P.clack>0){ // faísca do estalo dos caninos
      const t=sk.H(22,2);
      p.F(M.glow[0]); [[0,-7],[6,-5],[8,1],[5,6],[-4,-6]].forEach(([dx,dy])=>p.cap({x:t.x+dx*0.35,y:t.y+dy*0.35},{x:t.x+dx,y:t.y+dy},0.9,0.3));
      p.F(M.glow[1]); p.circle(t,1.6); p.F(M.glow[0]); p.circle(t,0.8);
    }
  }

  /* ---------- montagem ---------- */
  const cache=PIX.cache();
  function frame(form,anim,fi,step=5,Pov,pk){
    const K=PIX.getK(), key=(pk!=null?'#'+pk+'|'+form:form+'|'+anim+'|'+fi+'|'+step)+'@'+K;
    const hit=cache.get(key); if(hit){ cache.delete(key); cache.set(key,hit); return hit; }
    const P=Pov?Object.assign({},REST,Pov):poseOf(anim,fi), M=mats(form), sk=skeleton(P);
    const parts=[
      {back:true, draw:(c,u)=>drawHind(c,u,M,sk,P,true)},
      {back:true, draw:(c,u)=>drawFront(c,u,M,sk,P,true)},
      {draw:(c,u)=>drawBody(c,u,M,sk,P,form)},
      {draw:(c,u)=>drawHind(c,u,M,sk,P,false)},
      {draw:(c,u)=>drawFront(c,u,M,sk,P,false)},
      {draw:(c,u)=>drawHead(c,u,M,sk,P,form)},
      {draw:(c,u)=>drawJaw(c,u,M,sk,P,form)},
      {noRim:true, draw:(c,u)=>drawCrest(c,u,M,sk,P,form)}];
    if(P.smear>=0.5||P.dust>0||P.clack>0) parts.push({noShade:true, smear:true, noRim:true, draw:(c,u)=>drawFx(c,u,M,sk,P)});
    let cv; PIX.setK(K*BS); try{ cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM[form]}); } finally { PIX.setK(K); } if(step>=4) heavyOutline(cv);
    const sc=q=>({x:q.x*K*BS,y:q.y*K*BS});
    cv._eye=sc(sk.H(9,-6.4)); cv._mouth=sc(sk.H(18,4)); cv._hand=sc(sk.H(21.6,9)); cv._head=sc(sk.H(7,-5)); cv._tusk=cv._hand; cv._snout=sc(sk.H(30,-1));
    cache.set(key,cv); if(cache.size>900) cache.delete(cache.keys().next().value);
    return cv;
  }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame,framePose:function(form,anim,P,key){ return frame(form,anim,0,5,P,key); }};
})();
