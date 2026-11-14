require('./zpage-eb-build.js')({slug:'estalador', fill:{
  NAME:'Estalador', NUM:'007', FACT:'ESTA', AFTER:"'listen',2",
  FORMCSS:'.seg.forms button[data-form="enluarado"][aria-pressed="true"]{background:#a8e0ff} .seg.forms button[data-form="plenilunar"][aria-pressed="true"]{background:#943a50;color:#fff}',
  LEDE:'O fungo do vírus tomou conta da cabeça e rachou o rosto em placas. <b>Não enxerga nada</b>: anda estalando a língua e caça pelo som. Se o herói faz barulho, vira na hora e corre em linha reta com os braços abertos pro <b>agarrão de 35</b>. Sem olhos, toda a leitura dele vem da cabeça em flor e das mãos tateando.',
  STRIPNOTE:'No Ouvir, os quadros 3 e 5 (260 ms) são as pausas em que ele inclina a cabeça e escuta. É a janela pro jogador ficar quieto. No Agarrão, os quadros 2 a 4 são a corrida em linha reta e o 6º (320 ms) segura o agarrão.',
  PALNOTE:'Corpo em marrom e verde-musgo apagados. O laranja do fungo é a única cor quente, então a cabeça em flor vira o alvo do olho, já que ele não tem rosto.',
  TABLE:`<tr><td>Cabeça</td><td>Placas de fungo bege e laranja abertas como flor rachada, fendas escuras. Sem olhos. Só a boca por baixo, dentes tortos. Cogumelos no topo.</td><td>7 pétalas alternando bege e laranja em volta de um centro escuro, com uma fenda funda entre cada uma. Abaixo, a boca com dentes tortos abre no estalo. 3 cogumelos de chapéu creme no topo. Nenhum olho em nenhum quadro.</td></tr>
<tr><td>Tronco</td><td>Jaqueta de couro velha, rasgada, manchas de mofo. Pele com fungo em placas por baixo.</td><td>Jaqueta marrom-escura com gola e zíper, 4 manchas de mofo verde-acinzentado e a gola aberta mostrando a pele com placas de fungo.</td></tr>
<tr><td>Braços</td><td>Braços tortos, mãos à frente tateando o ar. Dedos tremem. Fungo cobrindo uma das mãos.</td><td>Os dois braços esticados à frente. Os dedos se abrem em leque e alternam de posição a cada quadro (o tremor). A mão da frente é coberta de fungo bege com pintas laranja.</td></tr>
<tr><td>Pernas</td><td>Calça cargo verde-musgo, bolsos rasgados, botas gastas. Pernas meio dobradas, andando com cuidado.</td><td>Calça cargo com bolso lateral rasgado e botas marrons. Joelhos sempre dobrados e passo curto e lento (150 ms por quadro).</td></tr>
<tr><td>Movimento</td><td>Para, inclina a cabeça e estala pra ouvir. Se o herói faz barulho, vira e corre em linha reta com os braços abertos.</td><td>Animação Ouvir: inclina a cabeça e as ondas de som saem do rosto a cada estalo ("tk tk"). Agarrão: corrida reta com linhas de velocidade, braços abertos e "AGARRÃO!".</td></tr>
<tr><td>Enluarado</td><td>Pele albina e fungo azul-claro.</td><td>Pele quase branca, fungo e cogumelos azul-claros, luz de lua azul.</td></tr>
<tr><td>Plenilunar</td><td>Pele vinho, chifres de fungo e audição em dobro.</td><td>Pele vinho, dois chifres de fungo vermelho saindo da cabeça e ondas de som com o dobro do alcance.</td></tr>`,
  FXJS:`function onFrame(){ const P=Z.poseOf(S.anim,S.fi); if(P.click){ const cv=Z.frame(S.form,S.anim,S.fi,5); S.fx.push({t:0,x:X0+cv._head.x+4,y:Y0()+cv._head.y,big:S.form==='plenilunar'}); } }
function stageFx(cv,X,Y,P,dt){
  S.fx.forEach(f=>{ f.t+=dt; const R=(f.big?60:34)*f.t/0.7; for(let k=0;k<3;k++){ const r=R-k*7; if(r<3) continue; g.strokeStyle='rgba(255,236,200,'+Math.max(0,0.8-f.t)+')'; g.lineWidth=1; g.beginPath(); g.arc(f.x,f.y,r,-1.1,1.1); g.stroke(); g.beginPath(); g.arc(f.x,f.y,r,Math.PI-1.1,Math.PI+1.1); g.stroke(); } }); S.fx=S.fx.filter(f=>f.t<0.7);
  if(S.anim==='attack' && S.fi>=1 && S.fi<=4){ g.fillStyle='rgba(255,255,255,.6)'; for(let k=0;k<7;k++){ const y=Y+40+((k*23)%60), L=14+(k*7)%18, x=((T*300+k*67)%140); g.fillRect(Math.round(X-10+x),y,L,1); } }
  if(S.anim==='attack' && (S.fi===4||S.fi===5)) return ['burst','AGARRÃO!',X+cv._hand.x+12,Y+cv._hand.y-16];
  if(P.click) return ['bubble','tk tk',X+cv._head.x+22,Y+cv._head.y-14];
  if(S.anim==='hurt' && S.fi<=1) return ['burst','CRAU!',X+44,Y+30];
  return null; }`
}});
