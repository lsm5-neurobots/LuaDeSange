/* ===== CUSPIDOR (nº 004): zumbi de ácido, hi-bit ===== */
const CUSP=(function(){
  const {rad,ramp,lp,lerp,P2,ik,mkPen,compose}=PIX;
  const FW=128, FH=124, GROUND=118, AX=50;
  const RIM={comum:'#c8f0a0', enluarado:'#a0f4ff', plenilunar:'#ffb0e0'};
  function mats(form){
    const m={
      skin:['#d8dc8a','#a8b05a','#76803e','#4a5230'],
      acid:['#f4ffb0','#b8f53a','#6ac21a','#2e7a10'],
      polo:['#a8784e','#7a5232','#523620','#301e12'],
      collar:['#5a3a26','#3a2416','#221408','#120a04'],
      pants:['#9a98a2','#6e6c78','#4c4a58','#2e2c3a'],
      shoeA:['#5a5660','#24222a','#16141a','#0a080c'],
      shoeB:['#b07a4a','#7a4e2a','#50321a','#2e1c0e'],
      hair:['#5a5040','#36301f','#221e14','#14110a'],
      eye:['#fff6b0','#f2d23a','#b0901a','#6a540a'],
      mouth:['#6a3434','#3a1a1e','#24100e','#140806'],
      teeth:['#e8dca0','#c4b070','#8a7848','#54482a'],
      burn:['#8a7a3a','#5a4a24','#3a2e16','#20180a'],
    };
    if(form==='enluarado'){ m.skin=['#b8d0ff','#7a98e0','#4e68a8','#2e3e6e']; m.acid=['#e0fffa','#5af0e0','#1ab0b0','#0a6a70']; m.eye=['#ffffff','#c8f0ff','#78c0e0','#3a7aa0']; m.polo=['#8a7a8e','#5e5066','#3e3446','#241e2a']; }
    if(form==='plenilunar'){ m.skin=['#ffb0e0','#e05aa8','#9a2e72','#5a1444']; m.acid=['#fffcc0','#e8f53a','#a0c21a','#5a7a10']; m.eye=['#fffbe0','#ffd23f','#ff8a2a','#c2401a']; m.polo=['#8a5a4a','#5e3a2e','#3e241c','#24140e']; }
    return m;
  }
  const NAMES={skin:'Pele',acid:'Ácido',polo:'Camisa polo',collar:'Gola queimada',pants:'Calça social',shoeA:'Sapato preto',shoeB:'Sapato marrom',eye:'Olho',burn:'Queimadura'};
  const REST={hx:0,lean:24,head:-12,jaw:10,sac:0.15,aBs:-2,aBe:6,lFh:16,lFk:6,lBh:-16,lBk:-22,flash:0,spit:0,drip:0};
  const ANIMS={
    idle:{nome:'Parado',n:6,dur:()=>170,pose:i=>{ const p=i/6*Math.PI*2, s=Math.sin(p); return {sac:0.15+0.08*(s+1)/2, jaw:9+3*Math.max(0,Math.sin(p-0.4)), head:-12+2*Math.sin(p-0.8), lean:24+1.2*s, aBs:-2+2*s, aBe:6+3*s, drip:i%3}; }},
    walk:{nome:'Andar',n:8,dur:()=>135,pose:i=>{ const p=i/8*Math.PI*2; const lFh=16+12*Math.sin(p), lBh=-16+12*Math.sin(p+Math.PI);
      return {lFh, lFk:lFh-14*Math.max(0,Math.cos(p))-4, lBh, lBk:lBh-6-14*Math.max(0,Math.cos(p+Math.PI)), lean:24+2.5*Math.abs(Math.sin(p)), head:-12+3*Math.sin(2*p-0.7), sac:0.15+0.1*Math.abs(Math.sin(p)), aBs:-2+10*Math.sin(p), aBe:6+10*Math.sin(p), jaw:10, drip:i%3}; }},
    attack:{nome:'Cuspir',n:8,spitAt:3,dur:i=>[200,200,200,60,140,160,160,140][i],pose:i=>[
      {sac:0.4,head:-20,lean:18,jaw:4,hx:-1},
      {sac:0.72,head:-26,lean:14,jaw:2,hx:-2,lFh:20,lBh:-20},
      {sac:1,head:-30,lean:10,jaw:1,hx:-3,lFh:22,lBh:-22,lBk:-28},
      {sac:0.25,head:6,lean:34,jaw:24,hx:4,spit:1,lFh:24,lFk:10,lBh:-22,lBk:-30},
      {sac:0.1,head:2,lean:30,jaw:20,hx:3,lFh:22,lFk:8,lBh:-20,lBk:-28,drip:2},
      {sac:0.1,head:-6,lean:26,jaw:14,hx:1},
      {sac:0.12,head:-10,lean:24,jaw:12},
      {sac:0.15,head:-12,lean:24,jaw:10}][i]},
    hurt:{nome:'Dano',n:4,dur:i=>[80,110,120,150][i],pose:i=>[
      {lean:4,head:-34,jaw:20,hx:-6,flash:1,aBs:-30,aBe:-20,sac:0.3},
      {lean:8,head:-26,jaw:16,hx:-5,aBs:-20,aBe:-10,sac:0.25},
      {lean:18,head:-16,jaw:12,hx:-2},
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
    const neck=T(3,-30), shF=T(5,-25), shB=T(-4,-26);
    const ha=rad(P.lean+P.head), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:neck.x+lx*hc-ly*hs, y:neck.y+lx*hs+ly*hc});
    const sacC=H(5,0);
    const F=ik(shF,{x:sacC.x-1,y:sacC.y+9+P.sac*5},13,12,true);
    const elB=lp(shB,P.aBs,13), wrB=lp(elB,P.aBe,12);
    return {hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,neck,shF,shB,elF:F.E,wrF:F.W,elB,wrB,a,ha,H,T,sacC,eye:H(7,-15.5),mouth:H(12,-6)};
  }
  function drawArm(p,M,sh,el,wr,front){
    p.id();
    p.F(M.polo[1]); p.cap(sh,lerp(sh,el,0.45),7.4,6.6);
    p.F(M.skin[1]); p.cap(lerp(sh,el,0.4),el,5,4.6); p.cap(el,wr,4.4,3.8);
    p.F(M.burn[1]); const b=lerp(el,wr,0.6); p.circle(b,1.1);
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y);
    p.F(M.skin[1]); p.poly([[-0.5,-2.6],[4,-3],[4.6,2.8],[-0.5,2.6]]);
    for(let k=0;k<4;k++){ const y0=-2.2+k*1.5; p.F(M.skin[1]); p.cap(P2(4,y0),P2(7.2,y0+(front?1.6:0.6)),1.6,1.4); p.F(M.burn[2]); p.rect(6.4,y0+(front?1:0.2),1,1); }
    p.id();
  }
  function drawLeg(p,M,hip,knee,ankle,front){
    p.id();
    p.F(M.pants[1]); p.cap(hip,knee,9.4,8.2); p.cap(knee,ankle,8.2,7);
    p.F(M.acid[2]); const st=lerp(hip,knee,front?0.5:0.7); p.ell(st.x+1,st.y,2.2,1.6); if(front){ const s2=lerp(knee,ankle,0.4); p.ell(s2.x-1,s2.y,1.6,1.2); }
    p.F(M.pants[0]); if(front) p.cap(lerp(hip,knee,0.1),lerp(knee,ankle,0.8),0.8,0.8);
    const S=front?M.shoeA:M.shoeB, a=ankle;
    p.F(S[1]); p.poly([[a.x-4,a.y-1.6],[a.x+3,a.y-1.8],[a.x+9.6,a.y+1.6],[a.x+10.4,a.y+3.8],[a.x-4.2,a.y+3.8]]);
    p.F(S[3]); p.rect(a.x-4.2,a.y+3,14.6,1.2);
    p.F(S[0]); p.rect(a.x+3.4,a.y-0.2,3,0.9);
  }
  function drawTorso(p,M,sk){
    p.xf(sk.a,sk.hip.x,sk.hip.y);
    p.F(M.polo[1]); p.poly([[-10,1.6],[9.4,1.6],[10,-8],[9,-16],[10.6,-22],[8,-28],[2,-31.6],[-6,-32],[-12,-27],[-13.6,-18],[-12,-8]]);
    p.F(M.polo[2]); p.rect(-11,-24,1,10); p.rect(3.4,-27,1,9);
    p.F(M.polo[0]); p.rect(4.4,-24,1,1); p.rect(4.4,-20.6,1,1);
    p.F(M.collar[1]); p.poly([[-3,-31],[4,-33],[9,-29],[6.4,-27.4],[3,-29.6],[-1.6,-28.6]]);
    p.F(M.collar[3]); [[-2,-29.4],[1,-30.6],[5.4,-29],[7.6,-28.4]].forEach(([x,y])=>p.rect(x,y,1.2,1));
    // furos de ácido
    [[0,-18,2.6,2],[5.6,-13,1.8,1.6],[-4,-10,2,1.6],[7,-21,1.4,1.2]].forEach(([x,y,rx,ry])=>{ p.F(M.acid[2]); p.ell(x,y,rx+0.9,ry+0.9); p.F(M.skin[2]); p.ell(x,y,rx,ry); });
    p.F(M.acid[1]); p.rect(-0.6,-16.4,1,2.6); p.rect(6,-11.6,0.9,2);
    p.F(M.pants[1]); p.poly([[-12,-2],[9.6,-2],[9.8,2.4],[-12.2,2.4]]); p.F(M.collar[1]); p.rect(-12,-2.4,21.6,1.4);
    p.id();
  }
  function drawSac(p,M,sk,P,form,which){
    const s=P.sac, list=form==='plenilunar'?[[5,0,1],[-1,4,0.7],[9,5,0.75]]:[[5,0,1]];
    list.forEach(([dx,dy,k],idx)=>{ if(which==='back' && idx!==1) return; if(which==='front' && idx===1) return;
      const c=sk.H(dx,dy); const rx=(8+s*5)*k, ry=(6.8+s*4.4)*k;
      p.id(); p.F(M.skin[1]); p.ell(c.x,c.y+ry*0.25,rx,ry);
      p.F(M.acid[2]); p.ell(c.x+0.6,c.y+ry*0.35,rx*0.72,ry*0.68);
      p.F(M.acid[1]); p.ell(c.x+1,c.y+ry*0.25,rx*0.5,ry*0.46);
      p.F(M.acid[0]); p.ell(c.x+rx*0.25,c.y-ry*0.05,rx*0.18,ry*0.16);
      p.F(M.skin[2]); p.rect(c.x-rx*0.6,c.y+ry*0.9,rx*1.1,0.9);
    });
  }
  function drawHead(p,M,sk,P){
    p.xf(sk.ha,sk.neck.x,sk.neck.y);
    p.F(M.skin[1]); p.cap(P2(0,3),P2(1,-6),6.6,6);
    p.ell(-3.6,-13,2.2,3.2); p.ell(2,-14.4,8.6,9);
    p.poly([[-2,-8],[10.6,-9.6],[12,-6],[4,-4.4],[-0.6,-5]]);
    p.F(M.skin[3]); p.ell(-3.6,-13,0.9,1.8);
    p.F(M.skin[2]); p.poly([[3,-19],[10.6,-18],[10.6,-16.4],[3,-17.2]]);
    p.F(M.skin[3]); p.ell(7.2,-15.2,2.4,2); p.F(M.eye[1]); p.ell(7.4,-15.2,1.4,1.2); p.F(M.mouth[3]); p.rect(7.8,-15.6,0.8,0.8);
    p.F(M.skin[3]); p.ell(11.2,-15.4,1.1,1.3); p.F(M.eye[1]); p.rect(11,-15.8,0.9,0.9);
    p.F(M.skin[1]); p.poly([[10,-14.6],[13.2,-11],[10.6,-10.4]]);
    p.F(M.mouth[1]); p.poly([[4,-8],[11.6,-8.4],[11.8,-5.4],[4,-5]]);
    p.F(M.teeth[1]); p.rect(6,-8.4,1.3,1.6); p.rect(8.4,-8.5,1.3,1.4); p.rect(10.4,-8.4,1,1.2);
    p.F(M.hair[1]); p.poly([[-6.6,-19],[-1,-23.4],[5,-23],[8,-20.6],[6,-20.4],[4,-18.2],[1.6,-20.6],[-1,-18.6],[-4,-19.6]]);
    p.poly([[0.4,-19],[1.8,-15.6],[2.4,-19.4]]); p.poly([[4.6,-19.2],[5.4,-16.8],[6.2,-19.6]]);
    p.id();
  }
  function drawJaw(p,M,sk,P){
    const h=sk.H(0,-8); p.xf(sk.ha+rad(P.jaw),h.x,h.y);
    p.F(M.skin[1]); p.poly([[-1.6,-1],[11.6,0.6],[12,3],[9.6,6],[3.6,6.6],[-1.6,3]]);
    p.F(M.teeth[1]); p.rect(5.6,0.2,1.3,1.6); p.rect(8,0.4,1.3,1.4);
    p.F(M.acid[1]); const L=3+P.drip*1.6+(P.jaw>14?3:0); p.poly([[9.4,5],[11.4,4.6],[10.8,5+L],[10,5+L+1.4]]); p.ell(10.4,5+L+1.6,1.2,1.2);
    p.F(M.skin[2]); p.rect(3,5,6,1);
    p.id();
  }
  const cache=new Map();
  function frame(form,anim,fi,step=5){
    const K=PIX.getK(), key=form+anim+fi+step+'@'+K; if(cache.has(key)) return cache.get(key);
    const P=poseOf(anim,fi), M=mats(form), sk=skeleton(P);
    const parts=[
      {back:true, draw:(c,u)=>drawArm(mkPen(c,u),M,sk.shB,sk.elB,sk.wrB,false)},
      {back:true, draw:(c,u)=>drawLeg(mkPen(c,u),M,sk.hipB,sk.kneeB,sk.ankleB,false)},
      {back:true, draw:(c,u)=>drawSac(mkPen(c,u),M,sk,P,form,'back')},
      {draw:(c,u)=>drawTorso(mkPen(c,u),M,sk)},
      {draw:(c,u)=>drawLeg(mkPen(c,u),M,sk.hipF,sk.kneeF,sk.ankleF,true)},
      {draw:(c,u)=>drawHead(mkPen(c,u),M,sk,P)},
      {draw:(c,u)=>drawJaw(mkPen(c,u),M,sk,P)},
      {draw:(c,u)=>drawArm(mkPen(c,u),M,sk.shF,sk.elF,sk.wrF,true)},
      {draw:(c,u)=>drawSac(mkPen(c,u),M,sk,P,form,'front')},
    ];
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM[form]});
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._sac=sc(sk.sacC); cv._mouth=sc(sk.mouth); cv._eye=sc(sk.eye); cv._sacR=(8+P.sac*5)*K;
    cache.set(key,cv); return cv;
  }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame};
})();
