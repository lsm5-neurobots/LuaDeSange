/* PIX — fonte de arte (editável). Build: npm run art */
const PIX=(function(){
  const OUTLINE='#170b1c'; let K=1; const setK=k=>{K=k;}, getK=()=>K;
  const rad=d=>d*Math.PI/180;
  // paleta global: hex -> índice, com RGB memorizado (evita parseInt/slice por pixel)
  const PAL=new Map(); let PCAP=512, PN=0, PR=new Uint8Array(PCAP), PG=new Uint8Array(PCAP), PB=new Uint8Array(PCAP), CST=new Int32Array(PCAP), CRA=new Int32Array(PCAP), CTO=new Int32Array(PCAP);
  function growPal(){ const n=PCAP*2, g=a=>{ const b=new a.constructor(n); b.set(a); return b; }; PR=g(PR); PG=g(PG); PB=g(PB); CST=g(CST); CRA=g(CRA); CTO=g(CTO); PCAP=n; }
  function pidx(h){ let i=PAL.get(h); if(i===undefined){ i=PN++; if(i>=PCAP) growPal(); const n=parseInt(h.slice(1),16); PR[i]=(n>>16)&255; PG[i]=(n>>8)&255; PB[i]=n&255; PAL.set(h,i); } return i; }
  function hexRgb(h){ const i=pidx(h); return [PR[i],PG[i],PB[i]]; }
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
  // buffers reaproveitados entre chamadas (cor por pixel = índice da paleta; parte por pixel)
  let BCAP=0, COL=null, PART=null, OUT=null, STAMP=0;
  // último quadro montado: guarda o ImageData pra pós-processos (contorno grosso etc.) não lerem o canvas de volta
  let lastCv=null;
  function pix(cv){ const g=cv.getContext('2d'); if(cv===lastCv && cv._img) return cv._img; return g.getImageData(0,0,cv.width,cv.height); }
  // atribui cada pixel opaco (alfa>=128) da parte k à cor usada mais próxima (função pequena: o JIT otimiza bem)
  function scanPart(u,FW,FH,PW,col,part,k,li,lr,lg,lb,nl){
    let prgb=-1, pbest=li[0];
    for(let y=0,i=0;y<FH;y++){ let j=(y+2)*PW+2; for(let x=0;x<FW;x++,i++,j++){ const v=u[i]; if(v>=0) continue; const rgb=v&0xffffff;
      if(rgb!==prgb){ const r=rgb&255,g=(rgb>>8)&255,b=(rgb>>16)&255; let best=li[0], bd=1e9; for(let c=0;c<nl;c++){ const dr=lr[c]-r, dg=lg[c]-g, db=lb[c]-b, dd=dr*dr+dg*dg+db*db; if(dd<bd){bd=dd;best=li[c];} } prgb=rgb; pbest=best; }
      col[i]=pbest; part[j]=k; } }
  }
  function compose(o){ // o: {FW,FH,GROUND,parts,M,step,flash,rim,rimTop}
    const {FW,FH,parts,M,step}=o; const key=FW+'x'+FH;
    if(lastCv){ lastCv._img=null; lastCv=null; }
    if(!tmpCache[key]){ const c=document.createElement('canvas'); c.width=FW; c.height=FH; tmpCache[key]=[c,c.getContext('2d',{willReadFrequently:true})]; }
    const tctx=tmpCache[key][1];
    const N=FW*FH;
    // part fica num buffer com borda de 2 px (-1): vizinhos sem testar limites. índice (x,y) -> (y+2)*PW+x+2
    const PW=FW+4, PN2=PW*(FH+4);
    if(N>BCAP){ BCAP=N; COL=new Int32Array(N); OUT=new Int32Array(N); }
    if(!PART||PN2>PART.length) PART=new Int8Array(PN2);
    const col=COL, part=PART, out=OUT; col.fill(-1,0,N); part.fill(-1,0,PN2);
    // cinfo: cor -> (rampa, tom); a primeira ocorrência vence (mesma ordem de Object.entries)
    const stamp=++STAMP, ROUT=[];
    Object.entries(M).forEach(([k,r],ri)=>{ const ro=[]; ROUT.push(ro); r.forEach((h,t)=>{ if(typeof h!=='string'){ ro[t]=-2; return; } const ci=pidx(h); ro[t]=ci; if(CST[ci]!==stamp){ CST[ci]=stamp; CRA[ci]=ri; CTO[ci]=t; } }); });
    const NP=parts.length, noShade=new Uint8Array(NP), smear=new Uint8Array(NP), back=new Uint8Array(NP), noRim=new Uint8Array(NP);
    for(let k=0;k<NP;k++){ const p=parts[k]; noShade[k]=p.noShade?1:0; smear[k]=p.smear?1:0; back[k]=p.back?1:0; noRim[k]=p.noRim?1:0; }
    for(let k=0;k<NP;k++){ const pt=parts[k];
      tctx.setTransform(1,0,0,1,0,0); tctx.clearRect(0,0,FW,FH); const used=new Set(); pt.draw(tctx,used); if(!used.size) continue;
      const nl=used.size, li=new Int32Array(nl), lr=new Int32Array(nl), lg=new Int32Array(nl), lb=new Int32Array(nl); let j=0;
      for(const h of used){ const ci=pidx(h); li[j]=ci; lr[j]=PR[ci]; lg[j]=PG[ci]; lb[j]=PB[ci]; j++; }
      const d=tctx.getImageData(0,0,FW,FH).data, u=new Int32Array(d.buffer,d.byteOffset,N);
      // u[i] (little-endian) = A<<24|B<<16|G<<8|R; alfa>=128 <=> bit de sinal (u[i]<0)
      scanPart(u,FW,FH,PW,col,part,k,li,lr,lg,lb,nl);
    }
    const P1=PW, P2_=2*PW;
    const S1=pidx('#2a1d40'), WH=pidx('#ffffff'), flash=!!o.flash;
    for(let y=0,i=0;y<FH;y++){ let j=(y+2)*PW+2; for(let x=0;x<FW;x++,i++,j++){
      const c=col[i]; out[i]=-1; if(c<0) continue; const k=part[j];
      if(step===1){ out[i]=S1; continue; }
      let oc=c;
      if(step>=3 && CST[c]===stamp && !noShade[k]){
        let tone=CTO[c];
        if(tone===1){ if(part[j-1]!==k||part[j-2]!==k||part[j+P1]!==k||part[j+P2_]!==k) tone=2; else if(part[j+1]!==k||part[j-P1]!==k) tone=0; }
        const up2=part[j-P2_], ul=part[j+1-P2_]; if((up2>k)||(ul>k)) tone=Math.min(3,tone+1);
        if(step>=4){ let q=part[j+1]; if(q>k && !smear[q]) tone=3; else { q=part[j-1]; if(q>k && !smear[q]) tone=3; else { q=part[j+P1]; if(q>k && !smear[q]) tone=3; else { q=part[j-P1]; if(q>k && !smear[q]) tone=3; } } } }
        if(back[k]) tone=Math.min(3,tone+1);
        const v=ROUT[CRA[c]][tone]; oc=v===undefined?-2:v;
      }
      if(flash && step>=3) oc=WH;
      out[i]=oc;
    } }
    if(step>=5 && !flash && o.rim){ const RI=pidx(o.rim), lim=Math.min(FH,(o.GROUND||FH)-8); for(let y=0;y<lim;y++){ let i=y*FW, j=(y+2)*PW+2; for(let x=0;x<FW;x++,i++,j++){ if(col[i]>=0 && part[j-1]===-1 && !noShade[part[j]] && !noRim[part[j]]) out[i]=RI; } } }
    const cv=document.createElement('canvas'); cv.width=FW; cv.height=FH; const g=cv.getContext('2d'); const img=g.createImageData(FW,FH), D=img.data;
    for(let i=0,q=0;i<N;i++,q+=4){ const v=out[i]; if(v>=0){ D[q]=PR[v]; D[q+1]=PG[v]; D[q+2]=PB[v]; D[q+3]=255; } }
    if(step>=4){ const OI=pidx(OUTLINE), r=PR[OI], gg=PG[OI], b=PB[OI]; for(let y=0;y<FH;y++){ let i=y*FW, j=(y+2)*PW+2; for(let x=0;x<FW;x++,i++,j++){ if(col[i]>=0) continue; if(part[j+1]>=0||part[j-1]>=0||part[j+P1]>=0||part[j-P1]>=0){ const q=i*4; D[q]=r; D[q+1]=gg; D[q+2]=b; D[q+3]=255; } } } }
    g.putImageData(img,0,0);
    cv._img=img; lastCv=cv;
    return cv;
  }
  // ---- cache de quadros (Map) com persistÃªncia opcional ----
  // O jogo instala window.__ARTSTORE (IndexedDB via worker): set() entrega o quadro novo pra gravar; quadros vindos do
  // disco entram como "holder" (ImageBitmap) e viram canvas no 1Âº get(). Em modo sonda (store.probing), uma falta
  // lanÃ§a (store.miss) pra descobrir a chave sem gerar. Nome = ordem de criaÃ§Ã£o durante a carga do pacote
  // (determinÃ­stico na mesma versÃ£o); depois de seal(), cache() devolve Map comum (nada lazy vai pro disco).
  const GL=typeof window!=='undefined'?window:self, BUN=typeof __BUNDLE!=='undefined'?__BUNDLE:'', VER=typeof __ARTV!=='undefined'?__ARTV:'';
  const MS=Map.prototype.set, MG=Map.prototype.get, MH=Map.prototype.has, CACHES=[]; let sealed=false;
  class PMap extends Map{
    get(k){ let v=MG.call(this,k); if(v===undefined){ const S=GL.__ARTSTORE; if(S&&S.probing) S.miss(this,k); return v; }
      if(v&&v.__h){ v=v.mat(); MS.call(this,k,v); } return v; }
    has(k){ if(MH.call(this,k)) return true; const S=GL.__ARTSTORE; if(S&&S.probing) S.miss(this,k); return false; }
    set(k,v){ MS.call(this,k,v); const S=GL.__ARTSTORE; if(S&&!S.probing&&v&&!v.__h) S.put(this,k,v); return this; }
  }
  function cache(){ if(sealed||!BUN) return new Map(); const m=new PMap(); m.id=BUN+'/c'+CACHES.length; CACHES.push(m); return m; }
  const seal=()=>{ sealed=true; };
  return {setK,getK,OUTLINE,rad,hexRgb,toHex,mix,ramp,lp,lerp,P2,ik,mkPen,compose,pix,cache,seal,CACHES,BUNDLE:BUN,VER};
})();

/* ===== TWEEN: interpolação de pose entre quadros (fluidez) ===== */
