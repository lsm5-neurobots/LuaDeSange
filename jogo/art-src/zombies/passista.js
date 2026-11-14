/* PASSISTA — fonte de arte (editável). Build: npm run art
   Mini boss da Lapa "A Passista": destaque de escola de samba tomada pela Lua de Sangue no meio do desfile.
   Alta e esguia, sambando no salto; esplendor de plumas nas costas maior que ela (placa dourada com pedras, anel de
   marabu e plumas longas rosa/ocre/verde-água, quebradas, rasgadas e caídas), coroa-escudo dourada com raios e gotas
   de strass, cabelo crespo volumoso. Fantasia de corpo inteiro: maiô bordado de mangas longas com V dourado, cinto e
   colar de pedras, meia-calça (rasgada no joelho), saia de franjas com contas, sandália prata de salto e tiras.
   Pele zumbi cinza-oliva, maquiagem de glitter borrada. Fúria: plumas carbonizadas pegam chama lunar (azul-ciano).
   Design próprio (nenhuma escola ou pessoa real). Adereços: poça de lantejoulas (lentidão) e rajada de lantejoulas. */
const PASSISTA=(function(){
  const {rad,lp,lerp,P2}=PIX;
  const K_=BOSSKIT, {S,C,PI,mass,platePoly,clipPoly,band,bandA,ellPts,limb,fold,rivets,rnd,stain,flames,dust,sparks}=K_;
  const FW=340, FH=252, GROUND=242, AX=170, SC=0.92;
  const RIM={normal:'#ffe0f0', furia:'#a8e0ff'};

  function mats0(form){
    const m={
      suit:['#ff9ad0','#d23c8c','#82205e','#40103a'],
      gold:['#fff6c0','#f2c84a','#b07c22','#5e3a14'],
      gem:['#e8fff8','#5ce0c8','#1e8a86','#0c3e48'],
      ruby:['#ffd0d8','#ff4a6a','#a8143c','#500a20'],
      skin:['#cfd6c0','#94a296','#5c6a72','#2e3446'],
      tights:['#e2c2b0','#a88480','#6a5262','#342a3c'],
      hair:['#7a6070','#463644','#2a1e2c','#160e18'],
      pA:['#ffd6ec','#e486b8','#a04a80','#542448'],
      pB:['#ffe8a8','#e0a04a','#9a5e2a','#4e2c18'],
      pC:['#c8f4ec','#4cb4a8','#26706e','#123a40'],
      pW:['#fffaf0','#d8d0d4','#9a90a4','#544c62'],
      heel:['#ffffff','#c8c8dc','#7c7c96','#3e3c50'],
      mouth:['#6c2c3a','#421a28','#2a0e18','#1a0710'],
      paint:['#ffb8f0','#c860d0','#7a2c90','#3e1450'],
      blood:['#9c3a46','#6e2234','#461424','#280a14'],
      eye:['#ffffff','#f4ffb0','#b8e040','#56801c'],
      lua:['#ffffff','#d6f4ff','#7ac8ff','#3a5ae0'],
      fx:['#ffffff','#fff6c0','#ffd0f0','#c870ff'],
      dust:['#eadecd','#c6b6a0','#968671','#605448'],
    };
    if(form==='furia'){
      m.skin=['#d6d4d0','#9a98a6','#5e5a74','#2e2a44'];
      m.eye=['#ffffff','#ffd0e0','#ff4a6a','#a8143c'];
      m.pA=['#c8b8e8','#5e4c80','#342a4c','#1a1428'];
      m.pB=['#b8c4e0','#4a5478','#2a3048','#161a28'];
      m.pC=['#d0d0e0','#6a6a84','#3e3c52','#201e2c'];
      m.pW=['#e8f6ff','#a8b8d8','#606c90','#30344a'];
      m.suit=['#f08ac0','#b02a74','#681850','#340a2e'];
    }
    return K_.finish(m,['fx','dust','eye','lua']);
  }
  const NAMES={suit:'Maiô bordado',gold:'Bordado e coroa',gem:'Pedra verde-água',ruby:'Pedra rubi',skin:'Pele morta',tights:'Meia-calça',hair:'Cabelo crespo',
    pA:'Pluma rosa',pB:'Pluma ocre',pC:'Pluma verde-água',pW:'Marabu',heel:'Sandália prata',paint:'Glitter borrado',eye:'Olho',lua:'Chama lunar'};

  /* ---------------- poses ----------------
     tw: giro (escala x do corpo em torno do quadril: 1 de frente, -1 de costas) · fan: abertura do esplendor ·
     flut: tremor das plumas · droop: plumas caídas · wind: plumas pra trás · sw: franja (abre no giro) ·
     ign: chama lunar (fúria) · glow: brilho nas mãos · crownOff/crX/crY/crR: coroa caindo · fall: plumas soltas no chão */
  const REST={hx:0,drop:0,lean:2,head:0,aFs:64,aFe:140,aBs:-56,aBe:-130,lFh:8,lFk:2,lBh:-6,lBk:-10,fF:0,fB:0,
    tw:1,fan:1,flut:0.3,droop:0.25,wind:0,sw:0,ign:1,glow:0,crownOff:0,crX:0,crY:0,crR:0,fall:0,roar:0,flash:0,smear:0,impact:0,dead:0,ph:0,ring:0};
  const LIE={lean:-90,head:-8,hx:34,aFs:-70,aFe:-90,aBs:-80,aBe:-100,lFh:84,lFk:80,lBh:78,lBk:74,fan:0.75,droop:1.4,flut:0,crownOff:1,fall:1};
  const ANIMS={
    idle:{nome:'Parado (samba no pé, plumas balançam)',n:8,dur:()=>140,pose:i=>{ const p=i/8*PI*2, s=S(p);
      return {hx:1.6*S(2*p), lean:2+1.2*S(2*p+0.6), drop:1.2*Math.abs(S(p)), head:-2+2.5*S(p-0.9),
        lFh:8+6*Math.max(0,s), lFk:2-10*Math.max(0,s), lBh:-6+6*Math.max(0,-s), lBk:-10-10*Math.max(0,-s),
        aFs:64+10*S(p), aFe:140+14*S(p+1), aBs:-56-10*S(p), aBe:-130-14*S(p+1), sw:1.2*S(2*p-0.5), flut:0.5, ph:p}; }},
    walk:{nome:'Andar (passo curto no salto, gingando)',n:8,dur:()=>130,pose:i=>{ const p=i/8*PI*2+PI/2;
      const lFh=6+18*S(p), lBh=-4+18*S(p+PI);
      return {lFh, lFk:lFh-22*Math.max(0,C(p))-2, lBh, lBk:lBh-22*Math.max(0,C(p+PI))-6, fF:-6*C(p), fB:-6*C(p+PI),
        drop:1.6*C(2*(p-PI/2)), lean:4+1.5*S(2*p), head:1.5*S(2*p-1), hx:2*S(p),
        aFs:60-16*S(p), aFe:140-14*S(p), aBs:-50+16*S(p), aBe:-130+14*S(p), sw:1.8*S(p), flut:0.6, wind:0.2, ph:2*p}; }},
    spin:{nome:'Giro de plumas (área, empurra)',n:12,warn:[0,1,2],hit:5,hit2:8,dur:i=>[150,150,140,80,70,70,70,70,70,140,160,160][i],pose:i=>{
      const TW=[1,1,1,0.55,-0.35,-1,-0.4,0.5,1,1,1,1][i];
      if(i<3) return [{lean:8,head:6,drop:4,aFs:30,aFe:60,aBs:-30,aBe:-60,lFh:16,lFk:-14,lBh:-10,lBk:-34,fan:0.9},
        {lean:-6,head:-8,drop:6,aFs:120,aFe:150,aBs:-120,aBe:-150,lFh:18,lFk:-16,lBh:-12,lBk:-36,fan:1.15,flut:1,roar:1},
        {lean:-8,head:-10,drop:7,aFs:124,aFe:154,aBs:-124,aBe:-154,lFh:18,lFk:-16,lBh:-12,lBk:-36,fan:1.2,flut:1.2,roar:1,hx:1}][i];
      if(i<9) return {tw:TW,lean:0,head:-2,drop:2,aFs:100,aFe:96,aBs:-100,aBe:-96,lFh:6,lFk:4,lBh:-4,lBk:-2,fan:1.2,flut:1.5,sw:3.2,ring:1,smear:1,ph:i*1.3,roar:i>=4&&i<=6?1:0};
      return [{lean:-6,head:-14,hx:-3,aFs:80,aFe:70,aBs:-80,aBe:-70,sw:1.6,fan:1,droop:0.6,flut:1},
        {lean:8,head:12,hx:3,drop:3,aFs:30,aFe:20,aBs:-20,aBe:-10,lFh:14,lFk:-10,sw:-1,droop:0.8},
        {lean:4,head:6,drop:2,aFs:20,aFe:10,aBs:-10,aBe:0,droop:0.8}][i-9]; }},
    dazed:{nome:'Tonta (cambaleia depois do giro)',n:8,dur:()=>190,pose:i=>{ const p=i/8*PI*2;
      return {lean:4+7*S(p), head:10+14*S(p+1), hx:3*S(p), drop:4+2*S(2*p), aFs:14+10*S(p), aFe:6+8*S(p+0.6), aBs:-8+10*S(p+1), aBe:-2+8*S(p),
        lFh:12+6*S(p), lFk:-6-6*Math.max(0,S(p)), lBh:-8+6*S(p+PI), lBk:-16-6*Math.max(0,-S(p)), droop:1.1, flut:0.2, fan:0.85, sw:1.4*S(p), ph:p}; }},
    stomp:{nome:'Pisão de salto (joelho alto, racha o chão)',n:9,warn:[1,2,3],hit:4,dur:i=>[140,150,150,150,80,170,150,150,150][i],pose:i=>[
      {lean:6,head:4,drop:3,aFs:40,aFe:80,aBs:-40,aBe:-80,lFh:14,lFk:-6},
      {lean:-6,head:-6,aFs:140,aFe:170,aBs:-120,aBe:-160,lFh:96,lFk:20,fF:20,lBh:-2,lBk:-4,fan:1.1,flut:0.8},
      {lean:-9,head:-10,aFs:150,aFe:176,aBs:-130,aBe:-170,lFh:108,lFk:26,fF:24,lBh:-2,lBk:-4,fan:1.15,flut:1,roar:1},
      {lean:-10,head:-12,aFs:152,aFe:178,aBs:-132,aBe:-172,lFh:110,lFk:26,fF:24,lBh:-2,lBk:-4,fan:1.15,flut:1.2,roar:1,hx:1},
      {lean:14,head:8,hx:8,drop:8,aFs:70,aFe:40,aBs:-90,aBe:-60,lFh:34,lFk:4,fF:0,lBh:-24,lBk:-50,smear:1,impact:1,sw:-2,flut:1.5},
      {lean:16,head:10,hx:8,drop:9,aFs:66,aFe:30,aBs:-92,aBe:-62,lFh:34,lFk:4,lBh:-24,lBk:-50,impact:0.6,sw:-1,flut:1},
      {lean:10,head:6,hx:6,drop:6,aFs:60,aFe:60,aBs:-70,aBe:-80,lFh:28,lFk:2,lBh:-18,lBk:-36},
      {lean:6,head:2,hx:3,drop:2,aFs:60,aFe:110,aBs:-60,aBe:-110,lFh:16,lFk:2,lBh:-10,lBk:-18},
      {lean:2,head:0,aFs:64,aFe:140,aBs:-56,aBe:-130}][i]},
    rain:{nome:'Chuva de lantejoulas (leque)',n:10,warn:[1,2,3],throwAt:5,dur:i=>[150,150,150,150,120,80,160,160,160,150][i],pose:i=>[
      {lean:10,head:6,drop:4,aFs:20,aFe:-20,aBs:30,aBe:-10,lFh:16,lFk:-12,lBh:-10,lBk:-30},
      {lean:-4,head:-8,aFs:-60,aFe:-120,aBs:-80,aBe:-140,glow:0.4,flut:1.2,fan:1.1},
      {lean:-8,head:-12,aFs:-80,aFe:-150,aBs:-96,aBe:-160,glow:0.7,flut:1.6,fan:1.15,roar:1},
      {lean:-10,head:-14,aFs:-84,aFe:-156,aBs:-100,aBe:-164,glow:1,flut:1.8,fan:1.2,roar:1,hx:-1},
      {lean:-12,head:-16,aFs:-90,aFe:-160,aBs:-104,aBe:-168,glow:1,flut:2,fan:1.2,roar:1,hx:1},
      {lean:14,head:6,hx:6,aFs:110,aFe:96,aBs:70,aBe:60,glow:0.5,smear:1,lFh:28,lFk:2,lBh:-18,lBk:-28,wind:-0.4},
      {lean:16,head:8,hx:6,aFs:104,aFe:90,aBs:66,aBe:56,lFh:28,lFk:2,lBh:-18,lBk:-28},
      {lean:8,head:4,hx:3,aFs:80,aFe:110,aBs:10,aBe:-40},
      {lean:4,head:2,aFs:66,aFe:136,aBs:-40,aBe:-110},
      {lean:2,head:0,aFs:64,aFe:140,aBs:-56,aBe:-130}][i]},
    dash:{nome:'Avanço sambando',n:10,warn:[0,1],run:[2,3,4,5,6,7],dur:i=>[150,140,70,70,70,70,70,70,150,160][i],pose:i=>{
      if(i<2) return [{lean:10,head:4,drop:4,lFh:18,lFk:-14,lBh:-12,lBk:-36,aFs:90,aFe:160,aBs:-90,aBe:-160,roar:1},
        {lean:14,head:6,drop:6,lFh:22,lFk:-18,lBh:-14,lBk:-40,aFs:96,aFe:166,aBs:-96,aBe:-166,roar:1,flut:1}][i];
      if(i>=8) return [{lean:6,head:2,aFs:70,aFe:130,aBs:-60,aBe:-120,wind:0.3},{lean:2,head:0}][i-8];
      const p=(i-2)/6*PI*4; return {lean:14,head:4,hx:2*S(p),drop:2*Math.abs(S(p)),lFh:10+26*S(p),lFk:10+26*S(p)-24*Math.max(0,C(p)),lBh:-6-26*S(p),lBk:-6-26*S(p)-24*Math.max(0,-C(p)),
        aFs:90+30*S(p),aFe:150+20*S(p),aBs:-90+30*S(p),aBe:-150+20*S(p),wind:1,flut:1,sw:2*S(p),smear:1,ph:p}; }},
    summon:{nome:'Chama a ala (2 Malandros)',n:9,callAt:5,dur:i=>[150,160,160,160,140,120,200,170,150][i],pose:i=>[
      {lean:4,head:2,aFs:50,aFe:80},
      {lean:-6,head:-10,aFs:168,aFe:178,aBs:-60,aBe:-40,roar:1,flut:1},
      {lean:-8,head:-14,aFs:172,aFe:182,aBs:-70,aBe:-50,roar:1,flut:1.4,hx:-1},
      {lean:-8,head:-14,aFs:172,aFe:182,aBs:-70,aBe:-50,roar:1,flut:1.4,hx:1},
      {lean:4,head:-2,aFs:130,aFe:120,aBs:-60,aBe:-60,smear:1},
      {lean:12,head:4,hx:4,aFs:96,aFe:92,aBs:-100,aBe:-140,roar:1,lFh:24,lFk:2,lBh:-16,lBk:-26,flut:1},
      {lean:12,head:4,hx:4,aFs:94,aFe:90,aBs:-100,aBe:-140,roar:1,lFh:24,lFk:2,lBh:-16,lBk:-26},
      {lean:6,head:2,aFs:70,aFe:120,aBs:-70,aBe:-130},
      {lean:2,head:0}][i]},
    rage:{nome:'Entrar em fúria (plumas pegam chama lunar)',n:8,dur:i=>[170,140,140,180,200,200,200,180][i],pose:i=>[
      {lean:16,head:18,aFs:20,aFe:110,aBs:20,aBe:120,drop:6,lFh:16,lFk:-12,ign:0,droop:1},
      {lean:18,head:22,aFs:24,aFe:116,aBs:24,aBe:126,drop:8,hx:-1,lFh:18,lFk:-14,ign:0.2,droop:1},
      {lean:-8,head:-16,aFs:130,aFe:150,aBs:-130,aBe:-150,roar:1,fan:1.15,flut:1.5,ign:0.5,droop:0.3},
      {lean:-14,head:-24,aFs:146,aFe:166,aBs:-146,aBe:-166,roar:1,fan:1.25,flut:2,ign:0.9,droop:0},
      {lean:-16,head:-26,aFs:150,aFe:170,aBs:-150,aBe:-170,roar:1,fan:1.25,flut:2,ign:1.2,hx:-2,droop:0},
      {lean:-16,head:-26,aFs:150,aFe:170,aBs:-150,aBe:-170,roar:1,fan:1.25,flut:2,ign:1.2,hx:2,droop:0},
      {lean:-10,head:-18,aFs:120,aFe:150,aBs:-120,aBe:-150,roar:1,fan:1.15,flut:1,ign:1.1},
      {lean:2,head:0}][i]},
    hurt:{nome:'Dano',n:4,dur:i=>[80,110,130,160][i],pose:i=>[
      {flash:1,lean:-14,head:-20,hx:-6,aFs:20,aFe:40,aBs:-80,aBe:-60,roar:1,flut:1.6,wind:-0.5},
      {lean:-10,head:-14,hx:-4,aFs:30,aFe:60,aBs:-70,aBe:-80,roar:1,flut:1},
      {lean:-2,head:-4,hx:-1,aFs:50,aFe:110,aBs:-60,aBe:-110},
      {}][i]},
    intro:{nome:'Entrada (WARNING): chega sambando e abre o esplendor',n:12,dur:i=>[110,110,110,110,110,110,200,220,220,260,240,220][i],pose:i=>{
      if(i<6){ const p=i/6*PI*4; return {hx:-66+i*12,lean:10,head:2,drop:2*Math.abs(S(p)),lFh:10+24*S(p),lFk:10+24*S(p)-22*Math.max(0,C(p)),lBh:-6-24*S(p),lBk:-6-24*S(p)-22*Math.max(0,-C(p)),
        aFs:90+20*S(p),aFe:150+20*S(p),aBs:-90+20*S(p),aBe:-150+20*S(p),fan:0.45,wind:1,flut:1,sw:2*S(p),ph:p}; }
      return [{lean:-2,head:-4,drop:6,lFh:22,lFk:-18,lBh:-12,lBk:-36,aFs:20,aFe:-10,aBs:-20,aBe:10,fan:0.5,sw:-1.5},
        {lean:-8,head:-12,aFs:150,aFe:170,aBs:-150,aBe:-170,fan:0.85,flut:1.5,roar:1},
        {lean:-12,head:-18,aFs:160,aFe:176,aBs:-160,aBe:-176,fan:1.25,flut:2,roar:1,glow:0.6},
        {lean:-12,head:-18,aFs:160,aFe:176,aBs:-160,aBe:-176,fan:1.25,flut:1.6,roar:1,hx:1,glow:1},
        {lean:0,head:-6,aFs:96,aFe:150,aBs:-100,aBe:-160,fan:1.1,flut:0.8,lFh:22,lFk:4,lBh:-10,lBk:-14},
        {lean:2,head:0}][i-6]; }},
    death:{nome:'Morte (gira, desaba, coroa cai, plumas espalham)',n:12,dur:i=>[90,140,140,160,170,170,170,180,200,220,400,700][i],pose:i=>{
      return [
        {flash:1,lean:-14,head:-22,hx:-6,aFs:20,aFe:40,aBs:-80,aBe:-60,roar:1,flut:2},
        {tw:0.4,lean:-6,head:-16,aFs:110,aFe:100,aBs:-110,aBe:-100,roar:1,flut:2,sw:2.6},
        {tw:-0.7,lean:-2,head:-10,aFs:100,aFe:80,aBs:-100,aBe:-80,flut:1.6,sw:2.4,fall:0.3},
        {tw:0.6,lean:10,head:20,drop:10,lFh:30,lFk:-30,lBh:-6,lBk:-50,aFs:40,aFe:20,aBs:-30,aBe:-10,droop:1,fall:0.5,crownOff:1,crX:6,crY:170,crR:0.4},
        {lean:12,head:26,drop:26,lFh:66,lFk:-14,lBh:20,lBk:-70,aFs:20,aFe:0,aBs:-10,aBe:0,droop:1.2,fall:0.7,crownOff:1,crX:-6,crY:120,crR:1.2},
        {lean:-34,head:-4,hx:10,lFh:60,lFk:40,lBh:40,lBk:30,aFs:120,aFe:140,aBs:-110,aBe:-130,droop:1.3,fall:0.9,fan:0.85,crownOff:1,crX:-20,crY:60,crR:2.2},
        Object.assign({},LIE,{impact:1,crX:-34,crY:14,crR:2.9}),
        Object.assign({},LIE,{crX:-40,crY:6,crR:3.1}),
        Object.assign({},LIE,{crX:-40,crY:6,crR:3.1,dead:0.3}),
        Object.assign({},LIE,{crX:-40,crY:6,crR:3.1,dead:0.5}),
        Object.assign({},LIE,{crX:-40,crY:6,crR:3.1,dead:0.7}),
        Object.assign({},LIE,{crX:-40,crY:6,crR:3.1,dead:1})][i]; }},
    xPool:{nome:'Poça de lantejoulas (lentidão)',n:2,prop:true,dur:()=>220,pose:i=>({st:i})},
    xBottle:{nome:'Rajada de lantejoulas (projétil)',n:2,prop:true,dur:()=>90,pose:i=>({st:2+i})},
  };
  function fix(P,anim,i){ if(!(anim==='death'&&i>=6)){ P.lean+=2; } }

  const RG=K_.rig({AX,GROUND,THI:32,SHN:32,UPA:25,FOA:23,hipW:6,neck:[3,-56],shF:[7,-50],shB:[-6,-51],HS:1.3,FT:13,FL:4,
    contacts:(b,P)=>[b.T(-10,-30).y+5,b.T(-8,-54).y+5,b.H(-2,-12).y+8,b.kneeF.y+5,b.kneeB.y+5]});

  /* ---------------- giro: espelha o corpo em torno do quadril ---------------- */
  function twPen(p,P,cx){ let tw=P.tw; if(Math.abs(tw-1)<1e-3) return p; if(Math.abs(tw)<0.22) tw=tw<0?-0.22:0.22;
    // mesma matriz do pen da factory (escala SC em torno da âncora no chão), espelhada em x no eixo do quadril
    const X=K_.st.CTX, K=PIX.getK(), k=K*SC, CX=(AX+(cx-AX)*SC)*K, sx=x=>(AX+(x-AX)*SC)*K, sy=y=>(GROUND+(y-GROUND)*SC)*K;
    const set=(a,b,c,d,e,f)=>X.setTransform(tw*a,b,tw*c,d,CX+tw*(e-CX),f);
    return Object.assign({},p,{id:()=>set(k,0,0,k,AX*K*(1-SC),GROUND*K*(1-SC)),
      xf:(a,ox,oy)=>{ const c=C(a), s=S(a); set(c*k,s*k,-s*k,c*k,sx(ox),sy(oy)); }}); }

  /* ---------------- plumas ---------------- */
  // pluma longa: haste + vexilo afinando na base e arredondando na ponta; bordas comidas (rag), barbelas, ponta suja
  function feather(p,R,base,ang,L,W,bend,seed,rag,tips){
    const n=10, pts=[P2(base.x,base.y)]; let q=pts[0];
    for(let j=1;j<=n;j++){ const u=j/n; q=lp(q,ang+bend*u*u,L/n); if(q.y>GROUND-1) q=P2(q.x,GROUND-1); pts.push(q); }
    const Lx=[], Rx=[], lit=[];
    for(let j=0;j<=n;j++){ const a=pts[Math.max(0,j-1)], b=pts[Math.min(n,j+1)], d=Math.hypot(b.x-a.x,b.y-a.y)||1, nx=-(b.y-a.y)/d, ny=(b.x-a.x)/d, u=j/n;
      const w=W*Math.pow(Math.max(0,S(PI*(0.08+0.86*u))),0.6)*(0.35+0.65*u);
      const wl=w*(rnd(seed,j)<rag?0.4:1), wr=w*(rnd(seed,j+31)<rag?0.4:1);
      Lx.push([pts[j].x+nx*wl,pts[j].y+ny*wl]); Rx.push([pts[j].x-nx*wr,pts[j].y-ny*wr]); lit.push(nx*0.6-ny*0.8>0); }
    const litL=lit[Math.floor(n/2)], A=litL?Lx:Rx, B=litL?Rx:Lx, mid=pts.map(v=>[v.x,v.y]);
    p.F(R[2]); p.poly(B.concat(mid.slice().reverse()));
    p.F(R[1]); p.poly(A.concat(mid.slice().reverse()));
    p.F(R[0]); p.poly(A.slice(3,n).map((v,j)=>[lerp(P2(mid[j+3][0],mid[j+3][1]),P2(v[0],v[1]),0.55).x,lerp(P2(mid[j+3][0],mid[j+3][1]),P2(v[0],v[1]),0.55).y]).concat(mid.slice(3,n).reverse()));
    // barbelas (riscos escuros do lado da sombra apontando pra ponta)
    p.F(R[3]); for(let j=2;j<n;j++){ const m=mid[j], b=B[Math.min(n,j+1)]; p.cap(P2(m[0],m[1]),P2(lerp(P2(m[0],m[1]),P2(b[0],b[1]),0.8).x,lerp(P2(m[0],m[1]),P2(b[0],b[1]),0.8).y),0.8,0.6); }
    p.F(K_.qOf(R)[2]); for(let j=3;j<n;j+=2){ const m=mid[j], a=A[j+1]; p.cap(P2(m[0],m[1]),P2(lerp(P2(m[0],m[1]),P2(a[0],a[1]),0.7).x,lerp(P2(m[0],m[1]),P2(a[0],a[1]),0.7).y),0.7,0.5); }
    // haste
    p.F(R[0]); band(p,pts.slice(0,n),0.9);
    // fiapos soltos nas bordas (pluma desgrenhada) apontando pra ponta
    for(let j=3;j<=n;j++){ const m=pts[j], tg=pts[Math.min(n,j+1)], dx=tg.x-pts[j-1].x, dy=tg.y-pts[j-1].y, d=Math.hypot(dx,dy)||1, ux=dx/d, uy=dy/d, ln=2.2+2.4*rnd(seed,j+70);
      if(rnd(seed,j+50)<0.75){ const q=A[j]; p.F(R[1]); p.cap(P2(q[0],q[1]),P2(q[0]+ux*ln+(q[0]-m.x)*0.35,q[1]+uy*ln+(q[1]-m.y)*0.35),1,0.5); }
      if(rnd(seed,j+60)<0.75){ const q=B[j]; p.F(R[2]); p.cap(P2(q[0],q[1]),P2(q[0]+ux*ln+(q[0]-m.x)*0.35,q[1]+uy*ln+(q[1]-m.y)*0.35),1,0.5); } }
    const e=pts[n]; p.F(R[3]); p.circle(lerp(pts[n-1],e,0.6),Math.max(0.6,W*0.12));
    if(tips) tips.push([e.x,e.y,0.4+W*0.05]);
  }
  const PCOL=['pA','pC','pB'];
  function fanAngles(n,spread,P){ const o=[]; for(let k=0;k<n;k++){ const u=k/(n-1)-0.5; o.push([u,180+u*spread*P.fan-(P.lean)+P.wind*22*(0.5+Math.abs(u))]); } return o; }
  // gravidade: dobra a ponta pra baixo conforme a direção da pluma
  const grav=(a,amt)=>{ const aa=((a%360)+360)%360; return (aa<180?-1:1)*amt*(0.3+0.7*Math.abs(S(rad(aa)))); };
  function drawEsplendor(p,M,sk,P,fur,tips){
    const B0=sk.T(-9,-40), t=P.t*0.9+(P.ph||0);
    // camada longa (de fora pra dentro: as centrais ficam por cima)
    const curl=u=>u*44; // pontas abrem pra fora
    const longL=fanAngles(17,176,P).map((v,k)=>[v,k]).sort((a,b)=>Math.abs(b[0][0])-Math.abs(a[0][0]));
    longL.forEach(([[u,a],k])=>{ const broken=k===3||k===13;
      const L=(44+32*C(u*PI*0.85)+5*rnd(k,2))*(0.6+0.4*Math.min(1.2,P.fan));
      const bend=curl(u)*-1+grav(a,(P.droop*30+(broken?80:0)))+P.flut*7*S(t*1.7+k*1.3);
      feather(p,M[PCOL[k%3]],lp(B0,a,6),a,broken?L*0.78:L,7.6,bend,k*3+1,broken?0.45:0.2,fur?tips:null); });
    // camada média
    fanAngles(13,150,P).map((v,k)=>[v,k]).sort((a,b)=>Math.abs(b[0][0])-Math.abs(a[0][0])).forEach(([[u,a],k])=>{ const L=(32+12*C(u*PI))*(0.65+0.35*Math.min(1.2,P.fan)), bend=-u*20+grav(a,P.droop*24)+P.flut*6*S(t*2.1+k);
      feather(p,M[PCOL[(k+1)%3]],lp(B0,a,5),a,L,7.2,bend,k*5+7,0.22,fur?tips:null); });
    // anel de marabu sujo
    const MW=M.pW; for(let k=0;k<14;k++){ const a=180+(k/13-0.5)*190*Math.min(1.1,P.fan)-P.lean, c=lp(B0,a,10+2*S(k*1.7)), r=4.4+1.2*rnd(k,4);
      p.F(MW[2]); p.circle(P2(c.x+0.8,c.y+0.8),r); p.F(MW[1]); p.circle(c,r*0.85); p.F(MW[0]); p.circle(P2(c.x-r*0.3,c.y-r*0.35),r*0.4); }
    // placa dourada em arco com pedras
    const G=M.gold, arcPts=[]; for(let k=0;k<=12;k++){ const a=180+(k/12-0.5)*150*Math.min(1.1,P.fan)-P.lean; arcPts.push(lp(B0,a,6.5)); }
    p.F(G[3]); band(p,arcPts,4.6); p.F(G[1]); band(p,arcPts,3.2); p.F(G[0]); band(p,arcPts.slice(2,7),1);
    arcPts.forEach((v,k)=>{ if(k%2) return; const R=k%4?M.ruby:M.gem; p.F(R[3]); p.circle(P2(v.x+0.4,v.y+0.5),1.7); p.F(R[1]); p.circle(v,1.4); p.F(R[0]); p.rect(v.x-0.6,v.y-0.9,1,1); });
  }
  // plumas soltas no chão (morte)
  function drawLoose(p,M,P){ const n=Math.round(9*P.fall); for(let k=0;k<n;k++){ const x=AX-110+rnd(k,11)*200+P.hx*0.5, y=GROUND-1-rnd(k,12)*4, a=80+rnd(k,13)*200;
    feather(p,M[PCOL[k%3]],P2(x,y),a,22+rnd(k,14)*16,5,grav(a,50),k*7+3,0.3,null); } }

  /* ---------------- membros ---------------- */
  function drawUpper(p,M,sh,el,front,P){
    const {ang,L}=limb(p,sh,el), R=M.suit;
    p.F(R[2]); p.cap(P2(0,0),P2(L,0),11,9); mass(p,R,L*0.45,-1,7,4.6,ang,0.8);
    p.F(M.gold[1]); [0.3,0.6].forEach(t=>p.rect(L*t,-4,1,1)); p.F(R[0]); p.rect(L*0.45,-3,1,1); p.rect(L*0.75,2,1,1);
    // ombreira: tufo de plumas curtas
    if(front){ [[-150,9],[-120,11],[-90,10],[-60,8]].forEach(([a,l],k)=>{ const R2=M[PCOL[k%3]], r=rad(a), e=P2(C(r)*l-1,S(r)*l*0.8-1);
      p.F(R2[2]); p.cap(P2(0,0),e,3.2,1.4); p.F(R2[1]); p.cap(P2(0,-0.4),P2(e.x*0.8,e.y*0.8-0.4),1.8,0.8); }); }
    p.F(M.gold[2]); p.cap(P2(-1,-5),P2(-1,5),3,3); p.F(M.gold[0]); p.rect(-1.5,-4,1,3);
  }
  function drawFore(p,M,el,wr,front,P){
    const {ang,L}=limb(p,el,wr), R=M.suit;
    p.F(R[2]); p.cap(P2(0,0),P2(L,0),9,7); mass(p,R,L*0.4,-1,6,3.4,ang,0.7);
    p.F(R[0]); [0.25,0.55].forEach(t=>p.rect(L*t,-2,1,1));
    // punho dourado com franja curta
    p.F(M.gold[2]); p.cap(P2(L*0.86,-4.6),P2(L*0.86,4.6),3.4,3.4); p.F(M.gold[0]); p.rect(L*0.84,-3.8,1,2.4);
    p.F(M.gold[1]); [-3,0,3].forEach(y=>p.cap(P2(L*0.9,y),P2(L+1.5,y+1.4),1,0.6));
  }
  function drawHand(p,M,wr,ang,P){
    p.xf(ang,wr.x,wr.y); const R=M.skin;
    p.F(R[2]); p.ell(3,0,4.4,4); p.F(R[1]); p.ell(3,-1,3,2.4);
    [[-24,11],[-8,13],[8,13],[22,10]].forEach(([a,L],k)=>{ const r=rad(a), e=P2(4+C(r)*L,S(r)*L);
      p.F(R[2]); p.cap(P2(4,S(r)*1.4),e,2.2,1.6); p.F(R[1]); p.cap(P2(4,S(r)*1.4-0.4),P2(e.x-0.3,e.y-0.4),1.1,0.8);
      p.F(M.mouth[2]); p.cap(lerp(P2(4,0),e,0.88),P2(e.x+C(r)*2.2,e.y+S(r)*2.2),1.2,0.5); });
    p.F(R[2]); p.cap(P2(1,-3.6),P2(5,-8),2.4,1.8);
    if(P.glow>0.05){ p.F(M.fx[2]); p.circle(P2(10,0),4+5*P.glow); p.F(M.fx[1]); p.circle(P2(10,0),2.6+3*P.glow); p.F(M.fx[0]); p.circle(P2(10,0),1.4+1.6*P.glow); }
  }
  function drawLeg(p,M,hip,knee,ankle,fa,front){
    let t=limb(p,hip,knee); const R=M.tights;
    p.F(R[2]); p.cap(P2(0,0),P2(t.L,0),16,11); mass(p,R,t.L*0.42,-1.4,9,5.4,t.ang,0.8);
    t=limb(p,knee,ankle);
    p.F(R[2]); p.cap(P2(-1,0),P2(t.L,0),11.5,6); mass(p,R,t.L*0.3,0.8,6.6,4.4,t.ang,0.7);
    // meia rasgada no joelho: pele morta aparecendo
    if(front){ p.F(M.skin[2]); p.ell(1,-2.6,3.6,2.4); p.F(M.skin[3]); p.ell(1.6,-2,1.8,1.2); p.F(R[3]); bandA(p,[[-2.4,-4],[0,-5],[3,-4.6],[4.6,-3]],0.8); p.F(M.blood[2]); p.rect(2,-1,1,2); }
    // tiras da sandália subindo a canela
    const H=M.heel; [0.56,0.7,0.84].forEach(u=>{ p.F(H[2]); p.cap(P2(t.L*u-1.2,-3.8+u*1.4),P2(t.L*u+1.2,3.6-u*1.2),1.6,1.6); p.F(H[0]); p.rect(t.L*u-0.8,-3+u,1,1.2); });
    // pé no salto (tornozelo na origem; calcanhar alto, ponta no chão)
    p.xf(rad(fa),ankle.x,ankle.y);
    p.F(M.tights[2]); p.poly([[-4,-2],[3,-3],[9,5],[14,11],[16,13],[10,13],[2,7],[-4,4]]); p.F(M.tights[1]); p.poly([[-2,-2],[3,-2],[8,5],[11,9],[5,7],[-1,3]]);
    p.F(H[3]); p.poly([[-5,4],[2,8],[11,12.4],[17,12.6],[17,14],[9,14],[1,9.6],[-5,6]]); // sola
    p.F(H[2]); p.poly([[-5.4,4.4],[-2.6,5],[-3,13],[-4.4,13]]); p.F(H[3]); p.rect(-5,12.4,2.4,1.2); // salto fino
    p.F(H[1]); p.cap(P2(-3,1),P2(5,-1),2,2); p.cap(P2(8,7),P2(12,4.6),1.8,1.8); p.F(H[0]); p.rect(9,5,1.4,1); p.rect(0,0,1.4,1);
    p.F(M.gem[1]); p.circle(P2(3.4,-0.6),1.1);
  }

  /* ---------------- tronco, franja ---------------- */
  const BODY=[[-15,8],[-17,-4],[-8,-22],[-12,-36],[-12,-47],[-5,-56],[6,-57],[13,-53],[17,-45],[18,-37],[13,-30],[8,-22],[14,-10],[18,0],[12,8],[-2,11]];
  function drawTorso(p,M,sk,P){
    p.xf(sk.a,sk.hip.x,sk.hip.y); const R=M.suit, G=M.gold, A=sk.a;
    // pescoço
    p.F(M.skin[2]); p.cap(P2(2,-52),P2(3,-60),7,6); p.F(M.skin[3]); p.rect(-1,-56,2,4);
    platePoly(p,R,BODY,A,1);
    clipPoly(BODY,()=>{
      mass(p,R,10,-39,6.4,5.4,A,1); mass(p,R,2,-14,9,9,A,0.6); mass(p,R,-2,2,10,6,A,0.5);
      fold(p,R,[[-6,-30],[-3,-24],[-4,-16]],1.1); fold(p,R,[[8,-8],[10,-2]],1);
      // lantejoulas em grade
      for(let y=-52;y<8;y+=3.4) for(let x=-12;x<16;x+=3.4){ const xx=x+((Math.round(y/3.4))&1)*1.7, r=rnd(xx*3.1,y*1.7); if(r<0.35){ p.F(R[0]); p.rect(xx,y,1,1); } else if(r<0.45){ p.F(G[1]); p.rect(xx,y,1,1); } }
      // V de bordado dourado com pedras
      [[[-6,-53],[3,-28],[13,-50]],[[-8,-46],[3,-22],[14,-42]]].forEach((pts,k)=>{ p.F(G[3]); bandA(p,pts,k?1.6:2.4); p.F(G[1]); bandA(p,pts,k?0.9:1.4); });
      p.F(G[0]); bandA(p,[[-5,-52],[0,-40]],0.8);
      // rasgo na lateral (pele morta) + sangue
      p.F(M.skin[2]); p.poly([[-12,-18],[-6,-14],[-9,-8],[-13,-10]]); p.F(M.skin[3]); p.poly([[-11,-15],[-8,-13],[-10,-10]]);
      stain(p,M.blood,-8,-12,3,2,5); stain(p,M.blood,12,-46,2.4,1,8);
      // cinto de pedras
      p.F(G[3]); bandA(p,[[-12,-21],[0,-23],[11,-23]],3.4); p.F(G[1]); bandA(p,[[-12,-21.6],[0,-23.6],[11,-23.6]],2); p.F(G[0]); bandA(p,[[-6,-23],[4,-24]],0.8);
    });
    rivets(p,M.gem,[[4,-23.4]],1.8); rivets(p,M.ruby,[[-6,-22.4],[10,-23.6]],1.1);
    // cinto de franja no quadril
    p.F(G[3]); bandA(p,[[-13,2],[0,6],[15,1]],4.2); p.F(G[1]); bandA(p,[[-13,1.4],[0,5.2],[15,0.4]],2.6); p.F(G[0]); [[-8,3],[0,5],[8,3]].forEach(([x,y])=>p.rect(x,y-1,1.4,1));
    rivets(p,M.ruby,[[-4,4.4],[6,4]],1.2);
    // colar de pedras com gotas
    p.F(G[3]); bandA(p,[[-2,-55],[3,-52],[9,-54]],2.6); p.F(G[1]); bandA(p,[[-2,-55.6],[3,-52.6],[9,-54.6]],1.4);
    [[0,-53],[3,-51],[6,-52]].forEach(([x,y],k)=>{ const Rg=k===1?M.gem:M.ruby; p.F(Rg[3]); p.ell(x+0.3,y+2.6,1.4,2.1); p.F(Rg[1]); p.ell(x,y+2.2,1.1,1.7); p.F(Rg[0]); p.rect(x-0.4,y+1.4,0.8,0.8); });
  }
  function drawFringe(p,M,sk,P){
    p.id(); const n=16, G=M.gold, R=M.suit, t=P.t;
    for(let pass=0;pass<2;pass++) for(let i=pass;i<n;i+=2){ const u=i/(n-1), lx=-13+u*28, ly=2+4*S(u*PI);
      const s=sk.T(lx,ly+1.4), L=18+((i*7)%4)*2.4, sw=P.sw;
      const ang0=-(P.lean)+sw*(8+10*Math.abs(u-0.5))*(u<0.5?-1:1)*0.0+sw*9+5*S(t*1.6+i*0.9)+(u-0.5)*14+(sw>2?(u-0.5)*sw*24:0);
      const m=lp(s,ang0*0.6,L*0.5), e=lp(m,ang0,L*0.5);
      const Rr=i%3===0?R:G; p.F(Rr[pass?2:3]); p.cap(s,m,2.2,1.8); p.cap(m,e,1.8,1.2); p.F(Rr[pass?1:2]); p.cap(s,m,1,0.8);
      p.F(M.gem[i%2?1:2]); p.circle(e,1.1); if(pass){ p.F(G[0]); p.rect(e.x-0.4,e.y-0.8,0.8,0.8); } }
  }

  /* ---------------- cabeça e coroa ---------------- */
  function drawCrown(p,M,P,fur,tips){
    const G=M.gold;
    // penachos curtos atrás da coroa
    [[-44,11],[-22,14],[0,15],[22,14],[44,11]].forEach(([a,L],k)=>{ const ang=180+a+P.flut*4*S(P.t*2+k); feather(p,M[PCOL[(k+2)%3]],P2(3,-36),ang,L,4.2,grav(ang,P.droop*14),k*9+40,0.2,fur?tips:null); });
    // raios com gotas de strass
    [[-12,-46],[-5,-53],[4,-55],[13,-52],[19,-43]].forEach(([x,y],k)=>{ p.F(G[3]); p.cap(P2(3,-32),P2(x,y),2.2,1.4); p.F(G[1]); p.cap(P2(3,-32),P2(x,y),1.2,0.8);
      const R=k%2?M.ruby:M.gem; p.F(G[2]); p.ell(x,y-1,2.6,3.2); p.F(R[2]); p.ell(x,y-1,1.9,2.5); p.F(R[1]); p.ell(x-0.3,y-1.4,1.2,1.6); p.F(R[0]); p.rect(x-0.8,y-3,1,1); });
    // escudo
    const sh=[[-7,-20],[-9,-30],[-4,-42],[3,-47],[10,-43],[15,-32],[13,-21]];
    platePoly(p,G,sh,0,1);
    clipPoly(sh,()=>{ p.F(G[3]); bandA(p,[[-6,-22],[-7,-30],[-3,-40],[3,-44],[9,-41],[13,-31],[11,-22]],1.2);
      for(let k=0;k<10;k++){ const a=rad(200+k*14), x=3+C(a)*8.6, y=-31+S(a)*11; p.F(G[0]); p.rect(x,y,1,1); } });
    p.F(M.gem[3]); p.ell(3.4,-31.4,4.2,5.4); p.F(M.gem[2]); p.ell(3,-32,3.4,4.6); p.F(M.gem[1]); p.ell(2.4,-33,2.2,3); p.F(M.gem[0]); p.rect(1.2,-35,1.4,1.4);
    rivets(p,M.ruby,[[-4,-26],[10,-26]],1.1);
    // faixa da testa
    p.F(G[3]); bandA(p,[[-8,-19],[3,-21],[14,-19]],3); p.F(G[1]); bandA(p,[[-8,-19.6],[3,-21.6],[14,-19.6]],1.6);
  }
  function drawHead(p,M,sk,P,fur,tips){
    p.xf(sk.ha,sk.neck.x,sk.neck.y); const R=M.skin, A=sk.ha, Hh=M.hair;
    // cabelo crespo volumoso (atrás)
    [[-9,-14,8],[-12,-4,7],[-10,4,6],[-4,6,5],[-2,-22,7],[-12,-22,6],[-15,-12,5]].forEach(([x,y,r],k)=>{ p.F(Hh[3]); p.circle(P2(x+0.6,y+0.8),r); p.F(Hh[2]); p.circle(P2(x,y),r*0.92); p.F(Hh[1]); p.circle(P2(x-r*0.3,y-r*0.3),r*0.45); p.F(Hh[0]); p.rect(x-r*0.4,y-r*0.5,1,1); });
    p.F(R[2]); p.ell(1,1,4.4,4);
    const hd=[[-6,-2],[-8,-12],[-6,-21],[2,-25],[10,-22],[13,-15],[13,-7],[11,-1],[5,2],[-1,1]];
    p.F(R[2]); p.poly(hd); mass(p,R,4,-12,10,11,A,1);
    clipPoly(hd,()=>{ p.F(K_.qOf(R)[2]); p.ell(-4,-8,4,7); p.F(R[3]); p.ell(6,-3,3,1.4); });
    // olho fundo + glitter borrado
    const glow=1-P.dead;
    p.F(M.paint[2]); p.poly([[4,-17],[12,-18],[13,-14],[8,-11],[4,-13]]); p.F(M.paint[1]); p.poly([[5,-17],[11,-17.6],[10,-15],[6,-14.6]]); p.F(M.paint[0]); p.rect(7,-17,1,1);
    p.F(M.paint[3]); p.rect(6,-12,1,4); p.rect(9,-11,1,3); // escorrido
    p.F(M.mouth[3]); p.ell(9.4,-14,2.8,2.2);
    if(glow>0.3){ p.F(M.eye[2]); p.ell(9.8,-14,1.9,1.6); p.F(M.eye[1]); p.ell(10.2,-14.2,1.1,0.9); p.F(M.eye[0]); p.rect(10,-15,1,1); }
    p.F(R[3]); bandA(p,[[5,-18.6],[9,-19.4],[13,-18]],0.9);
    p.F(R[2]); p.poly([[13,-13],[16,-8],[13,-7]]); p.F(R[0]); p.rect(13,-12,1,2);
    // boca aberta com dentes (batom escuro borrado)
    const open=P.roar>0.5;
    p.F(M.mouth[1]); p.poly(open?[[6,-6],[13,-6],[12,1],[7,0]]:[[6,-5],[13,-5.4],[12,-2],[7,-2]]);
    p.F(M.mouth[3]); if(open) p.poly([[7,-4.6],[12,-4.6],[11.4,-0.4],[7.6,-0.6]]); else p.rect(7,-4,5,1.4);
    p.F(M.dust[0]); [7.6,9.4,11.2].forEach(x=>p.rect(x,-5.4,1,1.4)); if(open){ [8.4,10.4].forEach(x=>p.rect(x,-1.4,1,1.2)); }
    p.F(M.blood[2]); p.rect(11,-1,1,3);
    // brinco de gota
    p.F(M.gold[2]); p.rect(-2,-8,1,3); p.F(M.ruby[1]); p.ell(-1.6,-4,1.3,1.8);
    if(P.crownOff<0.5) drawCrown(p,M,P,fur,tips);
  }
  function drawLooseCrown(p,M,P){ p.xf(P.crR,AX+P.crX,GROUND-P.crY); drawCrown(p,M,Object.assign({},P,{droop:1.4,flut:0}),false,null); }

  /* ---------------- FX ---------------- */
  function sparkle(p,F,x,y,s){ p.F(F[1]); p.rect(x-0.5,y-s,1,s*2); p.rect(x-s,y-0.5,s*2,1); p.F(F[0]); p.rect(x-0.8,y-0.8,1.6,1.6); }
  function drawSparkles(p,M,sk,P){ p.id(); const t=Math.round(P.t);
    const L=[sk.T(10,-40),sk.T(-4,-30),sk.T(6,-12),sk.T(-8,-48),sk.T(12,-22),sk.H(3,-32),sk.H(13,-52),sk.H(-5,-53),sk.T(-9,-60),sk.T(14,2)];
    L.forEach((q,k)=>{ if(((k*3+t)%4)<2) sparkle(p,M.fx,q.x,q.y,k%3?2.4:3.4); }); }
  function drawRing(p,M,sk,P,front){ p.id(); const cx=sk.hip.x, cy=GROUND-58;
    const RR=[M.pA[0],M.pA[1]]; if(front) K_.smear(p,RR,cx,cy,64,74,20,160,0.26); else K_.smear(p,RR,cx,cy,64,74,200,340,0.26);
    for(let k=0;k<8;k++){ const a=rad((front?20:200)+k*20+(P.ph||0)*30), x=cx+C(a)*70, y=cy+S(a)*70*0.26; p.F(M[PCOL[k%3]][1]); p.cap(P2(x,y),P2(x-S(a)*14,y+C(a)*3.6),3,1); } }
  function drawCracks(p,M,x,s){ p.F(M.dust[3]); [[-1,-30,-4],[1,26,-3],[-1,-14,2],[1,40,1],[-1,-44,1]].forEach(([d,dx,dy])=>{ p.cap(P2(x,GROUND-1),P2(x+dx*s,GROUND-1+dy*s*0.4),1.6,0.6); }); }

  function parts(add,P,M,sk,form,anim){
    const fur=form==='furia', tips=[], cx=sk.hip.x;
    const W=fn=>p=>{ const q=twPen(p,P,cx); q.id(); fn(q); };
    const angF=Math.atan2(sk.wrF.y-sk.elF.y,sk.wrF.x-sk.elF.x), angB=Math.atan2(sk.wrB.y-sk.elB.y,sk.wrB.x-sk.elB.x);
    if(P.ring) add({noShade:true,smear:true,noRim:true},p=>drawRing(p,M,sk,P,false));
    if(P.fall>0.05) add({noShade:true},p=>{ p.id(); drawLoose(p,M,P); });
    add({noShade:true},W(p=>drawEsplendor(p,M,sk,P,fur,tips)));
    add({back:true},W(p=>drawUpper(p,M,sk.shB,sk.elB,false,P)));
    add({back:true},W(p=>drawFore(p,M,sk.elB,sk.wrB,false,P)));
    add({back:true},W(p=>drawHand(p,M,sk.wrB,angB,P)));
    add({back:true},W(p=>drawLeg(p,M,sk.hipB,sk.kneeB,sk.ankleB,P.fB,false)));
    add({},W(p=>drawLeg(p,M,sk.hipF,sk.kneeF,sk.ankleF,P.fF,true)));
    add({},W(p=>drawTorso(p,M,sk,P)));
    add({noShade:true},W(p=>drawFringe(p,M,sk,P)));
    add({},W(p=>drawHead(p,M,sk,P,fur,tips)));
    if(P.crownOff>0.5) add({},p=>drawLooseCrown(p,M,P));
    add({},W(p=>drawUpper(p,M,sk.shF,sk.elF,true,P)));
    add({},W(p=>drawFore(p,M,sk.elF,sk.wrF,true,P)));
    add({},W(p=>drawHand(p,M,sk.wrF,angF,P)));
    if(P.dead<0.5) add({noShade:true,noRim:true},W(p=>drawSparkles(p,M,sk,P)));
    if(fur&&P.dead<0.9&&P.ign>0.05) add({noShade:true,noRim:true},W(p=>{ const amp=Math.min(1.2,P.ign); flames(p,M.lua,tips.slice(0,30).filter((_,k)=>k%2===0),P.t+(P.ph||0),amp); }));
    if(P.ring) add({noShade:true,smear:true,noRim:true},p=>drawRing(p,M,sk,P,true));
    if(P.smear&&anim==='rain') add({noShade:true,smear:true,noRim:true},p=>{ p.id(); const h=sk.wrF; for(let k=0;k<7;k++){ const a=rad(60+k*10); p.F(M.fx[k%2?1:2]); p.cap(P2(h.x+S(a)*8,h.y+C(a)*8),P2(h.x+S(a)*70,h.y+C(a)*40),2.6,0.8); sparkle(p,M.fx,h.x+S(a)*76,h.y+C(a)*44,3); } });
    if(P.smear&&anim==='dash') add({noShade:true,smear:true,noRim:true},p=>{ p.id(); p.F(M.fx[1]); [-90,-60,-30].forEach((dy,k)=>p.cap(P2(sk.hip.x-110-k*10,sk.hip.y+dy+30),P2(sk.hip.x-50,sk.hip.y+dy+30),0.6,2.2)); });
    if(P.smear&&anim==='stomp') add({noShade:true,smear:true,noRim:true},p=>{ p.id(); K_.smear(p,M.fx,sk.kneeF.x-6,sk.kneeF.y-10,22,36,-60,40,0.9); });
    if(P.impact&&anim==='stomp') add({noShade:true,smear:true,noRim:true},p=>{ p.id(); const x=sk.ankleF.x+4; drawCracks(p,M,x,P.impact); dust(p,M.dust,M.fx,x,GROUND,0.42*P.impact); });
    if(P.impact&&anim==='death') add({noShade:true,smear:true,noRim:true},p=>{ p.id(); dust(p,M.dust,null,sk.hip.x-30,GROUND,0.5); });
  }
  function anchors(sk,P){ return {eye:sk.H(10,-14),head:sk.H(3,-24),back:sk.T(-9,-40),hand:sk.wrF,stomp:{x:sk.ankleF.x+4,y:GROUND}}; }
  function prop(add,P,M,form,anim){ add({noShade:true},p=>drawProp(p,M,Math.round(P.st||0))); }
  function drawProp(p,M,st){
    p.id(); const cx=40, g=30, cols=['suit','gold','gem','ruby','pA'];
    if(st<2){ // poça de lantejoulas e plumas no chão
      p.F(M.mouth[3]); p.ell(cx,g-1,30,5); p.F(M.suit[3]); p.ell(cx-2,g-1.4,26,3.6);
      for(let k=0;k<34;k++){ const R=M[cols[k%5]], x=cx-26+rnd(k,1)*52, y=g-4+rnd(k,2)*6; p.F(R[(k+st)%3===0?0:1]); p.rect(x,y,1.6,1.2); }
      [[-14,-1],[10,0],[22,-2]].forEach(([dx,dy],k)=>{ if((k+st)%2===0) sparkle(p,M.fx,cx+dx,g-4+dy,3); });
      feather(p,M.pA,P2(cx-18,g-2),70,16,4,8,5,0.3,null);
      return; }
    // rajada de lantejoulas voando
    const s=st-2;
    for(let k=0;k<16;k++){ const R=M[cols[k%5]], a=rnd(k,5)*PI*2+s*0.8, d=2+rnd(k,6)*10; const x=cx+C(a)*d, y=g-14+S(a)*d*0.7; p.F(R[3]); p.rect(x-1,y-1,2.4,2.4); p.F(R[1]); p.rect(x-0.6,y-0.6,1.6,1.6); }
    p.F(M.fx[2]); p.circle(P2(cx,g-14),4.4); p.F(M.fx[1]); p.circle(P2(cx,g-14),3); sparkle(p,M.fx,cx,g-14,5+s);
  }

  return K_.factory({SC,FW,FH,GROUND,AX,RIM,ANIMS,NAMES,REST,mats0,fix,skeleton:RG.skeleton,parts,anchors,PROP:{FW:80,FH:40,GROUND:30,AX:40},prop});
})();
