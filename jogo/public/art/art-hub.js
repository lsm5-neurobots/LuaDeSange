/* gerado por tools/build-art.mjs a partir de art-src/ — não editar aqui */
window.ART_HUB=(function(){
const __BUNDLE='ART_HUB', __ARTV='79f43799c092';
/* ===== shared/pix ===== */
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

/* ===== shared/items ===== */
/* ITEMS — coletáveis (recursos no chão e ícones). Fonte de arte (editável). Build: npm run art */
// Contrato: frame(id, fi=0, step=5) -> canvas (honra PIX.getK(), cache id+fi+step+K) · ANCHOR(id) -> {ax, gy}
// N = 6 quadros de idle (brilho que corre + pulso; sem deslocamento, o motor faz o quique) · SIZE = 28 unidades cruas.
const ITEMS=(function(){
  const {mkPen,compose}=PIX;
  const SIZE=28, N=6, AXU=14, GYU=25, RIM='#a9c8f0';
  const IDS=['madeira','sucata','pano','agua','comida','remedio','pecas','gasolina','fragmento_lunar','projeto','chave',
    'chave_comum','chave_medico','chave_militar','chave_raro','kit_cura','presente','adrenalina','colete'];
  const NOMES={madeira:'Madeira',sucata:'Sucata',pano:'Pano',agua:'Água',comida:'Comida',remedio:'Remédio',pecas:'Peças',gasolina:'Gasolina',fragmento_lunar:'Fragmento lunar',projeto:'Projeto',chave:'Chave',
    chave_comum:'Chave de bronze',chave_medico:'Chave médica',chave_militar:'Chave militar',chave_raro:'Chave de ouro',kit_cura:'Kit de cura',presente:'Presente',adrenalina:'Adrenalina',colete:'Colete improvisado'};
  const hsh=(i,s)=>{ const v=Math.sin(i*12.9898+s*78.233)*43758.5453; return v-Math.floor(v); };

  // ---- rampas explícitas (claro -> escuro, sombra puxando pro roxo)
  const BARK=['#f2c890','#d89a5c','#b0703a','#86502a','#5c341c','#3a1e12'];
  const GRAIN=['#ffe8b4','#f4c886','#daa264','#b47c44','#8a5830'];
  const ROPE=['#fbe8b8','#dcb878','#a88448','#6a5028'];
  const STEEL=['#f6f9ff','#cad2e2','#949eba','#646c8e','#40446a','#282a44'];
  const RUST=['#ffb070','#e27c3a','#b2542a','#80361e','#521e16'];
  const CHITA=['#ff9c8c','#f05a4c','#c8343e','#921e36','#5e1028'];
  const WAT=['#f2fcff','#bfeaff','#7ccaf4','#3c9ae0','#2470c0','#1a4c94','#14306a'];
  const AIR=['#ffffff','#e6f8ff','#c4ecfc','#9cd6f4','#78bcea','#5698d2'];
  const CAP=['#9cc4ff','#4a78e8','#2c48b0','#1a2a74'];
  const LAB=['#ff9a7a','#f05a3a','#c0342a','#86201e','#561418'];
  const YEL=['#fff2a8','#ffd24a','#d49c22','#8a6010'];
  const BREAD=['#ffe6a8','#f4b65c','#d48a3a','#a25c26','#6a3418'];
  const WH=['#ffffff','#eef2f8','#d2dae8','#a2aec6','#6e7a9a','#464e70'];
  const RED=['#ffa0a0','#f03c4a','#b81c34','#741024'];
  const AMB=['#ffd890','#f0a040','#b8681e','#7a3e12'];
  const GAS=['#ffa088','#f4503c','#d0302e','#9a1c2a','#64102a','#3e0a1e'];
  const CRY=['#fff2f6','#ffb0c4','#ff5a78','#e8244a','#b0123a','#6e0a2e','#3e0420'];
  const ROCK=['#8e7ea0','#62527a','#423458','#2a1e3a'];
  const BP=['#d4ecff','#8ec8f4','#4e94e0','#2e66c0','#1e4290','#142a62'];
  const GOLD=['#fffbe0','#ffe680','#f6c838','#d89a20','#a06a14','#643e0c'];
  const HOLE='#1c1226';
  const BRONZE=['#fff0d0','#f6c488','#d8924a','#a8622a','#743e18','#44220c'];
  const OLIVE=['#f0f4c0','#c4d070','#8ea040','#62762a','#3e4e1a','#24300e'];
  const SILV=['#ffffff','#e2e8f4','#b0bad0','#7c86a4','#525a7a','#30364e'];
  const MEDG=['#d8ffd0','#8ae07a','#4cb04e','#2e8040','#1c5432','#103424'];
  const RUB=['#8a8494','#615c6a','#45414e','#2e2b36','#1c1a22'];
  const GLASS=['#ffffff','#e4f6ff','#b4dcf0','#80b4d4','#5a88b0'];
  const ADR=['#ffe0b0','#ff9a3a','#e8501e','#b02c14','#6e1a0e'];

  // ---- kit explícito: cor própria por pixel, faixas duras, curvas suaves
  function kit(c,u){
    const col=h=>{ c.fillStyle=h; c.strokeStyle=h; u.add(h); };
    const path=pts=>{ c.beginPath(); pts.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])); c.closePath(); };
    const poly=(pts,h)=>{ col(h); path(pts); c.fill(); };
    const rect=(x,y,w,h,k)=>{ col(k); c.fillRect(x,y,w,h); };
    const ell=(x,y,rx,ry,k,rot)=>{ col(k); c.beginPath(); c.ellipse(x,y,Math.max(0.1,rx),Math.max(0.1,ry),rot||0,0,7); c.fill(); };
    const arc=(x,y,rx,ry,a0,a1,w,k)=>{ col(k); c.lineWidth=w; c.beginPath(); c.ellipse(x,y,rx,ry,0,a0,a1); c.stroke(); };
    const ln=(x0,y0,x1,y1,w,k)=>{ const dx=x1-x0, dy=y1-y0, L=Math.hypot(dx,dy)||1, nx=-dy/L*w/2, ny=dx/L*w/2; poly([[x0+nx,y0+ny],[x1+nx,y1+ny],[x1-nx,y1-ny],[x0-nx,y0-ny]],k); };
    // shape: array de pontos ou função que monta o path
    const clip=s=>{ if(typeof s==='function') s(); else path(s); c.clip(); };
    const band=(s,cols,fr,axis,a0,a1)=>{ c.save(); clip(s); const tot=fr.reduce((a,b)=>a+b,0); let acc=0;
      cols.forEach((k,i)=>{ const s0=i===0?-999:a0+(a1-a0)*acc/tot, s1=i===cols.length-1?999:a0+(a1-a0)*(acc+fr[i])/tot; col(k); if(axis==='y') c.fillRect(-999,s0,1999,s1-s0); else c.fillRect(s0,-999,s1-s0,1999); acc+=fr[i]; }); c.restore(); };
    const within=(s,fn)=>{ c.save(); clip(s); fn(); c.restore(); };
    const E=(x,y,rx,ry,rot)=>()=>{ c.beginPath(); c.ellipse(x,y,rx,ry,rot||0,0,7); };
    const smooth=(pts,n)=>{ n=n||5; const o=[], L=pts.length; for(let i=0;i<L;i++){ const p0=pts[(i-1+L)%L],p1=pts[i],p2=pts[(i+1)%L],p3=pts[(i+2)%L];
      for(let k=0;k<n;k++){ const t=k/n,t2=t*t,t3=t2*t; o.push([0,1].map(d=>0.5*((2*p1[d])+(-p0[d]+p2[d])*t+(2*p0[d]-5*p1[d]+4*p2[d]-p3[d])*t2+(-p0[d]+3*p1[d]-3*p2[d]+p3[d])*t3))); } } return o; };
    const cut=fn=>{ const o=c.globalCompositeOperation; c.globalCompositeOperation='destination-out'; c.fillStyle='#000'; fn(); c.globalCompositeOperation=o; };
    return {c,col,path,poly,rect,ell,arc,ln,band,within,E,smooth,cut};
  }
  const R=(x,y,w,h)=>[[x,y],[x+w,y],[x+w,y+h],[x,y+h]];

  // tora deitada (eixo x), tampa com anéis à esquerda
  function log(e,x0,x1,cy,r,seed){
    e.ell(x1,cy,r*0.5,r,BARK[4]);
    e.band(R(x0,cy-r,x1-x0,r*2),[BARK[0],BARK[1],BARK[2],BARK[3],BARK[4]],[1,2,3,3,2],'y',cy-r,cy+r);
    e.within(R(x0,cy-r,x1-x0+r,r*2),()=>{
      for(let i=0;i<9;i++){ const x=x0+2+hsh(i,seed)*(x1-x0-3), y=cy-r+1.2+hsh(i,seed+3)*(r*2-2.6), w=2+hsh(i,seed+5)*3.5;
        e.rect(x,y,w,1,y<cy-r*0.4?BARK[2]:BARK[4]); if(y<cy) e.rect(x+0.5,y-1,w-1,0.8,BARK[0]); }
      e.rect(x0,cy-r+0.6,x1-x0,0.9,'#ffe0b0');
    });
    e.ell(x0,cy,r*0.6+0.9,r+0.2,BARK[3]);
    e.band(e.E(x0,cy,r*0.6,r-0.6),[GRAIN[0],GRAIN[1],GRAIN[2]],[1,2,1],'x',x0-r*0.6,x0+r*0.6);
    e.arc(x0-0.2,cy,r*0.42,r*0.7,0,7,0.7,GRAIN[3]);
    e.arc(x0-0.3,cy,r*0.22,r*0.38,0,7,0.7,GRAIN[3]);
    e.ell(x0-0.3,cy,0.6,0.8,GRAIN[4]);
    e.ln(x0,cy,x0+r*0.3,cy+r*0.8,0.7,GRAIN[4]);
    e.rect(x0-r*0.35,cy-r*0.7,1.2,1,GRAIN[0]);
  }
  function rope(e,x,y0,y1){
    e.band(R(x,y0,2.4,y1-y0),[ROPE[0],ROPE[1],ROPE[2]],[1,1.4,1],'x',x,x+2.4);
    for(let y=y0+0.6;y<y1-0.5;y+=1.7) e.ln(x,y,x+2.4,y+1,0.6,ROPE[3]);
  }

  // chave de baú com medalhão (rampa G de 6 tons + emblema no centro do medalhão)
  function keyArt(e,G,emblem){
    const ang=0.74, cx=9.4, cy=8.4, ca=Math.cos(ang), sa=Math.sin(ang);
    const shape=(dark)=>{
      e.c.save(); e.c.translate(cx+(dark?0.8:0),cy+(dark?1.2:0)); e.c.rotate(ang);
      const fill=(s,a0,a1)=>{ if(dark) e.within(s,()=>e.rect(-30,-30,60,60,G[5])); else e.band(s,[G[1],G[2],G[3],G[4]],[1,1.4,1.4,1],'y',a0,a1); };
      fill(()=>{ e.c.beginPath(); e.c.ellipse(0,0,5.6,5.6,0,0,7); e.c.moveTo(-6.4+2.6,0); e.c.ellipse(-6.4,0,2.6,2.6,0,0,7); },-6,6);
      fill(R(4.6,-1.4,14.2,2.8),-1.4,1.4);
      fill(R(5.4,-2.6,2.6,5.2),-2.6,2.6);
      fill([[14,1.2],[19,1.2],[19,6.4],[17.6,6.4],[17.6,4.6],[16.4,4.6],[16.4,6.4],[14,6.4]],1.2,6.4);
      fill(e.E(18.8,0,1.4,1.4),-1.4,1.4);
      if(!dark){
        e.rect(4.6,-1.4,14.2,0.6,G[0]); e.rect(5.4,-2.6,2.6,0.6,G[0]); e.arc(0,0,4.7,4.7,3.5,4.9,0.9,G[0]); e.arc(-6.4,0,1.9,1.9,3.6,4.8,0.7,G[0]);
        e.rect(14,5.6,5,0.8,G[4]); e.rect(10,-0.4,3.4,0.6,G[3]);
      }
      e.c.restore();
    };
    shape(true); shape(false);
    // medalhão rebaixado + emblema
    e.ell(cx,cy,3.6,3.6,G[4]); e.ell(cx+0.3,cy+0.3,3.1,3.1,G[5]); e.arc(cx,cy,3.4,3.4,0.2,1.6,0.6,G[1]);
    emblem(cx,cy);
    // furo da argola + aro de chaveiro (aço)
    const hx=cx-6.4*ca, hy=cy-6.4*sa;
    e.cut(()=>{ e.c.beginPath(); e.c.ellipse(hx,hy,1.3,1.3,0,0,7); e.c.fill(); });
    e.arc(3.4,7.8,2.8,3.4,0.3,4.4,1.1,STEEL[2]); e.arc(3.4,7.8,2.8,3.4,2.4,3.8,0.7,STEEL[0]); e.arc(3.4,7.8,2.8,3.4,4.4,6.6,1.1,STEEL[3]);
  }
  const star5=(x,y,ro,ri,rot)=>{ const p=[]; for(let k=0;k<10;k++){ const a=rot-Math.PI/2+k*Math.PI/5, r=k%2?ri:ro; p.push([x+Math.cos(a)*r,y+Math.sin(a)*r]); } return p; };
  // florzinha de chita (pétalas claras, miolo amarelo, folhinhas)
  function chitaFlower(e,x,y,lo){ const pet=lo?'#e8c8a8':'#fff4e0', mid=lo?'#d89a20':'#ffd24a', lf=lo?'#2e7a3a':'#5ab84a';
    e.rect(x+1.4,y+1,1.4,0.9,lf); e.rect(x-2.4,y-1.2,1.2,0.9,lf);
    e.rect(x-1,y-0.4,2.4,1.2,pet); e.rect(x-0.4,y-1,1.2,2.4,pet); e.rect(x-0.2,y-0.2,0.9,0.9,mid); }

  const D={
    madeira(e){
      log(e,9,24,11,5,1);
      rope(e,14.6,6,16);
      log(e,5,21,18.8,5.6,7);
      rope(e,12,13.2,24.4);
      e.ell(15.8,6.6,1.8,1.2,ROPE[1]); e.rect(15,6,1.4,0.8,ROPE[0]); e.ln(16.6,7,19,9.4,0.9,ROPE[2]);
      // broto de folha (vida voltando)
      e.ln(21,6.6,22,4.4,0.8,'#3c7a2e'); e.ell(23,4,1.6,0.9,'#7ccc4a',-0.5); e.rect(22.4,3.4,1,0.6,'#c8f080');
    },
    sucata(e){
      const S=STEEL;
      // chapa ondulada amassada
      e.poly([[2,15],[8,7.6],[18,5.6],[26,10],[25.4,20],[16,24.6],[4.6,23]],S[3]);
      e.poly([[2,15],[8,7.6],[13.6,12.6],[7,18]],S[1]);
      e.poly([[8,7.6],[18,5.6],[13.6,12.6]],S[0]);
      e.poly([[18,5.6],[26,10],[20,14],[13.6,12.6]],S[1]);
      e.poly([[13.6,12.6],[20,14],[16,24.6],[10,21]],S[3]);
      e.poly([[7,18],[13.6,12.6],[10,21],[4.6,23],[2,15]],S[2]);
      e.poly([[20,14],[26,10],[25.4,20],[16,24.6]],S[4]);
      e.within([[2,15],[8,7.6],[18,5.6],[26,10],[25.4,20],[16,24.6],[4.6,23]],()=>{
        for(let k=0;k<6;k++){ const o=k*3.6; e.ln(1+o,22-o*0.25,6+o,6-o*0.2,0.8,S[4]); e.ln(2+o,22-o*0.25,7+o,6-o*0.2,0.6,S[0]); }
        // ferrugem nas bordas
        e.ell(4,20,3.4,2.6,RUST[2]); e.ell(3.6,19.4,2,1.4,RUST[1]); e.rect(3,18.6,1.4,0.8,RUST[0]);
        e.ell(22,8.6,3,1.8,RUST[2]); e.ell(21.6,8.2,1.8,1,RUST[1]);
        e.ell(12,22.6,2.6,1.4,RUST[3]);
      });
      e.ell(11,10.4,0.9,0.9,HOLE); e.ell(6,15.6,0.8,0.8,HOLE);
      e.ln(8,7.6,18,5.6,0.8,'#ffffff');
      // engrenagem enferrujada em pé
      const cx=18.4, cy=18.6, ro=5.6, ri=4.3, pts=[];
      for(let k=0;k<10;k++){ const a=k/10*6.2832+0.2, w=0.2; [[a-w*1.6,ri],[a-w,ro],[a+w,ro],[a+w*1.6,ri]].forEach(([q,r])=>pts.push([cx+Math.cos(q)*r,cy+Math.sin(q)*r])); }
      const sh=pts.map(([x,y])=>[x+1,y+1]);
      e.poly(sh,RUST[4]);
      e.band(pts,[RUST[0],RUST[1],RUST[2],RUST[3]],[1,2,3,2],'y',cy-ro,cy+ro);
      e.arc(cx,cy,3.1,3.1,0,7,0.8,RUST[3]);
      e.ell(cx,cy,2,2,STEEL[3]); e.ell(cx-0.4,cy-0.4,1.3,1.3,STEEL[1]); e.ell(cx,cy,0.8,0.8,HOLE);
      e.arc(cx,cy,4,4,3.5,4.6,0.9,RUST[0]);
      e.rect(cx+1.4,cy+1.8,1.6,1,RUST[4]); e.rect(cx-3,cy+0.6,1,1,RUST[4]);
      // parafuso solto
      e.ln(3.6,23.4,8.4,21.2,2,S[3]); e.ln(3.8,22.8,8.2,20.8,0.8,S[1]);
      e.ell(8.8,21.2,1.9,1.4,S[2]); e.ell(8.6,20.8,1.4,0.9,S[0]);
    },
    pano(e){
      const C=CHITA;
      e.ell(22,15.6,2.8,6.4,C[3]);
      const body=R(6,9.2,16,12.8);
      e.band(body,[C[0],C[1],C[1],C[2],C[3]],[1,2,3,3,2],'y',9.2,22);
      // aba solta caindo até o chão
      const flap=[[12,20.6],[22.6,19.6],[23.6,22.4],[22,24.6],[18,24],[14.4,24.6],[11.4,23.4]];
      e.band(flap,[C[1],C[2],C[3]],[1,2,2],'y',20,24.6);
      e.ln(15,21.4,14,24,0.7,C[4]); e.ln(19.4,21,19,23.8,0.7,C[4]);
      // estampa de chita (flores grandes + folhinhas), sombreada pela altura
      const flower=(x,y,lo)=>{ const pet=lo?'#e8c8a8':'#fff4e0', mid=lo?'#d89a20':'#ffd24a', lf=lo?'#2e7a3a':'#5ab84a';
        e.rect(x+1.4,y+1,1.4,0.9,lf); e.rect(x-2.4,y-1.2,1.2,0.9,lf);
        e.rect(x-1,y-0.4,2.4,1.2,pet); e.rect(x-0.4,y-1,1.2,2.4,pet); e.rect(x-0.2,y-0.2,0.9,0.9,mid); };
      e.within([...body.slice(0,4)],()=>{
        [[9,11],[15,12.4],[20,10.6],[11.6,16],[17.6,17.4],[8,20],[14,20.6],[21,15]].forEach(([x,y])=>flower(x,y,y>16.5));
        for(let i=0;i<14;i++){ const x=6.5+hsh(i,4)*15, y=9.6+hsh(i,8)*12; e.rect(x,y,0.8,0.8,y<15?'#ffd24a':'#b03050'); }
        e.rect(6,9.6,16,0.9,'#ffc8b8');
      });
      e.within(flap,()=>{ flower(17,22.4,true); e.rect(21,21.4,0.8,0.8,'#d89a20'); });
      // tampa em espiral
      e.ell(6,15.6,3.8,6.6,C[2]);
      e.ell(6,15.6,3.1,5.6,C[0]);
      e.arc(6.2,15.8,2.3,4.2,0,7,0.8,C[3]);
      e.arc(6.3,16,1.3,2.5,0,7,0.8,C[3]);
      e.ell(6.4,16.1,0.6,1,'#3a0818');
      e.rect(5.2,10.8,1.2,1,'#fff0e8');
      // amarras com laço
      [10.4,18.2].forEach(x=>{ e.band(R(x,9,1.4,13.4),['#fff4dc','#e8d4a8','#b09a70'],[1,2,1],'y',9,22.4); });
      e.ell(17.2,8.6,1.8,1.2,'#f4e4bc'); e.ell(20.4,8.4,1.8,1.2,'#e8d4a8'); e.rect(18.4,8,1.6,1.4,'#b09a70');
      e.ln(18.6,9.4,17,12,0.8,'#e8d4a8'); e.ln(19.6,9.4,21.4,11.6,0.8,'#b09a70');
    },
    agua(e){
      const W=WAT;
      const body=e.smooth([[6,24.4],[5.4,14],[6.6,9.6],[10,7.4],[18,7.4],[21.4,9.6],[22.6,14],[22,24.4]],5);
      e.band(body,[W[1],W[0],W[2],W[3],W[4],W[5],W[6]],[1,1.2,3,4,3.4,2,1],'x',5.4,22.6);
      // ar acima da linha d'água (mais translúcido)
      e.within(body,()=>{
        e.band(R(0,0,30,11.6),[AIR[1],AIR[0],AIR[2],AIR[3],AIR[4],AIR[5]],[1,1.2,3,4,4,2],'x',5.4,22.6);
        e.ell(14,11.8,9,1.5,'#a8e2fa'); e.rect(8,11.6,6,0.8,'#ffffff'); e.ell(14,12.6,9,0.7,W[3]);
        // nervuras do galão
        [15.6,20].forEach(y=>{ e.rect(0,y,30,0.9,W[5]); e.rect(0,y+0.9,30,0.8,W[1]); });
        e.rect(0,22.8,30,2,W[5]); e.rect(0,22.8,30,0.7,W[3]);
        // reflexos fortes
        e.rect(8.2,9.4,1.4,12.4,'#ffffff'); e.rect(9.8,10.4,0.7,8,W[0]);
        e.rect(19.6,13,1,3.4,'#dff6ff'); e.rect(19.6,17,1,1,'#dff6ff');
        // bolhas
        e.ell(13,18,0.9,0.9,W[1]); e.rect(12.6,17.6,0.6,0.6,'#ffffff'); e.ell(16,14.6,0.6,0.6,W[1]); e.ell(11.4,21.4,0.5,0.5,W[1]);
      });
      // ombro e gargalo
      e.ell(14,8,7.4,1.6,AIR[1]); e.ell(14,8.3,6,1,AIR[3]);
      e.band(R(10.6,4.2,6.8,4),[AIR[1],AIR[0],AIR[2],AIR[4]],[1,1,2,1],'x',10.6,17.4);
      // tampa azul
      e.band(R(10.2,1.8,7.6,3.2),[CAP[0],CAP[1],CAP[2],CAP[3]],[1,2,3,1],'x',10.2,17.8);
      e.ell(14,1.9,3.8,1,CAP[0]); e.rect(12,1.4,2,0.6,'#ffffff');
      for(let x=11;x<17.5;x+=1.4) e.rect(x,3.2,0.6,1.6,CAP[3]);
      e.rect(10.2,4.6,7.6,0.6,CAP[3]);
    },
    comida(e){
      const S=STEEL;
      // lata de conserva
      const cx=10.4, top=10.6, bot=23.6, rx=5.6, ry=1.8;
      e.ell(cx,bot,rx,ry,S[4]);
      e.band(R(cx-rx,top,rx*2,bot-top),[S[1],S[0],S[1],S[2],S[3],S[4]],[1,1,2,3,2,1],'x',cx-rx,cx+rx);
      const lab=()=>{ e.c.beginPath(); e.c.rect(cx-rx,top+2.2,rx*2,bot-top-4.2); };
      e.band(lab,[LAB[1],LAB[0],LAB[1],LAB[2],LAB[3],LAB[4]],[1,1,2,3,2,1],'x',cx-rx,cx+rx);
      e.band(()=>{ e.c.beginPath(); e.c.rect(cx-rx,top+3.6,rx*2,2.4); },[YEL[1],YEL[0],YEL[1],YEL[2],YEL[3]],[1,1,3,3,1],'x',cx-rx,cx+rx);
      e.ell(cx-0.8,top+8.8,2.6,1.8,'#fff4e0'); e.ell(cx-0.8,top+9,1.6,0.9,'#5aa8e0'); e.rect(cx-2.6,top+8.6,1,0.8,'#5aa8e0'); e.rect(cx,top+8.6,0.6,0.5,HOLE);
      [top+2.2,bot-2].forEach(y=>{ e.rect(cx-rx,y-0.5,rx*2,0.6,S[4]); e.rect(cx-rx,y,rx*2,0.5,S[0]); });
      e.rect(cx-rx+1.2,top+1,1.2,bot-top-2,'#ffffff');
      // topo
      e.ell(cx,top,rx,ry,S[2]); e.ell(cx,top-0.1,rx-0.7,ry-0.5,S[0]); e.ell(cx+0.3,top+0.1,rx-1.6,ry-0.9,S[1]);
      e.ell(cx+1.6,top,1.2,0.6,S[3]); e.rect(cx+0.6,top-0.4,1.6,0.5,S[0]);
      // pão francês
      e.c.save(); e.c.translate(18.4,20.6); e.c.rotate(-0.38);
      e.ell(0.8,1,6.8,3.6,BREAD[4]);
      e.band(e.E(0,0,6.8,3.6),[BREAD[0],BREAD[1],BREAD[2],BREAD[3],BREAD[4]],[1,2,3,2,1],'y',-3.6,3.6);
      [-3.4,0,3.4].forEach(x=>{ e.ln(x-1.4,0.4,x+1.6,-1.8,1.1,BREAD[0]); e.ln(x-1.2,1.1,x+1.8,-1.1,0.6,BREAD[3]); });
      e.rect(-4,-3,4,0.8,'#fff4d0');
      for(let i=0;i<6;i++) e.rect(-5+hsh(i,3)*10,-2+hsh(i,6)*4,0.6,0.6,'#fff0c0');
      e.c.restore();
    },
    remedio(e){
      const Wh=WH;
      const front=R(3.6,12,16.6,12.4), top=[[3.6,12],[7.8,8.4],[24.4,8.4],[20.2,12]], side=[[20.2,12],[24.4,8.4],[24.4,20.8],[20.2,24.4]];
      e.band(side,[Wh[3],Wh[4],Wh[5]],[2,2,1],'y',8.4,24.4);
      e.band(top,[Wh[0],Wh[1]],[2,1],'y',8.4,12);
      e.band(front,[Wh[1],Wh[2],Wh[3],Wh[4]],[2,4,3,1],'y',12,24.4);
      // tampa: friso e faixa vermelha
      e.rect(3.6,15.2,16.6,0.8,Wh[4]); e.rect(3.6,16,16.6,0.7,Wh[0]);
      e.poly([[20.2,15.2],[24.4,11.6],[24.4,12.4],[20.2,16]],Wh[5]);
      e.rect(3.6,12,16.6,0.8,'#ffffff'); e.ln(3.6,12,7.8,8.4,0.8,'#ffffff');
      e.rect(3.6,22.6,16.6,1.8,RED[2]); e.rect(3.6,22.6,16.6,0.6,RED[1]); e.poly([[20.2,22.6],[24.4,19],[24.4,20.8],[20.2,24.4]],RED[3]);
      // cruz vermelha biselada
      const cr=(ox,oy,k)=>{ e.rect(10.4+ox,16.2+oy,3.2,7.2,k); e.rect(8.4+ox,18.2+oy,7.2,3.2,k); };
      cr(0.8,0.8,RED[3]); cr(0,0,RED[1]); e.rect(10.4,16.2,3.2,0.8,RED[0]); e.rect(8.4,18.2,2,0.8,RED[0]); e.rect(10.4,16.2,0.8,2,RED[0]); e.rect(8.4,18.2,0.8,3.2,RED[0]);
      e.rect(12.8,20.6,0.8,2.8,RED[2]); e.rect(13.6,20.6,2,0.8,RED[2]);
      // fechos
      [5,16.6].forEach(x=>{ e.rect(x,14.2,2.4,2.8,Wh[4]); e.rect(x,14.2,2.4,0.8,STEEL[0]); e.rect(x+0.8,15.4,0.8,0.8,HOLE); });
      // alça
      e.band([[10.4,10.6],[10.4,7.2],[18,7.2],[18,10.6],[16.6,10.6],[16.6,8.6],[11.8,8.6],[11.8,10.6]],['#a0a6c0','#62668a','#3a3e5e'],[1,2,1],'y',7.2,10.6);
      e.rect(10.4,7.2,7.6,0.6,'#e4e8f4');
      // sujeira
      for(let i=0;i<7;i++) e.rect(4+hsh(i,2)*15,17+hsh(i,5)*5,0.8,0.8,Wh[3]);
      // frasco âmbar com tampa branca
      const fx=22.2;
      e.band(R(fx-2.4,18.6,4.8,6),[AMB[0],AMB[1],AMB[2],AMB[3]],[1,2,2,1],'x',fx-2.4,fx+2.4);
      e.ell(fx,24.6,2.4,0.8,AMB[3]);
      e.rect(fx-2.4,20.4,4.8,2.4,'#f4f0e4'); e.rect(fx-2.4,22.2,4.8,0.6,'#b8b0a0'); e.rect(fx-1,20.8,2,0.8,RED[1]);
      e.band(R(fx-2,16.4,4,2.4),[Wh[0],Wh[1],Wh[3]],[1,2,1],'x',fx-2,fx+2); e.ell(fx,16.4,2,0.7,'#ffffff');
      e.rect(fx-1.8,18.8,0.8,4,'#fff4d8');
    },
    pecas(e){
      const S=STEEL;
      // parafuso deitado (atrás)
      e.c.save(); e.c.translate(5.4,10.2); e.c.rotate(0.28);
      e.band(R(2.6,-1.6,12,3.2),[S[0],S[1],S[2],S[3],S[4]],[1,1,2,2,1],'y',-1.6,1.6);
      for(let x=3.6;x<14.4;x+=1.4){ e.rect(x,-1.6,0.6,3.2,S[4]); e.rect(x+0.6,-1.6,0.4,1.2,S[0]); }
      e.ell(14.6,0,0.8,1.6,S[3]);
      e.band(R(-1.2,-3.2,3.8,6.4),[S[0],S[1],S[2],S[3],S[4]],[1,2,2,2,1],'y',-3.2,3.2);
      e.rect(-1.2,-1.2,3.8,0.6,S[4]); e.rect(-1.2,1.2,3.8,0.6,S[4]); e.rect(-1.2,-3.2,3.8,0.6,'#ffffff');
      e.c.restore();
      // mola em pé
      const mx=19.4, coils=6, y0=23.4, dy=2.5, rx=3.8, ry=1.3;
      for(let i=0;i<coils;i++) e.arc(mx,y0-i*dy,rx,ry,3.1416,6.2832,1.3,S[4]);
      e.rect(mx-rx-0.6,y0-(coils-1)*dy,1.3,1,S[4]);
      for(let i=0;i<coils;i++){ const y=y0-i*dy; e.arc(mx,y,rx,ry,0,3.1416,1.4,S[2]); e.arc(mx,y,rx,ry,1.2,2.8,1.4,S[1]); e.arc(mx,y,rx,ry,1.9,2.6,1,S[0]); }
      e.rect(mx-2.6,y0-(coils-1)*dy-0.2,1.2,0.8,'#ffffff');
      // porca sextavada deitada (frente)
      const cx=8.6, cy=18.6, r=5.4, ry2=r*0.56, t=2.8;
      const V=[[cx-r,cy],[cx-r/2,cy-ry2],[cx+r/2,cy-ry2],[cx+r,cy],[cx+r/2,cy+ry2],[cx-r/2,cy+ry2]];
      e.poly([V[0],V[5],[V[5][0],V[5][1]+t],[V[0][0],V[0][1]+t]],S[2]);
      e.poly([V[5],V[4],[V[4][0],V[4][1]+t],[V[5][0],V[5][1]+t]],S[3]);
      e.poly([V[4],V[3],[V[3][0],V[3][1]+t],[V[4][0],V[4][1]+t]],S[4]);
      e.rect(V[5][0],V[5][1]+t-0.6,r,0.6,S[5]);
      e.band(V,[S[0],S[1],S[1],S[2]],[1,2,2,1],'y',cy-ry2,cy+ry2);
      e.ln(V[0][0],V[0][1],V[1][0],V[1][1],0.7,'#ffffff');
      e.ell(cx,cy,r*0.42,ry2*0.46,S[5]); e.ell(cx,cy+0.5,r*0.36,ry2*0.3,S[3]); e.ell(cx,cy+0.7,r*0.24,ry2*0.18,HOLE);
      e.rect(V[5][0]+0.4,V[5][1]+0.6,0.8,t-1,'#ffffff');
    },
    gasolina(e){
      const G=GAS;
      const fr=e.smooth([[5,8.6],[19,8.6],[19.4,23.6],[18,24.6],[6,24.6],[4.6,23.6]],3);
      e.band([[19,9],[23.4,5.6],[23.4,21],[19.2,24.6]],[G[3],G[4],G[5]],[2,2,1],'y',6,24.6);
      e.band([[5,8.8],[9.2,5.4],[23.4,5.4],[19,8.8]],[G[0],G[1]],[1,2],'y',5.4,8.8);
      e.band(fr,[G[1],G[0],G[1],G[2],G[2],G[3],G[4]],[1,1,2,4,3,2,1],'x',4.6,19.4);
      // X estampado (nervuras) dentro do painel
      e.within(fr,()=>{
        e.rect(6.4,10.4,11.2,0.8,G[3]); e.rect(6.4,21.8,11.2,0.8,G[0]); e.rect(6.4,10.4,0.8,12.2,G[3]); e.rect(16.8,10.4,0.8,12.2,G[0]);
        e.ln(7.6,11.6,16.4,21.4,1.4,G[3]); e.ln(16.4,11.6,7.6,21.4,1.4,G[3]);
        e.ln(7.4,11,16.2,20.8,0.8,G[0]); e.ln(16,11,7.2,20.8,0.8,G[0]);
        e.rect(5.4,9.4,1,13,'#ffd0c0');
        for(let i=0;i<8;i++) e.rect(6+hsh(i,7)*12,12+hsh(i,9)*11,0.8,0.8,i%2?G[4]:G[0]);
      });
      // adesivo de inflamável
      e.poly([[8,17.4],[10,15.4],[12,17.4],[10,19.4]],YEL[1]); e.rect(9.6,16.4,0.8,1.8,HOLE); e.rect(9.6,18.4,0.8,0.5,HOLE);
      // alça tripla
      e.band(R(8.6,2,9.6,4.2),[G[0],G[1],G[2],G[3]],[1,1,2,1],'y',2,6.2);
      e.cut(()=>{ e.c.fillRect(9.8,3.4,2.8,1.8); e.c.fillRect(14,3.4,2.8,1.8); });
      e.rect(8.6,2,9.6,0.7,'#ffd8c8');
      // bico flexível
      e.c.save(); e.c.translate(20.2,6.4); e.c.rotate(-0.85);
      e.band(R(-1.8,-1.6,3.6,2.4),[G[2],G[3],G[4]],[1,1,1],'x',-1.8,1.8);
      e.band(R(-1.2,-6.8,2.4,5.4),[YEL[0],YEL[1],YEL[2],YEL[3]],[1,1,1,1],'x',-1.2,1.2);
      for(let y=-6.2;y<-1.6;y+=1.3) e.rect(-1.2,y,2.4,0.5,YEL[3]);
      e.band(R(-0.8,-8.6,1.6,2),[STEEL[0],STEEL[2],STEEL[3]],[1,1,1],'x',-0.8,0.8);
      e.c.restore();
      e.ell(7.4,6.6,1.8,0.9,G[3]); e.ell(7.4,6.2,1.4,0.6,STEEL[1]);
    },
    fragmento_lunar(e,fi){
      const C=CRY;
      // rocha base
      e.band([[5,24.6],[4.4,21.6],[7,19.6],[12,19],[18,19.4],[23,20.6],[23.6,24],[20,24.8],[9,24.8]],[ROCK[0],ROCK[1],ROCK[2],ROCK[3]],[1,2,2,1],'y',19,24.8);
      e.rect(7,20.4,3,0.8,ROCK[0]); e.rect(18,21,2.4,0.8,'#a898bc');
      const shard=(pts,lit,mid,dark,fb)=>{ // pts: base-esq, ombro-esq, ponta, ombro-dir, base-dir; fb: quina frontal
        const [b0,s0,t,s1,b1]=pts, f=[fb,(b0[1]+b1[1])/2];
        e.band([b0,s0,t,[f[0],t[1]+2.4],f],lit,[1,2,2],'y',t[1],b0[1]);
        e.band([[f[0],t[1]+2.4],t,s1,b1,f],dark,[1,2,2],'y',t[1],b1[1]);
        e.ln(t[0],t[1],f[0],t[1]+2.4,0.8,mid);
        e.ln(f[0],t[1]+2.4,f[0],f[1],0.8,mid);
      };
      shard([[4.6,22.6],[4,16.4],[6.6,11.6],[9.4,15.4],[9.4,22.6]],[C[1],C[2],C[3]],C[0],[C[4],C[5],C[6]],7);
      shard([[17.8,22.6],[18.4,14.6],[23.6,10.4],[24,16.6],[22,22.8]],[C[2],C[3],C[4]],C[1],[C[4],C[5],C[6]],20.8);
      // cristal principal
      const P=[[10.6,22.4],[9.8,10.4],[14,2.2],[18.4,10.4],[17.6,22.4]];
      e.band([P[0],P[1],P[2],[13.2,6],[12.8,22.4]],[C[1],C[2],C[3]],[1,2,2],'y',2.2,22.4);
      e.band([[12.8,22.4],[13.2,6],P[2],[15.2,6],[15.4,22.4]],[C[0],C[1],C[2],C[3]],[1,2,3,2],'y',2.2,22.4);
      e.band([[15.4,22.4],[15.2,6],P[2],P[3],P[4]],[C[4],C[5],C[6]],[1,2,1],'y',2.2,22.4);
      // núcleo pulsante (luz interna)
      const pul=[0,1,2,2,1,0][fi%6];
      e.rect(13.6,7,1.2,12,pul?'#ffffff':C[0]); if(pul>1) e.rect(13.2,10,2,4,'#ffffff');
      e.ell(14.2,15,1.4,3.4,pul?C[1]:C[2]);
      e.ln(13.2,6,10.2,11,0.6,C[0]); e.ln(15.2,6,18,10.6,0.6,C[3]);
      e.rect(11,9,0.8,4,C[0]);
      // lascas na base
      e.poly([[8.6,24.4],[9.6,21.8],[11,24.4]],C[2]); e.poly([[17,24.4],[18,22.2],[19,24.4]],C[3]);
    },
    projeto(e){
      const B=BP;
      // folha meio desenrolada no chão
      const sheet=[[11,20.6],[24.4,16.8],[25.6,21.6],[13.2,25]];
      e.band(sheet,[B[2],B[3],B[4]],[1,2,1],'y',16.8,25);
      e.within(sheet,()=>{
        for(let k=0;k<6;k++) e.ln(12+k*2.4,25-k*0.6,11+k*2.4,19-k*0.6,0.5,B[1]);
        e.ln(14,22.6,23,20,0.6,B[1]);
        e.poly([[16,22.8],[18.4,20.6],[21.4,21.6],[21.2,22.4],[18.4,21.6],[16.8,23]],'#e8f6ff');
        e.arc(21.8,19.6,1.2,0.8,0,7,0.5,'#e8f6ff');
      });
      e.ln(24.4,16.8,25.6,21.6,0.7,B[5]);
      e.ln(11,20.6,24.4,16.8,0.7,B[0]);
      // rolo inclinado
      e.c.save(); e.c.translate(13.6,13.2); e.c.rotate(-0.32);
      e.ell(8.6,0,2.2,4.8,B[4]);
      e.band(R(-9,-4.8,17.6,9.6),[B[1],B[0],B[1],B[2],B[3],B[4],B[5]],[1,1,2,3,3,2,1],'y',-4.8,4.8);
      e.within(R(-9,-4.8,17.6,9.6),()=>{
        for(let x=-7;x<8;x+=2.6) e.rect(x,-4.8,0.5,9.6,'#7ab8f0');
        e.rect(-9,-1,17.6,0.5,'#7ab8f0');
        e.ln(-6,1.6,-2,-2,0.6,'#e8f6ff'); e.rect(3,1,4,0.6,'#e8f6ff'); e.rect(3,-2.6,0.6,3.6,'#e8f6ff');
        e.rect(-9,-4.2,17.6,0.7,'#f0faff');
      });
      // ponta em espiral (verso do papel claro)
      e.ell(-9,0,2.6,4.8,'#b0d4f4');
      e.ell(-9,0,2.1,4.1,'#eef8ff');
      e.arc(-8.8,0.2,1.4,2.8,0,7,0.6,B[2]);
      e.arc(-8.7,0.4,0.7,1.4,0,7,0.6,B[3]);
      e.ell(-8.6,0.4,0.4,0.6,B[5]);
      // fita vermelha + lacre de cera
      e.band(R(-1.2,-4.9,2.6,9.8),[RED[0],RED[1],RED[2],RED[3]],[1,2,2,1],'y',-4.9,4.9);
      e.c.restore();
      e.ln(13.4,17.4,12.2,20.8,1,RED[2]); e.ln(15.2,17.2,16.4,20.6,1,RED[3]);
      e.ell(14.6,17.4,2.5,2.3,'#7a1020'); e.ell(14.3,17,2.2,2,'#c82838'); e.ell(14.3,17,1.2,1.1,'#9a1828'); e.rect(13.2,15.8,1,0.8,'#ff8a90');
    },
    chave(e){
      const G=GOLD, ang=0.74;
      const shape=(dark)=>{
        e.c.save(); e.c.translate(7.6+(dark?0.8:0),8.6+(dark?1.2:0)); e.c.rotate(ang);
        const fill=(s,a0,a1)=>{ if(dark) e.within(s,()=>e.rect(-30,-30,60,60,G[5])); else e.band(s,[G[1],G[2],G[3],G[4]],[1,1.4,1.4,1],'y',a0,a1); };
        // argola ornamentada (trevo)
        fill(()=>{ e.c.beginPath(); e.c.ellipse(0,0,4.6,4.6,0,0,7); [[-3.4,-3.4],[-3.4,3.4],[-4.8,0]].forEach(([x,y])=>{ e.c.moveTo(x+2.2,y); e.c.ellipse(x,y,2.2,2.2,0,0,7); }); },-6,6);
        // haste + colar + palheta
        fill(R(3.6,-1.4,15,2.8),-1.4,1.4);
        fill(R(4.4,-2.6,2.6,5.2),-2.6,2.6);
        fill([[14,1.2],[19,1.2],[19,6.4],[17.6,6.4],[17.6,4.6],[16.4,4.6],[16.4,6.4],[14,6.4]],1.2,6.4);
        fill(e.E(18.6,0,1.4,1.4),-1.4,1.4);
        if(!dark){
          e.rect(3.6,-1.4,15,0.6,G[0]); e.rect(4.4,-2.6,2.6,0.6,G[0]); e.arc(0,0,3.6,3.6,3.4,4.9,0.9,G[0]);
          e.rect(5.4,-0.8,0.8,1.6,'#e8244a'); e.rect(5.4,-0.8,0.8,0.6,'#ffb0c4');
          e.rect(14,5.6,5,0.8,G[4]);
        }
        e.c.restore();
      };
      shape(true); shape(false);
      e.cut(()=>{ e.c.beginPath(); e.c.ellipse(7.6,8.6,2.2,2.2,0,0,7); e.c.fill(); });
      // aro de chaveiro (aço) passando pela argola
      e.arc(4.2,12.6,3.2,3.8,0.2,4.6,1.2,STEEL[2]); e.arc(4.2,12.6,3.2,3.8,2.4,4,0.8,STEEL[0]); e.arc(4.2,12.6,3.2,3.8,4.6,6.5,1.2,STEEL[3]);
    },
    chave_comum(e){
      // bronze com espiral gravada
      keyArt(e,BRONZE,(x,y)=>{ e.arc(x,y,2,2,0,5.4,0.8,BRONZE[2]); e.arc(x,y,0.9,0.9,0,5,0.7,BRONZE[1]); e.rect(x-1.4,y-1.8,1,0.6,BRONZE[0]); });
    },
    chave_medico(e){
      // prata com cruz vermelha biselada
      keyArt(e,SILV,(x,y)=>{ const cr=(o,k)=>{ e.rect(x-0.9+o,y-2.4+o,1.8,4.8,k); e.rect(x-2.4+o,y-0.9+o,4.8,1.8,k); };
        cr(0.5,RED[3]); cr(0,RED[1]); e.rect(x-0.9,y-2.4,1.8,0.6,RED[0]); e.rect(x-2.4,y-0.9,1.6,0.6,RED[0]); e.rect(x+0.2,y+0.4,0.7,2,RED[2]); });
    },
    chave_militar(e){
      // verde-oliva com estrela amarela
      keyArt(e,OLIVE,(x,y)=>{ e.poly(star5(x+0.4,y+0.5,2.9,1.2,0),OLIVE[5]); e.band(star5(x,y,2.9,1.2,0),[YEL[0],YEL[1],YEL[2]],[1,1.2,1],'y',y-2.9,y+2.4); e.rect(x-0.4,y-1.6,0.6,0.8,'#ffffff'); });
    },
    chave_raro(e){
      // ouro com lua de sangue crescente
      keyArt(e,GOLD,(x,y)=>{ e.within(e.E(x,y,2.8,2.8),()=>{ e.band(e.E(x,y,2.8,2.8),[CRY[1],CRY[2],CRY[3],CRY[4]],[1,1.4,1.4,1],'x',x-2.8,x+2.8); e.ell(x+1.3,y-0.9,2.3,2.3,GOLD[5]); });
        e.rect(x-2,y-0.6,0.6,1.2,CRY[0]); e.rect(x+1.8,y+1.6,0.6,0.6,'#fff2a8'); });
    },
    kit_cura(e){
      const Gn=MEDG;
      // alça de lona
      e.arc(13,10.6,5,3.6,3.3,6.1,1.8,Gn[4]); e.arc(13,10.4,5,3.6,3.6,4.8,0.7,Gn[1]);
      // bolsa
      const body=e.smooth([[3.6,12.2],[22.4,12.2],[23,23.6],[21.2,25],[5.2,25],[3,23.6]],3);
      e.band(body,[Gn[1],Gn[2],Gn[2],Gn[3],Gn[4],Gn[5]],[1,2,3,3,2,1],'y',12.2,25);
      e.within(body,()=>{ for(let x=4.6;x<22;x+=1.8) e.rect(x,23.2,1,0.5,Gn[4]); e.rect(3,20.4,21,0.7,Gn[4]); e.rect(3,21.1,21,0.5,Gn[2]); });
      // aba com patch branco e cruz
      const flap=[[3.2,11.2],[22.8,11.2],[22.8,16.6],[16,19.2],[10,19.2],[3.2,16.6]];
      e.band(flap,[Gn[0],Gn[1],Gn[2],Gn[3]],[1,2,3,1],'y',11.2,19.2);
      e.ln(3.2,16.6,10,19.2,0.7,Gn[5]); e.ln(16,19.2,22.8,16.6,0.7,Gn[5]); e.rect(10,18.6,6,0.7,Gn[5]);
      e.rect(3.6,11.2,18.8,0.7,'#f0fff0');
      e.band(R(9.4,12,7.2,5.4),[WH[0],WH[1],WH[2],WH[3]],[1,2,2,1],'y',12,17.4);
      e.rect(9.4,17,7.2,0.5,WH[4]);
      const cr=(o,k)=>{ e.rect(12.2+o,12.6+o,1.6,4.2,k); e.rect(10.9+o,13.9+o,4.2,1.6,k); };
      cr(0.5,RED[3]); cr(0,RED[1]); e.rect(12.2,12.6,1.6,0.6,RED[0]); e.rect(10.9,13.9,1.4,0.6,RED[0]);
      // botão de pressão
      e.ell(13,18.4,1.3,0.9,STEEL[3]); e.ell(12.8,18.2,0.8,0.5,STEEL[0]);
      // rolo de atadura em pé
      e.ell(22.4,24.5,3,1,WH[5]);
      e.band(R(19.4,18.8,6,5.8),[WH[0],WH[1],WH[2],WH[3],WH[4]],[1,1,2,2,1],'x',19.4,25.4);
      e.within(R(19.4,18.8,6,5.8),()=>{ for(let y=20.2;y<24.6;y+=1.5) e.rect(19.4,y,6,0.5,WH[3]); });
      e.ell(22.4,18.8,3,1.1,WH[1]); e.arc(22.4,18.8,1.8,0.6,0,7,0.5,WH[3]); e.ell(22.4,18.8,0.7,0.3,WH[4]);
      e.poly([[25.2,20.6],[26.8,22.4],[26.4,24.8],[25.2,23.8]],WH[2]); e.rect(25.2,20.6,0.6,3,WH[0]);
    },
    presente(e){
      const C=CHITA;
      // caixa embrulhada em chita (3/4)
      const front=R(3.4,13.4,15.2,11.2), side=[[18.6,13.4],[24.4,9.8],[24.4,21.2],[18.6,24.6]], top=[[3.4,13.4],[9.2,9.8],[24.4,9.8],[18.6,13.4]];
      e.band(side,[C[2],C[3],C[4]],[2,2,1],'y',9.8,24.6);
      e.band(top,[C[0],C[1]],[1,2],'y',9.8,13.4);
      e.band(front,[C[1],C[1],C[2],C[3]],[1,3,3,1],'y',13.4,24.6);
      e.within(front,()=>{ [[6,16.2],[15.8,16.8],[6.6,22.4],[15,22.6]].forEach(([x,y])=>chitaFlower(e,x,y,y>20));
        for(let i=0;i<8;i++){ const x=4+hsh(i,11)*14, y=14+hsh(i,13)*10; e.rect(x,y,0.8,0.8,y<19?'#ffd24a':'#b03050'); } });
      e.within(side,()=>{ chitaFlower(e,21.6,15.6,true); chitaFlower(e,21,21.4,true); });
      e.within(top,()=>{ chitaFlower(e,8.6,11.8,false); chitaFlower(e,20.4,11,false); });
      // fita amarela
      e.band(R(9.8,13.4,2.6,11.2),[YEL[0],YEL[1],YEL[2]],[1,2,1],'x',9.8,12.4);
      e.poly([[18.6,17.6],[24.4,14],[24.4,16.2],[18.6,19.8]],YEL[2]);
      e.poly([[9.8,13.4],[15.6,9.8],[18.2,9.8],[12.4,13.4]],YEL[1]);
      e.poly([[6.3,11],[21.5,11],[21.5,12.2],[6.3,12.2]],YEL[0]);
      e.ln(3.4,13.4,9.2,9.8,0.7,'#ffd0c8'); e.rect(3.4,13.4,15.2,0.6,'#ffc0b0');
      // cigarro de palha enfiado no laço
      e.ln(15.6,10.4,22.6,6.2,1.4,'#c8a860'); e.ln(15.6,10,22.6,5.8,0.6,'#fff0c0'); e.ln(19,8.6,19.6,9.4,0.5,'#8a6a30');
      e.ell(22.9,6,0.9,0.9,'#ff6a3a'); e.rect(22.8,5.6,0.5,0.5,'#fff2a8');
      // laço
      e.ell(10.8,8.8,3.2,2,YEL[2],-0.5); e.ell(10.8,8.5,2.5,1.4,YEL[1],-0.5); e.ell(11.2,8.8,1,0.6,YEL[3],-0.5);
      e.ell(16.4,8.8,3.2,2,YEL[2],0.5); e.ell(16.4,8.5,2.5,1.4,YEL[0],0.5); e.ell(16,8.8,1,0.6,YEL[3],0.5);
      e.poly([[13,10.6],[10.8,14.6],[12.2,15],[14,11]],YEL[2]); e.poly([[14.2,10.6],[17.2,14.2],[15.8,14.8],[13.4,11]],YEL[1]);
      e.ell(13.6,10.2,1.7,1.4,YEL[2]); e.ell(13.4,9.9,1,0.8,YEL[0]);
    },
    adrenalina(e){
      const S=STEEL;
      // ampola atrás
      e.band(R(18.8,16.4,4.6,8),[GLASS[0],GLASS[1],GLASS[2],GLASS[3]],[1,1,2,1],'x',18.8,23.4);
      e.ell(21.1,24.4,2.3,0.8,GLASS[4]);
      e.band(R(18.8,20,4.6,4.4),[ADR[0],ADR[1],ADR[2],ADR[3]],[1,1,2,1],'x',18.8,23.4);
      e.rect(18.8,18,4.6,1.4,'#fff4e0'); e.rect(18.8,18.4,4.6,0.5,RED[1]);
      e.band(R(19.6,14,3,2.6),[S[0],S[1],S[3]],[1,1,1],'x',19.6,22.6); e.ell(21.1,14,1.5,0.6,S[0]);
      e.rect(19.4,17,0.8,6.6,'#ffffff');
      // seringa diagonal
      e.c.save(); e.c.translate(13.4,14.6); e.c.rotate(-0.78);
      e.band(R(-12.6,-3.4,1.6,6.8),[S[0],S[1],S[2],S[3]],[1,1,1,1],'y',-3.4,3.4);
      e.band(R(-11,-0.9,5.2,1.8),[S[1],S[2],S[3]],[1,1,1],'y',-0.9,0.9);
      e.band(R(-6.2,-4.6,1.4,9.2),[S[0],S[2],S[3]],[1,2,1],'y',-4.6,4.6);
      e.band(R(-4.8,-2.9,12.8,5.8),[GLASS[0],GLASS[1],GLASS[2],GLASS[3]],[1,1,2,1],'y',-2.9,2.9);
      e.band(R(-0.4,-2.3,8.4,4.6),[ADR[0],ADR[1],ADR[2],ADR[3],ADR[4]],[1,1.4,1.6,1.2,0.6],'y',-2.3,2.3);
      e.rect(-1.8,-2.5,1.4,5,RUB[2]); e.rect(-1.8,-2.5,1.4,0.8,RUB[0]);
      for(let k=0;k<5;k++) e.rect(0.4+k*1.6,-2.9,0.5,k%2?1:1.7,'#ffffff');
      e.rect(-4.4,1.6,12,0.6,GLASS[4]);
      e.rect(-4.4,-2.2,3.6,0.6,'#ffffff');
      e.band(R(8,-1.9,2,3.8),[ADR[1],ADR[2],ADR[3]],[1,1,1],'y',-1.9,1.9);
      e.band(R(10,-0.55,4.8,1.1),[S[0],S[2]],[1,1],'y',-0.55,0.55);
      e.c.restore();
      // gota na ponta
      e.ell(24.4,3.6,0.8,1.1,ADR[1]); e.rect(24.2,3,0.5,0.5,'#ffffff');
    },
    colete(e){
      const vest=[[6.6,3.4],[10.6,3.4],[14,12.2],[17.4,3.4],[21.4,3.4],[22,8.6],[24.6,11],[24.2,24.8],[3.8,24.8],[3.4,11],[6,8.6]];
      e.band(vest,[OLIVE[1],OLIVE[2],OLIVE[2],OLIVE[3],OLIVE[4],OLIVE[5]],[1,2,3,3,2,1],'y',3.4,24.8);
      e.within(vest,()=>{
        // banda de pneu com sulcos na barra
        e.rect(0,19.2,28,5.6,RUB[3]); e.rect(0,19.2,28,0.6,RUB[0]);
        for(let x=2;x<26;x+=2.8){ e.poly([[x,20.4],[x+1.4,21.8],[x,23.2],[x-0.8,23.2],[x+0.6,21.8],[x-0.8,20.4]],RUB[4]); e.rect(x+0.6,20.4,0.6,0.5,RUB[1]); }
        // ombreiras de pneu com sulcos
        e.band(R(5,3,6.4,4.6),[RUB[0],RUB[1],RUB[2],RUB[3]],[1,2,2,1],'y',3,7.6); e.band(R(16.6,3,6.4,4.6),[RUB[0],RUB[1],RUB[2],RUB[3]],[1,2,2,1],'y',3,7.6);
        for(let x=5.6;x<23;x+=1.8){ if(x>11.2&&x<16.4) continue; e.rect(x,4.2,0.8,2.6,RUB[4]); }
        e.rect(5,7.6,18,0.5,OLIVE[5]);
        // placa de aço (esq.) e de chapa enferrujada (dir.)
        const pl=[[4.6,10.8],[12,10.6],[12.6,17.8],[5,18.2]], pr=[[16,10.6],[23.4,10.8],[23,18.2],[15.4,17.8]];
        e.band(pl,[STEEL[0],STEEL[1],STEEL[2],STEEL[3]],[1,2,2,1],'y',10.6,18.2);
        e.band(pr,[RUST[0],RUST[1],RUST[2],RUST[3]],[1,2,2,1],'y',10.6,18.2);
        e.ln(4.6,10.8,12,10.6,0.6,'#ffffff'); e.ln(16,10.6,23.4,10.8,0.6,'#ffd0a0');
        e.ln(6.4,14,10,12.6,0.5,STEEL[3]); e.ln(7,16.4,9.4,15.4,0.5,STEEL[3]); e.ell(20.6,15.4,1.6,1,RUST[4]); e.ell(18,12.6,1,0.6,RUST[1]);
        [[5.6,11.6],[11.2,11.4],[11.6,17],[6,17.2],[17,11.4],[22.4,11.6],[22,17.2],[16.4,17]].forEach(([x,y])=>{ e.ell(x,y,0.6,0.6,STEEL[4]); e.rect(x-0.4,y-0.4,0.4,0.4,'#ffffff'); });
        // abertura com amarração de corda
        e.ln(14,12.2,14,25,0.8,OLIVE[5]);
        for(let y=13.4;y<19;y+=1.8){ e.ln(12.6,y,15.4,y+1.2,0.6,ROPE[1]); e.ln(15.4,y,12.6,y+1.2,0.6,ROPE[2]); }
        // costura grossa nas cavas
        for(let y=9.4;y<18;y+=1.6){ e.rect(3.8,y,0.6,0.8,OLIVE[0]); e.rect(23.6,y,0.6,0.8,OLIVE[4]); }
      });
      e.ln(10.6,3.4,14,12.2,0.7,OLIVE[0]); e.ln(6.6,3.4,10.6,3.4,0.6,RUB[0]);
      // fivela lateral
      e.rect(2.6,15.4,2.4,2.6,'#6a5028'); e.rect(3.2,16,1.2,1.4,HOLE); e.rect(2.6,15.4,2.4,0.6,'#c8a060');
    },
  };
  // pontos de especular (onde a estrelinha pulsa) em unidades cruas
  const SPEC={madeira:[11,7.2],sucata:[13,7],pano:[19,10.2],agua:[8.8,10],comida:[6.6,11.4],remedio:[8.6,9.6],pecas:[7,16],gasolina:[6.4,9.6],fragmento_lunar:[13.6,4.4],projeto:[8.6,11.4],chave:[5,6.4],
    chave_comum:[8,5.6],chave_medico:[8,5.6],chave_militar:[8,5.6],chave_raro:[8,5.6],kit_cura:[5,12],presente:[5.4,14.2],adrenalina:[9,16],colete:[7,4.2]};

  // ---- passe de luz: topo quente, base roxa, lado direito frio
  const hx=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
  const WARM=hx('#fff0c8'), COOL=hx('#3b2c63'), DEEP=hx('#1c1233'), SHINE=hx('#fffaf0'), OUT=hx(PIX.OUTLINE), RIMC=hx(RIM);
  const isOut=(d,i)=>d[i]===OUT[0]&&d[i+1]===OUT[1]&&d[i+2]===OUT[2];
  const mixc=(c,t,m)=>[c[0]+(t[0]-c[0])*m,c[1]+(t[1]-c[1])*m,c[2]+(t[2]-c[2])*m];
  function grade(cv,fi,K){
    const W=cv.width,H=cv.height,g=cv.getContext('2d'),im=g.getImageData(0,0,W,H),d=im.data;
    let y0=H,y1=0,x0=W,x1=0; for(let y=0;y<H;y++)for(let x=0;x<W;x++) if(d[(y*W+x)*4+3]>0){ if(y<y0)y0=y; if(y>y1)y1=y; if(x<x0)x0=x; if(x>x1)x1=x; }
    const hh=Math.max(1,y1-y0), ww=Math.max(1,x1-x0);
    const pos=2+fi*8.4; // faixa de brilho "/" correndo da esquerda pra direita
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){ const i=(y*W+x)*4; if(!d[i+3]||isOut(d,i)) continue;
      let c=[d[i],d[i+1],d[i+2]];
      const rim=c[0]===RIMC[0]&&c[1]===RIMC[1]&&c[2]===RIMC[2];
      if(!rim){
        const t=(y-y0)/hh, u=(x-x0)/ww, lum=(c[0]+c[1]+c[2])/765, wk=1-lum*0.55;
        if(t<0.12) c=mixc(c,WARM,0.2*wk); else if(t<0.25) c=mixc(c,WARM,0.1*wk); else if(t>0.92) c=mixc(c,DEEP,0.3); else if(t>0.8) c=mixc(c,COOL,0.2); else if(t>0.68) c=mixc(c,COOL,0.1);
        if(u>0.88) c=mixc(c,COOL,0.12);
      }
      const s=Math.abs((x+0.5)/K+(y+0.5)/K*0.7-pos);
      if(s<1.1) c=mixc(c,SHINE,0.55); else if(s<2.4) c=mixc(c,SHINE,0.22);
      d[i]=c[0]; d[i+1]=c[1]; d[i+2]=c[2]; }
    g.putImageData(im,0,0);
  }
  // aura (halo em faixas, pulsando) atrás do sprite
  function aura(cv,K,rad,cols){
    const W=cv.width,H=cv.height,g=cv.getContext('2d'),im=g.getImageData(0,0,W,H),d=im.data;
    const op=new Uint8Array(W*H); for(let i=0;i<W*H;i++) op[i]=d[i*4+3]>0?1:0;
    const Rp=Math.ceil(rad*K), cc=cols.map(([h,a])=>[...hx(h),a]);
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){ const i=y*W+x; if(op[i]) continue; let best=1e9;
      for(let dy=-Rp;dy<=Rp;dy++){ const yy=y+dy; if(yy<0||yy>=H) continue; for(let dx=-Rp;dx<=Rp;dx++){ const xx=x+dx; if(xx<0||xx>=W) continue; if(op[yy*W+xx]){ const q=dx*dx+dy*dy; if(q<best) best=q; } } }
      if(best===1e9) continue; const dist=Math.sqrt(best)/K/rad; const k=dist<0.5?0:dist<=1?1:-1; if(k<0) continue;
      const [r,gg,b,a]=cc[k]; d[i*4]=r; d[i*4+1]=gg; d[i*4+2]=b; d[i*4+3]=Math.round(a*255); }
    g.putImageData(im,0,0);
  }
  function star(g,K,x,y,r,c1,c2){
    const px=Math.max(1,Math.round(K)), X=Math.round(x*K), Y=Math.round(y*K), L=Math.round(r*K);
    g.fillStyle=c1; g.fillRect(X-L,Y,L*2+px,px); g.fillRect(X,Y-L,px,L*2+px); g.fillStyle=c2; g.fillRect(X,Y,px,px);
  }
  function dot(g,K,x,y,c){ const px=Math.max(1,Math.round(K)); g.fillStyle=c; g.fillRect(Math.round(x*K),Math.round(y*K),px,px); }

  const cache=PIX.cache();
  function frame(id,fi=0,step=5){
    if(!D[id]) id='sucata';
    fi=((fi%N)+N)%N;
    const K=PIX.getK(), key=id+'|'+fi+'|'+step+'@'+K; if(cache.has(key)) return cache.get(key);
    const S=Math.round(SIZE*K);
    const parts=[{draw:(c,u)=>{ const p=mkPen(c,u); p.id(); D[id](kit(c,u),fi); p.id(); }}];
    const cv=compose({FW:S,FH:S,GROUND:(GYU+4)*K,parts,M:{},step,rim:RIM});
    if(step>=5){
      grade(cv,fi,K);
      const g=cv.getContext('2d');
      if(id==='fragmento_lunar'){
        const r=[2.2,2.6,3,3.2,3,2.6][fi];
        aura(cv,K,r,[['#ff7a94',0.66],['#ff3a64',0.34]]);
        for(let k=0;k<4;k++){ const u=((fi+k*1.5)%N)/N, x=5+k*5.6+Math.sin(u*6.28+k)*1.4, y=20-u*17;
          if(k%2) star(g,K,x,y,u<0.5?1.4:0.8,'#ffc0d0','#ffffff'); else dot(g,K,x,y,u<0.6?'#ffe0e8':'#ff5a7a'); }
      }
      if(id==='chave'||id==='chave_raro'){ const tw=[[20,15],[9,4],[16,10],[22,22],[4,12],[13,6]]; const [x,y]=tw[fi], [x2,y2]=tw[(fi+3)%N]; star(g,K,x,y,1.6,'#fff2a8','#ffffff'); dot(g,K,x2,y2,'#fffbe0'); }
      const sz=[0,1,2,2.6,2,1][fi], sp=SPEC[id];
      if(sz>0) star(g,K,sp[0],sp[1],sz,'#fff2cc','#ffffff');
    }
    cache.set(key,cv); return cv;
  }
  function ANCHOR(id){ const K=PIX.getK(); return {ax:Math.round(AXU*K), gy:Math.round(GYU*K)}; }
  // KIT/RAMPS/star expostos pros ícones de golpe e de arma (mesmo acabamento)
  return {IDS,NOMES,frame,ANCHOR,N,SIZE,KIT:kit,RAMPS:{STEEL,RUST,CRY,GOLD,YEL,RED,WH,BARK,ROPE,SKIN:['#ffe0c0','#f4b088','#d0845a','#a0583a','#6a3424'],GRASS:['#e0ffc8','#9ae060','#5ab040','#337a2e','#1e4e22']},STAR:star};
})();

/* ===== shared/tween ===== */
/* TWEEN — fonte de arte (editável). Build: npm run art */
const TWEEN=(function(){
  const DISCRETE={inhand:1,mouth:1,brow:1,smear:1,flash:1,whistle:1,impact:1,spit:1,air:1};
  const ease=t=>t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2;           // ease-in-out quad
  function lerpVal(a,b,t,k){
    if(typeof a==='number' && typeof b==='number') return DISCRETE[k]?(t<0.5?a:b):a+(b-a)*t;
    if(a && b && typeof a==='object' && typeof b==='object'){ const o={}; for(const kk in a) o[kk]=lerpVal(a[kk],b[kk]!==undefined?b[kk]:a[kk],t,kk); return o; }
    return t<0.5?a:(b===undefined?a:b);
  }
  function lerpPose(a,b,t){ const o={}; for(const k in a) o[k]=lerpVal(a[k],b[k]!==undefined?b[k]:a[k],t,k); for(const k in b) if(!(k in o)) o[k]=b[k]; return o; }
  // F: factory com poseOf/ANIMS; fi: quadro atual; frac 0..1 dentro do quadro; loop: volta pro 0 no fim
  function poseAt(F,anim,fi,frac,loop){
    const A=F.ANIMS[anim]; if(!A) return F.poseOf(anim,fi);
    const n=A.n, j=fi+1<n?fi+1:(loop?0:fi);
    const a=F.poseOf(anim,fi); if(j===fi||frac<=0) return a;
    return lerpPose(a,F.poseOf(anim,j),ease(Math.min(1,frac)));
  }
  // valor de trilha por quadro (z, giro, squash) interpolado
  function track(arr,fi,frac,def){ if(!arr) return def; const a=arr[Math.min(fi,arr.length-1)], b=arr[Math.min(fi+1,arr.length-1)]; return a+(b-a)*ease(Math.min(1,frac)); }
  // cache LRU simples
  function lru(max){ const m=new Map(); return { get(k){ const v=m.get(k); if(v!==undefined){ m.delete(k); m.set(k,v); } return v; }, set(k,v){ m.set(k,v); if(m.size>max) m.delete(m.keys().next().value); }, size:()=>m.size }; }
  const Q=4; const quant=f=>Math.floor(f*Q)/Q;                   // 4 sub-quadros por quadro
  return {ease,lerpPose,poseAt,track,lru,quant,Q};
})();

/* ===== GORE: sangue em partículas pixel, decalques no chão e na parede ===== */

/* ===== shared/baton ===== */
/* BATON — fonte de arte (editável). Build: npm run art */
const BATON=(function(){
  const {P2}=PIX;
  const BLOOD=['#c8584a','#8a2a2a','#5a1820','#320c14'];
  const TIERS={
    comum:{nome:'Cassetete de borracha', rar:'Comum', cor:'#b9b0a0', len:27,
      M:{bat:['#5e5e6e','#2e2e3a','#1e1e28','#0e0e14'], grip:['#6a6470','#3c3842','#26222c','#121016'], tip:['#e8e8f0','#a4a4b4','#64647c','#3a3a4e'], cord:['#f0d470','#c89a30','#8a6418','#4a340a'], blood:BLOOD},
      stats:{dano:8, alcance:'curto', vel:'rápida', atordoa:'0,3 s no 3º golpe', extra:'—'},
      desc:'O cassetete de borracha que o Vigia nunca tirou da cinta. Fita isolante na empunhadura, 3 anéis, cordão de pulso amarelo e a ponta riscada de tanto bater em portão.'},
    incomum:{nome:'Cassetete com pregos', rar:'Incomum', cor:'#4fb06a', len:28,
      M:{bat:['#6a5a52','#3a2e2a','#261e1c','#120e0e'], grip:['#8ae0a0','#3e9a5a','#2a6a3e','#163a22'], tip:['#e8e8f0','#a4a4b4','#64647c','#3a3a4e'], cord:['#f0d470','#c89a30','#8a6418','#4a340a'], blood:BLOOD, nail:['#ffffff','#c0c0d0','#7a7a8e','#44445a']},
      stats:{dano:11, alcance:'curto', vel:'rápida', atordoa:'0,3 s no 3º golpe', extra:'Sangramento: +2 de dano por 2 s'},
      desc:'Mesma borracha, agora com pregos de obra cravados na ponta e fita verde de jardinagem no cabo. Feio, mas abre ferida.'},
    raro:{nome:'Bastão de alumínio', rar:'Raro', cor:'#4a8fe0', len:31,
      M:{bat:['#ffffff','#bcc6d8','#7a86a0','#424c66'], grip:['#8abcff','#3a7ad8','#24509a','#122a5a'], tip:['#ffffff','#dce0ec','#9aa2b8','#5a6078'], cord:['#ff9a8a','#e04a3a','#9a2a20','#5a140e'], blood:BLOOD},
      stats:{dano:14, alcance:'médio', vel:'média', atordoa:'0,6 s no 3º golpe', extra:'3º golpe empurra 2× mais longe'},
      desc:'Bastão retrátil de alumínio achado numa viatura abandonada. Mais comprido e mais pesado: o golpe final arremessa o zumbi.'},
    lunar:{nome:'Bastão da Lua de Sangue', rar:'Lunar', cor:'#c8323a', len:32,
      M:{bat:['#6a3a4e','#30182a','#1e0e1a','#0c060a'], grip:['#fff0a0','#f2c230','#a07a14','#5a420a'], tip:['#fff0a0','#f2c230','#a07a14','#5a420a'], cord:['#ff7a7a','#c8323a','#7a141c','#42080e'], blood:['#ff6a5a','#c8323a','#7a141c','#42080e'], rune:['#fff0e0','#ff5a3a','#c8323a','#7a141c']},
      stats:{dano:18, alcance:'médio', vel:'média', atordoa:'0,8 s no 3º golpe', extra:'Na Lua de Sangue: golpes queimam (+4) e o apito atordoa 1 s a mais'},
      desc:'Forjado com metal do farolete do molhe durante uma Lua de Sangue. Runas vermelhas que acendem no escuro, anéis e ponta dourados.'},
  };
  // desenha o bastão: base = punho (empunhadura), ang = direção em radianos (eixo +x do bastão)
  function draw(p,tier,base,ang,o={}){
    const T=TIERS[tier]||TIERS.comum, M=T.M, L=T.len;
    p.xf(ang,base.x,base.y);
    // cordão de pulso
    if(!o.noCord){ p.F(M.cord[1]); p.cap(P2(-6,0.8),P2(-8.6,4.4),1.3,1.3); p.cap(P2(-8.6,4.4),P2(-5,6.4),1.3,1.3); p.F(M.cord[2]); p.rect(-8.8,4.6,1.2,1.2); }
    // pomo
    p.F(M.tip[2]); p.ell(-6.2,0,2.9,2.9); p.F(M.tip[1]); p.ell(-6,-0.4,2.3,2.2); p.F(M.tip[0]); p.rect(-6.8,-1.8,1.4,0.9);
    // empunhadura
    p.F(M.grip[1]); p.cap(P2(-4.8,0),P2(5.2,0),5,5);
    p.F(M.grip[2]); for(let x=-3.8;x<5;x+=2.2) p.poly([[x,-2.5],[x+1,-2.5],[x+0.2,2.5],[x-0.8,2.5]]);
    p.F(M.grip[0]); p.rect(-4,-2.2,8.6,0.8);
    // virola
    p.F(M.tip[1]); p.rect(5.6,-3,2,6); p.F(M.tip[0]); p.rect(5.8,-3,1.6,0.9); p.F(M.tip[2]); p.rect(5.6,1.8,2,1.2);
    if(tier==='raro'){
      // seções telescópicas
      p.F(M.bat[1]); p.cap(P2(7.6,0),P2(17,0),4.8,4.8); p.cap(P2(17,0),P2(25,0),4.1,4.1); p.cap(P2(25,0),P2(L,0),3.5,3.3);
      p.F(M.bat[2]); p.rect(8,1,9,1.2); p.rect(17,0.8,8,1.1); p.rect(25,0.7,L-25,1);
      p.F(M.bat[0]); p.rect(8.4,-1.8,8,1); p.rect(17.6,-1.6,6.4,0.9); p.rect(25.4,-1.4,L-27,0.8);
      p.F(M.tip[2]); p.rect(16.4,-2.6,1.2,5.2); p.rect(24.4,-2.2,1.1,4.4);
      p.F(M.grip[1]); p.rect(11,-2.4,1,4.8);
    } else {
      p.F(M.bat[1]); p.cap(P2(7.6,0),P2(L,0),4.6,4.1);
      p.F(M.bat[2]); p.poly([[8,1],[L,0.7],[L,2],[8,2.3]]);
      p.F(M.bat[0]); p.rect(8.6,-1.8,L-12,0.9); p.rect(10,-1.2,3,0.7);
      if(tier==='comum'){ p.F(M.tip[1]); [[13,-0.8],[18,0.4],[21,-0.6]].forEach(([x,y])=>p.rect(x,y,1.8,0.7)); p.F(M.bat[3]); p.rect(9.6,-2.2,0.9,4.4); p.rect(11.4,-2.2,0.9,4.4); }
      if(tier==='incomum'){
        p.F(M.bat[3]); [12,16.5].forEach(x=>p.rect(x,-2.2,0.8,4.4));
        p.F(M.nail[2]); [[15,-1],[18,1],[21,-1],[23.5,1],[26,-1]].forEach(([x,s])=>p.poly([[x-0.9,s*1.6],[x+0.9,s*1.6],[x+0.3,s*5.2],[x-0.1,s*5.4]]));
        p.F(M.nail[0]); [[15,-1],[18,1],[21,-1],[23.5,1],[26,-1]].forEach(([x,s])=>p.rect(x-1.2,s>0?1.2:-2.1,2.4,0.9));
        p.F(M.blood[1]); p.rect(20,-2.2,2.4,1.4); p.rect(24.6,0.4,2.6,1.8); p.F(M.blood[2]); p.rect(22,1,1.4,2.4);
      }
      if(tier==='lunar'){
        p.F(M.tip[1]); p.rect(12.6,-2.4,1.2,4.8); p.rect(L-6.6,-2.4,1.6,4.8);
        p.F(M.rune[1]); [[15,0],[18.4,-0.5],[21.8,0.3]].forEach(([x,y])=>{ p.rect(x,y-1.1,0.9,2.2); p.rect(x+0.9,y-0.2,1.1,0.8); p.rect(x+1.8,y-1.1,0.8,1); });
        p.F(M.rune[0]); [[15.2,-0.6],[18.6,-1.1],[22,-0.3]].forEach(([x,y])=>p.rect(x,y,0.6,0.6));
        p.F(M.tip[2]); [[16,-2.6],[20,2.6],[24,-2.6]].forEach(([x,s])=>p.poly([[x-0.8,s*0.6],[x+0.8,s*0.6],[x+0.2,s*1.6]]));
      }
    }
    // ponteira
    if(tier==='lunar'){ p.F(M.tip[1]); p.ell(L,0,2.8,2.6); p.F(M.tip[0]); p.ell(L+0.6,-0.8,1.2,1); p.F(M.rune[1]); p.ell(L-0.6,0.6,1,1); }
    else { p.F(M.tip[2]); p.ell(L,0,2.5,2.3); p.F(M.tip[1]); p.ell(L+0.2,-0.4,1.9,1.6); p.F(M.tip[0]); p.rect(L-0.4,-1.6,1.2,0.8); }
    if(tier==='comum'||tier==='raro'){ p.F(M.blood[1]); p.rect(L-5,0.6,2.6,1.3); p.rect(L-2,-1.4,1.2,1.1); p.F(M.blood[2]); p.rect(L-4,1.6,1,1.2); }
    p.id();
  }
  return {TIERS,draw};
})();

/* ===== shared/strikes ===== */
/* STRIKES — fonte de arte (editável). Build: npm run art */
/* Biblioteca de golpes avulsos pro rig humano (HEROI, VIGIA, RECRUTA_BASE, AGRI, ENFE...): todos usam os mesmos
   parâmetros de pose (aFs/aFe/bA = braço da frente e ferramenta em graus absolutos, 0 = pra baixo, 90 = pra frente,
   180 = pra cima; tw = torção do tronco; smear/sa = rastro e ângulo onde o arco começa; impact = estrela no impacto).
   Cada golpe é um ataque único (antecipação → rastro → impacto → recuperação), no padrão Cosmic Invasion:
   antecipação segura, 1 quadro de rastro largo, impacto com o corpo esticado e recuperação curta.
   Campos de evento lidos pelo motor (src/expedition/fighter.ts):
     atk  = peso na escolha do combo automático · fin = finalizador ('knock' derruba, 'launch' lança pro alto)
     hits/hitsx = quadro do dano e dados (m = multiplicador, reach = alcance em px, heavy, knock, launch)
     move = deslocamento (px/s) por quadro durante o golpe */
const STRIKES=(function(){
  /* G = combinador da pose de guarda do personagem (alarga a base e converte bA); o = opções:
     two (ferramenta de duas mãos), slow (multiplica durações), names (nomes por golpe), add (campos extras por golpe) */
  function tool(G,o){
    o=o||{}; const sl=o.slow||1, N=o.names||{}, AD=o.add||{}, T=o.two?{two:1}:{};
    const D=a=>i=>Math.round(a[i]*sl);
    const P=(k,arr)=>i=>G(Object.assign({},T,AD[k]||{},arr[i]));
    return {
      // golpe horizontal: puxa o braço pra trás com a ferramenta em pé e varre na altura do peito
      atkH:{nome:N.atkH||'Golpe horizontal',n:8,atk:3,hits:{3:1},hitsx:{3:{m:1.1,reach:46}},move:[0,-20,60,40,0,0,0,0],
        dur:D([90,80,40,50,110,80,80,110]),pose:P('atkH',[
        {tw:-0.4,aFs:10,aFe:-20,bA:190,lean:-4,hx:-2,head:-2,aBs:50,aBe:110,lFh:30,lFk:4,lBh:-22,lBk:-32,brow:1},
        {tw:-0.8,aFs:-26,aFe:-54,bA:204,lean:-12,hx:-5,head:-4,aBs:66,aBe:120,lFh:26,lFk:2,lBh:-24,lBk:-34,brow:1,mouth:1},
        {tw:0.5,aFs:60,aFe:80,bA:150,lean:14,hx:6,head:-8,smear:1,sa:206,aBs:0,aBe:40,lFh:44,lFk:8,lBh:-30,lBk:-36,mouth:2},
        {tw:1,aFs:88,aFe:92,bA:94,lean:30,hx:14,head:-12,smear:3,sa:196,impact:1,aBs:-50,aBe:-20,lFh:54,lFk:12,lBh:-32,lBk:-36,mouth:2,brow:1},
        {tw:1,aFs:70,aFe:40,bA:30,lean:30,hx:14,head:-10,aBs:-56,aBe:-24,lFh:54,lFk:12,lBh:-32,lBk:-36,mouth:1},
        {tw:0.6,aFs:44,aFe:30,bA:10,lean:22,hx:11,aBs:-30,aBe:10,lFh:48,lFk:10,lBh:-30,lBk:-36},
        {tw:0.2,aFs:50,aFe:70,bA:90,lean:14,hx:6,aBs:20,aBe:80,lFh:40,lFk:6,lBh:-28,lBk:-38},
        {}])},
      // golpe por cima: sobe na ponta do pé (estica), rastro vertical e esmaga no chão (achata) — finalizador que derruba
      atkV:{nome:N.atkV||'Golpe por cima',n:9,atk:2,fin:'knock',hits:{4:1},hitsx:{4:{m:1.6,heavy:1,knock:1,reach:44}},move:[0,0,0,50,30,0,0,0,0],
        dur:D([90,90,110,40,60,140,100,90,110]),pose:P('atkV',[
        {aFs:120,aFe:150,bA:180,lean:-4,head:-4,lFh:34,lFk:0,lBh:-22,lBk:-36,aBs:100,aBe:140,brow:1},
        {aFs:166,aFe:200,bA:232,lean:-14,hx:3,head:-8,lift:3,plant:0,lFh:46,lFk:-14,lBh:-8,lBk:-56,aBs:150,aBe:170,brow:1,mouth:1},
        {aFs:176,aFe:212,bA:248,lean:-18,hx:5,head:-10,lift:9,plant:0,lFh:62,lFk:-8,lBh:14,lBk:-56,aBs:160,aBe:182,brow:1,mouth:1},
        {aFs:150,aFe:160,bA:170,lean:6,hx:9,head:-10,lift:5,plant:0,smear:2,sa:248,lFh:56,lFk:0,lBh:-10,lBk:-50,aBs:100,aBe:120,mouth:2},
        {tw:0.9,aFs:72,aFe:54,bA:16,lean:40,hx:15,head:-14,smear:3,sa:244,impact:2,aBs:-50,aBe:-20,lFh:58,lFk:14,lBh:-34,lBk:-36,mouth:2,brow:1},
        {tw:0.8,aFs:66,aFe:48,bA:14,lean:42,hx:15,head:-12,aBs:-50,aBe:-20,lFh:60,lFk:16,lBh:-34,lBk:-36,mouth:1},
        {tw:0.4,aFs:50,aFe:50,bA:40,lean:30,hx:12,aBs:-10,aBe:30,lFh:52,lFk:12,lBh:-32,lBk:-36},
        {aFs:56,aFe:76,bA:100,lean:18,hx:6,aBs:30,aBe:90,lFh:40,lFk:6,lBh:-28,lBk:-38},
        {}])},
      // estocada: recolhe o braço (antecipação pra trás) e espeta com o corpo todo esticado em avanço
      atkS:{nome:N.atkS||'Estocada',n:7,atk:3,hits:{3:1},hitsx:{3:{m:1.2,reach:58}},move:[0,-30,150,70,0,-20,-20],
        dur:D([90,110,40,70,120,90,110]),pose:P('atkS',[
        {aFs:20,aFe:80,bA:92,lean:-6,hx:-4,head:-2,aBs:40,aBe:100,lFh:30,lFk:4,lBh:-24,lBk:-36,brow:1},
        {tw:-0.5,aFs:-24,aFe:84,bA:94,lean:-12,hx:-7,head:-4,aBs:50,aBe:110,lFh:28,lFk:2,lBh:-26,lBk:-38,brow:1,mouth:1},
        {tw:0.6,aFs:70,aFe:90,bA:92,lean:18,hx:8,head:-8,smear:1,sa:100,aBs:-20,aBe:20,lFh:52,lFk:10,lBh:-34,lBk:-42,mouth:2},
        {tw:1,aFs:94,aFe:92,bA:91,lean:32,hx:20,head:-12,impact:1,aBs:-60,aBe:-40,lFh:66,lFk:14,lBh:-40,lBk:-44,mouth:2,brow:1},
        {tw:1,aFs:92,aFe:92,bA:92,lean:30,hx:20,head:-10,aBs:-60,aBe:-40,lFh:66,lFk:14,lBh:-40,lBk:-44,mouth:1},
        {tw:0.4,aFs:70,aFe:88,bA:110,lean:20,hx:12,aBs:0,aBe:60,lFh:52,lFk:10,lBh:-32,lBk:-40},
        {}])},
      // giro: varre na frente, deixa a ferramenta passar por baixo e por trás com um pulinho e desce de novo (2 acertos)
      atkSpin:{nome:N.atkSpin||'Giro',n:10,atk:2,hits:{2:1,6:2},hitsx:{2:{m:0.8,reach:46},6:{m:1.2,heavy:1,reach:48}},move:[0,30,40,30,50,40,20,0,0,0],
        dur:D([90,40,60,60,70,50,60,120,90,110]),pose:P('atkSpin',[
        {tw:-0.8,aFs:-30,aFe:-60,bA:210,lean:-10,hx:-4,head:-4,aBs:60,aBe:120,lFh:28,lFk:2,lBh:-24,lBk:-34,brow:1,mouth:1},
        {tw:0.4,aFs:60,aFe:80,bA:150,lean:12,hx:4,smear:1,sa:210,aBs:0,aBe:40,lFh:44,lFk:8,lBh:-30,lBk:-36,mouth:2},
        {tw:1,aFs:90,aFe:90,bA:88,lean:26,hx:12,head:-10,smear:3,sa:186,impact:1,aBs:-50,aBe:-20,lFh:52,lFk:10,lBh:-32,lBk:-36,mouth:2},
        {tw:1,aFs:60,aFe:20,bA:-20,lean:20,hx:12,head:-8,smear:2,sa:90,aBs:-40,aBe:0,lFh:46,lFk:8,lBh:-30,lBk:-36,lift:2,plant:0},
        {tw:-1,aFs:-40,aFe:-80,bA:-110,lean:4,hx:10,head:-4,lift:8,plant:0,aBs:40,aBe:100,lFh:60,lFk:-10,lBh:10,lBk:-50,mouth:1,brow:1},
        {tw:-0.4,aFs:120,aFe:160,bA:220,lean:-10,hx:12,head:-8,lift:10,plant:0,aBs:120,aBe:160,lFh:60,lFk:-10,lBh:10,lBk:-50,mouth:2,brow:1},
        {tw:0.9,aFs:78,aFe:62,bA:30,lean:38,hx:16,head:-14,smear:3,sa:236,impact:2,aBs:-60,aBe:-30,lFh:56,lFk:12,lBh:-32,lBk:-36,mouth:2,brow:1},
        {tw:0.8,aFs:70,aFe:54,bA:24,lean:36,hx:16,head:-12,aBs:-50,aBe:-20,lFh:56,lFk:12,lBh:-32,lBk:-36,mouth:1},
        {tw:0.3,aFs:56,aFe:74,bA:96,lean:20,hx:8,aBs:20,aBe:80,lFh:42,lFk:6,lBh:-28,lBk:-38},
        {}])},
      // finalizador que lança: agacha fundo (achata), sobe num arco de baixo pra cima e termina esticado no ar
      atkFin:{nome:N.atkFin||'Finalizador (lança)',n:9,atk:2,fin:'launch',hits:{3:1},hitsx:{3:{m:1.5,launch:1,reach:44}},move:[0,0,60,40,0,0,0,0,0],
        dur:D([100,120,40,60,120,100,90,90,110]),pose:P('atkFin',[
        {aFs:10,aFe:-10,bA:-30,lean:20,hx:-2,head:-4,aBs:30,aBe:80,lFh:60,lFk:-10,lBh:-20,lBk:-70,brow:1},
        {tw:-0.6,aFs:-30,aFe:-40,bA:-60,lean:32,hx:-4,head:-8,aBs:40,aBe:90,lFh:80,lFk:-14,lBh:-10,lBk:-90,brow:1,mouth:1},
        {tw:0.2,aFs:30,aFe:20,bA:20,lean:24,hx:4,head:-10,smear:1,sa:-60,aBs:10,aBe:60,lFh:70,lFk:-6,lBh:-16,lBk:-80,mouth:2},
        {tw:0.9,aFs:110,aFe:130,bA:150,lean:-6,hx:10,head:-16,smear:3,sa:-40,impact:2,lift:6,plant:0,aBs:-40,aBe:-10,lFh:40,lFk:-6,lBh:-6,lBk:-40,mouth:2,brow:1},
        {tw:1,aFs:160,aFe:176,bA:196,lean:-16,hx:12,head:-18,lift:14,plant:0,aBs:-60,aBe:-30,lFh:30,lFk:-20,lBh:0,lBk:-30,mouth:2},
        {tw:0.8,aFs:156,aFe:172,bA:190,lean:-12,hx:12,head:-14,lift:8,plant:0,aBs:-50,aBe:-20,lFh:40,lFk:-14,lBh:-10,lBk:-40,mouth:1},
        {tw:0.4,aFs:110,aFe:140,bA:160,lean:0,hx:8,aBs:10,aBe:60,lFh:44,lFk:6,lBh:-26,lBk:-38},
        {aFs:80,aFe:96,bA:130,lean:8,hx:4,lFh:40,lFk:6,lBh:-28,lBk:-38},
        {}])},
    };
  }

  return {tool};
})();

/* ===== shared/moveset ===== */
/* MOVESET — fonte de arte (editável). Build: npm run art */
/* Kit de beat 'em up completo pro rig humano (HEROI, VIGIA, RECRUTA_BASE, AGRI, ENFE, CAPO), no padrão Marvel
   Cosmic Invasion: antecipação segura → 1 quadro de rastro largo → impacto com o corpo esticado → recuperação curta.
   Mesmos parâmetros de pose da STRIKES (ângulos absolutos: 0 = pra baixo, 90 = pra frente, 180 = pra cima;
   bA = ferramenta; kick:'F'/'B' = rastro e estrela no pé em vez da ferramenta).
   Campos lidos pelo motor (src/expedition/moveset.ts):
     kind  = papel do golpe pro auto-combate (dash, jump, dive, launcher, juggle, grab, throw, area, dodge, react, taunt, sig)
     z     = altura (px lógicos) por quadro — pulo de verdade no mundo (sombra fica no chão)
     move  = deslocamento pra frente (px/s) por quadro
     hitsx = quadro → dados do golpe: m, reach, heavy, knock, launch, air (pega no ar), juggle (mantém no ar),
             spike (crava no chão), both (frente e costas), around (raio em volta), held (só no agarrado),
             fling (vira projétil), stun (s), wave (onda no chão), pull (puxa pro lado do lutador)
     grab  = quadro em que o agarrão fecha · hold = [dx, z] do agarrado por quadro · release/toss = arremesso
     kf    = só poses-chave (sem sub-quadros de tween no Vigia: menos quadros a gerar, mais "estalado")
     sig   = peso do golpe assinatura · cd = recarga (s) · fam = só com essa família de arma */
const MOVESET=(function(){
  const rad=d=>d*Math.PI/180;
  // base de luta larga (o mesmo que o G dos rigs faz) aplicada aqui, pra todo rig ficar igual (CAPO não alarga)
  function W(o){ const r=Object.assign({},o); if(!r.nowide){ if(r.lFh!==undefined){ r.lFh+=14; r.lFk=(r.lFk||0)+3; } if(r.lBh!==undefined){ r.lBh-=12; r.lBk=(r.lBk!==undefined?r.lBk:-30)-10; } } r.nowide=1; return r; }
  const A=(G,T,arr,sl)=>({pose:i=>G(Object.assign({},T,W(arr[i]))),durs:sl});

  /* ---------- rastro/estrela no pé (chutes) ---------- */
  function kickTip(sk,P){ const B=P.kick==='B', an=B?sk.ankleB:sk.ankleF, kn=B?sk.kneeB:sk.kneeF, d=Math.hypot(an.x-kn.x,an.y-kn.y)||1; return {x:an.x+(an.x-kn.x)/d*8,y:an.y+(an.y-kn.y)/d*8}; }
  function kickPiv(sk,P){ return P.kick==='B'?sk.hipB:sk.hipF; }
  function smearArc(p,M,piv,tip,sa,wide){
    p.id(); const cur=Math.atan2(tip.x-piv.x,tip.y-piv.y)*180/Math.PI, r1=Math.hypot(tip.x-piv.x,tip.y-piv.y)+3, n=14;
    let a0=sa; while(a0-cur>180) a0-=360; while(cur-a0>180) a0+=360;
    const bd=(rr0,rr1,col)=>{ const pts=[]; for(let k=0;k<=n;k++){ const a=a0+(cur-a0)*k/n; pts.push([piv.x+Math.sin(rad(a))*rr1, piv.y+Math.cos(rad(a))*rr1]); }
      for(let k=n;k>=0;k--){ const a=a0+(cur-a0)*k/n, t=k/n, rr=rr1-(rr1-rr0)*t*t; pts.push([piv.x+Math.sin(rad(a))*rr, piv.y+Math.cos(rad(a))*rr]); } p.F(col); p.poly(pts); };
    bd(r1-wide,r1+1.6,(M.trail||M.smear)[1]); bd(r1-wide+3,r1,M.smear[1]); bd(r1-5,r1-0.6,M.smear[0]);
  }
  function kickSmear(p,M,sk,P){ smearArc(p,M,kickPiv(sk,P),kickTip(sk,P),P.sa,P.smear>=2.5?22:15); }

  /* ---------- kit comum ---------- */
  // o: two (ferramenta de duas mãos), slow (multiplica durações), names, unarmed, skip (anims que o rig já tem)
  function kit(G,o){
    o=o||{}; const sl=o.slow||1, N=o.names||{}, T=o.two?{two:1}:{}, T0={two:0};
    const D=a=>i=>Math.round(a[i]*sl);
    const out={
      // abertura/volta (qualquer recruta): ajoelha na frente da fogueira, risca o fósforo, aproxima a chama, sopra e levanta (match: 1 palito, 2 chama, 3 chama alta)
      acender:{nome:'Acender a fogueira',n:10,dur:i=>[110,110,160,140,90,130,130,200,120,140][i],pose:i=>{ const KN={lFh:90,lFk:-14,lBh:6,lBk:-96,plant:1,inhand:0};
      return ([
        {lean:12,head:4,hx:2,lFh:40,lFk:-4,lBh:-12,lBk:-40,aFs:16,aFe:40,aBs:-6,aBe:20,inhand:0},
        {lean:20,head:8,hx:5,lFh:70,lFk:-10,lBh:-2,lBk:-70,aFs:26,aFe:56,aBs:10,aBe:40,inhand:0},
        Object.assign({},KN,{lean:24,head:10,hx:8,aFs:36,aFe:66,aBs:24,aBe:60}),
        Object.assign({},KN,{lean:22,head:12,hx:8,aFs:6,aFe:96,aBs:38,aBe:84,match:1,brow:1}),
        Object.assign({},KN,{lean:26,head:12,hx:9,aFs:46,aFe:40,aBs:36,aBe:82,match:3,brow:1}),
        Object.assign({},KN,{lean:30,head:14,hx:10,aFs:40,aFe:50,aBs:30,aBe:70,match:2}),
        Object.assign({},KN,{lean:31,head:14,hx:10,aFs:42,aFe:56,aBs:30,aBe:70,match:3}),
        Object.assign({},KN,{lean:34,head:16,hx:11,aFs:34,aFe:48,aBs:26,aBe:64,mouth:1,blink:1}),
        {lean:18,head:4,hx:5,lFh:66,lFk:-8,lBh:-4,lBk:-66,aFs:24,aFe:50,aBs:6,aBe:36,inhand:0,mouth:3,brow:3},
        {lean:6,head:0,hx:2,lFh:30,lFk:2,lBh:-22,lBk:-26,aFs:12,aFe:38,aBs:-10,aBe:20,mouth:3,brow:3}][i]); }},
      // chute frontal (push kick): entra no combo como golpe comum; as armas de fogo usam de perto
      atkK:{nome:N.atkK||'Chute frontal',n:7,kf:1,atk:2,gunMelee:2,hits:{3:1},hitsx:{3:{m:1.1,reach:52}},move:[0,10,50,30,0,0,0],
        dur:D([80,90,40,110,90,80,100]),pose:i=>G(Object.assign({},T,W([
        {lean:4,hx:-2,lFh:40,lFk:6,lBh:-36,lBk:-44,aFs:60,aFe:96,bA:132,aBs:40,aBe:100,brow:1},
        {nowide:1,lean:-6,hx:-2,plant:0,lFh:98,lFk:6,lBh:-16,lBk:-28,aFs:50,aFe:104,bA:140,aBs:30,aBe:90,mouth:1,brow:1},
        {nowide:1,lean:-16,hx:2,plant:0,lFh:96,lFk:66,kick:'F',smear:1,sa:20,lBh:-14,lBk:-24,aFs:36,aFe:84,bA:126,aBs:22,aBe:70,mouth:2,brow:1},
        {nowide:1,lean:-22,hx:7,plant:0,lFh:92,lFk:94,kick:'F',smear:3,sa:24,impact:2,lBh:-12,lBk:-22,aFs:28,aFe:72,bA:120,aBs:18,aBe:60,mouth:2,brow:1},
        {nowide:1,lean:-20,hx:7,plant:0,lFh:90,lFk:90,kick:'F',lBh:-12,lBk:-22,aFs:30,aFe:74,bA:120,aBs:20,aBe:62,mouth:1,brow:1},
        {nowide:1,lean:-4,hx:3,plant:0,lFh:88,lFk:10,lBh:-16,lBk:-28,aFs:50,aFe:90,bA:128,aBs:30,aBe:90},
        {}][i])))},
      // investida correndo: 3 passadas de corrida com a ferramenta armada atrás, planta o pé e varre (derruba)
      dash:{nome:N.dash||'Investida correndo',n:7,kf:1,kind:'dash',hits:{4:1},hitsx:{4:{m:1.45,heavy:1,knock:1,reach:54}},move:[130,210,220,190,90,10,0],
        dur:D([70,70,70,50,110,90,110]),pose:i=>G(Object.assign({},T,W([
        {nowide:1,plant:0,lean:24,head:-10,lFh:58,lFk:-8,lBh:-30,lBk:-82,aFs:-24,aFe:16,bA:200,aBs:60,aBe:110,brow:1,mouth:1},
        {nowide:1,plant:0,lean:26,head:-10,lift:3,lFh:-18,lFk:-70,lBh:52,lBk:-6,aFs:-30,aFe:6,bA:212,aBs:70,aBe:120,brow:1,mouth:1},
        {nowide:1,lean:20,hx:2,tw:-0.6,lFh:66,lFk:12,lBh:-42,lBk:-60,aFs:-42,aFe:-52,bA:222,aBs:60,aBe:100,brow:1,mouth:1},
        {nowide:1,tw:0.6,lean:28,hx:10,lFh:72,lFk:14,lBh:-46,lBk:-52,aFs:70,aFe:84,bA:140,smear:2,sa:222,aBs:-20,aBe:20,mouth:2,brow:1},
        {nowide:1,tw:1,lean:34,hx:16,head:-12,lFh:76,lFk:16,lBh:-50,lBk:-54,aFs:90,aFe:92,bA:80,smear:3,sa:214,impact:2,aBs:-50,aBe:-20,mouth:2,brow:1},
        {nowide:1,tw:0.8,lean:30,hx:14,lFh:72,lFk:14,lBh:-48,lBk:-54,aFs:60,aFe:40,bA:20,aBs:-40,aBe:-10,mouth:1},
        {}][i])))},
      // chute voador: agacha, decola, encolhe no alto e estica a perna da frente descendo (derruba)
      jumpKick:{nome:N.jumpKick||'Chute voador',n:8,kf:1,kind:'jump',z:[0,6,22,30,26,14,2,0],squash:[0.9,1.06,1,1,1,1,0.88,1],move:[0,90,120,120,120,70,10,0],
        hits:{4:1},hitsx:{4:{m:1.35,heavy:1,air:1,knock:1,reach:54}},dur:D([90,70,90,80,60,110,90,110]),pose:i=>G(Object.assign({},T,W([
        {lean:18,head:-4,lFh:60,lFk:-30,lBh:-10,lBk:-70,aFs:30,aFe:60,bA:140,aBs:20,aBe:60,brow:1},
        {nowide:1,plant:0,lean:4,head:-8,lFh:30,lFk:-20,lBh:-30,lBk:-40,aFs:100,aFe:140,bA:170,aBs:80,aBe:130,mouth:1},
        {nowide:1,plant:0,lean:-2,lFh:100,lFk:10,lBh:60,lBk:-30,aFs:70,aFe:120,bA:160,aBs:40,aBe:100,brow:1,mouth:1},
        {nowide:1,plant:0,lean:-10,lFh:112,lFk:20,lBh:40,lBk:-50,aFs:40,aFe:90,bA:150,aBs:20,aBe:80,brow:1},
        {nowide:1,plant:0,lean:-24,hx:4,lFh:82,lFk:86,kick:'F',smear:3,sa:10,impact:2,lBh:10,lBk:-60,aFs:-10,aFe:40,bA:124,aBs:-30,aBe:10,mouth:2,brow:1},
        {nowide:1,plant:0,lean:-20,hx:4,lFh:78,lFk:82,kick:'F',lBh:20,lBk:-50,aFs:0,aFe:50,bA:130,aBs:-20,aBe:20,mouth:1,brow:1},
        {lean:20,head:-2,lFh:60,lFk:-20,lBh:-10,lBk:-70,aFs:40,aFe:80,bA:130,aBs:20,aBe:70,mouth:1},
        {}][i])))},
      // mergulho: pula alto com a ferramenta acima da cabeça e crava no chão (área em volta, derruba)
      dive:{nome:N.dive||'Mergulho (golpe de cima)',n:8,kf:1,kind:'dive',z:[0,10,34,44,30,6,0,0],squash:[0.86,1.08,1,1,1.02,0.84,0.94,1],move:[0,80,90,80,60,30,0,0],
        hits:{5:1},hitsx:{5:{m:1.8,heavy:1,knock:1,around:48,reach:44,slam:1}},dur:D([100,70,100,110,60,50,180,120]),pose:i=>G(Object.assign({},T,W([
        {lean:26,head:-6,lFh:70,lFk:-30,lBh:-6,lBk:-80,aFs:-30,aFe:-20,bA:200,aBs:-20,aBe:10,brow:1},
        {nowide:1,plant:0,lean:-8,head:-12,lFh:20,lFk:-10,lBh:-20,lBk:-30,aFs:150,aFe:170,bA:200,aBs:140,aBe:170,mouth:1,brow:1},
        {nowide:1,plant:0,lean:-14,head:-10,lFh:90,lFk:0,lBh:50,lBk:-40,aFs:170,aFe:200,bA:240,aBs:160,aBe:190,mouth:1,brow:1},
        {nowide:1,plant:0,lean:-18,lFh:100,lFk:10,lBh:60,lBk:-30,aFs:176,aFe:210,bA:250,aBs:166,aBe:196,mouth:2,brow:1},
        {nowide:1,plant:0,tw:0.6,lean:20,hx:6,lFh:70,lFk:-10,lBh:10,lBk:-50,aFs:100,aFe:110,bA:120,smear:2,sa:250,mouth:2,brow:1},
        {nowide:1,tw:1,lean:44,hx:14,head:-14,lFh:84,lFk:-18,lBh:-10,lBk:-100,aFs:66,aFe:44,bA:10,smear:3,sa:240,impact:2,aBs:-40,aBe:-10,mouth:2,brow:1},
        {nowide:1,tw:0.9,lean:42,hx:14,head:-12,lFh:84,lFk:-18,lBh:-10,lBk:-100,aFs:64,aFe:42,bA:12,impact:1,aBs:-40,aBe:-10,mouth:1,brow:1},
        {}][i])))},
      // lançador: agacha, ferramenta de baixo pra cima, sobe junto (joga o zumbi pro alto pro juggle)
      launcher:{nome:N.launcher||'Lançador',n:6,kf:1,kind:'launcher',hits:{2:1},hitsx:{2:{m:1.1,launch:1,reach:46}},move:[0,30,40,0,0,0],
        dur:D([110,50,60,110,110,120]),pose:i=>G(Object.assign({},T,W([
        {lean:22,head:4,hx:-2,lFh:34,lFk:-24,lBh:-6,lBk:-40,aFs:-10,aFe:-30,bA:-150,aBs:10,aBe:40,brow:1},
        {lean:14,aFs:20,aFe:10,bA:-50,lFh:30,lFk:-10,lBh:-10,lBk:-30,aBs:0,aBe:30,smear:1,sa:-150,mouth:1},
        {nowide:1,lean:-10,head:-12,hx:4,lift:4,plant:0,aFs:140,aFe:170,bA:180,smear:3,sa:-60,impact:2,lFh:24,lFk:2,lBh:-32,lBk:-36,aBs:-30,aBe:0,mouth:2,brow:1},
        {nowide:1,lean:-14,lift:2,plant:0,aFs:160,aFe:185,bA:195,lFh:20,lFk:2,lBh:-34,lBk:-38,aBs:-30,aBe:0,mouth:1},
        {lean:-4,aFs:100,aFe:120,bA:150},
        {}][i])))},
      // juggle aéreo: sobe atrás do zumbi lançado, 2 golpes que seguram ele no ar e crava pra baixo
      airCombo:{nome:N.airCombo||'Combo aéreo (juggle)',n:9,kf:1,kind:'juggle',z:[4,24,38,42,42,40,30,8,0],squash:[0.9,1.05,1,1,1,1,1,0.86,1],move:[40,60,40,20,20,20,10,0,0],
        hits:{3:1,5:2,6:3},hitsx:{3:{m:0.8,air:1,juggle:1,reach:48},5:{m:0.9,air:1,juggle:1,reach:48},6:{m:1.4,heavy:1,air:1,spike:1,reach:50}},
        dur:D([70,80,60,70,60,70,90,120,110]),pose:i=>G(Object.assign({},T,W([
        {lean:16,lFh:56,lFk:-30,lBh:-10,lBk:-60,aFs:20,aFe:40,bA:-30,aBs:10,aBe:40,brow:1},
        {nowide:1,plant:0,lean:0,lFh:60,lFk:-10,lBh:-10,lBk:-40,aFs:20,aFe:0,bA:-60,aBs:60,aBe:120,mouth:1},
        {nowide:1,plant:0,lean:-12,lFh:90,lFk:10,lBh:30,lBk:-40,aFs:130,aFe:160,bA:170,smear:2,sa:-40,aBs:40,aBe:100,mouth:2},
        {nowide:1,plant:0,lean:-14,lFh:94,lFk:14,lBh:34,lBk:-40,aFs:150,aFe:174,bA:186,impact:1,aBs:30,aBe:90,mouth:2,brow:1},
        {nowide:1,plant:0,tw:-0.6,lean:-6,lFh:80,lFk:0,lBh:20,lBk:-50,aFs:-20,aFe:-40,bA:200,aBs:60,aBe:110,mouth:1},
        {nowide:1,plant:0,tw:1,lean:10,lFh:90,lFk:20,lBh:10,lBk:-50,aFs:90,aFe:92,bA:96,smear:3,sa:200,impact:1,aBs:-40,aBe:-10,mouth:2},
        {nowide:1,plant:0,tw:0.8,lean:30,lFh:70,lFk:-10,lBh:0,lBk:-60,aFs:60,aFe:40,bA:0,smear:3,sa:110,impact:2,aBs:-50,aBe:-20,mouth:2,brow:1},
        {lean:24,lFh:66,lFk:-20,lBh:-10,lBk:-70,aFs:50,aFe:40,bA:30,aBs:10,aBe:40,mouth:1},
        {}][i])))},
      // agarrão: avança, pega pela gola com as duas mãos, puxa e dá duas joelhadas (dano só no agarrado)
      grab:{nome:N.grab||'Agarrão + joelhadas',n:7,kf:1,kind:'grab',grab:2,hold:[[24,0],[20,0],[15,2],[14,7],[15,2],[14,8],[15,2]],move:[40,70,0,0,0,0,0],
        hits:{3:1,5:2},hitsx:{3:{m:0.6,held:1},5:{m:0.75,held:1}},dur:D([80,70,100,80,110,80,110]),pose:i=>G(Object.assign({},T0,W([
        {lean:16,hx:4,lFh:46,lFk:8,lBh:-34,lBk:-46,aFs:80,aFe:92,bA:150,aBs:80,aBe:96,mouth:1,brow:1},
        {lean:26,hx:10,lFh:56,lFk:12,lBh:-40,lBk:-48,aFs:94,aFe:100,bA:160,aBs:92,aBe:104,mouth:2,brow:1},
        {lean:10,hx:6,lFh:38,lFk:8,lBh:-30,lBk:-42,aFs:76,aFe:122,bA:170,aBs:70,aBe:118,mouth:1,brow:1},
        {nowide:1,lean:18,hx:8,lift:3,plant:0,lFh:112,lFk:12,kick:'F',smear:1,sa:30,impact:1,lBh:-16,lBk:-24,aFs:72,aFe:40,bA:150,aBs:66,aBe:36,mouth:2,brow:1},
        {lean:10,hx:6,lFh:38,lFk:8,lBh:-30,lBk:-42,aFs:76,aFe:122,bA:170,aBs:70,aBe:118,mouth:1,brow:1},
        {nowide:1,lean:20,hx:9,lift:4,plant:0,lFh:118,lFk:14,kick:'F',smear:2,sa:30,impact:2,lBh:-16,lBk:-24,aFs:72,aFe:36,bA:150,aBs:66,aBe:32,mouth:2,brow:1},
        {lean:10,hx:6,lFh:38,lFk:8,lBh:-30,lBk:-42,aFs:76,aFe:122,bA:170,aBs:70,aBe:118,mouth:1,brow:1}][i])))},
      // arremesso: agacha, gira o zumbi por cima do ombro e joga pra frente (em cima dos outros)
      throw:{nome:N.throw||'Arremesso',n:8,kf:1,kind:'throw',hold:[[15,2],[8,10],[-8,22],[-2,34],[14,30],[26,20],[30,16],[30,16]],release:5,toss:{vx:175,vz:125},
        dur:D([90,90,90,70,60,60,120,120]),pose:i=>G(Object.assign({},T0,W([
        {lean:6,hx:4,lFh:38,lFk:8,lBh:-30,lBk:-42,aFs:76,aFe:122,bA:170,aBs:70,aBe:118,brow:1},
        {lean:20,lFh:60,lFk:-20,lBh:-14,lBk:-76,aFs:60,aFe:150,bA:180,aBs:56,aBe:146,brow:1,mouth:1},
        {tw:-0.8,lean:-14,hx:-4,lFh:30,lFk:0,lBh:-22,lBk:-44,aFs:170,aFe:200,bA:220,aBs:160,aBe:196,mouth:2,brow:1},
        {nowide:1,tw:-0.3,lean:-20,hx:-2,lift:4,plant:0,lFh:40,lFk:-6,lBh:-40,lBk:-58,aFs:180,aFe:196,bA:200,aBs:176,aBe:192,mouth:2,brow:1},
        {nowide:1,tw:0.6,lean:20,hx:8,lFh:70,lFk:12,lBh:-48,lBk:-54,aFs:130,aFe:140,bA:150,aBs:126,aBe:136,smear:2,sa:210,mouth:2,brow:1},
        {nowide:1,tw:1,lean:36,hx:14,lFh:78,lFk:16,lBh:-52,lBk:-56,aFs:90,aFe:80,bA:110,aBs:86,aBe:76,smear:3,sa:200,mouth:2,brow:1},
        {nowide:1,tw:0.6,lean:28,hx:12,lFh:74,lFk:14,lBh:-50,lBk:-56,aFs:60,aFe:40,bA:60,aBs:56,aBe:36,mouth:3,brow:1},
        {}][i])))},
      // giro em área (cercado): varre na frente, passa a ferramenta por baixo e acerta quem está nas costas
      areaSpin:{nome:N.areaSpin||'Giro em área (costas)',n:9,kf:1,kind:'area',hits:{3:1,6:2},hitsx:{3:{m:1.05,heavy:1,both:1,reach:52},6:{m:1.3,heavy:1,both:1,knock:1,reach:54}},
        dur:D([90,50,60,70,60,50,70,110,110]),pose:i=>G(Object.assign({},T,W([
        {tw:-0.8,lean:-6,hx:-2,lFh:36,lFk:8,lBh:-28,lBk:-40,aFs:-40,aFe:-70,bA:230,aBs:60,aBe:120,brow:1,mouth:1},
        {tw:0.2,lean:20,lFh:56,lFk:-10,lBh:-18,lBk:-60,aFs:30,aFe:60,bA:200,smear:1,sa:240,aBs:20,aBe:60,mouth:2},
        {tw:1,lean:24,hx:6,lFh:60,lFk:-6,lBh:-24,lBk:-64,aFs:90,aFe:94,bA:96,smear:3,sa:220,aBs:-40,aBe:-10,mouth:2,brow:1},
        {tw:1,lean:26,hx:8,lFh:60,lFk:-6,lBh:-24,lBk:-64,aFs:96,aFe:80,bA:50,smear:3,sa:150,impact:1,aBs:-50,aBe:-20,mouth:2},
        {tw:-0.6,lean:18,hx:6,lFh:56,lFk:-10,lBh:-22,lBk:-62,aFs:20,aFe:-20,bA:-60,smear:2,sa:40,aBs:40,aBe:90,mouth:2},
        {tw:-1,lean:10,hx:4,lFh:52,lFk:-10,lBh:-18,lBk:-60,aFs:-60,aFe:-80,bA:-96,smear:3,sa:-20,aBs:60,aBe:120,mouth:2,brow:1},
        {tw:-1,lean:8,hx:2,lFh:52,lFk:-10,lBh:-18,lBk:-60,aFs:-70,aFe:-90,bA:-122,smear:3,sa:-40,impact:2,aBs:70,aBe:130,mouth:2,brow:1},
        {tw:-0.4,lean:12,lFh:42,lFk:6,lBh:-24,lBk:-40,aFs:20,aFe:60,bA:100,aBs:30,aBe:90,mouth:1},
        {}][i])))},
      // salto pra trás (esquiva de aviso no chão quando o perigo vem da frente)
      backstep:{nome:N.backstep||'Salto pra trás',n:5,kf:1,kind:'dodge',z:[0,8,10,4,0],dur:D([60,80,80,80,100]),pose:i=>G(Object.assign({},T,W([
        {lean:20,lFh:36,lFk:-20,lBh:-8,lBk:-50,aFs:60,aFe:100,bA:140,aBs:40,aBe:100,brow:1},
        {nowide:1,plant:0,lean:-10,head:-6,lFh:40,lFk:10,lBh:-10,lBk:-40,aFs:60,aFe:110,bA:140,aBs:30,aBe:90,brow:1,mouth:1},
        {nowide:1,plant:0,lean:-14,lFh:50,lFk:22,lBh:0,lBk:-30,aFs:50,aFe:110,bA:140,aBs:30,aBe:90,brow:1},
        {lean:18,lFh:30,lFk:-20,lBh:-18,lBk:-70,aFs:60,aFe:100,bA:136,aBs:40,aBe:100,brow:1},
        {}][i])))},
      // empurrado: escorrega pra trás com o calcanhar arrastando, braços abertos
      hurtPush:{nome:'Dano: empurrado',n:5,kf:1,kind:'react',dur:D([70,100,110,120,140]),pose:i=>G(Object.assign({},T0,W([
        {flash:1,lean:-24,head:-20,hx:-8,lFh:30,lFk:20,lBh:-20,lBk:-30,aFs:-60,aFe:-20,bA:110,aBs:-70,aBe:-40,mouth:2,brow:2},
        {lean:-20,head:-14,hx:-8,lFh:40,lFk:40,lBh:-10,lBk:-20,aFs:-80,aFe:-40,bA:120,aBs:-90,aBe:-60,mouth:2,brow:2,blink:1},
        {lean:-8,head:-6,hx:-4,lFh:40,lFk:16,lBh:-30,lBk:-44,aFs:-20,aFe:30,bA:120,aBs:-30,aBe:0,mouth:1,brow:2},
        {lean:4,lFh:40,lFk:8,lBh:-34,lBk:-44,aFs:30,aFe:70,bA:120,aBs:20,aBe:60,mouth:1,brow:2},
        {}][i])))},
      // lançado: voa de costas, bate no chão (quica) e fica deitado — depois o motor chama "getup"
      launched:{nome:'Dano: lançado longe',n:7,kf:1,kind:'react',z:[4,24,32,22,6,2,0],dur:D([80,110,110,100,90,140,260]),pose:i=>G(Object.assign({},T0,W([
        {nowide:1,flash:1,lean:-30,head:-24,hx:-4,plant:0,lFh:40,lFk:20,lBh:10,lBk:-10,aFs:-60,aFe:-100,bA:160,aBs:-80,aBe:-120,mouth:2,brow:2},
        {nowide:1,rot:-30,plant:0,lean:-10,head:-16,lFh:60,lFk:40,lBh:30,lBk:20,aFs:150,aFe:170,bA:200,aBs:170,aBe:200,mouth:2,brow:2,blink:1},
        {nowide:1,rot:-60,plant:0,lean:-4,head:-10,hx:6,lFh:70,lFk:60,lBh:40,lBk:30,aFs:160,aFe:190,bA:220,aBs:180,aBe:210,mouth:2,brow:2,blink:1},
        {nowide:1,rot:-80,plant:0,head:-12,hx:14,lFh:50,lFk:50,lBh:30,lBk:30,aFs:150,aFe:170,bA:200,aBs:170,aBe:200,mouth:2,brow:2,blink:1},
        {nowide:1,rot:-90,plant:0,hx:20,head:-16,flash:1,lFh:40,lFk:50,lBh:20,lBk:30,aFs:140,aFe:160,bA:190,aBs:170,aBe:200,mouth:2,brow:2,blink:1},
        {nowide:1,rot:-88,plant:0,hx:22,lift:3,head:-6,lFh:24,lFk:30,lBh:10,lBk:16,aFs:150,aFe:176,bA:170,aBs:176,aBe:206,mouth:1,brow:2,blink:1},
        {nowide:1,rot:-90,plant:0,hx:24,head:0,lFh:14,lFk:12,lBh:6,lBk:4,aFs:146,aFe:166,bA:140,aBs:176,aBe:196,brow:2,blink:1}][i])))},
      // provocação: ferramenta no ombro, chama o zumbi com a mão ("vem!") e ri
      taunt:{nome:N.taunt||'Provocação',n:8,kf:1,kind:'taunt',dur:D([120,110,110,110,120,150,160,200]),pose:i=>G(Object.assign({},T0,W([
        {nowide:1,lean:0,lFh:22,lFk:2,lBh:-16,lBk:-20,aFs:150,aFe:214,bA:256,aBs:10,aBe:24,mouth:3,brow:1},
        {nowide:1,lean:2,lFh:22,lFk:2,lBh:-16,lBk:-20,aFs:150,aFe:214,bA:256,aBs:70,aBe:140,mouth:1,brow:1},
        {nowide:1,lean:2,lFh:22,lFk:2,lBh:-16,lBk:-20,aFs:150,aFe:214,bA:256,aBs:74,aBe:98,mouth:1,brow:1},
        {nowide:1,lean:2,lFh:22,lFk:2,lBh:-16,lBk:-20,aFs:150,aFe:214,bA:256,aBs:70,aBe:146,mouth:1,brow:1},
        {nowide:1,lean:2,lFh:22,lFk:2,lBh:-16,lBk:-20,aFs:150,aFe:214,bA:256,aBs:74,aBe:98,mouth:2,brow:1},
        {nowide:1,lean:-6,head:-12,lFh:22,lFk:2,lBh:-16,lBk:-20,aFs:150,aFe:214,bA:256,aBs:10,aBe:30,mouth:3,brow:3},
        {nowide:1,lean:-4,head:-10,lift:2,plant:0,lFh:24,lFk:4,lBh:-14,lBk:-18,aFs:150,aFe:214,bA:256,aBs:12,aBe:34,mouth:3,brow:3,blink:1},
        {}][i])))},
      // dano na barriga (os rigs que ainda não tinham)
      hurtC:{nome:'Dano: dobra no estômago',n:4,kf:1,kind:'react',dur:D([80,120,130,150]),pose:i=>G(Object.assign({},T0,W([
        {lean:36,head:16,hx:-4,flash:1,aFs:54,aFe:20,bA:80,aBs:44,aBe:10,mouth:2,brow:2,blink:1,lFh:22,lFk:-10,lBh:-8,lBk:-22},
        {lean:30,head:14,hx:-3,aFs:46,aFe:24,bA:80,aBs:38,aBe:14,mouth:2,brow:2,lFh:20,lFk:-8,lBh:-8,lBk:-20},
        {lean:12,head:4,hx:-1,aFs:50,aFe:70,bA:110,mouth:1,brow:2,lFh:30,lFk:4,lBh:-24,lBk:-34},{}][i])))},
    };
    const sk=o.skip||{};
    Object.keys(out).forEach(k=>{ if(sk[k]) delete out[k]; });
    return out;
  }

  /* ---------- golpes assinatura (catálogo: cada personagem escolhe 2–3, com nome do ofício) ---------- */
  // id → (G, T, D) => anim. T = {two:1} se a ferramenta é de duas mãos; D = durações com o "slow" do personagem
  const SIG={
    // rebatida: as duas mãos no cabo, gira o tronco todo e manda o zumbi longe (vira projétil que derruba os outros)
    homeRun:(G,T,D)=>({n:9,hits:{5:1},hitsx:{5:{m:2,heavy:1,fling:1,reach:52}},move:[0,0,10,40,60,30,0,0,0],dur:D([110,110,90,60,40,70,130,110,110]),pose:i=>G(Object.assign({two:1},W([
      {tw:-0.6,lean:-4,hx:-2,lFh:30,lFk:6,lBh:-30,lBk:-40,aFs:20,aFe:60,bA:170,aBs:20,aBe:66,brow:1},
      {tw:-1,lean:-12,hx:-6,lFh:20,lFk:-2,lBh:-26,lBk:-40,aFs:-30,aFe:-60,bA:200,aBs:-26,aBe:-56,brow:1,mouth:1},
      {tw:-1,lean:-14,hx:-7,lift:2,plant:0,lFh:46,lFk:-14,lBh:-24,lBk:-40,aFs:-40,aFe:-70,bA:214,aBs:-36,aBe:-66,brow:1,mouth:1},
      {tw:0,lean:10,hx:2,lFh:56,lFk:10,lBh:-40,lBk:-52,aFs:30,aFe:20,bA:200,aBs:24,aBe:16,smear:1,sa:230,mouth:2,brow:1},
      {tw:0.9,lean:24,hx:10,lFh:64,lFk:12,lBh:-44,lBk:-54,aFs:88,aFe:94,bA:120,aBs:84,aBe:90,smear:3,sa:220,mouth:2,brow:1},
      {tw:1,lean:28,hx:14,head:-12,lFh:66,lFk:14,lBh:-46,lBk:-54,aFs:96,aFe:90,bA:70,aBs:92,aBe:86,smear:3,sa:200,impact:2,mouth:2,brow:1},
      {tw:1,lean:20,hx:14,lFh:62,lFk:12,lBh:-44,lBk:-54,aFs:120,aFe:150,bA:-30,aBs:114,aBe:146,smear:2,sa:80,mouth:3,brow:1},
      {tw:0.6,lean:8,hx:10,lFh:50,lFk:8,lBh:-36,lBk:-48,aFs:130,aFe:170,bA:-60,aBs:120,aBe:160,mouth:3,brow:3},
      {}][i])))}),
    // estocadas triplas: três espetadas rápidas com o corpo avançando (a última empurra)
    tripleJab:(G,T,D)=>({n:9,hits:{2:1,4:2,6:3},hitsx:{2:{m:0.6,reach:60},4:{m:0.7,reach:62},6:{m:1.1,heavy:1,reach:64}},move:[0,60,40,60,40,80,30,0,0],dur:D([90,40,60,40,60,40,110,100,100]),pose:i=>{
      const back={tw:-0.5,aFs:-20,aFe:84,bA:94,lean:-6,hx:-2,lFh:40,lFk:6,lBh:-32,lBk:-42,aBs:50,aBe:110,brow:1,mouth:1};
      const out={tw:1,aFs:94,aFe:92,bA:91,lean:30,hx:16,head:-10,lFh:60,lFk:12,lBh:-40,lBk:-46,aBs:-60,aBe:-40,mouth:2,brow:1};
      return G(Object.assign({},T,W([back,Object.assign({},out,{smear:1,sa:100}),Object.assign({},out,{impact:1}),Object.assign({},back,{hx:4}),Object.assign({},out,{hx:20,impact:1}),Object.assign({},back,{hx:8}),Object.assign({},out,{hx:24,lean:34,impact:2,smear:2,sa:110}),Object.assign({},out,{hx:20,lean:24,mouth:1}),{}][i]))); }}),
    // rasteira com a ferramenta: abaixa e varre rente ao chão (derruba, alcance longo)
    lowSweep:(G,T,D)=>({n:8,hits:{4:1},hitsx:{4:{m:1.25,knock:1,reach:62}},move:[0,20,50,40,10,0,0,0],dur:D([90,90,60,40,120,100,100,110]),pose:i=>G(Object.assign({},T,W([
      {lean:16,lFh:46,lFk:8,lBh:-36,lBk:-48,aFs:40,aFe:100,bA:150,aBs:30,aBe:90,brow:1},
      {tw:-0.8,lean:30,hx:-4,head:4,lFh:84,lFk:-20,lBh:-2,lBk:-100,aFs:-30,aFe:-50,bA:-110,aBs:20,aBe:40,brow:1,mouth:1},
      {tw:-0.4,lean:36,hx:-2,head:6,lFh:96,lFk:-30,lBh:8,lBk:-110,aFs:-10,aFe:-20,bA:-80,aBs:10,aBe:30,smear:1,sa:-130,mouth:1},
      {tw:0.6,lean:40,hx:4,head:8,lFh:96,lFk:-30,lBh:8,lBk:-110,aFs:40,aFe:30,bA:30,smear:2,sa:-90,aBs:-10,aBe:10,mouth:2},
      {tw:1,lean:40,hx:8,head:8,lFh:96,lFk:-30,lBh:8,lBk:-110,aFs:70,aFe:60,bA:76,smear:3,sa:-60,impact:2,aBs:-30,aBe:-10,mouth:2,brow:1},
      {tw:0.8,lean:36,hx:8,head:6,lFh:92,lFk:-26,lBh:4,lBk:-104,aFs:66,aFe:56,bA:80,aBs:-30,aBe:-10,mouth:1},
      {lean:22,hx:4,lFh:60,lFk:-6,lBh:-20,lBk:-70,aFs:40,aFe:90,bA:120,aBs:20,aBe:70},
      {}][i])))}),
    // ombrada: abaixa o ombro e atropela o zumbi correndo (empurra e derruba)
    shoulderCharge:(G,T,D)=>({n:7,hits:{3:1},hitsx:{3:{m:1.4,heavy:1,knock:1,reach:40}},move:[60,200,230,140,40,0,0],dur:D([100,70,70,90,100,100,110]),pose:i=>G(Object.assign({},T,W([
      {tw:0.8,lean:20,hx:-4,head:-4,lFh:40,lFk:-10,lBh:-20,lBk:-60,aFs:-10,aFe:40,bA:140,aBs:20,aBe:60,brow:1,mouth:1},
      {nowide:1,tw:1,plant:0,lean:34,hx:4,head:-6,lFh:60,lFk:0,lBh:-40,lBk:-90,aFs:-20,aFe:30,bA:150,aBs:10,aBe:40,brow:1,mouth:1},
      {nowide:1,tw:1,plant:0,lean:38,hx:8,head:-8,lift:2,lFh:-10,lFk:-60,lBh:56,lBk:0,aFs:-30,aFe:20,bA:150,aBs:0,aBe:30,brow:1,mouth:2},
      {nowide:1,tw:1,lean:40,hx:14,head:-10,flash:0,lFh:70,lFk:14,lBh:-50,lBk:-60,aFs:-40,aFe:10,bA:150,aBs:-10,aBe:20,impact:0,mouth:2,brow:1},
      {nowide:1,tw:0.8,lean:30,hx:12,head:-8,lFh:70,lFk:14,lBh:-48,lBk:-58,aFs:-20,aFe:40,bA:140,aBs:0,aBe:40,mouth:1},
      {lean:16,hx:6,lFh:46,lFk:8,lBh:-36,lBk:-48,aFs:50,aFe:90,bA:130,aBs:30,aBe:90},
      {}][i])))}),
    // tornado: gira duas vezes com a ferramenta aberta, avançando, e acerta dos dois lados (3 acertos)
    spinTornado:(G,T,D)=>({n:10,hits:{2:1,5:2,8:3},hitsx:{2:{m:0.8,both:1,reach:54},5:{m:0.9,both:1,reach:54},8:{m:1.3,heavy:1,both:1,knock:1,reach:56}},z:[0,4,8,6,8,10,8,4,0,0],move:[0,50,60,60,60,60,50,30,0,0],dur:D([100,60,60,60,60,60,60,60,120,110]),pose:i=>{
      const f={tw:1,lean:16,hx:4,lFh:50,lFk:-10,lBh:-20,lBk:-60,aFs:90,aFe:94,bA:90,aBs:-40,aBe:-10,smear:3,sa:220,mouth:2,brow:1};
      const b={tw:-1,lean:8,hx:2,lFh:44,lFk:-10,lBh:-16,lBk:-56,aFs:-70,aFe:-90,bA:-96,aBs:60,aBe:120,smear:3,sa:-10,mouth:2,brow:1};
      const up={nowide:1,plant:0,tw:0,lean:4,lFh:70,lFk:10,lBh:10,lBk:-40,aFs:150,aFe:170,bA:200,aBs:-20,aBe:20,smear:2,sa:90,mouth:2};
      return G(Object.assign({},T,W([{tw:-0.8,lean:-6,lFh:36,lFk:8,lBh:-28,lBk:-40,aFs:-40,aFe:-70,bA:230,aBs:60,aBe:120,brow:1,mouth:1},
        Object.assign({},f,{smear:2}),Object.assign({},f,{impact:1}),up,Object.assign({},b,{plant:0,nowide:1,lFh:56,lFk:-6,lBh:-24,lBk:-62}),Object.assign({},b,{impact:1}),
        Object.assign({},up,{sa:-80}),Object.assign({},f,{lean:20}),Object.assign({},f,{lean:26,hx:10,impact:2,aFe:70,bA:40,sa:200}),{}][i]))); }}),
    // pancada no chão: sobe a ferramenta bem alto e crava no chão; variações: racha (lascas), onda (anda pelo chão), faísca (atordoa em volta)
    groundSlam:(G,T,D,v)=>({n:9,hits:{5:1},hitsx:{5:Object.assign({m:1.6,heavy:1,knock:1,reach:46,slam:1},v==='wave'?{wave:1}:v==='spark'?{stun:1.4,around:56,knock:0}:{around:40})},move:[0,0,10,10,30,20,0,0,0],dur:D([110,110,110,70,40,50,200,120,110]),pose:i=>G(Object.assign({},T,W([
      {lean:6,lFh:40,lFk:6,lBh:-32,lBk:-44,aFs:60,aFe:96,bA:140,aBs:50,aBe:100,brow:1},
      {lean:-10,head:-6,lFh:34,lFk:-6,lBh:-24,lBk:-44,aFs:150,aFe:186,bA:226,aBs:140,aBe:176,brow:1,mouth:1},
      {lean:-18,head:-10,lift:5,plant:0,lFh:56,lFk:-14,lBh:-10,lBk:-50,aFs:176,aFe:208,bA:246,aBs:166,aBe:198,brow:1,mouth:1},
      {lean:-20,head:-12,lift:6,plant:0,lFh:62,lFk:-12,lBh:-4,lBk:-52,aFs:178,aFe:212,bA:252,aBs:170,aBe:202,brow:1,mouth:2},
      {tw:0.6,lean:16,hx:6,lFh:62,lFk:10,lBh:-36,lBk:-50,aFs:110,aFe:120,bA:130,smear:2,sa:252,aBs:100,aBe:116,mouth:2,brow:1},
      {tw:1,lean:46,hx:14,head:-16,lFh:80,lFk:-12,lBh:-14,lBk:-96,aFs:66,aFe:40,bA:6,smear:3,sa:246,impact:2,aBs:60,aBe:36,mouth:2,brow:1},
      {tw:0.9,lean:44,hx:14,head:-14,lFh:80,lFk:-12,lBh:-14,lBk:-96,aFs:64,aFe:38,bA:8,impact:1,aBs:58,aBe:34,mouth:1,brow:1},
      {tw:0.4,lean:24,hx:8,lFh:56,lFk:4,lBh:-30,lBk:-60,aFs:50,aFe:70,bA:80,aBs:40,aBe:70,mouth:1},
      {}][i])))}),
    // fisgada: estica a ferramenta, engancha o zumbi e puxa pro pé (puxa e derruba)
    pullHook:(G,T,D)=>({n:8,hits:{3:1,5:2},hitsx:{3:{m:0.7,pull:1,reach:78},5:{m:1.2,heavy:1,knock:1,reach:44}},move:[0,-20,0,-30,20,40,0,0],dur:D([90,90,50,120,80,60,120,110]),pose:i=>G(Object.assign({},T,W([
      {tw:-0.4,lean:-4,lFh:36,lFk:6,lBh:-30,lBk:-40,aFs:40,aFe:110,bA:160,aBs:40,aBe:100,brow:1},
      {tw:-0.8,lean:-10,hx:-4,lFh:30,lFk:2,lBh:-28,lBk:-40,aFs:120,aFe:160,bA:190,aBs:60,aBe:120,brow:1,mouth:1},
      {tw:0.8,lean:30,hx:14,lFh:70,lFk:12,lBh:-46,lBk:-52,aFs:96,aFe:94,bA:100,smear:2,sa:190,aBs:-40,aBe:-10,mouth:2,brow:1},
      {tw:0.9,lean:34,hx:18,head:-10,lFh:74,lFk:14,lBh:-48,lBk:-54,aFs:96,aFe:92,bA:86,impact:1,aBs:-50,aBe:-20,mouth:2,brow:1},
      {tw:-0.6,lean:-16,hx:-6,head:-6,lFh:30,lFk:-4,lBh:-34,lBk:-50,aFs:30,aFe:-10,bA:-60,smear:2,sa:80,aBs:40,aBe:90,mouth:2,brow:1},
      {tw:1,lean:30,hx:12,lFh:66,lFk:12,lBh:-44,lBk:-52,aFs:120,aFe:100,bA:40,smear:3,sa:170,impact:2,aBs:-40,aBe:-10,mouth:2,brow:1},
      {tw:0.8,lean:26,hx:12,lFh:62,lFk:12,lBh:-42,lBk:-52,aFs:96,aFe:70,bA:30,aBs:-30,aBe:0,mouth:1},
      {}][i])))}),
    // gancho pra cima com pulo: ferramenta de baixo pra cima com o corpo subindo junto (lança alto)
    uppercutSlam:(G,T,D)=>({n:8,hits:{3:1},hitsx:{3:{m:1.5,heavy:1,launch:1,reach:48,hi:1}},z:[0,0,6,18,22,14,2,0],move:[0,20,50,30,10,0,0,0],dur:D([110,110,50,80,100,100,100,110]),pose:i=>G(Object.assign({},T,W([
      {lean:26,head:2,lFh:66,lFk:-30,lBh:-6,lBk:-80,aFs:-20,aFe:-40,bA:-140,aBs:-10,aBe:20,brow:1},
      {tw:-0.6,lean:34,head:6,lFh:80,lFk:-36,lBh:4,lBk:-96,aFs:-30,aFe:-50,bA:-120,aBs:-20,aBe:10,brow:1,mouth:1},
      {nowide:1,tw:0.4,plant:0,lean:10,lFh:60,lFk:0,lBh:-20,lBk:-40,aFs:60,aFe:90,bA:30,smear:2,sa:-130,aBs:-30,aBe:0,mouth:2,brow:1},
      {nowide:1,tw:1,plant:0,lean:-16,head:-14,lFh:90,lFk:10,lBh:-10,lBk:-30,aFs:160,aFe:180,bA:186,smear:3,sa:-90,impact:2,aBs:-40,aBe:-10,mouth:2,brow:1},
      {nowide:1,tw:0.8,plant:0,lean:-14,head:-12,lFh:96,lFk:16,lBh:0,lBk:-26,aFs:166,aFe:186,bA:196,aBs:-40,aBe:-10,mouth:2,brow:1},
      {nowide:1,plant:0,lean:-4,lFh:70,lFk:0,lBh:-10,lBk:-40,aFs:120,aFe:150,bA:170,aBs:-20,aBe:20,mouth:1},
      {lean:22,lFh:60,lFk:-20,lBh:-10,lBk:-70,aFs:60,aFe:100,bA:140,aBs:20,aBe:70,mouth:1},
      {}][i])))}),
    // espetada com atordoamento: mira, crava e segura (injeção/ponta) — deixa o zumbi tonto
    stabStun:(G,T,D)=>({n:8,hits:{3:1},hitsx:{3:{m:1.1,stun:2.2,reach:60}},move:[0,-20,120,40,0,0,0,0],dur:D([110,140,40,200,120,90,100,110]),pose:i=>G(Object.assign({},T,W([
      {lean:0,lFh:36,lFk:6,lBh:-30,lBk:-42,aFs:60,aFe:96,bA:96,aBs:40,aBe:100,brow:1},
      {tw:-0.7,lean:-12,hx:-6,head:-4,lFh:28,lFk:2,lBh:-28,lBk:-42,aFs:-30,aFe:80,bA:92,aBs:60,aBe:120,brow:1,mouth:1},
      {tw:0.7,lean:22,hx:10,lFh:62,lFk:10,lBh:-40,lBk:-46,aFs:86,aFe:90,bA:90,smear:1,sa:100,aBs:-30,aBe:0,mouth:2,brow:1},
      {tw:1,lean:34,hx:22,head:-12,lFh:72,lFk:14,lBh:-46,lBk:-48,aFs:96,aFe:92,bA:92,impact:2,aBs:-60,aBe:-40,mouth:2,brow:1},
      {tw:1,lean:32,hx:22,head:-10,lFh:72,lFk:14,lBh:-46,lBk:-48,aFs:94,aFe:92,bA:94,aBs:90,aBe:96,mouth:1,brow:1},
      {tw:0.4,lean:10,hx:8,lFh:46,lFk:8,lBh:-34,lBk:-46,aFs:60,aFe:96,bA:120,aBs:40,aBe:100,mouth:3},
      {lean:6,lFh:40,lFk:6,lBh:-32,lBk:-44,aFs:60,aFe:96,bA:126,aBs:40,aBe:100,mouth:3,brow:3},
      {}][i])))}),
    // capina: três golpes curtos de cima pra baixo avançando, o último arranca do chão (derruba)
    chops3:(G,T,D)=>({n:10,hits:{2:1,5:2,8:3},hitsx:{2:{m:0.6,reach:50},5:{m:0.7,reach:52},8:{m:1.3,heavy:1,knock:1,reach:54}},move:[0,40,30,0,50,30,0,60,30,0],dur:D([90,50,70,80,50,70,80,50,120,110]),pose:i=>{
      const up={lean:-6,hx:2,lFh:40,lFk:4,lBh:-30,lBk:-42,aFs:150,aFe:186,bA:226,aBs:140,aBe:176,brow:1,mouth:1};
      const dn={tw:0.8,lean:36,hx:12,head:-12,lFh:66,lFk:10,lBh:-40,lBk:-50,aFs:70,aFe:50,bA:16,smear:3,sa:236,aBs:62,aBe:44,mouth:2,brow:1};
      return G(Object.assign({},T,W([up,Object.assign({},dn,{smear:2}),Object.assign({},dn,{impact:1}),Object.assign({},up,{hx:8}),Object.assign({},dn,{hx:18,smear:2}),Object.assign({},dn,{hx:18,impact:1}),
        Object.assign({},up,{hx:14,lift:4,plant:0}),Object.assign({},dn,{hx:24,smear:3,lean:42}),{tw:1,lean:20,hx:24,head:-14,lFh:60,lFk:10,lBh:-40,lBk:-50,aFs:150,aFe:170,bA:200,aBs:140,aBe:160,smear:3,sa:20,impact:2,mouth:2,brow:1},{}][i]))); }}),
    // chute e tiro (armas de fogo): chuta de colado e dispara à queima-roupa no zumbi que recua
    kickShot:(G,T,D)=>({n:9,hits:{2:1},hitsx:{2:{m:0.9,reach:46}},fireAt:[5],fireMul:1.6,move:[0,30,40,-40,-30,0,0,0,0],dur:D([80,60,110,80,70,60,100,110,110]),pose:i=>G(Object.assign({},W([
      {nowide:1,lean:-6,hx:-2,plant:0,lFh:98,lFk:6,lBh:-16,lBk:-28,aFs:40,aFe:96,bA:96,aBs:30,aBe:90,mouth:1,brow:1},
      {nowide:1,lean:-18,hx:4,plant:0,lFh:94,lFk:80,kick:'F',smear:2,sa:20,lBh:-14,lBk:-24,aFs:30,aFe:90,bA:92,aBs:20,aBe:70,mouth:2,brow:1},
      {nowide:1,lean:-22,hx:7,plant:0,lFh:92,lFk:94,kick:'F',smear:3,sa:24,impact:2,lBh:-12,lBk:-22,aFs:30,aFe:90,bA:92,aBs:20,aBe:62,mouth:2,brow:1},
      {lean:6,lFh:40,lFk:6,lBh:-36,lBk:-48,aFs:70,aFe:92,bA:92,aBs:60,aBe:96,brow:1},
      {lean:10,lFh:44,lFk:8,lBh:-38,lBk:-50,aFs:84,aFe:90,bA:90,aBs:76,aBe:92,brow:1,mouth:1},
      {lean:-4,hx:-4,lFh:44,lFk:8,lBh:-38,lBk:-50,aFs:92,aFe:100,bA:104,aBs:84,aBe:100,brow:1,mouth:2},
      {lean:-8,hx:-5,lFh:44,lFk:8,lBh:-38,lBk:-50,aFs:100,aFe:116,bA:124,aBs:90,aBe:112,brow:1,mouth:2},
      {lean:4,lFh:44,lFk:8,lBh:-38,lBk:-50,aFs:80,aFe:92,bA:96,aBs:70,aBe:94,mouth:1},
      {}][i])))}),
    // lâmina de plasma (laser): o feixe curto vira lâmina num arco de cima pra baixo e solta uma rajada larga
    bladeSlash:(G,T,D)=>({n:8,hits:{3:1},hitsx:{3:{m:1.3,heavy:1,both:0,reach:60}},fireAt:[4],fireMul:0.9,fireWide:1,move:[0,0,60,40,0,0,0,0],dur:D([110,110,40,70,110,100,110,110]),pose:i=>G(Object.assign({},W([
      {lean:0,lFh:40,lFk:6,lBh:-32,lBk:-44,aFs:60,aFe:96,bA:96,aBs:50,aBe:100,brow:1},
      {lean:-12,head:-6,lFh:34,lFk:-6,lBh:-24,lBk:-44,aFs:150,aFe:186,bA:210,aBs:140,aBe:176,brow:1,mouth:1},
      {tw:0.6,lean:16,hx:6,lFh:62,lFk:10,lBh:-36,lBk:-50,aFs:120,aFe:130,bA:140,smear:3,sa:220,aBs:100,aBe:116,mouth:2,brow:1},
      {tw:1,lean:30,hx:12,head:-10,lFh:70,lFk:12,lBh:-42,lBk:-52,aFs:86,aFe:80,bA:70,smear:3,sa:210,impact:2,aBs:70,aBe:76,mouth:2,brow:1},
      {tw:0.6,lean:10,hx:8,lFh:62,lFk:10,lBh:-36,lBk:-50,aFs:90,aFe:92,bA:92,aBs:84,aBe:92,mouth:2,brow:1},
      {lean:0,hx:4,lFh:50,lFk:8,lBh:-36,lBk:-50,aFs:96,aFe:110,bA:118,aBs:86,aBe:104,mouth:1},
      {lean:4,lFh:44,lFk:8,lBh:-36,lBk:-48,aFs:80,aFe:96,bA:100,aBs:60,aBe:96},
      {}][i])))}),
  };
  // sig(G,o,[[id, nome, variante, campos extras], ...]) → anims sigNome… (o.two/o.slow iguais ao kit)
  function sigs(G,o,list){
    o=o||{}; const sl=o.slow||1, T=o.two?{two:1}:{}, D=a=>i=>Math.round(a[i]*sl), out={};
    list.forEach(([key,id,nome,extra])=>{ const v=(extra&&extra.v)||null, a=SIG[id](G,T,D,v), PP=extra&&extra.P;
      out[key]=Object.assign(a,{nome,kind:'sig',kf:1,sig:1,cd:7},extra||{}); delete out[key].v; delete out[key].P;
      if(PP){ const pf=a.pose; out[key].pose=i=>Object.assign(pf(i),PP); } }); // P = parâmetros de pose do rig (ex.: enfermeira com a injeção)
    return out;
  }
  return {kit,sigs,SIG,kickTip,kickPiv,kickSmear,smearArc,W};
})();

/* ===== shared/zreact ===== */
/* ZREACT — fonte de arte (editável). Build: npm run art */
/* Reações físicas e golpes extras dos zumbis comuns, escritos como DESVIO da pose de descanso (REST) de cada
   rig — assim o mesmo molde serve pro Errante, Corredor, Gritador, Saltador... e respeita a anatomia de cada um
   (só mexe nas juntas que o rig tem). Usado pelo motor (src/expedition/ai/index.ts e moveset.ts):
     tumble  = voando (lançado/arremessado), em loop, girando no ar
     grabbed = agarrado pela gola, pés balançando, unhando o lutador
     swipe/flop/flip/lunge = moldes de golpe (hit = quadro do dano, reach = alcance, z = altura por quadro) */
const ZREACT=(function(){
  const T={
    tumble:{n:4,dur:()=>70,loop:1,f:[
      {flash:1,lean:-24,hunch:-14,head:22,jaw:16,aFs:120,aFe:130,aBs:100,aBe:120,lFh:30,lFk:40,lBh:-10,lBk:-10},
      {lean:-30,hunch:-18,head:26,jaw:20,aFs:150,aFe:170,aBs:130,aBe:150,lFh:10,lFk:10,lBh:30,lBk:40},
      {lean:-26,hunch:-16,head:20,jaw:12,aFs:100,aFe:140,aBs:160,aBe:170,lFh:40,lFk:20,lBh:10,lBk:30},
      {lean:-22,hunch:-12,head:24,jaw:18,aFs:140,aFe:120,aBs:110,aBe:150,lFh:20,lFk:40,lBh:30,lBk:10}]},
    grabbed:{n:4,dur:()=>110,loop:1,f:[
      {lean:-10,hunch:-8,head:10,jaw:16,aFs:60,aFe:70,aBs:40,aBe:60,lFh:-6,lFk:-2,lBh:8,lBk:10},
      {lean:-14,hunch:-10,head:14,jaw:6,aFs:80,aFe:50,aBs:70,aBe:90,lFh:6,lFk:10,lBh:-4,lBk:0},
      {lean:-12,hunch:-8,head:6,jaw:22,aFs:50,aFe:90,aBs:60,aBe:40,lFh:-4,lFk:4,lBh:10,lBk:14},
      {lean:-16,hunch:-12,head:16,jaw:10,aFs:90,aFe:60,aBs:50,aBe:80,lFh:8,lFk:12,lBh:-2,lBk:4}]},
    // tapa de revés: arma o braço lá atrás e varre em diagonal
    swipe:{n:7,hit:3,reach:38,dur:i=>[150,140,50,90,130,130,140][i],f:[
      {lean:-8,hunch:-6,head:8,jaw:10,aFs:100,aFe:140,aBs:-10,hx:-3},
      {lean:-14,hunch:-8,head:12,jaw:18,aFs:150,aFe:170,aBs:-20,aBe:-10,hx:-4},
      {lean:18,hunch:6,head:-6,jaw:22,aFs:60,aFe:40,smear:1,hx:6,lFh:8,lBh:-6},
      {lean:26,hunch:10,head:-10,jaw:24,aFs:20,aFe:-10,smear:1,hx:10,lFh:12,lBh:-10},
      {lean:24,hunch:10,head:-8,jaw:12,aFs:-20,aFe:-30,hx:10,lFh:12,lBh:-10},
      {lean:10,hunch:4,jaw:6,hx:4},
      {}]},
    // peixinho / barrigada voadora: pula e cai de cara em cima do lutador (área), levanta devagar
    flop:{n:8,hit:5,reach:40,z:[0,6,18,14,6,0,0,0],dur:i=>[180,90,90,80,70,60,260,200][i],f:[
      {lean:10,hunch:6,head:-4,jaw:10,lFh:20,lFk:-20,lBh:10,lBk:-20,aFs:-20,aBs:-20,hx:-2},
      {lean:-10,head:10,jaw:24,aFs:140,aFe:150,aBs:140,aBe:150,lFh:-10,lFk:-10,lBh:-10,lBk:-10},
      {rot:30,lean:20,jaw:30,aFs:160,aFe:170,aBs:160,aBe:170,lFh:-20,lBh:-30},
      {rot:60,lean:10,jaw:30,aFs:100,aFe:110,aBs:100,aBe:110,lFh:-26,lBh:-36},
      {rot:80,jaw:30,aFs:80,aFe:80,aBs:80,aBe:80,lFh:-30,lBh:-40,hx:6},
      {rot:88,jaw:40,flash:1,aFs:70,aFe:60,aBs:70,aBe:60,lFh:-30,lBh:-40,hx:8},
      {rot:40,lean:30,hunch:10,jaw:20,aFs:20,aFe:10,aBs:20,aBe:10,lFh:30,lFk:-20,hx:6},
      {}]},
    // mortal pra trás com chute: as pernas de mola passam por cima e descem no alvo
    flip:{n:8,hit:4,reach:42,z:[0,10,26,30,20,6,0,0],dur:i=>[170,80,70,60,70,90,160,160][i],f:[
      {lean:12,hunch:8,head:-6,jaw:8,aFs:-20,aBs:-20},
      {rot:-60,lean:-6,head:10,jaw:16,aFs:80,aBs:80},
      {rot:-140,head:10,jaw:20,aFs:120,aBs:120,lFh:20,lBh:20},
      {rot:-220,head:8,jaw:24,aFs:120,aBs:120,lFh:30,lBh:30,smear:1},
      {rot:-300,head:4,jaw:28,aFs:60,aBs:60,lFh:10,lBh:10,smear:1},
      {rot:-350,lean:10,jaw:16,aFs:20,aBs:20},
      {lean:16,hunch:10,jaw:10},
      {}]},
    // bote de mordida: recua o pescoço e estica tudo pra frente
    lunge:{n:7,hit:3,reach:36,dur:i=>[160,150,50,140,130,130,140][i],f:[
      {lean:-10,head:10,jaw:20,hx:-2},
      {lean:-16,head:14,jaw:30,hx:-4,aFs:20,aBs:20},
      {lean:30,hunch:14,head:-14,jaw:34,hx:8,aFs:60,aFe:50,aBs:50,aBe:40,smear:1,lFh:10,lBh:-10},
      {lean:34,hunch:16,head:-18,jaw:0,hx:10,aFs:70,aFe:40,aBs:60,aBe:30,lFh:12,lBh:-12},
      {lean:28,hunch:12,head:-12,jaw:10,hx:8,aFs:40,aBs:30},
      {lean:10,hunch:4,jaw:8,hx:3},
      {}]},
  };
  const ABS={flash:1,smear:1};
  function pose(REST,d){ const o={}; for(const k in d){ if(!(k in REST)) continue; o[k]=ABS[k]?d[k]:REST[k]+d[k]; } return o; }
  // add(ANIMS, REST, {tumble:1, grabbed:1, moves:{nomeDaAnim:['molde','Nome',{extras}]}})
  function add(ANIMS,REST,o){
    o=o||{}; const mk=(id,nome,ex)=>{ const t=T[id]; const a=Object.assign({nome,n:t.n,dur:t.dur,pose:i=>pose(REST,t.f[i])},t.hit!=null?{hit:t.hit,reach:t.reach}:{},t.z?{z:t.z}:{},ex||{}); return a; };
    if(o.tumble!==false) ANIMS.tumble=mk('tumble','Voando (lançado)');
    if(o.grabbed!==false) ANIMS.grabbed=mk('grabbed','Agarrado (esperneia)');
    Object.entries(o.moves||{}).forEach(([k,[id,nome,ex]])=>{ if(!ANIMS[k]) ANIMS[k]=mk(id,nome,ex); });
    return ANIMS;
  }
  return {add,T};
})();

/* ===== shared/gun ===== */
/* GUN — fonte de arte (editável). Build: npm run art */
const GUN=(function(){
  const {P2}=PIX;
  // rampas por tipo (corpo, empunhadura) e por raridade (acento, brilho)
  const KINDS={
    pistola:{body:['#9a9aa8','#4a4a58','#2c2c38','#16161e'], grip:['#b07a4a','#7a4a28','#4e2e18','#2a180a'], len:17, muzzle:P2(17.4,-2.2)},
    laser:{body:['#eef6ff','#9ab4d4','#5a7494','#2a3a58'], grip:['#6a6a78','#3a3a48','#24242e','#121218'], len:24, muzzle:P2(25,-1.6)},
  };
  const TIER={
    comum:{acc:['#d8d8e0','#8a8a98','#5a5a68','#30303c'], glow:['#e8ffff','#7af0ff','#2ab0d8','#10607a']},
    incomum:{acc:['#9af0aa','#4fb06a','#2e7a44','#164226'], glow:['#f0ffe8','#8aff9a','#3ad05a','#167a2a']},
    raro:{acc:['#a8d0ff','#4a8fe0','#2a5aa8','#142c5a'], glow:['#f0f8ff','#8ac8ff','#3a8af0','#16408a']},
    lunar:{acc:['#ffe08a','#e8b030','#9a6a14','#4a320a'], glow:['#fff0e0','#ff6a5a','#e0283a','#7a0c1a']},
  };
  function M(kind,tier){ const K=KINDS[kind]||KINDS.pistola, T=TIER[tier]||TIER.comum;
    return {gbody:kind==='pistola'&&tier==='lunar'?['#7a4a5a','#3a1a2a','#24101c','#12060c']:kind==='pistola'&&tier==='raro'?['#9ab8e0','#3a5a8a','#24385a','#121c30']:K.body, ggrip:K.grip, gacc:T.acc, gglow:T.glow}; }
  // base = punho (empunhadura), ang = direção do cano (rad)
  function draw(p,kind,tier,base,ang,o={}){
    const R=M(kind,tier), B=R.gbody, G=R.ggrip, A=R.gacc, L=R.gglow;
    p.xf(ang,base.x,base.y);
    if(kind==='laser'){
      // coronha curta + punho
      p.F(G[1]); p.poly([[-2.6,-1],[2.4,-1],[3.4,7],[-0.8,7.6]]); p.F(G[2]); [1.4,3.2,5].forEach(y=>p.rect(-1.4,y,3.6,0.8));
      p.F(B[2]); p.poly([[-9,-4],[-3,-4.6],[-3,1.4],[-8,2.6]]); p.F(B[1]); p.rect(-8.6,-4,5.4,2);
      // gatilho
      p.F(B[3]); p.rect(3,0.4,1,2.6); p.F(B[2]); p.rect(2,3,4.4,0.9);
      // corpo principal
      p.F(B[1]); p.poly([[-3.6,-5.6],[16,-5.6],[18,-3.6],[18,1.6],[-3.6,1.8]]);
      p.F(B[0]); p.rect(-2.6,-5.6,17.6,1.2); p.rect(0,-3.4,6,0.8);
      p.F(B[2]); p.rect(-3.6,0.6,21.6,1.2);
      // célula de energia
      p.F(A[2]); p.rect(6,-4.4,8.6,4.6); p.F(L[1]); p.rect(6.8,-3.6,7,3); p.F(L[0]); p.rect(7.2,-3.4,6.2,0.9); p.F(A[1]); [8.6,10.8].forEach(x=>p.rect(x,-4.4,0.9,4.6));
      // bobinas + emissor
      p.F(B[2]); p.rect(18,-3.4,6,3.6);
      p.F(A[1]); [18.6,20.6,22.6].forEach(x=>p.rect(x,-4.4,1.2,5.6)); p.F(A[0]); [18.6,20.6,22.6].forEach(x=>p.rect(x,-4.4,1.2,1));
      p.F(B[1]); p.rect(24,-3,1.6,2.8);
      p.F(L[1]); p.ell(25.6,-1.6,1.2,1.8); p.F(L[0]); p.rect(25.4,-2.6,0.8,1);
      // mira + cabo
      p.F(B[2]); p.rect(2,-8,6,2.4); p.F(L[1]); p.rect(6.6,-7.6,1.2,1.4); p.F(A[2]); p.cap(P2(-6,1.8),P2(1,3.6),1,1);
    } else {
      // empunhadura inclinada
      p.F(G[1]); p.poly([[-3.4,-0.6],[2,-0.6],[2.8,7.4],[-1.8,8]]);
      p.F(G[2]); [1.4,3.4,5.4].forEach(y=>p.rect(-1.8,y,3.6,0.9)); p.F(G[0]); p.rect(1.2,0,0.8,6.6);
      p.F(B[2]); p.rect(-2.6,7,4.4,1.2);
      // guarda-mato + gatilho
      p.F(B[2]); p.poly([[2,0.6],[7,0.6],[7,3.6],[5.8,3.6],[5.8,1.8],[2.4,1.8]]); p.F(B[3]); p.rect(3.2,0.8,1,2.2);
      // armação
      p.F(B[2]); p.rect(-3.6,-1.6,14,2.6);
      // ferrolho
      p.F(B[1]); p.poly([[-4.6,-5.4],[15.4,-5.4],[16,-4.6],[16,-1.4],[-4.6,-1.4]]);
      p.F(B[0]); p.rect(-4,-5.4,19,1); p.F(B[2]); [-3.4,-2,-0.6].forEach(x=>p.rect(x,-4.2,0.7,2.6));
      p.F(B[3]); p.rect(6,-3.6,4.4,1.2);
      // massa de mira / compensador por raridade
      p.F(A[1]); p.rect(14,-6.4,1.4,1.2); p.rect(-4.2,-6.4,1.6,1.2);
      if(tier!=='comum'){ p.F(A[1]); p.rect(16,-5.2,2,4); p.F(A[0]); p.rect(16,-5.2,2,1); }
      if(tier==='lunar'){ p.F(A[0]); [1.6,4.6,7.6,10.6].forEach(x=>p.rect(x,-3.4,1.2,0.8)); p.F(L[1]); p.ell(-0.4,3.4,1,1); }
      if(tier==='incomum'){ p.F(A[1]); p.rect(-2.6,2.2,4.6,1.6); }
      if(tier==='raro'){ p.F(A[0]); p.rect(2,-4.4,10,0.8); }
      p.F(B[3]); p.ell(16.2,-3.2,0.6,0.9);
    }
    p.id();
  }
  // posição da boca do cano no mundo
  function muzzle(kind,base,ang){ const m=(KINDS[kind]||KINDS.pistola).muzzle, c=Math.cos(ang), s=Math.sin(ang); return {x:base.x+m.x*c-m.y*s, y:base.y+m.x*s+m.y*c}; }
  return {KINDS,TIER,M,draw,muzzle};
})();

/* ===== shared/armas-icon ===== */
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

/* ===== shared/golpe-icons ===== */
/* GOLPES_ICON — ícones dos golpes especiais (moldura de habilidade + símbolo). Fonte de arte (editável). Build: npm run art */
// Contrato: icon(id, px=64) -> canvas px×px · IDS · SIZE = 32 unidades cruas (K = px/32, sem escala assada)
// Moldura chanfrada na cor do golpe (bisel claro em cima, escuro embaixo), fundo de explosão radial e o símbolo
// desenhado numa camada própria (com contorno escuro e rim) — mesmo kit dos coletáveis (ITEMS.KIT).
const GOLPES_ICON=(function(){
  const {compose,mix}=PIX;
  const SIZE=32, RIM='#a9c8f0';
  const RP=ITEMS.RAMPS, STEEL=RP.STEEL, CRY=RP.CRY, YEL=RP.YEL, WH=RP.WH, BARK=RP.BARK, ROPE=RP.ROPE, SKIN=RP.SKIN, GRASS=RP.GRASS;
  const COR={meia_lua:'#ffd23f',grito_frevo:'#ff5fa8',benzedura:'#7dff9a',mao_trovao:'#7af0ff',tiro_laser:'#ff4a5a',corte_lunar:'#ff3b55',baque_virado:'#ffa040',esfera_espiral:'#b98cff'};
  const IDS=Object.keys(COR);
  const R=(x,y,w,h)=>[[x,y],[x+w,y],[x+w,y+h],[x,y+h]];
  // rampa de 6 tons a partir da cor do golpe (luz quente, sombra roxa)
  const ramp6=h=>[mix(h,'#ffffff',0.62),mix(h,'#fff2cc',0.3),h,mix(h,'#3b2c63',0.35),mix(h,'#1c1233',0.58),mix(h,'#1c1233',0.78)];
  const cham=(x0,y0,x1,y1,c)=>[[x0+c,y0],[x1-c,y0],[x1,y0+c],[x1,y1-c],[x1-c,y1],[x0+c,y1],[x0,y1-c],[x0,y0+c]];
  // polígono de crescente: arco externo (r) e interno (r - espessura que cresce até o meio)
  function crescent(cx,cy,r,a0,a1,w,n){ n=n||18; const o=[], ins=[];
    for(let i=0;i<=n;i++){ const t=i/n, a=a0+(a1-a0)*t, th=w*Math.sin(Math.PI*t); o.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]); ins.push([cx+Math.cos(a)*(r-th),cy+Math.sin(a)*(r-th)]); }
    return o.concat(ins.reverse()); }

  // ---------------- moldura ----------------
  function frameArt(e,id){
    const P=ramp6(COR[id]);
    const outer=cham(0.5,0.5,31.5,31.5,5), ring=cham(3,3,29,29,3.6), inner=cham(3.8,3.8,28.2,28.2,3);
    e.band(outer,[P[0],P[1],P[2],P[3],P[4]],[1,1.4,2,1.4,1],'y',0.5,31.5);
    // bisel: diagonal clara no canto de cima-esquerda, escura embaixo-direita
    e.within(outer,()=>{ e.poly([[0,0],[14,0],[0,14]],P[0]); e.poly([[32,32],[18,32],[32,18]],P[4]); });
    e.poly(ring,'#170b1c');
    const bg=['#3a2458',mix(COR[id],'#2a1640',0.62),mix(COR[id],'#1c1233',0.8),'#1a1030','#120a1e'];
    e.band(inner,[bg[3],bg[2],bg[1],bg[2],bg[3],bg[4]],[1,1.4,2,1.4,1,0.8],'y',3.8,28.2);
    e.within(inner,()=>{
      // explosão radial atrás do símbolo
      const burst=(r0,r1,n,rot,k)=>{ const p=[]; for(let i=0;i<n*2;i++){ const a=rot+i*Math.PI/n, r=i%2?r0:r1; p.push([16+Math.cos(a)*r,16+Math.sin(a)*r]); } e.poly(p,k); };
      burst(4.6,16,8,0.2,mix(COR[id],'#1c1233',0.66)); burst(3,11,8,0.59,mix(COR[id],'#1c1233',0.48)); burst(2.4,7,8,0.2,mix(COR[id],'#1c1233',0.3));
      e.ell(16,16,3.2,3.2,mix(COR[id],'#1c1233',0.1)); e.ell(16,16,1.8,1.8,mix(COR[id],'#ffffff',0.55)); // núcleo de energia
      // reflexo de vidro no topo
      e.poly([[3.8,3.8],[28.2,3.8],[28.2,6.4],[3.8,9]],mix('#ffffff','#3a2458',0.82));
    });
    // rebites nos chanfros + brilho do aro
    [[4.4,4.4],[26.6,4.4],[4.4,26.6],[26.6,26.6]].forEach(([x,y],i)=>{ e.rect(x,y,1.2,1.2,i===3?P[5]:P[0]); });
    e.rect(6,1.2,10,0.8,'#ffffff'); e.rect(1.2,6,0.8,7,P[0]);
  }

  // ---------------- símbolos ----------------
  const S={
    meia_lua(e){ // chute giratório de capoeira: rastro em meia-lua + pé descalço
      const Y=['#fffbe0','#fff2a8','#ffd23f','#e8a020','#b06a10','#6a3a0a'];
      const cr=crescent(16,17,10.6,Math.PI*0.72,Math.PI*1.96,4.4,22);
      e.band(cr,[Y[0],Y[1],Y[2],Y[3],Y[4]],[1,1.4,2,1.6,1],'y',6,28);
      e.within(cr,()=>{ for(let k=0;k<3;k++) e.arc(16,17,10.2-k*1.6,10.2-k*1.6,Math.PI*(1.02+k*0.1),Math.PI*1.7,0.6,k?Y[1]:'#ffffff'); });
      // canela (calça branca de abadá) + pé
      e.c.save(); e.c.translate(25.6,9.4); e.c.rotate(0.5);
      e.band(R(-3,-9,6,9),[WH[0],WH[1],WH[2],WH[3]],[1,2,2,1],'x',-3,3);
      e.rect(-3,-1.4,6,1.2,WH[4]);
      // pé descalço em ponta (calcanhar, peito do pé, dedos) com volume
      const foot=e.smooth([[2.6,-0.4],[3,2.4],[1.4,4.4],[-2.6,4.8],[-6.6,4.6],[-8.2,3.4],[-7.4,1.6],[-4,0.6],[-0.6,-0.6]],4);
      e.band(foot,[SKIN[0],SKIN[1],SKIN[2],SKIN[3],SKIN[4]],[1,1.4,1.6,1.2,1],'y',-0.6,4.8);
      e.within(foot,()=>{ e.ell(1.2,1.4,1.2,1,SKIN[0]); e.rect(-6,3.9,7,0.9,SKIN[4]); });
      for(let k=0;k<4;k++){ const tx=-7.8+k*0.5, ty=1.8+k*0.75; e.ell(tx,ty,1,0.7,SKIN[k%2?2:1]); e.rect(tx-0.6,ty-0.2,0.5,0.3,'#fff4e8'); }
      e.rect(-3.4,0.9,3.6,0.5,SKIN[0]);
      e.c.restore();
      // faíscas de impacto
      e.poly([[5,12],[6,14.4],[8.4,15],[6,15.6],[5,18],[4,15.6],[1.6,15],[4,14.4]],'#ffffff');
    },
    grito_frevo(e){ // sombrinha de frevo + ondas do grito + confete
      const segs=['#ff3a4a','#ffd23f','#3ad06a','#3a8af0','#ff5fa8'], cx=14.4, cy=15.6, r=10;
      for(let i=0;i<5;i++){ const a0=Math.PI+i*Math.PI/5, a1=a0+Math.PI/5, c=segs[i];
        const sl=()=>{ e.c.beginPath(); e.c.moveTo(cx,cy-0.2); e.c.arc(cx,cy,r,a0,a1); e.c.closePath(); };
        e.band(sl,[mix(c,'#ffffff',0.45),c,mix(c,'#3b2c63',0.35)],[1,2,1.2],'y',cy-r,cy+1); }
      // borda em gomos
      for(let i=0;i<5;i++){ const a=Math.PI+(i+0.5)*Math.PI/5; e.ell(cx+Math.cos(a)*(r-0.4),cy+Math.sin(a)*(r-0.4)+0.6,2.4,1.1,mix(segs[i],'#3b2c63',0.45),a+Math.PI/2); }
      e.arc(cx,cy,r-1.4,r-1.4,Math.PI*1.12,Math.PI*1.5,0.7,'#ffffff');
      e.ell(cx,cy-r+0.2,1,1,STEEL[1]);
      // cabo
      e.ln(cx,cy,cx,26,1.3,STEEL[3]); e.ln(cx-0.4,cy,cx-0.4,26,0.5,STEEL[0]);
      e.arc(cx-2,26,2,1.8,0,Math.PI,1.3,'#c83a4a');
      // ondas do grito
      [[3.4,'#ffffff'],[6,'#ffb8d8'],[8.6,'#ff5fa8']].forEach(([rr,k])=>e.arc(22,20,rr,rr*1.1,-0.9,0.9,1.1,k));
      // confete
      [[5,24,'#ffd23f'],[8,27,'#3a8af0'],[25,8,'#3ad06a'],[27.4,12.4,'#ffd23f'],[4,8,'#ff3a4a'],[23,27,'#ff5fa8']].forEach(([x,y,k])=>e.poly([[x,y-1],[x+1.2,y],[x,y+1],[x-1.2,y]],k));
    },
    benzedura(e){ // ramo de arruda + cruzes de cura brilhando
      const G=GRASS;
      e.ln(8,27,21,6,1.2,'#3a6a2a'); e.ln(8.4,27,21.2,6.4,0.5,'#8ac860');
      const leaf=(x,y,a,s)=>{ e.ell(x+0.4,y+0.5,2.6*s,1.4*s,G[4],a); e.band(e.E(x,y,2.6*s,1.4*s,a),[G[0],G[1],G[2],G[3]],[1,1.4,1.4,1],'y',y-1.6*s,y+1.6*s); e.ln(x-Math.cos(a)*2*s,y-Math.sin(a)*2*s,x+Math.cos(a)*2*s,y+Math.sin(a)*2*s,0.4,G[3]); };
      for(let k=0;k<7;k++){ const t=0.12+k*0.12, x=8+13*t, y=27-21*t, side=k%2?1:-1, s=1.1-k*0.06;
        leaf(x+side*2.8,y+side*0.4,side>0?-0.3:0.5+Math.PI,s); }
      leaf(21.6,5.2,-1.1,0.9);
      // cruzes de luz verde
      const plus=(x,y,s)=>{ e.rect(x-0.7*s,y-2.2*s,1.4*s,4.4*s,'#2e8040'); e.rect(x-2.2*s,y-0.7*s,4.4*s,1.4*s,'#2e8040');
        e.rect(x-0.5*s,y-2*s,1*s,4*s,'#c8ffd0'); e.rect(x-2*s,y-0.5*s,4*s,1*s,'#c8ffd0'); e.rect(x-0.4*s,y-0.4*s,0.8*s,0.8*s,'#ffffff'); };
      plus(24.4,17.4,1.4); plus(7,10,1); plus(25,7,0.7);
      e.arc(16,16,11,11,Math.PI*1.1,Math.PI*1.45,0.8,'#c8ffd0');
    },
    mao_trovao(e){ // punho fechado de verdade (dedos dobrados, polegar por cima, volume) explodindo em raios com núcleo claro
      const C=['#ffffff','#d8fcff','#7af0ff','#2ab0d8','#10607a','#0a3a52'], SK0=SKIN;
      // explosão elétrica atrás: estrela serrilhada em camadas até o núcleo branco
      const burst=(cx,cy,r0,r1,n,rot,k)=>{ const p=[]; for(let i=0;i<n*2;i++){ const a=rot+i*Math.PI/n, r=i%2?r0:r1*(0.82+0.18*((i*7)%5)/4); p.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]); } e.poly(p,k); };
      burst(18,13.4,7,15.5,11,0.1,C[4]); burst(18,13.4,6,13,11,0.38,C[3]); burst(18,13.4,5,10.6,9,0.2,C[2]); burst(18,13.4,4.4,9,9,0.55,C[1]); e.ell(17.4,13.4,10.6,10,C[2]); e.ell(17.4,13.4,9.6,9,C[1]); e.ell(17.8,12.8,8.4,7.8,C[0]);
      // raios saindo do punho pra todos os lados (contorno escuro, corpo ciano, alma branca) com galhos
      const bolt=(pts,w)=>{ for(let i=0;i<pts.length-1;i++){ const [x0,y0]=pts[i],[x1,y1]=pts[i+1]; e.ln(x0,y0,x1,y1,w+1.1,C[4]); } for(let i=0;i<pts.length-1;i++){ const [x0,y0]=pts[i],[x1,y1]=pts[i+1]; e.ln(x0,y0,x1,y1,w,C[2]); } for(let i=0;i<pts.length-1;i++){ const [x0,y0]=pts[i],[x1,y1]=pts[i+1]; e.ln(x0,y0,x1,y1,Math.max(0.45,w*0.42),C[0]); } };
      bolt([[13,8],[11.4,5.6],[12.6,4.6],[10,1.5]],1.2); bolt([[20,7],[21.4,4.4],[20.2,3.6],[23,0.5]],1.1);
      bolt([[24,12],[27,11.2],[26.4,9.6],[31,8]],1.2); bolt([[24.4,17],[27.4,18.6],[26.4,20],[30.6,22.4]],1);
      bolt([[9.6,12],[6.6,11],[7.4,9.6],[3,8.4]],1); bolt([[21,21],[22.4,24],[21,25],[23.4,29]],1);
      bolt([[26.4,9.6],[28.6,12.6]],0.6); bolt([[7.4,9.6],[6.4,6.2]],0.6);
      // antebraço com faixa de pano subindo do canto de baixo
      e.c.save(); e.c.translate(13.2,20.4); e.c.rotate(0.45);
      e.band(R(-3.4,-1.5,6.8,4),[SK0[0],SK0[1],SK0[2],SK0[3]],[1,1.6,1.6,1],'x',-3.4,3.4); // pulso
      e.band(R(-4.2,2,8.4,14),[WH[0],WH[1],WH[2],WH[3],WH[4]],[1,1.6,2,1.6,1],'x',-4.2,4.2);
      for(let k=0;k<4;k++) e.ln(-4.2,3.6+k*2.6,4.2,2.4+k*2.6,0.6,WH[4]);
      e.rect(-4.2,2,8.4,0.8,WH[0]); e.rect(2.8,2,1.4,14,C[1]);
      e.c.restore();
      // punho (3/4, socando pra cima-direita)
      e.c.save(); e.c.translate(17.4,13.2); e.c.rotate(0.45);
      const SK=SKIN;
      // dorso da mão / palma (bloco com volume: luz à esquerda, sombra à direita e embaixo)
      e.band(e.smooth([[-6.6,-1],[6.4,-1.6],[7.4,3],[5.4,7.4],[-3.6,7.6],[-7.2,4]],4),[SK[1],SK[2],SK[2],SK[3],SK[4]],[1.2,1.6,1.4,1.2,1],'x',-7.2,7.4);
      // 4 dedos dobrados: falange de cima (nós) em arco, com vãos escuros entre eles
      const FX=[-6.1,-3,0.1,3.2], FT=[-5.4,-6.4,-6.2,-5.2];
      FX.forEach((x,i)=>{ const w=3.1, t=FT[i];
        e.band(e.smooth([[x,t+1.2],[x+w*0.5,t],[x+w,t+1.2],[x+w,1],[x,1]],3),[SK[0],SK[1],SK[2],SK[3]],[1,1.4,1.6,1],'y',t,1);
        e.ell(x+w*0.48,t+1.1,0.9,0.55,'#fff4e8'); // brilho do nó
        e.rect(x+w-0.45,t+1.4,0.45,1.2-t,SK[4]); });
      // segunda falange (pontas dobradas pra baixo, viradas pra frente)
      FX.forEach((x,i)=>{ const w=3.1;
        e.band(e.smooth([[x+0.1,0.6],[x+w-0.1,0.6],[x+w-0.3,3.6],[x+w*0.5,4.3],[x+0.3,3.6]],3),[SK[1],SK[2],SK[3]],[1,1.6,1.2],'y',0.6,4.3);
        e.rect(x+0.4,0.6,w-0.8,0.5,SK[4]); e.rect(x+w-0.4,0.8,0.4,3,SK[4]); });
      // polegar dobrado por cima das pontas, com unha
      e.band(e.E(-1.8,4.4,4.6,1.9,-0.18),[SK[0],SK[1],SK[2],SK[3]],[1,1.4,1.4,1],'y',2.4,6.4);
      e.ell(2.2,3.6,1.3,1,'#ffd8c8',-0.18); e.ell(2.4,3.3,0.7,0.4,'#ffffff',-0.18);
      e.ln(-5.6,5.6,0.6,5,0.45,SK[4]);
      // luz ciana do raio batendo no lado direito e no topo do punho
      e.rect(6.6,-1,0.7,4.6,C[1]); FX.forEach((x,i)=>e.rect(x+0.6,FT[i]+0.25,1.6,0.45,C[1]));
      e.c.restore();
      // arcos elétricos cruzando por cima do punho (envolvendo)
      const arcZ=(pts)=>{ for(let i=0;i<pts.length-1;i++){ const [x0,y0]=pts[i],[x1,y1]=pts[i+1]; e.ln(x0,y0,x1,y1,0.9,C[2]); e.ln(x0,y0,x1,y1,0.4,C[0]); } };
      arcZ([[9,9.4],[11.6,10.6],[11,12.6],[13.4,14.2],[12.4,16.4],[15,18.6]]);
      // faíscas
      [[5.6,25.4],[27,5.6],[4.8,16.6],[28,26]].forEach(([x,y],i)=>{ const k=i%2?C[1]:C[0]; e.rect(x-1.4,y-0.3,2.8,0.7,k); e.rect(x-0.3,y-1.4,0.7,2.8,k); e.rect(x-0.3,y-0.3,0.7,0.7,'#ffffff'); });
    },
    tiro_laser(e){ // emissor + feixe largo atravessando a moldura
      e.c.save(); e.c.translate(16,16); e.c.rotate(-0.4);
      const L=[mix('#ff4a5a','#1c1233',0.5),'#c81e36','#ff4a5a','#ff9aa8','#ffe4e8','#ffffff'];
      e.rect(-6,-5.6,26,11.2,L[0]); e.rect(-6,-4.4,26,8.8,L[1]); e.rect(-6,-3.2,26,6.4,L[2]); e.rect(-6,-2,26,4,L[3]); e.rect(-6,-1,26,2,L[5]);
      // anéis de energia em volta do feixe
      [4,12].forEach((x,i)=>{ e.arc(x,0,1.4,7-i*0.6,-1.4,1.4,0.8,L[4]); });
      // emissor (cano de laser)
      e.band(R(-15,-4.4,9.6,8.8),[STEEL[0],STEEL[1],STEEL[2],STEEL[3],STEEL[4]],[1,1,2,2,1],'y',-4.4,4.4);
      [-13,-10.6,-8.2].forEach((x)=>{ e.rect(x,-5.2,1.2,10.4,'#ff6a7a'); e.rect(x,-5.2,1.2,1.2,'#ffd0d6'); });
      e.ell(-5.4,0,2,5,L[3]); e.ell(-5,0,1.2,3.4,'#ffffff');
      e.c.restore();
      // brilho na boca
      e.poly([[9,19.6],[10.4,15],[12,19],[16.6,20],[12,21.2],[10.4,25.6],[9,21.2],[4.6,20.2]],'#ffffff');
      [[22,6],[27,13],[6,9]].forEach(([x,y])=>e.rect(x,y,1,1,'#ffd0d6'));
    },
    corte_lunar(e){ // onda crescente vermelha correndo pra direita, com linhas de velocidade
      for(let k=0;k<6;k++){ const y=6.4+k*3.8, w=4+((k*7)%5)*1.4; e.rect(4.6,y,w,0.8,k%2?'#ff8aa0':'#ffd0dc'); }
      const cr=crescent(8,16,15,-1.0,1.0,8.4,24);
      e.band(cr,[CRY[0],CRY[1],CRY[2],CRY[3],CRY[4],CRY[5]],[0.6,1,1.4,2,1.4,1],'x',14,23.4);
      e.within(cr,()=>{ e.arc(8,16,14,14,-0.8,0.8,1.1,'#ffffff'); e.arc(8,16,12,12,-0.5,0.5,0.7,CRY[0]); e.arc(8,16,9,9,-0.6,0.6,0.8,CRY[5]); });
      // estilhaços
      [[26,6,1.4],[27.6,25,1.2],[20,28,0.9]].forEach(([x,y,s])=>e.poly([[x,y-s*1.6],[x+s,y],[x,y+s*1.6],[x-s,y]],CRY[1]));
    },
    baque_virado(e){ // alfaia de maracatu + baquetas + onda de choque no chão
      const O=['#fff0d0','#ffc070','#ffa040','#d86a1a','#8a3a0e'];
      // onda de choque
      e.arc(16,26.4,13,3,0,7,1.1,O[3]); e.arc(16,26.4,10,2.2,0,7,0.9,O[1]); e.arc(16,26.2,13,3,3.6,5.8,0.7,'#ffffff');
      // corpo de madeira
      const body=R(8.6,13.6,14.8,10.8);
      e.ell(16,24.4,7.4,2.2,BARK[4]);
      e.band(body,[BARK[0],BARK[1],BARK[2],BARK[3],BARK[4]],[1,1.4,2,1.6,1],'x',8.6,23.4);
      // aros vermelhos + cordas em zigue-zague
      e.within(body,()=>{
        for(let k=0;k<6;k++){ const x=9.4+k*2.6; e.ln(x,15.2,x+1.3,23,0.7,ROPE[1]); e.ln(x+1.3,15.2,x,23,0.7,ROPE[2]); }
        e.rect(8,22.4,16,1.8,'#c82838'); e.rect(8,22.4,16,0.6,'#ff6a70');
      });
      e.band(e.E(16,13.6,7.4,2.4),['#ff6a70','#c82838','#7a1020'],[1,2,1],'y',11.2,16);
      e.ell(16,13.2,6.4,1.7,'#f4e4c4'); e.ell(15.4,12.9,4.6,1.1,'#fff8e8');
      // baquetas cruzadas
      const stick=(x0,y0,x1,y1)=>{ e.ln(x0,y0,x1,y1,1.4,BARK[3]); e.ln(x0-0.3,y0-0.3,x1-0.3,y1-0.3,0.5,BARK[0]); e.ell(x1,y1,1.8,1.6,'#e8d4a8'); e.rect(x1-0.8,y1-1,1,0.6,'#ffffff'); };
      stick(26,3,17,11.6); stick(6,3,14.4,11.4);
      // impacto no couro
      e.poly([[16,8.4],[16.8,10.6],[19,11],[16.8,11.6],[16,13.6],[15.2,11.6],[13,11],[15.2,10.6]],'#ffffff');
      [[5,18,O[1]],[27,18,O[2]],[4,12,O[0]],[28,11,O[1]]].forEach(([x,y,k])=>e.rect(x,y,1.2,1.2,k));
    },
    esfera_espiral(e){ // esfera de energia girando com espiral e anéis
      const V=['#ffffff','#eadcff','#cfb0ff','#b98cff','#8a5ae0','#5a32a8','#341a6a'];
      e.ell(16,16,9.6,9.6,V[6]);
      e.ell(15.6,15.6,8.8,8.8,V[5]); e.ell(15,15,7.6,7.6,V[4]); e.ell(14.4,14.4,6,6,V[3]); e.ell(13.8,13.8,4.2,4.2,V[2]); e.ell(13.2,13.2,2.4,2.4,V[1]);
      // espiral
      const pts=[]; for(let i=0;i<=40;i++){ const t=i/40, a=t*Math.PI*3.4, r=0.6+t*8; pts.push([16+Math.cos(a)*r,16+Math.sin(a)*r]); }
      for(let i=0;i<pts.length-1;i++) e.ln(pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1],0.6+i*0.02,i<20?V[0]:V[1]);
      e.ell(12.6,12,1.2,1,'#ffffff');
      // anéis orbitando
      e.arc(16,16,13,4,0,7,1,V[2]); e.arc(16,16,13,4,0.4,2.6,1,V[0]);
      e.c.save(); e.c.translate(16,16); e.c.rotate(1.1); e.arc(0,0,13,3.4,3.4,6,0.8,V[3]); e.c.restore();
      [[4,6],[27,24],[26,6],[6,26]].forEach(([x,y],i)=>{ e.rect(x-1,y,2,0.6,V[i%2?1:0]); e.rect(x-0.3,y-0.7,0.6,2,V[i%2?1:0]); });
    },
  };

  const cache=new Map();
  function icon(id,px=64){
    if(!S[id]) id='meia_lua';
    const key=id+'|'+px; if(cache.has(key)) return cache.get(key);
    const old=PIX.getK(), K=px/SIZE;
    let fr, sy;
    try{
      PIX.setK(K);
      const mk=(fn,noRim)=>compose({FW:px,FH:px,GROUND:px+16,step:5,rim:RIM,M:{},
        parts:[{noRim,draw:(c,u)=>{ c.setTransform(K,0,0,K,0,0); fn(ITEMS.KIT(c,u)); c.setTransform(1,0,0,1,0,0); }}]});
      fr=mk(e=>frameArt(e,id),true);
      sy=mk(e=>{ e.c.save(); e.c.beginPath(); e.c.rect(4.6,4.6,22.8,22.8); e.c.clip(); S[id](e); e.c.restore(); },false);
    } finally { PIX.setK(old); }
    const out=document.createElement('canvas'); out.width=out.height=px;
    const g=out.getContext('2d'); g.imageSmoothingEnabled=false;
    g.drawImage(fr,0,0);
    // símbolo recortado na janela (o contorno dele fica por dentro do aro)
    g.save(); const w=Math.round(4*K); g.beginPath(); g.rect(w,w,px-2*w,px-2*w); g.clip(); g.drawImage(sy,0,0); g.restore();
    ITEMS.STAR(g,K,24.6,7.4,1.6,'#fff2cc','#ffffff');
    cache.set(key,out); return out;
  }
  return {IDS,COR,SIZE,icon};
})();

/* ===== shared/menu-icons ===== */
/* MENU_ICON — ícones do dock do abrigo (Construir, Reparos, Armas, Golpes, Recrutas, Pets, Bestiário, Mercado, Diário,
   Configurações, Expedição, Coletar). Fonte de arte (editável). Build: npm run art */
// Contrato: icon(id, px=40, state='n'|'h') -> canvas px×px · IDS · ACC (cor de destaque por ícone) · SIZE = 32 unidades
// Cada símbolo é uma pilha de camadas; cada camada passa pelo PIX.compose (contorno escuro + rim de luz à esquerda) e a
// de cima cobre o contorno da de baixo — é isso que separa martelo/tábua, cartas, mapa/lua etc. com linha escura.
// Estado 'h' (destacado): tons puxados pra luz e um aro de 1 px na cor de destaque do ícone.
const MENU_ICON=(function(){
  const {compose,mix,OUTLINE}=PIX;
  const SIZE=32, RIM='#a9c8f0';
  const RP=ITEMS.RAMPS, ST=RP.STEEL, BK=RP.BARK, WH=RP.WH, RD=RP.RED, GD=RP.GOLD, YL=RP.YEL, RO=RP.ROPE, SK=RP.SKIN, GR=RP.GRASS, CR=RP.CRY, RU=RP.RUST;
  const ACC={build:'#ffd23f',repair:'#ff5a6e',weapons:'#c8d8ff',golpes:'#ffa040',recrutas:'#7ad0c8',pets:'#f2b468',bestiary:'#b98cff',
    market:'#ff6a70',drawer:'#e8b070',settings:'#a9c8f0',exp:'#ffd23f',exp_lua:'#ff3b55',collect:'#7dff9a',
    // conquistas + lembranças (souvenirs) das cidades
    conquistas:'#ffd23f',lb_galo:'#ff8a30',lb_sombrinha:'#ffd24a',lb_torre:'#e27c3a',lb_boneco:'#7ad0c8',lb_azulejo:'#4a8ad0',
    lb_sino:'#d89a20',lb_fitinha:'#ff5a78',lb_elevador:'#c8d8ff',lb_berimbau:'#b0703a',lb_garrafada:'#5ab040',lb_mercado:'#949eba',lb_cuia:'#d49c22'};
  const IDS=Object.keys(ACC);
  const R=(x,y,w,h)=>[[x,y],[x+w,y],[x+w,y+h],[x,y+h]];
  const DK='#2a1d40';
  const sp=(e,x,y,s,k1,k2)=>{ e.poly([[x,y-s*1.8],[x+s*0.5,y-s*0.5],[x+s*1.8,y],[x+s*0.5,y+s*0.5],[x,y+s*1.8],[x-s*0.5,y+s*0.5],[x-s*1.8,y],[x-s*0.5,y-s*0.5]],k1); e.rect(x-s*0.35,y-s*0.35,s*0.7,s*0.7,k2||'#ffffff'); };
  const ball=(e,x,y,r,P)=>{ e.band(e.E(x,y,r,r),[P[0],P[1],P[2],P[3]],[0.7,1.2,1.4,1],'y',y-r,y+r); e.ell(x-r*0.35,y-r*0.4,r*0.32,r*0.24,'#ffffff'); };
  // estrela de 5 pontas · união de elipses (um path só, pra band/within) · fita ondulada com torção sombreada
  const star=(e,x,y,r,k,ri)=>{ const p=[]; for(let i=0;i<10;i++){ const a=-Math.PI/2+i*Math.PI/5, q=i%2?r*(ri||0.45):r; p.push([x+Math.cos(a)*q,y+Math.sin(a)*q]); } e.poly(p,k); };
  const U=(e,L)=>()=>{ const c=e.c; c.beginPath(); L.forEach(([x,y,rx,ry,r])=>{ r=r||0; c.moveTo(x+rx*Math.cos(r),y+rx*Math.sin(r)); c.ellipse(x,y,rx,ry,r,0,Math.PI*2); }); };
  const BL=['#b8dcff','#4a8ad0','#2a5aa0','#1a3470'], BZ=['#fff0c0','#f6c868','#d89a20','#a06a14','#643e0c'];
  function fita(e,x0,y0,x1,y1,A,ph,w,P,txt){
    const N=16, pt=(t)=>[x0+(x1-x0)*t+Math.sin(ph+t*Math.PI*2.2)*A*t, y0+(y1-y0)*t], L=[], Rr=[], C=[];
    for(let i=0;i<=N;i++){ const t=i/N, p=pt(t), q=pt(t+0.01), dx=q[0]-p[0], dy=q[1]-p[1], d=Math.hypot(dx,dy)||1, nx=-dy/d*w/2, ny=dx/d*w/2;
      L.push([p[0]+nx,p[1]+ny]); Rr.push([p[0]-nx,p[1]-ny]); C.push(p); }
    const sh=L.concat([pt(0.92)],Rr.slice().reverse());
    e.within(sh,()=>{ for(let i=0;i<N;i++){ const f=Math.cos(ph+(i+0.5)/N*Math.PI*2.2), k=f>0.45?P[0]:f>-0.15?P[1]:f>-0.65?P[2]:P[3], j=Math.min(N,i+2);
      e.poly([L[i],L[j],Rr[j],Rr[i]],k); }
      if(txt) for(let i=4;i<N-2;i+=1){ if(i%3===2) continue; const p=C[i]; e.rect(p[0]-0.45,p[1]-0.3,0.9,0.7,'#ffffff'); } });
  }

  // ---------------- símbolos (cada um = lista de camadas, de trás pra frente) ----------------
  const S={
    build:[ // tábua com pregos + martelo de carpinteiro por cima
      (e)=>{ e.c.save(); e.c.translate(16,24.4); e.c.rotate(-0.18);
        const pl=R(-14,-3.6,28,7.2);
        e.band(pl,[BK[0],BK[1],BK[2],BK[3]],[0.8,1.6,2,1],'y',-3.6,3.6);
        e.within(pl,()=>{ e.ln(-12,-0.6,-3,-0.9,0.5,BK[3]); e.ln(1,1.3,11,1.1,0.5,BK[3]); e.ell(5,-1.2,1.3,0.7,BK[3]); e.ell(5,-1.3,0.6,0.3,BK[4]);
          e.rect(-14,-3.6,28,0.8,BK[0]); e.rect(12.4,-3.6,1.6,7.2,BK[3]); e.rect(-14,2.6,28,1,BK[4]); });
        [-10,9].forEach((x)=>{ e.ell(x,0.2,1.1,1.1,ST[3]); e.ell(x-0.2,0,0.8,0.8,ST[1]); e.rect(x-0.5,-0.4,0.5,0.4,'#ffffff'); });
        e.c.restore(); },
      (e)=>{ e.c.save(); e.c.translate(17.6,12.4); e.c.rotate(0.62);
        e.band(R(-1.7,-1,3.4,17.6),[BK[0],BK[1],BK[2],BK[3]],[0.8,1.2,1.4,1],'x',-1.7,1.7);
        e.band(R(-2,9.6,4,7),[RD[0],RD[1],RD[2],RD[3]],[0.7,1.2,1.4,1],'x',-2,2);
        for(let k=0;k<4;k++) e.ln(-2,10.8+k*1.6,2,10+k*1.6,0.5,RD[3]);
        const hd=[[-7.6,-5.8],[5.4,-5.8],[6.8,-4.4],[6.8,-1.8],[5.4,-0.4],[-7.6,-0.4]];
        e.band(hd,[ST[0],ST[1],ST[2],ST[3],ST[4]],[0.7,1,1.4,1.2,1],'y',-5.8,-0.4);
        e.poly([[-7.6,-5.8],[-11.6,-8],[-10.6,-5.2],[-7.6,-2.4]],ST[3]); e.ln(-7.6,-5.4,-11,-7.4,0.5,ST[1]);
        e.rect(5.6,-5.8,1.2,5.4,ST[1]); e.rect(-2.3,-0.9,4.6,1.6,ST[4]); e.rect(-6.8,-5.2,11,0.7,'#ffffff');
        e.c.restore();
        sp(e,27,5.4,1.3,YL[0]); sp(e,23.4,2.8,0.7,YL[1]); },
    ],
    repair:[ // porca sextavada + chave de boca com cabo emborrachado
      (e)=>{ const cx=24.4, cy=24.2, r=4.6, hx=[]; for(let i=0;i<6;i++){ const a=Math.PI/6+i*Math.PI/3; hx.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]); }
        e.band(hx,[GD[1],GD[2],GD[3],GD[4]],[0.8,1.2,1.4,1],'y',cy-r,cy+r); e.ell(cx,cy,1.8,1.8,GD[5]); e.arc(cx,cy,1.8,1.8,Math.PI*0.1,Math.PI*0.9,0.6,GD[1]);
        e.ln(hx[3][0],hx[3][1],hx[4][0],hx[4][1],0.7,GD[0]); },
      (e)=>{ e.c.save(); e.c.translate(14.6,17.2); e.c.rotate(-Math.PI/4);
        e.band(R(-13,-2.2,19,4.4),[ST[0],ST[1],ST[2],ST[3],ST[4]],[0.6,1,1.4,1,0.8],'y',-2.2,2.2);
        e.band(R(-13.8,-2.7,8.6,5.4),[RD[0],RD[1],RD[2],RD[3]],[0.6,1.2,1.6,1],'y',-2.7,2.7);
        for(let k=0;k<3;k++) e.rect(-12.4+k*2.4,-2.7,0.6,5.4,RD[3]);
        e.band(e.E(9,0,6,6),[ST[0],ST[1],ST[2],ST[3],ST[4]],[0.8,1.2,1.6,1.2,1],'y',-6,6);
        e.arc(9,0,5,5,Math.PI*1.05,Math.PI*1.5,0.8,'#ffffff'); e.ln(-4,-1.5,5,-1.5,0.6,'#ffffff');
        e.cut(()=>{ e.c.fillRect(9,-2.4,9,4.8); });
        e.rect(8.2,-2.4,0.8,4.8,ST[4]); e.ell(-12,0,0.9,0.9,RD[3]);
        e.c.restore();
        sp(e,7.4,7,1.1,YL[0]); },
    ],
    weapons:[ // taco cravejado na diagonal + pistola na frente
      (e)=>{ e.c.save(); e.c.translate(15,15.4); e.c.rotate(-0.8);
        e.ell(-14.6,0,1.3,1.9,BK[3]);
        const bat=[[-14,-1.4],[-4,-1.5],[4,-3.2],[12,-4.2],[13.8,-2.9],[13.8,2.9],[12,4.2],[4,3.2],[-4,1.5],[-14,1.4]];
        e.band(bat,[BK[0],BK[1],BK[2],BK[3],BK[4]],[0.6,1,1.4,1.2,1],'y',-4.2,4.2);
        e.band(R(-13.4,-1.8,6.4,3.6),[WH[1],WH[2],WH[3]],[1,1.4,1],'y',-1.8,1.8);
        for(let k=0;k<4;k++) e.ln(-13+k*1.6,-1.4,-12.2+k*1.6,1.4,0.4,WH[4]);
        e.ln(-3,-0.6,11,-2.2,0.6,BK[0]);
        [[6,-1],[9.6,1],[12,-1]].forEach(([x,s])=>{ e.ln(x,s*3.2,x+0.6,s*6,0.8,ST[2]); e.rect(x+0.2,s*5.8-0.4,0.8,0.8,ST[0]); });
        e.c.restore(); },
      (e)=>{ e.c.save(); e.c.translate(20.4,22); e.c.rotate(-0.12);
        e.band(R(-7.6,-4.6,14.6,4.6),[ST[0],ST[1],ST[2],ST[3],ST[4]],[0.6,1,1.4,1.2,1],'y',-4.6,0);
        e.rect(7,-4,1.4,2.6,ST[3]); for(let k=0;k<3;k++) e.rect(-6.4+k*1.3,-4.2,0.5,2.4,ST[3]);
        e.rect(-7.6,-4.6,14.6,0.7,'#ffffff');
        e.band([[-6.8,0],[-2,0],[-3.2,7.4],[-8.2,7.4]],[BK[1],BK[2],BK[3],BK[4]],[0.8,1.2,1.4,1],'x',-8.2,-2);
        for(let k=0;k<3;k++) e.ln(-7.4,2+k*1.6,-3.6,1.6+k*1.6,0.4,BK[4]);
        e.arc(-0.6,0.4,1.8,1.8,0,Math.PI,0.8,ST[3]); e.rect(-1.2,0,0.7,1.6,ST[4]);
        e.c.restore(); },
    ],
    golpes:[ // rastro de velocidade + estouro de impacto, punho por cima
      (e)=>{ const A=['#5a2a1a','#c85a20','#ffa040','#ffd890'];
        [[9.6,1.6,11],[13.6,0.6,12],[17.6,1.2,12],[21.6,2.6,11]].forEach(([y,x0,x1])=>{ e.band([[x0,y-0.8],[x1,y-1.6],[x1,y+1.6],[x0,y+0.8]],A,[1,1.2,1.4,1.2],'x',x0,x1); });
        const b=[]; for(let i=0;i<16;i++){ const a=i*Math.PI/8, r=i%2?2.4:5; b.push([27.4+Math.cos(a)*r,15.6+Math.sin(a)*r]); }
        e.poly(b,'#ffe48a'); e.ell(27.4,15.6,1.6,1.6,'#ffffff'); },
      (e)=>{ e.band(R(5,11.8,8,9),[WH[1],WH[2],WH[3],WH[4]],[1,1.4,1.4,1],'y',11.8,20.8);
        for(let k=0;k<4;k++) e.ln(5.6+k*2,11.8,4.6+k*2,20.8,0.5,WH[4]); e.rect(5,11.8,8,0.6,WH[0]);
        e.band(e.smooth([[11.4,10],[19,8.6],[22,10],[22.4,21],[19,23.2],[12,22.6],[10.6,18]],4),[SK[0],SK[1],SK[2],SK[3],SK[4]],[0.8,1.4,1.6,1.2,1],'y',8.6,23.2);
        for(let i=0;i<4;i++){ const y0=8.2+i*3.45;
          e.band(e.smooth([[19.4,y0],[24.6,y0+0.2],[26.4,y0+1.7],[24.6,y0+3.3],[19.4,y0+3.4]],3),[SK[0],SK[1],SK[2],SK[3]],[0.8,1.2,1.4,1],'y',y0,y0+3.4);
          if(i<3) e.rect(20,y0+3.1,5.4,0.55,SK[4]); e.ell(24.6,y0+1.2,1,0.5,'#fff4e8'); }
        e.band(e.E(19.6,21,4.4,1.9,-0.12),[SK[0],SK[1],SK[2],SK[3]],[0.8,1.2,1.4,1],'y',19,23);
        e.ell(23,20.5,1.1,0.8,'#ffd8c8'); e.ln(12.4,13,18.6,11,0.5,SK[3]); },
    ],
    recrutas:[ // dupla de sobreviventes: a de trás no escuro, a da frente com bandana
      (e)=>{ const J=['#a0b860','#6a8a3a','#4a6a2a','#2e4620'].map((k)=>mix(k,DK,0.25)), F=SK.map((k)=>mix(k,DK,0.28));
        e.band(e.smooth([[15,31],[16.4,24],[20,19.6],[23,19],[26,19.6],[29.6,24],[30.6,31]],4),J,[0.8,1.2,1.4,1],'x',15,30.6);
        e.rect(21.4,15.6,3,3.6,F[3]);
        e.band(e.E(23,11.4,4.2,4.8),[F[0],F[1],F[2],F[3]],[0.8,1.2,1.4,1],'x',18.8,27.2);
        e.within(e.E(23,11.4,4.2,4.8),()=>{ e.band(R(17,5,12,4.2),['#5a4a6a','#3a2e4a','#2a2236'],[1,1.4,1],'y',5,9.2); });
        e.rect(23.6,11,1,1.4,DK); e.rect(25.6,11,0.9,1.4,DK); },
      (e)=>{ const J=['#8ae0d8','#3aa8a8','#2a7884','#1e4e60'];
        e.band(e.smooth([[2.6,31.4],[4.2,24],[8.8,20],[13,19.2],[17.2,20],[21.6,24],[23.2,31.4]],4),J,[0.8,1.2,1.4,1],'x',2.6,23.2);
        e.poly([[10,19.6],[13,23.6],[16,19.6]],WH[2]); e.poly([[11.2,19.6],[13,22],[14.8,19.6]],SK[2]);
        e.ln(6.6,22.4,18.6,31.4,1.3,RO[2]); e.ln(6.4,22.2,18.4,31.2,0.5,RO[0]);
        e.rect(11.4,16,3.2,3.6,SK[3]);
        const hd=e.E(13,11.4,5,5.6);
        e.band(hd,[SK[0],SK[1],SK[2],SK[3],SK[4]],[0.8,1.2,1.4,1.2,1],'x',8,18);
        e.within(hd,()=>{ e.band(R(6,4,14,5.2),[RD[0],RD[1],RD[2]],[0.8,1.4,1],'y',4,9.2); e.rect(6,8.6,14,0.8,RD[3]); });
        e.poly([[8.4,7.8],[4.4,6.4],[5,9.6]],RD[2]); e.poly([[8.4,8.6],[4.8,11.2],[7.6,10.8]],RD[1]);
        e.ell(8.2,12.2,0.9,1.4,SK[2]);
        e.rect(13.6,11,1.2,1.7,DK); e.rect(16.3,11,1.1,1.7,DK); e.rect(13.4,10,1.8,0.5,SK[4]); e.rect(16,10,1.6,0.5,SK[4]);
        e.rect(14.4,14.6,2.2,0.6,SK[4]); e.rect(12.6,12.8,0.6,1.4,SK[3]); },
    ],
    pets:[ // pegada grande caramelo
      (e)=>{ const P=['#ffe2b0','#f2b468','#d08440','#a05a28'];
        const pad=e.smooth([[16,14.2],[22.8,17.8],[24,24],[19.8,28],[16,26.6],[12.2,28],[8,24],[9.2,17.8]],4);
        e.band(pad,P,[0.7,1.3,1.6,1],'y',14.2,28);
        e.within(pad,()=>{ e.ell(13.4,18.4,2.6,1.4,P[0]); e.rect(8,26.2,16,2,P[3]); });
        [[6.8,13.4,2.9,3.7,-0.45],[12.4,7.6,3,4,-0.15],[19.6,7.6,3,4,0.15],[25.2,13.4,2.9,3.7,0.45]].forEach(([x,y,rx,ry,a])=>{
          e.band(e.E(x,y,rx,ry,a),P,[0.7,1.2,1.6,1],'y',y-ry,y+ry); e.ell(x-rx*0.3,y-ry*0.4,rx*0.32,ry*0.22,'#fff6e0',a); }); },
    ],
    bestiary:[ // leque de cartas do bestiário; a da frente com um zumbi de olho vermelho
      (e)=>{ const card=(cx,cy,rot,C,emb)=>{ e.c.save(); e.c.translate(cx,cy); e.c.rotate(rot);
          e.band(R(-7,-9.6,14,19.2),C,[0.6,1.2,1.4,1],'y',-9.6,9.6); e.rect(-5.6,-8.2,11.2,0.6,C[0]); e.rect(-5.6,-8.2,0.6,16.4,C[0]); emb(); e.c.restore(); };
        card(10.6,15.6,-0.34,['#c0a8f0','#7a5ac0','#54389a','#34206a'],()=>{ e.ell(0,0,3.4,3.4,'#e8dcff'); e.ell(1.4,-0.8,2.8,2.8,'#54389a'); });
        card(14.6,14.6,-0.13,['#ffa8b8','#d83a5a','#a01e3e','#6a0e2a'],()=>{ for(let k=0;k<3;k++) e.rect(-4,-4+k*3,8,1,'#ffb0c0'); }); },
      (e)=>{ e.c.save(); e.c.translate(19.6,17.2); e.c.rotate(0.17);
        const fc=R(-7.4,-10,14.8,20);
        e.band(fc,['#fffaf0','#f0e0c0','#d8c098','#a88a60'],[0.6,1.2,1.4,1],'y',-10,10);
        e.rect(-6,-8.6,12,13.2,'#3a2a4a'); e.rect(-6,-8.6,12,0.6,'#8a6a40');
        e.band(e.E(0,-2.6,4.2,4.6),['#c8f0a0','#8ac060','#5a8a40','#3a5a2a'],[0.7,1.2,1.4,1],'y',-7.2,2);
        e.ell(-1.6,-3.2,1.1,1.2,DK); e.ell(1.8,-2.8,1.1,1.1,'#ff3b55'); e.rect(1.6,-3.2,0.5,0.5,'#ffffff');
        e.rect(-2.2,0,4.4,0.8,DK); for(let k=0;k<4;k++) e.rect(-1.9+k*1.2,-0.5,0.4,1.8,'#c8f0a0');
        e.rect(-2.6,-6.6,1.8,0.6,'#e0ffc0');
        e.rect(-5.4,5.6,10.8,2.6,'#a01e3e'); e.rect(-5.4,5.6,10.8,0.6,'#ff6a80'); e.rect(-3.8,6.6,7.6,0.6,'#ffd0d8');
        e.c.restore(); },
    ],
    market:[ // balcão de feira com frutas, postes; toldo listrado por cima
      (e)=>{ e.band(R(4.4,9,2.4,19),[BK[1],BK[2],BK[3]],[1,1,1],'x',4.4,6.8); e.band(R(25.2,9,2.4,19),[BK[1],BK[2],BK[3]],[1,1,1],'x',25.2,27.6);
        const ct=R(3,19.6,26,8.6);
        e.band(ct,[BK[0],BK[1],BK[2],BK[3],BK[4]],[0.6,1,1.6,1.4,1],'y',19.6,28.2);
        e.within(ct,()=>{ for(let k=1;k<5;k++) e.rect(3+k*5.2,21.4,0.6,6.8,BK[4]); e.rect(3,21,26,0.6,BK[4]); e.rect(3,19.6,26,0.8,BK[0]); });
        ball(e,8.6,17.6,2.4,['#ffc890','#ff8a30','#d05a18','#8a3410']); ball(e,13.4,17.8,2.2,['#e0ffc8','#9ae060','#5ab040','#337a2e']);
        ball(e,18.2,17.6,2.4,['#ffa0a0','#f03c4a','#b81c34','#741024']); ball(e,23.2,17.8,2.2,['#ffc890','#ff8a30','#d05a18','#8a3410']);
        e.ln(15.6,15.2,16.4,14,0.7,GR[3]); },
      (e)=>{ const aw=[[2,11.6],[5.2,4.2],[26.8,4.2],[30,11.6]];
        e.within(aw,()=>{ for(let i=0;i<8;i++){ const k=i%2?WH:RD; e.band([[5.2+i*2.7,4],[5.2+(i+1)*2.7,4],[2+(i+1)*3.5,12],[2+i*3.5,12]],[k[0],k[1],k[2]],[0.6,1.4,1],'y',4,12); } });
        e.rect(5.2,4.2,21.6,1,'#ffffff');
        for(let i=0;i<8;i++){ const k=i%2?WH:RD; e.band(e.E(3.75+i*3.5,11.6,1.75,1.7),[k[1],k[2],k[3]],[1,1,1],'y',10,13.3); }
        e.rect(14.6,1.8,2.8,2.6,RD[2]); e.rect(15.2,1.2,1.6,1,GD[1]); },
    ],
    drawer:[ // diário de couro com páginas, alça e lápis
      (e)=>{ e.band(R(8.4,6.4,17.6,22.4),[WH[1],WH[2],WH[3]],[1,1.4,1],'x',8.4,26);
        for(let k=0;k<7;k++) e.rect(23,8+k*3,3,0.5,WH[4]); },
      (e)=>{ const L=['#e8a868','#c07a40','#94562c','#64341c'];
        e.band(R(6.6,4.6,17.6,23),L,[0.6,1.2,1.6,1],'x',6.6,24.2);
        e.band(R(4.6,4.6,3.6,23),['#94562c','#64341c','#3e1e10'],[1,1.4,1],'x',4.6,8.2);
        [7.4,24].forEach((y)=>{ e.rect(4.6,y,3.6,1.2,GD[2]); e.rect(4.6,y,3.6,0.4,GD[0]); });
        e.rect(8.2,4.6,16,0.7,L[0]); e.rect(8.4,6.4,14,0.4,'#f2c890');
        e.ell(15.2,14.6,4.4,4.4,GD[2]); e.ell(14.6,14,3.4,3.4,GD[1]); e.ell(17.2,13.4,3.6,3.6,L[1]);
        e.band(R(19.6,15.8,8.6,3.4),[BK[2],BK[3],BK[4]],[1,1.2,1],'y',15.8,19.2);
        e.band(R(25.2,15.2,2.6,4.6),[GD[0],GD[2],GD[4]],[1,1.2,1],'y',15.2,19.8); e.rect(25.9,16.4,1.2,2.2,BK[4]); },
      (e)=>{ e.c.save(); e.c.translate(23.4,25.6); e.c.rotate(-0.78);
        e.band(R(-6.6,-1.3,11,2.6),[YL[0],YL[1],YL[2],YL[3]],[0.6,1.2,1.4,1],'y',-1.3,1.3);
        e.poly([[4.4,-1.3],[7.6,0],[4.4,1.3]],'#f2c890'); e.poly([[6.6,-0.4],[7.6,0],[6.6,0.4]],'#3a3048');
        e.rect(-8.6,-1.3,1.6,2.6,'#ff8aa8'); e.rect(-7,-1.3,0.6,2.6,ST[2]); e.ln(-6,-0.5,4,-0.5,0.4,'#ffffff');
        e.c.restore(); },
    ],
    settings:[ // engrenagem de aço com cubo
      (e)=>{ const cols=[ST[0],ST[1],ST[2],ST[3],ST[4]], fr=[0.6,1,1.4,1.2,1];
        for(let i=0;i<8;i++){ const a=i*Math.PI/4+Math.PI/8, ca=Math.cos(a), sa=Math.sin(a), t=[-sa,ca];
          const p=(r,w)=>[16+ca*r+t[0]*w,16+sa*r+t[1]*w];
          e.band([p(8,-3),p(13.6,-2.2),p(13.6,2.2),p(8,3)],cols,fr,'y',3,29); }
        e.band(e.E(16,16,10.4,10.4),cols,fr,'y',5.6,26.4);
        e.arc(16,16,7,7,0,7,1.2,ST[3]); e.arc(16,16,8.8,8.8,Math.PI*1.05,Math.PI*1.45,0.8,'#ffffff');
        e.band(e.E(16,16,5,5),[ST[1],ST[2],ST[3]],[1,1.2,1],'y',11,21);
        e.cut(()=>{ e.c.beginPath(); e.c.ellipse(16,16,2.4,2.4,0,0,7); e.c.fill(); }); },
    ],
    exp:[ // lua cheia + mapa dobrado com rota tracejada até o X
      (e)=>moonArt(e,['#fffbe0','#fff2a8','#e8d890','#b0a070','#8a7a50']),
      (e)=>mapArt(e),
    ],
    exp_lua:[ // variante Lua de Sangue: lua vermelha
      (e)=>moonArt(e,[CR[1],CR[2],CR[3],CR[4],CR[5]]),
      (e)=>mapArt(e),
    ],
    collect:[ // cesto de palha com tora, maçã e engrenagem
      (e)=>{ e.c.save(); e.c.translate(12,12.4); e.c.rotate(-0.35);
        e.band(R(-6,-2.2,12,4.4),[BK[0],BK[1],BK[2],BK[3]],[0.8,1.2,1.4,1],'y',-2.2,2.2); e.ell(-6,0,1.6,2.2,'#f2c890'); e.arc(-6,0,0.9,1.3,0,7,0.4,BK[2]);
        e.c.restore();
        ball(e,21.4,11.4,3.2,['#ffa0a0','#f03c4a','#b81c34','#741024']); e.ln(21.4,8.4,22.4,6.2,0.7,BK[3]); e.ell(23.6,6.8,1.6,0.8,GR[1],-0.4); },
      (e)=>{ const bs=[[4.4,15.6],[27.6,15.6],[24.6,29],[7.4,29]];
        e.band(bs,[RO[0],RO[1],RO[2],RO[3]],[0.6,1.2,1.6,1],'y',15.6,29);
        e.within(bs,()=>{ for(let y=17.6;y<29;y+=2.6) e.rect(3,y,26,0.6,RO[3]); for(let k=0;k<7;k++) e.ln(7+k*3,15.6,7.6+k*2.7,29,0.5,RO[3]); });
        e.band(R(3,13.6,26,3),[BK[0],BK[1],BK[2],BK[3]],[0.6,1,1.2,1],'y',13.6,16.6); },
    ],
    conquistas:[ // troféu: alças, haste com nó, taça com estrela gravada, base de madeira com placa
      (e)=>{ e.arc(9.6,9.4,4.8,3.8,Math.PI*0.5,Math.PI*1.5,1.7,GD[3]); e.arc(9.6,9.4,4.8,3.8,Math.PI*0.8,Math.PI*1.3,0.6,GD[1]);
        e.arc(22.4,9.4,4.8,3.8,-Math.PI*0.5,Math.PI*0.5,1.7,GD[4]); e.arc(22.4,9.4,4.8,3.8,-Math.PI*0.4,-Math.PI*0.1,0.6,GD[2]); },
      (e)=>{ e.band(R(14.4,15,3.2,7),[GD[1],GD[2],GD[3],GD[4]],[0.6,1,1,1],'x',14.4,17.6);
        e.band(e.E(16,18.4,3,1.3),[GD[0],GD[2],GD[4]],[1,1.2,1],'y',17.1,19.7);
        e.band([[11.4,21],[20.6,21],[22.2,23.2],[9.8,23.2]],[GD[1],GD[2],GD[3],GD[4]],[0.6,1,1,1],'y',21,23.2); e.rect(11.4,21,9.2,0.5,GD[0]); },
      (e)=>{ const cup=e.smooth([[7.4,4.4],[24.6,4.4],[24,10.6],[20.6,15.4],[16,16.8],[11.4,15.4],[8,10.6]],4);
        e.band(cup,[GD[1],GD[0],GD[1],GD[2],GD[3],GD[4]],[0.4,0.7,0.8,1.6,1.4,1],'x',7.6,24.4);
        e.within(cup,()=>{ e.arc(16,9,10,7.6,0.15*Math.PI,0.85*Math.PI,0.6,GD[4]); });
        e.ell(16,4.6,8.8,1.8,GD[3]); e.ell(16,4.9,7.4,1.1,GD[5]); e.arc(16,4.6,8.8,1.8,Math.PI*1.05,Math.PI*1.7,0.6,GD[0]);
        star(e,16.3,10.7,4,GD[4]); star(e,16,10.3,3.4,GD[4]); star(e,16,10.4,2.6,GD[1],0.42); e.rect(15.6,8.2,0.8,0.8,'#ffffff');
        e.rect(10,6.8,1,4.4,'#ffffff'); e.rect(11.2,12.2,0.8,1.4,GD[0]);
        sp(e,26.8,3.6,1.2,YL[0]); sp(e,5.2,15,0.7,YL[1]); },
      (e)=>{ const bs=R(8.6,22.8,14.8,6.4);
        e.band(bs,[BK[0],BK[1],BK[2],BK[3],BK[4]],[0.5,0.8,1.4,1.4,1],'y',22.8,29.2);
        e.within(bs,()=>{ e.rect(8.6,22.8,14.8,0.8,BK[0]); e.rect(8.6,28.2,14.8,1,BK[4]); e.rect(22.4,22.8,1,6.4,BK[4]); });
        e.band(R(12.2,24.6,7.6,2.6),[GD[0],GD[2],GD[4]],[0.6,1.4,1],'y',24.6,27.2); e.rect(13.4,25.6,5.2,0.5,GD[4]); },
    ],
    lb_galo:[ // chaveiro do Galo da Madrugada: argola + elo, cauda de penas coloridas, galo vermelho/laranja
      (e)=>{ e.arc(24,4.4,3.1,3.1,0,7,1.5,ST[3]); e.arc(24,4.4,3.1,3.1,Math.PI*1.0,Math.PI*1.55,0.6,ST[0]); e.arc(24,4.4,3.1,3.1,Math.PI*0.1,Math.PI*0.6,0.5,ST[4]);
        e.arc(23.6,8.6,1,1.8,0,7,0.8,ST[2]);
        e.ln(15.6,24.6,14.8,29.2,1,YL[2]); e.ln(20,24.6,20.6,29.2,1,YL[2]); e.ln(12.8,29.4,16.4,29.4,0.9,YL[2]); e.ln(18.8,29.4,22.4,29.4,0.9,YL[2]); },
      ...[[0.2,BL],[0.68,[YL[0],YL[1],YL[2],YL[3]]],[1.15,[GR[0],GR[1],GR[2],GR[3]]]].map(([t,P])=>(e)=>{
        const bx=13.6, by=19.8, s=Math.sin(t), c=Math.cos(t), cx=bx-s*6, cy=by-c*6;
        e.band(e.E(cx,cy,2.6,6.4,-t),P,[0.7,1.2,1.4,1],'y',cy-6,cy+6);
        e.ln(bx-s*1,by-c*1,bx-s*11,by-c*11,0.5,P[0]); e.ell(bx-s*10.4-c*0.8,by-c*10.4+s*0.8,0.5,0.5,'#ffffff'); }),
      (e)=>{ const RC=['#ffe090','#ffa040','#f05a3a','#c02a34','#7a1424'];
        const b=U(e,[[17.6,20.8,7.2,5,-0.12],[22.6,15.6,2.8,4.6,0.3],[23.8,12.8,3.2,3]]);
        e.band(b,RC,[0.5,0.9,1.4,1.4,1],'y',9.8,25.8);
        e.within(b,()=>{ e.band(e.E(16.4,20.2,5,3,-0.18),['#ffc070','#e8702a','#b0441c'],[1,1.2,1],'y',17.2,23.2);
          e.arc(15,20.6,3.6,1.8,0.1*Math.PI,0.9*Math.PI,0.5,'#8a2a14'); e.arc(17.2,21.6,3,1.4,0.1*Math.PI,0.9*Math.PI,0.5,'#8a2a14');
          e.ell(21,11.8,1.2,0.7,'#fff4c0'); });
        e.ell(22,10.4,1.4,1.5,RD[1]); e.ell(23.8,9.6,1.6,1.7,RD[1]); e.ell(25.6,10.6,1.3,1.4,RD[2]); e.ell(23.4,9.2,0.6,0.5,RD[0]);
        e.poly([[26.6,11.8],[29.8,13],[26.6,14.2]],YL[1]); e.poly([[26.6,13],[29.8,13],[26.6,14.2]],YL[2]);
        e.ell(26.2,15.8,1,1.6,RD[1]); e.ell(25.9,15.3,0.4,0.5,RD[0]);
        e.ell(24.6,12.2,1.1,1.1,'#ffffff'); e.rect(24.7,11.8,0.8,1,DK); },
    ],
    lb_sombrinha:[ // sombrinha de frevo: cabo curvo atrás, gomos coloridos alternados com bordas recortadas
      (e)=>{ e.c.save(); e.c.translate(16,15.6); e.c.rotate(-0.22);
        e.band(R(-0.8,-2,1.6,12.4),[ST[1],ST[2],ST[3]],[1,1,1],'x',-0.8,0.8);
        e.arc(-2.4,10.4,2.4,2.4,0,Math.PI,1.7,BK[2]); e.arc(-2.4,10.4,2.4,2.4,Math.PI*0.5,Math.PI*0.95,0.5,BK[0]);
        e.c.restore(); },
      (e)=>{ e.c.save(); e.c.translate(16,15.6); e.c.rotate(-0.22);
        const N=8, W=13.2, H=10.2, C=[RD,[YL[0],YL[1],YL[2],YL[3]],[GR[0],GR[1],GR[2],GR[3]],BL], xs=(i)=>-W+i*2*W/N;
        const dome=()=>{ e.c.beginPath(); e.c.ellipse(0,0,W,H,0,Math.PI,Math.PI*2); e.c.closePath(); };
        e.within(dome,()=>{ for(let i=0;i<N;i++){ const P=C[i%4]; e.band([[0,-H-1],[xs(i),0.4],[xs(i+1),0.4]],[P[0],P[1],P[2]],[0.6,1.4,1],'y',-H,0); } });
        for(let i=0;i<N;i++){ const P=C[i%4], m=(xs(i)+xs(i+1))/2; e.band(e.E(m,0,W/N,1.7),[P[1],P[2],P[3]],[1,0.8,1],'y',-1.7,1.7); }
        e.arc(0,0,W-2.4,H-2.2,Math.PI*1.14,Math.PI*1.38,0.7,'#ffffff');
        for(let i=0;i<=N;i++) e.ell(xs(i),0.5,0.55,0.55,ST[1]);
        e.ln(0,-H-1.6,0,-H,0.8,ST[2]); e.ell(0,-H-1.8,1,1,GD[2]); e.rect(-0.5,-H-2.3,0.5,0.5,'#ffffff');
        e.c.restore(); },
    ],
    lb_torre:[ // Torre de Cristal (Brennand): mar, pedestal de pedra, coluna terracota com anéis, botão no topo
      (e)=>{ const sea=e.E(16,28,14.6,2.8);
        e.band(sea,[BL[0],BL[1],BL[2],BL[3]],[0.6,1,1.2,1],'y',25.2,30.8);
        e.within(sea,()=>{ e.arc(7,27.6,3,1,Math.PI*1.1,Math.PI*1.9,0.5,'#ffffff'); e.arc(25.4,28.2,2.6,0.9,Math.PI*1.1,Math.PI*1.9,0.5,'#ffffff'); e.arc(14,29.8,2.4,0.8,Math.PI*1.1,Math.PI*1.9,0.5,BL[0]); }); },
      (e)=>{ e.band(R(9.6,24.2,12.8,3.6),[ST[0],ST[1],ST[2],ST[3]],[0.5,1,1.2,1],'y',24.2,27.8); e.rect(21.2,24.2,1.2,3.6,ST[3]);
        e.band(R(11.6,22,8.8,2.4),[ST[0],ST[1],ST[2],ST[3]],[0.5,1,1.2,1],'y',22,24.4); e.rect(19.4,22,1,2.4,ST[3]); },
      (e)=>{ const col=[[13.2,22.2],[13.7,9.4],[18.3,9.4],[18.8,22.2]], TC=[RU[0],RU[1],RU[2],RU[3]];
        e.band(col,[RU[1],RU[0],RU[1],RU[2],RU[3]],[0.3,0.5,1.2,1.4,0.8],'x',13.2,18.8);
        [11.4,14.4,17.4,20.2].forEach((y)=>{ e.band(R(12.6,y,6.8,1.5),[TC[0],TC[1],TC[2],TC[3]],[0.6,0.8,0.8,0.6],'y',y,y+1.5); e.rect(18.4,y,1,1.5,TC[3]); });
        e.rect(14.7,10,0.6,11.6,RU[0]); },
      (e)=>{ const bud=[[13.2,11.2],[11,8.6],[9.8,3.8],[12.6,5.8],[13.4,2],[16,4.6],[18.6,2],[19.4,5.8],[22.2,3.8],[21,8.6],[18.8,11.2]];
        e.band(bud,[RU[1],RU[0],RU[1],RU[2],RU[3]],[0.4,0.7,1.4,1.4,0.9],'x',10.6,21.4);
        e.within(bud,()=>{ e.ln(13,10.6,12.6,6.2,0.5,RU[3]); e.ln(19,10.6,19.4,6.2,0.5,RU[3]); e.ln(16,10.8,16,6.4,0.5,RU[3]);
          e.rect(10,10.2,12,0.9,RU[3]); e.ln(11.2,7.6,10.6,5,0.6,'#ffe0c0'); e.ln(13.8,7.6,13.6,4.2,0.5,'#ffe0c0'); });
        e.band(e.E(16,5,1.6,2),['#e8ffff','#8ad8e8','#3a8aa8'],[1,1.2,1],'x',14.4,17.6); e.rect(15.3,4,0.6,0.6,'#ffffff'); sp(e,25.4,5.6,1.1,YL[0]); },
    ],
    lb_boneco: [ // boneco gigante de Olinda: mangas de pano largas, corpo pequeno listrado, cabeçona caricata
      (e)=>{ const SL=[YL[0],YL[1],YL[2],YL[3]];
        [-1,1].forEach((s)=>{ const X=(x)=>16+s*(x-16);
          const sl=e.smooth([[X(12.6),17.6],[X(7.6),19.4],[X(3.6),25],[X(4.4),28.4],[X(8.4),27.6],[X(12.8),22.8]],4);
          e.band(sl,SL,[0.6,1.2,1.4,1],'y',17.6,28.4);
          e.within(sl,()=>{ e.band(R(0,25.6,32,4),[RD[1],RD[2],RD[3]],[1,1,1],'y',25.6,29); e.ln(X(11),20.4,X(6),24.6,0.5,YL[3]); });
          e.ell(X(5.4),28.8,1.5,1.3,SK[2]); }); },
      (e)=>{ const TL=['#c8fff4','#7ad0c8','#3a9a98','#22626a'];
        const rb=[[13,18.4],[19,18.4],[21.4,29.6],[10.6,29.6]];
        e.band(rb,TL,[0.5,0.9,1.4,1],'x',10.6,21.4);
        e.within(rb,()=>{ e.band(R(0,22,32,1.6),['#ffb0d0','#ff5a9a','#c02a6a'],[0.8,1,1],'y',22,23.6); e.band(R(0,26.2,32,1.6),[YL[0],YL[1],YL[2]],[0.8,1,1],'y',26.2,27.8);
          e.rect(15.6,18,0.8,11,TL[3]); e.rect(9,28.8,14,0.8,TL[3]); });
        e.ell(16,19.4,4.2,1.4,WH[1]); e.ell(16,19.8,3.2,0.8,WH[3]); },
      (e)=>{ const hd=e.E(16,10.6,9.6,9.4);
        e.ell(6.6,11.4,1.7,2.4,SK[2]); e.ell(25.4,11.4,1.7,2.4,SK[3]);
        e.band(hd,[SK[1],SK[0],SK[1],SK[2],SK[3]],[0.5,0.7,1.6,1.4,1],'x',6.4,25.6);
        e.within(hd,()=>{ e.poly(e.smooth([[6.4,8],[8,2.4],[16,0.4],[24,2.4],[25.6,8],[22.4,5.6],[18.6,6.6],[15,5],[11.2,6.6],[8.6,5.8]],3),'#2e2238');
          e.ln(10.6,3.4,15,1.8,0.6,'#5a4a6a'); e.rect(5,18.8,22,1.2,SK[3]); });
        e.ell(12.6,10.4,2.3,2.5,'#ffffff'); e.ell(19.4,10.4,2.3,2.5,'#ffffff');
        e.ell(13.2,10.8,1.2,1.4,DK); e.ell(20,10.8,1.2,1.4,DK); e.rect(12.8,10,0.6,0.6,'#ffffff'); e.rect(19.6,10,0.6,0.6,'#ffffff');
        e.ln(10,7.6,14.6,7.2,1,'#2e2238'); e.ln(17.4,7.2,22,7.6,1,'#2e2238');
        e.ell(9.8,14.4,1.6,1,'#ff9a9a'); e.ell(22.2,14.4,1.6,1,'#ff8a8a');
        e.band(e.E(16,13.6,2,1.7),[SK[1],SK[2],SK[3]],[0.8,1.2,1],'y',11.9,15.3); e.ell(15.4,13,0.6,0.5,'#fff4e8');
        e.arc(16,15,4.2,2.6,0.2*Math.PI,0.8*Math.PI,1.1,'#7a2030'); e.rect(14.6,17.2,2.8,0.5,'#ffffff'); },
    ],
    lb_azulejo:[ // azulejo português: vidrado branco, moldura azul, roseta central simétrica e quartos de flor nos cantos
      (e)=>{ const B=BL, t=R(3.4,3.4,25.2,25.2);
        e.band(t,[WH[0],WH[1],WH[2]],[0.6,1.6,1],'y',3.4,28.6);
        e.within(t,()=>{
          [[3.4,3.4],[28.6,3.4],[3.4,28.6],[28.6,28.6]].forEach(([x,y])=>{ e.ell(x,y,5.6,5.6,B[1]); e.ell(x,y,3.6,3.6,WH[1]); e.ell(x,y,2.2,2.2,B[2]); });
          for(let i=0;i<4;i++){ const a=i*Math.PI/2, ca=Math.cos(a), sa=Math.sin(a);
            e.ell(16+ca*5.6,16+sa*5.6,3.8,2.3,B[1],a); e.ell(16+ca*6.2,16+sa*6.2,2,1,B[0],a); e.ell(16+ca*9.6,16+sa*9.6,1.1,1.1,B[2]);
            const b=a+Math.PI/4, cb=Math.cos(b), sb=Math.sin(b); e.ell(16+cb*6.2,16+sb*6.2,2.2,1.1,B[2],b); e.ell(16+cb*8.4,16+sb*8.4,0.7,0.7,B[1]); }
          e.ell(16,16,3,3,B[2]); e.ell(16,16,1.8,1.8,WH[0]); e.ell(16,16,0.9,0.9,B[3]);
          e.rect(3.4,3.4,25.2,1.2,B[2]); e.rect(3.4,3.4,1.2,25.2,B[2]); e.rect(3.4,27.2,25.2,1.4,B[3]); e.rect(27.2,3.4,1.4,25.2,B[3]);
          e.rect(4.6,4.6,22.6,0.5,B[0]); e.rect(4.6,4.6,0.5,22.6,B[0]); e.ln(20.4,7,22.6,5.2,0.6,'#ffffff'); }); },
    ],
    lb_sino:[ // sino de bronze: alça, badalo aparecendo embaixo, frisos e cruz em relevo
      (e)=>{ e.arc(16,5.6,2.8,2.8,Math.PI,Math.PI*2,1.7,BZ[3]); e.arc(16,5.6,2.8,2.8,Math.PI*1.1,Math.PI*1.5,0.6,BZ[1]); },
      (e)=>{ e.ln(16,20,16,25.6,1,ST[3]); e.band(e.E(16,26.6,2.2,2.2),[ST[1],ST[2],ST[3],ST[4]],[0.7,1.2,1.2,1],'y',24.4,28.8); e.rect(15,25.4,0.8,0.8,'#ffffff'); },
      (e)=>{ const bell=e.smooth([[16,4.8],[20.2,5.8],[21.8,10],[22.4,16.4],[24.2,21.2],[27.6,23.6],[16,24.8],[4.4,23.6],[7.8,21.2],[9.6,16.4],[10.2,10],[11.8,5.8]],4);
        e.band(bell,[BZ[1],BZ[0],BZ[1],BZ[2],BZ[3],BZ[4]],[0.4,0.6,1,1.6,1.4,0.8],'x',4.6,27.4);
        e.within(bell,()=>{ e.arc(16,8.8,7,1.2,0,Math.PI,0.8,BZ[4]); e.arc(16,9.6,7,1.2,0,Math.PI,0.5,BZ[0]);
          e.arc(16,18.4,9,1.6,0,Math.PI,0.9,BZ[4]); e.arc(16,19.3,9,1.6,0,Math.PI,0.5,BZ[0]);
          e.rect(15.2,11.4,1.6,5.4,BZ[4]); e.rect(13.6,12.8,4.8,1.5,BZ[4]); e.rect(15.2,11.4,0.7,5.4,BZ[0]); e.rect(13.6,12.8,4.8,0.6,BZ[0]);
          e.poly([[11.4,7.2],[12.6,7],[11.6,19],[10.2,19.2]],'#ffffff'); });
        e.ell(16,23.6,11.6,2,BZ[3]); e.ell(16,23.2,10,1.2,'#3a2010'); e.arc(16,23.6,11.6,2,Math.PI*0.15,Math.PI*0.85,0.6,BZ[1]);
        sp(e,25.4,6.6,1.2,YL[0]); sp(e,5.6,12,0.7,YL[1]); },
    ],
    lb_fitinha:[ // fitinhas do Bonfim: quatro fitas onduladas presas num laço, a da frente com letrinhas
      (e)=>fita(e,15,6,5.6,28.6,2.2,0.4,3.2,BL),
      (e)=>fita(e,17,6,26.4,27.4,2.4,2.2,3.2,[GR[0],GR[1],GR[2],GR[3]]),
      (e)=>fita(e,15.6,6,11.6,30,2,1.4,3.2,[YL[0],YL[1],YL[2],YL[3]]),
      (e)=>fita(e,16.6,6,20.4,30,2.4,3.4,3.4,[CR[1],CR[2],CR[3],CR[4]],true),
      (e)=>{ e.band(e.E(12.4,4.8,3,1.6,-0.35),[CR[1],CR[2],CR[3]],[0.8,1.2,1],'y',3,6.6); e.band(e.E(19.6,4.8,3,1.6,0.35),[CR[1],CR[2],CR[3]],[0.8,1.2,1],'y',3,6.6);
        e.ell(12.6,4.8,1,0.5,CR[4],-0.35); e.ell(19.4,4.8,1,0.5,CR[4],0.35);
        e.band(e.E(16,5.6,2,1.9),[CR[1],CR[2],CR[3],CR[4]],[0.7,1,1,1],'y',3.7,7.5); e.rect(15,4.4,0.8,0.6,'#ffffff');
        sp(e,26.4,4.4,1.1,YL[0]); },
    ],
    lb_elevador:[ // Elevador Lacerda: encosta, passarela no alto, torre art déco clara com janelas verticais
      (e)=>{ const cl=[[0.8,9.6],[6.4,9.6],[7.4,16],[8.6,30],[0.8,30]];
        e.band(cl,['#a8d070','#6a9a40','#8a5a34','#6a3e24','#4a2a18'],[0.5,0.4,1,1.6,1],'y',9.6,30);
        e.within(cl,()=>{ e.rect(0,9.6,8,1,GR[1]); e.ln(2,15,5,17,0.5,'#4a2a18'); e.ln(1.6,22,4.6,23.4,0.5,'#4a2a18'); }); },
      (e)=>{ const P=[WH[1],WH[2],WH[3],WH[4]];
        e.band(R(2.4,6.8,12,3),P,[0.5,1,1,1],'y',6.8,9.8);
        e.within(R(2.4,6.8,12,3),()=>{ for(let k=0;k<4;k++) e.rect(3.4+k*2.8,7.8,1.6,1.2,'#34406a'); e.rect(2.4,6.8,12,0.5,'#ffffff'); }); },
      (e)=>{ const T=[WH[0],WH[1],WH[2],WH[3],WH[4]];
        e.band(R(11.4,26.6,13.2,3),[WH[1],WH[2],WH[3],WH[4]],[0.5,1,1,1],'x',11.4,24.6);
        e.band(R(13,9.6,10,17.4),T,[0.3,0.8,1.4,1.2,0.8],'x',13,23);
        e.band(R(12,4.4,12,6),T,[0.3,0.8,1.4,1.2,0.8],'x',12,24); e.rect(12,9.6,12,0.7,WH[4]);
        e.band(R(14.2,2.6,7.6,2),T,[0.3,0.8,1.4,1.2,0.8],'x',14.2,21.8); e.band(R(16.4,1.4,3.2,1.4),T,[0.3,0.8,1.4,1.2,0.8],'x',16.4,19.6);
        for(let k=0;k<3;k++){ const x=14.4+k*2.8; e.rect(x,11.6,1.6,13.6,'#34406a'); e.rect(x,11.6,1.6,0.6,'#8ab0e8'); e.rect(x,11.6,0.5,13.6,'#4a5a8a');
          for(let y=14;y<25;y+=2.6) e.rect(x,y,1.6,0.4,WH[3]); }
        for(let k=0;k<4;k++) e.rect(13.4+k*2.6,6,1.4,2.4,'#34406a');
        e.rect(13,26.6,10,0.6,WH[4]); e.rect(13.6,10.6,0.6,15,'#ffffff');
        sp(e,27.4,5,1.1,YL[0]); },
    ],
    lb_berimbau:[ // berimbau: verga de madeira com arame, cabaça laranja amarrada, baqueta + caxixi
      (e)=>{ e.c.save(); e.c.translate(16,15.6); e.c.rotate(0.4);
        e.ln(3.2,-13.4,3.2,13.4,0.5,ST[2]);
        e.arc(3.2,0,6.4,13.4,Math.PI*0.5,Math.PI*1.5,1.9,BK[2]); e.arc(3.2,0,6.4,13.4,Math.PI*0.75,Math.PI*1.25,0.6,BK[0]); e.arc(3.4,0,5.6,13,Math.PI*0.55,Math.PI*1.45,0.5,BK[4]);
        e.c.restore(); },
      (e)=>{ e.c.save(); e.c.translate(16,15.6); e.c.rotate(0.4);
        const G=['#ffd890','#f09a3a','#c0661e','#80401a'];
        e.band(e.E(-5.4,9.4,4.2,4),G,[0.6,1.2,1.4,1],'x',-9.6,-1.2); e.ell(-6.4,7.6,1.1,0.8,'#fff0d0');
        e.ell(-8,10.2,1.5,2.4,G[3]); e.ell(-7.8,10.2,1,1.8,'#3a1a0a');
        e.ln(-2.6,9.4,3.4,9.4,0.6,RO[2]); e.ln(-2.6,9.1,3.4,9.1,0.3,RO[0]);
        e.c.restore(); },
      (e)=>{ e.ln(18.6,13.6,27.6,26.6,1,BK[1]); e.ln(18.4,13.4,22,18.4,0.4,BK[0]); },
      (e)=>{ const cx=[[22.4,27.2],[22.8,22.6],[25.2,19.6],[27.6,22.6],[28,27.2]];
        e.arc(25.2,19.4,1.2,1.6,Math.PI,Math.PI*2,0.8,RO[2]);
        e.band(e.smooth(cx,3),[RO[0],RO[1],RO[2],RO[3]],[0.6,1.2,1.4,1],'x',22.4,28);
        e.within(e.smooth(cx,3),()=>{ for(let y=21.6;y<27;y+=1.6) e.rect(21,y,8,0.5,RO[3]); for(let k=0;k<4;k++) e.ln(23.4+k*1.3,20,23+k*1.4,27.4,0.4,RO[3]); });
        e.ell(25.2,27.2,2.8,0.9,BK[3]); e.ell(24.6,21.6,0.6,1,'#ffffff'); },
    ],
    lb_garrafada:[ // garrafada: garrafa de vidro com líquido verde-âmbar, ervas, rótulo de papel e rolha
      (e)=>{ const bt=e.smooth([[13.6,6],[18.4,6],[18.6,10.6],[22.6,14],[23.4,18],[23.4,27],[21.8,29],[10.2,29],[8.6,27],[8.6,18],[9.4,14],[13.4,10.6]],3);
        e.band(bt,['#f0fff4','#c8ecd4','#98d0b0','#6aa888'],[0.5,1.2,1.4,1],'x',8.6,23.4);
        e.within(bt,()=>{
          e.band(R(0,14.8,32,16),['#e8e070','#b8c030','#7a9a20','#4a6a18'],[0.5,1.2,1.6,1],'x',8.6,23.4);
          e.rect(0,14.8,32,0.7,'#f6f0a0');
          [[11.4,28,14.4,16.4],[17,28.4,15.6,17],[20.6,27.6,21.2,18]].forEach(([x0,y0,x1,y1])=>{ e.ln(x0,y0,x1,y1,0.6,'#2e5a1a');
            for(let k=1;k<4;k++){ const t=k/4, x=x0+(x1-x0)*t, y=y0+(y1-y0)*t; e.ell(x-1,y,1.2,0.5,'#3a7a28',0.5); e.ell(x+1,y-0.4,1.2,0.5,'#6ab040',-0.5); } });
          e.ell(19.8,16.6,0.6,0.6,'#fffbe0'); e.ell(12,17.4,0.4,0.4,'#fffbe0'); e.ell(21.6,25.4,0.5,0.5,'#fffbe0');
          e.band(R(9.6,19.6,12.8,5.4),[RO[0],RO[1],RO[2]],[1,1.6,0.6],'y',19.6,25);
          e.rect(9.6,19.6,12.8,0.5,RO[3]); e.rect(9.6,24.5,12.8,0.5,RO[3]); e.rect(11.6,21,8.8,0.6,'#6a3a20'); e.rect(12.6,22.6,6.8,0.5,RO[3]);
          e.rect(13,8.2,6,1.2,RO[2]); e.rect(13,8.2,6,0.4,RO[0]);
          e.rect(10,15.6,0.8,3.4,'#ffffff'); e.rect(10,25.6,0.8,1.6,'#ffffff'); e.rect(14.6,6.6,0.6,2,'#ffffff'); }); },
      (e)=>{ e.band(R(13.2,2.4,5.6,4.6),[BK[0],BK[1],BK[2],BK[3]],[0.5,1,1.2,1],'x',13.2,18.8); e.ell(16,2.6,2.8,0.9,BK[0]);
        e.ell(15,4.4,0.5,0.5,BK[3]); e.ell(17.4,5.4,0.4,0.4,BK[3]); sp(e,25.4,6.4,1.1,YL[0]); },
    ],
    lb_mercado:[ // Mercado de Ferro do Ver-o-Peso: torres de trás, corpo com arcos, torres pontudas da frente
      (e)=>{ const IR=['#b8c4dc','#8a96b6','#646e90','#464e70'].map((k)=>mix(k,DK,0.18)), SL=[ST[2],ST[3],ST[4],ST[5]];
        [10.6,21.4].forEach((x)=>{ e.band(R(x-1.6,8,3.2,8),IR,[0.6,1,1,1],'x',x-1.6,x+1.6); e.band([[x-2.2,8.4],[x,3.4],[x+2.2,8.4]],SL,[0.6,1,1,1],'x',x-2.2,x+2.2); e.ell(x,3.2,0.6,0.6,GD[2]); }); },
      (e)=>{ const IR=['#e0e8f8','#b8c4dc','#8a96b6','#646e90','#464e70'];
        e.band(R(4.4,13.4,23.2,15.8),IR,[0.4,1,1.4,1.2,0.8],'y',13.4,29.2);
        e.band(R(3.8,11.8,24.4,2.2),[IR[0],IR[2],IR[4]],[0.6,1,1],'y',11.8,14);
        for(let x=6;x<27;x+=2) e.poly([[x-0.6,11.8],[x,10.6],[x+0.6,11.8]],IR[2]);
        [10.4,16,21.6].forEach((x)=>{ const ar=()=>{ e.c.beginPath(); e.c.moveTo(x-2.3,28.4); e.c.lineTo(x-2.3,19.6); e.c.ellipse(x,19.6,2.3,2.6,0,Math.PI,Math.PI*2); e.c.lineTo(x+2.3,28.4); e.c.closePath(); };
          e.within(()=>{ e.c.beginPath(); e.c.moveTo(x-3,28.4); e.c.lineTo(x-3,19.6); e.c.ellipse(x,19.6,3,3.3,0,Math.PI,Math.PI*2); e.c.lineTo(x+3,28.4); e.c.closePath(); },()=>e.rect(x-3,15,6,14,IR[3]));
          e.band(ar,['#3a5a8a','#24365e','#18223e'],[0.8,1.2,1],'y',17,28.4);
          e.within(ar,()=>{ e.rect(x-0.3,16,0.6,13,IR[3]); e.rect(x-3,21.6,6,0.5,IR[3]); e.ell(x,19.6,1.2,1.2,'#5a8ac0'); e.rect(x-1.8,17.8,0.6,1.6,'#8ab0e8'); }); });
        e.band(R(4.4,28,23.2,1.6),[ST[1],ST[2],ST[3]],[0.6,1,1],'y',28,29.6); e.rect(4.4,13.4,23.2,0.6,'#ffffff'); },
      (e)=>{ const IR=['#e0e8f8','#b8c4dc','#8a96b6','#646e90','#464e70'], SL=[ST[1],ST[2],ST[3],ST[4]];
        [5.2,26.8].forEach((x)=>{ e.band(R(x-2.4,10.2,4.8,19.4),IR,[0.4,0.8,1.4,1.2,0.8],'x',x-2.4,x+2.4);
          e.band(R(x-2.8,9.4,5.6,1.4),[IR[0],IR[2],IR[4]],[0.6,1,1],'y',9.4,10.8);
          e.band([[x-2.8,9.6],[x,1.6],[x+2.8,9.6]],SL,[0.5,1,1.2,1],'x',x-2.8,x+2.8); e.ln(x-0.6,8.6,x-0.1,3.4,0.5,'#ffffff');
          e.ell(x,1.6,0.7,0.7,GD[2]); e.rect(x-0.6,13,1.2,3,'#24365e'); e.rect(x-0.6,19.4,1.2,3,'#24365e'); e.rect(x-0.6,13,1.2,0.5,'#8ab0e8'); e.rect(x-0.6,19.4,1.2,0.5,'#8ab0e8');
          e.rect(x-2.4,28,4.8,1.6,ST[2]); }); },
    ],
    lb_cuia:[ // cuia de tacacá: cuia escura com friso, caldo amarelo, jambu e camarão por cima
      (e)=>{ const CU=['#b87a48','#8a5028','#603418','#40200e','#28120a'];
        const bw=()=>{ const c=e.c; c.beginPath(); c.ellipse(16,14.4,13.6,12.6,0,0,Math.PI); c.closePath(); c.moveTo(29.6,14.4); c.ellipse(16,14.4,13.6,4.4,0,0,Math.PI*2); };
        e.band(bw,[CU[1],CU[0],CU[1],CU[2],CU[3],CU[4]],[0.3,0.6,1,1.6,1.4,0.8],'x',2.4,29.6);
        e.within(bw,()=>{ for(let k=0;k<9;k++){ const x=5+k*2.75; e.ln(x,20.6,x+1.37,22.4,0.6,'#e0a860'); e.ln(x+1.37,22.4,x+2.75,20.6,0.6,'#e0a860'); }
          e.arc(16,14.4,12.6,9,0.2*Math.PI,0.8*Math.PI,0.5,CU[4]); e.arc(16,14.4,11.4,11.4,0.62*Math.PI,0.85*Math.PI,0.8,'#d89a68'); });
        e.ell(16,14.4,13.6,4.4,CU[1]); e.arc(16,14.4,13.6,4.4,Math.PI*0.95,Math.PI*1.6,0.7,CU[0]); },
      (e)=>{ const br=e.E(16,14.6,12,3.4);
        e.band(br,[YL[0],YL[1],YL[2]],[0.6,1.4,1],'y',11.2,18);
        e.within(br,()=>{ e.ell(9.4,16,2,0.8,'#fff8d8'); e.ell(23.6,15.6,1.6,0.6,'#fff8d8'); e.arc(16,14.6,12,3.4,Math.PI*1.1,Math.PI*1.9,0.6,'#d49c22'); }); },
      (e)=>{ [[10.6,13.6,2.8,1.3,-0.35],[13.6,12,2.4,1.1,0.5],[14.6,15.4,2.6,1.2,0.15],[22.8,13.8,2.2,1,-0.6]].forEach(([x,y,rx,ry,a])=>{
          e.band(e.E(x,y,rx,ry,a),[GR[0],GR[1],GR[2],GR[3]],[0.6,1,1.2,1],'y',y-ry,y+ry); e.ln(x-Math.cos(a)*rx*0.8,y-Math.sin(a)*rx*0.8,x+Math.cos(a)*rx*0.8,y+Math.sin(a)*rx*0.8,0.4,GR[3]); });
        e.ell(12.6,14.6,0.9,0.9,'#d8d040'); e.ell(12.4,14.4,0.4,0.4,'#fff4a0'); },
      (e)=>{ const SH=['#ffd8c0','#ff9a70','#e0603c','#a8361e'];
        e.arc(19.4,12.6,2.8,2.4,-0.1*Math.PI,1.15*Math.PI,1.9,SH[2]); e.arc(19.4,12.4,2.8,2.4,0.05*Math.PI,0.9*Math.PI,0.7,SH[1]); e.arc(19.4,12.2,2.6,2,1.05*Math.PI,1.6*Math.PI,0.6,SH[0]);
        for(let k=0;k<4;k++){ const a=0.1*Math.PI+k*0.25*Math.PI; e.ln(19.4+Math.cos(a)*2,12.6+Math.sin(a)*1.6,19.4+Math.cos(a)*3.7,12.6+Math.sin(a)*3.2,0.4,SH[3]); }
        e.poly([[16.6,12.2],[15,10.4],[15.4,13],[16.8,13.2]],SH[1]); e.ell(22.2,11.6,0.5,0.5,DK);
        sp(e,27.6,6.8,1.1,YL[0]); },
    ],
  };
  function moonArt(e,M){
    e.band(e.E(24,8.4,6.4,6.4),[M[0],M[1],M[2],M[3]],[0.6,1.2,1.6,1.2],'y',2,14.8);
    e.ell(22,7,1.4,1.2,M[3]); e.ell(26.2,10.4,1.8,1.4,M[3]); e.ell(25.4,5.4,0.9,0.8,M[3]); e.ell(22.4,11.4,0.8,0.7,M[4]);
    e.arc(24,8.4,5.4,5.4,Math.PI*1.1,Math.PI*1.45,0.7,'#ffffff');
  }
  function mapArt(e){
    const LT=['#fff4d8','#f0d8a0','#d8b878','#b0905a'], DKP=['#ecd098','#d0ae70','#a88850','#806438'];
    const P=[[[2,13.4],[10,11.8],[10,28.4],[2,30]],[[10,11.8],[18,13.4],[18,30],[10,28.4]],[[18,13.4],[26.6,11.8],[26.6,28.4],[18,30]]];
    P.forEach((p,i)=>e.band(p,i===1?DKP:LT,[0.6,1.2,1.6,1],'y',11.8,30));
    e.within(P[0],()=>{ e.poly([[3,20],[6,15.6],[9,20]],'#6a9a50'); e.poly([[5,20],[6,17.4],[7.4,20]],'#a8d080'); });
    e.within(P[2],()=>{ e.arc(23,28,5,4,Math.PI*1.1,Math.PI*1.7,1,'#4a8ad0'); });
    const rt=[[4.4,26.4],[8.4,23.4],[12.6,24.6],[15.4,20.4],[19.4,21],[21.4,17.6]];
    for(let i=0;i<rt.length-1;i++){ const [x0,y0]=rt[i],[x1,y1]=rt[i+1]; e.ln(x0,y0,x0+(x1-x0)*0.55,y0+(y1-y0)*0.55,1,RD[2]); }
    e.ln(20.6,14.6,24.6,18.6,1.3,RD[3]); e.ln(24.6,14.6,20.6,18.6,1.3,RD[3]); e.ln(20.8,14.4,24.4,18,0.6,RD[1]); e.ln(24.4,14.4,20.8,18,0.6,RD[1]);
    e.rect(9.6,11.8,0.8,16.6,DKP[3]); e.rect(17.6,13.4,0.8,16.6,LT[3]);
  }

  // ---------------- composição ----------------
  function layer(px,K,fn){
    return compose({FW:px,FH:px,GROUND:px+16,step:5,rim:RIM,M:{},
      parts:[{draw:(c,u)=>{ c.setTransform(K,0,0,K,0,0); fn(ITEMS.KIT(c,u)); c.setTransform(1,0,0,1,0,0); }}]});
  }
  const hexRgb=PIX.hexRgb;
  // estado destacado: tons mais claros (contorno intacto) + aro de 1 px na cor de destaque
  function highlight(g,px,acc){
    const img=g.getImageData(0,0,px,px), d=img.data, O=hexRgb(OUTLINE), A=hexRgb(acc), N=px*px;
    const a=new Uint8Array(N); for(let i=0;i<N;i++) a[i]=d[i*4+3]>0?1:0;
    for(let i=0;i<N;i++){ if(!a[i]) continue; const q=i*4; if(d[q]===O[0]&&d[q+1]===O[1]&&d[q+2]===O[2]) continue;
      d[q]=d[q]+(255-d[q])*0.22; d[q+1]=d[q+1]+(250-d[q+1])*0.2; d[q+2]=d[q+2]+(235-d[q+2])*0.16; }
    for(let y=0;y<px;y++) for(let x=0;x<px;x++){ const i=y*px+x; if(a[i]) continue;
      if((x>0&&a[i-1])||(x<px-1&&a[i+1])||(y>0&&a[i-px])||(y<px-1&&a[i+px])){ const q=i*4; d[q]=A[0]; d[q+1]=A[1]; d[q+2]=A[2]; d[q+3]=255; } }
    g.putImageData(img,0,0);
  }
  const cache=new Map();
  function icon(id,px=40,state='n'){
    if(!S[id]) id='build';
    const key=id+'|'+px+'|'+state; if(cache.has(key)) return cache.get(key);
    const old=PIX.getK(), K=px/SIZE;
    const out=document.createElement('canvas'); out.width=out.height=px;
    const g=out.getContext('2d',{willReadFrequently:true}); g.imageSmoothingEnabled=false;
    try{ PIX.setK(K); for(const fn of S[id]) g.drawImage(layer(px,K,fn),0,0); }
    finally{ PIX.setK(old); }
    if(state==='h') highlight(g,px,ACC[id]);
    cache.set(key,out); return out;
  }
  return {IDS,ACC,SIZE,icon};
})();

/* ===== shared/heroi ===== */
/* HEROI — fonte de arte (editável). Build: npm run art */
/* Sobrevivente customizável em hi-bit: esqueleto 2D com proporção heroica (cabeça/mãos/pés grandes,
   ombros largos), roupa com dobras/costuras, rosto expressivo, arma escolhida em cfg.arma/cfg.tier. */
const HEROI=(function(){
  const {rad,ramp,mix,lp,lerp,P2,ik,mkPen,compose}=PIX;
  const FW=184, FH=150, GROUND=144, AX=92, RIM='#a9c8f0';
  const CAT={
    pele:['#f6d7c0','#eec4a2','#e0ac84','#c8925e','#b07a4a','#96603a','#7e4f32','#643c26','#4e2e1e','#3a2216'],
    cabeloCor:['#14100c','#2a1c14','#4a3020','#7a4a28','#a8743a','#d8b060','#e8dcc0','#8a8a8a','#c83a4a','#3a6ad8','#7a3ab0','#3ab07a'],
    olhos:['#4a2a18','#24160e','#3a6a3a','#3a5a9a','#8a6a2a','#5a5a6a'],
    roupa:['#e8e4d8','#2a2a32','#c83a3a','#3a6ad0','#2f8a4a','#e8b830','#e87a30','#7a3ab0','#6a4a32','#8a8a96','#3ac0c0','#e86aa0'],
    calcaCor:['#2e3a5e','#1e1e26','#5a5a62','#6a5a3a','#3a4a2e','#8a6a4a','#c8c0b0','#7a2a2a'],
    tenis:['#e8e4d8','#1e1e26','#c83a3a','#3a6ad0','#e8b830','#2f8a4a'],
    accCor:['#c83a3a','#1e1e26','#3a6ad0','#e8b830','#2f8a4a','#e8e4d8'],
  };
  const OPT={
    corpo:{m:'Masculino',f:'Feminino'},
    cabelo:{careca:'Careca',raspado:'Raspado',curto:'Curto',black:'Black power',moicano:'Moicano',tranca:'Trança',coque:'Coque',longo:'Longo'},
    barba:{nenhuma:'Nenhuma',porfazer:'Por fazer',bigode:'Bigode',cavanhaque:'Cavanhaque',cheia:'Cheia'},
    sobr:{reta:'Reta',grossa:'Grossa',fina:'Fina',arqueada:'Arqueada'},
    top:{camiseta:'Camiseta',regata:'Regata',moletom:'Moletom'},
    calca:{calca:'Calça',bermuda:'Bermuda'},
    acc:{nenhum:'Nenhum',bone:'Boné',oculos:'Óculos',bandana:'Bandana',fone:'Fone'},
  };
  const DEFAULT={nome:'Sobrevivente',corpo:'m',pele:'#b07a4a',cabelo:'curto',cabeloCor:'#2a1c14',barba:'porfazer',sobr:'reta',olhos:'#4a2a18',top:'camiseta',topCor:'#c83a3a',calca:'calca',calcaCor:'#2e3a5e',tenis:'#e8e4d8',acc:'nenhum',accCor:'#1e1e26'};
  function random(){ const pk=a=>a[Math.floor(Math.random()*a.length)], pko=o=>pk(Object.keys(o));
    const corpo=pko(OPT.corpo); return {nome:pk(['Dona Lia','Zé Biu','Kel','Tonho','Neide','Bia','Juca','Rai']),corpo,pele:pk(CAT.pele),cabelo:pko(OPT.cabelo),cabeloCor:pk(CAT.cabeloCor),barba:corpo==='f'?'nenhuma':pko(OPT.barba),sobr:pko(OPT.sobr),olhos:pk(CAT.olhos),top:pko(OPT.top),topCor:pk(CAT.roupa),calca:pko(OPT.calca),calcaCor:pk(CAT.calcaCor),tenis:pk(CAT.tenis),acc:pko(OPT.acc),accCor:pk(CAT.accCor)}; }
  // saturação +18% mantendo o hue shift (luz → amarelo quente, sombra → roxo)
  function satb(h,k){ let [r,g,b]=PIX.hexRgb(h).map(v=>v/255); const mx=Math.max(r,g,b), mn=Math.min(r,g,b), l=(mx+mn)/2; let s=0,hh=0;
    if(mx!==mn){ const d=mx-mn; s=l>0.5?d/(2-mx-mn):d/(mx+mn); hh=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4; hh/=6; }
    s=Math.min(1,s*k); if(!s) return h; const q=l<0.5?l*(1+s):l+s-l*s, pp=2*l-q, fn=t=>{ t=(t+1)%1; return t<1/6?pp+(q-pp)*6*t:t<1/2?q:t<2/3?pp+(q-pp)*(2/3-t)*6:pp; };
    return PIX.toHex(fn(hh+1/3)*255,fn(hh)*255,fn(hh-1/3)*255); }
  const R4=(h,k=1.18)=>{ const b=satb(h,k); return [mix(b,'#fff2cc',.36),b,mix(b,'#3b2c63',.48),mix(b,'#1c1233',.74)]; };
  const RX=(h,k=1.18)=>{ const b=satb(h,k); return [mix(b,'#fff2cc',.64),mix(b,'#ffe0a8',.17),mix(b,'#4a3470',.26),mix(b,'#100a20',.86)]; };
  function mats(c){
    return {
      skin:R4(c.pele,1.15), skinX:RX(c.pele,1.15), hair:R4(c.cabeloCor), hairX:RX(c.cabeloCor), top:R4(c.topCor), topX:RX(c.topCor), pants:R4(c.calcaCor), pantsX:RX(c.calcaCor), shoe:R4(c.tenis,1.1), shoeX:RX(c.tenis,1.1),
      stub:ramp(mix(c.pele,c.cabeloCor==='#e8dcc0'?'#6a5a4a':c.cabeloCor,0.42)),
      sole:['#ffffff','#e8e4dc','#b0aaa0','#6e6a64'], iris:ramp(c.olhos), acc:ramp(c.accCor),
      belt:['#8a6440','#5a3c22','#3a2414','#1e120a'], buckle:['#fff4c0','#d8b860','#8a7030','#4a3a14'],
      eye:['#ffffff','#f4efe6','#b8b4a8','#6e6a60'], mouth:['#b04a5a','#5a1c2c','#2a0c18','#1a0610'], teeth:['#fffbe8','#e8e0c0','#b0a680','#6a6040'],
      lens:['#bfe8ff','#2a3a5a','#1a2440','#0c1222'], metal:['#ffffff','#c8ccd4','#8a8ea0','#4a4e60'],
      smear:['#ffffff','#fff6d0','#e8d8a0','#b8a870'],
    };
  }
  /* ---------------- poses ---------------- */
  const REST={hx:0,lean:-2,head:0,aFs:4,aFe:14,aBs:-8,aBe:6,lFh:4,lFk:-2,lBh:-6,lBk:-8,bat:-10,inhand:1,mouth:0,smear:0,sa:0,flash:0,impact:0,brow:0,rot:0,lift:0,blink:0,gun:0,gy:0,rk:0,mf:0,chg:0,plant:1,tw:0,br:0};
  // bA = ângulo absoluto do bastão (vira bat relativo ao antebraço)
  const K_=o=>{ const r=Object.assign({},o); if(r.bA!==undefined){ r.bat=r.bA-(r.aFe!==undefined?r.aFe:REST.aFe); delete r.bA; } return r; };
  const ST={lFh:52,lFk:8,lBh:-42,lBk:-46};                 // base de luta (larga e baixa)
  const LUNGE={lFh:62,lFk:12,lBh:-46,lBk:-48};
  const GUARD=Object.assign({},ST,K_({aFs:70,aFe:86,bA:128,aBs:46,aBe:112,lean:12,brow:1}));
  const G=o=>{ const r=K_(o); if(!r.nowide){ if(r.lFh!==undefined){ r.lFh+=14; r.lFk=(r.lFk||0)+3; } if(r.lBh!==undefined){ r.lBh-=12; r.lBk=(r.lBk!==undefined?r.lBk:-30)-10; } } return Object.assign({},GUARD,r); };
  const th=(p,o)=>6+24*Math.sin(p+o), sh=(p,o)=>th(p,o)-34*Math.max(0,Math.cos(p+o));
  const S=Math.sin;
  const ANIMS={
    idle:{nome:'Parado',n:8,dur:()=>140,pose:(i,w)=>{ const p=i/8*Math.PI*2, s=S(p);
      if(w) return {gun:1,gy:52+2*s,lean:4+1.2*s,br:s,hx:1.2*S(p/2),head:6+0.6*S(p-0.6),lFh:26,lFk:4+2*s,lBh:-22,lBk:-24+2*s,blink:i===5?1:0};
      return K_({lean:4+1.4*s,br:s,hx:1.2*S(p/2),head:1.2*S(p-0.7),lFh:26,lFk:4+2.2*s,lBh:-22,lBk:-24+2.2*s,aFs:10+2*s,aFe:36+3*s,bA:-34+3*s,aBs:-14+2*s,aBe:18+3*s,blink:i===5?1:0}); }},
    walk:{nome:'Andar',n:8,dur:()=>110,pose:(i,w)=>{ const p=i/8*Math.PI*2;
      const o={plant:0,lFh:th(p,0),lFk:sh(p,0),lBh:th(p,Math.PI),lBk:sh(p,Math.PI),lean:2+1.4*S(2*p),head:S(2*p-0.6)};
      if(w) return Object.assign(o,{gun:1,gy:48+3*S(2*p)});
      return Object.assign(o,K_({aFs:10-18*S(p),aFe:34-14*S(p),bA:-40-10*S(p),aBs:-6+20*S(p),aBe:10+22*S(p)})); }},
    run:{nome:'Correr',n:8,dur:()=>72,pose:(i,w)=>{ const p=i/8*Math.PI*2, t=o=>12+46*S(p+o), k=o=>t(o)-18-76*Math.max(0,Math.cos(p+o));
      return K_({plant:0,lFh:t(0),lFk:k(0),lBh:t(Math.PI),lBk:k(Math.PI),lean:22+3*S(2*p),head:-14,lift:2+3*Math.abs(S(p)),aFs:30-48*S(p),aFe:96-36*S(p),bA:w?110-20*S(p):60-14*S(p),aBs:10+50*S(p),aBe:90+30*S(p),brow:1,mouth:1}); }},
    guard:{nome:'Guarda',n:8,dur:()=>120,pose:(i,w)=>{ const p=i/8*Math.PI*2, s=S(p);
      if(w) return Object.assign({},ST,{gun:1,gy:2*s,lean:3+0.8*s,head:-2,lFk:5+1.5*s,lBk:-38+1.5*s,brow:1,blink:i===6?1:0});
      return Object.assign({},GUARD,K_({lean:8+1.2*s,aFs:70+3*s,aFe:86+4*s,bA:128+3*s,aBs:46+2*s,aBe:112+3*s,lFk:5+1.6*s,lBk:-38+1.6*s,head:-2+s,blink:i===6?1:0})); }},
    advance:{nome:'Avançar',n:8,dur:()=>95,pose:(i,w)=>{ const p=i/8*Math.PI*2;
      const o={plant:0,lFh:10+22*S(p),lFk:10+22*S(p)-30*Math.max(0,Math.cos(p)),lBh:10+22*S(p+Math.PI),lBk:10+22*S(p+Math.PI)-30*Math.max(0,Math.cos(p+Math.PI)),lean:7+1.5*S(2*p),head:-3};
      if(w) return Object.assign(o,{gun:1,gy:3*S(2*p),brow:1});
      return Object.assign({},GUARD,K_(Object.assign(o,{aFs:70+5*S(p),aFe:86,bA:128,aBs:46-6*S(p),aBe:112}))); }},
    combo:{nome:'Combo com bastão',n:12,hits:{2:1,6:2,10:3},dur:i=>[110,50,60,90,80,40,60,90,110,60,70,170][i],pose:i=>G([
      {tw:-0.3,aFs:-40,aFe:-130,bA:200,lean:-12,head:-4,hx:-4,lFh:22,lFk:0,lBh:-18,lBk:-28,aBs:40,aBe:100,mouth:1},
      {aFs:40,aFe:120,bA:168,lean:2,hx:1,lFh:30,lBh:-24,lBk:-34,aBs:20,aBe:60},
      {tw:0.85,aFs:84,aFe:94,bA:100,lean:30,hx:13,head:-12,mouth:2,smear:1,sa:205,aBs:-50,aBe:-20,lFh:50,lFk:10,lBh:-32,lBk:-36},
      {tw:0.7,aFs:62,aFe:46,bA:22,lean:30,hx:13,head:-10,mouth:1,aBs:-50,aBe:-10,lFh:50,lFk:10,lBh:-32,lBk:-36},
      {tw:-0.2,aFs:12,aFe:64,bA:-40,lean:4,hx:6,aBs:10,aBe:60,lFh:34,lFk:4,lBh:-26,lBk:-36},
      {aFs:44,aFe:84,bA:24,lean:2,hx:5,aBs:-10,aBe:30,lFh:36,lFk:6,lBh:-28,lBk:-38},
      {tw:0.8,aFs:128,aFe:150,bA:140,lean:-2,hx:12,head:-10,mouth:2,smear:2,sa:12,aBs:-60,aBe:-30,lFh:50,lFk:10,lBh:-32,lBk:-36},
      {tw:0.6,aFs:152,aFe:176,bA:180,lean:-6,hx:12,head:-12,mouth:1,aBs:-60,aBe:-40,lFh:50,lFk:10,lBh:-32,lBk:-36},
      {aFs:168,aFe:204,bA:232,lean:-14,hx:4,head:-8,brow:1,mouth:1,lift:2,plant:0,lFh:46,lFk:-14,lBh:-8,lBk:-56,aBs:150,aBe:170},
      {aFs:176,aFe:210,bA:244,lean:-16,hx:6,mouth:1,lift:9,plant:0,lFh:62,lFk:-8,lBh:14,lBk:-56,aBs:160,aBe:180},
      {tw:0.9,aFs:70,aFe:56,bA:18,lean:38,hx:15,head:-14,mouth:2,brow:1,smear:3,sa:232,impact:1,aBs:-60,aBe:-30,lFh:54,lFk:12,lBh:-32,lBk:-36},
      {tw:0.7,aFs:64,aFe:50,bA:22,lean:34,hx:14,head:-12,mouth:1,aBs:-50,aBe:-20,lFh:54,lFk:12,lBh:-32,lBk:-36}][i])},
    comboB:{nome:'Combo B: giro, estocada, chute',n:11,dur:i=>[100,50,60,80,90,55,80,90,60,90,140][i],
      hits:{2:1,5:2,8:3}, hitsx:{2:{m:1},5:{m:1.2,reach:52},8:{m:1.8,heavy:1}},
      pose:i=>G([
        {aFs:-60,aFe:-30,bA:140,lean:-6,head:-6,hx:-2,lFh:22,lBh:-20,lBk:-30,aBs:30,aBe:80},
        {aFs:20,aFe:40,bA:100,lean:6,hx:2,smear:1,sa:250,lFh:30,lBh:-24,lBk:-32,aBs:-10,aBe:20},
        {tw:0.8,aFs:94,aFe:98,bA:92,lean:26,hx:12,head:-10,smear:1,sa:205,mouth:2,lFh:48,lFk:10,lBh:-32,lBk:-36,aBs:-50,aBe:-20},
        {aFs:112,aFe:130,bA:110,lean:10,hx:7,lFh:40,lFk:6,lBh:-30,lBk:-44,aBs:-40,aBe:-10},
        {aFs:-24,aFe:60,bA:90,lean:-2,hx:2,lFh:26,lBh:-20,lBk:-30,aBs:40,aBe:100,brow:1},
        {tw:1,aFs:88,aFe:90,bA:92,lean:32,hx:16,head:-14,mouth:2,smear:1,sa:120,lFh:52,lFk:12,lBh:-32,lBk:-36,aBs:-60,aBe:-40},
        {tw:0.9,aFs:88,aFe:90,bA:92,lean:30,hx:16,head:-12,lFh:52,lFk:12,lBh:-32,lBk:-36,aBs:-60,aBe:-40},
        {aFs:30,aFe:72,bA:130,lean:-8,hx:5,plant:0,lFh:70,lFk:-10,lBh:-6,lBk:-10,aBs:40,aBe:90},
        {aFs:10,aFe:62,bA:130,lean:-18,hx:9,plant:0,lFh:92,lFk:96,lBh:-4,lBk:-6,mouth:2,brow:1,impact:1,aBs:50,aBe:110},
        {aFs:12,aFe:64,bA:132,lean:-14,hx:9,plant:0,lFh:84,lFk:86,lBh:-4,lBk:-6,aBs:50,aBe:110},
        {lean:2,hx:5,lFh:30,lFk:4,lBh:-22,lBk:-30}][i])},
    special:{nome:'Especial',n:8,dur:i=>[140,110,90,170,150,120,120,140][i],pose:(i,w)=>{
      if(w==='pistola') return Object.assign({},ST,[
        {gun:1,gy:8,brow:1,mouth:1,lean:2},{gun:1,gy:0,brow:1,mouth:1,lean:4},
        {gun:1,gy:-2,rk:1,mf:1,mouth:2,brow:1,lean:-2,hx:-1},{gun:1,gy:-6,rk:0.6,mf:0,mouth:2,brow:1},
        {gun:1,gy:-2,rk:1,mf:1,mouth:2,brow:1,lean:-2,hx:-1},{gun:1,gy:2,rk:1,mf:1,mouth:2,brow:1,hx:-1},
        {gun:1,gy:0,rk:0.3,mouth:1,brow:1},{gun:1,gy:6,mouth:3}][i]);
      if(w==='laser') return Object.assign({},LUNGE,[
        {gun:1,gy:4,chg:0.5,brow:1,mouth:1,lean:4},{gun:1,gy:0,chg:1,brow:1,mouth:1,lean:6},
        {gun:1,gy:0,rk:1.4,mf:2,mouth:2,brow:1,lean:-6,hx:-3},{gun:1,gy:-2,rk:1.2,mf:2,mouth:2,brow:1,lean:-6,hx:-3},
        {gun:1,gy:-2,rk:1,mf:2,mouth:2,brow:1,lean:-4,hx:-2},{gun:1,gy:-4,rk:0.6,mouth:1,lean:0},
        {gun:1,gy:0,rk:0.2,lean:2},{gun:1,gy:4,mouth:3,lean:2}][i]);
      return G([
        {aFs:150,aFe:186,bA:226,lean:-10,brow:1,mouth:1,lFh:40,lFk:-14,lBh:-14,lBk:-50,aBs:150,aBe:180},
        {aFs:176,aFe:204,bA:240,lean:-16,brow:1,mouth:2,lift:14,plant:0,lFh:64,lFk:0,lBh:18,lBk:-40,aBs:170,aBe:190},
        {aFs:66,aFe:44,bA:26,lean:34,hx:10,mouth:2,brow:1,smear:3,sa:236,impact:2,lFh:90,lFk:-14,lBh:6,lBk:-96,aBs:-30,aBe:10},
        {aFs:64,aFe:42,bA:24,lean:32,hx:10,mouth:2,brow:1,impact:1,lFh:90,lFk:-14,lBh:6,lBk:-96,aBs:-30,aBe:10},
        {aFs:62,aFe:42,bA:24,lean:30,hx:9,mouth:1,brow:1,lFh:90,lFk:-14,lBh:6,lBk:-96,aBs:-20,aBe:20},
        {aFs:50,aFe:60,bA:60,lean:20,hx:6,lFh:54,lFk:-8,lBh:-28,lBk:-62,aBs:0,aBe:40},
        {aFs:34,aFe:76,bA:110,lean:8,hx:3,lFh:34,lFk:2,lBh:-24,lBk:-34},
        {lean:5,mouth:3}][i]); }},
    roll:{nome:'Esquiva (rolamento)',n:6,dur:i=>[70,60,60,60,70,110][i],pose:i=>{
      const curl={lean:64,head:24,lFh:124,lFk:20,lBh:112,lBk:6,aFs:96,aFe:150,bA:96,aBs:80,aBe:140,plant:0,brow:1};
      return K_([
        Object.assign({},{lean:34,head:8,hx:-4,lFh:50,lFk:-20,lBh:-10,lBk:-60,aFs:40,aFe:96,bA:110,aBs:40,aBe:100,brow:1}),
        Object.assign({},curl,{rot:80,hx:0}), Object.assign({},curl,{rot:170,hx:4}),
        Object.assign({},curl,{rot:260,hx:8}), Object.assign({},curl,{rot:330,hx:11,lean:50}),
        {lean:22,hx:12,head:-2,lFh:70,lFk:-12,lBh:2,lBk:-90,aFs:30,aFe:80,bA:120,aBs:30,aBe:80,brow:1}][i]); }},
    hurt:{nome:'Dano',n:4,dur:i=>[80,110,130,160][i],pose:i=>G([
      {lean:-16,head:-16,hx:-6,flash:1,aFs:-14,aFe:24,bA:110,aBs:-36,aBe:-14,mouth:2,brow:2,lFh:18,lBh:-6,lBk:-12},
      {lean:-12,head:-12,hx:-5,aFs:-2,aFe:34,bA:110,aBs:-26,aBe:-4,mouth:2,brow:2,blink:1,lFh:18,lBh:-8,lBk:-16},
      {lean:-4,head:-4,hx:-2,aFs:16,aFe:56,bA:120,mouth:1,brow:2},
      {}][i])},
    hurtB:{nome:'Dano: cabeça pra trás',n:4,dur:i=>[80,110,130,150][i],pose:i=>G([
      {lean:-20,head:-30,hx:-7,flash:1,aFs:-34,aFe:-12,bA:100,aBs:-44,aBe:-24,mouth:2,brow:2,blink:1,lFh:22,lBh:-4,lBk:-10},
      {lean:-16,head:-24,hx:-6,aFs:-24,aFe:8,bA:110,aBs:-34,aBe:-14,mouth:2,brow:2,lFh:20,lBh:-6,lBk:-12},
      {lean:-6,head:-8,hx:-3,aFs:10,aFe:46,mouth:1,brow:2},{}][i])},
    hurtC:{nome:'Dano: dobra no estômago',n:4,dur:i=>[80,120,130,150][i],pose:i=>G([
      {lean:36,head:16,hx:-4,flash:1,aFs:54,aFe:20,bA:80,aBs:44,aBe:10,mouth:2,brow:2,blink:1,lFh:22,lFk:-10,lBh:-8,lBk:-22},
      {lean:30,head:14,hx:-3,aFs:46,aFe:24,bA:80,aBs:38,aBe:14,mouth:2,brow:2,lFh:20,lFk:-8,lBh:-8,lBk:-20},
      {lean:12,head:4,hx:-1,mouth:1,brow:2},{}][i])},
    fall:{nome:'Derrubado',n:7,dur:i=>[90,110,110,90,110,160,400][i],pose:i=>K_([
      {lean:-26,head:-20,hx:-4,flash:1,lift:4,plant:0,mouth:2,brow:2,aFs:-40,aFe:-90,bA:160,aBs:-60,aBe:-120,lFh:30,lFk:10,lBh:-4,lBk:-20},
      {rot:-38,lean:-10,head:-14,hx:2,lift:20,plant:0,mouth:2,brow:2,blink:1,aFs:150,aFe:170,bA:200,aBs:170,aBe:200,lFh:50,lFk:30,lBh:30,lBk:10},
      {rot:-72,lean:-4,head:-10,hx:12,lift:12,plant:0,mouth:2,brow:2,blink:1,aFs:160,aFe:190,bA:220,aBs:180,aBe:210,lFh:40,lFk:40,lBh:20,lBk:20},
      {rot:-90,lean:0,head:-14,hx:22,flash:0,plant:0,mouth:2,brow:2,blink:1,aFs:140,aFe:160,bA:190,aBs:170,aBe:200,lFh:30,lFk:40,lBh:14,lBk:24},
      {rot:-86,lean:-2,head:-6,hx:23,lift:4,plant:0,mouth:1,brow:2,blink:1,aFs:150,aFe:180,bA:200,aBs:176,aBe:210,lFh:24,lFk:30,lBh:10,lBk:16},
      {rot:-90,lean:0,head:-2,hx:24,plant:0,mouth:1,brow:2,blink:1,aFs:150,aFe:170,bA:150,aBs:180,aBe:200,lFh:16,lFk:16,lBh:8,lBk:6},
      {rot:-90,lean:0,head:0,hx:24,plant:0,mouth:0,brow:2,blink:1,aFs:146,aFe:166,bA:140,aBs:176,aBe:196,lFh:14,lFk:12,lBh:6,lBk:4}][i])},
    getup:{nome:'Levantar',n:6,dur:i=>[140,130,130,120,110,120][i],pose:i=>K_([
      {rot:-90,hx:24,head:4,plant:0,brow:2,aFs:146,aFe:166,bA:140,aBs:176,aBe:196,lFh:14,lFk:12,lBh:6,lBk:4},
      {lean:32,head:-6,hx:16,plant:0,brow:2,mouth:1,lFh:84,lFk:92,lBh:70,lBk:110,aFs:30,aFe:70,bA:100,aBs:-50,aBe:-30},
      {lean:24,head:-4,hx:10,brow:1,mouth:1,lFh:90,lFk:-14,lBh:6,lBk:-96,aFs:40,aFe:80,bA:110,aBs:20,aBe:50},
      {lean:20,head:-4,hx:6,brow:1,lFh:54,lFk:-8,lBh:-28,lBk:-62,aFs:30,aFe:80,bA:120,aBs:30,aBe:80},
      Object.assign({},GUARD,{lean:10,hx:2,aFs:30,aFe:80,bat:46}),
      Object.assign({},GUARD)][i])},
    victory:{nome:'Vitória',n:8,dur:i=>[140,90,90,90,120,160,200,400][i],pose:(i,w)=>{
      const top=w?{gun:0,aFs:166,aFe:176,bA:176}:{aFs:166,aFe:176,bA:178};
      return K_([
        Object.assign({},GUARD,{lean:2,mouth:3,brow:3}),
        {lFh:18,lFk:2,lBh:-16,lBk:-18,lean:-2,aFs:60,aFe:120,bA:200,aBs:-20,aBe:20,mouth:3,brow:3},
        {lFh:18,lFk:2,lBh:-16,lBk:-18,lean:-4,aFs:100,aFe:150,bA:300,aBs:-20,aBe:20,mouth:3,brow:3,smear:1,sa:40},
        {lFh:18,lFk:2,lBh:-16,lBk:-18,lean:-6,aFs:130,aFe:170,bA:400,aBs:-20,aBe:20,mouth:3,brow:3},
        Object.assign({lFh:22,lFk:4,lBh:-20,lBk:-22,lean:-8,head:-10,aBs:-30,aBe:40,mouth:2,brow:3,lift:3,plant:0},top),
        Object.assign({lFh:22,lFk:4,lBh:-20,lBk:-22,lean:-8,head:-12,aBs:-30,aBe:40,mouth:2,brow:3},top),
        Object.assign({lFh:22,lFk:4,lBh:-20,lBk:-22,lean:-6,head:-8,aBs:-34,aBe:44,mouth:3,brow:3},top),
        Object.assign({lFh:22,lFk:4,lBh:-20,lBk:-22,lean:-6,head:-6,aBs:-34,aBe:44,mouth:3,brow:3,blink:0},top)][i]); }},
    shoot:{nome:'Tiro rápido (pistola)',n:6,fireAt:[1],dur:i=>[90,60,70,80,110,120][i],gunKind:'pistola',pose:i=>Object.assign({},ST,[
      {gun:1,gy:24,lean:2,brow:1},{gun:1,gy:0,rk:1.2,mf:1,mouth:1,brow:1,lean:-2,hx:-1},
      {gun:1,gy:-4,rk:0.7,brow:1,lean:-1,hx:-1},{gun:1,gy:-1,rk:0.2,brow:1},
      {gun:1,gy:0,brow:1,lean:3},{gun:1,gy:1,brow:1,lean:3,blink:1}][i])},
    charge:{nome:'Carregar laser',n:6,dur:()=>90,gunKind:'laser',pose:i=>Object.assign({},LUNGE,
      {gun:1,gy:0,chg:0.25+0.75*(i/5),lean:5+0.6*S(i*2.1),hx:(i%2?0.6:-0.6),brow:1,mouth:i>2?1:0})},
    fire:{nome:'Disparo laser',n:5,dur:i=>[70,110,110,120,140][i],gunKind:'laser',pose:i=>Object.assign({},LUNGE,[
      {gun:1,gy:0,chg:1,rk:0.4,mf:2,mouth:2,brow:1,lean:2},{gun:1,gy:-3,rk:1.5,mf:2,mouth:2,brow:1,lean:-6,hx:-3},
      {gun:1,gy:-4,rk:1.1,mf:1,mouth:2,brow:1,lean:-5,hx:-3},{gun:1,gy:-2,rk:0.5,mouth:1,brow:1,lean:-1,hx:-1},{gun:1,gy:0,brow:1,lean:3}][i])},
    // tiro duplo: dois disparos seguidos, o segundo com o coice maior (mão sobe e o corpo recua)
    shoot2:{nome:'Tiro duplo (pistola)',n:8,gunKind:'pistola',fireAt:[1,4],fireMul:0.85,dur:i=>[90,60,60,60,60,80,110,120][i],pose:i=>Object.assign({},ST,[
      {gun:1,gy:20,lean:4,brow:1},{gun:1,gy:0,rk:1.2,mf:1,mouth:1,brow:1,lean:-2,hx:-1},
      {gun:1,gy:-4,rk:0.8,brow:1,lean:-2,hx:-1},{gun:1,gy:-1,rk:0.2,brow:1,lean:1},
      {gun:1,gy:-2,rk:1.6,mf:1,mouth:2,brow:1,lean:-5,hx:-3},{gun:1,gy:-8,rk:1,brow:1,lean:-4,hx:-3},
      {gun:1,gy:-2,rk:0.3,brow:1,lean:0,hx:-1},{gun:1,gy:1,brow:1,lean:3}][i])},
    // coronhada: de colado, ergue a arma e desce a coronha na cabeça do zumbi (empurra e derruba)
    whip:{nome:'Coronhada (de perto)',n:8,gunMelee:3,fin:'knock',hits:{4:1},hitsx:{4:{m:1.4,heavy:1,knock:1,reach:36}},move:[0,0,30,40,10,0,0,0],dur:i=>[80,100,40,50,130,90,90,110][i],pose:i=>G([
      {aFs:100,aFe:130,bA:200,lean:0,head:-4,lFh:30,lFk:4,lBh:-24,lBk:-36,aBs:60,aBe:110,brow:1},
      {aFs:160,aFe:190,bA:250,lean:-12,hx:-3,head:-8,lFh:28,lFk:2,lBh:-24,lBk:-38,aBs:110,aBe:150,brow:1,mouth:1},
      {aFs:130,aFe:140,bA:200,lean:6,hx:6,head:-10,smear:1,sa:240,lFh:44,lFk:8,lBh:-30,lBk:-36,aBs:40,aBe:90,mouth:2},
      {tw:0.9,aFs:80,aFe:50,bA:110,lean:30,hx:13,head:-12,smear:3,sa:230,lFh:54,lFk:12,lBh:-32,lBk:-36,aBs:-40,aBe:-10,mouth:2,brow:1},
      {tw:1,aFs:70,aFe:36,bA:100,lean:34,hx:14,head:-12,impact:2,lFh:56,lFk:12,lBh:-32,lBk:-36,aBs:-50,aBe:-20,mouth:2,brow:1},
      {tw:0.7,aFs:60,aFe:40,bA:110,lean:28,hx:12,lFh:52,lFk:10,lBh:-32,lBk:-36,aBs:-30,aBe:0,mouth:1},
      {tw:0.3,aFs:60,aFe:80,bA:140,lean:16,hx:6,lFh:40,lFk:6,lBh:-28,lBk:-38,aBs:20,aBe:80},
      {}][i])},
    // rajada de laser: três pulsos curtos sem carregar (cada um mais fraco que o feixe carregado)
    burst:{nome:'Rajada (laser)',n:8,gunKind:'laser',fireAt:[1,3,5],fireMul:0.42,dur:i=>[90,70,60,70,60,70,110,120][i],pose:i=>Object.assign({},LUNGE,[
      {gun:1,gy:2,chg:0.3,brow:1,lean:4},{gun:1,gy:0,rk:0.8,mf:1,mouth:1,brow:1,lean:-1,hx:-1},
      {gun:1,gy:-2,rk:0.3,chg:0.2,brow:1,lean:1},{gun:1,gy:-1,rk:0.9,mf:1,mouth:2,brow:1,lean:-2,hx:-2},
      {gun:1,gy:-3,rk:0.3,chg:0.2,brow:1,lean:0,hx:-1},{gun:1,gy:-2,rk:1.2,mf:1,mouth:2,brow:1,lean:-4,hx:-3},
      {gun:1,gy:-4,rk:0.5,brow:1,lean:-1,hx:-1},{gun:1,gy:0,brow:1,lean:3}][i])},
  };
  Object.assign(ANIMS,STRIKES.tool(G,{names:{atkH:'Bastão: golpe horizontal',atkV:'Bastão: golpe por cima',atkS:'Bastão: estocada',atkSpin:'Bastão: giro',atkFin:'Bastão: finalizador (lança)'}}));
  // kit de beat 'em up + assinaturas por arma (fam: o motor só usa a da arma equipada)
  Object.assign(ANIMS,MOVESET.kit(G,{skip:{hurtC:1}}),MOVESET.sigs(G,{},[
    ['sigRebatida','homeRun','Rebatida (manda longe)',{fam:'bastao'}],
    ['sigEstocadas','tripleJab','Estocadas triplas',{fam:'bastao'}],
    ['sigChuteTiro','kickShot','Chute e tiro à queima-roupa',{fam:'pistola'}],
    ['sigRasteira','lowSweep','Rasteira de coronha',{fam:'pistola',cd:6}],
    ['sigLamina','bladeSlash','Lâmina de plasma',{fam:'laser'}],
    ['sigChuteFeixe','kickShot','Chute e disparo de feixe',{fam:'laser',fireMul:1.1}]]));
  const GUNANIMS={idle:1,walk:1,guard:1,advance:1,special:1,victory:1,run:1};
  function poseOf(anim,i,w){ const A=ANIMS[anim]; return Object.assign({},REST,A.pose(i,GUNANIMS[anim]?w:undefined)); }

  /* ---------------- esqueleto ---------------- */
  function legIK(H,A,L1,L2){
    const dx=A.x-H.x, dy=A.y-H.y, d=Math.max(Math.abs(L1-L2)+0.5,Math.min(L1+L2-0.05,Math.hypot(dx,dy)));
    const b=Math.atan2(dy,dx), q=Math.acos(Math.max(-1,Math.min(1,(L1*L1+d*d-L2*L2)/(2*L1*d))));
    const k1={x:H.x+Math.cos(b-q)*L1,y:H.y+Math.sin(b-q)*L1}, k2={x:H.x+Math.cos(b+q)*L1,y:H.y+Math.sin(b+q)*L1};
    return k1.x>k2.x?k1:k2;
  }
  function skeleton(P,c,kind){
    const f=c.corpo==='f', L1=f?20.5:21, L2=f?20:20.5, U=f?13:14, E=f?12:13, ro=P.rot||0, br=P.br||0;
    const r=rad(ro), cr=Math.cos(r), sr=Math.sin(r);
    const hip={x:AX+P.hx,y:80};
    const R=(lx,ly)=>({x:hip.x+lx*cr-ly*sr,y:hip.y+lx*sr+ly*cr});
    const hipF=R(f?3.6:5,0.6), hipB=R(f?-3.8:-5.4,0);
    const kneeF=lp(hipF,P.lFh-ro,L1), ankleF=lp(kneeF,P.lFk-ro,L2), kneeB=lp(hipB,P.lBh-ro,L1), ankleB=lp(kneeB,P.lBk-ro,L2);
    const a=rad(P.lean+ro), co=Math.cos(a), s=Math.sin(a);
    const T=(lx,ly)=>({x:hip.x+lx*co-ly*s, y:hip.y+lx*s+ly*co});
    const tw=P.gun&&kind?1:(P.tw||0), neck=T(1,-34-br*0.8), shF=T(((f?-9:-14)*0.5+1.2)*(1-tw)-1.5*tw,(f?-29:-29.8)-br*0.8), shB=T(((f?8.6:13.6)*0.5+1.2)*(1-tw)+7*tw,(f?-29.4:-30.2)-br*0.8);
    const ha=rad(P.lean+ro+P.head), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:neck.x+lx*hc-ly*hs, y:neck.y+lx*hs+ly*hc});
    let elF,wrF,elB,wrB,gAng=null,Gp=null;
    if(P.gun && kind){
      const A0=90-P.gy, d={x:Math.sin(rad(A0)),y:Math.cos(rad(A0))}, reach=kind==='laser'?22:26;
      Gp={x:shF.x+d.x*(reach-P.rk*3.6), y:shF.y+d.y*(reach-P.rk*3.6)-P.rk*0.8};
      let q=ik(shF,Gp,U,E,true); elF=q.E; wrF=q.W;
      const tB=kind==='laser'?{x:Gp.x+d.x*10-d.y*1.4,y:Gp.y+d.y*10+d.x*1.4+0.6}:{x:Gp.x+0.8,y:Gp.y+3.4};
      q=ik(shB,tB,U,E,true); elB=q.E; wrB=q.W;
      const Ag=A0+P.rk*14; gAng=Math.atan2(Math.cos(rad(Ag)),Math.sin(rad(Ag)));
    } else {
      elF=lp(shF,P.aFs-ro,U); wrF=lp(elF,P.aFe-ro,E); elB=lp(shB,P.aBs-ro,U); wrB=lp(elB,P.aBe-ro,E);
    }
    const bAng=P.aFe+P.bat-ro, bDir=Math.atan2(Math.cos(rad(bAng)),Math.sin(rad(bAng)));
    // chão: o ponto mais baixo do corpo encosta no GROUND (deitado, ajoelhado, em pé)
    const FT=FOOT(c), cont=[[ankleF,FT],[ankleB,FT],[kneeF,6],[kneeB,6],[hip,7],[T(-13,-6),2],[T(-15,-24),2],[T(14,-24),2],[T(0,-33),3],[H(2.9,-16.4),11.8],[wrF,5.4],[wrB,5.4]];
    let low=-1e9; cont.forEach(([q,rr])=>{ low=Math.max(low,q.y+rr); });
    const dy=GROUND-low-(P.lift||0);
    const all=[hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,neck,shF,shB,elF,wrF,elB,wrB]; if(Gp) all.push(Gp);
    all.forEach(q=>q.y+=dy);
    const sk={hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,neck,shF,shB,elF,wrF,elB,wrB,a,ha,H,T,bDir,gAng,ro,L1,L2,tw,br};
    // pé plantado: perna quase no chão encosta de vez (IK)
    if(P.plant && !P.lift && Math.abs(ro)<10){
      [['kneeF','ankleF','hipF'],['kneeB','ankleB','hipB']].forEach(([kn,an,hp])=>{
        const gap=GROUND-(sk[an].y+FT); if(gap>0.05 && gap<4.5){ const A={x:sk[an].x,y:sk[an].y+gap}; const k=legIK(sk[hp],A,L1,L2); sk[kn].x=k.x; sk[kn].y=k.y; sk[an].x=A.x; sk[an].y=A.y; }
      });
    }
    return sk;
  }

  /* ---------------- desenho ---------------- */
  // faixa encostada num lado do segmento (fica dentro da silhueta): lite=false → lado da sombra (esq/baixo)
  function band(p,a,b,wa,wb,col,f,lite,ins){
    const dx=b.x-a.x, dy=b.y-a.y, L=Math.hypot(dx,dy)||1; let nx=-dy/L, ny=dx/L;
    if((-nx+0.6*ny<0)!==!!lite){ nx=-nx; ny=-ny; }
    ins=ins||0; const oa=wa*(1-f)/2-ins, ob=wb*(1-f)/2-ins;
    p.F(col); p.cap({x:a.x+nx*oa,y:a.y+ny*oa},{x:b.x+nx*ob,y:b.y+ny*ob},wa*f,wb*f);
  }
  // volume esculpido de um segmento: 7 tons (quente → meio → base → sombra roxa grande → borda funda)
  function vol(p,a,b,wa,wb,R,X,o={}){
    p.F(R[1]); p.cap(a,b,wa,wb);
    band(p,a,b,wa,wb,X[2],0.66); band(p,a,b,wa,wb,R[2],0.46); band(p,a,b,wa,wb,R[3],0.16);
    if(!o.noLite){ const a2=lerp(a,b,o.l0||0.1), b2=lerp(a,b,o.l1||0.8); band(p,a2,b2,wa,wb,X[1],0.34,true,0.4); band(p,a2,b2,wa,wb,R[0],0.2,true,0.7); band(p,lerp(a,b,o.h0||0.25),lerp(a,b,o.h1||0.55),wa,wb,X[0],0.1,true,1); }
  }
  function sideOff(a,b,w,sgn){ const dx=b.x-a.x, dy=b.y-a.y, L=Math.hypot(dx,dy)||1; let nx=-dy/L, ny=dx/L; if(-nx+0.6*ny<0){ nx=-nx; ny=-ny; } return {x:nx*w*sgn,y:ny*w*sgn}; }
  function xfs(cx,a,ox,oy,sx,sy=1){ const K=PIX.getK(), c=Math.cos(a), s=Math.sin(a); cx.setTransform(c*sx*K,s*sx*K,-s*sy*K,c*sy*K,ox*K,oy*K); }
  function dome(cx,cy,rx,ry,a0,a1,n){ const o=[]; for(let k=0;k<=n;k++){ const t=rad(a0+(a1-a0)*k/n); o.push([cx+Math.cos(t)*rx, cy-Math.sin(t)*ry]); } return o; }
  const HS=1.12;   // escala da cabeça
  const FOOT=c=>c.corpo==='f'?7.1:8;

  function fist(p,M,el,wr,f){
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x), s=f?1.2:1.55; p.xf(ang,wr.x,wr.y);
    p.F(M.skin[1]); p.ell(2*s,0.2,4.5*s,4.2*s);
    p.F(M.skinX[2]); p.poly([[-0.6*s,1*s],[6*s,0.6*s],[5.4*s,3.6*s],[1.2*s,4.2*s]]);
    p.F(M.skin[2]); p.poly([[0,2.4*s],[5.6*s,1.8*s],[5*s,3.8*s],[1.2*s,4*s]]); p.rect(3.4*s,-2.6*s,0.9,4.6*s); p.rect(5*s,-2*s,0.8,3.4*s);
    p.F(M.skin[3]); p.rect(1.6*s,3.4*s,3*s,0.8);
    p.F(M.skin[0]); p.rect(1.6*s,-3.6*s,3.4*s,1.1); p.F(M.skinX[0]); p.rect(2.4*s,-3.6*s,1.4*s,0.9);
    p.F(M.skin[1]); p.ell(0.4*s,-3.4*s,2.2*s,1.5*s); p.F(M.skin[2]); p.rect(-0.8*s,-2.6*s,2.6*s,0.8);
    p.id();
  }
  function drawArm(p,M,c,sh,el,wr){
    p.id(); const f=c.corpo==='f', wU=f?9.6:13.4, wE=f?8.2:11.4, wW=f?6.6:8.6;
    // antebraço com massa (bulbo perto do cotovelo) + braço
    vol(p,el,wr,wE,wW,M.skin,M.skinX,{l0:0.05,l1:0.6,h0:0.1,h1:0.4});
    const fb=lerp(el,wr,0.28), fo=sideOff(el,wr,wE*0.12,-1); p.F(M.skinX[1]); p.ell(fb.x+fo.x,fb.y+fo.y,wE*0.36,wE*0.3);
    vol(p,sh,el,wU,wE,M.skin,M.skinX,{l0:0.1,l1:0.85,h0:0.3,h1:0.65});
    // deltoide e bíceps
    const d=lerp(sh,el,0.12), od=sideOff(sh,el,wU*0.16,-1); p.F(M.skin[0]); p.ell(d.x+od.x,d.y+od.y,wU*0.3,wU*0.24); p.F(M.skinX[0]); p.ell(d.x+od.x*1.4,d.y+od.y*1.4-0.4,wU*0.12,wU*0.1);
    const dl=lerp(sh,el,0.34), o2=sideOff(sh,el,wU*0.1,1); p.F(M.skin[2]); p.cap({x:dl.x+o2.x-1.6,y:dl.y+o2.y},{x:dl.x+o2.x+1.6,y:dl.y+o2.y+0.6},1,1);
    if(c.top==='camiseta'){ const e=lerp(sh,el,0.55);
      vol(p,sh,e,wU+3.4,wU+2.4,M.top,M.topX,{l0:0.01,l1:0.7,h0:0.1,h1:0.45});
      p.F(M.top[2]); p.cap(lerp(sh,el,0.47),e,wU+2.6,wU+2.4); p.F(M.top[3]); p.cap(lerp(sh,el,0.53),e,wU+2.4,wU+2.4);
      const fo2=lerp(sh,e,0.5); p.F(M.top[2]); p.cap({x:fo2.x-1.5,y:fo2.y-1},{x:fo2.x+1.2,y:fo2.y+1.4},0.9,0.9); }
    if(c.top==='moletom'){ const cf=lerp(el,wr,0.72), cf2=lerp(el,wr,0.88);
      vol(p,el,cf,wE+3.4,wW+3,M.top,M.topX,{l0:0.01,l1:0.7}); vol(p,sh,el,wU+3.6,wE+3.4,M.top,M.topX,{l0:0.05,l1:0.8});
      p.F(M.top[2]); p.cap(cf,cf2,wW+2.6,wW+2.4); p.F(M.top[3]); p.cap(lerp(cf,cf2,0.7),cf2,wW+2.4,wW+2.4); p.F(M.topX[1]); p.cap(cf,lerp(cf,cf2,0.25),wW+1,wW+1);
      p.F(M.top[2]); const e1=lerp(sh,el,0.86), e2=lerp(el,wr,0.14); p.cap(e1,lerp(e1,e2,0.5),1.1,0.9); p.cap(lerp(e1,e2,0.4),lerp(e1,e2,1),0.9,0.9); }
    fist(p,M,el,wr,f);
  }
  function drawShoe(p,M,a,ang,sc){
    xfs(p.cx,ang,a.x,a.y,sc,sc);
    p.F(M.shoe[1]); p.poly([[-5,-4.4],[2.6,-4.6],[5,-1],[10.6,0.8],[12.6,3],[12.4,4.6],[-6,4.6],[-6.4,-0.6]]);
    p.F(M.shoeX[2]); p.poly([[-6.4,-0.6],[-5,-4.4],[0,-4.4],[-1,0],[0,4.6],[-6,4.6]]);
    p.F(M.shoe[2]); p.poly([[-6.4,-0.6],[-5,-4.4],[-2.4,-4.4],[-3.6,0],[-3,4.6],[-6,4.6]]); p.F(M.shoe[3]); p.rect(-6.4,1.6,1.4,3);
    p.F(M.shoe[0]); p.poly([[7.6,0.2],[10.6,0.8],[12.6,3],[12.4,3.6],[8,2.6]]); p.rect(-1.6,-4.6,4,1); p.F(M.shoeX[0]); p.rect(9.4,1,1.6,0.8);
    p.F(M.shoe[3]); p.ell(-1.4,-4.4,3.2,1);
    p.F(M.sole[1]); p.poly([[-6.6,3.6],[12.8,3.6],[13.4,5.2],[12.4,6.2],[-6.6,6.2]]); p.F(M.sole[2]); p.rect(-6.6,5.3,19,0.9); p.F(M.sole[0]); p.rect(-5,3.6,14,0.8); p.F(M.sole[3]); p.rect(-6.6,3.6,2.4,2.6);
    p.F(M.sole[1]); [[0.6,-3],[2.6,-1.8],[4.6,-0.6]].forEach(([x,y])=>p.rect(x,y,1.6,0.9));
    p.F(M.shoe[2]); p.poly([[-1,1.6],[6,0.6],[7.4,1.4],[0,2.8]]);
    p.id();
  }
  function footAng(sk,front,P,c){
    const an=front?sk.ankleF:sk.ankleB, gap=GROUND-(an.y+FOOT(c)), k=(front?P.lFk:P.lBk);
    let t=0; if(gap>1.2){ if(k<-12) t=Math.min(38,(-k-12)*0.7); else if(k>50) t=-Math.min(30,(k-50)*0.5); }
    return rad(sk.ro+t);
  }
  function calf(p,knee,ankle,w,R){ const q=lerp(knee,ankle,0.3), o=sideOff(knee,ankle,w*0.18,1); p.F(R[1]); p.ell(q.x+o.x,q.y+o.y,w*0.5,w*0.62,Math.atan2(ankle.y-knee.y,ankle.x-knee.x)); }
  function drawLeg(p,M,c,sk,front,P){
    p.id(); const f=c.corpo==='f', hip=front?sk.hipF:sk.hipB, knee=front?sk.kneeF:sk.kneeB, ankle=front?sk.ankleF:sk.ankleB;
    const wT=f?15:18, wK=f?11.4:13.4, wA=f?8.6:10.2;
    if(c.calca==='bermuda'){
      calf(p,knee,ankle,wK,M.skin); vol(p,knee,ankle,wK-1,wA-0.6,M.skin,M.skinX,{l0:0.1,l1:0.6,h0:0.15,h1:0.4});
      const cq=lerp(knee,ankle,0.32), co=sideOff(knee,ankle,wK*0.3,1); p.F(M.skin[2]); p.ell(cq.x+co.x,cq.y+co.y,wK*0.24,wK*0.4);
      const hm=lerp(hip,knee,1.0);
      vol(p,hip,hm,wT+1.2,wK+2,M.pants,M.pantsX,{l0:0.05,l1:0.75});
      p.F(M.pants[2]); p.cap(lerp(hip,knee,0.88),hm,wK+1.8,wK+2); p.F(M.pants[3]); p.cap(lerp(hip,knee,0.96),hm,wK+1.8,wK+2);
      if(front){ const q=lerp(hip,knee,0.55), ang=Math.atan2(knee.y-hip.y,knee.x-hip.x); p.xf(ang,q.x,q.y); p.F(M.pants[3]); p.rect(-4.6,-1,9.2,6.4); p.F(M.pants[1]); p.rect(-4,-0.4,8,5.2); p.F(M.pantsX[1]); p.rect(-4,-0.4,8,1.6); p.F(M.pants[0]); p.rect(-4.6,-1.8,9.2,1.4); p.F(M.metal[2]); p.rect(-0.6,-0.4,1.2,1); p.id(); }
    } else {
      calf(p,knee,ankle,wK,M.pants);
      vol(p,knee,ankle,wK,wA+1,M.pants,M.pantsX,{l0:0.05,l1:0.6,h0:0.1,h1:0.35}); vol(p,hip,knee,wT,wK,M.pants,M.pantsX,{l0:0.05,l1:0.85,h0:0.2,h1:0.6});
      // dobras grandes: atrás do joelho e sanfona no tornozelo
      const kk=knee, kb=sideOff(hip,knee,wK*0.2,1);
      p.F(M.pants[2]); p.poly([[kk.x-4,kk.y-3],[kk.x+3,kk.y-1.2],[kk.x+3.4,kk.y],[kk.x-3.6,kk.y-1.4]]); p.poly([[kk.x-3.4+kb.x,kk.y+1.6+kb.y],[kk.x+3.2,kk.y+2.4],[kk.x+2.4,kk.y+3.4],[kk.x-3.6+kb.x,kk.y+3+kb.y]]);
      p.F(M.pantsX[1]); p.poly([[kk.x-2,kk.y-1.2],[kk.x+3.4,kk.y],[kk.x+3,kk.y+1],[kk.x-2,kk.y+0.4]]);
      const t1=lerp(hip,knee,0.45), tb=sideOff(hip,knee,wT*0.1,1); p.F(M.pants[2]); p.cap({x:t1.x+tb.x-3,y:t1.y+tb.y-1.6},{x:t1.x+tb.x+2.6,y:t1.y+tb.y+1.2},1.2,0.8);
      [0.8,0.88].forEach(t=>{ const q=lerp(knee,ankle,t); p.F(M.pants[2]); p.cap({x:q.x-wA*0.55,y:q.y-0.8},{x:q.x+wA*0.5,y:q.y+0.6},1,1); });
      const c1=lerp(knee,ankle,0.9); p.F(M.pants[0]); p.cap(c1,lerp(knee,ankle,0.96),wA+2.2,wA+2.2); p.F(M.pants[3]); p.cap(lerp(knee,ankle,0.97),lerp(knee,ankle,1),wA+2,wA+2);
      if(front){ p.F(M.pantsX[0]); p.cap(lerp(hip,knee,0.25),lerp(hip,knee,0.7),0.7,0.7); }
    }
    drawShoe(p,M,ankle,footAng(sk,front,P,c),f?1.14:1.3);
  }
  function drawTorso(p,M,sk,c,P){
    const f=c.corpo==='f'; xfs(p.cx,sk.a,sk.hip.x,sk.hip.y,(f?1.2:1.45)*0.8-(f?0.08:0.26)*Math.max(0,sk.tw),1.1*(1+0.025*(sk.br||0)));
    const body=f?[[-9.6,3],[9.4,3],[9.6,-3],[7.8,-9],[8.4,-13.4],[10.6,-18],[10.8,-23],[9,-27.6],[3.8,-30.8],[-3,-30.8],[-8.6,-28.4],[-10.4,-24.4],[-9.6,-19],[-7.8,-13],[-8.2,-8],[-9.8,-2]]
                :[[-9.4,3],[9.4,3],[9.6,-3],[8.6,-9],[10.6,-15],[12.4,-21],[12.6,-25.4],[10.4,-29.4],[4.6,-32.2],[-3.6,-32.2],[-10.4,-29.8],[-12.8,-25.6],[-12.4,-20],[-10.2,-14],[-9,-8],[-10,-2]];
    const nk=f?[[-2.6,-31],[4.4,-31],[3.4,-28],[-1.8,-28]]:[[-3.2,-32.4],[5,-32.4],[3.8,-29],[-2.2,-29]];
    const R=c.top==='regata'?M.skin:M.top, X=c.top==='regata'?M.skinX:M.topX;
    // massa base + esculpido (meio-tom largo, sombra roxa grande, borda funda, luz quente)
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
    if(c.top==='regata'){
      p.F(M.skin[2]); p.rect(1.6,-11,0.9,8); p.rect(-1,-8,5.6,0.8); p.rect(-1,-4.6,5.6,0.8);
      p.F(M.top[1]); p.poly(f?[[-9.4,3],[9.2,3],[9.4,-3],[7.8,-9],[8.4,-13.4],[10.2,-18],[9.2,-23],[6.4,-27.6],[4.4,-27.6],[3,-22],[-1.6,-22],[-3.6,-27.6],[-5.8,-27.6],[-8.6,-21],[-7.8,-13],[-8.2,-8],[-9.6,-2]]
                          :[[-9.2,3],[9.2,3],[9.4,-3],[8.4,-9],[10.4,-15],[11.4,-21],[9.4,-27],[7,-29.6],[4.8,-29.6],[3,-24],[-2,-24],[-4,-29.6],[-6.6,-29.6],[-9.8,-22],[-10,-14],[-9,-8],[-9.8,-2]]);
      p.F(M.topX[2]); p.poly([[-9.8,-22],[-2,-24],[-1.4,-6],[-2,3],[-9.2,3],[-9.8,-2],[-9,-8],[-10,-14]]);
      p.F(M.top[2]); p.poly([[-9.8,-22],[-6,-23],[-5.6,-10],[-6.4,3],[-9.2,3],[-9.8,-2],[-9,-8],[-10,-14]]);
      p.F(M.top[3]); p.poly([[-9.8,-22],[-8,-22.4],[-7.6,-10],[-9,-8],[-10,-14]]);
      p.F(M.topX[1]); p.poly([[1.6,-23],[9.6,-21],[10,-16],[2,-15]]); p.F(M.top[0]); p.poly([[3.6,-22],[9.6,-19.6],[9.2,-16.6],[3.4,-18]]);
      p.F(M.top[2]); p.poly([[-1,-13],[9.6,-15],[9.4,-13.6],[-1,-11.8]]); p.rect(1,-8,6,0.8); p.rect(-2,-5,5,0.8);
      if(f){ p.F(M.top[3]); p.poly([[-2,-15],[9.6,-15.4],[9.4,-14.4],[-1,-14]]); }
    } else {
      p.F(M.skin[1]); p.poly(nk); p.F(M.skin[2]); p.rect(nk[0][0]+0.6,nk[0][1],2.4,3); p.F(M.skin[3]); p.rect(nk[0][0]+0.6,nk[0][1]+2.2,4,0.8);
      // dobras grandes: do ombro pro quadril e na cintura
      p.F(R[2]); p.poly([[-5,-25],[2,-19],[1.4,-17.6],[-5.6,-23.2]]); p.poly([[5,-11],[9.6,-6],[8.4,-5],[4.2,-9.6]]); p.poly([[-4,-8],[3,-6],[2.6,-4.6],[-4.2,-6.6]]); p.poly([[2,-13],[8,-11.6],[7.6,-10.4],[1.8,-11.6]]);
      p.F(X[1]); p.poly([[-4.4,-23.8],[1.8,-18.4],[2.4,-19.2],[-3.8,-25]]); p.poly([[-3.8,-8.6],[2.8,-6.6],[3.2,-7.4],[-3.4,-9.4]]);
      if(f){ p.F(R[1]); p.poly([[3.6,-19.6],[9.6,-19.4],[9,-17.6],[4,-17.8]]); }
      p.F(R[2]); p.poly(f?[[-3.2,-31.2],[5,-31.2],[4,-27.4],[-2.2,-27.4],[-1.8,-28.4],[3.2,-28.4],[3.8,-30.2],[-2.4,-30.2]]
                            :[[-3.8,-32.8],[5.6,-32.8],[4.4,-28.4],[-2.6,-28.4],[-2.2,-29.4],[3.6,-29.4],[4.4,-31.4],[-3,-31.4]]);
      p.F(X[1]); p.rect(0,-32.8,4.4,0.8);
      p.F(R[2]); p.rect(-9.8,-3.8,19.4,1.4); p.F(R[3]); p.rect(-9.8,-2.6,6,1); p.F(X[1]); p.rect(2,-3.8,6,0.6);
      if(c.top==='moletom'){
        p.F(R[1]); p.poly(f?[[-10,-26],[-6,-33],[0,-34.4],[2.4,-32],[-3,-30],[-7.6,-25]]:[[-11.6,-27],[-7,-34.6],[0,-36],[2.6,-33.4],[-3.4,-31],[-8.6,-26]]);
        p.F(R[2]); p.poly(f?[[-8.6,-26],[-5.4,-31.4],[-1,-32.4],[-3,-30],[-6.8,-25.4]]:[[-10,-27],[-6.4,-33],[-1,-34],[-3.4,-31.4],[-8,-26.4]]);
        p.F(R[3]); p.poly(f?[[-8.6,-26],[-6.6,-29],[-5,-28],[-6.8,-25.4]]:[[-10,-27],[-8,-30],[-6.4,-29],[-8,-26.4]]);
        p.F(R[0]); p.poly(f?[[-6,-33],[0,-34.4],[0.6,-33.6],[-5,-32.4]]:[[-7,-34.6],[0,-36],[0.6,-35.2],[-6,-34]]);
        p.F(M.metal[1]); p.rect(1.4,-28.6,0.9,8); p.rect(3.6,-28.4,0.9,6.4); p.F(M.metal[2]); p.rect(1.2,-20.8,1.4,1.4); p.rect(3.4,-22.2,1.4,1.4);
        p.F(R[3]); p.poly([[-5,-13],[8.6,-13],[10,-5],[-6,-5]]); p.F(R[1]); p.poly([[-4.2,-12.2],[7.8,-12.2],[9,-5.8],[-5.2,-5.8]]); p.F(X[1]); p.poly([[0,-12.2],[7.8,-12.2],[8.2,-10],[0,-10]]);
        p.F(R[2]); p.poly([[-4.2,-12.2],[-2.6,-12.2],[-3.4,-5.8],[-5.2,-5.8]]); p.poly([[6.2,-12.2],[7.8,-12.2],[9,-5.8],[7.4,-5.8]]);
        p.F(R[2]); p.rect(-10,-3.8,20,3.4); p.F(R[3]); for(let x=-8;x<9;x+=2.4) p.rect(x,-3.6,0.8,3);
      }
    }
    // calça: cós, cinto, braguilha
    p.F(M.pants[1]); p.poly([[-10.6,-2],[10.2,-2],[10.6,4.4],[-10.8,4.4]]); p.F(M.pantsX[2]); p.poly([[-10.6,-2],[-2,-2],[-1.6,4.4],[-10.8,4.4]]); p.F(M.pants[2]); p.poly([[-10.6,-2],[-5.6,-2],[-5,4.4],[-10.8,4.4]]); p.rect(4,0,0.8,4.4);
    p.F(M.belt[1]); p.poly([[-10.8,-3],[10.4,-3],[10.6,-0.4],[-11,-0.4]]); p.F(M.belt[2]); p.rect(-10.8,-3,6,2.6); p.F(M.belt[0]); p.rect(-4,-3,13,0.7); p.F(M.belt[3]); p.rect(-10.8,-0.9,21.4,0.6);
    p.F(M.pants[2]); [-8,0.6].forEach(x=>p.rect(x,-3.4,1.2,3.6));
    p.F(M.buckle[1]); p.rect(5,-3.6,3.6,3.6); p.F(M.belt[2]); p.rect(6,-2.6,1.6,1.6); p.F(M.buckle[0]); p.rect(5,-3.6,3.6,0.8);
    p.id();
  }
  function drawHairBack(p,M,sk,c){
    if(!['longo','tranca','coque','black'].includes(c.cabelo)) return;
    xfs(p.cx,sk.ha,sk.neck.x,sk.neck.y,HS,HS);
    if(c.cabelo==='longo'){ p.F(M.hair[1]); p.poly([[-9.6,-18],[-4,-25],[3,-25],[0,-14],[-0.6,0],[-2.6,9],[-7,13.4],[-12,10],[-13,-2]]);
      p.F(M.hair[2]); p.poly([[-12.6,-2],[-9,-4],[-6,6],[-7,13.4],[-12,10]]); p.F(M.hair[0]); p.poly([[-7,-14],[-5.4,-14],[-5.6,2],[-7.2,4]]); }
    if(c.cabelo==='tranca'){ for(let k=0;k<7;k++){ p.F(M.hair[1]); p.ell(-8.4-k*0.5,-9+k*3.8,2.8,2.4); p.F(M.hair[2]); p.rect(-10.4-k*0.5,-8.4+k*3.8,4,0.9); p.F(M.hair[0]); p.rect(-8.6-k*0.5,-10.4+k*3.8,1.4,0.8); }
      p.F(M.acc[1]); p.rect(-13.2,17.4,3.6,2.2); p.F(M.hair[1]); p.poly([[-13,19.6],[-10,19.6],[-10.4,23],[-12.8,23.6]]); }
    if(c.cabelo==='coque'){ p.F(M.hair[1]); p.ell(-5.4,-25.6,5.6,4.8); p.F(M.hair[2]); p.ell(-6.6,-24,3.6,2.6); p.F(M.hair[0]); p.ell(-4,-28,2.4,1.2); p.F(M.acc[1]); p.rect(-3.4,-23.6,2.6,3.4); }
    if(c.cabelo==='black'){ p.F(M.hair[1]); p.ell(0,-19,14,12.8); p.F(M.hair[2]); p.ell(-6,-13,7,7.6); }
    p.id();
  }
  function drawHead(p,M,sk,P,c){
    const f=c.corpo==='f'; xfs(p.cx,sk.ha,sk.neck.x,sk.neck.y,HS,HS);
    // pescoço
    p.F(M.skin[1]); p.cap(P2(0.4,4),P2(1.2,-6),f?6.8:8.8,f?6.2:8);
    p.F(M.skin[2]); p.poly([[-3.8,3],[-3,-6],[-0.6,-6],[-1,3]]); p.poly([[0,-4.6],[8.4,-2.6],[7,-0.8],[0.4,-1.8]]);
    // crânio + rosto
    p.F(M.skin[1]); p.ell(2.6,-14.6,10.2,10.4);
    p.poly(f?[[-3,-9],[10.4,-10.4],[12.2,-6.6],[10.6,-2.8],[6.8,-0.6],[1.6,-0.6]]:[[-3,-9],[10.6,-10.4],[12.8,-6],[11.8,-2.2],[8,0.6],[1.4,0.6]]);
    p.F(M.skin[2]); p.poly([[-3.4,-9.4],[1.6,-8.6],[2.8,-3],[1.6,0.4],[-1.8,-2]]); p.poly([[-7.6,-12],[-5.6,-17],[-4,-13],[-5,-8]]);
    p.F(M.skin[0]); p.poly([[6,-23],[10,-21.6],[11.4,-18.6],[8,-20]]); p.ell(9,-9.2,1.8,1);
    // orelha
    p.F(M.skin[1]); p.ell(-3.4,-12.4,2.6,3.6); p.F(M.skin[2]); p.ell(-3.1,-12.2,1.3,2.3); p.F(M.skin[3]); p.rect(-3.4,-12.8,0.8,1.8);
    // barba (antes da boca)
    if(!f && c.barba==='porfazer'){ p.F(M.stub[1]); p.poly([[0.4,-8.6],[2,-4],[6,-0.2],[9.8,0],[12,-2.4],[12.6,-4.4],[11.4,-4],[9,-3.4],[6.8,-4.2],[4,-7],[2.4,-9.4]]); p.F(M.stub[2]); p.poly([[0.4,-8.6],[2,-4],[4.6,-1.6],[3,-5.6]]); }
    if(!f && c.barba==='cheia'){ p.F(M.hair[1]); p.poly([[-2.8,-10.4],[0,-7],[2,-2.6],[5.4,1.6],[9,2.8],[12.2,0],[13.2,-4.4],[12,-4.6],[10.6,-3.2],[8,-3.6],[6.6,-5],[4,-7.4],[1.6,-11.4]]);
      p.F(M.hair[2]); p.poly([[0,-7],[2,-2.6],[5.4,1.6],[9,2.8],[8.6,1],[5,-0.6],[2.6,-4]]); p.F(M.hair[0]); p.rect(6,-2.4,1,1.6); p.rect(9.6,-1.6,1,1.4); p.rect(2.6,-6,1,1.4); }
    if(!f && c.barba==='cavanhaque'){ p.F(M.hair[1]); p.poly([[7.8,-4],[12,-4.4],[11.4,0.4],[8.6,0.8]]); p.F(M.hair[2]); p.rect(8.6,-0.6,2.6,1); }
    // olhos
    const sq=P.brow===2&&P.mouth===2;
    if(P.blink>=0.5||sq){ p.F(M.skin[3]); if(sq){ p.poly([[4.6,-14.6],[9.4,-13.6],[9.4,-12.6],[4.6,-12.8]]); } else p.rect(4.4,-13.4,5,1); p.rect(10.8,-13.6,1.8,0.9); }
    else {
      p.F(M.eye[1]); p.ell(6.9,-13.3,2.7,2.2); p.F(M.eye[2]); p.rect(4.6,-12,4.8,0.9);
      p.F(M.iris[1]); p.rect(7.1,-14.8,2.2,3); p.F(M.iris[3]); p.rect(7.8,-14.2,1.1,1.8); p.F(M.eye[0]); p.rect(7.2,-14.8,0.9,0.9);
      p.F(M.skin[3]); p.poly([[4,-15.4],[9.8,-15.8],[9.8,-14.8],[4.4,-14.6]]);
      if(f){ p.rect(9.4,-16.4,1.4,1); p.rect(3.6,-15.2,1,0.9); }
      p.F(M.eye[1]); p.ell(11.7,-13.4,1.1,1.8); p.F(M.iris[1]); p.rect(11.5,-14.6,1.1,2); p.F(M.skin[3]); p.rect(10.7,-15.6,2.4,0.8);
    }
    // sobrancelhas
    const b=P.brow|0, th=c.sobr==='grossa'?2.4:c.sobr==='fina'?1:1.7;
    const yo=b===1?-18.4:b===2?-17.2:b===3?-18.6:-17.8, yi=b===1?-16.2:b===2?-19:b===3?-18:-17.4;
    p.F(M.hair[2]);
    if(c.sobr==='arqueada'){ const ym=Math.min(yo,yi)-1.2; p.poly([[3.6,yo+0.6],[6.8,ym],[10.4,yi],[10.4,yi+th],[6.8,ym+th],[3.6,yo+th+0.4]]); }
    else p.poly([[3.6,yo],[10.4,yi],[10.4,yi+th],[3.6,yo+th]]);
    p.poly([[11,yi+(b===1?0.2:0)],[13.2,yi+(b===1?-0.8:0.4)],[13.2,yi+th],[11,yi+th]]);
    // nariz
    p.F(M.skin[1]); p.poly([[10.2,-14.8],[14.4,-9.6],[13.8,-8.4],[10.4,-8.6]]);
    p.F(M.skin[2]); p.rect(10.4,-9.2,3.6,1); p.F(M.skin[3]); p.rect(11.6,-9.2,1.2,0.8); p.F(M.skin[0]); p.rect(11.4,-13.2,0.9,2.6);
    // boca
    const m=P.mouth|0;
    if(m===2){ p.F(M.mouth[2]); p.poly([[7.2,-7.6],[12.8,-7.8],[12.2,-2.2],[7.8,-2.4]]); p.F(M.teeth[1]); p.rect(7.6,-7.6,4.8,1.3); p.F(M.mouth[0]); p.ell(10,-3.2,1.9,0.9); }
    else if(m===1){ p.F(M.mouth[1]); p.rect(7.2,-7.6,5.6,3.4); p.F(M.teeth[1]); p.rect(7.6,-7.2,4.8,2.6); p.F(M.teeth[2]); p.rect(7.6,-5.9,4.8,0.6); p.rect(9.6,-7.2,0.6,2.6); }
    else if(m===3){ p.F(M.mouth[2]); p.poly([[7,-6.8],[12.8,-7.6],[11.6,-4.2],[8.2,-4.4]]); p.F(M.teeth[1]); p.rect(7.6,-6.8,4.8,1.3); p.F(M.skin[2]); p.rect(6,-7.8,1,1.6); }
    else { p.F(f?M.mouth[0]:M.mouth[2]); p.rect(7.8,-6,4.4,f?1.4:1); p.F(M.skin[2]); p.rect(8.4,-4.6,3,0.8); }
    // bigode (por cima da boca)
    if(!f && (c.barba==='bigode'||c.barba==='cheia'||c.barba==='cavanhaque')){ p.F(M.hair[1]); p.poly([[7,-8.6],[13,-8.8],[13.6,-6.6],[10.4,-7.4],[7.4,-6.4]]); p.F(M.hair[0]); p.rect(9,-8.6,2.4,0.8); }
    // cabelo (frente)
    const H=c.cabelo;
    const SIDE=[[-0.4,-15.4],[1.2,-15.4],[1,-10.4],[-0.6,-10]];
    if(H==='careca'){ p.F(M.skin[0]); p.ell(4.4,-22.4,3.6,1.4); p.F(M.skin[2]); p.poly(dome(2.6,-14.6,10.2,10.4,150,200,6).concat([[-5,-12],[-4.4,-18]])); }
    if(H==='raspado'){ p.F(M.stub[2]); p.poly(dome(2.6,-14.6,10.3,10.5,35,195,14).concat([[-4.6,-10],[-1.4,-12],[0.6,-17.6],[5,-19.6],[10.6,-19.4]])); p.poly(SIDE);
      p.F(M.stub[1]); p.poly([[0,-24],[6,-24.4],[9,-22.6],[4,-23]]); }
    if(H==='curto'){ p.F(M.hair[1]); p.poly(dome(2.6,-15,10.8,11,40,200,14).concat([[-6.6,-8.6],[-4.4,-10.2],[-2.4,-14],[0,-15.6],[2,-18.8],[5,-19.6],[7.4,-18.4],[9.6,-19.4],[12.6,-18.4]])); p.poly(SIDE);
      p.F(M.hair[2]); p.poly([[-8.2,-10],[-8.4,-14.6],[-4,-15.6],[-2.4,-14],[-4.4,-10.2],[-6.6,-8.6]]); p.poly([[2,-18.8],[5,-19.6],[4.6,-21],[1.6,-20.2]]);
      p.F(M.hair[0]); p.poly([[0,-24.8],[6,-25],[9,-23],[4,-23.4]]); p.poly([[-5,-21.8],[-2,-24],[-1,-23.2],[-4,-20.8]]);
      p.F(M.hair[1]); p.poly([[9.6,-19.4],[14,-21],[12.4,-18]]); p.poly([[5,-19.6],[8,-22],[7.4,-18.4]]); }
    if(H==='black'){ p.F(M.hair[1]); p.poly(dome(1,-21,13.4,10.6,-15,200,16).concat([[-7.6,-9],[-4.4,-12],[-1.6,-14],[1,-17.6],[5,-19.6],[10,-19.8],[13.2,-18.6]]));
      p.F(M.hair[0]); [[-2,-28],[4,-29],[9,-26],[-7,-23]].forEach(([x,y])=>p.ell(x,y,2.4,1.2)); p.F(M.hair[2]); [[-6,-15],[-9,-19],[12,-21],[2,-24]].forEach(([x,y])=>p.ell(x,y,1.6,1)); }
    if(H==='moicano'){ p.F(M.stub[2]); p.poly(dome(2.6,-14.6,10.3,10.5,35,195,14).concat([[-4.6,-10],[-1.4,-12],[0.6,-17.6],[5,-19.6],[10.6,-19.4]]));
      p.F(M.hair[1]); p.poly([[-8,-19],[-5,-27],[0,-32.6],[5,-33.4],[9.4,-30],[11.4,-24],[8,-23.6],[3,-25],[-2,-23.4],[-5.6,-19.6]]);
      p.F(M.hair[0]); p.poly([[0,-31.4],[5,-32.2],[7.6,-29.6],[3,-29.6]]); p.F(M.hair[2]); p.poly([[-8,-19],[-5.6,-19.6],[-2,-23.4],[-4,-22]]); }
    if(H==='tranca'||H==='longo'||H==='coque'){ p.F(M.hair[1]); p.poly(dome(2.6,-15,10.8,11,30,200,14).concat([[-6,-6.6],[-3,-9],[-1.6,-14],[1,-18],[4,-19.8],[8,-19.2],[11,-17.8],[13.2,-17.6]])); p.poly(SIDE);
      p.F(M.hair[2]); p.poly([[1,-18],[4,-19.8],[1.6,-24],[0,-24]]); p.poly([[-8.6,-9],[-6,-6.6],[-3,-9],[-5,-14]]);
      p.F(M.hair[0]); p.poly([[3.6,-24.6],[9,-23.4],[11,-20.6],[6,-22.4]]); p.poly([[-5.6,-21],[-3,-23.6],[-2.4,-22.6],[-4.8,-19.6]]);
      if(H==='longo'){ p.F(M.hair[1]); p.poly([[-9.6,-14],[-5.6,-10],[-5,-1],[-8,4],[-10.6,-5]]); p.F(M.hair[2]); p.poly([[-9.6,-8],[-7,-6],[-8,4],[-10.6,-5]]); } }
    // acessório
    if(c.acc==='bone'){ p.F(M.acc[1]); p.poly(dome(2.6,-17.6,11,9.6,0,180,14).concat([[-8.6,-17],[12.2,-18.6]]));
      p.F(M.acc[2]); p.poly([[-8.4,-17.6],[-6.6,-22],[-4,-21],[-5,-17.4]]); p.rect(2.2,-27,0.9,8.4);
      p.F(M.acc[0]); p.poly([[3.6,-26.6],[9,-24.6],[11,-21],[6,-23]]); p.ell(2.6,-27.4,1.4,0.9);
      p.F(M.acc[2]); p.poly([[8.6,-20],[21,-18.8],[20.2,-16.6],[9,-17.4]]); p.F(M.acc[3]); p.poly([[9,-17.4],[20.2,-16.6],[19.4,-15.8],[9.4,-16.4]]); p.F(M.acc[1]); p.rect(10,-19.8,9,0.9); }
    if(c.acc==='bandana'){ p.F(M.acc[1]); p.poly([[-9,-16.4],[-7.6,-21.6],[1,-24],[10,-22],[12.8,-18.4],[10.4,-17],[1,-19],[-7.4,-14.4]]);
      p.F(M.acc[2]); p.poly([[-9,-16.4],[-7.4,-14.4],[1,-19],[10.4,-17],[10.8,-18],[1,-20],[-7.6,-16]]); p.F(M.acc[0]); [[-4,-20.6],[2,-21.6],[7,-20.4],[-1,-21.4]].forEach(([x,y])=>p.rect(x,y,1,1));
      p.F(M.acc[1]); p.ell(-9.4,-16.6,2,1.8); p.poly([[-10,-16],[-16,-11],[-14.4,-9.6],[-9.4,-14.6]]); p.poly([[-10,-17],[-16.6,-15.4],[-15.6,-13.6],[-9.6,-15.6]]); p.F(M.acc[2]); p.rect(-15.6,-11,2,1); }
    if(c.acc==='oculos'){ p.F(M.lens[1]); p.poly([[3.8,-16.2],[10.2,-16.4],[9.8,-11.6],[4.6,-11.4]]); p.poly([[10.6,-16],[13.4,-15.8],[13,-12],[10.8,-12]]);
      p.F(M.lens[0]); p.poly([[5,-15.6],[7,-15.6],[5.6,-12.6],[4.8,-12.6]]); p.rect(11.2,-15.4,0.9,1.6); p.F(M.metal[2]); p.rect(-3,-15.4,7,0.9); p.rect(10,-15.6,0.8,1); }
    if(c.acc==='fone'){ p.F(M.acc[2]); p.poly([[-8.8,-14],[-8.6,-22.6],[-2,-27.6],[5,-27.8],[5.6,-26.4],[-1.4,-25.6],[-6.6,-21.4],[-6.6,-14]]); p.F(M.acc[0]); p.rect(-4,-25.8,4,0.9);
      p.F(M.acc[1]); p.ell(-3.6,-12.6,3.8,4.6); p.F(M.acc[3]); p.ell(-2.4,-12.6,1.6,3.8); p.F(M.acc[0]); p.ell(-4.8,-14.2,1.2,1.4); }
    p.id();
  }
  // rastro do golpe: crescente grossa (luz no gume) com borda na cor da arma
  function drawSmear(p,M,sk,P,len){
    p.id(); const tip=lp(sk.wrF,P.aFe+P.bat-sk.ro,len+2), sh=sk.shF;
    const cur=Math.atan2(tip.x-sh.x,tip.y-sh.y)*180/Math.PI, r1=Math.hypot(tip.x-sh.x,tip.y-sh.y)+3;
    const sa=P.sa;
    const wide=P.smear>=3?20:14, n=14;
    const band=(rr0,rr1,col)=>{ const pts=[]; for(let k=0;k<=n;k++){ const a=sa+(cur-sa)*k/n; pts.push([sh.x+Math.sin(rad(a))*rr1, sh.y+Math.cos(rad(a))*rr1]); }
      for(let k=n;k>=0;k--){ const a=sa+(cur-sa)*k/n, t=k/n, rr=rr1-(rr1-rr0)*t*t; pts.push([sh.x+Math.sin(rad(a))*rr, sh.y+Math.cos(rad(a))*rr]); } p.F(col); p.poly(pts); };
    band(r1-wide,r1+1.6,M.trail[1]); band(r1-wide+3,r1,M.smear[1]); band(r1-5,r1-0.6,M.smear[0]);
  }
  function star(p,c,r,col,col2){ const pts=[]; for(let k=0;k<16;k++){ const a=k/16*Math.PI*2, rr=k%2?r*0.28:(k%4?r*0.62:r); pts.push([c.x+Math.cos(a)*rr,c.y+Math.sin(a)*rr]); } p.F(col); p.poly(pts); if(col2){ p.F(col2); p.circle(c,r*0.22); } }

  // contorno de baixo com 2 px (peso na base das formas)
  function thick(cv){ const g=cv.getContext('2d'), W=cv.width, H=cv.height, im=PIX.pix(cv), d=im.data, src=new Uint8ClampedArray(d);
    const isO=i=>src[i+3]>0&&src[i]===23&&src[i+1]===11&&src[i+2]===28;
    for(let y=2;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(src[i+3]) continue; const u=i-W*4, u2=u-W*4; if(isO(u)&&src[u2+3]&&!isO(u2)){ d[i]=23; d[i+1]=11; d[i+2]=28; d[i+3]=255; } }
    g.putImageData(im,0,0); }
  const cache=PIX.cache();
  function frame(cfg,anim,fi,step=5){
    const c=Object.assign({},DEFAULT,cfg), K=PIX.getK(), key=JSON.stringify(c)+anim+fi+step+'@'+K; if(cache.has(key)) return cache.get(key);
    if(cache.size>900) cache.delete(cache.keys().next().value);
    const A=ANIMS[anim]||ANIMS.idle; if(!ANIMS[anim]) anim='idle';
    const arm=c.arma==='pistola'||c.arma==='laser'?c.arma:'bastao', tier=c.tier||'comum';
    const kind=A.gunKind||(arm==='bastao'?null:arm);
    const P=poseOf(anim,fi,kind||undefined), sk=skeleton(P,c,kind);
    const T=BATON.TIERS[tier]||BATON.TIERS.comum;
    const M=Object.assign(mats(c),T.M,GUN.M(kind||'pistola',tier),{trail:ramp(kind?GUN.TIER[tier].glow[1]:T.cor)});
    const gA=sk.gAng!=null?sk.gAng:sk.bDir;
    const parts=[
      {back:true, draw:(cx,u)=>drawArm(mkPen(cx,u),M,c,sk.shB,sk.elB,sk.wrB)},
      {back:true, draw:(cx,u)=>{ const p=mkPen(cx,u); p.cx=cx; drawLeg(p,M,c,sk,false,P); }},
      {draw:(cx,u)=>{ const p=mkPen(cx,u); p.cx=cx; drawHairBack(p,M,sk,c); }},
      {draw:(cx,u)=>{ const p=mkPen(cx,u); p.cx=cx; drawTorso(p,M,sk,c,P); }},
      {draw:(cx,u)=>{ const p=mkPen(cx,u); p.cx=cx; drawLeg(p,M,c,sk,true,P); }},
      {draw:(cx,u)=>{ const p=mkPen(cx,u); p.cx=cx; drawHead(p,M,sk,P,c); }},
    ];
    if(P.inhand) parts.push({draw:(cx,u)=>{ const p=mkPen(cx,u); if(kind) GUN.draw(p,kind,tier,sk.wrF,gA); else BATON.draw(p,tier,sk.wrF,sk.bDir); }});
    if(P.smear) parts.push({noShade:true,smear:true,draw:(cx,u)=>P.kick?MOVESET.kickSmear(mkPen(cx,u),M,sk,P):drawSmear(mkPen(cx,u),M,sk,P,kind?16:T.len)});
    parts.push({draw:(cx,u)=>drawArm(mkPen(cx,u),M,c,sk.shF,sk.elF,sk.wrF)});
    if(P.match) parts.push({noShade:true,smear:true,draw:(cx,u)=>{ const p=mkPen(cx,u), w=sk.wrF, a=rad(P.aFe-sk.ro-60), d={x:Math.sin(a),y:-Math.cos(a)}, tip={x:w.x+4+d.x*7,y:w.y+d.y*7}; p.id();
      p.F('#e8d8b0'); p.cap({x:w.x+3,y:w.y},tip,1,1); p.F('#c83a2a'); p.circle(tip,1.3);
      if(P.match>=2){ const big=P.match>=3, f={x:tip.x+d.x*2,y:tip.y-2}; p.F('#ff7a2a'); p.ell(f.x,f.y-(big?2:1),big?4.4:3,big?6:4.2); p.F('#ffd23f'); p.ell(f.x,f.y-(big?1.4:0.6),big?2.8:1.9,big?4:2.8); p.F('#fffbe8'); p.ell(f.x,f.y,1.2,1.6);
        if(big) star(p,{x:f.x,y:f.y-1},9,'#ffd23f','#fffbe8'); } }});
    if(P.inhand) parts.push({draw:(cx,u)=>{ const p=mkPen(cx,u); fist(p,M,sk.elF,sk.wrF,c.corpo==='f'); }});
    // FX: clarão do cano, carga do laser, estrela de impacto
    if(kind && P.inhand && (P.mf>=0.5||P.chg>0.05)) parts.push({noShade:true,smear:true,draw:(cx,u)=>{ const p=mkPen(cx,u), mz=GUN.muzzle(kind,sk.wrF,gA), g=M.gglow; p.id();
      if(P.mf>=0.5){ const big=P.mf>=1.5; const d={x:Math.cos(gA),y:Math.sin(gA)}; const c0={x:mz.x+d.x*(big?6:4),y:mz.y+d.y*(big?6:4)};
        if(kind==='laser'){ p.F(g[1]); p.ell(c0.x,c0.y,big?9:6,big?7:5); p.F(g[0]); p.ell(c0.x,c0.y,big?5.6:3.6,big?4:2.8); star(p,c0,big?16:10,g[0]); }
        else { star(p,c0,13,M.smear[1]); p.F(M.smear[0]); p.ell(c0.x,c0.y,3.2,2.4); p.F(M.smear[1]); p.poly([[c0.x,c0.y-1.4],[c0.x+d.x*11,c0.y+d.y*11],[c0.x,c0.y+1.4]]); } }
      else { const r=1.6+P.chg*4.4; p.F(g[2]); p.circle(mz,r+1.4); p.F(g[1]); p.circle(mz,r); p.F(g[0]); p.circle(mz,r*0.5);
        if(P.chg>0.6){ p.F(g[1]); [[0,-1],[0.8,0.6],[-0.8,0.6]].forEach(([dx,dy])=>p.rect(mz.x+dx*(r+4),mz.y+dy*(r+4),1.2,1.2)); } } }});
    if(P.impact && !P.gun) parts.push({noShade:true,smear:true,draw:(cx,u)=>{ const p=mkPen(cx,u), t=P.kick?MOVESET.kickTip(sk,P):lp(sk.wrF,P.aFe+P.bat-sk.ro,T.len); p.id(); star(p,t,P.impact>=2?15:10,M.smear[1],M.smear[0]); }});
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM}); if(step>=4) thick(cv);
    const sc=q=>({x:q.x*K,y:q.y*K});
    cv._tip=sc(kind?GUN.muzzle(kind,sk.wrF,gA):lp(sk.wrF,P.aFe+P.bat-sk.ro,T.len)); cv._head=sc(sk.H(4.5,-33.6)); cv._hand=sc(sk.wrF);
    cache.set(key,cv); return cv;
  }
  return {FW,FH,GROUND,AX,CAT,OPT,DEFAULT,ANIMS,poseOf,frame,random,mats};
})();

/* ===== shared/vigia ===== */
/* VIGIA — fonte de arte (editável). Build: npm run art */
/* Seu vigia de prédio do Recife em hi-bit: camisa de segurança, quepe, bigode, barriguinha, cassetete.
   Mesmo esqueleto do HEROI (ombros largos, mãos/pés grandes); framePose() aceita pose interpolada (TWEEN). */
const VIGIA=(function(){
  const {rad,ramp,lp,lerp,P2,ik,mkPen,compose}=PIX;
  const FW=184, FH=150, GROUND=144, AX=92;
  const SKINS={media:{nome:'Pele média',hex:'#c08458'}, escura:{nome:'Pele escura',hex:'#7e4f32'}, clara:{nome:'Pele clara',hex:'#e6b28a'}};
  const RIM='#a9c8f0';
  function satb(h,k){ let [r,g,b]=PIX.hexRgb(h).map(v=>v/255); const mx=Math.max(r,g,b), mn=Math.min(r,g,b), l=(mx+mn)/2; let s=0,hh=0;
    if(mx!==mn){ const d=mx-mn; s=l>0.5?d/(2-mx-mn):d/(mx+mn); hh=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4; hh/=6; }
    s=Math.min(1,s*k); if(!s) return h; const q=l<0.5?l*(1+s):l+s-l*s, pp=2*l-q, fn=t=>{ t=(t+1)%1; return t<1/6?pp+(q-pp)*6*t:t<1/2?q:t<2/3?pp+(q-pp)*(2/3-t)*6:pp; };
    return PIX.toHex(fn(hh+1/3)*255,fn(hh)*255,fn(hh-1/3)*255); }
  const mix=PIX.mix;
  const R4=(h,k=1.18)=>{ const b=satb(h,k); return [mix(b,'#fff2cc',.36),b,mix(b,'#3b2c63',.48),mix(b,'#1c1233',.74)]; };
  const RX=(h,k=1.18)=>{ const b=satb(h,k); return [mix(b,'#fff2cc',.64),mix(b,'#ffe0a8',.17),mix(b,'#4a3470',.26),mix(b,'#100a20',.86)]; };
  const HS=1.12, FOOT=8;
  function mats(skin){
    return {
      skin:R4(SKINS[skin].hex,1.15), skinX:RX(SKINS[skin].hex,1.15),
      hair:['#5a4a40','#2a201c','#1a1412','#0e0a08'],
      stub:ramp(PIX.mix(SKINS[skin].hex,'#2a201c',0.4)),
      shirt:R4('#2f4c84',1.2), shirtX:RX('#2f4c84',1.2),
      collar:['#6a8ac0','#41618f','#2a4470','#18284a'],
      cap:['#4a5f94','#22345a','#172440','#0c1222'],
      band:['#4a4a54','#15161c','#0e0e12','#060608'],
      visor:['#7a7e8a','#141418','#0c0c10','#040406'],
      gold:['#fff0a0','#d8b040','#8a6a18','#4a380c'],
      silver:['#ffffff','#c8ccd4','#8a8ea0','#4a4e60'],
      pants:R4('#2c3350',1.15), pantsX:RX('#2c3350',1.15),
      patch:['#5a6280','#363c54','#22263a','#10121c'],
      boot:['#6a6672','#221e24','#141016','#060508'], bootX:['#9a94a0','#3a343e','#1c1820','#030203'],
      sole:['#8a8488','#4a4448','#322c30','#1c181a'],
      belt:['#4a4a54','#1c1c22','#101012','#060608'],
      paper:['#ffffff','#f0ece0','#b4ae9e','#6c6858'],
      blue:['#7ab0ff','#2f6db5','#1f4a80','#102a4a'],
      led:['#d8ffe0','#6fdc7a','#3a9a48','#1a5022'],
      eye:['#ffffff','#f2efe6','#b8b4a8','#6e6a60'],
      iris:['#8a5a3a','#4a2a18','#2a180e','#140a06'],
      mouth:['#b04a5a','#5a1c2c','#2a0c18','#1a0610'],
      teeth:['#fffbe8','#e8e0c0','#b0a680','#6a6040'],
      smear:['#ffffff','#fff6d0','#e8d8a0','#b8a870'],
    };
  }
  /* ---------------- poses ---------------- */
  const REST={hx:0,lean:-3,head:0,aFs:4,aFe:14,aBs:-8,aBe:6,lFh:4,lFk:-2,lBh:-6,lBk:-8,bat:-10,inhand:0,mouth:0,brow:0,smear:0,sa:0,flash:0,whistle:0,impact:0,rot:0,lift:0,blink:0,plant:1,tw:0,br:0};
  const K_=o=>{ const r=Object.assign({},o); if(r.bA!==undefined){ r.bat=r.bA-(r.aFe!==undefined?r.aFe:REST.aFe); delete r.bA; } return r; };
  const ST={lFh:52,lFk:8,lBh:-42,lBk:-46};
  const GUARD=Object.assign({inhand:1},ST,K_({aFs:70,aFe:86,bA:128,aBs:46,aBe:112,lean:12,brow:1}));
  // poses legadas (ângulos do rig antigo) ganham base mais larga e baixa
  const G2=o=>{ const r=K_(o); if(!r.nowide){ if(r.lFh!==undefined){ r.lFh+=14; r.lFk=(r.lFk||0)+3; } if(r.lBh!==undefined){ r.lBh-=12; r.lBk=(r.lBk!==undefined?r.lBk:-30)-10; } } delete r.nowide; return Object.assign({},GUARD,r); };
  const S=Math.sin;
  const th=(p,o)=>6+24*Math.sin(p+o), sh=(p,o)=>th(p,o)-34*Math.max(0,Math.cos(p+o));
  const ANIMS={
    idle:{nome:'Parado (posto)',n:8,dur:()=>150,pose:i=>{ const p=i/8*Math.PI*2, s=S(p); return {lean:1+1.4*s, br:s, hx:1.2*S(p/2), head:1.2*S(p-0.7), lFh:26,lFk:4+2.2*s,lBh:-22,lBk:-24+2.2*s, aFs:8+3*s, aFe:30+4*s, aBs:-16+3*s, aBe:20+4*s, blink:i===5?1:0}; }},
    walk:{nome:'Ronda',n:8,dur:()=>115,pose:i=>{ const p=i/8*Math.PI*2;
      return {plant:0,lFh:th(p,0), lFk:sh(p,0), lBh:th(p,Math.PI), lBk:sh(p,Math.PI), aFs:6-18*S(p), aFe:22-16*S(p), aBs:-6+18*S(p), aBe:6+18*S(p), lean:-1+1.4*S(2*p), head:S(2*p-0.6)}; }},
    guard:{nome:'Guarda (bastão na mão)',n:8,dur:()=>125,pose:i=>{ const p=i/8*Math.PI*2, s=S(p); return Object.assign({},GUARD,K_({lean:12+1.2*s, aFs:70+3*s, aFe:86+4*s, bA:128+3*s, aBs:46+2*s, aBe:112+3*s, lFk:5+1.6*s, lBk:-38+1.6*s, head:-2+s, blink:i===6?1:0})); }},
    advance:{nome:'Avançar',n:8,dur:()=>95,pose:i=>{ const p=i/8*Math.PI*2;
      return Object.assign({},GUARD,{plant:0,lFh:10+22*S(p), lFk:10+22*S(p)-30*Math.max(0,Math.cos(p)), lBh:10+22*S(p+Math.PI), lBk:10+22*S(p+Math.PI)-30*Math.max(0,Math.cos(p+Math.PI)), lean:12+1.5*S(2*p), aFs:70+5*S(p), aBs:46-5*S(p), head:-3}); }},
    combo:{nome:'Combo de 3 golpes',n:12,hits:{2:1,6:2,10:3},dur:i=>[110,50,60,90,80,40,60,90,110,60,70,170][i],pose:i=>G2([
      {tw:-0.3,aFs:-40,aFe:-130,bA:200,lean:-12,head:-4,hx:-4,lFh:22,lFk:0,lBh:-18,lBk:-28,aBs:40,aBe:100,mouth:1},
      {aFs:40,aFe:120,bA:168,lean:2,hx:1,lFh:30,lBh:-24,lBk:-34,aBs:20,aBe:60},
      {tw:0.85,aFs:84,aFe:94,bA:100,lean:30,hx:13,head:-12,mouth:2,smear:1,sa:205,aBs:-50,aBe:-20,lFh:50,lFk:10,lBh:-32,lBk:-36},
      {tw:0.7,aFs:62,aFe:46,bA:22,lean:30,hx:13,head:-10,mouth:1,aBs:-50,aBe:-10,lFh:50,lFk:10,lBh:-32,lBk:-36},
      {tw:-0.2,aFs:12,aFe:64,bA:-40,lean:4,hx:6,aBs:10,aBe:60,lFh:34,lFk:4,lBh:-26,lBk:-36},
      {aFs:44,aFe:84,bA:24,lean:2,hx:5,aBs:-10,aBe:30,lFh:36,lFk:6,lBh:-28,lBk:-38},
      {tw:0.8,aFs:128,aFe:150,bA:140,lean:-2,hx:12,head:-10,mouth:2,smear:2,sa:12,aBs:-60,aBe:-30,lFh:50,lFk:10,lBh:-32,lBk:-36},
      {tw:0.6,aFs:152,aFe:176,bA:180,lean:-6,hx:12,head:-12,mouth:1,aBs:-60,aBe:-40,lFh:50,lFk:10,lBh:-32,lBk:-36},
      {aFs:168,aFe:204,bA:232,lean:-14,hx:4,head:-8,brow:1,mouth:1,plant:0,lFh:46,lFk:-14,lBh:-8,lBk:-56,aBs:150,aBe:170},
      {aFs:176,aFe:210,bA:244,lean:-16,hx:6,mouth:1,plant:0,lFh:50,lFk:-12,lBh:-4,lBk:-52,aBs:160,aBe:180},
      {tw:0.9,aFs:70,aFe:56,bA:18,lean:38,hx:15,head:-14,mouth:2,brow:1,smear:3,sa:232,impact:1,aBs:-60,aBe:-30,lFh:54,lFk:12,lBh:-32,lBk:-36},
      {tw:0.7,aFs:64,aFe:50,bA:22,lean:34,hx:14,head:-12,mouth:1,aBs:-50,aBe:-20,lFh:54,lFk:12,lBh:-32,lBk:-36}][i])},
    special:{nome:'Especial: apito',n:7,dur:i=>[120,110,220,220,220,150,150][i],pose:i=>G2([
      {aFs:30,aFe:70,bA:130,aBs:50,aBe:110,brow:2,mouth:1},
      {whistle:1,aFs:150,aFe:170,bA:180,lean:-8,head:-6,brow:1},
      {whistle:2,aFs:155,aFe:175,bA:185,lean:-10,head:-8,brow:1,hx:-1},
      {whistle:2,aFs:150,aFe:170,bA:180,lean:-10,head:-8,brow:1},
      {whistle:2,aFs:155,aFe:175,bA:185,lean:-10,head:-8,brow:1,hx:-1},
      {aFs:90,aFe:110,bA:130,lean:0,mouth:1},
      {}][i])},
    hurt:{nome:'Dano',n:4,dur:i=>[80,110,130,160][i],pose:i=>G2([
      {lean:-16,head:-16,hx:-6,flash:1,aFs:-14,aFe:24,bA:110,aBs:-36,aBe:-14,mouth:2,brow:2,lFh:18,lBh:-6,lBk:-12},
      {lean:-12,head:-12,hx:-5,aFs:-2,aFe:34,bA:110,aBs:-26,aBe:-4,mouth:2,brow:2,blink:1,lFh:18,lBh:-8,lBk:-16},
      {lean:-4,head:-4,hx:-2,aFs:16,aFe:56,bA:120,mouth:1,brow:2},
      {}][i])},
  };
  ANIMS.combo.hitsx={2:{m:1},6:{m:1},10:{m:2,heavy:1}};
  Object.assign(ANIMS,STRIKES.tool(G2,{names:{atkH:'Cassetete: golpe lateral',atkV:'Cassetete: pancada por cima',atkS:'Cassetete: estocada',atkSpin:'Cassetete: giro',atkFin:'Cassetete: gancho que lança'}}));
  Object.assign(ANIMS,{
    comboB:{nome:'Combo B: giro, estocada, chute',n:11,dur:i=>[100,50,60,80,90,55,80,90,60,90,140][i],
      hitsx:{2:{m:1},5:{m:1.2,reach:52},8:{m:1.8,heavy:1}},
      pose:i=>G2([
        {aFs:-60,aFe:-30,bA:140,lean:-6,head:-6,hx:-2,lFh:22,lBh:-20,lBk:-30,aBs:30,aBe:80},
        {aFs:20,aFe:40,bA:100,lean:6,hx:2,smear:1,sa:250,lFh:30,lBh:-24,lBk:-32,aBs:-10,aBe:20},
        {tw:0.8,aFs:94,aFe:98,bA:92,lean:26,hx:12,head:-10,smear:1,sa:205,mouth:2,lFh:48,lFk:10,lBh:-32,lBk:-36,aBs:-50,aBe:-20},
        {aFs:112,aFe:130,bA:110,lean:10,hx:7,lFh:40,lFk:6,lBh:-30,lBk:-44,aBs:-40,aBe:-10},
        {aFs:-24,aFe:60,bA:90,lean:-2,hx:2,lFh:26,lBh:-20,lBk:-30,aBs:40,aBe:100,brow:1},
        {tw:1,aFs:88,aFe:90,bA:92,lean:32,hx:16,head:-14,mouth:2,smear:1,sa:120,lFh:52,lFk:12,lBh:-32,lBk:-36,aBs:-60,aBe:-40},
        {tw:0.9,aFs:88,aFe:90,bA:92,lean:30,hx:16,head:-12,lFh:52,lFk:12,lBh:-32,lBk:-36,aBs:-60,aBe:-40},
        {aFs:30,aFe:72,bA:130,lean:-8,hx:5,plant:0,lFh:70,lFk:-10,lBh:-6,lBk:-10,aBs:40,aBe:90,nowide:1},
        {aFs:10,aFe:62,bA:130,lean:-18,hx:9,plant:0,lFh:92,lFk:96,lBh:-4,lBk:-6,mouth:2,brow:1,impact:1,aBs:50,aBe:110,nowide:1},
        {aFs:12,aFe:64,bA:132,lean:-14,hx:9,plant:0,lFh:84,lFk:86,lBh:-4,lBk:-6,aBs:50,aBe:110,nowide:1},
        {lean:2,hx:5,lFh:30,lFk:4,lBh:-22,lBk:-30}][i])},
    jump:{nome:'Pulo',n:7,dur:i=>[100,60,120,120,120,80,110][i],z:[0,8,28,36,18,0,0],squash:[0.92,1.06,1.04,1,1.02,0.86,0.97],
      pose:i=>G2([
        {lean:16,head:-6,lFh:50,lFk:-30,lBh:16,lBk:-60,aFs:-20,aFe:30,bA:130,aBs:-30,aBe:10,brow:1,nowide:1},
        {lean:4,head:-10,plant:0,lFh:6,lFk:-6,lBh:-14,lBk:-22,aFs:40,aFe:110,bA:160,aBs:-40,aBe:-10,nowide:1},
        {lean:-2,plant:0,lFh:56,lFk:-16,lBh:12,lBk:-62,aFs:60,aFe:140,bA:170,aBs:40,aBe:90,nowide:1},
        {lean:2,plant:0,lFh:70,lFk:-24,lBh:24,lBk:-72,aFs:70,aFe:150,bA:170,aBs:50,aBe:100,nowide:1},
        {lean:6,plant:0,lFh:34,lFk:10,lBh:-6,lBk:-22,aFs:50,aFe:110,bA:150,aBs:30,aBe:70,nowide:1},
        {lean:18,lFh:50,lFk:-26,lBh:16,lBk:-56,aFs:20,aFe:70,bA:130,mouth:1,nowide:1},
        {lean:6,lFh:30,lFk:4,lBh:-22,lBk:-30}][i])},
    air:{nome:'Ataque aéreo descendo',n:6,dur:i=>[90,120,70,70,90,140][i],z:[10,34,20,6,0,0],squash:[1.04,1,1.02,1,0.86,0.97],
      hitsx:{2:{m:1.6,heavy:1,air:1,reach:48}},
      pose:i=>G2([
        {lean:-4,plant:0,lFh:56,lFk:-16,lBh:12,lBk:-62,aFs:-60,aFe:-20,bA:150,brow:1,nowide:1},
        {lean:-8,plant:0,lFh:66,lFk:-26,lBh:22,lBk:-72,aFs:170,aFe:190,bA:200,mouth:1,brow:1,nowide:1},
        {lean:24,plant:0,lFh:44,lFk:-6,lBh:0,lBk:-44,aFs:70,aFe:80,bA:100,smear:1,sa:200,mouth:2,brow:1,nowide:1},
        {lean:26,plant:0,aFs:60,aFe:70,bA:100,lFh:34,lFk:2,lBh:-10,lBk:-32,nowide:1},
        {lean:22,lFh:48,lFk:-28,lBh:18,lBk:-54,aFs:60,aFe:60,bA:40,impact:1,mouth:2,nowide:1},
        {lean:6}][i])},
    run:{nome:'Corrida',n:8,dur:()=>75,pose:i=>{ const p=i/8*Math.PI*2, t=o=>12+46*S(p+o), k=o=>t(o)-18-76*Math.max(0,Math.cos(p+o));
      return Object.assign({},GUARD,K_({plant:0,lFh:t(0),lFk:k(0),lBh:t(Math.PI),lBk:k(Math.PI),lean:22+3*S(2*p),head:-14,aFs:30-48*S(p),aFe:96-36*S(p),bA:150-14*S(p),aBs:10+50*S(p),aBe:90+30*S(p),mouth:1})); }},
    dash:{nome:'Investida com estocada',n:6,dur:i=>[110,60,70,100,110,120][i],move:[0,170,170,90,20,0],
      hitsx:{2:{m:1.4,heavy:1,reach:56}},
      pose:i=>G2([
        {lean:16,hx:-2,lFh:30,lFk:-20,lBh:-10,lBk:-40,aFs:-30,aFe:40,bA:80,brow:1},
        {lean:26,hx:6,plant:0,lFh:40,lFk:20,lBh:-36,lBk:-50,aFs:70,aFe:80,bA:90,mouth:1},
        {lean:28,hx:12,lFh:44,lFk:24,lBh:-40,lBk:-56,aFs:86,aFe:88,bA:92,smear:1,sa:150,mouth:2},
        {lean:24,hx:12,lFh:40,lFk:20,lBh:-36,lBk:-52,aFs:84,aFe:88,bA:92},
        {lean:12,hx:6,lFh:24,lFk:4,lBh:-18,lBk:-28},
        {lean:6}][i])},
    launcher:{nome:'Lançador',n:6,dur:i=>[110,50,60,100,120,120][i],
      hitsx:{2:{m:1.1,launch:1,reach:44}},
      pose:i=>G2([
        {lean:22,head:4,hx:-2,lFh:34,lFk:-24,lBh:-6,lBk:-40,aFs:-10,aFe:-30,bA:-150,brow:1},
        {lean:14,aFs:20,aFe:10,bA:-50,lFh:30,lFk:-10,lBh:-10,lBk:-30},
        {lean:-10,head:-12,hx:4,aFs:140,aFe:170,bA:180,smear:1,sa:20,mouth:2,lFh:10,lFk:0,lBh:-20,lBk:-26},
        {lean:-14,aFs:160,aFe:185,bA:195,lFh:6,lBh:-22,lBk:-28,mouth:1},
        {lean:-4,aFs:100,aFe:120,bA:150},
        {lean:4}][i])},
    roll:{nome:'Esquiva (rolamento)',n:6,dur:i=>[70,60,60,60,60,110][i],spin:[0,70,160,250,330,360],move:[60,150,150,150,120,20],
      pose:i=>{ const curl={lean:64,head:24,plant:0,lFh:124,lFk:20,lBh:112,lBk:6,aFs:96,aFe:150,bA:96,aBs:80,aBe:140,brow:1,nowide:1};
        return G2(i===0?{lean:30,head:6,lFh:40,lFk:-30,lBh:10,lBk:-50,aFs:30,aFe:90,bA:150,brow:1}:i===5?{lean:16,lFh:30,lFk:-20,lBh:0,lBk:-40}:curl); }},
    hurtB:{nome:'Dano: cabeça pra trás',n:4,dur:i=>[80,110,130,150][i],pose:i=>G2([
      {lean:-20,head:-30,hx:-7,flash:1,aFs:-34,aFe:-12,bA:100,aBs:-44,aBe:-24,mouth:2,brow:2,blink:1,lFh:22,lBh:-4,lBk:-10},
      {lean:-16,head:-24,hx:-6,aFs:-24,aFe:8,bA:110,aBs:-34,aBe:-14,mouth:2,brow:2,lFh:20,lBh:-6,lBk:-12},
      {lean:-6,head:-8,hx:-3,aFs:10,aFe:46,bA:120,mouth:1,brow:2},{}][i])},
    hurtC:{nome:'Dano: dobra no estômago',n:4,dur:i=>[80,120,130,150][i],pose:i=>G2([
      {lean:36,head:16,hx:-4,flash:1,aFs:54,aFe:20,bA:80,aBs:44,aBe:10,mouth:2,brow:2,blink:1,lFh:22,lFk:-10,lBh:-8,lBk:-22},
      {lean:30,head:14,hx:-3,aFs:46,aFe:24,bA:80,aBs:38,aBe:14,mouth:2,brow:2,lFh:20,lFk:-8,lBh:-8,lBk:-20},
      {lean:12,head:4,hx:-1,mouth:1,brow:2},{}][i])},
    fall:{nome:'Derrubado',n:7,dur:i=>[90,110,110,90,110,160,400][i],pose:i=>Object.assign({},GUARD,K_([
      {lean:-26,head:-20,hx:-4,flash:1,lift:4,plant:0,mouth:2,brow:2,aFs:-40,aFe:-90,bA:160,aBs:-60,aBe:-120,lFh:30,lFk:10,lBh:-4,lBk:-20},
      {rot:-38,lean:-10,head:-14,hx:2,lift:20,plant:0,mouth:2,brow:2,blink:1,aFs:150,aFe:170,bA:200,aBs:170,aBe:200,lFh:50,lFk:30,lBh:30,lBk:10},
      {rot:-72,lean:-4,head:-10,hx:12,lift:12,plant:0,mouth:2,brow:2,blink:1,aFs:160,aFe:190,bA:220,aBs:180,aBe:210,lFh:40,lFk:40,lBh:20,lBk:20},
      {rot:-90,lean:0,head:-14,hx:22,plant:0,mouth:2,brow:2,blink:1,aFs:140,aFe:160,bA:190,aBs:170,aBe:200,lFh:30,lFk:40,lBh:14,lBk:24},
      {rot:-86,lean:-2,head:-6,hx:23,lift:4,plant:0,mouth:1,brow:2,blink:1,aFs:150,aFe:180,bA:200,aBs:176,aBe:210,lFh:24,lFk:30,lBh:10,lBk:16},
      {rot:-90,lean:0,head:-2,hx:24,plant:0,mouth:1,brow:2,blink:1,aFs:150,aFe:170,bA:150,aBs:180,aBe:200,lFh:16,lFk:16,lBh:8,lBk:6},
      {rot:-90,lean:0,head:0,hx:24,plant:0,mouth:0,brow:2,blink:1,aFs:146,aFe:166,bA:140,aBs:176,aBe:196,lFh:14,lFk:12,lBh:6,lBk:4}][i]))},
    getup:{nome:'Levantar',n:6,dur:i=>[140,130,130,120,110,120][i],pose:i=>Object.assign({},GUARD,K_([
      {rot:-90,hx:24,head:4,plant:0,brow:2,blink:1,aFs:146,aFe:166,bA:140,aBs:176,aBe:196,lFh:14,lFk:12,lBh:6,lBk:4},
      {lean:32,head:-6,hx:16,plant:0,brow:2,mouth:1,lFh:84,lFk:92,lBh:70,lBk:110,aFs:30,aFe:70,bA:100,aBs:-50,aBe:-30},
      {lean:24,head:-4,hx:10,brow:1,mouth:1,lFh:90,lFk:-14,lBh:6,lBk:-96,aFs:40,aFe:80,bA:110,aBs:20,aBe:50},
      {lean:20,head:-4,hx:6,brow:1,lFh:54,lFk:-8,lBh:-28,lBk:-62,aFs:30,aFe:80,bA:120,aBs:30,aBe:80},
      {lean:10,hx:2,aFs:50,aFe:96,bA:120},
      {}][i]))},
    victory:{nome:'Vitória: apito e continência',n:8,dur:i=>[140,100,100,160,160,180,220,400][i],pose:i=>K_([
      Object.assign({},GUARD,{lean:2,mouth:3,brow:3}),
      {inhand:1,lFh:18,lFk:2,lBh:-16,lBk:-18,lean:-2,aFs:60,aFe:120,bA:200,aBs:-20,aBe:20,mouth:3,brow:3},
      {inhand:1,lFh:18,lFk:2,lBh:-16,lBk:-18,lean:-4,aFs:100,aFe:150,bA:300,aBs:-20,aBe:20,mouth:3,brow:3,smear:1,sa:40},
      {inhand:0,lFh:16,lFk:2,lBh:-14,lBk:-16,lean:-6,head:-6,whistle:2,aFs:20,aFe:40,brow:1},
      {inhand:0,lFh:16,lFk:2,lBh:-14,lBk:-16,lean:-7,head:-8,whistle:2,aFs:22,aFe:44,brow:1},
      {inhand:0,lFh:16,lFk:2,lBh:-14,lBk:-16,lean:-2,head:-2,aFs:110,aFe:158,aBs:-10,aBe:10,mouth:3,brow:3},
      {inhand:0,lFh:16,lFk:2,lBh:-14,lBk:-16,lean:-2,head:-2,aFs:112,aFe:160,aBs:-10,aBe:10,mouth:3,brow:3},
      {inhand:0,lFh:16,lFk:2,lBh:-14,lBk:-16,lean:-2,head:-2,aFs:112,aFe:160,aBs:-10,aBe:10,mouth:3,brow:3}][i])},
  });
  // kit de beat 'em up (o Vigia já tem pulo, aéreo, investida, lançador e rolamento próprios) + assinaturas
  Object.assign(ANIMS,MOVESET.kit(G2,{skip:{dash:1,launcher:1,hurtC:1}}),MOVESET.sigs(G2,{},[
    ['sigJoelho','lowSweep','Cassetetada no joelho'],
    ['sigOmbro','shoulderCharge','Ombrada de plantão']]));
  function poseOf(anim,i){ return Object.assign({},REST,ANIMS[anim].pose(i)); }

  /* ---------------- esqueleto ---------------- */
  function legIK(H,A,L1,L2){
    const dx=A.x-H.x, dy=A.y-H.y, d=Math.max(Math.abs(L1-L2)+0.5,Math.min(L1+L2-0.05,Math.hypot(dx,dy)));
    const b=Math.atan2(dy,dx), q=Math.acos(Math.max(-1,Math.min(1,(L1*L1+d*d-L2*L2)/(2*L1*d))));
    const k1={x:H.x+Math.cos(b-q)*L1,y:H.y+Math.sin(b-q)*L1}, k2={x:H.x+Math.cos(b+q)*L1,y:H.y+Math.sin(b+q)*L1};
    return k1.x>k2.x?k1:k2;
  }
  function skeleton(P){
    const L1=21, L2=20.5, U=14, E=13, br=P.br||0, ro=P.rot||0, r=rad(ro), cr=Math.cos(r), sr=Math.sin(r);
    const hip={x:AX+P.hx,y:80};
    const R=(lx,ly)=>({x:hip.x+lx*cr-ly*sr,y:hip.y+lx*sr+ly*cr});
    const hipF=R(5,0.6), hipB=R(-5.4,0);
    const kneeF=lp(hipF,P.lFh-ro,L1), ankleF=lp(kneeF,P.lFk-ro,L2), kneeB=lp(hipB,P.lBh-ro,L1), ankleB=lp(kneeB,P.lBk-ro,L2);
    const a=rad(P.lean+ro), c=Math.cos(a), s=Math.sin(a);
    const T=(lx,ly)=>({x:hip.x+lx*c-ly*s, y:hip.y+lx*s+ly*c});
    const tw=P.tw||0, neck=T(1,-34.6-br*0.8), shF=T((-14*0.5+1.2)*(1-tw)-1.5*tw,-30-br*0.8), shB=T((13.6*0.5+1.2)*(1-tw)+7*tw,-30.4-br*0.8);
    const ha=rad(P.lean+ro+P.head), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:neck.x+lx*hc-ly*hs, y:neck.y+lx*hs+ly*hc});
    const elF=lp(shF,P.aFs-ro,U), wrF=lp(elF,P.aFe-ro,E);
    let elB=lp(shB,P.aBs-ro,U), wrB=lp(elB,P.aBe-ro,E);
    if(P.whistle>=0.5){ const q=ik(shB,H(12.4,-6.6),U,E,true); elB=q.E; wrB=q.W; }
    const bAng=P.aFe+P.bat-ro, bDir=Math.atan2(Math.cos(rad(bAng)),Math.sin(rad(bAng)));
    const cont=[[ankleF,FOOT],[ankleB,FOOT],[kneeF,6],[kneeB,6],[hip,7],[T(-13,-6),2],[T(-15,-24),2],[T(16,-10),2],[T(0,-33),3],[H(2.9,-16.4),11.8],[wrF,5.4],[wrB,5.4]];
    let low=-1e9; cont.forEach(([q,rr])=>{ low=Math.max(low,q.y+rr); });
    const dy=GROUND-low-(P.lift||0);
    [hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,neck,shF,shB,elF,wrF,elB,wrB].forEach(q=>q.y+=dy);
    const sk={hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,neck,shF,shB,elF,wrF,elB,wrB,a,ha,H,T,bDir,ro,tw,br,eye:H(8.3,-15.7)};
    if(P.plant>=0.5 && !(P.lift>0.5) && Math.abs(ro)<10){
      [['kneeF','ankleF','hipF'],['kneeB','ankleB','hipB']].forEach(([kn,an,hp])=>{
        const gap=GROUND-(sk[an].y+FOOT); if(gap>0.05 && gap<4.5){ const A={x:sk[an].x,y:sk[an].y+gap}; const k=legIK(sk[hp],A,L1,L2); sk[kn].x=k.x; sk[kn].y=k.y; sk[an].x=A.x; sk[an].y=A.y; }
      });
    }
    return sk;
  }

  /* ---------------- desenho ---------------- */
  function band(p,a,b,wa,wb,col,f,lite,ins){
    const dx=b.x-a.x, dy=b.y-a.y, L=Math.hypot(dx,dy)||1; let nx=-dy/L, ny=dx/L;
    if((-nx+0.6*ny<0)!==!!lite){ nx=-nx; ny=-ny; }
    ins=ins||0; const oa=wa*(1-f)/2-ins, ob=wb*(1-f)/2-ins;
    p.F(col); p.cap({x:a.x+nx*oa,y:a.y+ny*oa},{x:b.x+nx*ob,y:b.y+ny*ob},wa*f,wb*f);
  }
  // volume esculpido: meio-tom largo, sombra roxa grande, borda funda, luz e ponto quente
  function vol(p,a,b,wa,wb,R,X,o={}){
    p.F(R[1]); p.cap(a,b,wa,wb);
    band(p,a,b,wa,wb,X[2],0.66); band(p,a,b,wa,wb,R[2],0.46); band(p,a,b,wa,wb,R[3],0.16);
    if(!o.noLite){ const a2=lerp(a,b,o.l0||0.1), b2=lerp(a,b,o.l1||0.8); band(p,a2,b2,wa,wb,X[1],0.34,true,0.4); band(p,a2,b2,wa,wb,R[0],0.2,true,0.7); band(p,lerp(a,b,o.h0||0.25),lerp(a,b,o.h1||0.55),wa,wb,X[0],0.1,true,1); }
  }
  function sideOff(a,b,w,sgn){ const dx=b.x-a.x, dy=b.y-a.y, L=Math.hypot(dx,dy)||1; let nx=-dy/L, ny=dx/L; if(-nx+0.6*ny<0){ nx=-nx; ny=-ny; } return {x:nx*w*sgn,y:ny*w*sgn}; }
  function xfs(cx,a,ox,oy,sx,sy=1){ const K=PIX.getK(), c=Math.cos(a), s=Math.sin(a); cx.setTransform(c*sx*K,s*sx*K,-s*sy*K,c*sy*K,ox*K,oy*K); }
  function fist(p,M,el,wr){
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x), s=1.55; p.xf(ang,wr.x,wr.y);
    p.F(M.skin[1]); p.ell(2*s,0.2,4.5*s,4.2*s);
    p.F(M.skinX[2]); p.poly([[-0.6*s,1*s],[6*s,0.6*s],[5.4*s,3.6*s],[1.2*s,4.2*s]]);
    p.F(M.skin[2]); p.poly([[0,2.4*s],[5.6*s,1.8*s],[5*s,3.8*s],[1.2*s,4*s]]); p.rect(3.4*s,-2.6*s,0.9,4.6*s); p.rect(5*s,-2*s,0.8,3.4*s);
    p.F(M.skin[3]); p.rect(1.6*s,3.4*s,3*s,0.8);
    p.F(M.skin[0]); p.rect(1.6*s,-3.6*s,3.4*s,1.1); p.F(M.skinX[0]); p.rect(2.4*s,-3.6*s,1.4*s,0.9);
    p.F(M.skin[1]); p.ell(0.4*s,-3.4*s,2.2*s,1.5*s); p.F(M.skin[2]); p.rect(-0.8*s,-2.6*s,2.6*s,0.8);
    p.id();
  }
  function drawArm(p,M,sh,el,wr,front){
    p.id(); const wU=13.4, wE=11.4, wW=8.6;
    vol(p,el,wr,wE,wW,M.skin,M.skinX,{l0:0.05,l1:0.6,h0:0.1,h1:0.4});
    const fb=lerp(el,wr,0.28), fo=sideOff(el,wr,wE*0.12,-1); p.F(M.skinX[1]); p.ell(fb.x+fo.x,fb.y+fo.y,wE*0.36,wE*0.3);
    p.F(M.hair[2]); [0.35,0.55].forEach(t=>{ const q=lerp(el,wr,t); p.rect(q.x-1,q.y-0.4,1.2,0.8); });
    vol(p,sh,el,wU,wE,M.skin,M.skinX,{l0:0.3,l1:0.9});
    // manga curta com punho dobrado
    const e=lerp(sh,el,0.62);
    vol(p,sh,e,wU+3.6,wU+2.8,M.shirt,M.shirtX,{l0:0.01,l1:0.75,h0:0.1,h1:0.45});
    p.F(M.collar[1]); p.cap(lerp(sh,el,0.52),e,wU+3,wU+2.8); p.F(M.collar[2]); p.cap(lerp(sh,el,0.6),e,wU+2.8,wU+2.8); p.F(M.collar[0]); p.cap(lerp(sh,el,0.52),lerp(sh,el,0.55),wU+1.6,wU+1.6);
    const fo2=lerp(sh,e,0.55); p.F(M.shirt[2]); p.cap({x:fo2.x-1.6,y:fo2.y-1.2},{x:fo2.x+1.4,y:fo2.y+1.4},1,0.9);
    if(front){ const q=lerp(sh,el,0.3); p.F(M.gold[3]); p.ell(q.x,q.y,4,4.4); p.F(M.gold[1]); p.ell(q.x,q.y-0.3,3.3,3.7); p.F(M.gold[0]); p.ell(q.x+0.8,q.y-1.4,1.4,1.2); p.F(M.blue[1]); p.ell(q.x,q.y-0.2,1.9,2.2); p.F(M.blue[0]); p.rect(q.x-0.4,q.y-1.4,0.9,0.9); p.F(M.paper[1]); p.rect(q.x-2.8,q.y+1.8,5.6,1.1); }
    fist(p,M,el,wr);
  }
  function drawBoot(p,M,a,ang){
    xfs(p.cx,ang,a.x,a.y,1.3,1.3);
    p.F(M.boot[1]); p.poly([[-5.4,-7],[3,-7],[3.6,-2],[6,-0.6],[11,0.6],[12.8,3],[12.6,4.6],[-6,4.6],[-6.2,-2]]);
    p.F(M.bootX[2]); p.poly([[-6.2,-2],[-5.4,-7],[0,-7],[-0.6,4.6],[-6,4.6]]);
    p.F(M.boot[2]); p.poly([[-6.2,-2],[-5.4,-7],[-3,-7],[-3.6,4.6],[-6,4.6]]); p.F(M.boot[3]); p.rect(-6.2,0,1.4,4.6);
    p.F(M.boot[0]); p.poly([[7.6,0.2],[11,0.6],[12.8,3],[12.4,3.4],[8,2]]); p.rect(-4,-7,6,1); p.F(M.bootX[0]); p.rect(9.6,0.8,1.6,0.8);
    p.F(M.boot[3]); p.rect(-5.4,-4,8.6,0.8);
    p.F(M.sole[0]); [[-1,-5.4],[0.4,-3.4],[2,-1.6]].forEach(([x,y])=>p.rect(x,y,1.8,0.8));
    p.F(M.sole[1]); p.poly([[-6.6,3.6],[13,3.6],[13.4,5.2],[12.4,6.2],[-6.6,6.2]]); p.F(M.sole[2]); p.rect(-6.6,5.3,19,0.9); for(let x=-5;x<12;x+=2.6) p.rect(x,5.2,1.2,1);
    p.id();
  }
  function footAng(sk,front,P){
    const an=front?sk.ankleF:sk.ankleB, gap=GROUND-(an.y+FOOT), k=(front?P.lFk:P.lBk);
    let t=0; if(gap>1.2){ if(k<-12) t=Math.min(38,(-k-12)*0.7); else if(k>50) t=-Math.min(30,(k-50)*0.5); }
    return rad(sk.ro+t);
  }
  function drawLeg(p,M,sk,front,P){
    p.id(); const hip=front?sk.hipF:sk.hipB, knee=front?sk.kneeF:sk.kneeB, ankle=front?sk.ankleF:sk.ankleB, wT=18, wK=13.4, wA=11;
    const q0=lerp(knee,ankle,0.3), o0=sideOff(knee,ankle,wK*0.18,1); p.F(M.pants[1]); p.ell(q0.x+o0.x,q0.y+o0.y,wK*0.5,wK*0.62,Math.atan2(ankle.y-knee.y,ankle.x-knee.x));
    vol(p,knee,ankle,wK,wA,M.pants,M.pantsX,{l0:0.05,l1:0.6,h0:0.1,h1:0.35}); vol(p,hip,knee,wT,wK,M.pants,M.pantsX,{l0:0.05,l1:0.85,h0:0.2,h1:0.6});
    // vinco, dobras grandes, bolso cargo e remendo
    p.F(M.pantsX[0]); p.cap(lerp(hip,knee,0.25),lerp(hip,knee,0.7),0.7,0.7);
    const kk=knee; p.F(M.pants[2]); p.poly([[kk.x-4,kk.y-3],[kk.x+3,kk.y-1.2],[kk.x+3.4,kk.y],[kk.x-3.6,kk.y-1.4]]);
    [0.75,0.85].forEach(t=>{ const q=lerp(knee,ankle,t); p.F(M.pants[2]); p.cap({x:q.x-wA*0.55,y:q.y-0.8},{x:q.x+wA*0.5,y:q.y+0.6},1,1); });
    if(front){ const q=lerp(hip,knee,0.5), ang=Math.atan2(knee.y-hip.y,knee.x-hip.x); p.xf(ang,q.x,q.y);
      p.F(M.pants[3]); p.rect(-5,-0.6,10,7); p.F(M.pants[1]); p.rect(-4.4,0,8.8,5.8); p.F(M.pantsX[1]); p.rect(-4.4,0,8.8,1.6); p.F(M.pants[0]); p.rect(-5,-1.8,10,1.6); p.F(M.silver[2]); p.rect(-0.6,-0.6,1.2,1); p.id();
      p.F(M.patch[1]); p.ell(knee.x+0.8,knee.y,4.4,3.8); p.F(M.patch[0]); p.ell(knee.x+1.8,knee.y-1.2,2,1.4); p.F(M.patch[3]); [[-3,-3],[2.8,-2.6],[3,2.4],[-2.8,2.6]].forEach(([x,y])=>p.rect(knee.x+0.8+x,knee.y+y,0.8,0.8)); }
    drawBoot(p,M,ankle,footAng(sk,front,P));
  }
  function drawTorso(p,M,sk,P){
    xfs(p.cx,sk.a,sk.hip.x,sk.hip.y,1.45*0.8-0.26*Math.max(0,sk.tw),1.1*(1+0.025*(sk.br||0)));
    const R=M.shirt, X=M.shirtX;
    // camisa com barriguinha: massa + sombra roxa grande + luz quente
    p.F(R[1]); p.poly([[-9.6,3],[9.6,3],[10.6,-2],[11.8,-8],[11,-14],[12.2,-20],[12.6,-25.4],[10.4,-29.6],[4.6,-32.6],[-3.6,-32.6],[-10.4,-29.8],[-12.8,-25.6],[-12.4,-20],[-10.2,-14],[-9.6,-8],[-10.2,-2]]);
    p.F(X[2]); p.poly([[-12.8,-25.6],[-2,-27.6],[-1,-17],[-2,-6],[-2,3],[-9.6,3],[-10.2,-2],[-9.6,-8],[-10.2,-14],[-12.4,-20]]);
    p.F(R[2]); p.poly([[-12.8,-25.6],[-6.4,-27.4],[-5.6,-18],[-6,-9],[-5.4,3],[-9.6,3],[-10.2,-2],[-9.6,-8],[-10.2,-14],[-12.4,-20]]);
    p.F(R[3]); p.poly([[-12.8,-25.6],[-10,-26.6],[-9.6,-18],[-10.2,-14],[-12.4,-20]]); p.poly([[-9.6,-4],[-6,-4],[-5.4,3],[-9.6,3]]);
    p.F(R[2]); p.poly([[-6,-17],[2,-15.6],[11,-17.4],[10.6,-13.4],[2,-12],[-6,-13.6]]); p.poly([[2,-6.4],[11.6,-8.4],[10.8,-5.4],[2.4,-4]]);
    p.F(R[3]); p.poly([[-6,-17],[2,-15.6],[11,-17.4],[10.8,-16.4],[2,-14.6],[-6,-16]]);
    p.F(X[1]); p.poly([[0,-29.6],[9.6,-29.4],[12.2,-24],[11.8,-19.6],[2,-18],[-1,-23]]); p.poly([[3,-12],[11,-12.4],[11.6,-8.4],[3.6,-7]]);
    p.F(R[0]); p.poly([[2.6,-29.2],[9.4,-28.8],[11.8,-23.6],[11.2,-20.6],[6,-21.2],[3,-24.6]]); p.poly([[6,-11.6],[11,-11.8],[11.4,-9.4],[6.6,-9]]);
    p.F(X[0]); p.poly([[5,-28.8],[9,-28.6],[10.6,-25.2],[7,-25.8]]);
    // vista com botões
    p.F(R[3]); p.rect(3.6,-28.6,1,27); p.F(X[1]); p.rect(4.6,-28.6,0.6,27); p.F(M.silver[1]); [-24,-18,-12,-6].forEach(y=>p.rect(4.4,y,1.2,1.2));
    // bolsos com lapela
    [[-5.8,-24],[6.2,-24]].forEach(([x,y],k)=>{ p.F(R[3]); p.rect(x,y,5.4,6.4); p.F(k?X[1]:R[2]); p.rect(x+0.5,y+1.6,4.4,4.2); p.F(M.collar[1]); p.rect(x-0.2,y,5.8,1.8); p.F(M.collar[0]); p.rect(x,y,5.4,0.6); p.F(M.silver[2]); p.rect(x+2.2,y+1.2,1,0.8); });
    // distintivo + crachá
    p.F(M.silver[3]); p.poly([[-5,-28],[-0.8,-28],[-0.6,-24.4],[-2.9,-22.6],[-5.2,-24.4]]); p.F(M.silver[1]); p.poly([[-4.4,-27.4],[-1.4,-27.4],[-1.4,-24.8],[-2.9,-23.6],[-4.4,-24.8]]); p.F(M.silver[0]); p.rect(-4,-27,1.4,1); p.F(M.blue[1]); p.rect(-3.4,-26,1,1);
    p.F(M.paper[1]); p.rect(6.6,-21.2,4.4,2.4); p.F(M.blue[1]); p.rect(6.6,-19.4,4.4,0.8);
    // dobras grandes do tecido
    p.F(R[2]); p.poly([[-5,-25],[1,-20],[0.4,-18.8],[-5.6,-23.4]]); p.poly([[-4,-8],[2.6,-6],[2.2,-4.8],[-4.2,-6.8]]);
    p.F(X[1]); p.poly([[-4.4,-24],[0.8,-19.6],[1.4,-20.4],[-3.8,-25]]);
    // gola em V + cordão do apito
    p.F(M.skin[1]); p.poly([[-0.6,-32.8],[5.6,-33],[3,-27.4]]); p.F(M.skin[2]); p.poly([[-0.6,-32.8],[1.6,-32.8],[2.6,-28.4]]);
    p.F(M.collar[1]); p.poly([[-3.4,-33.2],[1.6,-34.6],[2.6,-28.4],[-0.4,-30]]); p.poly([[4,-34.6],[8.4,-33.2],[5.6,-29.6],[3.4,-28.4]]); p.F(M.collar[0]); p.rect(-2.6,-33.4,3,0.8); p.F(M.collar[3]); p.rect(-3.4,-31,2,0.8);
    if(!(P.whistle>=0.5)){ p.F(M.gold[1]); p.poly([[2.4,-29],[3.2,-29],[3.6,-19],[2.8,-19]]); p.F(M.silver[1]); p.ell(4.4,-18.6,2.2,1.4); p.F(M.silver[0]); p.rect(3.4,-19.4,1.4,0.6); }
    // dragona + rádio no ombro de trás
    p.F(M.collar[1]); p.rect(-11,-31.6,8,2); p.F(M.silver[1]); p.rect(-4.4,-31.4,1,1);
    p.F(M.belt[1]); p.rect(-12.2,-30.8,5,8); p.F(M.belt[0]); p.rect(-12.2,-30.8,5,1); p.rect(-10.4,-37.8,1,7); p.F(M.belt[2]); [-28,-26.4,-24.8].forEach(y=>p.rect(-11.4,y,3.4,0.6)); p.F(M.led[1]); p.rect(-8.6,-29.8,1.2,1.2);
    // cinto de serviço
    p.F(M.belt[1]); p.poly([[-11.2,-3.8],[10.8,-3.8],[11,1.2],[-11.4,1.2]]);
    p.F(M.belt[0]); p.rect(-4,-3.6,14,0.8); p.F(M.belt[3]); p.rect(-11.2,0.4,22,0.8); p.F(M.belt[2]); p.rect(-11.2,-3.8,6,4);
    p.F(M.silver[1]); p.rect(5,-3.2,3.6,3.8); p.F(M.belt[2]); p.rect(6,-2.2,1.6,1.8); p.F(M.silver[0]); p.rect(5,-3.2,3.6,0.8);
    p.F(M.belt[1]); p.rect(-12.8,-2.8,4.4,7.4); p.F(M.belt[0]); p.rect(-12.6,-2.6,4,1.2); p.F(M.silver[2]); p.rect(-11.2,-1.2,1.2,1.2);
    p.F(M.silver[1]); p.ell(-4,2.6,1.6,1.6); p.F(M.belt[2]); p.ell(-4,2.6,0.8,0.8); p.F(M.gold[1]); p.rect(-4.6,3.8,1,3); p.F(M.silver[1]); p.rect(-3.4,3.6,1,2.6);
    p.id();
  }
  function drawHead(p,M,sk,P){
    xfs(p.cx,sk.ha,sk.neck.x,sk.neck.y,HS,HS);
    p.F(M.skin[1]); p.cap(P2(0.4,4),P2(1.2,-6),9.4,8.4);
    p.F(M.skin[2]); p.poly([[-4,3],[-3.2,-6],[-0.6,-6],[-1,3]]); p.poly([[0,-4.6],[8.6,-2.4],[7,-0.6],[0.4,-1.8]]);
    p.F(M.skin[1]); p.ell(2.6,-14.6,10.2,10.4);
    p.poly([[-3,-9],[10.8,-10.4],[13,-6],[12,-2],[8.2,1],[1.2,1]]);
    p.F(M.skin[2]); p.poly([[-3.4,-9.4],[1.6,-8.6],[2.8,-3],[1.6,0.6],[-1.8,-2]]);
    p.F(M.skin[0]); p.ell(9.2,-9.4,1.8,1);
    // orelha + cabelo grisalho rente
    p.F(M.skin[1]); p.ell(-3.4,-12.4,2.6,3.6); p.F(M.skin[2]); p.ell(-3.1,-12.2,1.3,2.3); p.F(M.skin[3]); p.rect(-3.4,-12.8,0.8,1.8);
    p.F(M.hair[1]); p.poly([[-8.6,-18],[-1.6,-18],[-0.4,-12],[-1.4,-9],[-6,-7.6],[-8.6,-11]]); p.F(M.hair[0]); [[-6.4,-16],[-4,-14.6],[-6.6,-12]].forEach(([x,y])=>p.rect(x,y,1.2,0.8)); p.F(M.hair[1]); p.rect(-0.6,-17.6,2,6);
    // barba por fazer
    p.F(M.stub[1]); p.poly([[0.4,-8.6],[2,-4],[6,0],[10,0.4],[12.4,-2],[13,-4.4],[11.6,-4],[9,-3.4],[6.8,-4.2],[4,-7],[2.4,-9.4]]); p.F(M.stub[2]); p.poly([[0.4,-8.6],[2,-4],[4.6,-1.4],[3,-5.6]]);
    // olhos
    const sq=P.brow>=1.5&&P.brow<2.5&&P.mouth>=1.5&&P.mouth<2.5;
    if(P.blink>=0.5||sq){ p.F(M.skin[3]); if(sq) p.poly([[4.6,-14.6],[9.4,-13.6],[9.4,-12.6],[4.6,-12.8]]); else p.rect(4.4,-13.4,5,1); p.rect(10.8,-13.6,1.8,0.9); }
    else {
      p.F(M.eye[1]); p.ell(6.9,-13.3,2.7,2.2); p.F(M.eye[2]); p.rect(4.6,-12,4.8,0.9);
      p.F(M.iris[1]); p.rect(7.1,-14.8,2.2,3); p.F(M.iris[3]); p.rect(7.8,-14.2,1.1,1.8); p.F(M.eye[0]); p.rect(7.2,-14.8,0.9,0.9);
      p.F(M.skin[3]); p.poly([[4,-15.4],[9.8,-15.8],[9.8,-14.8],[4.4,-14.6]]); p.F(M.skin[2]); p.rect(4.4,-11,4.6,0.8);
      p.F(M.eye[1]); p.ell(11.7,-13.4,1.1,1.8); p.F(M.iris[1]); p.rect(11.5,-14.6,1.1,2); p.F(M.skin[3]); p.rect(10.7,-15.6,2.4,0.8);
    }
    // sobrancelha grossa grisalha
    const b=Math.round(P.brow||0), yo=b===1?-18.6:b===2?-17.2:b===3?-18.8:-17.8, yi=b===1?-16.2:b===2?-19.2:b===3?-18.2:-17.4;
    p.F(M.hair[1]); p.poly([[3.4,yo],[10.6,yi],[10.6,yi+2.2],[3.4,yo+2]]); p.poly([[11.2,yi],[13.4,yi+(b===1?-0.8:0.4)],[13.4,yi+2],[11.2,yi+2]]); p.F(M.hair[0]); p.rect(4.4,yo+0.2,2.4,0.7);
    // nariz largo
    p.F(M.skin[1]); p.poly([[10.2,-14.8],[14.8,-9.6],[14.2,-8.2],[10.2,-8.4]]);
    p.F(M.skin[2]); p.rect(10.4,-9,4,1); p.F(M.skin[3]); p.rect(11.8,-9,1.2,0.8); p.F(M.skin[0]); p.rect(11.6,-13.2,0.9,2.8);
    // boca
    const m=Math.round(P.mouth||0);
    if(m===2){ p.F(M.mouth[2]); p.poly([[7.2,-7.4],[12.8,-7.6],[12.2,-2],[7.8,-2.2]]); p.F(M.teeth[1]); p.rect(7.6,-7.4,4.8,1.3); p.F(M.mouth[0]); p.ell(10,-3,1.9,0.9); }
    else if(m===1){ p.F(M.mouth[1]); p.rect(7.2,-7.2,5.6,3.4); p.F(M.teeth[1]); p.rect(7.6,-6.8,4.8,2.6); p.F(M.teeth[2]); p.rect(7.6,-5.5,4.8,0.6); }
    else if(m===3){ p.F(M.mouth[2]); p.poly([[7,-6.6],[12.8,-7.4],[11.6,-4],[8.2,-4.2]]); p.F(M.teeth[1]); p.rect(7.6,-6.6,4.8,1.3); }
    else { p.F(M.mouth[2]); p.rect(7.8,-5.8,4.4,1); p.F(M.skin[2]); p.rect(8.4,-4.4,3,0.8); }
    // bigodão
    p.F(M.hair[1]); p.poly([[6.4,-9],[13.6,-9.2],[14.6,-6.4],[13,-5.6],[10.4,-7],[7.6,-6],[6,-6.8]]); p.F(M.hair[0]); p.rect(8.6,-9,3.4,0.8); p.F(M.hair[2]); p.rect(12.6,-6.4,1.6,0.8);
    if(P.whistle>=0.5){ p.F(M.silver[2]); p.poly([[11.4,-6.8],[18,-7],[18.2,-3.6],[11.6,-3.6]]); p.F(M.silver[1]); p.rect(11.6,-6.8,6.2,1.4); p.F(M.silver[3]); p.rect(16.2,-6,1.2,1.4); p.F(M.skin[0]); p.ell(9.2,-5.4,1.8,1.4); }
    // quepe
    p.F(M.cap[1]); p.poly([[-10.4,-19.4],[-9.8,-27],[0,-31],[10.4,-29.4],[13.2,-23.4],[11.4,-19.8]]);
    p.F(M.cap[2]); p.poly([[-10.4,-19.4],[-9.8,-27],[-6,-28.6],[-6.6,-19.6]]);
    p.F(M.cap[0]); p.poly([[-4,-28.6],[2,-30.4],[8.4,-29.2],[2,-28]]);
    p.F(M.band[1]); p.poly([[-10.6,-21.8],[11.8,-22.2],[12.2,-18.4],[-10.4,-18]]);
    p.F(M.band[0]); p.rect(-10,-20.6,21.6,0.8); p.F(M.gold[1]); p.rect(-9.6,-22.6,21,0.8);
    p.F(M.visor[1]); p.poly([[8,-19.8],[21,-18.2],[19.6,-15.8],[8.4,-17]]); p.F(M.visor[0]); p.rect(11,-19,7,0.9); p.F(M.visor[3]); p.rect(9,-17.2,10,0.8);
    p.F(M.gold[2]); p.poly([[2.8,-25.6],[7.6,-25.6],[7.4,-21.8],[5.2,-20.2],[3,-21.8]]); p.F(M.gold[0]); p.poly([[3.4,-25],[7,-25],[6.8,-22.4],[5.2,-21.2],[3.6,-22.4]]); p.F(M.blue[1]); p.rect(4.6,-24,1.4,1.4);
    p.id();
  }
  function drawSmear(p,M,sk,P,len){
    p.id(); const tip=lp(sk.wrF,P.aFe+P.bat-sk.ro,len+2), sh=sk.shF;
    const cur=Math.atan2(tip.x-sh.x,tip.y-sh.y)*180/Math.PI, r1=Math.hypot(tip.x-sh.x,tip.y-sh.y)+3, sa=P.sa;
    const wide=P.smear>=2.5?20:14, n=14;
    const bd=(rr0,rr1,col)=>{ const pts=[]; for(let k=0;k<=n;k++){ const a=sa+(cur-sa)*k/n; pts.push([sh.x+Math.sin(rad(a))*rr1, sh.y+Math.cos(rad(a))*rr1]); }
      for(let k=n;k>=0;k--){ const a=sa+(cur-sa)*k/n, t=k/n, rr=rr1-(rr1-rr0)*t*t; pts.push([sh.x+Math.sin(rad(a))*rr, sh.y+Math.cos(rad(a))*rr]); } p.F(col); p.poly(pts); };
    bd(r1-wide,r1+1.6,M.trail[1]); bd(r1-wide+3,r1,M.smear[1]); bd(r1-5,r1-0.6,M.smear[0]);
  }
  function star(p,c,r,col,col2){ const pts=[]; for(let k=0;k<16;k++){ const a=k/16*Math.PI*2, rr=k%2?r*0.28:(k%4?r*0.62:r); pts.push([c.x+Math.cos(a)*rr,c.y+Math.sin(a)*rr]); } p.F(col); p.poly(pts); if(col2){ p.F(col2); p.circle(c,r*0.22); } }
  // contorno de baixo com 2 px (peso na base das formas)
  function thick(cv){ const g=cv.getContext('2d'), W=cv.width, H=cv.height, im=PIX.pix(cv), d=im.data, src=new Uint8ClampedArray(d);
    const isO=i=>src[i+3]>0&&src[i]===23&&src[i+1]===11&&src[i+2]===28;
    for(let y=2;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(src[i+3]) continue; const u=i-W*4, u2=u-W*4; if(isO(u)&&src[u2+3]&&!isO(u2)){ d[i]=23; d[i+1]=11; d[i+2]=28; d[i+3]=255; } }
    g.putImageData(im,0,0); }
  const cache=PIX.cache();
  function frame(skin,tier,anim,fi,step=5){
    const K=PIX.getK(), key=skin+tier+anim+fi+step+'@'+K; if(cache.has(key)) return cache.get(key);
    if(cache.size>700) cache.delete(cache.keys().next().value);
    const cv=renderPose(skin,tier,poseOf(anim,fi),step,K); cache.set(key,cv); return cv;
  }
  // pose arbitrária (interpolada) com cache LRU por chave quantizada
  const pcache=(function(){ const m=PIX.cache(); return {get(k){ const v=m.get(k); if(v){ m.delete(k); m.set(k,v); } return v; }, set(k,v){ m.set(k,v); if(m.size>900) m.delete(m.keys().next().value); }}; })();
  function framePose(skin,tier,P,step=5,key){
    const K=PIX.getK(), k=key!=null?skin+tier+key+step+'@'+K:null; if(k){ const c=pcache.get(k); if(c) return c; }
    const cv=renderPose(skin,tier,Object.assign({},REST,P),step,K); if(k) pcache.set(k,cv); return cv;
  }
  function renderPose(skin,tier,P,step,K){
    const T=BATON.TIERS[tier]||BATON.TIERS.comum;
    const M=Object.assign(mats(skin),T.M,{trail:ramp(T.cor)}), sk=skeleton(P), inh=P.inhand>=0.5;
    const pen=(c,u)=>{ const p=mkPen(c,u); p.cx=c; return p; };
    const parts=[
      {back:true, draw:(c,u)=>drawArm(pen(c,u),M,sk.shB,sk.elB,sk.wrB,false)},
      {back:true, draw:(c,u)=>drawLeg(pen(c,u),M,sk,false,P)},
      {draw:(c,u)=>drawTorso(pen(c,u),M,sk,P)},
      {draw:(c,u)=>drawLeg(pen(c,u),M,sk,true,P)},
      {draw:(c,u)=>drawHead(pen(c,u),M,sk,P)},
      {draw:(c,u)=>{ const p=pen(c,u); if(inh) BATON.draw(p,tier,sk.wrF,sk.bDir); else BATON.draw(p,tier,sk.T(9,-1),Math.PI/2+sk.a-0.14,{noCord:true}); }},
    ];
    if(P.smear>=0.5) parts.push({noShade:true,smear:true,draw:(c,u)=>P.kick?MOVESET.kickSmear(pen(c,u),M,sk,P):drawSmear(pen(c,u),M,sk,P,T.len)});
    parts.push({draw:(c,u)=>drawArm(pen(c,u),M,sk.shF,sk.elF,sk.wrF,true)});
    if(inh) parts.push({draw:(c,u)=>{ const p=pen(c,u); fist(p,M,sk.elF,sk.wrF); }});
    if(P.impact>=0.5) parts.push({noShade:true,smear:true,draw:(c,u)=>{ const p=pen(c,u); p.id(); star(p,P.kick?MOVESET.kickTip(sk,P):lp(sk.wrF,P.aFe+P.bat-sk.ro,T.len),P.impact>=2?14:10,M.smear[1],M.smear[0]); }});
    if(P.whistle>=1.5) parts.push({noShade:true,smear:true,draw:(c,u)=>{ const p=pen(c,u); p.id(); const m=sk.H(21,-5.6); p.F(M.smear[0]); [[3,-4,3,1],[4,0,4,1],[3,4,3,1]].forEach(([dx,dy,w,h])=>{ p.cap({x:m.x+dx,y:m.y+dy},{x:m.x+dx+w,y:m.y+dy*1.5},1.2,1.2); }); }});
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash>=0.5,rim:RIM}); if(step>=4) thick(cv);
    const tip=lp(sk.wrF,P.aFe+P.bat-sk.ro,T.len);
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._tip=sc(tip); cv._hand=sc(sk.wrF); cv._mouth=sc(sk.H(18,-5.6)); cv._head=sc(sk.H(4.5,-33.6)); cv._hip=sc(sk.hip);
    return cv;
  }
  return {FW,FH,GROUND,AX,SKINS,ANIMS,poseOf,frame,framePose,mats};
})();

/* ===== hub/recruta_base ===== */
/* RECRUTA_BASE — fonte de arte (editável). Build: npm run art */
/* Rig compartilhado dos recrutas no padrão do HEROI/VIGIA: mesmo esqueleto (proporção heroica, base de luta
   baixa), volume esculpido de 7 tons (luz quente → sombra roxa grande), cabeça expressiva, botas/chinelo,
   contorno de 2 px embaixo. Cada recruta passa roupa, cabeça, ferramenta(s), poses próprias e especial. */
const RECRUTA_BASE=(function(){
  const {rad,ramp,mix,lp,lerp,P2,ik,mkPen,compose}=PIX;
  const SKINS={media:{nome:'Pele média',hex:'#c08458'}, escura:{nome:'Pele escura',hex:'#7e4f32'}, clara:{nome:'Pele clara',hex:'#e6b28a'}};
  function satb(h,k){ let [r,g,b]=PIX.hexRgb(h).map(v=>v/255); const mx=Math.max(r,g,b), mn=Math.min(r,g,b), l=(mx+mn)/2; let s=0,hh=0;
    if(mx!==mn){ const d=mx-mn; s=l>0.5?d/(2-mx-mn):d/(mx+mn); hh=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4; hh/=6; }
    s=Math.min(1,s*k); if(!s) return h; const q=l<0.5?l*(1+s):l+s-l*s, pp=2*l-q, fn=t=>{ t=(t+1)%1; return t<1/6?pp+(q-pp)*6*t:t<1/2?q:t<2/3?pp+(q-pp)*(2/3-t)*6:pp; };
    return PIX.toHex(fn(hh+1/3)*255,fn(hh)*255,fn(hh-1/3)*255); }
  const R4=(h,k=1.18)=>{ const b=satb(h,k); return [mix(b,'#fff2cc',.36),b,mix(b,'#3b2c63',.48),mix(b,'#1c1233',.74)]; };
  const RX=(h,k=1.18)=>{ const b=satb(h,k); return [mix(b,'#fff2cc',.64),mix(b,'#ffe0a8',.17),mix(b,'#4a3470',.26),mix(b,'#100a20',.86)]; };
  const BASEM={eye:['#ffffff','#f4efe6','#b8b4a8','#6e6a60'], iris:['#8a5a3a','#4a2a18','#2a180e','#140a06'], mouth:['#b04a5a','#5a1c2c','#2a0c18','#1a0610'], teeth:['#fffbe8','#e8e0c0','#b0a680','#6a6040'], smear:['#ffffff','#fff6d0','#e8d8a0','#b8a870'],
    belt:['#8a6440','#5a3c22','#3a2414','#1e120a'], buckle:['#fff4c0','#d8b860','#8a7030','#4a3a14'], metal:['#ffffff','#c8ccd4','#8a8ea0','#4a4e60']};
  const BODY={
    m:{f:0,L1:21,L2:20.5,U:14,E:13,shF:-14,shB:13.6,tsx:1.45,tsy:1.1,wU:13.4,wE:11.4,wW:8.6,wT:18,wK:13.4,wA:10.2,fist:1.55,hipF:5,hipB:-5.4,neck:8.8,foot:8,shoe:1.3,head:1.12},
    f:{f:1,L1:20.5,L2:20,U:13,E:12,shF:-9,shB:8.6,tsx:1.2,tsy:1.1,wU:9.6,wE:8.2,wW:6.6,wT:15,wK:11.4,wA:8.6,fist:1.2,hipF:3.6,hipB:-3.8,neck:6.8,foot:7.1,shoe:1.14,head:1.12},
  };
  /* ---------- helpers de desenho (iguais ao HEROI) ---------- */
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
  // recorta pelo polígono (no transform atual) e desenha dentro
  function clip(p,pts,fn){ const c=p.cx; c.save(); c.beginPath(); pts.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])); c.closePath(); c.clip(); fn(); c.restore(); }
  function star(p,c,r,col,col2){ const pts=[]; for(let k=0;k<16;k++){ const a=k/16*Math.PI*2, rr=k%2?r*0.28:(k%4?r*0.62:r); pts.push([c.x+Math.cos(a)*rr,c.y+Math.sin(a)*rr]); } p.F(col); p.poly(pts); if(col2){ p.F(col2); p.circle(c,r*0.22); } }
  function thick(cv){ const g=cv.getContext('2d'), W=cv.width, H=cv.height, im=PIX.pix(cv), d=im.data, src=new Uint8ClampedArray(d);
    const isO=i=>src[i+3]>0&&src[i]===23&&src[i+1]===11&&src[i+2]===28;
    for(let y=2;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(src[i+3]) continue; const u=i-W*4, u2=u-W*4; if(isO(u)&&src[u2+3]&&!isO(u2)){ d[i]=23; d[i+1]=11; d[i+2]=28; d[i+3]=255; } }
    g.putImageData(im,0,0); }
  function legIK(H,A,L1,L2){
    const dx=A.x-H.x, dy=A.y-H.y, d=Math.max(Math.abs(L1-L2)+0.5,Math.min(L1+L2-0.05,Math.hypot(dx,dy)));
    const b=Math.atan2(dy,dx), q=Math.acos(Math.max(-1,Math.min(1,(L1*L1+d*d-L2*L2)/(2*L1*d))));
    const k1={x:H.x+Math.cos(b-q)*L1,y:H.y+Math.sin(b-q)*L1}, k2={x:H.x+Math.cos(b+q)*L1,y:H.y+Math.sin(b+q)*L1};
    return k1.x>k2.x?k1:k2;
  }

  function make(cfg){
    const FW=cfg.FW||196, FH=cfg.FH||160, GROUND=cfg.GROUND||154, AX=cfg.AX||92, RIM=cfg.rim||'#a9c8f0';
    const B=Object.assign({},BODY[cfg.f?'f':'m'],cfg.body||{});
    // tronco em 3/4 de perfil (casa com as pernas de lado): ombros juntos, peito mais estreito
    const PROF=Object.assign({sh:0.5,shO:1.2,tx:0.8},cfg.prof||{}); B.shF=B.shF*PROF.sh+PROF.shO; B.shB=B.shB*PROF.sh+PROF.shO; B.tsx*=PROF.tx;
    const SK_=cfg.skins||SKINS;
    /* ---------------- poses (kit do HEROI) ---------------- */
    const REST={hx:0,lean:-2,head:0,aFs:4,aFe:14,aBs:-8,aBe:6,lFh:4,lFk:-2,lBh:-6,lBk:-8,bat:-10,inhand:1,mouth:0,smear:0,sa:0,flash:0,impact:0,brow:0,rot:0,lift:0,blink:0,plant:1,tw:0,br:0,two:0};
    const K_=o=>{ const r=Object.assign({},o); if(r.bA!==undefined){ r.bat=r.bA-(r.aFe!==undefined?r.aFe:REST.aFe); delete r.bA; } return r; };
    const ST={lFh:52,lFk:8,lBh:-42,lBk:-46};
    const GUARD=Object.assign({},ST,K_({aFs:70,aFe:86,bA:128,aBs:46,aBe:112,lean:12,brow:1,two:cfg.twoGuard?1:0}),cfg.guard?K_(cfg.guard):{});
    const G=o=>{ const r=K_(o); if(!r.nowide){ if(r.lFh!==undefined){ r.lFh+=14; r.lFk=(r.lFk||0)+3; } if(r.lBh!==undefined){ r.lBh-=12; r.lBk=(r.lBk!==undefined?r.lBk:-30)-10; } } delete r.nowide; return Object.assign({},GUARD,r); };
    const th=(p,o)=>6+24*Math.sin(p+o), sh=(p,o)=>th(p,o)-34*Math.max(0,Math.cos(p+o));
    const S=Math.sin;
    const ANIMS={
      idle:{nome:'Parado',n:8,dur:()=>140,pose:i=>{ const p=i/8*Math.PI*2, s=S(p);
        return K_({lean:4+1.4*s,br:s,hx:1.2*S(p/2),head:1.2*S(p-0.7),lFh:26,lFk:4+2.2*s,lBh:-22,lBk:-24+2.2*s,aFs:10+2*s,aFe:36+3*s,bA:-34+3*s,aBs:-14+2*s,aBe:18+3*s,blink:i===5?1:0}); }},
      walk:{nome:'Andar',n:8,dur:()=>110,pose:i=>{ const p=i/8*Math.PI*2;
        return K_({plant:0,lFh:th(p,0),lFk:sh(p,0),lBh:th(p,Math.PI),lBk:sh(p,Math.PI),lean:2+1.4*S(2*p),head:S(2*p-0.6),aFs:10-18*S(p),aFe:34-14*S(p),bA:-40-10*S(p),aBs:-6+20*S(p),aBe:10+22*S(p)}); }},
      run:{nome:'Correr',n:8,dur:()=>72,pose:i=>{ const p=i/8*Math.PI*2, t=o=>12+46*S(p+o), k=o=>t(o)-18-76*Math.max(0,Math.cos(p+o));
        return K_({plant:0,lFh:t(0),lFk:k(0),lBh:t(Math.PI),lBk:k(Math.PI),lean:22+3*S(2*p),head:-14,lift:2+3*Math.abs(S(p)),aFs:30-48*S(p),aFe:96-36*S(p),bA:60-14*S(p),aBs:10+50*S(p),aBe:90+30*S(p),brow:1,mouth:1}); }},
      guard:{nome:'Guarda',n:8,dur:()=>120,pose:i=>{ const p=i/8*Math.PI*2, s=S(p);
        return Object.assign({},GUARD,K_({lean:GUARD.lean-4+1.2*s,aFs:GUARD.aFs+3*s,aFe:GUARD.aFe+4*s,bat:GUARD.bat-s,aBs:GUARD.aBs+2*s,aBe:GUARD.aBe+3*s,lFk:5+1.6*s,lBk:-38+1.6*s,head:-2+s,blink:i===6?1:0})); }},
      combo:{nome:cfg.comboName||'Combo de 3 golpes',n:12,hits:{2:1,6:2,10:3},dur:i=>[110,50,60,90,80,40,60,90,110,60,70,170][i]*(cfg.comboSlow||1),pose:i=>G([
        {tw:-0.3,aFs:-40,aFe:-130,bA:200,lean:-12,head:-4,hx:-4,lFh:22,lFk:0,lBh:-18,lBk:-28,aBs:40,aBe:100,mouth:1},
        {aFs:40,aFe:120,bA:168,lean:2,hx:1,lFh:30,lBh:-24,lBk:-34,aBs:20,aBe:60},
        {tw:0.85,aFs:84,aFe:94,bA:100,lean:30,hx:13,head:-12,mouth:2,smear:1,sa:205,aBs:-50,aBe:-20,lFh:50,lFk:10,lBh:-32,lBk:-36},
        {tw:0.7,aFs:62,aFe:46,bA:22,lean:30,hx:13,head:-10,mouth:1,aBs:-50,aBe:-10,lFh:50,lFk:10,lBh:-32,lBk:-36},
        {tw:-0.2,aFs:12,aFe:64,bA:-40,lean:4,hx:6,aBs:10,aBe:60,lFh:34,lFk:4,lBh:-26,lBk:-36},
        {aFs:44,aFe:84,bA:24,lean:2,hx:5,aBs:-10,aBe:30,lFh:36,lFk:6,lBh:-28,lBk:-38},
        {tw:0.8,aFs:128,aFe:150,bA:140,lean:-2,hx:12,head:-10,mouth:2,smear:2,sa:12,aBs:-60,aBe:-30,lFh:50,lFk:10,lBh:-32,lBk:-36},
        {tw:0.6,aFs:152,aFe:176,bA:180,lean:-6,hx:12,head:-12,mouth:1,aBs:-60,aBe:-40,lFh:50,lFk:10,lBh:-32,lBk:-36},
        {aFs:168,aFe:204,bA:232,lean:-14,hx:4,head:-8,brow:1,mouth:1,lift:2,plant:0,lFh:46,lFk:-14,lBh:-8,lBk:-56,aBs:150,aBe:170},
        {aFs:176,aFe:210,bA:244,lean:-16,hx:6,mouth:1,lift:9,plant:0,lFh:62,lFk:-8,lBh:14,lBk:-56,aBs:160,aBe:180},
        {tw:0.9,aFs:70,aFe:56,bA:18,lean:38,hx:15,head:-14,mouth:2,brow:1,smear:3,sa:232,impact:1,aBs:-60,aBe:-30,lFh:54,lFk:12,lBh:-32,lBk:-36},
        {tw:0.7,aFs:64,aFe:50,bA:22,lean:34,hx:14,head:-12,mouth:1,aBs:-50,aBe:-20,lFh:54,lFk:12,lBh:-32,lBk:-36}][i])},
      roll:{nome:'Esquiva (rolamento)',n:6,dur:i=>[70,60,60,60,70,110][i],pose:i=>{
        const curl={lean:64,head:24,lFh:124,lFk:20,lBh:112,lBk:6,aFs:96,aFe:150,bA:96,aBs:80,aBe:140,plant:0,brow:1,two:0};
        return K_([
          {lean:34,head:8,hx:-4,lFh:50,lFk:-20,lBh:-10,lBk:-60,aFs:40,aFe:96,bA:110,aBs:40,aBe:100,brow:1},
          Object.assign({},curl,{rot:80,hx:0}), Object.assign({},curl,{rot:170,hx:4}),
          Object.assign({},curl,{rot:260,hx:8}), Object.assign({},curl,{rot:330,hx:11,lean:50}),
          {lean:22,hx:12,head:-2,lFh:70,lFk:-12,lBh:2,lBk:-90,aFs:30,aFe:80,bA:120,aBs:30,aBe:80,brow:1}][i]); }},
      hurt:{nome:'Dano',n:4,dur:i=>[80,110,130,160][i],pose:i=>G([
        {lean:-16,head:-16,hx:-6,flash:1,two:0,aFs:-14,aFe:24,bA:110,aBs:-36,aBe:-14,mouth:2,brow:2,lFh:18,lBh:-6,lBk:-12},
        {lean:-12,head:-12,hx:-5,two:0,aFs:-2,aFe:34,bA:110,aBs:-26,aBe:-4,mouth:2,brow:2,blink:1,lFh:18,lBh:-8,lBk:-16},
        {lean:-4,head:-4,hx:-2,aFs:16,aFe:56,bA:120,mouth:1,brow:2},
        {}][i])},
      hurtB:{nome:'Dano: cabeça pra trás',n:4,dur:i=>[80,110,130,150][i],pose:i=>G([
        {lean:-20,head:-30,hx:-7,flash:1,two:0,aFs:-34,aFe:-12,bA:100,aBs:-44,aBe:-24,mouth:2,brow:2,blink:1,lFh:22,lBh:-4,lBk:-10},
        {lean:-16,head:-24,hx:-6,two:0,aFs:-24,aFe:8,bA:110,aBs:-34,aBe:-14,mouth:2,brow:2,lFh:20,lBh:-6,lBk:-12},
        {lean:-6,head:-8,hx:-3,aFs:10,aFe:46,mouth:1,brow:2},{}][i])},
      fall:{nome:'Derrubado',n:7,dur:i=>[90,110,110,90,110,160,400][i],pose:i=>K_([
        {lean:-26,head:-20,hx:-4,flash:1,lift:4,plant:0,mouth:2,brow:2,aFs:-40,aFe:-90,bA:160,aBs:-60,aBe:-120,lFh:30,lFk:10,lBh:-4,lBk:-20},
        {rot:-38,lean:-10,head:-14,hx:2,lift:20,plant:0,mouth:2,brow:2,blink:1,aFs:150,aFe:170,bA:200,aBs:170,aBe:200,lFh:50,lFk:30,lBh:30,lBk:10},
        {rot:-72,lean:-4,head:-10,hx:12,lift:12,plant:0,mouth:2,brow:2,blink:1,aFs:160,aFe:190,bA:220,aBs:180,aBe:210,lFh:40,lFk:40,lBh:20,lBk:20},
        {rot:-90,lean:0,head:-14,hx:22,plant:0,mouth:2,brow:2,blink:1,aFs:140,aFe:160,bA:190,aBs:170,aBe:200,lFh:30,lFk:40,lBh:14,lBk:24},
        {rot:-86,lean:-2,head:-6,hx:23,lift:4,plant:0,mouth:1,brow:2,blink:1,aFs:150,aFe:180,bA:200,aBs:176,aBe:210,lFh:24,lFk:30,lBh:10,lBk:16},
        {rot:-90,lean:0,head:-2,hx:24,plant:0,mouth:1,brow:2,blink:1,aFs:150,aFe:170,bA:150,aBs:180,aBe:200,lFh:16,lFk:16,lBh:8,lBk:6},
        {rot:-90,lean:0,head:0,hx:24,plant:0,mouth:0,brow:2,blink:1,aFs:146,aFe:166,bA:140,aBs:176,aBe:196,lFh:14,lFk:12,lBh:6,lBk:4}][i])},
      getup:{nome:'Levantar',n:6,dur:i=>[140,130,130,120,110,120][i],pose:i=>K_([
        {rot:-90,hx:24,head:4,plant:0,brow:2,blink:1,aFs:146,aFe:166,bA:140,aBs:176,aBe:196,lFh:14,lFk:12,lBh:6,lBk:4},
        {lean:32,head:-6,hx:16,plant:0,brow:2,mouth:1,lFh:84,lFk:92,lBh:70,lBk:110,aFs:30,aFe:70,bA:100,aBs:-50,aBe:-30},
        {lean:24,head:-4,hx:10,brow:1,mouth:1,lFh:90,lFk:-14,lBh:6,lBk:-96,aFs:40,aFe:80,bA:110,aBs:20,aBe:50},
        {lean:20,head:-4,hx:6,brow:1,lFh:54,lFk:-8,lBh:-28,lBk:-62,aFs:30,aFe:80,bA:120,aBs:30,aBe:80},
        Object.assign({},GUARD,{lean:10,hx:2,aFs:30,aFe:80,bat:46,two:0}),
        Object.assign({},GUARD)][i])},
      victory:{nome:'Vitória',n:8,dur:i=>[140,90,90,90,120,160,200,400][i],pose:i=>{
        const top={aFs:166,aFe:176,bA:178};
        return K_([
          Object.assign({},GUARD,{lean:2,mouth:3,brow:3,two:0}),
          {lFh:18,lFk:2,lBh:-16,lBk:-18,lean:-2,aFs:60,aFe:120,bA:200,aBs:-20,aBe:20,mouth:3,brow:3},
          {lFh:18,lFk:2,lBh:-16,lBk:-18,lean:-4,aFs:100,aFe:150,bA:300,aBs:-20,aBe:20,mouth:3,brow:3,smear:1,sa:40},
          {lFh:18,lFk:2,lBh:-16,lBk:-18,lean:-6,aFs:130,aFe:170,bA:400,aBs:-20,aBe:20,mouth:3,brow:3},
          Object.assign({lFh:22,lFk:4,lBh:-20,lBk:-22,lean:-8,head:-10,aBs:-30,aBe:40,mouth:2,brow:3,lift:3,plant:0},top),
          Object.assign({lFh:22,lFk:4,lBh:-20,lBk:-22,lean:-8,head:-12,aBs:-30,aBe:40,mouth:2,brow:3},top),
          Object.assign({lFh:22,lFk:4,lBh:-20,lBk:-22,lean:-6,head:-8,aBs:-34,aBe:44,mouth:3,brow:3},top),
          Object.assign({lFh:22,lFk:4,lBh:-20,lBk:-22,lean:-6,head:-6,aBs:-34,aBe:44,mouth:3,brow:3},top)][i]); }},
    };
    const H_={K_,G,GUARD,ST,S,th,sh,REST};
    ANIMS.special=Object.assign({nome:cfg.specialName||'Especial'},cfg.special(H_));
    Object.assign(ANIMS,STRIKES.tool(G,Object.assign({two:!!cfg.twoGuard,slow:cfg.comboSlow||1},cfg.strikes||{})));
    // kit de beat 'em up (dash, pulo, mergulho, lançador, juggle, agarrão/arremesso, giro em área, reações, provocação)
    // + golpes assinatura do ofício (cfg.sigs: [[nome da anim, id do catálogo MOVESET.SIG, nome, extras]])
    Object.assign(ANIMS,MOVESET.kit(G,{two:!!cfg.twoGuard,slow:cfg.comboSlow||1,names:(cfg.moves||{}).names}),cfg.sigs?MOVESET.sigs(G,{two:!!cfg.twoGuard,slow:cfg.comboSlow||1},cfg.sigs):{});
    if(cfg.anims) cfg.anims(ANIMS,H_);
    function poseOf(anim,i){ return Object.assign({},REST,ANIMS[anim].pose(i)); }

    /* ---------------- esqueleto ---------------- */
    function skeleton(P,TL){
      const {L1,L2,U,E}=B, ro=P.rot||0, br=P.br||0, r=rad(ro), cr=Math.cos(r), sr=Math.sin(r);
      const hip={x:AX+P.hx,y:80};
      const R=(lx,ly)=>({x:hip.x+lx*cr-ly*sr,y:hip.y+lx*sr+ly*cr});
      const hipF=R(B.hipF,0.6), hipB=R(B.hipB,0);
      const kneeF=lp(hipF,P.lFh-ro,L1), ankleF=lp(kneeF,P.lFk-ro,L2), kneeB=lp(hipB,P.lBh-ro,L1), ankleB=lp(kneeB,P.lBk-ro,L2);
      const a=rad(P.lean+ro), co=Math.cos(a), s=Math.sin(a);
      const T=(lx,ly)=>({x:hip.x+lx*co-ly*s, y:hip.y+lx*s+ly*co});
      const tw=P.tw||0, ty=B.tsy/1.1, neck=T(1,(-34-br*0.8)*ty), shF=T(B.shF*(1-tw)-1.5*tw,(-29.8-br*0.8)*ty), shB=T(B.shB*(1-tw)+7*tw,(-30.2-br*0.8)*ty);
      const ha=rad(P.lean+ro+P.head), hc=Math.cos(ha), hs=Math.sin(ha);
      const H=(lx,ly)=>({x:neck.x+lx*hc-ly*hs, y:neck.y+lx*hs+ly*hc});
      const elF=lp(shF,P.aFs-ro,U), wrF=lp(elF,P.aFe-ro,E);
      let elB=lp(shB,P.aBs-ro,U), wrB=lp(elB,P.aBe-ro,E);
      const bAng=P.aFe+P.bat-ro, bDir=Math.atan2(Math.cos(rad(bAng)),Math.sin(rad(bAng)));
      if(P.two>=0.5 && TL && TL.twoHand){ const d=TL.grip2||8; const q=ik(shB,{x:wrF.x+Math.cos(bDir)*d,y:wrF.y+Math.sin(bDir)*d},U,E,true); elB=q.E; wrB=q.W; }
      if(P.backTarget){ const q=ik(shB,T(P.backTarget[0],P.backTarget[1]),U,E,true); elB=q.E; wrB=q.W; }
      const FT=B.foot, cont=[[ankleF,FT],[ankleB,FT],[kneeF,6],[kneeB,6],[hip,7],[T(-13,-6),2],[T(-15,-24),2],[T(14,-24),2],[T(0,-33),3],[H(2.9,-16.4),11.8],[wrF,5.4],[wrB,5.4]];
      let low=-1e9; cont.forEach(([q,rr])=>{ low=Math.max(low,q.y+rr); });
      const dy=GROUND-low-(P.lift||0);
      [hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,neck,shF,shB,elF,wrF,elB,wrB].forEach(q=>q.y+=dy);
      const sk={hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,neck,shF,shB,elF,wrF,elB,wrB,a,ha,H,T,bDir,ro,tw,br,L1,L2};
      if(P.plant && !P.lift && Math.abs(ro)<10){
        [['kneeF','ankleF','hipF'],['kneeB','ankleB','hipB']].forEach(([kn,an,hp])=>{
          const gap=GROUND-(sk[an].y+FT); if(gap>0.05 && gap<4.5){ const A={x:sk[an].x,y:sk[an].y+gap}; const k=legIK(sk[hp],A,L1,L2); sk[kn].x=k.x; sk[kn].y=k.y; sk[an].x=A.x; sk[an].y=A.y; }
        });
      }
      return sk;
    }

    /* ---------------- corpo ---------------- */
    function fist(p,M,el,wr,glove){
      const R=glove?M[glove]:M.skin, X=glove?M[glove+'X']:M.skinX;
      const ang=Math.atan2(wr.y-el.y,wr.x-el.x), s=B.fist; p.xf(ang,wr.x,wr.y);
      p.F(R[1]); p.ell(2*s,0.2,4.5*s,4.2*s);
      p.F(X[2]); p.poly([[-0.6*s,1*s],[6*s,0.6*s],[5.4*s,3.6*s],[1.2*s,4.2*s]]);
      p.F(R[2]); p.poly([[0,2.4*s],[5.6*s,1.8*s],[5*s,3.8*s],[1.2*s,4*s]]); p.rect(3.4*s,-2.6*s,0.9,4.6*s); p.rect(5*s,-2*s,0.8,3.4*s);
      p.F(R[3]); p.rect(1.6*s,3.4*s,3*s,0.8);
      p.F(R[0]); p.rect(1.6*s,-3.6*s,3.4*s,1.1); p.F(X[0]); p.rect(2.4*s,-3.6*s,1.4*s,0.9);
      p.F(R[1]); p.ell(0.4*s,-3.4*s,2.2*s,1.5*s); p.F(R[2]); p.rect(-0.8*s,-2.6*s,2.6*s,0.8);
      p.id();
    }
    function drawArm(p,M,sh,el,wr,front,P){
      p.id(); const A=cfg.arm||{}, wU=B.wU, wE=B.wE, wW=B.wW, top=A.sleeve||'top', R=M[top], X=M[top+'X'];
      vol(p,el,wr,wE,wW,M.skin,M.skinX,{l0:0.05,l1:0.6,h0:0.1,h1:0.4});
      const fb=lerp(el,wr,0.28), fo=sideOff(el,wr,wE*0.12,-1); p.F(M.skinX[1]); p.ell(fb.x+fo.x,fb.y+fo.y,wE*0.36,wE*0.3);
      if(A.hairy){ p.F(M.hair[2]); [0.35,0.55].forEach(t=>{ const q=lerp(el,wr,t); p.rect(q.x-1,q.y-0.4,1.2,0.8); }); }
      vol(p,sh,el,wU,wE,M.skin,M.skinX,{l0:0.1,l1:0.85,h0:0.3,h1:0.65});
      const d=lerp(sh,el,0.12), od=sideOff(sh,el,wU*0.16,-1); p.F(M.skin[0]); p.ell(d.x+od.x,d.y+od.y,wU*0.3,wU*0.24); p.F(M.skinX[0]); p.ell(d.x+od.x*1.4,d.y+od.y*1.4-0.4,wU*0.12,wU*0.1);
      const dl=lerp(sh,el,0.34), o2=sideOff(sh,el,wU*0.1,1); p.F(M.skin[2]); p.cap({x:dl.x+o2.x-1.6,y:dl.y+o2.y},{x:dl.x+o2.x+1.6,y:dl.y+o2.y+0.6},1,1);
      const st=A.style||'short';
      if(st==='short'){ const e=lerp(sh,el,A.to||0.55);
        vol(p,sh,e,wU+3.4,wU+2.4,R,X,{l0:0.01,l1:0.7,h0:0.1,h1:0.45});
        p.F(R[2]); p.cap(lerp(sh,el,(A.to||0.55)-0.08),e,wU+2.6,wU+2.4); p.F(R[3]); p.cap(lerp(sh,el,(A.to||0.55)-0.02),e,wU+2.4,wU+2.4);
        const f2=lerp(sh,e,0.5); p.F(R[2]); p.cap({x:f2.x-1.5,y:f2.y-1},{x:f2.x+1.2,y:f2.y+1.4},0.9,0.9); }
      if(st==='cap'){ // ombro de regata / colete: só a cava
        const e=lerp(sh,el,0.2); vol(p,lerp(sh,el,-0.12),e,wU+3,wU+2,R,X,{l0:0.01,l1:0.7}); }
      if(st==='rolled'){ // manga dobrada acima do cotovelo, com rolo grosso
        const e=lerp(sh,el,A.to||0.78);
        vol(p,sh,e,wU+2.6,wE+2.4,R,X,{l0:0.02,l1:0.75,h0:0.1,h1:0.45});
        const r0=lerp(sh,el,(A.to||0.78)-0.12), r1=lerp(sh,el,(A.to||0.78)+0.04);
        vol(p,r0,r1,wE+3.4,wE+3.2,R,X,{l0:0.1,l1:0.9,h0:0.2,h1:0.8}); p.F(R[3]); p.cap(lerp(r0,r1,0.92),r1,wE+3,wE+3); p.F(X[2]); p.cap(lerp(r0,r1,0.4),lerp(r0,r1,0.5),wE+2.4,wE+2.4);
        const f2=lerp(sh,e,0.45); p.F(R[2]); p.cap({x:f2.x-1.6,y:f2.y-1},{x:f2.x+1.4,y:f2.y+1.4},0.9,0.9); }
      if(st==='long'){ const cf=lerp(el,wr,0.7), cf2=lerp(el,wr,0.84);
        vol(p,el,cf,wE+3.4,wW+3,R,X,{l0:0.01,l1:0.7}); vol(p,sh,el,wU+3.6,wE+3.4,R,X,{l0:0.05,l1:0.8});
        p.F(R[2]); p.cap(cf,cf2,wW+2.6,wW+2.4); p.F(R[3]); p.cap(lerp(cf,cf2,0.7),cf2,wW+2.4,wW+2.4); p.F(X[1]); p.cap(cf,lerp(cf,cf2,0.25),wW+1,wW+1);
        p.F(R[2]); const e1=lerp(sh,el,0.86), e2=lerp(el,wr,0.14); p.cap(e1,lerp(e1,e2,0.5),1.1,0.9); p.cap(lerp(e1,e2,0.4),e2,0.9,0.9); }
      if(A.glove){ const g0=lerp(el,wr,A.gloveFrom||0.58), GR=M[A.glove], GX=M[A.glove+'X'];
        vol(p,g0,wr,wW+(A.cuff||3),wW+1.2,GR,GX,{l0:0.05,l1:0.8}); p.F(GR[0]); p.cap(g0,lerp(g0,wr,0.15),wW+(A.cuff||3)+0.4,wW+(A.cuff||3)); p.F(GR[2]); p.cap(lerp(g0,wr,0.15),lerp(g0,wr,0.22),wW+(A.cuff||3)-0.2,wW+(A.cuff||3)-0.4); }
      if(A.extra) A.extra(p,M,sh,el,wr,front,P,{vol,band,sideOff,wU,wE,wW});
      fist(p,M,el,wr,A.glove);
    }
    function drawBoot(p,M,a,ang,L){
      const BR=M[L.boot||'boot'], BX=M[(L.boot||'boot')+'X'], SO=M[L.sole||'sole'];
      xfs(p.cx,ang,a.x,a.y,B.shoe,B.shoe);
      p.F(BR[1]); p.poly([[-5.4,-7],[3,-7],[3.6,-2],[6,-0.6],[11,0.6],[12.8,3],[12.6,4.6],[-6,4.6],[-6.2,-2]]);
      p.F(BX[2]); p.poly([[-6.2,-2],[-5.4,-7],[0,-7],[-0.6,4.6],[-6,4.6]]);
      p.F(BR[2]); p.poly([[-6.2,-2],[-5.4,-7],[-3,-7],[-3.6,4.6],[-6,4.6]]); p.F(BR[3]); p.rect(-6.2,0,1.4,4.6);
      p.F(BR[0]); p.poly([[7.6,0.2],[11,0.6],[12.8,3],[12.4,3.4],[8,2]]); p.rect(-4,-7,6,1); p.F(BX[0]); p.rect(9.6,0.8,1.6,0.8);
      p.F(BR[3]); p.rect(-5.4,-4,8.6,0.8);
      if(L.toe){ const TR=M[L.toe]; p.F(TR[1]); p.poly([[7,-0.2],[11,0.6],[12.8,3],[12.6,4],[7,4]]); p.F(TR[0]); p.rect(8.4,0.4,2.6,0.8); p.F(TR[2]); p.rect(7,3,5.6,1); }
      if(L.lace){ p.F(M[L.lace][1]); [[-1,-5.4],[0.4,-3.4],[2,-1.6]].forEach(([x,y])=>p.rect(x,y,1.8,0.8)); }
      p.F(SO[1]); p.poly([[-6.6,3.6],[13,3.6],[13.4,5.2],[12.4,6.2],[-6.6,6.2]]); p.F(SO[2]); p.rect(-6.6,5.3,19,0.9); for(let x=-5;x<12;x+=2.6) p.rect(x,5.2,1.2,1);
      if(L.mud){ p.F(M[L.mud][1]); p.rect(-4,2.4,3,1.2); p.rect(6,2,2,1); }
      p.id();
    }
    function drawChinelo(p,M,a,ang,L){
      const SO=M[L.sole||'sole'], ST=M[L.strap||'strap'];
      xfs(p.cx,ang,a.x,a.y,B.shoe,B.shoe);
      // pé à mostra
      p.F(M.skin[1]); p.poly([[-4.6,-4],[2,-4.2],[5,-1.4],[10.4,0.6],[12.4,2.8],[12.2,4.2],[-5.4,4.2],[-5.6,-0.4]]);
      p.F(M.skinX[2]); p.poly([[-5.6,-0.4],[-4.6,-4],[-1,-4],[-1.6,4.2],[-5.4,4.2]]); p.F(M.skin[2]); p.poly([[-5.6,-0.4],[-4.6,-4],[-3,-4],[-3.4,4.2],[-5.4,4.2]]);
      p.F(M.skin[0]); p.poly([[2,-3.6],[5,-1.4],[9,0],[5.4,0.2]]); p.F(M.skinX[0]); p.rect(9.4,1,1.4,0.8);
      p.F(M.skin[2]); [8.4,10.2].forEach(x=>p.rect(x,2.4,0.7,1.8)); p.F(M.skin[3]); p.rect(11.4,3.4,0.9,0.8);
      // solado fino de borracha
      p.F(SO[1]); p.poly([[-6.2,4],[13,4],[13.4,5.2],[12.6,6.2],[-6.2,6.2]]); p.F(SO[0]); p.rect(-5.4,4,17,0.8); p.F(SO[2]); p.rect(-6.2,5.4,19,0.8);
      // tira em V
      p.F(ST[1]); p.poly([[6.4,1.8],[7.6,1.4],[3,4.2],[1.4,4.2]]); p.poly([[6.4,1.8],[7.6,1.4],[9.6,4.2],[8.2,4.2]]); p.F(ST[0]); p.rect(6.4,1.4,1.2,0.8);
      p.id();
    }
    function footAng(sk,front,P){
      const an=front?sk.ankleF:sk.ankleB, gap=GROUND-(an.y+B.foot), k=(front?P.lFk:P.lBk);
      let t=0; if(gap>1.2){ if(k<-12) t=Math.min(38,(-k-12)*0.7); else if(k>50) t=-Math.min(30,(k-50)*0.5); }
      return rad(sk.ro+t);
    }
    function drawLeg(p,M,sk,front,P){
      p.id(); const L=cfg.leg||{}, hip=front?sk.hipF:sk.hipB, knee=front?sk.kneeF:sk.kneeB, ankle=front?sk.ankleF:sk.ankleB;
      const wT=B.wT, wK=B.wK, wA=B.wA, PR=M[L.pants||'pants'], PX=M[(L.pants||'pants')+'X'];
      const calf=(R)=>{ const q=lerp(knee,ankle,0.3), o=sideOff(knee,ankle,wK*0.18,1); p.F(R[1]); p.ell(q.x+o.x,q.y+o.y,wK*0.5,wK*0.62,Math.atan2(ankle.y-knee.y,ankle.x-knee.x)); };
      if(L.style==='bermuda'){
        calf(M.skin); vol(p,knee,ankle,wK-1,wA-0.6,M.skin,M.skinX,{l0:0.1,l1:0.6,h0:0.15,h1:0.4});
        const cq=lerp(knee,ankle,0.32), co=sideOff(knee,ankle,wK*0.3,1); p.F(M.skin[2]); p.ell(cq.x+co.x,cq.y+co.y,wK*0.24,wK*0.4);
        const hm=lerp(hip,knee,L.hem||1.08);
        vol(p,hip,hm,wT+1.2,wK+2,PR,PX,{l0:0.05,l1:0.75});
        p.F(PR[2]); p.cap(lerp(hip,hm,0.88),hm,wK+1.8,wK+2); p.F(PR[3]); p.cap(lerp(hip,hm,0.96),hm,wK+1.8,wK+2);
        if(L.fray){ p.F(PR[0]); [[-3,0],[0,1],[3,0]].forEach(([x,y])=>p.rect(hm.x+x,hm.y+wK*0.4+y,0.8,1.6)); }
      } else {
        calf(PR);
        vol(p,knee,ankle,wK,wA+1,PR,PX,{l0:0.05,l1:0.6,h0:0.1,h1:0.35}); vol(p,hip,knee,wT,wK,PR,PX,{l0:0.05,l1:0.85,h0:0.2,h1:0.6});
        const kk=knee, kb=sideOff(hip,knee,wK*0.2,1);
        p.F(PR[2]); p.poly([[kk.x-4,kk.y-3],[kk.x+3,kk.y-1.2],[kk.x+3.4,kk.y],[kk.x-3.6,kk.y-1.4]]); p.poly([[kk.x-3.4+kb.x,kk.y+1.6+kb.y],[kk.x+3.2,kk.y+2.4],[kk.x+2.4,kk.y+3.4],[kk.x-3.6+kb.x,kk.y+3+kb.y]]);
        p.F(PX[1]); p.poly([[kk.x-2,kk.y-1.2],[kk.x+3.4,kk.y],[kk.x+3,kk.y+1],[kk.x-2,kk.y+0.4]]);
        const t1=lerp(hip,knee,0.45), tb=sideOff(hip,knee,wT*0.1,1); p.F(PR[2]); p.cap({x:t1.x+tb.x-3,y:t1.y+tb.y-1.6},{x:t1.x+tb.x+2.6,y:t1.y+tb.y+1.2},1.2,0.8);
        [0.8,0.88].forEach(t=>{ const q=lerp(knee,ankle,t); p.F(PR[2]); p.cap({x:q.x-wA*0.55,y:q.y-0.8},{x:q.x+wA*0.5,y:q.y+0.6},1,1); });
        if(front){ p.F(PX[0]); p.cap(lerp(hip,knee,0.25),lerp(hip,knee,0.7),0.7,0.7); }
        if(front && L.pocket){ const q=lerp(hip,knee,0.5), ang=Math.atan2(knee.y-hip.y,knee.x-hip.x); p.xf(ang,q.x,q.y);
          p.F(PR[3]); p.rect(-5,-0.6,10,7); p.F(PR[1]); p.rect(-4.4,0,8.8,5.8); p.F(PX[1]); p.rect(-4.4,0,8.8,1.6); p.F(PR[0]); p.rect(-5,-1.8,10,1.6); p.F(M.metal[2]); p.rect(-0.6,-0.6,1.2,1); p.id(); }
      }
      if(front && L.patch){ const PA=M[L.patch]; p.F(PA[1]); p.ell(knee.x+0.8,knee.y,4.4,3.8); p.F(PA[0]); p.ell(knee.x+1.8,knee.y-1.2,2,1.4); p.F(PA[3]); [[-3,-3],[2.8,-2.6],[3,2.4],[-2.8,2.6]].forEach(([x,y])=>p.rect(knee.x+0.8+x,knee.y+y,0.8,0.8)); }
      if(L.extra) L.extra(p,M,hip,knee,ankle,front,{vol,sideOff,wT,wK,wA});
      if(L.shoe==='chinelo') drawChinelo(p,M,ankle,footAng(sk,front,P),L); else drawBoot(p,M,ankle,footAng(sk,front,P),L);
    }
    const TMALE=[[-9.4,3],[9.4,3],[9.6,-3],[8.6,-9],[10.6,-15],[12.4,-21],[12.6,-25.4],[10.4,-29.4],[4.6,-32.2],[-3.6,-32.2],[-10.4,-29.8],[-12.8,-25.6],[-12.4,-20],[-10.2,-14],[-9,-8],[-10,-2]];
    const TFEM=[[-9.6,3],[9.4,3],[9.6,-3],[7.8,-9],[8.4,-13.4],[10.6,-18],[10.8,-23],[9,-27.6],[3.8,-30.8],[-3,-30.8],[-8.6,-28.4],[-10.4,-24.4],[-9.6,-19],[-7.8,-13],[-8.2,-8],[-9.8,-2]];
    function torsoXf(p,sk){ xfs(p.cx,sk.a,sk.hip.x,sk.hip.y,B.tsx-(B.f?0.08:0.26)*Math.max(0,sk.tw),B.tsy*(1+0.025*(sk.br||0))); }
    function drawTorso(p,M,sk,P){
      const f=B.f; torsoXf(p,sk);
      const body=f?TFEM:TMALE, nk=f?[[-2.6,-31],[4.4,-31],[3.4,-28],[-1.8,-28]]:[[-3.2,-32.4],[5,-32.4],[3.8,-29],[-2.2,-29]];
      const top=cfg.top||'top', R=M[top], X=M[top+'X'];
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
      if(cfg.pattern) clip(p,body,()=>cfg.pattern(p,M,sk,P,{R,X,f}));
      p.F(M.skin[1]); p.poly(nk); p.F(M.skin[2]); p.rect(nk[0][0]+0.6,nk[0][1],2.4,3); p.F(M.skin[3]); p.rect(nk[0][0]+0.6,nk[0][1]+2.2,4,0.8);
      p.F(R[2]); p.poly([[-5,-25],[2,-19],[1.4,-17.6],[-5.6,-23.2]]); p.poly([[5,-11],[9.6,-6],[8.4,-5],[4.2,-9.6]]); p.poly([[-4,-8],[3,-6],[2.6,-4.6],[-4.2,-6.6]]); p.poly([[2,-13],[8,-11.6],[7.6,-10.4],[1.8,-11.6]]);
      p.F(X[1]); p.poly([[-4.4,-23.8],[1.8,-18.4],[2.4,-19.2],[-3.8,-25]]); p.poly([[-3.8,-8.6],[2.8,-6.6],[3.2,-7.4],[-3.4,-9.4]]);
      if(f){ p.F(R[1]); p.poly([[3.6,-19.6],[9.6,-19.4],[9,-17.6],[4,-17.8]]); }
      p.F(R[2]); p.poly(f?[[-3.2,-31.2],[5,-31.2],[4,-27.4],[-2.2,-27.4],[-1.8,-28.4],[3.2,-28.4],[3.8,-30.2],[-2.4,-30.2]]
                            :[[-3.8,-32.8],[5.6,-32.8],[4.4,-28.4],[-2.6,-28.4],[-2.2,-29.4],[3.6,-29.4],[4.4,-31.4],[-3,-31.4]]);
      p.F(X[1]); p.rect(0,f?-31.2:-32.8,4.4,0.8);
      p.F(R[2]); p.rect(-9.8,-3.8,19.4,1.4); p.F(R[3]); p.rect(-9.8,-2.6,6,1);
      // calça: cós, cinto, fivela
      const L=cfg.leg||{}, PR=M[L.pants||'pants'], PX=M[(L.pants||'pants')+'X'];
      p.F(PR[1]); p.poly([[-10.6,-2],[10.2,-2],[10.6,4.4],[-10.8,4.4]]); p.F(PX[2]); p.poly([[-10.6,-2],[-2,-2],[-1.6,4.4],[-10.8,4.4]]); p.F(PR[2]); p.poly([[-10.6,-2],[-5.6,-2],[-5,4.4],[-10.8,4.4]]); p.rect(4,0,0.8,4.4);
      if(!cfg.noBelt){ const BL=M[cfg.belt||'belt'];
        p.F(BL[1]); p.poly([[-10.8,-3],[10.4,-3],[10.6,-0.4],[-11,-0.4]]); p.F(BL[2]); p.rect(-10.8,-3,6,2.6); p.F(BL[0]); p.rect(-4,-3,13,0.7); p.F(BL[3]); p.rect(-10.8,-0.9,21.4,0.6);
        p.F(PR[2]); [-8,0.6].forEach(x=>p.rect(x,-3.4,1.2,3.6));
        p.F(M.buckle[1]); p.rect(5,-3.6,3.6,3.6); p.F(BL[2]); p.rect(6,-2.6,1.6,1.6); p.F(M.buckle[0]); p.rect(5,-3.6,3.6,0.8); }
      if(cfg.torso) cfg.torso(p,M,sk,P,{R,X,f,body,clip:(pts,fn)=>clip(p,pts,fn)});
      p.id();
    }
    function drawHead(p,M,sk,P){
      const f=B.f, Hc=cfg.head||{}; xfs(p.cx,sk.ha,sk.neck.x,sk.neck.y,B.head,B.head);
      p.F(M.skin[1]); p.cap(P2(0.4,4),P2(1.2,-6),B.neck,B.neck-0.8);
      p.F(M.skin[2]); p.poly([[-3.8,3],[-3,-6],[-0.6,-6],[-1,3]]); p.poly([[0,-4.6],[8.4,-2.6],[7,-0.8],[0.4,-1.8]]);
      p.F(M.skin[1]); p.ell(2.6,-14.6,10.2,10.4);
      p.poly(f?[[-3,-9],[10.4,-10.4],[12.2,-6.6],[10.6,-2.8],[6.8,-0.6],[1.6,-0.6]]:[[-3,-9],[10.6,-10.4],[12.8,-6],[11.8,-2.2],[8,0.6],[1.4,0.6]]);
      p.F(M.skin[2]); p.poly([[-3.4,-9.4],[1.6,-8.6],[2.8,-3],[1.6,0.4],[-1.8,-2]]); p.poly([[-7.6,-12],[-5.6,-17],[-4,-13],[-5,-8]]);
      p.F(M.skin[0]); p.poly([[6,-23],[10,-21.6],[11.4,-18.6],[8,-20]]); p.ell(9,-9.2,1.8,1);
      p.F(M.skin[1]); p.ell(-3.4,-12.4,2.6,3.6); p.F(M.skin[2]); p.ell(-3.1,-12.2,1.3,2.3); p.F(M.skin[3]); p.rect(-3.4,-12.8,0.8,1.8);
      if(Hc.beard) Hc.beard(p,M,P);
      const sq=P.brow===2&&P.mouth===2;
      if(P.blink>=0.5||sq){ p.F(M.skin[3]); if(sq) p.poly([[4.6,-14.6],[9.4,-13.6],[9.4,-12.6],[4.6,-12.8]]); else p.rect(4.4,-13.4,5,1); p.rect(10.8,-13.6,1.8,0.9); }
      else {
        p.F(M.eye[1]); p.ell(6.9,-13.3,2.7,2.2); p.F(M.eye[2]); p.rect(4.6,-12,4.8,0.9);
        p.F(M.iris[1]); p.rect(7.1,-14.8,2.2,3); p.F(M.iris[3]); p.rect(7.8,-14.2,1.1,1.8); p.F(M.eye[0]); p.rect(7.2,-14.8,0.9,0.9);
        p.F(M.skin[3]); p.poly([[4,-15.4],[9.8,-15.8],[9.8,-14.8],[4.4,-14.6]]);
        if(f){ p.rect(9.4,-16.4,1.4,1); p.rect(3.6,-15.2,1,0.9); }
        p.F(M.skin[2]); p.rect(4.4,-11,4.6,0.8);
        p.F(M.eye[1]); p.ell(11.7,-13.4,1.1,1.8); p.F(M.iris[1]); p.rect(11.5,-14.6,1.1,2); p.F(M.skin[3]); p.rect(10.7,-15.6,2.4,0.8);
      }
      const b=P.brow|0, thk=Hc.brow||(f?1.4:2);
      const yo=b===1?-18.4:b===2?-17.2:b===3?-18.6:-17.8, yi=b===1?-16.2:b===2?-19:b===3?-18:-17.4;
      p.F(M.hair[2]); p.poly([[3.6,yo],[10.4,yi],[10.4,yi+thk],[3.6,yo+thk]]); p.poly([[11,yi+(b===1?0.2:0)],[13.2,yi+(b===1?-0.8:0.4)],[13.2,yi+thk],[11,yi+thk]]);
      p.F(M.skin[1]); p.poly([[10.2,-14.8],[14.4,-9.6],[13.8,-8.4],[10.4,-8.6]]);
      p.F(M.skin[2]); p.rect(10.4,-9.2,3.6,1); p.F(M.skin[3]); p.rect(11.6,-9.2,1.2,0.8); p.F(M.skin[0]); p.rect(11.4,-13.2,0.9,2.6);
      if(Hc.nose) Hc.nose(p,M,P);
      const m=P.mouth|0;
      if(m===2){ p.F(M.mouth[2]); p.poly([[7.2,-7.6],[12.8,-7.8],[12.2,-2.2],[7.8,-2.4]]); p.F(M.teeth[1]); p.rect(7.6,-7.6,4.8,1.3); p.F(M.mouth[0]); p.ell(10,-3.2,1.9,0.9); }
      else if(m===1){ p.F(M.mouth[1]); p.rect(7.2,-7.6,5.6,3.4); p.F(M.teeth[1]); p.rect(7.6,-7.2,4.8,2.6); p.F(M.teeth[2]); p.rect(7.6,-5.9,4.8,0.6); p.rect(9.6,-7.2,0.6,2.6); }
      else if(m===3){ p.F(M.mouth[2]); p.poly([[7,-6.8],[12.8,-7.6],[11.6,-4.2],[8.2,-4.4]]); p.F(M.teeth[1]); p.rect(7.6,-6.8,4.8,1.3); p.F(M.skin[2]); p.rect(6,-7.8,1,1.6); }
      else { p.F(f?M.mouth[0]:M.mouth[2]); p.rect(7.8,-6,4.4,f?1.4:1); p.F(M.skin[2]); p.rect(8.4,-4.6,3,0.8); }
      if(Hc.stache) Hc.stache(p,M,P);
      if(Hc.hair) Hc.hair(p,M,P,{dome});
      if(Hc.hat) Hc.hat(p,M,P,{dome});
      p.id();
    }
    function drawHairBack(p,M,sk,P){ const Hc=cfg.head||{}; if(!Hc.back) return; xfs(p.cx,sk.ha,sk.neck.x,sk.neck.y,B.head,B.head); Hc.back(p,M,P,{dome}); p.id(); }
    function drawSmear(p,M,sk,P,len){
      p.id(); const tip=lp(sk.wrF,P.aFe+P.bat-sk.ro,len+2), sh=sk.shF;
      const cur=Math.atan2(tip.x-sh.x,tip.y-sh.y)*180/Math.PI, r1=Math.hypot(tip.x-sh.x,tip.y-sh.y)+3, sa=P.sa;
      const wide=P.smear>=3?22:15, n=14;
      const bd=(rr0,rr1,col)=>{ const pts=[]; for(let k=0;k<=n;k++){ const a=sa+(cur-sa)*k/n; pts.push([sh.x+Math.sin(rad(a))*rr1, sh.y+Math.cos(rad(a))*rr1]); }
        for(let k=n;k>=0;k--){ const a=sa+(cur-sa)*k/n, t=k/n, rr=rr1-(rr1-rr0)*t*t; pts.push([sh.x+Math.sin(rad(a))*rr, sh.y+Math.cos(rad(a))*rr]); } p.F(col); p.poly(pts); };
      bd(r1-wide,r1+1.6,M.trail[1]); bd(r1-wide+3,r1,M.smear[1]); bd(r1-5,r1-0.6,M.smear[0]);
    }

    /* ---------------- materiais ---------------- */
    const mcache={};
    function mats(skin){
      if(mcache[skin]) return mcache[skin];
      const hex=(SK_[skin]||SK_.media).hex, M=Object.assign({},BASEM,{skin:R4(hex,1.15),skinX:RX(hex,1.15)});
      const src=cfg.mats(skin);
      Object.entries(src).forEach(([k,v])=>{ if(typeof v==='string'){ M[k]=R4(v); M[k+'X']=RX(v); } else M[k]=v; });
      if(!M.hair){ M.hair=R4('#2a1c14'); M.hairX=RX('#2a1c14'); }
      M.trail=ramp(cfg.trail||'#e8d8a0');
      return (mcache[skin]=M);
    }
    const cache=PIX.cache();
    function frame(skin,tool,anim,fi,step=5){
      if(!ANIMS[anim]) anim='idle';
      const K=PIX.getK(), t=tool||cfg.toolFor(anim), key=skin+'|'+t+'|'+anim+'|'+fi+'|'+step+'@'+K; if(cache.has(key)) return cache.get(key);
      if(cache.size>700) cache.delete(cache.keys().next().value);
      const P=poseOf(anim,fi); P.tool=t; const TL=cfg.tools[t], M=mats(skin), sk=skeleton(P,TL);
      const pen=(c,u)=>{ const p=mkPen(c,u); p.cx=c; return p; };
      const parts=[
        {back:true, draw:(c,u)=>drawArm(pen(c,u),M,sk.shB,sk.elB,sk.wrB,false,P)},
        {back:true, draw:(c,u)=>drawLeg(pen(c,u),M,sk,false,P)},
      ];
      if(cfg.behind) parts.push({draw:(c,u)=>cfg.behind(pen(c,u),M,sk,P,{torsoXf,xfs,vol,band})});
      parts.push({draw:(c,u)=>drawHairBack(pen(c,u),M,sk,P)});
      parts.push({draw:(c,u)=>drawTorso(pen(c,u),M,sk,P)});
      parts.push({draw:(c,u)=>drawLeg(pen(c,u),M,sk,true,P)});
      if(cfg.overLegs) parts.push({draw:(c,u)=>{ const p=pen(c,u); torsoXf(p,sk); cfg.overLegs(p,M,sk,P,{vol,band}); p.id(); }});
      parts.push({draw:(c,u)=>drawHead(pen(c,u),M,sk,P)});
      const toolPart={draw:(c,u)=>{ const p=pen(c,u); if(P.inhand) TL.draw(p,M,sk.wrF,sk.bDir,P); else if(cfg.toolRest) cfg.toolRest(p,M,sk,P,t); p.id(); }};
      if(P.toolBehind) parts.splice(2,0,toolPart); else parts.push(toolPart);
      if(P.smear) parts.push({noShade:true,smear:true,draw:(c,u)=>P.kick?MOVESET.kickSmear(pen(c,u),M,sk,P):drawSmear(pen(c,u),M,sk,P,TL.len)});
      parts.push({draw:(c,u)=>drawArm(pen(c,u),M,sk.shF,sk.elF,sk.wrF,true,P)});
      if(P.inhand) parts.push({draw:(c,u)=>{ const p=pen(c,u); fist(p,M,sk.elF,sk.wrF,(cfg.arm||{}).glove); if(P.two>=0.5&&TL.twoHand) fist(p,M,sk.elB,sk.wrB,(cfg.arm||{}).glove); }});
      if(cfg.front) parts.push({draw:(c,u)=>{ const p=pen(c,u); cfg.front(p,M,sk,P,{star}); p.id(); }});
      if(P.impact) parts.push({noShade:true,smear:true,draw:(c,u)=>{ const p=pen(c,u), q=P.kick?MOVESET.kickTip(sk,P):lp(sk.wrF,P.aFe+P.bat-sk.ro,TL.len); p.id(); star(p,q,P.impact>=2?16:11,M.smear[1],M.smear[0]); }});
      if(cfg.fx) parts.push({noShade:true,smear:true,draw:(c,u)=>{ const p=pen(c,u); p.id(); cfg.fx(p,M,sk,P,{star,lp,TL}); p.id(); }});
      const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM}); if(step>=4) thick(cv);
      const tip=lp(sk.wrF,P.aFe+P.bat-sk.ro,TL.len);
      const sc=q=>({x:q.x*K,y:q.y*K}); cv._tip=sc(tip); cv._hand=sc(sk.wrF); cv._handB=sc(sk.wrB); cv._head=sc(sk.H(4.5,-33.6)); cv._hip=sc(sk.hip); cv._mouth=sc(sk.H(16,-5));
      if(cfg.anchors) cfg.anchors(cv,sk,sc);
      cache.set(key,cv); return cv;
    }
    return {FW,FH,GROUND,AX,SKINS:SK_,ANIMS,poseOf,frame,mats,tools:cfg.tools,toolFor:cfg.toolFor,FX:cfg.FX||{},NAMES:cfg.NAMES||{}};
  }
  return {make,SKINS,R4,RX};
})();

/* ===== hub/serralheiro ===== */
/* SERRALHEIRO — fonte de arte (editável). Build: npm run art */
/* Serralheiro do Recife no padrão do HEROI: avental de raspa de couro com queimados, óculos de solda na testa,
   bigode, luvas de raspa, botina com biqueira de aço, marreta de duas mãos (e chave grifo no bolso do avental). */
const SERRALHEIRO=(function(){
  const {P2,lerp,lp,rad}=PIX;
  const marreta={nome:'Marreta',len:29,twoHand:true,grip2:10,draw(p,M,b,ang,P){ p.xf(ang,b.x,b.y);
    // cabo de madeira com fita isolante na pega
    p.F(M.wood[1]); p.cap(P2(-7,0),P2(26,0),4.8,4.4);
    p.F(M.woodX[2]); p.poly([[-6,0.2],[26,0.1],[26,2.2],[-6,2.4]]); p.F(M.wood[2]); p.poly([[-6,1.1],[26,0.9],[26,2.2],[-6,2.4]]); p.F(M.wood[3]); p.rect(-6,1.8,32,0.6);
    p.F(M.wood[0]); p.rect(5,-1.8,19,0.8); p.F(M.woodX[0]); p.rect(11,-1.8,5,0.7);
    p.F(M.wood[2]); [9,15,20].forEach(x=>p.rect(x,-0.6,2.4,0.6));
    p.F(M.tape[1]); p.cap(P2(-6.4,0),P2(5,0),5.6,5.6); p.F(M.tape[2]); for(let x=-5;x<5;x+=2.2) p.poly([[x,-2.8],[x+1,-2.8],[x+0.2,2.8],[x-0.8,2.8]]); p.F(M.tape[0]); p.rect(-5.6,-2.4,10,0.8);
    // cabeça de ferro (faces nos dois lados), cunha e anel de latão
    p.F(M.iron[3]); p.poly([[22.4,-10],[33.6,-10],[34.4,-9],[34.4,9],[33.6,10],[22.4,10],[21.6,9],[21.6,-9]]);
    p.F(M.iron[1]); p.poly([[22.4,-9.4],[33.6,-9.4],[33.8,4.6],[22.2,4.6]]);
    p.F(M.ironX[2]); p.rect(22.2,2.4,11.6,2.6); p.F(M.iron[2]); p.rect(22,4.2,12.2,4.8); p.F(M.iron[3]); p.rect(22,7.6,12.4,1.6);
    p.F(M.ironX[1]); p.rect(28,-9,5.4,11); p.F(M.iron[0]); p.rect(23,-9.2,10,1.3); p.rect(32.2,-8,1.2,9); p.F(M.ironX[0]); p.rect(29,-9.2,3,1);
    p.F(M.iron[2]); p.rect(22,-10,12.4,0.8); p.rect(22,9.2,12.4,0.8);
    p.F(M.iron[3]); p.rect(26.6,-6,0.8,10); p.F(M.ironX[1]); p.rect(27.4,-6,0.6,10);
    p.F(M.brass[1]); p.rect(20,-3,1.8,6); p.F(M.brass[0]); p.rect(20,-3,1.8,1); p.F(M.brass[2]); p.rect(20,1.6,1.8,1.4);
    // face de cima em brasa (bateu no ferro quente)
    p.F(M.ember[1]); p.rect(22.6,-10,11,1); p.F(M.ember[0]); p.rect(25,-10,5,0.8);
    p.id(); }};
  const grifo={nome:'Chave grifo',len:24,draw(p,M,b,ang){ p.xf(ang,b.x,b.y);
    p.F(M.red[1]); p.cap(P2(-6,0),P2(5,0),5,4.6); p.F(M.red[2]); p.rect(-6,1,11,1.4); p.F(M.red[0]); p.rect(-5,-1.8,9,0.8);
    p.F(M.steel[1]); p.cap(P2(5,0),P2(18,0),3.6,3.6); p.F(M.steel[2]); p.rect(5,0.6,13,1.2); p.F(M.steel[0]); p.rect(6,-1.2,11,0.7);
    p.F(M.steel[1]); p.poly([[17,-2],[24,-2],[24,-8],[20,-8],[20,-4.6],[17,-4.6]]); p.poly([[17,2],[25,2],[25,6],[17,6]]);
    p.F(M.steel[3]); [18.4,20,21.6,23.2].forEach(x=>p.rect(x,1.6,0.8,1)); p.F(M.steel[0]); p.rect(20.4,-8,3,0.8);
    p.F(M.brass[1]); p.ell(17.6,1,2,2); p.F(M.brass[2]); p.rect(16.6,1,2,0.8);
    p.id(); }};
  // fagulhas da marreta (especial e golpe final)
  function sparks(p,M,c,r,seed){ const n=9; for(let k=0;k<n;k++){ const a=-Math.PI*(0.08+0.84*((k*0.618+seed)%1)), L=r*(0.55+0.45*((k*0.37+seed)%1));
      const q={x:c.x+Math.cos(a)*L,y:c.y+Math.sin(a)*L}, q2={x:c.x+Math.cos(a)*(L-5),y:c.y+Math.sin(a)*(L-5)};
      p.F(k%3?M.ember[1]:M.ember[0]); p.cap(q2,q,1.4,1); p.F(M.ember[0]); p.rect(q.x-0.6,q.y-0.6,1.2,1.2); } }
  return RECRUTA_BASE.make({
    rim:'#a9c8f0', trail:'#ffb86a', twoGuard:true,
    body:{tsx:1.5,wU:14,wE:12,wW:9},
    comboName:'Combo de marteladas', strikes:{names:{atkH:'Marretada lateral',atkV:'Marretada por cima',atkS:'Socão com a cabeça da marreta',atkSpin:'Giro da marreta',atkFin:'Marretada de baixo (lança)'}}, specialName:'Especial: marretada no chão',
    sigs:[['sigFaisca','groundSlam','Marretada de faísca (atordoa)',{v:'spark'}],['sigBigorna','uppercutSlam','Bigorna (marretada pra cima)']],
    top:'top', leg:{pants:'pants',boot:'boot',sole:'sole',toe:'steel',lace:'lace',patch:'patch',pocket:1},
    arm:{style:'rolled',to:0.74,glove:'glove',gloveFrom:0.42,cuff:4,hairy:1},
    mats:()=>({
      top:'#4f6a86', pants:'#3a3e4e', patch:['#7a8a96','#56646e','#3a4450','#222a32'],
      apron:'#8e5632', stitch:['#f4dca8','#d8b47a','#9a7a50','#6a5230'], burn:['#ffb060','#2a1810','#1a0e08','#0e0604'],
      glove:'#c49a62', boot:'#55392a', sole:['#6a5a50','#3a2e26','#241c16','#120e0a'], steel:['#ffffff','#c4cad4','#7e8694','#464c58'], lace:['#e8d8b0','#b8a070','#7a6640','#4a3c22'],
      hair:'#2a1e18', lens:['#bff0c8','#3a8a5a','#1e5a3a','#0e2a1c'], brass:['#fff0b0','#d8aa48','#8a6a20','#4a380e'], strap:['#5a5a66','#26262e','#16161c','#08080a'],
      iron:['#e4e8f0','#7a7f8c','#4a4e5a','#262a34'], ironX:['#ffffff','#a0a6b4','#5a5466','#14121c'],
      wood:'#9a6a3a', tape:['#5a5a64','#202026','#121216','#060608'], red:['#ff8a6a','#c8402a','#7a1e14','#40100a'],
      soot:['#6a6a72','#3e3e48','#2a2a32','#18181e'], ember:['#fff6c0','#ffa63a','#e0501a','#8a2008'],
      rubble:['#c8bca8','#8a8070','#5a5248','#2e2a26'],
    }),
    head:{brow:2.2,
      beard:(p,M)=>{ p.F(M.hair[2]); [[1,-6],[3,-3],[5.4,-1.4],[8,-0.6],[10.6,-1.4],[2,-8.6],[11.8,-3]].forEach(([x,y])=>p.rect(x,y,1,0.9)); p.F(M.soot[1]); p.ell(1.6,-11,2,1.2); },
      stache:(p,M)=>{ p.F(M.hair[1]); p.poly([[6.4,-9],[13.6,-9.2],[14.6,-6.2],[13,-5.4],[10.4,-7],[7.6,-5.8],[6,-6.6]]); p.F(M.hair[0]); p.rect(8.6,-9,3.4,0.8); p.F(M.hair[2]); p.rect(12.6,-6.2,1.6,0.8); },
      hair:(p,M,P,{dome})=>{ p.F(M.hair[1]); p.poly(dome(2.6,-15,10.8,11,40,200,14).concat([[-6.6,-8.6],[-4.4,-10.2],[-2.4,-14],[0,-15.6],[2,-18.4],[6,-19.2],[9.6,-18.8],[12.6,-18]]));
        p.F(M.hair[2]); p.poly([[-8.2,-10],[-8.4,-14.6],[-4,-15.6],[-2.4,-14],[-4.4,-10.2],[-6.6,-8.6]]);
        p.F(M.hair[0]); p.poly([[-5,-21.8],[-2,-24],[-1,-23.2],[-4,-20.8]]); p.F(M.hairX[2]); [[-6,-17],[-3,-19.4],[-7,-13]].forEach(([x,y])=>p.rect(x,y,1.4,0.8));
        p.F(M.hair[1]); p.poly([[-0.4,-15.4],[1.2,-15.4],[1,-10.4],[-0.6,-10]]); },
      hat:(p,M,P)=>{ // óculos de solda na testa
        p.F(M.strap[1]); p.poly([[-9.6,-21.6],[-4,-23.2],[3,-23.6],[12.6,-22.4],[12.8,-20.4],[3,-21.4],[-4,-21],[-9.4,-19.4]]); p.F(M.strap[0]); p.rect(-6,-23,8,0.7);
        [[5.2,-23.2,3.6],[11.4,-22.6,2.4]].forEach(([x,y,r])=>{ p.F(M.brass[3]); p.ell(x,y,r+1.3,r+0.9); p.F(M.brass[1]); p.ell(x,y-0.2,r+0.8,r+0.4); p.F(M.brass[0]); p.ell(x-0.6,y-1.4,r*0.6,0.7);
          p.F(M.lens[2]); p.ell(x,y,r,r-0.6); p.F(M.lens[1]); p.ell(x+0.3,y+0.2,r-0.9,r-1.4); p.F(M.lens[0]); p.rect(x-r*0.5,y-r*0.5,1.2,1); });
        p.F(M.brass[2]); p.rect(8.6,-23.4,1.2,1.4); }},
    torso:(p,M,sk,P)=>{ // avental de couro (peito), alças, queimados, bolso com chave grifo
      const A=M.apron, X=M.apronX;
      p.F(A[1]); p.poly([[-4.6,-25.6],[10.6,-26.8],[12,-14],[10.6,3.6],[-7.4,3.6],[-6.6,-14]]);
      p.F(X[2]); p.poly([[-4.6,-25.6],[-0.4,-25.8],[0,-12],[-1.6,3.6],[-7.4,3.6],[-6.6,-14]]);
      p.F(A[2]); p.poly([[-4.6,-25.6],[-2.8,-25.6],[-3.4,-12],[-4.4,3.6],[-7.4,3.6],[-6.6,-14]]);
      p.F(X[1]); p.poly([[3,-26.2],[10.6,-26.8],[11.8,-17],[4.4,-16]]); p.F(A[0]); p.poly([[5,-26],[10.2,-26.4],[11,-21],[6.4,-20.4]]); p.F(X[0]); p.rect(7,-25.8,2.6,1);
      p.F(A[2]); p.poly([[0,-14],[10,-16],[10.4,-14.6],[0.4,-12.6]]); p.poly([[2,-6],[9,-4],[8.6,-3],[1.6,-4.8]]);
      p.F(M.stitch[1]); for(let y=-24;y<3;y+=2.2){ p.rect(-5.4+(y+25)*-0.06,y,0.8,1.1); p.rect(10.6+(y+25)*0.03,y,0.8,1.1); } for(let x=-3.6;x<10;x+=2.2) p.rect(x,-24.8,1.1,0.8);
      p.F(M.brass[1]); [[-4,-25],[9,-26],[-6,1.4],[9.4,1.4]].forEach(([x,y])=>{ p.rect(x,y,1.6,1.6); }); p.F(M.brass[0]); [[-4,-25],[9,-26]].forEach(([x,y])=>p.rect(x,y,0.8,0.8));
      p.F(A[1]); p.cap(P2(-3.6,-25),P2(-1.6,-33),2.4,2.2); p.cap(P2(9.6,-26),P2(6.6,-33.4),2.4,2.2); p.F(A[2]); p.rect(-3.4,-30,1,4); p.F(A[0]); p.rect(7.6,-31,1,4);
      p.F(M.burn[1]); [[2,-21],[7,-18],[4,-10],[9,-8],[-1,-6],[6,-1]].forEach(([x,y],k)=>p.ell(x,y,k%2?1.2:1.6,1)); p.F(M.burn[0]); [[2.6,-21.6],[7.4,-18.4],[4.4,-10.6]].forEach(([x,y])=>p.rect(x,y,0.8,0.7));
      // bolso + chave grifo
      p.F(A[3]); p.rect(0.6,-8.4,8.6,7); p.F(A[2]); p.rect(1,-8,7.8,6.4); p.F(X[1]); p.rect(1,-8,7.8,1.4); p.F(M.stitch[1]); p.rect(1,-6.6,7.8,0.7);
      p.F(M.steel[2]); p.poly([[2.6,-8],[4.2,-8],[4.6,-14.6],[3,-14.6]]); p.F(M.steel[1]); p.poly([[1.6,-14.6],[6,-14.6],[6,-16.6],[3.6,-17.4],[1.6,-16.6]]); p.F(M.steel[0]); p.rect(2,-16.4,2.6,0.7);
      p.F(M.red[1]); p.poly([[5.6,-8],[7.4,-8],[8,-12.4],[6.4,-12.4]]); p.F(M.red[0]); p.rect(6.4,-12.4,1,2);
      p.F(M.soot[1]); p.ell(-3,-18,1.8,1.2); p.ell(8,-12,1.4,0.9); },
    overLegs:(p,M,sk,P)=>{ // saia do avental: pendurada no quadril, gira com o corpo, barra acompanha a coxa da frente
      const A=M.apron, X=M.apronX, ro=sk.ro*Math.PI/180, ang=ro+0.3*(sk.a-ro), c=Math.cos(ang), si=Math.sin(ang), h=sk.hip;
      const loc=q=>({x:(q.x-h.x)*c+(q.y-h.y)*si, y:-(q.x-h.x)*si+(q.y-h.y)*c});
      const kF=loc(sk.kneeF), kB=loc(sk.kneeB); p.xf(ang,h.x,h.y);
      const lay=Math.abs(Math.sin(ro)), t0={x:-13+6*lay,y:0}, t1={x:16-6*lay,y:-0.6}, by=Math.min(27-6*lay,Math.max(kF.y,kB.y)+4), sw=(kF.x-kB.x)*0.14;
      const cx=kF.x*0.3+4+sw, hw=13+Math.min(3,Math.abs(kF.x-kB.x)*0.05), bl=cx-hw, br=cx+hw+2, mx=(bl+br)/2;
      p.F(A[1]); p.poly([[t0.x,t0.y],[t1.x,t1.y],[br,by],[bl,by]]);
      p.F(X[2]); p.poly([[t0.x,t0.y],[-1,0],[mx-4,by],[bl,by]]); p.F(A[2]); p.poly([[t0.x,t0.y],[t0.x+5,t0.y],[bl+5,by],[bl,by]]);
      p.F(X[1]); p.poly([[5,0],[t1.x-1,t1.y],[br-2,by-6],[mx+5,by-6]]); p.F(A[0]); p.poly([[t1.x-6,t1.y+1],[t1.x-1,t1.y+1],[br-3,by-12],[br-7,by-12]]);
      p.F(A[2]); [0.38,0.62].forEach(t=>{ const ax=t0.x+(t1.x-t0.x)*t; p.cap({x:ax,y:5},{x:bl+(br-bl)*t,y:by-2},1,1.2); });
      p.F(A[3]); p.rect(bl,by-1.4,br-bl,1.4); p.F(M.stitch[1]); for(let x=bl+1;x<br-1;x+=2.4) p.rect(x,by-3.2,1.2,0.8);
      p.F(M.burn[1]); [[0.3,0.4],[0.7,0.55],[0.5,0.8]].forEach(([u,v])=>p.ell(bl+(br-bl)*u,by*v,1.4,1));
      p.F(M.glove[1]); p.poly([[br-3,3],[br,3],[br+1,12],[br-2.4,11]]); p.F(M.glove[2]); p.rect(br-2.4,9,3,1.6); },
    tools:{marreta,grifo}, toolFor:()=> 'marreta',
    anims:(A,{K_,G,S,th,sh})=>{
      // marreta descansando no ombro (parado e andando)
      A.idle.pose=i=>{ const p=i/8*Math.PI*2, s=S(p);
        return K_({lean:3+1.4*s,br:s,hx:1.2*S(p/2),head:1.2*S(p-0.7),lFh:28,lFk:4+2.2*s,lBh:-24,lBk:-26+2.2*s,aFs:34+2*s,aFe:150+2*s,bA:236+2*s,aBs:-6+2*s,aBe:30+3*s,toolBehind:1,blink:i===5?1:0}); };
      A.walk.pose=i=>{ const p=i/8*Math.PI*2;
        return K_({plant:0,lFh:th(p,0),lFk:sh(p,0),lBh:th(p,Math.PI),lBk:sh(p,Math.PI),lean:3+1.4*S(2*p),head:S(2*p-0.6),aFs:34+3*S(2*p),aFe:150+3*S(2*p),bA:236+3*S(2*p),aBs:-6+20*S(p),aBe:12+22*S(p),toolBehind:1}); };
      A.run.pose=(f=>i=>Object.assign(f(i),{two:1}))(A.run.pose);
    },
    special:({G})=>({n:8,hits:{3:1,6:2},dur:i=>[150,110,90,70,170,90,70,260][i],pose:i=>G([
      {aFs:20,aFe:40,bA:-60,lean:18,hx:-2,brow:1,mouth:3,lFh:40,lFk:-14,lBh:-14,lBk:-50},
      {aFs:150,aFe:186,bA:226,lean:-10,brow:1,mouth:1,lFh:40,lFk:-14,lBh:-14,lBk:-50},
      {aFs:176,aFe:204,bA:240,lean:-16,brow:1,mouth:2,lift:12,plant:0,lFh:64,lFk:0,lBh:18,lBk:-40},
      {aFs:66,aFe:44,bA:14,lean:40,hx:10,mouth:2,brow:1,smear:3,sa:236,impact:2,spark:1,lFh:90,lFk:-14,lBh:6,lBk:-96},
      {aFs:64,aFe:42,bA:12,lean:38,hx:10,mouth:2,brow:1,spark:2,lFh:90,lFk:-14,lBh:6,lBk:-96},
      {aFs:150,aFe:180,bA:220,lean:-6,hx:6,mouth:3,brow:1,lFh:54,lFk:-8,lBh:-28,lBk:-62},
      {aFs:66,aFe:44,bA:14,lean:40,hx:10,mouth:2,brow:1,smear:3,sa:220,impact:1,spark:1,lFh:90,lFk:-14,lBh:6,lBk:-96},
      {aFs:34,aFe:76,bA:110,lean:8,hx:3,mouth:3,brow:3,lFh:34,lFk:2,lBh:-24,lBk:-34}][i])}),
    fx:(p,M,sk,P,{lp})=>{ if(!P.spark) return; const t=lp(sk.wrF,P.aFe+P.bat-sk.ro,29); sparks(p,M,{x:t.x,y:Math.min(t.y,150)},P.spark>=2?26:18,P.spark*0.31);
      p.F(M.rubble[1]); [[-12,0],[-6,-3],[8,-2],[14,0]].forEach(([dx,dy],k)=>p.rect(t.x+dx*(P.spark>=2?1.4:1),Math.min(t.y,150)+dy-(P.spark>=2?4:0),2+k%2,2)); },
    FX:{special:{hits:[3,6],word:'TINK!',sparks:'#ffb040'}, combo:{words:['TUNG!','TUNG!','BLAM!']}},
    NAMES:{skin:'Pele',hair:'Cabelo/bigode',top:'Camisa de brim',apron:'Avental de raspa',glove:'Luva de raspa',boot:'Botina com biqueira',lens:'Óculos de solda',iron:'Cabeça da marreta',wood:'Cabo',red:'Chave grifo',ember:'Brasa'},
  });
})();

/* ===== hub/pedreira ===== */
/* PEDREIRA — fonte de arte (editável). Build: npm run art */
/* Mestre de obras no padrão do HEROI: capacete amarelo, colete laranja refletivo sobre regata mescla, braços
   fortes, luva pigmentada, joelheira, botina; picareta de duas mãos e talhadeira na bolsa de ferramentas. */
const PEDREIRA=(function(){
  const {P2,lerp,lp}=PIX;
  const picareta={nome:'Picareta',len:28,twoHand:true,grip2:9,draw(p,M,b,ang){ p.xf(ang,b.x,b.y);
    p.F(M.wood[1]); p.cap(P2(-7,0),P2(27,0),4.8,4.4);
    p.F(M.woodX[2]); p.poly([[-6,0.2],[27,0.1],[27,2.2],[-6,2.4]]); p.F(M.wood[2]); p.poly([[-6,1.1],[27,0.9],[27,2.2],[-6,2.4]]); p.F(M.wood[3]); p.rect(-6,1.8,33,0.6);
    p.F(M.wood[0]); p.rect(5,-1.8,19,0.8); p.F(M.woodX[0]); p.rect(12,-1.8,5,0.7); p.F(M.wood[2]); [8,16,21].forEach(x=>p.rect(x,-0.6,2.4,0.6));
    p.F(M.vest[1]); p.cap(P2(-6.4,0),P2(4,0),5.6,5.6); p.F(M.vest[2]); for(let x=-5;x<4;x+=2.4) p.rect(x,-2.8,1,5.6); p.F(M.vest[0]); p.rect(-5.6,-2.4,9,0.8);
    // cabeça curva: ponta (+y) e pá (-y)
    p.F(M.steel[3]); p.poly([[24,-4],[31,-4],[32.4,-8],[35,-14.6],[33,-15.4],[29.6,-10],[30.6,-4.6],[31,4],[33.6,9],[36.6,15.6],[34.4,16],[29,9],[24,4]]);
    p.F(M.steel[1]); p.poly([[24.6,-3.4],[30.4,-3.4],[31.6,-8],[34.2,-14],[33.2,-14.4],[29.6,-9.4],[29.8,-3.4],[30,3.4],[32.8,8.6],[35.6,15],[34.6,15.2],[29.4,8.4],[24.6,3.4]]);
    p.F(M.steelX[2]); p.poly([[24.6,0.8],[30,0.8],[30.4,3.4],[24.6,3.4]]); p.poly([[30,3.4],[31,3.4],[34.6,12],[33.4,12.4]]);
    p.F(M.steel[0]); p.poly([[25,-3.4],[29.6,-3.4],[29.2,-2.2],[25,-2.2]]); p.poly([[30.8,-6],[33.6,-13.6],[34.2,-14],[31.6,-6]]); p.F(M.steelX[0]); p.rect(31.6,-10,1,1.2);
    p.F(M.steel[2]); p.rect(27,-4,0.9,8); p.F(M.rust[1]); p.rect(25.6,1.6,1.6,1.2); p.rect(32,9,1.2,1.2);
    p.id(); }};
  const talhadeira={nome:'Talhadeira',len:16,draw(p,M,b,ang){ p.xf(ang,b.x,b.y);
    p.F(M.steel[1]); p.cap(P2(-4,0),P2(14,0),3.4,3); p.F(M.steel[2]); p.rect(-4,0.6,18,1); p.F(M.steel[0]); p.rect(-3,-1.2,15,0.6);
    p.F(M.steel[3]); p.poly([[14,-1.6],[17,-0.6],[17,0.6],[14,1.6]]); p.F(M.steel[0]); p.rect(-4.6,-1.8,1.6,3.6); p.id(); }};
  function rocks(p,M,c,lv){ const pts=[[-14,-6,3],[-8,-12,2.4],[-3,-16,2],[5,-14,2.6],[11,-9,3],[16,-4,2.2],[0,-6,3.4]];
    pts.forEach(([dx,dy,r],k)=>{ const s=lv>=2?1.9:1.35; const q={x:c.x+dx*s,y:c.y+dy*s}; r*=1.4; p.F(M.rubble[3]); p.ell(q.x,q.y+0.6,r+0.6,r); p.F(M.rubble[1]); p.ell(q.x,q.y,r,r-0.6); p.F(M.rubble[0]); p.rect(q.x-r*0.5,q.y-r*0.5,1.2,1); });
    p.F(M.mortar[0]); [[-18,-2],[18,-1],[-10,-3],[10,-2]].forEach(([dx,dy])=>p.ell(c.x+dx*(lv>=2?1.3:1),c.y+dy,4,1.6)); }
  return RECRUTA_BASE.make({
    f:1, rim:'#a9c8f0', trail:'#ffd27a', twoGuard:true,
    body:{tsx:1.34,shF:-11.4,shB:10.8,wU:12.2,wE:10.6,wW:8,fist:1.42,wT:16.6,wK:12.6,wA:9.4,neck:7.6},
    comboName:'Combo de picareta', strikes:{names:{atkH:'Picaretada lateral',atkV:'Picaretada por cima',atkS:'Espetada com a ponta',atkSpin:'Giro da picareta',atkFin:'Picaretada de baixo (lança)'}}, specialName:'Especial: picaretada sísmica',
    sigs:[['sigOnda','groundSlam','Pilão no chão (onda de choque)',{v:'wave'}],['sigGancho','pullHook','Gancho de picareta (puxa)']],
    top:'top', leg:{pants:'pants',boot:'boot',sole:'sole',lace:'lace',pocket:1,
      extra:(p,M,hip,knee,ankle,front)=>{ if(!front) return; p.F(M.knee[3]); p.ell(knee.x+1.4,knee.y+0.4,6,5.6); p.F(M.knee[1]); p.ell(knee.x+1.2,knee.y,5.4,5); p.F(M.kneeX[2]); p.ell(knee.x,knee.y+1.4,4,3); p.F(M.knee[0]); p.ell(knee.x+2.4,knee.y-2,2.4,1.4); p.F(M.vest[1]); p.rect(knee.x-4.6,knee.y-0.6,9.6,1.2);
        p.F(M.mortar[1]); const c=lerp(knee,ankle,0.6); p.rect(c.x+1,c.y,1.6,1.2); p.rect(c.x-3,c.y+3,1.2,1.2); }},
    arm:{style:'short',to:0.3,glove:'glove',gloveFrom:0.68,cuff:2.4,
      extra:(p,M,sh,el,wr,front)=>{ const g=lerp(el,wr,0.86); p.F(M.dots[1]); [[0,-1.6],[1.6,0.6],[-1.4,1]].forEach(([x,y])=>p.rect(g.x+x,g.y+y,1,1)); }},
    mats:()=>({
      top:'#a8a49a', pants:'#3e5c88', vest:'#ee8a22', refl:['#ffffff','#e4e8ec','#9aa0a8','#5a6068'],
      knee:'#3a3a44', glove:'#e6e0d0', dots:['#ff9a5a','#e0702a','#a04a14','#5a2808'], boot:'#a8743e', sole:['#6a5a4a','#3a2e22','#241c14','#120e0a'], lace:['#efe2c0','#c8b07a','#8a7448','#4a3c22'],
      helmet:'#f2b21c', hair:'#3a2418', elastic:['#ff8a8a','#d83a44','#8a1e26','#4a0a10'], gold:['#fff0a0','#e3b23c','#9a7418','#4a380c'],
      steel:['#f4f8fc','#a4acb8','#646c7a','#363c48'], steelX:['#ffffff','#c8d0dc','#6a6478','#16141e'], wood:'#a87440', rust:['#d08a5a','#9a5a30','#6a3a1c','#3a1e0c'],
      mortar:['#efe8d8','#cfc6b4','#a09886','#6a6252'], pouch:'#6a4a2e', pencil:['#ffe27a','#f2c230','#b08a14','#6a520a'], flag:['#4ac860','#2a9a3e','#ffd23f','#2a4ab8'],
      rubble:['#d8ccb8','#9a8e7c','#6a6052','#342e28'],
    }),
    head:{brow:1.6,
      back:(p,M,P)=>{ // rabo de cavalo saindo do capacete
        const sw=(P.mouth===2?-2:0)+(P.flash?-3:0)+Math.sin((P.lean||0)*0.2)*1.4;
        p.F(M.hair[1]); p.cap(P2(-8,-16),P2(-13+sw*0.4,-6),6,5.2); p.cap(P2(-13+sw*0.4,-6),P2(-15+sw,3),5.2,3);
        p.F(M.hair[2]); p.cap(P2(-10,-12),P2(-14+sw,2),2.4,1.6); p.F(M.hair[0]); p.cap(P2(-10.4,-15),P2(-13+sw*0.4,-8),1.4,1);
        p.F(M.elastic[1]); p.ell(-10,-13.4,2.4,1.8); p.F(M.elastic[0]); p.rect(-10.6,-14.4,1.4,0.8); },
      hair:(p,M,P)=>{ p.F(M.hair[1]); p.poly([[-0.6,-16],[1.4,-16],[1.2,-10.6],[-0.8,-10.2]]); p.poly([[3,-19.6],[12,-19.6],[11,-17.6],[4,-17.8]]);
        p.F(M.gold[1]); p.ell(-3.2,-8.4,1.2,1.2); p.F(M.gold[0]); p.rect(-3.6,-8.8,0.8,0.6);
        p.F(M.pencil[1]); p.poly([[-6.8,-17.4],[-5.6,-17.8],[-3.6,-10.6],[-4.8,-10.2]]); p.F(M.pencil[2]); p.rect(-4.6,-11,1,1); p.F(M.mortar[2]); p.ell(1,-11,1.6,1); },
      hat:(p,M,P,{dome})=>{ const R=M.helmet, X=M.helmetX;
        p.F(R[3]); p.poly(dome(2.4,-18.6,12.4,12,0,180,16).concat([[-10.4,-17.6],[14.6,-17.6]]));
        p.F(R[1]); p.poly(dome(2.4,-19,11.8,11.6,0,180,16));
        p.F(X[2]); p.poly(dome(2.4,-19,11.8,11.6,110,180,8).concat([[-4,-19]])); p.F(R[2]); p.poly(dome(2.4,-19,11.8,11.6,140,180,6).concat([[-7,-19]]));
        p.F(X[1]); p.poly([[1,-29.6],[8,-28.6],[12.6,-23],[13.4,-19.6],[7,-19.6],[3,-25]]); p.F(R[0]); p.poly([[3,-29.6],[7.4,-28.6],[10.4,-25],[6,-25.6]]); p.F(X[0]); p.rect(5,-29.2,2.6,1);
        p.F(R[2]); p.rect(0.6,-30.6,2.6,11.6); p.F(X[1]); p.rect(1.2,-30.4,0.8,11); // nervura
        p.F(R[1]); p.poly([[-12,-19.4],[15,-19.4],[22,-18],[21,-16],[14,-16.8],[-12,-16.8]]); p.F(R[0]); p.rect(-11,-19.4,30,0.9); p.F(R[3]); p.poly([[-12,-17.4],[21,-16.6],[21,-15.8],[-12,-16.4]]);
        p.F(M.flag[0]); p.rect(6.4,-25.4,4.4,3.6); p.F(M.flag[2]); p.poly([[8.6,-25],[10.4,-23.6],[8.6,-22.2],[6.8,-23.6]]); p.F(M.flag[3]); p.rect(8,-24.2,1.2,1.2);
        p.F(M.mortar[1]); p.rect(-6,-24,1.6,1.2); p.rect(10,-27,1.2,1); }},
    torso:(p,M,sk,P,{f})=>{ // colete refletivo aberto, bolsa de ferramentas com talhadeira
      const V=M.vest, VX=M.vestX;
      const L=[[-10.4,-1],[-2.4,-1],[-2,-26],[-5.2,-30.4],[-8.8,-28.2],[-10.6,-24],[-9.8,-19],[-8,-13],[-8.4,-8]];
      const Rr=[[3.4,-1],[9.6,-1],[9.8,-3],[8,-9],[8.6,-13.4],[10.8,-18],[11,-23],[9.4,-27.6],[5.6,-29.6],[3.4,-24]];
      p.F(V[1]); p.poly(L); p.poly(Rr);
      p.F(VX[2]); p.poly([[-10.4,-1],[-6,-1],[-6,-28],[-8.8,-28.2],[-10.6,-24],[-9.8,-19],[-8,-13],[-8.4,-8]]); p.F(V[2]); p.poly([[-10.4,-1],[-8,-1],[-8.4,-27.6],[-10.6,-24],[-9.8,-19],[-8,-13],[-8.4,-8]]);
      p.F(VX[1]); p.poly([[5,-28.6],[9.4,-27.6],[11,-23],[10.6,-18.6],[5,-18]]); p.F(V[0]); p.poly([[6,-28],[9,-27],[10.2,-23],[6.6,-23.4]]);
      p.F(V[3]); p.rect(-2.8,-26,0.9,25); p.rect(3.4,-24,0.9,23);
      [-18,-9].forEach(y=>{ p.F(M.refl[1]); p.rect(-10.4,y,8,2.6); p.rect(3.4,y,7.2,2.6); p.F(M.refl[0]); p.rect(4,y,5,0.8); p.F(M.refl[2]); p.rect(-10.4,y,3.4,2.6); p.F(M.refl[3]); p.rect(-10.4,y+2.6,8,0.6); p.rect(3.4,y+2.6,7.2,0.6); });
      p.F(V[2]); p.rect(5,-25.4,4.4,4); p.F(VX[1]); p.rect(5,-25.4,4.4,1); p.F(M.pencil[1]); p.rect(5.6,-28,1,3); p.F(M.refl[2]); p.rect(7.6,-27.2,1.4,2.2);
      p.F(M.mortar[1]); [[-7,-23],[6,-12],[-4,-5],[8,-4],[0,-15]].forEach(([x,y])=>p.rect(x,y,1.2,1.2));
      // bolsa na cintura
      const PO=M.pouch, PX=M.pouchX; p.F(PO[3]); p.rect(-11.6,-2.4,7.4,9); p.F(PO[1]); p.rect(-11.2,-2,6.6,8.2); p.F(PX[2]); p.rect(-11.2,-2,2.6,8.2); p.F(PO[0]); p.rect(-11.2,-2,6.6,1.2);
      p.F(M.steel[1]); p.poly([[-9.4,-2],[-7.8,-2],[-7.4,-9],[-9,-9]]); p.F(M.steel[0]); p.rect(-9.6,-9.8,2.4,1); p.F(M.wood[1]); p.poly([[-7,-2],[-5.6,-2],[-4.6,-7],[-6,-7.2]]); },
    behind:(p,M,sk,P)=>{ if(P.inhand) return; },
    tools:{picareta,talhadeira}, toolFor:()=> 'picareta',
    anims:(A,{K_,G,S,th,sh})=>{
      // parada de mão na cintura, picareta pendurada
      A.idle.pose=i=>{ const p=i/8*Math.PI*2, s=S(p);
        return K_({lean:3+1.4*s,br:s,hx:1.2*S(p/2),head:1.2*S(p-0.7)-2,lFh:28,lFk:4+2.2*s,lBh:-24,lBk:-26+2.2*s,aFs:12+2*s,aFe:28+3*s,bA:12+2*s,backTarget:[12,-4+0.6*s],blink:i===5?1:0,brow:0}); };
    },
    special:({G})=>({n:8,hits:{3:1,6:2},dur:i=>[160,110,90,80,170,110,80,260][i],pose:i=>G([
      {aFs:30,aFe:60,bA:-80,lean:16,hx:-2,brow:1,mouth:3,lFh:40,lFk:-14,lBh:-14,lBk:-50},
      {aFs:160,aFe:190,bA:236,lean:-12,brow:1,mouth:1,lFh:40,lFk:-14,lBh:-14,lBk:-50},
      {aFs:178,aFe:206,bA:246,lean:-18,brow:1,mouth:2,lift:8,plant:0,lFh:60,lFk:0,lBh:14,lBk:-40},
      {aFs:62,aFe:40,bA:6,lean:42,hx:10,mouth:2,brow:1,smear:3,sa:240,impact:2,rocks:1,lFh:90,lFk:-14,lBh:6,lBk:-96},
      {aFs:60,aFe:38,bA:4,lean:40,hx:10,mouth:2,brow:1,rocks:2,lFh:90,lFk:-14,lBh:6,lBk:-96},
      {aFs:160,aFe:186,bA:230,lean:-8,hx:6,mouth:3,brow:1,lFh:54,lFk:-8,lBh:-28,lBk:-62},
      {aFs:62,aFe:40,bA:6,lean:42,hx:10,mouth:2,brow:1,smear:3,sa:226,impact:1,rocks:2,lFh:90,lFk:-14,lBh:6,lBk:-96},
      {aFs:34,aFe:76,bA:110,lean:8,hx:3,mouth:3,brow:3,lFh:34,lFk:2,lBh:-24,lBk:-34}][i])}),
    fx:(p,M,sk,P,{lp})=>{ if(!P.rocks) return; const t=lp(sk.wrF,P.aFe+P.bat-sk.ro,28); rocks(p,M,{x:t.x,y:Math.min(t.y+4,151)},P.rocks); },
    FX:{special:{hits:[3,6],word:'KRAK!',bricks:true}, combo:{words:['POC!','POC!','BLAM!']}},
    NAMES:{skin:'Pele',hair:'Cabelo',helmet:'Capacete',vest:'Colete refletivo',refl:'Faixa refletiva',top:'Regata mescla',pants:'Jeans',glove:'Luva pigmentada',knee:'Joelheira',boot:'Botina',steel:'Picareta (aço)',wood:'Cabo'},
  });
})();

/* ===== hub/lenhador ===== */
/* LENHADOR — fonte de arte (editável). Build: npm run art */
/* Grandalhão barbudo no padrão do HEROI (corpo mais largo e alto): camisa de flanela xadrez com manga dobrada,
   suspensório, gorro de lã, barba cheia, calça de lona remendada, botina; machado de duas mãos. */
const LENHADOR=(function(){
  const {P2,lerp,lp}=PIX;
  const machado={nome:'Machado de lenhador',len:36,twoHand:true,grip2:11,draw(p,M,b,ang){ p.xf(ang,b.x,b.y);
    p.F(M.wood[1]); p.cap(P2(-9,0),P2(36,0),5,4.4); p.F(M.wood[0]); p.ell(-9.6,0,2.8,3);
    p.F(M.woodX[2]); p.poly([[-8,0.2],[34,0.1],[34,2.1],[-8,2.4]]); p.F(M.wood[2]); p.poly([[-8,1.1],[34,0.9],[34,2.1],[-8,2.4]]); p.F(M.wood[3]); p.rect(-8,1.8,42,0.6);
    p.F(M.wood[0]); p.rect(6,-1.8,24,0.8); p.F(M.woodX[0]); p.rect(14,-1.8,6,0.7); p.F(M.wood[2]); [10,18,25].forEach(x=>p.rect(x,-0.6,3,0.6));
    p.F(M.tape[1]); p.cap(P2(-7.6,0),P2(1,0),5.6,5.6); p.F(M.tape[2]); for(let x=-6.6;x<1;x+=2.2) p.poly([[x,-2.8],[x+1,-2.8],[x+0.2,2.8],[x-0.8,2.8]]); p.F(M.tape[0]); p.rect(-7,-2.4,8,0.8);
    // olho + lâmina larga (gume pro lado +y), contracabeça
    p.F(M.axe[3]); p.poly([[30,-7],[40.6,-7],[40.6,3],[44,8.6],[47,21.6],[26,23],[28.6,10],[30,3]]);
    p.F(M.axe[2]); p.poly([[30.6,-6.4],[40,-6.4],[40,3.4],[30.6,3.4]]);
    p.F(M.axe[1]); p.poly([[30.6,3],[40,3],[43.2,9],[46,20.6],[27,21.8],[29.2,10]]);
    p.F(M.axeX[2]); p.poly([[30.6,3],[33.4,3],[31.6,10],[29.6,21.6],[27,21.8],[29.2,10]]);
    p.F(M.axeX[1]); p.poly([[36,4],[40,3.4],[43,9.2],[38.4,9.8]]);
    p.F(M.axe[0]); p.poly([[26.8,18.6],[45.6,17.4],[46,21],[26.8,22]]); p.F(M.axeX[0]); p.rect(35,18.2,5,1.4); p.F(M.axe[3]); p.rect(30,16.6,13,0.8);
    p.F(M.axe[1]); p.rect(31.4,-5.6,7,1.6); p.F(M.axe[0]); p.rect(32,-5.6,3.6,0.8);
    p.F(M.rust[1]); p.rect(32,7,2.4,1.8); p.rect(38,11,1.6,1.4); p.rect(34,13,1.2,1.2); p.F(M.rust[2]); p.rect(31.6,-2.4,1.6,1.6);
    p.id(); }};
  return RECRUTA_BASE.make({
    FW:212, AX:96, rim:'#a9c8f0', trail:'#f0d8a8', twoGuard:true, comboSlow:1.12,
    body:{L1:22.4,L2:21.8,U:14.8,E:14,shF:-16,shB:15.4,tsx:1.68,tsy:1.17,wU:15.4,wE:13.4,wW:9.8,wT:20.4,wK:15.2,wA:11.4,fist:1.72,hipF:5.8,hipB:-6.2,neck:10.4,foot:8.6,shoe:1.4,head:1.15},
    comboName:'Combo de machadadas', strikes:{names:{atkH:'Machadada lateral',atkV:'Machadada por cima (racha)',atkS:'Cutucão com o cabo',atkSpin:'Giro do machado',atkFin:'Machadada de baixo (lança)'}}, specialName:'Especial: rachar tora',
    sigs:[['sigGiro','spinTornado','Machadada giratória'],['sigRacha','groundSlam','Racha-tora (machado no chão)',{v:'crack'}]],
    top:'top', leg:{pants:'pants',boot:'boot',sole:'sole',lace:'lace',patch:'patch',pocket:1},
    arm:{style:'rolled',to:0.8,hairy:1,
      extra:(p,M,sh,el,wr,front,P,{wU,wE})=>{ // xadrez da manga
        const e=lerp(sh,el,0.68); [0.18,0.42].forEach(t=>{ const q=lerp(sh,e,t), o=lerp(sh,e,t+0.07); p.F(M.plaid[1]); p.cap(q,o,wU+2.4,wU+2.2); });
        const ax0=lerp(sh,e,0.02), ax1=lerp(sh,e,0.6); p.F(M.plaid[1]); p.cap(ax0,ax1,1.6,1.6);
        if(front){ const bnd=lerp(el,wr,0.86); p.F(M.bonfim[0]); p.cap({x:bnd.x-3,y:bnd.y-2.6},{x:bnd.x+3,y:bnd.y+2.6},1.6,1.6); p.F(M.bonfim[2]); p.rect(bnd.x-1,bnd.y-1,1.4,1.4); } }},
    mats:()=>({
      top:'#b4362a', plaid:['#5a1a16','#3a0e0e','#260808','#120404'], under:'#cfc8b8',
      susp:'#4a3020', brass:['#fff0b0','#d8aa48','#8a6a20','#4a380e'],
      pants:'#6e6044', patch:['#b8a678','#8e7c56','#6a5a3c','#423820'],
      boot:'#6e4626', sole:['#5a4636','#2e2018','#1c140e','#0c0806'], lace:['#efe2c0','#c8b07a','#8a7448','#4a3c22'],
      hair:'#6a3a1e', hat:'#d89a2a', hatband:'#3a5a8a',
      wood:'#b07a40', tape:['#5a5a64','#202026','#121216','#060608'], axe:['#f4f8fc','#9aa2ae','#566070','#2a303c'], axeX:['#ffffff','#c4ccd8','#5c5870','#14121c'], rust:['#c06a3a','#8a4a2a','#5a2e18','#30180c'],
      bonfim:['#4ac860','#ffd23f','#e83a3a','#2a2a2a'], log:'#a8743a', ring:['#f4dcae','#d8b880','#a88a58','#6a5636'], chip:['#f4dcae','#d8b880','#a88a58','#6a5636'],
    }),
    pattern:(p,M,sk,P)=>{ // flanela xadrez (listras escuras e cruzamentos)
      p.F(M.plaid[1]); for(let y=-30;y<2;y+=6.4) p.rect(-14,y,30,1.6); for(let x=-11;x<14;x+=6.4) p.rect(x,-34,1.4,36);
      p.F(M.plaid[3]); for(let y=-30;y<2;y+=6.4) for(let x=-11;x<14;x+=6.4) p.rect(x,y,1.4,1.6);
      p.F(M.topX[1]); for(let y=-27;y<2;y+=6.4) p.rect(-2,y,16,0.6);
      p.F(M.plaid[2]); p.poly([[-14,-34],[-6,-34],[-6,4],[-14,4]]); p.F(M.plaid[1]); for(let y=-30;y<2;y+=6.4) p.rect(-14,y,8,1.6); },
    torso:(p,M,sk,P)=>{ // gola, botões, suspensório, bolso
      p.F(M.under[1]); p.poly([[-1,-33.6],[5.8,-33.8],[3.2,-27]]); p.F(M.under[2]); p.rect(-0.4,-33.4,2,4);
      p.F(M.top[1]); p.poly([[-3.6,-34],[1.4,-35],[2.8,-28],[-0.6,-30]]); p.poly([[4.4,-35],[9,-33.6],[5.6,-29],[3.2,-28]]); p.F(M.top[0]); p.rect(-2.6,-34.2,3,0.8); p.rect(5,-34.6,3,0.8); p.F(M.plaid[1]); p.rect(-2.8,-31.6,2.4,1); p.rect(6,-32,2,1);
      p.F(M.under[0]); [-24,-17,-10].forEach(y=>{ p.rect(3.6,y,1.4,1.4); }); p.F(M.plaid[3]); p.rect(3.2,-27,0.8,24);
      p.F(M.plaid[2]); p.rect(-9,-24,6.4,6); p.F(M.top[2]); p.rect(-9,-24,6.4,1.6); p.F(M.under[0]); p.rect(-6.4,-23.4,1,1);
      const S=M.susp, SX=M.suspX;
      p.F(S[1]); p.poly([[-8,-32.6],[-5,-32.8],[-2.6,-3],[-5.6,-3]]); p.poly([[8,-33.4],[11,-32.4],[10.2,-3],[7.2,-3]]);
      p.F(SX[2]); p.poly([[-8,-32.6],[-6.6,-32.6],[-4.4,-3],[-5.6,-3]]); p.F(S[0]); p.poly([[9.6,-32.8],[11,-32.4],[10.6,-20],[9.6,-20]]);
      p.F(M.brass[1]); p.rect(-5.4,-6,2.6,2.6); p.rect(7.4,-6,2.6,2.6); p.F(M.brass[0]); p.rect(-5.4,-6,1.2,1); p.rect(7.4,-6,1.2,1);
      p.F(S[2]); [-28,-20,-12].forEach(y=>{ p.rect(-6.4+(y+32)*0.1,y,0.8,0.8); p.rect(8.6,y,0.8,0.8); }); },
    head:{brow:2.6,
      beard:(p,M)=>{ const R=M.hair, X=M.hairX;
        p.F(R[1]); p.poly([[-3.4,-11],[-0.6,-6.4],[1,-1.4],[4.6,3.6],[9,5.4],[12.6,2.4],[14,-3.6],[12.4,-4.6],[10.6,-3],[8,-3.4],[6.4,-5],[3.6,-7.6],[1.4,-12]]);
        p.F(X[2]); p.poly([[-3.4,-11],[-0.6,-6.4],[1,-1.4],[4.6,3.6],[6,3],[3,-1.6],[1.6,-7]]); p.F(R[2]); p.poly([[1,-1.4],[4.6,3.6],[9,5.4],[8.4,3.4],[4.4,1.4],[2.4,-2.4]]);
        p.F(R[0]); [[6,-1.6],[9.6,-0.6],[11.6,-2.2],[3,-5],[7.6,1.6]].forEach(([x,y])=>p.rect(x,y,1,1.6)); p.F(X[1]); p.rect(4,-3,1.2,2);
        p.F(R[3]); p.rect(6,4.4,4,1); },
      stache:(p,M)=>{ p.F(M.hair[1]); p.poly([[6.4,-9.4],[13.6,-9.6],[14.8,-6.4],[13,-5.6],[10.4,-7.2],[7.6,-5.8],[6,-6.8]]); p.F(M.hair[0]); p.rect(8.6,-9.4,3.4,0.8); p.F(M.hair[2]); p.rect(12.6,-6.4,1.6,0.8); },
      nose:(p,M)=>{ p.F(M.skinX[1]); p.ell(13,-10,1.4,1.1); },
      hair:(p,M)=>{ p.F(M.hair[1]); p.poly([[-8.6,-18],[-1.6,-18],[-0.6,-12],[-1.4,-9],[-4,-8],[-8.6,-11]]); p.F(M.hair[0]); [[-6.4,-16],[-4,-14.6]].forEach(([x,y])=>p.rect(x,y,1.2,0.8)); p.F(M.hair[1]); p.rect(-0.8,-17.6,2,7); },
      hat:(p,M,P,{dome})=>{ const R=M.hat, X=M.hatX; // gorro de lã com barra dobrada
        p.F(R[1]); p.poly(dome(2.4,-19,11.6,11.4,-5,185,16)); p.poly([[2,-30],[5,-33],[7,-31],[5,-29]]);
        p.F(X[2]); p.poly(dome(2.4,-19,11.6,11.4,120,185,8).concat([[-3,-19]])); p.F(R[2]); p.poly(dome(2.4,-19,11.6,11.4,150,185,6).concat([[-6.6,-19]]));
        p.F(X[1]); p.poly([[2,-29.6],[8,-28.6],[12.4,-24],[13.6,-20],[7,-21],[3,-25]]); p.F(R[0]); p.poly([[3.6,-29],[8,-27.8],[10.6,-24.4],[6,-25]]);
        p.F(R[2]); for(let x=-6;x<12;x+=3) p.rect(x,-27+Math.abs(x-3)*0.12,0.9,6);
        p.F(R[1]); p.poly([[-10.8,-22.6],[13.8,-23],[14.4,-17.4],[-10.4,-17]]); p.F(R[3]); p.poly([[-10.4,-17.6],[14.4,-18],[14.4,-17.2],[-10.4,-16.8]]);
        p.F(R[2]); for(let x=-9.6;x<14;x+=2.4) p.rect(x,-22.4,0.9,5); p.F(R[0]); p.rect(-10,-22.8,23.6,0.9); p.F(X[2]); p.rect(-10.6,-22.6,4,5.4);
        p.F(M.hatband[1]); p.rect(-10.6,-21,25,1.4); p.F(M.hatband[0]); p.rect(2,-21,8,0.6); }},
    tools:{machado}, toolFor:()=> 'machado',
    anims:(A,{K_,G,S,th,sh})=>{
      // machado atravessado na frente do corpo, segurado com as duas mãos (lâmina pra baixo)
      A.idle.pose=i=>{ const p=i/8*Math.PI*2, s=S(p);
        return K_({lean:6+1.4*s,br:s,hx:1.2*S(p/2),head:1.2*S(p-0.7)-2,lFh:30,lFk:4+2.2*s,lBh:-26,lBk:-28+2.2*s,aFs:2+2*s,aFe:60+3*s,bA:58+2*s,two:1,blink:i===5?1:0}); };
      A.walk.pose=i=>{ const p=i/8*Math.PI*2;
        return K_({plant:0,lFh:th(p,0),lFk:sh(p,0),lBh:th(p,Math.PI),lBk:sh(p,Math.PI),lean:5+1.4*S(2*p),head:S(2*p-0.6)-2,aFs:2+4*S(p),aFe:60+4*S(p),bA:58+3*S(2*p),two:1}); };
      A.run.pose=(f=>i=>Object.assign(f(i),{two:1}))(A.run.pose);
    },
    front:(p,M,sk,P)=>{ if(!P.log) return; // tora no toco
      const lx=sk.hip.x+50, gy=154, L=M.log, LX=M.logX; p.id();
      p.F(L[3]); p.poly([[lx-15,gy],[lx+15,gy],[lx+13,gy-13],[lx-13,gy-13]]); p.F(L[2]); p.poly([[lx-14,gy-0.6],[lx+14,gy-0.6],[lx+12,gy-12.6],[lx-12,gy-12.6]]); p.F(L[1]); p.poly([[lx-2,gy-1],[lx+13,gy-1],[lx+11.6,gy-12.6],[lx-2,gy-12.6]]); p.F(LX[1]); p.rect(lx+5,gy-12,4,11);
      p.F(M.ring[1]); p.ell(lx,gy-13,13,3.6); p.F(M.ring[2]); p.ell(lx,gy-13,8,2.2); p.F(M.ring[3]); p.ell(lx,gy-13,3,0.9);
      if(P.log===1){ p.F(L[2]); p.poly([[lx-8,gy-13],[lx+8,gy-13],[lx+8,gy-37],[lx-8,gy-37]]); p.F(L[1]); p.poly([[lx-1,gy-13],[lx+8,gy-13],[lx+8,gy-37],[lx-1,gy-37]]); p.F(LX[1]); p.rect(lx+3,gy-36,2.4,22); p.F(L[3]); p.rect(lx-8,gy-36,1.6,22); [gy-30,gy-22].forEach(y=>p.rect(lx-4,y,0.9,4));
        p.F(M.ring[1]); p.ell(lx,gy-37,8,2.4); p.F(M.ring[2]); p.ell(lx,gy-37,4.4,1.2); }
      else { [[-1,-15],[1,15]].forEach(([s,o])=>{ const bx=lx+o*0.7; p.F(L[2]); p.poly([[bx-5,gy-1],[bx+5,gy-1],[bx+6+s*5,gy-22],[bx-4+s*5,gy-22]]); p.F(M.ring[1]); p.poly([[bx+(s<0?3:-5),gy-1],[bx+(s<0?5:-3),gy-1],[bx+(s<0?6:-4)+s*5,gy-22],[bx+(s<0?4:-6)+s*5,gy-22]]); });
        p.F(M.chip[1]); [[-6,-26],[4,-30],[10,-24],[-12,-20],[0,-34]].forEach(([dx,dy])=>p.rect(lx+dx,gy+dy,2.4,1.4)); } },
    special:({G})=>({n:8,hits:{4:1},dur:i=>[180,160,150,90,70,240,200,300][i],pose:i=>G([
      {log:1,aFs:40,aFe:70,bA:60,lean:6,brow:1,mouth:3},
      {log:1,aFs:150,aFe:186,bA:226,lean:-10,brow:1,mouth:1,lFh:40,lFk:-14,lBh:-14,lBk:-50},
      {log:1,aFs:176,aFe:206,bA:244,lean:-18,brow:1,mouth:2,lift:4,lFh:44,lFk:-14,lBh:-14,lBk:-50},
      {log:1,aFs:150,aFe:176,bA:200,lean:-4,mouth:2,brow:1},
      {log:2,aFs:70,aFe:62,bA:40,lean:34,hx:8,mouth:2,brow:1,smear:3,sa:226,impact:2,lFh:62,lFk:12,lBh:-32,lBk:-36},
      {log:2,aFs:68,aFe:60,bA:38,lean:32,hx:8,mouth:1,brow:1,lFh:62,lFk:12,lBh:-32,lBk:-36},
      {log:2,aFs:40,aFe:80,bA:110,lean:10,hx:4,mouth:3,brow:3,lFh:34,lFk:2,lBh:-24,lBk:-34},
      {log:2,aFs:30,aFe:80,bA:120,lean:6,hx:3,mouth:3,brow:3,two:0,lFh:30,lFk:2,lBh:-22,lBk:-30}][i])}),
    FX:{special:{hits:[4],word:'CRAC!',chips:true}, combo:{words:['TCHAC!','TCHAC!','KRAK!']}},
    NAMES:{skin:'Pele',hair:'Barba/cabelo',hat:'Gorro de lã',top:'Flanela xadrez',susp:'Suspensório',pants:'Calça de lona',boot:'Botina',wood:'Cabo de nogueira',axe:'Cabeça do machado',log:'Tora'},
  });
})();

/* ===== hub/cata ===== */
/* CATA — fonte de arte (editável). Build: npm run art */
/* Catadora de recicláveis do Recife no padrão do HEROI (mesmo rig de RECRUTA_BASE): boné, camiseta desbotada,
   bermuda jeans desfiada, chinelo de dedo, luva de borracha, saco de ráfia cheio nas costas, gancho de bengala
   (vergalhão com fita). Contrato: frame(skin, anim, fi). */
const CATA=(function(){
  const {P2,lerp,lp}=PIX;
  const HOOKLEN=40;
  const gancho={nome:'Gancho de bengala',len:HOOKLEN,draw(p,M,b,ang,P){ const L=HOOKLEN; p.xf(ang,b.x,b.y);
    // pega com fita e câmara de pneu
    p.F(M.tape[1]); p.cap(P2(-7,0),P2(5,0),5.6,5.4); p.F(M.tape[2]); for(let x=-6;x<5;x+=2.2) p.poly([[x,-2.8],[x+1,-2.8],[x+0.2,2.8],[x-0.8,2.8]]); p.F(M.tape[0]); p.rect(-6,-2.4,10,0.8);
    p.F(M.red[1]); p.rect(-1,-2.9,2,5.8); p.F(M.red[0]); p.rect(-1,-2.9,2,1);
    // vergalhão nervurado
    p.F(M.rust[1]); p.cap(P2(5,0),P2(L-6,0),3.2,3); p.F(M.rust[2]); p.rect(5,0.6,L-11,1); p.F(M.rust[0]); p.rect(6,-1.2,L-14,0.6);
    p.F(M.rust[3]); for(let x=8;x<L-7;x+=2.6) p.poly([[x,-1.6],[x+0.8,-1.6],[x+0.2,1.6],[x-0.6,1.6]]);
    p.F(M.steel[1]); [[14,0],[24,0]].forEach(([x])=>p.rect(x,-1.4,2,1));
    // gancho na ponta (curva pra +y)
    p.F(M.rust[1]); p.cap(P2(L-6,0),P2(L-1,1.6),3,3); p.cap(P2(L-1,1.6),P2(L,6),3,2.8); p.cap(P2(L,6),P2(L-3.6,9),2.8,2.4); p.cap(P2(L-3.6,9),P2(L-6.4,7.6),2.4,1.6);
    p.F(M.rust[0]); p.rect(L-3,-1,2,0.8); p.F(M.rust[2]); p.rect(L-1.4,3,1,3);
    p.F(M.steel[0]); p.rect(L-7,7.2,1.2,1);
    if(P.can){ p.F(M.can[3]); p.poly([[L-12,3],[L,2],[L+0.8,15],[L-11.4,16]]); p.F(M.can[1]); p.poly([[L-11.2,3.6],[L-0.8,2.6],[L,14.2],[L-10.6,15.2]]); p.F(M.can[2]); p.poly([[L-11.2,3.6],[L-8.6,3.4],[L-8,15],[L-10.6,15.2]]); p.F(M.can[0]); p.rect(L-5.6,4,1.6,9); p.F(M.steel[1]); p.rect(L-11.6,2.2,11.6,1.8); p.rect(L-11,14,11.4,1.6); p.F(M.steel[0]); p.rect(L-9,2.2,5,0.8); p.F(M.print[1]); p.rect(L-8,7.4,6,2.4); }
    p.id(); }};
  const B=RECRUTA_BASE.make({
    f:1, rim:'#a9c8f0', trail:'#ffe0a0',
    skins:{media:{nome:'Pele média',hex:'#b47a4e'}, escura:{nome:'Pele escura',hex:'#7a4a2e'}, clara:{nome:'Pele clara',hex:'#e2ac84'}},
    body:{tsx:1.24,shF:-9.6,shB:9.2,wU:10.2,wE:8.8,wW:7,fist:1.28},
    comboName:'Combo de 3 ganchadas', strikes:{names:{atkH:'Ganchada lateral',atkV:'Ganchada por cima',atkS:'Fisgada (estocada)',atkSpin:'Giro do gancho',atkFin:'Puxão de baixo (lança)'}}, specialName:'Especial: fisgar sucata',
    sigs:[['sigFisgada','pullHook','Fisgada (puxa o zumbi)'],['sigRasteira','lowSweep','Rasteira de gancho'],['sigEstocadas','tripleJab','Cutucadas de vergalhão',{cd:6}]],
    top:'top', noBelt:true, leg:{style:'bermuda',hem:0.96,fray:1,pants:'pants',shoe:'chinelo',sole:'sole',strap:'strap'},
    arm:{style:'short',to:0.5,glove:'glove',gloveFrom:0.6,cuff:3.4},
    mats:()=>({
      top:'#3f8a74', print:['#ffe9a8','#f2c230','#a8801a','#5a420a'], pants:'#5d6f8e', cord:['#f0dca4','#c8b27a','#8e7a4e','#54482a'],
      glove:'#e8b830', sole:['#7aa8ff','#2f5fc8','#1e3c86','#0e1c40'], strap:['#ffffff','#e8e8f0','#a8a8b8','#5a5a6a'],
      cap:'#c8342e', capbrim:['#ff8a7a','#a8241e','#6a1410','#38080a'], hair:'#2a1a12', gold:['#fff0a0','#e3b23c','#9a7418','#4a380c'],
      bag:'#e4dcc4', bagblue:['#9ac0ff','#3a68b8','#244a86','#12264a'], bstrap:'#5a3c26',
      pet:['#d8fff0','#6cc8a0','#3a8a6a','#1e4a3a'], can:['#ff9a8a','#d83a2a','#8a1a14','#4a0a08'], card:'#b8864e',
      steel:['#f4f8fc','#a8b0ba','#6e7682','#3e4450'], rust:['#d08a5a','#9a5428','#62321a','#32180a'], tape:['#5a5a64','#202026','#121216','#060608'], red:['#ff8a7a','#d03a2a','#7a1e18','#40100c'],
    }),
    pattern:(p,M)=>{ // estampa desbotada de bloco de carnaval no peito
      p.F(M.print[2]); p.ell(4.6,-19,4.6,4.2); p.F(M.print[1]); p.ell(4.6,-19.4,3.8,3.4); p.F(M.top[1]); p.ell(4.6,-19.4,2,1.8); p.F(M.print[0]); p.rect(2.4,-22.4,2.6,0.8);
      p.F(M.topX[1]); [[-4,-10],[6,-8],[-2,-24]].forEach(([x,y])=>p.ell(x,y,2.4,1.2)); },
    torso:(p,M,sk,P)=>{ // alça do saco atravessada + barbante na cintura
      const S=M.bstrap, SX=M.bstrapX;
      p.F(S[1]); p.poly([[-9.6,-28.6],[-5.6,-30],[10.6,-6],[7.4,-4.2]]); p.F(SX[2]); p.poly([[-9.6,-28.6],[-8,-29.2],[8.8,-5.2],[7.4,-4.2]]); p.F(S[0]); p.poly([[-5.6,-30],[-4.6,-29.2],[10.6,-6.6],[10.6,-6]]);
      p.F(S[2]); [[-4,-25],[0,-19],[4,-13]].forEach(([x,y])=>p.rect(x,y,1.2,0.8));
      p.F(M.cord[1]); p.poly([[-10.8,-2.4],[10.4,-2.4],[10.6,-0.4],[-11,-0.4]]); p.F(M.cord[2]); for(let x=-10;x<10;x+=2) p.rect(x,-2.4,0.8,2); p.F(M.cord[1]); p.cap(P2(5,-1),P2(6.6,4),1,1); p.cap(P2(5,-1),P2(3.4,4.4),1,1); },
    behind:(p,M,sk,P,{torsoXf})=>{ // saco de ráfia nas costas com recicláveis
      torsoXf(p,sk); const b=Math.round((P.br||0)*0.6), R=M.bag, X=M.bagX;
      p.F(M.pet[2]); p.cap(P2(-10,-46+b),P2(-8,-34+b),5,5.6); p.F(M.pet[1]); p.cap(P2(-9.4,-45+b),P2(-7.6,-35+b),3.6,4); p.F(M.pet[0]); p.rect(-9.6,-43+b,1,6); p.F(M.bagblue[1]); p.rect(-11.4,-49.4+b,3.6,2.6);
      p.F(M.card[2]); p.poly([[-18,-42+b],[-11,-46+b],[-9.6,-35+b],[-16.6,-33+b]]); p.F(M.card[1]); p.poly([[-17,-41.4+b],[-12,-44.6+b],[-11,-36+b],[-16,-34.4+b]]); p.F(M.card[0]); p.rect(-15.4,-41+b,3,0.8);
      p.F(M.can[2]); p.poly([[-4,-42+b],[1.6,-43+b],[2,-34+b],[-3.6,-33.4+b]]); p.F(M.can[1]); p.poly([[-3.4,-41.6+b],[0.6,-42.4+b],[1,-34.6+b],[-3,-34+b]]); p.F(M.steel[0]); p.rect(-4,-43+b,5.8,1.2); p.F(M.can[0]); p.rect(-2.6,-40+b,1,5);
      p.F(R[3]); p.poly([[-20.4,-38+b],[1,-39.6+b],[3.4,-26+b],[3,-10+b],[-3,-3.4+b],[-17,-4.4+b],[-22,-13+b],[-22,-28+b]]);
      p.F(R[1]); p.poly([[-19.6,-37.4+b],[0.4,-39+b],[2.6,-26+b],[2.2,-10.6+b],[-3.4,-4.4+b],[-16.6,-5.2+b],[-21.2,-13.4+b],[-21.2,-28+b]]);
      p.F(X[2]); p.poly([[-19.6,-37.4+b],[-13,-37.8+b],[-13,-5+b],[-16.6,-5.2+b],[-21.2,-13.4+b],[-21.2,-28+b]]); p.F(R[2]); p.poly([[-19.6,-37.4+b],[-17,-37.6+b],[-17.4,-5.2+b],[-21.2,-13.4+b],[-21.2,-28+b]]);
      p.F(X[1]); p.poly([[-7,-38.4+b],[0.4,-39+b],[2,-28+b],[-5,-27+b]]); p.F(R[0]); p.poly([[-4,-38+b],[0,-38.4+b],[1,-31+b],[-3,-30.6+b]]);
      p.F(R[2]); for(let y=-34;y<-6;y+=3) p.rect(-20,y+b,22,0.7); p.F(X[2]); for(let x=-18;x<1;x+=3) p.rect(x,-37+b,0.7,31);
      p.F(M.bagblue[1]); p.poly([[-21.4,-22+b],[2.4,-23.4+b],[2.4,-19.4+b],[-21.4,-18+b]]); p.F(M.bagblue[0]); p.rect(-7,-23+b,8,0.8); p.F(M.bagblue[2]); p.rect(-21.4,-22+b,6,4);
      p.F(R[3]); p.poly([[-15,-12+b],[-9,-14+b],[-8,-12+b],[-14,-10+b]]); p.F(M.cord[1]); p.ell(-19.6,-37.6+b,2.6,1.8); p.cap(P2(-20,-37+b),P2(-23,-31+b),1.2,1);
      p.id(); },
    head:{brow:1.4,
      back:(p,M,P)=>{ const t=(P.flash?-3:0)+(P.mouth===2?-1.6:0); p.F(M.hair[1]); p.cap(P2(-8,-17),P2(-14+t,-8),5.6,4.8); p.cap(P2(-14+t,-8),P2(-15+t*1.4,0),4.8,2.4); p.F(M.hair[2]); p.cap(P2(-11,-12),P2(-14.6+t,-1),2.2,1.4); p.F(M.hair[0]); p.cap(P2(-10,-16),P2(-13+t,-10),1.4,1); },
      hair:(p,M)=>{ p.F(M.hair[1]); p.poly([[-8,-17.6],[-1.4,-17.6],[-0.4,-12],[-1.2,-9.6],[-5,-8.6],[-8,-12]]); p.poly([[2.6,-19.4],[7,-19.4],[6,-16.4],[3.4,-17]]); p.F(M.hair[0]); p.rect(-6,-15.6,2,0.8);
        p.F(M.gold[1]); p.ell(-3.2,-8,1.8,1.8); p.F(M.skin[2]); p.ell(-3.2,-8,0.8,0.8); p.F(M.gold[0]); p.rect(-4.4,-9.2,1,0.8); },
      hat:(p,M,P,{dome})=>{ const R=M.cap, X=M.capX; // boné com aba pra frente
        p.F(R[3]); p.poly(dome(2.4,-17.4,11.8,10.6,0,180,16).concat([[-9.6,-16.6]]));
        p.F(R[1]); p.poly(dome(2.4,-17.8,11.2,10,0,180,16));
        p.F(X[2]); p.poly(dome(2.4,-17.8,11.2,10,115,180,8).concat([[-3,-17.8]])); p.F(R[2]); p.poly(dome(2.4,-17.8,11.2,10,145,180,6).concat([[-6.4,-17.8]]));
        p.F(X[1]); p.poly([[2,-27.6],[8,-26.4],[12,-21.6],[12.8,-18],[6,-18.6],[3,-23]]); p.F(R[0]); p.poly([[3.6,-27.2],[7.6,-26],[10,-22.6],[5.6,-23.4]]);
        p.F(R[2]); p.rect(1.8,-27.8,0.9,10); p.F(R[0]); p.ell(2.2,-28,1.6,0.9);
        p.F(M.print[1]); p.rect(5.4,-24.4,4.6,3); p.F(M.print[3]); p.rect(6.2,-23.6,3,1.4);
        p.F(M.capbrim[1]); p.poly([[8,-18.6],[22,-17.4],[21,-14.8],[8.6,-16]]); p.F(M.capbrim[0]); p.rect(10,-18.2,10,0.9); p.F(M.capbrim[3]); p.poly([[8.6,-16],[21,-14.8],[20.2,-14],[9,-15.2]]); }},
    tools:{gancho}, toolFor:()=> 'gancho',
    anims:(A,{K_,G,S,th,sh})=>{
      // parada apoiada no gancho como bengala (ponta no chão, à frente)
      A.idle.nome='Parada (gancho de bengala)';
      A.idle.pose=i=>{ const p=i/8*Math.PI*2, s=S(p);
        return K_({lean:6+1.2*s,br:s,hx:1*S(p/2),head:1.4*S(p-0.7),lFh:24,lFk:4+2*s,lBh:-22,lBk:-24+2*s,aFs:58+1.5*s,aFe:64+1.5*s,bA:14+1*s,aBs:-6+2*s,aBe:30+3*s,backTarget:[11,-3+0.6*s],blink:i===5?1:0}); };
      A.walk.pose=i=>{ const p=i/8*Math.PI*2, c=Math.cos(p);
        return K_({plant:0,lFh:th(p,0),lFk:sh(p,0),lBh:th(p,Math.PI),lBk:sh(p,Math.PI),lean:6+1.4*S(2*p),head:S(2*p-0.6),aFs:40+14*S(p),aFe:46+10*S(p),bA:16+14*S(p),aBs:-6+20*S(p+Math.PI),aBe:10+22*S(p+Math.PI)}); };
    },
    special:({G})=>({n:8,hits:{2:1,5:2},dur:i=>[170,120,90,150,120,90,170,220][i],pose:i=>G([
      {aFs:-40,aFe:-10,bA:150,lean:-6,brow:2,mouth:1,lFh:30,lBh:-24,lBk:-34},
      {aFs:80,aFe:92,bA:96,lean:24,hx:10,brow:1,mouth:2,smear:1,sa:200,lFh:50,lFk:10,lBh:-32,lBk:-36},
      {aFs:90,aFe:96,bA:92,lean:28,hx:13,brow:1,mouth:2,can:1,impact:1,lFh:54,lFk:12,lBh:-32,lBk:-36},
      {aFs:40,aFe:120,bA:140,lean:-4,hx:4,brow:1,mouth:3,can:1,lFh:30,lBh:-24,lBk:-34},
      {aFs:160,aFe:196,bA:230,lean:-14,hx:2,brow:1,mouth:1,can:1,lFh:30,lBh:-22,lBk:-30},
      {aFs:150,aFe:170,bA:160,lean:-10,hx:2,mouth:3,brow:3,toss:1,smear:2,sa:240,lFh:30,lBh:-22,lBk:-30},
      {aFs:40,aFe:80,bA:110,lean:4,mouth:3,brow:3,toss:2,lFh:30,lBh:-22,lBk:-30},
      {aFs:30,aFe:76,bA:110,lean:4,mouth:3,brow:3,lFh:30,lBh:-22,lBk:-30}][i])}),
    fx:(p,M,sk,P)=>{ if(!P.toss) return; const c=sk.T(P.toss>=2?-18:-8,P.toss>=2?-58:-62); p.F(M.can[3]); p.poly([[c.x-5,c.y-6],[c.x+5,c.y-6.8],[c.x+5.6,c.y+5],[c.x-4.4,c.y+5.8]]); p.F(M.can[1]); p.poly([[c.x-4.4,c.y-5.4],[c.x+4.4,c.y-6.2],[c.x+5,c.y+4.4],[c.x-3.8,c.y+5.2]]); p.F(M.can[0]); p.rect(c.x+1,c.y-4,1.4,7); p.F(M.steel[0]); p.rect(c.x-4.6,c.y-7,9.4,1.6); p.F(M.smear[0]); p.rect(c.x+5,c.y-2,3,1); p.rect(c.x+4,c.y+2,2,1); },
    anchors:(cv,sk,sc)=>{ cv._bag=sc(sk.T(-15,-36)); },
    FX:{special:{hits:[2,5],word:'FISGOU!'}, combo:{words:['TOC!','TOC!','PAH!']}},
    NAMES:{skin:'Pele',hair:'Cabelo',cap:'Boné',top:'Camiseta desbotada',pants:'Bermuda jeans',glove:'Luva de borracha',sole:'Chinelo',bag:'Saco de ráfia',rust:'Vergalhão'},
  });
  // contrato da catadora: frame(skin, anim, fi[, step]) — sem parâmetro de ferramenta
  return Object.assign({},B,{HOOKLEN,frame:(skin,anim,fi,step=5)=>B.frame(skin,null,anim,fi,step)});
})();

/* ===== hub/agri ===== */
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

/* ===== hub/capo ===== */
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

/* ===== hub/enfe ===== */
/* ENFE — fonte de arte (editável). Build: npm run art */
/* Enfermeira hi-bit: jaleco com cruz, tênis, maleta e injeção gigante (especial: cura com brilho verde).
   Mesmo rig/proporção do HEROI e do VIGIA (base de luta baixa, 7–8 tons por região, sombra roxa, luz quente, contorno de 2 px embaixo). */
const ENFE=(function(){
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

  /* ---- ENFERMEIRA: jaleco branco com cruz, calça de pijama verde-água, tênis, luvas, maleta e injeção gigante ---- */
  const SKINS={media:{nome:'Pele média',hex:'#b07a52'}, escura:{nome:'Pele escura',hex:'#6e4430'}, clara:{nome:'Pele clara',hex:'#e2ae88'}};
  const BODY={f:1,FOOT:7.1};
  function mats(skin){
    const h=SKINS[skin].hex;
    return Object.assign({},BASEM,{
      skin:R4(h,1.15), skinX:RX(h,1.15),
      hair:R4('#3a2418',1.1), hairX:RX('#3a2418',1.1),
      top:R4('#eef4f2',1), topX:RX('#eef4f2',1),
      trim:R4('#2aa8a0',1.1), trimX:RX('#2aa8a0',1.1),
      pants:R4('#3aa8a4',1.05), pantsX:RX('#3aa8a4',1.05),
      cross:R4('#e0343c',1.1),
      glove:R4('#7aa8e8',1.05), gloveX:RX('#7aa8e8',1.05),
      shoe:R4('#f2f0ea',1), shoeX:RX('#f2f0ea',1), sole:['#ffffff','#e8e4dc','#b0aaa0','#6e6a64'],
      steth:['#6a7280','#2b3140','#1c202c','#0e1018'], metal:['#ffffff','#c8ccd4','#8a8ea0','#4a4e60'],
      kit:R4('#d8343a',1.1), kitX:RX('#d8343a',1.1), white:['#ffffff','#f0ece0','#b4ae9e','#6c6858'],
      glass:['#f4ffff','#c8eef0','#86b4c4','#4a6a80'], med:['#d8ffb0','#7ae05a','#2e9a3a','#14501c'],
      mask:['#e8fffa','#a8dcd4','#6aa6a0','#3a6a66'], pen:['#9ac4ff','#2a62d8','#183c8a','#0a1e4a'],
      heal:['#f0ffe0','#8af07a','#34b848','#147a2a'],
      trail:['#f0fff0','#b8f0a8','#5ab868','#2a6a34'],
    });
  }
  const NAMES={skin:'Pele',hair:'Cabelo',top:'Jaleco',trim:'Detalhes',pants:'Calça',glove:'Luvas',kit:'Maleta',cross:'Cruz'};
  const GUARD=Object.assign({inhand:1,tool:0},ST,K_({aFs:34,aFe:104,bA:156,aBs:46,aBe:112,lean:10,brow:1}));
  const G=o=>{ const r=K_(o); if(!r.nowide){ if(r.lFh!==undefined){ r.lFh+=14; r.lFk=(r.lFk||0)+3; } if(r.lBh!==undefined){ r.lBh-=12; r.lBk=(r.lBk!==undefined?r.lBk:-30)-10; } } delete r.nowide; return Object.assign({},GUARD,r); };
  // tool: 0 = maleta na mão da frente · 1 = injeção gigante (maleta vai pra mão de trás)
  const ANIMS=Object.assign({
    idle:{nome:'Parada',n:8,dur:()=>150,pose:i=>{ const p=i/8*Math.PI*2, s=S(p);
      return K_({tool:0,lean:2+1.2*s,br:s,hx:1.2*S(p/2),head:1.2*S(p-0.7),lFh:24,lFk:4+2*s,lBh:-20,lBk:-22+2*s,aFs:8+2*s,aFe:20+3*s,bA:4+5*S(p+0.8),bT:[11,-3],blink:i===5?1:0}); }},
    walk:{nome:'Andar',n:8,dur:()=>110,pose:i=>{ const p=i/8*Math.PI*2;
      return K_({tool:0,plant:0,lFh:th(p,0),lFk:shn(p,0),lBh:th(p,Math.PI),lBk:shn(p,Math.PI),lean:2+1.2*S(2*p),head:S(2*p-0.6),aFs:8-18*S(p),aFe:22-16*S(p),bA:6-22*S(p),aBs:-6+20*S(p),aBe:10+22*S(p)}); }},
    guard:{nome:'Guarda (maleta pronta)',n:8,dur:()=>125,pose:i=>{ const p=i/8*Math.PI*2, s=S(p); return Object.assign({},GUARD,K_({lean:10+1.2*s,aFs:34+3*s,aFe:104+4*s,bA:156+4*S(p+0.7),aBs:46+2*s,aBe:112+3*s,lFk:5+1.6*s,lBk:-38+1.6*s,head:-2+s,blink:i===6?1:0})); }},
    combo:{nome:'Combo: maletada · revés · injeção',n:12,hits:{2:1,6:2,10:3},dur:i=>[110,50,60,90,80,40,60,90,120,60,70,170][i],pose:i=>G([
      {tw:-0.3,aFs:-40,aFe:-120,bA:190,lean:-12,head:-4,hx:-4,lFh:22,lFk:0,lBh:-18,lBk:-28,aBs:40,aBe:100,mouth:1},
      {aFs:40,aFe:120,bA:168,lean:2,hx:1,lFh:30,lBh:-24,lBk:-34,aBs:20,aBe:60},
      {tw:0.85,aFs:84,aFe:94,bA:100,lean:28,hx:13,head:-12,mouth:2,smear:1,sa:205,aBs:-50,aBe:-20,lFh:50,lFk:10,lBh:-32,lBk:-36},
      {tw:0.7,aFs:62,aFe:46,bA:30,lean:28,hx:13,head:-10,mouth:1,aBs:-50,aBe:-10,lFh:50,lFk:10,lBh:-32,lBk:-36},
      {tw:-0.2,aFs:12,aFe:64,bA:-30,lean:4,hx:6,aBs:10,aBe:60,lFh:34,lFk:4,lBh:-26,lBk:-36},
      {aFs:44,aFe:84,bA:24,lean:2,hx:5,aBs:-10,aBe:30,lFh:36,lFk:6,lBh:-28,lBk:-38},
      {tw:0.8,aFs:128,aFe:150,bA:140,lean:-2,hx:12,head:-10,mouth:2,smear:2,sa:12,aBs:-60,aBe:-30,lFh:50,lFk:10,lBh:-32,lBk:-36},
      {tw:0.6,aFs:152,aFe:176,bA:180,lean:-6,hx:12,head:-12,mouth:1,aBs:-60,aBe:-40,lFh:50,lFk:10,lBh:-32,lBk:-36},
      {tool:1,tw:-0.4,aFs:-30,aFe:60,bA:96,lean:-10,hx:2,head:-4,brow:1,mouth:1,lFh:30,lBh:-22,lBk:-30,aBs:-40,aBe:-10},
      {tool:1,tw:-0.5,aFs:-50,aFe:70,bA:94,lean:-14,hx:0,head:-6,brow:1,mouth:1,lFh:28,lBh:-20,lBk:-30,aBs:-40,aBe:-10},
      {tool:1,tw:1,aFs:90,aFe:92,bA:92,lean:32,hx:17,head:-14,mouth:2,brow:1,smear:1,sa:120,impact:1,fx:1,lFh:54,lFk:12,lBh:-32,lBk:-36,aBs:-60,aBe:-30},
      {tool:1,tw:0.9,aFs:88,aFe:90,bA:92,lean:30,hx:16,head:-12,mouth:1,lFh:54,lFk:12,lBh:-32,lBk:-36,aBs:-50,aBe:-20}][i])},
    special:{nome:'Especial: Curativo de Plantão',n:8,dur:i=>[160,140,120,180,180,160,140,180][i],pose:i=>G([
      {tool:1,aFs:150,aFe:170,bA:180,lean:-6,head:-8,brow:1,mouth:1,lFh:30,lBh:-22,lBk:-30,aBs:30,aBe:80,nowide:1},
      {tool:1,aFs:166,aFe:176,bA:180,lean:-10,head:-12,brow:1,mouth:3,fx:2,lift:4,plant:0,lFh:20,lBh:-16,lBk:-20,aBs:-30,aBe:30,nowide:1},
      {tool:1,aFs:170,aFe:178,bA:180,lean:-10,head:-12,mouth:3,brow:3,fx:3,lFh:20,lBh:-16,lBk:-20,aBs:-40,aBe:20,nowide:1},
      {tool:1,aFs:168,aFe:176,bA:180,lean:-8,head:-10,mouth:3,brow:3,fx:4,lFh:22,lBh:-18,lBk:-22,aBs:-40,aBe:20,nowide:1},
      {tool:1,aFs:160,aFe:172,bA:178,lean:-6,head:-8,mouth:3,brow:3,fx:5,blink:2,lFh:22,lBh:-18,lBk:-22,aBs:-30,aBe:30,nowide:1},
      {tool:1,aFs:100,aFe:140,bA:150,lean:0,mouth:3,fx:6,lFh:26,lBh:-20,lBk:-26,aBs:0,aBe:40,nowide:1},
      {aFs:40,aFe:100,bA:150,lean:6,mouth:0,lFh:30,lBh:-22,lBk:-30},
      {lean:8,mouth:3}][i])},
    victory:{nome:'Vitória: maleta no alto e piscadinha',n:8,dur:i=>[140,90,90,90,120,160,200,400][i],pose:i=>K_([
      Object.assign({},GUARD,{lean:2,mouth:3,brow:3}),
      {tool:0,lFh:18,lFk:2,lBh:-16,lBk:-18,lean:-2,aFs:60,aFe:120,bA:200,aBs:-20,aBe:20,mouth:3,brow:3},
      {tool:0,lFh:18,lFk:2,lBh:-16,lBk:-18,lean:-4,aFs:100,aFe:150,bA:300,aBs:-20,aBe:20,mouth:3,brow:3,smear:1,sa:40},
      {tool:0,lFh:18,lFk:2,lBh:-16,lBk:-18,lean:-6,aFs:130,aFe:170,bA:400,aBs:-20,aBe:20,mouth:3,brow:3},
      {tool:0,lFh:20,lFk:4,lBh:-18,lBk:-20,lean:-6,head:-8,aFs:166,aFe:176,bA:180,bT:[11,-3],mouth:3,brow:3,lift:3,plant:0},
      {tool:0,lFh:20,lFk:4,lBh:-18,lBk:-20,lean:-6,head:-8,aFs:166,aFe:176,bA:180,bT:[11,-3],mouth:3,brow:3},
      {tool:0,lFh:20,lFk:4,lBh:-18,lBk:-20,lean:-4,head:-6,aFs:166,aFe:176,bA:180,bT:[11,-3],mouth:3,brow:3,blink:2},
      {tool:0,lFh:20,lFk:4,lBh:-18,lBk:-20,lean:-4,head:-6,aFs:166,aFe:176,bA:180,bT:[11,-3],mouth:3,brow:3,blink:2}][i])},
  },commonAnims(GUARD,G,()=>({tool:0,bA:20,aFs:-10,aFe:20})));
  Object.assign(ANIMS,STRIKES.tool(G,{names:{atkH:'Maletada lateral',atkV:'Maletada por cima',atkS:'Injeção (estocada)',atkSpin:'Giro da maleta',atkFin:'Maletada de baixo (lança)'},add:{atkS:{tool:1,fx:0}}}));
  ANIMS.atkS.hitsx={3:{m:1.3,reach:60}};
  Object.assign(ANIMS,MOVESET.kit(G,{}),MOVESET.sigs(G,{},[
    ['sigSedativo','stabStun','Injeção sedativa (atordoa)',{P:{tool:1,fx:0}}],
    ['sigMaleta','spinTornado','Maletada giratória']]));
  function poseOf(anim,i){ return Object.assign({},REST,ANIMS[anim].pose(i)); }
  /* ---- desenho ---- */
  function shoe(p,M,a,ang,sc){
    xfs(p.cx,ang,a.x,a.y,sc,sc);
    p.F(M.shoe[1]); p.poly([[-5,-4.4],[2.6,-4.6],[5,-1],[10.6,0.8],[12.6,3],[12.4,4.6],[-6,4.6],[-6.4,-0.6]]);
    p.F(M.shoeX[2]); p.poly([[-6.4,-0.6],[-5,-4.4],[0,-4.4],[-1,0],[0,4.6],[-6,4.6]]);
    p.F(M.shoe[2]); p.poly([[-6.4,-0.6],[-5,-4.4],[-2.4,-4.4],[-3.6,0],[-3,4.6],[-6,4.6]]); p.F(M.shoe[3]); p.rect(-6.4,1.6,1.4,3);
    p.F(M.shoe[0]); p.poly([[7.6,0.2],[10.6,0.8],[12.6,3],[12.4,3.6],[8,2.6]]);
    p.F(M.trim[1]); p.poly([[-1,1.6],[6,0.4],[7.6,1.4],[0,3]]); p.F(M.trim[2]); p.rect(-6,-4.4,3,1.2); p.F(M.trim[0]); p.rect(1,1.4,3,0.6);
    p.F(M.sole[1]); p.poly([[-6.6,3.6],[12.8,3.6],[13.4,5.2],[12.4,6.2],[-6.6,6.2]]); p.F(M.sole[2]); p.rect(-6.6,5.3,19,0.9); p.F(M.sole[0]); p.rect(-5,3.6,14,0.8); p.F(M.sole[3]); p.rect(-6.6,3.6,2.4,2.6);
    p.F(M.trim[2]); [[0.6,-3],[2.6,-1.8],[4.6,-0.6]].forEach(([x,y])=>p.rect(x,y,1.6,0.9));
    p.id();
  }
  // maleta de primeiros socorros: alça na mão, caixa com volume (frente + topo), cruz branca, cantoneiras e fechos
  function kit(p,M,w,dir,sz=1){
    xfs(p.cx,dir,w.x,w.y,1.2*sz,1.2*sz); const sc=1;
    p.F(M.steth[1]); p.rect(-1.6*sc,-3.6*sc,6*sc,1.6*sc); p.rect(-1.6*sc,2*sc,6*sc,1.6*sc);
    const x0=3.6*sc, x1=19*sc, hw=9.4*sc;
    p.F(M.kit[3]); p.rect(x0-0.6,-hw-0.6,x1-x0+1.2,hw*2+1.2);
    p.F(M.kit[1]); p.rect(x0,-hw,x1-x0,hw*2);
    p.F(M.kitX[2]); p.rect(x0,hw*0.2,x1-x0,hw*0.8); p.F(M.kit[2]); p.rect(x0,hw*0.6,x1-x0,hw*0.4);
    p.F(M.kitX[1]); p.rect(x0,-hw,x1-x0,hw*0.5); p.F(M.kit[0]); p.rect(x0,-hw,x1-x0,1); p.F(M.kitX[0]); p.rect(x0+2,-hw,4*sc,0.8);
    p.F(M.kit[3]); p.rect(x0,-0.4,x1-x0,0.8);
    const cx=(x0+x1)/2+0.6; p.F(M.white[2]); p.rect(cx-1.8*sc,-5.6*sc,3.6*sc,11.2*sc); p.rect(cx-5.6*sc,-1.8*sc,11.2*sc,3.6*sc);
    p.F(M.white[1]); p.rect(cx-1.6*sc,-5.4*sc,3.2*sc,10.4*sc); p.rect(cx-5.4*sc,-1.6*sc,10.4*sc,3.2*sc); p.F(M.white[0]); p.rect(cx-1.6*sc,-5.4*sc,3.2*sc,1);
    p.F(M.metal[2]); [[x0,-hw],[x0,hw-2.4*sc],[x1-2.4*sc,-hw],[x1-2.4*sc,hw-2.4*sc]].forEach(([x,y])=>p.rect(x,y,2.4*sc,2.4*sc)); p.F(M.metal[0]); p.rect(x0,-hw,2.4*sc,0.8);
    p.F(M.metal[1]); p.rect(x0+0.4,-3.4*sc,1.6*sc,1.8*sc); p.rect(x0+0.4,1.6*sc,1.6*sc,1.8*sc);
    p.id();
  }
  // injeção gigante: argola do êmbolo, haste, aba, seringa de vidro com remédio verde, agulha
  function syringe(p,M,w,dir){
    xfs(p.cx,dir,w.x,w.y,1.4,1.4);
    p.F(M.metal[3]); p.ell(-12,0,3.4,4.6); p.F(M.metal[1]); p.ell(-12,0,2.6,3.8); p.F(M.metal[3]); p.ell(-12,0,1.2,2.2);
    p.F(M.metal[2]); p.rect(-10,-1.4,12,2.8); p.F(M.metal[0]); p.rect(-10,-1.4,12,0.8);
    p.F(M.white[2]); p.rect(1,-7,2.4,14); p.F(M.white[0]); p.rect(1,-7,2.4,1);
    p.F(M.glass[3]); p.rect(3,-5.4,25,10.8); p.F(M.glass[1]); p.rect(3.6,-4.8,23.8,9.6);
    p.F(M.med[2]); p.rect(9,-4,18.4,8); p.F(M.med[1]); p.rect(9,-4,18.4,5.4); p.F(M.med[0]); p.rect(10,-3.4,12,1.2);
    p.F(M.glass[2]); p.rect(3.6,-1.8,5.4,3.6); p.F(M.white[3]); p.rect(8.4,-4.8,1,9.6);
    p.F(M.glass[0]); p.rect(4.6,-4.4,20,1); p.F(M.glass[3]); [12,16,20,24].forEach(x=>p.rect(x,2.4,0.8,2.4));
    p.F(M.white[1]); p.poly([[28,-4],[31.6,-1.6],[31.6,1.6],[28,4]]); p.F(M.white[2]); p.rect(28,1.6,3.6,1.2);
    p.F(M.metal[2]); p.poly([[31.6,-0.9],[46,-0.3],[46,0.3],[31.6,0.9]]); p.F(M.metal[0]); p.rect(31.6,-0.9,12,0.6);
    p.id();
  }
  function arm(p,M,sk,front,P){
    const sh=front?sk.shF:sk.shB, el=front?sk.elF:sk.elB, wr=front?sk.wrF:sk.wrB;
    armBase(p,M,sh,el,wr,{f:1,sleeve:'top',to:0.62,cuff:'trim',extra:(p,M,sh,el,wr)=>{
      vol(p,lerp(el,wr,0.62),wr,7,6.8,M.glove,M.gloveX,{l0:0.1,l1:0.9}); p.F(M.glove[0]); p.cap(lerp(el,wr,0.6),lerp(el,wr,0.66),8,7.8); p.F(M.glove[2]); p.cap(lerp(el,wr,0.66),lerp(el,wr,0.7),7.6,7.4);
      if(front){ const q=lerp(sh,el,0.3); p.F(M.cross[3]); p.rect(q.x-2.4,q.y-0.9,4.8,1.8); p.rect(q.x-0.9,q.y-2.4,1.8,4.8); p.F(M.cross[1]); p.rect(q.x-2,q.y-0.6,4,1.2); p.rect(q.x-0.6,q.y-2,1.2,4); } }});
    fist(p,M,el,wr,1,M.glove,M.gloveX);
  }
  function leg(p,M,sk,front,P){
    legBase(p,M,sk,front,P,{pants:'pants',FOOT:7.1,foot:shoe,extra:(p,M,hip,knee,ankle,front)=>{
      if(front){ const q=lerp(hip,knee,0.48), ang=Math.atan2(knee.y-hip.y,knee.x-hip.x); p.xf(ang,q.x,q.y); p.F(M.pants[3]); p.rect(-3.8,-0.6,7.6,6); p.F(M.pants[1]); p.rect(-3.2,0,6.4,4.8); p.F(M.pantsX[1]); p.rect(-3.2,0,6.4,1.2); p.F(M.pants[0]); p.rect(-3.8,-1.4,7.6,1.2); p.id(); }
    }});
  }
  function torso(p,M,sk,P){
    const R=M.top, X=M.topX;
    torsoBase(p,M,sk,R,X);
    folds(p,R,X);
    p.F(R[1]); p.poly([[3.6,-19.6],[9.6,-19.4],[9,-17.6],[4,-17.8]]); p.F(R[3]); p.poly([[-2,-15],[9.6,-15.4],[9.4,-14.4],[-1,-14]]);
    // decote em V com vivo verde-água + máscara no pescoço
    p.F(M.skin[1]); p.poly([[-1.4,-31],[5.6,-31],[2.6,-24]]); p.F(M.skin[2]); p.poly([[-1.4,-31],[0.6,-31],[2.2,-25.6]]);
    p.F(M.trim[1]); p.poly([[-2.8,-31.4],[-1.4,-31],[2.6,-24],[1.8,-23]]); p.poly([[7,-31.4],[5.6,-31],[2.6,-24],[3.4,-23]]); p.F(M.trim[0]); p.rect(-2.4,-31.6,2,0.7);
    p.F(M.mask[1]); p.poly([[-2.4,-32.4],[6.6,-32.6],[6,-29.6],[-1.6,-29.4]]); p.F(M.mask[2]); p.rect(-1.6,-30.6,7.4,0.7); p.F(M.mask[0]); p.rect(-1.4,-32.2,6,0.7);
    // cruz vermelha no peito, bolso com canetas, crachá
    p.F(M.cross[3]); p.rect(4.2,-24.6,5.6,2.2); p.rect(5.9,-26.3,2.2,5.6); p.F(M.cross[1]); p.rect(4.6,-24.2,4.8,1.4); p.rect(6.3,-25.9,1.4,4.8); p.F(M.cross[0]); p.rect(6.3,-25.9,1.4,1);
    p.F(R[3]); p.rect(-7.4,-18,6,6.4); p.F(R[2]); p.rect(-6.8,-16.6,4.8,4.6); p.F(M.trim[1]); p.rect(-7.6,-18.4,6.4,1.4);
    p.F(M.pen[1]); p.rect(-6.4,-20.4,1,3); p.F(M.cross[1]); p.rect(-4.4,-20,1,2.6); p.F(M.metal[1]); p.rect(-6.4,-20.4,1,0.8);
    p.F(M.trim[2]); p.rect(2.4,-23.4,0.7,5); p.F(M.white[1]); p.rect(0.6,-18.6,4.4,5.4); p.F(M.trim[1]); p.rect(0.6,-18.6,4.4,1.2); p.F(M.white[2]); p.rect(1.2,-16.4,3,0.6); p.rect(1.2,-15,2.4,0.6);
    // estetoscópio pendurado
    p.F(M.steth[1]); p.cap(P2(-3.4,-30.6),P2(-4.6,-20),1.4,1.4); p.cap(P2(7,-30.6),P2(9.4,-16),1.4,1.4); p.F(M.metal[2]); p.ell(9.6,-14.6,2.4,2.4); p.F(M.metal[0]); p.ell(9,-15.4,1,0.9); p.F(M.metal[1]); p.rect(-5.4,-20.4,2,1);
    // barra do jaleco com vivo, amarração na cintura
    p.F(M.pants[1]); p.poly([[-10.2,-1],[9.8,-1],[10.2,4.4],[-10.4,4.4]]); p.F(M.pantsX[2]); p.poly([[-10.2,-1],[-2,-1],[-1.6,4.4],[-10.4,4.4]]);
    p.F(R[1]); p.poly([[-10.4,-6],[9.8,-6],[10.6,1.6],[-10.8,1.6]]); p.F(X[2]); p.poly([[-10.4,-6],[-2,-6],[-1.6,1.6],[-10.8,1.6]]); p.F(R[2]); p.poly([[-10.4,-6],[-6,-6],[-5.6,1.6],[-10.8,1.6]]);
    p.F(M.trim[1]); p.rect(-10.8,0.8,21.4,1.4); p.F(M.trim[2]); p.rect(-10.8,1.8,21.4,0.6);
    p.F(R[2]); p.rect(-10.4,-6.4,20.2,1); p.F(M.trim[1]); p.poly([[5,-6.6],[9,-6.6],[9.6,-4.6],[5.4,-4.6]]); p.cap(P2(7,-5),P2(8.6,1),1.2,1);
    p.id();
  }
  function hairBack(p,M,sk){
    xfs(p.cx,sk.ha,sk.neck.x,sk.neck.y,HS,HS);
    // coque alto com xuxinha
    p.F(M.hair[1]); p.ell(-6.4,-23.4,6,5.2); p.F(M.hair[2]); p.ell(-7.6,-21.6,3.8,2.8); p.F(M.hair[0]); p.ell(-5,-26,2.6,1.2);
    p.F(M.hairX[2]); p.cap(P2(-10,-24),P2(-4,-19.6),0.8,0.8); p.F(M.trim[1]); p.rect(-3.6,-22,2.6,3.6); p.F(M.trim[0]); p.rect(-3.6,-22,2.6,0.8);
    p.id();
  }
  function hairFront(p,M,P){
    p.F(M.hair[1]); p.poly(dome(2.6,-15,10.8,11,30,200,14).concat([[-6,-6.6],[-3,-9],[-1.6,-14],[1,-18],[4,-19.8],[8,-19.2],[11,-17.8],[13.2,-17.6]])); p.poly([[-0.4,-15.4],[1.2,-15.4],[1,-10.4],[-0.6,-10]]);
    p.F(M.hair[2]); p.poly([[1,-18],[4,-19.8],[1.6,-24],[0,-24]]); p.poly([[-8.6,-9],[-6,-6.6],[-3,-9],[-5,-14]]);
    p.F(M.hair[0]); p.poly([[3.6,-24.6],[9,-23.4],[11,-20.6],[6,-22.4]]); p.poly([[-5.6,-21],[-3,-23.6],[-2.4,-22.6],[-4.8,-19.6]]);
    // franja de lado
    p.F(M.hair[1]); p.poly([[4,-20],[12.8,-19],[13.6,-15.6],[10,-17.4],[6,-17]]); p.F(M.hairX[2]); p.rect(9,-18,3,0.7);
    // touca de enfermeira com cruz
    p.F(M.white[3]); p.poly([[-5.4,-23.4],[0,-28.6],[8.6,-28],[11.6,-22.6],[2,-24.2]]);
    p.F(M.white[1]); p.poly([[-4.6,-23.6],[0,-28],[8.2,-27.4],[10.8,-23],[2,-24.6]]);
    p.F(M.white[2]); p.poly([[-4.6,-23.6],[2,-24.6],[10.8,-23],[10.6,-22],[2,-23.6],[-4.4,-22.6]]); p.F(M.white[0]); p.rect(1,-27.6,6,0.8);
    p.F(M.cross[1]); p.rect(3.2,-27,1.6,4.2); p.rect(2,-25.8,4,1.6); p.F(M.cross[0]); p.rect(3.2,-27,1.6,0.7);
    // brinquinho
    p.F(M.trim[0]); p.rect(-3.6,-9.6,1,1);
  }
  // FX: respingo verde (injeção) e cura (anel, cruzes e brilhos subindo)
  function healFX(p,M,sk,P,tip){
    p.id(); const k=Math.round(P.fx), H=M.heal;
    if(P.tool>=0.5 && P.impact>=0.5){ star(p,tip,12,H[1],H[0]); [[6,-6],[9,2],[4,7]].forEach(([dx,dy])=>{ p.F(H[1]); p.ell(tip.x+dx,tip.y+dy,1.6,1.2); }); return; }
    if(k<2) return;
    const c={x:sk.hip.x+2,y:GROUND-2}, t=(k-2)/4, R=22+t*30;
    const ring=(rx,ry,w,col)=>{ p.F(col); for(let j=0;j<40;j++){ const a0=j/40*Math.PI*2, a1=(j+1)/40*Math.PI*2; p.cap({x:c.x+Math.cos(a0)*rx,y:c.y+Math.sin(a0)*ry},{x:c.x+Math.cos(a1)*rx,y:c.y+Math.sin(a1)*ry},w,w); } };
    ring(R,5+t*2,3.4,H[3]); ring(R,5+t*2,2.2,H[1]); ring(R*0.7,3.4+t,1.2,H[0]);
    if(k===2){ const g=lp(sk.wrF,P.aFe+P.bat,62); p.F(H[2]); p.circle(g,8); p.F(H[1]); p.circle(g,5.4); p.F(H[0]); p.circle(g,2.6); star(p,g,14,H[1],H[0]); }
    const cr=(x,y,s)=>{ p.F(H[3]); p.rect(x-s*1.5-0.6,y-s*0.5-0.6,s*3+1.2,s+1.2); p.rect(x-s*0.5-0.6,y-s*1.5-0.6,s+1.2,s*3+1.2); p.F(H[1]); p.rect(x-s*1.5,y-s*0.5,s*3,s); p.rect(x-s*0.5,y-s*1.5,s,s*3); p.F(H[0]); p.rect(x-s*0.5,y-s*0.5,s,s); };
    [[-24,-20],[20,-34],[-8,-58],[28,-62],[-30,-46],[8,-82]].forEach(([dx,dy],j)=>{ const up=(k-2)*9+j*3; if(j>k) return; cr(c.x+dx,c.y+dy-up,j%2?2:2.6); });
    [[-16,-30],[14,-18],[0,-70],[24,-44]].forEach(([dx,dy],j)=>{ const up=(k-2)*7; p.F(H[0]); p.rect(c.x+dx,c.y+dy-up,1.2,1.2); p.F(H[1]); p.rect(c.x+dx-1.6,c.y+dy-up+0.2,1,0.8); p.rect(c.x+dx+1.8,c.y+dy-up+0.2,1,0.8); });
  }
  const cache=PIX.cache();
  function frame(skin,anim,fi,step=5){
    const K=PIX.getK(); if(!ANIMS[anim]) anim='idle'; const key=skin+anim+fi+step+'@'+K; if(cache.has(key)) return cache.get(key);
    if(cache.size>600) cache.delete(cache.keys().next().value);
    const P=poseOf(anim,fi), M=mats(skin), sk=skeleton(P,BODY), syr=P.tool>=0.5, d=sk.bDir;
    const tip=syr?{x:sk.wrF.x+Math.cos(d)*64,y:sk.wrF.y+Math.sin(d)*64}:{x:sk.wrF.x+Math.cos(d)*24,y:sk.wrF.y+Math.sin(d)*24};
    const parts=[
      {back:true, draw:(c,u)=>arm(pen(c,u),M,sk,false,P)},
      {back:true, draw:(c,u)=>leg(pen(c,u),M,sk,false,P)},
      {draw:(c,u)=>hairBack(pen(c,u),M,sk)},
      {draw:(c,u)=>torso(pen(c,u),M,sk,P)},
      {draw:(c,u)=>leg(pen(c,u),M,sk,true,P)},
      {draw:(c,u)=>face(pen(c,u),M,sk,P,{front:hairFront,brow:1.4})},
    ];
    if(syr) parts.splice(1,0,{back:true,draw:(c,u)=>{ const p=pen(c,u); kit(p,M,sk.wrB,Math.PI/2+rad(sk.ro),0.82); fist(p,M,sk.elB,sk.wrB,1,M.glove,M.gloveX); }});
    parts.push({draw:(c,u)=>{ const p=pen(c,u); if(syr) syringe(p,M,sk.wrF,d); else kit(p,M,sk.wrF,d); }});
    const kt=P.kick?MOVESET.kickTip(sk,P):null;
    if(P.smear>=0.5) parts.push({noShade:true,smear:true,draw:(c,u)=>kt?MOVESET.kickSmear(pen(c,u),M,sk,P):smearArc(pen(c,u),M,sk.shF,tip,P.sa,P.smear>=2.5?22:15)});
    parts.push({draw:(c,u)=>arm(pen(c,u),M,sk,true,P)});
    if(P.fx>=0.5) parts.push({noShade:true,smear:true,draw:(c,u)=>healFX(pen(c,u),M,sk,P,tip)});
    if(P.impact>=0.5 && (!syr||kt)) parts.push({noShade:true,smear:true,draw:(c,u)=>{ const p=pen(c,u); p.id(); star(p,kt||tip,P.impact>=2?14:11,M.smear[1],M.smear[0]); }});
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash>=0.5,rim:RIM}); if(step>=4) thick(cv);
    const sc=q=>({x:q.x*K,y:q.y*K});
    cv._tip=sc(tip); cv._hand=sc(sk.wrF); cv._mouth=sc(sk.H(16,-5)); cv._head=sc(sk.H(4.5,-33.6)); cv._hip=sc(sk.hip);
    cache.set(key,cv); return cv;
  }
  return {FW,FH,GROUND,AX,SKINS,ANIMS,NAMES,poseOf,frame,mats};
})();

/* ===== hub/petcore ===== */
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

/* ===== hub/pet_cachorro ===== */
/* ===== PET: Cachorro (vira-lata caramelo) ===== */
/* PET_CACHORRO — fonte de arte (editável). Build: npm run art */
/* Chibi hi-bit: cabeça grande 3/4 com dois olhos brilhantes, focinho creme, orelha semicaída, lenço vermelho
   com plaquinha. Pelo em 8 tons (R4+RX), sombra roxa grande, luz quente de cima-frente, rim da lua. */
const PET_CACHORRO=(function(){
  const {rad,lerp,P2}=PIX, C=PETCORE;
  const FW=100, FH=84, GROUND=78, AX=50, RIM='#a9c8f0';
  const CFG={AX,GROUND,bodyY:52,shX:10,hipX:-11,fl:[6.2,6.2],hl:[6.4,6.6],neck:[13,-5],tailRoot:[-17,-4],paw:1.6,legY:4,
    hull:[[-15,6.5,0.5],[0,8.6,0],[11,8.4,0]]};
  const VARS={
    caramelo:{nome:'Caramelo',fur:'#d48a3a',cream:'#f6dcaa',muz:'#f6dcaa',brow:'#f6dcaa',ear:'#a85e2a'},
    malhado:{nome:'Malhado P&B',fur:'#ece6da',cream:'#ffffff',muz:'#ffffff',brow:null,ear:'#2e2a34',spots:'#2e2a34'},
    pretinho:{nome:'Pretinho',fur:'#3a3440',cream:'#c98e52',muz:'#c98e52',brow:'#d49a5a',ear:'#2a2430'},
  };
  const mcache={};
  function mats(v){ if(mcache[v]) return mcache[v]; const V=VARS[v]||VARS.caramelo, M={};
    C.mat(M,'fur',V.fur); C.mat(M,'cream',V.cream); C.mat(M,'ear',V.ear,1.05);
    if(V.spots) C.mat(M,'spot',V.spots,1);
    C.mat(M,'nose','#3a2630',1); C.mat(M,'mouth','#5a1e30',1.1); C.mat(M,'tongue','#ef7a8a',1.1);
    C.mat(M,'band','#c8283c',1.1); C.mat(M,'tag','#e2c46a',1.1); C.mat(M,'iris','#8a5420',1.2); C.mat(M,'paw',V.cream===V.fur?V.fur:V.cream);
    M.ink=['#2a1620','#1a0c14','#120810','#0a0408'];
    return (mcache[v]=M); }
  const NAMES={fur:'Pelo',cream:'Creme',band:'Lenço',tongue:'Língua',nose:'Focinho'};
  const S=Math.sin, Cc=Math.cos, TAU=Math.PI*2;
  const REST={bx:0,by:0,tilt:0,head:0,jaw:4,tongue:1,tail:52,curl:18,ear:0,earF:0,fN:[3,-2],fF:[-3,-5],bN:[16,-14],bF:[11,-18],eye:'open',flash:0,brow:0,fx:null,fxt:0,free:0};
  const gait=(p)=>{ const fl=ph=>{ const h=4+20*S(ph); return [h,h-26*Math.max(0,Cc(ph))-2]; };
    const hl=ph=>{ const h=14+16*S(ph); return [h,h-30-12*Math.max(0,-Cc(ph))]; };
    return {fN:fl(p),bF:hl(p),fF:fl(p+Math.PI),bN:hl(p+Math.PI)}; };
  const SIT={tilt:-30,head:26,fN:[-6,-2],fF:[-10,-4],bN:[78,-72],bF:[72,-76]};
  const LIE={fN:[84,92],fF:[78,90],bN:[88,-96],bF:[84,-100],tail:-10,curl:-4};
  const ANIMS={
    idle:{nome:'Parado',n:8,dur:()=>150,pose:i=>{ const p=i/8*TAU, s=S(p);
      return {by:-0.5*s,head:1.6*S(p-0.6),jaw:5+3*S(2*p),tongue:1,tail:50+18*S(2*p),curl:18+4*S(2*p),earF:i===3?-10:(i===4?-4:0),ear:i===3?-4:0,eye:i===6?'closed':(i===5||i===7?'half':'open')}; }},
    walk:{nome:'Trotar',n:8,dur:()=>90,pose:i=>{ const p=i/8*TAU;
      return Object.assign(gait(p),{by:-1.2*Math.abs(S(2*p)),tilt:1.5*S(2*p),head:-2*S(2*p),tail:52+16*S(2*p),jaw:8,tongue:1,ear:-2+2*S(2*p),earF:-3*S(2*p)}); }},
    run:{nome:'Correr',n:6,dur:()=>70,pose:i=>{ const p=i/6*TAU, s=S(p), c=Cc(p);
      const f=o=>{ const h=12+44*S(p+o); return [h,h-8-44*Math.max(0,Cc(p+o))]; }, b=o=>{ const h=6-40*S(p+o); return [h,h-34-30*Math.max(0,Cc(p+o))]; };
      return {fN:f(0),fF:f(0.6),bN:b(0.9),bF:b(1.5),lift:3.5*Math.max(0,c),tilt:7*s,head:-6-4*s,ear:-10,earF:-14,tail:20+10*S(2*p),curl:6,jaw:12,tongue:2,bx:1}; }},
    sit:{nome:'Sentado',n:8,dur:()=>160,pose:i=>{ const p=i/8*TAU;
      return Object.assign({},SIT,{by:-0.4*S(p),head:SIT.head+2*S(p-0.5),tail:24+12*S(2*p),curl:-16,jaw:4+2*S(2*p),tongue:1,eye:i===5?'closed':'open',earF:i===2?-8:0}); }},
    lie:{nome:'Deitado',n:8,dur:()=>200,pose:i=>{ const p=i/8*TAU;
      return Object.assign({},LIE,{by:-0.3*S(p),head:6+1.5*S(p),jaw:3+2*S(p),tongue:1,tail:-8+8*S(2*p),eye:i===4?'closed':(i===3||i===5?'half':'open')}); }},
    sleep:{nome:'Dormir',n:8,dur:()=>230,pose:i=>{ const p=i/8*TAU;
      return Object.assign({},LIE,{by:-0.5*S(p)+0.4,head:22,jaw:0,tongue:0,eye:'sleep',ear:4,earF:8,tail:-30,curl:-24,fx:'zzz',fxt:i/8}); }},
    happy:{nome:'Feliz (pulinho)',n:8,dur:i=>[90,80,80,90,110,80,80,100][i],pose:i=>{ const p=i/8*TAU, up=Math.max(0,S(p));
      return {lift:12*up,by:(i===0?1.2:0),tilt:-10*up,head:-8*up+4,fN:[20+40*up,-10+30*up],fF:[14+36*up,-14+30*up],bN:[16+14*up,-14-20*up],bF:[12+14*up,-18-20*up],
        tail:62+22*S(4*p),curl:22,jaw:14,tongue:2,eye:'happy',ear:-6+6*up,earF:-12*up,fx:'heart',fxt:i/8}; }},
    bark:{nome:'Latir',n:6,dur:i=>[150,110,90,170,90,170][i],pose:i=>[
      {by:1,head:6,ear:4,earF:4,jaw:0,tongue:0,tail:60},
      {bx:-2,tilt:-6,head:-6,ear:-6,earF:-10,jaw:4,tongue:0,tail:70,brow:1},
      {bx:2,tilt:-8,head:-16,ear:-10,earF:-16,jaw:30,tongue:0,tail:76,eye:'wide',by:-2,fN:[30,10],fx:'bark',fxt:0},
      {bx:2,tilt:-6,head:-12,ear:-8,earF:-12,jaw:24,tongue:0,tail:72,eye:'wide',by:-1,fN:[24,8],fx:'bark',fxt:0.5},
      {bx:1,tilt:-4,head:-8,ear:-6,earF:-8,jaw:20,tongue:0,tail:66,fx:'bark',fxt:0.8},
      {head:0,jaw:6,tail:58}][i]},
    attack:{nome:'Mordida',n:5,dur:i=>[140,200,70,140,160][i],pose:i=>[
      {brow:1,ear:4,head:6,jaw:2,tongue:0,eye:'angry'},
      {brow:1,bx:-5,tilt:7,head:12,jaw:8,tongue:0,ear:-8,earF:-10,fN:[-6,-10],bN:[24,-10],tail:20,eye:'angry'},
      {brow:1,bx:9,tilt:-12,head:-6,jaw:34,tongue:0,fN:[62,40],fF:[50,30],bN:[-14,-34],bF:[-22,-40],ear:-12,earF:-16,eye:'angry'},
      {brow:1,bx:11,tilt:-4,head:2,jaw:0,tongue:0,fN:[30,10],fF:[20,6],eye:'angry'},
      {bx:4,jaw:6}][i]},
    special:{nome:'Latido de alerta',n:6,dur:i=>[160,160,200,220,160,160][i],pose:i=>[
      {ear:6,head:-4,tail:60,eye:'wide'},
      {ear:-8,earF:-10,tilt:-6,head:-10,tail:72,jaw:2,tongue:0,by:-1,eye:'wide'},
      {ear:-12,earF:-16,tilt:-8,head:-16,tail:74,jaw:28,tongue:0,by:-2,eye:'wide',fx:'bark',fxt:0},
      {ear:-12,earF:-16,tilt:-12,head:-20,tail:78,jaw:32,tongue:0,by:-3,fN:[46,24],eye:'wide',fx:'bark',fxt:0.6},
      {ear:-6,tilt:-4,head:-8,tail:64,jaw:8},
      {}][i]},
    hurt:{nome:'Dano',n:4,dur:i=>[80,130,130,160][i],pose:i=>[
      {flash:1,eye:'closed',bx:-3},
      {bx:-6,head:-20,tilt:6,ear:10,earF:12,eye:'closed',tail:-50,curl:-10,fN:[30,10],jaw:10,tongue:0},
      {bx:-5,head:-10,tilt:4,eye:'half',tail:-40,curl:-8},
      {bx:-2}][i]},
    ko:{nome:'Desmaio',n:6,dur:i=>[80,180,160,140,120,600][i],pose:i=>[
      {flash:1,eye:'closed'},
      {eye:'x',head:-12,tilt:-8,bx:-3,jaw:14,tongue:2},
      {eye:'x',head:8,tilt:6,by:2,fN:[30,30],bN:[-10,-30],jaw:14,tongue:2},
      Object.assign({},LIE,{eye:'x',head:16,jaw:14,tongue:2,tail:-6,curl:0,ear:8,earF:12}),
      Object.assign({},LIE,{eye:'x',head:18,jaw:14,tongue:2,tail:-6,curl:0,by:0.4,ear:8,earF:12}),
      Object.assign({},LIE,{eye:'x',head:16,jaw:14,tongue:2,tail:-6,curl:0,ear:8,earF:12})][i]},
  };
  function poseOf(anim,i){ const A=ANIMS[anim]||ANIMS.idle; return Object.assign({},REST,A.pose(i%A.n)); }

  /* ---------- desenho ---------- */
  const BODY=[['e',0,0,13,8.6],['e',10,-1,8.4,9],['e',-10,0,8.2,8.2]];
  function drawBody(p,M,sk,V){ p.xf(sk.a,sk.base.x,sk.base.y);
    C.shade(p,BODY,M.fur,M.furX,9,{c:P2(2,-2)});
    // barriga e peito creme, recortados no corpo
    C.within(p,BODY,()=>{ C.shade(p,[['e',2,9,15,4.6],['e',15,4,6.4,8]],M.cream,M.creamX,5,{spec:false}); });
    if(V.spots){ C.within(p,BODY,()=>{ C.shade(p,[['e',-9,-4,6,5.4]],M.spot,M.spotX,5,{spec:false}); C.shade(p,[['e',4,-6,4.6,3.4]],M.spot,M.spotX,4,{spec:false}); }); }
    // fios de pelo e dobra das costelas
    C.strand(p,M.furX[2],P2(-4,-2),P2(-1,3),0.8); C.strand(p,M.furX[2],P2(1,-3),P2(3,2.4),0.8);
    C.strand(p,M.fur[0],P2(-6,-7.4),P2(4,-8.2),0.7); C.strand(p,M.furX[0],P2(-2,-8),P2(2,-8.4),0.6);
    // tufo do peito
    C.tufts(p,[P2(19,-1),P2(17.6,5),P2(13,9)],1.6,M.cream[1],2);
    C.tufts(p,[P2(-6,8.4),P2(6,8.8)],1.2,M.cream[2],3);
    p.id(); }
  function drawHaunch(p,M,sk,V){ const r=sk.legs.bN.root; p.id();
    C.shade(p,[['e',r.x+0.6,r.y-2.2,5.6,6.4,-0.3]],M.fur,M.furX,6,{spec:false});
    C.strand(p,M.furX[2],P2(r.x-3,r.y-1),P2(r.x-1.6,r.y+3),0.7); }
  function drawHead(p,M,sk,P,V){ p.xf(sk.ha,sk.neck.x,sk.neck.y);
    const SK=[['e',1.6,-8.4,9.6,8.2],['e',4.6,-3.6,7.2,4.6]];
    C.shade(p,SK,M.fur,M.furX,8.6,{c:P2(2.4,-8)});
    if(V.spots) C.within(p,SK,()=>C.shade(p,[['e',-2.6,-11,5.4,5]],M.spot,M.spotX,4,{spec:false}));
    // bochecha creme e tufo
    C.within(p,SK,()=>C.shade(p,[['e',6.4,-2,6.4,3.6]],M.cream,M.creamX,4,{spec:false}));
    C.tufts(p,[P2(-6.8,-5),P2(-4,-0.6),P2(0,0.8)],1.6,M.fur[1],2);
    C.tufts(p,[P2(-1,-16.2),P2(4,-16.4)],1.2,M.furX[1],2);
    // olho de trás (3/4)
    C.eye(p,10.6,-10.4,1.45,2.0,P.eye,M.iris,M.ink[1],{lid:M.fur[2]});
    // focinho
    C.shade(p,[['e',11,-5.6,5.8,3.8],['e',8,-7.4,4,2.6]],V.muz===V.cream?M.cream:M.cream,M.creamX,4,{c:P2(10.4,-6)});
    p.F(M.creamX[2]); p.rect(7,-2.4,6,0.8);
    // nariz
    C.shade(p,[['e',15.6,-7,2.4,1.8]],M.nose,M.noseX,2.2);
    p.F('#fffbf0'); p.rect(15.6,-8.2,1,0.7);
    p.F(M.mouth[2]); p.rect(15,-5.4,0.8,1.6); p.poly([[11.4,-3.4],[15.4,-4],[15.4,-3.4],[11.6,-2.8]]);
    // olho da frente grande
    C.eye(p,4.8,-9.8,2.1,2.5,P.eye,M.iris,M.ink[1],{lid:M.fur[2]});
    // sobrancelha "quatro olhos" e bochecha rosada
    if(V.brow){ p.F(P.brow?M.creamX[2]:M.cream[1]); if(P.brow) p.poly([[2.4,-14.4],[7,-12.6],[6.8,-12],[2.4,-13.4]]); else p.ell(4.4,-13.6,1.6,0.9); }
    else if(P.brow){ p.F(M.furX[3]); p.poly([[2.4,-14.4],[7,-12.6],[6.8,-12],[2.4,-13.4]]); }
    if(P.eye==='happy'||P.eye==='open') { p.F(M.tongueX[0]); p.ell(6.6,-5.6,1.6,0.8); }
    // orelha da frente (semicaída, ponta dobrada)
    const e=rad(P.ear*3+P.earF*2), q=sk.H(-3.4,-13.8); p.xf(sk.ha+e-0.15,q.x,q.y);
    C.shade(p,[['p',[[-3.6,1.4],[3.6,0.8],[1.6,-7],[-0.6,-7.6]]]],M.ear,M.earX,4,{c:P2(0,-3),spec:false});
    p.F(M.tongueX[2]); p.poly([[-1.6,0.6],[1.8,0.2],[0.6,-4.6]]); p.F(M.tongue[2]); p.poly([[-0.6,0.4],[1,0.2],[0.4,-2.6]]);
    if(P.earF>-6){ p.F(M.earX[2]); p.poly([[0.4,-7.4],[4.4,-5.4],[1.8,-4.2]]); p.F(M.ear[1]); p.poly([[0.8,-7.2],[3.6,-5.6],[1.8,-5]]); }
    p.id(); }
  function drawEarFar(p,M,sk,P){ const q=sk.H(1.4,-15); p.xf(sk.ha+rad(P.ear*2+P.earF*1.4)+0.15,q.x,q.y);
    C.shade(p,[['p',[[-3,1],[3,0.6],[0.8,-7]]]],M.ear,M.earX,3,{lite:false}); p.id(); }
  function drawJaw(p,M,sk,P){ const h=sk.H(6,-3.4); p.xf(sk.ha+rad(P.jaw),h.x,h.y);
    p.F(M.mouth[2]); p.poly([[-0.6,-1.6],[9.4,-2.2],[9.6,1.4],[0.4,1.8]]);
    p.F(M.mouth[3]); p.poly([[0,-0.6],[8,-1.4],[8,0],[1,0.8]]);
    C.shade(p,[['p',[[0,0.2],[9.4,-0.4],[9.2,2.2],[6,3.6],[1,3.2]]]],M.cream,M.creamX,2.4,{spec:false,c:P2(5,1.6)});
    p.F('#fffbf0'); p.rect(8.2,-1,0.9,1.2); if(P.jaw>14) p.rect(2,-0.8,0.8,1);
    if(P.tongue){ const Lg=P.tongue>1?8.6:5.6; C.shade(p,[['p',[[3.6,0.4],[8,0.2],[8.4,Lg-1],[6.2,Lg+0.6],[4.2,Lg-0.6]]]],M.tongue,M.tongueX,2.4,{spec:false,c:P2(6,Lg/2)});
      p.F(M.tongue[2]); p.rect(6,1.2,0.7,Lg-2.4); }
    p.id(); }
  function drawBandana(p,M,sk){ p.xf(sk.a,sk.base.x,sk.base.y);
    C.shade(p,[['p',[[10.6,-9.6],[19.4,-7],[20.4,-4.4],[16,4.6],[12,-3]]]],M.band,M.bandX,4,{c:P2(15,-4),spec:false});
    p.F(M.bandX[3]); p.poly([[10.6,-9.6],[20,-6.6],[20.2,-5.4],[10.8,-8.2]]);
    p.F(M.bandX[0]); p.rect(14.6,-5,1,1); p.rect(17,-2.4,1,1); p.rect(15.4,0.6,0.9,0.9); p.F(M.band[0]); p.rect(13,-6.4,1.4,0.8);
    C.shade(p,[['e',16.4,6.4,1.9,2]],M.tag,M.tagX,2); p.F(M.tagX[3]); p.rect(16.2,5.6,0.6,1.6);
    p.id(); }
  function drawFx(p,P,sk){ p.id(); const F=C.FXC, h=sk.H(4,-20);
    if(P.fx==='zzz'){ const t=P.fxt; [0,0.34,0.67].forEach((o,k)=>{ const u=(t+o)%1; C.zzz(p,h.x+2+u*8+k,h.y-1-u*14,2.4+u*2.4,F.z); }); }
    if(P.fx==='heart'){ const t=P.fxt; [0,0.5].forEach((o,k)=>{ const u=(t+o)%1; C.heart(p,h.x+(k?12:-2)+S(u*6)*1.5,h.y-3-u*14,1.6+u*1.2,F.heart[0],F.heart[1]); }); }
    if(P.fx==='bark'){ const m=sk.H(19,-5), s=6+P.fxt*4; C.shout(p,m.x+1+P.fxt*3,m.y,s,F.bark,3); }
  }
  const cache=C.mkCache(700);
  function frame(v,anim,fi,step=5){
    if(!VARS[v]) v='caramelo'; if(!ANIMS[anim]) anim='idle';
    const K=PIX.getK(), key=v+'|'+anim+'|'+fi+'|'+step+'@'+K, hit=cache.get(key); if(hit) return hit;
    const P=poseOf(anim,fi), V=VARS[v], M=mats(v), sk=C.skeleton(P,CFG), Lg=sk.legs;
    const tp=C.tailPts(sk.tailRoot,P,5,3.6);
    const pw=C.pen;
    const parts=[
      {back:true,draw:(c,u)=>{ const p=pw(c,u); C.leg(p,M.fur,M.furX,M.paw,M.pawX,Lg.fF,4.6,3.8,2.5); C.leg(p,M.fur,M.furX,M.paw,M.pawX,Lg.bF,5.6,3.8,2.5); }},
      {back:true,draw:(c,u)=>drawEarFar(pw(c,u),M,sk,P)},
      {draw:(c,u)=>{ const p=pw(c,u); C.tail(p,M.fur,M.furX,tp,5.4,2.6,{tip:M.cream,tipX:M.creamX}); }},
      {draw:(c,u)=>drawBody(pw(c,u),M,sk,V)},
      {draw:(c,u)=>{ const p=pw(c,u); C.leg(p,M.fur,M.furX,M.paw,M.pawX,Lg.bN,5.8,4,2.8); drawHaunch(p,M,sk,V); }},
      {draw:(c,u)=>{ const p=pw(c,u); C.leg(p,M.fur,M.furX,M.paw,M.pawX,Lg.fN,5,4,2.8); }},
      {draw:(c,u)=>drawBandana(pw(c,u),M,sk)},
      {draw:(c,u)=>drawJaw(pw(c,u),M,sk,P)},
      {draw:(c,u)=>drawHead(pw(c,u),M,sk,P,V)},
    ];
    if(P.fx) parts.push({noShade:true,noRim:true,smear:true,draw:(c,u)=>drawFx(pw(c,u),P,sk)});
    const cv=C.build({FW,FH,GROUND,parts,M,step,flash:P.flash,rim:RIM});
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._mouth=sc(sk.H(16,-4)); cv._head=sc(sk.H(2,-18)); cv._paw=sc(Lg.fN.f); cv._center=sc(sk.base);
    return cache.set(key,cv);
  }
  return {id:'cachorro',PS:1,FW,FH,GROUND,AX,VARS,ANIMS,NAMES,poseOf,frame,mats,RIM};
})();

/* ===== hub/pet_gato ===== */
/* ===== PET: Gato (tabby de telhado) ===== */
/* PET_GATO — fonte de arte (editável). Build: npm run art */
/* Chibi hi-bit: cabeça larga com bochechas fofas, olhos enormes de pupila em fenda, orelha rasgada de briga,
   listras tabby, rabo longo em S, lenço vermelho. Pelo em 8 tons, sombra roxa, luz quente, rim da lua. */
const PET_GATO=(function(){
  const {rad,lerp,P2}=PIX, C=PETCORE;
  const FW=88, FH=72, GROUND=66, AX=44, RIM='#a9c8f0';
  const CFG={AX,GROUND,bodyY:46,shX:8,hipX:-8.5,fl:[5,5.2],hl:[5.4,5.6],neck:[10,-4],tailRoot:[-13.5,-3],paw:1.3,legY:3,
    hull:[[-11,5,0.4],[0,6.2,0],[8,6,0]]};
  const VARS={
    tabby:{nome:'Tabby cinza',fur:'#8a8696',stripe:'#4a4656',cream:'#ece4d6',eye:'#c8dc4a',nose:'#e88a96'},
    laranja:{nome:'Laranja',fur:'#e2903e',stripe:'#a85a22',cream:'#f8e2bc',eye:'#7ade6a',nose:'#e8808a'},
    preto:{nome:'Preto',fur:'#3a3444',stripe:'#26222e',cream:'#56506a',eye:'#ffd23f',nose:'#6a4a5a'},
  };
  const mcache={};
  function mats(v){ if(mcache[v]) return mcache[v]; const V=VARS[v]||VARS.tabby, M={};
    C.mat(M,'fur',V.fur,1.1); C.mat(M,'stripe',V.stripe,1.05); C.mat(M,'cream',V.cream); C.mat(M,'iris',V.eye,1.2);
    C.mat(M,'nose',V.nose,1.1); C.mat(M,'ear','#e898a4',1.05); C.mat(M,'mouth','#5a1e30',1.1); C.mat(M,'tongue','#ef7a8a',1.1);
    C.mat(M,'band','#2f7ad8',1.1); C.mat(M,'tag','#e2c46a',1.1);
    M.ink=['#2a1620','#140a12','#0e060c','#060206'];
    return (mcache[v]=M); }
  const NAMES={fur:'Pelo',stripe:'Listras',cream:'Creme',iris:'Olhos',band:'Lenço'};
  const S=Math.sin, Cc=Math.cos, TAU=Math.PI*2;
  const REST={bx:0,by:0,tilt:0,head:0,jaw:0,tail:70,curl:-14,ear:0,earF:0,fN:[2,-2],fF:[-4,-4],bN:[16,-16],bF:[10,-20],eye:'open',flash:0,brow:0,claw:0,alpha:1,shift:0,fx:null,fxt:0,lift:0};
  const gait=p=>{ const fl=ph=>{ const h=2+18*S(ph); return [h,h-26*Math.max(0,Cc(ph))-2]; };
    const hl=ph=>{ const h=14+16*S(ph); return [h,h-32-10*Math.max(0,-Cc(ph))]; };
    return {fN:fl(p),bN:hl(p+Math.PI*0.5),fF:fl(p+Math.PI),bF:hl(p+Math.PI*1.5)}; };
  const SIT={tilt:-34,head:30,fN:[-4,0],fF:[-8,-2],bN:[80,-70],bF:[74,-74],tail:-6,curl:-34};
  const LOAF={fN:[86,96],fF:[80,94],bN:[88,-96],bF:[84,-100],tail:-20,curl:-30};
  const ANIMS={
    idle:{nome:'Parado',n:8,dur:i=>[180,160,160,180,160,120,120,160][i],pose:i=>{ const p=i/8*TAU, s=S(p);
      return {by:-0.4*s,head:1.2*S(p-0.8),tail:68+8*s,curl:-12+10*S(p+0.9),earF:i===2?-14:0,ear:i===2?-6:0,eye:i===5?'half':(i===6?'closed':'open')}; }},
    walk:{nome:'Andar',n:8,dur:()=>100,pose:i=>{ const p=i/8*TAU;
      return Object.assign(gait(p),{by:-1*Math.abs(S(2*p)),tilt:1.2*S(2*p),head:-1.5*S(2*p),tail:72+6*S(2*p),curl:-10+12*S(2*p+1)}); }},
    run:{nome:'Correr',n:6,dur:()=>70,pose:i=>{ const p=i/6*TAU, s=S(p), c=Cc(p);
      const f=o=>{ const h=10+50*S(p+o); return [h,h-6-46*Math.max(0,Cc(p+o))]; }, b=o=>{ const h=4-46*S(p+o); return [h,h-34-30*Math.max(0,Cc(p+o))]; };
      return {fN:f(0),fF:f(0.5),bN:b(0.9),bF:b(1.4),lift:3*Math.max(0,c),tilt:8*s,head:-8-4*s,ear:-8,earF:-10,tail:24+6*S(2*p),curl:4,bx:1}; }},
    sit:{nome:'Sentado',n:8,dur:()=>170,pose:i=>{ const p=i/8*TAU;
      return Object.assign({},SIT,{by:-0.3*S(p),head:SIT.head+1.5*S(p),curl:SIT.curl+6*S(p),eye:i===4?'half':(i===5?'closed':'open'),earF:i===1?-12:0}); }},
    lie:{nome:'Pãozinho (deitado)',n:8,dur:()=>220,pose:i=>{ const p=i/8*TAU;
      return Object.assign({},LOAF,{by:-0.3*S(p),head:6+S(p),curl:-30+10*S(p),eye:i>=3&&i<=5?'half':'open'}); }},
    sleep:{nome:'Dormir enrolado',n:8,dur:()=>240,pose:i=>{ const p=i/8*TAU;
      return Object.assign({},LOAF,{by:-0.5*S(p)+0.3,head:26,eye:'sleep',ear:4,earF:6,tail:-40,curl:-46,fx:'zzz',fxt:i/8}); }},
    happy:{nome:'Feliz (ronronar)',n:8,dur:()=>110,pose:i=>{ const p=i/8*TAU, up=Math.max(0,S(p));
      return {lift:6*up,tilt:-6*up,head:-6+4*S(2*p),fN:[10+30*up,-6+24*up],bN:[16,-16-10*up],tail:92+4*S(4*p),curl:-24+6*S(4*p),eye:'happy',jaw:4,ear:-2,fx:'heart',fxt:i/8}; }},
    meow:{nome:'Miar',n:6,dur:i=>[160,120,200,180,140,160][i],pose:i=>[
      {head:4,eye:'open'},
      {head:-4,ear:-4,eye:'half',jaw:4},
      {head:-14,ear:-6,eye:'happy',jaw:18,tilt:-4,fx:'note',fxt:0},
      {head:-12,ear:-6,eye:'happy',jaw:14,tilt:-4,fx:'note',fxt:0.5},
      {head:-4,eye:'open',jaw:4,fx:'note',fxt:0.9},
      {}][i]},
    attack:{nome:'Patada',n:6,dur:i=>[140,220,70,130,130,150][i],pose:i=>[
      {brow:1,ear:-6,earF:-8,head:4,eye:'angry'},
      {brow:1,ear:-10,earF:-14,bx:-4,tilt:8,head:10,jaw:16,tail:92,curl:6,fN:[40,90],claw:1,bN:[26,-6],eye:'angry'},
      {brow:1,ear:-10,earF:-14,bx:7,tilt:-10,head:-4,jaw:12,fN:[110,100],claw:1,bN:[-10,-36],bF:[-18,-40],eye:'angry'},
      {brow:1,ear:-8,earF:-10,bx:8,tilt:-4,jaw:4,fN:[70,50],claw:1,eye:'angry'},
      {ear:-4,bx:4,fN:[20,0]},
      {}][i]},
    special:{nome:'Sumiço de telhado',n:6,dur:i=>[220,160,200,200,160,200][i],pose:i=>[
      {eye:'happy',tail:96,curl:30,ear:4},
      {eye:'happy',alpha:0.5,tail:96,curl:30},
      {alpha:0},
      {alpha:0.35,shift:36,eye:'happy'},
      {alpha:1,shift:36,eye:'happy',tail:98,curl:34},
      {alpha:1,shift:36}][i]},
    hurt:{nome:'Dano',n:4,dur:i=>[80,130,130,160][i],pose:i=>[
      {flash:1,eye:'closed',bx:-3},
      {bx:-5,head:-18,tilt:8,ear:-12,earF:-14,eye:'closed',jaw:14,tail:110,curl:6},
      {bx:-4,head:-8,tilt:4,ear:-8,eye:'half',tail:90},
      {bx:-2}][i]},
    ko:{nome:'Desmaio',n:6,dur:i=>[80,180,160,140,120,600][i],pose:i=>[
      {flash:1,eye:'closed'},
      {eye:'x',head:-14,tilt:-8,bx:-4,ear:-10},
      {eye:'x',head:10,tilt:6,by:2,fN:[30,30],bN:[-10,-30],ear:-10},
      Object.assign({},LOAF,{eye:'x',head:16,tail:-4,curl:0,ear:-12,jaw:8}),
      Object.assign({},LOAF,{eye:'x',head:18,tail:-4,curl:0,ear:-12,jaw:8,by:0.4}),
      Object.assign({},LOAF,{eye:'x',head:16,tail:-4,curl:0,ear:-12,jaw:8})][i]},
  };
  function poseOf(anim,i){ const A=ANIMS[anim]||ANIMS.idle; return Object.assign({},REST,A.pose(i%A.n)); }

  /* ---------- desenho ---------- */
  const BODY=[['e',0,0,10,6.2],['e',7.6,-1,6.2,6.8],['e',-8,0,6.6,6.2]];
  function drawBody(p,M,sk,V){ p.xf(sk.a,sk.base.x,sk.base.y);
    C.shade(p,BODY,M.fur,M.furX,7,{c:P2(1,-2)});
    C.within(p,BODY,()=>{
      // listras tabby (faixas curvas nas costas)
      [-12,-7.4,-2.8,1.8].forEach((x,k)=>{ p.F(k%2?M.stripeX[2]:M.stripe[1]); p.poly([[x,-7],[x+2.2,-7],[x+1.4+k*0.2,-1.4],[x-0.4,-2]]); p.F(M.stripe[0]); p.rect(x+0.6,-6.6,0.8,1); });
      C.shade(p,[['e',2,7,12,3.4],['e',11,3,5,6.4]],M.cream,M.creamX,4,{spec:false});
    });
    C.tufts(p,[P2(14.2,-1),P2(13,4),P2(9.4,7)],1.3,M.cream[1],2);
    C.tufts(p,[P2(-5,6.2),P2(5,6.4)],1,M.cream[2],3);
    p.id(); }
  function drawHaunch(p,M,sk){ const r=sk.legs.bN.root; p.id();
    C.shade(p,[['e',r.x+0.4,r.y-1.6,4.4,5,-0.3]],M.fur,M.furX,5,{spec:false});
    p.F(M.stripe[1]); p.poly([[r.x-2.4,r.y-3],[r.x-0.6,r.y-3.6],[r.x-1.4,r.y+0.6]]); }
  function drawHead(p,M,sk,P,V){ p.xf(sk.ha,sk.neck.x,sk.neck.y);
    const SK=[['e',1.6,-7.2,8.2,6.8],['e',3.4,-3.6,7.4,4.2]];
    C.shade(p,SK,M.fur,M.furX,7.4,{c:P2(2,-6.6)});
    C.within(p,SK,()=>{ // "M" da testa e listras da bochecha
      p.F(M.stripe[1]); [[0.4,-14],[2.8,-14.6],[5.2,-14]].forEach(([x,y])=>p.poly([[x,y],[x+1.1,y],[x+0.7,y+3.6],[x+0.1,y+3.2]]));
      p.poly([[-6.6,-6.4],[-2,-6],[-2,-5.2],[-6.6,-5.2]]); p.poly([[-6.4,-4],[-2.4,-3.8],[-2.6,-3],[-6.2,-2.8]]);
      C.shade(p,[['e',7.6,-1.8,5.6,3.2]],M.cream,M.creamX,3.6,{spec:false}); });
    C.tufts(p,[P2(-6.6,-4.6),P2(-4.4,-0.6),P2(-0.4,0.6)],1.6,M.fur[1],2);
    // olho de trás
    C.eye(p,9.4,-8.2,1.6,2.2,P.eye,M.iris,M.ink[1],{slit:1,pupil:0.55,lid:M.fur[2]});
    // focinho fofo
    C.shade(p,[['e',8.8,-3.4,2.6,1.9],['e',11,-3.6,2.2,1.8]],M.cream,M.creamX,2.2,{c:P2(10,-3.6)});
    C.shade(p,[['p',[[9.8,-6.2],[12.4,-6.2],[11.1,-4.7]]]],M.nose,M.noseX,1.6,{spec:false});
    p.F(M.ink[1]); p.rect(10.8,-4.7,0.6,1); p.poly([[9.2,-3.3],[11.1,-3.7],[11.1,-3.1],[9.4,-2.7]]); p.poly([[11.1,-3.7],[12.9,-3.5],[12.7,-2.9],[11.1,-3.1]]);
    if(P.jaw>3){ const j=P.jaw*0.18; C.shade(p,[['p',[[10.2,-3],[13.6,-3.2],[13,-3+j],[11,-3+j+0.4]]]],M.mouth,M.mouthX,1.6,{lite:false});
      p.F(M.tongue[1]); p.ell(11.8,-3+j-0.2,1.2,0.6); p.F('#fffbf0'); p.rect(10.6,-3.1,0.6,0.9); p.rect(12.8,-3.2,0.6,0.9); }
    // olho da frente enorme
    C.eye(p,4.6,-8,2.3,2.7,P.eye,M.iris,M.ink[1],{slit:1,pupil:P.eye==='wide'?0.75:0.6,lid:M.fur[2]});
    if(P.brow){ p.F(M.stripeX[3]); p.poly([[2,-12.4],[7,-10.8],[6.8,-10.2],[2,-11.4]]); }
    if(P.eye!=='angry'){ p.F(M.tongueX[0]); p.ell(6.6,-4,1.4,0.7); }
    // bigodes
    p.F('#fffbf0'); p.cap(P2(11.4,-3.6),P2(16.4,-4.8),0.5,0.4); p.cap(P2(11.4,-3),P2(16.2,-2.2),0.5,0.4); p.cap(P2(6.4,-3.4),P2(3,-4.4),0.4,0.3);
    // orelha da frente (rasgada na ponta)
    const e=rad(P.ear*3+P.earF*2), q=sk.H(-1.4,-12); p.xf(sk.ha+e-0.12,q.x,q.y);
    C.shade(p,[['p',[[-3.6,1.2],[3.4,1],[0.8,-8.2],[-0.2,-8.4]]]],M.fur,M.furX,4,{c:P2(0,-2.6),spec:false});
    p.F(M.earX[2]); p.poly([[-1.8,0.6],[2,0.4],[0.5,-5.6]]); p.F(M.ear[1]); p.poly([[-0.8,0.4],[1.4,0.2],[0.5,-3.6]]);
    p.F('#fffbf0'); p.poly([[-1.2,0.4],[-0.2,-3],[0,0.4]]);
    p.F(M.furX[3]); p.poly([[0.2,-8.6],[1.6,-6.6],[0.8,-6.4]]);
    p.id(); }
  function drawEarFar(p,M,sk,P){ const q=sk.H(4.6,-13); p.xf(sk.ha+rad(P.ear*2+P.earF*1.2)+0.2,q.x,q.y);
    C.shade(p,[['p',[[-3,1],[3,0.8],[0.8,-7.4]]]],M.fur,M.furX,3,{lite:false}); p.F(M.earX[2]); p.poly([[-1,0.4],[1.6,0.4],[0.6,-4]]); p.id(); }
  function drawBandana(p,M,sk){ p.xf(sk.a,sk.base.x,sk.base.y);
    C.shade(p,[['p',[[7.4,-7],[14.4,-5.4],[15,-3.4],[11.6,3],[8.6,-2.4]]]],M.band,M.bandX,3,{c:P2(11.4,-3),spec:false});
    p.F(M.bandX[3]); p.poly([[7.4,-7],[14.8,-5],[14.8,-4.2],[7.6,-5.8]]);
    p.F(M.bandX[0]); p.rect(11,-3.4,0.8,0.8); p.rect(12.6,-1.4,0.8,0.8);
    C.shade(p,[['e',12,4.4,1.5,1.6]],M.tag,M.tagX,1.6); p.id(); }
  function drawClaws(p,M,sk,P){ if(!P.claw) return; const f=sk.legs.fN.f; p.id(); p.F('#fffbf0'); for(let k=0;k<3;k++) p.poly([[f.x+1.6,f.y-1+k*1.2],[f.x+4.6,f.y-1.8+k*1.4],[f.x+2.2,f.y+k*1.2]]); }
  function drawFx(p,P,sk){ p.id(); const F=C.FXC, h=sk.H(3,-17);
    if(P.fx==='zzz'){ [0,0.34,0.67].forEach((o,k)=>{ const u=(P.fxt+o)%1; C.zzz(p,h.x+2+u*7+k,h.y-u*12,2+u*2,F.z); }); }
    if(P.fx==='heart'){ [0,0.5].forEach((o,k)=>{ const u=(P.fxt+o)%1; C.heart(p,h.x+(k?10:-2)+S(u*6),h.y-2-u*12,1.4+u,F.heart[0],F.heart[1]); }); }
    if(P.fx==='note'){ const m=sk.H(15,-6); [0,0.5].forEach((o,k)=>{ const u=(P.fxt+o)%1; C.note(p,m.x+2+u*6,m.y-4-u*8+k*2,2.2,F.note); }); }
  }
  // sumiço: dissolve em xadrez (pixel art), sem transparência parcial
  function vanish(cv,a){ if(a>=1) return; const g=cv.getContext('2d'), im=PIX.pix(cv), d=im.data, W=cv.width;
    for(let i=0;i<d.length;i+=4){ const x=(i/4)%W, y=Math.floor(i/4/W); const th=((x&1)*2+(y&1)*3+((x>>1)&1))%4/4; if(a<=th+0.01) d[i+3]=0; } g.putImageData(im,0,0); }
  const cache=C.mkCache(700);
  function frame(v,anim,fi,step=5){
    if(!VARS[v]) v='tabby'; if(!ANIMS[anim]) anim='idle';
    const K=PIX.getK(), key=v+'|'+anim+'|'+fi+'|'+step+'@'+K, hit=cache.get(key); if(hit) return hit;
    const P=poseOf(anim,fi), V=VARS[v], M=mats(v); if(P.shift) P.bx+=P.shift*0.15;
    const sk=C.skeleton(P,CFG), Lg=sk.legs, tp=C.tailPts(sk.tailRoot,P,7,3.1), pw=C.pen;
    const parts=[
      {back:true,draw:(c,u)=>{ const p=pw(c,u); C.leg(p,M.fur,M.furX,M.cream,M.creamX,Lg.fF,3.6,3,2); C.leg(p,M.fur,M.furX,M.cream,M.creamX,Lg.bF,4.6,3,2); }},
      {back:true,draw:(c,u)=>drawEarFar(pw(c,u),M,sk,P)},
      {draw:(c,u)=>{ const p=pw(c,u); C.tail(p,M.fur,M.furX,tp,3.8,2.6,{rings:M.stripe,ringsX:M.stripeX,tip:M.stripe,tipX:M.stripeX}); }},
      {draw:(c,u)=>drawBody(pw(c,u),M,sk,V)},
      {draw:(c,u)=>{ const p=pw(c,u); C.leg(p,M.fur,M.furX,M.cream,M.creamX,Lg.bN,4.6,3.1,2.2); drawHaunch(p,M,sk); }},
      {draw:(c,u)=>{ const p=pw(c,u); C.leg(p,M.cream,M.creamX,M.cream,M.creamX,Lg.fN,3.8,3.1,2.2); }},
      {draw:(c,u)=>drawBandana(pw(c,u),M,sk)},
      {draw:(c,u)=>drawHead(pw(c,u),M,sk,P,V)},
      {noShade:true,draw:(c,u)=>drawClaws(pw(c,u),M,sk,P)},
    ];
    if(P.fx) parts.push({noShade:true,noRim:true,smear:true,draw:(c,u)=>drawFx(pw(c,u),P,sk)});
    const cv=C.build({FW,FH,GROUND,parts,M,step,flash:P.flash,rim:RIM}); vanish(cv,P.alpha);
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._mouth=sc(sk.H(13,-4)); cv._head=sc(sk.H(2,-16)); cv._paw=sc(Lg.fN.f); cv._center=sc(sk.base);
    return cache.set(key,cv);
  }
  return {id:'gato',PS:1,FW,FH,GROUND,AX,VARS,ANIMS,NAMES,poseOf,frame,mats,RIM};
})();

/* ===== hub/pet_capivara ===== */
/* ===== PET: Capivara (com a mexerica na cabeça) ===== */
/* PET_CAPIVARA — fonte de arte (editável). Build: npm run art */
/* Chibi hi-bit: corpo de barril, cabeção quadradão de focinho largo, orelhinhas, olhar zen, mexerica com folha
   equilibrada na cabeça e bolsinha de primeiros socorros a tiracolo. Pelo grosso em 8 tons com fios marcados. */
const PET_CAPIVARA=(function(){
  const {rad,lerp,P2}=PIX, C=PETCORE;
  const FW=108, FH=84, GROUND=78, AX=52, RIM='#a9c8f0';
  const CFG={AX,GROUND,bodyY:52,shX:11,hipX:-12,fl:[4.8,4.4],hl:[5,4.8],neck:[15,-5],tailRoot:[-22,-2],paw:1.4,legY:6.4,
    hull:[[-18,7.6,0.4],[0,10.4,0],[11,9.8,0]]};
  const VARS={
    marrom:{nome:'Marrom',fur:'#a06a3c',belly:'#c48e58',snout:'#7a4a2c',paw:'#4a3022'},
    ruiva:{nome:'Ruiva',fur:'#b8683a',belly:'#d8945a',snout:'#8a4a28',paw:'#4a2a18'},
    escura:{nome:'Escura',fur:'#6a4e3a',belly:'#8c6a50',snout:'#4e382a',paw:'#2a1e16'},
  };
  const mcache={};
  function mats(v){ if(mcache[v]) return mcache[v]; const V=VARS[v]||VARS.marrom, M={};
    C.mat(M,'fur',V.fur,1.1); C.mat(M,'belly',V.belly,1.05); C.mat(M,'snout',V.snout,1.05); C.mat(M,'paw',V.paw,1);
    C.mat(M,'orange','#f2901e',1.15); C.mat(M,'leaf','#4fa83a',1.1); C.mat(M,'bag','#7a7440',1.05); C.mat(M,'strap','#5a3a22',1);
    C.mat(M,'label','#efe4c4',1); C.mat(M,'cross','#d8373a',1.1); C.mat(M,'iris','#5a3418',1.2); C.mat(M,'tongue','#ef7a8a',1.1); C.mat(M,'grass','#7ac04a',1.1);
    M.ink=['#2a1620','#160a10','#0e060a','#060204'];
    return (mcache[v]=M); }
  const NAMES={fur:'Pelo',belly:'Barriga',snout:'Focinho',orange:'Mexerica',bag:'Bolsinha'};
  const S=Math.sin, Cc=Math.cos, TAU=Math.PI*2;
  const REST={bx:0,by:0,tilt:0,head:0,jaw:0,ear:0,fN:[3,-2],fF:[-3,-4],bN:[8,-8],bF:[3,-12],eye:'open',flash:0,mex:0,mexX:0,mexY:0,tongue:0,grass:0,fx:null,fxt:0,lift:0};
  const gait=p=>{ const fl=ph=>{ const h=4+16*S(ph); return [h,h-18*Math.max(0,Cc(ph))-2]; };
    const hl=ph=>{ const h=8+14*S(ph); return [h,h-18-8*Math.max(0,-Cc(ph))]; };
    return {fN:fl(p),bF:hl(p),fF:fl(p+Math.PI),bN:hl(p+Math.PI)}; };
  const SIT={tilt:-24,head:22,fN:[-4,0],fF:[-8,-2],bN:[84,-80],bF:[78,-84]};
  const LIE={fN:[84,96],fF:[78,94],bN:[88,-96],bF:[84,-100]};
  const ANIMS={
    idle:{nome:'Parado (zen)',n:8,dur:()=>190,pose:i=>{ const p=i/8*TAU, s=S(p);
      return {by:-0.5*s,head:-1+1.2*S(p-0.6),jaw:i%4===1?6:(i%4===2?3:0),mex:3*S(p+1),ear:i===3?-16:0,eye:i===6?'closed':(i===5||i===7?'half':'open')}; }},
    walk:{nome:'Gingado',n:8,dur:()=>140,pose:i=>{ const p=i/8*TAU;
      return Object.assign(gait(p),{by:-0.8*Math.abs(S(2*p)),tilt:2*S(2*p),head:-2*S(2*p),mex:6*S(2*p+0.6),mexX:0.6*S(2*p+0.6)}); }},
    run:{nome:'Trotão',n:6,dur:()=>85,pose:i=>{ const p=i/6*TAU, s=S(p), c=Cc(p);
      const f=o=>{ const h=10+34*S(p+o); return [h,h-6-30*Math.max(0,Cc(p+o))]; }, b=o=>{ const h=2-30*S(p+o); return [h,h-20-20*Math.max(0,Cc(p+o))]; };
      return {fN:f(0),fF:f(0.5),bN:b(0.9),bF:b(1.4),lift:3*Math.max(0,c),tilt:5*s,head:-4-3*s,ear:-10,mex:-10+14*s,mexY:-1.6*Math.max(0,c),eye:'wide'}; }},
    sit:{nome:'Sentada',n:8,dur:()=>200,pose:i=>{ const p=i/8*TAU;
      return Object.assign({},SIT,{by:-0.4*S(p),head:SIT.head+1.2*S(p),jaw:i%4===1?5:0,mex:3*S(p),eye:i===4?'closed':'half'}); }},
    lie:{nome:'Deitada',n:8,dur:()=>230,pose:i=>{ const p=i/8*TAU;
      return Object.assign({},LIE,{by:-0.4*S(p),head:4+S(p),mex:2*S(p),eye:'half',jaw:i===2?4:0}); }},
    sleep:{nome:'Dormir',n:8,dur:()=>250,pose:i=>{ const p=i/8*TAU;
      return Object.assign({},LIE,{by:-0.6*S(p)+0.3,head:14,eye:'sleep',ear:6,mex:-8+3*S(p),mexX:-0.6,fx:'zzz',fxt:i/8}); }},
    happy:{nome:'Feliz (pulinho)',n:8,dur:()=>110,pose:i=>{ const p=i/8*TAU, up=Math.max(0,S(p));
      return {lift:7*up,tilt:-5*up,head:-4*up,fN:[10+26*up,-4+20*up],fF:[6+24*up,-6+20*up],bN:[8,-8-14*up],bF:[3,-12-14*up],eye:'happy',jaw:6,tongue:1,mex:-14*up+6*S(2*p),mexY:-3*up,fx:'heart',fxt:i/8}; }},
    chew:{nome:'Mastigar capim',n:8,dur:()=>150,pose:i=>{ const p=i/8*TAU;
      return {head:4+1.5*S(2*p),jaw:4+4*S(2*p),grass:1,eye:i===5?'closed':'half',mex:2*S(2*p),ear:i===2?-12:0}; }},
    attack:{nome:'Cabeçada',n:5,dur:i=>[160,280,80,150,180][i],pose:i=>[
      {eye:'angry'},
      {bx:-5,tilt:6,head:18,ear:-20,by:1,mex:-12,fN:[-8,-14],bN:[16,-4],eye:'angry'},
      {bx:8,tilt:-6,head:14,ear:-16,eye:'closed',mex:20,fN:[40,20],bN:[-10,-24]},
      {bx:10,tilt:-2,head:10,eye:'closed',mex:28,mexY:-3},
      {bx:4,mex:8}][i]},
    special:{nome:'Aura da calmaria',n:6,dur:i=>[200,240,260,260,260,260][i],pose:i=>[
      {},{eye:'happy',by:-0.4,fx:'calm',fxt:0},{eye:'happy',by:-1,fx:'calm',fxt:0.2},{eye:'happy',by:-0.6,fx:'calm',fxt:0.4},{eye:'happy',by:-1,fx:'calm',fxt:0.6},{eye:'open',fx:'calm',fxt:0.8}][i]},
    hurt:{nome:'Dano',n:4,dur:i=>[80,130,130,160][i],pose:i=>[
      {flash:1,eye:'wide',bx:-3},
      {bx:-5,head:-14,tilt:6,eye:'closed',ear:-16,mex:-18},
      {bx:-4,head:-6,tilt:3,eye:'half',mex:-8},
      {bx:-1}][i]},
    ko:{nome:'Desmaio',n:6,dur:i=>[80,180,160,140,120,600][i],pose:i=>[
      {flash:1,eye:'wide'},
      {eye:'x',head:-10,tilt:-6,bx:-3,mex:-30,mexX:-4},
      {eye:'x',head:8,tilt:4,by:3,mex:-80,mexX:-14,mexY:-10},
      Object.assign({},LIE,{eye:'x',head:12,mex:-180,mexX:-30,mexY:16,tongue:1}),
      Object.assign({},LIE,{eye:'x',head:11,mex:-200,mexX:-33,mexY:17,tongue:1,by:0.4}),
      Object.assign({},LIE,{eye:'x',head:12,mex:-200,mexX:-33,mexY:17,tongue:1})][i]},
  };
  function poseOf(anim,i){ const A=ANIMS[anim]||ANIMS.idle; return Object.assign({},REST,A.pose(i%A.n)); }

  /* ---------- desenho ---------- */
  const BODY=[['e',0,0,16,10.4],['e',-12,-1,10.4,10.4],['e',10.6,0,9.4,9.8]];
  function drawBody(p,M,sk){ p.xf(sk.a,sk.base.x,sk.base.y);
    C.shade(p,BODY,M.fur,M.furX,11,{c:P2(0,-2)});
    C.within(p,BODY,()=>C.shade(p,[['e',0,11,18,4.6],['e',13,6,6,7]],M.belly,M.bellyX,5,{spec:false}));
    // pelo grosso: fios em leque nas costas e flanco
    [[-20,-4],[-15,-8],[-9,-9.4],[-3,-9.6],[3,-9.4],[9,-8.4]].forEach(([x,y],k)=>{ C.strand(p,M.furX[2],P2(x,y+2.4),P2(x+1.6,y+5.6),0.8); C.strand(p,k%2?M.fur[0]:M.furX[1],P2(x+0.6,y-0.4),P2(x+2.6,y+0.6),0.7); });
    [[-14,1],[-7,2],[0,3],[6,2]].forEach(([x,y])=>C.strand(p,M.furX[2],P2(x,y),P2(x+1.4,y+3.6),0.7));
    C.tufts(p,[P2(-21,-6),P2(-22.4,0),P2(-20,6)],1.2,M.fur[2],2);
    C.tufts(p,[P2(-10,10),P2(8,10)],1.2,M.belly[2],4);
    p.id(); }
  function drawHaunch(p,M,sk){ const r=sk.legs.bN.root; p.id();
    C.shade(p,[['e',r.x+0.4,r.y-2.6,6.4,7,-0.2]],M.fur,M.furX,7,{spec:false});
    C.strand(p,M.furX[2],P2(r.x-3,r.y-2),P2(r.x-1.4,r.y+2),0.8); }
  function drawBag(p,M,sk){ p.xf(sk.a,sk.base.x,sk.base.y);
    p.F(M.strap[2]); p.poly([[11,-10],[13.6,-9.6],[-3,6],[-5.6,5.6]]); p.F(M.strap[0]); p.poly([[12,-9.8],[12.8,-9.6],[-3.8,5.6],[-4.4,5.4]]);
    C.shade(p,[['p',[[-11,-1],[3,-2],[4,9],[-10,10.4]]]],M.bag,M.bagX,6,{c:P2(-3.4,4),spec:false});
    p.F(M.bagX[3]); p.poly([[-11,-1],[3,-2],[3.2,0.6],[-10.8,1.6]]); p.F(M.bag[0]); p.rect(-9.6,-1.2,10,0.8);
    C.shade(p,[['p',[[-7.6,3],[-0.6,2.6],[-0.4,8.2],[-7.4,8.6]]]],M.label,M.labelX,3,{spec:false});
    p.F(M.cross[1]); p.rect(-4.6,3.6,1.6,4); p.rect(-6,4.8,4.4,1.6); p.F(M.cross[0]); p.rect(-4.6,3.6,1.6,0.6);
    p.F(M.labelX[0]); p.rect(1,0,1,1);
    p.id(); }
  function drawHead(p,M,sk,P){ p.xf(sk.ha,sk.neck.x,sk.neck.y);
    const SK=[['e',2,-6.4,9,7.4],['e',10,-6.6,8,6.8],['p',[[-4,-1],[16,-1.4],[16,-9],[-4,-10]]]];
    C.shade(p,SK,M.fur,M.furX,8,{c:P2(5,-7)});
    C.within(p,SK,()=>{ C.shade(p,[['e',14.2,-6.4,5.2,6.6]],M.snout,M.snoutX,5,{spec:false}); C.shade(p,[['e',4,-0.4,9,3]],M.belly,M.bellyX,3,{spec:false}); });
    C.tufts(p,[P2(-6.8,-6),P2(-6,-1),P2(-2,0.8)],1.4,M.fur[1],2);
    C.tufts(p,[P2(-2,-13.2),P2(6,-13.4)],1,M.furX[1],3);
    // narina, boca
    p.F(M.ink[1]); p.poly([[17.4,-10],[19,-9.4],[18.8,-8.6],[17.2,-9.2]]); p.F(M.snoutX[0]); p.rect(16.6,-11,1.6,0.8);
    p.F(M.snoutX[3]); p.rect(18,-3,1.4,0.8); p.poly([[14.6,-1.6],[18.6,-2.4],[18.6,-1.8],[14.8,-1]]);
    if(P.jaw>0){ p.F(M.snoutX[3]); p.poly([[14.6,-1.4],[18.4,-2],[18,-2+P.jaw*0.2],[15,-1.4+P.jaw*0.2]]); }
    if(P.tongue){ C.shade(p,[['e',17.2,-0.6,1.4,1.8]],M.tongue,M.tongueX,1.4,{spec:false}); }
    if(P.grass){ const j=P.jaw*0.2; p.F(M.grass[1]); p.poly([[16,-1.6+j*0.5],[24,-5],[24.4,-4.2],[16.4,-0.6+j*0.5]]); p.poly([[17,-1.2],[23,1.6],[22.4,2.2],[17,-0.4]]); p.F(M.grass[0]); p.rect(20,-3.6,2,0.6); p.F(M.grassX[2]); p.rect(19,0.4,2,0.6); }
    // olho (alto, tranquilo, com pálpebra pesada)
    C.eye(p,7.4,-9.2,1.9,2.1,P.eye,M.iris,M.ink[1],{lid:M.fur[2]});
    if(P.eye==='open'||P.eye==='half'){ p.F(M.furX[2]); p.poly([[5,-11.6],[9.8,-11.6],[9.8,-10.6],[5,-10.8]]); }
    if(P.eye==='happy'||P.eye==='half'||P.eye==='open'){ p.F(M.tongueX[0]); p.ell(9.2,-5.6,1.6,0.8); }
    // orelhinha
    const q=sk.H(-1.4,-12.2); p.xf(sk.ha+rad(P.ear),q.x,q.y);
    C.shade(p,[['e',0,-1.6,2.6,2.4]],M.fur,M.furX,2.4,{spec:false}); p.F(M.snout[2]); p.ell(0.4,-1.4,1.3,1.2);
    p.id(); }
  function drawEarFar(p,M,sk,P){ const q=sk.H(2.6,-13); p.xf(sk.ha+rad(P.ear),q.x,q.y); C.shade(p,[['e',0,-1.4,2.4,2.2]],M.fur,M.furX,2.2,{lite:false}); p.id(); }
  function drawMex(p,M,sk,P){ const q=sk.H(4+P.mexX,-17.4+P.mexY); p.xf(sk.ha+rad(P.mex),q.x,q.y);
    C.shade(p,[['e',0,0,4.6,4]],M.orange,M.orangeX,4.4);
    p.F(M.orange[2]); [[-2,1.4],[1,2.2],[2.4,-0.6],[-0.4,-1.2]].forEach(([x,y])=>p.rect(x,y,0.7,0.7));
    p.F(M.orangeX[3]); p.rect(-0.4,-4.2,0.9,1);
    p.F(M.leafX[2]); p.rect(-0.2,-5.6,0.9,1.8);
    C.shade(p,[['p',[[0.6,-5],[2.2,-6.8],[5,-6.6],[3,-4.4]]]],M.leaf,M.leafX,2,{spec:false}); p.F(M.leafX[2]); p.poly([[1,-5],[4.4,-6.4],[4.4,-6],[1.2,-4.6]]);
    p.id(); }
  function drawFx(p,P,sk){ p.id(); const F=C.FXC, h=sk.H(4,-22);
    if(P.fx==='zzz'){ [0,0.34,0.67].forEach((o,k)=>{ const u=(P.fxt+o)%1; C.zzz(p,h.x+4+u*8+k,h.y-u*12,2.4+u*2.4,F.z); }); }
    if(P.fx==='heart'){ [0,0.5].forEach((o,k)=>{ const u=(P.fxt+o)%1; C.heart(p,h.x+(k?14:-4)+S(u*6),h.y-u*12,1.6+u,F.heart[0],F.heart[1]); }); }
    if(P.fx==='calm'){ const c=sk.base; [0,0.25,0.5,0.75].forEach((o,k)=>{ const u=(P.fxt+o)%1, a=k*1.6+u*2; C.sparkle(p,c.x+Math.cos(a)*24,c.y-8+Math.sin(a)*8-u*10,1.2+1.4*S(u*Math.PI),k%2?F.spark:'#a8f0c0'); });
      C.note(p,h.x+12,h.y+2-P.fxt*8,2.4,F.note); }
  }
  const cache=C.mkCache(700);
  function frame(v,anim,fi,step=5){
    if(!VARS[v]) v='marrom'; if(!ANIMS[anim]) anim='idle';
    const K=PIX.getK(), key=v+'|'+anim+'|'+fi+'|'+step+'@'+K, hit=cache.get(key); if(hit) return hit;
    const P=poseOf(anim,fi), M=mats(v), sk=C.skeleton(P,CFG), Lg=sk.legs, pw=C.pen;
    const parts=[
      {back:true,draw:(c,u)=>{ const p=pw(c,u); C.leg(p,M.fur,M.furX,M.paw,M.pawX,Lg.fF,5.6,5,3); C.leg(p,M.fur,M.furX,M.paw,M.pawX,Lg.bF,7,5.4,3); }},
      {back:true,draw:(c,u)=>drawEarFar(pw(c,u),M,sk,P)},
      {draw:(c,u)=>drawBody(pw(c,u),M,sk)},
      {draw:(c,u)=>{ const p=pw(c,u); C.leg(p,M.fur,M.furX,M.paw,M.pawX,Lg.bN,7.4,5.6,3.3); drawHaunch(p,M,sk); }},
      {draw:(c,u)=>{ const p=pw(c,u); C.leg(p,M.fur,M.furX,M.paw,M.pawX,Lg.fN,6,5.2,3.3); }},
      {draw:(c,u)=>drawBag(pw(c,u),M,sk)},
      {draw:(c,u)=>drawHead(pw(c,u),M,sk,P)},
      {draw:(c,u)=>drawMex(pw(c,u),M,sk,P)},
    ];
    if(P.fx) parts.push({noShade:true,noRim:true,smear:true,draw:(c,u)=>drawFx(pw(c,u),P,sk)});
    const cv=C.build({FW,FH,GROUND,parts,M,step,flash:P.flash,rim:RIM});
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._mouth=sc(sk.H(19,-3)); cv._head=sc(sk.H(4,-22)); cv._paw=sc(Lg.fN.f); cv._center=sc(sk.base);
    return cache.set(key,cv);
  }
  return {id:'capivara',PS:1,FW,FH,GROUND,AX,VARS,ANIMS,NAMES,poseOf,frame,mats,RIM};
})();

/* ===== hub/jabu ===== */
/* ===== PET: Jabuti-piranga (tanque teimoso de casco dourado) ===== */
/* JABU — fonte de arte (editável). Build: npm run art */
/* Chibi hi-bit: casco em domo alto com placas de aréola amarela, marginais pintadas, arnês de couro;
   cabeção de velho rabugento-fofo com escamas vermelhas, sobrancelha franzida e olhão âmbar. */
const JABU=(function(){
  const {rad,lerp,P2}=PIX, C=PETCORE;
  const FW=76, FH=60, GROUND=54, AX=36, RIM='#a9c8f0', PS=1;
  const VARS={piranga:{nome:'Piranga'}, tinga:{nome:'Tinga (escama amarela)'}, musgo:{nome:'Velho de musgo'}};
  const mcache={};
  function mats(v){ if(mcache[v]) return mcache[v]; const M={};
    C.mat(M,'plate',v==='musgo'?'#3e4a2c':'#3e3028',1); C.mat(M,'marg',v==='musgo'?'#4e5a34':'#4e3c2e',1);
    C.mat(M,'areola',v==='musgo'?'#a8cc4a':'#ecb030',1.15); C.mat(M,'skin','#4e4038',1); C.mat(M,'scale',v==='tinga'?'#ecc43a':'#e2582c',1.15);
    C.mat(M,'plast','#dcbc78',1); C.mat(M,'beak','#d4b07a',1); C.mat(M,'strap','#9a6438',1.05); C.mat(M,'metal','#c9c3b0',0.8);
    C.mat(M,'iris','#d88a2a',1.2); C.mat(M,'mouth','#c05a6a',1.1); C.mat(M,'claw','#e8e0d0',0.6); C.mat(M,'gold','#ffd23f',1.1); C.mat(M,'moss','#6aa83a',1.1); C.mat(M,'leaf','#58b040',1.1);
    M.ink=['#2a1620','#160a10','#0e060a','#060204'];
    return (mcache[v]=M); }
  const NAMES={plate:'Placa',marg:'Marginal',areola:'Aréola',skin:'Pele',scale:'Escama',plast:'Plastrão',beak:'Bico',strap:'Arnês',gold:'Escudo'};
  const S=Math.sin, Cc=Math.cos, TAU=Math.PI*2;
  const REST={hx:0,lift:0,rock:0,neck:1,ht:0,jaw:0,fn:[0,0],ff:[0,0],rn:[0,0],rf:[0,0],hide:0,gold:0,eye:'open',flash:0,brow:1,fx:null,fxt:0,leaf:0,dome:0};
  const step=(p,o,A,H)=>[A*Cc(p+o),H*Math.max(0,S(p+o))];
  const ANIMS={
    idle:{nome:'Parado',n:8,dur:()=>200,pose:i=>{ const p=i/8*TAU, s=S(p);
      return {neck:0.92+0.08*s,ht:-2*s,lift:0.3*s,jaw:i===2||i===3?4:0,eye:i===6?'closed':(i===5||i===7?'half':'open')}; }},
    walk:{nome:'Andar',n:8,dur:()=>150,pose:i=>{ const p=i/8*TAU;
      return {fn:step(p,0,2.4,2.2),rf:step(p,0.3,2.4,2.2),ff:step(p,Math.PI,2.4,2.2),rn:step(p,Math.PI+0.3,2.4,2.2),rock:1.6*S(2*p),lift:0.5*Math.abs(S(2*p)),neck:1+0.06*S(2*p),ht:-3*S(2*p+0.5),eye:'open'}; }},
    run:{nome:'Correria (no ritmo dele)',n:6,dur:()=>90,pose:i=>{ const p=i/6*TAU;
      return {fn:step(p,0,3.4,3.4),rf:step(p,0.3,3.4,3.4),ff:step(p,Math.PI,3.4,3.4),rn:step(p,Math.PI+0.3,3.4,3.4),rock:3*S(2*p),lift:1.2*Math.abs(S(2*p)),neck:1.15,ht:-8,eye:'wide',brow:0,jaw:6,fx:'dust',fxt:i/6}; }},
    lie:{nome:'Recolhido',n:4,dur:()=>260,pose:i=>({neck:0.15,hide:1,lift:-2.6,eye:i===2?'closed':'half',ht:4})},
    sleep:{nome:'Dormir',n:8,dur:()=>260,pose:i=>{ const p=i/8*TAU; return {neck:0.35,hide:0.7,lift:-1.8+0.3*S(p),ht:14,eye:'sleep',fx:'zzz',fxt:i/8,dome:0.3*S(p)}; }},
    happy:{nome:'Feliz',n:8,dur:()=>120,pose:i=>{ const p=i/8*TAU, up=Math.max(0,S(2*p));
      return {neck:1.2,ht:-14+10*S(2*p),rock:-5*up,fn:[1,3*up],ff:[1,3*up],lift:1.4*up,eye:'happy',jaw:8,brow:0,fx:'heart',fxt:i/8}; }},
    chomp:{nome:'Comer folha',n:8,dur:i=>[180,140,120,140,120,140,120,220][i],pose:i=>[
      {neck:1.1,ht:12,leaf:1,eye:'open'},{neck:1.2,ht:16,jaw:14,leaf:1,eye:'wide'},{neck:1.05,ht:8,jaw:0,leaf:0.7,eye:'happy'},{neck:1,ht:4,jaw:6,leaf:0.45,eye:'happy'},
      {neck:1,ht:2,jaw:0,leaf:0.3,eye:'happy'},{neck:1,ht:0,jaw:6,leaf:0.15,eye:'happy'},{neck:1,ht:0,jaw:0,eye:'happy'},{neck:1,ht:-4,eye:'open',jaw:3}][i]},
    attack:{nome:'Bote (mordida)',n:6,dur:i=>[140,180,60,130,150,150][i],pose:i=>[
      {neck:0.9,eye:'angry'},{neck:0.55,ht:-10,eye:'angry',lift:0.6,rock:-2},{neck:1.6,ht:6,jaw:30,eye:'angry',rock:3},{neck:1.5,ht:4,jaw:0,eye:'angry',rock:2},{neck:1.1,ht:0},{}][i]},
    special:{nome:'Casco-Escudo',n:6,dur:i=>[220,160,220,420,200,260][i],pose:i=>[
      {eye:'wide',neck:1.1,ht:-6,brow:0},{neck:0.2,hide:1,lift:-2.6,eye:'closed'},{neck:0.15,hide:1,lift:-2.6,gold:1},{neck:0.15,hide:1,lift:-2.6,gold:2},{neck:0.8,hide:0.3,gold:1,eye:'happy'},{eye:'happy',fx:'heart',fxt:0.3}][i]},
    hurt:{nome:'Dano',n:3,dur:i=>[80,120,170][i],pose:i=>[{flash:1,hx:-3,eye:'closed',neck:0.7},{hx:-2,eye:'closed',neck:0.8,rock:-4},{eye:'half'}][i]},
  };
  function poseOf(a,i){ const A=ANIMS[a]||ANIMS.idle; return Object.assign({},REST,A.pose(i%A.n)); }
  /* ---------- geometria ---------- */
  function geo(P){ const O={x:AX+P.hx-2,y:GROUND-10.4-P.lift}, a=rad(P.rock), c=Math.cos(a), s=Math.sin(a);
    const T=(lx,ly)=>({x:O.x+lx*c-ly*s, y:O.y+lx*s+ly*c});
    const nk=Math.max(0.1,P.neck), base=T(12,-3), hc={x:base.x+9.6*nk, y:base.y-6.6*nk+2.4*(1-nk)};
    return {O,T,a,base,hc,ha:rad(P.ht)+a*0.4}; }
  /* ---------- desenho ---------- */
  function leg(p,M,g,P,lx,key,front){ const st=P[key], h=1-P.hide*0.85;
    const root=g.T(lx,2), foot={x:root.x+st[0]*h, y:Math.min(GROUND-1.6,root.y+6.6*h-st[1])};
    C.vol(p,root,foot,front?5:5.4,4.6,M.skin,M.skinX);
    if(front&&h>0.4){ p.F(M.scale[2]); p.ell(lerp(root,foot,0.45).x+0.8,lerp(root,foot,0.45).y,1.3,1); p.F(M.scale[1]); p.ell(lerp(root,foot,0.45).x+1.1,lerp(root,foot,0.45).y-0.3,0.9,0.6); }
    if(h>0.4){ C.shade(p,[['e',foot.x+0.8,foot.y+0.6,3,1.6]],M.skin,M.skinX,2,{spec:false}); p.F(M.claw[1]); [0,1.3,2.6].forEach(k=>p.rect(foot.x+0.4+k,foot.y+1.2,0.8,0.8)); }
  }
  function drawShell(p,M,g,P,v){ const G=P.gold, R=G?M.gold:M.plate, X=G?M.goldX:M.plateX, MR=G?M.gold:M.marg, MX=G?M.goldX:M.margX;
    p.xf(g.a,g.O.x,g.O.y);
    // plastrão (barriga) aparece embaixo
    C.shade(p,[['e',1,3.2,15,2.6]],M.plast,M.plastX,2.4,{spec:false});
    // domo
    const dh=16+(P.dome||0), dome=[]; for(let k=0;k<=16;k++){ const t=Math.PI*k/16; dome.push([-Math.cos(t)*17.6,-Math.sin(t)*dh+0.6]); }
    C.shade(p,[['p',dome]],R,X,12,{c:P2(0,-7)});
    // placas: sulcos e aréolas
    if(!G||G<2){ const sc=[[-11,-6,4,3.4],[-4,-10.6,4.4,3.6],[4,-10.4,4.4,3.6],[11,-6,3.8,3.2],[0,-4.4,4,2.6],[-8,-1.6,3.4,2],[8,-1.6,3.4,2]];
      p.F(X[3]); p.poly([[-14,-1],[-7.4,-8.4],[0,-13.6],[7.4,-8.4],[14,-1],[13.4,-0.4],[7,-7.6],[0,-12.4],[-7,-7.6],[-13.4,-0.4]]);
      p.F(X[3]); p.rect(-0.4,-15.6,0.9,15); p.poly([[-7.4,-8.4],[-4,-3],[-3.4,-3.4],[-6.8,-8.8]]); p.poly([[7.4,-8.4],[4,-3],[3.4,-3.4],[6.8,-8.8]]);
      sc.forEach(([x,y,rx,ry])=>{ C.shade(p,[['e',x,y,rx*0.92,ry*0.92]],X,X,rx,{lite:false}); p.F(R[0]); p.ell(x+rx*0.25,y-ry*0.55,rx*0.6,ry*0.22); C.shade(p,[['e',x+0.3,y-0.2,rx*0.48,ry*0.46]],G?M.gold:M.areola,G?M.goldX:M.areolaX,rx*0.5,{spec:true}); });
    }
    // marginais (borda serrilhada com pinta)
    for(let k=0;k<9;k++){ const x=-16+k*4; p.F(k%2?MX[2]:MR[1]); p.poly([[x-0.2,0],[x+3.8,0],[x+3.6,3],[x+1.8,3.8],[x,3]]); p.F(G?M.goldX[0]:M.areola[1]); p.rect(x+1.2,1,1.4,1.2); p.F(MX[3]); p.rect(x+3.6,0,0.6,3); }
    p.F(MR[0]); p.rect(-15,-0.4,24,0.7);
    if(v==='musgo'&&!G){ C.shade(p,[['e',-5,-14,4,1.6],['e',2,-15.4,3.4,1.2]],M.moss,M.mossX,3,{spec:false}); p.F(M.moss[0]); p.rect(-6,-15,1,1); p.rect(1,-16.4,1,0.8); }
    // arnês de couro com fivela e argola
    if(!G){ p.F(M.strapX[2]); p.poly([[-9.6,-12.6],[-7.2,-13.4],[8.8,0.8],[6.4,1.4]]); p.F(M.strap[1]); p.poly([[-9.2,-12.8],[-7.6,-13.3],[8.2,0.6],[6.8,1]]);
      p.F(M.strap[0]); [0,1,2,3].forEach(k=>p.rect(-6.4+k*3.6,-10.6+k*3.1,0.8,0.6));
      C.shade(p,[['e',-1,-6.6,2,1.8]],M.metal,M.metalX,1.8); p.F(M.metalX[3]); p.rect(-1.4,-7,0.9,0.9);
      p.F(M.metal[2]); p.ell(-8.4,-14.6,1.8,1.4); p.F(M.plateX[3]); p.ell(-8.4,-14.6,0.9,0.6); }
    p.id(); }
  function drawHead(p,M,g,P){ const nk=Math.max(0.1,P.neck); if(nk<0.2&&P.hide>0.9){ // só o rosto espiando na abertura
      const q=g.T(13.6,-1.6); p.F(M.skinX[3]); p.ell(q.x,q.y,3,2.4); C.eye(p,q.x+0.6,q.y-0.2,1,1.2,P.eye,M.iris,M.ink[1]); return; }
    // pescoço enrugado
    C.vol(p,g.base,lerp(g.base,g.hc,0.95),5.6,5,M.skin,M.skinX);
    p.F(M.skinX[2]); [0.3,0.55].forEach(t=>{ const q=lerp(g.base,g.hc,t); p.rect(q.x-1.6,q.y+0.6,2.6,0.6); });
    const h=g.hc; p.xf(g.ha,h.x,h.y);
    const HD=[['e',1.6,-1.6,7.2,6],['e',5.4,0.4,4.6,4]];
    C.shade(p,HD,M.skin,M.skinX,5.4,{c:P2(2,-1),hl:1.5});
    // escamas vermelhas
    C.within(p,HD,()=>{ [[-1.6,-5,1.8,1.4],[1.6,-5.8,1.7,1.3],[-3.6,-2,1.6,1.4],[-1,1.4,1.6,1.2],[4.8,-4.6,1.2,1]].forEach(([x,y,rx,ry],k)=>{ const sc=(k===1)?M.areola:M.scale, sx=(k===1)?M.areolaX:M.scaleX; C.shade(p,[['e',x,y,rx,ry]],sc,sx,rx,{spec:false}); }); });
    // boca/mandíbula
    p.xf(g.ha+rad(P.jaw),h.x+Math.cos(g.ha)*4.2-Math.sin(g.ha)*2,h.y+Math.sin(g.ha)*4.2+Math.cos(g.ha)*2);
    if(P.jaw>4){ p.F(M.mouth[2]); p.poly([[-1,-0.6],[5,-0.8],[4.6,0.8],[-0.6,0.6]]); }
    C.shade(p,[['p',[[-1.6,0],[5,-0.4],[4.4,1.8],[0,2.2]]]],M.beak,M.beakX,1.8,{spec:false});
    p.xf(g.ha,h.x,h.y);
    // bico de cima em gancho
    C.shade(p,[['p',[[4.4,-2.4],[8.6,-1.6],[9.4,0.6],[8.2,2.6],[7.2,1.4],[4,1.4]]]],M.beak,M.beakX,2.4,{c:P2(6.6,0)});
    p.F(M.ink[1]); p.rect(8,-1.2,0.8,0.7);
    if(P.leaf>0){ const L=P.leaf; p.F(M.leaf[1]); p.poly([[7,1.6],[7+7*L,-0.6],[7+8*L,2.6],[7+3*L,3.4]]); p.F(M.leaf[0]); p.poly([[7.6,1.6],[7+6*L,0],[7+6*L,0.6]]); p.F(M.leafX[2]); p.rect(7,1.8,6*L,0.5); }
    // olho grande e sobrancelha rabugenta
    C.eye(p,3,-2,2.4,2.7,P.eye,M.iris,M.ink[1],{lid:M.skin[2]});
    if(P.brow&&P.eye!=='happy'&&P.eye!=='sleep'&&P.eye!=='closed'){ p.F(M.skinX[3]); p.poly([[0,-5.4],[5.6,-4.6],[5.6,-3.9],[0,-4.6]]); p.F(M.skin[0]); p.rect(0.4,-6.3,4.4,0.7); }
    p.F(M.mouthX[0]); if(P.eye==='happy') p.ell(4.6,1.4,1.2,0.6);
    p.id(); }
  function drawFx(p,P,g){ p.id(); const F=C.FXC, h={x:g.hc.x,y:g.hc.y-8};
    if(P.fx==='zzz'){ const q=g.T(16,-10); [0,0.34,0.67].forEach((o,k)=>{ const u=(P.fxt+o)%1; C.zzz(p,q.x+u*6+k,q.y-u*12,1.8+u*1.8,F.z); }); }
    if(P.fx==='heart'){ [0,0.5].forEach((o,k)=>{ const u=(P.fxt+o)%1; C.heart(p,h.x+(k?6:-4),h.y-u*10,1.3+u*0.8,F.heart[0],F.heart[1]); }); }
    if(P.fx==='dust'){ const q=g.T(-17,4); C.dust(p,q.x-2-P.fxt*4,GROUND-2-P.fxt*2,1.6+P.fxt,F.dust[0],F.dust[1]); }
    if(P.gold===2){ const c=g.T(0,-6), r=22; p.F('#ffe27a'); for(let k=0;k<=14;k++){ const a=Math.PI+Math.PI*k/14; p.rect(c.x+Math.cos(a)*r-0.6,c.y+Math.sin(a)*r*0.9-0.6,1.3,1.3); }
      C.sparkle(p,c.x-12,c.y-16,2.2,'#fff6c0'); C.sparkle(p,c.x+14,c.y-12,1.6,'#fff6c0'); }
  }
  const cache=C.mkCache(500);
  function frame(v,anim,fi,step=5){
    if(!VARS[v]) v='piranga'; if(!ANIMS[anim]) anim='idle';
    const K=PIX.getK(), key=v+'|'+anim+'|'+fi+'|'+step+'@'+K, hit=cache.get(key); if(hit) return hit;
    const P=poseOf(anim,fi), M=mats(v), g=geo(P), pw=C.pen;
    const parts=[
      {back:true,draw:(c,u)=>{ const p=pw(c,u); leg(p,M,g,P,-9,'rf',false); leg(p,M,g,P,8,'ff',true); }},
      {draw:(c,u)=>drawHead(pw(c,u),M,g,P)},
      {draw:(c,u)=>{ const p=pw(c,u); leg(p,M,g,P,-12,'rn',false); leg(p,M,g,P,10.6,'fn',true); }},
      {draw:(c,u)=>drawShell(pw(c,u),M,g,P,v)},
    ];
    if(P.fx||P.gold===2) parts.push({noShade:true,noRim:true,smear:true,draw:(c,u)=>drawFx(pw(c,u),P,g)});
    const cv=C.build({FW,FH,GROUND,parts,M,step,flash:P.flash,rim:RIM});
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._fx=sc({x:g.hc.x+10,y:g.hc.y}); cv._center=sc(g.T(0,-6)); cv._top=sc(g.T(0,-18)); cv._head=sc(g.hc); cv._mouth=sc({x:g.hc.x+8,y:g.hc.y+1});
    return cache.set(key,cv);
  }
  const META={id:'jabuti', nome:'Jabuti', sub:'piranga', papel:'Pet tanque', hab:'Casco-Escudo',
    lede:'Um jabuti-piranga velho de guerra, teimoso e calmo, lento demais pra andar sozinho: vai preso nas costas do recruta por um arnês de couro e só desce pra morder ou virar escudo.',
    habDesc:'Recolhe cabeça e patas, o casco fica dourado e uma cúpula de luz protege quem está atrás dele. No jogo: bloqueia o próximo golpe que atingiria o recruta.',
    rows:[['Cabeça','Cabeção chibi escuro com escamas vermelho-alaranjadas e uma amarela no topo, bico córneo em gancho, sobrancelha rabugenta e olhão âmbar.','Cabeça com volume em 7 tons, 5 escamas, bico em duas peças (a mandíbula abre 30° no bote) e olho com 2 brilhos.'],
      ['Casco','Domo alto quase preto, placas de aréola amarela, marginais serrilhadas com pinta.','Domo esculpido (sombra roxa grande, luz quente no alto), sulcos entre placas, 7 aréolas com brilho e 9 marginais pintadas.'],
      ['Patas','Patas-coluna curtas, as dianteiras com escama vermelha, pés com 3 garras.','As do lado de lá um tom mais escuras; recolhem no Casco-Escudo e no sono.'],
      ['Arnês','Cinta de couro com pesponto, fivela de metal e argola.','Some no Casco-Escudo, quando o casco vira ouro.'],
      ['Especial','Casco-Escudo: recolhe, fica dourado com cúpula de luz, sai feliz com coração.','6 quadros: susto, recolhe, casco dourado, cúpula (420 ms), sai e olho ^ com coração.']]};
  return {PS,FW,FH,GROUND,AX,VARS,ANIMS,NAMES,mats,poseOf,frame,META,RIM};
})();

/* ===== hub/papa ===== */
/* ===== PET: Papagaio-verdadeiro (vigia tagarela) ===== */
/* PAPA — fonte de arte (editável). Build: npm run art */
/* Chibi hi-bit: cabeção com coroa e rosto amarelos, testa azul, anel creme e íris laranja, bico curvo enorme;
   corpo verde em escamas de pena (8 tons), ombro vermelho, rêmiges azuis, lenço vermelho com lua bordada. */
const PAPA=(function(){
  const {rad,lerp,P2}=PIX, C=PETCORE;
  const FW=76, FH=80, GROUND=72, AX=36, RIM='#a9c8f0', PS=1;
  const VARS={verdadeiro:{nome:'Verdadeiro'}, campeiro:{nome:'Rosto dourado'}, azulao:{nome:'Azulão (raro)'}};
  const mcache={};
  function mats(v){ if(mcache[v]) return mcache[v]; const M={}, AZ=v==='azulao';
    C.mat(M,'green',AZ?'#3a8ad0':'#3fa548',1.1); C.mat(M,'belly',AZ?'#6ab4ec':'#8ccc58',1.05);
    C.mat(M,'yellow',v==='campeiro'?'#ffc83a':'#f2d23a',1.1); C.mat(M,'blue',AZ?'#40d0e8':'#3d8fe0',1.1); C.mat(M,'red','#d8392c',1.1);
    C.mat(M,'remige',AZ?'#2a4a9a':'#2d5f9a',1.05); C.mat(M,'tip',AZ?'#80d0f0':'#c4d84a',1.05); C.mat(M,'beak','#4a4652',0.8); C.mat(M,'ring','#ece6da',0.6);
    C.mat(M,'iris','#f08a24',1.2); C.mat(M,'leg','#8f8a96',0.8); C.mat(M,'scarf','#b8283a',1.1); C.mat(M,'tongue','#d07080',1); C.mat(M,'wood','#7a5232',1); C.mat(M,'leaf','#4fa83a',1.1);
    M.ink=['#2a1620','#160a10','#0e060a','#060204'];
    return (mcache[v]=M); }
  const NAMES={green:'Pena',belly:'Barriga',yellow:'Rosto/coroa',blue:'Testa',red:'Ombro',remige:'Rêmiges',beak:'Bico',scarf:'Lenço',iris:'Íris'};
  const S=Math.sin, Cc=Math.cos, TAU=Math.PI*2;
  const REST={hx:0,alt:0,ang:10,fly:0,wing:0,wingsUp:0,ht:0,jaw:0,crest:0,eye:'open',hop:0,flash:0,tail:0,fluff:0,perch:0,tuck:0,foot:0,fx:null,fxt:0};
  const WV=[-1,-0.75,-0.3,0.15,0.65,1,0.55,-0.3];
  const ANIMS={
    idle:{nome:'Parado',n:8,dur:i=>[170,150,150,170,160,120,120,170][i],pose:i=>{ const p=i/8*TAU, s=S(p);
      return {ht:[0,4,8,10,6,0,-4,-2][i],tail:2*s,hop:0.3*s,fluff:i===3||i===4?0.6:0,eye:i===6?'closed':(i===5?'half':'open')}; }},
    fly:{nome:'Voar',n:8,dur:()=>80,pose:i=>({fly:1,ang:72,alt:10-WV[i]*2.4,wing:WV[i],ht:-52,tail:-6+WV[i]*4})},
    perch:{nome:'No poleiro',n:8,dur:()=>200,pose:i=>{ const p=i/8*TAU; return {perch:1,hop:6+0.4*S(p),ht:6*S(p),fluff:0.4+0.4*S(p),foot:i>=4?1:0,eye:i===3||i===4?'half':(i===5?'closed':'open'),tail:2*S(p)}; }},
    hop:{nome:'Pulinho no chão',n:6,dur:()=>95,pose:i=>{ const up=[0,3,6,6,3,0][i]; return {hop:up,hx:[-2,-1,0,1,2,2][i]*0.6,ang:16-up,ht:-up,tail:up*1.2,wingsUp:i===2||i===3?0.4:0,eye:'open'}; }},
    happy:{nome:'Dancinha',n:8,dur:()=>110,pose:i=>{ const p=i/8*TAU; return {ht:-14+16*S(2*p),ang:16+6*S(2*p),hop:2*Math.max(0,S(2*p)),crest:0.6+0.4*S(2*p),eye:'happy',jaw:6,fx:'note',fxt:i/8,tail:4*S(2*p)}; }},
    talk:{nome:'Tagarelar ("currupaco!")',n:6,dur:i=>[140,110,110,110,110,180][i],pose:i=>[
      {crest:0.4,ht:-4},{crest:0.8,jaw:18,ht:-10,fx:'chat',fxt:0},{crest:0.6,jaw:4,ht:-4,fx:'chat',fxt:0.35},{crest:0.9,jaw:20,ht:-12,fx:'chat',fxt:0.7},{crest:0.5,jaw:6,ht:-2,fx:'chat',fxt:1},{}][i]},
    sleep:{nome:'Dormir',n:8,dur:()=>240,pose:i=>{ const p=i/8*TAU; return {tuck:1,ht:100,fluff:1+0.3*S(p),eye:'sleep',hop:-0.6+0.3*S(p),fx:'zzz',fxt:i/8}; }},
    attack:{nome:'Bicada',n:6,dur:i=>[140,190,80,120,140,140][i],pose:i=>[
      {eye:'angry'}, {ang:4,ht:-22,crest:1,jaw:10,eye:'angry',hx:-2}, {ang:24,ht:8,crest:1,hx:2,eye:'angry',jaw:14}, {ang:32,ht:16,crest:0.8,hx:4,eye:'angry',fx:'hit',fxt:0}, {ang:22,ht:4,hx:2}, {}][i]},
    special:{nome:'Grito "ZUMBI!"',n:6,dur:i=>[160,180,260,240,240,180][i],pose:i=>[
      {eye:'wide',crest:0.4}, {wingsUp:1,crest:0.7,ang:10,eye:'wide'}, {wingsUp:1,crest:1,jaw:28,ang:6,eye:'wide',fx:'shout',fxt:0}, {wingsUp:1,crest:1,jaw:24,hop:5,eye:'wide',fx:'shout',fxt:0.5}, {crest:0.6,jaw:10,fx:'shout',fxt:1}, {}][i]},
    shoulder:{nome:'No ombro do recruta',n:8,dur:()=>200,shoulder:true,pose:i=>{ const p=i/8*TAU; return {ht:5*S(p),tail:2*S(p),hop:0.3*S(p),eye:i===5?'closed':'open',fluff:i===2?0.6:0}; }},
    hurt:{nome:'Dano',n:3,dur:i=>[80,120,170][i],pose:i=>[{flash:1,hx:-3,ht:-16,eye:'closed',crest:1},{hx:-2,ht:-10,eye:'closed',crest:0.8,fluff:1},{eye:'half'}][i]},
  };
  function poseOf(a,i){ const A=ANIMS[a]||ANIMS.idle; return Object.assign({},REST,A.pose(i%A.n)); }
  function tr(c,a,lx,ly){ const co=Math.cos(a), s=Math.sin(a); return {x:c.x+lx*co-ly*s, y:c.y+lx*s+ly*co}; }
  function geo(P){ const Cn={x:AX+P.hx,y:GROUND-12.6-P.hop-P.alt}, a=rad(P.ang); return {C:Cn,a,head:tr(Cn,a,1.8,-12.2),sh:tr(Cn,a,-1,-6)}; }
  /* ---------- desenho ---------- */
  function wingOpen(p,M,base,ang,back){ p.xf(ang,base.x,base.y);
    C.shade(p,[['p',[[0,-3.4],[11,-4.4],[16,-2],[14,3],[0,3.4]]]],M.green,M.greenX,5,{c:P2(7,0),spec:false,lite:!back});
    C.shade(p,[['p',[[7,-4],[14,-2.6],[13.4,2.4],[7,2.6]]]],M.red,M.redX,3,{spec:false,lite:!back});
    for(let k=0;k<5;k++){ C.vol(p,P2(12.6,-2.6+k*1.4),P2(24-k*1.6,-3+k*2.4),2.2,1.5,k%2?M.remigeX:M.remige,M.remigeX,{noLite:back}); }
    p.F(M.green[0]); p.rect(1.6,-3,7,0.7);
    p.id(); }
  function drawLegs(p,M,g,P,near){ if(P.fly) return; const hip=tr(g.C,g.a,near?2.6:-0.6,8.6), y=P.perch?GROUND-6.6:GROUND-1.2;
    if(near&&P.foot){ C.shade(p,[['e',hip.x,hip.y,2.6,2.2]],M.belly,M.bellyX,2,{spec:false}); return; }
    const f={x:hip.x+(near?1:-1.6),y};
    C.vol(p,hip,f,2.4,2,M.leg,M.legX);
    p.F(M.leg[1]); p.cap(f,P2(f.x+3.2,f.y+0.4),1.4,1.2); p.cap(f,P2(f.x-2.4,f.y+0.4),1.3,1.1); p.F(M.ink[1]); p.rect(f.x+3.2,f.y,0.8,0.8); p.rect(f.x-3.2,f.y,0.8,0.8);
    if(near){ C.shade(p,[['e',hip.x-0.4,hip.y-1.4,2.8,2.4]],M.green,M.greenX,2.4,{spec:false}); } }
  function drawBody(p,M,g,P){ const fl=1+0.08*P.fluff;
    // cauda
    p.xf(g.a+rad(P.tail+(P.fly?0:34)),g.C.x,g.C.y);
    C.shade(p,[['p',[[-3.4,6],[3.2,6],[3.8,16],[-2.8,16.4]]]],M.green,M.greenX,3.4,{c:P2(0,12),spec:false});
    p.F(M.greenX[2]); p.rect(-0.4,8,1.2,6); C.shade(p,[['p',[[-2.8,13.6],[3.6,13.4],[3.8,16.4],[-2.8,16.6]]]],M.tip,M.tipX,2,{spec:false});
    p.F(M.remige[1]); p.rect(-2.8,12.4,6.4,1);
    // corpo-ovo com escamas de pena
    p.xf(g.a,g.C.x,g.C.y);
    const B=[['e',0,0.6,7.8*fl,9.4*fl]];
    C.shade(p,B,M.green,M.greenX,7,{c:P2(0,0)});
    C.within(p,B,()=>{ C.shade(p,[['e',3.4,3,4.6,8]],M.belly,M.bellyX,4,{spec:false});
      for(let r=0;r<5;r++) for(let k=0;k<3;k++){ const x=-1+k*2.4+(r%2)*1.2, y=-5+r*3; p.F(r<2?M.greenX[2]:M.bellyX[2]); p.poly([[x,y],[x+1.8,y],[x+0.9,y+1.1]]); } });
    C.tufts(p,[P2(6,4),P2(4.6,9)],1,M.belly[1],2);
    p.id(); }
  function drawWingFolded(p,M,g,P){ if(P.fly||P.wingsUp>=1) return; p.xf(g.a,g.C.x,g.C.y);
    const W=[['e',-2.4,1.2,5,8]];
    C.shade(p,W,M.green,M.greenX,5,{c:P2(-2,0),spec:false});
    C.shade(p,[['e',-1.6,-5.4,3,2.6]],M.red,M.redX,2.6,{spec:false}); p.F(M.yellow[1]); p.rect(-2,-5,1,1);
    C.shade(p,[['p',[[-6,4],[-1,4],[0,13.4],[-3.8,12.4]]]],M.remige,M.remigeX,3,{spec:false});
    p.F(M.remige[0]); p.rect(-4.2,6,0.8,5.6); p.F(M.remigeX[3]); p.rect(-2.2,6,0.6,5.6);
    [[-4.4,0],[-1,0.4],[-3,-2.4]].forEach(([x,y])=>{ p.F(M.greenX[2]); p.poly([[x,y],[x+2,y],[x+1,y+1.2]]); });
    p.id(); }
  function drawHead(p,M,g,P){ const H=g.head;
    // lenço com lua
    p.xf(g.a,g.C.x,g.C.y);
    C.shade(p,[['p',[[-3,-9.4],[6.6,-8.6],[2.6,-2.4]]]],M.scarf,M.scarfX,3,{c:P2(2,-7),spec:false});
    p.F(M.scarfX[3]); p.rect(-2.6,-9.4,9,0.9); p.F(M.ring[0]); p.poly([[1.6,-7],[2.8,-6.6],[2.4,-5.4],[2.8,-4.6],[1.6,-5]]);
    p.F(M.scarf[1]); p.poly([[-4,-9],[-8,-6],[-5.6,-5.6]]);
    if(P.tuck){ // dormindo: cabeça virada pras costas, enfiada na asa
      p.xf(g.a,g.C.x,g.C.y); C.shade(p,[['e',-1,-10,5.6,5]],M.green,M.greenX,5,{spec:false}); C.shade(p,[['e',-1.6,-9,3.4,2.6]],M.yellow,M.yellowX,3,{spec:false});
      C.eye(p,0.4,-11,1.4,1.6,'sleep',M.iris,M.ink[1]); p.F(M.beak[2]); p.poly([[-3,-8],[-6,-7],[-3.6,-6]]); p.id(); return; }
    const ha=g.a*0.6+rad(P.ht); p.xf(ha,H.x,H.y);
    if(P.crest>0){ const L=2+P.crest*5; C.shade(p,[['p',[[-4,-4],[-6-L*0.6,-6-L],[-2,-6.4]]]],M.green,M.greenX,2,{spec:false}); C.shade(p,[['p',[[-2.4,-5.6],[-2-L*0.4,-8-L],[0.6,-6]]]],M.yellow,M.yellowX,2,{spec:false}); }
    const HD=[['e',0,0,7.4,7]];
    C.shade(p,HD,M.green,M.greenX,6,{c:P2(0,0)});
    C.within(p,HD,()=>{ C.shade(p,[['e',-0.6,-5,4,2.4]],M.yellow,M.yellowX,3,{spec:false}); C.shade(p,[['e',2.6,2,4.4,3.8]],M.yellow,M.yellowX,3.4,{spec:false}); C.shade(p,[['e',4.6,-3.4,2.6,1.8]],M.blue,M.blueX,2,{spec:false}); });
    C.tufts(p,[P2(-6.4,-1),P2(-5,4),P2(-1,6.2)],1.1,M.green[1],2);
    // olho com anel creme
    if(P.eye==='open'||P.eye==='wide'||P.eye==='angry'||P.eye==='half') { C.shade(p,[['e',1.6,-0.8,3,3]],M.ring,M.ringX,2.4,{spec:false}); }
    C.eye(p,1.8,-0.8,1.9,2.1,P.eye,M.iris,M.ink[1],{lid:M.green[2],pupil:0.42});
    p.F(M.belly[0]); p.ell(1.4,4,1.6,0.8);
    // bico grande em gancho (mandíbula separada)
    const jb=tr(H,ha,5,2.4); p.xf(ha+rad(P.jaw),jb.x,jb.y);
    if(P.jaw>4){ p.F(M.tongue[2]); p.poly([[-0.6,-1],[3.6,-0.8],[3,1.6],[0,1.4]]); C.shade(p,[['e',1.6,0,1.4,0.8]],M.tongue,M.tongueX,1,{spec:false}); }
    C.shade(p,[['p',[[-0.6,0],[3.8,0.2],[3,2.2],[0,2]]]],M.beak,M.beakX,1.4,{spec:false});
    p.xf(ha,H.x,H.y);
    C.shade(p,[['p',[[4.2,-3.6],[7.6,-2.6],[9.4,0.4],[8.8,3.6],[7.6,4.6],[7.4,2.4],[5.6,1.4],[3.8,1.6]]]],M.beak,M.beakX,3,{c:P2(6.4,0)});
    p.F(M.beakX[3]); p.rect(4.6,-2.6,0.8,0.8);
    p.id(); }
  function drawPerch(p,M,g){ p.id(); const y=GROUND-5.4; C.vol(p,P2(g.C.x-14,y+0.6),P2(g.C.x+14,y-0.4),3,3,M.wood,M.woodX);
    p.F(M.woodX[3]); p.rect(g.C.x-8,y-1,0.7,1.6); p.rect(g.C.x+9,y-1.2,0.7,1.6);
    C.shade(p,[['p',[[g.C.x+11,y-1],[g.C.x+15,y-5],[g.C.x+17,y-3],[g.C.x+13,y]]]],M.leaf,M.leafX,2,{spec:false});
    C.vol(p,P2(g.C.x+12,y+1),P2(g.C.x+12,GROUND),1.6,1.4,M.wood,M.woodX); }
  function drawFx(p,P,g){ p.id(); const F=C.FXC, H=g.head, ha=g.a*0.6+rad(P.ht), m=tr(H,ha,10,1);
    if(P.fx==='zzz'){ [0,0.34,0.67].forEach((o,k)=>{ const u=(P.fxt+o)%1; C.zzz(p,H.x+2+u*6+k,H.y-6-u*10,1.8+u*1.8,F.z); }); }
    if(P.fx==='note'){ [0,0.5].forEach((o,k)=>{ const u=(P.fxt+o)%1; C.note(p,H.x+(k?8:-8)+S(u*6),H.y-6-u*10,2,F.note); }); }
    if(P.fx==='chat'){ C.shout(p,m.x+1+P.fxt*2,m.y,3.4+P.fxt*2,F.bark,3); }
    if(P.fx==='hit'){ C.sparkle(p,m.x+2,m.y+2,3.6,'#fff6c0'); }
    if(P.fx==='shout'){ // balão "!" + ondas
      const bx=H.x+6, by=H.y-20+P.fxt*-2; p.F('#170b1c'); p.ell(bx,by,8.6,6); p.poly([[bx-3,by+4],[bx-6,by+9],[bx,by+5]]);
      p.F('#fff4e0'); p.ell(bx,by,7.6,5); p.poly([[bx-2.6,by+3.6],[bx-5,by+7.6],[bx-0.6,by+4.2]]);
      p.F('#d8392c'); p.rect(bx-0.9,by-3.6,1.8,4.6); p.rect(bx-0.9,by+1.8,1.8,1.6); p.rect(bx-4.6,by-3,1.4,3.4); p.rect(bx-4.6,by+1.6,1.4,1.2); p.rect(bx+3.2,by-3,1.4,3.4); p.rect(bx+3.2,by+1.6,1.4,1.2);
      C.shout(p,m.x+2,m.y,4+P.fxt*3,F.bark,3); }
  }
  const cache=C.mkCache(600);
  function frame(v,anim,fi,step=5){
    if(!VARS[v]) v='verdadeiro'; if(!ANIMS[anim]) anim='idle';
    const K=PIX.getK(), key=v+'|'+anim+'|'+fi+'|'+step+'@'+K, hit=cache.get(key); if(hit) return hit;
    const P=poseOf(anim,fi), M=mats(v), g=geo(P), pw=C.pen;
    const wA=P.fly?rad(-105+P.wing*70):rad(-128), wAn=P.fly?rad(-92+P.wing*78):rad(-112);
    const parts=[];
    if(P.perch) parts.push({draw:(c,u)=>drawPerch(pw(c,u),M,g)});
    if(P.fly||P.wingsUp) parts.push({back:true,draw:(c,u)=>wingOpen(pw(c,u),M,tr(g.C,g.a,-2.4,-6.6),wA,true)});
    parts.push({back:true,draw:(c,u)=>drawLegs(pw(c,u),M,g,P,false)});
    parts.push({draw:(c,u)=>drawBody(pw(c,u),M,g,P)});
    parts.push({draw:(c,u)=>drawLegs(pw(c,u),M,g,P,true)});
    parts.push({draw:(c,u)=>drawWingFolded(pw(c,u),M,g,P)});
    parts.push({draw:(c,u)=>drawHead(pw(c,u),M,g,P)});
    if(P.fly||P.wingsUp) parts.push({draw:(c,u)=>wingOpen(pw(c,u),M,g.sh,wAn,false)});
    if(P.fx) parts.push({noShade:true,noRim:true,smear:true,draw:(c,u)=>drawFx(pw(c,u),P,g)});
    const cv=C.build({FW,FH,GROUND,parts,M,step,flash:P.flash,rim:RIM});
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._fx=sc(tr(g.head,rad(P.ht),10,0)); cv._center=sc(g.C); cv._top=sc({x:g.head.x,y:g.head.y-8}); cv._feet=sc({x:AX+P.hx,y:GROUND}); cv._head=sc(g.head);
    return cache.set(key,cv);
  }
  const META={id:'papagaio', nome:'Papagaio', sub:'verdadeiro', papel:'Pet vigia', hab:'Grito "ZUMBI!"',
    lede:'Um papagaio-verdadeiro tagarela e vigilante, que vê tudo do alto e não guarda segredo: quando fareja uma variante rara, sai voando em círculos e berra "ZUMBI!" pro bando inteiro ouvir.',
    habDesc:'Avisa das variantes raras (Enluarado e Plenilunar) antes de entrarem na tela, e no automático dá +3 s no tempo dos puzzles de baú (de 5 s pra 8 s). Voa ao lado do squad e pousa no ombro do recruta quando o squad para.',
    rows:[['Cabeça','Cabeção chibi com coroa amarela, testa azul, olho com anel de pele creme e íris laranja.','Volume em 7 tons, rosto e coroa amarelos recortados, anel creme e olho com 2 brilhos. Gira até 22° na bicada e na dancinha.'],
      ['Bico','Curvo, cinza-chumbo, ponta em gancho, mandíbula separada que abre ~28°.','Bico em duas peças com reflexo; a de baixo gira e mostra a língua no grito e no tagarelar.'],
      ['Corpo e asas','Corpo-ovo verde com barriga clara e escamas de pena. Asa com ombro vermelho e rêmiges azuis.','Asa dobrada no flanco e, aberta, com coberteiras verdes, faixa vermelha e 5 rêmiges azuis em volume.'],
      ['Cauda e lenço','Cauda quadrada com ponta verde-amarelada. Lenço vermelho-sangue com uma lua bordada.','Cauda com faixa azul e ponta clara; lenço triangular com a lua creme e a ponta do nó atrás da nuca.'],
      ['Especial','Grito: arregala, enche o peito, abre as asas, balão "!!!" e ondas de som.','6 quadros, com o balão e as ondas de som entre o 3º e o 5º quadro. A crista arrepia.']]};
  return {PS,FW,FH,GROUND,AX,VARS,ANIMS,NAMES,mats,poseOf,frame,META,RIM};
})();

/* ===== hub/sagu ===== */
/* ===== PET SAGUI (de tufo branco): pequeno, rabo anelado longo, pula, pendura e vasculha ===== */
/* SAGU — fonte de arte (editável). Build: npm run art */
/* Chibi hi-bit: cabeção com máscara escura e losango branco na testa, dois leques de pelo branco enormes,
   olhos grandes âmbar, corpinho listrado, mãos escuras, pochete remendada e rabo anelado comprido. */
const SAGU=(function(){
  const {rad,lerp,P2}=PIX, C=PETCORE;
  const FW=88, FH=84, GROUND=76, AX=42, RIM='#a9c8f0', PS=1;
  const CFG={AX,GROUND,bodyY:50,shX:5.6,hipX:-6.4,fl:[4.2,4.2],hl:[4.8,4.8],neck:[7,-3.6],tailRoot:[-10,-1.6],paw:1.1,legY:2.6,
    hull:[[-9,4.4,0.3],[0,5.4,0]]};
  const VARS={branco:{nome:'Tufo branco'}, preto:{nome:'Tufo preto'}, dourado:{nome:'Dourado (raro)'}};
  const mcache={};
  function mats(v){ if(mcache[v]) return mcache[v]; const M={}, D=v==='dourado';
    C.mat(M,'fur',D?'#e0902e':'#9a8e7e',1.1); C.mat(M,'stripe',D?'#a85c16':'#5a5048',1.05); C.mat(M,'chest',D?'#f6d08a':'#cfc2aa',1);
    C.mat(M,'face',D?'#6a3a1c':'#3e302a',1); C.mat(M,'tuft',v==='preto'?'#3e3834':(D?'#fff0c8':'#f4f0e8'),0.8);
    C.mat(M,'blaze',v==='preto'?'#d8d2c6':'#ffffff',0.6); C.mat(M,'ringL',D?'#f0b060':'#b4ada4',1); C.mat(M,'ringD',D?'#8a4a14':'#3a3430',1);
    C.mat(M,'hand',D?'#5a3418':'#3a2e28',1); C.mat(M,'iris','#c07a3a',1.25); C.mat(M,'mouth','#c04a58',1.1);
    C.mat(M,'bag','#a09460',1.05); C.mat(M,'bagS','#6a4630',1); C.mat(M,'patch','#c8343e',1.1); C.mat(M,'brass','#d8a840',1.15); C.mat(M,'coin','#ffd23f',1.15);
    C.mat(M,'wood','#7a5232',1);
    M.ink=['#2a1620','#160a10','#0e060a','#060204'];
    return (mcache[v]=M); }
  const NAMES={fur:'Pelo',stripe:'Listras',chest:'Peito',face:'Cara',tuft:'Tufos',ringL:'Anel claro',ringD:'Anel escuro',bag:'Pochete',patch:'Remendo'};
  const S=Math.sin, Cc=Math.cos, TAU=Math.PI*2;
  const REST={bx:0,by:0,tilt:-8,head:4,tail:40,curl:14,fN:[4,-4],fF:[-2,-6],bN:[30,-24],bF:[24,-30],eye:'open',mouth:'closed',tufts:0,flash:0,free:0,lift:0,hang:0,coin:0,fx:null,fxt:0,find:0};
  const SIT={tilt:-52,head:44,bN:[86,-40],bF:[80,-46],fN:[30,10],fF:[20,0],tail:-14,curl:-18};
  const ANIMS={
    idle:{nome:'Parado',n:8,dur:i=>[170,150,150,170,150,110,110,150][i],pose:i=>{ const p=i/8*TAU, s=S(p);
      return {by:-0.4*s,head:4+3*S(p*2-0.4),tail:40+6*s,curl:14+6*S(p+1),tufts:i===3?0.5:0,eye:i===6?'closed':'open',mouth:i===2?'smile':'closed'}; }},
    walk:{nome:'Pular (andar)',n:8,dur:()=>85,pose:i=>{ const p=i/8*TAU, up=Math.max(0,S(p));
      const f=Math.cos(p);
      return {lift:5*up,tilt:-8-8*f,head:4+6*f,fN:[10+36*f,-6+30*f],fF:[4+36*f,-10+30*f],bN:[30-36*f,-24-30*Math.max(0,f)],bF:[24-36*f,-30-30*Math.max(0,f)],tail:44-10*f,curl:16+8*f}; }},
    run:{nome:'Disparada',n:6,dur:()=>65,pose:i=>{ const p=i/6*TAU, f=Math.cos(p), up=Math.max(0,S(p));
      return {lift:6*up,tilt:-2-10*f,head:-2+6*f,fN:[24+50*f,0+40*f],fF:[16+50*f,-4+40*f],bN:[20-50*f,-34-30*Math.max(0,f)],bF:[14-50*f,-40-30*Math.max(0,f)],tail:20,curl:8,eye:'wide',tufts:0.4}; }},
    sit:{nome:'Sentado',n:8,dur:()=>170,pose:i=>{ const p=i/8*TAU;
      return Object.assign({},SIT,{by:-0.3*S(p),head:SIT.head+4*S(p*2),curl:SIT.curl+6*S(p),eye:i===5?'closed':'open',fN:[30+6*S(p),10],mouth:i===2||i===3?'smile':'closed'}); }},
    sleep:{nome:'Dormir enrolado',n:8,dur:()=>240,pose:i=>{ const p=i/8*TAU;
      return {tilt:6,head:30,by:-0.4*S(p),fN:[80,96],fF:[74,94],bN:[86,-96],bF:[82,-100],tail:-30,curl:-40,eye:'sleep',fx:'zzz',fxt:i/8}; }},
    happy:{nome:'Feliz (cambalhota)',n:8,dur:i=>[90,80,70,70,70,70,80,110][i],pose:i=>{ const up=[0,6,12,15,15,12,6,0][i], rot=[0,-40,-130,-210,-290,-340,-360,0][i];
      return i===0||i===7?{eye:'happy',mouth:'smile',tufts:0.6,fx:'heart',fxt:i/8}:{free:0,lift:up,tilt:-8+rot,head:10,fN:[60,90],fF:[60,90],bN:[70,-60],bF:[70,-60],tail:20,curl:30,eye:'happy',mouth:'smile',tufts:0.8,fx:'heart',fxt:i/8}; }},
    chatter:{nome:'Tagarelar',n:6,dur:i=>[120,90,90,90,90,160][i],pose:i=>[
      {head:0,mouth:'open',eye:'wide',tufts:0.5},{head:-6,mouth:'open',tufts:0.8,fx:'chat',fxt:0},{head:2,mouth:'closed',tufts:0.6,fx:'chat',fxt:0.3},{head:-6,mouth:'open',tufts:0.9,fx:'chat',fxt:0.6},{head:2,mouth:'closed',tufts:0.6,fx:'chat',fxt:0.9},{mouth:'smile'}][i]},
    attack:{nome:'Arranhão',n:6,dur:i=>[140,230,70,110,140,140][i],pose:i=>[
      {eye:'angry'}, {tilt:-26,bx:-3,fN:[160,140],tufts:1,mouth:'open',eye:'angry'}, {tilt:-2,bx:5,fN:[100,80],eye:'angry'}, {tilt:2,bx:6,fN:[60,40],eye:'angry',fx:'hit',fxt:0}, {tilt:-4,bx:4}, {}][i]},
    special:{nome:'Vasculhar',n:6,dur:i=>[200,170,170,240,320,320][i],pose:i=>Object.assign({},SIT,[
      {}, {fN:[40,70],fF:[10,0],eye:'happy',fx:'dust',fxt:0}, {fN:[10,0],fF:[40,70],eye:'happy',fx:'dust',fxt:0.5}, {find:1,eye:'wide',tufts:1,fx:'bang',fxt:0}, {coin:1,fN:[170,190],eye:'happy',tufts:0.6,fx:'spark',fxt:0}, {coin:1,fN:[170,190],mouth:'smile',fx:'spark',fxt:0.5}][i])},
    hang:{nome:'Pendurado pelo rabo',n:4,dur:()=>240,pose:i=>({hang:1,free:1,tilt:94+[-6,0,6,0][i],head:-70+[0,2,0,-2][i],by:-6,bx:-2,tail:90,curl:24,fN:[150,160],fF:[140,150],bN:[200,190],bF:[190,180],eye:i===3?'closed':'open',mouth:'smile'})},
    hurt:{nome:'Dano',n:3,dur:i=>[80,120,170][i],pose:i=>[{flash:1,bx:-3,head:-14,eye:'closed',mouth:'open',tufts:1},{bx:-2,head:-8,eye:'closed',tufts:0.7},{eye:'half'}][i]},
  };
  function poseOf(a,i){ const A=ANIMS[a]||ANIMS.idle; return Object.assign({},REST,A.pose(i%A.n)); }
  /* ---------- desenho ---------- */
  const BODY=[['e',0,0,7.6,5.4],['e',-5.6,0,5.4,5.4],['e',4.6,-0.6,4.8,5.2]];
  function drawBody(p,M,sk){ p.xf(sk.a,sk.base.x,sk.base.y);
    C.shade(p,BODY,M.fur,M.furX,6,{c:P2(0,-1)});
    C.within(p,BODY,()=>{ [-9,-6,-3,0,3].forEach((x,k)=>{ p.F(k%2?M.stripeX[2]:M.stripe[1]); p.poly([[x,-6],[x+1.5,-6],[x+1,-1.6],[x-0.2,-2]]); });
      C.shade(p,[['e',2,5.6,9,2.8],['e',8,2,3.6,5]],M.chest,M.chestX,3,{spec:false}); });
    C.tufts(p,[P2(9.4,-1),P2(8.4,3.4),P2(5.6,5.6)],1.1,M.chest[1],2);
    p.id(); }
  function drawPouch(p,M,sk){ p.xf(sk.a,sk.base.x,sk.base.y);
    p.F(M.bagS[2]); p.poly([[5.6,-5.6],[7.2,-5.2],[-4,3.8],[-5.6,3.4]]); p.F(M.bagS[0]); p.poly([[6.2,-5.4],[6.8,-5.2],[-4.6,3.6],[-5,3.4]]);
    C.shade(p,[['p',[[-7.6,0.6],[-1,0.2],[-0.6,5.6],[-7.2,6]]]],M.bag,M.bagX,3.4,{c:P2(-4,3),spec:false});
    p.F(M.bagX[3]); p.poly([[-7.6,0.6],[-1,0.2],[-1,2],[-7.4,2.4]]); p.F(M.bag[0]); p.rect(-7,0.4,5.4,0.6);
    C.shade(p,[['e',-4.2,1.8,0.9,0.9]],M.brass,M.brassX,1);
    p.F(M.patch[1]); p.rect(-6.4,3.4,2.2,1.8); p.F(M.patch[0]); p.rect(-6.4,3.4,2.2,0.5); p.F(M.patchX[3]); p.rect(-6,4.4,0.5,0.5); p.rect(-5,4.4,0.5,0.5);
    p.id(); }
  function arm(p,M,lg,front){ C.vol(p,lg.root,lg.k,front?2.8:2.6,2.3,M.fur,M.furX); C.vol(p,lg.k,lg.f,2.3,2,M.fur,M.furX);
    C.shade(p,[['e',lg.f.x+0.6,lg.f.y+0.3,1.5,1.2]],M.hand,M.handX,1.4,{spec:false}); p.F(M.handX[0]); p.rect(lg.f.x+0.8,lg.f.y-0.4,0.6,0.6); }
  function hind(p,M,lg){ C.vol(p,lg.root,lg.k,4.2,2.6,M.fur,M.furX); C.vol(p,lg.k,lg.f,2.6,2.2,M.fur,M.furX);
    C.shade(p,[['e',lg.f.x+1,lg.f.y+0.3,2,1.1]],M.hand,M.handX,1.4,{spec:false}); }
  function drawTuftFar(p,M,sk,P){ const s=1+0.25*P.tufts, q=sk.H(3,-10); p.xf(sk.ha+0.3,q.x,q.y);
    C.shade(p,[['p',[[-2,1],[1*s,-4*s],[3.4*s,-7*s],[0.4*s,-8.4*s],[-3*s,-6.4*s],[-4,-1]]]],M.tuft,M.tuftX,4,{sd:1.6}); p.F(M.tuftX[2]); p.poly([[-2,0.6],[0.6*s,-3.6*s],[-1.6*s,-4.4*s]]); p.id(); }
  function drawHead(p,M,sk,P){ p.xf(sk.ha,sk.neck.x,sk.neck.y);
    const HD=[['e',1.6,-6.6,7.4,6.8],['e',3.6,-3.4,6,4.4]];
    C.shade(p,HD,M.fur,M.furX,7,{c:P2(2,-6)});
    C.within(p,HD,()=>{ // alto da cabeça mais escuro e máscara facial
      C.shade(p,[['e',-1,-13.2,7,3]],M.face,M.faceX,4,{spec:false});
      C.shade(p,[['e',8.4,-4.6,4.8,4.6]],M.face,M.faceX,4.2,{spec:false});
      C.shade(p,[['e',5,0.6,5.6,2.4]],M.chest,M.chestX,2.4,{spec:false}); });
    // losango branco na testa
    C.shade(p,[['p',[[5.2,-13.6],[7,-11.2],[5.2,-9],[3.4,-11.2]]]],M.blaze,M.blazeX,1.6,{spec:false});
    // olhos grandes
    C.eye(p,10.6,-6.6,1.5,1.9,P.eye,M.iris,M.ink[1],{lid:M.face[2]});
    C.eye(p,6.2,-6.4,2.1,2.5,P.eye,M.iris,M.ink[1],{lid:M.face[2]});
    // focinho e boca
    p.F(M.faceX[0]); p.rect(9.6,-4,1.6,0.8); p.F(M.ink[1]); p.rect(11.6,-3.6,0.8,0.6); p.rect(12.4,-3.4,0.6,0.6);
    if(P.mouth==='open'){ C.shade(p,[['e',10.4,-1.4,1.8,1.4]],M.mouth,M.mouthX,1.4,{lite:false}); p.F('#fffbf0'); p.rect(9.4,-2.6,0.6,0.7); p.rect(10.8,-2.6,0.6,0.7); }
    else if(P.mouth==='smile'){ p.F(M.ink[1]); p.poly([[8.6,-2.4],[10.4,-1.4],[12,-2.4],[12,-1.8],[10.4,-0.8],[8.6,-1.8]]); }
    else { p.F(M.ink[1]); p.rect(9.4,-2,2.4,0.6); }
    p.F(M.mouthX[0]); if(P.eye==='happy'||P.mouth==='smile') p.ell(8,-3,1.2,0.6);
    p.id(); }
  function drawTuftNear(p,M,sk,P){ const s=1+0.25*P.tufts, q=sk.H(-3.6,-7.4); p.xf(sk.ha-0.35,q.x,q.y);
    const T=[[3,2],[0.6*s,-4.6*s],[-1.6*s,-8.6*s],[-5*s,-9.6*s],[-7.6*s,-6.8*s],[-8.6*s,-2.6*s],[-7*s,1.6*s],[-2,3]];
    C.shade(p,[['p',T]],M.tuft,M.tuftX,5,{c:P2(-3*s,-3*s)});
    p.F(M.tuftX[2]); p.poly([[1,1],[-3.4*s,-3.6*s],[-5.6*s,-1.4*s],[-1,2]]); p.F(M.tuft[2]); [[-3.4,-7],[-6.4,-5],[-6.8,-1.4]].forEach(([x,y])=>p.cap(P2(-0.4,0.4),P2(x*s,y*s),0.6,0.4));
    p.id(); }
  function drawBranch(p,M,sk,tp){ const t=tp[tp.length-1]; p.id(); C.vol(p,P2(t.x-14,t.y-2.6),P2(t.x+14,t.y-3.4),3,3,M.wood,M.woodX); p.F(M.woodX[3]); p.rect(t.x-6,t.y-3.6,0.8,1.4); p.rect(t.x+6,t.y-4,0.8,1.4); }
  function drawFx(p,P,sk){ p.id(); const F=C.FXC, h=sk.H(3,-16);
    if(P.fx==='zzz'){ [0,0.34,0.67].forEach((o,k)=>{ const u=(P.fxt+o)%1; C.zzz(p,h.x+4+u*6+k,h.y-u*10,1.8+u*2,F.z); }); }
    if(P.fx==='heart'){ [0,0.5].forEach((o,k)=>{ const u=(P.fxt+o)%1; C.heart(p,h.x+(k?10:-4),h.y-u*10,1.3+u*0.8,F.heart[0],F.heart[1]); }); }
    if(P.fx==='chat'){ const m=sk.H(14,-3); C.shout(p,m.x+1+P.fxt*2,m.y,3.6+P.fxt*2,F.bark,2); C.note(p,m.x+4,m.y-7-P.fxt*4,1.8,F.note); }
    if(P.fx==='hit'){ const f=sk.legs.fN.f; C.sparkle(p,f.x+4,f.y-1,4,'#fff6c0'); p.F('#fffbf0'); for(let k=0;k<3;k++) p.cap(P2(f.x+1,f.y-4+k*2.4),P2(f.x+7,f.y-6+k*2.6),0.7,0.4); }
    if(P.fx==='dust'){ const f=sk.legs.fN.f; C.dust(p,f.x+3+P.fxt*2,GROUND-2,1.6,F.dust[0],F.dust[1]); C.dust(p,f.x-2,GROUND-1.6-P.fxt,1.2,F.dust[0],F.dust[1]); }
    if(P.fx==='bang'){ p.F('#ffe27a'); p.rect(h.x+4,h.y-6,1.6,5); p.rect(h.x+4,h.y,1.6,1.6); }
    if(P.fx==='spark'){ const f=sk.legs.fN.f; C.sparkle(p,f.x+2,f.y-5-P.fxt*2,2.4,'#fff6c0'); C.sparkle(p,f.x-4,f.y-2,1.4,'#fff6c0'); }
  }
  const cache=C.mkCache(600);
  function frame(v,anim,fi,step=5){
    if(!VARS[v]) v='branco'; if(!ANIMS[anim]) anim='idle';
    const K=PIX.getK(), key=v+'|'+anim+'|'+fi+'|'+step+'@'+K, hit=cache.get(key); if(hit) return hit;
    const P=poseOf(anim,fi), M=mats(v), sk=C.skeleton(P,CFG), Lg=sk.legs, pw=C.pen;
    const tp=C.tailPts(sk.tailRoot,P,11,2.7);
    const parts=[];
    if(P.hang) parts.push({draw:(c,u)=>drawBranch(pw(c,u),M,sk,tp)});
    parts.push(
      {back:true,draw:(c,u)=>{ const p=pw(c,u); arm(p,M,Lg.fF,false); hind(p,M,Lg.bF); }},
      {draw:(c,u)=>{ const p=pw(c,u); C.tail(p,M.ringL,M.ringLX,tp,3.4,1.8,{rings:M.ringD,ringsX:M.ringDX,tip:M.ringD,tipX:M.ringDX,tipN:2}); }},
      {draw:(c,u)=>drawTuftFar(pw(c,u),M,sk,P)},
      {draw:(c,u)=>drawBody(pw(c,u),M,sk)},
      {draw:(c,u)=>{ const p=pw(c,u); hind(p,M,Lg.bN); const r=Lg.bN.root; C.shade(p,[['e',r.x+0.4,r.y-1.4,3.6,4,-0.3]],M.fur,M.furX,4,{spec:false}); }},
      {draw:(c,u)=>drawPouch(pw(c,u),M,sk)},
      {draw:(c,u)=>drawTuftNear(pw(c,u),M,sk,P)},
      {draw:(c,u)=>drawHead(pw(c,u),M,sk,P)},
      {draw:(c,u)=>{ const p=pw(c,u); arm(p,M,Lg.fN,true); if(P.coin){ const f=Lg.fN.f; C.shade(p,[['e',f.x+1,f.y-2.2,2,2]],M.coin,M.coinX,2); p.F(M.coinX[3]); p.rect(f.x+0.6,f.y-3,0.7,1.6); }
        if(P.find&&!P.coin){ const f=Lg.fN.f; p.F(M.coinX[2]); p.rect(f.x,f.y-2,2.4,1); } }},
    );
    if(P.fx) parts.push({noShade:true,noRim:true,smear:true,draw:(c,u)=>drawFx(pw(c,u),P,sk)});
    const cv=C.build({FW,FH,GROUND,parts,M,step,flash:P.flash,rim:RIM});
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._fx=sc(sk.H(12,-3)); cv._center=sc(sk.base); cv._top=sc(sk.H(2,-15)); cv._head=sc(sk.H(2,-8)); cv._hand=sc(Lg.fN.f);
    return cache.set(key,cv);
  }
  const META={id:'sagui', nome:'Sagui', sub:'de tufo branco', papel:'Pet coletor', hab:'Vasculhar',
    lede:'Um sagui-de-tufos-brancos pequeno, curioso e de mãos rápidas, que nunca deixa um contêiner sem revirar. Leva a tiracolo uma pochete de lona remendada onde guarda o que acha na noite da Lua de Sangue.',
    habDesc:'Senta e remexe o chão com as mãos rápidas, acha um parafuso e depois ergue uma moeda dourada. No jogo, aumenta a chance de achado extra quando o squad vasculha. Pula pelo cenário e se pendura pelo rabo em postes e varais.',
    rows:[['Cabeça','Cabeção chibi cinza-acastanhado com o alto mais escuro, máscara facial marrom-escura, losango branco e olhos âmbar enormes.','Cabeça quase do tamanho do tronco, volume em 7 tons, 2 olhos com brilho (3/4) e boca que sorri, abre e tagarela.'],
      ['Tufos','Dois leques de pelo branco grandes saindo das laterais da cabeça.','O de cá com sombra cinza e fios; o de lá atrás, mais escuro. Abrem 25% no susto, no ataque e no tagarelar.'],
      ['Corpo e pochete','Tronco cinza listrado com peito claro. Pochete de lona com alça de couro, botão de latão e remendo vermelho.','Tronco com 5 listras no dorso, alça diagonal, aba escura, botão de latão e remendo cor de sangue.'],
      ['Cauda','Longa, 11 segmentos com anéis alternados claro/escuro e ponta escura, curvada em arco.','Enrola na respiração e ondula no pulo. Pendurado, vira gancho preso num galho.'],
      ['Especial','Vasculhar: senta, remexe com as mãos, acha um parafuso ("!") e ergue uma moeda dourada com brilho.','6 quadros: senta, remexe alternando as mãos com poeira, "!" no achado e moeda erguida com brilho.']]};
  return {PS,FW,FH,GROUND,AX,VARS,ANIMS,NAMES,mats,poseOf,frame,META,RIM};
})();

/* ===== zombies/cusp ===== */
/* CUSP — fonte de arte (editável). Build: npm run art
   Cuspidor: zumbi inchado e corcunda, papo de ácido pendurado no pescoço que brilha; cospe em arco.
   Regata listrada rubro-negra desbotada, bermuda jeans, um chinelo só (o outro pé descalço). */
const CUSP=(function(){
  const {rad,lp,lerp,P2,mkPen,compose}=PIX;
  const FW=178, FH=150, GROUND=142, AX=88, TS=1.2, HS=1.34;
  const RIM={comum:'#d4f0b0', enluarado:'#a8f0ff', plenilunar:'#ffb27a'};
  function mats(form){
    const m={
      skin:['#dfe8b0','#a2ae70','#5e684c','#2e2c3c'],
      rot:['#b4ac74','#7e7450','#524a3a','#2e2830'],
      flesh:['#f0a08c','#c0605c','#7e3044','#44182c'],
      acid:['#f8ffc8','#c6f53e','#6cc21c','#2a6a1a'],
      sacm:['#e8f4b0','#b0c46a','#748c44','#3e5034'],
      shirt:['#ffb46a','#f07a26','#a84618','#5a2010'],
      stripe:['#f4f8ff','#b8c4d0','#76829a','#3c4258'],
      jeans:['#94b2d8','#5e7cae','#3e527e','#222e4c'],
      strap:['#a8dcff','#3a7ae0','#244c96','#14285a'],
      sole:['#fff8e6','#d4ccb4','#948a74','#524a40'],
      hair:['#6e6454','#423a2e','#2a241c','#16120e'],
      eye:['#ffffe0','#f4e04a','#b89422','#6a5010'],
      milk:['#f4f4e8','#c8ccbc','#8e9486','#545a52'],
      mouth:['#8a4048','#4e1c26','#2c0c16','#16060a'],
      teeth:['#f4ecc0','#ccb87e','#8e7c4e','#544628'],
      nail:['#5a5046','#302822','#1c1612','#0c0806'],
      blood:['#a85a40','#7a2e22','#4e1a16','#2c0c0c'],
    };
    if(form==='enluarado'){
      m.skin=['#cad8f6','#8a98d0','#565e98','#2c2e5e']; m.rot=['#a8a4d8','#7470a8','#4c4878','#2a2648'];
      m.acid=['#effffc','#62f2e6','#18acb4','#0a5468']; m.sacm=['#dcf6ff','#94c4e4','#5a84aa','#30466a'];
      m.shirt=['#c4a0e0','#8a64b8','#583c86','#2e2052']; m.stripe=['#f0f8ff','#a8c8dc','#6888a8','#344660'];
      m.eye=['#ffffff','#bff4ff','#62c8e8','#2a7aa8']; m.flesh=['#e8a0c8','#b0609a','#703a70','#3c1c44'];
      m.blood=['#7a6ab0','#4a3e80','#2e2656','#1a1430']; m.jeans=['#86c0bc','#4a8486','#30585e','#1a3038'];
    }
    if(form==='plenilunar'){
      m.skin=['#f6b892','#c8724e','#8a3c34','#4e1a24']; m.rot=['#d89a6a','#a05a3a','#6a3028','#3a1418'];
      m.acid=['#fffcc4','#ffd23a','#f0761a','#9a2a10']; m.sacm=['#ffe4a8','#e8a05a','#a85a34','#5e2a20'];
      m.shirt=['#ff9a5a','#d8502a','#8e2620','#4a1012']; m.stripe=['#fff4d8','#d8b890','#9a7458','#4e3428']; m.eye=['#fffbe0','#ffd23f','#ff7a1a','#b8300e'];
      m.flesh=['#ffa880','#e05a3a','#9a2a24','#561018']; m.blood=['#d8442a','#9a1e14','#5e0e0c','#320606'];
    }
    return punch(m);
  }
  function sat(h,k){ const [r,g,b]=PIX.hexRgb(h), y=(r+g+b)/3; return PIX.toHex(y+(r-y)*k,y+(g-y)*k,y+(b-y)*k); }
  const NOPUNCH={acid:1,sacm:1,eye:1};
  function punch(m){ const o={}; for(const k in m){ const r=m[k]; o[k]=NOPUNCH[k]?[r[0],sat(r[1],1.08),r[2],PIX.mix(r[3],'#140a24',0.2)]:[sat(r[0],1.1),sat(r[1],1.16),PIX.mix(sat(r[2],1.12),'#2a1a4c',0.24),PIX.mix(r[3],'#140a24',0.4)]; } return o; }
  const NAMES={skin:'Pele',rot:'Podridão',flesh:'Carne',acid:'Ácido',sacm:'Papo',shirt:'Regata de gari',stripe:'Faixa refletiva',jeans:'Bermuda',strap:'Chinelo',sole:'Sola',eye:'Olho',teeth:'Dentes',blood:'Sangue'};

  /* ---------- poses ---------- */
  const REST={hx:0,lift:0,rot:0,lean:34,head:-24,jaw:6,sac:0.25,sacY:0,breath:0,aFs:2,aFe:30,aBs:-6,aBe:6,oF:0,lFh:12,lFk:-2,lBh:-10,lBk:-18,fF:0,fB:0,flash:0,spit:0,drip:0,burst:0,eyeG:0,shiver:0};
  const W8=(i,n)=>i/n*Math.PI*2;
  const ANIMS={
    idle:{nome:'Parado (papo pulsando)',n:8,dur:()=>150,pose:i=>{ const p=W8(i,8), s=Math.sin(p);
      return {sac:0.24+0.12*(Math.sin(p)+1)/2, sacY:0.6*Math.sin(p-0.9), breath:(s+1)/2, lean:34+1.4*s, head:-24+2.2*Math.sin(p-0.7), jaw:6+4*Math.max(0,Math.sin(p-1.2)),
        aFs:2+2.5*Math.sin(p-0.5), aFe:30+5*Math.sin(p-0.9), aBs:-6+2*Math.sin(p-0.6), aBe:6+3*Math.sin(p-1), drip:i%4, lFh:12, lFk:-2+1.2*s}; }},
    walk:{nome:'Andar (arrastado)',n:8,dur:()=>130,pose:i=>{ const p=W8(i,8);
      const lFh=6+15*Math.sin(p), lBh=6+15*Math.sin(p+Math.PI);
      return {lFh, lFk:lFh-22*Math.max(0,Math.cos(p))-6, lBh, lBk:lBh-22*Math.max(0,Math.cos(p+Math.PI))-6,
        fF:-10*Math.max(0,-Math.cos(p))+14*Math.max(0,Math.cos(p))*Math.max(0,-Math.sin(p)), fB:-10*Math.max(0,-Math.cos(p+Math.PI))+14*Math.max(0,Math.cos(p+Math.PI))*Math.max(0,-Math.sin(p+Math.PI)),
        lean:35+3*Math.abs(Math.sin(p)), head:-24+3.5*Math.sin(2*p-0.8), sac:0.26+0.05*Math.sin(2*p-1.2), sacY:1.4*Math.sin(2*p-1.6),
        aFs:2-12*Math.sin(p), aFe:30-10*Math.sin(p-0.5), aBs:-4+12*Math.sin(p), aBe:8+10*Math.sin(p-0.5), jaw:7+2*Math.sin(2*p), drip:i%4, breath:0.5+0.5*Math.sin(2*p)}; }},
    attack:{nome:'Cuspir (papo infla e dispara)',n:9,spitAt:4,hit:4,dur:i=>[170,170,190,150,70,150,150,150,140][i],pose:i=>[
      {sac:0.5,head:-32,lean:30,jaw:2,hx:-1,aFs:-4,aFe:6,aBs:-10,breath:0.6},
      {sac:0.8,head:-42,lean:24,jaw:0,hx:-2,lFh:15,lBh:-14,aFs:-12,aFe:2,aBs:-16,aBe:0,breath:1,eyeG:1},
      {sac:1.08,head:-50,lean:18,jaw:1,hx:-4,rot:-4,lFh:18,lFk:0,lBh:-18,lBk:-24,aFs:-20,aFe:-8,aBs:-22,aBe:-6,breath:1,eyeG:1},
      {sac:1.2,head:-54,lean:16,jaw:4,hx:-4,rot:-5,lFh:18,lFk:0,lBh:-18,lBk:-24,aFs:-22,aFe:-10,aBs:-24,aBe:-8,breath:1,eyeG:1,shiver:1},
      {sac:0.32,head:-62,lean:40,jaw:32,hx:5,rot:2,spit:1,lFh:24,lFk:8,lBh:-22,lBk:-30,aFs:34,aFe:46,aBs:-30,aBe:-24,oF:1,eyeG:1},
      {sac:0.16,head:-50,lean:42,jaw:26,hx:5,rot:2,lFh:24,lFk:8,lBh:-22,lBk:-30,aFs:28,aFe:40,aBs:-22,aBe:-14,oF:1,drip:3},
      {sac:0.14,head:-36,lean:38,jaw:16,hx:3,lFh:18,lFk:4,lBh:-16,lBk:-24,aFs:16,aFe:26,drip:2},
      {sac:0.18,head:-28,lean:35,jaw:10,hx:1,aFs:8,aFe:18,drip:1},
      {sac:0.22,head:-25,lean:34,jaw:7}][i]},
    // ---- ataques extras ----
    spitJet:{nome:'Jato em linha (de perto)',n:9,hit:4,reach:90,warn:[1,2,3],dur:i=>[140,140,150,60,90,90,110,140,140][i],pose:i=>[
      {sac:0.6,head:-30,lean:30,jaw:2,hx:-1,aFs:-6,aFe:4,aBs:-12,breath:0.7},
      {sac:1.0,head:-36,lean:22,jaw:0,hx:-3,rot:-3,lFh:16,lBh:-16,lBk:-22,aFs:-16,aFe:-2,aBs:-20,aBe:-4,breath:1,eyeG:1,shiver:1},
      {sac:1.25,head:-40,lean:18,jaw:1,hx:-5,rot:-4,lFh:18,lBh:-18,lBk:-24,aFs:-22,aFe:-8,aBs:-24,aBe:-8,breath:1,eyeG:1,shiver:1},
      {sac:0.8,head:-34,lean:44,jaw:34,hx:6,rot:1,spit:2,lFh:26,lFk:8,lBh:-24,lBk:-32,aFs:30,aFe:40,aBs:-30,aBe:-24,oF:1,eyeG:1},
      {sac:0.5,head:-32,lean:46,jaw:36,hx:7,rot:1,spit:3,lFh:26,lFk:8,lBh:-24,lBk:-32,aFs:30,aFe:40,aBs:-30,aBe:-24,oF:1,eyeG:1},
      {sac:0.24,head:-34,lean:44,jaw:30,hx:6,rot:1,spit:2,lFh:24,lFk:8,lBh:-22,lBk:-30,aFs:26,aFe:36,aBs:-24,aBe:-16,oF:1},
      {sac:0.12,head:-40,lean:40,jaw:20,hx:4,lFh:20,lFk:4,lBh:-18,lBk:-26,aFs:16,aFe:26,drip:3},
      {sac:0.16,head:-30,lean:36,jaw:12,hx:2,aFs:8,aFe:18,drip:2},
      {sac:0.22,head:-25,lean:34,jaw:7}][i]},
    neckSlam:{nome:'Pancada com o papo inchado',n:8,hit:4,reach:34,dur:i=>[150,150,170,60,120,150,140,150][i],pose:i=>[
      {sac:0.5,head:-34,lean:28,jaw:4,hx:-1,aFs:-4,aFe:8,aBs:-10,breath:0.6},
      {sac:0.9,head:-56,lean:10,jaw:2,hx:-4,rot:-4,lFh:16,lBh:-16,lBk:-22,aFs:-30,aFe:-14,aBs:-34,aBe:-18,breath:1,eyeG:1},
      {sac:1.15,head:-66,lean:2,jaw:2,hx:-6,rot:-6,lFh:18,lBh:-18,lBk:-24,aFs:-40,aFe:-20,aBs:-44,aBe:-26,breath:1,eyeG:1,shiver:1},
      {sac:1.1,head:-10,lean:56,jaw:12,hx:8,rot:3,lFh:30,lFk:10,lBh:-26,lBk:-34,aFs:-50,aFe:-30,aBs:-56,aBe:-36,eyeG:1},
      {sac:0.9,head:6,lean:64,jaw:22,hx:12,rot:4,lFh:32,lFk:12,lBh:-28,lBk:-36,aFs:-56,aFe:-36,aBs:-60,aBe:-40,drip:3,eyeG:1},
      {sac:0.6,head:-12,lean:56,jaw:18,hx:10,lFh:28,lFk:8,lBh:-24,lBk:-32,aFs:-30,aFe:-10,aBs:-36,aBe:-16,drip:2},
      {sac:0.3,head:-24,lean:42,jaw:10,hx:5,lFh:18,lFk:4,lBh:-16,lBk:-24,aFs:-6,aFe:14},
      {sac:0.24,head:-25,lean:34,jaw:7}][i]},
    hurt:{nome:'Dano (cabeça)',n:4,dur:i=>[70,110,120,150][i],pose:i=>[
      {lean:12,head:-44,jaw:22,hx:-6,rot:-6,flash:1,aFs:-34,aFe:-22,aBs:-40,aBe:-30,sac:0.36,sacY:-2,lFh:4,lBh:-18,oF:1},
      {lean:16,head:-40,jaw:20,hx:-6,rot:-5,aFs:-28,aFe:-14,aBs:-32,aBe:-22,sac:0.34,sacY:-1,lFh:4,lBh:-18,oF:1},
      {lean:26,head:-30,jaw:14,hx:-3,rot:-2,aFs:-6,aFe:6,sac:0.3,sacY:1.5},
      {lean:32,head:-26,jaw:8,hx:-1,sacY:0.6}][i]},
    hurtB:{nome:'Dano (barriga)',n:4,dur:i=>[70,120,130,150][i],pose:i=>[
      {lean:58,head:-6,jaw:26,hx:-5,flash:1,aFs:30,aFe:60,aBs:24,aBe:50,sac:0.08,sacY:3,lFh:-4,lFk:-16,lBh:-20,lBk:-34,drip:3,oF:1},
      {lean:56,head:-8,jaw:24,hx:-5,aFs:26,aFe:56,aBs:20,aBe:46,sac:0.1,sacY:3,lFh:-4,lFk:-16,lBh:-20,lBk:-34,drip:3,oF:1},
      {lean:46,head:-16,jaw:16,hx:-2,aFs:16,aFe:34,sac:0.16,sacY:2,drip:2},
      {lean:36,head:-22,jaw:9,sacY:0.8,drip:1}][i]},
    fall:{nome:'Derrubado',n:5,dur:i=>[90,110,110,140,260][i],pose:i=>[
      {rot:-18,lean:22,head:-40,jaw:22,hx:-4,flash:1,aFs:-40,aFe:-24,aBs:-50,aBe:-34,lFh:20,lFk:4,lBh:-6,lBk:-10,sac:0.3,sacY:-2,oF:1},
      {rot:-50,lift:12,lean:12,head:-34,jaw:24,hx:0,aFs:40,aFe:70,aBs:20,aBe:50,lFh:40,lFk:10,lBh:24,lBk:0,sac:0.32,sacY:-3,oF:1},
      {rot:-80,lift:6,lean:6,head:-22,jaw:22,hx:6,aFs:110,aFe:140,aBs:90,aBe:120,lFh:36,lFk:0,lBh:22,lBk:-6,sac:0.3,sacY:-1,oF:1},
      {rot:-92,lean:0,head:-8,jaw:18,hx:10,aFs:160,aFe:170,aBs:140,aBe:150,lFh:26,lFk:-8,lBh:12,lBk:-4,sac:0.28,sacY:2,oF:1},
      {rot:-92,lean:0,head:-4,jaw:12,hx:10,aFs:166,aFe:178,aBs:146,aBe:158,lFh:22,lFk:-10,lBh:10,lBk:-6,sac:0.26,sacY:3}][i]},
    getup:{nome:'Levantar',n:5,dur:i=>[200,160,150,140,140][i],pose:i=>[
      {rot:-90,lean:2,head:-6,jaw:10,hx:10,aFs:150,aFe:160,aBs:130,aBe:140,lFh:30,lFk:-20,lBh:16,lBk:-10,sac:0.26,sacY:3},
      {rot:-58,lean:44,head:-40,jaw:12,hx:8,aFs:50,aFe:30,aBs:-60,aBe:-40,lFh:96,lFk:-30,lBh:80,lBk:-50,sac:0.26,sacY:1},
      {rot:-22,lean:52,head:-36,jaw:10,hx:5,aFs:40,aFe:20,aBs:10,aBe:0,lFh:76,lFk:-30,lBh:-10,lBk:-96,sac:0.24},
      {rot:-4,lean:44,head:-30,jaw:8,hx:2,aFs:22,aFe:24,aBs:6,aBe:10,lFh:34,lFk:-24,lBh:-12,lBk:-44,sac:0.24},
      {lean:36,head:-25,jaw:7,sac:0.25}][i]},
    death:{nome:'Morte (papo estoura)',n:8,dur:i=>[90,140,150,90,120,130,200,400][i],pose:i=>[
      {lean:16,head:-46,jaw:24,hx:-5,rot:-6,flash:1,aFs:-30,aFe:-20,aBs:-36,aBe:-26,sac:0.6,oF:1},
      {lean:20,head:-56,jaw:18,hx:-4,rot:-4,aFs:-60,aFe:-90,aBs:-50,aBe:-80,sac:1.3,eyeG:1,shiver:1,oF:1},
      {lean:14,head:-64,jaw:30,hx:-4,rot:-6,aFs:-80,aFe:-120,aBs:-70,aBe:-110,sac:1.55,eyeG:1,shiver:1,oF:1},
      {lean:10,head:-60,jaw:34,hx:-5,rot:-10,aFs:-50,aFe:-30,aBs:-60,aBe:-40,sac:0.2,burst:1,oF:1},
      {lean:6,head:-40,jaw:30,hx:-2,rot:-42,lift:8,aFs:40,aFe:70,aBs:20,aBe:50,lFh:34,lFk:10,lBh:16,lBk:-4,sac:0.1,burst:2,oF:1},
      {lean:2,head:-16,jaw:26,hx:6,rot:-82,lift:3,aFs:120,aFe:150,aBs:100,aBe:130,lFh:30,lFk:0,lBh:18,lBk:-6,sac:0.06,burst:3,oF:1},
      {lean:0,head:-4,jaw:22,hx:10,rot:-93,aFs:162,aFe:174,aBs:142,aBe:154,lFh:24,lFk:-8,lBh:12,lBk:-6,sac:0.04,burst:4},
      {lean:0,head:0,jaw:20,hx:10,rot:-93,aFs:168,aFe:180,aBs:146,aBe:160,lFh:20,lFk:-12,lBh:8,lBk:-8,sac:0.04,burst:5}][i]},
  };
  const EXK=['hx','lean','head','aFs','aFe','aBs','aBe','lFh','lFk','lBh','lBk','sac'];
  const EXF={idle:1.15,walk:1.15,attack:1.3,spitJet:1.25,neckSlam:1.25,hurt:1.3,hurtB:1.25,fall:1.1,getup:1.05,death:1.15};
  function exag(P,f){ if(f===1||Math.abs(P.rot)>4) return P; EXK.forEach(k=>{ P[k]=REST[k]+(P[k]-REST[k])*f; }); P.jaw=Math.min(44,REST.jaw+(P.jaw-REST.jaw)*f); P.sac=Math.max(0.02,P.sac); return P; }
  ZREACT.add(ANIMS,REST,{moves:{bite:["lunge","Bote de mordida (pescoço esticado)"]}}); // reações (voando, agarrado) + golpe extra — art-src/shared/zreact.js
  function poseOf(anim,i){ return exag(Object.assign({},REST,ANIMS[anim].pose(i)),EXF[anim]||1); }
  function heavyOutline(cv){ const g=cv.getContext('2d'), W=cv.width, H=cv.height, im=PIX.pix(cv), d=im.data;
    const isO=i=>d[i+3]===255&&d[i]===0x17&&d[i+1]===0x0b&&d[i+2]===0x1c, fill=i=>d[i+3]===255&&!isO(i);
    const add=[]; for(let y=2;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(d[i+3]) continue; const u=((y-1)*W+x)*4, u2=((y-2)*W+x)*4; if(isO(u)&&fill(u2)) add.push(i); }
    add.forEach(i=>{ d[i]=0x17; d[i+1]=0x0b; d[i+2]=0x1c; d[i+3]=255; }); g.putImageData(im,0,0); }

  /* ---------- esqueleto: espaço do corpo (quadril na origem) → mundo (giro total + apoio no chão) ---------- */
  function skeleton(P){
    const lean=rad(P.lean), lc=Math.cos(lean), ls=Math.sin(lean);
    const T=(lx,ly)=>({x:(lx*lc-ly*ls)*TS, y:(lx*ls+ly*lc)*TS});
    const hipF={x:2,y:0}, hipB={x:-4,y:-1};
    const kneeF=lp(hipF,P.lFh,25), ankleF=lp(kneeF,P.lFk,24), kneeB=lp(hipB,P.lBh,25), ankleB=lp(kneeB,P.lBk,24);
    const neckB=T(6,-36), shF=T(5,-33), shB=T(1,-30);
    const hpv=T(15,-38);
    const ha=lean+rad(P.head), hc=Math.cos(ha), hs=Math.sin(ha);
    const Hb=(lx,ly)=>({x:hpv.x+(lx*hc-ly*hs)*HS, y:hpv.y+(lx*hs+ly*hc)*HS});
    const elF=lp(shF,P.aFs,17), wrF=lp(elF,P.aFe,16), elB=lp(shB,P.aBs,17), wrB=lp(elB,P.aBe,16);
    const pts={hipF,hipB,kneeF,ankleF,kneeB,ankleB,neckB,shF,shB,hpv,elF,wrF,elB,wrB,
      throat:Hb(3,3), mouth:Hb(13,-3), eye:Hb(8,-10),
      c1:T(-17,-32), c2:T(-9,-43), c3:T(16,-14), c4:T(-12,-4), c5:Hb(1,-11), c6:Hb(-8,-8)};
    const R=rad(P.rot), rc=Math.cos(R), rs=Math.sin(R);
    const hip0={x:AX+P.hx, y:0};
    const W={}; for(const k in pts){ const q=pts[k]; W[k]={x:hip0.x+q.x*rc-q.y*rs, y:q.x*rs+q.y*rc}; }
    W.hip={x:hip0.x,y:0};
    const footOff=R=>({x:-Math.sin(R)*8.2, y:Math.cos(R)*8.2});
    const fo=footOff(R);
    const cands=[W.ankleF.y+fo.y, W.ankleB.y+fo.y, W.c1.y+10, W.c2.y+10, W.c3.y+10, W.c4.y+9, W.c5.y+12, W.c6.y+7, W.kneeF.y+5, W.kneeB.y+5, W.wrF.y+3, W.wrB.y+3, W.elF.y+3, W.elB.y+3];
    const dy=GROUND-Math.max(...cands)-P.lift;
    for(const k in W) W[k].y+=dy;
    const sk=W; sk.a=lean+R; sk.ha=ha+R; sk.R=R;
    const c=Math.cos(sk.ha), s=Math.sin(sk.ha);
    sk.H=(lx,ly)=>({x:sk.hpv.x+(lx*c-ly*s)*HS, y:sk.hpv.y+(lx*s+ly*c)*HS});
    const ta=sk.a, tc=Math.cos(ta), ts=Math.sin(ta);
    sk.T=(lx,ly)=>({x:sk.hip.x+(lx*tc-ly*ts)*TS, y:sk.hip.y+(lx*ts+ly*tc)*TS});
    return sk;
  }

  /* ---------- caneta com recorte ---------- */
  function pen(c,u){ const p=mkPen(c,u); p.c=c;
    p.clip=pts=>{ c.beginPath(); pts.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])); c.closePath(); c.clip(); };
    p.clipE=(x,y,rx,ry)=>{ c.beginPath(); c.ellipse(x,y,rx,ry,0,0,Math.PI*2); c.clip(); };
    p.ln=(a,b,w)=>p.cap(a,b,w,w);
    p.save=()=>c.save(); p.restore=()=>c.restore();
    return p; }

  /* ---------- tronco: corcunda, barriga, regata listrada ---------- */
  const BODY=b=>[[11,3],[14+b,-6],[16+b,-15],[15+b*0.6,-24],[12,-31],[7,-36],[0,-40],[-6,-43],[-12,-42],[-17,-36],[-19,-27],[-18,-17],[-15,-8],[-11,1]];
  // regata listrada: listras em aro (perpendiculares à coluna), curvadas pra dar volume de barril
  function hoop(p,y0,h,cv){ const pts=[]; for(let x=-24;x<=22;x+=2){ const u=x/21; pts.push([x,y0+cv*(1-u*u)]); } for(let x=22;x>=-24;x-=2){ const u=x/21; pts.push([x,y0+h+cv*(1-u*u)]); } p.poly(pts); }
  function fabric(p,M,pts,t){ p.save(); p.clip(pts); p.F(M.shirt[t]); p.rect(-30,-60,60,70);
    p.F(M.stripe[t]); [-33,-21].forEach(y=>hoop(p,y,3.6,2.4)); p.F(M.shirt[3]); [-33,-21].forEach(y=>{ hoop(p,y-0.9,0.8,2.4); hoop(p,y+3.6,0.8,2.4); }); p.restore(); }
  function drawTorso(p,M,sk,P,form){
    p.xf(sk.a,sk.hip.x,sk.hip.y); p.c.scale(TS,TS);
    const b=P.breath*1.2, body=BODY(b);
    p.F(M.skin[1]); p.poly(body);
    // bermuda (cós) por baixo da barriga
    p.F(M.jeans[1]); p.poly([[-12,-5],[12.5,-5],[13,4],[-11.5,4]]);
    p.F(M.jeans[2]); p.rect(-12,-1,25,1); p.F(M.jeans[0]); p.rect(-6,-4.6,1.4,3.4); p.rect(5,-4.6,1.4,3.4);
    p.F(M.stripe[2]); p.rect(-12,-5.4,25,1.2);
    // pele: corcunda e ombros
    p.F(M.skin[2]); p.poly([[-19,-27],[-17,-36],[-12,-42],[-8,-42],[-13,-37],[-16,-28],[-16,-18],[-18,-17]]);
    p.F(M.skin[0]); p.poly([[-5,-42.6],[2,-40],[-2,-38.6],[-8,-40.6]]);
    p.F(M.rot[1]); p.ell(-11,-38,2.4,1.6);
    // regata
    const top=[[-24,-40],[-17,-41],[-12,-43],[-8,-40.6],[-3,-38.4],[1,-37.4],[4.6,-38],[8,-35],[12,-31],[20,-28],[20,-9+b*0.2],[15,-7.4],[9,-8.6],[4,-6.6],[-2,-8],[-8,-6],[-13,-7.6],[-22,-6]];
    p.save(); p.clip(body);
    fabric(p,M,top,1);
    // planos de luz e sombra do pano (luz vem de cima: topo da corcunda claro; costas e barriga por baixo escuros)
    fabric(p,M,[[-24,-44],[-15,-42],[-11,-34],[-9,-24],[-8,-16],[-4,-10],[4,-12],[12,-16],[20,-17],[20,-6],[-24,-6]],2);
    fabric(p,M,[[-24,-50],[6,-50],[6,-41],[0,-39.4],[-6,-41.4],[-12,-40.6],[-16,-38],[-24,-36]],0);
    fabric(p,M,[[-24,-30],[-18,-30],[-15,-20],[-13,-12],[-8,-8],[6,-9],[20,-10],[20,-6],[-24,-6]],3);
    // sombra projetada do papo no peito
    fabric(p,M,[[6,-36],[14,-33],[18,-24],[12,-21],[7,-28]],3);
    p.restore();
    // dobras / costura / rasgos
    p.F(M.shirt[3]); p.ln(P2(-6,-28),P2(2,-22),0.9); p.ln(P2(-4,-20),P2(5,-16),0.9); p.ln(P2(-8,-14),P2(-1,-11),0.8);
    p.F(M.shirt[0]); p.ln(P2(-5,-27),P2(2,-21.4),0.6);
    // barra desfiada e barriga aparecendo
    p.F(M.skin[1]); p.poly([[2,-7],[14,-8.6],[13.4,-5],[3,-4.6]]);
    p.F(M.skin[2]); p.rect(4,-5.6,9,1); p.F(M.skin[3]); p.ell(9,-6.6,0.8,0.7);
    p.F(M.shirt[2]); [[-12,-7.6],[-7,-6.2],[-2,-8],[3,-7]].forEach(([x,y])=>p.poly([[x,y],[x+2.4,y-0.4],[x+1.2,y+2.2]]));
    // rasgo com queimadura de ácido
    p.F(M.flesh[2]); p.ell(-4,-31,3.6,2.4); p.F(M.flesh[1]); p.ell(-4,-31.4,2.6,1.6); p.F(M.acid[2]); p.ell(-4.6,-30.8,1.2,0.8);
    p.F(M.rot[2]); p.ell(-12,-19,2.6,3.2); p.F(M.skin[2]); p.ell(-12,-19.4,1.7,2.2); p.F(M.rot[1]); p.rect(-12.6,-20.6,1,1);
    // manchas de baba ácida escorrida no peito
    p.F(M.acid[2]); p.poly([[10,-30],[12,-29],[11.6,-20],[10.6,-18],[10.2,-24]]); p.F(M.acid[1]); p.rect(10.6,-28,0.9,4);
    if(form==='plenilunar'){ p.F(M.flesh[2]); p.ell(-14,-30,2.4,1.8); }
    p.id();
  }

  /* ---------- membro com planos de luz: base, metade de sombra (lado oposto à luz), filete de luz ---------- */
  function limb(p,R,a,b,wa,wb,sh=0.5){
    p.F(R[1]); p.cap(a,b,wa,wb);
    const L=Math.hypot(b.x-a.x,b.y-a.y)||1; let nx=-(b.y-a.y)/L, ny=(b.x-a.x)/L; if(nx*-0.7+ny*0.7<0){ nx=-nx; ny=-ny; }
    const q=(P,w,t)=>P2(P.x+nx*w*t,P.y+ny*w*t);
    p.F(R[2]); p.poly([[q(a,wa,0.5-sh).x,q(a,wa,0.5-sh).y],[q(b,wb,0.5-sh).x,q(b,wb,0.5-sh).y],[q(b,wb,0.5).x,q(b,wb,0.5).y],[q(a,wa,0.5).x,q(a,wa,0.5).y]]);
    p.circle(q(b,wb,0.5-sh*0.5),wb*sh*0.5);
    p.F(R[3]); p.poly([[q(a,wa,0.34).x,q(a,wa,0.34).y],[q(b,wb,0.34).x,q(b,wb,0.34).y],[q(b,wb,0.5).x,q(b,wb,0.5).y],[q(a,wa,0.5).x,q(a,wa,0.5).y]]);
    p.F(R[0]); p.ln(q(lerp(a,b,0.12),wa,-0.3),q(lerp(a,b,0.7),wb,-0.3),Math.max(0.9,wa*0.12));
    return {nx,ny};
  }

  /* ---------- pernas: bermuda jeans, canela inchada, chinelo ---------- */
  function drawLeg(p,M,sk,hip,knee,ankle,fa,front){
    p.id();
    // canela com batata da perna inchada
    const cf=lerp(knee,ankle,0.32);
    const n=limb(p,M.skin,knee,ankle,10,8.2,0.6);
    p.F(M.skin[1]); p.circle(P2(cf.x+n.nx*1.4,cf.y+n.ny*1.4),4.2); p.F(M.skin[2]); p.circle(P2(cf.x+n.nx*2.4,cf.y+n.ny*2.4),2.8);
    p.F(M.skin[0]); p.rect(knee.x-n.nx*2.2,knee.y+2,1.2,2.4);
    p.F(M.rot[1]); const v=lerp(knee,ankle,0.55); p.ln(P2(v.x-n.nx*1.2,v.y-2),P2(v.x-n.nx*1.6+0.6,v.y+2),0.8); p.ln(P2(v.x-n.nx*1.6+0.6,v.y+2),P2(v.x-n.nx*0.6,v.y+4),0.7);
    p.F(M.rot[2]); p.ell(lerp(knee,ankle,0.75).x,lerp(knee,ankle,0.75).y,1.3,1.6);
    // bermuda: coxa com dobra, costura e barra desfiada larga
    limb(p,M.jeans,hip,knee,15.6,13.6,0.55);
    const km=lerp(hip,knee,1.06), ang=Math.atan2(knee.y-hip.y,knee.x-hip.x);
    p.xf(ang,km.x,km.y);
    p.F(M.jeans[1]); p.poly([[-4,-6.8],[1.4,-7],[2.8,-4.4],[1.6,-1.6],[3.2,1],[1.6,4],[2.6,6.8],[-4,6.4]]);
    p.F(M.jeans[2]); p.poly([[-4,1],[2.4,1.4],[1.6,4],[2.6,6.8],[-4,6.4]]);
    p.F(M.sole[1]); p.rect(1.4,-6.2,1.6,0.7); p.rect(1.8,-0.6,1.8,0.7); p.rect(1.2,3.6,1.8,0.7); p.rect(2.2,5.4,1.2,0.7);
    p.F(M.jeans[3]); p.rect(-2.6,-6.4,0.9,12.8);
    p.F(M.jeans[0]); p.rect(-4,-6.2,1,5);
    p.id();
    p.F(M.jeans[3]); p.ln(lerp(hip,knee,0.2),lerp(hip,knee,0.55),0.8);
    const cr=lerp(hip,knee,0.6); p.F(M.jeans[2]); p.ln(P2(cr.x-3,cr.y-1),P2(cr.x+3,cr.y+1.2),0.9); p.F(M.jeans[0]); p.ln(P2(cr.x-2.6,cr.y-2.2),P2(cr.x+2.6,cr.y-0.4),0.6);
    if(front){ const q=lerp(hip,knee,0.36); p.F(M.jeans[3]); p.ell(q.x+1.6,q.y,2.6,1.6); p.F(M.skin[2]); p.ell(q.x+1.6,q.y+0.2,1.8,1); p.F(M.sole[1]); p.rect(q.x+3.4,q.y-1.2,1.4,0.6); p.rect(q.x-0.6,q.y+1,1.2,0.6); }
    // pé
    p.xf(sk.R+rad(fa),ankle.x,ankle.y); p.c.scale(1.5,1.5);
    p.F(M.skin[1]); p.poly([[-3.8,-2.6],[2.4,-2.8],[7.6,0.4],[9.8,2.2],[9.8,3.9],[-4.2,3.9],[-4.6,0]]);
    p.F(M.skin[2]); p.poly([[-4.4,0.4],[-1,1],[3,2.2],[9.8,2.6],[9.8,3.9],[-4.2,3.9]]); p.F(M.skin[0]); p.rect(1.6,-1.6,3.2,0.9); p.rect(6,0.4,1.6,0.8);
    p.F(M.skin[3]); p.rect(5.6,2.2,0.7,1.4); p.rect(7.6,2.4,0.7,1.2);
    p.F(M.nail[1]); p.rect(8.6,2.2,1,1); p.rect(6.6,2.4,1,1);
    if(front){
      p.F(M.sole[1]); p.poly([[-5.2,3.6],[10.6,3.6],[11,5.6],[-5.6,5.6]]); p.F(M.sole[3]); p.rect(-5.6,5,16.6,0.7); p.F(M.sole[0]); p.rect(-4.6,3.6,13,0.7);
      p.F(M.strap[1]); p.poly([[5.4,1.6],[6.4,2.4],[1,0],[-2.4,3.8],[-3.6,3.4],[0.4,-1.2]]); p.F(M.strap[0]); p.rect(-0.2,-0.8,2.2,0.8); p.F(M.strap[3]); p.rect(-3,3,1.4,0.8);
    } else { p.F(M.rot[2]); p.rect(-4,3.2,13.6,0.8); p.F(M.blood[2]); p.rect(0,3.4,2,0.6); }
    p.id();
  }

  /* ---------- braço: ombro nu, bíceps flácido, mão grande de garras ---------- */
  function drawArm(p,M,sh,el,wr,front,open){
    p.id();
    const nf=limb(p,M.skin,el,wr,10.6,8.6,0.6);
    const n=limb(p,M.skin,sh,el,13.4,10.4,0.6), nx=-n.nx, ny=-n.ny;
    // bíceps caído (papada do braço) do lado de baixo
    const bz=lerp(sh,el,0.5); p.F(M.skin[2]); p.ell(bz.x+n.nx*2.6,bz.y+n.ny*2.6,3.4,2.4,Math.atan2(el.y-sh.y,el.x-sh.x));
    p.F(M.skin[3]); p.circle(el,1.4); p.F(M.skin[0]); p.circle(P2(el.x+nx*1.6,el.y+ny*1.6),0.9);
    p.F(M.rot[1]); p.ell(bz.x+nx*1.4,bz.y+ny*1.4,2,1.4); p.F(M.rot[2]); p.rect(bz.x+nx*1.4-0.5,bz.y+ny*1.4-0.5,1,1);
    const fz=lerp(el,wr,0.5); p.F(M.rot[2]); p.ell(fz.x-nf.nx*0.6,fz.y-nf.ny*0.6,1.2,1.6); if(front){ p.F(M.flesh[2]); p.ell(fz.x+nf.nx*1.6,fz.y+nf.ny*1.6,1.6,1.1); p.F(M.flesh[1]); p.rect(fz.x+nf.nx*1.6-0.5,fz.y+nf.ny*1.6-0.5,1,1); }
    // veias saltadas e manchas
    p.F(M.skin[3]); const v0=lerp(el,wr,0.15), v1=lerp(el,wr,0.6), v2=lerp(el,wr,0.9); p.ln(P2(v0.x-nf.nx*1.6,v0.y-nf.ny*1.6),P2(v1.x-nf.nx*0.6,v1.y-nf.ny*0.6),0.6); p.ln(P2(v1.x-nf.nx*0.6,v1.y-nf.ny*0.6),P2(v2.x-nf.nx*1.8,v2.y-nf.ny*1.8),0.55);
    p.F(M.rot[2]); const s1=lerp(sh,el,0.3); p.rect(s1.x-n.nx*2.4,s1.y-n.ny*2.4,1,1); p.rect(s1.x-n.nx*0.6+1,s1.y+2,0.9,0.9);
    // tendões do antebraço
    p.F(M.skin[2]); p.ln(lerp(el,wr,0.25),lerp(el,wr,0.85),0.7);
    // alça da regata no ombro
    p.F(M.shirt[2]); p.ln(P2(sh.x-2.4,sh.y-4.2),P2(sh.x+3,sh.y-3.4),2.4); p.F(M.stripe[2]); p.rect(sh.x-0.6,sh.y-5.2,1.4,2.2);
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y); p.c.scale(1.55,1.55);
    // mão grande: palma, nós dos dedos, 4 dedos com garras, polegar
    p.F(M.skin[1]); p.poly([[-1,-3.6],[5.2,-4.2],[6.6,3.8],[-1,3.6]]);
    p.F(M.skin[2]); p.poly([[-1,0.8],[6.2,1.2],[6.6,3.8],[-1,3.6]]);
    const curl=open?0.4:1.6;
    for(let k=0;k<4;k++){ const y0=-3.3+k*2.25, m=P2(9+(k===0||k===3?-0.4:0.3),y0+curl*0.3+k*0.12), t=P2(11.2+(open?1.2:0)-(k===3?1:0),y0+curl+k*0.2);
      p.F(M.skin[3]); p.cap(P2(5.6,y0),m,2.3,2.1); p.cap(m,t,2.1,1.8);
      p.F(M.skin[k<2?1:2]); p.cap(P2(5.6,y0-0.15),m,1.7,1.5); p.cap(m,P2(t.x-0.2,t.y-0.1),1.5,1.2);
      p.F(M.skin[0]); p.rect(5.2,y0-0.9,1.2,0.8); p.rect(m.x-0.4,m.y-0.9,0.9,0.7);
      p.F(M.teeth[2]); p.poly([[t.x-0.8,t.y-0.9],[t.x+1.6,t.y-0.1],[t.x+2,t.y+2.2],[t.x-0.6,t.y+1]]);
      p.F(M.teeth[0]); p.poly([[t.x-0.6,t.y-0.8],[t.x+1.2,t.y-0.2],[t.x+0.6,t.y+0.6]]); }
    p.F(M.skin[1]); p.cap(P2(1.6,-3.4),P2(4.6,-6.4),2.4,2); p.cap(P2(4.6,-6.4),P2(6.6,-6.8),2,1.6);
    p.F(M.teeth[1]); p.rect(6.8,-7.6,1.2,1.2); p.F(M.skin[0]); p.rect(2.6,-5,1.4,0.8);
    p.id();
  }

  /* ---------- cabeça ---------- */
  function drawHead(p,M,sk,P,form){
    // pescoço grosso
    p.id(); p.F(M.skin[1]); p.cap(sk.neckB,sk.hpv,10,8.4);
    p.F(M.skin[2]); p.ln(lerp(sk.neckB,sk.hpv,0.1),lerp(sk.neckB,sk.hpv,0.9),1.2);
    p.xf(sk.ha,sk.hpv.x,sk.hpv.y); p.c.scale(HS,HS);
    p.F(M.skin[1]); p.ell(1,-11,10.2,10.4); p.poly([[2,-6],[12.4,-8],[14,-5],[12.6,-1.4],[3,0.6],[-4,-1]]);
    // plano de sombra da nuca e luz no topo
    p.F(M.skin[2]); p.poly([[-9,-14],[-6,-19],[-4,-15],[-5,-8],[-3,-2],[-7,-4],[-9.4,-9]]);
    p.F(M.skin[0]); p.ell(4,-18,5,2.4); p.rect(8,-15,3,1);
    // cabelo ralo
    p.F(M.hair[1]); p.poly([[-9,-12],[-8,-17],[-4,-20.6],[0,-21.4],[-3,-19.4],[-5.4,-16],[-6.4,-11]]);
    p.poly([[-1,-21],[3,-21.6],[0.6,-19.6]]); p.F(M.hair[2]); p.poly([[-8.4,-12],[-10.6,-9],[-7.6,-10]]);
    // orelha
    p.F(M.skin[1]); p.ell(-4.6,-8.6,2.6,3.4); p.F(M.skin[3]); p.ell(-4.4,-8.4,1,1.8);
    // sobrancelha pesada
    p.F(M.skin[1]); p.poly([[3,-15],[12.4,-14.4],[12.6,-12.6],[4,-12.4]]);
    p.F(M.skin[3]); p.poly([[4,-12.6],[11.6,-12.8],[11,-11.6],[5,-11.6]]);
    // olho fundo brilhando + olho leitoso
    p.F(M.skin[3]); p.ell(7.8,-10,3.2,2.6);
    const eg=P.eyeG?1.25:1;
    p.F(M.eye[2]); p.ell(8,-10,2.2*eg,1.9*eg); p.F(M.eye[1]); p.ell(8.2,-10.2,1.5*eg,1.3*eg); p.F(M.eye[0]); p.rect(8.4,-10.8,0.9,0.9);
    p.F(M.skin[3]); p.ell(12.4,-10,1.2,1.6); p.F(M.milk[1]); p.ell(12.4,-10.2,0.8,1.1);
    // nariz podre
    p.F(M.skin[1]); p.poly([[11,-10],[14.4,-6.8],[13.6,-5.4],[11,-6]]); p.F(M.skin[3]); p.rect(12.6,-6.2,1,0.9);
    p.F(M.skin[0]); p.rect(12,-9,1,1.4);
    // bochecha inchada / podridão
    p.F(M.rot[1]); p.ell(2,-5,2.8,2); p.F(M.rot[2]); p.ell(2.4,-4.8,1.4,1); p.F(M.skin[0]); p.ell(6,-6.4,1.6,1);
    p.F(M.flesh[2]); p.ell(-1,-15,1.6,1.2);
    // textura: veias na têmpora, cicatriz costurada no crânio, poros podres
    p.F(M.skin[3]); p.ln(P2(0,-12),P2(2.4,-9.6),0.6); p.ln(P2(2.4,-9.6),P2(1.6,-7),0.55); p.ln(P2(2.4,-9.6),P2(4.4,-8.6),0.5);
    p.F(M.flesh[3]); p.ln(P2(-6,-15),P2(1,-19.6),0.8); p.F(M.teeth[2]); [[-5,-16.6],[-3,-17.8],[-1,-19]].forEach(([x,y])=>p.ln(P2(x-0.7,y-1),P2(x+0.7,y+1),0.5));
    p.F(M.rot[2]); [[5,-15.4],[-2.6,-6],[8.6,-3]].forEach(([x,y])=>p.rect(x,y,0.9,0.9)); p.F(M.rot[1]); p.ell(-6,-11,1.4,1.8);
    // boca (lábio de cima + dentes)
    p.F(M.mouth[1]); p.poly([[5,-4.2],[13,-4.6],[13.4,-1.4],[5,-1]]);
    p.F(M.teeth[1]); p.rect(7,-4.6,1.4,1.8); p.rect(9.2,-4.7,1.4,1.6); p.rect(11.2,-4.6,1.2,1.4);
    p.F(M.teeth[2]); p.rect(7.1,-3.2,1.2,0.5);
    p.id();
  }
  function drawJaw(p,M,sk,P){
    const h=sk.H(3,-2); p.xf(sk.ha+rad(P.jaw),h.x,h.y); p.c.scale(HS,HS);
    p.F(M.skin[1]); p.poly([[-3,-1],[10.6,-0.6],[11.2,1.6],[9.4,5],[3,6],[-3,3]]);
    p.F(M.mouth[2]); p.poly([[2,-1],[10.4,-0.8],[10,1],[2.4,1.2]]);
    p.F(M.teeth[1]); p.rect(4,-1.8,1.3,1.8); p.rect(6.2,-1.9,1.3,1.8); p.rect(8.4,-1.7,1.2,1.6);
    p.F(M.skin[2]); p.rect(1,4.4,7,1.1); p.F(M.skin[0]); p.rect(7,1.8,2.4,0.9);
    p.F(M.acid[1]); const L=2+P.drip*1.4+(P.jaw>14?3:0); p.poly([[8.6,4.4],[10.4,4],[9.8,4.4+L],[9.2,5.4+L]]); p.F(M.acid[0]); p.rect(9.2,4.6,0.8,Math.max(1,L*0.5));
    p.F(M.acid[1]); p.ell(9.5,5.6+L,1.1,1.2);
    p.id();
  }

  /* ---------- papo de ácido (sem sombreamento automático: brilho próprio) ---------- */
  function sacGeom(sk,P){ const s=P.sac, rx=13.4+s*7.6, ry=12+s*7.8; const t=sk.throat; return {rx,ry,c:{x:t.x+1.4+s*1.2,y:t.y+ry*0.62+1.6+P.sacY}}; }
  function drawSac(p,M,sk,P,form,fi){
    p.id();
    if(P.burst){ drawBurst(p,M,sk,P); return; }
    const g=sacGeom(sk,P), c=g.c, rx=g.rx, ry=g.ry, sh=P.shiver?((fi%2)?0.7:-0.7):0;
    const cx=c.x+sh, cy=c.y;
    // pescoço do papo (pele esticada que liga à garganta)
    p.F(M.sacm[1]); p.cap(sk.throat,P2(cx-1,cy-ry*0.5),9.6,rx*1.3);
    p.F(M.sacm[2]); p.ln(P2(sk.throat.x-3,sk.throat.y+1),P2(cx-rx*0.7,cy-ry*0.3),1);
    // bolsa
    const bag=(d)=>{ p.ell(cx,cy+ry*0.12,Math.max(1,rx-d),Math.max(1,ry*0.88-d)); p.ell(cx-0.6,cy-ry*0.42,Math.max(1,rx*0.72-d),Math.max(1,ry*0.56-d)); };
    p.F(M.sacm[2]); bag(0);
    p.F(M.acid[3]); bag(1.3);
    p.F(M.acid[2]); p.ell(cx+0.6,cy+ry*0.06,rx-2.6,ry*0.8-2.4);
    p.F(M.acid[1]); p.ell(cx+1.2,cy-ry*0.12,rx*0.62,ry*0.58);
    p.F(M.acid[0]); p.ell(cx+rx*0.22,cy-ry*0.22,rx*0.26,ry*0.24);
    // pele do topo do papo (opaca)
    p.F(M.sacm[1]); p.poly([[cx-rx*0.96,cy-ry*0.24],[cx-rx*0.5,cy-ry*0.86],[cx+rx*0.2,cy-ry],[cx+rx*0.7,cy-ry*0.74],[cx+rx*0.2,cy-ry*0.56],[cx-rx*0.4,cy-ry*0.42]]);
    p.F(M.sacm[0]); p.poly([[cx-rx*0.2,cy-ry*0.92],[cx+rx*0.4,cy-ry*0.88],[cx+rx*0.1,cy-ry*0.74]]);
    // veias por cima
    p.F(M.sacm[3]);
    p.ln(P2(cx-rx*0.7,cy-ry*0.4),P2(cx-rx*0.3,cy+ry*0.1),0.8); p.ln(P2(cx-rx*0.3,cy+ry*0.1),P2(cx-rx*0.45,cy+ry*0.6),0.7);
    p.ln(P2(cx-rx*0.3,cy+ry*0.1),P2(cx+rx*0.1,cy+ry*0.35),0.7);
    p.ln(P2(cx+rx*0.5,cy-ry*0.55),P2(cx+rx*0.75,cy+ry*0.05),0.8); p.ln(P2(cx+rx*0.75,cy+ry*0.05),P2(cx+rx*0.55,cy+ry*0.5),0.7);
    // bolhas
    const bb=(fi*1.3)%3;
    p.F(M.acid[0]); p.circle(P2(cx-rx*0.25,cy+ry*0.25-bb),Math.max(0.7,rx*0.08)); p.circle(P2(cx+rx*0.35,cy+ry*0.45-bb*0.6),0.7);
    // reflexo molhado
    p.F(M.sacm[0]); p.ln(P2(cx+rx*0.55,cy-ry*0.25),P2(cx+rx*0.72,cy+ry*0.15),1); p.rect(cx+rx*0.5,cy-ry*0.42,1,1);
    // sedimento no fundo
    p.F(M.acid[3]); p.poly([[cx-rx*0.7,cy+ry*0.6],[cx+rx*0.7,cy+ry*0.6],[cx+rx*0.3,cy+ry*0.9],[cx-rx*0.3,cy+ry*0.9]]);
    // gota pendurada
    if(P.drip!==1){ const L=1+(P.drip%3)*1.4; p.F(M.acid[1]); p.poly([[cx-1,cy+ry-0.6],[cx+1,cy+ry-0.6],[cx+0.4,cy+ry+L],[cx-0.4,cy+ry+L]]); p.F(M.acid[1]); p.circle(P2(cx,cy+ry+L+0.8),1.1); }
    // pústulas extras (plenilunar)
    if(form==='plenilunar'){ [[-15,-34,3],[-8,-42,2.4],[13,-12,2.6]].forEach(([x,y,r])=>{ const q=sk.T(x,y); p.F(M.sacm[2]); p.circle(q,r+0.8); p.F(M.acid[2]); p.circle(q,r); p.F(M.acid[1]); p.circle(P2(q.x+0.3,q.y-0.3),r*0.6); p.F(M.acid[0]); p.rect(q.x+r*0.2,q.y-r*0.5,1,1); }); }
    if(form==='enluarado'){ [[-14,-26],[-6,-40]].forEach(([x,y])=>{ const q=sk.T(x,y); p.F(M.acid[1]); p.ln(q,P2(q.x+2,q.y+3),0.9); p.F(M.acid[0]); p.rect(q.x,q.y,0.9,0.9); }); }
    // cuspe saindo da boca
    if(P.spit){ const m=sk.mouth, a=sk.ha-0.35; const d=(k)=>P2(m.x+Math.cos(a)*k,m.y+Math.sin(a)*k);
      p.F(M.acid[2]); p.ell(d(6).x,d(6).y,6,4.2,a); p.F(M.acid[1]); p.ell(d(7).x,d(7).y,4.4,3,a); p.F(M.acid[0]); p.ell(d(8).x,d(8).y,2,1.4,a);
      [[13,-3,1.6],[15,3,1.2],[11,5,1.1],[17,0,0.9]].forEach(([k,o,r])=>{ const q=d(k); p.F(M.acid[1]); p.circle(P2(q.x-Math.sin(a)*o,q.y+Math.cos(a)*o),r); });
      if(P.spit>=2){ const L=P.spit>=3?44:30; for(let k=8;k<L;k+=2.2){ const w=3.4-1.6*k/L, q=d(k), o=Math.sin(k*0.9)*0.8; p.F(M.acid[2]); p.ell(q.x,q.y+o,w+1.2,w+0.6,a); p.F(M.acid[1]); p.ell(q.x,q.y+o-0.4,w,w*0.7,a); p.F(M.acid[0]); p.rect(q.x-0.5,q.y+o-w*0.6,1,0.8); } } }
  }
  function drawBurst(p,M,sk,P){
    const g=sacGeom(sk,{sac:0.6,sacY:0}), b=P.burst, t=sk.throat;
    if(b===1){ // estouro: respingo em estrela
      const c={x:t.x+3,y:t.y+8};
      p.F(M.acid[2]); for(let k=0;k<9;k++){ const a=k/9*Math.PI*2+0.3, L=22+(k%3)*7; p.poly([[c.x+Math.cos(a-0.24)*9,c.y+Math.sin(a-0.24)*9],[c.x+Math.cos(a)*L,c.y+Math.sin(a)*L],[c.x+Math.cos(a+0.24)*9,c.y+Math.sin(a+0.24)*9]]); }
      p.F(M.acid[3]); p.circle(c,14); p.F(M.acid[1]); p.circle(c,12); p.F(M.acid[0]); p.circle(c,7); p.F(M.sacm[2]); [[-10,-6],[8,-9],[10,7],[-6,10]].forEach(([x,y])=>p.poly([[c.x+x,c.y+y],[c.x+x*1.5+2,c.y+y*1.5],[c.x+x*1.4,c.y+y*1.4+2]]));
      p.F(M.acid[1]); [[28,-14,2.4],[-20,-8,2.2],[14,22,2],[-12,20,1.8],[30,8,1.6]].forEach(([x,y,r])=>p.circle(P2(c.x+x,c.y+y),r));
      return; }
    // retalhos do papo murcho pendurados na garganta
    p.F(M.sacm[2]); p.poly([[t.x-4,t.y],[t.x+4,t.y],[t.x+3,t.y+5],[t.x+1,t.y+3],[t.x-1,t.y+6],[t.x-3,t.y+3]]);
    p.F(M.flesh[2]); p.circle(P2(t.x,t.y+1.6),1.6);
    // poça no chão
    const w=Math.min(1,(b-1)/3), cx=t.x+2;
    p.F(M.acid[3]); p.ell(cx,GROUND-0.4,8+w*18,1.6+w*1.6);
    p.F(M.acid[2]); p.ell(cx+1,GROUND-0.8,6+w*14,1+w*1.2);
    p.F(M.acid[1]); p.ell(cx+3,GROUND-1.2,2+w*6,0.6+w*0.5);
    if(b<5){ p.F(M.acid[1]); [[-8,-6],[6,-10],[14,-4]].forEach(([x,y],k)=>p.circle(P2(cx+x*(1+w),GROUND+y*(1-w)-2),1.2)); }
  }

  const cache=PIX.cache();
  function frame(form,anim,fi,step=5,Pov,pk){
    const K=PIX.getK(), key=(pk!=null?'#'+pk+'|'+form:form+anim+fi+step)+'@'+K; if(cache.has(key)) return cache.get(key);
    const P=Pov||poseOf(anim,fi), M=mats(form), sk=skeleton(P), f=fi|0;
    const parts=[
      {back:true, draw:(c,u)=>drawArm(pen(c,u),M,sk.shB,sk.elB,sk.wrB,false,P.oF)},
      {back:true, draw:(c,u)=>drawLeg(pen(c,u),M,sk,sk.hipB,sk.kneeB,sk.ankleB,P.fB,false)},
      {draw:(c,u)=>drawTorso(pen(c,u),M,sk,P,form)},
      {draw:(c,u)=>drawLeg(pen(c,u),M,sk,sk.hipF,sk.kneeF,sk.ankleF,P.fF,true)},
      {draw:(c,u)=>drawHead(pen(c,u),M,sk,P,form)},
      {draw:(c,u)=>drawArm(pen(c,u),M,sk.shF,sk.elF,sk.wrF,true,P.oF)},
      {noShade:true, draw:(c,u)=>drawSac(pen(c,u),M,sk,P,form,f)},
      {draw:(c,u)=>drawJaw(pen(c,u),M,sk,P)},
    ];
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM[form]}); if(step>=4) heavyOutline(cv);
    const sc=q=>({x:q.x*K,y:q.y*K}), g=sacGeom(sk,P); cv._sac=sc(g.c); cv._mouth=sc(sk.mouth); cv._eye=sc(sk.eye); cv._sacR=g.rx*K;
    cache.set(key,cv); return cv;
  }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame,framePose:function(form,anim,P,key){ if(cache.size>1400) cache.delete(cache.keys().next().value); return frame(form,anim,0,5,P,key); }};
})();

/* ===== zombies/grit ===== */
/* GRIT — fonte de arte (editável). Build: npm run art
   Gritador: ex-vendedor de picolé da praia, magro e comprido, boca rasgada até a orelha e papo da garganta
   inflado. Camisa de botão aberta (costelas à mostra), boné virado, bermuda cáqui, tênis de lona e o megafone
   quebrado pendurado na alça. Foge e grita chamando a horda. Hi-bit: honra PIX.getK(). */
const GRIT=(function(){
  const {rad,lerp,P2,ik,mkPen,compose}=PIX;
  const FW=184, FH=156, GROUND=148, AX=82;
  const RIM={comum:'#c4dcf4', enluarado:'#9ff6ff', plenilunar:'#ffb46a'};

  /* ---------- materiais ---------- */
  function mats(form){
    const m={
      skin:['#e2ecc0','#a8ba8c','#6a7e64','#3a4650'],
      rot:['#b6ae86','#857862','#5a4c4e','#342a38'],
      flesh:['#f6ae94','#d0645e','#8e3446','#521c34'],
      bone:['#fff4d8','#dccfa6','#a09070','#605040'],
      sac:['#f8e0d0','#dca8a0','#a06e7c','#5c3c54'],
      shirt:['#a8eadc','#4eb4aa','#2e7682','#1c4254'],
      print:['#fff6b8','#f4c84a','#b8822c','#6a4420'],
      shorts:['#ead49e','#b89a62','#7c6246','#46342a'],
      cap:['#ffa684','#e44c3a','#982a34','#521a2a'],
      capw:['#fffbea','#dcd6c6','#9e98a6','#5e5872'],
      mega:['#fffbe6','#e4d8b2','#a69a84','#5e5664'],
      grille:['#e8eef4','#98a6b8','#5c6880','#30384e'],
      strap:['#9a8670','#665446','#42342e','#241a1e'],
      shoe:['#a4ccf4','#4c7cd4','#30509c','#1c2c60'],
      sole:['#fffaea','#d8d0ba','#989078','#564e44'],
      hair:['#6a5e4e','#443a30','#2a2420','#161212'],
      eye:['#ffffff','#ece8dc','#aca89c','#68645e'],
      mouth:['#7c2e3e','#4c1828','#2e0c1a','#1a0610'],
      teeth:['#fbf0c0','#d8c27c','#9a8650','#5e4e30'],
      blood:['#c84a3e','#8e2a2c','#5e1824','#3a0e1a'],
      nail:['#8a7a62','#54463c','#342a28','#1c1618'],
      glow:['#fffbe0','#ffe6a0','#e8a860','#9a5a3c'],
    };
    if(form==='enluarado'){
      m.skin=['#dcdcff','#9ea0e2','#666aac','#3c3a76']; m.rot=['#b8a6e0','#8470b0','#56468a','#33285e'];
      m.flesh=['#f0b0ff','#b866d8','#7a3a9e','#46206a']; m.blood=['#b46ad8','#7e3ea6','#542474','#34144a'];
      m.sac=['#f0e4ff','#c4a8ec','#8a6cb8','#4c3a7a']; m.glow=['#effffe','#7af4ff','#2ab0d8','#146a96'];
      m.eye=['#ffffff','#b8fbff','#4ad8f0','#1a8aa8'];
      m.shirt=['#b4f2ff','#5cc2dc','#3a7caa','#22466e']; m.shorts=['#c8c0d8','#928aaa','#605a7e','#383454'];
      m.cap=['#9ac8ff','#4a7ae0','#30489c','#1c2860'];
    }
    if(form==='plenilunar'){
      m.skin=['#ffcaa6','#e2806a','#a4424e','#5e1e36']; m.rot=['#d0806a','#9a4a4a','#682a3a','#3e1628'];
      m.flesh=['#ffc07a','#f06a3a','#a8302e','#5e1422']; m.blood=['#ff7a3a','#d43a26','#8a1c22','#4e0c18'];
      m.sac=['#ffe0b0','#f0a070','#b05a4a','#682a34']; m.glow=['#fff6c0','#ffb43a','#e0581e','#8a2414'];
      m.eye=['#fffbe0','#ffe04a','#ff8a2a','#b83a14'];
      m.shirt=['#7ec8c0','#3e8890','#2a5468','#1a3040']; m.shorts=['#d8b48a','#a07a5a','#6a4a40','#3c2a2a'];
      m.cap=['#3e3a4c','#26222e','#18141e','#0c0a10'];
    }
    return punch(m);
  }
  const NAMES={skin:'Pele',rot:'Podridão',flesh:'Carne',bone:'Costelas',sac:'Papo da garganta',shirt:'Camisa aberta',print:'Estampa',shorts:'Bermuda cáqui',cap:'Boné',mega:'Megafone',grille:'Grade do megafone',strap:'Alça',shoe:'Tênis de lona',sole:'Sola',eye:'Olho',teeth:'Dentes',blood:'Sangue',glow:'Brilho do grito'};
  function sat(h,k){ const [r,g,b]=PIX.hexRgb(h), y=(r+g+b)/3; return PIX.toHex(y+(r-y)*k,y+(g-y)*k,y+(b-y)*k); }
  const NOPUNCH={glow:1,eye:1};
  function punch(m){ const o={}; for(const k in m){ const r=m[k]; o[k]=NOPUNCH[k]?[r[0],r[1],r[2],r[3]]:[sat(r[0],1.1),sat(r[1],1.18),PIX.mix(sat(r[2],1.12),'#2a1a4c',0.22),PIX.mix(r[3],'#140a24',0.36)]; } return o; }

  /* ---------- poses ---------- */
  // ângulos: 0 = pendurado, + = pra frente. th = papo da garganta (0..1.4). ring = ondas do grito.
  const REST={hx:0,rot:0,lift:0,lean:12,hunch:30,head:-26,jaw:26,th:0.62,aFs:8,aFe:22,aBs:0,aBe:14,lFh:16,lFk:-8,lBh:-12,lBk:-24,fF:0,fB:0,flash:0,ring:0,swing:0,flap:0,megaUp:0,grip:0,shiver:0,eyeW:0,burst:0};
  const S=Math.sin, C=Math.cos, PI=Math.PI, mx=Math.max;
  const ANIMS={
    idle:{nome:'Parado (papo pulsando)',n:8,dur:()=>140,pose:i=>{ const p=i/8*PI*2, s=S(p);
      return {hunch:30+3*s, lean:12+1.2*s, head:-26+4*S(p-0.8)+(i===5?-6:0), jaw:24+8*mx(0,S(p*2-0.4)), th:0.56+0.22*(S(p-0.5)+1)/2,
        aFs:8+4*S(p-0.6), aFe:22+7*S(p-1.1), aBs:0+3*S(p-0.3), aBe:14+5*S(p-0.8), hx:0.5*S(p+0.5), swing:4*S(p-1.2), eyeW:i===5?1:0}; }},
    walk:{nome:'Andar (esgueirando)',n:8,dur:()=>115,pose:i=>{ const p=i/8*PI*2;
      const lFh=10+24*S(p), lBh=-10+18*S(p+PI);
      return {lFh, lFk:lFh-30*mx(0,C(p))-4, lBh, lBk:lBh-12-16*mx(0,C(p+PI)), fF:-14*mx(0,C(p)), fB:24*mx(0,C(p+PI)),
        lean:14+3*Math.abs(S(p)), hunch:30+3*S(2*p-0.6), head:-26+6*S(2*p-1.4), jaw:24+6*S(2*p-1.8), th:0.5+0.08*S(2*p), hx:1.2*S(2*p),
        aFs:8-18*S(p), aFe:24-18*S(p-0.5), aBs:0+16*S(p), aBe:16+16*S(p-0.5), swing:-10*S(p-0.6), flap:0.3+0.3*S(2*p)}; }},
    flee:{nome:'Fugir (pânico)',n:8,dur:()=>80,pose:i=>{ const p=i/8*PI*2;
      const lFh=14+40*S(p), lBh=14+40*S(p+PI);
      return {lFh, lFk:lFh-12-64*mx(0,C(p)), lBh, lBk:lBh-12-64*mx(0,C(p+PI)), fF:-26*mx(0,C(p))+20*mx(0,-C(p)), fB:-26*mx(0,C(p+PI))+20*mx(0,-C(p+PI)),
        lean:22+3*S(2*p), hunch:10+4*S(2*p-0.5), head:-40+8*S(2*p-1), jaw:46+10*S(2*p), th:0.5+0.15*S(2*p), lift:4*mx(0,S(2*p-0.4)),
        aFs:150+30*S(p), aFe:175+20*S(p-0.4), aBs:140-30*S(p), aBe:170-20*S(p-0.4), swing:-40-24*S(2*p), flap:1+0.4*S(2*p), eyeW:1}; }},
    attack:{nome:'Gritar (chama a horda)',n:10,screamAt:5,dur:i=>[150,170,170,200,80,120,120,140,160,150][i],pose:i=>[
      {hunch:28,lean:12,head:-14,jaw:10,th:0.36,aFs:16,aFe:30,aBs:8,aBe:20,eyeW:1},
      {hunch:16,lean:2,head:-40,jaw:14,th:0.7,aFs:-16,aFe:-4,aBs:-22,aBe:-10,hx:-2,lFh:12,lBh:-16},
      {hunch:8,lean:-6,head:-56,jaw:10,th:1.02,aFs:-34,aFe:-24,aBs:-40,aBe:-30,hx:-4,lFh:10,lFk:-2,lBh:-18,lBk:-28,flap:0.4},
      {hunch:6,lean:-8,head:-60,jaw:8,th:1.18,aFs:-40,aFe:-30,aBs:-46,aBe:-36,hx:-4,lFh:10,lFk:-2,lBh:-18,lBk:-28,shiver:1,flap:0.4,grip:1},
      {hunch:30,lean:16,head:-18,jaw:16,th:1.24,aFs:-30,aFe:-10,aBs:-36,aBe:-16,hx:2,lFh:22,lFk:2,lBh:-20,lBk:-32,grip:1},
      {hunch:10,lean:4,head:-46,jaw:78,th:1.4,aFs:-56,aFe:-60,aBs:-62,aBe:-66,hx:3,lFh:24,lFk:4,lBh:-22,lBk:-34,ring:1,flap:1,grip:1,eyeW:1},
      {hunch:10,lean:4,head:-48,jaw:80,th:1.3,aFs:-58,aFe:-64,aBs:-64,aBe:-70,hx:3,lFh:24,lFk:4,lBh:-22,lBk:-34,ring:2,flap:1.2,grip:1,eyeW:1,shiver:1},
      {hunch:12,lean:5,head:-44,jaw:76,th:1.1,aFs:-54,aFe:-58,aBs:-60,aBe:-64,hx:3,lFh:24,lFk:4,lBh:-22,lBk:-34,ring:3,flap:0.8,grip:1,eyeW:1},
      {hunch:22,lean:10,head:-30,jaw:40,th:0.6,aFs:-10,aFe:6,aBs:-16,aBe:0,hx:1,lFh:18,lBh:-14},
      {hunch:30,lean:12,head:-26,jaw:22,th:0.5}][i]},
    scream:{nome:'Chamar no megafone (loop)',n:6,loop:true,ringAt:[1,3,5],dur:i=>[130,110,130,110,130,110][i],pose:i=>{ const o=i%2;
      return {megaUp:1,hunch:14,lean:6,head:-34+(o?-3:0),jaw:58+(o?10:0),th:1+(o?0.3:0.1),aBs:-40-(o?6:0),aBe:-50-(o?8:0),hx:1,lFh:20,lFk:0,lBh:-18,lBk:-30,ring:o?1+((i>>1)%3):0,shiver:o,flap:0.5+0.3*o,eyeW:1}; }},
    // ---- ataques extras (de perto, quando encurralado) ----
    shove:{nome:'Empurrão desesperado',n:7,hit:3,reach:30,dur:i=>[120,140,50,150,130,130,140][i],pose:i=>[
      {hunch:24,lean:8,head:-34,jaw:40,th:0.6,aFs:40,aFe:60,aBs:30,aBe:50,hx:-1,eyeW:1},
      {hunch:14,lean:-8,head:-30,jaw:50,th:0.7,aFs:70,aFe:120,aBs:60,aBe:110,hx:-5,lFh:10,lFk:-6,lBh:-16,lBk:-28,eyeW:1,shiver:1},
      {hunch:20,lean:30,head:-40,jaw:60,th:0.8,aFs:90,aFe:90,aBs:84,aBe:84,hx:8,lFh:30,lFk:4,lBh:-26,lBk:-40,flap:0.6,eyeW:1},
      {hunch:22,lean:36,head:-42,jaw:56,th:0.8,aFs:96,aFe:94,aBs:90,aBe:88,hx:12,lFh:34,lFk:6,lBh:-30,lBk:-44,flap:0.8,eyeW:1},
      {hunch:26,lean:24,head:-34,jaw:40,th:0.7,aFs:60,aFe:70,aBs:50,aBe:60,hx:8,lFh:26,lFk:2,lBh:-22,lBk:-36},
      {hunch:28,lean:14,head:-28,jaw:30,th:0.6,aFs:24,aFe:36,aBs:14,aBe:26,hx:3},
      {hunch:30,lean:12,head:-26,jaw:24,th:0.55}][i]},
    shriek:{nome:'Grito curto de perto (atordoa)',n:8,hit:4,reach:46,dur:i=>[130,150,170,60,130,150,140,140][i],pose:i=>[
      {hunch:24,lean:10,head:-20,jaw:14,th:0.6,aFs:10,aFe:20,aBs:4,aBe:14,eyeW:1},
      {hunch:12,lean:-4,head:-48,jaw:10,th:1.0,aFs:-20,aFe:-10,aBs:-26,aBe:-16,hx:-3,lFh:12,lBh:-16,flap:0.4},
      {hunch:6,lean:-10,head:-58,jaw:6,th:1.3,aFs:-36,aFe:-26,aBs:-42,aBe:-32,hx:-4,lFh:10,lBh:-18,lBk:-28,shiver:1,flap:0.5},
      {hunch:26,lean:26,head:-20,jaw:70,th:1.5,aFs:-50,aFe:-56,aBs:-56,aBe:-62,hx:6,lFh:28,lFk:4,lBh:-24,lBk:-36,ring:1,flap:1.2,eyeW:1},
      {hunch:28,lean:30,head:-16,jaw:82,th:1.6,aFs:-56,aFe:-64,aBs:-62,aBe:-70,hx:8,lFh:30,lFk:6,lBh:-26,lBk:-38,ring:2,flap:1.3,eyeW:1,shiver:1},
      {hunch:26,lean:26,head:-20,jaw:70,th:1.2,aFs:-50,aFe:-56,aBs:-56,aBe:-62,hx:6,lFh:28,lFk:4,lBh:-24,lBk:-36,ring:3,flap:0.8,eyeW:1},
      {hunch:24,lean:14,head:-30,jaw:36,th:0.6,aFs:-10,aFe:6,aBs:-16,aBe:0,hx:2},
      {hunch:30,lean:12,head:-26,jaw:24,th:0.5}][i]},
    hurt:{nome:'Dano (cabeça)',n:4,dur:i=>[80,110,130,150][i],pose:i=>[
      {lean:-12,hunch:6,head:-50,jaw:50,th:0.6,aFs:-40,aFe:-20,aBs:-46,aBe:-28,hx:-7,flash:1,lFh:14,lBh:-2,swing:30,flap:0.8},
      {lean:-8,hunch:10,head:-44,jaw:44,th:0.5,aFs:-30,aFe:-6,aBs:-34,aBe:-14,hx:-6,lFh:12,lBh:-4,swing:22,flap:0.6},
      {lean:2,hunch:18,head:-32,jaw:30,th:0.4,aFs:-4,aFe:12,aBs:-10,aBe:6,hx:-2,swing:8},
      {lean:11,hunch:29,head:-26,jaw:22,th:0.48}][i]},
    hurtB:{nome:'Dano (barriga)',n:4,dur:i=>[80,120,140,150][i],pose:i=>[
      {lean:36,hunch:44,head:-2,jaw:46,th:0.1,aFs:50,aFe:20,aBs:42,aBe:10,hx:-7,flash:1,lFh:22,lFk:-12,lBh:-12,lBk:-30,swing:-30},
      {lean:32,hunch:42,head:-6,jaw:40,th:0.12,aFs:46,aFe:24,aBs:38,aBe:14,hx:-6,lFh:20,lFk:-10,lBh:-12,lBk:-28,swing:-20},
      {lean:20,hunch:34,head:-16,jaw:30,th:0.22,aFs:28,aFe:30,aBs:20,aBe:22,hx:-3},
      {lean:12,hunch:30,head:-26,jaw:22,th:0.46,hx:-1}][i]},
    fall:{nome:'Derrubado',n:6,dur:i=>[90,90,90,110,140,260][i],pose:i=>[
      {lean:-14,hunch:6,head:-40,jaw:56,th:0.6,aFs:-50,aFe:-30,aBs:-56,aBe:-40,hx:-6,flash:1,lFh:22,lBh:0,swing:40,flap:1},
      {rot:-30,lean:-4,hunch:8,head:-30,jaw:50,aFs:-80,aFe:-60,aBs:-90,aBe:-70,hx:-4,lFh:44,lFk:30,lBh:24,lBk:10,swing:40,flap:1},
      {rot:-62,lean:0,hunch:10,head:-20,jaw:44,aFs:-120,aFe:-120,aBs:-60,aBe:-40,hx:-6,lFh:54,lFk:40,lBh:34,lBk:24,swing:30,flap:0.6},
      {rot:-90,lean:4,hunch:12,head:-8,jaw:50,aFs:-150,aFe:-168,aBs:-22,aBe:-8,hx:2,lFh:44,lFk:12,lBh:30,lBk:4,swing:0},
      {rot:-84,lean:2,hunch:16,head:-16,jaw:40,aFs:-156,aFe:-172,aBs:-18,aBe:-4,hx:2,lFh:50,lFk:22,lBh:34,lBk:10},
      {rot:-90,lean:0,hunch:14,head:-10,jaw:46,aFs:-160,aFe:-176,aBs:-20,aBe:-6,hx:2,lFh:42,lFk:8,lBh:26,lBk:0}][i]},
    getup:{nome:'Levantar',n:6,dur:i=>[200,170,170,160,160,150][i],pose:i=>[
      {rot:-90,lean:0,hunch:14,head:-10,jaw:46,aFs:-160,aFe:-176,aBs:-20,aBe:-6,hx:2,lFh:42,lFk:8,lBh:26,lBk:0},
      {rot:-60,lean:10,hunch:24,head:-28,jaw:30,aFs:-50,aFe:-10,aBs:-60,aBe:-20,hx:-8,lFh:94,lFk:10,lBh:74,lBk:0},
      {rot:-30,lean:20,hunch:28,head:-36,jaw:26,aFs:-10,aFe:10,aBs:-20,aBe:0,hx:-6,lFh:114,lFk:10,lBh:64,lBk:-60},
      {rot:0,lean:34,hunch:28,head:-38,jaw:24,aFs:30,aFe:10,aBs:20,aBe:4,hx:-4,lFh:82,lFk:-2,lBh:6,lBk:-90,fB:60},
      {rot:0,lean:20,hunch:26,head:-30,jaw:22,aFs:20,aFe:30,aBs:12,aBe:22,hx:-1,lFh:34,lFk:-14,lBh:-12,lBk:-40},
      {lean:12,hunch:30,head:-26,jaw:20}][i]},
    death:{nome:'Morte (papo estoura)',n:8,dur:i=>[90,150,120,130,150,130,150,600][i],pose:i=>[
      {lean:-10,hunch:6,head:-44,jaw:60,th:1,aFs:-40,aFe:-20,aBs:-46,aBe:-28,hx:-6,flash:1,lFh:14,lBh:-4,swing:30},
      {lean:-6,hunch:4,head:-58,jaw:74,th:1.4,aFs:-70,aFe:-90,aBs:-76,aBe:-96,hx:-6,lFh:12,lBh:-8,shiver:1,eyeW:1},
      {lean:-2,hunch:10,head:-50,jaw:70,th:0.1,burst:1,aFs:-40,aFe:-20,aBs:-50,aBe:-30,hx:-5,lFh:14,lBh:-8},
      {lean:8,hunch:24,head:-14,jaw:50,burst:2,aFs:4,aFe:6,aBs:0,aBe:2,hx:-4,lFh:40,lFk:-30,lBh:28,lBk:-50,fF:10,fB:30},
      {lean:10,hunch:30,head:-10,jaw:46,burst:2,aFs:6,aFe:4,aBs:2,aBe:0,hx:-2,lFh:14,lFk:-92,lBh:6,lBk:-96,fF:100,fB:100},
      {rot:40,lean:10,hunch:30,head:-14,jaw:44,burst:3,aFs:60,aFe:80,aBs:48,aBe:66,hx:2,lFh:-14,lFk:-76,lBh:-22,lBk:-80,fF:66,fB:66},
      {rot:86,lean:2,hunch:16,head:-6,jaw:40,burst:3,aFs:150,aFe:170,aBs:110,aBe:150,hx:4,lFh:-4,lFk:-10,lBh:-8,lBk:-14,fF:10,fB:10,swing:-60},
      {rot:90,lean:0,hunch:14,head:-2,jaw:44,burst:4,aFs:160,aFe:176,aBs:116,aBe:156,hx:4,lFh:-2,lFk:-6,lBh:-6,lBk:-10,fF:6,fB:6,swing:-70}][i]},
  };
  const EXK=['hx','lean','hunch','head','aFs','aFe','aBs','aBe','lFh','lFk','lBh','lBk'];
  function exag(P,f){ if(f===1||Math.abs(P.rot)>4) return P; EXK.forEach(k=>{ P[k]=REST[k]+(P[k]-REST[k])*f; }); P.jaw=Math.min(84,REST.jaw+(P.jaw-REST.jaw)*f); return P; }
  const EXF={idle:1.12,walk:1.15,flee:1.12,attack:1.25,shove:1.25,shriek:1.2,scream:1.1,hurt:1.3,hurtB:1.25,fall:1.1,getup:1.08,death:1.12};
  ZREACT.add(ANIMS,REST,{moves:{scratch:["swipe","Unhada desesperada"]}}); // reações (voando, agarrado) + golpe extra — art-src/shared/zreact.js
  function poseOf(anim,i){ return exag(Object.assign({},REST,ANIMS[anim].pose(i)),EXF[anim]||1); }
  function heavyOutline(cv){ const g=cv.getContext('2d'), W=cv.width, H=cv.height, im=PIX.pix(cv), d=im.data;
    const isO=i=>d[i+3]===255&&d[i]===0x17&&d[i+1]===0x0b&&d[i+2]===0x1c, fill=i=>d[i+3]===255&&!isO(i);
    const add=[]; for(let y=2;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(d[i+3]) continue; const u=((y-1)*W+x)*4, u2=((y-2)*W+x)*4; if(isO(u)&&fill(u2)) add.push(i); }
    add.forEach(i=>{ d[i]=0x17; d[i+1]=0x0b; d[i+2]=0x1c; d[i+3]=255; }); g.putImageData(im,0,0); }

  /* ---------- esqueleto (coluna curva, pernas compridas) ---------- */
  const SPINE=40, TH=21, SH=20, UA=15, FA=14, VS=0.98, US=1, HB=10, HS=1.34;
  const lp=(p,a,L)=>({x:p.x+Math.sin(rad(a))*L, y:p.y+Math.cos(rad(a))*L});
  function build(P,dy){
    const R=P.rot, hip={x:AX+P.hx+(P.shiver?0.7:0), y:dy};
    const ra=rad(R), rc=Math.cos(ra), rs=Math.sin(ra);
    const HR=(lx,ly)=>({x:hip.x+lx*rc-ly*rs, y:hip.y+lx*rs+ly*rc});
    const hipF=HR(2.4,0), hipB=HR(-2.4,0);
    const kneeF=lp(hipF,P.lFh-R,TH), ankleF=lp(kneeF,P.lFk-R,SH), kneeB=lp(hipB,P.lBh-R,TH), ankleB=lp(kneeB,P.lBk-R,SH);
    const SS=[]; let x=hip.x, y=hip.y;
    for(let k=0;k<=SPINE;k++){ const t=k/SPINE, a=rad(R+P.lean+(P.hunch+HB)*Math.pow(t,1.3)); SS.push({x,y,a}); x+=Math.sin(a); y-=Math.cos(a); }
    const SP=(u,v)=>{ const f=Math.max(0,-v), k=Math.min(SPINE,Math.floor(f)), s=SS[k], r=f-k, a=s.a;
      const px=s.x+Math.sin(a)*r, py=s.y-Math.cos(a)*r; return {x:px+Math.cos(a)*u, y:py+Math.sin(a)*u}; };
    const T=(u,v)=>SP(u*US,v*VS);
    const top=SS[SPINE], sa=top.a, neck=T(2.4,-40);
    const shF=T(3,-33), shB=T(-3.4,-34);
    const ha=sa+rad(P.head-HB*0.8), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:neck.x+(lx*hc-ly*hs)*HS, y:neck.y+(lx*hs+ly*hc)*HS});
    const jp=H(-1.4,-6.4), ja=ha+rad(P.jaw), jc=Math.cos(ja), js=Math.sin(ja);
    const J=(lx,ly)=>({x:jp.x+(lx*jc-ly*js)*HS, y:jp.y+(lx*js+ly*jc)*HS});
    let elF,wrF;
    if(P.megaUp){ const m=H(12,-2), t={x:m.x-3,y:m.y+6}; const r=ik(shF,t,UA,FA,true); elF=r.E; wrF=r.W; }
    else { elF=lp(shF,P.aFs-R,UA); wrF=lp(elF,P.aFe-R,FA); }
    const elB=lp(shB,P.aBs-R,UA), wrB=lp(elB,P.aBe-R,FA);
    const toe=(a,f)=>{ const t=rad(f+R); return {x:a.x+(11*Math.cos(t)-5*Math.sin(t))*1.3, y:a.y+(11*Math.sin(t)+5*Math.cos(t))*1.3}; };
    const hand=(e,w)=>{ const L=Math.hypot(w.x-e.x,w.y-e.y)||1; return {x:w.x+(w.x-e.x)/L*7,y:w.y+(w.y-e.y)/L*7}; };
    const hull=[[hand(elF,wrF),6.5],[hand(elB,wrB),6.5],[ankleF,5.6],[ankleB,5.6],[toe(ankleF,P.fF),0.5],[toe(ankleB,P.fB),0.5],[kneeF,5],[kneeB,5],[hip,8],[T(0,-18),10],[T(-2,-32),10],[H(1,-12),12],[J(8,4),6],[(()=>{ const an=T(-7.4,-9), a=ra+rad(118-P.swing); return {x:an.x+Math.cos(a)*16,y:an.y+Math.sin(a)*16}; })(),10],[wrF,4],[wrB,4],[elF,4],[elB,4]];
    return {R,hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,SP,T,sa,neck,shF,shB,elF,wrF,elB,wrB,ha,H,ja,J,hull,ra};
  }
  function skeleton(P){
    const a=build(P,0); let m=-1e9; a.hull.forEach(([p,r])=>{ m=Math.max(m,p.y+r); });
    return build(P,GROUND-m-(P.lift||0));
  }

  /* ---------- utilitários ---------- */
  const LV={x:0.55,y:-0.83};
  function sideN(a,b){ const dx=b.x-a.x, dy=b.y-a.y, L=Math.hypot(dx,dy)||1; let nx=-dy/L, ny=dx/L; if(nx*LV.x+ny*LV.y>0){ nx=-nx; ny=-ny; } return {nx,ny,L}; }
  function limb(p,R,a,b,wa,wb,o){ o=o||{};
    p.F(R[1]); p.cap(a,b,wa,wb);
    const {nx,ny}=sideN(a,b), sh=o.sh!=null?o.sh:0.62;
    const ka=wa*(0.5-sh/2), kb=wb*(0.5-sh/2);
    p.F(R[2]); p.cap({x:a.x+nx*ka,y:a.y+ny*ka},{x:b.x+nx*kb,y:b.y+ny*kb},wa*sh,wb*sh);
    if(o.deep!==false){ const k2a=wa*0.33, k2b=wb*0.33; p.F(R[3]); p.cap({x:a.x+nx*k2a,y:a.y+ny*k2a},{x:b.x+nx*k2b,y:b.y+ny*k2b},wa*0.3,wb*0.3); }
    if(o.hi!==false){ const e=lerp(a,b,o.hl!=null?o.hl:0.7), ha=wa*0.22, hb=wb*0.22; p.F(R[0]); p.cap({x:a.x-nx*ha,y:a.y-ny*ha},{x:e.x-nx*hb,y:e.y-ny*hb},wa*0.18,wb*0.16); }
    return {nx,ny};
  }
  function clip(c,pts,fn){ c.save(); c.beginPath(); pts.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])); c.closePath(); c.clip(); fn(); c.restore(); }
  const W=(sk,list)=>list.map(([u,v])=>{ const q=sk.T(u,v); return [q.x,q.y]; });
  const Wp=(sk,u,v)=>sk.T(u,v);
  const Hl=(sk,list)=>list.map(([u,v])=>{ const q=sk.H(u,v); return [q.x,q.y]; });
  const Jl=(sk,list)=>list.map(([u,v])=>{ const q=sk.J(u,v); return [q.x,q.y]; });

  /* ---------- braço ---------- */
  function drawArm(c,u,M,sk,P,front){
    const p=mkPen(c,u), sh=front?sk.shF:sk.shB, el=front?sk.elF:sk.elB, wr=front?sk.wrF:sk.wrB; p._c=c; p.id();
    limb(p,M.skin,sh,el,10.4,8.8,{});
    const n=limb(p,M.skin,el,wr,9,7.4,{});
    p.F(M.skin[0]); p.circle(lerp(el,wr,0.05),1.1);
    // tendões e veias do braço magro
    p.F(M.skin[3]); const v0=lerp(el,wr,0.2), v1=lerp(el,wr,0.75); p.cap({x:v0.x-n.nx*1,y:v0.y-n.ny*1},{x:v1.x-n.nx*0.4,y:v1.y-n.ny*0.4},0.7,0.6);
    p.F(M.rot[1]); const r1=lerp(sh,el,0.7); p.ell(r1.x-n.nx*1,r1.y-n.ny*1,1.6,1.2);
    if(front){ p.F(M.flesh[2]); const w=lerp(el,wr,0.45); p.ell(w.x+n.nx*1.2,w.y+n.ny*1.2,1.8,1.2,Math.atan2(wr.y-el.y,wr.x-el.x)); p.F(M.flesh[1]); p.rect(w.x+n.nx*1.2-0.5,w.y+n.ny*1.2-0.5,1,1); }
    // manga curta da camisa
    const s1=lerp(sh,el,0.46);
    limb(p,M.shirt,sh,s1,13.6,12.6,{hl:0.5});
    const sn=sideN(sh,el), dir={x:(el.x-sh.x)/sn.L,y:(el.y-sh.y)/sn.L};
    p.F(M.shirt[3]); p.cap({x:s1.x-sn.nx*5.2,y:s1.y-sn.ny*5.2},{x:s1.x+sn.nx*5.2,y:s1.y+sn.ny*5.2},1.1,1.1);
    p.F(M.print[1]); const pp=lerp(sh,el,0.22); p.circle({x:pp.x-sn.nx*2,y:pp.y-sn.ny*2},1); p.F(M.print[2]); p.circle({x:pp.x+sn.nx*2.4+dir.x*2,y:pp.y+sn.ny*2.4+dir.y*2},0.8);
    drawHand(p,M,el,wr,P,front);
  }
  function drawHand(p,M,el,wr,P,front){
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y); p._c.scale(1.52,1.52);
    const g=P.grip;
    p.F(M.skin[1]); p.poly([[-1,-3],[4.4,-3.6],[5.6,-0.8],[5.2,3.2],[-1,3.2]]);
    p.F(M.skin[2]); p.poly([[-1,1.2],[5.4,1],[5.2,3.2],[-1,3.2]]);
    p.F(M.skin[0]); p.rect(0.4,-2.8,3.4,0.9);
    if(front&&P.megaUp){ // segura o megafone: punho fechado
      p.F(M.skin[1]); p.ell(5.2,-0.2,2.6,3); p.F(M.skin[2]); p.rect(4,1.2,3,1.2); p.F(M.skin[3]); [[5.6,-2],[5.8,-0.2],[5.6,1.4]].forEach(([x,y])=>p.rect(x,y,1.6,0.6));
      p.id(); return; }
    for(let k=0;k<4;k++){
      const y0=-2.6+k*1.8, cv=g?1.4:0.5, L1=3.8-(k===3?1:0), L2=3.4-(k===3?0.8:0);
      const a1={x:5,y:y0}, b1={x:5+L1*(g?0.7:1),y:y0-1*cv}, c1={x:b1.x+L2*0.6*(1-g*0.8),y:b1.y-L2*cv*(g?1:0.6)};
      p.F(M.skin[1]); p.cap(a1,b1,1.8,1.6); p.cap(b1,c1,1.6,1.3);
      p.F(M.skin[2]); p.rect(a1.x+0.4,y0+0.4,L1-1,0.6);
      // unhas compridas
      p.F(M.nail[1]); p.poly([[c1.x-0.6,c1.y-0.6],[c1.x+1.8,c1.y-1.6*(g?0.4:1)],[c1.x+0.4,c1.y+0.6]]);
    }
    p.F(M.skin[1]); p.cap(P2(1.8,-2.8),P2(4.8,-5.6+g),1.8,1.4); p.F(M.nail[1]); p.ell(5.2,-6+g,0.8,0.7);
    p.id();
  }

  /* ---------- perna ---------- */
  function drawLeg(c,u,M,sk,P,front){
    const p=mkPen(c,u), hip=front?sk.hipF:sk.hipB, knee=front?sk.kneeF:sk.kneeB, ank=front?sk.ankleF:sk.ankleB; p.id();
    const n=limb(p,M.skin,knee,ank,7.6,6.2,{hl:0.5});
    p.F(M.skin[0]); p.circle({x:knee.x-n.nx*1.6,y:knee.y-n.ny*1.6+1.4},1.2);
    p.F(M.rot[1]); const r=lerp(knee,ank,0.5); p.ell(r.x-n.nx*0.8,r.y-n.ny*0.8,1.4,2.2,Math.atan2(ank.y-knee.y,ank.x-knee.x)+PI/2);
    p.F(M.rot[2]); p.circle({x:r.x-n.nx*0.4,y:r.y+1},0.7);
    if(front){ p.F(M.blood[2]); const b=lerp(knee,ank,0.7); p.rect(b.x-n.nx*1.4,b.y-1,1,2.6); }
    // meia arriada
    p.F(M.sole[2]); const so=lerp(knee,ank,0.86); p.cap({x:so.x-n.nx*3,y:so.y-n.ny*3},{x:so.x+n.nx*3,y:so.y+n.ny*3},2.4,2.4); p.F(M.sole[1]); p.rect(so.x-n.nx*2-0.5,so.y-1.4,1.4,1);
    // bermuda cáqui folgada até o joelho
    const kb=lerp(hip,knee,1.02);
    limb(p,M.shorts,hip,kb,13.6,12.4,{hl:0.55});
    const kn=sideN(hip,knee), dir={x:(knee.x-hip.x)/kn.L,y:(knee.y-hip.y)/kn.L};
    p.F(M.shorts[3]); p.cap({x:kb.x-kn.nx*5,y:kb.y-kn.ny*5},{x:kb.x+kn.nx*5,y:kb.y+kn.ny*5},1.2,1.2);
    p.F(M.shorts[2]); const f1=lerp(hip,kb,0.5); p.cap({x:f1.x-kn.nx*3.4,y:f1.y-kn.ny*3.4},{x:f1.x-kn.nx*0.4+dir.x*2.4,y:f1.y-kn.ny*0.4+dir.y*2.4},0.9,0.8);
    p.F(M.shorts[0]); const f3=lerp(hip,kb,0.28); p.cap({x:f3.x-kn.nx*3.2,y:f3.y-kn.ny*3.2},{x:f3.x-kn.nx*1.4+dir.x*3,y:f3.y-kn.ny*1.4+dir.y*3},0.9,0.8);
    // bolso lateral (cargo)
    if(front){ const t=lerp(hip,kb,0.58); p.F(M.shorts[2]); p.poly([[t.x-kn.nx*0.6-dir.x*2.6,t.y-kn.ny*0.6-dir.y*2.6],[t.x+kn.nx*3.6-dir.x*2.6,t.y+kn.ny*3.6-dir.y*2.6],[t.x+kn.nx*3.4+dir.x*3,t.y+kn.ny*3.4+dir.y*3],[t.x-kn.nx*0.4+dir.x*3,t.y-kn.ny*0.4+dir.y*3]]);
      p.F(M.shorts[3]); p.cap({x:t.x-kn.nx*0.6-dir.x*2.6,y:t.y-kn.ny*0.6-dir.y*2.6},{x:t.x+kn.nx*3.6-dir.x*2.6,y:t.y+kn.ny*3.6-dir.y*2.6},0.8,0.8); }
    // tênis de lona
    const fa=rad((front?P.fF:P.fB)+sk.R); p.xf(fa,ank.x,ank.y); c.scale(1.3,1.3);
    p.F(M.shoe[1]); p.poly([[-3.8,-1.8],[2,-2.2],[6,0.2],[10,1.4],[11.4,3],[-4.2,3]]);
    p.F(M.shoe[2]); p.poly([[-4.2,1.2],[11,1.6],[11.4,3],[-4.2,3]]);
    p.F(M.shoe[0]); p.rect(-2.4,-1.6,3.2,0.8);
    p.F(M.sole[1]); p.poly([[-4.6,2.8],[11.6,2.6],[12,4.4],[-4.8,4.6]]); p.F(M.sole[0]); p.rect(6,2.7,5.4,0.7); p.F(M.sole[3]); p.rect(-4.8,4,16.8,0.8);
    p.F(M.sole[1]); [[2.4,-0.8],[4,0],[5.6,0.6]].forEach(([x,y])=>p.rect(x,y,0.9,0.9));
    if(front){ p.F(M.skin[1]); p.ell(10.2,1.4,1.6,1.1); p.F(M.nail[1]); p.rect(10.4,0.8,0.8,0.7); } // dedão furando a lona
    p.id();
  }

  /* ---------- tronco: magro, camisa aberta, costelas ---------- */
  const FLW=[[-5,-31],[-2.4,-19],[-5.6,-9],[8.8,-24],[9.4,-12]];
  const SIL=[[-6.6,3],[-7.4,-6],[-8,-16],[-8.6,-26],[-8.2,-33],[-5.8,-38.4],[-1.2,-40.6],[3.6,-40.2],[7.4,-36.6],[8.6,-31],[8,-24],[6.2,-17],[5.6,-10],[6.6,-4],[7.2,3]];
  function drawTorso(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    // bermuda (cós) e cordão
    p.F(M.shorts[1]); p.poly(W(sk,[[-7.2,-3],[7.6,-3],[7.8,5],[-7.4,5]]));
    p.F(M.shorts[2]); p.poly(W(sk,[[-7.4,-0.6],[7.8,-0.6],[7.8,5],[-7.4,5]]));
    p.F(M.shorts[3]); p.poly(W(sk,[[-7.2,-3],[7.6,-3],[7.6,-2],[-7.2,-2]]));
    p.F(M.capw[1]); p.poly(W(sk,[[5,-2.6],[6,-2.6],[6.6,2],[5.8,2.2]]));
    // peito nu (pele) com sombra grande
    const sil=W(sk,SIL);
    p.F(M.skin[1]); p.poly(sil);
    clip(c,sil,()=>{ p.F(M.skin[2]); p.poly(W(sk,[[-12,6],[-12,-44],[-1,-44],[0,-34],[1,-26],[2,-18],[3,-10],[4,-3],[10,6]]));
      p.F(M.skin[3]); p.poly(W(sk,[[-12,6],[-12,-44],[-3,-44],[-1,-36],[0,-26],[1,-16],[0.6,-8],[1.4,6]]));
      p.F(M.skin[3]); p.poly(W(sk,[[3,-16],[6.6,-17.6],[6,-10],[4,-8]])); // barriga funda
      p.F(M.skin[0]); p.poly(W(sk,[[4,-38],[7.4,-36],[8.4,-31],[6.6,-31],[4.6,-34]])); });
    // costelas (osso aparecendo sob a pele fina)
    [[-30.6,1],[-27.2,0.8],[-23.8,0.6],[-20.4,0.4]].forEach(([v,w],k)=>{
      p.F(M.skin[3]); p.poly(W(sk,[[1.6,v+1.2],[5.4,v+0.4],[8-k*0.6,v-0.8],[7.8-k*0.6,v+0.2],[5.4,v+1.4],[1.8,v+2]]));
      p.F(M.skin[0]); p.poly(W(sk,[[2.2,v],[5.4,v-0.6],[7.6-k*0.6,v-1.6],[7.8-k*0.6,v-0.8],[5.4,v+0.4],[2,v+1]])); });
    p.F(M.skin[3]); p.poly(W(sk,[[6.2,-33],[7,-33],[6.4,-20],[5.8,-20]])); // esterno
    p.F(M.skin[3]); const nv=Wp(sk,5.2,-6); p.rect(nv.x-0.5,nv.y-0.5,1,1);
    // mordida no flanco
    p.F(M.flesh[3]); p.poly(W(sk,[[-1,-15],[2.6,-16],[3.6,-12.6],[1.6,-10],[-1.2,-11.4]]));
    p.F(M.flesh[1]); p.poly(W(sk,[[-0.4,-14.4],[2.2,-15.2],[2.8,-12.8],[1.4,-11],[-0.4,-12]]));
    p.F(M.flesh[0]); p.rect(Wp(sk,1,-14).x,Wp(sk,1,-14).y,1,0.8);
    p.F(M.blood[1]); p.poly(W(sk,[[0.6,-10.6],[1.4,-10.8],[1.2,-7.4],[0.8,-7.2]]));
    // camisa aberta: metade de trás + aba da frente
    const fl=P.flap||0;
    const back=W(sk,[[-7.6,-1.4],[-8.4,-12],[-9,-24],[-8.6,-33],[-6,-38.8],[-1.2,-41],[3.4,-40.6],[2.6,-34],[0.8,-26],[0,-16],[0.4,-6],[1.6,-1.4],[-3,0]]);
    const flap=W(sk,[[3.4,-40.4],[7.8,-37],[9.4,-30],[9.8+fl*1.4,-20],[10.8+fl*3,-9],[10+fl*3.4,-5],[7.4+fl*1.4,-5.8],[7.2,-16],[8,-26],[6.4,-33]]);
    const paint=(shape,t)=>clip(c,shape,()=>{ p.F(M.shirt[t]); p.poly(shape);
      p.F(M.print[Math.min(3,t)]); FLW.forEach(([x,y])=>{ const q=Wp(sk,x,y); p.ell(q.x-1,q.y,1.1,1.1); p.ell(q.x+1,q.y,1.1,1.1); p.ell(q.x,q.y-1,1.1,1.1); p.ell(q.x,q.y+1,1.1,1.1); });
      p.F(M.cap[Math.min(3,t+1)]); FLW.forEach(([x,y])=>{ const q=Wp(sk,x,y); p.rect(q.x-0.5,q.y-0.5,1,1); }); });
    paint(back,1);
    clip(c,back,()=>{ clip(c,W(sk,[[-14,6],[-14,-46],[-3,-46],[-4,-36],[-3,-24],[-2,-12],[0,6]]),()=>paint(back,2)); });
    clip(c,back,()=>{ clip(c,W(sk,[[-14,6],[-14,-46],[-6.4,-46],[-7.2,-34],[-6.6,-20],[-5,6]]),()=>paint(back,3)); });
    clip(c,back,()=>{ clip(c,W(sk,[[-4,-46],[4,-46],[2,-37],[-3,-38]]),()=>paint(back,0)); });
    paint(flap,1);
    clip(c,flap,()=>{ clip(c,W(sk,[[7.4,-30],[14,-30],[16,0],[7,0],[8,-16]]),()=>paint(flap,2)); });
    // dobras e gola
    p.F(M.shirt[3]); [[[-5,-16],[-1.4,-19],[-1,-18.2],[-4.6,-15.2]],[[-6,-28],[-2,-30],[-1.8,-29.2],[-5.8,-27.2]]].forEach(f=>p.poly(W(sk,f)));
    p.F(M.shirt[0]); p.poly(W(sk,[[-1.4,-41],[3.6,-40.6],[1.8,-37],[-0.4,-38.6]])); p.poly(W(sk,[[3.6,-40.4],[7.4,-37.2],[6.6,-35.6],[4,-38]]));
    p.F(M.shirt[3]); p.poly(W(sk,[[7.4,-5.8+0],[10+fl*3.4,-5],[10+fl*3.4,-4],[7.4,-4.8]]));
    p.F(M.capw[1]); [[8.6,-30],[9.4,-22],[10.2+fl*2,-12]].forEach(([x,y])=>{ const q=Wp(sk,x,y); p.rect(q.x-0.5,q.y-0.5,1.1,1.1); }); // botões soltos
    // alça do megafone atravessando o peito
    p.F(M.strap[1]); p.poly(W(sk,[[4.4,-40.4],[7,-39.2],[-6.4,-8],[-8.6,-9.6]]));
    p.F(M.strap[0]); p.poly(W(sk,[[5,-40.2],[6,-39.8],[-7.4,-8.6],[-8.2,-9.2]]));
    p.F(M.strap[3]); p.poly(W(sk,[[6.6,-39.2],[7.2,-38.8],[-6.2,-7.8],[-6.8,-7.6]]));
    p.F(M.grille[1]); const bk=Wp(sk,0.6,-25); p.rect(bk.x-1.2,bk.y-1.2,2.4,2.6); p.F(M.grille[0]); p.rect(bk.x-1.2,bk.y-1.2,1,1);
    // sangue escorrido da boca no peito
    p.F(M.blood[2]); p.poly(W(sk,[[6.6,-38],[8.4,-34],[8,-29],[7.2,-31],[6.8,-27],[6.2,-33]]));
    p.F(M.blood[1]); p.poly(W(sk,[[6.8,-37.4],[7.8,-34.6],[7.4,-32.4],[6.8,-34.6]]));
    if(form==='plenilunar'){ p.F(M.bone[1]); [[-8.4,-30,-14,-34],[-8.8,-22,-14.6,-22],[-8,-14,-13,-11]].forEach(([u0,v0,u1,v1])=>{ const a=Wp(sk,u0,v0+1.6), b=Wp(sk,u1,v1), d=Wp(sk,u0+0.6,v0-1.6); p.poly([[a.x,a.y],[b.x,b.y],[d.x,d.y]]); }); }
    if(form!=='comum'){ p.F(M.glow[1]); [[[2,-30],[4,-36],[4.6,-35.6],[2.6,-29.6]],[[2.4,-18],[5,-24],[5.6,-23.6],[3,-17.6]]].forEach(f=>p.poly(W(sk,f))); }
  }

  /* ---------- megafone quebrado ---------- */
  function megaShape(p,M,fi,up){
    // eixo +x: bocal (x=0) → campânula (x=14). Cabo pra baixo em y+.
    p.F(M.mega[2]); p.poly([[1.6,1.6],[4,1.6],[4.6,6],[2.2,6.4]]); // cabo
    p.F(M.mega[3]); p.rect(2.2,4.6,2.4,0.8);
    p.F(M.mega[1]); p.poly([[0,-2],[5,-2.4],[14,-6.6],[14.6,-6],[14.6,6],[14,6.6],[5,2.4],[0,2]]);
    p.F(M.mega[0]); p.poly([[0.4,-1.6],[5,-2],[13,-5.8],[13,-4.4],[5,-0.8],[0.4,-0.6]]);
    p.F(M.mega[2]); p.poly([[0.4,1],[5,1.2],[13.6,5.4],[13.6,6.2],[5,2.2],[0.4,1.8]]);
    p.F(M.cap[1]); p.poly([[5.6,-2.6],[7.6,-3.6],[7.6,3.6],[5.6,2.6]]); p.F(M.cap[0]); p.rect(5.6,-2.6,2,1);
    p.F(M.grille[2]); p.ell(14.4,0,1.6,6.6); p.F(M.grille[1]); p.ell(14.8,0,1,5.6); p.F(M.grille[3]); [[-3.6],[-1.2],[1.2],[3.6]].forEach(([y])=>p.rect(14.2,y-0.3,1.4,0.6));
    // rachadura e pedaço faltando
    p.F(M.mega[3]); p.poly([[9,-4.4],[10.4,-2],[9.6,0],[11.4,2.4],[11,2.8],[9,0.2],[9.8,-2]]);
    p.F(M.grille[3]); p.poly([[12,-6.2],[14.6,-6],[14.6,-3.4],[13,-4.6]]);
    // fio solto pendurado com a mola
    if(!up){ const sw=(fi%4)*0.6; p.F(M.grille[2]); p.cap(P2(1,1.4),P2(-1.4,5),0.7,0.7); p.cap(P2(-1.4,5),P2(-0.6+sw,9),0.7,0.6); p.F(M.cap[1]); p.rect(-1.2+sw,8.8,1.4,1.2); p.F(M.metal?M.metal[1]:M.grille[0]); p.rect(-1+sw,9.8,0.5,0.9); p.rect(0+sw,9.8,0.5,0.9); }
  }
  function drawMega(c,u,M,sk,P,fi){
    const p=mkPen(c,u); p.id();
    if(P.megaUp){ const w=sk.wrF, a=sk.ha+rad(-10); const m=sk.H(11,-2.6);
      p.xf(a,m.x,m.y); c.scale(1.25,1.25); megaShape(p,M,fi,true); p.id(); return; }
    const an=Wp(sk,-7.4,-9), a=sk.ra+rad(118-P.swing);
    // alça curta até a argola
    p.F(M.strap[1]); p.cap(an,{x:an.x+Math.cos(a)*1.6,y:an.y+Math.sin(a)*1.6},1.8,1.6);
    const o={x:an.x+Math.cos(a)*1.2+Math.cos(a+PI/2)*2.6,y:an.y+Math.sin(a)*1.2+Math.sin(a+PI/2)*2.6};
    p.xf(a,o.x,o.y); c.scale(1.42,1.42); megaShape(p,M,fi,false); p.id();
  }

  /* ---------- cabeça: crânio estreito, boné virado, boca rasgada até a orelha, papo ---------- */
  function drawNeck(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.xf(sk.ha,sk.neck.x,sk.neck.y); c.scale(HS,HS);
    // pescoço comprido e fino com pomo e tendões
    p.F(M.skin[1]); p.poly([[-4.6,9],[2.6,9],[3.2,0],[2.4,-7],[-3.6,-8]]);
    p.F(M.skin[2]); p.poly([[-4.6,9],[-1.6,9],[-1.4,-7.6],[-3.6,-8]]);
    p.F(M.skin[3]); p.poly([[-4.6,9],[-3.4,9],[-3.2,-7.8],[-3.6,-8]]);
    p.F(M.skin[3]); p.rect(0.6,-4,0.7,10);
    if(P.burst){ drawThroatBurst(p,M,P); p.id(); return; }
    // papo da garganta inflado (pele fina, veias e brilho por dentro)
    const t=P.th, rx=3.4+t*4.6, ry=3.4+t*4, cx=3.4+t*2.6, cy=2.4+t*1.6;
    p.F(M.sac[2]); p.ell(cx,cy,rx,ry);
    p.F(M.sac[1]); p.ell(cx+0.4,cy-0.6,rx-1,ry-1.2);
    p.F(M.sac[0]); p.ell(cx+rx*0.3,cy-ry*0.4,rx*0.32,ry*0.26);
    if(t>0.8||form!=='comum'){ const g=Math.min(1,(t-0.4)); p.F(M.glow[2]); p.ell(cx,cy+0.4,rx*0.62,ry*0.56); p.F(M.glow[1]); p.ell(cx+0.2,cy+0.2,rx*0.4*(0.6+g*0.4),ry*0.34*(0.6+g*0.4)); if(t>1) { p.F(M.glow[0]); p.ell(cx+0.4,cy,rx*0.18,ry*0.16); } }
    p.F(M.sac[3]); p.cap(P2(cx-rx*0.7,cy-ry*0.3),P2(cx-rx*0.2,cy+ry*0.3),0.6,0.5); p.cap(P2(cx-rx*0.2,cy+ry*0.3),P2(cx+rx*0.3,cy+ry*0.7),0.5,0.5); p.cap(P2(cx+rx*0.5,cy-ry*0.7),P2(cx+rx*0.7,cy),0.5,0.5);
    p.F(M.sac[2]); p.cap(P2(cx-rx*0.1,cy+ry*0.9),P2(cx+rx*0.5,cy+ry*0.8),0.6,0.6);
    p.id();
  }
  function drawThroatBurst(p,M,P){
    // papo estourado: retalhos, carne e sangue jorrando
    p.F(M.sac[2]); p.poly([[1,-4],[5,-5],[6,-1],[4.6,0],[5.4,3],[3,2],[2,5],[0.6,1]]);
    p.F(M.flesh[2]); p.ell(3,-0.6,2.6,3); p.F(M.flesh[1]); p.ell(3.4,-1,1.6,2); p.F(M.bone[1]); p.rect(2,-2.6,0.9,3.4);
    if(P.burst===1){ p.F(M.blood[1]); for(let k=0;k<7;k++){ const a=-1.4+k*0.42, L=9+(k%3)*4; p.poly([[4+Math.cos(a-0.2)*2,-1+Math.sin(a-0.2)*2],[4+Math.cos(a)*L,-1+Math.sin(a)*L],[4+Math.cos(a+0.2)*2,-1+Math.sin(a+0.2)*2]]); }
      p.F(M.blood[0]); [[14,-6,1.4],[12,6,1.2],[16,1,1]].forEach(([x,y,r])=>p.circle(P2(x,y),r)); }
    else { p.F(M.blood[1]); p.poly([[2,1],[4,1],[3.6,5+P.burst],[2.6,5+P.burst]]); p.F(M.blood[2]); p.rect(2.4,4+P.burst,1.2,1.2); }
  }
  function drawMouth(c,u,M,sk,P){
    // cavidade da boca entre as maxilas (fica atrás delas)
    const p=mkPen(c,u); p.id(); if(P.jaw<6) return;
    const cav=[...Hl(sk,[[-1.6,-7.4],[12.4,-7.6]]),...Jl(sk,[[14.4,0.4],[-0.4,0.6]])];
    p.F(M.mouth[2]); p.poly(cav);
    clip(c,cav,()=>{ p.F(M.mouth[3]); p.poly([...Hl(sk,[[-1.6,-7.4],[5,-7.4]]),...Jl(sk,[[6,1],[-0.4,1]])]);
      p.F(M.mouth[1]); const q=sk.J(7,0.4), r=sk.J(12,0.2); p.cap(q,r,3,2.4); p.F(M.mouth[0]); p.cap(sk.J(8,-0.2),sk.J(11,-0.4),1.2,1);
      if(P.jaw>40){ p.F(M.mouth[3]); const g=lerp(sk.H(0,-6),sk.J(1,0),0.5); p.ell(g.x,g.y,2.2,2.8); } });
    // fiapos de carne ligando as maxilas (bochecha rasgada)
    if(P.jaw>14){ p.F(M.flesh[2]); p.cap(sk.H(1.4,-6.6),sk.J(2,0.2),1.4,1.2); p.F(M.flesh[1]); p.cap(sk.H(3.6,-6.8),sk.J(4.6,0),0.8,0.6); p.F(M.flesh[3]); p.cap(sk.H(-0.6,-6.4),sk.J(0.2,0.4),1.1,1); }
  }
  function drawHead(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.xf(sk.ha,sk.neck.x,sk.neck.y); c.scale(HS,HS);
    // crânio estreito e comprido
    p.F(M.skin[1]); p.ell(1.6,-14.4,8.2,8.4);
    p.poly([[-4.6,-9],[12.6,-10.6],[13.4,-7.4],[-2.6,-6.4]]);
    p.F(M.skin[2]); p.poly([[-6.6,-17],[-5,-9],[-1.6,-6.4],[4,-6.4],[0,-8.6],[-2.6,-12],[-3.6,-17]]);
    p.F(M.skin[3]); p.poly([[-6.6,-16],[-6,-11],[-3.6,-6.8],[-4.4,-12]]);
    // orelha
    p.F(M.skin[1]); p.ell(-2.6,-12,2,3); p.F(M.skin[3]); p.ell(-2.4,-11.8,0.9,1.8); p.F(M.flesh[2]); p.rect(-3.4,-9.6,1,1.2);
    // maçã do rosto saltada, bochecha funda
    p.F(M.skin[3]); p.poly([[2,-9.4],[7,-10.2],[6,-8.6],[2.6,-8.2]]);
    p.F(M.skin[0]); p.poly([[4.4,-12],[8.6,-12.4],[8,-11.2],[4.8,-11]]);
    // olhos esbugalhados (pânico): órbita funda, globo grande, pupila mínima
    const ew=P.eyeW?1.18:1;
    p.F(M.skin[3]); p.ell(8,-14,3.4*ew,3*ew);
    p.F(M.mouth[3]); p.ell(8.2,-13.8,2.6*ew,2.3*ew);
    p.F(M.eye[1]); p.ell(8.6,-14.2,1.9*ew,1.8*ew); p.F(M.eye[0]); p.rect(7.8,-15.4,1,0.9);
    p.F(M.eye[2]); p.rect(7.4,-13.2,2.4,0.7);
    p.F(M.blood[1]); p.rect(9.4,-14.6,1.1,1.1); p.F(M.blood[3]); p.rect(9.8,-14.4,0.5,0.6);
    p.F(M.skin[3]); p.ell(12.4,-14.4,1,1.6*ew); p.F(M.eye[1]); p.rect(12.1,-15,0.9,1.4);
    // sobrancelha erguida (medo)
    p.F(M.skin[3]); p.poly([[5,-18.4],[11.6,-17.6],[11.6,-16.8],[5,-17.4]]);
    // nariz fino e quebrado
    p.F(M.skin[1]); p.poly([[11.6,-14],[15,-10.6],[13.6,-9.4],[11.6,-10]]);
    p.F(M.skin[3]); p.rect(13,-10.2,1.2,0.8); p.F(M.skin[0]); p.rect(12.4,-13,0.9,1.4);
    // maxila de cima: fileira longa de dentes até a orelha (rasgo)
    p.F(M.mouth[1]); p.poly([[-2,-8],[13,-9.4],[13.4,-6.8],[-2,-6]]);
    p.F(M.flesh[1]); p.poly([[-2.6,-8.6],[3,-9],[3.2,-6.6],[-2.6,-6]]);
    p.F(M.flesh[0]); p.rect(-1,-8.6,2.4,0.7);
    p.F(M.teeth[1]); for(let k=0;k<9;k++){ const x=-1.4+k*1.6, h=k%2?1.6:2.2; p.rect(x,-7.4,1.1,h); }
    p.F(M.teeth[3]); for(let k=0;k<9;k++){ const x=-1.4+k*1.6; p.rect(x+0.6,-7.4,0.5,0.6); }
    // podridão e veias
    p.F(M.rot[1]); p.ell(-1,-18,2,1.4); p.ell(5,-7.8,1.2,0.8); p.F(M.rot[2]); p.rect(-1.6,-18.4,1,1);
    p.F(M.skin[3]); p.cap(P2(1,-13),P2(3,-10.8),0.5,0.5); p.cap(P2(3,-10.8),P2(2.4,-9.2),0.5,0.5);
    // boné virado pra trás
    const dome=[]; for(let k=0;k<=12;k++){ const a=PI*1.08+k/12*PI*0.8; dome.push([1.2+Math.cos(a)*8.4,-16.2+Math.sin(a)*7.4]); }
    p.F(M.cap[1]); p.poly([...dome,[8.4,-19.4],[-6.4,-17.2]]);
    p.F(M.cap[2]); p.poly([[-7.4,-16],[-6,-20],[-3,-22.6],[-2,-21],[-4.4,-18],[-5,-15.6]]);
    p.F(M.cap[0]); p.poly([[2,-23.2],[6.4,-21.6],[8.4,-19],[5,-20.4],[1.6,-22]]);
    p.F(M.capw[1]); p.poly([[-1,-23.2],[2.6,-23.6],[3.2,-21],[-0.6,-20.6]]); // painel da frente (virado)
    p.F(M.cap[3]); p.poly([[-6.4,-17.4],[8.4,-19.6],[8.4,-18.8],[-6.4,-16.6]]);
    // aba pra trás + ajuste
    p.F(M.cap[2]); p.poly([[-6,-17.4],[-14,-15.6],[-14.6,-14.2],[-6.4,-15]]);
    p.F(M.cap[3]); p.poly([[-6.4,-15.4],[-14.6,-14.6],[-14.6,-14],[-6.4,-14.8]]);
    p.F(M.cap[0]); p.poly([[-6.6,-17.4],[-13.4,-15.8],[-13.6,-15.2],[-6.6,-16.6]]);
    p.F(M.capw[2]); p.rect(-6.4,-19.6,2.4,1.2);
    // cabelo seboso saindo por baixo
    p.F(M.hair[1]); p.poly([[-7,-15],[-4,-15],[-4.6,-12],[-6.4,-9],[-7.6,-11]]); p.F(M.hair[0]); p.rect(-6,-14.6,1,1.2);
    if(form!=='comum'){ p.F(M.glow[0]); p.rect(7.6,-15.6,1.6,1.4); p.F(M.glow[1]); p.rect(12.1,-15,0.9,1.4); }
    p.id();
  }
  function drawJaw(c,u,M,sk,P){
    const p=mkPen(c,u); p.xf(sk.ja,sk.J(0,0).x,sk.J(0,0).y); c.scale(HS,HS);
    const L=14.2;
    p.F(M.skin[1]); p.poly([[-1.6,-0.8],[L,0],[L+1,2],[L-0.6,4.8],[8,6.4],[1,6],[-2.4,2.6]]);
    p.F(M.skin[2]); p.poly([[-2.4,2.6],[1,6],[8,6.4],[L-0.6,4.8],[L-2,4.2],[4,4.4],[0,3]]);
    p.F(M.skin[3]); p.poly([[1.4,6],[8,6.4],[11,5.6],[5,5.4]]);
    p.F(M.mouth[1]); p.poly([[-1.6,-0.6],[L-0.4,0],[L-1,1.4],[-1,1.4]]);
    p.F(M.flesh[1]); p.poly([[-2,-0.8],[3,-0.6],[3,1.4],[-2,1.6]]);
    p.F(M.teeth[1]); for(let k=0;k<8;k++){ const x=-0.6+k*1.7, h=k%2?1.6:2.2; p.rect(x,-h+0.6,1.1,h); }
    p.F(M.teeth[3]); for(let k=0;k<8;k++){ p.rect(-0.6+k*1.7+0.6,-0.2,0.5,0.6); }
    p.F(M.skin[0]); p.rect(7,1.8,4,0.9);
    p.F(M.rot[1]); p.ell(3.4,4.2,1.4,1);
    const L2=2+(P.jaw>30?3:0)+(P.ring?2:0);
    p.F(M.blood[1]); p.poly([[L-1.6,4],[L,3.6],[L-0.4,4+L2],[L-1,4.8+L2]]); p.ell(L-0.7,4.8+L2,1,1);
    p.id();
  }
  /* ondas do grito (FX desenhado na arte; sem sombreamento) */
  function drawRings(c,u,M,sk,P){
    const p=mkPen(c,u); p.id();
    const m=lerp(sk.H(13,-8),sk.J(14,0),0.5), a=Math.atan2(m.y-sk.neck.y,m.x-sk.neck.x)*0.5+(sk.ha+rad(P.jaw*0.5))*0.5;
    const base=P.ring;
    for(let k=0;k<3;k++){ const r=8+k*11+base*3.4; if(m.x+r*0.9>FW-3) continue; const th=Math.max(1.4,3.2-k*0.7), sp=0.62+k*0.08, n=10, pts=[];
      for(let i=0;i<=n;i++){ const t=a-sp+2*sp*i/n; pts.push([m.x+Math.cos(t)*r,m.y+Math.sin(t)*r]); }
      for(let i=n;i>=0;i--){ const t=a-sp+2*sp*i/n, rr=r-th*(1-Math.abs(i/n-0.5)*1.2); pts.push([m.x+Math.cos(t)*rr,m.y+Math.sin(t)*rr]); }
      p.F(k===0?M.glow[0]:k===1?M.glow[1]:M.glow[2]); p.poly(pts); }
    // respingos de baba voando
    p.F(M.blood[0]); [[10,-4,1.2],[16,3,1],[13,6,0.9]].forEach(([x,y,r])=>{ const q={x:m.x+Math.cos(a)*x-Math.sin(a)*y,y:m.y+Math.sin(a)*x+Math.cos(a)*y}; if(q.x<FW-3) p.circle(q,r); });
  }

  /* ---------- montagem ---------- */
  const cache=PIX.cache();
  function frame(form,anim,fi,step=5,Pov,pk){
    const K=PIX.getK(), key=(pk!=null?'#'+pk+'|'+form:form+'|'+anim+'|'+fi+'|'+step)+'@'+K;
    const hit=cache.get(key); if(hit){ cache.delete(key); cache.set(key,hit); return hit; }
    const P=Pov?Object.assign({},REST,Pov):poseOf(anim,fi), M=mats(form), sk=skeleton(P), f=fi|0;
    const parts=[
      {back:true, draw:(c,u)=>drawArm(c,u,M,sk,P,false)},
      {back:true, draw:(c,u)=>drawLeg(c,u,M,sk,P,false)},
      ...(P.megaUp?[]:[{draw:(c,u)=>drawMega(c,u,M,sk,P,f)}]),
      {draw:(c,u)=>drawTorso(c,u,M,sk,P,form)},
      {draw:(c,u)=>drawLeg(c,u,M,sk,P,true)},
      {draw:(c,u)=>drawNeck(c,u,M,sk,P,form)},
      {draw:(c,u)=>drawMouth(c,u,M,sk,P)},
      {draw:(c,u)=>drawHead(c,u,M,sk,P,form)},
      {draw:(c,u)=>drawJaw(c,u,M,sk,P)},
    ];
    parts.push({draw:(c,u)=>drawArm(c,u,M,sk,P,true)});
    if(P.megaUp) parts.push({draw:(c,u)=>drawMega(c,u,M,sk,P,f)});
    if(P.ring) parts.push({noShade:true, noRim:true, smear:true, draw:(c,u)=>drawRings(c,u,M,sk,P)});
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM[form]}); if(step>=4) heavyOutline(cv);
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._mouth=sc(lerp(sk.H(12,-7),sk.J(12,0),0.5)); cv._eye=sc(sk.H(8.4,-14.4)); cv._hand=sc(sk.wrF); cv._head=sc(sk.H(2,-14)); cv._throat=sc(sk.H(5,0));
    cache.set(key,cv); if(cache.size>900) cache.delete(cache.keys().next().value);
    return cv;
  }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame,framePose:function(form,anim,P,key){ return frame(form,anim,0,5,P,key); }};
})();

/* ===== zombies/barr ===== */
/* BARR — fonte de arte (editável). Build: npm run art
   Barrigudo: farofeiro de Boa Viagem que inchou até virar balão. Barriga translúcida e esticada com gases
   brilhando por dentro, regata enrolada no peito, short de praia florido, chinelo, óculos escuros na testa.
   Explode ao morrer (anim `explode`, evento boomAt). Hi-bit: honra PIX.getK(). */
const BARR=(function(){
  const {rad,lp,lerp,P2,mkPen,compose}=PIX;
  const FW=216, FH=168, GROUND=158, AX=98, HS=1.5;
  const RIM={comum:'#dcf0b0', enluarado:'#9ff6ff', plenilunar:'#ffb46a'};

  function mats(form){
    const m={
      skin:['#ece8ac','#b8b474','#787c56','#3e4446'],
      rot:['#bcae7c','#887a58','#5a4c48','#342a34'],
      bruise:['#c4a0d8','#8a66a8','#5a4278','#32244a'],
      flesh:['#f6ae94','#d0645e','#8e3446','#521c34'],
      bone:['#fff4d8','#dccfa6','#a09070','#605040'],
      gas:['#fdffd8','#e6f47c','#9cbc3c','#3e5a2a'],
      film:['#f4f6d0','#c8d098','#8a9a6a','#4a5644'],
      tank:['#fbf8ee','#d8d2c0','#9c96a2','#5c5672'],
      trim:['#a4d8ff','#3e8ee0','#285aa2','#163268'],
      shorts:['#ffc07a','#f07a30','#ac4428','#5e2020'],
      flower:['#fffaf0','#ffc8d8','#d47898','#7a3a5a'],
      strap:['#ff9a8a','#e0443c','#9a2634','#521626'],
      sole:['#fffaea','#d8d0ba','#989078','#564e44'],
      lens:['#9ae0ff','#3a5c9e','#24305c','#121630'],
      frame:['#fff4a0','#f0c030','#a8782a','#5e3e1e'],
      hair:['#6a5e4e','#443a30','#2a2420','#161212'],
      eye:['#ffffe0','#f0e070','#b09030','#6a5018'],
      mouth:['#7c2e3e','#4c1828','#2e0c1a','#1a0610'],
      teeth:['#fbf0c0','#d8c27c','#9a8650','#5e4e30'],
      blood:['#c84a3e','#8e2a2c','#5e1824','#3a0e1a'],
      nail:['#8a7a62','#54463c','#342a28','#1c1618'],
      smoke:['#f4f4d8','#c4c8a4','#8a9078','#50564c'],
    };
    if(form==='enluarado'){
      m.skin=['#dcdcff','#9ea0e2','#666aac','#3c3a76']; m.rot=['#b8a6e0','#8470b0','#56468a','#33285e'];
      m.gas=['#effffe','#7af4ff','#2ab0d8','#146a96']; m.film=['#e4ecff','#a8b8ec','#6a78b4','#3a4278'];
      m.flesh=['#f0b0ff','#b866d8','#7a3a9e','#46206a']; m.blood=['#b46ad8','#7e3ea6','#542474','#34144a'];
      m.bruise=['#f0b0e0','#c070b0','#86408a','#4c2458']; m.eye=['#ffffff','#b8fbff','#4ad8f0','#1a8aa8'];
      m.shorts=['#a8f0d8','#46b8a0','#2a7a7a','#1a4450']; m.tank=['#e8ecff','#b8bedc','#7c80a8','#454872'];
      m.smoke=['#eaffff','#a8d8e8','#6a94b4','#3a5274'];
    }
    if(form==='plenilunar'){
      m.skin=['#ffcaa6','#e2806a','#a4424e','#5e1e36']; m.rot=['#d0806a','#9a4a4a','#682a3a','#3e1628'];
      m.gas=['#fff6c0','#ffb43a','#e0581e','#8a2414']; m.film=['#ffe4c4','#f0a888','#b0605a','#682a38'];
      m.flesh=['#ffc07a','#f06a3a','#a8302e','#5e1422']; m.blood=['#ff7a3a','#d43a26','#8a1c22','#4e0c18'];
      m.bruise=['#a85a6a','#7a3448','#521e34','#300e20']; m.eye=['#fffbe0','#ffe04a','#ff8a2a','#b83a14'];
      m.shorts=['#8ad0ff','#3a7ad8','#2a4c98','#182a5c']; m.tank=['#3e3a4c','#2a2634','#1a1622','#0e0a14'];
      m.smoke=['#fff0c8','#e8b088','#a46858','#5e3438'];
    }
    return punch(m);
  }
  const NAMES={skin:'Pele inchada',rot:'Podridão',bruise:'Hematoma',gas:'Gases',film:'Pele da barriga',tank:'Regata',trim:'Friso da regata',shorts:'Short de praia',flower:'Flores do short',strap:'Chinelo',sole:'Sola',lens:'Lente',frame:'Armação',eye:'Olho',blood:'Sangue',smoke:'Fumaça'};
  function sat(h,k){ const [r,g,b]=PIX.hexRgb(h), y=(r+g+b)/3; return PIX.toHex(y+(r-y)*k,y+(g-y)*k,y+(b-y)*k); }
  const NOPUNCH={gas:1,eye:1,smoke:1};
  function punch(m){ const o={}; for(const k in m){ const r=m[k]; o[k]=NOPUNCH[k]?[r[0],r[1],r[2],r[3]]:[sat(r[0],1.1),sat(r[1],1.16),PIX.mix(sat(r[2],1.12),'#2a1a4c',0.22),PIX.mix(r[3],'#140a24',0.36)]; } return o; }

  /* ---------- poses ---------- */
  // belly 0..1.5 (inchaço), glow 0..1 (gases acesos), crack 0..1 (rachaduras da explosão), thrust = barriga pra frente.
  const REST={hx:0,rot:0,lift:0,lean:-6,head:4,jaw:10,belly:0.12,glow:0.5,crack:0,thrust:0,sway:0,aFs:50,aFe:96,aBs:20,aBe:40,lFh:10,lFk:-4,lBh:-10,lBk:-14,fF:0,fB:0,flash:0,shiver:0,burp:0,boom:0,remains:0,smear:0};
  const S=Math.sin, C=Math.cos, PI=Math.PI, mx=Math.max;
  const ANIMS={
    idle:{nome:'Parado (barriga pulsando)',n:8,dur:()=>160,pose:i=>{ const p=i/8*PI*2, s=S(p);
      return {belly:0.12+0.07*(s+1)/2, glow:0.42+0.22*(S(p-0.6)+1)/2, lean:-6+1.4*s, head:4+3*S(p-0.8), jaw:9+5*mx(0,S(p-1.4)), aFs:50+3*S(p-0.5), aFe:96+5*S(p-0.9), aBs:20+3*S(p-0.3), aBe:40+4*S(p-0.8), hx:0.6*S(p)}; }},
    walk:{nome:'Andar (gingando)',n:8,dur:()=>140,pose:i=>{ const p=i/8*PI*2;
      const lFh=6+16*S(p), lBh=-6+16*S(p+PI);
      return {lFh, lFk:lFh-14*mx(0,C(p))-6, lBh, lBk:lBh-14*mx(0,C(p+PI))-6, fF:-10*mx(0,C(p)), fB:12*mx(0,C(p+PI)),
        sway:5*S(p), lean:-6+2*S(2*p), head:4-5*S(p), belly:0.12+0.06*Math.abs(S(2*p-0.6)), glow:0.5+0.12*S(2*p), lift:1.6*mx(0,S(2*p)),
        aFs:50+8*S(p), aFe:96+8*S(p-0.4), aBs:20-16*S(p), aBe:40-14*S(p-0.4), jaw:10, hx:1.2*S(p)}; }},
    attack:{nome:'Barrigada',n:8,hitAt:4,hit:4,reach:44,dur:i=>[180,160,150,70,130,140,150,140][i],pose:i=>[
      {lean:-12,head:10,jaw:8,belly:0.2,glow:0.35,aFs:0,aFe:10,aBs:-10,aBe:0,hx:-2,lFh:8,lBh:-14},
      {lean:-22,head:16,jaw:12,belly:0.32,glow:0.5,aFs:-30,aFe:-20,aBs:-40,aBe:-30,hx:-6,lFh:14,lFk:0,lBh:-16,lBk:-20},
      {lean:-26,head:18,jaw:10,belly:0.4,glow:0.6,aFs:-40,aFe:-30,aBs:-50,aBe:-40,hx:-7,lFh:16,lFk:2,lBh:-18,lBk:-22,shiver:1},
      {lean:8,head:-6,jaw:22,belly:0.36,glow:0.7,thrust:6,aFs:-50,aFe:-40,aBs:-60,aBe:-50,hx:6,lFh:28,lFk:4,lBh:-24,lBk:-34,fB:16,smear:1},
      {lean:14,head:-10,jaw:26,belly:0.42,glow:0.8,thrust:10,aFs:-56,aFe:-46,aBs:-64,aBe:-54,hx:10,lFh:30,lFk:6,lBh:-28,lBk:-38,fB:20},
      {lean:10,head:-6,jaw:20,belly:0.3,glow:0.5,thrust:6,aFs:-30,aFe:-20,aBs:-40,aBe:-30,hx:9,lFh:26,lFk:4,lBh:-24,lBk:-34,fB:16},
      {lean:0,head:0,jaw:10,belly:0.18,glow:0.35,aFs:6,aFe:20,aBs:-4,aBe:10,hx:4,lFh:16,lBh:-14},
      {lean:-6,head:4,jaw:5,belly:0.12,hx:1}][i]},
    burp:{nome:'Arrotar (nuvem de gás)',n:6,gasAt:3,dur:i=>[160,160,120,140,160,160][i],pose:i=>[
      {lean:-10,head:8,jaw:4,belly:0.24,glow:0.4,aFs:30,aFe:60,aBs:20,aBe:50},
      {lean:-16,head:14,jaw:2,belly:0.36,glow:0.6,aFs:36,aFe:76,aBs:26,aBe:66,shiver:1},
      {lean:-4,head:-2,jaw:16,belly:0.3,glow:0.7,aFs:30,aFe:60,aBs:20,aBe:50,burp:1},
      {lean:2,head:-14,jaw:30,belly:0.16,glow:0.6,aFs:24,aFe:50,aBs:14,aBe:40,burp:2},
      {lean:-2,head:-8,jaw:20,belly:0.12,glow:0.35,burp:3},
      {lean:-6,head:4,jaw:6,belly:0.12,glow:0.25}][i]},
    // ---- ataques extras ----
    stomp:{nome:'Pisão (esmagada no chão)',n:9,hit:5,reach:40,warn:[1,2,3,4],dur:i=>[160,170,180,160,60,180,150,140,140][i],pose:i=>[
      {lean:-8,head:6,jaw:8,belly:0.18,glow:0.4,aFs:40,aFe:80,aBs:14,aBe:30,hx:-1},
      {lean:-14,head:10,jaw:12,belly:0.26,glow:0.5,aFs:70,aFe:120,aBs:50,aBe:90,hx:-3,lFh:50,lFk:-20,lBh:-12,lBk:-16},
      {lean:-20,head:14,jaw:14,belly:0.34,glow:0.6,aFs:100,aFe:150,aBs:80,aBe:130,hx:-4,lift:4,lFh:76,lFk:-10,lBh:-10,lBk:-14,shiver:1},
      {lean:-22,head:16,jaw:10,belly:0.38,glow:0.7,aFs:110,aFe:160,aBs:90,aBe:140,hx:-4,lift:6,lFh:84,lFk:-6,lBh:-10,lBk:-14,shiver:1},
      {lean:6,head:-4,jaw:24,belly:0.3,glow:0.8,aFs:60,aFe:80,aBs:40,aBe:60,hx:4,lift:2,lFh:40,lFk:10,lBh:-14,lBk:-20,smear:1},
      {lean:16,head:-12,jaw:30,belly:0.5,glow:0.9,aFs:20,aFe:40,aBs:0,aBe:20,hx:6,lFh:30,lFk:20,lBh:-20,lBk:-30,fF:10,shiver:1},
      {lean:12,head:-8,jaw:20,belly:0.3,glow:0.6,aFs:30,aFe:60,aBs:10,aBe:30,hx:5,lFh:28,lFk:14,lBh:-18,lBk:-26},
      {lean:0,head:0,jaw:12,belly:0.18,glow:0.4,aFs:44,aFe:84,aBs:16,aBe:34,hx:2,lFh:16,lBh:-12},
      {lean:-6,head:4,jaw:8,belly:0.12,hx:1}][i]},
    vomit:{nome:'Vômito em cone',n:8,hit:4,reach:70,warn:[1,2,3],dur:i=>[160,170,170,90,200,180,150,150][i],pose:i=>[
      {lean:-8,head:8,jaw:6,belly:0.26,glow:0.45,aFs:40,aFe:70,aBs:24,aBe:50},
      {lean:-14,head:16,jaw:2,belly:0.42,glow:0.65,aFs:20,aFe:40,aBs:10,aBe:30,shiver:1},
      {lean:-18,head:20,jaw:0,belly:0.5,glow:0.8,aFs:10,aFe:20,aBs:0,aBe:10,hx:-3,shiver:1},
      {lean:20,head:-24,jaw:36,belly:0.36,glow:0.9,thrust:6,aFs:30,aFe:50,aBs:20,aBe:40,hx:6,lFh:24,lFk:4,lBh:-20,lBk:-30,burp:2},
      {lean:26,head:-30,jaw:40,belly:0.22,glow:0.8,thrust:8,aFs:30,aFe:50,aBs:20,aBe:40,hx:8,lFh:26,lFk:4,lBh:-22,lBk:-32,burp:3},
      {lean:20,head:-24,jaw:34,belly:0.16,glow:0.6,thrust:4,aFs:30,aFe:56,aBs:20,aBe:44,hx:6,lFh:22,lFk:2,lBh:-18,lBk:-28,burp:3},
      {lean:6,head:-8,jaw:18,belly:0.12,glow:0.4,aFs:40,aFe:80,aBs:20,aBe:40,hx:3},
      {lean:-6,head:4,jaw:8,belly:0.12,glow:0.3}][i]},
    hurt:{nome:'Dano (cabeça)',n:4,dur:i=>[80,110,130,150][i],pose:i=>[
      {lean:-20,head:-22,jaw:24,hx:-6,flash:1,belly:0.22,glow:0.6,aFs:-30,aFe:-14,aBs:-36,aBe:-20,lFh:12,lBh:-4},
      {lean:-16,head:-16,jaw:20,hx:-5,belly:0.2,glow:0.5,aFs:-20,aFe:0,aBs:-26,aBe:-8,lFh:10,lBh:-6},
      {lean:-10,head:-4,jaw:12,hx:-2,belly:0.15,glow:0.35,aFs:8,aFe:24,aBs:0,aBe:14},
      {lean:-7,head:2,jaw:6,belly:0.13}][i]},
    hurtB:{nome:'Dano (barriga)',n:4,dur:i=>[80,120,140,150][i],pose:i=>[
      {lean:16,head:20,jaw:28,hx:-6,flash:1,belly:0.02,glow:0.9,aFs:60,aFe:20,aBs:50,aBe:10,lFh:16,lFk:-10,lBh:-16,lBk:-30},
      {lean:12,head:16,jaw:24,hx:-5,belly:0.3,glow:0.8,aFs:50,aFe:30,aBs:40,aBe:20,lFh:14,lFk:-8,lBh:-14,lBk:-26},
      {lean:2,head:8,jaw:14,hx:-2,belly:0.18,glow:0.5,aFs:34,aFe:40,aBs:24,aBe:30},
      {lean:-5,head:4,jaw:7,hx:-1,belly:0.13}][i]},
    fall:{nome:'Derrubado',n:5,dur:i=>[90,110,120,150,260][i],pose:i=>[
      {lean:-22,head:-20,jaw:26,hx:-6,flash:1,belly:0.24,glow:0.7,aFs:-40,aFe:-20,aBs:-50,aBe:-30,lFh:18,lBh:0},
      {rot:-40,lean:-10,head:-14,jaw:24,hx:-4,belly:0.26,glow:0.6,aFs:-90,aFe:-80,aBs:-100,aBe:-90,lFh:40,lFk:30,lBh:24,lBk:14},
      {rot:-76,lean:-4,head:-8,jaw:22,hx:2,belly:0.22,glow:0.5,aFs:-130,aFe:-140,aBs:-30,aBe:-10,lFh:46,lFk:24,lBh:30,lBk:14},
      {rot:-92,lean:0,head:2,jaw:18,hx:6,belly:0.2,glow:0.4,aFs:-150,aFe:-170,aBs:-10,aBe:6,lFh:40,lFk:14,lBh:26,lBk:6},
      {rot:-90,lean:0,head:0,jaw:16,hx:6,belly:0.18,glow:0.35,aFs:-156,aFe:-176,aBs:-12,aBe:4,lFh:36,lFk:10,lBh:22,lBk:2}][i]},
    getup:{nome:'Levantar (rola e empurra)',n:6,dur:i=>[200,170,170,160,160,150][i],pose:i=>[
      {rot:-90,lean:0,head:0,jaw:16,hx:6,belly:0.18,glow:0.35,aFs:-156,aFe:-176,aBs:-12,aBe:4,lFh:36,lFk:10,lBh:22,lBk:2},
      {rot:-62,lean:6,head:-6,jaw:14,hx:0,belly:0.18,aFs:-40,aFe:-10,aBs:-50,aBe:-20,lFh:80,lFk:10,lBh:64,lBk:0},
      {rot:-34,lean:14,head:-10,jaw:12,hx:-4,belly:0.16,aFs:0,aFe:20,aBs:-10,aBe:0,lFh:96,lFk:0,lBh:50,lBk:-50},
      {rot:-8,lean:20,head:-8,jaw:12,hx:-4,belly:0.15,aFs:30,aFe:20,aBs:20,aBe:10,lFh:70,lFk:-6,lBh:6,lBk:-70,fB:50},
      {lean:6,head:0,jaw:8,hx:-1,belly:0.13,aFs:30,aFe:40,aBs:18,aBe:30,lFh:26,lFk:-10,lBh:-12,lBk:-30},
      {lean:-6,head:4,jaw:5,belly:0.12}][i]},
    explode:{nome:'Explodir (morte)',n:9,boomAt:6,dur:i=>[90,160,150,140,120,110,70,260,600][i],pose:i=>[
      {lean:-18,head:-18,jaw:24,hx:-5,flash:1,belly:0.3,glow:0.7,aFs:-30,aFe:-14,aBs:-36,aBe:-20,lFh:14,lBh:-6},
      {lean:-14,head:-24,jaw:16,hx:-3,belly:0.55,glow:0.8,crack:0.15,aFs:40,aFe:70,aBs:30,aBe:60,shiver:1},
      {lean:-12,head:-28,jaw:22,hx:-3,belly:0.8,glow:0.9,crack:0.35,aFs:56,aFe:84,aBs:46,aBe:74,shiver:1},
      {lean:-10,head:-32,jaw:30,hx:-2,belly:1.05,glow:1,crack:0.6,aFs:70,aFe:96,aBs:60,aBe:86,shiver:1,lift:2},
      {lean:-8,head:-36,jaw:36,hx:-2,belly:1.28,glow:1,crack:0.85,aFs:84,aFe:110,aBs:74,aBe:100,shiver:1,lift:4},
      {lean:-8,head:-40,jaw:40,hx:-2,belly:1.45,glow:1,crack:1,aFs:96,aFe:120,aBs:86,aBe:110,shiver:1,lift:5},
      {boom:1},
      {remains:1,boom:2},
      {remains:2,boom:3}][i]},
  };
  const EXK=['hx','lean','head','aFs','aFe','aBs','aBe','lFh','lFk','lBh','lBk'];
  function exag(P,f){ if(f===1||Math.abs(P.rot)>4) return P; EXK.forEach(k=>{ P[k]=REST[k]+(P[k]-REST[k])*f; }); P.jaw=Math.min(44,REST.jaw+(P.jaw-REST.jaw)*f); return P; }
  const EXF={idle:1.12,walk:1.15,attack:1.25,burp:1.15,stomp:1.15,vomit:1.15,hurt:1.3,hurtB:1.2,fall:1.05,getup:1.05,explode:1.1};
  ZREACT.add(ANIMS,REST,{moves:{bellyFlop:["flop","Barrigada voadora"]}}); // reações (voando, agarrado) + golpe extra — art-src/shared/zreact.js
  function poseOf(anim,i){ return exag(Object.assign({},REST,ANIMS[anim].pose(i)),EXF[anim]||1); }
  function heavyOutline(cv){ const g=cv.getContext('2d'), W=cv.width, H=cv.height, im=PIX.pix(cv), d=im.data;
    const isO=i=>d[i+3]===255&&d[i]===0x17&&d[i+1]===0x0b&&d[i+2]===0x1c, fill=i=>d[i+3]===255&&!isO(i);
    const add=[]; for(let y=2;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(d[i+3]) continue; const u=((y-1)*W+x)*4, u2=((y-2)*W+x)*4; if(isO(u)&&fill(u2)) add.push(i); }
    add.forEach(i=>{ d[i]=0x17; d[i+1]=0x0b; d[i+2]=0x1c; d[i+3]=255; }); g.putImageData(im,0,0); }

  /* ---------- esqueleto: quadril na origem, giro total + apoio no chão ---------- */
  const TH=18, SH=15, UA=15, FA=14, TW=1.42, BRX=26, BRY=23;
  function build(P,dy){
    const R=P.rot, ra=rad(R), rc=Math.cos(ra), rs=Math.sin(ra);
    const hip={x:AX+P.hx+(P.shiver?0.8:0), y:dy};
    const HR=(lx,ly)=>({x:hip.x+lx*rc-ly*rs, y:hip.y+lx*rs+ly*rc});
    const hipF=HR(7,0), hipB=HR(-8,-1);
    const kneeF=lp(hipF,P.lFh-R,TH), ankleF=lp(kneeF,P.lFk-R,SH), kneeB=lp(hipB,P.lBh-R,TH), ankleB=lp(kneeB,P.lBk-R,SH);
    const a=rad(R+P.lean+P.sway*0.5), c=Math.cos(a), s=Math.sin(a);
    const T=(lx,ly)=>{ lx*=TW; return {x:hip.x+lx*c-ly*s, y:hip.y+lx*s+ly*c}; };
    const bs=1+P.belly*0.3, bc=T(8+P.thrust,-20-P.belly*2);
    const shF=T(5,-38), shB=T(-7,-39), hpv=T(3,-40);
    const ha=a+rad(P.head), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:hpv.x+(lx*hc-ly*hs)*HS, y:hpv.y+(lx*hs+ly*hc)*HS});
    const elF=lp(shF,P.aFs-R,UA), wrF=lp(elF,P.aFe-R,FA), elB=lp(shB,P.aBs-R,UA), wrB=lp(elB,P.aBe-R,FA);
    const hand=(e,w)=>{ const L=Math.hypot(w.x-e.x,w.y-e.y)||1; return {x:w.x+(w.x-e.x)/L*6,y:w.y+(w.y-e.y)/L*6}; };
    const toe=(q,f)=>{ const t=rad(f+R); return {x:q.x+(11*Math.cos(t)-4*Math.sin(t))*1.3, y:q.y+(11*Math.sin(t)+4*Math.cos(t))*1.3}; };
    const hull=[[ankleF,8.6],[ankleB,8.6],[toe(ankleF,P.fF),0.5],[toe(ankleB,P.fB),0.5],[kneeF,8],[kneeB,8],[hip,12],[bc,BRY*bs],[T(-6,-28),17],[T(-22,-20),4],[T(-21,-32),4],[H(3,-10),12],[H(4,-1),9],[hand(elF,wrF),6],[hand(elB,wrB),6]];
    return {R,ra,a,hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,T,bs,bc,shF,shB,hpv,ha,H,elF,wrF,elB,wrB,hull};
  }
  function skeleton(P){
    const b=build(P,0); let m=-1e9; b.hull.forEach(([p,r])=>{ m=Math.max(m,p.y+r); });
    return build(P,GROUND-m-(P.lift||0));
  }

  /* ---------- utilitários ---------- */
  const LV={x:0.55,y:-0.83};
  function sideN(a,b){ const dx=b.x-a.x, dy=b.y-a.y, L=Math.hypot(dx,dy)||1; let nx=-dy/L, ny=dx/L; if(nx*LV.x+ny*LV.y>0){ nx=-nx; ny=-ny; } return {nx,ny,L}; }
  function limb(p,R,a,b,wa,wb,o){ o=o||{};
    p.F(R[1]); p.cap(a,b,wa,wb);
    const {nx,ny}=sideN(a,b), sh=o.sh!=null?o.sh:0.62;
    const ka=wa*(0.5-sh/2), kb=wb*(0.5-sh/2);
    p.F(R[2]); p.cap({x:a.x+nx*ka,y:a.y+ny*ka},{x:b.x+nx*kb,y:b.y+ny*kb},wa*sh,wb*sh);
    const k2a=wa*0.33, k2b=wb*0.33; p.F(R[3]); p.cap({x:a.x+nx*k2a,y:a.y+ny*k2a},{x:b.x+nx*k2b,y:b.y+ny*k2b},wa*0.3,wb*0.3);
    if(o.hi!==false){ const e=lerp(a,b,o.hl!=null?o.hl:0.7), ha=wa*0.22, hb=wb*0.22; p.F(R[0]); p.cap({x:a.x-nx*ha,y:a.y-ny*ha},{x:e.x-nx*hb,y:e.y-ny*hb},wa*0.18,wb*0.16); }
    return {nx,ny};
  }
  function clip(c,pts,fn){ c.save(); c.beginPath(); pts.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])); c.closePath(); c.clip(); fn(); c.restore(); }
  function clipE(c,x,y,rx,ry,fn){ c.save(); c.beginPath(); c.ellipse(x,y,rx,ry,0,0,PI*2); c.clip(); fn(); c.restore(); }
  const W=(sk,list)=>list.map(([u,v])=>{ const q=sk.T(u,v); return [q.x,q.y]; });
  const Wp=(sk,u,v)=>sk.T(u,v);

  /* ---------- braço: grosso e curto, mão gorda ---------- */
  function drawArm(c,u,M,sk,P,front){
    const p=mkPen(c,u), sh=front?sk.shF:sk.shB, el=front?sk.elF:sk.elB, wr=front?sk.wrF:sk.wrB; p.id();
    const n=limb(p,M.skin,el,wr,16,14,{});
    limb(p,M.skin,sh,el,20,17,{hl:0.5});
    // papada do braço e hematoma
    const bz=lerp(sh,el,0.55); p.F(M.skin[2]); p.ell(bz.x+n.nx*3,bz.y+n.ny*3,4.4,3,Math.atan2(el.y-sh.y,el.x-sh.x));
    p.F(M.bruise[1]); const b=lerp(el,wr,0.45); p.ell(b.x-n.nx*1.6,b.y-n.ny*1.6,2.4,1.6); p.F(M.bruise[2]); p.rect(b.x-n.nx*1.6-0.5,b.y-n.ny*1.6,1,1);
    p.F(M.skin[0]); p.circle({x:el.x-n.nx*2.6,y:el.y-n.ny*2.6},1.2);
    if(front){ p.F(M.rot[1]); const r=lerp(sh,el,0.3); p.ell(r.x-n.nx*2,r.y-n.ny*2,2,1.4); p.F(M.flesh[2]); const f=lerp(el,wr,0.75); p.ell(f.x+n.nx*2,f.y+n.ny*2,1.8,1.3); p.F(M.flesh[1]); p.rect(f.x+n.nx*2-0.5,f.y+n.ny*2-0.5,1,1); }
    // cava da regata no ombro
    p.F(M.tank[1]); p.cap({x:sh.x-3,y:sh.y-4.6},{x:sh.x+3.4,y:sh.y-4},4,3.4); p.F(M.trim[1]); p.cap({x:sh.x-3,y:sh.y-2.6},{x:sh.x+3.4,y:sh.y-2},1.2,1.2);
    // mão gorda
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y); c.scale(1.7,1.7);
    p.F(M.skin[1]); p.ell(2.6,0,4.2,4);
    p.F(M.skin[2]); p.ell(2.6,1.6,3.8,2.2);
    p.F(M.skin[0]); p.ell(1.6,-2,2,1);
    for(let k=0;k<4;k++){ const y0=-2.6+k*1.8, t=P2(8-(k===3?1:0),y0+0.8);
      p.F(M.skin[1]); p.cap(P2(5.4,y0),t,2.1,1.9); p.F(M.skin[2]); p.rect(5.6,y0+0.4,2,0.6); p.F(M.nail[1]); p.ell(t.x+0.3,t.y,0.8,0.7); }
    p.F(M.skin[1]); p.cap(P2(2,-3),P2(4.8,-5.4),2.2,1.8); p.F(M.nail[1]); p.ell(5.2,-5.6,0.8,0.7);
    p.id();
  }

  /* ---------- perna: coxa grossa no short florido, canela inchada, chinelo ---------- */
  function shortsLeg(p,M,hip,kb,front){
    limb(p,M.shorts,hip,kb,25,22,{hl:0.55});
    const kn=sideN(hip,kb), dir={x:(kb.x-hip.x)/kn.L,y:(kb.y-hip.y)/kn.L};
    const at=(t,o)=>{ const q=lerp(hip,kb,t); return {x:q.x-kn.nx*o,y:q.y-kn.ny*o}; };
    // flores de hibisco
    [[0.25,4.4],[0.62,-4],[0.8,6],[0.42,-8],[0.15,-2]].forEach(([t,o],k)=>{ const q=at(t,o), tn=(o<0)?2:1;
      p.F(M.flower[tn]); [0,1,2,3,4].forEach(j=>{ const a=j/5*PI*2+k; p.circle({x:q.x+Math.cos(a)*1.3,y:q.y+Math.sin(a)*1.3},1.1); });
      p.F(M.frame[1]); p.rect(q.x-0.5,q.y-0.5,1,1); });
    p.F(M.shorts[3]); p.cap({x:kb.x-kn.nx*10,y:kb.y-kn.ny*10},{x:kb.x+kn.nx*10,y:kb.y+kn.ny*10},1.3,1.3);
    p.F(M.shorts[2]); const f=at(0.55,-1); p.cap(f,{x:f.x+dir.x*4+kn.nx*2,y:f.y+dir.y*4+kn.ny*2},0.9,0.8);
    p.F(M.shorts[0]); const g=at(0.3,5); p.cap(g,{x:g.x+dir.x*3,y:g.y+dir.y*3},0.9,0.8);
  }
  function drawLeg(c,u,M,sk,P,front){
    const p=mkPen(c,u), hip=front?sk.hipF:sk.hipB, knee=front?sk.kneeF:sk.kneeB, ank=front?sk.ankleF:sk.ankleB; p.id();
    const n=limb(p,M.skin,knee,ank,16,12,{hl:0.5});
    const cf=lerp(knee,ank,0.3); p.F(M.skin[1]); p.ell(cf.x+n.nx*1.6,cf.y+n.ny*1.6,7.6,5.6,Math.atan2(ank.y-knee.y,ank.x-knee.x)); p.F(M.skin[2]); p.ell(cf.x+n.nx*2.8,cf.y+n.ny*2.8,5,4,Math.atan2(ank.y-knee.y,ank.x-knee.x));
    // varizes e manchas
    p.F(M.bruise[2]); const v=lerp(knee,ank,0.5); p.cap({x:v.x-n.nx*2,y:v.y-2},{x:v.x-n.nx*1,y:v.y+2},0.8,0.7); p.cap({x:v.x-n.nx*1,y:v.y+2},{x:v.x-n.nx*2.4,y:v.y+4.6},0.7,0.6);
    p.F(M.rot[1]); const r=lerp(knee,ank,0.7); p.ell(r.x+n.nx*0.6,r.y,1.6,2);
    if(!P.remains||true) shortsLeg(p,M,hip,lerp(hip,knee,1.0),front);
    // pé inchado + chinelo
    const fa=rad((front?P.fF:P.fB)+sk.R); p.xf(fa,ank.x,ank.y); c.scale(1.5,1.5);
    p.F(M.sole[1]); p.poly([[-5,3],[11.2,3],[11.8,5],[-5.4,5]]); p.F(M.sole[3]); p.rect(-5.4,4.4,17.2,0.8); p.F(M.sole[0]); p.rect(-4.4,3,13,0.7);
    p.F(M.skin[1]); p.poly([[-4,-2.4],[2.6,-2.6],[7,0],[10.6,1.4],[11,3.2],[-4.6,3.2]]);
    p.F(M.skin[2]); p.poly([[-4.6,1.2],[3,1.6],[11,2.2],[11,3.2],[-4.6,3.2]]); p.F(M.skin[0]); p.rect(0,-1.8,3.4,0.9);
    p.F(M.nail[1]); [[7.8,1.6],[9.2,1.9],[10.4,2.2]].forEach(([x,y])=>p.rect(x,y,0.9,0.7));
    p.F(M.strap[1]); p.poly([[4.6,1.6],[5.8,2.2],[1,-0.6],[-2.6,3],[-3.6,2.6],[0.6,-1.6]]); p.F(M.strap[0]); p.rect(-0.2,-1.2,2.2,0.7);
    p.id();
  }

  /* ---------- tronco (costas, regata enrolada, cós) ---------- */
  function drawTorso(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.id();
    // cós do short (atrás da barriga)
    p.F(M.shorts[1]); p.poly(W(sk,[[-15,-6],[12,-6],[13,6],[-14,6]]));
    p.F(M.shorts[2]); p.poly(W(sk,[[-15,0],[13,0],[13,6],[-14,6]])); p.F(M.shorts[3]); p.poly(W(sk,[[-15,-6],[12,-6],[12,-4.8],[-15,-4.8]]));
    p.F(M.sole[1]); p.poly(W(sk,[[-2,-4.6],[-1,-4.6],[0,2],[-1,2.4]])); p.poly(W(sk,[[0.4,-4.6],[1.2,-4.6],[2.6,1.4],[1.8,1.8]]));
    // corpo: costas largas e corcunda de gordura
    const body=W(sk,[[-14,2],[-17.4,-8],[-19,-20],[-18,-31],[-14,-39],[-6,-44.4],[3,-44.6],[9,-41],[12,-34],[14,-24],[12,-8],[6,0]]);
    p.F(M.skin[1]); p.poly(body);
    clip(c,body,()=>{ p.F(M.skin[2]); p.poly(W(sk,[[-24,6],[-24,-50],[-10,-50],[-13,-38],[-12,-26],[-8,-14],[-2,-6],[10,6]]));
      p.F(M.skin[3]); p.poly(W(sk,[[-24,6],[-24,-50],[-15,-50],[-17,-36],[-16,-22],[-12,-10],[-8,6]])); });
    // dobras de gordura nas costas
    p.F(M.skin[3]); p.poly(W(sk,[[-18.6,-14],[-12,-12.6],[-12,-11.6],[-18.4,-12.8]])); p.poly(W(sk,[[-18.8,-21],[-13,-20],[-13,-19],[-18.8,-20]]));
    p.F(M.skin[1]); p.poly(W(sk,[[-18.4,-12.6],[-12,-11.4],[-12.4,-10.4],[-18,-11.6]]));
    // regata enrolada no peito (rolo de pano) + alças
    const tank=W(sk,[[-18.4,-26],[-18,-32],[-14,-39.6],[-6,-44.8],[-1,-45],[-0.6,-41],[3,-38],[8,-39],[12,-33.6],[13,-29],[6,-27],[-4,-25.4],[-12,-24]]);
    p.F(M.tank[1]); p.poly(tank);
    clip(c,tank,()=>{ p.F(M.tank[2]); p.poly(W(sk,[[-24,-20],[-24,-50],[-10,-50],[-12,-36],[-8,-28],[4,-30],[14,-30],[14,-20]]));
      p.F(M.tank[3]); p.poly(W(sk,[[-24,-20],[-24,-50],[-15,-50],[-17,-34],[-14,-26],[14,-27.4],[14,-20]]));
      p.F(M.tank[0]); p.poly(W(sk,[[-6,-46],[0,-46],[-1,-41],[-6,-42.4]])); });
    // rolo enrolado
    p.F(M.tank[2]); p.poly(W(sk,[[-18.6,-27.4],[-12,-25.6],[-4,-27],[6,-28.4],[13.2,-30.4],[13.6,-28],[6,-25.6],[-4,-24],[-12,-22.6],[-18.4,-24]]));
    p.F(M.tank[0]); p.poly(W(sk,[[-17,-27],[-12,-25.4],[-4,-26.6],[6,-28],[12,-30],[12.4,-29.2],[6,-27.2],[-4,-25.8],[-12,-24.6],[-17,-26]]));
    p.F(M.tank[3]); [-14,-8,-2,5,10].forEach(x=>{ const q=Wp(sk,x,-25.6+(x>0?-1.4:0)); p.rect(q.x-0.4,q.y-0.4,0.9,1.6); });
    p.F(M.trim[1]); p.poly(W(sk,[[-1.2,-45],[0,-45],[0.4,-41],[3,-38.2],[2.6,-37.2],[-0.8,-40.6]])); p.poly(W(sk,[[-18.2,-30],[-17.6,-32],[-15,-26],[-16,-25]]));
    // logo desbotado (coqueiro) nas costas
    p.F(M.trim[2]); const lg=Wp(sk,-10,-35); p.rect(lg.x-0.5,lg.y-1,1,4); p.poly([[lg.x,lg.y-1],[lg.x-3,lg.y-2.4],[lg.x-2.6,lg.y-1]]); p.poly([[lg.x,lg.y-1],[lg.x+3,lg.y-2.6],[lg.x+2.6,lg.y-0.8]]);
    // nuca e pescoço gordo
    p.F(M.skin[2]); p.poly(W(sk,[[-6,-44.6],[3,-44.8],[2,-42],[-5,-42.4]]));
    if(form==='plenilunar'){ p.F(M.bone[1]); [[-17,-30,-23,-33],[-18.6,-20,-24.6,-20],[-17,-10,-22,-7]].forEach(([u0,v0,u1,v1])=>{ const a=Wp(sk,u0,v0+1.8), b=Wp(sk,u1,v1), d=Wp(sk,u0+0.6,v0-1.8); p.poly([[a.x,a.y],[b.x,b.y],[d.x,d.y]]); }); }
    if(form!=='comum'){ p.F(M.gas[1]); [[[-16,-20],[-12,-16],[-12.6,-15.4],[-16.4,-19.4]],[[-14,-10],[-10,-6],[-10.6,-5.4],[-14.4,-9.4]]].forEach(f=>p.poly(W(sk,f))); }
  }

  /* ---------- barriga translúcida (brilho próprio, sem sombreamento automático) ---------- */
  function drawBelly(c,u,M,sk,P,fi){
    const p=mkPen(c,u); p.id();
    const bs=sk.bs, cx=sk.bc.x+(P.shiver?((fi%2)?0.7:-0.7):0), cy=sk.bc.y, rx=BRX*bs, ry=BRY*bs, g=P.glow, a=sk.a;
    // membrana: aro de pele grossa
    p.F(M.skin[3]); p.ell(cx,cy,rx,ry,a);
    p.F(M.film[2]); p.ell(cx,cy,rx-1,ry-1,a);
    clipE(c,cx,cy,rx-1.2,ry-1.2,()=>{
      // interior translúcido com gás aceso
      p.F(M.film[1]); p.ell(cx+1,cy+1,rx-2.6,ry-2.6);
      // nuvens de gás que brilham através da pele
      p.F(M.gas[3]); p.ell(cx+1.4,cy+1,rx*(0.66+g*0.22),ry*(0.6+g*0.24)); p.ell(cx-rx*0.3,cy+ry*0.3,rx*0.34,ry*0.3);
      p.F(M.gas[2]); p.ell(cx+1.8,cy+0.6,rx*(0.46+g*0.24),ry*(0.42+g*0.24)); p.ell(cx-rx*0.28,cy+ry*0.34,rx*0.2,ry*0.16);
      p.F(M.gas[1]); p.ell(cx+2.4,cy,rx*(0.22+g*0.22),ry*(0.2+g*0.2));
      if(g>0.5){ p.F(M.gas[0]); p.ell(cx+2.8,cy-0.6,rx*(0.06+g*0.1),ry*(0.06+g*0.08)); }
      // bolhas de gás subindo
      const t=(fi*1.7)%6;
      [[-0.5,0.4,2.2],[0.3,0.55,1.6],[0.45,0.1,1.4],[-0.2,-0.1,1.2],[-0.6,-0.2,1],[0.1,0.7,1.1]].forEach(([bx,by,r],k)=>{ const yy=cy+ry*by-((t+k*1.3)%6)*1.4;
        p.F(M.gas[k%2?1:0]); p.circle({x:cx+rx*bx,y:yy},r*(0.8+g*0.4)); p.F(M.gas[2]); p.rect(cx+rx*bx+r*0.3,yy+r*0.2,0.8,0.8); });
      // película de pele por cima (mais opaca em cima, sombra embaixo)
      p.F(M.film[1]); p.poly([[cx-rx,cy-ry*0.3],[cx-rx*0.6,cy-ry*1.1],[cx+rx*0.3,cy-ry*1.1],[cx+rx*0.9,cy-ry*0.6],[cx+rx*0.4,cy-ry*0.56],[cx-rx*0.3,cy-ry*0.5],[cx-rx*0.7,cy-ry*0.2]]);
      p.F(M.film[0]); p.poly([[cx-rx*0.1,cy-ry*1],[cx+rx*0.5,cy-ry*0.9],[cx+rx*0.7,cy-ry*0.66],[cx+rx*0.2,cy-ry*0.72]]);
      p.F(M.film[3]); p.poly([[cx-rx,cy+ry*0.4],[cx-rx*0.4,cy+ry*0.82],[cx+rx*0.5,cy+ry*0.84],[cx+rx,cy+ry*0.5],[cx+rx,cy+ry*1.1],[cx-rx,cy+ry*1.1]]);
      p.F(M.film[2]); p.poly([[cx-rx,cy+ry*0.1],[cx-rx*0.6,cy+ry*0.5],[cx-rx*0.4,cy+ry*0.82],[cx-rx,cy+ry*0.6]]);
      p.poly([[cx-rx,cy-ry*0.3],[cx-rx*0.7,cy-ry*0.2],[cx-rx*0.62,cy+ry*0.3],[cx-rx,cy+ry*0.2]]);
      // veias por cima
      p.F(M.film[3]);
      const ln=(x0,y0,x1,y1,w)=>p.cap({x:cx+rx*x0,y:cy+ry*y0},{x:cx+rx*x1,y:cy+ry*y1},w,w*0.8);
      ln(-0.7,-0.5,-0.35,0,0.9); ln(-0.35,0,-0.45,0.5,0.8); ln(-0.35,0,0.05,0.25,0.7); ln(0.4,-0.6,0.62,-0.1,0.9); ln(0.62,-0.1,0.5,0.4,0.7); ln(0.62,-0.1,0.86,0.1,0.6);
      // estrias claras
      p.F(M.film[0]); [[0.72,0.2],[0.78,0.32],[0.66,0.44]].forEach(([x,y])=>p.cap({x:cx+rx*x,y:cy+ry*y},{x:cx+rx*(x+0.1),y:cy+ry*(y+0.06)},0.7,0.6));
      // umbigo saltado
      const nx=cx+rx*0.78, ny=cy+ry*0.3; p.F(M.film[3]); p.ell(nx,ny,1.8,2.2); p.F(M.film[1]); p.ell(nx+0.6,ny-0.4,1,1.2);
      // rachaduras da explosão (luz vazando)
      if(P.crack>0){ const nC=Math.round(3+P.crack*6); for(let k=0;k<nC;k++){ const an=k/nC*PI*2+0.4, L=(0.4+P.crack*0.55)*(k%2?0.8:1);
        const x1=cx+Math.cos(an)*rx*0.25, y1=cy+Math.sin(an)*ry*0.25, x2=cx+Math.cos(an+0.15)*rx*L, y2=cy+Math.sin(an+0.15)*ry*L, x3=cx+Math.cos(an-0.1)*rx*Math.min(1,L+0.2), y3=cy+Math.sin(an-0.1)*ry*Math.min(1,L+0.2);
        p.F(M.gas[1]); p.cap({x:x1,y:y1},{x:x2,y:y2},1.6,1.2); p.cap({x:x2,y:y2},{x:x3,y:y3},1.2,0.8); p.F(M.gas[0]); p.cap({x:x1,y:y1},{x:x2,y:y2},0.7,0.6); } }
    });
    // brilho molhado na borda
    p.F(M.film[0]); p.ell(cx+rx*0.56,cy-ry*0.5,1.6,1,a+0.7); p.rect(cx+rx*0.78,cy-ry*0.26,1,1.6);
  }

  /* ---------- cabeça pequena afundada nos ombros, papada, óculos na testa ---------- */
  function drawHead(c,u,M,sk,P,form){
    const p=mkPen(c,u); p.xf(sk.ha,sk.hpv.x,sk.hpv.y); c.scale(HS,HS);
    // papada / pescoço gordo
    p.F(M.skin[1]); p.ell(1,-1,10,5.4);
    p.F(M.skin[2]); p.ell(1,1,9,3.8); p.F(M.skin[3]); p.poly([[-8,0],[-2,3.6],[6,3.4],[9,1],[9,2.6],[4,5],[-3,5],[-8.6,1.6]]);
    // crânio
    p.F(M.skin[1]); p.ell(2,-10,8.4,8.2); p.poly([[-4,-6],[10.6,-7.4],[11.6,-3.6],[4,-1],[-3,-2]]);
    p.F(M.skin[2]); p.poly([[-6.4,-13],[-5,-6],[-1,-2.4],[4,-1.6],[0,-4.4],[-2.6,-8],[-3.4,-13]]);
    p.F(M.skin[3]); p.poly([[-6.4,-12],[-6,-7],[-3.6,-3.4],[-4.4,-8]]);
    p.F(M.skin[0]); p.ell(4,-16,4,1.6,-0.2);
    // orelha
    p.F(M.skin[1]); p.ell(-2.8,-9,2,2.8); p.F(M.skin[3]); p.ell(-2.6,-8.8,0.9,1.6);
    // cabelinho ralo grudado
    p.F(M.hair[1]); p.poly([[-7,-12],[-4,-16.6],[-2.6,-15.6],[-5,-11],[-6,-8]]); p.poly([[-1,-17.4],[2,-18.2],[0,-16.6]]);
    // bochechas inchadas, olhos espremidos
    p.F(M.skin[0]); p.ell(8,-5.4,2.6,1.6);
    p.F(M.skin[3]); p.ell(7.4,-9.8,2.8,1.8);
    p.F(M.eye[2]); p.ell(7.6,-9.8,1.9,1.2); p.F(M.eye[1]); p.ell(7.8,-9.9,1.2,0.8); p.F(M.eye[0]); p.rect(7.6,-10.4,0.8,0.7);
    p.F(M.skin[1]); p.poly([[4,-13.4],[11,-12.4],[10.6,-11],[4.4,-11.6]]); p.F(M.skin[3]); p.poly([[4.4,-11.6],[10.6,-11],[10.2,-10.4],[5,-10.8]]);
    p.F(M.skin[3]); p.rect(10.4,-10.4,1.2,0.9); p.F(M.eye[1]); p.rect(10.6,-10.2,0.7,0.6);
    p.F(M.skin[2]); p.poly([[4.6,-8.4],[10,-8],[9,-7],[5,-7.4]]);
    // nariz de batata queimado de sol
    p.F(M.flesh[1]); p.ell(11.4,-7,2,1.8); p.F(M.flesh[0]); p.rect(11,-8,1,0.8); p.F(M.skin[3]); p.rect(11.4,-5.6,1,0.6);
    // óculos escuros na testa
    p.F(M.frame[2]); p.poly([[-1,-15.6],[10,-15],[10,-13.8],[-1,-14.6]]);
    p.F(M.lens[2]); p.ell(5,-15.4,2.6,1.8); p.ell(9.6,-15,1.6,1.6);
    p.F(M.lens[1]); p.rect(4,-16.6,1.4,0.8); p.F(M.lens[0]); p.rect(9.2,-16,0.8,0.7);
    p.F(M.frame[1]); p.rect(7.4,-15.6,1.2,0.7); p.rect(-1,-15.6,5,0.7);
    // podridão e hematoma
    p.F(M.bruise[1]); p.ell(-1,-6,1.8,1.2); p.F(M.rot[1]); p.ell(0,-12,1.6,1.2); p.F(M.rot[2]); p.rect(-0.4,-12.4,1,1);
    // lábio de cima
    p.F(M.mouth[1]); p.poly([[5,-4.2],[11.6,-4.4],[11.8,-2.6],[5.4,-2.4]]); p.F(M.teeth[1]); p.rect(7,-4.4,1.2,1.2); p.rect(9,-4.4,1.2,1.4);
    if(form!=='comum'){ p.F(M.gas[0]); p.rect(6.4,-10.6,2.6,1.2); p.F(M.gas[1]); p.rect(10.4,-10.4,1,0.9); }
    p.id();
  }
  function drawJaw(c,u,M,sk,P){
    const p=mkPen(c,u), h=sk.H(3.6,-3.4); p.xf(sk.ha+rad(P.jaw),h.x,h.y); c.scale(HS,HS);
    p.F(M.mouth[2]); p.poly([[1,-0.8],[8,-0.8],[7.6,1.4],[1.4,1.2]]);
    p.F(M.skin[1]); p.poly([[-1,0.8],[8.6,0.6],[9,2.6],[6,4.4],[0,4],[-1.6,2.4]]);
    p.F(M.skin[2]); p.poly([[-1.6,2.4],[0,4],[6,4.4],[9,2.6],[7,2.6],[1,2.6]]);
    p.F(M.teeth[1]); p.rect(3,-0.2,1.2,1.2); p.rect(5.4,-0.2,1.2,1);
    p.F(M.gas[1]); if(P.jaw>14){ p.rect(8,2.6,1,2); p.circle(P2(8.5,5),0.9); }
    p.id();
  }
  /* nuvem do arroto */
  function drawBurp(c,u,M,sk,P){
    const p=mkPen(c,u); p.id(); const m=sk.H(13,-2), b=P.burp;
    [[4,0,3],[9,-3,4],[15,-1,5],[20,-5,4.4],[12,4,3.4]].slice(0,b+2).forEach(([x,y,r],k)=>{ const q={x:m.x+x*(0.6+b*0.25),y:m.y+y-b*2}; if(q.x+r>FW-3) return;
      p.F(M.gas[3]); p.circle(q,r+1); p.F(M.gas[2]); p.circle(q,r); p.F(M.gas[1]); p.circle({x:q.x-r*0.25,y:q.y-r*0.25},r*0.6); p.F(M.gas[0]); p.rect(q.x-r*0.4,q.y-r*0.5,1,1); });
  }
  /* smear da barrigada */
  function drawSmear(c,u,M,sk){
    const p=mkPen(c,u); p.id(); const cx=sk.bc.x, cy=sk.bc.y, rx=BRX*sk.bs;
    for(let k=0;k<3;k++){ p.F(M.film[k===0?0:1]); p.poly([[cx-rx-6-k*5,cy-8+k*6],[cx-6,cy-5+k*5],[cx-6,cy-3+k*5],[cx-rx-2-k*5,cy-6.6+k*6]]); }
  }

  /* ---------- explosão e restos ---------- */
  function drawBoom(c,u,M,sk,P){
    const p=mkPen(c,u); p.id(); const cx=AX+10, cy=GROUND-50;
    if(P.boom===1){
      // onda de choque no chão + estrela de luz + nuvem
      p.F(M.gas[3]); p.ell(cx,GROUND-3,74,7); p.F(M.gas[2]); p.ell(cx,GROUND-3,66,4.6); p.F(M.gas[3]); p.ell(cx,GROUND-3,56,3);
      p.F(M.gas[2]); for(let k=0;k<12;k++){ const a=k/12*PI*2+0.2, L=(k%2?50:68); p.poly([[cx+Math.cos(a-0.2)*16,cy+Math.sin(a-0.2)*16],[cx+Math.cos(a)*L,Math.min(GROUND-2,cy+Math.sin(a)*L)],[cx+Math.cos(a+0.2)*16,cy+Math.sin(a+0.2)*16]]); }
      p.F(M.gas[3]); p.circle({x:cx,y:cy},40); p.F(M.gas[1]); p.circle({x:cx,y:cy},34); p.F(M.gas[0]); p.circle({x:cx,y:cy},22);
      p.F(M.smoke[1]); [[-32,-22,11],[30,-26,10],[38,12,10],[-38,14,10],[0,-40,11]].forEach(([x,y,r])=>p.circle({x:cx+x,y:cy+y},r));
      p.F(M.smoke[0]); [[-30,-24,6],[28,-28,5.4],[0,-42,6]].forEach(([x,y,r])=>p.circle({x:cx+x,y:cy+y},r));
      // pedaços voando
      [[-56,-36],[58,-30],[52,26],[-50,28],[12,-58],[-16,-56]].forEach(([x,y],k)=>{ const q={x:cx+x,y:cy+y}; p.F(k%2?M.flesh[1]:M.skin[1]); p.ell(q.x,q.y,2.6,1.8,k); p.F(k%2?M.flesh[2]:M.blood[1]); p.rect(q.x,q.y,1.2,1.2); });
      return; }
    // fumaça subindo dos restos
    const k=P.boom-1;
    p.F(M.smoke[2]); [[-6,-30,7],[6,-40,6],[-2,-52,5]].forEach(([x,y,r],j)=>{ if(j<4-k) p.circle({x:cx+x,y:cy+y-k*6},r-k*0.6); });
    p.F(M.smoke[1]); [[-7,-32,4],[5,-42,3.4],[-3,-54,3]].forEach(([x,y,r],j)=>{ if(j<4-k) p.circle({x:cx+x,y:cy+y-k*6},r-k*0.4); });
    p.F(M.gas[1]); [[-14,-18],[16,-24],[4,-60]].forEach(([x,y])=>p.rect(cx+x,cy+y-k*4,1.2,1.2));
  }
  function drawRemains(c,u,M,sk,P){
    // poça de gosma e sangue + pedaços no chão
    const p=mkPen(c,u); p.id(); const cx=AX+4, w=P.remains===1?0.7:1;
    p.F(M.blood[3]); p.ell(cx,GROUND-1,30*w+6,3.2); p.F(M.blood[2]); p.ell(cx+2,GROUND-1.4,24*w+4,2.4); p.F(M.gas[2]); p.ell(cx-6,GROUND-1.6,10*w,1.4); p.F(M.blood[1]); p.ell(cx+8,GROUND-1.8,6,1);
    [[-26,0],[22,-1],[34,0],[-14,-1]].forEach(([x,y],k)=>{ p.F(k%2?M.flesh[1]:M.shorts[1]); p.ell(cx+x,GROUND-2.4+y,2.4,1.6); p.F(k%2?M.flesh[2]:M.flower[1]); p.rect(cx+x,GROUND-3+y,1,1); });
    // chinelo sozinho
    p.F(M.sole[1]); p.poly([[cx+12,GROUND-3],[cx+26,GROUND-3],[cx+26.6,GROUND-0.6],[cx+11.6,GROUND-0.6]]); p.F(M.strap[1]); p.poly([[cx+17,GROUND-3],[cx+20,GROUND-6],[cx+21,GROUND-5.4],[cx+19,GROUND-3]]);
  }
  function drawStumps(c,u,M,sk,P,front){
    // sobra as pernas em pé (frame 7) com o short rasgado
    const p=mkPen(c,u); p.id(); drawLeg(c,u,M,sk,P,front); p.id();
    const hip=front?sk.hipF:sk.hipB; p.F(M.flesh[2]); p.ell(hip.x,hip.y-2,8,3.4); p.F(M.flesh[1]); p.ell(hip.x+1,hip.y-2.6,5,2); p.F(M.bone[1]); p.ell(hip.x,hip.y-3,1.6,1.2);
    p.F(M.shorts[2]); [[-7,0],[-3,1],[2,0],[6,1]].forEach(([x,y])=>p.poly([[hip.x+x-1.6,hip.y+y-1],[hip.x+x+1.6,hip.y+y-1],[hip.x+x,hip.y+y+2.6]]));
  }

  /* ---------- montagem ---------- */
  const cache=PIX.cache();
  function frame(form,anim,fi,step=5,Pov,pk){
    const K=PIX.getK(), key=(pk!=null?'#'+pk+'|'+form:form+'|'+anim+'|'+fi+'|'+step)+'@'+K;
    const hit=cache.get(key); if(hit){ cache.delete(key); cache.set(key,hit); return hit; }
    const P=Pov?Object.assign({},REST,Pov):poseOf(anim,fi), M=mats(form), f=fi|0;
    let sk=skeleton(P), parts;
    if(P.boom){
      const Q=Object.assign({},REST,{belly:0}); sk=skeleton(Q);
      parts=[];
      if(P.remains) parts.push({draw:(c,u)=>drawRemains(c,u,M,sk,P)});
      if(P.remains===1){ parts.push({back:true, draw:(c,u)=>drawStumps(c,u,M,sk,Q,false)}); parts.push({draw:(c,u)=>drawStumps(c,u,M,sk,Q,true)}); }
      parts.push({noShade:true, noRim:true, smear:true, draw:(c,u)=>drawBoom(c,u,M,sk,P)});
    } else {
      parts=[
        {back:true, draw:(c,u)=>drawArm(c,u,M,sk,P,false)},
        {back:true, draw:(c,u)=>drawLeg(c,u,M,sk,P,false)},
        {draw:(c,u)=>drawTorso(c,u,M,sk,P,form)},
        {draw:(c,u)=>drawLeg(c,u,M,sk,P,true)},
        {noShade:true, draw:(c,u)=>drawBelly(c,u,M,sk,P,f)},
        {draw:(c,u)=>drawHead(c,u,M,sk,P,form)},
        {draw:(c,u)=>drawJaw(c,u,M,sk,P)},
      ];
      if(P.smear) parts.push({noShade:true, smear:true, noRim:true, draw:(c,u)=>drawSmear(c,u,M,sk)});
      parts.push({draw:(c,u)=>drawArm(c,u,M,sk,P,true)});
      if(P.burp) parts.push({noShade:true, noRim:true, smear:true, draw:(c,u)=>drawBurp(c,u,M,sk,P)});
    }
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM[form]}); if(step>=4) heavyOutline(cv);
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._belly=sc(sk.bc); cv._bellyR=BRX*sk.bs*K; cv._glow=P.glow; cv._eye=sc(sk.H(7.6,-10)); cv._mouth=sc(sk.H(10,-2)); cv._head=sc(sk.H(2,-10)); cv._hand=sc(sk.wrF);
    cache.set(key,cv); if(cache.size>900) cache.delete(cache.keys().next().value);
    return cv;
  }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame,framePose:function(form,anim,P,key){ return frame(form,anim,0,5,P,key); }};
})();

/* ===== shared/clima ===== */
/* Clima (CLM-04 a CLM-11): camadas procedurais em pixel art por cima do dia e da noite.
   Chuva em dois planos com respingos no chão, poças que refletem o cenário e ondulam, tempestade com relâmpago
   em 3 camadas e flash de tela, neblina em faixas e céu nublado. Tudo é pré-gerado em canvases (por tom de luz);
   por quadro só há drawImage/fillRect. Coordenadas em px de tela (960×540); a câmera chega em unidades lógicas.
   Uso: const fx=CLIMA.make({W,H,RS,HZ,Y0,Y1}); fx.set('chuva','noite',true); a cada quadro fx.update(dt) e
   fx.sky(g,cam,t) depois do céu, fx.ground(g,cam,t) no chão (antes dos personagens), fx.front(g,cam,t) por cima. */
const CLIMA=(function(){
function mk(w,h){ const c=document.createElement('canvas'); c.width=Math.max(1,Math.round(w)); c.height=Math.max(1,Math.round(h)); const g=c.getContext('2d'); g.imageSmoothingEnabled=false; return [c,g]; }
function hs(n){ n=Math.sin(n*127.1+311.7)*43758.5453; return n-Math.floor(n); }
function R(g,x,y,w,h,c){ g.fillStyle=c; g.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h))); }
function ell(g,cx,cy,rx,ry,c){ g.fillStyle=c; const RY=Math.max(1,Math.round(ry)); for(let dy=-RY;dy<=RY;dy++){ const hw=Math.round(rx*Math.sqrt(Math.max(0,1-(dy/(RY+.5))**2))); if(hw>0) g.fillRect(Math.round(cx-hw),Math.round(cy+dy),hw*2,1); } }
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

/* intensidades por estado (CLM-04): chuva, nuvens, névoa, raios */
const PRESET={
  limpo:{chuva:0,nuvem:0,nevoa:0,raio:0},
  nublado:{chuva:0,nuvem:.8,nevoa:0,raio:0},
  chuva:{chuva:.6,nuvem:.85,nevoa:.12,raio:0},
  tempestade:{chuva:1,nuvem:1,nevoa:.18,raio:1},
  neblina:{chuva:0,nuvem:.35,nevoa:1,raio:0},
};
/* tons por luz: gota, respingo, água da poça, nuvem (3 tons + borda), névoa, véu escuro */
const TONE={
  dia:{gota:['#e6eeff','#b8c8ee'],resp:'#f2f6ff',agua:'#40508a',brilho:'#e8f0ff',nuvem:['#7c7c9c','#9a9ab6','#b8b8cc','#d6d6e4'],nevoa:'#e4e2f0',veu:'rgba(30,30,60,'},
  dusk:{gota:['#ffd8e8','#c8a8d8'],resp:'#ffe8f0',agua:'#3a2a5a',brilho:'#ffd0a0',nuvem:['#3e2450','#5a3060','#7a3e6a','#c8707a'],nevoa:'#d8b8d8',veu:'rgba(40,16,48,'},
  noite:{gota:['#b8c0f0','#7a80c0'],resp:'#d0d8ff',agua:'#141030',brilho:'#ffd890',nuvem:['#120e26','#1a1634','#262044','#3a3460'],nevoa:'#8a86b8',veu:'rgba(6,4,18,'},
  lua:{gota:['#ffb0b8','#c05060'],resp:'#ffc8c8',agua:'#2a0610',brilho:'#ff8a6a',nuvem:['#24060e','#360a14','#4a1018','#6a1a20'],nevoa:'#a04050',veu:'rgba(30,2,8,'},
};
const toneOf=m=>m==='lua'?'lua':m==='noite'?'noite':m==='anoitecer'?'dusk':'dia';
let INSTANT=false; // debug/E2E: trocas de clima sem fade e chão já molhado
const reduz=typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches; // CLM-14

/* ---------- pré-geração (cache global por tom) ---------- */
const C={};
function rainTile(tone,near){ const k='r'+tone+near; if(C[k]) return C[k]; const T=TONE[tone], W=480, H=270, [c,g]=mk(W,H), n=near?60:130, sl=-.28;
  for(let i=0;i<n;i++){ const x=hs(i*3.7+(near?1:9))*W, y=hs(i*5.3+(near?2:7))*H, len=near?16+hs(i*1.9)*10:8+hs(i*2.3)*6, st=near?2:1;
    for(let k2=0;k2<len;k2+=st){ const px=((x+k2*sl)%W+W)%W, py=(y+k2)%H; g.fillStyle=k2>len*.6?T.gota[0]:T.gota[1]; g.fillRect(Math.round(px),Math.round(py),near?2:1,st); } }
  return C[k]=c; }
function cloudBand(tone,W,H){ const k='c'+tone+W+'x'+H; if(C[k]) return C[k]; const T=TONE[tone], [c,g]=mk(W,H), N=T.nuvem;
  // véu de cima (céu fechado) com dithering na borda
  R(g,0,0,W,H*.32,N[0]); for(let y=Math.round(H*.32);y<H*.42;y++) for(let x=(y%2)*2;x<W;x+=4) g.fillRect(x,y,2,1);
  for(let i=0;i<34;i++){ const cx=hs(i*4.1)*W, cy=H*.18+hs(i*6.7)*H*.55, w=120+hs(i*2.9)*260, h=18+hs(i*3.3)*26;
    for(const off of [0,-W,W]){ const x=cx+off; if(x<-w||x>W+w) continue;
      ell(g,x,cy+h*.35,w*.55,h*.7,N[0]); ell(g,x-w*.18,cy-h*.2,w*.32,h*.85,N[1]); ell(g,x+w*.2,cy-h*.05,w*.28,h*.7,N[1]);
      ell(g,x-w*.2,cy-h*.55,w*.2,h*.42,N[2]); ell(g,x+w*.18,cy-h*.38,w*.16,h*.34,N[2]);
      R(g,x-w*.3,cy-h*.98,w*.22,2,N[3]); R(g,x+w*.08,cy-h*.72,w*.16,2,N[3]); g.clearRect(x-w*.7,cy+h*1.05,w*1.4,3); } }
  return C[k]=c; }
function fogBand(tone,W,H,seed){ const k='f'+tone+W+'x'+H+seed; if(C[k]) return C[k]; const T=TONE[tone], [c,g]=mk(W,H);
  for(let pass=0;pass<3;pass++){ g.globalAlpha=[.18,.22,.28][pass];
    for(let i=0;i<26;i++){ const cx=hs(i*3.1+seed+pass*11)*W, cy=H*.5+(hs(i*7.7+seed)-.5)*H*.5, w=80+hs(i*2.1+pass)*180, h=(10+hs(i*5.9)*18)*(1-pass*.25);
      for(const off of [0,-W,W]) ell(g,cx+off,cy,w*(1-pass*.22),h,T.nevoa); } }
  g.globalAlpha=1; // dithering vertical nas bordas pra não virar faixa reta
  g.globalCompositeOperation='destination-out'; for(let y=0;y<H;y++){ const u=Math.abs(y-H/2)/(H/2); if(u<.55) continue; for(let x=(y%2)*2;x<W;x+=u>.8?2:4) g.fillRect(x,y,2,1); } g.globalCompositeOperation='source-over';
  return C[k]=c; }
function bolt(v,h){ const k='b'+v+'_'+h; if(C[k]) return C[k]; const W=160, [c,g]=mk(W,h);
  const pts=[[W/2+(hs(v*3)-.5)*30,0]]; let x=pts[0][0], y=0; while(y<h){ y+=10+hs(v*7+y)*18; x+=(hs(v*11+y*.3)-.5)*34; x=clamp(x,12,W-12); pts.push([x,Math.min(h,y)]); }
  const br=[]; for(let i=2;i<pts.length-2;i+=3){ if(hs(v+i)<.45) continue; const [bx,by]=pts[i], d=hs(v*5+i)>.5?1:-1; let px=bx, py=by; const b=[[px,py]]; for(let j=0;j<4;j++){ py+=8+hs(i+j)*10; px+=d*(6+hs(i*3+j)*12); b.push([px,py]); } br.push(b); }
  const seg=(P,w,col)=>{ g.fillStyle=col; for(let i=1;i<P.length;i++){ const [x0,y0]=P[i-1], [x1,y1]=P[i], n=Math.ceil(Math.hypot(x1-x0,y1-y0)/2); for(let s=0;s<=n;s++) g.fillRect(Math.round(x0+(x1-x0)*s/n-w/2),Math.round(y0+(y1-y0)*s/n),w,2); } };
  seg(pts,8,'rgba(122,96,255,.35)'); br.forEach(b=>seg(b,5,'rgba(122,96,255,.3)'));
  seg(pts,4,'#b8c4ff'); br.forEach(b=>seg(b,2,'#9aa8ff')); seg(pts,2,'#ffffff');
  return C[k]=c; }
function pudMask(rx,ry){ const k='p'+rx+'_'+ry; if(C[k]) return C[k]; const [c,g]=mk(rx*2+2,ry*2+2);
  // poça irregular: elipse principal + lóbulos, em degraus de pixel
  ell(g,rx+1,ry+1,rx,ry,'#fff'); ell(g,rx*.55,ry*1.2,rx*.45,ry*.7,'#fff'); ell(g,rx*1.5,ry*.9,rx*.4,ry*.6,'#fff');
  return C[k]=c; }
function rimFor(rx,ry,col){ const k='rim'+rx+'_'+ry+col; if(C[k]) return C[k]; const [c,g]=mk(rx*2+2,ry*2+2);
  g.drawImage(pudMask(rx,ry),0,0); g.globalCompositeOperation='source-in'; R(g,0,0,c.width,c.height,col);
  g.globalCompositeOperation='destination-out'; g.drawImage(pudMask(rx,ry),0,2); g.globalCompositeOperation='source-over';
  // brilhos horizontais (reflexo do céu)
  R(g,rx*.5,ry*.7,rx*.5,1,col); R(g,rx*1.1,ry*1.1,rx*.35,1,col);
  return C[k]=c; }

/* ---------- instância por cena ---------- */
function make(o){
  const W=o.W||960, H=o.H||540, RS=o.RS||2.5, HZ=o.HZ||295, Y0=o.Y0||Math.round(H*.62), Y1=o.Y1||H-8, SKYH=o.SKYH||HZ+20;
  const cur={chuva:0,nuvem:0,nevoa:0,raio:0}; let tgt=PRESET.limpo, mode='noite', tone='noite', wet=0, flash=0, nextBolt=4, boltT=-1, boltX=0, boltV=0, flick=0;
  const spl=[]; for(let i=0;i<56;i++) spl.push({x:0,y:0,t:1,life:.3});
  const pud=[]; for(let i=0;i<64;i++){ if(hs(i*7.7+.3)<.3) continue; const rx=Math.round((16+hs(i*5.1)*26)*RS), ry=Math.max(6,Math.round(rx*.16)); pud.push({x:i*230+hs(i)*120,y:Math.round(Y0/RS+8+hs(i*3.3)*((Y1-Y0)/RS-22)),rx,ry,ph:hs(i*9.1)*6}); }
  const [sc,sg]=mk(260,40);
  const api={
    clima:'limpo', onBolt:null,
    /** troca o clima (fade de ~3 s) e o tom da luz; instant = já começa no alvo (chão já molhado) */
    set(clima,m,instant){ this.clima=PRESET[clima]?clima:'limpo'; tgt=PRESET[this.clima]; mode=m||mode; tone=toneOf(mode);
      if(instant||INSTANT){ Object.assign(cur,tgt); wet=tgt.chuva>0?1:0; } },
    get wet(){ return wet; }, get flash(){ return flash; }, get params(){ return cur; },
    update(dt){ dt=Math.min(.1,dt||0); for(const p of ['chuva','nuvem','nevoa','raio']) cur[p]+=(tgt[p]-cur[p])*Math.min(1,dt*1.1); // troca em ~3 s (CLM-04)
      // CLM-06: molha em ~90 s, seca em ~50 s
      wet=clamp(wet+(cur.chuva>.15?dt/90:-dt/50),0,1);
      flash=Math.max(0,flash-dt*4.5); if(flick>0){ flick-=dt; if(flick<=0) flash=Math.max(flash,.6); }
      if(boltT>=0){ boltT+=dt; if(boltT>.22) boltT=-1; }
      if(cur.raio>.5&&mode!=='lua'){ nextBolt-=dt; if(nextBolt<=0){ nextBolt=3+Math.random()*6; flash=1; flick=.12; boltT=0; boltX=60+Math.random()*(W-220); boltV=Math.floor(Math.random()*4); if(this.onBolt) this.onBolt(boltX); } }
      for(const s of spl){ s.t+=dt; if(s.t>=s.life&&cur.chuva>.05&&Math.random()<cur.chuva){ s.t=0; s.life=.2+Math.random()*.12; s.x=Math.random()*W; s.y=Y0+Math.random()*(Y1-Y0); } } },
    /** nuvens fechando o céu (depois do céu e do fundo distante, antes das fachadas) e o raio lá no alto */
    sky(g,cam,t){ if(mode==='lua') return; const a=cur.nuvem; if(a<.02&&boltT<0) return; g.save(); g.setTransform(1,0,0,1,0,0);
      if(a>=.02){ const cb=cloudBand(tone,1920,SKYH), off=((Math.round((cam||0)*RS*.05+(t||0)*7))%cb.width+cb.width)%cb.width;
        g.globalAlpha=Math.min(1,a*1.05); g.drawImage(cb,-off,0); if(cb.width-off<W) g.drawImage(cb,cb.width-off,0);
        g.globalAlpha=a*.35; g.fillStyle=TONE[tone].nuvem[0]; g.fillRect(0,0,W,SKYH); }
      if(boltT>=0){ g.globalAlpha=1-boltT/.22; g.globalCompositeOperation='lighter'; g.drawImage(bolt(boltV,SKYH),boltX,0); }
      g.restore(); },
    /** chão: escurece molhado, poças com reflexo (espelho na linha das fachadas) e ondinhas da chuva, respingos */
    ground(g,cam,t){ if(wet<.02&&cur.chuva<.02) return; const T=TONE[tone], src=g.canvas, camPx=(cam||0)*RS; g.save(); g.setTransform(1,0,0,1,0,0);
      g.globalAlpha=.16*wet; g.fillStyle=T.agua; g.fillRect(0,HZ+4,W,H-HZ-4); g.globalAlpha=1;
      if(wet>.3){ const pa=clamp((wet-.3)/.5,0,1);
        for(const p of pud){ const px=Math.round(p.x*RS-camPx), w2=p.rx*2+2, h2=p.ry*2+2; if(px+w2<0||px-w2>W) continue; const x0=px-p.rx, y0=Math.round(p.y*RS)-p.ry;
          if(sc.width<w2||sc.height<h2){ sc.width=Math.max(sc.width,w2); sc.height=Math.max(sc.height,h2); sg.imageSmoothingEnabled=false; }
          sg.setTransform(1,0,0,1,0,0); sg.globalCompositeOperation='source-over'; sg.globalAlpha=1; sg.clearRect(0,0,w2,h2);
          const sy=2*HZ-(y0+h2); // reflexo: linha y da poça espelha a linha 2·HZ−y do cenário
          const sx0=Math.max(0,x0), sx1=Math.min(W,x0+w2); if(sy>=0&&sx1>sx0){ sg.save(); sg.translate(0,h2); sg.scale(1,-1); sg.drawImage(src,sx0,sy,sx1-sx0,h2,sx0-x0,0,sx1-sx0,h2); sg.restore(); }
          sg.globalCompositeOperation='source-atop'; sg.globalAlpha=.5; sg.fillStyle=T.agua; sg.fillRect(0,0,w2,h2); sg.globalAlpha=1;
          sg.globalCompositeOperation='destination-in'; sg.drawImage(pudMask((p.rx),(p.ry)),0,0); sg.globalCompositeOperation='source-over';
          sg.globalAlpha=.55; sg.drawImage(rimFor(p.rx,p.ry,T.brilho),0,0); sg.globalAlpha=1;
          if(cur.chuva>.05) for(let r=0;r<2;r++){ const ph=((t||0)*1.6+p.ph+r*.5)%1, rr=Math.round(4+ph*p.ry*2.2), cx=Math.round(p.rx*(.5+r*.6)+Math.sin(p.ph+r)*p.rx*.2), cy=p.ry+1;
            sg.globalAlpha=(1-ph)*.8*cur.chuva; sg.fillStyle=T.resp; for(let k2=0;k2<12;k2++){ const a=k2/12*Math.PI*2; sg.fillRect(Math.round(cx+Math.cos(a)*rr),Math.round(cy+Math.sin(a)*rr*.35),2,1); } sg.globalAlpha=1;
            sg.globalCompositeOperation='destination-in'; sg.drawImage(pudMask(p.rx,p.ry),0,0); sg.globalCompositeOperation='source-over'; }
          g.globalAlpha=pa*.95; g.drawImage(sc,0,0,w2,h2,x0,y0,w2,h2); g.globalAlpha=1; } }
      if(cur.chuva>.05){ g.fillStyle=T.resp; for(const s of spl){ if(s.t>=s.life) continue; const f=Math.floor(s.t/s.life*3), x=Math.round(s.x), y=Math.round(s.y); g.globalAlpha=.85*cur.chuva;
          if(f===0) g.fillRect(x-1,y,3,1); else if(f===1){ g.fillRect(x-4,y-3,2,2); g.fillRect(x+3,y-3,2,2); g.fillRect(x-3,y,7,1); } else { g.fillRect(x-6,y-1,2,1); g.fillRect(x+5,y-1,2,1); g.fillRect(x-1,y-5,2,2); } } g.globalAlpha=1; }
      g.restore(); },
    /** por cima de tudo: chuva em 2 planos, neblina em faixas, véu das nuvens e flash do relâmpago */
    front(g,cam,t){ const T=TONE[tone], camPx=(cam||0)*RS; t=t||0; g.save(); g.setTransform(1,0,0,1,0,0);
      if(cur.nevoa>.02&&mode!=='lua'){ const bands=[[HZ-90,.6,.4,1],[HZ+40,1,.75,2],[H-130,1.4,.6,3]];
        for(const [y,par,al,sd] of bands){ const fb=fogBand(tone,1600,150,sd), off=((Math.round(camPx*par*.6+t*(10+sd*5)))%1600+1600)%1600; g.globalAlpha=cur.nevoa*al; g.drawImage(fb,-off,y); if(1600-off<W) g.drawImage(fb,1600-off,y); }
        g.globalAlpha=cur.nevoa*.16; g.fillStyle=T.nevoa; g.fillRect(0,0,W,H); }
      if(cur.nuvem>.02&&mode!=='lua'){ g.globalAlpha=1; g.fillStyle=T.veu+(cur.nuvem*(tone==='dia'?.2:.12)).toFixed(3)+')'; g.fillRect(0,0,W,H); }
      if(cur.chuva>.02){ const far=rainTile(tone,0), near=rainTile(tone,1);
        const lay=(cv,sp,dx,al)=>{ const ox=((Math.round(dx+camPx*.15+t*sp*.28))%cv.width+cv.width)%cv.width, oy=((Math.round(t*sp))%cv.height+cv.height)%cv.height; g.globalAlpha=al;
          for(let y=oy-cv.height;y<H;y+=cv.height) for(let x=-ox;x<W;x+=cv.width) g.drawImage(cv,x,y); };
        lay(far,560,0,Math.min(1,cur.chuva*1.2)*.7); lay(near,940,0,Math.min(1,cur.chuva*1.3)*.85); if(cur.chuva>.75) lay(near,1020,240,(cur.chuva-.75)*3.2*.8); }
      if(flash>.01){ g.globalAlpha=1; g.globalCompositeOperation='lighter'; g.fillStyle=`rgba(200,210,255,${(flash*(reduz?.12:.5)).toFixed(3)})`; g.fillRect(0,0,W,H); }
      g.restore(); },
  };
  return api;
}
/** pré-gera as camadas de um tom (tela de carregamento) */
function prewarm(m,W,H,HZ){ const tone=toneOf(m); rainTile(tone,0); rainTile(tone,1); cloudBand(tone,1920,(HZ||295)+20); for(let s=1;s<=3;s++) fogBand(tone,1600,150,s); for(let v=0;v<4;v++) bolt(v,(HZ||295)+20); }
return {make,prewarm,PRESET,TONE,debugInstant:v=>{ INSTANT=!!v; }};
})();

/* ===== hub/abrigo ===== */
/* ABRIGO — fonte de arte (editável). Build: npm run art
   Abrigo em alta resolução: RS=2.5 → canvas 1120×630. W×H é a JANELA da câmera (448×252, 16:9).
   WORLD×WORLDH é o pátio desenhado (mais alto que a janela): a câmera anda em X e Y.
   draw(g,cam,state,t,{drawActors}) espera g JÁ escalado por RS (desenha em unidades lógicas);
   o detalhe vem de canvases pré-renderizados em alta resolução, desenhados com drawImage(c,x,y,wLógico,hLógico).
   sprite(id,n) → {c (alta resolução), ax, gy, w, h (unidades LÓGICAS), lights}.
   SLOTS / SLOT / WORLD / BASE continuam em unidades lógicas. */
const ABRIGO=(function(){
/* Pátio 2.5D: janela larga, mundo mais alto que a janela. W×H é a vista; WORLD×WORLDH é o chão.
   gy maior = mais perto da câmera. A muralha fecha o fundo e as laterais. */
const W=448, H=252, BASE=128, WORLD=760, WORLDH=1120, OUT='#170b1c', RS=2.5;
const HW=Math.round(W*RS), HH=Math.round(H*RS), HB=Math.round(BASE*RS), WHH=Math.round(WORLDH*RS);
const FLOOR={x0:44, x1:WORLD-44, y0:BASE+22, y1:WORLDH-32};

/* ---------- cor ---------- */
function hx(h){ const n=parseInt(h.slice(1),16); return [(n>>16)&255,(n>>8)&255,n&255]; }
function toHex(r,g,b){ return '#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join(''); }
function mix(a,b,t){ const A=hx(a),B=hx(b); return toHex(A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,A[2]+(B[2]-A[2])*t); }
const RC=new Map();
// rampa de 6 tons com hue shift: [0] brilho quente · [1] luz · [2] base · [3] meia-sombra · [4] sombra roxa · [5] fundo
function rmp(h){ let r=RC.get(h); if(!r){ r=[mix(h,'#fff0c4',.55),mix(h,'#ffdc9c',.24),h,mix(h,'#3e2e86',.3),mix(h,'#221766',.54),mix(h,'#100828',.74)]; RC.set(h,r); } return r; }
function hsh(n){ n=Math.sin(n*127.1+311.7)*43758.5453; return n-Math.floor(n); }
const pick=(arr,v)=>arr[Math.floor(v*arr.length)%arr.length];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function lowf(x,y,s){ return (Math.sin(x*.0061+s)+Math.sin(x*.0137+y*.021+s*2)+Math.sin(y*.033-x*.0029+s))/3; }

/* ---------- primitivas (pixels inteiros) ---------- */
/** canvas de CPU (sem ida e volta da GPU quando desenhado em outro canvas de CPU) */
function mkC(w,h){ const c=document.createElement('canvas'); c.width=Math.max(1,Math.round(w)); c.height=Math.max(1,Math.round(h)); const g=c.getContext('2d',{willReadFrequently:true}); g.imageSmoothingEnabled=false; return [c,g]; }
function mk(w,h){ const c=document.createElement('canvas'); c.width=Math.max(1,Math.round(w)); c.height=Math.max(1,Math.round(h)); const g=c.getContext('2d'); g.imageSmoothingEnabled=false; return [c,g]; }
function R(g,x,y,w,h,c){ if(w<=0||h<=0) return; g.fillStyle=c; const X=Math.round(x), Y=Math.round(y); g.fillRect(X,Y,Math.max(1,Math.round(x+w)-X),Math.max(1,Math.round(y+h)-Y)); }
function ell(g,cx,cy,rx,ry,c){ g.fillStyle=c; const RY=Math.max(1,Math.round(ry)); for(let dy=-RY;dy<=RY;dy++){ const hw=Math.round(rx*Math.sqrt(Math.max(0,1-(dy/(RY+.5))**2))); if(hw>0) g.fillRect(Math.round(cx-hw),Math.round(cy+dy),hw*2,1); } }
function poly(g,P,c){ g.fillStyle=c; let y0=1e9,y1=-1e9; for(const p of P){ if(p[1]<y0) y0=p[1]; if(p[1]>y1) y1=p[1]; }
  for(let y=Math.floor(y0);y<Math.ceil(y1);y++){ const yc=y+.5, xs=[]; for(let i=0;i<P.length;i++){ const a=P[i], b=P[(i+1)%P.length]; if((a[1]<=yc&&b[1]>yc)||(b[1]<=yc&&a[1]>yc)) xs.push(a[0]+(yc-a[1])/(b[1]-a[1])*(b[0]-a[0])); }
    xs.sort((p,q)=>p-q); for(let i=0;i+1<xs.length;i+=2){ const xa=Math.round(xs[i]), xb=Math.round(xs[i+1]); if(xb>xa) g.fillRect(xa,y,xb-xa,1); } } }
function line(g,x0,y0,x1,y1,c,t=1){ const n=Math.max(1,Math.ceil(Math.max(Math.abs(x1-x0),Math.abs(y1-y0)))); g.fillStyle=c; for(let i=0;i<=n;i++) g.fillRect(Math.round(x0+(x1-x0)*i/n-t/2+.5),Math.round(y0+(y1-y0)*i/n-t/2+.5),t,t); }
function sag(g,x0,y0,x1,y1,s,c,t=1,cb){ const n=Math.max(1,Math.ceil(Math.abs(x1-x0))); g.fillStyle=c; let py=null;
  for(let i=0;i<=n;i++){ const u=i/n, x=Math.round(x0+(x1-x0)*u), y=Math.round(y0+(y1-y0)*u+Math.sin(u*Math.PI)*s); g.fillStyle=c; if(py!==null&&Math.abs(y-py)>1) g.fillRect(x,Math.min(y,py),t,Math.abs(y-py)); g.fillRect(x,y,t,t); py=y; if(cb) cb(x,y,i,u); } }
function blob(g,x,y,w,h,c){ const k=Math.max(1,Math.min(4,Math.floor(Math.min(w,h)/4))); R(g,x+k,y,w-2*k,h,c); R(g,x,y+k,w,h-2*k,c); R(g,x+k/2,y+k/2,w-k,h-k,c); }
function shade(g,x,y,w,h,c,a){ g.save(); g.globalAlpha=a; R(g,x,y,w,h,c); g.restore(); }
function clipR(g,x,y,w,h,fn){ g.save(); g.beginPath(); g.rect(Math.round(x),Math.round(y),Math.round(w),Math.round(h)); g.clip(); fn(); g.restore(); }
function clipP(g,P,fn){ g.save(); g.beginPath(); P.forEach((p,i)=>i?g.lineTo(Math.round(p[0]),Math.round(p[1])):g.moveTo(Math.round(p[0]),Math.round(p[1]))); g.closePath(); g.clip(); fn(); g.restore(); }
const lerp=(a,b,u)=>[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u];
// fila de emissivos (desenhados depois da gradação noturna) e lista de luzes do sprite (px do canvas)
let LQ=null, LL=null;
function emit(g,fn){ if(LQ) LQ.push(fn); else fn(g); }
function lt(x,y,r,c,a,o){ if(LL) LL.push(Object.assign({x,y,r,c,a},o||{})); }

/* ---------- fonte 5×7 pra placas ---------- */
const FONT={A:[14,17,17,31,17,17,17],B:[30,17,17,30,17,17,30],C:[14,17,16,16,16,17,14],D:[30,17,17,17,17,17,30],E:[31,16,16,30,16,16,31],F:[31,16,16,30,16,16,16],G:[14,17,16,23,17,17,15],H:[17,17,17,31,17,17,17],I:[14,4,4,4,4,4,14],J:[7,2,2,2,2,18,12],K:[17,18,20,24,20,18,17],L:[16,16,16,16,16,16,31],M:[17,27,21,21,17,17,17],N:[17,17,25,21,19,17,17],O:[14,17,17,17,17,17,14],P:[30,17,17,30,16,16,16],Q:[14,17,17,17,21,18,13],R:[30,17,17,30,20,18,17],S:[15,16,16,14,1,1,30],T:[31,4,4,4,4,4,4],U:[17,17,17,17,17,17,14],V:[17,17,17,17,17,10,4],W:[17,17,17,21,21,21,10],X:[17,17,10,4,10,17,17],Y:[17,17,17,10,4,4,4],Z:[31,1,2,4,8,16,31],
  '0':[14,17,19,21,25,17,14],'1':[4,12,4,4,4,4,14],'2':[14,17,1,2,4,8,31],'3':[31,2,4,2,1,17,14],'4':[2,6,10,18,31,2,2],'5':[31,16,30,1,1,17,14],'6':[6,8,16,30,17,17,14],'7':[31,1,2,4,8,8,8],'8':[14,17,17,14,17,17,14],'9':[14,17,17,15,1,2,12],'.':[0,0,0,0,0,12,12],'-':[0,0,0,31,0,0,0],'!':[4,4,4,4,4,0,4],'>':[8,4,2,1,2,4,8],'+':[0,4,4,31,4,4,0],' ':[0,0,0,0,0,0,0]};
const norm=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase();
function text(g,str,x,y,s,c){ str=norm(str); let cx=x; g.fillStyle=c; for(const ch of str){ const G=FONT[ch]||FONT[' ']; for(let r=0;r<7;r++){ const row=G[r]; for(let b=0;b<5;b++) if(row&(16>>b)) g.fillRect(Math.round(cx+b*s),Math.round(y+r*s),s,s); } cx+=6*s; } return cx-x-s; }
const tw=(str,s)=>norm(str).length*6*s-s;

/* ---------- paleta ---------- */
const WD=rmp('#a06a3c'), WDD=rmp('#7a4c2c'), BK=rmp('#6a4a34'), PLY=rmp('#b8905e');
const TG=rmp('#5e7c48'), TB=rmp('#3a6aa0'), TOr=rmp('#c07a34'), RU=rmp('#9a5230'), ZN=rmp('#8e96a2'), SCR=rmp('#77767a');
const ST=rmp('#a29a8a'), TE=rmp('#bc5a30'), BR=rmp('#a84a38'), MT=rmp('#7e8696'), LU=rmp('#4c4268'), RD=rmp('#c8303a');
const SH=rmp('#3e8a6a'), SOIL=rmp('#5e4430'), LEAF=rmp('#4f8a3a'), LEAF2=rmp('#6aa84a'), CORN=rmp('#e8c44a');
const GO=['#fff4c0','#ffd848','#e8ac2a','#b87818','#7a4610','#3e2008'];
const CLOTH=['#c83a3a','#e8c44a','#3a7ae0','#e8e0cc','#4aa860','#e87ab0','#8a5ae0','#e8803a'];
const MATNOME=['','Lona e sucata','Madeira','Pedra','Tijolo e metal','Lua de Sangue'];

/* ---------- materiais ---------- */
function boardsV(g,x,y,w,h,c,s,pw,rough){ pw=pw||16; R(g,x,y,w,h,c[5]); let xx=x,i=0;
  while(xx<x+w){ const bw=Math.min(pw-3+Math.floor(hsh(s+i*1.31)*6),x+w-xx), top=y+(rough?Math.floor(hsh(s*3+i)*rough):0), v=hsh(s*7+i*2.17), b=v<.22?c[3]:v>.82?c[1]:c[2], hh=y+h-top;
    if(bw>2&&hh>0){ R(g,xx,top,bw-1,hh,b); R(g,xx,top,1,hh,mix(b,c[0],.4)); R(g,xx+bw-3,top,2,hh,mix(b,c[4],.55));
      for(let k=0;k<3;k++){ const gx=xx+2+Math.floor(hsh(s+i*3+k)*Math.max(1,bw-6)), gy0=top+Math.floor(hsh(s*5+i+k*7)*hh*.7); R(g,gx,gy0,1,8+hsh(i+k*3)*hh*.35,mix(b,c[4],.3)); }
      if(v>.62&&hh>30){ const ky=top+10+hsh(s*11+i)*(hh-24); ell(g,xx+bw/2,ky,2.5,3.5,mix(b,c[4],.6)); R(g,xx+bw/2-1,ky-2,1,1,c[1]); }
      if(hh>24) for(const ny of [top+5,y+h-8]){ R(g,xx+Math.floor(bw/2)-1,ny,2,2,'#241a24'); R(g,xx+Math.floor(bw/2)-1,ny,1,1,'#d8d0c0'); }
      shade(g,xx,y+h-Math.min(14,hh),bw-1,Math.min(14,hh),'#1a0c1e',.3);
      if(rough) R(g,xx,top,bw-1,2,mix(b,c[0],.3)); }
    xx+=Math.max(1,bw); i++; } }
function boardsH(g,x,y,w,h,c,s,ph){ ph=ph||12; R(g,x,y,w,h,c[5]); let yy=y,i=0;
  while(yy<y+h){ const bh=Math.min(ph-2+Math.floor(hsh(s+i*1.7)*4),y+h-yy), v=hsh(s*5+i*1.3), b=v<.25?c[3]:v>.8?c[1]:c[2];
    if(bh>1){ R(g,x,yy,w,bh-1,b); R(g,x,yy,w,1,mix(b,c[0],.4)); R(g,x,yy+bh-2,w,1,mix(b,c[4],.5));
      for(let k=0;k<w/24;k++){ const gx=x+hsh(s+i*5+k)*w*.9, gl=8+hsh(k+i)*Math.min(30,w*.4); R(g,gx,yy+2+Math.floor(hsh(k*3+i)*Math.max(1,bh-4)),gl,1,mix(b,c[4],.3)); }
      if(w>20) for(const nx of [x+4,x+w-6]){ R(g,nx,yy+Math.floor(bh/2)-1,2,2,'#241a24'); R(g,nx,yy+Math.floor(bh/2)-1,1,1,'#d8d0c0'); } }
    yy+=Math.max(1,bh); i++; } }
function corrugated(g,x,y,w,h,c,s,rust){ R(g,x,y,w,h,c[3]); for(let xx=x;xx<x+w;xx+=6){ R(g,xx,y,2,h,c[1]); R(g,xx+2,y,2,h,c[2]); R(g,xx+4,y,2,h,c[4]); }
  R(g,x,y,w,2,c[0]); R(g,x,y+h-3,w,3,c[5]);
  for(let i=0;i<w/16;i++) if(hsh(s+i*1.9)<(rust==null?.35:rust)){ const rx=x+hsh(s*3+i)*w, ry=y+hsh(s*5+i)*h*.6, rl=8+hsh(i*2.3+s)*h*.5, rw=3+Math.floor(hsh(i*7+s)*6); g.save(); g.globalAlpha=.75; R(g,rx,ry,rw,rl,RU[3]); R(g,rx+1,ry,Math.max(1,rw-2),rl*.6,RU[2]); R(g,rx+1,ry+rl,Math.max(1,rw-3),rl*.4,RU[3]); g.restore(); }
  for(let xx=x+3;xx<x+w-2;xx+=12){ R(g,xx,y+4,2,2,'#1a1220'); R(g,xx,y+4,1,1,c[0]); R(g,xx,y+h-8,2,2,'#1a1220'); } }
function tarp(g,x,y,w,h,c,s){ R(g,x,y,w,h,c[2]); let xx=x+4,i=0;
  while(xx<x+w){ const fw=12+Math.floor(hsh(s+i)*12); for(let yy=y;yy<y+h;yy+=2){ const o=Math.round(Math.sin(yy*.06+i)*2); R(g,xx+o,yy,3,2,c[1]); R(g,xx+o+3,yy,3,2,c[3]); } xx+=fw; i++; }
  if(hsh(s*3)>.4&&w>40&&h>40){ const px=x+6+hsh(s*5)*(w-34), py=y+10+hsh(s*7)*(h-40); R(g,px,py,26,20,mix(c[2],'#b89a62',.6)); R(g,px,py,26,2,mix(c[1],'#d8c090',.5)); for(let k=0;k<26;k+=4){ R(g,px+k,py-1,2,1,'#e8d8b0'); R(g,px+k,py+20,2,1,'#e8d8b0'); } }
  for(let x2=x+8;x2<x+w;x2+=26){ ell(g,x2,y+5,2.5,2.5,'#c8c8d0'); R(g,x2-1,y+4,2,2,'#2a2030'); }
  shade(g,x,y+h-16,w,16,'#2a1a10',.35); }
function plywood(g,x,y,w,h,s){ const c=PLY; R(g,x,y,w,h,c[2]); for(let i=0;i<6;i++){ const bx=x+hsh(s+i)*w, by=y+hsh(s*2+i)*h; g.save(); g.globalAlpha=.35; blob(g,bx-10,by-6,20+hsh(i)*30,12+hsh(i*3)*20,i%2?c[3]:c[1]); g.restore(); }
  for(let yy=y+6;yy<y+h;yy+=9) R(g,x,yy,w,1,mix(c[2],c[3],.5)); R(g,x,y,w,2,c[1]); R(g,x+w-2,y,2,h,c[4]);
  if(hsh(s*9)>.45) text(g,pick(['SOS','PE','VIVO','AGUA','>>'],hsh(s*11)),x+6,y+h*.35,2,'#c8283a'); }
function sucataWall(g,x,y,w,h,s){ let xx=x,i=0;
  while(xx<x+w){ const cw=50+Math.floor(hsh(s+i*2.3)*60), v=hsh(s*3+i*1.7), yo=Math.floor(hsh(s*5+i)*10);
    if(v<.42) corrugated(g,xx,y+yo-6,cw+6,h+12,v<.2?RU:ZN,s+i,.5); else if(v<.72) tarp(g,xx,y+yo-6,cw+6,h+12,v<.57?TG:TB,s+i); else plywood(g,xx,y+yo-6,cw+6,h+12,s+i);
    R(g,xx+cw+4,y,2,h,'#1a1220'); xx+=cw; i++; }
  sag(g,x,y+h*.3,x+w,y+h*.32,6,'#c8a868',2); }
function stoneWall(g,x,y,w,h,c,s,moss){ R(g,x,y,w,h,mix(c[4],'#2a2232',.35)); let yy=y+h, r=0;
  while(yy>y-24){ const rh=16+Math.floor(hsh(s+r*3.1)*7); let xx=x-Math.floor(hsh(s*2+r)*24), i=0;
    while(xx<x+w){ const bw=22+Math.floor(hsh(s+r*7.3+i*1.7)*24), v=hsh(s*9+r*3.7+i*1.3), b=v<.28?c[3]:v>.78?c[1]:c[2], by=yy-rh+1;
      blob(g,xx+1,by,bw-2,rh-2,b); R(g,xx+3,by,bw-6,2,mix(b,c[0],.45)); R(g,xx+1,by+2,2,rh-6,mix(b,c[0],.2)); R(g,xx+3,by+rh-5,bw-6,2,c[4]); R(g,xx+bw-4,by+2,2,rh-6,mix(b,c[4],.55));
      if(v>.88){ let px=xx+bw*.3, py=by+3; for(let k=0;k<rh/2-2;k++){ R(g,px,py,1,2,c[5]); py+=2; px+=hsh(k+v)>.5?1:-1; } }
      R(g,xx+4+hsh(i+r)*(bw-8),by+4+hsh(i*3+r)*(rh-9),2,1,c[3]);
      xx+=bw; i++; }
    yy-=rh; r++; }
  if(moss!==false) for(let i=0;i<w;i+=2){ const hh=hsh(s+i*.37)*14*(.5+.5*Math.sin(i/19+s)); if(hh>4) shade(g,x+i,y+h-hh,2,hh,'#3e5a3a',.55); } }
function brickWall(g,x,y,w,h,s,c){ c=c||BR; R(g,x,y,w,h,'#4a3236'); let r=0;
  for(let yy=y+h-9;yy>y-9;yy-=9,r++){ const off=(r%2)*10; for(let xx=x-off-10;xx<x+w;xx+=20){ const v=hsh(s+xx*.31+yy*1.7), b=v<.15?c[4]:v<.4?c[3]:v>.85?c[1]:c[2];
    if(v>.975){ R(g,xx+1,yy+1,18,7,'#1e1218'); continue; }
    R(g,xx+1,yy+1,18,7,b); R(g,xx+1,yy+1,18,1,mix(b,c[0],.35)); R(g,xx+1,yy+7,18,1,mix(b,c[5],.4)); if(v>.6&&v<.66) R(g,xx+5,yy+3,4,2,c[3]); } }
  for(let i=0;i<5;i++) shade(g,x,y,w,6+i*7,'#1a0c1e',.06); }
function gold(g,x,y,w,h){ for(let i=0;i<h;i++) R(g,x,y+i,w,1,GO[i===0?0:Math.min(4,1+Math.floor((i-1)/Math.max(1,h-1)*4))]); for(let xx=x+6;xx<x+w-2;xx+=16) R(g,xx,y+1,2,Math.max(1,h-2),GO[0]); }
function runa(g,x,y,k){ k=k||1; const s=Math.max(2,Math.round(2*k)); R(g,x-s/2-1,y-12*k-1,s+2,24*k+2,'#2a0c16');
  emit(g,G=>{ const c='#ff3a3a'; R(G,x-s/2,y-12*k,s,24*k,c); R(G,x-6*k,y-6*k,s,s,c); R(G,x+3*k,y-2*k,s,10*k,c); R(G,x-6*k,y+6*k,12*k,s,c); R(G,x-s/2,y-12*k,1,24*k,'#ffc8b8'); });
  lt(x,y,26*k,'#ff3030',.75,{p:1,gl:.5}); }
function lunarWall(g,x,y,w,h,s,runes){ R(g,x,y,w,h,LU[5]); let r=0;
  for(let yy=y+h;yy>y-30;r++){ const rh=26; let xx=x-(r%2)*26-6, i=0;
    while(xx<x+w){ const bw=46+Math.floor(hsh(s+r*5+i)*18), v=hsh(s*3+r*7+i*1.9), b=v<.3?LU[3]:v>.8?LU[1]:LU[2], by=yy-rh+1;
      R(g,xx+1,by,bw-2,rh-2,b); R(g,xx+1,by,bw-2,2,mix(b,'#9a90c8',.35)); R(g,xx+1,by,2,rh-2,mix(b,LU[0],.2)); R(g,xx+1,by+rh-4,bw-2,2,LU[4]); R(g,xx+bw-3,by,2,rh-2,LU[4]);
      if(v>.86){ g.save(); g.globalAlpha=.7; let px=xx+bw*.4, py=by+3; for(let k=0;k<10;k++){ R(g,px,py,1,2,'#8a1a2a'); py+=2; px+=hsh(k*3+v)>.5?1:-1; } g.restore(); }
      xx+=bw; i++; }
    yy-=rh; }
  gold(g,x,y,w,5); gold(g,x,y+h-6,w,6);
  if(runes!==false){ const nr=Math.max(1,Math.floor(w/130)); for(let k=0;k<nr;k++) runa(g,x+Math.round(w/nr*(k+.5)),y+Math.round(h*.45),Math.min(1.4,h/70)); } }
function metalBand(g,x,y,w,h){ R(g,x,y,w,h,MT[2]); R(g,x,y,w,1,MT[0]); R(g,x,y+1,w,1,MT[1]); R(g,x,y+h-2,w,2,MT[4]); for(let xx=x+5;xx<x+w;xx+=14){ const yy=y+Math.floor(h/2)-1; R(g,xx,yy,3,3,MT[1]); R(g,xx,yy,1,1,MT[0]); R(g,xx+1,yy+3,2,1,MT[5]); } }
function panel(g,x,y,w,h,n,s,runes){ x=Math.round(x); y=Math.round(y); w=Math.round(w); h=Math.round(h); if(w<=0||h<=0) return;
  clipR(g,x,y,w,h,()=>{
    if(n===1) sucataWall(g,x,y,w,h,s);
    else if(n===2) boardsV(g,x,y,w,h,WD,s,16,0);
    else if(n===3) stoneWall(g,x,y,w,h,ST,s);
    else if(n===4){ brickWall(g,x,y,w,h,s); if(h>40){ metalBand(g,x,y+Math.round(h*.2),w,10); metalBand(g,x,y+Math.round(h*.72),w,10); } else metalBand(g,x,y,w,8); }
    else lunarWall(g,x,y,w,h,s,runes); }); }

/* ---------- telhados ---------- */
function roofBand(g,x0,x1,yT,yB,sk,n,s){ x0=Math.round(x0); x1=Math.round(x1); yT=Math.round(yT); yB=Math.round(yB); sk=Math.round(sk);
  const H0=Math.max(1,yB-yT), sh=y=>sk*(yB-y)/H0, P=[[x0,yB],[x1,yB],[x1+sk,yT],[x0+sk,yT]], X0=Math.min(x0,x0+sk)-24, X1=Math.max(x1,x1+sk)+24;
  clipP(g,P,()=>{
    if(n===1){ const c=TB; R(g,X0,yT,X1-X0,H0,c[2]); for(let y=yT;y<yB;y+=2){ const o=sh(y); for(let k=0;k*30<X1-X0;k++){ const fx=X0+k*30+o+Math.sin(y*.07+k*1.7)*3; R(g,fx,y,4,2,c[1]); R(g,fx+4,y,4,2,c[3]); } }
      for(let i=0;i<3;i++){ const py=yT+8+hsh(s*3+i)*Math.max(1,H0-30), px=x0+20+hsh(s+i)*Math.max(1,x1-x0-70)+sh(py); R(g,px,py,30,18,pick([TG[2],'#b89a62',TOr[2]],hsh(s*5+i))); R(g,px,py,30,2,'#e8d8b0'); for(let k=0;k<30;k+=5) R(g,px+k,py+18,2,1,'#e8d8b0'); }
      shade(g,X0,yB-10,X1-X0,10,'#100820',.3); }
    else if(n===2){ const c=WDD; R(g,X0,yT,X1-X0,H0,c[5]); let r=0; for(let y=yB-11;y>yT-12;y-=10,r++){ const o=Math.round(sh(y+5)); for(let xx=X0+(r%2)*8-16;xx<X1;){ const sw=14+Math.floor(hsh(s+xx*.13+r)*6), v=hsh(s*3+xx*.7+r*1.3), b=v<.25?c[3]:v>.8?c[1]:c[2]; R(g,xx+o,y,sw-1,11,b); R(g,xx+o,y,1,11,mix(b,c[0],.35)); R(g,xx+o,y+9,sw-1,2,c[4]); if(v>.92) R(g,xx+o+2,y+3,sw-5,6,c[5]); xx+=sw; } } }
    else if(n===3){ const c=TE; R(g,X0,yT,X1-X0,H0,c[5]); let r=0; for(let y=yB-16;y>yT-18;y-=14,r++){ const o=sh(y+8); for(let xx=X0-16,i=0;xx<X1;xx+=12,i++){ const v=hsh(s+i*1.7+r*3.1), X=Math.round(xx+o);
        if(i%2===0){ R(g,X,y,12,16,c[3]); R(g,X+2,y,8,16,c[2]); R(g,X+4,y,3,16,v>.85?c[0]:c[1]); R(g,X,y+14,12,2,c[4]); } else { R(g,X,y+2,12,14,c[4]); R(g,X+3,y+2,6,14,c[3]); }
        if(v>.94) R(g,X+1,y+3,10,10,'#1a0e18'); if(v<.07) shade(g,X,y+8,12,6,'#3e5a34',.6); } } }
    else if(n===4){ const c=ZN; R(g,X0,yT,X1-X0,H0,c[3]); for(let y=yT;y<yB;y+=2){ const o=Math.round(sh(y)); for(let xx=X0;xx<X1;xx+=8){ R(g,xx+o,y,3,2,c[1]); R(g,xx+o+3,y,2,2,c[2]); R(g,xx+o+5,y,3,2,c[4]); } }
      for(let y=yB-40;y>yT;y-=40) R(g,X0,y,X1-X0,2,c[5]);
      for(let i=0;i<(x1-x0)/40;i++){ const ry=yT+hsh(s*3+i)*H0*.7, rx=x0+hsh(s+i)*(x1-x0)+sh(ry), rw=10+hsh(i*5)*26, rh=8+hsh(i*7)*24; g.save(); g.globalAlpha=.7; blob(g,rx,ry,rw,rh,RU[3]); blob(g,rx+2,ry+2,rw*.6,rh*.6,RU[2]); g.restore(); } }
    else { R(g,X0,yT,X1-X0,H0,LU[5]); let r=0; for(let y=yB-10;y>yT-10;y-=8,r++){ const o=sh(y+4); for(let xx=X0-16+(r%2)*7;xx<X1;xx+=14){ const v=hsh(s+xx*.3+r), X=Math.round(xx+o); ell(g,X+7,y+5,7,5,LU[5]); ell(g,X+7,y+4,6,4,v>.8?LU[1]:v<.3?LU[3]:LU[2]); R(g,X+3,y+1,6,1,mix(LU[1],'#a8a0d0',.3)); } } }
  });
  if(n===1){ for(let xx=x0;xx<x1;xx+=24) sag(g,xx,yB,Math.min(x1,xx+24),yB,5,TB[3],3); for(let xx=x0;xx<=x1;xx+=24) R(g,xx-1,yB-1,3,3,'#c8a868'); }
  else if(n===5){ gold(g,x0,yB-5,x1-x0,6); gold(g,x0+sk,yT-3,x1-x0,6); const mx=x0+sk+(x1-x0)/2; ell(g,mx,yT,8,8,GO[3]); ell(g,mx,yT,6,6,GO[4]); emit(g,G=>{ ell(G,mx,yT,4,4,'#ff4040'); R(G,mx-2,yT-2,2,2,'#ffc0b0'); }); lt(mx,yT,20,'#ff3030',.6,{gl:.4}); }
  else { const ec={2:WD,3:TE,4:ZN}[n]; R(g,x0-2,yB-4,x1-x0+4,5,ec[4]); R(g,x0-2,yB-4,x1-x0+4,1,ec[1]);
    if(n===3){ for(let xx=x0+sk;xx<x1+sk;xx+=14){ ell(g,xx+7,yT,8,5,TE[4]); ell(g,xx+7,yT-1,7,3,TE[1]); } } else { R(g,x0+sk-2,yT-3,x1-x0+4,5,ec[n===4?1:3]); R(g,x0+sk-2,yT-3,x1-x0+4,1,ec[0]); } }
}
// casa em 3/4: fachada + lateral direita recuada + água da frente do telhado + empena
function casa(g,x,yb,w,h,n,s,o={}){ const dp=o.dp??36, rh=o.rh??74, ov=o.ov??12, top=yb-h, dy=Math.round(dp*.5);
  const side=[[x+w,yb],[x+w+dp,yb-dy],[x+w+dp,top-dy],[x+w,top]];
  clipP(g,side,()=>{ panel(g,x+w,top-dy-30,dp+2,h+dy+40,n,s+5,false); shade(g,x+w,top-dy-30,dp+2,h+dy+40,'#120828',.45); });
  R(g,x+w,top,2,h,'#140a20');
  const apex=[x+w+ov*.4+dp/2,top-rh];
  clipP(g,[[x+w,top+2],[x+w+dp,top-dy+2],apex],()=>{ panel(g,x+w-2,top-rh-4,dp+6,rh+8,n,s+9,false); shade(g,x+w-2,top-rh-4,dp+6,rh+8,'#120828',.55); });
  panel(g,x,top,w,h,n,s);
  if(n>=2){ const pc={2:WDD,3:ST,4:BR,5:LU}[n]; R(g,x-2,yb-10,w+4,10,pc[3]); R(g,x-2,yb-10,w+4,2,pc[1]); R(g,x-2,yb-2,w+4,2,pc[5]); }
  shade(g,x,top,w,16,'#0a0418',.5); shade(g,x,top+16,w,8,'#0a0418',.25);
  roofBand(g,x-ov,x+w+ov*.4,top-rh,top+4,dp/2,n,s);
  const ve={1:TB,2:WD,3:TE,4:ZN,5:LU}[n]; line(g,apex[0],apex[1],x+w+dp+ov*.4,top-dy+4,ve[4],5); line(g,apex[0],apex[1]-2,x+w+dp+ov*.4,top-dy+2,ve[2],2);
  if(n===5) line(g,apex[0],apex[1]-2,x+w+dp+ov*.4,top-dy+2,GO[2],2);
  return top; }

/* ---------- janelas e portas ---------- */
function janela(g,x,y,w,h,n,s,lit,inside){ x=Math.round(x); y=Math.round(y);
  R(g,x-3,y-3,w+6,h+6,'#140a18');
  if(lit){ emit(g,G=>{ R(G,x,y,w,h,n===5?'#a01828':'#d8863a'); R(G,x,y+h*.5,w,h*.5,n===5?'#801020':'#b8622a'); R(G,x+3,y+3,Math.round(w*.42),Math.round(h*.35),n===5?'#ff6a5a':'#ffd890'); if(inside) inside(G); }); lt(x+w/2,y+h/2,Math.max(w,h)*1.7,n===5?'#ff4a3a':'#ffb860',.85,{gl:.3}); }
  else { R(g,x,y,w,h,'#1e1630'); R(g,x+2,y+2,w*.3,2,'#3a3458'); }
  if(n===1){ for(let k=0;k<w;k+=4) R(g,x+k,y-3-(k%8?1:2),3,2,ZN[3]); R(g,x,y,Math.round(w*.4),h,TG[3]); for(let yy=y;yy<y+h;yy+=6) R(g,x+Math.round(w*.4)-2,yy,2,3,TG[4]); sag(g,x-4,y+2,x+w+4,y+2,2,'#c8a868',2); }
  else if(n===2){ R(g,x-4,y-4,w+8,4,WD[1]); R(g,x-4,y+h,w+8,5,WD[2]); R(g,x-4,y+h+4,w+8,1,WD[4]); R(g,x-4,y,4,h,WD[3]); R(g,x+w,y,4,h,WD[3]); R(g,x+w/2-1,y,3,h,WD[3]); R(g,x,y+h/2-1,w,3,WD[3]); }
  else if(n===3){ R(g,x-10,y-10,w+20,8,ST[2]); R(g,x-10,y-10,w+20,2,ST[1]); R(g,x-10,y-3,w+20,1,ST[4]); R(g,x-8,y+h,w+16,7,ST[1]); R(g,x-8,y+h+6,w+16,2,ST[4]);
    clipR(g,x-3-w*.45,y-2,w*.45,h+4,()=>boardsV(g,x-3-w*.45,y-2,w*.45,h+4,SH,s+3,8)); clipR(g,x+w+3,y-2,w*.45,h+4,()=>boardsV(g,x+w+3,y-2,w*.45,h+4,SH,s+7,8)); R(g,x+w/2-1,y,3,h,'#3a2a24'); R(g,x,y+h/2-1,w,2,'#3a2a24'); }
  else if(n===4){ R(g,x-4,y-4,w+8,4,MT[1]); R(g,x-4,y+h,w+8,5,MT[2]); R(g,x-4,y,4,h,MT[3]); R(g,x+w,y,4,h,MT[3]); for(let xx=x+6;xx<x+w-2;xx+=8){ R(g,xx,y,2,h,MT[3]); R(g,xx,y,1,h,MT[1]); } }
  else { gold(g,x-5,y-5,w+10,5); gold(g,x-5,y+h,w+10,5); R(g,x-5,y,5,h,GO[3]); R(g,x+w,y,5,h,GO[3]); R(g,x+w/2-1,y,3,h,GO[3]); R(g,x,y+h*.45,w,3,GO[3]); poly(g,[[x-5,y-5],[x+w/2,y-20],[x+w+5,y-5]],GO[3]); poly(g,[[x,y-6],[x+w/2,y-16],[x+w,y-6]],LU[4]); } }
function porta(g,x,yb,w,h,n,s){ x=Math.round(x); const y=yb-h;
  if(n===1){ R(g,x,y,w,h,'#120a14'); clipR(g,x,y,w*.55,h,()=>tarp(g,x,y,w*.55,h,TB,s)); R(g,x+w*.55-3,y,3,h,TB[4]); sag(g,x-6,y+4,x+w+6,y+4,3,'#c8a868',2); return; }
  if(n===2){ R(g,x-5,y-6,w+10,h+6,WD[4]); R(g,x-5,y-6,w+10,3,WD[1]); clipR(g,x,y,w,h,()=>boardsV(g,x,y,w,h,WDD,s,12)); const c=WD[1]; line(g,x+4,y+14,x+w-4,y+14,c,5); line(g,x+4,y+h-16,x+w-4,y+h-16,c,5); line(g,x+6,y+h-16,x+w-6,y+16,c,4); R(g,x+w-12,y+h/2,5,5,MT[1]); return; }
  if(n===3){ R(g,x-12,y-14,w+24,h+14,ST[4]); clipR(g,x-12,y-14,w+24,14,()=>stoneWall(g,x-12,y-14,w+24,14,ST,s+1,false)); R(g,x-12,y-14,8,h+14,ST[2]); R(g,x+w+4,y-14,8,h+14,ST[3]); clipR(g,x,y,w,h,()=>boardsV(g,x,y,w,h,WDD,s,10)); for(const yy of [y+16,y+h-24]){ R(g,x,yy,w*.6,5,'#2a2430'); R(g,x,yy,w*.6,1,MT[1]); R(g,x+w*.6-4,yy-2,6,9,'#2a2430'); } ell(g,x+w-12,y+h/2,4,4,GO[3]); return; }
  if(n===4){ R(g,x-5,y-6,w+10,h+6,MT[4]); R(g,x,y,w,h,MT[2]); R(g,x,y,4,h,MT[1]); R(g,x+w-4,y,4,h,MT[3]); for(let yy=y+8;yy<yb-4;yy+=22){ R(g,x+4,yy,w-8,2,MT[3]); for(let xx=x+6;xx<x+w-4;xx+=8) R(g,xx,yy+5,2,2,MT[0]); } R(g,x+w-14,y+h/2,8,4,MT[0]); R(g,x+8,y+20,w-16,16,'#1a1424'); for(let xx=x+10;xx<x+w-8;xx+=5) R(g,xx,y+20,2,16,MT[3]); return; }
  R(g,x-8,y-8,w+16,h+8,GO[4]); gold(g,x-8,y-8,w+16,6); R(g,x-8,y-2,6,h+2,GO[2]); R(g,x+w+2,y-2,6,h+2,GO[3]); R(g,x,y,w,h,LU[3]); for(let yy=y+4;yy<yb;yy+=14) R(g,x,yy,w,2,LU[4]);
  const mx=x+w/2, my=y+h*.35; ell(g,mx,my,13,13,GO[3]); emit(g,G=>{ ell(G,mx,my,10,10,'#e0283a'); ell(G,mx+4,my-2,8,8,LU[3]); R(G,mx-7,my-3,3,3,'#ff9a8a'); }); lt(mx,my,30,'#ff3030',.6,{p:1,gl:.4}); }

/* ---------- objetos ---------- */
function sombra(g,cx,yb,rx,ry){ ell(g,cx,yb,rx,ry||Math.max(3,rx*.16),'rgba(8,4,18,.55)'); }
function barril(g,x,yb,c,s,w,h){ w=w||34; h=h||48; sombra(g,x+w/2,yb,w*.7);
  for(let i=0;i<w;i++){ const u=i/w; R(g,x+i,yb-h,1,h,u<.12?c[1]:Math.abs(u-.28)<.06?c[0]:u<.55?c[2]:u<.82?c[3]:c[4]); }
  for(const yy of [yb-h+6,yb-h/2-2,yb-10]){ R(g,x,yy,w,4,MT[4]); R(g,x+2,yy,w*.4,1,MT[1]); }
  ell(g,x+w/2,yb-h,w/2,5,c[1]); ell(g,x+w/2,yb-h,w/2-3,3,c[4]); if(hsh(s)>.5){ g.save(); g.globalAlpha=.6; R(g,x+w*.6,yb-h+10,4,h*.5,RU[3]); g.restore(); } R(g,x,yb-2,w,2,c[5]); }
function caixote(g,x,yb,w,h,s,c){ c=c||WD; const d=Math.round(Math.min(10,w*.2)); sombra(g,x+w/2+d/2,yb,w*.65);
  poly(g,[[x,yb-h],[x+d,yb-h-d],[x+w+d,yb-h-d],[x+w,yb-h]],c[1]); for(let k=x+4;k<x+w;k+=10) line(g,k,yb-h,k+d,yb-h-d,c[2]);
  poly(g,[[x+w,yb],[x+w+d,yb-d],[x+w+d,yb-h-d],[x+w,yb-h]],c[4]);
  clipR(g,x,yb-h,w,h,()=>boardsH(g,x,yb-h,w,h,c,s,Math.max(8,Math.round(h/4))));
  R(g,x,yb-h,4,h,c[3]); R(g,x+w-4,yb-h,4,h,c[3]); R(g,x,yb-h,w,3,c[3]); R(g,x,yb-3,w,3,c[4]); line(g,x+4,yb-4,x+w-4,yb-h+4,c[3],3); R(g,x,yb-h,w,1,c[0]); }
function pneus(g,cx,yb,r,n){ for(let k=0;k<n;k++){ const y=yb-8-k*13; ell(g,cx,y+2,r+1,r*.38+2,'#0e0a12'); ell(g,cx,y,r,r*.38,'#2a2632'); ell(g,cx,y-1,r-2,r*.3,'#3a3644'); ell(g,cx,y,r*.55,r*.18,'#141018'); R(g,cx-r,y+2,r*2,9,'#24202c'); for(let xx=cx-r+3;xx<cx+r-2;xx+=5) R(g,xx,y+4,2,5,'#3a3644'); R(g,cx-r*.7,y-r*.3,r*.5,1,'#5a5668'); } }
function saco(g,x,y,w,h,s){ const c=rmp(hsh(s)>.5?'#b8a070':'#a89060'); ell(g,x+w/2,y+h/2+1,w/2+1,h/2+1,'#1a1220'); ell(g,x+w/2,y+h/2,w/2,h/2,c[2]); ell(g,x+w/2-w*.12,y+h*.38,w*.3,h*.22,c[1]); R(g,x+4,y+h*.7,w-8,1,c[3]); R(g,x+w-5,y+h*.3,3,h*.4,c[4]); }
function lampiao(g,x,y,big){ const k=big?1.3:1; line(g,x,y-14*k,x,y,'#2a2030',2); R(g,x-6*k,y,12*k,4,MT[3]); R(g,x-5*k,y+4,10*k,14*k,'#2a2030');
  emit(g,G=>{ R(G,x-4*k,y+5,8*k,12*k,'#ffc860'); R(G,x-2*k,y+7,3*k,8*k,'#fff4d0'); }); R(g,x-6*k,y+18*k,12*k,4,MT[3]); lt(x,y+10*k,95*k,'#ffb860',1,{gl:.6,fl:1}); }
function lampada(g,x,y){ R(g,x-1,y-10,2,10,'#1a1220'); R(g,x-4,y,8,4,MT[3]); emit(g,G=>{ ell(G,x,y+8,5,6,'#ffe8a0'); R(G,x-2,y+5,2,4,'#ffffff'); }); lt(x,y+8,80,'#ffd890',.95,{gl:.6}); }
function bandeira(g,x,y,n,s,h){ h=h||110; R(g,x-2,y,4,h,n===5?GO[3]:BK[2]); R(g,x-2,y,1,h,n===5?GO[1]:BK[1]); if(n===5) ell(g,x,y-2,4,4,GO[1]);
  const fc=n===5?RD:rmp(pick(['#c83a3a','#3a7ae0','#e8c44a'],hsh(s))); for(let k=0;k<44;k+=2){ const o=Math.round(Math.sin(k*.15+s)*4); R(g,x+2+k,y+4+o,2,30,k%8<4?fc[2]:fc[3]); R(g,x+2+k,y+4+o,2,2,fc[1]); R(g,x+2+k,y+32+o,2,2,fc[4]); }
  if(n===5){ ell(g,x+24,y+19,8,8,GO[1]); ell(g,x+28,y+17,7,7,fc[2]); } else if(hsh(s*3)>.4){ R(g,x+14,y+14,14,4,'#e8e0cc'); R(g,x+19,y+9,4,14,'#e8e0cc'); } }
function placa(g,x,y,txt,bg,fg,sc){ sc=sc||2; const w=tw(txt,sc)+12, h=7*sc+10, b=rmp(bg); R(g,x-1,y-1,w+2,h+2,'#1a1022'); R(g,x,y,w,h,b[2]); R(g,x,y,w,2,b[1]); R(g,x,y+h-2,w,2,b[4]); R(g,x+w-2,y,2,h,b[3]); text(g,txt,x+6+1,y+5+1,sc,b[5]); text(g,txt,x+6,y+5,sc,fg); return w; }
function galao(g,x,yb,col){ const c=rmp(col||'#c83a2a'); R(g,x,yb-30,24,30,c[2]); R(g,x,yb-30,5,30,c[1]); R(g,x+18,yb-30,6,30,c[4]); R(g,x+4,yb-36,8,6,c[3]); R(g,x+14,yb-36,8,4,c[2]); R(g,x+3,yb-22,18,2,c[3]); R(g,x+3,yb-12,18,2,c[3]); R(g,x,yb-2,24,2,c[5]); }
function balde(g,x,yb,c){ c=c||ZN; poly(g,[[x,yb-22],[x+22,yb-22],[x+19,yb],[x+3,yb]],c[2]); R(g,x+2,yb-22,4,22,c[1]); R(g,x+16,yb-22,4,22,c[4]); ell(g,x+11,yb-22,11,3,c[3]); ell(g,x+11,yb-22,9,2,'#2a4a6a'); sag(g,x,yb-22,x+22,yb-22,-12,c[4],1); }
function roupa(g,x,y,col,t){ const c=rmp(col); if(t===0){ R(g,x,y,26,8,c[2]); R(g,x-6,y,6,14,c[2]); R(g,x+26,y,6,14,c[2]); R(g,x+3,y+8,20,22,c[2]); R(g,x+3,y,4,30,c[1]); R(g,x+19,y,4,30,c[3]); R(g,x+10,y,6,3,c[4]); }
  else if(t===1){ R(g,x,y,22,8,c[2]); R(g,x,y+8,9,30,c[2]); R(g,x+13,y+8,9,30,c[2]); R(g,x,y,3,38,c[1]); R(g,x+19,y,3,38,c[3]); R(g,x,y,22,2,c[4]); }
  else { R(g,x,y,30,40,c[2]); for(let k=0;k<30;k+=6) R(g,x+k,y,3,40,c[1]); R(g,x,y+36,30,4,c[3]); R(g,x+26,y,4,40,c[3]); } R(g,x+4,y-2,2,4,'#d8c8a0'); }
function varal(g,x0,x1,y,s){ sag(g,x0,y,x1,y,10,'#2a2030',1,(px,py,i)=>{ if(i>6&&i%34===8&&px<x1-30){ roupa(g,px,py,pick(CLOTH,hsh(s+i*.37)),Math.floor(hsh(s*3+i)*3)); } }); }
function rock(g,x,y,w,h,c){ blob(g,x,y,w,h,c[4]); blob(g,x,y,w-1,h-2,c[2]); blob(g,x+1,y,Math.max(2,w*.55),Math.max(2,h*.5),c[1]); R(g,x+2,y+1,Math.max(1,w*.2),1,c[0]); }
function ferramentas(g,x,y,n){ const ms=MT; [[0,'mart'],[22,'serr'],[40,'chave'],[58,'alic'],[76,'mart2']].slice(0,n||5).forEach(([dx,t])=>{ const X=x+dx; R(g,X+4,y-2,3,3,'#2a2030');
    if(t==='mart'||t==='mart2'){ R(g,X+4,y,3,30,WD[2]); R(g,X+4,y,1,30,WD[1]); R(g,X-2,y+26,15,7,ms[2]); R(g,X-2,y+26,15,2,ms[0]); }
    else if(t==='serr'){ poly(g,[[X,y+2],[X+12,y+2],[X+10,y+40],[X+2,y+40]],ms[1]); for(let k=y+6;k<y+40;k+=3) R(g,X+9,k,3,1,ms[3]); R(g,X,y,12,8,WD[2]); }
    else if(t==='chave'){ R(g,X+4,y,3,34,ms[1]); ell(g,X+5,y+3,5,4,ms[2]); ell(g,X+5,y+3,2,2,'#1a1220'); }
    else { line(g,X+2,y,X+8,y+28,ms[1],3); line(g,X+10,y,X+4,y+28,ms[2],3); R(g,X,y+26,4,10,'#c83a2a'); R(g,X+8,y+26,4,10,'#c83a2a'); } }); }
function braseiro(g,x,yb,red,k){ k=k||1; if(k!==1){ g.save(); g.translate(x,yb); g.scale(k,k); g.translate(-x,-yb); } const c=red?LU:MT; R(g,x-3,yb-26,6,26,c[3]); poly(g,[[x-22,yb-40],[x+22,yb-40],[x+14,yb-24],[x-14,yb-24]],c[2]); R(g,x-22,yb-42,44,4,red?GO[2]:c[1]); R(g,x-14,yb-2,28,3,c[4]);
  emit(g,G=>{ const P=red?['#a8182a','#ff4040','#ffb0a0']:['#d8461a','#ffa030','#fff0b0']; poly(G,[[x-16,yb-42],[x-8,yb-66],[x,yb-50],[x+6,yb-74],[x+16,yb-42]],P[0]); poly(G,[[x-10,yb-42],[x-4,yb-58],[x+2,yb-46],[x+6,yb-62],[x+11,yb-42]],P[1]); poly(G,[[x-5,yb-42],[x+1,yb-52],[x+6,yb-42]],P[2]); });
  lt(x,yb-54*k,120*k,red?'#ff3a2a':'#ffa040',1,{gl:.7,fl:1}); if(k!==1) g.restore(); }
function motor(g,x,yb,s){ const c=SCR; R(g,x,yb-58,96,58,c[4]); R(g,x+2,yb-56,92,54,c[2]); R(g,x+2,yb-56,92,3,c[0]); for(let k=x+8;k<x+60;k+=6){ R(g,k,yb-48,3,36,c[1]); R(g,k+3,yb-48,2,36,c[4]); }
  R(g,x+64,yb-50,26,26,'#1e1a24'); ell(g,x+77,yb-37,11,11,c[3]); ell(g,x+77,yb-37,6,6,c[1]); line(g,x+77,yb-37,x+86,yb-30,c[0],2);
  const tk=rmp('#c8382a'); R(g,x+6,yb-76,70,20,tk[2]); R(g,x+6,yb-76,70,4,tk[1]); R(g,x+6,yb-60,70,4,tk[4]); R(g,x+60,yb-82,10,6,MT[2]); text(g,'GAS',x+14,yb-71,1,'#f0e0c0');
  R(g,x+64,yb-18,24,6,RU[3]); R(g,x,yb-6,96,6,c[5]); }

/* =====================================================================
   ESTRUTURAS — cada f(g,n,cx,gy) desenha em px de alta resolução (gy = linha do chão)
   ===================================================================== */
const DRAW={};
DRAW.barraca={w:220,h:150,sw:.42,f(g,n,cx,gy){ const s=11;
  if(n===1){ const L=cx-200, Rr=cx+110, ap=[cx-46,gy-236], bk=[cx+34,gy-262], rr=[cx+190,gy-30];
    clipP(g,[[Rr,gy],ap,bk,rr],()=>{ tarp(g,cx-60,gy-270,270,275,TG,s+2); shade(g,cx-60,gy-270,270,275,'#140a28',.4); });
    const a1=lerp(ap,[Rr,gy],.5), a2=lerp(bk,rr,.5);
    clipP(g,[[ap[0]-6,ap[1]-6],[bk[0]+6,bk[1]-6],[a2[0]+8,a2[1]],[a1[0]+8,a1[1]]],()=>{ tarp(g,cx-70,gy-280,280,200,TB,s+5); shade(g,cx-70,gy-280,280,200,'#140a28',.25); });
    clipP(g,[[L,gy],ap,[Rr,gy]],()=>tarp(g,L,gy-240,Rr-L,242,TG,s));
    clipP(g,[[ap[0]-6,ap[1]-8],[cx-110,gy-118],[cx-92,gy-104],[ap[0]+4,ap[1]+10]],()=>tarp(g,cx-130,gy-250,100,150,TB,s+8));
    poly(g,[[cx-100,gy],[cx-46,gy-140],[cx+8,gy]],'#120810'); poly(g,[[cx-46,gy-140],[cx+8,gy],[cx+24,gy],[cx-40,gy-150]],TG[1]); line(g,cx-44,gy-146,cx+18,gy,TG[3],3);
    R(g,cx-86,gy-20,100,16,'#e0d4b0'); for(let k=0;k<100;k+=10) R(g,cx-86+k,gy-20,5,16,'#c0443a'); R(g,cx-86,gy-6,100,2,'#8a7a62'); R(g,cx-80,gy-30,26,12,'#f0ece0'); R(g,cx-80,gy-20,26,2,'#b8b0a0');
    line(g,ap[0],ap[1],L-50,gy-4,'#c8a868',1); line(g,bk[0],bk[1],cx+250,gy-24,'#c8a868',1); R(g,L-52,gy-16,4,16,BK[2]); R(g,cx+248,gy-34,4,20,BK[2]);
    sag(g,L-30,gy-120,ap[0]-4,ap[1]+30,14,'#2a2030',1); R(g,L-32,gy-124,4,124,BK[2]); roupa(g,L-6,gy-122,CLOTH[2],0); roupa(g,L+36,gy-140,CLOTH[1],1);
    caixote(g,cx+120,gy,44,32,s+3); rock(g,cx+60,gy-10,14,10,ST); rock(g,cx+84,gy-9,12,9,ST); R(g,cx+64,gy-28,22,16,'#3a3640'); R(g,cx+64,gy-28,22,3,'#6a6670'); galao(g,cx+180,gy,'#3a7ae0'); return; }
  const x0=cx-206, w=300, h=n>=3?170:150; const top=casa(g,x0,gy,w,h,n,s,{dp:40,rh:n===5?96:84});
  const dx=x0+28, dw=62, dh=132; porta(g,dx,gy-4,dw,dh,n,s);
  const wx=x0+150, wy=top+36; janela(g,wx,wy,86,58,n,s,true,G=>{ if(n===3){ R(G,wx+6,wy+34,74,14,'#b8433a'); R(G,wx+6,wy+28,22,10,'#f0e8d8'); } if(n===4){ R(G,wx+4,wy+18,78,4,MT[2]); R(G,wx+4,wy+42,78,4,MT[2]); R(G,wx+6,wy+10,70,8,'#d8c8a0'); R(G,wx+6,wy+34,70,8,'#8ab0d8'); } if(n===5){ R(G,wx+6,wy+36,74,12,'#8a1020'); } });
  if(n===2){ for(const px of [cx-272,cx-216]){ R(g,px,gy-120,8,120,WD[2]); R(g,px,gy-120,2,120,WD[1]); R(g,px+6,gy-120,2,120,WD[4]); } roofBand(g,cx-282,x0+4,gy-150,gy-118,10,2,s+4);
    sag(g,cx-262,gy-92,cx-214,gy-92,16,'#2a2030',1); for(let k=0;k<48;k+=2){ const yy=Math.round(gy-92+Math.sin(k/48*Math.PI)*16); R(g,cx-262+k,yy-2,2,10,k%8<4?'#c83a3a':'#e8c44a'); }
    caixote(g,x0+w+50,gy,40,30,s+9); lampiao(g,x0+12,top+10); }
  if(n===3){ const chx=x0+220; clipR(g,chx,top-130,34,92,()=>stoneWall(g,chx,top-130,34,92,ST,s+3,false)); R(g,chx-4,top-136,42,8,ST[1]); R(g,chx-4,top-130,42,2,ST[4]);
    R(g,wx-6,wy+66,98,10,WD[3]); for(let k=0;k<6;k++){ ell(g,wx+4+k*16,wy+64,6,5,LEAF[2]); R(g,wx+2+k*16,wy+60,3,3,pick(['#e84a5a','#f0d040','#e8e0f0'],hsh(k))); }
    R(g,x0+w+48,gy-28,56,8,WD[2]); R(g,x0+w+52,gy-20,6,20,WD[3]); R(g,x0+w+94,gy-20,6,20,WD[3]); balde(g,x0+w+60,gy-28); lampiao(g,x0+12,top+12); }
  if(n===4){ const tx=x0+196, ty=top-150; for(const lx of [tx+6,tx+70]) R(g,lx,ty+60,5,60,MT[3]); R(g,tx,ty+56,82,6,MT[2]);
    for(let i=0;i<80;i++){ const u=i/80; R(g,tx+1+i,ty,1,56,u<.15?ZN[1]:u<.55?ZN[2]:u<.85?ZN[3]:ZN[4]); } ell(g,tx+41,ty,40,7,ZN[1]); ell(g,tx+41,ty,30,4,ZN[3]); for(const yy of [ty+14,ty+38]) R(g,tx+1,yy,80,3,MT[4]);
    lampada(g,dx+dw/2,gy-dh-22); sag(g,x0+w+40,gy-108,cx+272,gy-112,12,'#2a2030',1,(px,py,i)=>{ if(i%26===6&&i<90) roupa(g,px,py,pick(CLOTH,hsh(i)),i%3); }); R(g,cx+270,gy-118,4,118,MT[3]); }
  if(n===5){ bandeira(g,cx+250,gy-200,5,s,200); braseiro(g,cx+196,gy,true); runa(g,x0+120,top+70,1.1); }
}};
DRAW.gerador={w:120,h:130,sw:.4,smoke:[0,[30,-22],[30,-80],[30,-56],[30,-102],[30,-92]],f(g,n,cx,gy){ const s=21;
  const ex=cx+75, eh=[0,40,110,190,200,190][n]; // escapamento
  if(n===1){ boardsH(g,cx-120,gy-14,180,14,WD,s,7); motor(g,cx-100,gy-14,s); line(g,cx-6,gy-60,cx+40,gy-30,'#1e1a24',3); line(g,cx-4,gy-50,cx+70,gy-8,'#c83a2a',2); line(g,cx+10,gy-40,cx+90,gy-4,'#3a6ad8',2);
    sag(g,cx-120,gy-30,cx+60,gy-24,8,'#c8a868',2); R(g,ex-6,gy-14-eh,10,eh,MT[2]); R(g,ex-6,gy-14-eh,3,eh,MT[0]); galao(g,cx+80,gy,'#c83a2a'); galao(g,cx+108,gy,'#c83a2a'); clipR(g,cx-130,gy-78,60,40,()=>tarp(g,cx-130,gy-78,60,40,TB,s)); return; }
  if(n===2){ const top=casa(g,cx-120,gy,170,140,2,s,{dp:30,rh:44}); R(g,cx-100,top+20,130,gy-top-30,'#120a14'); motor(g,cx-88,gy-10,s); lampiao(g,cx-110,top+12);
    R(g,ex-6,top-60,10,eh-20,MT[2]); R(g,ex-6,top-60,3,eh-20,MT[0]); R(g,ex-10,top-64,18,6,MT[3]); galao(g,cx+90,gy,'#c83a2a'); return; }
  if(n===3){ clipR(g,cx-130,gy-30,200,30,()=>stoneWall(g,cx-130,gy-30,200,30,ST,s,false)); clipR(g,cx-130,gy-100,40,70,()=>stoneWall(g,cx-130,gy-100,40,70,ST,s+3,false)); clipR(g,cx+30,gy-100,40,70,()=>stoneWall(g,cx+30,gy-100,40,70,ST,s+5,false));
    roofBand(g,cx-140,cx+76,gy-136,gy-98,12,3,s); motor(g,cx-84,gy-30,s); R(g,ex-6,gy-30-eh,12,eh,'#3a3440'); R(g,ex-6,gy-30-eh,3,eh,'#7a7488'); for(let yy=gy-30-eh+10;yy<gy-40;yy+=26) R(g,ex-9,yy,18,4,'#2a2430'); galao(g,cx+92,gy,'#c83a2a'); return; }
  const lun=n===5, top=gy-170;
  if(!lun){ clipR(g,cx-128,gy-34,236,34,()=>brickWall(g,cx-128,gy-34,236,34,s)); R(g,cx-120,top,206,gy-34-top,MT[3]); R(g,cx-118,top+2,202,gy-38-top,MT[2]); R(g,cx-118,top+2,202,3,MT[0]); R(g,cx-118,top+2,4,gy-38-top,MT[1]); R(g,cx+78,top+2,6,gy-38-top,MT[4]);
    for(let yy=top+20;yy<gy-40;yy+=22){ R(g,cx-118,yy,202,2,MT[3]); for(let xx=cx-112;xx<cx+80;xx+=10) R(g,xx,yy+4,2,2,MT[0]); }
    R(g,cx+12,top+20,60,40,'#1a1424'); for(const [dx,dy] of [[22,32],[48,32]]){ ell(g,cx+dx,top+dy,10,10,'#e8e0cc'); ell(g,cx+dx,top+dy,8,8,'#f8f4e8'); line(g,cx+dx,top+dy,cx+dx+5,top+dy-5,'#c83a2a',1); }
    emit(g,G=>{ R(G,cx+18,top+48,6,6,'#6fdc7a'); R(G,cx+30,top+48,6,6,'#ffcc3a'); R(G,cx+42,top+48,6,6,'#ff4a3a'); }); lt(cx+36,top+50,30,'#a0ff90',.5,{gl:.3});
    motor(g,cx-104,gy-34,s); barril(g,cx+96,gy,MT,s,36,60); lampada(g,cx-90,top-12); lampada(g,cx+50,top-12);
    R(g,ex-6,top-80,12,100,MT[2]); R(g,ex-6,top-80,3,100,MT[0]); R(g,ex-10,top-84,20,6,MT[3]); return; }
  clipR(g,cx-128,gy-34,236,34,()=>lunarWall(g,cx-128,gy-34,236,34,s,false)); R(g,cx-118,top,200,gy-34-top,LU[4]); clipR(g,cx-116,top+2,196,gy-38-top,()=>lunarWall(g,cx-116,top+2,196,gy-38-top,s+4,false)); gold(g,cx-122,top-4,208,8); R(g,cx-122,top,6,gy-34-top,GO[3]); R(g,cx+80,top,6,gy-34-top,GO[3]);
  const kx=cx+30, ky=top+60; ell(g,kx,ky,30,30,GO[3]); ell(g,kx,ky,26,26,GO[4]); emit(g,G=>{ ell(G,kx,ky,22,22,'#c01828'); ell(G,kx,ky,15,15,'#ff3a3a'); ell(G,kx-3,ky-3,8,8,'#ffb0a0'); poly(G,[[kx,ky-34],[kx+8,ky-22],[kx,ky-16],[kx-8,ky-22]],'#ff8a9a'); }); lt(kx,ky,70,'#ff3030',1,{p:1,gl:.7});
  runa(g,cx-80,top+70,1); motor(g,cx-104,gy-34,s); R(g,ex-6,top-60,12,80,GO[3]); R(g,ex-6,top-60,3,80,GO[1]); poly(g,[[cx+110,gy],[cx+118,gy-40],[cx+126,gy]],'#ff4a5a'); }};
DRAW.barricada={w:130,h:70,sw:.45,f(g,n,cx,gy){ const s=31;
  if(n===1){ pneus(g,cx-110,gy,24,3); clipR(g,cx-70,gy-104,62,104,()=>{ R(g,cx-70,gy-104,62,104,'#e0dcd0'); R(g,cx-70,gy-104,62,4,'#f8f6f0'); R(g,cx-14,gy-104,6,104,'#a8a49c'); R(g,cx-62,gy-90,6,30,'#8a8a92'); g.save(); g.globalAlpha=.5; R(g,cx-70,gy-40,62,40,RU[3]); g.restore(); });
    corrugated(g,cx-4,gy-80,70,80,RU,s,.6); clipR(g,cx+60,gy-62,64,62,()=>{ for(let xx=cx+60;xx<cx+124;xx+=8) R(g,xx,gy-62,2,52,ZN[1]); for(let yy=gy-62;yy<gy-10;yy+=8) R(g,cx+60,yy,64,2,ZN[1]); R(g,cx+60,gy-62,64,3,'#c83a2a'); }); ell(g,cx+70,gy-6,7,7,'#1e1a24'); ell(g,cx+114,gy-6,7,7,'#1e1a24');
    sag(g,cx-130,gy-60,cx+126,gy-56,10,'#c8a868',2); for(let k=0;k<5;k++) line(g,cx-80+k*40,gy-100,cx-70+k*40,gy-130,'#4a4252',2); return; }
  if(n===2){ for(let k=0;k<4;k++){ const x=cx-120+k*64; line(g,x,gy,x+60,gy-112,WD[4],12); line(g,x+1,gy-2,x+59,gy-112,WD[2],8); line(g,x+60,gy,x,gy-112,WD[3],12); line(g,x+59,gy-2,x+1,gy-112,WD[1],8); for(const [px,py] of [[x+60,gy-112],[x,gy-112]]) poly(g,[[px-6,py+2],[px,py-12],[px+6,py+2]],WD[1]); }
    clipR(g,cx-130,gy-74,260,16,()=>boardsH(g,cx-130,gy-74,260,16,WD,s,16)); clipR(g,cx-130,gy-40,260,16,()=>boardsH(g,cx-130,gy-40,260,16,WDD,s+3,16)); return; }
  if(n===3){ for(let r=0;r<3;r++) for(let k=0;k<6-r;k++) saco(g,cx-118+k*40+r*20,gy-28-r*25,42,28,s+r*7+k); clipR(g,cx-150,gy-70,34,70,()=>stoneWall(g,cx-150,gy-70,34,70,ST,s,false)); clipR(g,cx+116,gy-70,34,70,()=>stoneWall(g,cx+116,gy-70,34,70,ST,s+4,false)); clipR(g,cx-30,gy-110,60,28,()=>stoneWall(g,cx-30,gy-110,60,28,ST,s+8,false)); return; }
  if(n===4){ R(g,cx-130,gy-100,260,100,MT[4]); clipR(g,cx-128,gy-98,256,96,()=>corrugated(g,cx-128,gy-98,256,96,ZN,s,.2)); for(let k=0;k<256;k+=28){ poly(g,[[cx-128+k,gy-74],[cx-114+k,gy-74],[cx-128+k+28,gy-58],[cx-142+k+28,gy-58]],'#e8c44a'); } clipR(g,cx-128,gy-76,256,20,()=>{ for(let k=-30;k<290;k+=28) poly(g,[[cx-128+k+14,gy-76],[cx-128+k+28,gy-76],[cx-128+k+48,gy-56],[cx-128+k+34,gy-56]],'#1a1a22'); });
    for(let k=0;k<256;k+=14){ R(g,cx-126+k,gy-94,3,3,MT[0]); R(g,cx-126+k,gy-10,3,3,MT[0]); }
    for(let k=0;k<12;k++){ const x=cx-124+k*22; for(let a=0;a<24;a++){ const t=a/24*Math.PI*2; R(g,x+11+Math.cos(t)*11,gy-114+Math.sin(t)*10,2,2,'#a8a8b4'); } R(g,x+4,gy-124,2,4,'#e0e0e8'); R(g,x+16,gy-104,2,4,'#e0e0e8'); }
    placa(g,cx+60,gy-160,'PERIGO','#e8c44a','#1a1a22',2); return; }
  clipR(g,cx-130,gy-92,260,92,()=>lunarWall(g,cx-130,gy-92,260,92,s,true)); for(let k=0;k<5;k++){ const x=cx-110+k*55; poly(g,[[x-10,gy-92],[x+10,gy-92],[x,gy-136]],GO[3]); poly(g,[[x-6,gy-92],[x+1,gy-92],[x,gy-130]],GO[1]); } }};
DRAW.serralheria={w:250,h:160,sw:.45,f(g,n,cx,gy){ const s=41, x0=cx-280, x1=cx+250, top=gy-210;
  // parede do fundo (interior escuro)
  panel(g,x0+20,top,x1-x0-40,210,n,s); shade(g,x0+20,top,x1-x0-40,210,'#0a0414',.55);
  ferramentas(g,cx-30,top+40,5); if(n>=3) ferramentas(g,cx+70,top+40,3);
  // pilares
  const pc={1:BK,2:WD,3:ST,4:BR,5:LU}[n];
  for(const px of [x0+10,x1-30]){ if(n===1){ line(g,px+10,gy,px+6,top-10,BK[4],9); line(g,px+10,gy,px+6,top-10,BK[2],5); }
    else if(n===3) clipR(g,px,top,24,gy-top,()=>stoneWall(g,px,top,24,gy-top,ST,s+px,false)); else if(n===4) clipR(g,px,top,24,gy-top,()=>brickWall(g,px,top,24,gy-top,s+px)); else if(n===5){ clipR(g,px,top,24,gy-top,()=>lunarWall(g,px,top,24,gy-top,s,false)); R(g,px,top,3,gy-top,GO[2]); }
    else { R(g,px,top,22,gy-top,pc[2]); R(g,px,top,4,gy-top,pc[1]); R(g,px+17,top,5,gy-top,pc[4]); } }
  roofBand(g,x0-10,x1+10,top-60,top+6,14,n,s);
  // forja
  const fx=x0+70, fb=gy;
  if(n===1){ barril(g,fx-30,fb,RU,s,60,70); R(g,fx-30,fb-74,60,8,'#1a1214'); }
  else { const fc={2:rmp('#9a5a3a'),3:ST,4:BR,5:LU}[n]; clipR(g,fx-40,fb-80,90,80,()=>{ if(n===3) stoneWall(g,fx-40,fb-80,90,80,ST,s+2,false); else if(n===4) brickWall(g,fx-40,fb-80,90,80,s+2); else if(n===5) lunarWall(g,fx-40,fb-80,90,80,s+2,false); else { R(g,fx-40,fb-80,90,80,fc[2]); for(let i=0;i<9;i++) blob(g,fx-38+hsh(i)*80,fb-78+hsh(i*3)*70,12,8,i%2?fc[1]:fc[3]); } });
    R(g,fx-44,fb-84,98,6,fc[1]); const chw=30; if(n===3) clipR(g,fx-10,top-80,chw,fb-84-top+80,()=>stoneWall(g,fx-10,top-80,chw,fb-84-top+80,ST,s+9,false)); else if(n===4) clipR(g,fx-10,top-80,chw,fb-84-top+80,()=>brickWall(g,fx-10,top-80,chw,fb-84-top+80,s+9)); else if(n===5){ R(g,fx-10,top-80,chw,fb-4-top,LU[3]); R(g,fx-10,top-80,4,fb-4-top,GO[2]); } else { R(g,fx-6,top-70,20,fb-84-top+70,'#3a3440'); R(g,fx-6,top-70,4,fb-84-top+70,'#6a6478'); }
    if(n===2){ poly(g,[[fx+50,fb-60],[fx+90,fb-70],[fx+90,fb-46],[fx+50,fb-52]],'#6a4a3a'); R(g,fx+86,fb-72,6,30,WD[2]); } }
  const red=n===5; emit(g,G=>{ const P=red?['#a8182a','#ff4040','#ffb0a0']:['#c8361a','#ff9a2a','#fff0b0']; R(G,fx-26,fb-(n===1?70:84),56,8,P[0]); for(let k=0;k<7;k++) R(G,fx-24+k*8,fb-(n===1?74:88)-(k%2)*3,6,4,P[1+(k%2)]); });
  lt(fx+2,fb-90,110,red?'#ff3a2a':'#ff9a40',1,{gl:.6,fl:1});
  // bancada com morsa
  const bx=cx+60; R(g,bx,gy-74,150,10,WD[2]); R(g,bx,gy-74,150,2,WD[1]); R(g,bx,gy-66,150,2,WD[4]); for(const lx of [bx+6,bx+136]) R(g,lx,gy-64,8,64,WD[3]); R(g,bx+100,gy-98,24,24,MT[2]); R(g,bx+100,gy-98,24,3,MT[0]); R(g,bx+112,gy-104,3,8,MT[3]);
  if(n>=4){ ell(g,bx+40,gy-90,14,14,MT[3]); ell(g,bx+40,gy-90,9,9,'#c8c8d0'); emit(g,G=>{ for(let k=0;k<7;k++) R(G,bx+52+k*5,gy-96-hsh(k)*14,2,2,k%2?'#ffe080':'#fff8d0'); }); lt(bx+56,gy-92,40,'#ffe080',.7,{p:1}); }
  if(n===5) gold(g,bx,gy-76,150,4);
  // pátio: bigorna no toco, barril d'água, sucata
  const ax=cx-60; R(g,ax,gy-46,50,46,BK[2]); R(g,ax,gy-46,50,6,BK[1]); ell(g,ax+25,gy-46,25,5,'#c8955a'); ell(g,ax+25,gy-46,15,3,'#a8753e');
  if(n===1){ R(g,ax-8,gy-62,66,14,MT[3]); R(g,ax-8,gy-62,66,3,MT[1]); } else { poly(g,[[ax-14,gy-70],[ax+66,gy-70],[ax+52,gy-58],[ax+4,gy-58]],'#3a3a48'); R(g,ax-14,gy-70,80,3,'#7a7a90'); R(g,ax+14,gy-58,24,10,'#2e2e3a'); if(n===5) R(g,ax-14,gy-71,80,2,GO[1]); }
  barril(g,x1-10,gy,WD,s,40,56); ell(g,x1+10,gy-56,16,3,'#3a6a9a');
  for(let k=0;k<5+n;k++) R(g,cx+70+k*12,gy-10-(k%3)*8,22,10,k%2?SCR[2]:RU[2]);
  if(n===4) lampada(g,cx,top+16); if(n===2) lampiao(g,cx,top+16); if(n===5){ bandeira(g,x1-40,top-120,5,s,90); runa(g,x0+50,top+60,1); }
  if(n===1) placa(g,cx-10,top-40,'FERRO','#8a8a92','#fff4e0',2); else if(n>=2) placa(g,cx-30,top-48,'OFICINA',n===5?'#3e3652':n===4?'#2a5ab0':'#7a4c2c',n===5?GO[1]:'#fff4e0',2);
}};
DRAW.coletor={w:110,h:140,sw:.4,f(g,n,cx,gy){ const s=51;
  if(n===1){ for(const [dx,h] of [[-80,150],[70,150],[-56,176],[48,176]]) { line(g,cx+dx,gy,cx+dx,gy-h,BK[4],5); line(g,cx+dx,gy,cx+dx,gy-h,BK[2],3); }
    clipP(g,[[cx-86,gy-176],[cx+76,gy-176],[cx+14,gy-96],[cx-16,gy-96]],()=>tarp(g,cx-86,gy-180,166,90,TG,s)); shade(g,cx-20,gy-150,40,60,'#100820',.3);
    barril(g,cx-30,gy,ZN,s,56,62); ell(g,cx-2,gy-62,24,4,'#3a6a9a'); emit(g,G=>{ R(G,cx-14,gy-64,10,1,'#8ac8f0'); });
    for(let k=0;k<4;k++){ const bx=cx+40+k*16; R(g,bx,gy-34,12,34,'#9ad0d8'); R(g,bx+3,gy-40,6,6,'#3a8ae8'); R(g,bx+1,gy-30,3,24,'#d8f4f8'); } return; }
  if(n===2){ for(const px of [cx-80,cx+70]){ R(g,px,gy-190,10,190,WD[2]); R(g,px,gy-190,3,190,WD[1]); } roofBand(g,cx-100,cx+96,gy-230,gy-186,10,2,s);
    line(g,cx-70,gy-170,cx+10,gy-130,MT[3],6); line(g,cx-70,gy-172,cx+10,gy-132,MT[1],2);
    const bw=100, bh=106, bx=cx-50; for(let i=0;i<bw;i++){ const u=i/bw, bul=Math.sin(u*Math.PI)*6; R(g,bx+i,gy-bh-bul*.3,1,bh+bul*.3,u<.15?WD[1]:u<.55?WD[2]:u<.82?WD[3]:WD[4]); if(i%14===0) R(g,bx+i,gy-bh,1,bh,WD[5]); }
    for(const yy of [gy-bh+10,gy-bh/2,gy-14]) { R(g,bx,yy,bw,5,MT[4]); R(g,bx+4,yy,bw*.4,1,MT[1]); } ell(g,cx,gy-bh,50,7,WD[1]); ell(g,cx,gy-bh,44,5,'#2a5a8a'); emit(g,G=>R(G,cx-30,gy-bh-1,24,1,'#9ad8ff'));
    R(g,bx+bw-4,gy-40,16,6,MT[2]); balde(g,bx+bw+6,gy); return; }
  if(n===3){ const rx=86, top=gy-80; ell(g,cx,gy-4,rx+4,22,'rgba(8,4,18,.5)'); clipR(g,cx-rx,top,rx*2,80,()=>stoneWall(g,cx-rx,top,rx*2,80,ST,s,true));
    for(let i=0;i<rx*2;i++){ const u=i/(rx*2); shade(g,cx-rx+i,top,1,80,'#0a0418',Math.max(0,(u-.55))*.9+Math.max(0,.15-u)*1.5); }
    ell(g,cx,top,rx+4,14,ST[1]); ell(g,cx,top,rx-6,9,ST[4]); ell(g,cx,top+1,rx-10,7,'#22446a'); emit(g,G=>{ R(G,cx-40,top-1,30,2,'#8ac8f0'); R(G,cx+10,top+2,16,1,'#6aa8e0'); });
    for(const px of [cx-rx-6,cx+rx-14]) clipR(g,px,top-130,20,130,()=>stoneWall(g,px,top-130,20,130,ST,s+px,false));
    roofBand(g,cx-rx-30,cx+rx+20,top-200,top-128,14,3,s); R(g,cx-rx,top-110,rx*2,8,WD[3]); R(g,cx-rx,top-110,rx*2,2,WD[1]); ell(g,cx+rx-10,top-106,10,10,WD[2]); line(g,cx+rx-10,top-106,cx+rx+6,top-90,WD[4],3);
    line(g,cx,top-102,cx,top-40,'#c8a868',2); balde(g,cx-11,top-18,WD); return; }
  if(n===4){ clipR(g,cx-80,gy-110,160,110,()=>brickWall(g,cx-80,gy-110,160,110,s)); metalBand(g,cx-80,gy-110,160,10); R(g,cx-30,gy-90,60,90,'#1a1220');
    const ty=gy-280; for(let i=0;i<180;i++){ const u=i/180; R(g,cx-90+i,ty,1,168,u<.12?ZN[1]:Math.abs(u-.24)<.04?ZN[0]:u<.55?ZN[2]:u<.85?ZN[3]:ZN[4]); } for(let yy=ty+20;yy<ty+168;yy+=30){ R(g,cx-90,yy,180,3,MT[4]); for(let xx=cx-86;xx<cx+90;xx+=12) R(g,xx,yy+5,2,2,MT[0]); }
    ell(g,cx,ty,90,14,ZN[1]); ell(g,cx,ty-6,60,8,ZN[2]); poly(g,[[cx-60,ty-6],[cx+60,ty-6],[cx+20,ty-40],[cx-20,ty-40]],ZN[3]); R(g,cx-4,ty-48,8,10,MT[2]);
    R(g,cx+90,gy-140,30,8,MT[2]); R(g,cx+112,gy-140,8,24,MT[2]); R(g,cx+106,gy-150,20,6,'#c83a2a'); emit(g,G=>R(G,cx+114,gy-112,4,6,'#9ad8ff')); balde(g,cx+104,gy);
    lampada(g,cx-60,ty+30); placa(g,cx-48,ty+60,'AGUA','#2a5ab0','#f0f4ff',3); return; }
  const rx=96, top=gy-150; clipR(g,cx-rx,top,rx*2,150,()=>lunarWall(g,cx-rx,top,rx*2,150,s,true)); for(let i=0;i<rx*2;i++){ const u=i/(rx*2); shade(g,cx-rx+i,top,1,150,'#05020a',Math.max(0,(u-.55))*.9); }
  ell(g,cx,top,rx+8,16,GO[3]); ell(g,cx,top,rx+4,13,GO[1]); ell(g,cx,top,rx-4,10,LU[5]); emit(g,G=>{ ell(G,cx,top+1,rx-8,8,'#3ad8ff'); ell(G,cx-12,top,rx-40,5,'#aaf4ff'); R(G,cx-40,top-1,30,2,'#ffffff'); }); lt(cx,top-10,110,'#5ae8ff',1,{p:1,gl:.7});
  bandeira(g,cx+rx-6,top-130,5,s,130); for(const px of [cx-rx-10,cx+rx-6]){ poly(g,[[px,top],[px+16,top],[px+8,top-40]],GO[3]); poly(g,[[px+3,top],[px+8,top],[px+8,top-34]],GO[1]); } }};
DRAW.horta={w:230,h:100,sw:.47,f(g,n,cx,gy){ const s=61;
  // espantalho
  const ex=cx+230; R(g,ex,gy-176,6,176,BK[2]); R(g,ex-40,gy-146,86,6,BK[2]); const sc=n===5?rmp('#5a2a4a'):rmp('#b8433a'); R(g,ex-22,gy-142,50,52,sc[2]); for(let k=0;k<50;k+=10) R(g,ex-22+k,gy-142,4,52,sc[3]); R(g,ex-22,gy-92,50,6,'#c8a55a'); R(g,ex-46,gy-142,24,10,sc[2]); R(g,ex+28,gy-142,24,10,sc[2]); for(let k=0;k<5;k++) R(g,ex-48+(k%2)*4,gy-134+k*3,4,6,'#d8b860');
  ell(g,ex+3,gy-162,18,18,'#d8b47a'); ell(g,ex-3,gy-168,8,6,'#e8c88a'); R(g,ex-22,gy-184,50,10,'#c8a55a'); R(g,ex-12,gy-196,30,14,'#c8a55a'); const eye=n===5?'#ff4a4a':'#2a1a14'; R(g,ex-6,gy-164,5,5,eye); R(g,ex+8,gy-164,5,5,eye); line(g,ex-6,gy-152,ex+12,gy-150,'#2a1a14',2); if(n===5){ lt(ex+3,gy-162,30,'#ff3030',.6,{p:1}); }
  // canteiros (3 fileiras, a de trás menor)
  const bc={1:'#2a2630',2:WD,3:ST,4:BR,5:LU}[n];
  for(let r=2;r>=0;r--){ const y=gy-18-r*34, x0=cx-262+r*16, w=430-r*24;
    R(g,x0,y-4,w,22,SOIL[3]); for(let k=0;k<w;k+=8) R(g,x0+k,y+hsh(k+r)*10,5,2,SOIL[n===5?5:4]); R(g,x0,y-4,w,3,SOIL[2]);
    if(n===1){ for(let k=0;k<w;k+=32){ ell(g,x0+k+16,y+16,17,7,'#1a1620'); ell(g,x0+k+16,y+15,15,5,'#2e2a36'); ell(g,x0+k+16,y+14,8,2,'#141018'); } }
    else if(n===2) clipR(g,x0-4,y+8,w+8,16,()=>boardsH(g,x0-4,y+8,w+8,16,WD,s+r,8));
    else if(n===3) clipR(g,x0-4,y+8,w+8,16,()=>stoneWall(g,x0-4,y+8,w+8,16,ST,s+r,false));
    else if(n===4){ clipR(g,x0-4,y+8,w+8,16,()=>brickWall(g,x0-4,y+8,w+8,16,s+r)); R(g,x0,y+4,w,3,MT[2]); for(let k=12;k<w;k+=30) emit(g,G=>R(G,x0+k,y+7,2,2,'#8ac8f0')); }
    else { clipR(g,x0-4,y+8,w+8,16,()=>lunarWall(g,x0-4,y+8,w+8,16,s+r,false)); gold(g,x0-4,y+8,w+8,3); }
    const S=.55+n*.12;
    for(let k=10,i=0;k<w-14;k+=26,i++){ const px=x0+k, t=(i+r)%4;
      if(t===0){ const hh=Math.round(44*S); R(g,px,y-hh,3,hh,'#5a7a3a'); for(let j=0;j<4;j++){ ell(g,px+(j%2?8:-5),y-hh+8+j*9,8,4,j%2?LEAF[2]:LEAF[1]); } const fr=n===5?['#ff3a4a','#ffb0a0']:['#d83a2a','#ff8a6a']; for(let j=0;j<2+n%3;j++){ ell(g,px-4+j*7,y-hh*.5+j*6,4,4,fr[0]); R(g,px-5+j*7,y-hh*.5+j*6-2,2,2,fr[1]); if(n===5) emit(g,G=>{ ell(G,px-4+j*7,y-hh*.5+j*6,3,3,'#ff4a5a'); }); } if(n===5) lt(px,y-hh*.5,24,'#ff3040',.5,{p:1}); }
      else if(t===1){ const hh=Math.round(66*S); R(g,px,y-hh,3,hh,'#8fae4a'); for(let j=0;j<4;j++){ const yy=y-hh+12+j*12; line(g,px,yy,px+(j%2?18:-18),yy-8,j%2?LEAF2[2]:LEAF2[1],3); } R(g,px+3,y-hh*.6,6,16,CORN[2]); R(g,px+3,y-hh*.6,2,16,CORN[0]); R(g,px+4,y-hh*.6-4,3,4,'#c8a868'); }
      else if(t===2){ ell(g,px,y-5,12,7,LEAF[3]); ell(g,px-2,y-8,9,5,LEAF[2]); ell(g,px-3,y-10,5,3,LEAF2[1]); }
      else { ell(g,px,y-8,14,10,'#7ab84a'); ell(g,px-2,y-10,10,7,'#9ad060'); ell(g,px-3,y-12,5,3,'#c0e880'); R(g,px-8,y-4,16,2,'#4a7a2a'); } } }
  if(n===1){ for(let k=0;k<12;k++){ const x=cx-275+k*44; line(g,x,gy,x+(hsh(k)-.5)*8,gy-110-(k%2)*8,BK[3],3); } sag(g,cx-275,gy-80,cx+210,gy-80,6,BK[1],2); sag(g,cx-275,gy-40,cx+210,gy-40,6,BK[1],2); clipR(g,cx-275,gy-34,90,34,()=>tarp(g,cx-275,gy-34,90,34,TB,s)); }
  if(n===2){ clipR(g,cx-276,gy-72,486,72,()=>boardsV(g,cx-276,gy-72,486,72,WD,s,14,12)); }
  if(n===3) clipR(g,cx-276,gy-36,486,36,()=>stoneWall(g,cx-276,gy-36,486,36,ST,s,true));
  if(n===4){ clipR(g,cx-276,gy-32,486,32,()=>brickWall(g,cx-276,gy-32,486,32,s)); for(let k=0;k<6;k++){ const px=cx-276+k*96; R(g,px,gy-186,6,154,MT[3]); R(g,px,gy-186,2,154,MT[1]); } R(g,cx-276,gy-190,486,6,MT[2]); R(g,cx-276,gy-190,486,2,MT[0]);
    emit(g,G=>{ G.save(); G.globalAlpha=.14; R(G,cx-270,gy-184,474,152,'#cfe8ff'); G.globalAlpha=.3; for(let k=0;k<5;k++) line(G,cx-260+k*96,gy-180,cx-200+k*96,gy-40,'#ffffff',2); G.restore(); }); lampada(g,cx-40,gy-184); }
  if(n===5){ clipR(g,cx-276,gy-40,486,40,()=>lunarWall(g,cx-276,gy-40,486,40,s,false)); for(let k=0;k<6;k++){ const px=cx-270+k*96; R(g,px,gy-80,16,40,LU[2]); R(g,px,gy-80,4,40,LU[1]); gold(g,px-2,gy-84,20,6); } runa(g,cx-100,gy-20,.8); runa(g,cx+100,gy-20,.8); }
  barril(g,cx+250,gy,n>=4?MT:WD,s,30,40); }};
DRAW.bancada={w:210,h:120,sw:.45,f(g,n,cx,gy){ const s=71, x0=cx-240, w=480, top=gy-230;
  panel(g,x0+20,top+50,w-40,180,n,s); shade(g,x0+20,top+50,w-40,180,'#0a0414',.4);
  roofBand(g,x0,x0+w,top,top+56,10,n,s);
  // painel de ferramentas
  const pb={1:PLY,2:WDD,3:WDD,4:MT,5:LU}[n]; R(g,cx-90,top+76,180,80,pb[3]); R(g,cx-90,top+76,180,3,pb[1]); for(let xx=cx-84;xx<cx+90;xx+=10) for(let yy=top+82;yy<top+156;yy+=10) R(g,xx,yy,2,2,pb[5]); ferramentas(g,cx-80,top+84,5);
  if(n===5) gold(g,cx-92,top+74,184,4);
  // tampo
  const ty=gy-86, tc={1:rmp('#d8d0c0'),2:WD,3:rmp('#7a4e2a'),4:WD,5:LU}[n];
  R(g,cx-200,ty,400,18,tc[2]); R(g,cx-200,ty,400,3,tc[1]); R(g,cx-200,ty+15,400,3,tc[4]); for(let k=0;k<400;k+=40) R(g,cx-200+k,ty+3,1,12,tc[3]);
  if(n===1){ R(g,cx-130,ty+8,40,10,'#c8b898'); ell(g,cx-110,ty+12,4,4,'#b8a060'); barril(g,cx-190,gy,RU,s,54,68); barril(g,cx+136,gy,TB,s,54,68); clipR(g,cx-210,ty-10,140,24,()=>tarp(g,cx-210,ty-10,140,24,TB,s)); }
  else if(n===2){ for(const lx of [cx-180,cx+150]){ line(g,lx,ty+18,lx-16,gy,WD[3],7); line(g,lx+20,ty+18,lx+36,gy,WD[3],7); R(g,lx-6,ty+50,34,5,WD[2]); } }
  else { const lc={3:ST,4:MT,5:LU}[n]; for(const lx of [cx-190,cx+166]){ if(n===3) clipR(g,lx,ty+18,26,gy-ty-18,()=>stoneWall(g,lx,ty+18,26,gy-ty-18,ST,s+lx,false)); else { R(g,lx,ty+18,22,gy-ty-18,lc[3]); R(g,lx,ty+18,6,gy-ty-18,lc[1]); } }
    if(n===4){ R(g,cx+60,ty+18,96,66,MT[3]); for(let k=0;k<3;k++){ R(g,cx+64,ty+22+k*21,88,18,MT[2]); R(g,cx+64,ty+22+k*21,88,2,MT[0]); R(g,cx+100,ty+30+k*21,16,4,MT[4]); } } if(n===5) gold(g,cx-200,ty,400,4); }
  if(n===3||n===4){ R(g,cx+120,ty-34,44,34,MT[2]); R(g,cx+120,ty-34,44,4,MT[0]); R(g,cx+164,ty-26,16,6,MT[3]); }
  // coisas no tampo
  R(g,cx-150,ty-20,66,16,'#c9ced4'); R(g,cx-150,ty-20,66,3,'#f0f0f4'); R(g,cx-84,ty-18,16,14,WD[3]); R(g,cx-50,ty-26,36,26,'#e8e0cc'); R(g,cx-50,ty-26,36,4,'#f8f4ec'); R(g,cx-14,ty-10,36,10,'#e8e0cc'); R(g,cx+34,ty-20,20,20,MT[2]); R(g,cx+70,ty-10,60,10,'#b8433a'); R(g,cx+74,ty-14,8,4,MT[1]); R(g,cx+94,ty-14,8,4,MT[1]);
  if(n===2) lampiao(g,cx+100,ty-60); if(n===4) lampada(g,cx,top+70); if(n===5){ R(g,cx+92,ty-44,24,40,GO[3]); emit(g,G=>{ R(G,cx+96,ty-40,16,30,'#c01828'); R(G,cx+100,ty-36,6,20,'#ff7a6a'); }); lt(cx+104,ty-26,90,'#ff3a2a',1,{gl:.6,fl:1}); runa(g,x0+60,top+120,1); }
  if(n===1) lampiao(g,cx-20,top+60);
  for(let k=0;k<4;k++){ R(g,cx+214+k*7,gy-130+k*2,6,130-k*2,k%2?WD[2]:WD[3]); R(g,cx+214+k*7,gy-130+k*2,6,2,WD[1]); } }};
DRAW.posto_guarda={w:110,h:210,sw:.4,f(g,n,cx,gy){ const s=81;
  if(n===1){ caixote(g,cx-64,gy,60,44,s); caixote(g,cx-4,gy,56,40,s+3,WDD); barril(g,cx-40,gy-44,TB,s,50,56);
    const cy=gy-100; R(g,cx-36,cy,62,10,'#e8e4d8'); R(g,cx-36,cy-46,10,46,'#e8e4d8'); R(g,cx-36,cy-46,58,8,'#e8e4d8'); for(const lx of [cx-32,cx+18]) R(g,lx,cy+10,6,40,'#cfcabc'); R(g,cx-36,cy,62,2,'#ffffff');
    for(const [px,h] of [[cx-100,280],[cx+90,270]]){ line(g,px,gy,px+3,gy-h,BK[4],7); line(g,px,gy,px+3,gy-h,BK[2],3); }
    clipP(g,[[cx-110,gy-292],[cx+100,gy-280],[cx+100,gy-246],[cx-110,gy-258]],()=>tarp(g,cx-110,gy-296,214,56,TB,s)); for(let xx=cx-110;xx<cx+100;xx+=22) sag(g,xx,gy-258+(xx-cx+110)*.06,xx+22,gy-258+(xx-cx+88)*.06,4,TB[3],3);
    for(let k=0;k<6;k++) R(g,cx+46,gy-k*18-12,26,4,BK[2]); R(g,cx+46,gy-116,4,116,BK[3]); R(g,cx+70,gy-116,4,116,BK[3]); bandeira(g,cx+92,gy-350,1,s,80); return; }
  const top=gy-205;
  if(n===2){ for(const [dx,sk] of [[-74,10],[60,-10]]) poly(g,[[cx+dx,gy],[cx+dx+12,gy],[cx+dx+12+sk,top],[cx+dx+sk,top]],WD[2]); line(g,cx-64,gy-30,cx+56,top+30,WD[3],8); line(g,cx+56,gy-30,cx-64,top+30,WD[3],8); line(g,cx-64,top+150,cx+56,top+30,WD[1],6); R(g,cx-70,top+150,130,8,WD[2]); }
  else { const bw=n===3?150:n===4?126:112; panel(g,cx-bw/2,top,bw,gy-top,n,s); shade(g,cx+bw/2-24,top,24,gy-top,'#0a0418',.35);
    if(n===3){ R(g,cx-10,top+70,20,34,'#1a1424'); R(g,cx-12,top+68,24,4,ST[1]); porta(g,cx-26,gy,52,90,3,s); }
    if(n===4){ porta(g,cx-26,gy,52,96,4,s); janela(g,cx-16,top+60,32,30,4,s,true); }
    if(n===5){ R(g,cx-bw/2,top,7,gy-top,GO[2]); R(g,cx+bw/2-7,top,7,gy-top,GO[3]); porta(g,cx-24,gy,48,92,5,s); } }
  // plataforma e guarda-corpo
  const pc={2:WD,3:ST,4:MT,5:LU}[n]; R(g,cx-92,top-14,184,18,pc[3]); R(g,cx-92,top-14,184,4,pc[1]); R(g,cx-92,top+2,184,2,pc[5]);
  if(n===2){ for(let k=0;k<184;k+=18) R(g,cx-92+k,top-54,6,40,WD[2]); R(g,cx-92,top-56,184,7,WD[3]); R(g,cx-92,top-56,184,2,WD[1]); }
  if(n===3) for(let k=0;k<184;k+=44) clipR(g,cx-92+k,top-50,28,36,()=>stoneWall(g,cx-92+k,top-50,28,36,ST,s+k,false));
  if(n===4){ R(g,cx-92,top-56,184,4,MT[1]); for(let k=0;k<184;k+=14) R(g,cx-92+k,top-54,3,40,MT[2]); }
  if(n===5){ clipR(g,cx-92,top-50,184,36,()=>lunarWall(g,cx-92,top-50,184,36,s,false)); gold(g,cx-92,top-52,184,5); }
  // cobertura
  if(n===2){ for(const px of [cx-88,cx+80]) R(g,px,top-110,6,96,WD[3]); roofBand(g,cx-110,cx+100,top-150,top-100,10,2,s); }
  if(n===3){ panel(g,cx-50,top-90,100,76,3,s+3); R(g,cx-12,top-72,24,36,'#1a1424'); roofBand(g,cx-66,cx+60,top-136,top-86,8,3,s); }
  if(n===4){ for(const px of [cx-88,cx+80]) R(g,px,top-110,6,96,MT[3]); roofBand(g,cx-104,cx+96,top-136,top-104,10,4,s);
    const hx=cx-110, hy=top-60; R(g,hx-6,hy-4,40,32,MT[4]); R(g,hx-4,hy-2,36,28,MT[2]); ell(g,hx-6,hy+12,6,14,MT[1]); emit(g,G=>{ ell(G,hx-8,hy+12,5,12,'#fff6d0'); G.save(); G.globalAlpha=.10; poly(G,[[hx-10,hy+4],[hx-6,hy+20],[hx-30,hy-150],[hx+40,hy-160]],'#fff2c0'); G.restore(); }); lt(hx-10,hy+12,70,'#fff0c0',1,{gl:.7}); }
  if(n===5){ braseiro(g,cx,top-14,true); }
  // escada
  if(n<=3){ const lx=cx+66; for(let k=14;k<gy-top;k+=20) R(g,lx,gy-k,36,5,n===3?ST[2]:WD[2]); R(g,lx,top,5,gy-top,WD[3]); R(g,lx+32,top,5,gy-top,WD[3]); }
  if(n===4){ const lx=cx+66; for(let k=14;k<gy-top;k+=18) R(g,lx,gy-k,28,3,MT[1]); R(g,lx,top,3,gy-top,MT[2]); R(g,lx+26,top,3,gy-top,MT[2]); }
  if(n===5) for(let k=14;k<gy-top-10;k+=16) R(g,cx+58,gy-k,40,8,GO[3]);
  if(n===3){ line(g,cx-84,top-50,cx-84,top-90,BK[2],4); lampiao(g,cx-84,top-104); }
  bandeira(g,cx+(n===2?96:80),top-(n===3?160:n===2?140:118),n,s,n===3?72:n===2?50:70); }};
DRAW.pilha_toras={w:190,h:90,sw:.47,f(g,n,cx,gy){ const s=91;
  const log=(x,y,r,dark)=>{ ell(g,x,y,r+1,r+1,dark?'#1a0c14':'#2a1810'); ell(g,x,y,r,r,dark?'#3a2430':BK[3]); ell(g,x-1,y-1,r-3,r-3,dark?'#2a1820':'#c8955a'); ell(g,x,y,r-6,r-6,dark?'#4a1a24':'#b07c46'); ell(g,x,y,Math.max(1,r-10),Math.max(1,r-10),dark?'#2a1820':'#c8955a'); R(g,x-1,y-1,3,3,dark?'#ff4a3a':'#8a5a30'); R(g,x-r+3,y-r*.5,2,r*.6,dark?'#5a4a6a':'#e0b07a');
    if(dark) emit(g,G=>{ R(G,x-1,y-1,3,3,'#ff5a4a'); R(G,x+r-6,y,4,1,'#ff3a3a'); }); };
  if(n===1){ clipR(g,cx-210,gy-12,300,12,()=>tarp(g,cx-210,gy-12,300,12,TG,s)); for(let k=0;k<14;k++) log(cx-180+k*20+(k%2)*6,gy-24-(k%3)*18-hsh(k)*6,17,false); clipP(g,[[cx-200,gy-84],[cx+30,gy-96],[cx+60,gy-56],[cx-170,gy-40]],()=>tarp(g,cx-210,gy-100,280,64,TB,s)); }
  else { const rows=n>=3?4:3, by=gy-(n>=3?26:14);
    if(n===3) clipR(g,cx-214,gy-22,300,22,()=>stoneWall(g,cx-214,gy-22,300,22,ST,s,false)); if(n===4){ clipR(g,cx-214,gy-22,300,22,()=>brickWall(g,cx-214,gy-22,300,22,s)); for(const px of [cx-218,cx+76]) R(g,px,gy-180,10,158,MT[2]); roofBand(g,cx-230,cx+96,gy-212,gy-176,10,4,s); lampada(g,cx-70,gy-176); }
    if(n===5) clipR(g,cx-214,gy-24,300,24,()=>lunarWall(g,cx-214,gy-24,300,24,s,false));
    if(n===2) for(const px of [cx-214,cx+76]){ R(g,px,gy-130,10,130,WD[2]); R(g,px,gy-130,3,130,WD[1]); poly(g,[[px,gy-130],[px+10,gy-130],[px+5,gy-142]],WD[1]); }
    if(n===3){ for(const px of [cx-218,cx+74]) clipR(g,px,gy-160,16,138,()=>stoneWall(g,px,gy-160,16,138,ST,s+px,false)); roofBand(g,cx-232,cx+98,gy-200,gy-156,10,3,s); }
    for(let r=0;r<rows;r++) for(let k=0;k<rows*2-r*2+2-(n===2?0:1);k++) log(cx-184+k*36+r*18,by-r*30-16,17,n===5); }
  // toco com machado e cavacos
  const tx=cx+120; R(g,tx,gy-44,70,44,BK[2]); R(g,tx,gy-44,10,44,BK[1]); R(g,tx+60,gy-44,10,44,BK[4]); ell(g,tx+35,gy-44,35,7,'#c8955a'); ell(g,tx+35,gy-44,24,4,'#a8753e');
  line(g,tx+30,gy-46,tx+62,gy-96,n===5?LU[2]:BK[3],6); poly(g,[[tx+54,gy-104],[tx+82,gy-110],[tx+86,gy-86],[tx+66,gy-88]],n===5?GO[2]:n===1?RU[2]:'#a0a8b4'); R(g,tx+56,gy-104,26,2,n===5?GO[0]:'#e0e8f0');
  for(let k=0;k<14;k++) R(g,cx+80+hsh(k)*130,gy-4-hsh(k*3)*8,6,2,'#e0c08a');
  if(n===4){ const sx=cx+200; R(g,sx-30,gy-64,64,8,MT[2]); R(g,sx-24,gy-56,6,56,MT[3]); R(g,sx+22,gy-56,6,56,MT[3]); ell(g,sx,gy-74,20,20,'#c9ced4'); ell(g,sx,gy-74,6,6,MT[3]); for(let a=0;a<16;a++){ const t=a/16*Math.PI*2; R(g,sx+Math.cos(t)*21-1,gy-74+Math.sin(t)*21-1,3,3,'#e8ecf0'); } } }};
DRAW.ponto_coleta={w:130,h:110,sw:.45,f(g,n,cx,gy){ const s=101;
  const junk=(x,y,w)=>{ for(let k=0;k<w/12;k++){ const v=hsh(s+k*1.7); R(g,x+k*12,y-(k%3)*8-v*6,18,12,pick([SCR[2],RU[2],'#3a6ab8','#b8433a','#d8c8a0','#4a8a4a','#e8c44a'],v)); R(g,x+k*12,y-(k%3)*8-v*6,18,2,'#ffffff30'); } };
  if(n===1){ const x=cx-110, y=gy-26; junk(x+6,y-80,130); clipP(g,[[x,y-90],[x+150,y-90],[x+136,y-10],[x+14,y-10]],()=>{ R(g,x,y-90,150,80,'#2a2630'); for(let xx=x;xx<x+150;xx+=8) R(g,xx,y-90,2,80,'#a8a8b4'); for(let yy=y-90;yy<y-10;yy+=8) R(g,x,yy,150,2,'#a8a8b4'); });
    R(g,x-4,y-92,158,4,'#d8d8e0'); R(g,x+14,y-10,124,4,'#8a8a92'); line(g,x+150,y-92,x+176,y-120,'#a8a8b4',4); R(g,x+170,y-126,22,8,'#c83a2a'); for(const wx of [x+22,x+124]){ ell(g,wx,gy-12,10,10,'#1e1a24'); ell(g,wx,gy-12,4,4,'#6a6670'); }
    R(g,cx+86,gy-110,4,110,BK[2]); R(g,cx+56,gy-150,72,44,'#c8a874'); R(g,cx+56,gy-150,72,3,'#e0c890'); text(g,'TROCO',cx+62,gy-140,2,'#2a1a14'); text(g,'SUCATA',cx+60,gy-122,1,'#7a2a1a'); return; }
  if(n===2){ for(let k=0;k<3;k++){ const bx=cx-130+k*84, by=gy-(k===1?18:0); junk(bx+6,by-70,60); caixote(g,bx,by,74,64,s+k); R(g,bx+6,by-64,62,12,'#1a1220'); } R(g,cx+100,gy-160,6,90,WD[3]); placa(g,cx+40,gy-180,'COLETA','#7a4c2c','#fff0d0',2); return; }
  if(n===3){ const x=cx-140, w=280; clipR(g,x,gy-90,w,90,()=>stoneWall(g,x,gy-90,w,90,ST,s,true)); for(const bx of [x+14,x+148]){ R(g,bx,gy-80,118,80,'#2a1c28'); shade(g,bx,gy-80,118,20,'#000000',.35); junk(bx+6,gy-20,104); }
    for(const px of [x,x+w-16]) clipR(g,px,gy-150,16,62,()=>stoneWall(g,px,gy-150,16,62,ST,s+px,false)); roofBand(g,x-12,x+w+12,gy-186,gy-142,10,3,s); return; }
  if(n===4){ const x=cx-130, w=250; poly(g,[[x,gy-110],[x+w,gy-110],[x+w-24,gy-10],[x+24,gy-10]],MT[3]); clipP(g,[[x+2,gy-108],[x+w-2,gy-108],[x+w-26,gy-12],[x+26,gy-12]],()=>{ corrugated(g,x,gy-110,w,100,rmp('#d8a030'),s,.4); });
    junk(x+20,gy-112,w-40); R(g,x-4,gy-114,w+8,6,MT[1]); for(let k=0;k<w;k+=16) R(g,x+4+k,gy-104,3,3,MT[0]); R(g,x+20,gy-12,w-40,12,'#1e1a24'); placa(g,x+70,gy-80,'SUCATA','#1a1a22','#ffd23f',2);
    R(g,cx+150,gy-220,6,220,MT[3]); R(g,cx+150,gy-220,2,220,MT[1]); R(g,cx+130,gy-222,40,5,MT[2]); lampada(g,cx+134,gy-216); return; }
  const x=cx-120, w=240; clipR(g,x,gy-100,w,100,()=>lunarWall(g,x,gy-100,w,100,s,true)); poly(g,[[x-6,gy-100],[x+w+6,gy-100],[x+w-10,gy-150],[x+10,gy-150]],LU[3]); poly(g,[[x+10,gy-150],[x+w-10,gy-150],[x+w-30,gy-160],[x+30,gy-160]],LU[2]); gold(g,x-6,gy-104,w+12,8); gold(g,x+10,gy-152,w-20,5);
  R(g,cx-30,gy-112,60,10,GO[3]); emit(g,G=>{ R(G,x+2,gy-102,w-4,4,'#ff3a3a'); R(G,cx-26,gy-110,52,6,'#ff6a5a'); }); lt(cx,gy-106,100,'#ff3030',1,{p:1,gl:.6}); bandeira(g,x+w-10,gy-260,5,s,110); }};
DRAW.portao={w:280,h:170,sw:.46,f(g,n,cx,gy){ const s=111, hgt=[0,165,180,195,205,196][n]+20, top=gy-hgt;
  const pil=(x)=>{ if(n===1){ for(let k=0;k<5;k++){ const y=gy-(k+1)*56; if(k%2) pneus(g,x+37,y+56,38,4); else barril(g,x,y+56,k%4?RU:TB,s+k,74,56); } }
    else if(n===2){ for(let k=0;k<3;k++){ const lx=x+k*26; R(g,lx,top,24,hgt,BK[2]); R(g,lx,top,6,hgt,BK[1]); R(g,lx+18,top,6,hgt,BK[4]); for(let yy=top+10;yy<gy;yy+=24) R(g,lx+8,yy,6,3,BK[3]); poly(g,[[lx,top],[lx+24,top],[lx+12,top-20]],BK[1]); } sag(g,x,top+40,x+76,top+40,3,'#c8a868',3); sag(g,x,gy-60,x+76,gy-60,3,'#c8a868',3); }
    else { panel(g,x,top,76,hgt,n,s+x); shade(g,x+56,top,20,hgt,'#0a0418',.35); const cc={3:ST,4:MT,5:LU}[n]; R(g,x-8,top-16,92,18,cc[3]); R(g,x-8,top-16,92,4,cc[1]); if(n===5){ gold(g,x-8,top-18,92,6); gold(g,x-8,top-2,92,4); }
      if(n===4) lampada(g,x+38,top-36); if(n===5){ braseiro(g,x+38,top-16,true,.62); } } };
  pil(cx-300); pil(cx+224);
  // arco / viga
  if(n===2){ clipR(g,cx-300,top+10,600,22,()=>boardsH(g,cx-300,top+10,600,22,WD,s,22)); placa(g,cx-56,top+34,'ABRIGO','#7a4c2c','#ffe8b0',3); }
  if(n===3){ for(let k=0;k<26;k++){ const a=Math.PI*k/25, ax=cx-224+Math.round(224-Math.cos(a)*224), ay=top+30-Math.round(Math.sin(a)*40); clipR(g,ax-12,ay-14,26,28,()=>stoneWall(g,ax-12,ay-14,26,28,ST,s+k,false)); } placa(g,cx-56,top+30,'ABRIGO','#5a5a68','#f0e8d0',3); }
  if(n===4){ metalBand(g,cx-224,top+10,448,16); placa(g,cx-56,top+30,'ABRIGO','#2a5ab0','#f0f4ff',3); for(let k=0;k<40;k++) R(g,cx-300+k*15,top-4+Math.round(Math.sin(k)*3),10,2,'#a8a8b4'); }
  if(n===5){ R(g,cx-224,top+6,448,24,LU[3]); gold(g,cx-224,top+6,448,5); gold(g,cx-224,top+26,448,4); const mx=cx, my=top+18; ell(g,mx,my-6,24,24,GO[3]); emit(g,G=>{ ell(G,mx,my-6,20,20,'#d01828'); ell(G,mx+7,my-10,15,15,LU[3]); }); lt(mx,my-6,50,'#ff3030',.8,{p:1,gl:.5}); }
  // folhas abertas encostadas
  const leaf=(x,dir)=>{ const lw=40, ly=top+40, lh=gy-ly; const P=[[x,ly],[x+lw*dir,ly+10],[x+lw*dir,gy+4],[x,gy]];
    clipP(g,P,()=>{ const X=Math.min(x,x+lw*dir); if(n===1){ corrugated(g,X,ly,lw,lh+10,ZN,s,.5); tarp(g,X,ly+lh*.5,lw,lh*.5,TB,s); } else if(n===2) boardsV(g,X,ly,lw,lh+10,WD,s,10); else if(n===3) boardsV(g,X,ly,lw,lh+10,WDD,s,10); else if(n===4){ R(g,X,ly,lw,lh+10,MT[2]); for(let yy=ly;yy<gy;yy+=20){ R(g,X,yy,lw,2,MT[4]); for(let xx=X+3;xx<X+lw;xx+=8) R(g,xx,yy+4,2,2,MT[0]); } } else { R(g,X,ly,lw,lh+10,LU[3]); for(let yy=ly;yy<gy;yy+=18) R(g,X,yy,lw,2,LU[4]); } shade(g,X,ly,lw,lh+10,'#0a0418',dir>0?.15:.35); });
    if(n===3||n===4){ R(g,Math.min(x,x+lw*dir),ly+30,lw,5,'#2a2430'); R(g,Math.min(x,x+lw*dir),gy-50,lw,5,'#2a2430'); }
    if(n===2){ line(g,x+4*dir,ly+20,x+(lw-4)*dir,gy-30,WD[1],4); }
    if(n===5){ const mx=x+lw*dir/2, my=ly+lh*.35; ell(g,mx,my,12,12,GO[3]); emit(g,G=>{ ell(G,mx,my,9,9,'#e0283a'); ell(G,mx+4*dir,my-3,7,7,LU[3]); }); lt(mx,my,26,'#ff3030',.6,{p:1}); }
    if(n===1){ for(let k=0;k<3;k++) sag(g,x-6*dir,ly+30+k*60,x+4*dir,ly+34+k*60,2,'#c8a868',3); } };
  leaf(cx-224,1); leaf(cx+224,-1);
  if(n===1){ sag(g,cx-224,top+80,cx+224,top+80,40,'#c8a868',2); clipR(g,cx-80,top+110,160,40,()=>plywood(g,cx-80,top+110,160,40,s)); text(g,'ABRIGO',cx-70,top+116,4,'#e8e0d0'); text(g,'ABRIGO',cx-72,top+114,4,'#c8283a'); } }};

/* placa de construção (slot vazio) */
DRAW.vazio={w:110,h:70,sw:.35,f(g,n,cx,gy){ const s=121;
  for(const [dx,dy] of [[-110,0],[110,0],[-90,-30],[90,-30]]){ R(g,cx+dx-2,gy+dy-26,5,26,WD[2]); R(g,cx+dx-2,gy+dy-26,5,2,WD[0]); }
  line(g,cx-110,gy-20,cx+110,gy-20,'#e8d8a0',1); line(g,cx-110,gy-20,cx-90,gy-50,'#e8d8a0',1); line(g,cx+110,gy-20,cx+90,gy-50,'#e8d8a0',1); line(g,cx-90,gy-50,cx+90,gy-50,'#e8d8a0',1);
  for(let k=-100;k<100;k+=14) R(g,cx+k,gy-6+(k%28?0:2),8,2,'#d8d0b8');
  for(let k=0;k<4;k++){ R(g,cx+30,gy-8-k*10,76,9,k%2?WD[2]:WD[3]); R(g,cx+30,gy-8-k*10,76,2,WD[1]); ell(g,cx+30,gy-4-k*10,2,4,WD[4]); }
  R(g,cx-6,gy-110,8,110,WD[3]); R(g,cx-6,gy-110,2,110,WD[1]); R(g,cx-60,gy-150,116,56,WD[4]); clipR(g,cx-58,gy-148,112,52,()=>boardsH(g,cx-58,gy-148,112,52,WD,s,13));
  R(g,cx-44,gy-138,26,10,'#3a3a48'); R(g,cx-44,gy-138,26,2,'#8a8aa0'); R(g,cx-34,gy-128,6,22,WD[3]);
  emit(g,G=>{ R(G,cx+14,gy-140,8,34,'#ffd23f'); R(G,cx+1,gy-127,34,8,'#ffd23f'); R(G,cx+14,gy-140,2,34,'#fff4b0'); });
  lt(cx+18,gy-123,40,'#ffd23f',.6,{p:1,gl:.4}); }};

  /* ---------- dados das estruturas (descrições das docs, custos de mecanicas2) ---------- */
  /* ---------- dados das estruturas (descrições das docs, custos de mecanicas2) ---------- */
  const lv=(arr)=>arr.map((o,i)=>Object.assign({n:i+1},o));
  const up=(base,i)=>{ if(i===0) return Object.assign({},base); const m=[1,1,2,3.5,6][i], o={}; for(const k in base) o[k]=Math.ceil(base[k]*m); if(i===2) o.pedra=8; if(i===3){ o.pedra=6; o.pecas=6; } if(i===4) o.fragmento_lunar=1; return o; };
  const mkN=(base1,baseUp,efeitos,descs)=>lv(efeitos.map((e,i)=>({custo:i===0?base1:up(baseUp,i), efeito:e, desc:descs[i]})));
  const STRUCT={
    fogueira:{nome:'Fogueira', tipo:'fogueira', slot:'fogueira', niveis:mkN({}, {madeira:10,sucata:5},
      ['Cura 50% ao descansar','Cura 75%','Cura 100%','Cura 100% + tira veneno','Cura 100% + tira veneno + 10% XP na próxima expedição'],
      ['Anel de pedras soltas, chapas de sucata encostadas e grelha de arame com lata esquentando.','Anel de 12 tocos de madeira em pé e dois bancos de tronco.','Muro baixo de blocos de pedra com tripé e caldeirão de ferro.','Tijolo com faixa de metal rebitada e grelha de barras.','Pedra escura com frisos dourados, 5 runas vermelhas e chifres dourados; chama vermelha.'])},
    barraca:{nome:'Barraca / Alojamento', tipo:'producao', slot:'barraca', niveis:mkN({pano:4,madeira:4},{pano:4,madeira:4},
      ['2 camas','4 camas','6 camas · descanso +10%','8 camas · descanso +20%','10 camas · descanso +30%'],
      ['Barraca de lona verde remendada, lona azul por cima e colchonete saindo pela porta.','Cabana de tábuas com rede listrada na varanda.','Casinha de pedra com telha de barro, chaminé e cama vista pela janela.','Alojamento de tijolo com faixas de metal, chapa ondulada, caixa-d\'água, beliche e lâmpada.','Casa lunar de pedra escura, ardósia, cumeeira dourada, vitral vermelho, bandeira e braseiro.'])},
    gerador:{nome:'Gerador', tipo:'producao', slot:'gerador', niveis:mkN({pecas:6,sucata:8,gasolina:1},{pecas:6,sucata:8},
      ['Energia para 1 construção','2 construções','3 construções','4 construções · lâmpadas','5 construções · núcleo lunar'],
      ['Motor velho amarrado num estrado com galão vermelho e fios soltos.','Casinha de tábuas com o escapamento saindo pelo teto.','Base de pedra com meia-parede de telhas e escapamento alto de ferro.','Gabinete de metal rebitado com painel de relógios, lâmpadas e tambor.','Caixa de pedra escura e ouro com núcleo vermelho pulsando e cristal lunar.'])},
    barricada:{nome:'Barricada', tipo:'defesa', slot:'barricada', niveis:mkN({madeira:2},{madeira:2},
      ['Segura a horda · 120 HP','220 HP','360 HP','550 HP · arame farpado','800 HP · pontas douradas'],
      ['Pneus, porta de geladeira, chapas e carrinho amarrados com corda.','Cavalo de frisa de estacas em X com tábuas pregadas.','Sacos de areia empilhados com blocos de pedra.','Chapa de metal rebitada com faixas de perigo e arame farpado.','Bloco de pedra escura com pontas douradas e runa vermelha.'])},
    muralha:{nome:'Muralha', tipo:'defesa', slot:'muralha', niveis:mkN({madeira:8,sucata:4},{madeira:8,sucata:4},
      ['300 HP','600 HP','1000 HP','1600 HP','2500 HP'],
      ['Cerca de estacas tortas com chapas de sucata e lonas amarradas.','Paliçada de troncos apontados com travessas.','Muro de pedra com passarela e ameias.','Muro de tijolo com faixas de metal, tampa de chapa e arame farpado.','Pedra escura com frisos dourados, ameias com pontas douradas e runas.'])},
    portao:{nome:'Portão', tipo:'defesa', slot:'portao', niveis:mkN({madeira:6,sucata:4},{madeira:6,sucata:4},
      ['Saída da expedição · 200 HP','400 HP','700 HP','1100 HP · lâmpadas','1700 HP · braseiros'],
      ['Pilares de tambores e pneus, folhas de chapa e lona, dobradiças de corda.','Pilares de tronco, folhas de tábua com travessa em Z.','Pilares de pedra com arco e folhas de madeira grossa.','Pilares de tijolo com metal, folhas de chapa rebitada e lâmpadas.','Pilares de pedra escura com capitéis dourados e lua vermelha nas folhas.'])},
    serralheria:{nome:'Serralheria', tipo:'producao', slot:'serralheria', niveis:mkN({sucata:10,madeira:5},{sucata:12,madeira:6},
      ['Faca e porrete','+ Bastão com pregos','+ Machado','+ Melhorias de pistola','+ Armas da Lua de Sangue'],
      ['Telheiro de lona com forja de tambor de óleo e bigorna de trilho.','Ripas de madeira, forja de barro com fole.','Telha de barro, forja de pedra com chaminé.','Chapa ondulada, forja de tijolo, esmeril com faíscas e lâmpada.','Ardósia com cumeeira dourada, forja de fogo vermelho e runas.'])},
    coletor:{nome:'Coletor de água', tipo:'producao', slot:'coletor', niveis:mkN({madeira:6,pano:2},{madeira:8,pano:3},
      ['6 água/h · cabe 20','10/h · 35','15/h · 55','22/h · 80','30/h · 120'],
      ['Lona esticada em estacas formando funil sobre um balde.','Barril de madeira com calha e telhadinho.','Cisterna redonda de pedra com telhado de barro e sarilho.','Caixa-d\'água de metal rebitado sobre torre de tijolo, torneira pingando.','Reservatório lunar de pedra escura com aro dourado e água brilhante.'])},
    horta:{nome:'Horta', tipo:'producao', slot:'horta', niveis:mkN({madeira:4,agua:2},{madeira:6,agua:2},
      ['4 comida/h · cabe 15','7/h · 25','11/h · 40','16/h · 60','22/h · 90'],
      ['Canteiros com bordas de pneus e lona, cerca de gravetos.','Caixotes de feira de madeira e paliçada.','Canteiros de pedra com murinho.','Estufa de tijolo com estrutura de chapa e irrigação.','Terra escura, frutos de brilho vermelho e runas.'])},
    bancada:{nome:'Bancada', tipo:'producao', slot:'bancada', niveis:mkN({madeira:8},{madeira:8},
      ['Ataduras','+ Barricadas','+ Gazuas','+ Craft 20% mais rápido','+ Craft lunar'],
      ['Porta velha sobre tambores de sucata, lona azul por cima.','Tampo de tábuas sobre cavaletes, lampião.','Tampo grosso com pernas de pedra e morsa.','Cantoneira de metal, gaveteiro de chapa e lâmpada.','Tampo de pedra escura com borda dourada e lanterna vermelha.'])},
    posto_guarda:{nome:'Posto de guarda', tipo:'estacao', slot:'posto_guarda', niveis:mkN({madeira:6,sucata:2},{madeira:6,sucata:2},
      ['2 vagas · alcance curto','Torre de madeira','Guarita de pedra · +10% defesa','Holofote · +20% defesa','Braseiro lunar · +30% defesa'],
      ['Cadeira de plástico sobre caixotes e tambor, lona azul de sombra.','Torre de madeira com X, guarda-corpo e telhado de ripas.','Guarita de pedra com ameias e casinha de telha.','Torre de tijolo com metal, chapa ondulada e holofote.','Torre de pedra lunar com cantoneiras douradas e braseiro vermelho.'])},
    pilha_toras:{nome:'Pilha de toras', tipo:'estacao', slot:'pilha_toras', niveis:mkN({madeira:4},{madeira:4},
      ['3 madeira/h','5/h','8/h','12/h · serra circular','16/h · toras lunares'],
      ['Toras tortas amontoadas sobre lona com lona azul por cima.','Pirâmide arrumada entre estacas.','Pirâmide sobre base de pedra com telhadinho.','Estante de metal, chapa ondulada, lâmpada e serra circular.','Toras escuras com veios vermelhos e machado dourado.'])},
    ponto_coleta:{nome:'Ponto de coleta', tipo:'estacao', slot:'ponto_coleta', niveis:mkN({madeira:3,pano:2},{madeira:3,pano:2},
      ['2 sucata/h + pano','4/h','6/h','9/h','12/h'],
      ['Carrinho de supermercado lotado de tralha e placa de papelão.','Caixotes de madeira abertos e placa de tábua.','Duas baias de pedra com toldo de telha.','Caçamba de metal rebitada, poste com lâmpada.','Baú lunar de pedra escura com brilho vermelho.'])},
  };
  // pátio: fogueira no centro; gy maior desenha na frente. Larguras = sprite, com folga pro clique.
  const SLOTS=[
    {id:'posto_guarda', x:30, largura:110, gy:300},
    {id:'barraca', x:180, largura:220, gy:300},
    {id:'horta', x:440, largura:230, gy:300},
    {id:'coletor', x:40, largura:110, gy:460},
    {id:'ponto_coleta', x:500, largura:130, gy:460},
    {id:'fogueira', x:335, largura:110, gy:520},
    {id:'portao', x:20, largura:280, gy:640},
    {id:'barricada', x:310, largura:130, gy:660},
    {id:'bancada', x:40, largura:210, gy:820},
    {id:'gerador', x:280, largura:120, gy:820},
    {id:'pilha_toras', x:430, largura:190, gy:820},
    {id:'serralheria', x:200, largura:250, gy:1000},
  ];
  const SLOT=Object.fromEntries(SLOTS.map(s=>[s.id,s]));
  SLOT.muralha={id:'muralha', x:0, largura:WORLD, gy:BASE};

/* =====================================================================
   SPRITES: limiar de alfa, contorno externo, luz de borda, noite pintada, emissivos e sombra
   ===================================================================== */
const SPR_GRADE=[[0,'#e2dcf8'],[.6,'#cac2ec'],[1,'#b4acdc']];
function gradeCanvas(c,g,stops){ const [mc,mg]=mk(c.width,c.height); mg.drawImage(c,0,0); g.save(); g.setTransform(1,0,0,1,0,0); g.globalCompositeOperation='multiply';
  const gr=g.createLinearGradient(0,0,0,c.height); stops.forEach(([o,col])=>gr.addColorStop(o,col)); g.fillStyle=gr; g.fillRect(0,0,c.width,c.height);
  g.globalCompositeOperation='destination-in'; g.drawImage(mc,0,0); g.restore(); }
function finishSprite(c,g){ const Wd=c.width, Hd=c.height, img=g.getImageData(0,0,Wd,Hd), d=img.data;
  for(let i=3;i<d.length;i+=4) if(d[i]>=200) d[i]=255;
  const A=i=>d[i*4+3]===255, o=new Uint8ClampedArray(d);
  for(let y=0;y<Hd;y++) for(let x=0;x<Wd;x++){ const i=y*Wd+x, p=i*4;
    if(!A(i)){ if((x>0&&A(i-1))||(x<Wd-1&&A(i+1))||(y>0&&A(i-Wd))||(y<Hd-1&&A(i+Wd))){ o[p]=0x17; o[p+1]=0x0b; o[p+2]=0x1c; o[p+3]=255; } }
    else if(y>0&&!A(i-Wd)){ o[p]=d[p]*.6+184*.4; o[p+1]=d[p+1]*.6+176*.4; o[p+2]=d[p+2]*.6+236*.4; }
    else if(y>1&&!A(i-2*Wd)){ o[p]=d[p]*.82+184*.18; o[p+1]=d[p+1]*.82+176*.18; o[p+2]=d[p+2]*.82+236*.18; }
    else if(x<Wd-1&&!A(i+1)){ o[p]=d[p]*.75+138*.25; o[p+1]=d[p+1]*.75+128*.25; o[p+2]=d[p+2]*.75+200*.25; } }
  g.putImageData(new ImageData(o,Wd,Hd),0,0); }
const cache=PIX.cache(), cset=(k,v)=>{ cache.set(k,v); return v; }; // persistente entre sessões (window.__ARTSTORE)
function sprite(id,n){ n=clamp((n|0)||1,1,5); const k=id+':'+n; const hit=cache.get(k); if(hit) return hit;
  if(id==='fogueira'){ const [c,g]=mk(FW*RS,FH2*RS); g.setTransform(RS,0,0,RS,0,0); fogueira(g,FAX,FGY,n,1,.4); return cset(k,{c,ax:FAX,gy:FGY,w:FW,h:FH2,lights:[]}); }
  if(id==='muralha'){ const [c,g]=mk(328,90*RS); const yb=86*RS; g.translate(0,yb-HB); murSpan(g,0,320,n,7); g.setTransform(1,0,0,1,0,0); gradeCanvas(c,g,SPR_GRADE); return cset(k,{c,ax:64,gy:86,w:328/RS,h:90,lights:[]}); }
  const D=DRAW[id]||DRAW.vazio, CW=D.w+8, CH=D.h+6, GY=D.h+2, [c,g]=mk(CW*RS,CH*RS), cx=CW*RS/2, gy=GY*RS;
  LQ=[]; LL=[]; let q, ls; try{ D.f(g,n,cx,gy); } finally { q=LQ; ls=LL; LQ=null; LL=null; }
  finishSprite(c,g); gradeCanvas(c,g,SPR_GRADE); for(const fn of q) fn(g);
  g.save(); g.globalCompositeOperation='destination-over'; ell(g,cx,gy+3,CW*RS*(D.sw||.45),13,'rgba(8,4,18,.6)'); ell(g,cx,gy+2,CW*RS*(D.sw||.45)*.8,8,'rgba(8,4,18,.5)'); g.restore();
  return cset(k,{c,ax:CW/2,gy:GY,w:CW,h:CH,lights:ls.map(L=>({x:L.x/RS-CW/2,y:L.y/RS-GY,r:L.r/RS,c:L.c,a:L.a,p:L.p,gl:L.gl,fl:L.fl,ry:L.ry}))}); }

/* =====================================================================
   FOGUEIRA (animada; desenhada num canvas de alta resolução e escalada pro contexto)
   ===================================================================== */
const FW=140, FH2=120, FAX=70, FGY=96, FC={}, FO={};
function fireBase(n){ if(FC[n]) return FC[n]; const w=FW*RS, h=FH2*RS, cx=FAX*RS, cy=FGY*RS, rx=85, ry=28;
  const [bc,bg]=mkC(w,h), [fc,fg]=mkC(w,h), [tc,tg]=mkC(w,h); // CPU: compostos a cada quadro no canvas do fogo (CPU)
  ell(bg,cx,cy+6,rx+50,ry+18,'rgba(8,4,16,.45)'); ell(bg,cx,cy,rx-4,ry-3,'#24161c'); ell(bg,cx,cy,rx-24,ry-10,'#1a0e12');
  for(let i=0;i<50;i++) R(bg,cx-rx+12+hsh(i)*(rx*2-24),cy-ry+8+hsh(i*3)*(ry*2-16),3,2,hsh(i*7)>.5?'#5a4a50':'#0e0608');
  if(n===1){ clipP(bg,[[cx-142,cy-6],[cx-124,cy-82],[cx-92,cy-78],[cx-104,cy-2]],()=>corrugated(bg,cx-142,cy-86,52,84,RU,5,.6));
    clipP(bg,[[cx+96,cy-6],[cx+112,cy-72],[cx+142,cy-66],[cx+132,cy-2]],()=>corrugated(bg,cx+96,cy-76,48,76,ZN,9,.5));
    for(let k=0;k<14;k++){ const a=k/14*Math.PI*2+.1, px=cx+Math.cos(a)*rx, py=cy+Math.sin(a)*ry, v=hsh(k*3.3), ww=24+v*10, hh=15+v*8, G=Math.sin(a)<0?bg:fg; rock(G,px-ww/2,py-hh+5,ww,hh,ST); }
    line(tg,cx-44,cy-62,cx+44,cy-62,'#a8a8b8',2); for(let k=-40;k<=40;k+=8) line(tg,cx+k,cy-64,cx+k,cy-60,'#7a7a88',1); line(tg,cx-44,cy-62,cx-54,cy-14,'#5a5a68',2); line(tg,cx+44,cy-62,cx+54,cy-14,'#5a5a68',2);
    R(tg,cx-12,cy-88,24,26,RU[2]); R(tg,cx-12,cy-88,6,26,RU[1]); R(tg,cx+7,cy-88,5,26,RU[4]); ell(tg,cx,cy-88,12,3,RU[3]); ell(tg,cx,cy-88,9,2,'#3a2a20'); R(tg,cx-12,cy-78,24,6,'#d8c8a0'); }
  else if(n===2){ for(let k=0;k<12;k++){ const a=k/12*Math.PI*2, px=cx+Math.cos(a)*rx, py=cy+Math.sin(a)*ry, G=Math.sin(a)<0?bg:fg; R(G,px-9,py-28,18,30,BK[2]); R(G,px-9,py-28,5,30,BK[1]); R(G,px+4,py-28,5,30,BK[4]); ell(G,px,py-28,9,3,'#c8955a'); ell(G,px,py-28,4,1.5,'#a8753e'); }
    for(const sx of [-1,1]){ const bx=cx+sx*148; R(fg,bx-36,cy+12,72,20,BK[2]); R(fg,bx-36,cy+12,72,5,BK[1]); R(fg,bx-36,cy+28,72,4,BK[4]); ell(fg,bx+36*sx,cy+22,6,10,'#c8955a'); ell(fg,bx+36*sx,cy+22,3,5,'#a8753e'); R(fg,bx-26,cy+32,8,12,BK[3]); R(fg,bx+18,cy+32,8,12,BK[3]); } }
  else { const mh=[0,0,0,22,24,26][n], mat=a=>{ const u=Math.floor(a*(n===3?3.2:n===4?5:2.6)); return n===3?(u%2?ST[2]:ST[3]):n===4?(u%2?BR[2]:BR[3]):(u%2?LU[2]:LU[3]); };
    const seg=(G,a0,a1)=>{ for(let a=a0;a<a1;a+=.03){ const px=Math.round(cx+Math.cos(a)*rx), py=Math.round(cy+Math.sin(a)*ry), c=mat(a); R(G,px-3,py-mh,7,mh+2,c); if(Math.cos(a)>.35) shade(G,px-3,py-mh,7,mh+2,'#0a0418',.3); if(Math.cos(a)<-.6) shade(G,px-3,py-mh,7,mh+2,'#fff0c4',.08);
        if(n===4){ R(G,px-3,py-mh+8,7,5,MT[2]); R(G,px-3,py-mh+8,7,1,MT[0]); } else R(G,px-3,py-mh+Math.round(mh/2),7,1,mix(c,'#000000',.3)); }
      for(let a=a0;a<a1;a+=.03){ const px=Math.round(cx+Math.cos(a)*rx), py=Math.round(cy+Math.sin(a)*ry); R(G,px-3,py-mh-2,7,3,n===4?MT[1]:n===5?GO[1]:ST[1]); } };
    seg(bg,Math.PI,Math.PI*2); seg(fg,0,Math.PI);
    if(n===5){ for(let a=0;a<Math.PI;a+=.03){ const px=Math.round(cx+Math.cos(a)*rx), py=Math.round(cy+Math.sin(a)*ry); R(fg,px-3,py,7,2,GO[3]); }
      for(let k=0;k<5;k++){ const a=Math.PI*(.18+k*.16), px=cx+Math.cos(a)*rx, py=cy+Math.sin(a)*ry-mh/2; R(fg,px-5,py-8,11,16,'#160812'); R(fg,px-3,py-7,7,14,'#ff3a3a'); R(fg,px-1,py-6,2,12,'#ffc0b0'); }
      for(const sx of [-1,1]){ const hx=cx+sx*(rx+16); poly(fg,[[hx-9,cy+4],[hx+9,cy+4],[hx+sx*26,cy-74],[hx+sx*12,cy-78]],GO[3]); poly(fg,[[hx-3,cy],[hx+3,cy],[hx+sx*20,cy-66]],GO[1]); R(fg,hx-10,cy,20,6,LU[2]); } }
    if(n===3){ line(bg,cx,cy-160,cx+26,cy-30,'#4a4050',4); line(tg,cx,cy-160,cx-60,cy+8,'#5a5060',5); line(tg,cx,cy-160,cx+64,cy+10,'#5a5060',5); R(tg,cx-1,cy-156,2,48,'#3a3440');
      ell(tg,cx,cy-90,28,22,'#1a1820'); ell(tg,cx-8,cy-98,10,8,'#3a3848'); R(tg,cx-30,cy-110,60,7,'#2a2834'); R(tg,cx-30,cy-110,60,2,'#6a6878'); R(tg,cx-24,cy-114,48,4,'#3a5a3a'); }
    if(n===4){ for(let k=-44;k<=44;k+=11) R(tg,cx+k,cy-54,3,16,'#3a3440'); R(tg,cx-52,cy-56,104,4,MT[2]); R(tg,cx-52,cy-56,104,1,MT[0]); } }
  return FC[n]={b:bc,f:fc,t:tc}; }
function flames(o,cx,by,s,t,red){ const P=red?['#5a0818','#a8182a','#ff4040','#ff9a8a','#fff0e8']:['#7a1a10','#d8461a','#ff9a2a','#ffd860','#fff8d8'], N=7;
  for(let L=0;L<5;L++){ const ls=[1,.84,.64,.44,.24][L]; o.fillStyle=P[L];
    for(let i=0;i<N;i++){ const u=(i-(N-1)/2)/((N-1)/2), bell=1-u*u*.68, nz=.78+.22*Math.sin(t*9.3+i*2.7)+.1*Math.sin(t*17+i*5.1), hgt=150*s*bell*nz*(L===0?1:ls+.12), bx=cx+u*56*Math.max(.45,ls), w0=(28+10*bell)*(.5+ls*.5);
      for(let k=0;k<hgt;k+=2){ const v=k/hgt, wv=w0*Math.pow(1-v,.85)*(v<.12?.65+v/.12*.35:1), sway=Math.sin(t*6+i*1.3+v*4)*v*12*s+Math.sin(t*2.3+i)*v*5, ww=Math.max(2,Math.round(wv/2)*2);
        o.fillRect(Math.round((bx+sway-ww/2)/2)*2,Math.round(by-k),ww,2); } } }
  for(let k=0;k<6;k++){ const ph=(t*1.7+k*.173)%1, x=cx+(hsh(k*7)-.5)*70+Math.sin(t*5+k)*8, y=by-130*s-ph*60*s, r=Math.max(1,Math.round((1-ph)*5)); o.fillStyle=P[ph<.4?2:1]; o.fillRect(Math.round(x/2)*2,Math.round(y/2)*2,r*2,r*2+2); } }
// FIREQ>0 (preset Desempenho): o fogo anda em passos de 1/FIREQ s e o quadro pronto é reaproveitado entre passos
let FIREQ=0; const setFireFps=f=>{ f=f>0?f:0; if(f!==FIREQ){ FIREQ=f; FO.key=null; } };
function fogueira(g,x,y,nivel,aceso,t){ const n=clamp(nivel||1,1,5), B=fireBase(n), w=FW*RS, h=FH2*RS, cx=FAX*RS, cy=FGY*RS, red=n===5; aceso=clamp(aceso||0,0,1); t=t||0;
  // camadas estáticas (base + toras; frente) ficam prontas na GPU; por quadro só o que mexe (brasas, chamas, faíscas)
  // é desenhado num canvas de CPU transparente (willReadFrequently): ~2 mil fillRect por quadro na GPU entupiam o
  // processo de raster (quadros de 50+ ms); na CPU é barato e sobe numa textura só. Com amostragem "nearest", compor as
  // camadas no destino dá o mesmo que compor antes e escalar.
  const lk=aceso>0?'l1':'l0';
  if(!B[lk]){ const [lc,lg]=mk(w,h); lg.drawImage(B.b,0,0);
    for(const [x0,y0,x1,y1] of [[-52,-4,40,-20],[50,-6,-38,-18],[-38,6,36,2]]){ line(lg,cx+x0,cy+y0,cx+x1,cy+y1,'#1e1008',13); line(lg,cx+x0,cy+y0,cx+x1,cy+y1,BK[3],9); line(lg,cx+x0,cy+y0-3,cx+x1,cy+y1-3,BK[2],3); ell(lg,cx+x0,cy+y0,6,6,'#c8955a'); ell(lg,cx+x0,cy+y0,3,3,'#a8753e'); ell(lg,cx+x1,cy+y1,6,6,aceso>0?'#2a120c':'#3a2a24'); }
    B[lk]=lc; }
  if(!B.ft){ const [c2,g2]=mk(w,h); g2.drawImage(B.f,0,0); g2.drawImage(B.t,0,0); B.ft=c2; }
  let fresh=true;
  if(FIREQ){ t=Math.floor(t*FIREQ)/FIREQ; const key=n+'|'+aceso.toFixed(2)+'|'+t; if(FO.c&&FO.key===key) fresh=false; else FO.key=key; } else FO.key=null;
  if(!FO.c) [FO.c,FO.g]=mkC(w,h);
  if(fresh){ const o=FO.g; o.clearRect(0,0,w,h);
    for(let k=0;k<34;k++){ const ex=cx-54+hsh(k)*108, ey=cy-14+hsh(k*3)*22, p=.5+.5*Math.sin(t*(3+hsh(k*5)*4)+k*1.7);
      o.fillStyle=aceso>0?(red?(p>.75?'#ffc0b0':p>.45?'#ff3a3a':'#7a0a18'):(p>.75?'#ffe070':p>.45?'#ff8a2a':'#a8241a')):(p>.85?'#5a1a10':'#2a1410'); o.fillRect(Math.round(ex),Math.round(ey),3,2); }
    if(aceso>0){ flames(o,cx,cy-8,aceso*(.82+.08*n),t,red);
      for(let k=0;k<18;k++){ const sp=.45+hsh(k)*.5, ph=(t*sp+hsh(k*3))%1, sx=cx+(hsh(k*5)-.5)*80+Math.sin(t*3+k)*16*ph, sy=cy-40-ph*190*aceso, sz=ph<.3?3:2; if(sy<4) continue;
        o.globalAlpha=1-ph*.8; o.fillStyle=red?(ph<.35?'#fff0e8':ph<.7?'#ff7a6a':'#c8202a'):(ph<.35?'#fff6c0':ph<.7?'#ffb040':'#e04a1a'); o.fillRect(Math.round(sx),Math.round(sy),sz,sz); }
      o.globalAlpha=1; }
    else { for(let k=0;k<6;k++){ const ph=(t*.45+k/6)%1, sx=cx-6+Math.sin(t*.8+k*1.9)*10*ph+k*2, sy=cy-30-ph*170, r=6+ph*14; o.globalAlpha=.32*(1-ph); ell(o,sx,sy,r,r*.8,ph<.5?'#6a6474':'#4a4654'); } o.globalAlpha=1; } }
  const sm=g.imageSmoothingEnabled; g.imageSmoothingEnabled=false;
  g.drawImage(B[lk],x-FAX,y-FGY,FW,FH2); g.drawImage(FO.c,x-FAX,y-FGY,FW,FH2); g.drawImage(B.ft,x-FAX,y-FGY,FW,FH2);
  g.imageSmoothingEnabled=sm; }

/* =====================================================================
   FUNDO DO MUNDO: muralha + chão + objetos de vida do acampamento (tiles de alta resolução)
   ===================================================================== */
const GATE0=0, GATE1=0; // o portão é uma estrutura no pátio, não um vão na muralha do fundo
function murSpan(g,a,b,n,s){ const hgt=[34,46,54,60,64,68][n]*RS, top=HB-hgt;
  if(n===0){ for(let x=a+10;x<b;x+=56){ if(hsh(x*.13)<.35) continue; const h=40+hsh(x*.7)*50, tl=(hsh(x*.3)-.5)*14; line(g,x,HB+4,x+tl,HB-h,'#2e2026',8); line(g,x,HB+4,x+tl,HB-h,'#5a4236',4); if(hsh(x*1.7)>.5) sag(g,x+tl*.6,HB-h*.6,x+56,HB-h*.5,8,'#6a6a78',1); } return; }
  if(n===1){ let x=a, i=0; while(x<b){ const cw=44+Math.floor(hsh(x*.011+s)*50), v=hsh(x*.07+s), yo=top+14+Math.floor(hsh(x*.03)*22);
      clipR(g,x,yo,cw+4,HB-yo,()=>{ if(v<.45) corrugated(g,x,yo,cw+4,HB-yo,v<.22?RU:ZN,x,.5); else if(v<.75) tarp(g,x,yo,cw+4,HB-yo,v<.6?TG:TB,x); else plywood(g,x,yo,cw+4,HB-yo,x); });
      x+=cw; i++; }
    for(let x=a+6;x<b;x+=36){ const h=hgt+hsh(x*.19)*12-6, tl=(hsh(x*.31)-.5)*8; line(g,x,HB+4,x+tl,HB-h,'#24161c',9); line(g,x,HB+4,x+tl,HB-h,BK[2],5); line(g,x-1,HB+4,x+tl-1,HB-h,BK[1],1); poly(g,[[x+tl-4,HB-h],[x+tl+4,HB-h],[x+tl,HB-h-10]],BK[2]); }
    sag(g,a,top+30,b,top+32,0,'#c8a868',2); for(let x=Math.floor(a/72)*72;x<b;x+=72) sag(g,x,top+60,x+72,top+60,6,'#c8a868',2); return; }
  if(n===2){ for(let x=Math.floor(a/20)*20;x<b;x+=20){ const h=hgt+Math.floor(hsh(x*.17)*12), c=BK; for(let i=0;i<19;i++){ const u=i/19; R(g,x+i,HB-h,1,h,u<.15?c[1]:u<.5?c[2]:u<.8?c[3]:c[4]); } poly(g,[[x,HB-h],[x+19,HB-h],[x+10,HB-h-16]],c[2]); poly(g,[[x,HB-h],[x+6,HB-h],[x+10,HB-h-16]],c[1]); for(let yy=HB-h+20;yy<HB;yy+=26) R(g,x+4,yy,8,2,c[4]); R(g,x+19,HB-h,1,h,c[5]); }
    clipR(g,a,top+26,b-a,14,()=>boardsH(g,a,top+26,b-a,14,WD,s,14)); clipR(g,a,HB-46,b-a,14,()=>boardsH(g,a,HB-46,b-a,14,WD,s+3,14)); for(let x=Math.floor(a/20)*20+10;x<b;x+=40){ R(g,x-2,top+24,5,18,'#c8a868'); R(g,x-2,HB-48,5,18,'#c8a868'); } return; }
  if(n===3){ stoneWall(g,a,top,b-a,hgt,ST,s,true); R(g,a,top-6,b-a,8,ST[1]); R(g,a,top-6,b-a,2,ST[0]); R(g,a,top+2,b-a,2,ST[4]); for(let x=Math.floor(a/72)*72;x<b;x+=72) clipR(g,x,top-34,36,30,()=>stoneWall(g,x,top-34,36,30,ST,x,false)); return; }
  if(n===4){ brickWall(g,a,top,b-a,hgt,s); metalBand(g,a,top+22,b-a,10); metalBand(g,a,HB-34,b-a,10); corrugated(g,a,top-12,b-a,14,ZN,s,.3);
    for(let x=Math.floor(a/22)*22;x<b;x+=22){ for(let k=0;k<20;k++){ const t=k/20*Math.PI*2; R(g,x+11+Math.cos(t)*11,top-26+Math.sin(t)*10,2,2,'#9898a8'); } R(g,x+4,top-36,2,4,'#e0e0e8'); } return; }
  lunarWall(g,a,top,b-a,hgt,s,true); for(let x=Math.floor(a/80)*80;x<b;x+=80){ clipR(g,x,top-30,40,30,()=>lunarWall(g,x,top-30,40,30,x,false)); poly(g,[[x+6,top-30],[x+34,top-30],[x+20,top-56]],GO[3]); poly(g,[[x+10,top-30],[x+20,top-30],[x+20,top-52]],GO[1]); } }
function wallDeco(g,a,b,n){ if(n<1) return; const hgt=[34,46,54,60,64,68][n]*RS, top=HB-hgt;
  for(let x=Math.floor(a/23)*23;x<b;x+=23){ if(hsh(x*.61)<.55) continue; const h=20+hsh(x*1.3)*hgt*.5; g.save(); g.globalAlpha=.22; R(g,x,top+12,4+hsh(x)*6,h,'#1a1020'); R(g,x+1,top+12+h,3,h*.3,'#1a1020'); g.restore(); }
  for(let x=Math.floor(a/430)*430+210;x<b;x+=430){ const pw=n===2?0:34; if(pw){ const pc={1:BK,3:ST,4:BR,5:LU}[n]; if(n===1){ line(g,x,HB+6,x+4,top-24,'#24161c',14); line(g,x,HB+6,x+4,top-24,BK[2],10); line(g,x-3,HB+6,x+1,top-24,BK[1],2); }
      else { clipR(g,x-pw/2,top-18,pw,hgt+18,()=>{ if(n===3) stoneWall(g,x-pw/2,top-18,pw,hgt+18,ST,x,false); else if(n===4) brickWall(g,x-pw/2,top-18,pw,hgt+18,x); else lunarWall(g,x-pw/2,top-18,pw,hgt+18,x,false); }); shade(g,x+pw/2-8,top-18,8,hgt+18,'#0a0418',.35); R(g,x-pw/2-3,top-22,pw+6,6,pc[1]); if(n===5) gold(g,x-pw/2-3,top-24,pw+6,6); } }
    const v=hsh(x*.37); if(n<5&&v<.55){ const w0=pick(['SOS','RECIFE VIVE','TEM GENTE','ABRIGO >','MANGUE','NAO DESISTA','LUA DE SANGUE'],hsh(x*1.9)), col=pick(['#d8283a','#e8e0d0','#ffd23f','#3ad8c8'],hsh(x*2.3)), sc=2, tx=x+40, ty=top+hgt*.38;
      text(g,w0,tx+1,ty+1,sc,'#140a1e'); text(g,w0,tx,ty,sc,col); for(let k=0;k<tw(w0,sc);k+=6) if(hsh(x+k)>.6) R(g,tx+k,ty+14,1,4+hsh(x*k)*10,col); } } }
function groundPaint(g,a,b){
  const y1=WHH, span=Math.max(1,y1-HB);
  for(let y=HB;y<y1;y+=4){ const u=(y-HB)/span, edge=Math.min(1,(y-HB)/90); const base=mix('#241c22','#3a2e2a',Math.min(1,u*1.15)); R(g,a,y,b-a,4,mix('#120c14',base,0.35+edge*.65)); }
  for(let x=Math.floor(a/10)*10;x<b;x+=10) for(let y=HB+4;y<y1;y+=8){ const v=lowf(x,y,4); if(v>.3) shade(g,x,y,10,8,'#6a5340',.14); else if(v<-.3) shade(g,x,y,10,8,'#0c0810',.32); }
  const FX=390*RS, FY=520*RS;
  if(b>FX-460&&a<FX+460){ ell(g,FX,FY+10,360,168,'#3a2c26'); ell(g,FX,FY+6,250,110,'#5a4032'); ell(g,FX,FY,160,62,'#6a4c38'); ell(g,FX,FY,96,36,'#2a1a16');
    for(let i=0;i<90;i++) R(g,FX-240+hsh(i*1.3)*480,FY-80+hsh(i*2.7)*170,3,2,hsh(i*5)>.55?'#a07850':'#241610'); }
  const x0=50*RS, y0=640*RS, x1=FX-30, y2=FY+16, steps=70;
  for(let i=0;i<steps;i++){ const u=i/(steps-1), x=x0+(x1-x0)*u, y=y0+(y2-y0)*u; if(x<a-12||x>b+12) continue; const w=18+Math.sin(u*Math.PI)*16;
    R(g,x,y-w*.4,5,w,'#6a5040'); if(hsh(i*.37)>.4) R(g,x,y-w*.15,5,2,'#8a684c'); shade(g,x,y-w*.4,5,3,'#140c10',.4);
    if(hsh(i*.91)>.72) ell(g,x+8,y+(hsh(i*3)-.5)*w,4,2,'#3a2820'); }
  for(let x=Math.floor(a/28)*28;x<b;x+=28){ const v=hsh(x*.71); if(v<.42) continue; const py=HB+24+hsh(x*1.3)*(span-80), k=.55+(py-HB)/span, w=(5+hsh(x)*9)*k, h=(3+hsh(x*3)*4)*k; ell(g,x+w/2,py+h,w*.7,2,'rgba(8,4,14,.5)'); rock(g,x,py,w,h,rmp('#6e6674')); }
  for(let x=Math.floor(a/520)*520;x<b;x+=520){ let px=x+hsh(x)*160, py=HB+80+hsh(x*3)*(span-200); for(let k=0;k<28;k++){ const nx=px+6+hsh(px*.1+k)*12, ny=py+(hsh(px+k*3)-.5)*8; line(g,px,py,nx,ny,'#140c12',2); line(g,px,py+2,nx,ny+2,'#6a5648',1); px=nx; py=ny; } }
  for(let x=Math.floor(a/640)*640+200;x<b;x+=640){ const px=x+hsh(x)*120, py=HB+140+hsh(x*7)*(span-240), w=40+hsh(x*3)*36; ell(g,px,py+2,w/2+2,w*.1+2,'#140c14'); ell(g,px,py,w/2,w*.1,'#1c2438'); ell(g,px-4,py-1,w*.3,w*.05,'#3a4460'); R(g,px-w*.15,py-1,w*.2,1,'#9aa0c0'); }
  for(let x=Math.floor(a/11)*11;x<b;x+=11){ const v=hsh(x*.29); if(v<.55) continue; const y=HB+2+hsh(x*1.7)*28; for(let k=0;k<4;k++) line(g,x+k*2,y,x+k*2+(k-1.5)*2,y-5-hsh(x+k)*7,k%2?'#3a5234':'#243824',1); }
  for(let x=Math.floor(a/16)*16;x<b;x+=16){ if(hsh(x*.41)<.62) continue; const y=y1-6-hsh(x*2.3)*22; for(let k=0;k<4;k++) line(g,x+k*2,y,x+k*2+(k-2)*2,y-7-hsh(x+k)*10,k%2?'#345030':'#243424',2); }
  for(let x=Math.floor(a/380)*380;x<b;x+=380){ const px=x+40+hsh(x*1.9)*220, py=HB+50+hsh(x*2.9)*(span-160), v=hsh(x*4.1);
    if(v<.3){ R(g,px,py,36,6,WD[3]); R(g,px,py,36,2,WD[1]); } else if(v<.5){ R(g,px,py,8,12,'#2a6a4a'); R(g,px+2,py-3,3,3,'#1e4a34'); } else if(v<.72){ for(let i=0;i<8;i++) R(g,px+hsh(i+x)*40,py+hsh(i*3+x)*16,3,2,pick(['#6a5428','#8a6840','#4a5a32'],hsh(i*7))); } }
  for(let i=0;i<14;i++) shade(g,a,HB+i*3,b-a,3,'#07040e',.4-i*.025);
  shade(g,a,y1-70,b-a,70,'#07040c',.35);
}
function lampPost(g,x,yb,h,s){ R(g,x-4,yb-h,8,h,BK[3]); R(g,x-4,yb-h,2,h,BK[1]); R(g,x+2,yb-h,2,h,BK[4]); R(g,x-2,yb-h+10,30,5,BK[2]); line(g,x+2,yb-h+30,x+20,yb-h+14,BK[3],3); lampiao(g,x+24,yb-h+24); sombra(g,x,yb,16); lt(x+24,yb+6,130,'#ffb860',.75,{ry:.35,fl:1}); }
function stringLights(g,x0,y0,x1,y1,sg){ sag(g,x0,y0,x1,y1,sg,'#1a1220',1,(px,py,i)=>{ if(i%22===11){ const cc=pick(['#ffd23f','#ff7a5a','#fff2c0','#ffb0d0','#9ae8ff'],hsh(px*.11)); R(g,px-1,py,3,3,'#2a2232'); emit(g,G=>{ ell(G,px,py+6,3,4,cc); R(G,px-1,py+4,1,2,'#ffffff'); }); lt(px,py+6,34,cc,.55,{gl:.5}); } }); }
function cadeira(g,x,yb,col,d){ const c=rmp(col), bx=d>0?x:x+34; sombra(g,x+18,yb,22); for(const [lx,ly] of [[x+2,0],[x+30,0],[x+8,-6],[x+34,-6]]) R(g,lx,yb-24+ly,3,24,c[ly?4:3]);
  poly(g,[[x,yb-24],[x+32,yb-24],[x+38,yb-30],[x+6,yb-30]],c[1]); R(g,x,yb-24,32,4,c[2]); R(g,x,yb-21,32,1,c[4]);
  const sx=d>0?x+2:x+30; poly(g,[[sx,yb-28],[sx+6,yb-30],[sx+8-(d>0?0:12),yb-62],[sx+2-(d>0?0:12),yb-60]],c[2]); R(g,Math.min(sx,sx-12)+2,yb-62,16,10,c[1]); R(g,Math.min(sx,sx-12)+4,yb-58,12,2,c[3]); }
function bambu(g,x,yb,h){ R(g,x-3,yb-h,6,h,'#6a7a4a'); R(g,x-3,yb-h,2,h,'#9aaa6a'); for(let y=yb-h+16;y<yb;y+=22) R(g,x-4,y,8,2,'#4a5a34'); }
function carroVelho(g,x,yb){ const c=rmp('#4a6a8a'); ell(g,x+150,yb+2,170,9,'rgba(8,4,18,.55)'); poly(g,[[x,yb-20],[x+10,yb-70],[x+70,yb-76],[x+110,yb-122],[x+220,yb-122],[x+262,yb-78],[x+300,yb-70],[x+304,yb-20]],c[4]);
  poly(g,[[x+2,yb-24],[x+12,yb-68],[x+72,yb-74],[x+112,yb-118],[x+218,yb-118],[x+258,yb-76],[x+298,yb-68],[x+300,yb-24]],c[2]); R(g,x+12,yb-68,286,6,c[1]); poly(g,[[x+120,yb-112],[x+170,yb-112],[x+170,yb-78],[x+92,yb-78]],'#1a1828'); poly(g,[[x+178,yb-112],[x+214,yb-112],[x+246,yb-78],[x+178,yb-78]],'#1a1828'); line(g,x+128,yb-108,x+160,yb-84,'#5a5a7a',2);
  for(let i=0;i<9;i++){ g.save(); g.globalAlpha=.8; blob(g,x+20+hsh(i*3)*260,yb-64+hsh(i*5)*36,14+hsh(i)*30,8+hsh(i*7)*14,RU[3]); g.restore(); } R(g,x+120,yb-74,2,50,c[4]); R(g,x+200,yb-74,2,50,c[4]);
  for(const wx of [x+60,x+240]){ ell(g,wx,yb-18,26,24,'#120e18'); R(g,wx-22,yb-12,44,12,'#3a3448'); } caixote(g,x+44,yb+2,40,22,7); caixote(g,x+222,yb+2,40,22,9,WDD); R(g,x+290,yb-60,14,10,'#e8c060'); }
let DEC=null, DLIGHTS=[];
function buildDecor(){ DEC=[]; const D=(x0,x1,f)=>DEC.push({x0,x1,f});
  D(0,WORLD*RS+80,g=>{
    barril(g,64*RS,730*RS,RU,1,34,46); barril(g,102*RS,748*RS,TB,2,30,42); pneus(g,156*RS,790*RS,20,2);
    caixote(g,590*RS,390*RS,46,34,4); caixote(g,628*RS,368*RS,36,28,5,WDD); barril(g,548*RS,610*RS,MT,6,32,44);
    lampPost(g,500*RS,548*RS,160,3); lampPost(g,168*RS,410*RS,140,8);
    cadeira(g,248*RS,600*RS,'#c8c2b4',1); cadeira(g,468*RS,608*RS,'#3a5a78',-1);
    stringLights(g,150*RS,246*RS,390*RS,236*RS,34); stringLights(g,390*RS,236*RS,640*RS,252*RS,38);
    balde(g,86*RS,900*RS); galao(g,640*RS,960*RS,'#8a2a22'); caixote(g,70*RS,980*RS,40,28,9);
    bambu(g,700*RS,360*RS,120); bambu(g,720*RS,520*RS,90);
  });
  const [,g0]=mk(1,1); LQ=[]; LL=[]; for(const d of DEC) d.f(g0); DLIGHTS=LL.map(L=>({x:L.x/RS,y:L.y/RS,r:L.r/RS,c:L.c,a:L.a,p:L.p,gl:L.gl,fl:L.fl,ry:L.ry})); LQ=null; LL=null; }
const TILE=1500, NT=Math.ceil(WORLD*RS/TILE), TL={}, WC={};
function wallCanvas(mn){ if(WC[mn]) return WC[mn]; const [c,g]=mk(WORLD*RS,HB+12); clipR(g,0,0,WORLD*RS,HB,()=>{ murSpan(g,-40,WORLD*RS+40,mn,4); wallDeco(g,16,WORLD*RS-16,mn); }); return WC[mn]=c; }
function sideWalls(g,n){ if(n<1) return; const t=Math.round(22*RS), y0=HB-6, y1=WHH+4, gap0=Math.round(490*RS), gap1=Math.round(680*RS);
  const paint=(x,y,w,h)=>{ if(w<2||h<8) return; clipR(g,x,y,w,h,()=>panel(g,x,y,w,h,n,7,false)); shade(g,x,y,Math.min(10,w),h,'#07040e',.35); };
  paint(0,y0,t,gap0-y0); paint(0,gap1,t,y1-gap1); paint(Math.round(WORLD*RS)-t,y0,t,y1-y0); }
const BG_GRADE=[[0,'#7c769c'],[.45,'#5c5678'],[1,'#3a344c']];
function renderTile(mn,i){ if(!DEC) buildDecor(); const X0=i*TILE, X1=Math.min(WORLD*RS,X0+TILE), [c,g]=mk(TILE,WHH);
  g.translate(-X0,0); LQ=[]; LL=null;
  clipR(g,X0,0,X1-X0,WHH,()=>{ for(let y=HB-64;y<HB;y+=2){ const u=(y-HB+64)/64; R(g,X0,y,X1-X0,2,mix('#1a1428','#2a2428',u*u)); } for(let x=Math.floor(X0/40)*40;x<X1;x+=40){ const v=hsh(x*.17); if(v<.45) continue; const bw=16+v*28, bh=6+hsh(x*3)*10; ell(g,x+bw/2,HB-48+hsh(x*5)*18,bw/2,bh/2,'#161228'); }
    g.drawImage(wallCanvas(mn),X0,0,X1-X0,HB+12,X0,0,X1-X0,HB+12);
    groundPaint(g,X0-40,X1+40); sideWalls(g,mn); for(const d of DEC) if(d.x1>X0-60&&d.x0<X1+60) d.f(g); });
  const q=LQ; LQ=null; g.setTransform(1,0,0,1,0,0); gradeCanvas(c,g,BG_GRADE); g.translate(-X0,0); for(const fn of q) fn(g);
  return c; }
function tileAt(mn,i){ const a=TL[mn]||(TL[mn]=[]); return a[i]||(a[i]=renderTile(mn,i)); }

/* =====================================================================
   CÉU E CIDADE EM RUÍNAS (parallax)
   ===================================================================== */
const SKYP={noite:{g:['#04040e','#070812','#0c101c','#121820','#181c28','#22262c','#2c2e30','#34302c','#40362e','#4a3c30'],star:'#e4e0e8',moon:['#fff6dc','#e8e0c4','#b8b09a','#8a8474'],mr:26,mx:520,my:58,glow:'#c8b890',cloud:['#141820','#1c2228','#2a3034','#3a4038'],f1:'#1a1e28','f1w':'#c8a060',f2:'#12161e',f2w:'#e09050',f3:'#0c1016',fire:'#ff7a3a'},
  lua:{g:['#0c0206','#160308','#22050c','#300810','#400c14','#521018','#66161c','#7c1e22','#922a28','#a8382e'],star:'#ffd0c8',moon:['#ffa47a','#f0603e','#c4342a','#86181a'],mr:54,mx:730,my:96,glow:'#ff4a3a',cloud:['#2a0610','#40101a','#5c1822','#82282c'],f1:'#440c18',f1w:'#ff8a5a',f2:'#2a060e',f2w:'#ffa060',f3:'#160308',fire:'#ff5a2a'}};
SKYP.dia=SKYP.noite;
// manhã, tarde e anoitecer (DN-03): céu claro com sol, cidade em ruínas na névoa azul; no anoitecer as fogueiras da cidade acendem
SKYP.manha={g:['#3c6ad6','#4878de','#5686e4','#6696ea','#78a6ee','#8cb4f0','#a2c2f0','#bccef0','#d8d4ec','#f2d6d6'],star:null,sol:true,moon:['#fffff4','#fff6d0','#ffe9a6','#f2d27e'],mr:24,mx:200,my:110,glow:'#fff2c4',cloud:['#c6cdea','#e6eaf8','#ffffff','#ffffff'],f1:'#7c8ec2',f1w:'#b4c8ec',f2:'#5c6caa',f2w:'#9cb2e2',f3:'#3e4a7a',fire:'#ffd0a0'};
SKYP.tarde={g:['#2c5cca','#3a6ad2','#4a7ad8','#5a88de','#6e98e2','#84a8e4','#9eb6e2','#bec2dc','#dec6ba','#f6c892'],star:null,sol:true,moon:['#fffff2','#fff8d4','#ffeca4','#f8d872'],mr:22,mx:780,my:56,glow:'#fff4ca',cloud:['#d6c6d6','#f2eaf0','#ffffff','#fff0e0'],f1:'#8a88b8',f1w:'#ccc8ea',f2:'#6a68a2',f2w:'#b2b0da',f3:'#463e6e',fire:'#ffc890'};
SKYP.anoitecer={g:['#1a1450','#2a1a64','#3e2274','#562a80','#702e84','#8c3484','#aa3e7e','#c84e70','#e46a5a','#f89a4a'],star:'#f0d8ff',ns:50,sol:true,moon:['#fff2c4','#ffc274','#ff9254','#e86a3a'],mr:42,mx:620,my:250,glow:'#ff8a4a',cloud:['#4a2058','#7a3064','#ffb070','#c86070'],f1:'#3a2462',f1w:'#ffc070',f2:'#26184a',f2w:'#ffb060',f3:'#1a1032',fire:'#ff8a3a'};
function sol(g,P,mx,my,mr){ const S=P.moon; ell(g,mx,my,mr+3,mr+3,S[3]); ell(g,mx,my,mr,mr,S[2]); ell(g,mx-mr*.08,my-mr*.08,mr*.84,mr*.84,S[1]); ell(g,mx-mr*.2,my-mr*.2,mr*.5,mr*.5,S[0]);
  for(let k=0;k<16;k++){ const a=k/16*Math.PI*2, r0=mr+8+(k%2)*4, r1=r0+6+(k%3)*4; for(let r=r0;r<r1;r+=2) R(g,Math.round(mx+Math.cos(a)*r),Math.round(my+Math.sin(a)*r),2,2,k%2?S[2]:S[1]); } }
const skyCache={}, stripCache={};
function skyCanvas(mode){ if(skyCache[mode]) return skyCache[mode]; const P=SKYP[mode], SH=HB+10, [c,g]=mk(HW,SH), n=P.g.length, bh=SH/n;
  for(let i=0;i<n;i++){ R(g,0,i*bh,HW,bh+1,P.g[i]); if(i<n-1){ g.fillStyle=P.g[i+1]; for(let y=Math.round((i+1)*bh)-4;y<Math.round((i+1)*bh);y++) for(let x=(y%2)*2;x<HW;x+=(y%4<2?4:2)) g.fillRect(x,y,2,1); } }
  const NS=P.ns??(P.star?200:0); for(let i=0;i<NS;i++){ const x=Math.floor(hsh(i*3.1)*HW), y=Math.floor(Math.pow(hsh(i*7.3),1.6)*220), v=hsh(i*1.9); g.fillStyle=v>.85?'#ffffff':v>.5?P.star:mix(P.star,P.g[3],.5); g.fillRect(x,y,v>.7?2:1,v>.7?2:1);
    if(v>.95){ g.fillRect(x-2,y,6,1); g.fillRect(x,y-2,1,6); } }
  for(let i=0;i<10;i++){ const cx=hsh(i*5.1)*HW, cy=30+hsh(i*2.7)*140; g.save(); g.globalAlpha=.05; ell(g,cx,cy,120+hsh(i)*120,30+hsh(i*3)*30,P.cloud[3]); g.restore(); }
  const mx=P.mx, my=P.my, mr=P.mr; g.save(); g.globalCompositeOperation='lighter'; for(let k=6;k>=1;k--){ g.globalAlpha=P.sol?.06:.035; ell(g,mx,my,mr*(1+k*(P.sol?.7:.45)),mr*(1+k*(P.sol?.7:.45)),P.glow); } g.restore();
  if(P.sol){ sol(g,P,mx,my,mr); return skyCache[mode]=c; }
  ell(g,mx,my,mr,mr,P.moon[1]); ell(g,mx-mr*.15,my-mr*.15,mr*.82,mr*.82,P.moon[0]); for(let dy=-mr;dy<=mr;dy++){ const hw=Math.sqrt(mr*mr-dy*dy); R(g,mx+hw*.55,my+dy,hw*.45,1,P.moon[2]); R(g,mx+hw*.85,my+dy,hw*.15,1,P.moon[3]); }
  [[-.3,-.25,.34,.2],[.05,.1,.22,.3],[-.45,.3,.16,.12],[.35,-.3,.12,.1]].forEach(([dx,dy,rx,ry])=>{ ell(g,mx+dx*mr,my+dy*mr,rx*mr,ry*mr+2,P.moon[2]); ell(g,mx+dx*mr+rx*mr*.2,my+dy*mr+1,rx*mr*.6,ry*mr*.6+1,mix(P.moon[2],P.moon[3],.5)); });
  return skyCache[mode]=c; }
function cloudStrip(mode){ const k='c'+mode; if(stripCache[k]) return stripCache[k]; const P=SKYP[mode], W0=2400, [c,g]=mk(W0,HB);
  for(let i=0;i<14;i++){ const cx=hsh(i*4.3)*W0, cy=40+hsh(i*7.1)*130, w=140+hsh(i*2.2)*220, h=12+hsh(i*3.9)*14; for(const off of [0,-W0,W0]){ const x=cx+off;
    ell(g,x,cy,w*.5,h,P.cloud[0]); ell(g,x-w*.15,cy-h*.6,w*.3,h*.9,P.cloud[0]); ell(g,x+w*.18,cy-h*.4,w*.25,h*.8,P.cloud[0]); R(g,x-w*.5,cy+h*.4,w,h*.6,P.cloud[0]);
    ell(g,x-w*.15,cy-h*.9,w*.24,h*.5,P.cloud[1]); ell(g,x+w*.18,cy-h*.7,w*.18,h*.4,P.cloud[1]); R(g,x-w*.32,cy-h*1.25,w*.3,2,P.cloud[2]); g.clearRect(x-w*.6,cy+h,w*1.2,h*2); } }
  return stripCache[k]=c; }
function ruinsStrip(mode,lvl){ const k='r'+lvl+mode; if(stripCache[k]) return stripCache[k]; const P=SKYP[mode], W0=lvl===3?2000:2400, [c,g]=mk(W0,HB+10);
  if(lvl===1){ const cc=rmp(P.f1), base=206; for(let x=0;x<W0;){ const v=hsh(x*.013+1), w=30+Math.floor(hsh(x*.07)*60), h=v>.85?150+hsh(x)*40:50+Math.floor(hsh(x*.031)*100);
      if(v>.2){ const side=Math.round(w*.22), pts=[[x,base]]; let px=x; const top=base-h; pts.push([x,top+hsh(x*1.1)*10]); const nb=3+Math.floor(hsh(x*.9)*4); for(let j=1;j<nb;j++){ const xx=x+w*j/nb; pts.push([xx,top+(hsh(x+j*3.7)>.5?hsh(x*j)*h*.35:0)]); } pts.push([x+w,top+hsh(x*2.3)*h*.4]); pts.push([x+w,base]);
        poly(g,pts,cc[2]); clipP(g,pts,()=>{ R(g,x+w-side,base-h-40,side,h+40,cc[3]); R(g,x,base-h-40,2,h+40,cc[1]); for(let yy=top+6;yy<base;yy+=7) R(g,x+2,yy,w-side-2,1,mix(cc[2],cc[3],.4)); for(let yy=top+6;yy<base-4;yy+=7) for(let xx=x+4;xx<x+w-side-2;xx+=5){ const lv=hsh(xx*1.7+yy*.31); if(lv>.95){ g.fillStyle=mix(P.f1w,P.f1,.25); g.fillRect(xx,yy,2,3); } else if(lv<.25){ g.fillStyle=cc[4]; g.fillRect(xx,yy,2,3); } } });
        if(v>.75){ for(let j=0;j<4;j++) line(g,x+w*.2+j*5,top+8,x+w*.2+j*5+3,top-10-hsh(j+x)*10,cc[3],1); } if(h>140){ R(g,x+w/2,top-24,2,24,cc[3]); R(g,x+w/2,top-26,2,2,'#ff3a3a'); } }
      x+=w+Math.floor(hsh(x*.17)*14); }
    for(let i=0;i<5;i++){ const fx=hsh(i*9.1)*W0, fy=base-10; g.save(); g.globalCompositeOperation='lighter'; for(let r=0;r<5;r++){ g.globalAlpha=.05; ell(g,fx,fy,50+r*30,18+r*8,P.fire); } g.restore(); } }
  else if(lvl===2){ const cc=rmp(P.f2), base=232; for(let x=0;x<W0;){ const v=hsh(x*.021+3), w=50+Math.floor(hsh(x*.05)*80), h=40+Math.floor(hsh(x*.09)*60);
      const top=base-h; poly(g,[[x,base],[x,top],[x+w*.4,top-hsh(x)*8],[x+w*.55,top+h*.3*hsh(x*3)],[x+w,top+6],[x+w,base]],cc[2]); R(g,x,top,2,h,cc[1]); R(g,x+w-6,top+6,6,h-6,cc[3]);
      if(v<.45){ poly(g,[[x-4,top],[x+w*.35,top-26],[x+w*.5,top-10],[x+w*.42,top]],cc[3]); for(let j=0;j<5;j++) line(g,x+w*.5+j*6,top-8+j*2,x+w*.5+j*6+4,top+8,cc[4],1); }
      for(let yy=top+10;yy<base-8;yy+=14) for(let xx=x+8;xx<x+w-10;xx+=14){ R(g,xx,yy,6,7,cc[4]); if(hsh(xx*.7+yy*1.3)>.9){ g.fillStyle=P.f2w; g.fillRect(xx,yy,6,7); g.fillStyle=mix(P.f2w,'#ffffff',.4); g.fillRect(xx,yy,2,2); } }
      if(v>.9){ const tx=x+w/2; R(g,tx-10,top-80,20,80,cc[2]); R(g,tx+4,top-80,6,80,cc[3]); poly(g,[[tx-13,top-80],[tx,top-104],[tx+13,top-80]],cc[3]); R(g,tx-1,top-114,2,12,cc[3]); R(g,tx-5,top-110,10,2,cc[3]); R(g,tx-4,top-70,8,12,'#0a0614'); }
      else if(v>.8){ const tx=x+w/2; for(const lx of [tx-20,tx+18]) R(g,lx,top-60,3,60,cc[3]); line(g,tx-20,top-20,tx+20,top-56,cc[3],2); line(g,tx+20,top-20,tx-20,top-56,cc[3],2); R(g,tx-26,top-90,54,32,cc[2]); R(g,tx-26,top-90,54,3,cc[1]); }
      x+=w+Math.floor(hsh(x*.3)*20); } }
  else { const col=P.f3, base=HB+10; for(let x=40;x<W0;x+=110+Math.floor(hsh(x)*120)){ const h=150+hsh(x*3)*80, top=base-h; for(let y=top;y<base;y+=2){ const xx=x+Math.round(Math.sin((y-top)/120)*10); R(g,xx-4,y,8,2,col); }
      for(let k=0;k<9;k++){ const a=-Math.PI+k*(Math.PI/8)+(hsh(k+x)-.5)*.3, len=60+hsh(k*3+x)*30; for(let r=0;r<len;r+=2){ const px=x+Math.cos(a)*r, py=top+Math.sin(a)*r*.5+r*r/180; R(g,px-1,py-1,4,3,col); if(r%6===0) line(g,px,py,px+Math.cos(a+1.4)*8,py+10,col,1); } } } }
  return stripCache[k]=c; }
function strip(g,cv,off){ const w=cv.width, h=cv.height, o=((Math.round(off)%w)+w)%w, w1=Math.min(w-o,HW); g.drawImage(cv,o,0,w1,h,0,0,w1/RS,h/RS); if(w1<HW) g.drawImage(cv,0,0,HW-w1,h,w1/RS,0,(HW-w1)/RS,h/RS); }
function drawSky(g,mode,camPx,t){ const P=SKYP[mode]; R(g,0,0,W,H,P.g[P.g.length-1]); const sk=skyCanvas(mode); g.drawImage(sk,0,0,W,sk.height/RS);
  g.save(); g.globalCompositeOperation='lighter'; for(let i=0;i<10;i++){ const a=.5+.5*Math.sin(t*(1.3+hsh(i)*2)+i*2.1); if(a<.6) continue; g.globalAlpha=(a-.6)*2; const x=hsh(i*13.3)*HW, y=hsh(i*4.7)*150; g.fillStyle='#ffffff'; g.fillRect((x-3)/RS,y/RS,7/RS,1/RS); g.fillRect(x/RS,(y-3)/RS,1/RS,7/RS); } g.restore();
  strip(g,cloudStrip(mode),camPx*.03+t*3); strip(g,ruinsStrip(mode,1),camPx*.08); strip(g,ruinsStrip(mode,2),camPx*.2); strip(g,ruinsStrip(mode,3),camPx*.42); }

/* =====================================================================
   LUZ: mapa de luz (multiply) sobre o mundo + halos aditivos
   ===================================================================== */
const haloC={};
function halo(col){ if(haloC[col]) return haloC[col]; const S=128, [c,g]=mk(S,S), img=g.createImageData(S,S), d=img.data, [r,gg,b]=hx(col);
  for(let y=0;y<S;y++) for(let x=0;x<S;x++){ const dd=Math.hypot(x-63.5,y-63.5)/64; if(dd>=1) continue; const q=Math.ceil((1-dd)*8)/8, p=(y*S+x)*4; d[p]=r; d[p+1]=gg; d[p+2]=b; d[p+3]=Math.round(255*Math.pow(q,1.7)); }
  g.putImageData(img,0,0); return haloC[col]=c; }
const AMB={manha:[[0,'#fff6f4'],[.5,'#faf0f4'],[1,'#ece0ee']], tarde:[[0,'#fff2dc'],[.5,'#fbe8d0'],[1,'#ecd0bc']], anoitecer:[[0,'#c89098'],[.4,'#8a5868'],[.7,'#4a3040'],[1,'#241820']], noite:[[0,'#4e4a68'],[.28,'#322e4a'],[.58,'#1c1a2e'],[.82,'#121018'],[1,'#0a0810']], lua:[[0,'#a06070'],[.35,'#6a3044'],[.65,'#3a1824'],[1,'#14080e']]};
const ambC={};
function ambient(mode){ if(ambC[mode]) return ambC[mode]; const [c,g]=mk(HW,HH), st=AMB[mode]||AMB.noite; for(let y=0;y<HH;y+=6){ const u=y/HH; let i=0; while(i<st.length-2&&u>st[i+1][0]) i++; const k=(u-st[i][0])/(st[i+1][0]-st[i][0]); R(g,0,y,HW,6,mix(st[i][1],st[i+1][1],clamp(k,0,1))); } return ambC[mode]=c; }
const LIGHTS=[], LAY={};
/* clima no pátio do abrigo (CLM-13): state.clima vem do relógio do mundo; a Lua de Sangue deixa só a chuva (CLM-11) */
let WX=null, WXk='', WXt=0;
function climaFx(state,mode,t){ if(typeof CLIMA==='undefined'||!state.clima) return null;
  if(!WX){ WX=CLIMA.make({W:HW,H:HH,RS,HZ:HB,Y0:HB+70,Y1:HH-12}); WXk=''; }
  const k=state.clima+'|'+mode; if(k!==WXk){ WX.set(state.clima,mode,!WXk); WXk=k; }
  WX.update(Math.max(0,Math.min(.1,t-WXt))); WXt=t; return WX; }
function draw(g,cam,state,t,opts={}){
  state=state||{}; t=t||0; const mode=state.lua?'lua':(SKYP[state.ceu]?state.ceu:(state.noite===false?'dia':'noite')), E=state.estruturas||{}, day=mode==='manha'||mode==='tarde';
  const wx=climaFx(state,mode,t);
  let camY=0;
  if(cam&&typeof cam==='object'){ camY=+cam.y||0; cam=+cam.x||0; }
  const maxX=Math.max(0,WORLD-W), maxY=Math.max(0,WORLDH-H);
  camY=Math.round(Math.max(0,Math.min(maxY,(state.camY!=null?state.camY:camY)||0)));
  cam=Math.round(Math.max(0,Math.min(maxX,cam||0))); const camPx=cam*RS, camYpx=camY*RS;
  g.save(); g.imageSmoothingEnabled=false;
  drawSky(g,mode==='dia'?'noite':mode,camPx,t);
  if(wx) wx.sky(g,cam,t);
  if(!LAY.c){ [LAY.c,LAY.g]=mk(HW,HH); [LAY.m,LAY.mg]=mk(HW,HH); [LAY.l,LAY.lg]=mk(HW,HH); }
  const L=LAY.g; L.setTransform(1,0,0,1,0,0); L.globalCompositeOperation='source-over'; L.globalAlpha=1; L.clearRect(0,0,HW,HH); L.imageSmoothingEnabled=false;
  const mn=clamp(E.muralha|0,0,5), i0=Math.floor(camPx/TILE), i1=Math.min(NT-1,Math.floor((camPx+HW-1)/TILE));
  for(let i=i0;i<=i1;i++) L.drawImage(tileAt(mn,i),i*TILE-camPx,-camYpx);
  if(i1+1<NT&&!(TL[mn]&&TL[mn][i1+1])&&!draw._pend){ draw._pend=true; setTimeout(()=>{ tileAt(mn,i1+1); draw._pend=false; },0); }
  if(wx) wx.ground(L,cam,t);
  L.setTransform(RS,0,0,RS,0,0);
  LIGHTS.length=0; const fl=(x)=>1+.05*Math.sin(t*11+x)+.03*Math.sin(t*23+x*1.7), pu=(x)=>.72+.28*Math.sin(t*2.6+x*.7);
  const pushL=(o,x,y)=>{ LIGHTS.push({x,y,r:o.r*(o.fl?fl(x):1),c:o.c,a:o.a*(o.p?pu(x):1),gl:o.gl||0,ry:o.ry}); };
  for(const o of DLIGHTS) pushL(o,o.x,o.y);
  const items=SLOTS.map(s=>({s,y:s.gy})); items.sort((a,b)=>a.y-b.y);
  let aY=-1e9, aDone=false; const drawActors=(hi=1e9)=>{ if(aDone||!opts.drawActors) return; L.save(); L.setTransform(RS,0,0,RS,0,0); opts.drawActors(L,cam,aY,hi); L.restore(); L.setTransform(RS,0,0,RS,0,0); aY=hi; if(hi>=1e9) aDone=true; };
  for(const {s} of items){
    drawActors(s.gy);
    const n=E[s.id]||0, cx=s.x+s.largura/2, sy=s.gy-camY;
    if(s.id==='fogueira'){ const fn=clamp(n||1,1,5), fogo=clamp(state.fogo||0,0,1);
      if(sy>-150&&sy<H+50&&cx-cam>-160&&cx-cam<W+160) fogueira(L,cx-cam,sy,fn,fogo,t);
      if(fogo>0){ const col=fn===5?'#ff4a34':'#ffae5a', f=fl(cx)*(.94+.06*Math.sin(t*7)); LIGHTS.push({x:cx,y:s.gy-18,r:(100+180*fogo)*(.94+.05*fn)*f,c:col,a:Math.min(1,fogo),gl:.92}); LIGHTS.push({x:cx,y:s.gy+6,r:(140+200*fogo)*f,c:col,a:fogo*.9,gl:0,ry:.34}); }
      continue; }
    const sp=sprite(n?s.id:'vazio',n||1), x=cx-cam-sp.ax, y=sy-sp.gy;
    const vis=x<W+8&&x+sp.w>-8&&y<H+40&&y+sp.h>-40;
    if(vis) L.drawImage(sp.c,x,y,sp.w,sp.h);
    for(const o of sp.lights) pushL(o,cx+o.x,s.gy+o.y);
    if(s.id==='gerador'&&n&&vis){ const sm=DRAW.gerador.smoke[n]; L.save(); L.setTransform(1,0,0,1,0,0); for(let k=0;k<5;k++){ const ph=(t*.7+k/5)%1, px=(cx+sm[0]-cam+Math.sin(t*1.3+k*2)*3*ph+ph*8)*RS, py=(sy+sm[1]-ph*34)*RS, r=(2+ph*5)*RS; L.globalAlpha=.55*(1-ph); ell(L,px,py,r,r*.85,n===5?(ph<.4?'#c8323a':'#5a2030'):(ph<.4?'#8a8494':'#4e4a58')); ell(L,px-r*.3,py-r*.3,r*.45,r*.35,n===5?'#e86a6a':'#aaa4b4'); } L.restore(); L.setTransform(RS,0,0,RS,0,0); } }
  drawActors();
  L.setTransform(1,0,0,1,0,0);
  if(mode!=='dia'){ const lg=LAY.lg; lg.setTransform(1,0,0,1,0,0); lg.globalCompositeOperation='source-over'; lg.globalAlpha=1; lg.drawImage(ambient(mode),0,0); lg.globalCompositeOperation='lighter'; lg.imageSmoothingEnabled=false;
    for(const o of LIGHTS){ const sx=(o.x-cam)*RS, sy=(o.y-camY)*RS, r=o.r*RS, ry=r*(o.ry||1); if(sx+r<0||sx-r>HW||sy+ry<0||sy-ry>HH||o.a<=0) continue; lg.globalAlpha=Math.min(1,o.a)*(mode==='anoitecer'?.75:1); lg.drawImage(halo(mode==='lua'&&o.c==='#ffae5a'?'#ff8a4a':o.c),sx-r,sy-ry,r*2,ry*2); }
    lg.globalAlpha=1; lg.globalCompositeOperation='source-over';
    const mg=LAY.mg; mg.globalCompositeOperation='copy'; mg.drawImage(LAY.c,0,0); mg.globalCompositeOperation='source-over';
    L.globalCompositeOperation='multiply'; L.drawImage(LAY.l,0,0); L.globalCompositeOperation='destination-in'; L.drawImage(LAY.m,0,0); L.globalCompositeOperation='source-over'; }
  g.drawImage(LAY.c,0,0,W,H);
  if(mode!=='dia'&&!state.noGlow){ g.globalCompositeOperation='lighter'; for(const o of LIGHTS){ if(!o.gl||o.a<=0) continue; const x=o.x-cam, y=o.y-camY, r=o.r*.75, ry=r*(o.ry||1); if(x+r<0||x-r>W||y+ry<0||y-ry>H) continue; g.globalAlpha=Math.min(1,o.gl*o.a*.38)*(day?.25:mode==='anoitecer'?.7:1); g.drawImage(halo(o.c),x-r,y-ry,r*2,ry*2); } g.globalAlpha=1; g.globalCompositeOperation='source-over'; }
  if(!day){ const vg=g.createRadialGradient(W*.5,H*.42,Math.min(W,H)*.16,W*.5,H*.48,Math.max(W,H)*.68); vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,mode==='lua'?'rgba(24,0,6,.52)':'rgba(2,1,8,.58)'); g.fillStyle=vg; g.fillRect(0,0,W,H); }
  if(wx) wx.front(g,cam,t);
  g.restore();
}
function slotAt(worldX){ return SLOTS.find(s=>worldX>=s.x&&worldX<s.x+s.largura)||null; }
function prewarm(E){ E=E||{}; for(const s of SLOTS) if(s.id!=='fogueira') sprite(E[s.id]?s.id:'vazio',E[s.id]||1); }
return {STRUCT,SLOTS,SLOT,W,H,RS,WORLD,WORLDH,BASE,FLOOR,MATNOME,draw,fogueira,slotAt,sprite,prewarm,DRAW,LIGHTS,setFireFps};
})();

PIX.seal();
return {PIX:typeof PIX!=='undefined'?PIX:null,ITEMS:typeof ITEMS!=='undefined'?ITEMS:null,TWEEN:typeof TWEEN!=='undefined'?TWEEN:null,BATON:typeof BATON!=='undefined'?BATON:null,GUN:typeof GUN!=='undefined'?GUN:null,ARMAS_ICON:typeof ARMAS_ICON!=='undefined'?ARMAS_ICON:null,GOLPES_ICON:typeof GOLPES_ICON!=='undefined'?GOLPES_ICON:null,MENU_ICON:typeof MENU_ICON!=='undefined'?MENU_ICON:null,HEROI:typeof HEROI!=='undefined'?HEROI:null,VIGIA:typeof VIGIA!=='undefined'?VIGIA:null,SERRALHEIRO:typeof SERRALHEIRO!=='undefined'?SERRALHEIRO:null,PEDREIRA:typeof PEDREIRA!=='undefined'?PEDREIRA:null,LENHADOR:typeof LENHADOR!=='undefined'?LENHADOR:null,CATA:typeof CATA!=='undefined'?CATA:null,AGRI:typeof AGRI!=='undefined'?AGRI:null,CAPO:typeof CAPO!=='undefined'?CAPO:null,ENFE:typeof ENFE!=='undefined'?ENFE:null,PET_CACHORRO:typeof PET_CACHORRO!=='undefined'?PET_CACHORRO:null,PET_GATO:typeof PET_GATO!=='undefined'?PET_GATO:null,PET_CAPIVARA:typeof PET_CAPIVARA!=='undefined'?PET_CAPIVARA:null,JABU:typeof JABU!=='undefined'?JABU:null,PAPA:typeof PAPA!=='undefined'?PAPA:null,SAGU:typeof SAGU!=='undefined'?SAGU:null,CUSP:typeof CUSP!=='undefined'?CUSP:null,GRIT:typeof GRIT!=='undefined'?GRIT:null,BARR:typeof BARR!=='undefined'?BARR:null,CLIMA:typeof CLIMA!=='undefined'?CLIMA:null,ABRIGO:typeof ABRIGO!=='undefined'?ABRIGO:null};
})();
