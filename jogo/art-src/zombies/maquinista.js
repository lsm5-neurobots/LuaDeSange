/* MAQUINISTA — fonte de arte (editável). Build: npm run art
   Chefe da Lapa "O Maquinista do Bonde": o velho motorneiro do bonde de Santa Teresa, eletrocutado no fio do trole
   numa noite de Lua de Sangue e levantado gigante (~3 m). Quepe alto com aba de verniz e distintivo genérico de roda
   alada, farda verde-garrafa de abotoamento duplo com vivo vinho, botas de couro. Na barriga, o controlador do bonde
   (tampa de alumínio, placas de resistência cor de ferrugem, lâmpadas de carga) preso por correias; na mão da frente a
   manivela do controle (cassetete); na de trás a vara do trole com a roda de latão faiscando (lança). Sino de bronze
   no peito. Eletricidade crepitando nas bordas (azul; vermelha na fúria, com a farda rasgada e marcas de raio na pele).
   Adereços: o bonde amarelo de Santa Teresa de perfil (sem freio) e o raio da catenária. Design nosso, sem marca. */
const MAQUINISTA=(function(){
  const {rad,lp,lerp,P2,ik}=PIX;
  const K_=BOSSKIT, {S,C,PI,mass,platePoly,clipPoly,band,bandA,ellPts,arc,bez,limb,fold,stitches,rivets,rnd,stain,chain,rope,dust,sparks,bolt,smear,puffs}=K_;
  const FW=540, FH=372, GROUND=356, AX=232;
  const RIM={normal:'#bfe6ff', furia:'#ff9a8a'};
  const UPA=54, FOA=50, POLE=196;

  function mats0(form){
    const m={
      coat:['#86bf9e','#2f6a52','#1b4234','#0d2219'],
      trim:['#f2907e','#a83442','#6a1c2e','#380c1a'],
      brass:['#fff0a8','#e0ae46','#9a6a26','#4c3216'],
      bronze:['#ffe2a0','#cc9244','#8a5828','#462a16'],
      skin:['#cdd2ae','#8e9a7c','#5a6460','#2e3440'],
      burn:['#9a7a6c','#5c4444','#36262e','#1a1218'],
      shirt:['#fbf4dc','#d8ccae','#a09284','#5a5060'],
      visor:['#8c8ca4','#363648','#20202c','#0e0e16'],
      leather:['#c99a6c','#7e5434','#4c321e','#28180e'],
      pole:['#f8e8a8','#caa44c','#86682c','#463416'],
      steel:['#f0f2f8','#a2a4b4','#606274','#30303e'],
      alu:['#ffffff','#c6cad4','#868a9a','#46485a'],
      ctrl:['#f2a280','#b44a32','#74281e','#3c120e'],
      wood:['#dcaa72','#9e6e42','#66442e','#38241c'],
      rope:['#f4ecd6','#c6b692','#8a7a64','#4a4036'],
      hair:['#e8e4dc','#a8a2a4','#6a6470','#363040'],
      mouth:['#6c2c3a','#421a28','#2a0e18','#1a0710'],
      teeth:['#fff8e2','#d8cca6','#9a8a72','#544838'],
      blood:['#9c3a36','#6e222c','#46141e','#280a12'],
      eye:['#ffffff','#ffeaa4','#ffb040','#a45010'],
      milk:['#f4f6f0','#c4cac4','#8a9090','#4a5058'],
      lamp:['#ffffff','#ffeaa4','#eaa83a','#8a5010'],
      loff:['#5a5560','#3a3640','#26222c','#16121a'],
      volt:['#ffffff','#cdf2ff','#64baff','#2252c4'],
      vein:['#ffffff','#cdf2ff','#64baff','#2252c4'],
      fx:['#fffef2','#fff2aa','#ffc24c','#e27c24'],
      dust:['#eadecd','#c6b6a0','#968671','#605448'],
      smoke:['#b8b4c4','#8a8498','#5e5870','#3a3448'],
      // bonde
      yel:['#fff4a4','#f2c02a','#b67e18','#684010'],
      tblue:['#8ea8e2','#30488c','#1e2c5a','#0e1630'],
      bench:['#e0905c','#a4502e','#6a2e1e','#381610'],
      dark:['#4a4058','#2a2436','#1a1624','#0e0a14'],
      glass:['#c8e6ff','#7aa0c8','#45607e','#223042'],
      light:['#ffffff','#fff8d0','#ffe27a','#e0a830'],
      zomb:['#9aa48a','#626e5e','#3e4644','#222630'],
      // luz rebatida fria nas bordas de trás (rim de lado, mais grosso que o contorno do compose)
      refl:['#d6f0f4','#8cc4c8','#4e8c90','#28565c'],
    };
    if(form==='furia'){
      m.coat=['#7a9a8c','#2e4a44','#1c2c2e','#0c1416'];
      m.skin=['#dcbca4','#a87e72','#6c4a52','#38242e'];
      m.eye=['#ffffff','#ffd0b0','#ff5a3a','#b01414'];
      m.volt=['#ffffff','#ffc0b0','#ff4a3a','#a0141c'];
      m.vein=['#ffffff','#ffd2b0','#ff6a3a','#b01e14'];
      m.lamp=['#ffffff','#ffc8b8','#ff5a48','#a0141c'];
      m.light=['#ffffff','#ffd8c8','#ff7a5a','#c02a1a'];
      m.blood=['#e0503a','#a8282c','#6c1420','#3c0a14'];
      m.refl=['#ffd8d0','#d08a86','#8a4a52','#4c2430'];
    }
    return K_.finish(m,['fx','dust','eye','lamp','volt','vein','light']);
  }
  const NAMES={coat:'Farda verde-garrafa',trim:'Vivo vinho',brass:'Latão',bronze:'Bronze do sino',skin:'Pele podre',burn:'Queimadura',shirt:'Camisa',
    visor:'Aba/bota de verniz',leather:'Couro das correias',pole:'Vara do trole',steel:'Aço',alu:'Tampa de alumínio',ctrl:'Placas de resistência',
    wood:'Punho de madeira',rope:'Corda do trole',hair:'Cabelo chamuscado',eye:'Olho âmbar',lamp:'Lâmpada de carga',volt:'Eletricidade',vein:'Marca de raio',
    yel:'Amarelo do bonde',tblue:'Faixa azul do bonde',bench:'Banco de madeira',glass:'Vidro',light:'Farol',zomb:'Pingente zumbi',refl:'Luz rebatida'};

  /* ---------------- sombreamento (faixas) ----------------
     Luz de cima/à frente (BOSSKIT.LIGHT), oclusão nas juntas, luz rebatida fria do lado de trás. */
  const Qo=R=>K_.qOf(R);
  // membro em faixas cilíndricas no quadro local (eixo x de x0 a x1, largura w0→w1): oclusão, sombra, meia-sombra,
  // base, meia-luz, brilho; o lado aceso sai da direção da luz no ângulo do membro. rf: tira de luz rebatida.
  function tube(p,R,x0,x1,w0,w1,ang,hi=1,rf){
    const ly=K_.lightLocal(ang)[1], sd=ly<0?-1:1, Q=Qo(R);
    const st=(f0,f1,col)=>{ p.F(col); p.poly([[x0,sd*w0/2*f0],[x1,sd*w1/2*f0],[x1,sd*w1/2*f1],[x0,sd*w0/2*f1]]); };
    clipPoly([[x0,-w0/2],[x1,-w1/2],[x1,w1/2],[x0,w0/2]],()=>{
      st(-1.1,-0.66,R[3]); st(-0.66,-0.34,R[2]); st(-0.34,-0.1,Q[1]); st(-0.1,0.26,R[1]); st(0.26,0.7,Q[0]);
      if(hi) st(0.4,0.4+0.2*hi,R[0]);
      if(rf) st(-0.92,-0.78,rf[2]);
    });
    return sd;
  }
  // botão/rebite de metal: sombra projetada no pano, 3 tons, brilho especular de 1 px
  function stud(p,B,x,y,r,cloth,W){
    if(cloth){ p.F(cloth); p.ell(x+0.8,y+1.2,r*1.05,r*0.9); }
    p.F(B[3]); p.circle(P2(x,y),r); p.F(B[2]); p.circle(P2(x-0.2,y-0.2),r*0.82); p.F(B[1]); p.circle(P2(x+r*0.18,y-r*0.22),r*0.56);
    p.F(W||B[0]); p.rect(x+r*0.1,y-r*0.6,1,1);
  }
  // manchas de podridão na pele (meia-sombra roxa, miolo escuro, borda clara) e veias escuras ramificadas
  function rot(p,M,list,seed){ const R=M.skin, Q=Qo(R);
    list.forEach(([x,y,r],k)=>{ p.F(Q[1]); p.ell(x,y,r,r*0.72,rnd(seed,k)*PI); p.F(Q[2]); p.ell(x+r*0.2,y+r*0.15,r*0.4,r*0.28,rnd(seed,k)*PI);
      p.F(Q[0]); p.rect(x-r*0.8,y-r*0.9,Math.max(1,r*0.5),1); }); }
  function vein(p,M,pts,seed){ const Q=Qo(M.skin); p.F(Q[2]); bandA(p,pts,0.9);
    for(let k=1;k<pts.length;k++){ const q=pts[k], an=rnd(seed,k)*PI*2, L=2+rnd(seed,k+5)*3; p.cap(P2(q[0],q[1]),P2(q[0]+C(an)*L,q[1]+S(an)*L),0.8,0.4); } }

  /* ---------------- poses ----------------
     pa: ângulo da vara do trole (graus, convenção do lp: 0 baixo, 90 frente, 180 cima) · arc 0..1 arco elétrico na roda ·
     mva: ângulo da manivela na mão (graus, 0 = ao longo do antebraço) · plug 1 = manivela encaixada no controlador e
     girando (crank, rad) · chg: carga (0..1, lâmpadas) · bell: balanço do sino (graus) · ring 0..1 ondas da badalada ·
     bellOff: sino caído (morte) · zap: raio pra cima até o fio (faíscas da catenária) · spark: estouro de raios ·
     wire: fio da catenária visível (intro) · hide: fora do quadro */
  const REST={hx:0,drop:3,lean:4,head:0,aFs:18,aFe:34,aBs:-34,aBe:-6,lFh:16,lFk:-6,lBh:-10,lBk:-30,fF:0,fB:0,
    pa:180,pg:0,arc:0.25,mva:-14,plug:0,crank:0,chg:1,bell:0,ring:0,bellOff:0,zap:0,wire:0,
    roar:0,flash:0,smear:0,impact:0,spark:0,dead:0,hide:0,ph:0,pant:0};
  const W=(o)=>o;
  const ANIMS={
    idle:{nome:'Parado (a roda do trole crepita)',n:8,dur:()=>170,pose:i=>{ const p=i/8*PI*2, s=S(p);
      return {lean:5+1.6*s, drop:3+1.6*S(p-0.5), head:-1+2*S(p-0.9), aFs:18+4*S(p-0.4), aFe:34+5*S(p-0.9), aBs:-34+3*S(p+0.5), aBe:-6+3*S(p),
        pa:180+2*S(p+0.3), bell:4*S(p-0.6), arc:0.25+0.2*(i%2), ph:p}; }},
    walk:{nome:'Andar (passos pesados, a vara de cajado)',n:8,stomp:[0,4],dur:()=>160,pose:i=>{ const p=i/8*PI*2+PI/2;
      const lFh=10+22*S(p), lBh=-6+22*S(p+PI);
      return {lFh, lFk:lFh-24*Math.max(0,C(p))-4, lBh, lBk:lBh-24*Math.max(0,C(p+PI))-8, fF:-6*C(p), fB:-6*C(p+PI),
        drop:4+3*C(2*(p-PI/2)), lean:7+2*S(2*p), head:1+2*S(2*p-1), hx:1.4*S(2*p),
        aFs:16-16*S(p), aFe:30-10*S(p), aBs:-30+8*S(p), aBe:-6+6*S(p), pa:178+5*S(p), bell:8*S(p), arc:0.2+0.2*(i%2), ph:2*p}; }},
    swing:{nome:'Manivelada (cassetete de ferro)',n:8,warn:[1,2],hit:4,reach:80,dur:i=>[120,140,150,70,80,150,150,150][i],pose:i=>[
      W({lean:0,head:-6,aFs:40,aFe:80,mva:-40}),
      W({lean:-10,head:-12,aFs:150,aFe:200,mva:-90,lFh:22,lBh:-18,hx:-2}),
      W({lean:-14,head:-14,aFs:166,aFe:214,mva:-100,lFh:24,lBh:-20,hx:-3,roar:1}),
      W({lean:10,head:2,aFs:120,aFe:110,mva:-10,smear:1,hx:3,lFh:30,lFk:-6,lBh:-20,lBk:-40}),
      W({lean:22,head:10,drop:8,aFs:70,aFe:60,mva:10,impact:1,spark:1,hx:6,lFh:40,lFk:-8,lBh:-24,lBk:-44}),
      W({lean:20,head:10,drop:8,aFs:60,aFe:50,mva:10,hx:6,lFh:40,lFk:-8,lBh:-24,lBk:-44}),
      W({lean:12,head:4,aFs:40,aFe:40,mva:0,hx:3}),
      W({lean:5,head:0,aFs:20,aFe:34})][i]},
    pole:{nome:'Vara do trole (arco elétrico em área)',n:10,warn:[1,2,3,4],hit:5,dur:i=>[150,150,140,140,90,90,160,160,170,170][i],pose:i=>[
      W({lean:-4,head:-8,aBs:60,aBe:90,pa:190,aFs:30,aFe:60}),
      W({lean:-14,head:-18,aBs:150,aBe:170,pa:204,pg:40,arc:0.5,aFs:60,aFe:100,lFh:20,lBh:-16}),
      W({lean:-16,head:-20,aBs:160,aBe:178,pa:208,pg:44,arc:0.8,aFs:70,aFe:110,lFh:22,lBh:-18,roar:1}),
      W({lean:-17,head:-22,aBs:164,aBe:180,pa:210,pg:46,arc:1,aFs:74,aFe:114,lFh:22,lBh:-18,roar:1,spark:1}),
      W({lean:8,head:-2,aBs:120,aBe:110,pa:130,pg:56,arc:1,smear:1,aFs:40,aFe:60,hx:4,lFh:32,lFk:-6,lBh:-22,lBk:-40}),
      W({lean:22,head:8,drop:10,aBs:92,aBe:70,pa:72,pg:64,arc:1,zap:1,impact:1,aFs:30,aFe:40,hx:8,lFh:42,lFk:-6,lBh:-26,lBk:-46}),
      W({lean:22,head:8,drop:10,aBs:90,aBe:68,pa:72,pg:64,arc:0.8,zap:0.7,aFs:30,aFe:40,hx:8,lFh:42,lFk:-6,lBh:-26,lBk:-46}),
      W({lean:18,head:6,drop:8,aBs:80,aBe:64,pa:80,pg:56,arc:0.5,zap:0.35,aFs:26,aFe:36,hx:6,lFh:36,lFk:-6,lBh:-22,lBk:-42}),
      W({lean:10,head:2,aBs:30,aBe:40,pa:150,pg:24,arc:0.3,hx:2}),
      W({lean:5,head:0,aBs:-12,aBe:14,pa:172})][i]},
    bell:{nome:'Badalada do sino (atordoa em volta)',n:9,warn:[1,2,3],hit:4,dur:i=>[130,140,150,140,90,150,150,160,170][i],pose:i=>[
      W({lean:2,head:6,aFs:30,aFe:120,mva:-60}),
      W({lean:-6,head:-4,aFs:70,aFe:170,mva:-110,bell:-10,lFh:20,lBh:-14}),
      W({lean:-10,head:-10,aFs:100,aFe:200,mva:-120,bell:-16,lFh:22,lBh:-16,roar:1}),
      W({lean:-12,head:-12,aFs:110,aFe:210,mva:-126,bell:-20,lFh:22,lBh:-16,roar:1}),
      W({lean:10,head:4,drop:6,aFs:50,aFe:120,mva:-80,bell:30,ring:0.35,impact:1,spark:1,lFh:30,lFk:-10,lBh:-20,lBk:-40}),
      W({lean:8,head:2,drop:6,aFs:46,aFe:110,mva:-76,bell:-24,ring:0.7,roar:1,lFh:30,lFk:-10,lBh:-20,lBk:-40}),
      W({lean:6,head:0,drop:4,aFs:40,aFe:90,mva:-60,bell:16,ring:1}),
      W({lean:5,head:0,aFs:30,aFe:60,mva:-30,bell:-8}),
      W({lean:5,head:0,aFs:20,aFe:34,bell:3})][i]},
    spark:{nome:'Faíscas da catenária (engata o trole no fio)',n:10,castAt:3,dur:i=>[150,150,150,120,140,140,140,140,160,170][i],pose:i=>[
      W({lean:-2,head:-10,aBs:40,aBe:70,pa:180}),
      W({lean:-10,head:-24,aBs:150,aBe:170,pa:182,arc:0.5,lFh:18,lBh:-14}),
      W({lean:-14,head:-30,aBs:172,aBe:184,pa:184,arc:0.9,wire:1,lFh:20,lBh:-16,aFs:60,aFe:110,mva:-60}),
      W({lean:-14,head:-30,aBs:174,aBe:186,pa:185,arc:1,wire:1,zap:1,spark:1,roar:1,lFh:20,lBh:-16,aFs:80,aFe:140,mva:-80}),
      W({lean:-15,head:-32,aBs:176,aBe:186,pa:186,arc:1,wire:1,zap:0.8,spark:1,roar:1,lFh:20,lBh:-16,aFs:84,aFe:146,mva:-80,hx:1}),
      W({lean:-15,head:-32,aBs:176,aBe:186,pa:184,arc:1,wire:1,zap:1,spark:1,roar:1,lFh:20,lBh:-16,aFs:84,aFe:146,mva:-80,hx:-1}),
      W({lean:-14,head:-30,aBs:174,aBe:184,pa:183,arc:0.9,wire:1,zap:0.6,roar:1,lFh:20,lBh:-16,aFs:70,aFe:120,mva:-60}),
      W({lean:-8,head:-20,aBs:140,aBe:160,pa:180,arc:0.6,wire:0.5,aFs:40,aFe:70}),
      W({lean:0,head:-8,aBs:40,aBe:60,pa:176,arc:0.4}),
      W({lean:5,head:0,aBs:-12,aBe:14,pa:172})][i]},
    bonde:{nome:'Bonde sem freio (gira a manivela e toca o sino)',n:10,callAt:5,dur:i=>[150,110,110,110,110,140,150,170,170,200][i],pose:i=>{
      const cr={plug:1,lean:14,head:6,aBs:-6,aBe:20,pa:166,chg:1};
      return [
        W({lean:6,head:8,aFs:60,aFe:120,mva:-60}),
        Object.assign({},cr,{crank:0}),
        Object.assign({},cr,{crank:PI*0.5,roar:1}),
        Object.assign({},cr,{crank:PI,roar:1,spark:1}),
        Object.assign({},cr,{crank:PI*1.5,roar:1}),
        W({lean:-10,head:-16,aFs:110,aFe:200,mva:-120,bell:28,ring:0.6,roar:1,spark:1,aBs:20,aBe:40,pa:150}),
        W({lean:-6,head:-12,aFs:90,aFe:170,mva:-100,bell:-24,ring:1,roar:1,aBs:20,aBe:40,pa:150}),
        W({lean:18,head:4,aFs:20,aFe:40,aBs:90,aBe:96,pa:96,arc:0.8,lFh:34,lFk:-6,lBh:-22,lBk:-42,roar:1}),
        W({lean:18,head:4,aFs:20,aFe:40,aBs:92,aBe:96,pa:94,arc:1,lFh:34,lFk:-6,lBh:-22,lBk:-42,roar:1,spark:1}),
        W({lean:18,head:6,aFs:20,aFe:40,aBs:92,aBe:96,pa:94,arc:0.8,lFh:34,lFk:-6,lBh:-22,lBk:-42,roar:0})][i]; }},
    recharge:{nome:'Recarregando a manivela (VULNERÁVEL)',n:8,vuln:[0,1,2,3,4,5,6,7],dur:()=>165,pose:i=>({plug:1,crank:i/8*PI*2,chg:i/7,
      lean:20+2*S(i/8*PI*4),head:14+3*S(i/8*PI*4+1),drop:8,aBs:-4,aBe:6,pa:150-2*S(i/8*PI*2),arc:0,pant:i%2,lFh:24,lFk:-12,lBh:-14,lBk:-40})},
    rage:{nome:'Entrar em fúria (a farda rasga, eletricidade vermelha)',n:9,dur:i=>[180,140,120,200,200,200,200,200,200][i],pose:i=>[
      W({lean:22,head:22,aFs:40,aFe:130,mva:-70,aBs:20,aBe:60,pa:140,drop:6}),
      W({lean:24,head:26,aFs:44,aFe:140,mva:-74,aBs:24,aBe:70,pa:136,drop:8,spark:1,hx:-1}),
      W({lean:-10,head:-20,aFs:120,aFe:140,mva:-30,aBs:150,aBe:170,pa:186,arc:1,roar:1,spark:1,flash:0}),
      W({lean:-16,head:-28,aFs:134,aFe:150,mva:-30,aBs:166,aBe:182,pa:188,arc:1,roar:1,spark:1,zap:1,wire:1}),
      W({lean:-17,head:-30,aFs:136,aFe:154,mva:-30,aBs:168,aBe:184,pa:186,arc:1,roar:1,spark:1,zap:0.7,wire:1,hx:2}),
      W({lean:-17,head:-30,aFs:136,aFe:154,mva:-30,aBs:168,aBe:184,pa:188,arc:1,roar:1,spark:1,zap:1,wire:1,hx:-2}),
      W({lean:-12,head:-22,aFs:110,aFe:130,mva:-20,aBs:140,aBe:160,pa:180,arc:0.8,roar:1,zap:0.3}),
      W({lean:0,head:-8,aFs:50,aFe:60,aBs:40,aBe:60,pa:176,arc:0.5}),
      W({lean:5,head:0,aFs:18,aFe:34,aBs:-12,aBe:14,pa:172})][i]},
    hurt:{nome:'Dano',n:4,dur:i=>[80,110,130,160][i],pose:i=>[
      W({flash:1,lean:-12,head:-18,hx:-6,aFs:-10,aFe:0,aBs:-30,aBe:-10,pa:196,roar:1,bell:-20,arc:1,spark:1}),
      W({lean:-8,head:-12,hx:-4,aFs:4,aFe:14,aBs:-22,aBe:0,pa:188,roar:1,bell:14}),
      W({lean:-2,head:-4,hx:-1,aFs:14,aFe:28,pa:178,bell:-6}),
      W({})][i]},
    intro:{nome:'Entrada (WARNING): desce do fio pendurado no trole, toca o sino e ruge',n:12,dur:i=>[300,180,160,110,170,180,170,110,200,220,240,260][i],pose:i=>{
      const hang={aBs:176,aBe:180,pa:180,arc:1,wire:1,lFh:30,lFk:10,lBh:-4,lBk:-30,fF:30,fB:30,aFs:40,aFe:60};
      return [
        Object.assign({},hang,{hide:1}),
        Object.assign({},hang,{drop:-210,spark:1}),
        Object.assign({},hang,{drop:-130,spark:1,lean:-4}),
        Object.assign({},hang,{drop:-50,smear:1,lean:-6,head:-10}),
        W({drop:16,lean:30,head:18,lFh:52,lFk:-40,lBh:-12,lBk:-80,aFs:60,aFe:20,aBs:120,aBe:110,pa:150,impact:1,spark:1,arc:1}),
        W({drop:12,lean:24,head:12,lFh:46,lFk:-32,lBh:-12,lBk:-70,aFs:40,aFe:20,aBs:80,aBe:80,pa:160,arc:0.6}),
        W({lean:-4,head:2,aFs:70,aFe:170,mva:-110,bell:-12,pa:170}),
        W({lean:8,head:6,drop:4,aFs:50,aFe:120,mva:-80,bell:30,ring:0.5,impact:0,spark:1,pa:170}),
        W({lean:6,head:2,aFs:46,aFe:110,mva:-76,bell:-24,ring:1,pa:170}),
        W({lean:-14,head:-26,aFs:120,aFe:140,mva:-30,aBs:166,aBe:182,pa:186,arc:1,roar:1,spark:1,zap:1,wire:1}),
        W({lean:-16,head:-28,aFs:130,aFe:150,mva:-30,aBs:168,aBe:184,pa:188,arc:1,roar:1,spark:1,zap:0.6,wire:1}),
        W({lean:5,head:0,pa:172})][i]; }},
    death:{nome:'Morte (a carga acaba, o sino cai, ajoelha e apaga)',n:14,dur:i=>[90,160,170,170,170,180,180,180,200,200,220,240,400,700][i],pose:i=>{
      const kn={lean:26,head:40,drop:0,lFh:92,lFk:-2,lBh:6,lBk:-86,fF:0,fB:-80,aFs:4,aFe:10,aBs:-4,aBe:4,pa:250,arc:0,chg:0,bellOff:1,mva:30};
      return [
        W({flash:1,lean:-14,head:-20,hx:-6,aFs:-10,aFe:0,roar:1,arc:1,spark:1,chg:0.8}),
        W({lean:-18,head:-28,hx:-8,aFs:120,aFe:150,aBs:150,aBe:170,pa:200,arc:1,roar:1,spark:1,zap:1,chg:0.6}),
        W({lean:10,head:20,aFs:20,aFe:10,pa:150,arc:0.6,chg:0.5,bell:30}),
        W({lean:16,head:26,drop:8,lFh:44,lFk:-34,lBh:-10,lBk:-70,aFs:10,aFe:0,pa:140,arc:0.4,chg:0.4,spark:1,bell:-26}),
        W({lean:20,head:30,drop:24,lFh:70,lFk:-10,lBh:16,lBk:-80,aFs:10,aFe:0,pa:150,arc:0.2,chg:0.3,bellOff:0.5}),
        Object.assign({},kn,{chg:0.3,impact:1,pa:210,bellOff:1}),
        Object.assign({},kn,{chg:0.2,pa:240,spark:1}),
        Object.assign({},kn,{chg:0.2,pa:256,impact:1}),
        Object.assign({},kn,{chg:0.1,head:44}),
        Object.assign({},kn,{chg:0.1,head:48,lean:30}),
        Object.assign({},kn,{chg:0,head:52,lean:34,aFs:2,aFe:2,spark:1}),
        Object.assign({},kn,{chg:0,head:54,lean:36,aFs:0,aFe:0}),
        Object.assign({},kn,{chg:0,head:54,lean:36,aFs:0,aFe:0,dead:0.6}),
        Object.assign({},kn,{chg:0,head:54,lean:36,aFs:0,aFe:0,dead:1})][i]; }},
    xBonde:{nome:'Bonde de Santa Teresa sem freio (de perfil)',n:2,prop:true,dur:()=>90,pose:i=>({st:i})},
    xFaisca:{nome:'Faísca da catenária (cai, estoura, apaga)',n:3,prop:true,dur:()=>90,pose:i=>({st:i})},
  };
  function fix(P,anim,i){ if(!P.pg){ if(P.aBs>130&&P.pa>165) P.pg=72; else if(P.pa<115&&anim!=='death') P.pg=60; } if(!(anim==='death'&&i>=5)){ P.lean+=8; P.head-=4; P.lFk=Math.min(P.lFk,P.lFh-16); P.lBk=Math.min(P.lBk,P.lBh-16); } }

  const RG=K_.rig({AX,GROUND,THI:44,SHN:42,UPA,FOA,hipW:13,neck:[22,-128],shF:[24,-116],shB:[-20,-120],HS:1.22,FT:14,FL:28,
    contacts:(b,P)=>[b.T(0,16).y,b.T(-32,-60).y+2,b.H(-10,-40).y+2,b.kneeF.y+12,b.kneeB.y+12]});
  // soquete da manivela no controlador e ponta da manivela girando (no quadro do quadril)
  function socket(sk){ return sk.T(44,-70); }
  function crankTip(sk,P){ const s=socket(sk); return P2(s.x+C(P.crank)*26, s.y-12+S(P.crank)*3); }
  function skeleton(P){
    const sk=RG.skeleton(P);
    if(P.plug>0.5){ const t=crankTip(sk,P), r=ik(sk.shF,t,UPA,FOA,true); sk.elF=r.E; sk.wrF=r.W; }
    return sk;
  }
  const poleDir=P=>{ const a=rad(P.pa); return P2(S(a),C(a)); };
  function poleGeom(sk,P){ const d=poleDir(P), g=sk.wrB, n=P2(-d.y,d.x);
    const b0=34+(P.pg||0), L=POLE-(P.pg||0); return {d,n,g,butt:P2(g.x-d.x*b0,g.y-d.y*b0),tip:P2(g.x+d.x*L,g.y+d.y*L),at:t=>P2(g.x+d.x*(-b0+(L+b0)*t),g.y+d.y*(-b0+(L+b0)*t))}; }

  /* ---------------- vara do trole ---------------- */
  function drawPole(p,M,sk,P){
    p.id(); const G=poleGeom(sk,P), R=M.pole, {d,n,butt,tip}=G;
    // corda pendurada (puxa a vara de volta pro fio)
    const r0=G.at(0.86), mid=lerp(r0,butt,0.5);
    rope(p,M.rope,bez(r0,P2(mid.x+6,mid.y+34),P2(butt.x+2,butt.y+8),8),1.8);
    p.F(R[3]); p.cap(butt,tip,7.6,5.4);
    p.F(R[2]); p.cap(butt,tip,6,4);
    p.F(R[1]); p.cap(P2(butt.x-n.x*0.8,butt.y-n.y*0.8),P2(tip.x-n.x*0.6,tip.y-n.y*0.6),3.6,2.4);
    p.F(R[0]); p.cap(P2(butt.x-n.x*1.6,butt.y-n.y*1.6),P2(tip.x-n.x*1.2,tip.y-n.y*1.2),1,0.8);
    // manchas de tinta gasta e ferrugem
    p.F(R[3]); [0.3,0.47,0.7].forEach((t,k)=>{ const q=G.at(t); p.ell(q.x+n.x*1.2,q.y+n.y*1.2,2.4+k*0.4,1.2,Math.atan2(d.y,d.x)); });
    // colares de aço
    [0.12,0.52,0.9].forEach(t=>{ const q=G.at(t); p.F(M.steel[3]); p.cap(P2(q.x-n.x*5,q.y-n.y*5),P2(q.x+n.x*5,q.y+n.y*5),4,4); p.F(M.steel[1]); p.cap(P2(q.x-n.x*4.4,q.y-n.y*4.4),P2(q.x+n.x*4,q.y+n.y*4),2.4,2.4); p.F(M.steel[0]); p.rect(q.x-n.x*3.4-0.5,q.y-n.y*3.4-0.5,1.2,1.2); });
    // mola da base
    for(let k=0;k<5;k++){ const q=G.at(0.015+k*0.02); p.F(k%2?M.steel[2]:M.steel[1]); p.cap(P2(q.x-n.x*5.6,q.y-n.y*5.6),P2(q.x+n.x*5.6,q.y+n.y*5.6),2,2); }
    // cabeça (garfo) + roda de latão
    const hd=P2(tip.x+d.x*5,tip.y+d.y*5);
    p.F(M.steel[3]); p.cap(tip,hd,8,7); p.F(M.steel[2]); p.cap(P2(tip.x-n.x*3,tip.y-n.y*3),P2(hd.x-n.x*3,hd.y-n.y*3),2.4,2); p.cap(P2(tip.x+n.x*3,tip.y+n.y*3),P2(hd.x+n.x*3,hd.y+n.y*3),2.4,2);
    const wc=P2(hd.x+d.x*4,hd.y+d.y*4);
    p.F(M.brass[3]); p.circle(wc,8.2); p.F(M.brass[2]); p.circle(wc,7); p.F(M.brass[1]); p.circle(P2(wc.x-0.6,wc.y-0.8),5.4);
    p.F(M.brass[3]); p.circle(wc,3.4); p.F(M.brass[0]); p.rect(wc.x-4,wc.y-5,2,1.2); p.F(M.steel[1]); p.circle(wc,1.6);
    p.F(M.burn[2]); p.ell(wc.x+3,wc.y+3,2,1.2);
  }
  // crepitar da roda (camada emissiva por cima)
  function drawPoleArc(p,M,sk,P,seed){
    if(P.arc<0.15) return; p.id(); const G=poleGeom(sk,P), wc=P2(G.tip.x+G.d.x*9,G.tip.y+G.d.y*9), V=M.volt, a=P.arc;
    p.F(V[2]); p.circle(wc,3+a*4); p.F(V[1]); p.circle(wc,2+a*2.6); p.F(V[0]); p.circle(wc,1.4+a);
    const n=Math.round(2+a*4); for(let k=0;k<n;k++){ const an=rnd(seed,k)*PI*2, L=10+a*16*rnd(seed,k+4); bolt(p,V,wc,P2(wc.x+C(an)*L,wc.y+S(an)*L),seed+k,1); }
  }

  /* ---------------- manivela ---------------- */
  function drawCrankInHand(p,M,wr,ang,P){
    // punho de madeira dentro da mão, braço de ferro saindo (ângulo mva em relação ao antebraço), luva de engate dentada
    const a=ang+rad(P.mva); p.xf(a,wr.x,wr.y); const I=M.steel, sd=K_.lightLocal(a)[1]<0?-1:1;
    // barra de ferro: núcleo escuro, meia-luz, faixa clara e risco especular do lado da luz; reflexo escuro do outro
    p.F(I[3]); p.cap(P2(4,0),P2(52,0),8.4,7.4); p.F(I[2]); p.cap(P2(4,sd*0.6),P2(52,sd*0.6),6.4,5.6);
    p.F(Qo(I)[0]); p.cap(P2(6,sd*1.4),P2(50,sd*1.4),3.6,3); p.F(I[1]); p.cap(P2(6,sd*1.8),P2(50,sd*1.8),2.2,1.8);
    p.F(I[0]); p.rect(14,sd*2.2-0.5,28,1); p.F(M.fx[0]); p.rect(24,sd*2.2-0.5,3,1);
    p.F(Qo(I)[2]); p.rect(10,-sd*2.6-0.5,34,1);
    // colar do punho
    p.F(I[3]); p.cap(P2(12,-4.6),P2(12,4.6),3.4,3.4); p.F(I[1]); p.rect(11.4,-3.6,1.2,6); p.F(I[0]); p.rect(11.4,sd*3-0.5,1.2,1);
    // luva de engate (quadrada, dentes)
    platePoly(p,I,[[46,-8],[60,-8],[62,-5],[62,5],[60,8],[46,8]],a,1);
    p.F(I[3]); [[-5],[0],[5]].forEach(([y])=>p.rect(60,y-1,4,2)); p.F(I[0]); p.rect(48,sd*7-0.5,10,1); p.F(M.fx[0]); p.rect(50,sd*7-0.5,2,1);
    p.F(I[3]); p.rect(52,-6,1,12); p.F(I[2]); p.rect(53,-6,0.8,12);
    p.F(M.burn[2]); p.ell(30,2,4,1.6); p.F(M.burn[3]); p.ell(31,2.4,1.8,0.8); p.F(M.ctrl[3]); p.ell(54,4,2.4,1.4); p.F(M.ctrl[2]); p.rect(36,-sd*1.6,2,1);
  }
  function drawCrankPlugged(p,M,sk,P){
    p.id(); const s=socket(sk), t=crankTip(sk,P), I=M.steel;
    // eixo vertical saindo do soquete + braço em perspectiva até a mão
    p.F(I[3]); p.cap(P2(s.x,s.y+2),P2(s.x,s.y-12),7,6); p.F(I[1]); p.cap(P2(s.x-1,s.y),P2(s.x-1,s.y-11),2.4,2);
    p.F(I[3]); p.cap(P2(s.x,s.y-12),t,7,6); p.F(I[2]); p.cap(P2(s.x,s.y-12.6),t,5,4.4); p.F(I[0]); p.cap(P2(s.x,s.y-14),P2(t.x,t.y-1.6),1,1);
    p.F(M.wood[3]); p.cap(P2(t.x,t.y),P2(t.x,t.y-9),6,5); p.F(M.wood[1]); p.cap(P2(t.x-0.8,t.y-1),P2(t.x-0.8,t.y-8),3,2.6);
  }

  /* ---------------- controlador (barriga) ---------------- */
  function drawController(p,M,sk,P,form){
    p.xf(sk.a,sk.hip.x,sk.hip.y); const A=sk.a, L=M.leather;
    // correias de couro
    p.F(L[3]); band(p,[P2(30,-70),P2(14,-118)],5); band(p,[P2(58,-68),P2(40,-112)],5); p.F(L[1]); band(p,[P2(30,-72),P2(15,-116)],2.6); band(p,[P2(58,-70),P2(41,-110)],2.6);
    p.F(M.brass[2]); p.rect(19,-104,5,5); p.F(M.brass[0]); p.rect(19,-104,5,1.4);
    // pilha de placas de resistência
    const x0=30, x1=62, y0=-66, y1=-16;
    p.F(M.ctrl[3]); p.poly([[x0,y0],[x1,y0],[x1+2,y1],[x0-2,y1]]);
    for(let k=0;k<7;k++){ const y=y0+3+k*7; platePoly(p,M.ctrl,[[x0-1,y],[x1-4,y],[x1+3,y+2.6],[x1-4,y+5],[x0-1,y+5]],A,0.7); p.F(M.ctrl[0]); p.rect(x0+2,y,18,0.8); p.F(M.dark[2]); p.rect(x0+4,y+5,x1-x0-10,1.6);
      p.F(M.steel[2]); p.circle(P2(x1-6,y+2.6),1.4); }
    // barra coletora vertical
    p.F(M.ctrl[2]); p.rect(x1-2,y0+2,3,y1-y0-4); p.F(M.ctrl[0]); p.rect(x1-2,y0+2,1,y1-y0-4);
    p.F(M.ctrl[3]); p.rect(x0-4,y1-2,x1-x0+8,4);
    // tampa de alumínio + soquete de latão
    platePoly(p,M.alu,[[x0-6,y0-6],[x1+6,y0-6],[x1+8,y0-2],[x1+6,y0+2],[x0-6,y0+2],[x0-8,y0-2]],A,1);
    p.F(M.alu[0]); p.rect(x0-4,y0-6,x1-x0+6,1); p.F(M.alu[3]); p.rect(x0-6,y0+1.6,x1-x0+12,1);
    p.F(Qo(M.alu)[2]); p.rect(x0+20,y0-5,6,1); p.F(M.fx[0]); p.rect(x1-6,y0-6,3,1); p.rect(x0-2,y0-5,1,1);
    p.F(M.brass[3]); p.ell(44,y0-6,6,2.6); p.F(M.brass[1]); p.ell(44,y0-6.6,4.4,1.8); p.F(M.brass[0]); p.rect(46,y0-8,2,1); p.F(M.dark[3]); p.rect(42.4,y0-7.6,3.2,2);
    // alavanca de reversão (pequena)
    p.F(M.steel[3]); p.cap(P2(56,y0-6),P2(60,y0-12),3,2.4); p.F(M.wood[1]); p.circle(P2(60,y0-12),2.2);
    // lâmpadas de carga
    for(let k=0;k<3;k++){ const on=P.chg>k/3+0.05, Lp=on?M.lamp:M.loff, y=y0+12+k*12; p.F(M.dark[3]); p.circle(P2(x1+4,y),3.4); p.F(Lp[2]); p.circle(P2(x1+4,y),2.6); p.F(Lp[1]); p.circle(P2(x1+3.6,y-0.4),1.6); p.F(Lp[0]); p.rect(x1+2.8,y-1.4,1,1); }
    stain(p,M.blood,36,-30,3,1,7);
  }
  function drawControllerGlow(p,M,sk,P){ p.xf(sk.a,sk.hip.x,sk.hip.y); for(let k=0;k<3;k++){ if(!(P.chg>k/3+0.05)) continue; p.F(M.lamp[1]); p.rect(64.4,-54+k*12-1.4,2,1.6); } }

  /* ---------------- sino ---------------- */
  function bellTop(sk){ return sk.T(52,-104); }
  function drawBell(p,M,sk,P){
    const top=bellTop(sk), B=M.bronze;
    let c=top, a=sk.a+rad(P.bell);
    if(P.bellOff>0.01){ const g=P2(sk.hip.x+70,GROUND-14); c=lerp(top,g,P.bellOff); a=lerp(P2(a,0),P2(rad(80),0),P.bellOff).x; }
    else { p.id(); chain(p,M.brass,[sk.T(30,-128),P2(top.x-1,top.y-8),top],0.8); }
    p.xf(a,c.x,c.y); { const X=K_.st.CTX, m=X.getTransform(); X.setTransform(m.a*1.35,m.b*1.35,m.c*1.35,m.d*1.35,m.e,m.f); }
    // alça, ombro, cintura e boca abaulada
    p.F(B[3]); p.ell(0,1,3.6,3.6); p.F(B[1]); p.ell(0,1,2,2);
    const sh=[[-6,4],[6,4],[9,10],[10,18],[14,24],[-14,24],[-10,18],[-9,10]];
    platePoly(p,B,sh,a,1);
    // bronze fundido em faixas verticais: sombra, meia-sombra, base, meia-luz, risco claro, reflexo escuro e rebate na borda
    clipPoly(sh,()=>{ const Q=Qo(B);
      p.F(B[3]); p.poly([[-16,0],[-8,0],[-11,26],[-16,26]]); p.F(B[2]); p.poly([[-8,0],[-4,0],[-6,26],[-11,26]]);
      p.F(Q[1]); p.poly([[-4,0],[-1,0],[-1.6,26],[-6,26]]);
      p.F(Q[0]); p.poly([[1.6,0],[6,0],[8.4,26],[2.6,26]]); p.F(B[0]); p.poly([[3,3],[4.6,3],[6.6,22],[4.8,22]]);
      p.F(B[2]); p.poly([[7.4,0],[16,0],[16,26],[10,26]]); p.F(Q[0]); p.poly([[11,12],[12.4,12],[14.6,23],[13,23]]);
      p.F(B[3]); p.rect(-16,4,32,1.6); });
    p.F(B[3]); p.rect(-14,22,28,2.4); p.F(B[1]); p.rect(-13,21.4,24,1); p.F(B[0]); p.rect(2,21.4,7,1);
    p.F(B[2]); p.rect(-12,15,24,1.4); p.F(B[0]); p.rect(2,15,5,0.8); p.F(Qo(B)[3]); p.rect(-11,16.4,22,0.8);
    p.F(M.fx[0]); p.rect(3.6,7,1,1.6); p.rect(5.2,17,1,1);
    // badalo
    p.F(M.steel[3]); p.circle(P2(-S(rad(P.bell))*4,27),3.4); p.F(M.steel[1]); p.circle(P2(-S(rad(P.bell))*4-0.8,26.4),1.6);
    p.F(M.burn[2]); p.ell(-4,12,2.6,1.6);
  }
  function drawRing(p,M,sk,P){
    if(P.ring<0.05) return; p.id(); const c=lerp(bellTop(sk),sk.T(34,-90),1), F=M.fx;
    [0,0.33,0.66].forEach((o,k)=>{ const r=20+P.ring*70-o*40; if(r<12) return;
      p.F(k===0?F[1]:F[2]); arc(p,c.x,c.y,r,r*0.8,-70,70,3.2-k*0.6,10); arc(p,c.x,c.y,r,r*0.8,110,250,3-k*0.6,10); });
    // anel no chão
    p.F(F[1]); arc(p,sk.hip.x+10,GROUND-2,30+P.ring*90,6+P.ring*12,0,360,2.4,24);
  }

  /* ---------------- membros ---------------- */
  function veins(p,M,pts,seed){ p.F(M.vein[3]); bandA(p,pts,2); p.F(M.vein[1]); bandA(p,pts,0.9);
    for(let k=1;k<pts.length-1;k++){ const q=pts[k], an=rnd(seed,k)*PI*2, L=4+rnd(seed,k+3)*5; p.F(M.vein[2]); p.cap(P2(q[0],q[1]),P2(q[0]+C(an)*L,q[1]+S(an)*L),1.2,0.5); } }
  function drawUpper(p,M,sh,el,front,P,fur){
    const {ang,L}=limb(p,sh,el), R=M.coat, Q=Qo(R);
    p.F(R[2]); p.cap(P2(0,0),P2(L,0),30,23);
    // manga em faixas (pontas ficam escuras = oclusão no ombro e no cotovelo)
    const sd=tube(p,R,4,L-5,29,22,ang,front?1:0.6,M.refl);
    // deltoide: calombo de luz no alto do ombro
    K_.clipEll(6,0,15,14,0,()=>{ p.F(Q[0]); p.ell(6,sd*9,12,5); p.F(R[0]); p.ell(8,sd*11.4,6,1.4); });
    // dobras de pano no cotovelo (sanfona) e prega puxada do ombro
    fold(p,R,[[L*0.55,-10],[L*0.62,-2],[L*0.58,7]],1.4); fold(p,R,[[L*0.8,-8],[L*0.86,2]],1.2);
    fold(p,R,[[L*0.7,-11],[L*0.75,-4]],1); fold(p,R,[[L*0.9,4],[L*0.94,9]],1);
    fold(p,R,[[L*0.2,-sd*6],[L*0.42,-sd*8]],1);
    p.F(R[3]); p.ell(L-2,-sd*7,5,3.4); // fundo da dobra do cotovelo
    if(fur&&front){ p.F(M.skin[2]); p.poly([[L*0.3,-8],[L*0.62,-11],[L*0.7,-2],[L*0.5,6],[L*0.28,2]]); p.F(M.skin[1]); p.ell(L*0.48,-4,6,3);
      p.F(R[3]); [[L*0.3,-8],[L*0.62,-11],[L*0.7,-2],[L*0.5,6],[L*0.28,2]].forEach((q,k)=>p.rect(q[0]-1,q[1]-1,2.4,2.4));
      veins(p,M,[[L*0.34,-2],[L*0.46,-6],[L*0.6,-4]],3); }
    // dragona: alça com botão
    p.F(R[3]); p.cap(P2(-4,-12),P2(10,-12),6,5); p.F(R[1]); p.cap(P2(-4,-13),P2(10,-13),3.4,3); p.F(R[0]); p.rect(-2,-14.4,9,0.8); p.F(M.trim[1]); p.cap(P2(-4,-10),P2(10,-10),1.4,1.4);
    stud(p,M.brass,-2,-12.4,2.4,R[3],M.fx[0]);
  }
  function drawFore(p,M,el,wr,front,P,fur){
    const {ang,L}=limb(p,el,wr), R=M.coat, T=M.trim;
    p.F(R[2]); p.cap(P2(0,0),P2(L,0),26,22);
    const sd=tube(p,R,4,L*0.7,25,22,ang,front?0.9:0.5,M.refl);
    fold(p,R,[[L*0.3,-8],[L*0.36,2]],1.2); fold(p,R,[[L*0.14,-sd*9],[L*0.2,-sd*3]],1); fold(p,R,[[L*0.5,sd*7],[L*0.58,sd*2]],0.9);
    // manga franzida em cima do punho + oclusão
    p.F(R[3]); p.rect(L*0.74-6.4,-11,1.8,22); p.F(Qo(R)[1]); p.rect(L*0.74-8.6,-10,2,20);
    // punho vinho com 2 botões (faixas)
    p.F(T[3]); p.cap(P2(L*0.74,-12.4),P2(L*0.74,12.4),9.4,9.4); p.F(T[2]); p.cap(P2(L*0.74,-11.6),P2(L*0.74,11.6),8,8);
    p.F(T[1]); p.cap(P2(L*0.73,sd*3),P2(L*0.73,sd*11),5,5); p.F(Qo(T)[1]); p.rect(L*0.74-3,-sd*10-0.5,6,1.6);
    p.F(T[0]); p.rect(L*0.7,sd>0?2:-10,1,8); p.F(T[3]); p.rect(L*0.74+3.2,-11,1,22);
    [-5,3].forEach(y=>stud(p,M.brass,L*0.74,y,1.8,T[3],M.fx[0]));
    if(fur){ p.F(M.skin[2]); p.poly([[L*0.1,6],[L*0.4,4],[L*0.5,11],[L*0.2,12]]); veins(p,M,[[L*0.16,9],[L*0.3,7],[L*0.44,9]],front?5:6); }
  }
  function drawHand(p,M,wr,ang,open){
    p.xf(ang,wr.x,wr.y); const R=M.leather, Q=Qo(R), sd=K_.lightLocal(ang)[1]<0?-1:1;
    // luva de couro de motorneiro (cano largo): faixas no cano, costura e brilho do couro
    p.F(R[3]); p.poly([[-6,-13],[4,-12],[4,12],[-6,13]]); p.F(R[2]); p.poly([[-5,sd*12],[3,sd*11],[3,sd*4],[-5,sd*4]]);
    p.F(Q[0]); p.rect(-5,sd*9-1,8,2); p.F(R[0]); p.rect(-4,sd*10-0.5,5,1); p.F(Q[2]); p.rect(-5,-sd*9-1,8,2);
    p.F(R[1]); [-8,-3,2,7].forEach(y=>p.rect(-2,y,1,1));
    if(!open){ p.F(R[2]); p.ell(9,0,13,11.6);
      K_.clipEll(9,0,13,11.6,0,()=>{ p.F(R[3]); p.ell(9,-sd*10,16,6); p.F(Q[1]); p.ell(9,-sd*5,15,5); p.F(R[1]); p.ell(10,sd*1,12,6);
        p.F(Q[0]); p.ell(11,sd*5,9,4); p.F(R[0]); p.ell(12,sd*7.4,5,1.6); p.F(R[3]); p.rect(-4,-12,3,24); });
      // nós dos dedos: 4 calombos com brilho, sulcos escuros entre eles
      [-7.5,-2.5,2.5,7.5].forEach((y,k)=>{ p.F(R[2]); p.ell(17,y,3.6,2.6); p.F(R[1]); p.ell(17.4,y+sd*0.8,2.4,1.6); if(sd*y>-3){ p.F(R[0]); p.rect(17,y+sd*1.4-0.5,1.4,1); } });
      p.F(R[3]); [-5,0,5].forEach(y=>p.cap(P2(13,y),P2(20,y+0.5),1.2,1.2));
      // polegar por cima do punho
      p.F(R[2]); p.cap(P2(6,sd*9),P2(15,sd*6),6,4.6); p.F(R[1]); p.cap(P2(7,sd*9.6),P2(14,sd*7),3,2.2); p.F(R[0]); p.rect(9,sd*10-0.5,3,1);
      p.F(R[3]); p.cap(P2(6,sd*6.4),P2(14,sd*4),1,0.8); }
    else { p.F(R[2]); p.ell(8,0,10,10);
      [[-24,17],[-8,19],[8,19],[22,17]].forEach(([a,Lf])=>{ const r=rad(a), e=P2(9+C(r)*Lf,S(r)*Lf); p.F(R[2]); p.cap(P2(9,S(r)*3),e,5.4,4.2); p.F(R[1]); p.cap(P2(9,S(r)*3-0.6),P2(e.x-0.5,e.y-0.7),3,2.2); p.F(R[3]); p.circle(e,1.1); });
      p.F(R[2]); p.cap(P2(4,-8),P2(11,-17),5.6,4.4); mass(p,R,6,0,9,9,ang,0.6); }
    p.F(R[3]); p.ell(10,5,2.6,1.4); p.F(M.blood[2]); p.ell(14,-3,1.6,1.2);
  }
  function drawLeg(p,M,hip,knee,ankle,fa,front){
    let t=limb(p,hip,knee); const R=M.coat;
    p.F(R[2]); p.cap(P2(0,0),P2(t.L,0),30,24);
    let sd=tube(p,R,5,t.L-4,29,23,t.ang,front?0.9:0.5,M.refl);
    // vinco da calça (risco claro) e dobras de tensão puxando pro joelho
    p.F(R[0]); bandA(p,[[t.L*0.18,sd*5],[t.L*0.8,sd*4]],0.8);
    fold(p,R,[[t.L*0.7,-10],[t.L*0.78,-3],[t.L*0.72,4]],1.2); fold(p,R,[[t.L*0.5,-sd*9],[t.L*0.62,-sd*4]],1); fold(p,R,[[t.L*0.86,sd*8],[t.L*0.92,sd*2]],1);
    p.F(R[3]); p.ell(t.L,-sd*9,5,3.4); // atrás do joelho
    p.F(M.trim[3]); p.cap(P2(0,-13),P2(t.L,-11.4),2.6,2.6); p.F(M.trim[2]); p.cap(P2(0,-12.6),P2(t.L,-11),1.6,1.6);
    t=limb(p,knee,ankle);
    p.F(R[2]); p.cap(P2(-2,0),P2(t.L*0.5,0),24,22);
    sd=tube(p,R,2,t.L*0.36,23,22,t.ang,front?0.7:0.4,M.refl);
    // rótula na luz + calça embolada em cima do cano da bota
    p.F(Qo(R)[0]); p.ell(1,sd*5,6,4); p.F(R[0]); p.rect(0,sd*7-0.5,3,1);
    fold(p,R,[[t.L*0.2,-10],[t.L*0.24,-2],[t.L*0.2,6]],1.1); fold(p,R,[[t.L*0.28,-6],[t.L*0.31,4]],1);
    // bota alta de couro envernizado
    const B=M.visor, BQ=Qo(B);
    p.F(B[2]); p.cap(P2(t.L*0.3,0),P2(t.L,0),24,22);
    clipPoly([[t.L*0.3,-12],[t.L+2,-11],[t.L+2,11],[t.L*0.3,12]],()=>{
      const st=(f0,f1,col)=>{ p.F(col); p.poly([[t.L*0.3,sd*12*f0],[t.L+2,sd*11*f0],[t.L+2,sd*11*f1],[t.L*0.3,sd*12*f1]]); };
      st(-1.1,-0.62,B[3]); st(-0.62,-0.3,BQ[1]); st(-0.05,0.55,B[1]); st(0.2,0.42,BQ[0]); st(0.62,0.8,BQ[1]); });
    p.F(B[0]); p.rect(t.L*0.42,sd*3-0.6,t.L*0.4,1.2); p.F(M.fx[0]); p.rect(t.L*0.5,sd*3-0.6,3,1.2); p.F(B[0]); p.rect(t.L*0.46,sd*6-0.5,t.L*0.18,1);
    p.F(B[3]); p.cap(P2(t.L*0.32,-12),P2(t.L*0.32,12),3,3); p.F(B[1]); p.rect(t.L*0.32+1.4,-11,0.8,22);
    // vincos do couro no tornozelo
    p.F(B[3]); [[0.84,-8,0.9,-2],[0.88,2,0.93,8],[0.8,-3,0.83,3]].forEach(([a,b,c,d])=>p.cap(P2(t.L*a,b),P2(t.L*c,d),1,0.8));
    p.F(B[1]); [[0.82,-8],[0.86,2]].forEach(([a,b])=>p.rect(t.L*a,b,1,4));
    p.F(M.dust[3]); p.ell(t.L*0.7,6,4,1.6); p.F(M.dust[2]); p.rect(t.L*0.62,7,3,1);
    p.xf(rad(fa),ankle.x,ankle.y);
    p.F(B[2]); p.poly([[-12,-10],[12,-10],[24,-4],[32,3],[32,11],[-14,11],[-14,-2]]);
    p.F(B[1]); p.poly([[-10,-9],[12,-9],[22,-3],[28,3],[18,4],[-8,2]]);
    p.F(BQ[0]); p.poly([[0,-9],[12,-9],[20,-4],[10,-3],[0,-5]]);
    // biqueira: arco de brilho, risco especular e sombra embaixo
    p.F(BQ[1]); p.poly([[14,4],[30,4],[32,9],[12,9]]); p.F(B[3]); p.rect(-14,6,46,1);
    p.F(B[0]); p.ell(22,0,4,1.4); p.F(M.fx[0]); p.rect(21,-0.6,2,1); p.F(B[0]); bandA(p,[[4,-8],[12,-7.4],[18,-4]],0.8);
    p.F(B[3]); p.rect(-14,9,46,3); p.F(M.leather[3]); p.rect(-13,8.4,44,1); p.F(M.leather[2]); p.rect(-12,8.4,10,1);
    p.F(M.dust[2]); p.ell(4,7,5,1.4); p.F(M.dust[1]); p.rect(2,6.4,3,1);
  }

  /* ---------------- tronco ---------------- */
  function drawPelvis(p,M,sk,P){
    p.xf(sk.a,sk.hip.x,sk.hip.y); const R=M.coat;
    const sk0=[[-24,-8],[28,-8],[30,10],[16,20],[-12,20],[-26,8]], Q=Qo(R), L=M.leather;
    p.F(R[2]); p.poly(sk0); p.F(R[1]); p.poly([[-18,-8],[26,-8],[28,4],[-16,6]]);
    clipPoly(sk0,()=>{ p.F(R[3]); p.poly([[-30,-10],[-18,-10],[-14,24],[-30,24]]); p.F(Q[1]); p.poly([[-18,-10],[-10,-10],[-6,24],[-14,24]]);
      p.F(Q[0]); p.poly([[10,-8],[24,-8],[26,4],[14,6]]); p.F(R[3]); p.rect(-30,-8,64,2.4); // oclusão do cinto
      // pregas da aba da farda
      fold(p,R,[[-4,-4],[-2,8],[-4,16]],1.1); fold(p,R,[[8,-4],[10,6],[8,14]],1); fold(p,R,[[20,-2],[22,8]],0.9);
      p.F(R[3]); p.poly([[-30,12],[34,6],[34,24],[-30,24]]); });
    // cinto + fivela + chave de reversão pendurada + estopa
    p.F(L[3]); p.rect(-25,-13,54,7); p.F(L[2]); p.rect(-24,-12,52,4); p.F(L[1]); p.rect(-24,-13,52,2); p.F(L[0]); p.rect(4,-13,14,0.8);
    p.F(L[1]); for(let x=-22;x<18;x+=3) p.rect(x,-8.4,1.4,0.8); // pesponto
    p.F(L[3]); [-14,8].forEach(x=>p.rect(x,-14,3,9)); p.F(L[1]); [-14,8].forEach(x=>p.rect(x,-14,1,9)); // passadores
    p.F(M.brass[3]); p.rect(20,-14,8,8); p.F(M.brass[2]); p.rect(20,-14,7,7); p.F(L[3]); p.rect(22,-12,4,4); p.F(M.brass[1]); p.rect(26,-13,1,6); p.F(M.brass[0]); p.rect(20,-14,8,1.2); p.F(M.fx[0]); p.rect(25,-14,1.4,1);
    p.F(M.steel[2]); p.rect(-20,-6,3,16); p.F(M.steel[1]); p.rect(-20,-6,1.4,15); p.F(M.steel[3]); p.rect(-23,8,9,4);
    p.F(M.rope[2]); p.poly([[-12,-6],[-4,-6],[-2,10],[-6,6],[-8,14],[-11,6],[-14,10]]); p.F(M.rope[1]); p.poly([[-11,-6],[-6,-6],[-6,4],[-9,2]]);
  }
  function drawTorso(p,M,sk,P,form){
    p.xf(sk.a,sk.hip.x,sk.hip.y); const R=M.coat, A=sk.a, fur=form==='furia';
    const jk=[[-26,6],[-32,-30],[-36,-82],[-32,-116],[-18,-130],[4,-134],[24,-132],[38,-120],[46,-98],[47,-62],[42,-22],[34,8]];
    p.F(R[1]); p.poly(jk);
    // cotovelo da frente no quadro do tronco (sombra projetada do braço no peito)
    const ca=C(sk.a), sa=S(sk.a), loc=q=>{ const dx=q.x-sk.hip.x, dy=q.y-sk.hip.y; return [dx*ca+dy*sa,-dx*sa+dy*ca]; }, eF=loc(sk.elF);
    clipPoly(jk,()=>{ const Q=Qo(R);
      // volume cilíndrico: costas na sombra, peito na luz; luz de cima (ombros claros, barriga/barra escurecendo)
      p.F(R[2]); p.poly([[-44,-140],[-12,-140],[-10,-96],[-6,-50],[-10,12],[-44,12]]);
      p.F(R[3]); p.poly([[-44,-96],[-28,-100],[-25,-60],[-22,-20],[-16,12],[-44,12]]);
      p.F(Q[1]); p.poly([[-12,-140],[-2,-140],[2,-96],[6,-50],[2,12],[-10,12],[-6,-50],[-10,-96]]);
      p.F(Q[0]); p.poly([[14,-138],[36,-138],[40,-100],[40,-60],[36,-24],[26,-24],[28,-60],[24,-100]]);
      p.F(R[0]); p.poly([[22,-132],[30,-132],[33,-106],[32,-84],[28,-84],[27,-106]]);
      p.F(Q[0]); p.ell(-6,-128,28,7); p.F(R[0]); p.ell(2,-131.4,15,2.6);
      p.F(Q[1]); p.poly([[-44,-34],[50,-42],[50,-26],[-44,-18]]); p.F(R[2]); p.poly([[-44,-18],[50,-26],[50,12],[-44,12]]);
      // luz rebatida fria na borda de trás
      p.F(M.refl[2]); p.poly([[-36,-110],[-33,-110],[-32,-82],[-28,-30],[-23,0],[-26,0],[-31,-30],[-35,-82]]);
      p.F(M.refl[1]); p.poly([[-35,-100],[-34,-100],[-33,-80],[-31,-50],[-32,-50],[-34,-80]]);
      // costura lateral e costura das costas
      p.F(R[3]); bandA(p,[[-6,-126],[-3,-92],[1,-52],[-2,0]],1); p.F(Q[0]); bandA(p,[[-4.6,-124],[-1.6,-92],[2.4,-52]],0.6);
      p.F(R[3]); bandA(p,[[-30,-112],[-28,-70],[-22,-10]],0.8);
      // oclusão sob a gola e sob a cabeça
      p.F(R[3]); p.poly([[0,-128],[36,-126],[34,-118],[22,-114],[4,-118]]); p.F(Q[1]); p.poly([[2,-118],[22,-114],[34,-118],[34,-112],[20,-108],[4,-112]]);
      // sombra do braço da frente caindo no peito (segue o cotovelo)
      const s0=[24,-114], e0=[s0[0]+(eF[0]-s0[0])*0.8-6,s0[1]+(eF[1]-s0[1])*0.8+4];
      p.F(Q[1]); p.cap(P2(s0[0]-6,s0[1]+4),P2(e0[0],e0[1]),26,20); p.F(R[3]); p.cap(P2(s0[0]-8,s0[1]+8),P2(e0[0]-2,e0[1]+2),12,8);
      // sombra do controlador e das correias na farda
      p.F(R[3]); p.poly([[22,-74],[30,-72],[28,-14],[20,-16]]); p.F(Q[1]); p.poly([[14,-74],[22,-74],[20,-16],[12,-18]]);
      p.F(R[3]); band(p,[P2(27,-66),P2(11,-114)],4); band(p,[P2(55,-64),P2(37,-108)],4);
      p.F(Q[1]); p.ell(36,-88,6,12); // sino
      // dobras: tensão do sovaco pra barriga, franzido na cintura, costas
      fold(p,R,[[-18,-98],[-12,-72],[-14,-40]]); fold(p,R,[[0,-30],[14,-22],[28,-24]]); fold(p,R,[[30,-104],[36,-84]]);
      fold(p,R,[[30,-96],[20,-84],[8,-78]],1.2); fold(p,R,[[34,-78],[22,-66],[12,-62]],1.1); fold(p,R,[[-24,-10],[-12,-14],[2,-9]],1.2);
      fold(p,R,[[6,-12],[18,-16],[30,-12]],1.1); fold(p,R,[[-24,-56],[-18,-46],[-20,-34]],1); fold(p,R,[[-20,-118],[-10,-112]],1);
      // bolso com lapela
      p.F(R[3]); p.poly([[-4,-48],[16,-50],[17,-40],[-3,-38]]); p.F(R[1]); p.poly([[-3,-48],[15,-49.6],[15.6,-42],[-2,-40.4]]);
      p.F(R[0]); p.rect(-2,-48.6,16,0.8); p.F(R[3]); p.rect(-2,-38.4,18,1.4); stud(p,M.brass,6,-43,1.8,R[3],M.fx[0]);
      // gasto do tecido (pontilhado claro no alto, escuro embaixo)
      for(let k=0;k<26;k++){ const x=-30+rnd(5,k)*72, y=-128+rnd(9,k)*124; p.F(y<-70?Q[0]:R[3]); p.rect(x,y,1,1); }
      // barra da farda
      p.F(R[3]); p.poly([[-26,0],[34,0],[34,10],[-26,10]]); p.F(R[2]); p.rect(-26,-1.4,60,1.4);
      // vivo vinho da frente + abotoamento duplo
      p.F(R[3]); bandA(p,[[37,-122],[41,-96],[42,-60],[37,-20],[31,4]],1.2);
      p.F(M.trim[3]); bandA(p,[[40,-122],[44,-96],[45,-60],[40,-20],[34,4]],2.8); p.F(M.trim[1]); bandA(p,[[40,-122],[44,-96],[45,-60],[40,-20]],1.6); p.F(M.trim[0]); bandA(p,[[39,-120],[43,-96],[44,-62]],0.8);
      for(let k=0;k<4;k++){ [20,34].forEach(x=>{ const y=-112+k*20; stud(p,M.brass,x,y,2.6,R[3],k<2?M.fx[0]:M.brass[0]); }); }
      // remendo e mofo
      p.F(K_.qOf(R)[2]); [[-22,-52,5,3],[26,-44,3,2],[-6,-16,6,3]].forEach(([x,y,rx,ry])=>p.ell(x,y,rx,ry));
      stitches(p,R,[[-24,-80],[-14,-86],[-6,-82]],4,3);
      stain(p,M.blood,28,-56,4,2,5);
      // marcas de queimado (o choque)
      p.F(M.burn[2]); p.ell(-10,-104,6,4); p.F(M.burn[3]); p.ell(-10,-104,3,2);
      if(fur){ // farda rasgada: buraco no peito com a pele marcada pelo raio
        const hole=[[-8,-112],[10,-118],[22,-100],[18,-78],[24,-60],[6,-52],[-4,-66],[-14,-74],[-12,-94]];
        p.F(M.skin[2]); p.poly(hole); mass(p,M.skin,6,-86,16,22,A,0.8);
        veins(p,M,[[-4,-100],[4,-90],[0,-80],[10,-70],[14,-60]],11); veins(p,M,[[4,-90],[14,-98],[18,-108]],12); veins(p,M,[[0,-80],[-8,-72]],13);
        p.F(R[3]); hole.forEach((q,k)=>{ const nq=hole[(k+1)%hole.length]; for(let s=0;s<3;s++){ const t=s/3; p.poly([[q[0]+(nq[0]-q[0])*t,q[1]+(nq[1]-q[1])*t],[q[0]+(nq[0]-q[0])*(t+0.16),q[1]+(nq[1]-q[1])*(t+0.16)-3],[q[0]+(nq[0]-q[0])*(t+0.3),q[1]+(nq[1]-q[1])*(t+0.3)]]); } });
        p.F(R[0]); p.rect(-20,-40,6,1); p.F(R[3]); p.poly([[-30,-20],[-22,-24],[-24,-10]]);
      }
    });
    // gola alta com galão
    p.F(R[3]); p.poly([[4,-136],[30,-134],[32,-122],[6,-124]]); p.F(R[1]); p.poly([[6,-135],[28,-133],[30,-126],[8,-127]]);
    p.F(Qo(R)[0]); p.poly([[16,-134.4],[28,-133],[29.4,-128],[18,-129]]); p.F(R[0]); p.rect(20,-134,7,0.8); p.F(Qo(R)[1]); p.rect(6,-131,8,3);
    p.F(M.trim[2]); p.rect(6,-127,24,2); p.F(M.trim[0]); p.rect(16,-127,10,0.8); p.F(M.brass[2]); p.rect(26,-133,3,4); p.F(M.brass[0]); p.rect(27,-133,1,1); p.F(M.shirt[1]); p.rect(28,-136,4,2);
  }

  /* ---------------- cabeça ---------------- */
  function drawCap(p,M,fur){
    const R=M.coat, V=M.visor;
    // copa alta e reta, levemente inclinada pra frente
    const cr=[[-16,-32],[-18,-50],[-12,-60],[22,-62],[32,-56],[30,-34]];
    const Q=Qo(R), T=M.trim, Br=M.brass;
    platePoly(p,R,cr,0,1);
    clipPoly(cr,()=>{ // copa em faixas: trás escuro, frente acesa, tampo claro (luz de cima), vincos do pano
      p.F(R[3]); p.poly([[-20,-64],[-12,-64],[-11,-30],[-20,-30]]); p.F(R[2]); p.poly([[-12,-64],[-3,-64],[-2,-30],[-11,-30]]);
      p.F(Q[1]); p.poly([[-3,-64],[4,-64],[5,-30],[-2,-30]]);
      p.F(Q[0]); p.poly([[12,-64],[27,-64],[31,-30],[18,-30]]); p.F(R[0]); p.poly([[21,-60],[24.6,-60],[28,-42],[24.4,-42]]);
      p.F(Q[0]); p.poly([[-14,-62],[26,-64],[32,-56.6],[-16,-55]]); p.F(R[0]); bandA(p,[[-8,-59.4],[22,-61]],1.4);
      p.F(R[3]); bandA(p,[[28,-58],[31,-38]],1.2);
      fold(p,R,[[2,-58],[4,-47],[2,-41]],1); fold(p,R,[[-6,-56],[-5,-44]],0.9); fold(p,R,[[12,-56],[14,-50]],0.8);
      p.F(R[3]); p.rect(-20,-43,56,2.6); p.F(Q[1]); p.rect(-20,-45.4,56,2.4); });
    p.F(R[3]); bandA(p,[[-15,-48],[-14,-36]],1.4);
    // faixa vinho em faixas + galão de latão com brilho
    p.F(T[3]); p.rect(-16,-40,48,8); p.F(T[2]); p.rect(-6,-40,38,7); p.F(T[1]); p.rect(-15,-40,46,2.4); p.F(Qo(T)[0]); p.rect(10,-40,20,4); p.F(T[0]); p.rect(14,-39.6,12,1);
    p.F(T[3]); p.rect(-16,-34.6,48,1.2);
    p.F(Br[3]); p.rect(-16,-33,48,2.4); p.F(Br[2]); p.rect(-8,-33,40,1.6); p.F(Br[1]); p.rect(8,-33,22,1); p.F(Br[0]); [-10,-2,6,14,22].forEach(x=>p.rect(x,-33,2,0.8)); p.F(M.fx[0]); p.rect(18,-33,1.4,0.8);
    // distintivo: roda alada genérica (relevo, especular)
    const bx=20, by=-48; p.F(R[3]); p.circle(P2(bx+0.8,by+1.2),5.6);
    p.F(Br[3]); p.circle(P2(bx,by),5.4); p.F(Br[2]); p.circle(P2(bx,by),4.6); p.F(Br[1]); p.circle(P2(bx+0.6,by-0.6),3.4); p.F(Br[3]); p.circle(P2(bx,by),2); p.F(Br[2]); p.circle(P2(bx-0.3,by+0.3),1); p.F(Br[0]); p.rect(bx+1,by-4.4,2,1.2); p.F(M.fx[0]); p.rect(bx+2,by-4.4,1,1);
    p.F(Br[3]); p.poly([[bx-5,by],[bx-14,by-4],[bx-12,by],[bx-15,by+2],[bx-5,by+3]]); p.poly([[bx+5,by],[bx+12,by-5],[bx+11,by],[bx+13,by+2],[bx+5,by+3]]);
    p.F(Br[2]); p.poly([[bx-5,by-1],[bx-14,by-5],[bx-12,by-1],[bx-15,by+1],[bx-5,by+2]]); p.poly([[bx+5,by-1],[bx+12,by-6],[bx+11,by-1],[bx+13,by+1],[bx+5,by+2]]);
    p.F(Br[1]); p.rect(bx-11,by-3.4,6,1); p.rect(bx+6,by-3.6,5,1); p.F(Br[0]); p.rect(bx-12,by-4,3,0.8); p.rect(bx+8,by-4.6,3,0.8);
    // aba de verniz: faixa escura, reflexo largo, risco especular e brilho de ponta; jugular de latão com botão
    p.F(V[3]); p.poly([[5,-33.6],[31,-34.6],[45,-29.4],[43,-24.4],[9,-27.4]]);
    p.F(V[2]); p.poly([[6,-33],[30,-34],[44,-29],[42,-25],[10,-28]]); p.F(V[1]); p.poly([[10,-33],[30,-34],[42,-30],[36,-29],[12,-30.6]]);
    p.F(V[0]); bandA(p,[[14,-32.4],[38,-31]],1); p.F(M.fx[0]); p.rect(30,-32.4,4,1); p.rect(41,-29.6,1.4,1);
    p.F(Qo(V)[1]); p.rect(12,-28.6,28,1.4); p.F(V[3]); p.rect(12,-27,30,1.2);
    p.F(Br[3]); bandA(p,[[-12,-29.4],[2,-23.4],[12,-25.4]],1.8); p.F(Br[1]); bandA(p,[[-12,-30],[2,-24],[12,-26]],1); p.F(Br[0]); p.rect(2,-25,3,0.8);
    stud(p,Br,-12,-30,2,R[3],M.fx[0]);
    if(fur){ p.F(R[3]); p.poly([[-14,-52],[-6,-58],[-8,-50]]); p.F(V[3]); p.poly([[30,-31],[36,-30],[34,-27]]); }
  }
  function drawHead(p,M,sk,P,form){
    p.xf(sk.ha,sk.neck.x,sk.neck.y); const R=M.skin, A=sk.ha, fur=form==='furia';
    p.F(R[2]); p.ell(0,2,12,9);
    // cabelo chamuscado espetado (atrás, pra fora do quepe)
    const H=M.hair; p.F(H[3]); [[-14,-34,-24,-44],[-16,-28,-28,-32],[-14,-22,-26,-20],[-12,-38,-18,-50]].forEach(([a,b,c,d])=>p.cap(P2(a,b),P2(c,d),4,1));
    p.F(H[1]); [[-14,-34,-22,-42],[-16,-28,-26,-31],[-13,-22,-23,-20]].forEach(([a,b,c,d])=>p.cap(P2(a,b),P2(c,d),2,0.6));
    const hd=[[-13,-4],[-16,-22],[-12,-36],[16,-38],[28,-30],[31,-16],[34,-2],[30,10],[14,12],[2,8]];
    p.F(R[2]); p.poly(hd); mass(p,R,10,-16,21,22,A,1);
    const Q=Qo(R);
    clipPoly(hd,()=>{
      // nuca e lado de trás na sombra, luz rebatida fria na borda
      p.F(R[3]); p.poly([[-20,-40],[-7,-40],[-9,-12],[-4,14],[-20,14]]); p.F(Q[1]); p.poly([[-7,-40],[1,-40],[1,-14],[5,14],[-4,14],[-9,-12]]);
      p.F(M.refl[2]); p.poly([[-14,-20],[-12,-20],[-11,-6],[-13,-6]]);
      // a aba do quepe faz sombra na testa e nos olhos
      p.F(R[3]); p.poly([[0,-42],[42,-42],[42,-26.4],[30,-25.4],[12,-27.4],[0,-28]]); p.F(Q[1]); p.poly([[0,-28],[12,-27.4],[30,-25.4],[42,-26.4],[42,-23],[30,-22.4],[12,-24.4],[0,-25]]);
      // arcada, maçã do rosto e ponte do nariz pegando luz; bochecha funda
      p.F(Q[0]); p.ell(25,-12,7.4,5,-0.3); p.F(R[0]); p.ell(27,-14,3.6,1.8,-0.3); p.F(R[0]); p.rect(16,-24,4,1);
      p.F(Q[1]); p.ell(14,-8,5.4,6.4); p.F(R[3]); p.ell(12.4,-6,2.4,3.6);
      p.F(Q[0]); p.ell(8,-14,3,4); // têmpora
      // mandíbula de baixo no escuro (luz de cima) + sombra da cabeça no pescoço
      p.F(R[3]); p.poly([[-4,8],[30,6.6],[36,16],[-4,16]]); p.F(Q[1]); p.poly([[-4,4],[30,3],[30,6.6],[-4,8]]);
      // manchas de podridão e veias
      rot(p,M,[[1,-5,2.8],[-3,-30,2.2],[30,-3,1.6]],7);
      vein(p,M,[[2,-16],[5,-11],[4,-6],[7,-1]],3); vein(p,M,[[-2,-30],[2,-24],[0,-18]],4); vein(p,M,[[24,-6],[27,-2]],5);
    });
    // queixo enorme (mandíbula) + rugas
    p.F(Q[1]); p.ell(20,4,12,6); p.F(Q[0]); p.ell(23,2.4,6,2); p.F(R[3]); bandA(p,[[8,8],[20,11],[30,8]],1.4); bandA(p,[[4,-14],[8,-4]],1);
    p.F(R[3]); bandA(p,[[14,-30],[24,-29]],1); p.F(Q[0]); bandA(p,[[5,-13],[9,-4]],0.6);
    // queimadura no lado do rosto
    p.F(M.burn[1]); p.ell(4,-22,6,7); p.F(M.burn[2]); p.ell(3,-21,3.4,4); p.F(M.burn[0]); p.rect(2,-27,2,1);
    // orelha
    p.F(R[3]); p.ell(-5.4,-17.4,5.4,7.2); p.F(R[2]); p.ell(-6,-18,4.8,6.6); p.F(R[1]); p.ell(-6.6,-20,3,3); p.F(R[3]); p.ell(-5,-17,2.2,3.6); p.F(M.mouth[2]); p.ell(-4.6,-16.4,1,1.8); p.F(R[0]); p.rect(-8,-23,2,1);
    // olhos: um âmbar aceso, outro leitoso
    const glow=1-P.dead;
    p.F(M.mouth[3]); p.ell(21,-21,5.4,3.8); p.F(R[3]); p.rect(15,-26,13,1.6); p.F(R[0]); p.rect(16,-27,10,1);
    if(glow>0.3){ p.F(M.eye[3]); p.ell(21.6,-21,3.8,2.6); p.F(M.eye[2]); p.ell(22,-21.2,2.6,1.8); p.F(M.eye[1]); p.ell(22.4,-21.4,1.5,1); p.F(M.eye[0]); p.rect(22,-22,1,1); }
    p.F(M.milk[2]); p.ell(12,-21,2.6,2); p.F(M.milk[1]); p.ell(11.6,-21.4,1.4,1);
    // nariz grosso
    p.F(R[2]); p.poly([[26,-22],[36,-10],[28,-7]]); p.F(R[3]); p.rect(28,-8,6,1.4); p.F(R[0]); p.rect(28,-19,1.4,6);
    // boca: bochecha rasgada com dentes
    if(P.roar>0.5){ p.F(M.mouth[2]); p.poly([[14,-4],[34,-4],[33,8],[16,8]]); p.F(M.mouth[3]); p.poly([[17,0],[31,0],[30,6],[18,6]]);
      p.F(M.teeth[1]); [17,21,25,29].forEach(x=>{ p.rect(x,-4,3,3); p.rect(x+1,6,2.6,2.4); }); p.F(M.teeth[0]); [17,25].forEach(x=>p.rect(x,-4,1.4,1)); }
    else { p.F(M.mouth[2]); p.poly([[12,0],[30,-2],[31,3],[12,4]]); p.F(M.teeth[1]); [13,16,19].forEach(x=>p.rect(x,0,2.4,2.6)); p.F(M.teeth[2]); p.rect(13,2.6,8,0.8); }
    if(P.pant>0.5){ p.F(M.mouth[0]); p.ell(28,8,3,2); }
    // bigodão grisalho
    p.F(H[3]); p.poly([[16,-8],[24,-10],[34,-7],[38,-1],[33,-3],[24,-4],[18,-3]]); p.F(H[2]); p.poly([[17,-8],[24,-9.6],[33,-7],[36,-2.4],[25,-5],[18,-4]]); p.F(H[1]); p.poly([[18,-8],[24,-9],[32,-7],[34,-4],[25,-6]]); p.F(H[0]); p.rect(24,-8.6,5,0.8); p.F(M.fx[0]); p.rect(26,-8.6,1,0.8);
    p.F(H[3]); [[20,-6],[23,-5],[29,-5],[32,-3]].forEach(([x,y])=>p.rect(x,y,1,2));
    p.F(M.blood[2]); p.poly([[24,6],[28,6],[27,12],[26,9]]);
    drawCap(p,M,fur);
  }

  /* ---------------- FX ---------------- */
  // eletricidade nas bordas: raios curtos nos ombros, quepe, controlador e trole
  function drawEdgeVolts(p,M,sk,P,form,seed){
    p.id(); const V=M.volt, n=form==='furia'?4:2;
    const pts=[sk.T(-30,-112),sk.H(-14,-56),sk.T(60,-64),sk.shF,sk.T(-34,-60),sk.H(24,-62)];
    for(let k=0;k<n;k++){ const q=pts[Math.floor(rnd(seed,k)*pts.length)], an=rnd(seed,k+7)*PI*2, L=10+rnd(seed,k+11)*12; bolt(p,V,q,P2(q.x+C(an)*L,q.y+S(an)*L),seed+k*3,0.9); }
  }
  function drawBurst(p,M,sk,P,seed){ p.id(); const c=sk.T(30,-80), V=M.volt; [[-80,-60],[70,-90],[-60,40],[80,30],[0,-130],[-100,-10]].forEach(([dx,dy],k)=>bolt(p,V,c,P2(c.x+dx,c.y+dy),seed+k,1.6)); sparks(p,V,c,10,18,seed); }
  // raio da roda até o fio (spark/intro/fúria) e o próprio fio da catenária
  function drawWire(p,M,sk,P){ if(P.wire<0.05) return; p.id(); const G=poleGeom(sk,P), y=Math.max(4,G.tip.y+G.d.y*9-8);
    p.F(M.dark[3]); band(p,[P2(0,y-3),P2(FW,y+3)],2.4); p.F(M.steel[2]); band(p,[P2(0,y-3.6),P2(FW,y+2.4)],0.8); }
  function drawZap(p,M,sk,P,anim,seed){
    p.id(); const G=poleGeom(sk,P), wc=P2(G.tip.x+G.d.x*9,G.tip.y+G.d.y*9), V=M.volt;
    if(anim==='pole'){ // descarga em área: raios da roda até o chão à frente
      const gx=wc.x+10, n=5;
      for(let k=0;k<n;k++){ const tx=gx-60+k*30+(rnd(seed,k)-0.5)*14; bolt(p,V,wc,P2(tx,GROUND-4+rnd(seed,k+3)*6),seed+k,1.4+P.zap); }
      p.F(V[3]); p.ell(gx,GROUND-3,70*P.zap+10,9*P.zap+3); p.F(V[2]); p.ell(gx,GROUND-3,50*P.zap+6,6*P.zap+2); p.F(V[1]); p.ell(gx,GROUND-3,26*P.zap+4,3*P.zap+1);
      sparks(p,V,P2(gx,GROUND-8),9,22,seed+5);
    } else { // pra cima: puxa a carga do fio
      for(let k=0;k<3;k++) bolt(p,V,wc,P2(wc.x-24+k*24,Math.max(0,wc.y-30-rnd(seed,k)*20)),seed+k,1.2);
      sparks(p,V,wc,8,16,seed+2);
    }
  }

  function parts(add,P,M,sk,form,anim){
    const fur=form==='furia', seed=(P.t||0)*7+1+(P.ph||0);
    if(P.hide>0.5) { if(P.wire>0.05) add({},p=>drawWire(p,M,sk,P)); return; }
    const angF=Math.atan2(sk.wrF.y-sk.elF.y,sk.wrF.x-sk.elF.x), angB=Math.atan2(sk.wrB.y-sk.elB.y,sk.wrB.x-sk.elB.x);
    if(P.wire>0.05) add({back:true},p=>drawWire(p,M,sk,P));
    add({back:true},p=>drawPole(p,M,sk,P));
    add({back:true},p=>drawUpper(p,M,sk.shB,sk.elB,false,P,fur));
    add({back:true},p=>drawFore(p,M,sk.elB,sk.wrB,false,P,fur));
    add({back:true},p=>drawHand(p,M,sk.wrB,angB,false));
    add({back:true},p=>drawLeg(p,M,sk.hipB,sk.kneeB,sk.ankleB,P.fB,false));
    add({},p=>drawPelvis(p,M,sk,P));
    add({},p=>drawLeg(p,M,sk.hipF,sk.kneeF,sk.ankleF,P.fF,true));
    add({},p=>drawTorso(p,M,sk,P,form));
    add({},p=>drawController(p,M,sk,P,form));
    add({noShade:true},p=>drawControllerGlow(p,M,sk,P));
    if(P.bellOff<0.5) add({},p=>drawBell(p,M,sk,P));
    add({},p=>drawHead(p,M,sk,P,form));
    if(P.plug>0.5) add({},p=>drawCrankPlugged(p,M,sk,P));
    add({},p=>drawUpper(p,M,sk.shF,sk.elF,true,P,fur));
    add({},p=>drawFore(p,M,sk.elF,sk.wrF,true,P,fur));
    if(P.plug<=0.5) add({},p=>drawCrankInHand(p,M,sk.wrF,angF,P));
    add({},p=>drawHand(p,M,sk.wrF,angF,false));
    if(P.bellOff>=0.5) add({},p=>drawBell(p,M,sk,P));
    // emissivos / FX
    add({noShade:true,noRim:true},p=>drawPoleArc(p,M,sk,P,seed));
    if(anim!=='death'||P.dead<0.5) if(P.t%2===0||fur) add({noShade:true,noRim:true},p=>drawEdgeVolts(p,M,sk,P,form,seed+3));
    if(P.zap>0.1) add({noShade:true,noRim:true},p=>drawZap(p,M,sk,P,anim,seed));
    if(P.spark) add({noShade:true,noRim:true},p=>drawBurst(p,M,sk,P,seed+9));
    if(P.ring>0.05) add({noShade:true,noRim:true,smear:true},p=>drawRing(p,M,sk,P));
    if(P.smear&&anim==='swing') add({noShade:true,smear:true,noRim:true},p=>{ p.id(); const s=sk.shF; smear(p,M.fx,s.x,s.y,40,104,-120,10,1); });
    if(P.smear&&anim==='pole') add({noShade:true,smear:true,noRim:true},p=>{ p.id(); const s=sk.shB; const G=poleGeom(sk,P); p.F(M.volt[1]); [16,30,44].forEach((o,k)=>{ const a=rad(P.pa+o), d=P2(S(a),C(a)); p.cap(G.g,P2(G.g.x+d.x*(POLE-56)*(1-k*0.1),G.g.y+d.y*(POLE-56)*(1-k*0.1)),0.6,2.4-k*0.5); }); });
    if(P.smear&&anim==='intro') add({noShade:true,smear:true,noRim:true},p=>{ p.id(); p.F(M.fx[1]); [-30,-10,10,30].forEach((dx,k)=>p.cap(P2(sk.hip.x+dx,sk.hip.y-210-(k%2)*20),P2(sk.hip.x+dx,sk.hip.y-120),0.8,2.6)); });
    if(P.plug>0.5&&(anim==='recharge'||anim==='bonde')) add({noShade:true,noRim:true},p=>{ p.id(); const t=crankTip(sk,P); if(anim==='recharge'){ puffs(p,M.smoke,socket(sk).x+20,socket(sk).y-18-(P.t%4)*5,[[0,0,6,4],[8,-6,4,3]]); }
      sparks(p,M.volt,P2(socket(sk).x,socket(sk).y-6),4,8+P.chg*8,seed); p.F(M.fx[1]); arc(p,socket(sk).x,socket(sk).y-12,28,6,0,300,1.2,10); });
    if(P.impact) add({noShade:true,smear:true,noRim:true},p=>{ p.id(); const x=anim==='swing'?sk.wrF.x+30:sk.hip.x+8; dust(p,M.dust,M.fx,x,GROUND,anim==='death'?0.6:0.9); });
  }
  function anchors(sk,P){ const G=poleGeom(sk,P); return {eye:sk.H(22,-21),head:sk.H(8,-40),back:sk.T(-20,-80),hand:sk.wrF,tip:G.tip,bell:bellTop(sk),ctrl:socket(sk),stomp:{x:sk.hip.x+6,y:GROUND}}; }

  /* ---------------- bonde (adereço, de perfil, frente pra +x) ---------------- */
  const PFW=420, PFH=232, PG=222, PAX=210;
  function drawTram(p,M,st,form){
    p.id(); const Y=M.yel, B=M.tblue, fur=form==='furia';
    const x0=PAX-160, x1=PAX+160, gy=PG, floorY=gy-38, belt=gy-74, top=gy-158, roof=gy-170;
    // truque (chassi) e rodas
    p.F(M.dark[3]); p.rect(x0+30,gy-40,x1-x0-60,18);
    [x0+78,x1-78].forEach(cx=>{ p.F(M.dark[3]); p.rect(cx-40,gy-34,80,12); p.F(M.dark[2]); p.rect(cx-38,gy-34,76,4);
      [-22,22].forEach(dx=>{ const c=P2(cx+dx,gy-14); p.F(M.dark[3]); p.circle(c,14); p.F(M.steel[2]); p.circle(c,12); p.F(M.steel[3]); p.circle(c,9.6); p.F(M.steel[1]);
        for(let k=0;k<6;k++){ const a=k*PI/3+st*PI/6; p.cap(c,P2(c.x+C(a)*9,c.y+S(a)*9),1.6,1.2); } p.circle(c,3); p.F(M.steel[0]); p.rect(c.x-8,c.y-11,6,1.4); }); });
    // trilho
    p.F(M.steel[3]); p.rect(x0-40,gy-2,x1-x0+120,3); p.F(M.steel[1]); p.rect(x0-40,gy-2,x1-x0+120,1);
    // estribo de madeira corrido
    platePoly(p,M.wood,[[x0+6,floorY+4],[x1-6,floorY+4],[x1-10,floorY+10],[x0+10,floorY+10]],0,0.8);
    // saia azul do chassi
    platePoly(p,B,[[x0+2,floorY-8],[x1-2,floorY-8],[x1-6,floorY+4],[x0+6,floorY+4]],0,0.8); p.F(B[0]); p.rect(x0+4,floorY-8,x1-x0-8,1);
    // corpo: frente fechada (x1-60..x1) e baias abertas
    const fx0=x1-62, bx0=x0+8, bays=7, bw=(fx0-bx0)/bays;
    // fundo escuro das baias (interior)
    p.F(M.dark[2]); p.rect(bx0,top+8,fx0-bx0,belt-top-6); p.F(M.dark[1]); p.rect(bx0,top+8,fx0-bx0,6);
    // bancos de madeira (encostos) e pingentes zumbis
    for(let k=0;k<bays;k++){ const bx=bx0+k*bw;
      p.F(M.bench[3]); p.rect(bx+4,belt-36,bw-8,30); p.F(M.bench[1]); for(let j=0;j<4;j++) p.rect(bx+5,belt-34+j*7,bw-10,4); p.F(M.bench[0]); p.rect(bx+5,belt-34,bw-12,1);
      if(k%3===1){ // pingente pendurado na lateral
        const zx=bx+bw*0.5, Z=M.zomb; p.F(Z[3]); p.ell(zx,belt-48,7,8); p.F(Z[2]); p.ell(zx,belt-49,6,7); p.F(Z[1]); p.ell(zx+1.6,belt-51,3,3);
        p.F(M.eye[2]); p.rect(zx+2,belt-50,2,1.4); p.F(Z[2]); p.cap(P2(zx,belt-42),P2(zx-2,floorY-2),10,8); p.F(Z[1]); p.cap(P2(zx+2,belt-44),P2(zx+3,belt-20),4,3);
        p.F(Z[2]); p.cap(P2(zx+3,belt-46),P2(zx+bw*0.45,top+18),4,3); p.F(Z[1]); p.circle(P2(zx+bw*0.45,top+18),2.6); } }
    // painel de baixo (amarelo) com friso azul
    platePoly(p,Y,[[x0,belt],[fx0,belt],[fx0,floorY-8],[x0+2,floorY-8]],0,1);
    p.F(B[1]); p.rect(x0+4,belt+6,fx0-x0-8,2); p.F(B[2]); p.rect(x0+4,floorY-14,fx0-x0-8,2);
    // colunas amarelas + arcos das baias com corações vermelhos
    for(let k=0;k<=bays;k++){ const bx=bx0+k*bw; platePoly(p,Y,[[bx-3.6,top+4],[bx+3.6,top+4],[bx+3.6,belt+2],[bx-3.6,belt+2]],0,0.6); p.F(Y[0]); p.rect(bx-2.4,top+6,1,belt-top-6); }
    for(let k=0;k<bays;k++){ const bx=bx0+k*bw, cx=bx+bw/2; p.F(Y[2]); arc(p,cx,top+14,bw/2-3,8,180,360,3.4,8); p.F(Y[1]); arc(p,cx,top+13,bw/2-3,7,190,350,1.4,8);
      p.F(M.trim[1]); p.poly([[cx-2,top+6],[cx,top+8],[cx+2,top+6],[cx+2,top+4.6],[cx,top+5.6],[cx-2,top+4.6]]); }
    // grade de proteção na lateral (barra corrida)
    p.F(Y[3]); p.rect(bx0,belt-14,fx0-bx0,3); p.F(Y[1]); p.rect(bx0,belt-14,fx0-bx0,1.4);
    // frente fechada arredondada (cabine do motorneiro)
    const fr=[[fx0,top+2],[x1-10,top+4],[x1,top+16],[x1+4,belt-10],[x1+4,floorY-10],[fx0,floorY-8]];
    platePoly(p,Y,fr,0,1);
    p.F(M.glass[2]); p.poly([[fx0+6,top+14],[x1-14,top+14],[x1-6,top+24],[x1-4,belt-12],[fx0+6,belt-12]]); p.F(M.glass[1]); p.poly([[fx0+8,top+16],[fx0+22,top+16],[fx0+12,belt-14],[fx0+8,belt-14]]);
    p.F(M.dark[2]); p.rect(fx0+30,top+30,10,belt-top-44); // silhueta do motorneiro ausente: o posto vazio
    p.F(B[1]); p.rect(fx0+2,belt+6,x1-fx0,2); p.F(B[2]); p.rect(fx0+2,floorY-14,x1-fx0+2,2);
    // ornamentos azuis de canto (arabescos simples)
    p.F(B[1]); [[fx0+10,belt+12],[x1-8,belt+12],[fx0+10,floorY-20],[x1-8,floorY-20]].forEach(([x,y])=>{ p.rect(x-3,y-1,6,2); p.rect(x-1,y-3,2,6); });
    // farol cromado
    const hl=P2(x1-22,belt+22); p.F(M.steel[3]); p.circle(hl,10); p.F(M.steel[1]); p.circle(hl,8.4); p.F(M.light[2]); p.circle(hl,6.4); p.F(M.light[1]); p.circle(P2(hl.x+0.6,hl.y-0.6),4.4); p.F(M.light[0]); p.circle(P2(hl.x+1,hl.y-1),2.2);
    // teto: lanternim, beiral escuro e base do trole
    platePoly(p,M.tblue,[[x0-2,top+6],[x0+4,top-2],[x1-14,top-4],[x1+2,top+4],[x1+4,top+10],[x0-2,top+10]],0,0.6);
    platePoly(p,M.steel,[[x0+20,top-2],[x1-30,top-4],[x1-36,roof],[x0+26,roof+2]],0,1);
    p.F(M.steel[3]); p.rect(x0+30,roof+4,x1-x0-70,2); p.F(M.dark[2]); for(let k=0;k<10;k++) p.rect(x0+34+k*26,roof+6,10,3);
    p.F(M.dark[3]); p.rect(PAX-26,roof-6,52,8); p.F(M.steel[2]); p.rect(PAX-24,roof-6,48,3);
    // placa de destino (sem texto: faixas)
    p.F(M.dark[3]); p.rect(x1-40,top-14,30,9); p.F(M.light[2]); p.rect(x1-38,top-12,26,5); p.F(M.dark[2]); [x1-34,x1-26,x1-20].forEach(x=>p.rect(x,top-11,3,3));
    // vara do trole saindo pra trás e pra cima até o fio
    const pb=P2(PAX-10,roof-4), pt=P2(PAX-120,6);
    p.F(M.pole[3]); p.cap(pb,pt,6,4.4); p.F(M.pole[1]); p.cap(P2(pb.x,pb.y-1),P2(pt.x,pt.y-1),3,2); p.F(M.brass[2]); p.circle(pt,5); p.F(M.brass[0]); p.rect(pt.x-2,pt.y-3,2,1);
    // ferrugem e sangue
    p.F(Y[3]); [[x0+20,floorY-22,6,2],[x0+130,belt+16,5,2],[fx0+20,floorY-24,4,2]].forEach(([x,y,rx,ry])=>p.ell(x,y,rx,ry));
    stain(p,M.blood,x1-6,floorY-20,4,3,9); stain(p,M.blood,x0+60,floorY-10,3,2,3);
  }
  function drawTramFx(p,M,st,form){
    p.id(); const V=M.volt, gy=PG, x0=PAX-160, x1=PAX+160, seed=st*5+3;
    // faíscas das rodas no trilho (sem freio)
    [x0+56,x0+100,x1-100,x1-56].forEach((x,k)=>{ const c=P2(x,gy-1); p.F(M.fx[1]); for(let j=0;j<5;j++){ const an=PI+0.2+rnd(seed,k*5+j)*0.9, L=10+rnd(seed,k+j)*18; p.cap(c,P2(c.x+C(an)*L,c.y+S(an)*L*0.6),1.4,0.4); } p.F(M.fx[0]); p.circle(c,2); });
    // faísca no fio
    const pt=P2(PAX-120,6); sparks(p,V,pt,8,14,seed); p.F(V[1]); p.circle(pt,3.4);
    // facho do farol
    const hl=P2(x1-22,gy-74+22); p.F(M.light[3]); p.poly([[hl.x+6,hl.y-6],[PFW,hl.y-26],[PFW,hl.y+26],[hl.x+6,hl.y+6]]); p.F(M.light[2]); p.poly([[hl.x+6,hl.y-4],[PFW,hl.y-14],[PFW,hl.y+14],[hl.x+6,hl.y+4]]);
    p.F(M.light[1]); p.circle(hl,5);
    // linhas de velocidade
    p.F(M.dust[1]); [[x0-30,gy-120],[x0-46,gy-90],[x0-24,gy-60],[x0-40,gy-140]].forEach(([x,y],k)=>p.cap(P2(x-(st?8:0),y),P2(x+30-(st?8:0),y),0.6,2.2));
    if(form==='furia'){ for(let k=0;k<4;k++){ const a=P2(x0+40+k*80,gy-170+rnd(seed,k)*20); bolt(p,V,a,P2(a.x+40,a.y+60+rnd(seed,k+2)*30),seed+k,1.2); } }
  }
  function drawSparkDrop(p,M,st){
    p.id(); const V=M.volt, c=P2(PAX,PG-4);
    if(st===0){ for(let k=0;k<2;k++) bolt(p,V,P2(PAX+(k?6:-4),0),c,7+k*3,2+k*0.4); p.F(V[1]); p.circle(c,4); sparks(p,V,c,6,12,4); return; }
    if(st===1){ bolt(p,V,P2(PAX,0),c,11,2.6); p.F(V[3]); p.ell(PAX,PG-3,30,8); p.F(V[2]); p.ell(PAX,PG-3,22,5); p.F(V[1]); p.ell(PAX,PG-3,12,3); sparks(p,V,P2(PAX,PG-10),10,26,8); return; }
    p.F(M.burn[2]); p.ell(PAX,PG-2,16,3.4); p.F(M.burn[3]); p.ell(PAX,PG-2,9,2); p.F(M.smoke[1]); p.ell(PAX-4,PG-14,6,5); p.ell(PAX+5,PG-22,4,3.4); sparks(p,V,P2(PAX,PG-4),4,8,2);
  }
  function prop(add,P,M,form,anim){ const st=Math.round(P.st||0);
    if(anim==='xBonde'){ add({},p=>drawTram(p,M,st,form)); add({noShade:true,noRim:true},p=>drawTramFx(p,M,st,form)); return; }
    add({noShade:true,noRim:true},p=>drawSparkDrop(p,M,st)); }

  return K_.factory({SC:0.86,FW,FH,GROUND,AX,RIM,ANIMS,NAMES,REST,mats0,fix,skeleton,parts,anchors,PROP:{FW:PFW,FH:PFH,GROUND:PG,AX:PAX},prop});
})();
