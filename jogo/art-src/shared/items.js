/* ITEMS — coletáveis (recursos no chão e ícones). Fonte de arte (editável). Build: npm run art */
// Contrato: frame(id, fi=0, step=5) -> canvas (honra PIX.getK(), cache id+fi+step+K) · ANCHOR(id) -> {ax, gy}
// N = 6 quadros de idle (brilho que corre + pulso; sem deslocamento, o motor faz o quique) · SIZE = 28 unidades cruas.
const ITEMS=(function(){
  const {mkPen,compose}=PIX;
  const SIZE=28, N=6, AXU=14, GYU=25, RIM='#a9c8f0';
  const IDS=['madeira','sucata','pano','agua','comida','remedio','pecas','gasolina','fragmento_lunar','projeto','chave',
    'chave_comum','chave_medico','chave_militar','chave_raro','kit_cura','presente','adrenalina','colete'];
  const NOMES={madeira:'Madeira',sucata:'Sucata',pano:'Pano',agua:'Água',comida:'Comida',remedio:'Remédio',pecas:'Peças',gasolina:'Gasolina',fragmento_lunar:'Fragmento lunar',projeto:'Projeto',chave:'Chave',
    chave_comum:'Chave de bronze',chave_medico:'Chave médica',chave_militar:'Chave militar',chave_raro:'Chave de ouro',kit_cura:'Kit de cura',presente:'Presente',adrenalina:'Adrenalina',colete:'Colete improvisado'};
  const hsh=(i,s)=>{ const v=Math.sin(i*12.9898+s*78.233)*43758.5453; return v-Math.floor(v); };

  // ---- rampas explícitas (claro -> escuro, sombra puxando pro roxo)
  const BARK=['#f2c890','#d89a5c','#b0703a','#86502a','#5c341c','#3a1e12'];
  const GRAIN=['#ffe8b4','#f4c886','#daa264','#b47c44','#8a5830'];
  const ROPE=['#fbe8b8','#dcb878','#a88448','#6a5028'];
  const STEEL=['#f6f9ff','#cad2e2','#949eba','#646c8e','#40446a','#282a44'];
  const RUST=['#ffb070','#e27c3a','#b2542a','#80361e','#521e16'];
  const CHITA=['#ff9c8c','#f05a4c','#c8343e','#921e36','#5e1028'];
  const WAT=['#f2fcff','#bfeaff','#7ccaf4','#3c9ae0','#2470c0','#1a4c94','#14306a'];
  const AIR=['#ffffff','#e6f8ff','#c4ecfc','#9cd6f4','#78bcea','#5698d2'];
  const CAP=['#9cc4ff','#4a78e8','#2c48b0','#1a2a74'];
  const LAB=['#ff9a7a','#f05a3a','#c0342a','#86201e','#561418'];
  const YEL=['#fff2a8','#ffd24a','#d49c22','#8a6010'];
  const BREAD=['#ffe6a8','#f4b65c','#d48a3a','#a25c26','#6a3418'];
  const WH=['#ffffff','#eef2f8','#d2dae8','#a2aec6','#6e7a9a','#464e70'];
  const RED=['#ffa0a0','#f03c4a','#b81c34','#741024'];
  const AMB=['#ffd890','#f0a040','#b8681e','#7a3e12'];
  const GAS=['#ffa088','#f4503c','#d0302e','#9a1c2a','#64102a','#3e0a1e'];
  const CRY=['#fff2f6','#ffb0c4','#ff5a78','#e8244a','#b0123a','#6e0a2e','#3e0420'];
  const ROCK=['#8e7ea0','#62527a','#423458','#2a1e3a'];
  const BP=['#d4ecff','#8ec8f4','#4e94e0','#2e66c0','#1e4290','#142a62'];
  const GOLD=['#fffbe0','#ffe680','#f6c838','#d89a20','#a06a14','#643e0c'];
  const HOLE='#1c1226';
  const BRONZE=['#fff0d0','#f6c488','#d8924a','#a8622a','#743e18','#44220c'];
  const OLIVE=['#f0f4c0','#c4d070','#8ea040','#62762a','#3e4e1a','#24300e'];
  const SILV=['#ffffff','#e2e8f4','#b0bad0','#7c86a4','#525a7a','#30364e'];
  const MEDG=['#d8ffd0','#8ae07a','#4cb04e','#2e8040','#1c5432','#103424'];
  const RUB=['#8a8494','#615c6a','#45414e','#2e2b36','#1c1a22'];
  const GLASS=['#ffffff','#e4f6ff','#b4dcf0','#80b4d4','#5a88b0'];
  const ADR=['#ffe0b0','#ff9a3a','#e8501e','#b02c14','#6e1a0e'];

  // ---- kit explícito: cor própria por pixel, faixas duras, curvas suaves
  function kit(c,u){
    const col=h=>{ c.fillStyle=h; c.strokeStyle=h; u.add(h); };
    const path=pts=>{ c.beginPath(); pts.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])); c.closePath(); };
    const poly=(pts,h)=>{ col(h); path(pts); c.fill(); };
    const rect=(x,y,w,h,k)=>{ col(k); c.fillRect(x,y,w,h); };
    const ell=(x,y,rx,ry,k,rot)=>{ col(k); c.beginPath(); c.ellipse(x,y,Math.max(0.1,rx),Math.max(0.1,ry),rot||0,0,7); c.fill(); };
    const arc=(x,y,rx,ry,a0,a1,w,k)=>{ col(k); c.lineWidth=w; c.beginPath(); c.ellipse(x,y,rx,ry,0,a0,a1); c.stroke(); };
    const ln=(x0,y0,x1,y1,w,k)=>{ const dx=x1-x0, dy=y1-y0, L=Math.hypot(dx,dy)||1, nx=-dy/L*w/2, ny=dx/L*w/2; poly([[x0+nx,y0+ny],[x1+nx,y1+ny],[x1-nx,y1-ny],[x0-nx,y0-ny]],k); };
    // shape: array de pontos ou função que monta o path
    const clip=s=>{ if(typeof s==='function') s(); else path(s); c.clip(); };
    const band=(s,cols,fr,axis,a0,a1)=>{ c.save(); clip(s); const tot=fr.reduce((a,b)=>a+b,0); let acc=0;
      cols.forEach((k,i)=>{ const s0=i===0?-999:a0+(a1-a0)*acc/tot, s1=i===cols.length-1?999:a0+(a1-a0)*(acc+fr[i])/tot; col(k); if(axis==='y') c.fillRect(-999,s0,1999,s1-s0); else c.fillRect(s0,-999,s1-s0,1999); acc+=fr[i]; }); c.restore(); };
    const within=(s,fn)=>{ c.save(); clip(s); fn(); c.restore(); };
    const E=(x,y,rx,ry,rot)=>()=>{ c.beginPath(); c.ellipse(x,y,rx,ry,rot||0,0,7); };
    const smooth=(pts,n)=>{ n=n||5; const o=[], L=pts.length; for(let i=0;i<L;i++){ const p0=pts[(i-1+L)%L],p1=pts[i],p2=pts[(i+1)%L],p3=pts[(i+2)%L];
      for(let k=0;k<n;k++){ const t=k/n,t2=t*t,t3=t2*t; o.push([0,1].map(d=>0.5*((2*p1[d])+(-p0[d]+p2[d])*t+(2*p0[d]-5*p1[d]+4*p2[d]-p3[d])*t2+(-p0[d]+3*p1[d]-3*p2[d]+p3[d])*t3))); } } return o; };
    const cut=fn=>{ const o=c.globalCompositeOperation; c.globalCompositeOperation='destination-out'; c.fillStyle='#000'; fn(); c.globalCompositeOperation=o; };
    return {c,col,path,poly,rect,ell,arc,ln,band,within,E,smooth,cut};
  }
  const R=(x,y,w,h)=>[[x,y],[x+w,y],[x+w,y+h],[x,y+h]];

  // tora deitada (eixo x), tampa com anéis à esquerda
  function log(e,x0,x1,cy,r,seed){
    e.ell(x1,cy,r*0.5,r,BARK[4]);
    e.band(R(x0,cy-r,x1-x0,r*2),[BARK[0],BARK[1],BARK[2],BARK[3],BARK[4]],[1,2,3,3,2],'y',cy-r,cy+r);
    e.within(R(x0,cy-r,x1-x0+r,r*2),()=>{
      for(let i=0;i<9;i++){ const x=x0+2+hsh(i,seed)*(x1-x0-3), y=cy-r+1.2+hsh(i,seed+3)*(r*2-2.6), w=2+hsh(i,seed+5)*3.5;
        e.rect(x,y,w,1,y<cy-r*0.4?BARK[2]:BARK[4]); if(y<cy) e.rect(x+0.5,y-1,w-1,0.8,BARK[0]); }
      e.rect(x0,cy-r+0.6,x1-x0,0.9,'#ffe0b0');
    });
    e.ell(x0,cy,r*0.6+0.9,r+0.2,BARK[3]);
    e.band(e.E(x0,cy,r*0.6,r-0.6),[GRAIN[0],GRAIN[1],GRAIN[2]],[1,2,1],'x',x0-r*0.6,x0+r*0.6);
    e.arc(x0-0.2,cy,r*0.42,r*0.7,0,7,0.7,GRAIN[3]);
    e.arc(x0-0.3,cy,r*0.22,r*0.38,0,7,0.7,GRAIN[3]);
    e.ell(x0-0.3,cy,0.6,0.8,GRAIN[4]);
    e.ln(x0,cy,x0+r*0.3,cy+r*0.8,0.7,GRAIN[4]);
    e.rect(x0-r*0.35,cy-r*0.7,1.2,1,GRAIN[0]);
  }
  function rope(e,x,y0,y1){
    e.band(R(x,y0,2.4,y1-y0),[ROPE[0],ROPE[1],ROPE[2]],[1,1.4,1],'x',x,x+2.4);
    for(let y=y0+0.6;y<y1-0.5;y+=1.7) e.ln(x,y,x+2.4,y+1,0.6,ROPE[3]);
  }

  // chave de baú com medalhão (rampa G de 6 tons + emblema no centro do medalhão)
  function keyArt(e,G,emblem){
    const ang=0.74, cx=9.4, cy=8.4, ca=Math.cos(ang), sa=Math.sin(ang);
    const shape=(dark)=>{
      e.c.save(); e.c.translate(cx+(dark?0.8:0),cy+(dark?1.2:0)); e.c.rotate(ang);
      const fill=(s,a0,a1)=>{ if(dark) e.within(s,()=>e.rect(-30,-30,60,60,G[5])); else e.band(s,[G[1],G[2],G[3],G[4]],[1,1.4,1.4,1],'y',a0,a1); };
      fill(()=>{ e.c.beginPath(); e.c.ellipse(0,0,5.6,5.6,0,0,7); e.c.moveTo(-6.4+2.6,0); e.c.ellipse(-6.4,0,2.6,2.6,0,0,7); },-6,6);
      fill(R(4.6,-1.4,14.2,2.8),-1.4,1.4);
      fill(R(5.4,-2.6,2.6,5.2),-2.6,2.6);
      fill([[14,1.2],[19,1.2],[19,6.4],[17.6,6.4],[17.6,4.6],[16.4,4.6],[16.4,6.4],[14,6.4]],1.2,6.4);
      fill(e.E(18.8,0,1.4,1.4),-1.4,1.4);
      if(!dark){
        e.rect(4.6,-1.4,14.2,0.6,G[0]); e.rect(5.4,-2.6,2.6,0.6,G[0]); e.arc(0,0,4.7,4.7,3.5,4.9,0.9,G[0]); e.arc(-6.4,0,1.9,1.9,3.6,4.8,0.7,G[0]);
        e.rect(14,5.6,5,0.8,G[4]); e.rect(10,-0.4,3.4,0.6,G[3]);
      }
      e.c.restore();
    };
    shape(true); shape(false);
    // medalhão rebaixado + emblema
    e.ell(cx,cy,3.6,3.6,G[4]); e.ell(cx+0.3,cy+0.3,3.1,3.1,G[5]); e.arc(cx,cy,3.4,3.4,0.2,1.6,0.6,G[1]);
    emblem(cx,cy);
    // furo da argola + aro de chaveiro (aço)
    const hx=cx-6.4*ca, hy=cy-6.4*sa;
    e.cut(()=>{ e.c.beginPath(); e.c.ellipse(hx,hy,1.3,1.3,0,0,7); e.c.fill(); });
    e.arc(3.4,7.8,2.8,3.4,0.3,4.4,1.1,STEEL[2]); e.arc(3.4,7.8,2.8,3.4,2.4,3.8,0.7,STEEL[0]); e.arc(3.4,7.8,2.8,3.4,4.4,6.6,1.1,STEEL[3]);
  }
  const star5=(x,y,ro,ri,rot)=>{ const p=[]; for(let k=0;k<10;k++){ const a=rot-Math.PI/2+k*Math.PI/5, r=k%2?ri:ro; p.push([x+Math.cos(a)*r,y+Math.sin(a)*r]); } return p; };
  // florzinha de chita (pétalas claras, miolo amarelo, folhinhas)
  function chitaFlower(e,x,y,lo){ const pet=lo?'#e8c8a8':'#fff4e0', mid=lo?'#d89a20':'#ffd24a', lf=lo?'#2e7a3a':'#5ab84a';
    e.rect(x+1.4,y+1,1.4,0.9,lf); e.rect(x-2.4,y-1.2,1.2,0.9,lf);
    e.rect(x-1,y-0.4,2.4,1.2,pet); e.rect(x-0.4,y-1,1.2,2.4,pet); e.rect(x-0.2,y-0.2,0.9,0.9,mid); }

  const D={
    madeira(e){
      log(e,9,24,11,5,1);
      rope(e,14.6,6,16);
      log(e,5,21,18.8,5.6,7);
      rope(e,12,13.2,24.4);
      e.ell(15.8,6.6,1.8,1.2,ROPE[1]); e.rect(15,6,1.4,0.8,ROPE[0]); e.ln(16.6,7,19,9.4,0.9,ROPE[2]);
      // broto de folha (vida voltando)
      e.ln(21,6.6,22,4.4,0.8,'#3c7a2e'); e.ell(23,4,1.6,0.9,'#7ccc4a',-0.5); e.rect(22.4,3.4,1,0.6,'#c8f080');
    },
    sucata(e){
      const S=STEEL;
      // chapa ondulada amassada
      e.poly([[2,15],[8,7.6],[18,5.6],[26,10],[25.4,20],[16,24.6],[4.6,23]],S[3]);
      e.poly([[2,15],[8,7.6],[13.6,12.6],[7,18]],S[1]);
      e.poly([[8,7.6],[18,5.6],[13.6,12.6]],S[0]);
      e.poly([[18,5.6],[26,10],[20,14],[13.6,12.6]],S[1]);
      e.poly([[13.6,12.6],[20,14],[16,24.6],[10,21]],S[3]);
      e.poly([[7,18],[13.6,12.6],[10,21],[4.6,23],[2,15]],S[2]);
      e.poly([[20,14],[26,10],[25.4,20],[16,24.6]],S[4]);
      e.within([[2,15],[8,7.6],[18,5.6],[26,10],[25.4,20],[16,24.6],[4.6,23]],()=>{
        for(let k=0;k<6;k++){ const o=k*3.6; e.ln(1+o,22-o*0.25,6+o,6-o*0.2,0.8,S[4]); e.ln(2+o,22-o*0.25,7+o,6-o*0.2,0.6,S[0]); }
        // ferrugem nas bordas
        e.ell(4,20,3.4,2.6,RUST[2]); e.ell(3.6,19.4,2,1.4,RUST[1]); e.rect(3,18.6,1.4,0.8,RUST[0]);
        e.ell(22,8.6,3,1.8,RUST[2]); e.ell(21.6,8.2,1.8,1,RUST[1]);
        e.ell(12,22.6,2.6,1.4,RUST[3]);
      });
      e.ell(11,10.4,0.9,0.9,HOLE); e.ell(6,15.6,0.8,0.8,HOLE);
      e.ln(8,7.6,18,5.6,0.8,'#ffffff');
      // engrenagem enferrujada em pé
      const cx=18.4, cy=18.6, ro=5.6, ri=4.3, pts=[];
      for(let k=0;k<10;k++){ const a=k/10*6.2832+0.2, w=0.2; [[a-w*1.6,ri],[a-w,ro],[a+w,ro],[a+w*1.6,ri]].forEach(([q,r])=>pts.push([cx+Math.cos(q)*r,cy+Math.sin(q)*r])); }
      const sh=pts.map(([x,y])=>[x+1,y+1]);
      e.poly(sh,RUST[4]);
      e.band(pts,[RUST[0],RUST[1],RUST[2],RUST[3]],[1,2,3,2],'y',cy-ro,cy+ro);
      e.arc(cx,cy,3.1,3.1,0,7,0.8,RUST[3]);
      e.ell(cx,cy,2,2,STEEL[3]); e.ell(cx-0.4,cy-0.4,1.3,1.3,STEEL[1]); e.ell(cx,cy,0.8,0.8,HOLE);
      e.arc(cx,cy,4,4,3.5,4.6,0.9,RUST[0]);
      e.rect(cx+1.4,cy+1.8,1.6,1,RUST[4]); e.rect(cx-3,cy+0.6,1,1,RUST[4]);
      // parafuso solto
      e.ln(3.6,23.4,8.4,21.2,2,S[3]); e.ln(3.8,22.8,8.2,20.8,0.8,S[1]);
      e.ell(8.8,21.2,1.9,1.4,S[2]); e.ell(8.6,20.8,1.4,0.9,S[0]);
    },
    pano(e){
      const C=CHITA;
      e.ell(22,15.6,2.8,6.4,C[3]);
      const body=R(6,9.2,16,12.8);
      e.band(body,[C[0],C[1],C[1],C[2],C[3]],[1,2,3,3,2],'y',9.2,22);
      // aba solta caindo até o chão
      const flap=[[12,20.6],[22.6,19.6],[23.6,22.4],[22,24.6],[18,24],[14.4,24.6],[11.4,23.4]];
      e.band(flap,[C[1],C[2],C[3]],[1,2,2],'y',20,24.6);
      e.ln(15,21.4,14,24,0.7,C[4]); e.ln(19.4,21,19,23.8,0.7,C[4]);
      // estampa de chita (flores grandes + folhinhas), sombreada pela altura
      const flower=(x,y,lo)=>{ const pet=lo?'#e8c8a8':'#fff4e0', mid=lo?'#d89a20':'#ffd24a', lf=lo?'#2e7a3a':'#5ab84a';
        e.rect(x+1.4,y+1,1.4,0.9,lf); e.rect(x-2.4,y-1.2,1.2,0.9,lf);
        e.rect(x-1,y-0.4,2.4,1.2,pet); e.rect(x-0.4,y-1,1.2,2.4,pet); e.rect(x-0.2,y-0.2,0.9,0.9,mid); };
      e.within([...body.slice(0,4)],()=>{
        [[9,11],[15,12.4],[20,10.6],[11.6,16],[17.6,17.4],[8,20],[14,20.6],[21,15]].forEach(([x,y])=>flower(x,y,y>16.5));
        for(let i=0;i<14;i++){ const x=6.5+hsh(i,4)*15, y=9.6+hsh(i,8)*12; e.rect(x,y,0.8,0.8,y<15?'#ffd24a':'#b03050'); }
        e.rect(6,9.6,16,0.9,'#ffc8b8');
      });
      e.within(flap,()=>{ flower(17,22.4,true); e.rect(21,21.4,0.8,0.8,'#d89a20'); });
      // tampa em espiral
      e.ell(6,15.6,3.8,6.6,C[2]);
      e.ell(6,15.6,3.1,5.6,C[0]);
      e.arc(6.2,15.8,2.3,4.2,0,7,0.8,C[3]);
      e.arc(6.3,16,1.3,2.5,0,7,0.8,C[3]);
      e.ell(6.4,16.1,0.6,1,'#3a0818');
      e.rect(5.2,10.8,1.2,1,'#fff0e8');
      // amarras com laço
      [10.4,18.2].forEach(x=>{ e.band(R(x,9,1.4,13.4),['#fff4dc','#e8d4a8','#b09a70'],[1,2,1],'y',9,22.4); });
      e.ell(17.2,8.6,1.8,1.2,'#f4e4bc'); e.ell(20.4,8.4,1.8,1.2,'#e8d4a8'); e.rect(18.4,8,1.6,1.4,'#b09a70');
      e.ln(18.6,9.4,17,12,0.8,'#e8d4a8'); e.ln(19.6,9.4,21.4,11.6,0.8,'#b09a70');
    },
    agua(e){
      const W=WAT;
      const body=e.smooth([[6,24.4],[5.4,14],[6.6,9.6],[10,7.4],[18,7.4],[21.4,9.6],[22.6,14],[22,24.4]],5);
      e.band(body,[W[1],W[0],W[2],W[3],W[4],W[5],W[6]],[1,1.2,3,4,3.4,2,1],'x',5.4,22.6);
      // ar acima da linha d'água (mais translúcido)
      e.within(body,()=>{
        e.band(R(0,0,30,11.6),[AIR[1],AIR[0],AIR[2],AIR[3],AIR[4],AIR[5]],[1,1.2,3,4,4,2],'x',5.4,22.6);
        e.ell(14,11.8,9,1.5,'#a8e2fa'); e.rect(8,11.6,6,0.8,'#ffffff'); e.ell(14,12.6,9,0.7,W[3]);
        // nervuras do galão
        [15.6,20].forEach(y=>{ e.rect(0,y,30,0.9,W[5]); e.rect(0,y+0.9,30,0.8,W[1]); });
        e.rect(0,22.8,30,2,W[5]); e.rect(0,22.8,30,0.7,W[3]);
        // reflexos fortes
        e.rect(8.2,9.4,1.4,12.4,'#ffffff'); e.rect(9.8,10.4,0.7,8,W[0]);
        e.rect(19.6,13,1,3.4,'#dff6ff'); e.rect(19.6,17,1,1,'#dff6ff');
        // bolhas
        e.ell(13,18,0.9,0.9,W[1]); e.rect(12.6,17.6,0.6,0.6,'#ffffff'); e.ell(16,14.6,0.6,0.6,W[1]); e.ell(11.4,21.4,0.5,0.5,W[1]);
      });
      // ombro e gargalo
      e.ell(14,8,7.4,1.6,AIR[1]); e.ell(14,8.3,6,1,AIR[3]);
      e.band(R(10.6,4.2,6.8,4),[AIR[1],AIR[0],AIR[2],AIR[4]],[1,1,2,1],'x',10.6,17.4);
      // tampa azul
      e.band(R(10.2,1.8,7.6,3.2),[CAP[0],CAP[1],CAP[2],CAP[3]],[1,2,3,1],'x',10.2,17.8);
      e.ell(14,1.9,3.8,1,CAP[0]); e.rect(12,1.4,2,0.6,'#ffffff');
      for(let x=11;x<17.5;x+=1.4) e.rect(x,3.2,0.6,1.6,CAP[3]);
      e.rect(10.2,4.6,7.6,0.6,CAP[3]);
    },
    comida(e){
      const S=STEEL;
      // lata de conserva
      const cx=10.4, top=10.6, bot=23.6, rx=5.6, ry=1.8;
      e.ell(cx,bot,rx,ry,S[4]);
      e.band(R(cx-rx,top,rx*2,bot-top),[S[1],S[0],S[1],S[2],S[3],S[4]],[1,1,2,3,2,1],'x',cx-rx,cx+rx);
      const lab=()=>{ e.c.beginPath(); e.c.rect(cx-rx,top+2.2,rx*2,bot-top-4.2); };
      e.band(lab,[LAB[1],LAB[0],LAB[1],LAB[2],LAB[3],LAB[4]],[1,1,2,3,2,1],'x',cx-rx,cx+rx);
      e.band(()=>{ e.c.beginPath(); e.c.rect(cx-rx,top+3.6,rx*2,2.4); },[YEL[1],YEL[0],YEL[1],YEL[2],YEL[3]],[1,1,3,3,1],'x',cx-rx,cx+rx);
      e.ell(cx-0.8,top+8.8,2.6,1.8,'#fff4e0'); e.ell(cx-0.8,top+9,1.6,0.9,'#5aa8e0'); e.rect(cx-2.6,top+8.6,1,0.8,'#5aa8e0'); e.rect(cx,top+8.6,0.6,0.5,HOLE);
      [top+2.2,bot-2].forEach(y=>{ e.rect(cx-rx,y-0.5,rx*2,0.6,S[4]); e.rect(cx-rx,y,rx*2,0.5,S[0]); });
      e.rect(cx-rx+1.2,top+1,1.2,bot-top-2,'#ffffff');
      // topo
      e.ell(cx,top,rx,ry,S[2]); e.ell(cx,top-0.1,rx-0.7,ry-0.5,S[0]); e.ell(cx+0.3,top+0.1,rx-1.6,ry-0.9,S[1]);
      e.ell(cx+1.6,top,1.2,0.6,S[3]); e.rect(cx+0.6,top-0.4,1.6,0.5,S[0]);
      // pão francês
      e.c.save(); e.c.translate(18.4,20.6); e.c.rotate(-0.38);
      e.ell(0.8,1,6.8,3.6,BREAD[4]);
      e.band(e.E(0,0,6.8,3.6),[BREAD[0],BREAD[1],BREAD[2],BREAD[3],BREAD[4]],[1,2,3,2,1],'y',-3.6,3.6);
      [-3.4,0,3.4].forEach(x=>{ e.ln(x-1.4,0.4,x+1.6,-1.8,1.1,BREAD[0]); e.ln(x-1.2,1.1,x+1.8,-1.1,0.6,BREAD[3]); });
      e.rect(-4,-3,4,0.8,'#fff4d0');
      for(let i=0;i<6;i++) e.rect(-5+hsh(i,3)*10,-2+hsh(i,6)*4,0.6,0.6,'#fff0c0');
      e.c.restore();
    },
    remedio(e){
      const Wh=WH;
      const front=R(3.6,12,16.6,12.4), top=[[3.6,12],[7.8,8.4],[24.4,8.4],[20.2,12]], side=[[20.2,12],[24.4,8.4],[24.4,20.8],[20.2,24.4]];
      e.band(side,[Wh[3],Wh[4],Wh[5]],[2,2,1],'y',8.4,24.4);
      e.band(top,[Wh[0],Wh[1]],[2,1],'y',8.4,12);
      e.band(front,[Wh[1],Wh[2],Wh[3],Wh[4]],[2,4,3,1],'y',12,24.4);
      // tampa: friso e faixa vermelha
      e.rect(3.6,15.2,16.6,0.8,Wh[4]); e.rect(3.6,16,16.6,0.7,Wh[0]);
      e.poly([[20.2,15.2],[24.4,11.6],[24.4,12.4],[20.2,16]],Wh[5]);
      e.rect(3.6,12,16.6,0.8,'#ffffff'); e.ln(3.6,12,7.8,8.4,0.8,'#ffffff');
      e.rect(3.6,22.6,16.6,1.8,RED[2]); e.rect(3.6,22.6,16.6,0.6,RED[1]); e.poly([[20.2,22.6],[24.4,19],[24.4,20.8],[20.2,24.4]],RED[3]);
      // cruz vermelha biselada
      const cr=(ox,oy,k)=>{ e.rect(10.4+ox,16.2+oy,3.2,7.2,k); e.rect(8.4+ox,18.2+oy,7.2,3.2,k); };
      cr(0.8,0.8,RED[3]); cr(0,0,RED[1]); e.rect(10.4,16.2,3.2,0.8,RED[0]); e.rect(8.4,18.2,2,0.8,RED[0]); e.rect(10.4,16.2,0.8,2,RED[0]); e.rect(8.4,18.2,0.8,3.2,RED[0]);
      e.rect(12.8,20.6,0.8,2.8,RED[2]); e.rect(13.6,20.6,2,0.8,RED[2]);
      // fechos
      [5,16.6].forEach(x=>{ e.rect(x,14.2,2.4,2.8,Wh[4]); e.rect(x,14.2,2.4,0.8,STEEL[0]); e.rect(x+0.8,15.4,0.8,0.8,HOLE); });
      // alça
      e.band([[10.4,10.6],[10.4,7.2],[18,7.2],[18,10.6],[16.6,10.6],[16.6,8.6],[11.8,8.6],[11.8,10.6]],['#a0a6c0','#62668a','#3a3e5e'],[1,2,1],'y',7.2,10.6);
      e.rect(10.4,7.2,7.6,0.6,'#e4e8f4');
      // sujeira
      for(let i=0;i<7;i++) e.rect(4+hsh(i,2)*15,17+hsh(i,5)*5,0.8,0.8,Wh[3]);
      // frasco âmbar com tampa branca
      const fx=22.2;
      e.band(R(fx-2.4,18.6,4.8,6),[AMB[0],AMB[1],AMB[2],AMB[3]],[1,2,2,1],'x',fx-2.4,fx+2.4);
      e.ell(fx,24.6,2.4,0.8,AMB[3]);
      e.rect(fx-2.4,20.4,4.8,2.4,'#f4f0e4'); e.rect(fx-2.4,22.2,4.8,0.6,'#b8b0a0'); e.rect(fx-1,20.8,2,0.8,RED[1]);
      e.band(R(fx-2,16.4,4,2.4),[Wh[0],Wh[1],Wh[3]],[1,2,1],'x',fx-2,fx+2); e.ell(fx,16.4,2,0.7,'#ffffff');
      e.rect(fx-1.8,18.8,0.8,4,'#fff4d8');
    },
    pecas(e){
      const S=STEEL;
      // parafuso deitado (atrás)
      e.c.save(); e.c.translate(5.4,10.2); e.c.rotate(0.28);
      e.band(R(2.6,-1.6,12,3.2),[S[0],S[1],S[2],S[3],S[4]],[1,1,2,2,1],'y',-1.6,1.6);
      for(let x=3.6;x<14.4;x+=1.4){ e.rect(x,-1.6,0.6,3.2,S[4]); e.rect(x+0.6,-1.6,0.4,1.2,S[0]); }
      e.ell(14.6,0,0.8,1.6,S[3]);
      e.band(R(-1.2,-3.2,3.8,6.4),[S[0],S[1],S[2],S[3],S[4]],[1,2,2,2,1],'y',-3.2,3.2);
      e.rect(-1.2,-1.2,3.8,0.6,S[4]); e.rect(-1.2,1.2,3.8,0.6,S[4]); e.rect(-1.2,-3.2,3.8,0.6,'#ffffff');
      e.c.restore();
      // mola em pé
      const mx=19.4, coils=6, y0=23.4, dy=2.5, rx=3.8, ry=1.3;
      for(let i=0;i<coils;i++) e.arc(mx,y0-i*dy,rx,ry,3.1416,6.2832,1.3,S[4]);
      e.rect(mx-rx-0.6,y0-(coils-1)*dy,1.3,1,S[4]);
      for(let i=0;i<coils;i++){ const y=y0-i*dy; e.arc(mx,y,rx,ry,0,3.1416,1.4,S[2]); e.arc(mx,y,rx,ry,1.2,2.8,1.4,S[1]); e.arc(mx,y,rx,ry,1.9,2.6,1,S[0]); }
      e.rect(mx-2.6,y0-(coils-1)*dy-0.2,1.2,0.8,'#ffffff');
      // porca sextavada deitada (frente)
      const cx=8.6, cy=18.6, r=5.4, ry2=r*0.56, t=2.8;
      const V=[[cx-r,cy],[cx-r/2,cy-ry2],[cx+r/2,cy-ry2],[cx+r,cy],[cx+r/2,cy+ry2],[cx-r/2,cy+ry2]];
      e.poly([V[0],V[5],[V[5][0],V[5][1]+t],[V[0][0],V[0][1]+t]],S[2]);
      e.poly([V[5],V[4],[V[4][0],V[4][1]+t],[V[5][0],V[5][1]+t]],S[3]);
      e.poly([V[4],V[3],[V[3][0],V[3][1]+t],[V[4][0],V[4][1]+t]],S[4]);
      e.rect(V[5][0],V[5][1]+t-0.6,r,0.6,S[5]);
      e.band(V,[S[0],S[1],S[1],S[2]],[1,2,2,1],'y',cy-ry2,cy+ry2);
      e.ln(V[0][0],V[0][1],V[1][0],V[1][1],0.7,'#ffffff');
      e.ell(cx,cy,r*0.42,ry2*0.46,S[5]); e.ell(cx,cy+0.5,r*0.36,ry2*0.3,S[3]); e.ell(cx,cy+0.7,r*0.24,ry2*0.18,HOLE);
      e.rect(V[5][0]+0.4,V[5][1]+0.6,0.8,t-1,'#ffffff');
    },
    gasolina(e){
      const G=GAS;
      const fr=e.smooth([[5,8.6],[19,8.6],[19.4,23.6],[18,24.6],[6,24.6],[4.6,23.6]],3);
      e.band([[19,9],[23.4,5.6],[23.4,21],[19.2,24.6]],[G[3],G[4],G[5]],[2,2,1],'y',6,24.6);
      e.band([[5,8.8],[9.2,5.4],[23.4,5.4],[19,8.8]],[G[0],G[1]],[1,2],'y',5.4,8.8);
      e.band(fr,[G[1],G[0],G[1],G[2],G[2],G[3],G[4]],[1,1,2,4,3,2,1],'x',4.6,19.4);
      // X estampado (nervuras) dentro do painel
      e.within(fr,()=>{
        e.rect(6.4,10.4,11.2,0.8,G[3]); e.rect(6.4,21.8,11.2,0.8,G[0]); e.rect(6.4,10.4,0.8,12.2,G[3]); e.rect(16.8,10.4,0.8,12.2,G[0]);
        e.ln(7.6,11.6,16.4,21.4,1.4,G[3]); e.ln(16.4,11.6,7.6,21.4,1.4,G[3]);
        e.ln(7.4,11,16.2,20.8,0.8,G[0]); e.ln(16,11,7.2,20.8,0.8,G[0]);
        e.rect(5.4,9.4,1,13,'#ffd0c0');
        for(let i=0;i<8;i++) e.rect(6+hsh(i,7)*12,12+hsh(i,9)*11,0.8,0.8,i%2?G[4]:G[0]);
      });
      // adesivo de inflamável
      e.poly([[8,17.4],[10,15.4],[12,17.4],[10,19.4]],YEL[1]); e.rect(9.6,16.4,0.8,1.8,HOLE); e.rect(9.6,18.4,0.8,0.5,HOLE);
      // alça tripla
      e.band(R(8.6,2,9.6,4.2),[G[0],G[1],G[2],G[3]],[1,1,2,1],'y',2,6.2);
      e.cut(()=>{ e.c.fillRect(9.8,3.4,2.8,1.8); e.c.fillRect(14,3.4,2.8,1.8); });
      e.rect(8.6,2,9.6,0.7,'#ffd8c8');
      // bico flexível
      e.c.save(); e.c.translate(20.2,6.4); e.c.rotate(-0.85);
      e.band(R(-1.8,-1.6,3.6,2.4),[G[2],G[3],G[4]],[1,1,1],'x',-1.8,1.8);
      e.band(R(-1.2,-6.8,2.4,5.4),[YEL[0],YEL[1],YEL[2],YEL[3]],[1,1,1,1],'x',-1.2,1.2);
      for(let y=-6.2;y<-1.6;y+=1.3) e.rect(-1.2,y,2.4,0.5,YEL[3]);
      e.band(R(-0.8,-8.6,1.6,2),[STEEL[0],STEEL[2],STEEL[3]],[1,1,1],'x',-0.8,0.8);
      e.c.restore();
      e.ell(7.4,6.6,1.8,0.9,G[3]); e.ell(7.4,6.2,1.4,0.6,STEEL[1]);
    },
    fragmento_lunar(e,fi){
      const C=CRY;
      // rocha base
      e.band([[5,24.6],[4.4,21.6],[7,19.6],[12,19],[18,19.4],[23,20.6],[23.6,24],[20,24.8],[9,24.8]],[ROCK[0],ROCK[1],ROCK[2],ROCK[3]],[1,2,2,1],'y',19,24.8);
      e.rect(7,20.4,3,0.8,ROCK[0]); e.rect(18,21,2.4,0.8,'#a898bc');
      const shard=(pts,lit,mid,dark,fb)=>{ // pts: base-esq, ombro-esq, ponta, ombro-dir, base-dir; fb: quina frontal
        const [b0,s0,t,s1,b1]=pts, f=[fb,(b0[1]+b1[1])/2];
        e.band([b0,s0,t,[f[0],t[1]+2.4],f],lit,[1,2,2],'y',t[1],b0[1]);
        e.band([[f[0],t[1]+2.4],t,s1,b1,f],dark,[1,2,2],'y',t[1],b1[1]);
        e.ln(t[0],t[1],f[0],t[1]+2.4,0.8,mid);
        e.ln(f[0],t[1]+2.4,f[0],f[1],0.8,mid);
      };
      shard([[4.6,22.6],[4,16.4],[6.6,11.6],[9.4,15.4],[9.4,22.6]],[C[1],C[2],C[3]],C[0],[C[4],C[5],C[6]],7);
      shard([[17.8,22.6],[18.4,14.6],[23.6,10.4],[24,16.6],[22,22.8]],[C[2],C[3],C[4]],C[1],[C[4],C[5],C[6]],20.8);
      // cristal principal
      const P=[[10.6,22.4],[9.8,10.4],[14,2.2],[18.4,10.4],[17.6,22.4]];
      e.band([P[0],P[1],P[2],[13.2,6],[12.8,22.4]],[C[1],C[2],C[3]],[1,2,2],'y',2.2,22.4);
      e.band([[12.8,22.4],[13.2,6],P[2],[15.2,6],[15.4,22.4]],[C[0],C[1],C[2],C[3]],[1,2,3,2],'y',2.2,22.4);
      e.band([[15.4,22.4],[15.2,6],P[2],P[3],P[4]],[C[4],C[5],C[6]],[1,2,1],'y',2.2,22.4);
      // núcleo pulsante (luz interna)
      const pul=[0,1,2,2,1,0][fi%6];
      e.rect(13.6,7,1.2,12,pul?'#ffffff':C[0]); if(pul>1) e.rect(13.2,10,2,4,'#ffffff');
      e.ell(14.2,15,1.4,3.4,pul?C[1]:C[2]);
      e.ln(13.2,6,10.2,11,0.6,C[0]); e.ln(15.2,6,18,10.6,0.6,C[3]);
      e.rect(11,9,0.8,4,C[0]);
      // lascas na base
      e.poly([[8.6,24.4],[9.6,21.8],[11,24.4]],C[2]); e.poly([[17,24.4],[18,22.2],[19,24.4]],C[3]);
    },
    projeto(e){
      const B=BP;
      // folha meio desenrolada no chão
      const sheet=[[11,20.6],[24.4,16.8],[25.6,21.6],[13.2,25]];
      e.band(sheet,[B[2],B[3],B[4]],[1,2,1],'y',16.8,25);
      e.within(sheet,()=>{
        for(let k=0;k<6;k++) e.ln(12+k*2.4,25-k*0.6,11+k*2.4,19-k*0.6,0.5,B[1]);
        e.ln(14,22.6,23,20,0.6,B[1]);
        e.poly([[16,22.8],[18.4,20.6],[21.4,21.6],[21.2,22.4],[18.4,21.6],[16.8,23]],'#e8f6ff');
        e.arc(21.8,19.6,1.2,0.8,0,7,0.5,'#e8f6ff');
      });
      e.ln(24.4,16.8,25.6,21.6,0.7,B[5]);
      e.ln(11,20.6,24.4,16.8,0.7,B[0]);
      // rolo inclinado
      e.c.save(); e.c.translate(13.6,13.2); e.c.rotate(-0.32);
      e.ell(8.6,0,2.2,4.8,B[4]);
      e.band(R(-9,-4.8,17.6,9.6),[B[1],B[0],B[1],B[2],B[3],B[4],B[5]],[1,1,2,3,3,2,1],'y',-4.8,4.8);
      e.within(R(-9,-4.8,17.6,9.6),()=>{
        for(let x=-7;x<8;x+=2.6) e.rect(x,-4.8,0.5,9.6,'#7ab8f0');
        e.rect(-9,-1,17.6,0.5,'#7ab8f0');
        e.ln(-6,1.6,-2,-2,0.6,'#e8f6ff'); e.rect(3,1,4,0.6,'#e8f6ff'); e.rect(3,-2.6,0.6,3.6,'#e8f6ff');
        e.rect(-9,-4.2,17.6,0.7,'#f0faff');
      });
      // ponta em espiral (verso do papel claro)
      e.ell(-9,0,2.6,4.8,'#b0d4f4');
      e.ell(-9,0,2.1,4.1,'#eef8ff');
      e.arc(-8.8,0.2,1.4,2.8,0,7,0.6,B[2]);
      e.arc(-8.7,0.4,0.7,1.4,0,7,0.6,B[3]);
      e.ell(-8.6,0.4,0.4,0.6,B[5]);
      // fita vermelha + lacre de cera
      e.band(R(-1.2,-4.9,2.6,9.8),[RED[0],RED[1],RED[2],RED[3]],[1,2,2,1],'y',-4.9,4.9);
      e.c.restore();
      e.ln(13.4,17.4,12.2,20.8,1,RED[2]); e.ln(15.2,17.2,16.4,20.6,1,RED[3]);
      e.ell(14.6,17.4,2.5,2.3,'#7a1020'); e.ell(14.3,17,2.2,2,'#c82838'); e.ell(14.3,17,1.2,1.1,'#9a1828'); e.rect(13.2,15.8,1,0.8,'#ff8a90');
    },
    chave(e){
      const G=GOLD, ang=0.74;
      const shape=(dark)=>{
        e.c.save(); e.c.translate(7.6+(dark?0.8:0),8.6+(dark?1.2:0)); e.c.rotate(ang);
        const fill=(s,a0,a1)=>{ if(dark) e.within(s,()=>e.rect(-30,-30,60,60,G[5])); else e.band(s,[G[1],G[2],G[3],G[4]],[1,1.4,1.4,1],'y',a0,a1); };
        // argola ornamentada (trevo)
        fill(()=>{ e.c.beginPath(); e.c.ellipse(0,0,4.6,4.6,0,0,7); [[-3.4,-3.4],[-3.4,3.4],[-4.8,0]].forEach(([x,y])=>{ e.c.moveTo(x+2.2,y); e.c.ellipse(x,y,2.2,2.2,0,0,7); }); },-6,6);
        // haste + colar + palheta
        fill(R(3.6,-1.4,15,2.8),-1.4,1.4);
        fill(R(4.4,-2.6,2.6,5.2),-2.6,2.6);
        fill([[14,1.2],[19,1.2],[19,6.4],[17.6,6.4],[17.6,4.6],[16.4,4.6],[16.4,6.4],[14,6.4]],1.2,6.4);
        fill(e.E(18.6,0,1.4,1.4),-1.4,1.4);
        if(!dark){
          e.rect(3.6,-1.4,15,0.6,G[0]); e.rect(4.4,-2.6,2.6,0.6,G[0]); e.arc(0,0,3.6,3.6,3.4,4.9,0.9,G[0]);
          e.rect(5.4,-0.8,0.8,1.6,'#e8244a'); e.rect(5.4,-0.8,0.8,0.6,'#ffb0c4');
          e.rect(14,5.6,5,0.8,G[4]);
        }
        e.c.restore();
      };
      shape(true); shape(false);
      e.cut(()=>{ e.c.beginPath(); e.c.ellipse(7.6,8.6,2.2,2.2,0,0,7); e.c.fill(); });
      // aro de chaveiro (aço) passando pela argola
      e.arc(4.2,12.6,3.2,3.8,0.2,4.6,1.2,STEEL[2]); e.arc(4.2,12.6,3.2,3.8,2.4,4,0.8,STEEL[0]); e.arc(4.2,12.6,3.2,3.8,4.6,6.5,1.2,STEEL[3]);
    },
    chave_comum(e){
      // bronze com espiral gravada
      keyArt(e,BRONZE,(x,y)=>{ e.arc(x,y,2,2,0,5.4,0.8,BRONZE[2]); e.arc(x,y,0.9,0.9,0,5,0.7,BRONZE[1]); e.rect(x-1.4,y-1.8,1,0.6,BRONZE[0]); });
    },
    chave_medico(e){
      // prata com cruz vermelha biselada
      keyArt(e,SILV,(x,y)=>{ const cr=(o,k)=>{ e.rect(x-0.9+o,y-2.4+o,1.8,4.8,k); e.rect(x-2.4+o,y-0.9+o,4.8,1.8,k); };
        cr(0.5,RED[3]); cr(0,RED[1]); e.rect(x-0.9,y-2.4,1.8,0.6,RED[0]); e.rect(x-2.4,y-0.9,1.6,0.6,RED[0]); e.rect(x+0.2,y+0.4,0.7,2,RED[2]); });
    },
    chave_militar(e){
      // verde-oliva com estrela amarela
      keyArt(e,OLIVE,(x,y)=>{ e.poly(star5(x+0.4,y+0.5,2.9,1.2,0),OLIVE[5]); e.band(star5(x,y,2.9,1.2,0),[YEL[0],YEL[1],YEL[2]],[1,1.2,1],'y',y-2.9,y+2.4); e.rect(x-0.4,y-1.6,0.6,0.8,'#ffffff'); });
    },
    chave_raro(e){
      // ouro com lua de sangue crescente
      keyArt(e,GOLD,(x,y)=>{ e.within(e.E(x,y,2.8,2.8),()=>{ e.band(e.E(x,y,2.8,2.8),[CRY[1],CRY[2],CRY[3],CRY[4]],[1,1.4,1.4,1],'x',x-2.8,x+2.8); e.ell(x+1.3,y-0.9,2.3,2.3,GOLD[5]); });
        e.rect(x-2,y-0.6,0.6,1.2,CRY[0]); e.rect(x+1.8,y+1.6,0.6,0.6,'#fff2a8'); });
    },
    kit_cura(e){
      const Gn=MEDG;
      // alça de lona
      e.arc(13,10.6,5,3.6,3.3,6.1,1.8,Gn[4]); e.arc(13,10.4,5,3.6,3.6,4.8,0.7,Gn[1]);
      // bolsa
      const body=e.smooth([[3.6,12.2],[22.4,12.2],[23,23.6],[21.2,25],[5.2,25],[3,23.6]],3);
      e.band(body,[Gn[1],Gn[2],Gn[2],Gn[3],Gn[4],Gn[5]],[1,2,3,3,2,1],'y',12.2,25);
      e.within(body,()=>{ for(let x=4.6;x<22;x+=1.8) e.rect(x,23.2,1,0.5,Gn[4]); e.rect(3,20.4,21,0.7,Gn[4]); e.rect(3,21.1,21,0.5,Gn[2]); });
      // aba com patch branco e cruz
      const flap=[[3.2,11.2],[22.8,11.2],[22.8,16.6],[16,19.2],[10,19.2],[3.2,16.6]];
      e.band(flap,[Gn[0],Gn[1],Gn[2],Gn[3]],[1,2,3,1],'y',11.2,19.2);
      e.ln(3.2,16.6,10,19.2,0.7,Gn[5]); e.ln(16,19.2,22.8,16.6,0.7,Gn[5]); e.rect(10,18.6,6,0.7,Gn[5]);
      e.rect(3.6,11.2,18.8,0.7,'#f0fff0');
      e.band(R(9.4,12,7.2,5.4),[WH[0],WH[1],WH[2],WH[3]],[1,2,2,1],'y',12,17.4);
      e.rect(9.4,17,7.2,0.5,WH[4]);
      const cr=(o,k)=>{ e.rect(12.2+o,12.6+o,1.6,4.2,k); e.rect(10.9+o,13.9+o,4.2,1.6,k); };
      cr(0.5,RED[3]); cr(0,RED[1]); e.rect(12.2,12.6,1.6,0.6,RED[0]); e.rect(10.9,13.9,1.4,0.6,RED[0]);
      // botão de pressão
      e.ell(13,18.4,1.3,0.9,STEEL[3]); e.ell(12.8,18.2,0.8,0.5,STEEL[0]);
      // rolo de atadura em pé
      e.ell(22.4,24.5,3,1,WH[5]);
      e.band(R(19.4,18.8,6,5.8),[WH[0],WH[1],WH[2],WH[3],WH[4]],[1,1,2,2,1],'x',19.4,25.4);
      e.within(R(19.4,18.8,6,5.8),()=>{ for(let y=20.2;y<24.6;y+=1.5) e.rect(19.4,y,6,0.5,WH[3]); });
      e.ell(22.4,18.8,3,1.1,WH[1]); e.arc(22.4,18.8,1.8,0.6,0,7,0.5,WH[3]); e.ell(22.4,18.8,0.7,0.3,WH[4]);
      e.poly([[25.2,20.6],[26.8,22.4],[26.4,24.8],[25.2,23.8]],WH[2]); e.rect(25.2,20.6,0.6,3,WH[0]);
    },
    presente(e){
      const C=CHITA;
      // caixa embrulhada em chita (3/4)
      const front=R(3.4,13.4,15.2,11.2), side=[[18.6,13.4],[24.4,9.8],[24.4,21.2],[18.6,24.6]], top=[[3.4,13.4],[9.2,9.8],[24.4,9.8],[18.6,13.4]];
      e.band(side,[C[2],C[3],C[4]],[2,2,1],'y',9.8,24.6);
      e.band(top,[C[0],C[1]],[1,2],'y',9.8,13.4);
      e.band(front,[C[1],C[1],C[2],C[3]],[1,3,3,1],'y',13.4,24.6);
      e.within(front,()=>{ [[6,16.2],[15.8,16.8],[6.6,22.4],[15,22.6]].forEach(([x,y])=>chitaFlower(e,x,y,y>20));
        for(let i=0;i<8;i++){ const x=4+hsh(i,11)*14, y=14+hsh(i,13)*10; e.rect(x,y,0.8,0.8,y<19?'#ffd24a':'#b03050'); } });
      e.within(side,()=>{ chitaFlower(e,21.6,15.6,true); chitaFlower(e,21,21.4,true); });
      e.within(top,()=>{ chitaFlower(e,8.6,11.8,false); chitaFlower(e,20.4,11,false); });
      // fita amarela
      e.band(R(9.8,13.4,2.6,11.2),[YEL[0],YEL[1],YEL[2]],[1,2,1],'x',9.8,12.4);
      e.poly([[18.6,17.6],[24.4,14],[24.4,16.2],[18.6,19.8]],YEL[2]);
      e.poly([[9.8,13.4],[15.6,9.8],[18.2,9.8],[12.4,13.4]],YEL[1]);
      e.poly([[6.3,11],[21.5,11],[21.5,12.2],[6.3,12.2]],YEL[0]);
      e.ln(3.4,13.4,9.2,9.8,0.7,'#ffd0c8'); e.rect(3.4,13.4,15.2,0.6,'#ffc0b0');
      // cigarro de palha enfiado no laço
      e.ln(15.6,10.4,22.6,6.2,1.4,'#c8a860'); e.ln(15.6,10,22.6,5.8,0.6,'#fff0c0'); e.ln(19,8.6,19.6,9.4,0.5,'#8a6a30');
      e.ell(22.9,6,0.9,0.9,'#ff6a3a'); e.rect(22.8,5.6,0.5,0.5,'#fff2a8');
      // laço
      e.ell(10.8,8.8,3.2,2,YEL[2],-0.5); e.ell(10.8,8.5,2.5,1.4,YEL[1],-0.5); e.ell(11.2,8.8,1,0.6,YEL[3],-0.5);
      e.ell(16.4,8.8,3.2,2,YEL[2],0.5); e.ell(16.4,8.5,2.5,1.4,YEL[0],0.5); e.ell(16,8.8,1,0.6,YEL[3],0.5);
      e.poly([[13,10.6],[10.8,14.6],[12.2,15],[14,11]],YEL[2]); e.poly([[14.2,10.6],[17.2,14.2],[15.8,14.8],[13.4,11]],YEL[1]);
      e.ell(13.6,10.2,1.7,1.4,YEL[2]); e.ell(13.4,9.9,1,0.8,YEL[0]);
    },
    adrenalina(e){
      const S=STEEL;
      // ampola atrás
      e.band(R(18.8,16.4,4.6,8),[GLASS[0],GLASS[1],GLASS[2],GLASS[3]],[1,1,2,1],'x',18.8,23.4);
      e.ell(21.1,24.4,2.3,0.8,GLASS[4]);
      e.band(R(18.8,20,4.6,4.4),[ADR[0],ADR[1],ADR[2],ADR[3]],[1,1,2,1],'x',18.8,23.4);
      e.rect(18.8,18,4.6,1.4,'#fff4e0'); e.rect(18.8,18.4,4.6,0.5,RED[1]);
      e.band(R(19.6,14,3,2.6),[S[0],S[1],S[3]],[1,1,1],'x',19.6,22.6); e.ell(21.1,14,1.5,0.6,S[0]);
      e.rect(19.4,17,0.8,6.6,'#ffffff');
      // seringa diagonal
      e.c.save(); e.c.translate(13.4,14.6); e.c.rotate(-0.78);
      e.band(R(-12.6,-3.4,1.6,6.8),[S[0],S[1],S[2],S[3]],[1,1,1,1],'y',-3.4,3.4);
      e.band(R(-11,-0.9,5.2,1.8),[S[1],S[2],S[3]],[1,1,1],'y',-0.9,0.9);
      e.band(R(-6.2,-4.6,1.4,9.2),[S[0],S[2],S[3]],[1,2,1],'y',-4.6,4.6);
      e.band(R(-4.8,-2.9,12.8,5.8),[GLASS[0],GLASS[1],GLASS[2],GLASS[3]],[1,1,2,1],'y',-2.9,2.9);
      e.band(R(-0.4,-2.3,8.4,4.6),[ADR[0],ADR[1],ADR[2],ADR[3],ADR[4]],[1,1.4,1.6,1.2,0.6],'y',-2.3,2.3);
      e.rect(-1.8,-2.5,1.4,5,RUB[2]); e.rect(-1.8,-2.5,1.4,0.8,RUB[0]);
      for(let k=0;k<5;k++) e.rect(0.4+k*1.6,-2.9,0.5,k%2?1:1.7,'#ffffff');
      e.rect(-4.4,1.6,12,0.6,GLASS[4]);
      e.rect(-4.4,-2.2,3.6,0.6,'#ffffff');
      e.band(R(8,-1.9,2,3.8),[ADR[1],ADR[2],ADR[3]],[1,1,1],'y',-1.9,1.9);
      e.band(R(10,-0.55,4.8,1.1),[S[0],S[2]],[1,1],'y',-0.55,0.55);
      e.c.restore();
      // gota na ponta
      e.ell(24.4,3.6,0.8,1.1,ADR[1]); e.rect(24.2,3,0.5,0.5,'#ffffff');
    },
    colete(e){
      const vest=[[6.6,3.4],[10.6,3.4],[14,12.2],[17.4,3.4],[21.4,3.4],[22,8.6],[24.6,11],[24.2,24.8],[3.8,24.8],[3.4,11],[6,8.6]];
      e.band(vest,[OLIVE[1],OLIVE[2],OLIVE[2],OLIVE[3],OLIVE[4],OLIVE[5]],[1,2,3,3,2,1],'y',3.4,24.8);
      e.within(vest,()=>{
        // banda de pneu com sulcos na barra
        e.rect(0,19.2,28,5.6,RUB[3]); e.rect(0,19.2,28,0.6,RUB[0]);
        for(let x=2;x<26;x+=2.8){ e.poly([[x,20.4],[x+1.4,21.8],[x,23.2],[x-0.8,23.2],[x+0.6,21.8],[x-0.8,20.4]],RUB[4]); e.rect(x+0.6,20.4,0.6,0.5,RUB[1]); }
        // ombreiras de pneu com sulcos
        e.band(R(5,3,6.4,4.6),[RUB[0],RUB[1],RUB[2],RUB[3]],[1,2,2,1],'y',3,7.6); e.band(R(16.6,3,6.4,4.6),[RUB[0],RUB[1],RUB[2],RUB[3]],[1,2,2,1],'y',3,7.6);
        for(let x=5.6;x<23;x+=1.8){ if(x>11.2&&x<16.4) continue; e.rect(x,4.2,0.8,2.6,RUB[4]); }
        e.rect(5,7.6,18,0.5,OLIVE[5]);
        // placa de aço (esq.) e de chapa enferrujada (dir.)
        const pl=[[4.6,10.8],[12,10.6],[12.6,17.8],[5,18.2]], pr=[[16,10.6],[23.4,10.8],[23,18.2],[15.4,17.8]];
        e.band(pl,[STEEL[0],STEEL[1],STEEL[2],STEEL[3]],[1,2,2,1],'y',10.6,18.2);
        e.band(pr,[RUST[0],RUST[1],RUST[2],RUST[3]],[1,2,2,1],'y',10.6,18.2);
        e.ln(4.6,10.8,12,10.6,0.6,'#ffffff'); e.ln(16,10.6,23.4,10.8,0.6,'#ffd0a0');
        e.ln(6.4,14,10,12.6,0.5,STEEL[3]); e.ln(7,16.4,9.4,15.4,0.5,STEEL[3]); e.ell(20.6,15.4,1.6,1,RUST[4]); e.ell(18,12.6,1,0.6,RUST[1]);
        [[5.6,11.6],[11.2,11.4],[11.6,17],[6,17.2],[17,11.4],[22.4,11.6],[22,17.2],[16.4,17]].forEach(([x,y])=>{ e.ell(x,y,0.6,0.6,STEEL[4]); e.rect(x-0.4,y-0.4,0.4,0.4,'#ffffff'); });
        // abertura com amarração de corda
        e.ln(14,12.2,14,25,0.8,OLIVE[5]);
        for(let y=13.4;y<19;y+=1.8){ e.ln(12.6,y,15.4,y+1.2,0.6,ROPE[1]); e.ln(15.4,y,12.6,y+1.2,0.6,ROPE[2]); }
        // costura grossa nas cavas
        for(let y=9.4;y<18;y+=1.6){ e.rect(3.8,y,0.6,0.8,OLIVE[0]); e.rect(23.6,y,0.6,0.8,OLIVE[4]); }
      });
      e.ln(10.6,3.4,14,12.2,0.7,OLIVE[0]); e.ln(6.6,3.4,10.6,3.4,0.6,RUB[0]);
      // fivela lateral
      e.rect(2.6,15.4,2.4,2.6,'#6a5028'); e.rect(3.2,16,1.2,1.4,HOLE); e.rect(2.6,15.4,2.4,0.6,'#c8a060');
    },
  };
  // pontos de especular (onde a estrelinha pulsa) em unidades cruas
  const SPEC={madeira:[11,7.2],sucata:[13,7],pano:[19,10.2],agua:[8.8,10],comida:[6.6,11.4],remedio:[8.6,9.6],pecas:[7,16],gasolina:[6.4,9.6],fragmento_lunar:[13.6,4.4],projeto:[8.6,11.4],chave:[5,6.4],
    chave_comum:[8,5.6],chave_medico:[8,5.6],chave_militar:[8,5.6],chave_raro:[8,5.6],kit_cura:[5,12],presente:[5.4,14.2],adrenalina:[9,16],colete:[7,4.2]};

  // ---- passe de luz: topo quente, base roxa, lado direito frio
  const hx=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
  const WARM=hx('#fff0c8'), COOL=hx('#3b2c63'), DEEP=hx('#1c1233'), SHINE=hx('#fffaf0'), OUT=hx(PIX.OUTLINE), RIMC=hx(RIM);
  const isOut=(d,i)=>d[i]===OUT[0]&&d[i+1]===OUT[1]&&d[i+2]===OUT[2];
  const mixc=(c,t,m)=>[c[0]+(t[0]-c[0])*m,c[1]+(t[1]-c[1])*m,c[2]+(t[2]-c[2])*m];
  function grade(cv,fi,K){
    const W=cv.width,H=cv.height,g=cv.getContext('2d'),im=g.getImageData(0,0,W,H),d=im.data;
    let y0=H,y1=0,x0=W,x1=0; for(let y=0;y<H;y++)for(let x=0;x<W;x++) if(d[(y*W+x)*4+3]>0){ if(y<y0)y0=y; if(y>y1)y1=y; if(x<x0)x0=x; if(x>x1)x1=x; }
    const hh=Math.max(1,y1-y0), ww=Math.max(1,x1-x0);
    const pos=2+fi*8.4; // faixa de brilho "/" correndo da esquerda pra direita
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){ const i=(y*W+x)*4; if(!d[i+3]||isOut(d,i)) continue;
      let c=[d[i],d[i+1],d[i+2]];
      const rim=c[0]===RIMC[0]&&c[1]===RIMC[1]&&c[2]===RIMC[2];
      if(!rim){
        const t=(y-y0)/hh, u=(x-x0)/ww, lum=(c[0]+c[1]+c[2])/765, wk=1-lum*0.55;
        if(t<0.12) c=mixc(c,WARM,0.2*wk); else if(t<0.25) c=mixc(c,WARM,0.1*wk); else if(t>0.92) c=mixc(c,DEEP,0.3); else if(t>0.8) c=mixc(c,COOL,0.2); else if(t>0.68) c=mixc(c,COOL,0.1);
        if(u>0.88) c=mixc(c,COOL,0.12);
      }
      const s=Math.abs((x+0.5)/K+(y+0.5)/K*0.7-pos);
      if(s<1.1) c=mixc(c,SHINE,0.55); else if(s<2.4) c=mixc(c,SHINE,0.22);
      d[i]=c[0]; d[i+1]=c[1]; d[i+2]=c[2]; }
    g.putImageData(im,0,0);
  }
  // aura (halo em faixas, pulsando) atrás do sprite
  function aura(cv,K,rad,cols){
    const W=cv.width,H=cv.height,g=cv.getContext('2d'),im=g.getImageData(0,0,W,H),d=im.data;
    const op=new Uint8Array(W*H); for(let i=0;i<W*H;i++) op[i]=d[i*4+3]>0?1:0;
    const Rp=Math.ceil(rad*K), cc=cols.map(([h,a])=>[...hx(h),a]);
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){ const i=y*W+x; if(op[i]) continue; let best=1e9;
      for(let dy=-Rp;dy<=Rp;dy++){ const yy=y+dy; if(yy<0||yy>=H) continue; for(let dx=-Rp;dx<=Rp;dx++){ const xx=x+dx; if(xx<0||xx>=W) continue; if(op[yy*W+xx]){ const q=dx*dx+dy*dy; if(q<best) best=q; } } }
      if(best===1e9) continue; const dist=Math.sqrt(best)/K/rad; const k=dist<0.5?0:dist<=1?1:-1; if(k<0) continue;
      const [r,gg,b,a]=cc[k]; d[i*4]=r; d[i*4+1]=gg; d[i*4+2]=b; d[i*4+3]=Math.round(a*255); }
    g.putImageData(im,0,0);
  }
  function star(g,K,x,y,r,c1,c2){
    const px=Math.max(1,Math.round(K)), X=Math.round(x*K), Y=Math.round(y*K), L=Math.round(r*K);
    g.fillStyle=c1; g.fillRect(X-L,Y,L*2+px,px); g.fillRect(X,Y-L,px,L*2+px); g.fillStyle=c2; g.fillRect(X,Y,px,px);
  }
  function dot(g,K,x,y,c){ const px=Math.max(1,Math.round(K)); g.fillStyle=c; g.fillRect(Math.round(x*K),Math.round(y*K),px,px); }

  const cache=PIX.cache();
  function frame(id,fi=0,step=5){
    if(!D[id]) id='sucata';
    fi=((fi%N)+N)%N;
    const K=PIX.getK(), key=id+'|'+fi+'|'+step+'@'+K; if(cache.has(key)) return cache.get(key);
    const S=Math.round(SIZE*K);
    const parts=[{draw:(c,u)=>{ const p=mkPen(c,u); p.id(); D[id](kit(c,u),fi); p.id(); }}];
    const cv=compose({FW:S,FH:S,GROUND:(GYU+4)*K,parts,M:{},step,rim:RIM});
    if(step>=5){
      grade(cv,fi,K);
      const g=cv.getContext('2d');
      if(id==='fragmento_lunar'){
        const r=[2.2,2.6,3,3.2,3,2.6][fi];
        aura(cv,K,r,[['#ff7a94',0.66],['#ff3a64',0.34]]);
        for(let k=0;k<4;k++){ const u=((fi+k*1.5)%N)/N, x=5+k*5.6+Math.sin(u*6.28+k)*1.4, y=20-u*17;
          if(k%2) star(g,K,x,y,u<0.5?1.4:0.8,'#ffc0d0','#ffffff'); else dot(g,K,x,y,u<0.6?'#ffe0e8':'#ff5a7a'); }
      }
      if(id==='chave'||id==='chave_raro'){ const tw=[[20,15],[9,4],[16,10],[22,22],[4,12],[13,6]]; const [x,y]=tw[fi], [x2,y2]=tw[(fi+3)%N]; star(g,K,x,y,1.6,'#fff2a8','#ffffff'); dot(g,K,x2,y2,'#fffbe0'); }
      const sz=[0,1,2,2.6,2,1][fi], sp=SPEC[id];
      if(sz>0) star(g,K,sp[0],sp[1],sz,'#fff2cc','#ffffff');
    }
    cache.set(key,cv); return cv;
  }
  function ANCHOR(id){ const K=PIX.getK(); return {ax:Math.round(AXU*K), gy:Math.round(GYU*K)}; }
  // KIT/RAMPS/star expostos pros ícones de golpe e de arma (mesmo acabamento)
  return {IDS,NOMES,frame,ANCHOR,N,SIZE,KIT:kit,RAMPS:{STEEL,RUST,CRY,GOLD,YEL,RED,WH,BARK,ROPE,SKIN:['#ffe0c0','#f4b088','#d0845a','#a0583a','#6a3424'],GRASS:['#e0ffc8','#9ae060','#5ab040','#337a2e','#1e4e22']},STAR:star};
})();
