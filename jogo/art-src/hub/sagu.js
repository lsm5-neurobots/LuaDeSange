/* ===== PET SAGUI (de tufo branco): pequeno, rabo anelado longo, pula, pendura e vasculha ===== */
/* SAGU — fonte de arte (editável). Build: npm run art */
/* Chibi hi-bit: cabeção com máscara escura e losango branco na testa, dois leques de pelo branco enormes,
   olhos grandes âmbar, corpinho listrado, mãos escuras, pochete remendada e rabo anelado comprido. */
const SAGU=(function(){
  const {rad,lerp,P2}=PIX, C=PETCORE;
  const FW=88, FH=84, GROUND=76, AX=42, RIM='#a9c8f0', PS=1;
  const CFG={AX,GROUND,bodyY:50,shX:5.6,hipX:-6.4,fl:[4.2,4.2],hl:[4.8,4.8],neck:[7,-3.6],tailRoot:[-10,-1.6],paw:1.1,legY:2.6,
    hull:[[-9,4.4,0.3],[0,5.4,0]]};
  const VARS={branco:{nome:'Tufo branco'}, preto:{nome:'Tufo preto'}, dourado:{nome:'Dourado (raro)'}};
  const mcache={};
  function mats(v){ if(mcache[v]) return mcache[v]; const M={}, D=v==='dourado';
    C.mat(M,'fur',D?'#e0902e':'#9a8e7e',1.1); C.mat(M,'stripe',D?'#a85c16':'#5a5048',1.05); C.mat(M,'chest',D?'#f6d08a':'#cfc2aa',1);
    C.mat(M,'face',D?'#6a3a1c':'#3e302a',1); C.mat(M,'tuft',v==='preto'?'#3e3834':(D?'#fff0c8':'#f4f0e8'),0.8);
    C.mat(M,'blaze',v==='preto'?'#d8d2c6':'#ffffff',0.6); C.mat(M,'ringL',D?'#f0b060':'#b4ada4',1); C.mat(M,'ringD',D?'#8a4a14':'#3a3430',1);
    C.mat(M,'hand',D?'#5a3418':'#3a2e28',1); C.mat(M,'iris','#c07a3a',1.25); C.mat(M,'mouth','#c04a58',1.1);
    C.mat(M,'bag','#a09460',1.05); C.mat(M,'bagS','#6a4630',1); C.mat(M,'patch','#c8343e',1.1); C.mat(M,'brass','#d8a840',1.15); C.mat(M,'coin','#ffd23f',1.15);
    C.mat(M,'wood','#7a5232',1);
    M.ink=['#2a1620','#160a10','#0e060a','#060204'];
    return (mcache[v]=M); }
  const NAMES={fur:'Pelo',stripe:'Listras',chest:'Peito',face:'Cara',tuft:'Tufos',ringL:'Anel claro',ringD:'Anel escuro',bag:'Pochete',patch:'Remendo'};
  const S=Math.sin, Cc=Math.cos, TAU=Math.PI*2;
  const REST={bx:0,by:0,tilt:-8,head:4,tail:40,curl:14,fN:[4,-4],fF:[-2,-6],bN:[30,-24],bF:[24,-30],eye:'open',mouth:'closed',tufts:0,flash:0,free:0,lift:0,hang:0,coin:0,fx:null,fxt:0,find:0};
  const SIT={tilt:-52,head:44,bN:[86,-40],bF:[80,-46],fN:[30,10],fF:[20,0],tail:-14,curl:-18};
  const ANIMS={
    idle:{nome:'Parado',n:8,dur:i=>[170,150,150,170,150,110,110,150][i],pose:i=>{ const p=i/8*TAU, s=S(p);
      return {by:-0.4*s,head:4+3*S(p*2-0.4),tail:40+6*s,curl:14+6*S(p+1),tufts:i===3?0.5:0,eye:i===6?'closed':'open',mouth:i===2?'smile':'closed'}; }},
    walk:{nome:'Pular (andar)',n:8,dur:()=>85,pose:i=>{ const p=i/8*TAU, up=Math.max(0,S(p));
      const f=Math.cos(p);
      return {lift:5*up,tilt:-8-8*f,head:4+6*f,fN:[10+36*f,-6+30*f],fF:[4+36*f,-10+30*f],bN:[30-36*f,-24-30*Math.max(0,f)],bF:[24-36*f,-30-30*Math.max(0,f)],tail:44-10*f,curl:16+8*f}; }},
    run:{nome:'Disparada',n:6,dur:()=>65,pose:i=>{ const p=i/6*TAU, f=Math.cos(p), up=Math.max(0,S(p));
      return {lift:6*up,tilt:-2-10*f,head:-2+6*f,fN:[24+50*f,0+40*f],fF:[16+50*f,-4+40*f],bN:[20-50*f,-34-30*Math.max(0,f)],bF:[14-50*f,-40-30*Math.max(0,f)],tail:20,curl:8,eye:'wide',tufts:0.4}; }},
    sit:{nome:'Sentado',n:8,dur:()=>170,pose:i=>{ const p=i/8*TAU;
      return Object.assign({},SIT,{by:-0.3*S(p),head:SIT.head+4*S(p*2),curl:SIT.curl+6*S(p),eye:i===5?'closed':'open',fN:[30+6*S(p),10],mouth:i===2||i===3?'smile':'closed'}); }},
    sleep:{nome:'Dormir enrolado',n:8,dur:()=>240,pose:i=>{ const p=i/8*TAU;
      return {tilt:6,head:30,by:-0.4*S(p),fN:[80,96],fF:[74,94],bN:[86,-96],bF:[82,-100],tail:-30,curl:-40,eye:'sleep',fx:'zzz',fxt:i/8}; }},
    happy:{nome:'Feliz (cambalhota)',n:8,dur:i=>[90,80,70,70,70,70,80,110][i],pose:i=>{ const up=[0,6,12,15,15,12,6,0][i], rot=[0,-40,-130,-210,-290,-340,-360,0][i];
      return i===0||i===7?{eye:'happy',mouth:'smile',tufts:0.6,fx:'heart',fxt:i/8}:{free:0,lift:up,tilt:-8+rot,head:10,fN:[60,90],fF:[60,90],bN:[70,-60],bF:[70,-60],tail:20,curl:30,eye:'happy',mouth:'smile',tufts:0.8,fx:'heart',fxt:i/8}; }},
    chatter:{nome:'Tagarelar',n:6,dur:i=>[120,90,90,90,90,160][i],pose:i=>[
      {head:0,mouth:'open',eye:'wide',tufts:0.5},{head:-6,mouth:'open',tufts:0.8,fx:'chat',fxt:0},{head:2,mouth:'closed',tufts:0.6,fx:'chat',fxt:0.3},{head:-6,mouth:'open',tufts:0.9,fx:'chat',fxt:0.6},{head:2,mouth:'closed',tufts:0.6,fx:'chat',fxt:0.9},{mouth:'smile'}][i]},
    attack:{nome:'Arranhão',n:6,dur:i=>[140,230,70,110,140,140][i],pose:i=>[
      {eye:'angry'}, {tilt:-26,bx:-3,fN:[160,140],tufts:1,mouth:'open',eye:'angry'}, {tilt:-2,bx:5,fN:[100,80],eye:'angry'}, {tilt:2,bx:6,fN:[60,40],eye:'angry',fx:'hit',fxt:0}, {tilt:-4,bx:4}, {}][i]},
    special:{nome:'Vasculhar',n:6,dur:i=>[200,170,170,240,320,320][i],pose:i=>Object.assign({},SIT,[
      {}, {fN:[40,70],fF:[10,0],eye:'happy',fx:'dust',fxt:0}, {fN:[10,0],fF:[40,70],eye:'happy',fx:'dust',fxt:0.5}, {find:1,eye:'wide',tufts:1,fx:'bang',fxt:0}, {coin:1,fN:[170,190],eye:'happy',tufts:0.6,fx:'spark',fxt:0}, {coin:1,fN:[170,190],mouth:'smile',fx:'spark',fxt:0.5}][i])},
    hang:{nome:'Pendurado pelo rabo',n:4,dur:()=>240,pose:i=>({hang:1,free:1,tilt:94+[-6,0,6,0][i],head:-70+[0,2,0,-2][i],by:-6,bx:-2,tail:90,curl:24,fN:[150,160],fF:[140,150],bN:[200,190],bF:[190,180],eye:i===3?'closed':'open',mouth:'smile'})},
    hurt:{nome:'Dano',n:3,dur:i=>[80,120,170][i],pose:i=>[{flash:1,bx:-3,head:-14,eye:'closed',mouth:'open',tufts:1},{bx:-2,head:-8,eye:'closed',tufts:0.7},{eye:'half'}][i]},
  };
  function poseOf(a,i){ const A=ANIMS[a]||ANIMS.idle; return Object.assign({},REST,A.pose(i%A.n)); }
  /* ---------- desenho ---------- */
  const BODY=[['e',0,0,7.6,5.4],['e',-5.6,0,5.4,5.4],['e',4.6,-0.6,4.8,5.2]];
  function drawBody(p,M,sk){ p.xf(sk.a,sk.base.x,sk.base.y);
    C.shade(p,BODY,M.fur,M.furX,6,{c:P2(0,-1)});
    C.within(p,BODY,()=>{ [-9,-6,-3,0,3].forEach((x,k)=>{ p.F(k%2?M.stripeX[2]:M.stripe[1]); p.poly([[x,-6],[x+1.5,-6],[x+1,-1.6],[x-0.2,-2]]); });
      C.shade(p,[['e',2,5.6,9,2.8],['e',8,2,3.6,5]],M.chest,M.chestX,3,{spec:false}); });
    C.tufts(p,[P2(9.4,-1),P2(8.4,3.4),P2(5.6,5.6)],1.1,M.chest[1],2);
    p.id(); }
  function drawPouch(p,M,sk){ p.xf(sk.a,sk.base.x,sk.base.y);
    p.F(M.bagS[2]); p.poly([[5.6,-5.6],[7.2,-5.2],[-4,3.8],[-5.6,3.4]]); p.F(M.bagS[0]); p.poly([[6.2,-5.4],[6.8,-5.2],[-4.6,3.6],[-5,3.4]]);
    C.shade(p,[['p',[[-7.6,0.6],[-1,0.2],[-0.6,5.6],[-7.2,6]]]],M.bag,M.bagX,3.4,{c:P2(-4,3),spec:false});
    p.F(M.bagX[3]); p.poly([[-7.6,0.6],[-1,0.2],[-1,2],[-7.4,2.4]]); p.F(M.bag[0]); p.rect(-7,0.4,5.4,0.6);
    C.shade(p,[['e',-4.2,1.8,0.9,0.9]],M.brass,M.brassX,1);
    p.F(M.patch[1]); p.rect(-6.4,3.4,2.2,1.8); p.F(M.patch[0]); p.rect(-6.4,3.4,2.2,0.5); p.F(M.patchX[3]); p.rect(-6,4.4,0.5,0.5); p.rect(-5,4.4,0.5,0.5);
    p.id(); }
  function arm(p,M,lg,front){ C.vol(p,lg.root,lg.k,front?2.8:2.6,2.3,M.fur,M.furX); C.vol(p,lg.k,lg.f,2.3,2,M.fur,M.furX);
    C.shade(p,[['e',lg.f.x+0.6,lg.f.y+0.3,1.5,1.2]],M.hand,M.handX,1.4,{spec:false}); p.F(M.handX[0]); p.rect(lg.f.x+0.8,lg.f.y-0.4,0.6,0.6); }
  function hind(p,M,lg){ C.vol(p,lg.root,lg.k,4.2,2.6,M.fur,M.furX); C.vol(p,lg.k,lg.f,2.6,2.2,M.fur,M.furX);
    C.shade(p,[['e',lg.f.x+1,lg.f.y+0.3,2,1.1]],M.hand,M.handX,1.4,{spec:false}); }
  function drawTuftFar(p,M,sk,P){ const s=1+0.25*P.tufts, q=sk.H(3,-10); p.xf(sk.ha+0.3,q.x,q.y);
    C.shade(p,[['p',[[-2,1],[1*s,-4*s],[3.4*s,-7*s],[0.4*s,-8.4*s],[-3*s,-6.4*s],[-4,-1]]]],M.tuft,M.tuftX,4,{sd:1.6}); p.F(M.tuftX[2]); p.poly([[-2,0.6],[0.6*s,-3.6*s],[-1.6*s,-4.4*s]]); p.id(); }
  function drawHead(p,M,sk,P){ p.xf(sk.ha,sk.neck.x,sk.neck.y);
    const HD=[['e',1.6,-6.6,7.4,6.8],['e',3.6,-3.4,6,4.4]];
    C.shade(p,HD,M.fur,M.furX,7,{c:P2(2,-6)});
    C.within(p,HD,()=>{ // alto da cabeça mais escuro e máscara facial
      C.shade(p,[['e',-1,-13.2,7,3]],M.face,M.faceX,4,{spec:false});
      C.shade(p,[['e',8.4,-4.6,4.8,4.6]],M.face,M.faceX,4.2,{spec:false});
      C.shade(p,[['e',5,0.6,5.6,2.4]],M.chest,M.chestX,2.4,{spec:false}); });
    // losango branco na testa
    C.shade(p,[['p',[[5.2,-13.6],[7,-11.2],[5.2,-9],[3.4,-11.2]]]],M.blaze,M.blazeX,1.6,{spec:false});
    // olhos grandes
    C.eye(p,10.6,-6.6,1.5,1.9,P.eye,M.iris,M.ink[1],{lid:M.face[2]});
    C.eye(p,6.2,-6.4,2.1,2.5,P.eye,M.iris,M.ink[1],{lid:M.face[2]});
    // focinho e boca
    p.F(M.faceX[0]); p.rect(9.6,-4,1.6,0.8); p.F(M.ink[1]); p.rect(11.6,-3.6,0.8,0.6); p.rect(12.4,-3.4,0.6,0.6);
    if(P.mouth==='open'){ C.shade(p,[['e',10.4,-1.4,1.8,1.4]],M.mouth,M.mouthX,1.4,{lite:false}); p.F('#fffbf0'); p.rect(9.4,-2.6,0.6,0.7); p.rect(10.8,-2.6,0.6,0.7); }
    else if(P.mouth==='smile'){ p.F(M.ink[1]); p.poly([[8.6,-2.4],[10.4,-1.4],[12,-2.4],[12,-1.8],[10.4,-0.8],[8.6,-1.8]]); }
    else { p.F(M.ink[1]); p.rect(9.4,-2,2.4,0.6); }
    p.F(M.mouthX[0]); if(P.eye==='happy'||P.mouth==='smile') p.ell(8,-3,1.2,0.6);
    p.id(); }
  function drawTuftNear(p,M,sk,P){ const s=1+0.25*P.tufts, q=sk.H(-3.6,-7.4); p.xf(sk.ha-0.35,q.x,q.y);
    const T=[[3,2],[0.6*s,-4.6*s],[-1.6*s,-8.6*s],[-5*s,-9.6*s],[-7.6*s,-6.8*s],[-8.6*s,-2.6*s],[-7*s,1.6*s],[-2,3]];
    C.shade(p,[['p',T]],M.tuft,M.tuftX,5,{c:P2(-3*s,-3*s)});
    p.F(M.tuftX[2]); p.poly([[1,1],[-3.4*s,-3.6*s],[-5.6*s,-1.4*s],[-1,2]]); p.F(M.tuft[2]); [[-3.4,-7],[-6.4,-5],[-6.8,-1.4]].forEach(([x,y])=>p.cap(P2(-0.4,0.4),P2(x*s,y*s),0.6,0.4));
    p.id(); }
  function drawBranch(p,M,sk,tp){ const t=tp[tp.length-1]; p.id(); C.vol(p,P2(t.x-14,t.y-2.6),P2(t.x+14,t.y-3.4),3,3,M.wood,M.woodX); p.F(M.woodX[3]); p.rect(t.x-6,t.y-3.6,0.8,1.4); p.rect(t.x+6,t.y-4,0.8,1.4); }
  function drawFx(p,P,sk){ p.id(); const F=C.FXC, h=sk.H(3,-16);
    if(P.fx==='zzz'){ [0,0.34,0.67].forEach((o,k)=>{ const u=(P.fxt+o)%1; C.zzz(p,h.x+4+u*6+k,h.y-u*10,1.8+u*2,F.z); }); }
    if(P.fx==='heart'){ [0,0.5].forEach((o,k)=>{ const u=(P.fxt+o)%1; C.heart(p,h.x+(k?10:-4),h.y-u*10,1.3+u*0.8,F.heart[0],F.heart[1]); }); }
    if(P.fx==='chat'){ const m=sk.H(14,-3); C.shout(p,m.x+1+P.fxt*2,m.y,3.6+P.fxt*2,F.bark,2); C.note(p,m.x+4,m.y-7-P.fxt*4,1.8,F.note); }
    if(P.fx==='hit'){ const f=sk.legs.fN.f; C.sparkle(p,f.x+4,f.y-1,4,'#fff6c0'); p.F('#fffbf0'); for(let k=0;k<3;k++) p.cap(P2(f.x+1,f.y-4+k*2.4),P2(f.x+7,f.y-6+k*2.6),0.7,0.4); }
    if(P.fx==='dust'){ const f=sk.legs.fN.f; C.dust(p,f.x+3+P.fxt*2,GROUND-2,1.6,F.dust[0],F.dust[1]); C.dust(p,f.x-2,GROUND-1.6-P.fxt,1.2,F.dust[0],F.dust[1]); }
    if(P.fx==='bang'){ p.F('#ffe27a'); p.rect(h.x+4,h.y-6,1.6,5); p.rect(h.x+4,h.y,1.6,1.6); }
    if(P.fx==='spark'){ const f=sk.legs.fN.f; C.sparkle(p,f.x+2,f.y-5-P.fxt*2,2.4,'#fff6c0'); C.sparkle(p,f.x-4,f.y-2,1.4,'#fff6c0'); }
  }
  const cache=C.mkCache(600);
  function frame(v,anim,fi,step=5){
    if(!VARS[v]) v='branco'; if(!ANIMS[anim]) anim='idle';
    const K=PIX.getK(), key=v+'|'+anim+'|'+fi+'|'+step+'@'+K, hit=cache.get(key); if(hit) return hit;
    const P=poseOf(anim,fi), M=mats(v), sk=C.skeleton(P,CFG), Lg=sk.legs, pw=C.pen;
    const tp=C.tailPts(sk.tailRoot,P,11,2.7);
    const parts=[];
    if(P.hang) parts.push({draw:(c,u)=>drawBranch(pw(c,u),M,sk,tp)});
    parts.push(
      {back:true,draw:(c,u)=>{ const p=pw(c,u); arm(p,M,Lg.fF,false); hind(p,M,Lg.bF); }},
      {draw:(c,u)=>{ const p=pw(c,u); C.tail(p,M.ringL,M.ringLX,tp,3.4,1.8,{rings:M.ringD,ringsX:M.ringDX,tip:M.ringD,tipX:M.ringDX,tipN:2}); }},
      {draw:(c,u)=>drawTuftFar(pw(c,u),M,sk,P)},
      {draw:(c,u)=>drawBody(pw(c,u),M,sk)},
      {draw:(c,u)=>{ const p=pw(c,u); hind(p,M,Lg.bN); const r=Lg.bN.root; C.shade(p,[['e',r.x+0.4,r.y-1.4,3.6,4,-0.3]],M.fur,M.furX,4,{spec:false}); }},
      {draw:(c,u)=>drawPouch(pw(c,u),M,sk)},
      {draw:(c,u)=>drawTuftNear(pw(c,u),M,sk,P)},
      {draw:(c,u)=>drawHead(pw(c,u),M,sk,P)},
      {draw:(c,u)=>{ const p=pw(c,u); arm(p,M,Lg.fN,true); if(P.coin){ const f=Lg.fN.f; C.shade(p,[['e',f.x+1,f.y-2.2,2,2]],M.coin,M.coinX,2); p.F(M.coinX[3]); p.rect(f.x+0.6,f.y-3,0.7,1.6); }
        if(P.find&&!P.coin){ const f=Lg.fN.f; p.F(M.coinX[2]); p.rect(f.x,f.y-2,2.4,1); } }},
    );
    if(P.fx) parts.push({noShade:true,noRim:true,smear:true,draw:(c,u)=>drawFx(pw(c,u),P,sk)});
    const cv=C.build({FW,FH,GROUND,parts,M,step,flash:P.flash,rim:RIM});
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._fx=sc(sk.H(12,-3)); cv._center=sc(sk.base); cv._top=sc(sk.H(2,-15)); cv._head=sc(sk.H(2,-8)); cv._hand=sc(Lg.fN.f);
    return cache.set(key,cv);
  }
  const META={id:'sagui', nome:'Sagui', sub:'de tufo branco', papel:'Pet coletor', hab:'Vasculhar',
    lede:'Um sagui-de-tufos-brancos pequeno, curioso e de mãos rápidas, que nunca deixa um contêiner sem revirar. Leva a tiracolo uma pochete de lona remendada onde guarda o que acha na noite da Lua de Sangue.',
    habDesc:'Senta e remexe o chão com as mãos rápidas, acha um parafuso e depois ergue uma moeda dourada. No jogo, aumenta a chance de achado extra quando o squad vasculha. Pula pelo cenário e se pendura pelo rabo em postes e varais.',
    rows:[['Cabeça','Cabeção chibi cinza-acastanhado com o alto mais escuro, máscara facial marrom-escura, losango branco e olhos âmbar enormes.','Cabeça quase do tamanho do tronco, volume em 7 tons, 2 olhos com brilho (3/4) e boca que sorri, abre e tagarela.'],
      ['Tufos','Dois leques de pelo branco grandes saindo das laterais da cabeça.','O de cá com sombra cinza e fios; o de lá atrás, mais escuro. Abrem 25% no susto, no ataque e no tagarelar.'],
      ['Corpo e pochete','Tronco cinza listrado com peito claro. Pochete de lona com alça de couro, botão de latão e remendo vermelho.','Tronco com 5 listras no dorso, alça diagonal, aba escura, botão de latão e remendo cor de sangue.'],
      ['Cauda','Longa, 11 segmentos com anéis alternados claro/escuro e ponta escura, curvada em arco.','Enrola na respiração e ondula no pulo. Pendurado, vira gancho preso num galho.'],
      ['Especial','Vasculhar: senta, remexe com as mãos, acha um parafuso ("!") e ergue uma moeda dourada com brilho.','6 quadros: senta, remexe alternando as mãos com poeira, "!" no achado e moeda erguida com brilho.']]};
  return {PS,FW,FH,GROUND,AX,VARS,ANIMS,NAMES,mats,poseOf,frame,META,RIM};
})();
