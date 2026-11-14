/* ARMAS_ICON — ícone da arma (família × raridade) a partir dos próprios desenhos BATON/GUN. Fonte de arte (editável). Build: npm run art */
// Contrato: icon(fam, tier, px) -> canvas px×px (arma centrada, contorno escuro, rim e tons do PIX) · fam: bastao|pistola|laser
const ARMAS_ICON=(function(){
  const {mkPen,compose}=PIX;
  const RIM='#a9c8f0', U=64;
  const ANG={bastao:-0.74, pistola:-0.16, laser:-0.2};
  const BASE={bastao:[14,46], pistola:[24,36], laser:[18,36]};
  function mats(fam,tier){ return fam==='bastao'?(BATON.TIERS[tier]||BATON.TIERS.comum).M:GUN.M(fam,tier); }
  // desenha em K atual e devolve recortado no contorno
  function raw(fam,tier){
    const K=PIX.getK(), S=Math.ceil(U*K), [bx,by]=BASE[fam]||BASE.pistola, ang=ANG[fam]||0;
    const parts=[{draw:(c,u)=>{ const p=mkPen(c,u); p.id();
      if(fam==='bastao') BATON.draw(p,tier,{x:bx,y:by},ang,{}); else GUN.draw(p,fam,tier,{x:bx,y:by},ang,{});
      p.id(); }}];
    const cv=compose({FW:S,FH:S,GROUND:S+16,parts,M:mats(fam,tier),step:5,rim:RIM});
    const g=cv.getContext('2d'), d=g.getImageData(0,0,S,S).data;
    let x0=S,y0=S,x1=-1,y1=-1;
    for(let y=0;y<S;y++) for(let x=0;x<S;x++) if(d[(y*S+x)*4+3]>0){ if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; }
    if(x1<0) return cv;
    const o=document.createElement('canvas'); o.width=x1-x0+1; o.height=y1-y0+1;
    o.getContext('2d').drawImage(cv,-x0,-y0);
    return o;
  }
  const cache=new Map();
  function icon(fam,tier='comum',px=64){
    const key=fam+'|'+tier+'|'+px; if(cache.has(key)) return cache.get(key);
    const old=PIX.getK();
    let cv;
    try{
      PIX.setK(1); const r1=raw(fam,tier);
      const k=(px*0.9)/Math.max(r1.width,r1.height);
      PIX.setK(k); cv=raw(fam,tier);
    } finally { PIX.setK(old); }
    const out=document.createElement('canvas'); out.width=out.height=px;
    const g=out.getContext('2d'); g.imageSmoothingEnabled=false;
    g.drawImage(cv,Math.round((px-cv.width)/2),Math.round((px-cv.height)/2));
    cache.set(key,out); return out;
  }
  return {icon};
})();
