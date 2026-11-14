/* VENDEDORFITAS — fonte de arte (editável). Build: npm run art
   Mini boss do Pelourinho "O Vendedor de Fitas": vendedor ambulante magro e alto do Terreiro de Jesus tomado pela
   Lua de Sangue. Chapéu de palha surrado, camisa branca de botão suja, colete preto, calça escura, tabuleiro de
   madeira pendurado no peito com lembrancinhas (chaveirinhos, tamborzinhos, apitos) e centenas de fitas de tecido
   coloridas (azul, amarelo, vermelho, verde) que flutuam como tentáculos. Dedos longos amarrados com fita, sorriso
   largo costurado. As fitas são fitinhas do Senhor do Bonfim
   (faixa fina de cetim que torce mostrando frente/verso, letreiro sugerido, ponta em V). Fúria: pontas das fitas em brasa
   pegando fogo, tabuleiro quebrado. Adereços: fitas no chão (poça de lentidão) e laço de fita (projétil). */
const VENDEDORFITAS=(function(){
  const {rad,lp,lerp,P2}=PIX;
  const K_=BOSSKIT, {S,C,PI,mass,platePoly,clipPoly,band,bandA,ellPts,arc,bez,bez3,limb,fold,stitches,rivets,rnd,stain,flames,dust,sparks,puffs}=K_;
  const FW=350, FH=260, GROUND=250, AX=160;
  const RIM={normal:'#ffe6c8', furia:'#ff9a6a'};

  function mats0(form){
    const m={
      shirt:['#fffbee','#e6dcc8','#aa9e98','#5e5466'],
      vest:['#6c6474','#36303e','#221e2a','#121018'],
      pants:['#6a7088','#3a3e54','#242638','#14141e'],
      straw:['#fff0b0','#dcb860','#9a7a3a','#54401e'],
      wood:['#e2b47a','#a87a48','#6a4a30','#3a281e'],
      skin:['#d8dcb0','#9ca484','#606c62','#323844'],
      shoe:['#8a7060','#4e3a32','#2e2220','#181012'],
      rb:['#a8d0ff','#3c74c8','#244a8a','#122650'],
      ry:['#fff4b0','#f0c63c','#b4881e','#6a4a12'],
      rr:['#ffb0a0','#d8403e','#8e2030','#4c1020'],
      rg:['#c0f0b0','#48ae68','#2a7044','#143c28'],
      rw:['#ffffff','#f2d6ea','#b490b4','#5e4870'],
      metal:['#f0eef8','#b0aec0','#6e6c80','#383646'],
      mouth:['#6c2c3a','#421a28','#2a0e18','#1a0710'],
      thread:['#7a6660','#4a3a3c','#2e2228','#1a1218'],
      blood:['#9c3a36','#6e222c','#46141e','#280a12'],
      eye:['#ffffff','#f4ffb0','#b8e040','#56801c'],
      ember:['#fffbe0','#ffd468','#ff7a30','#c02a10'],
      fx:['#fffef2','#fff2aa','#ffc24c','#e27c24'],
      dust:['#eadecd','#c6b6a0','#968671','#605448'],
    };
    if(form==='furia'){
      m.skin=['#b89a8a','#7a5a5e','#4c3446','#281a2a'];
      m.eye=['#ffffff','#ffd0a0','#ff6a2a','#b01c10'];
      m.rb=['#c0b8ff','#5c5ac8','#38307e','#1c1646'];
      m.rg=['#e0e8a0','#8aa848','#506a2c','#2a3818'];
      m.blood=['#e0503a','#a8282c','#6c1420','#3c0a14'];
    }
    return K_.finish(m,['fx','dust','eye','ember']);
  }
  const NAMES={shirt:'Camisa de botão',vest:'Colete preto',pants:'Calça escura',straw:'Chapéu de palha',wood:'Tabuleiro',skin:'Pele',shoe:'Sapato gasto',
    rb:'Fita azul',ry:'Fita amarela',rr:'Fita vermelha',rg:'Fita verde',rw:'Fita rosa',metal:'Lembrancinhas',eye:'Olho',ember:'Brasa'};

  /* ---------------- poses ----------------
     wind: fitas pra trás (-1) / pra cima (fly 1) · loop: laço girando no alto (lk 0..1) · lasso 0..1 laço lançado ·
     tray: 0 no peito · 1 erguido nas mãos · hatOff: chapéu caindo (hatX,hatY,hatR) · conf: fitas viram confete */
  const REST={hx:0,drop:2,lean:2,head:0,aFs:14,aFe:24,aBs:-10,aBe:6,lFh:12,lFk:-4,lBh:-8,lBk:-22,fF:0,fB:0,
    wind:-0.15,fly:0,loop:0,lk:0,lasso:0,tray:0,hatOff:0,hatX:0,hatY:0,hatR:0,conf:0,whip:0,roar:0,flash:0,smear:0,impact:0,dead:0,ph:0};
  const ANIMS={
    idle:{nome:'Parado (fitas flutuam, balança o tabuleiro)',n:8,dur:()=>165,pose:i=>{ const p=i/8*PI*2, s=S(p);
      return {lean:2+1.5*s, drop:2+1.4*S(p-0.5), head:-2+3*S(p-0.9), aFs:14+6*S(p-0.4), aFe:24+8*S(p-0.9), aBs:-10+6*S(p+0.5), aBe:6+6*S(p), ph:p}; }},
    walk:{nome:'Andar (passos leves, saltitando)',n:8,dur:()=>150,pose:i=>{ const p=i/8*PI*2+PI/2;
      const lFh=10+24*S(p), lBh=-6+24*S(p+PI);
      return {lFh, lFk:lFh-30*Math.max(0,C(p))-4, lBh, lBk:lBh-30*Math.max(0,C(p+PI))-8, fF:-8*C(p), fB:-8*C(p+PI),
        drop:-2+5*C(2*(p-PI/2)), lean:6+2*S(2*p), head:2*S(2*p-1), aFs:14-22*S(p), aFe:30-10*S(p), aBs:-6+22*S(p), aBe:14+10*S(p), wind:-0.35, ph:2*p}; }},
    lasso:{nome:'Laço de fitas (gira e lança)',n:9,warn:[1,2,3],throwAt:4,dur:i=>[150,140,140,140,80,160,160,160,160][i],pose:i=>[
      {lean:-4,head:-4,aFs:-20,aFe:0},
      {lean:-8,head:-10,aFs:168,aFe:176,loop:1,lk:0.1,lFh:18,lBh:-14},
      {lean:-10,head:-12,aFs:170,aFe:180,loop:1,lk:0.45,lFh:18,lBh:-14,roar:1},
      {lean:-10,head:-12,aFs:168,aFe:178,loop:1,lk:0.8,lFh:18,lBh:-14,roar:1},
      {lean:14,head:6,hx:6,aFs:96,aFe:92,lasso:1,smear:1,lFh:30,lFk:2,lBh:-22,lBk:-30,wind:-0.6},
      {lean:16,head:8,hx:6,aFs:94,aFe:90,lasso:1,lFh:30,lFk:2,lBh:-22,lBk:-30,wind:-0.5},
      {lean:-6,head:-4,aFs:50,aFe:20,lasso:0.4,lFh:12,lBh:-20},
      {lean:0,head:0,aFs:30,aFe:30},
      {lean:2,head:0,aFs:14,aFe:24}][i]},
    whip:{nome:'Chicote de fitas (arco)',n:8,warn:[1,2,3],hit:4,dur:i=>[140,150,140,90,80,150,170,160][i],pose:i=>[
      {lean:-6,head:-4,hx:-2,aFs:-60,aFe:-40,whip:-1},
      {lean:-12,head:-8,hx:-4,aFs:-100,aFe:-90,whip:-1,lFh:14,lBh:-20},
      {lean:-12,head:-10,hx:-4,aFs:-104,aFe:-96,whip:-1,roar:1,lFh:14,lBh:-20},
      {lean:6,head:2,hx:2,aFs:40,aFe:60,whip:0,smear:1,lFh:24,lBh:-22},
      {lean:16,head:8,hx:6,aFs:100,aFe:96,whip:1,smear:1,lFh:32,lFk:2,lBh:-24,lBk:-32},
      {lean:16,head:8,hx:6,aFs:110,aFe:120,whip:1,lFh:32,lFk:2,lBh:-24,lBk:-32},
      {lean:6,head:2,aFs:50,aFe:50,whip:0.4},
      {lean:2,head:0,aFs:14,aFe:24}][i]},
    rain:{nome:'Chuva de fitas (ergue o tabuleiro)',n:10,warn:[2,3,4],callAt:5,dur:i=>[160,160,160,150,150,90,170,170,170,160][i],pose:i=>[
      {lean:10,head:6,drop:4,aFs:30,aFe:100,aBs:30,aBe:100,lFh:20,lFk:-14,lBh:-12,lBk:-40},
      {lean:0,head:-8,aFs:140,aFe:146,aBs:140,aBe:146,tray:1},
      {lean:-8,head:-16,aFs:150,aFe:150,aBs:148,aBe:148,tray:1,roar:1,fly:0.5},
      {lean:-10,head:-18,aFs:152,aFe:152,aBs:150,aBe:150,tray:1,roar:1,fly:0.8},
      {lean:-10,head:-18,aFs:152,aFe:152,aBs:150,aBe:150,tray:1,roar:1,fly:1},
      {lean:-6,head:-12,aFs:160,aFe:120,aBs:160,aBe:120,tray:1,fly:1,smear:1,drop:-6},
      {lean:4,head:0,aFs:120,aFe:100,aBs:120,aBe:100,tray:0.5,fly:0.4},
      {lean:6,head:2,aFs:60,aFe:60,aBs:40,aBe:40},
      {lean:4,head:0,aFs:24,aFe:30,aBs:-4,aBe:10},
      {lean:2,head:0,aFs:14,aFe:24}][i]},
    dash:{nome:'Corrida (só na fúria)',n:8,warn:[0,1],run:[2,3,4,5],dur:i=>[140,140,80,80,80,80,150,160][i],pose:i=>{
      if(i<2) return {lean:20+i*4,head:10,drop:6,lFh:30,lFk:-30,lBh:-16,lBk:-50,aFs:-50,aFe:-30,aBs:-60,aBe:-40,wind:-0.6,roar:i};
      if(i>=6) return [{lean:10,head:4,aFs:20,aFe:30,wind:-0.3},{lean:2,head:0}][i-6];
      const p=(i-2)/4*PI*2; return {lean:30,head:14,drop:-2+3*C(2*p),lFh:20+36*S(p),lFk:-10-30*Math.max(0,C(p)),lBh:10-36*S(p),lBk:-20-30*Math.max(0,-C(p)),aFs:-70,aFe:-50,aBs:-80,aBe:-60,wind:-1,smear:1,roar:1,ph:p}; }},
    rage:{nome:'Entrar em fúria (fitas pegam fogo, tabuleiro quebra)',n:8,dur:i=>[170,140,140,180,200,200,200,180][i],pose:i=>[
      {lean:16,head:18,aFs:30,aFe:120,aBs:20,aBe:130,drop:4},
      {lean:18,head:22,aFs:34,aFe:126,aBs:24,aBe:136,drop:6,hx:-1},
      {lean:-8,head:-16,aFs:120,aFe:140,aBs:-100,aBe:-120,roar:1,fly:0.6},
      {lean:-14,head:-24,aFs:136,aFe:156,aBs:-120,aBe:-140,roar:1,fly:1},
      {lean:-16,head:-26,aFs:140,aFe:160,aBs:-124,aBe:-144,roar:1,fly:1,hx:-2},
      {lean:-16,head:-26,aFs:140,aFe:160,aBs:-124,aBe:-144,roar:1,fly:1,hx:2},
      {lean:-10,head:-20,aFs:120,aFe:140,aBs:-110,aBe:-130,roar:1,fly:0.5},
      {lean:2,head:0}][i]},
    hurt:{nome:'Dano',n:4,dur:i=>[80,110,130,160][i],pose:i=>[
      {flash:1,lean:-14,head:-20,hx:-6,aFs:-30,aFe:-20,aBs:-40,aBe:-30,roar:1,wind:0.6},
      {lean:-10,head:-14,hx:-4,aFs:-10,aFe:0,aBs:-26,aBe:-16,roar:1,wind:0.4},
      {lean:-2,head:-4,hx:-1,aFs:10,aFe:20},
      {}][i]},
    intro:{nome:'Entrada (WARNING): chega correndo e abre os braços',n:10,dur:i=>[120,120,120,120,180,220,220,260,240,220][i],pose:i=>{
      if(i<4){ const p=i/4*PI*2; return {hx:-60+i*16,lean:24,head:10,drop:-2+3*C(2*p),lFh:20+34*S(p),lFk:-10-28*Math.max(0,C(p)),lBh:10-34*S(p),lBk:-20-28*Math.max(0,-C(p)),aFs:-60,aFe:-40,aBs:-70,aBe:-50,wind:-1,ph:p}; }
      return [{lean:-4,head:-6,drop:6,lFh:30,lFk:-24,lBh:-14,lBk:-44,aFs:60,aFe:80,aBs:-40,aBe:-20,wind:0.4},
        {lean:-10,head:-14,aFs:100,aFe:110,aBs:-100,aBe:-110,fly:0.7,roar:1},
        {lean:-12,head:-18,aFs:104,aFe:114,aBs:-104,aBe:-114,fly:1,roar:1},
        {lean:-12,head:-18,aFs:104,aFe:114,aBs:-104,aBe:-114,fly:1,roar:1,hx:1},
        {lean:-4,head:-6,aFs:50,aFe:60,aBs:-40,aBe:-30,fly:0.4},
        {lean:2,head:0}][i-4]; }},
    death:{nome:'Morte (fitas viram confete, chapéu cai)',n:12,dur:i=>[90,150,170,170,180,180,170,170,200,220,400,700][i],pose:i=>{
      const lie={lean:-90,head:-6,hx:30,aFs:-80,aFe:-96,aBs:-70,aBe:-90,lFh:86,lFk:82,lBh:80,lBk:76,hatOff:1,hatX:-70,hatY:6,hatR:0.1};
      return [
        {flash:1,lean:-14,head:-22,hx:-6,aFs:-30,aFe:-20,roar:1,wind:0.6},
        {lean:-18,head:-28,hx:-8,aFs:130,aFe:150,aBs:-110,aBe:-130,roar:1,fly:0.6,conf:0.3},
        {lean:-10,head:-20,hx:-6,aFs:100,aFe:120,aBs:-80,aBe:-100,fly:1,conf:0.6,hatOff:1,hatX:0,hatY:220,hatR:-0.4},
        {lean:6,head:16,drop:6,lFh:40,lFk:-30,lBh:-10,lBk:-60,aFs:20,aFe:10,conf:1,hatOff:1,hatX:-20,hatY:170,hatR:-1},
        {lean:10,head:24,drop:20,lFh:70,lFk:-10,lBh:16,lBk:-80,aFs:10,aFe:0,conf:1,hatOff:1,hatX:-40,hatY:110,hatR:-1.6},
        {lean:-30,head:0,hx:8,lFh:60,lFk:40,lBh:40,lBk:30,aFs:120,aFe:140,aBs:110,aBe:130,conf:1,hatOff:1,hatX:-56,hatY:50,hatR:-2.2},
        Object.assign({},lie,{conf:1,impact:1,hatX:-64,hatY:20,hatR:-2.8}),
        Object.assign({},lie,{conf:1}),
        Object.assign({},lie,{conf:1,dead:0.3}),
        Object.assign({},lie,{conf:1,dead:0.5}),
        Object.assign({},lie,{conf:1,dead:0.7}),
        Object.assign({},lie,{conf:1,dead:1})][i]; }},
    xPool:{nome:'Fitas no chão (lentidão)',n:2,prop:true,dur:()=>200,pose:i=>({st:i})},
    xLasso:{nome:'Laço de fita (projétil)',n:2,prop:true,dur:()=>90,pose:i=>({st:2+i})},
  };
  function fix(P,anim,i){ if(!(anim==='death'&&i>=6)){ P.lean+=6; P.head-=3; } }

  const RG=K_.rig({AX,GROUND,THI:36,SHN:34,UPA:34,FOA:32,hipW:8,neck:[8,-86],shF:[12,-78],shB:[-10,-80],HS:1,FT:9,FL:22,
    contacts:(b,P)=>[b.T(-22,-40).y+2,b.T(-16,-80).y+2,b.H(-6,-30).y+2,b.kneeF.y+8,b.kneeB.y+8]});

  /* ---------------- fitas ---------------- */
  const RCOL=['rb','ry','rr','rg','rw'];
  // faixa chapada de cetim (fita do Bonfim): largura = |cos(torção)| mostra frente (clara, brilho, letreiro) e verso (fosco);
  // nas torções a fita afina e escurece (dobra); ponta cortada em V. pts: linha central; tw0/dtw: torção inicial e por ponto
  function strip(p,R,pts,W,tw0,dtw,txt,vcut){
    const n=pts.length-1, hw=[], sg=[], nx=[], ny=[];
    for(let j=0;j<=n;j++){ const a=pts[Math.max(0,j-1)], b=pts[Math.min(n,j+1)], L=Math.hypot(b.x-a.x,b.y-a.y)||1, c=C(tw0+dtw*j);
      nx.push(-(b.y-a.y)/L); ny.push((b.x-a.x)/L); hw.push(Math.max(0.5,W/2*Math.abs(c))); sg.push(c); }
    const Q=K_.qOf(R);
    for(let j=0;j<n;j++){ const A=pts[j], B=pts[j+1], cm=(sg[j]+sg[j+1])/2, front=cm>=0, ac=Math.abs(cm);
      const quad=[[A.x+nx[j]*hw[j],A.y+ny[j]*hw[j]],[B.x+nx[j+1]*hw[j+1],B.y+ny[j+1]*hw[j+1]],[B.x-nx[j+1]*hw[j+1],B.y-ny[j+1]*hw[j+1]],[A.x-nx[j]*hw[j],A.y-ny[j]*hw[j]]];
      p.F(front?(ac<0.4?Q[1]:R[1]):(ac<0.4?R[3]:R[2])); p.poly(quad);
      if(front&&ac>0.55){ // brilho do cetim numa borda + letreiro sugerido no meio
        const k=0.55; p.F(R[0]); p.poly([[A.x+nx[j]*hw[j],A.y+ny[j]*hw[j]],[B.x+nx[j+1]*hw[j+1],B.y+ny[j+1]*hw[j+1]],[B.x+nx[j+1]*hw[j+1]*k,B.y+ny[j+1]*hw[j+1]*k],[A.x+nx[j]*hw[j]*k,A.y+ny[j]*hw[j]*k]]);
        if(txt&&hw[j]>1.5){ p.F(txt); const m=lerp(A,B,0.25), m2=lerp(A,B,0.6); p.cap(P2(m.x-nx[j]*0.4,m.y-ny[j]*0.4),P2(m2.x-nx[j]*0.4,m2.y-ny[j]*0.4),0.95,0.95); } }
      else if(!front&&ac>0.5){ p.F(Q[2]); p.poly([[A.x-nx[j]*hw[j],A.y-ny[j]*hw[j]],[B.x-nx[j+1]*hw[j+1],B.y-ny[j+1]*hw[j+1]],[B.x-nx[j+1]*hw[j+1]*0.4,B.y-ny[j+1]*hw[j+1]*0.4],[A.x-nx[j]*hw[j]*0.4,A.y-ny[j]*hw[j]*0.4]]); }
      // vinco onde a fita vira (torção)
      if(sg[j]*sg[j+1]<0){ p.F(R[3]); const m=lerp(A,B,0.5); p.circle(m,0.8); }
    }
    if(vcut){ const e=pts[n], b=pts[n-1], an=Math.atan2(e.y-b.y,e.x-b.x), dx=C(an), dy=S(an), h=Math.max(1.3,hw[n]), fr=sg[n]>=0;
      p.F(fr?R[1]:R[2]); p.poly([[e.x+nx[n]*h,e.y+ny[n]*h],[e.x+dx*4.4+nx[n]*h,e.y+dy*4.4+ny[n]*h],[e.x+dx*1.6,e.y+dy*1.6],[e.x+dx*4.4-nx[n]*h,e.y+dy*4.4-ny[n]*h],[e.x-nx[n]*h,e.y-ny[n]*h]]);
      p.F(R[3]); p.rect(e.x+dx*1.6-0.5,e.y+dy*1.6-0.5,1,1); }
  }
  const TXT={rb:0,ry:3,rr:0,rg:0,rw:3}; // letreiro claro em fita escura, escuro em fita clara
  function ribbon(p,M,a,ang0,L,ci,P,seed,fur,tips){
    const key=RCOL[ci%5], R=M[key], ph=(P.ph||0)+P.t*0.9+seed*1.7, pts=[P2(a.x,a.y)], n=10;
    let q=pts[0];
    const flyA=P.fly*180, windA=P.wind*70;
    for(let j=1;j<=n;j++){ const u=j/n, ang=ang0*(1-P.fly)+flyA+windA*u+20*S(ph-j*0.55)*(0.4+u)+P.whip*60*u; q=lp(q,ang,L/n); if(q.y>GROUND-2) q=P2(q.x,GROUND-2); pts.push(q); }
    strip(p,R,pts,4.8,seed*1.9+ph*0.5,0.42+0.16*S(seed),R[TXT[key]],true);
    if(fur&&tips){ const e=pts[n]; tips.push([e.x,e.y,0.42]); }
  }
  // anchors das fitas no corpo (coordenadas do tronco/chapéu)
  const RIB_T=[[-12,-80,-40],[-8,-84,-20],[-2,-84,-6],[4,-82,6],[-16,-70,-30],[-17,-56,-20],[-18,-42,-14],[-16,-28,-6],[-12,-14,0],[-6,-70,-10],[10,-80,24],[16,-74,34],[20,-62,18],[22,-44,12],[20,-26,6]];
  function drawRibbonsBack(p,M,sk,P,fur,tips){ p.id(); RIB_T.slice(0,10).forEach(([x,y,a],k)=>ribbon(p,M,sk.T(x,y),-30+a,40+(k%3)*12,k,P,k,fur,tips)); }
  function drawRibbonsFront(p,M,sk,P,fur,tips){ p.id(); RIB_T.slice(10).forEach(([x,y,a],k)=>ribbon(p,M,sk.T(x,y),a,30+(k%2)*12,k+2,P,k+11,fur,tips)); }

  /* ---------------- membros ---------------- */
  function drawUpper(p,M,sh,el,front,P){
    const {ang,L}=limb(p,sh,el), R=M.shirt;
    p.F(R[2]); p.cap(P2(0,0),P2(L,0),17,14); mass(p,R,L*0.45,-2,10,7,ang,0.8); fold(p,R,[[L*0.6,-6],[L*0.66,0],[L*0.6,5]],1.1);
    p.F(M.blood[2]); if(front) p.ell(L*0.7,3,2,1.4);
  }
  function drawFore(p,M,el,wr,front,P){
    const {ang,L}=limb(p,el,wr), R=M.shirt, Sk=M.skin;
    p.F(R[2]); p.cap(P2(0,0),P2(L*0.6,0),14,12); mass(p,R,L*0.3,-1,8,6,ang,0.7);
    p.F(R[1]); p.cap(P2(L*0.56,-6),P2(L*0.56,6),3,3); p.F(R[3]); p.rect(L*0.58,-6,1,12);
    p.F(Sk[2]); p.cap(P2(L*0.6,0),P2(L,0),9,8); mass(p,Sk,L*0.8,-1,5,4,ang,0.6);
    // fitas amarradas no pulso
    [M.rr,M.ry].forEach((Rb,k)=>{ p.F(Rb[2]); p.cap(P2(L*(0.72+k*0.1),-5),P2(L*(0.74+k*0.1),5),2.4,2.4); p.F(Rb[0]); p.rect(L*(0.72+k*0.1)-0.5,-4,1,2); });
  }
  function drawHand(p,M,wr,ang,open){
    p.xf(ang,wr.x,wr.y); const R=M.skin;
    p.F(R[2]); p.ell(4,0,6,6);
    const fing=open?[[-26,15],[-8,17],[10,17],[26,14]]:[[-10,10],[0,11],[10,10],[20,9]];
    fing.forEach(([a,L],k)=>{ const r=rad(a), e=P2(5+C(r)*L,S(r)*L); p.F(R[2]); p.cap(P2(5,S(r)*2),e,3,2.4); p.F(R[1]); p.cap(P2(5,S(r)*2-0.5),P2(e.x-0.4,e.y-0.5),1.6,1.2); p.F(R[3]); p.circle(e,0.8);
      if(k===1||k===3){ const m=lerp(P2(5,S(r)*2),e,0.5); p.F(M[RCOL[k]][2]); p.circle(m,1.6); } });
    p.F(R[2]); p.cap(P2(1,-5),P2(7,-11),3.4,2.6); mass(p,R,3,0,5,5,ang,0.6);
  }
  function drawLeg(p,M,hip,knee,ankle,fa,front){
    let t=limb(p,hip,knee); const R=M.pants;
    p.F(R[2]); p.cap(P2(0,0),P2(t.L,0),18,15); mass(p,R,t.L*0.42,-2,10,7,t.ang,0.6); fold(p,R,[[t.L*0.7,-6],[t.L*0.76,-1],[t.L*0.72,4]],1.1);
    t=limb(p,knee,ankle);
    p.F(R[2]); p.cap(P2(-2,0),P2(t.L,0),15,14); p.F(R[1]); p.cap(P2(0,-2),P2(t.L*0.6,-3),8,7);
    p.F(R[3]); p.cap(P2(t.L*0.92,-8),P2(t.L*0.92,8),2,2); p.F(R[0]); [-6,-2,3].forEach(y=>p.rect(t.L*0.96,y,1.4,1));
    p.xf(rad(fa),ankle.x,ankle.y); const B=M.shoe;
    p.F(B[2]); p.poly([[-7,-7],[8,-7],[17,-2],[22,3],[22,8],[-9,8],[-9,-1]]); p.F(B[1]); p.poly([[-5,-6],[8,-6],[16,-1],[20,3],[12,3],[-4,1]]); p.F(B[0]); p.ell(16,0,3,1.2);
    p.F(B[3]); p.rect(-9,6.4,31,2); p.F(M.skin[2]); if(front) p.rect(18,6,4,2);
  }

  /* ---------------- tronco, tabuleiro ---------------- */
  function drawTorso(p,M,sk,P){
    p.xf(sk.a,sk.hip.x,sk.hip.y); const R=M.shirt, V=M.vest, A=sk.a;
    // pelve/calça
    p.F(M.pants[2]); p.poly([[-14,-6],[18,-6],[20,8],[10,14],[-10,14],[-16,6]]); p.F(M.pants[1]); p.poly([[-10,-6],[16,-6],[17,4],[-8,6]]);
    p.F(M.shoe[2]); p.rect(-15,-9,34,4); p.F(M.metal[1]); p.rect(10,-9,5,4);
    const sh=[[-16,-4],[-18,-40],[-18,-70],[-14,-82],[0,-90],[14,-88],[22,-80],[24,-60],[22,-30],[18,-4]];
    p.F(R[1]); p.poly(sh);
    clipPoly(sh,()=>{ mass(p,R,4,-46,22,46,A,1); fold(p,R,[[2,-70],[6,-50],[4,-30]]); fold(p,R,[[14,-60],[18,-44]]);
      p.F(R[3]); [-70,-56,-42,-28,-14].forEach(y=>p.circle(P2(20,y),0.9)); stain(p,M.blood,12,-34,4,2,4); p.F(M.dust[2]); p.ell(-4,-20,5,4); });
    // colete preto aberto
    const vb=[[-17,-6],[-19,-44],[-18,-72],[-12,-84],[-2,-86],[2,-60],[0,-30],[2,-6]];
    platePoly(p,V,vb,A,0.7); clipPoly(vb,()=>{ fold(p,V,[[-10,-70],[-8,-40],[-10,-14]]); });
    const vf=[[16,-86],[22,-80],[24,-56],[23,-28],[20,-6],[12,-6],[15,-30],[16,-56]];
    platePoly(p,V,vf,A,1); p.F(V[0]); bandA(p,[[17,-84],[19,-60]],1);
    p.F(M.metal[1]); [-60,-44,-28].forEach(y=>p.circle(P2(13.4,y),1.2));
    // gola
    p.F(R[0]); p.poly([[2,-90],[12,-89],[10,-84],[4,-84]]); p.F(R[3]); bandA(p,[[2,-90],[7,-84],[12,-89]],1);
  }
  function trayPos(sk,P){ if(P.tray<0.5) return {c:sk.T(30,-50),a:sk.a,str:true}; const m=lerp(sk.wrF,sk.wrB,0.5); return {c:P2(m.x+4,m.y-6),a:0,str:false}; }
  function drawTray(p,M,sk,P,fur){
    const tp=trayPos(sk,P); p.id();
    if(tp.str){ p.F(M.vest[2]); bandA(p,[[sk.T(16,-84).x,sk.T(16,-84).y],[tp.c.x-16,tp.c.y]],1.6); bandA(p,[[sk.T(-6,-86).x,sk.T(-6,-86).y],[tp.c.x+18,tp.c.y-2]],1.4); }
    p.xf(tp.a,tp.c.x,tp.c.y); const W=M.wood, w=24, broken=fur;
    const tb=broken?[[-w,-4],[4,-4],[8,0],[2,3],[6,6],[-w,6]]:[[-w,-4],[w,-4],[w,6],[-w,6]];
    platePoly(p,W,tb,0,1); p.F(W[0]); p.rect(-w+1,-4,broken?26:w*2-2,1); p.F(W[3]); p.rect(-w,5,broken?28:w*2,1);
    rivets(p,M.metal,[[-w+2,1],[broken?0:w-2,1]],0.9);
    // lembrancinhas: tamborzinho, apito, chaveirinhos
    const items=broken?[[-16,0],[-6,1]]:[[-16,0],[-6,1],[6,0],[16,1]];
    items.forEach(([x],k)=>{ if(k%2===0){ p.F(M.rr[2]); p.rect(x-3,-10,6,6); p.F(M.ry[1]); p.rect(x-3,-10,6,1.4); p.F(M.rr[0]); p.rect(x-2,-8,1,3); p.F(M.wood[2]); p.rect(x-3,-5,6,1); }
      else { p.F(M.metal[2]); p.circle(P2(x,-6),2.6); p.F(M.metal[0]); p.rect(x-1,-7.4,1,1); p.F(M[RCOL[k+1]][1]); p.rect(x-0.6,-11,1.2,4); } });
    if(broken){ p.F(W[2]); p.poly([[tp.c.x+12,GROUND-4],[tp.c.x+26,GROUND-6],[tp.c.x+24,GROUND-1]]); }
  }

  // fitas penduradas na borda do tabuleiro (parte própria, sem sombreamento de tubo)
  function drawTrayRibbons(p,M,sk,P,fur){ const tp=trayPos(sk,P), w=24, broken=fur; p.id();
    const n=broken?3:6; for(let k=0;k<n;k++){ const t=k/(n-1), x=-w+3+t*(broken?24:w*2-6); const at=P2(tp.c.x+x*C(tp.a),tp.c.y+6+x*S(tp.a)); ribbon(p,M,at,-6+k*3,18+(k%3)*6,k+1,P,k+30,fur,null); } }

  /* ---------------- cabeça e chapéu ---------------- */
  function drawHat(p,M){
    const R=M.straw;
    // aba larga
    p.F(R[2]); p.ell(8,-27,30,6); p.F(R[1]); p.ell(8,-28,28,4.6); p.F(R[0]); bandA(p,ellPts(8,-28,27,4,200,300,6),1);
    p.F(R[3]); [[-16,-26],[30,-25],[4,-23]].forEach(([x,y])=>p.poly([[x,y],[x+3,y+3],[x-2,y+2]]));
    // copa
    platePoly(p,R,[[-8,-30],[-6,-42],[2,-46],[16,-46],[22,-42],[24,-30]],0,1);
    p.F(R[2]); for(let y=-44;y<-31;y+=3) for(let x=-6;x<24;x+=5) p.rect(x+((y/3)&1)*2.5,y,2.4,1);
    // fita da copa
    p.F(M.rr[1]); p.rect(-8,-34,32,3.4); p.F(M.rr[0]); p.rect(-6,-34,28,1); p.F(M.rb[1]); p.rect(-8,-31,32,1.4);
    p.F(R[3]); p.poly([[14,-46],[18,-40],[12,-42]]);
  }
  function drawHead(p,M,sk,P){
    p.xf(sk.ha,sk.neck.x,sk.neck.y); const R=M.skin, A=sk.ha;
    p.F(R[2]); p.ell(0,2,6,6);
    const hd=[[-8,-2],[-10,-16],[-6,-28],[12,-30],[20,-22],[22,-10],[20,0],[12,4],[2,4]];
    p.F(R[2]); p.poly(hd); mass(p,R,6,-14,15,16,A,1);
    p.F(R[3]); bandA(p,[[10,-4],[14,-8]],0.9); p.F(qOfQ(R)[1]); p.ell(10,-9,4,2.4);
    p.F(R[2]); p.ell(-4,-14,3.4,5); p.F(R[3]); p.ell(-3.4,-13,1.6,3);
    const glow=1-P.dead;
    p.F(M.mouth[3]); p.ell(14,-17,3.6,3); if(glow>0.3){ p.F(M.eye[2]); p.ell(14.4,-17,2.4,2); p.F(M.eye[1]); p.ell(14.8,-17.2,1.4,1.1); p.F(M.eye[0]); p.rect(14.6,-18,1,1); }
    p.F(R[2]); p.poly([[19,-17],[25,-9],[20,-8]]); p.F(R[3]); p.rect(20,-9,4,1);
    // sorriso largo costurado (de orelha a orelha)
    const open=P.roar>0.5;
    p.F(M.mouth[2]); if(open) p.poly([[4,-6],[22,-6],[20,2],[8,2]]); else bandA(p,[[2,-6],[8,-3],[16,-3],[22,-6]],2);
    if(open){ p.F(M.mouth[3]); p.poly([[8,-4],[19,-4],[18,0],[9,0]]); }
    stitches(p,M.thread,[[2,-6],[8,-3],[16,-3],[22,-6]],2.6,3.4);
    p.F(M.blood[2]); p.poly([[14,-3],[17,-3],[16,2]]);
    if(P.hatOff<0.5) drawHat(p,M);
  }
  function drawLooseHat(p,M,P){ p.xf(P.hatR,AX+P.hatX,GROUND-P.hatY); drawHat(p,M); }

  /* ---------------- laço e chão ---------------- */
  function loopAt(sk,P){ const w=sk.wrF; return P2(w.x+4,w.y-18); }
  function drawLoop(p,M,sk,P){ p.id(); const c=loopAt(sk,P), a=P.lk*PI*2; const pts=ellPts(c.x,c.y,26,8,a*57,a*57+360,16).map(q=>P2(q[0],q[1]));
    strip(p,M.ry,pts,4.6,a,0.75,M.ry[3],false);
    strip(p,M.rr,[sk.wrF,lerp(sk.wrF,pts[0],0.5),pts[0]],4,a+1,1.2,null,false); }
  function drawLassoOut(p,M,sk,P){ p.id(); const w=sk.wrF, L=40+P.lasso*170, e=P2(w.x+L,w.y+4);
    const pts=[]; for(let k=0;k<=10;k++){ const t=k/10; pts.push(P2(w.x+L*t,w.y+4*t+3*S(t*PI*3+P.t))); }
    strip(p,M.ry,pts,4.4,P.t,0.7,M.ry[3],false);
    const lp2=ellPts(e.x+8,e.y,10,7,0,360,12).map(q=>P2(q[0],q[1])); strip(p,M.rr,lp2,4.6,P.t+1,0.9,M.rr[0],false); }
  function drawPool(p,M,st){
    p.id(); const cx=40, g=30;
    if(st<2){ // fitas espalhadas no chão
      p.F(M.dust[3]); p.ell(cx,g-1,34,5);
      for(let k=0;k<9;k++){ const R=M[RCOL[k%5]], x0=cx-30+rnd(k,1)*50, y0=g-6+rnd(k,2)*8, a=(rnd(k,3)-0.5)*1.4, L=12+rnd(k,4)*14;
        const pts=[]; for(let j=0;j<=4;j++){ const t=j/4; pts.push(P2(x0+C(a)*L*t,y0+S(a)*L*t*0.3+1.6*S(t*PI*2+k+st))); }
        strip(p,R,pts,3.6,k*1.3+st,0.9,null,true); }
      return; }
    // laço voando (projétil)
    const s=st-2, pts=ellPts(cx,g-14,12,8,s*40,s*40+360,14).map(q=>P2(q[0],q[1]));
    strip(p,M.ry,pts,4.4,s,0.7,M.ry[3],false); strip(p,M.rr,[P2(cx-12,g-14),P2(cx-21,g-15+s*2),P2(cx-30,g-12+s*2)],3.8,s,1.1,null,true);
  }
  function drawConfetti(p,M,sk,P){ p.id(); const c=sk.T(0,-60), k0=P.conf; for(let k=0;k<26;k++){ const R=M[RCOL[k%5]], a=rnd(k,7)*PI*2, d=(20+rnd(k,8)*70)*k0; const x=c.x+C(a)*d, y=Math.min(GROUND-2,c.y+S(a)*d*0.7+k0*k0*60*rnd(k,9)); p.F(R[1]); p.rect(x,y,2.4,1.6); p.F(R[0]); p.rect(x,y,1,1); } }

  function parts(add,P,M,sk,form,anim){
    const fur=form==='furia', tips=[];
    const angF=Math.atan2(sk.wrF.y-sk.elF.y,sk.wrF.x-sk.elF.x), angB=Math.atan2(sk.wrB.y-sk.elB.y,sk.wrB.x-sk.elB.x);
    if(P.conf<0.9) add({noShade:true},p=>drawRibbonsBack(p,M,sk,P,fur,tips));
    add({back:true},p=>drawUpper(p,M,sk.shB,sk.elB,false,P));
    add({back:true},p=>drawFore(p,M,sk.elB,sk.wrB,false,P));
    add({back:true},p=>drawHand(p,M,sk.wrB,angB,anim!=='rain'));
    add({back:true},p=>drawLeg(p,M,sk.hipB,sk.kneeB,sk.ankleB,P.fB,false));
    add({},p=>drawLeg(p,M,sk.hipF,sk.kneeF,sk.ankleF,P.fF,true));
    add({},p=>drawTorso(p,M,sk,P));
    add({},p=>drawHead(p,M,sk,P));
    if(P.hatOff>0.5) add({},p=>drawLooseHat(p,M,P));
    if(P.tray<0.5&&P.conf<0.9){ add({},p=>drawTray(p,M,sk,P,fur)); add({noShade:true},p=>drawTrayRibbons(p,M,sk,P,fur)); }
    if(P.conf<0.9) add({noShade:true},p=>drawRibbonsFront(p,M,sk,P,fur,tips));
    if(P.loop>0.5) add({noShade:true},p=>drawLoop(p,M,sk,P));
    if(P.lasso>0.05) add({noShade:true},p=>drawLassoOut(p,M,sk,P));
    add({},p=>drawUpper(p,M,sk.shF,sk.elF,true,P));
    add({},p=>drawFore(p,M,sk.elF,sk.wrF,true,P));
    add({},p=>drawHand(p,M,sk.wrF,angF,P.loop<0.5&&P.lasso<0.05&&anim!=='rain'));
    if(P.tray>=0.5&&P.conf<0.9){ add({},p=>drawTray(p,M,sk,P,fur)); add({noShade:true},p=>drawTrayRibbons(p,M,sk,P,fur)); }
    if(P.conf>0.05) add({noShade:true,noRim:true},p=>drawConfetti(p,M,sk,P));
    if(fur&&P.dead<0.9) add({noShade:true,noRim:true},p=>{ p.id(); flames(p,M.ember,tips.slice(0,10),P.t+P.ph,1); });
    if(P.smear&&anim==='whip') add({noShade:true,smear:true,noRim:true},p=>{ p.id(); K_.smear(p,M.fx,sk.shF.x,sk.shF.y+6,40,80,-80,60,0.7); });
    if(P.smear&&(anim==='dash')) add({noShade:true,smear:true,noRim:true},p=>{ p.id(); p.F(M.fx[1]); [-60,-40,-20].forEach((dy,k)=>p.cap(P2(sk.hip.x-90-k*10,sk.hip.y+dy+30),P2(sk.hip.x-30,sk.hip.y+dy+30),0.6,2.2)); });
    if(P.smear&&anim==='rain') add({noShade:true,smear:true,noRim:true},p=>{ p.id(); const t=trayPos(sk,P).c; for(let k=0;k<8;k++){ const a=rad(-160+k*20); p.F(M[RCOL[k%5]][1]); p.cap(P2(t.x+C(a)*14,t.y+S(a)*8),P2(t.x+C(a)*44,t.y+S(a)*30),2.4,1); } });
    if(P.impact) add({noShade:true,smear:true,noRim:true},p=>{ p.id(); dust(p,M.dust,null,sk.hip.x-20,GROUND,0.5); });
  }
  const qOfQ=R=>K_.qOf(R);
  function anchors(sk,P){ return {eye:sk.H(14,-17),head:sk.H(6,-24),back:sk.T(-12,-50),hand:sk.wrF,tray:trayPos(sk,P).c,stomp:{x:sk.hip.x,y:GROUND}}; }
  function prop(add,P,M,form,anim){ add({noShade:true},p=>drawPool(p,M,Math.round(P.st||0))); }

  return K_.factory({SC:0.86,FW,FH,GROUND,AX,RIM,ANIMS,NAMES,REST,mats0,fix,skeleton:RG.skeleton,parts,anchors,PROP:{FW:80,FH:40,GROUND:30,AX:40},prop});
})();
