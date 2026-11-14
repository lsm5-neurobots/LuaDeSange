/* AGRI — fonte de arte (editável). Build: npm run art */
/* Agricultor hi-bit: chapéu de palha, camisa aberta, botina, enxada (combo de enxadadas, especial: pancada no chão).
   Mesmo rig/proporção do HEROI e do VIGIA (base de luta baixa, 7–8 tons por região, sombra roxa, luz quente, contorno de 2 px embaixo). */
const AGRI=(function(){
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

  /* ---- AGRICULTOR: chapéu de palha, camisa xadrez aberta, calça de brim, botina, enxada ---- */
  const SKINS={media:{nome:'Pele média',hex:'#b4784c'}, escura:{nome:'Pele escura',hex:'#7a4a2e'}, clara:{nome:'Pele clara',hex:'#e4ae86'}};
  const BODY={f:0,FOOT:8,grip:-10};
  const HOE=34, BUTT=-15;
  function mats(skin){
    const h=SKINS[skin].hex;
    return Object.assign({},BASEM,{
      skin:R4(h,1.15), skinX:RX(h,1.15),
      hair:R4('#5a5048',0.9), hairX:RX('#5a5048',0.9),
      stub:ramp(mix(h,'#3a3430',0.45)),
      shirt:R4('#3f7a5a',1.15), shirtX:RX('#3f7a5a',1.15), plaid:R4('#e0c070',1.1),
      tank:R4('#e8e0c8',1), tankX:RX('#e8e0c8',1),
      pants:R4('#6a5a44',1.1), pantsX:RX('#6a5a44',1.1),
      boot:R4('#7a4a28',1.15), bootX:RX('#7a4a28',1.15),
      sole:['#8a7a68','#4a3e34','#302820','#1c1612'],
      belt:['#8a6440','#5a3c22','#3a2414','#1e120a'], buckle:['#fff4c0','#d8b860','#8a7030','#4a3a14'],
      straw:R4('#e4c06a',1.05), strawX:RX('#e4c06a',1.05), hband:R4('#8a2a22',1.1),
      wood:R4('#a8743c',1.1), woodX:RX('#a8743c',1.1),
      iron:['#ffffff','#b8bec6','#6e7480','#3a3e48'], rust:['#e09a5a','#a85a28','#6a3414','#3a1a08'],
      dirt:['#b48a5a','#7a5a36','#4e3820','#2a1c10'], leaf:['#c8f088','#6ac040','#2e7a22','#14400e'],
      trail:['#fff6d0','#f0d890','#a8823a','#5e4620'],
    });
  }
  const NAMES={skin:'Pele',shirt:'Camisa',pants:'Calça',boot:'Botina',straw:'Chapéu de palha',wood:'Cabo da enxada'};
  const GUARD=Object.assign({inhand:1,two:1},ST,K_({aFs:56,aFe:80,bA:146,aBs:40,aBe:100,lean:10,brow:1}));
  const G=o=>{ const r=K_(o); if(!r.nowide){ if(r.lFh!==undefined){ r.lFh+=14; r.lFk=(r.lFk||0)+3; } if(r.lBh!==undefined){ r.lBh-=12; r.lBk=(r.lBk!==undefined?r.lBk:-30)-10; } } delete r.nowide; return Object.assign({},GUARD,r); };
  const ANIMS=Object.assign({
    idle:{nome:'Parado (enxada em pé)',n:8,dur:()=>150,pose:i=>{ const p=i/8*Math.PI*2, s=S(p);
      return K_({two:0,lean:3+1.2*s,br:s,hx:1.2*S(p/2),head:1+1.2*S(p-0.7),lFh:26,lFk:4+2.2*s,lBh:-22,lBk:-24+2.2*s,aFs:66+2*s,aFe:86+3*s,bA:164+2*s,aBs:-24+2*s,aBe:40+3*s,blink:i===5?1:0}); }},
    walk:{nome:'Andar (enxada no ombro)',n:8,dur:()=>115,pose:i=>{ const p=i/8*Math.PI*2;
      return K_({two:0,plant:0,lFh:th(p,0),lFk:shn(p,0),lBh:th(p,Math.PI),lBk:shn(p,Math.PI),lean:2+1.4*S(2*p),head:S(2*p-0.6),aFs:24+3*S(p),aFe:150+3*S(p),bA:-122+4*S(2*p),aBs:-6+20*S(p),aBe:10+22*S(p)}); }},
    guard:{nome:'Guarda (enxada nas duas mãos)',n:8,dur:()=>125,pose:i=>{ const p=i/8*Math.PI*2, s=S(p); return Object.assign({},GUARD,K_({lean:10+1.2*s,aFs:56+3*s,aFe:80+4*s,bA:146+3*s,lFk:5+1.6*s,lBk:-38+1.6*s,head:-2+s,blink:i===6?1:0})); }},
    combo:{nome:'Combo: enxadada · varrida · pancada',n:12,hits:{2:1,6:2,10:3},dur:i=>[120,60,60,90,90,50,60,90,110,70,70,180][i],pose:i=>G([
      {aFs:156,aFe:186,bA:214,lean:-12,head:-4,hx:-3,lFh:22,lFk:0,lBh:-18,lBk:-28,mouth:1,brow:1},
      {aFs:168,aFe:198,bA:232,lean:-14,head:-6,hx:-3,lFh:24,lBh:-20,lBk:-30,mouth:1,brow:1},
      {aFs:86,aFe:74,bA:74,lean:30,hx:13,head:-12,mouth:2,brow:1,smear:1,sa:224,lFh:50,lFk:10,lBh:-32,lBk:-36},
      {aFs:80,aFe:62,bA:56,lean:32,hx:13,head:-10,mouth:1,lFh:50,lFk:10,lBh:-32,lBk:-36},
      {tw:-0.3,aFs:-24,aFe:20,bA:-66,lean:-4,hx:6,lFh:34,lFk:4,lBh:-26,lBk:-36,brow:1},
      {tw:-0.1,aFs:10,aFe:50,bA:-20,lean:2,hx:6,lFh:36,lFk:6,lBh:-28,lBk:-38},
      {tw:0.9,aFs:92,aFe:96,bA:98,lean:22,hx:13,head:-10,mouth:2,smear:2,sa:-40,lFh:50,lFk:10,lBh:-32,lBk:-36},
      {tw:0.7,aFs:118,aFe:140,bA:146,lean:12,hx:12,head:-8,mouth:1,lFh:50,lFk:10,lBh:-32,lBk:-36},
      {aFs:166,aFe:200,bA:236,lean:-16,hx:4,head:-8,brow:1,mouth:1,lift:2,plant:0,lFh:46,lFk:-14,lBh:-8,lBk:-56},
      {aFs:174,aFe:208,bA:248,lean:-18,hx:6,mouth:1,lift:9,plant:0,lFh:62,lFk:-8,lBh:14,lBk:-56,nowide:1},
      {tw:0.9,aFs:70,aFe:52,bA:36,lean:40,hx:15,head:-14,mouth:2,brow:1,smear:3,sa:236,impact:1,lFh:54,lFk:12,lBh:-32,lBk:-36},
      {tw:0.7,aFs:66,aFe:48,bA:34,lean:36,hx:14,head:-12,mouth:1,lFh:54,lFk:12,lBh:-32,lBk:-36}][i])},
    special:{nome:'Especial: pancada na terra',n:8,dur:i=>[150,110,90,170,150,120,120,140][i],pose:i=>G([
      {aFs:150,aFe:186,bA:226,lean:-10,brow:1,mouth:1,lFh:40,lFk:-14,lBh:-14,lBk:-50,nowide:1},
      {aFs:176,aFe:206,bA:244,lean:-16,brow:1,mouth:2,lift:16,plant:0,lFh:64,lFk:0,lBh:18,lBk:-40,nowide:1},
      {aFs:66,aFe:40,bA:22,lean:38,hx:10,mouth:2,brow:1,smear:3,sa:240,impact:2,fx:1,lFh:90,lFk:-14,lBh:6,lBk:-96,nowide:1},
      {aFs:64,aFe:38,bA:20,lean:36,hx:10,mouth:2,brow:1,impact:1,fx:2,lFh:90,lFk:-14,lBh:6,lBk:-96,nowide:1},
      {aFs:62,aFe:40,bA:22,lean:32,hx:9,mouth:1,brow:1,fx:3,lFh:90,lFk:-14,lBh:6,lBk:-96,nowide:1},
      {aFs:50,aFe:60,bA:80,lean:20,hx:6,fx:4,lFh:54,lFk:-8,lBh:-28,lBk:-62,nowide:1},
      {aFs:40,aFe:76,bA:120,lean:8,hx:3,lFh:34,lFk:2,lBh:-24,lBk:-34,nowide:1},
      {lean:5,mouth:3}][i])},
    victory:{nome:'Vitória: enxada pro alto',n:8,dur:i=>[140,90,90,90,120,160,200,400][i],pose:i=>K_([
      Object.assign({},GUARD,{lean:2,mouth:3,brow:3}),
      {two:0,lFh:18,lFk:2,lBh:-16,lBk:-18,lean:-2,aFs:60,aFe:120,bA:200,aBs:-20,aBe:20,mouth:3,brow:3},
      {two:0,lFh:18,lFk:2,lBh:-16,lBk:-18,lean:-4,aFs:100,aFe:150,bA:300,aBs:-20,aBe:20,mouth:3,brow:3,smear:1,sa:40},
      {two:0,lFh:18,lFk:2,lBh:-16,lBk:-18,lean:-6,aFs:130,aFe:170,bA:400,aBs:-20,aBe:20,mouth:3,brow:3},
      {two:0,lFh:22,lFk:4,lBh:-20,lBk:-22,lean:-8,head:-10,aFs:166,aFe:176,bA:178,aBs:-30,aBe:40,mouth:2,brow:3,lift:3,plant:0},
      {two:0,lFh:22,lFk:4,lBh:-20,lBk:-22,lean:-8,head:-12,aFs:166,aFe:176,bA:178,aBs:-30,aBe:40,mouth:2,brow:3},
      {two:0,lFh:22,lFk:4,lBh:-20,lBk:-22,lean:-6,head:-8,aFs:166,aFe:176,bA:178,aBs:-34,aBe:44,mouth:3,brow:3},
      {two:0,lFh:22,lFk:4,lBh:-20,lBk:-22,lean:-6,head:-6,aFs:166,aFe:176,bA:178,aBs:-34,aBe:44,mouth:3,brow:3,blink:2}][i])},
  },commonAnims(GUARD,G,()=>({bA:-120,aFs:24,aFe:150})));
  Object.assign(ANIMS,STRIKES.tool(G,{two:true,slow:1.08,names:{atkH:'Varrida de enxada',atkV:'Enxadada por cima',atkS:'Cutucada com o cabo',atkSpin:'Giro da enxada',atkFin:'Enxadada de baixo (lança)'}}));
  Object.assign(ANIMS,MOVESET.kit(G,{two:true,slow:1.08}),MOVESET.sigs(G,{two:true,slow:1.08},[
    ['sigCapina','chops3','Capina (três enxadadas)'],
    ['sigTerra','uppercutSlam','Enxadada que levanta terra']]));
  function poseOf(anim,i){ return Object.assign({},REST,ANIMS[anim].pose(i)); }
  /* ---- desenho ---- */
  function boot(p,M,a,ang,sc){
    xfs(p.cx,ang,a.x,a.y,sc,sc);
    p.F(M.boot[1]); p.poly([[-5.4,-6.4],[3,-6.4],[3.6,-2],[6,-0.6],[11,0.6],[12.8,3],[12.6,4.6],[-6,4.6],[-6.2,-2]]);
    p.F(M.bootX[2]); p.poly([[-6.2,-2],[-5.4,-6.4],[0,-6.4],[-0.6,4.6],[-6,4.6]]);
    p.F(M.boot[2]); p.poly([[-6.2,-2],[-5.4,-6.4],[-3,-6.4],[-3.6,4.6],[-6,4.6]]); p.F(M.boot[3]); p.rect(-6.2,0,1.4,4.6);
    p.F(M.boot[0]); p.poly([[7.6,0.2],[11,0.6],[12.8,3],[12.4,3.4],[8,2]]); p.rect(-4,-6.4,6,1); p.F(M.bootX[0]); p.rect(9.6,0.8,1.6,0.8);
    p.F(M.boot[2]); p.poly([[3,-1.4],[8,0],[7.6,1],[3,0]]); p.F(M.boot[3]); p.rect(-5.4,-3.6,8.6,0.8);
    p.F(M.dirt[1]); p.rect(9,2.6,2,1); p.rect(-2,2.6,1.6,1.2); p.F(M.dirt[2]); p.rect(4,3,1.4,1);
    p.F(M.sole[1]); p.poly([[-6.6,3.6],[13,3.6],[13.4,5.2],[12.4,6.2],[-6.6,6.2]]); p.F(M.sole[2]); p.rect(-6.6,5.3,19,0.9); for(let x=-5;x<12;x+=2.6) p.rect(x,5.2,1.2,1);
    p.id();
  }
  function hoe(p,M,wr,dir,P){
    p.xf(dir,wr.x,wr.y);
    // cabo de madeira com veio
    p.F(M.wood[2]); p.cap(P2(BUTT,0.4),P2(HOE,0.4),3.8,3.6); p.F(M.wood[1]); p.cap(P2(BUTT,-0.2),P2(HOE,-0.2),3.2,3);
    p.F(M.woodX[0]); p.rect(BUTT+1,-1.6,HOE-BUTT-4,0.8); p.F(M.wood[3]); p.rect(BUTT+1,1.2,HOE-BUTT-2,0.7);
    p.F(M.wood[2]); [[-10,-0.4],[6,0.2],[18,-0.4],[27,0.2]].forEach(([x,y])=>p.rect(x,y,4,0.6));
    // olho (argola) e lâmina da enxada
    p.F(M.iron[3]); p.rect(HOE-3,-3,5.2,6); p.F(M.iron[2]); p.rect(HOE-2.6,-2.6,4.4,5.2); p.F(M.iron[0]); p.rect(HOE-2.6,-2.6,4.4,0.9);
    p.F(M.iron[3]); p.poly([[HOE-4,1.6],[HOE+3.6,1.6],[HOE+6.6,15],[HOE-6.4,15]]);
    p.F(M.iron[2]); p.poly([[HOE-3.4,2.2],[HOE+3,2.2],[HOE+5.8,14.2],[HOE-5.6,14.2]]);
    p.F(M.iron[1]); p.poly([[HOE-1.4,2.2],[HOE+3,2.2],[HOE+5.8,14.2],[HOE+0.6,14.2]]);
    p.F(M.iron[0]); p.poly([[HOE-5.8,12.8],[HOE+5.8,12.8],[HOE+6,14.4],[HOE-5.8,14.4]]); p.rect(HOE+1.6,3.4,0.8,7);
    p.F(M.rust[1]); p.rect(HOE-3,5,2,1.6); p.rect(HOE-4,9,1.4,1.2); p.F(M.rust[2]); p.rect(HOE-2.4,6.4,1,1);
    p.F(M.dirt[1]); p.rect(HOE-5,11.4,3,1); p.rect(HOE+2.4,11.8,2,0.8);
    p.id();
  }
  function arm(p,M,sk,front,P){
    const sh=front?sk.shF:sk.shB, el=front?sk.elF:sk.elB, wr=front?sk.wrF:sk.wrB;
    armBase(p,M,sh,el,wr,{f:0,sleeve:'shirt',to:0.8,extra:(p,M,sh,el,wr)=>{ const q=lerp(sh,el,0.4); p.F(M.plaid[2]); p.cap({x:q.x-6,y:q.y+0.4},{x:q.x+6,y:q.y-0.4},1,1); const r=lerp(sh,el,0.2); p.F(M.shirt[3]); p.cap({x:r.x-6,y:r.y},{x:r.x+6,y:r.y},0.8,0.8); }});
    fist(p,M,el,wr,0);
  }
  function leg(p,M,sk,front,P){
    legBase(p,M,sk,front,P,{pants:'pants',hemC:'pants',foot:boot,extra:(p,M,hip,knee,ankle,front)=>{
      if(front){ p.F(M.dirt[1]); p.ell(knee.x+1.4,knee.y+1.4,2.6,1.6); p.F(M.dirt[2]); p.rect(knee.x,knee.y+2,1.4,0.8);
        const q=lerp(hip,knee,0.5), ang=Math.atan2(knee.y-hip.y,knee.x-hip.x); p.xf(ang,q.x,q.y); p.F(M.pants[3]); p.rect(-4.4,-0.6,8.8,6.6); p.F(M.pants[1]); p.rect(-3.8,0,7.6,5.4); p.F(M.pantsX[1]); p.rect(-3.8,0,7.6,1.4); p.F(M.pants[0]); p.rect(-4.4,-1.6,8.8,1.4); p.F(M.plaid[2]); [[-2.6,1],[2,3.4]].forEach(([x,y])=>p.rect(x,y,0.8,0.8)); p.id(); }
    }});
  }
  function torso(p,M,sk,P){
    torsoBase(p,M,sk,M.skin,M.skinX);
    // peito exposto: peitoral, abdômen, pelos
    p.F(M.skin[2]); p.poly([[2,-19],[11.6,-21],[11.2,-19.6],[2.4,-17.6]]); p.rect(5.4,-16,0.9,12); p.rect(3,-12,6.4,0.8); p.rect(3.2,-7.6,6,0.8);
    p.F(M.skin[0]); p.poly([[4,-27],[10,-26],[11,-23],[6,-23.6]]);
    p.F(M.stub[2]); [[6,-21.6],[7.6,-22.6],[8.6,-21],[5,-20.4],[7,-18.6]].forEach(([x,y])=>p.rect(x,y,0.9,0.9));
    // camisa xadrez aberta: corpo nas costas + aba da frente pendurada
    const R=M.shirt, X=M.shirtX;
    p.F(R[1]); p.poly([[-9.6,3.4],[3.4,3.4],[2.4,-8],[1.6,-20],[0.4,-31],[-3.6,-32.6],[-10.6,-30],[-13,-25.6],[-12.6,-20],[-10.4,-14],[-9.2,-8],[-10.2,-2]]);
    p.F(X[2]); p.poly([[-13,-25.6],[-2,-27.6],[-1.2,-17],[-2,-6],[-2,3.4],[-9.6,3.4],[-10.2,-2],[-9.2,-8],[-10.4,-14],[-12.6,-20]]);
    p.F(R[2]); p.poly([[-13,-25.6],[-6.4,-27.4],[-5.6,-18],[-6,-9],[-5.4,3.4],[-9.6,3.4],[-10.2,-2],[-9.2,-8],[-10.4,-14],[-12.6,-20]]);
    p.F(R[3]); p.poly([[-13,-25.6],[-10,-26.6],[-9.6,-18],[-10.4,-14],[-12.6,-20]]);
    p.F(X[1]); p.poly([[-3,-30],[0,-30.6],[1.2,-20],[-1,-21]]);
    // aba da frente (esvoaça com o corpo)
    const fl=Math.max(-2,Math.min(3,(P.lean||0)*0.06));
    p.F(R[1]); p.poly([[9.4,-28.6],[12.6,-25.4],[12.8,-18],[11.4,-10],[11.6+fl,3.4],[8.2+fl,3.4],[8.6,-10],[10,-19],[9.6,-25]]);
    p.F(R[2]); p.poly([[9.4,-28.6],[10.2,-27],[10.4,-19],[9.2,-10],[9.4+fl,3.4],[8.2+fl,3.4],[8.6,-10],[10,-19],[9.6,-25]]);
    p.F(X[0]); p.rect(11.4,-24,0.8,5);
    // xadrez (listras claras e escuras)
    p.F(M.plaid[2]); [-24,-16,-8,0].forEach(y=>p.rect(-11.6,y,13,0.8)); [-8,-3].forEach(x=>p.rect(x,-29,0.8,32)); [-22,-12,-2].forEach(y=>p.rect(8.8,y,3.4,0.8));
    p.F(R[3]); [-20,-12,-4].forEach(y=>p.rect(-11.2,y,12.6,0.8)); p.rect(-5.6,-28,0.8,31); p.rect(10.6,-26,0.8,28);
    p.F(M.plaid[1]); [[-8,-24],[-3,-16],[-8,-8],[-3,0]].forEach(([x,y])=>p.rect(x,y,0.8,0.8));
    // gola
    p.F(R[1]); p.poly([[-3.6,-33.4],[1.8,-34.6],[3,-29],[0,-30.4]]); p.poly([[5.6,-33.6],[10.4,-31.4],[9.4,-27.6],[6.6,-29.4]]);
    p.F(R[0]); p.rect(-2.6,-33.6,3,0.8); p.rect(6.4,-33.2,3,0.8); p.F(R[3]); p.rect(-3.4,-31,2,0.8);
    p.F(M.skin[1]); p.poly([[0.4,-33.2],[5.8,-33.4],[3.4,-29.4]]); p.F(M.skin[2]); p.poly([[0.4,-33.2],[2,-33.2],[2.8,-30]]);
    // calça: cós, cinto de couro, fivela
    p.F(M.pants[1]); p.poly([[-10.6,-2],[10.2,-2],[10.6,4.4],[-10.8,4.4]]); p.F(M.pantsX[2]); p.poly([[-10.6,-2],[-2,-2],[-1.6,4.4],[-10.8,4.4]]); p.F(M.pants[2]); p.poly([[-10.6,-2],[-5.6,-2],[-5,4.4],[-10.8,4.4]]); p.rect(4,0,0.8,4.4);
    p.F(M.belt[1]); p.poly([[-10.8,-3],[10.4,-3],[10.6,-0.4],[-11,-0.4]]); p.F(M.belt[2]); p.rect(-10.8,-3,6,2.6); p.F(M.belt[0]); p.rect(-4,-3,13,0.7); p.F(M.belt[3]); p.rect(-10.8,-0.9,21.4,0.6);
    p.F(M.buckle[1]); p.rect(5,-3.6,3.6,3.6); p.F(M.belt[2]); p.rect(6,-2.6,1.6,1.6); p.F(M.buckle[0]); p.rect(5,-3.6,3.6,0.8);
    // lenço vermelho no bolso de trás
    p.F(M.hband[1]); p.poly([[-10.4,-1],[-7.6,-1],[-8.4,6],[-10.6,4.4]]); p.F(M.hband[2]); p.rect(-10,1,1.6,0.8);
    p.id();
  }
  function beard(p,M,P){
    p.F(M.stub[1]); p.poly([[0.4,-8.6],[2,-4],[6,-0.2],[9.8,0],[12,-2.4],[12.6,-4.4],[11.4,-4],[9,-3.4],[6.8,-4.2],[4,-7],[2.4,-9.4]]); p.F(M.stub[2]); p.poly([[0.4,-8.6],[2,-4],[4.6,-1.6],[3,-5.6]]);
    p.F(M.skin[2]); p.rect(2,-11,2,0.7); p.rect(4,-19.6,4,0.6); // rugas de sol
  }
  function hat(p,M,P){
    // bigode grisalho
    p.F(M.hair[1]); p.poly([[6.6,-8.8],[13.2,-9],[14,-6.6],[12.6,-5.8],[10.4,-7.2],[7.6,-6.2],[6.2,-7]]); p.F(M.hair[0]); p.rect(8.6,-8.8,3.4,0.8);
    // costeleta
    p.F(M.hair[1]); p.poly([[-1.4,-17],[1,-17],[0.8,-10.4],[-1,-10]]); p.poly([[-8.6,-17],[-4,-17.4],[-4.6,-10],[-8,-11]]); p.F(M.hair[0]); p.rect(-7,-15,1.2,0.8);
    // chapéu de palha: copa, fita e aba larga trançada
    const SR=M.straw, SX=M.strawX;
    p.F(SR[1]); p.poly(dome(2.4,-21,10.4,8.6,0,180,14));
    p.F(SR[2]); p.poly(dome(2.4,-21,10.4,8.6,120,180,6).concat([[-4,-21]])); p.F(SX[0]); p.poly([[2,-29],[7,-28],[10,-25],[5,-26.6]]);
    p.F(M.hband[1]); p.poly([[-8.2,-24.6],[13,-24.6],[13,-21.4],[-8.2,-21.4]]); p.F(M.hband[2]); p.rect(-8.2,-22.4,21.2,1); p.F(M.hband[0]); p.rect(0,-24.6,9,0.7);
    p.F(SR[1]); p.ell(3,-20.4,19.4,3.6); p.F(SR[2]); p.poly([[-16.4,-20],[-6,-21.2],[12,-21.2],[22,-20],[20,-18.2],[3,-17.2],[-14,-18.2]]);
    p.F(SR[3]); p.poly([[-14,-18.2],[3,-17.2],[20,-18.2],[18,-17.4],[3,-16.6],[-12,-17.4]]);
    p.F(SX[1]); p.poly([[-12,-22.6],[3,-23.8],[18,-22.6],[20,-21.6],[3,-22.4],[-14,-21.6]]); p.F(SR[0]); p.rect(6,-23.8,10,0.8);
    p.F(SR[2]); for(let x=-14;x<21;x+=3.2) p.rect(x,-20.6+Math.abs(x-3)*0.03,1.6,0.7); [[-2,-27],[4,-28],[8,-26]].forEach(([x,y])=>p.rect(x,y,1.4,0.7));
    p.F(SR[3]); p.rect(-17,-20.6,1.4,1); p.rect(21.4,-20.4,1.4,1); p.F(SR[1]); p.rect(-18,-19.6,1,1.4);
  }
  function dirtFX(p,M,c,k){
    p.id(); const y=GROUND-1, x=c.x, s=[1,1.4,1,0.6][k-1]||0.5, up=[0,8,16,22][k-1]||22;
    p.F(M.dirt[2]); p.ell(x,y,18*s+6,3.4); p.F(M.dirt[1]); p.ell(x,y-1,12*s+4,2.4);
    [[-14,-10],[10,-14],[-4,-18],[18,-8],[-20,-4],[4,-24]].forEach(([dx,dy],j)=>{ const yy=y+dy*s-(j%2?up*0.3:up*0.15); p.F(M.dirt[j%3===0?0:1]); p.ell(x+dx*s*1.3,yy,2.6*s+0.8,2.2*s+0.6); p.F(M.dirt[3]); p.rect(x+dx*s*1.3-1,yy+1,2,0.8); });
    if(k>=2){ [[-8,-6],[6,-5],[14,-3]].forEach(([dx,dy])=>{ p.F(M.leaf[2]); p.rect(x+dx-0.4,y+dy,0.9,-dy); p.F(M.leaf[1]); p.ell(x+dx-2,y+dy-0.6,2,1.2,-0.5); p.ell(x+dx+2,y+dy-1.2,2,1.2,0.5); p.F(M.leaf[0]); p.rect(x+dx+1.4,y+dy-1.8,1,0.6); }); }
  }
  const cache=PIX.cache();
  function frame(skin,anim,fi,step=5){
    const K=PIX.getK(); if(!ANIMS[anim]) anim='idle'; const key=skin+anim+fi+step+'@'+K; if(cache.has(key)) return cache.get(key);
    if(cache.size>600) cache.delete(cache.keys().next().value);
    const P=poseOf(anim,fi), M=mats(skin), sk=skeleton(P,BODY);
    const d=sk.bDir, tip={x:sk.wrF.x+Math.cos(d)*HOE-Math.sin(d)*13,y:sk.wrF.y+Math.sin(d)*HOE+Math.cos(d)*13};
    const parts=[
      {back:true, draw:(c,u)=>arm(pen(c,u),M,sk,false,P)},
      {back:true, draw:(c,u)=>leg(pen(c,u),M,sk,false,P)},
      {draw:(c,u)=>torso(pen(c,u),M,sk,P)},
      {draw:(c,u)=>leg(pen(c,u),M,sk,true,P)},
      {draw:(c,u)=>face(pen(c,u),M,sk,P,{beard,front:hat,brow:2})},
      {draw:(c,u)=>hoe(pen(c,u),M,sk.wrF,d,P)},
    ];
    if(P.two>=0.5) parts.push({back:true,draw:(c,u)=>fist(pen(c,u),M,sk.elB,sk.wrB,0)});
    const kt=P.kick?MOVESET.kickTip(sk,P):null;
    if(P.smear>=0.5) parts.push({noShade:true,smear:true,draw:(c,u)=>kt?MOVESET.kickSmear(pen(c,u),M,sk,P):smearArc(pen(c,u),M,sk.shF,tip,P.sa,P.smear>=2.5?22:15)});
    parts.push({draw:(c,u)=>arm(pen(c,u),M,sk,true,P)});
    if(P.fx>=0.5) parts.push({noShade:true,smear:true,draw:(c,u)=>dirtFX(pen(c,u),M,tip,Math.round(P.fx))});
    if(P.impact>=0.5) parts.push({noShade:true,smear:true,draw:(c,u)=>{ const p=pen(c,u); p.id(); star(p,kt||tip,P.impact>=2?16:11,M.smear[1],M.smear[0]); }});
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash>=0.5,rim:RIM}); if(step>=4) thick(cv);
    const sc=q=>({x:q.x*K,y:q.y*K});
    cv._tip=sc(tip); cv._hand=sc(sk.wrF); cv._mouth=sc(sk.H(16,-5)); cv._head=sc(sk.H(4.5,-33.6)); cv._hip=sc(sk.hip);
    cache.set(key,cv); return cv;
  }
  return {FW,FH,GROUND,AX,SKINS,ANIMS,NAMES,poseOf,frame,mats};
})();
