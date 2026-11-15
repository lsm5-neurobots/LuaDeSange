/* ===== PET JABUTI (piranga): casco em domo, patas-coluna, se esconde no casco ===== */
const JABU=(function(){
  const {rad,ramp,mkPen,compose,P2}=PIX;
  const FW=110, FH=72, GROUND=66, AX=44, RIM='#a9c8f0', PS=0.62;
  const VARS={piranga:{nome:'Piranga'}, tinga:{nome:'Tinga (escama amarela)'}, musgo:{nome:'Velho de musgo'}};
  function mats(v){
    const m={
      plate:['#54443a','#2c221d','#1e1612','#100a08'], marg:['#66503e','#3d2f26','#2a1f18','#16100c'],
      areola:['#f5d36a','#e3a92e','#a8761a','#5e400c'], skin:['#66564a','#3a302b','#28201c','#16110e'],
      scale:['#f08050','#d9542b','#9a3418','#5a1a0a'], plast:['#ecd090','#d6b46c','#a08448','#5e4c28'],
      beak:['#e2c088','#c7a16a','#957440','#5a4424'], strap:['#b07848','#8a5530','#5e3820','#341e10'],
      metal:['#f0ece0','#c9c3b0','#8e887a','#56524a'], eye:['#ffe0a0','#a8661a','#6a3a0c','#2a1606'],
      mouth:['#f0a0b0','#b05060','#7a3040','#401820'], claw:['#f6f0e4','#c8c0b0','#8a8478','#4e4a44'],
      gold:['#fff6c0','#ffd23f','#d09a20','#80580e'], goldD:['#ffe27a','#c89a20','#8a6414','#4a340a'],
    };
    if(v==='tinga') m.scale=['#fff0a0','#e8c23a','#a8841a','#5e480a'];
    if(v==='musgo'){ m.plate=['#5a6a44','#2e3a24','#1e2618','#10160c']; m.areola=['#d8f080','#9ac044','#5e7e28','#2e4214']; m.marg=['#6a7448','#3e4a2c','#28321c','#141a0e']; }
    return m;
  }
  const NAMES={plate:'Placa',marg:'Marginal',areola:'Aréola',skin:'Pele',scale:'Escama',plast:'Plastrão',beak:'Bico',strap:'Arnês',gold:'Escudo'};
  const REST={hx:0,lift:0,neck:1,ht:0,jaw:0,fn:0,ff:0,rn:0,rf:0,dx:0,hide:0,gold:0,eye:'open',flash:0};
  const ANIMS={
    idle:{nome:'Parado',n:4,dur:()=>240,pose:i=>({neck:1+[0,0.08,0.12,0.06][i], ht:[0,-3,-5,-2][i], eye:i===2?'half':'open'})},
    walk:{nome:'Andar',n:8,dur:()=>150,pose:i=>{ const p=i/8*Math.PI*2, a=Math.max(0,Math.sin(p))*4, b=Math.max(0,Math.sin(p+Math.PI))*4;
      return {fn:a, rf:a, ff:b, rn:b, dx:Math.cos(p)*2, lift:Math.abs(Math.sin(2*p))*1, ht:3*Math.sin(2*p), neck:1+0.06*Math.sin(2*p)}; }},
    attack:{nome:'Bote (mordida)',n:6,dur:i=>[140,180,60,130,150,150][i],pose:i=>[
      {}, {neck:0.45,hx:-2,eye:'angry',ht:-4}, {neck:1.6,jaw:30,hx:2,eye:'angry',lines:1}, {neck:1.55,jaw:0,hx:2,impact:1,eye:'angry'}, {neck:1.2,hx:1}, {}][i]},
    special:{nome:'Casco-Escudo',n:6,dur:i=>[220,160,220,420,200,260][i],pose:i=>[
      {eye:'wide',ht:-10}, {hide:0.5,neck:0.5,eye:'closed'}, {hide:1,gold:1}, {hide:1,gold:1,dome:1}, {hide:0.5,neck:0.6,gold:0}, {eye:'happy',heart:1}][i]},
    hurt:{nome:'Dano',n:3,dur:i=>[80,120,170][i],pose:i=>[{flash:1,hx:-3,eye:'closed',neck:0.7},{hx:-2,eye:'closed',neck:0.8},{}][i]},
  };
  function poseOf(a,i){ return Object.assign({},REST,ANIMS[a].pose(i)); }
  function drawEye(p,M,type,x,y){
    if(type==='closed'){ p.F(M.skin[3]); p.rect(x-1.8,y,3.6,0.9); return; }
    if(type==='happy'){ p.F(M.skin[3]); p.rect(x-1.6,y,1,1); p.rect(x-0.6,y-1,1.2,1); p.rect(x+0.6,y,1,1); return; }
    const r=type==='wide'?2.3:1.8; p.F(M.eye[1]); p.ell(x,y,r,r); p.F(M.skin[3]); p.rect(x+0.1,y-0.9,1.1,1.8); p.F(M.claw[0]); p.rect(x-0.9,y-1.2,0.8,0.8);
    if(type==='half'){ p.F(M.skin[1]); p.rect(x-r,y-r,r*2,r); }
    if(type==='angry'){ p.F(M.skin[3]); p.poly([[x-2.6,y-3.4],[x+2.4,y-2],[x+2.4,y-1.2],[x-2.6,y-2.4]]); }
  }
  function geo(P){ const bx=AX+P.hx, rim=GROUND-9+P.hide*5-P.lift; const nb={x:bx+24,y:rim-4};
    const ext=P.neck*(1-P.hide); const hc={x:nb.x+4+9*ext,y:nb.y-2-3*ext+P.hide*1}; return {bx,rim,nb,hc}; }
  function drawLeg(p,M,x,top,lift,dx,hide,front,near){
    const bottom=GROUND-1-lift-hide*7, foot={x:x+dx,y:bottom};
    if(bottom<=top+1) return;
    p.id(); p.F(M.skin[1]); p.cap({x,y:top},foot,8,7.4);
    if(front){ p.F(M.scale[1]); [[0,2],[2.4,4.6],[-1.6,5.4],[1,7.4]].forEach(([ox,oy])=>{ if(top+oy<bottom-1) p.ell(x+ox,top+oy,1.1,0.9); }); }
    p.F(M.skin[1]); p.ell(foot.x+1,foot.y,4.6,2.4);
    p.F(M.claw[1]); [3.4,4.8,5.6].forEach((cx,k)=>p.rect(foot.x+cx-1,foot.y-1.6+k*0.9,1,1));
  }
  const cache=new Map();
  function frame(v,anim,fi,step=5){
    const K0=PIX.getK(), K=K0*PS, key=v+anim+fi+step+'@'+K0; if(cache.has(key)) return cache.get(key); PIX.setK(K);
    const P=poseOf(anim,fi), M=mats(v), g=geo(P);
    const PL=P.gold?M.gold:M.plate, MG=P.gold?M.goldD:M.marg, AR=P.gold?M.gold:M.areola;
    const parts=[
      {back:true, draw:(c,u)=>{ const p=mkPen(c,u); drawLeg(p,M,g.bx+20,g.rim-1,P.ff,P.dx,P.hide,true,false); drawLeg(p,M,g.bx-14,g.rim-1,P.rf,P.dx,P.hide,false,false); }},
      {draw:(c,u)=>{ const p=mkPen(c,u); p.id(); p.F(M.skin[1]); p.cap({x:g.bx-28,y:g.rim-3},{x:g.bx-34,y:g.rim+1},5,2); p.F(M.scale[1]); p.rect(g.bx-31,g.rim-2,1.2,1.2); }},
      {draw:(c,u)=>{ const p=mkPen(c,u); if(P.hide>=1) return; p.id(); p.F(M.skin[1]); p.cap(g.nb,g.hc,9,7.4); p.F(M.scale[1]); const m=PIX.lerp(g.nb,g.hc,0.5); p.ell(m.x,m.y-1.6,1,0.9); p.ell(m.x+1.6,m.y+1.2,0.9,0.8);
        p.xf(rad(P.ht),g.hc.x,g.hc.y); p.F(M.skin[1]); p.ell(0,0,8,6.4);
        p.F(M.scale[1]); [[-3,-4.2],[0.6,-5],[-5,-0.6],[-1.6,2.6]].forEach(([x,y])=>p.ell(x,y,1.2,1)); p.F(M.areola[1]); p.ell(-1,-5.6,1.1,0.8);
        if(P.jaw>0){ p.F(M.mouth[1]); p.poly([[5,0],[10,0.6],[9,4],[5,3]]); }
        p.F(M.beak[1]); p.poly([[5,-3],[9.6,-1.8],[10.6,1.4],[8.6,1.4],[5,1]]); p.F(M.beak[3]); p.rect(8.4,-1.6,0.8,0.8);
        p.xf(rad(P.ht+P.jaw),g.hc.x+5*Math.cos(rad(P.ht))-1*Math.sin(rad(P.ht)),g.hc.y+5*Math.sin(rad(P.ht))+1*Math.cos(rad(P.ht)));
        p.F(M.beak[1]); p.poly([[0,0],[4.4,0.4],[3.6,2.4],[0,2]]);
        p.xf(rad(P.ht),g.hc.x,g.hc.y); drawEye(p,M,P.eye,2,-1.6); p.id(); }},
      {draw:(c,u)=>{ const p=mkPen(c,u); p.id(); const {bx,rim}=g;
        p.F(M.plast[1]); p.poly([[bx-29,rim-1],[bx+29,rim-1],[bx+27,rim+3],[bx-27,rim+3]]); p.F(M.plast[2]); p.rect(bx-14,rim,1,3); p.rect(bx+10,rim,1,3);
        const dome=(rx,ry,dy)=>{ const pts=[]; for(let k=0;k<=24;k++){ const t=Math.PI*k/24; pts.push([bx+Math.cos(t)*rx, rim+dy-Math.sin(t)*ry]); } return pts; };
        p.F(MG[1]); p.poly(dome(31,25,0)); p.F(PL[1]); p.poly(dome(27,21,-3));
        p.F(MG[2]); for(let k=-4;k<=4;k++) p.rect(bx+k*6.4-0.5,rim-4,1,4);
        p.F(AR[1]); for(let k=-4;k<=4;k++) p.ell(bx+k*6.4+3.2,rim-2,1.2,1);
        p.F(PL[2]); [[-14,-24,-12,-4],[0,-25,0,-4],[14,-24,12,-4]].forEach(([x0,y0,x1,y1])=>p.poly([[bx+x0-0.5,rim+y0*0.88],[bx+x0+0.5,rim+y0*0.88],[bx+x1+0.5,rim+y1],[bx+x1-0.5,rim+y1]])); p.rect(bx-24,rim-12,48,1);
        [[-7,-19,3.4,2.6],[7,-19,3.4,2.6],[0,-21.5,2.6,1.8],[-19,-8,3,2.2],[-6,-9,3.4,2.4],[6,-9,3.4,2.4],[19,-8,3,2.2]].forEach(([x,y,rx,ry])=>{ p.F(AR[2]); p.ell(bx+x,rim+y,rx+0.8,ry+0.8); p.F(AR[1]); p.ell(bx+x,rim+y,rx,ry); p.F(AR[0]); p.ell(bx+x-0.8,rim+y-0.7,rx*0.4,ry*0.36); });
        if(!P.gold){ p.F(M.strap[1]); p.poly([[bx-6,rim-24],[bx-2,rim-24.6],[bx+12,rim-1],[bx+8,rim-1]]); p.F(M.strap[0]); [0.25,0.45,0.65,0.85].forEach(t=>p.rect(bx-4+14*t,rim-24+23*t,0.8,0.8));
          p.F(M.metal[1]); p.rect(bx+1.6,rim-14,4.4,3.4); p.F(M.metal[3]); p.rect(bx+2.8,rim-13,2,1.4); p.F(M.metal[1]); p.ell(bx-4,rim-25.6,2,1.6); }
      }},
      {draw:(c,u)=>{ const p=mkPen(c,u); drawLeg(p,M,g.bx+16,g.rim+1,P.fn,P.dx,P.hide,true,true); drawLeg(p,M,g.bx-18,g.rim+1,P.rn,P.dx,P.hide,false,true); }},
    ];
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM}); PIX.setK(K0);
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._fx=sc({x:g.hc.x+10,y:g.hc.y}); cv._center=sc({x:g.bx,y:g.rim-12}); cv._top=sc({x:g.bx,y:g.rim-28});
    cache.set(key,cv); return cv;
  }
  const META={id:'jabuti', nome:'Jabuti', sub:'piranga', papel:'Pet tanque', hab:'Casco-Escudo',
    lede:'Um jabuti-piranga velho de guerra, teimoso e calmo, lento demais pra andar sozinho: vai preso nas costas do recruta por um arnês de couro e só desce pra morder ou virar escudo.',
    habDesc:'Recolhe cabeça e patas, o casco fica dourado e uma cúpula de luz protege quem está atrás dele. No jogo: bloqueia o próximo golpe que atingiria o recruta.',
    rows:[['Cabeça','Oval escura com escamas vermelho-alaranjadas e uma amarela no topo, bico córneo em gancho, mandíbula que abre ~28°.','Cabeça de 16×13 com 5 escamas e o bico bege em duas peças. A mandíbula é separada e abre 30° no bote, mostrando a boca rosada.'],
      ['Casco','Domo alto quase preto, placas de centro amarelo-ouro, 9 marginais com pinta amarela.','Domo de 62×25 em duas camadas (marginal e placa), sulcos entre as placas, 7 aréolas amarelas com brilho interno e 9 pintas na borda.'],
      ['Patas','Quatro patas-coluna curtas, as dianteiras com escamas, pés com 3 garras claras.','Patas de 8 px, as do lado de lá um tom mais escuras, com escamas na dianteira e 3 garras de 1 px.'],
      ['Arnês','Cinta de couro com pesponto, fivela de metal e argola no topo.','Cinta diagonal com 4 pespontos, fivela clara e argola. Some no Casco-Escudo, quando o casco vira ouro.'],
      ['Especial','Casco-Escudo: recolhe, fica dourado com cúpula de luz, sai feliz com coração.','6 quadros: susto, recolhe, casco dourado, cúpula (420 ms), sai e olho ^ com coração.']]};
  return {PS,FW,FH,GROUND,AX,VARS,ANIMS,NAMES,mats,poseOf,frame,META,RIM};
})();
