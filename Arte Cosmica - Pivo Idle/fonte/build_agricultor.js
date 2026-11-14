// gera agricultor-cosmic.html (recruta Agricultor) a partir do template recruta-cg-page.html
const fs=require('fs'), path=require('path');
const D=path.join(__dirname,'..'), S=f=>fs.readFileSync(path.join(__dirname,f),'utf8'), A=f=>fs.readFileSync(path.join(D,f),'utf8');
const script=h=>h.split('<script>')[1].split('</script>')[0];
const err=A('errante-cosmic.html'), CSS=err.match(/<style>[\s\S]*?<\/style>/)[0];
const se=script(err), BG=se.slice(se.indexOf('/* ---------- stage background'),se.indexOf('/* ---------- state & loop'));
const id='agricultor', FACT='AGRI', FW=168, FH=156;
const old=fs.readFileSync('C:/Users/lucas/Desktop/CerebroNB/LuadeSangue/Herói e Recrutas da Lua de Sangue/recrutas/'+id+'.png').toString('base64');
const FX=`{
  sprout:0,
  onFrame(S,P,cv,X,Y){
    if(S.anim==='special' && S.fi===0) this.sprout=0;
    if(S.anim==='special' && (S.fi===1||S.fi===2)){ const h=cv._hand; for(let k=0;k<7;k++) S.parts.push({x:X+h.x+4,y:Y+h.y,vx:30+Math.random()*50,vy:-30+Math.random()*30,c:'#e8d8a0',life:0.9}); }
    if(S.anim==='combo' && (P.smear)){ const t=cv._tip; for(let k=0;k<(P.impact?14:6);k++) S.parts.push({x:X+t.x,y:Y+t.y+8,vx:(Math.random()-.4)*90,vy:-40-Math.random()*60,c:k%2?'#6a4a2a':'#8a6a4a',life:0.7,s:2}); } },
  under(g,S,P,cv,X,Y,dt,SG){
    if(S.anim==='special'){ if(S.fi>=6) this.sprout=Math.min(1,this.sprout+dt*2.4); const x=X+cv._hip.x+44, s=this.sprout;
      g.fillStyle='#4a321a'; g.fillRect(x-7,SG,14,3); g.fillStyle='#6a4a2a'; g.fillRect(x-6,SG,12,1);
      if(s>0){ const h=Math.round(4+s*12); g.fillStyle='#170b1c'; g.fillRect(x-1,SG-h-1,3,h+1); g.fillStyle='#3f7f22'; g.fillRect(x,SG-h,1,h);
        if(s>0.4){ g.fillStyle='#170b1c'; g.fillRect(x-6,SG-h-3,6,4); g.fillRect(x+1,SG-h-4,6,4); g.fillStyle='#9fdc68'; g.fillRect(x-5,SG-h-2,4,2); g.fillRect(x+2,SG-h-3,4,2); g.fillStyle='#b4e878'; g.fillRect(x-4,SG-h-2,2,1); } } } },
  over(g,S,P,cv,X,Y){ if(S.anim==='special' && P.water){ const sp=cv._spout; for(let k=0;k<3;k++) S.parts.push({x:X+sp.x+Math.random()*2,y:Y+sp.y,vx:20+Math.random()*16,vy:10+Math.random()*20,c:'#8fd0f0',life:0.7,gr:260}); } },
  text(S,P,cv,X,Y){ const t=cv._tip;
    if(S.anim==='special' && (S.fi===1||S.fi===2)) return ['bubble','semente…',X+cv._head.x+30,Y+cv._head.y-6];
    if(S.anim==='special' && S.fi>=6) return ['burst','BROTOU!',X+cv._hip.x+50,Y+cv._hip.y+10];
    if(S.anim==='combo' && (S.fi===2||S.fi===6)) return ['burst','TOC!',X+t.x,Y+t.y-16];
    if(S.anim==='combo' && S.fi===10) return ['burst','TUM!',X+t.x,Y+t.y-18];
    if(S.anim==='hurt' && S.fi<=1) return ['burst','ÊTA!',X+46,Y+50];
    return null; }
}`;
const COMBAT=[
 ['Parado','6 × 170 ms','Descansa apoiado na enxada em pé, com a lâmina no chão. Pisca no 3º quadro.'],
 ['Andar','8 × 120 ms','Enxada no ombro, com a lâmina pendurada atrás da cabeça.'],
 ['Guarda','6 × 140 ms','Enxada nas duas mãos (a de trás no fim do cabo, por cinemática inversa), dentes cerrados.'],
 ['Enxadada 1 e 2','quadros 3 e 7','Ergue acima da cabeça e desce com as duas mãos. A lâmina bate no chão à frente e levanta terra.'],
 ['Enxadada 3','quadro 11','Golpe mais alto e pesado: dano 2×, tremor e mais terra. Ele é ruim de briga (Combate é a aptidão contrária), então o combo é o mais lento dos recrutas.'],
 ['Especial: plantar e regar','8 quadros','Finca a enxada em pé, joga um punhado de sementes, rega com o regadorzinho e um broto nasce da cova ("BROTOU!"). No jogo, cura um pouco o squad e deixa Comida no fim da área.'],
 ['Dano','4 quadros','Flash branco e "ÊTA!".'],
].map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('');
const TABLE=[
 ['Chapéu de palha','Aba larga elíptica desfiada, copa em cúpula, trama, fita vermelha com nó, furo na copa.','Aba mais larga que os ombros (domina a silhueta), com fiapos saindo da borda, copa com trama de pontos escuros, fita vermelha com nó e um furinho escuro na copa.'],
 ['Rosto','Bigode ferradura, ruga de sol, bochecha corada, sombra da aba na testa.','Bigode em ferradura descendo pelos cantos da boca, ruga de sol no canto do olho, bochecha corada e faixa de sombra da aba na testa. Sorriso e olhos "^ ^" no fim do especial.'],
 ['Lenço','Lenço vermelho de bolinhas no pescoço.','Faixa vermelha com ponta triangular caindo no peito e bolinhas brancas.'],
 ['Camisa','Verde-oliva de botão, manga longa, pé de alface no bolso, remendo bege, manchas de terra.','Camisa verde-oliva com carcela e 4 botões claros, bolso com 3 folhas de alface saindo, remendo bege com pesponto e manchas de terra. Punho dobrado mais claro.'],
 ['Calça/botina','Brim cáqui arregaçado, remendo azul no joelho, botina marrom com barro.','Calça cáqui com a barra dobrada mostrando a canela, remendo azul-acinzentado no joelho, botina de couro com sola escura e respingos de barro.'],
 ['Enxada','Cabo de madeira com veio, lâmina trapézio com gume claro e ferrugem.','Cabo de 54 px com veio e luz, olho de encaixe e lâmina de ferro perpendicular com gume claro e 2 pontos de ferrugem. Apoio na parada, no ombro ao andar e com as duas mãos no combate.'],
 ['Especial','Sementes, regador de lata e broto nascendo.','Punhado de sementes bege voando da mão, regador de lata galvanizada com bico (as gotas azuis saem do bico) e broto de 2 folhas crescendo da cova no chão.'],
].map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('');
const NAMES=JSON.stringify({skin:'Pele',straw:'Palha',band:'Fita do chapéu',kerchief:'Lenço',shirt:'Camisa',lettuce:'Alface',pants:'Calça',boot:'Botina',wood:'Cabo',iron:'Lâmina',tin:'Regador',mud:'Barro'});
const fill=(t,m)=>Object.entries(m).reduce((s,[k,v])=>s.split('{{'+k+'}}').join(v),t);
const html=fill(S('recruta-cg-page.html'),{TITLE:'Agricultor · Recruta',CSS,PIX:S('pix.js'),FACTCODE:S(id+'.js'),FACT,BG,FXCODE:FX,OLDPNG:old,ID:id,NAME:'Agricultor',ARTIGO:'o',
  EYEBROW:'Recrutas · Horta / Coleta · Direção de arte cósmica',FW,FH,FW70:Math.round(FW*0.7),FH70:Math.round(FH*0.7),
  LEDE:'Homem do campo, sertanejo de fala mansa, que trocou a roça pelo abrigo mas não largou a enxada. Chapéu de palha desfiado, camisa verde-oliva remendada e um pé de alface no bolso: <b>onde ele pisa, alguma coisa brota</b>. Na briga ele só sabe dar enxadada. Aptidão principal Horta, secundária Coleta, contrária Combate.',
  STRIPNOTE:'No combo, os quadros 3, 7 e 11 são as enxadadas (✦). O especial tem 8 quadros: finca a enxada, joga as sementes (2–3), rega (4–6) e o broto nasce (7–8).',
  COMBAT,TABLE,NAMES});
fs.writeFileSync(path.join(D,id+'-cosmic.html'),html);
fs.writeFileSync(path.join(D,'chk_'+id+'.js'),html.split('<script>').slice(1).map(x=>x.split('</script>')[0]).join('\n'));
console.log(id,(html.length/1024).toFixed(0)+' KB');
