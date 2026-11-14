/* FX — efeitos e projéteis (fonte de arte). Build: npm run art
   Contrato:
     FX.frame(kind, fi, opts?) -> canvas (px finais = unidades × PIX.getK(); cache por escala)
     FX.N[kind]                -> nº de quadros
     FX.ANCHOR(kind, opts?)    -> {ax, ay, ground} em px do canvas
        ground=false: (ax,ay) é o centro do efeito (impactos, projéteis, estrelinhas...)
        ground=true : (ax,ay) é o ponto de contato com o chão (poeira, poça, telegrafia, apito, cura, level up)
     Exceções úteis: 'bullet' ancora na ponta; 'muzzle' na boca do cano (esquerda); 'hook' no olhal (onde a
     corrente prende); 'laserBeam' na borda esquerda/centro (repetir a cada canvas.width px em x);
     'dustRun' no pé (lado direito; o rastro sai pra esquerda — espelhar quando o ator olha pra esquerda).
     Projéteis e rastros são desenhados indo para a DIREITA; espelhe com scale(-1,1).
   opts: cor (acid, acidSplash, laserBeam, laserHit, pickup; e tinge impact/impactBig/hitspark), w (warnLane, unidades),
         r (warnCircle, unidades), wide (laserBeam grosso). */
const FX=(function(){
  const OL='#170b1c', TAU=Math.PI*2, cos=Math.cos, sin=Math.sin;
  const mix=(a,b,t)=>PIX.mix(a,b,t);
  const cache=PIX.cache();
  let tmp=null, tctx=null;
  function rng(seed){ let s=(seed*2654435761)>>>0||1; return ()=>{ s^=s<<13; s>>>=0; s^=s>>>17; s^=s<<5; s>>>=0; return (s%100000)/100000; }; }

  /* ---------- caneta (em unidades; o canvas temporário já está escalado por K) ---------- */
  function pen(g){
    const P={
      g,
      circle(x,y,r){ if(r<=0) return; g.beginPath(); g.arc(x,y,r,0,TAU); g.fill(); },
      ell(x,y,rx,ry,rot=0){ if(rx<=0||ry<=0) return; g.beginPath(); g.ellipse(x,y,rx,ry,rot,0,TAU); g.fill(); },
      ring(x,y,rx,ry,th,thy){ thy=thy==null?th:thy; if(rx<=0) return; g.beginPath(); g.ellipse(x,y,rx+th/2,Math.max(.1,ry+thy/2),0,0,TAU);
        if(rx-th/2>0 && ry-thy/2>0){ g.moveTo(x+rx-th/2,y); g.ellipse(x,y,rx-th/2,ry-thy/2,0,0,TAU); } g.fill('evenodd'); },
      poly(pts){ if(!pts.length) return; g.beginPath(); pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])); g.closePath(); g.fill(); },
      rect(x,y,w,h){ g.fillRect(x,y,w,h); },
      taper(x1,y1,x2,y2,w1,w2){ const dx=x2-x1, dy=y2-y1, L=Math.hypot(dx,dy)||1, nx=-dy/L, ny=dx/L;
        P.poly([[x1+nx*w1/2,y1+ny*w1/2],[x2+nx*w2/2,y2+ny*w2/2],[x2-nx*w2/2,y2-ny*w2/2],[x1-nx*w1/2,y1-ny*w1/2]]);
        P.circle(x1,y1,w1/2); if(w2>.6) P.circle(x2,y2,w2/2); },
      lineS(x1,y1,x2,y2,w){ g.lineWidth=w; g.beginPath(); g.moveTo(x1,y1); g.lineTo(x2,y2); g.stroke(); },
      arcS(x,y,r,a0,a1,w,ccw){ g.lineWidth=w; g.beginPath(); g.arc(x,y,r,a0,a1,!!ccw); g.stroke(); },
      ellS(x,y,rx,ry,w,a0=0,a1=TAU){ g.lineWidth=w; g.beginPath(); g.ellipse(x,y,rx,ry,0,a0,a1); g.stroke(); },
      // brilho de 4 pontas (lx/ly = braços, w = cintura), rot opcional
      star4(x,y,lx,ly,w,rot=0){ const c=cos(rot), s=sin(rot), T=(u,v)=>[x+u*c-v*s, y+u*s+v*c];
        P.poly([T(lx,0),T(w,-w),T(0,-ly),T(-w,-w),T(-lx,0),T(-w,w),T(0,ly),T(w,w)]); },
      star5(x,y,r,rot=-Math.PI/2,ri=.45){ const pts=[]; for(let i=0;i<10;i++){ const a=rot+i*TAU/10, rr=i%2?r*ri:r; pts.push([x+cos(a)*rr,y+sin(a)*rr]); } P.poly(pts); },
      chevron(x,y,w,h,th){ P.poly([[x-w/2,y+h/2],[x,y-h/2],[x+w/2,y+h/2],[x+w/2-th,y+h/2],[x,y-h/2+th*1.3],[x-w/2+th,y+h/2]]); },
      cross(x,y,s,t){ g.fillRect(x-t/2,y-s,t,s*2); g.fillRect(x-s,y-t/2,s*2,t); },
    };
    return P;
  }

  /* ---------- rasterizador: camadas chapadas, sem antialias, contorno opcional ---------- */
  // layer: {c:'#hex'|null(apaga), a:0..1, ol:false (não gera contorno), d:(P)=>{...}}
  function raster(Wu,Hu,layers,ol,sc){
    sc=sc||1; const K=PIX.getK(), W=Math.max(2,Math.ceil(Wu*sc*K)), H=Math.max(2,Math.ceil(Hu*sc*K));
    if(!tmp||tmp.width<W||tmp.height<H){ const c=document.createElement('canvas'); c.width=Math.max(W,tmp?tmp.width:0); c.height=Math.max(H,tmp?tmp.height:0); tmp=c; tctx=c.getContext('2d',{willReadFrequently:true}); }
    const N=W*H, buf=new Uint8ClampedArray(N*4), sol=new Uint8Array(N), P=pen(tctx);
    for(const L of layers){
      tctx.setTransform(1,0,0,1,0,0); tctx.clearRect(0,0,W,H); tctx.setTransform(K*sc,0,0,K*sc,0,0);
      tctx.fillStyle='#000'; tctx.strokeStyle='#000'; tctx.lineCap='round'; tctx.lineJoin='round';
      tctx.save(); L.d(P); tctx.restore();
      const d=tctx.getImageData(0,0,W,H).data;
      if(L.c===null){ for(let i=0;i<N;i++) if(d[i*4+3]>=128){ buf[i*4+3]=0; sol[i]=0; } continue; }
      const [r,g,b]=PIX.hexRgb(L.c), a=Math.round((L.a==null?1:L.a)*255), so=L.ol===false?0:1;
      for(let i=0;i<N;i++) if(d[i*4+3]>=128){ const j=i*4; buf[j]=r; buf[j+1]=g; buf[j+2]=b; buf[j+3]=a; sol[i]=so; }
    }
    if(ol){ const [r,g,b]=PIX.hexRgb(ol), mark=[];
      for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const i=y*W+x; if(sol[i]) continue;
        if((x>0&&sol[i-1])||(x<W-1&&sol[i+1])||(y>0&&sol[i-W])||(y<H-1&&sol[i+W])) mark.push(i); }
      for(const i of mark){ const j=i*4; buf[j]=r; buf[j+1]=g; buf[j+2]=b; buf[j+3]=255; } }
    const cv=document.createElement('canvas'); cv.width=W; cv.height=H;
    cv.getContext('2d').putImageData(new ImageData(buf,W,H),0,0);
    return cv;
  }
  const L=(c,d,o)=>Object.assign({c,d},o||{});

  /* ---------- paletas ---------- */
  const HOT=['#ffffff','#fff6c8','#ffe14a','#ffa424','#ff5a1e'];
  const pal5=(cor,def)=>cor?['#ffffff',mix(cor,'#ffffff',.72),mix(cor,'#fff2cc',.4),cor,mix(cor,'#1c1233',.32)]:def;
  const tones=c=>({hi:mix(c,'#ffffff',.7),lt:mix(c,'#fff2cc',.38),b:c,dk:mix(c,'#3b2c63',.42),dd:mix(c,'#1c1233',.62)});
  const DUST=['#efe2c8','#bcae9c','#857892','#544866'];
  const STONE={dd:'#2e2840',dk:'#4e4660',b:'#7c7482',lt:'#a8a0a6',hi:'#d8d0cc',rust:'#9a5030'};

  // geometria de estrela com pontas irregulares (fixa por semente → quadros coerentes)
  function starGeo(seed,n,jlo,rot=-Math.PI/2){ const R=rng(seed), G=[];
    for(let i=0;i<n;i++) G.push({a:rot+i/n*TAU+(R()-.5)*(TAU/n)*.45, k:jlo+R()*(1-jlo), w:.7+R()*.6});
    return G; }
  function starPts(G,cx,cy,ro,ri,sy=.9){ const n=G.length, pts=[];
    G.forEach((q,i)=>{ const nx=G[(i+1)%n].a+(i===n-1?TAU:0), am=(q.a+nx)/2;
      pts.push([cx+cos(q.a)*ro*q.k, cy+sin(q.a)*ro*q.k*sy]); pts.push([cx+cos(am)*ri, cy+sin(am)*ri*sy]); });
    return pts; }

  // nuvem de poeira: puffs [{x,y,r}] → 4 camadas de tom (luz de cima-esquerda)
  function puffLayers(puffs,PAL,o){ PAL=PAL||DUST; o=o||{};
    return [
      L(PAL[3],P=>puffs.forEach(p=>P.circle(p.x+.3,p.y+p.r*.18,p.r)),o),
      L(PAL[2],P=>puffs.forEach(p=>P.circle(p.x,p.y,p.r*.86)),o),
      L(PAL[1],P=>puffs.forEach(p=>P.circle(p.x-p.r*.18,p.y-p.r*.22,p.r*.62)),o),
      L(PAL[0],P=>puffs.forEach(p=>p.r>2.2&&P.circle(p.x-p.r*.32,p.y-p.r*.4,p.r*.3)),o),
    ]; }

  /* ---------- definições: (fi, opts, n) -> {W,H,ax,ay,ground,ol,L:[camadas]} (unidades) ---------- */
  const KINDS={
    impact(fi,o){ const W=58,H=56,cx=29,cy=28, P5=pal5(o.cor,HOT), G=starGeo(11,9,.5); const sp=(ro,ri)=>starPts(G,cx,cy,ro,ri);
      const S={W,H,ax:cx,ay:cy,ground:false,L:[]}, A=S.L;
      if(fi===0){ A.push(L(P5[3],P=>P.poly(sp(13,5))),L(P5[1],P=>P.poly(sp(9,3.6))),L(P5[0],P=>P.circle(cx,cy,3.6))); }
      if(fi===1){ A.push(L(P5[4],P=>P.poly(sp(27,9))),L(P5[3],P=>P.poly(sp(22,7.5))),L(P5[2],P=>P.poly(sp(16.5,6))),L(P5[1],P=>P.poly(sp(10.5,4.6))),L(P5[0],P=>P.circle(cx,cy,4.6))); }
      if(fi===2){ A.push(L(P5[4],P=>P.poly(sp(28,10))),L(P5[3],P=>P.poly(sp(24,8.6))),L(P5[2],P=>P.poly(sp(18,7))),L(null,P=>P.ell(cx,cy,8,7.2)),L(P5[1],P=>P.ring(cx,cy,9,8.1,1.8))); }
      if(fi===3){ A.push(L(P5[3],P=>G.forEach(q=>{ const r1=15, r2=27*q.k+2; P.taper(cx+cos(q.a)*r1,cy+sin(q.a)*r1*.9,cx+cos(q.a)*r2,cy+sin(q.a)*r2*.9,3.2*q.w,.5); })),
                      L(P5[1],P=>G.forEach(q=>{ const r1=16, r2=22*q.k+2; P.taper(cx+cos(q.a)*r1,cy+sin(q.a)*r1*.9,cx+cos(q.a)*r2,cy+sin(q.a)*r2*.9,1.4*q.w,.3); }))); }
      if(fi===4){ A.push(L(P5[4],P=>G.forEach(q=>{ const r1=23*q.k+4, r2=27*q.k+3; P.taper(cx+cos(q.a)*r1,cy+sin(q.a)*r1*.9,cx+cos(q.a)*r2,cy+sin(q.a)*r2*.9,1.6,.4); })),
                      L(P5[3],P=>G.forEach((q,i)=>i%2&&P.circle(cx+cos(q.a+.25)*19,cy+sin(q.a+.25)*17,1.1)))); }
      return S; },

    impactBig(fi,o){ const W=92,H=88,cx=46,cy=44, P5=pal5(o.cor,HOT), G=starGeo(23,12,.55); const sp=(ro,ri)=>starPts(G,cx,cy,ro,ri);
      const ray=(P,r1,f2,add,w1,w2)=>G.forEach(q=>{ const r2=f2*q.k+add; P.taper(cx+cos(q.a)*r1,cy+sin(q.a)*r1*.9,cx+cos(q.a)*r2,cy+sin(q.a)*r2*.9,w1*q.w,w2); });
      const S={W,H,ax:cx,ay:cy,ground:false,L:[]}, A=S.L;
      if(fi===0){ A.push(L(P5[3],P=>P.poly(sp(20,8))),L(P5[2],P=>P.circle(cx,cy,10)),L(P5[1],P=>P.circle(cx,cy,8)),L(P5[0],P=>P.circle(cx,cy,5.5))); }
      if(fi===1){ A.push(L(P5[4],P=>P.poly(sp(40,13))),L(P5[3],P=>P.poly(sp(33,11))),L(P5[2],P=>P.poly(sp(25,9))),L(P5[1],P=>P.poly(sp(16,7))),L(P5[0],P=>P.circle(cx,cy,7.5)),
                      L(P5[0],P=>P.ring(cx,cy,24,21,1.4,1.2))); }
      if(fi===2){ A.push(L(P5[4],P=>P.poly(sp(42,14))),L(P5[3],P=>P.poly(sp(36,12))),L(P5[2],P=>P.poly(sp(28,10))),L(null,P=>P.ell(cx,cy,11,10)),
                      L(P5[1],P=>P.ring(cx,cy,12.5,11.2,2.2)),L(P5[0],P=>P.ring(cx,cy,33,29.5,2,1.6))); }
      if(fi===3){ A.push(L(P5[3],P=>ray(P,20,38,3,4.4,.6)),L(P5[1],P=>ray(P,21,30,3,2,.4)),
                      L(P5[1],P=>P.ring(cx,cy,40,36,1.8,1.4)),L(null,P=>G.forEach((q,i)=>i%3===0&&P.circle(cx+cos(q.a+.3)*40,cy+sin(q.a+.3)*36,4)))); }
      if(fi===4){ A.push(L(P5[4],P=>G.forEach(q=>{ const r=34*q.k+6, a=q.a, x=cx+cos(a)*r, y=cy+sin(a)*r*.9;
                        P.poly([[x+cos(a)*3.4,y+sin(a)*3.4],[x+cos(a+1.9)*1.6,y+sin(a+1.9)*1.6],[x+cos(a-1.9)*1.6,y+sin(a-1.9)*1.6]]); })),
                      L(P5[2],P=>G.forEach((q,i)=>i%2&&P.circle(cx+cos(q.a+.26)*27,cy+sin(q.a+.26)*24,1.2)))); }
      if(fi===5){ A.push(L(P5[4],P=>G.forEach((q,i)=>P.circle(cx+cos(q.a+(i%2?.2:0))*(37*q.k+5),cy+sin(q.a+(i%2?.2:0))*(37*q.k+5)*.9,i%2?.9:1.2)))); }
      return S; },

    hitspark(fi,o){ const W=38,H=36,cx=19,cy=18, P5=pal5(o.cor,['#ffffff','#fffbe0','#fff07a','#ffc23a','#ff7a1e']);
      const R=rng(37), RAY=[]; for(let i=0;i<8;i++) RAY.push({a:i/8*TAU+(R()-.5)*.5+.2, L:.7+R()*.3});
      const S={W,H,ax:cx,ay:cy,ground:false,L:[]}, A=S.L;
      if(fi===0){ A.push(L(P5[3],P=>P.star4(cx,cy,15,10,2.6)),L(P5[1],P=>P.star4(cx,cy,11,7,1.6)),L(P5[0],P=>P.circle(cx,cy,2.2)),L(P5[2],P=>P.star4(cx,cy,5,5,1,Math.PI/4))); }
      if(fi===1){ A.push(L(P5[2],P=>RAY.forEach(r=>P.taper(cx+cos(r.a)*2,cy+sin(r.a)*2,cx+cos(r.a)*(15*r.L),cy+sin(r.a)*(15*r.L),2.6,.4))),
                      L(P5[0],P=>RAY.forEach(r=>P.taper(cx+cos(r.a)*2,cy+sin(r.a)*2,cx+cos(r.a)*(9*r.L),cy+sin(r.a)*(9*r.L),1.3,.3))),
                      L(P5[1],P=>P.star4(cx,cy,7,5,1.5))); }
      if(fi===2){ A.push(L(P5[3],P=>RAY.forEach(r=>P.taper(cx+cos(r.a)*9,cy+sin(r.a)*9,cx+cos(r.a)*(17*r.L),cy+sin(r.a)*(17*r.L),1.8,.3))),
                      L(P5[1],P=>RAY.forEach(r=>P.circle(cx+cos(r.a)*(16*r.L),cy+sin(r.a)*(16*r.L),.75)))); }
      if(fi===3){ A.push(L(P5[4],P=>RAY.forEach((r,i)=>P.circle(cx+cos(r.a)*(17.5*r.L+1),cy+sin(r.a)*(17.5*r.L+1)+1.5,i%2?.8:1.1)))); }
      return S; },

    dust(fi){ const W=84,H=40,cx=42,gy=36, R=rng(41), t=fi/5, PF=[];
      for(let i=0;i<9;i++) PF.push({s:i%2?1:-1, k:.15+R()*.85, rk:.7+R()*.55, ox:(R()-.5)*3, hk:R()});
      const grow=fi<3?(.62+.19*fi):(1-(fi-2)*.2), spread=4+26*Math.pow(t,.65);
      const puffs=PF.map(p=>{ const r=(4.6+5*p.rk)*grow*(1-p.k*.3); return {x:cx+p.ox+p.s*p.k*spread*1.3, y:gy-r*.75-t*8*(.3+p.hk), r}; });
      const A=puffLayers(puffs);
      if(fi<=1) A.unshift(L(DUST[3],P=>[[-1,1],[1,.8],[-1,.5],[1,.3]].forEach(([s,k],i)=>P.circle(cx+s*(8+fi*9)*k*1.6,gy-5-fi*3-i*1.5+(fi?3:0),.9))));
      if(fi>=3) A.push(L(null,P=>puffs.forEach((p,i)=>{ const R2=rng(i*7+fi); P.circle(p.x+(R2()-.5)*p.r*1.4,p.y-(R2()-.2)*p.r*.8,p.r*(fi===3?.22:fi===4?.42:.62)); })));
      return {W,H,ax:cx,ay:gy,ground:true,L:A}; },

    dustRun(fi){ const W=42,H=22,fx=38,gy=20, puffs=[];
      for(let i=0;i<4;i++){ const a=(i+fi/4)/3; if(a>1.12) continue; const r=a<.7?2.4+a*6.5:(2.4+4.55)*(1-(a-.7)*1.4);
        puffs.push({x:fx-3-a*28, y:gy-r*.7-a*4, r, a}); }
      const A=puffLayers(puffs);
      A.push(L(null,P=>puffs.forEach((p,i)=>{ if(p.a<.72) return; P.circle(p.x+p.r*.3,p.y-p.r*.3,p.r*(p.a>.95?.6:.35)); })));
      return {W,H,ax:fx,ay:gy,ground:true,L:A}; },

    acid(fi,o){ const W=22,H=16,cx=14,cy=8, T=tones(o.cor||'#8ce03a'), w=[0,1,0,-1][fi], rx=4.6+w*.55, ry=3.7-w*.45;
      return {W,H,ax:cx,ay:cy,sc:1.3,ground:false,ol:OL,L:[
        L(T.dk,P=>{ P.ell(cx,cy,rx,ry); P.taper(cx-1,cy,4,cy-w*.7,ry*1.4,1.2); if(fi%2===0) P.circle(1.8,cy+(fi?1:-1)*.6,.9); }),
        L(T.b,P=>{ P.ell(cx-.2,cy-.5,rx*.8,ry*.7); P.taper(cx-1,cy-.6,6,cy-.6-w*.6,ry*.8,.6); }),
        L(T.lt,P=>P.ell(cx+.6,cy-1.3,rx*.42,ry*.36)),
        L(T.hi,P=>P.circle(cx+1.6,cy-1.8,.85)),
      ]}; },

    acidSplash(fi,o){ const W=54,H=30,cx=27,gy=25, T=tones(o.cor||'#8ce03a');
      const rx=[6,11,15,18,19,19][fi], ry=rx*.27+.5, TT=[0,.2,.4,.62,.82,1][fi], R=rng(71), DR=[];
      for(let i=0;i<8;i++) DR.push({a:-Math.PI*(.12+.76*(i/7))+(R()-.5)*.2, v:9+R()*8, r:.9+R()*.7});
      const drops=[]; if(fi>=1) DR.forEach(d=>{ const x=cx+cos(d.a)*d.v*TT*2.2, y=gy-2+sin(d.a)*d.v*TT*2.6+26*TT*TT; if(y<gy-1.2) drops.push({x,y,d,vx:cos(d.a),vy:sin(d.a)+TT*1.4}); });
      const dr=(P,s)=>drops.forEach(p=>{ if(fi===1) P.taper(p.x-p.vx*3.5,p.y-p.vy*3.5,p.x,p.y,.8*s,2.1*s); else P.circle(p.x,p.y,p.d.r*s); });
      const A=[L(T.dk,P=>{ P.ell(cx,gy,rx,ry); dr(P,1); if(fi===0){ P.ell(cx,gy-2.6,6.5,3.4); P.taper(cx-3,gy-3,cx-6,gy-8,2,1); P.taper(cx+3,gy-3,cx+6,gy-8.5,2,1); } }),
               L(T.b,P=>{ P.ell(cx-.6,gy-.5,rx*.84,ry*.66); dr(P,.62); if(fi===0) P.ell(cx-.5,gy-3.2,5,2.4); }),
               L(fi===5?T.b:T.lt,P=>{ P.ell(cx-rx*.32,gy-ry*.42,rx*.34,Math.max(.6,ry*.26)); if(fi===0) P.ell(cx-1.5,gy-4,2.2,1); })];
      if(fi>=2){ const B=[[-.42,-.2,1.5],[.38,.25,1.2],[.05,-.5,1.8]]; A.push(L(T.lt,P=>B.forEach(([bx,by,br],i)=>{ if((i+fi)%3===0) return; P.ring(cx+bx*rx,gy+by*ry-.6,br,br*.8,.7); })),
                                                                       L(T.hi,P=>B.forEach(([bx,by,br],i)=>{ if((i+fi)%3===0) return; P.circle(cx+bx*rx-.5,gy+by*ry-1.1,.5); }))); }
      return {W,H,ax:cx,ay:gy,ground:true,ol:OL,L:A}; },

    rock(fi){ const W=28,H=28,cx=14,cy=14, R=rng(51), V=[]; for(let i=0;i<8;i++) V.push({a:i/8*TAU+(R()-.5)*.35, r:6+R()*2.3});
      const rot=fi*Math.PI/2+.2, pt=(v,s,ox=0,oy=0)=>[cx+cos(v.a+rot)*v.r*s+ox, cy+sin(v.a+rot)*v.r*s+oy], pts=(s,ox,oy)=>V.map(v=>pt(v,s,ox,oy));
      const v0=V[1], v3=V[4], v5=V[6];
      return {W,H,ax:cx,ay:cy,ground:false,ol:OL,L:[
        L(STONE.rust,P=>{ const a=pt(v0,.6), b=pt(v0,1.5); P.lineS(a[0],a[1],b[0],b[1],1.4); }),
        L(STONE.dk,P=>P.poly(pts(1,0,0))),
        L(STONE.b,P=>P.poly(pts(.8,-.9,-.9))),
        L(STONE.lt,P=>P.poly(pts(.46,-2.2,-2.4))),
        L(STONE.hi,P=>P.circle(cx-3.6,cy-3.8,.8)),
        L(STONE.dd,P=>{ const a=pt(v3,.95), b=pt(v5,.15); P.lineS(a[0],a[1],b[0],b[1],.9); const c=pt(v5,.7); P.lineS(b[0],b[1],c[0],c[1],.8); }),
        L('#c8784a',P=>{ const b=pt(v0,1.45); P.circle(b[0],b[1],.6); }),
      ]}; },

    rockBreak(fi){ const W=66,H=50,cx=33,cy=26, TT=[0,.14,.3,.48,.68,.88][fi], R=rng(57), CH=[];
      for(let i=0;i<9;i++){ const a=-Math.PI*(.05+.9*(i/8))+(R()-.5)*.25; CH.push({a, v:14+R()*8, r:2+R()*2.1, sp:(R()-.5)*14, sd:i}); }
      const chunks=CH.map(c=>({x:cx+cos(c.a)*c.v*TT*1.45, y:Math.min(cy+19,cy+sin(c.a)*c.v*TT*1.45+32*TT*TT), r:c.r*(fi===5?.8:1), rot:c.a*2+c.sp*TT, sd:c.sd}));
      const cpts=(c,s,ox=0,oy=0)=>{ const R2=rng(c.sd*13+3), p=[]; for(let k=0;k<5;k++){ const a=c.rot+k/5*TAU+(R2()-.5)*.6, rr=c.r*(.75+R2()*.4)*s; p.push([c.x+cos(a)*rr+ox,c.y+sin(a)*rr+oy]); } return p; };
      const pr=fi<4?(5+fi*4.5):(14+fi*1.5), puffs=[];
      if(fi<=5) [[0,0,1],[-.7,.25,.75],[.7,.2,.8],[-.3,-.5,.6],[.35,-.45,.65]].forEach(([dx,dy,s])=>puffs.push({x:cx+dx*pr*1.1, y:cy+4+dy*pr*.8-fi*1.2, r:pr*.55*s*(fi>=4?.85:1)}));
      const A=puffLayers(puffs,DUST,{ol:false});
      if(fi>=3) A.push(L(null,P=>puffs.forEach((p,i)=>{ const R2=rng(i*5+fi*11); P.circle(p.x+(R2()-.5)*p.r,p.y+(R2()-.5)*p.r*.6,p.r*(fi===3?.25:fi===4?.45:.7)); })));
      if(fi===0) A.push(L('#fff6c8',P=>P.star4(cx,cy,9,6,2)),L('#ffffff',P=>P.circle(cx,cy,1.8)));
      if(fi>=1) A.push(L(STONE.dk,P=>chunks.forEach(c=>P.poly(cpts(c,1)))),L(STONE.b,P=>chunks.forEach(c=>P.poly(cpts(c,.7,-.6,-.6)))),L(STONE.lt,P=>chunks.forEach(c=>c.r>2.8&&P.circle(c.x-c.r*.35,c.y-c.r*.4,.75))));
      return {W,H,ax:cx,ay:cy,ground:false,ol:OL,L:A}; },

    hook(){ const W=27,H=27, ex=5, ey=8;
      const body=(P,w,oy)=>{ P.ellS(ex,ey+oy,2.4,2.4,w*.66); P.lineS(ex+2.4,ey+oy,15,ey+oy,w); P.arcS(15,14+oy,6,-Math.PI/2,Math.PI/2,w); };
      return {W,H,ax:ex,ay:ey,sc:1.45,ground:false,ol:OL,L:[
        L('#76748c',P=>{ body(P,2.8,0); P.taper(15,20,8,15,2.8,.5); }),
        L('#3a3650',P=>{ P.lineS(ex+3,ey+1,14.5,ey+1,.9); P.arcS(15,14,5.2,-Math.PI/2+.6,Math.PI/2,.9); P.taper(14,20.8,9,16.4,.9,.3); P.ellS(ex,ey,2.4,2.4,.7,.2,2.6); }),
        L('#b8bacb',P=>{ P.lineS(ex+3,ey-.9,14,ey-.9,.8); P.arcS(15,14,6.7,-Math.PI/2+.15,-.3,.8); P.ellS(ex,ey,2.4,2.4,.6,3.6,5.6); }),
        L('#f0f2f8',P=>{ P.circle(19.6,9.8,.6); P.circle(9,ey-.9,.5); }),
        L('#8a4228',P=>{ P.circle(11.5,ey+.6,.7); P.circle(20.6,16,.6); P.circle(7.5,ey-.2,.5); }),
        L('#b02a2a',P=>{ P.taper(11.5,17.6,8.4,15.2,1.6,.5); P.circle(11,18.8,.6); }),
        L('#5c1420',P=>{ P.taper(10.8,19,10.8,21.6,.9,.9); P.circle(10.8,22.2,.65); }),
      ]}; },

    chain(){ const W=12,H=8,cx=6,cy=4;
      return {W,H,ax:cx,ay:cy,sc:1.3,ground:false,ol:OL,L:[
        L('#5e5c74',P=>P.ellS(cx,cy,3.9,2.1,1.5)),
        L('#a8aabc',P=>P.ellS(cx,cy-.25,3.9,2.1,.6,Math.PI*1.1,Math.PI*1.75)),
        L('#2e2a40',P=>P.ellS(cx,cy+.3,3.9,2.1,.5,Math.PI*.15,Math.PI*.8)),
      ]}; },

    bullet(fi){ const W=30,H=7,hx=25,cy=3.5, s=fi?.85:1;
      return {W,H,ax:hx,ay:cy,ground:false,L:[
        L('#ff7a1e',P=>P.taper(hx-1,cy,fi?6:2,cy,2.6*s,.6),{a:.9}),
        L('#ffd23f',P=>P.taper(hx-1,cy,fi?12:9,cy,1.8,.4)),
        L('#fff6c8',P=>P.ell(hx,cy,2.8,1.6)),
        L('#ffffff',P=>P.ell(hx+.5,cy,1.5,.9)),
      ]}; },

    muzzle(fi){ const W=30,H=24,ox=2,cy=12;
      const shape=s=>{ const pts=[[27,0],[9,2.6],[15,8.5],[6,4],[3,7],[2.4,0],[3,-7],[6,-4],[15,-8.5],[9,-2.6]]; return pts.map(([x,y])=>[ox+x*s,cy+y*s]); };
      const SMK=['#c8c2cc','#8e8698','#5e5670'], S={W,H,ax:ox,ay:cy,ground:false,L:[]}, A=S.L;
      if(fi===0) A.push(L('#ff5a1e',P=>P.poly(shape(1))),L('#ffa424',P=>P.poly(shape(.78))),L('#ffe14a',P=>P.poly(shape(.58))),L('#fff6c8',P=>P.poly(shape(.36))),L('#ffffff',P=>P.circle(ox+3,cy,2.2)));
      if(fi===1) A.push(...puffLayers([{x:9,y:9,r:3},{x:13,y:11,r:2.4}],[SMK[0],SMK[0],SMK[1],SMK[2]]),L('#ffa424',P=>P.poly(shape(.55))),L('#ffe14a',P=>P.poly(shape(.38))),L('#ffffff',P=>P.circle(ox+2.4,cy,1.4)));
      if(fi===2) A.push(...puffLayers([{x:11,y:8,r:4},{x:17,y:10,r:3},{x:6,y:10.5,r:2.2}],[SMK[0],SMK[0],SMK[1],SMK[2]]),L(null,P=>{ P.circle(12,7,1.6); P.circle(17.5,11,1.2); }));
      return S; },

    laserBeam(fi,o){ const W=32, wide=!!o.wide, H=wide?28:16, cy=H/2, hw=wide?9:4.6, T=tones(o.cor||'#ff3a5a'), ph=fi/3*TAU;
      const band=(P,h,amp,f)=>{ const top=[], bot=[]; for(let x=0;x<=W;x+=.5){ top.push([x,cy-h-amp*sin(x/16*TAU+ph*f)]); bot.push([x,cy+h+amp*sin(x/16*TAU+ph*f+2.1)]); } P.poly(top.concat(bot.reverse())); };
      const nodes=P=>{ for(let k=0;k<2;k++){ const x=((fi*32/3+k*16)%32); [x-32,x,x+32].forEach(xx=>P.ell(xx,cy,2.6,hw*.55)); } };
      return {W,H,ax:0,ay:cy,ground:false,L:[
        L(T.dk,P=>band(P,hw+2.4,1,1),{a:.55}),
        L(T.b,P=>band(P,hw,.7,-1)),
        L(T.lt,P=>{ band(P,hw*.55,.4,1); nodes(P); }),
        L('#ffffff',P=>band(P,Math.max(.8,hw*.22),0,0)),
      ]}; },

    laserHit(fi,o){ const W=42,H=40,cx=21,cy=20, c=o.cor||'#ff3a5a', P5=pal5(c,null), G=starGeo(61,7,.55); const sp=(ro,ri)=>starPts(G,cx,cy,ro,ri,1);
      const S={W,H,ax:cx,ay:cy,ground:false,L:[]}, A=S.L;
      if(fi===0) A.push(L(P5[3],P=>P.circle(cx,cy,7.5)),L(P5[1],P=>P.circle(cx,cy,5.4)),L(P5[0],P=>P.circle(cx,cy,3.2)));
      if(fi===1) A.push(L(P5[4],P=>P.poly(sp(19,6.5))),L(P5[3],P=>P.poly(sp(15.5,5.5))),L(P5[1],P=>P.poly(sp(10,4.4))),L(P5[0],P=>P.circle(cx,cy,4)));
      if(fi===2) A.push(L(P5[4],P=>P.poly(sp(20,7.5))),L(P5[3],P=>P.poly(sp(17,6.5))),L(null,P=>P.circle(cx,cy,6)),L(P5[1],P=>P.ring(cx,cy,7,7,1.6)));
      if(fi===3) A.push(L(P5[3],P=>G.forEach(q=>P.taper(cx+cos(q.a)*12,cy+sin(q.a)*12,cx+cos(q.a)*(19*q.k+1),cy+sin(q.a)*(19*q.k+1),1.6,.3))),L(P5[1],P=>G.forEach((q,i)=>i%2&&P.circle(cx+cos(q.a+.4)*14,cy+sin(q.a+.4)*14,.8))));
      return S; },

    whistle(fi){ const W=200,H=92,cx=100,cy=46, front=18+fi*15.5, COL=['#fffbe6','#ffe9a0','#ffc860'], a=fi<4?1:fi===4?.8:.55, A=[];
      for(let k=2;k>=0;k--){ const rr=front-k*12; if(rr<5) continue; const th=2.6-k*.6;
        A.push(L(COL[k],P=>P.ring(cx,cy,rr,rr*.42,th,Math.max(1.3,th*.7)),{a}));
        if(fi>=3) A.push(L(null,P=>{ for(let j=0;j<14;j++){ if((j+fi+k)%3) continue; const an=j/14*TAU+k*.4; P.circle(cx+cos(an)*rr,cy+sin(an)*rr*.42,2.6+fi*.5); } })); }
      if(fi>=1&&fi<=4) A.push(L('#ffffff',P=>{ for(let j=0;j<6;j++){ const an=j/6*TAU+fi*.5, rr=front; P.star4(cx+cos(an)*rr,cy+sin(an)*rr*.42,2.6,2.6,.7); } }));
      return {W,H,ax:cx,ay:cy,ground:true,L:A}; },

    stun(fi){ const W=36,H=18,cx=18,cy=9, A=[];
      const st=[0,1,2].map(k=>{ const a=(fi/6+k)*TAU/3; return {a, x:cx+cos(a)*12, y:cy+sin(a)*4, f:sin(a)}; }).sort((p,q)=>p.f-q.f);
      for(const s of st){ const r=s.f>.3?3.6:s.f>-.4?3:2.3, back=s.f<-.2, ta=s.a-.55, tx=cx+cos(ta)*12, ty=cy+sin(ta)*4;
        A.push(L(back?'#a86a2a':'#e0942a',P=>P.circle(tx,ty,.8)));
        A.push(L(back?'#c8902a':'#ffc23a',P=>P.star5(s.x,s.y,r,-Math.PI/2+fi*.42+s.f*.3)));
        A.push(L(back?'#e8c060':'#fff6a0',P=>P.star5(s.x-.3,s.y-.3,r*.5,-Math.PI/2+fi*.42+s.f*.3))); }
      return {W,H,ax:cx,ay:cy,sc:1.35,ground:false,ol:OL,L:A}; },

    warnCircle(fi,o){ const r=+o.r||30, W=2*r+8, H=.8*r+8, cx=W/2, cy=H/2, p=[0,.5,1,.5][fi], ir=r*(.85-fi*.2);
      return {W,H,ax:cx,ay:cy,ground:true,ol:'#3a0812',L:[
        L('#ff2a3a',P=>P.ell(cx,cy,r,r*.4),{a:.16+.16*p,ol:false}),
        L('#ff7a6a',P=>P.ring(cx,cy,ir,ir*.4,1.3,1.1),{a:.55+.3*(1-fi/3),ol:false}),
        L('#ff2a3a',P=>P.ring(cx,cy,r,r*.4,2.2,1.6)),
        L('#ffd8cc',P=>P.ring(cx,cy-.3,r-.4,r*.4-.3,.8,.6),{a:.55+.45*p}),
        L('#ffe8e0',P=>{ for(let k=0;k<8;k++){ const an=k/8*TAU+fi*TAU/32; P.circle(cx+cos(an)*(r+2.2),cy+sin(an)*(r*.4+1.4),1.1); } }),
      ]}; },

    warnLane(fi,o){ const w=+o.w||120, h=14, W=w, H=h+4, cy=H/2, p=[0,.5,1,.5][fi];
      return {W,H,ax:w/2,ay:cy,ground:true,ol:'#3a0812',L:[
        L('#ff2a3a',P=>P.rect(0,cy-h/2,w,h),{a:.16+.14*p,ol:false}),
        L('#ff3a4a',P=>{ P.g.beginPath(); P.g.rect(0,cy-h/2,w,h); P.g.clip(); for(let x=-14+fi*2.5;x<w+14;x+=10) P.poly([[x,cy+h/2],[x+4,cy+h/2],[x+4+6,cy-h/2],[x+6,cy-h/2]]); },{a:.32+.2*p,ol:false}),
        L('#ff3a4a',P=>{ P.rect(0,cy-h/2-.6,w,1.6); P.rect(0,cy+h/2-1,w,1.6); }),
        L('#ffd8cc',P=>{ P.rect(0,cy-h/2+.4,w,.7); },{a:.5+.5*p}),
      ]}; },

    levelup(fi){ const W=62,H=104,cx=31,gy=96, R=rng(81);
      const hc=[22,52,82,92,92,84,62,34][fi], wc=[6,9,10.5,9.5,7.5,5.5,3.8,2.2][fi], A=[];
      A.push(L('#ffd860',P=>P.poly([[cx-wc,gy],[cx-wc*.45,gy-hc],[cx+wc*.45,gy-hc],[cx+wc,gy]]),{a:.5,ol:false}));
      A.push(L('#fffbe0',P=>P.poly([[cx-wc*.42,gy],[cx-wc*.15,gy-hc*.9],[cx+wc*.15,gy-hc*.9],[cx+wc*.42,gy]]),{a:.8,ol:false}));
      if(fi<6) A.push(L('#ffd23f',P=>P.ring(cx,gy,6+fi*4.2,(6+fi*4.2)*.36,1.8,1.3),{a:1-fi/7}));
      A.push(L('#fff6c8',P=>[20,52].forEach(b=>{ const y=gy-b-fi*7; if(y>8&&y<gy-8) P.chevron(cx,y,10,6,2.2); })));
      const SP=[]; for(let i=0;i<8;i++) SP.push({x:cx+(R()<.5?-1:1)*(5+R()*20), y0:gy-8-R()*40, ph:i});
      A.push(L('#ffffff',P=>SP.forEach(s=>{ const y=s.y0-fi*6, k=(fi+s.ph)%4; if(y<6||k===3) return; const l=k===1?3.4:2; P.star4(s.x,y,l,l,.7); })));
      return {W,H,ax:cx,ay:gy,ground:true,ol:'#7a3a10',L:A}; },

    heal(fi){ const W=52,H=86,cx=26,gy=80, R=rng(91), G={hi:'#eaffe2',lt:'#9cf0a0',b:'#3ac86a',dk:'#1a8a4a'}, A=[];
      const gw=[5,8,9,8.5,7,5,3,1.5][fi];
      A.push(L('#7af0a0',P=>P.poly([[cx-gw,gy],[cx-gw*.5,gy-60],[cx+gw*.5,gy-60],[cx+gw,gy]]),{a:.38,ol:false}),L('#e0ffe8',P=>P.poly([[cx-gw*.35,gy],[cx-gw*.12,gy-54],[cx+gw*.12,gy-54],[cx+gw*.35,gy]]),{a:.6,ol:false}));
      if(fi<6) A.push(L(G.lt,P=>P.ring(cx,gy,7+fi*3.6,(7+fi*3.6)*.36,1.6,1.2),{a:1-fi/7}));
      const CR=[[cx-9,0],[cx+9,2],[cx,4],[cx-4,-2]].map(([x0,d])=>{ const a=fi-d; if(a<0||a>5) return null; const s=a<1?2.4:a<2?3.8:a>4?2.8:4.4;
        return {x:x0+sin(a*1.3+x0)*2, y:gy-16-a*10, s}; }).filter(Boolean);
      A.push(L(G.dk,P=>CR.forEach(c=>P.cross(c.x,c.y,c.s,c.s*.78))),L(G.b,P=>CR.forEach(c=>P.cross(c.x-.3,c.y-.3,c.s*.8,c.s*.46))),
             L(G.lt,P=>CR.forEach(c=>{ P.rect(c.x-c.s*.8,c.y-c.s*.23-.3,c.s*.9,c.s*.3); P.rect(c.x-c.s*.23-.3,c.y-c.s*.8,c.s*.3,c.s*.9); })),
             L(G.hi,P=>CR.forEach(c=>P.circle(c.x-c.s*.55,c.y-c.s*.15,.55))));
      const SP=[]; for(let i=0;i<7;i++) SP.push({x:cx+(R()-.5)*38, y0:gy-6-R()*36, ph:i});
      A.push(L(G.hi,P=>SP.forEach(s=>{ const y=s.y0-fi*5, k=(fi+s.ph)%4; if(y<5||k===3) return; const l=k===1?2.8:1.6; P.star4(s.x,y,l,l,.6); }),{ol:false}));
      return {W,H,ax:cx,ay:gy,ground:true,ol:'#0c3020',L:A}; },

    pickup(fi,o){ const W=42,H=42,cx=21,cy=21, P5=pal5(o.cor||'#ffd23f',null), R=rng(97), SP=[]; for(let i=0;i<6;i++) SP.push({a:i/6*TAU+R()*.6, k:.85+R()*.3});
      const S={W,H,ax:cx,ay:cy,ground:false,L:[]}, A=S.L, at=(s,r)=>[cx+cos(s.a)*r*s.k, cy+sin(s.a)*r*s.k];
      if(fi===0) A.push(L(P5[2],P=>P.star4(cx,cy,7,7,1.5)),L(P5[0],P=>P.circle(cx,cy,1.8)));
      if(fi===1) A.push(L(P5[3],P=>P.star4(cx,cy,15,15,2.4)),L(P5[2],P=>P.ring(cx,cy,6.5,6.5,1.3)),L(P5[1],P=>P.star4(cx,cy,10.5,10.5,1.5)),L(P5[0],P=>P.circle(cx,cy,2.3)));
      if(fi===2) A.push(L(P5[3],P=>P.star4(cx,cy,9,9,1.7,Math.PI/4)),L(P5[1],P=>P.ring(cx,cy,10.5,10.5,1.3)),L(P5[0],P=>P.star4(cx,cy,5,5,1,Math.PI/4)),L(P5[1],P=>SP.forEach(s=>{ const [x,y]=at(s,13); P.star4(x,y,2.2,2.2,.6); })));
      if(fi===3) A.push(L(P5[2],P=>P.ring(cx,cy,14.5,14.5,1)),L(null,P=>SP.forEach(s=>{ const [x,y]=at(s,14.5); P.circle(x,y,2.2); })),L(P5[0],P=>SP.forEach(s=>{ const [x,y]=at(s,16); P.star4(x,y,2.8,2.8,.7); })));
      if(fi===4) A.push(L(P5[2],P=>SP.forEach(s=>{ const [x,y]=at(s,17.5); P.star4(x,y,1.9,1.9,.55); })));
      if(fi===5) A.push(L(P5[3],P=>SP.forEach((s,i)=>{ if(i%2) return; const [x,y]=at(s,18.5); P.circle(x,y,.75); })));
      return S; },
  };

  const N={impact:5,impactBig:6,hitspark:4,dust:6,dustRun:4,acid:4,acidSplash:6,rock:4,rockBreak:6,hook:1,chain:1,bullet:2,muzzle:3,
    laserBeam:3,laserHit:4,whistle:6,stun:6,warnCircle:4,warnLane:4,levelup:8,heal:8,pickup:6};
  const okey=o=>o?[o.cor||'',o.w||'',o.r||'',o.wide?1:''].join(','):'';
  function spec(kind,fi,o){ const def=KINDS[kind]; if(!def) throw new Error('FX: kind desconhecido '+kind); const n=N[kind]; fi=((fi|0)%n+n)%n; return def(fi,o||{},n); }
  function frame(kind,fi,o){ const n=N[kind]||1; fi=((fi|0)%n+n)%n; const key=kind+'|'+fi+'|'+PIX.getK()+'|'+okey(o);
    let cv=cache.get(key); if(cv) return cv;
    const S=spec(kind,fi,o); cv=raster(S.W,S.H,S.L,S.ol,S.sc); cache.set(key,cv); return cv; }
  function ANCHOR(kind,o){ const S=spec(kind,0,o), K=PIX.getK(); const sc=S.sc||1; return {ax:Math.round(S.ax*sc*K), ay:Math.round(S.ay*sc*K), ground:!!S.ground}; }
  function clearCache(){ cache.clear(); }
  return {frame,N,ANCHOR,KINDS:Object.keys(N),clearCache};
})();
