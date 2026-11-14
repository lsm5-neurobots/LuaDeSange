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
