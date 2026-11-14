/* ===== PET: Jabuti-piranga (tanque teimoso de casco dourado) ===== */
/* JABU — fonte de arte (editável). Build: npm run art */
/* Chibi hi-bit: casco em domo alto com placas de aréola amarela, marginais pintadas, arnês de couro;
   cabeção de velho rabugento-fofo com escamas vermelhas, sobrancelha franzida e olhão âmbar. */
const JABU=(function(){
  const {rad,lerp,P2}=PIX, C=PETCORE;
  const FW=76, FH=60, GROUND=54, AX=36, RIM='#a9c8f0', PS=1;
  const VARS={piranga:{nome:'Piranga'}, tinga:{nome:'Tinga (escama amarela)'}, musgo:{nome:'Velho de musgo'}};
  const mcache={};
  function mats(v){ if(mcache[v]) return mcache[v]; const M={};
    C.mat(M,'plate',v==='musgo'?'#3e4a2c':'#3e3028',1); C.mat(M,'marg',v==='musgo'?'#4e5a34':'#4e3c2e',1);
    C.mat(M,'areola',v==='musgo'?'#a8cc4a':'#ecb030',1.15); C.mat(M,'skin','#4e4038',1); C.mat(M,'scale',v==='tinga'?'#ecc43a':'#e2582c',1.15);
    C.mat(M,'plast','#dcbc78',1); C.mat(M,'beak','#d4b07a',1); C.mat(M,'strap','#9a6438',1.05); C.mat(M,'metal','#c9c3b0',0.8);
    C.mat(M,'iris','#d88a2a',1.2); C.mat(M,'mouth','#c05a6a',1.1); C.mat(M,'claw','#e8e0d0',0.6); C.mat(M,'gold','#ffd23f',1.1); C.mat(M,'moss','#6aa83a',1.1); C.mat(M,'leaf','#58b040',1.1);
    M.ink=['#2a1620','#160a10','#0e060a','#060204'];
    return (mcache[v]=M); }
  const NAMES={plate:'Placa',marg:'Marginal',areola:'Aréola',skin:'Pele',scale:'Escama',plast:'Plastrão',beak:'Bico',strap:'Arnês',gold:'Escudo'};
  const S=Math.sin, Cc=Math.cos, TAU=Math.PI*2;
  const REST={hx:0,lift:0,rock:0,neck:1,ht:0,jaw:0,fn:[0,0],ff:[0,0],rn:[0,0],rf:[0,0],hide:0,gold:0,eye:'open',flash:0,brow:1,fx:null,fxt:0,leaf:0,dome:0};
  const step=(p,o,A,H)=>[A*Cc(p+o),H*Math.max(0,S(p+o))];
  const ANIMS={
    idle:{nome:'Parado',n:8,dur:()=>200,pose:i=>{ const p=i/8*TAU, s=S(p);
      return {neck:0.92+0.08*s,ht:-2*s,lift:0.3*s,jaw:i===2||i===3?4:0,eye:i===6?'closed':(i===5||i===7?'half':'open')}; }},
    walk:{nome:'Andar',n:8,dur:()=>150,pose:i=>{ const p=i/8*TAU;
      return {fn:step(p,0,2.4,2.2),rf:step(p,0.3,2.4,2.2),ff:step(p,Math.PI,2.4,2.2),rn:step(p,Math.PI+0.3,2.4,2.2),rock:1.6*S(2*p),lift:0.5*Math.abs(S(2*p)),neck:1+0.06*S(2*p),ht:-3*S(2*p+0.5),eye:'open'}; }},
    run:{nome:'Correria (no ritmo dele)',n:6,dur:()=>90,pose:i=>{ const p=i/6*TAU;
      return {fn:step(p,0,3.4,3.4),rf:step(p,0.3,3.4,3.4),ff:step(p,Math.PI,3.4,3.4),rn:step(p,Math.PI+0.3,3.4,3.4),rock:3*S(2*p),lift:1.2*Math.abs(S(2*p)),neck:1.15,ht:-8,eye:'wide',brow:0,jaw:6,fx:'dust',fxt:i/6}; }},
    lie:{nome:'Recolhido',n:4,dur:()=>260,pose:i=>({neck:0.15,hide:1,lift:-2.6,eye:i===2?'closed':'half',ht:4})},
    sleep:{nome:'Dormir',n:8,dur:()=>260,pose:i=>{ const p=i/8*TAU; return {neck:0.35,hide:0.7,lift:-1.8+0.3*S(p),ht:14,eye:'sleep',fx:'zzz',fxt:i/8,dome:0.3*S(p)}; }},
    happy:{nome:'Feliz',n:8,dur:()=>120,pose:i=>{ const p=i/8*TAU, up=Math.max(0,S(2*p));
      return {neck:1.2,ht:-14+10*S(2*p),rock:-5*up,fn:[1,3*up],ff:[1,3*up],lift:1.4*up,eye:'happy',jaw:8,brow:0,fx:'heart',fxt:i/8}; }},
    chomp:{nome:'Comer folha',n:8,dur:i=>[180,140,120,140,120,140,120,220][i],pose:i=>[
      {neck:1.1,ht:12,leaf:1,eye:'open'},{neck:1.2,ht:16,jaw:14,leaf:1,eye:'wide'},{neck:1.05,ht:8,jaw:0,leaf:0.7,eye:'happy'},{neck:1,ht:4,jaw:6,leaf:0.45,eye:'happy'},
      {neck:1,ht:2,jaw:0,leaf:0.3,eye:'happy'},{neck:1,ht:0,jaw:6,leaf:0.15,eye:'happy'},{neck:1,ht:0,jaw:0,eye:'happy'},{neck:1,ht:-4,eye:'open',jaw:3}][i]},
    attack:{nome:'Bote (mordida)',n:6,dur:i=>[140,180,60,130,150,150][i],pose:i=>[
      {neck:0.9,eye:'angry'},{neck:0.55,ht:-10,eye:'angry',lift:0.6,rock:-2},{neck:1.6,ht:6,jaw:30,eye:'angry',rock:3},{neck:1.5,ht:4,jaw:0,eye:'angry',rock:2},{neck:1.1,ht:0},{}][i]},
    special:{nome:'Casco-Escudo',n:6,dur:i=>[220,160,220,420,200,260][i],pose:i=>[
      {eye:'wide',neck:1.1,ht:-6,brow:0},{neck:0.2,hide:1,lift:-2.6,eye:'closed'},{neck:0.15,hide:1,lift:-2.6,gold:1},{neck:0.15,hide:1,lift:-2.6,gold:2},{neck:0.8,hide:0.3,gold:1,eye:'happy'},{eye:'happy',fx:'heart',fxt:0.3}][i]},
    hurt:{nome:'Dano',n:3,dur:i=>[80,120,170][i],pose:i=>[{flash:1,hx:-3,eye:'closed',neck:0.7},{hx:-2,eye:'closed',neck:0.8,rock:-4},{eye:'half'}][i]},
  };
  function poseOf(a,i){ const A=ANIMS[a]||ANIMS.idle; return Object.assign({},REST,A.pose(i%A.n)); }
  /* ---------- geometria ---------- */
  function geo(P){ const O={x:AX+P.hx-2,y:GROUND-10.4-P.lift}, a=rad(P.rock), c=Math.cos(a), s=Math.sin(a);
    const T=(lx,ly)=>({x:O.x+lx*c-ly*s, y:O.y+lx*s+ly*c});
    const nk=Math.max(0.1,P.neck), base=T(12,-3), hc={x:base.x+9.6*nk, y:base.y-6.6*nk+2.4*(1-nk)};
    return {O,T,a,base,hc,ha:rad(P.ht)+a*0.4}; }
  /* ---------- desenho ---------- */
  function leg(p,M,g,P,lx,key,front){ const st=P[key], h=1-P.hide*0.85;
    const root=g.T(lx,2), foot={x:root.x+st[0]*h, y:Math.min(GROUND-1.6,root.y+6.6*h-st[1])};
    C.vol(p,root,foot,front?5:5.4,4.6,M.skin,M.skinX);
    if(front&&h>0.4){ p.F(M.scale[2]); p.ell(lerp(root,foot,0.45).x+0.8,lerp(root,foot,0.45).y,1.3,1); p.F(M.scale[1]); p.ell(lerp(root,foot,0.45).x+1.1,lerp(root,foot,0.45).y-0.3,0.9,0.6); }
    if(h>0.4){ C.shade(p,[['e',foot.x+0.8,foot.y+0.6,3,1.6]],M.skin,M.skinX,2,{spec:false}); p.F(M.claw[1]); [0,1.3,2.6].forEach(k=>p.rect(foot.x+0.4+k,foot.y+1.2,0.8,0.8)); }
  }
  function drawShell(p,M,g,P,v){ const G=P.gold, R=G?M.gold:M.plate, X=G?M.goldX:M.plateX, MR=G?M.gold:M.marg, MX=G?M.goldX:M.margX;
    p.xf(g.a,g.O.x,g.O.y);
    // plastrão (barriga) aparece embaixo
    C.shade(p,[['e',1,3.2,15,2.6]],M.plast,M.plastX,2.4,{spec:false});
    // domo
    const dh=16+(P.dome||0), dome=[]; for(let k=0;k<=16;k++){ const t=Math.PI*k/16; dome.push([-Math.cos(t)*17.6,-Math.sin(t)*dh+0.6]); }
    C.shade(p,[['p',dome]],R,X,12,{c:P2(0,-7)});
    // placas: sulcos e aréolas
    if(!G||G<2){ const sc=[[-11,-6,4,3.4],[-4,-10.6,4.4,3.6],[4,-10.4,4.4,3.6],[11,-6,3.8,3.2],[0,-4.4,4,2.6],[-8,-1.6,3.4,2],[8,-1.6,3.4,2]];
      p.F(X[3]); p.poly([[-14,-1],[-7.4,-8.4],[0,-13.6],[7.4,-8.4],[14,-1],[13.4,-0.4],[7,-7.6],[0,-12.4],[-7,-7.6],[-13.4,-0.4]]);
      p.F(X[3]); p.rect(-0.4,-15.6,0.9,15); p.poly([[-7.4,-8.4],[-4,-3],[-3.4,-3.4],[-6.8,-8.8]]); p.poly([[7.4,-8.4],[4,-3],[3.4,-3.4],[6.8,-8.8]]);
      sc.forEach(([x,y,rx,ry])=>{ C.shade(p,[['e',x,y,rx*0.92,ry*0.92]],X,X,rx,{lite:false}); p.F(R[0]); p.ell(x+rx*0.25,y-ry*0.55,rx*0.6,ry*0.22); C.shade(p,[['e',x+0.3,y-0.2,rx*0.48,ry*0.46]],G?M.gold:M.areola,G?M.goldX:M.areolaX,rx*0.5,{spec:true}); });
    }
    // marginais (borda serrilhada com pinta)
    for(let k=0;k<9;k++){ const x=-16+k*4; p.F(k%2?MX[2]:MR[1]); p.poly([[x-0.2,0],[x+3.8,0],[x+3.6,3],[x+1.8,3.8],[x,3]]); p.F(G?M.goldX[0]:M.areola[1]); p.rect(x+1.2,1,1.4,1.2); p.F(MX[3]); p.rect(x+3.6,0,0.6,3); }
    p.F(MR[0]); p.rect(-15,-0.4,24,0.7);
    if(v==='musgo'&&!G){ C.shade(p,[['e',-5,-14,4,1.6],['e',2,-15.4,3.4,1.2]],M.moss,M.mossX,3,{spec:false}); p.F(M.moss[0]); p.rect(-6,-15,1,1); p.rect(1,-16.4,1,0.8); }
    // arnês de couro com fivela e argola
    if(!G){ p.F(M.strapX[2]); p.poly([[-9.6,-12.6],[-7.2,-13.4],[8.8,0.8],[6.4,1.4]]); p.F(M.strap[1]); p.poly([[-9.2,-12.8],[-7.6,-13.3],[8.2,0.6],[6.8,1]]);
      p.F(M.strap[0]); [0,1,2,3].forEach(k=>p.rect(-6.4+k*3.6,-10.6+k*3.1,0.8,0.6));
      C.shade(p,[['e',-1,-6.6,2,1.8]],M.metal,M.metalX,1.8); p.F(M.metalX[3]); p.rect(-1.4,-7,0.9,0.9);
      p.F(M.metal[2]); p.ell(-8.4,-14.6,1.8,1.4); p.F(M.plateX[3]); p.ell(-8.4,-14.6,0.9,0.6); }
    p.id(); }
  function drawHead(p,M,g,P){ const nk=Math.max(0.1,P.neck); if(nk<0.2&&P.hide>0.9){ // só o rosto espiando na abertura
      const q=g.T(13.6,-1.6); p.F(M.skinX[3]); p.ell(q.x,q.y,3,2.4); C.eye(p,q.x+0.6,q.y-0.2,1,1.2,P.eye,M.iris,M.ink[1]); return; }
    // pescoço enrugado
    C.vol(p,g.base,lerp(g.base,g.hc,0.95),5.6,5,M.skin,M.skinX);
    p.F(M.skinX[2]); [0.3,0.55].forEach(t=>{ const q=lerp(g.base,g.hc,t); p.rect(q.x-1.6,q.y+0.6,2.6,0.6); });
    const h=g.hc; p.xf(g.ha,h.x,h.y);
    const HD=[['e',1.6,-1.6,7.2,6],['e',5.4,0.4,4.6,4]];
    C.shade(p,HD,M.skin,M.skinX,5.4,{c:P2(2,-1),hl:1.5});
    // escamas vermelhas
    C.within(p,HD,()=>{ [[-1.6,-5,1.8,1.4],[1.6,-5.8,1.7,1.3],[-3.6,-2,1.6,1.4],[-1,1.4,1.6,1.2],[4.8,-4.6,1.2,1]].forEach(([x,y,rx,ry],k)=>{ const sc=(k===1)?M.areola:M.scale, sx=(k===1)?M.areolaX:M.scaleX; C.shade(p,[['e',x,y,rx,ry]],sc,sx,rx,{spec:false}); }); });
    // boca/mandíbula
    p.xf(g.ha+rad(P.jaw),h.x+Math.cos(g.ha)*4.2-Math.sin(g.ha)*2,h.y+Math.sin(g.ha)*4.2+Math.cos(g.ha)*2);
    if(P.jaw>4){ p.F(M.mouth[2]); p.poly([[-1,-0.6],[5,-0.8],[4.6,0.8],[-0.6,0.6]]); }
    C.shade(p,[['p',[[-1.6,0],[5,-0.4],[4.4,1.8],[0,2.2]]]],M.beak,M.beakX,1.8,{spec:false});
    p.xf(g.ha,h.x,h.y);
    // bico de cima em gancho
    C.shade(p,[['p',[[4.4,-2.4],[8.6,-1.6],[9.4,0.6],[8.2,2.6],[7.2,1.4],[4,1.4]]]],M.beak,M.beakX,2.4,{c:P2(6.6,0)});
    p.F(M.ink[1]); p.rect(8,-1.2,0.8,0.7);
    if(P.leaf>0){ const L=P.leaf; p.F(M.leaf[1]); p.poly([[7,1.6],[7+7*L,-0.6],[7+8*L,2.6],[7+3*L,3.4]]); p.F(M.leaf[0]); p.poly([[7.6,1.6],[7+6*L,0],[7+6*L,0.6]]); p.F(M.leafX[2]); p.rect(7,1.8,6*L,0.5); }
    // olho grande e sobrancelha rabugenta
    C.eye(p,3,-2,2.4,2.7,P.eye,M.iris,M.ink[1],{lid:M.skin[2]});
    if(P.brow&&P.eye!=='happy'&&P.eye!=='sleep'&&P.eye!=='closed'){ p.F(M.skinX[3]); p.poly([[0,-5.4],[5.6,-4.6],[5.6,-3.9],[0,-4.6]]); p.F(M.skin[0]); p.rect(0.4,-6.3,4.4,0.7); }
    p.F(M.mouthX[0]); if(P.eye==='happy') p.ell(4.6,1.4,1.2,0.6);
    p.id(); }
  function drawFx(p,P,g){ p.id(); const F=C.FXC, h={x:g.hc.x,y:g.hc.y-8};
    if(P.fx==='zzz'){ const q=g.T(16,-10); [0,0.34,0.67].forEach((o,k)=>{ const u=(P.fxt+o)%1; C.zzz(p,q.x+u*6+k,q.y-u*12,1.8+u*1.8,F.z); }); }
    if(P.fx==='heart'){ [0,0.5].forEach((o,k)=>{ const u=(P.fxt+o)%1; C.heart(p,h.x+(k?6:-4),h.y-u*10,1.3+u*0.8,F.heart[0],F.heart[1]); }); }
    if(P.fx==='dust'){ const q=g.T(-17,4); C.dust(p,q.x-2-P.fxt*4,GROUND-2-P.fxt*2,1.6+P.fxt,F.dust[0],F.dust[1]); }
    if(P.gold===2){ const c=g.T(0,-6), r=22; p.F('#ffe27a'); for(let k=0;k<=14;k++){ const a=Math.PI+Math.PI*k/14; p.rect(c.x+Math.cos(a)*r-0.6,c.y+Math.sin(a)*r*0.9-0.6,1.3,1.3); }
      C.sparkle(p,c.x-12,c.y-16,2.2,'#fff6c0'); C.sparkle(p,c.x+14,c.y-12,1.6,'#fff6c0'); }
  }
  const cache=C.mkCache(500);
  function frame(v,anim,fi,step=5){
    if(!VARS[v]) v='piranga'; if(!ANIMS[anim]) anim='idle';
    const K=PIX.getK(), key=v+'|'+anim+'|'+fi+'|'+step+'@'+K, hit=cache.get(key); if(hit) return hit;
    const P=poseOf(anim,fi), M=mats(v), g=geo(P), pw=C.pen;
    const parts=[
      {back:true,draw:(c,u)=>{ const p=pw(c,u); leg(p,M,g,P,-9,'rf',false); leg(p,M,g,P,8,'ff',true); }},
      {draw:(c,u)=>drawHead(pw(c,u),M,g,P)},
      {draw:(c,u)=>{ const p=pw(c,u); leg(p,M,g,P,-12,'rn',false); leg(p,M,g,P,10.6,'fn',true); }},
      {draw:(c,u)=>drawShell(pw(c,u),M,g,P,v)},
    ];
    if(P.fx||P.gold===2) parts.push({noShade:true,noRim:true,smear:true,draw:(c,u)=>drawFx(pw(c,u),P,g)});
    const cv=C.build({FW,FH,GROUND,parts,M,step,flash:P.flash,rim:RIM});
    const sc=q=>({x:q.x*K,y:q.y*K}); cv._fx=sc({x:g.hc.x+10,y:g.hc.y}); cv._center=sc(g.T(0,-6)); cv._top=sc(g.T(0,-18)); cv._head=sc(g.hc); cv._mouth=sc({x:g.hc.x+8,y:g.hc.y+1});
    return cache.set(key,cv);
  }
  const META={id:'jabuti', nome:'Jabuti', sub:'piranga', papel:'Pet tanque', hab:'Casco-Escudo',
    lede:'Um jabuti-piranga velho de guerra, teimoso e calmo, lento demais pra andar sozinho: vai preso nas costas do recruta por um arnês de couro e só desce pra morder ou virar escudo.',
    habDesc:'Recolhe cabeça e patas, o casco fica dourado e uma cúpula de luz protege quem está atrás dele. No jogo: bloqueia o próximo golpe que atingiria o recruta.',
    rows:[['Cabeça','Cabeção chibi escuro com escamas vermelho-alaranjadas e uma amarela no topo, bico córneo em gancho, sobrancelha rabugenta e olhão âmbar.','Cabeça com volume em 7 tons, 5 escamas, bico em duas peças (a mandíbula abre 30° no bote) e olho com 2 brilhos.'],
      ['Casco','Domo alto quase preto, placas de aréola amarela, marginais serrilhadas com pinta.','Domo esculpido (sombra roxa grande, luz quente no alto), sulcos entre placas, 7 aréolas com brilho e 9 marginais pintadas.'],
      ['Patas','Patas-coluna curtas, as dianteiras com escama vermelha, pés com 3 garras.','As do lado de lá um tom mais escuras; recolhem no Casco-Escudo e no sono.'],
      ['Arnês','Cinta de couro com pesponto, fivela de metal e argola.','Some no Casco-Escudo, quando o casco vira ouro.'],
      ['Especial','Casco-Escudo: recolhe, fica dourado com cúpula de luz, sai feliz com coração.','6 quadros: susto, recolhe, casco dourado, cúpula (420 ms), sai e olho ^ com coração.']]};
  return {PS,FW,FH,GROUND,AX,VARS,ANIMS,NAMES,mats,poseOf,frame,META,RIM};
})();
