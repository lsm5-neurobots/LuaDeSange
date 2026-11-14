/* ===== RECRUTA_BASE: esqueleto/poses/partes comuns dos recrutas (derivado do Vigia) ===== */
const RECRUTA_BASE=(function(){
  const {rad,ramp,lp,lerp,P2,ik,mkPen,compose}=PIX;
  const SKINS={media:{nome:'Pele média',hex:'#c08458'}, escura:{nome:'Pele escura',hex:'#7e4f32'}, clara:{nome:'Pele clara',hex:'#e6b28a'}};
  const th=(p,o)=>4+18*Math.sin(p+o), sh=(p,o)=>th(p,o)-26*Math.max(0,Math.cos(p+o));
  function make(cfg){
    const FW=cfg.FW||150, FH=cfg.FH||160, GROUND=cfg.GROUND||152, AX=cfg.AX||60;
    const REST=Object.assign({hx:0,lean:-2,head:0,aFs:4,aFe:14,aBs:-8,aBe:6,lFh:4,lFk:-2,lBh:-6,lBk:-8,bat:-10,inhand:0,mouth:0,brow:0,smear:0,sa:0,flash:0,happy:0,crouch:0},cfg.rest||{});
    const GUARD=Object.assign({inhand:1,aFs:24,aFe:72,bat:58,aBs:28,aBe:84,lean:4,brow:1},cfg.guard||{});
    const ANIMS={
      idle:{nome:'Parado',n:6,dur:()=>160,pose:i=>{ const p=i/6*Math.PI*2, s=Math.sin(p); return Object.assign({lean:REST.lean+0.8*s, head:0.8*Math.sin(p-0.7), aFs:REST.aFs+1.5*s, aFe:REST.aFe+2*s, aBs:REST.aBs+1.5*s, aBe:REST.aBe+2*s},cfg.idleExtra?cfg.idleExtra(i):{}); }},
      walk:{nome:'Andar',n:8,dur:()=>115,pose:i=>{ const p=i/8*Math.PI*2;
        return {lFh:th(p,0), lFk:sh(p,0), lBh:th(p,Math.PI), lBk:sh(p,Math.PI), aFs:REST.aFs-14*Math.sin(p), aFe:REST.aFe+6-14*Math.sin(p), aBs:REST.aBs+2+14*Math.sin(p), aBe:REST.aBe+14*Math.sin(p), lean:REST.lean+1.2*Math.sin(2*p), head:Math.sin(2*p-0.6), swing:Math.sin(p)}; }},
      guard:{nome:'Guarda (ferramenta na mão)',n:6,dur:()=>130,pose:i=>{ const p=i/6*Math.PI*2, s=Math.sin(p); return Object.assign({},GUARD,{lean:GUARD.lean+1.2*s, aFs:GUARD.aFs+3*s, aFe:GUARD.aFe+4*s, aBs:GUARD.aBs+2*s, lFh:12, lFk:2, lBh:-12, lBk:-18, head:-2+s}); }},
      combo:{nome:cfg.comboName||'Combo de 3 golpes',n:12,hits:{2:1,6:2,10:3},dur:i=>[120,50,60,90,90,40,60,90,130,40,70,170][i],pose:i=>Object.assign({},GUARD,[
        {aFs:-50,aFe:-10,bat:150,lean:-8,head:-4,hx:-3,lFh:10,lBh:-14,lBk:-18,mouth:3},
        {aFs:-30,aFe:30,bat:120,lean:-6,hx:-2,lFh:12,lBh:-14,lBk:-18,mouth:3},
        {aFs:86,aFe:92,bat:0,lean:10,hx:6,mouth:1,smear:1,sa:200,lFh:22,lFk:6,lBh:-18,lBk:-26},
        {aFs:100,aFe:112,bat:-6,lean:12,hx:7,mouth:1,lFh:22,lFk:6,lBh:-18,lBk:-26},
        {aFs:60,aFe:150,bat:40,lean:4,hx:4,lFh:16,lBh:-14,lBk:-20},
        {aFs:20,aFe:40,bat:-50,lean:2,hx:3,lFh:16,lBh:-14,lBk:-20},
        {aFs:120,aFe:150,bat:20,lean:-4,hx:6,mouth:1,smear:2,sa:10,lFh:18,lFk:4,lBh:-16,lBk:-22},
        {aFs:140,aFe:170,bat:10,lean:-6,hx:6,mouth:1,lFh:18,lFk:4,lBh:-16,lBk:-22},
        {aFs:170,aFe:190,bat:10,lean:-10,hx:3,lFh:8,lBh:-10,lBk:-14,mouth:3},
        {aFs:150,aFe:160,bat:20,lean:-8,hx:4,lFh:8,lBh:-10,lBk:-14,mouth:3},
        {aFs:70,aFe:80,bat:20,lean:22,hx:10,mouth:2,smear:3,sa:200,impact:1,lFh:28,lFk:10,lBh:-22,lBk:-32},
        {aFs:60,aFe:70,bat:30,lean:20,hx:9,mouth:1,lFh:28,lFk:10,lBh:-22,lBk:-32}][i])},
      special:Object.assign({nome:cfg.specialName},cfg.special(GUARD)),
      hurt:{nome:'Dano',n:4,dur:i=>[80,110,130,160][i],pose:i=>Object.assign({},GUARD,[
        {lean:-14,head:-16,hx:-6,flash:1,aFs:-10,aFe:20,bat:90,aBs:-30,aBe:-10,mouth:4,brow:2,lFh:14,lBh:-4},
        {lean:-10,head:-12,hx:-5,aFs:0,aFe:30,bat:80,aBs:-20,aBe:0,mouth:4,brow:2,lFh:12,lBh:-6},
        {lean:-4,head:-4,hx:-2,aFs:14,aFe:50,mouth:0},
        {}][i])},
    };
    function poseOf(anim,i){ return Object.assign({},REST,ANIMS[anim].pose(i)); }
    function skeleton(P,tool){
      const hip={x:AX+P.hx,y:76+(P.crouch||0)};
      const hipF={x:hip.x-3,y:hip.y}, hipB={x:hip.x+3,y:hip.y};
      const kneeF=lp(hipF,P.lFh,22), ankleF=lp(kneeF,P.lFk,22), kneeB=lp(hipB,P.lBh,22), ankleB=lp(kneeB,P.lBk,22);
      const dy=GROUND-Math.max(ankleF.y+5.5, ankleB.y+5.5);
      [hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB].forEach(p=>p.y+=dy);
      const a=rad(P.lean), c=Math.cos(a), s=Math.sin(a);
      const T=(lx,ly)=>({x:hip.x+lx*c-ly*s, y:hip.y+lx*s+ly*c});
      const S=cfg.sh||{fx:6,fy:-29,bx:-4,by:-30,nx:1,ny:-33};
      const neck=T(S.nx,S.ny), shF=T(S.bx,S.fy), shB=T(S.fx,S.by);
      const ha=rad(P.lean+P.head), hc=Math.cos(ha), hs=Math.sin(ha);
      const H=(lx,ly)=>({x:neck.x+lx*hc-ly*hs, y:neck.y+lx*hs+ly*hc});
      const L1=cfg.arm1||14, L2=cfg.arm2||13;
      const elF=lp(shF,P.aFs,L1), wrF=lp(elF,P.aFe,L2);
      let elB=lp(shB,P.aBs,L1), wrB=lp(elB,P.aBe,L2);
      const bAngDeg=P.aFe+P.bat; const bDir=Math.atan2(Math.cos(rad(bAngDeg)),Math.sin(rad(bAngDeg)));
      if(P.inhand && P.two && tool && cfg.tools[tool].twoHand){ const d=-6.5; const tgt={x:wrF.x+Math.cos(bDir)*d, y:wrF.y+Math.sin(bDir)*d}; const r=ik(shB,tgt,L1,L2,true); elB=r.E; wrB=r.W; }
      if(P.backTarget){ const r=ik(shB,T(P.backTarget[0],P.backTarget[1]),L1,L2,true); elB=r.E; wrB=r.W; }
      return {hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,neck,shF,shB,elF,wrF,elB,wrB,a,ha,H,T,bDir,L1,L2};
    }
    function fist(p,M,el,wr,glove){ const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y); const G=glove||M.skin; p.F(G[1]); p.ell(1.6,0,3.9,3.7); p.F(G[2]); p.rect(2.4,-2.4,0.9,4.8); p.F(G[1]); p.ell(0.4,-3.2,1.6,1.2); p.id(); }
    function drawArm(p,M,sk,front,P){
      const sh=front?sk.shF:sk.shB, el=front?sk.elF:sk.elB, wr=front?sk.wrF:sk.wrB, A=cfg.arm||{};
      p.id();
      const w1=A.w1||8, w2=A.w2||7;
      p.F(M.skin[1]); p.cap(sh,el,w1-1,w1-2); p.cap(el,wr,w2-1.6,w2-2.4);
      p.F(M[A.sleeve||'shirt'][1]); p.cap(sh,lerp(sh,el,A.sleeveTo==null?0.95:A.sleeveTo),w1,w1-0.6);
      if(A.roll){ p.F(M[A.sleeve||'shirt'][0]); const r=lerp(sh,el,A.sleeveTo==null?0.95:A.sleeveTo); p.circle(r,w1/2-0.2); }
      if(A.glove){ p.F(M[A.glove][1]); p.cap(lerp(el,wr,0.55),wr,w2,w2-0.4); p.F(M[A.glove][0]); p.circle(lerp(el,wr,0.56),w2/2-0.6); }
      if(A.extra) A.extra(p,M,sh,el,wr,front,P);
      fist(p,M,el,wr,A.glove?M[A.glove]:null);
    }
    function drawLeg(p,M,sk,front){
      const hip=front?sk.hipF:sk.hipB, knee=front?sk.kneeF:sk.kneeB, ankle=front?sk.ankleF:sk.ankleB, L=cfg.leg||{};
      p.id();
      p.F(M[L.pants||'pants'][1]); p.cap(hip,knee,L.w1||10,L.w2||8.6); p.cap(knee,ankle,L.w2||8.6,L.w3||8);
      if(front && L.crease){ p.F(M[L.pants||'pants'][0]); p.cap(lerp(hip,knee,0.1),lerp(knee,ankle,0.6),0.9,0.9); }
      if(front && L.patch){ p.F(M[L.patch][1]); p.ell(knee.x+0.6,knee.y,3.2,2.8); p.F(M[L.patch][3]); p.rect(knee.x-2,knee.y-2.4,0.8,0.8); p.rect(knee.x+2,knee.y+1.6,0.8,0.8); }
      if(L.extra) L.extra(p,M,hip,knee,ankle,front);
      const a=ankle, B=M[L.boot||'boot'];
      p.F(B[1]); p.cap(lerp(knee,ankle,L.cano||0.6),a,9.2,9);
      p.poly([[a.x-4.6,a.y-3],[a.x+4,a.y-3],[a.x+9.6,a.y+0.6],[a.x+10.4,a.y+3.6],[a.x-5,a.y+3.6]]);
      p.F(M[L.sole||'sole'][1]); p.rect(a.x-5.2,a.y+3.4,15.8,2);
      p.F(B[0]); p.rect(a.x+4.6,a.y-0.4,3,1);
      if(L.toe){ p.F(M[L.toe][1]); p.rect(a.x+7.4,a.y+0.6,2.6,2.8); }
      if(L.lace){ p.F(M[L.lace][1]); const k=lerp(knee,ankle,0.72); [0,1,2].forEach(j=>{ const q=lerp(k,a,j*0.3); p.rect(q.x+2,q.y-1,1.6,0.9); }); }
    }
    function drawHeadBase(p,M,sk,P){
      const Hc=cfg.head||{};
      p.xf(sk.ha,sk.neck.x,sk.neck.y);
      p.F(M.skin[1]); p.cap(P2(0,3),P2(1,-6),Hc.neck||8.4,(Hc.neck||8.4)-0.8);
      p.F(M.skin[2]); p.rect(3,-4,1,5);
      p.F(M.skin[1]); p.ell(-4.4,-12.6,2.4,3.4); p.ell(2.4,-14,9.6,9.6);
      p.poly([[-2,-8],[10.6,-9.4],[12.4,-5],[9.4,-1.2],[2,-1]]);
      p.F(M.skin[3]); p.ell(-4.4,-12.6,1,2);
      if(Hc.hair) Hc.hair(p,M,P);
      // olho
      if(P.happy){ p.F(M.hair[2]); p.poly([[5,-13],[7,-15.4],[9,-13],[8,-12.6],[7,-14],[6,-12.6]]); }
      else { p.F(M.eye[1]); p.ell(7,-13.6,2.5,2.1); p.F(M.iris[1]); p.rect(7.6,-14.6,1.6,2.2); p.F(M.eye[0]); p.rect(8,-14.6,0.8,0.8); }
      p.F(M.skin[2]); p.ell(11.6,-13.8,1.2,1.8);
      p.F(M.hair[2]);
      if(P.brow===1||P.mouth===3) p.poly([[3.6,-18.4],[10,-16.2],[10,-14.6],[3.6,-16.4]]);
      else if(P.brow===2) p.poly([[3.6,-19.4],[10,-19.4],[10,-17.6],[3.6,-17.6]]);
      else p.poly([[3.6,-17.6],[10,-17],[10,-15.4],[3.6,-15.8]]);
      p.F(M.skin[1]); p.poly([[10,-14],[14.4,-9.4],[10.4,-8.8]]);
      if(Hc.noseTip){ p.F(M.nose?M.nose[1]:M.skin[0]); p.ell(13,-10,1.4,1.2); }
      p.F(M.skin[2]); p.rect(9.6,-9.4,1,2.6);
      // boca
      if(P.mouth===2||P.mouth===4){ p.F(M.mouth[1]); p.poly([[7,-7.6],[12.4,-7.8],[12,-2.6],[7.6,-3]]); p.F(M.teeth[1]); p.rect(7.6,-7.6,4.4,1.2); if(P.mouth===2) p.rect(8,-3.8,3.6,1); }
      else if(P.mouth===1){ p.F(M.mouth[1]); p.poly([[7.4,-7.2],[12.2,-7.4],[11.8,-4.4],[7.8,-4.6]]); p.F(M.teeth[1]); p.rect(7.8,-7.2,4,1.2); }
      else if(P.mouth===3){ p.F(M.teeth[1]); p.rect(7.6,-6.8,4.4,1.8); p.F(M.mouth[2]); p.rect(8.6,-6.8,0.6,1.8); p.rect(10.4,-6.8,0.6,1.8); }
      else if(P.happy){ p.F(M.mouth[2]); p.poly([[7.6,-6.6],[12,-6.8],[11,-5],[8.4,-5]]); }
      else { p.F(M.mouth[2]); p.rect(8,-6.2,3.8,0.9); }
      if(Hc.face) Hc.face(p,M,P);
      if(Hc.hat) Hc.hat(p,M,P);
      p.id();
    }
    function drawSmear(p,M,sk,P,tool){
      p.id(); p.F(M.smear[1]);
      const len=cfg.tools[tool].len, tip=lp(sk.wrF,P.aFe+P.bat,len), sh=sk.shF;
      const cur=Math.atan2(tip.x-sh.x,tip.y-sh.y)*180/Math.PI, r1=Math.hypot(tip.x-sh.x,tip.y-sh.y)+4, r0=r1-12;
      const n=10, pts=[];
      for(let k=0;k<=n;k++){ const a=P.sa+(cur-P.sa)*k/n; pts.push([sh.x+Math.sin(rad(a))*r1, sh.y+Math.cos(rad(a))*r1]); }
      for(let k=n;k>=0;k--){ const a=P.sa+(cur-P.sa)*k/n, rr=r0+(r1-r0)*(1-k/n)*0.6; pts.push([sh.x+Math.sin(rad(a))*rr, sh.y+Math.cos(rad(a))*rr]); }
      p.poly(pts);
    }
    const cache=new Map();
    const BASEM={eye:['#ffffff','#f2efe6','#b8b4a8','#6e6a60'], iris:['#8a5a3a','#4a2a18','#2a180e','#140a06'], mouth:['#8a3444','#4a1828','#2a0c18','#1a0610'], teeth:['#fffbe8','#e8e0c0','#b0a680','#6a6040'], smear:['#ffffff','#fff6d0','#e8d8a0','#b8a870']};
    function mats(skin){ return Object.assign({skin:ramp(SKINS[skin].hex)},BASEM,cfg.mats()); }
    function frame(skin,tool,anim,fi,step=5){
      const K=PIX.getK(), t=tool||cfg.toolFor(anim), key=skin+t+anim+fi+step+'@'+K; if(cache.has(key)) return cache.get(key);
      const P=poseOf(anim,fi); P.tool=t; const M=mats(skin), sk=skeleton(P,t), TL=cfg.tools[t];
      const toolPart={draw:(c,u)=>{ const p=mkPen(c,u); if(P.inhand) TL.draw(p,M,sk.wrF,sk.bDir,P); else if(cfg.toolRest) cfg.toolRest(p,M,sk,P,t); }};
      const parts=[
        {back:true, draw:(c,u)=>drawArm(mkPen(c,u),M,sk,false,P)},
        {back:true, draw:(c,u)=>drawLeg(mkPen(c,u),M,sk,false)},
      ];
      if(cfg.behind) parts.push({draw:(c,u)=>cfg.behind(mkPen(c,u),M,sk,P)});
      parts.push({draw:(c,u)=>cfg.drawTorso(mkPen(c,u),M,sk,P)});
      parts.push({draw:(c,u)=>drawLeg(mkPen(c,u),M,sk,true)});
      if(cfg.overLegs) parts.push({draw:(c,u)=>cfg.overLegs(mkPen(c,u),M,sk,P)});
      parts.push({draw:(c,u)=>drawHeadBase(mkPen(c,u),M,sk,P)});
      if(P.inhand && P.toolBehindHead) parts.splice(2,0,toolPart); else parts.push(toolPart);
      if(P.smear) parts.push({noShade:true,smear:true,draw:(c,u)=>drawSmear(mkPen(c,u),M,sk,P,t)});
      parts.push({draw:(c,u)=>drawArm(mkPen(c,u),M,sk,true,P)});
      if(P.inhand){ parts.push({draw:(c,u)=>{ const p=mkPen(c,u); fist(p,M,sk.elF,sk.wrF,cfg.arm&&cfg.arm.glove?M[cfg.arm.glove]:null); if(P.two&&TL.twoHand) fist(p,M,sk.elB,sk.wrB,cfg.arm&&cfg.arm.glove?M[cfg.arm.glove]:null); }}); }
      if(cfg.front) parts.push({draw:(c,u)=>cfg.front(mkPen(c,u),M,sk,P)});
      const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:cfg.rim||'#a9c8f0'});
      const tip=lp(sk.wrF,P.aFe+P.bat,TL.len);
      const sc=q=>({x:q.x*K,y:q.y*K}); cv._tip=sc(tip); cv._hand=sc(sk.wrF); cv._handB=sc(sk.wrB); cv._head=sc(sk.H(4,-30)); cv._hip=sc(sk.hip); cv._mouth=sc(sk.H(16,-5));
      cache.set(key,cv); return cv;
    }
    return {FW,FH,GROUND,AX,SKINS,ANIMS,poseOf,frame,mats,tools:cfg.tools,toolFor:cfg.toolFor,FX:cfg.FX||{},NAMES:cfg.NAMES||{}};
  }
  return {make,SKINS};
})();
