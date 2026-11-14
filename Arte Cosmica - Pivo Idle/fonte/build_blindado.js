require('./zpage-eb-build.js')({slug:'blindado', fill:{
  NAME:'Blindado', NUM:'008', FACT:'BLIN', AFTER:"'block',3",
  FORMCSS:'.seg.forms button[data-form="enluarado"][aria-pressed="true"]{background:#86a070} .seg.forms button[data-form="plenilunar"][aria-pressed="true"]{background:#d8b040}',
  LEDE:'Era da tropa de choque e ainda usa o equipamento. O <b>escudo na frente bloqueia os golpes de frente</b>: só leva dano por trás ou depois de 3 golpes, quando a rachadura em teia cresce até o escudo cair. Anda devagar, sempre virado pro herói.',
  STRIPNOTE:'Em "Golpes no escudo", os quadros 2, 4 e 6 (✦) são as pancadas. A cada uma a teia de rachaduras cresce (4, 7 e 10 raios). No 3º golpe o escudo gira e cai em 3 quadros. O escudo é desenhado por cima do corpo com transparência, então dá pra ver o colete atrás do vidro.',
  PALNOTE:'O equipamento é quase preto e azul-marinho, com o amarelo de alerta só no colete e no capacete. O vidro do escudo é a única área translúcida do bestiário até agora: ela deixa ler o corpo sem perder o escudo de vista.',
  TABLE:`<tr><td>Cabeça</td><td>Capacete preto de choque, viseira trincada. Rosto acinzentado e um olho branco atrás do vidro. Protetor de queixo amassado.</td><td>Capacete preto com reflexo no topo e faixa amarela. Viseira azul-clara com trinca em estrela, rosto cinza-esverdeado e um olho branco aparecendo. Queixeira com vinco.</td></tr>
<tr><td>Tronco</td><td>Colete tático azul-marinho com placas e bolsos, tecido rasgado nos ombros. Rádio pendurado pelo fio.</td><td>Colete com 2 placas e costuras, faixa amarela de alerta, rasgos nos ombros mostrando a pele e o rádio balançando pelo fio na lateral.</td></tr>
<tr><td>Braços</td><td>Esquerdo com escudo retangular transparente, riscado, rachadura em teia. Direito com cotoveleira e cassetete quebrado.</td><td>O escudo é um retângulo visto em 3/4 com vidro translúcido, borda clara, riscos e a teia que cresce a cada golpe. O braço da frente tem cotoveleira e segura o cassetete com a ponta lascada.</td></tr>
<tr><td>Pernas</td><td>Calça preta, caneleiras de plástico, coturnos pesados. Pernas firmes e afastadas.</td><td>Caneleiras cinza com reflexo, joelheira, coturno de bico largo. Base aberta e passo curto.</td></tr>
<tr><td>Movimento</td><td>Anda devagar sempre de frente pro herói, escudo erguido. A cada golpe a rachadura cresce; no 3º o escudo cai.</td><td>Andar de 8 quadros com o escudo fixo à frente. "Golpes no escudo" mostra as 3 pancadas com "TOC!", faíscas, recuo e a queda com "CLANG!". Dano só na animação "por trás".</td></tr>
<tr><td>Enluarado</td><td>Pele e equipamento verde-militar.</td><td>Capacete, colete e calça verde-militar, vidro esverdeado e luz de lua verde.</td></tr>
<tr><td>Plenilunar</td><td>Equipamento preto com ouro, escudo dourado que aguenta 5 golpes.</td><td>Preto com caneleiras e detalhes dourados e escudo dourado translúcido. No jogo ele aguenta 5 golpes; a animação de exemplo mostra a teia nas 3 etapas visuais.</td></tr>`,
  FXJS:`function onFrame(){ const A=Z.ANIMS[S.anim]; if(A.hits&&A.hits[S.fi]){ const cv=Z.frame(S.form,S.anim,S.fi,5); for(let k=0;k<8;k++) S.fx.push({t:0,x:X0+cv._shield.x+6,y:Y0()+cv._shield.y,vx:20+Math.random()*50,vy:(Math.random()-.5)*70}); } }
function stageFx(cv,X,Y,P,dt){
  S.fx.forEach(f=>{ f.t+=dt; f.x+=f.vx*dt; f.y+=f.vy*dt; f.vy+=90*dt; g.fillStyle='rgba(255,240,170,'+Math.max(0,1-f.t*2.5)+')'; g.fillRect(Math.round(f.x),Math.round(f.y),2,1); }); S.fx=S.fx.filter(f=>f.t<0.4);
  const A=Z.ANIMS[S.anim];
  if(S.anim==='block' && A.hits[S.fi]) return ['burst','TOC!',X+cv._shield.x+18,Y+cv._shield.y-10];
  if(S.anim==='block' && S.fi>=6 && S.fi<=8) return ['burst','CLANG!',X+cv._shield.x+20,Y+cv._shield.y+12];
  if(S.anim==='block' && S.fi===9) return ['bubble','sem escudo!',X+cv._head.x+30,Y+cv._head.y-6];
  if(S.anim==='attack' && (S.fi===2||S.fi===3)) return ['burst','PÁ!',X+cv._hand.x+16,Y+cv._hand.y-6];
  if(S.anim==='hurt' && S.fi<=1) return ['burst','CRAU!',X+30,Y+30];
  return null; }`
}});
