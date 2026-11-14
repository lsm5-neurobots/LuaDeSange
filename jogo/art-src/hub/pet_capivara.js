/* ===== PET: Capivara (com a mexerica na cabeça) ===== */
/* PET_CAPIVARA — fonte de arte (editável). Build: npm run art */
/* Chibi hi-bit: corpo de barril, cabeção quadradão de focinho largo, orelhinhas, olhar zen, mexerica com folha
   equilibrada na cabeça e bolsinha de primeiros socorros a tiracolo. Pelo grosso em 8 tons com fios marcados. */
const PET_CAPIVARA=(function(){
  const {rad,lerp,P2}=PIX, C=PETCORE;
  const FW=108, FH=84, GROUND=78, AX=52, RIM='#a9c8f0';
  const CFG={AX,GROUND,bodyY:52,shX:11,hipX:-12,fl:[4.8,4.4],hl:[5,4.8],neck:[15,-5],tailRoot:[-22,-2],paw:1.4,legY:6.4,
    hull:[[-18,7.6,0.4],[0,10.4,0],[11,9.8,0]]};
  const VARS={
    marrom:{nome:'Marrom',fur:'#a06a3c',belly:'#c48e58',snout:'#7a4a2c',paw:'#4a3022'},
    ruiva:{nome:'Ruiva',fur:'#b8683a',belly:'#d8945a',snout:'#8a4a28',paw:'#4a2a18'},
    escura:{nome:'Escura',fur:'#6a4e3a',belly:'#8c6a50',snout:'#4e382a',paw:'#2a1e16'},
  };
  const mcache={};
  function mats(v){ if(mcache[v]) return mcache[v]; const V=VARS[v]||VARS.marrom, M={};
    C.mat(M,'fur',V.fur,1.1); C.mat(M,'belly',V.belly,1.05); C.mat(M,'snout',V.snout,1.05); C.mat(M,'paw',V.paw,1);
    C.mat(M,'orange','#f2901e',1.15); C.mat(M,'leaf','#4fa83a',1.1); C.mat(M,'bag','#7a7440',1.05); C.mat(M,'strap','#5a3a22',1);
    C.mat(M,'label','#efe4c4',1); C.mat(M,'cross','#d8373a',1.1); C.mat(M,'iris','#5a3418',1.2); C.mat(M,'tongue','#ef7a8a',1.1); C.mat(M,'grass','#7ac04a',1.1);
    M.ink=['#2a1620','#160a10','#0e060a','#060204'];
    return (mcache[v]=M); }
  const NAMES={fur:'Pelo',belly:'Barriga',snout:'Focinho',orange:'Mexerica',bag:'Bolsinha'};
  const S=Math.sin, Cc=Math.cos, TAU=Math.PI*2;
  const REST={bx:0,by:0,tilt:0,head:0,jaw:0,ear:0,fN:[3,-2],fF:[-3,-4],bN:[8,-8],bF:[3,-12],eye:'open',flash:0,mex:0,mexX:0,mexY:0,tongue:0,grass:0,fx:null,fxt:0,lift:0};
  const gait=p=>{ const fl=ph=>{ const h=4+16*S(ph); return [h,h-18*Math.max(0,Cc(ph))-2]; };
    const hl=ph=>{ const h=8+14*S(ph); return [h,h-18-8*Math.max(0,-Cc(ph))]; };
    return {fN:fl(p),bF:hl(p),fF:fl(p+Math.PI),bN:hl(p+Math.PI)}; };
  const SIT={tilt:-24,head:22,fN:[-4,0],fF:[-8,-2],bN:[84,-80],bF:[78,-84]};
  const LIE={fN:[84,96],fF:[78,94],bN:[88,-96],bF:[84,-100]};
  const ANIMS={
    idle:{nome:'Parado (zen)',n:8,dur:()=>190,pose:i=>{ const p=i/8*TAU, s=S(p);
      return {by:-0.5*s,head:-1+1.2*S(p-0.6),jaw:i%4===1?6:(i%4===2?3:0),mex:3*S(p+1),ear:i===3?-16:0,eye:i===6?'closed':(i===5||i===7?'half':'open')}; }},
    walk:{nome:'Gingado',n:8,dur:()=>140,pose:i=>{ const p=i/8*TAU;
      return Object.assign(gait(p),{by:-0.8*Math.abs(S(2*p)),tilt:2*S(2*p),head:-2*S(2*p),mex:6*S(2*p+0.6),mexX:0.6*S(2*p+0.6)}); }},
    run:{nome:'Trotão',n:6,dur:()=>85,pose:i=>{ const p=i/6*TAU, s=S(p), c=Cc(p);
      const f=o=>{ const h=10+34*S(p+o); return [h,h-6-30*Math.max(0,Cc(p+o))]; }, b=o=>{ const h=2-30*S(p+o); return [h,h-20-20*Math.max(0,Cc(p+o))]; };
      return {fN:f(0),fF:f(0.5),bN:b(0.9),bF:b(1.4),lift:3*Math.max(0,c),tilt:5*s,head:-4-3*s,ear:-10,mex:-10+14*s,mexY:-1.6*Math.max(0,c),eye:'wide'}; }},
    sit:{nome:'Sentada',n:8,dur:()=>200,pose:i=>{ const p=i/8*TAU;
      return Object.assign({},SIT,{by:-0.4*S(p),head:SIT.head+1.2*S(p),jaw:i%4===1?5:0,mex:3*S(p),eye:i===4?'closed':'half'}); }},
    lie:{nome:'Deitada',n:8,dur:()=>230,pose:i=>{ const p=i/8*TAU;
      return Object.assign({},LIE,{by:-0.4*S(p),head:4+S(p),mex:2*S(p),eye:'half',jaw:i===2?4:0}); }},
    sleep:{nome:'Dormir',n:8,dur:()=>250,pose:i=>{ const p=i/8*TAU;
      return Object.assign({},LIE,{by:-0.6*S(p)+0.3,head:14,eye:'sleep',ear:6,mex:-8+3*S(p),mexX:-0.6,fx:'zzz',fxt:i/8}); }},
    happy:{nome:'Feliz (pulinho)',n:8,dur:()=>110,pose:i=>{ const p=i/8*TAU, up=Math.max(0,S(p));
      return {lift:7*up,tilt:-5*up,head:-4*up,fN:[10+26*up,-4+20*up],fF:[6+24*up,-6+20*up],bN:[8,-8-14*up],bF:[3,-12-14*up],eye:'happy',jaw:6,tongue:1,mex:-14*up+6*S(2*p),mexY:-3*up,fx:'heart',fxt:i/8}; }},
    chew:{nome:'Mastigar capim',n:8,dur:()=>150,pose:i=>{ const p=i/8*TAU;
      return {head:4+1.5*S(2*p),jaw:4+4*S(2*p),grass:1,eye:i===5?'closed':'half',mex:2*S(2*p),ear:i===2?-12:0}; }},
    attack:{nome:'Cabeçada',n:5,dur:i=>[160,280,80,150,180][i],pose:i=>[
      {eye:'angry'},
      {bx:-5,tilt:6,head:18,ear:-20,by:1,mex:-12,fN:[-8,-14],bN:[16,-4],eye:'angry'},
      {bx:8,tilt:-6,head:14,ear:-16,eye:'closed',mex:20,fN:[40,20],bN:[-10,-24]},
      {bx:10,tilt:-2,head:10,eye:'closed',mex:28,mexY:-3},
      {bx:4,mex:8}][i]},
    special:{nome:'Aura da calmaria',n:6,dur:i=>[200,240,260,260,260,260][i],pose:i=>[
      {},{eye:'happy',by:-0.4,fx:'calm',fxt:0},{eye:'happy',by:-1,fx:'calm',fxt:0.2},{eye:'happy',by:-0.6,fx:'calm',fxt:0.4},{eye:'happy',by:-1,fx:'calm',fxt:0.6},{eye:'open',fx:'calm',fxt:0.8}][i]},
    hurt:{nome:'Dano',n:4,dur:i=>[80,130,130,160][i],pose:i=>[
      {flash:1,eye:'wide',bx:-3},
      {bx:-5,head:-14,tilt:6,eye:'closed',ear:-16,mex:-18},
      {bx:-4,head:-6,tilt:3,eye:'half',mex:-8},
      {bx:-1}][i]},
    ko:{nome:'Desmaio',n:6,dur:i=>[80,180,160,140,120,600][i],pose:i=>[
      {flash:1,eye:'wide'},
      {eye:'x',head:-10,tilt:-6,bx:-3,mex:-30,mexX:-4},
      {eye:'x',head:8,tilt:4,by:3,mex:-80,mexX:-14,mexY:-10},
      Object.assign({},LIE,{eye:'x',head:12,mex:-180,mexX:-30,mexY:16,tongue:1}),
      Object.assign({},LIE,{eye:'x',head:11,mex:-200,mexX:-33,mexY:17,tongue:1,by:0.4}),
      Object.assign({},LIE,{eye:'x',head:12,mex:-200,mexX:-33,mexY:17,tongue:1})][i]},
  };
  function poseOf(anim,i){ const A=ANIMS[anim]||ANIMS.idle; return Object.assign({},REST,A.pose(i%A.n)); }

  /* ---------- desenho ---------- */
  const BODY=[['e',0,0,16,10.4],['e',-12,-1,10.4,10.4],['e',10.6,0,9.4,9.8]];
  function drawBody(p,M,sk){ p.xf(sk.a,sk.base.x,sk.base.y);
    C.shade(p,BODY,M.fur,M.furX,11,{c:P2(0,-2)});
    C.within(p,BODY,()=>C.shade(p,[['e',0,11,18,4.6],['e',13,6,6,7]],M.belly,M.bellyX,5,{spec:false}));
    // pelo grosso: fios em leque nas costas e flanco
    [[-20,-4],[-15,-8],[-9,-9.4],[-3,-9.6],[3,-9.4],[9,-8.4]].forEach(([x,y],k)=>{ C.strand(p,M.furX[2],P2(x,y+2.4),P2(x+1.6,y+5.6),0.8); C.strand(p,k%2?M.fur[0]:M.furX[1],P2(x+0.6,y-0.4),P2(x+2.6,y+0.6),0.7); });
    [[-14,1],[-7,2],[0,3],[6,2]].forEach(([x,y])=>C.strand(p,M.furX[2],P2(x,y),P2(x+1.4,y+3.6),0.7));
    C.tufts(p,[P2(-21,-6),P2(-22.4,0),P2(-20,6)],1.2,M.fur[2],2);
    C.tufts(p,[P2(-10,10),P2(8,10)],1.2,M.belly[2],4);
    p.id(); }
  function drawHaunch(p,M,sk){ const r=sk.legs.bN.root; p.id();
    C.shade(p,[['e',r.x+0.4,r.y-2.6,6.4,7,-0.2]],M.fur,M.furX,7,{spec:false});
    C.strand(p,M.furX[2],P2(r.x-3,r.y-2),P2(r.x-1.4,r.y+2),0.8); }
  function drawBag(p,M,sk){ p.xf(sk.a,sk.base.x,sk.base.y);
    p.F(M.strap[2]); p.poly([[11,-10],[13.6,-9.6],[-3,6],[-5.6,5.6]]); p.F(M.strap[0]); p.poly([[12,-9.8],[12.8,-9.6],[-3.8,5.6],[-4.4,5.4]]);
    C.shade(p,[['p',[[-11,-1],[3,-2],[4,9],[-10,10.4]]]],M.bag,M.bagX,6,{c:P2(-3.4,4),spec:false});
    p.F(M.bagX[3]); p.poly([[-11,-1],[3,-2],[3.2,0.6],[-10.8,1.6]]); p.F(M.bag[0]); p.rect(-9.6,-1.2,10,0.8);
    C.shade(p,[['p',[[-7.6,3],[-0.6,2.6],[-0.4,8.2],[-7.4,8.6]]]],M.label,M.labelX,3,{spec:false});
    p.F(M.cross[1]); p.rect(-4.6,3.6,1.6,4); p.rect(-6,4.8,4.4,1.6); p.F(M.cross[0]); p.rect(-4.6,3.6,1.6,0.6);
    p.F(M.labelX[0]); p.rect(1,0,1,1);
    p.id(); }
  function drawHead(p,M,sk,P){ p.xf(sk.ha,sk.neck.x,sk.neck.y);
    const SK=[['e',2,-6.4,9,7.4],['e',10,-6.6,8,6.8],['p',[[-4,-1],[16,-1.4],[16,-9],[-4,-10]]]];
    C.shade(p,SK,M.fur,M.furX,8,{c:P2(5,-7)});
    C.within(p,SK,()=>{ C.shade(p,[['e',14.2,-6.4,5.2,6.6]],M.snout,M.snoutX,5,{spec:false}); C.shade(p,[['e',4,-0.4,9,3]],M.belly,M.bellyX,3,{spec:false}); });
    C.tufts(p,[P2(-6.8,-6),P2(-6,-1),P2(-2,0.8)],1.4,M.fur[1],2);
    C.tufts(p,[P2(-2,-13.2),P2(6,-13.4)],1,M.furX[1],3);
    // narina, boca
    p.F(M.ink[1]); p.poly([[17.4,-10],[19,-9.4],[18.8,-8.6],[17.2,-9.2]]); p.F(M.snoutX[0]); p.rect(16.6,-11,1.6,0.8);
    p.F(M.snoutX[3]); p.rect(18,-3,1.4,0.8); p.poly([[14.6,-1.6],[18.6,-2.4],[18.6,-1.8],[14.8,-1]]);
    if(P.jaw>0){ p.F(M.snoutX[3]); p.poly([[14.6,-1.4],[18.4,-2],[18,-2+P.jaw*0.2],[15,-1.4+P.jaw*0.2]]); }
    if(P.tongue){ C.shade(p,[['e',17.2,-0.6,1.4,1.8]],M.tongue,M.tongueX,1.4,{spec:false}); }
    if(P.grass){ const j=P.jaw*0.2; p.F(M.grass[1]); p.poly([[16,-1.6+j*0.5],[24,-5],[24.4,-4.2],[16.4,-0.6+j*0.5]]); p.poly([[17,-1.2],[23,1.6],[22.4,2.2],[17,-0.4]]); p.F(M.grass[0]); p.rect(20,-3.6,2,0.6); p.F(M.grassX[2]); p.rect(19,0.4,2,0.6); }
    // olho (alto, tranquilo, com pálpebra pesada)
    C.eye(p,7.4,-9.2,1.9,2.1,P.eye,M.iris,M.ink[1],{lid:M.fur[2]});
    if(P.eye==='open'||P.eye==='half'){ p.F(M.furX[2]); p.poly([[5,-11.6],[9.8,-11.6],[9.8,-10.6],[5,-10.8]]); }
    if(P.eye==='happy'||P.eye==='half'||P.eye==='open'){ p.F(M.tongueX[0]); p.ell(9.2,-5.6,1.6,0.8); }
    // orelhinha
    const q=sk.H(-1.4,-12.2); p.xf(sk.ha+rad(P.ear),q.x,q.y);
    C.shade(p,[['e',0,-1.6,2.6,2.4]],M.fur,M.furX,2.4,{spec:false}); p.F(M.snout[2]); p.ell(0.4,-1.4,1.3,1.2);
    p.id(); }
  function drawEarFar(p,M,sk,P){ const q=sk.H(2.6,-13); p.xf(sk.ha+rad(P.ear),q.x,q.y); C.shade(p,[['e',0,-1.4,2.4,2.2]],M.fur,M.furX,2.2,{lite:false}); p.id(); }
  function drawMex(p,M,sk,P){ const q=sk.H(4+P.mexX,-17.4+P.mexY); p.xf(sk.ha+rad(P.mex),q.x,q.y);
    C.shade(p,[['e',0,0,4.6,4]],M.orange,M.orangeX,4.4);
    p.F(M.orange[2]); [[-2,1.4],[1,2.2],[2.4,-0.6],[-0.4,-1.2]].forEach(([x,y])=>p.rect(x,y,0.7,0.7));
    p.F(M.orangeX[3]); p.rect(-0.4,-4.2,0.9,1);
    p.F(M.leafX[2]); p.rect(-0.2,-5.6,0.9,1.8);
    C.shade(p,[['p',[[0.6,-5],[2.2,-6.8],[5,-6.6],[3,-4.4]]]],M.leaf,M.leafX,2,{spec:false}); p.F(M.leafX[2]); p.poly([[1,-5],[4.4,-6.4],[4.4,-6],[1.2,-4.6]]);
    p.id(); }
  function drawFx(p,P,sk){ p.id(); const F=C.FXC, h=sk.H(4,-22);
    if(P.fx==='zzz'){ [0,0.34,0.67].forEach((o,k)=>{ const u=(P.fxt+o)%1; C.zzz(p,h.x+4+u*8+k,h.y-u*12,2.4+u*2.4,F.z); }); }
    if(P.fx==='heart'){ [0,0.5].forEach((o,k)=>{ const u=(P.fxt+o)%1; C.heart(p,h.x+(k?14:-4)+S(u*6),h.y-u*12,1.6+u,F.heart[0],F.heart[1]); }); }
    if(P.fx==='calm'){ const c=sk.base; [0,0.25,0.5,0.75].forEach((o,k)=>{ const u=(P.fxt+o)%1, a=k*1.6+u*2; C.sparkle(p,c.x+Math.cos(a)*24,c.y-8+Math.sin(a)*8-u*10,1.2+1.4*S(u*Math.PI),k%2?F.spark:'#a8f0c0'); });
      C.note(p,h.x+12,h.y+2-P.fxt*8,2.4,F.note); }
  }
  const cache=C.mkCache(700);
  function frame(v,anim,fi,step=5){
    if(!VARS[v]) v='marrom'; if(!ANIMS[anim]) anim='idle';
    const K=PIX.getK(), key=v+'|'+anim+'|'+fi+'|'+step+'@'+K, hit=cache.get(key); if(hit) return hit;
    const P=poseOf(anim,fi), M=mats(v), sk=C.skeleton(P,CFG), Lg=sk.legs, pw=C.pen;
    const parts=[
      {back:true,draw:(c,u)=>{ const p=pw(c,u); C.leg(p,M.fur,M.furX,M.paw,M.pawX,Lg.fF,5.6,5,3); C.leg(p,M.fur,M.furX,M.paw,M.pawX,Lg.bF,7,5.4,3); }},
      {back:true,draw:(c,u)=>drawEarFar(pw(c,u),M,sk,P)},
      {draw:(c,u)=>drawBody(pw(c,u),M,sk)},
      {draw:(c,u)=>{ const p=pw(c,u); C.leg(p,M.fur,M.furX,M.paw,M.pawX,Lg.bN,7.4,5.6,3.3); drawHaunch(p,M,sk); }},
      {draw:(c,u)=>{ const p=pw(c,u); C.leg(p,M.fur,M.furX,M.paw,M.pawX,Lg.fN,6,5.2,3.3); }},
      {draw:(c,u)=>drawBag(pw(c,u),M,sk)},
      {draw:(c,u)=>drawHead(pw(c,u),M,sk,P)},
      {draw:(c,u)=>drawMex(pw(c,u),M,sk,P)},
    ];
    if(P.fx) parts.push({noShade:true,noRim:true,smear:true,draw:(c,u)=>drawFx(pw(c,u),P,sk)});
    const cv=C.build({FW,FH,GROUND,parts,M,step,flash:P.flash,rim:RIM});
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._mouth=sc(sk.H(19,-3)); cv._head=sc(sk.H(4,-22)); cv._paw=sc(Lg.fN.f); cv._center=sc(sk.base);
    return cache.set(key,cv);
  }
  return {id:'capivara',PS:1,FW,FH,GROUND,AX,VARS,ANIMS,NAMES,poseOf,frame,mats,RIM};
})();
