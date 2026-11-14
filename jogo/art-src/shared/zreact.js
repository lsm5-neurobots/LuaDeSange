/* ZREACT — fonte de arte (editável). Build: npm run art */
/* Reações físicas e golpes extras dos zumbis comuns, escritos como DESVIO da pose de descanso (REST) de cada
   rig — assim o mesmo molde serve pro Errante, Corredor, Gritador, Saltador... e respeita a anatomia de cada um
   (só mexe nas juntas que o rig tem). Usado pelo motor (src/expedition/ai/index.ts e moveset.ts):
     tumble  = voando (lançado/arremessado), em loop, girando no ar
     grabbed = agarrado pela gola, pés balançando, unhando o lutador
     swipe/flop/flip/lunge = moldes de golpe (hit = quadro do dano, reach = alcance, z = altura por quadro) */
const ZREACT=(function(){
  const T={
    tumble:{n:4,dur:()=>70,loop:1,f:[
      {flash:1,lean:-24,hunch:-14,head:22,jaw:16,aFs:120,aFe:130,aBs:100,aBe:120,lFh:30,lFk:40,lBh:-10,lBk:-10},
      {lean:-30,hunch:-18,head:26,jaw:20,aFs:150,aFe:170,aBs:130,aBe:150,lFh:10,lFk:10,lBh:30,lBk:40},
      {lean:-26,hunch:-16,head:20,jaw:12,aFs:100,aFe:140,aBs:160,aBe:170,lFh:40,lFk:20,lBh:10,lBk:30},
      {lean:-22,hunch:-12,head:24,jaw:18,aFs:140,aFe:120,aBs:110,aBe:150,lFh:20,lFk:40,lBh:30,lBk:10}]},
    grabbed:{n:4,dur:()=>110,loop:1,f:[
      {lean:-10,hunch:-8,head:10,jaw:16,aFs:60,aFe:70,aBs:40,aBe:60,lFh:-6,lFk:-2,lBh:8,lBk:10},
      {lean:-14,hunch:-10,head:14,jaw:6,aFs:80,aFe:50,aBs:70,aBe:90,lFh:6,lFk:10,lBh:-4,lBk:0},
      {lean:-12,hunch:-8,head:6,jaw:22,aFs:50,aFe:90,aBs:60,aBe:40,lFh:-4,lFk:4,lBh:10,lBk:14},
      {lean:-16,hunch:-12,head:16,jaw:10,aFs:90,aFe:60,aBs:50,aBe:80,lFh:8,lFk:12,lBh:-2,lBk:4}]},
    // tapa de revés: arma o braço lá atrás e varre em diagonal
    swipe:{n:7,hit:3,reach:38,dur:i=>[150,140,50,90,130,130,140][i],f:[
      {lean:-8,hunch:-6,head:8,jaw:10,aFs:100,aFe:140,aBs:-10,hx:-3},
      {lean:-14,hunch:-8,head:12,jaw:18,aFs:150,aFe:170,aBs:-20,aBe:-10,hx:-4},
      {lean:18,hunch:6,head:-6,jaw:22,aFs:60,aFe:40,smear:1,hx:6,lFh:8,lBh:-6},
      {lean:26,hunch:10,head:-10,jaw:24,aFs:20,aFe:-10,smear:1,hx:10,lFh:12,lBh:-10},
      {lean:24,hunch:10,head:-8,jaw:12,aFs:-20,aFe:-30,hx:10,lFh:12,lBh:-10},
      {lean:10,hunch:4,jaw:6,hx:4},
      {}]},
    // peixinho / barrigada voadora: pula e cai de cara em cima do lutador (área), levanta devagar
    flop:{n:8,hit:5,reach:40,z:[0,6,18,14,6,0,0,0],dur:i=>[180,90,90,80,70,60,260,200][i],f:[
      {lean:10,hunch:6,head:-4,jaw:10,lFh:20,lFk:-20,lBh:10,lBk:-20,aFs:-20,aBs:-20,hx:-2},
      {lean:-10,head:10,jaw:24,aFs:140,aFe:150,aBs:140,aBe:150,lFh:-10,lFk:-10,lBh:-10,lBk:-10},
      {rot:30,lean:20,jaw:30,aFs:160,aFe:170,aBs:160,aBe:170,lFh:-20,lBh:-30},
      {rot:60,lean:10,jaw:30,aFs:100,aFe:110,aBs:100,aBe:110,lFh:-26,lBh:-36},
      {rot:80,jaw:30,aFs:80,aFe:80,aBs:80,aBe:80,lFh:-30,lBh:-40,hx:6},
      {rot:88,jaw:40,flash:1,aFs:70,aFe:60,aBs:70,aBe:60,lFh:-30,lBh:-40,hx:8},
      {rot:40,lean:30,hunch:10,jaw:20,aFs:20,aFe:10,aBs:20,aBe:10,lFh:30,lFk:-20,hx:6},
      {}]},
    // mortal pra trás com chute: as pernas de mola passam por cima e descem no alvo
    flip:{n:8,hit:4,reach:42,z:[0,10,26,30,20,6,0,0],dur:i=>[170,80,70,60,70,90,160,160][i],f:[
      {lean:12,hunch:8,head:-6,jaw:8,aFs:-20,aBs:-20},
      {rot:-60,lean:-6,head:10,jaw:16,aFs:80,aBs:80},
      {rot:-140,head:10,jaw:20,aFs:120,aBs:120,lFh:20,lBh:20},
      {rot:-220,head:8,jaw:24,aFs:120,aBs:120,lFh:30,lBh:30,smear:1},
      {rot:-300,head:4,jaw:28,aFs:60,aBs:60,lFh:10,lBh:10,smear:1},
      {rot:-350,lean:10,jaw:16,aFs:20,aBs:20},
      {lean:16,hunch:10,jaw:10},
      {}]},
    // bote de mordida: recua o pescoço e estica tudo pra frente
    lunge:{n:7,hit:3,reach:36,dur:i=>[160,150,50,140,130,130,140][i],f:[
      {lean:-10,head:10,jaw:20,hx:-2},
      {lean:-16,head:14,jaw:30,hx:-4,aFs:20,aBs:20},
      {lean:30,hunch:14,head:-14,jaw:34,hx:8,aFs:60,aFe:50,aBs:50,aBe:40,smear:1,lFh:10,lBh:-10},
      {lean:34,hunch:16,head:-18,jaw:0,hx:10,aFs:70,aFe:40,aBs:60,aBe:30,lFh:12,lBh:-12},
      {lean:28,hunch:12,head:-12,jaw:10,hx:8,aFs:40,aBs:30},
      {lean:10,hunch:4,jaw:8,hx:3},
      {}]},
  };
  const ABS={flash:1,smear:1};
  function pose(REST,d){ const o={}; for(const k in d){ if(!(k in REST)) continue; o[k]=ABS[k]?d[k]:REST[k]+d[k]; } return o; }
  // add(ANIMS, REST, {tumble:1, grabbed:1, moves:{nomeDaAnim:['molde','Nome',{extras}]}})
  function add(ANIMS,REST,o){
    o=o||{}; const mk=(id,nome,ex)=>{ const t=T[id]; const a=Object.assign({nome,n:t.n,dur:t.dur,pose:i=>pose(REST,t.f[i])},t.hit!=null?{hit:t.hit,reach:t.reach}:{},t.z?{z:t.z}:{},ex||{}); return a; };
    if(o.tumble!==false) ANIMS.tumble=mk('tumble','Voando (lançado)');
    if(o.grabbed!==false) ANIMS.grabbed=mk('grabbed','Agarrado (esperneia)');
    Object.entries(o.moves||{}).forEach(([k,[id,nome,ex]])=>{ if(!ANIMS[k]) ANIMS[k]=mk(id,nome,ex); });
    return ANIMS;
  }
  return {add,T};
})();
