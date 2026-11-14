/* ART WORKER — trabalho pesado de arte fora da thread principal (OffscreenCanvas).
   Copiado para public/art/art-worker.js por tools/build-art.mjs; carrega o mesmo art-exp.js da página.
   Hoje: prévias dos cartões de mapa (MAP.build + cenário ~1 s por mapa travariam o modal de escolha).
     main -> {t:'prev', id, art, k, rs}   worker -> {t:'prev', id, url|null}  (data URL JPEG 480×270)
   Obs.: sprites de personagem NÃO são gerados aqui — clip() do OffscreenCanvas tem antialias diferente do
   canvas da página e mudaria pixels de borda; prévia reduzida em JPEG não sofre com isso. */
self.window=self;
self.document={createElement:function(){ return new OffscreenCanvas(1,1); }};
let ok=true;
try{ importScripts('art-exp.js'); }catch(e){ ok=false; }
// prévia do cenário pro cartão de mapa (mesma sequência de mapSelect.mapPreviewURL), em JPEG 480×270
function mapPreview(d){ const E=self.ART_EXP, MAP=E[d.art]; if(!MAP) return null; const old=E.PIX.getK(); E.PIX.setK(d.k);
  try{ if(!MAP._built){ MAP.build(); MAP._built=true; }
    const W=MAP.W||384, H=MAP.H||216, ar=MAP.AREAS&&MAP.AREAS[Math.floor((MAP.AREAS.length-1)/2)];
    const cam=Math.max(0,(d.id==='marco_zero'&&MAP.AID&&MAP.AID.marco?MAP.AID.marco.x0+80:(ar&&ar.x0)||0));
    const cv=new OffscreenCanvas(W*d.rs,H*d.rs), g=cv.getContext('2d'); g.imageSmoothingEnabled=false; g.setTransform(d.rs,0,0,d.rs,0,0);
    if(MAP.setLight) MAP.setLight('noite',true);
    MAP.drawSky(g,'noite',cam,0);
    if(MAP.drawMid) MAP.drawMid(g,cam);
    if(MAP.TINT&&MAP.TINT.noite){ g.fillStyle=MAP.TINT.noite; g.fillRect(0,0,W,H); }
    if(MAP.drawLights) MAP.drawLights(g,cam,'noite',0);
    if(MAP.drawFG) MAP.drawFG(g,cam);
    const sm=new OffscreenCanvas(480,270), s=sm.getContext('2d'); s.imageSmoothingEnabled=true; s.drawImage(cv,0,0,480,270);
    return sm; } finally { E.PIX.setK(old); } }
onmessage=function(e){ const d=e.data;
  if(d.t==='prev'){ let sm=null; try{ sm=ok?mapPreview(d):null; }catch(err){ sm=null; }
    if(!sm){ postMessage({t:'prev',id:d.id,url:null}); return; }
    sm.convertToBlob({type:'image/jpeg',quality:0.85}).then(b=>{ postMessage({t:'prev',id:d.id,url:new FileReaderSync().readAsDataURL(b)}); },()=>postMessage({t:'prev',id:d.id,url:null}));
    return; }
};
