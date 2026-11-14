/* ESTIVADOR — fonte de arte (editável). Build: npm run art
   Chefe do Ver-o-Peso "O Estivador": estivador gigante do cais (~3 m) tomado pela Lua de Sangue. Ombros enormes,
   tronco inclinado pro gancho, regata branca suja de graxa, colete refletivo laranja rasgado, bermuda de brim
   cortada, botas de borracha, capacete de obra amassado, olhos de brasa, cicatrizes de corda nos ombros e uma
   âncora tatuada no braço. Gancho de carga de ferro na corrente enrolada no antebraço da frente; o braço de trás
   carrega um caixote de feira no ombro (sem texto: só a seta de "este lado pra cima" desbotada).
   Fúria: regata rasgada ao meio (peito queimado com rachaduras em brasa), gancho em chamas, corrente soltando
   faíscas, vapor. Adereço: caixote (inteiro, rachado, destruído) que fica no chão como obstáculo. Design nosso. */
const ESTIVADOR=(function(){
  const {rad,lp,lerp,P2}=PIX;
  const K_=BOSSKIT, {S,C,PI,mass,platePoly,clipPoly,band,bandA,ellPts,arc,bez,limb,fold,stitches,rivets,rnd,stain,chain,rope,flames,dust,sparks,puffs}=K_;
  const FW=480, FH=340, GROUND=328, AX=236;
  const RIM={normal:'#ffd8b8', furia:'#ff8a5a'};

  function mats0(form){
    const m={
      skin:['#f4cca2','#c48a68','#7c5056','#402834'],
      scar:['#f0a898','#b8646a','#7a3a4c','#42203a'],
      tattoo:['#9cb2da','#5c70aa','#3c4c7c','#232d52'],
      tank:['#fffaf0','#e0dacb','#a49c98','#5a5262'],
      grease:['#7a7070','#4a4244','#2c2628','#161214'],
      vest:['#ffc888','#f27a30','#b44626','#6a2222'],
      refl:['#ffffff','#e4eaf0','#a2acbe','#58607a'],
      jeans:['#94b0d6','#50709c','#324a6c','#1c2644'],
      belt:['#c88e5c','#845436','#4e3026','#281a16'],
      boot:['#76807a','#414844','#262a2e','#131518'],
      sole:['#f2d470','#c8962e','#7e5a24','#40301a'],
      helmet:['#fff2a4','#f2c232','#b27c22','#5c3c1c'],
      iron:['#b2acba','#625c6a','#3a3442','#1c1822'],
      rust:['#e8996a','#ac5c36','#6e3626','#3a1c1a'],
      wood:['#e8c286','#ae8650','#6e5236','#3c2c22'],
      rope:['#eadaa9','#baa271','#806c4d','#4b3d31'],
      paint:['#ff9a8a','#d24a46','#8a2a36','#4a1624'],
      burn:['#ffae84','#d0583e','#80283a','#40122a'],
      mouth:['#7c2c3c','#4c1a2a','#2e0e1a','#1c0712'],
      teeth:['#fff6d2','#e2ce92','#aa9450','#68562a'],
      blood:['#aa3c33','#76212b','#4b131f','#2b0913'],
      eye:['#ffffff','#ffe08a','#ff8a34','#b02c12'],
      ember:['#fffbe0','#ffd468','#ff7a30','#c02a10'],
      flame:['#fffbe8','#ffd26a','#ff7a30','#c42c12'],
      fx:['#fffef2','#fff2aa','#ffc24c','#e27c24'],
      dust:['#eadecd','#c6b6a0','#968671','#605448'],
    };
    if(form==='furia'){
      m.skin=['#f2c2a2','#c27c6a','#7e4252','#401f34'];
      m.scar=['#ffa890','#d0504c','#86283a','#460f24'];
      m.eye=['#ffffff','#fff2a0','#ffb030','#d0400e'];
      m.iron=['#d0aaa2','#7a5a5e','#463240','#221824'];
      m.tank=['#f8ecdc','#d2c4b4','#9a8c8c','#54485a'];
      m.vest=['#ffb878','#e2622a','#a43826','#5e1c22'];
      m.blood=['#e0503a','#a8282c','#6c1420','#3c0a14'];
    }
    return K_.finish(m,['fx','dust','eye','ember','flame']);
  }
  const NAMES={skin:'Pele queimada de sol',scar:'Cicatriz de corda',tattoo:'Âncora tatuada',tank:'Regata encardida',grease:'Graxa',vest:'Colete refletivo',refl:'Faixa refletiva',
    jeans:'Brim cortado',belt:'Cinto de couro',boot:'Bota de borracha',sole:'Solado',helmet:'Capacete de obra',iron:'Ferro do gancho',rust:'Ferrugem',wood:'Madeira do caixote',
    rope:'Corda',paint:'Tinta do caixote',burn:'Peito em brasa',eye:'Olho de brasa',flame:'Chama do gancho'};

  /* ---------------- poses ----------------
     hm: gancho 0 pendurado · 1 girando no alto (hk 0..1) · 2 lançado (cl = comprimento 0..1) · 3 em arco (hk graus) ·
         4 na mão (cabo) · 5 cravado no chão · 6 caído no chão
     caixote: crV visível, preso ao pulso de trás + (crx,cry), giro crA; crW=1 usa crX/crY absolutos (morte) */
  const REST={hx:0,drop:4,lean:6,head:0,aFs:22,aFe:46,aBs:170,aBe:-62,lFh:24,lFk:-6,lBh:-12,lBk:-40,fF:0,fB:0,
    hm:0,hk:0,cl:0,sw:0,crV:1,crx:16,cry:-14,crA:0,crW:0,crX:0,crY:0,lift:0,cable:0,rip:0,roar:0,flash:0,smear:0,impact:0,steam:0,dead:0,ph:0,fire:0};
  const ANIMS={
    idle:{nome:'Parado (respiração pesada, gancho balança)',n:8,dur:()=>175,pose:i=>{ const p=i/8*PI*2, s=S(p);
      return {lean:6+1.6*s, drop:4+1.8*S(p-0.5), head:2*S(p-0.9), aFs:22+4*S(p-0.4), aFe:46+6*S(p-0.9), aBs:170+2*s, aBe:-62+3*S(p-0.6), cry:-6+1.4*S(p-0.5), sw:S(p-1.4), ph:p}; }},
    walk:{nome:'Andar (passos que tremem a tela)',n:8,stomp:[2,6],dur:()=>162,pose:i=>{ const p=i/8*PI*2-PI/2;
      const lFh=14+22*S(p), lBh=-8+22*S(p+PI);
      return {lFh, lFk:lFh-26*Math.max(0,C(p))-4, lBh, lBk:lBh-26*Math.max(0,C(p+PI))-8, fF:-6*C(p), fB:-6*C(p+PI),
        drop:6+4*C(2*(p-PI/2)), lean:8+2.5*S(2*p), head:2+2.5*S(2*p-1), hx:1.5*S(2*p),
        aFs:22-12*S(p), aFe:46-10*S(p), aBs:170+3*S(2*p), aBe:-62+4*S(2*p), cry:-6+2*C(2*(p-PI/2)), sw:1.6*S(p+1.2), ph:2*p}; }},
    hook:{nome:'Gancho de carga (puxa até 4 tiles)',n:10,warn:[1,2,3],throwAt:4,dur:i=>[150,140,140,150,70,150,160,150,160,170][i],pose:i=>[
      {lean:-2,head:-2,aFs:-30,aFe:-10,hm:0,sw:-1.4,lFh:20,lBh:-16},
      {lean:-8,head:-10,aFs:168,aFe:178,hm:1,hk:0.05,lFh:22,lBh:-20,lBk:-30},
      {lean:-10,head:-12,aFs:170,aFe:182,hm:1,hk:0.38,lFh:22,lBh:-20,lBk:-30,roar:1},
      {lean:-10,head:-14,aFs:168,aFe:180,hm:1,hk:0.72,lFh:22,lBh:-20,lBk:-30,roar:1},
      {lean:16,head:6,hx:8,aFs:94,aFe:92,hm:2,cl:1,smear:1,lFh:34,lFk:4,lBh:-26,lBk:-34},
      {lean:18,head:8,hx:9,aFs:92,aFe:90,hm:2,cl:1,lFh:34,lFk:4,lBh:-26,lBk:-34},
      {lean:-10,head:-6,hx:2,aFs:50,aFe:18,hm:2,cl:0.55,lFh:12,lFk:-10,lBh:-24,lBk:-38,roar:1},
      {lean:-8,head:-4,aFs:40,aFe:10,hm:2,cl:0.22,lFh:14,lBh:-20},
      {lean:0,head:0,aFs:30,aFe:40,hm:0,sw:1.6},
      {lean:4,head:2,aFs:24,aFe:46,hm:0,sw:-0.6}][i]},
    toss:{nome:'Arremesso de caixote',n:10,warn:[2,3,4],tossAt:5,dur:i=>[160,170,170,150,150,70,170,170,190,170][i],pose:i=>[
      {lean:22,head:10,drop:8,lFh:30,lFk:-20,lBh:-16,lBk:-56,aFs:30,aFe:60,aBs:166,aBe:-56},
      {lean:-4,head:-6,aBs:182,aBe:178,crx:2,cry:-8,crA:-0.1,aFs:40,aFe:70,lFh:20,lBh:-14},
      {lean:-14,head:-16,aBs:204,aBe:204,crx:-6,cry:-8,crA:-0.25,aFs:60,aFe:90,roar:1,lFh:24,lFk:-2,lBh:-22,lBk:-34},
      {lean:-15,head:-18,aBs:206,aBe:206,crx:-6,cry:-8,crA:-0.28,aFs:62,aFe:92,roar:1,lFh:24,lFk:-2,lBh:-22,lBk:-34},
      {lean:-15,head:-18,aBs:206,aBe:208,crx:-6,cry:-8,crA:-0.3,aFs:64,aFe:94,roar:1,lFh:24,lFk:-2,lBh:-22,lBk:-34},
      {lean:20,head:10,hx:8,aBs:104,aBe:92,crV:0,smear:1,aFs:10,aFe:-20,lFh:36,lFk:6,lBh:-28,lBk:-36},
      {lean:24,head:12,hx:9,aBs:64,aBe:42,crV:0,aFs:0,aFe:-30,lFh:36,lFk:6,lBh:-28,lBk:-36},
      {lean:6,head:0,hx:4,aBs:-50,aBe:-80,crV:0,aFs:20,aFe:40},
      {lean:4,head:0,aBs:150,aBe:-46,crV:1,crx:14,cry:-2,crA:0.12,aFs:22,aFe:46},
      {lean:6,head:0,aBs:168,aBe:-60,aFs:22,aFe:46}][i]},
    sweep:{nome:'Varredura de gancho',n:9,warn:[1,2,3,4],hit:5,dur:i=>[150,160,160,110,70,90,150,170,170][i],pose:i=>[
      {lean:-6,head:-4,hx:-3,aFs:-50,aFe:-30,hm:3,hk:150,lFh:16,lBh:-20},
      {lean:-14,head:-10,hx:-6,aFs:-92,aFe:-70,hm:3,hk:196,lFh:14,lFk:-12,lBh:-24,lBk:-34},
      {lean:-15,head:-12,hx:-6,aFs:-94,aFe:-72,hm:3,hk:200,roar:1,lFh:14,lFk:-12,lBh:-24,lBk:-34},
      {lean:0,head:-2,hx:0,aFs:20,aFe:20,hm:3,hk:250,smear:1,lFh:24,lBh:-20},
      {lean:12,head:4,hx:6,aFs:84,aFe:86,hm:3,hk:350,smear:1,lFh:32,lFk:4,lBh:-26,lBk:-34},
      {lean:18,head:8,hx:9,aFs:104,aFe:108,hm:3,hk:24,smear:1,impact:0,lFh:36,lFk:6,lBh:-28,lBk:-36},
      {lean:16,head:6,hx:8,aFs:134,aFe:150,hm:3,hk:300,lFh:34,lFk:4,lBh:-26,lBk:-36},
      {lean:6,head:2,hx:3,aFs:60,aFe:70,hm:0,sw:2},
      {lean:6,head:0,aFs:24,aFe:46,hm:0,sw:-1}][i]},
    slam:{nome:'Guindaste (salto e gancho no chão)',n:11,warn:[1,2,3,4,5],hit:6,vuln:[8,9,10],dur:i=>[170,150,160,170,110,70,90,220,240,240,230][i],pose:i=>[
      {lean:26,head:14,drop:12,lFh:44,lFk:-34,lBh:-10,lBk:-70,aFs:30,aFe:70,hm:4},
      {lean:-6,head:-12,drop:-46,lFh:60,lFk:10,lBh:30,lBk:-30,fF:20,fB:30,aFs:172,aFe:196,hm:4,roar:1},
      {lean:-10,head:-14,drop:-74,lFh:66,lFk:16,lBh:36,lBk:-20,fF:24,fB:34,aFs:178,aFe:206,hm:4,roar:1},
      {lean:-8,head:-14,drop:-76,lFh:62,lFk:12,lBh:34,lBk:-24,fF:20,fB:30,aFs:176,aFe:200,hm:4,roar:1},
      {lean:10,head:0,drop:-34,lFh:40,lFk:-6,lBh:10,lBk:-40,aFs:130,aFe:120,hm:4,smear:1},
      {lean:24,head:8,drop:-6,lFh:36,lFk:-14,lBh:-6,lBk:-56,aFs:86,aFe:60,hm:4,smear:1},
      {lean:36,head:16,drop:14,hx:6,lFh:46,lFk:-28,lBh:-16,lBk:-70,aFs:50,aFe:28,hm:5,impact:1},
      {lean:38,head:20,drop:14,hx:6,lFh:46,lFk:-28,lBh:-16,lBk:-70,aFs:48,aFe:26,hm:5,steam:1},
      {lean:36,head:22,drop:14,hx:6,lFh:46,lFk:-28,lBh:-16,lBk:-70,aFs:46,aFe:22,hm:5,steam:1},
      {lean:30,head:14,drop:12,hx:4,lFh:42,lFk:-24,lBh:-16,lBk:-64,aFs:40,aFe:14,hm:5,steam:1},
      {lean:18,head:6,drop:8,hx:2,lFh:34,lFk:-14,lBh:-14,lBk:-54,aFs:30,aFe:40,hm:0,sw:1}][i]},
    rage:{nome:'Entrar em fúria (rasga a regata, gancho acende)',n:8,dur:i=>[180,140,120,200,220,220,220,200][i],pose:i=>[
      {lean:20,head:20,aFs:150,aFe:-70,hm:6,drop:6},
      {lean:22,head:24,aFs:154,aFe:-74,hm:6,drop:8,hx:-1,steam:1},
      {lean:6,head:4,aFs:60,aFe:20,hm:6,rip:1,drop:4,hx:2},
      {lean:-12,head:-20,aFs:150,aFe:160,hm:1,hk:0.1,roar:1,rip:0.6,fire:0.6,drop:-2},
      {lean:-18,head:-30,aFs:152,aFe:162,hm:1,hk:0.45,roar:1,fire:1,hx:-3,steam:1},
      {lean:-18,head:-30,aFs:152,aFe:162,hm:1,hk:0.8,roar:1,fire:1,hx:3,steam:1},
      {lean:-14,head:-26,aFs:150,aFe:160,hm:1,hk:0.15,roar:1,fire:1,hx:-2},
      {lean:6,head:0,aFs:24,aFe:46,hm:0,fire:1}][i]},
    hurt:{nome:'Dano',n:4,dur:i=>[80,110,130,160][i],pose:i=>[
      {flash:1,lean:-12,head:-20,hx:-6,aFs:-20,aFe:-10,aBs:150,aBe:-90,roar:1,sw:-2},
      {lean:-8,head:-14,hx:-4,aFs:-6,aFe:10,aBs:160,aBe:-76,roar:1,sw:-1},
      {lean:-2,head:-4,hx:-1,aFs:14,aFe:36,sw:1},
      {}][i]},
    intro:{nome:'Entrada (WARNING): desce do guindaste pelo cabo',n:12,dur:i=>[260,200,170,140,120,200,150,140,150,220,300,260][i],pose:i=>[
      {drop:-176,lean:-4,head:8,aFs:176,aFe:182,cable:1,hm:0,sw:2,lFh:8,lFk:2,lBh:-10,lBk:-6,fF:30,fB:40},
      {drop:-136,lean:-4,head:6,aFs:176,aFe:182,cable:1,hm:0,sw:-2,lFh:10,lFk:2,lBh:-8,lBk:-4,fF:30,fB:40},
      {drop:-88,lean:-2,head:2,aFs:176,aFe:182,cable:1,hm:0,sw:1,lFh:14,lFk:0,lBh:-6,lBk:-6,fF:24,fB:30},
      {drop:-38,lean:2,head:0,aFs:170,aFe:178,cable:0.5,hm:0,sw:-1,lFh:24,lFk:-4,lBh:-10,lBk:-20},
      {drop:16,lean:30,head:16,lFh:48,lFk:-36,lBh:-12,lBk:-74,aFs:60,aFe:90,hm:0,impact:1,sw:2},
      {drop:12,lean:28,head:14,lFh:44,lFk:-32,lBh:-12,lBk:-70,aFs:50,aFe:70,hm:0,steam:1,sw:1},
      {lean:0,head:-4,aFs:168,aFe:178,hm:1,hk:0.1},
      {lean:-4,head:-6,aFs:170,aFe:182,hm:1,hk:0.45},
      {lean:-6,head:-8,aFs:170,aFe:182,hm:1,hk:0.8,roar:1},
      {lean:-14,head:-26,aFs:120,aFe:150,hm:0,roar:1,steam:1,sw:2},
      {lean:-16,head:-28,aFs:124,aFe:154,hm:0,roar:1,steam:1,sw:-2},
      {lean:6,head:0,aFs:24,aFe:46,hm:0}][i]},
    death:{nome:'Morte (gancho cai, caixote rola por cima)',n:14,dur:i=>[90,160,170,180,200,150,90,170,200,180,180,200,400,700][i],pose:i=>{
      const lie={lean:-90,head:-4,hx:30,aFs:-70,aFe:-96,aBs:-80,aBe:-100,lFh:86,lFk:82,lBh:80,lBk:76,hm:6,crV:1,crW:1};
      return [
        {flash:1,lean:-14,head:-22,hx:-6,aFs:-20,aFe:-10,roar:1,sw:-2},
        {lean:-18,head:-28,hx:-8,aFs:150,aFe:170,roar:1,sw:2},
        {lean:10,head:20,hx:-4,aFs:20,aFe:10,hm:6,steam:1},
        {lean:18,head:26,drop:10,lFh:50,lFk:-40,lBh:-8,lBk:-76,aFs:10,aFe:0,hm:6},
        {lean:20,head:30,drop:30,lFh:80,lFk:-10,lBh:20,lBk:-90,fF:-20,aFs:20,aFe:10,hm:6,aBs:150,aBe:-50},
        {lean:14,head:30,drop:30,lFh:80,lFk:-10,lBh:20,lBk:-90,fF:-20,aFs:30,aFe:20,hm:6,aBs:110,aBe:40,crW:1,crX:40,crY:120,crA:0.5},
        {lean:4,head:36,drop:32,lFh:80,lFk:-10,lBh:20,lBk:-90,fF:-20,aFs:40,aFe:30,hm:6,aBs:80,aBe:40,crW:1,crX:44,crY:96,crA:1.1,impact:0,flash:0},
        {lean:-40,head:0,hx:10,lFh:60,lFk:40,lBh:40,lBk:30,aFs:140,aFe:160,aBs:130,aBe:150,hm:6,crW:1,crX:52,crY:30,crA:1.6},
        Object.assign({},lie,{crX:30,crY:68,crA:2.4,impact:1}),
        Object.assign({},lie,{crX:-4,crY:62,crA:3.2}),
        Object.assign({},lie,{crX:-40,crY:44,crA:4.2}),
        Object.assign({},lie,{crX:-64,crY:20,crA:4.71}),
        Object.assign({},lie,{crX:-64,crY:20,crA:4.71,dead:0.6}),
        Object.assign({},lie,{crX:-64,crY:20,crA:4.71,dead:1})][i]; }},
    xCrate:{nome:'Caixote (inteiro, rachado, destruído)',n:3,prop:true,dur:()=>200,pose:i=>({st:i})},
  };
  // postura de chefe: tronco ~20° pra frente, joelhos dobrados, base larga (menos deitado na morte)
  function fix(P,anim,i){ if(!(anim==='death'&&i>=7)){ P.lean+=14; P.head-=10; P.lFk=Math.min(P.lFk,P.lFh-30); P.lBk=Math.min(P.lBk,P.lBh-28); P.drop+=2; } }

  const RG=K_.rig({AX,GROUND,THI:46,SHN:44,UPA:46,FOA:42,hipW:14,neck:[26,-132],shF:[32,-116],shB:[-30,-118],HS:1,FT:16,FL:28,
    contacts:(b,P)=>[b.T(-44,-60).y+2,b.T(-36,-118).y+2,b.T(40,-40).y+2,b.H(-8,-44).y+2,b.H(30,-10).y+2,b.kneeF.y+12,b.kneeB.y+12]});

  /* ---------------- gancho de carga ---------------- */
  // olhal na origem, haste ao longo de +x; E = lado em que abre a curva (+1/-1)
  function drawHook(p,M,at,ang,sz=1,E=1){
    p.xf(ang,at.x,at.y); BOSSKIT.st.CTX.scale(sz,sz*E); const I=M.iron, R=M.rust;
    p.F(I[2]); p.ell(0,0,6.4,6.4); p.F(I[1]); p.ell(-0.6,-0.8,5,5); p.F(I[3]); p.ell(0,0,2.6,2.6); p.F(I[0]); p.rect(-3,-5,3,1.2);
    p.F(I[2]); p.rect(5,-5,7,10); p.F(I[1]); p.rect(5.6,-4.4,5.6,4); p.F(I[3]); p.rect(5,3.6,7,1.4); p.F(I[0]); p.rect(6,-4.4,4,1);
    const curve=[P2(12,0),P2(36,0),P2(44,3),P2(49,10),P2(49.5,19),P2(45,26),P2(37,29.5),P2(29,27.5),P2(24,22),P2(22.5,15)];
    p.F(I[2]); for(let k=0;k<curve.length-1;k++){ const w=k<2?9.4:9.4-k*0.55; p.cap(curve[k],curve[k+1],w,w-0.55); }
    p.poly([[18.4,15.4],[21,7.6],[27.2,14.6],[23.6,19.4]]);
    p.F(I[1]); band(p,[P2(12,-1.6),P2(36,-1.6),P2(43,1.4),P2(47.2,8.6),P2(47.4,17)],4.4);
    p.F(I[0]); band(p,[P2(13,-3),P2(34,-3),P2(41,-0.6)],1.3); band(p,[P2(46,8),P2(46.4,14)],1.2);
    p.F(I[3]); band(p,[P2(26,4),P2(38,5),P2(43,11),P2(42.6,19),P2(37,23.4),P2(30,22)],1.5); p.poly([[19.8,14.6],[21.4,9.8],[23,15.6]]);
    // ferrugem e solda
    p.F(R[1]); [[30,2.6,3,1.6],[46,22,2.4,2.4],[18,-2,2,1.2]].forEach(([x,y,rx,ry])=>p.ell(x,y,rx,ry)); p.F(R[2]); [[31,3,1.4,0.8],[45.6,22.6,1.2,1.2]].forEach(([x,y,rx,ry])=>p.ell(x,y,rx,ry));
    p.F(I[0]); [14,17,20,23].forEach(x=>p.rect(x,3,1.4,1.4));
    p.F(M.blood[2]); p.ell(24,20,2,2.6); p.F(M.blood[1]); p.rect(23.4,20,1.2,4);
  }
  // pontos da curva do gancho no mundo (pra chamas)
  function hookPts(at,ang,sz,E){ const c=C(ang), s=S(ang), T=(x,y)=>({x:at.x+(x*c-y*E*s)*sz, y:at.y+(x*s+y*E*c)*sz}); return [T(30,-2),T(46,8),T(47,22),T(34,29),T(23,18),T(10,0)]; }
  function hookPose(sk,P){
    const w=sk.wrF, m=Math.round(P.hm);
    if(m===0){ const sw=P.sw; const eye={x:w.x+4+sw*4,y:w.y+34}; return {eye,ang:PI/2-sw*0.12,E:-1,ch:bez(w,{x:w.x+2+sw*3,y:w.y+18},eye,4)}; }
    if(m===1){ const a=P.hk*PI*2, eye={x:w.x+C(a)*46,y:w.y-14+S(a)*14}; return {eye,ang:a,E:1,ch:bez(w,{x:(w.x+eye.x)/2,y:w.y-26},eye,5),orbit:a}; }
    if(m===2){ const L=30+P.cl*230, eye={x:w.x+L,y:w.y+2+(1-P.cl)*8}; return {eye,ang:PI,E:1,ch:bez(w,{x:w.x+L*0.5,y:w.y+6+(1-P.cl)*10},eye,8),out:P.cl>0.9}; }
    if(m===3){ const a=rad(P.hk), eye={x:w.x+C(a)*64,y:w.y+S(a)*30}; return {eye,ang:a,E:1,ch:bez(w,{x:w.x+C(a)*30,y:w.y+S(a)*14-6},eye,6)}; }
    if(m===4){ const eye={x:w.x-2,y:w.y-6}; return {eye,ang:0,E:1,ch:null,grip:true}; }
    if(m===5){ const tip={x:w.x+24,y:GROUND-14}; return {eye:{x:w.x+4,y:w.y-2},ang:Math.atan2(tip.y-w.y,tip.x-w.x),E:-1,ch:null,stuck:true}; }
    const eye={x:sk.hip.x+64,y:GROUND-14}; return {eye,ang:0.1,E:1,ch:bez(w,{x:(w.x+eye.x)/2,y:GROUND-4},eye,6),floor:true};
  }
  function drawHookAll(p,M,sk,P,fur){
    p.id(); const h=hookPose(sk,P);
    if(h.ch){ chain(p,M.iron,h.ch,1.15); }
    if(h.out) return h;
    if(h.grip){ const a=Math.atan2(sk.wrF.y-sk.elF.y,sk.wrF.x-sk.elF.x); drawHook(p,M,{x:sk.wrF.x-C(a)*4,y:sk.wrF.y-S(a)*4},a,1.25,1); h.ang=a; h.eye={x:sk.wrF.x-C(a)*4,y:sk.wrF.y-S(a)*4}; return h; }
    drawHook(p,M,h.eye,h.ang,1.25,h.E);
    if(h.stuck){ p.id(); p.F(M.dust[2]); p.ell(sk.wrF.x+46,GROUND-3,26,5); p.F(M.dust[3]); [[-14,0],[0,-2],[14,0]].forEach(([dx,dy])=>p.poly([[sk.wrF.x+46+dx-3,GROUND-2+dy],[sk.wrF.x+46+dx,GROUND-9+dy],[sk.wrF.x+46+dx+3,GROUND-2+dy]])); }
    return h;
  }

  /* ---------------- caixote ---------------- */
  function drawCrate(p,M,cx,cy,ang,st=0,sc=1){
    p.xf(ang,cx,cy); if(sc!==1) BOSSKIT.st.CTX.scale(sc,sc); const W=M.wood, w=25, h=20;
    if(st>=2){ // destruído: tábuas no chão
      p.id(); const g=cy+h*sc;
      [[-26,-3,0.2],[-6,-6,-0.15],[14,-2,0.35],[-16,-11,-0.5],[6,-12,0.6]].forEach(([dx,dy,a],k)=>{ p.xf(a,cx+dx,g+dy); p.F(W[2]); p.rect(-12,-3,24,6); p.F(W[1]); p.rect(-12,-3,24,3.4); p.F(W[0]); p.rect(-11,-3,20,1); p.F(W[3]); p.rect(-12,2.4,24,1); p.F(M.iron[1]); p.rect(-9,-1.4,1.4,1.4); p.rect(8,-1.4,1.4,1.4);
        if(k===1){ p.F(W[3]); p.poly([[10,-3],[14,-3],[12,3]]); } });
      p.id(); p.F(M.dust[2]); p.ell(cx,g,30,4); return; }
    // fundo escuro entre as ripas
    p.F(W[3]); p.rect(-w,-h,w*2,h*2);
    // postes dos cantos e ripas horizontais
    const slats=[-h+1,-h/2+2,3,h/2+3]; slats.forEach((y,k)=>{ if(st===1&&k===1) return; platePoly(p,W,[[-w,y-1],[w,y-1],[w,y+6],[-w,y+6]],ang,0.7); p.F(W[0]); p.rect(-w+3,y-1,w*2-8,1); p.F(W[3]); p.rect(-w,y+5,w*2,1); });
    [[-w,-h,6,h*2],[w-6,-h,6,h*2]].forEach(([x,y,ww,hh])=>{ platePoly(p,W,[[x,y],[x+ww,y],[x+ww,y+hh],[x,y+hh]],ang,0.9); p.F(W[0]); p.rect(x+1,y+1,1,hh-2); });
    // tinta desbotada: setas de "este lado pra cima" (sem texto)
    p.F(M.paint[2]); [[-9,-4],[3,-4]].forEach(([x,y])=>{ p.poly([[x,y-6],[x+5,y],[x+2,y],[x+2,y+7],[x-2,y+7],[x-2,y],[x-5,y]]); });
    p.F(M.paint[1]); [[-9,-4],[3,-4]].forEach(([x,y])=>p.rect(x-1,y-4,2,3));
    // pregos, palha saindo, mancha
    rivets(p,M.iron,[[-w+3,-h+3],[w-3,-h+3],[-w+3,h-3],[w-3,h-3],[-w+3,0],[w-3,0]],1.2);
    p.F(M.rope[1]); [[-6,-h-1,-10,-h-6],[4,-h-1,8,-h-5],[0,-h-1,1,-h-7]].forEach(([a,b,c,d])=>p.cap(P2(a,b),P2(c,d),1.2,0.8));
    p.F(M.grease[2]); p.ell(12,10,4,2.6);
    if(st===1){ p.F(W[3]); bandA(p,[[-14,-h+4],[-6,-2],[-10,6],[0,14]],1.6); p.F(W[0]); bandA(p,[[-13,-h+3],[-5,-3]],0.8);
      p.F(W[2]); p.poly([[-w+6,-h/2+2],[-2,-h/2+1],[-6,-h/2+7],[-w+6,-h/2+8]]); p.F(M.rope[1]); p.rect(2,-h/2+3,8,2); }
  }

  /* ---------------- membros ---------------- */
  function drawUpper(p,M,sh,el,front){
    const {ang,L}=limb(p,sh,el), R=M.skin;
    p.F(R[2]); p.cap(P2(0,0),P2(L,0),40,32);
    mass(p,R,L*0.5,-5,21,15,ang); mass(p,R,L*0.42,6,17,12,ang,0.6); mass(p,R,0,0,24,22,ang,0.8);
    p.F(R[3]); arc(p,0,0,20,18,60,130,1.4,4); p.cap(P2(L*0.3,2),P2(L*0.86,2.4),1.4,1);
    // cicatrizes de corda no ombro
    p.F(M.scar[2]); arc(p,0,0,14,13,200,330,2.2,6); p.F(M.scar[1]); arc(p,0,-1,14,13,210,320,1,6);
    if(front){ // âncora tatuada, desbotada
      const x=L*0.5, y=-3; p.F(M.tattoo[2]); p.cap(P2(x-8,y),P2(x+7,y),2,2); p.cap(P2(x+6,y-6),P2(x+6,y+6),1.6,1.6);
      p.F(M.tattoo[1]); bandA(p,[[x-8,y-5],[x-10,y],[x-8,y+5]],1.6); p.ell(x+8,y,2.2,2.2); p.F(M.skin[1]); p.ell(x+8,y,0.9,0.9);
      p.F(M.tattoo[0]); p.rect(x-2,y-1,4,1);
    } else { p.F(M.grease[2]); p.ell(L*0.6,-6,5,3); p.ell(L*0.3,7,3,2); }
  }
  function drawFore(p,M,el,wr,front,P,fur){
    const {ang,L}=limb(p,el,wr), R=M.skin;
    p.F(R[2]); p.cap(P2(0,0),P2(L,0),33,27);
    mass(p,R,L*0.32,-3,18,14,ang); mass(p,R,L*0.55,5,13,10,ang,0.5);
    p.F(R[3]); p.cap(P2(L*0.2,3),P2(L*0.8,4),1.3,1); p.F(qOfQ(R)[0]); p.rect(L*0.2,-11,L*0.4,1);
    // veias
    p.F(R[3]); bandA(p,[[L*0.3,-6],[L*0.5,-4],[L*0.7,-6]],0.9);
    if(front){ // corrente enrolada no antebraço
      for(let k=0;k<4;k++){ const x=L*(0.3+k*0.15); chain(p,M.iron,[P2(x-5,-15),P2(x+5,15)],0.95); }
      if(fur){ p.F(M.ember[1]); [[L*0.36,-12],[L*0.66,10]].forEach(([x,y])=>p.rect(x,y,1.6,1.6)); }
    } else { rope(p,M.rope,[P2(L*0.5,-14),P2(L*0.62,14)],3.2); rope(p,M.rope,[P2(L*0.64,-14),P2(L*0.76,14)],3.2); }
    p.F(M.grease[2]); p.ell(L*0.82,6,3,2);
  }
  const qOfQ=R=>K_.qOf(R);
  function drawHand(p,M,wr,ang,grip){
    p.xf(ang,wr.x,wr.y); const R=M.skin;
    if(grip){
      p.F(R[2]); p.ell(6,0,14,13); mass(p,R,6,-1,13,11.5,ang,0.6);
      p.F(R[3]); [-6,0,6].forEach(y=>p.cap(P2(9,y),P2(17,y+0.6),1.3,1.3));
      p.F(R[0]); [-7,-1,5].forEach(y=>p.rect(14,y,2.6,1.2));
    } else {
      p.F(R[2]); p.ell(5,0,12,12);
      [[-30,14],[-10,16],[8,16],[26,14]].forEach(([a,L])=>{ const r=rad(a), e=P2(8+C(r)*L,S(r)*L); p.F(R[2]); p.cap(P2(8,S(r)*4),e,6.2,5); p.F(R[1]); p.cap(P2(8,S(r)*4-0.8),P2(e.x-0.6,e.y-0.8),3.8,2.8); p.F(R[3]); p.circle(e,1.2); });
      p.F(R[2]); p.cap(P2(2,-9),P2(11,-18),6.6,5); p.F(R[1]); p.cap(P2(2,-9.6),P2(10.4,-17.6),3.8,2.8);
      mass(p,R,4,0,11,10,ang,0.6);
    }
    p.F(M.grease[2]); p.ell(9,4,2.6,1.6);
  }
  function drawLeg(p,M,hip,knee,ankle,fa,front){
    let t=limb(p,hip,knee); const J=M.jeans;
    p.F(J[2]); p.cap(P2(0,0),P2(t.L,0),34,28); mass(p,J,t.L*0.42,-2,18,13,t.ang,0.6);
    fold(p,J,[[t.L*0.68,-12],[t.L*0.76,-6],[t.L*0.72,0]],1.3); fold(p,J,[[t.L*0.46,10],[t.L*0.62,11]],1.2);
    p.F(J[0]); p.cap(P2(t.L*0.15,-11),P2(t.L*0.5,-12),1.2,1);
    // costura dupla do brim
    p.F(M.sole[2]); for(let k=0;k<6;k++) p.rect(t.L*(0.12+k*0.13),9,2,0.9);
    t=limb(p,knee,ankle); const R=M.skin, B=M.boot;
    // bainha cortada desfiada logo abaixo do joelho
    p.F(J[2]); p.cap(P2(-3,0),P2(t.L*0.26,0),30,27); p.F(J[1]); p.cap(P2(-2,-4),P2(t.L*0.2,-5),16,14);
    p.F(J[0]); [[-12,0],[-6,0],[1,0],[7,0]].forEach(([y],k)=>p.rect(t.L*0.26,y,1.4+(k%2)*2,1.2));
    p.F(J[3]); [[-10],[-3],[4],[10]].forEach(([y],k)=>p.rect(t.L*0.27,y,2+(k%3),1));
    // canela
    p.F(R[2]); p.cap(P2(t.L*0.26,0),P2(t.L*0.5,0),22,21); mass(p,R,t.L*0.38,-2,8,8,t.ang,0.6);
    // bota de borracha (cano alto)
    p.F(B[2]); p.cap(P2(t.L*0.46,0),P2(t.L,0),27,26); p.F(B[1]); p.cap(P2(t.L*0.48,-3),P2(t.L*0.96,-4),17,15);
    p.F(B[0]); p.cap(P2(t.L*0.54,-9),P2(t.L*0.9,-10),2.4,2); p.F(B[3]); p.cap(P2(t.L*0.46,-13.6),P2(t.L*0.46,13.6),3,3);
    p.F(M.sole[1]); p.cap(P2(t.L*0.5,-13.4),P2(t.L*0.5,13.4),1.4,1.4);
    p.F(M.dust[3]); [[0.66,5,3,2],[0.8,-4,2.4,1.6]].forEach(([u,y,rx,ry])=>p.ell(t.L*u,y,rx,ry));
    p.xf(rad(fa),ankle.x,ankle.y);
    p.F(B[2]); p.poly([[-14,-13],[12,-13],[23,-6],[31,1],[33,7],[32,12],[-16,12],[-17,-2]]);
    p.F(B[1]); p.poly([[-11,-12],[12,-12],[22,-5],[29,1],[20,3],[-9,1]]);
    p.F(B[0]); p.ell(21,-3,5,1.6); p.rect(-7,-11,10,1.4);
    p.F(M.sole[2]); p.rect(-16,8.6,49,3.6); p.F(M.sole[1]); p.rect(-15,8.6,46,1.2); p.F(B[3]); [-11,-2,7,16,24].forEach(x=>p.rect(x,11,3,1.2));
    p.F(M.dust[2]); p.ell(-4,6,4,2);
  }

  /* ---------------- tronco ---------------- */
  function drawPelvis(p,M,sk,P){
    p.xf(sk.a,sk.hip.x,sk.hip.y); const J=M.jeans, B=M.belt;
    p.F(J[2]); p.poly([[-32,-8],[34,-8],[38,10],[18,22],[-16,22],[-34,10]]);
    p.F(J[1]); p.poly([[-22,-8],[32,-8],[34,6],[-20,8]]);
    p.F(B[2]); p.poly([[-33,-12],[35,-12],[36,-3],[-34,-3]]); p.F(B[1]); p.rect(-32,-12,66,3); p.F(B[0]); p.rect(-30,-12,60,1);
    p.F(M.iron[1]); p.rect(20,-13,10,11); p.F(M.iron[3]); p.rect(22,-11,6,7); p.F(M.iron[0]); p.rect(20,-13,10,1.4);
    // rolo de corda pendurado na anca
    p.id(); const r=sk.T(-30,4); rope(p,M.rope,ellPts(r.x,r.y+8,9,11,0,360,12).map(q=>P2(q[0],q[1])),3.4); rope(p,M.rope,[P2(r.x+2,r.y+18),P2(r.x-2,r.y+30)],3);
  }
  function drawTorso(p,M,sk,P,fur){
    p.xf(sk.a,sk.hip.x,sk.hip.y); const R=M.skin, A=sk.a, T=M.tank;
    // massa de pele (costas, ombros, trapézio)
    const body=[[-30,-4],[-40,-40],[-46,-80],[-42,-112],[-26,-128],[0,-136],[26,-136],[46,-124],[56,-100],[58,-70],[50,-36],[38,-6]];
    p.F(R[2]); p.poly(body); mass(p,R,0,-110,40,22,A,0.9); mass(p,R,30,-122,22,14,A,1);
    // regata
    const tk=[[-34,-6],[-40,-40],[-44,-82],[-38,-108],[-24,-114],[-14,-104],[4,-112],[22,-122],[34,-118],[42,-104],[54,-84],[56,-56],[48,-28],[40,-4]];
    p.F(T[1]); p.poly(tk);
    clipPoly(tk,()=>{ mass(p,T,10,-60,48,56,A,1);
      platePoly(p,T,[[-46,-110],[-16,-110],[-12,-60],[-18,-4],[-44,-4]],A,0.3);
      fold(p,T,[[-2,-96],[6,-78],[10,-60]]); fold(p,T,[[24,-70],[36,-56],[46,-50]]); fold(p,T,[[-8,-40],[6,-28],[20,-22]]); fold(p,T,[[-28,-80],[-24,-56]]);
      // graxa e suor
      p.F(M.grease[1]); p.ell(30,-40,8,5); p.ell(-20,-60,5,9); p.F(M.grease[2]); p.ell(31,-41,4,2.6); p.rect(30,-38,1.6,10); p.ell(12,-90,3,2);
      p.F(T[2]); p.ell(16,-104,9,5); p.ell(-30,-30,8,10);
      p.F(T[3]); [[2,-48],[-8,-20],[40,-74]].forEach(([x,y])=>p.ell(x,y,2.4,1.8));
      stain(p,M.blood,20,-30,5,2,3);
      if(fur){ // rasgo no meio: peito em brasa à mostra
        const rip=[[4,-118],[14,-110],[10,-96],[20,-84],[14,-70],[24,-56],[18,-40],[28,-24],[22,-6],[52,-6],[56,-60],[50,-96],[40,-116]];
        p.F(M.burn[2]); p.poly(rip);
        clipPoly(rip,()=>{ mass(p,M.burn,40,-66,26,40,A,1); mass(p,M.skin,44,-92,14,12,A,0.8);
          p.F(M.ember[2]); bandA(p,[[26,-100],[34,-86],[30,-74],[40,-60]],1.6); bandA(p,[[38,-46],[30,-30],[36,-16]],1.4); bandA(p,[[46,-80],[52,-66]],1.2);
          p.F(M.ember[1]); bandA(p,[[27,-99],[33,-87]],0.8); bandA(p,[[38,-45],[31,-31]],0.7);
          p.F(M.burn[3]); [[30,-60,4,3],[44,-36,3,4]].forEach(([x,y,rx,ry])=>p.ell(x,y,rx,ry)); });
        p.F(T[3]); bandA(p,rip.slice(0,9),1.6); p.F(T[0]); bandA(p,rip.slice(0,9).map(q=>[q[0]-1.4,q[1]]),0.8);
        p.F(T[2]); [[14,-110],[20,-84],[24,-56],[28,-24]].forEach(([x,y])=>p.poly([[x,y],[x+7,y+3],[x+1,y+6]]));
      }
    });
    // gola e alças da regata
    p.F(T[2]); band(p,[P2(-24,-114),P2(-14,-104),P2(4,-112),P2(22,-122)],1.8);
    // cicatrizes de corda no trapézio
    p.F(M.scar[2]); bandA(p,[[-20,-124],[0,-130],[22,-128]],2.2); p.F(M.scar[1]); bandA(p,[[-18,-125],[0,-131],[20,-129]],0.9);
    // colete refletivo aberto (rasgado): painel de trás e frente
    const V=M.vest, RF=M.refl;
    const vb=[[-36,-4],[-44,-40],[-48,-86],[-42,-112],[-30,-118],[-22,-104],[-18,-60],[-14,-30],[-18,-6],[-24,-1],[-28,-8]];
    platePoly(p,V,vb,A,0.8); clipPoly(vb,()=>{ fold(p,V,[[-38,-90],[-32,-60],[-30,-30]]); p.F(RF[1]); p.poly([[-50,-74],[-14,-72],[-14,-64],[-50,-66]]); p.poly([[-50,-38],[-14,-36],[-14,-28],[-50,-30]]);
      p.F(RF[0]); p.rect(-48,-74,30,1.6); p.rect(-48,-38,30,1.6); p.F(RF[2]); p.rect(-50,-66,36,1.2); p.rect(-50,-30,36,1.2);
      p.F(M.grease[1]); p.ell(-30,-50,5,4); p.F(V[3]); p.poly([[-24,-8],[-20,-20],[-16,-6]]); });
    const vf=[[44,-110],[52,-112],[58,-96],[60,-66],[56,-34],[52,-4],[42,-6],[46,-34],[50,-66],[48,-96]];
    platePoly(p,V,vf,A,1); clipPoly(vf,()=>{ p.F(RF[1]); p.poly([[40,-74],[62,-74],[62,-66],[40,-66]]); p.poly([[40,-38],[62,-38],[62,-30],[40,-30]]); p.F(RF[0]); p.rect(42,-74,16,1.6); p.rect(42,-38,16,1.6); });
    // rasgos do colete (pontas soltas)
    p.F(V[2]); p.poly([[52,-4],[48,6],[44,-4]]); p.poly([[-18,-6],[-20,6],[-26,-2]]); p.F(V[3]); p.poly([[56,-34],[62,-28],[56,-24]]);
    if(P.rip>0){ // tiras da regata voando
      p.id(); const c=sk.T(20,-70), k=P.rip; p.F(T[1]); [[30,-30,0.6],[44,-6,-0.4],[20,-48,1.2],[50,-40,0.2]].forEach(([dx,dy,a])=>{ p.xf(a,c.x+dx*k,c.y+dy*k); p.poly([[-6,-2],[6,-3],[5,2],[-5,3]]); });
      p.id(); p.F(T[3]); [[30,-30],[44,-6]].forEach(([dx,dy])=>p.rect(c.x+dx*k-3,c.y+dy*k+1,6,1));
    }
  }

  /* ---------------- cabeça ---------------- */
  function drawHead(p,M,sk,P,fur){
    p.xf(sk.ha,sk.neck.x,sk.neck.y); const R=M.skin, A=sk.ha, H=M.helmet;
    // pescoço curto e grosso
    p.F(R[2]); p.ell(-2,4,20,12); mass(p,R,0,2,18,10,A,0.6);
    // crânio e mandíbula
    p.F(R[2]); p.poly([[-14,2],[-18,-20],[-12,-34],[18,-36],[30,-26],[34,-12],[32,0],[22,6],[2,8]]);
    mass(p,R,8,-16,22,20,A,1);
    // mandíbula quadrada com barba por fazer
    p.F(R[3]); p.poly([[10,4],[32,0],[30,6],[14,9]]); p.F(qOfQ(R)[2]); [[14,2],[18,3],[22,2],[26,1],[16,6],[24,5]].forEach(([x,y])=>p.rect(x,y,1,1));
    // orelha
    p.F(R[2]); p.ell(-6,-16,5,7); p.F(R[3]); p.ell(-5,-15,2.4,4); p.F(R[0]); p.rect(-9,-21,1.4,3);
    // sobrancelha pesada e olho de brasa
    p.F(R[3]); p.poly([[12,-24],[32,-26],[33,-21],[14,-19]]); p.F(R[1]); p.rect(14,-26,16,1.4);
    const glow=1-P.dead;
    p.F(M.mouth[3]); p.ell(24,-18,5,3.4);
    if(glow>0.3){ p.F(M.eye[3]); p.ell(24.4,-18,4,2.6); p.F(M.eye[2]); p.ell(24.8,-18.2,2.8,1.9); p.F(M.eye[1]); p.ell(25.2,-18.4,1.6,1.2); p.F(M.eye[0]); p.rect(25,-19,1.2,1);
      if(fur||P.roar>0.5){ p.F(M.eye[2]); p.rect(15,-18.8,6,1); } }
    // nariz quebrado
    p.F(R[2]); p.poly([[30,-18],[37,-10],[31,-8]]); p.F(R[3]); p.rect(31,-9,4,1.2); p.F(R[0]); p.rect(32,-16,1.4,4);
    // boca: dentes à mostra, lábio podre
    if(P.roar>0.5){ p.F(M.mouth[2]); p.poly([[16,-6],[33,-7],[32,6],[18,6]]); p.F(M.mouth[3]); p.poly([[19,-3],[30,-3],[29,3],[20,3]]);
      p.F(M.teeth[1]); [18,21,24,27,30].forEach((x,k)=>{ p.poly([[x,-6.4],[x+2.4,-6.6],[x+1.2,-3.2+(k%2)]]); p.poly([[x,5.6],[x+2.4,5.6],[x+1.2,2.4-(k%2)]]); }); }
    else { p.F(M.mouth[2]); p.poly([[17,-4],[33,-5],[32,0],[18,0]]); p.F(M.teeth[1]); [19,22,25,28].forEach(x=>p.rect(x,-4.4,2,2.2)); p.F(M.mouth[3]); p.rect(18,-0.6,14,1.2); }
    p.F(M.blood[2]); p.poly([[24,0],[30,0],[29,6],[27,4],[26,8]]);
    // podridão na bochecha
    p.F(M.scar[2]); p.ell(4,-8,4,3); p.F(M.scar[3]); p.ell(4,-8,2,1.4);
    // capacete de obra amassado
    const hm=[[-20,-24],[-18,-38],[-8,-48],[10,-51],[26,-46],[34,-36],[36,-28],[44,-27],[44,-23],[-20,-20]];
    platePoly(p,H,hm,A,1);
    clipPoly(hm,()=>{ p.F(H[0]); bandA(p,[[-8,-44],[8,-48],[22,-44]],2); p.F(H[3]); p.ell(18,-40,6,3.4); p.F(H[2]); p.ell(17,-41,4,2.2);
      p.F(H[3]); bandA(p,[[-2,-48],[0,-30]],1.4); bandA(p,[[6,-49],[8,-30]],1.4); p.F(H[1]); bandA(p,[[2,-48],[4,-30]],2.4);
      p.F(M.grease[2]); [[-10,-30,4,2],[28,-34,3,2]].forEach(([x,y,rx,ry])=>p.ell(x,y,rx,ry));
      p.F(H[3]); [[-12,-36,-4,-34],[24,-30,30,-33]].forEach(([a,b,c,d])=>p.cap(P2(a,b),P2(c,d),0.9,0.9)); });
    p.F(H[3]); p.rect(-20,-23,64,2.4); p.F(H[0]); p.rect(-18,-25.6,30,1);
  }

  /* ---------------- FX ---------------- */
  function drawSmearSweep(p,M,sk){ p.id(); const s=sk.shF; K_.smear(p,M.fx,s.x,s.y+10,70,112,200,400,0.42); }
  function drawSmearThrow(p,M,sk){ p.id(); const w=sk.wrF; p.F(M.fx[1]); [-8,0,8].forEach((dy,k)=>p.cap(P2(w.x+10,w.y+dy),P2(w.x+80+k*10,w.y+dy*0.6),2.2,0.6)); }
  function drawSmearDown(p,M,sk){ p.id(); const w=sk.wrF; p.F(M.fx[1]); [-24,-8,8,24].forEach((dx,k)=>p.cap(P2(w.x+dx,w.y-60-(k%2)*12),P2(w.x+dx,w.y-8),0.8,2.6)); }
  function drawCable(p,M,sk,P){ p.id(); const w=sk.wrF; rope(p,M.iron,[P2(w.x+2,-10),P2(w.x+1,w.y-4)],4); p.F(M.iron[1]); p.rect(w.x-6,w.y-14,14,8); p.F(M.iron[0]); p.rect(w.x-6,w.y-14,14,1.4); }
  function drawSteam(p,M,sk){ p.id(); const c=sk.H(10,-56); puffs(p,M.dust,c.x,c.y,[[-6,0,5,4],[6,-8,6,4.4],[-4,-16,4,3.4],[10,-22,3,2.4]]); }

  /* ---------------- quadro ---------------- */
  function parts(add,P,M,sk,form,anim){
    const fur=form==='furia';
    const angF=Math.atan2(sk.wrF.y-sk.elF.y,sk.wrF.x-sk.elF.x), angB=Math.atan2(sk.wrB.y-sk.elB.y,sk.wrB.x-sk.elB.x);
    const crFront=anim==='toss'||P.crW>0.5;
    const crate=()=>{ if(P.crV<0.5) return; if(P.crW>0.5) add({},p=>drawCrate(p,M,AX+P.crX,GROUND-P.crY,P.crA,0)); else add({back:!crFront},p=>drawCrate(p,M,sk.wrB.x+P.crx,sk.wrB.y+P.cry,P.crA+sk.a*0.3,0,1.15)); };
    const hm=Math.round(P.hm), hookBack=hm===6;
    add({back:true},p=>drawUpper(p,M,sk.shB,sk.elB,false));
    add({back:true},p=>drawFore(p,M,sk.elB,sk.wrB,false,P,fur));
    add({back:true},p=>drawHand(p,M,sk.wrB,angB,P.crV>0.5&&!P.crW));
    if(!crFront) crate();
    if(hookBack) add({},p=>drawHookAll(p,M,sk,P,fur));
    add({back:true},p=>drawLeg(p,M,sk.hipB,sk.kneeB,sk.ankleB,P.fB,false));
    add({},p=>drawPelvis(p,M,sk,P));
    add({},p=>drawLeg(p,M,sk.hipF,sk.kneeF,sk.ankleF,P.fF,true));
    add({},p=>drawTorso(p,M,sk,P,fur));
    add({},p=>drawHead(p,M,sk,P,fur));
    if(crFront) crate();
    if(P.smear&&anim==='sweep') add({noShade:true,smear:true,noRim:true},p=>drawSmearSweep(p,M,sk));
    if(P.cable>0.4) add({},p=>drawCable(p,M,sk,P));
    add({},p=>drawUpper(p,M,sk.shF,sk.elF,true));
    add({},p=>drawFore(p,M,sk.elF,sk.wrF,true,P,fur));
    if(!hookBack) add({},p=>drawHookAll(p,M,sk,P,fur));
    add({},p=>drawHand(p,M,sk.wrF,angF,true));
    // chamas do gancho (fúria; acendendo na transformação)
    const fire=fur?1:P.fire*(anim==='rage'?1:0);
    if(fire>0.1&&P.dead<0.9){ const h=hookPose(sk,P); if(!h.out){ let pts; if(h.grip){ const a=angF; pts=hookPts({x:sk.wrF.x-C(a)*4,y:sk.wrF.y-S(a)*4},a,1.25,1); } else pts=hookPts(h.eye,h.ang,1.25,h.E);
        const fl=pts.map((q,k)=>[q.x,q.y,0.7+0.25*(k%2)]); const ch=h.ch; if(ch) for(let k=1;k<ch.length-1;k+=2) fl.push([ch[k].x,ch[k].y,0.32]);
        add({noShade:true,noRim:true},p=>{ p.id(); flames(p,M.flame,fl,P.t+P.ph+anim.length,fire*(1-0.8*P.dead)); });
        if(fur&&ch) add({noShade:true,noRim:true},p=>{ p.id(); sparks(p,M.ember,ch[Math.floor(ch.length/2)],6,10,P.t+3); }); } }
    if(P.smear&&anim==='hook') add({noShade:true,smear:true,noRim:true},p=>drawSmearThrow(p,M,sk));
    if(P.smear&&(anim==='slam')) add({noShade:true,smear:true,noRim:true},p=>drawSmearDown(p,M,sk));
    if(P.smear&&anim==='toss') add({noShade:true,smear:true,noRim:true},p=>{ p.id(); const w=sk.wrB; p.F(M.fx[1]); [-10,0,10].forEach(dy=>p.cap(P2(w.x-30,w.y-40+dy),P2(w.x+60,w.y-6+dy),0.6,2.4)); });
    if(P.impact) add({noShade:true,smear:true,noRim:true},p=>{ p.id(); dust(p,M.dust,M.fx,anim==='death'?sk.hip.x-50:anim==='slam'?sk.wrF.x+40:sk.hip.x+8,GROUND,anim==='slam'?1:0.85); });
    if(P.steam>0.5) add({noShade:true,noRim:true},p=>drawSteam(p,M,sk));
  }
  function anchors(sk,P){ const h=hookPose(sk,P); return {eye:sk.H(24,-18),head:sk.H(8,-30),back:sk.T(-30,-80),hand:sk.wrF,hook:h.eye,crate:{x:sk.wrB.x+P.crx,y:sk.wrB.y+P.cry},stomp:{x:sk.hip.x+10,y:GROUND}}; }
  function prop(add,P,M,form,anim){ const st=Math.round(P.st||0); add({},p=>drawCrate(p,M,36,58-20,0,st)); }

  return K_.factory({SC:0.92,FW,FH,GROUND,AX,RIM,ANIMS,NAMES,REST,mats0,fix,skeleton:RG.skeleton,parts,anchors,PROP:{FW:72,FH:64,GROUND:58,AX:36},prop});
})();
