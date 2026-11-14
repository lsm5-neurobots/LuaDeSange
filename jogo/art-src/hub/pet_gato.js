/* ===== PET: Gato (tabby de telhado) ===== */
/* PET_GATO — fonte de arte (editável). Build: npm run art */
/* Chibi hi-bit: cabeça larga com bochechas fofas, olhos enormes de pupila em fenda, orelha rasgada de briga,
   listras tabby, rabo longo em S, lenço vermelho. Pelo em 8 tons, sombra roxa, luz quente, rim da lua. */
const PET_GATO=(function(){
  const {rad,lerp,P2}=PIX, C=PETCORE;
  const FW=88, FH=72, GROUND=66, AX=44, RIM='#a9c8f0';
  const CFG={AX,GROUND,bodyY:46,shX:8,hipX:-8.5,fl:[5,5.2],hl:[5.4,5.6],neck:[10,-4],tailRoot:[-13.5,-3],paw:1.3,legY:3,
    hull:[[-11,5,0.4],[0,6.2,0],[8,6,0]]};
  const VARS={
    tabby:{nome:'Tabby cinza',fur:'#8a8696',stripe:'#4a4656',cream:'#ece4d6',eye:'#c8dc4a',nose:'#e88a96'},
    laranja:{nome:'Laranja',fur:'#e2903e',stripe:'#a85a22',cream:'#f8e2bc',eye:'#7ade6a',nose:'#e8808a'},
    preto:{nome:'Preto',fur:'#3a3444',stripe:'#26222e',cream:'#56506a',eye:'#ffd23f',nose:'#6a4a5a'},
  };
  const mcache={};
  function mats(v){ if(mcache[v]) return mcache[v]; const V=VARS[v]||VARS.tabby, M={};
    C.mat(M,'fur',V.fur,1.1); C.mat(M,'stripe',V.stripe,1.05); C.mat(M,'cream',V.cream); C.mat(M,'iris',V.eye,1.2);
    C.mat(M,'nose',V.nose,1.1); C.mat(M,'ear','#e898a4',1.05); C.mat(M,'mouth','#5a1e30',1.1); C.mat(M,'tongue','#ef7a8a',1.1);
    C.mat(M,'band','#2f7ad8',1.1); C.mat(M,'tag','#e2c46a',1.1);
    M.ink=['#2a1620','#140a12','#0e060c','#060206'];
    return (mcache[v]=M); }
  const NAMES={fur:'Pelo',stripe:'Listras',cream:'Creme',iris:'Olhos',band:'Lenço'};
  const S=Math.sin, Cc=Math.cos, TAU=Math.PI*2;
  const REST={bx:0,by:0,tilt:0,head:0,jaw:0,tail:70,curl:-14,ear:0,earF:0,fN:[2,-2],fF:[-4,-4],bN:[16,-16],bF:[10,-20],eye:'open',flash:0,brow:0,claw:0,alpha:1,shift:0,fx:null,fxt:0,lift:0};
  const gait=p=>{ const fl=ph=>{ const h=2+18*S(ph); return [h,h-26*Math.max(0,Cc(ph))-2]; };
    const hl=ph=>{ const h=14+16*S(ph); return [h,h-32-10*Math.max(0,-Cc(ph))]; };
    return {fN:fl(p),bN:hl(p+Math.PI*0.5),fF:fl(p+Math.PI),bF:hl(p+Math.PI*1.5)}; };
  const SIT={tilt:-34,head:30,fN:[-4,0],fF:[-8,-2],bN:[80,-70],bF:[74,-74],tail:-6,curl:-34};
  const LOAF={fN:[86,96],fF:[80,94],bN:[88,-96],bF:[84,-100],tail:-20,curl:-30};
  const ANIMS={
    idle:{nome:'Parado',n:8,dur:i=>[180,160,160,180,160,120,120,160][i],pose:i=>{ const p=i/8*TAU, s=S(p);
      return {by:-0.4*s,head:1.2*S(p-0.8),tail:68+8*s,curl:-12+10*S(p+0.9),earF:i===2?-14:0,ear:i===2?-6:0,eye:i===5?'half':(i===6?'closed':'open')}; }},
    walk:{nome:'Andar',n:8,dur:()=>100,pose:i=>{ const p=i/8*TAU;
      return Object.assign(gait(p),{by:-1*Math.abs(S(2*p)),tilt:1.2*S(2*p),head:-1.5*S(2*p),tail:72+6*S(2*p),curl:-10+12*S(2*p+1)}); }},
    run:{nome:'Correr',n:6,dur:()=>70,pose:i=>{ const p=i/6*TAU, s=S(p), c=Cc(p);
      const f=o=>{ const h=10+50*S(p+o); return [h,h-6-46*Math.max(0,Cc(p+o))]; }, b=o=>{ const h=4-46*S(p+o); return [h,h-34-30*Math.max(0,Cc(p+o))]; };
      return {fN:f(0),fF:f(0.5),bN:b(0.9),bF:b(1.4),lift:3*Math.max(0,c),tilt:8*s,head:-8-4*s,ear:-8,earF:-10,tail:24+6*S(2*p),curl:4,bx:1}; }},
    sit:{nome:'Sentado',n:8,dur:()=>170,pose:i=>{ const p=i/8*TAU;
      return Object.assign({},SIT,{by:-0.3*S(p),head:SIT.head+1.5*S(p),curl:SIT.curl+6*S(p),eye:i===4?'half':(i===5?'closed':'open'),earF:i===1?-12:0}); }},
    lie:{nome:'Pãozinho (deitado)',n:8,dur:()=>220,pose:i=>{ const p=i/8*TAU;
      return Object.assign({},LOAF,{by:-0.3*S(p),head:6+S(p),curl:-30+10*S(p),eye:i>=3&&i<=5?'half':'open'}); }},
    sleep:{nome:'Dormir enrolado',n:8,dur:()=>240,pose:i=>{ const p=i/8*TAU;
      return Object.assign({},LOAF,{by:-0.5*S(p)+0.3,head:26,eye:'sleep',ear:4,earF:6,tail:-40,curl:-46,fx:'zzz',fxt:i/8}); }},
    happy:{nome:'Feliz (ronronar)',n:8,dur:()=>110,pose:i=>{ const p=i/8*TAU, up=Math.max(0,S(p));
      return {lift:6*up,tilt:-6*up,head:-6+4*S(2*p),fN:[10+30*up,-6+24*up],bN:[16,-16-10*up],tail:92+4*S(4*p),curl:-24+6*S(4*p),eye:'happy',jaw:4,ear:-2,fx:'heart',fxt:i/8}; }},
    meow:{nome:'Miar',n:6,dur:i=>[160,120,200,180,140,160][i],pose:i=>[
      {head:4,eye:'open'},
      {head:-4,ear:-4,eye:'half',jaw:4},
      {head:-14,ear:-6,eye:'happy',jaw:18,tilt:-4,fx:'note',fxt:0},
      {head:-12,ear:-6,eye:'happy',jaw:14,tilt:-4,fx:'note',fxt:0.5},
      {head:-4,eye:'open',jaw:4,fx:'note',fxt:0.9},
      {}][i]},
    attack:{nome:'Patada',n:6,dur:i=>[140,220,70,130,130,150][i],pose:i=>[
      {brow:1,ear:-6,earF:-8,head:4,eye:'angry'},
      {brow:1,ear:-10,earF:-14,bx:-4,tilt:8,head:10,jaw:16,tail:92,curl:6,fN:[40,90],claw:1,bN:[26,-6],eye:'angry'},
      {brow:1,ear:-10,earF:-14,bx:7,tilt:-10,head:-4,jaw:12,fN:[110,100],claw:1,bN:[-10,-36],bF:[-18,-40],eye:'angry'},
      {brow:1,ear:-8,earF:-10,bx:8,tilt:-4,jaw:4,fN:[70,50],claw:1,eye:'angry'},
      {ear:-4,bx:4,fN:[20,0]},
      {}][i]},
    special:{nome:'Sumiço de telhado',n:6,dur:i=>[220,160,200,200,160,200][i],pose:i=>[
      {eye:'happy',tail:96,curl:30,ear:4},
      {eye:'happy',alpha:0.5,tail:96,curl:30},
      {alpha:0},
      {alpha:0.35,shift:36,eye:'happy'},
      {alpha:1,shift:36,eye:'happy',tail:98,curl:34},
      {alpha:1,shift:36}][i]},
    hurt:{nome:'Dano',n:4,dur:i=>[80,130,130,160][i],pose:i=>[
      {flash:1,eye:'closed',bx:-3},
      {bx:-5,head:-18,tilt:8,ear:-12,earF:-14,eye:'closed',jaw:14,tail:110,curl:6},
      {bx:-4,head:-8,tilt:4,ear:-8,eye:'half',tail:90},
      {bx:-2}][i]},
    ko:{nome:'Desmaio',n:6,dur:i=>[80,180,160,140,120,600][i],pose:i=>[
      {flash:1,eye:'closed'},
      {eye:'x',head:-14,tilt:-8,bx:-4,ear:-10},
      {eye:'x',head:10,tilt:6,by:2,fN:[30,30],bN:[-10,-30],ear:-10},
      Object.assign({},LOAF,{eye:'x',head:16,tail:-4,curl:0,ear:-12,jaw:8}),
      Object.assign({},LOAF,{eye:'x',head:18,tail:-4,curl:0,ear:-12,jaw:8,by:0.4}),
      Object.assign({},LOAF,{eye:'x',head:16,tail:-4,curl:0,ear:-12,jaw:8})][i]},
  };
  function poseOf(anim,i){ const A=ANIMS[anim]||ANIMS.idle; return Object.assign({},REST,A.pose(i%A.n)); }

  /* ---------- desenho ---------- */
  const BODY=[['e',0,0,10,6.2],['e',7.6,-1,6.2,6.8],['e',-8,0,6.6,6.2]];
  function drawBody(p,M,sk,V){ p.xf(sk.a,sk.base.x,sk.base.y);
    C.shade(p,BODY,M.fur,M.furX,7,{c:P2(1,-2)});
    C.within(p,BODY,()=>{
      // listras tabby (faixas curvas nas costas)
      [-12,-7.4,-2.8,1.8].forEach((x,k)=>{ p.F(k%2?M.stripeX[2]:M.stripe[1]); p.poly([[x,-7],[x+2.2,-7],[x+1.4+k*0.2,-1.4],[x-0.4,-2]]); p.F(M.stripe[0]); p.rect(x+0.6,-6.6,0.8,1); });
      C.shade(p,[['e',2,7,12,3.4],['e',11,3,5,6.4]],M.cream,M.creamX,4,{spec:false});
    });
    C.tufts(p,[P2(14.2,-1),P2(13,4),P2(9.4,7)],1.3,M.cream[1],2);
    C.tufts(p,[P2(-5,6.2),P2(5,6.4)],1,M.cream[2],3);
    p.id(); }
  function drawHaunch(p,M,sk){ const r=sk.legs.bN.root; p.id();
    C.shade(p,[['e',r.x+0.4,r.y-1.6,4.4,5,-0.3]],M.fur,M.furX,5,{spec:false});
    p.F(M.stripe[1]); p.poly([[r.x-2.4,r.y-3],[r.x-0.6,r.y-3.6],[r.x-1.4,r.y+0.6]]); }
  function drawHead(p,M,sk,P,V){ p.xf(sk.ha,sk.neck.x,sk.neck.y);
    const SK=[['e',1.6,-7.2,8.2,6.8],['e',3.4,-3.6,7.4,4.2]];
    C.shade(p,SK,M.fur,M.furX,7.4,{c:P2(2,-6.6)});
    C.within(p,SK,()=>{ // "M" da testa e listras da bochecha
      p.F(M.stripe[1]); [[0.4,-14],[2.8,-14.6],[5.2,-14]].forEach(([x,y])=>p.poly([[x,y],[x+1.1,y],[x+0.7,y+3.6],[x+0.1,y+3.2]]));
      p.poly([[-6.6,-6.4],[-2,-6],[-2,-5.2],[-6.6,-5.2]]); p.poly([[-6.4,-4],[-2.4,-3.8],[-2.6,-3],[-6.2,-2.8]]);
      C.shade(p,[['e',7.6,-1.8,5.6,3.2]],M.cream,M.creamX,3.6,{spec:false}); });
    C.tufts(p,[P2(-6.6,-4.6),P2(-4.4,-0.6),P2(-0.4,0.6)],1.6,M.fur[1],2);
    // olho de trás
    C.eye(p,9.4,-8.2,1.6,2.2,P.eye,M.iris,M.ink[1],{slit:1,pupil:0.55,lid:M.fur[2]});
    // focinho fofo
    C.shade(p,[['e',8.8,-3.4,2.6,1.9],['e',11,-3.6,2.2,1.8]],M.cream,M.creamX,2.2,{c:P2(10,-3.6)});
    C.shade(p,[['p',[[9.8,-6.2],[12.4,-6.2],[11.1,-4.7]]]],M.nose,M.noseX,1.6,{spec:false});
    p.F(M.ink[1]); p.rect(10.8,-4.7,0.6,1); p.poly([[9.2,-3.3],[11.1,-3.7],[11.1,-3.1],[9.4,-2.7]]); p.poly([[11.1,-3.7],[12.9,-3.5],[12.7,-2.9],[11.1,-3.1]]);
    if(P.jaw>3){ const j=P.jaw*0.18; C.shade(p,[['p',[[10.2,-3],[13.6,-3.2],[13,-3+j],[11,-3+j+0.4]]]],M.mouth,M.mouthX,1.6,{lite:false});
      p.F(M.tongue[1]); p.ell(11.8,-3+j-0.2,1.2,0.6); p.F('#fffbf0'); p.rect(10.6,-3.1,0.6,0.9); p.rect(12.8,-3.2,0.6,0.9); }
    // olho da frente enorme
    C.eye(p,4.6,-8,2.3,2.7,P.eye,M.iris,M.ink[1],{slit:1,pupil:P.eye==='wide'?0.75:0.6,lid:M.fur[2]});
    if(P.brow){ p.F(M.stripeX[3]); p.poly([[2,-12.4],[7,-10.8],[6.8,-10.2],[2,-11.4]]); }
    if(P.eye!=='angry'){ p.F(M.tongueX[0]); p.ell(6.6,-4,1.4,0.7); }
    // bigodes
    p.F('#fffbf0'); p.cap(P2(11.4,-3.6),P2(16.4,-4.8),0.5,0.4); p.cap(P2(11.4,-3),P2(16.2,-2.2),0.5,0.4); p.cap(P2(6.4,-3.4),P2(3,-4.4),0.4,0.3);
    // orelha da frente (rasgada na ponta)
    const e=rad(P.ear*3+P.earF*2), q=sk.H(-1.4,-12); p.xf(sk.ha+e-0.12,q.x,q.y);
    C.shade(p,[['p',[[-3.6,1.2],[3.4,1],[0.8,-8.2],[-0.2,-8.4]]]],M.fur,M.furX,4,{c:P2(0,-2.6),spec:false});
    p.F(M.earX[2]); p.poly([[-1.8,0.6],[2,0.4],[0.5,-5.6]]); p.F(M.ear[1]); p.poly([[-0.8,0.4],[1.4,0.2],[0.5,-3.6]]);
    p.F('#fffbf0'); p.poly([[-1.2,0.4],[-0.2,-3],[0,0.4]]);
    p.F(M.furX[3]); p.poly([[0.2,-8.6],[1.6,-6.6],[0.8,-6.4]]);
    p.id(); }
  function drawEarFar(p,M,sk,P){ const q=sk.H(4.6,-13); p.xf(sk.ha+rad(P.ear*2+P.earF*1.2)+0.2,q.x,q.y);
    C.shade(p,[['p',[[-3,1],[3,0.8],[0.8,-7.4]]]],M.fur,M.furX,3,{lite:false}); p.F(M.earX[2]); p.poly([[-1,0.4],[1.6,0.4],[0.6,-4]]); p.id(); }
  function drawBandana(p,M,sk){ p.xf(sk.a,sk.base.x,sk.base.y);
    C.shade(p,[['p',[[7.4,-7],[14.4,-5.4],[15,-3.4],[11.6,3],[8.6,-2.4]]]],M.band,M.bandX,3,{c:P2(11.4,-3),spec:false});
    p.F(M.bandX[3]); p.poly([[7.4,-7],[14.8,-5],[14.8,-4.2],[7.6,-5.8]]);
    p.F(M.bandX[0]); p.rect(11,-3.4,0.8,0.8); p.rect(12.6,-1.4,0.8,0.8);
    C.shade(p,[['e',12,4.4,1.5,1.6]],M.tag,M.tagX,1.6); p.id(); }
  function drawClaws(p,M,sk,P){ if(!P.claw) return; const f=sk.legs.fN.f; p.id(); p.F('#fffbf0'); for(let k=0;k<3;k++) p.poly([[f.x+1.6,f.y-1+k*1.2],[f.x+4.6,f.y-1.8+k*1.4],[f.x+2.2,f.y+k*1.2]]); }
  function drawFx(p,P,sk){ p.id(); const F=C.FXC, h=sk.H(3,-17);
    if(P.fx==='zzz'){ [0,0.34,0.67].forEach((o,k)=>{ const u=(P.fxt+o)%1; C.zzz(p,h.x+2+u*7+k,h.y-u*12,2+u*2,F.z); }); }
    if(P.fx==='heart'){ [0,0.5].forEach((o,k)=>{ const u=(P.fxt+o)%1; C.heart(p,h.x+(k?10:-2)+S(u*6),h.y-2-u*12,1.4+u,F.heart[0],F.heart[1]); }); }
    if(P.fx==='note'){ const m=sk.H(15,-6); [0,0.5].forEach((o,k)=>{ const u=(P.fxt+o)%1; C.note(p,m.x+2+u*6,m.y-4-u*8+k*2,2.2,F.note); }); }
  }
  // sumiço: dissolve em xadrez (pixel art), sem transparência parcial
  function vanish(cv,a){ if(a>=1) return; const g=cv.getContext('2d'), im=PIX.pix(cv), d=im.data, W=cv.width;
    for(let i=0;i<d.length;i+=4){ const x=(i/4)%W, y=Math.floor(i/4/W); const th=((x&1)*2+(y&1)*3+((x>>1)&1))%4/4; if(a<=th+0.01) d[i+3]=0; } g.putImageData(im,0,0); }
  const cache=C.mkCache(700);
  function frame(v,anim,fi,step=5){
    if(!VARS[v]) v='tabby'; if(!ANIMS[anim]) anim='idle';
    const K=PIX.getK(), key=v+'|'+anim+'|'+fi+'|'+step+'@'+K, hit=cache.get(key); if(hit) return hit;
    const P=poseOf(anim,fi), V=VARS[v], M=mats(v); if(P.shift) P.bx+=P.shift*0.15;
    const sk=C.skeleton(P,CFG), Lg=sk.legs, tp=C.tailPts(sk.tailRoot,P,7,3.1), pw=C.pen;
    const parts=[
      {back:true,draw:(c,u)=>{ const p=pw(c,u); C.leg(p,M.fur,M.furX,M.cream,M.creamX,Lg.fF,3.6,3,2); C.leg(p,M.fur,M.furX,M.cream,M.creamX,Lg.bF,4.6,3,2); }},
      {back:true,draw:(c,u)=>drawEarFar(pw(c,u),M,sk,P)},
      {draw:(c,u)=>{ const p=pw(c,u); C.tail(p,M.fur,M.furX,tp,3.8,2.6,{rings:M.stripe,ringsX:M.stripeX,tip:M.stripe,tipX:M.stripeX}); }},
      {draw:(c,u)=>drawBody(pw(c,u),M,sk,V)},
      {draw:(c,u)=>{ const p=pw(c,u); C.leg(p,M.fur,M.furX,M.cream,M.creamX,Lg.bN,4.6,3.1,2.2); drawHaunch(p,M,sk); }},
      {draw:(c,u)=>{ const p=pw(c,u); C.leg(p,M.cream,M.creamX,M.cream,M.creamX,Lg.fN,3.8,3.1,2.2); }},
      {draw:(c,u)=>drawBandana(pw(c,u),M,sk)},
      {draw:(c,u)=>drawHead(pw(c,u),M,sk,P,V)},
      {noShade:true,draw:(c,u)=>drawClaws(pw(c,u),M,sk,P)},
    ];
    if(P.fx) parts.push({noShade:true,noRim:true,smear:true,draw:(c,u)=>drawFx(pw(c,u),P,sk)});
    const cv=C.build({FW,FH,GROUND,parts,M,step,flash:P.flash,rim:RIM}); vanish(cv,P.alpha);
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._mouth=sc(sk.H(13,-4)); cv._head=sc(sk.H(2,-16)); cv._paw=sc(Lg.fN.f); cv._center=sc(sk.base);
    return cache.set(key,cv);
  }
  return {id:'gato',PS:1,FW,FH,GROUND,AX,VARS,ANIMS,NAMES,poseOf,frame,mats,RIM};
})();
