/* ===== PET: Papagaio-verdadeiro (vigia tagarela) ===== */
/* PAPA — fonte de arte (editável). Build: npm run art */
/* Chibi hi-bit: cabeção com coroa e rosto amarelos, testa azul, anel creme e íris laranja, bico curvo enorme;
   corpo verde em escamas de pena (8 tons), ombro vermelho, rêmiges azuis, lenço vermelho com lua bordada. */
const PAPA=(function(){
  const {rad,lerp,P2}=PIX, C=PETCORE;
  const FW=76, FH=80, GROUND=72, AX=36, RIM='#a9c8f0', PS=1;
  const VARS={verdadeiro:{nome:'Verdadeiro'}, campeiro:{nome:'Rosto dourado'}, azulao:{nome:'Azulão (raro)'}};
  const mcache={};
  function mats(v){ if(mcache[v]) return mcache[v]; const M={}, AZ=v==='azulao';
    C.mat(M,'green',AZ?'#3a8ad0':'#3fa548',1.1); C.mat(M,'belly',AZ?'#6ab4ec':'#8ccc58',1.05);
    C.mat(M,'yellow',v==='campeiro'?'#ffc83a':'#f2d23a',1.1); C.mat(M,'blue',AZ?'#40d0e8':'#3d8fe0',1.1); C.mat(M,'red','#d8392c',1.1);
    C.mat(M,'remige',AZ?'#2a4a9a':'#2d5f9a',1.05); C.mat(M,'tip',AZ?'#80d0f0':'#c4d84a',1.05); C.mat(M,'beak','#4a4652',0.8); C.mat(M,'ring','#ece6da',0.6);
    C.mat(M,'iris','#f08a24',1.2); C.mat(M,'leg','#8f8a96',0.8); C.mat(M,'scarf','#b8283a',1.1); C.mat(M,'tongue','#d07080',1); C.mat(M,'wood','#7a5232',1); C.mat(M,'leaf','#4fa83a',1.1);
    M.ink=['#2a1620','#160a10','#0e060a','#060204'];
    return (mcache[v]=M); }
  const NAMES={green:'Pena',belly:'Barriga',yellow:'Rosto/coroa',blue:'Testa',red:'Ombro',remige:'Rêmiges',beak:'Bico',scarf:'Lenço',iris:'Íris'};
  const S=Math.sin, Cc=Math.cos, TAU=Math.PI*2;
  const REST={hx:0,alt:0,ang:10,fly:0,wing:0,wingsUp:0,ht:0,jaw:0,crest:0,eye:'open',hop:0,flash:0,tail:0,fluff:0,perch:0,tuck:0,foot:0,fx:null,fxt:0};
  const WV=[-1,-0.75,-0.3,0.15,0.65,1,0.55,-0.3];
  const ANIMS={
    idle:{nome:'Parado',n:8,dur:i=>[170,150,150,170,160,120,120,170][i],pose:i=>{ const p=i/8*TAU, s=S(p);
      return {ht:[0,4,8,10,6,0,-4,-2][i],tail:2*s,hop:0.3*s,fluff:i===3||i===4?0.6:0,eye:i===6?'closed':(i===5?'half':'open')}; }},
    fly:{nome:'Voar',n:8,dur:()=>80,pose:i=>({fly:1,ang:72,alt:10-WV[i]*2.4,wing:WV[i],ht:-52,tail:-6+WV[i]*4})},
    perch:{nome:'No poleiro',n:8,dur:()=>200,pose:i=>{ const p=i/8*TAU; return {perch:1,hop:6+0.4*S(p),ht:6*S(p),fluff:0.4+0.4*S(p),foot:i>=4?1:0,eye:i===3||i===4?'half':(i===5?'closed':'open'),tail:2*S(p)}; }},
    hop:{nome:'Pulinho no chão',n:6,dur:()=>95,pose:i=>{ const up=[0,3,6,6,3,0][i]; return {hop:up,hx:[-2,-1,0,1,2,2][i]*0.6,ang:16-up,ht:-up,tail:up*1.2,wingsUp:i===2||i===3?0.4:0,eye:'open'}; }},
    happy:{nome:'Dancinha',n:8,dur:()=>110,pose:i=>{ const p=i/8*TAU; return {ht:-14+16*S(2*p),ang:16+6*S(2*p),hop:2*Math.max(0,S(2*p)),crest:0.6+0.4*S(2*p),eye:'happy',jaw:6,fx:'note',fxt:i/8,tail:4*S(2*p)}; }},
    talk:{nome:'Tagarelar ("currupaco!")',n:6,dur:i=>[140,110,110,110,110,180][i],pose:i=>[
      {crest:0.4,ht:-4},{crest:0.8,jaw:18,ht:-10,fx:'chat',fxt:0},{crest:0.6,jaw:4,ht:-4,fx:'chat',fxt:0.35},{crest:0.9,jaw:20,ht:-12,fx:'chat',fxt:0.7},{crest:0.5,jaw:6,ht:-2,fx:'chat',fxt:1},{}][i]},
    sleep:{nome:'Dormir',n:8,dur:()=>240,pose:i=>{ const p=i/8*TAU; return {tuck:1,ht:100,fluff:1+0.3*S(p),eye:'sleep',hop:-0.6+0.3*S(p),fx:'zzz',fxt:i/8}; }},
    attack:{nome:'Bicada',n:6,dur:i=>[140,190,80,120,140,140][i],pose:i=>[
      {eye:'angry'}, {ang:4,ht:-22,crest:1,jaw:10,eye:'angry',hx:-2}, {ang:24,ht:8,crest:1,hx:2,eye:'angry',jaw:14}, {ang:32,ht:16,crest:0.8,hx:4,eye:'angry',fx:'hit',fxt:0}, {ang:22,ht:4,hx:2}, {}][i]},
    special:{nome:'Grito "ZUMBI!"',n:6,dur:i=>[160,180,260,240,240,180][i],pose:i=>[
      {eye:'wide',crest:0.4}, {wingsUp:1,crest:0.7,ang:10,eye:'wide'}, {wingsUp:1,crest:1,jaw:28,ang:6,eye:'wide',fx:'shout',fxt:0}, {wingsUp:1,crest:1,jaw:24,hop:5,eye:'wide',fx:'shout',fxt:0.5}, {crest:0.6,jaw:10,fx:'shout',fxt:1}, {}][i]},
    shoulder:{nome:'No ombro do recruta',n:8,dur:()=>200,shoulder:true,pose:i=>{ const p=i/8*TAU; return {ht:5*S(p),tail:2*S(p),hop:0.3*S(p),eye:i===5?'closed':'open',fluff:i===2?0.6:0}; }},
    hurt:{nome:'Dano',n:3,dur:i=>[80,120,170][i],pose:i=>[{flash:1,hx:-3,ht:-16,eye:'closed',crest:1},{hx:-2,ht:-10,eye:'closed',crest:0.8,fluff:1},{eye:'half'}][i]},
  };
  function poseOf(a,i){ const A=ANIMS[a]||ANIMS.idle; return Object.assign({},REST,A.pose(i%A.n)); }
  function tr(c,a,lx,ly){ const co=Math.cos(a), s=Math.sin(a); return {x:c.x+lx*co-ly*s, y:c.y+lx*s+ly*co}; }
  function geo(P){ const Cn={x:AX+P.hx,y:GROUND-12.6-P.hop-P.alt}, a=rad(P.ang); return {C:Cn,a,head:tr(Cn,a,1.8,-12.2),sh:tr(Cn,a,-1,-6)}; }
  /* ---------- desenho ---------- */
  function wingOpen(p,M,base,ang,back){ p.xf(ang,base.x,base.y);
    C.shade(p,[['p',[[0,-3.4],[11,-4.4],[16,-2],[14,3],[0,3.4]]]],M.green,M.greenX,5,{c:P2(7,0),spec:false,lite:!back});
    C.shade(p,[['p',[[7,-4],[14,-2.6],[13.4,2.4],[7,2.6]]]],M.red,M.redX,3,{spec:false,lite:!back});
    for(let k=0;k<5;k++){ C.vol(p,P2(12.6,-2.6+k*1.4),P2(24-k*1.6,-3+k*2.4),2.2,1.5,k%2?M.remigeX:M.remige,M.remigeX,{noLite:back}); }
    p.F(M.green[0]); p.rect(1.6,-3,7,0.7);
    p.id(); }
  function drawLegs(p,M,g,P,near){ if(P.fly) return; const hip=tr(g.C,g.a,near?2.6:-0.6,8.6), y=P.perch?GROUND-6.6:GROUND-1.2;
    if(near&&P.foot){ C.shade(p,[['e',hip.x,hip.y,2.6,2.2]],M.belly,M.bellyX,2,{spec:false}); return; }
    const f={x:hip.x+(near?1:-1.6),y};
    C.vol(p,hip,f,2.4,2,M.leg,M.legX);
    p.F(M.leg[1]); p.cap(f,P2(f.x+3.2,f.y+0.4),1.4,1.2); p.cap(f,P2(f.x-2.4,f.y+0.4),1.3,1.1); p.F(M.ink[1]); p.rect(f.x+3.2,f.y,0.8,0.8); p.rect(f.x-3.2,f.y,0.8,0.8);
    if(near){ C.shade(p,[['e',hip.x-0.4,hip.y-1.4,2.8,2.4]],M.green,M.greenX,2.4,{spec:false}); } }
  function drawBody(p,M,g,P){ const fl=1+0.08*P.fluff;
    // cauda
    p.xf(g.a+rad(P.tail+(P.fly?0:34)),g.C.x,g.C.y);
    C.shade(p,[['p',[[-3.4,6],[3.2,6],[3.8,16],[-2.8,16.4]]]],M.green,M.greenX,3.4,{c:P2(0,12),spec:false});
    p.F(M.greenX[2]); p.rect(-0.4,8,1.2,6); C.shade(p,[['p',[[-2.8,13.6],[3.6,13.4],[3.8,16.4],[-2.8,16.6]]]],M.tip,M.tipX,2,{spec:false});
    p.F(M.remige[1]); p.rect(-2.8,12.4,6.4,1);
    // corpo-ovo com escamas de pena
    p.xf(g.a,g.C.x,g.C.y);
    const B=[['e',0,0.6,7.8*fl,9.4*fl]];
    C.shade(p,B,M.green,M.greenX,7,{c:P2(0,0)});
    C.within(p,B,()=>{ C.shade(p,[['e',3.4,3,4.6,8]],M.belly,M.bellyX,4,{spec:false});
      for(let r=0;r<5;r++) for(let k=0;k<3;k++){ const x=-1+k*2.4+(r%2)*1.2, y=-5+r*3; p.F(r<2?M.greenX[2]:M.bellyX[2]); p.poly([[x,y],[x+1.8,y],[x+0.9,y+1.1]]); } });
    C.tufts(p,[P2(6,4),P2(4.6,9)],1,M.belly[1],2);
    p.id(); }
  function drawWingFolded(p,M,g,P){ if(P.fly||P.wingsUp>=1) return; p.xf(g.a,g.C.x,g.C.y);
    const W=[['e',-2.4,1.2,5,8]];
    C.shade(p,W,M.green,M.greenX,5,{c:P2(-2,0),spec:false});
    C.shade(p,[['e',-1.6,-5.4,3,2.6]],M.red,M.redX,2.6,{spec:false}); p.F(M.yellow[1]); p.rect(-2,-5,1,1);
    C.shade(p,[['p',[[-6,4],[-1,4],[0,13.4],[-3.8,12.4]]]],M.remige,M.remigeX,3,{spec:false});
    p.F(M.remige[0]); p.rect(-4.2,6,0.8,5.6); p.F(M.remigeX[3]); p.rect(-2.2,6,0.6,5.6);
    [[-4.4,0],[-1,0.4],[-3,-2.4]].forEach(([x,y])=>{ p.F(M.greenX[2]); p.poly([[x,y],[x+2,y],[x+1,y+1.2]]); });
    p.id(); }
  function drawHead(p,M,g,P){ const H=g.head;
    // lenço com lua
    p.xf(g.a,g.C.x,g.C.y);
    C.shade(p,[['p',[[-3,-9.4],[6.6,-8.6],[2.6,-2.4]]]],M.scarf,M.scarfX,3,{c:P2(2,-7),spec:false});
    p.F(M.scarfX[3]); p.rect(-2.6,-9.4,9,0.9); p.F(M.ring[0]); p.poly([[1.6,-7],[2.8,-6.6],[2.4,-5.4],[2.8,-4.6],[1.6,-5]]);
    p.F(M.scarf[1]); p.poly([[-4,-9],[-8,-6],[-5.6,-5.6]]);
    if(P.tuck){ // dormindo: cabeça virada pras costas, enfiada na asa
      p.xf(g.a,g.C.x,g.C.y); C.shade(p,[['e',-1,-10,5.6,5]],M.green,M.greenX,5,{spec:false}); C.shade(p,[['e',-1.6,-9,3.4,2.6]],M.yellow,M.yellowX,3,{spec:false});
      C.eye(p,0.4,-11,1.4,1.6,'sleep',M.iris,M.ink[1]); p.F(M.beak[2]); p.poly([[-3,-8],[-6,-7],[-3.6,-6]]); p.id(); return; }
    const ha=g.a*0.6+rad(P.ht); p.xf(ha,H.x,H.y);
    if(P.crest>0){ const L=2+P.crest*5; C.shade(p,[['p',[[-4,-4],[-6-L*0.6,-6-L],[-2,-6.4]]]],M.green,M.greenX,2,{spec:false}); C.shade(p,[['p',[[-2.4,-5.6],[-2-L*0.4,-8-L],[0.6,-6]]]],M.yellow,M.yellowX,2,{spec:false}); }
    const HD=[['e',0,0,7.4,7]];
    C.shade(p,HD,M.green,M.greenX,6,{c:P2(0,0)});
    C.within(p,HD,()=>{ C.shade(p,[['e',-0.6,-5,4,2.4]],M.yellow,M.yellowX,3,{spec:false}); C.shade(p,[['e',2.6,2,4.4,3.8]],M.yellow,M.yellowX,3.4,{spec:false}); C.shade(p,[['e',4.6,-3.4,2.6,1.8]],M.blue,M.blueX,2,{spec:false}); });
    C.tufts(p,[P2(-6.4,-1),P2(-5,4),P2(-1,6.2)],1.1,M.green[1],2);
    // olho com anel creme
    if(P.eye==='open'||P.eye==='wide'||P.eye==='angry'||P.eye==='half') { C.shade(p,[['e',1.6,-0.8,3,3]],M.ring,M.ringX,2.4,{spec:false}); }
    C.eye(p,1.8,-0.8,1.9,2.1,P.eye,M.iris,M.ink[1],{lid:M.green[2],pupil:0.42});
    p.F(M.belly[0]); p.ell(1.4,4,1.6,0.8);
    // bico grande em gancho (mandíbula separada)
    const jb=tr(H,ha,5,2.4); p.xf(ha+rad(P.jaw),jb.x,jb.y);
    if(P.jaw>4){ p.F(M.tongue[2]); p.poly([[-0.6,-1],[3.6,-0.8],[3,1.6],[0,1.4]]); C.shade(p,[['e',1.6,0,1.4,0.8]],M.tongue,M.tongueX,1,{spec:false}); }
    C.shade(p,[['p',[[-0.6,0],[3.8,0.2],[3,2.2],[0,2]]]],M.beak,M.beakX,1.4,{spec:false});
    p.xf(ha,H.x,H.y);
    C.shade(p,[['p',[[4.2,-3.6],[7.6,-2.6],[9.4,0.4],[8.8,3.6],[7.6,4.6],[7.4,2.4],[5.6,1.4],[3.8,1.6]]]],M.beak,M.beakX,3,{c:P2(6.4,0)});
    p.F(M.beakX[3]); p.rect(4.6,-2.6,0.8,0.8);
    p.id(); }
  function drawPerch(p,M,g){ p.id(); const y=GROUND-5.4; C.vol(p,P2(g.C.x-14,y+0.6),P2(g.C.x+14,y-0.4),3,3,M.wood,M.woodX);
    p.F(M.woodX[3]); p.rect(g.C.x-8,y-1,0.7,1.6); p.rect(g.C.x+9,y-1.2,0.7,1.6);
    C.shade(p,[['p',[[g.C.x+11,y-1],[g.C.x+15,y-5],[g.C.x+17,y-3],[g.C.x+13,y]]]],M.leaf,M.leafX,2,{spec:false});
    C.vol(p,P2(g.C.x+12,y+1),P2(g.C.x+12,GROUND),1.6,1.4,M.wood,M.woodX); }
  function drawFx(p,P,g){ p.id(); const F=C.FXC, H=g.head, ha=g.a*0.6+rad(P.ht), m=tr(H,ha,10,1);
    if(P.fx==='zzz'){ [0,0.34,0.67].forEach((o,k)=>{ const u=(P.fxt+o)%1; C.zzz(p,H.x+2+u*6+k,H.y-6-u*10,1.8+u*1.8,F.z); }); }
    if(P.fx==='note'){ [0,0.5].forEach((o,k)=>{ const u=(P.fxt+o)%1; C.note(p,H.x+(k?8:-8)+S(u*6),H.y-6-u*10,2,F.note); }); }
    if(P.fx==='chat'){ C.shout(p,m.x+1+P.fxt*2,m.y,3.4+P.fxt*2,F.bark,3); }
    if(P.fx==='hit'){ C.sparkle(p,m.x+2,m.y+2,3.6,'#fff6c0'); }
    if(P.fx==='shout'){ // balão "!" + ondas
      const bx=H.x+6, by=H.y-20+P.fxt*-2; p.F('#170b1c'); p.ell(bx,by,8.6,6); p.poly([[bx-3,by+4],[bx-6,by+9],[bx,by+5]]);
      p.F('#fff4e0'); p.ell(bx,by,7.6,5); p.poly([[bx-2.6,by+3.6],[bx-5,by+7.6],[bx-0.6,by+4.2]]);
      p.F('#d8392c'); p.rect(bx-0.9,by-3.6,1.8,4.6); p.rect(bx-0.9,by+1.8,1.8,1.6); p.rect(bx-4.6,by-3,1.4,3.4); p.rect(bx-4.6,by+1.6,1.4,1.2); p.rect(bx+3.2,by-3,1.4,3.4); p.rect(bx+3.2,by+1.6,1.4,1.2);
      C.shout(p,m.x+2,m.y,4+P.fxt*3,F.bark,3); }
  }
  const cache=C.mkCache(600);
  function frame(v,anim,fi,step=5){
    if(!VARS[v]) v='verdadeiro'; if(!ANIMS[anim]) anim='idle';
    const K=PIX.getK(), key=v+'|'+anim+'|'+fi+'|'+step+'@'+K, hit=cache.get(key); if(hit) return hit;
    const P=poseOf(anim,fi), M=mats(v), g=geo(P), pw=C.pen;
    const wA=P.fly?rad(-105+P.wing*70):rad(-128), wAn=P.fly?rad(-92+P.wing*78):rad(-112);
    const parts=[];
    if(P.perch) parts.push({draw:(c,u)=>drawPerch(pw(c,u),M,g)});
    if(P.fly||P.wingsUp) parts.push({back:true,draw:(c,u)=>wingOpen(pw(c,u),M,tr(g.C,g.a,-2.4,-6.6),wA,true)});
    parts.push({back:true,draw:(c,u)=>drawLegs(pw(c,u),M,g,P,false)});
    parts.push({draw:(c,u)=>drawBody(pw(c,u),M,g,P)});
    parts.push({draw:(c,u)=>drawLegs(pw(c,u),M,g,P,true)});
    parts.push({draw:(c,u)=>drawWingFolded(pw(c,u),M,g,P)});
    parts.push({draw:(c,u)=>drawHead(pw(c,u),M,g,P)});
    if(P.fly||P.wingsUp) parts.push({draw:(c,u)=>wingOpen(pw(c,u),M,g.sh,wAn,false)});
    if(P.fx) parts.push({noShade:true,noRim:true,smear:true,draw:(c,u)=>drawFx(pw(c,u),P,g)});
    const cv=C.build({FW,FH,GROUND,parts,M,step,flash:P.flash,rim:RIM});
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._fx=sc(tr(g.head,rad(P.ht),10,0)); cv._center=sc(g.C); cv._top=sc({x:g.head.x,y:g.head.y-8}); cv._feet=sc({x:AX+P.hx,y:GROUND}); cv._head=sc(g.head);
    return cache.set(key,cv);
  }
  const META={id:'papagaio', nome:'Papagaio', sub:'verdadeiro', papel:'Pet vigia', hab:'Grito "ZUMBI!"',
    lede:'Um papagaio-verdadeiro tagarela e vigilante, que vê tudo do alto e não guarda segredo: quando fareja uma variante rara, sai voando em círculos e berra "ZUMBI!" pro bando inteiro ouvir.',
    habDesc:'Avisa das variantes raras (Enluarado e Plenilunar) antes de entrarem na tela, e no automático dá +3 s no tempo dos puzzles de baú (de 5 s pra 8 s). Voa ao lado do squad e pousa no ombro do recruta quando o squad para.',
    rows:[['Cabeça','Cabeção chibi com coroa amarela, testa azul, olho com anel de pele creme e íris laranja.','Volume em 7 tons, rosto e coroa amarelos recortados, anel creme e olho com 2 brilhos. Gira até 22° na bicada e na dancinha.'],
      ['Bico','Curvo, cinza-chumbo, ponta em gancho, mandíbula separada que abre ~28°.','Bico em duas peças com reflexo; a de baixo gira e mostra a língua no grito e no tagarelar.'],
      ['Corpo e asas','Corpo-ovo verde com barriga clara e escamas de pena. Asa com ombro vermelho e rêmiges azuis.','Asa dobrada no flanco e, aberta, com coberteiras verdes, faixa vermelha e 5 rêmiges azuis em volume.'],
      ['Cauda e lenço','Cauda quadrada com ponta verde-amarelada. Lenço vermelho-sangue com uma lua bordada.','Cauda com faixa azul e ponta clara; lenço triangular com a lua creme e a ponta do nó atrás da nuca.'],
      ['Especial','Grito: arregala, enche o peito, abre as asas, balão "!!!" e ondas de som.','6 quadros, com o balão e as ondas de som entre o 3º e o 5º quadro. A crista arrepia.']]};
  return {PS,FW,FH,GROUND,AX,VARS,ANIMS,NAMES,mats,poseOf,frame,META,RIM};
})();
