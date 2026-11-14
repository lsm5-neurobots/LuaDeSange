/* OBJ — fonte de arte (editável). Build: npm run art */
const OBJ=(function(){
  const {ramp,mkPen,compose,P2}=PIX;
  const RIM='#a9c8f0';
  const M={
    orange:ramp('#e0701e'), lid:ramp('#3a3a44'), black:ramp('#26242c'), wood:ramp('#9a6a3c'), woodD:ramp('#6d4828'),
    metal:ramp('#86a0a8'), rust:ramp('#8a4e2e'), blood:ramp('#7a2a2a'), tape:ramp('#b8bcc4'), red:ramp('#c83a3a'),
    enamel:ramp('#8cc4b4'), green:ramp('#5a9a5a'), car:ramp('#4f7f8c'), glass:ramp('#36506e'), card:ramp('#c49a64'),
    tire:ramp('#4a4858'), canvas:ramp('#5a6a3e'), yellow:ramp('#e8c040'), bag:ramp('#2c2c34'), paper:ramp('#e8e4d8'),
    food:ramp('#d84a3a'), leaf:ramp('#5aa03a'), chrome:ramp('#d4d8e0'), inside:ramp('#2a2030'), light:ramp('#cfeaff'), straw:ramp('#d8b860'),
  };
  const KINDS={
    lixeira:{nome:'Lixeira da prefeitura', areas:['ponte','feira','bomjesus','moeda','riobranco','marco','comercio','ladeiras','tome'], loot:['sucata','pano','comida','pilha','antídoto'], tempo:1.0, w:44,h:54},
    caixa:{nome:'Caixote de feira', areas:['feira','bomjesus','modelo','ladeiras','terreiro'], loot:['madeira','pregos','corda','fita','munição'], tempo:1.5, w:54,h:40},
    carro:{nome:'Carro abandonado', areas:['ponte','arsenal','riobranco','plano','tome'], loot:['sucata','peças','gasolina','bateria'], tempo:2.5, w:156,h:94},
    geladeira:{nome:'Geladeira velha', areas:['apolo','moeda','ladeiras','casaroes'], loot:['água','comida','antídoto'], tempo:1.5, w:46,h:84},
    armario:{nome:'Armário de hospital', areas:['alfandega','arsenal','casaroes'], loot:['pano','atadura','kit médico'], tempo:2.0, w:50,h:70},
    mochila:{nome:'Mochila largada', areas:['ponte','alfandega','marco','travessia','farol','rosario','tome'], loot:['comida','água','munição'], tempo:0.8, w:34,h:28},
    papelao:{nome:'Caixa de papelão', areas:['moeda','apolo','sertao','plano','rosario'], loot:['pano','pilha','fita'], tempo:1.0, w:40,h:30},
    pneus:{nome:'Pilha de pneus', areas:['arsenal','riobranco','sertao','plano'], loot:['sucata','borracha','pregos'], tempo:1.8, w:52,h:62},
    caixote:{nome:'Caixote do porto', areas:['sertao','marco','molhe'], loot:['madeira','munição','corda','peças'], tempo:2.0, w:62,h:50},
    carrinho:{nome:'Carrinho de feira', areas:['feira','bomjesus','moeda','comercio'], loot:['comida','sucata','água'], tempo:1.2, w:54,h:48},
    coco:{nome:'Carrinho de coco', areas:['farol','modelo','largo','terreiro'], loot:['comida','água','comida'], tempo:1.0, w:66,h:60},
    banca:{nome:'Banca de souvenir', areas:['farol','modelo','largo','rosario','casaroes','terreiro'], loot:['pano','fita','sucata','comida'], tempo:1.5, w:90,h:68},
    isopor:{nome:'Caixa de isopor', areas:['comercio','modelo','farol'], loot:['comida','água','água'], tempo:1.0, w:58,h:40},
  };
  const PADX=16, PADT=46, PADB=8;
  const size=k=>{ const K=KINDS[k]; return {FW:K.w+PADX*2+14, FH:K.h+PADT+PADB}; };
  function ANCHOR(k){ const s=size(k), K=PIX.getK(); return {ax:Math.round(s.FW/2*K), gy:Math.round((s.FH-PADB)*K)}; }

  // ---- helpers
  const hsh=(i,s)=>{ const v=Math.sin(i*12.9898+s*78.233)*43758.5453; return v-Math.floor(v); };
  function dirt(p,col,x,y,w,h,n,seed){ p.F(col); for(let i=0;i<n;i++){ p.rect(Math.round(x+hsh(i,seed)*(w-1)),Math.round(y+hsh(i,seed+9)*(h-1)),1,1); } }
  // caixa 3/4: frente tom1, topo tom0, lateral tom2
  function box(p,m,x,y,w,h,d){ d=d||0; const e=d*0.6;
    if(d){ p.F(m[0]); p.poly([[x,y],[x+d,y-e],[x+w+d,y-e],[x+w,y]]); p.F(m[2]); p.poly([[x+w,y],[x+w+d,y-e],[x+w+d,y+h-e],[x+w,y+h]]); }
    p.F(m[1]); p.rect(x,y,w,h); }
  const rivet=(p,m,x,y)=>{ p.F(m[0]); p.rect(x,y,1.4,1.4); p.F(m[3]); p.rect(x+1,y+1,1,1); };
  const panel=(p,m,x,y,w,h)=>{ p.F(m[0]); p.rect(x,y,w,1); p.rect(x,y,1,h); p.F(m[2]); p.rect(x,y+h-1,w,1); p.rect(x+w-1,y,1,h); p.F(m[3]); p.rect(x+w,y+1,1,h); p.rect(x+1,y+h,w,1); };
  const star=(p,c,x,y,r)=>{ p.F(c); p.rect(x-r,y-0.5,r*2+1,1.2); p.rect(x-0.5,y-r,1.2,r*2+1); };
  const ph=(fi)=>[0,1,2,1][fi%4];

  // ---- kit explícito (paleta própria, faixas limpas, curvas Catmull-Rom)
  function mkE(c,u){
    const col=h=>{ c.fillStyle=h; u.add(h); };
    const path=pts=>{ c.beginPath(); pts.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])); c.closePath(); };
    const poly=(pts,h)=>{ col(h); path(pts); c.fill(); };
    const rect=(x,y,w,h,k)=>{ col(k); c.fillRect(x,y,w,h); };
    const ell=(x,y,rx,ry,k,rot)=>{ col(k); c.beginPath(); c.ellipse(x,y,rx,ry,rot||0,0,7); c.fill(); };
    // faixas: axis 'y' (de cima p/ baixo) ou 'x'; a0..a1 = extensão onde as frações se distribuem
    const band=(pts,cols,fr,axis,a0,a1)=>{ c.save(); path(pts); c.clip(); const tot=fr.reduce((a,b)=>a+b,0); let acc=0;
      cols.forEach((k,i)=>{ const s=i===0?-9999:a0+(a1-a0)*acc/tot, e=i===cols.length-1?9999:a0+(a1-a0)*(acc+fr[i])/tot; col(k); if(axis==='y') c.fillRect(-9999,s,19999,e-s); else c.fillRect(s,-9999,e-s,19999); acc+=fr[i]; }); c.restore(); };
    const smooth=(pts,n)=>{ n=n||6; const o=[], N=pts.length; for(let i=0;i<N;i++){ const p0=pts[(i-1+N)%N],p1=pts[i],p2=pts[(i+1)%N],p3=pts[(i+2)%N];
        for(let k=0;k<n;k++){ const t=k/n,t2=t*t,t3=t2*t; o.push([0,1].map(d=>0.5*((2*p1[d])+(-p0[d]+p2[d])*t+(2*p0[d]-5*p1[d]+4*p2[d]-p3[d])*t2+(-p0[d]+3*p1[d]-3*p2[d]+p3[d])*t3))); } } return o; };
    const circ=(x,y,r,cols,fr,k0)=>{ const pts=[]; for(let i=0;i<24;i++){ const a=i/24*6.2832; pts.push([x+Math.cos(a)*r,y+Math.sin(a)*r]); } band(pts,cols,fr,'y',y-r,y+r); };
    return {col,path,poly,rect,ell,band,smooth,circ};
  }
  const PC=['#e2fbf6','#a4e0da','#6cbcc6','#4a94ae','#3a6c96','#2b4a7a','#223262','#1a1c48'];
  const GLS=['#b0e6f6','#6eaed6','#3e6ea4','#27396e','#171c48'];
  const RUB=['#7a7890','#58566c','#403e54','#2e2c40','#201e30'];
  const RB=['#d4e0f4','#a8bad8','#8298bc','#667ca2','#4e6288','#3a4a6c','#26324e'];
  const SIL=['#fafcff','#d0d8e8','#9aa4c0','#5e6890','#363e60'];
  const hero={
    carro(p,x,G,o,done,fi,c,u){
      const e=mkE(c,u), m=pts=>pts.map(q=>[x+q[0],G+q[1]]);
      p.id();
      // sombra e poça
      const dX=20, dY=-12;
      const lower=e.smooth(m([[7,-9],[3,-13],[1,-25],[2,-33],[6,-39],[16,-43],[34,-45],[34,-45],[100,-45],[124,-44],[138,-39],[148,-31],[151,-20],[148,-11],[141,-8],[12,-8]]),5);
      const cab=e.smooth(m([[32,-44],[32,-44],[42,-61],[53,-74],[68,-80],[100,-80],[111,-72],[124,-53],[132,-44],[132,-44]]),6);
      e.ell(x+88,G-4,96,8,'#1c1226');
      // superfície superior contínua (porta-malas -> teto -> para-brisa -> capô) e face frontal arredondada
      const topS=e.smooth(m([[6,-39],[16,-43],[34,-45],[42,-61],[53,-74],[68,-80],[100,-80],[111,-72],[124,-53],[132,-44],[138,-39],[148,-31],[166,-42],[166,-42],[156,-50],[150,-55],[124,-79],[112,-87.5],[80,-87.5],[63,-80],[56,-69],[52,-56],[34,-54],[24,-50]]),5);
      e.ell(x+88,G-4,96,8,'#1c1226');
      e.band(topS,[PC[3],PC[2],PC[1],PC[0],PC[1],PC[2],PC[3]],[2,3,3,2,4,4,2],'y',G-88,G-31);
      e.poly(m([[70,-86],[110,-86],[104,-81.6],[74,-81]]),'#ffffff'); e.poly(m([[136,-46],[152,-52],[160,-48],[144,-42]]),'#e2fbf6'); e.poly(m([[16,-47],[40,-52],[46,-56],[22,-50]]),'#d6f4ee');
      e.poly(m([[24,-50],[34,-54],[52,-56],[34,-52]]),PC[4]);
      // para-brisa
      const ws=e.smooth(m([[132,-44],[124,-53],[111,-72],[100,-80],[112,-87.5],[124,-79],[150,-55]]),3);
      e.band(ws,GLS,[1,2,3,4,3],'y',G-88,G-44); e.poly(m([[112,-84],[120,-82],[140,-56],[134,-56]]),'#d4f2fc'); e.poly(m([[122,-80],[126,-78],[144,-56],[142,-56]]),'#8ac4e8');
      e.rect(x+128,G-70,1,9,'#e8faff'); e.rect(x+123,G-65,7,1,'#e8faff'); e.rect(x+130,G-64,6,1,'#cfeaff');
      e.poly(m([[134,-47],[120,-70],[121,-70],[135,-47]]),'#1a1c48');
      // face frontal (capô para baixo): faixas, faróis integrados, grade, para-choque
      const Fp=(uu,vv)=>[148+18*uu,-31-11*uu+20*vv], Q=(u0,v0,u1,v1)=>m([Fp(u0,v0),Fp(u1,v0),Fp(u1,v1),Fp(u0,v1)]);
      const fas=e.smooth(m([[148,-31],[148,-31],[166,-42],[166,-42],[166,-22],[166,-22],[148,-11],[148,-11]]),3);
      e.band(fas,[PC[3],PC[4],PC[5],PC[6]],[2,3,3,2],'x',x+148,x+166); e.poly(Q(0,0,1,0.06),PC[1]);
      [[0.05,0.38],[0.62,0.95]].forEach(([u0,u1],i)=>{ e.poly(Q(u0-0.03,0.07,u1+0.03,0.47),'#1a1c48'); e.band(Q(u0,0.1,u1,0.43),['#fffbe0','#ffe27a','#e0a830','#a86a18'],[1,2,2,1],'y',G-31-11*(i?0.78:0.22)-2,G-31-11*(i?0.78:0.22)+11); e.poly(Q(u0+0.04,0.13,u0+0.12,0.2),'#ffffff'); });
      e.poly(Q(0.43,0.12,0.57,0.5),'#1a1c48'); [0.2,0.3,0.4].forEach(v=>e.poly(Q(0.44,v,0.56,v+0.03),'#9aa4c0'));
      e.poly(Q(0.1,0.56,0.9,0.78),'#12123a'); [0.62,0.68,0.74].forEach(v=>e.poly(Q(0.12,v,0.88,v+0.025),'#5e6890'));
      e.band(Q(0,0.82,1,1),SIL,[1,1,2,2,1],'y',G-42,G-11); e.poly(Q(0.38,0.84,0.62,0.97),'#f4f0e0'); e.poly(Q(0.42,0.88,0.58,0.9),'#26283a');
      c.save(); c.translate(10,-6);
      e.band(m([[56,-80],[84,-80],[84,-93],[56,-93]]),['#d8a068','#a8703c','#7a4a28','#4a2c18'],[1,3,3,2],'y',G-93,G-80);
      e.rect(x+56,G-93,28,1.4,'#f0c890'); e.rect(x+61,G-93,3,13,'#c83a3a'); e.rect(x+77,G-93,3,13,'#c83a3a'); e.rect(x+61,G-93,1,13,'#ff8a80'); e.rect(x+68,G-91,6,3,'#c4ccdc'); e.rect(x+69,G-91,6,1,'#fafcff');
      e.band(m([[88,-80],[110,-80],[112,-86],[108,-90],[88,-90],[86,-86]]),['#9ab868','#5a7a3a','#38542a','#243818'],[1,3,3,2],'y',G-90,G-80); e.rect(x+90,G-88,18,1,'#c8e090'); e.rect(x+96,G-90,1.4,10,'#6a3a28');
      e.rect(x+52,G-81,62,1.6,'#22325a');
      c.restore();
      // carroceria inferior (curva) + faixas verticais de luz
      /*lower*/
      e.band(lower,[PC[0],PC[1],PC[2],PC[3],PC[4],PC[5],PC[6]],[1.2,3,7,8,8,5,3],'y',G-46,G-8);
      // cabine
      /*cab*/
      e.band(cab,[PC[0],PC[1],PC[2],PC[3],PC[4]],[1.5,4,8,10,8],'y',G-81,G-44);
      // brilho especular: ombro, teto, capô
      e.poly(m([[10,-40],[40,-43.5],[100,-44],[124,-43],[137,-38],[121,-41.4],[60,-42],[14,-38]]),'#f4fffc');
      e.poly(m([[60,-79],[100,-79.4],[109,-72],[100,-77.4],[66,-77.2]]),'#ffffff');
      e.poly(m([[128,-41],[142,-34],[146,-29],[136,-36]]),'#e2fbf6');
      // soleira escura com luz refletida do chão
      e.rect(x+10,G-12,130,3,'#1e1648'); e.rect(x+10,G-12,130,1,'#5a4a86');
      e.rect(x+4,G-37,146,1.2,'#223262'); e.rect(x+4,G-36,146,0.9,'#6cbcc6');
      // portas: vincos
      [36,84,126].forEach(sx=>{ e.rect(x+sx,G-43,1.2,31,'#1a1c48'); e.rect(x+sx+1.2,G-43,1,31,'#a4e0da'); });
      // vidros
      const wr=e.smooth(m([[40,-46],[40,-46],[48,-61],[58,-72],[70,-76],[80,-76],[80,-46]]),4), wf=e.smooth(m([[86,-46],[86,-76],[100,-76],[109,-71],[121,-53],[125,-46]]),4);
      e.band(wr,GLS,[1,2,3,4,3],'y',G-77,G-46); e.band(wf,GLS,[1,2,3,4,3],'y',G-77,G-46);
      e.poly(m([[54,-72],[61,-74],[50,-46],[44,-46]]),'#d4f2fc'); e.poly(m([[64,-75],[67,-76],[58,-46],[56,-46]]),'#8ac4e8');
      e.poly(m([[92,-75],[99,-75],[90,-46],[86,-46]]),'#d4f2fc'); e.poly(m([[102,-74],[105,-72],[96,-46],[94,-46]]),'#8ac4e8');
      e.ell(x+62,G-54,6,9,'#12183a'); e.ell(x+98,G-55,6,9,'#12183a'); e.rect(x+60,G-65,5,3,'#27396e');
      // para-brisa trincado
      e.rect(x+108,G-68,1,10,'#e8faff'); e.rect(x+104,G-64,6,1,'#e8faff'); e.rect(x+110,G-62,5,1,'#cfeefc'); e.rect(x+106,G-60,1,6,'#cfeefc');
      // maçanetas e retrovisor
      e.band(m([[68,-35],[77,-35],[77,-32.6],[68,-32.6]]),SIL.slice(0,4),[1,2,2,1],'y',G-35,G-32.6); e.band(m([[104,-35],[113,-35],[113,-32.6],[104,-32.6]]),SIL.slice(0,4),[1,2,2,1],'y',G-35,G-32.6);
      e.band(m([[124,-50],[133,-51],[133,-45],[125,-44]]),[PC[1],PC[3],PC[5]],[1,2,2],'y',G-51,G-44); e.rect(x+126,G-50,5,1,'#ffffff');
      // sujeira de lama (gradiente de baixo p/ cima) e ferrugem
      e.poly(m([[10,-26],[28,-27],[34,-22],[30,-16],[16,-14],[10,-18]]),'#d8843a'); e.poly(m([[12,-23],[26,-24],[30,-20],[18,-16]]),'#a85a28'); e.poly(m([[14,-21],[22,-22],[22,-18],[16,-17]]),'#6a3418'); e.rect(x+16,G-27,6,1,'#f2a860');
      e.poly(m([[60,-16],[82,-17],[84,-12],[60,-11]]),'#a85a28'); e.rect(x+62,G-16,14,1,'#d8843a');
      e.poly(m([[134,-30],[145,-33],[148,-27],[140,-24]]),'#a85a28'); e.rect(x+136,G-31,6,1,'#d8843a');
      // sangue na porta
      e.band(m([[90,-42],[104,-42],[103,-30],[97,-26],[92,-30]]),['#e0483e','#a82230','#6a0e1c'],[1,2,2],'y',G-42,G-26); e.rect(x+94,G-26,1.4,9,'#a82230'); e.rect(x+99,G-28,1.4,5,'#6a0e1c');
      // amassado (curva com luz/sombra)
      e.ell(x+124,G-25,8,5,'#2b4a7a'); e.ell(x+123,G-26,6,3,'#4a94ae'); e.rect(x+118,G-28,7,1,'#e2fbf6');
      // arranhões
      e.rect(x+44,G-30,18,1,'#1a1c48'); e.rect(x+47,G-28,12,1,'#1a1c48'); e.rect(x+50,G-30,10,0.8,'#a4e0da');
      // lama / respingos
      for(let i=0;i<26;i++){ e.rect(Math.round(x+8+hsh(i,2)*136),Math.round(G-15+hsh(i,5)*6),1+(i%3===0),1,'#3a2c4c'); }
      // faróis
      e.band(m([[0,-37],[6,-37],[6,-27],[0,-27]]),['#ff9a90','#d83a3a','#8a1a22'],[1,2,3],'y',G-37,G-27); e.rect(x+1,G-36,2,1,'#ffd0c8');
      // para-choques cromados
      e.band(m([[-4,-20],[6,-21],[6,-12],[-3,-12]]),SIL,[1,1,2,2,1],'y',G-21,G-12);
      e.rect(x+10,G-22,14,6,'#e8ecf4'); e.rect(x+10,G-22,14,1,'#ffffff'); e.rect(x+12,G-20,2,3,'#22325a'); e.rect(x+15,G-20,2,3,'#22325a'); e.rect(x+18,G-20,4,1,'#22325a'); e.rect(x+18,G-18,3,1,'#22325a');
      // rodas
      [[34,-14.5,false],[116,-14.5,true]].forEach(([wx,wy,flat])=>{
        e.circ(x+wx,G+wy,18.2,['#2b4a7a','#1e1648','#100a28'],[1,2,3]); e.circ(x+wx,G+wy,16.4,['#0a0614','#05030c'],[1,3]);
        const ry=flat?12:14.2, cy=wy+(flat?2:0);
        const tire=[]; for(let i=0;i<28;i++){ const a=i/28*6.2832; tire.push([x+wx+Math.cos(a)*14.4*(1+(i%2?0.035:0)),G+cy+Math.sin(a)*ry*(1+(i%2?0.035:0))]); }
        e.band(tire,RUB,[1,2,3,3,2],'y',G+cy-ry,G+cy+ry);
        const rim=[]; for(let i=0;i<22;i++){ const a=i/22*6.2832; rim.push([x+wx+Math.cos(a)*9.2,G+cy+Math.sin(a)*(flat?7.6:9.2)]); }
        e.band(rim,SIL,[1,2,3,3,2],'y',G+cy-9.2,G+cy+9.2);
        for(let k=0;k<5;k++){ const a=k*1.2566+0.3; const tx=x+wx+Math.cos(a)*7.2, ty=G+cy+Math.sin(a)*(flat?6:7.2); e.poly([[x+wx,G+cy],[tx-1,ty],[tx+1,ty+0.6]],'#5e6890'); }
        e.ell(x+wx,G+cy,3.6,flat?3:3.6,'#9aa4c0'); e.ell(x+wx-0.8,G+cy-0.8,2,2,'#fafcff'); e.ell(x+wx+0.6,G+cy+0.6,1,1,'#223262');
        e.rect(x+wx-8,G+cy-ry-0.4,8,1,'#9a98b0'); // luz de recorte na banda
        if(flat){ e.rect(x+wx-12,G+cy+ry-1,24,1,'#100a28'); }
      });
      // capô / porta-malas abrindo (dobradiças na base do para-brisa e do vidro traseiro)
      const th=done?1:o;
      if(th>0){
        e.poly(m([[134,-44.5],[147,-34],[163,-43],[151,-54]]),'#1c1226'); e.poly(m([[140,-45],[148,-39],[158,-44],[150,-50]]),'#4e4c6c'); e.rect(x+147,G-47,6,1,'#9a98b8'); e.rect(x+143,G-44,4,2,'#d84a3a');
        e.poly(m([[8,-40],[34,-45],[52,-56],[28,-51]]),'#1c1226'); if(!done){ e.rect(x+20,G-48,10,3,'#5e6890'); e.rect(x+20,G-48,10,1,'#9aa4c0'); }
        const ha=0.55+th*0.75, ca=Math.cos(ha), sa=Math.sin(ha), f=[16*ca+2,13*ca-26*sa], H0=[132,-44], H1=[150,-55];
        const pl=m([H0,H1,[H1[0]+f[0],H1[1]+f[1]],[H0[0]+f[0],H0[1]+f[1]]]);
        if(ha<1.0) e.band(pl,[PC[0],PC[1],PC[2],PC[3]],[1,3,3,2],'y',Math.min(pl[2][1],pl[3][1]),G-44); else e.band(pl,['#6a6a88','#4a4c6c','#32344e'],[1,3,3],'y',Math.min(pl[2][1],pl[3][1]),G-44);
        e.poly([pl[2],pl[3],[pl[3][0],pl[3][1]+2],[pl[2][0],pl[2][1]+2]],PC[5]);
        const hb=0.55+th*0.65, cb=Math.cos(hb), sb=Math.sin(hb), f2=[-26*cb,6*cb-22*sb], T0=[34,-45], T1=[52,-56];
        const pt=m([T0,T1,[T1[0]+f2[0],T1[1]+f2[1]],[T0[0]+f2[0],T0[1]+f2[1]]]);
        if(hb<1.0) e.band(pt,[PC[0],PC[1],PC[2],PC[3]],[1,3,3,2],'y',Math.min(pt[2][1],pt[3][1]),G-45); else e.band(pt,['#6a6a88','#4a4c6c','#32344e'],[1,3,3],'y',Math.min(pt[2][1],pt[3][1]),G-45);
        e.poly([pt[2],pt[3],[pt[3][0],pt[3][1]+2],[pt[2][0],pt[2][1]+2]],PC[5]);
      }
    },
    geladeira(p,x,G,o,done,fi,c,u){
      const e=mkE(c,u), m=pts=>pts.map(q=>[x+q[0],G+q[1]]);
      p.id(); const MT=['#eafff6','#c0f0de','#92d6c4','#68b4aa','#4a8c98','#356a80','#264860'];
      e.ell(x+28,G-1,38,5.4,'#1c1226');
      // lateral (profundidade)
      e.band(m([[38,-72],[48,-78.5],[48,-11.5],[38,-5]]),[MT[3],MT[4],MT[5],MT[6]],[1,3,3,2],'x',x+38,x+48);
      e.rect(x+47,G-78,1,66,'#5aa0a8'); e.band(m([[0,-72],[10,-78.5],[48,-78.5],[38,-72]]),[MT[2],MT[1],MT[1],MT[0]],[1,3,3,1],'y',G-78.5,G-72); e.rect(x+10,G-78.5,38,1,'#ffffff');
      for(let k=0;k<6;k++){ e.poly(m([[38,-10-k*10],[48,-16.5-k*10],[48,-15.5-k*10],[38,-9-k*10]]),MT[6]); }
      // frente: faixas laterais (luz esq -> sombra dir) com cantos arredondados
      const front=e.smooth(m([[0,-68],[2,-72],[6,-73],[32,-73],[36,-72],[38,-68],[38,-9],[36,-6],[32,-5],[6,-5],[2,-6],[0,-9]]),3);
      e.band(front,[MT[0],MT[1],MT[2],MT[3],MT[4]],[1,3,16,6,3],'x',x,x+38);
      // gradiente vertical sutil: faixa de luz no topo e sombra embaixo
      e.rect(x+1,G-73,36,2,'#f4fffc'); e.rect(x+1,G-9,38,3,MT[5]);
      // rodapé / pés
      e.rect(x+2,G-6,35,5,'#1a1c48'); e.rect(x+2,G-6,35,1,'#4a5a8a'); e.rect(x+4,G-2,5,2,'#0a0614'); e.rect(x+30,G-2,5,2,'#0a0614');
      // porta do freezer + divisória
      e.rect(x+1,G-52,37,1.6,'#264860'); e.rect(x+1,G-50.4,37,1,'#c0f0de');
      // painéis chanfrados
      e.rect(x+3,G-70,33,1,'#f4fffc'); e.rect(x+3,G-70,1,17,'#f4fffc'); e.rect(x+3,G-54,33,1,'#4a8c98'); e.rect(x+35,G-70,1,17,'#4a8c98');
      e.rect(x+3,G-48,33,1,'#f4fffc'); e.rect(x+3,G-48,1,38,'#f4fffc'); e.rect(x+3,G-12,33,1,'#4a8c98'); e.rect(x+35,G-48,1,38,'#4a8c98');
      // marca cromada
      e.band(m([[12,-46],[26,-46],[26,-43],[12,-43]]),SIL,[1,2,2,1],'y',G-46,G-43); e.rect(x+14,G-45,8,1,'#223262');
      // ferrugem com escorrido, mancha, sangue
      e.poly(m([[1,-14],[10,-16],[14,-12],[8,-9],[1,-9]]),'#a85a28'); e.rect(x+3,G-15,6,1,'#d8843a'); e.rect(x+5,G-9,1.4,5,'#6a3418'); e.rect(x+12,G-9,1,3,'#6a3418');
      e.poly(m([[26,-30],[34,-31],[36,-22],[30,-18]]),'#a85a28'); e.rect(x+28,G-30,5,1,'#d8843a');
      e.band(m([[7,-69],[14,-69],[13,-60],[10,-56],[8,-60]]),['#e0483e','#a82230','#6a0e1c'],[1,2,2],'y',G-69,G-56); e.rect(x+9,G-56,1.4,6,'#a82230');
      e.ell(x+22,G-36,5,7,'#68b4aa'); e.ell(x+21,G-37,3.4,5,'#92d6c4'); e.rect(x+19,G-42,3,1,'#eafff6'); // amassado
      // ímãs e adesivos
      e.rect(x+8,G-42,6,6,'#d83a3a'); e.rect(x+8,G-42,6,1,'#ff9a90'); e.rect(x+22,G-30,6,5,'#f2c230'); e.rect(x+22,G-30,6,1,'#fff0a0'); e.rect(x+11,G-28,5,5,'#5aa03a'); e.rect(x+25,G-62,8,7,'#e8e4d8'); e.rect(x+26,G-60,6,1,'#26242c'); e.rect(x+26,G-58,4,1,'#26242c'); e.rect(x+26,G-62,8,1,'#ffffff');
      // alças: pretas com brilho especular
      e.rect(x+31,G-67,2.6,13,'#1a1c48'); e.rect(x+31,G-67,1,13,'#9aa4c0'); e.rect(x+31,G-47,2.6,15,'#1a1c48'); e.rect(x+31,G-47,1,15,'#9aa4c0');
      // sujeira em pontos
      for(let i=0;i<14;i++) e.rect(Math.round(x+2+hsh(i,4)*34),Math.round(G-70+hsh(i,6)*62),1,1,'#356a80');
      // porta de baixo aberta
      const oo=done?0.88:o, dw=38*(1-oo);
      if(oo>0){ e.rect(x+1,G-50,36,41,'#bfe8ff'); e.band(m([[1,-50],[37,-50],[37,-9],[1,-9]]),['#eaf8ff','#bfe0f4','#8ab4d4','#5a7ca0'],[2,6,8,4],'y',G-50,G-9); [0,1,2].forEach(k=>{ e.rect(x+2,G-40+k*11,34,1.6,'#5a7ca0'); e.rect(x+2,G-38.4+k*11,34,1,'#eaf8ff'); });
        if(!done){ e.band(m([[6,-47],[13,-47],[13,-41],[6,-41]]),['#ff8a7a','#d84a3a','#8a2a2a'],[1,2,2],'y',G-47,G-41); e.rect(x+18,G-34,5,8,'#5aa03a'); e.rect(x+18,G-34,1.6,8,'#9ad07a'); e.rect(x+8,G-22,10,7,'#e8e4d8'); e.rect(x+24,G-44,6,4,'#e0c070'); } }
      if(oo>0.02){ const dd=[[0,-50],[dw,-50+oo*4],[dw,-9-oo*4],[0,-9]]; e.band(m(dd),[MT[1],MT[2],MT[3],MT[4]],[1,3,3,2],'x',x,x+Math.max(dw,3)); e.rect(x+Math.max(0,dw-2.4),G-48,2.4,38,'#264860'); e.rect(x,G-50,Math.max(1,dw),1.2,'#f4fffc'); e.rect(x+Math.max(1,dw-7),G-44,2.6,13,'#1a1c48'); e.rect(x+Math.max(1,dw-7),G-44,1,13,'#9aa4c0'); }
      // corvo
      c.save(); c.translate(8,-1);
      const hop=(done||o===0)?0:ph(fi);
      e.ell(x+14,G-77-hop,6.4,4.2,'#26242c'); e.ell(x+13,G-78.4-hop,4.6,2.2,'#4a4660'); e.ell(x+21,G-81-hop,3.2,3,'#26242c'); e.poly(m([[8,-76],[0,-72],[7,-74]]).map(q=>[q[0],q[1]-hop]),'#16101a'); e.poly(m([[23,-81],[28,-80],[23,-79]]).map(q=>[q[0],q[1]-hop]),'#f2c230'); e.rect(x+21,G-82.4-hop,1.5,1.5,'#ffffff'); e.rect(x+12,G-73-hop,1,3,'#16101a'); e.rect(x+16,G-73-hop,1,3,'#16101a');
      c.restore();
    },
    pneus(p,x,G,o,done,fi,c,u){
      const e=mkE(c,u), m=pts=>pts.map(q=>[x+q[0],G+q[1]]);
      p.id(); const hops=(o>0)?ph(fi):0, rows=done?2:3;
      e.ell(x+26,G+1,34,3.2,'#1c1226'); e.ell(x+24,G-0.5,29,2.2,'#3a5a7a'); e.ell(x+20,G-0.8,10,0.9,'#8ac4e8'); // poça com reflexo
      for(let k=0;k<rows;k++){
        const top=(k===rows-1)&&!done, sx=top?Math.round(Math.sin(fi*1.6)*2*o):0, cy=G-19-k*15-(top?hops:0), cx=x+25+sx, H=11;
        const sil=[]; for(let i=0;i<=24;i++){ const a=Math.PI+Math.PI*i/24; sil.push([cx+Math.cos(a)*24,cy+Math.sin(a)*8]); } for(let i=0;i<=24;i++){ const a=Math.PI*i/24; sil.push([cx+Math.cos(a)*24,cy+H+Math.sin(a)*8]); }
        e.band(sil,RB,[1,2,5,8,6,4,2],'x',cx-24,cx+24);
        for(let j=0;j<10;j++){ const tx=cx-21.5+j*4.8, cv=Math.sin((tx-cx+24)/48*Math.PI); e.rect(tx,cy+2,1.6,7.5+cv*7,'#26324e'); e.rect(tx+1.6,cy+2,0.9,7.5+cv*7,'#c8d4ec'); }
        for(let i=0;i<=24;i++){ const a=Math.PI*i/24; e.rect(cx+Math.cos(a)*24-0.5,cy+H+Math.sin(a)*8-1,1.6,2,'#1c2640'); for(let q=0;q<1;q++){} }
        e.rect(cx-24,cy,48,1.4,'#e8f0ff'); e.rect(cx-23,cy+H-1,46,1,'#34446a');
        const face=[]; for(let i=0;i<28;i++){ const a=i/28*Math.PI*2; face.push([cx+Math.cos(a)*24,cy+Math.sin(a)*8]); }
        e.band(face,[RB[0],RB[1],RB[2],RB[3],RB[4]],[1,3,4,3,2],'x',cx-24,cx+24);
        e.band(face.map(q=>[cx+(q[0]-cx)*0.88,cy+(q[1]-cy)*0.82]),[RB[2],RB[3],RB[4],RB[5]],[1,3,3,2],'x',cx-21,cx+21);
        e.rect(cx-20,cy-6.4,16,1,'#ffffff'); e.rect(cx+4,cy-6.6,8,0.8,'#d4e0f4'); // luz de recorte no ombro
      }
      // topo do último pneu: furo com aro e luz
      const rows1=rows-1, ty=G-19-rows1*15-(done?0:hops), tx=x+25+(done?0:Math.round(Math.sin(fi*1.6)*2*o));
      e.ell(tx,ty,17,5.8,'#34446a'); e.ell(tx,ty,15,5,'#101830');
      const rm=[]; for(let i=0;i<22;i++){ const t=Math.PI*2*i/22; rm.push([tx+Math.cos(t)*11,ty+Math.sin(t)*3.8]); } e.band(rm,SIL,[1,2,3,3],'y',ty-4.3,ty+3.3);
      for(let k=0;k<5;k++){ const a=k*1.2566; e.rect(Math.round(tx+Math.cos(a)*6.5)-0.5,Math.round(ty-0.5+Math.sin(a)*2.2)-0.5,1.6,1.2,'#223262'); }
      e.ell(tx,ty-0.5,2.6,1,'#5e6890'); e.ell(tx+7,ty+0.5,3,1,'#a85a28');
      if(!done){ e.rect(tx-10,ty-4,5,2,'#e8e4d8'); e.rect(tx+6,ty-4.6,3,2,'#d84a3a'); }
      // ferrugem e sujeira no flanco
      e.rect(x+8,G-20,6,2,'#a85a28'); e.rect(x+36,G-34,5,2,'#6a3418');
      for(let i=0;i<16;i++) e.rect(Math.round(x+2+hsh(i,3)*46),Math.round(G-36+hsh(i,8)*34),1,1,'#26324e');
      if(done){ e.ell(x+62,G-6,11,5.4,RB[5]); e.ell(x+62,G-7,9,4,RB[3]); e.ell(x+62,G-7.4,5,2,'#101830'); e.rect(x+54,G-10,10,1,RB[0]); }
    },
  };

  // ================= vista 3/4 elevada: topo + lateral direita em perspectiva =================
  const WD=['#f6d8a4','#dca064','#b87c44','#8e5c32','#66391e','#44240e','#2a1408'];
  const WK=['#dcae78','#b4804a','#8c5c34','#684020','#482a10','#2e1808','#1c0e06'];
  const CB=['#fbe8bc','#e8c282','#cca068','#a47e4a','#7c5c34','#56401e','#3a2a14'];
  const OR=['#ffe2b0','#ffb460','#f08a30','#d06a1c','#a8481a','#7a2e1c','#4e1a1c'];
  const CV=['#dcea9c','#aac26c','#7c9c48','#5a7a38','#3e5a2c','#2a3e20','#1a2814'];
  const ST=['#eef6fb','#c0d4e0','#92aec0','#6a8aa4','#4a6a88','#34506c','#243650'];
  const INKB=['#4a3a50','#32243a','#201528','#120a1a'];
  function shadow3(e,x,G,w,dx,dy){ e.ell(x+w/2+dx*0.5,G+dy*0.3+1,w/2+dx*0.8+5,3.4+Math.abs(dy)*0.45,'#1c1226'); }
  function slab(e,x,G,w,h,dx,dy,P){
    e.band([[x+w,G-h],[x+w+dx,G-h+dy],[x+w+dx,G+dy],[x+w,G]],[P[3],P[4],P[5]],[2,3,2],'x',x+w,x+w+dx);
    e.band([[x,G-h],[x+dx,G-h+dy],[x+w+dx,G-h+dy],[x+w,G-h]],[P[2],P[1],P[1],P[0]],[1,3,3,1],'y',G-h+dy,G-h);
    e.band([[x,G-h],[x+w,G-h],[x+w,G],[x,G]],[P[0],P[1],P[2],P[3],P[4]],[1,4,14,6,3],'x',x,x+w);
    e.rect(x,G-h,w,1.2,P[0]); e.rect(x,G-h,1.2,h,P[0]); e.rect(x,G-2,w,2,P[5]); e.rect(x+w,G-h,1,h,P[2]);
    e.poly([[x+dx,G-h+dy],[x+w+dx,G-h+dy],[x+w+dx,G-h+dy+1],[x+dx,G-h+dy+1]],P[0]);
  }
  const sideLine=(e,x,w,dx,dy,yy,col,t)=>e.poly([[x+w,yy],[x+w+dx,yy+dy],[x+w+dx,yy+dy+t],[x+w,yy+t]],col);
  const depthLine=(e,px,y,dx,dy,col,t)=>e.poly([[px,y],[px+dx,y+dy],[px+dx+t,y+dy],[px+t,y]],col);
  function topQuad(x,G,w,h,dx,dy,f){ const c=[[x,G-h],[x+w,G-h],[x+w+dx,G-h+dy],[x+dx,G-h+dy]]; if(!f) return c; const cx=x+w/2+dx/2, cy=G-h+dy/2; return c.map(q=>[cx+(q[0]-cx)*f,cy+(q[1]-cy)*f*1.0]); }
  // interior visto de cima: piso escuro + parede traseira iluminada
  function hole(e,x,G,w,h,dx,dy,f,P,wallH){ const q=topQuad(x,G,w,h,dx,dy,f);
    e.band(q,[INKB[0],INKB[1],INKB[2],INKB[3]],[1,2,3,2],'y',q[2][1],q[0][1]);
    e.poly([q[3],q[2],[q[2][0],q[2][1]+(wallH||6)],[q[3][0],q[3][1]+(wallH||6)]],P[2]); e.rect(q[3][0],q[3][1],q[2][0]-q[3][0],1,P[0]); e.rect(q[3][0],q[3][1]+(wallH||6)-1,q[2][0]-q[3][0],1,P[4]);
    return q; }
  // tampa articulada atrás (face externa p/ th<0.8, interna depois)
  function lid3(e,x,G,w,h,dx,dy,P,th,Ld,innerP,deco){
    const Bx0=x+dx, Bx1=x+w+dx, By=G-h+dy, cs=Math.cos(th), sn=Math.sin(th);
    const fx=-dx*cs, fy=-dy*cs-Ld*sn;
    const Q=[[Bx0,By],[Bx1,By],[Bx1+fx,By+fy],[Bx0+fx,By+fy]];
    const y0=Math.min(Q[0][1],Q[3][1]),y1=Math.max(Q[0][1],Q[3][1]);
    if(th<0.85){ e.band(Q,[P[2],P[1],P[1],P[0]],[1,3,3,1],'y',y0,y1); // faixas pelo eixo y
      e.poly([Q[2],Q[3],[Q[3][0],Q[3][1]+2.4],[Q[2][0],Q[2][1]+2.4]],P[3]); e.rect(Q[3][0],Q[3][1],Q[2][0]-Q[3][0],1,P[0]); }
    else { const ip=innerP||P; e.band(Q,[ip[0],ip[1],ip[2],ip[3]],[1,3,3,2],'y',y0,y1); e.poly([Q[2],Q[3],[Q[3][0]-1,Q[3][1]-2.4],[Q[2][0]+1,Q[2][1]-2.4]],P[1]); e.rect(Q[3][0],Q[3][1]-2.4,Q[2][0]-Q[3][0],1,P[0]); e.rect(Q[3][0],Q[3][1]-0.5,Q[2][0]-Q[3][0],1,P[4]); }
    if(deco) deco(Q,th);
    return Q; }
  const lidTh=(o,done)=>done?1.95:0.95+o*0.75;
  // bagunça vista de cima (cachos de itens)
  const blob=(e,x,y,rx,ry,c0,c1)=>{ e.ell(x,y,rx,ry,c1); e.ell(x-rx*0.2,y-ry*0.25,rx*0.7,ry*0.6,c0); };
  const hero3={
    caixa(p,x,G,o,done,fi,c,u){
      const e=mkE(c,u); p.id(); const w=52,h=32,dx=14,dy=-9;
      shadow3(e,x,G,w,dx,dy); e.ell(x+w+17,G-1,5,2,'#4a8a2a'); e.ell(x+w+16,G-1.6,3,1.2,'#8ad060'); blob(e,x-7,G-1,3.4,2,'#ff9a8a','#d84a3a');
      slab(e,x,G,w,h,dx,dy,WD);
      for(let k=1;k<4;k++){ const yy=G-h+k*8; e.rect(x,yy,w,1.4,WD[5]); e.rect(x,yy+1.4,w,0.9,WD[0]); sideLine(e,x,w,dx,dy,yy,WD[5],1.4); sideLine(e,x,w,dx,dy,yy+1.4,WD[2],0.9); }
      [[x,6],[x+w-6,6]].forEach(([px,pw])=>{ e.band([[px,G-h],[px+pw,G-h],[px+pw,G],[px,G]],[WD[2],WD[3],WD[4],WD[5]],[1,3,3,2],'x',px,px+pw); e.rect(px,G-h,pw,1,WD[0]); });
      for(let i=0;i<12;i++){ e.rect(Math.round(x+8+hsh(i,1)*36),Math.round(G-h+2+hsh(i,2)*28),4+(i%3),1,WD[5]); e.rect(Math.round(x+9+hsh(i,3)*34),Math.round(G-h+3+hsh(i,4)*26),3,1,WD[0]); }
      [[2,4],[2,h-6],[w-4,4],[w-4,h-6]].forEach(([a,b])=>{ e.rect(x+a,G-h+b,1.8,1.8,SIL[3]); e.rect(x+a,G-h+b,1,1,SIL[0]); });
      e.band([[x+14,G-21],[x+38,G-21],[x+38,G-11],[x+14,G-11]],['#f06a5a','#c83a3a','#8a1a22'],[1,3,2],'y',G-21,G-11); e.rect(x+17,G-18,3,5,'#f8f4e8'); e.rect(x+22,G-18,3,5,'#f8f4e8'); e.rect(x+27,G-18,7,1,'#f8f4e8'); e.rect(x+27,G-15,5,1,'#f8f4e8');
      e.band([[x+44,G-20],[x+50,G-20],[x+49,G-9],[x+46,G-6]],['#e0483e','#a82230','#6a0e1c'],[1,2,2],'y',G-20,G-6);
      e.rect(x+5,G-h+3,5,6,'#5aa03a'); e.rect(x+5,G-h+3,2,6,'#9ad07a');
      const th=done?1.95:o?lidTh(o,false):0, open=th>0.3;
      if(open){ const q=hole(e,x,G,w,h,dx,dy,0.9,WD,6); const cx=x+w/2+dx/2, cy=G-h+dy/2+2;
        if(!done){ [[-14,2],[-6,-1],[3,2],[12,-1],[-9,5],[6,5]].forEach(([a,b],i)=>blob(e,cx+a,cy+b,5.4,4.2,i%2?'#ffd060':'#ffb040',i%2?'#e07a20':'#c85a18')); e.ell(cx-2,cy-5,3,1.6,'#5aa03a'); e.rect(cx+8,cy-6,2,3,'#3a7a2a'); e.rect(cx-18,cy-4,6,1.6,'#e8c070'); }
        else { e.rect(cx-10,cy,12,1.6,'#e8c070'); e.ell(cx+8,cy+2,3,1.6,'#a85a28'); } }
      if(th>0){ lid3(e,x,G,w,h,dx,dy,WD,th,16,WK,(Q,t)=>{ if(t<0.85){ depthLine(e,x+14,G-h,dx,dy,WD[5],1.4); depthLine(e,x+36,G-h,dx,dy,WD[5],1.4); e.band([[x+20,G-h-0.5],[x+30,G-h-0.5],[x+30+dx,G-h+dy-0.5],[x+20+dx,G-h+dy-0.5]],['#dfe4ec','#aab2c2'],[1,1],'y',G-h+dy,G-h); } }); }
      else { lid3(e,x,G,w,h,dx,dy,WD,0,16,WK,()=>{ depthLine(e,x+14,G-h,dx,dy,WD[5],1.4); depthLine(e,x+36,G-h,dx,dy,WD[5],1.4); e.band([[x+20,G-h-0.5],[x+30,G-h-0.5],[x+30+dx,G-h+dy-0.5],[x+20+dx,G-h+dy-0.5]],['#dfe4ec','#aab2c2'],[1,1],'y',G-h+dy,G-h); depthLine(e,x+4,G-h,dx,dy,WD[3],2); }); }
    },
    caixote(p,x,G,o,done,fi,c,u){
      const e=mkE(c,u); p.id(); const w=60,h=42,dx=16,dy=-10;
      shadow3(e,x,G,w,dx,dy);
      slab(e,x,G,w,h,dx,dy,WK);
      for(let k=1;k<4;k++){ const yy=G-h+k*10.5; e.rect(x,yy,w,1.5,WK[6]); e.rect(x,yy+1.5,w,1,WK[0]); sideLine(e,x,w,dx,dy,yy,WK[6],1.5); sideLine(e,x,w,dx,dy,yy+1.5,WK[1],1); }
      for(let i=0;i<16;i++){ e.rect(Math.round(x+7+hsh(i,5)*46),Math.round(G-h+2+hsh(i,6)*38),4,1,WK[5]); e.rect(Math.round(x+8+hsh(i,7)*44),Math.round(G-h+3+hsh(i,8)*36),3,1,WK[0]); }
      // cantoneiras de aço (frente e lateral)
      [[0,0],[w-8,0],[0,h-8],[w-8,h-8]].forEach(([a,b])=>{ e.band([[x+a,G-h+b],[x+a+8,G-h+b],[x+a+8,G-h+b+8],[x+a,G-h+b+8]],ST.slice(0,5),[1,2,3,3,2],'y',G-h+b,G-h+b+8); e.rect(x+a+2.4,G-h+b+2.4,1.8,1.8,ST[5]); e.rect(x+a+2.4,G-h+b+2.4,1,1,ST[0]); });
      e.band([[x+w,G-h],[x+w+dx,G-h+dy],[x+w+dx,G-h+dy+6],[x+w,G-h+6]],ST.slice(1,5),[1,2,3,2],'x',x+w,x+w+dx);
      // estêncil amarelo + faixa vermelha
      [[12,12,4,10],[18,12,4,10],[24,17,4,5],[30,12,4,10],[38,12,10,2.4],[38,18,10,2.4],[38,22,6,1.4]].forEach(([a,b,cw,ch])=>{ e.rect(x+a,G-h+b+6,cw,ch,'#f2c230'); e.rect(x+a,G-h+b+6,cw,1,'#fff0a0'); });
      e.rect(x+12,G-14,40,2.4,'#c83a3a'); e.rect(x+12,G-14,40,1,'#ff8a80'); e.rect(x+12,G-11.6,40,1,'#7a141c');
      // alça de corda na lateral
      e.poly([[x+w+3,G-h+12],[x+w+4+dx*0.3,G-h+12+dy*0.3],[x+w+4+dx*0.3,G-h+26+dy*0.3],[x+w+3,G-h+26]],'#c8a468'); e.rect(x+w+4,G-h+14,2,10,'#8a6a3a');
      e.band([[x+3,G-26],[x+8,G-26],[x+7,G-14],[x+4,G-14]],['#e0483e','#a82230','#6a0e1c'],[1,2,2],'y',G-26,G-14);
      const th=done?1.95:o?lidTh(o,false)*0.85:0, open=th>0.3;
      if(open){ hole(e,x,G,w,h,dx,dy,0.92,WK,7); const cx=x+w/2+dx/2, cy=G-h+dy/2+3;
        if(!done){ e.band([[cx-18,cy-3],[cx-4,cy-3],[cx-4,cy+3],[cx-18,cy+3]],['#98b468','#6a8a3c','#46602a'],[1,2,2],'y',cy-3,cy+3); e.rect(cx-16,cy-2,10,1,'#d8f090'); e.rect(cx-14,cy-3,2,2,'#f2c230');
          blob(e,cx+6,cy,7,3.6,'#e8c882','#b08a44'); e.rect(cx+10,cy-5,6,3,'#788858'); e.rect(cx+12,cy-5,6,1,'#c0d890'); e.ell(cx,cy+4,5,2,'#a85a28'); }
        else { e.rect(cx-14,cy,16,1.6,'#e8c882'); } }
      const lidDeco=(Q,t)=>{ if(t<0.85){ [8,28,48].forEach(a=>depthLine(e,x+a,G-h,dx,dy,WK[6],1.4)); e.band([[x,G-h],[x+8,G-h],[x+8+dx,G-h+dy],[x+dx,G-h+dy]],ST.slice(0,4),[1,2,2,1],'y',G-h+dy,G-h); e.band([[x+w-8,G-h],[x+w,G-h],[x+w+dx,G-h+dy],[x+w-8+dx,G-h+dy]],ST.slice(0,4),[1,2,2,1],'y',G-h+dy,G-h); } };
      lid3(e,x,G,w,h,dx,dy,WK,th,18,WD,lidDeco);
      if(open&&!done){ p.xf(-0.5,x+w+6,G-h-4); e.band([[0,-1.4],[24,-1.4],[24,1.4],[0,1.4]],ST.slice(0,5),[1,2,2,2,1],'y',-1.4,1.4); e.rect(22,-2.4,4,5,ST[3]); p.id(); }
    },
    papelao(p,x,G,o,done,fi,c,u){
      const e=mkE(c,u); p.id(); const w=36,h=24,dx=11,dy=-7;
      shadow3(e,x,G,w,dx,dy); e.ell(x-3,G-1,5,2,'#5a7a3a'); e.rect(x+w+14,G-2,7,2,'#f8f4e8');
      slab(e,x,G,w,h,dx,dy,CB);
      e.rect(x,G-3,w,3,CB[4]); e.rect(x+16,G-h,1.4,h,CB[3]); sideLine(e,x,w,dx,dy,G-12,CB[4],1);
      e.band([[x+13,G-h],[x+23,G-h],[x+23,G-h+8],[x+13,G-h+8]],['#f4f6fa','#c4ccd8','#9aa4b4'],[1,2,2],'y',G-h,G-h+8); // fita
      e.band([[x+4,G-16],[x+16,G-16],[x+16,G-10],[x+4,G-10]],['#f06a5a','#c83a3a','#8a1a22'],[1,3,2],'y',G-16,G-10); e.rect(x+6,G-14,7,1,'#f8f4e8'); e.rect(x+6,G-12,4,1,'#f8f4e8');
      e.rect(x+21,G-13,9,1,CB[6]); e.rect(x+21,G-10,6,1,CB[6]); e.poly([[x+26,G-20],[x+30,G-20],[x+28,G-23]],CB[6]);
      e.ell(x+7,G-6,5,2.4,CB[4]); e.band([[x+29,G-9],[x+33,G-9],[x+33,G-4],[x+30,G-4]],['#e0483e','#a82230','#6a0e1c'],[1,2,2],'y',G-9,G-4);
      for(let i=0;i<14;i++) e.rect(Math.round(x+2+hsh(i,2)*32),Math.round(G-h+2+hsh(i,3)*20),1,1,CB[5]);
      const a=done?1:(o?0.55+o*0.45:0), q=topQuad(x,G,w,h,dx,dy,1);
      if(a>0){ // aberta: interior + abas dobradas
        hole(e,x,G,w,h,dx,dy,0.94,CB,5); const cx=x+w/2+dx/2, cy=G-h+dy/2+2;
        if(!done){ blob(e,cx-8,cy,6,3.4,'#ffffff','#c4ccd8'); e.rect(cx+4,cy-2,8,4,'#c83a3a'); e.rect(cx+4,cy-2,8,1,'#ff8a80'); e.ell(cx+14,cy+1,3,2,'#5a7a3a'); }
        const k=a; // back flap (sobe), front flap (cai pra frente), laterais (abrem pra fora)
        e.band([[x+dx,G-h+dy],[x+w+dx,G-h+dy],[x+w+dx-1,G-h+dy-13*k],[x+dx+1,G-h+dy-13*k]],[CB[0],CB[1],CB[2]],[1,3,2],'y',G-h+dy-13*k,G-h+dy);
        e.band([[x-1,G-h],[x+w+1,G-h],[x+w+3,G-h+9*k],[x-3,G-h+9*k]],[CB[3],CB[4],CB[5]],[1,3,2],'y',G-h,G-h+9*k); e.rect(x,G-h,w,1,CB[0]);
        e.band([[x,G-h],[x+dx,G-h+dy],[x+dx-11*k,G-h+dy-1*k],[x-11*k,G-h-1]],[CB[1],CB[2],CB[3]],[1,3,2],'x',x-11*k,x+dx);
        e.band([[x+w,G-h],[x+w+dx,G-h+dy],[x+w+dx+11*k,G-h+dy-1],[x+w+11*k,G-h-1]],[CB[2],CB[3],CB[4]],[1,3,2],'x',x+w,x+w+dx+11*k);
      } else { e.band(q,[CB[2],CB[1],CB[1],CB[0]],[1,3,3,1],'y',G-h+dy,G-h); depthLine(e,x+16,G-h,dx,dy,CB[4],1.4); e.band([[x+13,G-h],[x+23,G-h],[x+23+dx,G-h+dy],[x+13+dx,G-h+dy]],['#f4f6fa','#c4ccd8'],[1,1],'y',G-h+dy,G-h); }
    },
    mochila(p,x,G,o,done,fi,c,u){
      const e=mkE(c,u); p.id(); const dx=9,dy=-6;
      shadow3(e,x,G,32,dx,dy);
      // alças caídas
      e.poly([[x+3,G-4],[x-6,G-1],[x-6,G+1],[x+3,G-1]],CV[4]); e.rect(x-6,G-1,4,1,CV[1]); e.poly([[x+30,G-4],[x+39,G],[x+38,G+2],[x+30,G-1]],CV[4]);
      const front=e.smooth([[x+1,G-1],[x,G-12],[x+3,G-23],[x+10,G-27],[x+24,G-27],[x+31,G-23],[x+34,G-12],[x+33,G-1]],4);
      ext(e,front,dx,dy,CV[4],[CV[0],CV[1],CV[2]],(p0,p1)=>0);
      e.band(front,[CV[0],CV[1],CV[2],CV[3],CV[4]],[1,4,12,6,3],'x',x,x+34);
      e.poly([[x+3,G-22],[x+8,G-26],[x+12,G-26],[x+8,G-14]],CV[0]); // brilho
      // bolso frontal com zíper, fivela, patch, sangue
      const pk=e.smooth([[x+5,G-3],[x+4,G-12],[x+8,G-14],[x+26,G-14],[x+30,G-12],[x+29,G-3]],3);
      e.band(pk,[CV[1],CV[2],CV[3],CV[4],CV[5]],[1,3,6,3,2],'x',x+4,x+30); e.rect(x+6,G-13.4,22,1,CV[0]); e.rect(x+6,G-6,22,1,CV[6]); e.rect(x+6,G-5,22,0.8,CV[2]);
      e.rect(x+15,G-13,4,4,'#f2c230'); e.rect(x+15,G-13,4,1,'#fff0a0'); e.rect(x+16,G-12,2,2,'#26242c');
      e.band([[x+7,G-11],[x+14,G-11],[x+14,G-6],[x+7,G-6]],['#f06a5a','#c83a3a','#8a1a22'],[1,2,2],'y',G-11,G-6); e.rect(x+8,G-9,5,1,'#f8f4e8');
      e.band([[x+27,G-22],[x+31,G-22],[x+31,G-12],[x+28,G-9]],['#e0483e','#a82230','#6a0e1c'],[1,2,2],'y',G-22,G-9);
      for(let i=0;i<12;i++) e.rect(Math.round(x+3+hsh(i,2)*28),Math.round(G-24+hsh(i,3)*22),1,1,CV[6]);
      // rolo de dormir
      e.band([[x+4,G-32],[x+30,G-32],[x+30,G-27],[x+4,G-27]],['#ff8a7a','#d84a3a','#a02a2a','#6a1420'],[1,2,2,1],'y',G-32,G-27); e.ell(x+4,G-29.5,2.4,2.8,'#a02a2a'); e.ell(x+30,G-29.5,2.4,2.8,'#d84a3a'); e.rect(x+14,G-32,1.6,5,'#26242c'); e.rect(x+21,G-32,1.6,5,'#26242c'); e.rect(x+6,G-32,22,1,'#ffb0a0');
      // aba (abre p/ trás), de cima você vê o interior
      const th=done?1.95:(o?0.95+o*0.75:0);
      if(th>0.3){ const q=[[x+dx+2,G-27+dy+2],[x+31+dx,G-27+dy+2],[x+28,G-26],[x+4,G-26]];
        e.band(q,[INKB[0],INKB[1],INKB[2],INKB[3]],[1,2,3,2],'y',G-27+dy,G-26); const cx=x+18+dx/2, cy=G-28+dy/2;
        if(!done){ blob(e,cx-6,cy,5,3,'#ff9a8a','#d84a3a'); e.rect(cx+2,cy-4,4,6,'#cfeaff'); e.rect(cx+2,cy-4,1.4,6,'#ffffff'); e.rect(cx+8,cy-2,5,3,'#e8c070'); }
        p.xf(-th,x+4,G-26); e.band([[0,-3],[28,-3],[26,6],[2,6]],[CV[0],CV[2],CV[3],CV[4]],[1,3,3,2],'y',-3,6); e.rect(12,4,3,4,'#26242c'); e.rect(12,5,3,1,SIL[1]); p.id(); }
      else { e.band([[x+2,G-27],[x+32,G-27],[x+32+dx,G-27+dy],[x+2+dx,G-27+dy]],[CV[2],CV[1],CV[1],CV[0]],[1,3,3,1],'y',G-27+dy,G-27); e.rect(x+14,G-27,6,1,CV[6]); }
    },
    carrinho(p,x,G,o,done,fi,c,u){
      const e=mkE(c,u); p.id(); const sk=done?0:Math.round(Math.sin(fi*1.6)*o); const dx=15,dy=-9;
      shadow3(e,x,G,50,dx,dy);
      const wheel=(wx,wy)=>{ e.ell(wx,wy,3.6,3.6,'#26242c'); e.ell(wx-0.6,wy-0.6,2.4,2.4,'#5a586c'); e.ell(wx,wy,1.2,1.2,'#d4d8e0'); };
      wheel(x+dx*0.85+7,G+dy*0.85-3.4); wheel(x+dx*0.85+41,G+dy*0.85-3.4);
      // trilho inferior + pernas
      e.band([[x+6,G-13],[x+48,G-13],[x+48+dx,G-13+dy],[x+6+dx,G-13+dy]],SIL.slice(0,4),[1,2,2,2],'y',G-13+dy,G-13);
      e.rect(x+8,G-12,3,9,SIL[3]); e.rect(x+8,G-12,1,9,SIL[0]); e.rect(x+42,G-12,3,9,SIL[3]); e.rect(x+42,G-12,1,9,SIL[0]);
      wheel(x+10,G-3.4); wheel(x+43,G-3.4);
      // interior (cesto) visto de cima
      const tq=[[x+2,G-36],[x+50,G-36],[x+50+dx,G-36+dy],[x+2+dx,G-36+dy]];
      e.band(tq,[INKB[0],INKB[1],INKB[2]],[1,2,3],'y',G-36+dy,G-36);
      // face lateral (grade)
      const sd=[[x+50,G-36],[x+50+dx,G-36+dy],[x+46+dx,G-13+dy],[x+46,G-13]];
      e.band(sd,[INKB[1],INKB[2],INKB[3]],[1,1,1],'x',x+46,x+50+dx);
      for(let k=0;k<5;k++){ const t=(k+1)/6; const ax=x+50+dx*t-4*(1), ay0=G-36+dy*t, ay1=G-13+dy*t; e.poly([[x+50+dx*t,ay0],[x+50+dx*t+1.1,ay0],[x+46+dx*t+1.1,ay1],[x+46+dx*t,ay1]],SIL[2]); }
      [0.33,0.66].forEach(t=>e.poly([[x+50-4*t,G-36+23*t],[x+50-4*t+dx,G-36+23*t+dy],[x+50-4*t+dx,G-36+23*t+dy+1.1],[x+50-4*t,G-36+23*t+1.1]],SIL[2]));
      // conteúdo (aparece por cima da borda frontal)
      const cx=x+26+dx/2+sk, cy=G-36+dy/2;
      if(!done){ blob(e,cx-9,cy-2,7,5,'#9ad07a','#5a9a3a'); blob(e,cx+6,cy-1,5,4,'#ff9a8a','#d84a3a'); e.ell(cx-1,cy+1,7,4.6,'#32243a'); e.ell(cx-2,cy,5,3,'#4a3a50'); e.rect(cx+10,cy-6,5,6,'#f8f4e8'); e.rect(cx+10,cy-6,5,1,'#ffffff'); e.rect(cx-14,cy-4,3,8,'#6ab0d0'); e.rect(cx-14,cy-4,1,8,'#cfeaff'); }
      else { e.rect(cx-12,cy,14,1.4,'#e8c070'); e.ell(cx+6,cy+1,3,1.6,'#a85a28'); }
      // frente do cesto (grade) por cima
      const fq=[[x+2,G-36],[x+50,G-36],[x+46,G-13],[x+6,G-13]];
      e.band(fq,[INKB[1],INKB[2],INKB[3]],[1,2,2],'y',G-36,G-13);
      if(!done){ e.ell(x+22+sk,G-24,8,5,'#32243a'); e.ell(x+22+sk,G-25,6,3,'#4a3a50'); e.rect(x+32,G-30,8,5,'#e0c070'); }
      for(let k=0;k<8;k++){ const bx=x+8+k*5.4, bx2=x+9.4+k*4.8; e.poly([[bx,G-34],[bx+1.2,G-34],[bx2+1.2,G-14],[bx2,G-14]],SIL[2]); e.poly([[bx,G-34],[bx+0.5,G-34],[bx2+0.5,G-14],[bx2,G-14]],SIL[0]); }
      [G-27,G-20].forEach((yy,i)=>{ e.rect(x+4+i*1.5,yy,44-i*3,1.2,SIL[2]); e.rect(x+4+i*1.5,yy,44-i*3,0.6,SIL[0]); });
      // aro superior (frente, lateral, fundo, esquerda) cromado
      e.band([[x+1,G-37.6],[x+51,G-37.6],[x+51,G-35.4],[x+1,G-35.4]],SIL,[1,1,2,2,1],'y',G-37.6,G-35.4);
      e.poly([[x+50,G-37],[x+50+dx,G-37+dy],[x+50+dx,G-35+dy],[x+50,G-35]],SIL[1]); e.poly([[x+2,G-37],[x+2+dx,G-37+dy],[x+2+dx,G-35+dy],[x+2,G-35]],SIL[1]); e.poly([[x+2+dx,G-37+dy],[x+50+dx,G-37+dy],[x+50+dx,G-35+dy],[x+2+dx,G-35+dy]],SIL[2]);
      // placa, ferrugem, sangue
      e.rect(x+19,G-15,10,2,'#f2c230'); e.rect(x+19,G-15,10,0.8,'#fff0a0'); e.poly([[x+10,G-18],[x+20,G-19],[x+21,G-14],[x+10,G-15]],'#a85a28'); e.rect(x+11,G-18,6,1,'#d8843a'); e.poly([[x+36,G-26],[x+43,G-26],[x+43,G-20],[x+36,G-19]],'#a85a28');
      e.band([[x+4,G-33],[x+8,G-33],[x+7,G-25],[x+5,G-24]],['#e0483e','#a82230','#6a0e1c'],[1,2,2],'y',G-33,G-24);
      // alça vermelha: sobe no canto traseiro esquerdo e corre ao longo da profundidade
      e.poly([[x+dx-1.4,G-36+dy],[x+dx+1.4,G-36+dy],[x+dx-4.6,G-50+dy],[x+dx-7.4,G-50+dy]],'#c83a3a'); e.rect(x+dx-3,G-49+dy,1,10,'#ff8a80');
      e.poly([[x+dx-7.4,G-50+dy],[x+dx-4.4,G-50+dy],[x-4.4,G-50],[x-7.4,G-50]],'#c83a3a'); e.poly([[x+dx-7.4,G-50+dy],[x+dx-6,G-50+dy],[x-6,G-50],[x-7.4,G-50]],'#ff8a80');
      e.poly([[x-7.4,G-50],[x-4.4,G-50],[x+1,G-37],[x-2,G-37]],'#a02a2a');
    },
    // ---- Pelourinho (Salvador): carrinho de coco, banca de souvenir, caixa de isopor
    coco(p,x,G,o,done,fi,c,u){
      const e=mkE(c,u); p.id(); const w=48,h=24,dx=12,dy=-8, B=['#c4ecff','#80c8f2','#3e8ed2','#2c66aa','#1e4882','#14305a','#0c1e3c'], bob=done?0:Math.round(Math.sin(fi*1.7)*o*2);
      shadow3(e,x,G,w+8,dx,dy);
      const wheel=(wx,wy,r)=>{ e.ell(wx,wy,r,r,'#26242c'); e.ell(wx-.6,wy-.6,r*.66,r*.66,'#7a5a3a'); e.ell(wx-1,wy-1,r*.3,r*.3,'#c89a5a'); e.ell(wx,wy,r*.2,r*.2,'#e8c890'); };
      wheel(x+dx+w-8,G+dy-7,7);
      e.rect(x+4,G-12,3,12,WD[4]); e.rect(x+4,G-12,1,12,WD[2]); e.poly([[x+w,G-20],[x+w+18,G-27],[x+w+18,G-24],[x+w,G-17]],WD[3]); e.poly([[x+w,G-20],[x+w+18,G-27],[x+w+18,G-26],[x+w,G-19]],WD[1]);
      slab(e,x,G-10,w,h,dx,dy,B);
      e.rect(x+2,G-10-h+6,w-4,1.2,B[5]); e.rect(x+2,G-17,w-4,1.2,B[5]);
      e.band([[x+8,G-29],[x+40,G-29],[x+40,G-20],[x+8,G-20]],['#fff0a0','#e8b84a','#b8862a'],[1,2,2],'y',G-29,G-20); e.rect(x+8,G-29,32,1,'#fff8d0');
      e.ell(x+13,G-24.5,2.6,2.6,'#3a8a3a'); e.ell(x+19,G-24.5,2.6,2.6,'#3a8a3a'); e.rect(x+24,G-26,12,1.2,'#7a4a1a'); e.rect(x+24,G-23,9,1.2,'#7a4a1a');
      wheel(x+11,G-7,8);
      const cx=x+w/2+dx/2, cy=G-10-h+dy/2;
      if(!done){ [[-14,2],[-5,0],[4,2],[13,0],[-9,-5],[1,-6],[9,-5],[-3,-11],[5,-11]].forEach(([a,b],i)=>{ const yy=cy+b-(i%3===fi%3?bob:0); e.ell(cx+a,yy,5,4.4,'#24521f'); e.ell(cx+a,yy,4.4,3.8,'#2e6a2a'); e.ell(cx+a-1,yy-1,3.2,2.6,'#5aa03a'); e.rect(cx+a-2.5,yy-3,2,1,'#c8f090'); }); }
      else { e.ell(cx-6,cy+1,5,4,'#2e4a24'); e.ell(cx+6,cy+2,4.4,3.4,'#5a4a2a'); e.ell(cx+6,cy+2,2.8,1.8,'#f4f0e0'); }
      e.poly([[cx+12,cy-12],[cx+14.5,cy-12],[cx+19,cy+1],[cx+16,cy+2]],'#c4ccdc'); e.poly([[cx+12,cy-12],[cx+13,cy-12],[cx+17,cy+2],[cx+16,cy+2]],'#fafcff'); e.rect(cx+10.5,cy-17,3,6,'#5a3a1a');
      e.band([[x+2,G-26],[x+6,G-26],[x+5,G-15],[x+3,G-14]],['#e0483e','#a82230','#6a0e1c'],[1,2,2],'y',G-26,G-14);
    },
    banca(p,x,G,o,done,fi,c,u){
      const e=mkE(c,u); p.id(); const w=72,h=22,dx=12,dy=-8, sk=done?0:Math.round(Math.sin(fi*1.6)*o*1.5), ty=G-h;
      shadow3(e,x,G,w,dx,dy);
      e.rect(x+dx+w-7,G+dy-h,3,h,WD[5]); e.rect(x+dx+2,G+dy-h,3,h,WD[5]);
      for(const px of [x+3,x+w-6]){ e.rect(px,ty,3,h,WD[4]); e.rect(px,ty,1,h,WD[2]); }
      for(const px of [x+2,x+w-4]){ e.rect(px,ty-36,2,36,WD[3]); e.rect(px,ty-36,1,36,WD[1]); } e.rect(x+dx+w-5,ty-36+dy,2,36,WD[4]);
      slab(e,x,ty+2,w,6,dx,dy,WD);
      for(let k=0;k<w;k+=8) e.rect(x+k,ty+2,4,12,(k/8)%3===0?'#e8b84a':(k/8)%3===1?'#5aa88a':'#d9747a'); for(let k=4;k<w;k+=8) e.rect(x+k,ty+2,4,12,'#f2eee4');
      e.rect(x,ty+13,w,1.2,'#3a2030'); e.rect(x,ty+2,w,1,'#ffffff');
      const aw=ty-36; e.poly([[x-4,aw],[x+w+4,aw],[x+w+4+dx,aw+dy],[x-4+dx,aw+dy]],'#2f5fa8');
      for(let k=0;k<w+8;k+=10) e.poly([[x-4+k,aw],[x+1+k,aw],[x+1+k+dx,aw+dy],[x-4+k+dx,aw+dy]],'#f2eee4');
      for(let k=0;k<w+8;k+=10) e.poly([[x-4+k,aw],[x+6+k,aw],[x+1+k,aw+6]],(k/10)%2?'#f2eee4':'#2f5fa8'); e.rect(x-4,aw,w+8,1,'#8ab8f0');
      const cs=['#e83a3a','#ffd23f','#3a8ae8','#4ac860','#ff8ad0','#f2f2f2'];
      for(let k=0;k<12;k++){ const L=8+hsh(k,3)*12; e.rect(x+4+k*5.6+(k%2?sk:0),aw+6,1.4,L,cs[k%6]); }
      const my=ty+2+dy/2;
      if(!done){ e.rect(x+8,my-24,2,26,'#a8783a'); e.rect(x+8,my-24,1,26,'#d8a868'); e.ell(x+9,my-3,4.4,4,'#c8a050'); e.ell(x+8,my-4,2.2,2,'#e8c870'); e.ell(x+9.4,my-2,1.6,1.6,'#5a3a1a'); e.rect(x+11,my-23,1,22,'#d8d8e0');
        [[22,'#e8b84a'],[30,'#d9747a'],[38,'#2f5fa8']].forEach(([a,col])=>{ e.rect(x+a,my-10,5,9,col); e.ell(x+a+2.5,my-12,2.8,2.8,'#8a5a3a'); e.rect(x+a,my-13,5,1.4,'#f2f2f2'); e.rect(x+a,my-10,1,9,'#ffffff'); });
        e.rect(x+48,my-3,18,4,'#8a6a4a'); for(let k=0;k<4;k++){ e.rect(x+49+k*4,my-6,3,3,k%2?'#f4ecd8':'#b8783a'); e.rect(x+49+k*4,my-6,3,1,'#ffffff'); } }
      else { e.rect(x+20,my-2,14,1.4,'#e8c070'); e.rect(x+50,my-2,8,1.4,'#e8c070'); }
      e.band([[x+60,ty+4],[x+64,ty+4],[x+63,ty+12],[x+61,ty+13]],['#e0483e','#a82230','#6a0e1c'],[1,2,2],'y',ty+4,ty+13);
    },
    isopor(p,x,G,o,done,fi,c,u){
      const e=mkE(c,u); p.id(); const w=46,h=28,dx=12,dy=-8, ISO=['#ffffff','#eef2f8','#d4dce8','#aab6c8','#7e8aa4','#56607c','#363e58'];
      shadow3(e,x,G,w,dx,dy); slab(e,x,G,w,h,dx,dy,ISO);
      e.rect(x+3,G-h+5,w-6,1,ISO[3]); e.rect(x+3,G-7,w-6,1,ISO[3]);
      for(let i=0;i<16;i++) e.rect(Math.round(x+3+hsh(i,4)*(w-6)),Math.round(G-h+3+hsh(i,6)*(h-6)),1,1,ISO[3]);
      e.band([[x+9,G-19],[x+36,G-19],[x+36,G-12],[x+9,G-12]],['#6ac0f0','#2f78c0','#1f4a8a'],[1,2,2],'y',G-19,G-12); e.rect(x+12,G-17,9,1,'#e8f6ff');
      e.band([[x+31,G-25],[x+36,G-25],[x+35,G-14],[x+32,G-12]],['#e0483e','#a82230','#6a0e1c'],[1,2,2],'y',G-25,G-12);
      e.rect(x-3,G-h+4,3,10,ISO[4]); e.rect(x-3,G-h+4,1,10,ISO[1]);
      const th=done?1.95:o?lidTh(o,false):0;
      if(th>0.3){ hole(e,x,G,w,h,dx,dy,0.88,ISO,5); const cx=x+w/2+dx/2, cy=G-h+dy/2+2;
        if(!done){ [[-10,1],[-2,-1],[7,1]].forEach(([a,b],i)=>{ e.rect(cx+a,cy+b-7,4,8,i%2?'#4a9a4a':'#3a7ac0'); e.rect(cx+a,cy+b-7,1,8,'#cfeaff'); e.rect(cx+a+1,cy+b-9,2,2,'#d4d8e0'); }); blob(e,cx+12,cy+2,4,3,'#e6f8ff','#8ab8d8'); blob(e,cx-14,cy+2,4,3,'#e6f8ff','#8ab8d8'); }
        else blob(e,cx,cy+2,5,2,'#e6f8ff','#8ab8d8'); }
      lid3(e,x,G,w,h,dx,dy,ISO,th,12,ISO,null);
    },
    lixeira(p,x,G,o,done,fi,c,u){
      const e=mkE(c,u); p.id(); const w=38,h=38,dx=11,dy=-7;
      shadow3(e,x+2,G,w,dx,dy);
      const wheel=(wx,wy)=>{ e.ell(wx,wy,3.6,3.6,'#26242c'); e.ell(wx-0.6,wy-0.6,2.4,2.4,'#5a586c'); e.ell(wx,wy,1.2,1.2,'#d4d8e0'); };
      wheel(x+10+dx*0.9,G+dy*0.9-3); wheel(x+34+dx*0.9,G+dy*0.9-3);
      if(done){ e.poly([[x-8,G-1],[x-1,G-3],[x,G],[x-7,G+1]],'#e8e4d8'); e.poly([[x+52,G-1],[x+58,G-2],[x+59,G],[x+53,G]],'#e8e4d8'); }
      const X=x+2; slab(e,X,G-5,w,h,dx,dy,OR);
      // frisos horizontais e nervuras na lateral
      for(let k=0;k<3;k++){ e.rect(X+7+k*10,G-5-h+3,1.4,h-8,OR[4]); e.rect(X+8.4+k*10,G-5-h+3,0.8,h-8,OR[1]); }
      for(let k=1;k<4;k++) sideLine(e,X,w,dx,dy,G-5-k*9.5,OR[5],1);
      e.rect(X,G-14,w,3,OR[5]); e.rect(X,G-14,w,1,OR[3]);
      // faixa de aviso (frente)
      e.rect(X,G-26,w,7,'#e8c040'); e.rect(X,G-26,w,1.2,'#fff0a0'); e.rect(X,G-20,w,1,'#9a7414'); for(let k=0;k<8;k++) e.poly([[X+1+k*5,G-19.4],[X+3.4+k*5,G-19.4],[X+6+k*5,G-26],[X+3.6+k*5,G-26]],'#2a2830');
      // adesivo reciclagem, mão de sangue, amassado, ferrugem
      e.rect(X+11,G-41,11,10,'#3a8a4a'); e.rect(X+11,G-41,11,1,'#7ad08a'); e.rect(X+13,G-39,7,6,'#f4f0e0'); e.rect(X+15,G-37.4,3,3,'#3a8a4a');
      e.band([[X+27,G-38],[X+34,G-38],[X+33,G-31],[X+28,G-31]],['#e0483e','#a82230','#6a0e1c'],[1,2,2],'y',G-38,G-31); [0,2,4].forEach(a=>e.rect(X+27.4+a,G-31,1.1,5+(a===2?2:0),'#a82230'));
      e.ell(X+20,G-17,7,2.6,OR[5]); e.ell(X+19,G-17.8,5,1.4,OR[2]);
      e.poly([[X+2,G-14],[X+10,G-15],[X+12,G-10],[X+3,G-8]],'#8a4a28'); e.rect(X+3,G-14,5,1,'#d8843a');
      for(let i=0;i<16;i++) e.rect(Math.round(X+2+hsh(i,2)*34),Math.round(G-5-h+2+hsh(i,3)*34),1,1,OR[6]);
      // alça traseira na lateral
      e.rect(X+w+dx-1,G-5-h+dy+8,2,10,'#2a2830'); e.rect(X+w+dx-1,G-5-h+dy+8,1,10,'#6a6880');
      // abertura vista de cima + tampa
      const GG=G-5, th=done?1.95:(o?lidTh(o,false):0), open=th>0.3;
      if(open){ hole(e,X,GG,w,h,dx,dy,0.9,OR,6); const cx=X+w/2+dx/2, cy=GG-h+dy/2+2;
        if(!done){ e.ell(cx-9,cy,8,3.8,'#2a2830'); e.ell(cx-10,cy-1,6,2.4,'#4a4860'); e.ell(cx+8,cy+1,7,3.4,'#32243a'); e.ell(cx+7,cy,5,2,'#4a3a50'); e.rect(cx-2,cy-5,5,4,'#f8f4e8'); e.rect(cx+10,cy-4,4,3,'#d84a3a'); e.rect(cx-14,cy-4,2,5,'#5aa03a'); e.rect(cx+2,cy+2,3,2,'#e8c070'); }
        else { e.rect(cx-8,cy,12,1.4,'#e8c070'); } }
      const lc='#5a5a6c', LP=['#aeb0c4','#7e8098','#5a5c74','#3a3c52','#26283a','#161828'];
      lid3(e,X,GG,w,h,dx,dy,LP,th,15,LP,(Q,t)=>{ if(t<0.85){ e.rect(X-1.4,GG-h-1.4,w+2.8,2.6,LP[1]); e.rect(X-1.4,GG-h-1.4,w+2.8,1,LP[0]); e.poly([[X+w+1.4,GG-h-1],[X+w+1.4+dx,GG-h+dy-1],[X+w+1.4+dx,GG-h+dy+1.4],[X+w+1.4,GG-h+1.4]],LP[3]); e.rect(X+12,GG-h-0.5-1,14,1.4,LP[4]); e.poly([[X+10,GG-h-1.6],[X+28,GG-h-1.6],[X+28+dx*0.5,GG-h-1.6+dy*0.5],[X+10+dx*0.5,GG-h-1.6+dy*0.5]],LP[3]); e.rect(X+14,GG-h-1,10,1,LP[0]); } });
    },
    armario(p,x,G,o,done,fi,c,u){
      const e=mkE(c,u); p.id(); const w=46,h=62,dx=11,dy=-7;
      shadow3(e,x,G,w,dx,dy);
      const GG=G-4; e.rect(x+2,G-4,6,4,'#26242c'); e.rect(x+w-8,G-4,6,4,'#26242c');
      slab(e,x,GG,w,h,dx,dy,ST);
      // chapa lateral com veneziana de ventilação
      for(let k=0;k<7;k++) sideLine(e,x,w,dx,dy,GG-h+8+k*3.4,ST[6],1.1);
      // frente: duas portas com chanfro
      const doorL=(ox,dw)=>{ e.rect(ox,GG-h+2,1.2,h-4,ST[0]); e.rect(ox,GG-h+2,dw,1.2,ST[0]); e.rect(ox+dw-1.2,GG-h+3,1.2,h-5,ST[4]); e.rect(ox,GG-3,dw,1.2,ST[5]); };
      doorL(x+2,19.4); doorL(x+24,19.4); e.rect(x+22.4,GG-h+1,1.8,h-2,ST[6]); e.rect(x+23.8,GG-h+1,0.8,h-2,ST[2]);
      // venezianas
      for(let k=0;k<5;k++){ [x+5,x+27].forEach(vx=>{ e.rect(vx,GG-h+6+k*3,14,1.2,ST[6]); e.rect(vx,GG-h+7.2+k*3,14,0.8,ST[0]); }); }
      // placa cruz vermelha, número, trava, aviso
      e.rect(x+28,GG-44,13,13,'#f4f0e0'); e.rect(x+28,GG-44,13,1,'#ffffff'); e.rect(x+28,GG-32,13,1,'#b8b4a4'); e.rect(x+33,GG-42,3.4,9,'#d83a3a'); e.rect(x+30,GG-39,9.4,3.4,'#d83a3a'); e.rect(x+33,GG-42,1.2,9,'#ff8a80');
      e.band([[x+4,GG-44],[x+14,GG-44],[x+14,GG-39],[x+4,GG-39]],SIL.slice(0,4),[1,2,2,1],'y',GG-44,GG-39); e.rect(x+6,GG-43,2,3,'#26283a'); e.rect(x+9,GG-43,3,1,'#26283a');
      e.poly([[x+28,GG-20],[x+40,GG-20],[x+34,GG-30]],'#f2c230'); e.poly([[x+30,GG-21],[x+38,GG-21],[x+34,GG-28]],'#ffe27a'); e.rect(x+33.4,GG-26,1.4,3.6,'#26242c'); e.rect(x+33.4,GG-22,1.4,1.2,'#26242c');
      e.band([[x+19,GG-38],[x+22,GG-38],[x+22,GG-31],[x+19,GG-31]],SIL.slice(0,4),[1,2,2,1],'y',GG-38,GG-31); e.band([[x+24,GG-38],[x+27,GG-38],[x+27,GG-31],[x+24,GG-31]],SIL.slice(0,4),[1,2,2,1],'y',GG-38,GG-31);
      e.band([[x+6,GG-h],[x+10,GG-h],[x+10,GG-52],[x+7,GG-48]],['#e0483e','#a82230','#6a0e1c'],[1,2,2],'y',GG-h,GG-48); e.poly([[x+10,GG-16],[x+20,GG-17],[x+20,GG-10],[x+10,GG-9]],'#a85a28'); e.rect(x+11,GG-16,6,1,'#d8843a'); e.poly([[x+32,GG-14],[x+40,GG-14],[x+40,GG-9],[x+33,GG-9]],'#8a4a28');
      for(let i=0;i<20;i++) e.rect(Math.round(x+3+hsh(i,2)*40),Math.round(GG-h+3+hsh(i,3)*54),1,1,ST[6]);
      // topo: caixa de luvas, lata, luminária
      const cx=x+w/2+dx/2, cy=GG-h+dy/2;
      e.band([[cx-18,cy-6],[cx-4,cy-6],[cx-4,cy+2],[cx-18,cy+2]],[CV[0],CV[2],CV[4]],[1,3,2],'y',cy-6,cy+2); e.rect(cx-18,cy-6,14,1,CV[0]); e.rect(cx-14,cy-4,6,3,'#f4f0e0');
      e.ell(cx+8,cy,6,2.4,SIL[3]); e.ell(cx+8,cy-1,5,1.6,SIL[1]); e.ell(cx+7,cy-1.6,2.4,0.8,SIL[0]);
      // portas (a da esquerda abre)
      const oo=done?0.86:o, dw=19.4*(1-oo);
      if(oo>0){ e.rect(x+2,GG-h+2,20,h-4,'#201528'); e.band([[x+2,GG-h+2],[x+22,GG-h+2],[x+22,GG-3],[x+2,GG-3]],[INKB[0],INKB[1],INKB[2]],[1,2,3],'x',x+2,x+22); e.rect(x+3,GG-40,18,1.6,ST[4]); e.rect(x+3,GG-40,18,0.8,ST[1]); e.rect(x+3,GG-22,18,1.6,ST[4]); e.rect(x+3,GG-22,18,0.8,ST[1]);
        if(!done){ e.rect(x+4,GG-37,9,5,'#f4f0e0'); e.rect(x+7,GG-36,3,3,'#d83a3a'); blob(e,x+16,GG-20,3,3,'#ffffff','#c4ccd8'); e.rect(x+14,GG-58,4,6,'#d84a3a'); e.rect(x+14,GG-58,1.4,6,'#ff9a8a'); e.rect(x+5,GG-58,4,6,'#5aa03a'); e.rect(x+5,GG-58,1.4,6,'#9ad07a'); } }
      if(oo>0.02){ e.band([[x+2,GG-h+2],[x+2+dw,GG-h+2+oo*3],[x+2+dw,GG-3-oo*3],[x+2,GG-3]],[ST[0],ST[1],ST[2],ST[3],ST[4]],[1,3,6,3,2],'x',x+2,x+2+Math.max(dw,3)); e.rect(x+2,GG-h+2,Math.max(1,dw),1.2,ST[0]); e.rect(x+Math.max(2,dw),GG-h+3,1.6,h-6,ST[5]); }
      if(done){ e.rect(x-9,G-3,6,3,'#f4f0e0'); e.rect(x-7,G-2,1.6,1,'#d83a3a'); }
    },
  };
  // extrusão de silhueta irregular (sweep + faces superiores)
  function ext(e,pts,dx,dy,sideCol,topCols,colorFor){
    const n=Math.max(4,Math.round(Math.hypot(dx,dy)*1.4));
    for(let s=n;s>=1;s--) e.poly(pts.map(q=>[q[0]+dx*s/n,q[1]+dy*s/n]),sideCol);
    const pip=(pt,poly)=>{ let ins=false; for(let i=0,j=poly.length-1;i<poly.length;j=i++){ const a=poly[i],b=poly[j]; if(((a[1]>pt[1])!==(b[1]>pt[1]))&&(pt[0]<(b[0]-a[0])*(pt[1]-a[1])/(b[1]-a[1])+a[0])) ins=!ins; } return ins; };
    for(let i=0;i<pts.length;i++){ const p0=pts[i], q0=pts[(i+1)%pts.length]; const ex=q0[0]-p0[0], ey=q0[1]-p0[1], L=Math.hypot(ex,ey)||1;
      const mx=(p0[0]+q0[0])/2, my=(p0[1]+q0[1])/2; let nx=ey/L, ny=-ex/L; if(pip([mx+nx*1.5,my+ny*1.5],pts)){ nx=-nx; ny=-ny; }
      if(ny<-0.3){ const tc=(colorFor?colorFor(p0,q0):null)||topCols;
        const seg=(a,b)=>e.poly([[p0[0]+dx*a,p0[1]+dy*a],[q0[0]+dx*a,q0[1]+dy*a],[q0[0]+dx*b,q0[1]+dy*b],[p0[0]+dx*b,p0[1]+dy*b]],tc[0]);
        const sg=(a,b,k)=>e.poly([[p0[0]+dx*a,p0[1]+dy*a],[q0[0]+dx*a,q0[1]+dy*a],[q0[0]+dx*b,q0[1]+dy*b],[p0[0]+dx*b,p0[1]+dy*b]],tc[k]);
        sg(0,0.25,0); sg(0.25,0.8,1); sg(0.8,1.02,2); } }
  }

  Object.assign(hero,hero3);
  // ---- desenhos: (p, x = esquerda, G = chão, o = abertura 0..1, done, fi)
  const D={
    lixeira(p,x,G,o,done,fi,c,u){
      const e=mkE(c,u); p.id();
      e.ell(x+22,G+1,26,2.6,'#1c1226');
      p.F(M.paper[1]); if(done){ p.poly([[x-8,G-1],[x-1,G-3],[x,G],[x-7,G+1]]); p.poly([[x+46,G-2],[x+52,G-3],[x+53,G],[x+47,G]]); }
      p.F(M.black[1]); p.circle(P2(x+10,G-3),3.4); p.circle(P2(x+34,G-3),3.4); p.F(M.chrome[2]); p.circle(P2(x+10,G-3),1.3); p.circle(P2(x+34,G-3),1.3);
      e.band([[x+3,G-42],[x+41,G-42],[x+38,G-6],[x+6,G-6]],['#ffd49a','#ffa44a','#f08a30','#d06a1c','#a8481a','#6e2a1c'],[1,2,9,7,4,3],'x',x+3,x+41);
      e.poly([[x+4,G-41],[x+6.4,G-41],[x+8.4,G-8],[x+6.6,G-8]],'#fff0d0'); e.rect(x+14,G-39,1,8,'#ffe0a8');
      e.rect(x+4,G-41,36,1.4,'#ffc27a'); e.rect(x+7,G-12,32,1,'#6e2a1c');
      p.F(M.orange[2]); for(let k=0;k<3;k++) p.rect(x+14+k*7,G-38,1.4,29);
      p.F(M.orange[3]); p.rect(x+6,G-11,32,3);
      p.F(M.yellow[1]); p.rect(x+5,G-22,34,5); p.F(M.black[2]); for(let k=0;k<7;k++) p.poly([[x+6+k*5,G-17],[x+8+k*5,G-17],[x+10+k*5,G-22],[x+8+k*5,G-22]]);
      p.F(M.green[1]); p.rect(x+13,G-36,10,9); p.F(M.paper[1]); p.rect(x+15,G-34,6,5); p.F(M.green[2]); p.rect(x+17,G-33,2,3);
      p.F(M.blood[1]); p.rect(x+29,G-33,5,5); p.rect(x+29,G-28,1,5); p.rect(x+31,G-28,1,7); p.rect(x+33,G-28,1,4);
      p.F(M.orange[3]); p.ell(x+22,G-14,6,2.2); p.F(M.orange[0]); p.rect(x+16,G-16,4,1);
      p.F(M.rust[1]); p.rect(x+9,G-40,2,10); p.rect(x+36,G-40,2,6);
      dirt(p,M.orange[3],x+5,G-40,34,32,26,3);
      if(!done && o<0.85){ p.F(M.bag[1]); p.ell(x+14,G-45,8,5); p.ell(x+27,G-46,7,5); p.F(M.bag[0]); p.rect(x+11,G-49,4,1); p.F(M.paper[1]); p.rect(x+30,G-50,5,3); }
      if(o>0||done){ p.F(M.inside[1]); p.poly([[x+4,G-44],[x+40,G-44],[x+41,G-40],[x+3,G-40]]); if(!done){ p.F(M.food[1]); p.rect(x+10,G-45,5,3); p.F(M.paper[1]); p.rect(x+24,G-46,6,3); p.F(M.leaf[1]); p.rect(x+33,G-45,4,2); } }
      const a=done?1.75:o*1.75; p.xf(a,x+42,G-43); p.F(M.lid[1]); p.poly([[-41,-3],[1,-3],[2,2],[-42,2]]); p.F(M.lid[0]); p.rect(-40,-3,38,1); p.F(M.lid[3]); p.rect(-41,1,40,1); p.F(M.lid[2]); p.rect(-26,-5,10,2.5); p.F(M.lid[0]); p.rect(-26,-5,10,1); p.id();
    },
    caixa(p,x,G,o,done,fi){
      p.F(M.leaf[1]); p.ell(x+60,G-2,5,2); p.F(M.leaf[2]); p.rect(x+58,G-3,3,1); p.F(M.food[1]); p.ell(x-5,G-2,3,2);
      box(p,M.woodD,x,G-34,54,34,6);
      for(let k=0;k<4;k++){ p.F(M.wood[1]); p.rect(x+1,G-33+k*8.2,52,6.4); p.F(M.wood[0]); p.rect(x+1,G-33+k*8.2,52,1); p.F(M.woodD[3]); p.rect(x+1,G-27+k*8.2,52,1.4); }
      p.F(M.woodD[1]); p.rect(x,G-34,6,34); p.rect(x+48,G-34,6,34); p.F(M.wood[0]); p.rect(x,G-34,1,34);
      p.F(M.woodD[2]); p.poly([[x+8,G-4],[x+13,G-4],[x+44,G-30],[x+39,G-30]]);
      [[2,3],[2,30],[50,3],[50,30]].forEach(([dx,dy])=>rivet(p,M.metal,x+dx,G-dy-2));
      p.F(M.red[1]); p.rect(x+16,G-20,22,8); p.F(M.paper[1]); p.rect(x+19,G-18,3,4); p.rect(x+24,G-18,3,4); p.rect(x+29,G-18,5,1); p.rect(x+29,G-15,4,1);
      p.F(M.leaf[1]); p.rect(x+6,G-31,4,5); p.F(M.leaf[2]); p.rect(x+8,G-30,1,3);
      p.F(M.blood[1]); p.rect(x+46,G-18,4,6); p.rect(x+47,G-12,1,4);
      dirt(p,M.woodD[3],x+2,G-32,50,30,20,5);
      if(done||o>0){ p.F(M.inside[1]); p.poly([[x+2,G-34],[x+52,G-34],[x+58,G-38],[x+8,G-38]]); if(!done){ p.F(M.straw[1]); p.poly([[x+5,G-35],[x+50,G-35],[x+54,G-38],[x+10,G-38]]); } }
      const a=done?1.75:o*1.55; p.xf(a,x+54,G-35); p.F(M.wood[1]); p.rect(-54,-3,54,5); p.F(M.wood[0]); p.rect(-54,-3,54,1); p.F(M.woodD[2]); p.rect(-54,1,54,1.4); p.F(M.metal[1]); p.rect(-54,-3,6,5); p.rect(-6,-3,6,5); p.F(M.tape[1]); p.rect(-30,-3.4,9,5); p.id();
    },
    carro(p,x,G,o,done,fi){
      const car=M.car;
      p.F(M.black[2]); p.ell(x+66,G+1,54,2.8);
      // bagagem no teto (silhueta): mala + rolo de lona
      p.F(M.woodD[1]); p.rect(x+44,G-69,26,10); p.F(M.woodD[0]); p.rect(x+44,G-69,26,2); p.F(M.woodD[3]); p.rect(x+44,G-61,26,2); p.F(M.metal[1]); p.rect(x+55,G-67,4,3); p.F(M.red[1]); p.rect(x+47,G-66,2,7); p.rect(x+65,G-66,2,7);
      p.F(M.canvas[1]); p.cap(P2(x+72,G-63),P2(x+84,G-63),6,6); p.F(M.canvas[0]); p.rect(x+73,G-66,10,1.4); p.F(M.rust[1]); p.rect(x+78,G-65,1.6,5);
      // carroceria: arredondada (capô inclinado, porta-malas curto)
      p.F(car[1]); p.poly([[x+4,G-20],[x+2,G-32],[x+8,G-37],[x+30,G-38],[x+98,G-38],[x+112,G-33],[x+124,G-28],[x+128,G-20],[x+126,G-9],[x+3,G-9]]);
      // cabine com para-brisa inclinado
      p.F(car[1]); p.poly([[x+26,G-37],[x+38,G-59],[x+50,G-62],[x+78,G-62],[x+92,G-55],[x+104,G-37]]);
      // planos de luz: ombro, teto, capô
      p.F(car[0]); p.poly([[x+8,G-37],[x+30,G-38],[x+98,G-38],[x+112,G-33],[x+110,G-32],[x+96,G-35],[x+30,G-35],[x+9,G-34]]);
      p.F(car[0]); p.poly([[x+40,G-60],[x+50,G-62],[x+78,G-62],[x+90,G-56],[x+76,G-59],[x+50,G-59]]);
      p.F(car[2]); p.poly([[x+3,G-22],[x+127,G-22],[x+126,G-9],[x+3,G-9]]);
      p.F(car[3]); p.rect(x+3,G-11,124,2);
      p.F(car[0]); p.rect(x+10,G-23,108,1); // reflexo de borda da soleira
      // vidros escuros com reflexo de céu
      p.F(M.glass[2]); p.poly([[x+32,G-38],[x+40,G-56],[x+57,G-58],[x+57,G-38]]); p.poly([[x+62,G-38],[x+62,G-58],[x+78,G-58],[x+90,G-52],[x+98,G-38]]);
      p.F(M.glass[3]); p.poly([[x+34,G-38],[x+42,G-54],[x+57,G-55],[x+57,G-38]]); p.poly([[x+62,G-38],[x+62,G-55],[x+76,G-55],[x+88,G-50],[x+94,G-38]]);
      p.F(M.glass[1]); p.poly([[x+41,G-56],[x+47,G-57],[x+38,G-39],[x+34,G-39]]); p.poly([[x+66,G-57],[x+72,G-57],[x+64,G-39],[x+62,G-39]]);
      p.F(M.glass[0]); p.rect(x+43,G-55,2,5); p.rect(x+68,G-55,2,5);
      p.F(M.glass[2]); p.ell(x+48,G-44,4,6); p.ell(x+84,G-44,4,6); // encostos
      p.F(M.glass[1]); p.rect(x+47,G-52,3,2);
      p.F(car[3]); p.rect(x+57.5,G-58,4,22); p.rect(x+26,G-38,1.4,22);
      // vidro quebrado
      p.F(M.light[1]); p.rect(x+69,G-50,1,7); p.rect(x+70,G-48,4,1); p.rect(x+68,G-45,3,1); p.rect(x+72,G-52,1,3);
      // portas, vincos, maçanetas, retrovisor
      p.F(car[3]); p.rect(x+59,G-37,1.4,26); p.rect(x+98,G-37,1.4,26); p.rect(x+27,G-37,1,16);
      p.F(M.chrome[1]); p.rect(x+50,G-33,7,2); p.rect(x+86,G-33,7,2); p.F(M.chrome[0]); p.rect(x+50,G-33,7,1);
      p.F(car[2]); p.ell(x+36,G-38,3,2); p.F(car[0]); p.rect(x+35,G-39,2,1);
      p.F(car[2]); p.rect(x+8,G-28,50,1.4); p.rect(x+62,G-28,34,1.4); p.F(car[0]); p.rect(x+8,G-27,50,0.9);
      // desgaste: amassados, ferrugem, arranhões, sangue
      p.F(car[2]); p.ell(x+118,G-26,6,3); p.F(car[0]); p.rect(x+114,G-28,4,1);
      p.F(M.rust[1]); p.poly([[x+14,G-24],[x+30,G-25],[x+32,G-20],[x+14,G-20]]); p.ell(x+101,G-14,10,3.4); p.rect(x+8,G-36,7,3); p.rect(x+66,G-24,12,3); p.F(M.orange[1]); p.rect(x+16,G-24,6,1); p.rect(x+70,G-24,5,1); p.F(M.rust[2]); p.rect(x+14,G-21,18,1);
      p.F(M.blood[1]); p.poly([[x+64,G-34],[x+72,G-34],[x+71,G-25],[x+66,G-25]]); p.rect(x+67,G-25,1,6); p.rect(x+70,G-25,1,3);
      p.F(car[3]); p.rect(x+12,G-33,16,1); p.rect(x+16,G-31,11,1); p.rect(x+100,G-34,10,1);
      dirt(p,car[3],x+4,G-36,118,26,12,11);
      // luzes e para-choques
      p.F(M.yellow[1]); p.rect(x+121,G-29,6,5); p.F(M.paper[1]); p.rect(x+123,G-28,2,2); p.F(M.red[1]); p.rect(x+0,G-32,4,6); p.F(M.red[0]); p.rect(x+1,G-32,1,2);
      p.F(M.chrome[2]); p.rect(x+123,G-17,6,3); p.rect(x-1,G-17,5,3); p.F(M.chrome[0]); p.rect(x+123,G-17,6,1); p.F(M.paper[1]); p.rect(x+6,G-18,11,5); p.F(M.black[1]); p.rect(x+7,G-17,9,1); p.rect(x+9,G-15,4,1);
      // rodas: arco escuro, pneu com sulco, calota com brilho; traseira murcha
      p.F(M.black[3]); p.circle(P2(x+27,G-8),12.5); p.circle(P2(x+101,G-8),12.5);
      p.F(M.tire[1]); p.circle(P2(x+27,G-7),10.4); p.circle(P2(x+101,G-8),10.4);
      p.F(M.tire[2]); p.ell(x+27,G-2,10,4); p.ell(x+101,G-3,10,4); p.F(M.tire[0]); p.rect(x+19,G-14,10,1);
      p.F(M.chrome[1]); p.circle(P2(x+27,G-8),5.4); p.circle(P2(x+101,G-8),5.4); p.F(M.chrome[2]); p.circle(P2(x+28,G-7),3.6); p.circle(P2(x+102,G-7),3.6); p.F(M.black[1]); p.circle(P2(x+27,G-8),1.4); p.circle(P2(x+101,G-8),1.4);
      p.F(M.chrome[0]); p.rect(x+24,G-13,4,1); p.rect(x+98,G-13,4,1); p.F(M.rust[1]); p.rect(x+30,G-8,3,1); p.rect(x+97,G-6,3,2);
      // capô e porta-malas abrindo
      const th=done?1:o;
      p.xf(-th*0.95,x+100,G-37); p.F(car[1]); p.poly([[0,-1],[26,0],[30,4],[0,4]]); p.F(car[0]); p.poly([[1,-1],[24,0],[24,1],[1,1]]); p.F(car[3]); p.rect(0,3,29,1); p.id();
      p.xf(Math.PI+th*0.9,x+26,G-37); p.F(car[1]); p.poly([[0,-1],[22,-1],[24,4],[0,4]]); p.F(car[0]); p.rect(1,-1,20,1); p.F(car[3]); p.rect(0,3,23,1); p.id();
      if(th>0){ p.F(M.inside[1]); p.rect(x+100,G-37,22,4); p.rect(x+4,G-37,20,4); if(!done){ p.F(M.yellow[1]); p.rect(x+106,G-38,7,3); p.F(M.metal[1]); p.rect(x+10,G-38,8,2); } }
    },
    geladeira(p,x,G,o,done,fi){
      box(p,M.enamel,x,G-70,36,66,6);
      p.F(M.enamel[0]); p.rect(x+1,G-70,34,2);
      p.F(M.black[1]); p.rect(x+1,G-6,34,5); p.rect(x+36,G-8,6,4);
      p.F(M.rust[1]); p.rect(x,G-12,36,4); p.rect(x+33,G-52,3,10); p.F(M.rust[2]); p.rect(x,G-9,36,1);
      p.F(M.enamel[2]); p.rect(x+1,G-50,34,1.6); p.F(M.enamel[0]); p.rect(x+1,G-49,34,1);
      dirt(p,M.enamel[3],x+2,G-68,32,56,9,4);
      panel(p,M.enamel,x+1,G-69,34,18); panel(p,M.enamel,x+1,G-49,34,40);
      p.F(M.black[1]); p.rect(x+28,G-66,2.4,12); p.F(M.black[1]); p.rect(x+28,G-46,2.4,14); p.F(M.chrome[1]); p.rect(x+13,G-46,10,2.6); p.F(M.black[2]); p.rect(x+15,G-45,6,1);
      p.F(M.rust[1]); p.rect(x+4,G-64,2,12); p.rect(x+20,G-48,3,8); p.F(M.rust[2]); p.rect(x+5,G-52,1,5);
      p.F(M.blood[1]); p.rect(x+8,G-66,5,9); p.rect(x+9,G-57,1,5);
      p.F(M.red[1]); p.rect(x+7,G-42,5,5); p.F(M.yellow[1]); p.rect(x+16,G-34,6,4); p.F(M.green[1]); p.rect(x+10,G-30,4,4); p.F(M.paper[1]); p.rect(x+21,G-45,7,7); p.F(M.black[2]); p.rect(x+22,G-43,5,1); p.rect(x+22,G-41,4,1);
      const hop=(done||o===0)?0:ph(fi);
      p.F(M.black[1]); p.ell(x+16,G-75-hop,6,4); p.circle(P2(x+21,G-79-hop),3); p.poly([[x+10,G-74-hop],[x+3,G-71-hop],[x+9,G-72-hop]]); p.F(M.black[0]); p.rect(x+13,G-78-hop,6,1);
      p.F(M.yellow[1]); p.poly([[x+23,G-79-hop],[x+27,G-78-hop],[x+23,G-77-hop]]); p.F(M.paper[1]); p.rect(x+21,G-80-hop,1.4,1.4);
      const oo=done?0.88:o, dw=36*(1-oo);
      if(oo>0){ p.F(M.light[2]); p.rect(x+1,G-50,34,42); p.F(M.light[1]); p.rect(x+2,G-49,32,8); p.F(M.metal[2]); [0,1,2].forEach(k=>p.rect(x+2,G-40+k*11,32,1.6)); p.F(M.metal[3]); p.rect(x+2,G-38,32,1);
        if(!done){ p.F(M.food[1]); p.rect(x+6,G-45,7,5); p.F(M.green[1]); p.rect(x+18,G-33,5,8); p.F(M.paper[1]); p.rect(x+8,G-22,10,7); p.F(M.straw[1]); p.rect(x+24,G-44,6,4); } else { p.F(M.leaf[2]); p.rect(x+4,G-16,8,2); } }
      p.F(M.enamel[1]); p.poly([[x,G-50],[x+dw,G-50+oo*4],[x+dw,G-8-oo*4],[x,G-8]]); p.F(M.enamel[0]); p.rect(x,G-50,Math.max(1,dw),1.4); p.F(M.enamel[2]); p.rect(x+Math.max(0,dw-3),G-48,3,38);
      p.F(M.black[1]); p.rect(x+Math.max(1,dw-7),G-44,2.4,13); p.F(M.chrome[0]); p.rect(x+Math.max(1,dw-7),G-44,1,13); panel(p,M.enamel,x+1,G-49,Math.max(2,dw-2),38);
    },
    armario(p,x,G,o,done,fi,c,u){
      const e2=mkE(c,u); p.id();
      box(p,M.metal,x,G-66,46,62,5);
      e2.band([[x,G-66],[x+46,G-66],[x+46,G-6],[x,G-6]],['#e8fbff','#b8d8e0','#8ab0bc','#6a90a4','#4e7088','#385068'],[1,3,10,8,5,3],'x',x,x+46); e2.rect(x+1,G-66,44,1.6,'#f4ffff'); e2.rect(x+4,G-65,1.4,56,'#f4ffff');
      p.F(M.black[1]); p.rect(x,G-6,46,5);
      p.F(M.metal[3]); p.rect(x+22.4,G-64,1.6,58);
      p.F(M.metal[0]); p.rect(x+1,G-65,44,1.2); p.rect(x+1,G-65,1.2,58);
      panel(p,M.metal,x+2,G-64,20,56); panel(p,M.metal,x+25,G-64,20,56);
      p.F(M.metal[3]); for(let k=0;k<5;k++){ p.rect(x+4,G-60+k*3,15,1.2); p.rect(x+27,G-60+k*3,15,1.2); } p.F(M.metal[0]); for(let k=0;k<5;k++){ p.rect(x+4,G-59+k*3,15,0.8); p.rect(x+27,G-59+k*3,15,0.8); }
      p.F(M.paper[1]); p.rect(x+28,G-44,13,13); p.F(M.red[1]); p.rect(x+33,G-42,3,9); p.rect(x+30,G-39,9,3); p.F(M.paper[2]); p.rect(x+28,G-32,13,1);
      p.F(M.chrome[1]); p.rect(x+4,G-44,10,5); p.F(M.black[2]); p.rect(x+6,G-43,2,3); p.rect(x+9,G-43,3,1); p.F(M.yellow[1]); p.poly([[x+28,G-20],[x+40,G-20],[x+34,G-29]]); p.F(M.black[1]); p.rect(x+33.4,G-27,1.4,4); p.rect(x+33.4,G-22,1.4,1.2);
      p.F(M.chrome[2]); p.rect(x+19,G-38,3,7); p.rect(x+24,G-38,3,7);
      p.F(M.blood[1]); p.rect(x+6,G-65,4,12); p.rect(x+7,G-53,1,5); p.F(M.rust[1]); p.rect(x+10,G-14,10,5); p.rect(x+32,G-12,8,3);
      dirt(p,M.metal[3],x+2,G-62,42,56,26,8);
      p.F(M.canvas[1]); p.rect(x+4,G-71,15,5); p.F(M.canvas[0]); p.rect(x+4,G-71,15,1); p.F(M.chrome[1]); p.ell(x+34,G-68,6,2); p.F(M.chrome[0]); p.rect(x+30,G-69,5,1);
      const oo=done?0.86:o, dw=22*(1-oo);
      if(oo>0){ p.F(M.inside[1]); p.rect(x+1,G-64,21,58); p.F(M.metal[2]); p.rect(x+2,G-40,19,1.6); p.rect(x+2,G-22,19,1.6);
        if(!done){ p.F(M.paper[1]); p.rect(x+4,G-37,9,5); p.F(M.red[1]); p.rect(x+7,G-36,3,3); p.F(M.paper[0]); p.ell(x+16,G-20,3,3); p.F(M.food[1]); p.rect(x+14,G-58,4,6); p.F(M.green[1]); p.rect(x+5,G-58,4,6); } }
      p.F(M.metal[1]); p.poly([[x,G-64],[x+dw,G-64+oo*3],[x+dw,G-6-oo*3],[x,G-6]]); p.F(M.metal[0]); p.rect(x,G-64,Math.max(1,dw),1.2); p.F(M.metal[2]); p.ell(x+dw*0.5,G-40,dw*0.2+0.5,3);
      if(!done && oo<0.3){ p.F(M.yellow[1]); p.rect(x+18,G-38,4,5); }
      if(done){ p.F(M.paper[1]); p.rect(x-8,G-3,5,3); p.F(M.red[2]); p.rect(x-6,G-2,1,1); }
    },
    mochila(p,x,G,o,done,fi){
      p.F(M.canvas[3]); p.ell(x+17,G-1,20,2.4);
      p.F(M.canvas[2]); p.cap(P2(x+3,G-6),P2(x-5,G-2),2.6,2.6); p.cap(P2(x+30,G-6),P2(x+38,G-2),2.6,2.6);
      p.F(M.canvas[1]); p.poly([[x+2,G-2],[x+3,G-17],[x+9,G-23],[x+25,G-23],[x+31,G-17],[x+32,G-2]]);
      p.F(M.canvas[0]); p.poly([[x+5,G-18],[x+10,G-22],[x+14,G-22],[x+10,G-17]]);
      p.F(M.canvas[2]); p.poly([[x+27,G-20],[x+31,G-16],[x+32,G-2],[x+27,G-2]]);
      p.F(M.canvas[2]); p.rect(x+6,G-12,22,9); p.F(M.canvas[0]); p.rect(x+6,G-12,22,1.2); p.F(M.canvas[3]); p.rect(x+6,G-4,22,1.2);
      p.F(M.yellow[1]); p.rect(x+15,G-13,4,3); p.F(M.black[1]); p.rect(x+16,G-12,2,1);
      p.F(M.red[1]); p.rect(x+8,G-9,5,4); p.F(M.paper[1]); p.rect(x+9,G-8,3,1);
      p.F(M.blood[1]); p.rect(x+25,G-18,3,6); p.rect(x+26,G-12,1,3);
      p.F(M.rust[1]); p.rect(x+4,G-6,3,4);
      dirt(p,M.canvas[3],x+3,G-20,28,18,16,13);
      p.F(M.red[2]); p.cap(P2(x+8,G-25),P2(x+27,G-25),4.4,4.4); p.F(M.red[0]); p.rect(x+9,G-27.4,17,1); p.F(M.black[1]); p.rect(x+14,G-27,1.6,4); p.rect(x+21,G-27,1.6,4);
      const a=done?2.5:o*2.3; p.xf(-a,x+4,G-21); p.F(M.canvas[0]); p.poly([[0,-3],[26,-3],[25,7],[1,7]]); p.F(M.canvas[1]); p.rect(0,-3,26,1.2); p.F(M.black[1]); p.rect(12,5,3,4); p.F(M.chrome[1]); p.rect(12,6,3,1); p.id();
      if(a>0.7){ p.F(M.inside[1]); p.rect(x+6,G-22,20,3); if(!done){ p.F(M.food[1]); p.rect(x+10,G-27,6,5); p.F(M.light[1]); p.rect(x+18,G-30,4,8); } }
    },
    papelao(p,x,G,o,done,fi){
      p.F(M.canvas[3]); p.ell(x+22,G,24,2);
      box(p,M.card,x,G-23,34,23,5);
      p.F(M.card[0]); p.rect(x+1,G-23,33,1.4); p.F(M.card[2]); p.rect(x+16,G-21,1.4,19); p.F(M.card[3]); p.rect(x,G-3,34,3);
      p.F(M.tape[1]); p.rect(x+13,G-23,9,8); p.F(M.tape[0]); p.rect(x+13,G-23,9,1);
      p.F(M.red[1]); p.rect(x+4,G-16,10,5); p.F(M.paper[1]); p.rect(x+6,G-15,6,1); p.rect(x+6,G-13,4,1);
      p.F(M.black[1]); p.rect(x+21,G-12,8,1); p.rect(x+21,G-9,6,1); p.poly([[x+25,G-18],[x+29,G-18],[x+27,G-21]]);
      p.F(M.canvas[2]); p.ell(x+6,G-5,5,2.4); p.F(M.blood[1]); p.rect(x+29,G-8,3,5);
      dirt(p,M.card[3],x+1,G-21,32,18,16,17);
      const a=done?1.9:o*1.7;
      p.xf(a,x+34,G-23); p.F(M.card[0]); p.rect(-17,-2,17,3); p.F(M.card[2]); p.rect(-17,0,17,1); p.id();
      p.xf(-a,x,G-23); p.F(M.card[0]); p.rect(0,-2,17,3); p.F(M.card[2]); p.rect(0,0,17,1); p.id();
      if(a>0.4){ p.F(M.inside[1]); p.rect(x+2,G-25,30,3); if(!done){ p.F(M.paper[1]); p.rect(x+8,G-27,8,3); p.F(M.red[1]); p.rect(x+22,G-27,5,3); } }
    },
    pneus(p,x,G,o,done,fi){
      p.F(M.black[2]); p.ell(x+24,G,28,2.6);
      const rows=done?2:3, hops=(o>0)?ph(fi):0;
      for(let k=0;k<rows;k++){ const top=(k===rows-1)&&!done, sx=top?Math.round(Math.sin(fi*1.6)*2*o):0, y=G-7-k*12-(top?hops:0);
        p.F(M.tire[1]); p.ell(x+23+sx,y,22,8); p.rect(x+1+sx,y-1,44,8);
        p.F(M.tire[2]); p.ell(x+23+sx,y+7,22,3); p.F(M.tire[0]); p.rect(x+4+sx,y-6,38,1.2);
        p.F(M.tire[3]); for(let j=0;j<9;j++) p.rect(x+3+sx+j*5,y+1,2,5);
        p.F(M.tire[0]); for(let j=0;j<9;j++) p.rect(x+3+sx+j*5,y-1,2,1); }
      const ty=G-7-(rows-1)*12-(done?0:hops);
      p.F(M.tire[3]); p.ell(x+23,ty-3,14,4.6); p.F(M.inside[1]); p.ell(x+23,ty-3,10,3.4); p.F(M.chrome[2]); p.ell(x+23,ty-2,6,2); p.F(M.rust[1]); p.ell(x+25,ty-2,4,1.2);
      if(!done){ p.F(M.paper[1]); p.rect(x+16,ty-5,5,2); p.F(M.food[1]); p.rect(x+28,ty-5,3,2); }
      p.F(M.rust[1]); p.rect(x+10,G-4,6,2); p.rect(x+36,G-18,4,2);
      if(done){ p.F(M.tire[1]); p.ell(x+58,G-6,10,5); p.F(M.tire[0]); p.rect(x+50,G-9,16,1); p.F(M.inside[1]); p.ell(x+58,G-7,5,2); }
    },
    caixote(p,x,G,o,done,fi){
      p.F(M.canvas[3]); p.ell(x+36,G,40,2.4);
      box(p,M.wood,x,G-40,58,40,6);
      p.F(M.wood[0]); p.rect(x+1,G-40,57,1.4);
      p.F(M.woodD[1]); for(let k=1;k<4;k++){ p.rect(x,G-40+k*10,58,1.4); } p.F(M.wood[0]); for(let k=0;k<4;k++) p.rect(x+1,G-39+k*10,57,0.9);
      [[0,0],[52,0],[0,34],[52,34]].forEach(([dx,dy])=>{ p.F(M.metal[1]); p.rect(x+dx,G-40+dy,6,6); p.F(M.metal[0]); p.rect(x+dx,G-40+dy,6,1); rivet(p,M.metal,x+dx+2,G-38+dy); });
      p.F(M.metal[2]); p.rect(x+6,G-6,46,2);
      p.F(M.yellow[1]); p.rect(x+12,G-28,4,10); p.rect(x+18,G-28,4,10); p.rect(x+24,G-23,4,5); p.rect(x+30,G-28,4,10); p.rect(x+38,G-28,9,2); p.rect(x+38,G-22,9,2); p.rect(x+38,G-18,5,1);
      p.F(M.red[1]); p.rect(x+12,G-14,34,2); p.F(M.red[2]); p.rect(x+12,G-12,34,1);
      p.F(M.black[1]); p.rect(x+8,G-35,3,1); p.rect(x+48,G-35,3,1);
      p.F(M.blood[1]); p.rect(x+3,G-26,3,7);
      dirt(p,M.woodD[3],x+2,G-38,54,34,26,19);
      if(done){ p.F(M.inside[1]); p.rect(x+20,G-10,18,8); p.F(M.wood[1]); p.poly([[x+62,G-2],[x+80,G-6],[x+81,G-3],[x+63,G+1]]); p.F(M.metal[1]); p.rect(x+78,G-7,3,2); }
      if(o>0.15||done){ p.F(M.inside[1]); p.poly([[x+2,G-41],[x+56,G-41],[x+62,G-45],[x+8,G-45]]); if(!done){ p.F(M.straw[1]); p.poly([[x+5,G-42],[x+54,G-42],[x+58,G-45],[x+10,G-45]]); } }
      const a=done?1.55:o*1.25; p.xf(a,x+58,G-41); p.F(M.wood[0]); p.rect(-58,-3,58,5); p.F(M.wood[1]); p.rect(-58,0,58,2); p.F(M.metal[1]); p.rect(-58,-3,6,5); p.rect(-6,-3,6,5); p.F(M.woodD[2]); p.rect(-58,2,58,1); p.id();
    },
    carrinho(p,x,G,o,done,fi){
      const sk=done?0:Math.round(Math.sin(fi*1.6)*o);
      p.F(M.black[2]); p.ell(x+28,G,30,2.2);
      p.F(M.black[1]); p.circle(P2(x+10,G-3.4),3.4); p.circle(P2(x+42,G-3.4),3.4); p.F(M.chrome[2]); p.circle(P2(x+10,G-3.4),1.3); p.circle(P2(x+42,G-3.4),1.3);
      p.F(M.chrome[2]); p.rect(x+8,G-12,38,2); p.cap(P2(x+10,G-10),P2(x+10,G-5),1.6,1.6); p.cap(P2(x+42,G-10),P2(x+42,G-5),1.6,1.6);
      if(!done){ p.F(M.leaf[1]); p.ell(x+17+sk,G-39,8,6); p.F(M.leaf[0]); p.rect(x+13+sk,G-43,5,1); p.F(M.food[1]); p.ell(x+32+sk,G-38,6,5); p.F(M.food[0]); p.rect(x+30+sk,G-41,2,1); p.F(M.bag[1]); p.ell(x+25+sk,G-37,7,6); p.F(M.paper[1]); p.rect(x+36+sk,G-44,6,6); }
      p.F(M.chrome[1]); p.poly([[x+2,G-36],[x+50,G-36],[x+46,G-13],[x+7,G-13]]);
      p.F(M.inside[1]); p.poly([[x+5,G-33],[x+47,G-33],[x+44,G-16],[x+9,G-16]]);
      if(!done){ p.F(M.bag[1]); p.poly([[x+8,G-33],[x+30,G-33],[x+28,G-22],[x+11,G-22]]); p.F(M.straw[1]); p.rect(x+34,G-32,8,5); }
      p.F(M.chrome[1]); for(let k=0;k<7;k++) p.rect(x+9+k*6,G-33,1.2,17); p.rect(x+7,G-25,38,1.2); p.rect(x+3,G-36,46,1.6);
      p.F(M.chrome[0]); p.rect(x+3,G-36,46,1); p.F(M.chrome[3]); p.rect(x+8,G-14,38,1);
      p.F(M.yellow[1]); p.rect(x+19,G-14,10,2); p.F(M.rust[1]); p.rect(x+12,G-17,8,3); p.rect(x+38,G-24,4,6); p.F(M.rust[2]); p.rect(x+13,G-15,5,1);
      p.F(M.red[1]); p.cap(P2(x+50,G-36),P2(x+58,G-45),3,3); p.cap(P2(x+58,G-45),P2(x+62,G-45),3,3); p.F(M.red[0]); p.rect(x+55,G-44,1,1);
      p.F(M.blood[1]); p.rect(x+4,G-33,2,4);
    },
  };

  const FLYC={
    can:(p,x,y)=>{ p.F(M.chrome[1]); p.rect(x,y,4,5); p.F(M.red[1]); p.rect(x,y+1,4,2); p.F(M.chrome[0]); p.rect(x,y,1,5); },
    paper:(p,x,y)=>{ p.F(M.paper[1]); p.rect(x,y,5,4); p.F(M.paper[2]); p.rect(x+3,y+2,2,2); },
    bottle:(p,x,y)=>{ p.F(M.green[1]); p.rect(x,y+2,3,6); p.rect(x+1,y,1.4,3); p.F(M.green[0]); p.rect(x,y+3,1,4); },
    cloth:(p,x,y)=>{ p.F(M.red[1]); p.poly([[x,y+1],[x+6,y],[x+5,y+5],[x+1,y+4]]); p.F(M.red[2]); p.rect(x+3,y+2,3,3); },
    nut:(p,x,y)=>{ p.F(M.metal[1]); p.rect(x,y,3,3); p.F(M.metal[0]); p.rect(x,y,3,1); },
    food:(p,x,y)=>{ p.F(M.food[1]); p.ell(x+2,y+2,2.6,2.4); p.F(M.leaf[1]); p.rect(x+1,y-1,2,1.4); },
    bat:(p,x,y)=>{ p.F(M.yellow[1]); p.rect(x,y,4,5); p.F(M.black[1]); p.rect(x+1,y,2,1); p.F(M.yellow[0]); p.rect(x,y,1,5); },
  };
  const FLYSET={
    lixeira:{ox:26,oy:-56,w:14,h:30,items:['can','paper','bottle','cloth']},
    caixa:{ox:28,oy:-44,w:14,h:26,items:['nut','paper','nut','cloth']},
    carro:{ox:134,oy:-46,w:18,h:38,items:['nut','bat','nut','can']},
    geladeira:{ox:22,oy:-52,w:20,h:30,items:['food','bottle','paper','food']},
    armario:{ox:14,oy:-70,w:18,h:30,items:['cloth','paper','bottle','cloth']},
    mochila:{ox:18,oy:-34,w:12,h:24,items:['food','can','paper','bat']},
    papelao:{ox:24,oy:-34,w:12,h:22,items:['paper','cloth','nut','paper']},
    pneus:{ox:26,oy:-50,w:14,h:24,items:['nut','paper','nut','can']},
    caixote:{ox:32,oy:-56,w:16,h:30,items:['nut','bat','nut','cloth']},
    carrinho:{ox:28,oy:-44,w:16,h:28,items:['food','can','bottle','paper']},
    coco:{ox:34,oy:-56,w:14,h:24,items:['food','food','bottle','food']},
    banca:{ox:44,oy:-40,w:18,h:26,items:['cloth','paper','cloth','food']},
    isopor:{ox:30,oy:-40,w:12,h:22,items:['bottle','food','bottle','can']},
  };
  function fly(p,kind,x,G,fi,done){
    if(done) return; const S=FLYSET[kind];
    for(let k=0;k<4;k++){
      const uu=Math.min(1,((fi+k)%4)/4+k*0.07), side=(k%2?1:-1);
      const ix=x+S.ox+side*S.w*uu*(0.6+0.4*hsh(k,7)), iy=G+S.oy-S.h*Math.sin(uu*Math.PI)*(0.8+0.3*hsh(k,3));
      p.id(); FLYC[S.items[k]](p,Math.round(ix),Math.round(iy));
    }
    if(kind==='carro'){ for(let k=0;k<2;k++){ const uu=((fi+k*2)%4)/4; p.id(); FLYC[S.items[k+2]](p,Math.round(x+10-uu*8),Math.round(G-36-14*Math.sin(uu*Math.PI))); } }
  }
  const SPARK={lixeira:[40,-54],caixa:[40,-46],carro:[96,-100],geladeira:[40,-86],armario:[40,-76],mochila:[24,-38],papelao:[30,-34],pneus:[40,-50],caixote:[50,-58],carrinho:[30,-52],coco:[36,-64],banca:[46,-72],isopor:[32,-42]};

  // ================= Ver-o-Peso (Belém): objetos próprios + objetos comuns que também aparecem lá =================
  Object.assign(KINDS,{
    paneiro:{nome:'Cesto de açaí (paneiro)', areas:['relogio','acai','doca'], loot:['açaí','comida','corda'], tempo:1.0, w:50,h:46},
    balanca:{nome:'Balança de feira', areas:['acai','ferro'], loot:['sucata','peças'], tempo:1.2, w:52,h:60},
    bancaervas:{nome:'Banca de ervas', areas:['ervas'], loot:['ervas','antídoto','remédio'], tempo:1.5, w:80,h:58},
    rede:{nome:'Rede de pesca', areas:['doca','barcos'], loot:['corda','peixe','sucata'], tempo:1.2, w:64,h:50},
    motor:{nome:'Motor de barco', areas:['doca','barcos','porto'], loot:['peças','gasolina','bateria'], tempo:2.2, w:70,h:52},
  });
  [['lixeira',['relogio','ferro']],['caixa',['acai','ervas']],['geladeira',['ferro']],['mochila',['presepio','docas']],['papelao',['armazem','docas']],['pneus',['armazem','porto','presepio']],['caixote',['docas','armazem','porto','presepio']]]
    .forEach(([k,a])=>{ if(KINDS[k]) KINDS[k].areas=KINDS[k].areas.concat(a); });
  Object.assign(FLYSET,{
    paneiro:{ox:26,oy:-54,w:14,h:24,items:['food','food','cloth','food']}, balanca:{ox:26,oy:-62,w:14,h:24,items:['nut','can','nut','food']},
    bancaervas:{ox:36,oy:-60,w:16,h:26,items:['bottle','bottle','food','bottle']}, rede:{ox:34,oy:-44,w:16,h:26,items:['food','cloth','nut','food']},
    motor:{ox:26,oy:-56,w:16,h:28,items:['nut','bat','nut','can']} });
  Object.assign(SPARK,{paneiro:[26,-56],balanca:[26,-66],bancaervas:[40,-62],rede:[34,-46],motor:[30,-58]});
  const VST=['#f8e2a8','#e0bc70','#c4964a','#9a6e34','#6e4a22','#4a2e14','#2e1a0a'], VNT=['#9ad8b0','#6ab890','#4a9070','#346a54','#224a3c','#16302a'];
  const VGAR=['#e8963a','#6ab84a','#c84a4a','#9a64c8','#e8c450','#4aa8a8'];
  Object.assign(D,{
    paneiro(p,x,G,o,done,fi,c,u){ const e=mkE(c,u); p.id(); e.ell(x+26,G+1,30,3,'#1c1226');
      e.band([[x+2,G-40],[x+50,G-40],[x+44,G-1],[x+8,G-1]],VST,[1,2,6,6,4,2,1],'x',x+2,x+50);
      for(let r=0;r<9;r++){ const yy=G-38+r*4.2, ins=(r/9)*6; for(let k=0;k<8;k++){ const xx=x+4+ins+k*((42-ins*2)/8)+(r%2)*2.6; e.rect(xx,yy,3.4,2.2,(k+r)%2?VST[1]:VST[3]); } }
      e.rect(x+1,G-43,50,4,VST[2]); e.rect(x+1,G-43,50,1.4,VST[0]); e.rect(x+1,G-39.6,50,1,VST[5]); e.rect(x+40,G-38,4,36,VST[4]);
      if(!done){ e.ell(x+26,G-44,22,6,'#2a0a2e'); for(let i=0;i<26;i++) e.ell(x+8+hsh(i,4)*36,G-47+hsh(i,7)*6,1.6,1.4,hsh(i,9)>.5?'#5a2060':'#18061c'); e.rect(x+14,G-49,4,1,'#9a6aa0');
        c.save(); c.translate(x+6,G-48); c.rotate(-o*1.2); e.poly([[0,0],[40,-2],[42,4],[2,6]],'#c83a3a'); e.rect(2,0,38,1.2,'#ff8a7a'); for(let k=0;k<5;k++) e.rect(4+k*8,1.5,4,3,'#f2e8d8'); c.restore(); }
      else e.ell(x+26,G-42,21,4,'#1a0e14');
      e.rect(x+28,G-24,12,8,'#e8e4d8'); e.rect(x+29,G-22,8,1,'#5a2060'); e.rect(x+29,G-20,6,1,'#5a2060');
    },
    balanca(p,x,G,o,done,fi,c,u){ const e=mkE(c,u); p.id(); e.ell(x+26,G+1,28,3,'#1c1226');
      e.band([[x+4,G-26],[x+48,G-26],[x+48,G-1],[x+4,G-1]],WD,[1,2,6,4,2,1,1],'x',x+4,x+48); e.rect(x+4,G-26,44,2,WD[0]); for(let k=1;k<3;k++) e.rect(x+4,G-26+k*8,44,1.2,WD[5]);
      e.band([[x+12,G-50],[x+40,G-50],[x+42,G-26],[x+10,G-26]],['#f4f6fa','#c8d0dc','#9aa6b8','#6a7890','#46526a'],[1,3,4,3,2],'x',x+10,x+42); e.rect(x+12,G-50,28,1.4,'#ffffff');
      e.circ(x+26,G-39,9,['#ffffff','#e8ecf0','#c4ccd8'],[1,3,1]); for(let k=0;k<7;k++){ const a=Math.PI*(1+k/6); e.rect(x+26+Math.cos(a)*7-0.5,G-39+Math.sin(a)*7-0.5,1,1,'#26283a'); }
      const ang=Math.PI*1.15+(done?0.9:o*1.3)+Math.sin(fi*2)*0.06*o; e.poly([[x+25.4,G-39],[x+26+Math.cos(ang)*7.5,G-39+Math.sin(ang)*7.5],[x+26.6,G-39]],'#d83a3a'); e.ell(x+26,G-39,1.4,1.4,'#26283a');
      e.rect(x+22,G-31,8,3,'#26283a'); e.rect(x+23,G-30,2,1,'#e8ecf0'); e.rect(x+26,G-30,3,1,'#e8ecf0');
      e.rect(x+24,G-53,4,3,'#6a7890'); e.ell(x+26,G-54,17,3.4,'#5e6890'); e.ell(x+26,G-55,15,2.4,'#d0d8e8'); e.rect(x+14,G-56,10,1,'#ffffff');
      if(!done){ e.ell(x+19,G-58,4,3,'#e8c03a'); e.ell(x+26,G-59,4,3.4,'#d84a3a'); e.ell(x+33,G-58,3.6,3,'#6ab84a'); e.rect(x+25,G-63,1.4,2,'#3a6a2a'); e.rect(x+18,G-60,2,1,'#fff0a0'); }
    },
    bancaervas(p,x,G,o,done,fi,c,u){ const e=mkE(c,u); p.id(); e.ell(x+42,G+1,44,3,'#1c1226');
      for(const px of [x+1,x+70]){ e.band([[px,G-58],[px+4,G-58],[px+4,G-2],[px,G-2]],[WD[1],WD[3],WD[5]],[1,2,1],'x',px,px+4); }
      e.band([[x-2,G-60],[x+78,G-60],[x+78,G-55],[x-2,G-55]],[WD[0],WD[2],WD[4]],[1,2,2],'y',G-60,G-55);
      for(let i=0;i<7;i++){ const hx2=x+6+i*10.5, L=10+hsh(i,2)*8, sw=done?0:Math.sin(fi*1.7+i)*1.4*o; e.rect(hx2,G-55,1,3,'#2a1a14'); for(let j=0;j<5;j++) e.poly([[hx2-0.5,G-52],[hx2+1.5,G-52],[hx2-3+j*1.6+sw,G-52+L],[hx2-4.4+j*1.6+sw,G-52+L]],j%2?VNT[2]:(i%3?VNT[1]:'#a8884a')); }
      slab(e,x+4,G,62,26,12,-8,WK);
      const n=done?3:7; for(let i=0;i<n;i++){ const sh=done?0:Math.round(Math.sin(fi*2+i)*o), bx=x+8+i*8, h=11+hsh(i,3)*6, col=VGAR[i%6], top=G-26-h+sh;
        e.rect(bx,top,6.4,h,col); e.rect(bx+0.8,top+1.4,1.2,h-3,'#f4f0e8'); e.rect(bx+5,top,1.4,h,'#26182a'); e.rect(bx+1.6,top-4,3.2,4,'#c8b898'); e.rect(bx+1.6,top-4,3.2,1,'#f0e4c8'); }
      e.ell(x+72,G-6,9,4,VST[3]); e.ell(x+72,G-8,7,3,'#8a5a2a'); e.rect(x+68,G-11,3,3,'#a8743a'); e.rect(x+74,G-12,2,4,'#6a8a3a');
      e.rect(x+14,G-16,30,7,'#2a5a3a'); e.rect(x+16,G-14,4,3,'#f0e6c0'); e.rect(x+22,G-14,4,3,'#f0e6c0'); e.rect(x+28,G-14,12,1,'#f0e6c0'); e.rect(x+28,G-12,8,1,'#f0e6c0');
    },
    rede(p,x,G,o,done,fi,c,u){ const e=mkE(c,u); p.id(); e.ell(x+34,G+1,36,3,'#1c1226');
      const hh=done?26:38, pile=[]; for(let i=0;i<=20;i++){ const a=Math.PI*i/20; pile.push([x+34-Math.cos(a)*32,G-2-Math.sin(a)*hh*(0.85+0.15*Math.sin(i*1.7))]); } pile.push([x+66,G],[x+2,G]);
      e.band(pile,VNT,[1,2,3,3,2,1],'y',G-hh-4,G);
      for(let i=0;i<34;i++){ const px=x+6+hsh(i,2)*56, k=1-Math.abs(px-x-34)/38, py=G-4-hsh(i,5)*(hh-8)*k; e.rect(px,py,4,1,VNT[5]); e.rect(px+1.5,py-1.5,1,4,VNT[5]); e.rect(px+0.5,py-1,2,1,VNT[0]); }
      for(let i=0;i<6;i++){ const fx=x+8+i*9.5, k=1-Math.abs(fx-x-34)/38, fy=G-6-hsh(i,8)*(hh-12)*k; e.ell(fx,fy,3.4,2.6,i%2?'#f08a3a':'#f4efe4'); e.rect(fx-2,fy-2,2,1,'#ffffff'); }
      if(!done){ const lift=o*10; e.poly([[x+20,G-38-lift],[x+46,G-36-lift],[x+44,G-30],[x+22,G-31]],VNT[1]); e.rect(x+22,G-37-lift,22,1,VNT[0]);
        e.ell(x+52,G-10,7,3,'#c8d0dc'); e.ell(x+52,G-11,5,1.4,'#f0f4fa'); e.poly([[x+45,G-10],[x+40,G-14],[x+40,G-6]],'#9aa6b8'); e.rect(x+56,G-11,1.4,1.4,'#16101a'); }
    },
    motor(p,x,G,o,done,fi,c,u){ const e=mkE(c,u); p.id(); e.ell(x+36,G+1,38,3,'#1c1226'); e.ell(x+30,G,18,2,'#3a2a3a');
      slab(e,x+4,G,50,14,10,-6,WD);
      const CV2=['#ff9a8a','#e8564a','#c03a32','#8a2228','#5a141c'], bx=x+10, by=G-14, sh=done?0:Math.round(Math.sin(fi*3)*o);
      e.band([[bx,by-30+sh],[bx+30,by-34+sh],[bx+36,by-20],[bx+34,by],[bx+2,by]],CV2,[1,3,4,3,2],'x',bx,bx+36);
      e.rect(bx+4,by-24,26,6,'#f2ece0'); e.rect(bx+6,by-22,8,2,'#2a2030'); e.rect(bx+16,by-22,10,2,'#3a6ab8');
      const th=done?1.2:o*0.9; if(th>0.2){ e.rect(bx+4,by-31,24,7,'#2a2030'); e.rect(bx+7,by-29,6,4,'#8a8a9a'); e.rect(bx+16,by-30,5,5,'#c8a03a'); e.rect(bx+16,by-30,5,1,'#f0d070'); }
      c.save(); c.translate(bx+2,by-30+sh); c.rotate(-th); e.band([[0,0],[30,-4],[32,2],[2,6]],['#ffb0a0','#e8564a','#a82e2a'],[1,2,2],'y',-4,6); e.rect(4,0,24,1,'#ffd8d0'); c.restore();
      e.rect(bx+36,by-6,30,3,'#9aa4c0'); e.rect(bx+36,by-6,30,1,'#e0e8f4'); e.poly([[bx+64,by-12],[bx+68,by-4],[bx+64,by+4],[bx+62,by-4]],'#c8d0dc'); e.ell(bx+64,by-4,2,2,'#5e6890');
      e.band([[x+52,G-18],[x+68,G-18],[x+68,G-1],[x+52,G-1]],['#ff8a7a','#d83a3a','#8a1a22'],[1,3,2],'x',x+52,x+68); e.rect(x+56,G-22,6,4,'#26242c'); e.rect(x+52,G-18,16,1,'#ffb0a0');
      if(done){ e.rect(x-6,G-3,6,2,'#c8d0dc'); e.ell(x+74,G-2,4,1.4,'#26242c'); }
    },
  });

  // ================= Lapa (Rio de Janeiro): objetos próprios + objetos comuns que também aparecem lá =================
  Object.assign(KINDS,{
    mesabar:{nome:'Mesa de bar', areas:['lavradio','boemia','guimaraes','selaron'], loot:['comida','água','garrafa','sucata'], tempo:1.0, w:70,h:62},
    espetinho:{nome:'Carrinho de espetinho', areas:['central','circo','boemia','guimaraes'], loot:['comida','comida','sucata','gasolina'], tempo:1.4, w:72,h:66},
    bancajornal:{nome:'Banca de jornal', areas:['central','municipal','catedral'], loot:['pano','fios','sucata','comida'], tempo:1.8, w:74,h:78},
    antiguidade:{nome:'Cômoda de antiquário', areas:['lavradio','selaron','santateresa'], loot:['madeira','ferramenta','pano','remédio'], tempo:1.8, w:58,h:62},
    caixasom:{nome:'Caixa de som do palco', areas:['circo','boemia','mirante'], loot:['peças','fios','bateria'], tempo:1.6, w:46,h:72},
    vaso:{nome:'Vaso de azulejo', areas:['selaron','santateresa','mirante','municipal'], loot:['ervas','água','madeira'], tempo:0.9, w:42,h:48},
  });
  [['lixeira',['central','municipal','catedral','boemia','arcos']],['mochila',['central','catedral','santateresa','mirante']],['carro',['central','catedral','santateresa']],['papelao',['lavradio','circo','central']],
   ['caixa',['lavradio','guimaraes']],['geladeira',['santateresa','guimaraes']],['coco',['mirante','municipal']],['pneus',['circo','catedral']],['isopor',['boemia','lavradio','guimaraes','mirante']],['carrinho',['municipal','central']]]
    .forEach(([k,a])=>{ if(KINDS[k]) KINDS[k].areas=KINDS[k].areas.filter(x=>x!=='arcos').concat(a.filter(x=>x!=='arcos')); });
  Object.assign(FLYSET,{
    mesabar:{ox:28,oy:-50,w:14,h:24,items:['bottle','can','bottle','food']}, espetinho:{ox:30,oy:-56,w:16,h:26,items:['food','food','can','nut']},
    bancajornal:{ox:30,oy:-60,w:18,h:28,items:['paper','paper','cloth','bat']}, antiguidade:{ox:24,oy:-52,w:14,h:26,items:['cloth','nut','paper','bottle']},
    caixasom:{ox:20,oy:-58,w:14,h:26,items:['nut','bat','nut','bat']}, vaso:{ox:18,oy:-44,w:12,h:22,items:['food','bottle','food','nut']} });
  Object.assign(SPARK,{mesabar:[30,-58],espetinho:[32,-62],bancajornal:[34,-80],antiguidade:[26,-64],caixasom:[22,-72],vaso:[20,-50]});
  const LAM=['#fff4b0','#ffe060','#f2c230','#c8961c','#8e6414','#5a3c0c','#36220a'], PLW=['#ffffff','#eef0f4','#cfd4de','#a2aabb','#747c92','#4c526a'];
  const VDR=['#a8e8a0','#5ab858','#2e8a3a','#1e6a2a','#124a1e'], AMB=['#f8c070','#d8862a','#a85a16','#6e3a10'];
  const MET=['#e8ecf4','#b8c0d0','#8a94a8','#606a80','#3e465a','#262c3c'], GRN=['#9ad8a8','#5aa878','#3a8058','#2a5e42','#1c402e','#10281e'];
  const TIL=['#d8302a','#f2c230','#2a52b0','#2e9a4a','#f2eee2'];
  Object.assign(D,{
    mesabar(p,x,G,o,done,fi,c,u){ const e=mkE(c,u); p.id(); const w=40,h=4,dx=10,dy=-7, ty=G-30, sh=done?0:Math.sin(fi*2.2)*o*1.2;
      e.ell(x+30,G+1,36,3,'#1c1226');
      // cadeira de plástico atrás (vermelha) e outra tombada na frente quando vasculhado
      e.band([[x+40,G-46],[x+60,G-46],[x+62,G-26],[x+40,G-26]],['#ff8a7a','#e8403a','#b02a28','#7a1a1e'],[1,3,3,2],'x',x+40,x+62); e.rect(x+41,G-44,18,1.4,'#ffb0a0');
      for(const lx of [x+41,x+59]) e.rect(lx,G-26,2.4,25,'#a82a28'); e.poly([[x+38,G-28],[x+64,G-28],[x+62,G-24],[x+40,G-24]],'#e8403a');
      // mesa de lata amarela
      for(const lx of [x+3,x+w-3,x+dx+3,x+dx+w-3]) e.rect(lx,ty+(lx>x+dx?dy:0),2,30-(lx>x+dx?dy:0),LAM[4]);
      slab(e,x,ty+h,w,h,dx,dy,LAM); e.rect(x,ty+h,w,3,LAM[3]); e.rect(x+2,ty+h+3,w-4,1,LAM[5]);
      if(!done){ [[8,VDR],[16,AMB],[25,VDR]].forEach(([a,P],k)=>{ const bx=x+a+(k===1?sh:0), by=ty-1; e.rect(bx,by-14,5,14,P[2]); e.rect(bx+1.4,by-20,2.2,6,P[2]); e.rect(bx,by-14,1.2,13,P[0]); e.rect(bx+4,by-13,1,12,P[3]); e.rect(bx+1,by-9,3,4,'#f2eee2'); });
        e.rect(x+31,ty-6,6,6,'#f2eee2'); e.rect(x+31,ty-6,6,1.2,'#ffffff'); e.ell(x+34,ty-6,3,1.2,'#e8c050'); }
      else { e.poly([[x+4,G-2],[x+16,G-12],[x+18,G-8],[x+8,G]],VDR[3]); e.ell(x+22,G-1,8,1.6,'#3a5a3a'); }
      e.rect(x+12,ty+h-1,14,1,LAM[0]); },
    espetinho(p,x,G,o,done,fi,c,u){ const e=mkE(c,u); p.id(); const w=52,h=24,dx=12,dy=-8, ty=G-12;
      shadow3(e,x,G,w,dx,dy);
      for(const wx of [x+10,x+w-8]){ e.circ(wx,G-6,6,['#5a5a6e','#2a2838','#16141e'],[1,2,2]); e.ell(wx,G-6,2,2,'#a8acc0'); }
      slab(e,x,ty,w,h,dx,dy,MET); e.rect(x+4,ty-h+6,w-8,10,MET[4]); e.rect(x+6,ty-h+8,w-12,6,'#2a2030');
      text2(e,x+8,ty-12,'ESPETO','#f2e6c0');
      // grelha com brasa e espetos
      const gy=ty-h+dy*.5-2; e.poly([[x+2,gy],[x+w-2,gy],[x+w-2+dx,gy+dy],[x+2+dx,gy+dy]],'#26242c');
      const hot=done?0:1; for(let k=0;k<16;k++){ const bx=x+5+hsh(k,3)*(w-8)+hsh(k,5)*dx*.8, by=gy+dy*hsh(k,5)-1; e.rect(bx,by,2.4,1.6,hot?(hsh(k,7)>.5?'#ffb030':'#ff5a1a'):'#3a3438'); }
      for(let k=0;k<5;k++){ const sx=x+8+k*9, sy=gy-2+(done?0:Math.sin(fi*1.8+k)*o); if(done&&k%2) continue; e.rect(sx,sy-1,12,1,'#d8ccb8'); e.rect(sx+2,sy-3,6,4,'#8a3a22'); e.rect(sx+2,sy-3,6,1.2,'#d8703a'); }
      if(!done){ for(let k=0;k<3;k++){ const t=((fi*.25+k*.33)%1); if(t<.7) e.ell(x+24+k*6+t*6,gy-8-t*22,2+t*3,1.4+t*2,t<.35?'#c8c2d4':'#8a84a0'); } }
      e.rect(x+w+4,ty-h-26,2,30,MET[3]); e.rect(x+w-6,ty-h-30,22,6,'#d83a3a'); e.rect(x+w-6,ty-h-30,22,1.2,'#ff8a7a'); },
    bancajornal(p,x,G,o,done,fi,c,u){ const e=mkE(c,u); p.id(); const w=56,h=60,dx=14,dy=-9;
      shadow3(e,x,G,w,dx,dy); slab(e,x,G,w,h,dx,dy,GRN);
      // teto saliente
      e.poly([[x-4,G-h-2],[x+w+4,G-h-2],[x+w+4+dx,G-h-2+dy],[x-4+dx,G-h-2+dy]],'#e8e4dc'); e.rect(x-4,G-h-2,w+8,4,'#c8c4bc'); e.rect(x-4,G-h-2,w+8,1,'#ffffff');
      // vitrine de revistas (a porta de enrolar sobe ao vasculhar)
      const op=done?1:o*.85, rx=x+4, ry=G-h+6, rw=w-8, rh=h-16; e.rect(rx,ry,rw,rh,'#1a1426');
      if(!done) for(let r=0;r<3;r++) for(let k=0;k<4;k++){ const col=['#e84a3a','#ffd23f','#3a8ae8','#f2f2f2','#e86ad0','#4ac860'][(r*4+k)%6]; e.rect(rx+3+k*12,ry+3+r*14,9,12,col); e.rect(rx+3+k*12,ry+3+r*14,9,1.4,'#ffffff'); e.rect(rx+4+k*12,ry+7+r*14,6,1,'#2a2030'); }
      else for(let k=0;k<3;k++) e.rect(rx+3+k*16,ry+rh-4,10,2,'#6a6070');
      const sh=Math.round(rh*(1-op)); if(sh>0){ e.rect(rx,ry,rw,sh,GRN[3]); for(let yy=ry+2;yy<ry+sh;yy+=3) e.rect(rx,yy,rw,1,GRN[4]); e.rect(rx,ry+sh-2,rw,2,GRN[1]); }
      e.rect(x+8,G-9,w-16,5,GRN[4]); e.rect(x+10,G-8,14,3,'#e8e4dc'); e.rect(x+30,G-8,8,3,'#e8e4dc'); },
    antiguidade(p,x,G,o,done,fi,c,u){ const e=mkE(c,u); p.id(); const w=44,h=36,dx=10,dy=-7, ty=G-4;
      shadow3(e,x,G,w,dx,dy); for(const lx of [x+2,x+w-5]){ e.rect(lx,G-5,3,5,WK[4]); }
      slab(e,x,ty,w,h,dx,dy,WD);
      for(let k=0;k<3;k++){ const dyk=ty-h+4+k*11, pull=done?(k===1?7:4):(k===2-Math.floor(fi%3)?o*5:0);
        e.rect(x+3-pull*.3,dyk+pull*.1,w-6,9,WD[3]); e.rect(x+3-pull*.3,dyk+pull*.1,w-6,1.4,WD[1]); e.rect(x+3-pull*.3,dyk+8+pull*.1,w-6,1,WD[5]);
        e.ell(x+w/2-pull*.3,dyk+4.5+pull*.1,2,1.4,'#e8c050'); e.rect(x+w/2-1-pull*.3,dyk+4+pull*.1,1,1,'#fff0a0'); if(pull>3) e.rect(x+4,dyk+9,w-8,2,'#1a1020'); }
      // espelho oval em cima
      const my=ty-h+dy-16; e.ell(x+w/2+dx/2,my,12,16,'#a87a2a'); e.ell(x+w/2+dx/2,my,10,14,'#e8c050'); e.ell(x+w/2+dx/2,my,8,12,'#5a6a9a'); e.poly([[x+w/2+dx/2-5,my-6],[x+w/2+dx/2,my-11],[x+w/2+dx/2+2,my+2],[x+w/2+dx/2-3,my+6]],'#9ab0e0');
      e.rect(x+w/2+dx/2-6,my+14,12,3,'#a87a2a'); if(done) e.poly([[x+w/2+dx/2-2,my-4],[x+w/2+dx/2+4,my+2],[x+w/2+dx/2+1,my+3]],'#2a2030'); },
    caixasom(p,x,G,o,done,fi,c,u){ const e=mkE(c,u); p.id(); const w=34,h=64,dx=10,dy=-7, BK=['#5a5868','#3e3c4c','#2a2836','#1c1a26','#121018','#0a080e'];
      shadow3(e,x,G,w,dx,dy); slab(e,x,G,w,h,dx,dy,BK);
      for(let k=0;k<4;k++) e.rect(x+1,G-h+2+k*16,1,12,BK[0]);
      const pul=done?0:Math.sin(fi*3)*o; e.circ(x+w/2,G-18,11+pul*.6,['#5a5868','#2a2836','#121018'],[1,2,2]); e.ell(x+w/2,G-18,4,4,done?'#1a1020':'#6a6878'); e.ell(x+w/2-1,G-19,1.4,1.4,'#a8a8b8');
      e.circ(x+w/2,G-46,6,['#5a5868','#2a2836','#121018'],[1,2,2]); e.ell(x+w/2,G-46,2,2,'#6a6878');
      e.rect(x+4,G-h+4,w-8,5,'#2a2836'); e.rect(x+6,G-h+5,8,2,'#e8e4dc');
      if(done){ e.rect(x+w+2,G-30,6,12,'#2a2836'); e.rect(x+w+3,G-29,4,2,'#d8a040'); }
      e.poly([[x+w,G-6],[x+w+14,G-2],[x+w+20,G+1],[x+w+16,G+1],[x+w+10,G-1]],'#1a1824'); e.rect(x+w+18,G-1,4,2,'#3a6ab8'); },
    vaso(p,x,G,o,done,fi,c,u){ const e=mkE(c,u); p.id(); e.ell(x+21,G+1,22,3,'#1c1226');
      const body=[[x+4,G-26],[x+38,G-26],[x+34,G-1],[x+8,G-1]]; e.band(body,['#ff8a6a','#e8402e','#b02a24','#7a1a1a','#4a0e10'],[1,2,4,2,1],'x',x+4,x+38);
      for(let r=0;r<5;r++) for(let k=0;k<6;k++){ const v=hsh(r*7+k,11); if(v<.45) continue; const xx=x+7+k*5+r*.3, yy=G-24+r*4.6; e.rect(xx,yy,3.4,3.4,TIL[Math.floor(v*5)%5]); e.rect(xx,yy,3.4,.8,'#ffffff'); }
      e.rect(x+2,G-30,38,5,'#f2c230'); e.rect(x+2,G-30,38,1.4,'#fff4b0'); e.rect(x+2,G-26,38,1,'#8e6414');
      if(!done){ const sw=Math.sin(fi*2)*o*2; e.ell(x+21,G-30,16,3,'#3a2a20');
        for(let k=0;k<9;k++){ const a=-2.9+k*.36, L=14+hsh(k,4)*10, bx=x+21, by=G-31; e.poly([[bx,by],[bx+Math.cos(a)*L+sw,by+Math.sin(a)*L],[bx+Math.cos(a+.18)*L*.8+sw,by+Math.sin(a+.18)*L*.8]],k%2?'#3e9a46':'#2a7a3a'); }
        for(let k=0;k<3;k++) e.ell(x+12+k*9+sw,G-46+hsh(k,2)*6,2.6,2.6,'#e84a6a'); }
      else { e.ell(x+21,G-30,16,3,'#2a1a14'); e.ell(x+30,G-2,7,2,'#4a3020'); for(let k=0;k<3;k++) e.poly([[x+40+k*3,G-1],[x+44+k*3,G-6],[x+45+k*3,G-1]],'#2a7a3a'); } },
  });
  function text2(e,x,y,str,col){ const F={E:[7,4,6,4,7],S:[7,4,7,1,7],P:[7,5,7,4,4],T:[7,2,2,2,2],O:[7,5,5,5,7]}; let cx=x; for(const ch of str){ const Gl=F[ch]; if(Gl) for(let r=0;r<5;r++) for(let b=0;b<3;b++) if(Gl[r]&(4>>b)) e.rect(cx+b,y+r,1,1,col); cx+=4; } }

  function glow(p,kind,x,G,fi){
    const s=SPARK[kind], r=[1.4,2.4,3.4,2.4][fi%4]; const gx=Math.round(x+s[0]), gy=Math.round(G+s[1]);
    p.id(); star(p,'#e8fbff',gx,gy,r); p.F('#7fe0ff'); p.rect(gx-r-2,gy-0.5,1.2,1.2); p.rect(gx+r+2,gy-0.5,1.2,1.2); p.rect(gx-0.5,gy-r-2,1.2,1.2);
  }
  // passe de luz: faixas duras (topo quente, base roxa) + luz lateral — dá volume/hue shift a todo prop
  const hx=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
  const WARM=hx('#fff0c8'), COOL=hx('#3b2c63'), DEEP=hx('#1c1233');
  function grade(cv,gy){
    const W=cv.width,H=cv.height,g=cv.getContext('2d'),im=PIX.pix(cv),d=im.data;
    let y0=H,y1=0,x0=W,x1=0; for(let y=0;y<H;y++)for(let x=0;x<W;x++) if(d[(y*W+x)*4+3]>0){ if(y<y0)y0=y; if(y>y1)y1=y; if(x<x0)x0=x; if(x>x1)x1=x; }
    const hh=Math.max(1,y1-y0), ww=Math.max(1,x1-x0);
    const mixc=(c,t,m)=>[c[0]+(t[0]-c[0])*m,c[1]+(t[1]-c[1])*m,c[2]+(t[2]-c[2])*m];
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){ const i=(y*W+x)*4; if(!d[i+3]) continue;
      let c=[d[i],d[i+1],d[i+2]]; if(c[0]<44&&c[1]<30&&c[2]<48) continue; if(c[0]===0xa9&&c[1]===0xc8&&c[2]===0xf0) continue;
      const t=(y-y0)/hh, u=(x-x0)/ww, lum=(c[0]+c[1]+c[2])/765, wk=1-lum*0.55;
      if(t<0.1) c=mixc(c,WARM,0.26*wk); else if(t<0.2) c=mixc(c,WARM,0.15*wk); else if(t<0.3) c=mixc(c,WARM,0.06*wk); else if(t>0.92) c=mixc(c,DEEP,0.4); else if(t>0.82) c=mixc(c,COOL,0.3); else if(t>0.72) c=mixc(c,COOL,0.2); else if(t>0.62) c=mixc(c,COOL,0.1); else if(t>0.52) c=mixc(c,COOL,0.04);
      if(u<0.1) c=mixc(c,WARM,0.1*wk); else if(u>0.9) c=mixc(c,COOL,0.16); else if(u>0.8) c=mixc(c,COOL,0.07);
      d[i]=c[0]; d[i+1]=c[1]; d[i+2]=c[2]; }
    g.putImageData(im,0,0); return cv;
  }
  const cache=PIX.cache();
  function frame(kind,state,fi=0,step=5){
    const K=PIX.getK(), key=kind+state+fi+step+'@'+K; if(cache.has(key)) return cache.get(key);
    const s=size(kind), G=s.FH-PADB, x0=PADX+7, vas=state==='vasculhando', done=state==='vasculhado';
    const sh=vas?[0,1,-1,1][fi%4]:0;
    const o=vas?[0.5,0.95,0.7,1][fi%4]:0;
    const parts=[];
    parts.push({draw:(c,u)=>{ const p=mkPen(c,u); p.id(); (hero[kind]||D[kind])(p,x0+sh,G,o,done,fi,c,u); p.id(); }});
    if(vas) parts.push({noShade:true,noRim:true,draw:(c,u)=>{ const p=mkPen(c,u); p.id(); fly(p,kind,x0,G,fi,done); }});
    if(state==='fechado') parts.push({noShade:true,noRim:true,draw:(c,u)=>{ const p=mkPen(c,u); glow(p,kind,x0,G,fi); }});
    const cv=compose({FW:Math.round(s.FW*K),FH:Math.round(s.FH*K),GROUND:G*K,parts,M,step,rim:RIM});
    grade(cv);
    cv._top=Math.round((G-KINDS[kind].h-6)*K); cv._cx=Math.round(s.FW/2*K);
    cache.set(key,cv); return cv;
  }
  const kinds={}; Object.entries(KINDS).forEach(([k,v])=>kinds[k]={nome:v.nome,areas:v.areas,loot:v.loot,tempo:v.tempo});
  return {KINDS:kinds, frame, ANCHOR, M};
})();
