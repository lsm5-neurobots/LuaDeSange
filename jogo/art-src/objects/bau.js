/* BAU — fonte de arte (editável). Build: npm run art */
const BAU=(function(){
  const {rad,mkPen,compose,P2,mix}=PIX;
  const FW=76, FH=70, GY=62, AX=38;
  const TIPOS={
    comum:{nome:'Baú comum', cor:'#b9b0a0', chave:'chave_comum', preco:'20 moedas', loot:['Sucata ×3–6','Moedas 10–25','Comida enlatada','Chance 10%: peça de arma comum']},
    medico:{nome:'Baú médico', cor:'#e85a5a', chave:'chave_medica', preco:'35 moedas', loot:['Kit curativo ×1–2','Atadura ×2–4','Antídoto (veneno do Cuspidor)','Chance 15%: seringa de adrenalina']},
    militar:{nome:'Baú militar', cor:'#7a9a4a', chave:'chave_militar', preco:'50 moedas', loot:['Munição/peças ×4–8','Colete leve','Granada de efeito','Chance 12%: bastão de alumínio (raro)']},
    raro:{nome:'Baú raro', cor:'#c8323a', chave:'chave_rara', preco:'só cai (não compra)', loot:['Moedas 80–150','Item lunar garantido','Cristal da Lua de Sangue','Chance 5%: bastão da Lua de Sangue']},
  };
  const FX={comum:['#fff4c0','#ffd24a'],medico:['#ffe0e0','#ff7a7a'],militar:['#f2ffc0','#b8e060'],raro:['#ffd0f0','#ff4a8a']};
  function mats(t){
    const base={
      out:['#3a3040','#241c2a','#16101a','#0a060c'],
      dark:['#3a2a38','#1c1018','#100810','#060204'],
      glow:['#fffbe0','#ffe27a','#f2c230','#a07a14'],
      coin:['#fff6b0','#f6c83a','#b07a18','#5a420a'],
      gem:['#ffc0d0','#ff3a5a','#b0143a','#5a0820'],
      gold:['#fff0a0','#f2c230','#b07a18','#5a420a'],
      steel:['#f0f4fa','#b4bccc','#6a7288','#343a4e'],
      rope:['#f0d8a0','#c8a468','#8a6a3a','#4a3418'],
    };
    if(t==='comum') Object.assign(base,{wood:['#d89a5e','#9a6234','#62391e','#341c0e'],band:['#c8ccd8','#828898','#50566a','#2a2e40'],lock:['#e8ecf4','#a0a6b8','#606680','#343850'],lin:['#c84a5a','#8a2438','#541624','#2a0a14'],moss:['#9ad05a','#5c9a3a','#386a2a','#1c3a1a']});
    if(t==='medico') Object.assign(base,{wood:['#ffffff','#e6ecf0','#a4b2c4','#5c6a82'],band:['#ffa0a0','#e0384a','#901a30','#4a0818'],lock:['#e8ecf4','#a0a6b8','#606680','#343850'],lin:['#ffffff','#d8e8f0','#9ab0c8','#566884'],moss:['#9ad05a','#5c9a3a','#386a2a','#1c3a1a']});
    if(t==='militar') Object.assign(base,{wood:['#b8c880','#788a48','#4a5a2c','#283418'],band:['#ffe888','#e0b838','#9a7414','#4a3608'],lock:['#d0d4dc','#8c92a4','#585e74','#30344a'],lin:['#6a7a44','#46542a','#2c381a','#161e0c'],moss:['#9ad05a','#5c9a3a','#386a2a','#1c3a1a']});
    if(t==='raro') Object.assign(base,{wood:['#9a5a82','#5a2a52','#38183a','#1c0a22'],band:['#fff0a0','#f2c230','#b07a18','#5a420a'],lock:['#ffd0a0','#e0a038','#9a5a18','#4a280a'],lin:['#c05aa8','#7a2a82','#4a1458','#240a2e'],moss:['#9ad05a','#5c9a3a','#386a2a','#1c3a1a']});
    return base;
  }
  const hsh=(i,s)=>{ const v=Math.sin(i*12.9898+s*78.233)*43758.5453; return v-Math.floor(v); };
  function dirt(p,col,x,y,w,h,n,seed){ p.F(col); for(let i=0;i<n;i++) p.rect(Math.round(x+hsh(i,seed)*(w-1)),Math.round(y+hsh(i,seed+9)*(h-1)),1,1); }
  const rivet=(p,m,x,y)=>{ p.F(m[0]); p.rect(x,y,1.6,1.6); p.F(m[3]); p.rect(x+1,y+1.2,1,1); };
  const BX=12, BR=56, BT=32, BB=60, DX=6, DY=4; // corpo: frente x12..56, y32..60; profundidade (+6,-4)

  // ---------- corpo
  function drawBase(p,M,t,open){
    p.F(M.dark[2]); p.ell(38,BB+1,34,3.4);
    // lateral e frente
    p.F(M.wood[2]); p.poly([[BR,BT],[BR+DX,BT-DY],[BR+DX,BB-DY],[BR,BB]]);
    p.F(M.wood[3]); p.rect(BR+DX-1,BT-DY,1,BB-BT);
    p.F(M.wood[1]); p.poly([[BX,BT],[BR,BT],[BR,BB],[BX,BB]]);
    p.F(M.wood[0]); p.rect(BX,BT,BR-BX,1); p.rect(BX,BT,1,BB-BT);
    p.F(M.wood[3]); p.rect(BX,BB-2,BR-BX,2);
    if(open){ p.F(M.lin[2]); p.poly([[BX+1,BT],[BR,BT],[BR+DX,BT-DY],[BX+DX+1,BT-DY]]); p.F(M.lin[3]); p.poly([[BX+3,BT-1],[BR-1,BT-1],[BR+DX-2,BT-DY+1],[BX+DX+3,BT-DY+1]]); }
    if(t==='comum'){
      // tábuas com veios, pregos, bandas de ferro, musgo
      [38,45,52].forEach(y=>{ p.F(M.wood[3]); p.rect(BX+1,y,BR-BX-2,1); p.F(M.wood[0]); p.rect(BX+1,y+1,BR-BX-2,0.8); });
      p.F(M.wood[2]); [[24,35],[32,42],[40,48],[28,55],[44,36],[36,57]].forEach(([x,y])=>p.rect(x,y,6,1));
      p.F(M.wood[0]); [[22,40],[38,50],[30,34]].forEach(([x,y])=>p.rect(x,y,4,1));
      [16,48].forEach(bx=>{ p.F(M.band[1]); p.rect(bx,BT,5,BB-BT-2); p.F(M.band[0]); p.rect(bx,BT,1.4,BB-BT-2); p.F(M.band[3]); p.rect(bx+4,BT,1,BB-BT-2); [35,43,51,57].forEach(y=>rivet(p,M.band,bx+1.6,y)); });
      p.F(M.band[2]); p.rect(BX,BB-5,BR-BX,3); p.F(M.band[0]); p.rect(BX,BB-5,BR-BX,1);
      p.F(M.moss[1]); p.rect(BX+1,BB-8,6,3); p.rect(BX+3,BB-10,3,2); p.F(M.moss[0]); p.rect(BX+3,BB-10,2,1); p.F(M.moss[2]); p.rect(BX+1,BB-6,6,1);
      p.F(M.wood[3]); p.poly([[44,44],[47,44],[41,52],[39,52]]);
      dirt(p,M.wood[3],BX+1,BT+1,BR-BX-2,24,16,4);
    }
    if(t==='medico'){
      p.F(M.wood[2]); p.rect(BX+1,BB-8,BR-BX-2,1); p.F(M.band[1]); p.rect(BX,BB-7,BR-BX,5); p.F(M.band[0]); p.rect(BX,BB-7,BR-BX,1); p.F(M.band[3]); p.rect(BX,BB-3,BR-BX,1);
      // cruz grande biselada
      p.F(M.band[2]); p.rect(28,36,13,19); p.rect(23,41,23,9); p.F(M.band[1]); p.rect(27,35,12,18); p.rect(22,40,22,8); p.F(M.band[0]); p.rect(27,35,12,1.4); p.rect(22,40,22,1.4); p.rect(27,35,1.4,6); p.rect(22,40,1.4,8);
      // grampos e alça
      [[16],[48]].forEach(([x])=>{ p.F(M.lock[2]); p.rect(x,BT,5,6); p.F(M.lock[0]); p.rect(x,BT,5,1.4); p.F(M.lock[3]); p.rect(x+1,BT+3,3,1); });
      p.F(M.wood[2]); p.rect(BX+1,BT+9,BR-BX-2,1);
      p.F(M.band[1]); p.rect(15,56,3,1); p.rect(50,56,3,1);
      p.F(M.rust?M.rust[1]:M.band[2]); p.rect(BR-8,BB-9,5,2);
      p.F(M.band[2]); p.rect(14,45,5,6); p.rect(15,51,1,3); p.rect(17,51,1,2);
      dirt(p,M.wood[3],BX+1,BT+1,BR-BX-2,22,12,6);
    }
    if(t==='militar'){
      p.F(M.wood[2]); p.rect(BX+1,44,BR-BX-2,1); p.F(M.wood[0]); p.rect(BX+1,45,BR-BX-2,0.8);
      // alças de corda nas laterais
      p.F(M.rope[2]); p.rect(BR-2,38,3,2); p.rect(BR-2,48,3,2); p.F(M.rope[1]); p.rect(BR-1,39,2,10);
      // estêncil
      p.F(M.band[1]); [[18,36,3,7],[22,36,3,7],[26,36,3,7],[22,36,7,2],[34,36,5,2],[34,40,5,2],[40,36,2,7]].forEach(([x,y,w,h])=>p.rect(x,y,w,h)); p.F(M.band[0]); p.rect(18,36,1,7); p.rect(22,36,1,7); p.rect(26,36,1,7);
      p.F(M.wood[3]); p.rect(20,38,1,3); p.rect(24,38,1,3);
      // chevrons amarelos na base
      p.F(M.band[1]); for(let k=0;k<5;k++) p.poly([[14+k*9,BB-3],[19+k*9,BB-3],[22+k*9,BB-10],[17+k*9,BB-10]]); p.F(M.wood[3]); for(let k=0;k<5;k++) p.rect(14+k*9,BB-3,5,1);
      // cantoneiras e trincos
      p.F(M.lock[1]); p.rect(BX,BT,5,5); p.rect(BR-5,BT,5,5); p.rect(BX,BB-5,5,5); p.rect(BR-5,BB-5,5,5); p.F(M.lock[0]); p.rect(BX,BT,5,1); p.rect(BR-5,BT,5,1); rivet(p,M.lock,BX+1.6,BT+1.6); rivet(p,M.lock,BR-3.4,BT+1.6);
      p.F(M.wood[3]); p.rect(14,48,12,1); p.rect(40,50,10,1);
      dirt(p,M.wood[3],BX+1,BT+1,BR-BX-2,26,16,7);
    }
    if(t==='raro'){
      p.F(M.band[1]); p.rect(BX,BT,BR-BX,3); p.rect(BX,BB-4,BR-BX,4); p.rect(BX,BT,3,BB-BT); p.rect(BR-3,BT,3,BB-BT); p.F(M.band[0]); p.rect(BX,BT,BR-BX,1); p.rect(BX,BT,1,BB-BT); p.F(M.band[3]); p.rect(BX,BB-1,BR-BX,1); p.rect(BR-1,BT,1,BB-BT);
      // filigrana dourada + quartos de Lua
      p.F(M.band[2]); for(let k=0;k<4;k++){ p.rect(20+k*8,38+((k%2)*2),5,1); p.rect(20+k*8,52-((k%2)*2),5,1); }
      p.F(M.band[1]); [[20,38],[48,38],[20,53],[48,53]].forEach(([x,y])=>p.ell(x,y,2.2,2.2)); p.F(M.gem[1]); [[20,38],[48,38],[20,53],[48,53]].forEach(([x,y])=>p.ell(x,y,1.1,1.1));
      p.F(M.band[1]); p.circle(P2(34,48),5.6); p.F(M.wood[1]); p.circle(P2(36,47),4.7); p.F(M.band[0]); p.rect(30,44,2,2);
      p.F(M.wood[3]); p.rect(BX+3,BB-8,BR-BX-6,1);
      dirt(p,M.wood[3],BX+4,BT+4,BR-BX-8,20,10,8);
    }
    // placa da fechadura (todas menos médico)
    if(t!=='medico'){ const ly=t==='raro'?33:34; p.F(M.lock[2]); p.rect(29,ly-1,11,12); p.F(M.lock[1]); p.rect(29,ly-1,10,11); p.F(M.lock[0]); p.rect(29,ly-1,10,1.4); p.rect(29,ly-1,1.4,11); p.F(M.lock[3]); p.rect(29,ly+9,10,1);
      if(t==='raro'){ p.F(M.gem[2]); p.circle(P2(34,ly+4),3.2); p.F(M.gem[1]); p.circle(P2(34,ly+4),2.4); p.F(M.gem[0]); p.rect(33,ly+2.6,1.6,1.6); }
      else { p.F(M.dark[1]); p.ell(34,ly+3.4,1.5,1.5); p.rect(33.2,ly+3.4,1.6,3.6); p.F(M.lock[3]); p.rect(30,ly,1,1); p.rect(38,ly,1,1); } }
  }
  // ---------- tampa fechada
  function drawLidClosed(p,M,t,lift){
    const L=lift||0; p.xf(0,0,-L);
    const dome=(t==='comum'||t==='raro');
    // lateral, frente, topo
    p.F(M.wood[2]); p.poly([[BR,22],[BR+DX,18],[BR+DX,BT-DY],[BR,BT]]);
    p.F(M.wood[1]); p.rect(BX,22,BR-BX,10);
    p.F(M.wood[0]); p.poly([[BX,22],[BX+DX,18],[BR+DX,18],[BR,22]]);
    if(dome){ p.F(M.wood[0]); p.poly([[BX,22],[BX+3,19],[BX+DX+3,16],[BR+DX-3,16],[BR+DX,18],[BR,22]]); p.F(M.wood[1]); p.rect(BX+DX+2,17,BR-BX-4,1); }
    p.F(M.wood[0]); p.rect(BX,22,BR-BX,1); p.F(M.wood[3]); p.rect(BX,BT-1,BR-BX,1);
    if(t==='comum'){ [16,48].forEach(bx=>{ p.F(M.band[1]); p.rect(bx,16+(bx>40?1:0),5,16); p.F(M.band[0]); p.rect(bx,17,1.4,15); p.F(M.band[3]); p.rect(bx+4,18,1,14); rivet(p,M.band,bx+1.6,24); rivet(p,M.band,bx+1.6,29); });
      p.F(M.wood[3]); p.rect(24,26,10,1); p.rect(38,28,12,1); p.F(M.wood[0]); p.rect(27,18,10,1); }
    if(t==='medico'){ p.F(M.wood[2]); p.rect(BX+DX,17,BR-BX-DX,1); p.F(M.band[1]); p.rect(BX,22,BR-BX,2); p.F(M.band[3]); p.rect(BX,24,BR-BX,1);
      p.F(M.lock[2]); p.rect(26,12,18,5); p.F(M.lock[1]); p.rect(27,13,16,3); p.F(M.lock[0]); p.rect(27,13,16,1); p.F(M.dark[1]); p.rect(29,14,12,1.4); // alça
      p.F(M.band[1]); p.rect(32,25,6,2); p.rect(34,24,2,6); p.F(M.band[0]); p.rect(32,25,6,1); }
    if(t==='militar'){ p.F(M.band[1]); p.rect(BX,22,BR-BX,2); p.F(M.band[3]); p.rect(BX,24,BR-BX,1); p.F(M.lock[2]); p.rect(26,12,18,4); p.F(M.lock[1]); p.rect(27,13,16,2); p.F(M.lock[0]); p.rect(27,13,16,1);
      p.F(M.lock[1]); p.rect(BX,22,5,5); p.rect(BR-5,22,5,5); p.F(M.lock[0]); p.rect(BX,22,5,1); rivet(p,M.lock,BX+1.6,23.6); rivet(p,M.lock,BR-3.4,23.6);
      p.F(M.band[1]); p.rect(32,27,6,2); p.F(M.wood[3]); p.rect(34,24,1,2); }
    if(t==='raro'){ p.F(M.band[1]); p.rect(BX,22,BR-BX,3); p.rect(BX,22,3,10); p.rect(BR-3,22,3,10); p.F(M.band[0]); p.rect(BX,22,BR-BX,1); p.F(M.band[3]); p.rect(BX,25,BR-BX,1);
      p.F(M.band[1]); p.poly([[BX+DX+4,18],[BR+DX-4,18],[BR+DX-8,16],[BX+DX+8,16]]);
      p.F(M.gem[1]); p.ell(34,26,2.4,2.4); p.F(M.gem[0]); p.rect(33,24.6,1.4,1.4); p.F(M.band[1]); p.rect(33,12,3,4); p.F(M.gem[1]); p.rect(33.2,11,2.4,2.4); }
    dirt(p,M.wood[3],BX+2,23,BR-BX-4,8,6,3);
    p.id();
  }
  // ---------- tampa aberta (face interna visível, articulada atrás)
  function drawLidOpen(p,M,t,th){
    const s=Math.sin(th), c=Math.cos(th), h=26*s, sh=-7*c; // c<0 => inclina pra trás (direita)
    const X0=BX+6, X1=BR+DX, Y=BT-DY, T=Y-h;
    // espessura/borda (madeira) e forro
    p.F(M.wood[2]); p.poly([[X0+sh-1,T-2],[X1+sh+1,T-2],[X1+1,Y],[X0-1,Y]]);
    p.F(M.wood[0]); p.rect(X0+sh-1,T-2,X1-X0+2,1.6);
    p.F(M.lin[1]); p.poly([[X0+sh+2,T+1],[X1+sh-2,T+1],[X1-2,Y-1],[X0+2,Y-1]]);
    p.F(M.lin[0]); p.poly([[X0+sh+2,T+1],[X0+sh+8,T+1],[X0+7,Y-1],[X0+2,Y-1]]);
    p.F(M.lin[2]); p.poly([[X1+sh-9,T+1],[X1+sh-2,T+1],[X1-2,Y-1],[X1-9,Y-1]]);
    p.F(M.lin[3]); p.rect(X0+2,Y-3,X1-X0-4,2);
    // ornamento interno (dourado/costura)
    p.F(M.band[1]); p.poly([[X0+sh+5,T+4],[X1+sh-5,T+4],[X1+sh*0.5-5,T+5],[X0+sh*0.5+5,T+5]]);
    if(h>8){ p.F(M.band[2]); p.ell((X0+X1)/2+sh*0.5,T+h*0.5,5,h*0.18); p.F(M.band[0]); p.rect((X0+X1)/2+sh*0.5-1,T+h*0.5-1,2,1); }
    if(t==='medico'){ p.F(M.band[1]); const cx=(X0+X1)/2+sh*0.5, cy=T+h*0.5; p.rect(cx-1.4,cy-5,3,10); p.rect(cx-5,cy-1.4,10,3); }
  }
  // ---------- brilho / feixes / partículas
  function drawBeam(p,M,t,f,ph){
    const [c1,c2]=FX[t]; const g=[0,5,10,14,15][Math.min(4,f)]; if(!g) return;
    // três feixes cônicos afilados + halo achatado na boca
    [[26,-6,3],[37,0,5],[48,6,3]].forEach(([x,dx,w],i)=>{ const len=g*0.9+(i===1?8:3)+(ph%3)*1.2; p.F(c2); p.poly([[x-w,BT-DY],[x+w,BT-DY],[x+dx+w*0.3,BT-DY-len],[x+dx-w*0.3,BT-DY-len]]); p.F(c1); p.poly([[x-w*0.4,BT-DY],[x+w*0.4,BT-DY],[x+dx+0.4,BT-DY-len*0.8],[x+dx-0.4,BT-DY-len*0.8]]); });
    p.F(c2); p.ell(37,BT-DY+0.5,19,2.2); p.F(c1); p.ell(37,BT-DY,12,1.4);
  }
  function coin(p,M,x,y,w){ p.F(M.coin[2]); p.ell(x,y+0.6,w+0.6,3.4); p.F(M.coin[1]); p.ell(x,y,w,3); p.F(M.coin[0]); p.rect(x-w+1,y-2,Math.max(1,w-1),1); }
  function drawLoot(p,M,t,f,ph){
    const lv=[0,0,7,14,17][Math.min(4,f)]; if(f<2) return;
    const bob=f>=4?[0,-1,-2,-1][ph%4]:0, rest=f>=4;
    // monte de moedas dentro (sempre que aberto)
    p.F(M.coin[2]); p.ell(34,BT-1,15,3.6); p.F(M.coin[1]); p.ell(34,BT-2.4,14,3.2); p.F(M.coin[0]); [[26,-4],[32,-5],[38,-4],[43,-3],[29,-3]].forEach(([x,y])=>p.rect(x,BT+y,2.4,1.2));
    const y0=BT-lv+bob;
    if(t==='comum'){ coin(p,M,26,y0-1,3.4); coin(p,M,36,y0-5,3.4); p.F(M.steel[1]); p.rect(43,y0-3,5,7); p.F(M.steel[0]); p.rect(43,y0-3,1.4,7); p.F(M.band[2]); p.rect(43,y0,5,2); p.F(M.gem[1]); p.rect(44,y0+1,3,1); coin(p,M,30,y0+3,3); }
    if(t==='medico'){ p.F(M.wood[0]); p.rect(24,y0-2,8,6); p.F(M.band[1]); p.rect(26,y0-1,4,1.4); p.rect(27.4,y0-2,1.4,4); p.F(M.wood[2]); p.rect(24,y0+3,8,1); // atadura
      p.F(M.steel[0]); p.rect(37,y0-6,2,9); p.F(M.band[1]); p.rect(36,y0+2,4,3); p.F(M.steel[1]); p.rect(37.4,y0-9,1,3); // seringa
      p.F(M.leaf?M.leaf[1]:'#5aa03a'); p.rect(43,y0-2,5,8); p.F(M.wood[0]); p.rect(44,y0-1,3,3); p.F(M.band[1]); p.rect(44.6,y0,1.6,1.6); }
    if(t==='militar'){ p.F(M.wood[1]); p.rect(24,y0-2,9,6); p.F(M.band[1]); p.rect(25,y0-1,7,1.4); p.F(M.wood[3]); p.rect(24,y0+3,9,1); // caixa de munição
      p.F(M.lin[1]); p.ell(41,y0-1,3.4,4.2); p.F(M.steel[2]); p.rect(40,y0-6,3,2.4); p.F(M.band[1]); p.rect(41,y0-8,1.4,2); p.F(M.wood[0]); p.rect(39.4,y0-3,1.4,4); // granada
      coin(p,M,31,y0-6,3); p.F(M.steel[1]); p.rect(46,y0-2,3,8); }
    if(t==='raro'){ // cristal da Lua de Sangue + coroa de moedas
      p.F(M.gem[2]); p.poly([[36,y0-11],[41,y0-5],[39,y0+3],[33,y0+3],[31,y0-5]]); p.F(M.gem[1]); p.poly([[36,y0-11],[41,y0-5],[36,y0+3],[33,y0+3],[31,y0-5]]); p.F(M.gem[0]); p.poly([[36,y0-11],[34,y0-6],[32,y0-5]]); p.rect(34,y0-4,1.4,5);
      coin(p,M,24,y0-2,3.4); coin(p,M,47,y0-3,3.4); coin(p,M,44,y0+2,3);
      p.F(M.band[1]); p.rect(26,y0-8,3,3); p.F(M.band[0]); p.rect(26,y0-8,3,1); }
  }
  // centelhas
  function drawSpark(p,M,t,state,f,ph){
    const [c1,c2]=FX[t]; const star=(x,y,r)=>{ p.F(c1); p.rect(x-r,y-0.5,r*2+1,1.3); p.rect(x-0.5,y-r,1.3,r*2+1); p.F(c2); p.rect(x-0.5,y-0.5,1.3,1.3); };
    const sp=(x,y,r)=>{ p.F(c1); p.rect(x-0.5,y-0.5,1.6,1.6); if(r>1){ p.F(c2); p.rect(x-r,y,1.3,1.3); p.rect(x+r-0.3,y,1.3,1.3); p.rect(x,y-r,1.3,1.3); p.rect(x,y+r-0.3,1.3,1.3); } };
    if(state==='fechado'){
      // brilho pulsando no fecho + glints varrendo; raro tem partículas flutuando
      const r=[0.8,1.6,2.6,3.4,2.6,1.6,0.8,0][ph%8]; if(r>0) star(41,35,Math.round(r));
      const sw=[0,1,2,3,4,5,6,7][ph%8]; p.F(c1); p.rect(BX+4+sw*5,34,2,1.2); p.rect(BX+3+sw*5,35,2,1.2);
      if(t==='raro'){ for(let k=0;k<4;k++){ const u=((ph+k*2)%8)/8; sp(Math.round(18+k*13+Math.sin(u*6.28)*2),Math.round(30-u*20),u<0.5?2:1); } }
      if(t==='medico'){ const pulse=[0,1,1,1,0,0,0,0][ph%8]; if(pulse){ p.F(c2); p.rect(31,37,1.4,1.4); } }
    }
    if(state==='abrindo'){ const n=[0,5,8,10,6][f]; for(let k=0;k<n;k++){ const u=(k+1)/(n+1), x=22+hsh(k,1)*34, y=BT-DY-4-u*(10+f*5)-hsh(k,2)*6; if(k%3===0) star(Math.round(x),Math.round(y),Math.round(1+u*2)); else sp(Math.round(x),Math.round(y),1+(k%2)); } }
    if(state==='aberto'){ for(let k=0;k<5;k++){ const u=((ph+k*2)%8)/8, x=22+k*7+Math.sin(u*6.28+k)*2, y=BT-DY-3-u*20; if(u<0.85){ if(k%2) star(Math.round(x),Math.round(y),u<0.4?2:1); else sp(Math.round(x),Math.round(y),1); } } }
  }
  // ---------- passe de luz (faixas duras)
  const hx=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
  const WARM=hx('#fff0c8'), COOL=hx('#3b2c63'), DEEP=hx('#1c1233');
  function grade(cv,keepTop){
    const W=cv.width,H=cv.height,g=cv.getContext('2d'),im=PIX.pix(cv),d=im.data;
    let y0=H,y1=0,x0=W,x1=0; for(let y=0;y<H;y++)for(let x=0;x<W;x++) if(d[(y*W+x)*4+3]>0){ if(y<y0)y0=y; if(y>y1)y1=y; if(x<x0)x0=x; if(x>x1)x1=x; }
    const hh=Math.max(1,y1-y0), ww=Math.max(1,x1-x0);
    const mx=(c,t,m)=>[c[0]+(t[0]-c[0])*m,c[1]+(t[1]-c[1])*m,c[2]+(t[2]-c[2])*m];
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){ const i=(y*W+x)*4; if(!d[i+3]) continue;
      let c=[d[i],d[i+1],d[i+2]]; if(c[0]<44&&c[1]<30&&c[2]<48) continue; if(c[0]===0xa9&&c[1]===0xc8&&c[2]===0xf0) continue;
      const t=(y-y0)/hh, u=(x-x0)/ww, lum=(c[0]+c[1]+c[2])/765, wk=1-lum*0.55;
      if(t<0.12) c=mx(c,WARM,0.2*wk); else if(t<0.24) c=mx(c,WARM,0.1*wk); else if(t>0.93) c=mx(c,DEEP,0.38); else if(t>0.83) c=mx(c,COOL,0.28); else if(t>0.72) c=mx(c,COOL,0.16); else if(t>0.62) c=mx(c,COOL,0.07);
      if(u<0.1) c=mx(c,WARM,0.08*wk); else if(u>0.9) c=mx(c,COOL,0.14);
      d[i]=c[0]; d[i+1]=c[1]; d[i+2]=c[2]; }
    g.putImageData(im,0,0); return cv;
  }
  const cache=PIX.cache();
  function frame(tipo,state,fi=0,step=5){
    const K=PIX.getK();
    const ph=(state==='fechado'||state==='aberto')?(fi?fi%8:Math.floor((typeof performance!=='undefined'?performance.now():0)/130)%8):fi;
    const key=tipo+state+fi+'|'+ph+'|'+step+'@'+K; if(cache.has(key)) return cache.get(key);
    const M=mats(tipo), open=state==='abrindo'||state==='aberto', f=state==='aberto'?4:Math.min(4,fi);
    const shake=state==='trancado'?[-1.6,1.6,0][fi%3]:0;
    const sh=(fn,rx)=>(c,u)=>{ const p=mkPen(c,u); const ox=p.xf; p.xf=(a,x,y)=>ox(a,x+shake,y); p.id=()=>ox(0,shake,0); p.id(); fn(p); };
    const parts=[{draw:sh(p=>drawBase(p,M,tipo,open&&f>=1))}];
    if(!open || f===0) parts.push({draw:sh(p=>drawLidClosed(p,M,tipo,0))});
    else if(f===1) parts.push({draw:sh(p=>drawLidClosed(p,M,tipo,3))});
    else parts.push({draw:sh(p=>drawLidOpen(p,M,tipo,rad([0,0,48,80,104][f])))});
    if(open&&f>=1) parts.push({noShade:true,noRim:true,draw:sh(p=>drawBeam(p,M,tipo,f,ph))});
    if(open&&f>=2) parts.push({draw:sh(p=>drawLoot(p,M,tipo,f,ph)),noRim:true});
    if(state==='trancado' && fi%2===0) parts.push({noShade:true,noRim:true,draw:sh(p=>{ p.F('#ffb0a0'); p.rect(26,32,16,1.4); p.F('#ff3a3a'); p.rect(30,35,8,1.4); p.rect(33,34,2,8); p.rect(28,40,12,1.4); })});
    if(state!=='trancado') parts.push({noShade:true,noRim:true,draw:sh(p=>drawSpark(p,M,tipo,state,f,ph))});
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GY*K,parts,M,step,rim:'#a9c8f0'});
    grade(cv);
    cv._glow=open?{x:38*K,y:28*K,r:(10+f*3)*K}:null;
    cache.set(key,cv); return cv;
  }
  function ANCHOR(tipo){ const K=PIX.getK(); return {ax:AX*K, gy:GY*K}; }
  const kcache=new Map();
  function chave(tipo,step=5){
    const key=tipo+step; if(kcache.has(key)) return kcache.get(key);
    const M=mats(tipo), K0=PIX.getK(); PIX.setK(1);
    const metal=tipo==='raro'?M.band:tipo==='comum'?M.lock:tipo==='medico'?M.wood:M.lock;
    const cv=compose({FW:28,FH:28,GROUND:40,M:Object.assign({},M,{metal}),step,rim:'#a9c8f0',parts:[{draw:(c,u)=>{ const p=mkPen(c,u); p.xf(-Math.PI/4,9,19);
      p.F(metal[1]); p.ell(0,0,5.4,5.4); p.F(M.dark[1]); p.ell(0,0,2.2,2.2);
      p.F(metal[1]); p.rect(4,-1.4,16,2.8); p.rect(14,1,2.4,4); p.rect(18,1,2.4,3);
      if(tipo==='medico'){ p.F(M.band[1]); p.rect(-1,-4,2,8); p.rect(-4,-1,8,2); }
      if(tipo==='militar'){ p.F(M.band[1]); p.rect(6,-1.4,4,2.8); }
      if(tipo==='raro'){ p.F(M.lock[1]); p.ell(0,0,1.8,1.8); }
      p.id(); }}]});
    PIX.setK(K0); kcache.set(key,cv); return cv;
  }
  return {TIPOS,frame,ANCHOR,chave,mats,FW,FH,GY,AX};
})();
