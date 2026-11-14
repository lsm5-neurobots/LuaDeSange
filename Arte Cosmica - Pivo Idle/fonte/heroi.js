/* ===== HEROI: personagem inicial customizável (recruta do jogador) em hi-bit ===== */
const HEROI=(function(){
  const {rad,ramp,mix,lp,lerp,P2,mkPen,compose}=PIX;
  const FW=136, FH=150, GROUND=144, AX=56, RIM='#a9c8f0';
  const CAT={
    pele:['#f6d7c0','#eec4a2','#e0ac84','#c8925e','#b07a4a','#96603a','#7e4f32','#643c26','#4e2e1e','#3a2216'],
    cabeloCor:['#14100c','#2a1c14','#4a3020','#7a4a28','#a8743a','#d8b060','#e8dcc0','#8a8a8a','#c83a4a','#3a6ad8','#7a3ab0','#3ab07a'],
    olhos:['#4a2a18','#24160e','#3a6a3a','#3a5a9a','#8a6a2a','#5a5a6a'],
    roupa:['#e8e4d8','#2a2a32','#c83a3a','#3a6ad0','#2f8a4a','#e8b830','#e87a30','#7a3ab0','#6a4a32','#8a8a96','#3ac0c0','#e86aa0'],
    calcaCor:['#2e3a5e','#1e1e26','#5a5a62','#6a5a3a','#3a4a2e','#8a6a4a','#c8c0b0','#7a2a2a'],
    tenis:['#e8e4d8','#1e1e26','#c83a3a','#3a6ad0','#e8b830','#2f8a4a'],
    accCor:['#c83a3a','#1e1e26','#3a6ad0','#e8b830','#2f8a4a','#e8e4d8'],
  };
  const OPT={
    corpo:{m:'Masculino',f:'Feminino'},
    cabelo:{careca:'Careca',raspado:'Raspado',curto:'Curto',black:'Black power',moicano:'Moicano',tranca:'Trança',coque:'Coque',longo:'Longo'},
    barba:{nenhuma:'Nenhuma',porfazer:'Por fazer',bigode:'Bigode',cavanhaque:'Cavanhaque',cheia:'Cheia'},
    sobr:{reta:'Reta',grossa:'Grossa',fina:'Fina',arqueada:'Arqueada'},
    top:{camiseta:'Camiseta',regata:'Regata',moletom:'Moletom'},
    calca:{calca:'Calça',bermuda:'Bermuda'},
    acc:{nenhum:'Nenhum',bone:'Boné',oculos:'Óculos',bandana:'Bandana',fone:'Fone'},
  };
  const DEFAULT={nome:'Sobrevivente',corpo:'m',pele:'#b07a4a',cabelo:'curto',cabeloCor:'#2a1c14',barba:'porfazer',sobr:'reta',olhos:'#4a2a18',top:'camiseta',topCor:'#c83a3a',calca:'calca',calcaCor:'#2e3a5e',tenis:'#e8e4d8',acc:'nenhum',accCor:'#1e1e26'};
  function random(){ const pk=a=>a[Math.floor(Math.random()*a.length)], pko=o=>pk(Object.keys(o));
    const corpo=pko(OPT.corpo); return {nome:pk(['Dona Lia','Zé Biu','Kel','Tonho','Neide','Bia','Juca','Rai']),corpo,pele:pk(CAT.pele),cabelo:pko(OPT.cabelo),cabeloCor:pk(CAT.cabeloCor),barba:corpo==='f'?'nenhuma':pko(OPT.barba),sobr:pko(OPT.sobr),olhos:pk(CAT.olhos),top:pko(OPT.top),topCor:pk(CAT.roupa),calca:pko(OPT.calca),calcaCor:pk(CAT.calcaCor),tenis:pk(CAT.tenis),acc:pko(OPT.acc),accCor:pk(CAT.accCor)}; }
  function mats(c){
    return {
      skin:ramp(c.pele), hair:ramp(c.cabeloCor), top:ramp(c.topCor), pants:ramp(c.calcaCor), shoe:ramp(c.tenis),
      sole:['#ffffff','#e8e4dc','#b0aaa0','#6e6a64'], iris:ramp(c.olhos), acc:ramp(c.accCor),
      eye:['#ffffff','#f4efe6','#b8b4a8','#6e6a60'], mouth:['#8a3444','#4a1828','#2a0c18','#1a0610'], teeth:['#fffbe8','#e8e0c0','#b0a680','#6a6040'],
      lens:['#9ad8ff','#2a3a5a','#1a2440','#0c1222'], metal:['#ffffff','#c8ccd4','#8a8ea0','#4a4e60'],
      smear:['#ffffff','#fff6d0','#e8d8a0','#b8a870'],
    };
  }
  const REST={hx:0,lean:-2,head:0,aFs:4,aFe:14,aBs:-8,aBe:6,lFh:4,lFk:-2,lBh:-6,lBk:-8,bat:-10,inhand:0,mouth:0,smear:0,sa:0,flash:0,impact:0,brow:0};
  const GUARD={inhand:1,aFs:24,aFe:72,bat:58,aBs:28,aBe:84,lean:2,brow:1};
  const th=(p,o)=>4+18*Math.sin(p+o), sh=(p,o)=>th(p,o)-26*Math.max(0,Math.cos(p+o));
  const ANIMS={
    idle:{nome:'Parado',n:6,dur:()=>160,pose:i=>{ const p=i/6*Math.PI*2, s=Math.sin(p); return {lean:-2+0.8*s, head:0.8*Math.sin(p-0.7), aFs:4+1.5*s, aFe:14+2*s, aBs:-8+1.5*s, aBe:6+2*s}; }},
    walk:{nome:'Andar',n:8,dur:()=>115,pose:i=>{ const p=i/8*Math.PI*2;
      return {lFh:th(p,0), lFk:sh(p,0), lBh:th(p,Math.PI), lBk:sh(p,Math.PI), aFs:4-16*Math.sin(p), aFe:20-16*Math.sin(p), aBs:-6+16*Math.sin(p), aBe:4+16*Math.sin(p), lean:-1+1.2*Math.sin(2*p), head:Math.sin(2*p-0.6)}; }},
    guard:{nome:'Guarda',n:6,dur:()=>130,pose:i=>{ const p=i/6*Math.PI*2, s=Math.sin(p); return Object.assign({},GUARD,{lean:2+1.2*s, aFs:24+3*s, aFe:72+4*s, aBs:28+2*s, lFh:12, lFk:2, lBh:-12, lBk:-18, head:-2+s}); }},
    combo:{nome:'Combo com bastão',n:12,hits:{2:1,6:2,10:3},dur:i=>[120,50,60,90,90,40,60,90,130,40,70,170][i],pose:i=>Object.assign({},GUARD,[
      {aFs:-50,aFe:-10,bat:150,lean:-8,head:-4,hx:-3,lFh:10,lBh:-14,lBk:-18},
      {aFs:-30,aFe:30,bat:120,lean:-6,hx:-2,lFh:12,lBh:-14,lBk:-18},
      {aFs:86,aFe:92,bat:0,lean:10,hx:6,mouth:1,smear:1,sa:200,lFh:22,lFk:6,lBh:-18,lBk:-26},
      {aFs:100,aFe:112,bat:-6,lean:12,hx:7,mouth:1,lFh:22,lFk:6,lBh:-18,lBk:-26},
      {aFs:60,aFe:150,bat:40,lean:4,hx:4,lFh:16,lBh:-14,lBk:-20},
      {aFs:20,aFe:40,bat:-50,lean:2,hx:3,lFh:16,lBh:-14,lBk:-20},
      {aFs:120,aFe:150,bat:20,lean:-4,hx:6,mouth:1,smear:2,sa:10,lFh:18,lFk:4,lBh:-16,lBk:-22},
      {aFs:140,aFe:170,bat:10,lean:-6,hx:6,mouth:1,lFh:18,lFk:4,lBh:-16,lBk:-22},
      {aFs:170,aFe:190,bat:10,lean:-10,hx:3,lFh:8,lBh:-10,lBk:-14,mouth:1},
      {aFs:150,aFe:160,bat:20,lean:-8,hx:4,lFh:8,lBh:-10,lBk:-14},
      {aFs:70,aFe:80,bat:20,lean:22,hx:10,mouth:2,smear:3,sa:200,impact:1,lFh:28,lFk:10,lBh:-22,lBk:-32},
      {aFs:60,aFe:70,bat:30,lean:20,hx:9,mouth:1,lFh:28,lFk:10,lBh:-22,lBk:-32}][i])},
    hurt:{nome:'Dano',n:4,dur:i=>[80,110,130,160][i],pose:i=>Object.assign({},GUARD,[
      {lean:-14,head:-16,hx:-6,flash:1,aFs:-10,aFe:20,bat:90,aBs:-30,aBe:-10,mouth:2,brow:2,lFh:14,lBh:-4},
      {lean:-10,head:-12,hx:-5,aFs:0,aFe:30,bat:80,aBs:-20,aBe:0,mouth:1,brow:2,lFh:12,lBh:-6},
      {lean:-4,head:-4,hx:-2,aFs:14,aFe:50},
      {}][i])},
  };
  function poseOf(anim,i){ return Object.assign({},REST,ANIMS[anim].pose(i)); }
  function skeleton(P,c){
    const f=c.corpo==='f';
    const hip={x:AX+P.hx,y:76};
    const hipF={x:hip.x-3,y:hip.y}, hipB={x:hip.x+3,y:hip.y};
    const kneeF=lp(hipF,P.lFh,22), ankleF=lp(kneeF,P.lFk,22), kneeB=lp(hipB,P.lBh,22), ankleB=lp(kneeB,P.lBk,22);
    const dy=GROUND-Math.max(ankleF.y+5, ankleB.y+5);
    [hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB].forEach(p=>p.y+=dy);
    const a=rad(P.lean), co=Math.cos(a), s=Math.sin(a);
    const T=(lx,ly)=>({x:hip.x+lx*co-ly*s, y:hip.y+lx*s+ly*co});
    const neck=T(1,-32), shF=T(f?-3:-4,-28), shB=T(f?5:6,-29);
    const ha=rad(P.lean+P.head), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:neck.x+lx*hc-ly*hs, y:neck.y+lx*hs+ly*hc});
    const elF=lp(shF,P.aFs,14), wrF=lp(elF,P.aFe,13), elB=lp(shB,P.aBs,14), wrB=lp(elB,P.aBe,13);
    const bAng=P.aFe+P.bat, bDir=Math.atan2(Math.cos(rad(bAng)),Math.sin(rad(bAng)));
    return {hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,neck,shF,shB,elF,wrF,elB,wrB,a,ha,H,T,bDir};
  }
  function fist(p,M,el,wr){ const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y); p.F(M.skin[1]); p.ell(1.6,0,3.6,3.4); p.F(M.skin[2]); p.rect(2.4,-2.2,0.9,4.4); p.F(M.skin[1]); p.ell(0.4,-3,1.5,1.1); p.id(); }
  function drawArm(p,M,c,sh,el,wr){
    p.id(); const f=c.corpo==='f', w0=f?4.4:5, w1=f?3.6:4.2;
    p.F(M.skin[1]); p.cap(sh,el,w0,w1); p.cap(el,wr,w1,3.4);
    if(c.top==='camiseta'){ p.F(M.top[1]); p.cap(sh,lerp(sh,el,0.45),w0+3,w0+2.2); p.F(M.top[2]); p.circle(lerp(sh,el,0.44),0.8); }
    if(c.top==='moletom'){ p.F(M.top[1]); p.cap(sh,el,w0+3,w1+3); p.cap(el,lerp(el,wr,0.82),w1+3,w1+2.6); p.F(M.top[2]); p.cap(lerp(el,wr,0.74),lerp(el,wr,0.86),w1+2.8,w1+2.8); }
    fist(p,M,el,wr);
  }
  function drawLeg(p,M,c,hip,knee,ankle,front){
    p.id(); const f=c.corpo==='f';
    p.F(M.skin[1]); p.cap(hip,knee,f?8.4:9,7.2); p.cap(knee,ankle,7,5.6);
    p.F(M.pants[1]);
    if(c.calca==='bermuda'){ p.cap(hip,lerp(hip,knee,1.05),f?10:10.6,9); p.F(M.pants[2]); p.cap(lerp(hip,knee,0.95),lerp(hip,knee,1.05),9.4,9.2); }
    else { p.cap(hip,knee,f?9.6:10,8.6); p.cap(knee,ankle,8.6,7.8); if(front){ p.F(M.pants[0]); p.cap(lerp(hip,knee,0.15),lerp(knee,ankle,0.7),0.8,0.8); p.F(M.pants[2]); p.ell(knee.x+0.6,knee.y,2.4,1.8); } }
    const a=ankle;
    p.F(M.shoe[1]); p.poly([[a.x-4.4,a.y-3],[a.x+3,a.y-3.2],[a.x+9,a.y+0.6],[a.x+10,a.y+3.4],[a.x-4.6,a.y+3.4]]);
    p.F(M.sole[1]); p.rect(a.x-5,a.y+3,15.4,2); p.poly([[a.x+6,a.y+0.4],[a.x+9.4,a.y+1.2],[a.x+10,a.y+3.2],[a.x+6,a.y+3]]);
    p.F(M.sole[2]); [0,1,2].forEach(j=>p.rect(a.x-1+j*2.2,a.y-2.2+j*0.9,1.2,0.9));
  }
  function drawTorso(p,M,sk,c){
    const f=c.corpo==='f'; p.xf(sk.a,sk.hip.x,sk.hip.y);
    const body=f?[[-9.4,1],[9,1],[9.6,-7],[8.4,-13],[10.6,-20],[10,-27],[3.6,-31.6],[-3.6,-31.6],[-9,-27],[-10,-19],[-8.4,-13],[-10,-6]]
                :[[-10,1],[9.4,1],[10,-8],[11.4,-16],[12,-23],[10,-29],[4,-32.6],[-4.4,-32.6],[-10,-28.4],[-11.2,-19],[-10.6,-8]];
    p.F(M.skin[1]); p.poly(body);
    if(c.top==='regata'){
      p.F(M.top[1]); p.poly(f?[[-9.2,1],[8.8,1],[9.4,-7],[8.2,-13],[9.8,-20],[7.6,-27],[5,-27],[2.4,-23],[-1.4,-23],[-4,-27],[-6.6,-27],[-8.6,-20],[-8.2,-13],[-9.8,-6]]
                          :[[-9.8,1],[9.2,1],[9.8,-8],[11,-16],[10.6,-23],[7.6,-28.6],[5.2,-28.6],[3,-24],[-1.6,-24],[-3.8,-28.6],[-6.4,-28.6],[-9.6,-22],[-10.4,-8]]);
    } else {
      p.F(M.top[1]); p.poly(body);
      p.F(M.skin[1]); p.poly(f?[[-2,-31.6],[4,-31.6],[2.6,-28.6],[-0.6,-28.6]]:[[-2.4,-32.6],[4.4,-32.6],[3,-29.4],[-1,-29.4]]);
      p.F(M.top[2]); p.rect(-2.6,-29.6,7,0.9);
      p.F(M.top[2]); p.rect(-6,-20,1,14); p.rect(4,-14,4,0.9); p.rect(-4,-9,5,0.9);
      if(c.top==='moletom'){ p.F(M.top[1]); p.poly([[-10.6,-27],[-4,-34.6],[2,-35],[-2,-31],[-8,-26]]); p.F(M.top[2]); p.poly([[-9,-27],[-4,-32.4],[-1,-32.6],[-6,-26]]);
        p.F(M.top[2]); p.rect(-4,-12,11,6); p.F(M.top[1]); p.rect(-3,-11.2,9,4.4); p.F(M.metal[1]); p.rect(1.6,-28.6,0.8,6); p.rect(3.4,-28.4,0.8,5.4);
        p.F(M.top[2]); p.rect(-9.6,-2,19,2); }
    }
    if(f && c.top!=='moletom'){ p.F(M.top[0]); p.rect(3,-22,5,0.9); }
    p.F(M.pants[1]); p.poly([[-10.2,-2.6],[9.6,-2.6],[9.8,1.6],[-10.4,1.6]]); p.F(M.pants[2]); p.rect(-10,-2.6,19.6,0.9); p.F(M.metal[1]); p.rect(4.6,-2,1.6,1.6);
    p.id();
  }
  function drawHairBack(p,M,sk,c){
    if(!['longo','tranca','coque','black'].includes(c.cabelo)) return;
    p.xf(sk.ha,sk.neck.x,sk.neck.y); p.F(M.hair[1]);
    if(c.cabelo==='longo') p.poly([[-10,-18],[-4,-24],[2,-24],[-1,-14],[-2,2],[-6,10],[-11,8],[-12,-4]]);
    if(c.cabelo==='tranca'){ for(let k=0;k<6;k++){ p.ell(-8-k*0.6,-10+k*4.4,2.6,2.6); } p.F(M.acc[1]); p.rect(-12.6,15,3.2,2); }
    if(c.cabelo==='coque'){ p.ell(-6,-25,5,4.6); }
    if(c.cabelo==='black'){ p.ell(-2,-19,13,12); }
    p.id();
  }
  function drawHead(p,M,sk,P,c){
    const f=c.corpo==='f'; p.xf(sk.ha,sk.neck.x,sk.neck.y);
    p.F(M.skin[1]); p.cap(P2(0,3),P2(1,-6),f?6.6:7.8,f?6:7.2);
    p.F(M.skin[2]); p.rect(3,-4,1,5);
    p.F(M.skin[1]); p.ell(-4.4,-12.6,2.3,3.3); p.ell(2.4,-14,9.4,9.4);
    p.poly(f?[[-2,-8],[10.4,-9.4],[11.6,-5.6],[8.4,-1.6],[2,-1.4]]:[[-2,-8],[10.6,-9.4],[12.4,-5],[9.4,-1.2],[2,-1]]);
    p.F(M.skin[3]); p.ell(-4.4,-12.6,1,2);
    // olho
    p.F(M.eye[1]); p.ell(7,-13.6,2.5,2.1); p.F(M.iris[1]); p.rect(7.6,-14.6,1.7,2.2); p.F(M.mouth[3]); p.rect(8.2,-14.2,0.8,1.2); p.F(M.eye[0]); p.rect(7.8,-14.6,0.8,0.8);
    p.F(M.skin[2]); p.ell(11.6,-13.8,1.2,1.8); p.F(M.iris[1]); p.rect(11.6,-14.4,0.9,1.2);
    if(f){ p.F(M.hair[2]); p.rect(5,-16.2,5,0.9); p.rect(9.6,-16.8,1,1); p.F(M.mouth[0]); p.ell(6,-9.6,1.6,0.9); }
    // sobrancelha
    p.F(M.hair[2]); const by=P.brow===2?-19.2:-17.4;
    if(c.sobr==='grossa') p.poly([[3.4,by-0.4],[10.2,by+0.2],[10.2,by+2.4],[3.4,by+1.8]]);
    else if(c.sobr==='fina') p.rect(4,by+0.6,6,0.9);
    else if(c.sobr==='arqueada') p.poly([[3.6,by+1.2],[6.6,by-0.6],[10,by+0.6],[10,by+1.6],[6.6,by+0.6],[3.6,by+2.2]]);
    else p.poly([[3.6,by],[10,by+0.4],[10,by+2],[3.6,by+1.6]]);
    // nariz + boca
    p.F(M.skin[1]); p.poly([[10,-14],[13.4,-10],[10.4,-9.4]]); p.F(M.skin[2]); p.rect(9.8,-9.4,1,2);
    if(P.mouth===2){ p.F(M.mouth[1]); p.poly([[7,-7.4],[12,-7.6],[11.6,-3],[7.6,-3.2]]); p.F(M.teeth[1]); p.rect(7.6,-7.4,4,1.2); }
    else if(P.mouth===1){ p.F(M.mouth[1]); p.poly([[7.4,-7],[12,-7.2],[11.6,-4.6],[7.8,-4.8]]); p.F(M.teeth[1]); p.rect(7.8,-7,3.8,1.1); }
    else { p.F(f?M.mouth[0]:M.mouth[2]); p.rect(8,-6,3.6,f?1.3:0.9); }
    // barba
    if(!f && c.barba!=='nenhuma'){ p.F(M.hair[1]);
      if(c.barba==='porfazer'){ p.F(M.hair[2]); [[3,-3],[5,-2.4],[7,-2],[9,-2.4],[11,-3.6],[4,-5],[2,-6],[10,-4.8]].forEach(([x,y])=>p.rect(x,y,0.9,0.9)); }
      if(c.barba==='bigode'||c.barba==='cheia') p.poly([[6.4,-9.4],[13,-9.6],[13.4,-7.4],[10,-7.8],[6.6,-7]]);
      if(c.barba==='cavanhaque'){ p.poly([[7,-9.2],[12.6,-9.4],[12.8,-7.8],[7.2,-7.6]]); p.poly([[8,-4.2],[11.6,-4.4],[11,-0.6],[8.6,-0.6]]); }
      if(c.barba==='cheia') p.poly([[-2,-10],[0,-6],[3,-2],[8,-0.4],[11.6,-2],[12.4,-4.6],[11.6,-4.4],[9,-3],[6,-4.4],[2.6,-7],[0.6,-11]]);
    }
    // cabelo (frente)
    p.F(M.hair[1]);
    if(c.cabelo==='raspado'){ p.F(M.hair[2]); [[-6,-18],[-3,-21],[0,-22.4],[3,-22.6],[6,-21.6],[-7,-14],[-4,-17],[-1,-19],[2,-20],[5,-19],[-5,-11]].forEach(([x,y])=>p.rect(x,y,1,1)); }
    if(c.cabelo==='curto'){ p.poly([[-9.4,-12],[-9,-19],[-4,-23.6],[3,-24],[9,-21],[10.6,-17],[7,-18.6],[3,-19.6],[-1,-18.6],[-3,-15],[-6,-10]]); }
    if(c.cabelo==='black'){ p.ell(1,-19,11.6,8.6); p.ell(-6,-13,5,7); p.F(M.hair[0]); p.ell(-2,-24,4,1.4); }
    if(c.cabelo==='moicano'){ p.F(M.hair[2]); [[-6,-15],[-4,-18],[-1,-20],[6,-20]].forEach(([x,y])=>p.rect(x,y,1,1)); p.F(M.hair[1]); p.poly([[-7,-20],[-3,-27],[2,-30],[6,-28],[8,-23],[4,-23.6],[0,-23],[-4,-21]]); }
    if(c.cabelo==='tranca'||c.cabelo==='longo'||c.cabelo==='coque'){ p.poly([[-9.6,-11],[-9.4,-19],[-4,-24],[3,-24.4],[9.4,-21],[11,-16],[8,-19],[3,-20],[-2,-19.4],[-5,-16],[-6.4,-9]]); p.F(M.hair[2]); p.rect(-2,-22,0.9,3); }
    if(c.cabelo==='longo'){ p.F(M.hair[1]); p.poly([[-9.6,-14],[-6,-10],[-6,-2],[-9,2],[-10.6,-6]]); }
    // acessório
    if(c.acc==='bone'){ p.F(M.acc[1]); p.poly([[-10,-18],[-9,-25],[0,-28.4],[9.4,-26.4],[11.4,-20],[10,-18.6]]); p.F(M.acc[0]); p.poly([[-5,-25],[0,-27],[6,-26],[0,-25]]); p.F(M.acc[2]); p.poly([[8,-19.6],[19,-18.6],[18,-16.6],[8.4,-17.4]]); p.F(M.acc[0]); p.ell(1,-22,1.6,1.6); }
    if(c.acc==='bandana'){ p.F(M.acc[1]); p.poly([[-10,-17],[-8,-22],[0,-24.6],[9,-22],[11.2,-18],[0,-19.4]]); p.poly([[-10,-17],[-15,-12],[-13,-11],[-9,-14]]); p.F(M.acc[0]); [[-4,-21],[2,-22],[7,-20.6]].forEach(([x,y])=>p.rect(x,y,1,1)); }
    if(c.acc==='oculos'){ p.F(M.lens[1]); p.poly([[4.6,-15.6],[10.6,-15.8],[10.4,-12],[5,-12]]); p.F(M.lens[0]); p.rect(5.6,-15,2,0.9); p.F(M.metal[3]); p.rect(-3,-14.6,8,0.9); p.rect(10.4,-14.8,2.2,0.9); }
    if(c.acc==='fone'){ p.F(M.acc[2]); p.poly([[-9,-14],[-8,-24],[0,-28],[2,-27.4],[-5,-23],[-7,-14]]); p.F(M.acc[1]); p.ell(-4.4,-12.6,3.4,4.2); p.F(M.acc[0]); p.ell(-4,-13.6,1.2,1.4); }
    p.id();
  }
  function drawSmear(p,M,sk,P){
    p.id(); p.F(M.smear[1]);
    const tip=lp(sk.wrF,P.aFe+P.bat,28), sh=sk.shF;
    const cur=Math.atan2(tip.x-sh.x,tip.y-sh.y)*180/Math.PI, r1=Math.hypot(tip.x-sh.x,tip.y-sh.y)+4, r0=r1-12, n=10, pts=[];
    for(let k=0;k<=n;k++){ const a=P.sa+(cur-P.sa)*k/n; pts.push([sh.x+Math.sin(rad(a))*r1, sh.y+Math.cos(rad(a))*r1]); }
    for(let k=n;k>=0;k--){ const a=P.sa+(cur-P.sa)*k/n, rr=r0+(r1-r0)*(1-k/n)*0.6; pts.push([sh.x+Math.sin(rad(a))*rr, sh.y+Math.cos(rad(a))*rr]); }
    p.poly(pts);
  }
  const cache=new Map();
  function frame(cfg,anim,fi,step=5){
    const c=Object.assign({},DEFAULT,cfg), K=PIX.getK(), key=JSON.stringify(c)+anim+fi+step+'@'+K; if(cache.has(key)) return cache.get(key);
    if(cache.size>600) cache.clear();
    const P=poseOf(anim,fi), M=Object.assign(mats(c),BATON.TIERS.comum.M), sk=skeleton(P,c);
    const parts=[
      {back:true, draw:(cx,u)=>drawArm(mkPen(cx,u),M,c,sk.shB,sk.elB,sk.wrB)},
      {back:true, draw:(cx,u)=>drawLeg(mkPen(cx,u),M,c,sk.hipB,sk.kneeB,sk.ankleB,false)},
      {draw:(cx,u)=>drawHairBack(mkPen(cx,u),M,sk,c)},
      {draw:(cx,u)=>drawTorso(mkPen(cx,u),M,sk,c)},
      {draw:(cx,u)=>drawLeg(mkPen(cx,u),M,c,sk.hipF,sk.kneeF,sk.ankleF,true)},
      {draw:(cx,u)=>drawHead(mkPen(cx,u),M,sk,P,c)},
    ];
    if(P.inhand) parts.push({draw:(cx,u)=>BATON.draw(mkPen(cx,u),'comum',sk.wrF,sk.bDir)});
    if(P.smear) parts.push({noShade:true,smear:true,draw:(cx,u)=>drawSmear(mkPen(cx,u),M,sk,P)});
    parts.push({draw:(cx,u)=>drawArm(mkPen(cx,u),M,c,sk.shF,sk.elF,sk.wrF)});
    if(P.inhand) parts.push({draw:(cx,u)=>{ const p=mkPen(cx,u); fist(p,M,sk.elF,sk.wrF); }});
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM});
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._tip=sc(lp(sk.wrF,P.aFe+P.bat,BATON.TIERS.comum.len)); cv._head=sc(sk.H(4,-30));
    cache.set(key,cv); return cv;
  }
  return {FW,FH,GROUND,AX,CAT,OPT,DEFAULT,ANIMS,poseOf,frame,random,mats};
})();
