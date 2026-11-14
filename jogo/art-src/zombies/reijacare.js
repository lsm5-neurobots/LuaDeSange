/* REIJACARE — fonte de arte (editável). Build: npm run art
   Chefe do Pantanal "O Rei Jacaré": jacaré-do-pantanal (Caiman yacare) de 80 anos que a Lua de Sangue fez rei,
   na margem do rio Cuiabá. Anatomia das fotos (referencias/zumbis-pantanal/reijacare/): cabeça em cunha com focinho
   largo e curto, olhos altos com arcada óssea e pupila vertical, narinas no alto da ponta do focinho, lábio ondulado
   com dentes irregulares à mostra, mandíbula amarelada com manchas escuras, placas ósseas (osteodermos) em fileiras
   nas costas e na nuca, flanco de escamas em grade, cauda comprimida com crista dupla que vira simples e barras
   escuras, patas curtas e laterais em "high walk" (cotovelo pra trás, joelho pra frente, pé traseiro com membrana).
   Corrupção: crânio exposto no lado esquerdo do focinho (o lado que aparece: ele entra virado pra esquerda), olho
   esquerdo de lua branco-leitoso e o direito âmbar (espia por cima do crânio), costelas à mostra no flanco, arpões
   velhos cravados, manto de musgo e aguapé nas placas e a "coroa" natural de aguapé com flor lilás na cabeça.
   Fúria: couro carbonizado, rachaduras ciano luminosas nas placas, sangue, olhos laranja-vermelho, brasa na boca,
   aguapé murcha.
   Esqueleto próprio de crocodiliano (quadro de perfil, frente pra +x): tronco rígido com inclinação (pitch), pescoço e
   cabeça (neck/head), mandíbula (jaw, graus), cauda em 8 segmentos (tc = curva, tw/tph = onda, sw = varrida em
   profundidade: + vem pra frente da câmera), giro no eixo do corpo (roll, voltas: 0,5 = de barriga pra cima), altura
   da barriga (lift), afundar (drop) com lâmina d'água (sub), 4 patas por IK com pés plantados no chão (gait/gA).
   Adereços: xAgua (bolhas, marolas, coluna d'água, espuma) e xOnda (onda da rabada na fúria). */
const REIJACARE=(function(){
  const {rad,lerp,P2}=PIX;
  const K_=BOSSKIT, {S,C,PI,clipPoly,band,bandA,arc,rnd,stain,dust,sparks,smear,puffs}=K_;
  const FW=600, FH=380, GROUND=312, AX=258;
  const RIM={normal:'#c8f0ff', furia:'#ff9a7a'};
  const HS=1.6, HSX=HS*1.2, HSY=HS*0.88, SC=1.12, LK=1.33, DK=1.6, PITCH0=1, NECK0=4, JK=0.5; // HS: escala da cabeça; SC: escala do corpo em volta da âncora no chão

  function mats0(form){
    const m={
      hide:['#a4a26e','#646a4a','#3a4042','#1c1f2e'],
      scute:['#d0bc80','#857a50','#4a4a3e','#23232e'],
      bar:['#4a4a36','#2c2e28','#1a1c22','#0c0c14'],
      flank:['#d4c890','#9c9064','#5e5a4e','#2e2c3a'],
      belly:['#f2e8c4','#c6ba96','#827a76','#443c56'],
      jawy:['#f2e4aa','#c4b07c','#82725e','#403850'],
      spot:['#3e3a2c','#26241e','#18161a','#0c0a10'],
      bone:['#fffbe6','#e0d8b8','#a89c80','#5e5448'],
      flesh:['#ff9a86','#c2404c','#7a1e32','#3e0c1c'],
      mouth:['#f6c8b8','#d0707a','#7c2838','#240a16'],
      tongue:['#e4909a','#a04454','#62202e','#300c18'],
      teeth:['#fffcee','#eadfb8','#ac9c7c','#5a4c3c'],
      claw:['#d8c8ac','#7a6850','#40342a','#1c1612'],
      moss:['#9aae62','#56703a','#324830','#18241e'],
      leaf:['#b4d672','#5c963e','#30603a','#183224'],
      stalk:['#cce494','#86b454','#467634','#22421e'],
      flower:['#f4e2ff','#a478d4','#6a44a4','#382462'],
      fyel:['#fff6b0','#f2c822','#a8800e','#5a4008'],
      wood:['#dcb482','#9c7048','#5e4030','#30201a'],
      iron:['#e8a878','#a85c32','#5e3020','#2e1810'],
      rope:['#f2e2b2','#c4a472','#82684a','#42342a'],
      water:['#c6f2f8','#58a6b8','#2c6680','#15324c'],
      foam:['#ffffff','#e2f6fa','#a8d0dc','#5e8a9c'],
      blood:['#d0403a','#922430','#58141e','#2c0a12'],
      acid:['#dcff8a','#8ad040','#4a8a20','#20400c'],
      eye:['#ffffff','#ffe492','#d4a83a','#7a5010'],
      moon:['#ffffff','#eef8ff','#b0cce8','#6070a8'],
      glow:['#ffffff','#c8ffff','#46e2f2','#1484a8'],
      mglow:['#ffffff','#ffe4a8','#ff9a40','#c03410'],
      fx:['#fffef2','#fff2aa','#ffc24c','#e27c24'],
      dust:['#f2e8cc','#cdb892','#988670','#625448'],
      steam:['#e8e4f0','#b8b0c8','#847c98','#4e4864'],
    };
    if(form==='furia'){
      m.hide=['#8a8270','#46403a','#2a2428','#121014'];
      m.scute=['#9c9484','#524a44','#302a2c','#161216'];
      m.bar=['#3e3632','#24201e','#161214','#0a0808'];
      m.flank=['#c4ae7c','#7c6a4c','#4c4036','#262022'];
      m.belly=['#ecd8b0','#ae9c7a','#706254','#382c34'];
      m.jawy=['#d8b878','#9a7c4c','#5e4a34','#2e2420'];
      m.eye=['#ffffff','#ffd0a0','#ff6a3a','#b01e14'];
      m.moon=['#ffffff','#ffd8b8','#ff7a4a','#a02010'];
      m.moss=['#9a8a4a','#5a4c2c','#382e1e','#1c1610'];
      m.leaf=['#c8ac64','#86683a','#523e24','#2a2014'];
      m.stalk=['#c8b278','#8a7246','#56442c','#2c2218'];
      m.flower=['#e0c4cc','#9a6a88','#5e3e58','#302034'];
      m.blood=['#f05040','#b02830','#6c1420','#3a0a14'];
      m.mouth=['#ffc8b0','#d8685e','#862a30','#2a0a12'];
    }
    return K_.finish(m,['fx','dust','eye','moon','glow','mglow','water','foam','steam']);
  }
  const NAMES={hide:'Couro do dorso',scute:'Osteodermos',bar:'Barras escuras',flank:'Flanco amarelado',belly:'Ventre',jawy:'Mancha da mandíbula',
    spot:'Pintas',bone:'Osso exposto',flesh:'Carne viva',mouth:'Boca',tongue:'Língua',teeth:'Dentes',claw:'Garras',moss:'Musgo',leaf:'Aguapé',
    stalk:'Pecíolo do aguapé',flower:'Flor do aguapé',fyel:'Mancha da flor',wood:'Haste do arpão',iron:'Ferro enferrujado',rope:'Corda',
    water:'Água',foam:'Espuma',eye:'Olho âmbar',moon:'Olho de lua',glow:'Rachaduras (fúria)',mglow:'Brasa da boca',steam:'Vapor'};

  const Qo=R=>K_.qOf(R);
  // transformação com escala (sx, sy) no quadro local; usada na cabeça (giro da morte achata/vira)
  function xfs(p,a,ox,oy,sx=1,sy=1){ const X=K_.st.CTX, K=PIX.getK(), k=K*SC, c=C(a), s=S(a); X.setTransform(c*k*sx,s*k*sx,-s*k*sy,c*k*sy,(AX+(ox-AX)*SC)*K,(GROUND+(oy-GROUND)*SC)*K); }
  // faixas cilíndricas num membro (quadro local: eixo x de x0 a x1)
  function tube(p,R,x0,x1,w0,w1,ang,hi=1){
    const ly=K_.lightLocal(ang)[1], sd=ly<0?-1:1, Q=Qo(R);
    const st=(f0,f1,col)=>{ p.F(col); p.poly([[x0,sd*w0/2*f0],[x1,sd*w1/2*f0],[x1,sd*w1/2*f1],[x0,sd*w0/2*f1]]); };
    clipPoly([[x0,-w0/2],[x1,-w1/2],[x1,w1/2],[x0,w0/2]],()=>{
      st(-1.1,-0.6,R[3]); st(-0.6,-0.25,R[2]); st(-0.25,0.05,Q[1]); st(0.05,0.4,R[1]); st(0.4,0.8,Q[0]);
      if(hi) st(0.55,0.55+0.25*hi,R[0]);
    });
    return sd;
  }

  /* ---------------- poses ---------------- */
  const REST={hx:0,lift:18,pitch:0,neck:0,head:0,jaw:3,tc:0,tw:5,tph:0,sw:0,roll:0,gait:0,gA:0,spr:0,drop:0,sub:0,
    splash:0,smear:0,impact:0,flash:0,dead:0,roar:0,tongue:0,crack:0,bub:0,hide:0,dz:0,ring:0,glare:0,float:0,ph:0};
  const W=o=>o;
  const roarHead=(n,j,o)=>Object.assign({neck:n,jaw:j,pitch:n*0.3,roar:1,lift:22},o||{});
  const ROLL=k=>({roll:k*0.37,lift:9,hx:24,neck:-2,jaw:6,splash:1,spr:1,smear:1});
  const ANIMS={
    idle:{nome:'Parado (respira, boca entreaberta, cauda balança)',n:8,dur:()=>170,pose:i=>{ const p=i/8*PI*2, s=S(p);
      return {lift:18+1.2*s, pitch:0.8*s, neck:-1+2*S(p-0.7), jaw:4+4*Math.max(0,S(p-0.4)), tw:7, tph:p, tc:1.5*S(p+1), ph:p}; }},
    walk:{nome:'Andar alto (high walk, pés plantados)',n:8,stomp:[2,6],dur:()=>150,pose:i=>{ const p=i/8*PI*2;
      return {gait:i/8, gA:1, lift:19+1.6*C(2*p), pitch:1.2*S(2*p), neck:1.5*S(2*p+0.8), hx:1.5*S(2*p), tw:12, tph:p, jaw:3, ph:p}; }},
    intro:{nome:'Entrada (WARNING): emerge do rio, vira o focinho pro squad e ruge',n:14,
      dur:i=>[420,260,200,150,150,160,170,170,150,130,220,240,260,220][i],pose:i=>[
      W({drop:60,sub:1,bub:1,lift:12}),
      W({drop:60,sub:1,bub:1,lift:12,neck:4}),
      W({drop:44,sub:1,splash:0.5,lift:14,neck:18,jaw:20,pitch:6}),
      W({drop:22,sub:1,splash:1,lift:16,neck:30,jaw:44,pitch:14,smear:1}),
      W({drop:6,sub:0.8,splash:0.7,lift:18,neck:10,jaw:10,pitch:4,impact:1}),
      W({sub:0.55,lift:18,neck:-4,jaw:4,gait:0.25,gA:1}),
      W({sub:0.35,lift:19,neck:-6,jaw:6,gait:0.5,gA:1,hx:4}),
      W({sub:0.2,lift:19,neck:2,head:-4,jaw:8,gait:0.75,gA:1,hx:8}),
      W({sub:0.08,lift:20,neck:8,jaw:20,hx:8,glare:1}),
      roarHead(22,50,{hx:8,glare:1}),
      roarHead(30,70,{hx:8,ring:0.4,glare:1}),
      roarHead(32,72,{hx:8,ring:0.8,glare:1}),
      roarHead(28,64,{hx:8,ring:1,glare:1}),
      W({hx:6,neck:2,jaw:8})][i]},
    bite:{nome:'Mordida (arqueia e abre: cone de aviso; fecha em estalo)',n:10,warn:[0,4],hit:[5,6],reach:90,
      dur:i=>[120,120,120,120,120,60,90,140,150,160][i],pose:i=>[
      W({hx:-4,neck:-4,jaw:12,lift:17}),
      W({hx:-8,neck:12,jaw:36,pitch:8,lift:22,glare:1}),
      W({hx:-10,neck:18,jaw:56,pitch:10,lift:23,roar:1,glare:1}),
      W({hx:-11,neck:20,jaw:64,pitch:11,lift:23,roar:1,glare:1}),
      W({hx:-10,neck:19,jaw:66,pitch:11,lift:23,roar:1,glare:1,tc:4}),
      W({hx:30,neck:-8,jaw:6,pitch:-4,lift:16,smear:1,impact:1,tw:14}),
      W({hx:32,neck:-9,jaw:0,pitch:-5,lift:16,impact:1}),
      W({hx:26,neck:5,head:-6,jaw:4,lift:17}),
      W({hx:16,neck:-4,head:5,jaw:2,lift:18}),
      W({hx:6,neck:0,jaw:3})][i]},
    spin:{nome:'Giro da morte (avisa, morde, prende e gira; arremessa)',n:14,warn:[0,3],grab:4,spin:[5,11],throw:12,
      dur:i=>[175,175,175,175,80,250,250,250,250,250,250,250,150,220][i],pose:i=>{
      if(i>=5&&i<=11) return ROLL(i-4);
      return [
        W({hx:-4,lift:10,neck:-6,jaw:22,pitch:-2}),
        W({hx:-8,lift:8,neck:6,jaw:52,pitch:3,glare:1}),
        W({hx:-10,lift:8,neck:8,jaw:68,pitch:4,roar:1,glare:1}),
        W({hx:-12,lift:8,neck:9,jaw:72,pitch:4,roar:1,glare:1,tc:6}),
        W({hx:24,lift:8,neck:-4,jaw:8,smear:1,impact:1}),
        null,null,null,null,null,null,null,
        W({hx:22,lift:12,neck:30,head:10,jaw:44,pitch:6,smear:1}),
        W({hx:14,lift:16,neck:0,jaw:10})][i]; }},
    tail:{nome:'Rabada (gira o corpo e varre a cauda em área)',n:10,warn:[0,4],hit:[5,6],
      dur:i=>[100,100,100,100,100,70,90,130,140,160][i],pose:i=>[
      W({sw:-0.15,tc:6,neck:-6,lift:17}),
      W({sw:-0.25,tc:10,neck:-8,pitch:-2,lift:16,glare:1}),
      W({sw:-0.32,tc:12,neck:-10,pitch:-3,lift:16,glare:1}),
      W({sw:-0.35,tc:13,neck:-10,pitch:-3,lift:16,glare:1}),
      W({sw:-0.36,tc:14,neck:-11,pitch:-3,lift:16,glare:1}),
      W({sw:0.42,tc:-4,tw:16,tph:2,neck:6,pitch:2,smear:1,impact:1,lift:18,hx:-6}),
      W({sw:0.58,tc:-6,tw:10,tph:3,neck:8,pitch:2,smear:1,impact:1,lift:18,hx:-8}),
      W({sw:0.5,tc:-2,neck:4,lift:18,hx:-6,smear:1}),
      W({sw:0.25,neck:2,hx:-3}),
      W({sw:0.05})][i]},
    dive:{nome:'Mergulho (rola de lado na água: só olhos e dorso)',n:8,warn:[0,2],
      dur:i=>[140,140,140,120,120,120,140,200][i],pose:i=>[
      W({lift:14,neck:-8,sub:0.4,glare:1}),
      W({lift:10,neck:-10,drop:10,sub:1,splash:0.6,glare:1}),
      W({lift:8,neck:-8,drop:24,sub:1,splash:1,roll:0.06}),
      W({lift:8,neck:-4,drop:38,sub:1,splash:0.8,roll:0.03}),
      W({lift:8,neck:0,drop:50,sub:1,splash:0.4}),
      W({lift:8,neck:2,drop:57,sub:1,bub:1}),
      W({lift:8,neck:3,drop:57,sub:1,bub:1}),
      W({lift:8,neck:3,drop:58,sub:1,bub:1})][i]},
    emerge:{nome:'Emersão (irrompe da água com a mordida; recupera vulnerável)',n:10,surge:3,hit:[4,5],vuln:[5,6,7,8,9],
      dur:i=>[130,120,110,110,80,110,170,170,170,170][i],pose:i=>[
      W({lift:8,drop:58,sub:1,bub:1}),
      W({lift:8,drop:56,sub:1,bub:1,neck:8}),
      W({lift:10,drop:40,sub:1,splash:0.6,neck:24,jaw:34,pitch:8}),
      W({lift:16,drop:10,sub:1,splash:1,neck:40,jaw:72,pitch:18,roar:1,smear:1,glare:1}),
      W({lift:16,drop:0,sub:1,splash:0.8,neck:-8,jaw:6,pitch:-6,hx:10,impact:1,smear:1}),
      W({lift:14,sub:0.8,neck:-10,jaw:0,pitch:-6,hx:12,impact:1}),
      W({lift:10,sub:0.6,neck:-12,jaw:14,hx:12,tongue:1,dz:0.2}),
      W({lift:10,sub:0.4,neck:-12,jaw:12,hx:12,tongue:1,dz:0.45}),
      W({lift:12,sub:0.2,neck:-8,jaw:8,hx:10,dz:0.7}),
      W({lift:16,neck:-2,jaw:4,hx:8})][i]},
    roar:{nome:'Rugido (fúria: afasta o squad e chama piranhas)',n:9,warn:[0,4],call:5,
      dur:i=>[130,140,150,150,130,120,200,180,170][i],pose:i=>[
      W({neck:6,jaw:10,lift:19}),
      roarHead(16,30,{roar:0,glare:1}),
      roarHead(26,50,{glare:1}),
      roarHead(32,64,{glare:1}),
      roarHead(34,68,{glare:1,tc:6}),
      roarHead(36,74,{ring:0.4,glare:1,impact:1}),
      roarHead(34,72,{ring:0.9,glare:1}),
      W({neck:14,jaw:30,lift:20,pitch:3}),
      W({neck:2,jaw:6})][i]},
    rage:{nome:'Entrar em fúria (rachaduras acendem, vapor)',n:10,dur:i=>[160,140,140,140,160,160,160,180,200,220][i],pose:i=>[
      W({lift:12,neck:-10,jaw:10,crack:0.1}),
      W({lift:10,neck:-12,jaw:14,crack:0.3,hx:-2}),
      W({lift:10,neck:-12,jaw:14,crack:0.5,hx:2}),
      W({lift:14,neck:4,jaw:30,crack:0.7,pitch:4}),
      roarHead(24,56,{crack:0.9,ring:0.3,glare:1}),
      roarHead(32,72,{crack:1,ring:0.7,glare:1,impact:1}),
      roarHead(34,74,{crack:1,ring:1,glare:1}),
      roarHead(26,60,{crack:1,glare:1}),
      W({neck:8,jaw:20,crack:1,lift:19}),
      W({neck:0,jaw:6,crack:1})][i]},
    dazed:{nome:'Zonzo (bate a cabeça, língua pra fora: VULNERÁVEL)',n:8,loop:1.8,dur:()=>150,pose:i=>{ const p=i/8*PI*2;
      return {lift:6+1.5*S(p), neck:-12+3*S(p+1), head:3*S(p*2), jaw:16+4*S(p), tongue:1, dz:i/8, pitch:-2+1.4*S(p), tw:4, tph:p, spr:0.5}; }},
    hurt:{nome:'Dano',n:4,dur:i=>[80,110,130,160][i],pose:i=>[
      W({flash:1,hx:-8,neck:12,jaw:34,pitch:5,roar:1,lift:20,tc:6}),
      W({hx:-5,neck:7,jaw:20,pitch:3,lift:19}),
      W({hx:-2,neck:2,jaw:8}),
      W({})][i]},
    fall:{nome:'Derrubado (tomba de lado)',n:6,dur:i=>[80,110,130,160,200,240][i],pose:i=>[
      W({flash:1,hx:-6,neck:12,jaw:30,lift:16}),
      W({hx:-8,roll:0.08,neck:10,jaw:24,lift:10,spr:0.5}),
      W({hx:-10,roll:0.18,neck:4,jaw:20,lift:4,spr:1,impact:1}),
      W({hx:-10,roll:0.24,neck:-2,jaw:16,lift:0,spr:1}),
      W({hx:-10,roll:0.25,neck:-4,jaw:14,lift:0,spr:1}),
      W({hx:-10,roll:0.25,neck:-4,jaw:12,lift:0,spr:1})][i]},
    getup:{nome:'Levantar',n:6,dur:()=>140,pose:i=>[
      W({hx:-10,roll:0.22,lift:0,spr:1,neck:-2,jaw:10}),
      W({hx:-9,roll:0.15,lift:2,spr:1,neck:2,jaw:8}),
      W({hx:-7,roll:0.07,lift:6,spr:0.6,neck:6,jaw:10}),
      W({hx:-5,lift:12,neck:8,jaw:12,impact:1}),
      W({hx:-2,lift:17,neck:4,jaw:6}),
      W({})][i]},
    tumble:{nome:'Rolando no ar',n:4,dur:()=>90,pose:i=>({roll:i*0.25,lift:14,spr:1,jaw:20,neck:6})},
    grabbed:{nome:'Agarrado (se debate)',n:4,dur:()=>110,pose:i=>({lift:16,neck:10*S(i*PI/2),jaw:20+10*(i%2),tw:16,tph:i*PI/2,hx:2*S(i*PI)})},
    death:{nome:'Morte (tomba, rola de barriga, a cauda estala, afunda; o aguapé flutua)',n:14,
      dur:i=>[90,170,170,160,150,150,180,110,170,200,240,280,420,800][i],pose:i=>[
      W({flash:1,hx:-8,neck:14,jaw:40,pitch:6,roar:1,lift:20}),
      roarHead(30,70,{hx:-6,glare:1}),
      W({hx:-6,neck:-14,jaw:30,lift:14,pitch:-4}),
      W({hx:-8,neck:-10,jaw:28,lift:8,roll:0.12,spr:0.6}),
      W({hx:-10,neck:-6,jaw:26,lift:4,roll:0.26,spr:1,impact:1}),
      W({hx:-10,neck:-4,jaw:24,lift:2,roll:0.4,spr:1}),
      W({hx:-10,neck:-2,jaw:22,lift:0,roll:0.5,spr:1,impact:1}),
      W({hx:-10,neck:-2,jaw:22,lift:0,roll:0.5,spr:1,tc:16,tw:18,tph:1,impact:1,smear:1}),
      W({hx:-10,neck:-2,jaw:24,lift:0,roll:0.5,spr:1,tc:-4}),
      W({hx:-10,neck:-3,jaw:26,lift:0,roll:0.5,spr:1,sub:0.5,drop:6}),
      W({hx:-10,neck:-3,jaw:26,lift:0,roll:0.5,spr:1,sub:1,drop:20,bub:1}),
      W({hx:-10,neck:-3,jaw:26,lift:0,roll:0.5,spr:1,sub:1,drop:36,bub:1,dead:0.5}),
      W({hx:-10,neck:-3,jaw:26,lift:0,roll:0.5,spr:1,sub:1,drop:52,bub:1,dead:0.8,float:0.6}),
      W({hx:-10,neck:-3,jaw:26,lift:0,roll:0.5,spr:1,sub:1,drop:76,dead:1,float:1})][i]},
    xAgua:{nome:'Lâmina d\'água (bolhas, marola, coluna, espuma)',n:4,prop:true,dur:()=>100,pose:i=>({st:i})},
    xOnda:{nome:'Onda da rabada (fúria)',n:3,prop:true,dur:()=>90,pose:i=>({st:i})},
  };

  /* ---------------- esqueleto ----------------
     Tronco: nós em x local (-38 pelve … +36 ombro), meia-altura de cima (ht) e de baixo (hb, barriga cheia).
     Pescoço: 2 nós de 10 u. Cauda: 8 segmentos de 14,5 u que deitam no chão. Varrida (sw) gira a cauda em volta
     do eixo vertical da pelve e a profundidade vira deslocamento pra baixo na tela. */
  const TR=[[-50,36,34],[-34,44,41],[-17,50,48],[0,53,50],[17,52,46],[33,46,39],[46,39,34]];
  const TAILH=[35,30,25.5,21,16.5,12.5,8.8,5.4,2.4];
  const LEGS=[
    {id:'fN',at:[30,32],L1:20,L2:17,bend:-1,base:14,far:false,ph:0,front:true},
    {id:'fF',at:[24,16],L1:19,L2:16,bend:-1,base:20,far:true,ph:0.5,front:true},
    {id:'hN',at:[-38,32],L1:22,L2:19,bend:1,base:-12,far:false,ph:0.5,front:false},
    {id:'hF',at:[-44,16],L1:21,L2:18,bend:1,base:-4,far:true,ph:0,front:false}];
  function ik2(S0,Wt,L1,L2,bend){
    const dx=Wt.x-S0.x, dy=Wt.y-S0.y, d0=Math.hypot(dx,dy), d=Math.max(Math.abs(L1-L2)+0.5,Math.min(L1+L2-0.3,d0));
    const base=Math.atan2(dy,dx), A=Math.acos(Math.max(-1,Math.min(1,(L1*L1+d*d-L2*L2)/(2*L1*d))));
    const e1=P2(S0.x+C(base-A)*L1,S0.y+S(base-A)*L1), e2=P2(S0.x+C(base+A)*L1,S0.y+S(base+A)*L1);
    const E=bend>0?(e1.x>e2.x?e1:e2):(e1.x<e2.x?e1:e2);
    return {E,W:P2(S0.x+C(base)*d,S0.y+S(base)*d)};
  }
  function skeleton(P){
    const th=P.roll*PI*2, up=Math.max(0,C(th)), DR=P.drop*DK, cy=GROUND-P.lift*LK-50+DR, cx=AX+P.hx, a=rad(-(P.pitch+PITCH0*up)), ca=C(a), sa=S(a);
    const T=(lx,ly)=>P2(cx+lx*ca-ly*sa, cy+lx*sa+ly*ca);
    // tronco + pescoço
    const trunk=TR.map(([lx,ht,hb])=>Object.assign(T(lx,0),{ht,hb}));
    const sh=trunk[trunk.length-1], nk=P.neck+NECK0*up, a1=a-rad(nk*0.5), a2=a-rad(nk);
    const n1=Object.assign(P2(sh.x+C(a1)*11,sh.y+S(a1)*11),{ht:34,hb:31}), N=Object.assign(P2(n1.x+C(a2)*11,n1.y+S(a2)*11),{ht:28,hb:27});
    const ha=a2-rad(P.head);
    // cauda (da pelve pra trás)
    const pel=trunk[0], tail=[Object.assign(P2(pel.x,pel.y),{ht:TAILH[0]*0.92,hb:TAILH[0],c:0})];
    let ang=a+PI, x=pel.x, y=pel.y;
    for(let i=1;i<=8;i++){
      const d=-15+i*3.2+P.tc*(0.35+i*0.12)+P.tw*S(P.tph-i*0.8)*(i/8);
      ang=a+PI+rad(d)*1; x+=C(ang)*13; y+=S(ang)*13;
      if(P.sub<0.5){ const gy=GROUND-TAILH[i]*0.95-1; if(y>gy) y=gy; }
      tail.push(Object.assign(P2(x,y),{ht:TAILH[i]*0.92,hb:TAILH[i],c:0}));
    }
    const sa_=rad(P.sw*120), cs=C(sa_), sn=S(sa_);
    if(P.sw) tail.forEach(n=>{ const dx=n.x-pel.x, c=-dx*sn; n.x=pel.x+dx*cs; n.y+=c*0.34; n.c=c; const k=1+c*0.0025; n.ht*=k; n.hb*=k; });
    // patas (IK, pés plantados)
    const legs=LEGS.map(L=>{
      const jt=T(L.at[0],L.at[1]); if(!L.far) jt.y+=5*up;
      let tgt;
      const ph=(P.gait+L.ph)*PI*2;
      if(Math.abs(S(th))>0.2||Math.abs(C(th)+1)<0.5){ // girando: patas saem radiais do eixo
        const phi=(L.far?-1:1)*rad(112)+th, r=(L.front?30:32);
        const j2=P2(jt.x, cy-C(phi)*r*0.85+(L.front?0:0)); jt.x+=0; jt.y=j2.y;
        const fl=S(P.ph*3+(L.far?1:0)+(L.front?2:0))*3;
        tgt=P2(jt.x+L.base*0.4+fl, jt.y-C(phi)*(L.L1+L.L2)*0.8);
        if(P.sub<0.5){ jt.y=Math.min(jt.y,GROUND-10+DR); if(tgt.y>GROUND-3+DR) tgt=P2(tgt.x+(tgt.y-(GROUND-3+DR))*0.6*(L.front?1:-1),GROUND-3+DR); }
        L._depth=S(phi);
      } else {
        tgt=P2(jt.x+L.base+P.gA*11*C(ph), GROUND-4+DR-P.gA*8*Math.max(0,S(ph)));
        if(P.spr){ const sp=P2(jt.x+L.base*0.5+(L.front?6:-6), jt.y+12); tgt=lerp(tgt,sp,P.spr*0.7); }
        L._depth=L.far?-1:1;
      }
      const r=ik2(jt,tgt,L.L1,L.L2,L.bend);
      return {L,jt,E:r.E,W:r.W,lift:P.gA*Math.max(0,S(ph)),depth:L._depth};
    });
    // cabeça: escala vertical pelo giro (de barriga pra cima vira de cabeça pra baixo)
    let sy=C(th); if(Math.abs(sy)<0.38) sy=0.38*(sy<0?-1:1);
    const H=(lx,ly)=>{ const c=C(ha), s=S(ha); lx*=HSX; ly*=HSY*sy; return P2(N.x+lx*c-ly*s, N.y+lx*s+ly*c); };
    return {P,th,T,cx,cy,a,trunk,n1,N,ha,hsy:sy,H,tail,legs,pel};
  }

  /* ---------------- tubo do corpo ----------------
     Faixas ao longo da coluna (v = -1 em cima … +1 embaixo). O material de cada faixa sai do ângulo da superfície
     menos o giro (roll): dorso/osteodermos em cima, flanco amarelado, ventre embaixo; o tom sai da luz (de cima). */
  function smooth(nodes,sub=3){
    const out=[]; const n=nodes.length; const g=i=>nodes[Math.max(0,Math.min(n-1,i))];
    for(let i=0;i<n-1;i++){ const p0=g(i-1),p1=g(i),p2=g(i+1),p3=g(i+2);
      for(let k=0;k<sub;k++){ const t=k/sub, t2=t*t, t3=t2*t;
        const cr=(a,b,c,d)=>0.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t2+(-a+3*b-3*c+d)*t3);
        out.push({x:cr(p0.x,p1.x,p2.x,p3.x),y:cr(p0.y,p1.y,p2.y,p3.y),ht:Math.max(1,cr(p0.ht,p1.ht,p2.ht,p3.ht)),hb:Math.max(1,cr(p0.hb,p1.hb,p2.hb,p3.hb))}); } }
    out.push(Object.assign({},nodes[n-1]));
    const L=[0]; for(let i=1;i<out.length;i++) L.push(L[i-1]+Math.hypot(out[i].x-out[i-1].x,out[i].y-out[i-1].y));
    out.forEach((q,i)=>{ const a=out[Math.max(0,i-1)], b=out[Math.min(out.length-1,i+1)], an=Math.atan2(b.y-a.y,b.x-a.x); q.nx=-S(an); q.ny=C(an); q.s=L[i]/(L[L.length-1]||1); });
    return out;
  }
  function off(q,v){ const h=v<0?q.ht:q.hb; return [q.x+q.nx*v*h, q.y+q.ny*v*h]; }
  function at(ns,s,v){ let i=1; while(i<ns.length-1&&ns[i].s<s) i++; const a=ns[i-1], b=ns[i], t=Math.max(0,Math.min(1,(s-a.s)/((b.s-a.s)||1)));
    const q={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,ht:a.ht+(b.ht-a.ht)*t,hb:a.hb+(b.hb-a.hb)*t,nx:a.nx+(b.nx-a.nx)*t,ny:a.ny+(b.ny-a.ny)*t}; return off(q,v); }
  function strip(ns,v0,v1,s0=0,s1=1){ const A=[],B=[]; ns.forEach(q=>{ if(q.s<s0-0.02||q.s>s1+0.02) return; A.push(off(q,v0)); B.push(off(q,v1)); }); return A.concat(B.reverse()); }
  function quad(ns,s0,s1,v0,v1,sk=0){ return [at(ns,s0,v0),at(ns,s1,v0),at(ns,s1+sk,v1),at(ns,s0+sk,v1)]; }
  const BANDS=[[-1.12,-0.74,'L'],[-0.74,-0.46,'q0'],[-0.46,-0.08,'b'],[-0.08,0.28,'b'],[0.28,0.56,'q1'],[0.56,0.8,'s'],[0.8,1.12,'d']];
  function matAt(v,th){ const phi=Math.acos(Math.max(-1,Math.min(1,-v))); let mu=Math.abs(((phi-th)%(2*PI)+3*PI)%(2*PI)-PI)*180/PI; return mu<80?'hide':mu<118?'flank':'belly'; }
  function toneOf(M,k,t){ const R=M[k], Q=M[k+'Q']; return t==='L'?R[0]:t==='q0'?Q[0]:t==='b'?R[1]:t==='q1'?Q[1]:t==='s'?R[2]:R[3]; }

  // elipse ao longo da superfície entre s0..s1 e v0..v1 (centro, raios, ângulo da coluna, normal pra cima)
  function ovalAt(ns,s0,s1,v0,v1){ const a=at(ns,s0,(v0+v1)/2), b=at(ns,s1,(v0+v1)/2), sm=(s0+s1)/2, t=at(ns,sm,v0), u=at(ns,sm,v1);
    const L=Math.hypot(b[0]-a[0],b[1]-a[1]), H=Math.hypot(u[0]-t[0],u[1]-t[1]); if(L<1.2||H<1.2) return null;
    return {x:(a[0]+b[0])/2,y:(a[1]+b[1])/2,rx:L/2-0.4,ry:H/2-0.4,a:Math.atan2(b[1]-a[1],b[0]-a[0]),ux:(t[0]-u[0])/H,uy:(t[1]-u[1])/H}; }
  // fileiras de escamas em blocos arredondados de tamanhos variados, desencontradas por linha; tom pela altura (luz quente em cima, sombra fria embaixo)
  function scales(p,M,ns,th,isTail,rolledMode){
    const rowsV=[-0.72,-0.5,-0.3,-0.1,0.1,0.32,0.56,0.82];
    for(let ri=0;ri<rowsV.length-1;ri++){ const v0=rowsV[ri], v1=rowsV[ri+1], vm=(v0+v1)/2, k=matAt(vm,th); if(rolledMode&&k==='belly') continue;
      const R=M[k], Qk=Qo(R), base=vm<-0.4?0:vm<0?1:vm<0.4?2:3; let s=0.01+rnd(61,ri)*0.02, j=0;
      while(s<0.985){ const L=(isTail?0.07:0.055)*(0.6+rnd(71+ri,j)*0.8), r=rnd(81+ri,j++);
        const tone=[[R[0],Qk[0],R[1]],[Qk[0],R[1],Qk[1]],[R[1],Qk[1],R[2]],[Qk[1],R[2],R[3]]][base][r<0.2?0:r<0.85?1:2];
        const e=ovalAt(ns,s+0.002,s+L-0.002,v0+0.01,v1-0.01);
        if(e){ p.F(R[base<2?2:3]); p.ell(e.x-e.ux*0-0,e.y+0.8,e.rx,e.ry,e.a); p.F(tone); p.ell(e.x,e.y,e.rx,e.ry*0.92,e.a);
          if(base<2&&r>0.5){ p.F(base?Qk[0]:R[0]); p.ell(e.x+e.ux*e.ry*0.4,e.y+e.uy*e.ry*0.4,e.rx*0.55,Math.max(0.5,e.ry*0.25),e.a); } }
        s+=L; } }
  }
  function drawBody(p,M,sk,P,form,ns,isTail){
    p.id(); const th=sk.th, rolled=Math.abs(S(th))>0.45||C(th)<0.5, fur=form==='furia';
    const sil=strip(ns,-1,1);
    p.F(M.hide[1]); p.poly(sil);
    clipPoly(sil,()=>{
      BANDS.forEach(([v0,v1,t])=>{ const k=matAt((v0+v1)/2,th); p.F(toneOf(M,k,t)); p.poly(strip(ns,v0,v1)); });
      if(rolled) scales(p,M,ns,th,isTail,true);
      if(rolled){ // ventre pra cima: placas transversais creme em fileiras, com volume (claro no meio, sombra nas bordas)
        const st=isTail?0.05:0.032, Bq=Qo(M.belly);
        for(let s=0.02;s<0.98;s+=st){ for(let v=-1.05;v<1.05;v+=0.3){ const vm=v+0.15; if(matAt(vm,th)!=='belly') continue;
          const dc=Math.abs(vm-C(th)), alt=Math.floor(s/st)%2, tone=dc<0.4?(alt?M.belly[0]:Bq[0]):dc<0.75?(alt?Bq[0]:M.belly[1]):(alt?M.belly[1]:Bq[1]);
          p.F(M.belly[2]); p.poly(quad(ns,s,s+st,v,v+0.3)); p.F(tone); p.poly(quad(ns,s+st*0.1,s+st*0.9,v+0.03,v+0.27)); } }
        return;
      }
      scales(p,M,ns,th,isTail,false);
      // barras escuras irregulares (manchas quebradas, larguras e alturas diferentes; algumas falham)
      const bars=isTail?[[0.12,0.05,0.4],[0.36,0.06,0.6],[0.6,0.045,0.5],[0.82,0.05,0.7]]:[[0.14,0.05,-0.2],[0.66,0.04,-0.35]];
      bars.forEach(([s,w,vb],bi)=>{ for(let k=0;k<5;k++){ const v0=-1.1+k*0.3, v1=v0+0.32; if(v0>vb) break; const j=(rnd(bi+3,k)-0.5)*w*0.9, ww=w*(0.55+rnd(bi+7,k)*0.6);
        p.F(k<1?M.bar[1]:k<3?M.bar[2]:M.bar[3]); p.poly(quad(ns,s+j,s+j+ww,v0,Math.min(v1,vb+0.1),0.006)); } });
      // osteodermos: 2 fileiras de placas arredondadas, comprimentos variados, quilha clara
      [[-1.0,-0.8],[-0.8,-0.6]].forEach(([va,vb],r)=>{ let s=0.01+r*0.012, j=0;
        while(s<0.985){ const L=(isTail?0.04:0.026)*(0.7+rnd(41+r,j++)*0.7); if(isTail&&s>0.6&&r===1) break;
          const e=ovalAt(ns,s,s+L,va,vb); if(e){ p.F(M.scute[3]); p.ell(e.x+0.5,e.y+0.7,e.rx+0.6,e.ry+0.5,e.a); p.F(r?Qo(M.scute)[0]:M.scute[1]); p.ell(e.x,e.y,e.rx,e.ry,e.a); p.F(M.scute[0]); p.ell(e.x-e.ux*e.ry*0.35,e.y-e.uy*e.ry*0.35,e.rx*0.5,Math.max(0.6,e.ry*0.3),e.a);
            if(fur&&P.crack>0.05&&(j+r)%2===0){ p.F(M.glow[2]); p.ell(e.x+e.ux*0.5,e.y+e.uy*0.5,e.rx*0.2,e.ry*0.9,e.a); } }
          s+=L; } });
      if(!isTail){ // costelas expostas no flanco (buraco rasgado) + cicatrizes
        const s0=0.43, s1=0.55;
        const hole=[at(ns,s0,-0.22),at(ns,(s0+s1)/2,-0.3),at(ns,s1,-0.18),at(ns,s1+0.02,0.2),at(ns,(s0+s1)/2+0.02,0.42),at(ns,s0-0.01,0.3)];
        p.F(M.flesh[2]); p.poly(hole.map(q=>[q[0],q[1]]));
        const inner=[at(ns,s0+0.015,-0.14),at(ns,(s0+s1)/2,-0.2),at(ns,s1-0.01,-0.1),at(ns,s1+0.005,0.16),at(ns,(s0+s1)/2+0.01,0.32),at(ns,s0+0.01,0.22)];
        p.F(M.flesh[3]); p.poly(inner); p.F(M.flesh[2]); p.poly([inner[0],inner[1],inner[2],at(ns,s1-0.02,0.0),at(ns,s0+0.02,0.04)]);
        for(let k=0;k<3;k++){ const s=s0+0.024+k*0.034;
          p.F(M.bone[2]); p.poly(quad(ns,s,s+0.016,-0.2,0.3,0.012)); p.F(M.bone[1]); p.poly(quad(ns,s,s+0.011,-0.2,0.24,0.01)); p.F(M.bone[0]); p.poly(quad(ns,s+0.002,s+0.006,-0.18,0.05,0.004)); }
        p.F(M.flesh[0]); [[s0+0.01,-0.2],[s1-0.03,-0.26],[s1+0.012,0.08]].forEach(([s,v])=>{ const q=at(ns,s,v); p.rect(q[0]-1,q[1]-0.6,2.4,1.2); });
        stain(p,M.blood,at(ns,(s0+s1)/2,0.42)[0],at(ns,(s0+s1)/2,0.42)[1],2.4,2,5);
        p.F(Qo(M.flank)[0]); [[0.72,0.0,0.82,0.12],[0.2,-0.1,0.28,0.06]].forEach(([sa,va,sb,vb])=>{ const a=at(ns,sa,va), b=at(ns,sb,vb); p.cap(P2(a[0],a[1]),P2(b[0],b[1]),1.2,1.2); });
        // dobras da garganta/pescoço (pele frouxa)
        p.F(M.belly[3]); [[0.86,0.35],[0.9,0.45],[0.94,0.5]].forEach(([s,v])=>{ const a=at(ns,s,v), b=at(ns,s+0.03,v+0.35); p.cap(P2(a[0],a[1]),P2(b[0],b[1]),1,1); });
      }
    });
    if(rolled) return;
    // nós das placas acima da silhueta (quilhas) e crista da cauda
    if(isTail){
      for(let s=0.02;s<0.98;s+=0.04){ const h=(7*(1-s)+2.5), q=at(ns,s,-1), n=ns[Math.min(ns.length-1,Math.round(s*(ns.length-1)))];
        const ux=-n.nx, uy=-n.ny, tx=n.ny, ty=-n.nx;
        if(s<0.62){ const q2=at(ns,s+0.02,-1); p.F(M.scute[3]); p.poly([[q2[0]-tx*2.6,q2[1]-ty*2.6],[q2[0]+ux*h*0.9,q2[1]+uy*h*0.9],[q2[0]+tx*2.6,q2[1]+ty*2.6]]); }
        p.F(M.scute[2]); p.poly([[q[0]-tx*3,q[1]-ty*3],[q[0]+ux*h,q[1]+uy*h],[q[0]+tx*3,q[1]+ty*3]]);
        p.F(M.scute[1]); p.poly([[q[0]-tx*2.4,q[1]-ty*2.4],[q[0]+ux*h*0.95,q[1]+uy*h*0.95],[q[0],q[1]]]);
        p.F(M.scute[0]); p.poly([[q[0]-tx*1.2+ux*h*0.4,q[1]-ty*1.2+uy*h*0.4],[q[0]+ux*h*0.9,q[1]+uy*h*0.9],[q[0]-tx*0.2+ux*h*0.45,q[1]-ty*0.2+uy*h*0.45]]); }
    } else {
      // calombos dos osteodermos quebrando a linha do dorso (2 fileiras desencontradas, tamanhos variados)
      [[0.98,0.035,0],[0.86,0.05,0.5]].forEach(([vv,st,o],r)=>{ for(let s=0.03+o*st;s<0.95;s+=st){ const q=at(ns,s,-vv), n=ns[Math.min(ns.length-1,Math.round(s*(ns.length-1)))], ux=-n.nx, uy=-n.ny, an=Math.atan2(n.ny,n.nx)-PI/2;
        const rr=(r?2.4:3)+rnd(29+r,Math.floor(s*200))*1.4, cx=q[0]+ux*rr*0.35, cy=q[1]+uy*rr*0.35;
        p.F(M.scute[3]); p.ell(cx+0.4,cy+0.6,rr*1.25,rr*0.95,an); p.F(r?M.scute[2]:M.scute[1]); p.ell(cx,cy,rr*1.1,rr*0.8,an); p.F(M.scute[0]); p.ell(cx-ux*0-0.6,cy-rr*0.35,rr*0.55,rr*0.3,an); } });
    }
  }
  // rachaduras luminosas (camada emissiva da fúria)
  function drawCracks(p,M,ns,P,seed,isTail){
    if(P.crack<0.05) return; p.id(); const G=M.glow, n=isTail?6:9;
    for(let k=0;k<n;k++){ const s=0.05+k/n*0.9+rnd(seed,k)*0.04, v=-0.9+rnd(seed,k+3)*0.7;
      const pts=[at(ns,s,v),at(ns,s+0.02,v+0.18),at(ns,s+0.01,v+0.34),at(ns,s+0.035,v+0.5*P.crack)];
      p.F(G[2]); bandA(p,pts,1.6); p.F(G[0]); bandA(p,pts.slice(0,3),0.7); }
  }

  /* ---------------- patas ---------------- */
  function drawLeg(p,M,lg,P){
    const {L,jt,E,W:Wr}=lg, R=M.hide, k=L.front?1.35:1.55, Qr=Qo(R);
    // ombro/coxa: massa arredondada saindo do corpo, luz em cima e sombra fria embaixo
    { const ang=Math.atan2(E.y-jt.y,E.x-jt.x); xfs(p,0,jt.x,jt.y); const rx=(L.front?11:14)*k, ry=(L.front?9:11)*k, ox=L.front?-2:3, oy=-3*k;
      p.F(R[3]); p.ell(ox+0.8,oy+2,rx,ry); p.F(R[2]); p.ell(ox,oy+0.8,rx*0.98,ry*0.94); p.F(Qr[1]); p.ell(ox-0.5,oy-0.6,rx*0.85,ry*0.72); p.F(R[1]); p.ell(ox-1.2,oy-1.8,rx*0.66,ry*0.5);
      p.F(Qr[0]); p.ell(ox-2.4,oy-ry*0.45,rx*0.38,ry*0.18);
      p.F(R[2]); [[-0.4,0.1],[0.2,0.35],[0.45,-0.05],[-0.1,-0.35]].forEach(([a,b])=>p.ell(ox+a*rx,oy+b*ry,2.2,1.4)); }
    { const ang=Math.atan2(E.y-jt.y,E.x-jt.x), Ln=Math.hypot(E.x-jt.x,E.y-jt.y); xfs(p,ang,jt.x,jt.y);
      p.F(R[2]); p.cap(P2(0,0),P2(Ln,0),17*k,12*k); tube(p,R,-2,Ln,17*k,12*k,ang,1);
      p.F(R[3]); [[0.3,-4],[0.45,1],[0.6,-2],[0.75,3]].forEach(([t,y])=>p.rect(Ln*t,y*k,2.4,1.6));
      p.F(Qo(R)[0]); [[0.3,-3],[0.52,-4],[0.74,-2.6]].forEach(([t,y])=>p.rect(Ln*t+1.4,y*k,2,1)); }
    { const ang=Math.atan2(Wr.y-E.y,Wr.x-E.x), Ln=Math.hypot(Wr.x-E.x,Wr.y-E.y); xfs(p,ang,E.x,E.y);
      p.F(R[2]); p.cap(P2(0,0),P2(Ln,0),12*k,7*k); tube(p,M.hide,-1,Ln,12*k,7*k,ang,0.8);
      p.F(M.flank[2]); p.poly([[2,4*k],[Ln,3.2*k],[Ln,4.4*k],[2,6*k]]);
      p.F(R[3]); [[0.35,-2],[0.6,1.5],[0.8,-1]].forEach(([t,y])=>p.rect(Ln*t,y*k,2,1.4)); }
    // pé com dedos abertos e garras
    p.id(); const lift=lg.lift, tilt=lift*0.5, toes=(L.front?[[13,-0.5],[12,3],[7,5.6],[1,6.4],[-6,4.4]]:[[18,-0.5],[16,3.6],[10,6.4],[3,7.2],[-4,5]]).map(([x,y])=>[x*1.25,y*1.2]);
    const w0=L.front?4.6:5.2, rolled=lg.depth!==1&&lg.depth!==-1;
    const fx=(dx,dy)=>rolled?P2(Wr.x+dx*0.5,Wr.y-dy-Math.abs(dx)*0.3):P2(Wr.x+dx,Wr.y+dy-tilt*dx*0.12);
    if(!L.front&&!rolled){ p.F(M.hide[3]); p.poly([[Wr.x,Wr.y+1]].concat(toes.map(([dx,dy])=>{ const q=fx(dx*0.86,dy); return [q.x,q.y]; }))); }
    p.F(R[2]); p.ell(Wr.x+2,Wr.y+1,5.4*k,3.6*k);
    toes.forEach(([dx,dy],i)=>{ const tip=fx(dx,dy), b=P2(Wr.x+dx*0.2,Wr.y+dy*0.4);
      p.F(R[3]); p.cap(b,tip,w0+1,w0*0.7+1); p.F(R[1]); p.cap(P2(b.x,b.y-0.6),P2(tip.x,tip.y-0.6),w0*0.7,w0*0.45); p.F(Qo(R)[0]); p.rect(b.x+(tip.x-b.x)*0.4,b.y+(tip.y-b.y)*0.4-1.6,2,1);
      const c2=P2(tip.x+(tip.x>b.x?2.4:-2.4),tip.y+1.4); p.F(M.claw[3]); p.cap(tip,c2,2.2,0.8); p.F(M.claw[1]); p.cap(P2(tip.x,tip.y-0.4),P2(c2.x,c2.y-0.4),1.2,0.4); });
    p.F(R[0]); p.rect(Wr.x-2,Wr.y-2,4,1);
  }

  /* ---------------- cabeça ----------------
     Quadro da cabeça: origem na nuca (N), x pra frente. Perfil do crânio com olho alto e arcada; o lábio de cima é
     ondulado; a mandíbula gira na articulação (-4, 9). */
  const HD=[[-8,-18],[2,-21],[6,-26],[10,-33.5],[18,-37],[26,-33],[29,-22],[36,-16.5],[46,-13.5],[53,-13.5],[57,-16.5],[61,-15.5],[65,-10.5],[67.5,-4],[66.5,1],[63,3],[56,3.6],[48,2],[40,4.6],[30,6.2],[20,4.6],[10,6.6],[2,9],[-6,11],[-10,4]];
  const LIP=[[63,3],[56,3.6],[48,2],[40,4.6],[30,6.2],[20,4.6],[10,6.6],[2,9]];
  const HINGE=[-4,9];
  const JW=[[6,-2.4],[16,-3.2],[28,-4],[40,-4],[52,-4.8],[62,-5.4],[68,-4],[68.5,0],[63,3.4],[50,6.4],[36,9],[22,12],[10,14],[0,15],[-6,12],[-8,6],[-4,0]];
  const GUM=[[6,-2.4],[16,-3.2],[28,-4],[40,-4],[52,-4.8],[62,-5.4],[68,-4]];
  const lipY=x=>{ for(let i=0;i<LIP.length-1;i++){ const a=LIP[i], b=LIP[i+1]; if(x<=a[0]&&x>=b[0]){ const t=(a[0]-x)/((a[0]-b[0])||1); return a[1]+(b[1]-a[1])*t; } } return 6; };
  const gumY=x=>{ for(let i=0;i<GUM.length-1;i++){ const a=GUM[i], b=GUM[i+1]; if(x>=a[0]&&x<=b[0]){ const t=(x-a[0])/((b[0]-a[0])||1); return a[1]+(b[1]-a[1])*t; } } return -3; };
  function jawPt(P,q){ const a=rad(P.jaw*JK), c=C(a), s=S(a); return [HINGE[0]+q[0]*c-q[1]*s, HINGE[1]+q[0]*s+q[1]*c]; }
  function headXf(p,sk){ xfs(p,sk.ha,sk.N.x,sk.N.y,HSX,HSY*sk.hsy); }

  function drawMouth(p,M,sk,P,form){
    if(P.jaw<5) return; headXf(p,sk); const fur=form==='furia';
    const g=GUM.map(q=>jawPt(P,q)), mouth=LIP.concat([[-6,10],jawPt(P,[-2,4])]).concat(g);
    const Q=Qo(M.mouth), Hx=-6, Hy=8;
    // anel em volta da garganta (articulação): fundo quase preto, depois vermelho escuro, rosado claro na frente
    const ring=(r)=>{ const pts=[]; for(let d=-60;d<=150;d+=10) pts.push([Hx+C(rad(d))*r,Hy+S(rad(d))*r]); for(let d=150;d>=-60;d-=10) pts.push([Hx+C(rad(d))*140,Hy+S(rad(d))*140]); return pts; };
    p.F(M.mouth[3]); p.poly(mouth);
    clipPoly(mouth,()=>{
      [[18,Q[2]],[30,M.mouth[2]],[44,Q[1]],[58,M.mouth[1]],[72,Q[0]]].forEach(([r,c])=>{ p.F(c); p.poly(ring(r)); });
      // céu da boca: faixa rosada clara junto ao lábio de cima (frente), escurecendo pro fundo, com cristas transversais
      const pal=(x0,w)=>LIP.filter(q=>q[0]>x0).map(q=>[q[0],q[1]-2]).concat(LIP.filter(q=>q[0]>x0).reverse().map(q=>[q[0]-3,q[1]+w*(0.4+0.6*Math.min(1,(q[0]-x0)/30))]));
      p.F(Q[1]); p.poly(pal(4,10)); p.F(M.mouth[1]); p.poly(pal(14,6.5)); p.F(Q[0]); p.poly(pal(26,4)); p.F(M.mouth[0]); p.poly(pal(40,2.2));
      // assoalho claro junto aos dentes de baixo
      p.F(Q[1]); p.poly(GUM.map(q=>jawPt(P,[q[0],q[1]-1])).concat(GUM.slice().reverse().map(q=>jawPt(P,[q[0]-2,q[1]-7]))));
      p.F(Q[1]); for(let x=24;x<60;x+=8){ const y=lipY(x); p.poly([[x,y+2.4],[x+3.4,y+2.2],[x+2.4,y+5+(60-x)*0.05],[x-0.6,y+4.8+(60-x)*0.05]]); }
      // sombra da garganta subindo do fundo
      p.F(M.mouth[3]); p.poly([[-14,-6],[4,-1],[10,6],jawPt(P,[10,-5]),jawPt(P,[0,0]),[-14,30]]);
      // fileiras de dentes do outro lado da boca (escuras, recuadas)
      [[22,3],[30,4],[38,3.4],[46,5],[54,3.6]].forEach(([x,L])=>{ const y=lipY(x)+1.4; p.F(M.teeth[3]); p.poly([[x-1.4+3,y],[x+1.4+3,y],[x+3.2,y+L]]); p.F(M.teeth[2]); p.poly([[x-1.4+3,y],[x+3,y],[x+3.2,y+L*0.8]]); });
      [[20,3],[28,3.6],[36,3],[44,4.4],[52,3.4],[60,3]].forEach(([x,L])=>{ const g0=gumY(x)-4, b0=jawPt(P,[x-1.3-2,g0]), b1=jawPt(P,[x+1.3-2,g0]), tp=jawPt(P,[x-2,g0-L]); p.F(M.teeth[3]); p.poly([b0,tp,b1]); p.F(M.teeth[2]); p.poly([b0,tp,[(b0[0]+b1[0])/2,(b0[1]+b1[1])/2]]); });
      // língua larga presa no assoalho (claro na ponta, escuro pro fundo)
      // garganta: buraco escuro e arredondado no fundo
      p.F(Q[2]); p.ell(6,4,20,20); p.F(M.mouth[3]); p.ell(4,5,14,15); p.F(Q[2]); bandA(p,[[8,-6],[12,2],jawPt(P,[14,-8])],1.4);
      const t0=jawPt(P,[2,-6]), t1=jawPt(P,[50,-6]), t2=jawPt(P,[26,-17]), t3=jawPt(P,[48,-2]), t4=jawPt(P,[6,-1.5]);
      p.F(M.tongue[3]); p.poly([t0,t2,t1,t3,t4]);
      p.F(M.tongue[2]); p.poly([jawPt(P,[14,-14]),t2,t1,t3,jawPt(P,[20,-3])]);
      p.F(M.tongue[1]); p.poly([jawPt(P,[22,-16]),jawPt(P,[30,-16]),jawPt(P,[46,-8]),jawPt(P,[34,-8])]); p.F(M.tongue[0]); p.poly([jawPt(P,[26,-16]),jawPt(P,[32,-15.4]),jawPt(P,[30,-14])]);
      p.F(M.tongue[0]); { const a=jawPt(P,[36,-10]); p.rect(a[0],a[1],4,1); }
      p.F(M.tongue[3]); { const a=jawPt(P,[44,-7]), b=jawPt(P,[16,-6]); p.cap(P2(a[0],a[1]),P2(b[0],b[1]),0.8,0.8); }
      if(fur){ const c=jawPt(P,[10,-16]); p.F(M.mglow[3]); p.ell(c[0],c[1],12,7); p.F(M.mglow[2]); p.ell(c[0],c[1],8.4,5); p.F(M.mglow[1]); p.ell(c[0]+1,c[1],5,2.8); p.F(M.mglow[0]); p.ell(c[0]+1.6,c[1],2,1.2); }
      // gengivas vermelhas nos dois lados (cima: sob o lábio; baixo: ao longo dos dentes)
      p.F(M.flesh[2]); bandA(p,LIP.filter(q=>q[0]>4).map(q=>[q[0],q[1]+0.8]),2.6); p.F(M.flesh[1]); bandA(p,LIP.filter(q=>q[0]>10).map(q=>[q[0],q[1]+0.2]),1);
      p.F(M.flesh[2]); bandA(p,GUM.map(q=>jawPt(P,[q[0],q[1]-1.2])),2.6); p.F(M.flesh[1]); bandA(p,GUM.slice(1).map(q=>jawPt(P,[q[0],q[1]-0.6])),1);
    });
    // baba entre os dentes (fios que esticam com a boca aberta) e sangue
    // baba pingando dos dentes de cima (curta) e um fio só na ponta, onde a boca abre pouco
    [[24,3.4],[40,4.6],[55,3]].forEach(([x,L],i)=>{ const y=lipY(x)+3; p.F(fur&&i===1?M.blood[1]:M.foam[1]); p.cap(P2(x,y),P2(x-0.6,y+L),1.1,0.6); p.F(M.foam[0]); p.circle(P2(x-0.6,y+L+0.6),0.9); });

  }
  function drawJaw(p,M,sk,P,form){
    headXf(p,sk); const J=JW.map(q=>jawPt(P,q));
    { const th=[[-14,-6],[-2,4],jawPt(P,[2,12]),jawPt(P,[-6,12]),[-16,22],[-18,4]]; p.F(M.belly[2]); p.poly(th); p.F(M.belly[3]); p.poly([th[3],th[2],jawPt(P,[0,16]),[-16,24],th[4]]);
      p.F(Qo(M.belly)[1]); for(let k=0;k<3;k++){ const a=jawPt(P,[-4+k*3,13]); p.rect(a[0]-6,a[1]-2+k,6,1); } }
    p.F(M.jawy[1]); p.poly(J);
    clipPoly(J,()=>{
      const Bt=[[-12,6],[70,1],[70,14],[-12,22]].map(q=>jawPt(P,q));
      p.F(M.jawy[2]); p.poly(Bt);
      p.F(M.jawy[3]); p.poly([[-12,11],[70,4],[70,14],[-12,22]].map(q=>jawPt(P,q)));
      p.F(Qo(M.jawy)[0]); p.poly([[4,-1],[66,-3.6],[66,-1.6],[4,1.6]].map(q=>jawPt(P,q)));
      p.F(M.hide[2]); p.poly([[-10,-1],[8,-2],[4,8],[-10,10]].map(q=>jawPt(P,q))); // canto da boca escuro
      // pintas escuras da mandíbula (marca do jacaré-do-pantanal)
      [[16,3,2.6],[26,5,2],[36,4,2.4],[46,2.6,1.8],[55,1.4,1.6],[22,8,1.6],[40,7.6,1.4],[8,6,2]].forEach(([x,y,r])=>{ const q=jawPt(P,[x,y]); p.F(M.spot[1]); p.ell(q[0],q[1],r,r*0.7); p.F(M.spot[0]); p.rect(q[0]-r*0.6,q[1]-r*0.6,1,1); });
      p.F(M.jawy[0]); [[12,0.4],[30,-0.6],[48,-1.6]].forEach(([x,y])=>{ const q=jawPt(P,[x,y]); p.rect(q[0],q[1],3,1); });
    });
    p.F(M.jawy[3]); bandA(p,GUM.map(q=>jawPt(P,[q[0],q[1]+0.5])),1);
  }
  function drawLowerTeeth(p,M,sk,P){
    headXf(p,sk); const T=M.teeth;
    [[9,3],[14,4],[19,4],[24,3],[29,5],[34,4],[39,4],[44,7],[49,4],[54,5],[59,4],[63,6.5],[66.5,4]].forEach(([x,L],i)=>{
      const g=gumY(x)+0.6, b0=jawPt(P,[x-1.5,g]), b1=jawPt(P,[x+1.5,g]), tp=jawPt(P,[x+0.4,g-L]);
      p.F(T[2]); p.poly([b0,tp,b1]); p.F(T[1]); p.poly([b0,tp,[(b0[0]+b1[0])/2+0.3,(b0[1]+b1[1])/2]]); if(L>4){ p.F(T[0]); p.rect(tp[0]-0.6,tp[1]+0.6,1,Math.min(2,L*0.3)); } });
  }
  function drawHead(p,M,sk,P,form){
    headXf(p,sk); const R=M.hide, Q=Qo(R), fur=form==='furia', glow=1-P.dead;
    // olho direito (do outro lado) espiando por cima do crânio
    p.F(M.scute[2]); p.ell(22,-30,5.4,4.2); p.F(M.scute[1]); p.ell(21.4,-31,4.4,3);
    if(glow>0.3){ p.F(M.eye[2]); p.ell(23,-31.6,2.6,1.2); p.F(M.eye[1]); p.rect(22.4,-32.6,2,1); }
    p.F(R[1]); p.poly(HD);
    clipPoly(HD,()=>{
      // dorso do focinho e do crânio pegando luz; lado do focinho amarelado; sombra no lábio
      p.F(R[0]); p.poly([[-10,-40],[70,-40],[70,-12.5],[58,-14],[46,-11],[36,-13],[28,-17.5],[20,-24],[10,-21],[-10,-15]]);
      p.F(Q[0]); p.poly([[-10,-15],[10,-21],[20,-24],[28,-17.5],[36,-13],[46,-11],[58,-14],[70,-12.5],[70,-8],[58,-9],[46,-7],[34,-8],[24,-11],[10,-14],[-10,-9]]);
      p.F(Q[1]); p.poly([[-10,-8],[6,-13],[14,-16],[24,-15],[30,-10],[36,-6],[34,2],[12,4],[-10,8]]);
      p.F(R[2]); p.poly([[-10,-2],[6,-6],[14,-9],[22,-8],[26,-3],[22,4],[-10,8]]);
      p.F(Q[0]); bandA(p,[[30,-11],[40,-9.6],[50,-10],[60,-10.6]],1.6);
      p.F(M.jawy[1]); p.poly([[30,-2],[44,-4],[56,-5],[70,-5],[70,8],[30,8]]);
      p.F(Qo(M.jawy)[1]); p.poly([[24,2],[44,0],[60,0.6],[70,0.4],[70,8],[24,8]]);
      p.F(R[2]); p.poly([[-10,0],[10,1.8],[20,0.4],[26,2],[24,8],[-10,14]]);
      p.F(R[3]); bandA(p,LIP.map(q=>[q[0],q[1]-1.6]),1.4);
      // manchas escuras (pintas do focinho)
      [[34,-6,2.4],[42,-4.4,2],[50,-6,1.8],[58,-6.6,1.6],[38,-10,1.4],[26,-6,1.8],[12,-6,2.2],[4,-10,1.6],[-4,-4,2],[18,-2,1.6],[8,-14,1.4],[46,-8,1.2],[54,-9,1.2],[-6,-12,1.6]].forEach(([x,y,r])=>{ p.F(M.spot[1]); p.ell(x,y,r,r*0.75); });
      // mesa craniana em placas (atrás dos olhos)
      p.F(M.scute[3]); [[-6,-19,8,5],[2,-20,7,4],[-4,-13,8,4]].forEach(([x,y,w,h])=>p.rect(x,y,w,1)); p.F(M.scute[3]); p.rect(2,-20,1,6); p.rect(-6,-19,1,6);
      // escamas do lábio (fileira de bolinhas claras)
      p.F(Qo(M.jawy)[0]); for(let x=8;x<62;x+=4.4) p.ell(x,lipY(x)-2.4,1.6,1.1);
    });
    // arcada óssea entre os olhos ("óculos") e sulco atrás do olho (ouvido)
    p.F(R[3]); bandA(p,[[26,-21],[30,-18],[34,-17]],1.2); p.F(R[0]); bandA(p,[[26,-22.4],[31,-19.4]],0.8);
    p.F(R[3]); bandA(p,[[1,-17],[8,-17.4]],1.4); p.F(Q[0]); bandA(p,[[1,-18.6],[8,-19]],0.7);
    // crânio exposto no focinho (lado esquerdo): osso, raízes dos dentes, buraco da narina, borda de carne
    const X_=K_.st.CTX; X_.save(); X_.transform(0.46,0,0,0.46,44*0.54,-6*0.54); // osso exposto pequeno, só um rasgo no focinho
    const sk0=[[33,-11],[40,-13],[48,-11.4],[52,-7],[51,-2],[46,0.4],[40,1.2],[35,-0.6],[33,-4],[31,-7]];
    p.F(M.flesh[2]); p.poly(sk0.map(([x,y])=>[x+(x-41)*0.07,y+(y+6)*0.1]));
    p.F(M.bone[2]); p.poly(sk0);
    clipPoly(sk0,()=>{ p.F(M.bone[1]); p.poly([[28,-16],[54,-16],[54,-10],[28,-8]]); p.F(M.bone[2]); p.poly([[28,-2],[54,-4],[54,4],[28,4]]);
      p.F(M.bone[3]); p.ell(46,-8.4,2,1.2);
      p.F(M.bone[2]); [32,36.5,41,45.5,50].forEach(x=>{ p.poly([[x-1.2,1.6],[x+1.2,1.6],[x+0.8,-5],[x-0.6,-5]]); }); p.F(M.bone[0]); [32,41,50].forEach(x=>p.rect(x-0.6,-4.4,1,4));
      p.F(M.bone[3]); p.rect(33,-10.4,4,1); p.rect(38,-12,1,3); });
    p.F(M.flesh[1]); [[32,-9],[44,-13.4],[52,-5]].forEach(([x,y])=>p.rect(x,y,2,1));
    p.F(M.blood[1]); p.poly([[46,0.6],[48,0.6],[47.6,5],[46.6,3]]); X_.restore();
    // narina na ponta do focinho
    p.F(R[2]); p.ell(60,-15.6,4.2,2.4); p.F(R[0]); p.ell(59.4,-16.6,3,1.2); p.F(M.spot[2]); p.rect(58.6,-16.2,3.4,1);
    // olho esquerdo de lua (pupila vertical clara), pálpebra óssea pesada
    p.F(R[3]); p.ell(18.6,-25.2,5.4,4.2);
    if(glow>0.3){ const E=fur?M.eye:M.moon; p.F(E[3]); p.ell(18.8,-25,4.2,3.1); p.F(E[2]); p.ell(19,-25.1,3.5,2.6); p.F(E[1]); p.ell(19.5,-25.5,2.2,1.6);
      p.F(M.spot[3]); p.poly([[19.4,-27.8],[20.2,-25.2],[19.4,-22.6],[18.8,-25.2]]); p.F(E[0]); p.rect(17,-26.6,1,1); }
    else { p.F(M.moon[3]); p.ell(18.6,-24.6,4.6,1.4); }
    p.F(M.scute[2]); p.poly([[9,-27],[12,-32.6],[19,-35],[26,-32],[28.4,-27],[24,-30],[18,-31.2],[12,-30]]); p.F(M.scute[1]); p.poly([[11,-29.6],[13,-32.6],[19,-34.6],[25,-31.6],[19,-32.4]]); p.F(M.scute[0]); p.poly([[13,-32.4],[16,-34],[21,-34.4],[17,-33.2]]);
    p.F(R[3]); bandA(p,[[10,-28.4],[18,-30.6],[27,-28]],1.2); // sombra da pálpebra sobre o olho
    // dentes de cima (irregulares, saindo do lábio)
    const T=M.teeth;
    [[7,3],[11.5,4],[16,3],[20.5,5],[25,4],[29.5,4.6],[34,5],[38.5,4],[43,7.6],[47.5,4],[52,5],[56,4.4],[60,6.6],[63.6,4.4]].forEach(([x,L])=>{
      const y=lipY(x)-0.6; p.F(T[2]); p.poly([[x-1.6,y],[x+1.6,y],[x+0.2,y+L]]); p.F(T[1]); p.poly([[x-1.6,y],[x,y],[x+0.2,y+L]]); if(L>4.5){ p.F(T[0]); p.rect(x-1,y+0.6,1,L*0.4); } });
    if(fur){ p.F(M.blood[1]); [[20,6],[44,7],[60,8]].forEach(([x,L])=>{ const y=lipY(x); p.rect(x-0.6,y,1.3,L); p.ell(x,y+L,1.2,1.4); }); }
  }
  // brilho dos olhos (sem sombreamento)
  function drawEyeGlow(p,M,sk,P,form){
    if(P.dead>0.3) return; headXf(p,sk); const fur=form==='furia', E=fur?M.eye:M.moon;
    p.F(E[1]); p.rect(17.6,-25.6,1.2,1.2); if(P.glare){ p.F(E[0]); p.rect(15,-24.2,9,1); p.F(E[1]); p.rect(11,-23.8,4,0.8); p.rect(23,-23.8,5,0.8); }
    p.F(M.eye[1]); p.rect(22.6,-32.4,1.6,1);
  }
  // coroa natural de aguapé: folhas redondas com pecíolo inchado + espiga de flor lilás
  function leaf(p,M,x,y,s,a,wilt){
    const L=M.leaf, St=M.stalk, d=wilt?1:0;
    const bx=x+S(a)*8*s, by=y-C(a)*8*s+d*5*s;
    p.F(St[2]); p.cap(P2(x,y),P2(bx,by),3*s,2*s); p.F(St[1]); p.ell((x+bx)/2,(y+by)/2,2.4*s,3.2*s,a); p.F(St[0]); p.rect((x+bx)/2-0.6,(y+by)/2-2*s,1,1.6*s);
    const cx=bx+S(a)*5*s, cy=by-C(a)*4*s+d*4*s, rx=6.4*s, ry=(wilt?3.4:5.2)*s, rr=a*0.5+(wilt?0.8:0);
    p.F(L[3]); p.ell(cx+0.6,cy+0.8,rx,ry,rr); p.F(L[1]); p.ell(cx,cy,rx,ry,rr); p.F(L[2]); p.ell(cx+rx*0.25,cy+ry*0.3,rx*0.7,ry*0.6,rr);
    p.F(L[1]); p.ell(cx-rx*0.1,cy-ry*0.05,rx*0.75,ry*0.65,rr); p.F(Qo(L)[0]); p.ell(cx-rx*0.3,cy-ry*0.3,rx*0.45,ry*0.32,rr); p.F(L[0]); p.rect(cx-rx*0.55,cy-ry*0.55,Math.max(1,rx*0.3),1);
    p.F(L[2]); p.cap(P2(cx-rx*0.6,cy+ry*0.1),P2(cx+rx*0.6,cy-ry*0.1),0.8,0.8);
  }
  function flower(p,M,x,y,s,a,wilt){
    const Fl=M.flower, top=P2(x+S(a)*24*s+(wilt?10*s:0), y-C(a)*24*s+(wilt?10*s:0));
    p.F(M.stalk[2]); p.cap(P2(x,y),top,2.4*s,1.6*s); p.F(M.stalk[1]); p.cap(P2(x-0.5,y),P2(top.x-0.5,top.y),1.2*s,0.8*s);
    for(let k=0;k<5;k++){ const t=0.45+k*0.14, c=lerp(P2(x,y),top,t), o=(k%2?1:-1)*4.2*s, bx=c.x+o, by=c.y+(wilt?2:0);
      p.F(Fl[3]); p.ell(bx+0.5,by+0.8,4.6*s,3.4*s); p.F(Fl[1]); p.ell(bx,by,4.2*s,3*s); p.F(Fl[2]); p.ell(bx+1.2*s,by+1.2*s,2.6*s,1.6*s);
      p.F(Fl[0]); p.ell(bx-1.2*s,by-1.2*s,2*s,1.2*s);
      if(k===4||k===2){ p.F(M.fyel[1]); p.ell(bx,by-0.8*s,1.4*s,1*s); p.F(Fl[3]); p.rect(bx-0.5,by-1.4*s,1,1); } }
  }
  function drawCrown(p,M,sk,P,form){
    headXf(p,sk); const wilt=form==='furia';
    // tapete de musgo na nuca escorrendo pelo lado da cabeça, com a coroa pequena de aguapé por cima
    const Mo=M.moss, mat=[[-12,-14],[-8,-19.5],[0,-21.5],[7,-22.5],[11,-26],[9,-21],[6,-17],[2,-12],[-2,-14],[-6,-8],[-9,-12],[-12,-6]];
    p.F(Mo[2]); p.poly(mat); p.F(Mo[1]); p.poly([[-11,-15],[-8,-19.5],[0,-21.5],[7,-22.5],[10,-25],[4,-20],[-2,-18],[-8,-15]]); p.F(Qo(Mo)[0]); [[-6,-19],[1,-21],[6,-22]].forEach(([x,y])=>p.ell(x,y,2,1));
    p.F(Mo[2]); [[2,-14,3,-6],[-4,-12,-5,-2],[-9,-10,-10,0],[7,-18,9,-11]].forEach(([a,b,c,d])=>p.cap(P2(a,b),P2(c,d),1.6,0.6)); p.F(Mo[3]); [[-4,-12,-5,-2],[2,-14,3,-6]].forEach(([a,b,c,d])=>p.cap(P2(a+0.6,b),P2(c+0.6,d),0.6,0.3));
    leaf(p,M,-7,-19,0.55,-1.1,wilt); leaf(p,M,0,-21,0.62,-0.45,wilt); flower(p,M,-2,-21,0.55,-0.3,wilt); leaf(p,M,6,-22.5,0.5,0.35,wilt);
  }
  // manto de musgo e aguapé no dorso + arpões velhos
  function drawMantle(p,M,sk,P,form,ns){
    p.id(); const wilt=form==='furia', Mo=M.moss, s0=0.22, s1=0.86;
    const top=[], bot=[];
    for(let s=s0;s<=s1+0.001;s+=0.03){ const bump=2.6+((Math.floor(s*91))%3)*1.6; const q=at(ns,s,-1), n=ns[Math.min(ns.length-1,Math.round(s*(ns.length-1)))]; top.push([q[0]-n.nx*bump,q[1]-n.ny*bump]); }
    for(let s=s1;s>=s0-0.001;s-=0.03){ const drip=((Math.floor(s*77))%5===0)?0.08:0; bot.push(at(ns,s,-0.6+drip+0.06*S(s*40))); }
    const poly=top.concat(bot);
    p.F(Mo[1]); p.poly(poly);
    clipPoly(poly,()=>{ p.F(Mo[2]); p.poly(strip(ns,-0.78,-0.4,s0-0.05,s1+0.05)); p.F(Qo(Mo)[1]); p.poly(strip(ns,-0.86,-0.74,s0-0.05,s1+0.05));
      for(let s=s0;s<s1;s+=0.045){ const q=at(ns,s,-1.06); p.F(Qo(Mo)[0]); p.ell(q[0],q[1],4.4,2.6); p.F(Mo[0]); p.ell(q[0]-1.4,q[1]-1,2,1); } });
    // fios pendentes
    for(let s=s0+0.08;s<s1;s+=0.24){ const a=at(ns,s,-0.6), b=at(ns,s+0.008,-0.4-((Math.floor(s*50))%3)*0.06); p.F(Mo[2]); p.cap(P2(a[0],a[1]),P2(b[0],b[1]),2.2,1); p.F(Mo[1]); p.cap(P2(a[0]-0.4,a[1]),P2(b[0]-0.4,b[1]-1),1,0.6); }
    // touceiras de aguapé nas placas
    const q1=at(ns,0.38,-1.1), q2=at(ns,0.7,-1.1);
    leaf(p,M,q1[0],q1[1],0.62,-0.6,wilt); leaf(p,M,q1[0]+4,q1[1],0.55,0.3,wilt); leaf(p,M,q2[0],q2[1],0.6,-0.2,wilt); leaf(p,M,q2[0]+5,q2[1]+1,0.5,0.8,wilt);
  }
  function harpoon(p,M,b,ang,len){
    const d=P2(C(ang),S(ang)), e=P2(b.x+d.x*len,b.y+d.y*len), n=P2(-d.y,d.x);
    stain(p,M.blood,b.x,b.y+1,2.2,2,3);
    p.F(M.iron[3]); p.cap(P2(b.x-d.x*2,b.y-d.y*2),P2(b.x+d.x*6,b.y+d.y*6),4.6,3.6); p.F(M.iron[1]); p.cap(P2(b.x+n.x*0.6,b.y+n.y*0.6),P2(b.x+d.x*6+n.x*0.6,b.y+d.y*6+n.y*0.6),2,1.6);
    p.F(M.wood[3]); p.cap(P2(b.x+d.x*5,b.y+d.y*5),e,3.4,3); p.F(M.wood[1]); p.cap(P2(b.x+d.x*5-n.x*0.5,b.y+d.y*5-n.y*0.5),P2(e.x-n.x*0.5,e.y-n.y*0.5),1.8,1.4);
    p.F(M.wood[0]); p.cap(P2(b.x+d.x*9-n.x*0.9,b.y+d.y*9-n.y*0.9),P2(b.x+d.x*len*0.7-n.x*0.9,b.y+d.y*len*0.7-n.y*0.9),0.8,0.6);
    const r0=P2(b.x+d.x*len*0.6,b.y+d.y*len*0.6); for(let k=0;k<1;k++){ const q=P2(r0.x+d.x*k*2.2,r0.y+d.y*k*2.2); p.F(M.rope[2]); p.cap(P2(q.x-n.x*2.4,q.y-n.y*2.4),P2(q.x+n.x*2.4,q.y+n.y*2.4),1.8,1.8); p.F(M.rope[0]); p.rect(q.x-n.x*1.6,q.y-n.y*1.6,1,1); }
    p.F(M.rope[2]); bandA(p,[[r0.x,r0.y+1],[r0.x-4,r0.y+8],[r0.x-2,r0.y+14],[r0.x-6,r0.y+19]],1.6); p.F(M.rope[1]); bandA(p,[[r0.x,r0.y+1],[r0.x-4,r0.y+8],[r0.x-2,r0.y+14]],0.7);
  }

  /* ---------------- água e FX ---------------- */
  function pool(p,M,cx,g,rx,ry,t){
    const Wt=M.water, Fo=M.foam;
    p.F(Wt[3]); p.ell(cx,g,rx+3,ry+2); p.F(Wt[2]); p.ell(cx,g+0.6,rx,ry); p.F(Wt[1]); p.ell(cx-rx*0.06,g-ry*0.3,rx*0.82,ry*0.55);
    p.F(Wt[2]); p.ell(cx+rx*0.1,g+ry*0.05,rx*0.6,ry*0.4);
    p.F(Wt[0]); [[-0.6,-0.4,0.18],[0.35,-0.5,0.14],[0.62,0.1,0.1],[-0.3,0.35,0.16]].forEach(([dx,dy,w],k)=>arc(p,cx+dx*rx,g+dy*ry,rx*w,ry*0.18,190+k*8,340,1,6));
    p.F(Fo[1]); arc(p,cx,g,rx,ry,10,170,1.6,16); p.F(Fo[2]); arc(p,cx,g,rx+2,ry+1.4,190,350,1,16);
  }
  function foamLine(p,M,x0,x1,y,seed){
    p.F(M.foam[2]); p.rect(x0,y-0.6,x1-x0,2.4); p.F(M.foam[1]); for(let x=x0;x<x1;x+=5){ p.ell(x+2,y,3+rnd(seed,x)*2.4,1.4); } p.F(M.foam[0]); for(let x=x0+2;x<x1;x+=9) p.rect(x,y-1.4,3,1);
    p.F(M.water[0]); arc(p,(x0+x1)/2,y+4,(x1-x0)*0.6,5,15,165,1,14);
  }
  function splash(p,M,x,g,s,seed){
    if(s<0.1) return; const Wt=M.water, Fo=M.foam;
    for(let k=0;k<7;k++){ const a=-PI/2+(k-3)*0.34+(rnd(seed,k)-0.5)*0.2, h=(22+rnd(seed,k+4)*26)*s, b=P2(x+(k-3)*9*s,g-2), t=P2(b.x+C(a)*h,b.y+S(a)*h);
      p.F(Wt[2]); p.cap(b,t,8*s,2.4*s); p.F(Wt[1]); p.cap(P2(b.x-0.6,b.y-1),P2(t.x-0.4,t.y+1),5*s,1.4*s); p.F(Fo[0]); p.cap(P2(t.x,t.y+2),t,2*s,1);
      p.F(Fo[1]); p.circle(P2(t.x+C(a)*6*s,t.y+S(a)*6*s),1.6*s); p.circle(P2(t.x+C(a+0.4)*10*s,t.y+S(a+0.4)*10*s+3),1.2*s); }
    p.F(Fo[2]); p.ell(x,g-1,36*s,5*s); p.F(Fo[1]); p.ell(x,g-2,28*s,3.4*s); p.F(Fo[0]); p.ell(x-6*s,g-3,10*s,1.4*s);
  }
  function bubbles(p,M,x,y,t,n=6,r=30){
    for(let k=0;k<n;k++){ const bx=x+(rnd(7,k)-0.5)*r*2, by=y-((t*3+k*5)%14)-rnd(3,k)*4, rr=1.2+rnd(5,k)*1.8;
      p.F(M.foam[2]); p.circle(P2(bx,by),rr+0.6); p.F(M.water[1]); p.circle(P2(bx,by),rr); p.F(M.foam[0]); p.rect(bx-rr*0.5,by-rr*0.6,1,1); }
    p.F(M.foam[1]); arc(p,x,y+2,r*0.8,5,0,360,1.2,16); p.F(M.water[0]); arc(p,x,y+2,r*1.2,8,0,360,1,18);
  }
  function stars(p,M,c,t){ for(let k=0;k<3;k++){ const a=t*PI*2+k*PI*2/3, q=P2(c.x+C(a)*22,c.y+S(a)*6); p.F(M.fx[2]); p.poly([[q.x,q.y-4],[q.x+1.4,q.y-1.4],[q.x+4,q.y],[q.x+1.4,q.y+1.4],[q.x,q.y+4],[q.x-1.4,q.y+1.4],[q.x-4,q.y],[q.x-1.4,q.y-1.4]]); p.F(M.fx[0]); p.rect(q.x-1,q.y-1,2,2); } }

  /* ---------------- montagem ---------------- */
  function parts(add,P,M,sk,form,anim){
    if(form==='furia'&&anim!=='rage') P=Object.assign({},P,{crack:Math.max(P.crack||0,0.85)});
    const fur=form==='furia', seed=(P.t||0)*7+1+(P.ph||0)*3, wl=P.sub>0.05&&P.drop>0.5?GROUND-3:null;
    const A=(opt,fn,noClip)=>add(opt,p=>{ if(wl!=null&&!noClip){ const X=K_.st.CTX; X.save(); p.id(); X.beginPath(); X.rect(-40,-40,FW+80,wl+40); X.clip(); fn(p); X.restore(); } else fn(p); });
    const t1=Object.assign({},sk.tail[2],{ht:sk.tail[2].ht*0.7,hb:sk.tail[2].hb*0.7}), bodyN=(P.sw>0.12?[]:[t1]).concat(sk.trunk.slice(0),[sk.n1,sk.N]), tailN=P.sw>0.12?sk.tail.slice().reverse():sk.tail.slice().reverse().concat([sk.trunk[1]]);
    const nsB=smooth(bodyN,5), nsT=smooth(tailN,5);
    const tailFront=P.sw>0.12;
    const bodyCx=sk.cx;
    // lâmina d'água por baixo
    if(P.sub>0.05) A({noShade:true,noRim:true},p=>{ p.id(); pool(p,M,bodyCx+10,GROUND-4,(110+70*Math.min(1,P.drop/30))*Math.min(1,P.sub*1.3),12+6*P.sub,P.t); },true);
    const legsBack=sk.legs.filter(l=>l.depth<0), legsFront=sk.legs.filter(l=>l.depth>=0);
    legsBack.forEach(l=>A({back:true},p=>drawLeg(p,M,l,P)));
    if(!tailFront){ A({},p=>drawBody(p,M,sk,P,form,nsT,true)); if(fur) A({noShade:true,noRim:true},p=>drawCracks(p,M,nsT,P,seed+5,true)); }
    A({},p=>drawBody(p,M,sk,P,form,nsB,false));
    if(fur) A({noShade:true,noRim:true},p=>drawCracks(p,M,nsB,P,seed,false));
    const rolled=Math.abs(S(sk.th))>0.45||C(sk.th)<0.5;
    if(!rolled){ A({},p=>drawMantle(p,M,sk,P,form,nsB));
      A({},p=>{ p.id(); const h1=at(nsB,0.72,-0.95), h2=at(nsB,0.3,-0.9); harpoon(p,M,P2(h1[0],h1[1]),sk.a-rad(124),34); harpoon(p,M,P2(h2[0],h2[1]),sk.a-rad(146),26); }); }
    legsFront.forEach(l=>A({},p=>drawLeg(p,M,l,P)));
    if(tailFront){ A({},p=>drawBody(p,M,sk,P,form,nsT,true)); if(fur) A({noShade:true,noRim:true},p=>drawCracks(p,M,nsT,P,seed+5,true)); }
    if(P.jaw>=5) A({noShade:true},p=>drawMouth(p,M,sk,P,form));
    A({},p=>drawJaw(p,M,sk,P,form));
    if(P.tongue>0.5) A({},p=>{ headXf(p,sk); const a=jawPt(P,[30,-2]), b=jawPt(P,[44,10]); p.F(M.tongue[2]); p.cap(P2(a[0],a[1]),P2(b[0],b[1]),6,4.4); p.F(M.tongue[1]); p.cap(P2(a[0]-0.6,a[1]-0.6),P2(b[0]-0.6,b[1]-0.6),3.4,2.6); p.F(M.tongue[0]); p.rect(a[0]+2,a[1]-1,4,1); });
    A({},p=>drawHead(p,M,sk,P,form));
    A({},p=>drawLowerTeeth(p,M,sk,P));
    if(!rolled||C(sk.th)>-0.2) A({},p=>drawCrown(p,M,sk,P,form));
    A({noShade:true,noRim:true},p=>drawEyeGlow(p,M,sk,P,form));
    // superfície da água por cima (espuma na linha d'água)
    if(wl!=null) A({noShade:true,noRim:true},p=>{ p.id(); const x0=Math.min(...sk.tail.map(q=>q.x))-6, x1=sk.H(66,0).x+6; foamLine(p,M,Math.max(4,x0+(P.drop>50?60:0)),Math.min(FW-4,x1),wl+1,seed); },true);
    if(P.bub) A({noShade:true,noRim:true},p=>{ p.id(); const e=sk.H(30,-20); bubbles(p,M,e.x,GROUND-6,P.t||0,7,26); },true);
    if(P.float>0.05) A({noRim:true},p=>{ p.id(); const g=GROUND-6; [[-40,0.9,-0.4],[-10,1,0.2],[24,0.8,-0.1],[60,0.9,0.5]].forEach(([dx,s,a],k)=>{ if(k/4<P.float) leaf(p,M,bodyCx+dx,g,s,a+1.2,fur); }); if(P.float>0.5) flower(p,M,bodyCx+8,g-2,0.8,0.6,fur); },true);
    // FX
    if(P.splash>0.05) A({noShade:true,noRim:true,smear:true},p=>{ p.id(); splash(p,M,sk.H(30,0).x,GROUND-2,P.splash*1.1,seed); if(anim==='spin'||anim==='dive') splash(p,M,sk.cx-50,GROUND-2,P.splash*0.8,seed+9); },true);
    if(P.smear&&anim==='bite') A({noShade:true,noRim:true,smear:true},p=>{ p.id(); const c=sk.H(46,0); smear(p,M.fx,c.x-10,c.y,14,34,-80,70,1); },true);
    if(P.smear&&anim==='spin') A({noShade:true,noRim:true,smear:true},p=>{ p.id(); const c=P2(sk.cx+20,sk.cy+4); p.F(M.fx[1]); arc(p,c.x,c.y,70,36,200+P.roll*300,320+P.roll*300,3,12); arc(p,c.x,c.y,64,32,20+P.roll*300,140+P.roll*300,2.4,12); p.F(M.fx[0]); arc(p,c.x,c.y,72,37,230+P.roll*300,300+P.roll*300,1,8); },true);
    if(P.smear&&anim==='tail') A({noShade:true,noRim:true,smear:true},p=>{ p.id(); const c=sk.pel; smear(p,M.fx,c.x,GROUND+4,100,136,175,175+P.sw*110,0.4); },true);
    if(P.smear&&(anim==='emerge'||anim==='intro')) A({noShade:true,noRim:true,smear:true},p=>{ p.id(); const c=sk.H(40,-10); p.F(M.foam[1]); [-18,-6,6,18].forEach((dx,k)=>p.cap(P2(c.x+dx,c.y+30+(k%2)*8),P2(c.x+dx*1.4,c.y-20-(k%2)*10),2.6,0.8)); },true);
    if(P.smear&&anim==='death') A({noShade:true,noRim:true,smear:true},p=>{ p.id(); const c=sk.tail[5]; p.F(M.fx[1]); arc(p,c.x+10,c.y,40,30,180,300,2.4,10); },true);
    if(P.ring>0.05) A({noShade:true,noRim:true,smear:true},p=>{ p.id(); const c=sk.H(70,6), F=M.fx;
      [0,0.33,0.66].forEach((o,k)=>{ const r=14+P.ring*80-o*40; if(r<10) return; p.F(k===0?F[1]:F[2]); arc(p,c.x,c.y,r,r*0.9,-65,65,3-k*0.6,10); });
      p.F(M.fx[0]); [[10,-14],[16,-4],[12,8],[20,2]].forEach(([dx,dy],k)=>p.circle(P2(c.x+dx*(1+P.ring),c.y+dy*(1+P.ring)),1.4)); },true);
    if(P.impact) A({noShade:true,noRim:true,smear:true},p=>{ p.id(); const x=anim==='tail'?sk.tail[6].x:anim==='death'||anim==='fall'||anim==='getup'?sk.cx:sk.H(46,0).x; dust(p,M.dust,M.fx,x,GROUND,anim==='bite'||anim==='spin'?0.55:0.75); },true);
    if(P.dz>0.01&&anim!=='emerge'||P.dz>0.15) A({noShade:true,noRim:true},p=>{ p.id(); stars(p,M,sk.H(14,-40),P.dz); },true);
    if(fur&&P.crack>0.3&&(anim==='rage')) A({noShade:true,noRim:true},p=>{ p.id(); puffs(p,M.steam,sk.cx-20,sk.cy-40-(P.t%3)*6,[[0,0,8,5],[14,-6,6,4],[-16,-4,5,3.4]]); sparks(p,M.glow,P2(sk.cx+10,sk.cy-30),6,18,seed); },true);
  }
  function anchors(sk,P){ const m=sk.H(50,4); return {eye:sk.H(18,-24),mouth:m,hand:m,head:sk.H(20,-34),back:sk.T(0,-28),tail:sk.tail[8],belly:sk.T(0,26),stomp:{x:sk.cx,y:GROUND}}; }

  /* ---------------- adereços ---------------- */
  const PFW=220, PFH=150, PG=128, PAX=110;
  function prop(add,P,M,form,anim){ const st=Math.round(P.st||0);
    if(anim==='xAgua') add({noShade:true,noRim:true},p=>{ p.id(); const x=PAX, g=PG-6;
      if(st===0){ pool(p,M,x,g,34,8,0); bubbles(p,M,x,g-2,0,6,22); return; }
      if(st===1){ pool(p,M,x,g,46,10,1); bubbles(p,M,x,g-2,4,9,30); p.F(M.water[0]); arc(p,x,g,58,13,190,350,1.2,16); return; }
      if(st===2){ pool(p,M,x,g,54,12,2); splash(p,M,x,g+2,1.6,11); return; }
      pool(p,M,x,g,58,13,3); p.F(M.foam[1]); [[-40,-30],[-22,-50],[8,-56],[30,-38],[46,-22]].forEach(([dx,dy],k)=>p.circle(P2(x+dx,g+dy),1.8+(k%2))); foamLine(p,M,x-40,x+40,g,5); });
    else add({noShade:true,noRim:true},p=>{ p.id(); const g=PG-4, x=PAX, s=0.6+st*0.3, F=form==='furia';
      p.F(M.water[2]); p.poly([[x-90*s,g],[x-60*s,g-16*s],[x-20*s,g-26*s],[x+30*s,g-24*s],[x+80*s,g-12*s],[x+96*s,g]]);
      p.F(M.water[1]); p.poly([[x-80*s,g-2],[x-56*s,g-14*s],[x-18*s,g-22*s],[x+28*s,g-20*s],[x+70*s,g-10*s],[x+86*s,g-2]]);
      p.F(M.foam[1]); bandA(p,[[x-62*s,g-15*s],[x-20*s,g-26*s],[x+30*s,g-24*s],[x+78*s,g-12*s]],2.4); p.F(M.foam[0]); bandA(p,[[x-40*s,g-22*s],[x,g-26*s],[x+36*s,g-23*s]],1);
      p.F(M.dust[1]); [[-70,-8],[74,-6],[-30,-30],[20,-34]].forEach(([dx,dy],k)=>p.ell(x+dx*s,g+dy*s,6+k,3+k*0.5));
      if(F){ p.F(M.glow[2]); bandA(p,[[x-50*s,g-12*s],[x,g-20*s],[x+50*s,g-12*s]],1.2); } });
  }

  const F=K_.factory({SC,FW,FH,GROUND,AX,RIM,ANIMS,NAMES,REST,mats0,skeleton,parts,anchors,PROP:{FW:PFW,FH:PFH,GROUND:PG,AX:PAX},prop});
  F.skeleton=skeleton; // depuração/testes: esqueleto sem desenhar
  return F;
})();
