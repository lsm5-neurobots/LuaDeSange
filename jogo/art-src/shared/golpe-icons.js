/* GOLPES_ICON — ícones dos golpes especiais (moldura de habilidade + símbolo). Fonte de arte (editável). Build: npm run art */
// Contrato: icon(id, px=64) -> canvas px×px · IDS · SIZE = 32 unidades cruas (K = px/32, sem escala assada)
// Moldura chanfrada na cor do golpe (bisel claro em cima, escuro embaixo), fundo de explosão radial e o símbolo
// desenhado numa camada própria (com contorno escuro e rim) — mesmo kit dos coletáveis (ITEMS.KIT).
const GOLPES_ICON=(function(){
  const {compose,mix}=PIX;
  const SIZE=32, RIM='#a9c8f0';
  const RP=ITEMS.RAMPS, STEEL=RP.STEEL, CRY=RP.CRY, YEL=RP.YEL, WH=RP.WH, BARK=RP.BARK, ROPE=RP.ROPE, SKIN=RP.SKIN, GRASS=RP.GRASS;
  const COR={meia_lua:'#ffd23f',grito_frevo:'#ff5fa8',benzedura:'#7dff9a',mao_trovao:'#7af0ff',tiro_laser:'#ff4a5a',corte_lunar:'#ff3b55',baque_virado:'#ffa040',esfera_espiral:'#b98cff'};
  const IDS=Object.keys(COR);
  const R=(x,y,w,h)=>[[x,y],[x+w,y],[x+w,y+h],[x,y+h]];
  // rampa de 6 tons a partir da cor do golpe (luz quente, sombra roxa)
  const ramp6=h=>[mix(h,'#ffffff',0.62),mix(h,'#fff2cc',0.3),h,mix(h,'#3b2c63',0.35),mix(h,'#1c1233',0.58),mix(h,'#1c1233',0.78)];
  const cham=(x0,y0,x1,y1,c)=>[[x0+c,y0],[x1-c,y0],[x1,y0+c],[x1,y1-c],[x1-c,y1],[x0+c,y1],[x0,y1-c],[x0,y0+c]];
  // polígono de crescente: arco externo (r) e interno (r - espessura que cresce até o meio)
  function crescent(cx,cy,r,a0,a1,w,n){ n=n||18; const o=[], ins=[];
    for(let i=0;i<=n;i++){ const t=i/n, a=a0+(a1-a0)*t, th=w*Math.sin(Math.PI*t); o.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]); ins.push([cx+Math.cos(a)*(r-th),cy+Math.sin(a)*(r-th)]); }
    return o.concat(ins.reverse()); }

  // ---------------- moldura ----------------
  function frameArt(e,id){
    const P=ramp6(COR[id]);
    const outer=cham(0.5,0.5,31.5,31.5,5), ring=cham(3,3,29,29,3.6), inner=cham(3.8,3.8,28.2,28.2,3);
    e.band(outer,[P[0],P[1],P[2],P[3],P[4]],[1,1.4,2,1.4,1],'y',0.5,31.5);
    // bisel: diagonal clara no canto de cima-esquerda, escura embaixo-direita
    e.within(outer,()=>{ e.poly([[0,0],[14,0],[0,14]],P[0]); e.poly([[32,32],[18,32],[32,18]],P[4]); });
    e.poly(ring,'#170b1c');
    const bg=['#3a2458',mix(COR[id],'#2a1640',0.62),mix(COR[id],'#1c1233',0.8),'#1a1030','#120a1e'];
    e.band(inner,[bg[3],bg[2],bg[1],bg[2],bg[3],bg[4]],[1,1.4,2,1.4,1,0.8],'y',3.8,28.2);
    e.within(inner,()=>{
      // explosão radial atrás do símbolo
      const burst=(r0,r1,n,rot,k)=>{ const p=[]; for(let i=0;i<n*2;i++){ const a=rot+i*Math.PI/n, r=i%2?r0:r1; p.push([16+Math.cos(a)*r,16+Math.sin(a)*r]); } e.poly(p,k); };
      burst(4.6,16,8,0.2,mix(COR[id],'#1c1233',0.66)); burst(3,11,8,0.59,mix(COR[id],'#1c1233',0.48)); burst(2.4,7,8,0.2,mix(COR[id],'#1c1233',0.3));
      e.ell(16,16,3.2,3.2,mix(COR[id],'#1c1233',0.1)); e.ell(16,16,1.8,1.8,mix(COR[id],'#ffffff',0.55)); // núcleo de energia
      // reflexo de vidro no topo
      e.poly([[3.8,3.8],[28.2,3.8],[28.2,6.4],[3.8,9]],mix('#ffffff','#3a2458',0.82));
    });
    // rebites nos chanfros + brilho do aro
    [[4.4,4.4],[26.6,4.4],[4.4,26.6],[26.6,26.6]].forEach(([x,y],i)=>{ e.rect(x,y,1.2,1.2,i===3?P[5]:P[0]); });
    e.rect(6,1.2,10,0.8,'#ffffff'); e.rect(1.2,6,0.8,7,P[0]);
  }

  // ---------------- símbolos ----------------
  const S={
    meia_lua(e){ // chute giratório de capoeira: rastro em meia-lua + pé descalço
      const Y=['#fffbe0','#fff2a8','#ffd23f','#e8a020','#b06a10','#6a3a0a'];
      const cr=crescent(16,17,10.6,Math.PI*0.72,Math.PI*1.96,4.4,22);
      e.band(cr,[Y[0],Y[1],Y[2],Y[3],Y[4]],[1,1.4,2,1.6,1],'y',6,28);
      e.within(cr,()=>{ for(let k=0;k<3;k++) e.arc(16,17,10.2-k*1.6,10.2-k*1.6,Math.PI*(1.02+k*0.1),Math.PI*1.7,0.6,k?Y[1]:'#ffffff'); });
      // canela (calça branca de abadá) + pé
      e.c.save(); e.c.translate(25.6,9.4); e.c.rotate(0.5);
      e.band(R(-3,-9,6,9),[WH[0],WH[1],WH[2],WH[3]],[1,2,2,1],'x',-3,3);
      e.rect(-3,-1.4,6,1.2,WH[4]);
      // pé descalço em ponta (calcanhar, peito do pé, dedos) com volume
      const foot=e.smooth([[2.6,-0.4],[3,2.4],[1.4,4.4],[-2.6,4.8],[-6.6,4.6],[-8.2,3.4],[-7.4,1.6],[-4,0.6],[-0.6,-0.6]],4);
      e.band(foot,[SKIN[0],SKIN[1],SKIN[2],SKIN[3],SKIN[4]],[1,1.4,1.6,1.2,1],'y',-0.6,4.8);
      e.within(foot,()=>{ e.ell(1.2,1.4,1.2,1,SKIN[0]); e.rect(-6,3.9,7,0.9,SKIN[4]); });
      for(let k=0;k<4;k++){ const tx=-7.8+k*0.5, ty=1.8+k*0.75; e.ell(tx,ty,1,0.7,SKIN[k%2?2:1]); e.rect(tx-0.6,ty-0.2,0.5,0.3,'#fff4e8'); }
      e.rect(-3.4,0.9,3.6,0.5,SKIN[0]);
      e.c.restore();
      // faíscas de impacto
      e.poly([[5,12],[6,14.4],[8.4,15],[6,15.6],[5,18],[4,15.6],[1.6,15],[4,14.4]],'#ffffff');
    },
    grito_frevo(e){ // sombrinha de frevo + ondas do grito + confete
      const segs=['#ff3a4a','#ffd23f','#3ad06a','#3a8af0','#ff5fa8'], cx=14.4, cy=15.6, r=10;
      for(let i=0;i<5;i++){ const a0=Math.PI+i*Math.PI/5, a1=a0+Math.PI/5, c=segs[i];
        const sl=()=>{ e.c.beginPath(); e.c.moveTo(cx,cy-0.2); e.c.arc(cx,cy,r,a0,a1); e.c.closePath(); };
        e.band(sl,[mix(c,'#ffffff',0.45),c,mix(c,'#3b2c63',0.35)],[1,2,1.2],'y',cy-r,cy+1); }
      // borda em gomos
      for(let i=0;i<5;i++){ const a=Math.PI+(i+0.5)*Math.PI/5; e.ell(cx+Math.cos(a)*(r-0.4),cy+Math.sin(a)*(r-0.4)+0.6,2.4,1.1,mix(segs[i],'#3b2c63',0.45),a+Math.PI/2); }
      e.arc(cx,cy,r-1.4,r-1.4,Math.PI*1.12,Math.PI*1.5,0.7,'#ffffff');
      e.ell(cx,cy-r+0.2,1,1,STEEL[1]);
      // cabo
      e.ln(cx,cy,cx,26,1.3,STEEL[3]); e.ln(cx-0.4,cy,cx-0.4,26,0.5,STEEL[0]);
      e.arc(cx-2,26,2,1.8,0,Math.PI,1.3,'#c83a4a');
      // ondas do grito
      [[3.4,'#ffffff'],[6,'#ffb8d8'],[8.6,'#ff5fa8']].forEach(([rr,k])=>e.arc(22,20,rr,rr*1.1,-0.9,0.9,1.1,k));
      // confete
      [[5,24,'#ffd23f'],[8,27,'#3a8af0'],[25,8,'#3ad06a'],[27.4,12.4,'#ffd23f'],[4,8,'#ff3a4a'],[23,27,'#ff5fa8']].forEach(([x,y,k])=>e.poly([[x,y-1],[x+1.2,y],[x,y+1],[x-1.2,y]],k));
    },
    benzedura(e){ // ramo de arruda + cruzes de cura brilhando
      const G=GRASS;
      e.ln(8,27,21,6,1.2,'#3a6a2a'); e.ln(8.4,27,21.2,6.4,0.5,'#8ac860');
      const leaf=(x,y,a,s)=>{ e.ell(x+0.4,y+0.5,2.6*s,1.4*s,G[4],a); e.band(e.E(x,y,2.6*s,1.4*s,a),[G[0],G[1],G[2],G[3]],[1,1.4,1.4,1],'y',y-1.6*s,y+1.6*s); e.ln(x-Math.cos(a)*2*s,y-Math.sin(a)*2*s,x+Math.cos(a)*2*s,y+Math.sin(a)*2*s,0.4,G[3]); };
      for(let k=0;k<7;k++){ const t=0.12+k*0.12, x=8+13*t, y=27-21*t, side=k%2?1:-1, s=1.1-k*0.06;
        leaf(x+side*2.8,y+side*0.4,side>0?-0.3:0.5+Math.PI,s); }
      leaf(21.6,5.2,-1.1,0.9);
      // cruzes de luz verde
      const plus=(x,y,s)=>{ e.rect(x-0.7*s,y-2.2*s,1.4*s,4.4*s,'#2e8040'); e.rect(x-2.2*s,y-0.7*s,4.4*s,1.4*s,'#2e8040');
        e.rect(x-0.5*s,y-2*s,1*s,4*s,'#c8ffd0'); e.rect(x-2*s,y-0.5*s,4*s,1*s,'#c8ffd0'); e.rect(x-0.4*s,y-0.4*s,0.8*s,0.8*s,'#ffffff'); };
      plus(24.4,17.4,1.4); plus(7,10,1); plus(25,7,0.7);
      e.arc(16,16,11,11,Math.PI*1.1,Math.PI*1.45,0.8,'#c8ffd0');
    },
    mao_trovao(e){ // punho fechado de verdade (dedos dobrados, polegar por cima, volume) explodindo em raios com núcleo claro
      const C=['#ffffff','#d8fcff','#7af0ff','#2ab0d8','#10607a','#0a3a52'], SK0=SKIN;
      // explosão elétrica atrás: estrela serrilhada em camadas até o núcleo branco
      const burst=(cx,cy,r0,r1,n,rot,k)=>{ const p=[]; for(let i=0;i<n*2;i++){ const a=rot+i*Math.PI/n, r=i%2?r0:r1*(0.82+0.18*((i*7)%5)/4); p.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]); } e.poly(p,k); };
      burst(18,13.4,7,15.5,11,0.1,C[4]); burst(18,13.4,6,13,11,0.38,C[3]); burst(18,13.4,5,10.6,9,0.2,C[2]); burst(18,13.4,4.4,9,9,0.55,C[1]); e.ell(17.4,13.4,10.6,10,C[2]); e.ell(17.4,13.4,9.6,9,C[1]); e.ell(17.8,12.8,8.4,7.8,C[0]);
      // raios saindo do punho pra todos os lados (contorno escuro, corpo ciano, alma branca) com galhos
      const bolt=(pts,w)=>{ for(let i=0;i<pts.length-1;i++){ const [x0,y0]=pts[i],[x1,y1]=pts[i+1]; e.ln(x0,y0,x1,y1,w+1.1,C[4]); } for(let i=0;i<pts.length-1;i++){ const [x0,y0]=pts[i],[x1,y1]=pts[i+1]; e.ln(x0,y0,x1,y1,w,C[2]); } for(let i=0;i<pts.length-1;i++){ const [x0,y0]=pts[i],[x1,y1]=pts[i+1]; e.ln(x0,y0,x1,y1,Math.max(0.45,w*0.42),C[0]); } };
      bolt([[13,8],[11.4,5.6],[12.6,4.6],[10,1.5]],1.2); bolt([[20,7],[21.4,4.4],[20.2,3.6],[23,0.5]],1.1);
      bolt([[24,12],[27,11.2],[26.4,9.6],[31,8]],1.2); bolt([[24.4,17],[27.4,18.6],[26.4,20],[30.6,22.4]],1);
      bolt([[9.6,12],[6.6,11],[7.4,9.6],[3,8.4]],1); bolt([[21,21],[22.4,24],[21,25],[23.4,29]],1);
      bolt([[26.4,9.6],[28.6,12.6]],0.6); bolt([[7.4,9.6],[6.4,6.2]],0.6);
      // antebraço com faixa de pano subindo do canto de baixo
      e.c.save(); e.c.translate(13.2,20.4); e.c.rotate(0.45);
      e.band(R(-3.4,-1.5,6.8,4),[SK0[0],SK0[1],SK0[2],SK0[3]],[1,1.6,1.6,1],'x',-3.4,3.4); // pulso
      e.band(R(-4.2,2,8.4,14),[WH[0],WH[1],WH[2],WH[3],WH[4]],[1,1.6,2,1.6,1],'x',-4.2,4.2);
      for(let k=0;k<4;k++) e.ln(-4.2,3.6+k*2.6,4.2,2.4+k*2.6,0.6,WH[4]);
      e.rect(-4.2,2,8.4,0.8,WH[0]); e.rect(2.8,2,1.4,14,C[1]);
      e.c.restore();
      // punho (3/4, socando pra cima-direita)
      e.c.save(); e.c.translate(17.4,13.2); e.c.rotate(0.45);
      const SK=SKIN;
      // dorso da mão / palma (bloco com volume: luz à esquerda, sombra à direita e embaixo)
      e.band(e.smooth([[-6.6,-1],[6.4,-1.6],[7.4,3],[5.4,7.4],[-3.6,7.6],[-7.2,4]],4),[SK[1],SK[2],SK[2],SK[3],SK[4]],[1.2,1.6,1.4,1.2,1],'x',-7.2,7.4);
      // 4 dedos dobrados: falange de cima (nós) em arco, com vãos escuros entre eles
      const FX=[-6.1,-3,0.1,3.2], FT=[-5.4,-6.4,-6.2,-5.2];
      FX.forEach((x,i)=>{ const w=3.1, t=FT[i];
        e.band(e.smooth([[x,t+1.2],[x+w*0.5,t],[x+w,t+1.2],[x+w,1],[x,1]],3),[SK[0],SK[1],SK[2],SK[3]],[1,1.4,1.6,1],'y',t,1);
        e.ell(x+w*0.48,t+1.1,0.9,0.55,'#fff4e8'); // brilho do nó
        e.rect(x+w-0.45,t+1.4,0.45,1.2-t,SK[4]); });
      // segunda falange (pontas dobradas pra baixo, viradas pra frente)
      FX.forEach((x,i)=>{ const w=3.1;
        e.band(e.smooth([[x+0.1,0.6],[x+w-0.1,0.6],[x+w-0.3,3.6],[x+w*0.5,4.3],[x+0.3,3.6]],3),[SK[1],SK[2],SK[3]],[1,1.6,1.2],'y',0.6,4.3);
        e.rect(x+0.4,0.6,w-0.8,0.5,SK[4]); e.rect(x+w-0.4,0.8,0.4,3,SK[4]); });
      // polegar dobrado por cima das pontas, com unha
      e.band(e.E(-1.8,4.4,4.6,1.9,-0.18),[SK[0],SK[1],SK[2],SK[3]],[1,1.4,1.4,1],'y',2.4,6.4);
      e.ell(2.2,3.6,1.3,1,'#ffd8c8',-0.18); e.ell(2.4,3.3,0.7,0.4,'#ffffff',-0.18);
      e.ln(-5.6,5.6,0.6,5,0.45,SK[4]);
      // luz ciana do raio batendo no lado direito e no topo do punho
      e.rect(6.6,-1,0.7,4.6,C[1]); FX.forEach((x,i)=>e.rect(x+0.6,FT[i]+0.25,1.6,0.45,C[1]));
      e.c.restore();
      // arcos elétricos cruzando por cima do punho (envolvendo)
      const arcZ=(pts)=>{ for(let i=0;i<pts.length-1;i++){ const [x0,y0]=pts[i],[x1,y1]=pts[i+1]; e.ln(x0,y0,x1,y1,0.9,C[2]); e.ln(x0,y0,x1,y1,0.4,C[0]); } };
      arcZ([[9,9.4],[11.6,10.6],[11,12.6],[13.4,14.2],[12.4,16.4],[15,18.6]]);
      // faíscas
      [[5.6,25.4],[27,5.6],[4.8,16.6],[28,26]].forEach(([x,y],i)=>{ const k=i%2?C[1]:C[0]; e.rect(x-1.4,y-0.3,2.8,0.7,k); e.rect(x-0.3,y-1.4,0.7,2.8,k); e.rect(x-0.3,y-0.3,0.7,0.7,'#ffffff'); });
    },
    tiro_laser(e){ // emissor + feixe largo atravessando a moldura
      e.c.save(); e.c.translate(16,16); e.c.rotate(-0.4);
      const L=[mix('#ff4a5a','#1c1233',0.5),'#c81e36','#ff4a5a','#ff9aa8','#ffe4e8','#ffffff'];
      e.rect(-6,-5.6,26,11.2,L[0]); e.rect(-6,-4.4,26,8.8,L[1]); e.rect(-6,-3.2,26,6.4,L[2]); e.rect(-6,-2,26,4,L[3]); e.rect(-6,-1,26,2,L[5]);
      // anéis de energia em volta do feixe
      [4,12].forEach((x,i)=>{ e.arc(x,0,1.4,7-i*0.6,-1.4,1.4,0.8,L[4]); });
      // emissor (cano de laser)
      e.band(R(-15,-4.4,9.6,8.8),[STEEL[0],STEEL[1],STEEL[2],STEEL[3],STEEL[4]],[1,1,2,2,1],'y',-4.4,4.4);
      [-13,-10.6,-8.2].forEach((x)=>{ e.rect(x,-5.2,1.2,10.4,'#ff6a7a'); e.rect(x,-5.2,1.2,1.2,'#ffd0d6'); });
      e.ell(-5.4,0,2,5,L[3]); e.ell(-5,0,1.2,3.4,'#ffffff');
      e.c.restore();
      // brilho na boca
      e.poly([[9,19.6],[10.4,15],[12,19],[16.6,20],[12,21.2],[10.4,25.6],[9,21.2],[4.6,20.2]],'#ffffff');
      [[22,6],[27,13],[6,9]].forEach(([x,y])=>e.rect(x,y,1,1,'#ffd0d6'));
    },
    corte_lunar(e){ // onda crescente vermelha correndo pra direita, com linhas de velocidade
      for(let k=0;k<6;k++){ const y=6.4+k*3.8, w=4+((k*7)%5)*1.4; e.rect(4.6,y,w,0.8,k%2?'#ff8aa0':'#ffd0dc'); }
      const cr=crescent(8,16,15,-1.0,1.0,8.4,24);
      e.band(cr,[CRY[0],CRY[1],CRY[2],CRY[3],CRY[4],CRY[5]],[0.6,1,1.4,2,1.4,1],'x',14,23.4);
      e.within(cr,()=>{ e.arc(8,16,14,14,-0.8,0.8,1.1,'#ffffff'); e.arc(8,16,12,12,-0.5,0.5,0.7,CRY[0]); e.arc(8,16,9,9,-0.6,0.6,0.8,CRY[5]); });
      // estilhaços
      [[26,6,1.4],[27.6,25,1.2],[20,28,0.9]].forEach(([x,y,s])=>e.poly([[x,y-s*1.6],[x+s,y],[x,y+s*1.6],[x-s,y]],CRY[1]));
    },
    baque_virado(e){ // alfaia de maracatu + baquetas + onda de choque no chão
      const O=['#fff0d0','#ffc070','#ffa040','#d86a1a','#8a3a0e'];
      // onda de choque
      e.arc(16,26.4,13,3,0,7,1.1,O[3]); e.arc(16,26.4,10,2.2,0,7,0.9,O[1]); e.arc(16,26.2,13,3,3.6,5.8,0.7,'#ffffff');
      // corpo de madeira
      const body=R(8.6,13.6,14.8,10.8);
      e.ell(16,24.4,7.4,2.2,BARK[4]);
      e.band(body,[BARK[0],BARK[1],BARK[2],BARK[3],BARK[4]],[1,1.4,2,1.6,1],'x',8.6,23.4);
      // aros vermelhos + cordas em zigue-zague
      e.within(body,()=>{
        for(let k=0;k<6;k++){ const x=9.4+k*2.6; e.ln(x,15.2,x+1.3,23,0.7,ROPE[1]); e.ln(x+1.3,15.2,x,23,0.7,ROPE[2]); }
        e.rect(8,22.4,16,1.8,'#c82838'); e.rect(8,22.4,16,0.6,'#ff6a70');
      });
      e.band(e.E(16,13.6,7.4,2.4),['#ff6a70','#c82838','#7a1020'],[1,2,1],'y',11.2,16);
      e.ell(16,13.2,6.4,1.7,'#f4e4c4'); e.ell(15.4,12.9,4.6,1.1,'#fff8e8');
      // baquetas cruzadas
      const stick=(x0,y0,x1,y1)=>{ e.ln(x0,y0,x1,y1,1.4,BARK[3]); e.ln(x0-0.3,y0-0.3,x1-0.3,y1-0.3,0.5,BARK[0]); e.ell(x1,y1,1.8,1.6,'#e8d4a8'); e.rect(x1-0.8,y1-1,1,0.6,'#ffffff'); };
      stick(26,3,17,11.6); stick(6,3,14.4,11.4);
      // impacto no couro
      e.poly([[16,8.4],[16.8,10.6],[19,11],[16.8,11.6],[16,13.6],[15.2,11.6],[13,11],[15.2,10.6]],'#ffffff');
      [[5,18,O[1]],[27,18,O[2]],[4,12,O[0]],[28,11,O[1]]].forEach(([x,y,k])=>e.rect(x,y,1.2,1.2,k));
    },
    esfera_espiral(e){ // esfera de energia girando com espiral e anéis
      const V=['#ffffff','#eadcff','#cfb0ff','#b98cff','#8a5ae0','#5a32a8','#341a6a'];
      e.ell(16,16,9.6,9.6,V[6]);
      e.ell(15.6,15.6,8.8,8.8,V[5]); e.ell(15,15,7.6,7.6,V[4]); e.ell(14.4,14.4,6,6,V[3]); e.ell(13.8,13.8,4.2,4.2,V[2]); e.ell(13.2,13.2,2.4,2.4,V[1]);
      // espiral
      const pts=[]; for(let i=0;i<=40;i++){ const t=i/40, a=t*Math.PI*3.4, r=0.6+t*8; pts.push([16+Math.cos(a)*r,16+Math.sin(a)*r]); }
      for(let i=0;i<pts.length-1;i++) e.ln(pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1],0.6+i*0.02,i<20?V[0]:V[1]);
      e.ell(12.6,12,1.2,1,'#ffffff');
      // anéis orbitando
      e.arc(16,16,13,4,0,7,1,V[2]); e.arc(16,16,13,4,0.4,2.6,1,V[0]);
      e.c.save(); e.c.translate(16,16); e.c.rotate(1.1); e.arc(0,0,13,3.4,3.4,6,0.8,V[3]); e.c.restore();
      [[4,6],[27,24],[26,6],[6,26]].forEach(([x,y],i)=>{ e.rect(x-1,y,2,0.6,V[i%2?1:0]); e.rect(x-0.3,y-0.7,0.6,2,V[i%2?1:0]); });
    },
  };

  const cache=new Map();
  function icon(id,px=64){
    if(!S[id]) id='meia_lua';
    const key=id+'|'+px; if(cache.has(key)) return cache.get(key);
    const old=PIX.getK(), K=px/SIZE;
    let fr, sy;
    try{
      PIX.setK(K);
      const mk=(fn,noRim)=>compose({FW:px,FH:px,GROUND:px+16,step:5,rim:RIM,M:{},
        parts:[{noRim,draw:(c,u)=>{ c.setTransform(K,0,0,K,0,0); fn(ITEMS.KIT(c,u)); c.setTransform(1,0,0,1,0,0); }}]});
      fr=mk(e=>frameArt(e,id),true);
      sy=mk(e=>{ e.c.save(); e.c.beginPath(); e.c.rect(4.6,4.6,22.8,22.8); e.c.clip(); S[id](e); e.c.restore(); },false);
    } finally { PIX.setK(old); }
    const out=document.createElement('canvas'); out.width=out.height=px;
    const g=out.getContext('2d'); g.imageSmoothingEnabled=false;
    g.drawImage(fr,0,0);
    // símbolo recortado na janela (o contorno dele fica por dentro do aro)
    g.save(); const w=Math.round(4*K); g.beginPath(); g.rect(w,w,px-2*w,px-2*w); g.clip(); g.drawImage(sy,0,0); g.restore();
    ITEMS.STAR(g,K,24.6,7.4,1.6,'#fff2cc','#ffffff');
    cache.set(key,out); return out;
  }
  return {IDS,COR,SIZE,icon};
})();
