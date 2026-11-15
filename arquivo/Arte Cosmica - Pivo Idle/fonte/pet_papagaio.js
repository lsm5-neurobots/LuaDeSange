/* ===== PET PAPAGAIO (verdadeiro): voa batendo asas, pousa no ombro, grita "ZUMBI!" ===== */
const PAPA=(function(){
  const {rad,mkPen,compose}=PIX;
  const FW=96, FH=104, GROUND=98, AX=46, RIM='#a9c8f0', PS=0.5;
  const VARS={verdadeiro:{nome:'Verdadeiro'}, campeiro:{nome:'Rosto dourado'}, azulao:{nome:'Azulão (raro)'}};
  function mats(v){
    const m={
      green:['#7ad070','#3fa548','#26733a','#164a24'], belly:['#b8e880','#86cc5c','#5a9a3a','#346020'],
      yellow:['#fff0a0','#f2d23a','#b0901a','#6a540a'], blue:['#80c0ff','#3d8fe0','#2a60a8','#163a6a'],
      red:['#ff7a6a','#d8392c','#94201a','#56100c'], remige:['#5a8ad0','#2d5f9a','#1e3e6a','#10223e'],
      beak:['#76727e','#3b3742','#26232c','#141218'], ring:['#fffaf0','#ece6da','#b4ac9a','#6e6858'],
      iris:['#ffc070','#f08a24','#b05a10','#6a3006'], leg:['#b8b2c0','#8f8a96','#625e6a','#3a3640'],
      scarf:['#d84050','#9a1f2c','#651220','#3a0810'], tip:['#e8f080','#c4d84a','#8aa02a','#4e5e14'],
      tongue:['#f0a0b0','#c06070','#8a3a48','#4e1e28'], ink:['#4a3a2a','#2a1a10','#1a100a','#0a0604'],
    };
    if(v==='campeiro'){ m.yellow=['#fff8c0','#ffd23f','#d09a20','#80580e']; m.belly=['#e0f090','#b8d860','#7aa038','#46601e']; }
    if(v==='azulao'){ m.green=['#80c8f0','#3a8ad0','#245c98','#123660']; m.belly=['#b0e0ff','#6ab4ec','#3a7ab8','#1e4470']; m.blue=['#a0f0ff','#40d0e8','#2090b0','#105a70']; m.tip=['#c0f0ff','#80d0f0','#4a90b8','#245470']; }
    return m;
  }
  const NAMES={green:'Pena',belly:'Barriga',yellow:'Rosto/coroa',blue:'Testa',red:'Ombro',remige:'Rêmiges',beak:'Bico',scarf:'Lenço',iris:'Íris'};
  const REST={hx:0,alt:0,ang:18,fly:0,wing:0,wingsUp:0,ht:0,jaw:0,crest:0,eye:'open',hop:0,flash:0,tail:0};
  const WV=[-1,-0.8,-0.35,0.05,0.6,1,0.5,-0.4];
  const ANIMS={
    idle:{nome:'Parado (poleiro)',n:4,dur:()=>230,pose:i=>({ht:[0,5,1,-4][i], tail:[0,2,0,-1][i], eye:i===2?'closed':'open'})},
    fly:{nome:'Voar',n:8,dur:()=>85,pose:i=>({fly:1, ang:64, alt:26-WV[i]*2.5, wing:WV[i], ht:-40})},
    attack:{nome:'Bicada',n:6,dur:i=>[140,190,80,120,140,140][i],pose:i=>[
      {}, {ang:4,ht:-22,crest:1,jaw:10,eye:'angry',hx:-2}, {ang:22,ht:6,crest:1,hx:2,eye:'angry'}, {ang:30,ht:14,crest:0.8,hx:4,impact:1,eye:'angry'}, {ang:22,ht:4,hx:2}, {}][i]},
    special:{nome:'Grito "ZUMBI!"',n:6,dur:i=>[160,180,260,240,240,180][i],pose:i=>[
      {eye:'wide',crest:0.4}, {wingsUp:1,crest:0.7,ang:10,eye:'wide'}, {wingsUp:1,crest:1,jaw:28,ang:6,shout:1,eye:'wide'}, {wingsUp:1,crest:1,jaw:24,hop:5,shout:1,waves:1,eye:'wide'}, {crest:0.6,jaw:10,shout:1}, {}][i]},
    shoulder:{nome:'No ombro do recruta',n:4,dur:()=>230,shoulder:true,pose:i=>({ht:[0,4,1,-3][i], tail:[0,2,0,-1][i], eye:i===2?'closed':'open'})},
    hurt:{nome:'Dano',n:3,dur:i=>[80,120,170][i],pose:i=>[{flash:1,hx:-3,ht:-16,eye:'closed',crest:1},{hx:-2,ht:-10,eye:'closed'},{}][i]},
  };
  function poseOf(a,i){ return Object.assign({},REST,ANIMS[a].pose(i)); }
  function tr(c,a,lx,ly){ const co=Math.cos(a), s=Math.sin(a); return {x:c.x+lx*co-ly*s, y:c.y+lx*s+ly*co}; }
  function geo(P){ const C={x:AX+P.hx,y:GROUND-30-P.hop-P.alt}; const a=rad(P.ang); return {C,a,head:tr(C,a,2,-20)}; }
  function wing(p,M,base,ang,back){
    p.xf(ang,base.x,base.y);
    p.F(M.green[1]); p.poly([[0,-4],[16,-5],[22,-2],[20,3],[0,4]]);
    p.F(M.red[1]); p.poly([[10,-4.6],[20,-3],[19,2.4],[10,3]]);
    p.F(M.remige[1]); for(let k=0;k<4;k++){ p.cap({x:18,y:-2+k*1.6},{x:31-k*1.2,y:-3+k*2.4},2.2,1.6); }
    p.F(M.green[0]); p.rect(2,-3.4,10,1);
    p.id();
  }
  function drawEye(p,M,t,x,y){
    p.F(M.ring[1]); p.ell(x,y,4,4); p.F(M.ink[1]); p.rect(x-4,y+3,8,0.8);
    if(t==='closed'){ p.F(M.ink[1]); p.rect(x-2.4,y,4.8,1); return; }
    const r=t==='wide'?2.6:2.2; p.F(M.iris[1]); p.ell(x+0.6,y,r,r); p.F(M.ink[2]); p.ell(x+0.9,y,1,1.2); p.F(M.ring[0]); p.rect(x-0.6,y-1.6,1.2,1.2);
    if(t==='angry'){ p.F(M.green[3]); p.poly([[x-4,y-5],[x+4,y-3.4],[x+4,y-2.4],[x-4,y-4]]); }
  }
  const cache=new Map();
  function frame(v,anim,fi,step=5){
    const K0=PIX.getK(), K=K0*PS, key=v+anim+fi+step+'@'+K0; if(cache.has(key)) return cache.get(key); PIX.setK(K);
    const P=poseOf(anim,fi), M=mats(v), g=geo(P), sh=tr(g.C,g.a,-1,-9);
    const wAng=P.fly? rad(-95+P.wing*80) : rad(-120);
    const parts=[];
    if(P.fly||P.wingsUp) parts.push({back:true,draw:(c,u)=>wing(mkPen(c,u),M,tr(g.C,g.a,-3,-10),P.fly?rad(-110+P.wing*70):rad(-135),true)});
    if(!P.fly) parts.push({back:true,draw:(c,u)=>{ const p=mkPen(c,u); p.id(); const hip=tr(g.C,g.a,-1,14); const f={x:hip.x-2,y:GROUND-1}; p.F(M.leg[1]); p.cap(hip,f,2.6,2.2); p.cap(f,{x:f.x+4,y:f.y},1.6,1.4); }});
    parts.push({draw:(c,u)=>{ const p=mkPen(c,u); p.xf(g.a+rad(P.tail),g.C.x,g.C.y);
      p.F(M.green[1]); p.poly([[-4,14],[4,14],[5,31],[-3,31]]); p.F(M.green[2]); p.rect(-0.5,17,1.6,12); p.F(M.tip[1]); p.rect(-3,28,8,3);
      p.xf(g.a,g.C.x,g.C.y); p.F(M.green[1]); p.ell(0,0,11,18); p.F(M.belly[1]); p.ell(4,4,7,12);
      p.F(M.green[2]); for(let r=0;r<4;r++) for(let k=0;k<3;k++) p.rect(1+k*2.6+(r%2),-2+r*4,1.4,0.9);
      if(!P.fly && !P.wingsUp){ p.F(M.green[1]); p.ell(-3,2,7.4,14); p.F(M.red[1]); p.ell(-2,-9,3.6,3.4); p.F(M.yellow[1]); p.rect(-2.6,-8,1.4,1.4); p.F(M.red[2]); p.rect(-6,4,4,3);
        p.F(M.remige[1]); p.poly([[-8,6],[-2,6],[-1,21],[-6,19]]); p.F(M.remige[0]); p.rect(-6,8,1,10); }
      p.id(); }});
    if(!P.fly) parts.push({draw:(c,u)=>{ const p=mkPen(c,u); p.id(); const hip=tr(g.C,g.a,3,15); const f={x:hip.x+1,y:GROUND-1}; p.F(M.green[2]); p.ell(hip.x,hip.y-1,3.4,3); p.F(M.leg[1]); p.cap(hip,f,2.8,2.4); p.cap(f,{x:f.x+5,y:f.y},1.8,1.5); p.cap(f,{x:f.x-3,y:f.y},1.6,1.4); p.F(M.ink[1]); p.rect(f.x+5,f.y-0.4,1,1); }});
    parts.push({draw:(c,u)=>{ const p=mkPen(c,u); const H=g.head, ha=rad(P.ht)+(P.fly?rad(40):0);
      p.xf(g.a,g.C.x,g.C.y); p.F(M.scarf[1]); p.poly([[-2,-15],[9,-14],[4,-6]]); p.F(M.scarf[2]); p.rect(2,-13,3,1.4); p.F(M.ring[0]); p.rect(4,-11,1,1);
      p.F(M.scarf[1]); p.poly([[-6,-16],[-11,-12],[-8,-11]]); p.poly([[-5,-15],[-9,-8],[-6,-9]]);
      p.xf(ha,H.x,H.y);
      if(P.crest>0){ p.F(M.green[1]); const L=4+P.crest*7; p.poly([[-7,-6],[-9-L*0.6,-8-L],[-5,-8]]); p.poly([[-5,-8],[-5-L*0.4,-10-L],[-2,-9]]); p.F(M.yellow[1]); p.poly([[-8,-4],[-11-L*0.7,-5-L*0.6],[-7,-7]]); }
      p.F(M.green[1]); p.ell(0,0,11,10.6);
      p.F(M.yellow[1]); p.ell(-1,-8,5.4,2.8); p.ell(3,2,6.4,5.4);
      p.F(M.blue[1]); p.ell(6.4,-5.4,3.4,2.2);
      p.F(M.belly[0]); p.ell(0,4,2.4,1.6);
      drawEye(p,M,P.eye,3,-1);
      if(P.jaw>0){ p.F(M.tongue[1]); p.poly([[8,2],[13,3],[12,7],[8,5]]); }
      p.F(M.beak[1]); p.poly([[7.4,-4.6],[13,-3],[14.6,2.4],[12.6,6.4],[11.4,2],[8,1.4]]); p.F(M.beak[0]); p.rect(8.6,-3.6,3,1);
      p.xf(ha+rad(P.jaw),H.x+8*Math.cos(ha)-2*Math.sin(ha),H.y+8*Math.sin(ha)+2*Math.cos(ha)); p.F(M.beak[1]); p.poly([[0,0],[4.4,0.6],[3.6,2.6],[0,2]]);
      p.id(); }});
    if(P.fly||P.wingsUp) parts.push({draw:(c,u)=>wing(mkPen(c,u),M,sh,P.fly?wAng:rad(-115),false)});
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM}); PIX.setK(K0);
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._fx=sc(tr(g.head,rad(P.ht),15,0)); cv._center=sc(g.C); cv._top=sc({x:g.head.x,y:g.head.y-12}); cv._feet=sc({x:AX+P.hx-2,y:GROUND});
    cache.set(key,cv); return cv;
  }
  const META={id:'papagaio', nome:'Papagaio', sub:'verdadeiro', papel:'Pet vigia', hab:'Grito "ZUMBI!"',
    lede:'Um papagaio-verdadeiro tagarela e vigilante, que vê tudo do alto e não guarda segredo: quando fareja uma variante rara, sai voando em círculos e berra "ZUMBI!" pro bando inteiro ouvir.',
    habDesc:'Avisa das variantes raras (Enluarado e Plenilunar) antes de entrarem na tela, e no automático dá +3 s no tempo dos puzzles de baú (de 5 s pra 8 s). Voa ao lado do squad e pousa no ombro do recruta quando o squad para.',
    rows:[['Cabeça','Elipse grande com coroa amarela, testa azul, olho com anel de pele creme e íris laranja.','Cabeça de 22×21 com coroa e rosto amarelos, testa azul, anel creme com contorno e íris laranja. Gira até 22° na bicada.'],
      ['Bico','Curvo, cinza-chumbo, ponta em gancho, mandíbula separada que abre ~28°.','Bico em duas peças: a de cima com reflexo e gancho, a de baixo gira 28° e mostra a língua no grito.'],
      ['Corpo e asas','Tronco verde-folha com barriga clara e escamas de pena. Asa com ombro vermelho, espelho vermelho e rêmiges azuis.','Tronco 22×36 inclinado 18°. Asa dobrada no flanco e, aberta, com coberteiras verdes, faixa vermelha e 4 rêmiges azuis.'],
      ['Cauda e lenço','Cauda curta quadrada com ponta verde-amarelada. Lenço vermelho-sangue com uma lua bordada.','Cauda de 9×17 com faixa escura. Lenço triangular com dobra, pontinho creme e as 2 pontas do nó atrás da nuca.'],
      ['Especial','Grito: arregala, enche o peito, abre as asas, balão "ZUMBI!" e ondas de som.','6 quadros, com o balão e as ondas de som entre o 3º e o 5º quadro. A crista arrepia até 11 px.']]};
  return {PS,FW,FH,GROUND,AX,VARS,ANIMS,NAMES,mats,poseOf,frame,META,RIM};
})();
