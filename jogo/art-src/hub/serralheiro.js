/* SERRALHEIRO — fonte de arte (editável). Build: npm run art */
/* Serralheiro do Recife no padrão do HEROI: avental de raspa de couro com queimados, óculos de solda na testa,
   bigode, luvas de raspa, botina com biqueira de aço, marreta de duas mãos (e chave grifo no bolso do avental). */
const SERRALHEIRO=(function(){
  const {P2,lerp,lp,rad}=PIX;
  const marreta={nome:'Marreta',len:29,twoHand:true,grip2:10,draw(p,M,b,ang,P){ p.xf(ang,b.x,b.y);
    // cabo de madeira com fita isolante na pega
    p.F(M.wood[1]); p.cap(P2(-7,0),P2(26,0),4.8,4.4);
    p.F(M.woodX[2]); p.poly([[-6,0.2],[26,0.1],[26,2.2],[-6,2.4]]); p.F(M.wood[2]); p.poly([[-6,1.1],[26,0.9],[26,2.2],[-6,2.4]]); p.F(M.wood[3]); p.rect(-6,1.8,32,0.6);
    p.F(M.wood[0]); p.rect(5,-1.8,19,0.8); p.F(M.woodX[0]); p.rect(11,-1.8,5,0.7);
    p.F(M.wood[2]); [9,15,20].forEach(x=>p.rect(x,-0.6,2.4,0.6));
    p.F(M.tape[1]); p.cap(P2(-6.4,0),P2(5,0),5.6,5.6); p.F(M.tape[2]); for(let x=-5;x<5;x+=2.2) p.poly([[x,-2.8],[x+1,-2.8],[x+0.2,2.8],[x-0.8,2.8]]); p.F(M.tape[0]); p.rect(-5.6,-2.4,10,0.8);
    // cabeça de ferro (faces nos dois lados), cunha e anel de latão
    p.F(M.iron[3]); p.poly([[22.4,-10],[33.6,-10],[34.4,-9],[34.4,9],[33.6,10],[22.4,10],[21.6,9],[21.6,-9]]);
    p.F(M.iron[1]); p.poly([[22.4,-9.4],[33.6,-9.4],[33.8,4.6],[22.2,4.6]]);
    p.F(M.ironX[2]); p.rect(22.2,2.4,11.6,2.6); p.F(M.iron[2]); p.rect(22,4.2,12.2,4.8); p.F(M.iron[3]); p.rect(22,7.6,12.4,1.6);
    p.F(M.ironX[1]); p.rect(28,-9,5.4,11); p.F(M.iron[0]); p.rect(23,-9.2,10,1.3); p.rect(32.2,-8,1.2,9); p.F(M.ironX[0]); p.rect(29,-9.2,3,1);
    p.F(M.iron[2]); p.rect(22,-10,12.4,0.8); p.rect(22,9.2,12.4,0.8);
    p.F(M.iron[3]); p.rect(26.6,-6,0.8,10); p.F(M.ironX[1]); p.rect(27.4,-6,0.6,10);
    p.F(M.brass[1]); p.rect(20,-3,1.8,6); p.F(M.brass[0]); p.rect(20,-3,1.8,1); p.F(M.brass[2]); p.rect(20,1.6,1.8,1.4);
    // face de cima em brasa (bateu no ferro quente)
    p.F(M.ember[1]); p.rect(22.6,-10,11,1); p.F(M.ember[0]); p.rect(25,-10,5,0.8);
    p.id(); }};
  const grifo={nome:'Chave grifo',len:24,draw(p,M,b,ang){ p.xf(ang,b.x,b.y);
    p.F(M.red[1]); p.cap(P2(-6,0),P2(5,0),5,4.6); p.F(M.red[2]); p.rect(-6,1,11,1.4); p.F(M.red[0]); p.rect(-5,-1.8,9,0.8);
    p.F(M.steel[1]); p.cap(P2(5,0),P2(18,0),3.6,3.6); p.F(M.steel[2]); p.rect(5,0.6,13,1.2); p.F(M.steel[0]); p.rect(6,-1.2,11,0.7);
    p.F(M.steel[1]); p.poly([[17,-2],[24,-2],[24,-8],[20,-8],[20,-4.6],[17,-4.6]]); p.poly([[17,2],[25,2],[25,6],[17,6]]);
    p.F(M.steel[3]); [18.4,20,21.6,23.2].forEach(x=>p.rect(x,1.6,0.8,1)); p.F(M.steel[0]); p.rect(20.4,-8,3,0.8);
    p.F(M.brass[1]); p.ell(17.6,1,2,2); p.F(M.brass[2]); p.rect(16.6,1,2,0.8);
    p.id(); }};
  // fagulhas da marreta (especial e golpe final)
  function sparks(p,M,c,r,seed){ const n=9; for(let k=0;k<n;k++){ const a=-Math.PI*(0.08+0.84*((k*0.618+seed)%1)), L=r*(0.55+0.45*((k*0.37+seed)%1));
      const q={x:c.x+Math.cos(a)*L,y:c.y+Math.sin(a)*L}, q2={x:c.x+Math.cos(a)*(L-5),y:c.y+Math.sin(a)*(L-5)};
      p.F(k%3?M.ember[1]:M.ember[0]); p.cap(q2,q,1.4,1); p.F(M.ember[0]); p.rect(q.x-0.6,q.y-0.6,1.2,1.2); } }
  return RECRUTA_BASE.make({
    rim:'#a9c8f0', trail:'#ffb86a', twoGuard:true,
    body:{tsx:1.5,wU:14,wE:12,wW:9},
    comboName:'Combo de marteladas', strikes:{names:{atkH:'Marretada lateral',atkV:'Marretada por cima',atkS:'Socão com a cabeça da marreta',atkSpin:'Giro da marreta',atkFin:'Marretada de baixo (lança)'}}, specialName:'Especial: marretada no chão',
    sigs:[['sigFaisca','groundSlam','Marretada de faísca (atordoa)',{v:'spark'}],['sigBigorna','uppercutSlam','Bigorna (marretada pra cima)']],
    top:'top', leg:{pants:'pants',boot:'boot',sole:'sole',toe:'steel',lace:'lace',patch:'patch',pocket:1},
    arm:{style:'rolled',to:0.74,glove:'glove',gloveFrom:0.42,cuff:4,hairy:1},
    mats:()=>({
      top:'#4f6a86', pants:'#3a3e4e', patch:['#7a8a96','#56646e','#3a4450','#222a32'],
      apron:'#8e5632', stitch:['#f4dca8','#d8b47a','#9a7a50','#6a5230'], burn:['#ffb060','#2a1810','#1a0e08','#0e0604'],
      glove:'#c49a62', boot:'#55392a', sole:['#6a5a50','#3a2e26','#241c16','#120e0a'], steel:['#ffffff','#c4cad4','#7e8694','#464c58'], lace:['#e8d8b0','#b8a070','#7a6640','#4a3c22'],
      hair:'#2a1e18', lens:['#bff0c8','#3a8a5a','#1e5a3a','#0e2a1c'], brass:['#fff0b0','#d8aa48','#8a6a20','#4a380e'], strap:['#5a5a66','#26262e','#16161c','#08080a'],
      iron:['#e4e8f0','#7a7f8c','#4a4e5a','#262a34'], ironX:['#ffffff','#a0a6b4','#5a5466','#14121c'],
      wood:'#9a6a3a', tape:['#5a5a64','#202026','#121216','#060608'], red:['#ff8a6a','#c8402a','#7a1e14','#40100a'],
      soot:['#6a6a72','#3e3e48','#2a2a32','#18181e'], ember:['#fff6c0','#ffa63a','#e0501a','#8a2008'],
      rubble:['#c8bca8','#8a8070','#5a5248','#2e2a26'],
    }),
    head:{brow:2.2,
      beard:(p,M)=>{ p.F(M.hair[2]); [[1,-6],[3,-3],[5.4,-1.4],[8,-0.6],[10.6,-1.4],[2,-8.6],[11.8,-3]].forEach(([x,y])=>p.rect(x,y,1,0.9)); p.F(M.soot[1]); p.ell(1.6,-11,2,1.2); },
      stache:(p,M)=>{ p.F(M.hair[1]); p.poly([[6.4,-9],[13.6,-9.2],[14.6,-6.2],[13,-5.4],[10.4,-7],[7.6,-5.8],[6,-6.6]]); p.F(M.hair[0]); p.rect(8.6,-9,3.4,0.8); p.F(M.hair[2]); p.rect(12.6,-6.2,1.6,0.8); },
      hair:(p,M,P,{dome})=>{ p.F(M.hair[1]); p.poly(dome(2.6,-15,10.8,11,40,200,14).concat([[-6.6,-8.6],[-4.4,-10.2],[-2.4,-14],[0,-15.6],[2,-18.4],[6,-19.2],[9.6,-18.8],[12.6,-18]]));
        p.F(M.hair[2]); p.poly([[-8.2,-10],[-8.4,-14.6],[-4,-15.6],[-2.4,-14],[-4.4,-10.2],[-6.6,-8.6]]);
        p.F(M.hair[0]); p.poly([[-5,-21.8],[-2,-24],[-1,-23.2],[-4,-20.8]]); p.F(M.hairX[2]); [[-6,-17],[-3,-19.4],[-7,-13]].forEach(([x,y])=>p.rect(x,y,1.4,0.8));
        p.F(M.hair[1]); p.poly([[-0.4,-15.4],[1.2,-15.4],[1,-10.4],[-0.6,-10]]); },
      hat:(p,M,P)=>{ // óculos de solda na testa
        p.F(M.strap[1]); p.poly([[-9.6,-21.6],[-4,-23.2],[3,-23.6],[12.6,-22.4],[12.8,-20.4],[3,-21.4],[-4,-21],[-9.4,-19.4]]); p.F(M.strap[0]); p.rect(-6,-23,8,0.7);
        [[5.2,-23.2,3.6],[11.4,-22.6,2.4]].forEach(([x,y,r])=>{ p.F(M.brass[3]); p.ell(x,y,r+1.3,r+0.9); p.F(M.brass[1]); p.ell(x,y-0.2,r+0.8,r+0.4); p.F(M.brass[0]); p.ell(x-0.6,y-1.4,r*0.6,0.7);
          p.F(M.lens[2]); p.ell(x,y,r,r-0.6); p.F(M.lens[1]); p.ell(x+0.3,y+0.2,r-0.9,r-1.4); p.F(M.lens[0]); p.rect(x-r*0.5,y-r*0.5,1.2,1); });
        p.F(M.brass[2]); p.rect(8.6,-23.4,1.2,1.4); }},
    torso:(p,M,sk,P)=>{ // avental de couro (peito), alças, queimados, bolso com chave grifo
      const A=M.apron, X=M.apronX;
      p.F(A[1]); p.poly([[-4.6,-25.6],[10.6,-26.8],[12,-14],[10.6,3.6],[-7.4,3.6],[-6.6,-14]]);
      p.F(X[2]); p.poly([[-4.6,-25.6],[-0.4,-25.8],[0,-12],[-1.6,3.6],[-7.4,3.6],[-6.6,-14]]);
      p.F(A[2]); p.poly([[-4.6,-25.6],[-2.8,-25.6],[-3.4,-12],[-4.4,3.6],[-7.4,3.6],[-6.6,-14]]);
      p.F(X[1]); p.poly([[3,-26.2],[10.6,-26.8],[11.8,-17],[4.4,-16]]); p.F(A[0]); p.poly([[5,-26],[10.2,-26.4],[11,-21],[6.4,-20.4]]); p.F(X[0]); p.rect(7,-25.8,2.6,1);
      p.F(A[2]); p.poly([[0,-14],[10,-16],[10.4,-14.6],[0.4,-12.6]]); p.poly([[2,-6],[9,-4],[8.6,-3],[1.6,-4.8]]);
      p.F(M.stitch[1]); for(let y=-24;y<3;y+=2.2){ p.rect(-5.4+(y+25)*-0.06,y,0.8,1.1); p.rect(10.6+(y+25)*0.03,y,0.8,1.1); } for(let x=-3.6;x<10;x+=2.2) p.rect(x,-24.8,1.1,0.8);
      p.F(M.brass[1]); [[-4,-25],[9,-26],[-6,1.4],[9.4,1.4]].forEach(([x,y])=>{ p.rect(x,y,1.6,1.6); }); p.F(M.brass[0]); [[-4,-25],[9,-26]].forEach(([x,y])=>p.rect(x,y,0.8,0.8));
      p.F(A[1]); p.cap(P2(-3.6,-25),P2(-1.6,-33),2.4,2.2); p.cap(P2(9.6,-26),P2(6.6,-33.4),2.4,2.2); p.F(A[2]); p.rect(-3.4,-30,1,4); p.F(A[0]); p.rect(7.6,-31,1,4);
      p.F(M.burn[1]); [[2,-21],[7,-18],[4,-10],[9,-8],[-1,-6],[6,-1]].forEach(([x,y],k)=>p.ell(x,y,k%2?1.2:1.6,1)); p.F(M.burn[0]); [[2.6,-21.6],[7.4,-18.4],[4.4,-10.6]].forEach(([x,y])=>p.rect(x,y,0.8,0.7));
      // bolso + chave grifo
      p.F(A[3]); p.rect(0.6,-8.4,8.6,7); p.F(A[2]); p.rect(1,-8,7.8,6.4); p.F(X[1]); p.rect(1,-8,7.8,1.4); p.F(M.stitch[1]); p.rect(1,-6.6,7.8,0.7);
      p.F(M.steel[2]); p.poly([[2.6,-8],[4.2,-8],[4.6,-14.6],[3,-14.6]]); p.F(M.steel[1]); p.poly([[1.6,-14.6],[6,-14.6],[6,-16.6],[3.6,-17.4],[1.6,-16.6]]); p.F(M.steel[0]); p.rect(2,-16.4,2.6,0.7);
      p.F(M.red[1]); p.poly([[5.6,-8],[7.4,-8],[8,-12.4],[6.4,-12.4]]); p.F(M.red[0]); p.rect(6.4,-12.4,1,2);
      p.F(M.soot[1]); p.ell(-3,-18,1.8,1.2); p.ell(8,-12,1.4,0.9); },
    overLegs:(p,M,sk,P)=>{ // saia do avental: pendurada no quadril, gira com o corpo, barra acompanha a coxa da frente
      const A=M.apron, X=M.apronX, ro=sk.ro*Math.PI/180, ang=ro+0.3*(sk.a-ro), c=Math.cos(ang), si=Math.sin(ang), h=sk.hip;
      const loc=q=>({x:(q.x-h.x)*c+(q.y-h.y)*si, y:-(q.x-h.x)*si+(q.y-h.y)*c});
      const kF=loc(sk.kneeF), kB=loc(sk.kneeB); p.xf(ang,h.x,h.y);
      const lay=Math.abs(Math.sin(ro)), t0={x:-13+6*lay,y:0}, t1={x:16-6*lay,y:-0.6}, by=Math.min(27-6*lay,Math.max(kF.y,kB.y)+4), sw=(kF.x-kB.x)*0.14;
      const cx=kF.x*0.3+4+sw, hw=13+Math.min(3,Math.abs(kF.x-kB.x)*0.05), bl=cx-hw, br=cx+hw+2, mx=(bl+br)/2;
      p.F(A[1]); p.poly([[t0.x,t0.y],[t1.x,t1.y],[br,by],[bl,by]]);
      p.F(X[2]); p.poly([[t0.x,t0.y],[-1,0],[mx-4,by],[bl,by]]); p.F(A[2]); p.poly([[t0.x,t0.y],[t0.x+5,t0.y],[bl+5,by],[bl,by]]);
      p.F(X[1]); p.poly([[5,0],[t1.x-1,t1.y],[br-2,by-6],[mx+5,by-6]]); p.F(A[0]); p.poly([[t1.x-6,t1.y+1],[t1.x-1,t1.y+1],[br-3,by-12],[br-7,by-12]]);
      p.F(A[2]); [0.38,0.62].forEach(t=>{ const ax=t0.x+(t1.x-t0.x)*t; p.cap({x:ax,y:5},{x:bl+(br-bl)*t,y:by-2},1,1.2); });
      p.F(A[3]); p.rect(bl,by-1.4,br-bl,1.4); p.F(M.stitch[1]); for(let x=bl+1;x<br-1;x+=2.4) p.rect(x,by-3.2,1.2,0.8);
      p.F(M.burn[1]); [[0.3,0.4],[0.7,0.55],[0.5,0.8]].forEach(([u,v])=>p.ell(bl+(br-bl)*u,by*v,1.4,1));
      p.F(M.glove[1]); p.poly([[br-3,3],[br,3],[br+1,12],[br-2.4,11]]); p.F(M.glove[2]); p.rect(br-2.4,9,3,1.6); },
    tools:{marreta,grifo}, toolFor:()=> 'marreta',
    anims:(A,{K_,G,S,th,sh})=>{
      // marreta descansando no ombro (parado e andando)
      A.idle.pose=i=>{ const p=i/8*Math.PI*2, s=S(p);
        return K_({lean:3+1.4*s,br:s,hx:1.2*S(p/2),head:1.2*S(p-0.7),lFh:28,lFk:4+2.2*s,lBh:-24,lBk:-26+2.2*s,aFs:34+2*s,aFe:150+2*s,bA:236+2*s,aBs:-6+2*s,aBe:30+3*s,toolBehind:1,blink:i===5?1:0}); };
      A.walk.pose=i=>{ const p=i/8*Math.PI*2;
        return K_({plant:0,lFh:th(p,0),lFk:sh(p,0),lBh:th(p,Math.PI),lBk:sh(p,Math.PI),lean:3+1.4*S(2*p),head:S(2*p-0.6),aFs:34+3*S(2*p),aFe:150+3*S(2*p),bA:236+3*S(2*p),aBs:-6+20*S(p),aBe:12+22*S(p),toolBehind:1}); };
      A.run.pose=(f=>i=>Object.assign(f(i),{two:1}))(A.run.pose);
    },
    special:({G})=>({n:8,hits:{3:1,6:2},dur:i=>[150,110,90,70,170,90,70,260][i],pose:i=>G([
      {aFs:20,aFe:40,bA:-60,lean:18,hx:-2,brow:1,mouth:3,lFh:40,lFk:-14,lBh:-14,lBk:-50},
      {aFs:150,aFe:186,bA:226,lean:-10,brow:1,mouth:1,lFh:40,lFk:-14,lBh:-14,lBk:-50},
      {aFs:176,aFe:204,bA:240,lean:-16,brow:1,mouth:2,lift:12,plant:0,lFh:64,lFk:0,lBh:18,lBk:-40},
      {aFs:66,aFe:44,bA:14,lean:40,hx:10,mouth:2,brow:1,smear:3,sa:236,impact:2,spark:1,lFh:90,lFk:-14,lBh:6,lBk:-96},
      {aFs:64,aFe:42,bA:12,lean:38,hx:10,mouth:2,brow:1,spark:2,lFh:90,lFk:-14,lBh:6,lBk:-96},
      {aFs:150,aFe:180,bA:220,lean:-6,hx:6,mouth:3,brow:1,lFh:54,lFk:-8,lBh:-28,lBk:-62},
      {aFs:66,aFe:44,bA:14,lean:40,hx:10,mouth:2,brow:1,smear:3,sa:220,impact:1,spark:1,lFh:90,lFk:-14,lBh:6,lBk:-96},
      {aFs:34,aFe:76,bA:110,lean:8,hx:3,mouth:3,brow:3,lFh:34,lFk:2,lBh:-24,lBk:-34}][i])}),
    fx:(p,M,sk,P,{lp})=>{ if(!P.spark) return; const t=lp(sk.wrF,P.aFe+P.bat-sk.ro,29); sparks(p,M,{x:t.x,y:Math.min(t.y,150)},P.spark>=2?26:18,P.spark*0.31);
      p.F(M.rubble[1]); [[-12,0],[-6,-3],[8,-2],[14,0]].forEach(([dx,dy],k)=>p.rect(t.x+dx*(P.spark>=2?1.4:1),Math.min(t.y,150)+dy-(P.spark>=2?4:0),2+k%2,2)); },
    FX:{special:{hits:[3,6],word:'TINK!',sparks:'#ffb040'}, combo:{words:['TUNG!','TUNG!','BLAM!']}},
    NAMES:{skin:'Pele',hair:'Cabelo/bigode',top:'Camisa de brim',apron:'Avental de raspa',glove:'Luva de raspa',boot:'Botina com biqueira',lens:'Óculos de solda',iron:'Cabeça da marreta',wood:'Cabo',red:'Chave grifo',ember:'Brasa'},
  });
})();
