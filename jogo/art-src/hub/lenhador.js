/* LENHADOR — fonte de arte (editável). Build: npm run art */
/* Grandalhão barbudo no padrão do HEROI (corpo mais largo e alto): camisa de flanela xadrez com manga dobrada,
   suspensório, gorro de lã, barba cheia, calça de lona remendada, botina; machado de duas mãos. */
const LENHADOR=(function(){
  const {P2,lerp,lp}=PIX;
  const machado={nome:'Machado de lenhador',len:36,twoHand:true,grip2:11,draw(p,M,b,ang){ p.xf(ang,b.x,b.y);
    p.F(M.wood[1]); p.cap(P2(-9,0),P2(36,0),5,4.4); p.F(M.wood[0]); p.ell(-9.6,0,2.8,3);
    p.F(M.woodX[2]); p.poly([[-8,0.2],[34,0.1],[34,2.1],[-8,2.4]]); p.F(M.wood[2]); p.poly([[-8,1.1],[34,0.9],[34,2.1],[-8,2.4]]); p.F(M.wood[3]); p.rect(-8,1.8,42,0.6);
    p.F(M.wood[0]); p.rect(6,-1.8,24,0.8); p.F(M.woodX[0]); p.rect(14,-1.8,6,0.7); p.F(M.wood[2]); [10,18,25].forEach(x=>p.rect(x,-0.6,3,0.6));
    p.F(M.tape[1]); p.cap(P2(-7.6,0),P2(1,0),5.6,5.6); p.F(M.tape[2]); for(let x=-6.6;x<1;x+=2.2) p.poly([[x,-2.8],[x+1,-2.8],[x+0.2,2.8],[x-0.8,2.8]]); p.F(M.tape[0]); p.rect(-7,-2.4,8,0.8);
    // olho + lâmina larga (gume pro lado +y), contracabeça
    p.F(M.axe[3]); p.poly([[30,-7],[40.6,-7],[40.6,3],[44,8.6],[47,21.6],[26,23],[28.6,10],[30,3]]);
    p.F(M.axe[2]); p.poly([[30.6,-6.4],[40,-6.4],[40,3.4],[30.6,3.4]]);
    p.F(M.axe[1]); p.poly([[30.6,3],[40,3],[43.2,9],[46,20.6],[27,21.8],[29.2,10]]);
    p.F(M.axeX[2]); p.poly([[30.6,3],[33.4,3],[31.6,10],[29.6,21.6],[27,21.8],[29.2,10]]);
    p.F(M.axeX[1]); p.poly([[36,4],[40,3.4],[43,9.2],[38.4,9.8]]);
    p.F(M.axe[0]); p.poly([[26.8,18.6],[45.6,17.4],[46,21],[26.8,22]]); p.F(M.axeX[0]); p.rect(35,18.2,5,1.4); p.F(M.axe[3]); p.rect(30,16.6,13,0.8);
    p.F(M.axe[1]); p.rect(31.4,-5.6,7,1.6); p.F(M.axe[0]); p.rect(32,-5.6,3.6,0.8);
    p.F(M.rust[1]); p.rect(32,7,2.4,1.8); p.rect(38,11,1.6,1.4); p.rect(34,13,1.2,1.2); p.F(M.rust[2]); p.rect(31.6,-2.4,1.6,1.6);
    p.id(); }};
  return RECRUTA_BASE.make({
    FW:212, AX:96, rim:'#a9c8f0', trail:'#f0d8a8', twoGuard:true, comboSlow:1.12,
    body:{L1:22.4,L2:21.8,U:14.8,E:14,shF:-16,shB:15.4,tsx:1.68,tsy:1.17,wU:15.4,wE:13.4,wW:9.8,wT:20.4,wK:15.2,wA:11.4,fist:1.72,hipF:5.8,hipB:-6.2,neck:10.4,foot:8.6,shoe:1.4,head:1.15},
    comboName:'Combo de machadadas', strikes:{names:{atkH:'Machadada lateral',atkV:'Machadada por cima (racha)',atkS:'Cutucão com o cabo',atkSpin:'Giro do machado',atkFin:'Machadada de baixo (lança)'}}, specialName:'Especial: rachar tora',
    sigs:[['sigGiro','spinTornado','Machadada giratória'],['sigRacha','groundSlam','Racha-tora (machado no chão)',{v:'crack'}]],
    top:'top', leg:{pants:'pants',boot:'boot',sole:'sole',lace:'lace',patch:'patch',pocket:1},
    arm:{style:'rolled',to:0.8,hairy:1,
      extra:(p,M,sh,el,wr,front,P,{wU,wE})=>{ // xadrez da manga
        const e=lerp(sh,el,0.68); [0.18,0.42].forEach(t=>{ const q=lerp(sh,e,t), o=lerp(sh,e,t+0.07); p.F(M.plaid[1]); p.cap(q,o,wU+2.4,wU+2.2); });
        const ax0=lerp(sh,e,0.02), ax1=lerp(sh,e,0.6); p.F(M.plaid[1]); p.cap(ax0,ax1,1.6,1.6);
        if(front){ const bnd=lerp(el,wr,0.86); p.F(M.bonfim[0]); p.cap({x:bnd.x-3,y:bnd.y-2.6},{x:bnd.x+3,y:bnd.y+2.6},1.6,1.6); p.F(M.bonfim[2]); p.rect(bnd.x-1,bnd.y-1,1.4,1.4); } }},
    mats:()=>({
      top:'#b4362a', plaid:['#5a1a16','#3a0e0e','#260808','#120404'], under:'#cfc8b8',
      susp:'#4a3020', brass:['#fff0b0','#d8aa48','#8a6a20','#4a380e'],
      pants:'#6e6044', patch:['#b8a678','#8e7c56','#6a5a3c','#423820'],
      boot:'#6e4626', sole:['#5a4636','#2e2018','#1c140e','#0c0806'], lace:['#efe2c0','#c8b07a','#8a7448','#4a3c22'],
      hair:'#6a3a1e', hat:'#d89a2a', hatband:'#3a5a8a',
      wood:'#b07a40', tape:['#5a5a64','#202026','#121216','#060608'], axe:['#f4f8fc','#9aa2ae','#566070','#2a303c'], axeX:['#ffffff','#c4ccd8','#5c5870','#14121c'], rust:['#c06a3a','#8a4a2a','#5a2e18','#30180c'],
      bonfim:['#4ac860','#ffd23f','#e83a3a','#2a2a2a'], log:'#a8743a', ring:['#f4dcae','#d8b880','#a88a58','#6a5636'], chip:['#f4dcae','#d8b880','#a88a58','#6a5636'],
    }),
    pattern:(p,M,sk,P)=>{ // flanela xadrez (listras escuras e cruzamentos)
      p.F(M.plaid[1]); for(let y=-30;y<2;y+=6.4) p.rect(-14,y,30,1.6); for(let x=-11;x<14;x+=6.4) p.rect(x,-34,1.4,36);
      p.F(M.plaid[3]); for(let y=-30;y<2;y+=6.4) for(let x=-11;x<14;x+=6.4) p.rect(x,y,1.4,1.6);
      p.F(M.topX[1]); for(let y=-27;y<2;y+=6.4) p.rect(-2,y,16,0.6);
      p.F(M.plaid[2]); p.poly([[-14,-34],[-6,-34],[-6,4],[-14,4]]); p.F(M.plaid[1]); for(let y=-30;y<2;y+=6.4) p.rect(-14,y,8,1.6); },
    torso:(p,M,sk,P)=>{ // gola, botões, suspensório, bolso
      p.F(M.under[1]); p.poly([[-1,-33.6],[5.8,-33.8],[3.2,-27]]); p.F(M.under[2]); p.rect(-0.4,-33.4,2,4);
      p.F(M.top[1]); p.poly([[-3.6,-34],[1.4,-35],[2.8,-28],[-0.6,-30]]); p.poly([[4.4,-35],[9,-33.6],[5.6,-29],[3.2,-28]]); p.F(M.top[0]); p.rect(-2.6,-34.2,3,0.8); p.rect(5,-34.6,3,0.8); p.F(M.plaid[1]); p.rect(-2.8,-31.6,2.4,1); p.rect(6,-32,2,1);
      p.F(M.under[0]); [-24,-17,-10].forEach(y=>{ p.rect(3.6,y,1.4,1.4); }); p.F(M.plaid[3]); p.rect(3.2,-27,0.8,24);
      p.F(M.plaid[2]); p.rect(-9,-24,6.4,6); p.F(M.top[2]); p.rect(-9,-24,6.4,1.6); p.F(M.under[0]); p.rect(-6.4,-23.4,1,1);
      const S=M.susp, SX=M.suspX;
      p.F(S[1]); p.poly([[-8,-32.6],[-5,-32.8],[-2.6,-3],[-5.6,-3]]); p.poly([[8,-33.4],[11,-32.4],[10.2,-3],[7.2,-3]]);
      p.F(SX[2]); p.poly([[-8,-32.6],[-6.6,-32.6],[-4.4,-3],[-5.6,-3]]); p.F(S[0]); p.poly([[9.6,-32.8],[11,-32.4],[10.6,-20],[9.6,-20]]);
      p.F(M.brass[1]); p.rect(-5.4,-6,2.6,2.6); p.rect(7.4,-6,2.6,2.6); p.F(M.brass[0]); p.rect(-5.4,-6,1.2,1); p.rect(7.4,-6,1.2,1);
      p.F(S[2]); [-28,-20,-12].forEach(y=>{ p.rect(-6.4+(y+32)*0.1,y,0.8,0.8); p.rect(8.6,y,0.8,0.8); }); },
    head:{brow:2.6,
      beard:(p,M)=>{ const R=M.hair, X=M.hairX;
        p.F(R[1]); p.poly([[-3.4,-11],[-0.6,-6.4],[1,-1.4],[4.6,3.6],[9,5.4],[12.6,2.4],[14,-3.6],[12.4,-4.6],[10.6,-3],[8,-3.4],[6.4,-5],[3.6,-7.6],[1.4,-12]]);
        p.F(X[2]); p.poly([[-3.4,-11],[-0.6,-6.4],[1,-1.4],[4.6,3.6],[6,3],[3,-1.6],[1.6,-7]]); p.F(R[2]); p.poly([[1,-1.4],[4.6,3.6],[9,5.4],[8.4,3.4],[4.4,1.4],[2.4,-2.4]]);
        p.F(R[0]); [[6,-1.6],[9.6,-0.6],[11.6,-2.2],[3,-5],[7.6,1.6]].forEach(([x,y])=>p.rect(x,y,1,1.6)); p.F(X[1]); p.rect(4,-3,1.2,2);
        p.F(R[3]); p.rect(6,4.4,4,1); },
      stache:(p,M)=>{ p.F(M.hair[1]); p.poly([[6.4,-9.4],[13.6,-9.6],[14.8,-6.4],[13,-5.6],[10.4,-7.2],[7.6,-5.8],[6,-6.8]]); p.F(M.hair[0]); p.rect(8.6,-9.4,3.4,0.8); p.F(M.hair[2]); p.rect(12.6,-6.4,1.6,0.8); },
      nose:(p,M)=>{ p.F(M.skinX[1]); p.ell(13,-10,1.4,1.1); },
      hair:(p,M)=>{ p.F(M.hair[1]); p.poly([[-8.6,-18],[-1.6,-18],[-0.6,-12],[-1.4,-9],[-4,-8],[-8.6,-11]]); p.F(M.hair[0]); [[-6.4,-16],[-4,-14.6]].forEach(([x,y])=>p.rect(x,y,1.2,0.8)); p.F(M.hair[1]); p.rect(-0.8,-17.6,2,7); },
      hat:(p,M,P,{dome})=>{ const R=M.hat, X=M.hatX; // gorro de lã com barra dobrada
        p.F(R[1]); p.poly(dome(2.4,-19,11.6,11.4,-5,185,16)); p.poly([[2,-30],[5,-33],[7,-31],[5,-29]]);
        p.F(X[2]); p.poly(dome(2.4,-19,11.6,11.4,120,185,8).concat([[-3,-19]])); p.F(R[2]); p.poly(dome(2.4,-19,11.6,11.4,150,185,6).concat([[-6.6,-19]]));
        p.F(X[1]); p.poly([[2,-29.6],[8,-28.6],[12.4,-24],[13.6,-20],[7,-21],[3,-25]]); p.F(R[0]); p.poly([[3.6,-29],[8,-27.8],[10.6,-24.4],[6,-25]]);
        p.F(R[2]); for(let x=-6;x<12;x+=3) p.rect(x,-27+Math.abs(x-3)*0.12,0.9,6);
        p.F(R[1]); p.poly([[-10.8,-22.6],[13.8,-23],[14.4,-17.4],[-10.4,-17]]); p.F(R[3]); p.poly([[-10.4,-17.6],[14.4,-18],[14.4,-17.2],[-10.4,-16.8]]);
        p.F(R[2]); for(let x=-9.6;x<14;x+=2.4) p.rect(x,-22.4,0.9,5); p.F(R[0]); p.rect(-10,-22.8,23.6,0.9); p.F(X[2]); p.rect(-10.6,-22.6,4,5.4);
        p.F(M.hatband[1]); p.rect(-10.6,-21,25,1.4); p.F(M.hatband[0]); p.rect(2,-21,8,0.6); }},
    tools:{machado}, toolFor:()=> 'machado',
    anims:(A,{K_,G,S,th,sh})=>{
      // machado atravessado na frente do corpo, segurado com as duas mãos (lâmina pra baixo)
      A.idle.pose=i=>{ const p=i/8*Math.PI*2, s=S(p);
        return K_({lean:6+1.4*s,br:s,hx:1.2*S(p/2),head:1.2*S(p-0.7)-2,lFh:30,lFk:4+2.2*s,lBh:-26,lBk:-28+2.2*s,aFs:2+2*s,aFe:60+3*s,bA:58+2*s,two:1,blink:i===5?1:0}); };
      A.walk.pose=i=>{ const p=i/8*Math.PI*2;
        return K_({plant:0,lFh:th(p,0),lFk:sh(p,0),lBh:th(p,Math.PI),lBk:sh(p,Math.PI),lean:5+1.4*S(2*p),head:S(2*p-0.6)-2,aFs:2+4*S(p),aFe:60+4*S(p),bA:58+3*S(2*p),two:1}); };
      A.run.pose=(f=>i=>Object.assign(f(i),{two:1}))(A.run.pose);
    },
    front:(p,M,sk,P)=>{ if(!P.log) return; // tora no toco
      const lx=sk.hip.x+50, gy=154, L=M.log, LX=M.logX; p.id();
      p.F(L[3]); p.poly([[lx-15,gy],[lx+15,gy],[lx+13,gy-13],[lx-13,gy-13]]); p.F(L[2]); p.poly([[lx-14,gy-0.6],[lx+14,gy-0.6],[lx+12,gy-12.6],[lx-12,gy-12.6]]); p.F(L[1]); p.poly([[lx-2,gy-1],[lx+13,gy-1],[lx+11.6,gy-12.6],[lx-2,gy-12.6]]); p.F(LX[1]); p.rect(lx+5,gy-12,4,11);
      p.F(M.ring[1]); p.ell(lx,gy-13,13,3.6); p.F(M.ring[2]); p.ell(lx,gy-13,8,2.2); p.F(M.ring[3]); p.ell(lx,gy-13,3,0.9);
      if(P.log===1){ p.F(L[2]); p.poly([[lx-8,gy-13],[lx+8,gy-13],[lx+8,gy-37],[lx-8,gy-37]]); p.F(L[1]); p.poly([[lx-1,gy-13],[lx+8,gy-13],[lx+8,gy-37],[lx-1,gy-37]]); p.F(LX[1]); p.rect(lx+3,gy-36,2.4,22); p.F(L[3]); p.rect(lx-8,gy-36,1.6,22); [gy-30,gy-22].forEach(y=>p.rect(lx-4,y,0.9,4));
        p.F(M.ring[1]); p.ell(lx,gy-37,8,2.4); p.F(M.ring[2]); p.ell(lx,gy-37,4.4,1.2); }
      else { [[-1,-15],[1,15]].forEach(([s,o])=>{ const bx=lx+o*0.7; p.F(L[2]); p.poly([[bx-5,gy-1],[bx+5,gy-1],[bx+6+s*5,gy-22],[bx-4+s*5,gy-22]]); p.F(M.ring[1]); p.poly([[bx+(s<0?3:-5),gy-1],[bx+(s<0?5:-3),gy-1],[bx+(s<0?6:-4)+s*5,gy-22],[bx+(s<0?4:-6)+s*5,gy-22]]); });
        p.F(M.chip[1]); [[-6,-26],[4,-30],[10,-24],[-12,-20],[0,-34]].forEach(([dx,dy])=>p.rect(lx+dx,gy+dy,2.4,1.4)); } },
    special:({G})=>({n:8,hits:{4:1},dur:i=>[180,160,150,90,70,240,200,300][i],pose:i=>G([
      {log:1,aFs:40,aFe:70,bA:60,lean:6,brow:1,mouth:3},
      {log:1,aFs:150,aFe:186,bA:226,lean:-10,brow:1,mouth:1,lFh:40,lFk:-14,lBh:-14,lBk:-50},
      {log:1,aFs:176,aFe:206,bA:244,lean:-18,brow:1,mouth:2,lift:4,lFh:44,lFk:-14,lBh:-14,lBk:-50},
      {log:1,aFs:150,aFe:176,bA:200,lean:-4,mouth:2,brow:1},
      {log:2,aFs:70,aFe:62,bA:40,lean:34,hx:8,mouth:2,brow:1,smear:3,sa:226,impact:2,lFh:62,lFk:12,lBh:-32,lBk:-36},
      {log:2,aFs:68,aFe:60,bA:38,lean:32,hx:8,mouth:1,brow:1,lFh:62,lFk:12,lBh:-32,lBk:-36},
      {log:2,aFs:40,aFe:80,bA:110,lean:10,hx:4,mouth:3,brow:3,lFh:34,lFk:2,lBh:-24,lBk:-34},
      {log:2,aFs:30,aFe:80,bA:120,lean:6,hx:3,mouth:3,brow:3,two:0,lFh:30,lFk:2,lBh:-22,lBk:-30}][i])}),
    FX:{special:{hits:[4],word:'CRAC!',chips:true}, combo:{words:['TCHAC!','TCHAC!','KRAK!']}},
    NAMES:{skin:'Pele',hair:'Barba/cabelo',hat:'Gorro de lã',top:'Flanela xadrez',susp:'Suspensório',pants:'Calça de lona',boot:'Botina',wood:'Cabo de nogueira',axe:'Cabeça do machado',log:'Tora'},
  });
})();
