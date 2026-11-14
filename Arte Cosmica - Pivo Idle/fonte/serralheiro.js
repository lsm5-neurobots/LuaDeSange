/* ===== SERRALHEIRO: recruta ferreiro, martelo de forja ===== */
const SERRALHEIRO=(function(){
  const {ramp,P2,lerp}=PIX;
  const hammer={nome:'Martelo de forja',len:21,draw(p,M,base,ang){ p.xf(ang,base.x,base.y);
    p.F(M.wood[1]); p.cap(P2(-5,0),P2(19,0),3.2,3.2); p.F(M.wood[2]); p.rect(2,-0.6,10,0.8);
    p.F(M.tape[1]); p.rect(-2.6,-1.8,4,3.6);
    p.F(M.iron[1]); p.poly([[16,-4.6],[22,-4.6],[22.4,4.6],[16,4.6]]); p.poly([[17,-4.6],[21,-4.6],[20.4,-8],[17.6,-8]]);
    p.F(M.iron[0]); p.rect(16.4,3,5.6,1.6); p.F(M.iron[2]); p.rect(16,-1,0.9,4);
    p.id(); }};
  const ANVIL=(p,M,sk,P)=>{ if(!P.anvil) return; const ax=sk.hip.x+32, gy=118;
      p.id(); p.F(M.wood[1]); p.poly([[ax-10,152],[ax+9,152],[ax+8,gy],[ax-9,gy]]); p.F(M.wood[2]); p.rect(ax-9,gy,17,1.6); p.rect(ax-4,gy+4,0.9,20); p.rect(ax+3,gy+6,0.9,18); p.F(M.anvil[1]); p.poly([[ax-12,gy],[ax+10,gy],[ax+7,gy-6],[ax+4,gy-12],[ax-6,gy-12],[ax-9,gy-6]]);
      p.poly([[ax-16,gy-19],[ax+14,gy-19],[ax+24,gy-16],[ax+14,gy-13.6],[ax-14,gy-13.6]]); p.F(M.anvil[0]); p.rect(ax-15,gy-19,28,1.4);
      // tenaz + barra em brasa na mão de trás
      const h=sk.wrB, tx=ax+2, ty=gy-21; p.F(M.iron[2]); p.cap(h,P2(tx,ty),1.6,1.4); p.cap(P2(h.x,h.y+1.6),P2(tx,ty+0.8),1.4,1.2);
      p.F(M.ember[P.glow?0:1]); p.cap(P2(tx-4,ty+0.4),P2(tx+10,ty+0.4),2.6,2.4); p.F(M.ember[2]); p.rect(tx-4,ty+1,14,0.8); };
  return RECRUTA_BASE.make({
    FW:150,FH:160,GROUND:152,AX:60, rim:'#a9c8f0',
    sh:{fx:7,fy:-29,bx:-5,by:-30,nx:1,ny:-33},
    rest:{lean:2,aFs:6,aFe:12,aBs:-10,aBe:4},
    comboName:'Combo de marteladas', specialName:'Especial: martelar na bigorna',
    mats:()=>({
      shirt:['#7a8a98','#5b6b7a','#45515f','#2a323e'], pants:['#7a8a98','#5b6b7a','#45515f','#2a323e'], patch:['#9aaab4','#7a8a96','#5a6874','#3a4450'],
      apron:['#9a6a40','#7a4a2a','#5a3420','#3a2014'], stitch:['#e8c890','#c8a070','#9a7a50','#6a5230'], burn:['#e08a3a','#2a1810','#1a0e08','#0e0604'],
      glove:['#d4bc92','#b39a72','#8a7454','#5a4a34'], boot:['#5a4030','#3a2618','#2a1a10','#160c06'], sole:['#4a3a30','#2a2018','#1a140e','#0e0a06'], steel:['#d0d4dc','#9a9ea8','#6a6e78','#40444c'],
      hair:['#5a4a3e','#2e2420','#1c1614','#0e0a08'], lens:['#6ab07a','#2a5a3a','#1a3a24','#0e2014'], brass:['#e8c060','#b08a3a','#7a5e20','#4a380e'], strap:['#3a3a42','#1a1a20','#101014','#060608'],
      iron:['#c8ccd6','#6a6e78','#484c56','#2a2e36'], wood:['#b07a44','#8a5a30','#5e3c1e','#3a2410'], tape:['#4a4a52','#18181c','#101012','#060608'], pencil:['#ff6a5a','#c83a2a','#8a1e14','#4a0e08'],
      soot:['#6a6a72','#4a4a52','#34343c','#1e1e24'], ember:['#fff2a0','#ffa030','#e04a10','#8a1e04'], anvil:['#6a6e7a','#3a3e48','#262a32','#14161c'], rag:['#ffffff','#e8e4d8','#b0aa98','#6c6858'],
    }),
    arm:{w1:9.6,w2:9.4,sleeve:'shirt',sleeveTo:0.8,roll:true,glove:'glove'},
    leg:{pants:'pants',boot:'boot',sole:'sole',patch:'patch',toe:'steel',w1:11,w2:9.4,w3:9},
    head:{neck:10,noseTip:true,
      hair:(p,M,P)=>{ p.F(M.hair[1]); p.poly([[-8,-19],[-3,-23.4],[4,-23.6],[9,-21],[10,-18.6],[-8.6,-16]]); p.poly([[-8.4,-17],[-4,-17],[-3,-10.4],[-7.6,-11]]); [[-2,-23],[1,-24.2],[4,-23.6]].forEach(([x,y])=>p.poly([[x,y],[x+1.6,y-3],[x+2.4,y+0.4]])); p.F(M.hair[2]); [[-5,-20],[0,-21.4],[5,-20.6]].forEach(([x,y])=>p.rect(x,y,1,1)); },
      face:(p,M,P)=>{ p.F(M.hair[1]); p.poly([[6.4,-9.6],[13.6,-10],[14,-7.4],[10,-8],[6.6,-7]]); p.F(M.hair[2]); [[3,-3],[5,-2.4],[8,-2.4],[10.4,-3.6],[2,-5]].forEach(([x,y])=>p.rect(x,y,0.9,0.9)); p.F(M.soot[1]); p.rect(-1,-11,3,2); p.rect(4,-19.8,4,0.8); p.F(M.pencil[1]); p.poly([[-6.8,-16.6],[-5.6,-17],[-3.6,-10.8],[-4.8,-10.4]]); },
      hat:(p,M,P)=>{ p.F(M.strap[1]); p.poly([[-9.6,-19.6],[11,-21],[11,-19.4],[-9.4,-18]]); p.F(M.brass[1]); p.ell(4,-21.6,4.4,3.6); p.ell(9.8,-22,3.4,3); p.F(M.lens[1]); p.ell(4,-21.6,3.2,2.6); p.ell(9.8,-22,2.4,2.1); p.F(M.lens[0]); p.rect(2.6,-23,1.2,0.9); p.rect(9,-23.2,1,0.8); }},
    drawTorso:(p,M,sk,P)=>{ p.xf(sk.a,sk.hip.x,sk.hip.y);
      p.F(M.shirt[1]); p.poly([[-12,1],[11,1],[12,-8],[14,-17],[14.4,-24],[11,-30.4],[4,-34],[-5,-34],[-11.6,-29.6],[-13.4,-19],[-12.6,-8]]);
      p.F(M.shirt[0]); p.poly([[-1,-34],[4,-35],[6,-30],[2.6,-29.2]]);
      p.F(M.apron[1]); p.poly([[-3,-26],[11,-27],[12.4,-12],[13,1.4],[-9.6,1.4],[-8.4,-12]]);
      p.F(M.apron[2]); p.rect(-3,-26.8,1.2,28); p.F(M.apron[1]); p.cap(P2(-2,-26),P2(0,-33),2,2); p.cap(P2(10,-27),P2(6,-33),2,2);
      p.F(M.stitch[1]); p.rect(-2,-25,0.7,24); p.rect(11,-25,0.7,24); p.rect(-2,-25.6,13,0.7);
      p.F(M.brass[1]); [[-1.6,-24.6],[9.6,-25],[-1.6,-1],[10,-1]].forEach(([x,y])=>p.rect(x,y,1.4,1.4));
      p.F(M.burn[1]); [[2,-21],[7,-17],[4,-11],[9,-8],[0,-6]].forEach(([x,y])=>{ p.rect(x,y,1.4,1.2); }); p.F(M.burn[0]); [[2,-22],[7,-18],[4,-12]].forEach(([x,y])=>p.rect(x+1.4,y,0.7,0.7));
      p.F(M.apron[2]); p.rect(2,-7,7,6); p.F(M.iron[2]); p.poly([[3,-7],[4.4,-7],[5,-12],[3.6,-12]]); p.poly([[5.4,-7],[6.8,-7],[7.8,-11.6],[6.6,-12]]); p.F(M.rag[1]); p.poly([[8,-4],[10.6,-4],[10,1],[8.6,2.6]]);
      p.F(M.apron[2]); p.rect(-12,-3.6,24,2);
      p.id(); },
    overLegs:(p,M,sk,P)=>{ p.xf(sk.a,sk.hip.x,sk.hip.y); const sw=(P.swing||0)*1.4;
      p.F(M.apron[1]); p.poly([[-9.6,0],[13,0],[15+sw,22],[-8+sw,23]]);
      p.F(M.stitch[1]); p.rect(-8+sw,21.4,22,0.7); p.F(M.apron[2]); p.rect(2,2,1,20);
      p.F(M.burn[1]); [[6,8],[0,14],[10,17]].forEach(([x,y])=>p.rect(x+sw*0.5,y,1.4,1.2));
      p.id(); if(P.anvil) ANVIL(p,M,sk,P); },
    tools:{martelo:hammer}, toolFor:()=> 'martelo',
    toolRest:(p,M,sk,P,t)=>{ const b=sk.T(14,4); hammer.draw(p,M,b,Math.PI/2+sk.a-0.1+(P.swing||0)*0.15); },
special:(G)=>({n:8,hits:{2:1,4:2,6:3},dur:i=>[180,140,80,140,80,140,90,260][i],pose:i=>{
      const base=Object.assign({},G,{anvil:1,backTarget:[16,-8],lean:26,crouch:3,lFh:14,lFk:2,lBh:-14,lBk:-20,brow:1});
      const up={aFs:130,aFe:160,bat:30,mouth:3}, dn={aFs:52,aFe:84,bat:10,mouth:2,glow:1};
      return Object.assign(base,[{aFs:60,aFe:100,bat:20},up,dn,up,dn,up,dn,{aFs:40,aFe:80,bat:40,happy:1,brow:0,mouth:0}][i]); }}),
    FX:{special:{hits:[2,4,6],word:'TINK!',sparks:'#ffb040'}, combo:{words:['TUNG!','TUNG!','BLAM!']}},
    NAMES:{skin:'Pele',hair:'Cabelo/bigode',shirt:'Macacão',apron:'Avental de couro',glove:'Luva de raspa',boot:'Botina',lens:'Óculos de solda',iron:'Ferro do martelo',wood:'Cabo',ember:'Brasa',anvil:'Bigorna'},
  });
})();
