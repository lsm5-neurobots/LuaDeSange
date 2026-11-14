/* SERINGUEIRO — fonte de arte (editável). Build: npm run art
   Zumbi Seringueiro (comum humano, Amazônia): trabalhador do ciclo da borracha que a Lua pegou no meio da sangria.
   Magro e nodoso, ombros caídos, pescoço esticado pra frente, andar curvado. Lamparina de querosene (poronga) presa
   na testa por tira de couro, chama amarela tremendo; chapéu de palha de aba larga murcho e furado, empurrado pra trás.
   Camisa de algodão cru de manga comprida rasgada (látex endurecido no peito), calça arregaçada e remendada amarrada
   com embira, pés descalços. Cinto de corda com facão de sangria (lâmina curta curva, ferrugem) e balde de latão na
   cintura com látex branco escorrendo; bolota de borracha defumada no ombro. Pele cinza-esverdeada com cortes em
   espinha (como o tronco sangrado), olhos fundos com brilho âmbar, barba rala, boca com fios de látex.
   Corrupção da Lua: raízes e fungos (cordyceps laranja) brotam das costas e do braço do facão.
   Golpes: talho de sangria (2 cortes), jato de látex (balde lançado; adereços xBlob/xPool), balde na cara, refill.
   Hi-bit: honra PIX.getK(). */
const SERINGUEIRO=(function(){
  const {rad,lerp,P2,mkPen,compose}=PIX;
  const FW=196, FH=160, GROUND=150, AX=80;
  const RIM={comum:'#c8d8f0', enluarado:'#9ff6ff', plenilunar:'#ffb46a'};

  /* ---------- materiais ---------- */
  function mats(form){
    const m={
      skin:['#e2eec2','#a6ba8e','#5e7a6c','#2c3852'],
      vein:['#b49ad8','#7e5aa8','#523a7e','#2c1e50'],
      rot:['#c8c08e','#8a845e','#585450','#302a3a'],
      flesh:['#f6ae94','#c25a5e','#7a3a4a','#4a1c34'],
      shirt:['#fff2c6','#dcc08a','#86684e','#382a48'],
      pants:['#c88e58','#86562e','#4e2e2a','#24142a'],
      patch:['#9ad0f4','#4a86c8','#2c4c88','#18244a'],
      latex:['#ffffff','#f2efe4','#b8b6b4','#6c6c80'],
      rubber:['#7a5a40','#3e2a1c','#24160e','#120a0a'],
      flame:['#fffde8','#ffe070','#ffa030','#c84a18'],
      brass:['#fff2a8','#dcae46','#94682a','#4c2e22'],
      steel:['#f4faff','#9eaab4','#5e6a7a','#2c3044'],
      rust:['#e8a050','#a85a28','#6a3420','#381a18'],
      wood:['#d8a868','#9a6a3c','#5e3e28','#30201c'],
      straw:['#fbe6a4','#d0aa5c','#8a6838','#463024'],
      leather:['#b47a46','#764a2a','#48281c','#26140e'],
      cord:['#e6cc8c','#ac905a','#6e5838','#3a2c24'],
      root:['#b8a284','#7a644c','#4a3a34','#261e26'],
      fungus:['#ffe08a','#f49a30','#b2521e','#5e2418'],
      hair:['#8a8a90','#4e4a52','#2e2a34','#16121c'],
      eye:['#fffbe0','#ffd060','#e0882a','#8a4214'],
      mouth:['#7c2e3e','#4c1828','#2e0c1a','#1a0610'],
      teeth:['#f4e8b8','#cdb878','#8e7a4c','#56482e'],
      dirt:['#b89870','#86684a','#5a4432','#32241e'],
      blood:['#c84a3e','#8e2a2c','#5e1824','#3a0e1a'],
      nail:['#9a8a72','#5e5048','#382e30','#1c161a'],
      glow:['#fffbe0','#fff0a0','#ffc858','#c8781e'],
      swish:['#fdfdff','#e6f0ff','#b4c4e8','#7484b0'],
    };
    if(form==='enluarado'){
      m.skin=['#dcf4ff','#8cb8dc','#4e6ea8','#26386c']; m.vein=['#a8f4ff','#4ad8f0','#2a8ab0','#1a4a7a'];
      m.rot=['#b8a6e0','#8470b0','#56468a','#33285e']; m.flesh=['#f0b0ff','#b866d8','#7a3a9e','#46206a']; m.blood=['#b46ad8','#7e3ea6','#542474','#34144a'];
      m.shirt=['#f0e2ff','#b6a2e4','#6c56aa','#38286e']; m.pants=['#6e66b0','#3c3474','#221e4c','#120e28'];
      m.patch=['#a4a0d0','#6e68a2','#46407a','#262250'];
      m.latex=['#f0ffff','#7af4ff','#2ab8e0','#146a9a']; m.eye=['#ffffff','#b8fbff','#4ad8f0','#1a8aa8'];
      m.glow=['#effffe','#7af4ff','#2ab0d8','#146a96']; m.swish=['#ffffff','#c8fbff','#6ae4f4','#2a9ab8'];
      m.straw=['#eef0ff','#b6bce0','#767eb0','#40467a']; m.dirt=['#a8a0c8','#76709a','#4e4a70','#2e2a48'];
      m.root=['#b0a8d8','#746ca6','#48427a','#262252']; m.fungus=['#d8ffff','#7af4ff','#2a9ad0','#16508a'];
      m.leather=['#9a86c0','#62508e','#3c2e64','#20183e']; m.cord=['#c8c4ec','#8e8abc','#5c5888','#323058'];
      m.flame=['#ffffff','#c8fbff','#6ae4f4','#2a8ab8']; m.rubber=['#5a5480','#2e2a4a','#1c1832','#0e0c1c'];
    }
    if(form==='plenilunar'){
      m.skin=['#ffe6b4','#eea472','#aa5448','#5a2032']; m.vein=['#fff0a0','#ffb43a','#e0581e','#8a2414'];
      m.rot=['#d0806a','#9a4a4a','#682a3a','#3e1628']; m.flesh=['#ffc07a','#f06a3a','#a8302e','#5e1422']; m.blood=['#ff7a3a','#d43a26','#8a1c22','#4e0c18'];
      m.shirt=['#ee7a64','#ac2a36','#661a30','#360a1e']; m.pants=['#9a5a48','#643634','#3e1e26','#220e18'];
      m.patch=['#c4704c','#8a4430','#582626','#301218'];
      m.latex=['#ffd2b0','#ff5a3a','#c8241e','#701020']; m.eye=['#fffbe0','#ffe04a','#ff8a2a','#b83a14'];
      m.glow=['#fff6c0','#ffb43a','#e0581e','#8a2414']; m.swish=['#fffbe6','#ffe6a8','#ffb460','#d0602a'];
      m.straw=['#ffd8a0','#d89058','#985034','#562826']; m.dirt=['#b4705a','#844a3e','#5a2e2e','#36181e'];
      m.root=['#d09a7a','#8e5a46','#5a3030','#301820']; m.fungus=['#fff0a0','#ff8a2a','#c83a1a','#6a1414'];
      m.flame=['#fff8d0','#ffb24a','#ff6a2a','#b02812'];
    }
    return punch(m);
  }
  const NAMES={skin:'Pele',vein:'Veias',rot:'Podridão',flesh:'Carne',shirt:'Camisa de algodão',pants:'Calça',patch:'Remendo',latex:'Látex',rubber:'Borracha defumada',flame:'Chama da lamparina',brass:'Latão (balde/lamparina)',steel:'Lâmina do facão',rust:'Ferrugem',wood:'Cabo de madeira',straw:'Palha do chapéu',leather:'Tira de couro',cord:'Corda de embira',root:'Raízes',fungus:'Fungo',hair:'Barba/cabelo',eye:'Olho',mouth:'Boca',teeth:'Dentes',dirt:'Barro',blood:'Sangue',nail:'Unhas',glow:'Brilho',swish:'Rastro do corte'};
  function sat(h,k){ const [r,g,b]=PIX.hexRgb(h), y=(r+g+b)/3; return PIX.toHex(y+(r-y)*k,y+(g-y)*k,y+(b-y)*k); }
  const NOPUNCH={swish:1,glow:1,flame:1,latex:1};
  function punch(m){ const o={}; for(const k in m){ const r=m[k]; o[k]=NOPUNCH[k]?[r[0],r[1],r[2],r[3]]:[sat(r[0],1.12),sat(r[1],1.2),PIX.mix(sat(r[2],1.12),'#2a1a4c',0.22),PIX.mix(r[3],'#140a24',0.36)]; } return o; }

  /* ---------- poses ---------- */
  // ângulos: 0 = pendurado, + = pra frente. rz = ângulo do facão somado ao do antebraço.
  // bk = balde na mão de trás (>0,5) ou na cintura; bt = inclinação do balde; lat = nível de látex; tig = tigela na mão;
  // pour = látex caindo da tigela no balde; spill = látex derramado no chão (morte); fl = tamanho da chama;
  // hat/hloose/hdx/hdy/hdr = chapéu (na cabeça / caído); smear = rastro do facão; bsmear = rastro do balde; splash = jato saindo.
  const REST={hx:0,rot:0,lift:0,lean:8,hunch:16,head:4,jaw:12,aFs:18,aFe:52,aBs:-6,aBe:10,rz:-70,lFh:12,lFk:-6,lBh:-10,lBk:-20,fF:0,fB:0,
    bk:0,bt:0,lat:1,tig:0,pour:0,spill:0,fl:1,ht:-30,hat:1,hloose:0,hdx:0,hdy:0,hdr:0,smear:0,bsmear:0,splash:0,flash:0,drool:0};
  const S=Math.sin, C=Math.cos, PI=Math.PI, mx=Math.max;
  const ANIMS={
    idle:{nome:'Parado (respira, a chama oscila, o balde balança)',n:8,dur:()=>150,pose:i=>{ const p=i/8*PI*2, s=S(p);
      return {hx:1.2*s, lean:8+2*S(p+0.6), hunch:16+2*S(2*p), head:4+3*S(p-0.8), jaw:10+5*mx(0,S(p)), drool:i%4, fl:1+0.18*S(p*2+1),
        aFs:18+5*s, aFe:52+8*S(p+0.4), rz:-70+8*S(p), aBs:-6-5*s, aBe:10+6*s, bt:6*S(p+1.2),
        lFh:12+3*s, lFk:-6+4*s, lBh:-10-3*s, lBk:-20+3*s, ht:-30+2*S(p-1)}; }},
    walk:{nome:'Andar curvado (arrasta os pés)',n:8,dur:()=>140,pose:i=>{ const p=i/8*PI*2;
      const lFh=10+16*S(p), lBh=-10+12*S(p+PI);
      return {lFh, lFk:lFh-18*mx(0,C(p))-4, lBh, lBk:lBh-8-10*mx(0,C(p+PI)), fF:-6*mx(0,C(p)), fB:14*mx(0,C(p+PI)),
        lean:10+3*S(p), hunch:17+3*S(2*p-0.6), head:5+4*S(2*p-1.4), jaw:12+4*S(2*p-1.8), hx:1.6*S(p), lift:0.8*mx(0,S(2*p)),
        aFs:16+12*S(p+PI), aFe:52+10*S(p+PI), rz:-70+8*S(p), aBs:-8+14*S(p), aBe:10+12*S(p), bt:10*S(p+0.8), fl:1+0.15*S(p*2), ht:-30+2*S(2*p), drool:i%4}; }},
    alert:{nome:'Alerta (levanta a cabeça, a chama arde forte)',n:7,dur:i=>[160,140,180,160,160,200,160][i],pose:i=>[
      {},
      {head:-6,hunch:12,jaw:16,lean:4,fl:1.2},
      {head:-14,hunch:8,jaw:22,lean:0,fl:1.5,aBs:20,aBe:60},
      {head:-18,hunch:6,jaw:30,lean:-2,fl:1.8,aBs:30,aBe:80,aFs:40,aFe:90,rz:-110},
      {head:-12,hunch:8,jaw:34,lean:2,fl:1.7,aFs:70,aFe:120,rz:-140,hx:-1},
      {head:0,hunch:14,jaw:26,lean:8,fl:1.4,aFs:50,aFe:96,rz:-120,lFh:16,lBh:-14},
      {jaw:16,fl:1.15}][i]},
    // ---- golpes (IA: hit = quadro(s) do dano, reach = alcance; throwAt = quadro do lançamento do látex) ----
    attack:{nome:'Talho de sangria (2 cortes diagonais)',n:9,hit:[3,6],reach:36,dur:i=>[150,150,50,90,90,60,90,140,160][i],pose:i=>[
      {lean:0,hunch:10,head:-2,jaw:18,aFs:120,aFe:160,rz:-30,aBs:20,aBe:50,hx:-2,lFh:16,lBh:-14},
      {lean:-8,hunch:6,head:-4,jaw:26,aFs:160,aFe:200,rz:-10,aBs:30,aBe:60,hx:-4,lFh:16,lFk:-8,lBh:-14,lBk:-26,fl:1.2},
      {lean:16,hunch:18,head:2,jaw:32,aFs:110,aFe:110,rz:-30,smear:1,hx:4,lFh:24,lFk:2,lBh:-18,lBk:-28},
      {lean:24,hunch:22,head:4,jaw:20,aFs:50,aFe:20,rz:-50,smear:1,hx:7,lFh:28,lFk:4,lBh:-22,lBk:-32,fB:10},
      {lean:12,hunch:14,head:0,jaw:24,aFs:140,aFe:170,rz:-20,hx:4,lFh:22,lBh:-18},
      {lean:20,hunch:18,head:2,jaw:34,aFs:100,aFe:96,rz:-40,smear:1,hx:9,lFh:30,lFk:6,lBh:-24,lBk:-34,fB:12},
      {lean:30,hunch:24,head:6,jaw:40,aFs:40,aFe:4,rz:-60,smear:1,hx:12,lFh:34,lFk:8,lBh:-28,lBk:-38,fB:16},
      {lean:26,hunch:22,head:4,jaw:30,aFs:20,aFe:0,rz:-70,hx:12,lFh:32,lFk:6,lBh:-26,lBk:-36,fB:14},
      {lean:12,hunch:18,head:4,jaw:16,aFs:20,aFe:50,rz:-70,hx:5}][i]},
    throw:{nome:'Jato de látex (desengata o balde, puxa pra trás e lança em arco)',n:10,throwAt:5,reach:150,dur:i=>[120,130,170,190,80,80,130,140,130,150][i],pose:i=>[
      {lean:6,hunch:16,head:2,jaw:14,aBs:-30,aBe:-20,hx:-1},
      {lean:2,hunch:14,head:0,jaw:18,aBs:-20,aBe:0,bk:1,bt:0,hx:-2,fl:1.2},
      {lean:-10,hunch:8,head:-4,jaw:24,aBs:-70,aBe:-60,bk:1,bt:-20,hx:-4,lFh:20,lFk:-2,lBh:-20,lBk:-30,aFs:40,aFe:80,fl:1.3},
      {lean:-16,hunch:4,head:-6,jaw:30,aBs:-96,aBe:-90,bk:1,bt:-40,hx:-6,lFh:24,lFk:0,lBh:-24,lBk:-36,aFs:50,aFe:90,fl:1.4},
      {lean:4,hunch:12,head:-6,jaw:36,aBs:20,aBe:30,bk:1,bt:30,bsmear:1,hx:2,lFh:26,lFk:2,lBh:-22,lBk:-34},
      {lean:-4,hunch:6,head:-20,jaw:44,aBs:74,aBe:92,bk:1,bt:120,splash:1,lat:0.3,hx:7,lFh:30,lFk:6,lBh:-26,lBk:-36,fB:12},
      {lean:0,hunch:8,head:-16,jaw:40,aBs:84,aBe:104,bk:1,bt:140,lat:0,hx:8,lFh:30,lFk:6,lBh:-26,lBk:-36,fB:12},
      {lean:10,hunch:14,head:-2,jaw:30,aBs:60,aBe:76,bk:1,bt:60,lat:0,hx:5},
      {lean:10,hunch:16,head:4,jaw:20,aBs:10,aBe:30,bk:1,bt:10,lat:0,hx:2},
      {lean:8,hunch:16,head:4,jaw:14,aBs:-20,aBe:0,lat:0}][i]},
    bucket:{nome:'Balde na cara (revés com o balde)',n:7,hit:3,reach:30,dur:i=>[120,160,60,90,120,130,140][i],pose:i=>[
      {lean:4,hunch:14,head:0,jaw:16,aBs:-30,aBe:-10,bk:1,hx:-1},
      {lean:-12,hunch:6,head:-4,jaw:24,aBs:-80,aBe:-70,bk:1,bt:-30,hx:-4,lFh:18,lBh:-20,lBk:-30,aFs:40,aFe:80},
      {lean:8,hunch:14,head:-4,jaw:34,aBs:40,aBe:50,bk:1,bt:40,bsmear:1,hx:4,lFh:26,lFk:2,lBh:-22,lBk:-32},
      {lean:2,hunch:8,head:-16,jaw:40,aBs:70,aBe:66,bk:1,bt:80,bsmear:1,hx:8,lFh:30,lFk:6,lBh:-26,lBk:-36,fB:12},
      {lean:4,hunch:10,head:-12,jaw:30,aBs:80,aBe:84,bk:1,bt:100,hx:8,lFh:28,lBh:-24,lBk:-34},
      {lean:12,hunch:16,head:4,jaw:20,aBs:40,aBe:60,bk:1,bt:30,hx:3},
      {lean:8,hunch:16,jaw:14,aBs:-10,aBe:6}][i]},
    refill:{nome:'Refill (abaixa, pega a tigela e enche o balde: ABERTO)',n:8,dur:i=>[150,150,160,150,160,160,150,140][i],pose:i=>[
      {lean:16,hunch:22,head:8,jaw:12,lFh:30,lFk:-20,lBh:10,lBk:-40,aBs:20,aBe:30},
      {lean:30,hunch:28,head:10,jaw:10,lFh:60,lFk:-30,lBh:40,lBk:-60,aBs:40,aBe:40,aFs:30,aFe:50},
      {lean:34,hunch:30,head:12,jaw:12,lFh:70,lFk:-40,lBh:50,lBk:-70,aBs:60,aBe:50,tig:1,aFs:30,aFe:50},
      {lean:24,hunch:26,head:8,jaw:14,lFh:50,lFk:-30,lBh:30,lBk:-56,aBs:10,aBe:-30,tig:1,lat:0.2},
      {lean:20,hunch:24,head:10,jaw:12,lFh:40,lFk:-24,lBh:20,lBk:-50,aBs:-10,aBe:-60,tig:1,pour:1,lat:0.4},
      {lean:20,hunch:24,head:10,jaw:12,lFh:40,lFk:-24,lBh:20,lBk:-50,aBs:-12,aBe:-64,tig:1,pour:1,lat:0.7},
      {lean:14,hunch:20,head:8,jaw:14,lFh:24,lFk:-12,lBh:0,lBk:-34,aBs:-10,aBe:-40,tig:1,lat:1},
      {lean:8,hunch:16,head:4,jaw:12,aBs:-6,aBe:10}][i]},
    hurt:{nome:'Dano (cabeça)',n:4,dur:i=>[80,110,130,150][i],pose:i=>[
      {lean:-6,hunch:6,head:-14,jaw:34,aFs:-10,aFe:30,rz:-40,aBs:-20,aBe:10,hx:-6,flash:1,lFh:14,lBh:-4,ht:-42,fl:0.7,bt:-30},
      {lean:-2,hunch:8,head:-8,jaw:28,aFs:0,aFe:40,rz:-50,aBs:-12,aBe:20,hx:-5,lFh:12,lBh:-6,ht:-38,bt:-20},
      {lean:4,hunch:12,head:-2,jaw:22,aFs:10,aFe:46,aBs:-8,aBe:12,hx:-2,ht:-34,bt:10},
      {lean:7,hunch:15,head:2,jaw:14,hx:0}][i]},
    hurtB:{nome:'Dano (barriga, dobra)',n:4,dur:i=>[80,120,140,150][i],pose:i=>[
      {lean:30,hunch:30,head:16,jaw:40,aFs:50,aFe:20,rz:-40,aBs:44,aBe:14,hx:-8,flash:1,lFh:20,lFk:-14,lBh:-14,lBk:-30,bt:30},
      {lean:26,hunch:28,head:12,jaw:36,aFs:46,aFe:24,rz:-40,aBs:40,aBe:20,hx:-7,lFh:18,lFk:-12,lBh:-14,lBk:-28,bt:20},
      {lean:16,hunch:22,head:6,jaw:24,aFs:30,aFe:56,aBs:20,aBe:30,hx:-3},
      {lean:9,hunch:17,head:4,jaw:14,hx:-1}][i]},
    fall:{nome:'Derrubado',n:6,dur:i=>[90,90,90,110,140,260][i],pose:i=>[
      {lean:-10,hunch:6,head:-10,jaw:34,aFs:-40,aFe:-20,rz:-20,aBs:-46,aBe:-30,hx:-6,flash:1,lFh:20,lBh:0,ht:-42},
      {rot:-30,lean:-4,hunch:8,head:-6,jaw:30,aFs:-60,aFe:-40,aBs:-70,aBe:-50,hx:-4,lFh:40,lFk:30,lBh:20,lBk:10,ht:-42},
      {rot:-62,lean:0,hunch:10,head:-8,jaw:28,aFs:-90,aFe:-70,aBs:-96,aBe:-80,hx:-6,lFh:50,lFk:40,lBh:30,lBk:24,ht:-42},
      {rot:-90,lean:4,hunch:12,head:-4,jaw:36,aFs:-110,aFe:-120,aBs:-100,aBe:-110,hx:2,lFh:40,lFk:10,lBh:30,lBk:4,ht:-42,fl:0.8},
      {rot:-84,lean:2,hunch:14,head:-8,jaw:30,aFs:-120,aFe:-140,aBs:-104,aBe:-126,hx:2,lFh:46,lFk:20,lBh:34,lBk:10,ht:-42},
      {rot:-90,lean:0,hunch:12,head:-4,jaw:34,aFs:-130,aFe:-150,aBs:-110,aBe:-136,hx:2,lFh:40,lFk:6,lBh:26,lBk:0,ht:-42,fl:0.7}][i]},
    getup:{nome:'Levantar',n:6,dur:i=>[200,170,170,160,160,150][i],pose:i=>[
      {rot:-90,lean:0,hunch:12,head:-4,jaw:34,aFs:-130,aFe:-150,aBs:-110,aBe:-136,hx:2,lFh:40,lFk:6,lBh:26,lBk:0,ht:-42,fl:0.7},
      {rot:-60,lean:10,hunch:20,head:-6,jaw:24,aFs:-50,aFe:-10,aBs:-60,aBe:-20,hx:-8,lFh:90,lFk:10,lBh:70,lBk:0,ht:-36},
      {rot:-30,lean:20,hunch:26,head:-4,jaw:20,aFs:-10,aFe:10,aBs:-20,aBe:0,hx:-6,lFh:110,lFk:10,lBh:60,lBk:-60},
      {rot:0,lean:30,hunch:26,head:0,jaw:20,aFs:30,aFe:10,aBs:20,aBe:4,hx:-4,lFh:78,lFk:-2,lBh:6,lBk:-86,fB:60},
      {rot:0,lean:14,hunch:20,head:4,jaw:14,aFs:30,aFe:60,aBs:30,aBe:60,hx:-1,lFh:30,lFk:-12,lBh:-12,lBk:-34,fl:1.3},
      {lean:8,hunch:16,head:4,jaw:12}][i]},
    death:{nome:'Morte (cai de joelhos, o balde derrama, o chapéu rola)',n:8,dur:i=>[90,150,160,170,160,150,160,600][i],pose:i=>[
      {lean:-8,hunch:6,head:-14,jaw:40,aFs:-34,aFe:-16,rz:-20,aBs:-40,aBe:-24,hx:-5,flash:1,lFh:14,lBh:-4,ht:-42,bt:-30},
      {lean:0,hunch:10,head:-8,jaw:48,aFs:-10,aFe:4,aBs:-16,aBe:0,hx:-6,lFh:10,lBh:-8,hat:0,hloose:1,hdx:-12,hdy:46,hdr:-40,bt:40,spill:0.2},
      {lean:8,hunch:18,head:0,jaw:46,aFs:4,aFe:6,aBs:0,aBe:2,hx:-4,lFh:40,lFk:-30,lBh:28,lBk:-50,fF:10,fB:30,hat:0,hloose:1,hdx:-24,hdy:36,hdr:-120,bt:70,spill:0.4,fl:0.8},
      {lean:12,hunch:26,head:6,jaw:48,aFs:6,aFe:4,aBs:2,aBe:0,hx:-2,lFh:14,lFk:-92,lBh:6,lBk:-96,fF:100,fB:100,hat:0,hloose:1,hdx:-34,hdy:16,hdr:-220,bt:90,lat:0.6,spill:0.6},
      {rot:16,lean:14,hunch:30,head:8,jaw:48,aFs:24,aFe:20,aBs:16,aBe:14,hx:0,lFh:2,lFk:-92,lBh:-6,lBk:-96,fF:90,fB:90,hat:0,hloose:1,hdx:-40,hdy:2,hdr:-300,bt:90,lat:0.3,spill:0.8,fl:0.6},
      {rot:50,lean:10,hunch:26,head:2,jaw:44,aFs:70,aFe:90,aBs:56,aBe:76,hx:4,lFh:-20,lFk:-70,lBh:-28,lBk:-74,fF:60,fB:60,hat:0,hloose:1,hdx:-46,hdy:6,hdr:-340,bt:90,lat:0.1,spill:1,fl:0.4},
      {rot:86,lean:2,hunch:14,head:0,jaw:40,aFs:150,aFe:170,aBs:110,aBe:150,hx:8,lFh:-4,lFk:-10,lBh:-8,lBk:-14,fF:10,fB:10,hat:0,hloose:1,hdx:-50,hdy:0,hdr:-356,bt:90,lat:0,spill:1,fl:0.25},
      {rot:90,lean:0,hunch:12,head:0,jaw:42,aFs:160,aFe:176,aBs:116,aBe:156,hx:8,lFh:-2,lFk:-6,lBh:-6,lBk:-10,fF:6,fB:6,hat:0,hloose:1,hdx:-52,hdy:0,hdr:-360,bt:90,lat:0,spill:1,fl:0,drool:3}][i]},
    // adereços (desenhados pelo motor como atores extras; âncora em cv._ax/_gy)
    xBlob:{nome:'Jato de látex voando (adereço)',n:3,prop:true,dur:()=>60,pose:i=>({st:i})},
    xPool:{nome:'Poça de látex (adereço; st 0–2 normal, 3–5 em chamas)',n:6,prop:true,dur:()=>150,pose:i=>({st:i})},
  };
  const EXK=['hx','lean','hunch','head','aFs','aFe','aBs','aBe','lFh','lFk','lBh','lBk'];
  function exag(P,f){ if(f===1||Math.abs(P.rot)>4) return P; EXK.forEach(k=>{ P[k]=REST[k]+(P[k]-REST[k])*f; }); P.jaw=Math.min(58,mx(0,REST.jaw+(P.jaw-REST.jaw)*f)); return P; }
  const EXF={idle:1.06,walk:1.1,alert:1.12,attack:1.18,throw:1.12,bucket:1.15,refill:1.04,hurt:1.3,hurtB:1.25,fall:1.1,getup:1.08,death:1.1};
  ZREACT.add(ANIMS,REST,{});
  function poseOf(anim,i){ const A=ANIMS[anim]; if(A&&A.prop) return Object.assign({},REST,A.pose(i)); return exag(Object.assign({},REST,A.pose(i)),EXF[anim]||1); }
  function heavyOutline(cv){ const g=cv.getContext('2d'), W=cv.width, H=cv.height, im=PIX.pix(cv), d=im.data;
    const isO=i=>d[i+3]===255&&d[i]===0x17&&d[i+1]===0x0b&&d[i+2]===0x1c, fill=i=>d[i+3]===255&&!isO(i);
    const add=[]; for(let y=2;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(d[i+3]) continue; const u=((y-1)*W+x)*4, u2=((y-2)*W+x)*4; if(isO(u)&&fill(u2)) add.push(i); }
    add.forEach(i=>{ d[i]=0x17; d[i+1]=0x0b; d[i+2]=0x1c; d[i+3]=255; }); g.putImageData(im,0,0); }

  /* ---------- esqueleto (magro, ombro caído, pescoço pra frente) ---------- */
  const SPINE=40, TH=22, SH=21.5, UA=16.2, FA=15, VS=SPINE/37, US=1.06, HB=12, HS=1.24;
  const lp=(p,a,L)=>({x:p.x+Math.sin(rad(a))*L, y:p.y+Math.cos(rad(a))*L});
  function build(P,dy){
    const R=P.rot, hip={x:AX+P.hx, y:dy};
    const ra=rad(R), rc=Math.cos(ra), rs=Math.sin(ra);
    const HR=(lx,ly)=>({x:hip.x+lx*rc-ly*rs, y:hip.y+lx*rs+ly*rc});
    const hipF=HR(3,0), hipB=HR(-3,0);
    const kneeF=lp(hipF,P.lFh-R,TH), ankleF=lp(kneeF,P.lFk-R,SH), kneeB=lp(hipB,P.lBh-R,TH), ankleB=lp(kneeB,P.lBk-R,SH);
    const SS=[]; let x=hip.x, y=hip.y;
    for(let k=0;k<=SPINE;k++){ const t=k/SPINE, a=rad(R+P.lean+(P.hunch+HB)*Math.pow(t,1.5)); SS.push({x,y,a}); x+=Math.sin(a); y-=Math.cos(a); }
    const SP=(u,v)=>{ if(v>0){ const s=SS[0], a=s.a, px=s.x-Math.sin(a)*v, py=s.y+Math.cos(a)*v; return {x:px+Math.cos(a)*u, y:py+Math.sin(a)*u}; }
      const f=-v, k=Math.min(SPINE,Math.floor(f)), s=SS[k], r=f-k, a=s.a;
      const px=s.x+Math.sin(a)*r, py=s.y-Math.cos(a)*r; return {x:px+Math.cos(a)*u, y:py+Math.sin(a)*u}; };
    const T=(u,v)=>SP(u*US,v*VS);
    const top=SS[SPINE], neck=T(4,-36.4), sa=top.a;
    const shF=T(1.2,-31), shB=T(-4.6,-31.6);
    const elF=lp(shF,P.aFs-R,UA), wrF=lp(elF,P.aFe-R,FA), elB=lp(shB,P.aBs-R,UA), wrB=lp(elB,P.aBe-R,FA);
    const ha=sa+rad(P.head+18-HB), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:neck.x+(lx*hc-ly*hs)*HS, y:neck.y+(lx*hs+ly*hc)*HS});
    // facão: punho -> cabo -> lâmina curva
    const fa=Math.atan2(wrF.x-elF.x,wrF.y-elF.y)*180/PI, za=rad(fa+P.rz+70), zd={x:Math.sin(za),y:Math.cos(za)};
    const zh={x:wrF.x+(wrF.x-elF.x)/FA*5, y:wrF.y+(wrF.y-elF.y)/FA*5};
    const zp={x:zh.x+zd.x*6.6, y:zh.y+zd.y*6.6}, ztip={x:zp.x+zd.x*15, y:zp.y+zd.y*15};
    const toe=(a,f)=>{ const t=rad(f+R); return {x:a.x+(11*Math.cos(t)-5*Math.sin(t))*1.3, y:a.y+(11*Math.sin(t)+5*Math.cos(t))*1.3}; };
    const hull=[[ankleF,6],[ankleB,6],[toe(ankleF,P.fF),0.8],[toe(ankleB,P.fB),0.8],[kneeF,5],[kneeB,5],[hip,9],[T(0,-18),10],[T(-2,-30),10],[H(3,-11),11],[wrF,4],[wrB,4],[elF,4],[elB,4]];
    return {R,hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,SP,T,sa,neck,shF,shB,elF,wrF,elB,wrB,ha,H,hull,ra,zh,zd,zp,ztip,toeF:toe(ankleF,P.fF)};
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
    if(o.deep!==false){ const k2a=wa*0.33, k2b=wb*0.33; p.F(R[3]); p.cap({x:a.x+nx*k2a,y:a.y+ny*k2a},{x:b.x+nx*k2b,y:b.y+ny*k2b},wa*0.32,wb*0.32); }
    if(o.hi!==false){ const e=lerp(a,b,o.hl!=null?o.hl:0.7), ha=wa*0.22, hb=wb*0.22; p.F(R[0]); p.cap({x:a.x-nx*ha,y:a.y-ny*ha},{x:e.x-nx*hb,y:e.y-ny*hb},wa*0.2,wb*0.18); }
    return {nx,ny};
  }
  function clip(c,pts,fn){ c.save(); c.beginPath(); pts.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])); c.closePath(); c.clip(); fn(); c.restore(); }
  const W=(sk,list)=>list.map(([u,v])=>{ const q=sk.T(u,v); return [q.x,q.y]; });
  const Wp=(sk,u,v)=>sk.T(u,v);
  const off=(q,n,k)=>({x:q.x+n.nx*k,y:q.y+n.ny*k});
  const isFx=form=>form!=='comum';

  /* ---------- cortes em espinha (sangria) com látex escorrendo ---------- */
  function spineCuts(p,M,a,b,n,form){
    const s=sideN(a,b), d={x:(b.x-a.x)/s.L,y:(b.y-a.y)/s.L};
    p.F(M.flesh[2]); for(let k=0;k<n;k++){ const c=lerp(a,b,0.15+k*0.7/Math.max(1,n-1)); p.cap({x:c.x+s.nx*2.4-d.x*1.4,y:c.y+s.ny*2.4-d.y*1.4},{x:c.x-s.nx*0.4+d.x*1.2,y:c.y-s.ny*0.4+d.y*1.2},0.9,0.7); }
    p.F(isFx(form)?M.latex[1]:M.latex[1]); const e=lerp(a,b,0.85); p.cap({x:e.x-s.nx*0.2,y:e.y-s.ny*0.2},{x:e.x-s.nx*0.2+d.x*3,y:e.y-s.ny*0.2+d.y*3},0.8,0.6);
    if(isFx(form)){ p.F(M.glow[1]); const c=lerp(a,b,0.4); p.cap({x:c.x+s.nx*2,y:c.y+s.ny*2},{x:c.x-s.nx*0.2+d.x,y:c.y-s.ny*0.2+d.y},0.5,0.4); }
  }

  /* ---------- facão de sangria (lâmina curta, curva, ponta em gancho) ---------- */
  function drawKnife(p,M,sk,P,form){
    const h=sk.zh, d=sk.zd, zp=sk.zp, tip=sk.ztip;
    const b0={x:h.x-d.x*3,y:h.y-d.y*3};
    // cabo de madeira com amarração de corda
    p.F(M.wood[1]); p.cap(b0,zp,3.4,3);
    const n=sideN(b0,zp); p.F(M.wood[2]); p.cap(off(b0,n,0.8),off(zp,n,0.8),1.4,1.2);
    p.F(M.wood[0]); p.cap(off(lerp(b0,zp,0.2),n,-0.8),off(lerp(b0,zp,0.7),n,-0.8),0.7,0.6);
    p.F(M.cord[2]); [0.25,0.55].forEach(t=>{ const q=lerp(b0,zp,t); p.cap(off(q,n,-1.8),off(q,n,1.8),0.9,0.9); });
    p.F(M.steel[3]); p.cap(off(zp,n,-2),off(zp,n,2),1.4,1.4); // guarda
    // lâmina: faca de sangria — corpo largo e chato, curva pro fio, ponta virada em gancho (bem legível)
    const n2=sideN(zp,tip), side=(n2.nx*d.x+n2.ny*d.y)>0?-1:1, nn={nx:n2.nx*side,ny:n2.ny*side};
    const Q=(t,k)=>{ const q=lerp(zp,tip,t); return [q.x+nn.nx*k,q.y+nn.ny*k]; };
    const blade=[Q(0,-1.6),Q(0.5,-2),Q(0.92,-1.2),Q(1.06,1.2),Q(1.0,4.8),Q(0.86,6.6),Q(0.82,4.4),Q(0.6,4.6),Q(0.25,4),Q(0,2.6)];
    p.F(M.steel[1]); p.poly(blade);
    p.F(M.steel[2]); p.poly([Q(0,1),Q(0.6,2),Q(0.82,3),Q(0.82,4.4),Q(0.6,4.6),Q(0.25,4),Q(0,2.6)]);
    p.F(M.steel[3]); p.poly([Q(0.86,6.6),Q(1.0,4.8),Q(0.95,4),Q(0.86,4.6)]); // gancho por dentro
    p.F(M.steel[0]); p.poly([Q(0.06,-1.4),Q(0.88,-1.4),Q(0.9,-0.6),Q(0.06,-0.4)]); // dorso polido
    p.F(M.steel[0]); p.poly([Q(0.62,4.4),Q(0.8,4.2),Q(0.8,4.6),Q(0.62,4.7)]); // fio afiado
    p.F(M.rust[1]); { const [x,y]=Q(0.3,1.2); p.ell(x,y,1.8,1.2); } p.F(M.rust[2]); { const [x,y]=Q(0.36,1.6); p.rect(x-0.5,y-0.4,1.1,0.8); }
    p.F(M.blood[1]); { const [x,y]=Q(0.7,3.4); p.ell(x,y,1.2,0.9); }
    if(isFx(form)){ p.F(M.glow[1]); p.cap(off(lerp(zp,tip,0.3),nn,4),off(lerp(zp,tip,0.7),nn,4.4),0.5,0.5); }
  }

  /* ---------- balde de latão (coordenadas locais: origem na alça, y pra baixo = fundo) ---------- */
  function drawBucket(c,p,M,form,lat,o){
    o=o||{};
    // alça de arame
    p.F(M.steel[2]); p.poly([[-6,6],[-5,0.6],[0,-1.4],[5,0.6],[6,6],[5,6],[4.2,1.4],[0,-0.2],[-4.2,1.4],[-5,6]]);
    // corpo cônico (boca mais larga)
    const body=[[-7,5],[7,5],[5.8,16],[-5.8,16]];
    p.F(M.brass[1]); p.poly(body);
    clip(c,body,()=>{
      p.F(M.brass[2]); p.poly([[-8,4],[-3.4,4],[-3,17],[-8,17]]);
      p.F(M.brass[3]); p.poly([[-8,4],[-5.6,4],[-5,17],[-8,17]]);
      p.F(M.brass[0]); p.poly([[1.6,5],[3.4,5],[3,16],[1.4,16]]);
      p.F(M.brass[2]); p.rect(-8,9.6,16,0.9); p.rect(-8,14.6,16,1.4); // aros
      p.F(M.brass[0]); p.rect(0,9.4,5,0.5);
      p.F(M.rust[2]); p.ell(-1.6,12.6,1.6,1.2); p.F(M.rust[1]); p.rect(4,13,1.2,1);
      p.F(M.dirt[2]); p.ell(2,16,3,1.2);
      // látex escorrido por fora
      if(lat>0.15){ p.F(M.latex[1]); p.poly([[2.4,4.6],[4.6,4.6],[4.4,9],[3.6,11],[3.2,8.6],[2.6,7]]); p.F(M.latex[2]); p.rect(3.6,8.4,0.8,2.4); }
      p.F(M.latex[2]); p.poly([[-4.6,4.6],[-3.4,4.6],[-3.6,7.4],[-4.2,7.8]]);
    });
    // boca (elipse): borda e látex dentro
    p.F(M.brass[2]); p.ell(0,5,7.2,1.9); p.F(M.brass[0]); p.rect(-6.2,3.4,6,0.6);
    if(lat>0.05){ p.F(M.latex[1]); p.ell(0.2,5.2,6,1.3*Math.min(1,lat+0.3)); p.F(M.latex[0]); p.rect(-2.6,4.6,3.2,0.6); }
    else { p.F(M.brass[3]); p.ell(0.2,5.4,5.8,1.2); }
    if(o.drip){ p.F(M.latex[1]); p.cap(P2(6.4,5.4),P2(7,8.4+o.drip),1,0.8); p.ell(7,9+o.drip,1,1.2); }
    if(isFx(form)&&lat>0.05){ p.F(M.glow[0]); p.rect(-1,4.6,2,0.5); }
  }

  /* ---------- braços: manga comprida rasgada, facão na mão da frente ---------- */
  function drawArm(c,u,M,sk,P,front,form){
    const p=mkPen(c,u), sh=front?sk.shF:sk.shB, el=front?sk.elF:sk.elB, wr=front?sk.wrF:sk.wrB; p._c=c; p.id();
    const sn=sideN(sh,el);
    if(!front){
      // antebraço nu (manga arregaçada) com veias e cortes
      const n=limb(p,M.skin,el,wr,8.4,7.2,{});
      p.F(M.vein[1]); p.cap(off(lerp(el,wr,0.25),n,-1),off(lerp(el,wr,0.8),n,-1.4),0.7,0.5);
      spineCuts(p,M,lerp(el,wr,0.3),lerp(el,wr,0.85),2,form);
      limb(p,M.shirt,sh,el,10.6,9.6,{hl:0.6});
      // manga enrolada no cotovelo (rolo grosso)
      p.F(M.shirt[1]); p.circle(el,5.4); p.F(M.shirt[2]); p.circle(off(el,sn,1.2),3.6); p.F(M.shirt[0]); p.cap(off(el,sn,-3.6),off(lerp(el,wr,0.1),sn,-3),0.9,0.8);
      p.F(M.shirt[3]); p.cap(off(el,sn,4.4),off(lerp(el,wr,0.12),sn,4),0.8,0.8);
    } else {
      limb(p,M.shirt,sh,el,10.8,9.8,{hl:0.6});
      // manga rasgada no meio do antebraço: pele, corte em espinha, fungo brotando
      const n=limb(p,M.skin,el,wr,8.8,7.6,{});
      const e2=lerp(el,wr,0.5); limb(p,M.shirt,el,e2,9.8,9.4,{hi:false});
      const en=sideN(el,wr), ed={x:(wr.x-el.x)/en.L,y:(wr.y-el.y)/en.L};
      p.F(M.shirt[2]); for(let k=-2;k<=2;k++){ const b={x:e2.x+en.nx*k*2,y:e2.y+en.ny*k*2}, L=k%2?2.6:1.3; p.poly([[b.x-en.nx,b.y-en.ny],[b.x+en.nx,b.y+en.ny],[b.x+ed.x*L,b.y+ed.y*L]]); }
      spineCuts(p,M,lerp(el,wr,0.58),lerp(el,wr,0.92),2,form);
      p.F(M.latex[1]); { const q=lerp(sh,el,0.5); p.ell(q.x+sn.nx*2.4,q.y+sn.ny*2.4,1.8,1.3); }
      // fungos (cordyceps) saindo do braço do facão
      const f0=lerp(el,wr,0.66); fungus(p,M,off(f0,en,3.2),{x:en.nx,y:en.ny},form==='plenilunar'?7:5.4);
    }
    // dobras do algodão
    p.F(M.shirt[2]); const c1=lerp(sh,el,0.82); p.cap(off(c1,sn,-3.4),off(c1,sn,1),0.8,0.7);
    const c2=lerp(sh,el,0.55); p.cap(off(c2,sn,1.4),off(c2,sn,4.4),0.8,0.7);
    p.F(M.shirt[0]); const c3=lerp(sh,el,0.28); p.cap(off(c3,sn,-3.8),off(c3,sn,-1.2),0.7,0.6);
    p.F(M.dirt[1]); { const q=lerp(sh,el,0.66); p.ell(q.x+sn.nx*2,q.y+sn.ny*2,1.4,1); }
    if(front){ drawKnife(p,M,sk,P,form); drawFist(p,M,el,wr); }
    else {
      drawHandB(p,M,el,wr,P);
      if(P.bk>=0.5){ const ang=Math.atan2(wr.y-el.y,wr.x-el.x); const hp={x:wr.x+(wr.x-el.x)/FA*4,y:wr.y+(wr.y-el.y)/FA*4};
        p.xf(rad(P.bt)+(ang-PI/2)*0.25,hp.x,hp.y); c.scale(1.5,1.5); drawBucket(c,p,M,form,P.lat,{}); p.id(); }
      if(P.tig>=0.5){ const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y); c.scale(1.24,1.24); drawBowl(p,M,form,P.pour); p.id(); }
    }
  }
  function drawBowl(p,M,form,pour){
    // tigela de sangria (cuia escura) segura de lado, boca virada
    p.F(M.rubber[1]); p.poly([[3,-4],[9,-4.4],[9.6,-1],[8,2.4],[4.4,2.6],[2.6,-0.6]]);
    p.F(M.rubber[0]); p.rect(4,-3.6,4,0.7);
    p.F(M.latex[1]); p.ell(6.4,-3.8,2.8,0.8);
    if(pour){ p.F(M.latex[1]); p.cap(P2(9,-4),P2(13,-2),1.4,1.2); p.F(M.latex[0]); p.rect(10,-3.8,1.6,0.5); }
  }
  function fungus(p,M,at,dir,L){
    // 3 hastes finas com cabeça bulbosa (cordyceps)
    const a0=Math.atan2(dir.y,dir.x);
    [-0.55,0.05,0.6].forEach((da,k)=>{ const a=a0+da, l=L*(k===1?1:0.75), e={x:at.x+Math.cos(a)*l,y:at.y+Math.sin(a)*l};
      p.F(M.fungus[2]); p.cap(at,e,1,0.7); p.F(M.fungus[1]); p.circle(e,1.3); p.F(M.fungus[0]); p.rect(e.x-0.7,e.y-1,0.9,0.7); });
  }
  function drawFist(p,M,el,wr){
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y); p._c.scale(1.32,1.32);
    p.F(M.skin[1]); p.poly([[-1,-3.4],[4.4,-3.8],[6,-1],[5.6,3.4],[-1,3.6]]);
    p.F(M.skin[2]); p.poly([[-1,1.4],[5.8,1.2],[5.6,3.4],[-1,3.6]]);
    p.F(M.skin[0]); p.rect(0.4,-3.2,3.6,0.9);
    for(let k=0;k<4;k++){ const y0=-2.8+k*1.9; p.F(M.skin[1]); p.ell(6,y0,1.7,1.05); p.F(M.skin[2]); p.rect(5.4,y0+0.4,1.6,0.5); p.F(M.nail[1]); p.rect(6.6,y0-0.4,0.8,0.7); }
    p.F(M.skin[1]); p.cap(P2(1.6,-3.2),P2(5,-4.6),1.8,1.4); p.F(M.skin[3]); p.rect(2,0.6,3,0.6);
    p.F(M.latex[1]); p.rect(0.6,1.8,1.6,1.2);
    p.id();
  }
  function drawHandB(p,M,el,wr,P){
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y); p._c.scale(1.3,1.3);
    p.F(M.skin[1]); p.poly([[-1,-3],[4.4,-3.2],[5.4,2.8],[-1,3.2]]);
    p.F(M.skin[2]); p.poly([[-1,1],[5.2,1],[5.4,2.8],[-1,3.2]]);
    const curl=P.bk>=0.5||P.tig>=0.5;
    [[-2.4,curl?6.4:9.4],[-0.8,curl?6.8:10.4],[0.8,curl?6.6:10],[2.4,curl?6:8.6]].forEach(([y,L])=>{ p.F(M.skin[1]); p.cap(P2(4.4,y),P2(L,y+(curl?1.4:0.4)),1.6,1.2); p.F(M.nail[1]); p.rect(L-0.6,y-0.2+(curl?1:0),0.9,0.8); });
    p.F(M.skin[1]); p.cap(P2(2,-3),P2(5,-5.6),1.8,1.3); p.F(M.skin[0]); p.rect(0.4,-2.8,3.4,0.8);
    p.id();
  }

  /* ---------- pernas: calça arregaçada e remendada, amarrada com embira, pé descalço ---------- */
  function drawLeg(c,u,M,sk,P,front){
    const p=mkPen(c,u), hip=front?sk.hipF:sk.hipB, knee=front?sk.kneeF:sk.kneeB, ank=front?sk.ankleF:sk.ankleB; p.id();
    // canela nua (ossuda) abaixo da barra arregaçada
    const nS=limb(p,M.skin,lerp(knee,ank,0.4),ank,8,6.6,{hl:0.6});
    p.F(M.skin[3]); p.cap(off(lerp(knee,ank,0.5),nS,2.4),off(lerp(knee,ank,0.95),nS,2),1,0.8); // tendão
    p.F(M.vein[1]); p.cap(off(lerp(knee,ank,0.55),nS,-1.4),off(lerp(knee,ank,0.85),nS,-0.8),0.6,0.5);
    p.F(M.dirt[1]); p.ell(lerp(knee,ank,0.86).x,lerp(knee,ank,0.86).y,3,1.6);
    // calça: coxa + joelho até a barra
    const nK=limb(p,M.pants,knee,lerp(knee,ank,0.5),11.4,10.8,{hl:0.5});
    const nT=limb(p,M.pants,hip,knee,13,11.8,{hl:0.55});
    p.F(M.pants[1]); p.circle(knee,5.6);
    // barra dobrada (rolo claro do avesso)
    const cb=lerp(knee,ank,0.5); p.F(M.pants[0]); p.cap(off(cb,nK,-6),off(cb,nK,6),2.6,2.6); p.F(M.pants[2]); p.cap(off(lerp(knee,ank,0.54),nK,-6),off(lerp(knee,ank,0.54),nK,6),1,1);
    // dobras e costura
    p.F(M.pants[2]); p.cap(off(lerp(hip,knee,0.45),nT,1.4),off(lerp(hip,knee,0.62),nT,4.6),0.8,0.7);
    p.F(M.pants[0]); p.cap(off(lerp(hip,knee,0.15),nT,-3.6),off(lerp(hip,knee,0.8),nT,-3.2),0.7,0.7);
    if(front){
      // remendo quadrado no joelho com pontos de linha
      const k0=lerp(hip,knee,0.86), a=sideN(hip,knee); const sq=[off(off(k0,a,-3.6),{nx:(knee.x-hip.x)/a.L,ny:(knee.y-hip.y)/a.L},-3),off(off(k0,a,3),{nx:(knee.x-hip.x)/a.L,ny:(knee.y-hip.y)/a.L},-3),off(off(k0,a,3),{nx:(knee.x-hip.x)/a.L,ny:(knee.y-hip.y)/a.L},3.4),off(off(k0,a,-3.6),{nx:(knee.x-hip.x)/a.L,ny:(knee.y-hip.y)/a.L},3.4)];
      p.F(M.patch[1]); p.poly(sq.map(q=>[q.x,q.y])); p.F(M.patch[0]); p.rect(sq[0].x,sq[0].y,1.4,0.7); p.F(M.patch[3]); sq.forEach(q=>p.rect(q.x-0.4,q.y-0.4,0.8,0.8));
      p.F(M.latex[1]); { const q=lerp(hip,knee,0.35); p.ell(q.x+nT.nx*3,q.y+nT.ny*3,1.8,1.2); }
    } else { p.F(M.dirt[2]); const d0=lerp(hip,knee,0.6); p.ell(d0.x,d0.y,2,1.4); }
    // embira amarrada abaixo do joelho
    const em=lerp(knee,ank,0.46); p.F(M.cord[1]); p.cap(off(em,nK,-5.6),off(em,nK,5.6),1.4,1.4); p.F(M.cord[0]); p.rect(em.x-1,em.y-1,1.4,0.6);
    p.F(M.cord[2]); p.cap(off(em,nK,-5.6),{x:em.x+nK.nx*-6.4-1.2,y:em.y+nK.ny*-6.4+2.6},0.8,0.6);
    // pé descalço: peito do pé, dedos compridos, unhas sujas
    const fa=rad((front?P.fF:P.fB)+sk.R); p.xf(fa,ank.x,ank.y); c.scale(1.3,1.3);
    p.F(M.skin[1]); p.poly([[-3,-1.6],[2.4,-1.4],[6.4,0.6],[9.8,1.6],[10.6,3.4],[-3.4,3.4]]);
    p.F(M.skin[2]); p.poly([[-3.4,2],[10.4,2.2],[10.6,3.4],[-3.4,3.4]]);
    p.F(M.skin[0]); p.poly([[0,-1.2],[2.4,-1.2],[6,0.6],[5.6,1.2],[2,0],[0,0]]);
    p.F(M.skin[3]); p.rect(-3.4,3.4,13.6,0.8);
    p.F(M.skin[2]); [6.6,8,9.2].forEach(x=>p.rect(x,1.6,0.6,1.8)); p.F(M.nail[1]); p.rect(9.6,1.8,1,0.8);
    p.F(M.dirt[1]); p.ell(3,3,3,0.9); p.F(M.dirt[2]); p.rect(-2.6,2.4,2,1);
    p.id();
  }

  /* ---------- tronco: camisa de algodão cru (manga comprida), corda na cintura, látex no peito ---------- */
  const SHIRT=[[-9.2,8],[-9.4,0],[-9.8,-10],[-10.4,-20],[-11.2,-28],[-10.6,-33.4],[-7.6,-37.4],[-1.6,-39],[4.4,-38.6],[8.4,-36],[10.4,-31],[11,-24],[10.6,-16],[10.2,-8],[10.4,0],[10.8,7.6],[7,9],[3,7.4],[-1,9.4],[-5,7.6]];
  function drawTorso(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    const shape=W(sk,SHIRT);
    p.F(M.shirt[1]); p.poly(shape);
    clip(c,shape,()=>{
      // volumes grandes: luz no peito/ombro, sombra fria larga nas costas e na barra
      p.F(M.shirt[0]); p.poly(W(sk,[[1,-34],[5,-40],[11,-33],[12,-24],[11,-16],[8,-18],[4,-28]]));
      p.F(M.shirt[2]); p.poly(W(sk,[[-14,12],[-14,-40],[-3.6,-40],[-4.6,-30],[-3.6,-18],[-2,-8],[1,-1],[14,-1],[14,12]]));
      p.F(M.shirt[3]); p.poly(W(sk,[[-14,12],[-14,-40],[-8,-40],[-8.6,-30],[-7.8,-18],[-6.6,-6],[-5.4,12]]));
      p.F(M.shirt[3]); p.poly(W(sk,[[-14,6],[15,6],[15,12],[-14,12]]));
      // dobras e costura do ombro
      p.F(M.shirt[2]); [[[-1,-14],[4,-17],[4.6,-16.2],[-0.4,-13.2]],[[1,-24],[6,-26],[6.4,-25.2],[1.4,-23.2]],[[2,-4],[7,-7],[7.4,-6],[2.4,-3.2]],[[-4,-30],[-1,-32],[-0.6,-31.2],[-3.6,-29.4]]].forEach(f=>p.poly(W(sk,f)));
      p.F(M.shirt[0]); [[[0,-20],[5,-22],[5.4,-21.2],[0.4,-19.2]]].forEach(f=>p.poly(W(sk,f)));
      p.F(M.shirt[2]); p.poly(W(sk,[[-6,-35.6],[6,-36.4],[6,-35.6],[-6,-34.8]]));
      // botões e abertura da gola
      p.F(M.shirt[2]); p.poly(W(sk,[[6.6,-38.6],[9,-36],[8.4,-24],[7.2,-24],[7.4,-34]]));
      p.F(M.skin[2]); p.poly(W(sk,[[4.6,-38.6],[8.4,-36.4],[7.6,-31],[6.4,-31.6]]));
      p.F(M.vein[1]); p.poly(W(sk,[[6.4,-36],[7,-36],[6.8,-33],[6.4,-33.4]]));
      p.F(M.wood[2]); [[-22],[-15],[-8]].forEach(([v])=>{ const q=Wp(sk,8.2,v); p.ell(q.x,q.y,0.8,0.8); });
      // látex endurecido no peito (crosta branca) + suor
      p.F(M.latex[2]); p.poly(W(sk,[[2,-30],[8,-31],[9.6,-24],[7,-19],[3,-22]]));
      p.F(M.latex[1]); p.poly(W(sk,[[2.6,-29.4],[7.6,-30.4],[9,-24.4],[6.8,-20],[3.4,-22.6]]));
      p.F(M.latex[0]); p.poly(W(sk,[[4,-29],[6.6,-29.4],[6,-27.6],[4.2,-27.4]]));
      p.F(M.latex[1]); p.poly(W(sk,[[6.4,-20.4],[7.4,-20.4],[7.2,-15],[6.6,-14.6]]));
      p.F(M.dirt[1]); [[-1,2,3,1.6],[7,4,2,1.2],[-6,-10,1.4,2]].forEach(([uu,vv,a,b])=>{ const q=Wp(sk,uu,vv); p.ell(q.x,q.y,a,b); });
      p.F(M.blood[1]); [[8,-12,1.6,1.2],[9.4,-9,1,0.8]].forEach(([uu,vv,a,b])=>{ const q=Wp(sk,uu,vv); p.ell(q.x,q.y,a,b); });
      if(form==='plenilunar'){ p.F(M.blood[2]); p.poly(W(sk,[[-2,-16],[10,-18],[11,-2],[4,2],[-2,-4]])); p.F(M.blood[1]); p.poly(W(sk,[[1,-14],[9,-15],[10,-6],[5,-2],[1,-6]])); }
      // rasgo nas costas: pele com cortes em espinha (por onde saem as raízes)
      p.F(M.shirt[3]); p.poly(W(sk,[[-10.6,-28],[-5.4,-30],[-3,-24],[-4,-16],[-8,-14],[-10.4,-19]]));
      p.F(M.skin[2]); p.poly(W(sk,[[-10,-27.2],[-5.8,-28.8],[-3.8,-24],[-4.6,-17],[-7.8,-15.4],[-9.8,-19.6]]));
      p.F(M.skin[1]); p.poly(W(sk,[[-8.6,-26],[-6,-27],[-5,-23.6],[-6.6,-21.4],[-8.4,-22]]));
      p.F(M.flesh[2]); for(let k=0;k<3;k++){ const v=-26+k*3.4; p.poly(W(sk,[[-9.4,v],[-5,v+1.6],[-5,v+2.4],[-9.4,v+0.8]])); }
      p.F(M.latex[1]); p.poly(W(sk,[[-5.4,-20],[-4.8,-20],[-5,-15.6],[-5.4,-15.8]]));
      if(isFx(form)){ p.F(M.glow[1]); for(let k=0;k<3;k++){ const v=-25.6+k*3.4; p.poly(W(sk,[[-8.6,v],[-5.4,v+1.2],[-5.4,v+1.6],[-8.6,v+0.4]])); } }
    });
    // cinto de corda com nó
    p.F(M.cord[1]); p.poly(W(sk,[[-10,-3.4],[11,-3.6],[11,-1],[-10,-0.8]]));
    p.F(M.cord[0]); for(let k=0;k<7;k++){ const uu=-8+k*3; p.poly(W(sk,[[uu,-3.4],[uu+1.4,-3.4],[uu+0.6,-1],[uu-0.8,-1]])); }
    p.F(M.cord[2]); p.poly(W(sk,[[-10,-1.6],[11,-1.8],[11,-1],[-10,-0.8]]));
    p.F(M.cord[1]); p.circle(Wp(sk,7.6,-2.2),2); p.cap(Wp(sk,7.6,-2),Wp(sk,9,4.6),1.4,1); p.cap(Wp(sk,7,-2),Wp(sk,6,5.6),1.4,1);
    p.F(M.cord[2]); p.rect(Wp(sk,6,5.6).x-0.6,Wp(sk,6,5.6).y,1.2,1);
  }
  // corcunda: raízes saindo das costas + bolota de borracha no ombro de trás
  function drawBack(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    const big=form==='plenilunar';
    // raízes (galhos tortos) brotando do rasgo
    const roots=big?[[-8,-26,-22,-44,4.2],[-8,-21,-25,-28,3.8],[-7,-17,-19,-10,3.2],[-6,-28,-12,-50,3.2]]:[[-8,-25,-17,-36,3.4],[-7,-19,-17,-20,3]];
    roots.forEach(([u0,v0,u1,v1,w],k)=>{ const a=Wp(sk,u0,v0), b=Wp(sk,u1,v1), m=Wp(sk,(u0+u1)/2-1.4,(v0+v1)/2+1.6);
      p.F(M.root[1]); p.cap(a,m,w*1.3,w); p.cap(m,b,w,w*0.45);
      p.F(M.root[2]); p.cap(off(a,{nx:0.6,ny:0.8},0.5),off(m,{nx:0.6,ny:0.8},0.5),w*0.6,w*0.5);
      p.F(M.root[0]); p.cap(off(m,{nx:-0.5,ny:-0.8},0.4),off(b,{nx:-0.5,ny:-0.8},0.2),w*0.35,w*0.2);
      if(k%2===0){ const t=lerp(m,b,0.4); p.F(M.root[1]); p.cap(t,{x:t.x-3,y:t.y+(big?-5:-3)},w*0.5,w*0.25); }
    });
    // fungos no ombro de trás
    fungus(p,M,Wp(sk,-8.4,-31),{x:-0.6,y:-0.8},big?7:5.4);
    // bolota de borracha defumada (enrolada no ombro por uma tira)
    const bc=Wp(sk,-7.2,-37), r=big?7.8:7.2;
    p.F(M.rubber[1]); p.circle(bc,r);
    p.F(M.rubber[2]); p.ell(bc.x-1.6,bc.y+1.4,r*0.7,r*0.62);
    p.F(M.rubber[3]); p.ell(bc.x-2.6,bc.y+2.6,r*0.42,r*0.36);
    p.F(M.rubber[0]); p.ell(bc.x+1.6,bc.y-2.4,r*0.38,r*0.24); p.rect(bc.x+2.6,bc.y-1,1,0.8);
    p.F(M.rubber[2]); [[-2,-3],[1,1],[-3.6,0.4]].forEach(([dx,dy])=>p.rect(bc.x+dx,bc.y+dy,1.4,0.5)); // camadas
    p.F(M.leather[1]); p.cap({x:bc.x-r*0.8,y:bc.y-r*0.5},Wp(sk,4,-33),1.6,1.4); p.F(M.leather[0]); p.rect(bc.x-1,bc.y-r*0.9,1.6,0.6);
  }

  /* ---------- cabeça: lamparina na testa, chapéu murcho pra trás, olhos fundos âmbar, barba rala ---------- */
  function drawHead(c,u,M,sk,P,form,fk){
    const p=mkPen(c,u); p.xf(sk.ha,sk.neck.x,sk.neck.y); c.scale(HS,HS);
    // pescoço comprido e fino, esticado pra frente (tendões e cortes)
    p.F(M.skin[1]); p.poly([[-4.6,6],[3.6,6],[5.4,-4],[-3,-6]]);
    p.F(M.skin[2]); p.poly([[-4.6,6],[-1.2,6],[-1.2,-5.4],[-3,-6]]);
    p.F(M.skin[0]); p.poly([[2.4,4],[3.4,4],[4.6,-3.6],[3.6,-3.6]]);
    p.F(M.vein[1]); p.rect(1,-3,0.8,6); p.F(M.flesh[2]); p.poly([[-0.6,1],[2.6,0],[2.6,0.7],[-0.6,1.7]]);
    // crânio (um pouco comprido, maçãs fundas)
    p.F(M.skin[1]); p.ell(2.4,-12.4,9,9.4);
    p.poly([[-3.4,-6],[11.2,-7.6],[12.4,-4.4],[6,-2.6],[-2,-3]]);
    p.F(M.skin[2]); p.poly([[-6.8,-15],[-4.8,-6],[0,-2.6],[6,-2.6],[2,-5],[-1.6,-9],[-2.6,-14],[-5,-18]]);
    p.F(M.skin[3]); p.poly([[-6.8,-14],[-6,-9],[-4,-5.2],[-4.6,-11]]);
    p.F(M.skin[0]); p.poly([[2,-19],[8,-18.6],[10,-16],[4,-16.6]]); // testa iluminada pela lamparina
    p.F(M.skin[3]); p.poly([[5,-8.6],[9.6,-8.2],[8.6,-6.6],[5.6,-7]]); // maçã funda
    p.F(M.vein[1]); p.poly([[-1,-17],[0,-17.4],[1.4,-13],[0.6,-12.6]]); p.poly([[0.6,-14],[3,-15.6],[3.2,-15],[1,-13.4]]);
    // orelha
    p.F(M.skin[1]); p.ell(-2.4,-11.2,2.2,3.1); p.F(M.skin[3]); p.ell(-2.2,-11,1,1.8); p.F(M.flesh[2]); p.rect(-3.4,-8.8,1.1,1.2);
    // cabelo grisalho ralo na nuca
    p.F(M.hair[1]); p.poly([[-7.4,-15],[-6.6,-18],[-3,-19.6],[-3.6,-15.4],[-5.4,-11.6],[-7.2,-10]]);
    p.F(M.hair[0]); p.rect(-6.4,-17,2,0.6); p.rect(-6.8,-13.4,1.6,0.6);
    // olho fundo: órbita escura grande + brilho âmbar
    p.F(M.skin[3]); p.ell(8,-10.4,3.2,2.6);
    p.F(M.mouth[2]); p.ell(8.2,-10.2,2.3,1.7);
    p.F(M.eye[1]); p.ell(8.6,-10.2,1.5,1.1); p.F(M.eye[0]); p.rect(8.4,-10.6,0.9,0.7); p.F(M.eye[2]); p.rect(9.2,-9.8,0.8,0.6);
    p.F(M.hair[1]); p.poly([[4.8,-13.4],[8.4,-14.2],[11.4,-13],[11.2,-12.2],[8.4,-13.2],[5,-12.6]]); // sobrancelha franzida
    p.F(M.skin[3]); p.ell(12,-10,0.9,1.2); p.F(M.eye[1]); p.rect(11.7,-10.2,0.8,0.8);
    // nariz ossudo
    p.F(M.skin[1]); p.poly([[11,-10.4],[14.4,-6.4],[13.4,-5.4],[11.2,-6.2]]);
    p.F(M.skin[3]); p.rect(12.6,-6,1.2,0.8); p.F(M.skin[0]); p.rect(11.8,-9.4,0.8,1.6);
    // corte em espinha na têmpora
    p.F(M.flesh[2]); [[-14],[-12]].forEach(([y])=>p.poly([[3,y],[5.6,y+1.2],[5.6,y+1.8],[3,y+0.6]]));
    // boca de cima (dentes) + fios de látex
    p.F(M.mouth[1]); p.poly([[5,-5],[13,-5.2],[12.8,-2.4],[5,-2.2]]);
    p.F(M.teeth[1]); [[6.6,-5.2,1.2,1.6],[8.2,-5.2,1.2,1.3],[10,-5.2,1.2,1.7],[11.6,-5.2,1,1.2]].forEach(([x,y,w,h])=>p.rect(x,y,w,h));
    // bigode/barba rala
    p.F(M.hair[1]); [[7,-6],[9,-6.2],[11,-6.1],[12.6,-6]].forEach(([x,y])=>p.rect(x,y,1.2,0.8));
    p.F(M.rot[1]); p.ell(1,-8,1.6,1.2); p.F(M.rot[2]); p.rect(0.4,-8.4,1,0.9);
    if(isFx(form)){ p.F(M.glow[0]); p.rect(8,-10.6,1.6,1); p.F(M.glow[1]); p.rect(11.7,-10.2,0.8,0.9); }
    // tira de couro em volta da testa + lamparina de latão (poronga)
    p.F(M.leather[1]); p.poly([[-6,-15.6],[10.2,-17.8],[10.6,-15.4],[-5.6,-13.4]]);
    p.F(M.leather[0]); p.poly([[-2,-15.6],[9,-17.2],[9.2,-16.6],[-2,-15]]); p.F(M.leather[2]); p.poly([[-6,-14],[10.6,-16],[10.6,-15.4],[-5.6,-13.4]]);
    p.F(M.brass[2]); p.rect(-4.6,-15.6,1.6,2.2);
    c.save(); c.translate(11,-18); c.scale(1.32,1.32); c.translate(-11,18); drawLamp(p,M,P,form,fk); c.restore();
    p.id();
    if(P.hat>=0.5){ const o=sk.H(-6.4,-20.6); hatAt(c,p,M,form,o.x,o.y,sk.ha+rad(P.ht),HS*0.92,{}); }
  }
  function drawLamp(p,M,P,form,fk){
    // reservatório cilíndrico + bico + refletor
    p.F(M.brass[1]); p.poly([[9,-22.4],[13.6,-22.4],[14,-16],[9,-15.6]]);
    p.F(M.brass[2]); p.poly([[9,-22.4],[10.6,-22.4],[10.6,-15.8],[9,-15.6]]); p.F(M.brass[3]); p.rect(9,-16.6,5,1);
    p.F(M.brass[0]); p.rect(12,-22,1,5.4);
    p.F(M.brass[2]); p.rect(8.6,-23.2,5.8,1.2); p.F(M.brass[0]); p.rect(9.4,-23.2,3,0.5);
    // bico (pavio) pra frente
    p.F(M.brass[2]); p.poly([[13.6,-21],[17,-22.6],[17.6,-21.4],[14,-19.6]]); p.F(M.brass[0]); p.rect(14.2,-21.4,2.4,0.5);
    // chama (gota que tremula; cresce com P.fl)
    const fl=P.fl||0; if(fl>0.05){
      const s=0.75+fl*0.55, sw=[0,0.8,-0.6,0.4][fk%4], bx=17.6, by=-22.8;
      p.F(M.flame[3]); p.poly([[bx-1.6*s,by],[bx+2*s,by-0.4],[bx+1.2*s+sw,by-5*s],[bx+0.4*s+sw*1.6,by-8.6*s],[bx-1*s+sw,by-4.6*s]]);
      p.F(M.flame[2]); p.poly([[bx-1.1*s,by-0.2],[bx+1.5*s,by-0.5],[bx+0.9*s+sw,by-4.2*s],[bx+0.3*s+sw*1.4,by-6.8*s],[bx-0.6*s+sw,by-3.8*s]]);
      p.F(M.flame[1]); p.poly([[bx-0.6*s,by-0.4],[bx+1*s,by-0.6],[bx+0.5*s+sw*0.8,by-3.4*s],[bx-0.2*s+sw*0.6,by-2.6*s]]);
      p.F(M.flame[0]); p.ell(bx+0.2*s,by-1.2*s,0.6*s,0.9*s);
    }
    // fuligem
    p.F(M.rubber[2]); p.rect(14.4,-23.8,1.4,0.6);
  }
  function drawJaw(c,u,M,sk,P,form){
    const p=mkPen(c,u); const h=sk.H(2.6,-3.6); p.xf(sk.ha+rad(P.jaw),h.x,h.y); c.scale(HS,HS);
    p.F(M.skin[1]); p.poly([[-2,-1.4],[10.6,-0.8],[11.4,1.6],[10.4,5],[6.4,6.6],[0.6,5.8],[-2.4,2.8]]);
    p.F(M.skin[2]); p.poly([[-2.4,2.8],[0.6,5.8],[6.4,6.6],[10.4,5],[9,4.4],[4,4.8],[0,3.4]]);
    p.F(M.skin[3]); p.poly([[1,5.8],[6.4,6.6],[9.4,5.8],[4,5.8]]);
    p.F(M.mouth[1]); p.poly([[2.6,-0.8],[10,-0.4],[10,1.4],[3,1.2]]);
    p.F(M.teeth[1]); [[4.2,-1,1.2,1.5],[6.2,-1,1.2,1.2],[8,-1,1.2,1.7]].forEach(([x,y,w,h])=>p.rect(x,y,w,h));
    // barba rala no queixo
    p.F(M.hair[1]); [[2,3],[4,4.4],[6,5],[8,4.6],[9.6,3.8],[3,5.2],[7,5.8]].forEach(([x,y])=>p.rect(x,y,1,0.9));
    p.F(M.hair[0]); p.rect(5,4.6,0.8,0.6);
    // fio de látex grudado
    const L=2+(P.drool%4)*1.3+(P.jaw>30?2.4:0);
    p.F(M.latex[1]); p.poly([[9.4,4.4],[10.8,3.8],[10.6,4+L],[10,5+L]]); p.ell(10.3,5+L,1.1,1.1);
    p.id();
  }
  function drawMouthIn(c,u,M,sk,P){
    if(P.jaw<16) return; const p=mkPen(c,u); p.id();
    const a=sk.H(5,-2.4), b=sk.H(12.8,-2.6), h=sk.H(2.6,-3.6), ja=sk.ha+rad(P.jaw), jc=Math.cos(ja), js=Math.sin(ja);
    const J=(x,y)=>({x:h.x+(x*jc-y*js)*HS,y:h.y+(x*js+y*jc)*HS}), d=J(10.4,0.6), e=J(3,0.6);
    p.F(M.mouth[2]); p.poly([[a.x,a.y],[b.x,b.y],[d.x,d.y],[e.x,e.y]]);
    p.F(M.mouth[3]); const m=lerp(lerp(a,b,0.3),lerp(e,d,0.3),0.5); p.circle(m,1.6);
    // fios de látex entre os dentes
    p.F(M.latex[1]); const f1=lerp(a,e,0.5), f2=lerp(lerp(a,b,0.6),lerp(e,d,0.6),0.5); p.cap(lerp(a,b,0.25),lerp(e,d,0.3),0.6,0.5); p.cap(lerp(a,b,0.7),lerp(e,d,0.72),0.5,0.5); p.circle(f2,0.5); p.rect(f1.x,f1.y,0.6,0.6);
  }

  /* ---------- chapéu de palha de aba larga, murcho e furado (origem no centro da aba) ---------- */
  function drawHat(c,p,M,form,o){
    o=o||{}; const sx=o.sx!=null?o.sx:1;
    const brim=(dy,k)=>{ const pts=[]; for(let i=0;i<26;i++){ const a=i/26*PI*2, ca=Math.cos(a), sa=Math.sin(a); pts.push([ca*19*k, sa*3.8*k+dy+Math.abs(ca)*Math.abs(ca)*3.4+(ca>0.4?(ca-0.4)*1.6:0)]); } return pts; };
    p.F(M.straw[2]); p.poly(brim(1.4,1));
    p.F(M.straw[1]); p.poly(brim(0,1));
    clip(c,brim(0,1),()=>{
      p.F(M.straw[2]); p.poly([[-21,-2],[-7,-2],[-7,8],[-21,8]]); p.F(M.straw[3]); p.poly([[-21,-2],[-14,-2],[-14,8],[-21,8]]);
      p.F(M.straw[0]); p.poly([[6,1.4],[18,3],[18,4.6],[7,3]]);
      p.F(M.straw[2]); for(let k=0;k<12;k++){ const x=-17+k*3.1; p.rect(x,-3+(k%2)*0.6,0.5,7); }
      p.F(M.dirt[2]); p.ell(12,4,3,1);
    });
    // furos e palha desfiada na borda
    p.F(M.straw[3]); p.poly([[-15,1.6],[-12.6,0.6],[-11.4,2.2],[-13.4,3.2]]); p.poly([[13,3],[14.6,2.6],[15,4],[13.6,4.4]]);
    p.F(M.straw[2]); [[-19.6,4.6],[-17,6],[16.4,5.6],[18.8,4.2],[8,6.4]].forEach(([x,y])=>p.poly([[x,y],[x+1.2,y],[x+0.4,y+2.2]]));
    // copa baixa e amassada (afundada de um lado)
    const crown=[[-9,0.8],[-9.6,-4],[-8.4,-8],[-4.6,-9.6],[0,-8.6],[3.4,-9.8],[7.4,-8.6],[9.4,-5],[9.6,1],[5,2.2],[0,2.4],[-5,2]].map(([x,y])=>[x*sx,y]);
    p.F(M.straw[1]); p.poly(crown);
    clip(c,crown,()=>{
      p.F(M.straw[2]); p.poly([[-11,-12],[-4*sx,-12],[-5*sx,3],[-11,3]]);
      p.F(M.straw[3]); p.poly([[-11,-12],[-7.4*sx,-12],[-8*sx,3],[-11,3]]);
      p.F(M.straw[0]); p.poly([[2*sx,-9],[7*sx,-8.4],[8.6*sx,-5.4],[5.4*sx,-7]]);
      p.F(M.straw[2]); p.poly([[-2*sx,-8.6],[1*sx,-8.2],[0.4*sx,-6],[-1.6*sx,-6.8]]); // amassado
      p.F(M.straw[2]); for(let r=0;r<3;r++) for(let k=0;k<7;k++){ const x=(-6+k*2.4+(r%2)*1.2)*sx; p.rect(x,-7.4+r*2,0.7,0.6); }
      p.F(M.straw[3]); p.ell(-4*sx,-4,1.4,1.2); // furo na copa
      // faixa de pano suado
      p.F(M.leather[2]); p.poly([[-11,-1.4],[11,-1.4],[11,2.8],[-11,2.8]]);
      p.F(M.leather[1]); p.poly([[-2*sx,-1.4],[9.6*sx,-1.4],[9.6*sx,-0.6],[-2*sx,-0.6]]);
    });
    p.F(M.latex[1]); p.ell(-14,3.4,1.6,0.8);
    if(form==='plenilunar'){ p.F(M.blood[1]); p.poly([[3,-2],[5.6,-2],[5,1],[4.2,2.6],[3.4,0.4]]); }
    if(form==='enluarado'){ p.F(M.glow[1]); p.rect(-6*sx,-8.4,2.4,0.6); }
  }
  function hatAt(c,p,M,form,ox,oy,ang,sc,o){ p.xf(ang,ox,oy); c.scale(sc,sc); drawHat(c,p,M,form,o); p.id(); }

  /* ---------- balde na cintura (lado de trás do quadril) ---------- */
  function drawHipBucket(c,u,M,sk,P,form){
    if(P.bk>=0.5) return; const p=mkPen(c,u); p.id();
    if(P.spill>0.5){ p.xf(rad(-96),AX-30-8*P.spill,GROUND-7.4); c.scale(1.18,1.18); drawBucket(c,p,M,form,0,{}); p.id(); return; } // tombado no chão, derramando
    const h=Wp(sk,-10.4,-1.6); p.xf(sk.SP?(rad(P.bt)*0.6+sk.ra*0.7):0,h.x,h.y); c.scale(1.18,1.18);
    drawBucket(c,p,M,form,P.lat,{drip:(P.drool%4)*0.8});
    p.id();
    // gancho de corda prendendo a alça no cinto
    p.F(M.cord[2]); p.cap(Wp(sk,-9,-2.4),h,1,0.8);
  }
  function drawSpill(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id(); const s=P.spill, x0=AX-14-8*s;
    p.F(M.latex[2]); p.ell(x0,GROUND-1.4,8+22*s,2.4+1.4*s);
    p.F(M.latex[1]); p.ell(x0+1,GROUND-2,6+19*s,1.8+1*s);
    p.F(M.latex[0]); p.rect(x0-4*s,GROUND-3,6*s+2,0.8);
    if(isFx(form)){ p.F(M.glow[1]); p.rect(x0+6*s,GROUND-2.6,4,0.6); }
  }

  /* ---------- rastros ---------- */
  function drawSmear(c,u,M,sk,P){
    const p=mkPen(c,u); p.id();
    const sh=sk.shF, w=sk.ztip, r=Math.hypot(w.x-sh.x,w.y-sh.y)+2, a1=Math.atan2(w.y-sh.y,w.x-sh.x);
    const n=10, pts=[]; for(let i=0;i<=n;i++){ const a=a1-1.5+1.55*i/n; pts.push([sh.x+Math.cos(a)*r,sh.y+Math.sin(a)*r]); }
    for(let i=n;i>=0;i--){ const a=a1-1.5+1.55*i/n, rr=r-2-8*(i/n); pts.push([sh.x+Math.cos(a)*rr,sh.y+Math.sin(a)*rr]); }
    p.F(M.swish[0]); p.poly(pts.map(([x,y])=>[Math.max(1,Math.min(FW-2,x)),Math.max(1,Math.min(GROUND,y))]));
    p.F(M.swish[2]); const q=pts.slice(n-3,n+1); for(let k=0;k<q.length-1;k++) p.cap({x:q[k][0],y:q[k][1]},{x:q[k+1][0],y:q[k+1][1]},0.9,0.9);
  }
  function drawBucketSmear(c,u,M,sk,P){
    const p=mkPen(c,u); p.id();
    const sh=sk.shB, w=sk.wrB, r=Math.hypot(w.x-sh.x,w.y-sh.y)+12, a1=Math.atan2(w.y-sh.y,w.x-sh.x);
    const n=10, pts=[]; for(let i=0;i<=n;i++){ const a=a1-1.6+1.6*i/n; pts.push([sh.x+Math.cos(a)*r,sh.y+Math.sin(a)*r]); }
    for(let i=n;i>=0;i--){ const a=a1-1.6+1.6*i/n, rr=r-3-12*(i/n); pts.push([sh.x+Math.cos(a)*rr,sh.y+Math.sin(a)*rr]); }
    p.F(M.swish[1]); p.poly(pts.map(([x,y])=>[Math.max(1,Math.min(FW-2,x)),Math.max(1,Math.min(GROUND,y))]));
  }
  // jato saindo do balde (no quadro do lançamento): leque de látex com gotas
  function drawSplash(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    const w=sk.wrB, o={x:w.x+8,y:w.y-6};
    // golfada grossa de látex saindo da boca do balde em arco, quebrando em bolhas
    const arc=[[0,0,5.2],[7,-6,6],[15,-10,6.2],[24,-12,5.4],[32,-12,4.4],[39,-10,3.4],[45,-7,2.4]];
    p.F(M.latex[3]); arc.forEach(([dx,dy,r])=>p.circle({x:o.x+dx,y:o.y+dy+1.2},r));
    p.F(M.latex[2]); arc.forEach(([dx,dy,r])=>p.circle({x:o.x+dx,y:o.y+dy+0.6},r*0.92));
    p.F(M.latex[1]); arc.forEach(([dx,dy,r])=>p.circle({x:o.x+dx-0.4,y:o.y+dy-0.4},r*0.78));
    p.F(M.latex[0]); arc.slice(0,5).forEach(([dx,dy,r])=>p.ell(o.x+dx-r*0.3,o.y+dy-r*0.45,r*0.4,r*0.22));
    p.F(M.latex[1]); [[50,-4,1.8],[44,-15,1.6],[30,-19,1.4],[52,-10,1.2],[20,-2,1.4]].forEach(([dx,dy,r])=>p.circle({x:o.x+dx,y:o.y+dy},r));
    p.F(M.latex[2]); [[12,-1,1.6,3],[26,-6,1.2,2.4]].forEach(([dx,dy,r,L])=>p.cap({x:o.x+dx,y:o.y+dy},{x:o.x+dx,y:o.y+dy+L},r,r*0.6)); // pingos
    if(isFx(form)){ p.F(M.glow[0]); p.rect(o.x+12,o.y-11,8,1); p.rect(o.x+28,o.y-14,5,0.8); }
  }

  /* ---------- adereços: jato em voo e poça ---------- */
  const PW=56, PH=34, PG=20, PAX=28;
  function frameBlob(form,st,K){
    const M=mats(form), s=((st|0)%3+3)%3;
    const parts=[
      {noShade:true, noRim:true, smear:true, draw:(c,u)=>{ const p=mkPen(c,u); p.id(); p.F(M.latex[2]); p.poly([[4,PG-1-s],[20,PG-4],[20,PG+2],[6,PG+1+s]]); p.F(M.latex[1]); [[8,PG-2],[13,PG+2]].forEach(([x,y])=>p.circle({x:x-s*2,y},1.2)); }},
      {draw:(c,u)=>{ const p=mkPen(c,u); p.id(); const cx=PAX+2, cy=PG;
        p.F(M.latex[1]); p.ell(cx,cy,9+(s===1?1:0),6-(s===1?1:0)); p.ell(cx-7,cy+1,4,3);
        p.F(M.latex[2]); p.ell(cx-1,cy+2.4,7,2.6);
        p.F(M.latex[0]); p.ell(cx+3,cy-2.6,3.4,1.6); p.rect(cx-2,cy-4,2,0.8);
        p.F(M.latex[1]); p.circle({x:cx+11,y:cy-3+s},1.6); p.circle({x:cx-12,y:cy+4-s},1.3);
        if(isFx(form)){ p.F(M.glow[1]); p.rect(cx-3,cy-1,5,0.8); } }},
    ];
    const cv=compose({FW:Math.round(PW*K),FH:Math.round(PH*K),GROUND:PH*K,parts,M,step:5,flash:0,rim:RIM[form]});
    cv._ax=PAX*K; cv._gy=PG*K; return cv;
  }
  const QW=140, QH=40, QG=30, QAX=70;
  function framePool(form,st,K){
    const M=mats(form), fire=st>=3, s=st%3;
    const parts=[
      {noRim:true, draw:(c,u)=>{ const p=mkPen(c,u); p.id(); const cx=QAX, cy=QG; c.translate(cx,cy); c.scale(1.9,1.2); c.translate(-cx,-cy);
        p.F(fire?M.rubber[2]:M.latex[3]); p.ell(cx,cy+0.6,30,6.6);
        p.F(fire?M.rubber[1]:M.latex[2]); p.ell(cx,cy,28.6,5.8); p.ell(cx-24,cy+2,6,3.4); p.ell(cx+22,cy-1.4,7,3);
        p.F(fire?M.rubber[0]:M.latex[1]); p.ell(cx+1,cy-0.6,23,4.2); p.ell(cx+20,cy-1.6,5,2);
        if(!fire){ p.F(M.latex[0]); p.ell(cx-6+s,cy-2,8,1.2); p.rect(cx+10,cy-2.6,4,0.7);
          p.F(M.latex[2]); [[-14,1],[6,1.8],[16,0]].forEach(([dx,dy])=>p.ell(cx+dx,cy+dy,2.4,0.8)); // coágulos
          if(isFx(form)){ p.F(M.glow[1]); p.rect(cx-14+s*3,cy-1.4,6,0.6); } } }},
    ];
    if(fire) parts.push({noShade:true, noRim:true, draw:(c,u)=>{ const p=mkPen(c,u); p.id(); const cx=QAX, cy=QG; c.translate(cx,0); c.scale(1.9,1.2); c.translate(-cx,0);
      [[-18,9],[-6,13],[6,11],[17,8],[-26,6],[24,5]].forEach(([dx,h],k)=>{ const hh=h*(0.8+0.25*(((k+s)%3)/2)), x=cx+dx, sw=((k+s)%2?1.2:-1.2);
        p.F(M.flame[3]); p.poly([[x-4,cy],[x+4,cy],[x+2+sw,cy-hh*0.6],[x+sw*1.4,cy-hh],[x-2.4+sw,cy-hh*0.5]]);
        p.F(M.flame[2]); p.poly([[x-3,cy-0.4],[x+3,cy-0.4],[x+1.4+sw,cy-hh*0.5],[x+sw,cy-hh*0.8],[x-1.6+sw,cy-hh*0.4]]);
        p.F(M.flame[1]); p.poly([[x-1.8,cy-0.6],[x+1.8,cy-0.6],[x+0.6+sw*0.6,cy-hh*0.45],[x-0.8,cy-hh*0.3]]);
        p.F(M.flame[0]); p.ell(x,cy-1.6,1,1.4); }); }});
    const cv=compose({FW:Math.round(QW*K),FH:Math.round(QH*K),GROUND:QH*K,parts,M,step:5,flash:0,rim:RIM[form]});
    cv._ax=QAX*K; cv._gy=QG*K; return cv;
  }

  /* ---------- montagem ---------- */
  const cache=PIX.cache();
  function frame(form,anim,fi,step=5,Pov,pk){
    const K=PIX.getK(), key=(pk!=null?'#'+pk+'|'+form:form+'|'+anim+'|'+fi+'|'+step)+'@'+K;
    const hit=cache.get(key); if(hit){ cache.delete(key); cache.set(key,hit); return hit; }
    if(ANIMS[anim]&&ANIMS[anim].prop){ const st=Pov&&Pov.st!=null?Math.round(Pov.st):fi; const cv=anim==='xPool'?framePool(form,st,K):frameBlob(form,st,K); cache.set(key,cv); return cv; }
    const P=Pov?Object.assign({},REST,Pov):poseOf(anim,fi), M=mats(form), sk=skeleton(P), fk=(fi|0)+(anim.length%3);
    const parts=[];
    if(P.spill>0.05) parts.push({noRim:true, draw:(c,u)=>drawSpill(c,u,M,sk,P,form)});
    const armTop=P.bk>=0.5&&P.aBs>15; // balançando o balde pra frente: braço de trás passa por cima do corpo
    parts.push(
      {back:!armTop, draw:(c,u)=>{ if(!armTop) drawArm(c,u,M,sk,P,false,form); }},
      {back:true, draw:(c,u)=>drawLeg(c,u,M,sk,P,false)},
      {draw:(c,u)=>drawBack(c,u,M,sk,P,form)},
      {draw:(c,u)=>drawHipBucket(c,u,M,sk,P,form)},
      {draw:(c,u)=>drawLeg(c,u,M,sk,P,true)},
      {draw:(c,u)=>drawTorso(c,u,M,sk,P,form)},
    );
    if(P.bsmear>=0.5) parts.push({noShade:true, smear:true, noRim:true, draw:(c,u)=>drawBucketSmear(c,u,M,sk,P)});
    parts.push({draw:(c,u)=>{ drawHead(c,u,M,sk,P,form,fk); drawMouthIn(c,u,M,sk,P); }}, {draw:(c,u)=>drawJaw(c,u,M,sk,P,form)});
    if(P.smear>=0.5) parts.push({noShade:true, smear:true, noRim:true, draw:(c,u)=>drawSmear(c,u,M,sk,P)});
    if(armTop) parts.push({draw:(c,u)=>drawArm(c,u,M,sk,P,false,form)});
    parts.push({draw:(c,u)=>drawArm(c,u,M,sk,P,true,form)});
    if(P.splash>=0.5) parts.push({noShade:true, noRim:true, draw:(c,u)=>drawSplash(c,u,M,sk,P,form)});
    if(P.hloose>=0.5) parts.push({draw:(c,u)=>{ const p=mkPen(c,u); p.id(); hatAt(c,p,M,form,AX+P.hdx,GROUND-4-P.hdy,rad(P.hdr),HS,{}); }});
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM[form]}); if(step>=4) heavyOutline(cv);
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._eye=sc(sk.H(8.6,-10.2)); cv._mouth=sc(sk.H(10,-2)); cv._hand=sc(sk.wrF); cv._head=sc(sk.H(3,-13)); cv._blade=sc(sk.ztip); cv._handB=sc(sk.wrB); cv._lamp=sc(sk.H(17.6,-24));
    cache.set(key,cv); if(cache.size>900) cache.delete(cache.keys().next().value);
    return cv;
  }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame,framePose:function(form,anim,P,key){ return frame(form,anim,0,5,P,key); }};
})();
