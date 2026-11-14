/* ===== LENHADOR: grandalhão barbudo, machado ===== */
const LENHADOR=(function(){
  const {P2,lerp}=PIX;
  const machado={nome:'Machado de lenhador',len:26,twoHand:true,draw(p,M,base,ang){ p.xf(ang,base.x,base.y);
    p.F(M.wood[1]); p.cap(P2(-9,0),P2(25,0),3.2,3); p.F(M.wood[2]); p.rect(-4,-0.6,26,0.8); p.F(M.wood[0]); p.ell(-9.6,0,2,2.2);
    p.F(M.tape[1]); p.rect(-6,-1.8,6,3.6);
    p.F(M.axe[2]); p.poly([[20,-3],[26,-3],[26,3],[20,3]]);
    p.F(M.axe[1]); p.poly([[21,3],[26,3],[28,11],[17,12],[19,7]]);
    p.F(M.axe[0]); p.poly([[17,11.2],[28,10.4],[28,12],[17,12.6]]);
    p.F(M.rust[1]); p.rect(22,5,2,2);
    p.id(); }};
  return RECRUTA_BASE.make({
    FW:156,FH:166,GROUND:158,AX:62, rim:'#a9c8f0', twoHand:true,
    sh:{fx:7,fy:-29,bx:-6,by:-30,nx:1,ny:-33},
    rest:{lean:5,inhand:1,aFs:6,aFe:18,bat:-22,aBs:-10,aBe:4},
    guard:{two:1,aFs:30,aFe:70,bat:70},
    comboName:'Combo de machadadas', specialName:'Especial: rachar tora',
    mats:()=>({
      shirt:['#b8644a','#8b3a2a','#5e2218','#3a1210'], plaid:['#6a2a22','#4a1c18','#2e100c','#1a0806'], under:['#b8b2a6','#9a948a','#6e685e','#46423a'],
      susp:['#6a4a34','#4a3020','#2e1c12','#180e08'], brass:['#e8c060','#c8a040','#8a6a1e','#4a380c'],
      pants:['#8a7c5a','#6e6044','#4e432e','#2e2818'], patch:['#a8966c','#8e7c56','#6a5a3c','#423820'],
      boot:['#7a5434','#5e3c22','#3e2614','#22140a'], sole:['#3a2a1e','#22160f','#160e08','#0a0604'], lace:['#efe2c0','#d8c8a0','#a8986e','#6a5e40'],
      hair:['#7a4a2a','#4e2e1a','#321c10','#1a0e08'], hat:['#d8a440','#b8862a','#86601a','#4e380c'], saw:['#ffe27a','#e8c24a','#a8861e','#5e4a0c'],
      wood:['#c8905a','#a8743a','#764e22','#46300e'], tape:['#4a4a52','#18181c','#101012','#060608'], axe:['#eef2f6','#8a8e96','#4a4e58','#2a2e36'], rust:['#c06a3a','#8a4a2a','#5a2e18','#30180c'],
      nose:['#f0a090','#e07a6a','#a8544a','#6a302a'], bonfim:['#4ac860','#ffd23f','#e83a3a','#2a2a2a'], glove:['#d8b47a','#b8925a','#8a6a3a','#5a4422'], log:['#c8905a','#9a6a3a','#6a4422','#3e2810'], ring:['#f0d8a8','#d8b880','#a88a58','#6a5636'],
    }),
    arm:{w1:10,w2:9.6,sleeve:'shirt',sleeveTo:0.9,roll:true,
      extra:(p,M,sh,el,wr,front)=>{ if(front){ const b=lerp(el,wr,0.88); p.F(M.bonfim[0]); p.circle(b,2.4); p.F(M.bonfim[1]); p.rect(b.x-1,b.y-0.4,2,0.9); } p.F(M.hair[2]); const q=lerp(el,wr,0.4); p.rect(q.x,q.y,0.9,0.9); p.rect(q.x+2,q.y+2,0.9,0.9); }},
    leg:{pants:'pants',boot:'boot',sole:'sole',patch:'patch',lace:'lace',w1:12,w2:10,w3:9.2,cano:0.55},
    head:{neck:10,noseTip:true,
      hair:(p,M,P)=>{ p.F(M.hair[1]); p.poly([[-8.6,-16],[-3.6,-16],[-2.4,-8],[-7,-7.6]]); },
      face:(p,M,P)=>{ const open=P.mouth===1||P.mouth===2||P.mouth===4;
        p.F(M.hair[1]); p.poly([[-3.6,-14],[0,-10],[3,-8.6],[4.4,-10.4],[9.6,-10.6],[14,-8.4],[13.6,-3],[11,1.6],[6,4.4],[1,3],[-3,-2],[-4.4,-8]]);
        p.F(M.hair[0]); [[2,-4],[6,-1],[9,-3],[0,-7],[11,-6]].forEach(([x,y])=>p.rect(x,y,1,1));
        p.F(M.hair[2]); p.poly([[6.4,-10.4],[13.8,-10.8],[14.2,-8],[10,-8.6],[6.6,-7.6]]);
        if(open){ p.F(M.mouth[1]); p.poly([[8,-7.6],[12.6,-7.8],[12.2,-4],[8.4,-4.2]]); p.F(M.teeth[1]); p.rect(8.4,-7.6,3.8,1.2); }
        else if(P.mouth===3){ p.F(M.teeth[1]); p.rect(8.4,-7.4,4,1.6); }
        p.F(M.saw[1]); [[3,-1],[8,1],[11.6,-5]].forEach(([x,y])=>p.rect(x,y,1.2,1)); p.F(M.saw[2]); p.poly([[-6.6,-17.4],[-5.4,-17.6],[-4,-10.6],[-5.2,-10.4]]); },
      hat:(p,M,P)=>{ p.F(M.hat[1]); p.poly([[-10,-18.6],[-9,-25.4],[-2,-29.6],[6,-29],[11,-25],[11.6,-18.6]]); p.F(M.hat[2]); for(let x=-9;x<11;x+=2.4) p.rect(x,-21.6,1,3.6); p.F(M.hat[0]); p.rect(-10,-22,21.6,0.9); p.F(M.hat[2]); p.rect(-4,-27,1,1); p.rect(3,-28,1,1); }},
    drawTorso:(p,M,sk,P)=>{ p.xf(sk.a,sk.hip.x,sk.hip.y);
      p.F(M.shirt[1]); p.poly([[-12,1],[11.6,1],[13.6,-6],[15,-15],[14.6,-23],[11.6,-30],[4,-34],[-5,-34],[-12,-30],[-14,-20],[-13,-8]]);
      p.F(M.plaid[1]); for(let y=-31;y<0;y+=7) p.rect(-14,y,29,1.6); for(let x=-11;x<14;x+=7) p.rect(x,-33,1.6,33);
      p.F(M.plaid[3]); for(let y=-31;y<0;y+=7) for(let x=-11;x<14;x+=7) p.rect(x,y,1.6,1.6);
      p.F(M.shirt[0]); for(let y=-28;y<0;y+=7) p.rect(-14,y,29,0.6);
      p.F(M.under[1]); p.poly([[0.6,-33.4],[5.4,-33.6],[3.4,-27]]); p.F(M.shirt[0]); p.poly([[-1.6,-34],[3,-35],[1.6,-28.6]]); p.poly([[3.6,-35],[8,-33.6],[4.6,-28.4]]);
      p.F(M.under[0]); [-22,-15,-8].forEach(y=>p.rect(6.4,y,1.2,1.2));
      p.F(M.plaid[0]); p.rect(-11,-12,6,6);
      p.F(M.susp[1]); p.poly([[-7,-32],[-4.6,-32],[-2.4,-2],[-5,-2]]); p.poly([[7.6,-33],[10,-32],[9.6,-2],[7,-2]]); p.F(M.brass[1]); p.rect(-4.6,-4,2,2); p.rect(7.6,-4,2,2);
      p.F(M.susp[0]); [-28,-20,-12].forEach(y=>{ p.rect(-5.6+(y+32)*0.08,y,0.7,0.7); p.rect(8.6,y,0.7,0.7); });
      p.F(M.susp[2]); p.poly([[-12.4,-3],[12,-3],[12.4,1.4],[-12.6,1.4]]); p.F(M.brass[1]); p.rect(4,-2.6,4,3.2);
      p.F(M.glove[1]); p.poly([[-14.6,-1],[-11.4,-1],[-11,7],[-13.4,6],[-14.8,4]]);
      p.id(); },
    tools:{machado}, toolFor:()=> 'machado',
    front:(p,M,sk,P)=>{ if(!P.log) return; const lx=sk.hip.x+40, gy=158;
      p.id(); p.F(M.log[2]); p.poly([[lx-14,gy],[lx+14,gy],[lx+12,gy-14],[lx-12,gy-14]]); p.F(M.ring[1]); p.ell(lx,gy-14,12,3.4); p.F(M.ring[2]); p.ell(lx,gy-14,6,1.6);
      if(P.log===1){ p.F(M.log[1]); p.poly([[lx-7,gy-14],[lx+7,gy-14],[lx+7,gy-36],[lx-7,gy-36]]); p.F(M.ring[1]); p.ell(lx,gy-36,7,2.2); p.F(M.log[2]); p.rect(lx-2,gy-34,0.9,18); }
      else { [[-1,-14],[1,10]].forEach(([s,o])=>{ p.F(M.log[1]); p.poly([[lx+o-4,gy-1],[lx+o+4,gy-1],[lx+o+5+s*4,gy-20],[lx+o-3+s*4,gy-20]]); p.F(M.ring[1]); p.rect(lx+o-1+s*4,gy-20,4,1.6); }); } },
    special:(G)=>({n:6,hits:{3:1},dur:i=>[200,180,160,70,240,320][i],pose:i=>{
      const base=Object.assign({},G,{two:1,log:1,brow:1,lFh:14,lFk:2,lBh:-14,lBk:-20});
      return Object.assign(base,[
        {aFs:40,aFe:70,bat:60,lean:6},
        {aFs:150,aFe:180,bat:30,lean:-8,mouth:3,toolBehindHead:1},
        {aFs:175,aFe:200,bat:20,lean:-12,mouth:3,toolBehindHead:1},
        {aFs:70,aFe:80,bat:30,lean:26,mouth:2,impact:1,log:2,smear:3,sa:200,lFh:24,lFk:8,lBh:-20,lBk:-28},
        {aFs:60,aFe:70,bat:40,lean:24,mouth:1,log:2,lFh:24,lFk:8,lBh:-20,lBk:-28},
        {aFs:20,aFe:40,bat:20,lean:4,happy:1,brow:0,mouth:0,log:2,two:0}][i]); }}),
    FX:{special:{hits:[3],word:'CRAC!',chips:true}, combo:{words:['TCHAC!','TCHAC!','KRAK!']}},
    NAMES:{skin:'Pele',hair:'Barba/cabelo',hat:'Gorro de lã',shirt:'Flanela xadrez',susp:'Suspensório',pants:'Calça de lona',boot:'Botina',wood:'Cabo de nogueira',axe:'Cabeça do machado',log:'Tora'},
  });
})();
