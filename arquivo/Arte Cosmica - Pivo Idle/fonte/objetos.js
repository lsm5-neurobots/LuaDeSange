/* ===== OBJ: objetos de vasculhar em hi-bit (pipeline PIX) =====
   contrato: OBJ.KINDS[id] = {nome, areas, loot, tempo}; OBJ.frame(kind,state,fi,step); OBJ.ANCHOR(kind) -> {ax,gy} */
const OBJ=(function(){
  const {ramp,mkPen,compose,P2}=PIX;
  const RIM='#a9c8f0';
  const M={
    orange:ramp('#e0701e'), lid:ramp('#3a3a44'), black:ramp('#26242c'), wood:ramp('#9a6a3c'), woodD:ramp('#6d4828'),
    metal:ramp('#9aa59c'), rust:ramp('#8a4e2e'), blood:ramp('#7a2a2a'), tape:ramp('#b8bcc4'), red:ramp('#c83a3a'),
    enamel:ramp('#d8d2c2'), green:ramp('#5a9a5a'), car:ramp('#4f7f8c'), glass:ramp('#36506e'), card:ramp('#c49a64'),
    tire:ramp('#34323a'), canvas:ramp('#5a6a3e'), yellow:ramp('#e8c040'), bag:ramp('#2c2c34'), paper:ramp('#e8e4d8'),
    food:ramp('#d84a3a'), leaf:ramp('#5aa03a'), chrome:ramp('#d4d8e0'), inside:ramp('#2a2030'), light:ramp('#cfeaff'), straw:ramp('#d8b860'),
  };
  const KINDS={
    lixeira:{nome:'Lixeira da prefeitura', areas:['ponte','feira','bomjesus','moeda','riobranco','marco'], loot:['sucata','pano','comida','pilha','antídoto'], tempo:1.0, w:40,h:50, lid:true},
    caixa:{nome:'Caixote de feira', areas:['feira','bomjesus'], loot:['madeira','pregos','corda','fita','munição'], tempo:1.5, w:50,h:34},
    carro:{nome:'Carro abandonado', areas:['ponte','arsenal','riobranco'], loot:['sucata','peças','gasolina','bateria'], tempo:2.5, w:124,h:62},
    geladeira:{nome:'Geladeira velha', areas:['apolo','moeda'], loot:['água','comida','antídoto'], tempo:1.5, w:36,h:72},
    armario:{nome:'Armário de hospital', areas:['alfandega','arsenal'], loot:['pano','atadura','kit médico'], tempo:2.0, w:46,h:66},
    mochila:{nome:'Mochila largada', areas:['ponte','alfandega','marco','travessia'], loot:['comida','água','munição'], tempo:0.8, w:26,h:20},
    papelao:{nome:'Caixa de papelão', areas:['moeda','apolo','sertao'], loot:['pano','pilha','fita'], tempo:1.0, w:34,h:26},
    pneus:{nome:'Pilha de pneus', areas:['arsenal','riobranco','sertao'], loot:['sucata','borracha','pregos'], tempo:1.8, w:40,h:40},
    caixote:{nome:'Caixote do porto', areas:['sertao','marco','molhe'], loot:['madeira','munição','corda','peças'], tempo:2.0, w:58,h:46},
    carrinho:{nome:'Carrinho de feira', areas:['feira','bomjesus','moeda'], loot:['comida','sucata','água'], tempo:1.2, w:50,h:44},
  };
  const PADX=10, PADT=34, PADB=6;
  const size=k=>{ const K=KINDS[k]; return {FW:K.w+PADX*2, FH:K.h+PADT+PADB}; };
  function ANCHOR(k){ const s=size(k), K=PIX.getK(); return {ax:Math.round(s.FW/2*K), gy:Math.round((s.FH-PADB)*K)}; }

  // ---- desenhos: (p, x0 = esquerda do objeto, G = chão, t = abertura 0..1, done = vasculhado)
  const D={
    lixeira(p,x,G,t,done){
      p.F(M.paper[1]); if(!done){ p.rect(x+42,G-3,6,2); p.rect(x+46,G-6,4,2); } else { p.rect(x-6,G-3,8,2); p.rect(x+44,G-4,6,2); p.F(M.food[1]); p.rect(x+50,G-3,3,2); }
      p.F(M.bag[1]); if(!done) p.ell(x+44,G-6,6,5);
      p.F(M.black[1]); p.circle(P2(x+9,G-2.5),3); p.circle(P2(x+31,G-2.5),3);
      p.F(M.orange[1]); p.poly([[x+3,G-44],[x+37,G-44],[x+35,G-5],[x+5,G-5]]);
      p.F(M.orange[2]); for(let k=0;k<5;k++) p.rect(x+8+k*6,G-40,1.4,32);
      p.F(M.green[1]); p.rect(x+13,G-26,8,7); p.F(M.paper[1]); p.rect(x+15,G-24,4,3);
      p.F(M.blood[1]); p.rect(x+28,G-30,3,6); p.rect(x+29,G-24,1,4);
      p.F(M.metal[2]); p.rect(x+1,G-38,3,22);
      if(!done && t<0.5){ p.F(M.bag[1]); p.ell(x+14,G-45,7,4); p.ell(x+26,G-46,6,4); }
      const a=(done?2.1:t*1.9); p.xf(a,x+38,G-46); p.F(M.lid[1]); p.poly([[-38,-2.5],[1,-2.5],[1,2.6],[-38,2.6]]); p.F(M.lid[0]); p.rect(-36,-2.5,34,1); p.id();
      if(done){ p.F(M.inside[1]); p.poly([[x+4,G-44],[x+36,G-44],[x+35,G-40],[x+5,G-40]]); }
    },
    caixa(p,x,G,t,done){
      p.F(M.leaf[1]); p.ell(x+56,G-2,4,2); p.F(M.food[1]); p.ell(x-4,G-2,3,2);
      p.F(M.woodD[1]); p.rect(x,G-34,50,34);
      p.F(M.wood[1]); for(let k=0;k<3;k++) p.rect(x+6,G-31+k*10,38,8);
      p.F(M.woodD[1]); p.rect(x,G-34,7,34); p.rect(x+43,G-34,7,34);
      p.F(M.woodD[0]); p.poly([[x+8,G-4],[x+13,G-4],[x+42,G-30],[x+37,G-30]]);
      p.F(M.red[2]); p.rect(x+16,G-16,12,4);
      p.F(M.tape[1]); [[3,4],[46,4],[3,28],[46,28]].forEach(([dx,dy])=>p.rect(x+dx,G-dy-1,1.4,1.4));
      p.F(M.blood[1]); p.rect(x+44,G-14,4,5);
      if(done || t>0){ p.F(M.inside[1]); p.rect(x+2,G-36,46,4); p.F(M.straw[1]); if(!done) p.rect(x+6,G-37,36,2); }
      const a=(done?1.7:t*1.4); p.xf(a,x+50,G-35); p.F(M.wood[1]); p.rect(-50,-3,50,4); p.F(M.tape[1]); p.rect(-30,-3.4,8,4.8); p.F(M.woodD[2]); p.rect(-34,-3,1,4); p.rect(-17,-3,1,4); p.id();
    },
    carro(p,x,G,t,done){
      p.F(M.paper[1]); p.poly([[x+8,G-1],[x+22,G-3],[x+23,G],[x+9,G+1]]);
      p.F(M.car[1]); p.poly([[x+2,G-30],[x+122,G-30],[x+124,G-12],[x+120,G-6],[x+4,G-6],[x,G-14]]);
      p.poly([[x+22,G-30],[x+30,G-52],[x+80,G-54],[x+96,G-30]]);
      p.F(M.glass[1]); p.poly([[x+30,G-32],[x+35,G-49],[x+56,G-50],[x+56,G-32]]); p.poly([[x+60,G-32],[x+60,G-50],[x+78,G-50],[x+90,G-32]]);
      p.F(M.glass[0]); p.rect(x+40,G-46,2,8); p.rect(x+66,G-46,2,8);
      p.F(M.car[2]); p.rect(x+4,G-20,116,1.4); p.rect(x+57,G-30,1.4,22);
      p.F(M.rust[1]); p.ell(x+24,G-10,9,4); p.ell(x+100,G-10,9,4); p.rect(x+40,G-9,30,2);
      p.F(M.blood[1]); p.rect(x+66,G-26,4,8); p.rect(x+67,G-18,1,5);
      p.F(M.yellow[1]); p.rect(x+118,G-27,4,4); p.F(M.red[1]); p.rect(x+1,G-27,3,4);
      p.F(M.tire[1]); p.ell(x+24,G-6,10,9); p.ell(x+102,G-5,11,7);
      p.F(M.chrome[1]); p.ell(x+24,G-6,4,4); p.ell(x+102,G-5,4,3);
      const th=done?1:t;
      p.xf(-th*0.9,x+96,G-30); p.F(M.car[1]); p.rect(0,-3,27,4); p.id();
      p.xf(Math.PI+th*0.9,x+22,G-30); p.F(M.car[1]); p.rect(0,-1,20,4); p.id();
      if(th>0){ p.F(M.inside[1]); p.rect(x+98,G-30,22,4); p.rect(x+4,G-30,16,4); if(!done){ p.F(M.yellow[1]); p.rect(x+104,G-31,6,3); } }
    },
    geladeira(p,x,G,t,done){
      p.F(M.enamel[1]); p.poly([[x,G-64],[x+3,G-72],[x+33,G-72],[x+36,G-64],[x+36,G-4],[x,G-4]]);
      p.F(M.black[1]); p.rect(x+1,G-6,34,5);
      p.F(M.rust[1]); p.rect(x,G-10,36,3); p.rect(x+33,G-50,3,8);
      p.F(M.enamel[2]); p.rect(x+1,G-52,34,1.4);
      p.F(M.chrome[1]); p.rect(x+30,G-66,2,10);
      p.F(M.blood[1]); p.rect(x+8,G-66,4,8);
      p.F(M.paper[1]); p.ell(x+16,G-80,4,1.4); p.F(M.black[1]); p.ell(x+16,G-84,3,4); p.F(M.paper[1]); p.ell(x+16,G-83,1.6,2.6); p.F(M.yellow[1]); p.rect(x+17,G-86,2,1);
      const o=done?0.85:t*0.8, dw=36*(1-o);
      if(o>0){ p.F(M.light[1]); p.rect(x+1,G-50,34,42); p.F(M.metal[2]); [0,1,2].forEach(k=>p.rect(x+2,G-40+k*11,32,1.4)); if(!done){ p.F(M.food[1]); p.rect(x+6,G-46,6,5); p.F(M.green[1]); p.rect(x+18,G-34,5,7); } }
      p.F(M.enamel[1]); p.poly([[x,G-50],[x+dw,G-50+o*3],[x+dw,G-8-o*3],[x,G-8]]);
      p.F(M.chrome[1]); p.rect(x+Math.max(1,dw-6),G-42,2,12);
      if(o<0.5){ p.F(M.red[1]); p.rect(x+8,G-40,4,4); p.F(M.yellow[1]); p.rect(x+15,G-30,5,3); p.F(M.paper[1]); p.rect(x+20,G-44,6,6); }
    },
    armario(p,x,G,t,done){
      p.F(M.metal[1]); p.rect(x,G-66,46,62); p.F(M.black[1]); p.rect(x,G-6,46,5);
      p.F(M.metal[2]); p.rect(x+22.4,G-64,1.4,58);
      p.F(M.metal[3]); for(let k=0;k<4;k++){ p.rect(x+4,G-60+k*3,14,1); p.rect(x+27,G-60+k*3,14,1); }
      p.F(M.paper[1]); p.ell(x+34,G-36,5,5); p.F(M.red[1]); p.rect(x+33,G-40,2,8); p.rect(x+30,G-37,8,2);
      p.F(M.yellow[1]); p.poly([[x+30,G-18],[x+38,G-18],[x+34,G-24]]);
      p.F(M.blood[1]); p.rect(x+6,G-66,3,10);
      p.F(M.rust[1]); p.rect(x+10,G-14,8,4);
      p.F(M.canvas[1]); p.rect(x+4,G-70,16,4); p.F(M.chrome[1]); p.ell(x+34,G-69,6,2);
      const o=done?0.85:t*0.8, dw=22*(1-o);
      if(o>0){ p.F(M.inside[1]); p.rect(x+1,G-64,21,58); p.F(M.metal[3]); p.rect(x+2,G-40,19,1.4); if(!done){ p.F(M.paper[1]); p.rect(x+5,G-36,8,5); p.F(M.red[1]); p.rect(x+8,G-35,2,3); } }
      p.F(M.metal[1]); p.poly([[x,G-64],[x+dw,G-64+o*3],[x+dw,G-6-o*3],[x,G-6]]); p.F(M.metal[2]); p.ell(x+dw*0.5,G-40,dw*0.2+0.5,3);
      if(!done && o<0.3){ p.F(M.yellow[1]); p.rect(x+18,G-38,4,5); }
      if(done){ p.F(M.yellow[1]); p.rect(x-6,G-3,4,3); }
    },
    mochila(p,x,G,t,done){
      p.F(M.canvas[2]); p.cap(P2(x+2,G-4),P2(x-4,G-1),2,2);
      p.F(M.canvas[1]); p.poly([[x+2,G-2],[x+3,G-16],[x+8,G-20],[x+20,G-20],[x+25,G-15],[x+25,G-2]]);
      p.F(M.canvas[2]); p.rect(x+5,G-9,17,6); p.F(M.yellow[1]); p.rect(x+12,G-8,3,2);
      p.F(M.blood[1]); p.rect(x+20,G-12,2,4);
      const a=done?2.4:t*2.2; p.xf(-a,x+4,G-17); p.F(M.canvas[0]); p.poly([[0,-2],[20,-2],[19,6],[1,6]]); p.F(M.black[1]); p.rect(9,4,2,3); p.id();
      if(a>0.6 && !done){ p.F(M.food[1]); p.rect(x+9,G-22,5,4); p.F(M.light[1]); p.rect(x+15,G-23,3,5); }
    },
    papelao(p,x,G,t,done){
      p.F(M.card[1]); p.rect(x,G-22,34,22); p.F(M.card[2]); p.rect(x,G-22,34,2); p.rect(x+16,G-20,1.4,18);
      p.F(M.tape[1]); p.rect(x+13,G-22,8,6);
      p.F(M.black[1]); p.rect(x+4,G-12,7,1); p.rect(x+4,G-9,5,1); p.poly([[x+24,G-14],[x+28,G-14],[x+26,G-17]]);
      p.F(M.blood[1]); p.rect(x+28,G-8,3,4);
      const a=done?1.9:t*1.7;
      p.xf(a,x+34,G-22); p.F(M.card[0]); p.rect(-17,-2,17,3); p.id();
      p.xf(-a,x,G-22); p.F(M.card[0]); p.rect(0,-2,17,3); p.id();
      if(a>0.4){ p.F(M.inside[1]); p.rect(x+2,G-24,30,3); if(!done){ p.F(M.paper[1]); p.rect(x+8,G-25,7,2); } }
    },
    pneus(p,x,G,t,done){
      const rows=done?2:3;
      for(let k=0;k<rows;k++){ const y=G-6-k*12, sx=(k===2?Math.round(Math.sin(t*12)*2*t):0);
        p.F(M.tire[1]); p.ell(x+20+sx,y,19,7); p.F(M.tire[2]); p.rect(x+3+sx,y,34,1.4); p.F(M.tire[0]); for(let j=0;j<6;j++) p.rect(x+6+sx+j*5,y-5,2,1); }
      p.F(M.inside[1]); p.ell(x+20,G-6-(rows-1)*12-2,9,3);
      if(done){ p.F(M.tire[1]); p.ell(x+52,G-4,12,5); p.F(M.inside[1]); p.ell(x+52,G-5,5,2); }
      p.F(M.rust[1]); p.rect(x+10,G-3,6,2);
    },
    caixote(p,x,G,t,done){
      p.F(M.wood[1]); p.rect(x,G-40,58,40);
      p.F(M.wood[2]); for(let k=1;k<4;k++) p.rect(x,G-40+k*10,58,1.4);
      p.F(M.metal[1]); [[0,0],[52,0],[0,34],[52,34]].forEach(([dx,dy])=>p.rect(x+dx,G-40+dy,6,6));
      p.F(M.yellow[1]); p.rect(x+12,G-26,4,8); p.rect(x+18,G-26,4,8); p.rect(x+24,G-22,4,4); p.rect(x+30,G-26,4,8); p.rect(x+38,G-26,8,2); p.rect(x+38,G-20,8,2);
      p.F(M.red[1]); p.rect(x+12,G-14,34,2);
      if(done){ p.F(M.inside[1]); p.rect(x+20,G-12,18,10); p.F(M.wood[1]); p.poly([[x+60,G-2],[x+76,G-6],[x+77,G-3],[x+61,G+1]]); }
      const a=done?1.5:t*1.2; p.xf(a,x+58,G-41); p.F(M.wood[0]); p.rect(-58,-3,58,5); p.F(M.metal[1]); p.rect(-58,-3,6,5); p.rect(-6,-3,6,5); p.id();
      if(a>0.2){ p.F(M.inside[1]); p.rect(x+2,G-42,54,3); if(!done){ p.F(M.straw[1]); p.rect(x+6,G-43,46,2); } }
    },
    carrinho(p,x,G,t,done){
      const sh=done?0:0;
      p.F(M.black[1]); p.circle(P2(x+8,G-3),3); p.circle(P2(x+38,G-3),3);
      p.F(M.chrome[2]); p.rect(x+6,G-10,36,2); p.cap(P2(x+8,G-8),P2(x+8,G-4),1.4,1.4); p.cap(P2(x+38,G-8),P2(x+38,G-4),1.4,1.4);
      if(!done){ p.F(M.leaf[1]); p.ell(x+16,G-36,7,5); p.F(M.food[1]); p.ell(x+30,G-35,5,4); p.F(M.bag[1]); p.ell(x+24,G-34,6,5); }
      p.F(M.chrome[1]); p.poly([[x+2,G-34],[x+46,G-34],[x+42,G-12],[x+6,G-12]]);
      p.F(M.inside[1]); p.poly([[x+5,G-31],[x+43,G-31],[x+40,G-15],[x+8,G-15]]);
      p.F(M.chrome[1]); for(let k=0;k<6;k++) p.rect(x+8+k*6,G-31,1.2,16); p.rect(x+6,G-24,36,1.2);
      p.F(M.red[1]); p.cap(P2(x+46,G-34),P2(x+52,G-42),2.4,2.4);
      p.F(M.rust[1]); p.rect(x+10,G-14,8,2);
    },
  };
  const cache=new Map();
  function frame(kind,state,fi=0,step=5){
    const K=PIX.getK(), key=kind+state+fi+step+'@'+K; if(cache.has(key)) return cache.get(key);
    const s=size(kind), G=s.FH-PADB, x0=PADX, shake=state==='vasculhando'?[0,1,-1,1][fi%4]:0;
    const t=state==='vasculhando'?(fi%4+1)/4:0, done=state==='vasculhado';
    const parts=[{draw:(c,u)=>{ const p=mkPen(c,u); p.id(); D[kind](p,x0+shake,G,t,done); p.id(); }}];
    const cv=compose({FW:Math.round(s.FW*K),FH:Math.round(s.FH*K),GROUND:G*K,parts,M,step,rim:RIM});
    cv._top=Math.round((G-KINDS[kind].h-6)*K); cv._cx=Math.round(s.FW/2*K);
    cache.set(key,cv); return cv;
  }
  const kinds={}; Object.entries(KINDS).forEach(([k,v])=>kinds[k]={nome:v.nome,areas:v.areas,loot:v.loot,tempo:v.tempo});
  return {KINDS:kinds, frame, ANCHOR, M};
})();
