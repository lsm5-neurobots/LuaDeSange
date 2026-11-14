/* GUN — fonte de arte (editável). Build: npm run art */
const GUN=(function(){
  const {P2}=PIX;
  // rampas por tipo (corpo, empunhadura) e por raridade (acento, brilho)
  const KINDS={
    pistola:{body:['#9a9aa8','#4a4a58','#2c2c38','#16161e'], grip:['#b07a4a','#7a4a28','#4e2e18','#2a180a'], len:17, muzzle:P2(17.4,-2.2)},
    laser:{body:['#eef6ff','#9ab4d4','#5a7494','#2a3a58'], grip:['#6a6a78','#3a3a48','#24242e','#121218'], len:24, muzzle:P2(25,-1.6)},
  };
  const TIER={
    comum:{acc:['#d8d8e0','#8a8a98','#5a5a68','#30303c'], glow:['#e8ffff','#7af0ff','#2ab0d8','#10607a']},
    incomum:{acc:['#9af0aa','#4fb06a','#2e7a44','#164226'], glow:['#f0ffe8','#8aff9a','#3ad05a','#167a2a']},
    raro:{acc:['#a8d0ff','#4a8fe0','#2a5aa8','#142c5a'], glow:['#f0f8ff','#8ac8ff','#3a8af0','#16408a']},
    lunar:{acc:['#ffe08a','#e8b030','#9a6a14','#4a320a'], glow:['#fff0e0','#ff6a5a','#e0283a','#7a0c1a']},
  };
  function M(kind,tier){ const K=KINDS[kind]||KINDS.pistola, T=TIER[tier]||TIER.comum;
    return {gbody:kind==='pistola'&&tier==='lunar'?['#7a4a5a','#3a1a2a','#24101c','#12060c']:kind==='pistola'&&tier==='raro'?['#9ab8e0','#3a5a8a','#24385a','#121c30']:K.body, ggrip:K.grip, gacc:T.acc, gglow:T.glow}; }
  // base = punho (empunhadura), ang = direção do cano (rad)
  function draw(p,kind,tier,base,ang,o={}){
    const R=M(kind,tier), B=R.gbody, G=R.ggrip, A=R.gacc, L=R.gglow;
    p.xf(ang,base.x,base.y);
    if(kind==='laser'){
      // coronha curta + punho
      p.F(G[1]); p.poly([[-2.6,-1],[2.4,-1],[3.4,7],[-0.8,7.6]]); p.F(G[2]); [1.4,3.2,5].forEach(y=>p.rect(-1.4,y,3.6,0.8));
      p.F(B[2]); p.poly([[-9,-4],[-3,-4.6],[-3,1.4],[-8,2.6]]); p.F(B[1]); p.rect(-8.6,-4,5.4,2);
      // gatilho
      p.F(B[3]); p.rect(3,0.4,1,2.6); p.F(B[2]); p.rect(2,3,4.4,0.9);
      // corpo principal
      p.F(B[1]); p.poly([[-3.6,-5.6],[16,-5.6],[18,-3.6],[18,1.6],[-3.6,1.8]]);
      p.F(B[0]); p.rect(-2.6,-5.6,17.6,1.2); p.rect(0,-3.4,6,0.8);
      p.F(B[2]); p.rect(-3.6,0.6,21.6,1.2);
      // célula de energia
      p.F(A[2]); p.rect(6,-4.4,8.6,4.6); p.F(L[1]); p.rect(6.8,-3.6,7,3); p.F(L[0]); p.rect(7.2,-3.4,6.2,0.9); p.F(A[1]); [8.6,10.8].forEach(x=>p.rect(x,-4.4,0.9,4.6));
      // bobinas + emissor
      p.F(B[2]); p.rect(18,-3.4,6,3.6);
      p.F(A[1]); [18.6,20.6,22.6].forEach(x=>p.rect(x,-4.4,1.2,5.6)); p.F(A[0]); [18.6,20.6,22.6].forEach(x=>p.rect(x,-4.4,1.2,1));
      p.F(B[1]); p.rect(24,-3,1.6,2.8);
      p.F(L[1]); p.ell(25.6,-1.6,1.2,1.8); p.F(L[0]); p.rect(25.4,-2.6,0.8,1);
      // mira + cabo
      p.F(B[2]); p.rect(2,-8,6,2.4); p.F(L[1]); p.rect(6.6,-7.6,1.2,1.4); p.F(A[2]); p.cap(P2(-6,1.8),P2(1,3.6),1,1);
    } else {
      // empunhadura inclinada
      p.F(G[1]); p.poly([[-3.4,-0.6],[2,-0.6],[2.8,7.4],[-1.8,8]]);
      p.F(G[2]); [1.4,3.4,5.4].forEach(y=>p.rect(-1.8,y,3.6,0.9)); p.F(G[0]); p.rect(1.2,0,0.8,6.6);
      p.F(B[2]); p.rect(-2.6,7,4.4,1.2);
      // guarda-mato + gatilho
      p.F(B[2]); p.poly([[2,0.6],[7,0.6],[7,3.6],[5.8,3.6],[5.8,1.8],[2.4,1.8]]); p.F(B[3]); p.rect(3.2,0.8,1,2.2);
      // armação
      p.F(B[2]); p.rect(-3.6,-1.6,14,2.6);
      // ferrolho
      p.F(B[1]); p.poly([[-4.6,-5.4],[15.4,-5.4],[16,-4.6],[16,-1.4],[-4.6,-1.4]]);
      p.F(B[0]); p.rect(-4,-5.4,19,1); p.F(B[2]); [-3.4,-2,-0.6].forEach(x=>p.rect(x,-4.2,0.7,2.6));
      p.F(B[3]); p.rect(6,-3.6,4.4,1.2);
      // massa de mira / compensador por raridade
      p.F(A[1]); p.rect(14,-6.4,1.4,1.2); p.rect(-4.2,-6.4,1.6,1.2);
      if(tier!=='comum'){ p.F(A[1]); p.rect(16,-5.2,2,4); p.F(A[0]); p.rect(16,-5.2,2,1); }
      if(tier==='lunar'){ p.F(A[0]); [1.6,4.6,7.6,10.6].forEach(x=>p.rect(x,-3.4,1.2,0.8)); p.F(L[1]); p.ell(-0.4,3.4,1,1); }
      if(tier==='incomum'){ p.F(A[1]); p.rect(-2.6,2.2,4.6,1.6); }
      if(tier==='raro'){ p.F(A[0]); p.rect(2,-4.4,10,0.8); }
      p.F(B[3]); p.ell(16.2,-3.2,0.6,0.9);
    }
    p.id();
  }
  // posição da boca do cano no mundo
  function muzzle(kind,base,ang){ const m=(KINDS[kind]||KINDS.pistola).muzzle, c=Math.cos(ang), s=Math.sin(ang); return {x:base.x+m.x*c-m.y*s, y:base.y+m.x*s+m.y*c}; }
  return {KINDS,TIER,M,draw,muzzle};
})();
