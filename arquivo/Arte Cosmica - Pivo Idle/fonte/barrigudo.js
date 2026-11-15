/* ===== BARRIGUDO (nº 006): zumbi inchado que explode, hi-bit ===== */
const BARR=(function(){
  const {rad,lp,lerp,P2,mkPen,compose}=PIX;
  const FW=132, FH=120, GROUND=114, AX=60;
  const RIM={comum:'#d8f0a0', enluarado:'#fff6c0', plenilunar:'#ffb070'};
  function mats(form){
    const m={
      skin:['#d4d08a','#a8a45a','#76763e','#4a4c2c'],
      bruise:['#a882c0','#7a5a98','#52406c','#302444'],
      blister:['#fff6b0','#ead060','#b09a30','#6a5a18'],
      shirt:['#f6f2e4','#d8d0b8','#a49c84','#625c4e'],
      shortA:['#7aa070','#4e7a4a','#345434','#1e321e'],
      shortB:['#c87060','#9a4a40','#6a2e2a','#3e1a18'],
      sandal:['#5a9ae0','#2a6ab8','#1a4a80','#0e2a4a'],
      eye:['#fff6c0','#e8d890','#a89a5a','#6a5e34'],
      mouth:['#6a3434','#3a1a1e','#24100e','#140806'],
      teeth:['#e8dca0','#c4b070','#8a7848','#54482a'],
      nail:['#5a4848','#3a2e30','#261c20','#140e12'],
    };
    if(form==='enluarado'){ m.skin=['#fff0a0','#e8c850','#b09028','#6a5414']; m.blister=['#ffffff','#f2f2f6','#c0c0d0','#80809a']; m.bruise=['#e0a0b0','#b06a80','#7a4256','#4a2434']; }
    if(form==='plenilunar'){ m.skin=['#ff9a50','#d0501e','#8a2a14','#4e140a']; m.blister=['#fffbd0','#ffd23f','#ff8a2a','#c2401a']; m.bruise=['#5a1a10','#3a0e08','#240804','#120402']; }
    return m;
  }
  const NAMES={skin:'Pele',bruise:'Hematoma',blister:'Bolhas',shirt:'Camiseta',shortA:'Bermuda (verde)',shortB:'Bermuda (vermelho)',sandal:'Chinelo'};
  const REST={hx:0,sway:0,lean:4,head:0,jaw:4,belly:0,glow:0,aFs:40,aFe:70,aBs:30,aBe:60,lFh:12,lFk:-4,lBh:-10,lBk:-2,flash:0,bob:0};
  const ANIMS={
    idle:{nome:'Parado',n:6,dur:()=>170,pose:i=>{ const p=i/6*Math.PI*2, s=Math.sin(p); return {belly:0.06+0.06*(s+1)/2, lean:4+1*s, head:1.5*Math.sin(p-0.6), jaw:4+2*Math.max(0,s), aFs:40+2*s, aBs:30+2*s}; }},
    walk:{nome:'Andar (balançando)',n:8,dur:()=>150,pose:i=>{ const p=i/8*Math.PI*2; const lFh=12+12*Math.sin(p), lBh=-10+12*Math.sin(p+Math.PI);
      return {lFh, lFk:lFh-8-10*Math.max(0,Math.cos(p)), lBh, lBk:lBh+6-10*Math.max(0,Math.cos(p+Math.PI)), sway:6*Math.sin(p), lean:4, head:-4*Math.sin(p), belly:0.08+0.08*Math.abs(Math.sin(p*2)),
        aFs:40+12*Math.sin(p), aBs:30-12*Math.sin(p), aFe:70+10*Math.sin(p), aBe:60-10*Math.sin(p), jaw:5}; }},
    attack:{nome:'Barrigada',n:6,dur:i=>[200,140,70,160,140,140][i],pose:i=>[
      {lean:-8,hx:-4,belly:0.15,aFs:10,aFe:30,aBs:0,aBe:20,jaw:8,lFh:16,lBh:-14},
      {lean:-12,hx:-6,belly:0.2,aFs:0,aFe:20,aBs:-10,aBe:10,jaw:10,lFh:18,lBh:-16},
      {lean:14,hx:8,belly:0.25,aFs:70,aFe:90,aBs:60,aBe:80,jaw:14,lFh:26,lFk:4,lBh:-18,lBk:-12},
      {lean:12,hx:7,belly:0.15,aFs:66,aFe:86,aBs:56,aBe:76,jaw:10,lFh:24,lFk:2,lBh:-16,lBk:-10},
      {lean:6,hx:3,belly:0.08,jaw:6},
      {}][i]},
    explode:{nome:'Explodir (morte)',n:7,boomAt:5,dur:i=>[220,200,180,160,140,60,500][i],pose:i=>[
      {belly:0.25,glow:0.3,jaw:10,head:-6,aFs:60,aFe:80,aBs:50,aBe:70},
      {belly:0.45,glow:0.55,jaw:14,head:-10,aFs:70,aFe:90,aBs:60,aBe:80,hx:-1},
      {belly:0.65,glow:0.75,jaw:18,head:-14,aFs:80,aFe:100,aBs:70,aBe:90,hx:1},
      {belly:0.85,glow:0.9,jaw:20,head:-16,aFs:88,aFe:108,aBs:78,aBe:98,hx:-1},
      {belly:1,glow:1,jaw:22,head:-18,aFs:94,aFe:112,aBs:84,aBe:104,hx:1,flash:0},
      {belly:1.1,glow:1,flash:1,jaw:24,head:-18,aFs:96,aFe:114,aBs:86,aBe:106},
      {gone:1}][i]},
    hurt:{nome:'Dano',n:4,dur:i=>[80,110,120,150][i],pose:i=>[
      {lean:-10,head:-14,jaw:12,hx:-5,flash:1,belly:0.2,aFs:20,aFe:20,aBs:10,aBe:10},
      {lean:-6,head:-10,jaw:10,hx:-4,belly:0.16},
      {lean:0,head:-2,jaw:6,hx:-1,belly:0.1},
      {}][i]},
  };
  function poseOf(anim,i){ return Object.assign({},REST,ANIMS[anim].pose(i)); }
  function skeleton(P){
    const hip={x:AX+P.hx,y:74};
    const hipF={x:hip.x+5,y:hip.y}, hipB={x:hip.x-5,y:hip.y};
    const kneeF=lp(hipF,P.lFh,16), ankleF=lp(kneeF,P.lFk,16), kneeB=lp(hipB,P.lBh,16), ankleB=lp(kneeB,P.lBk,16);
    const dy=GROUND-Math.max(ankleF.y+4, ankleB.y+4);
    [hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB].forEach(p=>p.y+=dy);
    const a=rad(P.lean+P.sway*0.6), c=Math.cos(a), s=Math.sin(a);
    const T=(lx,ly)=>({x:hip.x+lx*c-ly*s, y:hip.y+lx*s+ly*c});
    const neck=T(2,-36), shF=T(7,-30), shB=T(-7,-31);
    const ha=rad(P.lean+P.head), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:neck.x+lx*hc-ly*hs, y:neck.y+lx*hs+ly*hc});
    const bs=1+P.belly*0.35, bc=T(6,-14);
    const elF=lp(T(9+P.belly*4,-30),P.aFs,11), wrF=lp(elF,P.aFe,10), elB=lp(T(-7,-31),P.aBs,11), wrB=lp(elB,P.aBe,10);
    return {hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,neck,shF:T(9+P.belly*4,-30),shB,elF,wrF,elB,wrB,a,ha,H,T,bc,bs,eye:H(6,-11)};
  }
  function drawArm(p,M,sh,el,wr){
    p.id(); p.F(M.shirt[1]); p.cap(sh,lerp(sh,el,0.5),9.6,8.6);
    p.F(M.skin[1]); p.cap(lerp(sh,el,0.45),el,8,7.4); p.cap(el,wr,7.4,6.6);
    p.F(M.bruise[1]); const b=lerp(el,wr,0.4); p.ell(b.x,b.y,1.6,1.2);
    p.F(M.skin[1]); p.circle(wr,4.6); p.F(M.skin[0]); p.circle(P2(wr.x+1,wr.y-1.4),1.6);
    p.F(M.skin[2]); p.rect(wr.x+1,wr.y+1.6,3,0.9);
  }
  function drawLeg(p,M,hip,knee,ankle,front){
    p.id(); p.F(M.skin[1]); p.cap(knee,ankle,9,8);
    p.F(M.shortA[1]); p.cap(hip,knee,12.6,11);
    p.F(M.shortB[1]); const k1=lerp(hip,knee,0.3), k2=lerp(hip,knee,0.7); p.cap(P2(k1.x-5,k1.y),P2(k1.x+5,k1.y),1.6,1.6); p.cap(P2(k2.x-5,k2.y),P2(k2.x+5,k2.y),1.6,1.6);
    p.F(M.shortA[3]); p.cap(P2(hip.x,hip.y),P2(knee.x,knee.y+2),1,1);
    const a=ankle;
    if(front){ p.F(M.sandal[1]); p.rect(a.x-4.4,a.y+2.6,13.6,1.6); p.F(M.skin[1]); p.poly([[a.x-4,a.y-1.4],[a.x+3,a.y-1.4],[a.x+8.4,a.y+0.8],[a.x+8.8,a.y+2.8],[a.x-4.2,a.y+2.8]]); p.F(M.sandal[1]); p.cap(P2(a.x+3.6,a.y+2.4),P2(a.x+1.4,a.y-0.6),1,1); }
    else { p.F(M.skin[2]); p.poly([[a.x-4,a.y-1.4],[a.x+3,a.y-1.4],[a.x+8,a.y+1],[a.x+8.4,a.y+3.6],[a.x-4.2,a.y+3.6]]); p.F(M.nail[2]); p.rect(a.x+6.4,a.y+2.6,1,1); }
  }
  function drawBody(p,M,sk,P){
    p.xf(sk.a,sk.hip.x,sk.hip.y);
    p.F(M.shortA[1]); p.poly([[-13,-6],[13,-6],[14,3],[-14,3]]); p.F(M.shortB[1]); p.rect(-13,-4,26,1.6); p.rect(-4,-6,1.6,9);
    // tronco + barriga
    p.F(M.skin[1]); p.poly([[-12,-8],[-13,-22],[-10,-33],[-2,-37],[8,-36],[12,-30],[10,-24]]);
    const bs=sk.bs, bx=6, by=-14;
    p.ell(bx,by,17*bs,14*bs);
    p.F(M.skin[0]); p.ell(bx+5*bs,by-6*bs,6*bs,3.6*bs);
    p.F(M.bruise[1]); p.ell(bx+2,by+6*bs,3.6,2.4); p.F(M.bruise[2]); p.ell(bx+4*bs,by+2,1.2,1.4);
    [[-3,-6],[1,7],[4,9],[0,6],[7,10]].forEach(([x,y])=>{}); // placeholder
    p.F(M.bruise[1]); p.rect(bx+4*bs-4,by+2,3,0.8); p.rect(bx+4*bs+1.4,by+2.6,3,0.8); p.rect(bx+4*bs-0.6,by+3.4,0.8,3);
    p.F(M.skin[3]); [[bx-10*bs,by-2*bs,bx-5*bs,by+4*bs],[bx+11*bs,by-5*bs,bx+14*bs,by+2*bs]].forEach(([x1,y1,x2,y2])=>{ p.rect(x1,y1,1,(y2-y1)*0.5); p.rect(x1+1,y1+(y2-y1)*0.5,1,(y2-y1)*0.5); });
    p.F(M.blister[1]); [[-6,-8,2],[12,-10,1.8],[-1,2,1.6],[13,-2,2.2],[2,-20,1.4],[9,4,1.4],[-8,0,1.2]].forEach(([x,y,r])=>{ p.ell(bx+x*bs-6,by+y*bs+8,r*(1+P.glow*0.4),r*(1+P.glow*0.4)); });
    p.F(M.blister[0]); [[-6,-8],[12,-10],[13,-2]].forEach(([x,y])=>p.rect(bx+x*bs-6.4,by+y*bs+7.4,0.9,0.9));
    // camiseta subida até o peito
    p.F(M.shirt[1]); p.poly([[-12.6,-22],[-10,-34],[-2,-38],[8,-37],[13,-31],[12,-26],[4,-27],[-4,-25],[-10,-21]]);
    p.F(M.shirt[2]); p.rect(-9,-25,10,0.9); p.F(M.shirt[3]); p.rect(-6,-32,1.2,1.2); p.rect(3,-34,1.4,1);
    p.id();
  }
  function drawHead(p,M,sk,P){
    p.xf(sk.ha,sk.neck.x,sk.neck.y);
    p.F(M.skin[1]); p.ell(-2,0,9,5); p.ell(3,-9,7.4,7.6); p.poly([[0,-5],[10.6,-6],[11,-2.4],[3,0]]);
    p.F(M.skin[2]); p.ell(5,0.6,6,2.2);
    p.F(M.bruise[1]); p.ell(-1,-14,2.4,1.6); p.ell(5,-15,1.4,1);
    p.F(M.skin[0]); p.ell(8.2,-6,2.4,1.8);
    p.F(M.skin[3]); p.ell(6.6,-11,1.8,1.2); p.F(M.eye[1]); p.rect(6,-11.2,2,0.8);
    p.F(M.skin[3]); p.rect(9.6,-11.4,1.2,0.8);
    p.F(M.skin[1]); p.poly([[9.6,-9.6],[12,-7],[9.8,-6.4]]);
    p.F(M.skin[3]); p.ell(-3.6,-8,1,1.6);
    p.id();
  }
  function drawJaw(p,M,sk,P){
    const h=sk.H(1,-3.6); p.xf(sk.ha+rad(P.jaw),h.x,h.y);
    p.F(M.mouth[1]); p.poly([[3,-0.8],[9.6,-1],[9.6,1.6],[3.4,1.6]]);
    p.F(M.skin[1]); p.poly([[-1,0.6],[10.4,0.6],[10.6,3],[3,4.4],[-1,3]]);
    p.F(M.teeth[1]); p.rect(5,-0.8,1.2,1.2); p.rect(7.4,-0.8,1.2,1);
    p.id();
  }
  const cache=new Map();
  function frame(form,anim,fi,step=5){
    const K=PIX.getK(), key=form+anim+fi+step+'@'+K; if(cache.has(key)) return cache.get(key);
    const P=poseOf(anim,fi), M=mats(form), sk=skeleton(P);
    if(P.gone){ const c=document.createElement('canvas'); c.width=Math.round(FW*K); c.height=Math.round(FH*K); c._belly={x:(sk.T(6,-14).x)*K,y:sk.T(6,-14).y*K}; cache.set(key,c); return c; }
    const parts=[
      {back:true, draw:(c,u)=>drawArm(mkPen(c,u),M,sk.shB,sk.elB,sk.wrB)},
      {back:true, draw:(c,u)=>drawLeg(mkPen(c,u),M,sk.hipB,sk.kneeB,sk.ankleB,false)},
      {draw:(c,u)=>drawLeg(mkPen(c,u),M,sk.hipF,sk.kneeF,sk.ankleF,true)},
      {draw:(c,u)=>drawBody(mkPen(c,u),M,sk,P)},
      {draw:(c,u)=>drawHead(mkPen(c,u),M,sk,P)},
      {draw:(c,u)=>drawJaw(mkPen(c,u),M,sk,P)},
      {draw:(c,u)=>drawArm(mkPen(c,u),M,sk.shF,sk.elF,sk.wrF)},
    ];
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM[form]});
    const bc=sk.T(6,-14); cv._belly={x:bc.x*K,y:bc.y*K}; cv._bellyR=17*sk.bs*K; cv._glow=P.glow;
    cache.set(key,cv); return cv;
  }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame};
})();
