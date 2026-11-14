/* ===== PET SAGUI (de tufo branco): pequeno, rabo anelado longo, pula, pendura e vasculha ===== */
const SAGU=(function(){
  const {rad,mkPen,compose,lerp}=PIX;
  const FW=104, FH=84, GROUND=78, AX=50, RIM='#a9c8f0', PS=0.6;
  const VARS={branco:{nome:'Tufo branco'}, preto:{nome:'Tufo preto'}, dourado:{nome:'Dourado (raro)'}};
  function mats(v){
    const m={
      fur:['#b0a494','#8a7e70','#5e5448','#3a332c'], stripe:['#6e6458','#5a5048','#3e362f','#241f1a'], chest:['#d4c8b0','#b4a894','#867a66','#524838'],
      face:['#5a463c','#3b2d27','#2a1f1b','#160f0c'], tuft:['#ffffff','#f1ede4','#c9c3b8','#8a847a'], tailL:['#bab4ac','#9a948c','#6e6862','#44403a'],
      tailD:['#4a4440','#2e2a28','#1e1b19','#100e0d'], eye:['#c08048','#6a3a1c','#401f0c','#200e04'], hand:['#5a4a40','#3a2e28','#281f1a','#14100c'],
      bagS:['#8a6040','#5c3d26','#3e2818','#22160c'], bag:['#a89a64','#7a6e44','#544a2c','#2e2816'], patch:['#e05a60','#b0303a','#741c24','#40080e'],
      brass:['#ffe08a','#d0a040','#8a6a1a','#4a3808'], mouth:['#e06a70','#b03a44','#74202a','#401014'], coin:['#fff3a0','#ffd23f','#c0901a','#6a4a0a'], white:['#ffffff','#f4f0e6','#c8c2b4','#86807a'],
    };
    if(v==='preto'){ m.tuft=['#6a625c','#3a3430','#262220','#141210']; m.white=['#e0dcd2','#b8b2a8','#86807a','#524e4a']; }
    if(v==='dourado'){ m.fur=['#ffc880','#e0902e','#a85c16','#5e300a']; m.stripe=['#c87a2a','#a85c16','#743c0c','#401e06']; m.chest=['#ffe4b0','#f0c070','#b0843a','#62461c']; m.tuft=['#fff4d0','#ffd890','#d0a050','#806030']; m.tailL=['#ffd090','#e8a050','#a86a28','#603a12']; }
    return m;
  }
  const NAMES={fur:'Pelo',stripe:'Listras',chest:'Peito',face:'Cara',tuft:'Tufos',tailL:'Anel claro',tailD:'Anel escuro',bag:'Pochete',patch:'Remendo'};
  const REST={hx:0,hop:0,tilt:0,ht:0,curl:0,lfn:0,lff:0,lrn:0,lrf:0,dx:0,arm:0,armF:0,sit:0,mouth:'closed',eye:'open',tufts:0,hang:0,sway:0,flash:0,coin:0,find:0};
  const ANIMS={
    idle:{nome:'Parado',n:4,dur:()=>210,pose:i=>({hop:[0,0.6,1,0.6][i], curl:[0,0.4,0.8,0.4][i], ht:[0,-2,-3,-1][i], eye:i===2?'closed':'open'})},
    walk:{nome:'Pular (andar)',n:8,dur:()=>95,pose:i=>{ const p=i/8*Math.PI*2, a=Math.max(0,Math.sin(p))*5, b=Math.max(0,Math.sin(p+Math.PI))*5;
      return {hop:3*Math.abs(Math.sin(2*p)), lfn:a, lrf:a, lff:b, lrn:b, dx:Math.cos(p)*2.4, tilt:3*Math.sin(2*p), curl:Math.sin(p)*0.8, ht:-2*Math.sin(2*p)}; }},
    attack:{nome:'Arranhão',n:6,dur:i=>[140,230,70,110,140,140][i],pose:i=>[
      {eye:'angry'}, {tilt:-18,hx:-3,arm:1,tufts:1,mouth:'open',eye:'angry',waves:1}, {tilt:6,hx:5,arm:0.6,eye:'angry',lines:1}, {tilt:10,hx:6,arm:-0.5,impact:1,eye:'angry'}, {tilt:4,hx:4}, {}][i]},
    special:{nome:'Vasculhar',n:6,dur:i=>[200,170,170,240,320,320][i],pose:i=>Object.assign({sit:1,tilt:-30},[
      {}, {armF:1,eye:'happy',dust:1}, {armF:-1,eye:'happy',dust:1}, {find:1,eye:'wide',bang:1,tufts:1}, {coin:1,eye:'happy',sparkle:1,tufts:0.6}, {coin:1,mouth:'smile',sparkle:1}][i])},
    hang:{nome:'Pendurado pelo rabo',n:4,dur:()=>240,pose:i=>({hang:1, sway:[-6,0,6,0][i], ht:[0,2,0,-2][i], eye:i===3?'closed':'open'})},
    hurt:{nome:'Dano',n:3,dur:i=>[80,120,170][i],pose:i=>[{flash:1,hx:-3,ht:-14,eye:'closed',mouth:'open',tufts:1},{hx:-2,ht:-8,eye:'closed'},{}][i]},
  };
  function poseOf(a,i){ return Object.assign({},REST,ANIMS[a].pose(i)); }
  function mul(A,B){ return [A[0]*B[0]+A[2]*B[1], A[1]*B[0]+A[3]*B[1], A[0]*B[2]+A[2]*B[3], A[1]*B[2]+A[3]*B[3], A[0]*B[4]+A[2]*B[5]+A[4], A[1]*B[4]+A[3]*B[5]+A[5]]; }
  function pen(ctx,used,Rm){ const p=mkPen(ctx,used); if(!Rm) return p; p.xf=(a,ox,oy)=>{ const c=Math.cos(a), s=Math.sin(a); ctx.setTransform(...mul(Rm,[c,s,-s,c,ox,oy])); }; p.id=()=>ctx.setTransform(...Rm); return p; }
  function apply(Rm,q){ return {x:Rm[0]*q.x+Rm[2]*q.y+Rm[4], y:Rm[1]*q.x+Rm[3]*q.y+Rm[5]}; }
  function drawEye(p,M,t,x,y,r){
    if(t==='closed'){ p.F(M.face[3]); p.rect(x-r-0.4,y,r*2+0.8,0.9); return; }
    if(t==='happy'){ p.F(M.face[3]); p.rect(x-r,y,0.9,0.9); p.rect(x-0.4,y-0.9,0.9,0.9); p.rect(x+r-0.8,y,0.9,0.9); return; }
    const rr=t==='wide'?r*1.3:r; p.F(M.eye[1]); p.ell(x,y,rr,rr); p.F(M.face[3]); p.rect(x,y-rr*0.5,rr*0.7,rr); p.F(M.white[0]); p.rect(x-rr*0.6,y-rr*0.8,0.8,0.8);
    if(t==='angry'){ p.F(M.face[3]); p.poly([[x-2.6,y-3.4],[x+2.4,y-2],[x+2.4,y-1.2],[x-2.6,y-2.4]]); }
  }
  const cache=new Map();
  function frame(v,anim,fi,step=5){
    const K0=PIX.getK(), K=K0*PS, key=v+anim+fi+step+'@'+K0; if(cache.has(key)) return cache.get(key); PIX.setK(K);
    const P=poseOf(anim,fi), M=mats(v);
    let Rm=null; if(P.hang){ const a=rad(180+P.sway), c=Math.cos(a), s=Math.sin(a), px=52, py=57; Rm=mul([1,0,0,1,px,py],mul([c,s,-s,c,0,0],[1,0,0,1,-px,-py])); }
    const RmK=mul([K,0,0,K,0,0],Rm||[1,0,0,1,0,0]);
    const B={x:AX+P.hx,y:GROUND-17-P.hop+(P.sit?4:0)}, ta=rad(P.tilt);
    const T=(lx,ly)=>({x:B.x+lx*Math.cos(ta)-ly*Math.sin(ta), y:B.y+lx*Math.sin(ta)+ly*Math.cos(ta)});
    const Hc=T(17,-9), ha=ta+rad(P.ht);
    // cauda
    const tail=[]; { let pt=T(-14,-2), a=P.hang?rad(160):rad(-165); const dA=P.hang?-rad(10+P.curl*3):rad(9+P.curl*4);
      for(let k=0;k<11;k++){ const L=4.8, nx={x:pt.x+Math.cos(a)*L,y:pt.y+Math.sin(a)*L}; tail.push([pt,nx,6-k*0.3]); pt=nx; a+=dA; } }
    const legGround=(x,lift)=>({x,y:GROUND-2-lift});
    const parts=[
      {back:true,draw:(c,u)=>{ const p=pen(c,u,RmK); p.id(); // pernas/braço de lá
        const kb=T(-6,5), fb=legGround(B.x-8+P.dx,P.sit?0:P.lrf); p.F(M.fur[1]); p.ell(kb.x,kb.y,6,5.6); p.cap(kb,fb,3,2.4); p.F(M.hand[1]); p.ell(fb.x+2,fb.y,4.4,1.6);
        const sh=T(11,3), hb=P.sit?{x:B.x+14,y:GROUND-2-(P.armF<0?3:0)}:legGround(B.x+16-P.dx,P.lff), eb={x:(sh.x+hb.x)/2-3,y:(sh.y+hb.y)/2}; p.F(M.fur[1]); p.cap(sh,eb,2.6,2.2); p.cap(eb,hb,2.2,2); p.F(M.hand[1]); p.ell(hb.x+1,hb.y,2.4,1.6); }},
      {draw:(c,u)=>{ const p=pen(c,u,RmK); p.id(); tail.forEach(([a,b,w],k)=>{ p.F(k===10?M.tailD[2]:(k%2?M.tailD[1]:M.tailL[1])); p.cap(a,b,w,w-0.3); }); }},
      {back:true,draw:(c,u)=>{ const p=pen(c,u,RmK); p.xf(ha,Hc.x,Hc.y); const s=1+P.tufts*0.25; p.F(M.tuft[2]); p.poly([[-1,-6],[-7*s,-15*s],[-2*s,-17*s],[2,-9]]); }},
      {draw:(c,u)=>{ const p=pen(c,u,RmK); p.xf(ta,B.x,B.y);
        p.F(M.fur[1]); p.ell(0,0,15,9); p.F(M.chest[1]); p.ell(5,3.6,9,5);
        p.F(M.stripe[1]); for(let k=0;k<6;k++) p.rect(-11+k*3.6,-8.4+Math.abs(k-2.5)*0.4,1.6,6);
        p.F(M.bagS[1]); p.poly([[8,-7],[10,-6],[0,7],[-2,6]]);
        p.F(M.bag[1]); p.rect(1,1,9,7); p.F(M.bag[2]); p.rect(1,1,9,2.4); p.F(M.brass[1]); p.rect(5,2.4,1.4,1.4); p.F(M.patch[1]); p.rect(2,5,2.4,2);
        p.id(); }},
      {draw:(c,u)=>{ const p=pen(c,u,RmK); p.id(); // perna de cá
        const kn=T(-9,4), f=legGround(B.x-11-P.dx,P.sit?0:P.lrn); p.F(M.fur[1]); p.ell(kn.x,kn.y,7.4,6.8); p.cap(kn,f,3.4,2.6); p.F(M.hand[1]); p.ell(f.x+2.6,f.y,5,1.8); }},
      {draw:(c,u)=>{ const p=pen(c,u,RmK); p.xf(ha,Hc.x,Hc.y); const s=1+P.tufts*0.25;
        p.F(M.tuft[1]); p.poly([[-3,-2],[-13*s,-10*s],[-14*s,-17*s],[-8*s,-20*s],[-2,-11]]); p.F(M.tuft[2]); p.poly([[-4,-5],[-10*s,-11*s],[-9*s,-16*s],[-4,-9]]);
        p.F(M.fur[1]); p.ell(0,0,11,10.2); p.F(M.stripe[1]); p.ell(-1,-6,8,4);
        p.F(M.face[1]); p.ell(3.4,1.8,7.6,7.8);
        p.F(M.white[1]); p.poly([[3.2,-7],[5.6,-4.4],[3.2,-2],[0.8,-4.4]]);
        drawEye(p,M,P.eye,6,-0.6,2); drawEye(p,M,P.eye,1.2,-0.8,1.2);
        p.F(M.face[2]); p.ell(9.4,2.6,4,3.4); p.F(M.face[3]); p.rect(11.4,1.4,1.2,1);
        if(P.mouth==='open'){ p.F(M.mouth[1]); p.ell(8.6,5.6,2.4,2); p.F(M.white[0]); p.rect(7.6,4.2,0.9,1); p.rect(9.4,4.2,0.9,1); }
        else if(P.mouth==='smile'){ p.F(M.face[3]); p.rect(6.6,5.4,3.6,0.9); p.rect(10,4.6,0.9,0.9); }
        else { p.F(M.face[3]); p.rect(7,5.4,3,0.9); }
        p.id(); }},
      {draw:(c,u)=>{ const p=pen(c,u,RmK); p.id(); // braço de cá
        const sh=T(9,2); let h;
        if(P.coin||P.find) h=T(14,-22); else if(P.arm>0) h={x:Hc.x+6,y:Hc.y-10*P.arm-2}; else if(P.arm<0) h={x:B.x+24,y:GROUND-4};
        else if(P.sit) h={x:B.x+18,y:GROUND-2-(P.armF>0?4:0)}; else h=legGround(B.x+13+P.dx,P.lfn);
        const e={x:(sh.x+h.x)/2-3,y:(sh.y+h.y)/2+1}; p.F(M.chest[1]); p.cap(sh,e,2.8,2.4); p.cap(e,h,2.4,2.2); p.F(M.hand[1]); p.ell(h.x+1,h.y,2.6,2);
        if(P.coin){ p.F(M.coin[1]); p.ell(h.x+1,h.y-4,3.4,3.4); p.F(M.coin[0]); p.rect(h.x-0.4,h.y-6,1.4,1.4); p.F(M.coin[2]); p.rect(h.x+1,h.y-5,1,3); }
        if(P.find){ p.F(M.brass[2]); p.rect(h.x-1,h.y-5,4,2); p.F(M.brass[1]); p.rect(h.x,h.y-6,2,4); } }},
    ];
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:P.hang?FH*K+20:GROUND*K,parts,M,step,flash:P.flash,rim:RIM}); PIX.setK(K0);
    const R1=Rm||[1,0,0,1,0,0], sc=q=>{ const r=apply(R1,q); return {x:r.x*K,y:r.y*K}; };
    cv._fx=sc({x:Hc.x+14,y:Hc.y}); cv._hand=sc(T(14,-24)); cv._center=sc(B); cv._top=sc({x:Hc.x,y:Hc.y-14}); cv._tailTip=sc(tail[10][1]);
    cache.set(key,cv); return cv;
  }
  const META={id:'sagui', nome:'Sagui', sub:'de tufo branco', papel:'Pet coletor', hab:'Vasculhar',
    lede:'Um sagui-de-tufos-brancos pequeno, curioso e de mãos rápidas, que nunca deixa um contêiner sem revirar. Leva a tiracolo uma pochete de lona remendada onde guarda o que acha na noite da Lua de Sangue.',
    habDesc:'Senta e remexe o chão com as mãos rápidas, acha um parafuso e depois ergue uma moeda dourada. No jogo, aumenta a chance de achado extra quando o squad vasculha. Pula pelo cenário e se pendura pelo rabo em postes e varais.',
    rows:[['Cabeça','Elipse grande cinza-acastanhada com o alto mais escuro, máscara facial marrom-escura e mancha branca em losango.','Cabeça de 22×20, quase do tamanho do tronco, com máscara escura e losango branco na testa. Gira até 16°.'],
      ['Tufos','Dois leques de pelo branco grandes saindo das laterais da cabeça.','Leque de cá de ~16×18 com sombra cinza no meio e o de lá atrás, mais acinzentado. Abrem 25% no susto e no ataque.'],
      ['Corpo e pochete','Tronco cinza listrado com peito claro. Pochete de lona com alça de couro, botão de latão e remendo vermelho.','Tronco de 30×18 com 6 listras no dorso. Alça diagonal, pochete cáqui com aba escura, botão de latão e remendo cor de sangue.'],
      ['Cauda','Longa (~50 px), 11 segmentos com anéis alternados claro/escuro e ponta escura, curvada em arco.','11 segmentos de 6→3 px em arco que enrola na respiração e ondula no pulo. Pendurado, vira gancho preso no poste.'],
      ['Especial','Vasculhar: senta, remexe com as mãos, acha um parafuso ("!") e ergue uma moeda dourada com brilho.','6 quadros: senta, remexe alternando as mãos com poeira, "!" no achado e moeda erguida com brilho.']]};
  return {PS,FW,FH,GROUND,AX,VARS,ANIMS,NAMES,mats,poseOf,frame,META,RIM};
})();
