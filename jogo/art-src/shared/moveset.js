/* MOVESET — fonte de arte (editável). Build: npm run art */
/* Kit de beat 'em up completo pro rig humano (HEROI, VIGIA, RECRUTA_BASE, AGRI, ENFE, CAPO), no padrão Marvel
   Cosmic Invasion: antecipação segura → 1 quadro de rastro largo → impacto com o corpo esticado → recuperação curta.
   Mesmos parâmetros de pose da STRIKES (ângulos absolutos: 0 = pra baixo, 90 = pra frente, 180 = pra cima;
   bA = ferramenta; kick:'F'/'B' = rastro e estrela no pé em vez da ferramenta).
   Campos lidos pelo motor (src/expedition/moveset.ts):
     kind  = papel do golpe pro auto-combate (dash, jump, dive, launcher, juggle, grab, throw, area, dodge, react, taunt, sig)
     z     = altura (px lógicos) por quadro — pulo de verdade no mundo (sombra fica no chão)
     move  = deslocamento pra frente (px/s) por quadro
     hitsx = quadro → dados do golpe: m, reach, heavy, knock, launch, air (pega no ar), juggle (mantém no ar),
             spike (crava no chão), both (frente e costas), around (raio em volta), held (só no agarrado),
             fling (vira projétil), stun (s), wave (onda no chão), pull (puxa pro lado do lutador)
     grab  = quadro em que o agarrão fecha · hold = [dx, z] do agarrado por quadro · release/toss = arremesso
     kf    = só poses-chave (sem sub-quadros de tween no Vigia: menos quadros a gerar, mais "estalado")
     sig   = peso do golpe assinatura · cd = recarga (s) · fam = só com essa família de arma */
const MOVESET=(function(){
  const rad=d=>d*Math.PI/180;
  // base de luta larga (o mesmo que o G dos rigs faz) aplicada aqui, pra todo rig ficar igual (CAPO não alarga)
  function W(o){ const r=Object.assign({},o); if(!r.nowide){ if(r.lFh!==undefined){ r.lFh+=14; r.lFk=(r.lFk||0)+3; } if(r.lBh!==undefined){ r.lBh-=12; r.lBk=(r.lBk!==undefined?r.lBk:-30)-10; } } r.nowide=1; return r; }
  const A=(G,T,arr,sl)=>({pose:i=>G(Object.assign({},T,W(arr[i]))),durs:sl});

  /* ---------- rastro/estrela no pé (chutes) ---------- */
  function kickTip(sk,P){ const B=P.kick==='B', an=B?sk.ankleB:sk.ankleF, kn=B?sk.kneeB:sk.kneeF, d=Math.hypot(an.x-kn.x,an.y-kn.y)||1; return {x:an.x+(an.x-kn.x)/d*8,y:an.y+(an.y-kn.y)/d*8}; }
  function kickPiv(sk,P){ return P.kick==='B'?sk.hipB:sk.hipF; }
  function smearArc(p,M,piv,tip,sa,wide){
    p.id(); const cur=Math.atan2(tip.x-piv.x,tip.y-piv.y)*180/Math.PI, r1=Math.hypot(tip.x-piv.x,tip.y-piv.y)+3, n=14;
    let a0=sa; while(a0-cur>180) a0-=360; while(cur-a0>180) a0+=360;
    const bd=(rr0,rr1,col)=>{ const pts=[]; for(let k=0;k<=n;k++){ const a=a0+(cur-a0)*k/n; pts.push([piv.x+Math.sin(rad(a))*rr1, piv.y+Math.cos(rad(a))*rr1]); }
      for(let k=n;k>=0;k--){ const a=a0+(cur-a0)*k/n, t=k/n, rr=rr1-(rr1-rr0)*t*t; pts.push([piv.x+Math.sin(rad(a))*rr, piv.y+Math.cos(rad(a))*rr]); } p.F(col); p.poly(pts); };
    bd(r1-wide,r1+1.6,(M.trail||M.smear)[1]); bd(r1-wide+3,r1,M.smear[1]); bd(r1-5,r1-0.6,M.smear[0]);
  }
  function kickSmear(p,M,sk,P){ smearArc(p,M,kickPiv(sk,P),kickTip(sk,P),P.sa,P.smear>=2.5?22:15); }

  /* ---------- kit comum ---------- */
  // o: two (ferramenta de duas mãos), slow (multiplica durações), names, unarmed, skip (anims que o rig já tem)
  function kit(G,o){
    o=o||{}; const sl=o.slow||1, N=o.names||{}, T=o.two?{two:1}:{}, T0={two:0};
    const D=a=>i=>Math.round(a[i]*sl);
    const out={
      // abertura/volta (qualquer recruta): ajoelha na frente da fogueira, risca o fósforo, aproxima a chama, sopra e levanta (match: 1 palito, 2 chama, 3 chama alta)
      acender:{nome:'Acender a fogueira',n:10,dur:i=>[110,110,160,140,90,130,130,200,120,140][i],pose:i=>{ const KN={lFh:90,lFk:-14,lBh:6,lBk:-96,plant:1,inhand:0};
      return ([
        {lean:12,head:4,hx:2,lFh:40,lFk:-4,lBh:-12,lBk:-40,aFs:16,aFe:40,aBs:-6,aBe:20,inhand:0},
        {lean:20,head:8,hx:5,lFh:70,lFk:-10,lBh:-2,lBk:-70,aFs:26,aFe:56,aBs:10,aBe:40,inhand:0},
        Object.assign({},KN,{lean:24,head:10,hx:8,aFs:36,aFe:66,aBs:24,aBe:60}),
        Object.assign({},KN,{lean:22,head:12,hx:8,aFs:6,aFe:96,aBs:38,aBe:84,match:1,brow:1}),
        Object.assign({},KN,{lean:26,head:12,hx:9,aFs:46,aFe:40,aBs:36,aBe:82,match:3,brow:1}),
        Object.assign({},KN,{lean:30,head:14,hx:10,aFs:40,aFe:50,aBs:30,aBe:70,match:2}),
        Object.assign({},KN,{lean:31,head:14,hx:10,aFs:42,aFe:56,aBs:30,aBe:70,match:3}),
        Object.assign({},KN,{lean:34,head:16,hx:11,aFs:34,aFe:48,aBs:26,aBe:64,mouth:1,blink:1}),
        {lean:18,head:4,hx:5,lFh:66,lFk:-8,lBh:-4,lBk:-66,aFs:24,aFe:50,aBs:6,aBe:36,inhand:0,mouth:3,brow:3},
        {lean:6,head:0,hx:2,lFh:30,lFk:2,lBh:-22,lBk:-26,aFs:12,aFe:38,aBs:-10,aBe:20,mouth:3,brow:3}][i]); }},
      // chute frontal (push kick): entra no combo como golpe comum; as armas de fogo usam de perto
      atkK:{nome:N.atkK||'Chute frontal',n:7,kf:1,atk:2,gunMelee:2,hits:{3:1},hitsx:{3:{m:1.1,reach:52}},move:[0,10,50,30,0,0,0],
        dur:D([80,90,40,110,90,80,100]),pose:i=>G(Object.assign({},T,W([
        {lean:4,hx:-2,lFh:40,lFk:6,lBh:-36,lBk:-44,aFs:60,aFe:96,bA:132,aBs:40,aBe:100,brow:1},
        {nowide:1,lean:-6,hx:-2,plant:0,lFh:98,lFk:6,lBh:-16,lBk:-28,aFs:50,aFe:104,bA:140,aBs:30,aBe:90,mouth:1,brow:1},
        {nowide:1,lean:-16,hx:2,plant:0,lFh:96,lFk:66,kick:'F',smear:1,sa:20,lBh:-14,lBk:-24,aFs:36,aFe:84,bA:126,aBs:22,aBe:70,mouth:2,brow:1},
        {nowide:1,lean:-22,hx:7,plant:0,lFh:92,lFk:94,kick:'F',smear:3,sa:24,impact:2,lBh:-12,lBk:-22,aFs:28,aFe:72,bA:120,aBs:18,aBe:60,mouth:2,brow:1},
        {nowide:1,lean:-20,hx:7,plant:0,lFh:90,lFk:90,kick:'F',lBh:-12,lBk:-22,aFs:30,aFe:74,bA:120,aBs:20,aBe:62,mouth:1,brow:1},
        {nowide:1,lean:-4,hx:3,plant:0,lFh:88,lFk:10,lBh:-16,lBk:-28,aFs:50,aFe:90,bA:128,aBs:30,aBe:90},
        {}][i])))},
      // investida correndo: 3 passadas de corrida com a ferramenta armada atrás, planta o pé e varre (derruba)
      dash:{nome:N.dash||'Investida correndo',n:7,kf:1,kind:'dash',hits:{4:1},hitsx:{4:{m:1.45,heavy:1,knock:1,reach:54}},move:[130,210,220,190,90,10,0],
        dur:D([70,70,70,50,110,90,110]),pose:i=>G(Object.assign({},T,W([
        {nowide:1,plant:0,lean:24,head:-10,lFh:58,lFk:-8,lBh:-30,lBk:-82,aFs:-24,aFe:16,bA:200,aBs:60,aBe:110,brow:1,mouth:1},
        {nowide:1,plant:0,lean:26,head:-10,lift:3,lFh:-18,lFk:-70,lBh:52,lBk:-6,aFs:-30,aFe:6,bA:212,aBs:70,aBe:120,brow:1,mouth:1},
        {nowide:1,lean:20,hx:2,tw:-0.6,lFh:66,lFk:12,lBh:-42,lBk:-60,aFs:-42,aFe:-52,bA:222,aBs:60,aBe:100,brow:1,mouth:1},
        {nowide:1,tw:0.6,lean:28,hx:10,lFh:72,lFk:14,lBh:-46,lBk:-52,aFs:70,aFe:84,bA:140,smear:2,sa:222,aBs:-20,aBe:20,mouth:2,brow:1},
        {nowide:1,tw:1,lean:34,hx:16,head:-12,lFh:76,lFk:16,lBh:-50,lBk:-54,aFs:90,aFe:92,bA:80,smear:3,sa:214,impact:2,aBs:-50,aBe:-20,mouth:2,brow:1},
        {nowide:1,tw:0.8,lean:30,hx:14,lFh:72,lFk:14,lBh:-48,lBk:-54,aFs:60,aFe:40,bA:20,aBs:-40,aBe:-10,mouth:1},
        {}][i])))},
      // chute voador: agacha, decola, encolhe no alto e estica a perna da frente descendo (derruba)
      jumpKick:{nome:N.jumpKick||'Chute voador',n:8,kf:1,kind:'jump',z:[0,6,22,30,26,14,2,0],squash:[0.9,1.06,1,1,1,1,0.88,1],move:[0,90,120,120,120,70,10,0],
        hits:{4:1},hitsx:{4:{m:1.35,heavy:1,air:1,knock:1,reach:54}},dur:D([90,70,90,80,60,110,90,110]),pose:i=>G(Object.assign({},T,W([
        {lean:18,head:-4,lFh:60,lFk:-30,lBh:-10,lBk:-70,aFs:30,aFe:60,bA:140,aBs:20,aBe:60,brow:1},
        {nowide:1,plant:0,lean:4,head:-8,lFh:30,lFk:-20,lBh:-30,lBk:-40,aFs:100,aFe:140,bA:170,aBs:80,aBe:130,mouth:1},
        {nowide:1,plant:0,lean:-2,lFh:100,lFk:10,lBh:60,lBk:-30,aFs:70,aFe:120,bA:160,aBs:40,aBe:100,brow:1,mouth:1},
        {nowide:1,plant:0,lean:-10,lFh:112,lFk:20,lBh:40,lBk:-50,aFs:40,aFe:90,bA:150,aBs:20,aBe:80,brow:1},
        {nowide:1,plant:0,lean:-24,hx:4,lFh:82,lFk:86,kick:'F',smear:3,sa:10,impact:2,lBh:10,lBk:-60,aFs:-10,aFe:40,bA:124,aBs:-30,aBe:10,mouth:2,brow:1},
        {nowide:1,plant:0,lean:-20,hx:4,lFh:78,lFk:82,kick:'F',lBh:20,lBk:-50,aFs:0,aFe:50,bA:130,aBs:-20,aBe:20,mouth:1,brow:1},
        {lean:20,head:-2,lFh:60,lFk:-20,lBh:-10,lBk:-70,aFs:40,aFe:80,bA:130,aBs:20,aBe:70,mouth:1},
        {}][i])))},
      // mergulho: pula alto com a ferramenta acima da cabeça e crava no chão (área em volta, derruba)
      dive:{nome:N.dive||'Mergulho (golpe de cima)',n:8,kf:1,kind:'dive',z:[0,10,34,44,30,6,0,0],squash:[0.86,1.08,1,1,1.02,0.84,0.94,1],move:[0,80,90,80,60,30,0,0],
        hits:{5:1},hitsx:{5:{m:1.8,heavy:1,knock:1,around:48,reach:44,slam:1}},dur:D([100,70,100,110,60,50,180,120]),pose:i=>G(Object.assign({},T,W([
        {lean:26,head:-6,lFh:70,lFk:-30,lBh:-6,lBk:-80,aFs:-30,aFe:-20,bA:200,aBs:-20,aBe:10,brow:1},
        {nowide:1,plant:0,lean:-8,head:-12,lFh:20,lFk:-10,lBh:-20,lBk:-30,aFs:150,aFe:170,bA:200,aBs:140,aBe:170,mouth:1,brow:1},
        {nowide:1,plant:0,lean:-14,head:-10,lFh:90,lFk:0,lBh:50,lBk:-40,aFs:170,aFe:200,bA:240,aBs:160,aBe:190,mouth:1,brow:1},
        {nowide:1,plant:0,lean:-18,lFh:100,lFk:10,lBh:60,lBk:-30,aFs:176,aFe:210,bA:250,aBs:166,aBe:196,mouth:2,brow:1},
        {nowide:1,plant:0,tw:0.6,lean:20,hx:6,lFh:70,lFk:-10,lBh:10,lBk:-50,aFs:100,aFe:110,bA:120,smear:2,sa:250,mouth:2,brow:1},
        {nowide:1,tw:1,lean:44,hx:14,head:-14,lFh:84,lFk:-18,lBh:-10,lBk:-100,aFs:66,aFe:44,bA:10,smear:3,sa:240,impact:2,aBs:-40,aBe:-10,mouth:2,brow:1},
        {nowide:1,tw:0.9,lean:42,hx:14,head:-12,lFh:84,lFk:-18,lBh:-10,lBk:-100,aFs:64,aFe:42,bA:12,impact:1,aBs:-40,aBe:-10,mouth:1,brow:1},
        {}][i])))},
      // lançador: agacha, ferramenta de baixo pra cima, sobe junto (joga o zumbi pro alto pro juggle)
      launcher:{nome:N.launcher||'Lançador',n:6,kf:1,kind:'launcher',hits:{2:1},hitsx:{2:{m:1.1,launch:1,reach:46}},move:[0,30,40,0,0,0],
        dur:D([110,50,60,110,110,120]),pose:i=>G(Object.assign({},T,W([
        {lean:22,head:4,hx:-2,lFh:34,lFk:-24,lBh:-6,lBk:-40,aFs:-10,aFe:-30,bA:-150,aBs:10,aBe:40,brow:1},
        {lean:14,aFs:20,aFe:10,bA:-50,lFh:30,lFk:-10,lBh:-10,lBk:-30,aBs:0,aBe:30,smear:1,sa:-150,mouth:1},
        {nowide:1,lean:-10,head:-12,hx:4,lift:4,plant:0,aFs:140,aFe:170,bA:180,smear:3,sa:-60,impact:2,lFh:24,lFk:2,lBh:-32,lBk:-36,aBs:-30,aBe:0,mouth:2,brow:1},
        {nowide:1,lean:-14,lift:2,plant:0,aFs:160,aFe:185,bA:195,lFh:20,lFk:2,lBh:-34,lBk:-38,aBs:-30,aBe:0,mouth:1},
        {lean:-4,aFs:100,aFe:120,bA:150},
        {}][i])))},
      // juggle aéreo: sobe atrás do zumbi lançado, 2 golpes que seguram ele no ar e crava pra baixo
      airCombo:{nome:N.airCombo||'Combo aéreo (juggle)',n:9,kf:1,kind:'juggle',z:[4,24,38,42,42,40,30,8,0],squash:[0.9,1.05,1,1,1,1,1,0.86,1],move:[40,60,40,20,20,20,10,0,0],
        hits:{3:1,5:2,6:3},hitsx:{3:{m:0.8,air:1,juggle:1,reach:48},5:{m:0.9,air:1,juggle:1,reach:48},6:{m:1.4,heavy:1,air:1,spike:1,reach:50}},
        dur:D([70,80,60,70,60,70,90,120,110]),pose:i=>G(Object.assign({},T,W([
        {lean:16,lFh:56,lFk:-30,lBh:-10,lBk:-60,aFs:20,aFe:40,bA:-30,aBs:10,aBe:40,brow:1},
        {nowide:1,plant:0,lean:0,lFh:60,lFk:-10,lBh:-10,lBk:-40,aFs:20,aFe:0,bA:-60,aBs:60,aBe:120,mouth:1},
        {nowide:1,plant:0,lean:-12,lFh:90,lFk:10,lBh:30,lBk:-40,aFs:130,aFe:160,bA:170,smear:2,sa:-40,aBs:40,aBe:100,mouth:2},
        {nowide:1,plant:0,lean:-14,lFh:94,lFk:14,lBh:34,lBk:-40,aFs:150,aFe:174,bA:186,impact:1,aBs:30,aBe:90,mouth:2,brow:1},
        {nowide:1,plant:0,tw:-0.6,lean:-6,lFh:80,lFk:0,lBh:20,lBk:-50,aFs:-20,aFe:-40,bA:200,aBs:60,aBe:110,mouth:1},
        {nowide:1,plant:0,tw:1,lean:10,lFh:90,lFk:20,lBh:10,lBk:-50,aFs:90,aFe:92,bA:96,smear:3,sa:200,impact:1,aBs:-40,aBe:-10,mouth:2},
        {nowide:1,plant:0,tw:0.8,lean:30,lFh:70,lFk:-10,lBh:0,lBk:-60,aFs:60,aFe:40,bA:0,smear:3,sa:110,impact:2,aBs:-50,aBe:-20,mouth:2,brow:1},
        {lean:24,lFh:66,lFk:-20,lBh:-10,lBk:-70,aFs:50,aFe:40,bA:30,aBs:10,aBe:40,mouth:1},
        {}][i])))},
      // agarrão: avança, pega pela gola com as duas mãos, puxa e dá duas joelhadas (dano só no agarrado)
      grab:{nome:N.grab||'Agarrão + joelhadas',n:7,kf:1,kind:'grab',grab:2,hold:[[24,0],[20,0],[15,2],[14,7],[15,2],[14,8],[15,2]],move:[40,70,0,0,0,0,0],
        hits:{3:1,5:2},hitsx:{3:{m:0.6,held:1},5:{m:0.75,held:1}},dur:D([80,70,100,80,110,80,110]),pose:i=>G(Object.assign({},T0,W([
        {lean:16,hx:4,lFh:46,lFk:8,lBh:-34,lBk:-46,aFs:80,aFe:92,bA:150,aBs:80,aBe:96,mouth:1,brow:1},
        {lean:26,hx:10,lFh:56,lFk:12,lBh:-40,lBk:-48,aFs:94,aFe:100,bA:160,aBs:92,aBe:104,mouth:2,brow:1},
        {lean:10,hx:6,lFh:38,lFk:8,lBh:-30,lBk:-42,aFs:76,aFe:122,bA:170,aBs:70,aBe:118,mouth:1,brow:1},
        {nowide:1,lean:18,hx:8,lift:3,plant:0,lFh:112,lFk:12,kick:'F',smear:1,sa:30,impact:1,lBh:-16,lBk:-24,aFs:72,aFe:40,bA:150,aBs:66,aBe:36,mouth:2,brow:1},
        {lean:10,hx:6,lFh:38,lFk:8,lBh:-30,lBk:-42,aFs:76,aFe:122,bA:170,aBs:70,aBe:118,mouth:1,brow:1},
        {nowide:1,lean:20,hx:9,lift:4,plant:0,lFh:118,lFk:14,kick:'F',smear:2,sa:30,impact:2,lBh:-16,lBk:-24,aFs:72,aFe:36,bA:150,aBs:66,aBe:32,mouth:2,brow:1},
        {lean:10,hx:6,lFh:38,lFk:8,lBh:-30,lBk:-42,aFs:76,aFe:122,bA:170,aBs:70,aBe:118,mouth:1,brow:1}][i])))},
      // arremesso: agacha, gira o zumbi por cima do ombro e joga pra frente (em cima dos outros)
      throw:{nome:N.throw||'Arremesso',n:8,kf:1,kind:'throw',hold:[[15,2],[8,10],[-8,22],[-2,34],[14,30],[26,20],[30,16],[30,16]],release:5,toss:{vx:175,vz:125},
        dur:D([90,90,90,70,60,60,120,120]),pose:i=>G(Object.assign({},T0,W([
        {lean:6,hx:4,lFh:38,lFk:8,lBh:-30,lBk:-42,aFs:76,aFe:122,bA:170,aBs:70,aBe:118,brow:1},
        {lean:20,lFh:60,lFk:-20,lBh:-14,lBk:-76,aFs:60,aFe:150,bA:180,aBs:56,aBe:146,brow:1,mouth:1},
        {tw:-0.8,lean:-14,hx:-4,lFh:30,lFk:0,lBh:-22,lBk:-44,aFs:170,aFe:200,bA:220,aBs:160,aBe:196,mouth:2,brow:1},
        {nowide:1,tw:-0.3,lean:-20,hx:-2,lift:4,plant:0,lFh:40,lFk:-6,lBh:-40,lBk:-58,aFs:180,aFe:196,bA:200,aBs:176,aBe:192,mouth:2,brow:1},
        {nowide:1,tw:0.6,lean:20,hx:8,lFh:70,lFk:12,lBh:-48,lBk:-54,aFs:130,aFe:140,bA:150,aBs:126,aBe:136,smear:2,sa:210,mouth:2,brow:1},
        {nowide:1,tw:1,lean:36,hx:14,lFh:78,lFk:16,lBh:-52,lBk:-56,aFs:90,aFe:80,bA:110,aBs:86,aBe:76,smear:3,sa:200,mouth:2,brow:1},
        {nowide:1,tw:0.6,lean:28,hx:12,lFh:74,lFk:14,lBh:-50,lBk:-56,aFs:60,aFe:40,bA:60,aBs:56,aBe:36,mouth:3,brow:1},
        {}][i])))},
      // giro em área (cercado): varre na frente, passa a ferramenta por baixo e acerta quem está nas costas
      areaSpin:{nome:N.areaSpin||'Giro em área (costas)',n:9,kf:1,kind:'area',hits:{3:1,6:2},hitsx:{3:{m:1.05,heavy:1,both:1,reach:52},6:{m:1.3,heavy:1,both:1,knock:1,reach:54}},
        dur:D([90,50,60,70,60,50,70,110,110]),pose:i=>G(Object.assign({},T,W([
        {tw:-0.8,lean:-6,hx:-2,lFh:36,lFk:8,lBh:-28,lBk:-40,aFs:-40,aFe:-70,bA:230,aBs:60,aBe:120,brow:1,mouth:1},
        {tw:0.2,lean:20,lFh:56,lFk:-10,lBh:-18,lBk:-60,aFs:30,aFe:60,bA:200,smear:1,sa:240,aBs:20,aBe:60,mouth:2},
        {tw:1,lean:24,hx:6,lFh:60,lFk:-6,lBh:-24,lBk:-64,aFs:90,aFe:94,bA:96,smear:3,sa:220,aBs:-40,aBe:-10,mouth:2,brow:1},
        {tw:1,lean:26,hx:8,lFh:60,lFk:-6,lBh:-24,lBk:-64,aFs:96,aFe:80,bA:50,smear:3,sa:150,impact:1,aBs:-50,aBe:-20,mouth:2},
        {tw:-0.6,lean:18,hx:6,lFh:56,lFk:-10,lBh:-22,lBk:-62,aFs:20,aFe:-20,bA:-60,smear:2,sa:40,aBs:40,aBe:90,mouth:2},
        {tw:-1,lean:10,hx:4,lFh:52,lFk:-10,lBh:-18,lBk:-60,aFs:-60,aFe:-80,bA:-96,smear:3,sa:-20,aBs:60,aBe:120,mouth:2,brow:1},
        {tw:-1,lean:8,hx:2,lFh:52,lFk:-10,lBh:-18,lBk:-60,aFs:-70,aFe:-90,bA:-122,smear:3,sa:-40,impact:2,aBs:70,aBe:130,mouth:2,brow:1},
        {tw:-0.4,lean:12,lFh:42,lFk:6,lBh:-24,lBk:-40,aFs:20,aFe:60,bA:100,aBs:30,aBe:90,mouth:1},
        {}][i])))},
      // salto pra trás (esquiva de aviso no chão quando o perigo vem da frente)
      backstep:{nome:N.backstep||'Salto pra trás',n:5,kf:1,kind:'dodge',z:[0,8,10,4,0],dur:D([60,80,80,80,100]),pose:i=>G(Object.assign({},T,W([
        {lean:20,lFh:36,lFk:-20,lBh:-8,lBk:-50,aFs:60,aFe:100,bA:140,aBs:40,aBe:100,brow:1},
        {nowide:1,plant:0,lean:-10,head:-6,lFh:40,lFk:10,lBh:-10,lBk:-40,aFs:60,aFe:110,bA:140,aBs:30,aBe:90,brow:1,mouth:1},
        {nowide:1,plant:0,lean:-14,lFh:50,lFk:22,lBh:0,lBk:-30,aFs:50,aFe:110,bA:140,aBs:30,aBe:90,brow:1},
        {lean:18,lFh:30,lFk:-20,lBh:-18,lBk:-70,aFs:60,aFe:100,bA:136,aBs:40,aBe:100,brow:1},
        {}][i])))},
      // empurrado: escorrega pra trás com o calcanhar arrastando, braços abertos
      hurtPush:{nome:'Dano: empurrado',n:5,kf:1,kind:'react',dur:D([70,100,110,120,140]),pose:i=>G(Object.assign({},T0,W([
        {flash:1,lean:-24,head:-20,hx:-8,lFh:30,lFk:20,lBh:-20,lBk:-30,aFs:-60,aFe:-20,bA:110,aBs:-70,aBe:-40,mouth:2,brow:2},
        {lean:-20,head:-14,hx:-8,lFh:40,lFk:40,lBh:-10,lBk:-20,aFs:-80,aFe:-40,bA:120,aBs:-90,aBe:-60,mouth:2,brow:2,blink:1},
        {lean:-8,head:-6,hx:-4,lFh:40,lFk:16,lBh:-30,lBk:-44,aFs:-20,aFe:30,bA:120,aBs:-30,aBe:0,mouth:1,brow:2},
        {lean:4,lFh:40,lFk:8,lBh:-34,lBk:-44,aFs:30,aFe:70,bA:120,aBs:20,aBe:60,mouth:1,brow:2},
        {}][i])))},
      // lançado: voa de costas, bate no chão (quica) e fica deitado — depois o motor chama "getup"
      launched:{nome:'Dano: lançado longe',n:7,kf:1,kind:'react',z:[4,24,32,22,6,2,0],dur:D([80,110,110,100,90,140,260]),pose:i=>G(Object.assign({},T0,W([
        {nowide:1,flash:1,lean:-30,head:-24,hx:-4,plant:0,lFh:40,lFk:20,lBh:10,lBk:-10,aFs:-60,aFe:-100,bA:160,aBs:-80,aBe:-120,mouth:2,brow:2},
        {nowide:1,rot:-30,plant:0,lean:-10,head:-16,lFh:60,lFk:40,lBh:30,lBk:20,aFs:150,aFe:170,bA:200,aBs:170,aBe:200,mouth:2,brow:2,blink:1},
        {nowide:1,rot:-60,plant:0,lean:-4,head:-10,hx:6,lFh:70,lFk:60,lBh:40,lBk:30,aFs:160,aFe:190,bA:220,aBs:180,aBe:210,mouth:2,brow:2,blink:1},
        {nowide:1,rot:-80,plant:0,head:-12,hx:14,lFh:50,lFk:50,lBh:30,lBk:30,aFs:150,aFe:170,bA:200,aBs:170,aBe:200,mouth:2,brow:2,blink:1},
        {nowide:1,rot:-90,plant:0,hx:20,head:-16,flash:1,lFh:40,lFk:50,lBh:20,lBk:30,aFs:140,aFe:160,bA:190,aBs:170,aBe:200,mouth:2,brow:2,blink:1},
        {nowide:1,rot:-88,plant:0,hx:22,lift:3,head:-6,lFh:24,lFk:30,lBh:10,lBk:16,aFs:150,aFe:176,bA:170,aBs:176,aBe:206,mouth:1,brow:2,blink:1},
        {nowide:1,rot:-90,plant:0,hx:24,head:0,lFh:14,lFk:12,lBh:6,lBk:4,aFs:146,aFe:166,bA:140,aBs:176,aBe:196,brow:2,blink:1}][i])))},
      // provocação: ferramenta no ombro, chama o zumbi com a mão ("vem!") e ri
      taunt:{nome:N.taunt||'Provocação',n:8,kf:1,kind:'taunt',dur:D([120,110,110,110,120,150,160,200]),pose:i=>G(Object.assign({},T0,W([
        {nowide:1,lean:0,lFh:22,lFk:2,lBh:-16,lBk:-20,aFs:150,aFe:214,bA:256,aBs:10,aBe:24,mouth:3,brow:1},
        {nowide:1,lean:2,lFh:22,lFk:2,lBh:-16,lBk:-20,aFs:150,aFe:214,bA:256,aBs:70,aBe:140,mouth:1,brow:1},
        {nowide:1,lean:2,lFh:22,lFk:2,lBh:-16,lBk:-20,aFs:150,aFe:214,bA:256,aBs:74,aBe:98,mouth:1,brow:1},
        {nowide:1,lean:2,lFh:22,lFk:2,lBh:-16,lBk:-20,aFs:150,aFe:214,bA:256,aBs:70,aBe:146,mouth:1,brow:1},
        {nowide:1,lean:2,lFh:22,lFk:2,lBh:-16,lBk:-20,aFs:150,aFe:214,bA:256,aBs:74,aBe:98,mouth:2,brow:1},
        {nowide:1,lean:-6,head:-12,lFh:22,lFk:2,lBh:-16,lBk:-20,aFs:150,aFe:214,bA:256,aBs:10,aBe:30,mouth:3,brow:3},
        {nowide:1,lean:-4,head:-10,lift:2,plant:0,lFh:24,lFk:4,lBh:-14,lBk:-18,aFs:150,aFe:214,bA:256,aBs:12,aBe:34,mouth:3,brow:3,blink:1},
        {}][i])))},
      // dano na barriga (os rigs que ainda não tinham)
      hurtC:{nome:'Dano: dobra no estômago',n:4,kf:1,kind:'react',dur:D([80,120,130,150]),pose:i=>G(Object.assign({},T0,W([
        {lean:36,head:16,hx:-4,flash:1,aFs:54,aFe:20,bA:80,aBs:44,aBe:10,mouth:2,brow:2,blink:1,lFh:22,lFk:-10,lBh:-8,lBk:-22},
        {lean:30,head:14,hx:-3,aFs:46,aFe:24,bA:80,aBs:38,aBe:14,mouth:2,brow:2,lFh:20,lFk:-8,lBh:-8,lBk:-20},
        {lean:12,head:4,hx:-1,aFs:50,aFe:70,bA:110,mouth:1,brow:2,lFh:30,lFk:4,lBh:-24,lBk:-34},{}][i])))},
    };
    const sk=o.skip||{};
    Object.keys(out).forEach(k=>{ if(sk[k]) delete out[k]; });
    return out;
  }

  /* ---------- golpes assinatura (catálogo: cada personagem escolhe 2–3, com nome do ofício) ---------- */
  // id → (G, T, D) => anim. T = {two:1} se a ferramenta é de duas mãos; D = durações com o "slow" do personagem
  const SIG={
    // rebatida: as duas mãos no cabo, gira o tronco todo e manda o zumbi longe (vira projétil que derruba os outros)
    homeRun:(G,T,D)=>({n:9,hits:{5:1},hitsx:{5:{m:2,heavy:1,fling:1,reach:52}},move:[0,0,10,40,60,30,0,0,0],dur:D([110,110,90,60,40,70,130,110,110]),pose:i=>G(Object.assign({two:1},W([
      {tw:-0.6,lean:-4,hx:-2,lFh:30,lFk:6,lBh:-30,lBk:-40,aFs:20,aFe:60,bA:170,aBs:20,aBe:66,brow:1},
      {tw:-1,lean:-12,hx:-6,lFh:20,lFk:-2,lBh:-26,lBk:-40,aFs:-30,aFe:-60,bA:200,aBs:-26,aBe:-56,brow:1,mouth:1},
      {tw:-1,lean:-14,hx:-7,lift:2,plant:0,lFh:46,lFk:-14,lBh:-24,lBk:-40,aFs:-40,aFe:-70,bA:214,aBs:-36,aBe:-66,brow:1,mouth:1},
      {tw:0,lean:10,hx:2,lFh:56,lFk:10,lBh:-40,lBk:-52,aFs:30,aFe:20,bA:200,aBs:24,aBe:16,smear:1,sa:230,mouth:2,brow:1},
      {tw:0.9,lean:24,hx:10,lFh:64,lFk:12,lBh:-44,lBk:-54,aFs:88,aFe:94,bA:120,aBs:84,aBe:90,smear:3,sa:220,mouth:2,brow:1},
      {tw:1,lean:28,hx:14,head:-12,lFh:66,lFk:14,lBh:-46,lBk:-54,aFs:96,aFe:90,bA:70,aBs:92,aBe:86,smear:3,sa:200,impact:2,mouth:2,brow:1},
      {tw:1,lean:20,hx:14,lFh:62,lFk:12,lBh:-44,lBk:-54,aFs:120,aFe:150,bA:-30,aBs:114,aBe:146,smear:2,sa:80,mouth:3,brow:1},
      {tw:0.6,lean:8,hx:10,lFh:50,lFk:8,lBh:-36,lBk:-48,aFs:130,aFe:170,bA:-60,aBs:120,aBe:160,mouth:3,brow:3},
      {}][i])))}),
    // estocadas triplas: três espetadas rápidas com o corpo avançando (a última empurra)
    tripleJab:(G,T,D)=>({n:9,hits:{2:1,4:2,6:3},hitsx:{2:{m:0.6,reach:60},4:{m:0.7,reach:62},6:{m:1.1,heavy:1,reach:64}},move:[0,60,40,60,40,80,30,0,0],dur:D([90,40,60,40,60,40,110,100,100]),pose:i=>{
      const back={tw:-0.5,aFs:-20,aFe:84,bA:94,lean:-6,hx:-2,lFh:40,lFk:6,lBh:-32,lBk:-42,aBs:50,aBe:110,brow:1,mouth:1};
      const out={tw:1,aFs:94,aFe:92,bA:91,lean:30,hx:16,head:-10,lFh:60,lFk:12,lBh:-40,lBk:-46,aBs:-60,aBe:-40,mouth:2,brow:1};
      return G(Object.assign({},T,W([back,Object.assign({},out,{smear:1,sa:100}),Object.assign({},out,{impact:1}),Object.assign({},back,{hx:4}),Object.assign({},out,{hx:20,impact:1}),Object.assign({},back,{hx:8}),Object.assign({},out,{hx:24,lean:34,impact:2,smear:2,sa:110}),Object.assign({},out,{hx:20,lean:24,mouth:1}),{}][i]))); }}),
    // rasteira com a ferramenta: abaixa e varre rente ao chão (derruba, alcance longo)
    lowSweep:(G,T,D)=>({n:8,hits:{4:1},hitsx:{4:{m:1.25,knock:1,reach:62}},move:[0,20,50,40,10,0,0,0],dur:D([90,90,60,40,120,100,100,110]),pose:i=>G(Object.assign({},T,W([
      {lean:16,lFh:46,lFk:8,lBh:-36,lBk:-48,aFs:40,aFe:100,bA:150,aBs:30,aBe:90,brow:1},
      {tw:-0.8,lean:30,hx:-4,head:4,lFh:84,lFk:-20,lBh:-2,lBk:-100,aFs:-30,aFe:-50,bA:-110,aBs:20,aBe:40,brow:1,mouth:1},
      {tw:-0.4,lean:36,hx:-2,head:6,lFh:96,lFk:-30,lBh:8,lBk:-110,aFs:-10,aFe:-20,bA:-80,aBs:10,aBe:30,smear:1,sa:-130,mouth:1},
      {tw:0.6,lean:40,hx:4,head:8,lFh:96,lFk:-30,lBh:8,lBk:-110,aFs:40,aFe:30,bA:30,smear:2,sa:-90,aBs:-10,aBe:10,mouth:2},
      {tw:1,lean:40,hx:8,head:8,lFh:96,lFk:-30,lBh:8,lBk:-110,aFs:70,aFe:60,bA:76,smear:3,sa:-60,impact:2,aBs:-30,aBe:-10,mouth:2,brow:1},
      {tw:0.8,lean:36,hx:8,head:6,lFh:92,lFk:-26,lBh:4,lBk:-104,aFs:66,aFe:56,bA:80,aBs:-30,aBe:-10,mouth:1},
      {lean:22,hx:4,lFh:60,lFk:-6,lBh:-20,lBk:-70,aFs:40,aFe:90,bA:120,aBs:20,aBe:70},
      {}][i])))}),
    // ombrada: abaixa o ombro e atropela o zumbi correndo (empurra e derruba)
    shoulderCharge:(G,T,D)=>({n:7,hits:{3:1},hitsx:{3:{m:1.4,heavy:1,knock:1,reach:40}},move:[60,200,230,140,40,0,0],dur:D([100,70,70,90,100,100,110]),pose:i=>G(Object.assign({},T,W([
      {tw:0.8,lean:20,hx:-4,head:-4,lFh:40,lFk:-10,lBh:-20,lBk:-60,aFs:-10,aFe:40,bA:140,aBs:20,aBe:60,brow:1,mouth:1},
      {nowide:1,tw:1,plant:0,lean:34,hx:4,head:-6,lFh:60,lFk:0,lBh:-40,lBk:-90,aFs:-20,aFe:30,bA:150,aBs:10,aBe:40,brow:1,mouth:1},
      {nowide:1,tw:1,plant:0,lean:38,hx:8,head:-8,lift:2,lFh:-10,lFk:-60,lBh:56,lBk:0,aFs:-30,aFe:20,bA:150,aBs:0,aBe:30,brow:1,mouth:2},
      {nowide:1,tw:1,lean:40,hx:14,head:-10,flash:0,lFh:70,lFk:14,lBh:-50,lBk:-60,aFs:-40,aFe:10,bA:150,aBs:-10,aBe:20,impact:0,mouth:2,brow:1},
      {nowide:1,tw:0.8,lean:30,hx:12,head:-8,lFh:70,lFk:14,lBh:-48,lBk:-58,aFs:-20,aFe:40,bA:140,aBs:0,aBe:40,mouth:1},
      {lean:16,hx:6,lFh:46,lFk:8,lBh:-36,lBk:-48,aFs:50,aFe:90,bA:130,aBs:30,aBe:90},
      {}][i])))}),
    // tornado: gira duas vezes com a ferramenta aberta, avançando, e acerta dos dois lados (3 acertos)
    spinTornado:(G,T,D)=>({n:10,hits:{2:1,5:2,8:3},hitsx:{2:{m:0.8,both:1,reach:54},5:{m:0.9,both:1,reach:54},8:{m:1.3,heavy:1,both:1,knock:1,reach:56}},z:[0,4,8,6,8,10,8,4,0,0],move:[0,50,60,60,60,60,50,30,0,0],dur:D([100,60,60,60,60,60,60,60,120,110]),pose:i=>{
      const f={tw:1,lean:16,hx:4,lFh:50,lFk:-10,lBh:-20,lBk:-60,aFs:90,aFe:94,bA:90,aBs:-40,aBe:-10,smear:3,sa:220,mouth:2,brow:1};
      const b={tw:-1,lean:8,hx:2,lFh:44,lFk:-10,lBh:-16,lBk:-56,aFs:-70,aFe:-90,bA:-96,aBs:60,aBe:120,smear:3,sa:-10,mouth:2,brow:1};
      const up={nowide:1,plant:0,tw:0,lean:4,lFh:70,lFk:10,lBh:10,lBk:-40,aFs:150,aFe:170,bA:200,aBs:-20,aBe:20,smear:2,sa:90,mouth:2};
      return G(Object.assign({},T,W([{tw:-0.8,lean:-6,lFh:36,lFk:8,lBh:-28,lBk:-40,aFs:-40,aFe:-70,bA:230,aBs:60,aBe:120,brow:1,mouth:1},
        Object.assign({},f,{smear:2}),Object.assign({},f,{impact:1}),up,Object.assign({},b,{plant:0,nowide:1,lFh:56,lFk:-6,lBh:-24,lBk:-62}),Object.assign({},b,{impact:1}),
        Object.assign({},up,{sa:-80}),Object.assign({},f,{lean:20}),Object.assign({},f,{lean:26,hx:10,impact:2,aFe:70,bA:40,sa:200}),{}][i]))); }}),
    // pancada no chão: sobe a ferramenta bem alto e crava no chão; variações: racha (lascas), onda (anda pelo chão), faísca (atordoa em volta)
    groundSlam:(G,T,D,v)=>({n:9,hits:{5:1},hitsx:{5:Object.assign({m:1.6,heavy:1,knock:1,reach:46,slam:1},v==='wave'?{wave:1}:v==='spark'?{stun:1.4,around:56,knock:0}:{around:40})},move:[0,0,10,10,30,20,0,0,0],dur:D([110,110,110,70,40,50,200,120,110]),pose:i=>G(Object.assign({},T,W([
      {lean:6,lFh:40,lFk:6,lBh:-32,lBk:-44,aFs:60,aFe:96,bA:140,aBs:50,aBe:100,brow:1},
      {lean:-10,head:-6,lFh:34,lFk:-6,lBh:-24,lBk:-44,aFs:150,aFe:186,bA:226,aBs:140,aBe:176,brow:1,mouth:1},
      {lean:-18,head:-10,lift:5,plant:0,lFh:56,lFk:-14,lBh:-10,lBk:-50,aFs:176,aFe:208,bA:246,aBs:166,aBe:198,brow:1,mouth:1},
      {lean:-20,head:-12,lift:6,plant:0,lFh:62,lFk:-12,lBh:-4,lBk:-52,aFs:178,aFe:212,bA:252,aBs:170,aBe:202,brow:1,mouth:2},
      {tw:0.6,lean:16,hx:6,lFh:62,lFk:10,lBh:-36,lBk:-50,aFs:110,aFe:120,bA:130,smear:2,sa:252,aBs:100,aBe:116,mouth:2,brow:1},
      {tw:1,lean:46,hx:14,head:-16,lFh:80,lFk:-12,lBh:-14,lBk:-96,aFs:66,aFe:40,bA:6,smear:3,sa:246,impact:2,aBs:60,aBe:36,mouth:2,brow:1},
      {tw:0.9,lean:44,hx:14,head:-14,lFh:80,lFk:-12,lBh:-14,lBk:-96,aFs:64,aFe:38,bA:8,impact:1,aBs:58,aBe:34,mouth:1,brow:1},
      {tw:0.4,lean:24,hx:8,lFh:56,lFk:4,lBh:-30,lBk:-60,aFs:50,aFe:70,bA:80,aBs:40,aBe:70,mouth:1},
      {}][i])))}),
    // fisgada: estica a ferramenta, engancha o zumbi e puxa pro pé (puxa e derruba)
    pullHook:(G,T,D)=>({n:8,hits:{3:1,5:2},hitsx:{3:{m:0.7,pull:1,reach:78},5:{m:1.2,heavy:1,knock:1,reach:44}},move:[0,-20,0,-30,20,40,0,0],dur:D([90,90,50,120,80,60,120,110]),pose:i=>G(Object.assign({},T,W([
      {tw:-0.4,lean:-4,lFh:36,lFk:6,lBh:-30,lBk:-40,aFs:40,aFe:110,bA:160,aBs:40,aBe:100,brow:1},
      {tw:-0.8,lean:-10,hx:-4,lFh:30,lFk:2,lBh:-28,lBk:-40,aFs:120,aFe:160,bA:190,aBs:60,aBe:120,brow:1,mouth:1},
      {tw:0.8,lean:30,hx:14,lFh:70,lFk:12,lBh:-46,lBk:-52,aFs:96,aFe:94,bA:100,smear:2,sa:190,aBs:-40,aBe:-10,mouth:2,brow:1},
      {tw:0.9,lean:34,hx:18,head:-10,lFh:74,lFk:14,lBh:-48,lBk:-54,aFs:96,aFe:92,bA:86,impact:1,aBs:-50,aBe:-20,mouth:2,brow:1},
      {tw:-0.6,lean:-16,hx:-6,head:-6,lFh:30,lFk:-4,lBh:-34,lBk:-50,aFs:30,aFe:-10,bA:-60,smear:2,sa:80,aBs:40,aBe:90,mouth:2,brow:1},
      {tw:1,lean:30,hx:12,lFh:66,lFk:12,lBh:-44,lBk:-52,aFs:120,aFe:100,bA:40,smear:3,sa:170,impact:2,aBs:-40,aBe:-10,mouth:2,brow:1},
      {tw:0.8,lean:26,hx:12,lFh:62,lFk:12,lBh:-42,lBk:-52,aFs:96,aFe:70,bA:30,aBs:-30,aBe:0,mouth:1},
      {}][i])))}),
    // gancho pra cima com pulo: ferramenta de baixo pra cima com o corpo subindo junto (lança alto)
    uppercutSlam:(G,T,D)=>({n:8,hits:{3:1},hitsx:{3:{m:1.5,heavy:1,launch:1,reach:48,hi:1}},z:[0,0,6,18,22,14,2,0],move:[0,20,50,30,10,0,0,0],dur:D([110,110,50,80,100,100,100,110]),pose:i=>G(Object.assign({},T,W([
      {lean:26,head:2,lFh:66,lFk:-30,lBh:-6,lBk:-80,aFs:-20,aFe:-40,bA:-140,aBs:-10,aBe:20,brow:1},
      {tw:-0.6,lean:34,head:6,lFh:80,lFk:-36,lBh:4,lBk:-96,aFs:-30,aFe:-50,bA:-120,aBs:-20,aBe:10,brow:1,mouth:1},
      {nowide:1,tw:0.4,plant:0,lean:10,lFh:60,lFk:0,lBh:-20,lBk:-40,aFs:60,aFe:90,bA:30,smear:2,sa:-130,aBs:-30,aBe:0,mouth:2,brow:1},
      {nowide:1,tw:1,plant:0,lean:-16,head:-14,lFh:90,lFk:10,lBh:-10,lBk:-30,aFs:160,aFe:180,bA:186,smear:3,sa:-90,impact:2,aBs:-40,aBe:-10,mouth:2,brow:1},
      {nowide:1,tw:0.8,plant:0,lean:-14,head:-12,lFh:96,lFk:16,lBh:0,lBk:-26,aFs:166,aFe:186,bA:196,aBs:-40,aBe:-10,mouth:2,brow:1},
      {nowide:1,plant:0,lean:-4,lFh:70,lFk:0,lBh:-10,lBk:-40,aFs:120,aFe:150,bA:170,aBs:-20,aBe:20,mouth:1},
      {lean:22,lFh:60,lFk:-20,lBh:-10,lBk:-70,aFs:60,aFe:100,bA:140,aBs:20,aBe:70,mouth:1},
      {}][i])))}),
    // espetada com atordoamento: mira, crava e segura (injeção/ponta) — deixa o zumbi tonto
    stabStun:(G,T,D)=>({n:8,hits:{3:1},hitsx:{3:{m:1.1,stun:2.2,reach:60}},move:[0,-20,120,40,0,0,0,0],dur:D([110,140,40,200,120,90,100,110]),pose:i=>G(Object.assign({},T,W([
      {lean:0,lFh:36,lFk:6,lBh:-30,lBk:-42,aFs:60,aFe:96,bA:96,aBs:40,aBe:100,brow:1},
      {tw:-0.7,lean:-12,hx:-6,head:-4,lFh:28,lFk:2,lBh:-28,lBk:-42,aFs:-30,aFe:80,bA:92,aBs:60,aBe:120,brow:1,mouth:1},
      {tw:0.7,lean:22,hx:10,lFh:62,lFk:10,lBh:-40,lBk:-46,aFs:86,aFe:90,bA:90,smear:1,sa:100,aBs:-30,aBe:0,mouth:2,brow:1},
      {tw:1,lean:34,hx:22,head:-12,lFh:72,lFk:14,lBh:-46,lBk:-48,aFs:96,aFe:92,bA:92,impact:2,aBs:-60,aBe:-40,mouth:2,brow:1},
      {tw:1,lean:32,hx:22,head:-10,lFh:72,lFk:14,lBh:-46,lBk:-48,aFs:94,aFe:92,bA:94,aBs:90,aBe:96,mouth:1,brow:1},
      {tw:0.4,lean:10,hx:8,lFh:46,lFk:8,lBh:-34,lBk:-46,aFs:60,aFe:96,bA:120,aBs:40,aBe:100,mouth:3},
      {lean:6,lFh:40,lFk:6,lBh:-32,lBk:-44,aFs:60,aFe:96,bA:126,aBs:40,aBe:100,mouth:3,brow:3},
      {}][i])))}),
    // capina: três golpes curtos de cima pra baixo avançando, o último arranca do chão (derruba)
    chops3:(G,T,D)=>({n:10,hits:{2:1,5:2,8:3},hitsx:{2:{m:0.6,reach:50},5:{m:0.7,reach:52},8:{m:1.3,heavy:1,knock:1,reach:54}},move:[0,40,30,0,50,30,0,60,30,0],dur:D([90,50,70,80,50,70,80,50,120,110]),pose:i=>{
      const up={lean:-6,hx:2,lFh:40,lFk:4,lBh:-30,lBk:-42,aFs:150,aFe:186,bA:226,aBs:140,aBe:176,brow:1,mouth:1};
      const dn={tw:0.8,lean:36,hx:12,head:-12,lFh:66,lFk:10,lBh:-40,lBk:-50,aFs:70,aFe:50,bA:16,smear:3,sa:236,aBs:62,aBe:44,mouth:2,brow:1};
      return G(Object.assign({},T,W([up,Object.assign({},dn,{smear:2}),Object.assign({},dn,{impact:1}),Object.assign({},up,{hx:8}),Object.assign({},dn,{hx:18,smear:2}),Object.assign({},dn,{hx:18,impact:1}),
        Object.assign({},up,{hx:14,lift:4,plant:0}),Object.assign({},dn,{hx:24,smear:3,lean:42}),{tw:1,lean:20,hx:24,head:-14,lFh:60,lFk:10,lBh:-40,lBk:-50,aFs:150,aFe:170,bA:200,aBs:140,aBe:160,smear:3,sa:20,impact:2,mouth:2,brow:1},{}][i]))); }}),
    // chute e tiro (armas de fogo): chuta de colado e dispara à queima-roupa no zumbi que recua
    kickShot:(G,T,D)=>({n:9,hits:{2:1},hitsx:{2:{m:0.9,reach:46}},fireAt:[5],fireMul:1.6,move:[0,30,40,-40,-30,0,0,0,0],dur:D([80,60,110,80,70,60,100,110,110]),pose:i=>G(Object.assign({},W([
      {nowide:1,lean:-6,hx:-2,plant:0,lFh:98,lFk:6,lBh:-16,lBk:-28,aFs:40,aFe:96,bA:96,aBs:30,aBe:90,mouth:1,brow:1},
      {nowide:1,lean:-18,hx:4,plant:0,lFh:94,lFk:80,kick:'F',smear:2,sa:20,lBh:-14,lBk:-24,aFs:30,aFe:90,bA:92,aBs:20,aBe:70,mouth:2,brow:1},
      {nowide:1,lean:-22,hx:7,plant:0,lFh:92,lFk:94,kick:'F',smear:3,sa:24,impact:2,lBh:-12,lBk:-22,aFs:30,aFe:90,bA:92,aBs:20,aBe:62,mouth:2,brow:1},
      {lean:6,lFh:40,lFk:6,lBh:-36,lBk:-48,aFs:70,aFe:92,bA:92,aBs:60,aBe:96,brow:1},
      {lean:10,lFh:44,lFk:8,lBh:-38,lBk:-50,aFs:84,aFe:90,bA:90,aBs:76,aBe:92,brow:1,mouth:1},
      {lean:-4,hx:-4,lFh:44,lFk:8,lBh:-38,lBk:-50,aFs:92,aFe:100,bA:104,aBs:84,aBe:100,brow:1,mouth:2},
      {lean:-8,hx:-5,lFh:44,lFk:8,lBh:-38,lBk:-50,aFs:100,aFe:116,bA:124,aBs:90,aBe:112,brow:1,mouth:2},
      {lean:4,lFh:44,lFk:8,lBh:-38,lBk:-50,aFs:80,aFe:92,bA:96,aBs:70,aBe:94,mouth:1},
      {}][i])))}),
    // lâmina de plasma (laser): o feixe curto vira lâmina num arco de cima pra baixo e solta uma rajada larga
    bladeSlash:(G,T,D)=>({n:8,hits:{3:1},hitsx:{3:{m:1.3,heavy:1,both:0,reach:60}},fireAt:[4],fireMul:0.9,fireWide:1,move:[0,0,60,40,0,0,0,0],dur:D([110,110,40,70,110,100,110,110]),pose:i=>G(Object.assign({},W([
      {lean:0,lFh:40,lFk:6,lBh:-32,lBk:-44,aFs:60,aFe:96,bA:96,aBs:50,aBe:100,brow:1},
      {lean:-12,head:-6,lFh:34,lFk:-6,lBh:-24,lBk:-44,aFs:150,aFe:186,bA:210,aBs:140,aBe:176,brow:1,mouth:1},
      {tw:0.6,lean:16,hx:6,lFh:62,lFk:10,lBh:-36,lBk:-50,aFs:120,aFe:130,bA:140,smear:3,sa:220,aBs:100,aBe:116,mouth:2,brow:1},
      {tw:1,lean:30,hx:12,head:-10,lFh:70,lFk:12,lBh:-42,lBk:-52,aFs:86,aFe:80,bA:70,smear:3,sa:210,impact:2,aBs:70,aBe:76,mouth:2,brow:1},
      {tw:0.6,lean:10,hx:8,lFh:62,lFk:10,lBh:-36,lBk:-50,aFs:90,aFe:92,bA:92,aBs:84,aBe:92,mouth:2,brow:1},
      {lean:0,hx:4,lFh:50,lFk:8,lBh:-36,lBk:-50,aFs:96,aFe:110,bA:118,aBs:86,aBe:104,mouth:1},
      {lean:4,lFh:44,lFk:8,lBh:-36,lBk:-48,aFs:80,aFe:96,bA:100,aBs:60,aBe:96},
      {}][i])))}),
  };
  // sig(G,o,[[id, nome, variante, campos extras], ...]) → anims sigNome… (o.two/o.slow iguais ao kit)
  function sigs(G,o,list){
    o=o||{}; const sl=o.slow||1, T=o.two?{two:1}:{}, D=a=>i=>Math.round(a[i]*sl), out={};
    list.forEach(([key,id,nome,extra])=>{ const v=(extra&&extra.v)||null, a=SIG[id](G,T,D,v), PP=extra&&extra.P;
      out[key]=Object.assign(a,{nome,kind:'sig',kf:1,sig:1,cd:7},extra||{}); delete out[key].v; delete out[key].P;
      if(PP){ const pf=a.pose; out[key].pose=i=>Object.assign(pf(i),PP); } }); // P = parâmetros de pose do rig (ex.: enfermeira com a injeção)
    return out;
  }
  return {kit,sigs,SIG,kickTip,kickPiv,kickSmear,smearArc,W};
})();
