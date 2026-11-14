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
