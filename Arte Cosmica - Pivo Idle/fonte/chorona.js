/* ===== A CHORONA (mini boss M02), hi-bit ===== */
const CHOR=(function(){
  const {rad,lp,lerp,P2,ik,mkPen,compose}=PIX;
  const FW=128, FH=128, GROUND=122, AX=52;
  const RIM={normal:'#c8d8ff', furia:'#ff6a6a'};
  function mats(form){
    const m={
      skin:['#ffffff','#d6dae0','#9ea4b0','#62687a'],
      hair:['#40507a','#1a2236','#0e1422','#06080e'],
      dress:['#ffffff','#dedac8','#a6a08c','#686252'],
      dirt:['#a08a6a','#6e5a42','#4a3a2a','#2a2018'],
      claw:['#6a6a7a','#1e1e28','#121218','#08080c'],
      eye:['#ffffff','#eef6ff','#a8d0ff','#5a7ab0'],
      tear:['#4a4a6a','#1a1a2e','#10101e','#08080e'],
      feet:['#b8bcc4','#8a8e98','#5e626e','#3a3e48'],
    };
    if(form==='furia'){ m.eye=['#fff0f0','#ff3a3a','#c01a1a','#6a0a0a']; m.tear=['#ff6a6a','#8a0a14','#5a0610','#300308']; m.hair=['#4a5a8a','#1e2840','#101828','#080a12']; }
    return m;
  }
  const NAMES={skin:'Pele',hair:'Cabelo',dress:'Vestido',dirt:'Terra',claw:'Garras',eye:'Olhos',tear:'Lágrimas',feet:'Pés'};
  const SIT={lean:40,head:30,hx:-2,lFh:125,lFk:20,lBh:118,lBk:12,hug:1,hem:0.95,aFs:60,aFe:120,aBs:60,aBe:120,smear:0,flash:0,sob:0};
  const STAND={lean:22,head:6,hx:0,lFh:10,lFk:-4,lBh:-12,lBk:-20,hug:0,hem:0.42,aFs:62,aFe:78,aBs:50,aBe:66,smear:0,flash:0,sob:0};
  const mixP=(a,b,t)=>{ const o={}; for(const k in b) o[k]=typeof b[k]==='number'?(a[k]??b[k])+((b[k])-(a[k]??b[k]))*t:b[k]; o.hug=t<0.45?a.hug:b.hug; return o; };
  const ANIMS={
    idle:{nome:'Chorando (sentada)',n:6,dur:()=>200,pose:i=>{ const p=i/6*Math.PI*2, s=Math.sin(p); return Object.assign({},SIT,{lean:40+3*s, head:30+2*Math.sin(p-0.7), hx:-2+0.6*s, sob:(i%3===1)?1:0}); }},
    rise:{nome:'Levantar (incomodada)',n:6,dur:i=>[300,260,240,200,160,320][i],pose:i=>{ const t=[0,0.06,0.28,0.55,0.82,1][i]; const o=mixP(SIT,STAND,t); if(i===1){ o.head=-8; } return o; }},
    walk:{nome:'Avançar em zigue-zague',n:8,dur:()=>85,pose:i=>{ const p=i/8*Math.PI*2; const th=o=>8+26*Math.sin(p+o), sh=o=>th(o)-10-50*Math.max(0,Math.cos(p+o));
      return Object.assign({},STAND,{lFh:th(0),lFk:sh(0),lBh:th(Math.PI),lBk:sh(Math.PI),lean:32+3*Math.sin(2*p),head:-4,aFs:80+10*Math.sin(p),aFe:96,aBs:72-10*Math.sin(p),aBe:88,hem:0.4}); }},
    attack:{nome:'Garras',n:7,dur:i=>[180,90,60,120,80,60,200][i],pose:i=>Object.assign({},STAND,[
      {aFs:150,aFe:170,aBs:130,aBe:150,lean:10,head:-2,hx:-2},
      {aFs:172,aFe:200,aBs:150,aBe:182,lean:4,head:-6,hx:-3},
      {aFs:84,aFe:58,aBs:64,aBe:40,lean:34,head:4,hx:8,smear:1,lFh:24,lFk:6,lBh:-22,lBk:-28},
      {aFs:62,aFe:30,aBs:50,aBe:20,lean:36,head:6,hx:9,lFh:24,lFk:6,lBh:-22,lBk:-28},
      {aFs:150,aFe:176,aBs:40,aBe:20,lean:20,hx:6},
      {aFs:74,aFe:50,aBs:40,aBe:20,lean:34,hx:11,smear:2,lFh:26,lFk:8,lBh:-24,lBk:-30},
      {}][i])},
    hurt:{nome:'Dano',n:4,dur:i=>[80,110,120,150][i],pose:i=>Object.assign({},STAND,[
      {lean:-6,head:-26,hx:-6,flash:1,aFs:20,aFe:10,aBs:16,aBe:6},
      {lean:0,head:-18,hx:-5,aFs:30,aFe:30,aBs:26,aBe:24},
      {lean:12,head:-6,hx:-2},
      {}][i])},
  };
  function poseOf(anim,i){ return Object.assign({},STAND,ANIMS[anim].pose(i)); }
  function skeleton(P){
    const hip={x:AX+P.hx,y:64};
    const hipF={x:hip.x+2,y:hip.y}, hipB={x:hip.x-2,y:hip.y};
    const kneeF=lp(hipF,P.lFh,20), ankleF=lp(kneeF,P.lFk,20), kneeB=lp(hipB,P.lBh,20), ankleB=lp(kneeB,P.lBk,20);
    const dy=GROUND-Math.max(ankleF.y+3, ankleB.y+3, hip.y+5);
    [hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB].forEach(p=>p.y+=dy);
    const a=rad(P.lean), c=Math.cos(a), s=Math.sin(a);
    const T=(lx,ly)=>({x:hip.x+lx*c-ly*s, y:hip.y+lx*s+ly*c});
    const sob=P.sob?-1.2:0;
    const neck=T(2,-28+sob), shF=T(4,-24+sob), shB=T(-3,-25+sob);
    const ha=rad(P.lean+P.head), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:neck.x+lx*hc-ly*hs, y:neck.y+lx*hs+ly*hc});
    let elF,wrF,elB,wrB;
    if(P.hug>0.5){ const f=ik(shF,{x:kneeF.x+2,y:kneeF.y+6},13,12,true), b=ik(shB,{x:kneeB.x+3,y:kneeB.y+5},13,12,true); elF=f.E; wrF=f.W; elB=b.E; wrB=b.W; }
    else { elF=lp(shF,P.aFs,13); wrF=lp(elF,P.aFe,12); elB=lp(shB,P.aBs,13); wrB=lp(elB,P.aBe,12); }
    return {hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,neck,shF,shB,elF,wrF,elB,wrB,a,ha,H,T,eye:H(8,-14)};
  }
  function drawArm(p,M,sh,el,wr,P){
    p.id();
    p.F(M.dress[1]); p.cap(sh,lerp(sh,el,0.35),5.6,5);
    p.F(M.skin[1]); p.cap(lerp(sh,el,0.3),el,3.6,3.2); p.cap(el,wr,3.2,2.6);
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y);
    p.F(M.skin[1]); p.poly([[-0.4,-2],[3.4,-2.4],[3.8,2.2],[-0.4,2]]);
    const curl=P.hug>0.5?1.6:0.9;
    for(let k=0;k<4;k++){ const y0=-1.8+k*1.2, A=rad(-14+k*10);
      const m1=P2(3.6+Math.cos(A)*5,y0+Math.sin(A)*5), m2=P2(m1.x+Math.cos(A+0.4*curl)*4.4,m1.y+Math.sin(A+0.4*curl)*4.4), t=P2(m2.x+Math.cos(A+0.9*curl)*3,m2.y+Math.sin(A+0.9*curl)*3);
      p.F(M.skin[1]); p.cap(P2(3.4,y0),P2(4.6,y0),1.3,1.2);
      p.F(M.claw[1]); p.cap(P2(4.4,y0),m1,1.3,1.1); p.cap(m1,m2,1.1,0.8); p.cap(m2,t,0.8,0.5); }
    p.id();
  }
  function drawLeg(p,M,hip,knee,ankle){
    p.id(); p.F(M.skin[2]); p.cap(hip,knee,5.2,4); p.cap(knee,ankle,3.6,3);
    p.F(M.feet[1]); const a=ankle; p.poly([[a.x-2.6,a.y-1.4],[a.x+2.4,a.y-1.4],[a.x+7,a.y+1.4],[a.x+7,a.y+3],[a.x-2.8,a.y+3]]);
    p.F(M.feet[3]); p.rect(a.x+5,a.y+1.8,0.8,0.8); p.rect(a.x+3.4,a.y+2,0.8,0.8);
  }
  function drawDress(p,M,sk,P){
    p.id();
    const kF=sk.kneeF, kB=sk.kneeB, hF=lerp(sk.kneeF,sk.ankleF,P.hem), hB=lerp(sk.kneeB,sk.ankleB,P.hem);
    const wF=sk.T(8,-1), wB=sk.T(-9,-1);
    const pts=[[wB.x,wB.y],[wF.x,wF.y],[kF.x+3,kF.y],[hF.x+4,hF.y+2]];
    const n=6; for(let k=1;k<n;k++){ const q=lerp(hF,hB,k/n); pts.push([q.x+(k%2?1.5:-1),q.y+2+(k%2?3:0)]); }
    pts.push([hB.x-4,hB.y+2],[kB.x-3,kB.y]);
    p.F(M.dress[1]); p.poly(pts);
    p.F(M.dirt[1]); const d1=lerp(hF,hB,0.3), d2=lerp(hF,hB,0.7); p.ell(d1.x,d1.y,2.4,1.4); p.ell(d2.x,d2.y-1,2,1.2); const d3=lerp(wF,kF,0.6); p.ell(d3.x,d3.y,1.4,1);
    p.F(M.dress[2]); const f1=lerp(wB,hB,0.5), f2=lerp(wF,hF,0.5); p.rect(lerp(f1,f2,0.4).x,lerp(f1,f2,0.4).y,0.9,6);
  }
  function drawTorso(p,M,sk,P){
    p.xf(sk.a,sk.hip.x,sk.hip.y);
    const sob=P.sob?-1.2:0;
    p.F(M.dress[1]); p.poly([[-9,1],[8,1],[8.6,-8],[7.6,-16],[8.4,-22+sob],[5,-26.6+sob],[-2,-27.4+sob],[-7.6,-24+sob],[-9.6,-16],[-9.4,-7]]);
    p.F(M.dress[2]); p.rect(-6,-20,1,14); p.rect(2,-18,1,12);
    p.F(M.skin[1]); p.poly([[-1,-27+sob],[4.6,-26.4+sob],[2.4,-23+sob]]);
    p.F(M.dirt[1]); p.ell(4,-10,1.8,1.2); p.ell(-5,-4,1.6,1);
    p.id();
  }
  function drawHead(p,M,sk,P){
    p.xf(sk.ha,sk.neck.x,sk.neck.y);
    p.F(M.skin[1]); p.cap(P2(0,3),P2(1,-6),4.6,4.2); p.ell(2,-14,7.6,8.4); p.poly([[-1,-8],[9.6,-9.4],[10.6,-6],[3,-4.4]]);
    p.id();
  }
  function drawHairBack(p,M,sk,P,form){
    const H=sk.H; p.id(); p.F(M.hair[1]);
    if(form!=='furia'){ const a=H(-8,-12), sw=P.sob?1:0;
      p.poly([[H(-9,-18).x,H(-9,-18).y],[H(4,-24.6).x,H(4,-24.6).y],[H(10,-20).x,H(10,-20).y],[H(6,-8).x,H(6,-8).y],[a.x+6+sw,a.y+30],[a.x-4+sw,a.y+34],[a.x-7,a.y+12]]);
    } else {
      for(let k=0;k<9;k++){ const ang=-170+k*20, base=H(2+Math.cos(rad(ang))*6,-15+Math.sin(rad(ang))*6), L=13+(k%3)*6, w=-Math.PI/2+rad((k-4)*15);
        p.cap(base,{x:base.x+Math.cos(w)*L+(k%2?2:-2), y:base.y+Math.sin(w)*L},4.4,1.2); }
    }
  }
  function drawHairFront(p,M,sk,P,form){
    p.xf(sk.ha,sk.neck.x,sk.neck.y); p.F(M.hair[1]);
    const L=form==='furia'?-4:2;
    p.poly([[-9,-17],[-5,-23.6],[3,-24.4],[9.4,-21],[12,-14],[12,L],[9.6,L+3],[7.4,L],[5.6,-12],[0,-11],[-6,-7]]);
    p.F(M.hair[0]); p.rect(1,-23,1,8); p.rect(10,-16,0.9,10);
    p.id();
  }
  function drawEyes(p,M,sk,P){
    p.xf(sk.ha,sk.neck.x,sk.neck.y);
    p.F(M.skin[0]); p.poly([[6.4,-17.2],[9.4,-17.6],[9.6,-7],[6.8,-7.4]]);
    p.F(M.eye[1]); p.ell(8,-14,1.5,1.1);
    p.F(M.tear[1]); p.rect(7.4,-12.8,0.9,5.6); p.rect(8.8,-12.6,0.8,4);
    p.id();
  }
  function drawSmear(p,M,sk,P){
    p.id(); p.F(M.eye[0]);
    const sh=P.smear===1?sk.shF:sk.shF, w=sk.wrF; const a0=P.smear===1?190:170;
    const cur=Math.atan2(w.x-sh.x,w.y-sh.y)*180/Math.PI, r1=Math.hypot(w.x-sh.x,w.y-sh.y)+12, r0=r1-8, pts=[];
    for(let k=0;k<=8;k++){ const a=a0+(cur-a0)*k/8; pts.push([sh.x+Math.sin(rad(a))*r1, sh.y+Math.cos(rad(a))*r1]); }
    for(let k=8;k>=0;k--){ const a=a0+(cur-a0)*k/8; pts.push([sh.x+Math.sin(rad(a))*(r0+(1-k/8)*5), sh.y+Math.cos(rad(a))*(r0+(1-k/8)*5)]); }
    p.poly(pts);
  }
  const cache=new Map();
  function frame(form,anim,fi,step=5){
    const K=PIX.getK(), key=form+anim+fi+step+'@'+K; if(cache.has(key)) return cache.get(key);
    const P=poseOf(anim,fi), M=mats(form), sk=skeleton(P);
    const parts=[
      {draw:(c,u)=>drawHairBack(mkPen(c,u),M,sk,P,form)},
      {back:true, draw:(c,u)=>drawArm(mkPen(c,u),M,sk.shB,sk.elB,sk.wrB,P)},
      {back:true, draw:(c,u)=>drawLeg(mkPen(c,u),M,sk.hipB,sk.kneeB,sk.ankleB)},
      {draw:(c,u)=>drawLeg(mkPen(c,u),M,sk.hipF,sk.kneeF,sk.ankleF)},
      {draw:(c,u)=>drawTorso(mkPen(c,u),M,sk,P)},
      {draw:(c,u)=>drawDress(mkPen(c,u),M,sk,P)},
      {draw:(c,u)=>drawHead(mkPen(c,u),M,sk,P)},
      {draw:(c,u)=>drawHairFront(mkPen(c,u),M,sk,P,form)},
      {draw:(c,u)=>drawEyes(mkPen(c,u),M,sk,P)},
    ];
    if(P.smear) parts.push({noShade:true,smear:true,draw:(c,u)=>drawSmear(mkPen(c,u),M,sk,P)});
    parts.push({draw:(c,u)=>drawArm(mkPen(c,u),M,sk.shF,sk.elF,sk.wrF,P)});
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM[form]});
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._eye=sc(sk.eye); cv._hand=sc(sk.wrF); cv._head=sc(sk.H(2,-24)); cv._hip=sc(sk.hip);
    cache.set(key,cv); return cv;
  }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame};
})();
