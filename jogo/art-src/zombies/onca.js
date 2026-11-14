/* ONCA — fonte de arte (editável). Build: npm run art
   Mini boss da Amazônia "A Onça-Pintada" (Panthera onca) tomada pela Lua de Sangue: a caçadora da samaúma.
   Quadrúpede próprio (sem rig humanoide): coluna com tilt/arco/estica, 4 patas com IK de 2 ossos
   (dianteiras: ombro→cotovelo→pulso, cotovelo pra trás; traseiras: quadril→joelho→jarrete, joelho pra frente,
   metatarso até a pata), pescoço grosso, cabeça larga e redonda com mandíbula separada (abre), cauda em 12 gomos.
   Anatomia das fotos: corpo baixo e compacto, peito fundo, ombros altos e musculosos, patas curtas e grossas,
   patas dianteiras enormes, cabeça larga com masseter grande, orelha curta redonda com mancha clara atrás,
   rosetas (anel quebrado com 1–2 pintas no centro) no dorso/flanco, pintas sólidas na cabeça, pernas e ventre,
   anéis no fim da cauda. Corrupção: falha de pelo no flanco com pele cinza-esverdeada e costelas expostas,
   vértebras furando o dorso, musgo/fungo nos ombros e na cauda, corrente de cipó no pescoço (foi caçada),
   cicatrizes, caninos sujos, vapor na boca. Fúria: pelagem queimada, olhos de lua e rosetas incandescentes,
   espinha de osso no dorso inteiro. Formas da ficha: normal / furia (comum/enluarado/plenilunar também
   respondem, para a versão de arena do Pantanal). */
const ONCA=(function(){
  const {rad,lp,lerp,P2}=PIX;
  const K_=BOSSKIT, {S,C,PI,mass,platePoly,clipPoly,band,bandA,limb,rnd,stain,dust,puffs}=K_;
  const FW=380, FH=250, GROUND=222, AX=190, SC=1;
  const RIM={normal:'#c8d8f0', furia:'#ffc8b0', comum:'#c8d8f0', enluarado:'#b8e8ff', plenilunar:'#ffc8b0'};

  function mats0(form){
    const m={
      fur:['#e8a845','#b8692a','#6e3624','#3b2448'],
      furD:['#a45a26','#82401e','#52281e','#2c1626'],
      cream:['#f8ecd4','#e2cca8','#a48c94','#54405e'],
      ros:['#4a2c1c','#2a160e','#1a0e0a','#0e0608'],
      rosF:['#fff0c8','#ff7a3c','#c8341c','#601018'],
      glow:['#ffe6a8','#ff9c4c','#c84a2c','#6a1a1c'],
      rot:['#d6dccb','#a9b4a0','#6e7a76','#3a4052'],
      flesh:['#f07a74','#b02e40','#6e1630','#360a1c'],
      bone:['#fffcf2','#e8e0c8','#aaa08e','#5e5664'],
      fung:['#eaffa0','#a6f03a','#58a824','#26502a'],
      vine:['#b6c46a','#76843a','#465026','#24281c'],
      nose:['#d68a7a','#94503e','#5e2c2c','#2e1418'],
      mouth:['#e8707a','#a02c3e','#5c1224','#2a0812'],
      claw:['#ffffff','#e2dccc','#9c9488','#4c4654'],
      leaf:['#b8f070','#5aa83c','#2a6e3a','#143a2c'],
      mud:['#8a7458','#5e4a38','#3a2c26','#1e1618'],
      blood:['#9c3a46','#6e2234','#461424','#280a14'],
      acid:['#d8ff8a','#8ce03a','#4a9a2a','#204424'],
      eye:['#ffffff','#fff4a8','#ffc83a','#b07818'],
      fx:['#ffffff','#fff0c8','#ffc070','#d0603a'],
      wave:['#ffffff','#e4f2ff','#a0c8ff','#5a74c8'],
      steam:['#f4f0ff','#c8c0dc','#8a84a8','#4c4866'],
      dust:['#eadecd','#c6b6a0','#968671','#605448'],
    };
    if(form==='furia'||form==='plenilunar'){
      m.fur=['#e0a070','#a05a3c','#5e3440','#2c1a2e'];
      m.furD=['#7a3a2c','#5a2828','#3a1a24','#20101c'];
      m.rosF=['#fff6c8','#ffb848','#ff5a2a','#8a1a18'];
      m.cream=['#fff0e0','#e2c8b0','#a88a90','#5c4866'];
      m.eye=['#ffffff','#fff0e0','#ff8a7a','#c02a3a'];
      m.fx=['#ffffff','#ffe0c8','#ff8a5a','#c8302a'];
      m.steam=['#fff0f0','#e0b8c0','#a07890','#5a3c5a'];
    }
    if(form==='enluarado'){
      m.fur=['#f4e0a8','#c8a060','#7c6a6a','#3c3450'];
      m.eye=['#ffffff','#e4f8ff','#8ad8ff','#3a6ae0'];
    }
    return K_.finish(m,['fx','wave','eye','dust','steam']);
  }
  const NAMES={fur:'Pelagem ocre',furD:'Ocre escuro (centro das rosetas)',cream:'Ventre e focinho',ros:'Rosetas',rosF:'Rosetas incandescentes',glow:'Brilho das rosetas',
    rot:'Pele podre',flesh:'Carne exposta',bone:'Osso e costelas',fung:'Musgo e fungo',vine:'Corrente de cipó',nose:'Focinho',mouth:'Boca',claw:'Garras de osso',
    leaf:'Folhagem',mud:'Lama',blood:'Sangue',acid:'Seiva',eye:'Olho',fx:'Rastro',wave:'Onda do rugido',steam:'Vapor'};

  /* ---------------- poses ----------------
     hx: desloca o bicho · by: altura do corpo (− agacha) · tilt: inclinação da coluna (+ frente pra cima) · arch: arco do dorso ·
     stretch: estica a coluna · sag: barriga · nk/nkL: ângulo (lp) e tamanho do pescoço · hd: giro da cabeça (+ focinho pra baixo) ·
     jaw: abre a boca · lip: rosnado · ear: orelha pra trás · squint: olho apertado ·
     ffx/ffy/ffa … hbx/hby/hba: pata (frente-perto, frente-longe, trás-perto, trás-longe): deslocamento x, altura, giro ·
     fwa/hka: ângulo do pulso/metatarso · claw: garras pra fora · tu/tcurl/tipc/tw/tph: cauda ·
     smear/ring/impact/dust/steam/shake: FX · glow/ign: rosetas brilham (intro / fúria) · van/eyes/leaves: some no mato ·
     mud: atolada · moss: musgo cobre o corpo (morte) · dead: olhos apagam */
  const REST={hx:0,by:0,tilt:0,arch:0,stretch:1,sag:0,nk:110,nkL:1,hd:9,jaw:0,lip:0.8,ear:0.3,squint:0.35,
    ffx:0,ffy:0,ffa:0,fbx:0,fby:0,fba:0,hfx:0,hfy:0,hfa:0,hbx:0,hby:0,hba:0,fwa:196,hka:200,claw:0,
    tu:0,tcurl:34,tipc:86,tw:0.25,tph:0,
    smear:0,ring:0,impact:0,dust:0,steam:0,shake:0,glow:0,ign:1,van:0,eyes:1,leaves:0,mud:0,moss:0,dead:0,flash:0};
  // passo de quadrúpede (sequência lateral): [dx, altura, giro da pata]
  function gait(u,A,h,duty=0.62){ u=((u%1)+1)%1; if(u<duty){ const s=u/duty; return [A*(1-2*s),0,0]; }
    const s=(u-duty)/(1-duty), e=0.5-0.5*C(PI*s); return [-A+2*A*e,h*S(PI*s),26*S(PI*s)]; }
  function walkP(ph,A,h){ const a=gait(ph,A,h), b=gait(ph+0.25,A,h), c=gait(ph+0.5,A,h), d=gait(ph+0.75,A,h);
    return {hbx:a[0],hby:a[1],hba:a[2],fbx:b[0],fby:b[1],fba:b[2],hfx:c[0],hfy:c[1],hfa:c[2],ffx:d[0],ffy:d[1],ffa:d[2]}; }
  const LIE={by:-46,tilt:-3,sag:-6,nk:74,nkL:0.82,hd:38,jaw:0.25,ffx:60,ffy:1,ffa:-8,fbx:50,fby:1,fba:-8,hfx:-28,hfy:1,hka:118,hbx:-36,hby:1,fwa:178,
    tw:0,tu:26,tcurl:16,tipc:26,squint:1,ear:1};
  const LIEP=o=>Object.assign({},LIE,o);
  const STALK={by:-24,tilt:-2,nk:98,nkL:0.92,hd:8,sag:-4,tu:16,tcurl:10,tipc:30,tw:0.06,ear:0.3};

  const ANIMS={
    idle:{nome:'Parada (respira, cauda balança, olhos fixos)',n:8,dur:()=>150,pose:i=>{ const p=i/8*PI*2;
      return {by:-9+0.9*S(p),tilt:1+0.5*S(p),arch:-2,sag:1+1.2*S(p+0.8),hd:12+1.6*S(p+0.6),nk:98+2*S(p),jaw:0.08,tph:p,tw:0.35,ear:i===5?0.6:0,
        ffx:0,hfx:0,fbx:-1,hbx:-1}; }},
    walk:{nome:'Andar (baixa, ombros rolando, peso nas patas)',n:8,dur:()=>120,pose:i=>{ const ph=i/8;
      return Object.assign(walkP(ph,15,9),{tilt:1.6*S(PI*4*ph),hd:10+2*S(PI*4*ph+1),nk:102,by:-5-1.6*Math.abs(S(PI*2*ph)),tph:PI*2*ph,tw:0.4,arch:1.2*S(PI*4*ph+0.5)}); }},
    stalk:{nome:'Espreita (agachada, barriga rente, cauda quieta)',n:8,dur:()=>150,pose:i=>{ const ph=i/8;
      return Object.assign(walkP(ph,10,5),STALK,{by:-24+0.8*S(PI*4*ph),hd:8+1.5*S(PI*4*ph),tph:PI*2*ph}); }},
    vanish:{nome:'Some no mato (dissolve, folhas balançam)',n:8,goneAt:6,dur:i=>[110,110,110,100,100,100,120,200][i],pose:i=>
      Object.assign({},STALK,{van:[0,0.12,0.28,0.46,0.64,0.82,1,1][i],leaves:[0.4,0.8,1,1,1,0.85,0.5,0][i],eyes:i<7?1:0,tph:i}) },
    appear:{nome:'Reaparece (olhos primeiro, depois o corpo)',n:8,dur:i=>[160,120,90,80,80,80,100,120][i],pose:i=>
      Object.assign({},STALK,{van:[1,1,0.8,0.58,0.36,0.14,0,0][i],leaves:[0,0.5,1,1,0.8,0.5,0.2,0][i],eyes:1,lip:i>=5?1:0.4,jaw:i>=6?0.25:0,by:i>=6?-28:-24,tph:i}) },
    pounce:{nome:'Bote longo (cauda chicoteia: aviso)',n:12,warn:[0,1,2,3],jump:[4,5,6,7],land:8,
      z:[0,0,0,0,8,24,30,20,4,0,0,0],dur:i=>[200,200,200,200,70,70,70,70,90,140,150,160][i],pose:i=>[
      Object.assign({},STALK,{by:-14,tilt:-6,nk:100,hd:6,hbx:-4,hfx:-4,tu:-20,tcurl:-10,tipc:40,tw:1.2,tph:0,ear:0.5,lip:0.4}),
      Object.assign({},STALK,{by:-20,tilt:-9,nk:98,hd:8,hx:-2,hbx:-5,hfx:-3,hfy:2,tu:-30,tcurl:-20,tipc:30,tw:1.4,tph:1.6,ear:0.7,lip:0.6}),
      Object.assign({},STALK,{by:-22,tilt:-10,nk:96,hd:8,hx:1,hbx:-3,hby:2,hfx:-5,tu:-36,tcurl:-20,tipc:20,tw:1.5,tph:3.2,ear:0.8,lip:0.8}),
      Object.assign({},STALK,{by:-25,tilt:-12,nk:96,hd:6,hx:-1,hbx:-6,hfx:-6,tu:-40,tcurl:-24,tipc:10,tw:1.6,tph:4.8,ear:0.9,lip:1,jaw:0.2}),
      {by:-6,tilt:14,stretch:1.1,ffx:30,ffy:34,ffa:-30,fbx:22,fby:28,fba:-30,hfx:-18,hbx:-26,hby:2,hka:232,nk:110,hd:-6,jaw:0.6,lip:1,claw:1,tu:-40,tcurl:0,tipc:20,tw:0.2,ear:1},
      {by:6,tilt:6,stretch:1.16,ffx:52,ffy:40,ffa:-40,fbx:44,fby:34,fba:-40,hfx:-46,hfy:22,hfa:40,hbx:-54,hby:18,hba:40,hka:252,nk:104,hd:-4,jaw:0.9,lip:1,claw:1,tu:-50,tcurl:-10,tipc:0,tw:0.2,tph:1,smear:1,ear:1},
      {by:6,tilt:2,stretch:1.16,ffx:54,ffy:34,ffa:-30,fbx:46,fby:28,fba:-30,hfx:-48,hfy:24,hfa:44,hbx:-56,hby:20,hba:44,hka:252,nk:102,hd:0,jaw:1,lip:1,claw:1,tu:-46,tcurl:-6,tipc:6,tw:0.2,tph:2,smear:1,ear:1},
      {by:0,tilt:-6,stretch:1.1,ffx:42,ffy:14,ffa:-10,fbx:32,fby:10,fba:-10,hfx:-30,hfy:24,hfa:30,hbx:-40,hby:20,hba:30,hka:236,nk:104,hd:4,jaw:0.8,lip:1,claw:1,tu:-30,tcurl:10,tipc:30,ear:1},
      {by:-16,tilt:-10,stretch:1.04,ffx:28,fbx:20,hfx:-10,hfy:8,hbx:-18,hby:4,nk:100,hd:8,jaw:0.5,lip:1,claw:1,impact:1,dust:1,tu:-10,tcurl:20,tipc:60},
      {by:-10,tilt:-4,ffx:16,fbx:10,hfx:-4,hbx:-10,nk:108,hd:4,jaw:0.3,lip:0.6,claw:0.5,dust:0.5},
      {by:-4,tilt:-1,ffx:6,fbx:4,nk:116,hd:2,lip:0.3},
      {}][i]},
    claw:{nome:'Patada em arco (2 patadas: dentro e fora)',n:9,warn:[0,1],hit:[3,6],reach:66,dur:i=>[130,130,70,90,120,70,90,140,150][i],pose:i=>[
      {tilt:6,by:-4,hx:-3,ffx:-10,ffy:30,ffa:30,claw:0.5,hd:-4,lip:0.6,jaw:0.2,nk:118},
      {tilt:10,by:-2,hx:-5,ffx:-14,ffy:42,ffa:40,claw:1,hd:-8,lip:1,jaw:0.3,nk:122,ear:0.8},
      {tilt:0,by:-8,hx:4,ffx:30,ffy:28,ffa:-30,claw:1,hd:-2,lip:1,jaw:0.5,nk:112,smear:1,ear:1},
      {tilt:-6,by:-12,hx:8,ffx:46,ffy:6,ffa:0,claw:1,hd:4,lip:1,jaw:0.6,nk:106,smear:1,ear:1},
      {tilt:6,by:-6,hx:4,ffx:30,ffy:0,fbx:-10,fby:36,fba:30,claw:1,hd:-4,lip:1,jaw:0.3,nk:116,ear:1},
      {tilt:0,by:-8,hx:6,ffx:30,fbx:34,fby:26,fba:-30,claw:1,hd:0,lip:1,jaw:0.5,nk:110,smear:2,ear:1},
      {tilt:-6,by:-12,hx:9,ffx:30,fbx:50,fby:6,claw:1,hd:4,lip:1,jaw:0.6,nk:106,smear:2,ear:1},
      {tilt:-2,by:-6,hx:5,ffx:18,fbx:26,claw:0.5,hd:2,lip:0.6,jaw:0.2,nk:114},
      {by:-2,hx:2,ffx:6,fbx:8,lip:0.2}][i]},
    roar:{nome:'Rugido (inspira, cabeça atrás, onda que atordoa)',n:10,warn:[0,1,2],hit:5,dur:i=>[200,200,200,120,90,140,140,160,160,150][i],pose:i=>[
      {by:-6,tilt:-4,nk:104,hd:14,sag:4,tw:0.3},
      {by:-8,tilt:-6,nk:100,hd:18,sag:6,lip:0.5,tw:0.3,tph:1},
      {by:-6,tilt:2,nk:120,hd:4,lip:0.8,jaw:0.3,sag:2},
      {by:0,tilt:8,nk:140,hd:-16,jaw:0.9,lip:1,ear:1,ffx:4},
      {by:0,tilt:10,nk:148,hd:-22,jaw:1,lip:1,ring:0.4,ear:1,ffx:4,steam:0.6},
      {by:0,tilt:10,nk:148,hd:-24,jaw:1,lip:1,ring:1,steam:1,shake:1,ear:1,ffx:4},
      {by:0,tilt:10,nk:148,hd:-22,jaw:1,lip:1,ring:1.4,steam:1,shake:-1,ear:1,ffx:4},
      {by:-2,tilt:8,nk:142,hd:-18,jaw:0.8,lip:1,ring:1.8,steam:1,ear:1},
      {by:-2,tilt:3,nk:128,hd:-4,jaw:0.3,lip:0.5,steam:0.5},
      {}][i]},
    maul:{nome:'Mordida na nuca (prende e sacode)',n:10,bite:[3,6],dur:i=>[90,100,80,110,100,90,110,100,120,130][i],pose:i=>{
      const B={by:-14,tilt:-10,nk:92,ffx:26,fbx:18,hfx:-6,hbx:-12,claw:1,lip:1,ear:1,tw:0.8};
      return Object.assign({},B,[
        {by:-12,tilt:-8,nk:96,hd:20,jaw:0.8},
        {by:-16,tilt:-12,nk:90,hd:32,jaw:0.9},
        {hd:36,jaw:0.2},
        {hd:30,jaw:0.1,hx:3,shake:1},
        {hd:42,jaw:0.15,hx:-3,nk:88},
        {hd:26,jaw:0.3,hx:2},
        {hd:34,jaw:0.1,hx:3,shake:1},
        {hd:42,jaw:0.15,hx:-3},
        {by:-8,tilt:-4,nk:104,hd:12,jaw:0.6,claw:0.5},
        {by:-4,tilt:-2,nk:114,hd:4,jaw:0.2,claw:0,lip:0.4,ear:0.3}][i],{tph:i}); }},
    stuck:{nome:'Atolada (patas na lama, debate-se: VULNERÁVEL)',n:8,dur:()=>150,pose:i=>{ const p=i/8*PI*2;
      return {by:-18,tilt:-8+4*S(p),hx:3*S(p*2),ffy:-12,fby:-12,ffx:8,fbx:6,ffa:10,fba:10,hfx:-6+3*S(p),hbx:-8,hd:6+12*S(p+1),nk:108+8*S(p),
        jaw:0.5+0.4*S(p*2),lip:1,ear:1,tw:1.4,tph:p*2,tu:-10,mud:1,squint:0.5}; }},
    dazed:{nome:'Tonta (cambaleia, cabeça pesa)',n:8,dur:()=>170,pose:i=>{ const p=i/8*PI*2;
      return {by:-6+2*S(p*2),hx:3*S(p),tilt:3*S(p),nk:104+6*S(p+1),hd:16+10*S(p),jaw:0.3,squint:1,ear:0.8,tw:0.1,tph:p,
        ffx:4,fbx:-4,hfx:-2,hbx:2,ffa:6*S(p)}; }},
    rage:{nome:'Fúria (rosetas incandescem, olhos de lua, ruge)',n:10,dur:i=>[170,140,140,180,200,200,200,180,160,150][i],pose:i=>[
      {by:-14,tilt:-6,nk:98,hd:18,lip:0.5,ign:0},
      {by:-18,tilt:-8,nk:96,hd:22,lip:1,ign:0.2,hx:-1,shake:1},
      {by:-8,tilt:6,nk:130,hd:4,lip:1,jaw:0.4,ign:0.45,hx:1},
      {by:0,tilt:14,nk:146,hd:-18,jaw:0.9,lip:1,ign:0.7,ring:0.5,ear:1,ffx:6,ffy:6},
      {by:0,tilt:16,nk:150,hd:-24,jaw:1,lip:1,ign:1,ring:1,steam:1,ear:1,ffx:6,ffy:8},
      {by:0,tilt:16,nk:150,hd:-24,jaw:1,lip:1,ign:1.2,ring:1.5,steam:1,ear:1,ffx:6,ffy:8,shake:1},
      {by:0,tilt:14,nk:148,hd:-22,jaw:1,lip:1,ign:1.2,ring:1.9,steam:1,ear:1,ffx:6,ffy:6,shake:-1},
      {by:-2,tilt:8,nk:136,hd:-10,jaw:0.6,lip:1,ign:1.1,steam:0.6},
      {by:-2,tilt:3,nk:126,hd:-2,jaw:0.2,lip:0.6,ign:1},
      {ign:1}][i]},
    hurt:{nome:'Dano',n:4,dur:i=>[80,110,130,160][i],pose:i=>[
      {flash:1,hx:-8,tilt:8,hd:-14,jaw:0.5,lip:1,ear:1,squint:1,tw:1,ffx:-4,ffy:6},
      {hx:-6,tilt:5,hd:-8,jaw:0.4,lip:0.8,ear:1,squint:1,tw:0.8,ffx:-3},
      {hx:-2,tilt:2,hd:-2,jaw:0.1,lip:0.3},
      {}][i]},
    intro:{nome:'Entrada (WARNING): salta da sapopema, rosna, rosetas brilham e ruge',n:14,dur:i=>[110,110,110,130,180,200,200,180,200,220,200,260,240,200][i],pose:i=>{
      if(i<3){ const by=[40,26,12][i]; return {by,tilt:-18+i*4,stretch:1.1,ffx:30,ffy:by+18-i*6,ffa:-30,fbx:22,fby:by+14-i*6,fba:-30,hfx:-36,hfy:by+6,hfa:30,hbx:-44,hby:by+4,hba:30,hka:240,
        nk:110,hd:4,jaw:0.6,lip:1,claw:1,tu:40,tcurl:20,tipc:60,ear:1,smear:1}; }
      return [
        {by:-18,tilt:-8,ffx:20,fbx:14,hfx:-6,hbx:-12,nk:100,hd:8,jaw:0.4,lip:1,claw:1,impact:1,dust:1,ear:1},
        Object.assign({},STALK,{by:-20,nk:98,hd:10,lip:1,jaw:0.2,ear:1}),
        Object.assign({},STALK,{by:-20,nk:98,hd:10,lip:1,jaw:0.3,glow:0.6,ear:1,tph:1}),
        Object.assign({},STALK,{by:-18,nk:100,hd:6,lip:1,jaw:0.3,glow:1,ear:1,tph:2}),
        Object.assign({},STALK,{by:-14,nk:106,hd:4,lip:1,jaw:0.3,glow:1,ear:0.6,tph:3}),
        {by:0,tilt:6,nk:130,hd:-8,jaw:0.5,lip:1,glow:1,tw:0.6},
        {by:0,tilt:10,nk:146,hd:-22,jaw:1,lip:1,ring:0.6,steam:0.8,glow:1,ear:1,ffx:4},
        {by:0,tilt:10,nk:148,hd:-24,jaw:1,lip:1,ring:1.2,steam:1,glow:1,ear:1,ffx:4,shake:1},
        {by:0,tilt:10,nk:148,hd:-24,jaw:1,lip:1,ring:1.8,steam:1,glow:1,ear:1,ffx:4,shake:-1},
        {by:-2,tilt:4,nk:128,hd:-4,jaw:0.4,lip:0.6,glow:0.5,steam:0.4},
        {}][i-3]; }},
    fall:{nome:'Derrubada (tomba de lado)',n:6,dur:i=>[90,120,120,160,200,200][i],pose:i=>[
      {flash:1,hx:-6,tilt:8,hd:-12,jaw:0.5,ear:1,squint:1},
      {hx:-4,by:-18,tilt:4,hd:10,nk:104,jaw:0.4,ear:1,squint:1,ffx:10,hfx:-8},
      LIEP({by:-38,impact:0.4}),
      LIEP({impact:1,dust:1}),
      LIEP({}),
      LIEP({hd:34})][i]},
    getup:{nome:'Levanta',n:6,dur:i=>[140,140,140,140,140,150][i],pose:i=>[
      LIEP({hd:30}),
      LIEP({by:-38,nk:90,hd:20}),
      {by:-28,tilt:-6,nk:98,hd:12,ffx:16,fbx:10,hfx:-8,hbx:-10,squint:0.6},
      {by:-18,tilt:-4,nk:106,hd:8,ffx:8,hfx:-4},
      {by:-6,tilt:-1,nk:116,hd:2},
      {}][i]},
    death:{nome:'Morte longa (tomba, o musgo cobre o corpo, olhos apagam)',n:14,dur:i=>[90,140,160,160,170,200,220,240,260,280,300,320,400,700][i],pose:i=>{
      if(i>=5) return LIEP({moss:[0,0.08,0.2,0.34,0.5,0.66,0.82,0.94,1][i-5],dead:[0,0,0.1,0.25,0.4,0.6,0.8,0.95,1][i-5],impact:i===5?1:0,dust:i===5?1:0,
        jaw:i>=8?0.15:0.25,hd:38+Math.min(4,i-5)});
      return [
        {flash:1,hx:-8,tilt:10,hd:-16,jaw:0.7,lip:1,ear:1,squint:1,tw:1},
        {hx:-6,tilt:14,nk:146,hd:-24,jaw:1,lip:0.6,ear:1,squint:1,ffy:6,steam:0.6},
        {hx:-4,by:-8,tilt:4,nk:112,hd:12,jaw:0.5,ear:1,squint:1,ffx:8,fbx:-6,hfx:-6},
        {hx:-2,by:-22,tilt:-2,nk:98,hd:24,jaw:0.4,ear:1,squint:1,ffx:18,fbx:6,hfx:-14,hka:180},
        {by:-34,tilt:-3,nk:86,hd:32,jaw:0.3,ear:1,squint:1,ffx:36,fbx:24,hfx:-22,hka:150,sag:-4}][i]; }},
    xEyes:{nome:'Olhos na folhagem (sinal da emboscada)',n:4,prop:true,dur:()=>140,pose:i=>({st:i})},
  };

  /* ---------------- esqueleto quadrúpede ---------------- */
  const SP=104, NK=22, U1=30, U2=31, T1=30, T2=31, MT=23, WR=10, HS=1.2, HX=1.0, HY=1.0;
  function ik2(A,B,L1,L2,sg){ const dx=B.x-A.x, dy=B.y-A.y, d0=Math.hypot(dx,dy)||1e-3, d=Math.max(Math.abs(L1-L2)+0.5,Math.min(L1+L2-0.3,d0));
    const base=Math.atan2(dy,dx), a=Math.acos(Math.max(-1,Math.min(1,(L1*L1+d*d-L2*L2)/(2*L1*d))));
    return {J:{x:A.x+C(base+sg*a)*L1,y:A.y+S(base+sg*a)*L1}, E:{x:A.x+C(base)*d,y:A.y+S(base)*d}}; }
  function skeleton(P){
    const t=rad(P.tilt), dv={x:C(t),y:-S(t)}, nv={x:S(t),y:C(t)}, L=SP*P.stretch;
    const H={x:AX-52+P.hx, y:GROUND-68-P.by};
    const ar=(lx,ly)=>ly-P.arch*S(PI*Math.max(0,Math.min(1,lx/L)));
    const T=(lx,ly)=>{ const y=ar(lx,ly); return {x:H.x+dv.x*lx+nv.x*y, y:H.y+dv.y*lx+nv.y*y}; };
    const Sh=T(L+2,2), ShB=T(L-6,0), HB=T(-6,-2);
    const front=(Sx,x0,dx,lift,pa)=>{ const Pc={x:AX+x0+P.hx+dx,y:GROUND-lift}, W0=lp(Pc,P.fwa,WR), r=ik2(Sx,W0,U1,U2,1), off={x:r.E.x-W0.x,y:r.E.y-W0.y};
      return {S:Sx,E:r.J,W:r.E,Pc:{x:Pc.x+off.x,y:Pc.y+off.y},pa}; };
    const hind=(Hx,x0,dx,lift,pa)=>{ const Pc={x:AX+x0+P.hx+dx,y:GROUND-lift}, K0=lp(Pc,P.hka,MT), r=ik2(Hx,K0,T1,T2,-1), off={x:r.E.x-K0.x,y:r.E.y-K0.y};
      return {S:Hx,E:r.J,W:r.E,Pc:{x:Pc.x+off.x,y:Pc.y+off.y},pa}; };
    const ff=front(Sh,56,P.ffx,P.ffy,P.ffa), fb=front(ShB,44,P.fbx,P.fby,P.fba);
    const hf=hind(H,-50,P.hfx,P.hfy,P.hfa), hb=hind(HB,-62,P.hbx,P.hby,P.hba);
    const NB=T(L+4,-12), HJ=lp(NB,P.nk,NK*P.nkL), ha=rad(P.hd);
    const Hd=(lx,ly)=>{ lx*=HX; ly*=HY; return {x:HJ.x+(lx*C(ha)-ly*S(ha))*HS, y:HJ.y+(lx*S(ha)+ly*C(ha))*HS}; };
    const TB=T(-22,-12);
    return {H,L,t,T,ar,Sh,ShB,HB,ff,fb,hf,hb,NB,HJ,ha,Hd,TB,P};
  }

  /* ---------------- utilidades de desenho ---------------- */
  const pt=(a)=>[a.x,a.y];
  // roseta: anel quebrado de manchas com centro mais escuro e 1–2 pintas
  function rosette(p,M,RO,cx,cy,r,seed,solid){
    if(solid){ p.F(RO[1]); p.ell(cx,cy,r*0.6,r*0.48,rnd(seed,1)*3); return; }
    p.F(M.furD[1]); p.ell(cx,cy,r*0.8,r*0.66,rnd(seed,2)*3);
    const nb=5+Math.floor(rnd(seed,3)*2), gap=Math.floor(rnd(seed,4)*nb), a0=rnd(seed,6)*PI*2;
    p.F(RO[1]);
    for(let k=0;k<nb;k++){ if(k===gap&&rnd(seed,5)<0.5) continue; const a=a0+k/nb*PI*2, x=cx+C(a)*r, y=cy+S(a)*r*0.82; p.ell(x,y,r*0.4,r*0.24,a+PI/2); }
    const nd=rnd(seed,7)<0.45?1:0; for(let k=0;k<nd;k++) p.ell(cx+(rnd(seed,8+k)-0.5)*r*0.5,cy+(rnd(seed,10+k)-0.5)*r*0.36,r*0.16,r*0.14);
  }
  function rosOf(M,P,form){ const fur=form==='furia'||form==='plenilunar'; if(fur) return P.ign>0.5?M.rosF:(P.ign>0.2?M.glow:M.ros); return P.glow>0.5?M.glow:M.ros; }
  // tufos de pelo desgrenhado numa borda (lista de pontos, normal pra fora)
  function tufts(p,R,pts,len,seed){ for(let k=0;k<pts.length-1;k++){ const a=pts[k], b=pts[k+1], dx=b[0]-a[0], dy=b[1]-a[1], L=Math.hypot(dx,dy)||1, nx=dy/L, ny=-dx/L, m=[(a[0]+b[0])/2,(a[1]+b[1])/2], l=len*(0.6+0.7*rnd(seed,k));
    p.F(R); p.poly([[a[0]+dx*0.15,a[1]+dy*0.15],[m[0]+nx*l+dx*0.25,m[1]+ny*l+dy*0.25],[b[0]-dx*0.15,b[1]-dy*0.15]]); } }
  function fungus(p,M,x,y,s,seed){ const F=M.fung;
    for(let k=0;k<6;k++){ const a=rnd(seed,k)*PI*2, d=rnd(seed,k+6)*5*s, cx=x+C(a)*d, cy=y+S(a)*d*0.6-1, r=(1.6+rnd(seed,k+12)*1.8)*s;
      p.F(F[3]); p.circle(P2(cx+0.5,cy+0.7),r); p.F(F[2]); p.circle(P2(cx,cy),r); p.F(F[1]); p.circle(P2(cx-r*0.25,cy-r*0.3),r*0.65); p.F(F[0]); p.rect(cx-r*0.5,cy-r*0.6,1,1); } }
  function steamPuffs(p,M,o,P){ const k=P.steam, t=P.t; puffs(p,M.steam,o.x+6,o.y-2,[[2+t%3,-4,4*k,3*k],[8+t%2*2,-9,5*k,3.6*k],[14,-15-t%3,6*k,4*k],[4,-14,3*k,2.4*k]]); }

  /* ---------------- tronco ---------------- */
  function torsoPts(L,P){ const sg=P.sag;
    return [[-27,-6],[-23,-18],[-8,-24],[L*0.3,-21],[L*0.6,-21],[L*0.84,-30],[L+2,-35],[L+16,-24],[L+23,-6],[L+22,10],[L+14,28],[L,37],[L*0.74,33+sg*0.5],[L*0.5,25+sg],[L*0.28,21+sg*0.5],[4,22],[-14,19],[-24,9]]; }
  function drawTorso(p,M,sk,P,form){
    const L=sk.L, A=-sk.t, RO=rosOf(M,P,form), fur=form==='furia'||form==='plenilunar';
    p.xf(A,sk.H.x,sk.H.y);
    const ar=(q)=>[q[0],sk.ar(q[0],q[1])], pts=torsoPts(L,P).map(ar), Ar=a=>a.map(ar);
    p.F(M.fur[1]); p.poly(pts);
    clipPoly(pts,()=>{
      // massas de anca e ombro (dentro do tronco: uma massa contínua)
      mass(p,M.fur,0,2,26,22,A,1); mass(p,M.fur,L+4,-4,22,26,A,1,0.2);
      // luz quente no dorso (larga), sombra fria roxa embaixo (grande)
      p.F(M.furQ[0]); p.poly(Ar([[-30,-30],[L+30,-34],[L+30,-14],[L*0.82,-16],[L*0.6,-13],[L*0.3,-13],[-30,-12]]));
      p.F(M.fur[0]); p.poly(Ar([[-14,-23],[L*0.3,-22],[L*0.62,-22],[L*0.84,-28],[L+4,-31],[L+10,-26],[L*0.84,-21],[L*0.6,-17],[L*0.3,-17],[-12,-18]]));
      p.F(M.furQ[1]); p.poly(Ar([[-30,4],[L*0.2,9],[L*0.5,11],[L*0.8,10],[L+30,4],[L+30,40],[-30,40]]));
      p.F(M.furQ[2]); p.poly(Ar([[-30,11],[L*0.2,15],[L*0.5,17],[L*0.8,17],[L+30,12],[L+30,40],[-30,40]]));
      // escápula marcada (borda clara na frente, vinco frio atrás) e vinco da anca
      p.F(M.furQ[2]); bandA(p,Ar([[L-18,-24],[L-14,-12],[L-12,0],[L-6,12]]),2.6);
      p.F(M.fur[2]); bandA(p,Ar([[L-17,-23],[L-13,-12],[L-11,-1]]),1.2);
      p.F(M.fur[0]); bandA(p,Ar([[L-12,-28],[L+2,-30],[L+12,-22],[L+16,-12]]),2.2);
      p.F(M.furQ[2]); bandA(p,Ar([[16,-20],[20,-8],[20,4],[16,16]]),2.4); p.F(M.fur[0]); bandA(p,Ar([[-20,-18],[-6,-22],[8,-21]]),2);
      // rosetas: padrão dominante (grade com sorteio); some só no rasgo
      const wx=L*0.5, wy=2;
      let s=0; for(let y=-20;y<30;y+=15){ const row=Math.round((y+20)/15); for(let x=-24;x<L+22;x+=18){ s++; const xx=x+(row&1)*9+(rnd(s,1)-0.5)*5, yy=y+(rnd(s,2)-0.5)*3, r=7.6+rnd(s,3)*2;
        if(Math.abs(xx-wx)<16&&Math.abs(yy-wy)<12) continue; const belly=yy>13+(xx>L-6?6:0); if(belly) continue;
        const q=ar([xx,yy]); rosette(p,M,RO,q[0],q[1],r,s,xx>L+12); } }
      p.F(RO[1]); for(let k=0;k<7;k++){ const q=ar([-14+k*(L+10)/6,-21]); p.ell(q[0],q[1],3.6,2.2); }
      // peito e ventre claros com pintas (borda de baixo em sombra fria)
      const cr=Ar([[L+24,0],[L+21,12],[L+14,28],[L,38],[L*0.74,34+P.sag*0.5],[L*0.5,26+P.sag],[L*0.28,22],[4,23],[6,16],[L*0.28,17],[L*0.5,20+P.sag*0.7],[L*0.74,22],[L-2,20],[L+10,12],[L+18,2]]);
      p.F(M.cream[1]); p.poly(cr); clipPoly(cr,()=>{ p.F(M.cream[0]); p.poly(Ar([[L+12,4],[L+20,2],[L+18,14],[L+8,20],[L-4,20]]));
        p.F(M.cream[2]); p.poly(Ar([[0,22],[L*0.28,20],[L*0.5,23+P.sag],[L*0.74,30],[L,34],[L+16,24],[L+26,30],[L+26,44],[0,44]]));
        p.F(M.cream[3]); p.poly(Ar([[0,25],[L*0.5,27+P.sag],[L,38],[L+20,30],[L+26,44],[0,44]]));
        p.F(RO[1]); [[L*0.3,19],[L*0.42,22],[L*0.56,23],[L*0.68,26],[L*0.8,25],[L*0.9,30],[L+6,26],[L+12,18],[L+16,10],[L*0.18,20]].forEach(([x,y],k)=>{ const q=ar([x,y]); p.ell(q[0],q[1],2.6+rnd(k,4),1.8); }); });
      // rasgo no flanco (~1/4 do comprimento): carne escura, 3 costelas curtas, borda de pelo rasgado
      const W=Ar([[wx-13,-2],[wx-9,-8],[wx-4,-6],[wx,-10],[wx+5,-6],[wx+11,-7],[wx+13,0],[wx+10,5],[wx+11,10],[wx+4,8],[wx-2,11],[wx-7,7],[wx-12,6]]);
      p.F(M.rot[2]); p.poly(W); clipPoly(W,()=>{ p.F(M.flesh[3]); p.poly(Ar([[wx-10,-2],[wx-5,-5],[wx+2,-6],[wx+9,-4],[wx+10,3],[wx+6,7],[wx-3,8],[wx-9,4]]));
        p.F(M.flesh[2]); p.ell(...ar([wx-1,-2]),6,2.6); p.F(M.flesh[1]); p.ell(...ar([wx+1,-3.4]),2.6,1);
        for(let k=0;k<3;k++){ const x=wx-6+k*6; p.F(M.bone[2]); bandA(p,Ar([[x,-6],[x+2,0],[x+1,6]]),2.2); p.F(M.bone[1]); bandA(p,Ar([[x-0.3,-5],[x+1.4,0]]),1.1); } });
      const rim=[[wx-13,-2],[wx-9,-8],[wx-4,-6],[wx,-10],[wx+5,-6],[wx+11,-7],[wx+13,0],[wx+10,5],[wx+11,10],[wx+4,8],[wx-2,11],[wx-7,7],[wx-12,6],[wx-13,-2]];
      tufts(p,M.fur[1],Ar(rim.slice(0,7).reverse()),3.2,3); tufts(p,M.furQ[1],Ar(rim.slice(6).reverse()),3,5);
      stain(p,M.blood,...ar([wx+3,9]),2.2,2,7);
      // cicatrizes no ombro
      p.F(M.cream[2]); bandA(p,Ar([[L-2,-20],[L+10,-10]]),1.2); p.F(M.flesh[2]); bandA(p,Ar([[L-1,-19],[L+8,-11]]),0.6);
    });
    // vértebras furando o dorso (fúria: espinha inteira)
    const n=fur?8:3, x0=fur?-4:L*0.32, x1=fur?L*0.9:L*0.62;
    for(let k=0;k<n;k++){ const x=x0+(x1-x0)*(n>1?k/(n-1):0), top=sk.ar(x,-22)+1, h=fur?(5+5*S(PI*k/(n-1))):4.5;
      p.F(M.flesh[2]); p.ell(x,top+1,4.4,2.4); p.F(M.bone[2]); p.poly([[x-3.2,top+1],[x+0.6,top-h],[x+3.4,top+1]]); p.F(M.bone[1]); p.poly([[x-2,top+0.6],[x+0.6,top-h+1.4],[x+1.6,top+0.4]]); p.F(M.bone[0]); p.rect(x,top-h+2,1,1.6); }
    // fungo no ombro e na anca
    fungus(p,M,...ar([L-2,-28]),1.1,11); fungus(p,M,...ar([L*0.86,-27]),0.8,17); fungus(p,M,...ar([-16,-20]),0.9,23);
  }

  /* ---------------- pescoço (corrente de cipó) ---------------- */
  function drawNeck(p,M,sk,P,form){
    const RO=rosOf(M,P,form), a=sk.NB, b=sk.HJ, ang=Math.atan2(b.y-a.y,b.x-a.x), Lh=Math.hypot(b.x-a.x,b.y-a.y);
    p.xf(ang,a.x,a.y);
    const N=[[-14,-17],[Lh*0.5,-16],[Lh+4,-14],[Lh+10,-2],[Lh+6,14],[Lh*0.5,18],[-8,21],[-18,8]];
    platePoly(p,M.fur,N,ang,1);
    clipPoly(N,()=>{ mass(p,M.fur,Lh*0.4,-4,16,14,ang,0.8);
      // garganta creme do lado de baixo (em relação ao chão)
      const dn=C(ang)>=0?1:-1; p.F(M.cream[1]); p.poly([[-16,8*dn],[Lh+8,5*dn],[Lh+8,22*dn],[-16,22*dn]]); p.F(M.cream[2]); p.poly([[-16,15*dn],[Lh+8,13*dn],[Lh+8,24*dn],[-16,24*dn]]);
      [[2,-8],[12,-12],[Lh-2,-9],[6,2],[Lh*0.6,-2]].forEach(([x,y],k)=>rosette(p,M,RO,x,y,4.4,k+40,k>2));
      p.F(RO[1]); [[Lh*0.3,8],[Lh*0.7,10],[-4,12]].forEach(([x,y])=>p.ell(x,y*(C(ang)>=0?1:-1),1.8,1.4));
    });
    tufts(p,M.fur[2],[[Lh+6,14],[Lh*0.5,18],[-8,21]],3.6,9);
    // corrente de cipó enrolada (2 voltas) + ponta solta
    const V=M.vine, vx=Lh*0.42;
    [[vx-3,0],[vx+4,1]].forEach(([x,o],k)=>{ const pts=[]; for(let j=0;j<=8;j++){ const u=j/8; pts.push(P2(x+3*S(u*PI)+o,-18+u*38)); }
      p.F(V[3]); band(p,pts,4.2); p.F(V[1]); band(p,pts,2.8); p.F(V[0]); band(p,pts.slice(1,4).map(q=>P2(q.x-0.6,q.y)),0.9);
      for(let j=1;j<8;j+=2){ p.F(V[2]); p.cap(P2(pts[j].x-1.6,pts[j].y-1),P2(pts[j].x+1.6,pts[j].y+1),1,1); } });
    const hang=[P2(vx+2,18),P2(vx+1,26),P2(vx+4,33),P2(vx+2,40)]; p.F(V[3]); band(p,hang,3); p.F(V[1]); band(p,hang,1.8);
    p.F(M.leaf[2]); p.ell(vx+5,40,3.4,1.8,0.6); p.F(M.leaf[1]); p.ell(vx+4.6,39.4,2.4,1.1,0.6);
    fungus(p,M,vx+6,-15,0.7,31);
  }

  /* ---------------- cabeça ---------------- */
  const HEAD=[[-8,-4],[-7,-12],[-2,-18],[8,-21],[18,-20.6],[27,-17],[34,-14],[40,-10.6],[44,-7],[44.6,0],[42,4.6],[35,7],[26,8],[18,9],[14,15],[8,20],[0,19],[-6,10]];
  const JAW=[[11,8],[26,8],[36,8],[38,11],[35,16],[26,20],[16,21],[9,17]];
  const jawA=P=>rad(P.jaw*34);
  const rotAt=(q,a,o)=>{ const c=C(a), s=S(a), x=q[0]-o[0], y=q[1]-o[1]; return [o[0]+x*c-y*s, o[1]+x*s+y*c]; };
  const HINGE=[11,7];
  function drawJaw(p,M,sk,P){
    p.xf(sk.ha,sk.HJ.x,sk.HJ.y); K_.st.CTX.scale(HS*HX,HS*HY); const a=jawA(P), J=JAW.map(q=>rotAt(q,a,HINGE));
    if(P.jaw>0.08){ // boca por dentro
      const U=[[14,9],[26,8],[36,7]], Jt=[[36,8],[26,8],[14,9]].map(q=>rotAt(q,a,HINGE));
      p.F(M.mouth[3]); p.poly(U.concat(Jt)); p.F(M.mouth[2]); p.poly([[16,9],[30,8.4]].concat([[30,9],[17,9.6]].map(q=>rotAt(q,a,HINGE))));
      p.F(M.mouth[1]); const tg=[[17,11],[28,10],[33,11],[30,13],[20,13]].map(q=>rotAt(q,a,HINGE)); p.poly(tg); p.F(M.mouth[0]); p.rect(...rotAt([24,10.4],a,HINGE),3,1); }
    platePoly(p,M.fur,J,sk.ha,0.6);
    clipPoly(J,()=>{ p.F(M.cream[1]); p.poly([[14,11],[36,10],[38,12],[30,19],[12,19]].map(q=>rotAt(q,a,HINGE))); p.F(M.cream[2]); p.poly([[12,16],[30,16],[24,20],[12,20]].map(q=>rotAt(q,a,HINGE)));
      p.F(M.ros[1]); [[20,12],[24,13],[28,12]].forEach(q=>{ const r=rotAt(q,a,HINGE); p.rect(r[0],r[1],1.2,1); }); });
    // dentes de baixo (canino sujo) quando abre
    if(P.jaw>0.15){ const c0=rotAt([32,9],a,HINGE), c1=rotAt([32.6,3],a,HINGE); p.F(M.bone[2]); p.cap(P2(c0[0],c0[1]),P2(c1[0],c1[1]),2.6,0.8); p.F(M.bone[0]); p.cap(P2(c0[0]-0.3,c0[1]),P2(c1[0]-0.2,c1[1]+1),1,0.5);
      [[26,8.6],[29,8.4],[35,8.2]].forEach(q=>{ const r=rotAt(q,a,HINGE); p.F(M.bone[1]); p.rect(r[0]-0.6,r[1]-1.6,1.4,1.6); }); }
  }
  function drawHead(p,M,sk,P,form){
    const fur=form==='furia'||form==='plenilunar';
    p.xf(sk.ha,sk.HJ.x,sk.HJ.y); K_.st.CTX.scale(HS*HX,HS*HY); const A=sk.ha;
    // orelha (atrás da cabeça): curta e redonda, costas escuras com mancha clara
    const eb=P.ear, ex=-3-eb*3, ey=-16+eb*3;
    p.F(M.ros[2]); p.ell(ex,ey,5.2-eb,4.6-eb*1.2,-0.3-eb*0.7); p.F(M.ros[1]); p.ell(ex+0.5,ey-0.3,4-eb,3.6-eb,-0.3-eb*0.7);
    p.F(M.cream[1]); p.ell(ex-0.4,ey+0.6,2.4,2,-0.3); p.F(M.fur[2]); p.ell(ex+2.4,ey+1.4,3,3.4,-0.3);
    p.F(M.flesh[2]); p.poly([[ex-4,ey-4],[ex-2,ey-6.4],[ex-1,ey-3.4]]); // orelha rasgada
    p.F(M.fur[1]); p.poly(HEAD);
    clipPoly(HEAD,()=>{
      p.F(M.fur[0]); p.ell(18,-16,9,5,-0.3);
      // sombra fria embaixo da bochecha
      p.F(M.furQ[1]); p.poly([[-10,-2],[4,2],[16,4],[28,2],[44,0],[44,20],[-10,20]]); p.F(M.fur[2]); p.poly([[-10,6],[6,9],[16,9],[24,8],[24,20],[-10,20]]); p.F(M.fur[3]); p.poly([[-10,12],[4,14],[12,13],[12,20],[-10,20]]); p.F(M.furQ[2]); p.poly([[-10,-14],[-4,-8],[-6,4],[-10,6]]);
      // testa clara, ponte do nariz
      p.F(M.fur[0]); p.poly([[6,-25],[18,-23.4],[30,-16],[38,-11],[36,-9.6],[26,-14],[14,-20],[4,-22]]);
      // creme: focinho, almofada dos bigodes, embaixo do olho
      p.F(M.cream[1]); p.poly([[31,-4],[38,-3],[43,0],[41,5],[35,7.4],[29,6]]); p.poly([[23,-8],[30,-8],[33,-6],[28,-5],[22,-6]]);
      p.F(M.cream[0]); p.poly([[34,-3],[37,-2.6],[38,-0.6],[35.6,-0.4]]); p.F(M.cream[2]); p.poly([[30,4],[36,5.6],[41,4.4],[40,6],[35,8],[29,7]]);
      // pintas sólidas da cabeça
      p.F(M.ros[1]); for(let y=-19;y<12;y+=2.6) for(let x=-6;x<30;x+=2.8){ const k=x*3.1+y*7.7, xx=x+(Math.floor((y+19)/2.6)&1)*1.4+(rnd(k,1)-0.5), yy=y+(rnd(k,2)-0.5);
        if(xx>20&&yy>-14&&yy<-5) continue; if(xx>26&&yy>-6) continue; if(rnd(k,3)<0.35) continue; const r=0.7+rnd(k,4)*0.7*(xx<12?1.4:1); p.ell(xx,yy,r,r*0.8); }
      [[34,0],[36,2.6],[38,0.6]].forEach(([x,y])=>p.rect(x,y,1,1));
      // linha do canto do olho até o focinho, linha da boca
      p.F(M.ros[2]); bandA(p,[[32,-8],[33,-4],[31,2]],1); bandA(p,[[36,7],[28,8],[19,9]],1.2);
      // osso do crânio exposto (corrupção)
      p.F(M.rot[2]); p.poly([[0,-17],[3,-21],[8,-22],[11,-19],[9,-15],[5,-16],[2,-13]]); p.F(M.bone[1]); p.poly([[2,-17],[4,-20],[8,-20.6],[9.6,-18.6],[7,-17],[4,-15.6]]); p.F(M.bone[0]); p.rect(4,-19.6,3,1); p.F(M.bone[3]); bandA(p,[[5,-20],[6,-18],[5.4,-16.4]],0.6); p.F(M.flesh[2]); p.rect(9,-16,1.2,1.4);
      // cicatriz no focinho
      p.F(M.flesh[2]); bandA(p,[[24,-15],[30,-5]],0.9);
      // rosnado: rugas no focinho
      if(P.lip>0.3){ p.F(M.fur[3]); bandA(p,[[34,-11],[37,-8.6]],0.8); bandA(p,[[32,-10],[35,-7]],0.8); }
    });
    // olho: órbita funda + íris de lua
    const sq=P.squint;
    p.F(M.furD[3]); p.poly([[22,-12],[26,-15.4],[32,-14],[34,-10.6],[28,-9]]);
    p.F(M.ros[2]); bandA(p,[[21,-13],[26,-15],[31,-14.4],[35,-11.6]],2.6); p.F(M.fur[0]); bandA(p,[[21,-16.4],[26,-18],[31,-17]],1.2);
    if(P.dead<0.6){ const h=Math.max(0.6,2.6*(1-sq*0.6)); p.F(M.mouth[3]); p.ell(28.6,-11.6,3.6,h+0.4); }
    p.F(M.cream[0]); bandA(p,[[23,-9],[28,-8.4],[32,-9.4]],0.9);
    // nariz
    p.F(M.nose[2]); p.poly([[38,-9],[43.6,-7],[44.4,-3],[42,-1.6],[38.4,-4.6]]); p.F(M.nose[1]); p.poly([[39,-8.4],[43,-6.6],[43,-4],[40,-5]]); p.F(M.nose[0]); p.rect(40,-8,2,1);
    p.F(M.nose[3]); p.rect(42.6,-3.4,1.4,1.2);
    // lábio levantado no rosnado (gengiva)
    if(P.lip>0.3){ p.F(M.mouth[2]); p.poly([[24,8],[37,6.6],[37,8.6],[24,9.6]]); p.F(M.mouth[1]); p.rect(28,7.6,6,0.9); }
    // caninos de cima (sujos) e incisivos
    const op=P.jaw>0.15, cl=op?10:5+P.lip*2;
    p.F(M.bone[2]); p.cap(P2(32.6,7),P2(33.4,7+cl),3,0.9); p.F(M.bone[0]); p.cap(P2(32.2,7.4),P2(32.8,6+cl),1.1,0.5); p.F(M.mud[2]); p.rect(33,8+cl*0.4,1,1.4);
    if(op||P.lip>0.3){ p.F(M.bone[1]); [35.2,36.8,38.4].forEach(x=>p.rect(x,7,1.2,1.8)); p.F(M.bone[2]); p.cap(P2(24,8.4),P2(24.6,11.6),2,0.8); }
    // bigodes
    p.F(M.cream[0]); [[38,2,48,0],[38,3.6,47,5],[37,1,46,-3]].forEach(([a,b,c,d])=>p.cap(P2(a,b),P2(c,d),0.7,0.5));
  }
  // brilho do olho: peça sem sombra/rim (lua)
  function drawEye(p,M,sk,P,form){
    if(P.dead>=0.95||P.eyes<=0) return; const fur=form==='furia'||form==='plenilunar', E=sk.Hd(28.8,-11.8), g=1-P.dead, sq=P.squint;
    p.id(); const hr=(fur?4.6:3.8)*g, ro=-0.18+sk.ha;
    if(sq<0.8){ p.F(M.eye[3]); p.ell(E.x,E.y+0.4,hr,hr*0.55,ro); p.F(M.eye[2]); p.ell(E.x,E.y+0.3,3*g,Math.max(0.7,1.3*(1-sq*0.6))*g,ro); p.F(M.eye[1]); p.ell(E.x+0.5,E.y+0.2,1.9*g,Math.max(0.5,0.8*(1-sq*0.6))*g,ro); p.F(M.eye[0]); p.rect(E.x,E.y-1,1.4,1.2);
      if(!fur){ p.F(M.ros[3]); p.circle(P2(E.x+0.9,E.y+0.1),0.9*g); p.F(M.eye[0]); p.rect(E.x+0.2,E.y-1,1,1); }
      if(fur&&g>0.5){ p.F(M.eye[2]); p.cap(P2(E.x-2,E.y),P2(E.x-9,E.y-1.4),2,0.6); p.F(M.eye[1]); p.cap(P2(E.x-1,E.y),P2(E.x-6,E.y-0.8),1,0.4); } }
    else { p.F(M.eye[2]); p.cap(P2(E.x-2.6,E.y),P2(E.x+2.6,E.y-0.4),1.4,1.2); p.F(M.eye[1]); p.rect(E.x-1,E.y-0.6,2,1); }
  }

  /* ---------------- patas ---------------- */
  function spotsOn(p,R,L,w,seed,n){ for(let k=0;k<n;k++){ const u=0.15+0.75*rnd(seed,k), v=(rnd(seed,k+20)-0.5)*w*0.7; p.F(R); p.ell(L*u,v,1.6+rnd(seed,k+40)*1.2,1.2+rnd(seed,k+41)*0.8); } }
  function drawPaw(p,M,Pc,pa,claw,big,front){
    p.xf(rad(pa),Pc.x,Pc.y); const R=M.fur, s=big;
    p.F(R[2]); p.ell(3*s,-4.6*s,10*s,5.8*s); p.F(R[1]); p.ell(2.6*s,-5.4*s,8.6*s,4.6*s); p.F(R[0]); p.ell(1*s,-7.6*s,5*s,1.8*s);
    p.F(M.cream[1]); p.ell(6*s,-2.6*s,6*s,2.6*s);
    p.F(R[3]); [4,8,11.4].forEach(x=>p.rect(x*s,-6*s,1,4*s)); // separação dos dedos
    p.F(M.ros[1]); p.ell(-2*s,-7*s,1.6,1.2); p.ell(3*s,-8.4*s,1.4,1);
    if(claw>0.2){ [5.6,9.6,13].forEach((x,k)=>{ const tip=P2(x*s+3.4*claw,-1.4*s+2.4*claw); p.F(M.claw[2]); p.cap(P2(x*s,-3.6*s),tip,2.4,0.7); p.F(M.claw[0]); p.cap(P2(x*s-0.2,-3.8*s),P2(tip.x-0.8,tip.y-0.8),1,0.4); }); }
    else if(front){ p.F(M.claw[2]); [6,10,13.4].forEach(x=>p.rect(x*s,-1.6*s,1.2,1)); }
  }
  // membro de cima: rosetas e sombra fria do lado de trás, recortadas na forma do osso (continua o padrão do tronco)
  function capFur(p,M,RO,L,w,seed){ K_.clipEll(L*0.5,0,L*0.5+w*0.35,w*0.5,0,()=>{ p.F(M.furQ[1]); p.poly([[-20,w*0.12],[L+20,w*0.18],[L+20,w],[-20,w]]); p.F(M.fur[0]); p.poly([[-20,-w],[L+20,-w],[L+20,-w*0.34],[-20,-w*0.3]]);
    [[0.05,-0.18],[0.35,0.12],[0.62,-0.2],[0.2,0.32],[0.85,0.1]].forEach(([u,v],k)=>rosette(p,M,RO,L*u,w*v,5.4,seed+k,false)); }); }
  function drawFront(p,M,lg,near,P,form){
    const R=M.fur, RO=rosOf(M,P,form), k=near?1:0.92;
    let t=limb(p,lg.S,lg.E); const L0=t.L;
    p.F(R[1]); p.poly([[-6,-15*k],[L0*0.5,-14*k],[L0+3,-10*k],[L0+3,10*k],[L0*0.5,13*k],[-6,15*k]]); capFur(p,M,RO,t.L,near?30:27,near?70:80);
    t=limb(p,lg.E,lg.W); const L=t.L;
    // antebraço grosso (extensores na frente, cotovelo atrás) afinando no punho
    const FA=[[-5,-11*k],[L*0.25,-12.6*k],[L*0.7,-7.6*k],[L+1,-5.4*k],[L+1,5*k],[L*0.6,6.6*k],[L*0.22,10*k],[-3,12.6*k],[-6,8]];
    p.F(R[1]); p.poly(FA); clipPoly(FA,()=>{ p.F(M.furQ[1]); p.poly([[-8,3],[L+4,2],[L+4,14],[-8,14]]); p.F(M.fur[0]); p.poly([[-8,-14],[L*0.5,-14],[L*0.45,-8],[-8,-7]]);
      p.F(M.cream[2]); p.poly([[L*0.3,5],[L+2,3],[L+2,8],[L*0.3,10]]); p.F(R[2]); bandA(p,[[L*0.15,-9],[L*0.55,-5],[L*0.9,-4]],1); });
    p.F(R[2]); p.poly([[-6,9],[-2,14.6],[2,9]]); p.poly([[2,9],[5,14],[8,8]]); // tufos atrás do cotovelo
    spotsOn(p,RO[1],L,12,near?90:96,5);
    drawPaw(p,M,lg.Pc,lg.pa,Math.max(0.45,P.claw),near?1.5:1.38,true);
  }
  function drawHind(p,M,lg,near,P,form){
    const R=M.fur, RO=rosOf(M,P,form), k=near?1:0.9;
    let t=limb(p,lg.S,lg.E); const L1=t.L;
    // coxa grande (posterior saltada atrás)
    const TH=[[-8,-15*k],[L1*0.4,-17*k],[L1*0.85,-10*k],[L1+2,-7*k],[L1+2,7*k],[L1*0.6,13*k],[L1*0.2,18*k],[-8,16*k]];
    p.F(R[1]); p.poly(TH); capFur(p,M,RO,t.L,near?32:28,near?110:115);
    t=limb(p,lg.E,lg.W); const L=t.L;
    const SH=[[-4,-8*k],[L*0.5,-6*k],[L+1,-5],[L+3,2],[L+4,8],[L-3,6],[L*0.35,10*k],[-4,10*k]]; // panturrilha + jarrete
    p.F(R[1]); p.poly(SH); clipPoly(SH,()=>{ p.F(M.furQ[1]); p.poly([[-6,3],[L+6,1],[L+6,12],[-6,12]]); p.F(M.fur[0]); p.poly([[-6,-10],[L*0.6,-8],[L*0.5,-4],[-6,-5]]); p.F(M.cream[2]); p.poly([[2,-8],[L,-6],[L,-3.6],[2,-5]]); });
    spotsOn(p,RO[1],L,11,near?120:130,4);
    const mt=limb(p,lg.W,lg.Pc);
    p.F(R[1]); p.poly([[-2,-6],[mt.L-3,-5],[mt.L-2,5.4],[-2,6.4]]); p.F(M.furQ[1]); p.poly([[-2,2],[mt.L-2,2],[mt.L-2,5.4],[-2,6.4]]); p.F(R[0]); p.cap(P2(2,-3.6),P2(mt.L-6,-3.2),1.6,1.4);
    drawPaw(p,M,lg.Pc,lg.pa,Math.max(0.3,P.claw*0.6),near?1.32:1.24,false);
  }

  /* ---------------- cauda ---------------- */
  function tailPts(sk,P){ const n=12, out=[sk.TB]; let q=sk.TB; const base=-62+P.tu-sk.P.tilt*0.6;
    for(let k=1;k<=n;k++){ const u=k/n, a=base+P.tcurl*u-P.tipc*u*u*u+P.tw*38*S(P.tph*1.0-k*0.55)*u; q=lp(q,a,7.4); if(q.y>GROUND-2) q=P2(q.x,GROUND-2); out.push(q); }
    return out; }
  function drawTail(p,M,sk,P,form){
    p.id(); const pts=tailPts(sk,P), R=M.fur, RO=rosOf(M,P,form), n=pts.length-1;
    for(let k=0;k<n;k++){ const w0=12-k*0.55, w1=12-(k+1)*0.55; p.F(R[2]); p.cap(pts[k],pts[k+1],w0,w1); }
    for(let k=0;k<n;k++){ const w0=12-k*0.55, w1=12-(k+1)*0.55; p.F(R[1]); p.cap(P2(pts[k].x+0.4,pts[k].y-1.2),P2(pts[k+1].x+0.4,pts[k+1].y-1.2),w0*0.66,w1*0.66); }
    for(let k=0;k<n-1;k++){ p.F(R[0]); p.cap(P2(pts[k].x+0.6,pts[k].y-3),P2(pts[k+1].x+0.6,pts[k+1].y-3),1.6,1.2); }
    // pintas e depois anéis
    for(let k=1;k<n;k++){ const a=pts[k], b=pts[k+1]||a, w=12-k*0.55; if(k<8){ p.F(RO[1]); p.ell(a.x+(k%2?1:-1),a.y+(k%2?-1.4:1.6),2.2,1.6); }
      else { const ang=Math.atan2(b.y-a.y,b.x-a.x); p.F(RO[1]); p.cap(P2(a.x-S(ang)*w*0.5,a.y+C(ang)*w*0.5),P2(a.x+S(ang)*w*0.5,a.y-C(ang)*w*0.5),2.6,2.6); } }
    p.F(RO[1]); p.circle(pts[n],3); p.F(RO[2]); p.circle(P2(pts[n].x+0.6,pts[n].y+0.6),1.8);
    fungus(p,M,pts[5].x,pts[5].y-3,0.85,77); fungus(p,M,pts[2].x,pts[2].y-4,0.6,79);
    // osso aparecendo no meio da cauda (pelo arrancado)
    const m=pts[7]; p.F(M.rot[2]); p.ell(m.x,m.y,3.6,2.6); p.F(M.bone[1]); p.ell(m.x+0.4,m.y-0.4,2.2,1.4); p.F(M.bone[0]); p.rect(m.x,m.y-1,1,1);
  }

  /* ---------------- FX ---------------- */
  function drawLeaves(p,M,sk,P){ p.id(); const n=Math.round(22*P.leaves), t=P.t||0, cx=sk.H.x+40, cy=GROUND-34;
    for(let k=0;k<n;k++){ const a=rnd(k,1)*PI*2, dx=(rnd(k,2)-0.5)*190, dy=-rnd(k,3)*86+12, sw=2.4*S(t*1.7+k), x=cx+dx+sw, y=cy+dy+(1-P.leaves)*20*rnd(k,4), r=a+0.4*S(t+k);
      p.F(M.leaf[3]); p.ell(x+0.8,y+0.8,6,2.6,r); p.F(M.leaf[2]); p.ell(x,y,6,2.6,r); p.F(M.leaf[1]); p.ell(x-0.6,y-0.6,4,1.6,r); p.F(M.leaf[0]); p.rect(x-1,y-1,1.4,1); } }
  function drawMud(p,M,sk,P,front){ p.id(); const x=(sk.ff.Pc.x+sk.fb.Pc.x)/2+2, g=GROUND;
    if(!front){ p.F(M.mud[3]); p.ell(x,g-1,40,6); p.F(M.mud[2]); p.ell(x-2,g-2,34,4.4); p.F(M.mud[1]); p.ell(x-6,g-3,18,2); return; }
    p.F(M.mud[2]); [[-14,-3,8,3],[10,-4,9,3.4],[-2,-2,10,2.6]].forEach(([dx,dy,rx,ry])=>p.ell(x+dx,g+dy,rx,ry)); p.F(M.mud[1]); [[-14,-4.4,5,1.6],[9,-5.6,5,1.6]].forEach(([dx,dy,rx,ry])=>p.ell(x+dx,g+dy,rx,ry));
    const t=Math.round(P.t||0); p.F(M.mud[1]); for(let k=0;k<4;k++){ const sx=x+(rnd(k+t,1)-0.5)*50, sy=g-8-rnd(k+t,2)*18; p.circle(P2(sx,sy),1.4+rnd(k,3)); } }
  function drawSmear(p,M,sk,P,anim){ p.id();
    if(anim==='claw'){ const s=P.smear>1.5?sk.ShB:sk.Sh; K_.smear(p,M.fx,s.x+4,s.y+10,52,64,-70,70,0.95); p.F(M.fx[2]); [0,1,2].forEach(k=>K_.arc(p,s.x+4,s.y+10,44-k*5,42-k*5,-60+k*8,60-k*8,1.2,10)); }
    else if(anim==='pounce'||anim==='intro'){ p.F(M.fx[2]); [-30,-14,2,18].forEach((dy,k)=>p.cap(P2(sk.H.x-70-k*8,sk.H.y+dy),P2(sk.H.x-16,sk.H.y+dy),0.6,2.4)); p.F(M.fx[1]); [-22,-6,10].forEach(dy=>p.cap(P2(sk.H.x-50,sk.H.y+dy),P2(sk.H.x-10,sk.H.y+dy),0.5,1.6)); } }
  function drawRing(p,M,sk,P){ p.id(); const o=sk.Hd(40,4), r=P.ring;
    for(let k=0;k<3;k++){ const rr=14+r*26+k*14; if(rr>120) continue; K_.smear(p,M.wave,o.x,o.y,rr-4,rr,-60+sk.P.hd*0.5,60+sk.P.hd*0.5,1); } }

  function parts(add,P,M,sk,form,anim){
    const hid=P.van>=0.999;
    // dissolve em blocos (some no mato / reaparece)
    const W=fn=>p=>{ if(P.van>0.001&&!hid){ const X=K_.st.CTX; p.id(); X.save(); X.beginPath(); const cs=4;
        for(let y=GROUND-200;y<GROUND+8;y+=cs) for(let x=0;x<FW;x+=cs){ if(rnd(Math.floor(x/cs)*7.31+Math.floor(y/cs)*1.77,3)>=P.van) X.rect(x,y,cs,cs); }
        X.clip(); fn(p); X.restore(); } else fn(p); };
    if(P.mud) add({noShade:true,noRim:true},p=>drawMud(p,M,sk,P,false));
    if(!hid){
      add({back:true},W(p=>drawHind(p,M,sk.hb,false,P,form)));
      add({back:true},W(p=>drawFront(p,M,sk.fb,false,P,form)));
      add({},W(p=>drawTail(p,M,sk,P,form)));
      add({},W(p=>drawTorso(p,M,sk,P,form)));
      add({smear:true},W(p=>drawHind(p,M,sk.hf,true,P,form)));
      add({smear:true},W(p=>drawNeck(p,M,sk,P,form)));
      add({},W(p=>drawJaw(p,M,sk,P)));
      add({},W(p=>drawHead(p,M,sk,P,form)));
      add({smear:true},W(p=>drawFront(p,M,sk.ff,true,P,form)));
    }
    if(P.eyes>0) add({noShade:true,noRim:true},p=>drawEye(p,M,sk,P,form));
    if(P.mud) add({noShade:true,noRim:true},p=>drawMud(p,M,sk,P,true));
    if(P.leaves>0.02) add({noShade:true},p=>drawLeaves(p,M,sk,P));
    if(P.steam>0.05&&!hid) add({noShade:true,noRim:true},p=>{ p.id(); steamPuffs(p,M,sk.Hd(42,4),P); });
    if(P.smear) add({noShade:true,smear:true,noRim:true},p=>drawSmear(p,M,sk,P,anim));
    if(P.ring>0.05) add({noShade:true,smear:true,noRim:true},p=>drawRing(p,M,sk,P));
    if(P.impact) add({noShade:true,smear:true,noRim:true},p=>{ p.id(); dust(p,M.dust,anim==='death'||anim==='fall'?null:M.fx,anim==='death'||anim==='fall'?sk.H.x+30:sk.ff.Pc.x,GROUND,0.4*P.impact); });
    if(P.moss>0.02) add({noShade:false},p=>{ p.id(); const n=Math.round(16*P.moss);
      for(let k=0;k<n;k++){ const u=rnd(k,31), q=sk.T(-24+u*(sk.L+30),-18+rnd(k,32)*30); fungus(p,M,q.x,q.y,0.8+P.moss*0.9*rnd(k,33),k*5+200); }
      if(P.moss>0.5){ const h=sk.Hd(10,-10); fungus(p,M,h.x,h.y,0.9,301); const tp=tailPts(sk,P)[8]; fungus(p,M,tp.x,tp.y-2,1,303); } });
  }
  function anchors(sk,P){ return {eye:sk.Hd(28.8,-11.8),mouth:sk.Hd(38,8),head:sk.Hd(12,-14),hand:sk.ff.Pc,back:sk.T(sk.L*0.6,-24)}; }

  /* ---------------- adereço: olhos na folhagem (sinal da emboscada) ---------------- */
  const PROP={FW:80,FH:60,GROUND:52,AX:40};
  function prop(add,P,M,form,anim){ add({noShade:true},p=>drawEyesProp(p,M,Math.round(P.st||0))); }
  function drawEyesProp(p,M,st){ p.id(); const cx=40, g=52;
    // moita escura de folhas
    for(let k=0;k<16;k++){ const a=rnd(k,1)*PI*2, x=cx+(rnd(k,2)-0.5)*56+(st===0?1.6*S(k):0), y=g-6-rnd(k,3)*30, r=a;
      p.F(M.leaf[3]); p.ell(x+0.6,y+0.8,7,3,r); p.F(M.leaf[2]); p.ell(x,y,7,3,r); if(k%3===0){ p.F(M.leaf[1]); p.ell(x-1,y-0.8,4,1.4,r); } }
    p.F(M.leaf[3]); p.ell(cx,g-20,16,9);
    if(st===0) return;
    const h=st===2?0.5:1;
    [[-6,0],[6,0]].forEach(([dx])=>{ const x=cx+dx, y=g-22; p.F(M.eye[3]); p.ell(x,y,4,3*h); p.F(M.eye[2]); p.ell(x,y,3,2*h); p.F(M.eye[1]); p.ell(x+0.4,y-0.2,1.8,1.3*h); p.F(M.eye[0]); p.rect(x,y-1,1.4,1); });
    if(st===3){ p.F(M.eye[2]); p.cap(P2(cx-10,g-22),P2(cx-16,g-23),1.4,0.5); p.cap(P2(cx+10,g-22),P2(cx+16,g-23),1.4,0.5); }
  }

  return K_.factory({SC,FW,FH,GROUND,AX,RIM,ANIMS,NAMES,REST,mats0,skeleton,parts,anchors,PROP,prop});
})();
