/* ===== GORE: sangue em partículas pixel, decalques no chão e na parede ===== */
const GORE=(function(){
  const drops=[], decals=[], wall=[], mist=[];
  const FALL={comum:['#d8584a','#a82a2a','#5c1420'],enluarado:['#c88ae8','#7a3a9a','#3e1a5a'],plenilunar:['#ffa060','#ff5a2a','#a81e14'],normal:['#d8584a','#a82a2a','#5c1420'],furia:['#ff7050','#c41e1e','#6a0c10']};
  function color(F,form,kind){
    try{ if(F && F.mats){ const m=F.mats(form); const r=(kind==='cu'&&m.acid)?m.acid:(m.blood||m.acid); if(r) return form==='plenilunar'&&!(kind==='cu')?[r[0],r[1],r[2]]:[r[0],r[1],r[2]]; } }catch(e){}
    return FALL[form]||FALL.comum;
  }
  // x: mundo; gy: chão do alvo; hy: altura (y de tela) do ponto de impacto; dir: ±1; power: 0..2; col: [claro,base,escuro]; nearWall: respinga na parede
  function hit(x,gy,hy,dir,power,col,nearWall,BASE){
    const n=Math.round(8+power*10);
    for(let i=0;i<n;i++){ const sp=40+Math.random()*90*(0.6+power*0.5), a=(-0.35-Math.random()*0.9);
      drops.push({x:x+(Math.random()-.5)*4, gy:gy+(Math.random()-.5)*6, z:Math.max(2,gy-hy), vx:dir*Math.cos(a)*sp*(0.5+Math.random()), vz:-Math.sin(a)*sp*(0.6+Math.random()*0.8), c:col[Math.random()<0.25?0:Math.random()<0.6?1:2], s:Math.random()<0.25?2:1, b:0}); }
    if(power>=1){ for(let i=0;i<10;i++) mist.push({x:x+dir*Math.random()*10, y:hy+(Math.random()-.5)*10, vx:dir*(10+Math.random()*30), vy:(Math.random()-.5)*10, t:0, c:col[1]}); }
    if(nearWall && power>=1 && BASE){ for(let i=0;i<3+power*3;i++) wall.push({x:x+dir*(4+Math.random()*16)+(Math.random()-.5)*10, y:BASE-8-Math.random()*46, w:1+Math.floor(Math.random()*3), h:2+Math.floor(Math.random()*7), c:col[1+(i%2)], t:0}); }
  }
  function burst(x,gy,hy,col,big){ hit(x,gy,hy,1,big?1.6:1,col,false); hit(x,gy,hy,-1,big?1.6:1,col,false); for(let i=0;i<(big?5:2);i++) stain(x+(Math.random()-.5)*26,gy+(Math.random()-.5)*8,6+Math.random()*8,col); }
  function stain(x,y,r,col){ decals.push({x,y,r,c:col[2],c2:col[1],t:0,seed:Math.random()*99}); if(decals.length>260) decals.shift(); }
  function update(dt){
    for(const d of drops){ d.x+=d.vx*dt; d.z+=d.vz*dt; d.vz-=320*dt; d.vx*=0.995;
      if(d.z<=0){ if(d.b===0 && Math.abs(d.vz)>60 && Math.random()<0.4){ d.z=0.1; d.vz=-d.vz*0.25; d.vx*=0.4; d.b=1; } else { d.dead=true; if(Math.random()<0.7) stain(d.x,d.gy,d.s>1?3+Math.random()*2:1.5+Math.random()*1.5,[d.c,d.c,d.c]); } } }
    for(let i=drops.length-1;i>=0;i--) if(drops[i].dead) drops.splice(i,1);
    if(drops.length>500) drops.splice(0,drops.length-500);
    for(const m of mist){ m.t+=dt; m.x+=m.vx*dt; m.y+=m.vy*dt; m.vx*=0.95; }
    for(let i=mist.length-1;i>=0;i--) if(mist[i].t>0.5) mist.splice(i,1);
    for(const d of decals) d.t+=dt; for(const w of wall) w.t+=dt;
    while(decals.length && decals[0].t>40) decals.shift(); while(wall.length && wall[0].t>45) wall.shift(); if(wall.length>120) wall.shift();
  }
  const R=(c,x,y,w,h,col)=>{ c.fillStyle=col; c.fillRect(Math.round(x),Math.round(y),w,h); };
  function drawGround(c,cam,W){ // decalques: manchas irregulares pixel, esmaecem devagar
    for(const d of decals){ const x=d.x-cam; if(x<-30||x>W+30) continue; const a=Math.max(0,Math.min(1,1-(d.t-25)/15))*0.85; if(a<=0) continue; c.globalAlpha=a;
      const rx=d.r, ry=Math.max(1,d.r*0.38);
      for(let yy=-Math.ceil(ry);yy<=Math.ceil(ry);yy++){ const hw=Math.floor(rx*Math.sqrt(Math.max(0,1-(yy/ry)*(yy/ry)))); if(hw<=0) continue; const jit=((d.seed*7+yy*13)%3)|0; R(c,x-hw+jit-1,d.y+yy,hw*2-jit,1,yy<0&&d.r>3?d.c2:d.c); }
      c.globalAlpha=1; }
  }
  function drawWall(c,cam,W){ for(const w of wall){ const x=w.x-cam; if(x<-10||x>W+10) continue; c.globalAlpha=Math.max(0,Math.min(1,1-(w.t-30)/15))*0.9; R(c,x,w.y,w.w,w.h,w.c); R(c,x,w.y+w.h,1,2+((w.x|0)%4),w.c); } c.globalAlpha=1; }
  function drawAir(c,cam){
    for(const m of mist){ c.globalAlpha=Math.max(0,0.5-m.t); R(c,m.x-cam,m.y,2,2,m.c); }
    c.globalAlpha=1;
    for(const d of drops){ const x=d.x-cam, y=d.gy-d.z; R(c,x,y,d.s,d.s+(d.vz<-40?1:0),d.c); }
  }
  function clear(){ drops.length=0; decals.length=0; wall.length=0; mist.length=0; }
  return {color,hit,burst,stain,update,drawGround,drawWall,drawAir,clear};
})();
