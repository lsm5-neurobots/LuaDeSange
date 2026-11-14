/* CAPO — fonte de arte (editável). Build: npm run art */
/* Capoeirista hi-bit: ginga, martelo, meia-lua de frente, meia-lua de compasso, parafuso, aú.
   Mesmo rig/proporção do HEROI e do VIGIA (base de luta baixa, 7–8 tons por região, sombra roxa, luz quente, contorno de 2 px embaixo). */
const CAPO=(function(){
  /* ---- rig hi-bit (mesmo do HEROI/VIGIA: ombros largos, mãos/pés grandes, volume em 7 tons) ---- */
  const {rad,ramp,lp,lerp,P2,ik,mkPen,compose,mix}=PIX;
  const FW=216, FH=170, GROUND=164, AX=108, RIM='#a9c8f0', HS=1.12;
  function satb(h,k){ let [r,g,b]=PIX.hexRgb(h).map(v=>v/255); const mx=Math.max(r,g,b), mn=Math.min(r,g,b), l=(mx+mn)/2; let s=0,hh=0;
    if(mx!==mn){ const d=mx-mn; s=l>0.5?d/(2-mx-mn):d/(mx+mn); hh=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4; hh/=6; }
    s=Math.min(1,s*k); if(!s) return h; const q=l<0.5?l*(1+s):l+s-l*s, pp=2*l-q, fn=t=>{ t=(t+1)%1; return t<1/6?pp+(q-pp)*6*t:t<1/2?q:t<2/3?pp+(q-pp)*(2/3-t)*6:pp; };
    return PIX.toHex(fn(hh+1/3)*255,fn(hh)*255,fn(hh-1/3)*255); }
  // rampa principal (luz quente → sombra roxa) e rampa extra (ponto quente, meio-tom, sombra grande, borda funda)
  const R4=(h,k=1.18)=>{ const b=satb(h,k); return [mix(b,'#fff2cc',.36),b,mix(b,'#3b2c63',.48),mix(b,'#1c1233',.74)]; };
  const RX=(h,k=1.18)=>{ const b=satb(h,k); return [mix(b,'#fff2cc',.64),mix(b,'#ffe0a8',.17),mix(b,'#4a3470',.26),mix(b,'#100a20',.86)]; };
  const BASEM={eye:['#ffffff','#f4efe6','#b8b4a8','#6e6a60'], iris:['#8a5a3a','#4a2a18','#2a180e','#140a06'], mouth:['#b04a5a','#5a1c2c','#2a0c18','#1a0610'],
    teeth:['#fffbe8','#e8e0c0','#b0a680','#6a6040'], smear:['#ffffff','#fff6d0','#e8d8a0','#b8a870']};
  const S=Math.sin;
  const REST={hx:0,lean:-2,head:0,aFs:4,aFe:14,aBs:-8,aBe:6,lFh:4,lFk:-2,lBh:-6,lBk:-8,bat:-10,inhand:1,mouth:0,smear:0,sa:0,flash:0,impact:0,brow:0,rot:0,lift:0,blink:0,plant:1,tw:0,br:0,two:0,fx:0};
  // bA = ângulo absoluto da ferramenta (vira bat relativo ao antebraço)
  const K_=o=>{ const r=Object.assign({},o); if(r.bA!==undefined){ r.bat=r.bA-(r.aFe!==undefined?r.aFe:REST.aFe); delete r.bA; } return r; };
  const ST={lFh:52,lFk:8,lBh:-42,lBk:-46};
  const th=(p,o)=>6+24*Math.sin(p+o), shn=(p,o)=>th(p,o)-34*Math.max(0,Math.cos(p+o));
  // animações comuns (corrida, esquiva, danos, queda, levantar) no padrão do HEROI
  function commonAnims(GUARD,G,run){
    return {
      run:{nome:'Correr',n:8,dur:()=>72,pose:i=>{ const p=i/8*Math.PI*2, t=o=>12+46*S(p+o), k=o=>t(o)-18-76*Math.max(0,Math.cos(p+o));
        return Object.assign({},GUARD,K_(Object.assign({plant:0,two:0,lFh:t(0),lFk:k(0),lBh:t(Math.PI),lBk:k(Math.PI),lean:22+3*S(2*p),head:-14,lift:2+3*Math.abs(S(p)),aFs:30-48*S(p),aFe:96-36*S(p),bA:60-14*S(p),aBs:10+50*S(p),aBe:90+30*S(p),brow:1,mouth:1},run?run(p):{}))); }},
      roll:{nome:'Esquiva (rolamento)',n:6,dur:i=>[70,60,60,60,70,110][i],pose:i=>{
        const curl={lean:64,head:24,lFh:124,lFk:20,lBh:112,lBk:6,aFs:96,aFe:150,bA:96,aBs:80,aBe:140,plant:0,brow:1,two:0};
        return Object.assign({},GUARD,K_([
          {lean:34,head:8,hx:-4,lFh:50,lFk:-20,lBh:-10,lBk:-60,aFs:40,aFe:96,bA:110,aBs:40,aBe:100,brow:1,two:0},
          Object.assign({},curl,{rot:80,hx:0}), Object.assign({},curl,{rot:170,hx:4}),
          Object.assign({},curl,{rot:260,hx:8}), Object.assign({},curl,{rot:330,hx:11,lean:50}),
          {lean:22,hx:12,head:-2,lFh:70,lFk:-12,lBh:2,lBk:-90,aFs:30,aFe:80,bA:120,aBs:30,aBe:80,brow:1,two:0}][i])); }},
      hurt:{nome:'Dano',n:4,dur:i=>[80,110,130,160][i],pose:i=>G([
        {lean:-16,head:-16,hx:-6,flash:1,two:0,aFs:-14,aFe:24,bA:110,aBs:-36,aBe:-14,mouth:2,brow:2,lFh:18,lBh:-6,lBk:-12},
        {lean:-12,head:-12,hx:-5,two:0,aFs:-2,aFe:34,bA:110,aBs:-26,aBe:-4,mouth:2,brow:2,blink:1,lFh:18,lBh:-8,lBk:-16},
        {lean:-4,head:-4,hx:-2,two:0,aFs:16,aFe:56,bA:120,mouth:1,brow:2},
        {}][i])},
      hurtB:{nome:'Dano: cabeça pra trás',n:4,dur:i=>[80,110,130,150][i],pose:i=>G([
        {lean:-20,head:-30,hx:-7,flash:1,two:0,aFs:-34,aFe:-12,bA:100,aBs:-44,aBe:-24,mouth:2,brow:2,blink:1,lFh:22,lBh:-4,lBk:-10},
        {lean:-16,head:-24,hx:-6,two:0,aFs:-24,aFe:8,bA:110,aBs:-34,aBe:-14,mouth:2,brow:2,lFh:20,lBh:-6,lBk:-12},
        {lean:-6,head:-8,hx:-3,two:0,aFs:10,aFe:46,mouth:1,brow:2},{}][i])},
      fall:{nome:'Derrubado',n:7,dur:i=>[90,110,110,90,110,160,400][i],pose:i=>Object.assign({},GUARD,{two:0},K_([
        {lean:-26,head:-20,hx:-4,flash:1,lift:4,plant:0,mouth:2,brow:2,aFs:-40,aFe:-90,bA:160,aBs:-60,aBe:-120,lFh:30,lFk:10,lBh:-4,lBk:-20},
        {rot:-38,lean:-10,head:-14,hx:2,lift:20,plant:0,mouth:2,brow:2,blink:1,aFs:150,aFe:170,bA:200,aBs:170,aBe:200,lFh:50,lFk:30,lBh:30,lBk:10},
        {rot:-72,lean:-4,head:-10,hx:12,lift:12,plant:0,mouth:2,brow:2,blink:1,aFs:160,aFe:190,bA:220,aBs:180,aBe:210,lFh:40,lFk:40,lBh:20,lBk:20},
        {rot:-90,lean:0,head:-14,hx:22,plant:0,mouth:2,brow:2,blink:1,aFs:140,aFe:160,bA:190,aBs:170,aBe:200,lFh:30,lFk:40,lBh:14,lBk:24},
        {rot:-86,lean:-2,head:-6,hx:23,lift:4,plant:0,mouth:1,brow:2,blink:1,aFs:150,aFe:180,bA:200,aBs:176,aBe:210,lFh:24,lFk:30,lBh:10,lBk:16},
        {rot:-90,lean:0,head:-2,hx:24,plant:0,mouth:1,brow:2,blink:1,aFs:150,aFe:170,bA:150,aBs:180,aBe:200,lFh:16,lFk:16,lBh:8,lBk:6},
        {rot:-90,lean:0,head:0,hx:24,plant:0,mouth:0,brow:2,blink:1,aFs:146,aFe:166,bA:140,aBs:176,aBe:196,lFh:14,lFk:12,lBh:6,lBk:4}][i]))},
      getup:{nome:'Levantar',n:6,dur:i=>[140,130,130,120,110,120][i],pose:i=>Object.assign({},GUARD,K_([
        {rot:-90,hx:24,head:4,plant:0,brow:2,blink:1,two:0,aFs:146,aFe:166,bA:140,aBs:176,aBe:196,lFh:14,lFk:12,lBh:6,lBk:4},
        {lean:32,head:-6,hx:16,plant:0,brow:2,mouth:1,two:0,lFh:84,lFk:92,lBh:70,lBk:110,aFs:30,aFe:70,bA:100,aBs:-50,aBe:-30},
        {lean:24,head:-4,hx:10,brow:1,mouth:1,two:0,lFh:90,lFk:-14,lBh:6,lBk:-96,aFs:40,aFe:80,bA:110,aBs:20,aBe:50},
        {lean:20,head:-4,hx:6,brow:1,two:0,lFh:54,lFk:-8,lBh:-28,lBk:-62,aFs:30,aFe:80,bA:120,aBs:30,aBe:80},
        {lean:10,hx:2},
        {}][i]))},
    };
  }
  /* ---- esqueleto ---- */
  function legIK(H,A,L1,L2){
    const dx=A.x-H.x, dy=A.y-H.y, d=Math.max(Math.abs(L1-L2)+0.5,Math.min(L1+L2-0.05,Math.hypot(dx,dy)));
    const b=Math.atan2(dy,dx), q=Math.acos(Math.max(-1,Math.min(1,(L1*L1+d*d-L2*L2)/(2*L1*d))));
    const k1={x:H.x+Math.cos(b-q)*L1,y:H.y+Math.sin(b-q)*L1}, k2={x:H.x+Math.cos(b+q)*L1,y:H.y+Math.sin(b+q)*L1};
    return k1.x>k2.x?k1:k2;
  }
  // B = {f (corpo feminino), FOOT, grip (distância da mão de trás ao longo da ferramenta, se duas mãos)}
  function skeleton(P,B){
    const f=B.f, L1=f?20.5:21, L2=f?20:20.5, U=f?13:14, E=f?12:13, ro=P.rot||0, br=P.br||0, FOOT=B.FOOT||8;
    const r=rad(ro), cr=Math.cos(r), sr=Math.sin(r);
    const hip={x:AX+P.hx,y:100};
    const R=(lx,ly)=>({x:hip.x+lx*cr-ly*sr,y:hip.y+lx*sr+ly*cr});
    const hipF=R(f?3.6:5,0.6), hipB=R(f?-3.8:-5.4,0);
    const kneeF=lp(hipF,P.lFh-ro,L1), ankleF=lp(kneeF,P.lFk-ro,L2), kneeB=lp(hipB,P.lBh-ro,L1), ankleB=lp(kneeB,P.lBk-ro,L2);
    const a=rad(P.lean+ro), co=Math.cos(a), s=Math.sin(a);
    const T=(lx,ly)=>({x:hip.x+lx*co-ly*s, y:hip.y+lx*s+ly*co});
    const tw=P.tw||0, neck=T(1,-34-br*0.8), shF=T(((f?-9:-14)*0.5+1.2)*(1-tw)-1.5*tw,(f?-29:-29.8)-br*0.8), shB=T(((f?8.6:13.6)*0.5+1.2)*(1-tw)+7*tw,(f?-29.4:-30.2)-br*0.8);
    const ha=rad(P.lean+ro+P.head), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:neck.x+lx*hc-ly*hs, y:neck.y+lx*hs+ly*hc});
    const elF=lp(shF,P.aFs-ro,U), wrF=lp(elF,P.aFe-ro,E);
    let elB=lp(shB,P.aBs-ro,U), wrB=lp(elB,P.aBe-ro,E);
    const bAng=P.aFe+P.bat-ro, bDir=Math.atan2(Math.cos(rad(bAng)),Math.sin(rad(bAng)));
    if(P.two>=0.5 && B.grip){ const q=ik(shB,{x:wrF.x+Math.cos(bDir)*B.grip,y:wrF.y+Math.sin(bDir)*B.grip},U,E,true); elB=q.E; wrB=q.W; }
    if(P.bT){ const q=ik(shB,T(P.bT[0],P.bT[1]),U,E,true); elB=q.E; wrB=q.W; }
    // chão: o ponto mais baixo do corpo encosta no GROUND (deitado, ajoelhado, em pé, plantando bananeira)
    const cont=[[ankleF,FOOT],[ankleB,FOOT],[kneeF,6],[kneeB,6],[hip,7],[T(-13,-6),2],[T(-15,-24),2],[T(14,-24),2],[T(0,-33),3],[H(2.9,-16.4),11.8],[wrF,5.4],[wrB,5.4]];
    let low=-1e9; cont.forEach(([q,rr])=>{ low=Math.max(low,q.y+rr); });
    const dy=GROUND-low-(P.lift||0);
    [hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,neck,shF,shB,elF,wrF,elB,wrB].forEach(q=>q.y+=dy);
    const sk={hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,neck,shF,shB,elF,wrF,elB,wrB,a,ha,H,T,bDir,ro,L1,L2,tw,br,f};
    if(P.plant>=0.5 && !(P.lift>0.5) && Math.abs(ro)<10){
      [['kneeF','ankleF','hipF'],['kneeB','ankleB','hipB']].forEach(([kn,an,hp])=>{
        const gap=GROUND-(sk[an].y+FOOT); if(gap>0.05 && gap<4.5){ const A={x:sk[an].x,y:sk[an].y+gap}; const k=legIK(sk[hp],A,L1,L2); sk[kn].x=k.x; sk[kn].y=k.y; sk[an].x=A.x; sk[an].y=A.y; }
      });
    }
    return sk;
  }
  /* ---- desenho base ---- */
  function band(p,a,b,wa,wb,col,f,lite,ins){
    const dx=b.x-a.x, dy=b.y-a.y, L=Math.hypot(dx,dy)||1; let nx=-dy/L, ny=dx/L;
    if((-nx+0.6*ny<0)!==!!lite){ nx=-nx; ny=-ny; }
    ins=ins||0; const oa=wa*(1-f)/2-ins, ob=wb*(1-f)/2-ins;
    p.F(col); p.cap({x:a.x+nx*oa,y:a.y+ny*oa},{x:b.x+nx*ob,y:b.y+ny*ob},wa*f,wb*f);
  }
  function vol(p,a,b,wa,wb,R,X,o={}){
    p.F(R[1]); p.cap(a,b,wa,wb);
    band(p,a,b,wa,wb,X[2],0.66); band(p,a,b,wa,wb,R[2],0.46); band(p,a,b,wa,wb,R[3],0.16);
    if(!o.noLite){ const a2=lerp(a,b,o.l0||0.1), b2=lerp(a,b,o.l1||0.8); band(p,a2,b2,wa,wb,X[1],0.34,true,0.4); band(p,a2,b2,wa,wb,R[0],0.2,true,0.7); band(p,lerp(a,b,o.h0||0.25),lerp(a,b,o.h1||0.55),wa,wb,X[0],0.1,true,1); }
  }
  function sideOff(a,b,w,sgn){ const dx=b.x-a.x, dy=b.y-a.y, L=Math.hypot(dx,dy)||1; let nx=-dy/L, ny=dx/L; if(-nx+0.6*ny<0){ nx=-nx; ny=-ny; } return {x:nx*w*sgn,y:ny*w*sgn}; }
  function xfs(cx,a,ox,oy,sx,sy=1){ const K=PIX.getK(), c=Math.cos(a), s=Math.sin(a); cx.setTransform(c*sx*K,s*sx*K,-s*sy*K,c*sy*K,ox*K,oy*K); }
  function dome(cx,cy,rx,ry,a0,a1,n){ const o=[]; for(let k=0;k<=n;k++){ const t=rad(a0+(a1-a0)*k/n); o.push([cx+Math.cos(t)*rx, cy-Math.sin(t)*ry]); } return o; }
  // punho grande (G = rampa de luva opcional)
  function fist(p,M,el,wr,f,G,GX){
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x), s=f?1.2:1.55, R=G||M.skin, X=GX||M.skinX; p.xf(ang,wr.x,wr.y);
    p.F(R[1]); p.ell(2*s,0.2,4.5*s,4.2*s);
    p.F(X[2]); p.poly([[-0.6*s,1*s],[6*s,0.6*s],[5.4*s,3.6*s],[1.2*s,4.2*s]]);
    p.F(R[2]); p.poly([[0,2.4*s],[5.6*s,1.8*s],[5*s,3.8*s],[1.2*s,4*s]]); p.rect(3.4*s,-2.6*s,0.9,4.6*s); p.rect(5*s,-2*s,0.8,3.4*s);
    p.F(R[3]); p.rect(1.6*s,3.4*s,3*s,0.8);
    p.F(R[0]); p.rect(1.6*s,-3.6*s,3.4*s,1.1); p.F(X[0]); p.rect(2.4*s,-3.6*s,1.4*s,0.9);
    p.F(R[1]); p.ell(0.4*s,-3.4*s,2.2*s,1.5*s); p.F(R[2]); p.rect(-0.8*s,-2.6*s,2.6*s,0.8);
    p.id();
  }
  // mão aberta (palma, dedos juntos e polegar)
  function palm(p,M,el,wr,f,G,GX){
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x), s=f?1.15:1.45, R=G||M.skin, X=GX||M.skinX; p.xf(ang,wr.x,wr.y);
    p.F(R[1]); p.poly([[-1*s,-3*s],[4*s,-3.4*s],[8.6*s,-2.4*s],[9.4*s,0],[8.6*s,2.2*s],[4*s,3.2*s],[-1*s,3*s]]);
    p.F(X[2]); p.poly([[-1*s,1*s],[8.8*s,1*s],[8.6*s,2.2*s],[4*s,3.2*s],[-1*s,3*s]]);
    p.F(R[2]); p.rect(4.6*s,-1.4*s,4*s,0.7); p.rect(4.6*s,0.4*s,4*s,0.7);
    p.F(R[0]); p.rect(1*s,-3.2*s,5*s,1);
    p.F(R[1]); p.cap(P2(1*s,-2.4*s),P2(4.6*s,-5.4*s),2.6*s,2.2*s); p.F(R[2]); p.rect(3.4*s,-5.4*s,1.2,1);
    p.id();
  }
  // braço com massa (deltoide, bíceps, antebraço); o.sleeve = rampa da manga, o.to = até onde vai
  function armBase(p,M,sh,el,wr,o){
    p.id(); const f=o.f, wU=(f?9.6:13.4)*(o.wk||1), wE=(f?8.2:11.4)*(o.wk||1), wW=(f?6.6:8.6)*(o.wk||1);
    vol(p,el,wr,wE,wW,M.skin,M.skinX,{l0:0.05,l1:0.6,h0:0.1,h1:0.4});
    const fb=lerp(el,wr,0.28), fo=sideOff(el,wr,wE*0.12,-1); p.F(M.skinX[1]); p.ell(fb.x+fo.x,fb.y+fo.y,wE*0.36,wE*0.3);
    vol(p,sh,el,wU,wE,M.skin,M.skinX,{l0:0.1,l1:0.85,h0:0.3,h1:0.65});
    const d=lerp(sh,el,0.12), od=sideOff(sh,el,wU*0.16,-1); p.F(M.skin[0]); p.ell(d.x+od.x,d.y+od.y,wU*0.3,wU*0.24); p.F(M.skinX[0]); p.ell(d.x+od.x*1.4,d.y+od.y*1.4-0.4,wU*0.12,wU*0.1);
    const dl=lerp(sh,el,0.34), o2=sideOff(sh,el,wU*0.1,1); p.F(M.skin[2]); p.cap({x:dl.x+o2.x-1.6,y:dl.y+o2.y},{x:dl.x+o2.x+1.6,y:dl.y+o2.y+0.6},1,1);
    if(o.sleeve){ const R=M[o.sleeve], X=M[o.sleeve+'X'];
      if(o.long){ const cf=lerp(el,wr,o.to||0.7), cf2=lerp(el,wr,(o.to||0.7)+0.14);
        vol(p,el,cf,wE+3,wW+2.6,R,X,{l0:0.01,l1:0.7}); vol(p,sh,el,wU+3.4,wE+3,R,X,{l0:0.05,l1:0.8});
        p.F(R[0]); p.cap(lerp(el,cf,0.86),cf,wW+3,wW+2.8); p.F(R[2]); p.cap(lerp(el,cf,0.94),cf,wW+2.8,wW+2.8);
        const e1=lerp(sh,el,0.86), e2=lerp(el,wr,0.14); p.F(R[2]); p.cap(e1,lerp(e1,e2,0.5),1.1,0.9); p.cap(lerp(e1,e2,0.4),e2,0.9,0.9);
      } else { const e=lerp(sh,el,o.to||0.55);
        vol(p,sh,e,wU+3.4,wU+2.4,R,X,{l0:0.01,l1:0.7,h0:0.1,h1:0.45});
        p.F(o.cuff?M[o.cuff][1]:R[2]); p.cap(lerp(sh,el,(o.to||0.55)-0.08),e,wU+2.6,wU+2.4); p.F(o.cuff?M[o.cuff][2]:R[3]); p.cap(lerp(sh,el,(o.to||0.55)-0.02),e,wU+2.4,wU+2.4);
        const fo2=lerp(sh,e,0.5); p.F(R[2]); p.cap({x:fo2.x-1.5,y:fo2.y-1},{x:fo2.x+1.2,y:fo2.y+1.4},0.9,0.9); }
    }
    if(o.extra) o.extra(p,M,sh,el,wr);
  }
  function footAng(sk,front,P,FOOT){
    const an=front?sk.ankleF:sk.ankleB, gap=GROUND-(an.y+FOOT), k=(front?P.lFk:P.lBk);
    let t=0; if(gap>1.2){ if(k<-12) t=Math.min(38,(-k-12)*0.7); else if(k>50) t=-Math.min(30,(k-50)*0.5); }
    return rad(sk.ro+t);
  }
  // perna de calça com volume, dobras grandes atrás do joelho e sanfona; o.cut = onde a calça termina (0..1 na canela)
  function legBase(p,M,sk,front,P,o){
    p.id(); const f=sk.f, hip=front?sk.hipF:sk.hipB, knee=front?sk.kneeF:sk.kneeB, ankle=front?sk.ankleF:sk.ankleB;
    const wT=(f?15:18)*(o.wk||1), wK=(f?11.4:13.4)*(o.wk||1), wA=(f?8.6:10.2)*(o.wk||1), R=M[o.pants], X=M[o.pants+'X'], cut=o.cut||1;
    const cE=lerp(knee,ankle,cut);
    if(cut<1){ vol(p,knee,ankle,wK-2,wA-1.6,M.skin,M.skinX,{l0:0.1,l1:0.6,h0:0.15,h1:0.4}); }
    const q0=lerp(knee,ankle,0.3), o0=sideOff(knee,ankle,wK*0.18,1); p.F(R[1]); p.ell(q0.x+o0.x,q0.y+o0.y,wK*0.5,wK*0.62,Math.atan2(ankle.y-knee.y,ankle.x-knee.x));
    vol(p,knee,cE,wK,(cut<1?wK*0.86:wA+1)+(o.flare||0),R,X,{l0:0.05,l1:0.6,h0:0.1,h1:0.35}); vol(p,hip,knee,wT,wK,R,X,{l0:0.05,l1:0.85,h0:0.2,h1:0.6});
    const kk=knee, kb=sideOff(hip,knee,wK*0.2,1);
    p.F(R[2]); p.poly([[kk.x-4,kk.y-3],[kk.x+3,kk.y-1.2],[kk.x+3.4,kk.y],[kk.x-3.6,kk.y-1.4]]); p.poly([[kk.x-3.4+kb.x,kk.y+1.6+kb.y],[kk.x+3.2,kk.y+2.4],[kk.x+2.4,kk.y+3.4],[kk.x-3.6+kb.x,kk.y+3+kb.y]]);
    p.F(X[1]); p.poly([[kk.x-2,kk.y-1.2],[kk.x+3.4,kk.y],[kk.x+3,kk.y+1],[kk.x-2,kk.y+0.4]]);
    const t1=lerp(hip,knee,0.45), tb=sideOff(hip,knee,wT*0.1,1); p.F(R[2]); p.cap({x:t1.x+tb.x-3,y:t1.y+tb.y-1.6},{x:t1.x+tb.x+2.6,y:t1.y+tb.y+1.2},1.2,0.8);
    if(cut>=1){ [0.8,0.88].forEach(t=>{ const q=lerp(knee,ankle,t); p.F(R[2]); p.cap({x:q.x-wA*0.55,y:q.y-0.8},{x:q.x+wA*0.5,y:q.y+0.6},1,1); }); }
    if(o.hem!==false){ const c1=lerp(knee,ankle,cut-0.1); p.F(o.hemC?M[o.hemC][1]:R[0]); p.cap(c1,lerp(knee,ankle,cut-0.04),(cut<1?wK*0.9:wA)+2.2,(cut<1?wK*0.9:wA)+2.2); p.F(o.hemC?M[o.hemC][2]:R[3]); p.cap(lerp(knee,ankle,cut-0.03),cE,(cut<1?wK*0.9:wA)+2,(cut<1?wK*0.9:wA)+2); }
    if(front){ p.F(X[0]); p.cap(lerp(hip,knee,0.25),lerp(hip,knee,0.7),0.7,0.7); }
    if(o.extra) o.extra(p,M,hip,knee,ankle,front);
    o.foot(p,M,ankle,footAng(sk,front,P,o.FOOT||8),f?1.14:1.3);
  }
  // tronco esculpido (massa + meio-tom largo + sombra roxa grande + borda funda + luz quente); deixa a transformação ativa
  function torsoBase(p,M,sk,R,X,o={}){
    const f=sk.f; xfs(p.cx,sk.a,sk.hip.x,sk.hip.y,((f?1.2:1.45)*0.8-(f?0.08:0.26)*Math.max(0,sk.tw))*(o.wx||1),1.1*(1+0.025*(sk.br||0)));
    const body=f?[[-9.6,3],[9.4,3],[9.6,-3],[7.8,-9],[8.4,-13.4],[10.6,-18],[10.8,-23],[9,-27.6],[3.8,-30.8],[-3,-30.8],[-8.6,-28.4],[-10.4,-24.4],[-9.6,-19],[-7.8,-13],[-8.2,-8],[-9.8,-2]]
                :[[-9.4,3],[9.4,3],[9.6,-3],[8.6,-9],[10.6,-15],[12.4,-21],[12.6,-25.4],[10.4,-29.4],[4.6,-32.2],[-3.6,-32.2],[-10.4,-29.8],[-12.8,-25.6],[-12.4,-20],[-10.2,-14],[-9,-8],[-10,-2]];
    p.F(R[1]); p.poly(body);
    p.F(X[2]); p.poly(f?[[-10.4,-24.4],[-2,-26],[-1,-16],[-2,-6],[-2,3],[-9.6,3],[-9.8,-2],[-8.2,-8],[-7.8,-13],[-9.6,-19]]:[[-12.8,-25.6],[-2,-27.6],[-1,-17],[-2,-6],[-2,3],[-9.4,3],[-10,-2],[-9,-8],[-10.2,-14],[-12.4,-20]]);
    p.F(R[2]); p.poly(f?[[-10.4,-24.4],[-5.6,-25.6],[-5,-17],[-5.4,-8],[-4.8,3],[-9.6,3],[-9.8,-2],[-8.2,-8],[-7.8,-13],[-9.6,-19]]:[[-12.8,-25.6],[-6.4,-27.4],[-5.6,-18],[-6,-9],[-5.4,3],[-9.4,3],[-10,-2],[-9,-8],[-10.2,-14],[-12.4,-20]]);
    p.F(R[3]); p.poly(f?[[-10.4,-24.4],[-8,-25],[-8,-17],[-7.8,-13],[-9.6,-19]]:[[-12.8,-25.6],[-10,-26.6],[-9.6,-18],[-10.2,-14],[-12.4,-20]]); p.poly([[-9.6,-4],[-6,-4],[-5.4,3],[-9.4,3]]);
    p.F(R[2]); p.poly(f?[[-5,-17],[2,-14.6],[10.6,-17],[9.6,-12.4],[2,-10.6],[-5,-13]]:[[-6,-18],[2,-16.6],[12.2,-19],[11.2,-14],[2,-12.4],[-6,-14]]);
    p.F(R[3]); p.poly(f?[[-5,-17],[2,-14.6],[10.6,-17],[10.4,-16],[2,-13.6],[-5,-16]]:[[-6,-18],[2,-16.6],[12.2,-19],[12,-17.8],[2,-15.4],[-6,-16.8]]);
    p.F(X[2]); p.poly(f?[[6,-11],[9.2,-10.6],[9.6,-3],[7,-3]]:[[6.6,-12],[10,-12],[9.6,-3],[7,-3]]);
    p.F(X[1]); p.poly(f?[[0,-27.8],[8.6,-27.6],[10.6,-22.6],[10,-17.6],[2,-16],[-1,-22]]:[[0,-29.4],[9.6,-29.2],[12.2,-24],[11.8,-19.6],[2,-17.6],[-1,-23]]);
    p.F(R[0]); p.poly(f?[[2.6,-27.4],[8.4,-27.4],[10.4,-22.6],[9.6,-19.6],[5.4,-20.4],[3.2,-23]]:[[2.6,-29],[9.4,-28.6],[11.8,-23.4],[11.2,-20.4],[6,-21],[3,-24.4]]);
    p.F(X[0]); p.poly(f?[[5,-27],[8.2,-27],[9.4,-24],[6.6,-24.6]]:[[5,-28.6],[9,-28.4],[10.6,-25],[7,-25.6]]);
    p.F(X[1]); p.poly([[1,-11],[7,-11.6],[7.6,-5],[2,-4.6]]);
  }
  // dobras grandes de tecido no tronco (do ombro pro quadril e na cintura)
  function folds(p,R,X){
    p.F(R[2]); p.poly([[-5,-25],[2,-19],[1.4,-17.6],[-5.6,-23.2]]); p.poly([[5,-11],[9.6,-6],[8.4,-5],[4.2,-9.6]]); p.poly([[-4,-8],[3,-6],[2.6,-4.6],[-4.2,-6.6]]); p.poly([[2,-13],[8,-11.6],[7.6,-10.4],[1.8,-11.6]]);
    p.F(X[1]); p.poly([[-4.4,-23.8],[1.8,-18.4],[2.4,-19.2],[-3.8,-25]]); p.poly([[-3.8,-8.6],[2.8,-6.6],[3.2,-7.4],[-3.4,-9.4]]);
  }
  // rosto expressivo (pescoço, crânio, orelha, olhos, sobrancelha, nariz, boca); ganchos pra cabelo/barba/chapéu
  function face(p,M,sk,P,o){
    const f=sk.f; xfs(p.cx,sk.ha,sk.neck.x,sk.neck.y,HS,HS);
    if(o.back) o.back(p,M,P);
    p.F(M.skin[1]); p.cap(P2(0.4,4),P2(1.2,-6),f?6.8:8.8,f?6.2:8);
    p.F(M.skin[2]); p.poly([[-3.8,3],[-3,-6],[-0.6,-6],[-1,3]]); p.poly([[0,-4.6],[8.4,-2.6],[7,-0.8],[0.4,-1.8]]);
    p.F(M.skin[1]); p.ell(2.6,-14.6,10.2,10.4);
    p.poly(f?[[-3,-9],[10.4,-10.4],[12.2,-6.6],[10.6,-2.8],[6.8,-0.6],[1.6,-0.6]]:[[-3,-9],[10.6,-10.4],[12.8,-6],[11.8,-2.2],[8,0.6],[1.4,0.6]]);
    p.F(M.skin[2]); p.poly([[-3.4,-9.4],[1.6,-8.6],[2.8,-3],[1.6,0.4],[-1.8,-2]]); p.poly([[-7.6,-12],[-5.6,-17],[-4,-13],[-5,-8]]);
    p.F(M.skin[0]); p.poly([[6,-23],[10,-21.6],[11.4,-18.6],[8,-20]]); p.ell(9,-9.2,1.8,1);
    p.F(M.skin[1]); p.ell(-3.4,-12.4,2.6,3.6); p.F(M.skin[2]); p.ell(-3.1,-12.2,1.3,2.3); p.F(M.skin[3]); p.rect(-3.4,-12.8,0.8,1.8);
    if(o.beard) o.beard(p,M,P);
    const m=Math.round(P.mouth||0), b=Math.round(P.brow||0), sq=b===2&&m===2;
    if(P.blink>=0.5||sq){ p.F(M.skin[3]); if(sq){ p.poly([[4.6,-14.6],[9.4,-13.6],[9.4,-12.6],[4.6,-12.8]]); } else if(P.blink>=1.5){ p.poly([[4.6,-13],[7,-15],[9.4,-13],[8.6,-12.4],[7,-14],[5.4,-12.4]]); } else p.rect(4.4,-13.4,5,1); p.rect(10.8,-13.6,1.8,0.9); }
    else {
      p.F(M.eye[1]); p.ell(6.9,-13.3,2.7,2.2); p.F(M.eye[2]); p.rect(4.6,-12,4.8,0.9);
      p.F(M.iris[1]); p.rect(7.1,-14.8,2.2,3); p.F(M.iris[3]); p.rect(7.8,-14.2,1.1,1.8); p.F(M.eye[0]); p.rect(7.2,-14.8,0.9,0.9);
      p.F(M.skin[3]); p.poly([[4,-15.4],[9.8,-15.8],[9.8,-14.8],[4.4,-14.6]]);
      if(f){ p.rect(9.4,-16.4,1.4,1); p.rect(3.6,-15.2,1,0.9); }
      p.F(M.eye[1]); p.ell(11.7,-13.4,1.1,1.8); p.F(M.iris[1]); p.rect(11.5,-14.6,1.1,2); p.F(M.skin[3]); p.rect(10.7,-15.6,2.4,0.8);
    }
    const thk=o.brow||1.7, yo=b===1?-18.4:b===2?-17.2:b===3?-18.6:-17.8, yi=b===1?-16.2:b===2?-19:b===3?-18:-17.4;
    p.F(M.hair[2]); p.poly([[3.6,yo],[10.4,yi],[10.4,yi+thk],[3.6,yo+thk]]); p.poly([[11,yi+(b===1?0.2:0)],[13.2,yi+(b===1?-0.8:0.4)],[13.2,yi+thk],[11,yi+thk]]);
    p.F(M.skin[1]); p.poly([[10.2,-14.8],[14.4,-9.6],[13.8,-8.4],[10.4,-8.6]]);
    p.F(M.skin[2]); p.rect(10.4,-9.2,3.6,1); p.F(M.skin[3]); p.rect(11.6,-9.2,1.2,0.8); p.F(M.skin[0]); p.rect(11.4,-13.2,0.9,2.6);
    if(m===2){ p.F(M.mouth[2]); p.poly([[7.2,-7.6],[12.8,-7.8],[12.2,-2.2],[7.8,-2.4]]); p.F(M.teeth[1]); p.rect(7.6,-7.6,4.8,1.3); p.F(M.mouth[0]); p.ell(10,-3.2,1.9,0.9); }
    else if(m===1){ p.F(M.mouth[1]); p.rect(7.2,-7.6,5.6,3.4); p.F(M.teeth[1]); p.rect(7.6,-7.2,4.8,2.6); p.F(M.teeth[2]); p.rect(7.6,-5.9,4.8,0.6); p.rect(9.6,-7.2,0.6,2.6); }
    else if(m===3){ p.F(M.mouth[2]); p.poly([[7,-6.8],[12.8,-7.6],[11.6,-4.2],[8.2,-4.4]]); p.F(M.teeth[1]); p.rect(7.6,-6.8,4.8,1.3); p.F(M.skin[2]); p.rect(6,-7.8,1,1.6); }
    else if(m===4){ p.F(M.mouth[2]); p.ell(10,-5.2,1.6,1.8); p.F(M.mouth[0]); p.rect(9.4,-4.4,1.2,0.8); }
    else { p.F(f?M.mouth[0]:M.mouth[2]); p.rect(7.8,-6,4.4,f?1.4:1); p.F(M.skin[2]); p.rect(8.4,-4.6,3,0.8); }
    if(o.front) o.front(p,M,P);
    p.id();
  }
  // rastro do golpe: crescente grossa ao redor de um pivô (ombro pra ferramenta, quadril pro chute)
  function smearArc(p,M,piv,tip,sa,wide){
    p.id(); const cur=Math.atan2(tip.x-piv.x,tip.y-piv.y)*180/Math.PI, r1=Math.hypot(tip.x-piv.x,tip.y-piv.y)+3, n=14;
    let a0=sa; while(a0-cur>180) a0-=360; while(cur-a0>180) a0+=360;
    const bd=(rr0,rr1,col)=>{ const pts=[]; for(let k=0;k<=n;k++){ const a=a0+(cur-a0)*k/n; pts.push([piv.x+Math.sin(rad(a))*rr1, piv.y+Math.cos(rad(a))*rr1]); }
      for(let k=n;k>=0;k--){ const a=a0+(cur-a0)*k/n, t=k/n, rr=rr1-(rr1-rr0)*t*t; pts.push([piv.x+Math.sin(rad(a))*rr, piv.y+Math.cos(rad(a))*rr]); } p.F(col); p.poly(pts); };
    bd(r1-wide,r1+1.6,M.trail[1]); bd(r1-wide+3,r1,M.smear[1]); bd(r1-5,r1-0.6,M.smear[0]);
  }
  function star(p,c,r,col,col2){ const pts=[]; for(let k=0;k<16;k++){ const a=k/16*Math.PI*2, rr=k%2?r*0.28:(k%4?r*0.62:r); pts.push([c.x+Math.cos(a)*rr,c.y+Math.sin(a)*rr]); } p.F(col); p.poly(pts); if(col2){ p.F(col2); p.circle(c,r*0.22); } }
  // contorno de baixo com 2 px (peso na base das formas)
  function thick(cv){ const g=cv.getContext('2d'), W=cv.width, H=cv.height, im=PIX.pix(cv), d=im.data, src=new Uint8ClampedArray(d);
    const isO=i=>src[i+3]>0&&src[i]===23&&src[i+1]===11&&src[i+2]===28;
    for(let y=2;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(src[i+3]) continue; const u=i-W*4, u2=u-W*4; if(isO(u)&&src[u2+3]&&!isO(u2)){ d[i]=23; d[i+1]=11; d[i+2]=28; d[i+3]=255; } }
    g.putImageData(im,0,0); }
  const pen=(c,u)=>{ const p=mkPen(c,u); p.cx=c; return p; };
  /* ---- fim do rig ---- */

  /* ---- CAPOEIRISTA: abadá branco, corda verde-amarela, descalço, dreads presos ---- */
  const SKINS={media:{nome:'Pele média',hex:'#a86a42'}, escura:{nome:'Pele escura',hex:'#6a4028'}, clara:{nome:'Pele clara',hex:'#d8a27a'}};
  const BODY={f:0,FOOT:8};
  function mats(skin){
    const h=SKINS[skin].hex;
    return Object.assign({},BASEM,{
      skin:R4(h,1.15), skinX:RX(h,1.15),
      hair:R4('#2e1e14',1.1), hairX:RX('#2e1e14',1.1),
      abada:R4('#eee9dc',1), abadaX:RX('#eee9dc',1),
      cordG:R4('#2f9a3a',1.1), cordY:R4('#f2c230',1.1),
      band:R4('#d8342e',1.1),
      gold:['#fff0a0','#e3b23c','#9a7418','#4a380a'],
      sole:['#f4ccb4','#dca48a','#a87060','#6a4038'],
      trail:['#fff6d0','#f2d878','#a8821a','#5a440a'],
    });
  }
  const NAMES={skin:'Pele',hair:'Dreads',abada:'Abadá',cordG:'Corda verde',cordY:'Corda amarela',band:'Faixa'};
  // ginga: pernas em tesoura que trocam de lugar, braço do lado da perna de trás cobre o rosto
  function ginga(i,n,fast){ const p=i/n*Math.PI*2, c=Math.cos(p), u=(1-c)/2, v=1-u, k=20+4*Math.abs(S(p)), aF=32*c, aB=-32*c, L=(a,b,t)=>a+(b-a)*t;
    return {inhand:0,op:1,lFh:aF+k,lFk:aF-k+2,lBh:aB+k,lBk:aB-k+2,lean:12+6*Math.abs(c),hx:-2*c,head:-2+1.5*S(2*p),br:S(2*p),
      aFs:L(-14,52,u),aFe:L(26,164,u),aBs:L(-14,48,v),aBe:L(26,158,v),brow:fast?1:0,blink:(!fast&&i===5)?1:0}; }
  const GUARD=Object.assign({inhand:0,op:0},ST,{lean:12,aFs:50,aFe:150,aBs:30,aBe:120,brow:1});
  const G=o=>Object.assign({},GUARD,K_(o));
  const ANIMS=Object.assign({
    idle:{nome:'Ginga',n:8,dur:()=>130,pose:i=>ginga(i,8,false)},
    walk:{nome:'Andar',n:8,dur:()=>110,pose:i=>{ const p=i/8*Math.PI*2;
      return {inhand:0,op:1,plant:0,lFh:th(p,0),lFk:shn(p,0),lBh:th(p,Math.PI),lBk:shn(p,Math.PI),lean:4+1.4*S(2*p),head:S(2*p-0.6),aFs:8-20*S(p),aFe:30-16*S(p),aBs:-6+20*S(p),aBe:14+22*S(p)}; }},
    guard:{nome:'Ginga (guarda)',n:8,dur:()=>105,pose:i=>ginga(i,8,true)},
    combo:{nome:'Combo: martelo · meia-lua de frente · meia-lua de compasso',n:12,hits:{2:1,6:2,10:3},dur:i=>[100,60,70,90,80,60,70,90,100,80,70,170][i],pose:i=>G([
      {lean:-4,lFh:72,lFk:-24,lBh:-30,lBk:-40,aFs:50,aFe:160,aBs:-30,aBe:20,mouth:1},
      {lean:-14,lFh:96,lFk:40,lBh:-24,lBk:-34,aFs:46,aFe:160,aBs:-50,aBe:0,mouth:1},
      {lean:-30,lFh:116,lFk:122,kick:'F',lBh:-20,lBk:-26,aFs:40,aFe:150,aBs:-70,aBe:-30,mouth:2,smear:1,sa:20,head:4},
      {lean:-28,lFh:110,lFk:114,kick:'F',lBh:-20,lBk:-26,aFs:40,aFe:150,aBs:-70,aBe:-30,mouth:1,head:4},
      {lean:-8,lFh:64,lFk:-14,lBh:-28,lBk:-38,aFs:50,aFe:160,aBs:-30,aBe:20},
      {lean:8,hx:4,lFh:30,lFk:12,lBh:-44,lBk:-52,aFs:30,aFe:140,aBs:40,aBe:150},
      {lean:-20,hx:6,lFh:14,lFk:6,lBh:134,lBk:136,kick:'B',aFs:-30,aFe:20,aBs:60,aBe:150,mouth:2,smear:2,sa:-30},
      {lean:-14,hx:6,lFh:16,lFk:6,lBh:118,lBk:108,kick:'B',aFs:-20,aFe:30,aBs:50,aBe:140,mouth:1},
      {lean:44,hx:2,head:8,lFh:42,lFk:12,lBh:-38,lBk:-50,aFs:30,aFe:10,aBs:10,aBe:-10,op:1,brow:1},
      {lean:64,hx:4,head:16,lFh:40,lFk:10,lBh:-100,lBk:-112,aFs:14,aFe:4,aBs:-4,aBe:-10,op:1,brow:1,mouth:1},
      {lean:58,hx:6,head:14,lFh:38,lFk:10,lBh:168,lBk:174,kick:'B',aFs:14,aFe:4,aBs:-4,aBe:-10,op:1,mouth:2,smear:3,sa:-100,impact:1},
      {lean:30,hx:6,head:4,lFh:40,lFk:10,lBh:118,lBk:104,kick:'B',aFs:30,aFe:60,aBs:10,aBe:20,op:1,mouth:1}][i])},
    special:{nome:'Especial: parafuso',n:8,dur:i=>[150,90,80,80,90,110,130,160][i],pose:i=>G([
      {lean:26,head:-4,lFh:64,lFk:-20,lBh:-10,lBk:-62,aFs:-50,aFe:-20,aBs:-60,aBe:-30,brow:1,mouth:1},
      {lean:-6,lift:14,plant:0,lFh:40,lFk:-30,lBh:20,lBk:-50,aFs:150,aFe:170,aBs:140,aBe:160,brow:1,mouth:1},
      {lean:-24,lift:26,plant:0,lFh:96,lFk:98,kick:'F',lBh:30,lBk:-40,aFs:-30,aFe:30,aBs:120,aBe:160,mouth:2,brow:1,smear:3,sa:-200,impact:2},
      {lean:-28,lift:24,plant:0,lFh:30,lFk:-30,lBh:104,lBk:106,kick:'B',aFs:40,aFe:150,aBs:-40,aBe:20,mouth:2,brow:1,smear:3,sa:-60,impact:1},
      {lean:-10,lift:8,plant:0,lFh:50,lFk:-10,lBh:10,lBk:-40,aFs:60,aFe:130,aBs:20,aBe:80,mouth:1},
      {lean:30,head:-6,lFh:70,lFk:-14,lBh:0,lBk:-90,aFs:20,aFe:60,aBs:-30,aBe:10,brow:1},
      {lean:18,lFh:50,lFk:2,lBh:-34,lBk:-50,aFs:40,aFe:140,aBs:20,aBe:110,brow:1},
      {lean:12,mouth:3}][i])},
    victory:{nome:'Vitória: aú e salve',n:8,dur:i=>[140,100,90,90,160,90,160,400][i],pose:i=>K_([
      Object.assign(ginga(0,8,false),{mouth:3,brow:3}),
      {inhand:0,op:1,lean:44,head:10,lFh:30,lFk:6,lBh:-40,lBk:-50,aFs:20,aFe:6,aBs:6,aBe:-6,mouth:3},
      {inhand:0,op:1,rot:135,lean:0,head:0,plant:0,lFh:40,lFk:40,lBh:-50,lBk:-50,aFs:178,aFe:182,aBs:186,aBe:184,mouth:3},
      {inhand:0,op:1,rot:180,lean:0,head:0,plant:0,lFh:30,lFk:30,lBh:-30,lBk:-30,aFs:176,aFe:180,aBs:186,aBe:182,mouth:3,brow:3},
      {inhand:0,op:1,rot:180,lean:0,head:0,plant:0,lFh:34,lFk:34,lBh:-34,lBk:-34,aFs:176,aFe:180,aBs:186,aBe:182,mouth:3,brow:3,blink:2},
      {inhand:0,op:1,rot:235,lean:0,head:0,plant:0,lFh:50,lFk:50,lBh:-40,lBk:-40,aFs:178,aFe:182,aBs:186,aBe:184,mouth:3},
      {inhand:0,op:0,lean:2,head:-6,lFh:22,lFk:4,lBh:-20,lBk:-22,aFs:166,aFe:176,aBs:-20,aBe:30,mouth:3,brow:3},
      {inhand:0,op:0,lean:2,head:-6,lFh:22,lFk:4,lBh:-20,lBk:-22,aFs:168,aFe:178,aBs:-20,aBe:30,mouth:3,brow:3,blink:2}][i])},
  },commonAnims(GUARD,G,()=>({op:0})));
  /* golpes avulsos de capoeira (lidos pelo combo automático: atk = peso, fin = finalizador, hitsx = dano/alcance) */
  Object.assign(ANIMS,{
    // meia-lua de compasso: mãos no chão, gira e a perna de trás varre alto num arco largo
    meialua:{nome:'Meia-lua de compasso',n:9,atk:3,hits:{5:1},hitsx:{5:{m:1.4,heavy:1,reach:56}},move:[0,0,20,30,40,30,0,0,0],dur:i=>[100,90,80,60,40,90,110,100,120][i],pose:i=>G([
      {lean:8,lFh:30,lFk:12,lBh:-44,lBk:-52,aFs:30,aFe:140,aBs:40,aBe:150,brow:1},
      {lean:34,hx:2,head:6,lFh:42,lFk:12,lBh:-38,lBk:-50,aFs:30,aFe:10,aBs:10,aBe:-10,op:1,brow:1},
      {lean:58,hx:4,head:14,lFh:40,lFk:10,lBh:-80,lBk:-96,aFs:14,aFe:4,aBs:-4,aBe:-10,op:1,brow:1,mouth:1},
      {lean:66,hx:4,head:16,lFh:40,lFk:10,lBh:-130,lBk:-150,aFs:14,aFe:4,aBs:-4,aBe:-10,op:1,mouth:1,smear:2,sa:-160,kick:'B'},
      {lean:62,hx:6,head:16,lFh:38,lFk:10,lBh:150,lBk:156,kick:'B',aFs:14,aFe:4,aBs:-4,aBe:-10,op:1,mouth:2,smear:3,sa:-150},
      {lean:56,hx:8,head:14,lFh:38,lFk:10,lBh:108,lBk:100,kick:'B',aFs:14,aFe:4,aBs:-4,aBe:-10,op:1,mouth:2,smear:3,sa:-150,impact:2},
      {lean:40,hx:8,head:6,lFh:40,lFk:10,lBh:70,lBk:50,kick:'B',aFs:30,aFe:40,aBs:10,aBe:20,op:1,mouth:1},
      {lean:18,hx:6,lFh:44,lFk:10,lBh:-20,lBk:-40,aFs:40,aFe:130,aBs:30,aBe:120},
      {}][i])},
    // rasteira: agacha, apoia a mão e a perna da frente varre rente ao chão — derruba (finalizador)
    rasteira:{nome:'Rasteira',n:8,atk:2,fin:'knock',hits:{4:1},hitsx:{4:{m:1.3,knock:1,reach:54}},move:[0,20,40,40,20,0,0,0],dur:i=>[90,100,60,40,130,110,100,120][i],pose:i=>G([
      {lean:20,hx:-2,lFh:50,lFk:10,lBh:-44,lBk:-60,aFs:30,aFe:120,aBs:30,aBe:110,brow:1},
      {lean:30,hx:-6,head:4,lFh:96,lFk:-10,lBh:-6,lBk:-110,aFs:10,aFe:-10,aBs:-20,aBe:-30,op:1,brow:1,mouth:1},
      {lean:34,hx:-8,head:6,lFh:110,lFk:-30,lBh:10,lBk:-120,aFs:-10,aFe:-20,aBs:-30,aBe:-40,op:1,brow:1},
      {lean:30,hx:-4,head:6,lFh:70,lFk:84,kick:'F',lBh:20,lBk:-120,aFs:-20,aFe:-20,aBs:-30,aBe:-40,op:1,mouth:2,smear:2,sa:-20},
      {lean:26,hx:2,head:4,lFh:88,lFk:92,kick:'F',lBh:24,lBk:-118,aFs:-20,aFe:-20,aBs:-30,aBe:-40,op:1,mouth:2,smear:3,sa:-10,impact:2},
      {lean:26,hx:2,head:4,lFh:86,lFk:90,kick:'F',lBh:24,lBk:-118,aFs:-20,aFe:-20,aBs:-30,aBe:-40,op:1,mouth:1},
      {lean:24,hx:0,lFh:80,lFk:-6,lBh:-10,lBk:-90,aFs:20,aFe:80,aBs:10,aBe:60,brow:1},
      {}][i])},
    // joelhada: puxa a nuca do zumbi com as mãos e sobe o joelho da frente (rápida, de colado)
    joelhada:{nome:'Joelhada',n:7,atk:3,hits:{3:1},hitsx:{3:{m:1.2,reach:36}},move:[0,30,40,10,0,0,0],dur:i=>[80,80,40,110,90,90,110][i],pose:i=>G([
      {lean:6,lFh:40,lFk:6,lBh:-40,lBk:-50,aFs:90,aFe:130,aBs:80,aBe:120,op:1,brow:1},
      {lean:-4,hx:2,head:-4,lFh:30,lFk:4,lBh:-34,lBk:-50,aFs:120,aFe:150,aBs:110,aBe:140,op:1,brow:1,mouth:1},
      {lean:10,hx:6,head:-8,lift:4,plant:0,lFh:90,lFk:0,lBh:-20,lBk:-30,aFs:100,aFe:60,aBs:90,aBe:50,mouth:2,smear:1,sa:-40,kick:'F'},
      {lean:16,hx:9,head:-10,lift:8,plant:0,lFh:120,lFk:10,lBh:-14,lBk:-20,aFs:90,aFe:30,aBs:80,aBe:20,mouth:2,impact:2,kick:'F'},
      {lean:12,hx:9,head:-8,lift:4,plant:0,lFh:110,lFk:0,lBh:-18,lBk:-26,aFs:86,aFe:40,aBs:76,aBe:30,mouth:1,kick:'F'},
      {lean:10,hx:6,lFh:50,lFk:6,lBh:-36,lBk:-48,aFs:60,aFe:120,aBs:40,aBe:110},
      {}][i])},
  });
  // kit de beat 'em up (de mãos limpas: as varridas viram socos/cotoveladas) + 3 golpes assinatura de capoeira
  Object.assign(ANIMS,MOVESET.kit(G,{unarmed:true,names:{dash:'Investida com soco',dive:'Mergulho (cotovelada de cima)',launcher:'Gancho (lança)',airCombo:'Combo aéreo de chutes',areaSpin:'Giro de braços (costas)',grab:'Agarrão + joelhadas'}}),{
    // aú: estrela por cima do zumbi, a perna da frente acerta lá do alto quando está de cabeça pra baixo
    au:{nome:'Aú (estrela com chute)',n:8,kind:'sig',sig:1.2,cd:6,kf:1,hits:{3:1},hitsx:{3:{m:1.3,heavy:1,knock:1,air:1,reach:48}},z:[0,4,10,14,10,4,0,0],move:[0,60,70,70,60,40,0,0],dur:i=>[90,70,70,80,70,70,110,110][i],pose:i=>G([
      {lean:30,head:6,lFh:40,lFk:6,lBh:-40,lBk:-50,aFs:40,aFe:20,aBs:30,aBe:10,op:1,brow:1},
      {rot:60,plant:0,lean:0,lFh:30,lFk:20,lBh:-40,lBk:-46,aFs:170,aFe:176,aBs:160,aBe:170,op:1,mouth:1,brow:1},
      {rot:120,plant:0,lean:0,lFh:-30,lFk:-40,lBh:50,lBk:60,aFs:178,aFe:182,aBs:174,aBe:180,op:1,mouth:2,kick:'F',smear:2,sa:-20},
      {rot:180,plant:0,lean:0,lFh:-56,lFk:-60,lBh:56,lBk:60,aFs:178,aFe:182,aBs:176,aBe:180,op:1,kick:'F',smear:3,sa:20,impact:2,mouth:2,brow:1},
      {rot:240,plant:0,lean:0,lFh:-50,lFk:-56,lBh:40,lBk:44,aFs:176,aFe:180,aBs:172,aBe:178,op:1,mouth:1},
      {rot:300,plant:0,lean:0,lFh:20,lFk:10,lBh:-30,lBk:-40,aFs:150,aFe:160,aBs:140,aBe:150,op:1,mouth:1},
      {lean:20,lFh:50,lFk:-10,lBh:-30,lBk:-60,aFs:50,aFe:150,aBs:30,aBe:120,brow:1},
      {}][i])},
    // martelo rodado: a perna de trás arma o joelho na frente, gira o quadril e estala na altura da cabeça (derruba)
    martelo:{nome:'Martelo rodado',n:7,kind:'sig',sig:1.2,cd:5,kf:1,hits:{3:1},hitsx:{3:{m:1.5,heavy:1,knock:1,reach:58}},move:[0,20,30,20,0,0,0],dur:i=>[90,80,40,120,90,90,110][i],pose:i=>G([
      {lean:6,lFh:40,lFk:6,lBh:-40,lBk:-50,aFs:50,aFe:150,aBs:30,aBe:120,brow:1},
      {lean:-6,hx:2,lFh:20,lFk:6,lBh:60,lBk:-20,kick:'B',aFs:30,aFe:140,aBs:-20,aBe:40,mouth:1,brow:1},
      {lean:-24,hx:6,lFh:14,lFk:6,lBh:100,lBk:70,kick:'B',smear:2,sa:-20,aFs:10,aFe:120,aBs:-50,aBe:0,mouth:2,brow:1},
      {lean:-40,hx:8,head:6,lFh:12,lFk:6,lBh:134,lBk:142,kick:'B',smear:3,sa:-30,impact:2,aFs:0,aFe:110,aBs:-70,aBe:-30,mouth:2,brow:1},
      {lean:-36,hx:8,lFh:12,lFk:6,lBh:130,lBk:136,kick:'B',aFs:0,aFe:110,aBs:-70,aBe:-30,mouth:1},
      {lean:-4,hx:6,lFh:30,lFk:6,lBh:50,lBk:-10,kick:'B',aFs:40,aFe:140,aBs:0,aBe:60},
      {}][i])},
    // armada: gira de costas e a perna de trás passa por cima num arco enorme — pega quem está atrás e na frente
    armada:{nome:'Armada (giro de costas)',n:7,kind:'sig',sig:1,cd:6,kf:1,hits:{2:1,4:2},hitsx:{2:{m:1,both:1,reach:50},4:{m:1.35,heavy:1,both:1,knock:1,reach:58}},move:[0,0,10,20,10,0,0],dur:i=>[90,80,50,50,110,100,110][i],pose:i=>G([
      {lean:10,lFh:40,lFk:6,lBh:-40,lBk:-50,aFs:50,aFe:150,aBs:30,aBe:120,brow:1},
      {lean:-4,hx:-2,lFh:20,lFk:4,lBh:-20,lBk:-30,aFs:-40,aFe:20,aBs:-60,aBe:0,mouth:1,brow:1},
      {lean:-30,hx:-4,lFh:16,lFk:6,lBh:-110,lBk:-120,kick:'B',smear:2,sa:-40,aFs:-20,aFe:40,aBs:40,aBe:100,mouth:2},
      {lean:-36,head:6,lFh:14,lFk:6,lBh:170,lBk:176,kick:'B',smear:3,sa:-120,impact:1,aFs:10,aFe:60,aBs:60,aBe:120,mouth:2,brow:1},
      {lean:-20,lFh:14,lFk:6,lBh:110,lBk:110,kick:'B',smear:3,sa:-170,impact:2,aFs:30,aFe:100,aBs:20,aBe:80,mouth:2,brow:1},
      {lean:0,lFh:30,lFk:6,lBh:40,lBk:0,kick:'B',aFs:50,aFe:150,aBs:30,aBe:120},
      {}][i])},
  });
  function poseOf(anim,i){ return Object.assign({},REST,ANIMS[anim].pose(i)); }
  /* ---- desenho ---- */
  function barefoot(p,M,a,ang,sc){
    xfs(p.cx,ang,a.x,a.y,sc*0.94,sc);
    // pé descalço: peito do pé fino, dedos separados, calcanhar redondo, sola rosada
    p.F(M.skin[1]); p.poly([[-4.2,-3.6],[1.6,-3.8],[4,-0.6],[8.6,1.4],[12.2,3.2],[12.4,5],[-5,5],[-5.6,0.6]]);
    p.F(M.skinX[2]); p.poly([[-5.6,0.6],[-4.2,-3.6],[-0.8,-3.6],[-1.6,5],[-5,5]]);
    p.F(M.skin[2]); p.poly([[-5.6,0.6],[-4.2,-3.6],[-2.4,-3.6],[-3.2,5],[-5,5]]); p.F(M.skin[3]); p.rect(-5.6,2,1.1,3);
    p.F(M.skin[0]); p.poly([[2.6,-0.8],[8.6,1.6],[10.6,2.8],[5,2]]); p.F(M.skinX[0]); p.rect(7.6,1.8,1.4,0.8); p.F(M.skin[0]); p.ell(-0.6,-1.8,1.1,0.9);
    p.F(M.skin[1]); p.ell(11.6,3.8,1.6,1.4); p.F(M.skin[2]); [6.4,8.2,10].forEach(x=>p.rect(x,3,0.7,2)); p.rect(0.6,2.2,3.2,0.7);
    p.F(M.sole[1]); p.poly([[-5,4.4],[12.6,4.4],[12.8,5.6],[12,6.2],[-5,6.2]]); p.F(M.sole[2]); p.rect(-5,5.4,17.4,0.8); p.F(M.sole[0]); p.rect(-3,4.4,12,0.6);
    p.id();
  }
  function arm(p,M,sk,front,P){
    const sh=front?sk.shF:sk.shB, el=front?sk.elF:sk.elB, wr=front?sk.wrF:sk.wrB;
    armBase(p,M,sh,el,wr,{f:0,extra:front?(p,M,sh,el,wr)=>{ const a=lerp(el,wr,0.84), b=lerp(el,wr,0.92); p.F(M.cordG[1]); p.cap(a,lerp(a,b,0.5),9.4,9.2); p.F(M.cordY[1]); p.cap(lerp(a,b,0.5),b,9.2,9); p.F(M.cordY[0]); p.rect(b.x-0.6,b.y-4,1.2,1.2); }:null});
    if(P.op>=0.5) palm(p,M,el,wr,0); else fist(p,M,el,wr,0);
  }
  function leg(p,M,sk,front,P){
    legBase(p,M,sk,front,P,{pants:'abada',cut:0.9,flare:1.6,wk:1.04,foot:barefoot,extra:(p,M,hip,knee,ankle,front)=>{
      // elástico franzido na barra e costura lateral
      const q=lerp(knee,ankle,0.86); p.F(M.abada[2]); [-2.6,0,2.6].forEach(d=>{ const o=sideOff(knee,ankle,d,1); p.rect(q.x+o.x-0.4,q.y+o.y-1,0.8,2); });
      if(front){ p.F(M.abadaX[2]); p.cap(lerp(hip,knee,0.1),lerp(knee,ankle,0.8),0.8,0.8); }
    }});
  }
  function torso(p,M,sk,P){
    torsoBase(p,M,sk,M.skin,M.skinX);
    const R=M.abada, X=M.abadaX;
    // peito e barriga (vistos pela cava da regata)
    p.F(M.skin[2]); p.rect(1.6,-11,0.9,8); p.rect(-1,-8,5.6,0.8); p.rect(-1,-4.6,5.6,0.8);
    // regata branca do abadá
    p.F(R[1]); p.poly([[-9.2,3],[9.2,3],[9.4,-3],[8.4,-9],[10.4,-15],[11.4,-21],[9.4,-27],[7,-29.6],[4.8,-29.6],[3,-24],[-2,-24],[-4,-29.6],[-6.6,-29.6],[-9.8,-22],[-10,-14],[-9,-8],[-9.8,-2]]);
    p.F(X[2]); p.poly([[-9.8,-22],[-2,-24],[-1.4,-6],[-2,3],[-9.2,3],[-9.8,-2],[-9,-8],[-10,-14]]);
    p.F(R[2]); p.poly([[-9.8,-22],[-6,-23],[-5.6,-10],[-6.4,3],[-9.2,3],[-9.8,-2],[-9,-8],[-10,-14]]);
    p.F(R[3]); p.poly([[-9.8,-22],[-8,-22.4],[-7.6,-10],[-9,-8],[-10,-14]]);
    p.F(X[1]); p.poly([[1.6,-23],[9.6,-21],[10,-16],[2,-15]]); p.F(R[0]); p.poly([[3.6,-22],[9.6,-19.6],[9.2,-16.6],[3.4,-18]]);
    p.F(R[2]); p.poly([[-1,-13],[9.6,-15],[9.4,-13.6],[-1,-11.8]]); p.rect(1,-8,6,0.8); p.rect(-2,-5,5,0.8);
    folds(p,R,X);
    // barra verde-amarela na cava e estampa do berimbau no peito
    p.F(M.cordG[1]); p.poly([[3,-24],[4.8,-29.6],[5.8,-29.6],[4,-23.2]]); p.poly([[-2,-24],[-4,-29.6],[-5,-29.6],[-3,-23.2]]);
    p.F(M.cordG[2]); p.ell(3.4,-16,3.6,3.6); p.F(M.cordY[1]); p.ell(3.4,-16,2.6,2.6); p.F(M.cordG[1]); p.ell(3.4,-16,1.4,1.4);
    p.F(M.hair[2]); p.cap(P2(1.2,-21),P2(5.8,-11.6),0.7,0.7); p.F(M.gold[2]); p.ell(2.2,-12.6,1.2,1.4);
    // cós do abadá + corda (cordão trançado com nó e pontas)
    p.F(R[1]); p.poly([[-10.6,-2],[10.2,-2],[10.6,4.4],[-10.8,4.4]]); p.F(X[2]); p.poly([[-10.6,-2],[-2,-2],[-1.6,4.4],[-10.8,4.4]]); p.F(R[2]); p.poly([[-10.6,-2],[-5.6,-2],[-5,4.4],[-10.8,4.4]]); [0,3,6].forEach(x=>p.rect(x,0.6,0.8,3.8));
    p.F(M.cordG[1]); p.poly([[-10.9,-3.6],[10.4,-3.6],[10.6,-0.8],[-11.1,-0.8]]); p.F(M.cordG[2]); p.rect(-10.9,-1.6,21.4,0.8);
    p.F(M.cordY[1]); for(let x=-10;x<10;x+=2.6) p.poly([[x,-3.6],[x+1.4,-3.6],[x+2.2,-0.8],[x+0.8,-0.8]]);
    p.F(M.cordY[0]); for(let x=-9.6;x<10;x+=2.6) p.rect(x,-3.4,0.8,0.7);
    p.F(M.cordG[1]); p.ell(6.4,-2.2,2.8,2.4); p.F(M.cordY[1]); p.ell(6.8,-2.6,1.4,1.2);
    const sw=Math.max(-3,Math.min(3,(P.lean||0)*0.08));
    p.F(M.cordY[1]); p.cap(P2(7.2,-1),P2(8.6-sw,9),1.8,1.6); p.F(M.cordG[1]); p.cap(P2(5.8,-1),P2(5-sw,11),1.8,1.6);
    p.F(M.cordY[2]); p.rect(8-sw,3,1.2,0.7); p.F(M.cordG[2]); p.rect(4.8-sw,5,1.2,0.7);
    p.F(M.cordY[0]); p.ell(8.8-sw,10.6,2,2.8); p.F(M.cordY[2]); p.rect(7.8-sw,11.6,2,1.4);
    p.F(M.cordG[0]); p.ell(5-sw,12.6,2,2.8); p.F(M.cordG[2]); p.rect(4-sw,13.6,2,1.4);
    p.id();
  }
  function hairBack(p,M,sk){
    xfs(p.cx,sk.ha,sk.neck.x,sk.neck.y,HS,HS);
    // rabo de dreads preso no alto, caindo nas costas
    [[-6,-21,-15,-2],[-4,-22,-11.6,1],[-8,-19,-17,-7],[-3,-21,-7.4,3]].forEach(([x0,y0,x1,y1],k)=>{ p.F(M.hair[1]); p.cap(P2(x0,y0),P2(x1,y1),4.2,3.4); p.F(M.hairX[2]); p.cap(P2(x0-1,y0+2),P2(x1-1,y1),1.2,1); p.F(M.hair[0]); p.rect(x0+(x1-x0)*0.3,y0+(y1-y0)*0.3,1,1); });
    p.F(M.gold[1]); p.ell(-11.4,-6,1.4,1.4); p.ell(-14.4,-9,1.2,1.2); p.F(M.band[1]); p.ell(-8.6,-4,1.4,1.4);
    p.id();
  }
  function hairFront(p,M,P){
    // touca de dreads rentes + faixa vermelha na testa
    p.F(M.hair[1]); p.poly(dome(2.6,-15,10.9,11.2,40,200,14).concat([[-6.6,-8.6],[-4.4,-10.6],[-2.6,-15],[0,-17],[4,-19],[8,-19],[12.4,-18.6]]));
    p.F(M.hair[2]); p.poly([[-8.2,-10],[-8.4,-14.6],[-4,-15.6],[-2.6,-14],[-4.4,-10.6],[-6.6,-8.6]]);
    p.F(M.hairX[2]); [[-6,-24,-7,-17],[-2,-25.6,-3,-19],[2,-26,1.6,-20],[6,-25,6.4,-20],[9.6,-22.6,10.4,-19.6]].forEach(([a,b,c,d])=>p.cap(P2(a,b),P2(c,d),0.9,0.9));
    p.F(M.hair[0]); p.poly([[0,-25],[5,-25.4],[8,-23.6],[3.6,-23.6]]);
    p.F(M.band[1]); p.poly([[-7.2,-20.6],[0,-22],[8,-21.6],[12.8,-20.2],[12.6,-17.8],[8,-19],[0,-19.4],[-7.4,-17.8]]);
    p.F(M.band[2]); p.poly([[-7.4,-17.8],[0,-19.4],[8,-19],[12.6,-17.8],[12.6,-18.6],[8,-19.8],[0,-20.2],[-7.4,-18.8]]); p.F(M.band[0]); p.rect(2,-21.6,6,0.8);
    p.F(M.band[1]); p.poly([[-7.4,-19.6],[-12.6,-15.6],[-11.4,-14.4],[-6.6,-18]]); p.poly([[-7.2,-20],[-13.4,-19.4],[-12.8,-17.8],[-6.8,-18.6]]);
  }
  function beard(p,M){ p.F(M.hair[1]); p.poly([[7.8,-4],[12,-4.4],[11.4,0.6],[8.6,1]]); p.F(M.hair[2]); p.rect(8.6,-0.4,2.6,1); p.poly([[7,-8.6],[12.6,-8.8],[13,-7.2],[7.4,-7]]); }
  const cache=PIX.cache();
  function frame(skin,anim,fi,step=5){
    const K=PIX.getK(); if(!ANIMS[anim]) anim='idle'; const key=skin+anim+fi+step+'@'+K; if(cache.has(key)) return cache.get(key);
    if(cache.size>600) cache.delete(cache.keys().next().value);
    const P=poseOf(anim,fi), M=mats(skin), sk=skeleton(P,BODY);
    const kB=P.kick==='B', hp=kB?sk.hipB:sk.hipF, an=kB?sk.ankleB:sk.ankleF, kn=kB?sk.kneeB:sk.kneeF;
    const d=Math.hypot(an.x-kn.x,an.y-kn.y)||1, kt={x:an.x+(an.x-kn.x)/d*8,y:an.y+(an.y-kn.y)/d*8};
    // golpes de mão (kit comum): rastro e estrela no punho, girando no ombro
    const dh=Math.hypot(sk.wrF.x-sk.elF.x,sk.wrF.y-sk.elF.y)||1, ht={x:sk.wrF.x+(sk.wrF.x-sk.elF.x)/dh*6,y:sk.wrF.y+(sk.wrF.y-sk.elF.y)/dh*6};
    const tip=P.kick?kt:ht;
    const parts=[
      {back:true, draw:(c,u)=>arm(pen(c,u),M,sk,false,P)},
      {back:!kB, draw:(c,u)=>leg(pen(c,u),M,sk,false,P)},
      {draw:(c,u)=>hairBack(pen(c,u),M,sk)},
      {draw:(c,u)=>torso(pen(c,u),M,sk,P)},
      {draw:(c,u)=>leg(pen(c,u),M,sk,true,P)},
      {draw:(c,u)=>face(pen(c,u),M,sk,P,{front:hairFront,beard})},
    ];
    const sm={noShade:true,smear:true,draw:(c,u)=>smearArc(pen(c,u),M,P.kick?hp:sk.shF,tip,P.sa,P.smear>=2.5?22:15)};
    if(kB){ parts[1]={back:true,draw:()=>{}}; parts.splice(4,0,{draw:(c,u)=>leg(pen(c,u),M,sk,false,P)}); }
    if(P.smear>=0.5) parts.splice(kB?4:4,0,sm);
    parts.push({draw:(c,u)=>arm(pen(c,u),M,sk,true,P)});
    if(P.impact>=0.5) parts.push({noShade:true,smear:true,draw:(c,u)=>{ const p=pen(c,u); p.id(); star(p,tip,P.impact>=2?16:11,M.smear[1],M.smear[0]); }});
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash>=0.5,rim:RIM}); if(step>=4) thick(cv);
    const sc=q=>({x:q.x*K,y:q.y*K});
    cv._tip=sc(P.kick?tip:sk.wrF); cv._hand=sc(sk.wrF); cv._mouth=sc(sk.H(16,-5)); cv._head=sc(sk.H(4.5,-33.6)); cv._hip=sc(sk.hip);
    cache.set(key,cv); return cv;
  }
  return {FW,FH,GROUND,AX,SKINS,ANIMS,NAMES,poseOf,frame,mats};
})();
