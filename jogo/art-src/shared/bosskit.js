/* BOSSKIT — fonte de arte (editável). Build: npm run art
   Utilidades compartilhadas pelos chefes dos mapas novos (Ascensorista, Vendedor de Fitas, Estivador, Erveira):
   cor (saturação +15% e rampas intermediárias = 6+ tons por material), placas de sombra, dobras de tecido,
   costuras, correntes, cordas, chamas, poeira, faíscas, raios, esqueleto humanoide e a montagem do quadro
   (cache por escala PIX.getK(), adereços em quadro pequeno). Mesmo contrato das factories atuais (ACOU, MEIANOITE). */
const BOSSKIT=(function(){
  const {rad,lp,lerp,P2,mkPen,compose}=PIX;
  const S=Math.sin, C=Math.cos, PI=Math.PI;
  const st={CTX:null,QM:null};

  /* ---------------- cor ---------------- */
  function hsl(h){ const [r,g,b]=PIX.hexRgb(h).map(v=>v/255), mx=Math.max(r,g,b), mn=Math.min(r,g,b), l=(mx+mn)/2; let s=0,hh=0;
    if(mx!==mn){ const d=mx-mn; s=l>0.5?d/(2-mx-mn):d/(mx+mn); hh=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4; hh/=6; } return [hh,s,l]; }
  function hex(hh,s,l){ const f=(p,q,t)=>{ if(t<0)t+=1; if(t>1)t-=1; return t<1/6?p+(q-p)*6*t:t<1/2?q:t<2/3?p+(q-p)*(2/3-t)*6:p; };
    let r,g,b; if(s===0){ r=g=b=l; } else { const q=l<0.5?l*(1+s):l+s-l*s, p=2*l-q; r=f(p,q,hh+1/3); g=f(p,q,hh); b=f(p,q,hh-1/3); } return PIX.toHex(r*255,g*255,b*255); }
  const sat=(h,k=1.15)=>{ const [a,s,l]=hsl(h); return hex(a,Math.min(1,s*k),l); };
  // rampas de 4 tons viram 8 (Q = meia-luz quente, meia-sombra roxa, sombra e oclusão)
  function finish(m,skip){ const used=new Set(), uniq=h=>{ let x=h, k=0; while(used.has(x)){ const [r,g,b]=PIX.hexRgb(h); k++; x=PIX.toHex(r>128?r-k:r+k,g,b>128?b-(k>>1):b+(k>>1)); } used.add(x); return x; };
    for(const k of Object.keys(m)){ if(!skip.includes(k)) m[k]=m[k].map(h=>sat(h)); }
    for(const k of Object.keys(m)){ if(skip.includes(k)) continue; const r=m[k];
      m[k+'Q']=[PIX.mix(PIX.mix(r[0],r[1],0.5),'#ffd9a0',0.12), PIX.mix(PIX.mix(r[1],r[2],0.5),'#6a3ca0',0.16), PIX.mix(r[2],'#3b2c63',0.3), PIX.mix(r[3],'#1c1233',0.35)]; }
    for(const k of Object.keys(m)) m[k]=m[k].map(uniq);
    return m; }
  const qOf=R=>{ const QM=st.QM; if(!QM) return R; for(const k in QM) if(QM[k]===R) return QM[k+'Q']||R; return R; };

  /* ---------------- volume em placas ---------------- */
  const LIGHT={x:0.6,y:-0.8};
  function lightLocal(ang){ return [LIGHT.x*C(-ang)-LIGHT.y*S(-ang), LIGHT.x*S(-ang)+LIGHT.y*C(-ang)]; }
  function shadeIn(p,R,Q,cx,cy,rx,ry,ang,hi,rot){
    const [lx,ly]=lightLocal(ang);
    p.F(Q[1]); p.ell(cx-lx*rx*0.8,cy-ly*ry*0.8,rx,ry,rot);
    p.F(R[2]); p.ell(cx-lx*rx*1.05,cy-ly*ry*1.05,rx,ry,rot);
    p.F(R[3]); p.ell(cx-lx*rx*1.45,cy-ly*ry*1.45,rx,ry,rot);
    if(hi){ p.F(Q[0]); p.ell(cx+lx*rx*1.12,cy+ly*ry*1.12,rx,ry,rot); p.F(R[0]); p.ell(cx+lx*rx*1.5,cy+ly*ry*1.5,rx*(0.7+0.3*hi),ry*(0.7+0.3*hi),rot); }
  }
  function mass(p,R,cx,cy,rx,ry,ang=0,hi=1,rot=0){ rx=Math.max(0.5,Math.abs(rx)); ry=Math.max(0.5,Math.abs(ry));
    const Q=qOf(R), X=st.CTX;
    p.F(R[1]); p.ell(cx,cy,rx,ry,rot);
    X.save(); X.beginPath(); X.ellipse(cx,cy,Math.max(0.1,rx),Math.max(0.1,ry),rot,0,PI*2); X.clip();
    shadeIn(p,R,Q,cx,cy,rx,ry,ang,hi,rot); X.restore();
  }
  function bbox(pts){ let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9; pts.forEach(([x,y])=>{ x0=Math.min(x0,x); y0=Math.min(y0,y); x1=Math.max(x1,x); y1=Math.max(y1,y); }); return [x0,y0,x1,y1]; }
  function platePoly(p,R,pts,ang=0,hi=1){
    const Q=qOf(R), [x0,y0,x1,y1]=bbox(pts), cx=(x0+x1)/2, cy=(y0+y1)/2, rx=(x1-x0)/2+0.5, ry=(y1-y0)/2+0.5;
    p.F(R[1]); p.poly(pts);
    clipPoly(pts,()=>shadeIn(p,R,Q,cx,cy,rx,ry,ang,hi,0));
  }
  function clipPoly(pts,fn){ const X=st.CTX; X.save(); X.beginPath(); pts.forEach((q,i)=>i?X.lineTo(q[0],q[1]):X.moveTo(q[0],q[1])); X.closePath(); X.clip(); fn(); X.restore(); }
  function clipEll(cx,cy,rx,ry,rot,fn){ const X=st.CTX; X.save(); X.beginPath(); X.ellipse(cx,cy,rx,ry,rot,0,PI*2); X.clip(); fn(); X.restore(); }

  /* ---------------- linhas ---------------- */
  function band(p,pts,w){ for(let k=0;k<pts.length-1;k++) p.cap(pts[k],pts[k+1],w,w); }
  const bandA=(p,arr,w)=>band(p,arr.map(q=>P2(q[0],q[1])),w);
  function ellPts(cx,cy,rx,ry,a0,a1,n){ const o=[]; for(let k=0;k<=n;k++){ const t=rad(a0+(a1-a0)*k/n); o.push([cx+C(t)*rx,cy+S(t)*ry]); } return o; }
  function arc(p,cx,cy,rx,ry,a0,a1,w,n=8){ bandA(p,ellPts(cx,cy,rx,ry,a0,a1,n),w); }
  function bez(a,b,c,n){ const o=[]; for(let k=0;k<=n;k++){ const t=k/n, u=1-t; o.push({x:u*u*a.x+2*u*t*b.x+t*t*c.x, y:u*u*a.y+2*u*t*b.y+t*t*c.y}); } return o; }
  function bez3(a,b,c,d,n){ const o=[]; for(let k=0;k<=n;k++){ const t=k/n, u=1-t; o.push({x:u*u*u*a.x+3*u*u*t*b.x+3*u*t*t*c.x+t*t*t*d.x, y:u*u*u*a.y+3*u*u*t*b.y+3*u*t*t*c.y+t*t*t*d.y}); } return o; }
  function limb(p,a,b){ const ang=Math.atan2(b.y-a.y,b.x-a.x); p.xf(ang,a.x,a.y); return {ang,L:Math.hypot(b.x-a.x,b.y-a.y)}; }
  // dobra de tecido: brilho deslocado pra luz + sulco escuro
  function fold(p,R,f,w=1.7){ p.F(R[0]); bandA(p,f.map(q=>[q[0]+1.4,q[1]-1.2]),w*0.65); p.F(R[3]); bandA(p,f,w); }
  function stitches(p,R,pts,step=4,len=3){
    p.F(R[2]); bandA(p,pts,1); p.F(R[1]);
    for(let s=0;s<pts.length-1;s++){ const a=pts[s], b=pts[s+1], L=Math.hypot(b[0]-a[0],b[1]-a[1])||1, n=Math.max(1,Math.floor(L/step)), nx=-(b[1]-a[1])/L, ny=(b[0]-a[0])/L;
      for(let k=0;k<n;k++){ const t=(k+0.5)/n, x=a[0]+(b[0]-a[0])*t, y=a[1]+(b[1]-a[1])*t; p.cap(P2(x-nx*len/2,y-ny*len/2),P2(x+nx*len/2,y+ny*len/2),0.9,0.9); } }
  }
  function rivets(p,R,list,r=1.6){ list.forEach(([x,y])=>{ p.F(R[3]); p.circle(P2(x+0.5,y+0.6),r); p.F(R[1]); p.circle(P2(x,y),r); p.F(R[0]); p.rect(x-r*0.5,y-r*0.7,Math.max(1,r*0.6),1); }); }
  const rnd=(s,k)=>{ const v=Math.sin(s*12.9898+k*78.233)*43758.5453; return v-Math.floor(v); };
  function stain(p,B,x,y,r,drips,seed=1){
    p.F(B[2]);
    for(let k=0;k<5;k++){ const a=rnd(seed,k)*PI*2, d=rnd(seed,k+9)*r*0.7; p.ell(x+C(a)*d,y+S(a)*d*0.7,r*(0.35+rnd(seed,k+3)*0.35),r*(0.25+rnd(seed,k+5)*0.3)); }
    for(let k=0;k<drips;k++){ const dx=(rnd(seed,k+20)-0.5)*r*1.4, L=r*(0.8+rnd(seed,k+30)*1.6); p.rect(x+dx-0.7,y,1.4,L); p.ell(x+dx,y+L,1.2,1.4); }
    p.F(B[1]); for(let k=0;k<2;k++){ const a=rnd(seed,k+40)*PI*2, d=rnd(seed,k+50)*r*0.4; p.ell(x+C(a)*d,y+S(a)*d*0.6-r*0.1,r*0.3,r*0.2); }
  }
  // corrente de elos alternados (R = rampa do ferro)
  function chain(p,R,pts,sz=1){
    let alt=0;
    for(let s=0;s<pts.length-1;s++){ const a=pts[s], b=pts[s+1], L=Math.hypot(b.x-a.x,b.y-a.y), n=Math.max(1,Math.round(L/(5*sz))), ang=Math.atan2(b.y-a.y,b.x-a.x);
      for(let k=0;k<n;k++){ const q=lerp(a,b,(k+0.5)/n);
        if(alt%2===0){ p.F(R[1]); p.ell(q.x,q.y,3.4*sz,2.5*sz,ang); p.F(R[3]); p.ell(q.x,q.y,1.5*sz,0.8*sz,ang); p.F(R[0]); p.ell(q.x-0.6*sz,q.y-1.4*sz,1.2*sz,0.6*sz,ang); }
        else { p.F(R[2]); p.ell(q.x,q.y,3.2*sz,1.2*sz,ang); }
        alt++; } }
  }
  // cabo de aço / corda torcida: base + listras diagonais
  function rope(p,R,pts,w=3){
    p.F(R[2]); band(p,pts,w); p.F(R[1]); band(p,pts.map(q=>P2(q.x-0.3,q.y-w*0.18)),w*0.55);
    for(let s=0;s<pts.length-1;s++){ const a=pts[s], b=pts[s+1], L=Math.hypot(b.x-a.x,b.y-a.y)||1, n=Math.max(1,Math.floor(L/(w*0.9))), nx=-(b.y-a.y)/L, ny=(b.x-a.x)/L, tx=(b.x-a.x)/L, ty=(b.y-a.y)/L;
      for(let k=0;k<n;k++){ const t=(k+0.5)/n, x=a.x+(b.x-a.x)*t, y=a.y+(b.y-a.y)*t;
        p.F(R[3]); p.cap(P2(x+nx*w*0.45-tx*w*0.3,y+ny*w*0.45-ty*w*0.3),P2(x-nx*w*0.45+tx*w*0.3,y-ny*w*0.45+ty*w*0.3),0.8,0.8);
        if(k%2===0){ p.F(R[0]); p.rect(x-nx*w*0.2-0.5,y-ny*w*0.2-0.5,1,1); } } }
  }

  /* ---------------- FX ---------------- */
  // chamas em lâminas (F = rampa clara→escura); list: [x,y,escala]
  function flames(p,F,list,t,amp=1){
    list.forEach(([x,y,s0],k)=>{ const s=s0*amp; if(s<0.15) return; const h=s*(19+7*S(t*2.3+k*1.7)), w=s*5.2, lean=3*S(t*1.9+k*2.1), ph=t*2.6+k;
      const shape=sc=>{ const L=[], R=[], n=7; for(let j=0;j<=n;j++){ const u=j/n, half=w*sc*Math.pow(1-u,0.7)*(1+0.25*S(u*PI*3+ph)), cx=x+lean*sc*u*u+1.6*sc*S(u*PI*2.2+ph)*u;
          const yy=y+w*0.4*sc-(h*sc+w*0.4*sc)*u; L.push([cx-half,yy]); R.push([cx+half*0.9,yy]); }
        return L.concat(R.reverse()); };
      p.F(F[3]); p.poly(shape(1)); p.F(F[2]); p.poly(shape(0.72)); p.F(F[1]); p.poly(shape(0.46)); p.F(F[0]); p.poly(shape(0.22));
      p.F(F[2]); p.rect(x+lean*1.3-1,y-h*1.22,2,2); p.F(F[1]); p.rect(x-lean-w*0.5,y-h*0.9,1.4,1.4); });
  }
  // poeira de impacto no chão (D = rampa de poeira, X = rampa de brilho)
  function dust(p,D,X,x,g,s=1){
    p.F(D[2]); [[-70,-6,20,8],[64,-7,22,9],[-34,-12,16,10],[30,-14,16,10],[0,-5,40,8]].forEach(([dx,dy,rx,ry])=>p.ell(x+dx*s,g+dy*s,rx*s,ry*s));
    p.F(D[1]); [[-66,-9,14,6],[60,-10,15,6],[-30,-16,11,7],[26,-18,11,7],[0,-8,30,6]].forEach(([dx,dy,rx,ry])=>p.ell(x+dx*s,g+dy*s,rx*s,ry*s));
    p.F(D[0]); [[-62,-13,7,3],[56,-14,8,3],[-26,-21,6,3],[22,-23,6,3]].forEach(([dx,dy,rx,ry])=>p.ell(x+dx*s,g+dy*s,rx*s,ry*s));
    p.F(D[3]); [[-90,-30],[84,-34],[-50,-44],[46,-40],[96,-16],[-100,-14],[0,-36]].forEach(([dx,dy],k)=>{ const z=(2+(k%3))*s; p.poly([[x+dx*s-z,g+dy*s],[x+dx*s,g+dy*s-z],[x+dx*s+z,g+dy*s+z*0.4],[x+dx*s,g+dy*s+z]]); });
    if(X){ p.F(X[1]); [[-80,-4,-112,-2],[80,-4,114,-1],[-40,-18,-56,-38],[42,-20,58,-40],[0,-22,2,-46]].forEach(([a,b,c,d])=>p.cap(P2(x+a*s,g+b*s),P2(x+c*s,g+d*s),2.6*s,0.6)); }
  }
  function sparks(p,F,at,n=7,r=12,seed=1){
    p.F(F[2]); for(let k=0;k<n;k++){ const a=rnd(seed,k)*PI*2, rr=r*(0.5+rnd(seed,k+7)*0.7); p.cap(at,P2(at.x+C(a)*rr,at.y+S(a)*rr),1.4,0.4); }
    p.F(F[1]); for(let k=0;k<n;k+=2){ const a=rnd(seed,k)*PI*2, rr=r*(0.3+rnd(seed,k+7)*0.4); p.cap(at,P2(at.x+C(a)*rr,at.y+S(a)*rr),1,0.3); }
    p.F(F[0]); p.circle(at,2.6);
  }
  // raio elétrico em zigue-zague
  function bolt(p,F,a,b,seed=1,w=1.6){
    const n=6, pts=[a]; for(let k=1;k<n;k++){ const t=k/n, q=lerp(a,b,t), L=Math.hypot(b.x-a.x,b.y-a.y), nx=-(b.y-a.y)/L, ny=(b.x-a.x)/L, o=(rnd(seed,k)-0.5)*L*0.35; pts.push(P2(q.x+nx*o,q.y+ny*o)); } pts.push(b);
    p.F(F[2]); band(p,pts,w+1.4); p.F(F[0]); band(p,pts,w*0.6);
  }
  // rastro de golpe em arco (graus, convenção matemática); F = rampa de brilho
  function smear(p,F,cx,cy,r0,r1,a0,a1,ry=1){
    const pts=[]; for(let k=0;k<=14;k++){ const a=rad(a0+(a1-a0)*k/14); pts.push([cx+C(a)*r1, cy+S(a)*r1*ry]); }
    for(let k=14;k>=0;k--){ const a=rad(a0+(a1-a0)*k/14), rr=r0+(r1-r0)*(k/14)*0.5; pts.push([cx+C(a)*rr, cy+S(a)*rr*ry]); }
    p.F(F[1]); p.poly(pts);
    const p2=[]; for(let k=0;k<=14;k++){ const a=rad(a0+(a1-a0)*k/14); p2.push([cx+C(a)*(r1-3), cy+S(a)*(r1-3)*ry]); }
    for(let k=14;k>=0;k--){ const a=rad(a0+(a1-a0)*k/14); p2.push([cx+C(a)*(r1-7), cy+S(a)*(r1-7)*ry]); }
    p.F(F[0]); p.poly(p2);
  }
  // vapor/fumaça
  function puffs(p,D,x,y,list){ p.F(D[1]); list.forEach(([dx,dy,rx,ry])=>p.ell(x+dx,y+dy,rx,ry)); p.F(D[0]); list.forEach(([dx,dy,rx,ry])=>p.ell(x+dx-rx*0.25,y+dy-ry*0.3,rx*0.5,ry*0.45)); }
  // contorno externo reforçado: 2 px nas bordas de baixo
  function heavyBase(cv){ const g=cv.getContext('2d'), W=cv.width, H=cv.height, im=PIX.pix(cv), d=im.data, O=[0x17,0x0b,0x1c];
    const isO=i=>d[i+3]===255&&d[i]===O[0]&&d[i+1]===O[1]&&d[i+2]===O[2];
    for(let y=H-1;y>=2;y--) for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(d[i+3]) continue; const a=((y-1)*W+x)*4, b=((y-2)*W+x)*4; if(isO(a)&&d[b+3]&&!isO(b)){ d[i]=O[0]; d[i+1]=O[1]; d[i+2]=O[2]; d[i+3]=255; } }
    g.putImageData(im,0,0); }

  /* ---------------- esqueleto humanoide ----------------
     Ângulos em graus na convenção do PIX.lp (0 = pra baixo, 90 = pra frente, 180 = pra cima).
     o: {AX,GROUND,THI,SHN,UPA,FOA,hipW,neck:[x,y],shF:[x,y],shB:[x,y],HS,FT,FL,contacts(b0,P)} */
  function rig(o){
    function bones(P,hy){
      const hip={x:o.AX+P.hx,y:hy};
      const hipF={x:hip.x+o.hipW,y:hip.y+2}, hipB={x:hip.x-o.hipW,y:hip.y};
      const kneeF=lp(hipF,P.lFh,o.THI), ankleF=lp(kneeF,P.lFk,o.SHN), kneeB=lp(hipB,P.lBh,o.THI), ankleB=lp(kneeB,P.lBk,o.SHN);
      const a=rad(P.lean), c=C(a), s=S(a);
      const T=(lx,ly)=>({x:hip.x+lx*c-ly*s, y:hip.y+lx*s+ly*c});
      const neck=T(o.neck[0],o.neck[1]), shF=T(o.shF[0],o.shF[1]), shB=T(o.shB[0],o.shB[1]);
      const ha=rad(P.lean*0.6+P.head), hc=C(ha), hs=S(ha), HS=o.HS||1;
      const H=(lx,ly)=>({x:neck.x+(lx*hc-ly*hs)*HS, y:neck.y+(lx*hs+ly*hc)*HS});
      const elF=lp(shF,P.aFs,o.UPA), wrF=lp(elF,P.aFe,o.FOA), elB=lp(shB,P.aBs,o.UPA), wrB=lp(elB,P.aBe,o.FOA);
      return {hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,a,T,neck,shF,shB,ha,H,elF,wrF,elB,wrB};
    }
    function skeleton(P){
      const b0=bones(P,200);
      const foot=(an,fa)=>{ const r=rad(fa); return Math.max(an.y+o.FT, an.y+o.FT+S(r)*o.FL); };
      const cs=[foot(b0.ankleF,P.fF),foot(b0.ankleB,P.fB)];
      if(o.contacts) o.contacts(b0,P).forEach(y=>cs.push(y));
      const dy=o.GROUND-Math.max(...cs)+P.drop;
      const sk=bones(P,200+dy); sk.P=P; return sk;
    }
    return {bones,skeleton};
  }

  /* ---------------- factory ----------------
     o: {FW,FH,GROUND,AX,RIM,ANIMS,NAMES,REST,mats0(form),skip,fix(P,anim,i),skeleton(P),parts(add,P,M,sk,form,anim),
         anchors(sk,P), PROP:{FW,FH,GROUND,AX}, prop(add,P,M,form,anim)}
     Animações com {prop:true} são adereços (caixote, cabine, frasco...) desenhados num quadro pequeno; o motor
     usa cv._ax/cv._gy como âncora. Pré-aquecidos junto com o chefe (warm.ts percorre todas as animações). */
  function factory(o){
    const cache=PIX.cache(), MC={};
    const mats=form=>MC[form]||(MC[form]=o.mats0(form));
    function poseOf(anim,i){ const P=Object.assign({},o.REST,o.ANIMS[anim].pose(i)); if(P.t==null) P.t=i; if(o.fix) o.fix(P,anim,i); P.anim=anim; return P; }
    function frame(form,anim,fi,step=5,Pov,pk){
      const K=PIX.getK(), key=(pk!=null?'#'+pk+'|'+form+'|'+anim:form+anim+fi+step)+'@'+K; if(cache.has(key)) return cache.get(key);
      const P=Pov||poseOf(anim,fi), M=mats(form); st.QM=M;
      const A0=o.ANIMS[anim], sc=(A0&&A0.prop)?1:(o.SC||1), ax0=o.AX, g0=o.GROUND;
      // escala do corpo (SC) em torno da âncora no chão: o quadro e a âncora não mudam
      const pen=(c,u)=>{ const p=mkPen(c,u); if(sc===1) return p; const k=K*sc, tx=ax0*K*(1-sc), ty=g0*K*(1-sc);
        p.id=()=>c.setTransform(k,0,0,k,tx,ty); p.xf=(a,ox,oy)=>{ const cc=C(a), ss=S(a); c.setTransform(cc*k,ss*k,-ss*k,cc*k,(ax0+(ox-ax0)*sc)*K,(g0+(oy-g0)*sc)*K); }; return p; };
      const parts=[]; const add=(opt,fn)=>parts.push(Object.assign(opt||{},{draw:(c,u)=>{ st.CTX=c; const p=pen(c,u); p.id(); fn(p); }}));
      const A=A0; let cv;
      if(A&&A.prop){ const PR=o.PROP; o.prop(add,P,M,form,anim);
        cv=compose({FW:Math.round(PR.FW*K),FH:Math.round(PR.FH*K),GROUND:PR.GROUND*K,parts,M,step,flash:0,rim:o.RIM[form]});
        if(step>=4) heavyBase(cv); cv._ax=PR.AX*K; cv._gy=PR.GROUND*K;
      } else {
        const sk=o.skeleton(P); o.parts(add,P,M,sk,form,anim);
        cv=compose({FW:Math.round(o.FW*K),FH:Math.round(o.FH*K),GROUND:o.GROUND*K,parts,M,step,flash:P.flash,rim:o.RIM[form]});
        if(step>=4 && !P.flash) heavyBase(cv);
        if(o.anchors){ const an=o.anchors(sk,P); for(const k in an) cv['_'+k]={x:(ax0+(an[k].x-ax0)*sc)*K,y:(g0+(an[k].y-g0)*sc)*K}; }
      }
      st.QM=null; cache.set(key,cv); return cv;
    }
    return {SC:o.SC||1,FW:o.FW,FH:o.FH,GROUND:o.GROUND,AX:o.AX,ANIMS:o.ANIMS,NAMES:o.NAMES,RIM:o.RIM,PROP:o.PROP,mats,poseOf,frame,
      framePose(form,anim,P,key){ if(cache.size>1400) cache.delete(cache.keys().next().value); return frame(form,anim,0,5,P,key); }};
  }

  return {S,C,PI,st,sat,finish,qOf,lightLocal,shadeIn,mass,platePoly,clipPoly,clipEll,band,bandA,ellPts,arc,bez,bez3,limb,fold,stitches,rivets,rnd,stain,
    chain,rope,flames,dust,sparks,bolt,smear,puffs,heavyBase,rig,factory};
})();
