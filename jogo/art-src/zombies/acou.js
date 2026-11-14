/* ACOU — fonte de arte (editável). Build: npm run art
   Chefe "O Açougueiro": açougueiro do Mercado de São José transformado. Saco de estopa costurado na cabeça,
   barriga enorme, avental de couro manchado, regata encardida, botas de borracha brancas, cutelo gigante
   e gancho de carne na corrente. */
const ACOU=(function(){
  const {rad,lp,lerp,P2,mkPen,compose}=PIX;
  const FW=452, FH=304, GROUND=294, AX=168;
  const RIM={normal:'#ffcfc4', furia:'#ff7a52'};

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
      skin:['#ffe4cc','#e2a090','#ac6c7c','#552e5a'],
      scar:['#ec9e96','#b45c64','#763349','#421d31'],
      tattoo:['#9cb2da','#5c70aa','#3c4c7c','#232d52'],
      tank:['#fff6dc','#d8c8a4','#a0908c','#54465e'],
      apron:['#e4a266','#a8623a','#66352c','#351a22'],
      blood:['#aa3c33','#76212b','#4b131f','#2b0913'],
      fresh:['#ff8c7c','#d63c46','#901b31','#500d1f'],
      burlap:['#f6d890','#c49656','#7e5a48','#402c38'],
      rope:['#eadaa9','#baa271','#806c4d','#4b3d31'],
      thread:['#7a6660','#4a3a3c','#2e2228','#1a1218'],
      steel:['#ffffff','#c6ccda','#808899','#454b5f'],
      iron:['#d0c7bf','#908781','#5f565d','#39313d'],
      wood:['#ca9262','#905b35','#5d3723','#351f17'],
      pants:['#8eb0b8','#4e7480','#2e4656','#1a2638'],
      boot:['#fdfdf4','#dcdcd4','#9a9aa8','#585870'],
      eye:['#fff6e2','#ff4c3c','#b2161c','#5c0912'],
      teeth:['#fff6cc','#e2ce8c','#aa9250','#67572a'],
      mouth:['#6c2636','#421526','#2b0d19','#1b0711'],
      fx:['#fffef2','#fff2aa','#ffc24c','#e27c24'],
      dust:['#eadecd','#c6b6a0','#968671','#605448'],
    };
    if(form==='furia'){
      m.skin=['#ffb8a4','#e6625a','#a42c3c','#5c1224'];
      m.scar=['#ffa090','#cc3c3c','#7c1622','#440912'];
      m.eye=['#ffffff','#ffe250','#ff7c20','#b2320e'];
      m.burlap=['#e8b880','#b47a50','#7e4a38','#48282a'];
      m.blood=['#e0503a','#a8282c','#6c1420','#3c0a14'];
      m.apron=['#cc7c50','#924630','#602a22','#361618'];
    }
    return finish(m,['fx','dust','eye']);
  }
  const NAMES={skin:'Pele',scar:'Costuras',tattoo:'Tatuagem',tank:'Regata encardida',apron:'Avental de couro',blood:'Sangue seco',fresh:'Sangue fresco',burlap:'Saco de estopa',rope:'Corda',steel:'Cutelo',iron:'Corrente/gancho',wood:'Cabo',pants:'Calça de lona',boot:'Bota de borracha',eye:'Olho'};

  /* ---------------- poses ---------------- */
  const S=Math.sin, C=Math.cos, PI=Math.PI;
  const REST={hx:0,drop:5,lean:6,head:2,aFs:36,aFe:96,cl:64,flip:1,aBs:-58,aBe:-36,lFh:30,lFk:-6,lBh:-14,lBk:-46,fF:0,fB:0,
    bel:0,hm:0,hk:0,sw:0,bf:0,flash:0,roar:0,smear:0,impact:0,stuck:0,spark:0,steam:0,dead:0,drop2:0,noCl:0};
  const ANIMS={
    idle:{nome:'Parado',n:8,dur:()=>175,pose:i=>{ const p=i/8*PI*2, s=S(p);
      return {lean:6+1.5*s, drop:5+1.5*S(p-0.5), bel:0.5+0.5*s, head:2+2.5*S(p-0.9), aFs:36+3*S(p-0.4), aFe:96+4*S(p-0.9), cl:64+3*S(p-1.2),
        aBs:-58+3*S(p+0.5), aBe:-36+4*S(p), sw:S(p-1.4)}; }},
    walk:{nome:'Andar (passo que treme)',n:8,stomp:[0,4],dur:()=>165,pose:i=>{ const p=i/8*PI*2+PI/2;
      const lFh=20+20*S(p), lBh=-10+20*S(p+PI);
      return {lFh, lFk:lFh-24*Math.max(0,C(p))-2, lBh, lBk:lBh-24*Math.max(0,C(p+PI))-6, fF:-6*C(p), fB:-6*C(p+PI),
        drop:6+3.5*C(2*(p-PI/2)), bel:0.5-0.5*C(2*(p-PI/2)-0.8), lean:7+2.5*S(2*p), head:2+2.5*S(2*p-1),
        aFs:36-6*S(p), aFe:96-6*S(p), cl:64+4*S(2*p), aBs:-50+14*S(p), aBe:-30+14*S(p), sw:S(p+1.2), hx:1.5*S(2*p)}; }},
    attack:{nome:'Cutelada em área',n:11,warn:[1,2,3],hit:5,vuln:[6,7,8],dur:i=>[160,180,220,200,60,120,200,200,200,180,160][i],pose:i=>[
      {aFs:70,aFe:150,cl:40,flip:1,lean:-2,head:0,lFh:18,lBh:-18,aBs:-20,aBe:-10,drop:6},
      {aFs:156,aFe:236,cl:24,flip:1,lean:-12,head:-12,hx:-4,lFh:18,lBh:-18,lBk:-24,roar:1,aBs:30,aBe:60,drop:-2},
      {aFs:166,aFe:250,cl:26,flip:1,lean:-16,head:-16,hx:-6,lFh:20,lBh:-20,lBk:-26,roar:1,aBs:40,aBe:70,drop:-2,bel:1},
      {aFs:168,aFe:254,cl:28,flip:1,lean:-17,head:-18,hx:-6,lFh:20,lBh:-20,lBk:-26,roar:1,aBs:44,aBe:74,drop:-1,bel:1},
      {aFs:120,aFe:140,cl:-10,flip:1,lean:16,head:8,hx:8,smear:1,lFh:30,lFk:10,lBh:-24,lBk:-32,aBs:-30,aBe:-20,drop:4},
      {aFs:66,aFe:58,cl:-6,flip:1,lean:30,head:14,hx:14,impact:1,stuck:1,lFh:36,lFk:14,lBh:-28,lBk:-36,aBs:40,aBe:40,drop:10},
      {aFs:64,aFe:56,cl:-6,flip:1,lean:32,head:20,hx:14,stuck:1,lFh:36,lFk:14,lBh:-28,lBk:-36,aBs:46,aBe:40,drop:11,steam:1},
      {aFs:60,aFe:52,cl:-4,flip:1,lean:28,head:10,hx:12,stuck:1,lFh:36,lFk:14,lBh:-30,lBk:-38,aBs:50,aBe:36,drop:9,steam:1},
      {aFs:58,aFe:48,cl:-2,flip:1,lean:22,head:4,hx:10,stuck:1,lFh:34,lFk:12,lBh:-32,lBk:-40,aBs:52,aBe:34,drop:7},
      {aFs:40,aFe:70,cl:-40,flip:1,lean:4,head:-2,hx:6,lFh:24,lBh:-20,lBk:-22,aBs:10,aBe:20,drop:3},
      {aFs:30,aFe:90,cl:60,flip:1,lean:4,head:2,hx:2,drop:4}][i]},
    hook:{nome:'Gancho de corrente',n:8,throwAt:3,dur:i=>[150,130,130,80,200,180,160,150][i],pose:i=>[
      {aBs:-30,aBe:-40,lean:-4,head:0,hm:0,bf:1},
      {aBs:150,aBe:170,lean:-8,head:-8,hm:1,hk:0.1,bf:1,lBh:-16},
      {aBs:160,aBe:190,lean:-10,head:-10,hm:1,hk:0.6,bf:1,lBh:-16},
      {aBs:84,aBe:86,lean:12,head:6,hm:2,hx:6,bf:1,lFh:22,lFk:6,lBh:-20,lBk:-26,smear:0},
      {aBs:86,aBe:88,lean:14,head:8,hm:2,hx:7,bf:1,lFh:22,lFk:6,lBh:-20,lBk:-26},
      {aBs:20,aBe:60,lean:-12,head:-4,hm:3,hx:0,bf:1,lFh:4,lFk:-4,lBh:-24,lBk:-30},
      {aBs:10,aBe:40,lean:-6,head:0,hm:4,bf:1},
      {aBs:-8,aBe:-4,lean:-3,head:4,hm:0,bf:0}][i]},
    rage:{nome:'Entrar em fúria',n:8,dur:i=>[180,140,140,200,240,240,240,200][i],pose:i=>[
      {lean:18,head:24,aFs:30,aFe:120,cl:-60,aBs:20,aBe:150,drop:6},
      {lean:20,head:28,aFs:34,aFe:126,cl:-60,aBs:24,aBe:156,drop:8,hx:-1,steam:1},
      {lean:20,head:26,aFs:30,aFe:122,cl:-60,aBs:20,aBe:152,drop:8,hx:1,steam:1},
      {lean:-10,head:-16,aFs:100,aFe:120,cl:-30,aBs:-80,aBe:-100,roar:1,drop:-2,bel:1},
      {lean:-18,head:-30,aFs:128,aFe:150,cl:-30,aBs:-118,aBe:-140,roar:1,hx:-4,lFh:20,lBh:-20,steam:1,bel:1},
      {lean:-20,head:-32,aFs:132,aFe:156,cl:-30,aBs:-122,aBe:-146,roar:1,hx:-5,lFh:20,lBh:-20,steam:1,bel:1},
      {lean:-18,head:-30,aFs:128,aFe:150,cl:-30,aBs:-118,aBe:-140,roar:1,hx:-4,lFh:20,lBh:-20,steam:1},
      {lean:0,head:-4,aFs:50,aFe:60,roar:0}][i]},
    hurt:{nome:'Dano',n:4,dur:i=>[80,110,130,160][i],pose:i=>[
      {lean:-12,head:-20,hx:-6,flash:1,aFs:-6,aFe:4,aBs:-34,aBe:-24,roar:1,bel:1},
      {lean:-8,head:-14,hx:-5,aFs:2,aFe:10,aBs:-26,aBe:-16,bel:0.6},
      {lean:-4,head:-2,hx:-2,bel:0.3},
      {}][i]},
    death:{nome:'Morte',n:12,dur:i=>[90,160,200,200,240,140,200,140,90,160,300,600][i],pose:i=>[
      {lean:-14,head:-24,hx:-6,flash:1,aFs:-10,aFe:0,aBs:-36,aBe:-26,roar:1,bel:1},
      {lean:-10,head:-30,hx:-8,aFs:120,aFe:150,cl:-30,aBs:-100,aBe:-130,roar:1},
      {lean:14,head:20,hx:-2,aFs:20,aFe:10,noCl:1,aBs:-10,aBe:-6,drop:4},
      {lean:20,head:26,hx:0,aFs:10,aFe:0,noCl:1,aBs:-6,aBe:-2,lFh:30,lFk:4,lBh:-50,lBk:40,fB:-50,drop:8},
      {lean:14,head:30,hx:2,aFs:6,aFe:0,noCl:1,aBs:-4,aBe:0,lFh:-30,lFk:60,lBh:-40,lBk:50,fF:-60,fB:-60},
      {lean:6,head:20,hx:2,aFs:20,aFe:30,noCl:1,aBs:10,aBe:20,lFh:-34,lFk:64,lBh:-44,lBk:54,fF:-64,fB:-64},
      {lean:-30,head:0,hx:6,aFs:120,aFe:140,noCl:1,aBs:110,aBe:130,lFh:20,lFk:70,lBh:10,lBk:60,fF:-40,fB:-40},
      {lean:-62,head:-6,hx:14,aFs:150,aFe:170,noCl:1,aBs:140,aBe:160,lFh:60,lFk:80,lBh:50,lBk:70},
      {lean:-90,head:-4,hx:26,aFs:176,aFe:196,noCl:1,aBs:166,aBe:186,lFh:90,lFk:84,lBh:84,lBk:76,impact:1,bel:1},
      {lean:-86,head:-6,hx:26,aFs:172,aFe:192,noCl:1,aBs:162,aBe:182,lFh:86,lFk:80,lBh:80,lBk:72,drop:-3},
      {lean:-90,head:-2,hx:26,aFs:176,aFe:196,noCl:1,aBs:166,aBe:186,lFh:90,lFk:84,lBh:84,lBk:76,dead:0.5},
      {lean:-90,head:-2,hx:26,aFs:176,aFe:196,noCl:1,aBs:166,aBe:186,lFh:90,lFk:84,lBh:84,lBk:76,dead:1}][i]},
    intro:{nome:'Entrada (WARNING)',n:10,dur:i=>[260,200,140,140,140,220,300,200,260,400][i],pose:i=>[
      {lean:10,head:24,aFs:10,aFe:0,aBs:-8,aBe:-4,hm:0,drop:2},
      {lean:2,head:2,aFs:40,aFe:90,cl:-10,aBs:40,aBe:120,hm:4,bf:1},
      {lean:0,head:6,aFs:70,aFe:130,cl:-30,aBs:44,aBe:126,hm:4,bf:1,spark:1},
      {lean:0,head:6,aFs:46,aFe:80,cl:-10,aBs:44,aBe:124,hm:4,bf:1},
      {lean:0,head:6,aFs:72,aFe:134,cl:-30,aBs:44,aBe:126,hm:4,bf:1,spark:1},
      {lean:-6,head:-4,aFs:100,aFe:96,cl:-14,aBs:-10,aBe:-6,hm:0},
      {lean:-6,head:-6,aFs:96,aFe:92,cl:-12,aBs:-12,aBe:-6,hm:0},
      {lean:-14,head:-26,aFs:120,aFe:150,cl:-30,aBs:-100,aBe:-130,roar:1,hm:0,bel:1,steam:1},
      {lean:-16,head:-28,aFs:124,aFe:154,cl:-30,aBs:-104,aBe:-134,roar:1,hm:0,bel:1,steam:1},
      {lean:6,head:2,aFs:36,aFe:96,cl:64,hm:0,drop:5}][i]},
  };
  // postura de chefe: tronco ~20° à frente, joelhos dobrados, base larga, cabeça baixa (vale pra tudo menos a morte deitada)
  function poseOf(anim,i){ const P=Object.assign({},REST,ANIMS[anim].pose(i)); if(anim!=='death'||i<3){ P.lean+=14; P.head-=10; P.lFk=Math.min(P.lFk,P.lFh-34); P.lBk=Math.min(P.lBk,P.lBh-30); P.drop+=2; } return P; }

  /* ---------------- esqueleto ---------------- */
  const THI=36, SHN=33, UPA=38, FOA=34;
  function bones(P,hy){
    const hip={x:AX+P.hx,y:hy};
    const hipF={x:hip.x+10,y:hip.y+2}, hipB={x:hip.x-10,y:hip.y};
    const kneeF=lp(hipF,P.lFh,THI), ankleF=lp(kneeF,P.lFk,SHN), kneeB=lp(hipB,P.lBh,THI), ankleB=lp(kneeB,P.lBk,SHN);
    const a=rad(P.lean), c=C(a), s=S(a);
    const T=(lx,ly)=>({x:hip.x+lx*c-ly*s, y:hip.y+lx*s+ly*c});
    const neck=T(40,-76), shF=T(12,-90), shB=T(-20,-92);
    const ha=rad(P.lean*0.6+P.head), hc=C(ha), hs=S(ha);
    const H=(lx,ly)=>({x:neck.x+lx*hc-ly*hs, y:neck.y+lx*hs+ly*hc});
    const elF=lp(shF,P.aFs,UPA), wrF=lp(elF,P.aFe,FOA), elB=lp(shB,P.aBs,UPA), wrB=lp(elB,P.aBe,FOA);
    const cAng=P.aFe+P.cl; const cDir=Math.atan2(C(rad(cAng)),S(rad(cAng)));
    return {hip,hipF,hipB,kneeF,ankleF,kneeB,ankleB,neck,shF,shB,elF,wrF,elB,wrB,a,ha,H,T,cDir};
  }
  function skeleton(P){
    const b0=bones(P,200);
    const foot=(an,fa)=>{ const r=rad(fa); return Math.max(an.y+11, an.y+11+S(r)*34, an.y-16*C(r)+11); };
    const cs=[foot(b0.ankleF,P.fF), foot(b0.ankleB,P.fB), b0.kneeF.y+12, b0.kneeB.y+12,
      b0.T(72,-42).y+2, b0.T(-30,-60).y+2, b0.T(-28,-20).y+2, b0.T(-20,-96).y+2, b0.H(-14,-20).y+4];
    const dy=GROUND-Math.max(...cs)+P.drop;
    const sk=bones(P,200+dy);
    sk.eye=sk.H(16,-22);
    return sk;
  }

  /* ---------------- utilidades ---------------- */
  const LIGHT={x:0.6,y:-0.8};
  let CTX=null;
  function limb(p,a,b){ const ang=Math.atan2(b.y-a.y,b.x-a.x); p.xf(ang,a.x,a.y); return {ang,L:Math.hypot(b.x-a.x,b.y-a.y)}; }
  function band(p,pts,w){ for(let k=0;k<pts.length-1;k++) p.cap(pts[k],pts[k+1],w,w); }
  function arc(p,cx,cy,rx,ry,a0,a1,w,n=8){ const pts=[]; for(let k=0;k<=n;k++){ const t=rad(a0+(a1-a0)*k/n); pts.push(P2(cx+C(t)*rx,cy+S(t)*ry)); } band(p,pts,w); }
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

  function ellPts(cx,cy,rx,ry,a0,a1,n){ const o=[]; for(let k=0;k<=n;k++){ const t=rad(a0+(a1-a0)*k/n); o.push([cx+C(t)*rx,cy+S(t)*ry]); } return o; }
  // mancha de sangue orgânica: aglomerado de gotas + escorridos (dir: 1 = escorre pra +y local)
  function stain(p,M,x,y,r,drips,seed=1,dir=1){
    const rnd=k=>{ const v=Math.sin(seed*12.9898+k*78.233)*43758.5453; return v-Math.floor(v); };
    p.F(M.blood[2]);
    for(let k=0;k<6;k++){ const a=rnd(k)*PI*2, d=rnd(k+9)*r*0.7; p.ell(x+C(a)*d,y+S(a)*d*0.7,r*(0.35+rnd(k+3)*0.35),r*(0.25+rnd(k+5)*0.3)); }
    for(let k=0;k<drips;k++){ const dx=(rnd(k+20)-0.5)*r*1.4, L=r*(0.8+rnd(k+30)*1.6); p.rect(x+dx-0.7,y,1.4,L*dir); p.ell(x+dx,y+L*dir,1.2,1.4); }
    p.F(M.blood[1]); for(let k=0;k<3;k++){ const a=rnd(k+40)*PI*2, d=rnd(k+50)*r*0.4; p.ell(x+C(a)*d,y+S(a)*d*0.6-r*0.1,r*0.3,r*0.2); }
    p.F(M.fresh[1]); p.rect(x+r*0.1,y-r*0.25,1.6,1);
  }
  function clipPoly(pts,fn){ CTX.save(); CTX.beginPath(); pts.forEach((q,i)=>i?CTX.lineTo(q[0],q[1]):CTX.moveTo(q[0],q[1])); CTX.closePath(); CTX.clip(); fn(); CTX.restore(); }
  function stitches(p,R,pts,step=4,len=3){ // linha de costura com pontos cruzados
    p.F(R[2]); band(p,pts.map(q=>P2(q[0],q[1])),1);
    p.F(R[1]);
    for(let s=0;s<pts.length-1;s++){ const a=pts[s], b=pts[s+1], L=Math.hypot(b[0]-a[0],b[1]-a[1]), n=Math.max(1,Math.floor(L/step)), nx=-(b[1]-a[1])/L, ny=(b[0]-a[0])/L;
      for(let k=0;k<n;k++){ const t=(k+0.5)/n, x=a[0]+(b[0]-a[0])*t, y=a[1]+(b[1]-a[1])*t; p.cap(P2(x-nx*len/2,y-ny*len/2),P2(x+nx*len/2,y+ny*len/2),0.9,0.9); } }
  }
  function chain(p,M,pts,sz=1){
    let alt=0;
    for(let s=0;s<pts.length-1;s++){ const a=pts[s], b=pts[s+1], L=Math.hypot(b.x-a.x,b.y-a.y), n=Math.max(1,Math.round(L/(5*sz))), ang=Math.atan2(b.y-a.y,b.x-a.x);
      for(let k=0;k<n;k++){ const q=lerp(a,b,(k+0.5)/n);
        if(alt%2===0){ p.F(M.iron[1]); p.ell(q.x,q.y,3.4*sz,2.5*sz,ang); p.F(M.iron[3]); p.ell(q.x,q.y,1.5*sz,0.8*sz,ang); p.F(M.iron[0]); p.ell(q.x-0.6*sz,q.y-1.4*sz,1.2*sz,0.6*sz,ang); }
        else { p.F(M.iron[2]); p.ell(q.x,q.y,3.2*sz,1.2*sz,ang); }
        alt++; } }
  }
  function bez(a,b,c,n){ const o=[]; for(let k=0;k<=n;k++){ const t=k/n, u=1-t; o.push({x:u*u*a.x+2*u*t*b.x+t*t*c.x, y:u*u*a.y+2*u*t*b.y+t*t*c.y}); } return o; }
  function drawHook(p,M,at,ang,sz=1){
    p.xf(ang,at.x,at.y); if(sz!==1) CTX.scale(sz,sz);
    p.F(M.iron[2]); p.ell(0,0,3.4,3.4); p.F(M.iron[3]); p.ell(0,0,1.6,1.6);
    p.F(M.iron[1]); band(p,[P2(3,0),P2(10,0),P2(16,3),P2(18,9),P2(15,14),P2(9,15),P2(6,12)],3.4);
    p.poly([[4,13],[8,9.4],[2.6,8.6]]);
    p.F(M.iron[0]); band(p,[P2(4,-1),P2(10,-1),P2(15,1.6)],1);
    p.F(M.iron[3]); band(p,[P2(17,10),P2(14,13.6),P2(9,14.6)],1);
    p.F(M.fresh[2]); p.ell(16,8,1.6,2.4); p.F(M.blood[1]); p.rect(15.4,9,1.4,4); p.F(M.fresh[1]); p.rect(8,12,2,1.4);
  }

  /* ---------------- braços ---------------- */
  function drawUpper(p,M,sh,el,front){
    const {ang,L}=limb(p,sh,el), R=M.skin;
    p.F(R[2]); p.cap(P2(0,0),P2(L,0),34,28);
    mass(p,R,L*0.5,-5,18,14,ang); mass(p,R,L*0.42,6,16,11,ang,0.6); mass(p,R,0,0,21,19,ang,0.8);
    p.F(R[3]); arc(p,0,0,17,15,60,130,1.4,4); p.cap(P2(L*0.3,1),P2(L*0.86,1.6),1.3,1);
    // pelos/sardas de carne podre
    p.F(R[2]); [[L*0.3,-8],[L*0.62,-9],[L*0.5,8],[L*0.2,6]].forEach(([x,y])=>p.rect(x,y,1.2,1.2));
    if(front){ // tatuagem antiga: coração com faca
      p.F(M.tattoo[1]); p.ell(L*0.5-2,-5,3,3); p.ell(L*0.5+2,-5,3,3); p.poly([[L*0.5-5.4,-4],[L*0.5+5.4,-4],[L*0.5,3]]);
      p.F(M.tattoo[2]); p.cap(P2(L*0.5-8,-10),P2(L*0.5+6,2),1.2,1); p.F(M.tattoo[0]); p.rect(L*0.5-3,-7,1.4,1);
    } else { p.F(M.scar[2]); p.cap(P2(L*0.3,-8),P2(L*0.75,-2),1.2,1.2); p.F(M.thread[1]); [0.36,0.48,0.6,0.7].forEach(t=>p.rect(L*t,-8+t*8,0.9,3)); }
  }
  function drawFore(p,M,el,wr,front,P){
    const {ang,L}=limb(p,el,wr), R=M.skin;
    p.F(R[2]); p.cap(P2(0,0),P2(L,0),29,25);
    mass(p,R,L*0.32,-3,16,13,ang); mass(p,R,L*0.52,5,12,9,ang,0.5);
    p.F(R[3]); p.cap(P2(L*0.2,2),P2(L*0.8,3),1.2,1);
    // costura grosseira no antebraço
    p.F(M.scar[2]); p.cap(P2(L*0.15,-6),P2(L*0.75,-3),1.6,1.4); p.F(M.scar[1]); p.cap(P2(L*0.15,-6.6),P2(L*0.75,-3.6),0.8,0.8);
    p.F(M.thread[1]); for(let k=0;k<5;k++){ const x=L*(0.2+k*0.12); p.cap(P2(x-1,-8.6+k*0.6),P2(x+1,-1.6+k*0.6),0.9,0.9); }
    // sangue respingado
    p.F(M.blood[1]); p.ell(L*0.72,6,3,2); p.rect(L*0.4,7,2,1.4); p.F(M.fresh[1]); p.rect(L*0.72,5,1.4,1);
    if(!front){ for(let k=0;k<3;k++){ const x=L*0.56+k*5; chain(p,M,[P2(x-3,-12),P2(x+3,12)],0.8); } }
  }
  function drawHand(p,M,wr,ang,grip){
    p.xf(ang,wr.x,wr.y); const R=M.skin;
    if(grip){
      p.F(R[2]); p.ell(5,0,13,12); mass(p,R,5,-1,12,10.5,ang,0.6);
      p.F(R[3]); [-5,0,5].forEach(y=>p.cap(P2(8,y),P2(15,y+0.6),1.2,1.2));
      p.F(R[0]); [-6,-1,4].forEach(y=>p.rect(13,y,2.4,1.2));
    } else { // mão livre aberta, dedos grossos abertos
      p.F(R[2]); p.ell(5,0,11,11);
      [[-26,13],[-8,15],[8,15],[24,13]].forEach(([a,L])=>{ const r=rad(a), e=P2(8+C(r)*L,S(r)*L); p.F(R[2]); p.cap(P2(8,S(r)*4),e,5.6,4.4); p.F(R[1]); p.cap(P2(8,S(r)*4-0.8),P2(e.x-0.6,e.y-0.8),3.4,2.6); p.F(R[3]); p.circle(e,1.2); });
      p.F(R[2]); p.cap(P2(2,-8),P2(10,-17),6,4.6); p.F(R[1]); p.cap(P2(2,-8.6),P2(9.4,-16.6),3.4,2.6);
      mass(p,R,4,0,10,9.4,ang,0.6);
    }
    p.F(M.blood[2]); p.ell(9,4,2.4,1.6);
  }


  /* ---------------- pernas ---------------- */
  function drawLeg(p,M,hip,knee,ankle,fa,front){
    let t=limb(p,hip,knee); const R=M.pants;
    p.F(R[2]); p.cap(P2(0,0),P2(t.L,0),30,24); mass(p,R,t.L*0.4,-2,16,12,t.ang,0.6);
    p.F(R[3]); band(p,[P2(t.L*0.7,-10),P2(t.L*0.78,-5),P2(t.L*0.74,0)],1.2); band(p,[P2(t.L*0.5,9),P2(t.L*0.66,10)],1.1);
    p.F(R[0]); p.cap(P2(t.L*0.15,-10),P2(t.L*0.5,-10.6),1.2,1);
    t=limb(p,knee,ankle);
    p.F(R[2]); p.cap(P2(-2,0),P2(t.L,0),24,22); p.F(R[1]); p.cap(P2(0,-3),P2(t.L*0.5,-4),14,12);
    p.F(R[3]); band(p,[P2(t.L*0.3,-10),P2(t.L*0.38,-4)],1.1);
    // bota de borracha alta (cano até a canela)
    const B=M.boot;
    p.F(B[2]); p.cap(P2(t.L*0.42,0),P2(t.L,0),25,24);
    p.F(B[1]); p.cap(P2(t.L*0.44,-3),P2(t.L*0.96,-4),16,14);
    p.F(B[0]); p.cap(P2(t.L*0.5,-8),P2(t.L*0.9,-9),2.4,2);
    p.F(B[3]); p.cap(P2(t.L*0.42,-12.5),P2(t.L*0.42,12.5),2.2,2.2);
    p.F(B[2]); band(p,[P2(t.L*0.62,6),P2(t.L*0.7,10)],1.1);
    p.F(M.blood[1]); [[0.55,-6,2.4,1.6],[0.7,4,3,2],[0.86,-2,2,1.4],[0.62,9,1.6,1.2]].forEach(([u,y,rx,ry])=>p.ell(t.L*u,y,rx,ry));
    p.F(M.blood[2]); p.rect(t.L*0.7,5,4,1);
    p.xf(rad(fa),ankle.x,ankle.y);
    p.F(B[2]); p.poly([[-13,-12],[12,-12],[22,-6],[30,0],[32,6],[31,11],[-15,11],[-16,-2]]);
    p.F(B[1]); p.poly([[-10,-11],[12,-11],[22,-5],[28,0],[20,2],[-8,0]]);
    p.F(B[0]); p.ell(20,-3,5,1.6); p.rect(-6,-10,10,1.4);
    p.F(B[3]); p.rect(-15,8,47,3.4); p.F(M.boot[2]); [-10,-1,8,17,25].forEach(x=>p.rect(x,9,3,1));
    p.F(M.blood[1]); [[4,4,3.4,2],[24,6,2.4,1.4],[-8,6,2,1.4]].forEach(([x,y,rx,ry])=>p.ell(x,y,rx,ry));
  }

  /* ---------------- tronco, avental ---------------- */
  function bellyR(P){ return [52+P.bel*1.6, 47+P.bel*1.6]; }
  const BC=[26,-34];
  function drawTorso(p,M,sk,P){
    p.xf(sk.a,sk.hip.x,sk.hip.y); const R=M.skin, A=sk.a, [bx,by]=bellyR(P);
    // costas, ombros (pele) e regata por cima
    p.F(R[2]); p.poly([[-24,4],[-30,-30],[-31,-64],[-28,-90],[-16,-104],[4,-110],[22,-104],[32,-92],[40,-74],[30,-40],[10,0]]);
    mass(p,R,-2,-88,30,18,A,0.9); mass(p,R,-14,-50,18,36,A,0,0.6);
    // regata encardida cobrindo tronco e barriga
    const T=M.tank;
    const tk=[[-26,-2],[-30,-30],[-31,-62],[-26,-84],[-14,-94],[-2,-90],[8,-96],[22,-94],[34,-88],[40,-80],[20,6],[-6,8]];
    p.F(T[1]); p.poly(tk); p.ell(BC[0],BC[1],bx,by);
    tk.splice(9,2,...ellPts(BC[0],BC[1],bx,by,-110,80,12));
    clipPoly(tk,()=>{ mass(p,T,BC[0],BC[1],bx,by,A,1);
      platePoly(p,T,[[-32,-92],[-8,-94],[-4,-40],[-8,-2],[-30,0]],A,0.3);
      platePoly(p,T,[[-22,-62],[-4,-70],[2,-48],[-14,-40]],A,0.6); platePoly(p,T,[[-24,-36],[-6,-40],[0,-16],[-20,-12]],A,0.6);
      p.F(T[2]); band(p,[P2(-20,-80),P2(-24,-50),P2(-20,-20)],1.4); band(p,[P2(30,-86),P2(40,-66)],1.2); band(p,[P2(4,-6),P2(20,-2),P2(36,-6)],1.2);
      // dobras de tensão no tecido
      [[[-10,-86],[0,-72],[6,-58]],[[-16,-76],[-8,-60],[-4,-44]],[[0,-30],[12,-22],[26,-20]],[[-20,-28],[-10,-16],[2,-10]]].forEach(f=>{
        p.F(T[0]); band(p,f.map(q=>P2(q[0]+1.6,q[1]-1.6)),1.2); p.F(T[2]); band(p,f.map(q=>P2(q[0],q[1])),1.8); });
      p.F(T[3]); band(p,ellPts(BC[0],BC[1],bx-2,by-2,70,150,6).map(q=>P2(q[0],q[1])),2);
      // manchas de suor, gordura e sangue
      p.F(T[2]); p.ell(-8,-70,7,5); p.ell(-18,-34,5,8);
      p.F(M.blood[2]); p.ell(4,-60,4,6); p.ell(-4,-30,3,4); p.F(M.blood[1]); p.ell(5,-61,2.4,3.4); p.rect(4,-56,1.4,10);
      p.F(T[3]); [[-10,-46],[-2,-20],[-22,-60]].forEach(([x,y])=>p.ell(x,y,2.4,1.8)); // furos
      p.F(T[2]); p.ell(-30,-48,14,60); p.F(T[3]); p.ell(-37,-48,8,56); p.F(T[2]); band(p,[P2(-6,-88),P2(-10,-60),P2(-6,-30),P2(2,-8)],1.4);
    });
    // barra da regata enrolada: barriga de baixo aparecendo
    p.F(R[2]); p.poly([[-4,4],[20,6],[52,-6],[48,8],[24,16],[2,14]]);
    p.F(R[1]); p.poly([[2,7],[22,9],[48,-2],[44,6],[22,13],[4,12]]);
    p.F(M.scar[2]); p.cap(P2(14,10),P2(30,12),1.2,1); p.F(M.thread[1]); [16,20,24,28].forEach(x=>p.rect(x,9.6,0.9,3));
    p.F(T[2]); p.cap(P2(-6,8),P2(44,5),2.6,2.2); p.F(T[0]); p.cap(P2(-4,6.6),P2(42,3.8),0.9,0.8);
    // gola da regata e pescoço
    p.F(T[2]); band(p,[P2(-14,-94),P2(-2,-90),P2(8,-96),P2(22,-94)],1.6);
    // cinto com ganchos e chaira pendurados
    p.F(M.apron[3]); p.poly([[-28,-6],[-6,-2],[-6,4],[-29,0]]);
    p.id(); drawHook(p,M,sk.T(-24,0),PI/2+sk.a-0.3,0.8);
  }
  // saia do avental pende na vertical da tela (gravidade), não gira com o tronco
  let HA=0; const hang=([x,y])=>y>10?[x+(y-10)*S(HA),10+(y-10)*C(HA)]:[x,y];
  function apronPoly(P,sk){ HA=sk.a;
    const sway=S(rad(sk.lF||0))*10, [bx,by]=bellyR(P);
    const front=ellPts(BC[0],BC[1],bx+1,by+1,-112,62,12);
    const bot=front[front.length-1];
    return [[6,-100],[20,-100],...front,...[[bot[0]-2+sway*0.6,54],[bot[0]-16+sway*0.5,58],[14+sway*0.3,56],[-2+sway*0.2,52]].map(hang),[-4,10],[0,-30],[6,-70]];
  }
  function drawApron(p,M,sk,P){
    p.xf(sk.a,sk.hip.x,sk.hip.y); const R=M.apron, A=sk.a, [bx,by]=bellyR(P);
    sk.lF=P.lFh;
    const ap=apronPoly(P,sk);
    p.F(R[1]); p.poly(ap);
    clipPoly(ap,()=>{
      mass(p,R,BC[0],BC[1],bx,by,A,1,0.7,1);
      // brilho do couro na curva da barriga e sombra interna
      p.F(R[0]); band(p,ellPts(BC[0],BC[1],bx-3,by-3,-70,20,8).map(q=>P2(q[0],q[1])),2.2);
      p.F(R[3]); band(p,ellPts(BC[0],BC[1],bx*0.55,by*0.6,110,200,6).map(q=>P2(q[0],q[1])),1.6);
      // saia do avental: painéis de couro (placas com sombra própria)
      [[[-4,6],[12,10],[13,62],[-4,62]],[[12,10],[30,13],[31,62],[13,62]],[[30,13],[48,11],[51,62],[31,62]],[[48,11],[68,6],[72,62],[51,62]]].forEach(pp=>platePoly(p,R,pp.map(hang),A,0.8));
      p.F(R[3]); [[12,10,13,62],[30,13,31,62],[48,11,51,62]].forEach(([a,b,c,d])=>{ const q=hang([c,d]); p.cap(P2(a,b),P2(q[0],q[1]),1.3,1.3); });
      // peitilho: placa do bolso/colete
      platePoly(p,R,[[8,-98],[22,-98],[32,-86],[36,-70],[12,-66],[6,-80]],A,0.8);
      // costura de borda
      p.F(R[0]); for(let k=0;k<14;k++){ const t=k/14, q=lerp(P2(10,-94),P2(54,-30),t); p.rect(q.x+ (t<0.5?0:-1),q.y,1.6,1); }
      // bolso com facas
      p.F(R[3]); p.poly([[20,-80],[38,-82],[42,-64],[24,-62]]); p.F(R[2]); p.poly([[21,-79],[37,-81],[40,-66],[25,-64]]);
      p.F(R[0]); p.rect(21,-80,16,1.2);
      // arranhões e cortes no couro
      p.F(R[3]); [[44,-50,52,-40],[30,-30,40,-24],[46,-20,50,-8],[10,26,16,40]].forEach(([a,b,c,d])=>p.cap(P2(a,b),P2(c,d),1,1));
      p.F(R[0]); [[45,-51,53,-41],[31,-31,41,-25]].forEach(([a,b,c,d])=>p.cap(P2(a+1,b-1),P2(c+1,d-1),0.7,0.7));
      // manchas de sangue (escorridas)
      stain(p,M,40,-50,8,3,1); stain(p,M,22,-14,7,2,2); stain(p,M,48,-24,5,2,3); stain(p,M,40,22,6,3,4); stain(p,M,14,36,4,1,5); stain(p,M,58,-40,4,2,6);
      // marca de mão ensanguentada
      p.F(M.blood[2]); p.ell(8,-46,4,4.6); [[4,-53],[7,-55],[10,-54],[13,-51]].forEach(([x,y])=>p.cap(P2(x,y),P2(x+0.4,y+4),1.8,1.8));
    });
    // facas no bolso
    p.F(M.wood[1]); [[24,-84],[30,-86]].forEach(([x,y])=>p.rect(x,y-6,3.4,8)); p.F(M.wood[0]); [[24,-84],[30,-86]].forEach(([x,y])=>p.rect(x,y-6,1,8));
    p.F(M.steel[2]); p.rect(35.4,-92,2,12); p.F(M.steel[0]); p.rect(35.4,-92,0.9,12); p.F(M.wood[2]); p.rect(34.6,-94,3.6,3);
    // rebites e alças
    p.F(M.apron[2]); band(p,[P2(8,-98),P2(-2,-106)],3); band(p,[P2(4,-24),P2(-20,-22),P2(-28,-18)],3);
    p.F(M.apron[1]); band(p,[P2(-28,-18),P2(-32,-6)],2.4); band(p,[P2(-28,-18),P2(-24,-4)],2.4);
    p.F(M.steel[1]); [[8,-96],[22,-96],[4,-22]].forEach(([x,y])=>p.circle(P2(x,y),1.7)); p.F(M.steel[0]); [[8,-96],[22,-96],[4,-22]].forEach(([x,y])=>p.rect(x-0.4,y-1.4,1,1));
  }
  function drawPelvis(p,M,sk,P){
    p.xf(sk.a,sk.hip.x,sk.hip.y); const R=M.pants;
    p.F(R[2]); p.poly([[-28,-6],[30,-6],[34,10],[16,20],[-14,20],[-30,10]]);
    p.F(R[1]); p.poly([[-20,-6],[28,-6],[30,6],[-18,8]]);
    p.F(M.apron[3]); p.poly([[-29,-9],[30,-9],[31,-2],[-30,-2]]); p.F(M.apron[2]); p.rect(-28,-9,58,1.2);
  }

  /* ---------------- cabeça: saco de estopa ---------------- */
  function drawHead(p,M,sk,P,form){
    p.xf(sk.ha,sk.neck.x,sk.neck.y); CTX.scale(1.12,1.12); const B=M.burlap, A=sk.ha;
    // pescoço
    p.F(M.skin[2]); p.ell(0,4,13,9);
    // franja do saco sobre os ombros
    p.F(B[2]); p.poly([[-16,2],[18,0],[24,8],[18,10],[14,6],[10,12],[4,7],[-2,12],[-8,6],[-14,11],[-20,6]]);
    // saco
    const sack=[[-14,0],[-17,-18],[-16,-32],[-22,-44],[-10,-42],[2,-44],[14,-40],[22,-30],[25,-16],[22,-2]];
    p.F(B[1]); p.poly(sack);
    clipPoly(sack,()=>{ mass(p,B,4,-22,22,24,A,0.9,0.74);
      // trama da estopa
      p.F(B[2]); for(let y=-40;y<0;y+=4) for(let x=-16;x<26;x+=6) p.rect(x+((y/4)&1)*3,y,3.2,1);
      p.F(B[0]); for(let y=-34;y<-14;y+=4) for(let x=8;x<22;x+=6) p.rect(x+((y/4)&1)*3,y-1,2.4,0.9);
      // remendo costurado
      p.F(B[3]); p.poly([[-12,-30],[-2,-32],[0,-20],[-11,-18]]); p.F(B[2]); p.poly([[-11,-29],[-3,-31],[-1,-21],[-10,-19]]);
    });
    stitches(p,M.thread,[[-12,-30],[-2,-32],[0,-20],[-11,-18],[-12,-30]],3,2.4);
    stitches(p,M.thread,[[-14,-41],[-4,-30],[2,-12],[2,0]],3.4,2.6);
    // ponta do saco
    p.F(B[2]); p.poly([[-16,-36],[-28,-43],[-20,-45],[-10,-41]]); p.F(B[1]); p.poly([[-20,-45],[-10,-41],[-14,-39]]);
    const torn=form==='furia', glow=1-P.dead;
    if(torn){
      // saco rasgado: rosto costurado à mostra
      p.F(M.skin[2]); p.poly([[10,-18],[24,-16],[25,-4],[22,0],[8,-2]]);
      p.F(M.skin[1]); p.poly([[12,-17],[23,-15],[23,-6],[12,-6]]);
      p.F(M.mouth[2]); p.poly([[12,-9],[24,-10],[24,-3],[12,-3]]);
      p.F(M.teeth[1]); for(let k=0;k<5;k++){ p.rect(12.4+k*2.3,-9.6,1.6,2.4); p.rect(13+k*2.3,-5.4,1.6,2.4); }
      p.F(M.thread[1]); [13,17,21].forEach(x=>p.cap(P2(x,-12),P2(x+1,-1),0.9,0.9));
      p.F(B[3]); band(p,[P2(9,-19),P2(12,-14),P2(9,-9),P2(12,-4),P2(8,0)],1.6);
    } else {
      // boca: rasgo serrilhado
      p.F(M.mouth[2]); p.poly([[11,-9],[24,-10],[24,-4],[20,-5.4],[16,-4],[12,-5]]);
      p.F(M.teeth[1]); [12.4,15,17.6,20.2].forEach((x,k)=>p.poly([[x,-9.4],[x+2,-9.6],[x+1,-6.6-(k%2)]]));
      p.F(M.thread[1]); [12,15.4,18.8,22.2].forEach(x=>p.cap(P2(x,-11.4),P2(x+0.6,-3),0.9,0.9));
      if(P.roar>0.5){ p.F(M.mouth[2]); p.poly([[12,-6],[24,-6],[23,0],[13,0]]); p.F(M.teeth[1]); [13,16,19,22].forEach(x=>p.poly([[x,0],[x+2,0],[x+1,-3]])); }
    }
    // furo do olho com brilho
    p.F(M.mouth[3]); p.ell(16,-22,4.4,3.6);
    if(glow>0.3){ p.F(M.eye[2]); p.ell(16.4,-22,3.2,2.6); p.F(M.eye[1]); p.ell(16.8,-22.2,2,1.7); p.F(M.eye[0]); p.rect(16.6,-23,1.4,1.2);
      if(torn||P.roar>0.5){ p.F(M.eye[2]); p.rect(9,-22.6,5,1); } }
    stitches(p,M.thread,[[11,-25],[21,-25.6]],2.6,2);
    // olho de trás costurado em X
    p.F(M.thread[1]); p.cap(P2(21.4,-25),P2(24.4,-20),1,1); p.cap(P2(24.4,-25),P2(21.4,-20),1,1);
    if(torn&&glow>0.3){ p.F(M.eye[1]); p.ell(23,-22.4,1.4,1.2); }
    // escorridos de sangue no saco
    p.F(M.blood[2]); p.poly([[12,-4],[20,-4],[19,2],[17,0],[16,6],[14,0]]); p.F(M.blood[1]); p.rect(15.6,-3,1.4,7);
    p.F(M.blood[2]); p.ell(4,-34,3.4,2.4); p.rect(4,-34,1.2,6);
    // corda amarrada no pescoço
    const Rp=M.rope; p.F(Rp[2]); p.poly([[-15,-4],[22,-5],[22,1],[-15,2]]);
    p.F(Rp[1]); for(let k=0;k<9;k++){ const x=-14+k*4.2; p.poly([[x,-4],[x+3,-4],[x+1.6,1.6],[x-1.4,1.6]]); }
    p.F(Rp[0]); for(let k=0;k<9;k++) p.rect(-13+k*4.2,-3.6,1.4,0.9);
    p.F(Rp[1]); band(p,[P2(-14,-1),P2(-20,6),P2(-18,14)],2.2); band(p,[P2(-14,-1),P2(-24,4),P2(-26,12)],2); p.F(Rp[3]); p.rect(-19,13,2,1.4);
  }

  /* ---------------- cutelo ---------------- */
  function drawCleaver(p,M,sk,P){
    if(P.noCl>0.5) return;
    const w=sk.wrF; p.xf(sk.cDir,w.x,w.y); const E=P.flip>0.5?1:-1, Y=y=>y*E;
    const St=M.steel;
    p.F(M.wood[2]); p.cap(P2(-12,0),P2(14,0),7.6,7.6); p.F(M.wood[1]); p.cap(P2(-11,Y(-1)),P2(13,Y(-1)),4.6,4.6);
    p.F(M.wood[0]); p.rect(-10,Y(-2.6)-0.5,20,1); p.F(M.wood[3]); [-6,2,8].forEach(x=>p.rect(x,-3.6,1,7.2));
    p.F(St[1]); [-8,5].forEach(x=>p.circle(P2(x,0),1.5)); p.F(St[0]); [-8,5].forEach(x=>p.rect(x-0.6,-1,1,1));
    p.F(St[2]); p.rect(13,-5,5,10);
    const bl=[[17,Y(-8)],[86,Y(-10)],[92,Y(-4)],[92,Y(36)],[84,Y(42)],[17,Y(32)]];
    p.F(St[1]); p.poly(bl);
    // chanfro do fio (claro) e lombada (escura) / face com reflexo
    p.F(St[2]); p.poly([[17,Y(-8)],[88,Y(-10)],[94,Y(-4)],[94,Y(2)],[17,Y(-2)]]);
    p.F(St[0]); p.poly([[17,Y(26)],[94,Y(30)],[94,Y(36)],[86,Y(42)],[17,Y(32)]]);
    p.F(St[3]); p.poly([[17,Y(24)],[94,Y(28)],[94,Y(30)],[17,Y(26)]]);
    p.F(St[0]); p.poly([[30,Y(2)],[40,Y(2)],[26,Y(22)],[20,Y(22)]]); p.poly([[48,Y(1)],[52,Y(1)],[40,Y(20)],[37,Y(20)]]);
    p.F(St[3]); p.circle(P2(84,Y(4)),3.8); p.F(St[2]); p.circle(P2(84.8,Y(3.2)),2);
    // dentes/lascas no fio
    p.F(St[3]); [[34,37],[58,39.4],[76,40.6]].forEach(([x,y])=>p.poly([[x-3,Y(y)],[x+3,Y(y+0.4)],[x,Y(y-5)]]));
    // arranhões e ferrugem
    p.F(St[2]); [[24,6,40,10],[56,8,70,4],[60,16,80,18]].forEach(([a,b,c,d])=>p.cap(P2(a,Y(b)),P2(c,Y(d)),0.9,0.9));
    p.F(M.wood[2]); [[70,2],[64,-6],[90,12]].forEach(([x,y])=>p.ell(x,Y(y),2,1.4));
    // sangue no fio
    stain(p,M,40,Y(28),5,0,7); stain(p,M,70,Y(31),4,0,8); stain(p,M,56,Y(30),3,0,9);
    p.F(M.blood[2]); [[44,26],[52,28],[74,30]].forEach(([x,y],k)=>{ const L=4+k*3; p.rect(x,E>0?Y(y)-L:Y(y),1.3,L); });
  }
  function drawSmear(p,M,sk){
    p.id(); const s=sk.shF, r1=122, r0=86; const a0=200, a1=70, pts=[];
    for(let k=0;k<=14;k++){ const a=rad(a0+(a1-a0)*k/14); pts.push([s.x+S(a)*r1, s.y+C(a)*r1]); }
    for(let k=14;k>=0;k--){ const a=rad(a0+(a1-a0)*k/14), rr=r0+(r1-r0)*(1-k/14)*0.6; pts.push([s.x+S(a)*rr, s.y+C(a)*rr]); }
    p.F(M.fx[0]); p.poly(pts);
    const pts2=[]; for(let k=0;k<=14;k++){ const a=rad(a0+(a1-a0)*k/14); pts2.push([s.x+S(a)*(r1-6), s.y+C(a)*(r1-6)]); }
    for(let k=14;k>=0;k--){ const a=rad(a0+(a1-a0)*k/14); pts2.push([s.x+S(a)*(r1-12), s.y+C(a)*(r1-12)]); }
    p.F(M.fx[1]); p.poly(pts2);
  }

  /* ---------------- corrente / gancho ---------------- */
  function drawChain(p,M,sk,P){
    p.id(); const w=sk.wrB, m=Math.round(P.hm), sw=P.sw;
    if(m===0){ const g={x:Math.max(48,w.x-8+sw*3),y:GROUND-4}, e={x:Math.max(40,w.x-44+sw*2),y:GROUND-3}; if(e.x>g.x-10) e.x=g.x+30;
      chain(p,M,bez(w,{x:w.x-2+sw*4,y:(w.y+GROUND)/2+10},g,6),0.95); chain(p,M,[g,e],0.95); drawHook(p,M,{x:e.x,y:e.y-14},PI*0.9,1.15); }
    else if(m===1){ const a=P.hk*PI*2, tip={x:w.x+C(a)*40, y:w.y-12+S(a)*12};
      chain(p,M,bez(w,{x:(w.x+tip.x)/2,y:w.y-18},tip,5),0.95); drawHook(p,M,tip,a+PI/2,1.15);
      p.id(); p.F(M.fx[1]); arc(p,w.x,w.y-12,42,13,a*180/PI+40,a*180/PI+300,1.2,14); }
    else if(m===2){ const tip={x:w.x+64,y:w.y+2}; chain(p,M,bez(w,{x:w.x+32,y:w.y+8},tip,5),0.95); }
    else if(m===3){ const tip={x:w.x+26,y:w.y+18}; chain(p,M,bez(w,{x:w.x+20,y:w.y+2},tip,4),0.95); drawHook(p,M,tip,0.6,1.15); }
    else { const g={x:w.x-2,y:GROUND-4}; chain(p,M,bez(w,{x:w.x+8,y:(w.y+GROUND)/2},g,6),0.95); drawHook(p,M,{x:w.x-4,y:w.y-16},-0.4,1.15); }
  }

  /* ---------------- FX ---------------- */
  function drawImpact(p,M,x){
    p.id(); const g=GROUND;
    p.F(M.dust[1]); [[-30,-7,14,8],[30,-8,15,9],[-10,-14,12,9],[14,-16,11,8],[0,-4,28,7]].forEach(([dx,dy,rx,ry])=>p.ell(x+dx,g+dy,rx,ry));
    p.F(M.dust[0]); [[-28,-11,7,3],[26,-13,7,3],[-8,-19,6,3]].forEach(([dx,dy,rx,ry])=>p.ell(x+dx,g+dy,rx,ry));
    p.F(M.dust[3]); [[-46,-30],[38,-34],[-18,-40],[18,-26],[48,-16],[-50,-14]].forEach(([dx,dy],k)=>{ const s=2+(k%3); p.poly([[x+dx-s,g+dy],[x+dx,g+dy-s],[x+dx+s,g+dy+s*0.4],[x+dx,g+dy+s]]); });
    p.F(M.fx[1]); [[-44,-4,-64,-2],[44,-4,66,-1],[-22,-16,-34,-30],[24,-18,36,-32],[0,-20,2,-38]].forEach(([a,b,c,d])=>p.cap(P2(x+a,g+b),P2(x+c,g+d),2.2,0.6));
  }
  function drawSpark(p,M,at){
    p.id(); p.F(M.fx[2]); for(let k=0;k<7;k++){ const a=-0.3-k*0.4, r=10+(k%3)*6; p.cap(at,P2(at.x+C(a)*r,at.y+S(a)*r),1.4,0.4); }
    p.F(M.fx[0]); p.circle(at,3);
  }
  function drawSteam(p,M,sk,P){
    p.id(); const c=sk.H(4,-46);
    p.F(M.dust[0]); [[-6,0,5,4],[6,-8,6,4.4],[-4,-16,4,3.4],[10,-22,3,2.4]].forEach(([dx,dy,rx,ry])=>p.ell(c.x+dx,c.y+dy,rx,ry));
    p.F(M.dust[1]); [[-6,2,3,2],[7,-6,3,2]].forEach(([dx,dy,rx,ry])=>p.ell(c.x+dx,c.y+dy,rx,ry));
  }

  /* ---------------- frame ---------------- */
  const cache=PIX.cache();
  function frame(form,anim,fi,step=5,Pov,pk){
    const K=PIX.getK(), key=(pk!=null?'#'+pk+'|'+form:form+anim+fi+step)+'@'+K; if(cache.has(key)) return cache.get(key);
    const P=Pov||poseOf(anim,fi), M=mats(form), sk=skeleton(P); QM=M;
    const angF=Math.atan2(sk.wrF.y-sk.elF.y,sk.wrF.x-sk.elF.x), angB=Math.atan2(sk.wrB.y-sk.elB.y,sk.wrB.x-sk.elB.x);
    const parts=[]; const add=(o,fn)=>parts.push(Object.assign(o,{draw:(c,u)=>{ CTX=c; fn(mkPen(c,u)); }}));
    const front=P.bf>0.5;
    const backArm=()=>{ add({back:!front},p=>drawUpper(p,M,sk.shB,sk.elB,false)); add({back:!front},p=>drawFore(p,M,sk.elB,sk.wrB,false,P)); add({back:!front},p=>drawHand(p,M,sk.wrB,angB,Math.round(P.hm)>=1&&Math.round(P.hm)!==2)); };
    add({back:true},p=>drawChain(p,M,sk,P));
    if(!front) backArm();
    add({back:true},p=>drawLeg(p,M,sk.hipB,sk.kneeB,sk.ankleB,P.fB,false));
    add({},p=>drawPelvis(p,M,sk,P));
    add({},p=>drawLeg(p,M,sk.hipF,sk.kneeF,sk.ankleF,P.fF,true));
    add({},p=>drawTorso(p,M,sk,P));
    add({},p=>drawApron(p,M,sk,P));
    if(front){ if(Math.round(P.hm)>=2) parts.push(Object.assign({}, {draw:(c,u)=>{ CTX=c; drawChain(mkPen(c,u),M,sk,P); }})); backArm(); }
    if(P.noCl>0.5 && anim==='death') add({},p=>{ p.id(); const at={x:sk.hip.x+70,y:GROUND-30}; const Pc=Object.assign({},P,{noCl:0,flip:1}); drawCleaver(p,M,{wrF:at,cDir:-PI/2-0.25},Pc); });
    if(P.smear) add({noShade:true,smear:true,noRim:true},p=>drawSmear(p,M,sk));
    add({},p=>drawCleaver(p,M,sk,P));
    add({},p=>drawUpper(p,M,sk.shF,sk.elF,true));
    add({},p=>drawHead(p,M,sk,P,form));
    add({},p=>drawFore(p,M,sk.elF,sk.wrF,true,P));
    add({},p=>drawHand(p,M,sk.wrF,angF,true));
    if(P.impact){ const bx=sk.wrF.x+C(sk.cDir)*60; add({noShade:true,smear:true,noRim:true},p=>drawImpact(p,M,anim==='death'?sk.hip.x-40:bx)); }
    if(P.spark) add({noShade:true,noRim:true},p=>drawSpark(p,M,lerp(sk.wrB,sk.wrF,0.5)));
    if(P.steam>0.5) add({noShade:true,noRim:true},p=>drawSteam(p,M,sk,P));
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM[form]});
    if(step>=4 && !P.flash) heavyBase(cv);
    const sc=q=>({x:q.x*K,y:q.y*K});
    const bladeTip={x:sk.wrF.x+C(sk.cDir)*86, y:sk.wrF.y+S(sk.cDir)*86};
    cv._eye=sc(sk.eye); cv._blade=sc(bladeTip); cv._back=sc(sk.T(-20,-50)); cv._head=sc(sk.H(4,-48)); cv._hook=sc({x:sk.wrB.x+64,y:sk.wrB.y+2});
    cache.set(key,cv); return cv;
  }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame,framePose:function(form,anim,P,key){ if(cache.size>1400) cache.delete(cache.keys().next().value); return frame(form,anim,0,5,P,key); }};
})();
