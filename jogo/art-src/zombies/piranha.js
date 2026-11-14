/* PIRANHA — fonte de arte (editável). Build: npm run art
   Cardume de Piranhas (Amazônia, comum animal em grupo). Piranhas-vermelhas reais (Pygocentrus nattereri) que a Lua
   fez sobreviver na lama e na água rasa: UM zumbi = UM cardume (3 peixes no comum, 5 no enluarado, 4 no plenilunar),
   cada peixe animado como entidade própria (fase, giro, mandíbula, salto), em formação que circula, morde e salta.
   Anatomia das fotos: corpo alto e comprimido (disco), testa íngreme, MANDÍBULA INFERIOR PROGNATA com dentes
   triangulares interligados (os de baixo aparecem por fora mesmo de boca fechada), olho grande dourado sem pálpebra,
   opérculo marcado, dorso cinza-ardósia, flancos prateados com purpurina e pintas, peito/ventre vermelho-alaranjado,
   nadadeira anal longa avermelhada, adiposa pequena, cauda truncada com faixa escura na borda.
   Corrupção da Lua de Sangue: ventre rasgado mostrando costelas, escamas faltando com carne e fungo verde-ácido,
   nadadeiras em farrapos, dentes sujos de sangue; enluarado com olhos ciano e dentes brilhando; plenilunar
   incandescente com espinhos de osso no dorso.
   Adereço xPond: a poça de água preta (igarapé/igapó) que o cardume traz/ocupa — desenhada pelo motor como ator de chão.
   Hi-bit: honra PIX.getK(). */
const PIRANHA=(function(){
  const {rad,lerp,mkPen,compose}=PIX;
  const FW=256, FH=132, GROUND=120, AX=128;
  const RIM={comum:'#c8d8f0', enluarado:'#9ff6ff', plenilunar:'#ffb46a'};
  /** peixes no cardume por forma */
  const COUNT={comum:3, enluarado:5, plenilunar:4};
  /** formação: [dx, profundidade (−=atrás), escala]; 0 = líder (morde/salta primeiro) */
  const SLOTS=[[5,0,1.3],[-46,-11,1.17],[44,-15,1.13],[-80,4,1.1],[78,-4,1.1]];
  const PH=[0,2.1,4.2,1.1,3.3];
  const WL0=GROUND-6; // linha d'água do líder

  /* ---------- materiais ---------- */
  function mats(form){
    const m={
      dorsal:['#7a8ea0','#3e4e5e','#26303e','#121826'],
      silver:['#f2eedc','#b4ae98','#7a7466','#403c40'],
      gold:['#fff2b0','#eab454','#b06a2c','#5e3020'],
      belly:['#ffb070','#f24a26','#a8201e','#560c1a'],
      fin:['#8a8890','#4a4854','#2c2a36','#16141e'],
      finR:['#ffa060','#ec3a20','#9a1a1a','#4a0a14'],
      eye:['#ffffff','#fff4a0','#ffc23a','#c2401a'],
      pupil:['#4a3a3a','#1e1418','#120a0e','#08040a'],
      teeth:['#ffffff','#f4eedc','#b0a488','#5e5040'],
      mouth:['#9a3a46','#5a1828','#2e0a18','#18040c'],
      flesh:['#f08a86','#a02a3a','#6a1a2a','#3a0c1a'],
      bone:['#fff6e0','#d8d0b8','#9a9078','#5a5040'],
      moss:['#e0ff8a','#a6f03a','#5e9a22','#2e5414'],
      mud:['#b0926a','#6e5238','#4a3424','#2a1c14'],
      water:['#d8eef0','#86aab0','#3a5660','#1a2a32'],
      pond:['#5a7078','#2c3c42','#1a2428','#0e1418'],
      leaf:['#a8d860','#4d8a3c','#2f5a2a','#16301a'],
      blood:['#c84a3e','#8e2a2c','#5e1824','#3a0e1a'],
      acid:['#d8ff8a','#a6f03a','#5e9a22','#2e5414'],
      glow:['#ffffff','#fff6a8','#ffcc40','#c25a14'],
      swish:['#fdfdff','#e6f0ff','#b4c4e8','#7484b0'],
    };
    if(form==='enluarado'){
      m.dorsal=['#a6aee8','#5e6aa8','#3a427a','#20244e']; m.silver=['#f0f6ff','#b4c4ec','#7486b8','#444e80'];
      m.gold=['#e8f4ff','#9ab8e8','#5e78b0','#34406e']; m.belly=['#e8a0ff','#9a56d0','#62309a','#38185e'];
      m.finR=['#d29aff','#8a4ac0','#5a2a8a','#341656']; m.fin=['#8a8cc0','#4a4a80','#2c2c5a','#16163a'];
      m.eye=['#ffffff','#b8fbff','#4ad8f0','#1a8aa8']; m.glow=['#effffe','#7af4ff','#2ab0d8','#146a96'];
      m.teeth=['#ffffff','#c8fbff','#7ad8f0','#3a8ab8']; m.flesh=['#f0b0ff','#b866d8','#7a3a9e','#46206a'];
      m.blood=['#b46ad8','#7e3ea6','#542474','#34144a']; m.moss=['#c8fbff','#7af4ff','#2ab0d8','#146a96'];
      m.water=['#e0fcff','#8ad0e0','#3a6a80','#1a3044']; m.pond=['#4a6a88','#24384e','#162232','#0c141e'];
      m.mud=['#9a94b8','#5e5a7e','#3e3a58','#242238'];
    }
    if(form==='plenilunar'){
      m.dorsal=['#ffae7a','#c8503a','#862a2e','#4e1222']; m.silver=['#fff0d0','#ffb07a','#d2603e','#7e2a2a'];
      m.gold=['#fff6b0','#ffcc4a','#e0782a','#8a3a18']; m.belly=['#ffd070','#ff5a2a','#c22a1e','#6e1018'];
      m.finR=['#ffb060','#ff4a1e','#b0221a','#5e0e14']; m.fin=['#c2604a','#7e2a2a','#4e1620','#2a0a14'];
      m.eye=['#fffbe0','#ffe04a','#ff8a2a','#b83a14']; m.glow=['#fff6c0','#ffb43a','#e0581e','#8a2414'];
      m.flesh=['#ffc07a','#f06a3a','#a8302e','#5e1422']; m.blood=['#ff7a3a','#d43a26','#8a1c22','#4e0c18'];
      m.bone=['#fffce8','#f2dcb0','#b89070','#6a4434']; m.moss=['#fff0a0','#ffb43a','#e0581e','#8a2414'];
      m.water=['#ffe0c8','#d08a7a','#7a2e36','#3e1220']; m.pond=['#8a2a36','#6a1424','#3e0c18','#22060e'];
      m.mud=['#b4705a','#844a3e','#5a2e2e','#36181e'];
    }
    return punch(m);
  }
  const NAMES={dorsal:'Dorso (ardósia)',silver:'Flanco prateado',gold:'Purpurina dourada',belly:'Ventre vermelho',fin:'Nadadeiras',finR:'Nadadeira anal',eye:'Olho',pupil:'Pupila',teeth:'Dentes',mouth:'Boca',flesh:'Carne exposta',bone:'Osso / costelas',moss:'Fungo nas escamas',mud:'Lama',water:'Água',pond:'Poça (água preta)',leaf:'Folhas',blood:'Sangue',acid:'Ácido',glow:'Brilho',swish:'Rastro da mordida'};
  function sat(h,k){ const [r,g,b]=PIX.hexRgb(h), y=(r+g+b)/3; return PIX.toHex(y+(r-y)*k,y+(g-y)*k,y+(b-y)*k); }
  const NOPUNCH={swish:1,glow:1,water:1,pond:1};
  function punch(m){ const o={}; for(const k in m){ const r=m[k]; o[k]=NOPUNCH[k]?[r[0],r[1],r[2],r[3]]:[sat(r[0],1.1),sat(r[1],1.22),PIX.mix(sat(r[2],1.12),'#24184e',0.26),PIX.mix(r[3],'#0e0820',0.42)]; } return o; }

  /* ---------- poses ---------- */
  // por peixe k (0..4): x/y = deslocamento (y + = pra cima), r = inclinação (° , + = nariz pra cima), b = cauda (°),
  // j = boca (0 fechada .. 1 escancarada), s = quanto está submerso (0 = fora d'água), d = sentido (−1..1: vira de costas).
  // globais: splash/sp (respingo, fase), mud (lama espirrando), beach (encalhado, de lado na lama), die (barriga pra
  // cima), pool (poça de sangue), glow (olhos acesos), shake (tremedeira), smear (rastro da mordida), flash.
  const REST={splash:0,sp:0,mud:0,beach:0,die:0,pool:0,glow:0,shake:0,smear:0,flash:0};
  for(let k=0;k<5;k++) Object.assign(REST,{['x'+k]:0,['y'+k]:0,['r'+k]:0,['b'+k]:0,['j'+k]:0.12,['s'+k]:0.12,['d'+k]:1});
  const S=Math.sin, C=Math.cos, PI=Math.PI, mx=Math.max, mn=Math.min;
  // monta a pose a partir de uma função por peixe
  function per(fn,g){ const o=Object.assign({},g||{}); for(let k=0;k<5;k++){ const f=fn(k)||{}; for(const q in f) if(f[q]!=null&&!isNaN(f[q])) o[q+k]=f[q]; } return o; }
  const lagOf=[0,1,2,1,2];
  const tb=(arr,i)=>arr[mx(0,mn(arr.length-1,i))];
  // mordida do líder (quadro a quadro); os outros seguem com atraso e amplitude menor
  const BITE=[{x:-5,r:6,j:0.3,b:-20},{x:-10,r:11,j:0.95,b:-32,s:0.3},{x:16,y:4,r:-4,j:1,b:32},{x:20,y:3,r:-7,j:0,b:12},{x:14,y:1,r:-3,j:0.2,b:-8},{x:6,j:0.3,b:6},{x:1,j:0.15,b:0}];
  const LEAP={y:[-2,10,24,32,36,30,18,3,0],s:[0.55,0.12,0,0,0,0,0,0.42,0.36],r:[12,32,22,6,-10,-26,-36,-10,0],j:[0.3,0.7,0.9,1,0,0.2,0.4,0.3,0.15],x:[0,2,5,8,10,10,8,4,0],b:[-20,30,-20,10,-14,20,-24,10,0]};
  const ANIMS={
    idle:{nome:'Parado (nadam em círculo, boca abrindo)',n:6,dur:()=>150,pose:i=>{ const p=i/6*PI*2;
      return per(k=>{ const a=p+PH[k], turn=k===2||k===4;
        return {x:(turn?7:4)*S(a), y:1.4*S(2*a), r:4*S(a+1), b:18*S(2*a+k), j:0.12+0.4*mx(0,S(a+k*0.7)), s:0.12+0.04*S(a), d:turn?mx(-1,mn(1,1.8*C(a))):1}; },
        {splash:0.25, sp:i}); }},
    walk:{nome:'Nadando na lama (ondula, lama espirra)',n:8,dur:()=>110,pose:i=>{ const p=i/8*PI*2;
      return per(k=>{ const a=p+PH[k]*0.6;
        return {x:3*S(a), y:3*mx(0,S(a)), r:9*C(a), b:28*S(2*a), j:0.18+0.16*S(a+1), s:0.14-0.1*mx(0,S(a))}; },
        {splash:0.9, sp:i, mud:0.6}); }},
    alert:{nome:'Alerta (virada brusca, olhos fixos)',n:5,dur:i=>[90,80,120,140,160][i],pose:i=>[
      per(()=>({d:-1, j:0.1, b:-10}),{}),
      per(k=>({d:-0.4+0.1*k, r:6, b:30, j:0.2}),{splash:0.8, sp:1}),
      per(()=>({d:1, r:12, y:3, j:0.55, b:-24, s:0.28}),{glow:1, splash:1.4, sp:2}),
      per(k=>({r:8, y:2, j:0.75-0.1*(k%2), b:10, s:0.3}),{glow:1, shake:1, splash:0.6, sp:3}),
      per(()=>({r:2, j:0.3}),{glow:0.6})][i]},
    // ---- golpes (hit = quadro do dano, reach = alcance em px lógicos) ----
    bite:{nome:'Mordida (recua, dash, estalo de dentes)',n:7,hit:3,reach:40,dur:i=>[130,120,60,70,110,120,130][i],pose:i=>
      per(k=>{ if(k===0) return BITE[i]; const f=tb(BITE,i-lagOf[k]), q=0.5; return {x:(f.x||0)*q, y:(f.y||0)*q, r:(f.r||0)*q, b:f.b||0, j:k%2?f.j:tb(BITE,i-lagOf[k]-1).j, s:f.s}; },
        {smear:i===2||i===3?1:0, splash:[0.3,0.4,1.4,1,0.5,0.3,0.2][i], sp:i, mud:i===2?0.8:0})},
    leap:{nome:'Salto fora d\'água (mordida no ápice; cardume em sequência)',n:9,hit:4,hits3:[4,5,6],air:[1,6],land:7,reach:46,
      z:[0,2,10,16,20,18,10,2,0],dur:i=>[260,140,90,80,90,90,100,160,180][i],pose:i=>
      per(k=>{ const t=i-lagOf[k], q=k===0?1:0.78;
        if(t<0) return {y:-2, s:0.55, r:10, j:0.3, b:-18};
        return {y:tb(LEAP.y,t)*q, s:tb(LEAP.s,t), r:tb(LEAP.r,t), j:tb(LEAP.j,t), x:tb(LEAP.x,t)*q, b:tb(LEAP.b,t)}; },
        {splash:[0.6,2,1.2,0.5,0.3,0.4,0.8,2,1][i], sp:i, smear:i===4?1:0})},
    frenzy:{nome:'Frenesi (tremem, olhos brilham)',n:6,dur:()=>70,pose:i=>
      per(k=>({x:(i+k)%2?1.6:-1.6, y:2*((i+k)%3===0?1:0), r:(i%2?6:-6)+k, b:(i%2?34:-34), j:(i+k)%2?1:0.05, s:0.26}),{glow:1, shake:1, splash:1.6, sp:i, mud:0.6})},
    beached:{nome:'Encalhadas (debatem-se na lama)',n:6,dur:()=>110,pose:i=>{ const p=i/6*PI*2;
      return per(k=>{ const a=p+PH[k]; return {r:30*S(a), y:5*mx(0,S(2*a)), b:34*S(2*a+1), j:0.5+0.5*S(3*a), s:0, x:2*S(a)}; },{beach:1, mud:0.9, sp:i}); }},
    hurt:{nome:'Dano (recuam)',n:3,dur:i=>[80,120,140][i],pose:i=>[
      per(()=>({x:-6, r:16, j:0.85, b:-30, y:2}),{flash:1, splash:1.6, sp:0}),
      per(()=>({x:-4, r:9, j:0.6, b:20}),{splash:0.8, sp:1}),
      per(()=>({x:-1, r:2, j:0.25}),{})][i]},
    hurtB:{nome:'Dano (cardume se espalha)',n:3,dur:i=>[80,120,150][i],pose:i=>[
      per(k=>({x:Math.sign(SLOTS[k][0]||1)*7, y:8, r:-22, j:0.9, s:0.05, b:30}),{flash:1, splash:2, sp:0}),
      per(k=>({x:Math.sign(SLOTS[k][0]||1)*4, y:3, r:-8, j:0.5, s:0.2}),{splash:1.2, sp:1}),
      per(()=>({j:0.2}),{splash:0.3, sp:2})][i]},
    fall:{nome:'Derrubadas (jogadas pra fora d\'água)',n:4,dur:i=>[90,100,120,260][i],pose:i=>[
      per(k=>({y:10, r:40+k*6, j:0.9, s:0, b:30}),{flash:1, splash:2, sp:0}),
      per(k=>({y:14, r:80-k*10, j:0.6, s:0, b:-30}),{splash:0.6, sp:1}),
      per(k=>({y:2, r:20*(k%2?1:-1), j:0.8, b:20}),{beach:1, mud:1.2, sp:2}),
      per(k=>({r:10*(k%2?1:-1), j:0.5, b:-10}),{beach:1, mud:0.4, sp:3})][i]},
    getup:{nome:'Voltam pra água (pulo de volta)',n:4,dur:i=>[180,120,120,150][i],pose:i=>[
      per(k=>({r:-20*(k%2?1:-1), j:0.6, b:24}),{beach:1, mud:0.7, sp:0}),
      per(()=>({y:12, r:-24, s:0, j:0.3, b:-30}),{mud:0.5, sp:1}),
      per(()=>({y:1, r:-6, s:0.45, j:0.2, b:20}),{splash:2, sp:2}),
      per(()=>({j:0.15}),{splash:0.6, sp:3})][i]},
    death:{nome:'Morte (barriga pra cima, derrete na poça de sangue)',n:6,dur:i=>[90,150,170,180,200,600][i],pose:i=>
      per(k=>({y:[7,4,0,-1,-2,-3][i], r:[22,10,0,-5,0,2][i]+k*2, j:[0.9,0.8,0.7,0.6,0.5,0.5][i], b:[30,-20,10,0,4,0][i], s:[0.25,0.2,0.3,0.45,0.6,0.74][i]}),
        {flash:i===0?1:0, die:[0,0.3,0.6,0.85,1,1][i], pool:[0,0.2,0.45,0.7,0.9,1][i], splash:[1.6,0.6,0.3,0,0,0][i], sp:i})},
    // reações do motor (lançado / agarrado): peixes fora d'água se debatendo
    tumble:{nome:'Voando (lançadas)',n:4,dur:()=>70,loop:1,pose:i=>per(k=>({r:[30,80,-40,-90][(i+k)%4], y:6+2*k%3, j:(i+k)%2?1:0.2, s:0, b:(i%2?30:-30)}),{flash:i===0?1:0})},
    grabbed:{nome:'Agarradas (debatem-se)',n:4,dur:()=>110,loop:1,pose:i=>per(k=>({r:(i+k)%2?30:-30, y:4, j:(i+k)%2?0.9:0.3, s:0, b:(i%2?-30:30)}),{})},
    // adereço: a poça de água preta (ator de chão do motor; âncora no centro em cv._ax/_gy)
    xPond:{nome:'Poça d\'água (adereço)',n:4,prop:true,dur:()=>180,pose:i=>({st:i})},
  };
  function poseOf(anim,i){ const A=ANIMS[anim]; if(A&&A.prop) return Object.assign({},REST,A.pose(i)); return Object.assign({},REST,A.pose(i)); }

  /* ---------- utilitários ---------- */
  const hsh=(a,b)=>{ const s=Math.sin(a*127.1+b*311.7)*43758.5453; return s-Math.floor(s); };
  const rot=(q,h,a)=>{ const c=Math.cos(a), s=Math.sin(a), dx=q[0]-h[0], dy=q[1]-h[1]; return [h[0]+dx*c-dy*s, h[1]+dx*s+dy*c]; };
  function clipPoly(c,pts,fn){ c.save(); c.beginPath(); pts.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])); c.closePath(); c.clip(); fn(); c.restore(); }

  /* ---------- peixe (coordenadas locais: nariz pra +x, origem no centro do corpo) ---------- */
  const BODY=[[16,-1],[15.6,-4.4],[13.8,-8.4],[10.6,-11.8],[6,-14.2],[1,-15.4],[-4,-15],[-9,-12.8],[-13.6,-8.8],[-16.6,-5.2],[-18.8,-3.4],
    [-18.8,3.2],[-16.4,4.8],[-12.2,8.6],[-7,11.8],[-1,13.6],[5,13.2],[10,10.8],[13.4,7.8],[15.2,4.6],[15.8,1.6]];
  const HINGE=[9.2,3.2];
  const JAW=[[9,1.8],[19.4,0.4],[20.6,2.8],[18.6,6.8],[12.6,9],[8.4,6.8]];
  // nadadeiras (o lado de trás do peixe)
  function drawFins(p,c,M,f,form){
    // cauda truncada-bifurcada, gira na base (pedúnculo)
    const tb=rad(f.b), H=[-18.4,0], T=q=>rot(q,H,tb);
    const tail=[[-18,-3.4],[-24.4,-10.6],[-29.2,-13],[-28.6,-8.4],[-26,-2],[-25.4,0],[-26,2],[-28.6,8.4],[-29.2,13],[-24.4,10.6],[-18,3.4]].map(T);
    p.F(M.fin[1]); p.poly(tail);
    clipPoly(c,tail,()=>{
      p.F(M.fin[2]); p.poly([T([-18,-4]),T([-23,-5]),T([-23,5]),T([-18,4])]);
      p.F(M.fin[3]); p.poly([T([-27,-14]),T([-30,-14]),T([-30,14]),T([-27,14]),T([-25,2]),T([-25,-2])]); // faixa escura da borda
      p.F(M.fin[0]); p.poly([T([-21,-6]),T([-25.6,-10.4]),T([-26,-9.6]),T([-21.6,-5])]);
      p.F(M.finR[2]); p.poly([T([-19,1]),T([-24,5]),T([-23,7]),T([-19,3])]);
    });
    // farrapos na cauda
    p.F(M.fin[3]); [[-27.4,-6],[-27,7]].forEach(q=>{ const a=T(q), b=T([q[0]-2.6,q[1]+1.2]), d=T([q[0]-2.4,q[1]-1]); p.poly([a,b,d]); });
    // dorsal (triangular, varrida pra trás, rasgada) + adiposa
    const dors=[[-2.4,-14.8],[-7.6,-22.4],[-9.6,-21.2],[-9.2,-18],[-10.4,-12.4]];
    p.F(M.fin[1]); p.poly(dors);
    p.F(M.fin[2]); p.poly([[-5.4,-15],[-8.4,-21],[-9.4,-20.6],[-9.4,-13]]);
    p.F(M.fin[0]); p.poly([[-3,-15],[-7.2,-21.4],[-7.6,-20.6],[-4,-15]]);
    p.F(M.fin[3]); p.poly([[-8.6,-19.4],[-9.8,-17.4],[-8.2,-17.8]]); // rasgo
    p.F(M.fin[1]); p.poly([[-14,-8.6],[-15.8,-11.6],[-16.6,-10.6],[-16.4,-7]]); // adiposa
    if(form==='plenilunar'){ // espinhos de osso saindo do dorso
      [[3,-15.2,-1,6.4],[-0.4,-15.6,-3.6,5.6],[7,-13.8,3.2,5.2],[-12,-10.6,-14.4,4]].forEach(([x,y,tx,h])=>{ p.F(M.bone[1]); p.poly([[x-1.4,y+1],[x+1.4,y+1.2],[tx,y-h]]); p.F(M.bone[0]); p.poly([[x-1,y+0.8],[x-0.2,y+1],[tx-0.2,y-h+0.6]]); });
    }
    // anal longa avermelhada com borda escura
    const anal=[[-6,11.8],[-9.6,15.8],[-14.4,13.6],[-17,9.2],[-15.6,5.2]];
    p.F(M.finR[1]); p.poly(anal);
    p.F(M.finR[2]); p.poly([[-9.6,15.8],[-14.4,13.6],[-17,9.2],[-15.4,9.4],[-12.6,12.4]]);
    p.F(M.fin[3]); p.poly([[-9.6,15.8],[-11,15.4],[-14.4,13.6],[-14.6,12.8],[-11,14.2]]);
    p.F(M.finR[0]); p.poly([[-6.4,12],[-8.4,14.2],[-8.8,13.6]]);
    // pélvica
    p.F(M.finR[1]); p.poly([[2.4,13.2],[-1.6,17.8],[-3.2,17],[-1.6,13.2]]); p.F(M.finR[2]); p.poly([[-1.6,17.8],[-3.2,17],[-2,15.4]]);
  }
  // corpo + cabeça + olho + corrupção + boca de cima
  function drawBody(p,c,M,f,form,k,glow){
    p.F(M.silver[1]); p.poly(BODY);
    clipPoly(c,BODY,()=>{
      // dorso ardósia descendo pela testa
      p.F(M.dorsal[1]); p.poly([[20,-20],[20,-7.4],[14,-7.6],[8,-6.6],[0,-6.4],[-8,-4.6],[-16,-2.2],[-22,-1.8],[-22,-20]]);
      p.F(M.dorsal[2]); p.poly([[20,-20],[20,-12],[6,-12.4],[-6,-12.2],[-16,-6.4],[-22,-5],[-22,-20]]);
      p.F(M.dorsal[0]); p.poly([[11,-11.4],[4,-13.8],[-2,-14.4],[3,-12.8]]);
      // faixa dourada (purpurina) entre a prata e o vermelho
      p.F(M.gold[1]); p.poly([[16,-2],[10,-1.6],[2,-1],[-6,-0.8],[-14,-0.4],[-22,0],[-22,4],[-12,4],[-2,4],[10,3],[16,2]]);
      // peito e ventre vermelho-alaranjado
      p.F(M.belly[1]); p.poly([[17,0.6],[12,1.4],[4,2],[-4,2.4],[-12,2.6],[-20,2.6],[-20,20],[18,20]]);
      p.F(M.belly[2]); p.poly([[17,9.6],[8,12.2],[0,13.6],[-8,12.4],[-14,9.8],[-20,9],[-20,20],[18,20]]);
      p.F(M.belly[0]); p.poly([[8,3],[-6,3.6],[-10,4.6],[2,4.4]]);
      p.F(M.belly[0]); p.poly([[12.4,6.4],[6,8.4],[2,9],[7,7.6]]);
      // pintas escuras e purpurina no flanco (determinístico por peixe)
      for(let q=0;q<40;q++){ const x=-15+hsh(q,k+1)*27, y=-9+hsh(q+40,k+3)*14; if(x>10&&y<-2) continue;
        p.F(q%3?M.silver[0]:M.dorsal[2]); p.rect(x,y,q%3?0.7:1,q%3?0.7:0.9); }
      p.F(M.gold[0]); for(let q=0;q<22;q++){ const x=-14+hsh(q+7,k)*24, y=-6+hsh(q+9,k+2)*12; p.rect(x,y,0.8,0.6); }
      // linhas de escama (arcos curtos)
      p.F(M.silver[2]); for(let r=0;r<3;r++) for(let q=0;q<5;q++){ const x=-13+q*4.6+(r%2)*2.3, y=-6+r*3.6; p.rect(x,y,1.6,0.5); p.rect(x+1.4,y-0.6,0.5,0.6); }
      p.F(M.silver[0]); p.poly([[4,-7.4],[-6,-6.2],[-14,-3.6],[-6,-4.6],[3,-5.8]]);
      // linha lateral
      p.F(M.silver[0]); p.poly([[6,-3.8],[-6,-2.2],[-17,-0.6],[-17,0.2],[-6,-1.4],[6,-3]]);
      // opérculo (placa da guelra): arco escuro com brilho na frente
      p.F(M.silver[2]); p.poly([[7.4,-10],[5.6,-6],[5,-1],[5.6,4],[7.6,8.6],[6.4,9],[4,4],[3.4,-1],[4.2,-6.4],[6.2,-10.4]]);
      p.F(M.silver[0]); p.poly([[8.8,-8.6],[7.4,-5],[7.2,0],[8,3],[7.2,3],[6.2,-1],[6.6,-5.6]]);
      p.F(M.belly[2]); p.poly([[5.2,4],[7.6,8.6],[6.4,9],[4.6,5]]);
      // bochecha/maxilar
      p.F(M.silver[2]); p.poly([[9.6,1],[14.6,0.2],[13.6,1.8],[10,2.4]]);
      // ---- corrupção (varia por peixe) ----
      if(k%3===0){ // ventre rasgado: carne e costelas
        const tear=[[-8,5.4],[2,4.4],[8,6.6],[6.6,12],[1,13.8],[-6,12.8],[-10,9.4]];
        p.F(M.flesh[2]); p.poly(tear);
        p.F(M.flesh[3]); p.poly([[-7,7.4],[5,6.6],[4,12.6],[-6,12.2]]);
        p.F(M.bone[1]); [-7,-4.2,-1.4,1.4,4.2].forEach((x,q)=>p.poly([[x,5.6],[x+1.1,5.4],[x+0.4-q*0.1,12.6],[x-0.5,12.4]]));
        p.F(M.bone[0]); [-6.8,-4,-1.2,1.6].forEach(x=>p.rect(x,6,0.5,2.2));
        p.F(M.flesh[1]); p.poly([[-8,5.4],[2,4.4],[8,6.6],[7.6,7.6],[2,5.6],[-7.6,6.6]]);
        p.F(M.blood[1]); p.rect(1,12.6,1,1.6); p.rect(-2,12.2,0.8,1.2);
      } else if(k%3===1){ // escamas faltando com carne e fungo
        p.F(M.flesh[1]); p.poly([[-12,-5],[-6,-6.4],[-4.4,-2.4],[-7,0.4],[-11.6,-0.6]]);
        p.F(M.flesh[2]); p.poly([[-10.6,-3.6],[-6.4,-4.2],[-6.2,-1.4],[-10,-1.4]]);
        p.F(M.moss[1]); [[-12.4,-5.2],[-5.6,-6.6],[-4.2,-2.8],[-11.6,-0.4],[-8.4,0.6]].forEach(([x,y])=>{ p.rect(x,y,1.2,0.9); });
        p.F(M.moss[0]); p.rect(-6,-6.4,0.6,0.6); p.rect(-12,-4.8,0.6,0.5);
        p.F(M.moss[2]); p.rect(-9,0.4,1.4,0.6);
        p.F(M.bone[1]); p.poly([[-9.4,-3],[-7.4,-3.6],[-7.2,-2.6]]);
      } else { // ferida na cabeça: osso do crânio atrás do olho
        p.F(M.flesh[1]); p.poly([[3,-12.6],[8.4,-12.4],[8.6,-9],[4,-8.4]]);
        p.F(M.bone[1]); p.poly([[4.2,-12],[7.8,-11.8],[7.6,-9.8],[4.6,-9.4]]);
        p.F(M.bone[2]); p.rect(5.4,-11.4,1.4,0.6); p.F(M.bone[0]); p.rect(4.6,-11.8,1.2,0.5);
        p.F(M.moss[1]); p.rect(-14,-5,1.2,0.8); p.rect(-12.6,-6.2,0.8,0.7);
        // ventre com corte menor
        p.F(M.flesh[2]); p.poly([[-6,9],[0,8.4],[-1,11.4],[-6,11]]); p.F(M.bone[1]); p.rect(-4.4,8.8,0.6,2.2); p.rect(-2.4,8.6,0.6,2.4);
      }
    });
    // narina
    p.F(M.dorsal[3]); p.rect(13.6,-5.8,0.9,0.8);
    // olho grande sem pálpebra (dourado; olho de lua nas formas da Lua)
    const ex=10.6, ey=-5.6, gl=true; glow=Math.max(glow,0.5);
    p.F(M.silver[3]); p.ell(ex,ey,3.5,3.4);
    p.F(gl&&glow>=0.5?M.glow[1]:M.eye[1]); p.ell(ex,ey,2.8,2.7);
    p.F(gl&&glow>=0.5?M.glow[2]:M.eye[2]); p.poly([[ex-2.8,ey],[ex+2.8,ey],[ex+2.2,ey+1.8],[ex,ey+2.7],[ex-2.2,ey+1.8]]);
    p.F(M.eye[3]); p.rect(ex-2.6,ey+1.8,1.2,0.6);
    p.F(M.pupil[1]); p.ell(ex+0.6,ey+0.2,0.9,1.3);
    p.F(gl?M.glow[0]:M.eye[0]); p.rect(ex-1.6,ey-1.8,1.2,1); p.rect(ex+1.4,ey+1,0.6,0.6);
    if(glow>=0.5){ p.F(M.glow[1]); p.poly([[ex-3,ey-0.6],[ex-8,ey-1.6],[ex-8,ey-0.6],[ex-3,ey+0.4]]); } // rastro de brilho
  }
  // dentes de cima + cavidade da boca (atrás da mandíbula)
  function drawMouth(p,M,f,form){
    const ja=rad(f.j*40), J=q=>rot(q,HINGE,ja);
    if(f.j>0.08){ p.F(M.mouth[2]); p.poly([HINGE,[16,-0.6],J([17.6,0.9]),J([12.4,4]),J([9,3])]);
      p.F(M.mouth[1]); p.poly([[11,1.4],[14.6,0.6],J([15,2.2]),J([11.6,3.6])]); p.F(M.mouth[3]); p.ell(10.8,2.4,1.2,0.9); }
    // dentes de cima (triângulos apontando pra baixo)
    for(let q=0;q<4;q++){ const x=10.6+q*1.5; p.F(M.teeth[0]); p.poly([[x,0.2-q*0.2],[x+1.5,0-q*0.2],[x+0.7,2.8-q*0.2]]); p.F(M.teeth[2]); p.rect(x+0.9,0.4-q*0.2,0.5,1); }
    p.F(M.blood[1]); p.rect(13.4,1.2,0.6,0.8);
    // lábio de cima
    p.F(M.dorsal[2]); p.poly([[10,-0.6],[16,-1.4],[16.2,-0.4],[10.4,0.4]]);
  }
  // mandíbula prognata com dentes triangulares interligados (gira na dobradiça)
  function drawJaw(p,M,f,form){
    const ja=rad(f.j*40), J=q=>rot(q,HINGE,ja);
    // dentes de baixo por fora (apontam pra cima)
    for(let q=0;q<5;q++){ const x=11.4+q*1.66; p.F(M.teeth[0]); p.poly([J([x,1.6]),J([x+1.7,1.3]),J([x+0.8,-2.4])]); p.F(M.teeth[2]); p.poly([J([x+1.1,1.4]),J([x+1.7,1.3]),J([x+0.9,-1.4])]); }
    p.F(M.teeth[3]); p.poly([J([11,1.6]),J([19.6,0.8]),J([19.6,1.6]),J([11,2.2])]);
    p.F(M.belly[1]); p.poly(JAW.map(J));
    p.F(M.silver[1]); p.poly([J([9,1.8]),J([19.4,0.4]),J([20.2,2.4]),J([12,3.8]),J([9,3.6])]);
    p.F(M.belly[2]); p.poly([J([17,5.8]),J([12.4,7.8]),J([8.6,6.2]),J([12,6.4])]);
    p.F(M.silver[0]); p.poly([J([11,2.2]),J([16.6,1.6]),J([16.4,2.2]),J([11.2,2.8])]);
    p.F(M.blood[1]); p.poly([J([14.2,1.4]),J([15.4,1.2]),J([15.2,3.4]),J([14.6,3.8])]); p.rect(J([17,3])[0],J([17,3])[1],0.8,1.4);
    if(form==='enluarado'){ p.F(M.glow[1]); p.rect(J([12,0.4])[0],J([12,0.4])[1],0.6,0.6); p.rect(J([15,0.2])[0],J([15,0.2])[1],0.6,0.6); }
  }
  function drawPectoral(p,M,f){
    const a=rad(10*Math.sin(f.b*0.05)), H=[7.6,4.6], T=q=>rot(q,H,a);
    p.F(M.finR[1]); p.poly([T([8.4,4]),T([2.4,8.6]),T([1.6,7.6]),T([5,4.6])]);
    p.F(M.finR[2]); p.poly([T([2.4,8.6]),T([1.6,7.6]),T([4,6.6])]);
  }

  /* ---------- montagem do cardume ---------- */
  function fishList(P,form){
    const n=COUNT[form]||3, out=[];
    for(let k=0;k<n;k++){ const [dx,dep,s]=SLOTS[k];
      const sh=P.shake>=0.5?((k+Math.round(P.sp))%2?0.8:-0.8):0;
      const f={k, s, dep, x:AX+dx+P['x'+k]+sh, lift:P['y'+k], r:P['r'+k], b:P['b'+k], j:mx(0,mn(1,P['j'+k])), sub:mx(0,mn(0.9,P['s'+k])), d:P['d'+k]};
      f.wl=WL0+dep; out.push(f); }
    return out.sort((a,b)=>a.dep-b.dep);
  }
  // centro do corpo e transformação de um peixe
  function place(f,P){
    const h=30*f.s, beach=P.beach>=0.5;
    let cy;
    if(beach) cy=GROUND-1-11*f.s-f.lift;            // de lado na lama
    else cy=f.wl-h/2+f.sub*h+4*f.s-f.lift;
    const die=P.die, sy=(beach?0.86:1)*Math.cos(die*PI)||0.01;
    let sx=f.d; if(Math.abs(sx)<0.14) sx=sx<0?-0.14:0.14;
    return {cx:f.x, cy, ang:rad(-f.r)*(sx<0?-1:1)+(beach?0:0), sx:sx*f.s, sy:sy*f.s};
  }
  function withFish(c,p,f,P,fn,clip){
    const t=place(f,P);
    if(clip){ p.id(); c.save(); c.beginPath(); c.rect(0,0,FW,clip); c.clip(); }
    p.xf(t.ang,t.cx,t.cy); c.scale(t.sx,t.sy); fn(); p.id();
    if(clip) c.restore();
  }
  function wakeOf(f,P){ return {x:f.x, y:f.wl, rx:20*f.s, ry:3.6*f.s}; }
  // anel d'água (metade de trás antes do peixe, metade da frente depois)
  function drawRipple(c,p,M,f,P,front){
    if(P.beach>=0.5||f.sub<0.06) return;
    const w=wakeOf(f,P), wob=1+0.08*S(P.sp*1.7+f.k);
    p.id(); c.save(); c.beginPath(); if(front) c.rect(0,w.y,FW,FH); else c.rect(0,0,FW,w.y); c.clip();
    if(front){ p.F(M.water[3]); p.ell(w.x,w.y,w.rx*wob,w.ry); }
    p.F(M.water[2]); c.beginPath(); c.ellipse(w.x,w.y,w.rx*wob+0.9,w.ry+0.6,0,0,PI*2); c.ellipse(w.x,w.y,w.rx*wob,w.ry,0,0,PI*2,true); c.fill('evenodd');
    p.F(M.water[1]); c.beginPath(); c.ellipse(w.x,w.y,w.rx*wob+1.4,w.ry+1,0,front?0.3:PI+0.6,front?1.4:PI+1.8); c.ellipse(w.x,w.y,w.rx*wob,w.ry,0,front?1.4:PI+1.8,front?0.3:PI+0.6,true); c.fill();
    if(front){ p.F(M.water[1]); p.rect(w.x-w.rx*0.5,w.y+w.ry*0.2,2,0.6); }
    c.restore();
  }
  // respingos (água) ou lama espirrando
  function drawSplash(p,M,f,P){
    const n=Math.round((P.splash||0)*4), m=Math.round((P.mud||0)*3), w=wakeOf(f,P);
    for(let q=0;q<n;q++){ const a=hsh(q+f.k*7,Math.floor(P.sp)), side=q%2?1:-1, x=w.x+side*(w.rx*0.5+a*w.rx*0.7), y=w.y-2-a*9*(P.splash>1?1.6:1)-((q*3)%5);
      p.F(M.water[q%3?1:0]); p.ell(x,y,1+a*0.6,1.3+a*0.8); if(q%2===0){ p.F(M.water[0]); p.rect(x-0.4,y-0.6,0.6,0.6); } }
    for(let q=0;q<m;q++){ const a=hsh(q+f.k*5+30,Math.floor(P.sp)), x=w.x-w.rx*0.9-a*8-q*3, y=(P.beach>=0.5?GROUND-2:w.y)-2-a*7;
      p.F(M.mud[q%2?1:2]); p.ell(x,y,1.4,1.1); p.F(M.mud[0]); p.rect(x-0.6,y-0.8,0.6,0.5); }
  }
  // lama sob as encalhadas
  function drawMudBed(p,M,P,fish){
    if(P.beach<0.5) return;
    fish.forEach(f=>{ p.F(M.mud[2]); p.ell(f.x,GROUND-1,20*f.s,3.4*f.s); p.F(M.mud[1]); p.ell(f.x-2,GROUND-1.6,15*f.s,2.2*f.s); p.F(M.mud[0]); p.rect(f.x-8*f.s,GROUND-3,4,0.8); });
  }
  function drawPool(p,M,P,fish){
    if(P.pool<=0.02) return;
    const x0=Math.min(...fish.map(f=>f.x)), x1=Math.max(...fish.map(f=>f.x)), cx=(x0+x1)/2, rx=((x1-x0)/2+18)*mn(1,P.pool+0.2), ry=7*P.pool+2;
    p.F(M.blood[2]); p.ell(cx,WL0-3,rx,ry);
    p.F(M.blood[1]); p.ell(cx-4,WL0-4,rx*0.78,ry*0.7);
    p.F(M.blood[0]); p.rect(cx-rx*0.5,WL0-5,6,0.8); p.rect(cx+rx*0.3,WL0-3,4,0.7);
  }
  function drawSmear(p,M,P,fish){
    const f=fish.find(q=>q.k===0); if(!f) return;
    const t=place(f,P), mxp=t.cx+18*f.s, my=t.cy;
    const pts=[]; for(let i=0;i<=8;i++){ const a=-1.2+2.4*i/8; pts.push([mxp+Math.cos(a)*10, my+Math.sin(a)*12]); }
    for(let i=8;i>=0;i--){ const a=-1.2+2.4*i/8; pts.push([mxp+Math.cos(a)*6-2, my+Math.sin(a)*8]); }
    p.F(M.swish[1]); p.poly(pts);
    p.F(M.swish[2]); p.poly(pts.slice(0,9).map(([x,y])=>[x+0.5,y]).concat(pts.slice(0,9).reverse().map(([x,y])=>[x-1.2,y])));
  }

  /* ---------- adereço: poça d'água preta (vista de cima, perspectiva baixa) ---------- */
  const PRX=140, PRY=34, PPW=PRX*2+20, PPH=PRY*2+18;
  function framePond(form,st,K){
    const M=mats(form), cx=PPW/2, cy=PPH/2;
    const edge=(rx,ry,amp,seed)=>{ const pts=[]; for(let i=0;i<40;i++){ const a=i/40*PI*2, w=1+amp*(S(a*3+seed)*0.6+S(a*7+seed*2)*0.4); pts.push([cx+C(a)*rx*w, cy+S(a)*ry*w]); } return pts; };
    const parts=[
      {noRim:true, draw:(c,u)=>{ const p=mkPen(c,u); p.id(); // barranco de lama
        p.F(M.mud[1]); p.poly(edge(PRX+6,PRY+5,0.05,1));
        p.F(M.mud[2]); p.poly(edge(PRX+3,PRY+3.4,0.05,1.4).map(([x,y])=>[x,y+1.4]));
        p.F(M.mud[0]); for(let q=0;q<9;q++){ const a=PI+0.3+q*0.3; p.rect(cx+C(a)*(PRX+3),cy+S(a)*(PRY+3.6),5,1); }
        p.F(M.mud[3]); for(let q=0;q<6;q++){ const a=0.4+q*0.42; p.rect(cx+C(a)*(PRX+2),cy+S(a)*(PRY+3),4,1); }
      }},
      {noRim:true, noShade:true, draw:(c,u)=>{ const p=mkPen(c,u); p.id(); // água preta
        const W=edge(PRX,PRY,0.05,1.4);
        p.F(M.pond[2]); p.poly(W);
        clipPoly(c,W,()=>{
          p.F(M.pond[3]); p.ell(cx+6,cy+4,PRX*0.7,PRY*0.55);
          p.F(M.pond[1]); p.poly([[cx-PRX,cy-PRY],[cx+PRX,cy-PRY],[cx+PRX,cy-PRY*0.55],[cx-PRX,cy-PRY*0.7]]); // reflexo do céu na borda de trás
          p.F(M.pond[0]); for(let q=0;q<7;q++){ const x=cx-PRX*0.8+q*PRX*0.26+((st+q)%4)*1.4, y=cy-PRY*0.4+(q%3)*PRY*0.34; p.rect(x,y,10+(q%3)*5,1); }
          // anéis de ondulação animados
          for(let q=0;q<3;q++){ const ph=((st+q*1.4)%4)/4, x=cx+[-60,30,80][q], y=cy+[4,-8,10][q], r=4+ph*14;
            p.F(M.water[ph<0.5?1:2]); c.beginPath(); c.ellipse(x,y,r+1,r*0.28+0.8,0,0,PI*2); c.ellipse(x,y,r,r*0.28,0,0,PI*2,true); c.fill('evenodd'); }
          // bolhas
          p.F(M.water[0]); [[-30,-4],[48,6],[-84,8],[10,12]].forEach(([x,y],q)=>{ if((st+q)%4<2) p.rect(cx+x,cy+y-((st+q)%2),1.4,1.2); });
        });
      }},
      {noRim:true, draw:(c,u)=>{ const p=mkPen(c,u); p.id(); // folhas boiando + galho
        [[-70,-10,0.4],[62,-12,-0.6],[90,8,1.2]].forEach(([x,y,a],q)=>{ p.xf(a,cx+x,cy+y+(st%2?0.4:0)); p.F(M.leaf[1]); p.ell(0,0,6,2.6); p.F(M.leaf[2]); p.rect(-6,-0.3,12,0.6); p.F(M.leaf[0]); p.rect(-3,-1.8,4,0.6); p.id(); });
        p.F(M.mud[2]); p.cap({x:cx+PRX-30,y:cy+PRY-6},{x:cx+PRX+4,y:cy+PRY-14},2.4,1.6); p.F(M.mud[1]); p.cap({x:cx+PRX-26,y:cy+PRY-7.4},{x:cx+PRX+2,y:cy+PRY-15},1,0.8);
      }},
    ];
    const cv=compose({FW:Math.round(PPW*K),FH:Math.round(PPH*K),GROUND:PPH*K,parts,M,step:5,flash:0,rim:null});
    cv._ax=cx*K; cv._gy=cy*K; cv._rx=PRX*K; cv._ry=PRY*K; return cv;
  }

  /* ---------- montagem ---------- */
  const cache=PIX.cache();
  function frame(form,anim,fi,step=5,Pov,pk){
    const K=PIX.getK(), key=(pk!=null?'#'+pk+'|'+form:form+'|'+anim+'|'+fi+'|'+step)+'@'+K;
    const hit=cache.get(key); if(hit){ cache.delete(key); cache.set(key,hit); return hit; }
    if(ANIMS[anim]&&ANIMS[anim].prop){ const st=Pov&&Pov.st!=null?Math.round(Pov.st):fi; const cv=framePond(form,st,K); cache.set(key,cv); return cv; }
    const P=Pov?Object.assign({},REST,Pov):poseOf(anim,fi), M=mats(form), fish=fishList(P,form), beach=P.beach>=0.5;
    const parts=[];
    if(beach) parts.push({noRim:true, draw:(c,u)=>{ const p=mkPen(c,u); p.id(); drawMudBed(p,M,P,fish); }});
    if(P.pool>0.02) parts.push({noRim:true, draw:(c,u)=>{ const p=mkPen(c,u); p.id(); drawPool(p,M,P,fish); }});
    fish.forEach(f=>{
      const clip=beach||f.sub<0.06?0:f.wl+0.4;
      parts.push({noRim:true, noShade:true, draw:(c,u)=>{ const p=mkPen(c,u); drawRipple(c,p,M,f,P,false); }});
      parts.push({back:f.dep<-6, draw:(c,u)=>{ const p=mkPen(c,u); withFish(c,p,f,P,()=>drawFins(p,c,M,f,form),clip); }});
      parts.push({draw:(c,u)=>{ const p=mkPen(c,u); withFish(c,p,f,P,()=>{ drawBody(p,c,M,f,form,f.k,P.glow); drawMouth(p,M,f,form); },clip); }});
      parts.push({draw:(c,u)=>{ const p=mkPen(c,u); withFish(c,p,f,P,()=>{ drawJaw(p,M,f,form); drawPectoral(p,M,f); },clip); }});
      parts.push({noRim:true, noShade:true, draw:(c,u)=>{ const p=mkPen(c,u); drawRipple(c,p,M,f,P,true); p.id(); drawSplash(p,M,f,P); }});
    });
    if(P.smear>=0.5) parts.push({noShade:true, smear:true, noRim:true, draw:(c,u)=>{ const p=mkPen(c,u); p.id(); drawSmear(p,M,P,fish); }});
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM[form]});
    const lead=fish.find(f=>f.k===0)||fish[0], t=place(lead,P), L=(x,y)=>{ const a=t.ang, ca=Math.cos(a), sa=Math.sin(a), lx=x*t.sx, ly=y*t.sy; return {x:(t.cx+lx*ca-ly*sa)*K, y:(t.cy+lx*sa+ly*ca)*K}; };
    cv._eye=L(10.6,-5.6); cv._mouth=L(16,1); cv._hand=L(17,2); cv._head=L(8,-6); cv._fish=fish.length;
    cache.set(key,cv); if(cache.size>900) cache.delete(cache.keys().next().value);
    return cv;
  }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,COUNT,SLOTS,mats,poseOf,frame,framePose:function(form,anim,P,key){ return frame(form,anim,0,5,P,key); }};
})();
