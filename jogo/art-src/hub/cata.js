/* CATA — fonte de arte (editável). Build: npm run art */
/* Catadora de recicláveis do Recife no padrão do HEROI (mesmo rig de RECRUTA_BASE): boné, camiseta desbotada,
   bermuda jeans desfiada, chinelo de dedo, luva de borracha, saco de ráfia cheio nas costas, gancho de bengala
   (vergalhão com fita). Contrato: frame(skin, anim, fi). */
const CATA=(function(){
  const {P2,lerp,lp}=PIX;
  const HOOKLEN=40;
  const gancho={nome:'Gancho de bengala',len:HOOKLEN,draw(p,M,b,ang,P){ const L=HOOKLEN; p.xf(ang,b.x,b.y);
    // pega com fita e câmara de pneu
    p.F(M.tape[1]); p.cap(P2(-7,0),P2(5,0),5.6,5.4); p.F(M.tape[2]); for(let x=-6;x<5;x+=2.2) p.poly([[x,-2.8],[x+1,-2.8],[x+0.2,2.8],[x-0.8,2.8]]); p.F(M.tape[0]); p.rect(-6,-2.4,10,0.8);
    p.F(M.red[1]); p.rect(-1,-2.9,2,5.8); p.F(M.red[0]); p.rect(-1,-2.9,2,1);
    // vergalhão nervurado
    p.F(M.rust[1]); p.cap(P2(5,0),P2(L-6,0),3.2,3); p.F(M.rust[2]); p.rect(5,0.6,L-11,1); p.F(M.rust[0]); p.rect(6,-1.2,L-14,0.6);
    p.F(M.rust[3]); for(let x=8;x<L-7;x+=2.6) p.poly([[x,-1.6],[x+0.8,-1.6],[x+0.2,1.6],[x-0.6,1.6]]);
    p.F(M.steel[1]); [[14,0],[24,0]].forEach(([x])=>p.rect(x,-1.4,2,1));
    // gancho na ponta (curva pra +y)
    p.F(M.rust[1]); p.cap(P2(L-6,0),P2(L-1,1.6),3,3); p.cap(P2(L-1,1.6),P2(L,6),3,2.8); p.cap(P2(L,6),P2(L-3.6,9),2.8,2.4); p.cap(P2(L-3.6,9),P2(L-6.4,7.6),2.4,1.6);
    p.F(M.rust[0]); p.rect(L-3,-1,2,0.8); p.F(M.rust[2]); p.rect(L-1.4,3,1,3);
    p.F(M.steel[0]); p.rect(L-7,7.2,1.2,1);
    if(P.can){ p.F(M.can[3]); p.poly([[L-12,3],[L,2],[L+0.8,15],[L-11.4,16]]); p.F(M.can[1]); p.poly([[L-11.2,3.6],[L-0.8,2.6],[L,14.2],[L-10.6,15.2]]); p.F(M.can[2]); p.poly([[L-11.2,3.6],[L-8.6,3.4],[L-8,15],[L-10.6,15.2]]); p.F(M.can[0]); p.rect(L-5.6,4,1.6,9); p.F(M.steel[1]); p.rect(L-11.6,2.2,11.6,1.8); p.rect(L-11,14,11.4,1.6); p.F(M.steel[0]); p.rect(L-9,2.2,5,0.8); p.F(M.print[1]); p.rect(L-8,7.4,6,2.4); }
    p.id(); }};
  const B=RECRUTA_BASE.make({
    f:1, rim:'#a9c8f0', trail:'#ffe0a0',
    skins:{media:{nome:'Pele média',hex:'#b47a4e'}, escura:{nome:'Pele escura',hex:'#7a4a2e'}, clara:{nome:'Pele clara',hex:'#e2ac84'}},
    body:{tsx:1.24,shF:-9.6,shB:9.2,wU:10.2,wE:8.8,wW:7,fist:1.28},
    comboName:'Combo de 3 ganchadas', strikes:{names:{atkH:'Ganchada lateral',atkV:'Ganchada por cima',atkS:'Fisgada (estocada)',atkSpin:'Giro do gancho',atkFin:'Puxão de baixo (lança)'}}, specialName:'Especial: fisgar sucata',
    sigs:[['sigFisgada','pullHook','Fisgada (puxa o zumbi)'],['sigRasteira','lowSweep','Rasteira de gancho'],['sigEstocadas','tripleJab','Cutucadas de vergalhão',{cd:6}]],
    top:'top', noBelt:true, leg:{style:'bermuda',hem:0.96,fray:1,pants:'pants',shoe:'chinelo',sole:'sole',strap:'strap'},
    arm:{style:'short',to:0.5,glove:'glove',gloveFrom:0.6,cuff:3.4},
    mats:()=>({
      top:'#3f8a74', print:['#ffe9a8','#f2c230','#a8801a','#5a420a'], pants:'#5d6f8e', cord:['#f0dca4','#c8b27a','#8e7a4e','#54482a'],
      glove:'#e8b830', sole:['#7aa8ff','#2f5fc8','#1e3c86','#0e1c40'], strap:['#ffffff','#e8e8f0','#a8a8b8','#5a5a6a'],
      cap:'#c8342e', capbrim:['#ff8a7a','#a8241e','#6a1410','#38080a'], hair:'#2a1a12', gold:['#fff0a0','#e3b23c','#9a7418','#4a380c'],
      bag:'#e4dcc4', bagblue:['#9ac0ff','#3a68b8','#244a86','#12264a'], bstrap:'#5a3c26',
      pet:['#d8fff0','#6cc8a0','#3a8a6a','#1e4a3a'], can:['#ff9a8a','#d83a2a','#8a1a14','#4a0a08'], card:'#b8864e',
      steel:['#f4f8fc','#a8b0ba','#6e7682','#3e4450'], rust:['#d08a5a','#9a5428','#62321a','#32180a'], tape:['#5a5a64','#202026','#121216','#060608'], red:['#ff8a7a','#d03a2a','#7a1e18','#40100c'],
    }),
    pattern:(p,M)=>{ // estampa desbotada de bloco de carnaval no peito
      p.F(M.print[2]); p.ell(4.6,-19,4.6,4.2); p.F(M.print[1]); p.ell(4.6,-19.4,3.8,3.4); p.F(M.top[1]); p.ell(4.6,-19.4,2,1.8); p.F(M.print[0]); p.rect(2.4,-22.4,2.6,0.8);
      p.F(M.topX[1]); [[-4,-10],[6,-8],[-2,-24]].forEach(([x,y])=>p.ell(x,y,2.4,1.2)); },
    torso:(p,M,sk,P)=>{ // alça do saco atravessada + barbante na cintura
      const S=M.bstrap, SX=M.bstrapX;
      p.F(S[1]); p.poly([[-9.6,-28.6],[-5.6,-30],[10.6,-6],[7.4,-4.2]]); p.F(SX[2]); p.poly([[-9.6,-28.6],[-8,-29.2],[8.8,-5.2],[7.4,-4.2]]); p.F(S[0]); p.poly([[-5.6,-30],[-4.6,-29.2],[10.6,-6.6],[10.6,-6]]);
      p.F(S[2]); [[-4,-25],[0,-19],[4,-13]].forEach(([x,y])=>p.rect(x,y,1.2,0.8));
      p.F(M.cord[1]); p.poly([[-10.8,-2.4],[10.4,-2.4],[10.6,-0.4],[-11,-0.4]]); p.F(M.cord[2]); for(let x=-10;x<10;x+=2) p.rect(x,-2.4,0.8,2); p.F(M.cord[1]); p.cap(P2(5,-1),P2(6.6,4),1,1); p.cap(P2(5,-1),P2(3.4,4.4),1,1); },
    behind:(p,M,sk,P,{torsoXf})=>{ // saco de ráfia nas costas com recicláveis
      torsoXf(p,sk); const b=Math.round((P.br||0)*0.6), R=M.bag, X=M.bagX;
      p.F(M.pet[2]); p.cap(P2(-10,-46+b),P2(-8,-34+b),5,5.6); p.F(M.pet[1]); p.cap(P2(-9.4,-45+b),P2(-7.6,-35+b),3.6,4); p.F(M.pet[0]); p.rect(-9.6,-43+b,1,6); p.F(M.bagblue[1]); p.rect(-11.4,-49.4+b,3.6,2.6);
      p.F(M.card[2]); p.poly([[-18,-42+b],[-11,-46+b],[-9.6,-35+b],[-16.6,-33+b]]); p.F(M.card[1]); p.poly([[-17,-41.4+b],[-12,-44.6+b],[-11,-36+b],[-16,-34.4+b]]); p.F(M.card[0]); p.rect(-15.4,-41+b,3,0.8);
      p.F(M.can[2]); p.poly([[-4,-42+b],[1.6,-43+b],[2,-34+b],[-3.6,-33.4+b]]); p.F(M.can[1]); p.poly([[-3.4,-41.6+b],[0.6,-42.4+b],[1,-34.6+b],[-3,-34+b]]); p.F(M.steel[0]); p.rect(-4,-43+b,5.8,1.2); p.F(M.can[0]); p.rect(-2.6,-40+b,1,5);
      p.F(R[3]); p.poly([[-20.4,-38+b],[1,-39.6+b],[3.4,-26+b],[3,-10+b],[-3,-3.4+b],[-17,-4.4+b],[-22,-13+b],[-22,-28+b]]);
      p.F(R[1]); p.poly([[-19.6,-37.4+b],[0.4,-39+b],[2.6,-26+b],[2.2,-10.6+b],[-3.4,-4.4+b],[-16.6,-5.2+b],[-21.2,-13.4+b],[-21.2,-28+b]]);
      p.F(X[2]); p.poly([[-19.6,-37.4+b],[-13,-37.8+b],[-13,-5+b],[-16.6,-5.2+b],[-21.2,-13.4+b],[-21.2,-28+b]]); p.F(R[2]); p.poly([[-19.6,-37.4+b],[-17,-37.6+b],[-17.4,-5.2+b],[-21.2,-13.4+b],[-21.2,-28+b]]);
      p.F(X[1]); p.poly([[-7,-38.4+b],[0.4,-39+b],[2,-28+b],[-5,-27+b]]); p.F(R[0]); p.poly([[-4,-38+b],[0,-38.4+b],[1,-31+b],[-3,-30.6+b]]);
      p.F(R[2]); for(let y=-34;y<-6;y+=3) p.rect(-20,y+b,22,0.7); p.F(X[2]); for(let x=-18;x<1;x+=3) p.rect(x,-37+b,0.7,31);
      p.F(M.bagblue[1]); p.poly([[-21.4,-22+b],[2.4,-23.4+b],[2.4,-19.4+b],[-21.4,-18+b]]); p.F(M.bagblue[0]); p.rect(-7,-23+b,8,0.8); p.F(M.bagblue[2]); p.rect(-21.4,-22+b,6,4);
      p.F(R[3]); p.poly([[-15,-12+b],[-9,-14+b],[-8,-12+b],[-14,-10+b]]); p.F(M.cord[1]); p.ell(-19.6,-37.6+b,2.6,1.8); p.cap(P2(-20,-37+b),P2(-23,-31+b),1.2,1);
      p.id(); },
    head:{brow:1.4,
      back:(p,M,P)=>{ const t=(P.flash?-3:0)+(P.mouth===2?-1.6:0); p.F(M.hair[1]); p.cap(P2(-8,-17),P2(-14+t,-8),5.6,4.8); p.cap(P2(-14+t,-8),P2(-15+t*1.4,0),4.8,2.4); p.F(M.hair[2]); p.cap(P2(-11,-12),P2(-14.6+t,-1),2.2,1.4); p.F(M.hair[0]); p.cap(P2(-10,-16),P2(-13+t,-10),1.4,1); },
      hair:(p,M)=>{ p.F(M.hair[1]); p.poly([[-8,-17.6],[-1.4,-17.6],[-0.4,-12],[-1.2,-9.6],[-5,-8.6],[-8,-12]]); p.poly([[2.6,-19.4],[7,-19.4],[6,-16.4],[3.4,-17]]); p.F(M.hair[0]); p.rect(-6,-15.6,2,0.8);
        p.F(M.gold[1]); p.ell(-3.2,-8,1.8,1.8); p.F(M.skin[2]); p.ell(-3.2,-8,0.8,0.8); p.F(M.gold[0]); p.rect(-4.4,-9.2,1,0.8); },
      hat:(p,M,P,{dome})=>{ const R=M.cap, X=M.capX; // boné com aba pra frente
        p.F(R[3]); p.poly(dome(2.4,-17.4,11.8,10.6,0,180,16).concat([[-9.6,-16.6]]));
        p.F(R[1]); p.poly(dome(2.4,-17.8,11.2,10,0,180,16));
        p.F(X[2]); p.poly(dome(2.4,-17.8,11.2,10,115,180,8).concat([[-3,-17.8]])); p.F(R[2]); p.poly(dome(2.4,-17.8,11.2,10,145,180,6).concat([[-6.4,-17.8]]));
        p.F(X[1]); p.poly([[2,-27.6],[8,-26.4],[12,-21.6],[12.8,-18],[6,-18.6],[3,-23]]); p.F(R[0]); p.poly([[3.6,-27.2],[7.6,-26],[10,-22.6],[5.6,-23.4]]);
        p.F(R[2]); p.rect(1.8,-27.8,0.9,10); p.F(R[0]); p.ell(2.2,-28,1.6,0.9);
        p.F(M.print[1]); p.rect(5.4,-24.4,4.6,3); p.F(M.print[3]); p.rect(6.2,-23.6,3,1.4);
        p.F(M.capbrim[1]); p.poly([[8,-18.6],[22,-17.4],[21,-14.8],[8.6,-16]]); p.F(M.capbrim[0]); p.rect(10,-18.2,10,0.9); p.F(M.capbrim[3]); p.poly([[8.6,-16],[21,-14.8],[20.2,-14],[9,-15.2]]); }},
    tools:{gancho}, toolFor:()=> 'gancho',
    anims:(A,{K_,G,S,th,sh})=>{
      // parada apoiada no gancho como bengala (ponta no chão, à frente)
      A.idle.nome='Parada (gancho de bengala)';
      A.idle.pose=i=>{ const p=i/8*Math.PI*2, s=S(p);
        return K_({lean:6+1.2*s,br:s,hx:1*S(p/2),head:1.4*S(p-0.7),lFh:24,lFk:4+2*s,lBh:-22,lBk:-24+2*s,aFs:58+1.5*s,aFe:64+1.5*s,bA:14+1*s,aBs:-6+2*s,aBe:30+3*s,backTarget:[11,-3+0.6*s],blink:i===5?1:0}); };
      A.walk.pose=i=>{ const p=i/8*Math.PI*2, c=Math.cos(p);
        return K_({plant:0,lFh:th(p,0),lFk:sh(p,0),lBh:th(p,Math.PI),lBk:sh(p,Math.PI),lean:6+1.4*S(2*p),head:S(2*p-0.6),aFs:40+14*S(p),aFe:46+10*S(p),bA:16+14*S(p),aBs:-6+20*S(p+Math.PI),aBe:10+22*S(p+Math.PI)}); };
    },
    special:({G})=>({n:8,hits:{2:1,5:2},dur:i=>[170,120,90,150,120,90,170,220][i],pose:i=>G([
      {aFs:-40,aFe:-10,bA:150,lean:-6,brow:2,mouth:1,lFh:30,lBh:-24,lBk:-34},
      {aFs:80,aFe:92,bA:96,lean:24,hx:10,brow:1,mouth:2,smear:1,sa:200,lFh:50,lFk:10,lBh:-32,lBk:-36},
      {aFs:90,aFe:96,bA:92,lean:28,hx:13,brow:1,mouth:2,can:1,impact:1,lFh:54,lFk:12,lBh:-32,lBk:-36},
      {aFs:40,aFe:120,bA:140,lean:-4,hx:4,brow:1,mouth:3,can:1,lFh:30,lBh:-24,lBk:-34},
      {aFs:160,aFe:196,bA:230,lean:-14,hx:2,brow:1,mouth:1,can:1,lFh:30,lBh:-22,lBk:-30},
      {aFs:150,aFe:170,bA:160,lean:-10,hx:2,mouth:3,brow:3,toss:1,smear:2,sa:240,lFh:30,lBh:-22,lBk:-30},
      {aFs:40,aFe:80,bA:110,lean:4,mouth:3,brow:3,toss:2,lFh:30,lBh:-22,lBk:-30},
      {aFs:30,aFe:76,bA:110,lean:4,mouth:3,brow:3,lFh:30,lBh:-22,lBk:-30}][i])}),
    fx:(p,M,sk,P)=>{ if(!P.toss) return; const c=sk.T(P.toss>=2?-18:-8,P.toss>=2?-58:-62); p.F(M.can[3]); p.poly([[c.x-5,c.y-6],[c.x+5,c.y-6.8],[c.x+5.6,c.y+5],[c.x-4.4,c.y+5.8]]); p.F(M.can[1]); p.poly([[c.x-4.4,c.y-5.4],[c.x+4.4,c.y-6.2],[c.x+5,c.y+4.4],[c.x-3.8,c.y+5.2]]); p.F(M.can[0]); p.rect(c.x+1,c.y-4,1.4,7); p.F(M.steel[0]); p.rect(c.x-4.6,c.y-7,9.4,1.6); p.F(M.smear[0]); p.rect(c.x+5,c.y-2,3,1); p.rect(c.x+4,c.y+2,2,1); },
    anchors:(cv,sk,sc)=>{ cv._bag=sc(sk.T(-15,-36)); },
    FX:{special:{hits:[2,5],word:'FISGOU!'}, combo:{words:['TOC!','TOC!','PAH!']}},
    NAMES:{skin:'Pele',hair:'Cabelo',cap:'Boné',top:'Camiseta desbotada',pants:'Bermuda jeans',glove:'Luva de borracha',sole:'Chinelo',bag:'Saco de ráfia',rust:'Vergalhão'},
  });
  // contrato da catadora: frame(skin, anim, fi[, step]) — sem parâmetro de ferramenta
  return Object.assign({},B,{HOOKLEN,frame:(skin,anim,fi,step=5)=>B.frame(skin,null,anim,fi,step)});
})();
