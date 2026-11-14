// gera catadora-cosmic.html (recruta Catadora) a partir do template recruta-cg-page.html
const fs=require('fs'), path=require('path');
const D=path.join(__dirname,'..'), S=f=>fs.readFileSync(path.join(__dirname,f),'utf8'), A=f=>fs.readFileSync(path.join(D,f),'utf8');
const script=h=>h.split('<script>')[1].split('</script>')[0];
const err=A('errante-cosmic.html'), CSS=err.match(/<style>[\s\S]*?<\/style>/)[0];
const se=script(err), BG=se.slice(se.indexOf('/* ---------- stage background'),se.indexOf('/* ---------- state & loop'));
const id='catadora', FACT='CATA', FW=136, FH=150;
const old=fs.readFileSync('C:/Users/lucas/Desktop/CerebroNB/LuadeSangue/Herói e Recrutas da Lua de Sangue/recrutas/'+id+'.png').toString('base64');
const FX=`{
  onFrame(S,P,cv,X,Y){ if(S.anim==='special' && S.fi===5){ const b=cv._bag; for(let k=0;k<10;k++) S.parts.push({x:X+b.x,y:Y+b.y,vx:(Math.random()-.5)*60,vy:-40-Math.random()*40,c:k%2?'#ffd23f':'#ffffff',life:0.5,gr:120}); }
    if(S.anim==='combo' && P.impact){ const t=cv._tip; for(let k=0;k<8;k++) S.parts.push({x:X+t.x,y:Y+t.y,vx:(Math.random()-.3)*80,vy:-30-Math.random()*50,c:'#a8b0ba',life:0.6,s:2}); } },
  text(S,P,cv,X,Y){ const t=cv._tip;
    if(S.anim==='special' && S.fi<=1) return ['bubble','ACHEI!',X+cv._head.x+24,Y+cv._head.y-10];
    if(S.anim==='special' && S.fi===5) return ['burst','PLIM!',X+cv._bag.x-6,Y+cv._bag.y-14];
    if(S.anim==='combo' && (S.fi===2||S.fi===6)) return ['burst','TÉIM!',X+t.x+8,Y+t.y-10];
    if(S.anim==='combo' && S.fi===10) return ['burst','CRAQ!',X+t.x+6,Y+t.y-14];
    if(S.anim==='hurt' && S.fi<=1) return ['burst','AI!',X+40,Y+50];
    return null; }
}`;
const COMBAT=[
 ['Parada','6 × 160 ms','Apoiada no gancho como bengala, o bag balança com a respiração e ela pisca no 4º quadro.'],
 ['Guarda','6 × 130 ms','Gancho erguido em diagonal, sobrancelha franzida, dente cerrado.'],
 ['Ganchada 1','quadro 3','Golpe de cima pra baixo com o gancho. Dano curto, alcance ~40 px.'],
 ['Ganchada 2','quadro 7','Puxa o gancho subindo: fisga e levanta o zumbi.'],
 ['Ganchada 3','quadro 11','Pancada final com o corpo todo: dano 2×, tremor e faíscas de ferro.'],
 ['Especial: fisgar sucata','7 quadros','"ACHEI!": se abaixa, fisga uma latinha do chão com a ponta do gancho, levanta e joga por cima do ombro dentro do bag ("PLIM!"). No jogo dá +1 de Sucata e um bônus de coleta naquela área.'],
 ['Dano','4 quadros','Flash branco e "AI!". As pontas do lenço e o rabo de cavalo voam pra trás.'],
].map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('');
const TABLE=[
 ['Lenço/cabelo','Lenço de chita vermelho com florzinhas amarelas e folhas verdes, nó atrás com duas pontas que balançam, rabo de cavalo por baixo.','Lenço vermelho com 7 florzinhas em cruz e miolo claro, folhinhas verdes, nó redondo e duas pontas que balançam em fase oposta ao passo (e voam no dano). O rabo de cavalo sai por baixo do nó.'],
 ['Rosto','Meio-sorriso torto, fuligem na bochecha, brinco de argola dourada.','Sorriso torto (canto da frente mais alto), mancha de fuligem na bochecha de trás, argola dourada na orelha, sobrancelha franzida na guarda e erguida no "achei!".'],
 ['Camiseta','Verde desbotada, símbolo de reciclagem, remendo xadrez na barriga, barra suja.','Verde com manchas claras de desbotado, círculo de reciclagem no peito, remendo bege com costura tracejada e faixa de sujeira na barra.'],
 ['Braços/luvas','Mangas curtas, luva de borracha amarela.','Manga curta com dobra mais escura e luvas amarelas de borracha com brilho, punho dobrado e mancha na palma.'],
 ['Pernas/pés','Jeans largo dobrado, remendo vermelho no joelho, barbante na cintura, chinelo verde com tira azul.','Jeans largo com barra virada mais clara, remendo vermelho com pontos pretos no joelho, barbante com nó e duas pontas, chinelo de sola verde e borda amarela com tira azul em V.'],
 ['Gancho','Vergalhão com ponta curvada, cabo com fita isolante preta e faixa vermelha, ferrugem em 3 pontos.','Haste de aço de 36 px com 3 pontos de ferrugem, gancho curvo na ponta e cabo de fita preta com faixa vermelha. É bengala na parada e no andar, arma no combo e "anzol" no especial.'],
 ['Bag de ráfia','Ráfia branca trançada com faixa azul, garrafa PET, latinha, papelão e pano saindo pela boca, alça cruzando o peito.','Bag alto nas costas com trama em xadrez e faixa azul. Pela boca saem PET verde de tampa azul, latinha vermelha, papelão e um pano rosa, e a alça marrom cruza o peito. Ele balança com atraso e pula quando a latinha cai dentro.'],
].map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('');
const NAMES=JSON.stringify({skin:'Pele',scarf:'Lenço de chita',flower:'Florzinhas',shirt:'Camiseta',patch:'Remendo',jeans:'Jeans',glove:'Luva de borracha',sole:'Chinelo',bag:'Bag de ráfia',steel:'Gancho (aço)',rust:'Ferrugem',tape:'Fita isolante'});
const fill=(t,m)=>Object.entries(m).reduce((s,[k,v])=>s.split('{{'+k+'}}').join(v),t);
const html=fill(S('recruta-cg-page.html'),{TITLE:'Catadora · Recruta',CSS,PIX:S('pix.js'),FACTCODE:S(id+'.js'),FACT,BG,FXCODE:FX,OLDPNG:old,ID:id,NAME:'Catadora',ARTIGO:'a',
  EYEBROW:'Recrutas · Coleta / Madeira · Direção de arte cósmica',FW,FH,FW70:Math.round(FW*0.7),FH70:Math.round(FH*0.7),
  LEDE:'Catadora de recicláveis que já rodava a cidade inteira antes do fim do mundo. <b>Agora a cidade inteira é o lixão dela.</b> Lenço de chita na cabeça, camiseta verde cheia de remendos, luva de borracha amarela e o bag de ráfia lotado de latinhas e PET nas costas. Anda com o <b>gancho de vergalhão</b> como bengala e enxerga valor em tudo. Aptidão principal Coleta, secundária Madeira, contrária Defesa.',
  STRIPNOTE:'No combo, os quadros 3, 7 e 11 são os golpes (✦). No especial, o quadro 3 é quando a ponta do gancho fisga a latinha, e o 6 é quando ela cai no bag.',
  COMBAT,TABLE,NAMES});
fs.writeFileSync(path.join(D,id+'-cosmic.html'),html);
fs.writeFileSync(path.join(D,'chk_'+id+'.js'),html.split('<script>').slice(1).map(x=>x.split('</script>')[0]).join('\n'));
console.log(id,(html.length/1024).toFixed(0)+' KB');
