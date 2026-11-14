/* ===== PET: Cachorro (vira-lata caramelo) ===== */
/* PET_CACHORRO — fonte de arte (editável). Build: npm run art */
/* Chibi hi-bit: cabeça grande 3/4 com dois olhos brilhantes, focinho creme, orelha semicaída, lenço vermelho
   com plaquinha. Pelo em 8 tons (R4+RX), sombra roxa grande, luz quente de cima-frente, rim da lua. */
const PET_CACHORRO=(function(){
  const {rad,lerp,P2}=PIX, C=PETCORE;
  const FW=100, FH=84, GROUND=78, AX=50, RIM='#a9c8f0';
  const CFG={AX,GROUND,bodyY:52,shX:10,hipX:-11,fl:[6.2,6.2],hl:[6.4,6.6],neck:[13,-5],tailRoot:[-17,-4],paw:1.6,legY:4,
    hull:[[-15,6.5,0.5],[0,8.6,0],[11,8.4,0]]};
  const VARS={
    caramelo:{nome:'Caramelo',fur:'#d48a3a',cream:'#f6dcaa',muz:'#f6dcaa',brow:'#f6dcaa',ear:'#a85e2a'},
    malhado:{nome:'Malhado P&B',fur:'#ece6da',cream:'#ffffff',muz:'#ffffff',brow:null,ear:'#2e2a34',spots:'#2e2a34'},
    pretinho:{nome:'Pretinho',fur:'#3a3440',cream:'#c98e52',muz:'#c98e52',brow:'#d49a5a',ear:'#2a2430'},
  };
  const mcache={};
  function mats(v){ if(mcache[v]) return mcache[v]; const V=VARS[v]||VARS.caramelo, M={};
    C.mat(M,'fur',V.fur); C.mat(M,'cream',V.cream); C.mat(M,'ear',V.ear,1.05);
    if(V.spots) C.mat(M,'spot',V.spots,1);
    C.mat(M,'nose','#3a2630',1); C.mat(M,'mouth','#5a1e30',1.1); C.mat(M,'tongue','#ef7a8a',1.1);
    C.mat(M,'band','#c8283c',1.1); C.mat(M,'tag','#e2c46a',1.1); C.mat(M,'iris','#8a5420',1.2); C.mat(M,'paw',V.cream===V.fur?V.fur:V.cream);
    M.ink=['#2a1620','#1a0c14','#120810','#0a0408'];
    return (mcache[v]=M); }
  const NAMES={fur:'Pelo',cream:'Creme',band:'Lenço',tongue:'Língua',nose:'Focinho'};
  const S=Math.sin, Cc=Math.cos, TAU=Math.PI*2;
  const REST={bx:0,by:0,tilt:0,head:0,jaw:4,tongue:1,tail:52,curl:18,ear:0,earF:0,fN:[3,-2],fF:[-3,-5],bN:[16,-14],bF:[11,-18],eye:'open',flash:0,brow:0,fx:null,fxt:0,free:0};
  const gait=(p)=>{ const fl=ph=>{ const h=4+20*S(ph); return [h,h-26*Math.max(0,Cc(ph))-2]; };
    const hl=ph=>{ const h=14+16*S(ph); return [h,h-30-12*Math.max(0,-Cc(ph))]; };
    return {fN:fl(p),bF:hl(p),fF:fl(p+Math.PI),bN:hl(p+Math.PI)}; };
  const SIT={tilt:-30,head:26,fN:[-6,-2],fF:[-10,-4],bN:[78,-72],bF:[72,-76]};
  const LIE={fN:[84,92],fF:[78,90],bN:[88,-96],bF:[84,-100],tail:-10,curl:-4};
  const ANIMS={
    idle:{nome:'Parado',n:8,dur:()=>150,pose:i=>{ const p=i/8*TAU, s=S(p);
      return {by:-0.5*s,head:1.6*S(p-0.6),jaw:5+3*S(2*p),tongue:1,tail:50+18*S(2*p),curl:18+4*S(2*p),earF:i===3?-10:(i===4?-4:0),ear:i===3?-4:0,eye:i===6?'closed':(i===5||i===7?'half':'open')}; }},
    walk:{nome:'Trotar',n:8,dur:()=>90,pose:i=>{ const p=i/8*TAU;
      return Object.assign(gait(p),{by:-1.2*Math.abs(S(2*p)),tilt:1.5*S(2*p),head:-2*S(2*p),tail:52+16*S(2*p),jaw:8,tongue:1,ear:-2+2*S(2*p),earF:-3*S(2*p)}); }},
    run:{nome:'Correr',n:6,dur:()=>70,pose:i=>{ const p=i/6*TAU, s=S(p), c=Cc(p);
      const f=o=>{ const h=12+44*S(p+o); return [h,h-8-44*Math.max(0,Cc(p+o))]; }, b=o=>{ const h=6-40*S(p+o); return [h,h-34-30*Math.max(0,Cc(p+o))]; };
      return {fN:f(0),fF:f(0.6),bN:b(0.9),bF:b(1.5),lift:3.5*Math.max(0,c),tilt:7*s,head:-6-4*s,ear:-10,earF:-14,tail:20+10*S(2*p),curl:6,jaw:12,tongue:2,bx:1}; }},
    sit:{nome:'Sentado',n:8,dur:()=>160,pose:i=>{ const p=i/8*TAU;
      return Object.assign({},SIT,{by:-0.4*S(p),head:SIT.head+2*S(p-0.5),tail:24+12*S(2*p),curl:-16,jaw:4+2*S(2*p),tongue:1,eye:i===5?'closed':'open',earF:i===2?-8:0}); }},
    lie:{nome:'Deitado',n:8,dur:()=>200,pose:i=>{ const p=i/8*TAU;
      return Object.assign({},LIE,{by:-0.3*S(p),head:6+1.5*S(p),jaw:3+2*S(p),tongue:1,tail:-8+8*S(2*p),eye:i===4?'closed':(i===3||i===5?'half':'open')}); }},
    sleep:{nome:'Dormir',n:8,dur:()=>230,pose:i=>{ const p=i/8*TAU;
      return Object.assign({},LIE,{by:-0.5*S(p)+0.4,head:22,jaw:0,tongue:0,eye:'sleep',ear:4,earF:8,tail:-30,curl:-24,fx:'zzz',fxt:i/8}); }},
    happy:{nome:'Feliz (pulinho)',n:8,dur:i=>[90,80,80,90,110,80,80,100][i],pose:i=>{ const p=i/8*TAU, up=Math.max(0,S(p));
      return {lift:12*up,by:(i===0?1.2:0),tilt:-10*up,head:-8*up+4,fN:[20+40*up,-10+30*up],fF:[14+36*up,-14+30*up],bN:[16+14*up,-14-20*up],bF:[12+14*up,-18-20*up],
        tail:62+22*S(4*p),curl:22,jaw:14,tongue:2,eye:'happy',ear:-6+6*up,earF:-12*up,fx:'heart',fxt:i/8}; }},
    bark:{nome:'Latir',n:6,dur:i=>[150,110,90,170,90,170][i],pose:i=>[
      {by:1,head:6,ear:4,earF:4,jaw:0,tongue:0,tail:60},
      {bx:-2,tilt:-6,head:-6,ear:-6,earF:-10,jaw:4,tongue:0,tail:70,brow:1},
      {bx:2,tilt:-8,head:-16,ear:-10,earF:-16,jaw:30,tongue:0,tail:76,eye:'wide',by:-2,fN:[30,10],fx:'bark',fxt:0},
      {bx:2,tilt:-6,head:-12,ear:-8,earF:-12,jaw:24,tongue:0,tail:72,eye:'wide',by:-1,fN:[24,8],fx:'bark',fxt:0.5},
      {bx:1,tilt:-4,head:-8,ear:-6,earF:-8,jaw:20,tongue:0,tail:66,fx:'bark',fxt:0.8},
      {head:0,jaw:6,tail:58}][i]},
    attack:{nome:'Mordida',n:5,dur:i=>[140,200,70,140,160][i],pose:i=>[
      {brow:1,ear:4,head:6,jaw:2,tongue:0,eye:'angry'},
      {brow:1,bx:-5,tilt:7,head:12,jaw:8,tongue:0,ear:-8,earF:-10,fN:[-6,-10],bN:[24,-10],tail:20,eye:'angry'},
      {brow:1,bx:9,tilt:-12,head:-6,jaw:34,tongue:0,fN:[62,40],fF:[50,30],bN:[-14,-34],bF:[-22,-40],ear:-12,earF:-16,eye:'angry'},
      {brow:1,bx:11,tilt:-4,head:2,jaw:0,tongue:0,fN:[30,10],fF:[20,6],eye:'angry'},
      {bx:4,jaw:6}][i]},
    special:{nome:'Latido de alerta',n:6,dur:i=>[160,160,200,220,160,160][i],pose:i=>[
      {ear:6,head:-4,tail:60,eye:'wide'},
      {ear:-8,earF:-10,tilt:-6,head:-10,tail:72,jaw:2,tongue:0,by:-1,eye:'wide'},
      {ear:-12,earF:-16,tilt:-8,head:-16,tail:74,jaw:28,tongue:0,by:-2,eye:'wide',fx:'bark',fxt:0},
      {ear:-12,earF:-16,tilt:-12,head:-20,tail:78,jaw:32,tongue:0,by:-3,fN:[46,24],eye:'wide',fx:'bark',fxt:0.6},
      {ear:-6,tilt:-4,head:-8,tail:64,jaw:8},
      {}][i]},
    hurt:{nome:'Dano',n:4,dur:i=>[80,130,130,160][i],pose:i=>[
      {flash:1,eye:'closed',bx:-3},
      {bx:-6,head:-20,tilt:6,ear:10,earF:12,eye:'closed',tail:-50,curl:-10,fN:[30,10],jaw:10,tongue:0},
      {bx:-5,head:-10,tilt:4,eye:'half',tail:-40,curl:-8},
      {bx:-2}][i]},
    ko:{nome:'Desmaio',n:6,dur:i=>[80,180,160,140,120,600][i],pose:i=>[
      {flash:1,eye:'closed'},
      {eye:'x',head:-12,tilt:-8,bx:-3,jaw:14,tongue:2},
      {eye:'x',head:8,tilt:6,by:2,fN:[30,30],bN:[-10,-30],jaw:14,tongue:2},
      Object.assign({},LIE,{eye:'x',head:16,jaw:14,tongue:2,tail:-6,curl:0,ear:8,earF:12}),
      Object.assign({},LIE,{eye:'x',head:18,jaw:14,tongue:2,tail:-6,curl:0,by:0.4,ear:8,earF:12}),
      Object.assign({},LIE,{eye:'x',head:16,jaw:14,tongue:2,tail:-6,curl:0,ear:8,earF:12})][i]},
  };
  function poseOf(anim,i){ const A=ANIMS[anim]||ANIMS.idle; return Object.assign({},REST,A.pose(i%A.n)); }

  /* ---------- desenho ---------- */
  const BODY=[['e',0,0,13,8.6],['e',10,-1,8.4,9],['e',-10,0,8.2,8.2]];
  function drawBody(p,M,sk,V){ p.xf(sk.a,sk.base.x,sk.base.y);
    C.shade(p,BODY,M.fur,M.furX,9,{c:P2(2,-2)});
    // barriga e peito creme, recortados no corpo
    C.within(p,BODY,()=>{ C.shade(p,[['e',2,9,15,4.6],['e',15,4,6.4,8]],M.cream,M.creamX,5,{spec:false}); });
    if(V.spots){ C.within(p,BODY,()=>{ C.shade(p,[['e',-9,-4,6,5.4]],M.spot,M.spotX,5,{spec:false}); C.shade(p,[['e',4,-6,4.6,3.4]],M.spot,M.spotX,4,{spec:false}); }); }
    // fios de pelo e dobra das costelas
    C.strand(p,M.furX[2],P2(-4,-2),P2(-1,3),0.8); C.strand(p,M.furX[2],P2(1,-3),P2(3,2.4),0.8);
    C.strand(p,M.fur[0],P2(-6,-7.4),P2(4,-8.2),0.7); C.strand(p,M.furX[0],P2(-2,-8),P2(2,-8.4),0.6);
    // tufo do peito
    C.tufts(p,[P2(19,-1),P2(17.6,5),P2(13,9)],1.6,M.cream[1],2);
    C.tufts(p,[P2(-6,8.4),P2(6,8.8)],1.2,M.cream[2],3);
    p.id(); }
  function drawHaunch(p,M,sk,V){ const r=sk.legs.bN.root; p.id();
    C.shade(p,[['e',r.x+0.6,r.y-2.2,5.6,6.4,-0.3]],M.fur,M.furX,6,{spec:false});
    C.strand(p,M.furX[2],P2(r.x-3,r.y-1),P2(r.x-1.6,r.y+3),0.7); }
  function drawHead(p,M,sk,P,V){ p.xf(sk.ha,sk.neck.x,sk.neck.y);
    const SK=[['e',1.6,-8.4,9.6,8.2],['e',4.6,-3.6,7.2,4.6]];
    C.shade(p,SK,M.fur,M.furX,8.6,{c:P2(2.4,-8)});
    if(V.spots) C.within(p,SK,()=>C.shade(p,[['e',-2.6,-11,5.4,5]],M.spot,M.spotX,4,{spec:false}));
    // bochecha creme e tufo
    C.within(p,SK,()=>C.shade(p,[['e',6.4,-2,6.4,3.6]],M.cream,M.creamX,4,{spec:false}));
    C.tufts(p,[P2(-6.8,-5),P2(-4,-0.6),P2(0,0.8)],1.6,M.fur[1],2);
    C.tufts(p,[P2(-1,-16.2),P2(4,-16.4)],1.2,M.furX[1],2);
    // olho de trás (3/4)
    C.eye(p,10.6,-10.4,1.45,2.0,P.eye,M.iris,M.ink[1],{lid:M.fur[2]});
    // focinho
    C.shade(p,[['e',11,-5.6,5.8,3.8],['e',8,-7.4,4,2.6]],V.muz===V.cream?M.cream:M.cream,M.creamX,4,{c:P2(10.4,-6)});
    p.F(M.creamX[2]); p.rect(7,-2.4,6,0.8);
    // nariz
    C.shade(p,[['e',15.6,-7,2.4,1.8]],M.nose,M.noseX,2.2);
    p.F('#fffbf0'); p.rect(15.6,-8.2,1,0.7);
    p.F(M.mouth[2]); p.rect(15,-5.4,0.8,1.6); p.poly([[11.4,-3.4],[15.4,-4],[15.4,-3.4],[11.6,-2.8]]);
    // olho da frente grande
    C.eye(p,4.8,-9.8,2.1,2.5,P.eye,M.iris,M.ink[1],{lid:M.fur[2]});
    // sobrancelha "quatro olhos" e bochecha rosada
    if(V.brow){ p.F(P.brow?M.creamX[2]:M.cream[1]); if(P.brow) p.poly([[2.4,-14.4],[7,-12.6],[6.8,-12],[2.4,-13.4]]); else p.ell(4.4,-13.6,1.6,0.9); }
    else if(P.brow){ p.F(M.furX[3]); p.poly([[2.4,-14.4],[7,-12.6],[6.8,-12],[2.4,-13.4]]); }
    if(P.eye==='happy'||P.eye==='open') { p.F(M.tongueX[0]); p.ell(6.6,-5.6,1.6,0.8); }
    // orelha da frente (semicaída, ponta dobrada)
    const e=rad(P.ear*3+P.earF*2), q=sk.H(-3.4,-13.8); p.xf(sk.ha+e-0.15,q.x,q.y);
    C.shade(p,[['p',[[-3.6,1.4],[3.6,0.8],[1.6,-7],[-0.6,-7.6]]]],M.ear,M.earX,4,{c:P2(0,-3),spec:false});
    p.F(M.tongueX[2]); p.poly([[-1.6,0.6],[1.8,0.2],[0.6,-4.6]]); p.F(M.tongue[2]); p.poly([[-0.6,0.4],[1,0.2],[0.4,-2.6]]);
    if(P.earF>-6){ p.F(M.earX[2]); p.poly([[0.4,-7.4],[4.4,-5.4],[1.8,-4.2]]); p.F(M.ear[1]); p.poly([[0.8,-7.2],[3.6,-5.6],[1.8,-5]]); }
    p.id(); }
  function drawEarFar(p,M,sk,P){ const q=sk.H(1.4,-15); p.xf(sk.ha+rad(P.ear*2+P.earF*1.4)+0.15,q.x,q.y);
    C.shade(p,[['p',[[-3,1],[3,0.6],[0.8,-7]]]],M.ear,M.earX,3,{lite:false}); p.id(); }
  function drawJaw(p,M,sk,P){ const h=sk.H(6,-3.4); p.xf(sk.ha+rad(P.jaw),h.x,h.y);
    p.F(M.mouth[2]); p.poly([[-0.6,-1.6],[9.4,-2.2],[9.6,1.4],[0.4,1.8]]);
    p.F(M.mouth[3]); p.poly([[0,-0.6],[8,-1.4],[8,0],[1,0.8]]);
    C.shade(p,[['p',[[0,0.2],[9.4,-0.4],[9.2,2.2],[6,3.6],[1,3.2]]]],M.cream,M.creamX,2.4,{spec:false,c:P2(5,1.6)});
    p.F('#fffbf0'); p.rect(8.2,-1,0.9,1.2); if(P.jaw>14) p.rect(2,-0.8,0.8,1);
    if(P.tongue){ const Lg=P.tongue>1?8.6:5.6; C.shade(p,[['p',[[3.6,0.4],[8,0.2],[8.4,Lg-1],[6.2,Lg+0.6],[4.2,Lg-0.6]]]],M.tongue,M.tongueX,2.4,{spec:false,c:P2(6,Lg/2)});
      p.F(M.tongue[2]); p.rect(6,1.2,0.7,Lg-2.4); }
    p.id(); }
  function drawBandana(p,M,sk){ p.xf(sk.a,sk.base.x,sk.base.y);
    C.shade(p,[['p',[[10.6,-9.6],[19.4,-7],[20.4,-4.4],[16,4.6],[12,-3]]]],M.band,M.bandX,4,{c:P2(15,-4),spec:false});
    p.F(M.bandX[3]); p.poly([[10.6,-9.6],[20,-6.6],[20.2,-5.4],[10.8,-8.2]]);
    p.F(M.bandX[0]); p.rect(14.6,-5,1,1); p.rect(17,-2.4,1,1); p.rect(15.4,0.6,0.9,0.9); p.F(M.band[0]); p.rect(13,-6.4,1.4,0.8);
    C.shade(p,[['e',16.4,6.4,1.9,2]],M.tag,M.tagX,2); p.F(M.tagX[3]); p.rect(16.2,5.6,0.6,1.6);
    p.id(); }
  function drawFx(p,P,sk){ p.id(); const F=C.FXC, h=sk.H(4,-20);
    if(P.fx==='zzz'){ const t=P.fxt; [0,0.34,0.67].forEach((o,k)=>{ const u=(t+o)%1; C.zzz(p,h.x+2+u*8+k,h.y-1-u*14,2.4+u*2.4,F.z); }); }
    if(P.fx==='heart'){ const t=P.fxt; [0,0.5].forEach((o,k)=>{ const u=(t+o)%1; C.heart(p,h.x+(k?12:-2)+S(u*6)*1.5,h.y-3-u*14,1.6+u*1.2,F.heart[0],F.heart[1]); }); }
    if(P.fx==='bark'){ const m=sk.H(19,-5), s=6+P.fxt*4; C.shout(p,m.x+1+P.fxt*3,m.y,s,F.bark,3); }
  }
  const cache=C.mkCache(700);
  function frame(v,anim,fi,step=5){
    if(!VARS[v]) v='caramelo'; if(!ANIMS[anim]) anim='idle';
    const K=PIX.getK(), key=v+'|'+anim+'|'+fi+'|'+step+'@'+K, hit=cache.get(key); if(hit) return hit;
    const P=poseOf(anim,fi), V=VARS[v], M=mats(v), sk=C.skeleton(P,CFG), Lg=sk.legs;
    const tp=C.tailPts(sk.tailRoot,P,5,3.6);
    const pw=C.pen;
    const parts=[
      {back:true,draw:(c,u)=>{ const p=pw(c,u); C.leg(p,M.fur,M.furX,M.paw,M.pawX,Lg.fF,4.6,3.8,2.5); C.leg(p,M.fur,M.furX,M.paw,M.pawX,Lg.bF,5.6,3.8,2.5); }},
      {back:true,draw:(c,u)=>drawEarFar(pw(c,u),M,sk,P)},
      {draw:(c,u)=>{ const p=pw(c,u); C.tail(p,M.fur,M.furX,tp,5.4,2.6,{tip:M.cream,tipX:M.creamX}); }},
      {draw:(c,u)=>drawBody(pw(c,u),M,sk,V)},
      {draw:(c,u)=>{ const p=pw(c,u); C.leg(p,M.fur,M.furX,M.paw,M.pawX,Lg.bN,5.8,4,2.8); drawHaunch(p,M,sk,V); }},
      {draw:(c,u)=>{ const p=pw(c,u); C.leg(p,M.fur,M.furX,M.paw,M.pawX,Lg.fN,5,4,2.8); }},
      {draw:(c,u)=>drawBandana(pw(c,u),M,sk)},
      {draw:(c,u)=>drawJaw(pw(c,u),M,sk,P)},
      {draw:(c,u)=>drawHead(pw(c,u),M,sk,P,V)},
    ];
    if(P.fx) parts.push({noShade:true,noRim:true,smear:true,draw:(c,u)=>drawFx(pw(c,u),P,sk)});
    const cv=C.build({FW,FH,GROUND,parts,M,step,flash:P.flash,rim:RIM});
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._mouth=sc(sk.H(16,-4)); cv._head=sc(sk.H(2,-18)); cv._paw=sc(Lg.fN.f); cv._center=sc(sk.base);
    return cache.set(key,cv);
  }
  return {id:'cachorro',PS:1,FW,FH,GROUND,AX,VARS,ANIMS,NAMES,poseOf,frame,mats,RIM};
})();
