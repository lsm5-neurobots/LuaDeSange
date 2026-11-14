/* ASCENSORISTA — fonte de arte (editável). Build: npm run art
   Chefe do Pelourinho "O Ascensorista": o velho operador do elevador do alto da cidade, tomado pela Lua de Sangue
   e fundido à máquina (~3 m). Farda azul-marinho antiga com dragonas douradas e gravata-borboleta, quepe de aba,
   luvas brancas encardidas, cabos de aço enrolados nos braços e cruzando o peito, chaveiro gigante na cintura.
   No peito, um painel de botões de elevador fundido à pele (luzes verde/âmbar; vermelho na fúria). Nas costas, a
   grade pantográfica dobrável (porta de elevador) que abre como asas e fecha como arma. Rosto envelhecido, olhos
   fundos âmbar, boca costurada com arame, bigode fino. Fúria: painel todo vermelho, quepe voa, cabos soltos
   chicoteando, faíscas elétricas. Adereço: cabine que cai do alto (caindo, espatifada). O monumento é cenário;
   o chefe é a figura do ofício. Design nosso, sem marca nem texto. */
const ASCENSORISTA=(function(){
  const {rad,lp,lerp,P2}=PIX;
  const K_=BOSSKIT, {S,C,PI,mass,platePoly,clipPoly,band,bandA,ellPts,arc,bez,limb,fold,stitches,rivets,rnd,stain,chain,rope,flames,dust,sparks,bolt,puffs}=K_;
  const FW=470, FH=338, GROUND=326, AX=226;
  const RIM={normal:'#cfe0ff', furia:'#ff9a8a'};

  function mats0(form){
    const m={
      coat:['#8496cc','#3c4c80','#242e58','#121834'],
      gold:['#fff2a8','#e2b444','#9c6c26','#4e3418'],
      glove:['#fffaf0','#dcd0b6','#a09286','#5a5060'],
      steel:['#f0f2f8','#a2a4b4','#606274','#30303e'],
      brass:['#fadc94','#cc9c4a','#8a622e','#483218'],
      panel:['#62626e','#34343e','#1e1e26','#0e0e14'],
      skin:['#e2dcbc','#a6a486','#686c64','#34383e'],
      shirt:['#fffbea','#e2d6c2','#aa9a94','#5e5268'],
      tie:['#f28a86','#b83c4e','#72223c','#3e1028'],
      visor:['#7a7a8c','#363644','#20202a','#101016'],
      gate:['#cec8d6','#7e7890','#4a445c','#24202e'],
      wood:['#dcaa72','#9e6e42','#66442e','#38241c'],
      wire:['#d0d0d8','#868696','#4c4c5a','#26262e'],
      mouth:['#6c2c3a','#421a28','#2a0e18','#1a0710'],
      blood:['#9c3a36','#6e222c','#46141e','#280a12'],
      eye:['#ffffff','#ffeaa4','#ffb040','#a45010'],
      lgreen:['#ffffff','#c4ffbc','#44d266','#126c32'],
      lamber:['#ffffff','#ffeaa4','#eaa83a','#8a5010'],
      lred:['#ffffff','#ffb8a8','#ec3c3c','#82101a'],
      loff:['#5a5560','#3a3640','#26222c','#16121a'],
      volt:['#ffffff','#cdf2ff','#64baff','#2252c4'],
      fx:['#fffef2','#fff2aa','#ffc24c','#e27c24'],
      dust:['#eadecd','#c6b6a0','#968671','#605448'],
      smoke:['#b8b4c4','#8a8498','#5e5870','#3a3448'],
    };
    if(form==='furia'){
      m.coat=['#9a8ec4','#4c4070','#2e264c','#18122c'];
      m.skin=['#ead0b4','#b48e7e','#764e5a','#3c2636'];
      m.eye=['#ffffff','#ffd0b0','#ff5a3a','#b01414'];
      m.lgreen=m.lred.slice(); m.lamber=['#ffffff','#ffc8b8','#ff5a48','#a0141c'];
      m.blood=['#e0503a','#a8282c','#6c1420','#3c0a14'];
    }
    return K_.finish(m,['fx','dust','eye','lgreen','lamber','lred','volt']);
  }
  const NAMES={coat:'Farda azul-marinho',gold:'Dragonas/galões',glove:'Luva encardida',steel:'Cabo de aço',brass:'Latão do painel',panel:'Placa do painel',skin:'Pele velha',
    shirt:'Camisa',tie:'Gravata-borboleta',visor:'Aba do quepe',gate:'Grade pantográfica',wood:'Madeira da cabine',wire:'Arame da boca',eye:'Olho âmbar',lgreen:'Luz verde',lamber:'Luz âmbar',lred:'Luz vermelha',volt:'Faísca elétrica'};

  /* ---------------- poses ----------------
     gate 0 dobrada nas costas → 1 asas abertas · gateF 0..1 grade fechada pra frente (golpe) · chainUp: segura o cabo
     que desce do alto · btn: aperta o painel · blk: pane (luzes piscando) · lit: botões acesos (morte) ·
     capOff: quepe voando (capX,capY,capR rel. ao chão/âncora) · doors: portas do elevador (intro) 0 fechadas..1 abertas */
  const REST={hx:0,drop:3,lean:4,head:0,aFs:16,aFe:30,aBs:-14,aBe:10,lFh:16,lFk:-6,lBh:-10,lBk:-30,fF:0,fB:0,
    gate:0,gateF:0,chainUp:0,btn:0,blk:0,lit:8,capOff:0,capX:0,capY:0,capR:0,doors:-1,doorsFront:0,hide:0,loose:0,
    roar:0,flash:0,smear:0,impact:0,spark:0,dead:0,ph:0,sway:0};
  const ANIMS={
    idle:{nome:'Parado (luzes do painel sobem e descem)',n:8,dur:()=>175,pose:i=>{ const p=i/8*PI*2, s=S(p);
      return {lean:4+1.4*s, drop:3+1.4*S(p-0.5), head:-1+2*S(p-0.9), aFs:16+4*S(p-0.4), aFe:30+5*S(p-0.9), aBs:-14+4*S(p+0.5), aBe:10+4*S(p), sway:S(p-1.2), ph:p}; }},
    walk:{nome:'Andar (passos pesados, "ding" a cada passo)',n:8,stomp:[0,4],dur:()=>162,pose:i=>{ const p=i/8*PI*2+PI/2;
      const lFh=10+22*S(p), lBh=-6+22*S(p+PI);
      return {lFh, lFk:lFh-24*Math.max(0,C(p))-4, lBh, lBk:lBh-24*Math.max(0,C(p+PI))-8, fF:-6*C(p), fB:-6*C(p+PI),
        drop:4+3*C(2*(p-PI/2)), lean:6+2*S(2*p), head:1+2*S(2*p-1), hx:1.4*S(2*p),
        aFs:14-16*S(p), aFe:28-10*S(p), aBs:-10+16*S(p), aBe:12+10*S(p), sway:1.4*S(p+1.2), ph:2*p}; }},
    drop:{nome:'Cabines caindo (puxa o cabo do alto)',n:11,warn:[1,2],throwAt:3,dur:i=>[170,170,150,90,170,170,170,170,160,160,160][i],pose:i=>[
      {lean:-6,head:-22,aFs:40,aFe:60},
      {lean:-12,head:-30,aFs:172,aFe:180,lFh:20,lBh:-16},
      {lean:-14,head:-30,aFs:176,aFe:186,chainUp:1,lFh:20,lBh:-16,roar:1},
      {lean:10,head:-10,drop:6,aFs:120,aFe:96,chainUp:1,spark:1,lFh:30,lFk:-20,lBh:-16,lBk:-50,smear:1},
      {lean:14,head:-6,drop:8,aFs:90,aFe:60,chainUp:1,lFh:30,lFk:-20,lBh:-16,lBk:-50},
      {lean:8,head:-16,drop:6,aFs:70,aFe:50,chainUp:0.5,roar:1},
      {lean:2,head:-24,aFs:40,aFe:50,roar:1},
      {lean:0,head:-26,aFs:30,aFe:40},
      {lean:2,head:-16,aFs:22,aFe:34},
      {lean:4,head:-6,aFs:18,aFe:30},
      {lean:4,head:0,aFs:16,aFe:30}][i]},
    door:{nome:'Porta pantográfica (abre as asas e fecha)',n:10,warn:[1,2,3,4],hit:5,dur:i=>[150,150,150,130,90,80,170,170,170,170][i],pose:i=>[
      {lean:10,head:6,drop:5,aFs:-20,aFe:0,aBs:-30,aBe:-10,lFh:24,lFk:-14,lBh:-14,lBk:-44},
      {lean:-6,head:-8,gate:0.4,aFs:70,aFe:100,aBs:-80,aBe:-110},
      {lean:-12,head:-14,gate:0.8,aFs:100,aFe:130,aBs:-110,aBe:-140,roar:1},
      {lean:-14,head:-16,gate:1,aFs:110,aFe:140,aBs:-120,aBe:-150,roar:1},
      {lean:8,head:0,gate:0.5,gateF:0.45,aFs:90,aFe:90,aBs:60,aBe:70,hx:4,smear:1,lFh:30,lFk:-4,lBh:-22,lBk:-34},
      {lean:16,head:6,gate:0,gateF:1,aFs:84,aFe:84,aBs:80,aBe:80,hx:8,impact:1,spark:1,lFh:36,lFk:2,lBh:-26,lBk:-36},
      {lean:16,head:8,gateF:1,aFs:84,aFe:84,aBs:80,aBe:80,hx:8,lFh:36,lFk:2,lBh:-26,lBk:-36},
      {lean:12,head:6,gateF:0.7,aFs:70,aFe:70,aBs:60,aBe:60,hx:6},
      {lean:6,head:2,gateF:0.25,aFs:40,aFe:50,aBs:10,aBe:20,hx:2},
      {lean:4,head:0,aFs:16,aFe:30}][i]},
    blackout:{nome:'Pane (aperta o botão de emergência)',n:8,flickAt:4,dur:i=>[150,150,170,170,90,200,200,170][i],pose:i=>[
      {lean:-2,head:8,aFs:30,aFe:70},
      {lean:-4,head:16,aFs:22,aFe:150,btn:0.5},
      {lean:-6,head:20,aFs:20,aFe:158,btn:1},
      {lean:-6,head:22,aFs:18,aFe:160,btn:1,roar:1},
      {lean:-14,head:-20,aFs:60,aFe:90,aBs:-60,aBe:-80,btn:0,blk:1,spark:1,roar:1,hx:-3},
      {lean:-12,head:-18,aFs:70,aFe:100,aBs:-70,aBe:-90,blk:1,spark:1,roar:1,hx:3},
      {lean:-4,head:-6,aFs:40,aFe:60,aBs:-30,aBe:-20,blk:0.5},
      {lean:4,head:0,aFs:16,aFe:30}][i]},
    plunge:{nome:'Descida sem freio (salta, some e cai no alvo)',n:12,warn:[1,2,3,4,5,6,7,8],hit:9,vuln:[10,11],dur:i=>[170,130,110,120,120,120,120,120,110,90,260,260][i],pose:i=>[
      {lean:22,head:10,drop:12,lFh:44,lFk:-34,lBh:-10,lBk:-70,aFs:-40,aFe:-20,aBs:-50,aBe:-30},
      {lean:-4,head:-14,drop:-80,lFh:20,lFk:0,lBh:-6,lBk:-10,fF:30,fB:40,aFs:170,aFe:176,aBs:160,aBe:170,roar:1},
      {lean:-4,head:-14,drop:-200,lFh:16,lFk:0,lBh:-6,lBk:-8,fF:30,fB:40,aFs:174,aFe:180,aBs:164,aBe:172},
      {hide:1},{hide:1},{hide:1},{hide:1},{hide:1},
      {lean:6,head:10,drop:-130,lFh:30,lFk:10,lBh:10,lBk:-20,fF:20,fB:20,aFs:150,aFe:160,aBs:140,aBe:150,smear:1},
      {lean:30,head:16,drop:16,lFh:50,lFk:-40,lBh:-12,lBk:-76,aFs:60,aFe:20,aBs:40,aBe:10,impact:1,spark:1},
      {lean:30,head:20,drop:16,lFh:50,lFk:-40,lBh:-12,lBk:-76,aFs:50,aFe:10,aBs:30,aBe:0,spark:0},
      {lean:22,head:12,drop:12,lFh:44,lFk:-32,lBh:-12,lBk:-66,aFs:36,aFe:20,aBs:10,aBe:10}][i]},
    rage:{nome:'Entrar em fúria (quepe voa, painel vermelho)',n:8,dur:i=>[180,140,140,200,220,220,220,200][i],pose:i=>[
      {lean:18,head:20,aFs:30,aFe:120,aBs:20,aBe:140,drop:5,blk:1},
      {lean:20,head:24,aFs:34,aFe:126,aBs:24,aBe:150,drop:7,hx:-1,spark:1,blk:1},
      {lean:-8,head:-18,aFs:110,aFe:130,aBs:-90,aBe:-110,roar:1,capOff:1,capX:30,capY:280,capR:-0.6,loose:1,spark:1},
      {lean:-14,head:-26,aFs:130,aFe:150,aBs:-120,aBe:-140,roar:1,capOff:1,capX:70,capY:310,capR:-1.6,loose:1,gate:0.6},
      {lean:-16,head:-28,aFs:134,aFe:156,aBs:-124,aBe:-146,roar:1,capOff:1,capX:110,capY:340,capR:-2.8,loose:1,spark:1,gate:1},
      {lean:-16,head:-28,aFs:132,aFe:154,aBs:-122,aBe:-144,roar:1,loose:1,spark:1,gate:1,hx:2},
      {lean:-12,head:-22,aFs:120,aFe:140,aBs:-110,aBe:-130,roar:1,loose:1,gate:0.5},
      {lean:4,head:0,aFs:16,aFe:30,loose:1}][i]},
    hurt:{nome:'Dano',n:4,dur:i=>[80,110,130,160][i],pose:i=>[
      {flash:1,lean:-12,head:-18,hx:-6,aFs:-20,aFe:-10,aBs:-40,aBe:-30,roar:1,blk:0.5},
      {lean:-8,head:-12,hx:-4,aFs:-6,aFe:6,aBs:-30,aBe:-16,roar:1},
      {lean:-2,head:-4,hx:-1,aFs:10,aFe:24},
      {}][i]},
    intro:{nome:'Entrada (WARNING): as portas do elevador abrem e ele sai',n:12,dur:i=>[320,200,180,180,170,170,170,220,220,220,300,260][i],pose:i=>[
      {doors:0,doorsFront:1,hx:-24,lean:0,head:4},
      {doors:0.25,doorsFront:1,hx:-24,lean:0,head:4,spark:1},
      {doors:0.6,doorsFront:1,hx:-24,lean:-2,head:0,spark:1},
      {doors:1,doorsFront:1,hx:-22,lean:-2,head:-4},
      {doors:1,hx:-12,lean:8,lFh:30,lFk:-10,lBh:-12,lBk:-40,aFs:30,aFe:40},
      {doors:1,hx:-2,lean:6,lFh:4,lFk:-20,lBh:-20,lBk:-30,aFs:-10,aFe:10},
      {doors:1,hx:0,lean:4},
      {doors:1,lean:-12,head:-22,aFs:120,aFe:140,aBs:-110,aBe:-130,roar:1,gate:0.8},
      {doors:1,lean:-14,head:-26,aFs:126,aFe:146,aBs:-116,aBe:-136,roar:1,gate:1,spark:1},
      {doors:1,lean:-14,head:-26,aFs:126,aFe:146,aBs:-116,aBe:-136,roar:1,gate:1,blk:1},
      {doors:0.5,lean:-2,head:-4,aFs:30,aFe:40,gate:0.3},
      {doors:-1,lean:4,head:0}][i]},
    death:{nome:'Morte (botões apagam, cabos soltam, senta no chão)',n:14,dur:i=>[90,160,180,180,180,180,170,170,200,200,200,200,400,700][i],pose:i=>{
      const sit={lean:-10,head:30,drop:0,lFh:84,lFk:96,lBh:78,lBk:92,fF:-70,fB:-70,aFs:20,aFe:40,aBs:-10,aBe:10,loose:1};
      return [
        {flash:1,lean:-14,head:-20,hx:-6,aFs:-20,aFe:-10,roar:1,lit:8},
        {lean:-16,head:-26,hx:-8,aFs:120,aFe:150,aBs:-110,aBe:-130,roar:1,lit:7,spark:1},
        {lean:10,head:20,aFs:20,aFe:10,lit:6,loose:1},
        {lean:14,head:24,drop:8,lFh:44,lFk:-34,lBh:-10,lBk:-70,aFs:10,aFe:0,lit:5,loose:1,spark:1},
        {lean:18,head:28,drop:24,lFh:70,lFk:-10,lBh:16,lBk:-80,aFs:10,aFe:0,lit:4,loose:1},
        {lean:6,head:30,drop:20,lFh:76,lFk:30,lBh:40,lBk:-40,aFs:20,aFe:20,lit:3,loose:1},
        Object.assign({},sit,{lit:2,impact:1}),
        Object.assign({},sit,{lit:2}),
        Object.assign({},sit,{lit:1,head:34}),
        Object.assign({},sit,{lit:1,head:40,aFs:10,aFe:10}),
        Object.assign({},sit,{lit:0,head:44,aFs:6,aFe:6,aBs:-6,aBe:-6}),
        Object.assign({},sit,{lit:0,head:46,aFs:4,aFe:4,aBs:-4,aBe:-4,doors:0.4,hx:0}),
        Object.assign({},sit,{lit:0,head:46,aFs:4,aFe:4,aBs:-4,aBe:-4,dead:0.6}),
        Object.assign({},sit,{lit:0,head:46,aFs:4,aFe:4,aBs:-4,aBe:-4,dead:1})][i]; }},
    xCabin:{nome:'Cabine (caindo, espatifada)',n:2,prop:true,dur:()=>200,pose:i=>({st:i})},
  };
  function fix(P,anim,i){ if(!(anim==='death'&&i>=6)){ P.lean+=8; P.head-=4; P.lFk=Math.min(P.lFk,P.lFh-16); P.lBk=Math.min(P.lBk,P.lBh-16); } }

  const RG=K_.rig({AX,GROUND,THI:50,SHN:48,UPA:46,FOA:42,hipW:10,neck:[14,-128],shF:[20,-116],shB:[-16,-118],HS:1,FT:13,FL:26,
    contacts:(b,P)=>[b.T(0,16).y,b.T(-30,-60).y+2,b.H(-10,-40).y+2,b.kneeF.y+10,b.kneeB.y+10]});

  /* ---------------- grade pantográfica ---------------- */
  // sanfona de losangos entre a (base) e b (ponta), altura h (perpendicular)
  function lattice(p,M,a,b,h,n){
    const G=M.gate, L=Math.hypot(b.x-a.x,b.y-a.y)||1, tx=(b.x-a.x)/L, ty=(b.y-a.y)/L, nx=-ty, ny=tx;
    const Q=(u,v)=>P2(a.x+tx*u+nx*v, a.y+ty*u+ny*v), seg=L/n;
    p.F(G[3]); for(let k=0;k<n;k++){ p.cap(Q(k*seg,-h/2),Q((k+1)*seg,h/2),3.2,3.2); p.cap(Q(k*seg,h/2),Q((k+1)*seg,-h/2),3.2,3.2); }
    p.F(G[1]); for(let k=0;k<n;k++){ p.cap(Q(k*seg,-h/2),Q((k+1)*seg,h/2),1.8,1.8); p.cap(Q(k*seg,h/2),Q((k+1)*seg,-h/2),1.8,1.8); }
    p.F(G[0]); for(let k=0;k<n;k++){ const q=Q(k*seg+seg*0.3,-h/2+h*0.3); p.rect(q.x,q.y,1,1); }
    p.F(G[2]); band(p,[Q(0,-h/2-2),Q(L,-h/2-2)],3); band(p,[Q(0,h/2+2),Q(L,h/2+2)],3); p.F(G[0]); band(p,[Q(0,-h/2-3),Q(L,-h/2-3)],1);
    for(let k=0;k<=n;k++){ const q1=Q(k*seg,-h/2), q2=Q(k*seg,h/2), q3=Q(k*seg,0); p.F(M.brass[2]); p.circle(q1,2); p.circle(q2,2); p.F(M.brass[1]); p.circle(q3,1.6); p.F(M.brass[0]); p.rect(q3.x-0.6,q3.y-1.2,1,1); }
    p.F(G[1]); p.cap(Q(L,-h/2-3),Q(L,h/2+3),4,4); p.F(G[0]); p.cap(Q(L,-h/2-3),Q(L,h/2-3),1,1);
  }
  function drawGateBack(p,M,sk,P){
    p.id(); const o1=sk.T(-14,-126), o2=sk.T(-24,-118), g=P.gate;
    // dobrada: feixe vertical nas costas; aberta: duas asas pra cima/pra trás e pra cima/pra frente
    const a1=rad(-100-60*g), a2=rad(-80+50*g), L1=26+86*g, L2=20+70*g;
    lattice(p,M,o2,P2(o2.x+C(a1)*L1,o2.y+S(a1)*L1),18+20*g,Math.round(3+4*g));
    lattice(p,M,o1,P2(o1.x+C(a2)*L2,o1.y+S(a2)*L2),16+18*g,Math.round(3+3*g));
  }
  function drawGateFront(p,M,sk,P){
    p.id(); const a=sk.T(44,-70), b=P2(a.x+12+P.gateF*104,a.y+6);
    lattice(p,M,a,b,64,Math.round(3+P.gateF*5));
  }

  /* ---------------- membros ---------------- */
  function drawUpper(p,M,sh,el,front,P){
    const {ang,L}=limb(p,sh,el), R=M.coat;
    p.F(R[2]); p.cap(P2(0,0),P2(L,0),26,21); mass(p,R,L*0.45,-3,15,10,ang,0.8); mass(p,R,0,0,16,14,ang,0.8);
    fold(p,R,[[L*0.55,-9],[L*0.62,-2],[L*0.58,6]],1.4);
    // cabo de aço enrolado
    for(let k=0;k<3;k++){ const x=L*(0.42+k*0.12); rope(p,M.steel,[P2(x-3,-12),P2(x+3,12)],2.6); }
    // dragona dourada com franja
    p.F(M.gold[2]); p.ell(0,-2,13,9); p.F(M.gold[1]); p.ell(-1,-4,10,6); p.F(M.gold[0]); p.ell(-2,-6,5,2);
    p.F(M.gold[2]); for(let k=-4;k<=4;k++) p.rect(8+Math.abs(k)*0.3,k*2.2-1,6,1.4); p.F(M.gold[1]); for(let k=-4;k<=4;k+=2) p.rect(8,k*2.2-1,4,1);
  }
  function drawFore(p,M,el,wr,front,P,fur){
    const {ang,L}=limb(p,el,wr), R=M.coat;
    p.F(R[2]); p.cap(P2(0,0),P2(L,0),22,18); mass(p,R,L*0.4,-2,12,8,ang,0.7);
    // punho com galão dourado
    p.F(M.gold[2]); p.cap(P2(L*0.82,-10),P2(L*0.82,10),4,4); p.F(M.gold[0]); p.cap(P2(L*0.8,-9),P2(L*0.8,4),1,1);
    for(let k=0;k<3;k++){ const x=L*(0.25+k*0.16); rope(p,M.steel,[P2(x-3,-10),P2(x+3,10)],2.4); }
    if(fur||P.loose){ p.id(); const w=wr, ph=(P.ph||0)+P.t; const tip=P2(w.x-20+10*S(ph),w.y+24+8*C(ph*1.3)); rope(p,M.steel,bez(P2(el.x*0.5+w.x*0.5,el.y*0.5+w.y*0.5),P2(w.x-28,w.y+2),tip,5),2.4);
      if(fur){ p.F(M.volt[1]); p.rect(tip.x-1,tip.y-1,3,3); } }
  }
  function drawHand(p,M,wr,ang,open){
    p.xf(ang,wr.x,wr.y); const R=M.glove;
    if(!open){ p.F(R[2]); p.ell(6,0,11,10); mass(p,R,6,-1,10,9,ang,0.6); p.F(R[3]); [-4,0,4].forEach(y=>p.cap(P2(9,y),P2(14,y+0.5),1.1,1.1)); p.F(R[0]); [-5,-1,3].forEach(y=>p.rect(11,y,2,1)); }
    else { p.F(R[2]); p.ell(5,0,9,9);
      [[-24,15],[-8,17],[8,17],[22,15]].forEach(([a,L])=>{ const r=rad(a), e=P2(7+C(r)*L,S(r)*L); p.F(R[2]); p.cap(P2(7,S(r)*3),e,4.8,3.8); p.F(R[1]); p.cap(P2(7,S(r)*3-0.6),P2(e.x-0.5,e.y-0.7),2.8,2); p.F(R[3]); p.circle(e,1); });
      p.F(R[2]); p.cap(P2(2,-7),P2(9,-15),5,4); mass(p,R,4,0,8.4,8,ang,0.6); }
    p.F(R[3]); p.ell(8,4,2.4,1.4); p.F(M.blood[2]); p.ell(12,-2,1.6,1.2);
  }
  function drawLeg(p,M,hip,knee,ankle,fa,front){
    let t=limb(p,hip,knee); const R=M.coat;
    p.F(R[2]); p.cap(P2(0,0),P2(t.L,0),27,22); mass(p,R,t.L*0.42,-2,15,10,t.ang,0.6);
    fold(p,R,[[t.L*0.7,-9],[t.L*0.78,-3],[t.L*0.72,3]],1.2);
    p.F(M.gold[2]); p.cap(P2(0,-11),P2(t.L,-9.6),1.6,1.6);
    t=limb(p,knee,ankle);
    p.F(R[2]); p.cap(P2(-2,0),P2(t.L,0),22,20); p.F(R[1]); p.cap(P2(0,-3),P2(t.L*0.6,-4),12,10);
    p.F(M.gold[2]); p.cap(P2(0,-9.6),P2(t.L,-9),1.6,1.6);
    p.F(R[3]); p.cap(P2(t.L*0.86,-11),P2(t.L*0.86,11),2.6,2.6);
    // sapato social velho
    p.xf(rad(fa),ankle.x,ankle.y); const B=M.visor;
    p.F(B[2]); p.poly([[-10,-9],[10,-9],[22,-3],[29,3],[29,10],[-12,10],[-12,-2]]);
    p.F(B[1]); p.poly([[-8,-8],[10,-8],[20,-2],[26,3],[16,4],[-6,2]]); p.F(B[0]); p.ell(20,0,4,1.4);
    p.F(B[3]); p.rect(-12,8,41,2.6); p.F(M.dust[3]); p.ell(8,6,4,1.4);
  }

  /* ---------------- tronco e painel ---------------- */
  function lightCol(M,form,P,k){
    const on=k<Math.round(P.lit); if(!on) return M.loff;
    if(P.blk>0.5) return (k+Math.round(P.t))%3===0?M.lred:M.loff;
    if(form==='furia') return M.lred;
    return [M.lgreen,M.lamber,M.lgreen,M.lgreen,M.lamber,M.lgreen,M.lamber,M.lgreen][k];
  }
  function drawPelvis(p,M,sk,P){
    p.xf(sk.a,sk.hip.x,sk.hip.y); const R=M.coat;
    p.F(R[2]); p.poly([[-22,-8],[26,-8],[28,10],[14,18],[-12,18],[-24,8]]); p.F(R[1]); p.poly([[-16,-8],[24,-8],[26,4],[-14,6]]);
    p.F(M.visor[2]); p.rect(-23,-12,50,6); p.F(M.visor[1]); p.rect(-22,-12,48,2); p.F(M.gold[1]); p.rect(14,-12,7,6); p.F(M.gold[0]); p.rect(14,-12,7,1.4);
    // chaveiro gigante
    p.id(); const c=sk.T(-24,2); p.F(M.brass[2]); band(p,ellPts(c.x,c.y+8,9,9,0,360,14).map(q=>P2(q[0],q[1])),2.6); p.F(M.brass[0]); band(p,ellPts(c.x,c.y+8,9,9,200,300,5).map(q=>P2(q[0],q[1])),1);
    [[-6,16,-0.4],[0,18,0],[6,16,0.4],[-2,17,-0.15]].forEach(([dx,dy,a],k)=>{ p.xf(a,c.x+dx,c.y+dy); p.F(k%2?M.steel[2]:M.brass[2]); p.rect(-1.6,0,3.2,13); p.F(k%2?M.steel[1]:M.brass[1]); p.rect(-1,0,1.6,12); p.ell(0,-1,3,3); p.F(M.panel[2]); p.ell(0,-1,1.2,1.2); p.F(k%2?M.steel[2]:M.brass[2]); p.rect(1.6,8,2.4,2); p.rect(1.6,11,2,1.6); });
  }
  function drawTorso(p,M,sk,P,form){
    p.xf(sk.a,sk.hip.x,sk.hip.y); const R=M.coat, A=sk.a, fur=form==='furia';
    const jk=[[-24,6],[-28,-30],[-30,-80],[-26,-112],[-14,-124],[4,-128],[22,-126],[34,-116],[40,-96],[42,-60],[36,-20],[30,8]];
    p.F(R[1]); p.poly(jk);
    clipPoly(jk,()=>{ mass(p,R,8,-64,36,64,A,1);
      platePoly(p,R,[[-34,-116],[-12,-118],[-10,-60],[-14,10],[-34,10]],A,0.2);
      fold(p,R,[[-16,-96],[-10,-70],[-12,-40]]); fold(p,R,[[0,-30],[16,-20],[30,-22]]); fold(p,R,[[28,-100],[34,-80]]);
      // barra da farda (abas) e botões
      p.F(R[3]); p.poly([[-24,0],[30,0],[30,10],[-24,10]]);
      p.F(M.gold[1]); [-30,-14].forEach(y=>{ p.circle(P2(34,y),2.2); }); p.F(M.gold[0]); [-30,-14].forEach(y=>p.rect(33,y-1.4,1.2,1));
      // poeira e mofo
      p.F(qOfQ(R)[2]); [[-20,-50,4,3],[24,-40,3,2],[-6,-16,5,3]].forEach(([x,y,rx,ry])=>p.ell(x,y,rx,ry));
      stain(p,M.blood,26,-50,4,2,5);
    });
    // camisa e gravata-borboleta na gola
    p.F(M.shirt[2]); p.poly([[8,-128],[24,-126],[22,-112],[12,-110]]); p.F(M.shirt[1]); p.poly([[10,-127],[22,-125],[20,-114],[13,-113]]);
    p.F(M.tie[2]); p.poly([[10,-120],[16,-116],[22,-121],[22,-111],[16,-115],[10,-110]]); p.F(M.tie[1]); p.rect(14,-118,4,4); p.F(M.tie[0]); p.rect(11,-119,3,1);
    // cabo de aço cruzando o peito (bandoleira)
    p.id(); rope(p,M.steel,[sk.T(-26,-110),sk.T(0,-70),sk.T(30,-24),sk.T(40,-6)],3.4);
    // painel de botões fundido à pele
    p.xf(sk.a,sk.hip.x,sk.hip.y);
    const px=10, py=-102, pw=24, ph=58;
    p.F(M.skin[2]); p.poly([[px-5,py-4],[px+pw+5,py-5],[px+pw+6,py+ph+5],[px-6,py+ph+4]]); p.F(M.blood[1]); [[px-4,py+10],[px+pw+4,py+30],[px-5,py+46]].forEach(([x,y])=>p.ell(x,y,2,3));
    p.F(M.skin[3]); [[px-6,py+4],[px+pw+5,py+16],[px-5,py+30],[px+pw+6,py+44]].forEach(([x,y])=>p.cap(P2(x,y),P2(x+(x<px?3:-3),y+3),1,1));
    platePoly(p,M.brass,[[px,py],[px+pw,py],[px+pw,py+ph],[px,py+ph]],A,1);
    p.F(M.panel[2]); p.rect(px+3,py+3,pw-6,ph-6); p.F(M.panel[1]); p.rect(px+3,py+3,pw-6,2);
    rivets(p,M.brass,[[px+2,py+2],[px+pw-2,py+2],[px+2,py+ph-2],[px+pw-2,py+ph-2]],1);
    // visor de andar (seta, sem números)
    p.F(M.panel[3]); p.rect(px+5,py+5,pw-10,8); const arw=lightCol(M,form,P,0); p.F(arw===M.loff?M.loff[1]:arw[2]); p.poly([[px+pw/2,py+6],[px+pw/2+4,py+11],[px+pw/2-4,py+11]]);
    // 2×4 botões com luz
    for(let k=0;k<8;k++){ const bx=px+7+(k%2)*10, by=py+20+Math.floor(k/2)*9, L=lightCol(M,form,P,k);
      p.F(M.brass[2]); p.circle(P2(bx,by),3.6); p.F(L[3]); p.circle(P2(bx,by),2.8); p.F(L[2]); p.circle(P2(bx-0.3,by-0.3),2.1); p.F(L[1]); p.circle(P2(bx-0.7,by-0.8),1.2); p.F(L[0]); p.rect(bx-1.2,by-1.4,1,1); }
    if(P.btn>0.3){ p.F(M.lred[2]); p.circle(P2(px+pw/2,py+ph-4),3); }
  }
  // luz emissiva dos botões (fura o sombreamento): halo
  function drawPanelGlow(p,M,sk,P,form){
    p.xf(sk.a,sk.hip.x,sk.hip.y); const px=10, py=-102;
    for(let k=0;k<8;k++){ const L=lightCol(M,form,P,k); if(L===M.loff) continue; const bx=px+7+(k%2)*10, by=py+20+Math.floor(k/2)*9; p.F(L[1]); p.rect(bx-1.2,by-1.4,1.6,1.4); }
  }

  /* ---------------- cabeça ---------------- */
  function drawCap(p,M,fur){
    const R=M.coat, V=M.visor;
    const cr=[[-18,-34],[-20,-46],[-8,-52],[18,-52],[30,-46],[28,-34]];
    platePoly(p,R,cr,0,1); p.F(R[0]); bandA(p,[[-12,-50],[10,-51]],1.4);
    p.F(M.gold[2]); p.rect(-18,-38,46,6); p.F(M.gold[1]); p.rect(-17,-38,44,2.6); p.F(M.gold[0]); [-12,-4,4,12,20].forEach(x=>p.rect(x,-37.6,2,1));
    p.F(M.gold[1]); p.ell(18,-43,4,4); p.F(M.gold[0]); p.rect(16.4,-45,2,1.4); p.F(M.gold[3]); p.ell(18.6,-42,1.6,1.6);
    p.F(V[2]); p.poly([[8,-33],[30,-34],[40,-30],[38,-27],[12,-29]]); p.F(V[0]); bandA(p,[[14,-32],[34,-32]],1);
  }
  function drawHead(p,M,sk,P,form){
    p.xf(sk.ha,sk.neck.x,sk.neck.y); const R=M.skin, A=sk.ha, fur=form==='furia';
    p.F(R[2]); p.ell(0,2,10,8);
    const hd=[[-12,-4],[-15,-22],[-10,-36],[14,-38],[26,-28],[29,-14],[27,-2],[18,6],[4,6]];
    p.F(R[2]); p.poly(hd); mass(p,R,8,-18,19,20,A,1);
    // rugas e bochechas fundas
    p.F(R[3]); bandA(p,[[8,-6],[14,-10],[20,-8]],1); bandA(p,[[2,-14],[6,-4]],1); p.F(qOfQ(R)[1]); p.ell(12,-9,5,3);
    p.F(R[3]); bandA(p,[[14,-30],[24,-29]],1);
    // orelha
    p.F(R[2]); p.ell(-6,-18,4.6,6.4); p.F(R[3]); p.ell(-5,-17,2.2,3.6);
    // olho fundo âmbar
    const glow=1-P.dead;
    p.F(M.mouth[3]); p.ell(19,-21,5,3.6); p.F(R[3]); p.rect(14,-25,12,1.4);
    if(glow>0.3){ p.F(M.eye[3]); p.ell(19.6,-21,3.6,2.4); p.F(M.eye[2]); p.ell(20,-21.2,2.4,1.7); p.F(M.eye[1]); p.ell(20.4,-21.4,1.4,1); p.F(M.eye[0]); p.rect(20,-22,1,1); }
    // nariz comprido
    p.F(R[2]); p.poly([[25,-22],[33,-11],[26,-9]]); p.F(R[3]); p.rect(26,-10,5,1.2); p.F(R[0]); p.rect(27,-19,1.2,5);
    // bigode fino
    p.F(M.visor[2]); bandA(p,[[18,-8],[24,-9],[31,-7]],1.6); p.F(M.visor[0]); p.rect(22,-9.6,3,0.8);
    // boca costurada com arame (abre rasgando no rugido)
    if(P.roar>0.5){ p.F(M.mouth[2]); p.poly([[16,-5],[30,-5],[29,4],[17,4]]); p.F(M.mouth[3]); p.poly([[18,-2],[28,-2],[27,2],[19,2]]);
      p.F(M.wire[1]); [18,21,24,27].forEach(x=>{ p.cap(P2(x,-6),P2(x+0.6,-3),0.9,0.9); p.cap(P2(x,5),P2(x+0.6,2),0.9,0.9); }); }
    else { p.F(M.mouth[2]); p.rect(17,-4,13,2.4); p.F(M.wire[1]); [18,21,24,27].forEach(x=>p.cap(P2(x,-6.6),P2(x+1.2,0),0.9,0.9)); p.F(M.wire[0]); [18,24].forEach(x=>p.rect(x,-6,1,1)); }
    p.F(M.blood[2]); p.poly([[22,0],[26,0],[25,5],[24,3]]);
    // cabelo grisalho ralo atrás
    p.F(M.shirt[2]); [[-12,-30],[-14,-24],[-12,-18]].forEach(([x,y])=>p.rect(x,y,3,4));
    if(P.capOff<0.5) drawCap(p,M,fur);
  }
  function drawLooseCap(p,M,P,fur){ p.xf(P.capR,AX+P.capX,GROUND-P.capY); drawCap(p,M,fur); }

  /* ---------------- elevador (intro/morte) ---------------- */
  function drawDoorsBack(p,M,P){
    p.id(); const cx=AX-20, w=66, h=244, top=GROUND-h, B=M.brass;
    // poço escuro
    p.F(M.panel[3]); p.rect(cx-w,top,w*2,h); p.F(M.panel[2]); p.rect(cx-w,top,w*2,8);
    // moldura de latão e indicador de seta
    platePoly(p,B,[[cx-w-10,top-16],[cx+w+10,top-16],[cx+w+10,GROUND],[cx+w,GROUND],[cx+w,top],[cx-w,top],[cx-w,GROUND],[cx-w-10,GROUND]],0,1);
    p.F(B[3]); p.rect(cx-w,top-2,w*2,2); p.F(M.panel[2]); p.ell(cx,top-8,16,6); p.F(M.lamber[2]); p.poly([[cx,top-12],[cx+5,top-5],[cx-5,top-5]]);
    rivets(p,B,[[cx-w-5,top-10],[cx+w+5,top-10],[cx-w-5,GROUND-10],[cx+w+5,GROUND-10]],1.4);
  }
  function drawDoorsFront(p,M,P){
    p.id(); const cx=AX-20, w=66, h=244, top=GROUND-h, o=Math.max(0,P.doors)*w;
    [[cx-w,cx-o],[cx+o,cx+w]].forEach(([x0,x1],k)=>{ if(x1-x0<2) return; platePoly(p,M.brass,[[x0,top],[x1,top],[x1,GROUND],[x0,GROUND]],0,0.8);
      p.F(M.brass[2]); for(let y=top+20;y<GROUND-10;y+=30) p.rect(x0+4,y,x1-x0-8,2); p.F(M.brass[0]); p.rect(x0+2,top+2,1,h-4); });
    if(P.doors>0&&P.doors<1){ p.F(M.smoke[1]); [[-20,-30,14,10],[18,-60,12,9],[-6,-100,10,8]].forEach(([dx,dy,rx,ry])=>p.ell(cx+dx,GROUND+dy,rx,ry)); }
  }

  /* ---------------- cabine (adereço) ---------------- */
  function drawCabin(p,M,st){
    p.id(); const cx=48, g=88, B=M.brass, W=M.wood;
    if(st===1){ // espatifada
      [[-30,-6,-0.3],[24,-5,0.4],[-6,-10,0.1],[10,-16,-0.6]].forEach(([dx,dy,a],k)=>{ p.xf(a,cx+dx,g+dy); p.F(k%2?B[2]:W[2]); p.rect(-12,-4,24,8); p.F(k%2?B[1]:W[1]); p.rect(-12,-4,24,4); p.F(W[3]); p.rect(-12,3,24,1); });
      p.id(); lattice(p,M,P2(cx-22,g-20),P2(cx+26,g-26),16,4); p.F(M.dust[2]); p.ell(cx,g,40,5); sparks(p,M.volt,P2(cx+8,g-30),6,10,3); return; }
    const w=30, h=40, top=g-h*2+4;
    rope(p,M.steel,[P2(cx,0),P2(cx,top)],3.4);
    platePoly(p,W,[[cx-w,top],[cx+w,top],[cx+w,g-4],[cx-w,g-4]],0,1);
    p.F(M.panel[3]); p.rect(cx-w+6,top+10,w*2-12,h*2-22);
    lattice(p,M,P2(cx-w+6,top+h),P2(cx+w-6,top+h),h*2-26,5);
    platePoly(p,B,[[cx-w-4,top-8],[cx+w+4,top-8],[cx+w,top+6],[cx-w,top+6]],0,1);
    platePoly(p,B,[[cx-w-2,g-10],[cx+w+2,g-10],[cx+w+2,g-2],[cx-w-2,g-2]],0,0.8);
    rivets(p,B,[[cx-w,top-2],[cx+w,top-2],[cx-w,g-6],[cx+w,g-6]],1.3);
    p.F(M.lamber[2]); p.ell(cx,top-3,3,2);
  }

  /* ---------------- FX ---------------- */
  function drawChainUp(p,M,sk,P){ p.id(); const w=sk.wrF; rope(p,M.steel,[P2(w.x+2,-8),P2(w.x,w.y-4)],3.6); p.F(M.brass[1]); p.ell(w.x+1,w.y-10,5,4); }
  function drawVolts(p,M,sk,P){ p.id(); const c=sk.T(22,-74), s=P.t*7+1; [[-60,-40],[50,-70],[-40,30],[60,20],[0,-110]].forEach(([dx,dy],k)=>bolt(p,M.volt,c,P2(c.x+dx,c.y+dy),s+k,1.4)); sparks(p,M.volt,c,8,16,s); }

  function parts(add,P,M,sk,form,anim){
    const fur=form==='furia';
    if(P.doors>=0) add({back:true},p=>drawDoorsBack(p,M,P));
    if(P.hide<0.5){
      const angF=Math.atan2(sk.wrF.y-sk.elF.y,sk.wrF.x-sk.elF.x), angB=Math.atan2(sk.wrB.y-sk.elB.y,sk.wrB.x-sk.elB.x);
      add({back:true},p=>drawGateBack(p,M,sk,P));
      add({back:true},p=>drawUpper(p,M,sk.shB,sk.elB,false,P));
      add({back:true},p=>drawFore(p,M,sk.elB,sk.wrB,false,P,fur));
      add({back:true},p=>drawHand(p,M,sk.wrB,angB,P.gate>0.5||anim==='rage'));
      add({back:true},p=>drawLeg(p,M,sk.hipB,sk.kneeB,sk.ankleB,P.fB,false));
      add({},p=>drawPelvis(p,M,sk,P));
      add({},p=>drawLeg(p,M,sk.hipF,sk.kneeF,sk.ankleF,P.fF,true));
      add({},p=>drawTorso(p,M,sk,P,form));
      add({noShade:true},p=>drawPanelGlow(p,M,sk,P,form));
      add({},p=>drawHead(p,M,sk,P,form));
      if(P.capOff>0.5) add({},p=>drawLooseCap(p,M,P,fur));
      if(P.chainUp>0.3) add({},p=>drawChainUp(p,M,sk,P));
      if(P.gateF>0.05) add({},p=>drawGateFront(p,M,sk,P));
      add({},p=>drawUpper(p,M,sk.shF,sk.elF,true,P));
      add({},p=>drawFore(p,M,sk.elF,sk.wrF,true,P,fur));
      add({},p=>drawHand(p,M,sk.wrF,angF,P.btn>0.3||P.gate>0.5||P.chainUp>0.3?false:true));
      if(P.spark||(fur&&anim!=='death'&&P.t%2===0)) add({noShade:true,noRim:true},p=>{ if(P.spark) drawVolts(p,M,sk,P); else { p.id(); sparks(p,M.volt,sk.T(24,-60),4,8,P.t+P.ph); } });
      if(P.smear&&anim==='plunge') add({noShade:true,smear:true,noRim:true},p=>{ p.id(); p.F(M.fx[1]); [-30,-10,10,30].forEach((dx,k)=>p.cap(P2(sk.hip.x+dx,sk.hip.y-200-(k%2)*20),P2(sk.hip.x+dx,sk.hip.y-110),0.8,2.6)); });
      if(P.smear&&anim==='door') add({noShade:true,smear:true,noRim:true},p=>{ p.id(); const a=sk.T(44,-70); p.F(M.fx[1]); [-24,0,24].forEach(dy=>p.cap(P2(a.x,a.y+dy),P2(a.x+90,a.y+dy+4),0.6,2.4)); });
      if(P.smear&&anim==='drop') add({noShade:true,smear:true,noRim:true},p=>{ p.id(); const w=sk.wrF; p.F(M.fx[1]); [-10,10].forEach(dx=>p.cap(P2(w.x+dx,w.y-70),P2(w.x+dx,w.y-10),0.8,2.4)); });
    }
    if(P.doors>=0&&P.doorsFront>0.5) add({},p=>drawDoorsFront(p,M,P));
    if(P.impact) add({noShade:true,smear:true,noRim:true},p=>{ p.id(); dust(p,M.dust,M.fx,anim==='door'?sk.T(44,-70).x+110:sk.hip.x+6,GROUND,anim==='death'?0.6:0.9); });
  }
  function anchors(sk,P){ return {eye:sk.H(20,-21),head:sk.H(8,-30),back:sk.T(-20,-80),hand:sk.wrF,panel:sk.T(22,-74),gate:sk.T(150,-70),stomp:{x:sk.hip.x+6,y:GROUND}}; }
  function prop(add,P,M,form,anim){ const st=Math.round(P.st||0); add({},p=>drawCabin(p,M,st)); }
  const qOfQ=R=>K_.qOf(R);

  return K_.factory({SC:0.9,FW,FH,GROUND,AX,RIM,ANIMS,NAMES,REST,mats0,fix,skeleton:RG.skeleton,parts,anchors,PROP:{FW:96,FH:96,GROUND:88,AX:48},prop});
})();
