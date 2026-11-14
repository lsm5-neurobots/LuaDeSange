/* PETCORE — fonte de arte (editável). Build: npm run art */
/* Kit comum dos pets no padrão hi-bit do herói/Vigia/Errante:
   - rampas de 8 tons por material (R4 + RX, com hue shift: luz amarelo quente, sombra roxa)
   - volumes esculpidos (shade/vol): base, sombra roxa grande do lado oposto à luz, borda funda, luz quente e brilho
   - olhos fofos (íris, pupila, 2 brilhos, pálpebras), tufos de pelo, FX (coração, Zzz, latido, notas)
   - esqueleto de quadrúpede com assentamento no chão (patas + pontos de apoio do corpo)
   - montagem: compose + contorno de baixo grosso + cache por escala */
const PETCORE=(function(){
  const {rad,lp,lerp,P2,mix,mkPen,compose}=PIX;
  const L={x:0.55,y:-0.83};                       // direção da luz (cima-frente; o bicho olha pra direita)
  /* ---------- cor ---------- */
  function satb(h,k){ let [r,g,b]=PIX.hexRgb(h).map(v=>v/255); const mx=Math.max(r,g,b), mn=Math.min(r,g,b), l=(mx+mn)/2; let s=0,hh=0;
    if(mx!==mn){ const d=mx-mn; s=l>0.5?d/(2-mx-mn):d/(mx+mn); hh=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4; hh/=6; }
    s=Math.min(1,s*k); if(!s) return h; const q=l<0.5?l*(1+s):l+s-l*s, pp=2*l-q, fn=t=>{ t=(t+1)%1; return t<1/6?pp+(q-pp)*6*t:t<1/2?q:t<2/3?pp+(q-pp)*(2/3-t)*6:pp; };
    return PIX.toHex(fn(hh+1/3)*255,fn(hh)*255,fn(hh-1/3)*255); }
  const R4=(h,k=1.15)=>{ const b=satb(h,k); return [mix(b,'#fff2cc',.36),b,mix(b,'#3b2c63',.46),mix(b,'#1c1233',.72)]; };
  const RX=(h,k=1.15)=>{ const b=satb(h,k); return [mix(b,'#fff2cc',.66),mix(b,'#ffe0a8',.18),mix(b,'#4a3470',.25),mix(b,'#100a20',.86)]; };
  // registra material de 8 tons: M[n]=R4, M[n+'X']=RX
  function mat(M,n,h,k){ M[n]=R4(h,k); M[n+'X']=RX(h,k); return M; }
  /* ---------- caneta com contexto ---------- */
  function pen(c,u){ const p=mkPen(c,u); p.c=c; p.id(); return p; }
  function path(c,shapes,dx,dy,s,cx,cy){
    c.beginPath();
    for(const sh of shapes){
      if(sh[0]==='e'){ const [,x,y,rx,ry,r]=sh; const X=cx+(x-cx)*s+dx, Y=cy+(y-cy)*s+dy; c.moveTo(X+rx*s*Math.cos(r||0),Y+rx*s*Math.sin(r||0)); c.ellipse(X,Y,Math.max(0.01,rx*s),Math.max(0.01,ry*s),r||0,0,Math.PI*2); }
      else { let pts=sh[1]; let ar=0; for(let i=0;i<pts.length;i++){ const q=pts[i], r=pts[(i+1)%pts.length]; ar+=q[0]*r[1]-r[0]*q[1]; } if(ar<0) pts=pts.slice().reverse(); pts.forEach((q,i)=>{ const X=cx+(q[0]-cx)*s+dx, Y=cy+(q[1]-cy)*s+dy; i?c.lineTo(X,Y):c.moveTo(X,Y); }); c.closePath(); }
    }
  }
  function center(shapes){ let x=0,y=0,n=0; for(const sh of shapes){ if(sh[0]==='e'){ x+=sh[1]; y+=sh[2]; n++; } else sh[1].forEach(q=>{ x+=q[0]; y+=q[1]; n++; }); } return {x:x/n,y:y/n}; }
  /* volume esculpido de um conjunto de formas (união). r = raio típico. o.lite=false sem luz; o.cx/cy centro.
     tons: R3 borda funda · R2 sombra · X2 meia-sombra roxa (grande) · R1 base · X1 luz quente · R0 luz · X0 brilho */
  function shade(p,shapes,R,X,r,o){ o=o||{}; const c=p.c, C=o.c||center(shapes), lx=o.lx!=null?o.lx:L.x, ly=o.ly!=null?o.ly:L.y;
    p.F(R[3]); path(c,shapes,0,0,1,C.x,C.y); c.fill();
    c.save(); path(c,shapes,0,0,1,C.x,C.y); c.clip();
    const sd=o.sd||1;
    p.F(R[2]); path(c,shapes,lx*r*0.10*sd,ly*r*0.10*sd,1,C.x,C.y); c.fill();
    p.F(X[2]); path(c,shapes,lx*r*0.22*sd,ly*r*0.22*sd,1,C.x,C.y); c.fill();
    p.F(R[1]); path(c,shapes,lx*r*0.40*sd,ly*r*0.40*sd,1,C.x,C.y); c.fill();
    if(o.lite!==false){
      const hl=o.hl||1;
      p.F(X[1]); path(c,shapes,lx*r*0.62*hl,ly*r*0.62*hl,0.86,C.x,C.y); c.fill();
      p.F(R[0]); path(c,shapes,lx*r*0.86*hl,ly*r*0.86*hl,0.66,C.x,C.y); c.fill();
      if(o.spec!==false){ p.F(X[0]); path(c,shapes,lx*r*1.05*hl,ly*r*1.05*hl,0.36,C.x,C.y); c.fill(); }
    }
    if(o.inner) o.inner();
    c.restore();
  }
  // forma recortada dentro de outra (ex.: barriga creme dentro do corpo)
  function within(p,clipShapes,fn){ const c=p.c; c.save(); path(c,clipShapes,0,0,1,0,0); c.clip(); fn(); c.restore(); }
  // faixa encostada num lado do segmento (lite=true → lado da luz)
  function band(p,a,b,wa,wb,col,f,lite,ins){
    const dx=b.x-a.x, dy=b.y-a.y, Ln=Math.hypot(dx,dy)||1; let nx=-dy/Ln, ny=dx/Ln;
    if((-nx+0.6*ny<0)!==!!lite){ nx=-nx; ny=-ny; }
    ins=ins||0; const oa=wa*(1-f)/2-ins, ob=wb*(1-f)/2-ins;
    p.F(col); p.cap({x:a.x+nx*oa,y:a.y+ny*oa},{x:b.x+nx*ob,y:b.y+ny*ob},wa*f,wb*f);
  }
  // membro com volume em 7 tons
  function vol(p,a,b,wa,wb,R,X,o={}){
    p.F(R[1]); p.cap(a,b,wa,wb);
    band(p,a,b,wa,wb,X[2],0.62); band(p,a,b,wa,wb,R[2],0.42); band(p,a,b,wa,wb,R[3],0.16);
    if(!o.noLite){ const a2=lerp(a,b,0.08), b2=lerp(a,b,0.85); band(p,a2,b2,wa,wb,X[1],0.32,true,0.3); band(p,a2,b2,wa,wb,R[0],0.18,true,0.55); }
  }
  // perna de bicho: coxa+canela com volume e pata arredondada com dedos
  function leg(p,R,X,PR,PX,lg,w1,w2,pw,o={}){
    vol(p,lg.root,lg.k,w1,w2,R,X,o); vol(p,lg.k,lg.f,w2,w2*0.86,R,X,o);
    if(o.noPaw) return;
    const fx=lg.f.x+pw*0.35, fy=lg.f.y+pw*0.2;
    shade(p,[['e',fx,fy,pw,pw*0.66]],PR,PX,pw,{spec:false});
    if(pw>2.4){ p.F(PR[3]); p.rect(fx+pw*0.15,fy-pw*0.1,0.5,pw*0.6); p.rect(fx+pw*0.55,fy-pw*0.05,0.5,pw*0.5); }
  }
  /* ---------- rosto ---------- */
  // olho fofo: st = open|half|closed|happy|wide|angry|sleep|x ; E = rampa do olho {white, iris, ink}
  function eye(p,x,y,rx,ry,st,iris,ink,o={}){
    const W='#fffbf0';
    if(st==='closed'||st==='sleep'){ p.F(ink); p.poly([[x-rx,y-0.1],[x-rx*0.4,y+ry*0.55],[x+rx*0.4,y+ry*0.55],[x+rx,y-0.1],[x+rx,y+0.8],[x+rx*0.4,y+ry*0.55+0.9],[x-rx*0.4,y+ry*0.55+0.9],[x-rx,y+0.8]]); return; }
    if(st==='happy'){ p.F(ink); p.poly([[x-rx,y+ry*0.4],[x-rx*0.3,y-ry*0.5],[x+rx*0.3,y-ry*0.5],[x+rx,y+ry*0.4],[x+rx-0.9,y+ry*0.5],[x+rx*0.2,y-ry*0.5+1],[x-rx*0.2,y-ry*0.5+1],[x-rx+0.9,y+ry*0.5]]); return; }
    if(st==='x'){ p.F(ink); p.poly([[x-rx,y-ry],[x-rx+1,y-ry],[x+rx,y+ry],[x+rx-1,y+ry]]); p.poly([[x+rx-1,y-ry],[x+rx,y-ry],[x-rx+1,y+ry],[x-rx,y+ry]]); return; }
    const k=st==='wide'?1.12:1;
    p.F(ink); p.ell(x,y,rx*k+0.5,ry*k+0.5);
    p.F(iris[2]); p.ell(x,y,rx*k,ry*k);
    p.F(iris[1]); p.ell(x+rx*0.1,y+ry*0.22,rx*k*0.82,ry*k*0.7);
    p.F(iris[0]); p.ell(x+rx*0.15,y+ry*0.55,rx*0.55,ry*0.3);
    const pr=o.pupil!=null?o.pupil:(st==='wide'?0.42:0.55);
    p.F(ink); p.ell(x+rx*0.1,y+ry*0.05,rx*pr*(o.slit?0.42:1),ry*pr*(o.slit?1.5:1));
    p.F(W); p.ell(x+rx*0.38,y-ry*0.38,Math.max(0.7,rx*0.36),Math.max(0.7,ry*0.32)); p.rect(x-rx*0.5,y+ry*0.3,0.8,0.8);
    if(st==='half'){ p.F(o.lid||ink); p.poly([[x-rx-0.6,y-ry-0.8],[x+rx+0.6,y-ry-0.8],[x+rx+0.6,y-0.1],[x-rx-0.6,y+0.2]]); p.F(ink); p.rect(x-rx-0.4,y-0.3,rx*2+0.8,0.9); }
    if(st==='angry'){ p.F(o.lid||ink); p.poly([[x-rx-0.6,y-ry-1],[x+rx+0.6,y-ry-1],[x+rx+0.6,y-ry*0.1],[x-rx-0.6,y-ry*0.7]]); p.F(ink); p.poly([[x-rx-0.6,y-ry*0.7-0.6],[x+rx+0.6,y-ry*0.1-0.6],[x+rx+0.6,y-ry*0.1+0.4],[x-rx-0.6,y-ry*0.7+0.4]]); }
  }
  // tufos serrilhados ao longo de uma polilinha (n dentes), lado = normal à esquerda do sentido
  function tufts(p,pts,h,col,n){ p.F(col); for(let i=0;i<pts.length-1;i++){ const a=pts[i], b=pts[i+1], m=n||2;
    for(let k=0;k<m;k++){ const t0=k/m, t1=(k+1)/m, A=lerp(a,b,t0), B=lerp(a,b,t1), dx=b.x-a.x, dy=b.y-a.y, Ln=Math.hypot(dx,dy)||1, nx=dy/Ln, ny=-dx/Ln, M=lerp(A,B,0.35);
      p.poly([[A.x,A.y],[M.x+nx*h,M.y+ny*h],[B.x,B.y]]); } } }
  // fio de pelo (traço curvo fino)
  function strand(p,col,a,b,w){ p.F(col); p.cap(a,b,w||0.7,(w||0.7)*0.6); }
  /* ---------- FX (partes sem sombreamento) ---------- */
  function heart(p,x,y,s,c0,c1){ p.F(c1); p.ell(x-s*0.5,y,s*0.62,s*0.62); p.ell(x+s*0.5,y,s*0.62,s*0.62); p.poly([[x-s*1.08,y+s*0.15],[x+s*1.08,y+s*0.15],[x,y+s*1.35]]);
    p.F(c0); p.ell(x-s*0.6,y-s*0.15,s*0.25,s*0.22); }
  function zzz(p,x,y,s,col){ p.F(col); p.rect(x,y,s,s*0.28); p.poly([[x+s,y+s*0.28],[x+s*0.28,y+s*0.78],[x,y+s*0.78],[x+s*0.72,y+s*0.28]]); p.rect(x,y+s*0.72,s,s*0.28); }
  function shout(p,x,y,s,col,n){ p.F(col); for(let k=0;k<(n||3);k++){ const a=rad(-40+k*40); const a0={x:x+Math.cos(a)*s*0.5,y:y+Math.sin(a)*s*0.5}, a1={x:x+Math.cos(a)*s*1.3,y:y+Math.sin(a)*s*1.3}; p.cap(a0,a1,s*0.32,s*0.2); } }
  function note(p,x,y,s,col){ p.F(col); p.ell(x,y+s,s*0.5,s*0.38,-0.4); p.rect(x+s*0.38,y-s*0.6,s*0.22,s*1.6); p.poly([[x+s*0.38,y-s*0.6],[x+s*1.1,y-s*0.2],[x+s*1.1,y+s*0.15],[x+s*0.6,y-s*0.15]]); }
  function sparkle(p,x,y,s,col){ p.F(col); p.poly([[x,y-s],[x+s*0.25,y-s*0.25],[x+s,y],[x+s*0.25,y+s*0.25],[x,y+s],[x-s*0.25,y+s*0.25],[x-s,y],[x-s*0.25,y-s*0.25]]); }
  function dust(p,x,y,s,c0,c1){ p.F(c1); p.ell(x,y,s,s*0.7); p.ell(x+s*0.9,y+s*0.2,s*0.7,s*0.5); p.F(c0); p.ell(x-s*0.2,y-s*0.2,s*0.5,s*0.35); }
  const FXC={heart:['#ffd0dc','#ff4f7a'],ink:'#fff4e0',z:'#bfd8ff',bark:'#fff2cc',note:'#ffe27a',dust:['#d8cbb0','#9a8a72'],spark:'#fff6c0'};
  /* ---------- esqueleto de quadrúpede ---------- */
  // cfg: AX, GROUND, bodyY, shX, hipX, fl:[L1,L2], hl:[L1,L2], neck:[x,y], tailRoot:[x,y], paw, legY, hull:[[lx,ly,r]...]
  function skeleton(P,cfg){
    function build(dy){
      const base={x:cfg.AX+P.bx, y:cfg.bodyY+P.by+dy};
      const a=rad(P.tilt), c=Math.cos(a), s=Math.sin(a);
      const T=(lx,ly)=>({x:base.x+lx*c-ly*s, y:base.y+lx*s+ly*c});
      const lgf=(root,ang,Ls)=>{ const k=lp(root,ang[0],Ls[0]), f=lp(k,ang[1],Ls[1]); return {root,k,f}; };
      const ly=cfg.legY||3;
      const legs={
        fN:lgf(T(cfg.shX+1,ly),P.fN,cfg.fl), fF:lgf(T(cfg.shX-2.5,ly-1),P.fF,cfg.fl),
        bN:lgf(T(cfg.hipX+1,ly),P.bN,cfg.hl), bF:lgf(T(cfg.hipX-2.5,ly-1),P.bF,cfg.hl),
      };
      const neck=T(cfg.neck[0],cfg.neck[1]);
      const ha=rad(P.tilt+P.head), hc=Math.cos(ha), hs=Math.sin(ha);
      const H=(lx,ly2)=>({x:neck.x+lx*hc-ly2*hs, y:neck.y+lx*hs+ly2*hc});
      return {base,T,legs,neck,H,ha,a,tailRoot:T(cfg.tailRoot[0],cfg.tailRoot[1])};
    }
    let sk=build(0);
    if(!P.free){ let low=Math.max(...Object.values(sk.legs).map(l=>l.f.y+(cfg.paw||2)));
      (cfg.hull||[]).forEach(([x,y,r])=>{ low=Math.max(low,sk.T(x,y).y+r); });
      sk=build(cfg.GROUND-low-(P.lift||0)); }
    return sk;
  }
  // rabo: n segmentos a partir da raiz; dir0 = 180°+tail, cada segmento curva 'curl' graus
  function tailPts(root,P,n,seg,curl){ const pts=[root]; let d=Math.PI+rad(P.tail); let q=root; const cu=curl!=null?curl:P.curl;
    for(let i=0;i<n;i++){ q={x:q.x+Math.cos(d)*seg, y:q.y+Math.sin(d)*seg}; pts.push(q); d+=rad(cu)*(1+i*0.15); } return pts; }
  // rabo com volume: base + sombra de baixo + luz de cima
  function tail(p,R,X,pts,w0,w1,o={}){ const n=pts.length-1;
    for(let i=0;i<n;i++){ const t=i/n, wa=w0+(w1-w0)*t, wb=w0+(w1-w0)*((i+1)/n);
      let r=R, x=X; if(o.tip&&i>=n-(o.tipN||1)){ r=o.tip; x=o.tipX; } if(o.rings&&i%2===1){ r=o.rings; x=o.ringsX; }
      vol(p,pts[i],pts[i+1],wa,wb,r,x,{noLite:o.noLite}); }
  }
  // compat com versões antigas
  function drawLeg(p,col,pawCol,lg,w1,w2,pawW){ p.id(); p.F(col); p.cap(lg.root,lg.k,w1,w2); p.cap(lg.k,lg.f,w2,w2*0.85); p.F(pawCol); p.ell(lg.f.x+1.2,lg.f.y+0.4,pawW,pawW*0.62); }
  function drawTail(p,col,tipCol,pts,w0,w1,rings,ringCol){ p.id(); const n=pts.length-1;
    for(let i=0;i<n;i++){ const t=i/n, w=w0+(w1-w0)*t; p.F(i>=n-1&&tipCol?tipCol:(rings&&i%2?ringCol:col)); p.cap(pts[i],pts[i+1],w,w0+(w1-w0)*((i+1)/n)); } }
  /* ---------- montagem ---------- */
  // contorno de baixo com 2 px (assenta o peso)
  function thick(cv){ const g=cv.getContext('2d'), W=cv.width, H=cv.height, im=PIX.pix(cv), d=im.data, src=new Uint8ClampedArray(d);
    const isO=i=>src[i+3]>0&&src[i]===23&&src[i+1]===11&&src[i+2]===28;
    for(let y=2;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(src[i+3]) continue; const u=i-W*4, u2=u-W*4; if(isO(u)&&src[u2+3]&&!isO(u2)){ d[i]=23; d[i+1]=11; d[i+2]=28; d[i+3]=255; } }
    g.putImageData(im,0,0); }
  // monta o quadro: o = {FW,FH,GROUND,parts,M,flash,rim,step}
  function build(o){ const K=PIX.getK(), step=o.step==null?5:o.step;
    const cv=compose({FW:Math.round(o.FW*K),FH:Math.round(o.FH*K),GROUND:o.GROUND*K,parts:o.parts,M:o.M,step,flash:o.flash,rim:o.rim||'#a9c8f0'});
    if(step>=4 && K>=1) thick(cv); return cv; }
  // cache LRU por chave (a chave deve incluir a escala)
  function mkCache(max){ const m=PIX.cache(); return {get:k=>m.get(k), set:(k,v)=>{ m.set(k,v); if(m.size>(max||600)) m.delete(m.keys().next().value); return v; }}; }
  // interpolação entre poses-chave numéricas (ciclos): keys=[pose...], t em [0,1)
  function cyc(keys,i,n){ const t=i/n*keys.length, a=Math.floor(t)%keys.length, b=(a+1)%keys.length, f=t-Math.floor(t), o={};
    const A=keys[a], B=keys[b]; for(const k in Object.assign({},A,B)){ const va=A[k]!=null?A[k]:B[k], vb=B[k]!=null?B[k]:A[k];
      if(Array.isArray(va)) o[k]=va.map((v,j)=>v+(vb[j]-v)*f); else if(typeof va==='number') o[k]=va+(vb-va)*f; else o[k]=f<0.5?va:vb; } return o; }
  return {L,satb,R4,RX,mat,pen,path,shade,within,band,vol,leg,eye,tufts,strand,heart,zzz,shout,note,sparkle,dust,FXC,
    skeleton,tailPts,tail,drawLeg,drawTail,thick,build,mkCache,cyc};
})();
