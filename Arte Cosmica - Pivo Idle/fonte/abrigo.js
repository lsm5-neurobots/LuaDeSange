/* ===== ABRIGO: mapa do abrigo em rolagem lateral, estruturas com 5 níveis na escada de materiais ===== */
const ABRIGO=(function(){
  const W=384, H=216, BASE=118, WORLD=2400, OUT='#170b1c';
  const R=(g,x,y,w,h,c)=>{ if(w<=0||h<=0) return; g.fillStyle=c; g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h)); };
  function hsh(n){ n=Math.sin(n*127.1+311.7)*43758.5453; return n-Math.floor(n); }
  function mk(w,h){ const c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d'); g.imageSmoothingEnabled=false; return [c,g]; }
  // polígono crocante por varredura (convexo)
  function poly(g,pts,c){ g.fillStyle=c; let y0=Math.min(...pts.map(p=>p[1])), y1=Math.max(...pts.map(p=>p[1]));
    for(let y=Math.floor(y0);y<Math.ceil(y1);y++){ const yc=y+0.5, xs=[]; for(let i=0;i<pts.length;i++){ const a=pts[i], b=pts[(i+1)%pts.length]; if((a[1]<=yc&&b[1]>yc)||(b[1]<=yc&&a[1]>yc)) xs.push(a[0]+(yc-a[1])/(b[1]-a[1])*(b[0]-a[0])); }
      xs.sort((p,q)=>p-q); for(let k=0;k+1<xs.length;k+=2) g.fillRect(Math.round(xs[k]),y,Math.round(xs[k+1])-Math.round(xs[k]),1); } }

  /* ---------- escada de materiais ---------- */
  const C={
    lona:'#5f7a4a', lonaD:'#4a6139', lonaL:'#7a9660', remendo:'#8a7a52', azul:'#3f6a8c', azulD:'#2e5070', azulL:'#5a88aa', estaca:'#8a6a42', estacaD:'#6a4e30', corda:'#b59a62',
    sucata:'#6b6a66', sucataD:'#4e4d4a', ferrugem:'#8a4e2e',
    tabua:'#9a6a3c', tabua2:'#7d5430', tabuaL:'#b8844e', fresta:'#3e2818', ripa:'#8b5e34', prego:'#c9c3b0',
    pedra:'#8e8a84', pedra2:'#77736e', pedraL:'#aaa59e', argamassa:'#b8b0a0', telha:'#b5562e', telha2:'#8f3f22', telhaL:'#d07048',
    tijolo:'#a5432e', tijolo2:'#86351f', rejunte:'#c9b8a0', metal:'#7d848c', metalL:'#a0a8b0', rebite:'#c9ced4', chapa:'#8d969c', chapa2:'#6b747a', lampada:'#ffd36a',
    lunar:'#2e2836', lunar2:'#3c3446', lunarL:'#4e4458', ouro:'#f2c230', ouro2:'#b8861a', runa:'#c8323a', runaG:'#ff5a5a', ardosia:'#1c1822', ardosiaL:'#2c2634',
    escuro:'#2a1a14', agua:'#4a90c8', aguaL:'#8ac8f0', terra:'#5a3e2a', folha:'#4f8a3a', folhaL:'#6fae4a', milho:'#e8c44a', branco:'#e8e0cc', vermelho:'#b8433a',
  };
  const MATNOME=['','Lona e sucata','Madeira','Pedra','Tijolo e metal','Lua de Sangue'];
  // parede com textura do nível
  function wall(g,x,y,w,h,n,seed=1){
    x=Math.round(x); y=Math.round(y); w=Math.round(w); h=Math.round(h);
    if(n===1){ R(g,x,y,w,h,C.lona); for(let i=x+4;i<x+w;i+=9) R(g,i,y,1,h,C.lonaD); R(g,x,y,w,2,C.lonaL);
      [[0.2,0.3],[0.6,0.55]].forEach(([a,b],k)=>{ const px=x+Math.floor(w*a), py=y+Math.floor(h*b); R(g,px,py,10,8,C.remendo); for(let j=0;j<10;j+=2) R(g,px+j,py-1,1,1,C.corda); });
      R(g,x+Math.floor(w*0.75),y+Math.floor(h*0.2),12,10,C.sucata); R(g,x+Math.floor(w*0.75)+2,y+Math.floor(h*0.2)+5,4,3,C.ferrugem); }
    else if(n===2){ R(g,x,y,w,h,C.tabua); for(let i=x;i<x+w;i+=7){ R(g,i,y,1,h,C.fresta); R(g,i+1,y,1,h,C.tabuaL); if(hsh(i*seed)>.5) R(g,i+3,y+Math.floor(hsh(i)*h),3,1,C.tabua2); R(g,i+3,y+2,1,1,C.prego); R(g,i+3,y+h-4,1,1,C.prego); } }
    else if(n===3){ R(g,x,y,w,h,C.argamassa); let r=0; for(let yy=y;yy<y+h;yy+=8,r++){ for(let xx=x-(r%2)*7;xx<x+w;xx+=14){ const a=Math.max(x,xx+1), b=Math.min(x+w,xx+13); if(b>a){ R(g,a,yy+1,b-a,6,hsh(xx+yy*3)>.5?C.pedra:C.pedra2); R(g,a,yy+1,b-a,1,C.pedraL); } } } }
    else if(n===4){ R(g,x,y,w,h,C.rejunte); let r=0; for(let yy=y;yy<y+h;yy+=5,r++){ for(let xx=x-(r%2)*5;xx<x+w;xx+=10){ const a=Math.max(x,xx+1), b=Math.min(x+w,xx+9); if(b>a) R(g,a,yy+1,b-a,3,hsh(xx*7+yy)>.5?C.tijolo:C.tijolo2); } }
      [y+Math.floor(h*0.25),y+Math.floor(h*0.7)].forEach(by=>{ R(g,x,by,w,4,C.metal); R(g,x,by,w,1,C.metalL); for(let xx=x+3;xx<x+w;xx+=6) R(g,xx,by+1,1,1,C.rebite); }); }
    else { R(g,x,y,w,h,C.lunar); for(let yy=y+3;yy<y+h;yy+=9) for(let xx=x+(yy%2)*5;xx<x+w;xx+=11) R(g,xx,yy,9,7,hsh(xx+yy)>.5?C.lunar2:C.lunar);
      R(g,x,y,w,3,C.ouro); R(g,x,y+3,w,1,C.ouro2); R(g,x,y+h-3,w,3,C.ouro2);
      for(let k=0;k<Math.max(1,Math.floor(w/40));k++){ const rx=x+12+k*40, ry=y+Math.floor(h*0.45); R(g,rx,ry,2,6,C.runa); R(g,rx+2,ry+2,3,1,C.runa); R(g,rx-1,ry+5,4,1,C.runaG); } }
  }
  // telhado (retângulo inclinado visto de cima) e duas águas
  function roofRows(g,x,y,w,h,n){
    if(n===1){ R(g,x,y,w,h,C.azul); for(let i=x+3;i<x+w;i+=8) R(g,i,y,2,h,C.azulD); R(g,x,y,w,2,C.azulL); for(let i=x;i<x+w;i+=16) R(g,i,y+h,1,3,C.corda); return; }
    const pal={2:[C.ripa,C.tabua2,C.tabuaL],3:[C.telha,C.telha2,C.telhaL],4:[C.chapa,C.chapa2,C.metalL],5:[C.ardosia,C.ardosiaL,C.lunar2]}[n];
    R(g,x,y,w,h,pal[0]);
    if(n===2) for(let yy=y;yy<y+h;yy+=4){ R(g,x,yy,w,1,pal[1]); for(let xx=x+5;xx<x+w;xx+=14) R(g,xx,yy+2,1,1,C.prego); }
    if(n===3) for(let yy=y;yy<y+h;yy+=5){ R(g,x,yy+4,w,1,pal[1]); for(let xx=x+((yy/5|0)%2)*4;xx<x+w;xx+=8){ R(g,xx,yy,1,4,pal[1]); R(g,xx+2,yy,2,1,pal[2]); } }
    if(n===4){ for(let xx=x;xx<x+w;xx+=4){ R(g,xx,y,2,h,pal[1]); R(g,xx+2,y,1,h,pal[2]); } for(let k=0;k<3;k++) R(g,x+Math.floor(hsh(k+x)*w*0.8),y+Math.floor(hsh(k*3+x)*h*0.6),8,5,C.ferrugem); }
    if(n===5){ for(let yy=y;yy<y+h;yy+=4) for(let xx=x+((yy/4|0)%2)*3;xx<x+w;xx+=6) R(g,xx,yy+3,5,1,pal[1]); R(g,x,y,w,2,C.ouro); R(g,x,y+h-2,w,2,C.ouro2); }
  }
  function gable(g,cx,top,w,h,n){ // triângulo de telhado; preenche linha a linha com padrão
    for(let k=0;k<h;k++){ const hw=Math.round((k+1)/h*w/2);
      if(n===5){ R(g,cx-hw,top+k,hw*2,1,(k%4===3)?C.ardosiaL:C.ardosia); R(g,cx-hw,top+k,2,1,C.ouro); R(g,cx+hw-2,top+k,2,1,C.ouro); }
      else roofRows(g,cx-hw,top+k,hw*2,1,n); }
    if(n===5) R(g,cx-w/2,top+h-2,w,2,C.ouro2);
    if(n===5){ R(g,cx-2,top-3,4,4,C.ouro); } else if(n>=2) R(g,cx-1,top-1,2,2,n===4?C.metalL:C.tabua2);
  }
  function post(g,x,y,h,n,wd=5){
    if(n===1){ for(let k=0;k<h;k+=3) R(g,x+Math.round(Math.sin(k*0.2+x)*1),y+k,3,3,C.estaca); return; }
    const c={2:[C.tabua,C.tabua2],3:[C.pedra,C.pedra2],4:[C.tijolo,C.metal],5:[C.lunar2,C.ouro]}[n];
    R(g,x,y,wd,h,c[0]); R(g,x+wd-1,y,1,h,c[1]); if(n>=4){ R(g,x-1,y,wd+2,3,c[1]); } if(n===3) for(let yy=y+4;yy<y+h;yy+=6) R(g,x,yy,wd,1,C.argamassa);
  }
  const lamp=(g,x,y)=>{ R(g,x,y,1,4,C.metal); R(g,x-2,y+4,5,4,C.lampada); R(g,x-1,y+5,3,2,'#fff6c0'); };
  const flag=(g,x,y,n)=>{ R(g,x,y,1,22,n===5?C.ouro2:C.estaca); R(g,x+1,y,12,7,C.vermelho); if(n===5){ R(g,x+5,y+2,3,3,C.ouro); } else R(g,x+10,y+5,3,3,C.vermelho); };
  const runeGlow=(g,x,y)=>{ R(g,x,y,2,6,C.runa); R(g,x+2,y+2,3,1,C.runa); R(g,x-1,y+6,4,1,C.runaG); };

  /* ---------- estruturas (cada uma desenha no seu canvas com base em gy=h-2, centro cx=w/2) ---------- */
  const DRAW={};
  DRAW.barraca={w:220,h:150,f(g,n,cx,gy){
    if(n===1){ // barraca de lona
      poly(g,[[cx-80,gy],[cx,gy-92],[cx+80,gy]],C.lona); for(let k=0;k<6;k++) poly(g,[[cx-70+k*28,gy],[cx,gy-92],[cx-62+k*28,gy]],C.lonaD);
      poly(g,[[cx-58,gy-38],[cx,gy-100],[cx+64,gy-36],[cx+40,gy-30],[cx,gy-82],[cx-40,gy-30]],C.azul); R(g,cx-30,gy-70,16,10,C.remendo);
      poly(g,[[cx-16,gy],[cx,gy-48],[cx+16,gy]],C.escuro); R(g,cx-6,gy-10,30,8,'#d8c8a0'); for(let k=0;k<30;k+=4) R(g,cx-6+k,gy-10,2,8,'#b8433a'); R(g,cx-10,gy-14,10,6,C.branco);
      [[cx-92,gy-10],[cx+90,gy-10]].forEach(([x,y])=>{ R(g,x,y-14,3,16,C.estaca); }); R(g,cx-92,gy-24,30,1,C.corda); R(g,cx+64,gy-22,28,1,C.corda);
      R(g,cx+50,gy-12,16,12,C.tabua); R(g,cx-74,gy-8,8,8,C.sucata); return; }
    const bw=176, wh=n>=3?72:64, y=gy-wh;
    wall(g,cx-bw/2,y,bw,wh,n,3);
    gable(g,cx,y-46,bw+16,46,n);
    if(n===3){ R(g,cx+44,y-58,12,28,C.pedra2); R(g,cx+44,y-58,12,3,C.pedraL); }
    if(n===4){ R(g,cx+40,y-66,26,22,C.chapa); for(let k=0;k<26;k+=4) R(g,cx+40+k,y-66,1,22,C.chapa2); R(g,cx+40,y-66,26,3,C.metalL); }
    // porta
    const dx=cx-58, dy=gy-50; R(g,dx,dy,26,50,n===4?C.metal:n===5?C.lunar2:C.tabua2); if(n===5){ R(g,dx-2,dy-2,30,3,C.ouro); R(g,dx+9,dy+12,8,8,C.runa); }
    if(n===2){ for(let k=0;k<26;k+=6) R(g,dx+k,dy,1,50,C.fresta); R(g,dx+4,dy+20,18,2,C.tabuaL); }
    if(n===4){ for(let k=0;k<50;k+=8) R(g,dx+2,dy+k+3,22,1,C.rebite); lamp(g,dx+13,dy-10); }
    if(n>=3){ R(g,dx+20,dy+24,2,2,C.ouro); }
    // janela com cama
    const wx=cx+8, wy=y+16; R(g,wx,wy,44,26,n===5?'#5a0e18':'#1a1424'); R(g,wx,wy,44,2,n===5?C.ouro:C.tabuaL);
    if(n===3){ R(g,wx+4,wy+14,36,8,'#b8433a'); R(g,wx+4,wy+12,10,4,C.branco); R(g,wx-6,wy,6,26,'#3e9a6e'); R(g,wx+44,wy,6,26,'#3e9a6e'); }
    if(n===4){ R(g,wx,wy,44,26,'#3a3020'); R(g,wx+4,wy+6,36,3,C.metal); R(g,wx+4,wy+16,36,3,C.metal); R(g,wx+6,wy+3,30,3,'#c8b890'); R(g,wx+6,wy+13,30,3,'#8ab0d8'); R(g,wx+22,wy-6,2,6,C.metal); }
    if(n===5){ R(g,wx+4,wy+16,36,6,'#8a1020'); R(g,wx+20,wy,2,26,C.ouro2); R(g,wx,wy+12,44,1,C.ouro2); }
    if(n===2){ R(g,wx,wy,44,26,'#2a1a14'); R(g,wx+20,wy,2,26,C.tabua); // varanda com rede
      R(g,cx+70,gy-46,4,46,C.tabua2); R(g,cx+100,gy-46,4,46,C.tabua2); for(let k=0;k<26;k++){ const yy=Math.round(gy-34+Math.sin(k/26*Math.PI)*8); R(g,cx+74+k,yy,1,4,k%6<3?'#c83a3a':'#e8c44a'); } }
    if(n===3){ R(g,cx+70,gy-18,14,18,C.pedra); R(g,cx+70,gy-18,14,2,C.pedraL); R(g,cx+74,gy-22,6,4,C.telha); }
    if(n===4){ for(let k=0;k<5;k++) R(g,cx+64+k*7,gy-40,4,8,['#c83a3a','#3a8ae8','#e8e0cc','#4ac860','#e8c44a'][k]); R(g,cx+60,gy-42,40,1,'#2a2430'); }
    if(n===5){ flag(g,cx+86,gy-62,5); R(g,cx+64,gy-14,14,14,C.lunar2); R(g,cx+66,gy-20,10,6,'#ff4a3a'); R(g,cx+68,gy-24,6,4,'#ffb040'); runeGlow(g,cx-80,y+20); }
  }};
  DRAW.gerador={w:120,h:130,f(g,n,cx,gy){
    if(n===1){ R(g,cx-36,gy-12,72,12,C.tabua); for(let k=0;k<72;k+=8) R(g,cx-36+k,gy-12,1,12,C.fresta); }
    if(n===2){ R(g,cx-46,gy-62,92,62,C.tabua2); wall(g,cx-46,gy-62,8,62,2); wall(g,cx+38,gy-62,8,62,2); roofRows(g,cx-52,gy-72,104,10,2); }
    if(n===3){ R(g,cx-44,gy-14,88,14,C.pedra); wall(g,cx-44,gy-34,20,34,3); wall(g,cx+24,gy-34,20,34,3); roofRows(g,cx-48,gy-40,96,6,3); }
    if(n>=4){ const c=n===5; R(g,cx-44,gy-14,88,14,c?C.lunar:C.tijolo2); if(!c) wall(g,cx-44,gy-14,88,14,4);
      R(g,cx-40,gy-70,80,56,c?C.lunar2:C.chapa); if(!c){ for(let k=0;k<56;k+=7) R(g,cx-38,gy-68+k,76,1,C.rebite); R(g,cx+14,gy-62,20,14,'#1a1424'); R(g,cx+16,gy-60,6,6,'#e8e0cc'); R(g,cx+25,gy-60,6,6,'#e8e0cc'); R(g,cx+18,gy-58,2,2,'#c83a3a'); R(g,cx+16,gy-50,3,3,'#6fdc7a'); R(g,cx+22,gy-50,3,3,'#c83a3a'); lamp(g,cx-30,gy-80); lamp(g,cx+30,gy-80); }
      else { R(g,cx-40,gy-70,80,3,C.ouro); R(g,cx+8,gy-58,22,22,C.ouro2); R(g,cx+10,gy-56,18,18,'#ff3a3a'); R(g,cx+14,gy-52,8,8,'#ffb0a0'); runeGlow(g,cx-30,gy-50); } }
    // motor (sempre)
    const my=n>=4?gy-46:gy-38; R(g,cx-22,my,40,26,C.sucata); for(let k=0;k<40;k+=4) R(g,cx-22+k,my+4,2,14,C.sucataD); R(g,cx-18,my-8,24,8,'#a83a2a'); R(g,cx+10,my+6,8,8,C.ferrugem); R(g,cx-26,my+8,4,6,C.corda);
    // escapamento
    const eh=[0,14,30,40,40,40][n]; R(g,cx+30,gy-38-eh,4,eh+12,n===5?C.ouro:C.metal);
    // combustível
    if(n<=3){ R(g,cx-44,gy-16,12,16,'#c83a2a'); R(g,cx-41,gy-19,6,3,'#c83a2a'); } else if(n===4){ R(g,cx+38,gy-20,14,20,C.metal); R(g,cx+38,gy-14,14,2,C.metalL); } else { poly(g,[[cx+44,gy],[cx+48,gy-18],[cx+52,gy]],'#ff4a5a'); }
    if(n===1){ for(let k=0;k<5;k++) R(g,cx+20+k*3,gy-2-(k%2),3,1,'#2a2430'); }
  }};
  DRAW.barricada={w:130,h:70,f(g,n,cx,gy){
    if(n===1){ [[-40,0],[-40,-10],[-40,-20]].forEach(([dx,dy])=>{ R(g,cx+dx,gy-10+dy,26,10,'#2b2a2e'); R(g,cx+dx+6,gy-7+dy,14,4,'#1a1a1e'); }); R(g,cx-12,gy-40,26,40,'#d8d4c8'); R(g,cx-10,gy-36,3,10,'#8a8a8a'); R(g,cx+16,gy-30,30,30,C.sucata); R(g,cx+20,gy-24,8,6,C.ferrugem); for(let k=0;k<5;k++) R(g,cx-20+k*12,gy-46+(k%2)*4,1,10,'#4a4a52'); R(g,cx-40,gy-26,86,1,C.corda); return; }
    if(n===2){ for(let k=0;k<4;k++){ const x=cx-44+k*28; poly(g,[[x,gy],[x+4,gy],[x+28,gy-44],[x+24,gy-46]],C.tabua2); poly(g,[[x+24,gy],[x+28,gy],[x+4,gy-46],[x,gy-44]],C.tabua); R(g,x+25,gy-48,3,3,C.tabuaL); R(g,x-1,gy-48,3,3,C.tabuaL); } R(g,cx-48,gy-28,100,5,C.tabua); R(g,cx-48,gy-16,100,5,C.tabua); return; }
    if(n===3){ for(let r=0;r<3;r++) for(let k=0;k<5-r%2;k++){ const x=cx-46+k*20+(r%2)*10, y=gy-12-r*11; R(g,x,y,19,11,'#c8b48a'); R(g,x,y,19,2,'#e0d0a8'); R(g,x+3,y+5,13,1,'#9a8660'); } wall(g,cx-58,gy-26,12,26,3); wall(g,cx+46,gy-26,12,26,3); wall(g,cx-10,gy-44,22,10,3); return; }
    if(n===4){ R(g,cx-50,gy-38,100,38,C.chapa); for(let k=0;k<100;k+=8) R(g,cx-50+k,gy-38,1,38,C.chapa2); for(let k=0;k<100;k+=10){ R(g,cx-50+k,gy-30,5,6,'#e8c44a'); R(g,cx-45+k,gy-30,5,6,'#1a1a1e'); } for(let k=0;k<100;k+=6) R(g,cx-48+k,gy-36,1,1,C.rebite);
      for(let k=0;k<12;k++){ const a=k/12*Math.PI*2; R(g,cx-46+k*8,gy-46+Math.round(Math.sin(a)*3),6,1,'#9a9aa2'); R(g,cx-44+k*8,gy-48,1,2,'#c8c8d0'); } R(g,cx+30,gy-60,16,12,'#e8c44a'); R(g,cx+36,gy-58,3,7,'#1a1a1e'); return; }
    R(g,cx-50,gy-36,100,36,C.lunar); wall(g,cx-50,gy-36,100,36,5); for(let k=0;k<5;k++) poly(g,[[cx-44+k*22,gy-36],[cx-36+k*22,gy-36],[cx-40+k*22-6,gy-52]],C.ouro);
  }};
  DRAW.serralheria={w:250,h:160,f(g,n,cx,gy){
    const bw=210, bh=86, y=gy-bh;
    wall(g,cx-bw/2,y,bw,bh,n,5); R(g,cx-bw/2+8,y+10,bw-16,bh-10,'#1a1220'); // interior escuro
    // ferramentas penduradas
    [[0,'#c9ced4'],[18,'#8b5e34'],[34,'#c9ced4'],[50,'#6b6a66']].forEach(([dx,c])=>{ R(g,cx-10+dx,y+16,2,14,c); R(g,cx-14+dx,y+28,8,4,c); });
    roofRows(g,cx-bw/2-8,y-30,bw+16,30,n);
    post(g,cx-bw/2,y,bh,n,7); post(g,cx+bw/2-7,y,bh,n,7);
    // forja
    const fx=cx-80; if(n===1){ R(g,fx,gy-30,30,30,C.sucata); R(g,fx+3,gy-34,24,6,C.escuro); }
    else { R(g,fx-4,gy-36,40,36,{2:'#8a5a3a',3:C.pedra,4:C.tijolo,5:C.lunar}[n]); if(n===3) wall(g,fx-4,gy-36,40,36,3); if(n===4) wall(g,fx-4,gy-36,40,36,4); if(n===5) wall(g,fx-4,gy-36,40,36,5);
      R(g,fx+2,y-40,14,40+(gy-36-y),n===4?C.metal:n===5?C.ouro2:n===3?C.pedra2:C.tabua2); }
    for(let k=0;k<6;k++) R(g,fx+3+k*4,gy-34-(k%2)*2,3,3,n===5?'#ff3a3a':['#c8321e','#f07a1e','#ffc93a'][k%3]);
    // bancada com morsa
    R(g,cx+30,gy-30,60,6,C.tabua); R(g,cx+32,gy-24,4,24,C.tabua2); R(g,cx+84,gy-24,4,24,C.tabua2); R(g,cx+70,gy-40,10,10,C.metal); if(n>=4){ R(g,cx+44,gy-40,12,10,C.metal); R(g,cx+56,gy-36,3,2,'#ffe080'); } if(n===5) R(g,cx+30,gy-30,60,2,C.ouro);
    // pátio: bigorna no toco, barril, sucata
    R(g,cx-30,gy-20,22,20,C.tabua2); R(g,cx-30,gy-20,22,3,C.tabuaL); if(n===1) R(g,cx-34,gy-28,30,8,C.metal); else { poly(g,[[cx-38,gy-30],[cx-2,gy-30],[cx-8,gy-24],[cx-30,gy-24]],'#3a3a44'); R(g,cx-26,gy-24,12,4,'#3a3a44'); if(n===5) R(g,cx-38,gy-30,36,1,C.ouro); }
    R(g,cx+100,gy-26,18,26,C.tabua2); R(g,cx+100,gy-20,18,2,C.metal); R(g,cx+102,gy-26,14,3,C.agua);
    for(let k=0;k<4+n;k++) R(g,cx+60+k*5,gy-6-(k%3)*4,10,6,k%2?C.sucata:C.ferrugem);
    if(n===4) lamp(g,cx,y+4); if(n===5){ flag(g,cx+bw/2-20,y-56,5); runeGlow(g,cx-bw/2+14,y+30); }
  }};
  DRAW.coletor={w:110,h:140,f(g,n,cx,gy){
    if(n===1){ [[-32,-60],[30,-60],[-24,-70],[22,-70]].forEach(([dx,dy])=>R(g,cx+dx,gy+dy,3,-dy,C.estaca)); poly(g,[[cx-34,gy-70],[cx+34,gy-70],[cx+6,gy-36],[cx-6,gy-36]],C.lona); R(g,cx-20,gy-66,10,6,C.remendo);
      R(g,cx-12,gy-26,24,26,C.sucata); R(g,cx-10,gy-26,20,4,C.agua); R(g,cx+16,gy-14,6,14,'#a8d8e0'); R(g,cx+24,gy-10,6,10,'#a8d8e0'); return; }
    if(n===2){ R(g,cx-30,gy-74,4,74,C.tabua2); R(g,cx+26,gy-74,4,74,C.tabua2); roofRows(g,cx-38,gy-84,76,10,2); R(g,cx-2,gy-74,4,30,C.tabua);
      R(g,cx-20,gy-40,40,40,C.tabua); for(let k=0;k<40;k+=6) R(g,cx-20+k,gy-40,1,40,C.fresta); R(g,cx-20,gy-32,40,3,C.metal); R(g,cx-20,gy-12,40,3,C.metal); R(g,cx-18,gy-40,36,4,C.agua); return; }
    if(n===3){ wall(g,cx-34,gy-30,68,30,3); R(g,cx-32,gy-34,64,6,C.agua); R(g,cx-30,gy-33,20,2,C.aguaL); post(g,cx-36,gy-80,50,3,8); post(g,cx+28,gy-80,50,3,8); roofRows(g,cx-44,gy-92,88,12,3); R(g,cx-26,gy-62,52,3,C.tabua2); R(g,cx-1,gy-62,1,22,C.corda); R(g,cx-4,gy-42,8,8,C.tabua); return; }
    if(n===4){ wall(g,cx-30,gy-34,60,34,4); R(g,cx-26,gy-96,52,62,C.chapa); for(let k=0;k<62;k+=10){ R(g,cx-26,gy-96+k,52,2,C.metal); for(let j=0;j<52;j+=6) R(g,cx-24+j,gy-95+k,1,1,C.rebite); } poly(g,[[cx-28,gy-96],[cx+28,gy-96],[cx+10,gy-108],[cx-10,gy-108]],C.chapa2);
      R(g,cx+26,gy-50,10,3,C.metal); R(g,cx+34,gy-50,3,8,C.metal); R(g,cx+35,gy-40,2,3,C.aguaL); R(g,cx+30,gy-10,12,10,C.sucata); lamp(g,cx-30,gy-100); return; }
    wall(g,cx-34,gy-56,68,56,5); R(g,cx-36,gy-60,72,6,C.ouro); R(g,cx-30,gy-62,60,4,'#7ae8ff'); flag(g,cx+30,gy-84,5);
  }};
  DRAW.horta={w:230,h:100,f(g,n,cx,gy){
    // espantalho
    R(g,cx+84,gy-70,3,70,C.tabua2); R(g,cx+70,gy-58,32,3,C.tabua2); R(g,cx+76,gy-56,20,18,'#b8433a'); for(let k=0;k<20;k+=5) R(g,cx+76+k,gy-56,2,18,'#7a2a2a'); R(g,cx+78,gy-72,14,12,'#c8a874'); R(g,cx+74,gy-76,22,5,'#c8a55a'); R(g,cx+81,gy-68,2,2,n===5?'#ff4a4a':'#2a1a14'); R(g,cx+87,gy-68,2,2,n===5?'#ff4a4a':'#2a1a14');
    for(let r=0;r<3;r++){ const y=gy-14-r*14, x0=cx-100+r*6, w=150-r*6;
      R(g,x0,y,w,10,C.terra); for(let k=0;k<w;k+=6) R(g,x0+k,y+3,4,1,'#3e2a1a');
      const bc={1:'#2b2a2e',2:C.tabua,3:C.pedra,4:C.tijolo,5:C.lunar}[n]; R(g,x0-2,y+8,w+4,4,bc); if(n===5) R(g,x0-2,y+8,w+4,1,C.ouro); if(n===4) R(g,x0,y+6,w,1,C.metal);
      for(let k=0;k<w-10;k+=14){ const px=x0+6+k, t=(k/14+r)%4, s=0.6+n*0.1;
        if(t===0){ R(g,px,y-Math.round(16*s),2,Math.round(16*s),'#9a4a3a'); R(g,px-4,y-Math.round(18*s),10,4,C.folha); R(g,px-3,y-Math.round(18*s),3,2,C.folhaL); }
        else if(t===1){ R(g,px,y-Math.round(26*s),2,Math.round(26*s),'#8fae4a'); R(g,px+2,y-Math.round(18*s),3,7,C.milho); R(g,px-3,y-Math.round(22*s),3,6,C.folhaL); }
        else if(t===2){ R(g,px-3,y-4,8,4,'#5fa040'); R(g,px-1,y-6,4,2,'#7ac050'); }
        else { R(g,px-4,y-6,10,6,'#8ccf5a'); R(g,px-2,y-7,6,2,'#b0e070'); }
        if(n===5 && k%28===0) R(g,px+2,y-10,2,2,C.runaG); } }
    if(n===1) for(let k=0;k<11;k++) R(g,cx-108+k*20,gy-50+(k%2)*3,2,50,C.estaca);
    if(n===2) for(let k=0;k<20;k++) R(g,cx-110+k*10,gy-30,6,30,k%2?C.ripa:C.tabua);
    if(n===3) wall(g,cx-112,gy-16,200,16,3);
    if(n===4){ wall(g,cx-112,gy-14,200,14,4); for(let k=0;k<5;k++) R(g,cx-110+k*48,gy-70,3,56,C.metal); R(g,cx-110,gy-70,195,3,C.metal); g.globalAlpha=0.28; R(g,cx-110,gy-68,195,54,'#cfe8ff'); g.globalAlpha=1; lamp(g,cx-20,gy-76); }
    if(n===5){ wall(g,cx-112,gy-18,200,18,5); for(let k=0;k<5;k++){ R(g,cx-110+k*48,gy-34,6,16,C.lunar2); R(g,cx-110+k*48,gy-36,6,3,C.ouro); } }
    R(g,cx+100,gy-10,10,10,C.metal); R(g,cx+108,gy-14,6,2,C.metal);
  }};
  DRAW.bancada={w:210,h:120,f(g,n,cx,gy){
    const bw=180, y=gy-96; wall(g,cx-bw/2,y+20,bw,44,n,7); roofRows(g,cx-bw/2-6,y,bw+12,20,n);
    R(g,cx-30,y+26,60,30,n>=4?C.chapa2:C.tabua2); [[-24,'#c9ced4'],[-12,'#8b5e34'],[0,'#c9ced4'],[12,'#e8c44a']].forEach(([dx,c])=>R(g,cx+dx,y+30,3,14,c));
    const ty=gy-36; const tc={1:'#d8d4c8',2:C.tabua,3:'#7a4e2a',4:C.tabua,5:C.lunar2}[n]; R(g,cx-80,ty,160,8,tc); if(n===4) R(g,cx-80,ty,160,2,C.metal); if(n===5) R(g,cx-80,ty,160,2,C.ouro);
    if(n===1){ R(g,cx-76,ty+8,22,28,C.sucata); R(g,cx+54,ty+8,22,28,C.sucata); R(g,cx-72,ty+16,10,6,C.ferrugem); }
    else { const lc={2:C.tabua2,3:C.pedra,4:C.metal,5:C.lunar}[n]; R(g,cx-76,ty+8,8,28,lc); R(g,cx+68,ty+8,8,28,lc); if(n===4){ R(g,cx+30,ty+8,30,26,C.chapa); R(g,cx+32,ty+14,26,1,C.chapa2); R(g,cx+32,ty+22,26,1,C.chapa2); } }
    R(g,cx-60,ty-8,26,6,'#c9ced4'); R(g,cx-36,ty-8,6,6,'#8b5e34'); R(g,cx-20,ty-10,14,10,C.branco); R(g,cx-6,ty-4,14,4,C.branco); R(g,cx+14,ty-8,8,8,C.metal); R(g,cx+30,ty-4,24,4,'#b8433a'); R(g,cx+32,ty-6,3,2,C.metalL); R(g,cx+40,ty-6,3,2,C.metalL);
    for(let k=0;k<3;k++) R(g,cx-bw/2-4+k*5,gy-50,4,50,C.tabua);
    if(n>=3) R(g,cx+60,ty-14,10,8,C.metal); if(n===2) { R(g,cx+64,ty-14,6,10,'#c8a050'); R(g,cx+65,ty-12,4,4,'#ffd36a'); } if(n===4) lamp(g,cx,y+22); if(n===5){ R(g,cx+62,ty-14,8,12,'#8a1020'); R(g,cx+64,ty-12,4,6,'#ff5a4a'); runeGlow(g,cx-70,y+36); }
  }};
  DRAW.posto_guarda={w:110,h:180,f(g,n,cx,gy){
    if(n===1){ R(g,cx-26,gy-40,52,40,C.tabua); for(let k=0;k<40;k+=8) R(g,cx-26,gy-40+k,52,2,C.fresta); R(g,cx-20,gy-70,40,30,C.sucata); R(g,cx-18,gy-60,36,3,C.ferrugem);
      R(g,cx-12,gy-92,24,4,'#d4cebd'); R(g,cx-12,gy-104,4,16,'#d4cebd'); R(g,cx-12,gy-104,22,3,'#d4cebd'); R(g,cx-10,gy-88,3,18,'#bab4a3'); R(g,cx+8,gy-88,3,18,'#bab4a3');
      R(g,cx-40,gy-120,3,80,C.estaca); R(g,cx+38,gy-116,3,76,C.estaca); poly(g,[[cx-42,gy-122],[cx+40,gy-118],[cx+40,gy-112],[cx-42,gy-114]],C.azul);
      for(let k=0;k<40;k+=6) R(g,cx-34,gy-k-4,10,2,C.estaca); R(g,cx-34,gy-44,2,44,C.estaca); R(g,cx-26,gy-44,2,44,C.estaca); flag(g,cx+36,gy-140,1); return; }
    const top=gy-118, mat=n;
    if(n===2){ [[-30,4],[26,-4]].forEach(([dx,sk])=>poly(g,[[cx+dx,gy],[cx+dx+5,gy],[cx+dx+5+sk,top],[cx+dx+sk,top]],C.tabua2)); poly(g,[[cx-26,gy-10],[cx-22,gy-10],[cx+26,top+8],[cx+22,top+8]],C.tabua); poly(g,[[cx+22,gy-10],[cx+26,gy-10],[cx-22,top+8],[cx-26,top+8]],C.tabua); }
    else { const bw=n===3?60:n===4?50:44; wall(g,cx-bw/2,top,bw,gy-top,mat); if(n===3){ R(g,cx-4,top+30,8,14,'#1a1424'); R(g,cx-10,gy-30,20,30,C.tabua2); } if(n===4){ R(g,cx-10,gy-32,20,32,C.metal); } if(n===5){ R(g,cx-bw/2,top,3,gy-top,C.ouro); R(g,cx+bw/2-3,top,3,gy-top,C.ouro); } }
    // plataforma e guarda-corpo
    R(g,cx-36,top-6,72,8,mat===4?C.metal:mat===5?C.lunar2:mat===3?C.pedra:C.tabua);
    if(n===2) for(let k=0;k<72;k+=8) R(g,cx-36+k,top-22,3,16,C.tabua); if(n===2) R(g,cx-36,top-22,72,3,C.tabua2);
    if(n===3) for(let k=0;k<72;k+=16) wall(g,cx-36+k,top-20,10,14,3);
    if(n===4){ R(g,cx-36,top-22,72,2,C.metal); for(let k=0;k<72;k+=6) R(g,cx-36+k,top-22,1,16,C.metal); }
    if(n===5){ R(g,cx-36,top-20,72,14,C.lunar); R(g,cx-36,top-20,72,2,C.ouro); }
    // cobertura
    if(n===2) gable(g,cx,top-48,84,24,2); if(n===3){ wall(g,cx-20,top-40,40,20,3); gable(g,cx,top-58,52,18,3); } if(n===4) roofRows(g,cx-42,top-40,84,8,4);
    if(n===5){ R(g,cx-10,top-34,20,10,C.ouro2); R(g,cx-6,top-46,12,12,'#ff3a2a'); R(g,cx-3,top-52,6,8,'#ffb040'); }
    // escada
    if(n<=3){ for(let k=10;k<gy-top;k+=8) R(g,cx+24,gy-k,14,2,n===3?C.pedra2:C.tabua2); R(g,cx+24,top,2,gy-top,C.tabua2); R(g,cx+36,top,2,gy-top,C.tabua2); }
    if(n===4){ for(let k=10;k<gy-top;k+=8) R(g,cx+30,gy-k,10,1,C.metalL); R(g,cx+30,top,1,gy-top,C.metal); R(g,cx+40,top,1,gy-top,C.metal); R(g,cx-40,top-30,10,8,C.metal); R(g,cx-42,top-28,4,4,'#ffe890'); }
    if(n===5) for(let k=6;k<40;k+=6) R(g,cx+24,gy-k,16,4,C.ouro2);
    if(n===3){ R(g,cx-34,top-36,2,12,C.estaca); R(g,cx-35,top-40,4,4,'#ff8a2a'); }
    flag(g,cx+30,top-(n===3?82:n===2?72:60),n);
  }};
  DRAW.pilha_toras={w:190,h:90,f(g,n,cx,gy){
    const disc=(x,y,r,c)=>{ for(let yy=-r;yy<r;yy++){ const w=Math.round(Math.sqrt(r*r-(yy+0.5)*(yy+0.5))); R(g,x-w,y+yy,w*2,1,c); } }; const log=(x,y,r,dark)=>{ disc(x,y,r,dark?'#4a2e1e':'#6b4426'); disc(x,y,r-2,dark?'#3a2418':'#c8955a'); disc(x,y,r-4,dark?'#8a1a20':'#a8753e'); R(g,x-1,y-1,2,2,dark?'#ff5a4a':'#6b4426'); };
    if(n===1){ R(g,cx-80,gy-4,110,4,C.lona); for(let k=0;k<7;k++) log(cx-70+k*14+(k%2)*3,gy-10-(k%3)*8,7,false); poly(g,[[cx-80,gy-30],[cx+20,gy-36],[cx+30,gy-22],[cx-70,gy-18]],C.azul); }
    else { const rows=n>=3?4:3; if(n===3) wall(g,cx-84,gy-8,112,8,3); if(n===4){ wall(g,cx-84,gy-8,112,8,4); R(g,cx-86,gy-70,4,62,C.metal); R(g,cx+24,gy-70,4,62,C.metal); roofRows(g,cx-90,gy-78,122,8,4); lamp(g,cx-30,gy-74); } if(n===5) wall(g,cx-84,gy-10,112,10,5);
      if(n===2){ R(g,cx-84,gy-50,4,50,C.tabua2); R(g,cx+24,gy-50,4,50,C.tabua2); } if(n===3){ post(g,cx-86,gy-60,52,3,6); post(g,cx+24,gy-60,52,3,6); roofRows(g,cx-92,gy-70,124,10,3); }
      for(let r=0;r<rows;r++) for(let k=0;k<rows*2-r*2+2;k++) log(cx-72+k*14+r*7,gy-(n>=3?16:8)-r*13,7,n===5); }
    R(g,cx+44,gy-18,30,18,'#7d5430'); R(g,cx+44,gy-18,30,3,'#c8955a'); poly(g,[[cx+56,gy-18],[cx+60,gy-18],[cx+72,gy-34],[cx+68,gy-36]],n===5?C.lunar2:'#6b4426'); poly(g,[[cx+64,gy-38],[cx+76,gy-40],[cx+78,gy-30],[cx+70,gy-30]],n===5?C.ouro:n===1?C.ferrugem:'#9aa0a8');
    for(let k=0;k<8;k++) R(g,cx+40+Math.floor(hsh(k)*44),gy-2-Math.floor(hsh(k*3)*3),3,1,'#e0c08a');
    if(n===4){ R(g,cx+82,gy-26,22,4,C.metal); R(g,cx+86,gy-22,3,22,C.metal); R(g,cx+98,gy-22,3,22,C.metal); R(g,cx+90,gy-34,10,10,'#c9ced4'); }
  }};
  DRAW.ponto_coleta={w:130,h:100,f(g,n,cx,gy){
    if(n===1){ R(g,cx-46,gy-4,92,4,C.lona); R(g,cx-40,gy-40,50,30,'#a8a8b0'); for(let k=0;k<50;k+=5) R(g,cx-40+k,gy-40,1,30,'#6a6a72'); for(let k=0;k<30;k+=5) R(g,cx-40,gy-40+k,50,1,'#6a6a72'); R(g,cx-38,gy-10,4,4,'#2a2430'); R(g,cx+4,gy-10,4,4,'#2a2430'); R(g,cx-40,gy-52,30,12,'#c8a874'); }
    if(n===2){ for(let k=0;k<3;k++) R(g,cx-46+k*30,gy-28-(k===1?10:0),28,28,C.tabua); for(let k=0;k<3;k++) for(let j=0;j<28;j+=6) R(g,cx-46+k*30,gy-28-(k===1?10:0)+j,28,1,C.fresta); R(g,cx+30,gy-56,24,14,C.tabua); }
    if(n===3){ wall(g,cx-50,gy-34,100,34,3); R(g,cx-46,gy-30,40,30,'#3a2c3a'); R(g,cx+6,gy-30,40,30,'#3a2c3a'); roofRows(g,cx-56,gy-46,112,10,3); }
    if(n===4){ wall(g,cx-48,gy-8,96,8,4); poly(g,[[cx-50,gy-44],[cx+50,gy-44],[cx+42,gy-8],[cx-42,gy-8]],C.chapa); for(let k=0;k<96;k+=8) R(g,cx-46+k,gy-42,1,1,C.rebite); R(g,cx+52,gy-80,3,80,C.metal); lamp(g,cx+53,gy-82); }
    if(n===5){ R(g,cx-46,gy-40,92,40,C.lunar); wall(g,cx-46,gy-40,92,40,5); R(g,cx-44,gy-46,88,6,'#ff3a3a'); poly(g,[[cx-46,gy-40],[cx+46,gy-40],[cx+40,gy-62],[cx-40,gy-62]],C.lunar2); flag(g,cx+40,gy-80,5); }
    // montes de sucata e pano (sempre)
    for(let k=0;k<6;k++) R(g,cx-30+k*6,gy-(n>=3?40:46)+(k%3)*4,8,6,k%2?C.sucata:C.ferrugem);
    for(let k=0;k<5;k++) R(g,cx+4+k*7,gy-(n>=3?38:44)+(k%2)*4,8,6,['#3a6ab8','#b8433a','#d8c8a0','#4a8a4a','#e8c44a'][k]);
    R(g,cx-12,gy-14,24,14,'#c8a050'); for(let k=0;k<24;k+=4) R(g,cx-12+k,gy-14,1,14,'#9a7830'); R(g,cx-12,gy-9,24,1,'#9a7830'); if(n===5) R(g,cx-12,gy-14,24,2,C.ouro);
  }};
  DRAW.portao={w:280,h:150,f(g,n,cx,gy){
    const hgt=[0,84,96,104,110,116][n]+12, top=gy-hgt;
    const pil=(x)=>{ if(n===1){ for(let k=0;k<4;k++){ R(g,x,gy-24-k*24,30,22,k%2?'#2b2a2e':'#8a4e2e'); R(g,x+2,gy-20-k*24,26,2,'#5a5a62'); } } else { wall(g,x,top,30,hgt,n); R(g,x-3,top-6,36,8,n===5?C.ouro:n===4?C.metal:n===3?C.pedra2:C.tabua2); if(n===4) lamp(g,x+15,top-16); if(n===5){ R(g,x+8,top-18,14,12,C.ouro2); R(g,x+11,top-26,8,8,'#ff3a2a'); } } };
    pil(cx-110); pil(cx+80);
    // folhas abertas encostadas
    const leaf=(x)=>{ const lc={1:C.sucata,2:C.tabua,3:'#6a4426',4:C.chapa,5:C.lunar2}[n]; R(g,x,top+14,12,hgt-14,lc); if(n===2) R(g,x,top+30,12,3,C.tabua2); if(n===4) for(let k=0;k<hgt;k+=8) R(g,x+2,top+16+k,8,1,C.rebite); if(n===5) R(g,x+3,top+40,6,6,C.runa); };
    leaf(cx-80); leaf(cx+68);
    if(n===3){ for(let k=0;k<20;k++){ const a=Math.PI*k/19; R(g,cx-80+Math.round(74-Math.cos(a)*74),top+8-Math.round(Math.sin(a)*14),8,6,C.pedra); } }
    if(n===4) for(let k=0;k<20;k++) R(g,cx-110+k*11,top-4+Math.round(Math.sin(k)*2),8,1,'#9a9aa2');
  }};
  // muralha: segmento de fundo (tile 128) desenhado direto no mundo
  function muralhaSeg(g,x,n){
    const hgt=[0,46,54,60,64,68][n], top=BASE-hgt;
    if(n===1){ for(let k=0;k<128;k+=12){ R(g,x+k,top+(k%3)*3,4,hgt,C.estaca); } R(g,x+6,top+16,50,30,C.sucata); R(g,x+56,top+10,40,40,C.lona); R(g,x+96,top+20,32,26,C.azul); R(g,x,top+30,128,1,C.corda); return; }
    if(n===2){ for(let k=0;k<128;k+=8){ R(g,x+k,top,7,hgt,k%16?C.tabua:C.tabua2); poly(g,[[x+k,top],[x+k+7,top],[x+k+3.5,top-8]],C.tabua); } R(g,x,top+18,128,4,C.tabua2); R(g,x,top+hgt-20,128,4,C.tabua2); return; }
    wall(g,x,top,128,hgt,n,x);
    if(n===3) for(let k=0;k<128;k+=28) wall(g,x+k,top-12,14,12,3);
    if(n===4){ R(g,x,top-4,128,4,C.chapa); for(let k=0;k<16;k++) R(g,x+k*8,top-8+Math.round(Math.sin(k)*2),6,1,'#9a9aa2'); }
    if(n===5) for(let k=0;k<128;k+=28){ wall(g,x+k,top-12,14,12,5); poly(g,[[x+k+2,top-12],[x+k+12,top-12],[x+k+7,top-20]],C.ouro); }
  }

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
  // posições no mundo (fogueira no centro); base y = linha do chão da estrutura
  const SLOTS=[
    {id:'portao', x:30, largura:280, gy:122},
    {id:'barricada', x:330, largura:130, gy:206},
    {id:'posto_guarda', x:470, largura:110, gy:150},
    {id:'barraca', x:590, largura:220, gy:150},
    {id:'horta', x:820, largura:230, gy:150},
    {id:'coletor', x:1060, largura:110, gy:150},
    {id:'fogueira', x:1145, largura:110, gy:184},
    {id:'serralheria', x:1270, largura:250, gy:150},
    {id:'bancada', x:1530, largura:210, gy:150},
    {id:'gerador', x:1750, largura:120, gy:150},
    {id:'pilha_toras', x:1880, largura:190, gy:150},
    {id:'ponto_coleta', x:2080, largura:130, gy:150},
  ];
  const SLOT=Object.fromEntries(SLOTS.map(s=>[s.id,s]));
  SLOT.muralha={id:'muralha', x:0, largura:WORLD, gy:BASE};

  /* ---------- sprites com contorno automático e luz de borda ---------- */
  const cache={};
  function sprite(id,n){
    const k=id+n; if(cache[k]) return cache[k];
    const D=DRAW[id]; const [c,g]=mk(D.w+4,D.h+4); D.f(g,n,(D.w+4)/2,D.h);
    const img=g.getImageData(0,0,c.width,c.height), d=img.data, Wd=c.width, Hd=c.height, A=i=>d[i*4+3]>0;
    const o=new Uint8ClampedArray(d);
    for(let y=0;y<Hd;y++) for(let x=0;x<Wd;x++){ const i=y*Wd+x;
      if(!A(i)){ if((x>0&&A(i-1))||(x<Wd-1&&A(i+1))||(y>0&&A(i-Wd))||(y<Hd-1&&A(i+Wd))){ o[i*4]=0x17;o[i*4+1]=0x0b;o[i*4+2]=0x1c;o[i*4+3]=255; } }
      else if(y>0 && !A(i-Wd)){ o[i*4]=Math.min(255,d[i*4]*0.75+64); o[i*4+1]=Math.min(255,d[i*4+1]*0.75+64); o[i*4+2]=Math.min(255,d[i*4+2]*0.75+70); }
      else if(x<Wd-1 && !A(i+1)){ o[i*4]=d[i*4]*0.7; o[i*4+1]=d[i*4+1]*0.68; o[i*4+2]=d[i*4+2]*0.8; } }
    g.putImageData(new ImageData(o,Wd,Hd),0,0);
    return cache[k]={c,ax:(D.w+4)/2,gy:D.h};
  }

  /* ---------- fogueira ---------- */
  function fogueira(g,x,y,nivel,aceso,t){
    const n=Math.max(1,Math.min(5,nivel||1));
    // anel/base
    const rx=34, ry=11;
    if(n===1){ for(let k=0;k<12;k++){ const a=k/12*Math.PI*2; R(g,x+Math.cos(a)*rx-4,y+Math.sin(a)*ry-3,9,6,k%2?C.pedra:C.pedra2); R(g,x+Math.cos(a)*rx-4,y+Math.sin(a)*ry-3,9,1,C.pedraL); } R(g,x-48,y-22,14,20,C.sucata); R(g,x-46,y-12,6,4,C.ferrugem); R(g,x+36,y-20,12,18,C.sucata); }
    else if(n===2){ for(let k=0;k<12;k++){ const a=k/12*Math.PI*2; R(g,x+Math.cos(a)*rx-3,y+Math.sin(a)*ry-8,7,10,'#9a6a3c'); R(g,x+Math.cos(a)*rx-3,y+Math.sin(a)*ry-8,7,2,'#c8955a'); } R(g,x-62,y+2,20,8,'#7d5430'); R(g,x+44,y+2,20,8,'#7d5430'); }
    else { const mh=[0,0,0,8,10,11][n]; for(let yy=-mh;yy<=0;yy++){ const w=rx+2; R(g,x-w,y-ry+yy+ry,w*2,1,'#00000000'); }
      for(let a=0;a<Math.PI*2;a+=0.02){ const px=Math.round(x+Math.cos(a)*rx), py=Math.round(y+Math.sin(a)*ry); if(Math.sin(a)>-0.2) R(g,px-2,py-mh,5,mh+2,n===3?(Math.floor(a*6)%2?C.pedra:C.pedra2):n===4?(Math.floor(a*8)%2?C.tijolo:C.tijolo2):(Math.floor(a*5)%2?C.lunar:C.lunar2)); }
      for(let a=0;a<Math.PI*2;a+=0.02){ const px=Math.round(x+Math.cos(a)*rx), py=Math.round(y+Math.sin(a)*ry); R(g,px-2,py-mh-1,5,2,n===4?C.metal:n===5?C.ouro:C.argamassa); }
      if(n===3){ R(g,x-20,y-60,2,50,'#5a4a3a'); R(g,x+18,y-60,2,50,'#5a4a3a'); R(g,x-20,y-60,40,2,'#5a4a3a'); R(g,x-1,y-58,1,16,'#3a3a44'); R(g,x-7,y-44,14,9,'#24242c'); }
      if(n===5){ for(let k=0;k<5;k++) runeGlow(g,x-26+k*12,y+4); R(g,x-40,y-10,4,8,C.ouro); R(g,x+36,y-10,4,8,C.ouro); } }
    // carvão e lenha
    R(g,x-24,y-4,48,8,C.escuro); if(aceso>0) for(let k=0;k<10;k++){ const p=0.5+0.5*Math.sin(t*6+k*1.7); R(g,x-20+k*4,y-2+(k%2),2,2,p>0.6?'#ffc93a':p>0.3?'#f07a1e':'#c8321e'); }
    [[-18,-6,14,-12],[18,-6,-14,-12],[-14,-2,16,-2]].forEach(([x0,y0,x1,y1])=>{ for(let k=0;k<=12;k++){ const px=x+x0+(x1-x0)*k/12, py=y+y0+(y1-y0)*k/12; R(g,px-2,py-2,5,5,'#6b4426'); } R(g,x+x1-2,y+y1-2,5,5,aceso>0?'#2a1a12':'#c8955a'); });
    if(n===1){ R(g,x-12,y-26,24,2,'#9a9aa2'); R(g,x-4,y-34,8,8,C.ferrugem); }
    // chama
    if(aceso>0){ const s=aceso*(0.8+0.12*n), red=n===5;
      const layers=red?['#8a1020','#c8323a','#ff5a5a','#ffd0c0']:['#c8321e','#f07a1e','#ffc93a','#fff4c8'];
      for(let L=0;L<4;L++){ const sc=[1,0.78,0.52,0.28][L];
        for(let f=0;f<5;f++){ if(L===3 && (f===0||f===4)) continue; const fx=x-16+f*8, hh=(26+((f===2)?14:(f%2?8:0)))*s*sc*(0.85+0.15*Math.sin(t*9+f*2.1)), ww=7*sc+2;
          for(let k=0;k<hh;k++){ const w=Math.max(1,Math.round(ww*(1-k/hh)*(k<3?k/3:1))); R(g,fx-w/2+Math.sin(t*7+f+k*0.2)*1.5,y-6-k,w,1,layers[L]); } } }
      for(let k=0;k<4;k++){ const ph=(t*1.3+k*0.27)%1; R(g,x-10+k*7+Math.sin(t*3+k)*4,y-40*s-ph*40,1+(ph<0.5?1:0),1+(ph<0.5?1:0),red?'#ff8a7a':'#ffd06a'); } }
    else { for(let k=0;k<3;k++){ const ph=(t*0.6+k*0.33)%1; g.globalAlpha=0.35*(1-ph); R(g,x-4+k*3+Math.sin(t+k)*3,y-14-ph*30,4,4,'#8a8494'); } g.globalAlpha=1; }
  }

  /* ---------- cenário ---------- */
  const SKY={dia:['#5ab4ee','#7ec8f2','#a8dcf6','#d4f0fa'], noite:['#0e0a26','#1c1440','#2e1f58','#46307a'], lua:['#1a0408','#3a0812','#64101e','#8e1a2a']};
  function drawSky(g,mode,cam,t){
    const S=SKY[mode], bands=[0,30,58,82,BASE];
    for(let b=0;b<4;b++){ R(g,0,bands[b],W,bands[b+1]-bands[b],S[b]); if(b<3){ g.fillStyle=S[b+1]; for(let y=bands[b+1]-4;y<bands[b+1];y++) for(let x=(y%2);x<W;x+=2) if(y>=bands[b+1]-2||(x+y)%4===0) g.fillRect(x,y,1,1); } }
    if(mode==='dia'){ for(let i=0;i<6;i++){ const cx=((hsh(i)*W*2-cam*0.05-t*3)%(W+80)+W+80)%(W+80)-40, cy=10+hsh(i*3)*40, w=24+hsh(i*5)*30; R(g,cx,cy,w,6,'#fff'); R(g,cx+4,cy-4,w-12,4,'#fff'); } }
    else { for(let i=0;i<60;i++){ g.fillStyle=hsh(i)>.6?'#fff':'#9a8ac8'; g.fillRect(Math.floor(hsh(i*3)*W),Math.floor(hsh(i*7)*70),1,1); }
      const mx=300, my=32, mr=mode==='lua'?24:15, moon=mode==='lua'?['#ff5040','#c42020']:['#f3eed6','#cfc6a6'];
      for(let y=-mr;y<=mr;y++){ const w=Math.floor(Math.sqrt(mr*mr-y*y)); R(g,mx-w,my+y,w*2+1,1,moon[0]); } g.fillStyle=moon[1]; [[-5,-4,4],[5,3,3],[-2,7,2]].forEach(([dx,dy,r])=>{ for(let y=-r;y<=r;y++){ const w=Math.floor(Math.sqrt(r*r-y*y)); g.fillRect(mx+dx-w,my+dy+y,w*2+1,1); } }); }
    // horizonte: ruínas da cidade e coqueiros (0,3×)
    const fc={dia:'#8ab0c8',noite:'#24183e',lua:'#3a0c18'}[mode], off=cam*0.3; g.fillStyle=fc;
    for(let i=Math.floor(off/40)-1;i<Math.floor(off/40)+12;i++){ const x=Math.round(i*40-off), h=20+Math.floor(hsh(i*3.1)*40); g.fillRect(x,BASE-h,34,h); if(hsh(i*7)>.6){ g.fillRect(x+10,BASE-h-8,4,8); } if(hsh(i*11)>.75){ g.fillRect(x+30,BASE-h+4,2,10); } }
    const off2=cam*0.55, tc={dia:'#5a8a6a',noite:'#1a1430',lua:'#2a0810'}[mode]; g.fillStyle=tc;
    for(let i=Math.floor(off2/90)-1;i<Math.floor(off2/90)+6;i++){ const x=Math.round(i*90-off2+hsh(i)*30); if(hsh(i*5)<.5) continue; g.fillRect(x,BASE-62,3,62); for(let k=0;k<5;k++){ const a=-2.6+k*0.6; for(let r=0;r<18;r++) g.fillRect(Math.round(x+Math.cos(a)*r),Math.round(BASE-62+Math.sin(a)*r*0.5+r*r/60),2,2); } }
  }
  function drawGround(g,cam,mode){
    R(g,0,BASE,W,H-BASE,'#6a5236');
    for(let y=BASE;y<H;y+=2) for(let x=0;x<W;x+=3){ const wx=x+cam; const v=hsh(Math.floor(wx/3)*1.3+y*7.1); if(v>.85) R(g,x,y,2,1,'#7e6444'); else if(v<.1) R(g,x,y,2,1,'#54402a'); }
    // caminho de pedras do portão até a fogueira
    for(let wx=Math.floor(cam/26)*26;wx<cam+W;wx+=26){ if(wx>1180) break; const x=wx-cam, y=196+Math.round(hsh(wx)*4); R(g,x,y,18,6,'#8a7a66'); R(g,x,y,18,1,'#a8987e'); R(g,x+1,y+6,17,1,'#3e3022'); }
    // tufos de mato
    for(let wx=Math.floor(cam/17)*17;wx<cam+W;wx+=17){ if(hsh(wx*0.7)<.55) continue; const x=wx-cam, y=BASE+8+Math.floor(hsh(wx*1.9)*(H-BASE-14)); R(g,x,y,1,3,'#5a7a3a'); R(g,x+2,y-1,1,4,'#6a8a44'); R(g,x+4,y,1,3,'#5a7a3a'); }
    R(g,0,BASE,W,1,'#3e3022');
  }
  function emptySlot(g,s,cam){ const x=s.x+s.largura/2-cam, y=s.gy; if(x<-80||x>W+80) return;
    for(let k=0;k<5;k++) R(g,x-30+k*14,y-2+(k%2),8,3,'#7e6a50');
    R(g,x-1,y-30,3,30,'#7d5430'); R(g,x-14,y-40,30,14,'#9a6a3c'); R(g,x-14,y-40,30,2,'#b8844e'); R(g,x-15,y-41,32,1,OUT); R(g,x-15,y-26,32,1,OUT); R(g,x-15,y-41,1,16,OUT); R(g,x+16,y-41,1,16,OUT);
    // martelo + "+"
    R(g,x-8,y-36,8,3,'#3a3a44'); R(g,x-5,y-33,2,5,'#7d5430'); R(g,x+5,y-37,2,8,'#ffd23f'); R(g,x+2,y-34,8,2,'#ffd23f'); }

  const LIGHTS=[];
  function draw(g,cam,state,t,opts={}){
    const mode=state.lua?'lua':(state.noite===false?'dia':'noite'), E=state.estruturas||{};
    cam=Math.round(Math.max(0,Math.min(WORLD-W,cam)));
    drawSky(g,mode,cam,t);
    // muralha de fundo
    const mn=E.muralha||0; for(let wx=Math.floor(cam/128)*128;wx<cam+W;wx+=128){ if(wx<300) continue; if(mn>0) muralhaSeg(g,wx-cam,mn); else { // ruínas da cerca antiga
        for(let k=0;k<128;k+=22) if(hsh(wx+k)>.35) R(g,wx-cam+k,BASE-10-Math.floor(hsh(k+wx)*16),3,30,'#4a3a2a'); } }
    drawGround(g,cam,mode);
    // estruturas e slots, ordenados por y da base; atores entre as linhas
    LIGHTS.length=0;
    const items=SLOTS.map(s=>({s,y:s.gy})); items.sort((a,b)=>a.y-b.y);
    let actorsDone=false;
    const drawActors=()=>{ if(!actorsDone && opts.drawActors){ actorsDone=true; opts.drawActors(g,cam); } };
    items.forEach(({s})=>{
      if(s.gy>=170) drawActors();
      const n=E[s.id]||0;
      if(s.id==='fogueira'){ fogueira(g,s.x+s.largura/2-cam,s.gy,Math.max(1,n||1),state.fogo||0,t); LIGHTS.push({x:s.x+s.largura/2,y:s.gy-20,r:40+110*(state.fogo||0)*(0.8+0.1*(n||1)),c:(n===5?'255,70,60':'255,170,80'),a:state.fogo||0}); return; }
      if(!n){ if(s.id!=='portao') emptySlot(g,s,cam); else { R(g,s.x-cam+30,BASE-20,4,20,'#4a3a2a'); R(g,s.x-cam+240,BASE-26,4,26,'#4a3a2a'); } return; }
      const sp=sprite(s.id,n), x=Math.round(s.x+s.largura/2-cam-sp.ax), y=Math.round(s.gy-sp.gy);
      if(x>W||x+sp.c.width<0) return; g.drawImage(sp.c,x,y);
      if(n>=4){ LIGHTS.push({x:s.x+s.largura/2,y:s.gy-60,r:46,c:'255,214,120',a:0.6}); }
      if(n===5){ LIGHTS.push({x:s.x+s.largura/2,y:s.gy-40,r:40,c:'255,60,60',a:0.5}); }
      if(s.id==='gerador'){ for(let k=0;k<3;k++){ const ph=(t*0.8+k*0.33)%1; g.globalAlpha=0.5*(1-ph); R(g,s.x+s.largura/2-cam+30+Math.sin(t+k)*3,s.gy-60-[0,14,30,40,40,40][n]-ph*30,5,5,n===5?'#c8323a':'#8a8494'); } g.globalAlpha=1; }
    });
    drawActors();
    // iluminação
    if(mode!=='dia'){
      if(!draw._dk){ const [c,cg]=mk(W,H); draw._dk=[c,cg]; }
      const [dc,dg]=draw._dk; dg.globalCompositeOperation='source-over'; dg.clearRect(0,0,W,H); dg.fillStyle=mode==='lua'?'rgba(40,4,14,.62)':'rgba(8,6,28,.66)'; dg.fillRect(0,0,W,H);
      dg.globalCompositeOperation='destination-out';
      LIGHTS.forEach(L=>{ if(L.a<=0) return; const x=L.x-cam, flick=1+0.04*Math.sin(t*11+L.x); const gr=dg.createRadialGradient(x,L.y,0,x,L.y,L.r*flick); gr.addColorStop(0,'rgba(0,0,0,'+Math.min(1,L.a)+')'); gr.addColorStop(0.6,'rgba(0,0,0,'+(0.6*L.a)+')'); gr.addColorStop(1,'rgba(0,0,0,0)'); dg.fillStyle=gr; dg.fillRect(x-L.r*1.1,L.y-L.r*1.1,L.r*2.2,L.r*2.2); });
      g.drawImage(dc,0,0);
      g.save(); g.globalCompositeOperation='lighter';
      LIGHTS.forEach(L=>{ if(L.a<=0) return; const x=L.x-cam, r=L.r*0.7; const gr=g.createRadialGradient(x,L.y,0,x,L.y,r); gr.addColorStop(0,'rgba('+L.c+','+(0.22*L.a)+')'); gr.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=gr; g.fillRect(x-r,L.y-r,r*2,r*2); });
      g.restore();
    } else if(state.fogo>0){ g.save(); g.globalCompositeOperation='lighter'; LIGHTS.forEach(L=>{ if(!L.a) return; const x=L.x-cam, r=L.r*0.5; const gr=g.createRadialGradient(x,L.y,0,x,L.y,r); gr.addColorStop(0,'rgba('+L.c+','+(0.12*L.a)+')'); gr.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=gr; g.fillRect(x-r,L.y-r,r*2,r*2); }); g.restore(); }
  }
  function slotAt(worldX){ return SLOTS.find(s=>worldX>=s.x && worldX<s.x+s.largura)||null; }
  return {STRUCT,SLOTS,SLOT,W,H,WORLD,BASE,MATNOME,draw,fogueira,slotAt,sprite,DRAW};
})();
