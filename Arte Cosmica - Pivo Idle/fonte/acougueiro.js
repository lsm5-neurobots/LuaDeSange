/* ===== O AÇOUGUEIRO (chefe B01): hi-bit ===== */
const ACOU=(function(){
  const {rad,ramp,lp,lerp,P2,mkPen,compose}=PIX;
  const FW=230, FH=260, GROUND=252, AX=96;
  const RIM={normal:'#ffc8c0', furia:'#ff7050'};
  function mats(form){
    const m={
      skin:['#ffe6dc','#e8b4a8','#b07a7a','#6a4450'],
      scar:['#c87a7a','#8a4a52','#5a2e38','#341a22'],
      mask:['#8a6448','#5a3e2a','#3a2618','#20140c'],
      silver:['#ffffff','#c8ccd4','#8a8ea0','#4a4e60'],
      apron:['#a8784a','#7a5232','#523620','#301e12'],
      blood:['#9a3a2a','#6a2218','#46140e','#280a06'],
      iron:['#c8c8d4','#8a8a9a','#5a5a6a','#34343e'],
      steel:['#f4f6fc','#bcc0cc','#7e8292','#464a5a'],
      wood:['#b08060','#7a5236','#4e321e','#2c1c10'],
      pants:['#5a5a64','#34343e','#22222a','#121216'],
      boot:['#ffffff','#e4e4de','#aaaaa2','#6a6a62'],
      eye:['#ffd8c8','#ff3a2a','#a01010','#500808'],
      teeth:['#fff4c8','#e0cc8a','#a8904e','#665628'],
      mouth:['#6a2434','#401424','#2a0c18','#1a0610'],
      hair:['#4a3a34','#2a201c','#1a1412','#0e0a08'],
    };
    if(form==='furia'){ m.skin=['#ffb0a0','#e85a52','#a02a38','#5a1020']; m.scar=['#ff9a8a','#c83a3a','#7a1420','#420810']; m.eye=['#fffbe0','#ffe24a','#ff7a1a','#c2400a']; }
    return m;
  }
  const NAMES={skin:'Pele',scar:'Cicatriz',mask:'Máscara',apron:'Avental',blood:'Sangue seco',steel:'Cutelo',iron:'Corrente/gancho',pants:'Calça de lona',boot:'Bota de borracha',eye:'Olho'};
  const REST={hx:0,lean:6,head:4,aFs:34,aFe:168,cl:28,aBs:-12,aBe:-6,lFh:10,lFk:2,lBh:-10,lBk:-14,hook:0,smear:0,flash:0,roar:0,impact:0};
  const ANIMS={
    idle:{nome:'Parado',n:6,dur:()=>190,pose:i=>{ const p=i/6*Math.PI*2, s=Math.sin(p); return {lean:6+1.6*s, head:4+2*Math.sin(p-0.7), aFs:34+2*s, aFe:168+3*s, aBs:-12+2*s, aBe:-6+2*s}; }},
    walk:{nome:'Andar (passo que treme)',n:8,stomp:[0,4],dur:()=>170,pose:i=>{ const p=i/8*Math.PI*2; const lFh=10+16*Math.sin(p), lBh=-10+16*Math.sin(p+Math.PI);
      return {lFh, lFk:lFh-18*Math.max(0,Math.cos(p)), lBh, lBk:lBh-4-18*Math.max(0,Math.cos(p+Math.PI)), lean:8+2*Math.abs(Math.sin(p)), head:4+2*Math.sin(2*p), aFs:34-5*Math.sin(p), aFe:168-5*Math.sin(p), aBs:-12+8*Math.sin(p), aBe:-6+8*Math.sin(p), hx:Math.round(2*Math.sin(2*p))}; }},
    attack:{nome:'Pancada (área)',n:9,warn:[1,2],hit:4,vuln:[5,6,7],dur:i=>[200,250,250,60,120,200,200,200,160][i],pose:i=>[
      {aFs:90,aFe:120,cl:-60,lean:0,head:-4,lFh:14,lBh:-14},
      {aFs:170,aFe:182,cl:-20,lean:-10,head:-14,hx:-4,lFh:18,lBh:-18,lBk:-22,roar:1},
      {aFs:176,aFe:190,cl:-14,lean:-12,head:-16,hx:-5,lFh:18,lBh:-18,lBk:-22,roar:1},
      {aFs:110,aFe:120,cl:-40,lean:20,head:8,hx:8,smear:1,lFh:30,lFk:10,lBh:-24,lBk:-32},
      {aFs:70,aFe:80,cl:-60,lean:32,head:14,hx:12,impact:1,lFh:32,lFk:14,lBh:-26,lBk:-34},
      {aFs:66,aFe:76,cl:-62,lean:34,head:20,hx:12,lFh:32,lFk:14,lBh:-26,lBk:-34},
      {aFs:66,aFe:76,cl:-62,lean:33,head:18,hx:12,lFh:32,lFk:14,lBh:-26,lBk:-34},
      {aFs:66,aFe:76,cl:-62,lean:32,head:16,hx:11,lFh:32,lFk:14,lBh:-26,lBk:-34},
      {aFs:40,aFe:50,cl:-70,lean:16,head:8,hx:5,lFh:20,lBh:-18}][i]},
    hook:{nome:'Gancho de corrente',n:7,throwAt:2,dur:i=>[180,140,80,160,160,140,140][i],pose:i=>[
      {aBs:-60,aBe:-40,lean:-2,head:-4,hook:0},
      {aBs:-100,aBe:-120,lean:-6,head:-6,hook:0,lBh:-16},
      {aBs:60,aBe:80,lean:12,head:4,hook:0.55,hx:4,lFh:20,lFk:6,lBh:-18,lBk:-24},
      {aBs:80,aBe:90,lean:14,head:6,hook:1,hx:5,lFh:20,lFk:6,lBh:-18,lBk:-24},
      {aBs:60,aBe:60,lean:8,head:2,hook:0.7,hx:3},
      {aBs:30,aBe:20,lean:6,head:2,hook:0.3,hx:1},
      {aBs:-4,aBe:0,lean:6,head:4,hook:0}][i]},
    rage:{nome:'Entrar em fúria',n:6,dur:i=>[200,160,260,260,200,200][i],pose:i=>[
      {lean:14,head:20,aFs:10,aFe:10,aBs:6,aBe:10},
      {lean:-14,head:-24,aFs:120,aFe:150,cl:-30,aBs:-120,aBe:-150,roar:2,hx:-3,lFh:20,lBh:-20},
      {lean:-16,head:-28,aFs:130,aFe:160,cl:-30,aBs:-130,aBe:-160,roar:2,hx:-4,lFh:20,lBh:-20},
      {lean:-15,head:-26,aFs:126,aFe:156,cl:-30,aBs:-126,aBe:-156,roar:2,hx:-3,lFh:20,lBh:-20},
      {lean:0,head:-6,aFs:60,aFe:70,roar:1},
      {}][i]},
    hurt:{nome:'Dano',n:4,dur:i=>[80,110,130,160][i],pose:i=>[
      {lean:-8,head:-16,hx:-6,flash:1,aFs:-10,aFe:0,aBs:-30,aBe:-20,roar:1},
      {lean:-5,head:-12,hx:-4,aFs:0,aFe:10,aBs:-24,aBe:-14},
      {lean:2,head:-2,hx:-1},
      {}][i]},
  };
  function poseOf(anim,i){ return Object.assign({},REST,ANIMS[anim].pose(i)); }
  function skeleton(P){
    const hip={x:AX+P.hx,y:110};
    const hipF={x:hip.x+7,y:hip.y}, hipB={x:hip.x-7,y:hip.y};
    const kneeF=lp(hipF,P.lFh,30), ankleF=lp(kneeF,P.lFk,30), kneeB=lp(hipB,P.lBh,30), ankleB=lp(kneeB,P.lBk,30);
    const dy=GROUND-Math.max(ankleF.y+7, ankleB.y+7);
    [hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB].forEach(p=>p.y+=dy);
    const a=rad(P.lean), c=Math.cos(a), s=Math.sin(a);
    const T=(lx,ly)=>({x:hip.x+lx*c-ly*s, y:hip.y+lx*s+ly*c});
    const neck=T(4,-52), shF=T(14,-44), shB=T(-10,-46);
    const ha=rad(P.lean+P.head), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:neck.x+lx*hc-ly*hs, y:neck.y+lx*hs+ly*hc});
    const elF=lp(shF,P.aFs,24), wrF=lp(elF,P.aFe,22), elB=lp(shB,P.aBs,24), wrB=lp(elB,P.aBe,22);
    const cAng=P.aFe+P.cl; const cDir=Math.atan2(Math.cos(rad(cAng)),Math.sin(rad(cAng)));
    return {hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,neck,shF,shB,elF,wrF,elB,wrB,a,ha,H,T,cDir,eye:H(9,-15)};
  }
  function drawArm(p,M,sh,el,wr,front){
    p.id();
    p.F(M.skin[1]); p.ell(sh.x,sh.y+2,12,10); p.cap(sh,el,17,15); p.cap(el,wr,15,12.5);
    p.F(M.scar[2]); const m=lerp(sh,el,0.5); p.rect(m.x-4,m.y-1,8,1.2); [-3,0,3].forEach(o=>p.rect(m.x+o,m.y-2.2,0.9,3.4));
    p.F(M.blood[1]); const b=lerp(el,wr,0.6); p.ell(b.x,b.y,3.2,2.2);
    p.F(M.skin[1]); p.circle(wr,7.4); p.F(M.skin[2]); p.rect(wr.x-1,wr.y-5,1.2,10);
  }
  function drawLeg(p,M,hip,knee,ankle,front){
    p.id();
    p.F(M.pants[1]); p.cap(hip,knee,20,18); p.cap(knee,ankle,17,15);
    if(front){ p.F(M.pants[0]); p.cap(lerp(hip,knee,0.15),lerp(hip,knee,0.85),1.2,1.2); }
    p.F(M.boot[1]); p.cap(lerp(knee,ankle,0.35),ankle,18,17);
    const a=ankle; p.poly([[a.x-9,a.y-5],[a.x+8,a.y-5],[a.x+18,a.y+1],[a.x+19,a.y+7],[a.x-9.4,a.y+7]]);
    p.F(M.boot[3]); p.rect(a.x-9.4,a.y+5.6,28.4,1.8);
    p.F(M.blood[1]); [[0,-14,4,2],[5,-6,3,2],[-5,-2,2.4,1.6],[12,2,3,1.4],[-2,-22,2,1.6]].forEach(([x,y,rx,ry])=>p.ell(a.x+x,a.y+y,rx,ry));
  }
  function drawChainPath(p,M,pts){
    let alt=0;
    for(let s=0;s<pts.length-1;s++){ const a=pts[s], b=pts[s+1], L=Math.hypot(b.x-a.x,b.y-a.y), n=Math.max(1,Math.floor(L/4)), ang=Math.atan2(b.y-a.y,b.x-a.x);
      for(let k=0;k<n;k++){ const q=lerp(a,b,k/n); p.F(M.iron[alt%2?2:1]); if(alt%2) p.ell(q.x,q.y,2.6,1,ang); else p.ell(q.x,q.y,2.4,1.8,ang); alt++; } }
  }
  function drawHook(p,M,at,ang){
    p.xf(ang,at.x,at.y); p.F(M.iron[1]);
    p.cap(P2(0,0),P2(5,0),2.4,2.4); p.cap(P2(5,0),P2(9,3),2.2,2.2); p.cap(P2(9,3),P2(8,8),2,2); p.cap(P2(8,8),P2(4,9),1.8,1.6); p.poly([[3,9.6],[5,8],[2,7.4]]);
    p.F(M.blood[1]); p.rect(7,6,1.6,2); p.id();
  }
  function drawChain(p,M,sk,P){
    p.id(); const w=sk.wrB;
    if(P.hook>0){ const tip={x:w.x+P.hook*110, y:w.y+8+P.hook*18}; const mid={x:(w.x+tip.x)/2, y:(w.y+tip.y)/2+6*(1-P.hook)};
      drawChainPath(p,M,[w,mid,tip]); drawHook(p,M,tip,0.2); }
    else { const g={x:w.x-26,y:GROUND-3}, e={x:w.x-56,y:GROUND-3}; drawChainPath(p,M,[w,g,e]); drawHook(p,M,e,Math.PI); }
  }
  function drawTorso(p,M,sk){
    p.xf(sk.a,sk.hip.x,sk.hip.y);
    p.F(M.skin[1]); p.poly([[-16,-4],[-22,-26],[-18,-44],[-6,-54],[12,-56],[24,-48],[28,-36]]); p.ell(12,-18,31,29);
    p.F(M.skin[2]); p.rect(-6,-46,12,1.2); p.rect(2,-40,1,8);
    // avental
    p.F(M.apron[1]); p.poly([[-6,-42],[20,-44],[36,-28],[42,-8],[40,10],[30,19],[-8,19],[-15,0],[-13,-26]]);
    p.F(M.apron[2]); p.rect(-2,-40,1.2,57); p.rect(16,-38,1,50); p.F(M.apron[0]); p.rect(26,-30,1.2,34);
    p.F(M.apron[3]); p.poly([[-4,-40],[-2,-52],[2,-52],[0,-40]]); p.poly([[14,-42],[14,-54],[18,-54],[18,-42]]);
    p.F(M.blood[1]); p.poly([[6,-26],[18,-24],[16,-16],[12,-8],[10,-16],[6,-14]]); p.poly([[26,-12],[34,-8],[32,4],[28,14],[26,2]]); p.poly([[0,0],[12,2],[10,8],[2,9]]);
    p.F(M.blood[2]); p.rect(12,-12,1.4,12); p.rect(29,6,1.4,10); p.rect(5,8,1.2,9); p.rect(17,-18,1,6);
    // correntes cruzadas + ganchos
    p.id();
    drawChainPath(p,M,[sk.T(-12,-46),sk.T(8,-28),sk.T(26,-8)]); drawChainPath(p,M,[sk.T(20,-48),sk.T(4,-26),sk.T(-12,-6)]);
    drawHook(p,M,sk.T(8,-28),Math.PI/2+sk.a); drawHook(p,M,sk.T(-6,-14),Math.PI/2+sk.a);
  }
  function drawHead(p,M,sk,form,P){
    p.xf(sk.ha,sk.neck.x,sk.neck.y);
    p.F(M.skin[1]); p.cap(P2(0,6),P2(2,-6),18,16);
    p.ell(-6,-13,3,4); p.ell(3,-15,12,11.4);
    p.poly([[-4,-8],[14,-10],[16,-4],[12,2],[0,3]]);
    p.F(M.skin[3]); p.ell(-6,-13,1.2,2.2);
    p.F(M.scar[2]); p.cap(P2(-8,-20),P2(10,-25),1.4,1.4); [-5,-1,3,7].forEach((x,k)=>p.rect(x,-22.6-k*1.1,0.9,3)); p.cap(P2(0,-26),P2(6,-12),1.2,1.2); [[2,-21],[4,-16]].forEach(([x,y])=>p.rect(x-1.4,y,3,0.9));
    p.F(M.hair[2]); p.poly([[3,-19.4],[14,-18.4],[14,-16],[3,-16.6]]);
    p.F(M.skin[3]); p.ell(10,-14.4,2.6,2); p.F(M.eye[1]); p.ell(10.4,-14.4,1.6,1.3); p.F(M.eye[0]); p.rect(10.6,-15,0.8,0.8);
    p.F(M.skin[1]); p.poly([[13,-14],[17,-9],[13.4,-8.4]]);
    // máscara de couro
    if(form==='furia' && P.roar>=0){ p.F(M.mouth[1]); p.poly([[3,-8.6],[16.4,-9.4],[16.6,-2],[4,-1]]); p.F(M.teeth[1]); for(let k=0;k<5;k++){ p.rect(5+k*2.3,-8.8,1.6,2.6); p.rect(5.6+k*2.3,-4.6,1.6,2.4); }
      p.F(M.mask[1]); p.poly([[2,-9],[8,-9.6],[6,-6],[7,-1],[2,0]]); p.poly([[14,-9.8],[17,-9.6],[17,-5],[15,-6]]); p.F(M.mask[3]); p.rect(7.4,-8,0.9,6); }
    else { if(P.roar){ p.F(M.mouth[1]); p.rect(12,-2.4,4,2); }
      p.F(M.mask[1]); p.poly([[2,-9],[16.4,-9.8],[16.8,-1.6],[3,-0.4]]); p.F(M.mask[0]); p.rect(4,-8.4,11,1); p.F(M.mask[3]); [5,8.6,12.2].forEach(x=>p.rect(x,-6.2,0.9,0.9)); p.rect(4,-4.4,12,0.8); }
    p.F(M.mask[2]); p.poly([[2,-7],[-8,-9],[-8,-6.6],[2,-4.6]]);
    p.F(M.silver[1]); p.rect(-5,-9.4,3,3.4); p.F(M.silver[3]); p.rect(-4,-8.4,1,1.4);
    p.id();
  }
  function drawCleaver(p,M,sk){
    const w=sk.wrF; p.xf(sk.cDir,w.x,w.y);
    p.F(M.wood[1]); p.cap(P2(-8,0),P2(12,0),6,6); p.F(M.wood[2]); [-4,1,6].forEach(x=>p.rect(x,-3,1,6)); p.F(M.silver[1]); [-6,9].forEach(x=>p.circle(P2(x,0),1.2));
    p.F(M.steel[1]); p.poly([[12,-7],[92,-9],[96,-5],[96,34],[88,40],[12,30]]);
    p.F(M.steel[0]); p.rect(14,-6,78,2.4); p.rect(18,-2,3,30);
    p.F(M.steel[2]); p.rect(14,26,78,2.4); p.rect(80,0,1.4,30);
    p.F(M.steel[3]); p.circle(P2(84,3),3.6);
    p.F(M.blood[1]); p.poly([[30,24],[52,26],[50,32],[44,31],[40,36],[36,30]]); p.poly([[64,28],[80,30],[76,36],[70,34]]); p.poly([[26,6],[34,4],[36,14],[30,12]]);
    p.F(M.blood[2]); p.rect(41,30,1.4,8); p.rect(73,33,1.2,6); p.rect(31,12,1,6);
    p.F(M.steel[3]); [[30,33],[58,35],[78,37]].forEach(([x,y])=>p.poly([[x-3,y+1],[x+3,y+1.4],[x,y-4]])); p.id();
  }
  function drawSmear(p,M,sk){
    p.id(); p.F(M.steel[0]); const s=sk.shF, r1=110, r0=74; const a0=190, a1=110, pts=[];
    for(let k=0;k<=10;k++){ const a=a0+(a1-a0)*k/10; pts.push([s.x+Math.sin(rad(a))*r1, s.y+Math.cos(rad(a))*r1]); }
    for(let k=10;k>=0;k--){ const a=a0+(a1-a0)*k/10, rr=r0+(r1-r0)*(1-k/10)*0.5; pts.push([s.x+Math.sin(rad(a))*rr, s.y+Math.cos(rad(a))*rr]); }
    p.poly(pts);
  }
  const cache=new Map();
  function frame(form,anim,fi,step=5){
    const K=PIX.getK(), key=form+anim+fi+step+'@'+K; if(cache.has(key)) return cache.get(key);
    const P=poseOf(anim,fi), M=mats(form), sk=skeleton(P);
    const parts=[
      {back:true, draw:(c,u)=>{ const p=mkPen(c,u); drawChain(p,M,sk,P); }},
      {back:true, draw:(c,u)=>drawArm(mkPen(c,u),M,sk.shB,sk.elB,sk.wrB,false)},
      {back:true, draw:(c,u)=>drawLeg(mkPen(c,u),M,sk.hipB,sk.kneeB,sk.ankleB,false)},
      {draw:(c,u)=>drawTorso(mkPen(c,u),M,sk)},
      {draw:(c,u)=>drawLeg(mkPen(c,u),M,sk.hipF,sk.kneeF,sk.ankleF,true)},
      {draw:(c,u)=>drawHead(mkPen(c,u),M,sk,form,P)},
      {draw:(c,u)=>drawCleaver(mkPen(c,u),M,sk)},
    ];
    if(P.smear) parts.push({noShade:true,smear:true,draw:(c,u)=>drawSmear(mkPen(c,u),M,sk)});
    parts.push({draw:(c,u)=>drawArm(mkPen(c,u),M,sk.shF,sk.elF,sk.wrF,true)});
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM[form]});
    const sc=q=>({x:q.x*K,y:q.y*K});
    const bladeTip={x:sk.wrF.x+Math.cos(sk.cDir)*80, y:sk.wrF.y+Math.sin(sk.cDir)*80};
    cv._eye=sc(sk.eye); cv._blade=sc(bladeTip); cv._back=sc(sk.T(-14,-40)); cv._head=sc(sk.H(4,-28)); cv._hook=sc({x:sk.wrB.x+P.hook*110,y:sk.wrB.y+8+P.hook*18});
    cache.set(key,cv); return cv;
  }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame};
})();
