/* SALT — fonte de arte (editável). Build: npm run art
   Saltador: ex-surfista/skatista de Boa Viagem que virou gafanhoto. Pernas compridas dobradas em três
   segmentos (calcanhar alto), pés descalços de dedos longos, bermuda de surf, lycra rasgada, cabelo
   parafinado com faixa, colar de conchas, cordinha (leash) no tornozelo e meio shape de skate enfiado no
   cós. Salta 4 tiles: ANIMS.attack.warn (aviso no chão), .air (quadros no ar), .land. Hi-bit: honra PIX.getK(). */
const SALT=(function(){
  const {rad,lerp,P2,mkPen,compose}=PIX;
  const FW=196, FH=164, GROUND=156, AX=84;
  const RIM={comum:'#d0f0b4', enluarado:'#9ff6ff', plenilunar:'#ffb46a'};

  function mats(form){
    const m={
      skin:['#f2d6a4','#c4926a','#84584e','#463040'],
      rot:['#a8ae78','#76805a','#4e5444','#2c2e30'],
      flesh:['#f6ae94','#d0645e','#8e3446','#521c34'],
      bone:['#fff4d8','#dccfa6','#a09070','#605040'],
      lycra:['#6c7088','#40445a','#282a3c','#16141e'],
      neon:['#f8ffb0','#d8f040','#8aa82a','#465a20'],
      board:['#a4f0e8','#30c0c0','#20808e','#164858'],
      stripe:['#fff2c8','#ff8a3a','#c4482a','#6a2020'],
      hair:['#fff2b8','#e8c464','#a8803c','#5c4024'],
      band:['#ff9a84','#e2443a','#9a2634','#521626'],
      shell:['#fffaee','#e6dcc4','#a89c86','#605648'],
      cord:['#a8ffd8','#30d0a0','#208070','#14443e'],
      deck:['#d8b0ff','#9060d0','#5c3a96','#33205a'],
      grip:['#5a5868','#3a3846','#24222e','#141218'],
      truck:['#f0f4f8','#a8b4c4','#68748a','#363e52'],
      wheel:['#fff4c0','#f0c840','#b08028','#6a4618'],
      eye:['#f4ffd8','#b8ff5a','#5cc83a','#1e7a2a'],
      mouth:['#7c2e3e','#4c1828','#2e0c1a','#1a0610'],
      teeth:['#fbf0c0','#d8c27c','#9a8650','#5e4e30'],
      blood:['#c84a3e','#8e2a2c','#5e1824','#3a0e1a'],
      nail:['#8a7a62','#54463c','#342a28','#1c1618'],
      warn:['#fff4d0','#ffd23f','#e07a2a','#8a3418'],
    };
    if(form==='enluarado'){
      m.skin=['#dcdcff','#9ea0e2','#666aac','#3c3a76']; m.rot=['#b8a6e0','#8470b0','#56468a','#33285e'];
      m.flesh=['#f0b0ff','#b866d8','#7a3a9e','#46206a']; m.blood=['#b46ad8','#7e3ea6','#542474','#34144a'];
      m.eye=['#ffffff','#b8fbff','#4ad8f0','#1a8aa8']; m.neon=['#effffe','#7af4ff','#2ab0d8','#146a96'];
      m.board=['#ffd0f0','#e06ab8','#a03c8a','#5a2052']; m.hair=['#f4f4ff','#c4c8ec','#8a8ebc','#4e507a'];
    }
    if(form==='plenilunar'){
      m.skin=['#ffcaa6','#e2806a','#a4424e','#5e1e36']; m.rot=['#d0806a','#9a4a4a','#682a3a','#3e1628'];
      m.flesh=['#ffc07a','#f06a3a','#a8302e','#5e1422']; m.blood=['#ff7a3a','#d43a26','#8a1c22','#4e0c18'];
      m.eye=['#fffbe0','#ffe04a','#ff8a2a','#b83a14']; m.neon=['#fff6c0','#ffb43a','#e0581e','#8a2414'];
      m.board=['#8ad0ff','#3a7ad8','#2a4c98','#182a5c']; m.hair=['#ffe8c8','#f0a060','#b05a34','#5e2a20']; m.lycra=['#3e3a4c','#26222e','#18141e','#0c0a10'];
    }
    return punch(m);
  }
  const NAMES={skin:'Pele bronzeada',rot:'Podridão',flesh:'Carne',lycra:'Lycra rasgada',neon:'Faixa neon',board:'Bermuda de surf',stripe:'Listra da bermuda',hair:'Cabelo parafinado',band:'Faixa',shell:'Colar de conchas',cord:'Leash',deck:'Shape de skate',grip:'Lixa',truck:'Truck',wheel:'Rodinha',eye:'Olho',teeth:'Dentes',blood:'Sangue'};
  function sat(h,k){ const [r,g,b]=PIX.hexRgb(h), y=(r+g+b)/3; return PIX.toHex(y+(r-y)*k,y+(g-y)*k,y+(b-y)*k); }
  const NOPUNCH={eye:1,warn:1};
  function punch(m){ const o={}; for(const k in m){ const r=m[k]; o[k]=NOPUNCH[k]?[r[0],r[1],r[2],r[3]]:[sat(r[0],1.1),sat(r[1],1.18),PIX.mix(sat(r[2],1.12),'#2a1a4c',0.22),PIX.mix(r[3],'#140a24',0.36)]; } return o; }

  /* ---------- poses ---------- */
  // pernas em 3 segmentos: lFh (coxa), lFk (canela), lFm (peito do pé/calcanhar), fF (dedos). + = pra frente.
  const REST={hx:0,rot:0,lift:0,lean:8,hunch:22,head:-42,jaw:14,aFs:34,aFe:12,aBs:24,aBe:4,lFh:108,lFk:-54,lFm:46,lBh:98,lBk:-60,lBm:42,fF:0,fB:0,flash:0,shiver:0,claw:0,warn:0,dust:0,smear:0,hair:0};
  const S=Math.sin, C=Math.cos, PI=Math.PI, mx=Math.max;
  const ANIMS={
    idle:{nome:'Parado (de cócoras, balançando)',n:8,dur:()=>140,pose:i=>{ const p=i/8*PI*2, s=S(p);
      return {lFh:108+3*s, lFk:-54-3*s, lFm:46+2*s, lBh:98+3*s, lBk:-60-3*s, lBm:42+2*s, lean:8+2*s, hunch:22+2*S(p-0.5), head:-42+4*S(p-1)+(i===6?8:0), jaw:12+6*mx(0,S(2*p)),
        aFs:34+4*S(p-0.6), aFe:12+5*S(p-1), aBs:24+4*S(p-0.4), aBe:4+5*S(p-0.9), hx:0.6*S(p), hair:S(p-1)}; }},
    walk:{nome:'Andar (aos pulinhos)',n:8,mv:[0,0.2,0.6,0.9,1,0.8,0.4,0.1],dur:()=>100,pose:i=>{ const p=i/8*PI*2, up=mx(0,S(p)), dn=mx(0,-S(p));
      return {lift:7*up, lFh:108-42*up+18*dn, lFk:-54+34*up+8*dn, lFm:46-56*up-4*dn, lBh:98-46*up+18*dn, lBk:-60+34*up+8*dn, lBm:42-62*up-4*dn, fF:-20*up, fB:-24*up,
        lean:8+8*up-4*dn, hunch:22-4*up+3*dn, head:-42-6*up+4*dn, jaw:12+8*up, aFs:34-30*up+14*dn, aFe:12-10*up, aBs:24+20*up-6*dn, aBe:4+10*up, hair:-2*up+2*dn}; }},
    crouch:{nome:'Agachar (carregando o salto)',n:6,loop:true,dur:()=>90,pose:i=>{ const o=i%2?1:-1;
      return {lFh:140,lFk:-40,lFm:40,lBh:132,lBk:-46,lBm:36,lean:44,hunch:28,head:-62,jaw:20+4*(i%2),aFs:60,aFe:30,aBs:52,aBe:22,hx:-2+o*0.8,shiver:i%2,warn:1,hair:2}; }},
    attack:{nome:'Salto e bote',n:11,warn:[0,1,2,3],air:[5,6,7],land:8,hitAt:7,dur:i=>[140,140,140,160,70,110,120,110,90,150,150][i],pose:i=>[
      {lFh:124,lFk:-48,lFm:44,lBh:114,lBk:-54,lBm:40,lean:34,hunch:26,head:-52,jaw:18,aFs:48,aFe:24,aBs:40,aBe:16,warn:1},
      {lFh:138,lFk:-42,lFm:40,lBh:130,lBk:-48,lBm:36,lean:44,hunch:28,head:-62,jaw:22,aFs:60,aFe:30,aBs:52,aBe:22,hx:-2,warn:1,shiver:1},
      {lFh:142,lFk:-38,lFm:42,lBh:134,lBk:-44,lBm:38,lean:48,hunch:30,head:-64,jaw:24,aFs:-10,aFe:-20,aBs:-20,aBe:-30,hx:-3,warn:1},
      {lFh:144,lFk:-36,lFm:42,lBh:136,lBk:-42,lBm:38,lean:50,hunch:30,head:-66,jaw:28,aFs:-30,aFe:-40,aBs:-40,aBe:-50,hx:-3,warn:1,shiver:1},
      {lFh:14,lFk:-6,lFm:-30,lBh:-6,lBk:-20,lBm:-50,fF:-40,fB:-50,lean:50,hunch:8,head:-50,jaw:30,aFs:130,aFe:130,aBs:120,aBe:120,hx:6,lift:0,dust:1,smear:1,hair:-4},
      {lFh:-10,lFk:-30,lFm:-60,lBh:-20,lBk:-40,lBm:-70,fF:-60,fB:-70,lean:64,hunch:6,head:-56,jaw:40,aFs:110,aFe:110,aBs:104,aBe:104,hx:10,lift:24,claw:1,hair:-4},
      {lFh:124,lFk:-60,lFm:20,lBh:114,lBk:-70,lBm:10,lean:50,hunch:24,head:-48,jaw:50,aFs:110,aFe:96,aBs:100,aBe:88,hx:12,lift:26,claw:1,hair:-2},
      {lFh:92,lFk:-30,lFm:40,lBh:82,lBk:-40,lBm:30,fF:20,fB:10,lean:46,hunch:26,head:-40,jaw:56,aFs:96,aFe:70,aBs:88,aBe:62,hx:14,lift:12,claw:1,smear:2},
      {lFh:146,lFk:-36,lFm:44,lBh:138,lBk:-42,lBm:40,lean:56,hunch:34,head:-50,jaw:40,aFs:70,aFe:20,aBs:62,aBe:14,hx:14,dust:2,claw:1,hair:3},
      {lFh:124,lFk:-48,lFm:44,lBh:114,lBk:-54,lBm:40,lean:36,hunch:28,head:-46,jaw:24,aFs:48,aFe:20,aBs:40,aBe:12,hx:10,hair:1},
      {lFh:110,lFk:-54,lFm:46,lBh:100,lBk:-60,lBm:42,lean:8,hunch:22,head:-42,jaw:16,hx:4}][i]},
    // ---- ataques extras ----
    kick2:{nome:'Chute duplo (pernas de mola)',n:9,hit:[3,5],reach:40,dur:i=>[130,130,60,110,60,120,140,130,140][i],pose:i=>[
      {lFh:124,lFk:-48,lFm:44,lBh:114,lBk:-54,lBm:40,lean:20,hunch:26,head:-48,jaw:18,aFs:60,aFe:40,aBs:50,aBe:30},
      {lFh:150,lFk:-30,lFm:40,lBh:124,lBk:-50,lBm:40,lean:-6,hunch:18,head:-36,jaw:24,aFs:-20,aFe:-10,aBs:-30,aBe:-20,hx:-4,lift:6,shiver:1},
      {lFh:110,lFk:60,lFm:80,lBh:120,lBk:-50,lBm:40,lean:-20,hunch:14,head:-30,jaw:30,aFs:-40,aFe:-30,aBs:-50,aBe:-40,hx:2,lift:12,smear:1,hair:-3},
      {lFh:90,lFk:88,lFm:96,lBh:116,lBk:-54,lBm:38,fF:20,lean:-26,hunch:12,head:-28,jaw:36,aFs:-50,aFe:-40,aBs:-60,aBe:-50,hx:6,lift:14,dust:1,hair:-4},
      {lFh:130,lFk:-40,lFm:40,lBh:100,lBk:70,lBm:86,lean:-22,hunch:12,head:-30,jaw:34,aFs:-40,aFe:-30,aBs:-50,aBe:-40,hx:8,lift:16,smear:1},
      {lFh:134,lFk:-40,lFm:40,lBh:86,lBk:90,lBm:98,fB:20,lean:-28,hunch:10,head:-26,jaw:40,aFs:-50,aFe:-40,aBs:-60,aBe:-50,hx:10,lift:16,hair:-4},
      {lFh:130,lFk:-44,lFm:42,lBh:120,lBk:-50,lBm:40,lean:20,hunch:24,head:-46,jaw:26,aFs:40,aFe:20,aBs:30,aBe:10,hx:8,lift:4},
      {lFh:140,lFk:-38,lFm:44,lBh:132,lBk:-44,lBm:40,lean:40,hunch:30,head:-52,jaw:20,aFs:60,aFe:20,aBs:50,aBe:14,hx:6,dust:2},
      {lFh:110,lFk:-54,lFm:46,lBh:100,lBk:-60,lBm:42,lean:8,hunch:22,head:-42,jaw:16,hx:3}][i]},
    lowPounce:{nome:'Bote baixo rasteiro',n:9,hit:4,reach:30,warn:[0,1,2],dur:i=>[130,140,150,70,110,120,130,140,140][i],pose:i=>[
      {lFh:130,lFk:-44,lFm:44,lBh:120,lBk:-50,lBm:40,lean:50,hunch:28,head:-62,jaw:20,aFs:40,aFe:20,aBs:30,aBe:10,warn:1},
      {lFh:144,lFk:-36,lFm:42,lBh:136,lBk:-42,lBm:38,lean:62,hunch:30,head:-70,jaw:26,aFs:-20,aFe:-30,aBs:-30,aBe:-40,hx:-4,warn:1,shiver:1},
      {lFh:146,lFk:-34,lFm:42,lBh:138,lBk:-40,lBm:38,lean:66,hunch:30,head:-72,jaw:30,aFs:-40,aFe:-50,aBs:-50,aBe:-60,hx:-5,warn:1,shiver:1},
      {lFh:40,lFk:-30,lFm:-40,lBh:10,lBk:-40,lBm:-60,fF:-40,fB:-60,lean:84,hunch:4,head:-76,jaw:40,aFs:96,aFe:96,aBs:90,aBe:90,hx:16,lift:2,dust:1,smear:1,hair:-4},
      {lFh:20,lFk:-40,lFm:-60,lBh:0,lBk:-50,lBm:-70,fF:-60,fB:-70,lean:88,hunch:2,head:-78,jaw:6,aFs:100,aFe:90,aBs:96,aBe:86,hx:22,lift:2,claw:1,hair:-4},
      {lFh:120,lFk:-50,lFm:30,lBh:90,lBk:-60,lBm:20,lean:70,hunch:20,head:-60,jaw:30,aFs:70,aFe:30,aBs:60,aBe:24,hx:20,dust:2,claw:1},
      {lFh:140,lFk:-40,lFm:44,lBh:130,lBk:-46,lBm:40,lean:50,hunch:30,head:-52,jaw:30,aFs:60,aFe:20,aBs:52,aBe:14,hx:14},
      {lFh:124,lFk:-48,lFm:44,lBh:114,lBk:-54,lBm:40,lean:30,hunch:26,head:-46,jaw:22,aFs:44,aFe:16,aBs:36,aBe:8,hx:8},
      {lFh:110,lFk:-54,lFm:46,lBh:100,lBk:-60,lBm:42,lean:8,hunch:22,head:-42,jaw:16,hx:3}][i]},
    hurt:{nome:'Dano (cabeça)',n:4,dur:i=>[80,110,130,150][i],pose:i=>[
      {lean:-6,hunch:6,head:-70,jaw:40,aFs:-40,aFe:-20,aBs:-46,aBe:-28,hx:-8,flash:1,lFh:96,lFk:-10,lBh:84,lBk:-16,hair:4},
      {lean:0,hunch:10,head:-62,jaw:34,aFs:-30,aFe:-8,aBs:-34,aBe:-16,hx:-7,lFh:100,lFk:-14,lBh:88,lBk:-20,hair:3},
      {lean:12,hunch:16,head:-50,jaw:24,aFs:4,aFe:0,aBs:-4,aBe:-6,hx:-3,hair:1},
      {lean:8,hunch:22,head:-42,jaw:16,hx:-1}][i]},
    hurtB:{nome:'Dano (barriga)',n:4,dur:i=>[80,120,140,150][i],pose:i=>[
      {lean:50,hunch:44,head:-20,jaw:40,aFs:70,aFe:40,aBs:62,aBe:30,hx:-7,flash:1,lFh:136,lFk:-56,lFm:42,lBh:128,lBk:-62,lBm:38,hair:-3},
      {lean:46,hunch:40,head:-24,jaw:34,aFs:64,aFe:36,aBs:56,aBe:26,hx:-6,lFh:134,lFk:-54,lFm:40,lBh:126,lBk:-60,lBm:36,hair:-2},
      {lean:32,hunch:30,head:-34,jaw:22,aFs:46,aFe:20,aBs:36,aBe:12,hx:-3},
      {lean:8,hunch:22,head:-42,jaw:16,hx:-1}][i]},
    fall:{nome:'Derrubado',n:6,dur:i=>[90,90,90,110,140,260][i],pose:i=>[
      {lean:-8,hunch:6,head:-66,jaw:44,aFs:-50,aFe:-30,aBs:-56,aBe:-40,hx:-6,flash:1,lFh:90,lFk:-6,lBh:80,lBk:-12,hair:4},
      {rot:-34,lean:0,hunch:8,head:-50,jaw:40,aFs:-90,aFe:-70,aBs:-100,aBe:-80,hx:-4,lFh:120,lFk:24,lFm:4,lBh:100,lBk:14,lBm:4,hair:4},
      {rot:-66,lean:4,hunch:10,head:-30,jaw:36,aFs:-130,aFe:-120,aBs:-60,aBe:-40,hx:-2,lFh:130,lFk:34,lFm:14,lBh:110,lBk:24,lBm:14,hair:2},
      {rot:-90,lean:6,hunch:12,head:-14,jaw:40,aFs:-160,aFe:-174,aBs:-20,aBe:-6,hx:4,lFh:150,lFk:-26,lFm:24,lBh:130,lBk:-16,lBm:14},
      {rot:-86,lean:4,hunch:14,head:-20,jaw:32,aFs:-160,aFe:-176,aBs:-16,aBe:-2,hx:4,lFh:144,lFk:-16,lFm:34,lBh:126,lBk:-10,lBm:24},
      {rot:-90,lean:4,hunch:12,head:-16,jaw:36,aFs:-162,aFe:-178,aBs:-18,aBe:-4,hx:4,lFh:140,lFk:-12,lFm:28,lBh:124,lBk:-6,lBm:18}][i]},
    getup:{nome:'Levantar (mola)',n:6,dur:i=>[200,150,130,110,150,150][i],pose:i=>[
      {rot:-90,lean:4,hunch:12,head:-16,jaw:36,aFs:-162,aFe:-178,aBs:-18,aBe:-4,hx:4,lFh:140,lFk:-12,lFm:28,lBh:124,lBk:-6,lBm:18},
      {rot:-70,lean:10,hunch:20,head:-36,jaw:26,aFs:-60,aFe:-20,aBs:-70,aBe:-30,hx:-4,lFh:190,lFk:-46,lFm:34,lBh:180,lBk:-56,lBm:24},
      {rot:-34,lean:30,hunch:28,head:-50,jaw:22,aFs:-10,aFe:10,aBs:-20,aBe:0,hx:-4,lFh:170,lFk:-76,lFm:44,lBh:160,lBk:-82,lBm:44},
      {lean:46,hunch:30,head:-60,jaw:22,aFs:60,aFe:30,aBs:50,aBe:20,hx:-2,lFh:148,lFk:-66,lFm:46,lBh:140,lBk:-70,lBm:42},
      {lean:30,hunch:24,head:-46,jaw:18,aFs:44,aFe:20,aBs:34,aBe:12,lFh:126,lFk:-40,lFm:36,lBh:114,lBk:-44,lBm:32},
      {lean:8,hunch:22,head:-42,jaw:14}][i]},
    death:{nome:'Morte (pernas desmontam)',n:8,dur:i=>[90,140,140,130,140,140,160,600][i],pose:i=>[
      {lean:-6,hunch:6,head:-70,jaw:46,aFs:-44,aFe:-24,aBs:-50,aBe:-30,hx:-6,flash:1,lFh:96,lFk:-10,lBh:84,lBk:-16,hair:4},
      {lean:-10,hunch:4,head:-76,jaw:54,aFs:-80,aFe:-100,aBs:-86,aBe:-104,hx:-6,lFh:70,lFk:4,lFm:4,lBh:60,lBk:0,lBm:0,lift:4,hair:5},
      {lean:20,hunch:20,head:-40,jaw:50,aFs:20,aFe:10,aBs:10,aBe:0,hx:-4,lFh:136,lFk:-56,lFm:44,lBh:128,lBk:-62,lBm:40,hair:2},
      {lean:40,hunch:34,head:-20,jaw:46,aFs:40,aFe:20,aBs:30,aBe:10,hx:-2,lFh:158,lFk:-86,lFm:64,lBh:150,lBk:-90,lBm:60,hair:-2},
      {rot:30,lean:40,hunch:34,head:-20,jaw:44,aFs:70,aFe:60,aBs:60,aBe:50,hx:0,lFh:160,lFk:-96,lFm:74,lBh:152,lBk:-98,lBm:70},
      {rot:64,lean:30,hunch:26,head:-16,jaw:42,aFs:120,aFe:130,aBs:100,aBe:110,hx:2,lFh:170,lFk:-106,lFm:64,lBh:160,lBk:-104,lBm:60},
      {rot:88,lean:10,hunch:16,head:-6,jaw:40,aFs:160,aFe:172,aBs:120,aBe:150,hx:4,lFh:180,lFk:-116,lFm:54,lBh:168,lBk:-112,lBm:50},
      {rot:90,lean:6,hunch:14,head:-2,jaw:42,aFs:164,aFe:178,aBs:124,aBe:154,hx:4,lFh:182,lFk:-120,lFm:50,lBh:170,lBk:-114,lBm:46}][i]},
  };
  const EXK=['hx','lean','hunch','head','aFs','aFe','aBs','aBe','lFh','lFk','lFm','lBh','lBk','lBm'];
  function exag(P,f){ if(f===1||Math.abs(P.rot)>4) return P; EXK.forEach(k=>{ P[k]=REST[k]+(P[k]-REST[k])*f; }); P.jaw=Math.min(62,REST.jaw+(P.jaw-REST.jaw)*f); return P; }
  const EXF={idle:1.1,walk:1.1,crouch:1.08,attack:1.12,kick2:1.1,lowPounce:1.1,hurt:1.25,hurtB:1.2,fall:1.05,getup:1.05,death:1.08};
  ZREACT.add(ANIMS,REST,{moves:{flipKick:["flip","Mortal com chute"]}}); // reações (voando, agarrado) + golpe extra — art-src/shared/zreact.js
  function poseOf(anim,i){ return exag(Object.assign({},REST,ANIMS[anim].pose(i)),EXF[anim]||1); }
  function heavyOutline(cv){ const g=cv.getContext('2d'), W=cv.width, H=cv.height, im=PIX.pix(cv), d=im.data;
    const isO=i=>d[i+3]===255&&d[i]===0x17&&d[i+1]===0x0b&&d[i+2]===0x1c, fill=i=>d[i+3]===255&&!isO(i);
    const add=[]; for(let y=2;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(d[i+3]) continue; const u=((y-1)*W+x)*4, u2=((y-2)*W+x)*4; if(isO(u)&&fill(u2)) add.push(i); }
    add.forEach(i=>{ d[i]=0x17; d[i+1]=0x0b; d[i+2]=0x1c; d[i+3]=255; }); g.putImageData(im,0,0); }

  /* ---------- esqueleto ---------- */
  const LO={h:0,k:0,m:0};
  const SPINE=38, TH=30, SH=36, MT=24, UA=17, FA=16, VS=1.04, US=1, HB=10, HS=1.4;
  const lp=(p,a,L)=>({x:p.x+Math.sin(rad(a))*L, y:p.y+Math.cos(rad(a))*L});
  function build(P,dy){
    const R=P.rot, hip={x:AX+P.hx+(P.shiver?0.8:0), y:dy};
    const ra=rad(R), rc=Math.cos(ra), rs=Math.sin(ra);
    const HR=(lx,ly)=>({x:hip.x+lx*rc-ly*rs, y:hip.y+lx*rs+ly*rc});
    const hipF=HR(2.4,0), hipB=HR(-2.4,0);
    // dobra de gafanhoto: joelho sobe acima do quadril, calcanhar alto atrás
    const kneeF=lp(hipF,P.lFh+LO.h-R,TH), ankleF=lp(kneeF,P.lFk+LO.k-R,SH), ballF=lp(ankleF,P.lFm+LO.m-R,MT);
    const kneeB=lp(hipB,P.lBh+LO.h-R,TH), ankleB=lp(kneeB,P.lBk+LO.k-R,SH), ballB=lp(ankleB,P.lBm+LO.m-R,MT);
    const SS=[]; let x=hip.x, y=hip.y;
    for(let k=0;k<=SPINE;k++){ const t=k/SPINE, a=rad(R+P.lean+(P.hunch+HB)*Math.pow(t,1.3)); SS.push({x,y,a}); x+=Math.sin(a); y-=Math.cos(a); }
    const SP=(u,v)=>{ const f=Math.max(0,-v), k=Math.min(SPINE,Math.floor(f)), s=SS[k], r=f-k, a=s.a;
      const px=s.x+Math.sin(a)*r, py=s.y-Math.cos(a)*r; return {x:px+Math.cos(a)*u, y:py+Math.sin(a)*u}; };
    const T=(u,v)=>SP(u*US,v*VS);
    const top=SS[SPINE], sa=top.a, neck=T(2,-37);
    const shF=T(3,-31), shB=T(-3.4,-32);
    const ha=sa+rad(P.head-HB*0.8), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:neck.x+(lx*hc-ly*hs)*HS, y:neck.y+(lx*hs+ly*hc)*HS});
    const elF=lp(shF,P.aFs-R,UA), wrF=lp(elF,P.aFe-R,FA), elB=lp(shB,P.aBs-R,UA), wrB=lp(elB,P.aBe-R,FA);
    const toe=(b,f)=>{ const t=rad(f+R); return {x:b.x+Math.cos(t)*12, y:b.y+Math.sin(t)*12+2}; };
    const hand=(e,w)=>{ const L=Math.hypot(w.x-e.x,w.y-e.y)||1; return {x:w.x+(w.x-e.x)/L*13,y:w.y+(w.y-e.y)/L*13}; };
    const hull=[[ballF,3.4],[ballB,3.4],[toe(ballF,P.fF),1.6],[toe(ballB,P.fB),1.6],[ankleF,4],[ankleB,4],[kneeF,6],[kneeB,6],[hip,9],[T(0,-16),10],[T(-2,-30),10],[H(1,-11),12],[hand(elF,wrF),8],[hand(elB,wrB),8],[{x:ankleF.x-14,y:ankleF.y+5},2],[elF,4],[elB,4],[T(-15,-30),6],[(()=>{ const a=T(-5,-2), b=T(-20,-16); return {x:a.x+(b.x-a.x)*1.35,y:a.y+(b.y-a.y)*1.35}; })(),5],[H(-14,2),4],[H(-12,6),4]];
    return {R,ra,hip,hipF,hipB,kneeF,ankleF,ballF,kneeB,ankleB,ballB,SP,T,sa,neck,shF,shB,elF,wrF,elB,wrB,ha,H,hull};
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
    const k2a=wa*0.33, k2b=wb*0.33; p.F(R[3]); p.cap({x:a.x+nx*k2a,y:a.y+ny*k2a},{x:b.x+nx*k2b,y:b.y+ny*k2b},wa*0.3,wb*0.3);
    if(o.hi!==false){ const e=lerp(a,b,o.hl!=null?o.hl:0.7), ha=wa*0.22, hb=wb*0.22; p.F(R[0]); p.cap({x:a.x-nx*ha,y:a.y-ny*ha},{x:e.x-nx*hb,y:e.y-ny*hb},wa*0.18,wb*0.16); }
    return {nx,ny};
  }
  function clip(c,pts,fn){ c.save(); c.beginPath(); pts.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])); c.closePath(); c.clip(); fn(); c.restore(); }
  const W=(sk,list)=>list.map(([u,v])=>{ const q=sk.T(u,v); return [q.x,q.y]; });
  const Wp=(sk,u,v)=>sk.T(u,v);

  /* ---------- braço comprido, mão de garra ---------- */
  function drawArm(c,u,M,sk,P,front){
    const p=mkPen(c,u), sh=front?sk.shF:sk.shB, el=front?sk.elF:sk.elB, wr=front?sk.wrF:sk.wrB; p.id();
    limb(p,M.skin,sh,el,10.4,8.8,{});
    const n=limb(p,M.skin,el,wr,9.2,7.6,{});
    p.F(M.skin[0]); p.circle(lerp(el,wr,0.05),1.2);
    p.F(M.skin[3]); const v0=lerp(el,wr,0.2), v1=lerp(el,wr,0.8); p.cap({x:v0.x-n.nx*1.2,y:v0.y-n.ny*1.2},{x:v1.x-n.nx*0.4,y:v1.y-n.ny*0.4},0.7,0.6);
    p.F(M.rot[1]); const r1=lerp(sh,el,0.55); p.ell(r1.x-n.nx*1.2,r1.y-n.ny*1.2,2,1.4); p.F(M.rot[2]); p.rect(r1.x-n.nx*1.2-0.5,r1.y-n.ny*1.2-0.5,1,1);
    // tatuagem tribal desbotada no ombro e pulseira de couro
    p.F(M.skin[3]); const t=lerp(sh,el,0.25); p.cap({x:t.x-n.nx*3,y:t.y-n.ny*3},{x:t.x+n.nx*1,y:t.y+n.ny*1+1.6},0.9,0.7); p.cap({x:t.x-n.nx*2,y:t.y-n.ny*2+2},{x:t.x+n.nx*2,y:t.y+n.ny*2+3},0.8,0.6);
    if(front){ const b=lerp(el,wr,0.86); p.F(M.deck[2]); p.cap({x:b.x-n.nx*4,y:b.y-n.ny*4},{x:b.x+n.nx*4,y:b.y+n.ny*4},2,2); p.F(M.deck[0]); p.rect(b.x-n.nx*2-0.5,b.y-n.ny*2-0.5,1,1);
      p.F(M.flesh[2]); const w=lerp(el,wr,0.45); p.ell(w.x+n.nx*1.4,w.y+n.ny*1.4,2,1.3,Math.atan2(wr.y-el.y,wr.x-el.x)); p.F(M.flesh[1]); p.rect(w.x+n.nx*1.4-0.5,w.y+n.ny*1.4-0.5,1,1); }
    // cava da lycra
    p.F(M.lycra[1]); p.cap({x:sh.x-3,y:sh.y-3.6},{x:sh.x+3,y:sh.y-3.2},3.4,3); p.F(M.neon[1]); p.cap({x:sh.x-3,y:sh.y-2},{x:sh.x+3,y:sh.y-1.6},0.9,0.9);
    drawHand(p,c,M,el,wr,P);
  }
  function drawHand(p,c,M,el,wr,P){
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y); c.scale(1.5,1.5);
    const cl=P.claw;
    p.F(M.skin[1]); p.poly([[-1,-3],[4.6,-3.6],[5.8,-0.6],[5.4,3.2],[-1,3.2]]);
    p.F(M.skin[2]); p.poly([[-1,1.2],[5.6,1],[5.4,3.2],[-1,3.2]]);
    p.F(M.skin[0]); p.rect(0.4,-2.8,3.4,0.9);
    for(let k=0;k<4;k++){
      const y0=-2.6+k*1.8, L1=3.8-(k===3?1:0), L2=3.4-(k===3?0.8:0), sp=cl?(k-1.5)*0.5:0;
      const a1={x:5.2,y:y0}, b1={x:5.2+L1,y:y0-0.6+sp}, c1={x:b1.x+L2*(cl?0.9:0.5),y:b1.y-(cl?0.4:1.8)+sp*1.4};
      p.F(M.skin[1]); p.cap(a1,b1,1.9,1.7); p.cap(b1,c1,1.7,1.3);
      p.F(M.skin[2]); p.rect(a1.x+0.4,y0+0.4,L1-1,0.6);
      p.F(M.nail[0]); p.poly([[c1.x-0.6,c1.y-0.7],[c1.x+2.2,c1.y-(cl?0.4:1.6)],[c1.x+0.2,c1.y+0.7]]);
    }
    p.F(M.skin[1]); p.cap(P2(1.8,-2.8),P2(4.6,-5.6),1.8,1.4); p.F(M.nail[0]); p.poly([[4.2,-6],[6.4,-7.2],[5,-5]]);
    p.id();
  }

  /* ---------- perna de gafanhoto: coxa na bermuda, canela fina, calcanhar alto, dedos longos ---------- */
  function drawLeg(c,u,M,sk,P,front){
    const p=mkPen(c,u), hip=front?sk.hipF:sk.hipB, knee=front?sk.kneeF:sk.kneeB, ank=front?sk.ankleF:sk.ankleB, ball=front?sk.ballF:sk.ballB; p.id();
    // peito do pé (metatarso) + calcanhar
    limb(p,M.skin,ank,ball,6.6,5.4,{hl:0.4});
    // canela fina e comprida
    const n=limb(p,M.skin,knee,ank,8.4,6.4,{hl:0.45});
    p.F(M.skin[0]); p.cap({x:knee.x-n.nx*2,y:knee.y-n.ny*2},lerp({x:knee.x-n.nx*1.6,y:knee.y-n.ny*1.6},ank,0.5),1,0.8); // canela ossuda
    p.F(M.rot[1]); const r=lerp(knee,ank,0.55); p.ell(r.x+n.nx*1,r.y+n.ny*1,1.6,2.4,Math.atan2(ank.y-knee.y,ank.x-knee.x));
    p.F(M.rot[2]); p.circle({x:r.x+n.nx*1.4,y:r.y+n.ny*1.4+1},0.7);
    p.F(M.skin[3]); p.circle(ank,1.6); p.F(M.skin[1]); p.circle({x:ank.x-n.nx*0.8,y:ank.y-n.ny*0.8},1.2);
    if(front){
      // leash: tira de velcro no tornozelo e cordinha enrolada
      const a2=lerp(ank,ball,0.18), mn=sideN(ank,ball);
      p.F(M.lycra[1]); p.cap({x:a2.x-mn.nx*3.6,y:a2.y-mn.ny*3.6},{x:a2.x+mn.nx*3.6,y:a2.y+mn.ny*3.6},3.4,3.4);
      p.F(M.cord[1]); p.cap({x:a2.x-mn.nx*3.6,y:a2.y-mn.ny*3.6},{x:a2.x+mn.nx*3.6,y:a2.y+mn.ny*3.6},1,1);
      const L=[a2,{x:a2.x-7,y:a2.y+3},{x:a2.x-11,y:a2.y-2},{x:a2.x-15,y:a2.y+4},{x:a2.x-18,y:a2.y+1}];
      p.F(M.cord[2]); for(let k=0;k<L.length-1;k++) p.cap(L[k],L[k+1],1.1,1);
      p.F(M.cord[0]); p.cap(L[1],L[2],0.5,0.5);
      p.F(M.truck[1]); p.rect(L[4].x-1.4,L[4].y-1,2.4,2);
      p.F(M.blood[2]); const b=lerp(knee,ank,0.75); p.rect(b.x-n.nx*1.4,b.y-1,1,2.6);
    }
    // bermuda de surf comprida até o joelho, com listra lateral e cordão
    const kb=lerp(hip,knee,1.02);
    limb(p,M.board,hip,kb,13.4,12,{hl:0.55});
    const kn=sideN(hip,knee), dir={x:(knee.x-hip.x)/kn.L,y:(knee.y-hip.y)/kn.L};
    p.F(M.stripe[1]); p.cap(lerp(hip,kb,0.05),lerp(hip,kb,0.95),2,1.8); p.F(M.stripe[0]); p.cap(lerp(hip,kb,0.1),lerp(hip,kb,0.6),0.7,0.6);
    p.F(M.board[3]); p.cap({x:kb.x-kn.nx*5.6,y:kb.y-kn.ny*5.6},{x:kb.x+kn.nx*5.6,y:kb.y+kn.ny*5.6},1.2,1.2);
    // barra rasgada
    p.F(M.board[2]); for(let k=-2;k<=2;k++){ const b={x:kb.x+kn.nx*k*2.2,y:kb.y+kn.ny*k*2.2}; const L=k%2?2.6:1.4; p.poly([[b.x-kn.nx*1,b.y-kn.ny*1],[b.x+kn.nx*1,b.y+kn.ny*1],[b.x+dir.x*L,b.y+dir.y*L]]); }
    p.F(M.board[0]); const f3=lerp(hip,kb,0.32); p.cap({x:f3.x-kn.nx*3.4,y:f3.y-kn.ny*3.4},{x:f3.x-kn.nx*1.4+dir.x*3,y:f3.y-kn.ny*1.4+dir.y*3},0.9,0.8);
    if(front){ const t=lerp(hip,kb,0.6); p.F(M.board[3]); p.ell(t.x+kn.nx*2.4,t.y+kn.ny*2.4,2.2,1.4,Math.atan2(dir.y,dir.x)); p.F(M.skin[2]); p.ell(t.x+kn.nx*2.4,t.y+kn.ny*2.4,1.4,0.8,Math.atan2(dir.y,dir.x)); }
    // joelho saliente
    p.F(M.skin[1]); p.circle({x:knee.x+dir.x*1.6,y:knee.y+dir.y*1.6},3.6); p.F(M.skin[0]); p.circle({x:knee.x+dir.x*1.6-kn.nx*1.4,y:knee.y+dir.y*1.6-kn.ny*1.4},1.4);
    // pé descalço de dedos longos (apoiado na ponta)
    const fa=rad((front?P.fF:P.fB)+sk.R); p.xf(fa,ball.x,ball.y); c.scale(1.3,1.3);
    p.F(M.skin[1]); p.poly([[-3,-2.4],[2,-2.4],[6,-0.6],[9.6,0.4],[10,2.2],[-3.4,2.2]]);
    p.F(M.skin[2]); p.poly([[-3.4,0.8],[3,1],[10,1.4],[10,2.2],[-3.4,2.2]]);
    p.F(M.skin[0]); p.rect(-1.6,-2,3,0.8);
    [[6.4,0.2],[8,0.6],[9.6,1]].forEach(([x,y])=>{ p.F(M.skin[3]); p.rect(x-0.4,y-0.6,0.5,2); p.F(M.nail[1]); p.rect(x+0.2,y-0.2,0.8,0.7); });
    p.id();
  }

  /* ---------- meio shape de skate enfiado no cós (atrás) ---------- */
  function drawDeck(c,u,M,sk,P){
    const p=mkPen(c,u); p.id(); const a=Wp(sk,-5,-2), b=Wp(sk,-20,-16); const ang=Math.atan2(b.y-a.y,b.x-a.x);
    p.xf(ang,a.x,a.y);
    p.F(M.deck[1]); p.poly([[0,-3.6],[24,-3.8],[27,-2],[27.6,0],[27,2],[24,3.8],[14,3.8],[12,2.2],[9,4.2],[6,2],[3,3.8],[0,3.6]]);
    p.F(M.grip[1]); p.poly([[0,-3.6],[24,-3.8],[26,-2.6],[26.4,-1.6],[0,-1.4]]);
    p.F(M.deck[2]); p.poly([[0,1.6],[27.4,1],[27,2],[24,3.8],[14,3.8],[12,2.2],[9,4.2],[6,2],[3,3.8],[0,3.6]]);
    p.F(M.board[1]); p.poly([[8,-1],[16,-1.4],[17,0.6],[9,1]]); p.F(M.stripe[1]); p.rect(12,-1.2,1.6,2);
    p.F(M.deck[0]); p.rect(2,-1.2,20,0.7);
    // truck e rodinha
    p.F(M.truck[2]); p.rect(18,-6.6,4,3); p.F(M.truck[1]); p.rect(18.4,-6.6,3,1);
    p.F(M.wheel[2]); p.circle(P2(20,-8),2.6); p.F(M.wheel[1]); p.circle(P2(19.6,-8.4),1.8); p.F(M.wheel[0]); p.rect(19,-9.4,1,1);
    p.id();
  }

  /* ---------- tronco magro: lycra rasgada, costelas, colar ---------- */
  const SIL=[[-6.4,3],[-7.4,-6],[-8,-16],[-8.4,-25],[-7.8,-31],[-5.4,-35.6],[-1,-37.4],[3.6,-37],[7,-34],[8.4,-28],[8,-21],[6.4,-14],[6,-8],[6.8,-2],[7,3]];
  function drawTorso(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    // cós da bermuda + cordão
    p.F(M.board[1]); p.poly(W(sk,[[-7,-3.6],[7.4,-3.6],[7.6,5],[-7.2,5]]));
    p.F(M.board[2]); p.poly(W(sk,[[-7.2,0],[7.6,0],[7.6,5],[-7.2,5]])); p.F(M.board[3]); p.poly(W(sk,[[-7,-3.6],[7.4,-3.6],[7.4,-2.6],[-7,-2.6]]));
    p.F(M.shell[1]); p.poly(W(sk,[[5,-3],[6,-3],[7.4,2.6],[6.6,3]])); p.poly(W(sk,[[5.6,-3],[6.4,-3],[5,2.4],[4.4,2]]));
    const sil=W(sk,SIL);
    p.F(M.lycra[1]); p.poly(sil);
    clip(c,sil,()=>{ p.F(M.lycra[2]); p.poly(W(sk,[[-12,6],[-12,-42],[-1,-42],[0,-32],[1.6,-22],[2.6,-12],[4,6]]));
      p.F(M.lycra[3]); p.poly(W(sk,[[-12,6],[-12,-42],[-4.6,-42],[-5,-30],[-4,-16],[-2,6]]));
      p.F(M.lycra[0]); p.poly(W(sk,[[2,-37],[7,-34],[8.4,-28],[6.4,-28],[3,-33]]));
      // faixas neon diagonais
      p.F(M.neon[1]); p.poly(W(sk,[[-10,-24],[10,-31],[10,-28.4],[-10,-21.4]])); p.F(M.neon[2]); p.poly(W(sk,[[-10,-21.4],[10,-28.4],[10,-27.6],[-10,-20.6]]));
      p.F(M.neon[1]); p.poly(W(sk,[[-10,-15],[10,-21],[10,-20],[-10,-14]]));
      p.F(M.neon[3]); p.poly(W(sk,[[-12,-24],[-6,-26],[-6.4,-16],[-12,-14]]));
    });
    // rasgos: pele, costelas, carne
    p.F(M.lycra[3]); p.poly(W(sk,[[1.6,-18],[6.4,-19.6],[6.6,-9],[4,-6.6],[1.4,-9]]));
    p.F(M.skin[2]); p.poly(W(sk,[[2.2,-17.4],[6,-18.8],[6,-9.6],[4,-7.6],[2,-9.6]]));
    p.F(M.skin[0]); [[-16.6],[-14],[-11.4]].forEach(([v])=>p.poly(W(sk,[[2.4,v+0.6],[5.8,v-0.4],[5.8,v+0.4],[2.6,v+1.4]])));
    p.F(M.skin[3]); [[-15.4],[-12.8]].forEach(([v])=>p.poly(W(sk,[[2.4,v+0.4],[5.8,v-0.6],[5.8,v],[2.6,v+0.9]])));
    p.F(M.lycra[3]); p.poly(W(sk,[[-7.6,-30],[-3,-31],[-2.6,-25],[-5,-23],[-7.8,-25]]));
    p.F(M.flesh[3]); p.poly(W(sk,[[-7,-29.4],[-3.6,-30.2],[-3.2,-25.4],[-5,-23.8],[-7.2,-25.4]]));
    p.F(M.flesh[1]); p.poly(W(sk,[[-6.4,-28.6],[-4,-29.2],[-3.8,-26],[-5.2,-24.8],[-6.4,-26]]));
    p.F(M.bone[1]); p.poly(W(sk,[[-6.6,-27.4],[-3.8,-27.8],[-3.8,-27],[-6.6,-26.6]]));
    p.F(M.blood[1]); p.poly(W(sk,[[-5,-23.8],[-4.2,-24],[-4.4,-20],[-4.8,-19.8]]));
    // colar de conchas
    [[-1,-36.6],[1,-36],[3,-35],[4.8,-33.8],[6.4,-32.2]].forEach(([x,y],k)=>{ const q=Wp(sk,x,y); p.F(M.shell[2]); p.circle(q,1.1); p.F(M.shell[0]); p.rect(q.x-0.5,q.y-0.7,0.9,0.8); });
    // sangue escorrido no peito
    p.F(M.blood[2]); p.poly(W(sk,[[6.4,-34],[8,-30],[7.6,-25],[6.8,-27],[6.4,-23],[5.8,-29]]));
    if(form==='plenilunar'){ p.F(M.bone[1]); [[-8,-28,-13.6,-32],[-8.4,-20,-14.4,-20],[-7.6,-12,-12.6,-9]].forEach(([u0,v0,u1,v1])=>{ const a=Wp(sk,u0,v0+1.6), b=Wp(sk,u1,v1), d=Wp(sk,u0+0.6,v0-1.6); p.poly([[a.x,a.y],[b.x,b.y],[d.x,d.y]]); }); }
    if(form!=='comum'){ p.F(M.neon[0]); [[[2.6,-16],[5,-12],[4.4,-11.6],[2.2,-15.4]]].forEach(f=>p.poly(W(sk,f))); }
  }

  /* ---------- cabeça: rosto magro, cabelo parafinado comprido, faixa ---------- */
  function drawHairBack(c,u,M,sk,P){
    const p=mkPen(c,u); p.xf(sk.ha,sk.neck.x,sk.neck.y); c.scale(HS,HS);
    const sw=P.hair||0;
    // mechas compridas (dreads) caindo pra trás
    const lock=(x0,y0,x1,y1,w,t)=>{ p.F(M.hair[t]); p.cap(P2(x0,y0),P2(x1,y1),w,w*0.7); };
    lock(-4,-18,-15+sw,-4,4,2); lock(-2,-20,-14+sw*1.2,0,3.6,1); lock(-5,-14,-12+sw*0.8,6,3.4,2); lock(0,-21,-11+sw,4,3,1); lock(-6,-10,-9+sw*0.6,8,3,3);
    p.F(M.hair[0]); p.cap(P2(-3,-19),P2(-10+sw,-6),0.8,0.6);
    p.F(M.band[2]); p.rect(-14+sw*1.2,0,3,1.6); p.rect(-12+sw*0.8,5,3,1.6);
    p.id();
  }
  function drawHead(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.xf(sk.ha,sk.neck.x,sk.neck.y); c.scale(HS,HS);
    // pescoço magro
    p.F(M.skin[1]); p.poly([[-4.4,7],[2.4,7],[3,-2],[2.4,-7],[-3.6,-8]]);
    p.F(M.skin[2]); p.poly([[-4.4,7],[-1.6,7],[-1.4,-7.6],[-3.6,-8]]);
    p.F(M.skin[3]); p.rect(0.6,-4,0.7,9);
    // crânio e rosto encovado
    p.F(M.skin[1]); p.ell(1.6,-13.6,8,8.2); p.poly([[-4,-8],[11.8,-9.6],[12.6,-6],[4,-3],[-2,-4]]);
    p.F(M.skin[2]); p.poly([[-6.4,-16],[-5,-8],[-1.4,-4],[4,-3.4],[0,-7],[-2.4,-11],[-3.4,-16]]);
    p.F(M.skin[3]); p.poly([[2.4,-9],[7.6,-10],[7,-7.4],[3,-7]]);
    p.F(M.skin[0]); p.poly([[4.4,-11.6],[9,-12],[8.4,-10.8],[4.8,-10.6]]);
    // nariz descascando de sol
    p.F(M.skin[1]); p.poly([[11.2,-13],[14.6,-9.6],[13.4,-8.4],[11.2,-9]]); p.F(M.flesh[1]); p.rect(12.6,-11.6,1.4,1.2); p.F(M.skin[3]); p.rect(12.8,-9,1.2,0.8);
    // olhos fundos que brilham
    p.F(M.skin[3]); p.ell(8,-13.6,3,2.4);
    p.F(M.eye[2]); p.ell(8.4,-13.6,2,1.6); p.F(M.eye[1]); p.ell(8.6,-13.8,1.3,1); p.F(M.eye[0]); p.rect(8.4,-14.4,0.9,0.8);
    p.F(M.skin[3]); p.ell(12.2,-13.6,1,1.4); p.F(M.eye[1]); p.rect(11.9,-14,0.9,1.1);
    p.F(M.skin[3]); p.poly([[4.6,-16.6],[11.6,-16],[11.6,-15.2],[5,-15.6]]);
    // boca: lábio de cima, dentes
    p.F(M.mouth[1]); p.poly([[4.4,-6.6],[12.4,-7.2],[12.6,-4.6],[4.6,-4.2]]);
    p.F(M.teeth[1]); [[6.2,-7],[7.8,-7.1],[9.4,-7.2],[11,-7.2]].forEach(([x,y],k)=>p.rect(x,y,1.2,k%2?1.4:2));
    // podridão e queimadura de sol
    p.F(M.rot[1]); p.ell(-0.6,-10,2,1.4); p.F(M.rot[2]); p.rect(-1,-10.4,1,1); p.F(M.flesh[2]); p.ell(4,-18,1.6,1);
    // orelha com brinco
    p.F(M.skin[1]); p.ell(-2.6,-11.6,2,3); p.F(M.skin[3]); p.ell(-2.4,-11.4,0.9,1.8); p.F(M.shell[1]); p.circle(P2(-2.6,-8),0.9);
    // cabelo de cima (franja desgrenhada) + faixa
    p.F(M.hair[1]); p.poly([[-6.6,-15],[-5,-21],[0,-23.2],[6,-22.6],[10.4,-19.6],[11.2,-17],[8.6,-18],[7,-16.4],[4.6,-18],[2,-16.6],[0,-18],[-3,-15],[-4.4,-11]]);
    p.F(M.hair[2]); p.poly([[-6.6,-15],[-5.6,-19],[-3,-17],[-4.4,-11]]); p.poly([[7,-16.4],[8.6,-18],[9.4,-15.4]]);
    p.F(M.hair[0]); p.poly([[0,-22.6],[5,-22.2],[7.4,-20.8],[3,-21]]);
    p.F(M.band[1]); p.poly([[-6,-17.4],[2,-21.2],[9.6,-19.6],[9.8,-18],[2,-19.4],[-5.4,-15.6]]);
    p.F(M.band[0]); p.poly([[0,-20.6],[6,-20.4],[6,-19.8],[0,-20]]);
    p.F(M.band[2]); p.poly([[-6,-17.4],[-10,-16],[-11,-13],[-9.6,-13.4],[-8.4,-15.6],[-5.4,-15.6]]);
    if(form!=='comum'){ p.F(M.eye[0]); p.rect(8,-14.4,1.4,1.2); }
    p.id();
  }
  function drawJaw(c,u,M,sk,P){
    const p=mkPen(c,u), h=sk.H(1.6,-5); p.xf(sk.ha+rad(P.jaw),h.x,h.y); c.scale(HS,HS);
    const L=11.6;
    p.F(M.skin[1]); p.poly([[-1.6,-0.8],[L,0],[L+0.8,2],[L-0.6,4.6],[6,5.6],[0,5],[-2.4,2.4]]);
    p.F(M.skin[2]); p.poly([[-2.4,2.4],[0,5],[6,5.6],[L-0.6,4.6],[L-2,4],[3,4],[0,2.6]]);
    p.F(M.mouth[1]); p.poly([[2.6,-0.6],[L-0.4,0],[L-1,1.4],[3,1.2]]);
    p.F(M.teeth[1]); [[4,-1],[5.6,-1],[7.2,-1],[8.8,-1]].forEach(([x,y],k)=>p.rect(x,y,1.2,k%2?1.4:1.8));
    p.F(M.skin[0]); p.rect(5,1.8,4,0.8);
    // barbicha rala
    p.F(M.hair[2]); p.poly([[6,5.2],[10,4.6],[9,6.4],[7,6.6]]);
    const L2=1.6+(P.jaw>30?2.4:0);
    p.F(M.blood[1]); p.poly([[L-1.6,3.6],[L,3.2],[L-0.4,3.6+L2],[L-1,4.4+L2]]);
    p.id();
  }

  /* ---------- FX: aviso no chão (anel), poeira, smear ---------- */
  function drawFx(c,u,M,sk,P){
    const p=mkPen(c,u); p.id();
    if(P.dust){ const big=P.dust===2, cx=sk.hip.x+(big?6:-6), y=GROUND-1;
      [[-18,-3,4],[-11,-6,5],[-3,-4,4.4],[8,-5,4.6],[15,-3,3.6]].forEach(([x,yy,r],k)=>{ if(!big&&x>6) return; const q={x:cx+x*(big?1.3:1),y:y+yy}; p.F(M.skin[2]); p.circle(q,r+0.8); p.F(M.skin[1]); p.circle({x:q.x-0.6,y:q.y-0.6},r); p.F(M.skin[0]); p.rect(q.x-r*0.4,q.y-r*0.6,1,1); }); }
    if(P.smear){ const s=P.smear===2;
      [[sk.shF,sk.wrF],[sk.shB,sk.wrB]].forEach(([sh,w],k)=>{ const r=Math.hypot(w.x-sh.x,w.y-sh.y)+8, a1=Math.atan2(w.y-sh.y,w.x-sh.x), a0=a1-(s?1.5:1.2), n=10, pts=[];
        for(let i=0;i<=n;i++){ const a=a0+(a1-a0)*i/n; pts.push([sh.x+Math.cos(a)*r,sh.y+Math.sin(a)*r]); }
        for(let i=n;i>=0;i--){ const a=a0+(a1-a0)*i/n, rr=r-2-6*(i/n); pts.push([sh.x+Math.cos(a)*rr,sh.y+Math.sin(a)*rr]); }
        p.F(k?M.skin[1]:M.skin[0]); p.poly(pts); });
      if(!s){ p.F(M.skin[0]); [[-12,20],[-18,26],[-8,30]].forEach(([x,y])=>p.rect(sk.hip.x+x,sk.hip.y+y,6,1)); } }
  }
  function drawWarn(c,u,M,sk,P,fi){
    // marca de aviso no chão à frente (onde ele vai cair): elipse tracejada pulsando
    const p=mkPen(c,u); p.id(); const cx=Math.min(FW-26,sk.hip.x+64), cy=GROUND-2, a=fi%2?1:0.86;
    for(let k=0;k<12;k++){ if(k%2) continue; const t0=k/12*PI*2, t1=(k+1)/12*PI*2, pts=[];
      for(let i=0;i<=4;i++){ const t=t0+(t1-t0)*i/4; pts.push([cx+Math.cos(t)*22*a,cy+Math.sin(t)*5*a]); }
      for(let i=4;i>=0;i--){ const t=t0+(t1-t0)*i/4; pts.push([cx+Math.cos(t)*19*a,cy+Math.sin(t)*3.6*a]); }
      p.F(M.warn[1]); p.poly(pts); }
    p.F(M.warn[0]); p.rect(cx-1,cy-1,2,2);
  }

  /* ---------- montagem ---------- */
  const cache=PIX.cache();
  function frame(form,anim,fi,step=5,Pov,pk){
    const K=PIX.getK(), key=(pk!=null?'#'+pk+'|'+form:form+'|'+anim+'|'+fi+'|'+step)+'@'+K;
    const hit=cache.get(key); if(hit){ cache.delete(key); cache.set(key,hit); return hit; }
    const P=Pov?Object.assign({},REST,Pov):poseOf(anim,fi), M=mats(form), sk=skeleton(P), f=fi|0;
    const parts=[];
    if(P.warn) parts.push({noShade:true, noRim:true, smear:true, draw:(c,u)=>drawWarn(c,u,M,sk,P,f)});
    parts.push(
      {back:true, draw:(c,u)=>drawArm(c,u,M,sk,P,false)},
      {back:true, draw:(c,u)=>drawLeg(c,u,M,sk,P,false)},
      {draw:(c,u)=>drawHairBack(c,u,M,sk,P)},
      {draw:(c,u)=>drawDeck(c,u,M,sk,P)},
      {draw:(c,u)=>drawTorso(c,u,M,sk,P,form)},
      {draw:(c,u)=>drawHead(c,u,M,sk,P,form)},
      {draw:(c,u)=>drawJaw(c,u,M,sk,P)},
      {draw:(c,u)=>drawLeg(c,u,M,sk,P,true)},
    );
    if(P.smear||P.dust) parts.push({noShade:true, noRim:true, smear:true, draw:(c,u)=>drawFx(c,u,M,sk,P)});
    parts.push({draw:(c,u)=>drawArm(c,u,M,sk,P,true)});
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM[form]}); if(step>=4) heavyOutline(cv);
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._eye=sc(sk.H(8.4,-13.6)); cv._eye2=sc(sk.H(12.2,-13.6)); cv._mouth=sc(sk.H(10,-4)); cv._hand=sc(sk.wrF); cv._head=sc(sk.H(2,-13));
    cache.set(key,cv); if(cache.size>900) cache.delete(cache.keys().next().value);
    return cv;
  }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame,framePose:function(form,anim,P,key){ return frame(form,anim,0,5,P,key); }};
})();
