/* BRUT — fonte de arte (editável). Build: npm run art
   Mini boss "Brutamonte": estivador/segurança do porto mutado. Corcunda gigante, braços de estivador,
   punhos encapsulados em entulho de concreto com vergalhão, correntes, camisa explodida, veias brilhando. */
const BRUT=(function(){
  const {rad,lp,lerp,P2,mkPen,compose}=PIX;
  const FW=392, FH=296, GROUND=286, AX=152;
  const RIM={normal:'#b9c9f2', furia:'#ff9466'};

  /* ---- cor: saturação +15% e rampas intermediárias (6 tons por material) ---- */
  function hsl(h){ const [r,g,b]=PIX.hexRgb(h).map(v=>v/255), mx=Math.max(r,g,b), mn=Math.min(r,g,b), l=(mx+mn)/2; let s=0,hh=0;
    if(mx!==mn){ const d=mx-mn; s=l>0.5?d/(2-mx-mn):d/(mx+mn); hh=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4; hh/=6; } return [hh,s,l]; }
  function hex(hh,s,l){ const f=(p,q,t)=>{ if(t<0)t+=1; if(t>1)t-=1; return t<1/6?p+(q-p)*6*t:t<1/2?q:t<2/3?p+(q-p)*(2/3-t)*6:p; };
    let r,g,b; if(s===0){ r=g=b=l; } else { const q=l<0.5?l*(1+s):l+s-l*s, p=2*l-q; r=f(p,q,hh+1/3); g=f(p,q,hh); b=f(p,q,hh-1/3); } return PIX.toHex(r*255,g*255,b*255); }
  const sat=(h,k=1.15)=>{ const [a,s,l]=hsl(h); return hex(a,Math.min(1,s*k),l); };
  function finish(m,skip){ const used=new Set(), uniq=h=>{ let x=h, k=0; while(used.has(x)){ const [r,g,b]=PIX.hexRgb(h); k++; x=PIX.toHex(r>128?r-k:r+k,g,b>128?b-(k>>1):b+(k>>1)); } used.add(x); return x; };
    for(const k of Object.keys(m)){ if(!skip.includes(k)) m[k]=m[k].map(h=>sat(h)); }
    const keys=Object.keys(m);
    for(const k of keys){ if(skip.includes(k)) continue; const r=m[k];
      m[k+'Q']=[PIX.mix(PIX.mix(r[0],r[1],0.5),'#ffd9a0',0.12), PIX.mix(PIX.mix(r[1],r[2],0.5),'#6a3ca0',0.16), PIX.mix(r[2],'#3b2c63',0.3), PIX.mix(r[3],'#1c1233',0.35)]; }
    for(const k of Object.keys(m)) m[k]=m[k].map(uniq);
    return m; }
  let QM=null; const qOf=R=>{ if(!QM) return R; for(const k in QM) if(QM[k]===R) return QM[k+'Q']||R; return R; };
  const MC={};
  function mats(form){ return MC[form]||(MC[form]=mats0(form)); }
  function mats0(form){
    const m={
      skin:['#eaf2ac','#a6b86c','#6c7870','#363456'],
      bruise:['#c49ac8','#86609c','#563c76','#30224e'],
      flesh:['#ff9f90','#d2505f','#8e2742','#4f1531'],
      bone:['#fff5d8','#e2cd9f','#a89172','#675545'],
      vein:['#f2ffc4','#b4ec5c','#62a43e','#2f5e36'],
      eye:['#fbffe2','#d8ff6e','#78c83c','#336e2c'],
      teeth:['#f8efc6','#d8c488','#9c8a5a','#5c4e32'],
      mouth:['#6c2232','#3e0e1c','#280812','#16040a'],
      shirt:['#ffc274','#e87a2c','#a4461f','#5c2317'],
      hivis:['#ffffff','#d6deea','#8c96ae','#4a526e'],
      pants:['#8c9ce2','#4f5ca4','#2f3368','#1a1838'],
      boot:['#8c8696','#585260','#38323f','#1f1b27'],
      steel:['#f3f5fb','#b6bcca','#747c94','#41475e'],
      iron:['#cac1b8','#8c817c','#5c525a','#362f3b'],
      rust:['#e4a472','#aa5c36','#703626','#421d19'],
      concrete:['#e6e2d8','#acA8a0','#76747c','#47464f'],
      blood:['#b44444','#802332','#541526','#320b1a'],
      fx:['#fffef0','#fff0a8','#ffc04a','#e07a22'],
      dust:['#e8dccb','#c4b49e','#94846f','#5e5246'],
    };
    m.concrete=m.concrete.map(h=>h.toLowerCase());
    if(form==='furia'){
      m.skin=['#ffcca4','#d6785e','#a04c5c','#4c1e46'];
      m.bruise=['#e08a8a','#a8465e','#6e2848','#40163a'];
      m.flesh=['#ffc0a0','#ff5a4a','#b0202e','#621020'];
      m.vein=['#fff4b8','#ff8a2e','#d0301a','#701012'];
      m.eye=['#ffffff','#ffe04e','#ff7a1e','#b0300c'];
      m.blood=['#ff6a42','#c42a2a','#7a1420','#4a0a16'];
      m.shirt=['#e08a50','#a04a26','#682a1c','#3a1412'];
    }
    return finish(m,['fx','dust','eye','vein']);
  }
  const NAMES={skin:'Pele mutada',bruise:'Hematomas',flesh:'Carne viva',bone:'Esporões de osso',vein:'Veias brilhando',eye:'Olhos',shirt:'Camisa explodida',hivis:'Faixa refletiva',pants:'Calça de estivador',boot:'Bota de bico de aço',iron:'Correntes',rust:'Vergalhão',concrete:'Punhos de entulho',blood:'Sangue'};

  /* ---------------- poses ---------------- */
  const REST={hx:0,drop:6,lean:26,head:0,jaw:6,aFs:12,aFe:-2,aBs:4,aBe:-8,lFh:28,lFk:2,lBh:-26,lBk:-18,fF:0,fB:0,
    flash:0,rock:0,throwF:0,roar:0,dazed:0,dz:0,impact:0,smear:0,breath:0,sw:0,dead:0,plant:0,run:0,clash:0};
  const S=Math.sin, C=Math.cos, PI=Math.PI;
  const runLeg=(i,o)=>{ const p=i/4*PI*2; const f=s=>10+34*S(s); const k=s=>f(s)-40*Math.max(0,C(s)); return {lFh:f(p),lFk:k(p),lBh:f(p+PI),lBk:k(p+PI),hx:o,drop:2+3*Math.abs(C(p)),fF:-10*S(p),fB:-10*S(p+PI)}; };
  const ANIMS={
    idle:{nome:'Parado (respiração pesada)',n:8,dur:()=>165,pose:i=>{ const p=i/8*PI*2, s=S(p);
      return {lean:26+2.5*s, drop:6+2*S(p-0.6), breath:0.5+0.5*s, head:-1+3*S(p-0.8), jaw:4+4*Math.max(0,S(p-0.4)),
        aFs:8+3*S(p-0.5), aFe:-2+5*S(p-1.1), aBs:2+3*S(p+0.4), aBe:-8+4*S(p-0.3), sw:S(p-1.3)}; }},
    walk:{nome:'Andar (pesado)',n:8,dur:()=>140,pose:i=>{ const p=i/8*PI*2;
      const lFh=20+22*S(p), lBh=-20+22*S(p+PI);
      return {lFh, lFk:lFh-26*Math.max(0,C(p))-4, lBh, lBk:lBh-26*Math.max(0,C(p+PI))-6,
        drop:7+4*C(2*(p-PI/2-0.45)), lean:28+3*S(2*p+0.6), head:-2+3*S(2*p-0.9), jaw:5,
        aFs:6-18*S(p), aFe:-6-20*S(p)-6, aBs:2+18*S(p), aBe:-8+18*S(p)-8, hx:1.5*S(2*p), sw:S(p+1), fF:-6*C(p), fB:-6*C(p+PI)}; }},
    charge:{nome:'Investida',n:10,warn:[0,1,2,3],run:[4,5,6,7],slam:2,dur:i=>[260,200,90,360,90,90,90,90,210,200][i],pose:i=>[
      {lean:32,head:12,jaw:6,aFs:-36,aFe:-16,aBs:-46,aBe:-26,drop:10,lFh:28,lFk:2,lBh:-26,lBk:-22},
      {lean:-8,head:-22,jaw:16,roar:1,aFs:150,aFe:118,aBs:144,aBe:112,drop:-2,lFh:12,lFk:0,lBh:-12,lBk:-14},
      {lean:52,head:6,jaw:12,aFs:56,aFe:26,aBs:46,aBe:16,impact:1,drop:16,lFh:34,lFk:6,lBh:-30,lBk:-30,hx:6},
      {lean:36,head:-16,jaw:18,roar:1,aFs:42,aFe:30,aBs:30,aBe:18,drop:12,lFh:30,lFk:6,lBh:-40,lBk:-56,fB:-16,hx:4},
      Object.assign({lean:48,head:-8,jaw:12,aFs:74,aFe:66,aBs:-40,aBe:-10,run:1},runLeg(0,10)),
      Object.assign({lean:50,head:-6,jaw:14,aFs:78,aFe:70,aBs:-48,aBe:-18,run:1},runLeg(1,10)),
      Object.assign({lean:48,head:-8,jaw:12,aFs:74,aFe:66,aBs:-40,aBe:-10,run:1},runLeg(2,10)),
      Object.assign({lean:50,head:-6,jaw:14,aFs:78,aFe:70,aBs:-48,aBe:-18,run:1},runLeg(3,10)),
      {lean:22,head:-4,jaw:10,aFs:50,aFe:40,aBs:-10,aBe:10,hx:8,lFh:42,lFk:34,lBh:-30,lBk:-44,drop:8,impact:1},
      {lean:24,head:0,jaw:6,aFs:24,aFe:12,aBs:0,aBe:-6,hx:4,lFh:24,lFk:8,lBh:-20,lBk:-18,drop:4}][i]},
    throw:{nome:'Arremesso de entulho',n:8,rip:1,toss:4,dur:i=>[200,200,220,200,80,160,180,160][i],pose:i=>[
      {lean:62,head:16,jaw:6,aFs:26,aFe:14,aBs:20,aBe:0,drop:20,lFh:32,lFk:2,lBh:-28,lBk:-26},
      {lean:56,head:8,jaw:14,aFs:20,aFe:4,aBs:18,aBe:-4,drop:18,rock:1,impact:1,lFh:32,lFk:2,lBh:-28,lBk:-26},
      {lean:6,head:-10,jaw:10,aFs:-98,aFe:168,aBs:60,aBe:80,rock:1,drop:2,lFh:22,lFk:4,lBh:-22,lBk:-22,hx:-4},
      {lean:-10,head:-14,jaw:16,roar:1,aFs:-116,aFe:156,aBs:76,aBe:100,rock:1,drop:4,lFh:24,lFk:6,lBh:-28,lBk:-30,hx:-8},
      {lean:40,head:4,jaw:20,aFs:84,aFe:74,aBs:-30,aBe:-20,throwF:1,smear:1,drop:8,lFh:30,lFk:6,lBh:-26,lBk:-34,hx:10},
      {lean:46,head:6,jaw:12,aFs:52,aFe:30,aBs:-34,aBe:-24,drop:10,lFh:30,lFk:6,lBh:-26,lBk:-34,hx:10},
      {lean:30,head:2,jaw:8,aFs:28,aFe:10,aBs:-10,aBe:-14,drop:6,lFh:22,lFk:4,lBh:-20,lBk:-18,hx:6},
      {lean:20,head:0,jaw:5,hx:2,drop:2}][i]},
    dazed:{nome:'Atordoado (bateu na parede)',n:6,dur:()=>150,pose:i=>{ const p=i/6*PI*2, s=S(p);
      return {lean:10+7*s, head:-26+12*S(p+1), jaw:16, hx:3*s, aFs:2+5*S(p+0.6), aFe:-10+6*S(p+0.3), aBs:-4+4*s, aBe:-12, dazed:1, dz:i/6, drop:4+2*C(p),
        lFh:18+4*s, lFk:6, lBh:-14+4*s, lBk:-8}; }},
    hurt:{nome:'Dano',n:4,dur:i=>[80,110,130,160][i],pose:i=>[
      {lean:4,head:-26,jaw:18,hx:-6,flash:1,aFs:-14,aFe:-30,aBs:-20,aBe:-34,drop:2},
      {lean:8,head:-20,jaw:14,hx:-5,aFs:-6,aFe:-18,aBs:-12,aBe:-24,drop:4},
      {lean:14,head:-10,jaw:8,hx:-2,aFs:2,aFe:-8,drop:3},
      {}][i]},
    fall:{nome:'Derrubado',n:5,dur:i=>[90,130,140,120,260][i],pose:i=>[
      {lean:-6,head:-30,jaw:18,hx:-6,flash:1,aFs:-30,aFe:-50,aBs:-40,aBe:-60},
      {lean:-34,head:-20,jaw:16,hx:-6,aFs:110,aFe:150,aBs:100,aBe:140,lFh:40,lFk:10,lBh:10,lBk:-6,drop:6},
      {lean:-70,head:-10,jaw:12,hx:14,aFs:170,aFe:190,aBs:160,aBe:180,lFh:80,lFk:50,lBh:60,lBk:30,drop:10},
      {lean:-92,head:0,jaw:10,hx:22,aFs:180,aFe:200,aBs:170,aBe:190,lFh:100,lFk:80,lBh:90,lBk:70,impact:1},
      {lean:-90,head:4,jaw:6,hx:22,aFs:176,aFe:196,aBs:166,aBe:186,lFh:96,lFk:70,lBh:86,lBk:60}][i]},
    getup:{nome:'Levantar',n:5,dur:i=>[180,180,200,180,200][i],pose:i=>[
      {lean:-90,head:4,jaw:6,hx:22,aFs:176,aFe:196,aBs:166,aBe:186,lFh:96,lFk:70,lBh:86,lBk:60},
      {lean:-40,head:-6,jaw:8,hx:10,aFs:-60,aFe:-20,aBs:-50,aBe:-10,lFh:70,lFk:-10,lBh:40,lBk:-30,plant:1},
      {lean:40,head:-4,jaw:10,hx:-8,aFs:30,aFe:10,aBs:20,aBe:0,lFh:50,lFk:-20,lBh:-60,lBk:-10,plant:1,drop:4},
      {lean:30,head:-10,jaw:14,hx:-2,aFs:20,aFe:4,aBs:10,aBe:-6,lFh:30,lFk:4,lBh:-26,lBk:-20,drop:8},
      {lean:16,head:-14,jaw:16,roar:1,aFs:40,aFe:60,aBs:30,aBe:50}][i]},
    death:{nome:'Morte',n:12,dur:i=>[90,160,180,200,220,260,160,120,80,160,300,600][i],pose:i=>[
      {lean:2,head:-30,jaw:20,hx:-6,flash:1,aFs:-20,aFe:-40,aBs:-26,aBe:-44,drop:2},
      {lean:-8,head:-34,jaw:22,roar:1,hx:-10,aFs:110,aFe:130,aBs:100,aBe:120},
      {lean:26,head:10,jaw:16,hx:-4,aFs:10,aFe:0,aBs:6,aBe:-6,lFh:24,lFk:10,lBh:-20,lBk:-30,drop:6},
      {lean:30,head:14,jaw:12,hx:0,aFs:6,aFe:-4,aBs:2,aBe:-8,lFh:40,lFk:6,lBh:-60,lBk:30,drop:10},
      {lean:24,head:18,jaw:10,hx:2,aFs:4,aFe:-2,aBs:0,aBe:-6,lFh:-40,lFk:60,lBh:-50,lBk:50,fF:-60,fB:-60},
      {lean:30,head:24,jaw:12,hx:2,aFs:2,aFe:0,aBs:-2,aBe:-4,lFh:-46,lFk:66,lBh:-54,lBk:56,fF:-66,fB:-66},
      {lean:56,head:16,jaw:12,hx:6,aFs:40,aFe:30,aBs:34,aBe:24,lFh:-60,lFk:50,lBh:-64,lBk:46,fF:-70,fB:-70},
      {lean:78,head:6,jaw:14,hx:12,aFs:70,aFe:60,aBs:64,aBe:54,lFh:-80,lFk:-30,lBh:-84,lBk:-40,fF:-80,fB:-80},
      {lean:92,head:-4,jaw:18,hx:16,aFs:-60,aFe:-70,aBs:-64,aBe:-74,lFh:-92,lFk:-80,lBh:-96,lBk:-86,fF:70,fB:70,impact:1,flash:0},
      {lean:88,head:-8,jaw:14,hx:16,aFs:-56,aFe:-66,aBs:-60,aBe:-70,lFh:-88,lFk:-76,lBh:-92,lBk:-82,fF:70,fB:70,drop:-3},
      {lean:92,head:-2,jaw:12,hx:16,aFs:-60,aFe:-72,aBs:-64,aBe:-76,lFh:-92,lFk:-82,lBh:-96,lBk:-86,fF:70,fB:70,dead:0.5},
      {lean:92,head:-2,jaw:12,hx:16,aFs:-60,aFe:-72,aBs:-64,aBe:-76,lFh:-92,lFk:-82,lBh:-96,lBk:-86,fF:70,fB:70,dead:1}][i]},
    intro:{nome:'Entrada (WARNING)',n:10,dur:i=>[260,200,200,160,90,260,140,140,200,520][i],pose:i=>[
      {lean:58,head:24,jaw:2,aFs:20,aFe:10,aBs:14,aBe:4,drop:22,lFh:34,lFk:0,lBh:-30,lBk:-26},
      {lean:40,head:10,jaw:4,aFs:30,aFe:30,aBs:24,aBe:24,drop:14,lFh:28,lFk:2,lBh:-24,lBk:-20},
      {lean:12,head:-6,jaw:6,aFs:96,aFe:150,aBs:90,aBe:150,drop:4},
      {lean:2,head:-12,jaw:8,aFs:150,aFe:120,aBs:144,aBe:116,drop:0},
      {lean:6,head:-10,jaw:14,aFs:136,aFe:92,aBs:132,aBe:96,clash:1,drop:4},
      {lean:8,head:-12,jaw:12,aFs:132,aFe:90,aBs:128,aBe:94,drop:5},
      {lean:12,head:-6,jaw:10,aFs:60,aFe:170,aBs:20,aBe:10,drop:3},
      {lean:10,head:-8,jaw:12,aFs:20,aFe:10,aBs:60,aBe:170,drop:3},
      {lean:-6,head:-30,jaw:24,roar:1,aFs:-50,aFe:-90,aBs:-60,aBe:-96,drop:2,lFh:22,lBh:-22,lBk:-18,breath:1},
      {lean:-4,head:-32,jaw:26,roar:1,aFs:-54,aFe:-94,aBs:-64,aBe:-100,drop:3,lFh:22,lBh:-22,lBk:-18,breath:1}][i]},
  };
  function poseOf(anim,i){ return Object.assign({},REST,ANIMS[anim].pose(i)); }

  /* ---------------- esqueleto ---------------- */
  const THI=34, SHN=30, UPA=40, FOA=36;
  function bones(P,hy){
    const hip={x:AX+P.hx,y:hy};
    const hipF={x:hip.x+9,y:hip.y+2}, hipB={x:hip.x-9,y:hip.y};
    const kneeF=lp(hipF,P.lFh,THI), ankleF=lp(kneeF,P.lFk,SHN), kneeB=lp(hipB,P.lBh,THI), ankleB=lp(kneeB,P.lBk,SHN);
    const a=rad(P.lean), c=C(a), s=S(a);
    const T=(lx,ly)=>({x:hip.x+lx*c-ly*s, y:hip.y+lx*s+ly*c});
    const neck=T(46,-72), shF=T(16,-84), shB=T(-20,-88);
    const ha=rad(P.lean*0.35+P.head), hc=C(ha), hs=S(ha);
    const H=(lx,ly)=>({x:neck.x+lx*hc-ly*hs, y:neck.y+lx*hs+ly*hc});
    const elF=lp(shF,P.aFs,UPA), wrF=lp(elF,P.aFe,FOA), elB=lp(shB,P.aBs,UPA), wrB=lp(elB,P.aBe,FOA);
    return {hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,neck,shF,shB,elF,wrF,elB,wrB,a,ha,H,T};
  }
  function skeleton(P){
    const b0=bones(P,150);
    const foot=(an,fa)=>{ const r=rad(fa); return Math.max(an.y+10, an.y+10+S(r)*30, an.y-14*C(r)+10); };
    const cs=[foot(b0.ankleF,P.fF), foot(b0.ankleB,P.fB), b0.kneeF.y+11, b0.kneeB.y+11,
      b0.T(44,-60).y+2, b0.T(36,-26).y+2, b0.T(-36,-58).y+2, b0.T(-30,-20).y+2, b0.T(-20,-96).y+2, b0.H(16,4).y+10];
    if(P.plant) cs.push(lp(b0.wrF,P.aFe,22).y+4);
    const dy=GROUND-Math.max(...cs)+P.drop;
    const sk=bones(P,150+dy);
    sk.eye=sk.H(21,-9); sk.mouth=sk.H(24,2);
    return sk;
  }

  /* ---------------- utilidades de desenho ---------------- */
  const LIGHT={x:0.6,y:-0.8};
  function limb(p,a,b){ const ang=Math.atan2(b.y-a.y,b.x-a.x); p.xf(ang,a.x,a.y); return {ang,L:Math.hypot(b.x-a.x,b.y-a.y)}; }
  function band(p,pts,w){ for(let k=0;k<pts.length-1;k++) p.cap(pts[k],pts[k+1],w,w); }
  function arc(p,cx,cy,rx,ry,a0,a1,w,n=8){ const pts=[]; for(let k=0;k<=n;k++){ const t=rad(a0+(a1-a0)*k/n); pts.push(P2(cx+C(t)*rx,cy+S(t)*ry)); } band(p,pts,w); }
  // bloco facetado com luz em espaço de tela (ang = rotação da transformação ativa)
  function facet(p,R,pts,cx,cy,ang,inset=0.42){
    p.F(R[1]); p.poly(pts);
    const ca=C(ang), sa=S(ang);
    for(let i=0;i<pts.length;i++){
      const a=pts[i], b=pts[(i+1)%pts.length];
      let nx=b[1]-a[1], ny=-(b[0]-a[0]); const L=Math.hypot(nx,ny)||1; nx/=L; ny/=L;
      const mx=(a[0]+b[0])/2-cx, my=(a[1]+b[1])/2-cy; if(nx*mx+ny*my<0){ nx=-nx; ny=-ny; }
      const sx=nx*ca-ny*sa, sy=nx*sa+ny*ca, d=sx*LIGHT.x+sy*LIGHT.y;
      const t=d>0.5?0:d>-0.1?1:d>-0.65?2:3; if(t===1) continue;
      const ia=[a[0]+(cx-a[0])*inset,a[1]+(cy-a[1])*inset], ib=[b[0]+(cx-b[0])*inset,b[1]+(cy-b[1])*inset];
      p.F(R[t]); p.poly([a,b,ib,ia]);
    }
  }
  // massa volumétrica: sombra cheia, meio-tom deslocado pra luz, brilho pequeno
  let CTX=null;
  function lightLocal(ang){ return [LIGHT.x*C(-ang)-LIGHT.y*S(-ang), LIGHT.x*S(-ang)+LIGHT.y*C(-ang)]; }
  // placa: volume em blocos (luz quente, meia-luz, base, meia-sombra roxa, sombra, oclusão) — ~45% em sombra
  function shadeIn(p,R,Q,cx,cy,rx,ry,ang,hi,rot){
    const [lx,ly]=lightLocal(ang);
    p.F(Q[1]); p.ell(cx-lx*rx*0.8,cy-ly*ry*0.8,rx,ry,rot);
    p.F(R[2]); p.ell(cx-lx*rx*1.05,cy-ly*ry*1.05,rx,ry,rot);
    p.F(R[3]); p.ell(cx-lx*rx*1.45,cy-ly*ry*1.45,rx,ry,rot);
    if(hi){ p.F(Q[0]); p.ell(cx+lx*rx*1.12,cy+ly*ry*1.12,rx,ry,rot); p.F(R[0]); p.ell(cx+lx*rx*1.5,cy+ly*ry*1.5,rx*(0.7+0.3*hi),ry*(0.7+0.3*hi),rot); }
  }
  function mass(p,R,cx,cy,rx,ry,ang,hi=1,ks,core,rot=0){
    const Q=qOf(R);
    p.F(R[1]); p.ell(cx,cy,rx,ry,rot);
    CTX.save(); CTX.beginPath(); CTX.ellipse(cx,cy,rx,ry,rot,0,PI*2); CTX.clip();
    shadeIn(p,R,Q,cx,cy,rx,ry,ang,hi,rot);
    CTX.restore();
  }
  // placa poligonal (dobras de tecido/couro, blocos de músculo)
  function platePoly(p,R,pts,ang,hi=1){
    const Q=qOf(R); let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9; pts.forEach(([x,y])=>{ x0=Math.min(x0,x); y0=Math.min(y0,y); x1=Math.max(x1,x); y1=Math.max(y1,y); });
    const cx=(x0+x1)/2, cy=(y0+y1)/2, rx=(x1-x0)/2+0.5, ry=(y1-y0)/2+0.5;
    p.F(R[1]); p.poly(pts);
    CTX.save(); CTX.beginPath(); pts.forEach((q,i)=>i?CTX.lineTo(q[0],q[1]):CTX.moveTo(q[0],q[1])); CTX.closePath(); CTX.clip();
    shadeIn(p,R,Q,cx,cy,rx,ry,ang,hi,0); CTX.restore();
  }
  // contorno externo reforçado: 2 px nas bordas de baixo
  function heavyBase(cv){ const g=cv.getContext('2d'), W=cv.width, H=cv.height, im=PIX.pix(cv), d=im.data, O=[0x17,0x0b,0x1c];
    const isO=i=>d[i+3]===255&&d[i]===O[0]&&d[i+1]===O[1]&&d[i+2]===O[2];
    for(let y=H-1;y>=2;y--) for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(d[i+3]) continue; const a=((y-1)*W+x)*4, b=((y-2)*W+x)*4; if(isO(a)&&d[b+3]&&!isO(b)){ d[i]=O[0]; d[i+1]=O[1]; d[i+2]=O[2]; d[i+3]=255; } }
    g.putImageData(im,0,0); }

  function vein(p,M,pts,w=1.6){ p.F(M.vein[1]); band(p,pts,w); p.F(M.vein[0]); pts.forEach((q,k)=>{ if(k%2===0) p.rect(q.x-0.7,q.y-0.7,1.4,1.4); }); }
  // corrente: elos alternados (de frente com furo / de lado)
  function chain(p,M,pts,sz=1){
    let alt=0;
    for(let s=0;s<pts.length-1;s++){ const a=pts[s], b=pts[s+1], L=Math.hypot(b.x-a.x,b.y-a.y), n=Math.max(1,Math.round(L/(5*sz))), ang=Math.atan2(b.y-a.y,b.x-a.x);
      for(let k=0;k<n;k++){ const q=lerp(a,b,(k+0.5)/n);
        if(alt%2===0){ p.F(M.iron[1]); p.ell(q.x,q.y,3.4*sz,2.5*sz,ang); p.F(M.iron[3]); p.ell(q.x,q.y,1.5*sz,0.8*sz,ang); p.F(M.iron[0]); p.ell(q.x-0.6*sz,q.y-1.4*sz,1.2*sz,0.6*sz,ang); }
        else { p.F(M.iron[2]); p.ell(q.x,q.y,3.2*sz,1.2*sz,ang); }
        alt++; } }
  }

  /* ---------------- braço ---------------- */
  function drawUpper(p,M,sh,el,P,front){
    const {ang,L}=limb(p,sh,el), R=M.skin;
    p.F(R[2]); p.cap(P2(0,0),P2(L,0),34,27);
    mass(p,R,L*0.46,6,15,11,ang,0.8); mass(p,R,L*0.5,-6,17,13.5,ang); mass(p,R,1,0,23,21,ang);
    // separação deltoide / bíceps / tríceps
    p.F(R[3]); arc(p,1,0,22,20,60,130,1.6,4); p.cap(P2(L*0.3,1.5),P2(L*0.85,2),1.4,1.1); p.cap(P2(L*0.88,-7),P2(L*0.92,7),1.8,1.6);
    p.F(R[2]); arc(p,L*0.5,-6,16,13,195,250,1.2,4); arc(p,1,0,12,11,-60,10,1.2,4);
    // hematoma e ferida
    p.F(M.bruise[1]); p.ell(L*0.64,8,6,4); p.F(M.bruise[2]); p.ell(L*0.66,9,3,2);
    p.F(M.flesh[2]); p.ell(L*0.28,10,4.6,3.4); p.F(M.flesh[1]); p.ell(L*0.28,9.6,3.2,2.2); p.F(M.bone[0]); p.rect(L*0.28-1,9,2,1);
    vein(p,M,[P2(L*0.12,-10),P2(L*0.38,-16),P2(L*0.62,-14),P2(L*0.88,-10)]);
    vein(p,M,[P2(L*0.38,-16),P2(L*0.5,-7),P2(L*0.56,-2)],1.2);
    // trapo da manga rasgada pendurado
    p.F(M.shirt[2]); p.poly([[-6,12],[6,10],[10,20],[4,17],[1,26],[-3,18],[-8,22]]);
    p.F(M.shirt[1]); p.poly([[-6,12],[6,10],[7,14],[-6,15]]);
  }
  function drawFore(p,M,el,wr,P){
    const {ang,L}=limb(p,el,wr), R=M.skin;
    p.F(R[2]); p.cap(P2(0,0),P2(L,0),26,32);
    mass(p,R,L*0.52,6,13,9,ang,0.7); mass(p,R,L*0.36,-4,17,14,ang);
    p.F(R[3]); p.cap(P2(L*0.18,3.5),P2(L*0.78,5.5),1.5,1.3);
    p.F(R[2]); arc(p,L*0.36,-4,16,13,140,200,1.2,4);
    vein(p,M,[P2(L*0.06,-6),P2(L*0.3,-11),P2(L*0.55,-9),P2(L*0.8,-12)]);
    vein(p,M,[P2(L*0.3,-11),P2(L*0.45,-2),P2(L*0.6,5)],1.2);
    p.F(M.flesh[2]); p.ell(L*0.7,9,3.6,2.4); p.F(M.flesh[1]); p.rect(L*0.7-1.6,8,3,1.2);
    // corrente enrolada no antebraço
    for(let k=0;k<3;k++){ const x=L*0.6+k*5.5; chain(p,M,[P2(x-3,-18),P2(x+3,18)],0.85); }
  }
  function drawFist(p,M,wr,ang,P,front){
    p.xf(ang,wr.x,wr.y);
    p.F(M.skin[1]); p.ell(6,0,15,15);
    const R=M.concrete;
    facet(p,R,[[-2,-21],[14,-26],[30,-17],[36,0],[30,18],[12,24],[-4,16],[-9,-4]],14,-1,ang);
    p.F(R[3]); p.cap(P2(12,-23),P2(17,-6),1.3,1); p.cap(P2(17,-6),P2(13,9),1,1); p.cap(P2(17,-6),P2(30,-3),1,1); p.cap(P2(4,12),P2(-2,6),1,1);
    p.F(R[0]); p.rect(16,-8,2,1.4); p.rect(6,-18,3,1.4);
    p.F(R[2]); [[24,10],[8,0],[20,-14]].forEach(([x,y])=>p.rect(x,y,1.6,1.6));
    // vergalhões saindo do concreto
    p.F(M.rust[1]); p.cap(P2(18,-22),P2(25,-35),2.6,2.2); p.cap(P2(30,12),P2(43,17),2.4,2); p.cap(P2(-4,-14),P2(-10,-24),2.2,2);
    p.F(M.rust[0]); p.cap(P2(19,-23),P2(24,-33),0.9,0.8); p.F(M.rust[2]); [[21,-28],[36,14]].forEach(([x,y])=>p.rect(x,y,1.4,1.4));
    // nós dos dedos rasgando o concreto
    p.F(M.flesh[1]); [[34,-7],[35.5,-1],[34,5]].forEach(([x,y])=>p.ell(x,y,2.6,2.3));
    p.F(M.flesh[0]); [[34.5,-8],[36,-2],[34.5,4]].forEach(([x,y])=>p.rect(x,y,1,1));
    p.F(M.blood[1]); p.ell(30,8,2.4,1.4); p.ell(26,19,2,1.2);
  }
  function drawRock(p,M,wr,ang){
    // laje de concreto arrancada do chão, segura acima da mão
    p.id(); const dn=S(ang)>0.3, x=dn?wr.x+C(ang)*30:wr.x+6, y=dn?wr.y+S(ang)*30-6:wr.y-26;
    p.xf(-0.25,x,y); CTX.scale(1.22,1.22);
    facet(p,M.concrete,[[-26,-14],[-6,-24],[22,-20],[30,-2],[22,16],[-4,20],[-28,8]],0,-1,-0.25,0.38);
    p.F(M.concrete[3]); p.cap(P2(-6,-20),P2(0,-4),1.2,1); p.cap(P2(0,-4),P2(14,4),1,1); p.cap(P2(0,-4),P2(-10,10),1,1);
    p.F(M.rust[1]); p.cap(P2(18,-14),P2(30,-28),2.4,2); p.cap(P2(-20,6),P2(-34,12),2.4,2); p.cap(P2(4,16),P2(8,30),2.2,2);
    p.F(M.rust[0]); p.cap(P2(19,-15),P2(28,-26),0.8,0.8);
    p.F(M.pants[3]); p.rect(-14,12,10,2); // terra
    p.id();
  }

  /* ---------------- perna ---------------- */
  function drawLeg(p,M,hip,knee,ankle,fa,front){
    let t=limb(p,hip,knee); const R=M.pants;
    p.F(R[2]); p.cap(P2(0,0),P2(t.L,0),34,26); mass(p,R,t.L*0.42,-3,17,14,t.ang,0.6);
    p.F(R[1]); p.cap(P2(2,-4),P2(t.L*0.8,-5),20,14);
    // bolso cargo
    const px=t.L*0.3; p.F(R[3]); p.poly([[px-1,2],[px+14,1],[px+15,13],[px,14]]); p.F(R[2]); p.poly([[px,2],[px+13,1.4],[px+14,12],[px+1,13]]);
    p.F(R[1]); p.rect(px,0,13,3); p.F(R[0]); p.rect(px,0,13,1); p.F(M.steel[2]); p.rect(px+6,2.4,1.6,1.6);
    // dobras
    p.F(R[3]); band(p,[P2(t.L*0.76,-11),P2(t.L*0.84,-6),P2(t.L*0.79,-1)],1.3); band(p,[P2(t.L*0.6,-13),P2(t.L*0.67,-8)],1.2);
    p.F(R[0]); p.cap(P2(t.L*0.2,-11),P2(t.L*0.55,-12),1.4,1.2);
    t=limb(p,knee,ankle);
    p.F(R[2]); p.cap(P2(-2,0),P2(t.L,0),27,26); p.F(R[1]); p.cap(P2(0,-4),P2(t.L*0.7,-5),16,14);
    p.F(R[3]); band(p,[P2(t.L*0.55,-12),P2(t.L*0.62,-5),P2(t.L*0.56,3),P2(t.L*0.64,10)],1.3); band(p,[P2(t.L*0.3,8),P2(t.L*0.42,11)],1.2);
    p.F(R[0]); p.cap(P2(t.L*0.1,-11),P2(t.L*0.45,-11.5),1.2,1);
    if(front){ p.F(M.skin[2]); p.ell(2,-6,8,6.5); p.F(M.skin[1]); p.ell(3,-7,6,4.6); p.F(M.skin[3]); p.rect(0,-4,6,1.2); p.F(M.bruise[2]); p.ell(4,-8,2.6,1.6);
      p.F(R[3]); [[-5,-11],[0,-12.5],[6,-11],[9,-6],[-6,-1],[1,0.6]].forEach(([x,y])=>p.rect(x,y,2,1.4)); }
    // bota de bico de aço
    p.xf(rad(fa),ankle.x,ankle.y);
    p.F(M.boot[1]); p.poly([[-12,-16],[10,-16],[13,-6],[27,-3],[33,3],[33,10],[-15,10],[-16,-2]]);
    p.F(M.pants[1]); p.poly([[-14,-24],[12,-24],[13,-13],[6,-11],[0,-14],[-6,-11],[-15,-13]]);
    p.F(M.pants[2]); p.rect(-12,-14,24,1.6);
    p.F(M.boot[2]); p.poly([[-15,-2],[-6,-4],[-4,6],[-15,6]]);
    p.F(M.boot[0]); for(let k=0;k<4;k++) p.rect(9+k*4,-8+k*1.6,2.6,1.4);
    p.F(M.steel[1]); p.poly([[21,-2],[29,0],[33,5],[33,8],[21,8]]); p.F(M.steel[0]); p.rect(23,-0.5,5,1.4); p.F(M.steel[2]); p.rect(21,6,12,1.6);
    p.F(M.boot[3]); p.rect(-15,7,48,3.6); p.F(M.boot[2]); [-10,-2,6,14,22].forEach(x=>p.rect(x,8.2,3,1.2));
  }

  /* ---------------- tronco ---------------- */
  function drawPants(p,M,sk,P){
    p.xf(sk.a,sk.hip.x,sk.hip.y);
    p.F(M.pants[1]); p.poly([[-32,-12],[30,-12],[34,8],[16,18],[-14,18],[-34,8]]);
    p.F(M.pants[2]); p.rect(-4,-4,1.4,20); band(p,[P2(4,8),P2(12,12),P2(20,10)],1.2);
    // cinto e fivela
    p.F(M.boot[1]); p.poly([[-33,-14],[31,-14],[32,-5],[-34,-5]]);
    p.F(M.boot[0]); p.rect(-32,-14,62,1.3);
    p.F(M.boot[2]); [-24,-8,10].forEach(x=>p.rect(x,-15,3,11));
    p.F(M.steel[1]); p.rect(19,-16,12,13); p.F(M.boot[3]); p.rect(22,-13,6,7); p.F(M.steel[0]); p.rect(19,-16,12,1.6); p.F(M.steel[2]); p.rect(19,-4.6,12,1.6);
    // trapos da camisa pendurados no cinto
    p.F(M.shirt[1]); p.poly([[-30,-5],[-12,-5],[-14,4],[-18,0],[-22,10],[-26,2],[-31,6]]);
    p.F(M.shirt[2]); p.poly([[-22,10],[-26,2],[-31,6],[-30,-2]]);
    // chaveiro de corrente
    p.id(); chain(p,M,[sk.T(-26,-6),sk.T(-32,6),sk.T(-24,16),sk.T(-16,10)],0.8);
  }
  function drawTorso(p,M,sk,P){
    p.xf(sk.a,sk.hip.x,sk.hip.y);
    const b=P.breath*2, R=M.skin, A=sk.a;
    p.F(R[2]);
    p.poly([[-30,-6],[-36,-30],[-38,-60],[-32,-90],[-16,-106],[6,-106],[26,-98],[38,-82],[48,-66-b],[46,-44],[40,-24],[30,-8],[20,0]]);
    mass(p,R,-12,-56,24,30,A,0,0.62); mass(p,R,10,-24,31,24,A,0.7,0.7,1); mass(p,R,14,-62-b,36,27+b,A,1,0.72); mass(p,R,-8,-88,30,19,A,0.8,0.7);
    mass(p,R,32,-30,12,14,A,0.6,0.7);
    // placas: peitoral e abdômen
    mass(p,R,26,-62-b,20,13,A,1); [[20,-34],[31,-34],[20,-22],[31,-22],[21,-11],[31,-11]].forEach(([x,y])=>mass(p,R,x,y,6,5.4,A,0.6));
    mass(p,R,-14,-84,16,12,A,0.7);
    // definição muscular: peitoral, abdômen, serrátil, dorsal
    p.F(R[3]); arc(p,22,-58-b,23,15,10,150,1.8);
    p.F(R[2]);
    [[18,-36],[30,-36],[18,-24],[30,-24],[19,-12],[30,-13]].forEach(([x,y])=>{ p.rect(x-5,y+4,10,1.6); });
    p.rect(23.4,-40,1.5,32);
    p.F(R[0]); [[18,-36],[30,-36],[18,-24],[30,-24]].forEach(([x,y])=>p.rect(x-3,y-1,6,1.2));
    p.F(R[3]); [[-2,-44],[2,-38],[6,-32]].forEach(([x,y])=>p.cap(P2(x,y),P2(x+7,y-3),1.5,1.2));
    arc(p,-10,-60,23,31,110,200,1.5);
    // trapézio enorme
    p.F(R[3]); arc(p,-8,-88,29,18,190,320,1.5);
    p.F(R[3]); arc(p,14,-62-b,36,27,20,80,1.3,5);
    // manchas de podridão e cortes
    p.F(R[3]); [[-20,-46,3,2],[-14,-40,2,1.4],[-24,-36,2.4,1.6]].forEach(([x,y,rx,ry])=>p.ell(x,y,rx,ry));
    p.F(M.flesh[2]); p.cap(P2(-22,-54),P2(-10,-50),1.6,1); p.F(M.flesh[1]); p.rect(-18,-53.4,4,0.9);
    // hematomas
    p.F(M.bruise[2]); p.ell(4,-82,8,5); p.ell(36,-46,4,6); p.F(M.bruise[1]); p.ell(5,-83,5,2.6); p.ell(37,-47,2,3);
    // esporões de osso na corcunda/espinha
    [[-30,-88,-22],[-35,-72,-12],[-37,-56,-6],[-22,-102,-34],[-6,-108,-50]].forEach(([x,y,a])=>{
      p.F(M.flesh[3]); p.ell(x,y,5.4,3.6); p.F(M.flesh[1]); p.ell(x+0.6,y-0.6,3.4,2);
      const r=rad(a-90), q=[x+C(r)*10,y+S(r)*10];
      p.F(M.bone[2]); p.poly([[x-3.4,y+1],[x+3.4,y-1.4],q]); p.F(M.bone[1]); p.poly([[x,y],[x+3.4,y-1.4],q]); p.F(M.bone[0]); p.poly([[x+2,y-1],[x+3.4,y-1.4],[q[0]+0.4,q[1]]]); });
    // veias brilhando
    vein(p,M,[P2(-2,-96),P2(10,-86),P2(14,-74),P2(26,-66),P2(36,-62)]);
    vein(p,M,[P2(14,-74),P2(6,-64),P2(8,-50)],1.3);
    vein(p,M,[P2(-26,-80),P2(-18,-68),P2(-24,-56)],1.3);
    vein(p,M,[P2(30,-50),P2(26,-40),P2(34,-30)],1.2);
    // pontos de sutura grosseiros
    p.F(M.flesh[2]); p.cap(P2(-24,-30),P2(-8,-22),1.2,1.2); p.F(M.bone[2]); [-22,-18,-14,-10].forEach((x,k)=>p.rect(x,-31+k*2,0.9,3));
  }
  function drawShirt(p,M,sk,P){
    // gola e retalhos da camisa explodida
    p.xf(sk.a,sk.hip.x,sk.hip.y);
    p.F(M.shirt[1]); p.poly([[14,-100],[30,-94],[40,-82],[36,-78],[28,-88],[16,-92],[4,-98]]);
    p.poly([[-30,-92],[-16,-102],[-8,-100],[-14,-90],[-20,-80],[-24,-84],[-30,-74],[-34,-84]]);
    p.F(M.shirt[2]); p.poly([[-30,-92],[-24,-84],[-30,-74],[-34,-84]]); p.rect(16,-93,14,1.4);
    p.F(M.shirt[0]); p.rect(16,-99,12,1.3);
    p.F(M.hivis[1]); p.poly([[-26,-96],[-20,-100],[-16,-86],[-22,-82]]); p.F(M.hivis[0]); p.rect(-24,-96,1.4,8);
    // barra da camisa rasgada presa na cintura
    p.F(M.shirt[2]); p.poly([[-31,-6],[-10,-8],[-12,4],[-16,0],[-19,12],[-23,2],[-28,9],[-32,0]]);
    p.F(M.shirt[1]); p.poly([[-31,-6],[-10,-8],[-11,-2],[-30,-1]]);
    p.F(M.shirt[2]); p.poly([[8,-8],[26,-8],[24,0],[20,-3],[16,6],[12,-2]]);
    p.F(M.shirt[1]); p.poly([[8,-8],[26,-8],[25,-4],[9,-4]]);
    p.F(M.hivis[1]); p.rect(-30,-5,18,1.6); p.F(M.hivis[0]); p.rect(-28,-5,6,1);
  }
  function drawChestChain(p,M,sk,P){
    p.id(); const sw=P.sw*2;
    chain(p,M,[sk.T(30,-90),sk.T(26,-70),sk.T(12,-46),sk.T(-8,-26),sk.T(-30,-10)],1);
  }
  function drawNeckChain(p,M,sk,P){
    p.id(); const sw=P.sw*2.5;
    const a=sk.T(22,-96), b=sk.T(44+sw*0.3,-80+Math.abs(sw)*0.2), c=sk.T(40,-70);
    chain(p,M,[a,b],0.9);
    // cadeado
    const L=lp(b,0+sw*4,6); p.F(M.steel[2]); p.ell(L.x,L.y-3,3.4,3.6); p.F(M.boot[3]); p.ell(L.x,L.y-3,1.8,2);
    p.F(M.steel[1]); p.rect(L.x-5,L.y,10,9); p.F(M.steel[0]); p.rect(L.x-5,L.y,10,1.6); p.F(M.steel[3]); p.rect(L.x-0.7,L.y+3,1.4,3);
    p.F(M.rust[1]); p.rect(L.x+2,L.y+6,3,2);
  }

  /* ---------------- cabeça ---------------- */
  function drawHead(p,M,sk,P,form){
    p.xf(sk.ha,sk.neck.x,sk.neck.y); CTX.scale(1.32,1.32);
    const j=Math.max(0,P.jaw), jr=rad(j*1.1), hx=2, hy=-4;
    const R=(pts)=>pts.map(([x,y])=>{ const dx=x-hx, dy=y-hy; return [hx+dx*C(jr)-dy*S(jr), hy+dx*S(jr)+dy*C(jr)]; });
    // pescoço grosso
    p.F(M.skin[2]); p.ell(-2,2,16,13); p.F(M.skin[1]); p.ell(1,-1,12,9);
    // boca aberta (interior)
    p.F(M.mouth[1]); p.poly([[6,-4],[28,-6],...R([[28,-1],[6,0]])]);
    p.F(M.mouth[3]); p.poly([[10,-3],[24,-4],...R([[24,-1],[10,-1]])]);
    if(j>8){ p.F(M.flesh[2]); const q=R([[14,0]])[0]; p.ell(q[0],q[1]-1,5,1.8); }
    // mandíbula com presas (underbite)
    p.F(M.skin[1]); p.poly(R([[-2,-4],[24,-4],[30,-1],[29,8],[20,13],[2,11]]));
    p.F(M.skin[2]); p.poly(R([[4,9],[20,11],[28,7],[29,8],[20,13],[2,11]]));
    p.F(M.skin[0]); { const q=R([[14,-3]])[0]; p.rect(q[0]-6,q[1],10,1.2); }
    p.F(M.teeth[1]); R([[27,-3],[21,-3]]).forEach(([x,y],k)=>p.poly([[x-2,y+1],[x+2,y+1],[x+(k?0:0.6),y-(k?6:8)]]));
    p.F(M.teeth[0]); R([[27,-3]]).forEach(([x,y])=>p.rect(x,y-6,0.9,4));
    p.F(M.teeth[2]); R([[14,-3],[17,-3]]).forEach(([x,y])=>p.rect(x,y-2,2,2.4));
    // crânio
    p.F(M.skin[2]); p.ell(8,-14,15,11.5); p.poly([[0,-8],[26,-10],[30,-5],[28,-2],[4,-2]]);
    mass(p,M.skin,10,-14,13,10,sk.ha,0.6);
    // dentes de cima
    p.F(M.teeth[1]); [9,12.4,15.8,19.2,22.6].forEach((x,k)=>p.rect(x,-3,2.4,k%2?2.6:3.2));
    // arcada da testa pesada
    p.F(M.skin[1]); p.poly([[6,-20],[22,-19],[29,-13],[28,-9],[8,-10]]);
    p.F(M.skin[0]); p.rect(10,-20,15,1.5); p.ell(4,-24,7,2);
    p.F(M.skin[2]); p.cap(P2(12,-9.4),P2(28,-8.6),1.4,1.2);
    // olhos fundos brilhando
    const glow=1-P.dead;
    p.F(M.skin[3]); p.ell(21,-7.6,4.6,2.8); p.ell(27.6,-7.6,2,2.2);
    if(glow>0.3){ p.F(M.eye[1]); p.ell(21.6,-7.6,2.8,1.7); p.F(M.eye[0]); p.rect(21.6,-8.3,1.6,1.3); p.F(M.eye[1]); p.rect(27,-8.2,1.4,1.4);
      if(P.roar>0.5||form==='furia'){ p.F(M.eye[2]); p.rect(16,-8.4,3,1.2); } }
    // nariz amassado
    p.F(M.skin[1]); p.poly([[27,-8],[32,-5],[31,-2],[27,-3]]); p.F(M.skin[3]); p.rect(28.6,-3.4,2,1);
    // orelha rasgada
    p.F(M.skin[1]); p.ell(-2,-9,4.4,5.4); p.F(M.flesh[2]); p.ell(-2,-8.6,2,2.6); p.F(M.skin[3]); p.rect(-6,-5,3,1.2);
    // cicatriz costurada no crânio
    p.F(M.flesh[2]); p.cap(P2(-2,-20),P2(16,-25),1.3,1.3);
    p.F(M.bone[2]); [0,4,8,12].forEach((x,k)=>p.rect(x,-23.6-k*1.1,0.9,3.2));
    // esporões no crânio
    p.F(M.bone[1]); p.poly([[2,-23],[7,-25],[1,-33]]); p.poly([[-6,-18],[-2,-21],[-11,-26]]); p.F(M.bone[0]); p.rect(2.4,-27,1,3);
    // veias na têmpora
    vein(p,M,[P2(4,-14),P2(10,-18),P2(14,-15)],1.1);
    if(P.roar>0.5){ p.F(M.mouth[0]); const q=R([[18,-2]])[0]; p.rect(q[0],q[1],2,1); }
  }

  /* ---------------- FX ---------------- */
  function drawStars(p,M,sk,P){
    p.id(); const c=sk.H(8,-30);
    for(let k=0;k<3;k++){ const a=(P.dz+k/3)*PI*2, x=c.x+C(a)*22, y=c.y+S(a)*6-2; const s=S(a)>0?1:0.7;
      p.F(M.fx[2]); p.poly([[x,y-5*s],[x+1.6,y-1.6],[x+5*s,y],[x+1.6,y+1.6],[x,y+5*s],[x-1.6,y+1.6],[x-5*s,y],[x-1.6,y-1.6]]);
      p.F(M.fx[0]); p.rect(x-1,y-1,2,2); }
  }
  function drawImpact(p,M,x){
    p.id(); const g=GROUND;
    p.F(M.dust[1]); [[-26,-6,12,7],[24,-7,13,8],[-8,-12,10,8],[12,-14,9,7],[0,-4,22,6]].forEach(([dx,dy,rx,ry])=>p.ell(x+dx,g+dy,rx,ry));
    p.F(M.dust[0]); [[-24,-9,6,3],[22,-11,6,3],[-6,-16,5,3]].forEach(([dx,dy,rx,ry])=>p.ell(x+dx,g+dy,rx,ry));
    p.F(M.concrete[2]); [[-34,-26],[30,-30],[-14,-36],[16,-22],[40,-14],[-42,-12]].forEach(([dx,dy],k)=>{ const s=2+(k%3); p.poly([[x+dx-s,g+dy],[x+dx,g+dy-s],[x+dx+s,g+dy+s*0.4],[x+dx,g+dy+s]]); });
    p.F(M.fx[1]); [[-40,-4,-56,-2],[40,-4,58,-1],[-20,-14,-30,-26],[22,-16,32,-28]].forEach(([a,b,c,d])=>p.cap(P2(x+a,g+b),P2(x+c,g+d),2,0.6));
  }
  function drawClash(p,M,at){
    p.id(); p.F(M.fx[1]);
    for(let k=0;k<8;k++){ const a=k/8*PI*2+0.2, r=k%2?16:26; p.poly([[at.x+C(a)*r,at.y+S(a)*r],[at.x+C(a+0.35)*5,at.y+S(a+0.35)*5],[at.x+C(a-0.35)*5,at.y+S(a-0.35)*5]]); }
    p.F(M.fx[0]); p.circle(at,6);
  }
  function drawSmear(p,M,sk){
    p.id(); const s=sk.shF, pts=[]; const r1=86, r0=60, a0=200, a1=96;
    for(let k=0;k<=12;k++){ const a=rad(a0+(a1-a0)*k/12); pts.push([s.x+S(a)*r1, s.y+C(a)*r1]); }
    for(let k=12;k>=0;k--){ const a=rad(a0+(a1-a0)*k/12), rr=r0+(r1-r0)*(1-k/12)*0.7; pts.push([s.x+S(a)*rr, s.y+C(a)*rr]); }
    p.F(M.fx[0]); p.poly(pts);
  }
  function drawDust(p,M,sk){
    p.id(); const f=sk.ankleB, g=GROUND;
    p.F(M.dust[1]); p.ell(f.x-24,g-6,10,6); p.ell(f.x-40,g-9,8,5); p.F(M.dust[0]); p.ell(f.x-22,g-9,5,3); p.F(M.dust[2]); p.ell(f.x-52,g-6,5,3.4);
    p.F(M.fx[0]); [[-60,-40],[-70,-70],[-56,-100]].forEach(([dx,dy])=>p.rect(sk.hip.x+dx,sk.hip.y+dy,20,1.6));
  }

  /* ---------------- frame ---------------- */
  const cache=PIX.cache();
  function frame(form,anim,fi,step=5,Pov,pk){
    const K=PIX.getK(), key=(pk!=null?'#'+pk+'|'+form:form+anim+fi+step)+'@'+K; if(cache.has(key)) return cache.get(key);
    const P=Pov||poseOf(anim,fi), M=mats(form), sk=skeleton(P); QM=M;
    const angF=Math.atan2(sk.wrF.y-sk.elF.y,sk.wrF.x-sk.elF.x), angB=Math.atan2(sk.wrB.y-sk.elB.y,sk.wrB.x-sk.elB.x);
    const parts=[];
    const add=(o,fn)=>parts.push(Object.assign(o,{draw:(c,u)=>{ CTX=c; fn(mkPen(c,u)); }}));
    if(P.run>0.5) add({noShade:true,noRim:true,smear:true},p=>drawDust(p,M,sk));
    add({back:true},p=>drawUpper(p,M,sk.shB,sk.elB,P,false));
    add({back:true},p=>drawFore(p,M,sk.elB,sk.wrB,P));
    add({back:true},p=>drawFist(p,M,sk.wrB,angB,P,false));
    add({back:true},p=>drawLeg(p,M,sk.hipB,sk.kneeB,sk.ankleB,P.fB,false));
    add({},p=>drawPants(p,M,sk,P));
    add({},p=>drawLeg(p,M,sk.hipF,sk.kneeF,sk.ankleF,P.fF,true));
    add({},p=>drawTorso(p,M,sk,P));
    add({},p=>drawShirt(p,M,sk,P));
    add({},p=>drawChestChain(p,M,sk,P));
    if(P.smear) add({noShade:true,smear:true,noRim:true},p=>drawSmear(p,M,sk));
    if(P.rock>0.5) add({},p=>drawRock(p,M,sk.wrF,angF));
    add({},p=>drawUpper(p,M,sk.shF,sk.elF,P,true));
    add({},p=>drawHead(p,M,sk,P,form));
    add({},p=>drawNeckChain(p,M,sk,P));
    add({},p=>drawFore(p,M,sk.elF,sk.wrF,P));
    add({},p=>drawFist(p,M,sk.wrF,angF,P,true));
    if(P.impact){ const fx=anim==='death'?sk.T(40,-60).x:lp(sk.wrF,P.aFe,20).x; add({noShade:true,noRim:true,smear:true},p=>drawImpact(p,M,fx)); }
    if(P.clash){ const at=lerp(lp(sk.wrF,P.aFe,26),lp(sk.wrB,P.aBe,26),0.5); add({noShade:true,noRim:true},p=>drawClash(p,M,at)); }
    if(P.dazed>0.5) add({noShade:true,noRim:true},p=>drawStars(p,M,sk,P));
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM[form]});
    if(step>=4 && !P.flash) heavyBase(cv);
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._eye=sc(sk.eye); cv._mouth=sc(sk.mouth); cv._fist=sc(lp(sk.wrF,P.aFe,18)); cv._back=sc(sk.T(-30,-60)); cv._head=sc(sk.H(6,-26));
    cache.set(key,cv); return cv;
  }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame,framePose:function(form,anim,P,key){ if(cache.size>1400) cache.delete(cache.keys().next().value); return frame(form,anim,0,5,P,key); }};
})();
