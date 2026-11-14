/* GORE — fonte de arte (editável). Build: npm run art
   Sangue desenhado na resolução final (960×540, lê a escala do contexto): gotas com brilho e rastro,
   manchas no chão com borda escura, miolo e respingos satélites, respingos na parede com escorridos.
   API inalterada: {color, hit, burst, stain, update, drawGround, drawWall, drawAir, clear}. */
const GORE=(function(){
  const drops=[], decals=[], wall=[], mist=[];
  const FALL={comum:['#d8584a','#a82a2a','#5c1420'],enluarado:['#c88ae8','#7a3a9a','#3e1a5a'],plenilunar:['#ffa060','#ff5a2a','#a81e14'],normal:['#d8584a','#a82a2a','#5c1420'],furia:['#ff7050','#c41e1e','#6a0c10']};
  function color(F,form,kind){
    try{ if(F && F.mats){ const m=F.mats(form); const r=(kind==='cu'&&m.acid)?m.acid:(m.blood||m.acid); if(r) return [r[0],r[1],r[2]]; } }catch(e){}
    return FALL[form]||FALL.comum;
  }
  const hx=h=>{ const n=parseInt(h.slice(1),16); return [(n>>16)&255,(n>>8)&255,n&255]; };
  const mixc=(a,b,t)=>{ const A=hx(a),B=hx(b); return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join(''); };
  function rng(seed){ let s=(Math.floor(seed*1000)*2654435761)>>>0||1; return ()=>{ s^=s<<13; s>>>=0; s^=s>>>17; s^=s<<5; s>>>=0; return (s%100000)/100000; }; }
  // x: mundo; gy: chão do alvo; hy: altura (y de tela) do ponto de impacto; dir: ±1; power: 0..2; col: [claro,base,escuro]; nearWall: respinga na parede
  function hit(x,gy,hy,dir,power,col,nearWall,BASE){
    const n=Math.round(8+power*10);
    for(let i=0;i<n;i++){ const sp=40+Math.random()*90*(0.6+power*0.5), a=(-0.35-Math.random()*0.9), q=Math.random();
      drops.push({x:x+(Math.random()-.5)*4, gy:gy+(Math.random()-.5)*6, z:Math.max(2,gy-hy), vx:dir*Math.cos(a)*sp*(0.5+Math.random()), vz:-Math.sin(a)*sp*(0.6+Math.random()*0.8),
        c:col[q<0.2?0:q<0.65?1:2], hl:col[0], md:col[1], dk:col[2], s:Math.random()<0.3?2:1, b:0}); }
    if(power>=1){ for(let i=0;i<10;i++) mist.push({x:x+dir*Math.random()*10, y:hy+(Math.random()-.5)*10, vx:dir*(10+Math.random()*30), vy:(Math.random()-.5)*10, t:0, c:col[i%3===0?0:1], s:Math.random()<.4?2:1}); }
    if(nearWall && power>=1 && BASE){ for(let i=0;i<3+power*3;i++) wall.push({x:x+dir*(4+Math.random()*16)+(Math.random()-.5)*10, y:BASE-8-Math.random()*46, w:1+Math.floor(Math.random()*3), h:2+Math.floor(Math.random()*7), c:col[1+(i%2)], c2:col[1], t:0, seed:Math.random()*99, cv:null}); }
  }
  function burst(x,gy,hy,col,big){ hit(x,gy,hy,1,big?1.6:1,col,false); hit(x,gy,hy,-1,big?1.6:1,col,false); for(let i=0;i<(big?5:2);i++) stain(x+(Math.random()-.5)*26,gy+(Math.random()-.5)*8,6+Math.random()*8,col); }
  function stain(x,y,r,col){ decals.push({x,y,r,c:col[2],c2:col[1],hl:col[0],t:0,seed:Math.random()*99,cv:null}); if(decals.length>260) decals.shift(); }
  function update(dt){
    for(const d of drops){ d.x+=d.vx*dt; d.z+=d.vz*dt; d.vz-=320*dt; d.vx*=0.995;
      if(d.z<=0){ if(d.b===0 && Math.abs(d.vz)>60 && Math.random()<0.4){ d.z=0.1; d.vz=-d.vz*0.25; d.vx*=0.4; d.b=1; }
        else { d.dead=true; if(Math.random()<0.7) stain(d.x,d.gy,d.s>1?3+Math.random()*2:1.5+Math.random()*1.5,[d.hl,d.md,d.c===d.hl?d.md:d.c]); } } }
    for(let i=drops.length-1;i>=0;i--) if(drops[i].dead) drops.splice(i,1);
    if(drops.length>500) drops.splice(0,drops.length-500);
    for(const m of mist){ m.t+=dt; m.x+=m.vx*dt; m.y+=m.vy*dt; m.vx*=0.95; }
    for(let i=mist.length-1;i>=0;i--) if(mist[i].t>0.5) mist.splice(i,1);
    for(const d of decals) d.t+=dt; for(const w of wall) w.t+=dt;
    while(decals.length && decals[0].t>40) decals.shift(); while(wall.length && wall[0].t>45) wall.shift(); if(wall.length>120) wall.shift();
  }
  /* ---- manchas pré-renderizadas em px de tela (S = escala do contexto), cacheadas por decalque ---- */
  let tc=null, tg=null;
  function blob(draw,Wp,Hp,cols){ // cols: {edge, body, core?, hl?}
    if(!tc||tc.width<Wp||tc.height<Hp){ const c=document.createElement('canvas'); c.width=Math.max(Wp,tc?tc.width:0); c.height=Math.max(Hp,tc?tc.height:0); tc=c; tg=c.getContext('2d',{willReadFrequently:true}); }
    tg.setTransform(1,0,0,1,0,0); tg.clearRect(0,0,tc.width,tc.height); tg.fillStyle='#000'; draw(tg);
    const d=tg.getImageData(0,0,Wp,Hp).data, N=Wp*Hp, m=new Uint8Array(N); for(let i=0;i<N;i++) m[i]=d[i*4+3]>=128?1:0;
    const ins=(x,y)=>x>=0&&y>=0&&x<Wp&&y<Hp&&m[y*Wp+x]===1;
    const cv=document.createElement('canvas'); cv.width=Wp; cv.height=Hp; const g=cv.getContext('2d'), img=g.createImageData(Wp,Hp);
    const E=hx(cols.edge), B=hx(cols.body), C=cols.core?hx(cols.core):null, Lh=cols.hl?hx(cols.hl):null;
    for(let y=0;y<Hp;y++) for(let x=0;x<Wp;x++){ const i=y*Wp+x; if(!m[i]) continue;
      let c=B; const edge=!ins(x-1,y)||!ins(x+1,y)||!ins(x,y-1)||!ins(x,y+1);
      if(edge) c=E; else if(C && ins(x-2,y)&&ins(x+2,y)&&ins(x,y-2)&&ins(x,y+2)&&ins(x-3,y)&&ins(x+3,y)) c=C;
      if(Lh && !edge && C && c===C && !ins(x,y-3) && ((x*7+y*3)%4===0)) c=Lh; // brilho molhado no topo do miolo
      img.data[i*4]=c[0]; img.data[i*4+1]=c[1]; img.data[i*4+2]=c[2]; img.data[i*4+3]=255; }
    g.putImageData(img,0,0); return cv;
  }
  const E=(g,x,y,a,b)=>{ g.beginPath(); g.ellipse(x,y,Math.max(.6,a),Math.max(.6,b),0,0,Math.PI*2); g.fill(); };
  function decalCv(dc,S){
    if(dc.cv && dc.S===S) return dc.cv;
    const R=rng(dc.seed+dc.r), rx=dc.r*S, ry=Math.max(1.2,dc.r*.42*S), big=dc.r>=3;
    const Wp=Math.ceil(rx*3.4)+4, Hp=Math.ceil(ry*3.4)+4, cx=Wp/2, cy=Hp/2;
    dc.cv=blob(g=>{
      E(g,cx,cy,rx,ry);
      if(big){ const n=3+Math.floor(R()*3); for(let k=0;k<n;k++){ const a=R()*Math.PI*2, d=.55+R()*.3; E(g,cx+Math.cos(a)*rx*d,cy+Math.sin(a)*ry*d,rx*(.3+R()*.25),ry*(.35+R()*.25)); }
        const s=2+Math.floor(R()*3); for(let k=0;k<s;k++){ const a=R()*Math.PI*2, d=1.15+R()*.45, rr=Math.max(1,rx*(.07+R()*.08)); E(g,cx+Math.cos(a)*rx*d,cy+Math.sin(a)*ry*d,rr,rr*.6); } }
    },Wp,Hp,{edge:mixc(dc.c,'#1c1233',.42), body:dc.c, core:big?dc.c2:null, hl:big?dc.hl:null});
    dc.S=S; return dc.cv;
  }
  function wallCv(w,S){
    if(w.cv && w.S===S) return w.cv;
    const R=rng(w.seed), r=(1+w.w*.7)*S, len=w.h*S*1.4, Wp=Math.ceil(r*4)+4, Hp=Math.ceil(r*2+len+r)+6, cx=Wp/2, cy=r+3;
    w.cv=blob(g=>{
      E(g,cx,cy,r,r*.85); for(let k=0;k<3;k++){ const a=R()*Math.PI*2; E(g,cx+Math.cos(a)*r*.7,cy+Math.sin(a)*r*.6,r*.45,r*.4); }
      const nd=1+Math.floor(R()*2); for(let k=0;k<nd;k++){ const dx=cx+(R()-.5)*r*1.2, L=len*(.5+R()*.5), ww=Math.max(1.6,r*.32); g.fillRect(Math.round(dx-ww/2),cy,Math.max(1,Math.round(ww)),L); E(g,dx,cy+L,ww*.75,ww*.9); }
      if(R()<.6){ const a=R()*Math.PI*2; E(g,cx+Math.cos(a)*r*1.7,cy+Math.sin(a)*r*1.2,Math.max(1,r*.18),Math.max(1,r*.18)); }
    },Wp,Hp,{edge:mixc(w.c,'#1c1233',.42), body:w.c, core:w.c2!==w.c?w.c2:null});
    w.S=S; return w.cv;
  }
  const scl=c=>{ const T=c.getTransform?c.getTransform():null; return T?{S:T.a||1,e:T.e,f:T.f,dd:T.d||1}:{S:1,e:0,f:0,dd:1}; };
  function drawGround(c,cam,W){ // decalques: manchas irregulares em px de tela, esmaecem devagar
    const T=scl(c); c.save(); c.setTransform(1,0,0,1,0,0);
    for(const d of decals){ const x=d.x-cam; if(x<-30||x>W+30) continue; const a=Math.max(0,Math.min(1,1-(d.t-25)/15))*0.88; if(a<=0) continue;
      const cv=decalCv(d,T.S); c.globalAlpha=a; c.drawImage(cv,Math.round(x*T.S+T.e-cv.width/2),Math.round(d.y*T.dd+T.f-cv.height/2)); }
    c.restore();
  }
  function drawWall(c,cam,W){
    const T=scl(c); c.save(); c.setTransform(1,0,0,1,0,0);
    for(const w of wall){ const x=w.x-cam; if(x<-10||x>W+10) continue; c.globalAlpha=Math.max(0,Math.min(1,1-(w.t-30)/15))*0.92;
      const cv=wallCv(w,T.S), r=(1+w.w*.7)*T.S; c.drawImage(cv,Math.round(x*T.S+T.e-cv.width/2),Math.round(w.y*T.dd+T.f-r-3)); }
    c.restore();
  }
  function drawAir(c,cam){
    const T=scl(c); c.save(); c.setTransform(1,0,0,1,0,0);
    for(const m of mist){ c.globalAlpha=Math.max(0,0.55-m.t); c.fillStyle=m.c; const X=Math.round((m.x-cam)*T.S+T.e), Y=Math.round(m.y*T.dd+T.f), s=m.s+1;
      c.fillRect(X,Y,s,s); if(m.s>1){ c.fillRect(X+s,Y+1,1,1); c.fillRect(X-1,Y+s-1,1,1); } }
    c.globalAlpha=1;
    for(const d of drops){ const X=Math.round((d.x-cam)*T.S+T.e), Y=Math.round((d.gy-d.z)*T.dd+T.f), w=d.s>1?4:3;
      const fast=Math.abs(d.vz)>50||Math.abs(d.vx)>70, sx=d.vx>0?-1:1, sy=d.vz>0?1:-1;
      if(fast){ c.fillStyle=d.dk; c.fillRect(X+sx*(w-1),Y+sy*(w-1),w-1,w-1); if(w>3) c.fillRect(X+sx*(2*w-2),Y+sy*(2*w-2),1,1); }
      c.fillStyle=d.c; c.fillRect(X,Y,w,w);
      c.fillStyle=d.c===d.hl?'#ffffff':d.hl; c.fillRect(X+(d.vx>0?w-2:1),Y+(sy>0?0:w-2),1,1); }
    c.restore();
  }
  function clear(){ drops.length=0; decals.length=0; wall.length=0; mist.length=0; }
  return {color,hit,burst,stain,update,drawGround,drawWall,drawAir,clear};
})();

/* ===== BATON: o bastão (cassetete) em 4 raridades. drawBaton desenha num pen do PIX. ===== */
