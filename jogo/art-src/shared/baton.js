/* BATON — fonte de arte (editável). Build: npm run art */
const BATON=(function(){
  const {P2}=PIX;
  const BLOOD=['#c8584a','#8a2a2a','#5a1820','#320c14'];
  const TIERS={
    comum:{nome:'Cassetete de borracha', rar:'Comum', cor:'#b9b0a0', len:27,
      M:{bat:['#5e5e6e','#2e2e3a','#1e1e28','#0e0e14'], grip:['#6a6470','#3c3842','#26222c','#121016'], tip:['#e8e8f0','#a4a4b4','#64647c','#3a3a4e'], cord:['#f0d470','#c89a30','#8a6418','#4a340a'], blood:BLOOD},
      stats:{dano:8, alcance:'curto', vel:'rápida', atordoa:'0,3 s no 3º golpe', extra:'—'},
      desc:'O cassetete de borracha que o Vigia nunca tirou da cinta. Fita isolante na empunhadura, 3 anéis, cordão de pulso amarelo e a ponta riscada de tanto bater em portão.'},
    incomum:{nome:'Cassetete com pregos', rar:'Incomum', cor:'#4fb06a', len:28,
      M:{bat:['#6a5a52','#3a2e2a','#261e1c','#120e0e'], grip:['#8ae0a0','#3e9a5a','#2a6a3e','#163a22'], tip:['#e8e8f0','#a4a4b4','#64647c','#3a3a4e'], cord:['#f0d470','#c89a30','#8a6418','#4a340a'], blood:BLOOD, nail:['#ffffff','#c0c0d0','#7a7a8e','#44445a']},
      stats:{dano:11, alcance:'curto', vel:'rápida', atordoa:'0,3 s no 3º golpe', extra:'Sangramento: +2 de dano por 2 s'},
      desc:'Mesma borracha, agora com pregos de obra cravados na ponta e fita verde de jardinagem no cabo. Feio, mas abre ferida.'},
    raro:{nome:'Bastão de alumínio', rar:'Raro', cor:'#4a8fe0', len:31,
      M:{bat:['#ffffff','#bcc6d8','#7a86a0','#424c66'], grip:['#8abcff','#3a7ad8','#24509a','#122a5a'], tip:['#ffffff','#dce0ec','#9aa2b8','#5a6078'], cord:['#ff9a8a','#e04a3a','#9a2a20','#5a140e'], blood:BLOOD},
      stats:{dano:14, alcance:'médio', vel:'média', atordoa:'0,6 s no 3º golpe', extra:'3º golpe empurra 2× mais longe'},
      desc:'Bastão retrátil de alumínio achado numa viatura abandonada. Mais comprido e mais pesado: o golpe final arremessa o zumbi.'},
    lunar:{nome:'Bastão da Lua de Sangue', rar:'Lunar', cor:'#c8323a', len:32,
      M:{bat:['#6a3a4e','#30182a','#1e0e1a','#0c060a'], grip:['#fff0a0','#f2c230','#a07a14','#5a420a'], tip:['#fff0a0','#f2c230','#a07a14','#5a420a'], cord:['#ff7a7a','#c8323a','#7a141c','#42080e'], blood:['#ff6a5a','#c8323a','#7a141c','#42080e'], rune:['#fff0e0','#ff5a3a','#c8323a','#7a141c']},
      stats:{dano:18, alcance:'médio', vel:'média', atordoa:'0,8 s no 3º golpe', extra:'Na Lua de Sangue: golpes queimam (+4) e o apito atordoa 1 s a mais'},
      desc:'Forjado com metal do farolete do molhe durante uma Lua de Sangue. Runas vermelhas que acendem no escuro, anéis e ponta dourados.'},
  };
  // desenha o bastão: base = punho (empunhadura), ang = direção em radianos (eixo +x do bastão)
  function draw(p,tier,base,ang,o={}){
    const T=TIERS[tier]||TIERS.comum, M=T.M, L=T.len;
    p.xf(ang,base.x,base.y);
    // cordão de pulso
    if(!o.noCord){ p.F(M.cord[1]); p.cap(P2(-6,0.8),P2(-8.6,4.4),1.3,1.3); p.cap(P2(-8.6,4.4),P2(-5,6.4),1.3,1.3); p.F(M.cord[2]); p.rect(-8.8,4.6,1.2,1.2); }
    // pomo
    p.F(M.tip[2]); p.ell(-6.2,0,2.9,2.9); p.F(M.tip[1]); p.ell(-6,-0.4,2.3,2.2); p.F(M.tip[0]); p.rect(-6.8,-1.8,1.4,0.9);
    // empunhadura
    p.F(M.grip[1]); p.cap(P2(-4.8,0),P2(5.2,0),5,5);
    p.F(M.grip[2]); for(let x=-3.8;x<5;x+=2.2) p.poly([[x,-2.5],[x+1,-2.5],[x+0.2,2.5],[x-0.8,2.5]]);
    p.F(M.grip[0]); p.rect(-4,-2.2,8.6,0.8);
    // virola
    p.F(M.tip[1]); p.rect(5.6,-3,2,6); p.F(M.tip[0]); p.rect(5.8,-3,1.6,0.9); p.F(M.tip[2]); p.rect(5.6,1.8,2,1.2);
    if(tier==='raro'){
      // seções telescópicas
      p.F(M.bat[1]); p.cap(P2(7.6,0),P2(17,0),4.8,4.8); p.cap(P2(17,0),P2(25,0),4.1,4.1); p.cap(P2(25,0),P2(L,0),3.5,3.3);
      p.F(M.bat[2]); p.rect(8,1,9,1.2); p.rect(17,0.8,8,1.1); p.rect(25,0.7,L-25,1);
      p.F(M.bat[0]); p.rect(8.4,-1.8,8,1); p.rect(17.6,-1.6,6.4,0.9); p.rect(25.4,-1.4,L-27,0.8);
      p.F(M.tip[2]); p.rect(16.4,-2.6,1.2,5.2); p.rect(24.4,-2.2,1.1,4.4);
      p.F(M.grip[1]); p.rect(11,-2.4,1,4.8);
    } else {
      p.F(M.bat[1]); p.cap(P2(7.6,0),P2(L,0),4.6,4.1);
      p.F(M.bat[2]); p.poly([[8,1],[L,0.7],[L,2],[8,2.3]]);
      p.F(M.bat[0]); p.rect(8.6,-1.8,L-12,0.9); p.rect(10,-1.2,3,0.7);
      if(tier==='comum'){ p.F(M.tip[1]); [[13,-0.8],[18,0.4],[21,-0.6]].forEach(([x,y])=>p.rect(x,y,1.8,0.7)); p.F(M.bat[3]); p.rect(9.6,-2.2,0.9,4.4); p.rect(11.4,-2.2,0.9,4.4); }
      if(tier==='incomum'){
        p.F(M.bat[3]); [12,16.5].forEach(x=>p.rect(x,-2.2,0.8,4.4));
        p.F(M.nail[2]); [[15,-1],[18,1],[21,-1],[23.5,1],[26,-1]].forEach(([x,s])=>p.poly([[x-0.9,s*1.6],[x+0.9,s*1.6],[x+0.3,s*5.2],[x-0.1,s*5.4]]));
        p.F(M.nail[0]); [[15,-1],[18,1],[21,-1],[23.5,1],[26,-1]].forEach(([x,s])=>p.rect(x-1.2,s>0?1.2:-2.1,2.4,0.9));
        p.F(M.blood[1]); p.rect(20,-2.2,2.4,1.4); p.rect(24.6,0.4,2.6,1.8); p.F(M.blood[2]); p.rect(22,1,1.4,2.4);
      }
      if(tier==='lunar'){
        p.F(M.tip[1]); p.rect(12.6,-2.4,1.2,4.8); p.rect(L-6.6,-2.4,1.6,4.8);
        p.F(M.rune[1]); [[15,0],[18.4,-0.5],[21.8,0.3]].forEach(([x,y])=>{ p.rect(x,y-1.1,0.9,2.2); p.rect(x+0.9,y-0.2,1.1,0.8); p.rect(x+1.8,y-1.1,0.8,1); });
        p.F(M.rune[0]); [[15.2,-0.6],[18.6,-1.1],[22,-0.3]].forEach(([x,y])=>p.rect(x,y,0.6,0.6));
        p.F(M.tip[2]); [[16,-2.6],[20,2.6],[24,-2.6]].forEach(([x,s])=>p.poly([[x-0.8,s*0.6],[x+0.8,s*0.6],[x+0.2,s*1.6]]));
      }
    }
    // ponteira
    if(tier==='lunar'){ p.F(M.tip[1]); p.ell(L,0,2.8,2.6); p.F(M.tip[0]); p.ell(L+0.6,-0.8,1.2,1); p.F(M.rune[1]); p.ell(L-0.6,0.6,1,1); }
    else { p.F(M.tip[2]); p.ell(L,0,2.5,2.3); p.F(M.tip[1]); p.ell(L+0.2,-0.4,1.9,1.6); p.F(M.tip[0]); p.rect(L-0.4,-1.6,1.2,0.8); }
    if(tier==='comum'||tier==='raro'){ p.F(M.blood[1]); p.rect(L-5,0.6,2.6,1.3); p.rect(L-2,-1.4,1.2,1.1); p.F(M.blood[2]); p.rect(L-4,1.6,1,1.2); }
    p.id();
  }
  return {TIERS,draw};
})();
