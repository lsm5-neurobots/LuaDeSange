/* CHORONA — fonte de arte (editável). Build: npm run art
   Mini boss de Olinda "A Chorona": viúva de luto que vaga pelas ladeiras do casario chorando os mortos da Lua de Sangue.
   Vestido de luto colonial (corpete de botões, mangas-sino rasgadas, saia longa em farrapos que esconde os pés — ela flutua),
   mantilha de renda sobre a peineta, barrado bordado em padrão de azulejo (o casario de Olinda), terço partido, rosas murchas,
   rosto pálido com lágrimas escuras e olhos brilhando, unhas longas.
   Fúria: véu rasgado, boca escancarada, aura carmim, lágrimas de sangue brilhando. */
const CHORONA=(function(){
  const {rad,lp,lerp,P2,mkPen,compose}=PIX;
  const FW=320, FH=250, GROUND=240, AX=150;
  const RIM={normal:'#cdd6ff', furia:'#ff8c7c'};
  const HOV=8, SKL=74, UPA=27, FOA=25, HS=1.2;

  /* ---- cor: saturação +15% e rampas intermediárias (padrão dos chefes) ---- */
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
      skin:['#dcdcea','#a2a2c0','#686890','#363660'],
      hair:['#7c7aa8','#45436e','#2a2848','#1a1830'],
      dress:['#a490d4','#634e94','#3c2e66','#241b42'],
      dress2:['#ae9ade','#6e5aa2','#463672','#2a1f4c'],
      lace:['#a4a8dc','#4e5288','#2e3060','#1c1c3c'],
      silver:['#ffffff','#c8cce2','#8a8eae','#4a4c6e'],
      ivory:['#fff8e8','#e2d6bc','#a89a84','#665c56'],
      bead:['#fffaf0','#d8ccc0','#9a8c90','#5a4e5c'],
      comb:['#b07c5c','#6e4232','#46261e','#2a1416'],
      flower:['#e6a8b0','#a8607a','#6e3a5c','#3e2240'],
      leaf:['#cabd84','#8c7c4c','#5a5038','#302c26'],
      nail:['#fff2d6','#d2bf98','#968062','#5a4a3c'],
      mouth:['#7a3054','#46143a','#2a0a24','#160414'],
      teeth:['#faf2e2','#d4c8ac','#988c76','#5c5248'],
      dirt:['#8e7e6c','#5c4e46','#3c3232','#241e22'],
      zskin:['#c8d690','#8c9a62','#5a6248','#32363a'],
      blood:['#c43a48','#8a1c32','#5a1026','#340818'],
      tile:['#ffffff','#d4e2ff','#4c7ad6','#24387e'],
      tear:['#d6ccff','#3a2462','#22123e','#10081e'],
      eye:['#ffffff','#c4fbff','#58dcff','#287aa8'],
      mist:['#eeeaff','#bab4e2','#827cb6','#524c86'],
      aura:['#ffd0a8','#ff5a4a','#d01e3e','#7a0c2e'],
      core:['#fffaf2','#ffeccc','#ffc890','#ff9a6a'],
      fx:['#ffffff','#dfeeff','#9cbcff','#6070d0'],
    };
    if(form==='furia'){
      m.skin=['#e6c8d0','#a87a92','#6c4468','#3a2040'];
      m.hair=['#9a6c8e','#58365a','#36203e','#1e1028'];
      m.dress=['#a4648e','#683458','#421e40','#270f28'];
      m.dress2=['#b4749e','#7a4068','#4e244a','#2e122e'];
      m.lace=['#d8a0c0','#7a3e6c','#4a2448','#2a1230'];
      m.tear=['#ffd0b0','#ff3a3a','#b0101e','#5a0612'];
      m.eye=['#ffffff','#ffd2b8','#ff4636','#a01020'];
      m.mist=['#ffe4e4','#dcaac2','#a06e98','#62406c'];
      m.fx=['#fffef0','#ffd6b0','#ff6a4a','#c42838'];
      m.blood=['#ff5a4a','#c42a36','#7a1424','#4a0a18'];
    }
    return finish(m,['tile','tear','eye','mist','aura','core','fx']);
  }
  const NAMES={skin:'Pele de defunta',hair:'Cabelo longo',dress:'Vestido de luto',dress2:'Anágua em farrapos',lace:'Mantilha de renda',
    silver:'Botões e crucifixo',ivory:'Camafeu',bead:'Contas do terço',comb:'Peineta',flower:'Rosas murchas',leaf:'Folhas secas',
    nail:'Unhas longas',tile:'Barrado de azulejo',tear:'Lágrimas',eye:'Olhos',mist:'Névoa',aura:'Aura carmim',blood:'Sangue'};

  /* ---------------- poses ---------------- */
  const REST={hx:0,fl:0,lean:10,head:12,jaw:3,aFs:18,aFe:50,aBs:-4,aBe:22,curl:0.3,ph:0,trail:0,flare:0,hb:0.15,vb:0.1,
    scream:0,flash:0,smear:0,sum:0,hands:0,fade:1,dis:0,veilFall:0,dashFx:0,warn:0,rage:0,col:0,eyes:0,mistUp:0};
  const S=Math.sin, C=Math.cos, PI=Math.PI;
  const FACE={aFs:62,aFe:-150,aBs:44,aBe:-136,curl:0.7};             // mãos no rosto (chorando)
  const UP={aFs:150,aFe:170,aBs:-150,aBe:-170,curl:1};               // braços erguidos
  const SCR={aFs:-58,aFe:-34,aBs:-72,aBe:-46,curl:1};                // braços jogados pra trás (grito)
  const o=(...a)=>Object.assign({},...a);
  const DASH=k=>({lean:62,head:-34,jaw:30,aFs:96+(k%2?5:-3),aFe:92,aBs:82,aBe:86,curl:0.9,fl:6+(k%2?2:-1),trail:1,hb:1.7,vb:1.6,dashFx:1,hx:24,ph:2+k*0.8});
  const ANIMS={
    idle:{nome:'Parada (flutuando, chorando)',n:8,dur:()=>150,pose:i=>{ const p=i/8*PI*2;
      return {ph:p, fl:4+3*S(p), lean:11+1.5*S(p-0.5), head:12+3*S(p-1), aFs:18+4*S(p-0.6), aFe:48+6*S(p-1.2), aBs:-4+3*S(p+0.3), aBe:20+5*S(p-0.4),
        hb:0.15+0.1*S(p), vb:0.12+0.1*S(p-0.7), trail:0.1+0.05*S(p), jaw:3+1.5*S(p)}; }},
    walk:{nome:'Deslizar',n:8,dur:()=>120,pose:i=>{ const p=i/8*PI*2;
      return {ph:2*p, fl:3+2.5*S(2*p), lean:14+2*S(2*p), head:4, trail:0.24+0.05*S(2*p), hb:0.6+0.15*S(2*p), vb:0.5+0.1*S(2*p),
        aFs:2+8*S(p), aFe:28+6*S(p), aBs:-18-8*S(p), aBe:4, flare:-0.1}; }},
    wail:{nome:'Lamento (grito em cone, atordoa)',n:10,screamAt:4,dur:i=>[200,220,160,160,90,140,140,160,180,200][i],pose:i=>[
      o(FACE,{lean:10,head:22,jaw:4,fl:2,ph:0}),
      o(FACE,{lean:14,head:26,jaw:6,fl:0,ph:0.6,hx:-1,curl:0.8}),
      {lean:-10,head:-18,jaw:14,aFs:-30,aFe:-10,aBs:-50,aBe:-30,fl:6,ph:1.2,hb:0.5,vb:0.4,flare:0.2},
      {lean:-18,head:-24,jaw:26,aFs:-50,aFe:-30,aBs:-70,aBe:-50,fl:8,ph:1.8,hb:0.6,flare:0.3,warn:1,curl:0.8},
      o(SCR,{lean:24,head:-10,jaw:48,fl:4,ph:2.4,hb:1.5,vb:1.4,flare:0.6,trail:0.35,scream:1,hx:2}),
      o(SCR,{lean:24,head:-10,jaw:50,fl:4,ph:3.0,hb:1.5,vb:1.4,flare:0.6,trail:0.35,scream:2,hx:-1}),
      o(SCR,{lean:24,head:-10,jaw:48,fl:4,ph:3.6,hb:1.4,vb:1.3,flare:0.6,trail:0.35,scream:3,hx:1}),
      o(SCR,{lean:20,head:-8,jaw:40,fl:4,ph:4.2,hb:1.1,vb:1.0,flare:0.5,trail:0.3,scream:4}),
      {lean:10,head:4,jaw:16,aFs:-10,aFe:10,aBs:-20,aBe:0,hb:0.5,ph:4.8,trail:0.1,fl:3},
      {lean:6,head:8,jaw:6,aFs:12,aFe:40,aBs:-6,aBe:18,ph:5.4,fl:3}][i]},
    dash:{nome:'Avanço fantasma',n:8,warn:[0,1,2],run:[3,4,5,6],dur:i=>[220,200,160,80,80,80,80,200][i],pose:i=>[
      {lean:-8,head:-6,jaw:20,aFs:120,aFe:150,aBs:100,aBe:150,curl:1,fl:6,warn:1,flare:0.3,hb:0.3,ph:0.5},
      {lean:-16,head:-10,jaw:30,aFs:140,aFe:170,aBs:120,aBe:170,curl:1,fl:2,warn:2,flare:0.4,hx:-6,ph:1.0},
      {lean:34,head:-20,jaw:24,aFs:-60,aFe:-40,aBs:-80,aBe:-60,curl:1,fl:-2,warn:3,hx:-10,ph:1.5,trail:0.2,hb:0.6},
      DASH(0),DASH(1),DASH(2),DASH(3),
      {lean:22,head:-4,jaw:10,aFs:50,aFe:60,aBs:30,aBe:40,trail:0.45,hb:0.8,vb:0.7,hx:12,ph:5.2}][i]},
    claw:{nome:'Arranhão',n:8,hit:4,dur:i=>[140,160,200,70,80,140,160,160][i],pose:i=>[
      {lean:4,head:4,jaw:8,aFs:30,aFe:70,ph:0,curl:0.6},
      {lean:-10,head:-8,jaw:16,aFs:190,aFe:200,curl:1,aBs:40,aBe:80,hx:-4,fl:4,ph:0.6},
      {lean:-14,head:-10,jaw:22,aFs:200,aFe:215,curl:1,aBs:50,aBe:90,hx:-6,fl:6,ph:1.2,warn:1},
      {lean:24,head:-6,jaw:30,aFs:130,aFe:110,curl:1,aBs:-30,aBe:-10,hx:6,ph:1.8,smear:1,trail:0.2},
      {lean:36,head:-8,jaw:34,aFs:70,aFe:50,curl:1,aBs:-50,aBe:-30,hx:10,ph:2.4,smear:2,trail:0.3,hb:0.8},
      {lean:38,head:-2,jaw:20,aFs:30,aFe:14,curl:0.8,aBs:-50,aBe:-30,hx:10,ph:3.0,trail:0.25,hb:0.6},
      {lean:20,head:4,jaw:10,aFs:24,aFe:40,aBs:-20,aBe:0,hx:6,ph:3.6},
      {lean:8,head:8,jaw:4,aFs:18,aFe:48,hx:2,ph:4.2}][i]},
    summon:{nome:'Chamar os mortos',n:10,callAt:6,dur:i=>[180,200,200,200,160,90,120,140,180,220][i],pose:i=>[
      {lean:0,head:-4,jaw:6,aFs:60,aFe:90,aBs:40,aBe:70,fl:6,ph:0,sum:0.15},
      o(UP,{lean:-8,head:-20,jaw:14,aFs:130,aFe:160,aBs:-130,aBe:-160,fl:12,ph:0.6,sum:0.35,hb:0.4,flare:0.3}),
      o(UP,{lean:-12,head:-26,jaw:22,fl:16,ph:1.2,sum:0.6,hb:0.5,flare:0.4}),
      o(UP,{lean:-12,head:-26,jaw:26,fl:18,ph:1.8,sum:0.8,hb:0.5,flare:0.4,hx:1}),
      o(UP,{lean:-12,head:-28,jaw:30,fl:18,ph:2.4,sum:1,hb:0.6,flare:0.4,hx:-1}),
      {lean:22,head:6,jaw:36,aFs:50,aFe:20,aBs:30,aBe:10,fl:2,ph:3.0,sum:1,curl:0.2,flare:0.6,hb:0.3},
      {lean:26,head:10,jaw:30,aFs:40,aFe:12,aBs:24,aBe:4,fl:0,ph:3.6,sum:1,hands:0.45,flare:0.5,curl:0.2},
      {lean:22,head:4,jaw:20,aFs:40,aFe:20,aBs:20,aBe:10,fl:1,ph:4.2,sum:0.8,hands:0.8,flare:0.3},
      {lean:14,head:2,jaw:12,aFs:30,aFe:40,aBs:4,aBe:20,fl:2,ph:4.8,sum:0.5,hands:1},
      {lean:8,head:6,jaw:6,aFs:20,aFe:46,fl:3,ph:5.4,sum:0.2,hands:0.7}][i]},
    rage:{nome:'Fúria (lamento de sangue)',n:8,dur:i=>[180,160,160,120,140,140,160,220][i],pose:i=>[
      o(FACE,{lean:16,head:26,jaw:6,fl:0,ph:0}),
      o(FACE,{lean:18,head:30,jaw:8,ph:0.7,hx:-2,rage:0.3}),
      {lean:-14,head:-26,jaw:30,aFs:-40,aFe:-20,aBs:-60,aBe:-40,fl:8,ph:1.4,rage:0.6,hb:0.8,vb:0.6},
      {lean:-6,head:-30,jaw:50,aFs:110,aFe:140,aBs:-110,aBe:-140,curl:1,fl:12,ph:2.1,rage:1,hb:1.6,vb:1.2,flare:0.7,scream:1},
      {lean:-6,head:-30,jaw:52,aFs:112,aFe:142,aBs:-112,aBe:-142,curl:1,fl:12,ph:2.8,rage:1,hb:1.6,vb:1.2,flare:0.7,scream:2,hx:2},
      {lean:-6,head:-30,jaw:52,aFs:110,aFe:140,aBs:-110,aBe:-140,curl:1,fl:12,ph:3.5,rage:1,hb:1.6,vb:1.2,flare:0.7,scream:3,hx:-2},
      {lean:-4,head:-26,jaw:44,aFs:100,aFe:130,aBs:-100,aBe:-130,curl:1,fl:10,ph:4.2,rage:1,hb:1.3,vb:1.0,flare:0.6,scream:4},
      {lean:10,head:2,jaw:14,aFs:24,aFe:50,aBs:-8,aBe:20,fl:4,ph:4.9,rage:0.4,hb:0.4}][i]},
    hurt:{nome:'Dano',n:4,dur:i=>[80,110,130,160][i],pose:i=>[
      {lean:-16,head:-24,jaw:24,hx:-8,flash:1,aFs:-30,aFe:-10,aBs:-40,aBe:-20,trail:-0.25,ph:0.4,hb:-0.2},
      {lean:-12,head:-18,jaw:18,hx:-7,aFs:-20,aFe:0,aBs:-30,aBe:-10,trail:-0.2,ph:0.8},
      {lean:-2,head:-4,jaw:10,hx:-3,aFs:4,aFe:30,ph:1.2,trail:-0.1},
      {ph:1.6}][i]},
    intro:{nome:'Entrada (WARNING)',n:10,dur:i=>[220,200,240,180,180,200,240,200,160,520][i],pose:i=>[
      {fade:0,col:0.25,ph:0},
      {fade:0,col:0.6,ph:0.6},
      {fade:0,col:1,eyes:1,ph:1.2},
      o(FACE,{fade:0.35,col:0.9,eyes:1,lean:10,head:24,ph:1.8}),
      o(FACE,{fade:0.7,col:0.6,eyes:1,lean:10,head:24,ph:2.4}),
      o(FACE,{fade:1,col:0.3,lean:12,head:26,ph:3.0}),
      o(FACE,{col:0.1,lean:12,head:22,ph:3.6,jaw:6}),
      {lean:-10,head:-14,jaw:14,aFs:-30,aFe:-10,aBs:-50,aBe:-30,fl:6,ph:4.2,hb:0.5,flare:0.2},
      o(SCR,{lean:20,head:-10,jaw:46,fl:6,ph:4.8,hb:1.4,vb:1.3,scream:2,trail:0.3,flare:0.5}),
      o(SCR,{lean:20,head:-10,jaw:48,fl:6,ph:5.4,hb:1.4,vb:1.3,scream:3,trail:0.3,flare:0.5})][i]},
    death:{nome:'Morte (desfaz em véu e névoa)',n:12,dur:i=>[90,160,180,200,200,200,200,200,220,260,300,600][i],pose:i=>[
      {flash:1,lean:-16,head:-26,jaw:30,hx:-6,aFs:-30,aFe:-10,aBs:-40,aBe:-20,ph:0,trail:-0.2},
      o(UP,{lean:-20,head:-34,jaw:52,aFs:120,aFe:150,aBs:-120,aBe:-150,fl:10,ph:0.6,scream:1,hb:0.9,vb:0.8}),
      o(UP,{lean:-10,head:-30,jaw:50,aFs:124,aFe:154,aBs:-124,aBe:-154,fl:14,ph:1.2,scream:2,hb:0.9,vb:0.8,dis:0.12}),
      o(FACE,{lean:14,head:20,jaw:20,fl:8,ph:1.8,dis:0.28,mistUp:0.2}),
      o(FACE,{lean:16,head:24,jaw:16,fl:6,ph:2.4,dis:0.45,mistUp:0.35}),
      o(FACE,{lean:20,head:30,jaw:14,fl:4,ph:3.0,dis:0.62,mistUp:0.5}),
      o(FACE,{lean:22,head:30,jaw:14,fl:3,ph:3.6,dis:0.8,veilFall:0.15,mistUp:0.7}),
      o(FACE,{lean:22,head:30,jaw:14,fl:2,ph:4.2,dis:0.98,veilFall:0.45,mistUp:0.9}),
      o(FACE,{lean:22,head:30,fl:2,ph:4.8,dis:1.25,veilFall:0.75,mistUp:1}),
      {ph:5.4,dis:2,veilFall:1,mistUp:0.8},
      {ph:6.0,dis:2,veilFall:1,mistUp:0.45},
      {ph:6.6,dis:2,veilFall:1,mistUp:0.15}][i]},
  };
  function poseOf(anim,i){ return Object.assign({},REST,ANIMS[anim].pose(i)); }

  /* ---------------- esqueleto ---------------- */
  function skeleton(P){
    const W={x:AX+P.hx, y:GROUND-HOV-SKL-P.fl};
    const a=rad(P.lean), c=C(a), s=S(a);
    const T=(lx,ly)=>({x:W.x+lx*c-ly*s, y:W.y+lx*s+ly*c});
    const neck=T(3,-40), shF=T(6,-33), shB=T(-5,-35);
    const ha=rad(P.lean*0.4+P.head), hc=C(ha), hs=S(ha);
    const H=(lx,ly)=>({x:neck.x+(lx*hc-ly*hs)*HS, y:neck.y+(lx*hs+ly*hc)*HS});
    const elF=lp(shF,P.aFs,UPA), wrF=lp(elF,P.aFe,FOA), elB=lp(shB,P.aBs,UPA), wrB=lp(elB,P.aBe,FOA);
    return {W,T,a,neck,shF,shB,ha,H,elF,wrF,elB,wrB,eye:H(11,-13),mouth:H(13,-5)};
  }

  /* ---------------- utilidades de desenho ---------------- */
  const LIGHT={x:0.6,y:-0.8};
  const hs=k=>{ const v=S(k*12.9898+3.1)*43758.5453; return v-Math.floor(v); };
  const A2=q=>[q.x,q.y];
  function limb(p,a,b){ const ang=Math.atan2(b.y-a.y,b.x-a.x); p.xf(ang,a.x,a.y); return {ang,L:Math.hypot(b.x-a.x,b.y-a.y)}; }
  function band(p,pts,w){ for(let k=0;k<pts.length-1;k++) p.cap(pts[k],pts[k+1],w,w); }
  function taper(p,pts,w0,w1){ const n=pts.length-1; for(let k=0;k<n;k++) p.cap(pts[k],pts[k+1],w0+(w1-w0)*k/n,w0+(w1-w0)*(k+1)/n); }
  function arc(p,cx,cy,rx,ry,a0,a1,w,n=8){ const pts=[]; for(let k=0;k<=n;k++){ const t=rad(a0+(a1-a0)*k/n); pts.push(P2(cx+C(t)*rx,cy+S(t)*ry)); } band(p,pts,w); }
  let CTX=null;
  function lightLocal(ang){ return [LIGHT.x*C(-ang)-LIGHT.y*S(-ang), LIGHT.x*S(-ang)+LIGHT.y*C(-ang)]; }
  function shadeIn(p,R,Q,cx,cy,rx,ry,ang,hi,rot){
    const [lx,ly]=lightLocal(ang);
    p.F(Q[1]); p.ell(cx-lx*rx*0.8,cy-ly*ry*0.8,rx,ry,rot);
    p.F(R[2]); p.ell(cx-lx*rx*1.05,cy-ly*ry*1.05,rx,ry,rot);
    p.F(R[3]); p.ell(cx-lx*rx*1.45,cy-ly*ry*1.45,rx,ry,rot);
    if(hi){ p.F(Q[0]); p.ell(cx+lx*rx*1.12,cy+ly*ry*1.12,rx,ry,rot); p.F(R[0]); p.ell(cx+lx*rx*1.5,cy+ly*ry*1.5,rx*(0.7+0.3*hi),ry*(0.7+0.3*hi),rot); }
  }
  function mass(p,R,cx,cy,rx,ry,ang,hi=1,rot=0){
    const Q=qOf(R);
    p.F(R[1]); p.ell(cx,cy,rx,ry,rot);
    CTX.save(); CTX.beginPath(); CTX.ellipse(cx,cy,rx,ry,rot,0,PI*2); CTX.clip();
    shadeIn(p,R,Q,cx,cy,rx,ry,ang,hi,rot);
    CTX.restore();
  }
  function clipPoly(pts){ CTX.save(); CTX.beginPath(); pts.forEach((q,i)=>i?CTX.lineTo(q[0],q[1]):CTX.moveTo(q[0],q[1])); CTX.closePath(); CTX.clip(); }
  function platePoly(p,R,pts,ang,hi=1){
    const Q=qOf(R); let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9; pts.forEach(([x,y])=>{ x0=Math.min(x0,x); y0=Math.min(y0,y); x1=Math.max(x1,x); y1=Math.max(y1,y); });
    const cx=(x0+x1)/2, cy=(y0+y1)/2, rx=(x1-x0)/2+0.5, ry=(y1-y0)/2+0.5;
    p.F(R[1]); p.poly(pts);
    clipPoly(pts); shadeIn(p,R,Q,cx,cy,rx,ry,ang,hi,0); CTX.restore();
  }
  function heavyBase(cv){ const g=cv.getContext('2d'), W=cv.width, H=cv.height, im=PIX.pix(cv), d=im.data, O=[0x17,0x0b,0x1c];
    const isO=i=>d[i+3]===255&&d[i]===O[0]&&d[i+1]===O[1]&&d[i+2]===O[2];
    for(let y=H-1;y>=2;y--) for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(d[i+3]) continue; const a=((y-1)*W+x)*4, b=((y-2)*W+x)*4; if(isO(a)&&d[b+3]&&!isO(b)){ d[i]=O[0]; d[i+1]=O[1]; d[i+2]=O[2]; d[i+3]=255; } }
    g.putImageData(im,0,0); }
  // renda: anéis florais, furos e pontinhos (dentro de um clip)
  function laceFill(p,M,x0,y0,x1,y1,sd=0){
    const R=M.lace;
    for(let y=y0, r=0; y<y1; y+=5.2, r++) for(let x=x0+(r%2)*2.6; x<x1; x+=5.2){
      const h=hs(x*0.37+y*1.31+sd);
      if(h<0.5){ p.F(R[3]); p.ell(x,y,1.5,1.5); p.F(R[2]); p.rect(x-0.5,y-0.5,1,1); }
      else if(h<0.72){ p.F(R[2]); p.rect(x-1.4,y-0.5,2.8,1); p.rect(x-0.5,y-1.4,1,2.8); }
      else if(h<0.86){ p.F(R[0]); p.rect(x-0.5,y-0.5,1.1,1.1); }
      else { p.F(R[3]); p.rect(x-1,y-0.5,2,1.2); }
    }
  }

  function rosette(p,M,x,y,r){ const R=M.lace; p.F(R[3]); p.circle(P2(x,y),r+0.8); p.F(R[1]); for(let k=0;k<6;k++){ const a=k/6*PI*2; p.ell(x+C(a)*r,y+S(a)*r,1.1,1.1); } p.F(R[0]); p.rect(x-0.5,y-0.5,1.1,1.1); p.F(R[0]); p.rect(x+C(-1)*r-0.4,y+S(-1)*r-0.4,0.9,0.9); }
  /* ---------------- saia (camada de trás e da frente) ---------------- */
  function skirtGeo(sk,P,back){
    const n=12, tr=P.trail, fl=P.flare, ph=P.ph;
    const tF=sk.T(10,1), tB=sk.T(-11,1), top=lerp(tF,tB,0.5);
    const hemY=GROUND-HOV-P.fl*0.85+(back?2:0);
    const sl=[];
    for(let k=0;k<=n;k++){ const t=k/n;
      const y=top.y+(hemY-top.y)*t*(1-0.3*Math.abs(tr)*t);
      const cx=top.x-tr*56*Math.pow(t,1.5)+S(ph+t*3.4)*t*(3+2*Math.abs(tr))+(back?-5:0)*t;
      const hw=11.5+(39+fl*12+(back?6:0))*Math.pow(t,1.15);
      sl.push({t,y,cx,hw,xb:cx-hw*1.06,xf:cx+hw*0.86});
    }
    sl[0].xf=tF.x; sl[0].xb=tB.x; sl[0].y=top.y;
    const last=sl[n], m=back?12:10, hem=[];
    for(let j=0;j<=m;j++){ const u=j/m; let x=last.xf+(last.xb-last.xf)*u, y=last.y;
      if(j%2){ const L=(back?20:15)+6*S(ph+j*1.9)+u*6; x+=-tr*L*0.9+S(ph+j)*2; y+=L*(1-0.5*Math.abs(tr)); }
      else y-=1.5+(back?0:hs(j)*2);
      y=Math.min(y,GROUND-2); hem.push([x,y]); }
    const poly=[...sl.map(s=>[s.xf,s.y]), ...hem, ...sl.slice().reverse().map(s=>[s.xb,s.y])];
    const at=t=>{ const f=t*n, k=Math.min(n-1,Math.floor(f)), r=f-k, a=sl[k], b=sl[k+1]; const L=(u,v)=>u+(v-u)*r; return {t,y:L(a.y,b.y),cx:L(a.cx,b.cx),hw:L(a.hw,b.hw),xb:L(a.xb,b.xb),xf:L(a.xf,b.xf)}; };
    return {sl,hem,poly,at,n};
  }
  function drawSkirt(p,M,sk,P,back){
    p.id(); const g=skirtGeo(sk,P,back), R=back?M.dress2:M.dress, Q=qOf(R), ph=P.ph, sl=g.sl, n=g.n;
    p.F(R[1]); p.poly(g.poly);
    clipPoly(g.poly);
    // volume de cilindro: lado de trás (esquerda) em sombra, faixa de luz quente na frente
    const reg=(u0,u1,t0,t1)=>{ const a=[],b=[]; for(let k=0;k<=8;k++){ const s=g.at(t0+(t1-t0)*k/8); a.push([s.cx+u0*s.hw,s.y]); b.push([s.cx+u1*s.hw,s.y]); } return [...a,...b.reverse()]; };
    p.F(Q[1]); p.poly(reg(-1.3,-0.15,0,1)); p.poly(reg(-1.3,1.2,0.93,1));
    p.F(R[2]); p.poly(reg(-1.3,-0.42,0,1));
    p.F(R[3]); p.poly(reg(-1.3,-0.8,0,1)); p.poly(reg(-1.3,1.2,0,0.06));
    p.F(Q[3]); p.poly(reg(-1.3,-0.95,0.1,1));
    if(!back){ p.F(Q[0]); p.poly(reg(0.3,0.62,0.06,0.88)); p.F(R[0]); p.poly(reg(0.42,0.52,0.1,0.6)); }
    // dobras verticais que ondulam
    const us=back?[-0.6,-0.15,0.35,0.7]:[-0.7,-0.42,-0.12,0.18,0.46,0.74];
    us.forEach((u,q)=>{ const pts=[]; for(let k=1;k<=n;k++){ const s=sl[k]; pts.push(P2(s.cx+u*s.hw+S(ph+q*2+s.t*3)*1.6*s.t, s.y)); }
      const ht=g.hem[Math.min(g.hem.length-1,Math.round((1-(u+1)/2.1)*(g.hem.length-1)))]; pts.push(P2(ht[0],ht[1]));
      p.F(u<-0.3?R[3]:Q[2]); taper(p,pts,1.2,3.8);
      p.F(u<-0.3?Q[3]:R[2]); taper(p,pts.slice(2),0.6,1.6);
      p.F(u<-0.35?Q[1]:(u>0.2?R[0]:Q[0])); taper(p,pts.map(q=>P2(q.x+2.6,q.y)).slice(1,-2),0.8,1.8);
    });
    // franzido na cintura
    p.F(Q[3]); for(let k=0;k<7;k++){ const s=g.at(0.02), s2=g.at(0.12), u=-0.9+k*0.3; p.cap(P2(s.cx+u*s.hw,s.y),P2(s2.cx+u*s2.hw,s2.y),1,0.7); }
    // babado (segunda camada da saia) com festão: sombra embaixo de cada onda, brilho na crista
    { const t0=back?0.5:0.4, a=g.at(t0), m2=back?6:9;
      for(let k=0;k<m2;k++){ const u0=-1.06+k*(2/m2), u1=u0+2/m2, s0=g.at(t0+0.004*k);
        const x0=s0.cx+u0*s0.hw, x1=s0.cx+u1*s0.hw, y=s0.y, mid=(x0+x1)/2, lit=u0>-0.3;
        p.F(lit?Q[2]:R[3]); p.poly([[x0,y],[mid,y+4.2],[x1,y],[x1,y+2],[mid,y+6],[x0,y+2]]);
        p.F(lit?Q[0]:Q[1]); band(p,[P2(x0+1,y-0.6),P2(mid,y+3),P2(x1-1,y-0.6)],0.9); }
      p.F(Q[3]); band(p,[P2(a.xb,a.y-1.4),P2(a.xf,a.y-1.4)],0.9); }
    if(!back){
      // brocado discreto (damasco) na parte iluminada
      for(let t=0.16;t<0.58;t+=0.085) for(let u=-0.2;u<0.8;u+=0.24){ const s1=g.at(t), x=s1.cx+(u+((t*12|0)%2)*0.12)*s1.hw, y=s1.y;
        p.F(u>0.25&&u<0.65?Q[0]:Q[2]); p.poly([[x,y-2.2],[x+1.4,y],[x,y+2.2],[x-1.4,y]]); p.F(R[2]); p.rect(x-0.4,y-0.4,0.9,0.9); }
      // renda larga no barrado (sob o azulejo): fundo de renda, furos e borda em festão
      { const L0=0.8, L1=0.93, rg=reg(-1.3,1.2,L0,L1); p.F(M.lace[2]); p.poly(rg);
        clipPoly(rg); const sa=g.at(L0), sb=g.at(L1); laceFill(p,M,Math.min(sa.xb,sb.xb)-4,sa.y,Math.max(sa.xf,sb.xf)+4,sb.y+2,3); p.F(qOf(M.lace)[3]); p.poly(reg(-1.3,-0.55,L0,L1)); CTX.restore();
        const sc=g.at(L0); for(let k=0;k<11;k++){ const u=-1+k*0.2, x=sc.cx+u*sc.hw; p.F(M.lace[u>-0.5?0:1]); p.ell(x,sc.y,1.6,1.2); p.F(M.lace[3]); p.rect(x-0.4,sc.y+1,0.9,0.9); } }
      // barrado bordado em padrão de azulejo (o casario de Olinda), rasgado em dois pontos
      const a=g.at(0.63), b=g.at(0.71), c=g.at(0.67);
      const bandP=[[a.xb,a.y],[a.xf,a.y],[b.xf,b.y],[b.xb,b.y]];
      p.F(M.tile[1]); p.poly(bandP);
      p.F(M.tile[3]); p.poly([[a.xb,a.y],[a.xf,a.y],[a.xf,a.y+1.3],[a.xb,a.y+1.3]]); p.poly([[b.xb,b.y-1.3],[b.xf,b.y-1.3],[b.xf,b.y],[b.xb,b.y]]);
      for(let x=c.xb+3; x<c.xf-1; x+=6.2){ const sh=x<c.cx-0.45*c.hw, y=c.y; const s=2.3;
        p.F(sh?M.tile[3]:M.tile[2]); p.poly([[x,y-s],[x+s,y],[x,y+s],[x-s,y]]);
        p.F(sh?M.tile[2]:M.tile[0]); p.rect(x-0.6,y-0.6,1.2,1.2);
        p.F(M.tile[2]); p.rect(x+3,y-0.5,1,1); }
      p.F(Q[1]); p.poly(reg(-1.3,-0.7,0.6,0.74));
      // rasgos no barrado
      [[-0.18,1],[0.5,-1]].forEach(([u,sg])=>{ const s=g.at(0.67), x=s.cx+u*s.hw; p.F(R[3]); p.poly([[x-3,s.y-5],[x+1,s.y-3],[x+3,s.y+1*sg],[x+1,s.y+5],[x-2,s.y+2],[x-4,s.y-1]]); });
      // rasgos curtos subindo das pontas da barra
      g.hem.forEach((h,j)=>{ if(j%2||j===0||j===g.hem.length-1) return; const x=h[0], y=h[1]; p.F(Q[3]); p.poly([[x-1.4,y+1],[x+1.4,y+1],[x+0.4,y-6-hs(j)*4]]); });
    }
    CTX.restore();
  }

  /* ---------------- tronco (corpete de luto) ---------------- */
  const BODY=[[-11,4],[-12,-6],[-10.5,-16],[-11,-27],[-9,-35],[-4,-39],[3,-41],[8,-38],[11,-33],[13.5,-27],[13,-21],[9.5,-15],[9,-8],[11,4]];
  const frontX=y=>{ const f=[[-38,8],[-33,11],[-27,13.5],[-21,13],[-15,9.5],[-8,9],[4,11]]; for(let k=0;k<f.length-1;k++){ const [y0,x0]=f[k],[y1,x1]=f[k+1]; if(y>=y0&&y<=y1) return x0+(x1-x0)*(y-y0)/(y1-y0); } return 10; };
  function drawTorso(p,M,sk,P){
    p.xf(sk.a,sk.W.x,sk.W.y); const R=M.dress, Q=qOf(R), A=sk.a;
    p.F(R[1]); p.poly(BODY);
    clipPoly(BODY);
    shadeIn(p,R,Q,1,-18,12,22,A,1,0);
    mass(p,R,8,-26,6.5,6,A,1);
    p.F(R[3]); arc(p,8,-26,6.5,6,30,150,1.3,5);
    p.F(R[3]); p.poly([[-13,4],[-13,-30],[-8,-37],[-8.5,-30],[-9,-14],[-8,4]]);
    p.F(Q[3]); band(p,[P2(1,4),P2(0,-10),P2(2,-20),P2(4,-33)],1.1);
    p.F(Q[0]); band(p,[P2(2.4,2),P2(1.4,-10),P2(3.2,-19)],0.8);
    p.F(Q[3]); band(p,[P2(-5,4),P2(-6,-12),P2(-5,-24),P2(-3,-36)],1);
    p.F(Q[1]); band(p,[P2(-3.8,2),P2(-4.8,-12),P2(-3.8,-23)],0.7);
    // peitilho de renda (pala) com borda em festão
    const YK=[[-10,-34],[-4,-39],[3,-41],[8,-38],[11.5,-32],[13,-27],[6,-25.6],[0,-26.4],[-6,-27.4],[-11,-29]];
    p.F(M.lace[2]); p.poly(YK); clipPoly(YK); laceFill(p,M,-12,-42,14,-25,5); p.F(qOf(M.lace)[3]); p.ell(-8,-33,5,7); CTX.restore();
    p.F(M.lace[1]); for(let k=0;k<7;k++){ const x=-9+k*3.4, y=-28.6+Math.abs(k-4)*0.35+(k>4?(k-4)*0.5:0); p.ell(x,y,1.8,1.3); }
    p.F(M.lace[0]); for(let k=2;k<7;k++){ const x=-9+k*3.4, y=-29+(k>4?(k-4)*0.5:0); p.rect(x-0.4,y-0.6,1,0.9); }
    // costura lateral e pences
    p.F(Q[2]); band(p,[P2(9,-24),P2(8.4,-12),P2(9,-2)],0.8);
    CTX.restore();
    // botões de prata na frente
    for(let k=0;k<7;k++){ const y=-35+k*5.2, x=frontX(y)-2.6; p.F(M.silver[2]); p.ell(x,y,1.3,1.3); p.F(M.silver[0]); p.rect(x-0.5,y-0.9,1,1); }
    // bico do corpete (basque) sobre a saia + cinta
    p.F(R[2]); p.poly([[-12,0],[12,0],[11,5],[5,10],[0,6.5],[-6,9],[-12,5]]);
    p.F(Q[0]); p.rect(-10,0,21,1.2);
    p.F(M.lace[2]); p.poly([[-12,-4],[11.5,-4],[11.6,0],[-12,0]]); p.F(M.lace[0]); p.rect(-8,-4,18,0.9);
    // gola alta de renda franzida
    p.F(M.lace[1]); p.poly([[-5,-37],[2,-39.5],[9,-38],[9.6,-34],[3,-35],[-4,-33]]);
    p.F(M.lace[0]); [[-3,-33.6],[0,-34.2],[3,-34.6],[6,-34.6],[8.6,-34.2]].forEach(([x,y])=>p.ell(x,y,1.3,1.1));
    p.F(M.lace[3]); [[-1.5,-36],[2,-36.8],[5.5,-36.6]].forEach(([x,y])=>p.rect(x,y,1,1));
    // camafeu
    p.F(M.silver[2]); p.ell(8.4,-31,2.6,3.2); p.F(M.ivory[1]); p.ell(8.6,-31,1.7,2.3); p.F(M.ivory[0]); p.rect(8.6,-32.4,1,1.6); p.F(M.silver[0]); p.rect(7,-34,1,1);
    // laço de fita preta nas costas da cinta, pontas caindo
    p.F(M.hair[2]); p.poly([[-12,-2],[-19,-7],[-20,-1],[-13,1]]); p.poly([[-12,-1],[-18,4],[-14,6],[-11,1]]);
    p.F(M.hair[1]); p.poly([[-13,-2],[-18,-5.6],[-18.4,-2],[-14,-0.6]]); p.F(M.hair[3]); p.ell(-12,-1,2,2);
    p.F(M.hair[2]); taper(p,[P2(-12,0),P2(-15,8+S(P.ph)*1.5),P2(-17,16+S(P.ph+1)*2)],2.6,1.6); taper(p,[P2(-11,0),P2(-11,9),P2(-12.4,17+S(P.ph+2)*2)],2.4,1.4);
    p.F(M.hair[0]); p.rect(-15.4,8,1,3);
    // rosa murcha presa na cinta
    flower(p,M,-6,-2,1);
  }
  function flower(p,M,x,y,s=1,droop=0){
    const F=M.flower, Lf=M.leaf;
    p.F(Lf[3]); p.poly([[x-1,y],[x-5.5*s,y+2.6*s],[x-3*s,y+4*s]]); p.F(Lf[2]); p.poly([[x+1,y+1],[x+4.6*s,y+3.6*s+droop],[x+1.6*s,y+4.6*s+droop]]);
    p.F(F[3]); p.ell(x,y,3.6*s,3.2*s); p.F(F[2]); p.ell(x+0.4*s,y-0.4*s,3*s,2.6*s); p.F(F[1]); p.ell(x+0.8*s,y-0.8*s,2*s,1.7*s);
    p.F(F[0]); p.rect(x+0.6*s,y-1.8*s,1.4*s,0.9*s); p.F(F[3]); arc(p,x+0.4*s,y-0.2*s,1.6*s,1.3*s,200,470,0.7,6); p.rect(x-0.2*s,y-0.4*s,0.9*s,0.9*s);
    p.F(F[2]); p.poly([[x-3*s,y+1*s],[x-1*s,y+2.4*s],[x-2.4*s,y+4.4*s]]); // pétala caindo
  }

  /* ---------------- cabelo e véu (atrás) ---------------- */
  function drawHairBack(p,M,sk,P){
    // cabelo longo em mechas separadas: cada uma com a própria onda, afinando até a ponta que se enrola; vento leva pra trás
    p.id(); const R=M.hair, Q=qOf(R), hb=P.hb, ph=P.ph;
    let bx=-0.18-hb*0.6, by=1-hb*0.45; const bl0=Math.hypot(bx,by); bx/=bl0; by/=bl0;
    // [raiz na cabeça (local), comprimento, largura, fase, desvio de ângulo, camada (0 trás .. 2 frente)]
    const ST=[[-4,-21,72,10,0.0,-0.07,0],[-10,-6,64,9,2.1,0.1,0],[-7,-17,86,12,1.0,-0.02,1],[-9,-11,80,11,3.3,0.04,1],[-5,-14,76,10,4.4,0.0,2],[-10,-3,60,8,5.6,0.12,2]];
    const strand=([lx,ly,L,w0,f,da,lay],k)=>{
      const s0=sk.H(lx,ly), n=9, pts=[]; let x=s0.x, y=s0.y;
      for(let j=0;j<=n;j++){ const t=j/n;
        let dx=-0.12+(bx+0.12)*Math.min(1,t*1.6), dy=1+(by-1)*Math.min(1,t*1.6);
        const a=da*(0.4+t)+S(ph*1.1+f+t*4.4)*0.42*t*(0.7+hb*0.8)+(t>0.8?(t-0.8)*4*(k%2?1:-1):0);
        const ddx=dx*C(a)-dy*S(a), ddy=dx*S(a)+dy*C(a), dl=Math.hypot(ddx,ddy);
        if(j>0){ x+=ddx/dl*L/n; y+=ddy/dl*L/n; } pts.push(P2(x,y)); }
      const sh=lay===0?R[3]:lay===1?R[2]:R[2], mid=lay===0?Q[3]:R[1], hi=lay===0?Q[2]:R[0];
      const wd=t=>w0*(1-0.8*Math.pow(t,1.6));
      p.F(sh); for(let j=0;j<n;j++) p.cap(pts[j],pts[j+1],wd(j/n),wd((j+1)/n));
      p.F(mid); for(let j=0;j<n-2;j++) p.cap(P2(pts[j].x+w0*0.12,pts[j].y-0.3),P2(pts[j+1].x+w0*0.12,pts[j+1].y-0.3),wd(j/n)*0.5,wd((j+1)/n)*0.5);
      p.F(lay===0?R[3]:Q[3]); taper(p,pts.slice(1,8).map(q=>P2(q.x-w0*0.18,q.y+0.2)),0.9,0.7);
      p.F(hi); taper(p,pts.slice(1+(k%2),4+(k%2)).map(q=>P2(q.x+w0*0.22,q.y-0.4)),1.2,0.8);
      if(lay>0){ p.F(Q[0]); const q=pts[2+(k%3)]; p.rect(q.x+w0*0.2,q.y-1,1.2,1.4); }
    };
    ST.forEach(strand);
    // fios soltos voando
    p.F(R[1]); [[-6,-20,1.4],[-9,-8,4.2]].forEach(([lx,ly,f])=>{ const s0=sk.H(lx,ly), pts=[]; for(let j=0;j<=6;j++){ const t=j/6; pts.push(P2(s0.x+bx*t*40-hb*8*t+S(ph+f+t*6)*5*t, s0.y+by*t*44+C(ph+f+t*5)*5*t)); } taper(p,pts,1.8,0.6); });
  }
  function drawVeilBack(p,M,sk,P,form){
    p.id(); const R=M.lace, vb=P.vb, ph=P.ph, torn=form==='furia';
    const bl=(lx,ly,d)=>{ const q=sk.T(lx-4*d,ly); return {x:q.x-vb*16*d-5*d+S(ph+d*3)*2*d, y:q.y-vb*5*d*d}; };
    const hb0=bl(-24,torn?-16:-8,1), hf=bl(-6,torn?-24:-18,0.62);
    const pts=[sk.H(9,-25),sk.H(3,-31),sk.H(-3,-38),sk.H(-11,-31),sk.H(-15,-18),sk.H(-15,-6),bl(-16,-28,0.45),bl(-22,-14,0.75),hb0];
    const m=torn?7:8;
    for(let j=1;j<m;j++){ const q=lerp(hb0,hf,j/m); const dd=torn?(j%2?7+4*hs(j):-1):(j%2?3.4:0); pts.push({x:q.x-(torn&&j%2?3:0),y:q.y+dd}); }
    pts.push(hf, sk.T(-3,-30), sk.H(-4,-2), sk.H(2,-6));
    const poly=pts.map(A2);
    const xs=poly.map(q=>q[0]), ys=poly.map(q=>q[1]);
    p.F(R[1]); p.poly(poly);
    clipPoly(poly);
    shadeIn(p,R,qOf(R),(Math.min(...xs)+Math.max(...xs))/2,(Math.min(...ys)+Math.max(...ys))/2,(Math.max(...xs)-Math.min(...xs))/2,(Math.max(...ys)-Math.min(...ys))/2,0,0.6,0);
    laceFill(p,M,Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys),1);
    // rosáceas de renda (motivo floral) espalhadas no véu
    [[-16,-22,0.6],[-21,-6,0.85],[-12,-10,0.45]].forEach(([lx,ly,d])=>{ const c=bl(lx,ly,d); rosette(p,M,c.x,c.y,2.6); });
    // dobras do véu
    p.F(R[3]); [0.3,0.55,0.8].forEach(d=>{ const a=sk.H(-12,-20), b=bl(-14-12*d,-26+30*d,d); p.cap(a,lerp(a,b,0.5),0.8,1.2); p.cap(lerp(a,b,0.5),b,1.2,1.6); });
    if(torn){ p.F(R[3]); const c=bl(-19,-12,0.7); p.poly([[c.x-3,c.y-4],[c.x+2,c.y-6],[c.x+4,c.y],[c.x,c.y+5],[c.x-4,c.y+2]]); const d=bl(-12,-24,0.5); p.poly([[d.x-2,d.y-2],[d.x+3,d.y-1],[d.x,d.y+4]]); }
    CTX.restore();
    // borda de festão (ondas de renda com furinho)
    for(let j=0;j<=m;j++){ const q=lerp(hb0,hf,j/m), y=q.y+(j%2&&!torn?3:0); p.F(R[1]); p.ell(q.x,y+0.6,2.2,1.6); p.F(R[0]); p.rect(q.x-0.6,y-0.2,1.3,1); p.F(R[3]); p.rect(q.x-0.4,y+0.9,0.9,0.9); }
  }

  /* ---------------- braço com manga-sino em farrapos ---------------- */
  function drawArm(p,M,sh,el,wr,P,back){
    const R=back?M.dress2:M.dress, Q=qOf(R);
    // drapeado da manga (gravidade), em espaço de tela
    const fa=Math.atan2(wr.y-el.y,wr.x-el.x), L=Math.hypot(wr.x-el.x,wr.y-el.y);
    const Lw=(lx,ly)=>({x:el.x+lx*C(fa)-ly*S(fa), y:el.y+lx*S(fa)+ly*C(fa)});
    const side=Lw(L*0.5,8).y>=Lw(L*0.5,-8).y?1:-1;
    const us=[0.2,0.45,0.7,0.95,1.1], edge=us.map(u=>Lw(L*u,side*(4.5+9*u)));
    const hang=edge.map((q,k)=>{ const u=us[k], d=(3+21*u)*(k%2?1:0.68); return {x:q.x-P.trail*9*u+S(P.ph+k)*1.5-P.vb*3*u, y:q.y+d}; });
    p.id(); const dp=[...edge.map(A2), ...hang.reverse().map(A2)];
    p.F(R[2]); p.poly(dp); clipPoly(dp); p.F(Q[3]); hang.forEach((q,k)=>{ if(k<hang.length-1) p.cap(edge[edge.length-1-k],q,0.9,1.3); }); CTX.restore();
    p.F(M.lace[2]); hang.forEach(q=>p.rect(q.x-1,q.y-1.4,2,1.6));
    // braço (manga justa com bufante no ombro)
    let t=limb(p,sh,el);
    p.F(R[1]); p.cap(P2(0,0),P2(t.L,0),10,7.5);
    mass(p,R,t.L*0.55,0,t.L*0.5,4,t.ang,0.6);
    mass(p,R,2,0,8.5,7.6,t.ang,1);
    p.F(Q[3]); [-3,0,3].forEach(y=>p.cap(P2(-3,y*1.6),P2(6,y*2.1),0.8,0.7)); arc(p,2,0,8,7,30,150,0.9,5);
    // antebraço: manga-sino
    t=limb(p,el,wr);
    const sl=[[-2,-5],[L*0.5,-8],[L+2,-13.5],[L+5,-9],[L+1,-4],[L+6,0],[L+2,5],[L+5,10],[L+1,14],[L*0.5,9.5],[-2,5]];
    platePoly(p,R,sl,t.ang,0.8);
    p.F(Q[3]); band(p,[P2(2,0),P2(L*0.6,-1),P2(L+1,-2)],1); band(p,[P2(L*0.4,3),P2(L+1,6)],0.9);
    p.F(Q[0]); band(p,[P2(4,-2.5),P2(L*0.6,-4)],0.8);
    // punho de renda
    p.F(M.lace[1]); p.poly([[L-3,-12.2],[L+2,-13.5],[L+5,-9],[L+1,-4],[L+6,0],[L+2,5],[L+5,10],[L+1,14],[L-3,11.6]]);
    p.F(M.lace[3]); [[L,-6],[L+1,0],[L,6]].forEach(([x,y])=>p.rect(x-0.5,y-0.5,1.2,1.2)); p.F(M.lace[0]); [[L+3,-7],[L+4,0],[L+3,8]].forEach(([x,y])=>p.rect(x-0.5,y-0.5,1.1,1.1));
  }
  function drawHand(p,M,wr,el,P){
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y); CTX.scale(1.3,1.3);
    const R=M.skin, N=M.nail, cu=P.curl;
    p.F(R[2]); p.cap(P2(-1,0),P2(3,0),4.6,5.6);
    p.F(R[1]); p.poly([[2,-3.6],[8.4,-4.2],[10.4,-1],[10,3],[7.4,4.6],[2,3.6]]);
    mass(p,R,5.8,0,4.8,3.9,ang,0.8);
    p.F(R[3]); [-2,0.3,2.6].forEach(y=>p.cap(P2(4,y*0.9),P2(9,y*1.3),0.7,0.6));
    [[-2.9,-22],[-1,-7],[1,8],[2.8,22]].forEach(([y0,da],k)=>{ const sp=1-0.35*cu; let a=rad(da*sp), q=P2(9.4,y0);
      const segs=[5.4-(k===3?1.2:0),4.2];
      p.F(R[1]); for(const Lg of segs){ const nq=P2(q.x+C(a)*Lg,q.y+S(a)*Lg); p.cap(q,nq,2.3,1.9); q=nq; a+=rad(14+46*cu); }
      p.F(R[0]); { const a0=rad(da*sp); p.rect(9.4+C(a0)*5.2-0.5,y0+S(a0)*5.2-0.9,1.1,1.1); }
      const mid=P2(q.x+C(a-0.1)*5.5,q.y+S(a-0.1)*5.5), tip=P2(mid.x+C(a+0.25)*5.5,mid.y+S(a+0.25)*5.5);
      p.F(N[1]); p.cap(q,mid,2,1.5); p.cap(mid,tip,1.5,0.4);
      p.F(N[0]); p.cap(P2(q.x+0.2,q.y-0.5),P2(mid.x,mid.y-0.4),0.7,0.5);
      p.F(N[2]); p.rect(tip.x-0.5,tip.y-0.5,1,1);
    });
    let a=rad(-62+26*cu), q=P2(4,-3.4);
    p.F(R[1]); for(const Lg of [4.4,3.6]){ const nq=P2(q.x+C(a)*Lg,q.y+S(a)*Lg); p.cap(q,nq,2.4,2); q=nq; a+=rad(20+30*cu); }
    const tip=P2(q.x+C(a)*7.5,q.y+S(a)*7.5); p.F(N[1]); p.cap(q,tip,1.8,0.4); p.F(N[0]); p.rect(q.x,q.y-0.6,1,1);
  }

  /* ---------------- terço partido ---------------- */
  function drawRosary(p,M,sk,P){
    p.id(); const w=sk.wrF, ang=Math.atan2(w.y-sk.elF.y,w.x-sk.elF.x), sw=S(P.ph+1)*3-P.trail*10+P.hx*0.2, B=M.bead;
    // voltas no pulso
    for(let k=0;k<6;k++){ const t=k/6*PI*2, x=w.x+C(ang)*(-1)+C(t)*1.6*S(ang)+0, y=w.y+S(ang)*(-1)+S(t)*3.2;
      p.F(B[2]); p.ell(x-S(ang)*S(t)*3,y,1.4,1.4); p.F(B[0]); p.rect(x-S(ang)*S(t)*3-0.5,y-0.9,1,1); }
    const beads=(n,x0,y0,dx,step)=>{ const out=[]; for(let j=0;j<n;j++){ const u=j/(n-1); out.push(P2(x0+dx*Math.pow(u,1.3)+1, y0+3+j*step)); } return out; };
    const st=beads(9,w.x,w.y,sw,3.2);
    p.F(B[3]); band(p,st,0.6);
    st.forEach(b=>{ p.F(B[1]); p.ell(b.x,b.y,1.6,1.6); p.F(B[0]); p.rect(b.x-0.2,b.y-1.2,1,1); });
    const e=st[st.length-1], cx=e.x+sw*0.15, cy=e.y+3;
    p.F(M.silver[2]); p.rect(cx-1,cy,2.2,9); p.rect(cx-3.2,cy+2.2,6.6,2);
    p.F(M.silver[0]); p.rect(cx-0.6,cy+0.4,1,4); p.rect(cx-2.6,cy+2.4,2,1);
    p.F(M.silver[3]); p.rect(cx+0.4,cy+5,0.8,3.6);
    // fio partido e contas soltas caindo
    const s2=beads(4,w.x-2,w.y+1,sw*0.6-2,3);
    s2.forEach(b=>{ p.F(B[2]); p.ell(b.x,b.y,1.5,1.5); p.F(B[0]); p.rect(b.x-0.2,b.y-1,0.9,0.9); });
    for(let k=0;k<3;k++){ const f=((P.ph*9+k*11)%28)/28; const x=w.x-3+k*3-P.trail*8*f, y=w.y+14+f*34;
      if(y<GROUND-3){ p.F(B[1]); p.ell(x,y,1.4,1.4); p.F(B[0]); p.rect(x-0.3,y-1,0.9,0.9); } }
  }

  /* ---------------- cabeça ---------------- */
  function drawLock(p,M,sk,P){
    p.id(); const R=M.hair, a=sk.H(-3,-12), b=sk.T(9,-26), c=sk.T(11+S(P.ph)*1.5,-14), d=sk.T(9,-6);
    p.F(R[1]); taper(p,[a,b,c,d],5.5,1.4);
    p.F(R[2]); taper(p,[lerp(a,b,0.3),b,c],1.4,0.8); p.F(R[0]); taper(p,[a,lerp(a,b,0.6)],1,0.8);
  }
  function drawHead(p,M,sk,P,form){
    p.xf(sk.ha,sk.neck.x,sk.neck.y); CTX.scale(HS,HS);
    const Sk=M.skin, furia=form==='furia', j=Math.max(0,P.jaw)+(furia?6:0), jr=rad(j)*0.82, J=[1,-9];
    const R=pts=>pts.map(([x,y])=>{ const dx=x-J[0], dy=y-J[1]; return [J[0]+dx*C(jr)-dy*S(jr), J[1]+dx*S(jr)+dy*C(jr)]; });
    // pescoço magro
    p.F(Sk[2]); p.cap(P2(-1,4),P2(1,-8),7,8); p.F(Sk[3]); p.cap(P2(2.6,2),P2(4,-6),0.9,0.8); p.F(Sk[1]); p.cap(P2(-0.4,3),P2(0.4,-6),2,2);
    // boca (interior) — escancarada no grito
    p.F(M.mouth[1]); p.poly([[3,-8.4],[13.4,-7.8],...R([[13.6,-6.6],[3,-7.6]])]);
    if(j>12){ p.F(M.mouth[3]); p.poly([[5,-8],[11,-7.8],...R([[11,-6.6],[5,-7.4]])]); p.F(M.mouth[0]); const q=R([[8,-6.8]])[0]; p.ell(q[0],q[1]-0.6,2.6,1.1); }
    // mandíbula (gira)
    const Lo=R([[-4,-7],[3,-8.2],[13.4,-7.4],[14.2,-6],[13.2,-4.6],[13.6,-2.4],[12.6,-0.6],[9,0.4],[5,0.2],[1,-1],[-3,-3]]);
    p.F(Sk[1]); p.poly(Lo); p.F(Sk[2]); p.poly(R([[1,-1],[6,0.6],[10.6,-0.4],[12,-1.4],[6,-1.4]])); p.F(Sk[3]); p.poly(R([[-3,-3],[1,-1],[4,-1],[0,-3.6]]));
    if(j>8){ p.F(M.teeth[1]); R([[11,-7.6],[9,-7.6]]).forEach(([x,y])=>p.rect(x,y-1.6,1.4,1.6)); }
    // crânio e rosto: pele de defunta (cinza-lilás), maçã do rosto saltada, bochecha funda, órbita escura e funda
    const U=[[-9,-11],[-8,-20],[-3,-26],[5,-27],[10,-24.4],[12.6,-20],[12.4,-16],[13.6,-14.4],[16.8,-10.4],[15.6,-9.6],[13.4,-9.6],[14.4,-8.2],[11,-7.8],[3,-8.2],[-4,-6.4]];
    const SQ=qOf(Sk);
    p.F(Sk[1]); p.poly(U);
    clipPoly(U); mass(p,Sk,4,-17,10,10,sk.ha,0.35);
    // sombra da mantilha na testa e têmpora funda
    p.F(Sk[2]); p.ell(4,-26,12,4.4); p.ell(4.6,-16.6,3.2,4.4); p.F(SQ[2]); p.ell(3.4,-25.6,10,2.6);
    // bochecha chupada sob a maçã do rosto
    p.F(SQ[1]); p.ell(8.6,-8.6,4.4,2.6); p.F(Sk[2]); p.ell(8,-8.2,3.4,1.8); p.F(Sk[3]); p.cap(P2(5.6,-9.6),P2(9.8,-8.4),0.9,0.7);
    CTX.restore();
    // maçã do rosto e arco da sobrancelha (osso pegando luz)
    p.F(SQ[0]); p.cap(P2(8.4,-10.8),P2(13,-11.4),1.6,1.2); p.F(Sk[0]); p.cap(P2(9.4,-11.2),P2(12.4,-11.6),0.9,0.8);
    p.F(SQ[0]); arc(p,10.6,-13.4,4.4,3.6,200,330,1.1,5); p.F(Sk[0]); p.rect(11,-17.4,2,0.9);
    p.F(Sk[0]); p.cap(P2(12.8,-18.6),P2(14.6,-12.4),0.9,0.8);
    // órbita funda (escura) com o olho brilhando lá no fundo
    const glow=P.dis>0.9?0:1, eyeOn=glow&&P.fade>0.3;
    p.F(Sk[3]); p.ell(10.4,-13.3,4,3); p.F(SQ[3]); p.ell(10.7,-13.2,3.1,2.2); p.F(M.mouth[3]); p.ell(10.9,-13.1,2.3,1.6);
    if(eyeOn){ p.F(M.eye[3]); p.ell(11.1,-13.3,1.9,1.3); p.F(M.eye[2]); p.ell(11.2,-13.4,1.4,1); p.F(M.eye[1]); p.rect(11,-14,1.3,1); p.F(M.eye[0]); p.rect(11.5,-14,0.9,0.9);
      if(furia||P.warn||P.scream){ p.F(M.eye[2]); p.cap(P2(8.4,-13.6),P2(2-(P.warn||0)*3,-14.6),1.2,0.5); } }
    // pálpebra caída e sobrancelha triste
    p.F(Sk[2]); arc(p,10.6,-12.8,3.6,2.2,190,350,0.9,5);
    p.F(Sk[3]); p.cap(P2(7,-16.6),P2(12.6,-18.4),1.3,0.9);
    // nariz fino / narina / lábio roxo
    p.F(Sk[3]); p.rect(13.4,-10.4,1.4,0.9); p.F(Sk[2]); p.cap(P2(13.4,-15.6),P2(16.2,-10.8),0.7,0.6);
    if(j<=8){ p.F(M.mouth[1]); p.rect(11,-8.2,3.4,1); p.F(M.mouth[0]); p.rect(12,-7.2,2,0.8); p.F(Sk[3]); p.rect(10.4,-8.6,1,1.6); }
    p.F(Sk[2]); p.ell(2.6,-12,2.4,7);
    // lágrimas escorrendo da órbita (escuras; sangue brilhando na fúria), com gota pendurada no queixo
    const T=M.tear;
    const tear=(pts,w0)=>{ p.F(T[3]); taper(p,pts.map(([x,y])=>P2(x-0.5,y+0.3)),w0+0.9,w0+0.3); p.F(T[1]); taper(p,pts.map(([x,y])=>P2(x,y)),w0,w0*0.7); p.F(T[2]); taper(p,pts.slice(1).map(([x,y])=>P2(x-0.3,y)),w0*0.45,w0*0.35);
      const e=pts[pts.length-1]; p.F(T[1]); p.ell(e[0],e[1]+0.8,1.4,1.7); p.F(T[0]); p.rect(e[0]+0.1,e[1]+0.2,0.9,0.9); p.rect(pts[0][0]+0.3,pts[0][1]+0.4,0.8,1.6); };
    tear([[11.4,-11.8],[11.2,-9.4],...R([[11,-5.6],[10.6,-2]])],1.4);
    tear([[9.2,-11.4],[8.6,-9],...R([[8.2,-5.8],[7.6,-2.6]])],1.1);
    tear([[12.8,-12],[13.2,-10.6],[13.4,-9.4]],0.8);
    if(furia){ p.F(T[0]); const q=R([[9.4,1.6]])[0]; p.rect(q[0]-0.5,q[1],1.2,1.6); p.F(T[1]); p.rect(q[0]-0.5,q[1]+2.6,1.2,1.2); }
    else { p.F(T[1]); const q=R([[10.4,0.8]])[0]; p.ell(q[0],q[1]+0.8,1,1.3); }
    // cabelo repartido no meio, puxado sob a mantilha
    const HT=[[-10.5,-3],[-11,-18],[-6,-25.5],[0,-28.5],[6,-28.5],[11,-25.5],[12.6,-21],[9,-22],[4,-22.8],[1,-21],[-0.6,-17],[0,-11],[1.4,-4],[0,1],[-4,2],[-8,0]];
    p.F(M.hair[1]); p.poly(HT);
    p.F(M.hair[0]); arc(p,3,-14,9,9.5,215,290,0.9,5); p.cap(P2(-0.4,-16),P2(0.4,-6),0.8,0.7); p.F(M.hair[2]); arc(p,3,-14,7,7.5,170,240,0.9,5); p.cap(P2(-3,-15),P2(-2.6,-2),1,0.8); p.F(M.hair[3]); p.cap(P2(1.4,-18),P2(2.2,-4),0.8,0.8); p.cap(P2(-5.6,-14),P2(-5.4,0),0.9,0.8);
    // peineta (pente alto) e mantilha sobre a cabeça
    if(!P.veilFall){
      const C2=M.comb;
      const torn=furia;
      const V=torn?[[12,-23.5],[7,-28.6],[2,-31.4],[-3,-38.6],[-8,-34.5],[-10,-30],[-13,-25],[-15,-14],[-13,-8],[-15,-2],[-10,-3],[-9,-12],[-7,-20],[-2,-25],[5,-25.6],[10,-21.6]]
        :[[12,-23.5],[7,-29],[2,-32],[-3,-39],[-9,-35],[-13,-27],[-15,-14],[-14,-2],[-9.4,-1],[-9,-12],[-7,-21],[-2,-25.4],[5,-25.6],[10,-21.6]];
      p.F(M.lace[1]); p.poly(V);
      clipPoly(V); shadeIn(p,M.lace,qOf(M.lace),-2,-20,12,18,sk.ha,0,0); p.F(qOf(M.lace)[0]); p.ell(6,-27,4,1.6,-0.5); p.F(M.lace[0]); p.rect(4,-28.4,3,1); laceFill(p,M,-16,-40,13,0,2);
      p.F(M.lace[3]); band(p,[P2(10,-21.4),P2(5,-25.4),P2(-2,-25),P2(-7,-20.6),P2(-9,-12),P2(-9.2,-1)],1.4); CTX.restore();
      // festão de renda emoldurando o rosto
      p.F(M.lace[0]); [[10.6,-22.6],[7,-24.6],[3,-25.8],[-1.6,-24.6],[-5.4,-21.6],[-7.6,-17],[-8.6,-12],[-9,-6.6],[-9.2,-2.4]].forEach(([x,y])=>p.ell(x,y,1.3,1.2));
      p.F(M.lace[3]); [[9,-24],[5,-25.6],[1,-26.4],[-3.6,-24]].forEach(([x,y])=>p.rect(x-0.5,y-0.5,1,1));
      if(torn){ p.F(M.comb[2]); p.poly([[-11,-26],[-8,-33],[-6,-27]]); p.F(M.lace[3]); p.poly([[-12,-18],[-9,-21],[-8,-14],[-11,-11]]); }
      // rosas murchas presas na mantilha
      flower(p,M,-9,-27,1.05,1);
      flower(p,M,-13,-20,0.85,2);
    }
  }

  /* ---------------- FX ---------------- */
  function drawMistBase(p,M,sk,P){
    p.id(); const x0=sk.W.x-P.trail*34, g=GROUND-3, ph=P.ph, R=M.mist, tr=P.trail;
    // véus de névoa rasteira, achatados, com caudas pra trás
    p.F(R[3]); for(let k=-3;k<=3;k++){ const x=x0+k*11+S(ph+k)*3; p.ell(x,g,13-Math.abs(k)*1.5,2.6); }
    p.F(R[2]); for(let k=-3;k<=3;k++){ const x=x0+k*11+S(ph+k)*3+2; p.ell(x,g-1.2-Math.abs(S(ph+k*1.3)),9-Math.abs(k)*1.2,1.7); }
    p.F(R[2]); [[-44,0],[40,-1]].forEach(([dx,dy],k)=>{ const x=x0+dx+S(ph+k*2)*3; taper(p,[P2(x,g+dy),P2(x-10-tr*20,g+dy-2-S(ph+k)),P2(x-20-tr*30,g+dy-1)],3,0.6); });
    p.F(R[1]); for(let k=-2;k<=2;k++) p.ell(x0+k*12+S(ph+k)*3+3, g-2.2, 4-Math.abs(k)*0.5, 1);
    // fiapos subindo até a barra do vestido
    p.F(R[3]); for(let k=-2;k<=2;k++){ const x=x0+k*12+S(ph+k*2)*2; taper(p,[P2(x,g-1),P2(x+S(ph+k)*3-tr*6,g-5-3*S(ph+k*2)),P2(x+S(ph*1.3+k)*2-tr*10,g-10-P.fl*0.5)],2.4,0.5); }
    p.F(R[0]); [[-14,-3],[8,-3],[22,-2]].forEach(([dx,dy],k)=>p.rect(x0+dx+S(ph+k)*3,g+dy,2,1));
  }
  // chama em gota curva (base redonda, ponta que se enrola); camadas de fora pra dentro = degradê até o núcleo claro
  function flameShape(x,y,w,h,lean,ph,sc){ const L=[], Rr=[], n=9, hh=h*(0.35+0.65*sc), ww=w*sc;
    for(let j=0;j<=n;j++){ const u=j/n, half=ww*Math.pow(1-u,0.75)*Math.min(1,0.55+u*2.2)*(1+0.18*S(u*PI*2.6+ph)),
        cx=x+lean*u*u*(0.6+0.4*sc)+1.8*S(u*PI*2+ph)*u, yy=y-hh*u;
      L.push([cx-half,yy]); Rr.push([cx+half*0.92,yy]); }
    const bot=[]; for(let k=1;k<6;k++){ const a=PI*k/6; bot.push([x+C(a)*ww*0.95, y+S(a)*ww*0.5]); }
    return [...L, ...Rr.reverse(), ...bot]; }
  function drawAura(p,M,sk,P,st){
    p.id(); const g=skirtGeo(sk,Object.assign({},P,{flare:P.flare+0.3}),true), R=M.aura, Cc=M.core, ph=P.ph;
    const cx=sk.W.x, cy=sk.W.y+30, tc=sk.T(0,-22), hc=sk.H(1,-16);
    const ex=(f,o)=>g.poly.map(([x,y])=>[cx+(x-cx)*f, cy+(y-cy)*(1+(f-1)*0.4)-o]);
    // halo macio em duas camadas (fica atrás das línguas)
    p.F(R[3]); p.poly(ex(1.2,4)); p.ell(tc.x,tc.y,25,35,sk.a); p.circle(hc,24);
    p.F(R[2]); p.poly(ex(1.1,3)); p.ell(tc.x,tc.y,20,30,sk.a); p.circle(hc,19);
    // línguas de fogo em volta da silhueta, curvando pra fora e pra trás (vento)
    const base=[...ex(1.0,2).filter((_,k)=>k%4===0), A2(sk.T(-17,-12)), A2(sk.T(17,-14)), A2(sk.T(-15,-34)), A2(sk.T(15,-34)), A2(sk.H(-14,-16)), A2(sk.H(13,-20)), A2(sk.H(-5,-30))];
    const fl=base.map(([x,y],k)=>{ const out=(x-cx)/40, hgt=(36+14*S(ph*2.2+k*1.9))*st*(y<cy-40?0.8:1), w=(11+3*hs(k))*(0.8+0.25*st);
      return [x,y+4,w,hgt,out*6+S(ph*1.6+k)*5-P.trail*12-3,ph*2.4+k*1.3]; });
    const layer=(col,sc)=>{ p.F(col); fl.forEach(([x,y,w,h,ln,f])=>p.poly(flameShape(x,y,w,h,ln,f,sc))); };
    layer(R[3],1.15); layer(R[2],0.92); layer(R[1],0.7); layer(R[0],0.5); layer(Cc[2],0.36); layer(Cc[0],0.2);
    // faíscas e brasas subindo (algumas em vírgula curva)
    for(let k=0;k<12;k++){ const x=cx-50+hs(k)*100+S(ph+k)*4, y=sk.W.y+74-((hs(k+9)*140+ph*16)%160), r=1+hs(k+3)*1.4;
      p.F(k%3?R[1]:Cc[1]); p.ell(x,y,r,r*1.3); if(k%4===0){ p.F(R[2]); taper(p,[P2(x,y+r),P2(x-2+S(ph+k),y+r+4),P2(x-1,y+r+8)],r*1.2,0.4); } }
  }
  function drawAfter(p,M,sk,P){
    p.id(); const g=skirtGeo(sk,P,false), R=M.mist;
    const D=M.dress2;
    p.F(D[3]); p.poly(g.poly.map(([x,y])=>[x-32,y+2])); p.ell(sk.T(0,-20).x-36,sk.T(0,-20).y,10,18,sk.a);
    p.F(R[3]); p.poly(g.poly.map(([x,y])=>[x-20,y+1])); p.ell(sk.T(0,-20).x-22,sk.T(0,-20).y,12,22,sk.a); p.circle({x:sk.H(2,-14).x-24,y:sk.H(2,-14).y},14);
    p.F(R[1]); for(let k=0;k<7;k++){ const y=sk.W.y-46+k*15+S(k)*3, x=sk.W.x-30-hs(k)*24; p.cap(P2(Math.max(8,x-50-hs(k+3)*24),y),P2(x,y),0.8,2); }
  }
  function drawScream(p,M,sk,P){
    p.id(); const m=sk.mouth, a=sk.ha, st=P.scream;
    for(let k=0;k<3;k++){ const r=14+k*20+(st-1)*6, sp=rad(22+k*8), w=4-k*0.8, pts=[];
      for(let q=0;q<=8;q++){ const t=a-sp+2*sp*q/8; pts.push(P2(m.x+2+C(t)*r, m.y+S(t)*r)); }
      p.F(k===0?M.fx[0]:k===1?M.fx[1]:M.fx[2]); band(p,pts,w);
      p.F(M.fx[0]); [pts[0],pts[8]].forEach(q=>p.rect(q.x-1,q.y-1,2,2)); }
    p.F(M.fx[2]); for(let k=-2;k<=2;k++){ const t=a+k*rad(17), r=8+((st*5+k*3)%10); p.cap(P2(m.x+C(t)*r,m.y+S(t)*r),P2(m.x+C(t)*(r+7),m.y+S(t)*(r+7)),1.3,0.4); }
  }
  function drawClaw(p,M,sk,P){
    p.id(); const s=sk.shF, sm=P.smear, a0=sm>1?-75:-120, a1=sm>1?70:-15;
    for(let k=0;k<3;k++){ const r1=58+k*6, pts=[], pin=[];
      for(let q=0;q<=12;q++){ const u=q/12, t=rad(a0+(a1-a0)*u), th=3.2*S(PI*u)*(sm>1?1:0.7);
        pts.push([s.x+C(t)*r1, s.y+S(t)*r1]); pin.unshift([s.x+C(t)*(r1-th), s.y+S(t)*(r1-th)]); }
      p.F(k===1?M.fx[0]:M.fx[1]); p.poly([...pts,...pin]); }
    if(sm>1){ p.F(M.fx[2]); const t=rad(a1), q=P2(s.x+C(t)*70,s.y+S(t)*70); for(let k=0;k<5;k++){ const b=k/5*PI*2; p.cap(q,P2(q.x+C(b)*6,q.y+S(b)*6),1.4,0.4); } }
  }
  function drawWarn(p,M,sk,P){
    p.id(); const e=sk.eye, L=5+P.warn*2.5; p.F(M.eye[2]);
    p.cap(P2(e.x-L,e.y),P2(e.x+L,e.y),1.6,1.6); p.cap(P2(e.x,e.y-L*0.8),P2(e.x,e.y+L*0.8),1.4,1.4);
    p.F(M.eye[0]); p.rect(e.x-1.2,e.y-1.2,2.4,2.4);
  }
  function drawSigil(p,M,sk,P){
    p.id(); const x=sk.W.x, g=GROUND-3, s=P.sum, F=M.fx;
    const ring=(rx,ry,w,col,frac)=>{ const pts=[]; const n=Math.max(2,Math.round(28*frac)); for(let k=0;k<=n;k++){ const t=PI*0.5+k/28*PI*2; pts.push(P2(x+C(t)*rx,g+S(t)*ry)); } p.F(col); band(p,pts,w); };
    ring(68,9,2.6,F[2],s); ring(54,7,1.4,F[1],s);
    p.F(F[0]); for(let k=0;k<10;k++){ if(k/10>s) break; const t=k/10*PI*2+0.3; p.rect(x+C(t)*61-1,g+S(t)*8-1,2.2,2.2); }
    p.F(F[3]); [[-60,1],[64,0]].forEach(([dx,dy])=>p.ell(x+dx,g+dy,9*s,2.4*s));
  }
  function drawHands(p,M,sk,P){
    p.id(); const g=GROUND-1, Z=M.zskin, D=M.dirt;
    [[sk.W.x+66,1],[sk.W.x-62,-1]].forEach(([x,sg],k)=>{ const h=P.hands*26, top=P2(x+sg*3,g-h);
      p.F(D[2]); p.ell(x,g-1,10,3); p.F(D[1]); p.ell(x-1,g-2,7,2);
      if(h>2){ p.F(Z[1]); p.cap(P2(x,g),top,7,6); p.F(Z[2]); p.cap(P2(x-1.6,g),P2(top.x-1.4,top.y+2),2.4,2); p.F(Z[0]); p.rect(top.x+1,top.y+3,1.2,h*0.5);
        p.F(M.dress2[2]); p.poly([[x-4.4,g-h*0.35],[x+4.4,g-h*0.4],[x+5,g-h*0.2],[x+2,g-h*0.25],[x,g-h*0.08],[x-3,g-h*0.22]]);
        p.F(Z[1]); p.ell(top.x,top.y-2,4.6,3.8);
        [-40,-14,10,34].forEach((da,j)=>{ const a=rad(-90+da), b=P2(top.x+C(a)*4,top.y-2+S(a)*3.6), c=P2(b.x+C(a)*4.4,b.y+S(a)*4.4), d=P2(c.x+C(a+0.6*sg)*3,c.y+S(a+0.6*sg)*3);
          p.F(Z[1]); p.cap(b,c,2,1.8); p.cap(c,d,1.8,1.2); p.F(M.nail[2]); p.rect(d.x-0.6,d.y-0.6,1.2,1.2); });
        p.F(M.blood[1]); p.ell(top.x+1,top.y+1,1.6,1); }
      if(P.hands<1){ p.F(D[0]); for(let j=0;j<5;j++){ const a=-PI*0.5+(j-2)*0.5, r=6+P.hands*14+j; p.rect(x+C(a)*r,g-4+S(a)*r*0.8,2.2,2); } }
    });
  }
  function drawColumn(p,M,sk,P){
    p.id(); const x0=sk.W.x, g=GROUND-4, h=P.col*150, R=M.mist;
    for(let k=0;k*10<h;k++){ const y=g-k*10, x=x0+S(k*0.9+P.ph*2)*(8+k*0.35), r=13-k*0.3+(k<2?6:0);
      p.F(R[2]); p.ell(x,y,r,5.5); p.F(R[1]); p.ell(x+2,y-1.4,r*0.6,3); p.F(R[0]); p.rect(x+3,y-3,2,1); }
  }
  function drawGlints(p,M,sk){ p.id(); const e=sk.eye; p.F(M.eye[1]); p.ell(e.x,e.y,2.4,1.5); p.ell(e.x-5,e.y-0.6,1.6,1.1); p.F(M.eye[0]); p.rect(e.x-0.6,e.y-0.6,1.3,1.3); }
  function drawMistUp(p,M,sk,P){
    p.id(); const R=M.mist, n=Math.round(12*P.mistUp);
    for(let k=0;k<n;k++){ const x=sk.W.x-26+hs(k)*52+S(P.ph+k)*4, y=GROUND-18-hs(k+5)*120-(P.ph*6)%20, r=4+hs(k+2)*4, sg=k%2?1:-1;
      const pts=[P2(x,y),P2(x+sg*r*0.7,y-r*1.4),P2(x-sg*r*0.3,y-r*2.6),P2(x+sg*r*0.6,y-r*3.6)];
      p.F(R[2]); taper(p,pts,r*1.2,0.6); p.F(R[1]); taper(p,pts.slice(0,3).map(q=>P2(q.x+0.8,q.y-0.6)),r*0.55,0.5); p.F(R[0]); p.rect(x+1,y-r*0.6,1.4,1); }
  }
  function drawVeilFall(p,M,sk,P,form){
    p.id(); const v=Math.min(1,P.veilFall), R=M.lace, g=GROUND;
    const h0=sk.H(-4,-26), e=v*v*(3-2*v), x=lerp(h0,{x:sk.W.x-6,y:g-14},e).x, y=lerp(h0,{x:0,y:g-14},e).y;
    let poly;
    if(v<1){ const w=20+14*v, hh=26-10*v, ph=P.ph, tl=0.5-v*0.4; poly=[];
      const R2=(px,py)=>[x+(px-x)*C(tl)-(py-y)*S(tl), y+(px-x)*S(tl)+(py-y)*C(tl)];
      for(let k=0;k<=10;k++){ const u=k/5-1; poly.push(R2(x+u*w, y-hh*0.75*(1-u*u)+S(ph*2+u*3)*2)); }
      for(let k=10;k>=0;k--){ const u=k/5-1; poly.push(R2(x+u*w*1.05+S(ph+u*4)*2, y+hh*0.45-hh*0.55*(1-u*u)+(k%2?4:0))); } }
    else poly=[[x-44,g],[x-38,g-5],[x-28,g-9],[x-18,g-16],[x-8,g-21],[x+2,g-19],[x+10,g-14],[x+20,g-11],[x+32,g-6],[x+44,g]];
    p.F(R[1]); p.poly(poly);
    const xs=poly.map(q=>q[0]), ys=poly.map(q=>q[1]);
    clipPoly(poly); shadeIn(p,R,qOf(R),x,(Math.min(...ys)+Math.max(...ys))/2,(Math.max(...xs)-Math.min(...xs))/2,(Math.max(...ys)-Math.min(...ys))/2,0,0.6,0);
    laceFill(p,M,Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys),4);
    if(v>=1){ p.F(R[3]); band(p,[P2(x-20,g-2),P2(x-10,g-8),P2(x-2,g-4)],1); band(p,[P2(x+6,g-2),P2(x+14,g-6),P2(x+24,g-2)],1); }
    CTX.restore();
    p.F(R[0]); for(let k=0;k<9;k++){ const q=poly[Math.round(k/8*(poly.length-1))]; p.rect(q[0]-0.6,q[1]-0.6,1.3,1.3); }
    if(v>=1){
      // pente, rosa e terço caídos
      p.F(M.comb[1]); p.poly([[x-6,g-13],[x-2,g-19],[x+4,g-17],[x+3,g-13]]); p.F(M.comb[0]); p.rect(x-2,g-18,1.2,1.2);
      flower(p,M,x+12,g-9,1,1);
      const B=M.bead; for(let k=0;k<9;k++){ const bx=x-30+k*4.2+S(k)*1.5, by=g-1.6-Math.abs(S(k*0.8))*1.2; p.F(B[1]); p.ell(bx,by,1.5,1.4); p.F(B[0]); p.rect(bx-0.3,by-1,0.9,0.9); }
      p.F(M.silver[2]); p.rect(x+26,g-2.4,9,2); p.rect(x+29,g-5,2,7); p.F(M.silver[0]); p.rect(x+27,g-2.4,3,1);
    }
  }

  /* ---------------- dissolver (entrada / morte) ---------------- */
  const BY=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(v=>(v+0.5)/16);
  function dissolve(cv,P,M){
    const K=PIX.getK(), g=cv.getContext('2d'), W=cv.width, H=cv.height, im=PIX.pix(cv), d=im.data;
    const m1=PIX.hexRgb(M.mist[1]), m0=PIX.hexRgb(M.mist[0]);
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(!d[i+3]) continue;
      const b=BY[((y>>1)&3)*4+((x>>1)&3)];
      let dv; if(P.dis>0){ const h=Math.max(0,Math.min(1,(GROUND*K-y)/(175*K))); dv=P.dis*1.7-h*0.7; } else dv=1-P.fade;
      if(b<dv-0.14) d[i+3]=0; else if(b<dv){ const c=b<dv-0.07?m0:m1; d[i]=c[0]; d[i+1]=c[1]; d[i+2]=c[2]; } }
    g.putImageData(im,0,0);
  }

  /* ---------------- frame ---------------- */
  const cache=PIX.cache();
  function frame(form,anim,fi,step=5,Pov,pk){
    const K=PIX.getK(), key=(pk!=null?'#'+pk+'|'+form:form+anim+fi+step)+'@'+K; if(cache.has(key)) return cache.get(key);
    const P=Pov||poseOf(anim,fi), M=mats(form), sk=skeleton(P); QM=M;
    const furia=form==='furia';
    const parts=[], over=[];
    const add=(arr,o,fn)=>arr.push(Object.assign(o,{draw:(c,u)=>{ CTX=c; fn(mkPen(c,u)); }}));
    const FXO={noShade:true,noRim:true,smear:true};
    const auraSt=furia?Math.max(0.75,P.rage):P.rage;
    const body=P.dis<1.7 && P.fade>0;
    if(body){
      if(P.dashFx) add(parts,Object.assign({},FXO),p=>drawAfter(p,M,sk,P));
      if(P.sum>0) add(parts,Object.assign({},FXO),p=>drawSigil(p,M,sk,P));
      add(parts,Object.assign({},FXO),p=>drawMistBase(p,M,sk,P));
      add(parts,{back:true},p=>drawArm(p,M,sk.shB,sk.elB,sk.wrB,P,true));
      add(parts,{back:true},p=>drawHand(p,M,sk.wrB,sk.elB,P));
      add(parts,{back:true},p=>drawSkirt(p,M,sk,P,true));
      add(parts,{},p=>drawSkirt(p,M,sk,P,false));
      add(parts,{},p=>drawHairBack(p,M,sk,P));
      if(!P.veilFall) add(parts,{},p=>drawVeilBack(p,M,sk,P,form));
      add(parts,{},p=>drawTorso(p,M,sk,P));
      add(parts,{},p=>drawLock(p,M,sk,P));
      add(parts,{},p=>drawHead(p,M,sk,P,form));
      add(parts,{},p=>drawArm(p,M,sk.shF,sk.elF,sk.wrF,P,false));
      add(parts,{},p=>drawHand(p,M,sk.wrF,sk.elF,P));
      add(parts,{},p=>drawRosary(p,M,sk,P));
    }
    if(P.smear) add(over,Object.assign({},FXO),p=>drawClaw(p,M,sk,P));
    if(P.scream) add(over,Object.assign({},FXO),p=>drawScream(p,M,sk,P));
    if(P.warn && body) add(over,Object.assign({},FXO),p=>drawWarn(p,M,sk,P));
    if(P.hands>0) add(over,{noRim:true},p=>drawHands(p,M,sk,P));
    if(P.col>0) add(over,Object.assign({},FXO),p=>drawColumn(p,M,sk,P));
    if(P.eyes && P.fade<1) add(over,Object.assign({},FXO),p=>drawGlints(p,M,sk));
    if(P.veilFall>0) add(over,{},p=>drawVeilFall(p,M,sk,P,form));
    if(P.mistUp>0) add(over,Object.assign({},FXO),p=>drawMistUp(p,M,sk,P));
    const dims={FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,M,step,flash:P.flash,rim:RIM[form]};
    let cv;
    if(parts.length){ cv=compose(Object.assign({parts},dims)); if(step>=4 && !P.flash) heavyBase(cv); if(P.dis>0||P.fade<1) dissolve(cv,P,M); }
    // aura de fogo: camada própria por baixo, sem contorno escuro (chama com borda viva, como nas referências)
    if(body && auraSt>0 && !P.flash){ const aura=[]; add(aura,Object.assign({},FXO),p=>drawAura(p,M,sk,P,auraSt));
      const av=compose(Object.assign({parts:aura},dims,{step:3,flash:0,rim:null})); if(P.dis>0||P.fade<1) dissolve(av,P,M);
      if(cv){ av.getContext('2d').drawImage(cv,0,0); } cv=av; }
    if(!cv){ cv=document.createElement('canvas'); cv.width=dims.FW; cv.height=dims.FH; }
    if(over.length){ const ov=compose(Object.assign({parts:over},dims,{flash:0})); if(step>=4) heavyBase(ov); cv.getContext('2d').drawImage(ov,0,0); }
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._eye=sc(sk.eye); cv._mouth=sc(sk.mouth); cv._fist=sc(lp(sk.wrF,P.aFe,14)); cv._back=sc(sk.T(-14,-20)); cv._head=sc(sk.H(2,-30));
    cache.set(key,cv); return cv;
  }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame,framePose:function(form,anim,P,key){ if(cache.size>1400) cache.delete(cache.keys().next().value); return frame(form,anim,0,5,P,key); }};
})();
