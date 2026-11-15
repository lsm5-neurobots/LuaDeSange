/* ===== BATON: o bastão (cassetete) em 4 raridades. drawBaton desenha num pen do PIX. ===== */
const BATON=(function(){
  const {P2}=PIX;
  const TIERS={
    comum:{nome:'Cassetete de borracha', rar:'Comum', cor:'#b9b0a0', len:26,
      M:{bat:['#6a6a78','#2c2c38','#1c1c26','#0e0e14'], grip:['#5a5660','#34303a','#221e28','#121016'], tip:['#e0e0e8','#a0a0b0','#62627a','#3a3a4e'], cord:['#e8c860','#c89a30','#8a6418','#4a340a'], blood:['#a44a3a','#7a2a2a','#521a20','#320c14']},
      stats:{dano:8, alcance:'curto', vel:'rápida', atordoa:'0,3 s no 3º golpe', extra:'—'},
      desc:'O cassetete de borracha que o Vigia nunca tirou da cinta. Fita isolante na empunhadura, 3 anéis, cordão de pulso amarelo e a ponta riscada de tanto bater em portão.'},
    incomum:{nome:'Cassetete com pregos', rar:'Incomum', cor:'#4fb06a', len:27,
      M:{bat:['#6a6a78','#2c2c38','#1c1c26','#0e0e14'], grip:['#7ad890','#3e9a5a','#2a6a3e','#163a22'], tip:['#e0e0e8','#a0a0b0','#62627a','#3a3a4e'], cord:['#e8c860','#c89a30','#8a6418','#4a340a'], blood:['#a44a3a','#7a2a2a','#521a20','#320c14'], nail:['#f0f0f6','#b8b8c8','#7a7a8e','#44445a']},
      stats:{dano:11, alcance:'curto', vel:'rápida', atordoa:'0,3 s no 3º golpe', extra:'Sangramento: +2 de dano por 2 s'},
      desc:'Mesma borracha, agora com pregos de obra cravados na ponta e fita verde de jardinagem no cabo. Feio, mas abre ferida.'},
    raro:{nome:'Bastão de alumínio', rar:'Raro', cor:'#4a8fe0', len:29,
      M:{bat:['#f2f4fa','#b8c0d0','#7a849a','#454e64'], grip:['#7ab4ff','#3a7ad8','#24509a','#122a5a'], tip:['#ffffff','#d8dce8','#9aa0b4','#5a6078'], cord:['#ff8a7a','#e04a3a','#9a2a20','#5a140e'], blood:['#a44a3a','#7a2a2a','#521a20','#320c14']},
      stats:{dano:14, alcance:'médio', vel:'média', atordoa:'0,6 s no 3º golpe', extra:'3º golpe empurra 2× mais longe'},
      desc:'Bastão retrátil de alumínio achado numa viatura abandonada. Mais comprido e mais pesado: o golpe final arremessa o zumbi.'},
    lunar:{nome:'Bastão da Lua de Sangue', rar:'Lunar', cor:'#c8323a', len:30,
      M:{bat:['#5a3a4a','#2a1820','#1a0e14','#0c060a'], grip:['#ffe27a','#f2c230','#a07a14','#5a420a'], tip:['#ffe27a','#f2c230','#a07a14','#5a420a'], cord:['#ff6a6a','#c8323a','#7a141c','#42080e'], blood:['#ff5a4a','#c8323a','#7a141c','#42080e'], rune:['#ffd0c0','#ff4a3a','#c8323a','#7a141c']},
      stats:{dano:18, alcance:'médio', vel:'média', atordoa:'0,8 s no 3º golpe', extra:'Na Lua de Sangue: golpes queimam (+4) e o apito atordoa 1 s a mais'},
      desc:'Forjado com metal do farolete do molhe durante uma Lua de Sangue. Runas vermelhas que acendem no escuro, anéis e ponta dourados.'},
  };
  // desenha o bastão: base = ponto da empunhadura (punho), ang = direção em radianos (eixo +x do bastão)
  function draw(p,tier,base,ang,o={}){
    const T=TIERS[tier], M=T.M, L=T.len;
    p.xf(ang,base.x,base.y);
    // cordão de pulso (pende do cabo)
    if(!o.noCord){ p.F(M.cord[1]); p.cap(P2(-5,0.6),P2(-7.5,3.6),1.1,1.1); p.cap(P2(-7.5,3.6),P2(-4.6,5.2),1.1,1.1); }
    // cabo + anéis
    p.F(M.tip[1]); p.ell(-5.4,0,2.3,2.3);
    p.F(M.grip[1]); p.cap(P2(-4.4,0),P2(5,0),4.4,4.4);
    p.F(M.grip[2]); [-2.6,0,2.6].forEach(x=>p.rect(x,-2.2,0.9,4.4));
    p.F(M.tip[1]); p.rect(5.6,-2.7,1.6,5.4);
    // haste
    p.F(M.bat[1]); p.cap(P2(7,0),P2(L,0),3.9,3.5);
    p.F(M.bat[0]); p.rect(8,-1.6,L-11,0.9);
    if(tier==='comum'||tier==='incomum'){ p.F(M.bat[2]); [[12,0.4],[17,-0.6],[21,0.2]].forEach(([x,y])=>p.rect(x,y,2,0.8)); }
    if(tier==='raro'){ p.F(M.bat[2]); p.rect(15,-1.8,0.8,3.6); p.rect(22,-1.7,0.8,3.4); }
    if(tier==='incomum'){ p.F(M.nail[1]); [[16,-1],[19,1],[22,-1],[24.5,1]].forEach(([x,s])=>p.poly([[x-0.8,s*1.6],[x+0.8,s*1.6],[x,s*4.6]])); }
    if(tier==='lunar'){ p.F(M.rune[1]); [[11,0],[15,-0.6],[19,0.4],[23,-0.4]].forEach(([x,y])=>{ p.rect(x,y-0.9,1,1.8); p.rect(x+0.9,y-0.2,1,0.8); }); p.F(M.tip[1]); p.rect(L-6,-2.1,1.4,4.2); }
    // ponta
    p.F(M.tip[1]); p.ell(L,0,2.1,2);
    if(tier!=='raro'){ p.F(M.blood[1]); p.rect(L-4,0.4,2.2,1.2); p.rect(L-1.5,-1.2,1,1); }
    p.id();
  }
  return {TIERS,draw};
})();
