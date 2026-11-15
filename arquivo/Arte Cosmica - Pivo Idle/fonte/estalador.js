/* ===== ESTALADOR (nº 007): cego, caça pelo som, hi-bit ===== */
const ESTA=(function(){
  const {rad,lp,lerp,P2,mkPen,compose}=PIX;
  const FW=136, FH=124, GROUND=118, AX=52;
  const RIM={comum:'#ffd8a0', enluarado:'#c8ecff', plenilunar:'#ffa0b0'};
  function mats(form){
    const m={
      skin:['#b8a490','#8a7462','#5e4c42','#3a2e2c'],
      fung:['#fff0c8','#e8c890','#b08a5a','#6a4a30'],
      fung2:['#ffc070','#e8803a','#a84e20','#5e2810'],
      jacket:['#7a5a46','#4e382c','#34241e','#1e1412'],
      mold:['#b8c48a','#8a9a5e','#5e6a3e','#3a4224'],
      pants:['#7a8a5a','#55633c','#3a4428','#222a18'],
      boot:['#6a5a4a','#3e3228','#2a201a','#16100c'],
      mouth:['#6a2a30','#3a141c','#240a10','#140408'],
      teeth:['#f0e4b0','#c8b478','#8e7c4c','#564a2c'],
      cap:['#fff4dc','#e8d4a8','#b09a70','#6e5c40'],
    };
    if(form==='enluarado'){ m.skin=['#fff6f0','#e8d8d4','#b8a4a8','#7a6670']; m.fung=['#f0ffff','#a8e0ff','#68a8e0','#3a6aa0']; m.fung2=['#d8f4ff','#78c8ff','#3a8ad8','#1a4a8a']; m.cap=['#ffffff','#d0ecff','#90b8e0','#5a7aa0']; }
    if(form==='plenilunar'){ m.skin=['#c86a7a','#943a50','#621e36','#3a0e20']; m.fung=['#ffe0c0','#e8a070','#b0603a','#6a3018']; m.fung2=['#ff8a6a','#d84a3a','#8e2420','#50100e']; m.cap=['#ffd8b0','#e8a070','#a8603a','#5e3018']; }
    return m;
  }
  const NAMES={skin:'Pele',fung:'Fungo bege',fung2:'Fungo laranja',jacket:'Jaqueta de couro',mold:'Mofo',pants:'Calça cargo',boot:'Bota',teeth:'Dentes'};
  const REST={hx:0,lean:10,head:-4,tilt:0,open:0.2,aFs:62,aFe:84,aBs:70,aBe:94,lFh:14,lFk:-6,lBh:-10,lBk:-22,flash:0,trem:0,click:0};
  const ANIMS={
    idle:{nome:'Parado (estalando)',n:6,dur:()=>150,pose:i=>{ const p=i/6*Math.PI*2, s=Math.sin(p); return {head:-4+2*s, open:i%3===0?0.6:0.15, click:i%3===0?1:0, trem:i%2, aFs:62+2*s, aFe:84+(i%2?3:-3), aBs:70-2*s, aBe:94+(i%2?-3:3), lean:10+s}; }},
    walk:{nome:'Andar com cuidado',n:8,dur:()=>150,pose:i=>{ const p=i/8*Math.PI*2; const lFh=8+14*Math.sin(p), lBh=8+14*Math.sin(p+Math.PI);
      return {lFh, lFk:lFh-10-18*Math.max(0,Math.cos(p)), lBh, lBk:lBh-10-18*Math.max(0,Math.cos(p+Math.PI)), lean:12, head:-2+3*Math.sin(2*p), trem:i%2, aFs:64+6*Math.sin(p), aFe:86+(i%2?4:-4), aBs:72-6*Math.sin(p), aBe:96+(i%2?-4:4), click:i===2||i===6?1:0, open:i===2||i===6?0.5:0.15}; }},
    listen:{nome:'Ouvir (para e estala)',n:6,dur:i=>[180,140,260,140,260,180][i],pose:i=>[
      {head:-6,tilt:0},{head:-14,tilt:1,lean:6,click:1,open:0.6},{head:-16,tilt:1,lean:5,open:0.1},
      {head:-14,tilt:1,lean:5,click:1,open:0.6},{head:-18,tilt:1,lean:4,open:0.1,aFs:56,aFe:76},{head:-6,tilt:0}][i]},
    attack:{nome:'Agarrão (35)',n:7,dur:i=>[90,110,110,110,70,320,160][i],pose:i=>[
      {head:4,lean:20,open:0.8,aFs:90,aFe:110,aBs:96,aBe:120,lFh:20,lBh:-16,lBk:-24,hx:1},
      {head:8,lean:30,open:1,aFs:100,aFe:120,aBs:110,aBe:130,lFh:36,lFk:10,lBh:-26,lBk:-50,hx:4},
      {head:8,lean:32,open:1,aFs:100,aFe:120,aBs:110,aBe:130,lFh:-10,lFk:-30,lBh:30,lBk:6,hx:6},
      {head:8,lean:32,open:1,aFs:100,aFe:120,aBs:110,aBe:130,lFh:36,lFk:10,lBh:-26,lBk:-50,hx:8},
      {head:12,lean:30,open:1,aFs:80,aFe:60,aBs:84,aBe:64,lFh:30,lFk:8,lBh:-22,lBk:-34,hx:12},
      {head:14,lean:28,open:0.9,aFs:76,aFe:50,aBs:80,aBe:54,lFh:28,lFk:8,lBh:-20,lBk:-32,hx:12,trem:1},
      {head:2,lean:16,open:0.4,hx:5}][i]},
    hurt:{nome:'Dano',n:4,dur:i=>[80,110,120,150][i],pose:i=>[
      {lean:-8,head:-26,open:1,hx:-6,flash:1,aFs:30,aFe:20,aBs:24,aBe:14},
      {lean:-4,head:-18,open:0.8,hx:-5,aFs:40,aFe:40,aBs:36,aBe:36},
      {lean:4,head:-8,open:0.4,hx:-2},
      {}][i]},
  };
  function poseOf(anim,i){ return Object.assign({},REST,ANIMS[anim].pose(i)); }
  function skeleton(P){
    const hip={x:AX+P.hx,y:64};
    const hipF={x:hip.x+3,y:hip.y}, hipB={x:hip.x-3,y:hip.y};
    const kneeF=lp(hipF,P.lFh,21), ankleF=lp(kneeF,P.lFk,21), kneeB=lp(hipB,P.lBh,21), ankleB=lp(kneeB,P.lBk,21);
    const dy=GROUND-Math.max(ankleF.y+4.5, ankleB.y+4.5);
    [hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB].forEach(p=>p.y+=dy);
    const a=rad(P.lean), c=Math.cos(a), s=Math.sin(a);
    const T=(lx,ly)=>({x:hip.x+lx*c-ly*s, y:hip.y+lx*s+ly*c});
    const neck=T(2,-31), shF=T(6,-26), shB=T(-3,-27);
    const ha=rad(P.lean+P.head), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:neck.x+lx*hc-ly*hs, y:neck.y+lx*hs+ly*hc});
    const elF=lp(shF,P.aFs,13), wrF=lp(elF,P.aFe,13), elB=lp(shB,P.aBs,13), wrB=lp(elB,P.aBe,13);
    return {hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,neck,shF,shB,elF,wrF,elB,wrB,a,ha,H,T,mouth:H(10,-5),head:H(3,-16)};
  }
  function drawArm(p,M,sh,el,wr,front,P){
    p.id();
    p.F(M.jacket[1]); p.cap(sh,el,7.6,6.8); p.cap(el,lerp(el,wr,0.6),6.8,6);
    p.F(M.mold[1]); const m=lerp(sh,el,0.5); p.ell(m.x,m.y,2,1.4);
    p.F(M.jacket[0]); p.cap(lerp(sh,el,0.1),lerp(sh,el,0.4),1,1);
    p.F(M.skin[1]); p.cap(lerp(el,wr,0.55),wr,4.4,3.8);
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y);
    p.F(front?M.fung[1]:M.skin[1]); p.poly([[-0.5,-2.6],[4,-3],[4.6,2.8],[-0.5,2.6]]);
    const tr=P.trem?0.8:-0.8;
    for(let k=0;k<4;k++){ const y0=-2.4+k*1.6; const sp=(k-1.5)*0.35+tr*0.1; p.F(front&&k<2?M.fung[1]:M.skin[1]); p.cap(P2(4,y0),P2(8.4,y0+sp*4+tr*(k%2?1:-1)),1.6,1.3); }
    if(front){ p.F(M.fung2[1]); p.ell(1.4,-1,1.4,1); p.ell(3,1.6,1,0.8); }
    p.id();
  }
  function drawLeg(p,M,hip,knee,ankle,front){
    p.id();
    p.F(M.pants[1]); p.cap(hip,knee,9.8,8.6); p.cap(knee,ankle,8.6,7.4);
    p.F(M.pants[2]); const pk=lerp(hip,knee,0.6); p.rect(pk.x-2,pk.y-1.6,5,4); p.F(M.pants[3]); p.rect(pk.x-2,pk.y+2.2,2,1.4);
    p.F(M.boot[1]); p.cap(lerp(knee,ankle,0.75),ankle,8.4,8);
    const a=ankle; p.poly([[a.x-4.4,a.y-2],[a.x+3.6,a.y-2],[a.x+9,a.y+1],[a.x+9.6,a.y+3.8],[a.x-4.6,a.y+3.8]]);
    p.F(M.boot[3]); p.rect(a.x-4.6,a.y+3,14.2,1.2);
    p.F(M.boot[0]); p.rect(a.x+2.6,a.y-0.6,2.6,0.9);
  }
  function drawTorso(p,M,sk){
    p.xf(sk.a,sk.hip.x,sk.hip.y);
    p.F(M.jacket[1]); p.poly([[-11,1.4],[10,1.4],[11,-9],[12,-20],[9,-28],[3,-32],[-5,-32],[-11,-27],[-12.6,-16],[-11.6,-6]]);
    p.F(M.jacket[2]); p.rect(4,-30,1,30); p.rect(-9,-20,1,14);
    p.F(M.jacket[0]); p.poly([[2,-31],[8,-29],[6,-22],[3,-26]]); p.rect(-6,-25,1,9);
    p.F(M.skin[2]); p.poly([[4.4,-29],[8.4,-27],[6.8,-18],[5,-20]]);
    p.F(M.fung[1]); p.ell(6,-23,1.6,1.4); p.F(M.fung2[1]); p.ell(6.6,-20,1,0.9);
    p.F(M.mold[1]); [[-6,-14,2.4,1.6],[2,-8,2,1.4],[-9,-24,1.6,1.2],[8,-12,1.8,1.4]].forEach(([x,y,rx,ry])=>p.ell(x,y,rx,ry));
    p.F(M.mold[2]); p.rect(-7,-14,1,1); p.rect(1.4,-8,1,1);
    p.F(M.jacket[3]); p.poly([[-12,-4],[-8,-2],[-6,1.4],[-11,1.4]]);
    p.F(M.pants[1]); p.poly([[-11.4,-2],[10.2,-2],[10.4,2.4],[-11.6,2.4]]);
    p.id();
  }
  function drawHead(p,M,sk,P,form){
    p.xf(sk.ha,sk.neck.x,sk.neck.y);
    p.F(M.skin[1]); p.cap(P2(0,3),P2(1,-6),6.6,6); p.ell(-3,-12.6,2.2,3.2);
    p.F(M.mouth[1]); const o=P.open; p.poly([[2,-8],[11,-8.4],[11.4,-6+o*4],[3,-5+o*3]]);
    p.F(M.teeth[1]); [[3.6,-8.2,1.2,1.6],[5.8,-8.4,1.3,1.3],[8.6,-8.2,1,1.8],[10,-8.4,1.1,1.1]].forEach(([x,y,w,h])=>p.rect(x,y,w,h));
    p.F(M.skin[1]); p.poly([[1,-5+o*3.6],[11,-6+o*4.4],[11.6,-3.4+o*4.4],[8,-1+o*3],[2,-1.6+o*3]]);
    p.F(M.teeth[1]); p.rect(4,-5.6+o*3.4,1.2,1.2); p.rect(7.6,-5.8+o*3.8,1.2,1.4);
    // flor de placas
    const petals=[[-150,8,'fung'],[-118,10,'fung2'],[-90,11,'fung'],[-60,11,'fung2'],[-32,10,'fung'],[-5,9,'fung2'],[20,7,'fung']];
    const cx=3, cy=-15;
    petals.forEach(([ang,L,mt],k)=>{ const A=rad(ang+(P.tilt?6:0)), B=A+0.42, C=A-0.42;
      p.F(M[mt][1]); p.poly([[cx,cy],[cx+Math.cos(C)*L*0.85,cy+Math.sin(C)*L*0.85],[cx+Math.cos(A)*(L+1.6),cy+Math.sin(A)*(L+1.6)],[cx+Math.cos(B)*L*0.85,cy+Math.sin(B)*L*0.85]]); });
    p.F(M.mouth[2]); petals.forEach(([ang,L])=>{ const A=rad(ang+(P.tilt?6:0))+0.42; p.cap(P2(cx,cy),P2(cx+Math.cos(A)*L*0.7,cy+Math.sin(A)*L*0.7),0.9,0.7); });
    p.F(M.mouth[3]); p.ell(cx,cy,2.2,2);
    p.F(M.fung2[2]); p.ell(cx,cy,1.2,1.1);
    // cogumelos
    [[-2,-25,1],[3,-27,1.3],[7,-25,0.9]].forEach(([x,y,s])=>{ p.F(M.cap[1]); p.rect(x-0.5,y,1.2,3*s); p.ell(x+0.1,y,2.4*s,1.5*s); p.F(M.fung2[2]); p.rect(x-1,y-0.6,1,0.8); });
    if(form==='plenilunar'){ p.F(M.fung2[1]); p.poly([[-4,-20],[-10,-30],[-6,-21]]); p.poly([[8,-21],[13,-31],[10,-21]]); }
    p.id();
  }
  const cache=new Map();
  function frame(form,anim,fi,step=5){
    const K=PIX.getK(), key=form+anim+fi+step+'@'+K; if(cache.has(key)) return cache.get(key);
    const P=poseOf(anim,fi), M=mats(form), sk=skeleton(P);
    const parts=[
      {back:true, draw:(c,u)=>drawArm(mkPen(c,u),M,sk.shB,sk.elB,sk.wrB,false,P)},
      {back:true, draw:(c,u)=>drawLeg(mkPen(c,u),M,sk.hipB,sk.kneeB,sk.ankleB,false)},
      {draw:(c,u)=>drawTorso(mkPen(c,u),M,sk)},
      {draw:(c,u)=>drawLeg(mkPen(c,u),M,sk.hipF,sk.kneeF,sk.ankleF,true)},
      {draw:(c,u)=>drawHead(mkPen(c,u),M,sk,P,form)},
      {draw:(c,u)=>drawArm(mkPen(c,u),M,sk.shF,sk.elF,sk.wrF,true,P)},
    ];
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM[form]});
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._mouth=sc(sk.mouth); cv._head=sc(sk.head); cv._hand=sc(sk.wrF);
    cache.set(key,cv); return cv;
  }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame};
})();
