/* ===== PIX: pipeline hi-bit compartilhado (vetor → quantiza → luz/sombra → contorno seletivo → luz de lua) ===== */
const PIX=(function(){
  const OUTLINE='#170b1c'; let K=1; const setK=k=>{K=k;}, getK=()=>K;
  const rad=d=>d*Math.PI/180;
  function hexRgb(h){ const n=parseInt(h.slice(1),16); return [(n>>16)&255,(n>>8)&255,n&255]; }
  function toHex(r,g,b){ return '#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join(''); }
  function mix(a,b,t){ const A=hexRgb(a),B=hexRgb(b); return toHex(A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,A[2]+(B[2]-A[2])*t); }
  function ramp(h){ return [mix(h,'#fff2cc',.36),h,mix(h,'#3b2c63',.38),mix(h,'#1c1233',.64)]; }
  const lp=(p,a,L)=>({x:p.x+Math.sin(rad(a))*L, y:p.y+Math.cos(rad(a))*L});
  const lerp=(a,b,t)=>({x:a.x+(b.x-a.x)*t, y:a.y+(b.y-a.y)*t});
  const P2=(x,y)=>({x,y});
  function ik(S,W,L1,L2,elbowDown){
    const dx=W.x-S.x, dy=W.y-S.y, d0=Math.hypot(dx,dy);
    const d=Math.max(Math.abs(L1-L2)+0.5, Math.min(L1+L2-0.3, d0));
    const base=Math.atan2(dy,dx), A=Math.acos(Math.max(-1,Math.min(1,(L1*L1+d*d-L2*L2)/(2*L1*d))));
    const e1={x:S.x+Math.cos(base-A)*L1,y:S.y+Math.sin(base-A)*L1}, e2={x:S.x+Math.cos(base+A)*L1,y:S.y+Math.sin(base+A)*L1};
    const E=elbowDown?(e1.y>e2.y?e1:e2):(e1.y<e2.y?e1:e2);
    return {E, W:{x:S.x+Math.cos(base)*d, y:S.y+Math.sin(base)*d}};
  }
  function mkPen(ctx,used){
    const F=c=>{ ctx.fillStyle=c; used.add(c); };
    const circle=(p,r)=>{ ctx.beginPath(); ctx.arc(p.x,p.y,r,0,Math.PI*2); ctx.fill(); };
    const cap=(a,b,wa,wb)=>{ const dx=b.x-a.x, dy=b.y-a.y, L=Math.hypot(dx,dy)||1, nx=-dy/L, ny=dx/L;
      ctx.beginPath(); ctx.moveTo(a.x+nx*wa/2,a.y+ny*wa/2); ctx.lineTo(b.x+nx*wb/2,b.y+ny*wb/2); ctx.lineTo(b.x-nx*wb/2,b.y-ny*wb/2); ctx.lineTo(a.x-nx*wa/2,a.y-ny*wa/2); ctx.closePath(); ctx.fill(); circle(a,wa/2); circle(b,wb/2); };
    const poly=pts=>{ ctx.beginPath(); pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])); ctx.closePath(); ctx.fill(); };
    const ell=(x,y,rx,ry,r=0)=>{ ctx.beginPath(); ctx.ellipse(x,y,rx,ry,r,0,Math.PI*2); ctx.fill(); };
    const rect=(x,y,w,h)=>ctx.fillRect(x,y,w,h);
    const xf=(a,ox,oy)=>{ const c=Math.cos(a), s=Math.sin(a); ctx.setTransform(c*K,s*K,-s*K,c*K,ox*K,oy*K); };
    const id=()=>ctx.setTransform(K,0,0,K,0,0);
    return {F,circle,cap,poly,ell,rect,xf,id};
  }
  const tmpCache={};
  function compose(o){ // o: {FW,FH,GROUND,parts,M,step,flash,rim,rimTop}
    const {FW,FH,parts,M,step}=o; const key=FW+'x'+FH;
    if(!tmpCache[key]){ const c=document.createElement('canvas'); c.width=FW; c.height=FH; tmpCache[key]=[c,c.getContext('2d',{willReadFrequently:true})]; }
    const tctx=tmpCache[key][1];
    const cinfo=new Map(); Object.entries(M).forEach(([k,r])=>r.forEach((h,t)=>{ if(!cinfo.has(h)) cinfo.set(h,{ramp:k,tone:t}); }));
    const N=FW*FH, col=new Array(N).fill(null), part=new Int8Array(N).fill(-1);
    parts.forEach((pt,k)=>{
      tctx.setTransform(1,0,0,1,0,0); tctx.clearRect(0,0,FW,FH); const used=new Set(); pt.draw(tctx,used); if(!used.size) return;
      const list=[...used].map(h=>[h,...hexRgb(h)]); const d=tctx.getImageData(0,0,FW,FH).data;
      for(let i=0;i<N;i++){ if(d[i*4+3]<128) continue; let best=list[0][0], bd=1e9; const r=d[i*4],g=d[i*4+1],b=d[i*4+2];
        for(const c of list){ const dd=(c[1]-r)**2+(c[2]-g)**2+(c[3]-b)**2; if(dd<bd){bd=dd;best=c[0];} }
        col[i]=best; part[i]=k; }
    });
    const at=(x,y)=> (x<0||y<0||x>=FW||y>=FH)?-1:part[y*FW+x];
    const out=new Array(N).fill(null);
    for(let y=0;y<FH;y++) for(let x=0;x<FW;x++){
      const i=y*FW+x, c=col[i]; if(c===null) continue; const k=part[i];
      if(step===1){ out[i]='#2a1d40'; continue; }
      const info=cinfo.get(c); let oc=c;
      if(step>=3 && info && !parts[k].noShade){
        let tone=info.tone;
        if(tone===1){ if(at(x-1,y)!==k||at(x-2,y)!==k||at(x,y+1)!==k||at(x,y+2)!==k) tone=2; else if(at(x+1,y)!==k||at(x,y-1)!==k) tone=0; }
        const up2=at(x,y-2), ul=at(x+1,y-2); if((up2>k)||(ul>k)) tone=Math.min(3,tone+1);
        if(step>=4){ const n=[at(x+1,y),at(x-1,y),at(x,y+1),at(x,y-1)]; if(n.some(q=>q>k && !parts[q].smear)) tone=3; }
        if(parts[k].back) tone=Math.min(3,tone+1);
        oc=M[info.ramp][tone];
      }
      if(o.flash && step>=3) oc='#ffffff';
      out[i]=oc;
    }
    if(step>=5 && !o.flash && o.rim){ const lim=Math.min(FH,(o.GROUND||FH)-8); for(let y=0;y<lim;y++) for(let x=0;x<FW;x++){ const i=y*FW+x; if(col[i]!==null && at(x-1,y)===-1 && !parts[part[i]].noShade && !parts[part[i]].noRim) out[i]=o.rim; } }
    const cv=document.createElement('canvas'); cv.width=FW; cv.height=FH; const g=cv.getContext('2d'); const img=g.createImageData(FW,FH);
    const put=(i,h)=>{ const [r,gg,b]=hexRgb(h); img.data[i*4]=r; img.data[i*4+1]=gg; img.data[i*4+2]=b; img.data[i*4+3]=255; };
    for(let i=0;i<N;i++) if(out[i]) put(i,out[i]);
    if(step>=4){ for(let y=0;y<FH;y++) for(let x=0;x<FW;x++){ const i=y*FW+x; if(col[i]!==null) continue; if(at(x+1,y)>=0||at(x-1,y)>=0||at(x,y+1)>=0||at(x,y-1)>=0) put(i,OUTLINE); } }
    g.putImageData(img,0,0);
    return cv;
  }
  return {setK,getK,OUTLINE,rad,hexRgb,toHex,mix,ramp,lp,lerp,P2,ik,mkPen,compose};
})();
