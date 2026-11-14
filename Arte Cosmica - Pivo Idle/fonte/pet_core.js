/* ===== PETCORE: esqueleto de quadrúpede (4 patas em IK simples, cabeça, rabo em cadeia) ===== */
const PETCORE=(function(){
  const {rad,lp,lerp,P2}=PIX;
  // cfg: AX, GROUND, bodyY, shX, hipX, fl:[L1,L2], hl:[L1,L2], neck:[x,y], tailRoot:[x,y], paw (meia-altura da pata)
  function skeleton(P,cfg){
    function build(dy){
      const base={x:cfg.AX+P.bx, y:cfg.bodyY+P.by+dy};
      const a=rad(P.tilt), c=Math.cos(a), s=Math.sin(a);
      const T=(lx,ly)=>({x:base.x+lx*c-ly*s, y:base.y+lx*s+ly*c});
      const leg=(root,ang,L)=>{ const k=lp(root,ang[0],L[0]), f=lp(k,ang[1],L[1]); return {root,k,f}; };
      const legs={
        fN:leg(T(cfg.shX+1,cfg.legY||3),P.fN,cfg.fl), fF:leg(T(cfg.shX-3,(cfg.legY||3)-1),P.fF,cfg.fl),
        bN:leg(T(cfg.hipX+1,cfg.legY||3),P.bN,cfg.hl), bF:leg(T(cfg.hipX-3,(cfg.legY||3)-1),P.bF,cfg.hl),
      };
      const neck=T(cfg.neck[0],cfg.neck[1]);
      const ha=rad(P.tilt+P.head), hc=Math.cos(ha), hs=Math.sin(ha);
      const H=(lx,ly)=>({x:neck.x+lx*hc-ly*hs, y:neck.y+lx*hs+ly*hc});
      return {base,T,legs,neck,H,ha,a,tailRoot:T(cfg.tailRoot[0],cfg.tailRoot[1])};
    }
    let sk=build(0);
    if(!P.free){ const low=Math.max(...Object.values(sk.legs).map(l=>l.f.y)); sk=build(cfg.GROUND-(cfg.paw||2)-low); }
    return sk;
  }
  function drawLeg(p,col,pawCol,leg,w1,w2,pawW){
    p.id(); p.F(col); p.cap(leg.root,leg.k,w1,w2); p.cap(leg.k,leg.f,w2,w2*0.85);
    p.F(pawCol); p.ell(leg.f.x+1.2,leg.f.y+0.4,pawW,pawW*0.62);
  }
  // rabo: n segmentos a partir da raiz; dir0 = 180°+tail (pra trás e pra cima), cada segmento curva 'curl' graus
  function tailPts(root,P,n,seg){ const pts=[root]; let d=Math.PI+rad(P.tail); let q=root;
    for(let i=0;i<n;i++){ q={x:q.x+Math.cos(d)*seg, y:q.y+Math.sin(d)*seg}; pts.push(q); d+=rad(P.curl)*(1+i*0.15); } return pts; }
  function drawTail(p,col,tipCol,pts,w0,w1,rings,ringCol){
    p.id(); const n=pts.length-1;
    for(let i=0;i<n;i++){ const t=i/n, w=w0+(w1-w0)*t; p.F(i>=n-1&&tipCol?tipCol:(rings&&i%2?ringCol:col)); p.cap(pts[i],pts[i+1],w,w0+(w1-w0)*((i+1)/n)); }
  }
  return {skeleton,drawLeg,tailPts,drawTail};
})();
