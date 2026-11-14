/* ERVEIRA — fonte de arte (editável). Build: npm run art
   Mini boss do Ver-o-Peso "A Erveira": vendedora de ervas, raízes e garrafadas da feira, tomada pela Lua de Sangue.
   Mulher de meia-idade de ombros largos, bata clara, saia comprida e avental de feira, lenço colorido na cabeça,
   tranças que viram cipós; raízes brotam de dentro da saia, folhas e flores murchas pelo corpo; cesto de palha
   nas costas cheio de ervas; garrafadas e frascos pendurados na cintura em barbante; colar de sementes; cajado
   de galho torto com maço de ervas. Pele esverdeada com seiva preta escorrendo, olhos de brasa verde.
   Fúria: floresce — flores vermelhas grandes abrem nos ombros e as raízes se multiplicam. Papel de ofício, sem
   referência religiosa. Adereços: garrafada voando e raízes brotando do chão. */
const ERVEIRA=(function(){
  const {rad,lp,lerp,P2}=PIX;
  const K_=BOSSKIT, {S,C,PI,mass,platePoly,clipPoly,band,bandA,ellPts,arc,bez,bez3,limb,fold,stitches,rivets,rnd,stain,flames,dust,sparks,puffs}=K_;
  const FW=340, FH=250, GROUND=240, AX=156;
  const RIM={normal:'#e6ffd0', furia:'#ffb0c0'};

  function mats0(form){
    const m={
      bata:['#fffaea','#e6dec6','#aaa092','#5e5666'],
      skirt:['#f0a070','#c2603c','#7e3630','#441c22'],
      apron:['#f4ead0','#c8b896','#8a7a6c','#4a4050'],
      scarf:['#ffd080','#e88a2c','#a24a22','#5a2418'],
      dots:['#fff6d8','#f4e2b0','#b8a070','#6a5638'],
      skin:['#c8dca8','#88a47a','#526a5a','#2a3840'],
      sap:['#5a4a50','#30262e','#1c161c','#0e0a10'],
      leaf:['#b8f08a','#4a9a50','#2a6236','#14341e'],
      root:['#c8a070','#8a6038','#583c28','#2e2018'],
      straw:['#fff0b0','#d8b258','#987636','#523e1c'],
      wood:['#d8a868','#9a6c3c','#62442a','#36261a'],
      glass:['#e8fff6','#9cd8c4','#5a9a8e','#2e5458'],
      lgreen:['#f0ffc0','#9ae040','#4c9a1c','#24500e'],
      lpink:['#fff0f8','#ff9ac8','#d24a8a','#7a1e4c'],
      seed:['#f4d2a0','#b4784a','#704630','#3a2218'],
      flower:['#ffd0d8','#e4506a','#a42444','#5a1028'],
      mouth:['#4c2a30','#2e1820','#1c0e14','#10070c'],
      blood:['#4a5a3a','#30402a','#1e2a1c','#10180e'],
      eye:['#ffffff','#e4ffb0','#7ee040','#2e7a10'],
      fx:['#fffef2','#f6ffc0','#c8f070','#6aa82a'],
      glow:['#fff6fa','#ffc6dc','#ff7eaa','#d23c74'],
      dust:['#eadecd','#c6b6a0','#968671','#605448'],
    };
    if(form==='furia'){
      m.skin=['#d0d8a0','#98a070','#5e6450','#30343a'];
      m.eye=['#ffffff','#ffe0c0','#ff6a5a','#b01c28'];
      m.leaf=['#d8f090','#78a440','#486a2a','#243818'];
      m.root=['#d89a70','#9a5a38','#663428','#361a16'];
    }
    return K_.finish(m,['fx','dust','eye','lgreen','lpink','glow']);
  }
  const NAMES={bata:'Bata clara',skirt:'Saia comprida',apron:'Avental de feira',scarf:'Lenço',dots:'Bolinhas do lenço',skin:'Pele esverdeada',sap:'Seiva preta',
    leaf:'Folha',root:'Raiz',straw:'Palha do cesto',wood:'Cajado',glass:'Vidro do frasco',lgreen:'Garrafada verde (veneno)',lpink:'Garrafada rosa (cura)',seed:'Colar de sementes',flower:'Flor (fúria)',eye:'Olho de brasa'};

  /* ---------------- poses ----------------
     stf: cajado na mão da frente (ângulo extra stA) · btl: frasco na mão de trás (1 verde, 2 rosa) · drink: bebe ·
     bloom: flores da fúria abrindo · roots: raízes do chão (0..1) · sink: abaixada atrás da banca (intro) · dry: raízes secas */
  const REST={hx:0,drop:3,lean:2,head:0,aFs:20,aFe:10,aBs:-12,aBe:20,lFh:10,lFk:-4,lBh:-8,lBk:-20,fF:0,fB:0,
    stA:0,btl:0,drink:0,bloom:0,roots:0,sink:0,dry:0,basketOff:0,roar:0,flash:0,smear:0,impact:0,dead:0,ph:0,sway:0};
  const ANIMS={
    idle:{nome:'Parado (folhas balançam, mexe num frasco)',n:8,dur:()=>165,pose:i=>{ const p=i/8*PI*2, s=S(p);
      return {lean:2+1.4*s, drop:3+1.4*S(p-0.5), head:-2+3*S(p-0.9), aFs:20+3*S(p-0.4), aFe:10+3*S(p-0.9), aBs:20+8*S(p+0.5), aBe:100+10*S(p), btl:1, sway:S(p-1.2), ph:p}; }},
    walk:{nome:'Andar (passos arrastados, raízes atrás)',n:8,dur:()=>155,pose:i=>{ const p=i/8*PI*2+PI/2;
      const lFh=8+18*S(p), lBh=-6+18*S(p+PI);
      return {lFh, lFk:lFh-20*Math.max(0,C(p))-4, lBh, lBk:lBh-20*Math.max(0,C(p+PI))-8, fF:-5*C(p), fB:-5*C(p+PI),
        drop:4+2.4*C(2*(p-PI/2)), lean:6+2*S(2*p), head:1+2*S(2*p-1), hx:1.2*S(2*p),
        aFs:20-8*S(p), aFe:10-6*S(p), stA:-6*S(p), aBs:-10+18*S(p), aBe:16+12*S(p), sway:1.6*S(p+1.2), ph:2*p}; }},
    bottle:{nome:'Garrafada (arremessa frasco)',n:9,warn:[1,2,3],tossAt:4,dur:i=>[150,150,150,140,80,160,160,160,150][i],pose:i=>[
      {lean:4,head:2,aBs:20,aBe:90,btl:1},
      {lean:-6,head:-8,aBs:-150,aBe:-120,btl:1,lFh:16,lBh:-14},
      {lean:-10,head:-12,aBs:-176,aBe:-160,btl:1,roar:1,lFh:18,lBh:-16},
      {lean:-12,head:-14,aBs:-184,aBe:-170,btl:1,roar:1,lFh:18,lBh:-16},
      {lean:12,head:6,hx:5,aBs:110,aBe:96,btl:0,smear:1,lFh:26,lFk:2,lBh:-20,lBk:-28},
      {lean:14,head:8,hx:5,aBs:80,aBe:60,btl:0,lFh:26,lFk:2,lBh:-20,lBk:-28},
      {lean:6,head:2,aBs:20,aBe:30,btl:0},
      {lean:4,head:0,aBs:10,aBe:70,btl:1},
      {lean:2,head:0,aBs:20,aBe:100,btl:1}][i]},
    roots:{nome:'Raízes (bate o cajado no chão)',n:10,warn:[1,2,3,4],hit:5,dur:i=>[150,150,160,160,120,80,170,180,170,160][i],pose:i=>[
      {lean:6,head:4,aFs:40,aFe:20,stA:0},
      {lean:-8,head:-10,aFs:160,aFe:170,stA:-10,aBs:-40,aBe:-20,lFh:16,lBh:-14},
      {lean:-12,head:-14,aFs:172,aFe:180,stA:-14,aBs:-60,aBe:-40,roar:1,lFh:18,lBh:-16},
      {lean:-12,head:-16,aFs:174,aFe:182,stA:-14,aBs:-62,aBe:-42,roar:1,lFh:18,lBh:-16},
      {lean:6,head:0,aFs:110,aFe:90,stA:0,smear:1,lFh:24,lBh:-20},
      {lean:18,head:10,drop:6,aFs:60,aFe:20,stA:10,impact:1,roots:1,lFh:30,lFk:-14,lBh:-18,lBk:-46},
      {lean:20,head:12,drop:6,aFs:58,aFe:18,stA:10,roots:1,lFh:30,lFk:-14,lBh:-18,lBk:-46},
      {lean:16,head:10,drop:5,aFs:50,aFe:20,stA:6,roots:0.7},
      {lean:8,head:4,aFs:30,aFe:14,roots:0.3},
      {lean:2,head:0,aFs:20,aFe:10}][i]},
    tea:{nome:'Chá (bebe uma garrafada e cura)',n:10,healAt:6,dur:i=>[160,170,180,180,180,180,160,180,180,170][i],pose:i=>[
      {lean:4,head:4,aBs:20,aBe:100,btl:2},
      {lean:0,head:-4,aBs:60,aBe:150,btl:2},
      {lean:-8,head:-20,aBs:100,aBe:180,btl:2,drink:1},
      {lean:-12,head:-30,aBs:110,aBe:190,btl:2,drink:1},
      {lean:-14,head:-34,aBs:112,aBe:194,btl:2,drink:1},
      {lean:-14,head:-34,aBs:112,aBe:194,btl:2,drink:1},
      {lean:-4,head:-10,aBs:40,aBe:80,btl:2,roar:1,smear:1},
      {lean:0,head:-6,aBs:20,aBe:60,btl:0,roar:1},
      {lean:2,head:0,aBs:10,aBe:60,btl:0},
      {lean:2,head:0,aBs:20,aBe:100,btl:1}][i]},
    staff:{nome:'Cajado (estocada)',n:7,warn:[1],hit:3,dur:i=>[120,150,90,90,160,160,150][i],pose:i=>[
      {lean:-4,head:-2,aFs:-20,aFe:-40,stA:-50},
      {lean:-8,head:-6,hx:-3,aFs:-40,aFe:-60,stA:-70,lFh:14,lBh:-16},
      {lean:12,head:4,hx:4,aFs:80,aFe:90,stA:-90,smear:1,lFh:26,lFk:2,lBh:-20,lBk:-28},
      {lean:16,head:6,hx:6,aFs:90,aFe:94,stA:-92,lFh:28,lFk:4,lBh:-22,lBk:-30},
      {lean:12,head:4,hx:4,aFs:84,aFe:90,stA:-90},
      {lean:6,head:2,aFs:40,aFe:30,stA:-20},
      {lean:2,head:0,aFs:20,aFe:10,stA:0}][i]},
    summon:{nome:'Chamado (raízes levantam mortos)',n:9,callAt:5,dur:i=>[160,170,170,170,170,120,200,180,160][i],pose:i=>[
      {lean:4,head:4,aFs:30,aFe:20},
      {lean:-8,head:-14,aFs:150,aFe:160,aBs:-150,aBe:-160,roar:1},
      {lean:-10,head:-18,aFs:160,aFe:170,aBs:-160,aBe:-170,roar:1},
      {lean:-10,head:-18,aFs:160,aFe:170,aBs:-160,aBe:-170,roar:1,hx:1},
      {lean:8,head:4,aFs:100,aFe:80,aBs:-100,aBe:-80,smear:1},
      {lean:20,head:12,drop:6,aFs:60,aFe:20,stA:10,aBs:-40,aBe:-20,roots:1,impact:1,lFh:30,lFk:-14,lBh:-18,lBk:-46},
      {lean:18,head:10,drop:6,aFs:58,aFe:18,stA:10,roots:1},
      {lean:8,head:4,aFs:30,aFe:14,roots:0.5},
      {lean:2,head:0,aFs:20,aFe:10}][i]},
    rage:{nome:'Entrar em fúria (floresce)',n:8,dur:i=>[170,140,140,180,200,200,200,180][i],pose:i=>[
      {lean:16,head:18,aFs:30,aFe:100,aBs:20,aBe:110,drop:4,bloom:0},
      {lean:18,head:22,aFs:34,aFe:106,aBs:24,aBe:116,drop:6,hx:-1,bloom:0.2},
      {lean:-8,head:-16,aFs:120,aFe:130,aBs:-110,aBe:-120,roar:1,bloom:0.5,roots:0.5},
      {lean:-14,head:-24,aFs:136,aFe:146,aBs:-124,aBe:-134,roar:1,bloom:0.8,roots:1},
      {lean:-16,head:-26,aFs:140,aFe:150,aBs:-128,aBe:-138,roar:1,bloom:1,roots:1,hx:-2},
      {lean:-16,head:-26,aFs:140,aFe:150,aBs:-128,aBe:-138,roar:1,bloom:1,roots:1,hx:2},
      {lean:-10,head:-20,aFs:120,aFe:130,aBs:-110,aBe:-120,roar:1,bloom:1,roots:0.5},
      {lean:2,head:0,bloom:1}][i]},
    hurt:{nome:'Dano',n:4,dur:i=>[80,110,130,160][i],pose:i=>[
      {flash:1,lean:-14,head:-20,hx:-6,aFs:-10,aFe:-20,aBs:-40,aBe:-30,roar:1},
      {lean:-10,head:-14,hx:-4,aFs:0,aFe:-10,aBs:-26,aBe:-16,roar:1},
      {lean:-2,head:-4,hx:-1,aFs:14,aFe:6},
      {}][i]},
    intro:{nome:'Entrada (WARNING): levanta de trás da banca com o cesto',n:10,dur:i=>[300,220,180,180,180,200,220,240,240,220][i],pose:i=>[
      {sink:1,lean:30,head:30,drop:40,lFh:70,lFk:-60,lBh:40,lBk:-80,aFs:60,aFe:40},
      {sink:1,lean:24,head:20,drop:30,lFh:60,lFk:-50,lBh:30,lBk:-70,aFs:70,aFe:50},
      {sink:0.7,lean:16,head:10,drop:16,lFh:40,lFk:-30,lBh:10,lBk:-50,aFs:60,aFe:40},
      {sink:0.4,lean:8,head:0,drop:6,lFh:20,lFk:-14,lBh:-4,lBk:-30,aFs:40,aFe:20},
      {sink:0.1,lean:2,head:-4,aFs:30,aFe:10},
      {lean:-8,head:-16,aFs:150,aFe:160,aBs:-130,aBe:-140,roar:1,roots:0.6},
      {lean:-12,head:-20,aFs:160,aFe:170,aBs:-140,aBe:-150,roar:1,roots:1},
      {lean:-12,head:-20,aFs:160,aFe:170,aBs:-140,aBe:-150,roar:1,roots:1,hx:1},
      {lean:0,head:-4,aFs:40,aFe:20,roots:0.4},
      {lean:2,head:0}][i]},
    death:{nome:'Morte (desaba, raízes secam, cesto cai)',n:12,dur:i=>[90,150,170,180,180,170,170,180,200,220,400,700][i],pose:i=>{
      const lie={lean:-90,head:-6,hx:24,aFs:-80,aFe:-96,aBs:-70,aBe:-90,lFh:86,lFk:82,lBh:80,lBk:76,basketOff:1,dry:1};
      return [
        {flash:1,lean:-14,head:-22,hx:-6,aFs:-10,aFe:-20,roar:1},
        {lean:-18,head:-28,hx:-8,aFs:130,aFe:140,aBs:-110,aBe:-120,roar:1,roots:0.6},
        {lean:10,head:20,hx:-4,aFs:20,aFe:10,roots:0.4,dry:0.5},
        {lean:16,head:26,drop:10,lFh:50,lFk:-40,lBh:-8,lBk:-70,aFs:10,aFe:0,dry:1},
        {lean:18,head:30,drop:22,lFh:76,lFk:-10,lBh:18,lBk:-84,aFs:10,aFe:0,dry:1},
        {lean:-30,head:0,hx:8,lFh:60,lFk:40,lBh:40,lBk:30,aFs:120,aFe:140,aBs:110,aBe:130,dry:1,basketOff:1},
        Object.assign({},lie,{impact:1}),
        Object.assign({},lie,{}),
        Object.assign({},lie,{dead:0.3}),
        Object.assign({},lie,{dead:0.5}),
        Object.assign({},lie,{dead:0.7}),
        Object.assign({},lie,{dead:1})][i]; }},
    xBottle:{nome:'Garrafada voando',n:2,prop:true,dur:()=>90,pose:i=>({st:i})},
    xRoots:{nome:'Raízes brotando (broto, cheio, seco)',n:3,prop:true,dur:()=>160,pose:i=>({st:2+i})},
  };
  function fix(P,anim,i){ if(!(anim==='death'&&i>=6)){ P.lean+=6; P.head-=3; } }

  const RG=K_.rig({AX,GROUND,THI:32,SHN:30,UPA:32,FOA:30,hipW:10,neck:[10,-82],shF:[16,-74],shB:[-14,-76],HS:1.05,FT:9,FL:20,
    contacts:(b,P)=>[b.T(-24,-40).y+2,b.T(-20,-80).y+2,b.H(-6,-30).y+2,b.kneeF.y+8,b.kneeB.y+8]});

  /* ---------------- adereços ---------------- */
  function drawFlask(p,M,at,ang,kind,sz=1){
    p.xf(ang,at.x,at.y); if(sz!==1) BOSSKIT.st.CTX.scale(sz,sz); const G=M.glass, L=kind===2?M.lpink:M.lgreen;
    p.F(G[2]); p.ell(0,4,6,7); p.rect(-2.4,-8,4.8,8); p.F(G[1]); p.ell(-0.6,3.4,5,6);
    p.F(L[2]); p.ell(0,6,5,4.4); p.F(L[1]); p.ell(-1,5,3,2.4); p.F(L[0]); p.rect(-2,4,1.4,1);
    p.F(G[0]); p.rect(-4,0,1.4,5); p.F(M.wood[1]); p.rect(-2.4,-11,4.8,3.4); p.F(M.wood[0]); p.rect(-2,-11,2,1);
    p.F(M.straw[2]); p.rect(-3,-7,6,1.4);
  }
  function rootLine(p,M,a,b,w,seed,dry){ const R=dry?M.dust:M.root; const m=P2((a.x+b.x)/2+(rnd(seed,1)-0.5)*16,(a.y+b.y)/2+(rnd(seed,2)-0.5)*10);
    const pts=bez(a,m,b,6); for(let k=0;k<pts.length-1;k++){ const ww=w*(1-k/pts.length*0.8); p.F(R[2]); p.cap(pts[k],pts[k+1],ww+1,ww*0.8+1); }
    p.F(R[1]); for(let k=0;k<pts.length-2;k++){ const ww=w*(1-k/pts.length*0.8); p.cap(P2(pts[k].x-0.4,pts[k].y-0.6),P2(pts[k+1].x-0.4,pts[k+1].y-0.6),ww*0.5,ww*0.4); }
    p.F(R[0]); p.rect(pts[1].x-0.5,pts[1].y-1,1,1); return pts; }
  function leaf(p,M,x,y,a,s=1){ const L=M.leaf; p.xf(a,x,y); p.F(L[2]); p.poly([[0,0],[5*s,-3*s],[11*s,0],[5*s,3*s]]); p.F(L[1]); p.poly([[1,0],[5*s,-2.2*s],[9*s,-0.4*s],[5*s,0.4*s]]); p.F(L[3]); p.rect(1,0,9*s,0.8); p.id(); }
  function flower(p,M,x,y,s){ if(s<0.1) return; const F=M.flower; for(let k=0;k<5;k++){ const a=k/5*PI*2+0.3; p.F(F[2]); p.ell(x+C(a)*5*s,y+S(a)*5*s,4*s,3*s,a); p.F(F[1]); p.ell(x+C(a)*4.4*s,y+S(a)*4.4*s-0.6,2.6*s,1.8*s,a); }
    p.F(M.straw[1]); p.circle(P2(x,y),2.2*s); p.F(M.straw[0]); p.rect(x-1,y-1,1,1); }
  // flor grande da fúria: 6 pétalas em camadas (sombra, meio, luz e nervura), miolo amarelo brilhando com estames
  function bigFlower(p,M,x,y,s,rot){ if(s<0.1) return; const F=M.flower, Fq=K_.qOf(F), n=6;
    for(let k=0;k<n;k++){ const a=rot+k/n*PI*2, px=x+C(a)*5.4*s, py=y+S(a)*4.6*s; p.F(F[3]); p.ell(px+0.5,py+0.6,4.8*s,3.3*s,a); }
    for(let k=0;k<n;k++){ const a=rot+k/n*PI*2, px=x+C(a)*5.4*s, py=y+S(a)*4.6*s, lit=S(a)<0.2&&C(a)>-0.6;
      p.F(F[2]); p.ell(px,py,4.4*s,3*s,a); p.F(lit?F[1]:Fq[1]); p.ell(px-C(a)*0.6*s,py-S(a)*0.6*s-0.4,3.2*s,2*s,a);
      if(lit){ p.F(F[0]); p.ell(px+C(a)*0.8*s,py+S(a)*0.6*s-0.8,1.6*s,0.9*s,a); }
      p.F(F[3]); p.cap(P2(x+C(a)*2.2*s,y+S(a)*1.9*s),P2(x+C(a)*7*s,y+S(a)*6*s),0.8,0.5); }
    p.F(M.straw[3]); p.circle(P2(x,y),2.8*s); p.F(M.glow[2]); p.circle(P2(x,y),2.2*s); p.F(M.fx[1]); p.circle(P2(x-0.4,y-0.4),1.4*s); p.F(M.fx[0]); p.rect(x-0.8,y-1,1.2,1.2);
    p.F(M.straw[1]); for(let k=0;k<5;k++){ const a=rot+0.5+k/5*PI*2; p.rect(x+C(a)*3.2*s-0.5,y+S(a)*2.8*s-0.5,1.1,1.1); } }
  function bloomSpots(sk,P,fur){ const s=fur?Math.max(0.6,P.bloom||1):P.bloom;
    return [[sk.T(18,-78),1.5*s,0.2],[sk.T(-12,-80),1.3*s,1.1],[sk.T(28,-58),1.05*s,0.6],[sk.H(-10,-30),0.95*s,2.0],[sk.T(-24,2),0.9*s,1.5]]; }
  // brilho da flor (halo rosado + cintilância), atrás da flor e sem contorno de sombra
  function drawBloomGlow(p,M,sk,P,fur){ p.id(); const G=M.glow, pul=1+0.12*S((P.ph||0)*2+(P.t||0));
    bloomSpots(sk,P,fur).forEach(([q,s],k)=>{ if(s<0.1) return; p.F(G[3]); p.circle(q,14*s*pul); p.F(G[2]); p.circle(q,11.8*s*pul); p.F(G[1]); p.circle(q,10.2*s*pul);
      p.F(G[1]); [0,1,2,3].forEach(j=>{ const a=j*PI/2+0.4+k, r=15*s*pul; p.cap(P2(q.x+C(a)*r*0.7,q.y+S(a)*r*0.7),P2(q.x+C(a)*r*1.25,q.y+S(a)*r*1.25),1.6,0.4); }); }); }
  function drawBlooms(p,M,sk,P,fur){ p.id(); bloomSpots(sk,P,fur).forEach(([q,s,r])=>{ leaf(p,M,q.x-4*s,q.y+3*s,2.4+r,1.1*s); leaf(p,M,q.x+3*s,q.y+4*s,0.6+r,0.9*s); bigFlower(p,M,q.x,q.y,s,r); });
    const G=M.glow; p.F(G[0]); bloomSpots(sk,P,fur).forEach(([q,s],k)=>{ if(s<0.3) return; const x=q.x+(k%2?10:-9)*s, y=q.y-8*s; p.rect(x-0.5,y-2,1,4); p.rect(x-2,y-0.5,4,1); }); }
  function groundRoots(p,M,x,P,seed,k0=1){ const n=Math.round(3+k0*3);
    for(let k=0;k<n;k++){ const dx=(rnd(seed,k)-0.5)*60, h=(20+rnd(seed,k+5)*26)*P.roots; if(h<3) continue; const a=P2(x+dx,GROUND-1), b=P2(x+dx+(rnd(seed,k+9)-0.5)*20,GROUND-h);
      const pts=rootLine(p,M,a,b,5,seed+k,P.dry>0.5); if(!P.dry&&k%2===0) leaf(p,M,pts[3].x,pts[3].y,-1+k*0.4,0.8); }
    p.F(M.dust[2]); p.ell(x,GROUND-1,34*P.roots,4); }

  /* ---------------- membros ---------------- */
  function drawUpper(p,M,sh,el,front,P){
    const {ang,L}=limb(p,sh,el), R=M.bata;
    p.F(R[2]); p.cap(P2(0,0),P2(L,0),22,17); mass(p,R,L*0.45,-2,13,9,ang,0.8); mass(p,R,0,0,13,12,ang,0.8);
    fold(p,R,[[L*0.6,-8],[L*0.66,-1],[L*0.6,6]],1.2);
    p.F(R[1]); p.cap(P2(L*0.86,-10),P2(L*0.86,10),4,4); p.F(R[3]); [-8,-3,2,7].forEach(y=>p.rect(L*0.9,y,1.4,1.4));
    if(front){ p.F(M.leaf[2]); leaf(p,M,0,0,0,0); }
  }
  function drawFore(p,M,el,wr,front,P){
    const {ang,L}=limb(p,el,wr), Sk=M.skin;
    p.F(Sk[2]); p.cap(P2(0,0),P2(L,0),15,12); mass(p,Sk,L*0.4,-2,9,6,ang,0.7);
    p.F(M.sap[2]); bandA(p,[[L*0.3,4],[L*0.5,6],[L*0.52,9]],1.2);
    // pulseira de sementes e raiz enrolada
    p.F(M.seed[2]); [-4,0,4].forEach(y=>p.circle(P2(L*0.8,y),1.6)); p.F(M.seed[0]); [-4,0,4].forEach(y=>p.rect(L*0.8-0.6,y-1,1,1));
    p.F(M.root[2]); p.cap(P2(L*0.3,-7),P2(L*0.42,7),2.2,2);
  }
  function drawHand(p,M,wr,ang,grip){
    p.xf(ang,wr.x,wr.y); const R=M.skin;
    p.F(R[2]); p.ell(4,0,7,7); mass(p,R,4,-1,6.4,6,ang,0.6);
    if(grip){ p.F(R[3]); [-3,0,3].forEach(y=>p.cap(P2(6,y),P2(10,y+0.4),1,1)); p.F(R[0]); [-4,-1,2].forEach(y=>p.rect(8,y,1.6,1)); }
    else { [[-24,10],[-8,11],[8,11],[22,9]].forEach(([a,L])=>{ const r=rad(a), e=P2(5+C(r)*L,S(r)*L); p.F(R[2]); p.cap(P2(5,S(r)*2),e,3.4,2.8); p.F(R[3]); p.circle(e,0.9); }); }
    p.F(M.sap[1]); p.ell(6,3,1.6,1);
  }
  function drawLeg(p,M,hip,knee,ankle,fa,front){
    // pernas quase todas sob a saia: só canela e pé
    let t=limb(p,knee,ankle); const Sk=M.skin;
    p.F(Sk[2]); p.cap(P2(0,0),P2(t.L,0),13,11); mass(p,Sk,t.L*0.4,-1,7,5,t.ang,0.6);
    p.F(M.root[2]); p.cap(P2(t.L*0.5,-6),P2(t.L*0.6,6),2,2);
    p.xf(rad(fa),ankle.x,ankle.y); const W=M.wood;
    // chinelo de couro
    p.F(W[2]); p.poly([[-6,4],[16,4],[19,6],[18,8.4],[-7,8.4]]); p.F(W[0]); p.rect(-6,4,22,1);
    p.F(Sk[2]); p.poly([[-5,-4],[4,-4],[12,-1],[16,2],[16,4],[-6,4]]); mass(p,Sk,4,0,7,3.4,0,0.7);
    p.F(W[1]); p.cap(P2(10,1),P2(3,-3),1.4,1.4);
  }

  /* ---------------- corpo ---------------- */
  function skirtPts(sk,P){ const sw=P.sway*2, H=56, T=(x,y)=>{ const q=sk.T(x,y); return [q.x,Math.min(GROUND-1,q.y)]; };
    return [T(-22,-8),T(26,-8),T(42+sw,H-2),T(32+sw,H+4),T(4+sw,H+6),T(-26+sw,H+3),T(-36+sw,H-2)]; }
  function drawSkirt(p,M,sk,P,fur){
    p.id(); const R=M.skirt, sp=skirtPts(sk,P);
    p.F(R[1]); p.poly(sp);
    clipPoly(sp,()=>{ const [a,b,c,d,e,f,g]=sp; mass(p,R,(a[0]+b[0])/2,(a[1]+e[1])/2,(c[0]-g[0])/2+8,(e[1]-a[1])/2+6,0,0.9);
      for(let k=1;k<5;k++){ const t=k/5, x0=a[0]+(b[0]-a[0])*t, x1=g[0]+(c[0]-g[0])*t; fold(p,R,[[x0,a[1]+4],[(x0+x1)/2+P.sway,(a[1]+e[1])/2],[x1,e[1]-2]],1.4); }
      // barra estampada
      p.F(M.scarf[1]); bandA(p,[[g[0],g[1]-6],[e[0],e[1]-6],[c[0],c[1]-6]],3); p.F(M.dots[0]); for(let k=0;k<8;k++){ const t=k/7, x=g[0]+(c[0]-g[0])*t; p.rect(x,e[1]-7-(Math.abs(t-0.5))*2,1.6,1.6); }
      // avental de feira por cima
      const ap=[[sk.T(4,-10).x,sk.T(4,-10).y],[sk.T(28,-10).x,sk.T(28,-10).y],[c[0]-2,c[1]-10],[d[0]-10,d[1]-10]];
      platePoly(p,M.apron,ap,0,1); p.F(M.apron[3]); bandA(p,[ap[0],ap[3]],1); p.F(M.sap[2]); p.ell((ap[0][0]+ap[2][0])/2,(ap[0][1]+ap[2][1])/2,4,3);
      p.F(M.apron[2]); p.rect((ap[0][0]+ap[1][0])/2-6,(ap[0][1]+ap[2][1])/2-2,12,8); p.F(M.apron[0]); p.rect((ap[0][0]+ap[1][0])/2-6,(ap[0][1]+ap[2][1])/2-2,12,1);
    });
    // raízes saindo da barra
    const [,,c,d,e,f,g]=sp; [[g,-30,14],[f,-10,18],[e,8,16],[d,20,14],[c,40,12]].forEach(([q,dx,h],k)=>{ const hh=h*(fur?1.4:1); rootLine(p,M,P2(q[0],q[1]-4),P2(q[0]+dx*0.4,Math.min(GROUND-1,q[1]+hh)),3.4,k+3,P.dry>0.5); });
    if(!P.dry){ leaf(p,M,f[0]-6,f[1]-8,0.6,0.9); leaf(p,M,c[0]-4,c[1]-14,-0.4,0.8); }
  }
  function drawBasket(p,M,sk,P){
    p.id(); const S0=M.straw; let c, a=sk.a;
    if(P.basketOff>0.5){ c=P2(AX-74,GROUND-24); a=-1.3; } else c=sk.T(-28,-62);
    p.xf(a,c.x,c.y); const w=22, h=30;
    // ervas saindo por cima
    [[-14,-h,-0.5],[-6,-h-4,-0.2],[2,-h-2,0.1],[10,-h,0.4],[16,-h+2,0.7]].forEach(([x,y,an],k)=>{ p.F(M.leaf[2]); p.cap(P2(x,y+6),P2(x+S(an)*14,y-12),2,1); leaf(p,M,0,0,0,0); p.xf(a,c.x,c.y);
      p.F(k%2?M.leaf[1]:M.root[1]); p.ell(x+S(an)*14,y-12,3,4,an); p.F(M.leaf[0]); p.rect(x+S(an)*14-1,y-14,1,2); });
    platePoly(p,S0,[[-w,-h],[w,-h],[w-3,h],[-w+3,h]],a,1);
    p.F(S0[2]); for(let y=-h+4;y<h;y+=5) p.rect(-w+2,y,w*2-4,1.4); p.F(S0[0]); for(let y=-h+2;y<h;y+=5) for(let x=-w+3;x<w-3;x+=6) p.rect(x+((y/5)&1)*3,y,3,1);
    p.F(S0[3]); for(let x=-w+6;x<w;x+=8) p.rect(x,-h,1.2,h*2);
    p.F(S0[2]); p.rect(-w-1,-h-2,w*2+2,4); p.F(S0[0]); p.rect(-w,-h-2,w*2,1);
    p.F(M.root[2]); p.poly([[w-4,h-4],[w+6,h+6],[w+2,h+8],[w-6,h]]);
  }
  function drawTorso(p,M,sk,P,fur){
    p.xf(sk.a,sk.hip.x,sk.hip.y); const R=M.bata, A=sk.a;
    const bt=[[-22,-4],[-26,-36],[-24,-66],[-18,-78],[0,-84],[16,-82],[26,-74],[30,-54],[28,-26],[24,-4]];
    p.F(R[1]); p.poly(bt);
    clipPoly(bt,()=>{ mass(p,R,4,-44,28,44,A,1); fold(p,R,[[-6,-66],[-2,-46],[-6,-26]]); fold(p,R,[[18,-56],[22,-36]]); fold(p,R,[[-16,-30],[-6,-16],[8,-12]]);
      // decote franzido
      p.F(R[3]); bandA(p,[[2,-82],[10,-74],[18,-80]],1.2); p.F(R[2]); [4,8,12,16].forEach(x=>p.rect(x,-78,1,3));
      p.F(M.sap[2]); p.ell(16,-44,4,3); p.rect(15.4,-42,1.4,8); p.F(M.dust[2]); p.ell(-10,-50,5,4);
      leaf(p,M,-14,-60,0.8,0.9); leaf(p,M,20,-30,-0.6,0.8); p.xf(sk.a,sk.hip.x,sk.hip.y);
    });
    // barbante com garrafadas na cintura
    p.F(M.straw[2]); bandA(p,[[-22,-6],[0,-2],[26,-6]],1.4);
    [[-12,0,1],[2,2,2],[16,0,1]].forEach(([x,y,k])=>{ p.id(); const q=sk.T(x,y); drawFlask(p,M,P2(q.x,q.y+9),0.1*(x/12)+P.sway*0.08,k,0.9); p.xf(sk.a,sk.hip.x,sk.hip.y); });
    // colar de sementes
    p.xf(sk.a,sk.hip.x,sk.hip.y); const ns=ellPts(10,-78,10,8,20,160,8); ns.forEach(([x,y],k)=>{ p.F(M.seed[2]); p.circle(P2(x,y),1.8); p.F(M.seed[0]); p.rect(x-0.6,y-1.2,1,1); });
    p.F(M.seed[1]); p.ell(10,-69,3,3.6); p.F(M.seed[3]); p.ell(10,-69,1.2,1.6);
    // flores da fúria nos ombros
  }
  function drawHead(p,M,sk,P,fur){
    p.xf(sk.ha,sk.neck.x,sk.neck.y); BOSSKIT.st.CTX.scale(1.05,1.05); const R=M.skin, A=sk.ha;
    p.F(R[2]); p.ell(0,2,8,6);
    // tranças-cipó caindo nas costas
    p.F(M.root[2]); band(p,bez(P2(-8,-16),P2(-20,-4),P2(-16+P.sway*2,20),5),4); p.F(M.leaf[1]); [[-18,2],[-17,12]].forEach(([x,y])=>p.ell(x,y,2.4,1.4));
    p.F(M.root[1]); band(p,bez(P2(-8,-16),P2(-19,-5),P2(-15+P.sway*2,19),5),2);
    const hd=[[-10,-2],[-12,-16],[-8,-28],[10,-30],[20,-22],[22,-10],[19,0],[10,4],[0,4]];
    p.F(R[2]); p.poly(hd); mass(p,R,6,-14,16,16,A,1);
    p.F(R[3]); bandA(p,[[10,-4],[16,-7]],0.9); p.F(qOfQ(R)[1]); p.ell(12,-9,4,2.4);
    const glow=1-P.dead;
    p.F(M.mouth[3]); p.ell(14,-17,3.6,2.8); if(glow>0.3){ p.F(M.eye[2]); p.ell(14.4,-17,2.6,1.9); p.F(M.eye[1]); p.ell(14.8,-17.2,1.4,1.1); p.F(M.eye[0]); p.rect(14.6,-18,1,1); }
    p.F(R[3]); p.rect(9,-21,10,1.2);
    p.F(R[2]); p.poly([[19,-17],[24,-10],[19,-9]]); p.F(R[3]); p.rect(19,-10,4,1);
    if(P.drink>0.5){ p.F(M.mouth[2]); p.ell(18,-4,3,2.6); }
    else if(P.roar>0.5){ p.F(M.mouth[2]); p.poly([[11,-6],[21,-6],[20,2],[12,2]]); p.F(M.mouth[3]); p.poly([[13,-4],[19,-4],[18,0],[14,0]]); p.F(M.dots[1]); [12,15,18].forEach(x=>p.rect(x,-6,1.6,1.6)); }
    else { p.F(M.mouth[2]); bandA(p,[[11,-4],[16,-3],[20,-4]],1.6); }
    // seiva preta escorrendo
    p.F(M.sap[1]); p.poly([[14,-2],[17,-2],[16,6],[15,4]]); p.rect(13,-15,1.2,6);
    // lenço colorido amarrado
    const sc=[[-14,-14],[-14,-26],[-6,-34],[10,-35],[20,-28],[22,-20],[10,-24],[-2,-22],[-8,-14]];
    platePoly(p,M.scarf,sc,A,1); p.F(M.dots[0]); [[-6,-28],[2,-31],[10,-31],[16,-27],[-10,-20],[4,-26]].forEach(([x,y])=>p.circle(P2(x,y),1.3));
    p.F(M.scarf[3]); bandA(p,[[-2,-22],[10,-24],[20,-21]],1);
    // nó atrás com pontas
    p.F(M.scarf[2]); p.ell(-14,-20,4,4); p.poly([[-16,-20],[-26,-14],[-22,-10],[-14,-16]]); p.poly([[-14,-18],[-20,-6],[-16,-5],[-12,-16]]); p.F(M.scarf[1]); p.ell(-14.6,-20.6,2.4,2.4);
  }
  function drawStaff(p,M,sk,P){
    const w=sk.wrF, a=Math.atan2(w.y-sk.elF.y,w.x-sk.elF.x)+rad(P.stA)-PI/2+PI;
    // cajado vertical na mão (ponta pra baixo), ângulo segue o antebraço + stA
    p.id(); const up=lp(w,180+P.stA+0*a,44), dn=lp(w,P.stA,58); const W=M.wood;
    const dnC=P2(dn.x,Math.min(GROUND-1,dn.y));
    p.F(W[2]); p.cap(up,dnC,5.4,4); p.F(W[1]); p.cap(P2(up.x-0.8,up.y),P2(dnC.x-0.8,dnC.y),2.6,1.8); p.F(W[3]); [0.3,0.6].forEach(t=>{ const q=lerp(up,dnC,t); p.ell(q.x+1,q.y,2.6,1.6); });
    // galho torto e maço de ervas na ponta de cima
    p.F(W[2]); p.cap(up,P2(up.x+8,up.y-8),3,2); p.F(M.straw[2]); p.rect(up.x-3,up.y+2,6,3);
    [[-6,-10],[0,-14],[6,-10],[-3,-6],[4,-6]].forEach(([dx,dy],k)=>leaf(p,M,up.x,up.y,rad(-90+dx*8),1));
    p.F(M.flower[1]); p.circle(P2(up.x+2,up.y-12),1.8);
  }

  function parts(add,P,M,sk,form,anim){
    const fur=form==='furia';
    const angF=Math.atan2(sk.wrF.y-sk.elF.y,sk.wrF.x-sk.elF.x), angB=Math.atan2(sk.wrB.y-sk.elB.y,sk.wrB.x-sk.elB.x);
    if(P.roots>0.05) add({},p=>groundRoots(p,M,anim==='roots'?sk.hip.x+70:sk.hip.x+10,P,anim.length,fur?1.4:1));
    if(P.basketOff<0.5) add({back:true},p=>drawBasket(p,M,sk,P));
    add({back:true},p=>drawUpper(p,M,sk.shB,sk.elB,false,P));
    add({back:true},p=>drawFore(p,M,sk.elB,sk.wrB,false,P));
    if(P.btl>0.5) add({back:anim!=='tea'&&anim!=='bottle'},p=>drawFlask(p,M,lp(sk.wrB,90,8),angB+PI/2,Math.round(P.btl)));
    add({back:true},p=>drawHand(p,M,sk.wrB,angB,P.btl>0.5));
    add({back:true},p=>drawLeg(p,M,sk.hipB,sk.kneeB,sk.ankleB,P.fB,false));
    add({},p=>drawLeg(p,M,sk.hipF,sk.kneeF,sk.ankleF,P.fF,true));
    add({},p=>drawSkirt(p,M,sk,P,fur));
    add({},p=>drawTorso(p,M,sk,P,fur));
    add({},p=>drawHead(p,M,sk,P,fur));
    if(P.bloom>0.05||(fur&&P.dead<0.9&&P.dry<0.5)){ add({noShade:true,noRim:true},p=>drawBloomGlow(p,M,sk,P,fur)); add({},p=>drawBlooms(p,M,sk,P,fur)); }
    if(P.basketOff>0.5) add({},p=>drawBasket(p,M,sk,P));
    if(!(anim==='death'&&P.basketOff>0.5)) add({},p=>drawStaff(p,M,sk,P));
    add({},p=>drawUpper(p,M,sk.shF,sk.elF,true,P));
    add({},p=>drawFore(p,M,sk.elF,sk.wrF,true,P));
    add({},p=>drawHand(p,M,sk.wrF,angF,true));
    if(P.sink>0.05) add({},p=>{ p.id(); const g=GROUND, x0=AX-60, x1=AX+90, top=g-58; platePoly(p,M.wood,[[x0,top],[x1,top],[x1,g],[x0,g]],0,0.9);
      p.F(M.wood[3]); [top+16,top+32].forEach(y=>p.rect(x0,y,x1-x0,2)); p.F(M.wood[0]); p.rect(x0,top,x1-x0,2);
      [[-40,-6],[-10,-8],[24,-6],[60,-7]].forEach(([dx,dy],k)=>{ p.F(k%2?M.leaf[2]:M.root[1]); p.ell(AX+dx,top+dy,12,7); p.F(k%2?M.leaf[1]:M.root[0]); p.ell(AX+dx-2,top+dy-2,6,3); }); });
    if(P.smear&&anim==='staff') add({noShade:true,smear:true,noRim:true},p=>{ p.id(); const w=sk.wrF; p.F(M.fx[1]); [-6,0,6].forEach(dy=>p.cap(P2(w.x-20,w.y+dy),P2(w.x+60,w.y+dy*0.5),0.6,2.2)); });
    if(P.smear&&(anim==='bottle'||anim==='tea')) add({noShade:true,smear:true,noRim:true},p=>{ p.id(); const w=sk.wrB; p.F(M.fx[1]); [-8,0,8].forEach(dy=>p.cap(P2(w.x-30,w.y-30+dy),P2(w.x+30,w.y+dy),0.6,2.2)); });
    if(P.smear&&(anim==='roots'||anim==='summon')) add({noShade:true,smear:true,noRim:true},p=>{ p.id(); const w=sk.wrF; p.F(M.fx[1]); [-10,10].forEach(dx=>p.cap(P2(w.x+dx,w.y-50),P2(w.x+dx,w.y),0.8,2.4)); });
    if(anim==='tea'&&P.smear) add({noShade:true,noRim:true},p=>{ p.id(); const c=sk.T(4,-50); for(let k=0;k<8;k++){ const a=k/8*PI*2; p.F(M.lpink[1]); p.rect(c.x+C(a)*30,c.y+S(a)*24,2,2); p.F(M.lpink[0]); p.rect(c.x+C(a)*22,c.y+S(a)*18,1,1); } });
    if(P.impact) add({noShade:true,smear:true,noRim:true},p=>{ p.id(); dust(p,M.dust,null,anim==='death'?sk.hip.x-20:sk.wrF.x+6,GROUND,0.5); });
  }
  const qOfQ=R=>K_.qOf(R);
  function anchors(sk,P){ return {eye:sk.H(14,-17),head:sk.H(6,-24),back:sk.T(-28,-62),hand:sk.wrB,staff:lp(sk.wrF,P.stA,58),stomp:{x:sk.hip.x,y:GROUND}}; }
  function prop(add,P,M,form,anim){ const st=Math.round(P.st||0);
    if(st<2) add({},p=>drawFlask(p,M,P2(30,22),st*1.6+0.4,1,1.1));
    else add({},p=>{ const k=st-2, PP={roots:k===0?0.45:1,dry:k===2?1:0}; p.id(); const saveG=GROUND; groundRootsAt(p,M,30,PP,7,48); });
  }
  // raízes no quadro pequeno (chão em y=48)
  function groundRootsAt(p,M,x,P,seed,g){ const n=6;
    for(let k=0;k<n;k++){ const dx=(rnd(seed,k)-0.5)*44, h=(14+rnd(seed,k+5)*20)*P.roots; const a=P2(x+dx,g-1), b=P2(x+dx+(rnd(seed,k+9)-0.5)*16,g-h);
      const pts=rootLine(p,M,a,b,4.6,seed+k,P.dry>0.5); if(!P.dry&&k%2===0) leaf(p,M,pts[3].x,pts[3].y,-1+k*0.4,0.8); }
    p.F(P.dry?M.dust[2]:M.root[3]); p.ell(x,g-1,26*P.roots,3.4); }

  return K_.factory({SC:0.915,FW,FH,GROUND,AX,RIM,ANIMS,NAMES,REST,mats0,fix,skeleton:RG.skeleton,parts,anchors,PROP:{FW:60,FH:54,GROUND:48,AX:30},prop});
})();
