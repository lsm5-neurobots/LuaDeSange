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
