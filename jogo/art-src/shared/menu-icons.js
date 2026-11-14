/* MENU_ICON — ícones do dock do abrigo (Construir, Reparos, Armas, Golpes, Recrutas, Pets, Bestiário, Mercado, Diário,
   Configurações, Expedição, Coletar). Fonte de arte (editável). Build: npm run art */
// Contrato: icon(id, px=40, state='n'|'h') -> canvas px×px · IDS · ACC (cor de destaque por ícone) · SIZE = 32 unidades
// Cada símbolo é uma pilha de camadas; cada camada passa pelo PIX.compose (contorno escuro + rim de luz à esquerda) e a
// de cima cobre o contorno da de baixo — é isso que separa martelo/tábua, cartas, mapa/lua etc. com linha escura.
// Estado 'h' (destacado): tons puxados pra luz e um aro de 1 px na cor de destaque do ícone.
const MENU_ICON=(function(){
  const {compose,mix,OUTLINE}=PIX;
  const SIZE=32, RIM='#a9c8f0';
  const RP=ITEMS.RAMPS, ST=RP.STEEL, BK=RP.BARK, WH=RP.WH, RD=RP.RED, GD=RP.GOLD, YL=RP.YEL, RO=RP.ROPE, SK=RP.SKIN, GR=RP.GRASS, CR=RP.CRY, RU=RP.RUST;
  const ACC={build:'#ffd23f',repair:'#ff5a6e',weapons:'#c8d8ff',golpes:'#ffa040',recrutas:'#7ad0c8',pets:'#f2b468',bestiary:'#b98cff',
    market:'#ff6a70',drawer:'#e8b070',settings:'#a9c8f0',exp:'#ffd23f',exp_lua:'#ff3b55',collect:'#7dff9a',
    // conquistas + lembranças (souvenirs) das cidades
    conquistas:'#ffd23f',lb_galo:'#ff8a30',lb_sombrinha:'#ffd24a',lb_torre:'#e27c3a',lb_boneco:'#7ad0c8',lb_azulejo:'#4a8ad0',
    lb_sino:'#d89a20',lb_fitinha:'#ff5a78',lb_elevador:'#c8d8ff',lb_berimbau:'#b0703a',lb_garrafada:'#5ab040',lb_mercado:'#949eba',lb_cuia:'#d49c22'};
  const IDS=Object.keys(ACC);
  const R=(x,y,w,h)=>[[x,y],[x+w,y],[x+w,y+h],[x,y+h]];
  const DK='#2a1d40';
  const sp=(e,x,y,s,k1,k2)=>{ e.poly([[x,y-s*1.8],[x+s*0.5,y-s*0.5],[x+s*1.8,y],[x+s*0.5,y+s*0.5],[x,y+s*1.8],[x-s*0.5,y+s*0.5],[x-s*1.8,y],[x-s*0.5,y-s*0.5]],k1); e.rect(x-s*0.35,y-s*0.35,s*0.7,s*0.7,k2||'#ffffff'); };
  const ball=(e,x,y,r,P)=>{ e.band(e.E(x,y,r,r),[P[0],P[1],P[2],P[3]],[0.7,1.2,1.4,1],'y',y-r,y+r); e.ell(x-r*0.35,y-r*0.4,r*0.32,r*0.24,'#ffffff'); };
  // estrela de 5 pontas · união de elipses (um path só, pra band/within) · fita ondulada com torção sombreada
  const star=(e,x,y,r,k,ri)=>{ const p=[]; for(let i=0;i<10;i++){ const a=-Math.PI/2+i*Math.PI/5, q=i%2?r*(ri||0.45):r; p.push([x+Math.cos(a)*q,y+Math.sin(a)*q]); } e.poly(p,k); };
  const U=(e,L)=>()=>{ const c=e.c; c.beginPath(); L.forEach(([x,y,rx,ry,r])=>{ r=r||0; c.moveTo(x+rx*Math.cos(r),y+rx*Math.sin(r)); c.ellipse(x,y,rx,ry,r,0,Math.PI*2); }); };
  const BL=['#b8dcff','#4a8ad0','#2a5aa0','#1a3470'], BZ=['#fff0c0','#f6c868','#d89a20','#a06a14','#643e0c'];
  function fita(e,x0,y0,x1,y1,A,ph,w,P,txt){
    const N=16, pt=(t)=>[x0+(x1-x0)*t+Math.sin(ph+t*Math.PI*2.2)*A*t, y0+(y1-y0)*t], L=[], Rr=[], C=[];
    for(let i=0;i<=N;i++){ const t=i/N, p=pt(t), q=pt(t+0.01), dx=q[0]-p[0], dy=q[1]-p[1], d=Math.hypot(dx,dy)||1, nx=-dy/d*w/2, ny=dx/d*w/2;
      L.push([p[0]+nx,p[1]+ny]); Rr.push([p[0]-nx,p[1]-ny]); C.push(p); }
    const sh=L.concat([pt(0.92)],Rr.slice().reverse());
    e.within(sh,()=>{ for(let i=0;i<N;i++){ const f=Math.cos(ph+(i+0.5)/N*Math.PI*2.2), k=f>0.45?P[0]:f>-0.15?P[1]:f>-0.65?P[2]:P[3], j=Math.min(N,i+2);
      e.poly([L[i],L[j],Rr[j],Rr[i]],k); }
      if(txt) for(let i=4;i<N-2;i+=1){ if(i%3===2) continue; const p=C[i]; e.rect(p[0]-0.45,p[1]-0.3,0.9,0.7,'#ffffff'); } });
  }

  // ---------------- símbolos (cada um = lista de camadas, de trás pra frente) ----------------
  const S={
    build:[ // tábua com pregos + martelo de carpinteiro por cima
      (e)=>{ e.c.save(); e.c.translate(16,24.4); e.c.rotate(-0.18);
        const pl=R(-14,-3.6,28,7.2);
        e.band(pl,[BK[0],BK[1],BK[2],BK[3]],[0.8,1.6,2,1],'y',-3.6,3.6);
        e.within(pl,()=>{ e.ln(-12,-0.6,-3,-0.9,0.5,BK[3]); e.ln(1,1.3,11,1.1,0.5,BK[3]); e.ell(5,-1.2,1.3,0.7,BK[3]); e.ell(5,-1.3,0.6,0.3,BK[4]);
          e.rect(-14,-3.6,28,0.8,BK[0]); e.rect(12.4,-3.6,1.6,7.2,BK[3]); e.rect(-14,2.6,28,1,BK[4]); });
        [-10,9].forEach((x)=>{ e.ell(x,0.2,1.1,1.1,ST[3]); e.ell(x-0.2,0,0.8,0.8,ST[1]); e.rect(x-0.5,-0.4,0.5,0.4,'#ffffff'); });
        e.c.restore(); },
      (e)=>{ e.c.save(); e.c.translate(17.6,12.4); e.c.rotate(0.62);
        e.band(R(-1.7,-1,3.4,17.6),[BK[0],BK[1],BK[2],BK[3]],[0.8,1.2,1.4,1],'x',-1.7,1.7);
        e.band(R(-2,9.6,4,7),[RD[0],RD[1],RD[2],RD[3]],[0.7,1.2,1.4,1],'x',-2,2);
        for(let k=0;k<4;k++) e.ln(-2,10.8+k*1.6,2,10+k*1.6,0.5,RD[3]);
        const hd=[[-7.6,-5.8],[5.4,-5.8],[6.8,-4.4],[6.8,-1.8],[5.4,-0.4],[-7.6,-0.4]];
        e.band(hd,[ST[0],ST[1],ST[2],ST[3],ST[4]],[0.7,1,1.4,1.2,1],'y',-5.8,-0.4);
        e.poly([[-7.6,-5.8],[-11.6,-8],[-10.6,-5.2],[-7.6,-2.4]],ST[3]); e.ln(-7.6,-5.4,-11,-7.4,0.5,ST[1]);
        e.rect(5.6,-5.8,1.2,5.4,ST[1]); e.rect(-2.3,-0.9,4.6,1.6,ST[4]); e.rect(-6.8,-5.2,11,0.7,'#ffffff');
        e.c.restore();
        sp(e,27,5.4,1.3,YL[0]); sp(e,23.4,2.8,0.7,YL[1]); },
    ],
    repair:[ // porca sextavada + chave de boca com cabo emborrachado
      (e)=>{ const cx=24.4, cy=24.2, r=4.6, hx=[]; for(let i=0;i<6;i++){ const a=Math.PI/6+i*Math.PI/3; hx.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]); }
        e.band(hx,[GD[1],GD[2],GD[3],GD[4]],[0.8,1.2,1.4,1],'y',cy-r,cy+r); e.ell(cx,cy,1.8,1.8,GD[5]); e.arc(cx,cy,1.8,1.8,Math.PI*0.1,Math.PI*0.9,0.6,GD[1]);
        e.ln(hx[3][0],hx[3][1],hx[4][0],hx[4][1],0.7,GD[0]); },
      (e)=>{ e.c.save(); e.c.translate(14.6,17.2); e.c.rotate(-Math.PI/4);
        e.band(R(-13,-2.2,19,4.4),[ST[0],ST[1],ST[2],ST[3],ST[4]],[0.6,1,1.4,1,0.8],'y',-2.2,2.2);
        e.band(R(-13.8,-2.7,8.6,5.4),[RD[0],RD[1],RD[2],RD[3]],[0.6,1.2,1.6,1],'y',-2.7,2.7);
        for(let k=0;k<3;k++) e.rect(-12.4+k*2.4,-2.7,0.6,5.4,RD[3]);
        e.band(e.E(9,0,6,6),[ST[0],ST[1],ST[2],ST[3],ST[4]],[0.8,1.2,1.6,1.2,1],'y',-6,6);
        e.arc(9,0,5,5,Math.PI*1.05,Math.PI*1.5,0.8,'#ffffff'); e.ln(-4,-1.5,5,-1.5,0.6,'#ffffff');
        e.cut(()=>{ e.c.fillRect(9,-2.4,9,4.8); });
        e.rect(8.2,-2.4,0.8,4.8,ST[4]); e.ell(-12,0,0.9,0.9,RD[3]);
        e.c.restore();
        sp(e,7.4,7,1.1,YL[0]); },
    ],
    weapons:[ // taco cravejado na diagonal + pistola na frente
      (e)=>{ e.c.save(); e.c.translate(15,15.4); e.c.rotate(-0.8);
        e.ell(-14.6,0,1.3,1.9,BK[3]);
        const bat=[[-14,-1.4],[-4,-1.5],[4,-3.2],[12,-4.2],[13.8,-2.9],[13.8,2.9],[12,4.2],[4,3.2],[-4,1.5],[-14,1.4]];
        e.band(bat,[BK[0],BK[1],BK[2],BK[3],BK[4]],[0.6,1,1.4,1.2,1],'y',-4.2,4.2);
        e.band(R(-13.4,-1.8,6.4,3.6),[WH[1],WH[2],WH[3]],[1,1.4,1],'y',-1.8,1.8);
        for(let k=0;k<4;k++) e.ln(-13+k*1.6,-1.4,-12.2+k*1.6,1.4,0.4,WH[4]);
        e.ln(-3,-0.6,11,-2.2,0.6,BK[0]);
        [[6,-1],[9.6,1],[12,-1]].forEach(([x,s])=>{ e.ln(x,s*3.2,x+0.6,s*6,0.8,ST[2]); e.rect(x+0.2,s*5.8-0.4,0.8,0.8,ST[0]); });
        e.c.restore(); },
      (e)=>{ e.c.save(); e.c.translate(20.4,22); e.c.rotate(-0.12);
        e.band(R(-7.6,-4.6,14.6,4.6),[ST[0],ST[1],ST[2],ST[3],ST[4]],[0.6,1,1.4,1.2,1],'y',-4.6,0);
        e.rect(7,-4,1.4,2.6,ST[3]); for(let k=0;k<3;k++) e.rect(-6.4+k*1.3,-4.2,0.5,2.4,ST[3]);
        e.rect(-7.6,-4.6,14.6,0.7,'#ffffff');
        e.band([[-6.8,0],[-2,0],[-3.2,7.4],[-8.2,7.4]],[BK[1],BK[2],BK[3],BK[4]],[0.8,1.2,1.4,1],'x',-8.2,-2);
        for(let k=0;k<3;k++) e.ln(-7.4,2+k*1.6,-3.6,1.6+k*1.6,0.4,BK[4]);
        e.arc(-0.6,0.4,1.8,1.8,0,Math.PI,0.8,ST[3]); e.rect(-1.2,0,0.7,1.6,ST[4]);
        e.c.restore(); },
    ],
    golpes:[ // rastro de velocidade + estouro de impacto, punho por cima
      (e)=>{ const A=['#5a2a1a','#c85a20','#ffa040','#ffd890'];
        [[9.6,1.6,11],[13.6,0.6,12],[17.6,1.2,12],[21.6,2.6,11]].forEach(([y,x0,x1])=>{ e.band([[x0,y-0.8],[x1,y-1.6],[x1,y+1.6],[x0,y+0.8]],A,[1,1.2,1.4,1.2],'x',x0,x1); });
        const b=[]; for(let i=0;i<16;i++){ const a=i*Math.PI/8, r=i%2?2.4:5; b.push([27.4+Math.cos(a)*r,15.6+Math.sin(a)*r]); }
        e.poly(b,'#ffe48a'); e.ell(27.4,15.6,1.6,1.6,'#ffffff'); },
      (e)=>{ e.band(R(5,11.8,8,9),[WH[1],WH[2],WH[3],WH[4]],[1,1.4,1.4,1],'y',11.8,20.8);
        for(let k=0;k<4;k++) e.ln(5.6+k*2,11.8,4.6+k*2,20.8,0.5,WH[4]); e.rect(5,11.8,8,0.6,WH[0]);
        e.band(e.smooth([[11.4,10],[19,8.6],[22,10],[22.4,21],[19,23.2],[12,22.6],[10.6,18]],4),[SK[0],SK[1],SK[2],SK[3],SK[4]],[0.8,1.4,1.6,1.2,1],'y',8.6,23.2);
        for(let i=0;i<4;i++){ const y0=8.2+i*3.45;
          e.band(e.smooth([[19.4,y0],[24.6,y0+0.2],[26.4,y0+1.7],[24.6,y0+3.3],[19.4,y0+3.4]],3),[SK[0],SK[1],SK[2],SK[3]],[0.8,1.2,1.4,1],'y',y0,y0+3.4);
          if(i<3) e.rect(20,y0+3.1,5.4,0.55,SK[4]); e.ell(24.6,y0+1.2,1,0.5,'#fff4e8'); }
        e.band(e.E(19.6,21,4.4,1.9,-0.12),[SK[0],SK[1],SK[2],SK[3]],[0.8,1.2,1.4,1],'y',19,23);
        e.ell(23,20.5,1.1,0.8,'#ffd8c8'); e.ln(12.4,13,18.6,11,0.5,SK[3]); },
    ],
    recrutas:[ // dupla de sobreviventes: a de trás no escuro, a da frente com bandana
      (e)=>{ const J=['#a0b860','#6a8a3a','#4a6a2a','#2e4620'].map((k)=>mix(k,DK,0.25)), F=SK.map((k)=>mix(k,DK,0.28));
        e.band(e.smooth([[15,31],[16.4,24],[20,19.6],[23,19],[26,19.6],[29.6,24],[30.6,31]],4),J,[0.8,1.2,1.4,1],'x',15,30.6);
        e.rect(21.4,15.6,3,3.6,F[3]);
        e.band(e.E(23,11.4,4.2,4.8),[F[0],F[1],F[2],F[3]],[0.8,1.2,1.4,1],'x',18.8,27.2);
        e.within(e.E(23,11.4,4.2,4.8),()=>{ e.band(R(17,5,12,4.2),['#5a4a6a','#3a2e4a','#2a2236'],[1,1.4,1],'y',5,9.2); });
        e.rect(23.6,11,1,1.4,DK); e.rect(25.6,11,0.9,1.4,DK); },
      (e)=>{ const J=['#8ae0d8','#3aa8a8','#2a7884','#1e4e60'];
        e.band(e.smooth([[2.6,31.4],[4.2,24],[8.8,20],[13,19.2],[17.2,20],[21.6,24],[23.2,31.4]],4),J,[0.8,1.2,1.4,1],'x',2.6,23.2);
        e.poly([[10,19.6],[13,23.6],[16,19.6]],WH[2]); e.poly([[11.2,19.6],[13,22],[14.8,19.6]],SK[2]);
        e.ln(6.6,22.4,18.6,31.4,1.3,RO[2]); e.ln(6.4,22.2,18.4,31.2,0.5,RO[0]);
        e.rect(11.4,16,3.2,3.6,SK[3]);
        const hd=e.E(13,11.4,5,5.6);
        e.band(hd,[SK[0],SK[1],SK[2],SK[3],SK[4]],[0.8,1.2,1.4,1.2,1],'x',8,18);
        e.within(hd,()=>{ e.band(R(6,4,14,5.2),[RD[0],RD[1],RD[2]],[0.8,1.4,1],'y',4,9.2); e.rect(6,8.6,14,0.8,RD[3]); });
        e.poly([[8.4,7.8],[4.4,6.4],[5,9.6]],RD[2]); e.poly([[8.4,8.6],[4.8,11.2],[7.6,10.8]],RD[1]);
        e.ell(8.2,12.2,0.9,1.4,SK[2]);
        e.rect(13.6,11,1.2,1.7,DK); e.rect(16.3,11,1.1,1.7,DK); e.rect(13.4,10,1.8,0.5,SK[4]); e.rect(16,10,1.6,0.5,SK[4]);
        e.rect(14.4,14.6,2.2,0.6,SK[4]); e.rect(12.6,12.8,0.6,1.4,SK[3]); },
    ],
    pets:[ // pegada grande caramelo
      (e)=>{ const P=['#ffe2b0','#f2b468','#d08440','#a05a28'];
        const pad=e.smooth([[16,14.2],[22.8,17.8],[24,24],[19.8,28],[16,26.6],[12.2,28],[8,24],[9.2,17.8]],4);
        e.band(pad,P,[0.7,1.3,1.6,1],'y',14.2,28);
        e.within(pad,()=>{ e.ell(13.4,18.4,2.6,1.4,P[0]); e.rect(8,26.2,16,2,P[3]); });
        [[6.8,13.4,2.9,3.7,-0.45],[12.4,7.6,3,4,-0.15],[19.6,7.6,3,4,0.15],[25.2,13.4,2.9,3.7,0.45]].forEach(([x,y,rx,ry,a])=>{
          e.band(e.E(x,y,rx,ry,a),P,[0.7,1.2,1.6,1],'y',y-ry,y+ry); e.ell(x-rx*0.3,y-ry*0.4,rx*0.32,ry*0.22,'#fff6e0',a); }); },
    ],
    bestiary:[ // leque de cartas do bestiário; a da frente com um zumbi de olho vermelho
      (e)=>{ const card=(cx,cy,rot,C,emb)=>{ e.c.save(); e.c.translate(cx,cy); e.c.rotate(rot);
          e.band(R(-7,-9.6,14,19.2),C,[0.6,1.2,1.4,1],'y',-9.6,9.6); e.rect(-5.6,-8.2,11.2,0.6,C[0]); e.rect(-5.6,-8.2,0.6,16.4,C[0]); emb(); e.c.restore(); };
        card(10.6,15.6,-0.34,['#c0a8f0','#7a5ac0','#54389a','#34206a'],()=>{ e.ell(0,0,3.4,3.4,'#e8dcff'); e.ell(1.4,-0.8,2.8,2.8,'#54389a'); });
        card(14.6,14.6,-0.13,['#ffa8b8','#d83a5a','#a01e3e','#6a0e2a'],()=>{ for(let k=0;k<3;k++) e.rect(-4,-4+k*3,8,1,'#ffb0c0'); }); },
      (e)=>{ e.c.save(); e.c.translate(19.6,17.2); e.c.rotate(0.17);
        const fc=R(-7.4,-10,14.8,20);
        e.band(fc,['#fffaf0','#f0e0c0','#d8c098','#a88a60'],[0.6,1.2,1.4,1],'y',-10,10);
        e.rect(-6,-8.6,12,13.2,'#3a2a4a'); e.rect(-6,-8.6,12,0.6,'#8a6a40');
        e.band(e.E(0,-2.6,4.2,4.6),['#c8f0a0','#8ac060','#5a8a40','#3a5a2a'],[0.7,1.2,1.4,1],'y',-7.2,2);
        e.ell(-1.6,-3.2,1.1,1.2,DK); e.ell(1.8,-2.8,1.1,1.1,'#ff3b55'); e.rect(1.6,-3.2,0.5,0.5,'#ffffff');
        e.rect(-2.2,0,4.4,0.8,DK); for(let k=0;k<4;k++) e.rect(-1.9+k*1.2,-0.5,0.4,1.8,'#c8f0a0');
        e.rect(-2.6,-6.6,1.8,0.6,'#e0ffc0');
        e.rect(-5.4,5.6,10.8,2.6,'#a01e3e'); e.rect(-5.4,5.6,10.8,0.6,'#ff6a80'); e.rect(-3.8,6.6,7.6,0.6,'#ffd0d8');
        e.c.restore(); },
    ],
    market:[ // balcão de feira com frutas, postes; toldo listrado por cima
      (e)=>{ e.band(R(4.4,9,2.4,19),[BK[1],BK[2],BK[3]],[1,1,1],'x',4.4,6.8); e.band(R(25.2,9,2.4,19),[BK[1],BK[2],BK[3]],[1,1,1],'x',25.2,27.6);
        const ct=R(3,19.6,26,8.6);
        e.band(ct,[BK[0],BK[1],BK[2],BK[3],BK[4]],[0.6,1,1.6,1.4,1],'y',19.6,28.2);
        e.within(ct,()=>{ for(let k=1;k<5;k++) e.rect(3+k*5.2,21.4,0.6,6.8,BK[4]); e.rect(3,21,26,0.6,BK[4]); e.rect(3,19.6,26,0.8,BK[0]); });
        ball(e,8.6,17.6,2.4,['#ffc890','#ff8a30','#d05a18','#8a3410']); ball(e,13.4,17.8,2.2,['#e0ffc8','#9ae060','#5ab040','#337a2e']);
        ball(e,18.2,17.6,2.4,['#ffa0a0','#f03c4a','#b81c34','#741024']); ball(e,23.2,17.8,2.2,['#ffc890','#ff8a30','#d05a18','#8a3410']);
        e.ln(15.6,15.2,16.4,14,0.7,GR[3]); },
      (e)=>{ const aw=[[2,11.6],[5.2,4.2],[26.8,4.2],[30,11.6]];
        e.within(aw,()=>{ for(let i=0;i<8;i++){ const k=i%2?WH:RD; e.band([[5.2+i*2.7,4],[5.2+(i+1)*2.7,4],[2+(i+1)*3.5,12],[2+i*3.5,12]],[k[0],k[1],k[2]],[0.6,1.4,1],'y',4,12); } });
        e.rect(5.2,4.2,21.6,1,'#ffffff');
        for(let i=0;i<8;i++){ const k=i%2?WH:RD; e.band(e.E(3.75+i*3.5,11.6,1.75,1.7),[k[1],k[2],k[3]],[1,1,1],'y',10,13.3); }
        e.rect(14.6,1.8,2.8,2.6,RD[2]); e.rect(15.2,1.2,1.6,1,GD[1]); },
    ],
    drawer:[ // diário de couro com páginas, alça e lápis
      (e)=>{ e.band(R(8.4,6.4,17.6,22.4),[WH[1],WH[2],WH[3]],[1,1.4,1],'x',8.4,26);
        for(let k=0;k<7;k++) e.rect(23,8+k*3,3,0.5,WH[4]); },
      (e)=>{ const L=['#e8a868','#c07a40','#94562c','#64341c'];
        e.band(R(6.6,4.6,17.6,23),L,[0.6,1.2,1.6,1],'x',6.6,24.2);
        e.band(R(4.6,4.6,3.6,23),['#94562c','#64341c','#3e1e10'],[1,1.4,1],'x',4.6,8.2);
        [7.4,24].forEach((y)=>{ e.rect(4.6,y,3.6,1.2,GD[2]); e.rect(4.6,y,3.6,0.4,GD[0]); });
        e.rect(8.2,4.6,16,0.7,L[0]); e.rect(8.4,6.4,14,0.4,'#f2c890');
        e.ell(15.2,14.6,4.4,4.4,GD[2]); e.ell(14.6,14,3.4,3.4,GD[1]); e.ell(17.2,13.4,3.6,3.6,L[1]);
        e.band(R(19.6,15.8,8.6,3.4),[BK[2],BK[3],BK[4]],[1,1.2,1],'y',15.8,19.2);
        e.band(R(25.2,15.2,2.6,4.6),[GD[0],GD[2],GD[4]],[1,1.2,1],'y',15.2,19.8); e.rect(25.9,16.4,1.2,2.2,BK[4]); },
      (e)=>{ e.c.save(); e.c.translate(23.4,25.6); e.c.rotate(-0.78);
        e.band(R(-6.6,-1.3,11,2.6),[YL[0],YL[1],YL[2],YL[3]],[0.6,1.2,1.4,1],'y',-1.3,1.3);
        e.poly([[4.4,-1.3],[7.6,0],[4.4,1.3]],'#f2c890'); e.poly([[6.6,-0.4],[7.6,0],[6.6,0.4]],'#3a3048');
        e.rect(-8.6,-1.3,1.6,2.6,'#ff8aa8'); e.rect(-7,-1.3,0.6,2.6,ST[2]); e.ln(-6,-0.5,4,-0.5,0.4,'#ffffff');
        e.c.restore(); },
    ],
    settings:[ // engrenagem de aço com cubo
      (e)=>{ const cols=[ST[0],ST[1],ST[2],ST[3],ST[4]], fr=[0.6,1,1.4,1.2,1];
        for(let i=0;i<8;i++){ const a=i*Math.PI/4+Math.PI/8, ca=Math.cos(a), sa=Math.sin(a), t=[-sa,ca];
          const p=(r,w)=>[16+ca*r+t[0]*w,16+sa*r+t[1]*w];
          e.band([p(8,-3),p(13.6,-2.2),p(13.6,2.2),p(8,3)],cols,fr,'y',3,29); }
        e.band(e.E(16,16,10.4,10.4),cols,fr,'y',5.6,26.4);
        e.arc(16,16,7,7,0,7,1.2,ST[3]); e.arc(16,16,8.8,8.8,Math.PI*1.05,Math.PI*1.45,0.8,'#ffffff');
        e.band(e.E(16,16,5,5),[ST[1],ST[2],ST[3]],[1,1.2,1],'y',11,21);
        e.cut(()=>{ e.c.beginPath(); e.c.ellipse(16,16,2.4,2.4,0,0,7); e.c.fill(); }); },
    ],
    exp:[ // lua cheia + mapa dobrado com rota tracejada até o X
      (e)=>moonArt(e,['#fffbe0','#fff2a8','#e8d890','#b0a070','#8a7a50']),
      (e)=>mapArt(e),
    ],
    exp_lua:[ // variante Lua de Sangue: lua vermelha
      (e)=>moonArt(e,[CR[1],CR[2],CR[3],CR[4],CR[5]]),
      (e)=>mapArt(e),
    ],
    collect:[ // cesto de palha com tora, maçã e engrenagem
      (e)=>{ e.c.save(); e.c.translate(12,12.4); e.c.rotate(-0.35);
        e.band(R(-6,-2.2,12,4.4),[BK[0],BK[1],BK[2],BK[3]],[0.8,1.2,1.4,1],'y',-2.2,2.2); e.ell(-6,0,1.6,2.2,'#f2c890'); e.arc(-6,0,0.9,1.3,0,7,0.4,BK[2]);
        e.c.restore();
        ball(e,21.4,11.4,3.2,['#ffa0a0','#f03c4a','#b81c34','#741024']); e.ln(21.4,8.4,22.4,6.2,0.7,BK[3]); e.ell(23.6,6.8,1.6,0.8,GR[1],-0.4); },
      (e)=>{ const bs=[[4.4,15.6],[27.6,15.6],[24.6,29],[7.4,29]];
        e.band(bs,[RO[0],RO[1],RO[2],RO[3]],[0.6,1.2,1.6,1],'y',15.6,29);
        e.within(bs,()=>{ for(let y=17.6;y<29;y+=2.6) e.rect(3,y,26,0.6,RO[3]); for(let k=0;k<7;k++) e.ln(7+k*3,15.6,7.6+k*2.7,29,0.5,RO[3]); });
        e.band(R(3,13.6,26,3),[BK[0],BK[1],BK[2],BK[3]],[0.6,1,1.2,1],'y',13.6,16.6); },
    ],
    conquistas:[ // troféu: alças, haste com nó, taça com estrela gravada, base de madeira com placa
      (e)=>{ e.arc(9.6,9.4,4.8,3.8,Math.PI*0.5,Math.PI*1.5,1.7,GD[3]); e.arc(9.6,9.4,4.8,3.8,Math.PI*0.8,Math.PI*1.3,0.6,GD[1]);
        e.arc(22.4,9.4,4.8,3.8,-Math.PI*0.5,Math.PI*0.5,1.7,GD[4]); e.arc(22.4,9.4,4.8,3.8,-Math.PI*0.4,-Math.PI*0.1,0.6,GD[2]); },
      (e)=>{ e.band(R(14.4,15,3.2,7),[GD[1],GD[2],GD[3],GD[4]],[0.6,1,1,1],'x',14.4,17.6);
        e.band(e.E(16,18.4,3,1.3),[GD[0],GD[2],GD[4]],[1,1.2,1],'y',17.1,19.7);
        e.band([[11.4,21],[20.6,21],[22.2,23.2],[9.8,23.2]],[GD[1],GD[2],GD[3],GD[4]],[0.6,1,1,1],'y',21,23.2); e.rect(11.4,21,9.2,0.5,GD[0]); },
      (e)=>{ const cup=e.smooth([[7.4,4.4],[24.6,4.4],[24,10.6],[20.6,15.4],[16,16.8],[11.4,15.4],[8,10.6]],4);
        e.band(cup,[GD[1],GD[0],GD[1],GD[2],GD[3],GD[4]],[0.4,0.7,0.8,1.6,1.4,1],'x',7.6,24.4);
        e.within(cup,()=>{ e.arc(16,9,10,7.6,0.15*Math.PI,0.85*Math.PI,0.6,GD[4]); });
        e.ell(16,4.6,8.8,1.8,GD[3]); e.ell(16,4.9,7.4,1.1,GD[5]); e.arc(16,4.6,8.8,1.8,Math.PI*1.05,Math.PI*1.7,0.6,GD[0]);
        star(e,16.3,10.7,4,GD[4]); star(e,16,10.3,3.4,GD[4]); star(e,16,10.4,2.6,GD[1],0.42); e.rect(15.6,8.2,0.8,0.8,'#ffffff');
        e.rect(10,6.8,1,4.4,'#ffffff'); e.rect(11.2,12.2,0.8,1.4,GD[0]);
        sp(e,26.8,3.6,1.2,YL[0]); sp(e,5.2,15,0.7,YL[1]); },
      (e)=>{ const bs=R(8.6,22.8,14.8,6.4);
        e.band(bs,[BK[0],BK[1],BK[2],BK[3],BK[4]],[0.5,0.8,1.4,1.4,1],'y',22.8,29.2);
        e.within(bs,()=>{ e.rect(8.6,22.8,14.8,0.8,BK[0]); e.rect(8.6,28.2,14.8,1,BK[4]); e.rect(22.4,22.8,1,6.4,BK[4]); });
        e.band(R(12.2,24.6,7.6,2.6),[GD[0],GD[2],GD[4]],[0.6,1.4,1],'y',24.6,27.2); e.rect(13.4,25.6,5.2,0.5,GD[4]); },
    ],
    lb_galo:[ // chaveiro do Galo da Madrugada: argola + elo, cauda de penas coloridas, galo vermelho/laranja
      (e)=>{ e.arc(24,4.4,3.1,3.1,0,7,1.5,ST[3]); e.arc(24,4.4,3.1,3.1,Math.PI*1.0,Math.PI*1.55,0.6,ST[0]); e.arc(24,4.4,3.1,3.1,Math.PI*0.1,Math.PI*0.6,0.5,ST[4]);
        e.arc(23.6,8.6,1,1.8,0,7,0.8,ST[2]);
        e.ln(15.6,24.6,14.8,29.2,1,YL[2]); e.ln(20,24.6,20.6,29.2,1,YL[2]); e.ln(12.8,29.4,16.4,29.4,0.9,YL[2]); e.ln(18.8,29.4,22.4,29.4,0.9,YL[2]); },
      ...[[0.2,BL],[0.68,[YL[0],YL[1],YL[2],YL[3]]],[1.15,[GR[0],GR[1],GR[2],GR[3]]]].map(([t,P])=>(e)=>{
        const bx=13.6, by=19.8, s=Math.sin(t), c=Math.cos(t), cx=bx-s*6, cy=by-c*6;
        e.band(e.E(cx,cy,2.6,6.4,-t),P,[0.7,1.2,1.4,1],'y',cy-6,cy+6);
        e.ln(bx-s*1,by-c*1,bx-s*11,by-c*11,0.5,P[0]); e.ell(bx-s*10.4-c*0.8,by-c*10.4+s*0.8,0.5,0.5,'#ffffff'); }),
      (e)=>{ const RC=['#ffe090','#ffa040','#f05a3a','#c02a34','#7a1424'];
        const b=U(e,[[17.6,20.8,7.2,5,-0.12],[22.6,15.6,2.8,4.6,0.3],[23.8,12.8,3.2,3]]);
        e.band(b,RC,[0.5,0.9,1.4,1.4,1],'y',9.8,25.8);
        e.within(b,()=>{ e.band(e.E(16.4,20.2,5,3,-0.18),['#ffc070','#e8702a','#b0441c'],[1,1.2,1],'y',17.2,23.2);
          e.arc(15,20.6,3.6,1.8,0.1*Math.PI,0.9*Math.PI,0.5,'#8a2a14'); e.arc(17.2,21.6,3,1.4,0.1*Math.PI,0.9*Math.PI,0.5,'#8a2a14');
          e.ell(21,11.8,1.2,0.7,'#fff4c0'); });
        e.ell(22,10.4,1.4,1.5,RD[1]); e.ell(23.8,9.6,1.6,1.7,RD[1]); e.ell(25.6,10.6,1.3,1.4,RD[2]); e.ell(23.4,9.2,0.6,0.5,RD[0]);
        e.poly([[26.6,11.8],[29.8,13],[26.6,14.2]],YL[1]); e.poly([[26.6,13],[29.8,13],[26.6,14.2]],YL[2]);
        e.ell(26.2,15.8,1,1.6,RD[1]); e.ell(25.9,15.3,0.4,0.5,RD[0]);
        e.ell(24.6,12.2,1.1,1.1,'#ffffff'); e.rect(24.7,11.8,0.8,1,DK); },
    ],
    lb_sombrinha:[ // sombrinha de frevo: cabo curvo atrás, gomos coloridos alternados com bordas recortadas
      (e)=>{ e.c.save(); e.c.translate(16,15.6); e.c.rotate(-0.22);
        e.band(R(-0.8,-2,1.6,12.4),[ST[1],ST[2],ST[3]],[1,1,1],'x',-0.8,0.8);
        e.arc(-2.4,10.4,2.4,2.4,0,Math.PI,1.7,BK[2]); e.arc(-2.4,10.4,2.4,2.4,Math.PI*0.5,Math.PI*0.95,0.5,BK[0]);
        e.c.restore(); },
      (e)=>{ e.c.save(); e.c.translate(16,15.6); e.c.rotate(-0.22);
        const N=8, W=13.2, H=10.2, C=[RD,[YL[0],YL[1],YL[2],YL[3]],[GR[0],GR[1],GR[2],GR[3]],BL], xs=(i)=>-W+i*2*W/N;
        const dome=()=>{ e.c.beginPath(); e.c.ellipse(0,0,W,H,0,Math.PI,Math.PI*2); e.c.closePath(); };
        e.within(dome,()=>{ for(let i=0;i<N;i++){ const P=C[i%4]; e.band([[0,-H-1],[xs(i),0.4],[xs(i+1),0.4]],[P[0],P[1],P[2]],[0.6,1.4,1],'y',-H,0); } });
        for(let i=0;i<N;i++){ const P=C[i%4], m=(xs(i)+xs(i+1))/2; e.band(e.E(m,0,W/N,1.7),[P[1],P[2],P[3]],[1,0.8,1],'y',-1.7,1.7); }
        e.arc(0,0,W-2.4,H-2.2,Math.PI*1.14,Math.PI*1.38,0.7,'#ffffff');
        for(let i=0;i<=N;i++) e.ell(xs(i),0.5,0.55,0.55,ST[1]);
        e.ln(0,-H-1.6,0,-H,0.8,ST[2]); e.ell(0,-H-1.8,1,1,GD[2]); e.rect(-0.5,-H-2.3,0.5,0.5,'#ffffff');
        e.c.restore(); },
    ],
    lb_torre:[ // Torre de Cristal (Brennand): mar, pedestal de pedra, coluna terracota com anéis, botão no topo
      (e)=>{ const sea=e.E(16,28,14.6,2.8);
        e.band(sea,[BL[0],BL[1],BL[2],BL[3]],[0.6,1,1.2,1],'y',25.2,30.8);
        e.within(sea,()=>{ e.arc(7,27.6,3,1,Math.PI*1.1,Math.PI*1.9,0.5,'#ffffff'); e.arc(25.4,28.2,2.6,0.9,Math.PI*1.1,Math.PI*1.9,0.5,'#ffffff'); e.arc(14,29.8,2.4,0.8,Math.PI*1.1,Math.PI*1.9,0.5,BL[0]); }); },
      (e)=>{ e.band(R(9.6,24.2,12.8,3.6),[ST[0],ST[1],ST[2],ST[3]],[0.5,1,1.2,1],'y',24.2,27.8); e.rect(21.2,24.2,1.2,3.6,ST[3]);
        e.band(R(11.6,22,8.8,2.4),[ST[0],ST[1],ST[2],ST[3]],[0.5,1,1.2,1],'y',22,24.4); e.rect(19.4,22,1,2.4,ST[3]); },
      (e)=>{ const col=[[13.2,22.2],[13.7,9.4],[18.3,9.4],[18.8,22.2]], TC=[RU[0],RU[1],RU[2],RU[3]];
        e.band(col,[RU[1],RU[0],RU[1],RU[2],RU[3]],[0.3,0.5,1.2,1.4,0.8],'x',13.2,18.8);
        [11.4,14.4,17.4,20.2].forEach((y)=>{ e.band(R(12.6,y,6.8,1.5),[TC[0],TC[1],TC[2],TC[3]],[0.6,0.8,0.8,0.6],'y',y,y+1.5); e.rect(18.4,y,1,1.5,TC[3]); });
        e.rect(14.7,10,0.6,11.6,RU[0]); },
      (e)=>{ const bud=[[13.2,11.2],[11,8.6],[9.8,3.8],[12.6,5.8],[13.4,2],[16,4.6],[18.6,2],[19.4,5.8],[22.2,3.8],[21,8.6],[18.8,11.2]];
        e.band(bud,[RU[1],RU[0],RU[1],RU[2],RU[3]],[0.4,0.7,1.4,1.4,0.9],'x',10.6,21.4);
        e.within(bud,()=>{ e.ln(13,10.6,12.6,6.2,0.5,RU[3]); e.ln(19,10.6,19.4,6.2,0.5,RU[3]); e.ln(16,10.8,16,6.4,0.5,RU[3]);
          e.rect(10,10.2,12,0.9,RU[3]); e.ln(11.2,7.6,10.6,5,0.6,'#ffe0c0'); e.ln(13.8,7.6,13.6,4.2,0.5,'#ffe0c0'); });
        e.band(e.E(16,5,1.6,2),['#e8ffff','#8ad8e8','#3a8aa8'],[1,1.2,1],'x',14.4,17.6); e.rect(15.3,4,0.6,0.6,'#ffffff'); sp(e,25.4,5.6,1.1,YL[0]); },
    ],
    lb_boneco: [ // boneco gigante de Olinda: mangas de pano largas, corpo pequeno listrado, cabeçona caricata
      (e)=>{ const SL=[YL[0],YL[1],YL[2],YL[3]];
        [-1,1].forEach((s)=>{ const X=(x)=>16+s*(x-16);
          const sl=e.smooth([[X(12.6),17.6],[X(7.6),19.4],[X(3.6),25],[X(4.4),28.4],[X(8.4),27.6],[X(12.8),22.8]],4);
          e.band(sl,SL,[0.6,1.2,1.4,1],'y',17.6,28.4);
          e.within(sl,()=>{ e.band(R(0,25.6,32,4),[RD[1],RD[2],RD[3]],[1,1,1],'y',25.6,29); e.ln(X(11),20.4,X(6),24.6,0.5,YL[3]); });
          e.ell(X(5.4),28.8,1.5,1.3,SK[2]); }); },
      (e)=>{ const TL=['#c8fff4','#7ad0c8','#3a9a98','#22626a'];
        const rb=[[13,18.4],[19,18.4],[21.4,29.6],[10.6,29.6]];
        e.band(rb,TL,[0.5,0.9,1.4,1],'x',10.6,21.4);
        e.within(rb,()=>{ e.band(R(0,22,32,1.6),['#ffb0d0','#ff5a9a','#c02a6a'],[0.8,1,1],'y',22,23.6); e.band(R(0,26.2,32,1.6),[YL[0],YL[1],YL[2]],[0.8,1,1],'y',26.2,27.8);
          e.rect(15.6,18,0.8,11,TL[3]); e.rect(9,28.8,14,0.8,TL[3]); });
        e.ell(16,19.4,4.2,1.4,WH[1]); e.ell(16,19.8,3.2,0.8,WH[3]); },
      (e)=>{ const hd=e.E(16,10.6,9.6,9.4);
        e.ell(6.6,11.4,1.7,2.4,SK[2]); e.ell(25.4,11.4,1.7,2.4,SK[3]);
        e.band(hd,[SK[1],SK[0],SK[1],SK[2],SK[3]],[0.5,0.7,1.6,1.4,1],'x',6.4,25.6);
        e.within(hd,()=>{ e.poly(e.smooth([[6.4,8],[8,2.4],[16,0.4],[24,2.4],[25.6,8],[22.4,5.6],[18.6,6.6],[15,5],[11.2,6.6],[8.6,5.8]],3),'#2e2238');
          e.ln(10.6,3.4,15,1.8,0.6,'#5a4a6a'); e.rect(5,18.8,22,1.2,SK[3]); });
        e.ell(12.6,10.4,2.3,2.5,'#ffffff'); e.ell(19.4,10.4,2.3,2.5,'#ffffff');
        e.ell(13.2,10.8,1.2,1.4,DK); e.ell(20,10.8,1.2,1.4,DK); e.rect(12.8,10,0.6,0.6,'#ffffff'); e.rect(19.6,10,0.6,0.6,'#ffffff');
        e.ln(10,7.6,14.6,7.2,1,'#2e2238'); e.ln(17.4,7.2,22,7.6,1,'#2e2238');
        e.ell(9.8,14.4,1.6,1,'#ff9a9a'); e.ell(22.2,14.4,1.6,1,'#ff8a8a');
        e.band(e.E(16,13.6,2,1.7),[SK[1],SK[2],SK[3]],[0.8,1.2,1],'y',11.9,15.3); e.ell(15.4,13,0.6,0.5,'#fff4e8');
        e.arc(16,15,4.2,2.6,0.2*Math.PI,0.8*Math.PI,1.1,'#7a2030'); e.rect(14.6,17.2,2.8,0.5,'#ffffff'); },
    ],
    lb_azulejo:[ // azulejo português: vidrado branco, moldura azul, roseta central simétrica e quartos de flor nos cantos
      (e)=>{ const B=BL, t=R(3.4,3.4,25.2,25.2);
        e.band(t,[WH[0],WH[1],WH[2]],[0.6,1.6,1],'y',3.4,28.6);
        e.within(t,()=>{
          [[3.4,3.4],[28.6,3.4],[3.4,28.6],[28.6,28.6]].forEach(([x,y])=>{ e.ell(x,y,5.6,5.6,B[1]); e.ell(x,y,3.6,3.6,WH[1]); e.ell(x,y,2.2,2.2,B[2]); });
          for(let i=0;i<4;i++){ const a=i*Math.PI/2, ca=Math.cos(a), sa=Math.sin(a);
            e.ell(16+ca*5.6,16+sa*5.6,3.8,2.3,B[1],a); e.ell(16+ca*6.2,16+sa*6.2,2,1,B[0],a); e.ell(16+ca*9.6,16+sa*9.6,1.1,1.1,B[2]);
            const b=a+Math.PI/4, cb=Math.cos(b), sb=Math.sin(b); e.ell(16+cb*6.2,16+sb*6.2,2.2,1.1,B[2],b); e.ell(16+cb*8.4,16+sb*8.4,0.7,0.7,B[1]); }
          e.ell(16,16,3,3,B[2]); e.ell(16,16,1.8,1.8,WH[0]); e.ell(16,16,0.9,0.9,B[3]);
          e.rect(3.4,3.4,25.2,1.2,B[2]); e.rect(3.4,3.4,1.2,25.2,B[2]); e.rect(3.4,27.2,25.2,1.4,B[3]); e.rect(27.2,3.4,1.4,25.2,B[3]);
          e.rect(4.6,4.6,22.6,0.5,B[0]); e.rect(4.6,4.6,0.5,22.6,B[0]); e.ln(20.4,7,22.6,5.2,0.6,'#ffffff'); }); },
    ],
    lb_sino:[ // sino de bronze: alça, badalo aparecendo embaixo, frisos e cruz em relevo
      (e)=>{ e.arc(16,5.6,2.8,2.8,Math.PI,Math.PI*2,1.7,BZ[3]); e.arc(16,5.6,2.8,2.8,Math.PI*1.1,Math.PI*1.5,0.6,BZ[1]); },
      (e)=>{ e.ln(16,20,16,25.6,1,ST[3]); e.band(e.E(16,26.6,2.2,2.2),[ST[1],ST[2],ST[3],ST[4]],[0.7,1.2,1.2,1],'y',24.4,28.8); e.rect(15,25.4,0.8,0.8,'#ffffff'); },
      (e)=>{ const bell=e.smooth([[16,4.8],[20.2,5.8],[21.8,10],[22.4,16.4],[24.2,21.2],[27.6,23.6],[16,24.8],[4.4,23.6],[7.8,21.2],[9.6,16.4],[10.2,10],[11.8,5.8]],4);
        e.band(bell,[BZ[1],BZ[0],BZ[1],BZ[2],BZ[3],BZ[4]],[0.4,0.6,1,1.6,1.4,0.8],'x',4.6,27.4);
        e.within(bell,()=>{ e.arc(16,8.8,7,1.2,0,Math.PI,0.8,BZ[4]); e.arc(16,9.6,7,1.2,0,Math.PI,0.5,BZ[0]);
          e.arc(16,18.4,9,1.6,0,Math.PI,0.9,BZ[4]); e.arc(16,19.3,9,1.6,0,Math.PI,0.5,BZ[0]);
          e.rect(15.2,11.4,1.6,5.4,BZ[4]); e.rect(13.6,12.8,4.8,1.5,BZ[4]); e.rect(15.2,11.4,0.7,5.4,BZ[0]); e.rect(13.6,12.8,4.8,0.6,BZ[0]);
          e.poly([[11.4,7.2],[12.6,7],[11.6,19],[10.2,19.2]],'#ffffff'); });
        e.ell(16,23.6,11.6,2,BZ[3]); e.ell(16,23.2,10,1.2,'#3a2010'); e.arc(16,23.6,11.6,2,Math.PI*0.15,Math.PI*0.85,0.6,BZ[1]);
        sp(e,25.4,6.6,1.2,YL[0]); sp(e,5.6,12,0.7,YL[1]); },
    ],
    lb_fitinha:[ // fitinhas do Bonfim: quatro fitas onduladas presas num laço, a da frente com letrinhas
      (e)=>fita(e,15,6,5.6,28.6,2.2,0.4,3.2,BL),
      (e)=>fita(e,17,6,26.4,27.4,2.4,2.2,3.2,[GR[0],GR[1],GR[2],GR[3]]),
      (e)=>fita(e,15.6,6,11.6,30,2,1.4,3.2,[YL[0],YL[1],YL[2],YL[3]]),
      (e)=>fita(e,16.6,6,20.4,30,2.4,3.4,3.4,[CR[1],CR[2],CR[3],CR[4]],true),
      (e)=>{ e.band(e.E(12.4,4.8,3,1.6,-0.35),[CR[1],CR[2],CR[3]],[0.8,1.2,1],'y',3,6.6); e.band(e.E(19.6,4.8,3,1.6,0.35),[CR[1],CR[2],CR[3]],[0.8,1.2,1],'y',3,6.6);
        e.ell(12.6,4.8,1,0.5,CR[4],-0.35); e.ell(19.4,4.8,1,0.5,CR[4],0.35);
        e.band(e.E(16,5.6,2,1.9),[CR[1],CR[2],CR[3],CR[4]],[0.7,1,1,1],'y',3.7,7.5); e.rect(15,4.4,0.8,0.6,'#ffffff');
        sp(e,26.4,4.4,1.1,YL[0]); },
    ],
    lb_elevador:[ // Elevador Lacerda: encosta, passarela no alto, torre art déco clara com janelas verticais
      (e)=>{ const cl=[[0.8,9.6],[6.4,9.6],[7.4,16],[8.6,30],[0.8,30]];
        e.band(cl,['#a8d070','#6a9a40','#8a5a34','#6a3e24','#4a2a18'],[0.5,0.4,1,1.6,1],'y',9.6,30);
        e.within(cl,()=>{ e.rect(0,9.6,8,1,GR[1]); e.ln(2,15,5,17,0.5,'#4a2a18'); e.ln(1.6,22,4.6,23.4,0.5,'#4a2a18'); }); },
      (e)=>{ const P=[WH[1],WH[2],WH[3],WH[4]];
        e.band(R(2.4,6.8,12,3),P,[0.5,1,1,1],'y',6.8,9.8);
        e.within(R(2.4,6.8,12,3),()=>{ for(let k=0;k<4;k++) e.rect(3.4+k*2.8,7.8,1.6,1.2,'#34406a'); e.rect(2.4,6.8,12,0.5,'#ffffff'); }); },
      (e)=>{ const T=[WH[0],WH[1],WH[2],WH[3],WH[4]];
        e.band(R(11.4,26.6,13.2,3),[WH[1],WH[2],WH[3],WH[4]],[0.5,1,1,1],'x',11.4,24.6);
        e.band(R(13,9.6,10,17.4),T,[0.3,0.8,1.4,1.2,0.8],'x',13,23);
        e.band(R(12,4.4,12,6),T,[0.3,0.8,1.4,1.2,0.8],'x',12,24); e.rect(12,9.6,12,0.7,WH[4]);
        e.band(R(14.2,2.6,7.6,2),T,[0.3,0.8,1.4,1.2,0.8],'x',14.2,21.8); e.band(R(16.4,1.4,3.2,1.4),T,[0.3,0.8,1.4,1.2,0.8],'x',16.4,19.6);
        for(let k=0;k<3;k++){ const x=14.4+k*2.8; e.rect(x,11.6,1.6,13.6,'#34406a'); e.rect(x,11.6,1.6,0.6,'#8ab0e8'); e.rect(x,11.6,0.5,13.6,'#4a5a8a');
          for(let y=14;y<25;y+=2.6) e.rect(x,y,1.6,0.4,WH[3]); }
        for(let k=0;k<4;k++) e.rect(13.4+k*2.6,6,1.4,2.4,'#34406a');
        e.rect(13,26.6,10,0.6,WH[4]); e.rect(13.6,10.6,0.6,15,'#ffffff');
        sp(e,27.4,5,1.1,YL[0]); },
    ],
    lb_berimbau:[ // berimbau: verga de madeira com arame, cabaça laranja amarrada, baqueta + caxixi
      (e)=>{ e.c.save(); e.c.translate(16,15.6); e.c.rotate(0.4);
        e.ln(3.2,-13.4,3.2,13.4,0.5,ST[2]);
        e.arc(3.2,0,6.4,13.4,Math.PI*0.5,Math.PI*1.5,1.9,BK[2]); e.arc(3.2,0,6.4,13.4,Math.PI*0.75,Math.PI*1.25,0.6,BK[0]); e.arc(3.4,0,5.6,13,Math.PI*0.55,Math.PI*1.45,0.5,BK[4]);
        e.c.restore(); },
      (e)=>{ e.c.save(); e.c.translate(16,15.6); e.c.rotate(0.4);
        const G=['#ffd890','#f09a3a','#c0661e','#80401a'];
        e.band(e.E(-5.4,9.4,4.2,4),G,[0.6,1.2,1.4,1],'x',-9.6,-1.2); e.ell(-6.4,7.6,1.1,0.8,'#fff0d0');
        e.ell(-8,10.2,1.5,2.4,G[3]); e.ell(-7.8,10.2,1,1.8,'#3a1a0a');
        e.ln(-2.6,9.4,3.4,9.4,0.6,RO[2]); e.ln(-2.6,9.1,3.4,9.1,0.3,RO[0]);
        e.c.restore(); },
      (e)=>{ e.ln(18.6,13.6,27.6,26.6,1,BK[1]); e.ln(18.4,13.4,22,18.4,0.4,BK[0]); },
      (e)=>{ const cx=[[22.4,27.2],[22.8,22.6],[25.2,19.6],[27.6,22.6],[28,27.2]];
        e.arc(25.2,19.4,1.2,1.6,Math.PI,Math.PI*2,0.8,RO[2]);
        e.band(e.smooth(cx,3),[RO[0],RO[1],RO[2],RO[3]],[0.6,1.2,1.4,1],'x',22.4,28);
        e.within(e.smooth(cx,3),()=>{ for(let y=21.6;y<27;y+=1.6) e.rect(21,y,8,0.5,RO[3]); for(let k=0;k<4;k++) e.ln(23.4+k*1.3,20,23+k*1.4,27.4,0.4,RO[3]); });
        e.ell(25.2,27.2,2.8,0.9,BK[3]); e.ell(24.6,21.6,0.6,1,'#ffffff'); },
    ],
    lb_garrafada:[ // garrafada: garrafa de vidro com líquido verde-âmbar, ervas, rótulo de papel e rolha
      (e)=>{ const bt=e.smooth([[13.6,6],[18.4,6],[18.6,10.6],[22.6,14],[23.4,18],[23.4,27],[21.8,29],[10.2,29],[8.6,27],[8.6,18],[9.4,14],[13.4,10.6]],3);
        e.band(bt,['#f0fff4','#c8ecd4','#98d0b0','#6aa888'],[0.5,1.2,1.4,1],'x',8.6,23.4);
        e.within(bt,()=>{
          e.band(R(0,14.8,32,16),['#e8e070','#b8c030','#7a9a20','#4a6a18'],[0.5,1.2,1.6,1],'x',8.6,23.4);
          e.rect(0,14.8,32,0.7,'#f6f0a0');
          [[11.4,28,14.4,16.4],[17,28.4,15.6,17],[20.6,27.6,21.2,18]].forEach(([x0,y0,x1,y1])=>{ e.ln(x0,y0,x1,y1,0.6,'#2e5a1a');
            for(let k=1;k<4;k++){ const t=k/4, x=x0+(x1-x0)*t, y=y0+(y1-y0)*t; e.ell(x-1,y,1.2,0.5,'#3a7a28',0.5); e.ell(x+1,y-0.4,1.2,0.5,'#6ab040',-0.5); } });
          e.ell(19.8,16.6,0.6,0.6,'#fffbe0'); e.ell(12,17.4,0.4,0.4,'#fffbe0'); e.ell(21.6,25.4,0.5,0.5,'#fffbe0');
          e.band(R(9.6,19.6,12.8,5.4),[RO[0],RO[1],RO[2]],[1,1.6,0.6],'y',19.6,25);
          e.rect(9.6,19.6,12.8,0.5,RO[3]); e.rect(9.6,24.5,12.8,0.5,RO[3]); e.rect(11.6,21,8.8,0.6,'#6a3a20'); e.rect(12.6,22.6,6.8,0.5,RO[3]);
          e.rect(13,8.2,6,1.2,RO[2]); e.rect(13,8.2,6,0.4,RO[0]);
          e.rect(10,15.6,0.8,3.4,'#ffffff'); e.rect(10,25.6,0.8,1.6,'#ffffff'); e.rect(14.6,6.6,0.6,2,'#ffffff'); }); },
      (e)=>{ e.band(R(13.2,2.4,5.6,4.6),[BK[0],BK[1],BK[2],BK[3]],[0.5,1,1.2,1],'x',13.2,18.8); e.ell(16,2.6,2.8,0.9,BK[0]);
        e.ell(15,4.4,0.5,0.5,BK[3]); e.ell(17.4,5.4,0.4,0.4,BK[3]); sp(e,25.4,6.4,1.1,YL[0]); },
    ],
    lb_mercado:[ // Mercado de Ferro do Ver-o-Peso: torres de trás, corpo com arcos, torres pontudas da frente
      (e)=>{ const IR=['#b8c4dc','#8a96b6','#646e90','#464e70'].map((k)=>mix(k,DK,0.18)), SL=[ST[2],ST[3],ST[4],ST[5]];
        [10.6,21.4].forEach((x)=>{ e.band(R(x-1.6,8,3.2,8),IR,[0.6,1,1,1],'x',x-1.6,x+1.6); e.band([[x-2.2,8.4],[x,3.4],[x+2.2,8.4]],SL,[0.6,1,1,1],'x',x-2.2,x+2.2); e.ell(x,3.2,0.6,0.6,GD[2]); }); },
      (e)=>{ const IR=['#e0e8f8','#b8c4dc','#8a96b6','#646e90','#464e70'];
        e.band(R(4.4,13.4,23.2,15.8),IR,[0.4,1,1.4,1.2,0.8],'y',13.4,29.2);
        e.band(R(3.8,11.8,24.4,2.2),[IR[0],IR[2],IR[4]],[0.6,1,1],'y',11.8,14);
        for(let x=6;x<27;x+=2) e.poly([[x-0.6,11.8],[x,10.6],[x+0.6,11.8]],IR[2]);
        [10.4,16,21.6].forEach((x)=>{ const ar=()=>{ e.c.beginPath(); e.c.moveTo(x-2.3,28.4); e.c.lineTo(x-2.3,19.6); e.c.ellipse(x,19.6,2.3,2.6,0,Math.PI,Math.PI*2); e.c.lineTo(x+2.3,28.4); e.c.closePath(); };
          e.within(()=>{ e.c.beginPath(); e.c.moveTo(x-3,28.4); e.c.lineTo(x-3,19.6); e.c.ellipse(x,19.6,3,3.3,0,Math.PI,Math.PI*2); e.c.lineTo(x+3,28.4); e.c.closePath(); },()=>e.rect(x-3,15,6,14,IR[3]));
          e.band(ar,['#3a5a8a','#24365e','#18223e'],[0.8,1.2,1],'y',17,28.4);
          e.within(ar,()=>{ e.rect(x-0.3,16,0.6,13,IR[3]); e.rect(x-3,21.6,6,0.5,IR[3]); e.ell(x,19.6,1.2,1.2,'#5a8ac0'); e.rect(x-1.8,17.8,0.6,1.6,'#8ab0e8'); }); });
        e.band(R(4.4,28,23.2,1.6),[ST[1],ST[2],ST[3]],[0.6,1,1],'y',28,29.6); e.rect(4.4,13.4,23.2,0.6,'#ffffff'); },
      (e)=>{ const IR=['#e0e8f8','#b8c4dc','#8a96b6','#646e90','#464e70'], SL=[ST[1],ST[2],ST[3],ST[4]];
        [5.2,26.8].forEach((x)=>{ e.band(R(x-2.4,10.2,4.8,19.4),IR,[0.4,0.8,1.4,1.2,0.8],'x',x-2.4,x+2.4);
          e.band(R(x-2.8,9.4,5.6,1.4),[IR[0],IR[2],IR[4]],[0.6,1,1],'y',9.4,10.8);
          e.band([[x-2.8,9.6],[x,1.6],[x+2.8,9.6]],SL,[0.5,1,1.2,1],'x',x-2.8,x+2.8); e.ln(x-0.6,8.6,x-0.1,3.4,0.5,'#ffffff');
          e.ell(x,1.6,0.7,0.7,GD[2]); e.rect(x-0.6,13,1.2,3,'#24365e'); e.rect(x-0.6,19.4,1.2,3,'#24365e'); e.rect(x-0.6,13,1.2,0.5,'#8ab0e8'); e.rect(x-0.6,19.4,1.2,0.5,'#8ab0e8');
          e.rect(x-2.4,28,4.8,1.6,ST[2]); }); },
    ],
    lb_cuia:[ // cuia de tacacá: cuia escura com friso, caldo amarelo, jambu e camarão por cima
      (e)=>{ const CU=['#b87a48','#8a5028','#603418','#40200e','#28120a'];
        const bw=()=>{ const c=e.c; c.beginPath(); c.ellipse(16,14.4,13.6,12.6,0,0,Math.PI); c.closePath(); c.moveTo(29.6,14.4); c.ellipse(16,14.4,13.6,4.4,0,0,Math.PI*2); };
        e.band(bw,[CU[1],CU[0],CU[1],CU[2],CU[3],CU[4]],[0.3,0.6,1,1.6,1.4,0.8],'x',2.4,29.6);
        e.within(bw,()=>{ for(let k=0;k<9;k++){ const x=5+k*2.75; e.ln(x,20.6,x+1.37,22.4,0.6,'#e0a860'); e.ln(x+1.37,22.4,x+2.75,20.6,0.6,'#e0a860'); }
          e.arc(16,14.4,12.6,9,0.2*Math.PI,0.8*Math.PI,0.5,CU[4]); e.arc(16,14.4,11.4,11.4,0.62*Math.PI,0.85*Math.PI,0.8,'#d89a68'); });
        e.ell(16,14.4,13.6,4.4,CU[1]); e.arc(16,14.4,13.6,4.4,Math.PI*0.95,Math.PI*1.6,0.7,CU[0]); },
      (e)=>{ const br=e.E(16,14.6,12,3.4);
        e.band(br,[YL[0],YL[1],YL[2]],[0.6,1.4,1],'y',11.2,18);
        e.within(br,()=>{ e.ell(9.4,16,2,0.8,'#fff8d8'); e.ell(23.6,15.6,1.6,0.6,'#fff8d8'); e.arc(16,14.6,12,3.4,Math.PI*1.1,Math.PI*1.9,0.6,'#d49c22'); }); },
      (e)=>{ [[10.6,13.6,2.8,1.3,-0.35],[13.6,12,2.4,1.1,0.5],[14.6,15.4,2.6,1.2,0.15],[22.8,13.8,2.2,1,-0.6]].forEach(([x,y,rx,ry,a])=>{
          e.band(e.E(x,y,rx,ry,a),[GR[0],GR[1],GR[2],GR[3]],[0.6,1,1.2,1],'y',y-ry,y+ry); e.ln(x-Math.cos(a)*rx*0.8,y-Math.sin(a)*rx*0.8,x+Math.cos(a)*rx*0.8,y+Math.sin(a)*rx*0.8,0.4,GR[3]); });
        e.ell(12.6,14.6,0.9,0.9,'#d8d040'); e.ell(12.4,14.4,0.4,0.4,'#fff4a0'); },
      (e)=>{ const SH=['#ffd8c0','#ff9a70','#e0603c','#a8361e'];
        e.arc(19.4,12.6,2.8,2.4,-0.1*Math.PI,1.15*Math.PI,1.9,SH[2]); e.arc(19.4,12.4,2.8,2.4,0.05*Math.PI,0.9*Math.PI,0.7,SH[1]); e.arc(19.4,12.2,2.6,2,1.05*Math.PI,1.6*Math.PI,0.6,SH[0]);
        for(let k=0;k<4;k++){ const a=0.1*Math.PI+k*0.25*Math.PI; e.ln(19.4+Math.cos(a)*2,12.6+Math.sin(a)*1.6,19.4+Math.cos(a)*3.7,12.6+Math.sin(a)*3.2,0.4,SH[3]); }
        e.poly([[16.6,12.2],[15,10.4],[15.4,13],[16.8,13.2]],SH[1]); e.ell(22.2,11.6,0.5,0.5,DK);
        sp(e,27.6,6.8,1.1,YL[0]); },
    ],
  };
  function moonArt(e,M){
    e.band(e.E(24,8.4,6.4,6.4),[M[0],M[1],M[2],M[3]],[0.6,1.2,1.6,1.2],'y',2,14.8);
    e.ell(22,7,1.4,1.2,M[3]); e.ell(26.2,10.4,1.8,1.4,M[3]); e.ell(25.4,5.4,0.9,0.8,M[3]); e.ell(22.4,11.4,0.8,0.7,M[4]);
    e.arc(24,8.4,5.4,5.4,Math.PI*1.1,Math.PI*1.45,0.7,'#ffffff');
  }
  function mapArt(e){
    const LT=['#fff4d8','#f0d8a0','#d8b878','#b0905a'], DKP=['#ecd098','#d0ae70','#a88850','#806438'];
    const P=[[[2,13.4],[10,11.8],[10,28.4],[2,30]],[[10,11.8],[18,13.4],[18,30],[10,28.4]],[[18,13.4],[26.6,11.8],[26.6,28.4],[18,30]]];
    P.forEach((p,i)=>e.band(p,i===1?DKP:LT,[0.6,1.2,1.6,1],'y',11.8,30));
    e.within(P[0],()=>{ e.poly([[3,20],[6,15.6],[9,20]],'#6a9a50'); e.poly([[5,20],[6,17.4],[7.4,20]],'#a8d080'); });
    e.within(P[2],()=>{ e.arc(23,28,5,4,Math.PI*1.1,Math.PI*1.7,1,'#4a8ad0'); });
    const rt=[[4.4,26.4],[8.4,23.4],[12.6,24.6],[15.4,20.4],[19.4,21],[21.4,17.6]];
    for(let i=0;i<rt.length-1;i++){ const [x0,y0]=rt[i],[x1,y1]=rt[i+1]; e.ln(x0,y0,x0+(x1-x0)*0.55,y0+(y1-y0)*0.55,1,RD[2]); }
    e.ln(20.6,14.6,24.6,18.6,1.3,RD[3]); e.ln(24.6,14.6,20.6,18.6,1.3,RD[3]); e.ln(20.8,14.4,24.4,18,0.6,RD[1]); e.ln(24.4,14.4,20.8,18,0.6,RD[1]);
    e.rect(9.6,11.8,0.8,16.6,DKP[3]); e.rect(17.6,13.4,0.8,16.6,LT[3]);
  }

  // ---------------- composição ----------------
  function layer(px,K,fn){
    return compose({FW:px,FH:px,GROUND:px+16,step:5,rim:RIM,M:{},
      parts:[{draw:(c,u)=>{ c.setTransform(K,0,0,K,0,0); fn(ITEMS.KIT(c,u)); c.setTransform(1,0,0,1,0,0); }}]});
  }
  const hexRgb=PIX.hexRgb;
  // estado destacado: tons mais claros (contorno intacto) + aro de 1 px na cor de destaque
  function highlight(g,px,acc){
    const img=g.getImageData(0,0,px,px), d=img.data, O=hexRgb(OUTLINE), A=hexRgb(acc), N=px*px;
    const a=new Uint8Array(N); for(let i=0;i<N;i++) a[i]=d[i*4+3]>0?1:0;
    for(let i=0;i<N;i++){ if(!a[i]) continue; const q=i*4; if(d[q]===O[0]&&d[q+1]===O[1]&&d[q+2]===O[2]) continue;
      d[q]=d[q]+(255-d[q])*0.22; d[q+1]=d[q+1]+(250-d[q+1])*0.2; d[q+2]=d[q+2]+(235-d[q+2])*0.16; }
    for(let y=0;y<px;y++) for(let x=0;x<px;x++){ const i=y*px+x; if(a[i]) continue;
      if((x>0&&a[i-1])||(x<px-1&&a[i+1])||(y>0&&a[i-px])||(y<px-1&&a[i+px])){ const q=i*4; d[q]=A[0]; d[q+1]=A[1]; d[q+2]=A[2]; d[q+3]=255; } }
    g.putImageData(img,0,0);
  }
  const cache=new Map();
  function icon(id,px=40,state='n'){
    if(!S[id]) id='build';
    const key=id+'|'+px+'|'+state; if(cache.has(key)) return cache.get(key);
    const old=PIX.getK(), K=px/SIZE;
    const out=document.createElement('canvas'); out.width=out.height=px;
    const g=out.getContext('2d',{willReadFrequently:true}); g.imageSmoothingEnabled=false;
    try{ PIX.setK(K); for(const fn of S[id]) g.drawImage(layer(px,K,fn),0,0); }
    finally{ PIX.setK(old); }
    if(state==='h') highlight(g,px,ACC[id]);
    cache.set(key,out); return out;
  }
  return {IDS,ACC,SIZE,icon};
})();
