/* TAMANDUA — fonte de arte (editável). Build: npm run art
   Mini boss do Pantanal "O Tamanduá-Bandeira" (Myrmecophaga tridactyla) tomado pela Lua de Sangue, 2ª arena da cordilheira.
   Quadrúpede próprio (sem rig humanoide): coluna com tilt/arco (até ~75 graus quando se ergue nas patas traseiras e na cauda),
   4 patas com IK de 2 ossos (dianteiras: ombro, cotovelo, pulso e a mão fechada sobre os nós dos dedos; traseiras: quadril,
   joelho, jarrete e pé plantígrado), pescoço grosso que afina num focinho tubular longo, cauda-bandeira em 9 gomos com
   pelo longo pendurado (gravidade), língua que sai da ponta do focinho.
   Anatomia das fotos: cabeça pequena e comprida com olho e orelha minúsculos, faixa diagonal preta da garganta até o meio
   do dorso com borda branca por cima, antebraços claros com anel preto no pulso, mão preta com a garra central em foice
   dobrada pra dentro (anda sobre os nós), metade de trás mais escura e marrom, crina de pelo duro no dorso, cauda enorme.
   Corrupção da Lua de Sangue: pelo caído com carne e costelas no flanco, vértebras furando o dorso, placas de fungo-lunar
   roxo nas costas, cupinzeiro grudado no focinho, língua com larvas, olhos vermelhos de lua.
   Fúria: pelo carbonizado, faixa preta rasgada, fungo incandescente, língua luminosa ciano e olhos laranja.
   Formas: normal / furia (e comum / enluarado / plenilunar, por compatibilidade com arena comum).
   Adereços: xLingua (ponta da língua com larvas, 4 quadros) e xPoeira (nuvem de poeira, 3 quadros). */
const TAMANDUA=(function(){
  const {rad,lp,lerp,P2}=PIX;
  const K_=BOSSKIT, {S,C,PI,mass,platePoly,clipPoly,band,bandA,limb,rnd,stain,dust,puffs,bez}=K_;
  const FW=360, FH=280, GROUND=270, AX=178, SC=1, DY=1.15;
  const RIM={normal:'#dccfff', furia:'#ffb890', comum:'#dccfff', enluarado:'#a8eaff', plenilunar:'#ffb890'};
  const isFur=f=>f==='furia'||f==='plenilunar';

  function mats0(form){
    const m={
      fur:['#f2d8b4','#b89272','#6c5262','#30203a'],
      furD:['#b08868','#6e4e40','#463040','#1e1224'],
      leg:['#fff2d4','#f2d29c','#c4928e','#643a74'],
      blk:['#605868','#302a38','#19141f','#0a0810'],
      brd:['#ffffff','#fbf6e6','#cfc4cc','#7e7090'],
      tail:['#967058','#5c4234','#3c2a38','#1a0e1e'],
      skin:['#cfc4b6','#928778','#5a5466','#2a2638'],
      nose:['#6c6474','#3a3442','#1e1a26','#0c0a10'],
      claw:['#fffbf0','#eadfc6','#a89880','#3e3236'],
      rot:['#d2dac6','#9eab98','#626e74','#343a50'],
      flesh:['#f47c84','#b42e4a','#6c1436','#34081c'],
      bone:['#fffcf0','#e8dec6','#aa9e8e','#5a5266'],
      fung:['#f6d8ff','#c678f2','#7c38b2','#3a1860'],
      tongue:['#ffb0c8','#d4507c','#86244a','#3e0e24'],
      larva:['#fffde8','#eedca2','#b09c6c','#5c4c3a'],
      mound:['#efbe86','#b67c4a','#764a32','#3c2420'],
      mouth:['#e8707a','#a02c3e','#5c1224','#2a0812'],
      blood:['#9c3a46','#6e2234','#461424','#280a14'],
      acid:['#e0a6ff','#b060e8','#6a2aa0','#2e1050'],
      eye:['#ffffff','#ffd4cc','#ff3438','#a00e1e'],
      glow:['#ffffff','#f0c8ff','#b864f4','#5a2090'],
      fx:['#ffffff','#fff0e0','#ffb4cc','#c8508a'],
      wave:['#ffffff','#f0e4ff','#c0a0ff','#6a4ac8'],
      steam:['#f4f0ff','#c8c0dc','#8a84a8','#4c4866'],
      dust:['#eadecd','#c6b6a0','#968671','#605448'],
    };
    if(isFur(form)){
      m.fur=['#b4a490','#70625a','#40323e','#1c1222'];
      m.furD=['#7e6656','#4e3c36','#2e2028','#140c14'];
      m.tail=['#6e5a4c','#443632','#281c26','#120a12'];
      m.leg=['#f4e4d0','#cbb4a0','#8e7488','#4c3a5a'];
      m.tongue=['#f0ffff','#72ecff','#2a9cd4','#104a7c'];
      m.eye=['#ffffff','#ffeab4','#ff9a2a','#b04a10'];
      m.glow=['#ffffff','#ffd0ff','#ff6af0','#a01ca0'];
      m.fung=['#ffe8ff','#ff8cf4','#c440d8','#5c1890'];
      m.fx=['#ffffff','#ffe6c8','#ff9a5a','#c8302a'];
      m.wave=['#ffffff','#ffe8d8','#ffa070','#c04a3a'];
    }
    if(form==='enluarado'){
      m.fur=['#d0d4dc','#8e92a4','#565874','#262840'];
      m.eye=['#ffffff','#e4f8ff','#7ad4ff','#2a5ae0'];
      m.tongue=['#e8f0ff','#9aa8ff','#5a5ad0','#28206a'];
    }
    return K_.finish(m,['fx','wave','eye','dust','steam','glow']);
  }
  const NAMES={fur:'Pelagem cinza',furD:'Pelo escuro (anca)',leg:'Antebraço claro',blk:'Faixa preta',brd:'Borda branca',tail:'Cauda-bandeira',skin:'Focinho',
    nose:'Ponta do focinho',claw:'Garras',rot:'Pele podre',flesh:'Carne exposta',bone:'Osso',fung:'Fungo-lunar',tongue:'Língua',larva:'Larvas',mound:'Cupinzeiro',
    mouth:'Boca',blood:'Sangue',acid:'Seiva lunar',eye:'Olho de lua',glow:'Brilho do fungo',fx:'Rastro',wave:'Onda do rugido',steam:'Bafo',dust:'Poeira'};

  /* ---------------- poses ----------------
     hx: desloca o bicho · by: altura do quadril (− senta) · tilt: inclinação da coluna (+ frente pra cima; ~72 = de pé) ·
     arch: arco do dorso · stretch · sag: barriga · nk/nkL: ângulo (lp) e tamanho do pescoço · hd: giro da cabeça (+ focinho pra baixo) ·
     sniff: ponta do focinho fareja · roar: boca aberta/rugido · ffx/ffy … hbx/hby: alvo das patas (frente-perto, frente-longe,
     trás-perto, trás-longe) · claw: garras abertas (0 = dobradas, anda nos nós) · tu/tcurl/tw/tph/tfan: cauda (tfront: na frente
     do corpo) · tg: língua pra fora (0–1) · smear/impact/dust/ring/shake: FX · ign: fungo incandescente (fúria) · dead: olhos apagam */
  const REST={hx:0,by:0,tilt:0,arch:0,stretch:1,sag:0,nk:86,nkL:1,hd:30,sniff:0,roar:0,ear:0,
    ffx:0,ffy:0,fbx:0,fby:0,hfx:0,hfy:0,hbx:0,hby:0,fwa:198,hka:206,claw:0,
    tu:0,tcurl:22,tw:0.3,tph:0,tfan:1,tfront:0,tg:0,
    smear:0,impact:0,dust:0,ring:0,shake:0,ign:1,glow:0,dead:0,moss:0,flash:0};
  function gait(u,A,h,duty=0.64){ u=((u%1)+1)%1; if(u<duty){ const s=u/duty; return [A*(1-2*s),0]; }
    const s=(u-duty)/(1-duty), e=0.5-0.5*C(PI*s); return [-A+2*A*e,h*S(PI*s)]; }
  function walkP(ph,A,h){ const a=gait(ph,A,h), b=gait(ph+0.25,A,h), c=gait(ph+0.5,A,h), d=gait(ph+0.75,A,h);
    return {hbx:a[0],hby:a[1],fbx:b[0],fby:b[1],hfx:c[0],hfy:c[1],ffx:d[0],ffy:d[1]}; }
  // erguer-se nas patas traseiras e na cauda (u 0..1); arm 0 = braços juntos, 1 = abertos (aviso do abraço)
  function rear(u,arm,o){ const a=arm==null?1:arm;
    return Object.assign({tilt:56*u,by:-30*u,hx:-10*u,sag:-3*u,hfx:20*u,hbx:14*u,hka:206-46*u,nk:86+40*u,hd:30-46*u,claw:Math.min(1,u*1.2),
      tu:0,tcurl:22-30*u,tw:0.15,
      ffx:u*(14+10*a),ffy:u*(120+24*a),fbx:u*(2-60*a),fby:u*(126+30*a)},o||{}); }
  const LIE={by:-58,tilt:-4,sag:-8,nk:76,nkL:0.92,hd:16,ffx:54,ffy:2,fbx:40,fby:2,hfx:-30,hfy:2,hka:120,hbx:-40,hby:2,fwa:176,
    tu:-128,tcurl:-70,tw:0,tfront:1,tfan:0.8,claw:0.6};
  const LIEP=o=>Object.assign({},LIE,o);
  const STANDTOP=()=>rear(1,1,{roar:1,ring:0});

  const ANIMS={
    idle:{nome:'Parado (fareja com o focinho, cauda balança)',n:8,dur:()=>150,pose:i=>{ const p=i/8*PI*2;
      return {by:0.8*S(p),sag:1+1.4*S(p+0.8),hd:30+7*S(p*2),nk:86+3*S(p),sniff:S(p*4),tph:p,tw:0.4,arch:0.6*S(p),ffx:1,hbx:-1}; }},
    walk:{nome:'Andar (sobre os nós dos dedos, balança, peso)',n:8,stomp:[2,6],dur:()=>130,pose:i=>{ const ph=i/8;
      return Object.assign(walkP(ph,15,9),{by:-1.8*Math.abs(S(PI*2*ph)),tilt:1.4*S(PI*4*ph),hd:30+4*S(PI*4*ph+1),nk:84,sniff:0.5*S(PI*8*ph),tph:PI*2*ph,tw:0.5,arch:1.2*S(PI*4*ph+0.5)}); }},
    stand:{nome:'Levanta (ergue o tronco na cauda e abre os braços: AVISO do abraço)',n:8,warn:[0,1,2,3,4,5,6],dur:i=>[80,80,90,90,90,90,90,90][i],pose:i=>{
      const u=[0.08,0.24,0.42,0.6,0.78,0.92,1,1][i], a=[0,0,0.2,0.45,0.7,0.9,1,1][i];
      return rear(u,a,{roar:i>=5?1:0,ring:i===6?0.5:0,shake:i===7?1:0,tph:i}); }},
    hug:{nome:'Abraço com garras (desce sobre o alvo e aperta)',n:12,warn:[0,1,2,3,4,5],grab:6,tick:[8,10],dur:i=>[60,60,60,60,60,60,270,270,270,270,270,270][i],pose:i=>{
      if(i<6){ const u=i/5; return rear(1,1-u,{tilt:56-12*u,hx:-10+30*u,by:-30+12*u,nk:126-6*u,hd:-16+30*u,roar:1,ffx:24+16*u,ffy:144-70*u,fbx:-58+92*u,fby:156-78*u,smear:i>=3?1:0}); }
      const sq=(i-6)%2;
      return rear(1,0,{tilt:46+(sq?3:-2),hx:20+(sq?1.5:-1.5),by:-18,nk:122,hd:16+(sq?6:0),roar:i<11?1:0.4,ffx:40,ffy:74+(sq?-4:3),fbx:34,fby:78+(sq?3:-4),claw:1,shake:i<11?(sq?1:-1):0,impact:i===6?1:0}); }},
    open:{nome:'Aberto (de pé, ofegante: ventre exposto, FRAQUEZA)',n:8,dur:()=>150,pose:i=>{ const p=i/8*PI*2;
      return rear(1,0.35,{tilt:52+3*S(p),by:-28,nk:124+6*S(p),hd:-8+8*S(p+1),roar:0.6+0.4*S(p*2),claw:0.4,ffy:120+8*S(p),fby:126+8*S(p+0.6),ffx:10,fbx:-10,tph:p,sag:2}); }},
    claw:{nome:'Garra em arco (ergue o braço e varre em arco)',n:10,warn:[0,1,2,3],hit:[4,5],reach:100,dur:i=>[120,120,110,100,60,60,120,140,150,150][i],pose:i=>[
      {tilt:8,by:-4,hx:-4,ffx:-6,ffy:30,claw:0.5,hd:20,nk:96,roar:0.5},
      {tilt:20,by:-10,hx:-8,ffx:-24,ffy:90,claw:1,hd:6,nk:116,roar:1,hfx:6,hbx:4},
      {tilt:28,by:-14,hx:-10,ffx:-40,ffy:128,claw:1,hd:-4,nk:126,roar:1,hfx:10,hbx:6,tu:6},
      {tilt:30,by:-15,hx:-11,ffx:-46,ffy:136,claw:1,hd:-8,nk:130,roar:1,hfx:10,hbx:6,tu:6,shake:1},
      {tilt:20,by:-10,hx:6,ffx:56,ffy:96,claw:1,hd:6,nk:116,roar:1,smear:1,hfx:10,hbx:6},
      {tilt:6,by:-8,hx:14,ffx:84,ffy:14,claw:1,hd:24,nk:100,roar:1,smear:2,hfx:12,hbx:8,impact:0.6},
      {tilt:2,by:-8,hx:14,ffx:80,ffy:4,claw:1,hd:28,nk:96,roar:0.6,hfx:12,hbx:8},
      {tilt:2,by:-5,hx:10,ffx:50,ffy:2,claw:0.6,hd:28,nk:92,hfx:8,hbx:6},
      {tilt:1,by:-2,hx:4,ffx:20,claw:0.3,hd:30,nk:88,hfx:3,hbx:2},
      {}][i]},
    tongue:{nome:'Língua (recua a cabeça e dispara a língua; puxa)',n:10,warn:[0,1,2,3],hit:4,pull:[5,6,7,8],dur:i=>[100,100,100,100,60,110,110,110,110,140][i],pose:i=>[
      {nk:80,hd:20,sniff:1,by:-2},
      {nk:70,hd:4,hx:-4,by:-4,tilt:2},
      {nk:66,hd:-4,hx:-7,by:-5,tilt:3,roar:0.4},
      {nk:64,hd:-8,hx:-8,by:-6,tilt:4,roar:0.6,shake:1},
      {nk:96,hd:12,hx:6,by:-4,tilt:-2,tg:1,roar:1,smear:1},
      {nk:94,hd:12,hx:6,by:-4,tilt:-2,tg:1,roar:1},
      {nk:90,hd:10,hx:3,by:-4,tilt:-1,tg:0.8,roar:1,shake:1},
      {nk:86,hd:10,hx:0,by:-4,tg:0.6,roar:1,shake:-1},
      {nk:84,hd:14,hx:-2,by:-3,tg:0.4,roar:1},
      {nk:86,hd:24,by:-1,tg:0.1}][i]},
    slam:{nome:'Cauda (gira e bate a cauda no chão atrás; só fúria)',n:9,warn:[0,1,2,3],hit:4,dur:i=>[125,125,125,125,60,140,140,140,150][i],pose:i=>[
      {tilt:-2,hd:36,nk:80,tu:-30,tcurl:0,tw:0.2},
      {tilt:-5,hd:42,nk:76,tu:-70,tcurl:-30,tw:0.2,by:-3,hfx:-4,ffx:6},
      {tilt:-8,hd:46,nk:74,tu:-100,tcurl:-50,tw:0.1,by:-5,hfx:-6,ffx:10,roar:1},
      {tilt:-9,hd:48,nk:72,tu:-110,tcurl:-56,tw:0.1,by:-6,hfx:-6,ffx:10,roar:1,shake:1},
      {tilt:4,hd:24,nk:90,tu:40,tcurl:40,tw:0,by:-8,hfx:4,ffx:4,roar:1,impact:1,smear:3,tfan:1.1},
      {tilt:3,hd:26,nk:88,tu:44,tcurl:40,tw:0,by:-6,impact:0.6,tfan:1.1},
      {tilt:1,hd:28,nk:86,tu:24,tcurl:30,by:-3},
      {hd:30,tu:8,tcurl:24,by:-1},
      {}][i]},
    dazed:{nome:'Tonto (cai de quatro, cabeça pesa, cauda mole)',n:8,loop:1.5,dur:()=>180,pose:i=>{ const p=i/8*PI*2;
      return {by:-12+2*S(p*2),hx:3*S(p),tilt:-3+3*S(p),nk:72+6*S(p+1),hd:44+10*S(p),tw:0.05,tcurl:40,tph:p,tfan:0.85,ffx:6+3*S(p),fbx:-4,hfx:-2,hbx:2,sag:3,claw:0.3}; }},
    rage:{nome:'Fúria (ruge de pé, o fungo das costas incandesce)',n:8,dur:i=>[170,150,150,180,200,200,200,180][i],pose:i=>[
      {by:-10,tilt:-4,nk:76,hd:40,ign:0,claw:0.4},
      {by:-12,tilt:-6,nk:72,hd:46,ign:0.2,shake:1},
      rear(0.6,0.5,{ign:0.5,roar:1}),
      rear(1,1,{ign:0.8,roar:1,ring:0.6}),
      rear(1,1,{ign:1.1,roar:1,ring:1.2,shake:1}),
      rear(1,1,{ign:1.2,roar:1,ring:1.8,shake:-1}),
      rear(0.5,0.4,{ign:1.1,roar:0.6}),
      {ign:1}][i]},
    hurt:{nome:'Dano',n:4,dur:i=>[80,110,130,160][i],pose:i=>[
      {flash:1,hx:-8,tilt:8,hd:10,nk:100,roar:1,tw:1},
      {hx:-6,tilt:5,hd:18,nk:94,roar:0.6,tw:0.8},
      {hx:-2,tilt:2,hd:26,roar:0.2},
      {}][i]},
    hurtB:{nome:'Dano (encolhe)',n:4,dur:i=>[80,110,130,160][i],pose:i=>[
      {flash:1,hx:-4,by:-8,tilt:-6,hd:50,nk:72,roar:1,tw:1},
      {hx:-3,by:-6,tilt:-4,hd:44,nk:76,roar:0.6},
      {hx:-1,by:-2,hd:34},
      {}][i]},
    intro:{nome:'Entrada (WARNING): sai do capão, cheira o ar, levanta-se e ruge',n:12,dur:i=>[120,120,120,120,180,200,200,90,90,260,280,220][i],pose:i=>{
      if(i<4){ const ph=i/4; return Object.assign(walkP(ph,15,9),{hx:-56+i*14,by:-1.6*Math.abs(S(PI*2*ph)),hd:34,nk:84,tph:i,tw:0.5,sniff:0.6}); }
      return [
        {nk:110,hd:-6,sniff:1,by:2,tph:4},
        {nk:118,hd:-14,sniff:-1,by:3,tph:5,tilt:4},
        {nk:118,hd:-12,sniff:1,by:3,tph:6,tilt:4},
        rear(0.45,0.3,{roar:0.4}),
        rear(0.85,0.8,{roar:1}),
        rear(1,1,{roar:1,ring:0.8,shake:1,ign:1}),
        rear(1,1,{roar:1,ring:1.6,shake:-1}),
        rear(0.3,0.2,{roar:0.3})][i-4]; }},
    fall:{nome:'Derrubado (tomba de lado)',n:6,dur:i=>[90,120,120,160,200,200][i],pose:i=>[
      {flash:1,hx:-6,tilt:8,hd:10,nk:100,roar:1},
      {hx:-4,by:-24,tilt:4,hd:30,nk:86,roar:0.6,ffx:12,hfx:-8,tu:-40,tcurl:-40},
      LIEP({by:-46,impact:0.4}),
      LIEP({impact:1,dust:1}),
      LIEP({}),
      LIEP({hd:20})][i]},
    getup:{nome:'Levanta',n:6,dur:i=>[140,140,140,140,140,150][i],pose:i=>[
      LIEP({hd:18}),
      LIEP({by:-46,nk:80,hd:24,tu:-60,tcurl:-80,tfront:0}),
      {by:-30,tilt:-6,nk:80,hd:34,ffx:16,fbx:10,hfx:-8,hbx:-10,tu:-30,tcurl:-20},
      {by:-18,tilt:-4,nk:82,hd:32,ffx:8,hfx:-4},
      {by:-6,tilt:-1,nk:84,hd:30},
      {}][i]},
    death:{nome:'Morte longa (tomba de lado, a cauda cobre o corpo, língua pra fora, olhos apagam)',n:12,dur:i=>[90,140,160,160,180,200,240,280,320,360,420,700][i],pose:i=>{
      if(i>=5) return LIEP({tg:[0.5,0.7,0.8,0.85,0.85,0.85,0.85][i-5],dead:[0,0.1,0.3,0.5,0.7,0.9,1][i-5],moss:[0,0.1,0.25,0.45,0.65,0.85,1][i-5],impact:i===5?1:0,dust:i===5?1:0,hd:16+Math.min(6,i-5)});
      return [
        {flash:1,hx:-8,tilt:10,hd:6,nk:104,roar:1,tw:1},
        rear(0.7,0.6,{roar:1,ring:0.6,hx:-14}),
        rear(0.45,0.2,{roar:0.6,hx:-12,hd:10}),
        {hx:-6,by:-28,tilt:-2,nk:80,hd:26,roar:0.4,ffx:20,fbx:8,hfx:-14,hka:180,tu:-50,tcurl:-60},
        {by:-46,tilt:-3,nk:78,hd:20,roar:0.3,ffx:40,fbx:26,hfx:-24,hka:140,sag:-4,tu:-80,tcurl:-120,tfront:1}][i]; }},
    tumble:{nome:'Rolando (arremessado)',n:4,dur:()=>90,pose:i=>LIEP({tilt:[-10,20,-20,8][i],by:-40,tu:-60+i*30,tcurl:-60,tfront:0,hd:[10,40,20,30][i]})},
    grabbed:{nome:'Agarrado (esperneia)',n:4,dur:()=>120,pose:i=>({by:-10,tilt:[6,-4,8,-6][i],hd:[10,40,16,44][i],nk:92,ffy:[20,6,26,4][i],fby:[6,22,4,24][i],roar:1,claw:1,tw:1,tph:i*1.6})},
    xLingua:{nome:'Ponta da língua com larvas',n:4,prop:true,dur:()=>90,pose:i=>({st:i})},
    xPoeira:{nome:'Nuvem de poeira',n:3,prop:true,dur:()=>110,pose:i=>({st:i})},
  };

  /* ---------------- esqueleto quadrúpede ---------------- */
  const HS=1.18, SP=88, NK=28, U1=34, U2=32, T1=33, T2=31, MT=20, WR=13;
  function ik2(A,B,L1,L2,sg){ const dx=B.x-A.x, dy=B.y-A.y, d0=Math.hypot(dx,dy)||1e-3, d=Math.max(Math.abs(L1-L2)+0.5,Math.min(L1+L2-0.3,d0));
    const base=Math.atan2(dy,dx), a=Math.acos(Math.max(-1,Math.min(1,(L1*L1+d*d-L2*L2)/(2*L1*d))));
    return {J:{x:A.x+C(base+sg*a)*L1,y:A.y+S(base+sg*a)*L1}, E:{x:A.x+C(base)*d,y:A.y+S(base)*d}}; }
  function skeleton(P){
    const t=rad(P.tilt), dv={x:C(t),y:-S(t)}, nv={x:S(t),y:C(t)}, L=SP*P.stretch;
    const H={x:AX-40+P.hx+P.shake*1.2, y:GROUND-78-P.by};
    const ar=(lx,ly)=>ly-P.arch*S(PI*Math.max(0,Math.min(1,lx/L)));
    const T=(lx,ly)=>{ const y=ar(lx,ly); return {x:H.x+dv.x*lx+nv.x*y, y:H.y+dv.y*lx+nv.y*y}; };
    const Sh=T(L,6), ShB=T(L-8,4), HB=T(-8,-2);
    const front=(Sx,x0,dx,lift)=>{ const Pc={x:AX+x0+P.hx+dx,y:GROUND-lift}, W0=lp(Pc,P.fwa,WR), r=ik2(Sx,W0,U1,U2,1), off={x:r.E.x-W0.x,y:r.E.y-W0.y};
      return {S:Sx,E:r.J,W:r.E,Pc:{x:Pc.x+off.x,y:Pc.y+off.y}}; };
    const hind=(Hx,x0,dx,lift)=>{ const Pc={x:AX+x0+P.hx+dx,y:GROUND-lift}, K0=lp(Pc,P.hka,MT), r=ik2(Hx,K0,T1,T2,-1), off={x:r.E.x-K0.x,y:r.E.y-K0.y};
      return {S:Hx,E:r.J,W:r.E,Pc:{x:Pc.x+off.x,y:Pc.y+off.y}}; };
    const ff=front(Sh,58,P.ffx,P.ffy), fb=front(ShB,46,P.fbx,P.fby);
    const hf=hind(H,-44,P.hfx,P.hfy), hb=hind(HB,-56,P.hbx,P.hby);
    const NB=T(L+8,-14), HJ=lp(NB,P.nk,NK*P.nkL), ha=rad(P.hd);
    const Hd=(lx,ly)=>({x:HJ.x+(lx*C(ha)-ly*S(ha))*HS, y:HJ.y+(lx*S(ha)+ly*C(ha))*HS});
    const TB=T(-27,-16);
    return {H,L,t,T,ar,Sh,ShB,HB,ff,fb,hf,hb,NB,HJ,ha,Hd,TB,P};
  }

  /* ---------------- utilidades ---------------- */
  // tufos de pelo numa borda (normal pra fora do lado esquerdo do percurso)
  function tufts(p,R,pts,len,seed,back=0.3){ for(let k=0;k<pts.length-1;k++){ const a=pts[k], b=pts[k+1], dx=b[0]-a[0], dy=b[1]-a[1], L=Math.hypot(dx,dy)||1, nx=dy/L, ny=-dx/L, m=[(a[0]+b[0])/2,(a[1]+b[1])/2], l=len*(0.6+0.7*rnd(seed,k));
    p.F(R); p.poly([[a[0]+dx*0.1,a[1]+dy*0.1],[m[0]+nx*l-dx*back,m[1]+ny*l-dy*back],[b[0]-dx*0.1,b[1]-dy*0.1]]); } }
  // mechas de pelo (traços curtos em pares sombra/luz), orientadas pra trás e pra baixo
  function strands(p,D,Lt,x0,y0,x1,y1,step,len,ang,seed){
    const ca=C(ang), sa=S(ang); let s=0;
    for(let y=y0;y<y1;y+=step) for(let x=x0;x<x1;x+=step){ s++; const r=rnd(seed+s,1); if(r>0.55) continue;
      const xx=x+(rnd(seed+s,2)-0.5)*step*0.8+((Math.round(y/step))&1)*step*0.5, yy=y+(rnd(seed+s,3)-0.5)*step*0.6, l=len*(0.7+0.6*rnd(seed+s,4));
      p.F(D); p.cap(P2(xx,yy),P2(xx+ca*l,yy+sa*l),1.1,0.5);
      if(Lt&&r<0.22){ p.F(Lt); p.cap(P2(xx-0.6,yy-1),P2(xx-0.6+ca*l*0.7,yy-1+sa*l*0.7),0.9,0.4); } } }
  // placa de fungo-lunar (aglomerado de chapéus redondos)
  function fungus(p,M,x,y,s,seed,glow){ const F=glow>0.4?M.glow:M.fung;
    for(let k=0;k<6;k++){ const a=rnd(seed,k)*PI*2, d=rnd(seed,k+6)*5.4*s, cx=x+C(a)*d, cy=y+S(a)*d*0.6-1, r=(1.8+rnd(seed,k+12)*1.9)*s;
      p.F(F[3]); p.circle(P2(cx+0.5,cy+0.8),r); p.F(F[2]); p.circle(P2(cx,cy),r); p.F(F[1]); p.circle(P2(cx-r*0.25,cy-r*0.3),r*0.62); p.F(F[0]); p.rect(cx-r*0.5,cy-r*0.6,1,1); } }
  // garra em foice: base a, controle b, ponta c (afinando)
  function sickle(p,R,a,b,c,w){ const pts=bez(a,b,c,8);
    for(let k=0;k<8;k++){ const u=k/8, w0=w*(1-u*0.85), w1=w*(1-(u+1/8)*0.85); p.F(R[2]); p.cap(pts[k],pts[k+1],w0,w1); }
    for(let k=0;k<6;k++){ const u=k/8, w0=w*0.45*(1-u), w1=w*0.45*(1-u-1/8); p.F(R[0]); p.cap(P2(pts[k].x-0.4,pts[k].y-0.5),P2(pts[k+1].x-0.4,pts[k+1].y-0.5),Math.max(0.5,w0),Math.max(0.4,w1)); }
    p.F(R[3]); p.circle(pts[8],Math.max(0.6,w*0.18)); }

  // segmento de membro (do osso: origem 0 até L), largura w0 na raiz e w1 na ponta, barriga embaixo
  function seg(L,w0,w1,bk=1){ const o=[], n=8;
    for(let i=0;i<=n;i++){ const u=i/n, w=(w0+(w1-w0)*u)*(1+0.1*S(PI*u)); o.push([L*u,-w]); }
    for(let i=1;i<6;i++){ const a=-PI/2+i/6*PI; o.push([L+C(a)*w1*0.9,S(a)*w1]); }
    for(let i=n;i>=0;i--){ const u=i/n, w=(w0+(w1-w0)*u)*(1+0.18*S(PI*u)*bk); o.push([L*u,w]); }
    for(let i=1;i<6;i++){ const a=PI/2+i/6*PI; o.push([C(a)*w0*0.85,S(a)*w0]); }
    return o; }
  // mecha de pelo pendurada (a: raiz, b: ponta), curva pro lado bend
  function lock(p,body,shade,hi,a,b,w,bend){
    const c=P2((a.x+b.x)/2+bend,(a.y+b.y)/2), pts=bez(a,c,b,8), Lp=[], Rp=[];
    for(let k=0;k<=8;k++){ const u=k/8, q=pts[k], q0=pts[Math.max(0,k-1)], q1=pts[Math.min(8,k+1)], d=Math.hypot(q1.x-q0.x,q1.y-q0.y)||1, nx=-(q1.y-q0.y)/d, ny=(q1.x-q0.x)/d, hw=w*Math.pow(1-u,0.75)+0.3;
      Lp.push([q.x+nx*hw,q.y+ny*hw]); Rp.push([q.x-nx*hw,q.y-ny*hw]); }
    const poly=Lp.concat(Rp.slice().reverse());
    p.F(shade); p.poly(poly.map(q=>[q[0]+1.6,q[1]+1.2]));
    p.F(body); p.poly(poly);
    p.F(hi); p.poly(Rp.slice(0,4).concat(pts.slice(0,4).reverse().map(q=>[q.x,q.y])));
  }

  /* ---------------- tronco ---------------- */
  function torsoPts(L,P){ const sg=P.sag;
    return [[-31,-2],[-28,-18],[-17,-29],[0,-31],[L*0.35,-31],[L*0.62,-29],[L*0.86,-31],[L+6,-30],[L+18,-22],[L+25,-6],[L+23,12],[L+13,30],[L-6,37],[L*0.66,37+sg*0.5],[L*0.4,34+sg],[L*0.18,29+sg*0.5],[0,27],[-16,21],[-27,10]]; }
  function drawTorso(p,M,sk,P,form){
    const L=sk.L, A=-sk.t, fur=isFur(form);
    p.xf(A,sk.H.x,sk.H.y); K_.st.CTX.scale(1,DY);
    const ar=q=>[q[0],sk.ar(q[0],q[1])], pts=torsoPts(L,P).map(ar);
    platePoly(p,M.fur,pts,A,1);
    clipPoly(pts,()=>{
      // metade de trás escura e marrom (anca)
      mass(p,M.furD,-14,-2,34,34,A,0.8);
      mass(p,M.furD,-6,-6,22,22,A,0.9);
      mass(p,M.fur,L*0.62,-10,30,20,A,1);
      // sombra fria embaixo (ventre)
      p.F(M.fur[2]); p.poly([[L*0.3,22],[L*0.6,25],[L+30,19],[L+30,50],[L*0.3,50]].map(ar));
      p.F(M.furDQ[2]); p.poly([[-40,12],[L*0.1,15],[L*0.3,16],[L*0.3,50],[-40,50]].map(ar));
      p.F(M.furD[3]); p.poly([[-40,22],[L*0.25,27+P.sag*0.5],[L*0.55,32+P.sag],[L+30,30],[L+30,50],[-40,50]].map(ar));
      // dorso iluminado
      p.F(M.fur[0]); p.poly([[-20,-27],[0,-30],[L*0.3,-30],[L*0.3,-26.4],[0,-26.4],[-18,-23.4]].map(ar));
      p.F(M.fur[0]); p.poly([[L*0.36,-30],[L*0.62,-28],[L*0.86,-30],[L+6,-29],[L+12,-25],[L*0.86,-26],[L*0.62,-24.6],[L*0.38,-26.6]].map(ar));
      // flanco atrás do ombro: degradê pra sombra fria embaixo
      p.F(M.fur[2]); p.poly([[L*0.3,19],[L*0.7,22],[L+30,19],[L+30,50],[L*0.3,50]].map(ar)); p.F(M.fur[3]); p.poly([[L*0.3,26+P.sag*0.5],[L*0.7,28+P.sag*0.5],[L+30,24],[L+30,50],[L*0.3,50]].map(ar));
      if(fur){ p.F(M.fur[3]); [[L*0.62,-22,7,4],[L*0.9,-10,6,5],[-4,-20,8,5],[L*0.2,8,7,4]].forEach(([x,y,rx,ry])=>{ const q=ar([x,y]); p.ell(q[0],q[1],rx,ry,0.3); }); p.F(M.fire?M.fire[2]:M.glow[3]); [[L*0.62,-22],[L*0.9,-10],[-4,-20]].forEach(([x,y])=>{ const q=ar([x,y]); p.rect(q[0]-1,q[1],2,1); }); }
      tufts(p,M.fur[1],[[L*0.3,12],[L*0.5,14],[L*0.7,16],[L+10,20]].map(ar),3.4,51,0.5);
      // mechas de pelo
      strands(p,M.furD[1],M.fur[0],-28,-22,L*0.4,10,6.5,6,rad(112),3);
      strands(p,M.furDQ[2],null,-28,10,L*0.4,30,6.5,6,rad(104),5);
      strands(p,M.fur[2],M.fur[0],L*0.4,-24,L+20,18,6.5,6,rad(116),9);
      strands(p,M.fur[3],M.fur[1],L*0.3,18,L+24,40,5.5,6,rad(108),15);
      // falha de pelo no flanco: pele podre, carne e costelas largas
      const wc=[L*0.5,4], ws=q=>[wc[0]+(q[0]-wc[0])*0.55,wc[1]+(q[1]-wc[1])*0.55];
      const W=[[L*0.3,-4],[L*0.4,-13],[L*0.56,-14],[L*0.66,-4],[L*0.62,12],[L*0.46,17],[L*0.32,10]].map(ws).map(ar);
      p.F(M.rot[1]); p.poly(W); clipPoly(W,()=>{ p.F(M.rot[2]); p.poly([[L*0.28,6],[L*0.7,4],[L*0.7,20],[L*0.28,20]].map(ar));
        p.F(M.flesh[2]); p.poly([[L*0.35,-3],[L*0.43,-9],[L*0.56,-9],[L*0.62,-1],[L*0.58,9],[L*0.45,13],[L*0.36,7]].map(ws).map(ar));
        p.F(M.flesh[3]); p.poly([[L*0.38,3],[L*0.5,5],[L*0.6,4],[L*0.56,11],[L*0.44,12]].map(ws).map(ar));
        for(let k=0;k<3;k++){ const x=L*(0.44+k*0.045); p.F(M.bone[2]); bandA(p,[[x,-2],[x+2,2],[x+1,8]].map(ar),2.2); p.F(M.bone[0]); p.rect(...ar([x+0.4,0]),1,2); } });
      tufts(p,M.fur[1],[[L*0.3,-4],[L*0.4,-13],[L*0.56,-14],[L*0.66,-4]].map(ws).map(ar),2.6,3);
      tufts(p,M.fur[2],[[L*0.66,-4],[L*0.62,12],[L*0.46,17],[L*0.32,10]].map(ws).map(ar),2.4,5);
      stain(p,M.blood,...ar([L*0.5,11]),1.8,2,7);
      // FAIXA PRETA diagonal (garganta até o meio do dorso) com borda branca por cima
      const tip=[L*0.16,-29];
      const E1=[[L+32,-10],[L*0.86,-16],[L*0.62,-21],tip];
      const BW=[[L+32,-17],[L*0.86,-22.6],[L*0.62,-27.4],[L*0.2,-31.4],[L*0.08,-30]].concat(E1.slice(0,3).reverse()).map(ar);
      p.F(M.brd[1]); p.poly(BW); clipPoly(BW,()=>{ p.F(M.brd[0]); p.poly([[L*0.2,-40],[L+40,-40],[L+40,-16],[L*0.62,-24.4],[L*0.3,-28.6]].map(ar)); p.F(M.brd[2]); p.poly([[L*0.5,-19],[L+40,-11.4],[L+40,0],[L*0.5,0]].map(ar)); });
      const BK=E1.concat([[L*0.4,-14],[L*0.56,-4],[L*0.78,12],[L+4,34],[L+40,44],[L+40,-10]]).map(ar);
      p.F(M.blk[1]); p.poly(BK);
      clipPoly(BK,()=>{ p.F(M.blk[0]); p.poly([[L*0.3,-30],[L+40,-16],[L+40,-9],[L*0.86,-12.6],[L*0.62,-17],[L*0.3,-24]].map(ar)); p.F(M.blk[2]); p.poly([[L*0.5,0],[L*0.78,16],[L+4,38],[L+40,46],[L+40,20],[L*0.86,10]].map(ar));
        p.F(M.blk[0]); bandA(p,[[L*0.4,-22],[L*0.66,-17.4],[L*0.9,-12]].map(ar),1.2); p.F(M.blkQ[0]); bandA(p,[[L*0.6,-14],[L*0.84,-8],[L+10,-6]].map(ar),1);
        strands(p,M.blk[3],null,L*0.4,-24,L+30,30,6,4,rad(118),21); });
      // borda de baixo da faixa: tufos claros (pelo do ombro)
      tufts(p,M.leg[2],[[L*0.4,-14],[L*0.56,-4],[L*0.78,12],[L+4,34]].map(ar),3,11,-0.2);
      if(fur){ // faixa rasgada: dentes de pelo carbonizado dentro do preto
        [[0.5,-12],[0.7,-4],[0.82,6],[0.95,18]].forEach(([u,y],k)=>{ const x=L*u; p.F(M.fur[2]); p.poly([[x-4,y-6],[x+3,y-3],[x-1,y+5]].map(ar)); p.F(M.flesh[2]); p.rect(...ar([x-1,y-2]),1.4,2); }); }
      // ombro claro (início do antebraço)
    });
    // franja de pelo longo caindo da barriga
    { const bp=[[L+10,32],[L*0.8,36],[L*0.62,37+P.sag*0.5],[L*0.44,35+P.sag],[L*0.26,31+P.sag*0.6],[L*0.08,28],[-10,24],[-24,14]].map(ar);
      tufts(p,M.fur[3],bp.map(q=>[q[0]+1,q[1]+1]),4,141,1.1); tufts(p,M.fur[3],bp,3.4,143,1.1); }
    // crina de pelo duro no dorso
    tufts(p,M.furD[1],[[-26,-19],[-16,-29],[0,-31],[L*0.18,-31.4],[L*0.34,-31]].map(ar),7,41,0.7);
    tufts(p,M.fur[1],[[L*0.4,-30.6],[L*0.6,-29.4],[L*0.8,-31],[L+4,-30.4]].map(ar),5.4,47,0.7);
    // vértebras furando o dorso (fúria: espinha inteira)
    const n=fur?7:3, x0=fur?-14:L*0.04, x1=fur?L*0.72:L*0.3;
    for(let k=0;k<n;k++){ const x=x0+(x1-x0)*(n>1?k/(n-1):0), top=sk.ar(x,-30)+1, h=fur?(5+5*S(PI*k/(n-1))):5;
      p.F(M.flesh[2]); p.ell(x,top+1,4.6,2.4); p.F(M.bone[2]); p.poly([[x-3.4,top+1],[x-0.6,top-h],[x+3.4,top+1]]); p.F(M.bone[1]); p.poly([[x-2.2,top+0.6],[x-0.4,top-h+1.4],[x+1.4,top+0.4]]); p.F(M.bone[0]); p.rect(x-1,top-h+2,1,1.6); }
    // placas de fungo-lunar nas costas
    const g=fur?P.ign:P.glow;
    fungus(p,M,...ar([L*0.44,-32]),1.2,11,g); fungus(p,M,...ar([-12,-27]),1.05,17,g); fungus(p,M,...ar([L*0.64,-31]),0.8,23,g);
    if(g>0.4){ p.F(M.glow[1]); [[L*0.44,-32],[-12,-27],[L*0.64,-31]].forEach(q=>{ const r=ar(q); p.rect(r[0]-0.5,r[1]-9-2*g,1,3); p.rect(r[0]+4,r[1]-7-2*g,1,2); }); }
  }

  /* ---------------- pescoço ---------------- */
  function drawNeck(p,M,sk,P,form){
    const a=sk.NB, b=sk.HJ, ang=Math.atan2(b.y-a.y,b.x-a.x), Lh=Math.hypot(b.x-a.x,b.y-a.y);
    p.xf(ang,a.x,a.y);
    const dn=C(ang)>=-0.2?1:-1;
    const N=[[-18,-22],[Lh*0.5,-15],[Lh+5,-11],[Lh+9,0],[Lh+5,10],[Lh*0.5,15],[-12,24],[-24,6]].map(q=>[q[0],q[1]*dn]);
    platePoly(p,M.fur,N,ang,1);
    clipPoly(N,()=>{ mass(p,M.fur,Lh*0.3,-6*dn,16,12,ang,0.9);
      // faixa preta embaixo, borda branca por cima
      const yb=x=>(-4+x*0.06)*dn;
      p.F(M.brd[1]); p.poly([[-30,yb(-30)-4.6*dn],[Lh+10,yb(Lh+10)-3.2*dn],[Lh+10,yb(Lh+10)+0.4*dn],[-30,yb(-30)+0.4*dn]]);
      p.F(M.brd[0]); p.poly([[-30,yb(-30)-4.6*dn],[Lh*0.4,yb(Lh*0.4)-4*dn],[Lh*0.4,yb(Lh*0.4)-2.6*dn],[-30,yb(-30)-3*dn]]);
      p.F(M.blk[1]); p.poly([[-30,yb(-30)],[Lh+12,yb(Lh+12)],[Lh+12,30*dn],[-30,30*dn]]);
      p.F(M.blk[2]); p.poly([[-30,(yb(-30)/dn+12)*dn],[Lh+12,(yb(Lh+12)/dn+9)*dn],[Lh+12,30*dn],[-30,30*dn]]);
      p.F(M.blk[0]); bandA(p,[[-10,yb(-10)+2*dn],[Lh*0.6,yb(Lh*0.6)+2*dn]],0.9);
      strands(p,M.fur[2],M.fur[0],-14,dn>0?-18:6,Lh+4,dn>0?-6:18,5.5,4,rad(150),31);
    });
    tufts(p,M.fur[2],[[-18,-22*dn],[Lh*0.5,-15*dn],[Lh+5,-11*dn]],3.4,9,0.5);
    tufts(p,M.blk[2],[[Lh+5,10*dn],[Lh*0.5,15*dn],[-12,24*dn]],3.2,13,0.4);
  }

  /* ---------------- cabeça (focinho tubular) ---------------- */
  // contorno: crânio pequeno + tubo afinando, leve curva pra baixo
  const sn=x=>0.0016*Math.max(0,x-18)*Math.max(0,x-18);
  function headPts(P){ const s=P.sniff*1.4, o=[];
    o.push([-12,-3],[-10,-11],[-3,-15],[8,-14.4],[17,-11]);
    for(let x=24;x<=58;x+=6){ const hw=6.4-(x-24)*0.075; o.push([x,sn(x)-hw+(x>48?s*(x-48)/10:0)]); }
    o.push([61,sn(61)-2.4+s],[62,sn(62)+1+s]);
    for(let x=58;x>=24;x-=6){ const hw=6.4-(x-24)*0.075; o.push([x,sn(x)+hw+(x>48?s*(x-48)/10:0)]); }
    o.push([16,9],[6,11],[-4,10],[-10,6]);
    return o; }
  function drawHead(p,M,sk,P,form){
    const fur=isFur(form); p.xf(sk.ha,sk.HJ.x,sk.HJ.y); K_.st.CTX.scale(HS,HS); const A=sk.ha, s=P.sniff*1.4;
    const HP=headPts(P);
    // orelha atrás (pequena e redonda)
    p.F(M.fur[2]); p.ell(-1,-14,4.2,3.8,-0.4); p.F(M.fur[1]); p.ell(-0.4,-14.6,3,2.6,-0.4); p.F(M.skin[3]); p.ell(0.2,-14,1.4,1.2);
    platePoly(p,M.skin,HP,A,1);
    clipPoly(HP,()=>{
      mass(p,M.fur,2,-3,13,11,A,1);
      // tubo: brilho em cima, sombra fria embaixo
      p.F(M.skin[0]); p.poly([[18,-12.4],[30,sn(30)-6.4],[46,sn(46)-5],[56,sn(56)-3.6],[56,sn(56)-2.2],[46,sn(46)-3.4],[30,sn(30)-4.4],[18,-9.6]]);
      p.F(M.skinQ[2]); p.poly([[-14,4],[16,6],[30,sn(30)+2.4],[60,sn(60)+1],[64,20],[-14,20]]);
      p.F(M.skin[2]); p.poly([[-14,7],[12,9],[30,sn(30)+4.4],[60,sn(60)+2.4],[64,20],[-14,20]]);
      // pelo da nuca
      strands(p,M.fur[2],M.fur[0],-12,-14,14,8,4.5,3.4,rad(160),61);
      // rugas do tubo
      p.F(M.skin[2]); [26,33,40].forEach(x=>bandA(p,[[x,sn(x)-5.6],[x+1,sn(x)-3.6]],0.8));
      // ponta preta (narinas)
      p.F(M.nose[1]); p.poly([[52,sn(52)-4.6+s*0.4],[63,sn(63)-3+s],[63,sn(63)+2+s],[52,sn(52)+4.6+s*0.4]]);
      p.F(M.nose[0]); p.rect(55,sn(55)-3.8+s*0.6,4,1); p.F(M.nose[3]); p.rect(60,sn(60)-0.4+s,2,1.4);
      // osso do crânio exposto
      p.F(M.rot[2]); p.poly([[-6,-12],[2,-15],[8,-13],[5,-8],[-3,-7]]); p.F(M.bone[1]); p.poly([[-4,-11.4],[2,-14],[7,-12.6],[4,-8.6],[-2,-8]]); p.F(M.bone[0]); p.rect(0,-12.4,3,1); p.F(M.bone[3]); p.rect(2,-10,1,2);
    });
    // olho minúsculo, órbita funda
    p.F(M.skin[3]); p.ell(14,-4.8,3.4,2.6); p.F(M.mouth[3]); p.ell(14.2,-4.6,2.2,1.6);
    p.F(M.skin[0]); bandA(p,[[11,-1.6],[16,-1.4]],0.7);
    // cupinzeiro grudado no meio do focinho (terra com cupins)
    const mx=34, my=sn(34); K_.st.CTX.save(); K_.st.CTX.translate(mx,my); K_.st.CTX.scale(0.62,0.62); K_.st.CTX.translate(-mx,-my);
    p.F(M.mound[3]); p.ell(mx+0.6,my+1.2,7.6,7.4,0.2); p.F(M.mound[2]); p.ell(mx,my+0.4,6.8,6.6,0.2); p.F(M.mound[1]); p.ell(mx-1,my-1.4,5,4.2,0.2); p.F(M.mound[0]); p.ell(mx-2,my-3.2,2.4,1.4);
    p.F(M.mound[3]); [[mx+2,my+1],[mx-2,my+3],[mx+3,my-3]].forEach(([x,y])=>p.rect(x,y,1.2,1.2));
    p.F(M.mound[2]); p.poly([[mx-3,my+6],[mx+1,my+6.6],[mx-1,my+11]]); p.poly([[mx+3,my+5],[mx+6,my+5],[mx+4.6,my+9]]);
    p.F(M.larva[1]); p.rect(mx+4,my-1,2,1); p.rect(mx-4,my+2,1,1); K_.st.CTX.restore();
    // boquinha na ponta + língua
    if(P.roar>0.3){ p.F(M.mouth[2]); p.ell(60,sn(60)+4.4+s,2.4,1.4*P.roar+0.6); }
  }
  function drawTongue(p,M,sk,P,form){
    if(P.tg<0.03) return; p.xf(sk.ha,sk.HJ.x,sk.HJ.y); K_.st.CTX.scale(HS,HS);
    const T=M.tongue, s=P.sniff*1.4, L=8+P.tg*(P.dead>0?26:46), x0=60, y0=sn(60)+3.6+s;
    const pts=[]; for(let k=0;k<=8;k++){ const u=k/8; pts.push(P2(x0+u*L,y0+u*u*(P.dead>0?16:5)+S(u*PI*2+(P.t||0))*1.2*u)); }
    for(let k=0;k<8;k++){ p.F(T[2]); p.cap(pts[k],pts[k+1],2.6-k*0.12,2.5-k*0.12); }
    for(let k=0;k<7;k++){ p.F(T[1]); p.cap(P2(pts[k].x,pts[k].y-0.6),P2(pts[k+1].x,pts[k+1].y-0.6),1.4,1.3); }
    p.F(T[0]); band(p,pts.slice(1,5).map(q=>P2(q.x,q.y-1)),0.5);
    // larvas grudadas
    [[0.35,1],[0.6,-1],[0.82,1.4]].forEach(([u,o],k)=>{ const q=pts[Math.round(u*8)]; p.F(M.larva[2]); p.ell(q.x,q.y+o,2,1.3); p.F(M.larva[0]); p.rect(q.x-0.8,q.y+o-0.8,1,1); });
    p.F(T[3]); p.circle(pts[8],1.6); p.F(T[1]); p.circle(P2(pts[8].x-0.4,pts[8].y-0.4),1);
  }
  function drawEye(p,M,sk,P,form){
    if(P.dead>=0.95) return; const fur=isFur(form), E=sk.Hd(14.4,-4.8), g=1-P.dead;
    p.id(); const hr=(fur?2.8:2.2)*g;
    p.F(M.eye[3]); p.circle(E,hr); p.F(M.eye[2]); p.circle(E,hr*0.7); p.F(M.eye[1]); p.circle(P2(E.x+0.3,E.y-0.2),hr*0.42); p.F(M.eye[0]); p.rect(E.x,E.y-1,1,1);
    if(g>0.5){ p.F(M.eye[2]); p.cap(P2(E.x-1.4,E.y),P2(E.x-(fur?7:4.4),E.y-0.8),1.1,0.4); }
  }

  /* ---------------- patas ---------------- */
  function drawFrontHand(p,M,lg,claw,near){
    const W=lg.W, Pc=lg.Pc, ang=Math.atan2(Pc.y-W.y,Pc.x-W.x), L=Math.hypot(Pc.x-W.x,Pc.y-W.y)||1, B=M.blk, s=near?1.12:1;
    p.xf(ang,W.x,W.y);
    // mão fechada (nós dos dedos), preta
    p.F(B[2]); p.ell(L*0.55,0.8,9.4*s,8*s); p.F(B[1]); p.ell(L*0.5,-0.8,7.6*s,6*s); p.F(B[0]); p.ell(L*0.34,-3.4,3.2*s,1.4); p.F(B[3]); p.ell(L*0.7,4.4*s,5*s,2.2);
    const Cl=M.claw, tipX=L+2;
    if(claw<0.25){ // garras dobradas pra dentro, embaixo da mão
      sickle(p,Cl,P2(tipX-2,1),P2(tipX+7,8*s),P2(tipX-5,12*s),4.4*s);
      sickle(p,Cl,P2(tipX-3,-3),P2(tipX+4,2),P2(tipX-3,7*s),2.8*s);
    } else { // garras abertas em foice: a do meio gigante
      const k=claw;
      sickle(p,Cl,P2(tipX-2,-4),P2(tipX+11*k,-8),P2(tipX+15*k,3*k),3.4*s);
      sickle(p,Cl,P2(tipX-2,2),P2(tipX+26*k,-4),P2(tipX+30*k,16*k),5.8*s);
      sickle(p,Cl,P2(tipX-3,6),P2(tipX+12*k,9),P2(tipX+13*k,16*k),3.2*s);
      p.F(M.blood[1]); p.rect(tipX+28*k,14*k,1.4,1.6);
    }
  }
  function drawFront(p,M,lg,near,P,form){
    const R=M.leg;
    let t=limb(p,lg.S,lg.E);
    const UA=seg(t.L,near?14:12,near?10.5:9.5,1.1);
    platePoly(p,R,UA,t.ang,1);
    clipPoly(UA,()=>{ p.F(R[0]); p.poly([[t.L*0.3,-14],[t.L+12,-11],[t.L+12,-5],[t.L*0.3,-7]]);
      p.F(R[2]); p.poly([[-20,6],[t.L*0.5,7],[t.L+12,5],[t.L+12,20],[-20,20]]); p.F(R[3]); p.poly([[t.L*0.2,11],[t.L+12,8.6],[t.L+12,20],[t.L*0.2,20]]);
      
      // ombro: a faixa preta desce até o meio do braço, borda de baixo em tufos
      const BKA=[[-24,-24],[t.L*0.12,-14],[t.L*0.04,-4],[t.L*0.14,6],[t.L*0.02,24],[-24,24]];
      p.F(M.blk[1]); p.poly(BKA); clipPoly(BKA,()=>{ p.F(M.blk[2]); p.poly([[-24,6],[t.L*0.5,6],[t.L*0.5,24],[-24,24]]);
        strands(p,M.blk[0],null,-20,-14,t.L*0.2,2,3.8,4,rad(80),near?171:173); strands(p,M.blk[3],null,-20,4,t.L*0.2,20,3.8,4,rad(80),near?175:177); });
      // pelo curto creme no braço
      strands(p,R[1],null,t.L*0.1,-12,t.L+8,4,3.6,3.4,rad(60),near?181:183);
      strands(p,R[3],null,t.L*0.1,6,t.L+8,16,3.6,3,rad(70),near?185:187); });
    tufts(p,R[2],[[t.L+6,9],[t.L*0.6,11],[t.L*0.2,12]],3.4,near?191:193,0.4);
    tufts(p,R[0],[[t.L*0.2,-11],[t.L*0.6,-11.6],[t.L+4,-9]],2.6,near?195:197,0.4);
    tufts(p,M.blk[1],[[t.L*0.12,-12],[t.L*0.04,-3],[t.L*0.14,6],[t.L*0.06,12]],5,near?71:81,-0.4);
    tufts(p,M.blk[2],[[t.L*0.1,-8],[t.L*0.08,2],[t.L*0.12,10]],3.6,near?73:83,-0.4);
    t=limb(p,lg.E,lg.W);
    const FA=seg(t.L,9.4,7,1.05);
    platePoly(p,R,FA,t.ang,1);
    clipPoly(FA,()=>{ p.F(R[0]); p.poly([[-12,-12],[t.L+12,-10],[t.L+12,-4],[-12,-5]]); p.F(R[2]); p.poly([[-12,4],[t.L+10,3.4],[t.L+10,14],[-12,14]]); p.F(R[3]); p.poly([[0,7.6],[t.L+10,5.4],[t.L+10,14],[0,14]]);
      strands(p,R[1],null,-8,-10,t.L,2,3.4,3.2,rad(55),near?201:203); strands(p,R[3],null,-8,4,t.L,12,3.4,3,rad(65),near?205:207); });
    tufts(p,R[0],[[-4,-8.6],[t.L*0.5,-8],[t.L,-6.6]],2.4,near?211:213,0.4);
    p.F(R[0]); p.cap(P2(4,-5.4),P2(t.L*0.7,-4.6),1.4,1);
    // pelo comprido atrás do antebraço
    p.F(R[2]); [[0.2,8],[0.45,8],[0.7,7]].forEach(([u,y])=>p.poly([[t.L*u-3,y-2],[t.L*u+3,y-2],[t.L*u-2,y+5]]));
    
    // anel preto no pulso
    p.F(M.blk[2]); p.cap(P2(t.L-9,0),P2(t.L+1,0),14.4,13); p.F(M.blk[1]); p.cap(P2(t.L-8,-1),P2(t.L,-1),11,10); p.F(M.blk[0]); p.rect(t.L-7,-5.6,5,1);
    drawFrontHand(p,M,lg,P.claw,near);
  }
  function drawHind(p,M,lg,near,P,form){
    const R=M.furD;
    let t=limb(p,lg.S,lg.E);
    const TH=seg(t.L,near?20:16,near?10:9,1.2);
    platePoly(p,R,TH,t.ang,1);
    clipPoly(TH,()=>{ p.F(R[0]); p.poly([[-30,-30],[t.L+12,-30],[t.L+12,-10],[t.L*0.5,-6],[-30,-8]]);
      strands(p,R[1],null,-24,-22,t.L+6,-4,4.5,5,rad(70),near?131:133);
      p.F(R[2]); p.poly([[-30,9],[t.L*0.5,10],[t.L+12,6],[t.L+12,30],[-30,30]]); p.F(R[3]); p.poly([[-30,15],[t.L+12,10],[t.L+12,30],[-30,30]]);
      strands(p,R[2],R[0],-16,-12,t.L,14,4.5,5,rad(60),near?101:111);
      strands(p,R[3],null,-16,8,t.L+8,24,4.5,4,rad(70),near?103:113);
      if(near){ // pelo caído na coxa: pele podre
        const RP=[[t.L*0.3,0],[t.L*0.5,-3],[t.L*0.66,1],[t.L*0.6,7],[t.L*0.4,6]]; p.F(M.rot[2]); p.poly(RP); p.F(M.rot[1]); p.poly([[t.L*0.34,0],[t.L*0.5,-2],[t.L*0.6,1],[t.L*0.44,3]]); p.F(M.flesh[2]); bandA(p,[[t.L*0.4,4],[t.L*0.58,4]],1);
        tufts(p,R[1],RP.slice(0,3),2.6,121,0.3); } });
    tufts(p,R[2],[[t.L*0.9,9],[t.L*0.5,13],[0,17],[-14,14]],4.2,near?113:117,0.4);
    // borda de cima fundida no tronco: tufos sobrepostos da cor do tronco
    tufts(p,R[1],[[-18,-14],[0,-19],[t.L*0.4,-17],[t.L*0.8,-11]],5,near?151:153,0.5);
    tufts(p,R[0],[[-12,-15],[t.L*0.3,-17],[t.L*0.6,-14]],3.6,near?155:157,0.5);
    if(near) fungus(p,M,t.L*0.05,-14,0.7,105,isFur(form)?P.ign:P.glow);
    t=limb(p,lg.E,lg.W);
    const SH=seg(t.L,10,6.4,1);
    platePoly(p,R,SH,t.ang,0.8);
    clipPoly(SH,()=>{ p.F(R[2]); p.poly([[-12,4],[t.L+8,2.6],[t.L+8,14],[-12,14]]); p.F(R[3]); p.poly([[-12,7],[t.L+8,4.4],[t.L+8,14],[-12,14]]);
      strands(p,R[0],null,-6,-10,t.L,-2,4,3.6,rad(80),near?161:163); });
    tufts(p,R[2],[[t.L*0.9,6],[t.L*0.4,9],[-2,10]],3,near?165:167,0.4);
    const mt=limb(p,lg.W,lg.Pc);
    p.F(M.blk[2]); p.cap(P2(0,0),P2(mt.L,0),10,9); p.F(M.blk[1]); p.cap(P2(0,-1.4),P2(mt.L-2,-1.2),6,5); p.F(M.blk[0]); p.cap(P2(2,-3.4),P2(mt.L-5,-3),1.4,1.2);
    // pé plantígrado: unhas curtas
    p.F(M.claw[2]); [[mt.L+2,-3],[mt.L+3,0],[mt.L+2,3]].forEach(([x,y])=>p.cap(P2(x-2,y),P2(x+3,y+1.4),1.6,0.6));
  }

  /* ---------------- cauda-bandeira ---------------- */
  function tailPts(sk,P){ const n=9, out=[sk.TB]; let q=sk.TB; const base=-82+P.tu+sk.P.tilt*0.8;
    for(let k=1;k<=n;k++){ const u=k/n, a=base+P.tcurl*u*u+P.tw*22*S(P.tph-k*0.5)*u; q=lp(q,a,7.8); if(q.y>GROUND-3) q=P2(q.x,GROUND-3); out.push(q); }
    return out; }
  function drawTail(p,M,sk,P,form){
    p.id(); const pts=tailPts(sk,P), n=pts.length-1, R=M.tail, Q=M.tailQ, t=P.tph||0;
    const top=[], bot=[], mid=[];
    for(let k=0;k<=n;k++){ const u=k/n, q=pts[k];
      const up=9+12*S(PI*Math.min(1,u*0.9));
      const hang=(18+62*Math.pow(S(PI*Math.min(1,0.04+u*0.6)),0.8))*P.tfan;
      const drift=-3*u-P.tw*4*S(t*1.3-k*0.6)*u;
      top.push([q.x+drift*0.3,q.y-up]);
      const by=Math.min(GROUND-2,q.y+hang);
      bot.push([q.x+drift-3*u,by]); mid.push([q.x+drift*0.6,q.y+(by-q.y)*0.42]); }
    const e=pts[n], e2=pts[n-1], ang=Math.atan2(e.y-e2.y,e.x-e2.x), tip=[];
    for(let j=1;j<6;j++){ const a=ang-PI/2+j/6*PI; tip.push([e.x+C(a)*8+C(ang)*9, Math.min(GROUND-2,e.y+S(a)*16+C(ang)*0+5*j/6)]); }
    const poly=top.concat(tip).concat(bot.slice().reverse());
    p.F(R[2]); p.poly(poly);
    clipPoly(poly,()=>{
      p.F(R[1]); p.poly(top.concat(tip.slice(0,3)).concat(mid.slice().reverse()));
      p.F(Q[0]); p.poly(top.concat(mid.map((m,k)=>[m[0],lerp(P2(top[k][0],top[k][1]),P2(m[0],m[1]),0.45).y]).reverse()));
      p.F(R[0]); band(p,top.slice(1,n).map(q=>P2(q[0]+0.4,q[1]+2.2)),1.4);
      p.F(Q[2]); p.poly(mid.concat(tip.slice(3)).concat(bot.slice().reverse()).map((q,k)=>[q[0],q[1]+(k<=n?4:0)]));
      p.F(R[3]); p.poly(bot.map(q=>[q[0],q[1]-6]).concat(bot.slice().reverse()));
      // fios finos irregulares: luz quente em cima, fios escuros embaixo (sem listras regulares)
      for(let k=0;k<n;k++) for(let j=0;j<3;j++){ const u=(k+j/3)/n, i0=Math.min(n,k+1), f=j/3;
        const tp=lerp(P2(top[k][0],top[k][1]),P2(top[i0][0],top[i0][1]),f), bt=lerp(P2(bot[k][0],bot[k][1]),P2(bot[i0][0],bot[i0][1]),f);
        const r1=rnd(k*3+j,11), r2=rnd(k*3+j,13), sw=-4-6*u-3*S(t*1.1+k)*P.tw;
        const a=lerp(tp,bt,0.08+r1*0.25), c=lerp(tp,bt,0.3+r1*0.2), e=lerp(tp,bt,0.55+r2*0.4);
        p.F(r2<0.5?R[0]:Q[0]); band(p,bez(a,P2(c.x+sw*0.5,c.y),P2(e.x+sw*0.3,e.y-6),5),0.7+0.5*r2);
        const a2=lerp(tp,bt,0.5+r2*0.15), e2=lerp(tp,bt,0.92);
        p.F(r1<0.5?R[3]:Q[3]); band(p,bez(a2,P2((a2.x+e2.x)/2+sw*0.6,(a2.y+e2.y)/2),P2(e2.x+sw,e2.y),5),0.6+0.5*r1); }
    });
    // franja da ponta dos pelos
    for(let k=1;k<=n;k++) for(let j=0;j<2;j++){ const b=lerp(P2(bot[k-1][0],bot[k-1][1]),P2(bot[k][0],bot[k][1]),j*0.5+0.25), l=4+5*rnd(k,7+j); p.F(R[3]); p.poly([[b.x-3,b.y-3],[b.x+2.4,b.y-3],[b.x-3.4,Math.min(GROUND-1,b.y+l)]]); }
    for(let j=0;j<tip.length;j++){ const q=tip[j]; p.F(R[2]); p.poly([[q[0]-2,q[1]-2],[q[0]+2,q[1]-1],[q[0]+C(ang)*5,Math.min(GROUND-1,q[1]+3)]]); }
    tufts(p,R[1],top.slice(0,n+1),3.6,77,0.7);
    // corrupção: pelo arrancado com vértebras e fungo
    { const a=pts[4], b=pts[6], seg3=[a,lerp(a,b,0.5),b].map(q=>P2(q.x,q.y+1)); p.F(M.flesh[3]); band(p,seg3,4.4); p.F(M.flesh[2]); band(p,seg3,3);
      for(let k=0;k<4;k++){ const q=lerp(a,b,0.12+k*0.25); p.F(M.bone[2]); p.ell(q.x,q.y+1.4,2.2,1.8); p.F(M.bone[1]); p.ell(q.x-0.3,q.y+1,1.6,1.2); }
      tufts(p,R[2],[[a.x,a.y-2],[b.x,b.y-2]],3,91,0.2); }
    fungus(p,M,pts[3].x,pts[3].y-5,0.75,79,isFur(form)?P.ign:P.glow);
    fungus(p,M,pts[7].x,pts[7].y-4,0.6,83,isFur(form)?P.ign:P.glow);
  }

  /* ---------------- FX ---------------- */
  function drawSmear(p,M,sk,P,anim){ p.id();
    if(anim==='claw'){ const s=sk.Sh; K_.smear(p,M.fx,s.x+4,s.y+4,58,88,P.smear>1.5?-30:-110,P.smear>1.5?80:20,0.95); K_.smear(p,M.fx,s.x+6,s.y+6,44,64,P.smear>1.5?-20:-100,P.smear>1.5?70:10,0.95); }
    else if(anim==='hug'){ const s=sk.Sh; K_.smear(p,M.fx,s.x+10,s.y+20,50,70,-60,40,0.8); }
    else if(anim==='tongue'){ const o=sk.Hd(62,4); p.F(M.fx[1]); [-4,0,4].forEach(dy=>p.cap(P2(o.x+6,o.y+dy),P2(o.x+44,o.y+dy*0.4),0.6,1.6)); }
    else if(anim==='slam'){ const tp=tailPts(sk,P); const e=tp[tp.length-1]; K_.smear(p,M.fx,sk.TB.x,sk.TB.y,40,76,170,230,0.9); dust(p,M.dust,M.fx,e.x-10,GROUND,0.4*P.impact); } }
  function drawRing(p,M,sk,P){ p.id(); const o=sk.Hd(60,2), r=P.ring;
    for(let k=0;k<3;k++){ const rr=12+r*26+k*14; if(rr>110) continue; K_.smear(p,M.wave,o.x,o.y,rr-4,rr,-70+sk.P.hd*0.6,50+sk.P.hd*0.6,1); } }
  function steamPuffs(p,M,o,P){ const t=P.t||0; puffs(p,M.steam,o.x+4,o.y-2,[[2+t%3,-3,3.4,2.4],[8+(t%2)*2,-7,4.4,3],[13,-12-t%3,5,3.4]]); }

  function parts(add,P,M,sk,form,anim){
    add({back:true},p=>drawHind(p,M,sk.hb,false,P,form));
    add({back:true},p=>drawFront(p,M,sk.fb,false,P,form));
    if(!P.tfront) add({},p=>drawTail(p,M,sk,P,form));
    add({},p=>drawTorso(p,M,sk,P,form));
    add({},p=>drawHind(p,M,sk.hf,true,P,form));
    add({},p=>drawNeck(p,M,sk,P,form));
    add({},p=>drawHead(p,M,sk,P,form));
    add({},p=>drawTongue(p,M,sk,P,form));
    add({},p=>drawFront(p,M,sk.ff,true,P,form));
    if(P.tfront) add({},p=>drawTail(p,M,sk,P,form));
    add({noShade:true,noRim:true},p=>drawEye(p,M,sk,P,form));
    if(P.roar>0.6&&P.dead<0.5&&P.tilt<30) add({noShade:true,noRim:true},p=>{ p.id(); steamPuffs(p,M,sk.Hd(62,4),P); });
    if(P.smear) add({noShade:true,smear:true,noRim:true},p=>drawSmear(p,M,sk,P,anim));
    if(P.ring>0.05) add({noShade:true,smear:true,noRim:true},p=>drawRing(p,M,sk,P));
    if(P.impact&&anim!=='slam') add({noShade:true,smear:true,noRim:true},p=>{ p.id(); const fl=anim==='death'||anim==='fall'; dust(p,M.dust,fl?null:M.fx,fl?sk.H.x+40:sk.ff.Pc.x,GROUND,0.4*P.impact); });
    if(isFur(form)&&P.ign>0.3&&P.dead<0.5) add({noShade:true,noRim:true},p=>{ p.id(); const L=sk.L, amp=Math.min(1.2,P.ign);
      const list=[[L*0.44,-36,0.95],[-12,-31,0.85],[L*0.64,-35,0.7],[L*0.2,-36,0.6]].map(([x,y,k])=>{ const q=sk.T(x,y*DY); return [q.x,q.y,k]; });
      const tp=tailPts(sk,P); list.push([tp[3].x,tp[3].y-8,0.6],[tp[7].x,tp[7].y-6,0.5]);
      K_.flames(p,M.glow,list,(P.t||0)+(P.tph||0),amp);
      p.F(M.glow[1]); for(let k=0;k<6;k++){ const q=sk.T(-20+rnd(k,3)*(L+10),-44-rnd(k,4)*20-((P.t||0)*3+k*5)%14); p.rect(q.x,q.y,1,1); } });
    if(P.moss>0.02) add({},p=>{ p.id(); const n=Math.round(14*P.moss);
      for(let k=0;k<n;k++){ const u=rnd(k,31), q=sk.T(-24+u*(sk.L+30),-24+rnd(k,32)*30); fungus(p,M,q.x,q.y,0.7+P.moss*0.8*rnd(k,33),k*5+200,0.6*P.moss); } });
  }
  function anchors(sk,P){ return {eye:sk.Hd(14.4,-4.8),mouth:sk.Hd(62,3),head:sk.Hd(4,-8),hand:sk.ff.Pc,back:sk.T(sk.L*0.5,-30),tail:sk.TB}; }

  /* ---------------- adereços: ponta da língua e poeira ---------------- */
  const PROP={FW:60,FH:44,GROUND:34,AX:30};
  function prop(add,P,M,form,anim){ add({noShade:true},p=>(anim==='xLingua'?drawTip:drawPuff)(p,M,Math.round(P.st||0),form)); }
  function drawTip(p,M,st,form){ p.id(); const T=M.tongue, cx=30, cy=22, w=S(st*PI/2)*2;
    p.F(T[3]); p.ell(cx,cy+0.6,7,4.4); p.F(T[2]); p.ell(cx-0.4,cy,6,3.6); p.F(T[1]); p.ell(cx-1,cy-1,4,2); p.F(T[0]); p.rect(cx-3,cy-2,2,1);
    // larvas se contorcendo
    [[-5,-3],[3,-3.6],[6,2],[-3,3]].forEach(([dx,dy],k)=>{ const x=cx+dx+(k%2?w:-w)*0.5, y=cy+dy; p.F(M.larva[3]); p.ell(x+0.4,y+0.5,2.6,1.6,k); p.F(M.larva[1]); p.ell(x,y,2.4,1.4,k); p.F(M.larva[0]); p.rect(x-1,y-0.8,1,1); p.F(M.larva[3]); p.rect(x+1.4,y-0.4,0.8,0.8); });
    if(isFur(form)){ p.F(T[0]); p.rect(cx-8,cy-6,1,1); p.rect(cx+7,cy-5,1,1); } }
  function drawPuff(p,M,st,form){ p.id(); const D=M.dust, cx=30, g=34, s=0.6+st*0.25;
    p.F(D[3]); p.ell(cx,g-4,20*s,6*s); p.F(D[2]); [[-10,-8,9],[8,-9,10],[0,-12,9]].forEach(([dx,dy,r])=>p.ell(cx+dx*s,g+dy*s,r*s,r*s*0.7));
    p.F(D[1]); [[-9,-10,6],[7,-12,6],[0,-15,6]].forEach(([dx,dy,r])=>p.ell(cx+dx*s,g+dy*s,r*s,r*s*0.6)); p.F(D[0]); [[-10,-12,2.4],[5,-15,2.6]].forEach(([dx,dy,r])=>p.ell(cx+dx*s,g+dy*s,r*s,r*s*0.6)); }

  return K_.factory({SC,FW,FH,GROUND,AX,RIM,ANIMS,NAMES,REST,mats0,skeleton,parts,anchors,PROP,prop});
})();
