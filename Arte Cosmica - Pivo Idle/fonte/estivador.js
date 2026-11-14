/* ===== O ESTIVADOR (chefe B02): estivador do porto, caixote + gancho, hi-bit ===== */
const ESTI=(function(){
  const {rad,lp,lerp,P2,ik,mkPen,compose}=PIX;
  const FW=196, FH=200, GROUND=192, AX=84;
  const RIM={normal:'#a9d8f0', furia:'#ffb070'};
  function mats(form){
    const m={
      skin:['#a8d0c0','#72a090','#4c7068','#2e4846'],
      beanie:['#ffb070','#e07a32','#a04e1e','#5e2a10'],
      beard:['#6a5a4a','#3e342a','#28201a','#16120e'],
      alga:['#8ab05a','#5a8034','#3a5a20','#203410'],
      tape:['#d8d8d0','#a8a8a0','#74746e','#46463f'],
      eye:['#ffffff','#e2e8dc','#a8b0a0','#6e766a'],
      mouth:['#6a3434','#3a1a1e','#24100e','#140806'],
      teeth:['#e8dca0','#c4b070','#8a7848','#54482a'],
      denim:['#6a8ac0','#40609a','#2a426e','#182844'],
      stripeW:['#ffffff','#e2e2ea','#a8a8b8','#6a6a7a'],
      stripeB:['#5a7ad0','#2e4ea0','#1e3470','#101e44'],
      rope:['#e8d090','#b8984a','#7e6428','#4a3a14'],
      boot:['#fff07a','#f2c230','#a8801a','#5e460a'],
      mud:['#8a7050','#5a4430','#3a2c1e','#201810'],
      wood:['#e0b070','#b07a40','#7a4e24','#462a10'],
      stamp:['#e87a6a','#b84a3a','#7a2a22','#4a1610'],
      iron:['#b0a8a0','#7a6e66','#4e4440','#2a2422'],
      rust:['#d08a4a','#9a5a2a','#683818','#3a1e0a'],
    };
    if(form==='furia'){ m.iron=['#fff0a0','#ffb030','#e05a1a','#8a240a']; m.rust=['#ffd070','#ff7a2a','#c83a12','#7a1806']; m.skin=['#b8c8b8','#7e9488','#566a62','#34443f']; m.eye=['#fffbe0','#ffd23f','#ff8a2a','#c2401a']; }
    return m;
  }
  const NAMES={skin:'Pele inchada',beanie:'Gorro',beard:'Barba',alga:'Algas',denim:'Macacão',stripeB:'Listra azul',rope:'Corda',boot:'Bota',wood:'Caixote',iron:'Gancho / ferro',rust:'Ferrugem'};
  // hk: 0 = pendurado, 1 = girando (hkA), 2 = lançado (some do sprite); crate: 0 ombro, 1 erguido, 2 lançado
  const REST={hx:0,lean:6,head:-4,jaw:2,aFs:20,aFe:40,lFh:10,lFk:2,lBh:-10,lBk:-14,hk:0,hkA:0,crate:0,flash:0,roar:0};
  const ANIMS={
    idle:{nome:'Parado',n:6,dur:()=>190,pose:i=>{ const p=i/6*Math.PI*2, s=Math.sin(p); return {lean:6+1.4*s, head:-4+2*Math.sin(p-0.7), aFs:20+3*s, aFe:40+5*Math.sin(p-0.5), hkA:s*0.3}; }},
    walk:{nome:'Andar (arrasta as botas)',n:8,dur:()=>155,pose:i=>{ const p=i/8*Math.PI*2; const lFh=10+16*Math.sin(p), lBh=-10+16*Math.sin(p+Math.PI);
      return {lFh, lFk:lFh-12*Math.max(0,Math.cos(p))-2, lBh, lBk:lBh-4-12*Math.max(0,Math.cos(p+Math.PI)), lean:8+2*Math.abs(Math.sin(p)), head:-4+2*Math.sin(2*p-0.6), aFs:20-10*Math.sin(p), aFe:40-8*Math.sin(p), hkA:-Math.sin(p)*0.5}; }},
    hook:{nome:'Gancho (gira e puxa)',n:10,throwAt:5,pullFrom:6,dur:i=>[110,90,90,90,180,60,200,200,200,160][i],pose:i=>[
      {aFs:150,aFe:175,hk:1,hkA:0,lean:2,head:-8},
      {aFs:155,aFe:180,hk:1,hkA:1.6,lean:0,head:-10},
      {aFs:150,aFe:175,hk:1,hkA:3.2,lean:0,head:-10},
      {aFs:155,aFe:180,hk:1,hkA:4.8,lean:0,head:-10,jaw:6},
      {aFs:-30,aFe:20,hk:1,hkA:2.6,lean:-10,head:-12,hx:-4,lFh:16,lBh:-18,lBk:-22,jaw:8},
      {aFs:100,aFe:96,hk:2,lean:18,head:0,hx:6,lFh:24,lFk:8,lBh:-20,lBk:-28,jaw:14},
      {aFs:80,aFe:60,hk:2,lean:-6,head:-6,hx:-2,lFh:14,lBh:-16,lBk:-24,jaw:10},
      {aFs:60,aFe:30,hk:2,lean:-10,head:-8,hx:-4,lFh:12,lBh:-18,lBk:-24,jaw:12},
      {aFs:40,aFe:10,hk:2,lean:-8,head:-6,hx:-3,jaw:8},
      {aFs:24,aFe:36,hk:0,lean:4,head:-4}][i]},
    crate:{nome:'Arremessa caixote',n:8,throwAt:3,dur:i=>[180,180,140,60,150,160,160,150][i],pose:i=>[
      {crate:1,lean:-4,head:-10,lFh:14,lBh:-14,jaw:4},
      {crate:1,lean:-12,head:-16,hx:-4,lFh:16,lBh:-18,lBk:-22,jaw:8},
      {crate:1,lean:-16,head:-18,hx:-6,lFh:16,lBh:-20,lBk:-24,jaw:10},
      {crate:2,lean:20,head:4,hx:6,lFh:26,lFk:10,lBh:-22,lBk:-30,jaw:16,aFs:70,aFe:80},
      {crate:2,lean:16,head:0,hx:5,lFh:24,lFk:8,lBh:-20,lBk:-28,jaw:10,aFs:50,aFe:60},
      {crate:2,lean:8,head:-4,hx:2},
      {crate:0,lean:6,head:-4},
      {crate:0}][i]},
    rage:{nome:'Entra em fúria',n:6,dur:i=>[200,120,260,260,260,200][i],pose:i=>[
      {lean:12,head:10,jaw:2},
      {lean:-8,head:-24,jaw:18,roar:1,hx:-2,aFs:120,aFe:150},
      {lean:-12,head:-30,jaw:24,roar:1,hx:-3,aFs:140,aFe:170,lFh:16,lBh:-18},
      {lean:-12,head:-30,jaw:24,roar:1,hx:-3,aFs:145,aFe:175,lFh:16,lBh:-18},
      {lean:-10,head:-26,jaw:20,roar:1,hx:-2,aFs:130,aFe:160},
      {lean:4,head:-6,jaw:6}][i]},
    hurt:{nome:'Dano',n:4,dur:i=>[80,110,130,160][i],pose:i=>[
      {lean:-10,head:-22,jaw:14,hx:-6,flash:1,aFs:-10,aFe:10},
      {lean:-6,head:-16,jaw:10,hx:-5,aFs:0,aFe:20},
      {lean:2,head:-8,jaw:6,hx:-2},
      {}][i]},
  };
  function poseOf(anim,i){ return Object.assign({},REST,ANIMS[anim].pose(i)); }
  function skeleton(P){
    const hip={x:AX+P.hx,y:96};
    const hipF={x:hip.x+5,y:hip.y}, hipB={x:hip.x-5,y:hip.y};
    const kneeF=lp(hipF,P.lFh,30), ankleF=lp(kneeF,P.lFk,30), kneeB=lp(hipB,P.lBh,30), ankleB=lp(kneeB,P.lBk,30);
    const dy=GROUND-Math.max(ankleF.y+7, ankleB.y+7);
    [hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB].forEach(p=>p.y+=dy);
    const a=rad(P.lean), c=Math.cos(a), s=Math.sin(a);
    const T=(lx,ly)=>({x:hip.x+lx*c-ly*s, y:hip.y+lx*s+ly*c});
    const neck=T(5,-49), shF=T(15,-42), shB=T(-15,-45);
    const ha=rad(P.lean+P.head), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:neck.x+lx*hc-ly*hs, y:neck.y+lx*hs+ly*hc});
    const elF=lp(shF,P.aFs,20), wrF=lp(elF,P.aFe,19);
    // caixote: no ombro de trás, erguido acima da cabeça ou longe (lançado)
    let crate=null;
    if(P.crate===0) crate=T(-21,-60); else if(P.crate===1) crate=T(-4,-86);
    const handB=crate?{x:crate.x+(P.crate===1?2:6),y:crate.y+(P.crate===1?10:12)}:lp(shB,40,30);
    const B=ik(shB,handB,20,19,P.crate===1?false:true);
    let hook=null;
    if(P.hk===0) hook={x:wrF.x+6+Math.sin(P.hkA)*3,y:wrF.y+26};
    else if(P.hk===1) hook={x:wrF.x+Math.cos(P.hkA)*24,y:wrF.y-6+Math.sin(P.hkA)*10};
    return {hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,neck,shF,shB,elF,wrF,elB:B.E,wrB:B.W,a,ha,H,T,crate,hook,eye:H(9,-20),mouth:H(15,-8)};
  }
  function drawArm(p,M,sh,el,wr,front){
    p.id();
    p.F(M.stripeW[1]); p.circle(sh,9); p.cap(sh,lerp(sh,el,0.4),15,13);
    p.F(M.stripeB[1]); const s1=lerp(sh,el,0.15), s2=lerp(sh,el,0.32); p.cap(s1,lerp(s1,s2,0.4),12.6,12.4);
    p.F(M.skin[1]); p.cap(lerp(sh,el,0.38),el,12.6,11); p.cap(el,wr,11,9);
    p.F(M.skin[2]); p.circle(lerp(sh,el,0.7),1.6); p.circle(lerp(el,wr,0.5),1.4);
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y);
    p.F(M.skin[1]); p.ell(2,0,6,5.6); p.F(M.skin[2]); p.rect(3.6,-3.6,1.2,7.2);
    p.id();
  }
  function drawLeg(p,M,hip,knee,ankle,front){
    p.id();
    p.F(M.denim[1]); p.cap(hip,knee,16,14); p.cap(knee,ankle,14,12.6);
    if(front){ p.F(M.denim[0]); p.cap(lerp(hip,knee,0.1),lerp(knee,ankle,0.6),1,1); p.F(M.denim[2]); p.circle(knee,2.2); }
    const a=ankle;
    p.F(M.denim[0]); p.cap(lerp(knee,a,0.62),lerp(knee,a,0.7),15,15);
    p.F(M.boot[1]); p.cap(lerp(knee,a,0.7),a,14,13.6);
    p.poly([[a.x-7,a.y-4],[a.x+6,a.y-4],[a.x+15,a.y+1],[a.x+16,a.y+6.6],[a.x-7.4,a.y+6.6]]);
    p.F(M.mud[1]); p.poly([[a.x-7.4,a.y+2],[a.x+16,a.y+2.6],[a.x+16,a.y+6.6],[a.x-7.4,a.y+6.6]]); p.ell(a.x-2,a.y-4,3,2); p.ell(a.x+7,a.y-1,2.4,1.6);
    p.F(M.boot[0]); p.rect(a.x+5,a.y-1.4,4,1.2);
  }
  function drawTorso(p,M,sk){
    p.xf(sk.a,sk.hip.x,sk.hip.y);
    // camiseta listrada
    p.F(M.stripeW[1]); p.poly([[-21.6,0],[20.2,0],[21.6,-14],[25.7,-28],[24.3,-40],[13.5,-48],[-8.1,-49],[-24.3,-44],[-28.4,-30],[-25.7,-14]]);
    p.F(M.stripeB[1]); for(let y=-46;y<-2;y+=6) p.poly([[-21,y],[19,y-0.4],[19,y+2.6],[-21,y+3]]);
    // macacão (peito + calça)
    p.F(M.denim[1]); p.poly([[-18.9,2],[18.9,2],[18.9,-18],[16.2,-30],[-10.8,-31],[-16.2,-20]]);
    p.F(M.denim[2]); p.rect(-6,-28,14,1.2); p.rect(0,-24,6,6);
    p.F(M.iron[1]); p.ell(10,-29,1.8,1.8); p.ell(-6,-29.6,1.8,1.8);
    // alça inteira (trás) e alça arrebentada (frente, pendurada)
    p.F(M.denim[1]); p.poly([[-10.8,-31],[-5.4,-31],[-10.8,-46],[-17.6,-45]]); p.poly([[14.9,-30],[18.9,-29],[21.6,-22],[17.6,-17]]);
    // corda como bandoleira
    p.F(M.rope[1]); p.poly([[-24.3,-40],[-16.2,-46],[24.3,-12],[17.6,-6]]);
    p.F(M.rope[2]); for(let k=0;k<8;k++){ const t=k/8; p.rect(-14+t*30,-42+t*33,1.4,1.4); }
    p.id();
  }
  function drawHead(p,M,sk,P){
    p.xf(sk.ha,sk.neck.x,sk.neck.y);
    p.F(M.skin[1]); p.cap(P2(0,4),P2(2,-8),14,12);
    p.ell(-6,-18,3,4.4); p.ell(3,-20,13,13); p.poly([[-4,-12],[17,-14],[18,-6],[6,-3],[-2,-4]]);
    p.F(M.skin[2]); p.ell(-6,-18,1.2,2.4); p.F(M.skin[0]); p.ell(9,-25,3,1.6);
    // tapa-olho de fita
    p.F(M.tape[1]); p.poly([[4,-26],[15,-22],[14,-18],[3,-22]]); p.poly([[5,-17],[14,-24],[16,-21],[7,-15]]);
    p.F(M.tape[2]); p.rect(8,-22,2,2);
    p.F(M.skin[3]); p.ell(15.6,-20,1.4,1.8); p.F(M.eye[1]); p.rect(15.2,-20.6,1.2,1.2);
    p.F(M.skin[1]); p.poly([[15,-19],[20,-14],[16,-13]]);
    // barba
    p.F(M.beard[1]); p.poly([[-4,-12],[4,-13],[10,-12],[18,-10],[19,-4],[16,4],[10,10],[2,12],[-6,8],[-8,0]]);
    p.F(M.beard[2]); [[2,-6],[8,-2],[4,4],[12,2],[-2,2]].forEach(([x,y])=>p.poly([[x,y],[x+1.4,y],[x+0.6,y+5]]));
    p.F(M.alga[1]); [[6,0],[13,4],[0,6]].forEach(([x,y])=>p.poly([[x,y],[x+1.2,y],[x+2,y+7],[x+0.6,y+7]]));
    // boca na barba
    if(P.jaw>4){ const o=Math.min(9,P.jaw*0.4); p.F(M.mouth[1]); p.poly([[8,-9],[17,-9.6],[17,-9+o],[8.6,-8.6+o]]); p.F(M.teeth[1]); p.rect(9,-9.4,7,1.4); }
    else { p.F(M.mouth[2]); p.rect(9,-8.6,7,1); }
    // gorro de lã
    p.F(M.beanie[1]); p.poly([[-10,-24],[-8,-31],[0,-35],[10,-34],[16,-29],[16,-25]]);
    p.F(M.beanie[2]); p.poly([[-11,-26],[16.4,-27],[17,-22.4],[-10.4,-21.6]]);
    p.F(M.beanie[2]); for(let x=-9;x<16;x+=3) p.rect(x,-25.6,1,3);
    p.F(M.beanie[0]); p.rect(-2,-33,8,1.2);
    p.id();
  }
  function drawCrate(p,M,c){
    if(!c) return; p.id(); p.xf(0.06,c.x,c.y);
    p.F(M.wood[1]); p.rect(-15,-12,30,24);
    p.F(M.wood[2]); [-6,6].forEach(y=>p.rect(-15,y,30,1.4)); [-6,6].forEach(x=>p.rect(x,-12,1.2,24));
    p.F(M.wood[0]); p.poly([[-15,-12],[15,-12],[-15,10]]); p.F(M.wood[1]); p.poly([[-13,-10],[13,-10],[-13,8]]);
    p.F(M.wood[2]); p.poly([[-15,-12],[-12,-12],[15,9],[15,12]]);
    p.F(M.stamp[1]); p.rect(-10,-2,9,1.4); p.rect(-10,1,6,1.2); p.rect(3,-9,6,4);
    p.F(M.stamp[0]); p.rect(4,-8,4,2);
    p.F(M.iron[1]); [[-15,-12],[12,-12],[-15,9],[12,9]].forEach(([x,y])=>p.rect(x,y,3,3));
    p.id();
  }
  function drawChain(p,M,wr,hook,furia){
    if(!hook) return; p.id();
    const n=Math.max(3,Math.round(Math.hypot(hook.x-wr.x,hook.y-wr.y)/4)), ang=Math.atan2(hook.y-wr.y,hook.x-wr.x);
    for(let k=0;k<n;k++){ const q=lerp(wr,hook,k/n); p.F(k%2?M.iron[2]:M.iron[1]); if(k%2) p.ell(q.x,q.y,2.6,1.2,ang); else p.ell(q.x,q.y,2.4,2,ang); }
    // gancho em J
    p.xf(ang-Math.PI/2,hook.x,hook.y);
    p.F(M.iron[1]); p.ell(0,-2,3,3);
    p.cap(P2(0,0),P2(0,12),5,5); p.cap(P2(0,12),P2(5,18),5,4.6); p.cap(P2(5,18),P2(11,15),4.6,4); p.cap(P2(11,15),P2(12,9),4,2.4);
    p.F(M.rust[1]); p.rect(-1.6,4,2,3); p.rect(5,15.6,2.2,1.6);
    p.F(M.iron[0]); p.rect(-2,1,1,9);
    p.id();
  }
  const cache=new Map();
  function frame(form,anim,fi,step=5){
    const K=PIX.getK(), key=form+anim+fi+step+'@'+K; if(cache.has(key)) return cache.get(key);
    const P=poseOf(anim,fi), M=mats(form), sk=skeleton(P);
    const parts=[
      {back:true, draw:(c,u)=>drawArm(mkPen(c,u),M,sk.shB,sk.elB,sk.wrB,false)},
      {back:true, draw:(c,u)=>drawLeg(mkPen(c,u),M,sk.hipB,sk.kneeB,sk.ankleB,false)},
      {draw:(c,u)=>drawCrate(mkPen(c,u),M,sk.crate)},
      {draw:(c,u)=>drawTorso(mkPen(c,u),M,sk)},
      {draw:(c,u)=>drawLeg(mkPen(c,u),M,sk.hipF,sk.kneeF,sk.ankleF,true)},
      {draw:(c,u)=>drawHead(mkPen(c,u),M,sk,P)},
      {draw:(c,u)=>drawChain(mkPen(c,u),M,sk.wrF,sk.hook,form==='furia')},
      {draw:(c,u)=>drawArm(mkPen(c,u),M,sk.shF,sk.elF,sk.wrF,true)},
    ];
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM[form]});
    const sc=q=>q?{x:q.x*K,y:q.y*K}:null; cv._hand=sc(sk.wrF); cv._hook=sc(sk.hook); cv._crate=sc(sk.crate); cv._mouth=sc(sk.mouth); cv._head=sc(sk.H(4,-36)); cv._shB=sc(sk.shB);
    cache.set(key,cv); return cv;
  }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame};
})();
