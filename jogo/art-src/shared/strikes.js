/* STRIKES — fonte de arte (editável). Build: npm run art */
/* Biblioteca de golpes avulsos pro rig humano (HEROI, VIGIA, RECRUTA_BASE, AGRI, ENFE...): todos usam os mesmos
   parâmetros de pose (aFs/aFe/bA = braço da frente e ferramenta em graus absolutos, 0 = pra baixo, 90 = pra frente,
   180 = pra cima; tw = torção do tronco; smear/sa = rastro e ângulo onde o arco começa; impact = estrela no impacto).
   Cada golpe é um ataque único (antecipação → rastro → impacto → recuperação), no padrão Cosmic Invasion:
   antecipação segura, 1 quadro de rastro largo, impacto com o corpo esticado e recuperação curta.
   Campos de evento lidos pelo motor (src/expedition/fighter.ts):
     atk  = peso na escolha do combo automático · fin = finalizador ('knock' derruba, 'launch' lança pro alto)
     hits/hitsx = quadro do dano e dados (m = multiplicador, reach = alcance em px, heavy, knock, launch)
     move = deslocamento (px/s) por quadro durante o golpe */
const STRIKES=(function(){
  /* G = combinador da pose de guarda do personagem (alarga a base e converte bA); o = opções:
     two (ferramenta de duas mãos), slow (multiplica durações), names (nomes por golpe), add (campos extras por golpe) */
  function tool(G,o){
    o=o||{}; const sl=o.slow||1, N=o.names||{}, AD=o.add||{}, T=o.two?{two:1}:{};
    const D=a=>i=>Math.round(a[i]*sl);
    const P=(k,arr)=>i=>G(Object.assign({},T,AD[k]||{},arr[i]));
    return {
      // golpe horizontal: puxa o braço pra trás com a ferramenta em pé e varre na altura do peito
      atkH:{nome:N.atkH||'Golpe horizontal',n:8,atk:3,hits:{3:1},hitsx:{3:{m:1.1,reach:46}},move:[0,-20,60,40,0,0,0,0],
        dur:D([90,80,40,50,110,80,80,110]),pose:P('atkH',[
        {tw:-0.4,aFs:10,aFe:-20,bA:190,lean:-4,hx:-2,head:-2,aBs:50,aBe:110,lFh:30,lFk:4,lBh:-22,lBk:-32,brow:1},
        {tw:-0.8,aFs:-26,aFe:-54,bA:204,lean:-12,hx:-5,head:-4,aBs:66,aBe:120,lFh:26,lFk:2,lBh:-24,lBk:-34,brow:1,mouth:1},
        {tw:0.5,aFs:60,aFe:80,bA:150,lean:14,hx:6,head:-8,smear:1,sa:206,aBs:0,aBe:40,lFh:44,lFk:8,lBh:-30,lBk:-36,mouth:2},
        {tw:1,aFs:88,aFe:92,bA:94,lean:30,hx:14,head:-12,smear:3,sa:196,impact:1,aBs:-50,aBe:-20,lFh:54,lFk:12,lBh:-32,lBk:-36,mouth:2,brow:1},
        {tw:1,aFs:70,aFe:40,bA:30,lean:30,hx:14,head:-10,aBs:-56,aBe:-24,lFh:54,lFk:12,lBh:-32,lBk:-36,mouth:1},
        {tw:0.6,aFs:44,aFe:30,bA:10,lean:22,hx:11,aBs:-30,aBe:10,lFh:48,lFk:10,lBh:-30,lBk:-36},
        {tw:0.2,aFs:50,aFe:70,bA:90,lean:14,hx:6,aBs:20,aBe:80,lFh:40,lFk:6,lBh:-28,lBk:-38},
        {}])},
      // golpe por cima: sobe na ponta do pé (estica), rastro vertical e esmaga no chão (achata) — finalizador que derruba
      atkV:{nome:N.atkV||'Golpe por cima',n:9,atk:2,fin:'knock',hits:{4:1},hitsx:{4:{m:1.6,heavy:1,knock:1,reach:44}},move:[0,0,0,50,30,0,0,0,0],
        dur:D([90,90,110,40,60,140,100,90,110]),pose:P('atkV',[
        {aFs:120,aFe:150,bA:180,lean:-4,head:-4,lFh:34,lFk:0,lBh:-22,lBk:-36,aBs:100,aBe:140,brow:1},
        {aFs:166,aFe:200,bA:232,lean:-14,hx:3,head:-8,lift:3,plant:0,lFh:46,lFk:-14,lBh:-8,lBk:-56,aBs:150,aBe:170,brow:1,mouth:1},
        {aFs:176,aFe:212,bA:248,lean:-18,hx:5,head:-10,lift:9,plant:0,lFh:62,lFk:-8,lBh:14,lBk:-56,aBs:160,aBe:182,brow:1,mouth:1},
        {aFs:150,aFe:160,bA:170,lean:6,hx:9,head:-10,lift:5,plant:0,smear:2,sa:248,lFh:56,lFk:0,lBh:-10,lBk:-50,aBs:100,aBe:120,mouth:2},
        {tw:0.9,aFs:72,aFe:54,bA:16,lean:40,hx:15,head:-14,smear:3,sa:244,impact:2,aBs:-50,aBe:-20,lFh:58,lFk:14,lBh:-34,lBk:-36,mouth:2,brow:1},
        {tw:0.8,aFs:66,aFe:48,bA:14,lean:42,hx:15,head:-12,aBs:-50,aBe:-20,lFh:60,lFk:16,lBh:-34,lBk:-36,mouth:1},
        {tw:0.4,aFs:50,aFe:50,bA:40,lean:30,hx:12,aBs:-10,aBe:30,lFh:52,lFk:12,lBh:-32,lBk:-36},
        {aFs:56,aFe:76,bA:100,lean:18,hx:6,aBs:30,aBe:90,lFh:40,lFk:6,lBh:-28,lBk:-38},
        {}])},
      // estocada: recolhe o braço (antecipação pra trás) e espeta com o corpo todo esticado em avanço
      atkS:{nome:N.atkS||'Estocada',n:7,atk:3,hits:{3:1},hitsx:{3:{m:1.2,reach:58}},move:[0,-30,150,70,0,-20,-20],
        dur:D([90,110,40,70,120,90,110]),pose:P('atkS',[
        {aFs:20,aFe:80,bA:92,lean:-6,hx:-4,head:-2,aBs:40,aBe:100,lFh:30,lFk:4,lBh:-24,lBk:-36,brow:1},
        {tw:-0.5,aFs:-24,aFe:84,bA:94,lean:-12,hx:-7,head:-4,aBs:50,aBe:110,lFh:28,lFk:2,lBh:-26,lBk:-38,brow:1,mouth:1},
        {tw:0.6,aFs:70,aFe:90,bA:92,lean:18,hx:8,head:-8,smear:1,sa:100,aBs:-20,aBe:20,lFh:52,lFk:10,lBh:-34,lBk:-42,mouth:2},
        {tw:1,aFs:94,aFe:92,bA:91,lean:32,hx:20,head:-12,impact:1,aBs:-60,aBe:-40,lFh:66,lFk:14,lBh:-40,lBk:-44,mouth:2,brow:1},
        {tw:1,aFs:92,aFe:92,bA:92,lean:30,hx:20,head:-10,aBs:-60,aBe:-40,lFh:66,lFk:14,lBh:-40,lBk:-44,mouth:1},
        {tw:0.4,aFs:70,aFe:88,bA:110,lean:20,hx:12,aBs:0,aBe:60,lFh:52,lFk:10,lBh:-32,lBk:-40},
        {}])},
      // giro: varre na frente, deixa a ferramenta passar por baixo e por trás com um pulinho e desce de novo (2 acertos)
      atkSpin:{nome:N.atkSpin||'Giro',n:10,atk:2,hits:{2:1,6:2},hitsx:{2:{m:0.8,reach:46},6:{m:1.2,heavy:1,reach:48}},move:[0,30,40,30,50,40,20,0,0,0],
        dur:D([90,40,60,60,70,50,60,120,90,110]),pose:P('atkSpin',[
        {tw:-0.8,aFs:-30,aFe:-60,bA:210,lean:-10,hx:-4,head:-4,aBs:60,aBe:120,lFh:28,lFk:2,lBh:-24,lBk:-34,brow:1,mouth:1},
        {tw:0.4,aFs:60,aFe:80,bA:150,lean:12,hx:4,smear:1,sa:210,aBs:0,aBe:40,lFh:44,lFk:8,lBh:-30,lBk:-36,mouth:2},
        {tw:1,aFs:90,aFe:90,bA:88,lean:26,hx:12,head:-10,smear:3,sa:186,impact:1,aBs:-50,aBe:-20,lFh:52,lFk:10,lBh:-32,lBk:-36,mouth:2},
        {tw:1,aFs:60,aFe:20,bA:-20,lean:20,hx:12,head:-8,smear:2,sa:90,aBs:-40,aBe:0,lFh:46,lFk:8,lBh:-30,lBk:-36,lift:2,plant:0},
        {tw:-1,aFs:-40,aFe:-80,bA:-110,lean:4,hx:10,head:-4,lift:8,plant:0,aBs:40,aBe:100,lFh:60,lFk:-10,lBh:10,lBk:-50,mouth:1,brow:1},
        {tw:-0.4,aFs:120,aFe:160,bA:220,lean:-10,hx:12,head:-8,lift:10,plant:0,aBs:120,aBe:160,lFh:60,lFk:-10,lBh:10,lBk:-50,mouth:2,brow:1},
        {tw:0.9,aFs:78,aFe:62,bA:30,lean:38,hx:16,head:-14,smear:3,sa:236,impact:2,aBs:-60,aBe:-30,lFh:56,lFk:12,lBh:-32,lBk:-36,mouth:2,brow:1},
        {tw:0.8,aFs:70,aFe:54,bA:24,lean:36,hx:16,head:-12,aBs:-50,aBe:-20,lFh:56,lFk:12,lBh:-32,lBk:-36,mouth:1},
        {tw:0.3,aFs:56,aFe:74,bA:96,lean:20,hx:8,aBs:20,aBe:80,lFh:42,lFk:6,lBh:-28,lBk:-38},
        {}])},
      // finalizador que lança: agacha fundo (achata), sobe num arco de baixo pra cima e termina esticado no ar
      atkFin:{nome:N.atkFin||'Finalizador (lança)',n:9,atk:2,fin:'launch',hits:{3:1},hitsx:{3:{m:1.5,launch:1,reach:44}},move:[0,0,60,40,0,0,0,0,0],
        dur:D([100,120,40,60,120,100,90,90,110]),pose:P('atkFin',[
        {aFs:10,aFe:-10,bA:-30,lean:20,hx:-2,head:-4,aBs:30,aBe:80,lFh:60,lFk:-10,lBh:-20,lBk:-70,brow:1},
        {tw:-0.6,aFs:-30,aFe:-40,bA:-60,lean:32,hx:-4,head:-8,aBs:40,aBe:90,lFh:80,lFk:-14,lBh:-10,lBk:-90,brow:1,mouth:1},
        {tw:0.2,aFs:30,aFe:20,bA:20,lean:24,hx:4,head:-10,smear:1,sa:-60,aBs:10,aBe:60,lFh:70,lFk:-6,lBh:-16,lBk:-80,mouth:2},
        {tw:0.9,aFs:110,aFe:130,bA:150,lean:-6,hx:10,head:-16,smear:3,sa:-40,impact:2,lift:6,plant:0,aBs:-40,aBe:-10,lFh:40,lFk:-6,lBh:-6,lBk:-40,mouth:2,brow:1},
        {tw:1,aFs:160,aFe:176,bA:196,lean:-16,hx:12,head:-18,lift:14,plant:0,aBs:-60,aBe:-30,lFh:30,lFk:-20,lBh:0,lBk:-30,mouth:2},
        {tw:0.8,aFs:156,aFe:172,bA:190,lean:-12,hx:12,head:-14,lift:8,plant:0,aBs:-50,aBe:-20,lFh:40,lFk:-14,lBh:-10,lBk:-40,mouth:1},
        {tw:0.4,aFs:110,aFe:140,bA:160,lean:0,hx:8,aBs:10,aBe:60,lFh:44,lFk:6,lBh:-26,lBk:-38},
        {aFs:80,aFe:96,bA:130,lean:8,hx:4,lFh:40,lFk:6,lBh:-28,lBk:-38},
        {}])},
    };
  }

  return {tool};
})();
