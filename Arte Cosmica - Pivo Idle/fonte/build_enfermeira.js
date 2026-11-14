// monta capoeirista-cosmic.html e enfermeira-cosmic.html (template recruta-ce-page.html)
const fs=require('fs'), path=require('path');
const D=path.join(__dirname,'..'), S=f=>fs.readFileSync(path.join(__dirname,f),'utf8'), A=f=>fs.readFileSync(path.join(D,f),'utf8');
const script=h=>h.split('<script>')[1].split('</script>')[0];
const err=A('errante-cosmic.html'); const CSS=err.match(/<style>[\s\S]*?<\/style>/)[0];
const es=script(err), BG=es.slice(es.indexOf('/* ---------- stage background'),es.indexOf('/* ---------- state & loop'));
const REC='C:/Users/lucas/Desktop/CerebroNB/LuadeSangue/Herói e Recrutas da Lua de Sangue/recrutas/';
const fill=(t,m)=>Object.entries(m).reduce((s,[k,v])=>s.split('{{'+k+'}}').join(v),t);
const NOTE_PART=`part:(g,p,glow)=>{ const a=Math.max(0,1-p.t/(p.life||1.2)); g.globalAlpha=a;
    if(p.kind==='note'){ const x=Math.round(p.x+Math.sin(p.t*6)*3), y=Math.round(p.y); g.fillStyle='#170b1c'; g.fillRect(x-1,y-1,5,4); g.fillRect(x+2,y-8,2,8); g.fillStyle=p.c; g.fillRect(x,y,3,2); g.fillRect(x+2,y-7,1,7); g.fillRect(x+3,y-7,2,1); }
    if(p.kind==='ring'){ g.strokeStyle='rgba(255,210,63,'+a+')'; g.lineWidth=1; g.beginPath(); g.ellipse(p.x,p.y,8+p.t*90,3+p.t*22,0,0,Math.PI*2); g.stroke(); }
    if(p.kind==='heart'){ const x=Math.round(p.x+Math.sin(p.t*5)*2), y=Math.round(p.y); g.fillStyle='#170b1c'; g.fillRect(x-1,y-1,7,6); g.fillStyle='#ff4a6a'; g.fillRect(x,y,2,2); g.fillRect(x+3,y,2,2); g.fillRect(x,y+1,5,2); g.fillRect(x+1,y+3,3,1); g.fillStyle='#ffb0c0'; g.fillRect(x,y,1,1); }
    if(p.kind==='cross'){ const x=Math.round(p.x), y=Math.round(p.y); g.fillStyle='#170b1c'; g.fillRect(x-1,y-3,5,9); g.fillRect(x-3,y-1,9,5); g.fillStyle='#4ad86a'; g.fillRect(x,y-2,3,7); g.fillRect(x-2,y,7,3); g.fillStyle='#b0ffb0'; g.fillRect(x,y-2,1,1); }
    if(p.kind==='spark'){ g.fillStyle='#fff'; g.fillRect(Math.round(p.x),Math.round(p.y),2,2); }
    g.globalAlpha=1; if(p.kind==='heart'||p.kind==='cross') glow(p.x+2,p.y+2,6,'rgba(255,255,200,'+(0.25*a)+')'); }`;

const cfg={
 capoeirista:{FAC:'CAPO', js:'capoeirista.js', H1:'Capoeirista', TITLE:'Capoeirista · Recruta',
  EYEBROW:'Recrutas · Combate / Defesa · Direção de arte cósmica',
  LEDE:'Mestre de roda de bairro que nunca parou de gingar, nem com o mundo acabando: <b>abadá branco, cordão verde-e-amarelo na cintura, descalço e com o berimbau atravessado nas costas</b>. Corpo seco e atlético, dreads amarrados, sorriso de canto de quem já sabe o próximo golpe. Aptidão principal Combate, secundária Defesa. <i>"Zumbi não sabe gingar."</i>',
  NOTE:'A guarda é a ginga: 8 quadros balançando de um lado pro outro, alternando o braço que protege o rosto. No combo, os golpes caem nos quadros 3 (martelo), 7 (bênção) e 11 (meia-lua), marcados com ✦.',
  COMBAT:`<tr><td>Ginga</td><td>8 × 140 ms</td><td>Guarda em movimento. Enquanto ginga, a IA dele tem mais chance de esquivar (é o "Defesa" secundário).</td></tr>
<tr><td>Martelo</td><td>quadro 3</td><td>Chute com o peito do pé na altura da cabeça, com o tronco jogado pra trás a -18°.</td></tr>
<tr><td>Bênção</td><td>quadro 7</td><td>Chute reto empurrando com a sola. Afasta o zumbi.</td></tr>
<tr><td>Meia-lua</td><td>quadro 11</td><td>Chute giratório alto com a perna de trás. Dano 2× e tremor de tela.</td></tr>
<tr><td>Especial: toque de berimbau</td><td>7 quadros</td><td>Saca o berimbau das costas e toca, com caxixi e cantoria. As notas sobem e um anel dourado dá +15% de dano ao squad por alguns segundos.</td></tr>
<tr><td>Dano</td><td>4 quadros</td><td>Flash branco e "o" de dor, recuando.</td></tr>`,
  FICHA:`<li><b>Cabeça:</b> dreads grossos com sulcos na touca, 5 dreads caindo atrás com contas dourada e vermelha, cavanhaque, argola dourada e sorriso de canto quase o tempo todo.</li>
<li><b>Tronco nu:</b> peitoral, esterno e tanquinho marcados em linhas, clavículas com luz.</li>
<li><b>Braços:</b> musculosos, deltoide separado e fitinha do Senhor do Bonfim amarela no pulso da frente.</li>
<li><b>Abadá:</b> calça branca bem larga, com vincos na coxa e na canela e barra com costura. O cordão verde-e-amarelo dá a volta na cintura, com nó e duas borlas.</li>
<li><b>Pés descalços:</b> sola rosada. No martelo e na meia-lua o pé estica na linha da canela.</li>
<li><b>Berimbau:</b> verga de biriba curva com arame e cabaça. Fica atravessado nas costas e, no especial, vai pra mão da frente, com a baqueta e o caxixi na de trás.</li>`,
  FX:`{ frame:(S,P,cv,X,Y)=>{ if(S.anim==='special'&&(P.pluck||S.fi===3)){ for(let k=0;k<2;k++) S.parts.push({kind:'note',x:X+cv._gourd.x+k*6,y:Y+cv._gourd.y-14,vx:8+Math.random()*16,vy:-28-Math.random()*10,t:0,life:1.4,c:['#ffd23f','#ffffff','#7ae0ff'][(Math.random()*3)|0]}); }
    if(S.anim==='special'&&S.fi===5){ S.parts.push({kind:'ring',x:X+cv._hip.x,y:Y+cv._hip.y+64,vy:0,t:0,life:0.8}); } },
  ${NOTE_PART},
  text:(S,P,cv,X,Y)=>{ const t=cv._tip;
    if(S.anim==='combo'&&(S.fi===2||S.fi===3)) return ['burst','PÁ!',X+t.x+10,Y+t.y-10];
    if(S.anim==='combo'&&(S.fi===6||S.fi===7)) return ['burst','TUM!',X+t.x+10,Y+t.y-10];
    if(S.anim==='combo'&&(S.fi===10||S.fi===11)) return ['burst','VUUSH!',X+t.x+6,Y+t.y-14];
    if(S.anim==='special'&&S.fi>=2&&S.fi<=4) return ['bubble','dim-dom ♪',X+cv._head.x+34,Y+cv._head.y-4];
    if(S.anim==='special'&&S.fi===5) return ['tag','+15% dano no squad',X+cv._hip.x,Y+cv._head.y-14];
    if(S.anim==='hurt'&&S.fi<=1) return ['burst','AI!',X+40,Y+50];
    return null; } }`},
 enfermeira:{FAC:'ENFE', js:'enfermeira.js', H1:'Enfermeira', TITLE:'Enfermeira · Recruta',
  EYEBROW:'Recrutas · Medicina / Horta · Direção de arte cósmica',
  LEDE:'Técnica de enfermagem de posto de saúde (UBS do SUS) que emendou o último plantão com o fim do mundo e nunca mais tirou o pijama cirúrgico. <b>Olheira funda, coque preso com caneta, máscara esquecida no queixo, estetoscópio no pescoço e a maleta vermelha de primeiros socorros na mão</b>. Fala pouco, resolve rápido. <i>"Senta aí que eu dou um jeito nisso."</i>',
  NOTE:'O combo é o golpe de maleta da ficha em 3 tempos, com os golpes nos quadros 3, 7 e 11 (✦). O 3º é a marretada de cima pra baixo. No especial a maleta fica aberta no chão atrás dela.',
  COMBAT:`<tr><td>Guarda</td><td>6 × 140 ms</td><td>Maleta erguida pela alça, pronta pra descer.</td></tr>
<tr><td>Golpe 1</td><td>quadro 3</td><td>Maletada horizontal com rastro de vento.</td></tr>
<tr><td>Golpe 2</td><td>quadro 7</td><td>Volta subindo a maleta.</td></tr>
<tr><td>Golpe 3</td><td>quadro 11</td><td>Marretada de cima pra baixo: dano 2×, estrela de impacto na quina e tremor de tela.</td></tr>
<tr><td>Especial: Curativo de Plantão</td><td>6 quadros</td><td>Larga a maleta aberta no chão, calça as luvas, estica e enrola a atadura, dá um peteleco na seringa e solta corações e cruzes verdes. Cura +20 de vida no recruta mais ferido.</td></tr>
<tr><td>Dano</td><td>4 quadros</td><td>Flash branco e recua com os olhos fechados, com a maleta balançando pra trás.</td></tr>`,
  FICHA:`<li><b>Cabeça:</b> coque com xuxinha rosa atravessado por uma caneta BIC azul, franja com fio solto, olheira arroxeada, bochecha corada e máscara cirúrgica no queixo com o elástico até a orelha.</li>
<li><b>Pijama cirúrgico:</b> blusa azul-clara com trama pontilhada, decote em V com viés, bolso com duas canetas e rolo de esparadrapo, respingo de iodo e gotas de sangue seco. Calça um tom mais escura com mancha no joelho.</li>
<li><b>Estetoscópio</b> grafite por trás do pescoço, com diafragma prateado na frente. Crachá branco no cordão verde (tom SUS).</li>
<li><b>Braços:</b> braçadeira branca com cruz vermelha na manga da frente e relógio no pulso de trás. Luvas azul-lilás no especial.</li>
<li><b>Maleta</b> vermelha com cruz branca, fecho e alça. Pendurada na mão, balança no andar e vira arma no combo.</li>
<li><b>Tênis</b> branco encardido com cadarço e sujeira na ponta, e meia branca no tornozelo.</li>`,
  FX:`{ frame:(S,P,cv,X,Y)=>{ if(S.anim==='special'&&S.fi>=4){ for(let k=0;k<3;k++) S.parts.push({kind:k%2?'cross':'heart',x:X+cv._hand.x+6+k*7,y:Y+cv._hand.y-6,vx:(Math.random()-.3)*14,vy:-24-Math.random()*12,t:0,life:1.4}); }
    if(S.anim==='special'&&S.fi===3){ for(let k=0;k<4;k++) S.parts.push({kind:'spark',x:X+cv._hand.x+Math.random()*4,y:Y+cv._hand.y-16-Math.random()*6,vx:(Math.random()-.5)*20,vy:-10,t:0,life:0.4}); } },
  ${NOTE_PART},
  text:(S,P,cv,X,Y)=>{ const t=cv._tip;
    if(S.anim==='combo'&&(S.fi===2||S.fi===6)) return ['burst','PLAFT!',X+t.x+10,Y+t.y-12];
    if(S.anim==='combo'&&S.fi===10) return ['burst','TUM!',X+t.x+8,Y+t.y-14];
    if(S.anim==='special'&&S.fi===3) return ['bubble','tic tic',X+cv._hand.x+20,Y+cv._hand.y-24];
    if(S.anim==='special'&&S.fi>=4) return ['tag','+20 de vida',X+cv._hand.x+16,Y+cv._head.y-10];
    if(S.anim==='hurt'&&S.fi<=1) return ['burst','AI!',X+40,Y+50];
    return null; } }`},
};
for(const [id,c] of Object.entries(cfg)){
  const fac=S(c.js), FWm=fac.match(/const FW=(\d+)/); const FW=+FWm[1];
  const html=fill(S('recruta-ce-page.html'),{CSS,PIX:S('pix.js'),FACTORY:fac,FACNAME:c.FAC,BG,ID:id,FW:String(FW),FW70:String(Math.round(FW*0.7)),
    TITLE:c.TITLE,H1:c.H1,EYEBROW:c.EYEBROW,LEDE:c.LEDE,NOTE_STRIP:c.NOTE,TABLE_COMBAT:c.COMBAT,LIST_FICHA:c.FICHA,FX:c.FX,
    OLDPNG:fs.readFileSync(REC+id+'.png').toString('base64')});
  fs.writeFileSync(path.join(D,id+'-cosmic.html'),html);
  fs.writeFileSync(path.join(D,'chk_'+id+'.js'),html.split('<script>').slice(1).map(x=>x.split('</script>')[0]).join('\n'));
  console.log(id,(html.length/1024|0)+' KB');
}
