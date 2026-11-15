import os,re
os.chdir(os.path.dirname(os.path.abspath(__file__)))
base=open('cuspidor-page.html',encoding='utf8').read()
head_end=base.index('<div class="wrap">')
script_start=base.index('<script>')
HEAD=base[:head_end]
TAIL_SCRIPT=base[script_start:]

def page(slug,FAC,title,num,lede,frnote,palnote,rows,real,fxcode,fmt):
    h=HEAD.replace('<title>Cuspidor Nº 004</title>','<title>'+title+' Nº '+num+'</title>')
    body=f'''<div class="wrap">
  <header>
    <div class="eyebrow">Bestiário · Zumbis comuns · Direção de arte cósmica</div>
    <h1>{title} <small>Nº {num}</small></h1>
    <p class="lede">{lede}</p>
  </header>

  <section class="show" aria-label="Sprite animado">
    <div class="stagewrap" id="sw">
      <canvas id="stage" width="240" height="150" role="img" aria-label="{title} animado no Recife Antigo à noite"></canvas>
      <div class="tagfx" id="tagfx">quadro <b>1</b></div>
    </div>
    <div class="panel">
      <div class="grp"><span class="lbl">Forma</span>
        <div class="seg forms" id="forms"><button data-form="comum" aria-pressed="true">Comum</button><button data-form="enluarado" aria-pressed="false">Enluarado</button><button data-form="plenilunar" aria-pressed="false">Plenilunar</button></div></div>
      <div class="grp"><span class="lbl">Animação</span><div class="seg" id="anims"></div></div>
      <div class="grp"><span class="lbl">Etapas da pintura</span>
        <div class="seg" id="steps"><button data-step="1" aria-pressed="false">1 Silhueta</button><button data-step="2" aria-pressed="false">2 Chapado</button><button data-step="3" aria-pressed="false">3 Luz/sombra</button><button data-step="4" aria-pressed="false">4 Contorno</button><button data-step="5" aria-pressed="true">5 Final</button></div></div>
      <div class="grp"><span class="lbl">Reprodução</span>
        <div class="seg"><button id="bPlay" aria-pressed="true">▶ Tocando</button><button id="bStep" aria-pressed="false">Próx. quadro</button><button id="bSlow" aria-pressed="false">½ velocidade</button></div></div>
      <div class="grp"><span class="lbl">Tamanho real no jogo</span>
        <div class="real"><div><canvas id="r1" width="{real[0]}" height="{real[1]}"></canvas><span>ficha (100%)</span></div><div><canvas id="r2" width="{round(real[0]*.7)}" height="{round(real[1]*.7)}"></canvas><span>no jogo (70%)</span></div></div>
        <p class="note">No jogo ele entra a 70%, como os outros zumbis, pra ficar menor que as portas do mapa novo.</p></div>
    </div>
  </section>

  <section>
    <h2><small>Quadros</small>Animação quadro a quadro</h2>
    <div class="strip" id="strip"></div>
    <p class="note">{frnote}</p>
  </section>

  <div class="cols">
    <section class="box">
      <h2><small>Antes e depois</small>Do sprite atual pro hi-bit</h2>
      <div class="ba">
        <figure><img alt="Sprite atual do {title}, 128 px" src="data:image/png;base64,{{{{OLDPNG}}}}"><figcaption>Atual · pixel chunky, contorno uniforme, 2 tons</figcaption></figure>
        <figure><canvas id="afterCv" width="{real[0]}" height="{real[1]}"></canvas><figcaption>Novo · 4 tons, contorno seletivo, luz de lua</figcaption></figure>
      </div>
    </section>
    <section class="box">
      <h2><small>Paleta</small>Rampas de cor da forma <span id="formName">Comum</span></h2>
      <div class="ramps" id="ramps"></div>
      <p class="note" style="margin-top:10px">{palnote}</p>
    </section>
  </div>

  <section class="box">
    <h2><small>Da ficha pro pixel</small>Como cada item da descrição virou desenho</h2>
    <div class="tbl"><table>
      <thead><tr><th>Ficha</th><th>Descrição original</th><th>Como ficou no estilo cósmico</th></tr></thead>
      <tbody>
{rows}
      </tbody>
    </table></div>
  </section>
</div>

'''
    s=TAIL_SCRIPT.replace('{{CUSP}}','{{FAC}}').replace('CUSP.',FAC+'.')
    # cortar a lógica de bolas/poças do cuspidor e trocar pelo fx próprio
    a=s.index('const ACID='); b=s.index('function loop(')
    s=s[:a]+'let last=performance.now(), T=0;'+chr(10)+fxcode['pre']+s[b:]
    s=s.replace(', A=ACID[S.form];',';')
    a=s.index('  // poças'); b=s.index('  g.fillStyle=\'rgba(10,4,16,.55)\'')
    s=s[:a]+s[b:]
    a=s.index('  const P='+FAC+'.poseOf(S.anim,S.fi);'); b=s.index("  document.getElementById('tagfx')")
    s=s[:a]+fxcode['post']+s[b:]
    s=s.replace(", balls:[], pools:[]",", parts:[], rings:[], shake:0, spawns:[]")
    s=s.replace("A.spitAt===i?' ✦':''",fmt)
    s=s.replace("c.drawImage("+FAC+".frame(S.form,'attack',2,5),0,0);",fxcode['after'])
    s=s.replace("r1.clearRect(0,0,128,124)","r1.clearRect(0,0,%d,%d)"%real).replace("r2.clearRect(0,0,90,87)","r2.clearRect(0,0,%d,%d)"%(round(real[0]*.7),round(real[1]*.7)))
    open(slug+'-page.html','w',encoding='utf8').write(h+body+s)

GRIT_FX={'pre':'''const ox=()=>40, oy=()=>SGROUND-GROUND;
function onFrame(){ if(S.anim==='attack' && S.fi===GRIT.ANIMS.attack.screamAt){ S.rings.push({t:0}); S.shake=0.5; [[-10,SGROUND-2],[SW+10,SGROUND-4],[SW+10,SGROUND+4]].forEach(([x,y],k)=>S.spawns.push({x,y,t:-k*0.12,from:x<0?1:-1})); } }
''','post':'''  const P=GRIT.poseOf(S.anim,S.fi), m=cv._mouth;
  S.rings.forEach(r=>{ r.t+=dt; for(let k=0;k<4;k++){ const rr=r.t*150-k*9; if(rr<3) continue; g.strokeStyle=S.form==='plenilunar'?'rgba(255,90,70,'+Math.max(0,0.9-r.t*1.1)+')':'rgba(255,255,255,'+Math.max(0,0.9-r.t*1.1)+')'; g.lineWidth=1; g.beginPath(); g.arc(X+m.x,Y+m.y,rr,-2.2,0.4); g.stroke(); } }); S.rings=S.rings.filter(r=>r.t<0.9);
  S.spawns.forEach(z=>{ z.t+=dt; if(z.t<0) return; const x=Math.round(z.x+z.from*Math.min(z.t,1.2)*22), y=z.y, a=Math.min(1,z.t*3)*(z.t>1.6?Math.max(0,1-(z.t-1.6)*2):1); g.globalAlpha=a; g.fillStyle='#170b1c'; g.fillRect(x-5,y-34,10,34); g.fillRect(x-3,y-42,8,9); g.fillRect(x+(z.from>0?4:-10),y-30,6,3); g.fillStyle='#ff4a5a'; g.fillRect(x+(z.from>0?2:-2),y-39,1,1); g.globalAlpha=1; }); S.spawns=S.spawns.filter(z=>z.t<2.2);
  if(S.shake>0){ S.shake-=dt; const d=Math.round((Math.random()-.5)*3); g.drawImage(stage,d,0); }
  if(S.anim==='attack' && S.fi>=3 && S.fi<=5) setFx('burst',S.form==='plenilunar'?'AAAAH!!':'AAAAH!',X+m.x+20,Y+m.y-14);
  else if(S.anim==='attack' && S.fi<=2) setFx('bubble','…',X+m.x+12,Y+m.y-22);
  else if(S.anim==='hurt' && S.fi<=1) setFx('burst','CRAU!',X+40,Y+30);
  else clearFx();
''','after':"c.drawImage(GRIT.frame(S.form,'attack',4,5),0,0);"}

BARR_FX={'pre':'''const ox=()=>40, oy=()=>SGROUND-GROUND;
function onFrame(){ if(S.anim==='explode' && S.fi===BARR.ANIMS.explode.boomAt){ const cv=BARR.frame(S.form,'explode',4,5), b=cv._belly; const n=S.form==='plenilunar'?3:1;
  for(let j=0;j<n;j++){ const cx=ox()+b.x+(j-(n-1)/2)*26, cy=oy()+b.y+(j?6:0); S.rings.push({x:cx,y:cy,t:-j*0.12}); for(let i=0;i<26;i++) S.parts.push({x:cx,y:cy,vx:(Math.random()-.5)*160,vy:-40-Math.random()*110,t:-j*0.12,c:Math.random()<.5?1:2}); } S.shake=0.4; } }
''','post':'''  const P=BARR.poseOf(S.anim,S.fi), M=BARR.mats(S.form);
  if(S.step>=5 && cv._glow){ const b=cv._belly; glow(X+b.x,Y+b.y,cv._bellyR*1.3,'rgba(255,230,90,'+(cv._glow*0.35)+')'); }
  S.rings.forEach(r=>{ r.t+=dt; if(r.t<0) return; const rr=4+r.t*90, a=Math.max(0,1-r.t*2.2); g.fillStyle='rgba(255,240,170,'+a+')'; g.beginPath(); g.arc(r.x,r.y,rr*0.55,0,Math.PI*2); g.fill(); g.strokeStyle='rgba(255,255,255,'+a+')'; g.lineWidth=2; g.beginPath(); g.ellipse(r.x,SGROUND+2,rr*1.2,rr*0.3,0,0,Math.PI*2); g.stroke(); }); S.rings=S.rings.filter(r=>r.t<0.5);
  S.parts.forEach(q=>{ q.t+=dt; if(q.t<0) return; q.x+=q.vx*dt; q.y+=q.vy*dt; q.vy+=260*dt; if(q.y>SGROUND+2){ q.y=SGROUND+2; q.vx*=0.5; q.vy=0; } g.fillStyle=M.skin[q.c]; g.globalAlpha=Math.max(0,1-q.t*0.7); g.fillRect(Math.round(q.x),Math.round(q.y),2,2); g.globalAlpha=1; }); S.parts=S.parts.filter(q=>q.t<1.4);
  if(S.shake>0){ S.shake-=dt; const d=Math.round((Math.random()-.5)*4); g.drawImage(stage,d,0); }
  if(S.anim==='explode' && S.fi>=5) setFx('burst',S.form==='plenilunar'?'KA-BLOOOM ×3!':'KA-BLOOM!',X+cv._belly.x,Y+cv._belly.y-30);
  else if(S.anim==='explode' && S.fi>=2) setFx('bubble','glorp…',X+cv._belly.x+24,Y+cv._belly.y-30);
  else if(S.anim==='attack' && (S.fi===2||S.fi===3)) setFx('burst','PLOFT!',X+cv._belly.x+30,Y+cv._belly.y-10);
  else if(S.anim==='hurt' && S.fi<=1) setFx('burst','CRAU!',X+40,Y+30);
  else clearFx();
''','after':"c.drawImage(BARR.frame(S.form,'explode',3,5),0,0);"}

g_rows='''        <tr><td>Cabeça</td><td>Boca aberta além do normal, mandíbula deslocada pra baixo, canto da boca rasgado. Olhos vidrados e muito abertos. Cabelo preto, longo e embaraçado, com mechas no rosto. Pescoço comprido com tendões saltados.</td><td>A mandíbula é uma peça separada que desce até 36° e fica mais comprida no grito. O canto rasgado tem sangue. Olho grande arregalado com pupila mínima. O cabelo é feito em duas camadas (atrás e na frente do rosto) que balançam. O pescoço é um tubo com tendão marcado que estica quando a cabeça vai pra trás.</td></tr>
        <tr><td>Tronco</td><td>Blusa de alcinha rosa desbotada e moletom aberto rasgado no ombro. Tronco estreito e ossudo.</td><td>Blusa rosa com alcinhas e clavícula. Moletom cinza aberto com as duas abas, rasgo no ombro mostrando a pele e capuz caído nas costas.</td></tr>
        <tr><td>Braços</td><td>Mãos subindo até o rosto, dedos compridos abertos ao lado das bochechas. Unhas compridas e quebradas. Bracelete de miçangas no pulso.</td><td>As mãos ficam abertas perto do rosto em todas as animações, menos na fuga, quando ela agita os braços. Dedos longos com unha escura e pulseira de 3 miçangas coloridas.</td></tr>
        <tr><td>Pernas</td><td>Saia jeans curta e meia-calça rasgada com fios soltos. Um tênis branco, o outro pé descalço e sujo.</td><td>Saia jeans com costura, meia-calça escura com 2 rasgos mostrando a pele e fio solto. Tênis branco na frente e pé descalço atrás.</td></tr>
        <tr><td>Movimento</td><td>Foge do herói. A cada 6 s para, joga a cabeça pra trás e grita: a tela treme e 3 zumbis aparecem pelas bordas.</td><td>"Fugir" é uma corrida desengonçada com os braços agitados. "Gritar" tem 500 ms de aviso (cabeça indo pra trás), depois 3 quadros de grito com ondas saindo da boca, tremor de tela e 3 silhuetas entrando pelas bordas.</td></tr>
        <tr><td>Enluarado</td><td>Pele rosa e olhos brancos.</td><td>Pele rosa, olho todo branco e luz de lua rosa.</td></tr>
        <tr><td>Plenilunar</td><td>Pele preta, cabelo e boca vermelhos. O grito atordoa por 0,5 s.</td><td>Pele preta, cabelo e boca vermelhos, olho em brasa. As ondas do grito ficam vermelhas, e no jogo atordoam por 0,5 s.</td></tr>'''
b_rows='''        <tr><td>Cabeça</td><td>Cabeça pequena pro corpo, afundada entre os ombros, papada caída. Bochechas inchadas, olhos quase fechados. Careca com manchas roxas.</td><td>A cabeça fica quase dentro dos ombros, com uma papada que cobre o pescoço. Bochecha com ponto de luz, olhos em fenda e 2 manchas roxas na careca. A mandíbula abre na barrigada e na explosão.</td></tr>
        <tr><td>Tronco</td><td>Barriga enorme e redonda, pele esticada, rachada, cheia de bolhas amareladas. Camiseta branca de botequim que não cobre a barriga, subindo até o peito. Veias roxas no umbigo.</td><td>A barriga é uma elipse que ocupa metade do sprite e cresce até 35% antes de explodir. Tem rachaduras, bolhas amarelas com brilho, hematoma e veias roxas em volta do umbigo. A camiseta encardida enrolada no peito.</td></tr>
        <tr><td>Braços</td><td>Braços curtos e gordos, afastados do corpo pela barriga. Mãos inchadas como luvas cheias de ar.</td><td>Braços grossos com manga da camiseta, que se afastam conforme a barriga cresce. As mãos são bolas com reflexo.</td></tr>
        <tr><td>Pernas</td><td>Bermuda xadrez, pernas grossas e curtas com joelhos pra fora. Chinelo de dedo num pé só.</td><td>Bermuda verde com listras vermelhas apagadas, pernas curtas e abertas. Chinelo azul na frente e pé descalço atrás.</td></tr>
        <tr><td>Movimento</td><td>Anda balançando, com a barriga pulsando. Antes de explodir, as bolhas brilham e a barriga incha mais.</td><td>"Andar" balança o corpo inteiro de um lado pro outro. "Barrigada" é o ataque fraco. "Explodir" tem 900 ms de aviso: a barriga incha em 5 quadros, as bolhas crescem e brilham, e vem o flash e a explosão com anel de choque e pedaços.</td></tr>
        <tr><td>Enluarado</td><td>Pele amarela e bolhas brancas.</td><td>Pele amarela, bolhas brancas e luz de lua creme.</td></tr>
        <tr><td>Plenilunar</td><td>Pele cor de lava com rachaduras brilhando. Explode em 3 bolhas.</td><td>Pele laranja-lava com bolhas em brasa e, no fim, 3 explosões em sequência.</td></tr>'''

page('gritador','GRIT','Gritador','005',
 'Uma zumbi magra, de cabelo comprido, com a mandíbula deslocada pelo próprio grito. <b>Não ataca: corre, para e grita</b> a cada 6 s, chamando 3 zumbis pelas bordas da tela. É a prioridade número um da IA dos recrutas, porque deixa a horda crescer.',
 'No Gritar, os 3 primeiros quadros (500 ms) são o aviso: a cabeça vai pra trás e a boca abre. O 4º quadro é o grito (✦), com ondas, tremor de tela e reforços chegando.',
 'Pele fria e roupa desbotada, com o rosa da blusa como única cor viva. No grito, as ondas brancas (vermelhas no Plenilunar) chamam mais atenção que ela.',
 g_rows,(124,128),GRIT_FX,"A.screamAt===i?' ✦':''")
page('barrigudo','BARR','Barrigudo','006',
 'Um zumbi inchado pelos gases da decomposição. É lento e não bate forte, <b>mas explode quando morre</b> (15 de dano em 1,5 tile). Antes de estourar, as bolhas brilham e a barriga incha mais. É o aviso pro recruta se afastar.',
 'No Explodir, os 5 primeiros quadros (900 ms) são o aviso, com a barriga crescendo e as bolhas acendendo. No 6º (✦) vem o flash e a explosão; no 7º o sprite some e só ficam os pedaços.',
 'As bolhas amarelas são o "sinal de perigo": no aviso de explosão elas crescem e ganham brilho aditivo.',
 b_rows,(132,120),BARR_FX,"A.boomAt===i?' ✦':''")
print('ok')
