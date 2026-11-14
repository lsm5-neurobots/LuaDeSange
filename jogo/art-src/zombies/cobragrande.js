/* COBRAGRANDE — fonte de arte (editável). Build: npm run art
   Chefe da Amazônia "A Cobra-Grande" (Boiúna da lenda ribeirinha, tratada como monstro de rio): sucuri-verde gigante
   (Eunectes murinus) que mora no remanso da várzea e sobe quando a Lua de Sangue nasce. Anatomia das fotos: cabeça
   longa, achatada e mais funda atrás (músculos da mandíbula), olho e narina no alto, faixa negra pós-ocular com a
   faixa laranja por cima e o lábio amarelo por baixo, manchas ovais negras em duas fileiras sobre verde-oliva,
   ocelos de miolo creme nas laterais, ventre amarelo-sujo com escamas ventrais largas, corpo grosso como tronco.
   Corrupção: escamas arrancadas com carne e costelas à mostra, musgo e fungo verde brilhando nas costas, aguapé e
   lodo pendurados, espinhos de osso na espinha, arpão quebrado e cabo de barco preso. Fúria: pele rachada com
   brilho vermelho, espinhos maiores e os olhos viram duas luas.
   Composição: a parte visível é o pescoço erguido em S saindo da água + 2 espiras em arco (corcovas) + a cauda;
   cada trecho entra na poça de remanso (corte na linha d'água coberto por espuma). Frente pra +x.
   Adereços: espiras da constrição em volta do lutador (frente/trás), rastro de bolhas do mergulho e o círculo do
   Olhar de Lua. */
const COBRAGRANDE=(function(){
  const {rad,lerp,P2}=PIX;
  const K_=BOSSKIT, {S,C,PI,mass,platePoly,clipPoly,band,bandA,arc,rnd,rope,sparks,smear}=K_;
  const FW=640, FH=436, GROUND=408, AX=268;
  const RIM={normal:'#c6ecff', furia:'#ffa08e'};
  const STEP=3, SINKD=330;

  function mats0(form){
    const m={
      scale:['#a4b452','#5d6e2c','#323f2a','#151b24'],
      side:['#c9bb5e','#878038','#4a4a2e','#24232a'],
      belly:['#f6df8a','#cdb064','#8a7242','#433830'],
      spot:['#4c5628','#1f2712','#131a0c','#0a0b10'],
      ocel:['#fff1b4','#dcc37a','#a08a4a','#5a4a2a'],
      stripe:['#ffd27c','#de8a36','#8e4a22','#42200e'],
      flesh:['#e06a6a','#962838','#5a142a','#2a0816'],
      bone:['#fff4d8','#d8caa6','#988668','#4e4036'],
      mouth:['#e8788a','#9c3048','#5c1630','#2a0818'],
      teeth:['#ffffff','#ece4cc','#aa9c80','#524636'],
      tongue:['#7a6a8a','#2e2234','#18101e','#08060c'],
      moss:['#a2b84c','#5c7232','#2e4426','#16201c'],
      leaf:['#c0e874','#5ea842','#2e6c36','#143a26'],
      flower:['#f4dcff','#b494e4','#7252aa','#3a2a68'],
      mud:['#a88664','#5e4832','#3a2c22','#1c1612'],
      water:['#6a8a88','#34463f','#22261f','#100e10'],
      rope:['#e6d6ac','#ac9462','#6c583a','#3a2e22'],
      iron:['#d6dae2','#8c909c','#4e5262','#262836'],
      wood:['#cc9a5c','#8c6036','#563a20','#2c1c12'],
      blood:['#9c3a36','#6e222c','#46141e','#280a12'],
      acid:['#e8ff9a','#a6f03a','#5aa82a','#2a5a1a'],
      eye:['#ffffff','#fff6a8','#e8d84a','#8a7a12'],
      glow:['#ffffff','#ffc8a8','#ff5a3a','#a01a14'],
      fungus:['#f6ffb8','#a6f03a','#5aa82a','#2a5a1a'],
      foam:['#ffffff','#e2ecea','#a8bab8','#62767a'],
      splash:['#ffffff','#cfe4e6','#86a2a8','#46606a'],
      fx:['#fffef2','#fff2aa','#ffc24c','#e27c24'],
    };
    if(form==='furia'){
      m.scale=['#b0b45c','#647030','#3a3c2e','#1e1824'];
      m.side=['#e0c070','#a08a3c','#625030','#30262a'];
      m.spot=['#542e24','#24160e','#160c0a','#0c0610'];
      m.eye=['#ffffff','#fff2e4','#ffb4a2','#ff3a2a'];
      m.blood=['#e0503a','#a8282c','#6c1420','#3c0a14'];
      m.flesh=['#ff8a6a','#c43a34','#741a28','#380a18'];
    }
    return K_.finish(m,['fx','eye','glow','fungus','foam','splash','acid']);
  }
  const NAMES={scale:'Escamas verde-oliva',side:'Flanco amarelado',belly:'Ventre amarelo-sujo',spot:'Manchas negras',ocel:'Miolo dos ocelos',
    stripe:'Faixa laranja da cabeça',flesh:'Carne exposta',bone:'Costelas e espinhos',mouth:'Boca',teeth:'Dentes recurvados',tongue:'Língua bífida',
    moss:'Musgo',leaf:'Aguapé',flower:'Flor do aguapé',mud:'Lodo',water:'Água do remanso',rope:'Cabo de barco',iron:'Ferro do arpão',wood:'Haste do arpão',
    eye:'Olho (lua na fúria)',glow:'Rachaduras da fúria',fungus:'Fungo luminoso',foam:'Espuma',splash:'Água espirrando'};

  /* ---------------- curvas ---------------- */
  function catmull(P,per){ const o=[];
    for(let i=1;i<P.length-2;i++){ const a=P[i-1],b=P[i],c=P[i+1],d=P[i+2];
      for(let k=0;k<per;k++){ const t=k/per,t2=t*t,t3=t2*t;
        o.push({x:0.5*(2*b.x+(-a.x+c.x)*t+(2*a.x-5*b.x+4*c.x-d.x)*t2+(-a.x+3*b.x-3*c.x+d.x)*t3),
                y:0.5*(2*b.y+(-a.y+c.y)*t+(2*a.y-5*b.y+4*c.y-d.y)*t2+(-a.y+3*b.y-3*c.y+d.y)*t3)}); } }
    const e=P[P.length-2]; o.push({x:e.x,y:e.y}); return o; }
  function bz(a,b,c,d,n=24){ const o=[]; for(let k=0;k<=n;k++){ const t=k/n,u=1-t; o.push({x:u*u*u*a.x+3*u*u*t*b.x+3*u*t*t*c.x+t*t*t*d.x,y:u*u*u*a.y+3*u*u*t*b.y+3*u*t*t*c.y+t*t*t*d.y}); } return o; }
  function resample(pts){ const out=[{x:pts[0].x,y:pts[0].y}]; let acc=0;
    for(let i=1;i<pts.length;i++){ let a=pts[i-1]; const b=pts[i]; let L=Math.hypot(b.x-a.x,b.y-a.y);
      while(acc+L>=STEP&&L>0){ const t=(STEP-acc)/L, q={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t}; out.push(q); a=q; L=Math.hypot(b.x-a.x,b.y-a.y); acc=0; }
      acc+=L; }
    const e=pts[pts.length-1], l=out[out.length-1]; if(Math.hypot(e.x-l.x,e.y-l.y)>0.8) out.push({x:e.x,y:e.y});
    return out; }
  // tubo ao longo da espinha: normal à direita do sentido (rabo→cabeça) = lado do ventre (u=+1); u=-1 = dorso
  function mkTube(raw,rf){
    const pts=resample(raw), n=pts.length, N=[], R=[];
    for(let i=0;i<n;i++){ const a=pts[Math.max(0,i-1)], b=pts[Math.min(n-1,i+1)]; let tx=b.x-a.x, ty=b.y-a.y; const L=Math.hypot(tx,ty)||1; N.push({x:-ty/L,y:tx/L}); }
    const L=(n-1)*STEP; for(let i=0;i<n;i++) R.push(rf(n>1?i/(n-1):0,i*STEP));
    const at=(i,u)=>{ const i0=Math.max(0,Math.min(n-1,Math.floor(i))), i1=Math.min(n-1,i0+1), f=Math.max(0,Math.min(1,i-i0));
      const p=pts[i0], q=pts[i1], a=N[i0], b=N[i1], r=R[i0]+(R[i1]-R[i0])*f;
      return [p.x+(q.x-p.x)*f+(a.x+(b.x-a.x)*f)*u*r, p.y+(q.y-p.y)*f+(a.y+(b.y-a.y)*f)*u*r]; };
    return {p:pts,n:N,r:R,L,len:n,at,ix:s=>Math.max(0,Math.min(n-1,s/STEP))};
  }
  const AT=(T,i,u)=>{ const q=T.at(i,u); return P2(q[0],q[1]); };

  /* ---------------- luz em faixas ----------------
     Luz de cima/à frente (0.6,-0.8) + componente de frente pro olho; o tom sai do brilho do cilindro em cada faixa. */
  function bright(T,i,u){ const k=Math.max(0,Math.min(T.len-1,Math.round(i))), n=T.n[k], nl=n.x*0.6-n.y*0.8; return u*nl+Math.sqrt(Math.max(0,1-u*u))*0.3-0.12; }
  function tone(M,key,b){ const R=M[key], Q=M[key+'Q']||R;
    return b>0.8?R[0]:b>0.5?Q[0]:b>0.22?R[1]:b>-0.05?Q[1]:b>-0.32?R[2]:b>-0.58?Q[2]:R[3]; }
  const zone=u=>u>0.62?'belly':u>0.1?'side':'scale';
  const US=[-1,-0.86,-0.7,-0.55,-0.4,-0.24,-0.06,0.1,0.26,0.44,0.62,0.8,1];

  // corpo: faixas de tom, escamas ventrais, manchas, brilho molhado, feridas, musgo e espinhos
  function drawTube(p,M,T,o){
    const n=T.len; if(n<2) return;
    const Lp=[], Rp=[]; for(let i=0;i<n;i++){ Lp.push(T.at(i,-1)); Rp.push(T.at(i,1)); }
    p.F(M.scale[2]); p.poly(Lp.concat(Rp.reverse()));
    for(let k=0;k<US.length-1;k++){ const u0=US[k], u1=Math.min(1,US[k+1]+0.03), um=(US[k]+US[k+1])/2, zn=zone(um);
      let i0=0, cur=null;
      const flush=(a,b)=>{ if(b<=a||!cur) return; const pts=[]; for(let j=a;j<=b;j++) pts.push(T.at(j,u0)); for(let j=b;j>=a;j--) pts.push(T.at(j,u1)); p.F(cur); p.poly(pts); };
      for(let i=0;i<n-1;i++){ const col=tone(M,zn,bright(T,i+0.5,um)); if(col!==cur){ flush(i0,i); cur=col; i0=i; } }
      flush(i0,n-1); }
    const ph=o.ph||0, L=T.L;
    // escamas ventrais largas (faixas transversais no ventre)
    for(let s=4-((ph*0.5)%6+6)%6; s<L-2; s+=6){ const i=T.ix(s), b=bright(T,i,0.8); p.F(b>0.1?M.bellyQ[1]:M.belly[3]); p.cap(AT(T,i,0.66),AT(T,i,1),1.1,1.1);
      if(b>0.3){ p.F(M.belly[0]); p.cap(AT(T,i+0.6,0.72),AT(T,i+0.6,0.92),0.8,0.8); } }
    // pintas negras na borda do ventre
    for(let s=7-((ph*0.5)%11+11)%11; s<L-4; s+=11){ const i=T.ix(s); p.F(M.spot[1]); const q=AT(T,i,0.66), q2=AT(T,i+1.2,0.74); p.cap(q,q2,2.4,1.6); }
    // escamas do dorso: losangos claros só no lado aceso (textura de couro molhado)
    for(let row=0;row<3;row++){ const u=[-0.8,-0.46,-0.14][row];
      for(let s=3+row*2.5-((ph*0.5)%5+5)%5; s<L-3; s+=5){ const i=T.ix(s), b=bright(T,i,u); if(b<0.25) continue; const q=AT(T,i,u);
        p.F(tone(M,zone(u),b+0.32)); p.rect(q.x-0.8,q.y-0.6,1.6,1.1); } }
    // manchas ovais negras (2 fileiras no dorso) e ocelos de miolo creme no flanco
    const sp=o.sp||32;
    if(!o.noSpots) for(let k=-1;k*sp<L+sp;k++){ const s0=k*sp+(ph%sp);
      [[s0,-0.6,0.42,0.19],[s0+sp*0.5,-1.02,0.34,0.17]].forEach(([sc,uc,a,b2],j)=>{ if(sc<5||sc>L-5) return;
        const ii=T.ix(sc), r=T.r[Math.min(n-1,Math.round(ii))], aa=a*sp, pts=[];
        for(let t=0;t<14;t++){ const th=t/14*PI*2, w=1+0.12*S(th*3+k+j); pts.push(T.at(T.ix(sc+C(th)*aa*w),Math.max(-1,Math.min(1,uc+S(th)*b2*w)))); }
        const bb=bright(T,ii,uc); p.F(tone(M,'spot',bb-0.55)); p.poly(pts);
        if(bb>0.45&&j===0){ p.F(M.spot[0]); const q0=AT(T,ii-aa*0.25/STEP,uc-b2*0.55), q1=AT(T,ii+aa*0.3/STEP,uc-b2*0.6); p.cap(q0,q1,1.3,1); }
        void r; });
      const sc=s0+sp*0.25; if(sc>6&&sc<L-6){ const ii=T.ix(sc), bb=bright(T,ii,0.2), pts=[], pi=[];
        for(let t=0;t<12;t++){ const th=t/12*PI*2; pts.push(T.at(T.ix(sc+C(th)*sp*0.15),0.3+S(th)*0.12)); pi.push(T.at(T.ix(sc+C(th)*sp*0.065),0.3+S(th)*0.05)); }
        p.F(tone(M,'spot',bb-0.5)); p.poly(pts); p.F(tone(M,'ocel',bb-0.35)); p.poly(pi); } }
    // brilho molhado: tracejado na crista de luz
    for(let s=6-((ph*0.5)%16+16)%16; s<L-6; s+=16){ const i=T.ix(s), k=Math.round(i), nn=T.n[Math.min(n-1,k)], a=(nn.x*0.6-nn.y*0.8), um=a/Math.sqrt(a*a+0.09);
      if(bright(T,i,um)<0.5) continue; p.F(tone(M,zone(um),1)); p.cap(AT(T,i,um),AT(T,i+2.6,um),1.6,1.2); if((s|0)%3===0){ p.F(M.foam[0]); const q=AT(T,i+1,um); p.rect(q.x-0.5,q.y-0.5,1.2,1.2); } }
    // feridas: escamas arrancadas, carne e costelas
    (o.wounds||[]).forEach((wd,k)=>{ const sc=wd.s*L, ii=T.ix(sc), aa=wd.a, pts=[];
      for(let t=0;t<16;t++){ const th=t/16*PI*2, j=0.75+0.35*rnd(k+3,t); pts.push(T.at(T.ix(sc+C(th)*aa*j),Math.max(-1,Math.min(1,wd.u+S(th)*wd.b*j)))); }
      p.F(M.flesh[3]); p.poly(pts);
      const inner=pts.map(q=>{ const c=T.at(ii,wd.u); return [c[0]+(q[0]-c[0])*0.78,c[1]+(q[1]-c[1])*0.78]; }); p.F(M.flesh[2]); p.poly(inner);
      const nR=wd.ribs||3; for(let r=0;r<nR;r++){ const s=sc-aa*0.62+r*(aa*1.24/(nR-1||1)), i=T.ix(s), u0=wd.u-wd.b*0.85, u1=wd.u+wd.b*0.85, um=(u0+u1)/2;
        const a=AT(T,i,u0), m=AT(T,i+0.8,um), b=AT(T,i,u1);
        p.F(M.bone[3]); bandA(p,[[a.x,a.y],[m.x,m.y],[b.x,b.y]],3); p.F(M.bone[2]); bandA(p,[[a.x-0.4,a.y-0.4],[m.x-0.4,m.y-0.5],[b.x-0.4,b.y-0.4]],1.9); p.F(M.bone[1]); bandA(p,[[a.x-0.6,a.y-0.7],[m.x-0.6,m.y-0.8]],1.1); p.F(M.bone[0]); p.cap(P2(a.x-0.6,a.y-0.8),P2(m.x-0.6,m.y-0.9),0.9,0.9);
        p.F(M.flesh[1]); const q=AT(T,i+1.6,um+0.05); p.ell(q.x,q.y,1.6,1.1); }
      p.F(M.flesh[0]); const hi=AT(T,ii-aa*0.4/STEP,wd.u-wd.b*0.55); p.rect(hi.x-1,hi.y-0.5,2.4,1);
      // borda clara de pele arrancada (lado aceso)
      p.F(tone(M,zone(wd.u),bright(T,ii,wd.u)+0.45)); bandA(p,pts.slice(9,15),1);
      if(wd.drip){ const q=AT(T,ii,wd.u+wd.b*0.9); K_.stain(p,M.blood,q.x,q.y,2.4,2,k+5); } });
    // espinhos de osso saindo da espinha
    (o.spines||[]).forEach(([s0,s1,len,gap])=>{ for(let s=s0*L;s<=s1*L;s+=gap){ const i=T.ix(s), r=T.r[Math.min(n-1,Math.round(i))], ll=len*(0.7+0.5*rnd(s,2));
      const a=AT(T,i-1.4,-0.96), b=AT(T,i+1.4,-0.96), tip=AT(T,i-1.6,-1-ll/r), mid=P2((a.x+b.x)/2,(a.y+b.y)/2);
      p.F(M.bone[2]); p.poly([[a.x,a.y],[b.x,b.y],[tip.x,tip.y]]); p.F(M.bone[1]); p.poly([[a.x,a.y],[mid.x,mid.y],[tip.x,tip.y]]); p.F(M.bone[0]); p.cap(P2(a.x*0.6+tip.x*0.4,a.y*0.6+tip.y*0.4),tip,1,0.6);
      p.F(M.flesh[2]); p.ell(mid.x,mid.y,2.2,1.2); } });
    // musgo nas costas
    (o.moss||[]).forEach(([s0,s1],k)=>{ for(let s=s0*L;s<=s1*L;s+=4.2){ const i=T.ix(s), q=AT(T,i,-0.93), rr=2.6+2.2*rnd(s,k);
      p.F(M.moss[2]); p.ell(q.x,q.y+0.8,rr+0.8,rr*0.8); p.F(M.moss[1]); p.ell(q.x-0.4,q.y-0.4,rr,rr*0.72); if(rnd(s,k+4)>0.5){ p.F(M.moss[0]); p.rect(q.x-1,q.y-rr*0.6,1.6,1); } } });
  }
  // camada emissiva do corpo: fungo luminoso e rachaduras da fúria
  function drawTubeGlow(p,M,T,o,fur,seed){
    const L=T.L;
    (o.moss||[]).forEach(([s0,s1],k)=>{ for(let s=s0*L+3;s<=s1*L;s+=9){ if(rnd(s,k+11)<0.35) continue; const i=T.ix(s), q=AT(T,i,-0.98+0.2*rnd(s,k+12));
      p.F(M.fungus[2]); p.rect(q.x-0.5,q.y-1,1,3); p.F(M.fungus[1]); p.ell(q.x,q.y-2,2.2,1.4); p.F(M.fungus[0]); p.rect(q.x-0.6,q.y-2.6,1.2,1); } });
    if(!fur) return;
    for(let k=0;k<(o.cracks||0);k++){ const s=L*(0.12+0.76*rnd(seed+k,1)); let i=T.ix(s), u=-0.7+1.2*rnd(seed+k,2); const pts=[];
      for(let j=0;j<5;j++){ pts.push(T.at(i,u)); i+=(1.6+rnd(seed+k,j+3)*2.4)*(rnd(seed+k,9)>0.5?1:-1); u+=(rnd(seed+k,j+20)-0.5)*0.5; u=Math.max(-0.95,Math.min(0.9,u)); }
      p.F(M.glow[3]); bandA(p,pts,2.4); p.F(M.glow[2]); bandA(p,pts,1.5); p.F(M.glow[1]); bandA(p,pts.slice(1,4),0.8);
      const b=pts[2]; p.F(M.glow[2]); p.cap(P2(b[0],b[1]),P2(b[0]+4*(rnd(seed+k,30)-0.5)*2,b[1]+4),1,0.4); }
  }

  /* ---------------- poses ----------------
     Pescoço (unidades a partir de AX/GROUND): base nbx (na água) · curva baixa m1 · curva alta m2 · nuca h (hx,hy) ·
     ha: ângulo da cabeça em graus (0 = frente, + = pra baixo) · jaw 0..1 boca · tongue 0..1 língua · wv fase da onda das
     corcovas · hb/hf altura da corcova de trás/frente · cf: espira da frente arremessada (constrição) · sq: aperto ·
     cauda: tbx (base), tx/ty (ponta), tc (curva), tf 1 = cauda na frente de tudo · sink 0..1 afundado · eyeK brilho do
     olho · moon 0..1 olho-lua · ring ondas do olhar · splash coluna d'água · drip água escorrendo · bub/bubR bolhas ·
     impact · smear · roar · hide (só a poça) · dead */
  const REST={nbx:0,m1x:38,m1y:78,m2x:-46,m2y:158,hx:-6,hy:238,ha:16,jaw:0.06,tongue:0,tph:0,wv:0,hb:1,hf:1,cf:0,sq:0,
    tbx:-196,tx:-246,ty:118,tc:0,tf:0,sink:0,eyeK:1,moon:0,ring:0,splash:0,drip:0,bub:0,bubR:0,impact:0,smear:0,roar:0,hide:0,dead:0,flash:0,shake:0,mud:0};
  const W=o=>o;
  const ANIMS={
    idle:{nome:'Parada (o pescoço balança, a língua sai)',n:8,dur:()=>170,pose:i=>{ const p=i/8*PI*2, s=S(p);
      return {hx:-6+5*s, hy:238+4*S(p-0.6), m2x:-46+4*S(p+0.4), m1x:38+2*S(p+1), ha:16+4*S(p-1.2), wv:p*0.5, hb:1+0.04*S(p), hf:1+0.04*S(p+2),
        tongue:[0,0,0,0.7,1,0.5,0,0][i], tph:i, tx:-246+5*S(p+1), ty:118+5*S(p), jaw:0.06+(i===4?0.08:0)}; }},
    walk:{nome:'Desliza (onda lateral, lama espirrando)',n:8,dur:()=>140,pose:i=>{ const p=i/8*PI*2;
      return {wv:p, hb:1+0.16*S(p), hf:1+0.16*S(p+PI), hx:-2+8*S(p), hy:232+5*S(2*p), m2x:-42+8*S(p+0.8), m1x:36+6*S(p+1.6), ha:18+3*S(p),
        tx:-246+10*S(p+2), ty:112+8*S(p+1), mud:0.6+0.4*S(p), tongue:i===5?0.8:0, tph:i}; }},
    strike:{nome:'Bote (recua a cabeça em S, estica e abocanha)',n:12,warn:[0,1,2,3,4],hit:7,lunge:[5,6,7],reach:148,dur:i=>[110,130,140,150,170,60,60,90,150,140,150,160][i],pose:i=>[
      W({hx:-22,hy:232,m2x:-60,m1x:30,ha:6,jaw:0.2}),
      W({hx:-52,hy:224,m2x:-82,m2y:150,m1x:22,ha:-4,jaw:0.4,roar:1}),
      W({hx:-72,hy:216,m2x:-96,m2y:146,m1x:18,m1y:72,ha:-10,jaw:0.6,roar:1,hf:1.1}),
      W({hx:-80,hy:212,m2x:-100,m2y:144,m1x:16,m1y:70,ha:-12,jaw:0.7,roar:1,hf:1.12,shake:1}),
      W({hx:-82,hy:210,m2x:-102,m2y:144,m1x:14,m1y:70,ha:-12,jaw:0.75,roar:1,hf:1.14,shake:-1}),
      W({hx:70,hy:168,m1x:40,m1y:92,m2x:44,m2y:150,ha:14,jaw:0.95,smear:1}),
      W({hx:168,hy:120,m1x:50,m1y:96,m2x:104,m2y:134,ha:24,jaw:1,smear:1}),
      W({hx:206,hy:100,m1x:56,m1y:94,m2x:126,m2y:124,ha:28,jaw:0.12,impact:1}),
      W({hx:200,hy:102,m1x:56,m1y:94,m2x:122,m2y:126,ha:28,jaw:0.1}),
      W({hx:130,hy:150,m1x:50,m1y:92,m2x:70,m2y:148,ha:22,jaw:0.2}),
      W({hx:40,hy:212,m1x:42,m1y:84,m2x:-20,m2y:158,ha:18,jaw:0.1}),
      W({hx:-2,hy:234,ha:16})][i]},
    coil:{nome:'Constrição (arremessa as espiras e enrola o alvo)',n:14,warn:[0,1,2,3],throwAt:4,squeeze:[6,11],reach:86,dur:i=>[130,140,150,160,80,110,150,150,150,150,150,150,160,180][i],pose:i=>{
      const sq=(k)=>({cf:1,hf:1.05,sq:k%2,hx:118+(k%2?4:-2),hy:176+(k%2?-3:2),m1x:60,m1y:88,m2x:30,m2y:170,ha:54+(k%2?6:0),jaw:0.55+(k%2?0.15:0),tongue:k%2?0:0.7,tph:k,shake:k%2?1:-1});
      return [
        W({hx:-30,hy:228,m2x:-66,ha:4,jaw:0.3,hf:1.2,cf:-0.15}),
        W({hx:-50,hy:220,m2x:-84,m2y:150,ha:-4,jaw:0.5,hf:1.4,cf:-0.3,roar:1}),
        W({hx:-60,hy:216,m2x:-92,m2y:148,ha:-8,jaw:0.6,hf:1.55,cf:-0.4,roar:1,shake:1}),
        W({hx:-64,hy:214,m2x:-94,m2y:148,ha:-8,jaw:0.6,hf:1.6,cf:-0.42,roar:1,shake:-1}),
        W({hx:80,hy:170,m1x:50,m1y:90,m2x:20,m2y:160,ha:30,jaw:0.9,cf:1.15,hf:1.5,smear:1}),
        W({hx:120,hy:168,m1x:60,m1y:88,m2x:30,m2y:166,ha:46,jaw:0.7,cf:1.05,hf:1.15,impact:1}),
        sq(0),sq(1),sq(2),sq(3),sq(4),sq(5),
        W({hx:60,hy:200,m1x:46,m1y:84,m2x:-10,m2y:166,ha:30,jaw:0.3,cf:0.5}),
        W({hx:4,hy:232,ha:18,jaw:0.1,cf:0.1})][i]; }},
    tail:{nome:'Cauda varrendo (sobe da água e varre em arco)',n:10,warn:[0,1,2,3],hit:5,dur:i=>[130,150,160,170,70,80,150,150,160,170][i],pose:i=>[
      W({tbx:-170,tx:-210,ty:170,tc:40,ha:6,hx:-12,hy:240}),
      W({tbx:-150,tx:-250,ty:200,tc:60,ha:-6,hx:-20,hy:244,jaw:0.3,m2x:-40}),
      W({tbx:-140,tx:-262,ty:236,tc:70,ha:-10,hx:-24,hy:246,jaw:0.5,roar:1,m2x:-36,shake:1}),
      W({tbx:-136,tx:-266,ty:244,tc:74,ha:-12,hx:-26,hy:248,jaw:0.55,roar:1,m2x:-34,shake:-1}),
      W({tbx:-130,tx:120,ty:190,tc:120,tf:1,smear:1,ha:20,hx:10,hy:232,jaw:0.4}),
      W({tbx:-126,tx:300,ty:36,tc:70,tf:1,smear:1,impact:1,ha:24,hx:16,hy:228,jaw:0.3,mud:1}),
      W({tbx:-126,tx:280,ty:24,tc:50,tf:1,ha:22,hx:12,hy:230,mud:0.6}),
      W({tbx:-140,tx:120,ty:60,tc:40,tf:1,ha:18,hx:4,hy:234}),
      W({tbx:-170,tx:-120,ty:90,tc:30,ha:16}),
      W({tbx:-190,tx:-236,ty:112,tc:10,ha:16})][i]},
    dive:{nome:'Mergulho (arqueia e afunda; bolhas seguem o alvo)',n:10,goneAt:8,dur:i=>[140,120,110,100,100,100,110,120,140,160][i],pose:i=>[
      W({hy:252,hx:-14,ha:-6,jaw:0.4,roar:1}),
      W({hx:30,hy:266,m2x:-20,m2y:180,m1x:40,ha:20,jaw:0.2}),
      W({hx:110,hy:200,m2x:40,m2y:200,m1x:44,m1y:110,ha:70,jaw:0}),
      W({hx:150,hy:60,m2x:80,m2y:190,m1x:40,m1y:120,ha:86,smear:1,splash:0.6,hf:0.9}),
      W({hx:160,hy:-20,m2x:100,m2y:150,m1x:44,m1y:110,ha:90,splash:1,sink:0.12,hf:0.8,hb:0.8,bub:0.5}),
      W({hx:160,hy:-40,m2x:110,m2y:110,m1x:50,m1y:70,ha:90,splash:0.8,sink:0.3,hf:0.6,hb:0.6,bub:0.7}),
      W({hx:160,hy:-60,m2x:120,m2y:70,m1x:50,m1y:40,ha:90,splash:0.5,sink:0.55,hf:0.4,hb:0.4,tbx:-180,tx:-200,ty:60,bub:0.9}),
      W({hx:160,hy:-80,m2x:120,m2y:40,m1x:50,m1y:20,ha:90,splash:0.3,sink:0.8,hf:0.2,hb:0.2,tx:-196,ty:20,bub:1}),
      W({hide:1,bub:1,splash:0.1}),
      W({hide:1,bub:0.6})][i]},
    surge:{nome:'Emerge por baixo (explode do chão sob o alvo)',n:10,hit:2,dur:i=>[90,80,120,140,140,150,150,160,170,180][i],pose:i=>[
      W({hide:1,bub:1,splash:0.35,impact:0}),
      W({hx:8,hy:200,m1x:10,m1y:70,m2x:4,m2y:140,ha:-80,jaw:1,sink:0.45,splash:1,hb:0.3,hf:0.3,tbx:-200,tx:-210,ty:20}),
      W({hx:10,hy:300,m1x:12,m1y:96,m2x:6,m2y:200,ha:-74,jaw:1,sink:0.04,splash:1,impact:1,roar:1,hb:0.6,hf:0.5,tx:-220,ty:60}),
      W({hx:4,hy:292,m1x:16,m1y:90,m2x:-6,m2y:196,ha:-50,jaw:0.8,splash:0.7,drip:1,roar:1,hb:0.8,hf:0.8,tx:-230,ty:90}),
      W({hx:0,hy:276,m1x:26,m1y:84,m2x:-24,m2y:180,ha:-20,jaw:0.5,splash:0.4,drip:1,hb:0.9,hf:0.9}),
      W({hx:-4,hy:258,m1x:32,m1y:80,m2x:-36,m2y:168,ha:0,jaw:0.3,splash:0.2,drip:0.8}),
      W({hx:-6,hy:246,m2x:-42,m2y:162,ha:10,jaw:0.2,drip:0.6}),
      W({hx:-6,hy:240,ha:14,jaw:0.1,drip:0.4}),
      W({hx:-6,hy:238,ha:16,drip:0.2}),
      W({})][i]},
    stuck:{nome:'Cabeça atolada na lama (VULNERÁVEL)',n:8,vuln:[0,1,2,3,4,5,6,7],dur:()=>130,pose:i=>{ const k=i%2?1:-1, p=i/8*PI*2;
      return {hx:118+3*k, hy:-6, m1x:44, m1y:118+4*S(p), m2x:92, m2y:150+8*S(p+1), ha:78+4*k, jaw:0.2, mud:1, shake:k, hb:1.15+0.12*S(p*2), hf:0.9+0.15*S(p*2+1), wv:p, tx:-246+14*S(p*2), ty:130+14*C(p*2), tc:20}; }},
    dazed:{nome:'Tonta (cabeça bamba, língua mole)',n:8,dur:()=>150,pose:i=>{ const p=i/8*PI*2;
      return {hx:30+14*C(p), hy:176+8*S(p), m1x:40, m1y:70, m2x:-10+10*C(p), m2y:130, ha:34+14*S(p), jaw:0.32, tongue:0.45, tph:0, eyeK:0.4, hb:0.95, hf:0.95}; }},
    gaze:{nome:'Olhar de Lua (os olhos viram luas e marcam o chão)',n:10,warn:[0,1,2,3,4,5],hit:6,dur:i=>[120,130,130,140,140,150,90,150,160,170][i],pose:i=>[
      W({hy:252,hx:-12,ha:4,jaw:0.2,moon:0.3}),
      W({hy:272,hx:-16,m2y:178,ha:-4,jaw:0.3,moon:0.6,ring:0.15}),
      W({hy:284,hx:-18,m2y:186,ha:-6,jaw:0.35,moon:1,ring:0.35,roar:1}),
      W({hy:286,hx:-18,m2y:188,ha:-6,jaw:0.35,moon:1,ring:0.6,roar:1,shake:1}),
      W({hy:286,hx:-18,m2y:188,ha:-4,jaw:0.35,moon:1,ring:0.85,shake:-1}),
      W({hy:284,hx:-16,m2y:186,ha:-2,jaw:0.3,moon:1,ring:1}),
      W({hy:270,hx:-6,m2y:180,ha:20,jaw:0.8,moon:1,ring:0.4,impact:0,roar:1}),
      W({hy:256,hx:-6,ha:18,jaw:0.4,moon:0.7}),
      W({hy:244,ha:16,jaw:0.2,moon:0.4}),
      W({moon:0.1})][i]},
    rage:{nome:'Fúria (a pele racha, os olhos viram luas, ruge)',n:10,dur:i=>[160,130,130,150,180,180,180,180,190,200][i],pose:i=>[
      W({hx:30,hy:170,m2x:-20,m2y:130,ha:50,jaw:0.3,shake:1}),
      W({hx:20,hy:160,m2x:-30,m2y:126,ha:60,jaw:0.4,shake:-1,mud:1}),
      W({hx:-30,hy:220,m2x:-70,m2y:150,ha:-20,jaw:0.6,splash:0.4}),
      W({hx:-20,hy:300,m2x:-56,m2y:196,m1x:30,m1y:96,ha:-30,jaw:1,roar:1,moon:1,splash:0.8,impact:1}),
      W({hx:-18,hy:302,m2x:-54,m2y:198,m1x:30,m1y:96,ha:-32,jaw:1,roar:1,moon:1,shake:1,drip:0.45}),
      W({hx:-20,hy:300,m2x:-56,m2y:196,m1x:30,m1y:96,ha:-30,jaw:1,roar:1,moon:1,shake:-1,drip:0.45}),
      W({hx:-18,hy:302,m2x:-54,m2y:198,m1x:30,m1y:96,ha:-32,jaw:1,roar:1,moon:1,shake:1,drip:0.35}),
      W({hx:-14,hy:280,m2x:-50,m2y:184,ha:-10,jaw:0.6,moon:1,drip:0.25}),
      W({hx:-8,hy:252,ha:8,jaw:0.3,moon:1}),
      W({ha:16,moon:1})][i]},
    hurt:{nome:'Dano',n:4,dur:i=>[80,110,130,160][i],pose:i=>[
      W({flash:1,hx:-40,hy:226,m2x:-70,ha:-24,jaw:0.7,roar:1,shake:1}),
      W({hx:-30,hy:230,m2x:-62,ha:-14,jaw:0.5,shake:-1}),
      W({hx:-14,hy:236,m2x:-52,ha:4,jaw:0.2}),
      W({})][i]},
    intro:{nome:'Entrada (WARNING): sobe do remanso em cascata, ergue o S, língua, olhos acendem e sibila',n:16,dur:i=>[320,220,200,180,170,170,170,180,150,150,200,170,170,200,220,260][i],pose:i=>{
      const E={eyeK:0.25};
      return [
        Object.assign({},E,{hide:1,bub:0.6}),
        Object.assign({},E,{sink:0.86,bub:1,splash:0.3,hb:0.6,hf:0.6}),
        Object.assign({},E,{sink:0.66,bub:0.8,splash:0.7,drip:1,hb:0.8,hf:0.8}),
        Object.assign({},E,{sink:0.48,splash:1,drip:1,hx:20,hy:250,ha:-40,m2x:-20,m2y:170}),
        Object.assign({},E,{sink:0.3,splash:0.8,drip:1,hx:10,hy:256,ha:-24,m2x:-30,m2y:168}),
        Object.assign({},E,{sink:0.14,splash:0.5,drip:1,hx:0,hy:252,ha:-8,m2x:-40}),
        Object.assign({},E,{sink:0.04,splash:0.3,drip:0.8,hx:-4,hy:246,ha:4}),
        Object.assign({},E,{drip:0.6,tongue:0.9,tph:1}),
        Object.assign({},E,{drip:0.5,tongue:1,tph:2}),
        Object.assign({},E,{drip:0.4,hx:20,hy:224,ha:28,tongue:0.4,tph:3}),
        W({drip:0.3,hx:24,hy:222,ha:30,eyeK:1.4,flash:0}),
        W({drip:0.2,hx:10,hy:236,ha:8,jaw:0.5,roar:1}),
        W({hx:0,hy:242,ha:-4,jaw:1,roar:1,shake:1}),
        W({hx:0,hy:242,ha:-4,jaw:1,roar:1,shake:-1}),
        W({hx:-4,hy:240,ha:8,jaw:0.4}),
        W({})][i]; }},
    death:{nome:'Morte (contorce, afunda, bolhas vermelhas, os olhos apagam)',n:16,dur:i=>[90,160,160,160,150,170,170,180,200,200,220,240,260,300,400,700][i],pose:i=>[
      W({flash:1,hx:-40,hy:230,ha:-24,jaw:0.8,roar:1}),
      W({hx:-30,hy:290,m2x:-60,m2y:190,ha:-40,jaw:1,roar:1,shake:1,splash:0.4}),
      W({hx:60,hy:250,m2x:0,m2y:200,ha:50,jaw:0.8,shake:-1,hb:1.3,hf:0.8}),
      W({hx:-60,hy:220,m2x:-80,m2y:170,ha:-30,jaw:1,roar:1,hb:0.8,hf:1.3,tx:-200,ty:180,tc:60}),
      W({hx:150,hy:40,m1x:40,m1y:100,m2x:90,m2y:120,ha:30,jaw:0.6,impact:1,splash:0.8,mud:1}),
      W({hx:146,hy:34,m1x:40,m1y:96,m2x:88,m2y:116,ha:26,jaw:0.5,hb:1.25,hf:0.75,wv:1,tx:-220,ty:150,tc:40,bubR:0.3}),
      W({hx:150,hy:36,m1x:42,m1y:92,m2x:90,m2y:112,ha:30,jaw:0.6,hb:0.8,hf:1.2,wv:2.4,tx:-190,ty:80,bubR:0.4}),
      W({hx:148,hy:34,m1x:40,m1y:90,m2x:88,m2y:110,ha:28,jaw:0.5,hb:1.1,hf:0.9,wv:3.6,tx:-236,ty:120,bubR:0.5,eyeK:0.8}),
      W({hx:148,hy:30,m1x:40,m1y:86,m2x:88,m2y:106,ha:26,jaw:0.4,sink:0.12,bubR:0.6,eyeK:0.7,tongue:0.3}),
      W({hx:148,hy:30,m1x:40,m1y:84,m2x:88,m2y:104,ha:26,jaw:0.35,sink:0.25,bubR:0.7,eyeK:0.55,tongue:0.35}),
      W({hx:148,hy:30,m1x:40,m1y:84,m2x:88,m2y:104,ha:26,jaw:0.3,sink:0.38,bubR:0.8,eyeK:0.4,tongue:0.35}),
      W({hx:148,hy:30,m1x:40,m1y:84,m2x:88,m2y:104,ha:26,jaw:0.3,sink:0.5,bubR:0.9,eyeK:0.3}),
      W({hx:148,hy:30,m1x:40,m1y:84,m2x:88,m2y:104,ha:26,jaw:0.3,sink:0.64,bubR:1,eyeK:0.2}),
      W({hx:148,hy:30,m1x:40,m1y:84,m2x:88,m2y:104,ha:26,jaw:0.3,sink:0.78,bubR:1,eyeK:0.1}),
      W({hide:1,bubR:1,dead:0.6}),
      W({hide:1,bubR:0.5,dead:1})][i]},
    xCoilB:{nome:'Espiras da constrição (atrás do lutador)',n:2,prop:true,dur:()=>120,pose:i=>({st:i})},
    xCoilF:{nome:'Espiras da constrição (na frente do lutador)',n:2,prop:true,dur:()=>120,pose:i=>({st:i})},
    xRipple:{nome:'Rastro de bolhas do mergulho',n:3,prop:true,dur:()=>110,pose:i=>({st:i})},
    xMoon:{nome:'Círculo do Olhar de Lua (marca e estouro)',n:3,prop:true,dur:()=>110,pose:i=>({st:i})},
  };

  /* ---------------- esqueleto (geometria do corpo) ---------------- */
  function skeleton(P){
    const dy=(P.sink||0)*SINKD, G=GROUND, sh=(P.shake||0)*2;
    const B={x:AX+P.nbx,y:G+6+dy}, M1={x:AX+P.m1x+sh,y:G-P.m1y+dy}, M2={x:AX+P.m2x-sh,y:G-P.m2y+dy}, H={x:AX+P.hx+sh*1.5,y:G-P.hy+dy};
    const a=rad(P.ha), Hd={x:C(a),y:S(a)};
    const neck=mkTube(catmull([{x:B.x+4,y:B.y+40},B,M1,M2,H,{x:H.x+Hd.x*44,y:H.y+Hd.y*44}],10),(t)=>33-9*t-3*t*t+4*S(t*PI));
    const wv=P.wv||0;
    // corcova de trás (entra e sai da água atrás do pescoço)
    const hbH=86*P.hb, xa=AX-176+6*S(wv), xb=AX-46+6*S(wv+1.2);
    const back=mkTube(bz({x:xa,y:G+14+dy},{x:xa+6,y:G-hbH*1.33+dy},{x:xb-8,y:G-hbH*1.33+dy},{x:xb,y:G+14+dy}),()=>27);
    // corcova da frente (cobre a base do pescoço); cf>0 = arremessada pra frente (constrição)
    const cf=P.cf||0, fa=AX-120+8*S(wv+2)-Math.max(0,cf)*10, fb=AX+108+8*S(wv+3)+cf*(cf>0?66:90), hfH=58*P.hf*(1+Math.max(0,cf)*0.15)+(P.sq?4:0);
    const front=mkTube(bz({x:fa,y:G+20+dy},{x:fa+(cf>0?10:4),y:G-hfH*1.35+dy},{x:fb-(cf>0?60:8),y:G-hfH*1.35*(cf>0?0.9:1)+dy},{x:fb,y:G+(cf>0?2:20)+dy}),()=>30);
    // cauda: sobe da água e afina
    const tb={x:AX+P.tbx,y:G+10+dy}, tt={x:AX+P.tx,y:G-P.ty+dy}, tc=P.tc||0;
    const sg=tt.x>=tb.x?1:-1, tail=mkTube(bz(tb,{x:tb.x+10*sg-tc*0.6,y:G-70-tc+dy},{x:tt.x-(22+tc*0.35)*sg,y:tt.y-52+tc*0.25},tt,28),(t)=>Math.max(2.4,22*(1-t)+2));
    return {neck,back,front,tail,H,a,dy,P};
  }

  /* ---------------- água ---------------- */
  const POOL={x:AX-34,y:GROUND-4,rx:248,ry:21};
  function drawPool(p,M,P){
    p.id(); const {x,y,rx,ry}=POOL, Wt=M.water, t=P.t||0;
    p.F(Wt[3]); p.ell(x,y+1,rx,ry);
    p.F(Wt[2]); p.ell(x,y-0.5,rx-6,ry-3);
    p.F(M.waterQ[1]); p.ell(x+20,y-3,rx-40,ry-9);
    p.F(Wt[1]); arc(p,x+4,y-1,rx-26,ry-7,195,345,2.2,16); arc(p,x-10,y+3,rx-70,ry-10,200,330,1.6,14);
    // lodo na borda
    p.F(M.mud[2]); [[-230,6,22,5],[210,7,26,5],[-120,16,30,4],[90,17,36,4],[0,19,26,3]].forEach(([dx,dy,a,b])=>p.ell(x+dx,y+dy,a,b));
    p.F(M.mud[1]); [[-232,4,12,3],[212,5,14,3],[-118,14,16,2],[92,15,18,2]].forEach(([dx,dy,a,b])=>p.ell(x+dx,y+dy,a,b));
    // reflexo da lua (tracejado) e anéis de onda
    p.F(Wt[0]); [[-60,-6,26],[-20,-3,14],[40,-8,18],[120,-2,22],[-150,-4,16]].forEach(([dx,dy,L],k)=>p.rect(x+dx+((t*3+k*5)%7)-3,y+dy,L,1));
    p.F(M.foam[2]); [[-96,-9,9],[150,-7,7],[-196,0,6]].forEach(([dx,dy,L])=>p.rect(x+dx,y+dy,L,1));
  }
  // espuma onde o corpo entra na água
  function foamAt(p,M,x,y,r,t,k){ p.F(M.foam[3]); p.ell(x,y+1.4,r*1.3,4); p.F(M.foam[2]); p.ell(x-1,y+0.4,r*1.12,2.6); p.F(M.foam[1]);
    for(let j=0;j<5;j++){ const dx=(j-2)*r*0.5+S(t+j+k)*2; p.rect(x+dx-1.4,y-1.2-(j%2)*1.2,2.6,1.4); } p.F(M.foam[0]); p.rect(x-r*0.4+S(t+k)*2,y-1.4,2,1);
    p.F(M.water[1]); p.rect(x-r*1.2,y+3.4,r*2.4,1); }
  function waterCross(T,wy){ const o=[]; for(let i=1;i<T.len;i++){ const a=T.p[i-1], b=T.p[i]; if((a.y-wy)*(b.y-wy)<=0&&a.y!==b.y){ const f=(wy-a.y)/(b.y-a.y); o.push({x:a.x+(b.x-a.x)*f,r:T.r[i]}); } } return o; }

  /* ---------------- cabeça ----------------
     Origem = nuca/articulação da mandíbula sobre a ponta do pescoço; +x pro focinho. */
  const UP=[[-20,-15],[-10,-21],[6,-24],[24,-25],[37,-25.5],[41,-28],[47,-29.5],[53,-28.5],[56,-25],[64,-22.5],[71,-21],[74,-22.5],[78,-21],[82,-17],[84.5,-11],[84,-6],[81,-2.5],[70,-1.6],[48,-0.6],[26,0.4],[6,1.6],[-10,3.6],[-20,2]];
  const LO=[[-18,-1],[2,-0.5],[30,-1],[58,-1.4],[80,-2],[79,2.4],[70,5.6],[50,8.4],[28,10.6],[8,12.6],[-8,13],[-20,9]];
  const EYE=[48,-23];
  const rot=(q,a)=>[q[0]*C(a)-q[1]*S(a),q[0]*S(a)+q[1]*C(a)];
  const rotH=(q,a)=>rot([q[0]*1.2,q[1]*1.2],a);
  const HS=1.2;
  function headXf(sk,ex,p){ p.xf(sk.a+ex,sk.H.x,sk.H.y); const X=K_.st.CTX, m=X.getTransform(); X.setTransform(m.a*HS,m.b*HS,m.c*HS,m.d*HS,m.e,m.f); }
  function drawMouth(p,M,sk,P){
    const jaw=Math.max(0,Math.min(1,P.jaw)), ua=-rad(jaw*14), la=rad(jaw*50);
    headXf(sk,0,p);
    if(jaw>0.08){
      const up=[[0,0],[20,-0.5],[42,-1],[62,-1.5],[80,-2.4]].map(q=>rot(q,ua)), lo=[[79,-2],[60,-1.4],[34,-1],[10,-0.6],[0,0]].map(q=>rot(q,la));
      p.F(M.mouth[3]); p.poly(up.concat(lo));
      const mid=up.map((q,k)=>[(q[0]+lo[4-k][0])/2,(q[1]+lo[4-k][1])/2]);
      p.F(M.mouth[2]); p.poly(up.concat(mid.slice().reverse()));
      p.F(M.mouthQ[0]); p.poly([up[1],up[2],up[3],[mid[3][0],mid[3][1]-1],[mid[2][0],mid[2][1]-1.5],[mid[1][0],mid[1][1]-1]]);
      p.F(M.mouth[1]); bandA(p,up.slice(1).map(q=>[q[0],q[1]+1.6]),1.8); bandA(p,lo.slice(0,4).map(q=>[q[0],q[1]-1.6]),1.8);
      p.F(M.mouth[3]); p.ell(5,2,7,3+jaw*6,0);
      // dentes recurvados: 2 fileiras em cima e embaixo (a de dentro menor, na sombra)
      for(let x=10;x<=76;x+=5.2){ const L=x>58?7.4:x>34?6:4.6, a=rot([x,-1.2],ua), b=rot([x+3,-1.2],ua), tp=rot([x-0.8,-1.2+L],ua);
        p.F(M.teeth[3]); p.poly([[a[0]-0.5,a[1]],[b[0]+0.5,b[1]],[tp[0],tp[1]+0.7]]); p.F(M.teeth[1]); p.poly([a,b,tp]); p.F(M.teeth[0]); p.rect(a[0]+0.5,a[1],1,L*0.5);
        const c=rot([x+1.2,-3.8],ua), d=rot([x+3.4,-3.8],ua), tq=rot([x+1.4,-3.8+L*0.55],ua); p.F(M.teeth[2]); p.poly([c,d,tq]); }
      for(let x=12;x<=74;x+=5.6){ const L=x>56?6.4:4.4, a=rot([x,-1],la), b=rot([x+2.8,-1],la), tp=rot([x+0.8,-1-L],la);
        p.F(M.teeth[3]); p.poly([[a[0]-0.5,a[1]],[b[0]+0.5,b[1]],[tp[0],tp[1]-0.7]]); p.F(M.teeth[1]); p.poly([a,b,tp]); p.F(M.teeth[0]); p.rect(a[0]+0.4,tp[1]+1,1,L*0.4); }
      // fios de baba e espinha de peixe presa nos dentes
      if(jaw>0.32){ [[46,42],[26,22],[64,60]].forEach(([xu,xl],k)=>{ const a=rot([xu,0],ua), b=rot([xl,0],la), m=[(a[0]+b[0])/2+1.5,(a[1]+b[1])/2+2+k];
          p.F(M.foam[2]); bandA(p,[a,m,b],1.4); p.F(M.foam[0]); bandA(p,[a,m],0.6); });
        const f0=rot([28,-2],la), f1=rot([48,-3],la); p.F(M.bone[2]); p.cap(P2(f0[0],f0[1]),P2(f1[0],f1[1]),1.4,1);
        for(let k=0;k<5;k++){ const q=rot([30+k*3.6,-2.2],la); p.F(M.bone[1]); p.cap(P2(q[0],q[1]),P2(q[0]-1.2,q[1]-3.8),0.9,0.5); p.cap(P2(q[0],q[1]),P2(q[0]-1.2,q[1]+2.4),0.9,0.5); }
        const sk0=rot([50,-3],la); p.F(M.bone[1]); p.poly([[sk0[0],sk0[1]],[sk0[0]+4,sk0[1]-3],[sk0[0]+5,sk0[1]+1]]); }
    }
    // mandíbula de baixo: lábio amarelo, garganta mais escura, escamas labiais
    headXf(sk,la,p);
    platePoly(p,M.belly,LO,sk.a+la,0.7);
    p.F(M.side[2]); p.poly([[-20,9],[-8,13],[8,12.6],[28,10.6],[50,8.4],[70,5.6],[66,8],[48,10.6],[26,12.6],[6,14],[-10,14],[-20,11]]);
    p.F(M.side[3]); p.poly([[-20,4],[-6,6],[-8,13],[-20,9]]);
    for(let x=6;x<76;x+=6.4){ p.F(M.belly[2]); p.rect(x,-0.6,1,3.4); p.F(M.belly[0]); p.rect(x+1.2,-0.4,3.6,1); }
    p.F(M.spot[1]); [[22,6],[40,5.6],[58,3.6]].forEach(([x,y])=>p.ell(x,y,2.6,1.4));
    if(jaw<=0.08){ p.F(M.teeth[1]); [[74,-2],[62,-1.6],[50,-1.2]].forEach(([x,y])=>p.poly([[x,y],[x+2.6,y],[x+0.4,y+4]])); p.F(M.teeth[3]); [[74,-2],[62,-1.6],[50,-1.2]].forEach(([x,y])=>p.rect(x+1.8,y,0.8,2.4)); }
  }
  function drawHead(p,M,sk,P,form){
    const fur=form==='furia', jaw=Math.max(0,Math.min(1,P.jaw)), ua=-rad(jaw*14), A=sk.a+ua;
    headXf(sk,ua,p);
    platePoly(p,M.scale,UP,A,1);
    // linha escura do alto (borda do crânio) e escamas grandes
    p.F(M.scale[3]); bandA(p,[[-18,-16],[-8,-21],[8,-23.6],[24,-24.4],[37,-24.6]],1.6);
    p.F(M.scale[0]); p.rect(10,-23.4,10,1); p.rect(26,-24.2,8,1); p.rect(60,-21.6,6,1); p.F(M.foam[0]); p.rect(28,-24.2,2,1);
    p.F(M.scaleQ[2]); [[18,-24,20,-19],[32,-24.6,34,-20],[62,-22,63,-17],[70,-20.6,71,-15]].forEach(([a,b,c,d])=>bandA(p,[[a,b],[c,d]],0.9));
    // faixa laranja (atrás do olho) e faixa negra pós-ocular descendo até o canto da boca
    platePoly(p,M.stripe,[[44,-21],[30,-20],[12,-18],[-6,-15.6],[-20,-13],[-20,-9],[-6,-11],[12,-13],[30,-15],[44,-17]],A,0.8);
    platePoly(p,M.spot,[[46,-18],[30,-15],[12,-13],[-6,-11],[-20,-9],[-20,-1.4],[-6,-2.6],[12,-4.4],[30,-7],[46,-12]],A,0.3);
    // lábio amarelo de cima com escamas labiais
    platePoly(p,M.belly,[[83,-6.4],[70,-6],[50,-6],[34,-6.6],[16,-4.6],[-6,-2.6],[-20,-1.4],[-20,2],[-10,3.6],[6,1.6],[26,0.4],[48,-0.6],[70,-1.6],[81,-2.5]],A,0.6);
    for(let x=4;x<80;x+=6.4){ p.F(M.belly[2]); p.rect(x,-5.6,1,4.6); }
    p.F(M.belly[3]); bandA(p,[[82,-2.6],[60,-1.4],[30,0],[4,1.6],[-14,3]],1);
    // focinho: narina no alto (calombo) e risco escuro até o olho
    p.F(M.scale[3]); p.ell(76,-19.6,2.8,1.8,-0.2); p.F(M.spot[3]); p.ell(76.6,-19.8,1.5,1,-0.2); p.F(M.scale[0]); p.rect(72,-22.6,4,1);
    p.F(M.spot[1]); bandA(p,[[54,-19],[64,-16],[78,-13]],1.2);
    // cicatriz de arpão na bochecha
    p.F(M.flesh[3]); bandA(p,[[16,-11],[24,-8],[32,-9.6]],2); p.F(M.flesh[1]); bandA(p,[[18,-10.6],[24,-8.6]],0.9);
    // manchas negras da nuca (começo do padrão)
    p.F(M.spot[1]); p.ell(-8,-20,7,3.4,0.2);
    if(fur){ p.F(M.flesh[3]); p.poly([[-16,-19],[2,-21],[6,-13],[-4,-9],[-18,-11]]); p.F(M.bone[1]); p.poly([[-14,-18],[0,-19.6],[3.6,-14],[-4,-10.6],[-16,-12]]); p.F(M.bone[0]); p.rect(-11,-18,9,1); p.F(M.bone[3]); [[-8,-14],[-2,-13]].forEach(([x,y])=>p.ell(x,y,1.5,1.1)); }
    // olho no alto (quebra a silhueta): órbita, globo, fenda, e a escama da sobrancelha caindo por cima
    const ex=EYE[0], ey=EYE[1], moon=fur?Math.max(0.8,P.moon||0):(P.moon||0);
    p.F(M.spot[3]); p.ell(ex,ey,7,6); p.F(M.spot[2]); p.ell(ex,ey+0.4,6.2,5.2);
    if(moon>0.5){ p.F(M.eye[1]); p.circle(P2(ex,ey+0.3),5.2); p.F(M.eye[0]); p.circle(P2(ex-0.5,ey),4); p.F(M.eye[2]); p.ell(ex+1.8,ey+1.8,1.3,1); p.ell(ex-1.6,ey+2.4,0.9,0.7); }
    else { const E=M.eye, k=P.eyeK; p.F(k<0.5?E[3]:E[2]); p.circle(P2(ex,ey+0.3),5); p.F(k<0.5?E[3]:E[1]); p.circle(P2(ex+0.7,ey-0.4),3.2); p.F(M.spot[3]); p.ell(ex+0.4,ey+0.4,1.1,4.2); if(k>=0.5){ p.F(E[0]); p.rect(ex+1.8,ey-2.6,1.2,1.2); } }
    platePoly(p,M.scale,[[38,-26],[47,-30.4],[56,-28],[58,-24.6],[52,-23.6],[44,-24.4],[37,-23.2]],A,1);
    p.F(M.scale[0]); p.rect(42,-29.4,8,1); p.F(M.scale[3]); bandA(p,[[38,-23.4],[46,-24.6],[57,-24.2]],1.2);
    // lodo pendurado no queixo
    p.F(M.mud[1]); p.poly([[28,1],[34,0.6],[33,7],[31,10],[30,6]]); p.F(M.moss[2]); p.rect(30.2,3,1.4,6);
  }
  function drawEyeGlow(p,M,sk,P,form){
    const fur=form==='furia', moon=fur?Math.max(0.8,P.moon||0):(P.moon||0), k=P.eyeK, ua=-rad(Math.max(0,Math.min(1,P.jaw))*14);
    if(k<0.5&&moon<0.3) return;
    headXf(sk,ua,p); const ex=EYE[0], ey=EYE[1];
    if(moon>0.5){ p.F(M.glow[3]); arc(p,ex,ey,9,8.2,0,360,1.4,14); p.F(M.glow[2]); arc(p,ex,ey,7.6,7,200,340,1,10);
      p.F(M.eye[1]); p.rect(ex+8,ey-0.5,6+moon*6,1); p.rect(ex-14-moon*5,ey,6,1); }
    else if(k>1.1){ p.F(M.eye[2]); arc(p,ex,ey,8.6,7.6,0,360,1.2,14); p.F(M.eye[1]); p.rect(ex+7,ey-0.5,9,1); p.rect(ex-15,ey-0.5,7,1); }
    else { p.F(M.eye[3]); p.rect(ex+6,ey-0.4,3,1); }
  }
  function drawTongue(p,M,sk,P){
    const L=(P.tongue||0)*48; if(L<3) return; const jaw=Math.max(0,Math.min(1,P.jaw)), base=[80,jaw>0.2?2:-2];
    headXf(sk,rad(jaw*20),p); const ph=(P.tph||0)*1.7, pts=[];
    for(let k=0;k<=6;k++){ const t=k/6; pts.push([base[0]+t*L, base[1]+S(t*5+ph)*2.8*t]); }
    const e=pts[6], d=pts[5], ax=e[0]-d[0], ay=e[1]-d[1], al=Math.hypot(ax,ay)||1, ux=ax/al, uy=ay/al;
    p.F(M.tongue[3]); bandA(p,pts,2.8); p.F(M.tongue[1]); bandA(p,pts.slice(0,5),1.2);
    p.F(M.tongue[3]); p.cap(P2(e[0],e[1]),P2(e[0]+ux*10-uy*4.5,e[1]+uy*10+ux*4.5),1.8,0.6); p.cap(P2(e[0],e[1]),P2(e[0]+ux*10+uy*4.5,e[1]+uy*10-ux*4.5),1.8,0.6);
    p.F(M.tongue[0]); p.rect(pts[2][0],pts[2][1]-0.8,3,0.8);
  }

  /* ---------------- adereços do corpo ---------------- */
  function drawHarpoon(p,M,sk,P){
    const T=sk.neck, i=T.ix(T.L*0.58), q=AT(T,i,-0.5), n=T.n[Math.round(i)], d={x:-n.x*0.8-0.6,y:-n.y*0.8-0.2}, dl=Math.hypot(d.x,d.y)||1; d.x/=dl; d.y/=dl;
    p.id(); const tip=P2(q.x+d.x*30,q.y+d.y*30);
    p.F(M.flesh[3]); p.ell(q.x,q.y,4.6,3.4); p.F(M.flesh[1]); p.ell(q.x-0.6,q.y-0.4,2.6,1.8);
    p.F(M.wood[3]); p.cap(q,tip,4.2,3.6); p.F(M.wood[1]); p.cap(P2(q.x-0.6,q.y-0.8),P2(tip.x-0.6,tip.y-0.8),2,1.6); p.F(M.wood[0]); p.cap(P2(q.x+d.x*8-0.8,q.y+d.y*8-1.2),P2(q.x+d.x*20-0.8,q.y+d.y*20-1.2),0.8,0.8);
    // ponta quebrada em lascas
    p.F(M.wood[2]); p.poly([[tip.x-2,tip.y-1],[tip.x+d.x*5+1,tip.y+d.y*5-2],[tip.x+d.x*3,tip.y+d.y*3+1],[tip.x+d.x*6-1,tip.y+d.y*6+2],[tip.x+2,tip.y+1.6]]);
    // colar de ferro e corda pendurada
    const cq=P2(q.x+d.x*6,q.y+d.y*6); p.F(M.iron[3]); p.cap(P2(cq.x-d.y*3.4,cq.y+d.x*3.4),P2(cq.x+d.y*3.4,cq.y-d.x*3.4),3,3); p.F(M.iron[1]); p.rect(cq.x-1,cq.y-1.4,2,1);
    const sw=S((P.t||0)*1.3)*3, r0=P2(q.x+d.x*12,q.y+d.y*12);
    rope(p,M.rope,K_.bez(r0,P2(r0.x-6+sw,r0.y+20),P2(r0.x-4+sw*1.6,r0.y+38),8),1.8);
    p.F(M.rope[1]); p.cap(P2(r0.x-4+sw*1.6,r0.y+38),P2(r0.x-6+sw*1.8,r0.y+44),1.4,0.6); p.cap(P2(r0.x-4+sw*1.6,r0.y+38),P2(r0.x-1+sw*1.8,r0.y+43),1.2,0.5);
  }
  function drawRopeWraps(p,M,T){
    p.id(); [0.6,0.66].forEach((f,k)=>{ const i=T.ix(T.L*f), pts=[]; for(let j=0;j<=6;j++){ const u=-1.06+j*2.12/6, q=AT(T,i+S(j/6*PI)*1.6,u); pts.push(q); } rope(p,M.rope,pts,2.4); });
    const e=AT(T,T.ix(T.L*0.66),1.04); rope(p,M.rope,[e,P2(e.x+3,e.y+8),P2(e.x+1,e.y+16)],1.8);
    p.F(M.rope[0]); p.rect(e.x,e.y+16,1,3); p.rect(e.x+2,e.y+15,1,3);
  }
  function drawAguape(p,M,T,f,seed){
    p.id(); const i=T.ix(T.L*f), top=AT(T,i,-1);
    // raízes escuras penduradas pelo flanco
    p.F(M.moss[3]); for(let k=0;k<4;k++){ const q=AT(T,i-3+k*2,-0.6+k*0.05); p.cap(P2(q.x,q.y-4),P2(q.x+S(seed+k)*2,q.y+10+k*3),1.2,0.6); }
    // folhas redondas brilhantes com pecíolo inchado
    [[-9,-2,7.4,5],[6,-3,8,5.4],[-1,-7,6.6,4.6],[12,1,5.4,3.8]].forEach(([dx,dy,a,b],k)=>{ p.F(M.leaf[2]); p.cap(P2(top.x+dx*0.4,top.y+2),P2(top.x+dx,top.y+dy),3,2.4); mass(p,M.leaf,top.x+dx,top.y+dy-1,a,b,0,1,0.3*(k-1.5));
      p.F(M.leaf[3]); p.cap(P2(top.x+dx,top.y+dy-1),P2(top.x+dx+a*0.6,top.y+dy-1-b*0.3),0.8,0.8); });
    // espiga de flor lilás
    const fx=top.x+2, fy=top.y-10; p.F(M.leaf[2]); p.cap(P2(fx,top.y-4),P2(fx+1,fy-6),1.6,1.2);
    [[0,0],[2,-3],[-1.6,-4],[1.4,-7],[0,-9]].forEach(([dx,dy],k)=>{ p.F(M.flower[2]); p.circle(P2(fx+dx,fy+dy),2.6); p.F(M.flower[1]); p.circle(P2(fx+dx-0.4,fy+dy-0.4),1.7); if(k%2===0){ p.F(M.flower[0]); p.rect(fx+dx-0.6,fy+dy-1.2,1,1); } });
  }

  /* ---------------- efeitos ---------------- */
  function drawSplash(p,M,sk,P){
    if(P.splash<0.05) return; p.id(); const Sp=M.splash, a=P.splash, x=AX+12, g=GROUND-6, t=P.t||0;
    const h=60+a*170, w=40+a*40;
    const col=(sc)=>{ const L=[], R=[]; for(let j=0;j<=8;j++){ const u=j/8, half=w*sc*(1-u*0.75)*(1+0.18*S(u*9+t)); L.push([x-half+S(u*6+t)*4,g-h*sc*u]); R.push([x+half+S(u*5+t+1)*4,g-h*sc*u]); } return L.concat(R.reverse()); };
    p.F(Sp[3]); p.poly(col(1)); p.F(Sp[2]); p.poly(col(0.8)); p.F(Sp[1]); p.poly(col(0.55)); p.F(Sp[0]); p.poly(col(0.25));
    for(let k=0;k<14;k++){ const an=-PI*(0.1+0.8*rnd(k,t|0)), r=w*0.8+h*0.5*rnd(k+3,t|0); const q=P2(x+C(an)*r,g+S(an)*r*0.9); p.F(Sp[k%3]); p.ell(q.x,q.y,2.4+rnd(k,5)*2,3+rnd(k,6)*2.6); }
    p.F(Sp[2]); p.ell(x,g+2,w*1.8,7); p.F(Sp[1]); p.ell(x,g,w*1.3,4.6);
  }
  function drawDrips(p,M,sk,P){
    if(P.drip<0.05) return; p.id(); const Sp=M.splash, t=P.t||0;
    [sk.neck,sk.front,sk.back].forEach((T,ti)=>{ for(let s=8;s<T.L-8;s+=13){ if(rnd(s,ti+t)>P.drip) continue; const i=T.ix(s), q=AT(T,i,-0.3+rnd(s,ti)*1.2);
      const L=5+rnd(s,ti+3)*9; p.F(Sp[2]); p.cap(q,P2(q.x,q.y+L),1.8,1.2); p.F(Sp[0]); p.rect(q.x-0.5,q.y,1,L*0.6); p.F(Sp[1]); p.ell(q.x,q.y+L+3+((t*4+s)%6),1.2,1.8); } });
  }
  function drawBubbles(p,M,P){
    const n=Math.round((P.bub||0)*12+(P.bubR||0)*12); if(!n) return; p.id(); const t=Math.floor(P.t||0), red=(P.bubR||0)>0.01;
    for(let k=0;k<n;k++){ const x=POOL.x-180+rnd(k,1)*340, y=POOL.y-8+rnd(k,2)*14-((t*3+k*5)%9), r=1.6+rnd(k,t)*3.4, B=red&&k%3!==2?M.blood:M.foam;
      p.F(B[2]); p.circle(P2(x,y),r); p.F(B[1]); p.circle(P2(x-0.3,y-0.3),r*0.7); p.F(red?M.flesh[0]:M.foam[0]); p.rect(x-r*0.5,y-r*0.6,1,1); }
    p.F(red?M.blood[2]:M.water[1]); for(let k=0;k<3;k++){ const r=30+((t*14+k*40)%120); arc(p,POOL.x-20+k*40,POOL.y,r,r*0.14,0,360,1.2,20); }
  }
  function drawMud(p,M,sk,P){
    if(!(P.mud>0.05)) return; p.id(); const t=Math.floor(P.t||0), D=M.mud;
    const xs=sk.P.hx>90&&sk.P.hy<20?[sk.H.x+40]:[POOL.x-150,POOL.x+120];
    xs.forEach((x0,j)=>{ for(let k=0;k<8;k++){ const an=-PI*(0.15+0.7*rnd(k+j*9,t)), r=(14+30*rnd(k,t+1))*P.mud; const q=P2(x0+C(an)*r*1.6,GROUND-6+S(an)*r);
      p.F(D[k%3]); p.ell(q.x,q.y,2+rnd(k,2)*2.4,1.6+rnd(k,3)*2); } p.F(D[2]); p.ell(x0,GROUND-3,22*P.mud,4); });
  }
  function drawImpact(p,M,sk,P,anim){
    if(!P.impact) return; p.id(); const F=M.fx, Sp=M.splash;
    let c;
    if(anim==='tail') c=AT(sk.tail,sk.tail.len-3,0);
    else if(anim==='surge'||anim==='rage'||anim==='intro') c=P2(AX+10,GROUND-10);
    else if(anim==='death') c=P2(sk.H.x+60,GROUND-8);
    else { const m=rotH([88,0],sk.a); c=P2(sk.H.x+m[0],sk.H.y+m[1]); }
    if(c.y>GROUND-40||anim==='tail'){ K_.dust(p,Sp,F,c.x,Math.min(GROUND-2,c.y+10),0.9); }
    else { sparks(p,F,c,9,22,3); p.F(F[1]); [[0,-1],[1,0],[0,1],[-1,0]].forEach(([dx,dy])=>p.cap(c,P2(c.x+dx*18,c.y+dy*18),3,0.6)); }
  }
  function drawSmear(p,M,sk,P,anim){
    p.id(); const F=M.fx;
    if(anim==='tail'){ smear(p,[M.splash[1],M.splash[2]],AX-60,GROUND-40,140,250,-150,-10,0.38); return; }
    if(anim==='strike'||anim==='coil'||anim==='dive'){ const T=sk.neck; for(let k=0;k<3;k++){ const i=T.len-3-k*5, q=AT(T,i,-1.2-k*0.3), r=AT(T,Math.max(0,i-22),-1.3-k*0.3);
      p.F(k?F[2]:F[1]); p.cap(r,q,0.6,3-k*0.7); } }
  }
  function drawRing(p,M,sk,P){
    if((P.ring||0)<0.05) return; const ua=-rad(Math.max(0,Math.min(1,P.jaw))*14), e=rotH(EYE,sk.a+ua), c=P2(sk.H.x+e[0],sk.H.y+e[1]); p.id();
    [0,0.33,0.66].forEach((o,k)=>{ const r=10+P.ring*80-o*50; if(r<8) return; p.F(k?M.glow[2]:M.eye[1]); arc(p,c.x,c.y,r,r*0.86,0,360,2.4-k*0.5,22); });
    p.F(M.eye[1]); for(let k=0;k<3;k++){ const tx=c.x+40+k*50, ty=GROUND-6-k*4; p.cap(c,P2(tx,ty),0.6,2.2-k*0.4); }
  }
  function drawRoar(p,M,sk,P){ if(!P.roar) return; const ja=rad(Math.max(0,Math.min(1,P.jaw))*20), m=rotH([86,4],sk.a+ja*0.5), c=P2(sk.H.x+m[0],sk.H.y+m[1]); p.id(); p.F(M.foam[1]);
    for(let k=0;k<3;k++){ const an=sk.a+rad(-30+k*30); p.cap(P2(c.x+C(an)*10,c.y+S(an)*10),P2(c.x+C(an)*20,c.y+S(an)*20),2,0.6); } }

  /* ---------------- montagem ---------------- */
  const WY={tail:GROUND-14,back:GROUND-12,neck:GROUND-8,front:GROUND+2};
  const clipTop=(wy,fn)=>clipPoly([[-20,-60],[FW+20,-60],[FW+20,wy],[-20,wy]],fn);
  function tubePart(add,M,T,wy,o,fur,seed,t,k){
    add({},p=>{ p.id(); clipTop(wy,()=>drawTube(p,M,T,o)); });
    add({noShade:true,noRim:true},p=>{ p.id(); clipTop(wy,()=>drawTubeGlow(p,M,T,o,fur,seed)); });
    const xs=waterCross(T,wy); if(xs.length) add({noRim:true},p=>{ p.id(); xs.forEach((c,j)=>foamAt(p,M,c.x,wy,c.r,t,j+k)); });
  }
  function parts(add,P,M,sk,form,anim){
    const fur=form==='furia', t=P.t||0, seed=Math.floor(t)*7+3, ph=(P.wv||0)/(PI*2)*32;
    add({noRim:true,back:true},p=>drawPool(p,M,P));
    if(P.hide>0.5){ add({noShade:true,noRim:true},p=>drawBubbles(p,M,P)); if(P.splash>0.05) add({noShade:true,noRim:true,smear:true},p=>drawSplash(p,M,sk,P)); return; }
    const sp=fur?[[0.08,0.8,10,10]]:[[0.25,0.55,6,16]];
    const oT={sp:20,spines:fur?[[0.05,0.6,8,9]]:[[0.1,0.35,4,12]],cracks:fur?3:0};
    const oB={sp:30,ph,wounds:[{s:0.3,u:-0.35,a:13,b:0.42,ribs:3}],moss:[[0.38,0.7]],spines:sp,cracks:fur?4:0};
    const oN={sp:32,wounds:[{s:0.36,u:0.05,a:15,b:0.5,ribs:4,drip:1}],moss:[[0.08,0.24]],spines:fur?[[0.2,0.95,9,10]]:[[0.62,0.86,5,13]],cracks:fur?6:0};
    const oF={sp:34,ph:ph+11,wounds:[{s:0.24,u:-0.5,a:14,b:0.4,ribs:3,drip:1}],moss:[[0.32,0.5],[0.72,0.84]],spines:fur?[[0.2,0.6,9,11]]:[],cracks:fur?5:0};
    const tailT=()=>tubePart(add,M,sk.tail,WY.tail,oT,fur,seed+1,t,1);
    if(!P.tf) tailT();
    tubePart(add,M,sk.back,WY.back,oB,fur,seed+2,t,2);
    add({},p=>{ p.id(); clipTop(WY.back,()=>drawAguape(p,M,sk.back,0.52,1)); });
    tubePart(add,M,sk.neck,WY.neck,oN,fur,seed+3,t,3);
    add({},p=>{ clipTop(WY.neck,()=>drawHarpoon(p,M,sk,P)); });
    tubePart(add,M,sk.front,WY.front,oF,fur,seed+4,t,4);
    add({},p=>{ p.id(); clipTop(WY.front,()=>drawRopeWraps(p,M,sk.front)); });
    add({},p=>{ p.id(); clipTop(WY.front,()=>drawAguape(p,M,sk.front,0.42,5)); });
    // cabeça (corte na linha d'água quando mergulha/atola)
    const hc=(fn)=>(p=>{ p.id(); clipTop(GROUND-6,()=>fn(p)); });
    add({},hc(p=>drawMouth(p,M,sk,P)));
    add({},hc(p=>drawHead(p,M,sk,P,form)));
    add({noShade:true,noRim:true},hc(p=>drawTongue(p,M,sk,P)));
    add({noShade:true,noRim:true},hc(p=>drawEyeGlow(p,M,sk,P,form)));
    if(P.tf) tailT();
    // efeitos
    add({noShade:true,noRim:true},p=>{ p.id(); drawMud(p,M,sk,P); drawDrips(p,M,sk,P); drawBubbles(p,M,P); });
    if(P.splash>0.05) add({noShade:true,noRim:true,smear:true},p=>drawSplash(p,M,sk,P));
    if(P.smear) add({noShade:true,noRim:true,smear:true},p=>drawSmear(p,M,sk,P,anim));
    if(P.ring>0.05) add({noShade:true,noRim:true,smear:true},p=>drawRing(p,M,sk,P));
    if(P.roar) add({noShade:true,noRim:true,smear:true},p=>drawRoar(p,M,sk,P));
    if(P.impact) add({noShade:true,noRim:true,smear:true},p=>drawImpact(p,M,sk,P,anim));
  }
  function anchors(sk,P){
    const ua=-rad(Math.max(0,Math.min(1,P.jaw))*14), e=rotH(EYE,sk.a+ua), m=rotH([82,2],sk.a), h=rotH([36,-14],sk.a), T=sk.neck, b=AT(T,T.ix(T.L*0.4),0);
    const tl=AT(sk.tail,sk.tail.len-1,0);
    return {eye:P2(sk.H.x+e[0],sk.H.y+e[1]),mouth:P2(sk.H.x+m[0],sk.H.y+m[1]),hand:P2(sk.H.x+m[0],sk.H.y+m[1]),head:P2(sk.H.x+h[0],sk.H.y+h[1]),back:b,tail:tl};
  }

  /* ---------------- adereços (quadro pequeno) ----------------
     Espiras da constrição em volta do lutador (frente pra +x = lado da cobra fica em -x), bolhas do mergulho,
     círculo do Olhar de Lua. */
  const PFW=200, PFH=180, PG=166, PAX=100;
  function loopTube(cx,cy,rx,ry,a0,a1,r,tilt){ const pts=[]; for(let k=0;k<=24;k++){ const a=rad(a0+(a1-a0)*k/24); pts.push({x:cx+C(a)*rx,y:cy+S(a)*ry+C(a)*tilt}); } return mkTube(pts,()=>r); }
  function drawCoil(p,M,st,front){
    p.id(); const tg=st?-3:0, rows=[[PG-20,34+tg,9],[PG-48,31+tg,8],[PG-76,28+tg,7]];
    rows.forEach(([cy,rx,ry],k)=>{ const tilt=(k-1)*2;
      const T=front?loopTube(PAX,cy,rx,ry,0,180,15-k,tilt):loopTube(PAX,cy,rx,ry,180,360,14-k,tilt);
      drawTube(p,M,T,{sp:22,ph:k*9,noSpots:false}); });
    if(front){ // trecho que volta pra cobra (sai pela esquerda e entra no chão)
      const T=mkTube(bz({x:PAX-30,y:PG-14},{x:PAX-50,y:PG-6},{x:PAX-70,y:PG-2},{x:PAX-94,y:PG+4},14),()=>15); clipTop(PG+2,()=>drawTube(p,M,T,{sp:24}));
      p.F(M.foam[1]); p.ell(PAX-90,PG+1,16,3); p.F(M.foam[0]); p.rect(PAX-100,PG-1,8,1.4);
      // tensão: linhas de aperto
      if(st){ p.F(M.fx[1]); [[PAX+44,PG-50],[PAX+44,PG-30],[PAX-46,PG-62]].forEach(([x,y],k)=>p.cap(P2(x,y),P2(x+(k===2?-8:8),y-3),1.6,0.5)); }
    }
  }
  function drawRipple(p,M,st){
    p.id(); const Wt=M.water, F=M.foam;
    p.F(Wt[3]); p.ell(PAX,PG-2,46,9); p.F(Wt[2]); p.ell(PAX,PG-3,38,6.4); p.F(Wt[1]); arc(p,PAX,PG-3,30+st*4,5+st,190,350,1.6,12);
    p.F(F[2]); arc(p,PAX-30,PG,26+st*6,6,150,250,2,8); arc(p,PAX+30,PG,26+st*6,6,-70,30,2,8);
    for(let k=0;k<7;k++){ const x=PAX-24+rnd(k,st)*48, y=PG-4-rnd(k+3,st)*10-st*2, r=1.6+rnd(k,st+5)*2.6; p.F(F[2]); p.circle(P2(x,y),r); p.F(F[0]); p.rect(x-r*0.5,y-r*0.6,1,1); }
    // dorso passando por baixo (só a crista)
    p.F(M.spot[1]); p.ell(PAX+st*4-8,PG-4,10,2); p.F(M.scale[1]); p.ell(PAX+st*4+8,PG-4.4,8,1.6);
  }
  function drawMoonMark(p,M,st){
    p.id(); const E=M.eye, G2=M.glow, r=60;
    if(st<2){ p.F(G2[3]); arc(p,PAX,PG-4,r,r*0.36,0,360,2.4,28); p.F(E[2]); arc(p,PAX,PG-4,r*0.7,r*0.25,0,360,1.6,24); p.F(E[1]); p.ell(PAX,PG-4,r*(0.3+st*0.1),r*0.1*(1+st*0.3));
      p.F(E[0]); p.ell(PAX-4,PG-5,r*0.16,r*0.05); return; }
    p.F(G2[2]); p.ell(PAX,PG-4,r,r*0.38); p.F(E[2]); p.ell(PAX,PG-6,r*0.8,r*0.28); p.F(E[1]); p.ell(PAX,PG-8,r*0.5,r*0.18); p.F(E[0]); p.ell(PAX,PG-10,r*0.24,r*0.08);
    sparks(p,E,P2(PAX,PG-30),9,40,4); p.F(E[1]); for(let k=0;k<5;k++) p.cap(P2(PAX-40+k*20,PG-6),P2(PAX-44+k*22,PG-60-rnd(k,2)*30),2.6,0.6);
  }
  function prop(add,P,M,form,anim){ const st=Math.round(P.st||0);
    if(anim==='xCoilB'){ add({},p=>drawCoil(p,M,st,false)); return; }
    if(anim==='xCoilF'){ add({},p=>drawCoil(p,M,st,true)); return; }
    if(anim==='xRipple'){ add({noRim:true},p=>drawRipple(p,M,st)); return; }
    add({noShade:true,noRim:true},p=>drawMoonMark(p,M,st)); }

  return K_.factory({SC:1,FW,FH,GROUND,AX,RIM,ANIMS,NAMES,REST,mats0,skeleton,parts,anchors,PROP:{FW:PFW,FH:PFH,GROUND:PG,AX:PAX},prop});
})();
