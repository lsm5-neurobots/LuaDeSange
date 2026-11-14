/* ===== PEDREIRA: mestre de obras, colher de pedreiro + marreta ===== */
const PEDREIRA=(function(){
  const {P2,lerp}=PIX;
  const colher={nome:'Colher de pedreiro',len:20,draw(p,M,base,ang){ p.xf(ang,base.x,base.y);
    p.F(M.wood[1]); p.cap(P2(-4,0),P2(4,0),3.2,3); p.F(M.steel[2]); p.rect(4.4,-1.6,1.4,3.2);
    p.F(M.steel[2]); p.cap(P2(5.4,0),P2(8,-2.6),1.2,1.2);
    p.F(M.steel[1]); p.poly([[8,-2.6],[14,-6.4],[21,-2.6],[14,1.4]]); p.F(M.steel[0]); p.rect(11,-4.4,5,0.8);
    p.F(M.mortar[1]); p.poly([[17,-4.2],[21,-2.6],[18.4,-1.6]]); p.id(); }};
  const marreta={nome:'Marreta pequena',len:21,draw(p,M,base,ang){ p.xf(ang,base.x,base.y);
    p.F(M.wood[1]); p.cap(P2(-5,0),P2(18,0),3,3); p.F(M.wood[2]); p.rect(2,-0.6,10,0.8);
    p.F(M.iron[1]); p.poly([[15,-7],[22,-7],[22,7],[15,7]]); p.F(M.iron[0]); p.rect(15.4,-7,6.2,1.4); p.rect(15.4,5.6,6.2,1.4); p.F(M.iron[2]); p.rect(15,-1,0.9,3);
    p.id(); }};
  return RECRUTA_BASE.make({
    FW:150,FH:160,GROUND:152,AX:60, rim:'#a9c8f0',
    sh:{fx:6,fy:-28,bx:-4,by:-29,nx:1,ny:-32},
    rest:{lean:-2,inhand:1,aFs:10,aFe:40,bat:-20,aBs:-6,aBe:4},
    comboName:'Combo de marreta', specialName:'Especial: assentar tijolo',
    mats:()=>({
      shirt:['#d8d4c8','#bdb8ac','#94907e','#5e5a4e'], vest:['#f0a850','#d9862a','#a05e1a','#5e360c'], refl:['#ffffff','#d8dde2','#9aa0a8','#5a6068'],
      pants:['#5a7aa8','#3e5c88','#2a4064','#16243e'], knee:['#4a4a52','#34343a','#222228','#121216'], belt:['#8a5a34','#6a4024','#482a16','#28160a'],
      glove:['#f4f0e4','#e6e0d0','#b0aa98','#6c6858'], dots:['#ff9a5a','#e0702a','#a04a14','#5a2808'], boot:['#b88450','#9a6a38','#704a22','#442a10'], sole:['#4a3a2a','#2e2218','#1e160e','#0e0a06'],
      helmet:['#ffd45a','#f0a81c','#b07410','#6a4206'], hair:['#4a3424','#2a1c14','#1a120c','#0c0806'], elastic:['#ff6a6a','#c9343a','#8a1e22','#4a0a0e'],
      steel:['#f0f4f8','#c4cad0','#8a9098','#50565e'], wood:['#b07a44','#8a5a30','#5e3c1e','#3a2410'], iron:['#a0a4ae','#5a5e66','#3e424a','#22262c'], mortar:['#efe8d8','#cfc6b4','#a09886','#6a6252'],
      tape:['#ffe27a','#f2c230','#b08a14','#6a520a'], pencil:['#ffe27a','#f2c230','#b08a14','#6a520a'], brick:['#d87a4a','#b0552e','#7a361a','#48200e'], flag:['#4ac860','#2a9a3e','#ffd23f','#2a4ab8'],
    }),
    arm:{w1:7.6,w2:7,sleeve:'shirt',sleeveTo:0.55,glove:'glove'},
    leg:{pants:'pants',boot:'boot',sole:'sole',lace:'belt',w1:10,w2:8.4,w3:7.8,cano:0.72,
      extra:(p,M,hip,knee,ankle,front)=>{ if(front){ p.F(M.knee[1]); p.ell(knee.x+1,knee.y,4,4.4); p.F(M.knee[0]); p.rect(knee.x-1,knee.y-3,4,1); } p.F(M.mortar[1]); const c=lerp(knee,ankle,0.6); p.rect(c.x+1,c.y,1.4,1.2); p.rect(c.x-2,c.y+3,1,1); }},
    head:{neck:8.6,
      hair:(p,M,P)=>{ p.F(M.hair[1]); const sw=(P.swing||0)*2+(P.mouth===3?-3:0)+(P.flash?-4:0); p.cap(P2(-7,-14),P2(-12+sw*0.3,-6),6,5); p.cap(P2(-12+sw*0.3,-6),P2(-14+sw,2),5,3); p.F(M.elastic[1]); p.rect(-9.4,-12.6,3,2.4); p.F(M.hair[1]); p.rect(2,-18.4,7,2); p.poly([[-3.6,-15],[-1.4,-15],[-1.2,-9],[-3,-9.4]]); p.F(M.hair[2]); p.rect(-12,-4,1,3); },
      face:(p,M,P)=>{ p.F(M.mortar[2]); p.rect(-1,-11,3,2); p.F(M.pencil[1]); p.poly([[-6.6,-17.4],[-5.4,-17.6],[-4,-10.4],[-5.2,-10.2]]); p.F(M.elastic[0]); p.rect(-6.8,-18,1.3,1.2); },
      hat:(p,M,P)=>{ p.F(M.helmet[1]); p.poly([[-10,-19],[-9,-26],[-1,-30.6],[8,-29.6],[12.4,-24],[12,-19.4]]); p.poly([[9,-20],[20,-18.6],[19,-16.6],[9,-17.6]]); p.poly([[-11,-19.6],[-6,-19.6],[-6,-17.6],[-11.6,-18]]);
        p.F(M.helmet[0]); p.poly([[0,-30.4],[3,-30.4],[3.4,-19.6],[0.4,-19.6]]); p.F(M.helmet[2]); p.rect(-6,-24,2,0.9); p.rect(6,-27,1.6,0.8); p.rect(-2,-21,1.4,0.8);
        p.F(M.flag[0]); p.rect(5,-25,5,4); p.F(M.flag[2]); p.poly([[7.5,-24.6],[9.6,-23],[7.5,-21.4],[5.4,-23]]); p.F(M.flag[3]); p.rect(7,-23.6,1.2,1.2); }},
    drawTorso:(p,M,sk,P)=>{ p.xf(sk.a,sk.hip.x,sk.hip.y);
      p.F(M.shirt[1]); p.poly([[-10,1],[9,1],[9.6,-8],[11,-16],[11.4,-23],[9,-29],[3,-32.4],[-4,-32.4],[-9.6,-28.4],[-11,-19],[-10.4,-8]]);
      p.F(M.shirt[2]); p.rect(-1,-32,5,1);
      p.F(M.vest[1]); p.poly([[-10.6,-1],[-1,-1],[-1,-27],[-4,-31.4],[-9.6,-28.6],[-11.4,-19]]); p.poly([[4,-1],[9.8,-1],[11.6,-16],[11.8,-23],[9.4,-29],[5.6,-30],[4,-24]]);
      p.F(M.refl[1]); p.rect(-11,-18,10,2.6); p.rect(4,-18,7.8,2.6); p.rect(-10.8,-9,9.8,2.6); p.rect(4,-9,6.2,2.6); p.F(M.refl[3]); p.rect(-11,-15.4,10,0.7); p.rect(4,-15.4,7.8,0.7);
      p.F(M.vest[2]); p.rect(5,-26,4.4,4); p.F(M.shirt[0]); p.rect(5.6,-27.6,2.6,2);
      p.F(M.mortar[1]); [[-7,-23],[6,-12],[-4,-5],[8,-4]].forEach(([x,y])=>p.rect(x,y,1.2,1.2));
      p.F(M.belt[1]); p.poly([[-10.8,-3],[9.6,-3],[9.8,1.4],[-11,1.4]]); p.F(M.steel[1]); p.rect(4,-2.6,3,3.2);
      p.F(M.tape[1]); p.rect(6.6,0,5,5); p.F(M.tape[2]); p.rect(7.4,1,3,2.6); p.F(M.steel[0]); p.rect(11.2,2,1.2,1);
      p.id(); },
    behind:(p,M,sk,P)=>{ if(P.inhand && P.tool==='marreta') return; const b=sk.T(-10,2); marreta.draw(p,M,b,Math.PI/2+sk.a+0.25); },
    tools:{colher,marreta}, toolFor:a=>(a==='combo'||a==='guard'||a==='hurt')?'marreta':'colher',
    front:(p,M,sk,P)=>{ if(P.brick){ const h=sk.wrB; p.id(); p.F(M.brick[1]); p.poly([[h.x-2,h.y-5],[h.x+10,h.y-5],[h.x+10,h.y+1],[h.x-2,h.y+1]]); p.F(M.brick[0]); p.rect(h.x-2,h.y-5,12,1); p.F(M.brick[2]); p.rect(h.x+3,h.y-5,0.9,6); }},
    special:(G)=>({n:8,hits:{3:1,6:2},dur:i=>[180,160,170,120,160,170,120,280][i],pose:i=>{
      const base=Object.assign({},G,{lean:28,crouch:12,lFh:40,lFk:-30,lBh:-10,lBk:-50,brow:1,inhand:1,aBs:50,aBe:80});
      return Object.assign(base,[
        {aFs:40,aFe:80,bat:-10},
        {aFs:60,aFe:110,bat:-20,mouth:3},
        {aFs:40,aFe:70,bat:-10,brick:1,backTarget:[22,-6],aBs:70,aBe:100},
        {aFs:70,aFe:120,bat:-60,mouth:2},
        {aFs:60,aFe:110,bat:-20,mouth:3},
        {aFs:40,aFe:70,bat:-10,brick:1,backTarget:[22,-10]},
        {aFs:70,aFe:120,bat:-60,mouth:2},
        {aFs:20,aFe:50,bat:-20,happy:1,brow:0,mouth:0,lean:6,crouch:2,lFh:12,lFk:0,lBh:-8,lBk:-14}][i]); }}),
    FX:{special:{hits:[3,6],word:'TOC!',bricks:true}, combo:{words:['POC!','POC!','BLAM!']}},
    NAMES:{skin:'Pele',hair:'Cabelo',helmet:'Capacete',vest:'Colete refletivo',refl:'Faixa refletiva',shirt:'Camiseta mescla',pants:'Jeans',glove:'Luva pigmentada',boot:'Botina',steel:'Colher (aço)',iron:'Marreta',brick:'Tijolo'},
  });
})();
