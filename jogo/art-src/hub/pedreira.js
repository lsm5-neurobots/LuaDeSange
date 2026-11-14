/* PEDREIRA — fonte de arte (editável). Build: npm run art */
/* Mestre de obras no padrão do HEROI: capacete amarelo, colete laranja refletivo sobre regata mescla, braços
   fortes, luva pigmentada, joelheira, botina; picareta de duas mãos e talhadeira na bolsa de ferramentas. */
const PEDREIRA=(function(){
  const {P2,lerp,lp}=PIX;
  const picareta={nome:'Picareta',len:28,twoHand:true,grip2:9,draw(p,M,b,ang){ p.xf(ang,b.x,b.y);
    p.F(M.wood[1]); p.cap(P2(-7,0),P2(27,0),4.8,4.4);
    p.F(M.woodX[2]); p.poly([[-6,0.2],[27,0.1],[27,2.2],[-6,2.4]]); p.F(M.wood[2]); p.poly([[-6,1.1],[27,0.9],[27,2.2],[-6,2.4]]); p.F(M.wood[3]); p.rect(-6,1.8,33,0.6);
    p.F(M.wood[0]); p.rect(5,-1.8,19,0.8); p.F(M.woodX[0]); p.rect(12,-1.8,5,0.7); p.F(M.wood[2]); [8,16,21].forEach(x=>p.rect(x,-0.6,2.4,0.6));
    p.F(M.vest[1]); p.cap(P2(-6.4,0),P2(4,0),5.6,5.6); p.F(M.vest[2]); for(let x=-5;x<4;x+=2.4) p.rect(x,-2.8,1,5.6); p.F(M.vest[0]); p.rect(-5.6,-2.4,9,0.8);
    // cabeça curva: ponta (+y) e pá (-y)
    p.F(M.steel[3]); p.poly([[24,-4],[31,-4],[32.4,-8],[35,-14.6],[33,-15.4],[29.6,-10],[30.6,-4.6],[31,4],[33.6,9],[36.6,15.6],[34.4,16],[29,9],[24,4]]);
    p.F(M.steel[1]); p.poly([[24.6,-3.4],[30.4,-3.4],[31.6,-8],[34.2,-14],[33.2,-14.4],[29.6,-9.4],[29.8,-3.4],[30,3.4],[32.8,8.6],[35.6,15],[34.6,15.2],[29.4,8.4],[24.6,3.4]]);
    p.F(M.steelX[2]); p.poly([[24.6,0.8],[30,0.8],[30.4,3.4],[24.6,3.4]]); p.poly([[30,3.4],[31,3.4],[34.6,12],[33.4,12.4]]);
    p.F(M.steel[0]); p.poly([[25,-3.4],[29.6,-3.4],[29.2,-2.2],[25,-2.2]]); p.poly([[30.8,-6],[33.6,-13.6],[34.2,-14],[31.6,-6]]); p.F(M.steelX[0]); p.rect(31.6,-10,1,1.2);
    p.F(M.steel[2]); p.rect(27,-4,0.9,8); p.F(M.rust[1]); p.rect(25.6,1.6,1.6,1.2); p.rect(32,9,1.2,1.2);
    p.id(); }};
  const talhadeira={nome:'Talhadeira',len:16,draw(p,M,b,ang){ p.xf(ang,b.x,b.y);
    p.F(M.steel[1]); p.cap(P2(-4,0),P2(14,0),3.4,3); p.F(M.steel[2]); p.rect(-4,0.6,18,1); p.F(M.steel[0]); p.rect(-3,-1.2,15,0.6);
    p.F(M.steel[3]); p.poly([[14,-1.6],[17,-0.6],[17,0.6],[14,1.6]]); p.F(M.steel[0]); p.rect(-4.6,-1.8,1.6,3.6); p.id(); }};
  function rocks(p,M,c,lv){ const pts=[[-14,-6,3],[-8,-12,2.4],[-3,-16,2],[5,-14,2.6],[11,-9,3],[16,-4,2.2],[0,-6,3.4]];
    pts.forEach(([dx,dy,r],k)=>{ const s=lv>=2?1.9:1.35; const q={x:c.x+dx*s,y:c.y+dy*s}; r*=1.4; p.F(M.rubble[3]); p.ell(q.x,q.y+0.6,r+0.6,r); p.F(M.rubble[1]); p.ell(q.x,q.y,r,r-0.6); p.F(M.rubble[0]); p.rect(q.x-r*0.5,q.y-r*0.5,1.2,1); });
    p.F(M.mortar[0]); [[-18,-2],[18,-1],[-10,-3],[10,-2]].forEach(([dx,dy])=>p.ell(c.x+dx*(lv>=2?1.3:1),c.y+dy,4,1.6)); }
  return RECRUTA_BASE.make({
    f:1, rim:'#a9c8f0', trail:'#ffd27a', twoGuard:true,
    body:{tsx:1.34,shF:-11.4,shB:10.8,wU:12.2,wE:10.6,wW:8,fist:1.42,wT:16.6,wK:12.6,wA:9.4,neck:7.6},
    comboName:'Combo de picareta', strikes:{names:{atkH:'Picaretada lateral',atkV:'Picaretada por cima',atkS:'Espetada com a ponta',atkSpin:'Giro da picareta',atkFin:'Picaretada de baixo (lança)'}}, specialName:'Especial: picaretada sísmica',
    sigs:[['sigOnda','groundSlam','Pilão no chão (onda de choque)',{v:'wave'}],['sigGancho','pullHook','Gancho de picareta (puxa)']],
    top:'top', leg:{pants:'pants',boot:'boot',sole:'sole',lace:'lace',pocket:1,
      extra:(p,M,hip,knee,ankle,front)=>{ if(!front) return; p.F(M.knee[3]); p.ell(knee.x+1.4,knee.y+0.4,6,5.6); p.F(M.knee[1]); p.ell(knee.x+1.2,knee.y,5.4,5); p.F(M.kneeX[2]); p.ell(knee.x,knee.y+1.4,4,3); p.F(M.knee[0]); p.ell(knee.x+2.4,knee.y-2,2.4,1.4); p.F(M.vest[1]); p.rect(knee.x-4.6,knee.y-0.6,9.6,1.2);
        p.F(M.mortar[1]); const c=lerp(knee,ankle,0.6); p.rect(c.x+1,c.y,1.6,1.2); p.rect(c.x-3,c.y+3,1.2,1.2); }},
    arm:{style:'short',to:0.3,glove:'glove',gloveFrom:0.68,cuff:2.4,
      extra:(p,M,sh,el,wr,front)=>{ const g=lerp(el,wr,0.86); p.F(M.dots[1]); [[0,-1.6],[1.6,0.6],[-1.4,1]].forEach(([x,y])=>p.rect(g.x+x,g.y+y,1,1)); }},
    mats:()=>({
      top:'#a8a49a', pants:'#3e5c88', vest:'#ee8a22', refl:['#ffffff','#e4e8ec','#9aa0a8','#5a6068'],
      knee:'#3a3a44', glove:'#e6e0d0', dots:['#ff9a5a','#e0702a','#a04a14','#5a2808'], boot:'#a8743e', sole:['#6a5a4a','#3a2e22','#241c14','#120e0a'], lace:['#efe2c0','#c8b07a','#8a7448','#4a3c22'],
      helmet:'#f2b21c', hair:'#3a2418', elastic:['#ff8a8a','#d83a44','#8a1e26','#4a0a10'], gold:['#fff0a0','#e3b23c','#9a7418','#4a380c'],
      steel:['#f4f8fc','#a4acb8','#646c7a','#363c48'], steelX:['#ffffff','#c8d0dc','#6a6478','#16141e'], wood:'#a87440', rust:['#d08a5a','#9a5a30','#6a3a1c','#3a1e0c'],
      mortar:['#efe8d8','#cfc6b4','#a09886','#6a6252'], pouch:'#6a4a2e', pencil:['#ffe27a','#f2c230','#b08a14','#6a520a'], flag:['#4ac860','#2a9a3e','#ffd23f','#2a4ab8'],
      rubble:['#d8ccb8','#9a8e7c','#6a6052','#342e28'],
    }),
    head:{brow:1.6,
      back:(p,M,P)=>{ // rabo de cavalo saindo do capacete
        const sw=(P.mouth===2?-2:0)+(P.flash?-3:0)+Math.sin((P.lean||0)*0.2)*1.4;
        p.F(M.hair[1]); p.cap(P2(-8,-16),P2(-13+sw*0.4,-6),6,5.2); p.cap(P2(-13+sw*0.4,-6),P2(-15+sw,3),5.2,3);
        p.F(M.hair[2]); p.cap(P2(-10,-12),P2(-14+sw,2),2.4,1.6); p.F(M.hair[0]); p.cap(P2(-10.4,-15),P2(-13+sw*0.4,-8),1.4,1);
        p.F(M.elastic[1]); p.ell(-10,-13.4,2.4,1.8); p.F(M.elastic[0]); p.rect(-10.6,-14.4,1.4,0.8); },
      hair:(p,M,P)=>{ p.F(M.hair[1]); p.poly([[-0.6,-16],[1.4,-16],[1.2,-10.6],[-0.8,-10.2]]); p.poly([[3,-19.6],[12,-19.6],[11,-17.6],[4,-17.8]]);
        p.F(M.gold[1]); p.ell(-3.2,-8.4,1.2,1.2); p.F(M.gold[0]); p.rect(-3.6,-8.8,0.8,0.6);
        p.F(M.pencil[1]); p.poly([[-6.8,-17.4],[-5.6,-17.8],[-3.6,-10.6],[-4.8,-10.2]]); p.F(M.pencil[2]); p.rect(-4.6,-11,1,1); p.F(M.mortar[2]); p.ell(1,-11,1.6,1); },
      hat:(p,M,P,{dome})=>{ const R=M.helmet, X=M.helmetX;
        p.F(R[3]); p.poly(dome(2.4,-18.6,12.4,12,0,180,16).concat([[-10.4,-17.6],[14.6,-17.6]]));
        p.F(R[1]); p.poly(dome(2.4,-19,11.8,11.6,0,180,16));
        p.F(X[2]); p.poly(dome(2.4,-19,11.8,11.6,110,180,8).concat([[-4,-19]])); p.F(R[2]); p.poly(dome(2.4,-19,11.8,11.6,140,180,6).concat([[-7,-19]]));
        p.F(X[1]); p.poly([[1,-29.6],[8,-28.6],[12.6,-23],[13.4,-19.6],[7,-19.6],[3,-25]]); p.F(R[0]); p.poly([[3,-29.6],[7.4,-28.6],[10.4,-25],[6,-25.6]]); p.F(X[0]); p.rect(5,-29.2,2.6,1);
        p.F(R[2]); p.rect(0.6,-30.6,2.6,11.6); p.F(X[1]); p.rect(1.2,-30.4,0.8,11); // nervura
        p.F(R[1]); p.poly([[-12,-19.4],[15,-19.4],[22,-18],[21,-16],[14,-16.8],[-12,-16.8]]); p.F(R[0]); p.rect(-11,-19.4,30,0.9); p.F(R[3]); p.poly([[-12,-17.4],[21,-16.6],[21,-15.8],[-12,-16.4]]);
        p.F(M.flag[0]); p.rect(6.4,-25.4,4.4,3.6); p.F(M.flag[2]); p.poly([[8.6,-25],[10.4,-23.6],[8.6,-22.2],[6.8,-23.6]]); p.F(M.flag[3]); p.rect(8,-24.2,1.2,1.2);
        p.F(M.mortar[1]); p.rect(-6,-24,1.6,1.2); p.rect(10,-27,1.2,1); }},
    torso:(p,M,sk,P,{f})=>{ // colete refletivo aberto, bolsa de ferramentas com talhadeira
      const V=M.vest, VX=M.vestX;
      const L=[[-10.4,-1],[-2.4,-1],[-2,-26],[-5.2,-30.4],[-8.8,-28.2],[-10.6,-24],[-9.8,-19],[-8,-13],[-8.4,-8]];
      const Rr=[[3.4,-1],[9.6,-1],[9.8,-3],[8,-9],[8.6,-13.4],[10.8,-18],[11,-23],[9.4,-27.6],[5.6,-29.6],[3.4,-24]];
      p.F(V[1]); p.poly(L); p.poly(Rr);
      p.F(VX[2]); p.poly([[-10.4,-1],[-6,-1],[-6,-28],[-8.8,-28.2],[-10.6,-24],[-9.8,-19],[-8,-13],[-8.4,-8]]); p.F(V[2]); p.poly([[-10.4,-1],[-8,-1],[-8.4,-27.6],[-10.6,-24],[-9.8,-19],[-8,-13],[-8.4,-8]]);
      p.F(VX[1]); p.poly([[5,-28.6],[9.4,-27.6],[11,-23],[10.6,-18.6],[5,-18]]); p.F(V[0]); p.poly([[6,-28],[9,-27],[10.2,-23],[6.6,-23.4]]);
      p.F(V[3]); p.rect(-2.8,-26,0.9,25); p.rect(3.4,-24,0.9,23);
      [-18,-9].forEach(y=>{ p.F(M.refl[1]); p.rect(-10.4,y,8,2.6); p.rect(3.4,y,7.2,2.6); p.F(M.refl[0]); p.rect(4,y,5,0.8); p.F(M.refl[2]); p.rect(-10.4,y,3.4,2.6); p.F(M.refl[3]); p.rect(-10.4,y+2.6,8,0.6); p.rect(3.4,y+2.6,7.2,0.6); });
      p.F(V[2]); p.rect(5,-25.4,4.4,4); p.F(VX[1]); p.rect(5,-25.4,4.4,1); p.F(M.pencil[1]); p.rect(5.6,-28,1,3); p.F(M.refl[2]); p.rect(7.6,-27.2,1.4,2.2);
      p.F(M.mortar[1]); [[-7,-23],[6,-12],[-4,-5],[8,-4],[0,-15]].forEach(([x,y])=>p.rect(x,y,1.2,1.2));
      // bolsa na cintura
      const PO=M.pouch, PX=M.pouchX; p.F(PO[3]); p.rect(-11.6,-2.4,7.4,9); p.F(PO[1]); p.rect(-11.2,-2,6.6,8.2); p.F(PX[2]); p.rect(-11.2,-2,2.6,8.2); p.F(PO[0]); p.rect(-11.2,-2,6.6,1.2);
      p.F(M.steel[1]); p.poly([[-9.4,-2],[-7.8,-2],[-7.4,-9],[-9,-9]]); p.F(M.steel[0]); p.rect(-9.6,-9.8,2.4,1); p.F(M.wood[1]); p.poly([[-7,-2],[-5.6,-2],[-4.6,-7],[-6,-7.2]]); },
    behind:(p,M,sk,P)=>{ if(P.inhand) return; },
    tools:{picareta,talhadeira}, toolFor:()=> 'picareta',
    anims:(A,{K_,G,S,th,sh})=>{
      // parada de mão na cintura, picareta pendurada
      A.idle.pose=i=>{ const p=i/8*Math.PI*2, s=S(p);
        return K_({lean:3+1.4*s,br:s,hx:1.2*S(p/2),head:1.2*S(p-0.7)-2,lFh:28,lFk:4+2.2*s,lBh:-24,lBk:-26+2.2*s,aFs:12+2*s,aFe:28+3*s,bA:12+2*s,backTarget:[12,-4+0.6*s],blink:i===5?1:0,brow:0}); };
    },
    special:({G})=>({n:8,hits:{3:1,6:2},dur:i=>[160,110,90,80,170,110,80,260][i],pose:i=>G([
      {aFs:30,aFe:60,bA:-80,lean:16,hx:-2,brow:1,mouth:3,lFh:40,lFk:-14,lBh:-14,lBk:-50},
      {aFs:160,aFe:190,bA:236,lean:-12,brow:1,mouth:1,lFh:40,lFk:-14,lBh:-14,lBk:-50},
      {aFs:178,aFe:206,bA:246,lean:-18,brow:1,mouth:2,lift:8,plant:0,lFh:60,lFk:0,lBh:14,lBk:-40},
      {aFs:62,aFe:40,bA:6,lean:42,hx:10,mouth:2,brow:1,smear:3,sa:240,impact:2,rocks:1,lFh:90,lFk:-14,lBh:6,lBk:-96},
      {aFs:60,aFe:38,bA:4,lean:40,hx:10,mouth:2,brow:1,rocks:2,lFh:90,lFk:-14,lBh:6,lBk:-96},
      {aFs:160,aFe:186,bA:230,lean:-8,hx:6,mouth:3,brow:1,lFh:54,lFk:-8,lBh:-28,lBk:-62},
      {aFs:62,aFe:40,bA:6,lean:42,hx:10,mouth:2,brow:1,smear:3,sa:226,impact:1,rocks:2,lFh:90,lFk:-14,lBh:6,lBk:-96},
      {aFs:34,aFe:76,bA:110,lean:8,hx:3,mouth:3,brow:3,lFh:34,lFk:2,lBh:-24,lBk:-34}][i])}),
    fx:(p,M,sk,P,{lp})=>{ if(!P.rocks) return; const t=lp(sk.wrF,P.aFe+P.bat-sk.ro,28); rocks(p,M,{x:t.x,y:Math.min(t.y+4,151)},P.rocks); },
    FX:{special:{hits:[3,6],word:'KRAK!',bricks:true}, combo:{words:['POC!','POC!','BLAM!']}},
    NAMES:{skin:'Pele',hair:'Cabelo',helmet:'Capacete',vest:'Colete refletivo',refl:'Faixa refletiva',top:'Regata mescla',pants:'Jeans',glove:'Luva pigmentada',knee:'Joelheira',boot:'Botina',steel:'Picareta (aço)',wood:'Cabo'},
  });
})();
