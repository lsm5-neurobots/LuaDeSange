/* RAS — fonte de arte (editável). Build: npm run art
   Rastejante: metade de cima de um zumbi (perdeu as pernas), se arrasta pelos braços com tripas e trapo arrastando.
   Finge de morto no chão, levanta a cabeça e dá o bote na perna. Camisa amarela canarinho rasgada, cabelo comprido ralo. */
const RAS=(function(){
  const {rad,lerp,P2,ik,mkPen,compose}=PIX;
  const FW=206, FH=104, GROUND=96, AX=114, BS=1.16;
  const G=GROUND;
  const RIM={comum:'#cfe6ff', enluarado:'#b4f6ff', plenilunar:'#ffb27a'};
  function mats(form){
    const m={
      skin:['#d8e2b4','#a0ae86','#64725e','#323444'],
      rot:['#b8b088','#847a5a','#56503e','#30283a'],
      flesh:['#f4a698','#c85a5e','#863046','#481a30'],
      gut:['#ffc8c0','#e07880','#9a3450','#4e1634'],
      bone:['#fff8de','#e2d4ac','#aa9672','#665640'],
      shirt:['#fff0a0','#e8c440','#a8862a','#5e4420'],
      trim:['#7ad88a','#2e9a52','#1e6640','#103a2a'],
      rag:['#a8b4c8','#6e7c98','#4a5470','#2a3048'],
      hair:['#6a5e4c','#3e352a','#28221c','#14100c'],
      eye:['#ffffff','#eef2dc','#b4bca4','#707a6a'],
      pupil:['#fff6c0','#f2d040','#b08a1c','#5e4410'],
      mouth:['#8e3a48','#521c2c','#2e0c1a','#18060e'],
      teeth:['#f6ecbe','#d2be80','#968250','#5a4a2e'],
      nail:['#e8dcb8','#b4a47a','#7a6a4a','#40362a'],
      blood:['#9a4632','#6a2418','#441410','#260a0a'],
    };
    if(form==='enluarado'){
      m.skin=['#d0f4f0','#86c6c4','#4e8692','#283c5e']; m.rot=['#a6c8d4','#6e94a8','#46607c','#262e4e'];
      m.shirt=['#e8eaa8','#b4b866','#787a42','#40422a']; m.trim=['#8ad8e8','#3a8aaa','#245c7a','#12304a'];
      m.eye=['#ffffff','#d4fcff','#78e0f2','#2f8ab0']; m.pupil=['#ffffff','#9cf4ff','#3ab8e0','#1a5a88'];
      m.flesh=['#e0a8d0','#a8649e','#6a3a72','#381c46']; m.gut=['#ecc0e4','#c084c0','#844e8e','#4a2a5a'];
      m.blood=['#6a6aa8','#3e3e7a','#262654','#141430']; m.hair=['#4e5a6a','#2e3846','#1c2430','#0e121a'];
    }
    if(form==='plenilunar'){
      m.skin=['#f6b48a','#c8704a','#8a3a30','#4c1a24']; m.rot=['#d89c70','#a05c3c','#683028','#381418'];
      m.shirt=['#ffd88a','#e0963a','#9a5a22','#562c14']; m.trim=['#ff8a5a','#c8402a','#82221c','#46100e'];
      m.eye=['#fffbe0','#ffe9a8','#ffb050','#c2581a']; m.pupil=['#fffbe0','#ffd23f','#ff7a1a','#b8300e'];
      m.blood=['#d8442a','#9a1e14','#5e0e0c','#320606']; m.gut=['#ffb090','#e8604a','#a42e2a','#5a1218'];
      m.hair=['#4a2e22','#2e1c16','#1e120e','#120a08'];
    }
    return punch(m);
  }
  function sat(h,k){ const [r,g,b]=PIX.hexRgb(h), y=(r+g+b)/3; return PIX.toHex(y+(r-y)*k,y+(g-y)*k,y+(b-y)*k); }
  const NOPUNCH={eye:1,pupil:1};
  function punch(m){ const o={}; for(const k in m){ const r=m[k]; o[k]=NOPUNCH[k]?r:[sat(r[0],1.1),sat(r[1],1.16),PIX.mix(sat(r[2],1.12),'#2a1a4c',0.24),PIX.mix(r[3],'#140a24',0.4)]; } return o; }
  function heavyOutline(cv){ const g=cv.getContext('2d'), W=cv.width, H=cv.height, im=PIX.pix(cv), d=im.data;
    const isO=i=>d[i+3]===255&&d[i]===0x17&&d[i+1]===0x0b&&d[i+2]===0x1c, fill=i=>d[i+3]===255&&!isO(i);
    const add=[]; for(let y=2;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(d[i+3]) continue; const u=((y-1)*W+x)*4, u2=((y-2)*W+x)*4; if(isO(u)&&fill(u2)) add.push(i); }
    add.forEach(i=>{ d[i]=0x17; d[i+1]=0x0b; d[i+2]=0x1c; d[i+3]=255; }); g.putImageData(im,0,0); }
  const NAMES={skin:'Pele',rot:'Podridão',flesh:'Carne',gut:'Tripas',bone:'Osso',shirt:'Camisa',trim:'Gola/punho',rag:'Trapo',hair:'Cabelo',eye:'Olho',teeth:'Dentes',nail:'Unhas',blood:'Sangue'};

  /* ---------- poses ----------
     bx: desloca o corpo · sp: ângulo da coluna (peito erguido) · nk/hd: pescoço e cabeça (graus, + = pra cima)
     fx/fy, gx/gy: mão da frente / de trás no mundo (x relativo a AX, y = altura do chão) · pF/pB: mão espalmada no chão (0..1)
     oF/oB: abertura da mão · jaw · eyeO: olhos abertos · gw: balanço das tripas · br: respiração */
  const REST={bx:0,sp:11,nk:22,hd:6,jaw:9,fx:36,fy:0,gx:26,gy:0,pF:1,pB:1,oF:1,oB:1,eyeO:1,gw:0,br:0,flash:0,smear:0,tw:0,hy:0};
  const DEAD={bx:0,sp:2,nk:-14,hd:-10,jaw:12,fx:40,fy:0,gx:4,gy:0,pF:1,pB:1,oF:0.6,oB:0.3,eyeO:0,br:0};
  const ANIMS={
    idle:{nome:'Fingindo de morto',n:6,dur:i=>[420,420,320,160,420,500][i],pose:i=>Object.assign({},DEAD,[
      {br:0},{br:0.6},{br:1},{br:0.6,tw:1,oF:0.9},{br:0.2,eyeO:0.35},{br:0}][i])},
    alert:{nome:'Levantar a cabeça',n:6,dur:i=>[120,110,110,140,160,200][i],pose:i=>[
      Object.assign({},DEAD,{eyeO:0.6,tw:1}),
      Object.assign({},DEAD,{eyeO:1,nk:-4,hd:-4,sp:3,oF:1}),
      {sp:5,nk:10,hd:4,jaw:8,fx:36,gx:6,eyeO:1},
      {sp:9,nk:28,hd:14,jaw:14,fx:34,gx:16,eyeO:1,hy:-1},
      {sp:12,nk:30,hd:12,jaw:18,fx:34,gx:24,eyeO:1},
      {sp:11,nk:24,hd:8,jaw:10}][i]},
    walk:{nome:'Rastejar',n:8,mv:[0,1,5,6,0,1,5,6],dur:i=>[130,100,120,150,130,100,120,150][i],pose:i=>[
      {fx:44,fy:9,pF:0,oF:1,gx:22,sp:10,nk:22,hd:8,jaw:8,gw:0,bx:-2},
      {fx:50,fy:0,pF:1,gx:20,sp:11,nk:20,hd:6,jaw:10,gw:1,bx:-2},
      {fx:42,fy:0,pF:1,gx:16,sp:14,nk:18,hd:4,jaw:6,gw:2,bx:1,br:1},
      {fx:34,fy:0,pF:1,gx:16,gy:7,pB:0,sp:12,nk:20,hd:6,jaw:5,gw:3,bx:3},
      {fx:32,fy:0,pF:1,gx:40,gy:9,pB:0,oB:1,sp:10,nk:24,hd:9,jaw:8,gw:0,bx:-2},
      {fx:30,fy:0,pF:1,gx:46,gy:0,pB:1,sp:11,nk:22,hd:7,jaw:10,gw:1,bx:-2},
      {fx:26,fy:0,pF:1,gx:38,sp:14,nk:18,hd:4,jaw:6,gw:2,bx:1,br:1},
      {fx:30,fy:7,pF:0,gx:30,sp:12,nk:20,hd:6,jaw:5,gw:3,bx:3}][i]},
    attack:{nome:'Bote (agarra a perna)',n:7,hit:4,reach:42,dur:i=>[180,140,80,60,260,220,180][i],pose:i=>[
      {sp:7,nk:12,hd:6,jaw:6,fx:24,fy:4,pF:0,oF:0.4,gx:18,bx:-4,eyeO:1},
      {sp:3,nk:2,hd:-2,jaw:12,fx:12,fy:8,pF:0,oF:0.5,gx:10,bx:-11,eyeO:1,br:1},
      {sp:18,nk:26,hd:14,jaw:26,fx:44,fy:20,pF:0,oF:1,gx:16,bx:3,eyeO:1},
      {sp:26,nk:28,hd:16,jaw:34,fx:62,fy:18,pF:0,oF:1,gx:24,bx:12,smear:1,eyeO:1},
      {sp:20,nk:20,hd:10,jaw:30,fx:50,fy:15,pF:0,oF:0,gx:24,bx:10,eyeO:1},
      {sp:16,nk:16,hd:8,jaw:24,fx:44,fy:11,pF:0,oF:0,gx:22,bx:7,eyeO:1},
      {sp:11,nk:20,hd:6,jaw:10,fx:38,fy:0,pF:1,oF:1,gx:24,bx:2}][i]},
    // ---- ataques extras ----
    ankle:{nome:'Mordida no tornozelo',n:7,hit:3,reach:40,dur:i=>[170,160,60,200,170,150,160][i],pose:i=>[
      {sp:10,nk:26,hd:12,jaw:14,fx:34,gx:22,bx:-2,eyeO:1},
      {sp:6,nk:34,hd:22,jaw:36,fx:26,fy:4,pF:1,gx:18,bx:-8,eyeO:1,br:1},
      {sp:16,nk:14,hd:-4,jaw:40,fx:46,gx:24,bx:8,eyeO:1,smear:1},
      {sp:18,nk:8,hd:-12,jaw:2,fx:50,gx:26,bx:12,eyeO:1,tw:1},
      {sp:16,nk:10,hd:-8,jaw:4,fx:48,gx:26,bx:10,eyeO:1,tw:1,hy:1},
      {sp:13,nk:22,hd:8,jaw:20,fx:42,gx:24,bx:5,eyeO:1},
      {sp:11,nk:22,hd:6,jaw:10,fx:38,gx:24,bx:2}][i]},
    pull:{nome:'Puxão (arrasta pela perna)',n:8,hit:3,reach:52,dur:i=>[170,140,60,160,170,160,160,170][i],pose:i=>[
      {sp:9,nk:18,hd:6,jaw:10,fx:30,fy:2,gx:20,bx:-4,eyeO:1},
      {sp:5,nk:12,hd:2,jaw:16,fx:18,fy:8,pF:0,oF:0.5,gx:12,bx:-10,eyeO:1,br:1},
      {sp:20,nk:26,hd:12,jaw:28,fx:66,fy:12,pF:0,oF:1,gx:24,bx:6,eyeO:1,smear:1},
      {sp:22,nk:28,hd:14,jaw:30,fx:70,fy:10,pF:0,oF:0,gx:26,bx:8,eyeO:1},
      {sp:10,nk:16,hd:4,jaw:34,fx:40,fy:10,pF:0,oF:0,gx:44,gy:0,pB:1,bx:-6,eyeO:1,br:1},
      {sp:6,nk:12,hd:2,jaw:30,fx:26,fy:8,pF:0,oF:0,gx:40,bx:-12,eyeO:1},
      {sp:9,nk:18,hd:6,jaw:16,fx:30,fy:2,pF:1,oF:1,gx:28,bx:-4,eyeO:1},
      {sp:11,nk:22,hd:6,jaw:10,fx:36,gx:26,bx:0}][i]},
    hurt:{nome:'Dano',n:4,dur:i=>[70,110,130,160][i],pose:i=>[
      {bx:-9,sp:22,nk:54,hd:40,jaw:26,fx:24,fy:16,pF:0,oF:1,gx:6,gy:14,pB:0,flash:1},
      {bx:-6,sp:16,nk:40,hd:28,jaw:18,fx:28,fy:8,pF:0,oF:1,gx:10,gy:6,pB:0},
      {bx:-3,sp:13,nk:30,hd:16,jaw:12,fx:32,fy:0,gx:18},
      {bx:-1,sp:11,nk:24,hd:8,jaw:8}][i]},
    hurtB:{nome:'Dano (esmagado no chão)',n:4,dur:i=>[70,120,140,160][i],pose:i=>[
      {bx:-2,sp:0,nk:-20,hd:-14,jaw:24,fx:50,fy:0,gx:-14,gy:0,oF:1,oB:1,flash:1,hy:2},
      {bx:-2,sp:0,nk:-16,hd:-10,jaw:22,fx:50,fy:0,gx:-12,oF:1,oB:1,hy:1},
      {bx:-1,sp:6,nk:14,hd:10,jaw:16,fx:42,gx:8},
      {sp:10,nk:22,hd:8,jaw:10,fx:38,gx:22}][i]},
    death:{nome:'Morte',n:6,dur:i=>[90,140,160,200,240,500][i],pose:i=>[
      {bx:-5,sp:20,nk:50,hd:36,jaw:26,fx:30,fy:14,pF:0,oF:1,gx:10,gy:10,pB:0,flash:1},
      {bx:-4,sp:18,nk:44,hd:30,jaw:30,fx:34,fy:16,pF:0,oF:1,gx:14,gy:12,pB:0},
      {bx:-3,sp:8,nk:20,hd:10,jaw:24,fx:42,fy:4,pF:0,oF:0.8,gx:6,gy:3,pB:0,eyeO:0.6},
      {bx:-2,sp:2,nk:-8,hd:-8,jaw:20,fx:46,fy:0,gx:-4,oF:0.6,oB:0.5,eyeO:0.2,hy:1},
      {bx:-2,sp:1,nk:-16,hd:-12,jaw:18,fx:48,fy:0,gx:-8,oF:0.4,oB:0.3,eyeO:0},
      {bx:-2,sp:0,nk:-18,hd:-14,jaw:16,fx:48,fy:0,gx:-8,oF:0.3,oB:0.2,eyeO:0}][i]},
  };
  function poseOf(anim,i){ return Object.assign({},REST,ANIMS[anim].pose(i)); }

  /* ---------- esqueleto ---------- */
  const TL=48;
  function skeleton(P){
    const W0={x:AX-48+P.bx, y:G-10.4};
    const a=-rad(P.sp), c=Math.cos(a), s=Math.sin(a);
    const T=(lx,ly)=>({x:W0.x+(lx*c-ly*s)*BS, y:W0.y+(lx*s+ly*c)*BS});
    const shF=T(40,1.5), shB=T(42,-3.5), nb=T(47,-2);
    const na=rad(P.sp+P.nk), N={x:nb.x+Math.cos(na)*10, y:nb.y-Math.sin(na)*10+P.hy};
    const ha=-rad(P.sp+P.nk*0.5+P.hd), hc=Math.cos(ha), hs=Math.sin(ha);
    const H=(lx,ly)=>({x:N.x+(lx*hc-ly*hs)*1.36, y:N.y+(lx*hs+ly*hc)*1.36});
    const hF={x:AX+P.fx, y:G-3.6-P.fy}, hB={x:AX+P.gx, y:G-3.6-P.gy};
    const F=ik(shF,hF,22,21,false), B=ik(shB,hB,22,21,false);
    return {W0,a,T,shF,shB,nb,N,ha,H,elF:F.E,wrF:F.W,elB:B.E,wrB:B.W,eye:H(6,-7),mouth:H(11,-1)};
  }

  function pen(c,u){ const p=mkPen(c,u); p.c=c;
    p.clip=pts=>{ c.beginPath(); pts.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])); c.closePath(); c.clip(); };
    p.ln=(a,b,w)=>p.cap(a,b,w,w); p.save=()=>c.save(); p.restore=()=>c.restore(); return p; }
  function limb(p,R,a,b,wa,wb,sh=0.45){
    p.F(R[1]); p.cap(a,b,wa,wb);
    const L=Math.hypot(b.x-a.x,b.y-a.y)||1; let nx=-(b.y-a.y)/L, ny=(b.x-a.x)/L; if(nx*-0.5+ny*0.86<0){ nx=-nx; ny=-ny; }
    const q=(P,w,t)=>[P.x+nx*w*t,P.y+ny*w*t];
    p.F(R[2]); p.poly([q(a,wa,0.5-sh),q(b,wb,0.5-sh),q(b,wb,0.5),q(a,wa,0.5)]);
    p.F(R[3]); p.poly([q(a,wa,0.34),q(b,wb,0.34),q(b,wb,0.5),q(a,wa,0.5)]);
    p.F(R[0]); const u=q(lerp(a,b,0.15),wa,-0.3), v=q(lerp(a,b,0.75),wb,-0.3); p.ln(P2(u[0],u[1]),P2(v[0],v[1]),Math.max(0.8,wa*0.1));
    return {nx,ny};
  }

  /* ---------- tripas + trapo arrastando ---------- */
  function drawGuts(p,M,sk,P){
    p.id();
    const w0=sk.T(2,5), base=sk.W0.x, gw=P.gw*Math.PI/2;
    const pts=[w0, P2(base-6, G-4+Math.sin(gw)*0.8), P2(base-14, G-3.2), P2(base-22, G-3.8+Math.sin(gw+1.4)*1.2), P2(base-30, G-3), P2(base-37, G-3.4+Math.sin(gw+2.6)*0.8)];
    // trapo (pedaço da calça) arrastando por baixo
    p.F(M.rag[1]); p.poly([[w0.x+2,w0.y-4],[base-8,G-6],[base-20,G-4.4],[base-34,G-3],[base-44,G-1.6],[base-46,G],[base-30,G],[base-14,G],[w0.x+4,G]]);
    p.F(M.rag[2]); p.poly([[base-10,G-2],[base-30,G-1.4],[base-44,G-0.6],[base-46,G],[base-10,G]]);
    p.F(M.rag[0]); p.ln(P2(base-10,G-5.2),P2(base-26,G-3.6),0.7);
    p.F(M.rag[3]); for(let x=base-36;x<base-10;x+=3) p.rect(x,G-4.2+(x-base)*-0.04,1.2,0.5);
    p.F(M.rag[0]); [[base-46,G-0.4,base-50,G-2.2],[base-45,G-1.2,base-49,G-4],[base-42,G-2,base-44,G-5]].forEach(([a,b2,c2,d2])=>p.ln(P2(a,b2),P2(c2,d2),0.45));
    p.F(M.blood[1]); p.ell(base-24,G-2,3,0.9);
    p.F(M.rag[3]); p.poly([[base-44,G-1.6],[base-48,G-3],[base-47,G-0.4]]); p.poly([[base-38,G-2.6],[base-41,G-4.4],[base-40,G-2]]);
    // tripa em gomos (salsicha), com brilho molhado
    const seg=[]; for(let k=0;k<pts.length-1;k++){ const a=pts[k], b2=pts[k+1], L=Math.hypot(b2.x-a.x,b2.y-a.y), n=Math.max(1,Math.round(L/3.4)); for(let j=0;j<n;j++) seg.push(lerp(a,b2,j/n)); }
    seg.forEach((q,j)=>{ const r=j<2?3.4:2.8+((j%3)===0?0.6:0); p.F(M.gut[2]); p.ell(q.x,q.y,r+0.6,r); });
    seg.forEach((q,j)=>{ const r=j<2?3.4:2.8+((j%3)===0?0.6:0); p.F(M.gut[1]); p.ell(q.x+0.3,q.y-0.6,r-0.3,r-0.9); });
    seg.forEach((q,j)=>{ if(j%2) return; p.F(M.gut[0]); p.rect(q.x,q.y-1.8,1.2,0.8); });
    seg.forEach((q,j)=>{ if(j%2===0) return; p.F(M.gut[3]); p.rect(q.x-1.8,q.y-0.6,0.7,1.6); });
    seg.forEach((q,j)=>{ if(j%3!==1) return; p.F(M.gut[3]); p.ln(P2(q.x-1.4,q.y+0.4),P2(q.x+0.4,q.y-1.2),0.5); p.ln(P2(q.x+0.4,q.y-1.2),P2(q.x+1.6,q.y-0.6),0.45); });
    p.F(M.blood[2]); seg.forEach((q,j)=>{ if(j%4===2) p.rect(q.x-0.4,q.y+1.6,1.2,0.7); });
    // segunda tripa mais fina por cima
    p.F(M.gut[2]); p.cap(sk.T(1,1),P2(base-8,G-6.4+Math.sin(gw+0.7)),3,2.6); p.cap(P2(base-8,G-6.4+Math.sin(gw+0.7)),P2(base-15,G-4.6),2.6,2.4);
    p.F(M.gut[1]); p.ln(P2(base-5,G-7.6+Math.sin(gw+0.7)),P2(base-11,G-6.4),0.8);
  }

  /* ---------- tronco deitado (volumes por elipses; luz de cima em camadas) ---------- */
  function bodyE(b){ return [[34,-0.6,15.6,11.6+b*0.5],[14,0.8,15.4,9.6+b*0.3],[37,-8.4,7.4,3.8],[47,-1,5.6,7.6]]; }
  function ellPath(c,E,dx,dy,sh){ c.beginPath(); E.forEach(([x,y,rx,ry])=>{ c.moveTo(x+dx+Math.max(0.5,rx-sh),y+dy); c.ellipse(x+dx,y+dy,Math.max(0.5,rx-sh),Math.max(0.5,ry-sh),0,0,Math.PI*2); }); }
  function drawTorso(p,M,sk,P,form){
    p.xf(sk.a,sk.W0.x,sk.W0.y); p.c.scale(BS,BS);
    const b=P.br*0.8, E=bodyE(b), c=p.c;
    // coto: osso da coluna + carne rasgada
    p.F(M.bone[1]); p.cap(P2(3,-3.4),P2(-8,-5),3.6,3); p.F(M.bone[2]); p.rect(-4,-6.4,1,3.2); p.rect(-7,-6.6,1,2.8); p.F(M.bone[0]); p.rect(-7.6,-6.2,3.4,0.8);
    p.F(M.flesh[1]); p.poly([[2,-8.6],[-1.6,-6.4],[-3.6,-2],[-2.4,2],[-4,6],[-1,8.6],[3,9.8]]);
    p.F(M.flesh[2]); p.poly([[-1.4,-1],[-3.6,-2],[-2.4,2],[-4,6],[-1,8.6],[0.4,4]]); p.F(M.flesh[0]); p.rect(-1.6,-5.6,2.4,1); p.F(M.flesh[3]); p.rect(-2,3,1.4,1.4);
    // camisa (o corpo todo veste a camisa); camadas de tom
    p.F(M.shirt[2]); ellPath(c,E,0,0,0); c.fill();
    p.F(M.shirt[1]); ellPath(c,E,0.6,-4.4,2.6); c.fill();
    p.F(M.shirt[0]); ellPath(c,E,1.2,-8,6); c.fill();
    p.save(); ellPath(c,E,0,0,0); c.clip();
    p.F(M.shirt[3]); p.poly([[0,6.4],[12,5.6],[30,6.4],[50,5.2],[50,14],[0,14]]);
    // dobras do pano (vincos puxados pela cintura)
    p.F(M.shirt[2]); p.ln(P2(6,-5),P2(14,2),0.9); p.ln(P2(22,-8),P2(29,-1),0.9); p.ln(P2(31,-10),P2(38,-4),0.8); p.ln(P2(8,4),P2(20,6),0.8);
    p.F(M.shirt[0]); p.ln(P2(7,-6),P2(14.6,1),0.6); p.ln(P2(23,-9),P2(29.6,-2.4),0.6);
    // barriga suja de arrastar no chão
    p.F(M.rot[1]); p.poly([[2,6.4],[8,5.4],[12,6.6],[18,5.6],[24,7],[30,6],[36,7.4],[44,5.6],[50,6],[50,14],[2,14]]);
    p.F(M.rot[2]); p.poly([[2,9],[10,8.4],[20,9.4],[30,8.6],[40,9.6],[50,8.6],[50,14],[2,14]]);
    p.F(M.rot[0]); p.rect(14,6.2,2,0.8); p.rect(33,6.8,1.6,0.8);
    // rasgo lateral: pano esfarrapado em franjas, pele podre por baixo, uma costela aparecendo
    p.F(M.shirt[3]); p.poly([[12,1.6],[15,-2.4],[17.4,-0.8],[20.6,-3.6],[23,-0.6],[27,-1.6],[28,2.4],[24,4.6],[20,3.6],[16,5],[12.6,4]]);
    p.F(M.skin[2]); p.poly([[13.2,2],[15.4,-1],[17.6,0.4],[20.6,-2.2],[22.8,0.4],[26.2,-0.2],[26.6,2.6],[23.4,3.8],[20,2.8],[16,4],[13.6,3.4]]);
    p.F(M.rot[2]); p.ell(16.4,2.4,1.8,0.9); p.F(M.flesh[2]); p.poly([[21,-1],[23.4,1],[25.6,0.8],[24.8,2.8],[21.6,2.2]]);
    p.F(M.bone[1]); p.cap(P2(18.6,0.6),P2(22.6,3),1.4,1.1); p.F(M.bone[0]); p.rect(18.6,0.2,1.4,0.7);
    p.F(M.shirt[1]); [[15,-2.4],[20.6,-3.6],[27,-1.6]].forEach(([x,y])=>p.poly([[x-1.2,y-0.4],[x+1.2,y-0.4],[x+0.2,y+2.2]]));
    // furo menor perto do ombro
    p.F(M.flesh[3]); p.ell(38,2.4,2.6,1.8); p.F(M.skin[2]); p.ell(38.2,2.2,1.8,1.1); p.F(M.flesh[1]); p.rect(37.6,1.6,1,0.8);
    // barra rasgada na cintura e gola/ombro verde
    p.F(M.shirt[2]); p.poly([[0,-9],[4,-9.4],[2.4,-6],[4.6,-3],[1.6,0],[4.4,3],[2,6.4],[4,9.6],[0,10]]);
    p.F(M.trim[1]); p.poly([[44,-9.6],[48,-7],[51,-2.4],[49,-1.4],[46.4,-5.4],[42.6,-7.6]]); p.F(M.trim[0]); p.rect(44.6,-9,2,0.8); p.F(M.trim[2]); p.rect(48,-2.6,1.6,1);
    // sangue e sujeira
    p.F(M.blood[1]); p.ell(7,6.4,3.4,2); p.ell(33,8.6,3,1.6); p.ell(40,-4,1.6,1.2); p.F(M.blood[2]); p.ell(7.6,7,1.8,1); p.rect(32,8.4,2,1);
    p.F(M.shirt[3]); p.rect(28,4,1,1); p.rect(36,2,1,1);
    p.restore();
    p.F(M.shirt[3]); p.ln(P2(5,-8.4),P2(30,-11.4),0.5);
    // cós da bermuda rasgado + cinto com fivela (o que sobrou das pernas)
    p.F(M.rag[1]); p.poly([[-0.6,-8.4],[5.4,-9],[6,-4],[5,1],[6.4,6],[5.4,9.8],[-0.6,9.6],[0.6,5],[-1.2,1],[0.4,-3]]);
    p.F(M.rag[2]); p.poly([[-0.6,3],[6,3.4],[6.4,6],[5.4,9.8],[-0.6,9.6]]); p.F(M.rag[0]); p.rect(1,-8,3.6,0.9);
    p.F(M.hair[1]); p.poly([[2,-8.8],[4.4,-9],[4.8,9.6],[2.4,9.6]]);
    p.F(M.bone[2]); p.rect(1.6,-3,3.8,4.2); p.F(M.hair[2]); p.rect(2.6,-2,1.8,2.2); p.F(M.bone[0]); p.rect(1.6,-3,3.8,0.8);
    if(form==='plenilunar'){ [8,15,22,29,36].forEach((x,k)=>{ const by=-9.2-(x>28?2:0), h=5+(k%2)*2.4; p.F(M.bone[1]); p.poly([[x-2,by+1.6],[x+1.6,by+1.4],[x-1.6,by-h]]); p.F(M.bone[0]); p.rect(x-1.4,by-h+1.6,0.8,h-2); p.F(M.flesh[2]); p.rect(x-2,by+0.8,3.6,1); }); }
    if(form==='enluarado'){ p.F(M.pupil[1]); [[10,-8],[26,-9.6],[40,-10]].forEach(([x,y])=>{ p.ln(P2(x,y),P2(x+2.4,y+2),0.7); p.rect(x-0.4,y-0.4,0.8,0.8); }); }
    p.id();
  }

  /* ---------- braços ---------- */
  function drawHand(p,M,wr,ang,open,plant){
    p.xf(ang,wr.x,wr.y); p.c.scale(1.62,1.62);
    p.F(M.skin[1]); p.poly([[-1,-3.2],[4.6,-3.6],[5.6,3.4],[-1,3]]);
    p.F(M.skin[2]); p.poly([[-1,0.8],[5.4,1.2],[5.6,3.4],[-1,3]]);
    p.F(M.skin[0]); p.rect(0.6,-3,3,0.8);
    for(let k=0;k<4;k++){ const y0=-2.8+k*1.95;
      const spread=open*(-0.25+k*0.17), curl=(1-open)*3.2;
      const m=P2(4.8+Math.cos(spread)*3.8, y0+Math.sin(spread)*3.8+curl*0.3);
      const t=P2(m.x+Math.cos(spread+0.15+(1-open)*1.1)*3, m.y+Math.sin(spread+0.15+(1-open)*1.1)*3+(plant?0.4:0));
      p.F(M.skin[k>1?2:1]); p.cap(P2(4.6,y0),m,2.1,1.8); p.cap(m,t,1.8,1.4);
      p.F(M.skin[0]); p.rect(4.4,y0-0.7,1,0.7);
      p.F(M.nail[1]); const d=Math.atan2(t.y-m.y,t.x-m.x); p.poly([[t.x-0.6,t.y-0.7],[t.x+Math.cos(d)*2.2,t.y+Math.sin(d)*2.2+0.6],[t.x-0.4,t.y+0.8]]);
      p.F(M.nail[0]); p.rect(t.x-0.2,t.y-0.6,0.8,0.6);
      if(k){ p.F(M.skin[3]); p.ln(P2(5.6,y0-1),P2(m.x-0.4,m.y-1),0.45); } }
    p.F(M.skin[1]); p.cap(P2(1.4,-3.2),P2(4,-5.8),2.2,1.8); p.cap(P2(4,-5.8),P2(6,-6.6),1.8,1.4); p.F(M.nail[1]); p.rect(6,-7.4,1.4,1);
    p.id();
  }
  function drawArm(p,M,sk,sh,el,wr,open,plant,front,form){
    p.id();
    const nf=limb(p,M.skin,el,wr,9.2,7.6,0.58);
    const n=limb(p,M.skin,sh,el,10.6,8.6,0.58);
    // cotovelo ossudo
    p.F(M.bone[1]); p.circle(P2(el.x-n.nx*0.8,el.y-n.ny*0.8),1.6); p.F(M.bone[2]); p.rect(el.x-n.nx*0.8,el.y-n.ny*0.8,0.9,0.9);
    // veias e podridão
    const fz=lerp(el,wr,0.45); p.F(M.rot[1]); p.ell(fz.x,fz.y,1.6,1.1); p.F(M.rot[2]); p.rect(fz.x-0.4,fz.y-0.4,0.9,0.9);
    p.F(M.skin[3]); const v0=lerp(el,wr,0.15), v1=lerp(el,wr,0.55), v2=lerp(el,wr,0.9); p.ln(P2(v0.x-nf.nx*1.4,v0.y-nf.ny*1.4),P2(v1.x-nf.nx*0.4,v1.y-nf.ny*0.4),0.55); p.ln(P2(v1.x-nf.nx*0.4,v1.y-nf.ny*0.4),P2(v2.x-nf.nx*1.6,v2.y-nf.ny*1.6),0.5);
    p.F(M.rot[2]); const s1=lerp(el,wr,0.7); p.rect(s1.x-nf.nx*2,s1.y-nf.ny*2,0.9,0.9); p.rect(s1.x+1.6,s1.y-1,0.9,0.9);
    if(front){ p.F(M.flesh[2]); const q=lerp(sh,el,0.7); p.ell(q.x+n.nx*1.2,q.y+n.ny*1.2,1.8,1.2); p.F(M.flesh[1]); p.rect(q.x+n.nx*1.2-0.4,q.y+n.ny*1.2-0.6,1,0.8); }
    // manga amarela rasgada com punho verde (presa ao ombro)
    const se=lerp(sh,el,0.5); limb(p,M.shirt,P2(sh.x-1.6,sh.y-0.6),se,13.4,11.2,0.55);
    const ua=Math.atan2(el.y-sh.y,el.x-sh.x); p.xf(ua,se.x,se.y);
    p.F(M.trim[1]); p.poly([[-1.6,-4.4],[1.4,-4.4],[2.6,-2],[1.2,0],[2.8,2],[1.6,4.4],[-1.6,4.4]]); p.F(M.trim[2]); p.poly([[-1.6,1.4],[2.4,1.4],[1.6,4.4],[-1.6,4.4]]); p.F(M.trim[0]); p.rect(-1.2,-3.8,1,1.4);
    p.F(M.shirt[3]); p.rect(-5,1,0.8,2.4);
    p.id();
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x), a2=plant?ang*(1-plant)+0*plant:ang;
    drawHand(p,M,wr,a2,open,plant);
  }

  /* ---------- cabeça ---------- */
  function drawHead(p,M,sk,P,form){
    p.id(); limb(p,M.skin,sk.nb,sk.N,10,8.4,0.55);
    p.F(M.skin[3]); p.ln(lerp(sk.nb,sk.N,0.2),lerp(sk.nb,sk.N,0.8),0.8);
    p.xf(sk.ha,sk.N.x,sk.N.y); p.c.scale(1.36,1.36);
    // crânio + maçã
    p.F(M.skin[1]); p.ell(1.6,-6,8.4,7.6); p.poly([[2,-2],[10.6,-5.4],[12,-3],[11.4,0.4],[3,1.6],[-3,0]]);
    p.F(M.skin[2]); p.poly([[-6.6,-6],[-4,-1.6],[0,1],[4,1.6],[8,0.6],[6,-1.6],[1,-1.6],[-3,-4]]);
    p.F(M.skin[0]); p.ell(4,-11.4,4.2,1.6); p.rect(8.6,-8.6,2,1);
    // orelha rasgada
    p.F(M.skin[1]); p.ell(-3,-4.4,1.8,2.6); p.F(M.flesh[2]); p.ell(-3,-4,0.8,1.4); p.F(M.flesh[1]); p.rect(-4.4,-6.8,1.2,1);
    p.F(M.skin[3]); p.ln(P2(-2,-9),P2(0.6,-6.6),0.55); p.ln(P2(0.6,-6.6),P2(0,-4),0.5); p.F(M.flesh[3]); p.ln(P2(1,-12.6),P2(5,-12),0.7); p.F(M.bone[1]); p.rect(2.6,-12.8,1.4,0.7);
    // olho saltado (frente) + olho fundo
    p.F(M.skin[3]); p.ell(5.6,-6.8,3.6,3.2);
    if(P.eyeO>0.5){ p.F(M.eye[1]); p.ell(5.8,-6.8,3,2.8); p.F(M.eye[2]); p.ell(5.2,-6.2,2,1.6); p.F(M.pupil[1]); p.ell(6.6,-6.8,1.3,1.3); p.F(M.pupil[0]); p.rect(6.6,-7.6,0.8,0.8); p.F(M.eye[0]); p.rect(4.4,-8.6,1.2,0.9); }
    else if(P.eyeO>0.2){ p.F(M.skin[2]); p.ell(5.6,-7.6,3,1.8); p.F(M.eye[1]); p.ell(5.8,-5.8,2.4,1); p.F(M.pupil[1]); p.rect(6.2,-6.2,1.2,0.9); }
    else { p.F(M.skin[2]); p.ell(5.6,-7,3.2,2.4); p.F(M.skin[3]); p.ln(P2(3,-5.8),P2(8.4,-5.8),0.6); }
    p.F(M.skin[3]); p.ell(10.2,-6.6,1.3,1.6); if(P.eyeO>0.5){ p.F(M.pupil[2]); p.rect(10,-7,0.9,0.9); }
    // sobrancelha/arcada
    p.F(M.skin[1]); p.poly([[2.6,-10.6],[11,-9.8],[10.8,-8.6],[3,-9.2]]);
    // nariz carcomido
    p.F(M.skin[1]); p.poly([[9.6,-6.6],[12.4,-3.8],[10.4,-3.4]]); p.F(M.flesh[3]); p.rect(10.6,-4.4,1,1);
    // boca: gengiva e dentes de cima (poucos tons, legível)
    p.F(M.mouth[2]); p.poly([[4.4,-2.8],[11.6,-3.4],[12,0.4],[4.4,0.6]]);
    p.F(M.mouth[1]); p.poly([[4.4,-2.8],[11.6,-3.4],[11.6,-2.2],[4.4,-1.8]]);
    p.F(M.teeth[1]); p.poly([[5.6,-2.4],[7,-2.5],[6.6,-0.4]]); p.poly([[7.4,-2.6],[9,-2.7],[8.4,-0.2]]); p.poly([[9.4,-2.8],[10.8,-2.9],[10.2,-0.8]]);
    // podridão
    p.F(M.rot[1]); p.ell(-1,-9,2,1.4); p.F(M.rot[2]); p.rect(-1.4,-9.4,1,1); p.F(M.flesh[2]); p.ell(1.2,-2.6,1.4,1); 
    // cabelo comprido e ralo: mechas caindo da nuca
    p.F(M.hair[1]); p.poly([[-7,-7],[-4,-12.8],[1,-14.2],[6.4,-13.6],[2,-12.2],[-1.6,-10.8],[-3.4,-7]]);
    [[-6.8,-6,-11,6,1.6],[-5,-8,-7.6,8,1.4],[-3,-9.6,-3.6,7,1.2],[-7.4,-4,-13.4,2,1.2]].forEach(([x0,y0,x1,y1,w])=>{ p.F(M.hair[1]); p.cap(P2(x0,y0),P2((x0+x1)/2+1,(y0+y1)/2),w,w*0.8); p.cap(P2((x0+x1)/2+1,(y0+y1)/2),P2(x1,y1),w*0.8,0.5); });
    p.F(M.hair[0]); p.ln(P2(-3,-12.6),P2(2,-13.6),0.6); p.ln(P2(-6,-5),P2(-8,0),0.5); p.F(M.hair[2]); p.ln(P2(-4.6,-6),P2(-6,2),0.5);
    p.id();
  }
  function drawJaw(p,M,sk,P){
    const h=sk.H(1,0.4); p.xf(sk.ha+rad(P.jaw),h.x,h.y); p.c.scale(1.36,1.36);
    p.F(M.skin[1]); p.poly([[-2,-0.6],[9.6,0.2],[10.4,2],[8.6,4.6],[2.4,5.2],[-2.4,2.6]]);
    p.F(M.skin[2]); p.poly([[-2.4,2.6],[2.4,5.2],[8.6,4.6],[9,3.4],[2,3.6]]);
    p.F(M.mouth[2]); p.rect(3,-0.2,7.2,1.4);
    p.F(M.teeth[1]); p.rect(4.6,-1.6,1.3,1.8); p.rect(6.4,-1.6,1.3,1.9); p.rect(8.2,-1.5,1.2,1.7);
    p.F(M.blood[1]); p.poly([[8.6,3.4],[9.8,3],[9.4,6.4],[8.8,6.6]]);
    p.id();
  }
  function drawSmear(p,M,sk){
    p.id(); p.F(M.skin[0]);
    const w=sk.wrF, e=sk.elF;
    p.poly([[w.x+8,w.y-8],[e.x-2,e.y-10],[e.x-20,e.y-2],[e.x-22,e.y+6],[e.x-8,e.y+6],[w.x-2,w.y+6]]);
    p.F(M.eye[0]); p.poly([[w.x+6,w.y-7],[e.x-4,e.y-8],[e.x-16,e.y-2],[e.x-6,e.y-4]]);
  }

  /* ---------- montagem ---------- */
  const cache=PIX.cache();
  function build(form,P,step){
    const M=mats(form), sk=skeleton(P), K=PIX.getK();
    const parts=[
      {draw:(c,u)=>drawGuts(pen(c,u),M,sk,P)},
      {back:true, draw:(c,u)=>drawArm(pen(c,u),M,sk,sk.shB,sk.elB,sk.wrB,P.oB,P.pB,false,form)},
      {draw:(c,u)=>drawTorso(pen(c,u),M,sk,P,form)},
      {draw:(c,u)=>drawHead(pen(c,u),M,sk,P,form)},
      {draw:(c,u)=>drawJaw(pen(c,u),M,sk,P)},
    ];
    if(P.smear) parts.push({noShade:true, smear:true, draw:(c,u)=>drawSmear(pen(c,u),M,sk)});
    parts.push({draw:(c,u)=>drawArm(pen(c,u),M,sk,sk.shF,sk.elF,sk.wrF,P.oF,P.pF,true,form)});
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:G*K,parts,M,step,flash:P.flash,rim:RIM[form]}); if(step>=4) heavyOutline(cv);
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._eye=sc(sk.eye); cv._hand=sc(sk.wrF); cv._head=sc(sk.H(2,-12)); cv._waist=sc(sk.W0);
    return cv;
  }
  function frame(form,anim,fi,step=5){ const key=form+anim+fi+step+'@'+PIX.getK(); if(!cache.has(key)) cache.set(key,build(form,poseOf(anim,fi),step)); return cache.get(key); }
  function framePose(form,anim,P,key){ const k='#'+key+'|'+form+'@'+PIX.getK(); let c=cache.get(k); if(c) return c;
    c=build(form,Object.assign({},REST,P),5); cache.set(k,c); if(cache.size>1400) cache.delete(cache.keys().next().value); return c; }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame,framePose};
})();
