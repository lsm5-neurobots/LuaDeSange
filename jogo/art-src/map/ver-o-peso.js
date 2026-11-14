/* VEROPESO — fonte de arte (editável). Build: npm run art
   Cenário da fase Ver-o-Peso (Belém, PA) no mesmo contrato do MAP/OLINDA: RS=2.5 → 960×540 px por tela,
   "mid" em tiles de 2048 px renderizados sob demanda (drawMid), céu/fundo em parallax (drawSky), primeiro plano (drawFG)
   e halos aditivos (drawLights, com brilho do rio e maré vermelha na Lua de Sangue). Coordenadas públicas em unidades lógicas 384×216.
   Primitivas, fachadas genéricas, chão e props são cópia local do kit de Olinda/Marco Zero (cada factory é isolada);
   o que é de Belém (casario de azulejo, feira, Mercado de Ferro, barcos, forte, Estação das Docas, porto) está em "VER-O-PESO". */
const VEROPESO=(function(){
const W=384, H=216, BASE=118, OUT='#170b1c', SC=3, RS=2.5;
const DEF=[
  {id:'relogio', name:'Praça do Relógio', short:'Relógio', len:768, floor:'portuguesa', back:'praca', fights:[14,18], chests:[], puzzle:null,
   ref:'Praça do Relógio · relógio de ferro · Baía do Guajará', desc:'Entrada da fase. O relógio de ferro parado no meio da praça, sobrados de azulejo dos dois lados e a balaustrada abrindo a vista da baía. Neblina baixa de rio e urubus no céu.',
   chao:'Pedra portuguesa e paralelepípedo', inim:'Errantes na praça · Corredor vindo do cais', bau:'Nenhum'},
  {id:'acai', name:'Feira do Açaí', short:'Feira', len:768, floor:'paralelo', back:'feira', fights:[18,22], chests:[[.5,'comum']], puzzle:null,
   ref:'Feira do Ver-o-Peso · barracas de açaí e frutas', desc:'O corredor de barracas sob as lonas brancas em bico: paneiros de açaí, cachos de banana, frutas e luzes penduradas. Barracas de lona azul, amarela e vermelha largadas na frente.',
   chao:'Paralelepípedo molhado', inim:'Errantes entre as barracas · Saltador nas lonas', bau:'Baú comum numa barraca'},
  {id:'ervas', name:'Feira das Ervas', short:'Ervas', len:768, floor:'paralelo', back:'feira', fights:[18,24], chests:[[.4,'médico']], puzzle:.8,
   ref:'Feira das ervas · banca de raízes e garrafadas', desc:'Bancas de ervas, raízes e garrafadas coloridas, maços de folhas secando pendurados. No fundo, a maior banca, do banho de cheiro, brilha esverdeada: é ali que a Erveira espera.',
   chao:'Paralelepípedo com folhas espalhadas', inim:'Mini boss: A Erveira na banca do banho de cheiro', bau:'Baú médico atrás da banca · puzzle de fio'},
  {id:'ferro', name:'Mercado de Ferro', short:'Mercado', len:768, floor:'granito', back:'ferro', fights:[20,26], chests:[[.55,'militar']], puzzle:.18,
   ref:'Mercado de Ferro do Ver-o-Peso (Mercado de Peixe)', desc:'O mercado de ferro azul com as quatro torres de flecha escamada, a arcada de janelas em leque e as portas de aço. Bancas de peixe no gelo na frente e, no fim, a doca com os barcos.',
   chao:'Lajes de granito úmidas', inim:'Barrigudo nas bancas · Gritador nas torres', bau:'Baú militar num box de peixe'},
  {id:'doca', name:'Doca do Ver-o-Peso', short:'Doca', len:768, floor:'molhe', back:'rio', fights:[18,24], chests:[[.5,'comum']], puzzle:null,
   ref:'Doca do Ver-o-Peso · barcos de madeira', desc:'A doca de pedra com os barcos regionais de casco colorido amarrados, as torres do mercado do outro lado da água, paneiros de açaí empilhados, redes e urubus no cais.',
   chao:'Cais de pedra molhado', inim:'Corredores pelo cais · Cuspidor nos barcos', bau:'Baú comum num barco'},
  {id:'barcos', name:'Barcos e Trapiches', short:'Trapiche', len:768, floor:'tabuas', back:'rio', fights:[18,22], chests:[[.6,'escondido']], puzzle:.2,
   ref:'Trapiche de madeira na Baía do Guajará', desc:'Passarela de tábuas sobre a água entre fileiras de barcos de dois conveses, lonas azuis, mastros e varas de pesca. A água bate nas estacas.',
   chao:'Tábuas de madeira sobre a água', inim:'Saltadores pulando dos barcos · Gritador no convés', bau:'Baú escondido sob o trapiche (faro do pet) · puzzle de símbolos'},
  {id:'presepio', name:'Forte do Presépio', short:'Forte', len:768, floor:'paralelo', back:'forte', fights:[18,22], chests:[[.45,'médico']], puzzle:null,
   ref:'Forte do Presépio · Casa das Onze Janelas', desc:'A Casa das Onze Janelas ao lado da muralha de pedra do forte, com guaritas, canhoneiras e canhões antigos; mangueiras enormes por trás. Cenário histórico.',
   chao:'Paralelepípedo e lajes', inim:'Estalador na muralha · Barrigudo no portão', bau:'Baú médico no pátio do forte'},
  {id:'docas', name:'Estação das Docas', short:'Docas', len:768, floor:'granito', back:'rio', fights:[20,26], chests:[[.55,'militar']], puzzle:.15,
   ref:'Estação das Docas · galpões de ferro e guindastes amarelos', desc:'Os três galpões de ferro com a marquise de colunas em Y, as janelas acesas, os guindastes amarelos restaurados e as palmeiras na beira da baía. Estreia do Blindado.',
   chao:'Lajes do cais com trilhos', inim:'Blindado escoltando Errantes', bau:'Baú militar num galpão'},
  {id:'armazem', name:'Armazéns do Porto', short:'Armazéns', len:768, floor:'granito', back:'armazens', fights:[20,26], chests:[[.5,'militar']], puzzle:.18,
   ref:'Boulevard Castilhos França · armazéns de tijolo', desc:'Armazéns de tijolo com portões de ferro de correr, empilhadeiras tombadas, caixotes e uma barricada de escudos de choque abandonada no meio da rua.',
   chao:'Concreto com trilhos', inim:'Dois Blindados na barricada · Estalador nos armazéns', bau:'Baú militar na barricada · puzzle de fio'},
  {id:'porto', name:'Porto dos Guindastes', short:'Porto', len:768, floor:'granito', back:'porto', fights:[20,26], chests:[[.7,'raro']], puzzle:null,
   ref:'Porto de Belém · guindastes e contêineres', desc:'O pátio do porto: guindastes de lança treliçada cor de ferrugem, pilhas de contêineres, caixotes e um navio parado na baía escura.',
   chao:'Concreto manchado e trilhos', inim:'Blindados entre os contêineres · Corredores', bau:'Baú raro num contêiner'},
  {id:'cais', name:'Cais do Guindaste', short:'Cais', len:640, floor:'molhe', back:'porto', fights:[95], chests:[], puzzle:null,
   ref:'Cais do porto · Baía do Guajará', desc:'Arena do chefe: o cais largo diante da Baía do Guajará, torres de luz, contêineres e o maior guindaste com o gancho pendurado sobre a arena. O Estivador trabalha no último turno.',
   chao:'Concreto do cais com trilhos', inim:'Chefe: O Estivador', bau:'Nenhum'},
];

let acc=0; const AREAS=DEF.map((d,i)=>{ const L=d.len*SC; const a=Object.assign({},d,{n:i+1,x0:acc,x1:acc+L,len:L,ulen:d.len}); acc+=L; return a; });
const WORLD=acc, AID=Object.fromEntries(AREAS.map(a=>[a.id,a]));

/* ---------- medidas em pixels de alta resolução ---------- */
const HW=Math.round(W*RS), HH=Math.round(H*RS), HB=Math.round(BASE*RS); // 960 · 540 · 295 (pé das fachadas)
const CURB=338, ST=350, HZ=232; // meio-fio · começo da rua · horizonte do mar

/* ---------- cor ---------- */
function hx(h){ const n=parseInt(h.slice(1),16); return [(n>>16)&255,(n>>8)&255,n&255]; }
function toHex(r,g,b){ return '#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join(''); }
function mix(a,b,t){ const A=hx(a),B=hx(b); return toHex(A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,A[2]+(B[2]-A[2])*t); }
const RC=new Map();
// rampa de 6 tons com hue shift: [0] brilho quente · [1] luz · [2] base · [3] meia-sombra · [4] sombra roxa · [5] fundo
function rmp(h){ let r=RC.get(h); if(!r){ r=[mix(h,'#fff0c4',.55),mix(h,'#ffdc9c',.24),h,mix(h,'#3e2e86',.3),mix(h,'#221766',.54),mix(h,'#100828',.74)]; RC.set(h,r); } return r; }
function hsh(n){ n=Math.sin(n*127.1+311.7)*43758.5453; return n-Math.floor(n); }
const pick=(arr,v)=>arr[Math.floor(v*arr.length)%arr.length];

/* ---------- primitivas (pixels inteiros) ---------- */
function mk(w,h){ const c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d'); g.imageSmoothingEnabled=false; return [c,g]; }
function R(g,x,y,w,h,c){ if(w<=0||h<=0) return; g.fillStyle=c; const X=Math.round(x), Y=Math.round(y); g.fillRect(X,Y,Math.max(1,Math.round(x+w)-X),Math.max(1,Math.round(y+h)-Y)); }
function ell(g,cx,cy,rx,ry,c){ g.fillStyle=c; const RY=Math.max(1,Math.round(ry)); for(let dy=-RY;dy<=RY;dy++){ const hw=Math.round(rx*Math.sqrt(Math.max(0,1-(dy/(RY+.5))**2))); if(hw>0) g.fillRect(Math.round(cx-hw),Math.round(cy+dy),hw*2,1); } }
function poly(g,P,c){ g.fillStyle=c; let y0=1e9,y1=-1e9; for(const p of P){ if(p[1]<y0) y0=p[1]; if(p[1]>y1) y1=p[1]; }
  for(let y=Math.floor(y0);y<Math.ceil(y1);y++){ const yc=y+.5, xs=[]; for(let i=0;i<P.length;i++){ const a=P[i], b=P[(i+1)%P.length]; if((a[1]<=yc&&b[1]>yc)||(b[1]<=yc&&a[1]>yc)) xs.push(a[0]+(yc-a[1])/(b[1]-a[1])*(b[0]-a[0])); }
    xs.sort((p,q)=>p-q); for(let i=0;i+1<xs.length;i+=2){ const xa=Math.round(xs[i]), xb=Math.round(xs[i+1]); if(xb>xa) g.fillRect(xa,y,xb-xa,1); } } }
function archF(g,x,y,w,h,c){ const r=w/2; for(let dy=0;dy<Math.min(r,h);dy++){ const hw=Math.round(Math.sqrt(Math.max(0,r*r-(r-dy-.5)**2))); R(g,x+r-hw,y+dy,hw*2,1,c); } if(h>r) R(g,x,y+r,w,h-r,c); }
function line(g,x0,y0,x1,y1,c,t=1){ const n=Math.max(1,Math.ceil(Math.max(Math.abs(x1-x0),Math.abs(y1-y0)))); g.fillStyle=c; for(let i=0;i<=n;i++) g.fillRect(Math.round(x0+(x1-x0)*i/n),Math.round(y0+(y1-y0)*i/n),t,t); }
function sag(g,x0,y0,x1,y1,s,c,t=1,cb){ const n=Math.max(1,Math.ceil(Math.abs(x1-x0))); g.fillStyle=c; let py=null;
  for(let i=0;i<=n;i++){ const u=i/n, x=Math.round(x0+(x1-x0)*u), y=Math.round(y0+(y1-y0)*u+Math.sin(u*Math.PI)*s); g.fillStyle=c; if(py!==null&&Math.abs(y-py)>1) g.fillRect(x,Math.min(y,py),t,Math.abs(y-py)); g.fillRect(x,y,t,t); py=y; if(cb) cb(x,y,i); } }
function blob(g,x,y,w,h,c){ const k=Math.max(1,Math.min(4,Math.floor(Math.min(w,h)/4))); R(g,x+k,y,w-2*k,h,c); R(g,x,y+k,w,h-2*k,c); R(g,x+k/2,y+k/2,w-k,h-k,c); }
let LQ=null; // fila de luz do tile: emissivos e halos são desenhados depois da gradação noturna
function emit(g,fn){ if(LQ) LQ.push([0,fn]); else fn(g); }
function emitW(g,fn){ if(RL!=='dia') emit(g,fn); } // luz de janela/poste/reflexo: apagada de dia
function glow(g,cx,cy,r,col,a,steps,ry){ if(LQ){ LQ.push([1,G=>glowNow(G,cx,cy,r,col,a,steps,ry)]); return; } glowNow(g,cx,cy,r,col,a,steps,ry); }
function glowNow(g,cx,cy,r,col,a,steps,ry){ g.save(); g.globalCompositeOperation='lighter'; g.globalAlpha=a; for(let i=0;i<steps;i++){ const f=1-i/steps; ell(g,cx,cy,r*f,(ry||r)*f,col); } g.restore(); }
function shade(g,x,y,w,h,c,a){ g.save(); g.globalAlpha=a; R(g,x,y,w,h,c); g.restore(); }

/* ---------- fonte 5×7 pra placas ---------- */
const FONT={A:[14,17,17,31,17,17,17],B:[30,17,17,30,17,17,30],C:[14,17,16,16,16,17,14],D:[30,17,17,17,17,17,30],E:[31,16,16,30,16,16,31],F:[31,16,16,30,16,16,16],G:[14,17,16,23,17,17,15],H:[17,17,17,31,17,17,17],I:[14,4,4,4,4,4,14],J:[7,2,2,2,2,18,12],K:[17,18,20,24,20,18,17],L:[16,16,16,16,16,16,31],M:[17,27,21,21,17,17,17],N:[17,17,25,21,19,17,17],O:[14,17,17,17,17,17,14],P:[30,17,17,30,16,16,16],Q:[14,17,17,17,21,18,13],R:[30,17,17,30,20,18,17],S:[15,16,16,14,1,1,30],T:[31,4,4,4,4,4,4],U:[17,17,17,17,17,17,14],V:[17,17,17,17,17,10,4],W:[17,17,17,21,21,21,10],X:[17,17,10,4,10,17,17],Y:[17,17,17,10,4,4,4],Z:[31,1,2,4,8,16,31],
  '0':[14,17,19,21,25,17,14],'1':[4,12,4,4,4,4,14],'2':[14,17,1,2,4,8,31],'3':[31,2,4,2,1,17,14],'4':[2,6,10,18,31,2,2],'5':[31,16,30,1,1,17,14],'6':[6,8,16,30,17,17,14],'7':[31,1,2,4,8,8,8],'8':[14,17,17,14,17,17,14],'9':[14,17,17,15,1,2,12],'.':[0,0,0,0,0,12,12],'-':[0,0,0,31,0,0,0],'!':[4,4,4,4,4,0,4],"'":[4,4,0,0,0,0,0],'/':[1,1,2,4,8,16,16],'&':[12,18,20,8,21,18,13],' ':[0,0,0,0,0,0,0]};
const norm=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase();
function text(g,str,x,y,s,c){ str=norm(str); let cx=x; g.fillStyle=c; for(const ch of str){ const G=FONT[ch]||FONT[' ']; for(let r=0;r<7;r++){ const row=G[r]; for(let b=0;b<5;b++) if(row&(16>>b)) g.fillRect(cx+b*s,y+r*s,s,s); } cx+=6*s; } return cx-x-s; }
const tw=(str,s)=>norm(str).length*6*s-s;
function textSh(g,str,x,y,s,c,sh){ text(g,str,x+Math.max(1,s>>1),y+Math.max(1,s>>1),s,sh); text(g,str,x,y,s,c); }

/* ---------- paleta ---------- */
const IRON=rmp('#463d5e'), FR=rmp('#eee6d2'), METAL=rmp('#868898'), TERRA=rmp('#bc5c3c'), WOODR=rmp('#7e4c30');
const GLASS=['#8890cc','#555a98','#30346a','#1b1d42'];
const CASA=['#f4b628','#3a8ee6','#f0608e','#e6582a','#26c2a0','#f6dc92','#9a6ce8','#fa8a26','#54ca52','#e6363e','#f8ca3e','#36c2e6'];
const BJ=['#f07aa0','#5ab4f2','#f6d04a','#f2eee2','#ea5e3a','#6ad0b0','#f4a6c0','#a8d4f4','#f8e28a','#e2463e','#b6e07a','#fa9a4a'];
const SHUT=['#3f8a68','#2f6aa8','#8a3a3a','#5a4a8a','#2a7a7a','#9a6a2a','#3a5a3a'];
const LOJAS=['ARMARINHO','SEBO','CAFE','FARMACIA','PADARIA','LANCHES','BRECHO','ATELIE','OTICA','TABACARIA','RELOJOARIA','ARTESANATO','PENSAO','CONSERTOS','MERCEARIA','ESTIVA','LIVROS','DISCOS','BAZAR','SAPATARIA'];
const BARES=['BAR','BOTECO','CHOPP','FORRO','SAMBA','PETISCOS','CERVEJA','BAR DA ESQUINA','BAR DO FREVO','CALDINHO','ESPETINHO','TIRA-GOSTO'];

/* ---------- listas públicas ---------- */
const WINDOWS=[], LAMPS=[], BULBS=[], FGI=[], NEON=[];
let collecting=false; const reg=(arr,o)=>{ if(collecting) arr.push(o); };
const pushWin=(x,y,w,h)=>reg(WINDOWS,{x:x/RS,y:y/RS,w:w/RS,h:h/RS,lit:true,warm:true});

/* ---------- lista de desenho do mid (pixels de alta resolução, coordenadas do mundo) ---------- */
const DL=[]; let DLs=null;
function add(x0,x1,z,f){ DL.push({x0:Math.floor(x0),x1:Math.ceil(x1),z,f,i:DL.length}); }

/* =====================================================================
   FACHADAS
   ===================================================================== */
function cornice(g,x,y,w,c,big){ // y = linha de baixo da cornija
  if(big){ R(g,x-3,y-12,w+6,4,c[1]); R(g,x-3,y-12,w+6,1,c[0]); R(g,x-3,y-8,w+6,1,c[3]); }
  R(g,x,y-7,w,3,c[1]); R(g,x,y-7,w,1,c[0]); R(g,x+1,y-4,w-2,2,c[2]); for(let k=x+3;k<x+w-3;k+=6) R(g,k,y-4,3,2,c[3]);
  R(g,x+1,y-2,w-2,2,c[3]); R(g,x+2,y,w-4,3,c[4]); R(g,x+3,y+3,w-6,1,c[3]); shade(g,x+2,y+4,w-4,8,'#100624',.2);
}
function streak(g,x,y,len,wd,c){ R(g,x,y,wd,len,c); R(g,x+1,y+len,Math.max(1,wd-2),Math.round(len*.45),c); if(wd>2) R(g,x+wd/2,y+len*1.45,1,Math.round(len*.3),c); }
function crack(g,x,y,len,c,s){ let cx=x, cy=y; for(let k=0;k<len;k++){ R(g,cx,cy,1,2,c); cy+=2; cx+=hsh(s+k*1.3)>.5?1:-1; if(k===Math.floor(len/2)&&hsh(s*7)>.4){ let bx=cx, by=cy; for(let j=0;j<len/3;j++){ R(g,bx,by,1,1,c); bx+=1; by+=hsh(s+j)>.4?1:0; } } } }
function brick(g,x,y,w,h,s,c0){ const b=rmp(c0||'#a2583e'); blob(g,x-2,y-2,w+4,h+4,b[4]); R(g,x,y,w,h,b[3]);
  for(let yy=0;yy<h;yy+=5){ const off=(yy/5)%2?6:0; for(let xx=-off;xx<w;xx+=12){ const v=hsh(s+xx*.3+yy*1.7); R(g,x+Math.max(0,xx)+1,y+yy+1,Math.min(10,w-Math.max(0,xx)-1-(xx<0?-xx:0)),3,v>.6?b[1]:b[2]); } }
}
function peel(g,x,y,w,h,c,s){ blob(g,x-2,y-2,w+4,h+4,c[1]); brick(g,x,y,w,h,s); R(g,x-1,y+h+1,w,1,c[4]); }
function poster(g,x,y,s){ const cols=['#e8d8b8','#f2c84a','#e86a5a','#6ab0e8','#f0f0e0','#e88ac0']; const c=pick(cols,hsh(s)), w=16+Math.round(hsh(s*2)*10), h=22+Math.round(hsh(s*3)*10);
  R(g,x+1,y+1,w,h,'#2a2030'); R(g,x,y,w,h,c); R(g,x,y,w,2,mix(c,'#ffffff',.4)); R(g,x+2,y+4,w-4,4,mix(c,'#2a1830',.6)); for(let k=0;k<3;k++) R(g,x+2,y+11+k*4,w-4-(k*3)%7,2,mix(c,'#2a1830',.4));
  if(hsh(s*5)>.4) poly(g,[[x+w,y+h],[x+w-7,y+h],[x+w,y+h-8]],'#1e1628'); }
function pixo(g,x,y,s,c){ // pichação: letras altas e angulosas
  const n=3+Math.floor(hsh(s)*5); let cx=x; for(let k=0;k<n;k++){ const h=12+Math.floor(hsh(s+k)*12), t=Math.floor(hsh(s*3.7+k*1.3)*4);
    R(g,cx,y-h,2,h,c); if(t===0){ R(g,cx,y-h,8,2,c); R(g,cx+6,y-h,2,h,c); } else if(t===1){ line(g,cx,y-h,cx+7,y-h/2,c,2); line(g,cx+7,y-h/2,cx,y,c,2); } else if(t===2){ R(g,cx,y-2,8,2,c); R(g,cx+6,y-h,2,h,c); R(g,cx,y-h/2,8,2,c); } else { line(g,cx,y-h,cx+8,y,c,2); R(g,cx+6,y-h,2,h,c); }
    cx+=11; } R(g,x-2,y+3,cx-x,2,c); }
function tag(g,x,y,s){ // pichação/recado de sobrevivente com tinta escorrida
  const words=['FUJA!','SOS','NAO ENTRE','OLINDA VIVE','FREVO','PE','TEM GENTE','SOCORRO','LUA DE SANGUE','ABRIGO >'], w0=pick(words,hsh(s)), col=pick(['#d8283a','#e8e0d0','#ffd23f','#3ad8c8','#ff5a9a'],hsh(s*3)), sc=hsh(s*5)>.6?3:2;
  const ww=tw(w0,sc); if(hsh(s*7)>.5){ blob(g,x-4,y-4,ww+8,7*sc+8,'#140a1e'); }
  text(g,w0,x+1,y+1,sc,'#140a1e'); text(g,w0,x,y,sc,col);
  for(let k=0;k<ww;k+=sc*3) if(hsh(s+k)>.55) R(g,x+k+hsh(k)*sc*4,y+7*sc,Math.max(1,sc-1),4+hsh(s*k)*12,col); }
function arUnit(g,x,y,c){ R(g,x-1,y-1,30,20,'#20182c'); R(g,x,y,28,18,METAL[1]); R(g,x,y,28,2,METAL[0]); R(g,x+26,y,2,18,METAL[3]); for(let k=y+4;k<y+16;k+=3) R(g,x+3,k,15,1,METAL[3]); ell(g,x+22,y+9,4,4,METAL[3]); R(g,x+2,y+18,24,3,'#2a2236'); streak(g,x+12,y+21,22,2,c[3]); }
function arandela(g,x,y,lit){ // luminária de parede colonial
  R(g,x-1,y,2,10,IRON[4]); R(g,x-1,y+2,12,2,IRON[3]); R(g,x+9,y+4,2,4,IRON[4]);
  R(g,x+4,y+8,12,3,IRON[2]); R(g,x+5,y+11,10,14,IRON[4]); R(g,x+6,y+12,8,12,'#3a3450'); if(lit) emitW(g,g=>{ R(g,x+6,y+12,8,12,'#ffe6a0'); R(g,x+7,y+13,3,10,'#fff6d8'); }); R(g,x+5,y+25,10,3,IRON[2]); R(g,x+8,y+5,4,3,IRON[3]);
  if(lit){ glow(g,x+10,y+18,46,'#ffb860',.07,5); reg(LAMPS,{x:(x+10)/RS,y:(y+18)/RS,r:16,mid:true}); } }
function planta(g,x,y,s){ const c=rmp('#4a8a44'); for(let k=0;k<5;k++){ const a=-2.6+k*.55+hsh(s+k)*.3, L=5+hsh(s*2+k)*6; line(g,x,y,x+Math.cos(a)*L,y+Math.sin(a)*L,k%2?c[2]:c[1],2); } R(g,x-2,y,5,2,c[3]); }
function placaNum(g,x,y,n){ R(g,x-1,y-1,16,12,'#1a1a3a'); R(g,x,y,14,10,'#2a5ab0'); R(g,x,y,14,1,'#6a9ae8'); text(g,String(n),x+2,y+2,1,'#f0f0ff'); }

function placa(g,x,y,str,bg,fg,s=2){ const w=tw(str,s)+12, h=7*s+10; R(g,x-1,y-1,w+2,h+2,'#1a1022'); const b=rmp(bg); R(g,x,y,w,h,b[2]); R(g,x,y,w,2,b[1]); R(g,x,y+h-2,w,2,b[4]); R(g,x+w-2,y,2,h,b[3]);
  textSh(g,str,x+6,y+5,s,fg,b[4]); R(g,x+4,y-6,1,6,IRON[4]); R(g,x+w-5,y-6,1,6,IRON[4]); return w; }
function neon(g,x,y,str,col,s=2){ const w=tw(str,s)+14, h=7*s+12; R(g,x-1,y-1,w+2,h+2,'#0e0816'); R(g,x,y,w,h,'#1c1226'); R(g,x,y,w,1,'#3a2c4a');
  glow(g,x+w/2,y+h/2,w*.75,col,.08,4,h*1.4); emit(g,g=>{ text(g,str,x+7,y+6+s,s,col); text(g,str,x+7,y+6,s,mix(col,'#ffffff',.7)); });
  reg(NEON,{x:(x+w/2)/RS,y:(y+h/2)/RS,w:w/RS,c:col}); return w; }

function janela(g,x,y,w,h,o){ // y = topo do vão retangular
  const fr=o.fr||FR, sh=o.sh, s=o.s, c=o.c, st=RL==='dia'&&o.st==='acesa'?'vidro':o.st; // de dia a janela acesa vira vidro
  if(o.arch){ const r=w/2+5; for(let dy=0;dy<r;dy++){ const hw=Math.round(Math.sqrt(Math.max(0,r*r-(r-dy-.5)**2))); R(g,x+w/2-hw-1,y-r+dy,hw*2+2,1,c[4]); R(g,x+w/2-hw,y-r+dy+1,hw*2,1,dy<3?fr[0]:fr[2]); }
    R(g,x+w/2-3,y-r-3,6,7,fr[1]); R(g,x+w/2-3,y-r-3,6,1,fr[0]); R(g,x+w/2+2,y-r-2,1,6,fr[3]); }
  else { R(g,x-9,y-13,w+18,7,fr[1]); R(g,x-9,y-13,w+18,2,fr[0]); R(g,x-8,y-6,w+16,2,c[4]); R(g,x-9,y-15,w+18,2,fr[2]); }
  R(g,x-5,y-5,w+10,h+8,c[4]); R(g,x-4,y-5,w+8,h+7,fr[2]); R(g,x-4,y-5,w+8,2,fr[0]); R(g,x-4,y-5,2,h+7,fr[1]); R(g,x+w+2,y-3,2,h+5,fr[3]); R(g,x-2,y-3,w+4,1,fr[3]);
  if(o.arch){ const r2=w/2; for(let dy=0;dy<r2;dy++){ const hw=Math.round(Math.sqrt(Math.max(0,r2*r2-(r2-dy-.5)**2))); R(g,x+w/2-hw,y-r2+dy,hw*2,1,st==='acesa'?'#e8a050':GLASS[3]); }
    for(let k=1;k<4;k++){ const a=Math.PI*k/4; line(g,x+w/2,y,x+w/2-Math.cos(a)*r2*.95,y-Math.sin(a)*r2*.95,fr[2]); } R(g,x,y-1,w,2,fr[2]); }
  if(st==='acesa'){ emitW(g,g=>{ R(g,x,y,w,h,'#b8683a'); R(g,x+1,y+1,w-2,h-4,'#e0904c'); R(g,x+3,y+3,w-6,Math.round(h*.5),'#f4b866'); R(g,x+5,y+5,w-10,Math.round(h*.25),'#ffd890');
    const cu=rmp(o.cur||pick(['#b8405a','#c89a3a','#5a7ab8','#8a4ab0'],hsh(s*7))); R(g,x,y,6,h,cu[2]); R(g,x+w-6,y,6,h,cu[3]); R(g,x+2,y+2,1,h-2,cu[3]); R(g,x+4,y+4,1,h-4,cu[1]); R(g,x+w-3,y+2,1,h-2,cu[4]); R(g,x,y,w,4,cu[3]); R(g,x,y,w,1,cu[1]);
    if(hsh(s*11)>.5){ R(g,x+w/2-5,y+h-14,10,14,'#5a2c1c'); R(g,x+w/2-3,y+h-20,6,7,'#5a2c1c'); }
    R(g,x+w/2-1,y,2,h,'#5a2c1c'); R(g,x+6,y+Math.round(h*.4),w-12,2,'#5a2c1c'); }); pushWin(x+1,y+1,w-2,h-2); glow(g,x+w/2,y+h/2,w*1.3,'#ffb060',.035,3,h*.9); }
  else if(st==='fechada'){ R(g,x,y,w,h,sh[2]); for(let yy=y+3;yy<y+h-2;yy+=3){ R(g,x+3,yy,w/2-4,1,sh[4]); R(g,x+w/2+1,yy,w/2-4,1,sh[4]); R(g,x+3,yy+1,w/2-4,1,sh[1]); R(g,x+w/2+1,yy+1,w/2-4,1,sh[1]); }
    R(g,x,y,w,2,sh[1]); R(g,x,y,2,h,sh[1]); R(g,x+w/2-1,y,2,h,sh[4]); R(g,x+w-2,y,2,h,sh[3]); R(g,x,y+h-2,w,2,sh[4]); R(g,x+w/2-4,y+h/2,2,4,'#d8c070');
    if(hsh(s*3.3)>.55) blob(g,x+3+hsh(s)*(w-12),y+5+hsh(s*2)*(h-18),7,10,mix(sh[2],'#9a7a5a',.6)); }
  else if(st==='escura'){ R(g,x,y,w,h,'#1a1230'); R(g,x+4,y+h-16,w-8,14,'#241a3a'); R(g,x+4,y+h-16,w-8,1,'#30264a'); R(g,x+3,y+3,w-6,2,'#281e40');
    R(g,x,y,5,h,sh[3]); R(g,x,y,1,h,sh[1]); R(g,x+w-5,y,5,h,sh[4]); R(g,x+1,y+4,3,h-8,GLASS[2]); R(g,x+1,y+4,1,h/3,GLASS[1]); }
  else if(st==='tabuas'){ R(g,x,y,w,h,'#140c1e'); const wd=rmp('#8e6848'); for(let k=0;k<4;k++){ const py=y+3+k*(h-6)/4, d=k%2?5:-5;
      poly(g,[[x-3,py],[x+w+3,py+d],[x+w+3,py+d+8],[x-3,py+8]],wd[4]); poly(g,[[x-3,py],[x+w+3,py+d],[x+w+3,py+d+7],[x-3,py+7]],k%2?wd[2]:wd[1]); line(g,x-3,py,x+w+3,py+d,wd[0]); R(g,x+1,py+3,2,2,'#2a2234'); R(g,x+w-3,py+3+d,2,2,'#2a2234'); } }
  else { R(g,x,y,w,h,GLASS[2]); poly(g,[[x,y+h*.55],[x+w*.7,y],[x+w,y],[x+w,y+h*.12],[x,y+h*.85]],GLASS[1]); R(g,x+2,y+2,2,Math.round(h*.35),GLASS[0]); R(g,x,y+h-6,w,6,GLASS[3]);
    R(g,x+w/2-1,y,2,h,fr[2]); R(g,x,y+Math.round(h/2)-1,w,2,fr[2]); R(g,x,y+Math.round(h/4),w,1,fr[3]); R(g,x,y+Math.round(3*h/4),w,1,fr[3]);
    if(st==='quebrada'){ const cx=x+w*(.3+hsh(s)*.4), cy=y+h*(.3+hsh(s*2)*.3); poly(g,[[cx-6,cy-4],[cx-1,cy-10],[cx+3,cy-3],[cx+8,cy-6],[cx+4,cy+2],[cx+7,cy+9],[cx,cy+5],[cx-5,cy+10],[cx-3,cy+2],[cx-9,cy+1]],'#0c0616');
      line(g,cx+8,cy-6,x+w-1,cy-12,GLASS[0]); line(g,cx-5,cy+10,x+1,y+h-2,GLASS[0]); line(g,cx-9,cy+1,x+1,cy-4,GLASS[0]); } }
  if(st!=='acesa'){ shade(g,x,y,w,5,'#0a0418',.55); shade(g,x,y,4,h,'#0a0418',.45); } else emitW(g,g=>{ shade(g,x,y,w,4,'#3a1408',.5); shade(g,x,y,3,h,'#3a1408',.35); });
  R(g,x-8,y+h+2,w+16,4,fr[1]); R(g,x-8,y+h+2,w+16,1,fr[0]); R(g,x-7,y+h+6,w+14,2,c[4]); R(g,x-5,y+h+8,w+10,1,c[3]); shade(g,x-7,y+h+8,w+14,6,'#100624',.22);
  if(st==='acesa') glow(g,x+w/2,y+h+14,w*1.5,'#ff9a3a',.035,3,22);
  if(hsh(s*5.7)>.45) streak(g,x+2+Math.round(hsh(s*9)*(w-6)),y+h+8,10+Math.round(hsh(s*4)*18),3,c[3]);
}
function sacada(g,x,y,w,c){ // y = topo da laje
  const ir=IRON; R(g,x-3,y,w+6,5,FR[1]); R(g,x-3,y,w+6,1,FR[0]); R(g,x-3,y+5,w+6,1,FR[3]); R(g,x,y+6,w,4,c[4]);
  for(const bx of [x+3,x+w-8]){ R(g,bx,y+6,5,7,FR[2]); R(g,bx+1,y+13,3,2,FR[3]); R(g,bx,y+6,1,7,FR[1]); }
  const ry=y-20; shade(g,x,ry+3,w,17,'#120a20',.25);
  R(g,x-1,ry,w+2,3,ir[1]); R(g,x-1,ry,w+2,1,ir[0]); R(g,x,y-3,w,2,ir[2]);
  shade(g,x-3,y+10,w+6,12,'#100624',.5); shade(g,x,y+22,w,10,'#100624',.25);
  for(let bx=x+1;bx<x+w;bx+=4) R(g,bx,ry+3,1,14,ir[3]);
  for(let bx=x+6;bx<x+w-6;bx+=12){ R(g,bx-3,ry+6,7,1,ir[2]); R(g,bx-3,ry+13,7,1,ir[2]); R(g,bx-3,ry+6,1,8,ir[2]); R(g,bx+3,ry+6,1,8,ir[2]); R(g,bx,ry+9,1,2,ir[1]); }
}
function porta(g,x,y,w,h,o){ // y = topo do vão retangular, base = y+h
  const c=o.c, kind=o.kind, s=o.s;
  R(g,x-7,y-7,w+14,h+7,c[4]); R(g,x-6,y-6,w+12,h+6,FR[2]); R(g,x-6,y-6,w+12,2,FR[0]); R(g,x-6,y-6,2,h+6,FR[1]); R(g,x+w+3,y-4,3,h+4,FR[3]);
  if(kind==='aco'){ const m=rmp(o.metal||'#7c7e90'), open=hsh(s*3)>.6?Math.round(h*(.45+hsh(s)*.3)):h;
    R(g,x,y,w,h,'#120a1c'); if(open<h){ R(g,x+2,y+open,w-4,h-open,'#1e1630'); R(g,x+4,y+open+4,w-8,3,'#2a2040'); }
    R(g,x,y,w,open,m[2]); for(let yy=y+2;yy<y+open-2;yy+=4){ R(g,x,yy,w,1,m[4]); R(g,x,yy+1,w,1,m[1]); } R(g,x,y+open-4,w,4,m[3]); R(g,x,y+open-4,w,1,m[0]);
    R(g,x+w/2-3,y+open-9,6,4,m[4]); R(g,x,y,w,4,m[3]); R(g,x,y,2,open,m[1]); R(g,x+w-2,y,2,open,m[4]);
    if(hsh(s*7)>.4){ blob(g,x+4+hsh(s*2)*(w-20),y+8+hsh(s*5)*(open-30),12,9,m[3]); R(g,x+6+hsh(s*2)*(w-20),y+10+hsh(s*5)*(open-30),6,2,m[4]); }
    if(hsh(s*13)>.35) pixo(g,x+4,y+Math.min(open-6,h*.55),s,pick(['#1a1020','#e83a5a','#ffffff'],hsh(s*17)));
    for(let k=0;k<3;k++) if(hsh(s+k*5)>.5) streak(g,x+5+k*(w/3),y+3,8+hsh(s*k)*20,2,mix(m[3],'#8a4a2a',.6)); }
  else if(kind==='aberta'){ R(g,x,y,w,h,'#140c22'); R(g,x+5,y+8,w-10,h-8,'#1c1430'); R(g,x+5,y+h-16,w-10,16,'#261c3a');
    const wd=rmp(o.wood||'#7e4c30'); R(g,x,y,7,h,wd[2]); R(g,x,y,1,h,wd[0]); R(g,x+w-7,y,7,h,wd[4]); R(g,x+2,y+8,3,h/3,wd[1]); }
  else { const wd=rmp(o.wood||pick(['#7e4c30','#5e3a2a','#3a6a5a','#3a4a7a','#8a3a2e'],hsh(s*3))); R(g,x,y,w,h,wd[2]);
    const lw=w/2; for(let l=0;l<2;l++){ const lx=x+l*lw; for(let k=0;k<3;k++){ const ph=(h-12)/3, py=y+4+k*(ph+2); R(g,lx+4,py,lw-8,ph,wd[3]); R(g,lx+5,py+1,lw-10,ph-2,wd[1]); R(g,lx+7,py+3,lw-14,ph-6,wd[2]); R(g,lx+5,py+ph-2,lw-10,1,wd[4]); } }
    R(g,x+w/2-1,y,2,h,wd[5]); R(g,x+w/2-6,y+h/2,3,4,'#e8c860'); R(g,x+w/2+3,y+h/2,3,4,'#e8c860'); R(g,x,y,w,2,wd[4]); R(g,x,y+h-6,w,6,wd[3]); R(g,x,y+h-2,w,2,wd[5]);
    if(hsh(s*9)>.6) streak(g,x+w*.3,y+h*.3,14,4,'#5a0e18'); }
  if(o.transom!==false){ const r=w/2; for(let dy=0;dy<r;dy++){ const hw=Math.round(Math.sqrt(Math.max(0,(r+6)**2-(r+6-dy-.5)**2))); R(g,x+r-hw,y-r-6+dy,hw*2,1,FR[dy<2?0:2]); }
    for(let dy=0;dy<r;dy++){ const hw=Math.round(Math.sqrt(Math.max(0,r*r-(r-dy-.5)**2))); R(g,x+r-hw,y-r+dy,hw*2,1,GLASS[3]); }
    for(let k=0;k<=6;k++){ const a=Math.PI*k/6; line(g,x+r,y-1,x+r-Math.cos(a)*r*.9,y-1-Math.sin(a)*r*.9,FR[3]); } ell(g,x+r,y-1,5,3,FR[2]); R(g,x,y-2,w,3,FR[1]); }
}
function azulejo(g,x,y,w,h,t,s){ const a=rmp(t[0]), b=rmp(t[1]), T=8; R(g,x,y,w,h,a[2]);
  for(let yy=y;yy<y+h;yy+=T) for(let xx=x;xx<x+w;xx+=T){ const v=hsh(xx*.71+yy*1.37+s);
    if(v>.975){ R(g,xx,yy,T,T,'#a8a096'); R(g,xx+1,yy+1,T-2,1,'#8a8278'); continue; }
    R(g,xx,yy,T,1,a[3]); R(g,xx,yy,1,T,a[3]); R(g,xx+3,yy+2,2,4,b[2]); R(g,xx+2,yy+3,4,2,b[2]); R(g,xx+3,yy+3,2,2,a[0]); R(g,xx+1,yy+1,1,1,b[3]); R(g,xx+6,yy+6,1,1,b[3]); if(v<.2) R(g,xx+1,yy+1,3,1,a[0]); } }

function platibanda(g,x,top,w,pH,c,o){
  const yb=top+pH; R(g,x-2,top,w+4,pH,c[2]);
  if(o.par==='balaustre'){ for(let bx=x+6;bx<x+w-6;bx+=9){ R(g,bx,top+7,5,pH-12,c[4]); R(g,bx,top+7,4,pH-12,c[1]); R(g,bx+1,top+12,2,4,c[3]); R(g,bx,top+7,1,pH-12,c[0]); } R(g,x,top+5,w,2,c[3]); }
  else { const np=Math.max(2,Math.round(w/64)), pw=(w-12)/np; for(let k=0;k<np;k++){ const px=x+6+k*pw; R(g,px+3,top+8,pw-6,pH-16,c[3]); R(g,px+4,top+9,pw-8,pH-18,c[2]); R(g,px+4,top+pH-10,pw-8,1,c[1]); R(g,px+pw-5,top+9,1,pH-18,c[1]); }
    for(let k=0;k<=np;k++){ const px=x+3+k*pw; R(g,px,top+4,6,pH-4,c[1]); R(g,px,top+4,1,pH-4,c[0]); R(g,px+5,top+4,1,pH-4,c[3]); } }
  R(g,x-3,top,w+6,5,c[1]); R(g,x-3,top,w+6,1,c[0]); R(g,x-3,top+5,w+6,1,c[4]);
  if(o.par==='curva'){ const cw=Math.min(w*.5,124), cx=x+w/2, hh=26; const P=[]; for(let i=0;i<=24;i++){ const t=i/24, px=cx-cw/2+cw*t, k=Math.sin(t*Math.PI); P.push([px,top-hh*Math.pow(k,.7)]); } P.push([cx+cw/2,top+2],[cx-cw/2,top+2]);
    poly(g,P.map(p=>[p[0]+(p[0]<cx?-2:2),p[1]-2]),c[4]); poly(g,P,c[2]); for(let i=0;i<24;i++) R(g,P[i][0],P[i][1],cw/24+1,2,c[0]);
    ell(g,cx,top-9,10,8,c[4]); ell(g,cx,top-9,9,7,c[1]); text(g,String(1820+Math.floor(hsh(o.s)*90)),cx-11,top-12,1,c[4]);
    for(const sx of [-1,1]){ ell(g,cx+sx*(cw/2+2),top-4,5,5,c[4]); ell(g,cx+sx*(cw/2+2),top-4,4,4,c[1]); R(g,cx+sx*(cw/2+2)-1,top-5,2,2,c[3]); } }
  if(o.par==='escalonada'){ R(g,x+w/2-40,top-14,80,15,c[2]); R(g,x+w/2-42,top-16,84,4,c[1]); R(g,x+w/2-42,top-16,84,1,c[0]); R(g,x+w/2-20,top-28,40,13,c[2]); R(g,x+w/2-22,top-30,44,4,c[1]); R(g,x+w/2-22,top-30,44,1,c[0]); }
  if(o.pinhas){ for(const px of [x+2,x+w-8]){ R(g,px+2,top-8,4,8,c[3]); ell(g,px+4,top-12,5,6,c[1]); R(g,px+3,top-17,2,4,c[1]); R(g,px+5,top-13,2,5,c[3]); } }
  cornice(g,x-4,yb,w+8,c,true); shade(g,x,yb+4,w,12,'#100624',.3); shade(g,x,yb+16,w,10,'#100624',.14);
  if(hsh(o.s*31)>.6) planta(g,x+10+hsh(o.s*5)*(w-20),top,o.s);
}
function beiral(g,x,y,w,c){ // telhado de telha canal com beiral
  const t=TERRA; R(g,x-10,y-36,w+20,36,t[4]);
  for(let yy=y-36,r=0;yy<y-4;yy+=6,r++){ for(let xx=x-10+(r%2)*4;xx<x+w+10;xx+=8){ R(g,xx,yy,7,6,t[3]); R(g,xx+1,yy,5,5,hsh(xx*.3+yy)>.85?t[1]:t[2]); R(g,xx+1,yy,5,1,t[1]); } }
  for(let k=0;k<6;k++){ const mx=x+hsh(x+k*7)*w, my=y-34+hsh(x*3+k)*26; blob(g,mx,my,8+hsh(k)*8,4,'#55703c'); }
  R(g,x-12,y-5,w+24,6,t[2]); R(g,x-12,y-5,w+24,1,t[0]); for(let xx=x-12;xx<x+w+12;xx+=8){ ell(g,xx+4,y+1,4,2,t[3]); R(g,xx+3,y+1,2,1,t[4]); }
  R(g,x,y+3,w,6,c[4]); R(g,x,y+9,w,2,c[3]); shade(g,x,y+11,w,16,'#100624',.25);
}

function sobrado(g,x,w,o){
  const s=o.seed, c=rmp(o.col), fl=o.fl, gH=96, uH=o.uH||78, pH=o.par==='beiral'?0:(o.pH||30);
  const top=HB-gH-(fl-1)*uH-pH, fTop=f=>HB-gH-f*uH;
  const sh=rmp(o.shut||pick(SHUT,hsh(s*2.7)));
  R(g,x,top,w,HB-top,c[2]);
  if(o.tile) azulejo(g,x+8,top+pH+4,w-16,HB-top-pH-20,o.tile,s);
  else for(let i=0;i<8;i++){ const bw=26+hsh(s+i*3.1)*70, bh=18+hsh(s+i*5.3)*46; blob(g,x+hsh(s+i*7.7)*(w-bw),top+pH+hsh(s+i*9.9)*(HB-top-pH-bh),bw,bh,hsh(s+i*2.2)>.6?c[1]:c[3]); }
  // luz da lua vinda da esquerda: degradê suave em faixas na fachada
  shade(g,x,top,w*.35,HB-top,'#fff0d0',.05); shade(g,x+w*.7,top,w*.3,HB-top,'#1a0c30',.08);
  R(g,x,top,8,HB-top,c[1]); R(g,x,top,2,HB-top,c[0]); R(g,x+6,top,2,HB-top,c[2]);
  R(g,x+w-8,top,8,HB-top,c[2]); R(g,x+w-3,top,3,HB-top,c[4]); R(g,x+w-8,top,1,HB-top,c[1]);
  for(let f=1;f<fl;f++) cornice(g,x-2,fTop(f-1),w+4,c,false);
  const n=Math.max(2,Math.round((w-30)/78));
  const states=o.dark?['escura','fechada','fechada','tabuas','quebrada','acesa','escura']:['fechada','fechada','vidro','escura','acesa','acesa','quebrada','tabuas','fechada'];
  for(let f=1;f<fl;f++){ const y0=fTop(f), balc=(f===1)||o.balc;
    for(let k=0;k<n;k++){ const cx=x+Math.round((k+.5)*w/n), v=hsh(s*1.3+f*7.1+k*3.3), st=pick(states,v);
      const wh=balc?uH-28:uH-38; janela(g,cx-13,y0+20,26,wh,{c,sh,s:s+f*10+k,st,arch:o.arch&&f===fl-1});
      if(balc&&!o.longBalc) sacada(g,cx-20,y0+20+wh+1,40,c);
      if(!balc&&hsh(v*17)>.8) arUnit(g,cx+20,y0+30,c); }
    if(balc&&o.longBalc) sacada(g,x+12,fTop(f)+20+uH-28+1,w-24,c);
  }
  // térreo
  const gy=HB-gH, dk=o.door??(n>2?Math.floor(n/2):Math.floor(hsh(s*4)*n));
  for(let k=0;k<n;k++){ const cx=x+Math.round((k+.5)*w/n), v=hsh(s*2.9+k*5.1);
    if(k===dk) porta(g,cx-17,gy+26,34,gH-40,{c,s:s+k,kind:o.shop&&v>.5?'aco':(v<.25?'aberta':'madeira')});
    else if(o.shop) porta(g,cx-19,gy+30,38,gH-44,{c,s:s+k*3,kind:'aco',transom:false});
    else { janela(g,cx-13,gy+30,26,40,{c,sh,s:s+k+77,st:pick(['fechada','vidro','escura','acesa','tabuas'],v)}); for(let b=cx-13;b<cx+13;b+=4) R(g,b,gy+30,1,40,IRON[3]); R(g,cx-13,gy+48,26,1,IRON[2]); }
  }
  if(o.sign&&tw(o.sign,2)+12<w-24) placa(g,x+w/2-tw(o.sign,2)/2-6,gy+4,o.sign,o.signC||pick(['#2a3a6a','#7a2a2a','#1e5a4a','#5a3a1a','#e8d8a8'],hsh(s*8)),o.signF||'#f6ecd0');
  if(o.awning) toldo(g,x+10,gy+12,w-20,o.awning);
  if(o.lamp) arandela(g,x+Math.round(w/n)-4,gy+2,hsh(s*19)>.3);
  // embasamento e sujeira
  R(g,x,HB-14,w,14,c[3]); R(g,x,HB-14,w,2,c[1]); R(g,x,HB-6,w,6,c[4]); R(g,x,HB-2,w,2,c[5]);
  for(let i=0;i<6;i++){ const sx=x+8+hsh(s*3+i)*(w-20); streak(g,sx,fTop(Math.floor(hsh(s+i)*(fl-1))) ,10+hsh(s*i)*30,2+Math.floor(hsh(s+i*2)*3),c[3]); }
  for(let i=0;i<3;i++) if(hsh(s*7+i)>.3){ const ux=x+10+hsh(s*11+i)*(w-60), uw=24+hsh(s*13+i)*40; umidade(g,ux,top+pH+(i?fTop(Math.min(fl-1,i))-top-pH+2:2),uw,50+hsh(s*17+i)*70,c,s+i); }
  limo(g,x,HB-14,w,c,s);
  if(hsh(s*23)>.3){ const px=x+14+hsh(s*29)*(w-90), py=top+pH+18+hsh(s*31)*(HB-top-pH-100); reboco(g,px,py,36+hsh(s)*40,20+hsh(s*2)*22,c,s); }
  if(hsh(s*27)>.8){ const px=x+20+hsh(s*33)*(w-80), py=HB-80+hsh(s*35)*30; reboco(g,px,py,26+hsh(s*3)*20,14+hsh(s*5)*10,c,s*2); }
  if(hsh(s*37)>.35) crack(g,x+10+hsh(s*41)*(w-20),top+pH+6,14+Math.floor(hsh(s)*14),c[4],s);
  if(hsh(s*43)>.3) poster(g,x+12+hsh(s*47)*(w-50),gy+40+hsh(s*53)*14,s);
  if(hsh(s*59)>.62) pixo(g,x+16+hsh(s*61)*(w-80),HB-18,s*3,pick(['#1a1020','#2a1a3a','#e8e0d0'],hsh(s*67)));
  if(hsh(s*71)>.7) tag(g,x+10+hsh(s*73)*(w-70),gy+60,s);
  if(hsh(s*79)>.5) placaNum(g,x+w-26,gy+16,10+Math.floor(hsh(s*83)*290));
  // topo
  if(o.par==='beiral') beiral(g,x,top,w,c); else platibanda(g,x,top,w,pH,c,{par:o.par,pinhas:o.pinhas,s});
  // empena lateral escura (junta com o vizinho)
  R(g,x+w,top+6,2,HB-top-6,'#1a1028');
  return top;
}
function toldo(g,x,y,w,cols){ const a=rmp(cols[0]), b=rmp(cols[1]); R(g,x-2,y-2,w+4,4,'#1a1022'); R(g,x,y,w,3,a[1]);
  for(let xx=x;xx<x+w;xx+=12){ poly(g,[[xx,y+2],[xx+6,y+2],[xx+8,y+20],[xx+2,y+20]],a[2]); poly(g,[[xx+6,y+2],[xx+12,y+2],[xx+14,y+20],[xx+8,y+20]],b[2]); R(g,xx+1,y+3,2,14,a[1]); }
  for(let xx=x;xx<x+w;xx+=6){ ell(g,xx+5,y+21,3,2,(xx/6)%2?b[3]:a[3]); } R(g,x,y+24,w,5,'#140a20'); shade(g,x,y+24,w,12,'#140a20',.35);
  if(hsh(x)>.5){ poly(g,[[x+w*.6,y+3],[x+w*.68,y+3],[x+w*.66,y+22],[x+w*.62,y+26]],'#140a20'); } }

function ecletico(g,x,w,o){
  const s=o.seed, c=rmp(o.col), fl=o.fl||3, gH=96, uH=74, pH=40, top=HB-gH-(fl-1)*uH-pH, fTop=f=>HB-gH-f*uH;
  const sh=rmp(o.shut||pick(['#3a5a4a','#4a3a5a','#2f4a6a','#6a3a2a'],hsh(s*3)));
  R(g,x,top,w,HB-top,c[2]);
  for(let i=0;i<7;i++){ const bw=30+hsh(s+i*3.1)*60, bh=20+hsh(s+i*5.3)*40; blob(g,x+hsh(s+i*7.7)*(w-bw),top+pH+hsh(s+i*9.9)*(HB-top-pH-bh),bw,bh,hsh(s+i*2.2)>.6?c[1]:c[3]); }
  for(let yy=fTop(0)+8;yy<HB-14;yy+=9){ R(g,x,yy,w,1,c[4]); R(g,x,yy+1,w,1,c[1]); }
  shade(g,x,top,w*.3,HB-top,'#fff0d0',.05); shade(g,x+w*.72,top,w*.28,HB-top,'#1a0c30',.08);
  const n=Math.max(3,Math.round(w/66)), bw=w/n;
  for(let p=0;p<=n;p++){ const px=Math.round(x+p*bw)-(p===n?10:p===0?0:5); R(g,px,top+pH,10,fTop(0)-top-pH,c[1]); R(g,px,top+pH,2,fTop(0)-top-pH,c[0]); R(g,px+8,top+pH,2,fTop(0)-top-pH,c[3]);
    R(g,px-2,top+pH+2,14,6,c[1]); R(g,px-2,top+pH+2,14,1,c[0]); R(g,px-2,top+pH+8,14,2,c[4]); for(let k=0;k<3;k++) R(g,px+1+k*3,top+pH+4,2,2,c[3]); }
  for(let f=1;f<fl;f++) cornice(g,x-3,fTop(f-1),w+6,c,f===1);
  for(let f=1;f<fl;f++){ const y0=fTop(f); for(let k=0;k<n;k++){ const cx=Math.round(x+(k+.5)*bw), v=hsh(s*1.7+f*5.3+k*2.9), st=pick(['fechada','vidro','escura','acesa','vidro','quebrada','fechada'],v);
      const wh=f===1?uH-26:uH-34; janela(g,cx-12,y0+20,24,wh,{c,sh,s:s+f*10+k,st,arch:f===fl-1&&o.arch!==false});
      if(f===1){ if(k%2===0||o.balc){ sacada(g,cx-20,y0+20+wh+1,40,c); }
        const py=y0+3; if(k%2){ poly(g,[[cx-18,py+12],[cx,py],[cx+18,py+12]],c[4]); poly(g,[[cx-16,py+11],[cx,py+2],[cx+16,py+11]],c[1]); R(g,cx-18,py+12,36,3,c[1]); R(g,cx-18,py+12,36,1,c[0]); }
        else { ell(g,cx,py+10,18,8,c[4]); ell(g,cx,py+10,16,6,c[1]); R(g,cx-18,py+11,36,6,c[2]); R(g,cx-18,py+11,36,2,c[1]); } } } }
  const gy=HB-gH; for(let k=0;k<n;k++){ const cx=Math.round(x+(k+.5)*bw), v=hsh(s*2.3+k*4.1);
    if(o.arcade){ R(g,cx-bw/2+8,gy+18,bw-16,gH-32,c[4]); archF(g,cx-bw/2+10,gy+18,bw-20,gH-32,'#160e24'); archF(g,cx-bw/2+14,gy+22,bw-28,gH-36,'#1e1630'); R(g,cx-bw/2+14,HB-28,bw-28,14,'#261c3a'); continue; }
    if(v<.35) porta(g,cx-18,gy+30,36,gH-44,{c,s:s+k,kind:v<.12?'aberta':'madeira'}); else porta(g,cx-20,gy+30,40,gH-44,{c,s:s+k*7,kind:'aco',transom:v>.7}); }
  if(o.sign) placa(g,x+w/2-tw(o.sign,2)/2-6,gy+6,o.sign,o.signC||'#2a2a4a','#f2e6c0');
  R(g,x,HB-14,w,14,c[3]); R(g,x,HB-14,w,2,c[1]); R(g,x,HB-6,w,6,c[4]); R(g,x,HB-2,w,2,c[5]);
  for(let i=0;i<6;i++) streak(g,x+10+hsh(s*3+i)*(w-20),fTop(1+Math.floor(hsh(s+i)*(fl-1)))-2,12+hsh(s*i)*30,3,c[3]);
  if(hsh(s*23)>.3) reboco(g,x+20+hsh(s*29)*(w-80),top+pH+30+hsh(s*31)*60,34,20,c,s);
  for(let i=0;i<3;i++) if(hsh(s*7+i)>.35) umidade(g,x+12+hsh(s*11+i)*(w-60),top+pH+2,26+hsh(s*13+i)*40,60+hsh(s*17+i)*80,c,s+i); limo(g,x,HB-14,w,c,s);
  if(hsh(s*43)>.3) poster(g,x+14+hsh(s*47)*(w-50),gy+40,s);
  if(hsh(s*59)>.4) pixo(g,x+20+hsh(s*61)*(w-90),HB-18,s*3,'#1a1020');
  platibanda(g,x,top,w,pH,c,{par:o.par||'balaustre',pinhas:true,s});
  if(o.dome) cupula(g,o.dome==='l'?x+50:o.dome==='r'?x+w-50:x+w/2,top,Math.min(110,w*.42),o.domeC||'#4f8a7a',c);
  R(g,x+w,top+6,2,HB-top-6,'#1a1028');
  return top;
}
function cupula(g,cx,yb,dw,col,c){ const d=rmp(col), r=dw/2;
  R(g,cx-r-6,yb-26,dw+12,26,c[2]); R(g,cx-r-6,yb-26,dw+12,3,c[1]); R(g,cx-r-6,yb-26,dw+12,1,c[0]); R(g,cx+r,yb-23,6,23,c[4]);
  for(let k=0;k<4;k++){ const ox=cx-r+8+k*(dw-16)/3; ell(g,ox,yb-13,4,5,c[4]); ell(g,ox,yb-13,3,4,'#1a1430'); }
  R(g,cx-r-8,yb-30,dw+16,5,c[1]); R(g,cx-r-8,yb-30,dw+16,1,c[0]); R(g,cx-r-6,yb-25,dw+12,1,c[4]);
  const hh=r*1.15, base=yb-30; for(let dy=0;dy<hh;dy++){ const t=dy/hh, hw=Math.round(r*Math.sqrt(1-t*t*.95)*(1-t*.15)); const y=base-dy;
    R(g,cx-hw-1,y,hw*2+2,1,d[5]); R(g,cx-hw,y,hw*2,1,d[2]); R(g,cx-hw,y,Math.round(hw*.45),1,d[1]); R(g,cx-hw+2,y,Math.round(hw*.15),1,d[0]); R(g,cx+Math.round(hw*.45),y,Math.round(hw*.55),1,d[3]); R(g,cx+Math.round(hw*.8),y,Math.round(hw*.2),1,d[4]); }
  for(let k=-3;k<=3;k++){ for(let dy=0;dy<hh-4;dy+=1){ const t=dy/hh, hw=r*Math.sqrt(1-t*t*.95)*(1-t*.15); R(g,cx+Math.round(k/4*hw),base-dy,1,1,d[3]); } }
  const ly=base-hh; R(g,cx-8,ly-18,16,18,c[1]); R(g,cx-8,ly-18,16,1,c[0]); R(g,cx+5,ly-18,3,18,c[3]); R(g,cx-4,ly-14,3,9,'#1a1430'); R(g,cx+1,ly-14,3,9,'#1a1430');
  ell(g,cx,ly-21,9,4,d[2]); R(g,cx-1,ly-36,2,14,IRON[2]); ell(g,cx,ly-30,3,3,'#d8b050');
}

function bonecoGigante(g,x,yb,o){ // boneco de carnaval (design próprio): saia-armação, braços de pano e cabeçorra
  const body=rmp(o.body), skin=rmp(o.skin), hair=rmp(o.hair), acc=rmp(o.acc), H0=o.h||230, k=H0/230;
  ell(g,x,yb,44*k,7,'rgba(10,6,20,.55)');
  const top=yb-150*k; poly(g,[[x-20*k,top],[x+20*k,top],[x+42*k,yb-4],[x-42*k,yb-4]],body[4]); poly(g,[[x-18*k,top],[x+18*k,top],[x+40*k,yb-5],[x-40*k,yb-5]],body[2]);
  poly(g,[[x-18*k,top],[x-8*k,top],[x-14*k,yb-5],[x-40*k,yb-5]],body[1]); poly(g,[[x+8*k,top],[x+18*k,top],[x+40*k,yb-5],[x+22*k,yb-5]],body[3]);
  for(let i=0;i<5;i++){ const yy=top+(i+1)*(150*k/6), hw=18*k+22*k*(yy-top)/(150*k); R(g,x-hw,yy,hw*2,3*k,acc[2]); R(g,x-hw,yy,hw*2,1,acc[1]); }
  for(let i=-3;i<=3;i++) line(g,x+i*5*k,top+4,x+i*11*k,yb-6,body[3]);
  R(g,x-40*k,yb-10*k,80*k,6*k,acc[3]); for(let xx=x-40*k;xx<x+40*k;xx+=6) R(g,xx,yb-4*k,3,4*k,acc[2]);
  for(const sx of [-1,1]){ poly(g,[[x+sx*16*k,top+4],[x+sx*30*k,top+8],[x+sx*36*k,top+92*k],[x+sx*24*k,top+96*k]],body[4]); poly(g,[[x+sx*17*k,top+6],[x+sx*28*k,top+10],[x+sx*33*k,top+90*k],[x+sx*25*k,top+92*k]],sx<0?body[1]:body[3]);
    ell(g,x+sx*30*k,top+100*k,7*k,7*k,skin[4]); ell(g,x+sx*30*k,top+100*k,6*k,6*k,skin[2]); R(g,x+sx*32*k,top+97*k,2,3,skin[1]); }
  R(g,x-10*k,top-6*k,20*k,8*k,acc[2]); R(g,x-10*k,top-6*k,20*k,2,acc[1]);
  const hy=top-34*k, hr=30*k; ell(g,x,hy,hr+2,hr*1.1+2,skin[5]); ell(g,x,hy,hr,hr*1.1,skin[2]); ell(g,x-hr*.25,hy-hr*.2,hr*.55,hr*.6,skin[1]); ell(g,x+hr*.45,hy+hr*.1,hr*.4,hr*.8,skin[3]);
  ell(g,x,hy-hr*.75,hr*1.05,hr*.5,hair[2]); ell(g,x-hr*.3,hy-hr*.85,hr*.5,hr*.25,hair[1]); R(g,x-hr,hy-hr*.6,8*k,hr*1.1,hair[2]); R(g,x+hr-8*k,hy-hr*.6,8*k,hr*1.1,hair[3]);
  if(o.hat){ ell(g,x,hy-hr*.95,hr*1.5,hr*.22,acc[3]); ell(g,x,hy-hr*1.0,hr*1.45,hr*.18,acc[2]); R(g,x-hr*.7,hy-hr*1.6,hr*1.4,hr*.65,acc[2]); R(g,x-hr*.7,hy-hr*1.6,hr*.5,hr*.65,acc[1]); R(g,x-hr*.7,hy-hr*1.08,hr*1.4,4*k,acc[4]); }
  for(const sx of [-1,1]){ ell(g,x+sx*hr*.38,hy-hr*.05,hr*.2,hr*.17,'#fff8e8'); ell(g,x+sx*hr*.36,hy-hr*.02,hr*.09,hr*.1,'#1a1020'); R(g,x+sx*hr*.36-1,hy-hr*.08,2,2,'#ffffff'); R(g,x+sx*hr*.38-hr*.22,hy-hr*.3,hr*.44,3*k,hair[3]);
    ell(g,x+sx*hr*.6,hy+hr*.35,hr*.16,hr*.1,mix(skin[2],'#e84a5a',.4)); }
  poly(g,[[x-3*k,hy],[x+5*k,hy+hr*.28],[x-4*k,hy+hr*.3]],skin[3]); ell(g,x,hy+hr*.6,hr*.35,hr*.12,'#7a1a2a'); R(g,x-hr*.3,hy+hr*.54,hr*.6,2,'#f0e0d0');
  if(o.stach){ ell(g,x-hr*.22,hy+hr*.42,hr*.22,hr*.08,hair[2]); ell(g,x+hr*.22,hy+hr*.42,hr*.22,hr*.08,hair[2]); }
  R(g,x+hr*.6,hy+hr*.1,6,8*k,'#5a0e18'); // mancha
}
function seaBand(g,a,b,y0,y1,river){ const top=river?['#3a4a7a','#2e3e6a','#26345c','#1e2a4e','#18223f']:['#4a4a86','#3a3c74','#2c3062','#222650','#1a1d40'];
  const n=top.length; for(let i=0;i<n;i++) R(g,a,y0+(y1-y0)*i/n,b-a,(y1-y0)/n+1,top[i]);
  for(let y=y0+2;y<y1;y+=2){ const d=(y-y0)/(y1-y0), L=4+d*18; for(let k=Math.floor(a/23)-1;k<b/23+1;k++){ const v=hsh(k*3.7+y*.91); if(v>.55) R(g,k*23+v*16,y,L*(v-.4),1,v>.85?'#8a8ac8':'#5a5aa0'); else if(v<.12) R(g,k*23+v*40,y,L,1,'#141634'); } }
  R(g,a,y0,b-a,1,'#8a86c0'); R(g,a,y0+1,b-a,1,'#5e5c98'); }
function reflexo(g,x,y0,y1,col,w){ for(let y=y0;y<y1;y+=2){ const v=hsh(x*.13+y*1.7), ww=w*(.4+v*.9); if(v>.25) R(g,x-ww/2+Math.sin(y*.7)*3,y,ww,1,col); } }
function farBank(g,a,b,base){ const pal=['#7a6a8e','#6a7a9a','#8a6a7a','#7a7a8a','#6a6a8a'];
  for(let k=Math.floor(a/40)-1;k<b/40+1;k++){ const x=k*40, v=hsh(k*7.3), w=30+Math.floor(hsh(k*3.1)*26), h=22+Math.floor(hsh(k*5.9)*40), c=rmp(pick(pal,v));
    R(g,x,base-h,w,h,c[3]); R(g,x,base-h,w,2,c[2]); R(g,x+w-4,base-h,4,h,c[4]); poly(g,[[x-2,base-h],[x+w/2,base-h-8],[x+w+2,base-h]],mix(TERRA[3],'#4a3a6a',.4));
    for(let yy=base-h+6;yy<base-6;yy+=8) for(let xx=x+4;xx<x+w-5;xx+=7){ const lit=hsh(xx*1.1+yy)>.78; R(g,xx,yy,3,4,'#2a2448'); if(lit) emitW(g,g=>{ R(g,xx,yy,3,4,'#f0b860'); reflexo(g,xx+1,base+4,base+40,'#a8784a',3); }); }
    if(v>.92){ for(const tx of [x+4,x+w-14]){ R(g,tx,base-h-52,10,52,c[2]); R(g,tx+7,base-h-52,3,52,c[4]); poly(g,[[tx-1,base-h-52],[tx+5,base-h-66],[tx+11,base-h-52]],c[3]); R(g,tx+3,base-h-44,4,6,'#2a2448'); } }
    if(v<.1){ R(g,x+w/2,base-h-40,3,40,'#2a2a3a'); for(let j=0;j<6;j++){ const aa=-2.8+j*.55; line(g,x+w/2+1,base-h-40,x+w/2+1+Math.cos(aa)*16,base-h-40+Math.sin(aa)*10+6,'#2a3a3a',2); } } }
  R(g,a,base,b-a,6,'#4a4458'); R(g,a,base,b-a,1,'#7a7088'); }
function balaustrada(g,a,b){ const c=rmp('#d8d0c0'), y0=258;
  for(let x=Math.floor(a/14)*14-14;x<b+14;x+=14){ R(g,x+3,y0+10,8,HB+6-y0-14,c[4]); R(g,x+4,y0+10,6,HB+6-y0-14,c[2]); R(g,x+4,y0+10,2,HB+6-y0-14,c[1]); ell(g,x+7,y0+20,4,5,c[2]); ell(g,x+6,y0+19,2,3,c[1]); ell(g,x+7,HB-6,4,4,c[3]); }
  R(g,a,y0,b-a,10,c[2]); R(g,a,y0,b-a,2,c[0]); R(g,a,y0+2,b-a,2,c[1]); R(g,a,y0+8,b-a,2,c[4]); R(g,a,HB-6,b-a,12,c[3]); R(g,a,HB-6,b-a,2,c[1]);
  for(let x=Math.floor(a/576)*576+96;x<b+60;x+=576){ R(g,x-14,y0-10,28,HB+6-y0+10,c[4]); R(g,x-13,y0-9,26,HB+6-y0+9,c[2]); R(g,x-13,y0-9,6,HB+6-y0+9,c[1]); R(g,x+8,y0-9,5,HB+6-y0+9,c[3]); R(g,x-16,y0-12,32,5,c[1]); R(g,x-16,y0-12,32,1,c[0]); }
  for(let x=Math.floor(a/40)*40;x<b;x+=40) if(hsh(x)>.7) streak(g,x+hsh(x*3)*30,y0+10,10,3,c[3]);
}
function posteColonial(g,x,yb,h,lit,dbl){ // poste de ferro fundido no plano do meio
  const ir=IRON; R(g,x-9,yb-18,18,18,ir[4]); R(g,x-8,yb-17,16,16,ir[2]); R(g,x-8,yb-17,3,16,ir[1]); R(g,x-11,yb-20,22,4,ir[2]); R(g,x-11,yb-20,22,1,ir[0]);
  R(g,x-3,yb-h,6,h-18,ir[4]); R(g,x-2,yb-h,4,h-18,ir[2]); R(g,x-2,yb-h,1,h-18,ir[0]); for(const yy of [yb-40,yb-h*.6]){ R(g,x-5,yy,10,4,ir[2]); R(g,x-5,yy,10,1,ir[0]); }
  const heads=dbl?[-1,1]:[0]; for(const sx of heads){ const lx=x+sx*20; if(sx){ line(g,x,yb-h+6,lx,yb-h+2,ir[3],3); ell(g,x+sx*10,yb-h+10,5,4,ir[3]); }
    R(g,lx-8,yb-h-2,16,3,ir[2]); poly(g,[[lx-7,yb-h+1],[lx+7,yb-h+1],[lx+5,yb-h+22],[lx-5,yb-h+22]],ir[4]); poly(g,[[lx-5,yb-h+2],[lx+5,yb-h+2],[lx+4,yb-h+20],[lx-4,yb-h+20]],'#3a3450'); if(lit) emitW(g,g=>{ poly(g,[[lx-5,yb-h+2],[lx+5,yb-h+2],[lx+4,yb-h+20],[lx-4,yb-h+20]],'#ffe6a0'); R(g,lx-2,yb-h+4,3,14,'#fffbe8'); });
    R(g,lx-6,yb-h+21,12,3,ir[2]); poly(g,[[lx-9,yb-h-2],[lx,yb-h-12],[lx+9,yb-h-2]],ir[3]); R(g,lx-1,yb-h-16,2,5,ir[2]);
    if(lit){ glow(g,lx,yb-h+12,60,'#ffb860',.06,5); reg(LAMPS,{x:lx/RS,y:(yb-h+12)/RS,r:22,mid:true}); } } }
function luzChao(g,cx,cy,rx,col,a){ glow(g,cx,cy,rx,col||'#ffa040',(a||.05)*1.9,4,rx*.24); }
/* =====================================================================
   CHÃO EM PERSPECTIVA
   ===================================================================== */
function rows(y0,y1,h0,k){ const r=[]; let y=y0; while(y<y1){ const h=Math.max(3,Math.round(h0+(y-y0)*k)); r.push([y,Math.min(h,y1-y)]); y+=h; } return r; }
const ROWC={}; function rowsC(key,y0,y1,h0,k){ return ROWC[key]||(ROWC[key]=rows(y0,y1,h0,k)); }
function haze(col,y,y0,y1,amt){ return mix(col,'#55507e',Math.max(0,1-(y-y0)/(y1-y0))*amt); }
function lowf(x,y,s){ return (Math.sin(x*.0061+s)+Math.sin(x*.0137+y*.021+s*2)+Math.sin(y*.033-x*.0029+s))/3; }
function stoneDome(g,xs,ys,W2,H2,c,t){ const r=H2>8?2:1, tb=Math.max(1,Math.round(H2*.14)), bb=Math.max(1,Math.round(H2*.2));
  R(g,xs+r,ys,W2-2*r,H2,c[t]); R(g,xs,ys+r,W2,H2-2*r,c[t]); R(g,xs+r,ys,W2-2*r,tb,c[t-1]); if(H2>6) R(g,xs+2,ys+1,Math.round(W2*.3),1,c[Math.max(0,t-2)]); if(H2>8) R(g,xs+1,ys+tb+1,Math.max(1,Math.round(W2*.12)),H2-tb-bb-1,mix(c[t],c[t-1],.5));
  R(g,xs+r,ys+H2-bb,W2-2*r,bb,c[Math.min(5,t+1)]); R(g,xs+r,ys+H2-1,W2-2*r,1,c[Math.min(5,t+2)]); R(g,xs+W2-1,ys+r,1,H2-2*r,c[Math.min(5,t+1)]); }
function fCobble(g,a,b,col,s,irr,X0){ col=mix(col,'#b0a498',.25); R(g,a,ST,b-a,HH-ST,mix(col,'#140c22',.62));
  const pals=[col,mix(col,'#9a8070',.3),mix(col,'#6a8090',.28)];
  rowsC('cob',ST,HH,7,.115).forEach(([y,h],ri)=>{ const base=Math.round(h*1.9+5), rut=(y>=404&&y<428)||(y>=470&&y<500); let x=X0-Math.round(hsh(ri*7.7+s)*base), k=0;
    while(x<b){ const v=hsh(k*12.9+ri*78.2+s), sw=Math.round(base*(.55+hsh(v*7.3)*.9));
      if(x+sw>a){ const lf=lowf(x,y,s), dd=(y-ST)/(HH-ST), c=rmp(haze(pals[Math.floor(hsh(v*31)*3)],y,ST,HH,.55)); let t=dd<.25?2:(v<.15?3:v>.8?1:2); if(lf>.4) t=Math.min(4,t+1); if(lf<-.5||rut) t=Math.max(1,t-1);
        const j=irr?2:1, xs=x+1+Math.round(hsh(v*91)*j), xe=x+sw-1-Math.round(hsh(v*37)*j), ys=y+1+(irr?Math.round(hsh(v*53)*1.4):0), W2=xe-xs, H2=y+h-1-ys;
        if(W2>=4&&H2>=2){ if(irr&&v>.992){ R(g,xs,ys,W2,H2,'#0e0a14'); R(g,xs+2,ys+H2-3,W2-4,2,'#2a2030'); }
          else if(v>.6&&v<.64){ R(g,xs,ys,W2,2,'#0e0a16'); stoneDome(g,xs,ys+2,W2,H2-2,c,Math.min(4,t+1)); }
          else { stoneDome(g,xs,ys,W2,H2,c,t); if(rut&&v>.5) R(g,xs+3,ys+1,Math.round(W2*.3),1,c[0]); if(v>.92&&H2>9) R(g,xs+2+hsh(v)*(W2-6),ys+3,3,1,c[5]);
            if(H2>13){ for(let q=0;q<W2/7;q++) R(g,xs+3+hsh(v*17+q)*(W2-6),ys+3+hsh(v*23+q)*(H2-7),2,1,hsh(q+v)>.5?c[Math.min(5,t+1)]:c[Math.max(0,t-1)]); if(v>.7) R(g,xs+W2*.3,ys+H2*.5,W2*.3,1,c[Math.min(5,t+2)]); } } }
        if(hsh(v*71)>.82){ R(g,x+sw-1,y+2,1,h-3,'#3a5a3a'); if(h>10) R(g,x+sw-2,y+h-4,3,2,'#4a7a44'); } }
      x+=sw; k++; } });
}
function slab(g,xs,ys,W2,H2,c,t,v){ // laje com chanfro, desgaste e pintas
  R(g,xs,ys,W2,H2,c[t]); R(g,xs+2,ys+2,Math.round(W2*.5),Math.max(1,Math.round(H2*.35)),mix(c[t],c[t-1],.45));
  R(g,xs,ys,W2,2,c[t-1]); R(g,xs,ys,2,H2,c[t-1]); R(g,xs+1,ys,W2-2,1,c[Math.max(0,t-2)]); R(g,xs,ys+H2-2,W2,2,c[Math.min(5,t+1)]); R(g,xs+W2-2,ys+2,2,H2-2,c[Math.min(5,t+1)]); R(g,xs+2,ys+H2-1,W2-2,1,c[5]);
  for(let i=0;i<W2/11;i++){ const px=xs+4+hsh(v*13+i)*(W2-9), py=ys+3+hsh(v*29+i)*(H2-6), w=hsh(v+i*3)>.7?3:2; R(g,px,py,w,1,hsh(i+v)>.5?c[Math.min(5,t+1)]:c[Math.max(0,t-1)]); }
  if(v>.86) poly(g,[[xs,ys],[xs+8+v*8,ys],[xs,ys+Math.min(H2,7)]],c[5]);
  if(v<.12) poly(g,[[xs+W2,ys+H2],[xs+W2-10,ys+H2],[xs+W2,ys+H2-6]],c[5]);
  if(v>.9){ let cx=xs+W2*(.2+hsh(v*3)*.6), cy=ys+1; while(cy<ys+H2-2){ R(g,cx,cy,1,1,c[5]); R(g,cx+1,cy,1,1,c[Math.max(0,t-1)]); cy++; cx+=hsh(cx*7+cy)>.5?1:-1; } }
  if(v>.45&&v<.52) blob(g,xs+5+hsh(v*5)*W2*.3,ys+3,W2*.45,H2*.6,mix(c[t],'#3a2a40',.22)); }
function fSlabs(g,a,b,col,s,y0,X0){ R(g,a,y0,b-a,HH-y0,'#1e1828');
  rowsC('sl'+y0,y0,HH,11,.17).forEach(([y,h],ri)=>{ const base=Math.round(h*2.3+18), stripe=ri%6===4; let x=X0-Math.round(hsh(ri*3.3+s)*base), k=0;
    while(x<b){ const v=hsh(k*9.3+ri*41.7+s), sw=Math.round(base*(.5+hsh(v*5.7)*1.1));
      if(x+sw>a){ const pal=stripe?mix(col,'#4a4660',.5):(hsh(v*17)>.75?mix(col,'#b49484',.25):hsh(v*19)<.2?mix(col,'#8a90a8',.2):col), c=rmp(haze(pal,y,y0,HH,.3)), lf=lowf(x,y,s); let t=v<.18?3:v>.78?1:2; if(lf>.45) t=Math.min(4,t+1);
        if(!stripe&&h>16&&hsh(v*23)>.7){ const h2=Math.round(h/2); slab(g,x+1,y+1,sw-2,h2-1,c,t,v); slab(g,x+1,y+h2+1,sw-2,h-h2-2,c,Math.min(4,t+1),hsh(v*41)); }
        else slab(g,x+1,y+1,sw-2,h-2,c,t,v); }
      x+=sw; k++; } });
}
function fPortuguesa(g,a,b,y0,s,wave){ R(g,a,y0,b-a,HH-y0,'#6e665c');
  rowsC('pt'+y0,y0,HH,3,.02).forEach(([y,h],ri)=>{ const sw=Math.max(3,Math.round(h*1.2+1)), off=Math.round(hsh(ri*1.7)*sw), d=(y-y0)/(HH-y0);
    const cw=rmp(mix('#e6dec8','#787698',.25*(1-d))), cb=rmp(mix('#4e4a5c','#4a4868',.25*(1-d)));
    for(let k=Math.floor((a-off)/sw)-1;k<=Math.ceil((b-off)/sw);k++){ const x=off+k*sw, cx=x+sw/2; const ph=((ri+Math.sin(cx/150)*4+Math.sin(cx/47)*.5)%13+13)%13, black=wave&&ph<1.7;
      const v=hsh(k*3.1+ri*7.7+s), lf=lowf(x,y,s); let t=v>.78?1:v<.14?3:2; if(lf>.5) t=3; const cc=black?cb:cw; R(g,x+1,y+1,sw-1-(v>.6?1:0),h-1,cc[t]); if(h>6&&v>.5) R(g,x+1,y+1,sw-2,1,cc[t-1]); } });
}
function fAsfalto(g,a,b,s,X0){ const c=rmp('#5a5870'); R(g,a,ST,b-a,HH-ST,c[2]);
  rowsC('as',ST,HH,6,.05).forEach(([y,h],ri)=>{ for(let x=Math.floor(a/48)*48;x<b;x+=48){ const lf=lowf(x,y,s); if(lf>.35) R(g,x,y,48,h,c[3]); else if(lf<-.45) R(g,x,y,48,h,mix(c[2],c[1],.5)); } });
  for(let k=Math.floor(a/170)-1;k<b/170+1;k++){ const v=hsh(k*4.7+s); if(v>.45){ const px=k*170+v*60, py=ST+24+hsh(k*9.1)*140, pw=70+v*110, ph=14+hsh(k)*26, cc=v>.72?c[4]:c[1]; R(g,px,py,pw,ph,cc); R(g,px,py,pw,1,v>.72?c[5]:c[0]); R(g,px,py+ph,pw,1,c[4]); R(g,px,py,1,ph,c[4]); } }
  rowsC('as',ST,HH,6,.05).forEach(([y,h],ri)=>{ for(let k=Math.floor(a/7)-1;k<b/7+1;k++){ const v=hsh(k*1.37+ri*9.1+s); if(v>.8) R(g,k*7+v*5,y+v*h,1+(h>10?1:0),1,v>.93?c[0]:c[3]); else if(v<.05) R(g,k*7,y+hsh(v*9)*h,2,1,c[4]); } });
  for(let k=Math.floor(a/900);k<b/900+1;k++){ if(hsh(k*3.9+s)>.5){ const x0=k*900+200, y0=380+hsh(k)*100; for(let i=0;i<260;i+=2){ const yy=y0+Math.sin(i/60)*14; R(g,x0+i,yy,2,3,c[4]); R(g,x0+i,yy+22,2,3,c[4]); } } }
  for(let k=Math.floor(a/120);k<b/120+1;k++){ const x=k*120, worn=hsh(k*7.7); R(g,x,430,74,4,worn>.8?'#8a7a4a':'#c8a83a'); R(g,x,430,74,1,'#f0d070'); R(g,x,436,74,4,worn>.6?'#8a7a4a':'#c8a83a'); R(g,x+74,428,6,14,c[2]); }
  R(g,a,364,b-a,3,'#d8d4c8'); R(g,a,364,b-a,1,'#f2eee0'); for(let k=Math.floor(a/60);k<b/60+1;k++) if(hsh(k*2.1)>.7) R(g,k*60,364,20,3,c[2]);
  for(let k=Math.floor(a/2400);k<b/2400+1;k++){ const x0=k*2400+1100; if(x0+300<a||x0>b) continue; rowsC('as',ST,HH,6,.05).forEach(([y,h])=>{ if(y<372||y>520) return; for(let j=0;j<6;j++){ const xx=x0+j*44+(y-372)*.25; R(g,xx,y,26+(y-372)*.06,h-1,hsh(j+y)>.25?'#c8c4b8':'#8a8890'); } }); }
  for(let k=Math.floor(a/1300);k<b/1300+1;k++){ const x=k*1300+500+hsh(k)*300, y=470+hsh(k*3)*30; ell(g,x,y,30,9,'#1a1424'); ell(g,x,y-1,28,8,'#4a4656'); ell(g,x,y-1,22,6,'#3a3646'); for(let j=-18;j<=18;j+=6) R(g,x+j,y-5,2,9,'#2a2636'); R(g,x-28,y-2,56,1,'#6a6676'); }
  for(let k=Math.floor(a/700);k<b/700+1;k++){ const x=k*700+120; R(g,x,CURB+12,40,8,'#120c1a'); for(let j=0;j<40;j+=5) R(g,x+j+1,CURB+13,3,6,'#4a4456'); }
  for(let k=Math.floor(a/80);k<b/80+1;k++){ const v=hsh(k*6.3+s); if(v>.62){ let cx=k*80+v*40, cy=ST+14+v*170; for(let i=0;i<26;i++){ R(g,cx,cy,2,1,c[5]); cx+=2; cy+=hsh(i+k)>.5?1:-1; if(i===9){ let bx=cx, by=cy; for(let j=0;j<10;j++){ R(g,bx,by,1,1,c[5]); by++; bx+=hsh(j+k)>.5?1:-1; } } } } }
}
function fundoTelhados(g,a,b,s){ // segunda fileira de casas e torres ao longe, atrás do casario (profundidade)
  for(let k=Math.floor(a/70)-2;k<b/70+2;k++){ const v=hsh(k*3.7+s), x=k*70+Math.round(hsh(k*1.3)*20), w=60+Math.round(hsh(k*5.1)*70), top=26+Math.round(hsh(k*2.9+s)*80);
    const c=rmp(pick(['#6a5a86','#5e5a88','#74607e','#62668a'],hsh(k*7.7)));
    R(g,x,top,w,200,c[3]); R(g,x,top,w,2,c[1]); R(g,x+w-4,top,4,200,c[4]);
    if(v<.4){ poly(g,[[x-6,top+1],[x+w/2,top-18],[x+w+6,top+1]],mix(TERRA[3],'#4a3a6a',.45)); line(g,x-6,top,x+w/2,top-18,mix(TERRA[1],'#6a5a8a',.4)); }
    for(let yy=top+10;yy<top+90;yy+=18) for(let xx=x+8;xx<x+w-10;xx+=16){ const lv=hsh(xx*.31+yy*1.7); R(g,xx,yy,6,9,c[4]); if(lv>.8){ const X=xx,Y=yy; emit(g,g=>R(g,X+1,Y+1,4,7,'#e8a860')); } }
    if(v>.55&&v<.7){ R(g,x+10,top-22,26,20,c[2]); R(g,x+10,top-22,26,2,c[1]); R(g,x+14,top-2,3,4,c[4]); R(g,x+30,top-2,3,4,c[4]); }
    if(v>.7&&v<.8){ R(g,x+w/2,top-34,2,34,c[4]); R(g,x+w/2-10,top-28,22,2,c[4]); R(g,x+w/2-6,top-22,14,2,c[4]); }
    if(v>.95){ R(g,x+w/2-14,top-70,28,72,c[2]); R(g,x+w/2+8,top-70,6,72,c[4]); poly(g,[[x+w/2-16,top-70],[x+w/2,top-96],[x+w/2+16,top-70]],c[3]); archF(g,x+w/2-6,top-62,12,16,c[5]); } }
}
function fAgua(g,a,b){ const cols=['#26306a','#222a60','#1e2656','#1a214c','#161c42','#13183a'];
  rowsC('ag',HB,HH,4,.06).forEach(([y,h],ri)=>{ const d=(y-HB)/(HH-HB), col=cols[Math.min(5,Math.floor(d*6))]; R(g,a,y,b-a,h,col);
    const L=8+d*40; for(let k=Math.floor(a/30)-1;k<b/30+1;k++){ const v=hsh(k*2.3+ri*5.1); if(v>.6){ const x=k*30+v*20; R(g,x,y,L*(v-.4),Math.max(1,Math.round(h*.25)),v>.9?'#8a90d0':'#4a52a0'); R(g,x+2,y+Math.max(1,Math.round(h*.25)),L*(v-.4)-4,1,'#0e1230'); } } }); }
function fMolhe(g,a,b){ R(g,a,HB,b-a,HH-HB,'#262030');
  rowsC('mo',316,522,26,.16).forEach(([y,h],ri)=>{ let x=Math.floor(a/1000)*1000-400-ri*57, k=Math.floor(x/10); while(x<b){ const v=hsh(k*3.3+ri*7.9), sw=Math.round(200+hsh(v*9)*180);
      if(x+sw>a){ const c=rmp(haze(hsh(v*13)>.7?'#b2aca4':'#bcb8b0',y,316,522,.3)), t=v>.75?1:v<.2?3:2;
        R(g,x+2,y+2,sw-3,h-3,c[t]); R(g,x+2,y+2,sw-3,1,c[t-1]); R(g,x+2,y+h-2,sw-3,1,c[5]); R(g,x+2,y+h-3,sw-3,1,c[Math.min(5,t+1)]); R(g,x+sw-2,y+2,1,h-3,c[4]);
        for(let i=0;i<7;i++) blob(g,x+8+hsh(v*7+i)*(sw-50),y+4+hsh(v*11+i)*(h-12),16+hsh(i+v)*34,3+hsh(i*3+v)*6,hsh(i+v*5)>.5?mix(c[t],c[t+1],.6):mix(c[t],c[t-1],.6));
        for(let i=0;i<sw/9;i++) R(g,x+4+hsh(v*31+i)*(sw-8),y+3+hsh(v*37+i)*(h-6),2,1,hsh(i)>.5?c[Math.min(5,t+1)]:c[Math.max(0,t-1)]);
        if(v>.7){ const bx=x+30+v*(sw-80); ell(g,bx,y+h*.4,4,2,METAL[4]); streak(g,bx-1,y+h*.4+2,h*.4,3,'#8a5a3a'); }
        if(v>.82){ let cx=x+sw*.3, cy=y+2; for(let i=0;i<h*1.4;i++){ R(g,cx,cy,1,1,c[5]); cx+=hsh(i+v)>.4?1:-1; cy+=hsh(i*3+v)>.4?1:0; if(cy>y+h-3) break; } }
        if(ri===0||y+h>505) for(let i=0;i<sw/14;i++) R(g,x+hsh(v*41+i)*sw,ri===0?y+2+hsh(i)*4:y+h-5+hsh(i)*3,4+hsh(i*5)*6,2,'#3e5a42'); }
      x+=sw; k++; } });
  for(const [y0,h0,dir] of [[HB,24,1],[518,22,-1]]){ for(let k=Math.floor(a/22)-1;k<b/22+1;k++){ const v=hsh(k*5.7+y0), x=k*22+v*8, w=20+v*14, hh=12+hsh(k*3)*10, y=dir>0?y0+hsh(k)*10:y0+hsh(k)*6;
      const r=rmp(pick(['#6a6672','#5a5866','#7a7480'],v)); blob(g,x-1,y-1,w+2,hh+2,r[5]); blob(g,x,y,w,hh,r[2]); blob(g,x+2,y+1,w*.5,hh*.4,r[1]); R(g,x+3,y+1,w*.3,1,r[0]); R(g,x+w*.5,y+hh*.6,w*.4,hh*.3,r[3]); if(hsh(k*9)>.7) R(g,x+2,y+hh-3,w-4,2,'#3e5a42'); } } }
function sidewalk(g,a,b,type,s){ if(type==='portuguesa') fPortuguesa(g,a,b,HB,s,true);
  else { const base=type==='granito'?'#b0aaa6':'#bcb6ac'; R(g,a,HB,b-a,CURB-HB,'#3a3244');
    rowsC('sw',HB,CURB,13,.06).forEach(([y,h],ri)=>{ const c=rmp(haze(base,y,HB,CURB+60,.3)), sw=type==='granito'?90:62; const off=ri*23;
      for(let k=Math.floor((a-off)/sw)-1;k<b/sw+1;k++){ const x=off+k*sw, v=hsh(k*7.1+ri*3.9+s); R(g,x+1,y+1,sw-1,h-1,v>.75?c[1]:v<.2?c[3]:c[2]); R(g,x+1,y+1,sw-1,1,c[1]); R(g,x+1,y+h-1,sw-1,1,c[4]);
        if(v>.85) crack(g,x+10+v*30,y+1,Math.floor(h/2),c[4],k); if(v>.4&&v<.5) blob(g,x+6,y+3,sw*.4,h*.5,mix(c[2],'#3a2a44',.25)); if(v<.06) R(g,x,y+h-2,5,2,'#4a6a3a'); } }); }
  // meio-fio de granito
  const g1=rmp('#c8c2bc'); R(g,a,CURB,b-a,4,g1[1]); R(g,a,CURB,b-a,1,g1[0]); R(g,a,CURB+4,b-a,8,g1[3]); R(g,a,CURB+10,b-a,2,g1[5]);
  for(let x=Math.floor(a/48)*48;x<b;x+=48){ R(g,x,CURB,1,12,g1[4]); if(hsh(x)>.7) R(g,x+10,CURB+4,8,3,g1[4]); }
  shade(g,a,HB,b-a,6,'#140a24',.45);
}

/* =====================================================================
   PROPS (no fundo do chão: sempre atrás dos personagens)
   ===================================================================== */
function carro(g,x,yb,col,o={}){ const c=rmp(col), k=o.k||1.9, L=150*k, T='#16121e', P=(px,py)=>[x+px*k,yb-py*k];
  ell(g,x+L/2,yb,L/2+8,5,'rgba(10,6,20,.55)');
  poly(g,[P(3,8),P(0,22),P(5,33),P(38,36),P(112,36),P(146,30),P(150,18),P(147,8)],c[5]);
  poly(g,[P(4,9),P(1,22),P(6,32),P(38,35),P(112,35),P(145,29),P(149,18),P(146,9)],c[2]);
  poly(g,[P(36,35),P(52,54),P(98,54),P(118,35)],c[5]); poly(g,[P(38,35),P(53,53),P(97,53),P(116,35)],c[2]);
  poly(g,[P(43,36),P(55,51),P(74,51),P(74,36)],GLASS[2]); poly(g,[P(78,36),P(78,51),P(95,51),P(110,36)],GLASS[2]);
  poly(g,[P(46,38),P(52,46),P(58,38)],GLASS[1]); poly(g,[P(80,38),P(80,46),P(88,38)],GLASS[1]);
  R(g,x+38*k,yb-35*k,80*k,2,c[1]); R(g,x+53*k,yb-54*k,45*k,2,c[0]); R(g,x+6*k,yb-30*k,140*k,2,c[1]); R(g,x+4*k,yb-14*k,144*k,5*k,c[4]); R(g,x+4*k,yb-9*k,144*k,2,c[5]);
  R(g,x+75*k,yb-35*k,2,26*k,c[4]); R(g,x+44*k,yb-34*k,2,24*k,c[4]); R(g,x+108*k,yb-33*k,2,24*k,c[4]); R(g,x+62*k,yb-28*k,8,3,c[0]); R(g,x+92*k,yb-28*k,8,3,c[0]);
  R(g,x+144*k,yb-26*k,6,8,'#ffe8a8'); R(g,x+1,yb-26*k,5,10,'#c0303a'); R(g,x+145*k,yb-14*k,6,5,METAL[1]); R(g,x,yb-14*k,6,5,METAL[1]);
  for(const wx of [x+30*k,x+120*k]){ ell(g,wx,yb-13*k,15*k,9*k,c[5]); ell(g,wx,yb-11*k,12*k,12*k,T); ell(g,wx,yb-11*k,7*k,7*k,METAL[3]); ell(g,wx,yb-11*k,6*k,6*k,METAL[1]); ell(g,wx,yb-11*k,2*k,2*k,METAL[4]); }
  for(let i=0;i<5;i++) blob(g,x+10*k+hsh(x+i)*120*k,yb-32*k+hsh(x*3+i)*18*k,8+hsh(i)*12,5,mix(c[3],'#8a4a2a',.6));
  if(o.broken) { poly(g,[P(60,40),P(66,50),P(70,42),P(68,38)],'#0c0616'); line(g,x+66*k,yb-50*k,x+74*k,yb-46*k,GLASS[0]); }
  if(o.police){ R(g,x+6*k,yb-24*k,140*k,6*k,'#f2f2f2'); R(g,x+6*k,yb-24*k,140*k,1,'#ffffff'); textSh(g,'POLICIA',x+50*k,yb-23*k,2,'#1a2a6a','#c8c8d0'); R(g,x+66*k,yb-58*k,20*k,4*k,'#1a1a2a'); R(g,x+67*k,yb-57*k,9*k,3*k,'#e83a3a'); R(g,x+77*k,yb-57*k,8*k,3*k,'#3a6ae8'); }
  if(o.open){ poly(g,[P(76,10),P(76,34),P(60,40),P(58,14)],c[3]); R(g,x+76*k,yb-34*k,30*k,24*k,'#140a1e'); }
  if(o.blood){ blob(g,x+80*k,yb-26*k,16,10,'#5a0a16'); streak(g,x+84*k,yb-18*k,10,3,'#5a0a16'); }
}
function barraca(g,x,yb,col,s){ const c=rmp(col), wd=rmp('#9a6a42'), w=150, h=150, top=yb-h;
  ell(g,x+w/2,yb,w/2+6,5,'rgba(10,6,20,.5)');
  for(const px of [x+4,x+w-8]){ R(g,px,top+20,4,h-20,wd[4]); R(g,px,top+20,2,h-20,wd[2]); }
  // toldo listrado com caimento
  poly(g,[[x-8,top+24],[x+8,top],[x+w-8,top],[x+w+8,top+24]],c[5]); for(let k=0;k<10;k++){ const x0=x+8+k*(w-16)/10, x1=x0+(w-16)/10; poly(g,[[x0+(k-5)*1.6-8+16*(k/10),top+24],[x0,top+2],[x1,top+2],[x1+(k-4)*1.6-8+16*((k+1)/10),top+24]],k%2?c[2]:'#f4ecd8'); }
  R(g,x+8,top,w-16,2,c[1]); for(let k=0;k<12;k++){ ell(g,x-6+k*13.5,top+25,6,3,k%2?c[3]:'#d8d0bc'); } R(g,x-6,top+28,w+12,4,'rgba(14,8,26,.4)');
  // mercadorias: redes, bonecos de barro, chapéus
  for(let k=0;k<4;k++){ const rc=rmp(pick(['#e84a3a','#3a8ae8','#ffd23f','#4ac860','#e86ad0'],hsh(s+k))); sag(g,x+14+k*30,top+30,x+38+k*30,top+30,28,rc[2],3); for(let j=0;j<4;j++) R(g,x+18+k*30+j*5,top+40+j*5,2,8,rc[3]); }
  R(g,x-2,yb-58,w+4,6,wd[1]); R(g,x-2,yb-58,w+4,1,wd[0]); R(g,x,yb-52,w,50,wd[3]); for(let k=x+4;k<x+w;k+=12) R(g,k,yb-52,1,50,wd[4]); R(g,x,yb-52,w,3,wd[4]);
  for(let k=0;k<7;k++){ const ix=x+8+k*20, it=Math.floor(hsh(s*3+k)*3), ic=rmp(pick(['#c86a3a','#e8c050','#5ab0e8','#e85a8a','#8ad860'],hsh(s+k*7)));
    if(it===0){ ell(g,ix+6,yb-66,7,8,ic[4]); ell(g,ix+6,yb-66,6,7,ic[2]); ell(g,ix+4,yb-69,2,3,ic[1]); ell(g,ix+6,yb-77,4,4,ic[2]); }
    else if(it===1){ ell(g,ix+7,yb-61,10,3,ic[3]); R(g,ix+2,yb-70,10,8,ic[2]); R(g,ix+2,yb-70,10,2,ic[1]); } else { R(g,ix,yb-72,14,14,ic[2]); R(g,ix,yb-72,14,2,ic[1]); R(g,ix+2,yb-68,10,1,ic[4]); } }
  if(hsh(s*9)>.5){ poly(g,[[x+w*.55,top+2],[x+w*.7,top+2],[x+w*.6,top+26]],'#140a20'); }
}
function mesaBar(g,x,yb,s){ const p=rmp(hsh(s)>.5?'#e8443a':'#f0eee6'), ch=rmp(hsh(s*3)>.5?'#e8443a':'#f0eee6');
  ell(g,x,yb,28,4,'rgba(10,6,20,.5)'); R(g,x-24,yb-30,48,5,p[4]); R(g,x-23,yb-31,46,4,p[2]); R(g,x-23,yb-31,46,1,p[0]); for(const lx of [x-18,x+16]){ R(g,lx,yb-26,3,26,p[3]); }
  const upset=hsh(s*7)>.6; for(const sx of [-1,1]){ const cx=x+sx*36; if(upset&&sx>0){ R(g,cx-10,yb-10,26,10,ch[3]); R(g,cx-10,yb-10,26,2,ch[1]); continue; } R(g,cx-8,yb-20,16,3,ch[2]); R(g,cx+(sx>0?5:-8),yb-40,3,22,ch[2]); R(g,cx-8,yb-38,16,2,ch[1]); R(g,cx-7,yb-17,2,17,ch[3]); R(g,cx+5,yb-17,2,17,ch[3]); }
  for(let k=0;k<3;k++){ if(hsh(s+k*3)>.4){ R(g,x-14+k*12,yb-44,4,12,'#3a7a3a'); R(g,x-13+k*12,yb-47,2,3,'#3a7a3a'); R(g,x-13+k*12,yb-42,1,6,'#8ad88a'); } else R(g,x-14+k*12,yb-35,8,3,'#5a8a3a'); } }
function engradado(g,x,yb,n,col){ const c=rmp(col||'#e8c03a'); for(let i=0;i<n;i++){ const y=yb-18-i*18; R(g,x,y,36,18,c[5]); R(g,x+1,y+1,34,16,c[2]); R(g,x+1,y+1,34,2,c[1]); for(let k=x+5;k<x+34;k+=7) R(g,k,y+5,4,10,'#1a1220'); } }
function lixo(g,x,yb,s){ const n=2+Math.floor(hsh(s)*4); for(let i=0;i<n;i++){ const bx=x+i*16+hsh(s+i)*8, r=12+hsh(s*3+i)*8, by=yb-r*.8; ell(g,bx,by,r+1,r*.8+1,'#0c0814'); ell(g,bx,by,r,r*.8,'#2a2638'); ell(g,bx-r*.3,by-r*.3,r*.4,r*.25,'#4a4660'); R(g,bx-2,by-r*.8-4,4,5,'#2a2638'); }
  for(let i=0;i<5;i++) R(g,x-10+hsh(s*7+i)*60,yb-3-hsh(i)*5,4+hsh(i*3)*6,2,pick(['#d8d0c0','#c84a3a','#e8c050','#7a9ad0'],hsh(s+i*5))); }
function lixeira(g,x,yb){ const c=rmp('#e86a2a'); R(g,x-1,yb-56,3,56,IRON[3]); R(g,x-12,yb-56,24,26,c[5]); R(g,x-11,yb-55,22,24,c[2]); R(g,x-11,yb-55,6,24,c[1]); R(g,x+6,yb-55,5,24,c[3]); R(g,x-12,yb-57,24,3,c[1]); R(g,x-6,yb-46,12,2,c[4]); }
function orelhao(g,x,yb){ const c=rmp('#f08a2a'), b=rmp('#2a6ab8'); R(g,x-2,yb-100,5,100,METAL[3]); R(g,x-1,yb-100,2,100,METAL[1]);
  for(let dy=0;dy<44;dy++){ const t=dy/44, hw=Math.round(26*Math.sqrt(1-(1-t)**2*.9)); R(g,x-hw-1,yb-150+dy,hw*2+2,1,c[5]); R(g,x-hw,yb-150+dy,hw*2,1,c[2]); R(g,x-hw,yb-150+dy,Math.round(hw*.6),1,c[1]); R(g,x+Math.round(hw*.4),yb-150+dy,Math.round(hw*.6),1,c[3]); }
  R(g,x-26,yb-106,52,4,c[4]); R(g,x-9,yb-136,18,26,b[2]); R(g,x-9,yb-136,18,2,b[1]); R(g,x-6,yb-130,12,6,'#c8d0e0'); for(let k=0;k<3;k++) R(g,x-6+k*5,yb-120,3,3,'#e8e8f0'); R(g,x+5,yb-126,4,14,'#1a1a2a'); }
function banco(g,x,yb){ const wd=rmp('#9a6a42'); R(g,x,yb-20,70,5,wd[2]); R(g,x,yb-20,70,1,wd[0]); R(g,x,yb-36,70,4,wd[2]); R(g,x,yb-30,70,4,wd[3]); for(const lx of [x+4,x+60]){ R(g,lx,yb-38,6,38,IRON[4]); R(g,lx+1,yb-37,4,36,IRON[2]); } }
function barricada(g,x,yb){ const wd=rmp('#b8884a'); for(const lx of [x+6,x+80]){ line(g,lx,yb,lx+10,yb-40,wd[4],4); line(g,lx+20,yb,lx+10,yb-40,wd[4],4); }
  for(let k=0;k<2;k++){ const y=yb-44+k*16; R(g,x-4,y,104,10,'#1a1020'); for(let j=0;j<104;j+=16){ poly(g,[[x-3+j,y+1],[x+5+j,y+1],[x+13+j,y+9],[x+5+j,y+9]],'#e83a3a'); poly(g,[[x+5+j,y+1],[x+13+j,y+1],[x+21+j,y+9],[x+13+j,y+9]],'#f2f2f2'); } } }
function cone(g,x,yb,fallen){ if(fallen){ poly(g,[[x-14,yb-2],[x+12,yb-8],[x+12,yb+2]],'#e8642a'); R(g,x-2,yb-6,4,8,'#f2f2f2'); return; } R(g,x-10,yb-4,20,4,'#c84a1a'); poly(g,[[x-7,yb-4],[x-2,yb-32],[x+2,yb-32],[x+7,yb-4]],'#e8642a'); R(g,x-5,yb-18,10,4,'#f2f2f2'); R(g,x-4,yb-30,2,26,'#ffa060'); }
function entulho(g,x,yb,s){ const c=rmp('#8e807e'), b=rmp('#a8583a'); ell(g,x+50,yb,70,7,'rgba(10,6,20,.45)'); for(let i=0;i<22;i++){ const bx=x+hsh(s+i)*110, w=10+hsh(s*2+i)*20, h=7+hsh(s*3+i)*12, by=yb-h-hsh(s*5+i)*Math.max(0,40-Math.abs(bx-x-55)*.7); const r=i%3?c:b;
  blob(g,bx-1,by-1,w+2,h+2,r[5]); blob(g,bx,by,w,h,r[2]); R(g,bx+1,by,w-2,2,r[1]); R(g,bx+2,by+h-2,w-3,2,r[3]); } line(g,x+20,yb-30,x+60,yb-44,'#5a5a6a',2); line(g,x+50,yb-10,x+80,yb-36,METAL[2],2); }
function conteiner(g,x,yb,col,w,label){ const c=rmp(col), h=110, y=yb-h; R(g,x-1,y-1,w+2,h+2,c[5]); R(g,x,y,w,h,c[2]); R(g,x,y,w,4,c[1]); R(g,x,y,w,1,c[0]); for(let xx=x+6;xx<x+w-4;xx+=8){ R(g,xx,y+8,3,h-14,c[3]); R(g,xx+3,y+8,1,h-14,c[1]); } R(g,x,y+h-6,w,6,c[4]);
  R(g,x+w-40,y+6,2,h-12,c[4]); R(g,x+w-22,y+6,2,h-12,c[4]); for(const yy of [y+30,y+70]) R(g,x+w-36,yy,12,4,METAL[2]);
  for(let i=0;i<6;i++) streak(g,x+10+hsh(x+i)*(w-30),y+4,10+hsh(i)*30,4,mix(c[3],'#8a4a2a',.6)); if(label) textSh(g,label,x+14,y+16,2,c[0],c[4]); }
function cabecoMid(g,x,yb){ const c=rmp('#3e3a4e'); R(g,x-10,yb-26,20,26,c[5]); R(g,x-9,yb-25,18,25,c[2]); R(g,x-9,yb-25,5,25,c[1]); R(g,x-14,yb-30,28,7,c[5]); R(g,x-13,yb-29,26,5,c[2]); R(g,x-13,yb-29,26,1,c[0]); }
function sangue(g,x,y,s,big){ const r=big?28:14; blob(g,x-r,y-r*.25,r*2,r*.5,'#3e0610'); blob(g,x-r*.7,y-r*.18,r*1.4,r*.36,'#5a0a16'); for(let i=0;i<7;i++) R(g,x-r*1.4+hsh(s+i)*r*2.8,y-r*.4+hsh(s*3+i)*r*.8,2+hsh(i)*3,2,'#4a0812');
  if(hsh(s*5)>.5){ for(let i=0;i<6;i++) R(g,x+r+i*7,y-1+Math.sin(i)*2,6,2,'#3e0610'); } }
function poca(g,x,y,w,s,lamp){ const h=Math.max(5,w*.17), P=[]; for(let k=0;k<18;k++){ const a=k/18*Math.PI*2, r=1+(hsh(s+k*2.3)-.5)*.45; P.push([x+Math.cos(a)*w/2*r,y+Math.sin(a)*h/2*r]); }
  poly(g,P.map(p=>[p[0],p[1]+2]),'#120c1c'); poly(g,P,'#262a5c'); poly(g,P.map(p=>[x+(p[0]-x)*.8,y+(p[1]-y)*.6-1]),'#2e3468');
  for(let k=0;k<4;k++){ const ry=y-h*.3+k*h*.18, rw=w*(.5-k*.08); R(g,x-rw/2+hsh(s+k)*w*.1,ry,rw,1,k%2?'#4a50a0':'#6a6ac0'); }
  R(g,x-w*.32,y-h*.32,w*.22,1,'#a8a8e8');
  if(lamp) emitW(g,g=>{ R(g,x-3,y-h*.42,5,h*.7,'#e8a050'); R(g,x-1,y-h*.36,2,h*.5,'#fff0c0'); }); }
function papel(g,x,y,s){ for(let i=0;i<4;i++) R(g,x+hsh(s+i)*60,y+hsh(s*3+i)*30,5+hsh(i)*4,3,pick(['#e8e0d0','#d8c8a0','#c8d0e0'],hsh(s+i*7))); }
function buraco(g,cx,cy,w,s){ // calçamento arrancado: terra, pedras soltas e borda quebrada
  const h=w*.26, P=[]; for(let i=0;i<24;i++){ const a=i/24*Math.PI*2, r=1+(hsh(s+i*1.7)-.5)*.32; P.push([cx+Math.cos(a)*w/2*r,cy+Math.sin(a)*h/2*r]); }
  const sc=(k,dy)=>P.map(p=>[cx+(p[0]-cx)*k,cy+(p[1]-cy)*k+(dy||0)]);
  poly(g,sc(1.08,1),'#1c1622'); poly(g,P,'#140c16');
  const Q=sc(.94,h*.18); poly(g,Q,'#4a362e'); poly(g,sc(.76,h*.26),'#62483a'); poly(g,sc(.52,h*.3),'#7a5a40'); poly(g,sc(.28,h*.32),'#8e6c4a');
  // parede de trás do buraco (sombra) e lábio iluminado na frente
  for(let i=0;i<24;i++){ const a=P[i], b=P[(i+1)%24]; if(a[1]<cy){ line(g,a[0],a[1]+1,b[0],b[1]+1,'#0c0610',3); } else { line(g,a[0],a[1],b[0],b[1],'#a89cae',2); } }
  for(let i=0;i<14;i++){ const a=hsh(s*3+i)*Math.PI*2, r=.3+hsh(s*5+i)*.5, px=cx+Math.cos(a)*w/2*r, py=cy+Math.sin(a)*h/2*r, sw=8+hsh(i+s)*10, sh=4+hsh(i*3+s)*4;
    const c=rmp(pick(['#8e8698','#9a8a80','#7a8090'],hsh(s+i*7))); R(g,px-1,py+sh-1,sw+2,3,'#140c18'); stoneDome(g,px,py,sw,sh,c,hsh(i)>.5?2:1); }
  for(let i=0;i<9;i++){ const a=hsh(s*7+i)*Math.PI*2, r=1.15+hsh(s*11+i)*.6, px=cx+Math.cos(a)*w/2*r, py=cy+Math.sin(a)*h/2*r, sw=9+hsh(i+s*2)*8, sh=5+hsh(i*5)*3;
    const c=rmp('#948ca0'); ell(g,px+sw/2,py+sh,sw*.6,2,'rgba(14,8,24,.5)'); stoneDome(g,px,py,sw,sh,c,2); }
  for(let i=0;i<6;i++) R(g,cx-w*.3+hsh(s+i*13)*w*.6,cy+hsh(s*2+i)*h*.3,2,2,'#c8a878');
}
function trilhosBonde(g,a,b){ for(const [y,h] of [[438,5],[490,6]]){ R(g,a,y-2,b-a,2,'#0e0a14'); R(g,a,y,b-a,h,'#5e586e'); R(g,a,y,b-a,1,'#d8d4e8'); R(g,a,y+1,b-a,1,'#9a96b0'); R(g,a,y+h,b-a,2,'#0e0a14');
  for(let x=Math.floor(a/90)*90;x<b;x+=90) if(hsh(x*.3+y)>.6) R(g,x,y+2,20+hsh(x)*30,1,'#8a5a3a'); } }
function pedras(g,a,b,s){ for(let x=Math.floor(a/60)*60;x<b;x+=60){ const v=hsh(x*.71+s); if(v<.55) continue; const px=x+v*40, py=ST+30+hsh(x*1.3+s)*170, k=.6+(py-ST)/190, sw=(5+hsh(x)*7)*k, sh=(3+hsh(x*3)*3)*k;
  ell(g,px+sw/2,py+sh,sw*.7,2,'rgba(14,8,24,.45)'); stoneDome(g,px,py,Math.round(sw),Math.max(2,Math.round(sh)),rmp(pick(['#9a92a8','#8a7a70','#a8a0a0'],v)),2);
  if(v>.9){ R(g,px+14,py+2,4,2,'#c8d8e8'); R(g,px+15,py+1,1,1,'#ffffff'); } } }
function bicicleta(g,x,yb,col){ const c=rmp(col||'#c83a3a'), T='#140c18'; for(const wx of [x,x+52]){ for(let a=0;a<64;a++){ const t=a/64*Math.PI*2; R(g,wx+Math.cos(t)*15,yb-15+Math.sin(t)*15,2,2,T); } for(let k=0;k<6;k++){ const t=k/6*Math.PI; line(g,wx-Math.cos(t)*13,yb-15-Math.sin(t)*13,wx+Math.cos(t)*13,yb-15+Math.sin(t)*13,'#5a566a'); } }
  line(g,x,yb-15,x+22,yb-15,c[2],3); line(g,x+22,yb-15,x+36,yb-38,c[2],3); line(g,x,yb-15,x+16,yb-38,c[2],3); line(g,x+16,yb-38,x+38,yb-38,c[2],3); line(g,x+38,yb-38,x+52,yb-15,c[2],3); line(g,x+16,yb-38,x+14,yb-46,T,2); R(g,x+8,yb-48,14,4,T); line(g,x+38,yb-38,x+42,yb-50,T,2); R(g,x+38,yb-52,12,3,T); line(g,x+16,yb-38,x+22,yb-15,c[3],2); }
function carrinho(g,x,yb,s){ const c=rmp('#e8c03a'), r=rmp('#d83a3a'); ell(g,x+40,yb,48,5,'rgba(10,6,20,.5)');
  R(g,x,yb-58,80,40,c[5]); R(g,x+1,yb-57,78,38,c[2]); R(g,x+1,yb-57,78,3,c[1]); R(g,x+6,yb-50,50,24,'#f2f0e6'); R(g,x+6,yb-50,50,2,'#ffffff'); textSh(g,hsh(s)>.5?'PIPOCA':'TAPIOCA',x+9,yb-44,1,'#c83a3a','#7a1a1a'); R(g,x+60,yb-50,14,30,GLASS[2]); R(g,x+62,yb-48,3,20,GLASS[0]);
  for(const wx of [x+14,x+64]){ ell(g,wx,yb-10,10,10,'#140c18'); ell(g,wx,yb-10,6,6,METAL[2]); ell(g,wx,yb-10,2,2,METAL[4]); }
  R(g,x+38,yb-128,3,70,METAL[3]); for(let dy=0;dy<22;dy++){ const hw=Math.round(Math.sqrt(1-(1-dy/22)**2)*52); for(let k=-hw;k<hw;k+=8) R(g,x+40+k,yb-140+dy,Math.min(8,hw-k),1,((k+64)/8)%2?r[2]:'#f6eedc'); } R(g,x-12,yb-118,104,3,r[4]);
  line(g,x-2,yb-30,x-18,yb-44,METAL[2],3); }
function moto(g,x,yb,col){ const c=rmp(col||'#3a6ab8'), T='#140c18'; ell(g,x+40,yb,44,5,'rgba(10,6,20,.5)'); for(const wx of [x+8,x+72]){ ell(g,wx,yb-14,14,14,T); ell(g,wx,yb-14,8,8,METAL[3]); ell(g,wx,yb-14,3,3,METAL[1]); }
  poly(g,[[x+10,yb-24],[x+30,yb-40],[x+60,yb-40],[x+74,yb-26],[x+50,yb-18],[x+20,yb-18]],c[5]); poly(g,[[x+12,yb-25],[x+30,yb-38],[x+58,yb-38],[x+72,yb-27],[x+50,yb-20],[x+22,yb-20]],c[2]); R(g,x+30,yb-38,28,3,c[1]);
  R(g,x+18,yb-46,26,7,'#1a1422'); R(g,x+18,yb-46,26,2,'#3a3046'); line(g,x+62,yb-38,x+66,yb-58,METAL[3],3); R(g,x+58,yb-60,18,3,T); R(g,x+70,yb-50,6,5,'#ffe8a8'); }
function onibus(g,x,yb,col,dest){ const c=rmp(col), w2=rmp('#f0eee6'), L=560, top=yb-150; ell(g,x+L/2,yb,L/2+10,7,'rgba(10,6,20,.55)');
  R(g,x-2,top-2,L+4,140,c[5]); R(g,x,top,L,136,c[2]); R(g,x,top,L,6,c[1]); R(g,x,top,L,2,c[0]); R(g,x,top+96,L,16,w2[2]); R(g,x,top+96,L,2,w2[0]); R(g,x,top+112,L,24,c[3]); R(g,x,top+130,L,6,c[4]);
  for(let k=0;k<9;k++){ const wx=x+40+k*56; R(g,wx,top+22,48,52,c[5]); R(g,wx+2,top+24,44,48,GLASS[2]); poly(g,[[wx+2,top+60],[wx+30,top+24],[wx+40,top+24],[wx+2,top+70]],GLASS[1]); R(g,wx+2,top+24,44,3,GLASS[3]);
    if(hsh(x+k)>.75){ poly(g,[[wx+10,top+34],[wx+22,top+28],[wx+30,top+44],[wx+18,top+56],[wx+6,top+48]],'#0c0616'); } if(hsh(x*3+k)>.85) emitW(g,g=>{ R(g,wx+4,top+40,40,30,'#d88a4a'); }); }
  R(g,x+L-28,top+20,26,70,GLASS[2]); R(g,x+L-26,top+22,10,60,GLASS[1]); R(g,x+L-40,top+6,36,12,'#1a1422'); emit(g,g=>textSh(g,dest||'CAIS',x+L-38,top+8,1,'#ffb040','#5a2a10'));
  R(g,x+8,top+30,22,90,c[4]); R(g,x+10,top+32,18,86,GLASS[3]);
  for(const wx of [x+90,x+L-110]){ ell(g,wx,yb-20,30,10,c[5]); ell(g,wx,yb-18,22,22,'#16121e'); ell(g,wx,yb-18,13,13,METAL[3]); ell(g,wx,yb-18,5,5,METAL[1]); }
  textSh(g,'RECIFE',x+200,top+100,2,c[3],w2[3]); for(let i=0;i<10;i++) blob(g,x+hsh(x+i)*L*.9,top+40+hsh(x*7+i)*80,10+hsh(i)*14,6,mix(c[3],'#8a4a2a',.6));
  R(g,x+L-4,top+100,6,10,'#ffe8a8'); R(g,x-2,top+100,4,12,'#c0303a'); tag(g,x+300,top+80,x); sangue(g,x+420,top+128,x,false); }
function arvore(g,x,yb,s,k){ k=k||1; const tr=rmp('#6a4e3e'), lf=[rmp('#2e6a4a'),rmp('#3a7a4a'),rmp('#4a6a3a')];
  ell(g,x,yb,60*k,8,'rgba(10,6,20,.5)'); R(g,x-40*k,yb-6,80*k,8,'#5a5266'); R(g,x-40*k,yb-6,80*k,2,'#8a8296');
  poly(g,[[x-9*k,yb-6],[x-6*k,yb-120*k],[x+6*k,yb-120*k],[x+10*k,yb-6]],tr[4]); poly(g,[[x-8*k,yb-6],[x-5*k,yb-120*k],[x+1*k,yb-120*k],[x,yb-6]],tr[2]); line(g,x,yb-90*k,x-36*k,yb-140*k,tr[3],Math.round(5*k)); line(g,x,yb-100*k,x+40*k,yb-150*k,tr[3],Math.round(5*k));
  const blobs=[]; for(let i=0;i<16;i++){ const a=hsh(s+i*3.1)*Math.PI*2, r=hsh(s*5+i)*70*k; blobs.push([x+Math.cos(a)*r*1.3,yb-170*k+Math.sin(a)*r*.6,(30+hsh(s+i)*26)*k]); }
  blobs.sort((p,q)=>p[1]-q[1]); for(const [bx,by,br] of blobs){ const l=lf[Math.floor(hsh(bx)*3)]; ell(g,bx,by,br+2,br*.8+2,l[5]); ell(g,bx,by,br,br*.8,l[3]); ell(g,bx-br*.2,by-br*.2,br*.7,br*.55,l[2]); ell(g,bx-br*.35,by-br*.35,br*.35,br*.25,l[1]);
    for(let j=0;j<5;j++) R(g,bx-br*.6+hsh(bx+j)*br*1.2,by-br*.5+hsh(by+j)*br*.8,3,2,l[0]); } }
function sacos(g,x,yb,n){ const c=rmp('#a8946a'); for(let r=0;r<3;r++) for(let i=0;i<n-r;i++){ const bx=x+i*30+r*15, by=yb-14-r*13; ell(g,bx+14,by+7,16,8,c[5]); ell(g,bx+14,by+6,15,7,c[2]); ell(g,bx+10,by+3,8,3,c[1]); R(g,bx+4,by+8,22,1,c[3]); } }
function caminhao(g,x,yb){ const c=rmp('#4a5a3a'), L=330; ell(g,x+L/2,yb,L/2+8,6,'rgba(10,6,20,.55)');
  R(g,x,yb-150,230,130,c[5]); R(g,x+2,yb-148,226,126,c[2]); for(let k=x+10;k<x+226;k+=18) R(g,k,yb-146,2,120,c[3]); R(g,x+2,yb-148,226,4,c[1]); poly(g,[[x+2,yb-148],[x+40,yb-170],[x+190,yb-170],[x+228,yb-148]],c[3]); R(g,x+40,yb-170,150,2,c[1]);
  R(g,x+232,yb-110,96,90,c[5]); R(g,x+234,yb-108,92,86,c[2]); R(g,x+234,yb-108,92,3,c[1]); R(g,x+270,yb-104,50,34,GLASS[2]); R(g,x+272,yb-102,14,28,GLASS[1]); R(g,x+234,yb-40,92,20,c[4]);
  for(const wx of [x+50,x+150,x+290]){ ell(g,wx,yb-18,22,22,'#16121e'); ell(g,wx,yb-18,12,12,METAL[3]); ell(g,wx,yb-18,4,4,METAL[1]); } R(g,x+322,yb-60,6,8,'#ffe8a8');
  textSh(g,'EXERCITO',x+60,yb-90,2,'#d8d0a0','#2a3020'); for(let i=0;i<6;i++) blob(g,x+hsh(i+x)*300,yb-140+hsh(i*3)*100,14,8,mix(c[3],'#6a4a2a',.6)); }
function destroco(g,cx,cy,w,s){ for(let i=0;i<8;i++){ const x=cx-w/2+hsh(s+i)*w, y=cy-6+hsh(s*3+i)*12, ww=10+hsh(s*5+i)*30, hh=3+hsh(i*7)*4; poly(g,[[x,y],[x+ww,y-hh*hsh(i)],[x+ww+4,y+hh],[x+2,y+hh+2]],pick(['#4a4458','#6a5a50','#8a7a70','#3a3448'],hsh(s*9+i))); }
  for(let i=0;i<5;i++) line(g,cx-w/2+hsh(s*11+i)*w,cy+hsh(i)*8,cx-w/2+hsh(s*13+i)*w+20,cy-10+hsh(i*3)*10,METAL[2],2); }
function flutuante(g,x,y,s){ const v=hsh(s); if(v<.3){ R(g,x,y-10,26,12,'#8a6440'); R(g,x,y-10,26,2,'#b08a5a'); R(g,x+12,y-10,2,12,'#5a3e28'); }
  else if(v<.55){ ell(g,x,y-4,14,6,'#e8e2d8'); ell(g,x,y-4,8,3,'#26306a'); R(g,x-14,y-6,6,3,'#d83a3a'); R(g,x+8,y-6,6,3,'#d83a3a'); }
  else if(v<.8){ poly(g,[[x-30,y],[x-20,y-14],[x+34,y-14],[x+40,y]],'#3a6ab8'); poly(g,[[x-30,y],[x-20,y-14],[x+34,y-14],[x+40,y]].map(p=>[p[0],p[1]+3]),'#1a1428'); R(g,x-20,y-14,54,3,'#f0f0f0'); }
  else { ell(g,x,y-3,20,4,'#2a2638'); ell(g,x-6,y-5,8,3,'#4a4660'); }
  R(g,x-24,y+2,48,1,'#8a90d0'); R(g,x-16,y+5,32,1,'#4a52a0'); }
function bandeirinhas(g,a,b,y,span,sagv,s){ for(let x=Math.floor(a/span)*span;x<b;x+=span){ const cols=['#e83a3a','#ffd23f','#3a8ae8','#4ac860','#ff8ad0','#ff8a3a','#ffffff'];
  sag(g,x,y,x+span,y,sagv,'#1a1024',1,(px,py,i)=>{ if(i%14===4){ const cc=rmp(pick(cols,hsh(px*.37+s))); poly(g,[[px-5,py+1],[px+5,py+1],[px,py+13]],cc[4]); poly(g,[[px-4,py+1],[px+4,py+1],[px,py+11]],cc[2]); R(g,px-4,py+1,8,1,cc[0]); } }); } }
function varalLuz(g,a,b,y,span,sagv){ for(let x=Math.floor(a/span)*span;x<b;x+=span){ sag(g,x,y,x+span,y,sagv,'#140c1c',1,(px,py,i)=>{ if(i%26===13){ const cc=pick(['#ffd23f','#ff6a8a','#6ae8ff','#fff2c0'],hsh(px*.11)); R(g,px-2,py+1,4,3,'#2a2232'); emitW(g,g=>{ ell(g,px,py+6,3,4,cc); R(g,px-1,py+4,1,2,'#ffffff'); }); glow(g,px,py+6,16,cc,.06,3); reg(BULBS,{x:px/RS,y:(py+6)/RS,c:cc}); } }); } }
function fios(g,a,b,s){ for(let x=Math.floor(a/420)*420;x<b;x+=420){ const y0=110+hsh(x*.3+s)*70, y1=110+hsh((x+420)*.3+s)*70; sag(g,x,y0,x+420,y1,26+hsh(x)*20,'#120a1a'); sag(g,x,y0+6,x+420,y1+10,32+hsh(x*7)*14,'#120a1a'); if(hsh(x*3)>.55){ sag(g,x+200,y0+20,x+260,HB-120,30,'#120a1a'); } } }

/* ---------- passe 2: volume, desgaste, chão, camadas ---------- */
function umidade(g,x,y,w,h,c,s){ // mancha de umidade escorrendo de uma cornija/peitoril, borda de baixo irregular
  const col=mix(c[4],'#2a4a3a',.35); g.save(); for(let k=0;k<3;k++){ g.globalAlpha=.28+k*.1; const ww=w*(1-k*.25), xx=x+(w-ww)/2;
    for(let i=0;i<ww;i+=3){ const hh=h*(1-k*.3)*(.45+hsh(s+i*.37+k)*.55); R(g,xx+i,y,3,hh,col); } } g.restore(); R(g,x,y,w,2,c[4]); }
function limo(g,x,y,w,c,s){ g.save(); for(let i=0;i<w;i+=2){ const hh=6+hsh(s+i*.29)*26*(.5+.5*Math.sin(i/23+s)); g.globalAlpha=.6; R(g,x+i,y-hh,2,hh,'#2e4a34'); g.globalAlpha=.3; if(hh>10) R(g,x+i,y-hh-2,2,2,'#4a7a44'); } g.restore(); }
function reboco(g,x,y,w,h,c,s){ // reboco caído: borda clara quebrada, tijolo, sombra
  const P=[]; for(let i=0;i<14;i++){ const a=i/14*Math.PI*2, r=1+(hsh(s+i*1.9)-.5)*.5; P.push([x+w/2+Math.cos(a)*w/2*r,y+h/2+Math.sin(a)*h/2*r]); }
  poly(g,P.map(p=>[p[0]-1,p[1]-2]),c[1]); poly(g,P.map(p=>[p[0]+1,p[1]+2]),c[4]); g.save(); g.beginPath(); g.moveTo(P[0][0],P[0][1]); P.forEach(p=>g.lineTo(p[0],p[1])); g.closePath(); g.clip(); brick(g,x-4,y-4,w+8,h+8,s,mix('#8a5040',c[3],.45)); shade(g,x-4,y-4,w+8,6,'#100624',.35); g.restore(); }
function sideWall(g,x,top,w,dir,c){ // lateral do volume que avança (tom escuro) + sombra projetada no vizinho recuado
  const sx=dir>0?x:x-w; R(g,sx,top,w,HB-top,c[4]); R(g,sx,top,w,3,c[3]); R(g,dir>0?sx:sx+w-2,top,2,HB-top,c[3]); R(g,dir>0?sx+w-1:sx,top,1,HB-top,c[5]);
  for(let y=top+30;y<HB-20;y+=62){ R(g,sx+3,y,w-6,22,c[5]); R(g,sx+4,y+1,w-8,2,c[4]); }
  R(g,sx,HB-14,w,14,c[5]); shade(g,dir>0?x+w:x-w-34,top+8,34,HB-top-8,'#100624',.28); shade(g,dir>0?x+w:x-w-16,top+8,16,HB-top-8,'#100624',.18); }
function manchasChao(g,a,b,y0,s){ // grandes variações de tom: sujeira, umidade, desgaste
  g.save(); for(let k=Math.floor(a/220)-2;k<b/220+2;k++){ const v=hsh(k*3.7+s), cx=k*220+hsh(k*1.9+s)*200, cy=y0+20+hsh(k*5.3+s)*(HH-y0-40), rx=90+v*170, ry=rx*.2;
    g.globalAlpha=v>.5?.13:.09; ell(g,cx,cy,rx,ry,v>.5?'#140a26':'#ffe8c0'); g.globalAlpha=.08; ell(g,cx+rx*.2,cy,rx*.6,ry*.6,v>.5?'#140a26':'#ffe8c0'); } g.restore(); }
function reflexoLuz(g,x,y0,y1,col){ for(let y=y0;y<y1;y+=3){ const v=hsh(x*.7+y*1.3), d=(y-y0)/(y1-y0), w=(3+v*10)*(1-d*.6); if(v>.2) R(g,x-w/2+Math.sin(y*.37)*4,y,w,1,d<.5?col:mix(col,'#5a4a8a',.5)); } }
function racha(g,cx,cy,w,s){ // rachadura enorme com lascas deslocadas
  let x=cx-w/2, y=cy; const pts=[]; while(x<cx+w/2){ pts.push([x,y]); x+=8+hsh(x*.3+s)*14; y=cy+Math.sin(x*.02+s)*10+(hsh(x+s)-.5)*8; }
  for(let i=0;i+1<pts.length;i++){ const [x0,y0]=pts[i], [x1,y1]=pts[i+1]; poly(g,[[x0,y0-3],[x1,y1-3],[x1,y1+4],[x0,y0+4]],'#0c0614'); line(g,x0,y0+4,x1,y1+4,'#a89cae'); line(g,x0,y0-4,x1,y1-4,'#2a2034');
    if(hsh(i+s)>.7){ let bx=x0, by=y0; for(let j=0;j<20;j++){ R(g,bx,by,2,1,'#140a1c'); bx+=2; by+=hsh(j+i+s)>.5?1:-1; } } }
  for(let i=0;i<10;i++){ const p=pts[Math.floor(hsh(s*3+i)*pts.length)]; stoneDome(g,p[0]+(hsh(i)-.5)*30,p[1]+8+hsh(i*3)*12,8+hsh(i*5)*8,4+hsh(i*7)*3,rmp('#948ca0'),2); } }
function pocaGrande(g,x,y,w,s){ poca(g,x,y,w,s,true); emitW(g,g=>{ reflexoLuz(g,x-w*.15,y-w*.05,y+w*.07,'#f0b060'); }); }
function capotado(g,x,yb,col){ ell(g,x+150,yb,170,8,'rgba(10,6,20,.55)'); g.save(); g.translate(0,2*yb-106); g.scale(1,-1); carro(g,x,yb,col,{broken:true}); g.restore();
  for(let i=0;i<8;i++) R(g,x+20+hsh(x+i)*260,yb-2-hsh(i)*4,4,2,'#c8d8e8'); blob(g,x+120,yb-6,40,6,'#2a1a1a'); }
function tenda(g,x,yb,s){ const c=rmp(hsh(s)>.5?'#e8e4dc':'#5a8ad0'); ell(g,x+70,yb,90,7,'rgba(10,6,20,.5)');
  poly(g,[[x-6,yb],[x+70,yb-96],[x+146,yb]],c[5]); poly(g,[[x-4,yb],[x+70,yb-92],[x+70,yb]],c[2]); poly(g,[[x+70,yb-92],[x+144,yb],[x+70,yb]],c[3]); line(g,x+70,yb-92,x+70,yb,c[4],2);
  poly(g,[[x+52,yb],[x+70,yb-50],[x+88,yb]],'#140a1e'); R(g,x+30,yb-60,24,24,'#f2f2f2'); R(g,x+39,yb-56,6,16,'#d8283a'); R(g,x+34,yb-51,16,6,'#d8283a');
  line(g,x-6,yb,x-30,yb+4,'#2a2030'); line(g,x+146,yb,x+170,yb+4,'#2a2030'); for(let i=0;i<4;i++) line(g,x+10+i*30,yb-10-i*20,x+10+i*30+4,yb-6-i*20,c[4]); }
function palmMid(g,x,yb,k){ const tr=rmp('#a8988a'), lf=rmp('#3e8a52'), top=yb-250*k;
  for(let y=top+20;y<yb;y+=2){ const xx=x+Math.round(Math.sin((y-top)/90)*6*k), w=Math.round((7+(y-top)/(yb-top)*5)*k); R(g,xx-w/2-1,y,w+2,2,tr[5]); R(g,xx-w/2,y,w,2,tr[2]); R(g,xx-w/2,y,Math.max(1,w*.35),2,tr[1]); if(y%10===0) R(g,xx-w/2,y,w,1,tr[4]); }
  R(g,x-7*k,top+6,14*k,24*k,'#4e7a3e');
  for(let j=0;j<10;j++){ const a=-Math.PI+j*(Math.PI/9)+(hsh(j+x)-.5)*.2, len=(70+hsh(j*3+x)*30)*k; for(let r=0;r<len;r+=2){ const px=x+Math.cos(a)*r, py=top+14*k+Math.sin(a)*r*.5+r*r/(160*k); R(g,px-1,py-1,3,3,lf[5]); const L=Math.max(0,(1-r/len)*14*k); line(g,px,py,px-2,py+L,(r/2)%3?lf[2]:lf[1]); line(g,px,py,px+2,py+L,lf[3]); } } }
function quiosque(g,x,yb){ const c=rmp('#2f8a6a'), w2=rmp('#efe6d2'); ell(g,x+60,yb,76,7,'rgba(10,6,20,.5)'); R(g,x,yb-80,120,80,c[5]); R(g,x+2,yb-78,116,76,c[2]); R(g,x+2,yb-78,116,3,c[1]); R(g,x+10,yb-70,100,34,'#140a1e'); emitW(g,g=>{ R(g,x+12,yb-68,96,30,'#c8783a'); R(g,x+14,yb-66,40,10,'#f0b060'); });
  for(let k=0;k<5;k++) R(g,x+14+k*20,yb-50,10,12,pick(['#e84a3a','#ffd23f','#3a8ae8','#f2f2f2','#4ac860'],k/5)); R(g,x+2,yb-36,116,4,w2[2]);
  poly(g,[[x-14,yb-80],[x+60,yb-110],[x+134,yb-80]],c[5]); poly(g,[[x-12,yb-81],[x+60,yb-108],[x+132,yb-81]],w2[2]); poly(g,[[x+60,yb-108],[x+132,yb-81],[x+60,yb-81]],w2[3]); emit(g,g=>textSh(g,'CALDO DE CANA',x+12,yb-96,1,'#d8283a','#5a1018')); glow(g,x+60,yb-50,90,'#ffa040',.04,3); }
function barcoEncalhado(g,x,yb){ const c=rmp('#3a6ab8'), w2=rmp('#f0eee6'); ell(g,x+120,yb,140,8,'rgba(10,6,20,.5)'); g.save(); g.translate(x+120,yb); g.rotate(-.12);
  poly(g,[[-120,-10],[-100,-58],[130,-58],[118,-6],[90,6],[-90,6]],c[5]); poly(g,[[-116,-12],[-98,-55],[128,-55],[116,-8],[88,4],[-88,4]],c[2]); R(g,-98,-55,226,8,w2[2]); R(g,-98,-55,226,2,w2[0]); R(g,-90,-30,200,4,c[4]);
  R(g,-40,-100,90,45,w2[3]); R(g,-38,-98,86,41,w2[2]); for(let k=0;k<4;k++) R(g,-32+k*20,-90,12,12,GLASS[2]); textSh(g,'MARIA',-20,-44,2,w2[0],c[4]); R(g,10,-150,4,50,'#3a3040'); poly(g,[[14,-150],[60,-130],[14,-118]],'#d83a3a');
  g.restore(); for(let i=0;i<6;i++) blob(g,x+hsh(i+x)*240,yb-30+hsh(i*3)*20,14,6,'#2e4a34'); }
function arrecife(g,a,b,y){ R(g,a,y,b-a,4,'#2a2640'); for(let x=Math.floor(a/10)*10;x<b;x+=10) blob(g,x,y-3+hsh(x*.7)*3,10,6,hsh(x)>.5?'#363250':'#2e2a46'); for(let x=Math.floor(a/30)*30;x<b;x+=30) if(hsh(x*1.3)>.6) R(g,x,y+5,14+hsh(x)*10,1,'#8a8ac8'); }
function farol(g,x,y){ const w=rmp('#e8e4dc'), r=rmp('#c83a3a'); R(g,x-14,y-8,28,8,'#3a3450'); poly(g,[[x-9,y-8],[x-6,y-86],[x+6,y-86],[x+9,y-8]],w[3]); poly(g,[[x-9,y-8],[x-6,y-86],[x,y-86],[x,y-8]],w[2]);
  for(let k=0;k<3;k++){ const yy=y-26-k*22; poly(g,[[x-8+k,yy],[x-7+k,yy-8],[x+7-k,yy-8],[x+8-k,yy]],r[2]); } R(g,x-9,y-92,18,6,'#2a2436'); R(g,x-6,y-104,12,12,'#2a2436'); emitW(g,g=>{ R(g,x-4,y-102,8,8,'#fff2c0'); }); poly(g,[[x-8,y-104],[x,y-112],[x+8,y-104]],r[3]);
  glow(g,x,y-98,40,'#fff0b0',.06,4); emitW(g,g=>{ g.save(); g.globalAlpha=.1; poly(g,[[x,y-100],[x+260,y-130],[x+260,y-76]],'#fff0c0'); g.restore(); }); }
function navio(g,x,y){ const c='#1e1c38', c2='#28264a'; g.save(); g.translate(x,y); g.rotate(.06); poly(g,[[-160,-4],[-140,-40],[170,-40],[150,6],[-150,6]],c); R(g,-140,-40,310,3,'#3a3866'); for(let k=0;k<6;k++) R(g,-110+k*44,-66,36,26,pick(['#3a2a3a','#2a3a4a','#4a2a2a'],k/6));
  R(g,100,-90,50,50,c2); R(g,104,-86,42,6,'#3a3866'); for(let k=0;k<3;k++) R(g,108+k*13,-76,8,6,'#14122a'); R(g,-60,-120,4,80,c2); line(g,-58,-120,10,-70,c2,2); R(g,130,-120,6,30,c2); g.restore(); const X=x,Y=y; emitW(g,g=>{ R(g,X+112,Y-68,4,4,'#f0b060'); R(g,X+124,Y-68,4,4,'#f0b060'); R(g,X+132,Y-118,3,3,'#ff3a3a'); }); reflexo(g,x+100,y+8,HB-6,'#3a3a7a',40); }
function acidentes(X0,X1,s,kinds){ for(let x=X0,i=0;x<X1-200;x+=960,i++){ const k=pick(kinds,hsh(s*1.7+i*3.1)), cx=x+200+hsh(s+i*5.3)*560, cy=410+hsh(s*2.3+i)*70;
  if(k==='buraco'){ const w=190+hsh(i+s)*90; add(cx-w,cx+w,4,g=>buraco(g,cx,cy,w,s+i)); }
  else if(k==='racha'){ const w=420+hsh(i*3+s)*200; add(cx-w/2-40,cx+w/2+40,4,g=>racha(g,cx,cy,w,s+i)); }
  else if(k==='poca'){ const w=200+hsh(i*7+s)*80; add(cx-w,cx+w,4,g=>pocaGrande(g,cx,cy,w,s+i)); }
  else if(k==='sangue'){ add(cx-120,cx+160,4,g=>{ sangue(g,cx,cy,s+i,true); sangue(g,cx+60,cy+14,s+i*3,true); for(let j=0;j<10;j++) R(g,cx-80+j*16,cy+6+Math.sin(j)*3,10,3,'#4a0812'); }); } } }
function borda(X0,X1,s,kinds){ for(let x=X0,i=0;x<X1-300;x+=960,i++){ const k=pick(kinds,hsh(s*3.9+i*1.3)), px=x+120+hsh(s*5+i*2.1)*500, yb=HB+70;
  if(k==='capotado') add(px-20,px+340,5,g=>capotado(g,px,yb,pick(['#c8c0b0','#8a3a3a','#3a6ab8','#5a8a4a'],hsh(i+s))));
  else if(k==='carro') add(px-20,px+320,5,g=>carro(g,px,yb-2,pick(['#d8d0c0','#c83a3a','#3a5a9a','#e8c03a'],hsh(i*3+s)),{broken:hsh(i)>.5,open:hsh(i*5)>.6,blood:hsh(i*7)>.5}));
  else if(k==='barricada') add(px-20,px+260,5,g=>{ barricada(g,px,yb-6); sacos(g,px+110,yb-2,4); cone(g,px+250,yb-2); });
  else if(k==='entulho') add(px-40,px+260,5,g=>{ entulho(g,px,yb,s+i); entulho(g,px+90,yb-6,s+i*3); destroco(g,px+120,yb+4,180,s+i); });
  else if(k==='barraca') add(px-20,px+180,5,g=>barraca(g,px,yb-8,pick(['#e84a3a','#3a8ae8','#4ac860','#ffd23f'],hsh(i+s)),i));
  else if(k==='tenda') add(px-40,px+200,5,g=>tenda(g,px,yb-6,s+i));
  else if(k==='lixo') add(px-30,px+160,5,g=>{ lixo(g,px,yb-4,s+i); lixo(g,px+60,yb,s+i*7); engradado(g,px+120,yb-4,2,'#3a8ae8'); });
  else if(k==='conteiner') add(px-10,px+270,5,g=>conteiner(g,px,yb-8,pick(['#c84a3a','#3a7ab8','#4a8a4a','#e8a03a'],hsh(i+s)),250)); } }

/* ---------- v2: marcos e mobiliário fiéis às fotos ---------- */
const SIL='#150d22', SILM='#22183a', RIM='#5a4a8e';
function fgCarcaca(g,w){ const y=HH-96; poly(g,[[0,HH],[0,y+20],[40,y],[w-60,y+6],[w,y+40],[w,HH]],SIL); R(g,40,y,w-100,2,RIM); poly(g,[[60,y+8],[140,y-36],[w-120,y-36],[w-80,y+8]],SIL); line(g,140,y-36,w-120,y-36,RIM,2);
  ell(g,90,HH-6,40,40,SILM); ell(g,90,HH-6,26,26,SIL); R(g,w-40,y+26,16,8,'#3a2030'); }
function fgPlaca(g,w,txt){ R(g,w/2-3,60,6,HH-60,SIL); R(g,w/2-3,60,1,HH-60,RIM); R(g,w/2-50,70,100,28,'#1a3a6a'); R(g,w/2-50,70,100,2,'#4a6aa0'); R(g,w/2-48,72,96,24,'#22488a'); text(g,txt,w/2-tw(txt,1)/2,80,1,'#e8e8f0'); R(g,w/2-6,HH-20,12,20,SIL); }
/* ---------- fundo distante mais rico ---------- */
/* ---------- passe 3: chão como superfície única ---------- */
function luzRua(g,a,b,y0,X0,step,phase){ // escurece entre os postes (sombra fria) e na borda da frente
  for(let x=Math.floor(a/6)*6;x<b;x+=6){ let d=1; if(step){ const u=(((x-X0-phase)%step)+step)%step; d=Math.min(u,step-u)/(step/2); } const al=.30*Math.pow(d,1.4);
    if(al>.02) shade(g,x,y0,6,HH-y0,'#0a0626',al); }
  for(let i=0;i<8;i++) shade(g,a,HH-90+i*11,b-a,11,'#08041e',.05+i*.035);
  shade(g,a,y0,b-a,8,'#08041e',.22); }
function fissuraLonga(g,x0,y0,len,s){ let x=x0, y=y0; const dir=hsh(s)>.5?1:-1; g.fillStyle='#0a0612';
  while(x<x0+len){ const t=hsh(x*.13+s); const nx=x+6+t*10, ny=Math.max(ST+20,Math.min(HH-10,y+(hsh(x+s*3)-.5)*6+dir*.6)); line(g,x,y,nx,ny,'#0a0612',(ny>460)?3:2); line(g,x,y+((ny>460)?3:2),nx,ny+((ny>460)?3:2),'#b0a4b8');
    if(t>.9){ let bx=nx, by=ny; for(let j=0;j<16;j++){ R(g,bx,by,1,1,'#120a1a'); bx+=1; by+=hsh(j+x)>.4?1:-1; } } x=nx; y=ny; } }
function remendo(g,cx,cy,w,s){ const h=w*.28, P=[]; for(let i=0;i<10;i++){ const a=i/10*Math.PI*2, r=1+(hsh(s+i)-.5)*.3; P.push([cx+Math.cos(a)*w/2*r,cy+Math.sin(a)*h/2*r]); }
  const c=rmp(hsh(s*3)>.5?'#8a8478':'#4a4858'); poly(g,P.map(p=>[p[0],p[1]+2]),'#120a1a'); poly(g,P,c[2]); poly(g,P.map(p=>[cx+(p[0]-cx)*.7,cy+(p[1]-cy)*.6-2]),c[1]);
  for(let i=0;i<w/6;i++) R(g,cx-w*.4+hsh(s+i*3)*w*.8,cy-h*.3+hsh(s*5+i)*h*.6,2,1,hsh(i)>.5?c[3]:c[0]); }
function placas(g,x,y,n,s){ // trecho de lajes de granito no meio do calçamento
  const c=rmp('#a8a0a8'); for(let i=0;i<n;i++){ const h=18+(y-ST)*.08, w=h*2.6; slab(g,x+i*(w+2),y,w,h,c,hsh(s+i)>.5?2:1,hsh(s*7+i)); } }
function bueiro(g,x,y){ const k=.6+(y-ST)/190*.8, rx=30*k, ry=9*k; ell(g,x,y+2,rx+3,ry+2,'#0e0a16'); ell(g,x,y,rx,ry,'#46424e'); ell(g,x,y-1,rx*.8,ry*.7,'#36323e'); for(let j=-rx*.7;j<=rx*.7;j+=6*k) R(g,x+j,y-ry*.6,Math.max(1,2*k),ry*1.2,'#24202c'); R(g,x-rx*.8,y-ry*.75,rx*1.2,1,'#8a8696'); }
function faixaApagada(g,x0,y0){ for(let j=0;j<7;j++){ const y=y0, h=10+(y-ST)*.04; for(let r=0;r<5;r++){ const yy=y+r*(h+4), xx=x0+j*48+(yy-ST)*.3; g.save(); g.globalAlpha=.35+hsh(j*3+r)*.3; R(g,xx,yy,28+(yy-ST)*.06,h,'#d8d4c8'); g.restore(); } } }
function folhas(g,x,y,s){ for(let i=0;i<14;i++){ const px=x+hsh(s+i)*120, py=y+hsh(s*3+i)*40, c=pick(['#8a6a2a','#a8783a','#6a7a3a','#c89a4a','#e8e0d0'],hsh(s*5+i)); R(g,px,py,4,2,c); R(g,px+1,py+2,2,1,mix(c,'#000000',.4)); } }
function pedrasGrupo(g,x,y,s){ const k=.6+(y-ST)/190*.9; for(let i=0;i<9;i++){ const px=x+hsh(s+i)*90*k, py=y+hsh(s*3+i)*24*k, sw=(8+hsh(i+s)*8)*k, sh=(4+hsh(i*3+s)*4)*k; ell(g,px+sw/2,py+sh,sw*.7,2,'rgba(10,6,20,.5)'); stoneDome(g,px,py,Math.round(sw),Math.max(2,Math.round(sh)),rmp('#9a92a8'),hsh(i)>.5?2:1); } }
function chaoExtras(X0,X1,s,o={}){ const L=X1-X0;
  for(let i=0;i<2;i++){ const x0=X0+hsh(s*13+i)*(L-2200), y0=390+hsh(s*17+i)*90, len=1400+hsh(s*19+i)*900; add(x0-10,x0+len+10,4,g=>fissuraLonga(g,x0,y0,len,s+i)); }
  for(let x=X0,i=0;x<X1-200;x+=480,i++){ const v=hsh(s*2.9+i*1.7), cx=x+60+hsh(s+i*7.1)*360, cy=380+hsh(s*1.3+i)*120;
    if(v<.18&&o.patch!==false) add(cx-120,cx+120,4,g=>remendo(g,cx,cy,140+hsh(i)*90,s+i));
    else if(v<.32&&o.slabs!==false) add(cx-10,cx+260,4,g=>placas(g,cx,cy,3+Math.floor(hsh(i*3)*3),s+i));
    else if(v<.46) add(cx-50,cx+50,4,g=>bueiro(g,cx,cy));
    else if(v<.56&&o.faixa!==false) add(cx-10,cx+420,4,g=>faixaApagada(g,cx,cy-20));
    else if(v<.78) add(cx-10,cx+140,4,g=>folhas(g,cx,cy,s+i));
    else add(cx-10,cx+140,4,g=>pedrasGrupo(g,cx,cy,s+i)); } }
function vasoPalmeira(g,x,yb,k){ const c=rmp('#b8ae9e'); palmMid(g,x,yb-34,k); R(g,x-34,yb-38,68,38,c[5]); R(g,x-32,yb-36,64,36,c[2]); R(g,x-32,yb-36,64,4,c[0]); R(g,x-32,yb-36,14,36,c[1]); R(g,x+16,yb-36,16,36,c[4]); R(g,x-36,yb-40,72,6,c[1]); R(g,x-36,yb-40,72,1,c[0]); R(g,x-30,yb-30,60,4,'#3a2a20'); ell(g,x,yb,44,6,'rgba(10,6,20,.5)'); }

/* ---------- silhuetas do primeiro plano com forma ---------- */
function silGrad(g,x,y,w,h){ const n=6; for(let i=0;i<n;i++) R(g,x,y+i*h/n,w,h/n+1,mix('#2a1e44','#0c0618',i/(n-1))); }
function fgGrade(g,w){ const y0=HH-86; g.save(); g.beginPath();
  g.rect(0,y0,w,5); g.rect(0,HH-16,w,16); g.rect(0,y0+40,w,3);
  for(let x=6;x<w;x+=16){ g.rect(x,y0,4,86); g.moveTo(x+2,y0-16); g.lineTo(x+7,y0-2); g.lineTo(x-3,y0-2); }
  for(let x=14;x<w;x+=32){ g.moveTo(x+18,y0+22); g.arc(x+8,y0+22,10,0,Math.PI*2); g.moveTo(x+14,y0+22); g.arc(x+8,y0+22,6,0,Math.PI*2,true); g.moveTo(x+16,y0+62); g.arc(x+8,y0+62,8,0,Math.PI*2); g.moveTo(x+12,y0+62); g.arc(x+8,y0+62,4,0,Math.PI*2,true); }
  g.clip('evenodd'); silGrad(g,0,y0-20,w,HH-y0+20); g.restore();
  for(let x=6;x<w;x+=16){ R(g,x,y0,1,86,RIM); R(g,x+1,y0-12,1,8,RIM); } R(g,0,y0,w,1,RIM); R(g,0,y0+40,w,1,RIM); }
function fgPlanta(g,w){ g.save(); g.beginPath(); const leaf=(x0,y0,a,len,wd)=>{ const px=x0+Math.cos(a)*len, py=y0+Math.sin(a)*len, nx=-Math.sin(a), ny=Math.cos(a);
    g.moveTo(x0,y0); g.quadraticCurveTo((x0+px)/2+nx*wd,(y0+py)/2+ny*wd,px,py); g.quadraticCurveTo((x0+px)/2-nx*wd,(y0+py)/2-ny*wd,x0,y0); };
  for(let i=0;i<13;i++){ const a=-Math.PI*(.12+hsh(i*3.1)*.76), len=80+hsh(i*7.7)*130; leaf(w/2+(hsh(i)-.5)*70,HH+4,a,len,14+hsh(i*5)*14); }
  for(let i=0;i<5;i++){ const a=-Math.PI*(.25+i*.12); leaf(w*.2,HH,a,70+i*10,22); }
  g.clip(); silGrad(g,0,HH-230,w,232); g.restore();
  for(let i=0;i<13;i++){ const a=-Math.PI*(.12+hsh(i*3.1)*.76), len=80+hsh(i*7.7)*130, x0=w/2+(hsh(i)-.5)*70; for(let r=10;r<len*.9;r+=3) R(g,x0+Math.cos(a)*r,HH+4+Math.sin(a)*r,1,1,r<len*.5?'#3a2e5a':RIM); } }
function fgBarril(g,w){ for(const [x,s,lab] of [[34,1,'OLEO'],[88,1.1,'AGUA']]){ const t=HH-72*s, bw=40*s; g.save(); g.beginPath(); g.rect(x-bw/2,t,bw,72*s); g.clip(); for(let i=0;i<bw;i+=2){ const u=i/bw; R(g,x-bw/2+i,t,2,72*s,mix(RIM,'#0c0618',Math.min(1,Math.abs(u-.25)*2.2))); } g.restore();
  for(const yy of [t+10*s,t+44*s]){ R(g,x-bw/2-1,yy,bw+2,4,'#0c0618'); R(g,x-bw/2,yy,bw*.4,1,RIM); } R(g,x-bw/2+4,t+20*s,bw-8,16*s,'#3a2a20'); text(g,lab,x-tw(lab,1)/2,t+24*s,1,'#8a6a4a');
  ell(g,x,t,bw/2,5,'#1c1430'); ell(g,x,t,bw/2-3,3,'#0c0618'); R(g,x-bw/2+3,t-2,bw*.4,1,RIM); } }

/* =====================================================================
   COMPOSIÇÃO POR ÁREA
   ===================================================================== */
function casarioRow(X0,X1,style,seed){ let x=X0, i=0; const vol=[];
  while(x<X1-120){ const s=seed+i*13.7+x*.01, w0=style==='bj'?Math.round(128+hsh(s)*84):Math.round(150+hsh(s)*130), w=X1-x-w0<130?X1-x:Math.min(w0,X1-x); const v=hsh(s*2.3), xx=x;
    if(style==='eclet'){ const o={seed:s,col:pick(['#eadcb0','#e8c050','#f0e6d0','#e09a8a','#e8a8c0','#9ac8b0','#e6c8a0','#a8c0e0','#d8a060'],hsh(s*7)),fl:v>.5?3:2,par:pick(['balaustre','reta','curva'],hsh(s*3)),dome:v<.5&&hsh(s*5)>.35?pick(['l','r','c'],hsh(s*9)):null,domeC:pick(['#4f8a7a','#5a5a78','#8a5a4a'],hsh(s*11))}; add(xx,xx+w,1,g=>ecletico(g,xx,w,o)); }
    else if(style==='bj'){ // Rua do Bom Jesus: sobrados estreitos de 3–4 pavimentos, cores vivas, sacadas de ferro corridas
      const fl=v>.45?4:3, o={seed:s,col:pick(BJ,hsh(s*7)),fl,uH:fl===4?62:78,pH:fl===4?22:28,par:pick(['reta','balaustre','reta','curva','reta'],hsh(s*3)),pinhas:hsh(s*5)>.5,
        tile:hsh(s*13)>.8?pick([['#e8eef8','#2a5ab0'],['#f2ead8','#2a8a6a']],hsh(s*17)):null, shut:pick(['#2f7a5a','#2f5aa0','#a83a3a','#3a8a8a','#e8e4d8'],hsh(s*2.1)),
        shop:hsh(s*19)>.45, sign:hsh(s*23)>.55?pick(LOJAS,hsh(s*29)):null, awning:hsh(s*31)>.72?[pick(['#e84a3a','#3a8ae8','#4ac860','#e8a03a'],hsh(s*37)),'#f6eedc']:null, lamp:hsh(s*41)>.45, longBalc:hsh(s*43)>.45, balc:hsh(s*44)>.55, arch:hsh(s*47)>.35};
      add(xx,xx+w,1,g=>sobrado(g,xx,w,o)); }
    else { const dark=style==='dark'||style==='bar'; let col=pick(CASA,hsh(s*7)); if(dark) col=mix(col,'#5a4a6a',style==='bar'?.25:.38);
      const o={seed:s,col,fl:v>.55?3:2,par:pick(['reta','curva','beiral','balaustre','reta','escalonada'],hsh(s*3)),pinhas:hsh(s*5)>.6,tile:!dark&&hsh(s*13)>.72?pick([['#e8eef8','#2a5ab0'],['#f2ead8','#2a8a6a'],['#e8e0f0','#7a3a9a'],['#f8e8d0','#c85a2a']],hsh(s*17)):null,
        dark, shop:style==='bar'||hsh(s*19)>.55, sign:(style==='bar'?(hsh(s*23)>.3?pick(BARES,hsh(s*29)):null):(hsh(s*23)>.5?pick(LOJAS,hsh(s*29)):null)), awning:hsh(s*31)>(style==='bar'?.45:.7)?[pick(['#e84a3a','#3a8ae8','#4ac860','#e8a03a'],hsh(s*37)),'#f6eedc']:null, lamp:hsh(s*41)>.5, longBalc:hsh(s*43)>.7, arch:hsh(s*47)>.6};
      if(style==='bar'&&o.sign&&hsh(s*53)>.4){ o.neon=o.sign; o.sign=null; }
      add(xx,xx+w,1,g=>{ sobrado(g,xx,w,o); if(o.neon) neon(g,xx+w/2-tw(o.neon,2)/2-7,HB-150,o.neon,pick(['#ff4a8a','#4ae8ff','#ffd23f','#8aff6a'],hsh(o.seed*59))); }); }
    vol.push({x:xx,w,top:style==='eclet'?HB-96-((v>.5?3:2)-1)*74-40:style==='bj'?(v>.45?HB-96-3*62-22:HB-96-2*78-28):HB-96-((v>.55?3:2)-1)*78-30,d:hsh(s*61)>.5?1:0,col:style==='eclet'?null:null,s}); x+=w; i++; }
  for(let k=0;k+1<vol.length;k++){ const A=vol[k], B=vol[k+1]; if(A.d===B.d) continue; const c=rmp(style==='dark'||style==='bar'?'#6a5a7a':'#a89a96');
    if(A.d>B.d){ const X=B.x, T=Math.max(A.top,0); add(X-2,X+60,1,g=>sideWall(g,X,T,12,1,c)); } else { const X=B.x, T=Math.max(B.top,0); add(X-60,X+2,1,g=>sideWall(g,X,T,12,-1,c)); } }
  for(const A of vol) if(!A.d){ const X=A.x, Wd=A.w, T=A.top; add(X,X+Wd,1,g=>shade(g,X,T,Wd,HB-T,'#100624',.12)); }
}
function lampRow(X0,X1,step,dbl,phase,kind){ add(X0,X1,4,(g,lo,hi)=>luzRua(g,Math.max(lo,X0),Math.min(hi,X1),HB+40,X0,step,phase||200)); for(let x=X0+(phase||200);x<X1-60;x+=step){ const xx=x; add(xx-60,xx+60,5,g=>kind==='globo'?posteGlobo(g,xx,HB+20,176,true):posteColonial(g,xx,HB+20,190,true,dbl)); add(xx-320,xx+320,4,g=>{ luzChao(g,xx,HB+30,200,'#ffb860',.04); luzChao(g,xx+20,HB+110,300,'#ffa850',.03); emitW(g,g=>{ g.save(); g.globalAlpha=.55; reflexoLuz(g,xx,HB+60,HB+170,'#f0a850'); g.restore(); }); }); } }
function walkStreet(X0,X1,walk,street,s,irr,back){ add(X0,X1,3,(g,lo,hi)=>{ const a=Math.max(lo,X0), b=Math.min(hi,X1); if(b<=a) return; sidewalk(g,a,b,walk,s); if(street==='asfalto') fAsfalto(g,a,b,s,X0); else fCobble(g,a,b,street||'#8e8698',s,irr,X0); }); if(back!==false) add(X0,X1,0,(g,lo,hi)=>fundoTelhados(g,Math.max(lo,X0),Math.min(hi,X1),s)); add(X0,X1,4,(g,lo,hi)=>manchasChao(g,Math.max(lo,X0),Math.min(hi,X1),ST,s)); }
function decals(X0,X1,s,o={}){ const n=Math.floor((X1-X0)/260);
  if(o.holes) for(let i=0;i<3;i++){ const x=X0+(i+.3+hsh(s*9+i)*.4)*(X1-X0)/3, y=400+hsh(s*13+i)*80, w=150+hsh(s*17+i)*110; add(x-w,x+w,4,g=>buraco(g,x,y,w,s+i)); }
  if(o.stones!==false) add(X0,X1,4,(g,lo,hi)=>pedras(g,Math.max(lo,X0),Math.min(hi,X1),s));
  if(o.trilho) add(X0,X1,4,(g,lo,hi)=>trilhosBonde(g,Math.max(lo,X0),Math.min(hi,X1))); for(let i=0;i<n;i++){ const x=X0+hsh(s+i*3.1)*(X1-X0), y=ST+16+hsh(s+i*5.7)*160, v=hsh(s+i*7.3);
  if(v<.22) add(x-40,x+40,4,g=>sangue(g,x,y,s+i,v<.08)); else if(v<.5&&o.wet!==false) add(x-90,x+90,4,g=>poca(g,x,y,70+hsh(i)*90,i,hsh(i*3)>.5)); else if(v<.62) add(x-10,x+70,4,g=>papel(g,x,y,s+i)); }
  for(let i=0;i<n/2;i++){ const x=X0+hsh(s*3+i*2.1)*(X1-X0), v=hsh(s*7+i); const yb=HB+20+hsh(s*5+i)*16;
    if(v<.25) add(x-30,x+90,5,g=>lixo(g,x,yb,s+i)); else if(v<.35) add(x-20,x+20,5,g=>lixeira(g,x,yb)); else if(v<.45) add(x-20,x+120,5,g=>entulho(g,x,yb+20,s+i)); else if(v<.52) add(x-20,x+20,5,g=>cone(g,x,yb+30,hsh(i)>.5)); else if(v<.6) add(x-10,x+80,5,g=>bicicleta(g,x,yb+24,pick(['#c83a3a','#3a8ae8','#e8c03a'],hsh(i)))); else if(v<.68&&o.cars!==false) add(x-10,x+100,5,g=>moto(g,x,yb+34,pick(['#3a6ab8','#c83a3a','#2a2a3a'],hsh(i*3)))); else if(v<.74) add(x-30,x+100,5,g=>carrinho(g,x,yb+30,i)); } }

/* =====================================================================
   OLINDA · CASARIO COLONIAL
   ===================================================================== */
const OLC=['#f4c430','#3a86e0','#f07aa0','#5cc46a','#f6e2a8','#e8743a','#36b8c8','#b07ae0','#f4a0b8','#e64848','#8ad0e8','#f0d050','#7ad0a0','#e8b0e0'];
const OSH=['#2f8a5a','#2a64b0','#1f7a7a','#8a2e2e','#3a5a9a','#2f6a3a','#2a8a8a'];
const CUN=['#f4eee0','#f4eee0','#fff4d8','#e8e2f0'];

function telhado(g,x,y,w,h,s,cor){ // água do telhado vista da rua: sobe do beiral (y) até a cumeeira (y-h)
  const t=rmp(cor||'#b85a38'); poly(g,[[x-6,y+1],[x+w+6,y+1],[x+w-10,y-h],[x+10,y-h]],t[5]);
  let yy=y-h+2, r=0;
  while(yy<y-1){ const f=(yy-(y-h))/h, rh=Math.max(3,Math.round(3+f*4)), ins=10-16*f, xa=x+ins, xb=x+w-ins, tw0=Math.round(6+f*3);
    for(let xx=xa+(r%2)*tw0/2;xx<xb-1;xx+=tw0){ const v=hsh(xx*.37+yy*1.31+s); if(v>.975){ R(g,xx,yy,tw0-1,rh,'#140a1a'); continue; }
      const tc=v>.86?t[1]:f<.3?t[3]:t[2]; R(g,xx,yy,tw0-1,rh,tc); R(g,xx,yy,tw0-1,1,t[1]); R(g,xx+tw0-2,yy,1,rh,t[4]); }
    R(g,xa,yy+rh-1,xb-xa,1,t[4]); yy+=rh; r++; }
  R(g,x+8,y-h-3,w-16,4,t[2]); R(g,x+8,y-h-3,w-16,1,t[0]); for(let xx=x+10;xx<x+w-12;xx+=9) ell(g,xx+4,y-h-1,4,2,t[3]);
  for(let k=0;k<4;k++){ const mx=x+12+hsh(s+k*3.3)*(w-40), my=y-h+4+hsh(s*2+k)*Math.max(1,h-10); blob(g,mx,my,8+hsh(k+s)*14,3+hsh(k*2+s)*3,'#4e6a3a'); }
  shade(g,x,y-h,w*.3,h,'#fff0d0',.05); shade(g,x+w*.75,y-h,w*.25,h,'#100624',.12);
}
function muxarabi(g,x,y,w,h,col,s){ // balcão fechado de treliça de madeira (Sobrado Mourisco)
  const wd=rmp(col||'#8a3a2a'), lt=rmp('#e8d8b0');
  poly(g,[[x-12,y+1],[x+w+12,y+1],[x+w+2,y-16],[x-2,y-16]],TERRA[5]);
  for(let yy=y-15;yy<y;yy+=4) for(let xx=x-10+((yy>>2)%2)*3;xx<x+w+10;xx+=6) R(g,xx,yy,5,3,hsh(xx*.7+yy)>.82?TERRA[1]:TERRA[2]);
  R(g,x-12,y,w+24,3,TERRA[3]); R(g,x-12,y,w+24,1,TERRA[1]);
  R(g,x-2,y+3,w+4,h,wd[5]); R(g,x,y+3,w,h-2,wd[2]);
  const lx=x+7, ly=y+10, lw=w-14, lh=h-30; R(g,lx,ly,lw,lh,'#1a0e18');
  for(let yy=0;yy<lh-2;yy+=4) for(let xx=0;xx<lw-2;xx+=4){ if((((xx+yy)>>2)&1)===0) R(g,lx+xx,ly+yy,3,3,lt[3]); else R(g,lx+xx+1,ly+yy+1,2,2,lt[4]); }
  if(hsh(s)>.4) emitW(g,g=>{ for(let yy=ly+lh*.3;yy<ly+lh-2;yy+=4) for(let xx=lx+lw*.2;xx<lx+lw*.7;xx+=4) if(hsh(xx+yy*3+s)>.5) R(g,xx+1,yy+1,2,2,'#f0a050'); });
  for(let k=0;k<=3;k++){ const px=x+Math.round(k*(w-6)/3); R(g,px,y+3,6,h-2,wd[1]); R(g,px,y+3,1,h-2,wd[0]); R(g,px+5,y+3,1,h-2,wd[4]); }
  R(g,x-4,y+h-20,w+8,6,wd[1]); R(g,x-4,y+h-20,w+8,1,wd[0]); R(g,x,y+h-14,w,12,wd[3]); for(let xx=x+4;xx<x+w-4;xx+=8) R(g,xx,y+h-12,4,8,wd[4]);
  for(let k=0;k<4;k++){ const px=x+6+k*(w-22)/3; poly(g,[[px,y+h],[px+10,y+h],[px+6,y+h+16],[px+3,y+h+16]],wd[4]); R(g,px+1,y+h,2,14,wd[2]); }
  shade(g,x-4,y+h+2,w+8,22,'#100624',.35); if(hsh(s*3)>.5) streak(g,x+w*.4,y+h,16,3,'#3a1010');
}
function casaOlinda(g,x,w,o){
  const s=o.seed, c=rmp(o.col), fl=o.fl||1, shc=o.shut||pick(OSH,hsh(s*2.7)), sh=rmp(shc), cu=rmp(o.cunhal||pick(CUN,hsh(s*4.1)));
  const gH=fl===1?124:100, uH=88, top=HB-gH-(fl-1)*uH, plat=o.roof==='plat';
  if(!plat) telhado(g,x,top-34,w,22+Math.round(hsh(s*5)*26),s,o.telha);
  R(g,x,top,w,HB-top,c[2]);
  for(let i=0;i<8;i++){ const bw=26+hsh(s+i*3.1)*60, bh=18+hsh(s+i*5.3)*40; blob(g,x+hsh(s+i*7.7)*(w-bw),top+hsh(s+i*9.9)*(HB-top-bh),bw,bh,hsh(s+i*2.2)>.6?c[1]:c[3]); }
  shade(g,x,top,w*.35,HB-top,'#fff0d0',.05); shade(g,x+w*.7,top,w*.3,HB-top,'#1a0c30',.08);
  for(const px of [x,x+w-12]){ R(g,px,top,12,HB-top,cu[2]); R(g,px,top,2,HB-top,cu[0]); R(g,px+10,top,2,HB-top,cu[4]); }
  const bar=rmp(o.barrado||mix(o.col,'#2a1e3a',.4)); R(g,x+12,HB-24,w-24,24,bar[2]); R(g,x+12,HB-24,w-24,2,bar[1]); R(g,x+12,HB-4,w-24,4,bar[4]);
  if(fl>1){ const fy=HB-gH; R(g,x-2,fy-6,w+4,7,cu[1]); R(g,x-2,fy-6,w+4,1,cu[0]); R(g,x-2,fy+1,w+4,2,c[4]); }
  const n=Math.max(2,Math.round((w-24)/72)), cxk=k=>x+12+Math.round((k+.5)*(w-24)/n);
  const sts=o.dark?['escura','fechada','tabuas','quebrada','escura','acesa','fechada']:['fechada','fechada','acesa','escura','fechada','quebrada','acesa','tabuas'];
  for(let f=1;f<fl;f++){ const y0=HB-gH-f*uH, mk0=o.muxa?Math.floor(n/2):-9;
    for(let k=0;k<n;k++){ if(k===mk0||(o.muxa&&n>2&&k===mk0-1&&w<260)) continue; const cx=cxk(k), v=hsh(s*1.3+f*7.1+k*3.3), st=pick(sts,v);
      janela(g,cx-13,y0+20,26,uH-40,{c,sh,s:s+f*10+k,st,fr:cu}); if(v>.35) sacada(g,cx-20,y0+20+uH-40+1,40,c); }
    if(o.muxa){ const mw=Math.min(w-60,120); muxarabi(g,cxk(mk0)-mw/2,y0+8,mw,uH-14,o.muxaC,s); } }
  const gy=HB-gH, dk=o.door??Math.floor(hsh(s*4)*n);
  for(let k=0;k<n;k++){ const cx=cxk(k), v=hsh(s*2.9+k*5.1);
    if(k===dk) porta(g,cx-17,gy+34,34,gH-58,{c,s:s+k,kind:v<.2?'aberta':'madeira',wood:shc,transom:fl===1&&hsh(s*9)>.4});
    else { janela(g,cx-13,gy+34,26,gH-70,{c,sh,s:s+k+77,st:pick(o.dark?['tabuas','fechada','escura','quebrada']:['fechada','fechada','acesa','escura','fechada','tabuas'],v),fr:cu}); } }
  if(o.sign&&tw(o.sign,1)+12<w-30) placa(g,x+w/2-tw(o.sign,1)/2-6,gy+8,o.sign,o.signC||pick(['#2a3a6a','#7a2a2a','#1e5a4a','#5a3a1a'],hsh(s*8)),'#f6ecd0',1);
  if(o.lamp) arandela(g,x+16,gy+4,hsh(s*19)>.35);
  for(let i=0;i<5;i++){ const sx=x+14+hsh(s*3+i)*(w-28); streak(g,sx,top+4,10+hsh(s*i)*26,2+Math.floor(hsh(s+i*2)*3),c[3]); }
  for(let i=0;i<2;i++) if(hsh(s*7+i)>.35) umidade(g,x+14+hsh(s*11+i)*(w-60),top+4,24+hsh(s*13+i)*36,40+hsh(s*17+i)*60,c,s+i);
  limo(g,x,HB-22,w,c,s);
  if(hsh(s*23)>.35) reboco(g,x+16+hsh(s*29)*(w-80),top+20+hsh(s*31)*Math.max(10,HB-top-110),30+hsh(s)*36,18+hsh(s*2)*18,c,s);
  if(hsh(s*37)>.4) crack(g,x+14+hsh(s*41)*(w-28),top+8,12+Math.floor(hsh(s)*12),c[4],s);
  if(hsh(s*43)>.45) poster(g,x+16+hsh(s*47)*(w-50),gy+44,s);
  if(hsh(s*59)>.55) pixo(g,x+18+hsh(s*61)*(w-80),HB-26,s*3,pick(['#1a1020','#2a1a3a','#e8e0d0'],hsh(s*67)));
  if(hsh(s*71)>.72) tag(g,x+14+hsh(s*73)*(w-70),gy+70,s);
  if(hsh(s*79)>.5) placaNum(g,x+w-30,gy+14,10+Math.floor(hsh(s*83)*290));
  if(plat) platibanda(g,x,top-28,w,28,c,{par:o.par||'reta',pinhas:hsh(s*5)>.5,s}); else beiral(g,x,top,w,c);
  R(g,x+w,top+6,2,HB-top-6,'#1a1028');
  return top;
}
function casarioOlinda(X0,X1,seed,o={}){ let x=X0, i=0;
  while(x<X1-100){ const s=seed+i*13.7+x*.01, w0=Math.round((o.wMin||150)+hsh(s)*(o.wVar||120)), w=X1-x-w0<120?X1-x:Math.min(w0,X1-x), v=hsh(s*2.3), xx=x, fl=v<(o.p2??.4)?2:1;
    const oo={seed:s,col:pick(o.cols||OLC,hsh(s*7)),fl,roof:hsh(s*3)<(o.plat??.35)?'plat':'beiral',par:pick(['reta','curva','reta','escalonada'],hsh(s*5)),muxa:fl===2&&w>180&&hsh(s*11)<(o.muxa??.12),muxaC:pick(['#8a3a2a','#6a4a2a','#2f5a4a'],hsh(s*17)),lamp:hsh(s*13)>.5,dark:o.dark,
      sign:hsh(s*19)<(o.signs??.25)?pick(o.signList||['ATELIE','POUSADA','ARTESANATO','BAR','TAPIOCA','GALERIA','MERCEARIA','FARMACIA','SEBO','CAFE'],hsh(s*23)):null};
    if(o.dark) oo.col=mix(oo.col,'#5a4a6a',.38);
    add(xx,xx+w,1,g=>casaOlinda(g,xx,w,oo)); x+=w; i++; } }
function sobradoRow(X0,X1,seed,o={}){ let x=X0, i=0; // sobrados de 2–3 pavimentos com sacada (Quatro Cantos, São Bento)
  while(x<X1-120){ const s=seed+i*17.3+x*.01, w0=Math.round(170+hsh(s)*120), w=X1-x-w0<130?X1-x:Math.min(w0,X1-x), xx=x;
    const oo={seed:s,col:pick(OLC,hsh(s*7)),fl:hsh(s*2.3)>(o.p3??.5)?3:2,par:pick(['beiral','reta','beiral','curva','balaustre'],hsh(s*3)),pinhas:hsh(s*5)>.6,shut:pick(OSH,hsh(s*9)),shop:hsh(s*19)>.7,
      sign:hsh(s*23)>.6?pick(['BAR','FREVO','ATELIE','LANCHES','POUSADA','MERCEARIA','BLOCO','CAFE'],hsh(s*29)):null,awning:hsh(s*31)>.75?[pick(['#e84a3a','#3a8ae8','#4ac860','#e8a03a'],hsh(s*37)),'#f6eedc']:null,lamp:hsh(s*41)>.45,longBalc:hsh(s*43)>.55,arch:hsh(s*47)>.6};
    add(xx,xx+w,1,g=>{ if(oo.par==='beiral') telhado(g,xx,HB-96-(oo.fl-1)*78-34,w,30,s); sobrado(g,xx,w,oo); }); x+=w; i++; } }

/* ---------- morro ao fundo: ladeira com casinhas, mato e coqueiros ---------- */
function hillY(x,s){ return 150+Math.round(Math.sin(x*.0009+s)*40+Math.sin(x*.0023+s*1.7)*20+Math.sin(x*.0061+s*.3)*6); }
function palmSil(g,x,yb,k,col){ const c=rmp(col), top=yb-200*k; let px=x;
  for(let y=yb;y>top;y-=2){ const t=(yb-y)/(yb-top); px=x+Math.round(Math.sin(t*1.6)*18*k); const w=Math.max(2,Math.round((6-t*2)*k*1.6)); R(g,px-w/2,y,w,2,c[3]); R(g,px-w/2,y,1,2,c[1]); }
  for(let j=0;j<9;j++){ const a=-Math.PI+j*(Math.PI/8)+(hsh(j+x)-.5)*.3, len=(55+hsh(j*3+x)*25)*k; for(let r=0;r<len;r+=2){ const fx=px+Math.cos(a)*r, fy=top+Math.sin(a)*r*.45+r*r/(120*k); R(g,fx,fy,2,2,c[3]); const L=Math.max(0,(1-r/len)*10*k); if(r%4===0){ line(g,fx,fy,fx-2,fy+L,c[4]); line(g,fx,fy,fx+2,fy+L,c[2]); } } }
  ell(g,px,top+2,4*k+2,3*k+2,c[4]); }
function fundoLadeira(g,a,b,s){ const veg=rmp('#2e5a4c');
  for(let x=Math.floor(a/2)*2;x<b;x+=2){ const y=hillY(x,s); R(g,x,y,2,HB-y,veg[4]); R(g,x,y,2,2,veg[2]); if(hsh(x*.7+s)>.6) R(g,x,y+2,2,3,veg[3]); }
  for(let k=Math.floor(a/26)-2;k<b/26+2;k++){ const x=k*26+hsh(k*1.9+s)*12, y=hillY(x,s), r=8+hsh(k*3.1+s)*12; ell(g,x,y+4,r,r*.7,veg[3]); ell(g,x-r*.3,y+1,r*.5,r*.35,veg[2]); R(g,x-r*.5,y-r*.2,r*.4,1,veg[1]); }
  for(let row=0;row<4;row++) for(let k=Math.floor(a/40)-2;k<b/40+2;k++){ const v=hsh(k*5.3+row*17.1+s); if(v<.28+row*.08) continue; const x=k*40+Math.round(hsh(k*2.1+row*3.3+s)*14)-row*13, y0=hillY(x+16,s)+10+row*24+Math.round(hsh(k*7.7+row+s)*8);
    if(y0>HB-30) continue; const ww=24+Math.round(hsh(k*3.7+row)*18), hh=12+Math.round(hsh(k*4.1+row)*8), c=rmp(mix(pick(OLC,hsh(k*9.1+row*2.3+s)),'#3a2e60',.48-row*.05));
    R(g,x,y0,ww,hh+6,c[4]); R(g,x,y0,ww,hh,c[2]); R(g,x,y0,2,hh,c[1]); R(g,x+ww-3,y0,3,hh,c[3]);
    poly(g,[[x-3,y0+1],[x+ww+3,y0+1],[x+ww-4,y0-7],[x+4,y0-7]],mix('#b85a38','#3a2a5a',.42-row*.05)); R(g,x-3,y0,ww+6,2,mix('#e08a5a','#4a3a6a',.32));
    for(let xx=x+4;xx<x+ww-5;xx+=8){ const lv=hsh(xx*.37+k+row*7), X=xx, Y=y0; R(g,xx,y0+4,3,6,c[5]); if(lv>.8) emitW(g,g=>{ R(g,X,Y+4,3,6,'#f0a050'); R(g,X,Y+4,1,2,'#ffe0a0'); }); }
    if(hsh(k*3.9+row*5.7+s)>.82) ell(g,x+ww+6,y0+4,10,8,'#2a4a40'); }
  for(let k=Math.floor(a/170)-1;k<b/170+1;k++){ if(hsh(k*8.3+s)<.4) continue; const x=k*170+hsh(k*2.9+s)*80; palmSil(g,x,hillY(x,s)+46,.42+hsh(k)*.22,'#24443c'); }
  for(let k=Math.floor(a/1400)-1;k<b/1400+1;k++){ if(hsh(k*4.4+s)<.55) continue; const x=k*1400+300+hsh(k*6.1+s)*600, y=hillY(x,s)+6; igrejinha(g,x,y,.5+hsh(k)*.15); } }
function igrejinha(g,x,y,k){ const c=rmp('#d8d2e4'), st=rmp('#8a86a0'); const w=Math.round(70*k), h=Math.round(60*k), tw0=Math.round(18*k), th=Math.round(92*k);
  R(g,x,y-h,w,h+40,c[3]); R(g,x,y-h,w*.4,h+40,c[2]); poly(g,[[x-2,y-h],[x+w/2,y-h-Math.round(22*k)],[x+w+2,y-h]],c[2]);
  for(const tx of [x-tw0+2,x+w-2]){ R(g,tx,y-th,tw0,th+40,c[2]); R(g,tx+tw0-4,y-th,4,th+40,c[4]); poly(g,[[tx-1,y-th],[tx+tw0/2,y-th-Math.round(20*k)],[tx+tw0+1,y-th]],st[3]); archF(g,tx+tw0/2-3,y-th+6,6,10,'#1a1430'); }
  archF(g,x+w/2-6,y-20,12,20,'#1a1430'); const X=x+w/2; emitW(g,g=>{ archF(g,X-4,y-17,8,15,'#e89a50'); }); }

/* ---------- cenário distante (parallax) ---------- */
function farStrip(mode,lvl){ const k='f'+lvl+mode; if(stripCache[k]) return stripCache[k]; const P=SKYP[mode], W0=lvl===1?2880:2400, [c,g]=mk(W0,HB);
  const col=lvl===1?P.f1:P.f2, wc=lvl===1?P.f1w:P.f2w, cc=rmp(col);
  if(lvl===1){ // prédios altos de Belém ao longe, atrás do casario e da baía
    for(let i=0;i<W0/34;i++){ const x=i*34+Math.round(hsh(i*3.1)*12), v=hsh(i*7.7); if(v<.25||x>W0-40) continue; const w=18+Math.round(hsh(i*5.3)*18), h=40+Math.round(Math.pow(hsh(i*2.9),1.5)*120), y=HZ-8-h;
      R(g,x,y,w,HB-y,cc[2]); R(g,x,y,w,1,cc[1]); R(g,x+w-3,y,3,HB-y,cc[3]); if(v>.85){ R(g,x+w/2-1,y-12,2,12,cc[2]); g.fillStyle='#ff4a3a'; g.fillRect(x+w/2-1,y-13,2,2); }
      for(let yy=y+4;yy<HZ-10;yy+=6) for(let xx=x+3;xx<x+w-4;xx+=5) if(hsh(xx*1.3+yy*.7)>.86){ g.fillStyle=wc; g.fillRect(xx,yy,2,2); } } }
  else { // margem do rio: mata baixa da ilha com açaizeiros e palafitas
    const hy=x=>HZ-20+Math.sin(x/W0*Math.PI*6)*5+Math.sin(x/W0*Math.PI*22+1)*3;
    for(let x=0;x<W0;x+=2){ const y=Math.round(hy(x)); R(g,x,y,2,HB-y,cc[2]); R(g,x,y,2,1,cc[1]); }
    for(let i=0;i<W0/14;i++){ const x=i*14+hsh(i*3.3)*8, y=hy(x); ell(g,x,y+2,6+hsh(i)*7,4+hsh(i*2)*4,cc[2]); R(g,x-3,y-2,5,1,cc[1]); }
    for(let i=0;i<W0/110;i++){ if(hsh(i*4.1)<.4) continue; const x=i*110+hsh(i)*60; if(x<30||x>W0-40) continue; palmSil(g,x,hy(x)+24,.24,mix(col,'#000010',.1)); }
    for(let i=0;i<W0/60;i++){ if(hsh(i*6.7)<.6) continue; const x=i*60+hsh(i*2)*30, y=Math.round(hy(x))+12; g.fillStyle=wc; g.fillRect(x,y,2,2); } }
  return stripCache[k]=c; }

/* =====================================================================
   VER-O-PESO · BELÉM (casario com azulejo, feira, Mercado de Ferro, rio e porto)
   ===================================================================== */
const WATER=[]; // trechos com rio ao fundo (unidades lógicas): brilho da água e maré vermelha na Lua de Sangue
const BELC=['#e8d8a8','#7ab0c8','#e8a87a','#f0e6d0','#c8d8a0','#e8c050','#d88a8a','#a8c8b8','#f2c0a0','#8ac0a8','#e0b0c8','#b8c8e8'];
const BTILE=[['#e8eef8','#2a5ab0'],['#f2ead8','#2a8a6a'],['#e8f0f0','#3a7ab8'],['#f6ecd8','#b8562a'],['#e0e8f4','#1e4a9a']];
const LOJBEL=['TACACA','ACAI','MANICOBA','FARINHA','PESCADO','REDES','ERVAS','CAFE','FARMACIA','ARMARINHO','TAPIOCA','CUPUACU','ESTIVA','SORVETES','MERCEARIA','CASTANHA'];
function casarioBelem(X0,X1,seed,o={}){ let x=X0, i=0;
  while(x<X1-120){ const s=seed+i*13.7+x*.01, w0=Math.round(150+hsh(s)*120), w=X1-x-w0<130?X1-x:Math.min(w0,X1-x), v=hsh(s*2.3), xx=x;
    const dark=!!o.dark; let col=pick(o.cols||BELC,hsh(s*7)); if(dark) col=mix(col,'#5a4a6a',.35);
    const oo={seed:s,col,fl:v>(o.p3??.6)?3:2,par:pick(['reta','balaustre','curva','reta','escalonada'],hsh(s*3)),pinhas:hsh(s*5)>.55,
      tile:!dark&&hsh(s*13)<(o.tiles??.3)?pick(BTILE,hsh(s*17)):null, dark, shop:hsh(s*19)>.4,
      sign:hsh(s*23)<(o.signs??.4)?pick(LOJBEL,hsh(s*29)):null, awning:hsh(s*31)>.6?[pick(['#e84a3a','#3a8ae8','#4ac860','#e8b84a'],hsh(s*37)),'#f6eedc']:null,
      lamp:hsh(s*41)>.5, longBalc:hsh(s*43)>.55, arch:hsh(s*47)>.45};
    add(xx,xx+w,1,g=>sobrado(g,xx,w,oo)); x+=w; i++; } }

/* ---------- rio, cais e barcos ---------- */
function rio(g,a,b,s){ seaBand(g,a,b,HZ,HB,true);
  for(let x=Math.floor(a/2)*2;x<b;x+=2){ const y=HZ-6-Math.round(3+Math.sin(x*.004+s)*3+Math.sin(x*.017)*2); R(g,x,y,2,HZ+2-y,'#1a302e'); }
  for(let k=Math.floor(a/30)-1;k<b/30+1;k++){ const x=k*30+hsh(k*3.1+s)*14, r=5+hsh(k*1.7)*7; ell(g,x,HZ-7,r,r*.55,'#203c36'); R(g,x-r*.4,HZ-7-r*.5,r*.5,1,'#2e5048'); }
  for(let k=Math.floor(a/140)-1;k<b/140+1;k++){ if(hsh(k*5.3+s)<.5) continue; const x=k*140+hsh(k)*60; R(g,x,HZ-6,14,6,'#2a3640'); poly(g,[[x-2,HZ-6],[x+7,HZ-10],[x+16,HZ-6]],'#3a2a30'); for(let j=0;j<3;j++) R(g,x+2+j*5,HZ,1,3,'#141c22');
    if(hsh(k*7.1)>.5){ const X=x; emit(g,g=>{ R(g,X+5,HZ-4,2,2,'#f0b060'); reflexo(g,X+6,HZ+3,HZ+30,'#a8784a',3); }); } }
  for(let x=Math.floor(a/18)*18;x<b;x+=18) if(hsh(x*.7+s)>.75) reflexo(g,x,HZ+6,HB-4,'#4e6496',6); }
function caisPedra(g,a,b){ R(g,a,HB-20,b-a,22,'#4e4a58');
  for(let y=HB-20;y<HB;y+=6) for(let x=Math.floor(a/26)*26-26+((y/6)%2)*13;x<b;x+=26){ const v=hsh(x*.3+y); R(g,x,y,25,5,v>.6?'#625e6c':v<.2?'#46424e':'#585464'); R(g,x,y,25,1,'#7a7688'); }
  R(g,a,HB-22,b-a,3,'#a8a2b0'); R(g,a,HB-19,b-a,1,'#2e2a3a'); for(let x=Math.floor(a/9)*9;x<b;x+=9) if(hsh(x*1.3)>.6) R(g,x,HB-3,3+hsh(x)*4,4,'#3e5a42');
  for(let x=Math.floor(a/240)*240+60;x<b;x+=240){ R(g,x,HB-21,12,18,'#2a2632'); ell(g,x+6,HB-12,4,6,'#16121e'); } } // pneus de atracação
const HULL=['#3a7ad8','#e8b83a','#3aa866','#d8443a','#2a9ab8','#e86a2a'];
const BNOME=['PROMESSA DE DEUS','COMANDANTE','DEUS E FIEL','SAO JOSE','ESTRELA DO NORTE','BOM JESUS','RAINHA DO RIO','FILHO DO PAI','GUAJARA','MARE MANSA'];
function barcoRegional(g,x,wl,w,s,dir){ dir=dir||1; const st=rmp(pick(HULL,hsh(s*3))), wh=rmp(hsh(s*5)>.3?'#eeeae0':'#a8d0e0'), bt=rmp('#8a3a2a'), dk=rmp('#7a5a3a'), h=28, y0=wl-h;
  const X=u=>dir>0?x+u:x+w-u, RR=(u,y,ww,hh,c)=>R(g,dir>0?x+u:x+w-u-ww,y,ww,hh,c), PP=(pts,c)=>poly(g,pts.map(p=>[X(p[0]),p[1]]),c);
  // mastro, varas e cordame (atrás)
  const mu=w*.8, my=y0-80-hsh(s)*50; RR(mu,my,3,y0-my,dk[3]); RR(mu,my,1,y0-my,dk[1]); RR(mu-14,my+16,30,2,dk[3]); line(g,X(mu+1),my,X(w+12),y0-10,'#1a1420'); line(g,X(mu+1),my,X(w*.15),y0-60,'#1a1420');
  if(hsh(s*9)>.4) PP([[mu+2,my+2],[mu+24,my+7],[mu+2,my+12]],pick(['#d83a3a','#3a8a3a','#e8c03a'],hsh(s*11)));
  for(let k=0;k<3;k++) if(hsh(s+k*7)>.5) line(g,X(w*.55+k*10),y0-40,X(w*.4+k*18),y0-140-k*16,'#2a2030');
  // casco
  for(let y=y0;y<=wl;y++){ const t=(y-y0)/h, ul=4*t, ur=w+16*(1-t)*(1-t)-6*t; const c=t<.08?wh[0]:t<.45?wh[2]:t<.62?st[2]:t<.7?st[3]:t<.95?bt[3]:bt[5]; RR(ul,y,ur-ul,1,c); }
  PP([[w-80,y0],[w+16,y0-13],[w+18,y0-9],[w+15,y0]],wh[1]); line(g,X(w-80),y0,X(w+16),y0-13,wh[0]);
  RR(0,y0+3,w+8,2,dk[2]); RR(0,y0+3,w+8,1,dk[0]); RR(2,y0+h*.45,w+6,1,st[0]);
  for(let u=24;u<w-30;u+=46){ ell(g,X(u),y0+12,5,6,'#141018'); ell(g,X(u),y0+12,2,3,'#2a2430'); }
  const nm=pick(BNOME,hsh(s*13)), nw=tw(nm,1); if(nw<w*.6){ const tx=dir>0?x+w*.35:x+w-w*.35-nw; text(g,nm,tx+1,y0+h*.48+1,1,st[4]); text(g,nm,tx,y0+h*.48,1,st[0]); }
  // casaria (1 ou 2 conveses)
  const c1a=w*.12, c1b=w*.68, c1h=30; RR(c1a,y0-c1h,c1b-c1a,c1h,wh[2]); RR(c1a,y0-c1h,c1b-c1a,3,wh[0]); RR(c1a,y0-c1h,3,c1h,wh[1]); RR(c1b-4,y0-c1h,4,c1h,wh[3]); RR(c1a-4,y0-c1h-4,c1b-c1a+8,4,st[2]); RR(c1a-4,y0-c1h-4,c1b-c1a+8,1,st[0]);
  const lit=[]; for(let u=c1a+8;u<c1b-12;u+=18){ const on=hsh(s*17+u)>.7; RR(u,y0-c1h+8,10,9,on?'#1a1220':'#16142a'); if(on) lit.push(dir>0?x+u:x+w-u-10); else { RR(u+1,y0-c1h+9,3,7,GLASS[1]); } }
  lit.forEach(lx=>emit(g,g=>{ R(g,lx+1,y0-c1h+9,8,7,'#f0b060'); R(g,lx+2,y0-c1h+10,3,3,'#ffe0a0'); }));
  if(w>230){ const c2a=w*.2, c2b=w*.6, c2h=22, yy=y0-c1h-4-c2h; RR(c2a,yy,c2b-c2a,c2h,wh[3]); RR(c2a,yy,c2b-c2a,2,wh[1]); for(let u=c2a+6;u<c2b-8;u+=14) RR(u,yy+6,8,8,'#18162c');
    RR(c2a-8,yy-4,c2b-c2a+16,4,wh[2]); RR(c2a-8,yy-4,c2b-c2a+16,1,wh[0]); for(let u=c1a;u<c1b;u+=8) RR(u,y0-c1h-12,1,8,wh[4]); RR(c1a,y0-c1h-12,c1b-c1a,1,wh[3]);
    if(hsh(s*19)>.35){ const lb=rmp('#2a6ad8'), la=c2a-10, lb2=c2b+30; PP([[la,yy-6],[lb2,yy-2],[lb2+4,yy+10],[la-4,yy+6]],lb[2]); for(let u=la;u<lb2;u+=12) PP([[u,yy-5],[u+6,yy-4],[u+5,yy+7],[u-1,yy+6]],lb[1]); line(g,X(la),yy-6,X(lb2),yy-2,lb[0]); } }
  else if(hsh(s*19)>.4){ const lb=rmp('#2a6ad8'); PP([[c1a-10,y0-c1h-12],[c1b+20,y0-c1h-8],[c1b+22,y0-c1h+2],[c1a-12,y0-c1h-2]],lb[2]); line(g,X(c1a-10),y0-c1h-12,X(c1b+20),y0-c1h-8,lb[0]); }
  // isopor e paneiros na proa
  for(let k=0;k<3;k++) if(hsh(s*23+k)>.35){ RR(w*.72+k*16,y0-14-(k%2)*12,14,12,'#e8ecf2'); RR(w*.72+k*16,y0-14-(k%2)*12,14,2,'#ffffff'); }
  // luz de topo e reflexo
  const lx=X(mu+1); emit(g,g=>{ R(g,lx-1,my-3,3,3,'#ffd890'); }); glow(g,lx,my-2,26,'#ffc070',.07,3);
  emit(g,g=>{ g.save(); g.globalAlpha=.35; reflexo(g,x+w/2,wl+2,HB-2,mix(st[2],'#203050',.5),w*.5); g.restore(); }); }
function urubu(g,x,y,s,voa){ if(voa){ line(g,x-9,y-3,x,y,'#120e16',2); line(g,x,y,x+9,y-4,'#120e16',2); R(g,x-1,y-1,3,2,'#120e16'); return; }
  ell(g,x,y-5,6,4,'#16121c'); ell(g,x-1,y-6,4,2,'#2a2432'); R(g,x+4,y-10,3,3,'#5a4a52'); R(g,x+7,y-9,2,1,'#c8b8a8'); R(g,x-6,y-3,4,2,'#120e16'); R(g,x-1,y-1,1,2,'#8a7a6a'); R(g,x+2,y-1,1,2,'#8a7a6a'); }
function torresLonge(g,x,yb){ const c=rmp('#3a4a6a'); R(g,x-80,yb-30,200,30,c[3]); R(g,x-80,yb-30,200,2,c[2]);
  for(const tx of [x-46,x+66]){ R(g,tx,yb-66,18,40,c[3]); poly(g,[[tx-2,yb-66],[tx+9,yb-94],[tx+20,yb-66]],c[4]); R(g,tx+8,yb-102,2,10,c[4]); const X=tx; emit(g,g=>{ R(g,X+5,yb-58,8,7,'#c88a48'); }); }
  for(const tx of [x-70,x+90]){ R(g,tx,yb-56,22,56,c[2]); poly(g,[[tx-2,yb-56],[tx+11,yb-90],[tx+24,yb-56]],c[3]); R(g,tx+10,yb-100,2,12,c[3]); const X=tx; emit(g,g=>{ R(g,X+5,yb-48,12,10,'#e8a050'); }); }
  for(let k=0;k<8;k++){ const X=x-60+k*20; emit(g,g=>R(g,X,yb-20,6,6,'#d89048')); } }
function bordaTrapiche(g,a,b){ R(g,a,HB-4,b-a,8,'#3a2a22'); R(g,a,HB-4,b-a,2,'#7a5a3e');
  for(let x=Math.floor(a/120)*120;x<b;x+=120){ R(g,x,HB-26,10,28,'#4a3428'); R(g,x,HB-26,3,28,'#7a5a3e'); ell(g,x+5,HB-26,5,2,'#8a6a4a'); sag(g,x+5,HB-18,x+125,HB-18,6,'#c8b07a',1); } }
function fTabuas(g,a,b,s){ R(g,a,HB,b-a,HH-HB,'#0a0c1a');
  rowsC('tb',HB,HH,8,.09).forEach(([y,h],ri)=>{ const c=rmp(haze(hsh(ri*3.1+s)>.5?'#8a6a4c':'#7a5c44',y,HB,HH,.4)); let x=Math.floor(a/480)*480-((ri*137)%480)-480, k=Math.floor(x/97);
    while(x<b){ const v=hsh(k*7.7+ri*13.1+s), Lw=Math.round(220+v*260);
      if(x+Lw>a){ if(v>.965){ R(g,x,y,Lw,h-1,'#121a36'); R(g,x+10,y+h*.4,Lw*.4,1,'#3a4a8a'); }
        else { const t=v<.2?3:v>.8?1:2; R(g,x+1,y,Lw-2,h-1,c[t]); R(g,x+1,y,Lw-2,1,c[t-1]); R(g,x+1,y+h-2,Lw-2,1,c[Math.min(5,t+1)]);
          for(let j=0;j<Lw/40;j++) R(g,x+6+hsh(v*9+j)*(Lw-12),y+1+hsh(v*3+j)*Math.max(1,h-3),6+hsh(j)*10,1,c[Math.min(5,t+1)]);
          R(g,x+4,y+h/2-1,2,2,'#2a2030'); R(g,x+Lw-6,y+h/2-1,2,2,'#2a2030'); if(v>.5&&v<.56) blob(g,x+20,y+1,Lw*.4,h-2,mix(c[t],'#2a3a2a',.35)); } }
      x+=Lw; k++; } });
  shade(g,a,HB,b-a,8,'#08041e',.4); }

/* ---------- Praça do Relógio ---------- */
function relogioFerro(g,cx,yb){ const ir=rmp('#3a6a62'), st=rmp('#b0a898'), go=rmp('#d8b048');
  ell(g,cx,yb,60,7,'rgba(10,6,20,.5)'); R(g,cx-40,yb-16,80,16,st[4]); R(g,cx-38,yb-16,76,14,st[2]); R(g,cx-38,yb-16,76,2,st[0]); R(g,cx-38,yb-4,76,2,st[4]);
  R(g,cx-26,yb-46,52,30,ir[4]); R(g,cx-24,yb-44,48,28,ir[2]); R(g,cx-24,yb-44,8,28,ir[1]); R(g,cx+14,yb-44,10,28,ir[3]); R(g,cx-28,yb-48,56,5,ir[1]); R(g,cx-28,yb-48,56,1,ir[0]); archF(g,cx-8,yb-40,16,20,ir[4]);
  const ct=yb-190; R(g,cx-9,ct,18,yb-48-ct,ir[4]); R(g,cx-8,ct,16,yb-48-ct,ir[2]); R(g,cx-8,ct,4,yb-48-ct,ir[1]); R(g,cx+4,ct,3,yb-48-ct,ir[3]);
  for(let y=ct+20;y<yb-60;y+=34){ R(g,cx-12,y,24,4,ir[1]); R(g,cx-12,y,24,1,ir[0]); R(g,cx-12,y+4,24,1,ir[4]); }
  for(const sx of [-1,1]){ line(g,cx+sx*8,ct+30,cx+sx*22,ct+6,ir[3],3); ell(g,cx+sx*22,ct+6,4,4,ir[2]); ell(g,cx+sx*22-1,ct+5,2,2,ir[0]); }
  const bx=cx-30, by=ct-56; R(g,bx-2,by-2,64,62,ir[5]); R(g,bx,by,60,58,ir[2]); R(g,bx,by,8,58,ir[1]); R(g,bx+50,by,10,58,ir[3]); R(g,bx-4,by-6,68,6,ir[1]); R(g,bx-4,by-6,68,1,ir[0]); R(g,bx-4,by+56,68,5,ir[1]); R(g,bx-4,by+60,68,1,ir[4]);
  for(const px of [bx-2,bx+58]){ R(g,px,by,4,58,ir[0]); ell(g,px+2,by-8,3,3,go[2]); }
  ell(g,cx,by+28,22,22,ir[4]); ell(g,cx,by+28,19,19,'#e8e0c8');
  emit(g,g=>{ ell(g,cx,by+28,19,19,'#fff0c8'); ell(g,cx-4,by+24,10,10,'#fffbe8'); for(let k=0;k<12;k++){ const a=k/12*Math.PI*2; R(g,cx+Math.cos(a)*15-1,by+28+Math.sin(a)*15-1,2,2,'#3a2a20'); } line(g,cx,by+28,cx+1,by+15,'#2a1a14',2); line(g,cx,by+28,cx+10,by+31,'#2a1a14',2); });
  glow(g,cx,by+28,70,'#ffd890',.06,5); reg(LAMPS,{x:cx/RS,y:(by+28)/RS,r:18,mid:true});
  poly(g,[[bx-4,by-6],[cx,by-40],[bx+64,by-6]],ir[3]); poly(g,[[bx-2,by-6],[cx,by-38],[cx,by-6]],ir[2]); line(g,bx-4,by-6,cx,by-40,ir[0]); for(let k=1;k<4;k++) line(g,bx-4+k*17,by-6,cx,by-40,ir[4]);
  ell(g,cx,by-42,6,5,go[2]); ell(g,cx-2,by-43,2,2,go[0]); R(g,cx-1,by-66,2,24,ir[3]); ell(g,cx,by-66,3,3,go[1]);
  streak(g,cx-20,by+60,30,3,ir[4]); streak(g,cx+6,yb-44,14,3,'#6a4a2a'); }

/* ---------- feira: lonas brancas, bancas de açaí, frutas e ervas ---------- */
function feiraCoberta(g,a,b,F0,F1,kind,s){ const tl=rmp('#ece8e0'), y0=HB-150, ey=HB-96, M=180, n=Math.floor((F1-F0)/M);
  for(let k=Math.max(0,Math.floor((a-F0)/M)-1);k<=Math.min(n-1,Math.ceil((b-F0)/M));k++){ const x=F0+k*M, v=hsh(k*3.7+s);
    R(g,x,ey,M,HB-ey,'#22182c'); R(g,x,ey,M,6,'#140c1e');
    for(let r=0;r<3;r++){ const sy=ey+16+r*24; R(g,x+8,sy+12,M-16,3,'#6a4a32'); R(g,x+8,sy+12,M-16,1,'#9a7448');
      for(let i=0;i<10;i++){ const gx=x+12+i*16, vv=hsh(k*9.1+r*3.3+i*1.7+s);
        if(kind==='ervas'){ const col=pick(['#c87a2a','#5a9a3a','#a83a3a','#7a4aa8','#d8b040','#3a8a8a','#e85a8a'],vv); R(g,gx+2,sy-2,7,14,mix(col,'#1a1020',.35)); R(g,gx+3,sy-1,5,12,col); R(g,gx+4,sy-6,3,4,'#b8a888'); R(g,gx+3,sy,1,8,mix(col,'#ffffff',.5)); }
        else { const col=pick(['#e8c03a','#d84a3a','#5aa03a','#e88a2a','#3a1a3a','#f0e080','#8a3a6a'],vv); ell(g,gx+6,sy+8,7,5,mix(col,'#1a1020',.35)); ell(g,gx+5,sy+7,5,3,col); R(g,gx+3,sy+5,2,1,mix(col,'#ffffff',.5)); } } }
    for(let i=0;i<5;i++){ const hx2=x+20+i*34, Ln=14+hsh(k+i*3+s)*14; line(g,hx2,ey,hx2,ey+6,'#3a2a20');
      if(kind==='ervas'){ for(let j=0;j<6;j++) line(g,hx2,ey+6,hx2-4+j*1.6,ey+6+Ln,j%2?'#4a7a3a':'#6a9a4a',2); }
      else { R(g,hx2-1,ey+6,2,Ln*.6,'#5a7a2a'); for(let j=0;j<5;j++) ell(g,hx2-3+j*1.5,ey+9+j*3,3,4,j%2?'#e8c840':'#c8a830'); } }
    R(g,x-3,ey,6,HB-ey,'#9a9aa8'); R(g,x-3,ey,2,HB-ey,'#d8d8e0');
    const lx=x+M/2; R(g,lx,ey+2,1,8,'#2a2030'); emit(g,g=>{ ell(g,lx,ey+12,3,3,'#fff0c0'); }); glow(g,lx,ey+14,50,'#ffc070',.07,4); reg(BULBS,{x:lx/RS,y:(ey+12)/RS});
    const cx=x+M/2; poly(g,[[x-6,ey+2],[cx,y0],[x+M+6,ey+2]],tl[4]); poly(g,[[x-4,ey],[cx,y0+2],[cx,ey]],tl[1]); poly(g,[[cx,y0+2],[x+M+4,ey],[cx,ey]],tl[2]);
    line(g,x-4,ey,cx,y0+2,tl[0]); line(g,cx,y0+2,cx,ey,tl[3]); for(let j=1;j<4;j++){ line(g,cx-j*22,ey,cx,y0+2,tl[3]); line(g,cx+j*22,ey,cx,y0+2,mix(tl[3],tl[4],.4)); }
    R(g,x-6,ey,M+12,4,tl[3]); R(g,x-6,ey+4,M+12,2,tl[5]); R(g,cx-1,y0-14,2,16,'#8a8a9a'); ell(g,cx,y0-14,3,2,'#c8c8d0');
    if(v>.6) blob(g,cx+8,ey-30,26,12,mix(tl[2],'#6a5a48',.3)); if(v<.2) poly(g,[[cx+30,ey-10],[cx+50,ey-22],[cx+44,ey]],'#22182c'); } }
function paneiro(g,x,yb,s,full){ const st=rmp('#c8a05a'); poly(g,[[x-14,yb-23],[x+14,yb-23],[x+11,yb+1],[x-11,yb+1]],st[5]); poly(g,[[x-13,yb-22],[x+13,yb-22],[x+10,yb],[x-10,yb]],st[3]);
  for(let y=yb-21;y<yb;y+=3){ const t=(y-(yb-22))/22, hw=13-3*t; for(let xx=-hw;xx<hw-2;xx+=4) R(g,x+xx+((y/3)%2)*2,y,3,2,hsh(xx+y+s)>.5?st[1]:st[2]); }
  R(g,x-14,yb-24,28,3,st[1]); R(g,x-14,yb-24,28,1,st[0]); R(g,x+8,yb-21,3,20,st[4]);
  if(full!==false){ ell(g,x,yb-25,12,5,'#2a1030'); for(let k=0;k<10;k++) R(g,x-10+hsh(s+k)*20,yb-28+hsh(s*2+k)*5,2,2,hsh(k)>.5?'#5a2a5a':'#140818'); R(g,x-6,yb-29,3,1,'#8a5a8a'); } }
function pilhaPaneiros(g,x,yb,s){ ell(g,x+40,yb+2,56,6,'rgba(10,6,20,.5)'); for(let r=0;r<3;r++) for(let i=0;i<3-r;i++) paneiro(g,x+i*28+r*14,yb-r*24,s+r*3+i,r===2-i||hsh(s+i+r)>.5); }
function barracaAcai(g,x,yb,s){ barraca(g,x,yb,pick(['#e84a3a','#3a8ae8','#e8b84a','#4ac860'],hsh(s*3)),s); paneiro(g,x+30,yb-56,s,true); paneiro(g,x+64,yb-56,s+1,true); paneiro(g,x+98,yb-56,s+2,hsh(s)>.4);
  placa(g,x+44,yb-150,pick(['ACAI','ACAI DO PARA','FRUTAS','CUPUACU'],hsh(s*5)),'#5a1a5a','#f8e8c0',1); }
function bancaErvas(g,x,yb,s,big){ const k=big?1.35:1, wd=rmp('#7a5234'), w=Math.round(150*k), h=Math.round(124*k), top=yb-h;
  ell(g,x+w/2,yb,w*.6,7,'rgba(10,6,20,.5)'); R(g,x,top+20,w,h-20,wd[5]);
  for(let r=0;r<3;r++){ const sy=top+28+r*26*k, by=Math.round(sy+18*k); R(g,x+4,by,w-8,3,wd[2]); R(g,x+4,by,w-8,1,wd[0]);
    for(let i=0;i<Math.floor((w-12)/11);i++){ const gx=x+8+i*11, vv=hsh(s+r*7.1+i*1.3), col=pick(['#c87a2a','#5a9a3a','#a83a3a','#7a4aa8','#d8b040','#3a8a8a','#e85a8a'],vv), bh=Math.round((10+vv*6)*k);
      R(g,gx,by-bh,8,bh,mix(col,'#140a1a',.35)); R(g,gx+1,by-bh+1,6,bh-2,col); R(g,gx+2,by-bh-4,4,4,'#c8b898'); R(g,gx+1,by-bh+2,1,bh-4,mix(col,'#ffffff',.55)); } }
  R(g,x-4,yb-38,w+8,38,wd[3]); R(g,x-4,yb-38,w+8,3,wd[1]); for(let xx=x;xx<x+w;xx+=14) R(g,xx,yb-35,1,35,wd[4]);
  for(let i=0;i<4;i++){ const cx=x+18+i*(w-36)/3; ell(g,cx,yb-40,14,5,'#8a6a3a'); ell(g,cx,yb-42,11,4,pick(['#6a8a3a','#8a5a2a','#4a6a2a','#a87a3a'],hsh(s+i))); R(g,cx-6,yb-45,4,1,'#c8e08a'); }
  R(g,x-8,top+12,w+16,10,wd[2]); R(g,x-8,top+12,w+16,2,wd[0]);
  for(let i=0;i<9;i++){ const hx2=x+6+i*(w-12)/8, Ln=(16+hsh(s+i*3)*16)*k; line(g,hx2,top+22,hx2,top+26,'#2a1a14'); for(let j=0;j<6;j++) line(g,hx2,top+26,hx2-4+j*1.6,top+26+Ln,j%2?'#4a7a3a':pick(['#6a9a4a','#8a6a3a','#9a8a4a'],hsh(i+j)),2); }
  for(const px of [x-6,x+w+2]){ R(g,px,top+12,5,h-12,wd[4]); R(g,px,top+12,2,h-12,wd[2]); }
  const lbl=big?'BANHO DE CHEIRO':pick(['ERVAS','GARRAFADAS','RAIZES','CHEIRO'],hsh(s*3)); placa(g,x+w/2-tw(lbl,1)/2-6,top-6,lbl,'#2a5a3a','#f0e6c0',1);
  if(big){ glow(g,x+w/2,top+50,120,'#6aff8a',.05,4); for(let i=0;i<6;i++){ const fx=x+10+hsh(s+i*5)*(w-20), fy=top+30+hsh(s*3+i)*60; emit(g,g=>R(g,fx,fy,2,2,'#b8ffc0')); } } }

/* ---------- Mercado de Ferro (Mercado de Peixe) ---------- */
function mercadoFerro(g,x,w){ const B=rmp('#5c80b4'), Wt=rmp('#dfe6f0'), D=rmp('#2a3448'), top=HB-150;
  // 4 torres de canto (como no real): as 2 de trás aparecem por cima do telhado, mais altas na tela e recuadas pra dentro
  torreFerro(g,x+170,top-26,true); torreFerro(g,x+w-262,top-26,true);
  telhado(g,x+60,top+2,w-120,26,777,'#b8603a');
  R(g,x,top,w,HB-top,B[2]); shade(g,x,top,w*.3,HB-top,'#fff0d0',.05);
  R(g,x-4,top,w+8,30,B[1]); R(g,x-4,top,w+8,2,B[0]); R(g,x-4,top+28,w+8,3,B[4]); R(g,x-6,top+30,w+12,5,Wt[2]); R(g,x-6,top+30,w+12,1,Wt[0]); R(g,x-6,top+34,w+12,2,B[4]);
  for(let k=x+40;k<x+w-30;k+=64){ ell(g,k,top+15,8,8,Wt[3]); ell(g,k,top+15,6,6,Wt[1]); ell(g,k,top+15,4,4,B[4]); R(g,k-3,top+12,2,2,B[1]); }
  for(let k=x;k<x+w;k+=8){ R(g,k+3,top-6,2,6,D[2]); R(g,k+2,top-8,4,2,D[3]); }
  for(let k=x+64;k<x+w-40;k+=128){ R(g,k-1,top-22,2,22,D[2]); ell(g,k,top-22,4,3,D[1]); R(g,k-6,top-13,12,2,D[2]); }
  const n=Math.floor((w-40)/64), cw=(w-40)/n, aw=46, ay=top+46, ah=56;
  for(let k=0;k<n;k++){ const wx=Math.round(x+20+k*cw+(cw-aw)/2);
    R(g,wx-11,ay-8,6,ah+14,Wt[2]); R(g,wx-11,ay-8,2,ah+14,Wt[0]); R(g,wx-7,ay-8,2,ah+14,B[4]);
    archF(g,wx-4,ay-4,aw+8,ah+6,Wt[1]); archF(g,wx,ay,aw,ah,D[3]);
    const lit=hsh(k*3.7+x)>.62, cx=wx+aw/2, cy=ay+aw/2;
    if(lit) emit(g,g=>{ archF(g,wx+2,ay+2,aw-4,ah-4,'#e8a050'); archF(g,wx+6,ay+6,aw-12,Math.round(ah*.5),'#f4c070'); for(let r=0;r<=6;r++){ const a=Math.PI*r/6; line(g,cx,cy,cx-Math.cos(a)*aw/2,cy-Math.sin(a)*aw/2,'#5a3a2a'); } R(g,wx,cy-1,aw,2,'#5a3a2a'); for(let xx=wx+11;xx<wx+aw;xx+=11) R(g,xx,cy,1,ay+ah-cy,'#5a3a2a'); });
    else { archF(g,wx+2,ay+2,aw-4,ah-4,GLASS[2]); poly(g,[[wx+4,ay+ah-4],[wx+aw*.7,ay+aw*.3],[wx+aw-4,ay+aw*.3+6],[wx+12,ay+ah-4]],GLASS[1]);
      for(let r=0;r<=6;r++){ const a=Math.PI*r/6; line(g,cx,cy,cx-Math.cos(a)*aw/2,cy-Math.sin(a)*aw/2,D[2]); } R(g,wx,cy-1,aw,2,D[2]); for(let xx=wx+11;xx<wx+aw;xx+=11) R(g,xx,cy,1,ay+ah-cy,D[2]); }
    ell(g,cx,cy,5,3,D[2]); if(lit){ pushWin(wx+4,cy+2,aw-8,ay+ah-cy-6); glow(g,cx,cy+10,aw,'#ffb060',.04,3); } }
  const my=ay+ah+8; R(g,x,my,w,4,Wt[2]); R(g,x,my,w,1,Wt[0]);
  for(let k=0;k<n;k++){ const sx=Math.round(x+20+k*cw), sw=Math.round(cw);
    poly(g,[[sx+2,my+4],[sx+sw-2,my+4],[sx+sw+4,my+22],[sx-4,my+22]],'#1e1a26'); R(g,sx-4,my+20,sw+8,3,'#2c2836'); R(g,sx+2,my+4,sw-4,1,'#3a3648');
    const dy=my+24, dh=HB-dy; R(g,sx+6,dy,sw-12,dh,B[3]); for(let yy=dy+2;yy<HB-2;yy+=4){ R(g,sx+6,yy,sw-12,1,B[4]); R(g,sx+6,yy+1,sw-12,1,B[1]); }
    if(hsh(k*5.1+x)>.55){ const oh=Math.round(dh*.55); R(g,sx+8,HB-oh,sw-16,oh,'#140c1e'); R(g,sx+10,HB-14,sw-20,4,'#6a6a7a'); for(let i=0;i<4;i++) ell(g,sx+16+i*10,HB-16,5,2,'#a8b4c4'); const X=sx; emit(g,g=>R(g,X+12,HB-oh+4,sw-24,3,'#e8b060')); }
    else if(hsh(k*7.3)>.6) pixo(g,sx+10,dy+dh*.6,k*31,'#1a1020');
    R(g,sx-2,dy-2,4,dh+2,Wt[3]); }
  R(g,x,HB-8,w,8,B[4]); for(let i=0;i<16;i++) streak(g,x+hsh(i*3.3+x)*w,top+36,10+hsh(i)*30,3,B[3]);
  placa(g,x+w/2-tw('MERCADO DE PEIXE',2)/2-6,top+3,'MERCADO DE PEIXE','#1e3a6a','#f2ecd8',2);
  torreFerro(g,x-30,top); torreFerro(g,x+w-66,top); }
function torreFerro(g,x,top,back){ const B=rmp(back?'#4a6898':'#5c80b4'), Wt=rmp(back?'#aab6cc':'#dfe6f0'), D=rmp('#2a3448'), Sc=rmp(back?'#6a7088':'#8a90a4'), tw0=96, by=top-66;
  R(g,x,by,tw0,HB-by,B[2]); R(g,x,by,14,HB-by,B[1]); R(g,x+tw0-18,by,18,HB-by,B[3]); R(g,x+tw0-4,by,4,HB-by,B[4]); R(g,x+14,by,1,HB-by,Wt[1]); R(g,x+tw0-18,by,1,HB-by,B[4]);
  const wx=x+22, wy=by+16, ww=tw0-44, wh=50; archF(g,wx-4,wy-4,ww+8,wh+8,Wt[2]); archF(g,wx,wy,ww,wh,D[3]);
  emit(g,g=>{ archF(g,wx+2,wy+2,ww-4,wh-4,'#f0b060'); archF(g,wx+6,wy+6,ww-12,wh*.4,'#ffd890'); for(let yy=wy+ww/2;yy<wy+wh;yy+=9) R(g,wx,yy,ww,1,'#5a3a2a'); for(let xx=wx+9;xx<wx+ww;xx+=9) R(g,xx,wy+6,1,wh-6,'#5a3a2a'); });
  glow(g,wx+ww/2,wy+wh/2,64,'#ffb860',.05,4); pushWin(wx+3,wy+ww/2+2,ww-6,wh-ww/2-4);
  for(let k=0;k<3;k++) ell(g,x+tw0/2,by+84+k*44,6,6,Wt[3]);
  R(g,x-6,by-8,tw0+12,8,Wt[1]); R(g,x-6,by-8,tw0+12,2,Wt[0]); R(g,x-6,by,tw0+12,2,B[5]);
  const sh=66, cx=x+tw0/2;
  for(let y=0;y<sh;y++){ const yy=by-8-y, hw=(tw0/2+4)*(1-y/sh), row=Math.floor(y/5), off=(row%2)*3; for(let xx=-hw;xx<hw-2;xx+=6){ const u=(xx+hw)/(2*hw), c=y%5===0?Sc[4]:u<.25?Sc[1]:u>.72?Sc[3]:Sc[2]; R(g,cx+xx+off,yy,5,1,c); } }
  line(g,cx-tw0/2-4,by-8,cx,by-8-sh,Sc[0]);
  for(const dx of [-24,10]){ const lx=cx+dx, ly=by-34; R(g,lx,ly,14,16,Wt[2]); poly(g,[[lx-2,ly],[lx+7,ly-9],[lx+16,ly]],Sc[3]); R(g,lx+3,ly+4,8,10,D[3]); emit(g,g=>R(g,lx+4,ly+5,6,8,'#f0b060')); }
  R(g,cx-1,by-8-sh-18,2,20,D[2]); ell(g,cx,by-8-sh-4,3,3,D[1]); }
function peixeBanca(g,x,yb,s){ const wd=rmp('#8a6a4a'), fi=rmp('#a8b4c4'), rd=rmp('#d8705a'), ic=rmp('#bfe4ee');
  ell(g,x+64,yb,74,6,'rgba(10,6,20,.5)');
  for(const lx of [x+6,x+108]){ R(g,lx,yb-34,6,34,wd[4]); R(g,lx,yb-34,2,34,wd[2]); }
  R(g,x-2,yb-40,128,8,wd[3]); R(g,x-2,yb-40,128,2,wd[1]); R(g,x-2,yb-33,128,1,wd[5]);
  R(g,x+4,yb-46,116,6,ic[2]); for(let k=0;k<14;k++) R(g,x+6+hsh(s+k)*110,yb-46+hsh(s*3+k)*4,4,2,ic[0]);
  for(let k=0;k<7;k++){ const fx=x+10+k*15+hsh(s+k)*4, fy=yb-50-hsh(s*2+k)*4, c=hsh(s*5+k)>.7?rd:fi; ell(g,fx+7,fy,10,4,c[3]); ell(g,fx+7,fy-1,9,3,c[2]); R(g,fx+2,fy-3,10,1,c[0]); poly(g,[[fx-5,fy-5],[fx,fy],[fx-5,fy+4]],c[3]); R(g,fx+13,fy-1,2,2,'#1a1420'); }
  R(g,x+92,yb-30,40,30,'#e8ecf2'); R(g,x+92,yb-30,40,3,'#ffffff'); R(g,x+128,yb-30,4,30,'#a8b0c0'); R(g,x+97,yb-20,28,9,'#3a6ab8'); text(g,'GELO',x+100,yb-19,1,'#e8f0ff');
  if(hsh(s*7)>.4) urubu(g,x+30+hsh(s)*60,yb-56,s); if(hsh(s*11)>.5) urubu(g,x+136,yb-30,s+3); }

/* ---------- doca: redes, caixotes, cabeços ---------- */
function redePesca(g,x,yb,s){ const c=rmp('#4a8a6a'); ell(g,x+40,yb,50,6,'rgba(10,6,20,.5)'); blob(g,x,yb-26,84,28,c[4]); blob(g,x+8,yb-34,60,18,c[3]);
  for(let i=0;i<20;i++){ const px=x+4+hsh(s+i)*76, py=yb-30+hsh(s*3+i)*26; line(g,px,py,px+6,py+5,c[1]); line(g,px+6,py,px,py+5,c[2]); }
  for(let i=0;i<6;i++){ ell(g,x+8+i*13,yb-28+hsh(s+i*5)*14,4,3,i%2?'#e86a2a':'#f0ece0'); } }
function caixotes(g,x,yb,s,n){ const c=rmp('#a87a4a'); n=n||3; ell(g,x+n*22,yb+2,n*26,6,'rgba(10,6,20,.5)');
  for(let r=0;r<2;r++) for(let i=0;i<n-r;i++){ const bx=x+i*44+r*22, by=yb-40-r*40, cc=hsh(s+i+r*5)>.5?c:rmp('#8a6a4a'); R(g,bx-1,by-1,42,42,cc[5]); R(g,bx,by,40,40,cc[2]); R(g,bx,by,40,2,cc[0]); for(let k=1;k<4;k++) R(g,bx,by+k*10,40,1,cc[4]); line(g,bx+2,by+38,bx+38,by+2,cc[3],2); R(g,bx,by,4,40,cc[1]); R(g,bx+36,by,4,40,cc[3]);
    if(hsh(s*7+i+r)>.6) text(g,pick(['FRAGIL','PARA','BELEM','PEIXE'],hsh(s+i)),bx+5,by+16,1,cc[5]); } }

/* ---------- Forte do Presépio e Casa das Onze Janelas ---------- */
function canhao(g,x,y){ R(g,x-10,y-3,28,7,'#1a1820'); R(g,x-10,y-3,28,2,'#4a4858'); ell(g,x+18,y,3,4,'#0a0810'); ell(g,x-6,y+6,6,6,'#3a2a20'); ell(g,x-6,y+6,2,2,'#6a4a30'); }
function guarita(g,x,y){ const st=rmp('#c8b8a0'); poly(g,[[x-14,y],[x+14,y],[x+8,y+16],[x-8,y+16]],st[3]); R(g,x-14,y-42,28,42,st[2]); R(g,x-14,y-42,6,42,st[1]); R(g,x+8,y-42,6,42,st[3]); archF(g,x-5,y-32,10,22,'#140c18');
  ell(g,x,y-42,16,7,st[3]); ell(g,x,y-46,13,10,st[2]); ell(g,x-4,y-49,5,4,st[1]); R(g,x-1,y-62,2,10,st[4]); ell(g,x,y-62,3,3,st[3]); }
function fortePresepio(g,x,w,s){ const st=rmp('#7a5a4a'), top=HB-92;
  poly(g,[[x,HB],[x+10,top],[x+w-10,top],[x+w,HB]],st[4]);
  for(let y=top+4;y<HB;y+=9) for(let xx=x+((y/9)%2)*14-14;xx<x+w;xx+=28){ const v=hsh(xx*.7+y*1.3+s); const ins=10*(1-(y-top)/(HB-top)); if(xx<x+ins||xx>x+w-ins-26) continue; blob(g,xx+1,y+1,26,7,v>.65?st[1]:v<.2?st[3]:st[2]); R(g,xx+3,y+1,10,1,st[0]); }
  R(g,x+6,top-26,w-12,26,st[2]); R(g,x+6,top-26,w-12,3,st[0]); R(g,x+6,top-3,w-12,4,st[4]);
  for(let xx=x+60;xx<x+w-90;xx+=120){ R(g,xx,top-26,28,18,'#140c18'); R(g,xx+2,top-24,24,4,'#24182a'); canhao(g,xx+12,top-14); }
  for(let i=0;i<10;i++) R(g,x+20+hsh(s+i)*(w-40),top-24+hsh(s*2+i)*8,10+hsh(i)*16,2,'#4a6a3a');
  guarita(g,x+w-36,top-26); guarita(g,x+40,top-26);
  const gx=x+w*.5-40; R(g,gx-8,top+20,96,HB-top-20,st[4]); archF(g,gx,top+28,80,HB-top-28,'#140c18'); R(g,gx+8,HB-40,64,40,'#1e1428'); R(g,gx-10,top+14,100,8,st[1]);
  placa(g,gx-6,top-48,'FORTE DO PRESEPIO','#4a2a20','#f0e0c0',1);
  limo(g,x,HB-22,w,st,s); for(let i=0;i<10;i++) streak(g,x+hsh(s*3+i)*w,top,10+hsh(i)*30,3,st[4]); }
function casaOnzeJanelas(g,x,w){ const c=rmp('#ecd8a0'), sh=rmp('#3a7a5a'), s=1101, gH=110, uH=96, top=HB-gH-uH;
  telhado(g,x,top-34,w,30,s,'#b85a38'); R(g,x,top,w,HB-top,c[2]); shade(g,x,top,w*.3,HB-top,'#fff0d0',.05);
  for(let i=0;i<10;i++) blob(g,x+hsh(s+i*7)*(w-60),top+hsh(s+i*3)*(HB-top-40),40+hsh(i)*40,20+hsh(i*3)*20,hsh(i*5)>.5?c[1]:c[3]);
  cornice(g,x-2,HB-gH,w+4,c,false); R(g,x-6,top-6,w+12,8,c[1]); R(g,x-6,top-6,w+12,2,c[0]);
  for(let k=0;k<11;k++){ const cx=x+Math.round((k+.5)*w/11); janela(g,cx-13,top+22,26,uH-40,{c,sh,s:s+k,st:pick(['fechada','acesa','fechada','escura','fechada'],hsh(k*3.3)),arch:false}); }
  for(let k=0;k<7;k++){ const cx=x+Math.round((k+.5)*w/7); if(k===3) porta(g,cx-20,HB-gH+30,40,gH-30,{c,s:s+k,kind:'madeira',wood:'#3a6a4a'}); else janela(g,cx-13,HB-gH+34,26,46,{c,sh,s:s+k*5,st:pick(['fechada','escura','tabuas'],hsh(k*7.1))}); }
  placa(g,x+w/2-tw('CASA DAS ONZE JANELAS',1)/2-6,HB-gH+6,'CASA DAS ONZE JANELAS','#2a3a5a','#f0e6c8',1);
  R(g,x,HB-12,w,12,c[3]); R(g,x,HB-12,w,2,c[1]); limo(g,x,HB-14,w,c,s); R(g,x+w,top,2,HB-top,'#1a1028'); }

/* ---------- Estação das Docas ---------- */
function galpaoDocas(g,x,w,n){ const c=rmp('#d6cab2'), ir=rmp('#56688a'), rf=rmp('#8e92a2'), top=HB-128, s=n*91;
  for(let y=0;y<46;y++){ const t=y/46, yy=top-46+y, ins=Math.round(22*(1-Math.sqrt(1-(1-t)*(1-t)))); R(g,x-6+ins,yy,w+12-ins*2,1,t<.15?rf[1]:t<.6?rf[2]:rf[3]); }
  for(let xx=x;xx<x+w;xx+=6) R(g,xx,top-30,1,30,rf[4]); for(let xx=x+60;xx<x+w;xx+=120) R(g,xx,top-44,3,44,rf[0]);
  R(g,x+w*.2,top-58,w*.6,14,rf[3]); R(g,x+w*.2,top-58,w*.6,2,rf[1]); for(let xx=x+w*.2+8;xx<x+w*.8-10;xx+=16){ const X=xx; R(g,X,top-54,10,8,'#1a1830'); if(hsh(X)>.5) emit(g,g=>R(g,X+1,top-53,8,6,'#e8b060')); }
  R(g,x,top,w,HB-top,c[2]); R(g,x-4,top,w+8,8,c[1]); R(g,x-4,top,w+8,2,c[0]); R(g,x-4,top+8,w+8,2,c[4]);
  for(let xx=x;xx<=x+w-12;xx+=120){ R(g,xx,top+10,12,HB-top-10,ir[2]); R(g,xx,top+10,3,HB-top-10,ir[1]); R(g,xx+9,top+10,3,HB-top-10,ir[4]);
    if(xx+120<=x+w){ const gx=xx+16, gw=96, gy=top+18, gh=HB-top-30; R(g,gx,gy,gw,gh,'#16203a');
      const lit=hsh(xx*.13+s)>.55; if(lit){ const X=gx; emit(g,g=>{ R(g,X+2,gy+2,gw-4,gh-4,'#6a3a2a'); R(g,X+4,gy+gh*.5,gw-8,gh*.46,'#b8683a'); R(g,X+8,gy+gh*.56,gw-16,6,'#e09a52'); for(let i=0;i<4;i++){ R(g,X+10+i*22,gy+gh*.62,8,gh*.38-2,'#3a1a14'); ell(g,X+14+i*22,gy+gh*.6,4,4,'#3a1a14'); } R(g,X+gw*.5-2,gy+6,4,10,'#ffd890'); }); glow(g,gx+gw/2,gy+gh*.6,gw*.8,'#ffa050',.04,3); }
      else { poly(g,[[gx,gy+gh*.6],[gx+gw*.6,gy],[gx+gw,gy],[gx+gw,gy+gh*.15],[gx,gy+gh*.9]],'#24305a'); }
      for(let k=1;k<4;k++) R(g,gx+k*24,gy,2,gh,ir[3]); for(let k=1;k<3;k++) R(g,gx,gy+k*gh/3,gw,2,ir[3]); } }
  R(g,x,HB-12,w,12,c[4]); R(g,x,HB-12,w,2,c[2]);
  placa(g,x+w/2-tw('ESTACAO DAS DOCAS  '+n,2)/2-6,top-24,'ESTACAO DAS DOCAS  '+n,'#1e3a6a','#f2ecd8',2);
  const my=HB-104; R(g,x-30,my,w+60,12,'#e8e4dc'); R(g,x-30,my,w+60,2,'#ffffff'); R(g,x-30,my+12,w+60,3,'#6a6a7a');
  for(let xx=x+40;xx<x+w;xx+=160){ R(g,xx-4,my+40,8,HB-my-40,'#e0dcd4'); R(g,xx-4,my+40,2,HB-my-40,'#ffffff'); line(g,xx,my+42,xx-24,my+14,'#e0dcd4',4); line(g,xx,my+42,xx+24,my+14,'#c8c4bc',4); ell(g,xx,HB-2,10,3,'#8a8690');
    const X=xx; emit(g,g=>{ R(g,X-6,my+13,12,3,'#fff0c0'); }); glow(g,xx,my+30,60,'#ffe0a0',.05,4); } }
function guindasteDocas(g,x,col,lbl){ const c=rmp(col||'#e8b830'), r=rmp('#8a4a2a'), top=30, lw=16;
  const leg=(lx)=>{ R(g,lx-2,top+70,lw+4,HB-top-70,c[5]); R(g,lx,top+70,lw,HB-top-70,c[2]); R(g,lx,top+70,4,HB-top-70,c[1]); R(g,lx+lw-4,top+70,4,HB-top-70,c[4]);
    for(let yy=top+80;yy<HB-10;yy+=22){ line(g,lx+2,yy,lx+lw-2,yy+20,c[4],2); line(g,lx+lw-2,yy,lx+2,yy+20,c[4],2); R(g,lx,yy,lw,2,c[3]); } for(let k=0;k<3;k++) blob(g,lx+1,top+90+hsh(lx+k)*180,lw-2,10,r[2]); };
  leg(x); leg(x+150); R(g,x-4,HB-40,174,10,c[5]); R(g,x-2,HB-38,170,6,c[2]); R(g,x-2,HB-38,170,1,c[1]);
  for(const wx of [x+8,x+158]){ ell(g,wx,HB-6,9,9,'#16121e'); ell(g,wx,HB-6,4,4,METAL[2]); }
  R(g,x-20,top+40,206,34,c[5]); R(g,x-18,top+42,202,30,c[2]); R(g,x-18,top+42,202,4,c[1]); for(let k=x-10;k<x+180;k+=16) R(g,k,top+50,2,18,c[3]);
  R(g,x+110,top+10,70,34,c[5]); R(g,x+112,top+12,66,30,c[2]); R(g,x+112,top+12,66,3,c[1]); R(g,x+120,top+18,22,16,GLASS[2]); R(g,x+122,top+20,8,12,GLASS[1]); emit(g,g=>R(g,x+146,top+18,22,16,'#e8a050'));
  if(lbl) textSh(g,lbl,x+10,top+50,2,c[0],c[4]);
  for(let k=0;k<340;k+=2){ const bx=x+150+k, by=top+12-Math.round(k*.2); R(g,bx,by,3,4,c[5]); R(g,bx,by+1,2,2,(k/2)%8<4?c[2]:c[1]); R(g,bx,by+18,3,3,c[5]); }
  for(let k=0;k<340;k+=18){ line(g,x+150+k,top+14-k*.2,x+159+k,top+31-k*.2-2,c[4],2); line(g,x+159+k,top+31-k*.2-2,x+168+k,top+14-(k+18)*.2,c[4],2); }
  line(g,x+170,top+10,x+490,top-56,'#1a1020'); R(g,x+486,top-52,2,180,'#1a1020'); gancho(g,x+487,top+132,.8); }

/* ---------- armazéns, barricada, porto ---------- */
function armazemTijolo(g,x,w,num,s){ const h=172, top=HB-h, ir=rmp('#4a5a6e'), cr=rmp('#d8ccb0');
  brick(g,x,top,w,h,s,'#a8583e'); shade(g,x,top,w*.3,h,'#fff0d0',.05);
  const cx=x+w/2; R(g,cx-120,top-22,240,24,cr[2]); R(g,cx-124,top-25,248,4,cr[1]); R(g,cx-124,top-25,248,1,cr[0]); R(g,cx-56,top-42,112,22,cr[2]); R(g,cx-60,top-45,120,4,cr[1]);
  R(g,x-4,top-4,w+8,8,cr[2]); R(g,x-4,top-4,w+8,2,cr[0]); R(g,x-4,top+4,w+8,2,cr[4]);
  const t=num; textSh(g,t,cx-tw(t,2)/2,top-36,2,'#3a2a20',cr[3]);
  const nd=Math.max(1,Math.floor(w/260)); for(let k=0;k<nd;k++){ const dx=Math.round(x+(k+.5)*w/nd-72), dw=144, dh=128;
    R(g,dx-8,HB-dh-10,dw+16,dh+10,cr[3]); R(g,dx-8,HB-dh-10,dw+16,3,cr[1]); R(g,dx,HB-dh,dw,dh,'#120a1c');
    const open=hsh(s+k*3)>.45?Math.round(dw*(.3+hsh(s+k)*.4)):0;
    if(open){ R(g,dx+4,HB-34,open-4,34,'#1e1630'); for(let i=0;i<3;i++) R(g,dx+8+i*18,HB-30-i*4,14,26+i*4,'#2e2440'); const X=dx; emit(g,g=>R(g,X+6,HB-dh+10,Math.max(4,open-16),4,'#d89050')); }
    R(g,dx+open,HB-dh,dw-open,dh,ir[2]); for(let xx=dx+open+4;xx<dx+dw-2;xx+=10){ R(g,xx,HB-dh,2,dh,ir[3]); R(g,xx+2,HB-dh,1,dh,ir[1]); } R(g,dx+open,HB-dh,dw-open,4,ir[1]); R(g,dx+open,HB-dh/2,dw-open,3,ir[4]); R(g,dx+open,HB-dh,2,dh,ir[0]);
    R(g,dx-10,HB-dh-14,dw+20,4,ir[4]); for(let i=0;i<4;i++) streak(g,dx+open+8+hsh(s+i+k)*(dw-open-16),HB-dh+6,10+hsh(i)*30,3,'#8a4a2a');
    if(hsh(s*3+k)>.4) pixo(g,dx+open+6,HB-30,s+k*7,pick(['#e8e0d0','#e83a5a','#1a1020'],hsh(s+k))); }
  for(let xx=x+30;xx<x+w-40;xx+=90){ if(Math.abs(xx-cx)<80) continue; janela(g,xx,top+30,26,30,{c:rmp('#a8583e'),sh:ir,s:s+xx,st:pick(['escura','quebrada','acesa','tabuas'],hsh(xx*.7+s)),fr:cr,arch:true}); }
  tag(g,x+40+hsh(s)*(w-200),HB-150,s); R(g,x+w,top,2,h,'#1a1028'); }
function empilhadeira(g,x,yb,s,tomb){ const c=rmp('#e8b830'), T='#16121e'; ell(g,x+60,yb,70,6,'rgba(10,6,20,.55)');
  if(tomb){ g.save(); g.translate(x+60,yb-20); g.rotate(-1.35); x=-60; yb=20; }
  R(g,x+10,yb-46,84,34,c[5]); R(g,x+11,yb-45,82,32,c[2]); R(g,x+11,yb-45,82,3,c[1]); R(g,x+80,yb-45,13,32,c[3]);
  R(g,x+20,yb-92,4,48,T); R(g,x+70,yb-92,4,48,T); R(g,x+18,yb-94,58,4,T); line(g,x+22,yb-60,x+72,yb-60,T,2);
  R(g,x+26,yb-74,40,26,'#1a1830'); R(g,x+28,yb-72,10,22,GLASS[1]);
  R(g,x-14,yb-110,6,98,'#2a2832'); R(g,x-10,yb-110,2,98,'#5a5866'); R(g,x-34,yb-16,28,4,'#3a3844'); R(g,x-34,yb-40,28,4,'#3a3844');
  for(const wx of [x+28,x+80]){ ell(g,wx,yb-10,13,13,T); ell(g,wx,yb-10,6,6,METAL[2]); }
  textSh(g,'E-'+(3+Math.floor(hsh(s)*6)),x+40,yb-36,1,c[0],c[4]); for(let i=0;i<4;i++) blob(g,x+14+hsh(s+i)*70,yb-44+hsh(s*2+i)*28,10,5,'#8a4a2a');
  if(tomb) g.restore(); }
function barricadaChoque(g,x,yb,s){ sacos(g,x+150,yb,4); ell(g,x+70,yb,90,7,'rgba(10,6,20,.5)');
  for(let i=0;i<5;i++){ const sx=x+i*30, tilt=(hsh(s+i)-.5)*6, hgt=74+hsh(s*3+i)*10; poly(g,[[sx,yb],[sx+26,yb],[sx+26+tilt,yb-hgt],[sx+tilt,yb-hgt]],'rgba(150,180,220,.35)'); line(g,sx+tilt,yb-hgt,sx+26+tilt,yb-hgt,'#c8d8f0'); line(g,sx,yb,sx+tilt,yb-hgt,'#2a3448',2); line(g,sx+26,yb,sx+26+tilt,yb-hgt,'#2a3448',2);
    R(g,sx+4+tilt*.5,yb-hgt*.6,18,8,'#1a1a2a'); text(g,'CHOQUE',sx+3+tilt*.5,yb-hgt*.6+1,1,'#e8e8f0'); if(hsh(s*7+i)>.6) line(g,sx+6,yb-30,sx+20,yb-50,'#e8f0ff'); }
  cone(g,x+270,yb-2); cone(g,x-20,yb+2,true); }
function pilhaConteineres(g,x,yb,s,n){ const cols=['#c84a3a','#3a7ab8','#4a8a4a','#e8a03a','#7a4a8a','#2a8a8a','#b8b0a0']; const lbls=[null,'NORTE','RIO',null,'PARA','AMAZONIA',null];
  for(let r=0;r<n;r++){ const w=240-r*14, xx=x+r*10+(hsh(s+r)-.5)*16; conteiner(g,xx,yb-r*110,pick(cols,hsh(s*3+r)),w,pick(lbls,hsh(s*5+r))); } }
function trelica(g,x0,y0,x1,y1,wd,c){ const dx=x1-x0, dy=y1-y0, Ln=Math.hypot(dx,dy), nx=-dy/Ln*wd/2, ny=dx/Ln*wd/2;
  line(g,x0+nx,y0+ny,x1+nx*.4,y1+ny*.4,c[4],3); line(g,x0-nx,y0-ny,x1-nx*.4,y1-ny*.4,c[2],3); line(g,x0-nx,y0-ny-1,x1-nx*.4,y1-ny*.4-1,c[1],1);
  const n=Math.max(2,Math.round(Ln/(wd*1.1))); for(let i=0;i<n;i++){ const t0=i/n, t1=(i+1)/n, w0=1-.6*t0, w1=1-.6*t1; line(g,x0+dx*t0+nx*w0,y0+dy*t0+ny*w0,x0+dx*t1-nx*w1,y0+dy*t1-ny*w1,c[3],2); line(g,x0+dx*t1-nx*w1,y0+dy*t1-ny*w1,x0+dx*t1+nx*w1,y0+dy*t1+ny*w1,c[3],1); } }
function gancho(g,x,y,k){ k=k||1; const m=rmp('#d8a83a'); R(g,x-8*k,y-14*k,16*k,14*k,m[5]); R(g,x-7*k,y-13*k,14*k,12*k,m[2]); R(g,x-7*k,y-13*k,14*k,3,m[1]); for(let i=0;i<4;i++) R(g,x-5*k+i*3*k,y-10*k,1,8*k,m[3]);
  R(g,x-2*k,y,4*k,6*k,'#3a3448'); const r=9*k; for(let a=0;a<Math.PI*1.35;a+=.1){ const hx2=x+Math.cos(a+Math.PI*.05)*r, hy2=y+6*k+r+Math.sin(a+Math.PI*.05)*r; R(g,hx2-2*k,hy2-2*k,4*k,4*k,'#3a3448'); R(g,hx2-k,hy2-2*k,2*k,1,'#8a8a9a'); } }
function guindastePorto(g,x,k,col,hookY,num){ const c=rmp(col||'#c25a30'), yb=HB+2, gw=Math.round(130*k), lh=Math.round(96*k);
  for(const lx of [x,x+gw]){ R(g,lx-8*k,yb-lh,16*k,lh,c[5]); R(g,lx-7*k,yb-lh,14*k,lh,c[2]); R(g,lx-7*k,yb-lh,4*k,lh,c[1]); R(g,lx+3*k,yb-lh,4*k,lh,c[4]);
    R(g,lx-14*k,yb-12*k,28*k,12*k,c[4]); ell(g,lx-7*k,yb-3,5*k,5*k,'#16121e'); ell(g,lx+7*k,yb-3,5*k,5*k,'#16121e'); }
  line(g,x,yb-lh+10,x+gw,yb-20*k,c[3],3); line(g,x+gw,yb-lh+10,x,yb-20*k,c[3],3);
  const ty=yb-lh-14*k; R(g,x-12*k,ty,gw+24*k,16*k,c[5]); R(g,x-11*k,ty+1,gw+22*k,13*k,c[2]); R(g,x-11*k,ty+1,gw+22*k,3,c[1]);
  const cx=x+gw/2; R(g,cx-70*k,ty-44*k,30*k,30*k,'#2e2a3a'); R(g,cx-70*k,ty-44*k,30*k,3,'#5a566a');
  R(g,cx-46*k,ty-56*k,92*k,56*k,c[5]); R(g,cx-45*k,ty-55*k,90*k,54*k,c[2]); R(g,cx-45*k,ty-55*k,90*k,4,c[1]); R(g,cx+25*k,ty-55*k,20*k,54*k,c[3]);
  for(let i=0;i<4;i++) R(g,cx-40*k+i*12*k,ty-44*k,2,30*k,c[4]);
  const wx=cx+8*k, wy=ty-46*k; R(g,wx,wy,24*k,18*k,'#1a1428'); emit(g,g=>{ R(g,wx+2,wy+2,24*k-4,18*k-4,'#f0b060'); }); glow(g,wx+12*k,wy+9*k,40*k,'#ffb860',.06,4);
  if(num) textSh(g,num,cx-38*k,ty-24*k,Math.max(1,Math.round(2*k)),c[0],c[4]);
  const px=cx+20*k, py=ty-50*k, tx=px+Math.round(230*k), tyy=Math.max(10,Math.round(py-250*k)); trelica(g,px,py,tx,tyy,Math.round(22*k),c);
  const mx=cx-10*k, myy=ty-120*k; line(g,cx-30*k,ty-54*k,mx,myy,c[3],3); line(g,cx+10*k,ty-54*k,mx,myy,c[3],3); line(g,mx,myy,tx,tyy,'#1a1020'); line(g,mx,myy,cx-60*k,ty-44*k,'#1a1020');
  const hy=hookY||HB-60; R(g,tx-2,tyy,1,hy-tyy-14*k,'#1a1020'); R(g,tx+2,tyy,1,hy-tyy-14*k,'#1a1020'); gancho(g,tx,hy,k);
  emit(g,g=>{ R(g,tx-2,tyy-4,4,4,'#ff4a3a'); }); glow(g,tx,tyy-2,30,'#ff3a2a',.08,4);
  for(let i=0;i<8;i++) blob(g,x-8*k+hsh(x+i)*gw,yb-lh+hsh(i*3+x)*lh,8*k,5*k,mix(c[3],'#5a2a1a',.5)); }
function torreLuz(g,x){ const ir=rmp('#5a5a6a'); R(g,x-4,40,8,HB-40,ir[4]); R(g,x-3,40,6,HB-40,ir[2]); R(g,x-3,40,2,HB-40,ir[1]); R(g,x-26,30,52,12,ir[4]); for(let i=0;i<4;i++){ const lx=x-22+i*12; R(g,lx,32,10,8,'#2a2836'); emit(g,g=>R(g,lx+1,33,8,6,'#f2f6ff')); }
  glow(g,x,40,110,'#d8e8ff',.05,5); reg(LAMPS,{x:x/RS,y:40/RS,r:30,mid:true}); emit(g,g=>{ g.save(); g.globalAlpha=.06; poly(g,[[x-24,42],[x+24,42],[x+140,HB+60],[x-140,HB+60]],'#e8f0ff'); g.restore(); }); }

/* =====================================================================
   COMPOSIÇÃO POR ÁREA
   ===================================================================== */
function compose(A){ const X0=A.x0*RS, X1=A.x1*RS, L=X1-X0, s=A.n*1000;
  const tel=(a,b)=>add(a,b,0,(g,lo,hi)=>fundoTelhados(g,Math.max(lo,a),Math.min(hi,b),s));
  const rua=(walk,col,irr)=>walkStreet(X0,X1,walk||'portuguesa',col||'#8e8698',s,irr!==false,false);
  const agua=(a,b)=>{ WATER.push({x0:a/RS,x1:b/RS}); add(a,b,0,(g,lo,hi)=>rio(g,Math.max(lo,a),Math.min(hi,b),s)); };
  const cais=(a,b)=>add(a,b,1,(g,lo,hi)=>caisPedra(g,Math.max(lo,a),Math.min(hi,b)));
  const frota=(a,b,step,wl,sd)=>{ for(let x=a+30,i=0;x<b-180;x+=step,i++){ const xx=Math.round(x+hsh(sd+i)*step*.25), w=Math.min(Math.round(200+hsh(sd*3+i)*150),b-xx-30); if(w<170) continue; const wl0=Math.round(wl-hsh(i*7+sd)*6), dir=hsh(i+sd*5)>.5?1:-1, ss=sd+i*17; add(xx-40,xx+w+40,0,g=>barcoRegional(g,xx,wl0,w,ss,dir)); } };
  const palms=(xs,k)=>xs.forEach((r,i)=>{ const x=X0+r; add(x-160,x+160,1,g=>palmMid(g,x,HB-4,(k||1)*(.92+hsh(i+s)*.16))); });
  const mang=(xs,k)=>xs.forEach((r,i)=>{ const x=X0+r; add(x-200,x+200,1,g=>arvore(g,x,HB-4,x,(k||1.3)*(.9+hsh(i+s)*.2))); });
  const chao=(fn)=>add(X0,X1,3,(g,lo,hi)=>{ const a=Math.max(lo,X0), b=Math.min(hi,X1); if(b>a) fn(g,a,b); });
  const lajes=(col,trilho)=>chao((g,a,b)=>{ fSlabs(g,a,b,col,s,HB,X0); shade(g,a,HB,b-a,6,'#140a24',.45); if(trilho) trilhosBonde(g,a,b); });
  const voo=(n)=>{ for(let i=0;i<n;i++){ const x=X0+hsh(s+i*3.3)*L, y=40+hsh(s*2+i)*120; add(x-12,x+12,0,g=>urubu(g,x,y,i,true)); } };
  switch(A.id){
  case 'relogio':
    chaoExtras(X0,X1,s+3,{faixa:false}); acidentes(X0,X1,s,['racha','poca','sangue']); borda(X0,X1,s+7,['barraca','lixo','carro','entulho']);
    tel(X0,X0+2000); tel(X0+3500,X1); agua(X0+2000,X0+3500); voo(5);
    casarioBelem(X0,X0+2000,s,{});
    add(X0+2000,X0+3500,1,(g,lo,hi)=>balaustrada(g,Math.max(lo,X0+2000),Math.min(hi,X0+3500)));
    mang([2160,3340],1.25); add(X0+2560,X0+2840,1,g=>relogioFerro(g,X0+2700,HB-2));
    casarioBelem(X0+3500,X1,s+40,{});
    rua('portuguesa','#8e8698'); lampRow(X0,X1,700,true,300); decals(X0,X1,s,{}); fiosAdd(X0,X0+2000,s); fiosAdd(X0+3500,X1,s);
    for(const r of [.1,.36,.66,.9]){ const x=X0+L*r; add(x-60,x+140,5,g=>pilhaPaneiros(g,x,HB+52,s+r*100)); } break;
  case 'acai':
    chaoExtras(X0,X1,s+3,{faixa:false}); acidentes(X0,X1,s,['poca','sangue','buraco']); borda(X0,X1,s+7,['lixo','entulho','barraca']);
    tel(X0,X1); casarioBelem(X0,X1,s,{signs:.55}); voo(4);
    { const F0=X0+180, F1=F0+Math.floor((L-360)/180)*180; add(F0-10,F1+10,1,(g,lo,hi)=>feiraCoberta(g,lo,hi,F0,F1,'feira',s)); }
    for(let k=0;k<9;k++){ const x=X0+240+k*610+hsh(k+s)*80; if(Math.abs(x+75-(X0+L*.5))<260) continue; add(x-20,x+200,5,g=>barracaAcai(g,x,HB+58+(k%2)*10,s+k)); }
    for(const r of [.2,.47,.78]){ const x=X0+L*r; add(x-60,x+140,5,g=>pilhaPaneiros(g,x,HB+76,s+r*77)); }
    rua('portuguesa','#867e8e'); lampRow(X0,X1,760,false,380); decals(X0,X1,s,{}); fiosAdd(X0,X1,s); break;
  case 'ervas':
    chaoExtras(X0,X1,s+3,{faixa:false}); acidentes(X0,X1-1500,s,['poca','sangue','racha']); borda(X0,X1-1500,s+7,['lixo','barraca','entulho']);
    tel(X0,X1); casarioBelem(X0,X1,s,{signs:.3,tiles:.35});
    { const F0=X0+120, F1=F0+Math.floor((L-1600)/180)*180; add(F0-10,F1+10,1,(g,lo,hi)=>feiraCoberta(g,lo,hi,F0,F1,'ervas',s)); }
    add(X0+4640,X0+5280,1,g=>bancaErvas(g,X0+4760,HB-2,s,true));
    for(const r of [.14,.33,.62]){ const x=X0+L*r; add(x-30,x+200,5,g=>bancaErvas(g,x,HB+58,s+r*91,false)); }
    for(let i=0;i<10;i++){ const x=X0+hsh(s+i*7)*L*.8, y=ST+20+hsh(s*3+i)*140; add(x-10,x+130,4,g=>folhas(g,x,y,s+i)); }
    rua('cimento','#7e7688'); lampRow(X0,X1,760,false,500); decals(X0,X1,s,{}); fiosAdd(X0,X1,s); break;
  case 'ferro':
    chaoExtras(X0,X1,s+3,{faixa:false,slabs:false}); acidentes(X0,X1,s,['poca','sangue','racha']); borda(X0,X0+4400,s+7,['lixo','barraca','carro']);
    tel(X0,X0+820); casarioBelem(X0,X0+780,s,{}); voo(7);
    agua(X0+4560,X1); frota(X0+4600,X1,420,HB-14,s+5); cais(X0+4560,X1);
    add(X0+780,X0+4660,1,g=>mercadoFerro(g,X0+880,3640));
    lajes('#a8a4ac');
    for(const r of [.08,.22,.4,.58,.84,.95]){ const x=X0+L*r; add(x-20,x+160,5,g=>peixeBanca(g,x,HB+56+hsh(r*9)*14,s+r*53)); }
    lampRow(X0,X1,640,true,300); decals(X0,X1,s,{holes:false}); fiosAdd(X0,X0+780,s); break;
  case 'doca':
    chaoExtras(X0,X1,s+3,{faixa:false,slabs:false,patch:false}); acidentes(X0,X1,s,['poca','sangue','racha']); borda(X0,X1,s+7,['lixo','entulho','barraca']);
    agua(X0,X1); add(X0+300,X0+1000,0,g=>torresLonge(g,X0+620,HZ+2)); frota(X0+900,X1,520,HB-34,s+9); frota(X0,X1,380,HB-14,s+3); cais(X0,X1); voo(8);
    for(let x=X0+240;x<X1-200;x+=480){ const xx=x; add(xx-30,xx+200,1,g=>{ cabecoMid(g,xx,HB-14); sag(g,xx,HB-36,xx+170,HB-46,12,'#c8b07a',2); }); }
    chao((g,a,b)=>fMolhe(g,a,b));
    for(const r of [.06,.3,.55,.8]){ const x=X0+L*r; add(x-60,x+140,5,g=>pilhaPaneiros(g,x,HB+54,s+r*31)); }
    for(const r of [.18,.66]){ const x=X0+L*r; add(x-20,x+120,5,g=>redePesca(g,x,HB+70,s+r*13)); }
    for(const r of [.42,.92]){ const x=X0+L*r; add(x-20,x+150,5,g=>caixotes(g,x,HB+60,s+r*17,3)); }
    for(let i=0;i<8;i++){ const x=X0+hsh(s*5+i)*L, y=HB+40+hsh(s+i*3)*40; add(x-12,x+12,5,g=>urubu(g,x,y,s+i)); }
    lampRow(X0,X1,760,false,380); decals(X0,X1,s,{wet:true,holes:false,stones:false}); break;
  case 'barcos':
    agua(X0,X1); frota(X0+120,X1,460,HB-36,s+11); frota(X0,X1,330,HB-18,s+2); voo(6);
    add(X0,X1,1,(g,lo,hi)=>bordaTrapiche(g,Math.max(lo,X0),Math.min(hi,X1)));
    chao((g,a,b)=>fTabuas(g,a,b,s));
    acidentes(X0,X1,s,['sangue','poca']);
    for(const r of [.1,.48,.86]){ const x=X0+L*r; add(x-20,x+120,5,g=>redePesca(g,x,HB+64,s+r*19)); }
    for(const r of [.28,.7]){ const x=X0+L*r; add(x-20,x+150,5,g=>caixotes(g,x,HB+56,s+r*7,2)); }
    for(const r of [.36,.6,.95]){ const x=X0+L*r; add(x-60,x+140,5,g=>pilhaPaneiros(g,x,HB+70,s+r*29)); }
    lampRow(X0,X1,700,false,350); decals(X0,X1,s,{holes:false,stones:false,cars:false}); break;
  case 'presepio':
    chaoExtras(X0,X1,s+3,{faixa:false}); acidentes(X0,X1,s,['racha','buraco','sangue']); borda(X0,X1,s+7,['entulho','barricada','lixo']);
    tel(X0,X1); add(X0,X0+1520,1,g=>casaOnzeJanelas(g,X0+40,1420));
    mang([1760,2420,3080,3760],1.45); add(X0+1500,X0+4420,1,g=>fortePresepio(g,X0+1560,2800,s));
    casarioBelem(X0+4420,X1,s+40,{});
    rua('cimento','#8a8292'); lampRow(X0,X1,700,true,250); decals(X0,X1,s,{}); fiosAdd(X0+4420,X1,s); break;
  case 'docas':
    chaoExtras(X0,X1,s+3,{faixa:false,slabs:false,patch:false}); acidentes(X0,X1,s,['racha','poca','sangue']); borda(X0,X1,s+7,['conteiner','tenda','barricada']);
    agua(X0,X1); add(X0+2600,X0+3200,0,g=>navio(g,X0+2800,HZ+26));
    palms([1560,1840,3460,3740],1.0);
    [[0,1440,1],[1900,1440,2],[3800,1440,3]].forEach(([r,w,n])=>add(X0+r-60,X0+r+w+60,1,g=>galpaoDocas(g,X0+r,w,n)));
    for(const r of [1500,3400]){ const x=X0+r; add(x-30,x+520,1,g=>guindasteDocas(g,x,'#e8b830')); }
    lajes('#b8907a',true);
    for(const r of [.2,.55,.88]){ const x=X0+L*r; add(x-20,x+100,5,g=>banco(g,x,HB+40)); }
    lampRow(X0,X1,640,true,320); decals(X0,X1,s,{holes:false}); break;
  case 'armazem':
    chaoExtras(X0,X1,s+3,{faixa:false}); acidentes(X0,X1,s,['racha','buraco','poca','sangue']); borda(X0,X1,s+7,['conteiner','capotado','entulho']);
    tel(X0,X1);
    [[0,1300,'ARMAZEM 4'],[1360,1500,'ARMAZEM 5'],[2920,1300,'ARMAZEM 6'],[4280,1480,'ARMAZEM 7']].forEach(([r,w,t],i)=>add(X0+r-10,X0+r+w+10,1,g=>armazemTijolo(g,X0+r,w,t,s+i*31)));
    lajes('#9a96a0',true);
    add(X0+L*.5-160,X0+L*.5+200,5,g=>barricadaChoque(g,X0+L*.5-140,HB+62,s));
    add(X0+L*.24,X0+L*.24+200,5,g=>empilhadeira(g,X0+L*.24,HB+66,s,false)); add(X0+L*.76-60,X0+L*.76+200,5,g=>empilhadeira(g,X0+L*.76,HB+62,s+3,true));
    for(const r of [.12,.64,.92]){ const x=X0+L*r; add(x-20,x+150,5,g=>caixotes(g,x,HB+56,s+r*11,3)); }
    lampRow(X0,X1,760,false,400); decals(X0,X1,s,{}); fiosAdd(X0,X1,s); break;
  case 'porto':
    chaoExtras(X0,X1,s+3,{faixa:false,slabs:false,patch:false}); acidentes(X0,X1,s,['racha','poca','sangue']); borda(X0,X1,s+7,['conteiner','capotado','barricada']);
    agua(X0,X1); add(X0+3300,X0+3700,0,g=>navio(g,X0+3500,HZ+24)); cais(X0,X1); voo(4);
    [[500,.9,'G-1'],[2400,1,'G-2'],[4300,.95,'G-3']].forEach(([r,k,n])=>{ const x=X0+r; add(x-60,x+Math.round(330*k)+40,1,g=>guindastePorto(g,x,k,'#c25a30',HB-90,n)); });
    [[60,2],[1300,1],[2000,2],[3500,2],[5000,1]].forEach(([r,n],i)=>{ const x=X0+r; add(x-20,x+270,1,g=>pilhaConteineres(g,x,HB-2,s+i*7,n)); });
    lajes('#8e8a94',true);
    for(const r of [.3,.7]){ const x=X0+L*r; add(x-20,x+270,5,g=>conteiner(g,x,HB+70,pick(['#c84a3a','#3a7ab8','#4a8a4a'],hsh(r*7)),250,null)); }
    for(const r of [.12,.52,.9]){ const x=X0+L*r; add(x-20,x+150,5,g=>caixotes(g,x,HB+62,s+r*5,3)); }
    lampRow(X0,X1,820,true,420); decals(X0,X1,s,{holes:false,cars:false}); break;
  case 'cais': {
    acidentes(X0,X0+3000,s,['racha','sangue']); chaoExtras(X0,X1,s+3,{faixa:false,slabs:false,patch:false});
    agua(X0,X1); add(X0+500,X0+1300,0,g=>navio(g,X0+800,HZ+26)); cais(X0,X1); voo(9);
    add(X0+200,X0+600,1,g=>guindastePorto(g,X0+260,.8,'#a84a2a',HB-120,'G-7'));
    [[700,2],[1500,1],[2100,2],[2600,1]].forEach(([r,n],i)=>{ const x=X0+r; add(x-20,x+270,1,g=>pilhaConteineres(g,x,HB-2,s+i*5,n)); });
    for(const r of [1200,4500]){ const x=X0+r; add(x-150,x+150,1,g=>torreLuz(g,x)); }
    add(X0+4380,X0+4680,1,g=>pilhaConteineres(g,X0+4400,HB-2,s+31,2)); add(X0+2950,X0+3200,1,g=>caixotes(g,X0+2960,HB-4,s+5,3));
    const hx=X0+Math.round(L*.8), k=1.5, gx=hx-Math.round(315*k)+40; add(gx-60,gx+Math.round(330*k)+60,1,g=>guindastePorto(g,gx,k,'#c25a30',HB-60,'G-9'));
    lajes('#8a8690',true);
    for(const r of [.08,.3,.55,.97]){ const x=X0+L*r; add(x-20,x+150,5,g=>caixotes(g,x,HB+60,s+r*3,r>.9?2:3)); }
    for(let i=0;i<4;i++){ const x=X0+L*(.62+i*.1), y=420+hsh(i)*60; add(x-120,x+120,4,g=>pocaGrande(g,x,y,180,i)); }
    add(X0,X1,4,(g,lo,hi)=>luzRua(g,Math.max(lo,X0),Math.min(hi,X1),HB+30,X0,1100,600)); break; }
  }
}
function fiosAdd(X0,X1,s){ add(X0,X1,2,(g,lo,hi)=>fios(g,Math.max(lo,X0)-420,Math.min(hi,X1)+420,s)); }

/* =====================================================================
   TILES DO MID
   ===================================================================== */
const TILE=2048, NT=Math.ceil(WORLD*RS/TILE), midTiles=new Array(NT).fill(null);
const [mid]=mk(1,1); // compat: o mid de um canvas só não cabe; quem desenha é drawMid
let built=false, engineDM=false, fromSky=false, pend=-1;
const MASK={};
const GRADE=[[0,'#9088d6'],[.3,'#8880ce'],[.5,'#746cb8'],[.546,'#5e569a'],[.556,'#8c84c6'],[.68,'#9c94ce'],[.86,'#827ab8'],[1,'#544c88']]; // noite mais funda (contraste tipo Cosmic Invasion)
// luz do cenário (dia e clima, DN-03): 'noite' (noite/madrugada/Lua de Sangue), 'dusk' (anoitecer: postes acesos) e 'dia' (manhã/tarde: sem emissivos)
const GRADES={noite:GRADE,dusk:[[0,'#f4d4e2'],[.3,'#e8c6dc'],[.5,'#d4b0d0'],[.546,'#ba94bc'],[.556,'#dcbcd6'],[.68,'#e4c8de'],[.86,'#ccacce'],[1,'#9e7eae']],
  dia:[[0,'#fffaf2'],[.3,'#fcf6f2'],[.5,'#f6eef0'],[.546,'#e4dcea'],[.556,'#f8f0f2'],[.68,'#faf2f2'],[.86,'#ece4ee'],[1,'#d6cee4']]};
let LIGHT='noite', RL='noite', PREV=null;
const lightOf=m=>m==='manha'||m==='tarde'||m==='dia'?'dia':m==='anoitecer'||m==='dusk'?'dusk':'noite';
/* troca a luz dos tiles: os tiles da luz antiga continuam na tela até os novos ficarem prontos (gerados aos poucos
   no idle do motor) e então somem num fade curto, sem engasgo. */
function setLight(m,now){ const l=lightOf(m); if(l===LIGHT) return; PREV=!now&&midTiles.some(Boolean)?{t:midTiles.slice(),a:1,ready:false}:null; midTiles.fill(null); job=null; LIGHT=l; }
const LAY={}, SATK={noite:.26,dusk:.18,dia:.12};
function gradeLayer(c,g){ // gradação noturna (multiply) preservando o alfa da camada
  if(!MASK.c) [MASK.c,MASK.g]=mk(TILE,HH); MASK.g.clearRect(0,0,TILE,HH); MASK.g.drawImage(c,0,0);
  g.globalCompositeOperation='saturation'; g.globalAlpha=SATK[RL]||0; g.fillStyle='#ff2a2a'; if(g.globalAlpha>0) g.fillRect(0,0,TILE,HH); g.globalAlpha=1; // reforço de saturação antes da gradação (materiais vivos; cinzas ficam cinzas)
  g.globalCompositeOperation='multiply'; const gk='gr'+RL; if(!LAY[gk]){ LAY[gk]=g.createLinearGradient(0,0,0,HH); (GRADES[RL]||GRADE).forEach(([o,col])=>LAY[gk].addColorStop(o,col)); } g.fillStyle=LAY[gk]; g.fillRect(0,0,TILE,HH);
  g.globalCompositeOperation='destination-in'; g.drawImage(MASK.c,0,0); g.globalCompositeOperation='source-over'; }
// tile em etapas (uma camada z por etapa): o pré-carregamento do próximo tile se espalha por vários quadros
function tileJob(i){ const [c,g]=mk(TILE,HH), tx=i*TILE, lo=tx, hi=tx+TILE; if(!LAY.c) [LAY.c,LAY.g]=mk(TILE,HH); const L=LAY.g;
  const els=DLs.filter(e=>e.x1>lo&&e.x0<hi), zs=[...new Set(els.map(e=>e.z))]; let n=0; const lt=LIGHT;
  return {i,c,lt,done:()=>n>=zs.length,step(){ const z=zs[n++]; RL=lt;
    L.setTransform(1,0,0,1,0,0); L.clearRect(0,0,TILE,HH); L.translate(-tx,0); LQ=[];
    for(const e of els) if(e.z===z) e.f(L,lo,hi);
    const q=LQ; LQ=null; L.setTransform(1,0,0,1,0,0); gradeLayer(LAY.c,L); L.translate(-tx,0);
    for(const [k,fn] of q) if(k===0) fn(L);
    g.setTransform(1,0,0,1,0,0); g.drawImage(LAY.c,0,0); g.translate(-tx,0);
    for(const [k,fn] of q) if(k===1&&lt!=='dia') fn(g); RL='noite'; }}; }
let job=null;
function renderTile(i){ const J=(job&&job.i===i&&job.lt===LIGHT)?job:tileJob(i); if(J===job) job=null; while(!J.done()) J.step(); return J.c; }
function tileAt(i){ if(!midTiles[i]) midTiles[i]=renderTile(i); return midTiles[i]; }
// avança o pré-carregamento por até ms milissegundos (o motor chama a cada quadro); devolve true se ainda há trabalho
function idle(ms){ const t0=performance.now(); while(job && performance.now()-t0<ms){ if(midTiles[job.i]){ job=null; break; } job.step(); if(job.done()){ if(job.lt===LIGHT) midTiles[job.i]=job.c; job=null; } } return !!job; }
// pré-gera os tiles visíveis numa câmera (tela de carregamento)
function warm(cam){ if(!built) build(); const px=Math.round(cam*RS), i0=Math.max(0,Math.floor(px/TILE)), i1=Math.min(NT-1,Math.floor((px+HW-1)/TILE)); for(let i=i0;i<=i1;i++) tileAt(i); }
function drawMid(g,cam){ if(!built) build(); if(!fromSky) engineDM=true;
  const px=Math.round(cam*RS), T=g.getTransform(); g.save(); g.setTransform(1,0,0,1,T.e,T.f); g.imageSmoothingEnabled=false;
  const i0=Math.max(0,Math.floor(px/TILE)), i1=Math.min(NT-1,Math.floor((px+HW-1)/TILE));
  let ok=true;
  for(let i=i0;i<=i1;i++){ const P=PREV&&PREV.t[i];
    if(P&&!midTiles[i]){ ok=false; g.drawImage(P,i*TILE-px,0); if(!job) job=tileJob(i); continue; }
    g.drawImage(tileAt(i),i*TILE-px,0); if(P&&PREV.ready){ g.globalAlpha=Math.max(0,PREV.a); g.drawImage(P,i*TILE-px,0); g.globalAlpha=1; } }
  g.restore();
  if(PREV){ if(ok){ PREV.ready=true; PREV.a-=.04; if(PREV.a<=0) PREV=null; } else if(!engineIdle) setTimeout(()=>idle(1e9),0); }
  for(let i=0;i<NT;i++) if(midTiles[i]&&(i<i0-1||i>i1+2)) midTiles[i]=null;
  const nx=i1+1; if(!PREV&&nx<NT&&!midTiles[nx]&&(!job||job.i!==nx)){ job=tileJob(nx); if(!engineIdle) setTimeout(()=>idle(1e9),0); } }
let engineIdle=false; // o motor chama MAP.idle(ms) por quadro; sem ele, cai no setTimeout antigo (tile inteiro)

/* =====================================================================
   PRIMEIRO PLANO (parallax 1.25)
   ===================================================================== */
const fgCache={};
function fgSombrinha(g,w){ const cx=w*.55, cy=HH-250, r=86, cols=['#e83a3a','#ffd23f','#3a8ae8','#4ac860'];
  R(g,cx-3,cy-4,6,HH-cy+4,SIL); R(g,cx-3,cy-4,1,HH-cy+4,RIM);
  const n=8, h=Math.round(r*.5); for(let dy=0;dy<h;dy++){ const t=dy/h, hw=r*Math.sqrt(1-t*t), y=cy-dy; for(let i=0;i<n;i++){ const u0=-1+2*i/n, u1=-1+2*(i+1)/n, xa=cx+hw*Math.sin(u0*Math.PI/2), xb=cx+hw*Math.sin(u1*Math.PI/2); R(g,xa,y,Math.max(1,xb-xa+1),1,mix(cols[i%4],'#0c0618',i<3?.62:.74)); } }
  for(let i=0;i<n;i++){ const u=-1+2*(i+.5)/n; ell(g,cx+r*Math.sin(u*Math.PI/2),cy+2,r/n+2,4,mix(cols[i%4],'#0c0618',.8)); }
  R(g,cx-r,cy-h*.2,r*.6,2,RIM); for(let i=0;i<5;i++){ const fx=cx-r+20+i*34; for(let j=0;j<60;j+=2) R(g,fx+Math.round(Math.sin(j*.3+i)*3),cy+6+j,2,2,mix(pick(cols,i/5),'#0c0618',.7)); } }
function fgBoneco(g,w){ g.save(); g.beginPath(); const cx=w/2, hy=HH-150;
  g.ellipse(cx,hy,72,80,0,0,Math.PI*2); g.moveTo(cx-120,HH); g.lineTo(cx-60,HH-80); g.lineTo(cx+60,HH-80); g.lineTo(cx+120,HH); g.closePath();
  g.ellipse(cx,hy-62,96,22,0,0,Math.PI*2); g.rect(cx-56,hy-128,112,66);
  g.clip(); silGrad(g,0,hy-140,w,HH-hy+140); g.restore();
  R(g,cx-56,hy-128,1,66,RIM); R(g,cx-96,hy-64,60,2,RIM); for(let a=-2.6;a<-1;a+=.04) R(g,cx+Math.cos(a)*72,hy+Math.sin(a)*80,2,2,RIM);
  ell(g,cx-26,hy-6,9,7,'#3a2a50'); ell(g,cx+26,hy-6,9,7,'#3a2a50'); R(g,cx-20,hy+34,40,4,'#2a1e40'); }
function fgPaneiros(g,w){ g.save(); g.beginPath(); const B=[]; for(let r=0;r<3;r++) for(let i=0;i<3-r;i++) B.push([44+i*64+r*32,HH-r*50]);
  for(const [cx,yb] of B){ g.moveTo(cx-30,yb-50); g.lineTo(cx+30,yb-50); g.lineTo(cx+24,yb); g.lineTo(cx-24,yb); g.closePath(); }
  g.clip(); silGrad(g,0,HH-170,w,170); g.restore();
  for(const [cx,yb] of B){ R(g,cx-30,yb-50,60,2,RIM); for(let y=yb-44;y<yb;y+=7) R(g,cx-24,y,48,1,'#0c0618'); ell(g,cx,yb-52,26,6,'#1a0a22'); } }
function fgProa(g,w){ g.save(); g.beginPath(); g.moveTo(0,HH); g.lineTo(0,HH-150); g.lineTo(w*.55,HH-120); g.lineTo(w,HH-200); g.lineTo(w*.9,HH-40); g.lineTo(w*.7,HH); g.closePath(); g.clip(); silGrad(g,0,HH-200,w,200); g.restore();
  line(g,0,HH-150,w*.55,HH-120,RIM,2); line(g,w*.55,HH-120,w,HH-200,RIM,2); R(g,w*.2,HH-110,w*.5,4,'#0c0618'); for(let i=0;i<3;i++) ell(g,w*.25+i*40,HH-92,10,12,'#0a0612'); }
function fgCorda(g,w){ cabeco(g,w*.35); sag(g,w*.35,HH-48,w,0,30,'#3a2a3a',4); sag(g,w*.35,HH-48,w,0,30,RIM,1); }
function fgGuindaste(g,w){ const x=w/2-16; g.save(); g.beginPath(); g.rect(x,0,32,HH); g.rect(x-14,HH-30,60,30); g.clip(); silGrad(g,0,0,w,HH); g.restore();
  for(let y=0;y<HH-40;y+=40){ line(g,x+2,y,x+30,y+38,'#0c0618',3); line(g,x+30,y,x+2,y+38,'#0c0618',3); R(g,x,y,32,3,'#0c0618'); } R(g,x,0,1,HH,RIM); R(g,x-14,HH-30,60,1,RIM); }
function fgSprite(t){ if(fgCache[t]) return fgCache[t]; let w=80, c, g;
  if(t==='grade'){ w=300; [c,g]=mk(w,HH); fgGrade(g,w); return fgCache[t]={c,w}; }
  if(t==='planta'){ w=280; [c,g]=mk(w,HH); fgPlanta(g,w); return fgCache[t]={c,w}; }
  if(t==='barril'){ w=130; [c,g]=mk(w,HH); fgBarril(g,w); return fgCache[t]={c,w}; }
  if(t==='paneiro'){ w=240; [c,g]=mk(w,HH); fgPaneiros(g,w); return fgCache[t]={c,w}; }
  if(t==='proa'){ w=300; [c,g]=mk(w,HH); fgProa(g,w); return fgCache[t]={c,w}; }
  if(t==='corda'){ w=200; [c,g]=mk(w,HH); fgCorda(g,w); return fgCache[t]={c,w}; }
  if(t==='guindaste'){ w=120; [c,g]=mk(w,HH); fgGuindaste(g,w); return fgCache[t]={c,w}; }
  if(t.startsWith('placa:')){ w=140; [c,g]=mk(w,HH); fgPlaca(g,w,t.slice(6)); return fgCache[t]={c,w}; }
  if(t==='palm'){ w=320; [c,g]=mk(w,HH); palmeira(g,w/2); } else if(t==='lixo'){ w=160; [c,g]=mk(w,HH); lixo(g,40,HH+4,77); lixo(g,90,HH+8,31); } else { [c,g]=mk(w,HH); posteFG(g,w/2); }
  return fgCache[t]={c,w}; }

function posteFG(g,x){ const ir=rmp('#3e3656'), H0=HH; R(g,x-15,H0-60,30,60,ir[5]); R(g,x-14,H0-59,28,59,ir[2]); R(g,x-14,H0-59,6,59,ir[1]); R(g,x+8,H0-59,6,59,ir[4]); for(const yy of [H0-60,H0-30]){ R(g,x-18,yy,36,6,ir[2]); R(g,x-18,yy,36,1,ir[0]); R(g,x-18,yy+5,36,1,ir[5]); }
  R(g,x-7,90,14,H0-150,ir[5]); R(g,x-6,90,12,H0-150,ir[2]); R(g,x-6,90,3,H0-150,ir[1]); R(g,x+3,90,3,H0-150,ir[4]); for(let k=x-3;k<x+3;k+=3) R(g,k,96,1,H0-160,ir[3]);
  for(const yy of [140,H0-110]){ R(g,x-10,yy,20,8,ir[2]); R(g,x-10,yy,20,2,ir[0]); ell(g,x,yy+12,9,4,ir[3]); }
  R(g,x-16,80,32,6,ir[2]); R(g,x-16,80,32,1,ir[0]); for(const sx of [-1,1]){ line(g,x,96,x+sx*24,84,ir[3],3); ell(g,x+sx*14,100,6,5,ir[4]); }
  poly(g,[[x-14,40],[x+14,40],[x+11,78],[x-11,78]],ir[5]); poly(g,[[x-11,42],[x+11,42],[x+9,76],[x-9,76]],'#ffe6a0'); R(g,x-5,46,4,28,'#fffbe8'); R(g,x-1,42,2,34,ir[3]);
  poly(g,[[x-18,40],[x,22],[x+18,40]],ir[4]); poly(g,[[x-16,39],[x,24],[x,39]],ir[2]); R(g,x-2,12,4,12,ir[3]); ell(g,x,12,4,4,ir[2]); R(g,x-13,77,26,4,ir[2]); }
function palmeira(g,x){ const tr=rmp('#a8988a'), lf=rmp('#3e8a52'), H0=HH;
  for(let y=60;y<H0;y+=2){ const xx=x+Math.round(Math.sin(y/110)*10), w=Math.round(14+(y-60)/H0*8); R(g,xx-w/2-1,y,w+2,2,tr[5]); R(g,xx-w/2,y,w,2,tr[2]); R(g,xx-w/2,y,Math.round(w*.3),2,tr[1]); R(g,xx+Math.round(w*.15),y,Math.round(w*.35),2,tr[3]); if(y%14===0) R(g,xx-w/2,y,w,2,tr[4]); }
  R(g,x-12,40,24,30,'#4e7a3e'); R(g,x-12,40,8,30,'#6a9a4a');
  for(let k=0;k<11;k++){ const a=-Math.PI+k*(Math.PI/10)+(hsh(k)-.5)*.2, len=110+hsh(k*3)*40;
    for(let r=0;r<len;r+=2){ const px=x+Math.cos(a)*r, py=50+Math.sin(a)*r*.55+r*r/220; R(g,px-1,py-1,4,4,lf[5]);
      for(const side of [-1,1]){ const L=Math.max(0,(1-r/len)*20); line(g,px,py+1,px+side*3+Math.cos(a+side*1.2)*L*.4,py+L,(r/2)%3?lf[2]:lf[1]); } R(g,px,py,2,2,lf[1]); } }
  for(let k=0;k<5;k++) ell(g,x-10+k*5,74,4,5,'#c8a03a'); }
function cabeco(g,x){ const c=rmp('#3e3a4e'), H0=HH; R(g,x-18,H0-60,36,60,c[5]); R(g,x-17,H0-59,34,59,c[2]); R(g,x-17,H0-59,9,59,c[1]); R(g,x+9,H0-59,8,59,c[4]); ell(g,x,H0-66,26,9,c[5]); ell(g,x,H0-67,24,7,c[2]); ell(g,x-6,H0-69,12,3,c[0]); line(g,x-26,H0-40,x+26,H0-30,'#7a5a3a',3); }
function drawFG(g,cam){ const T=g.getTransform(); g.save(); g.setTransform(1,0,0,1,T.e,T.f); g.imageSmoothingEnabled=false;
  for(const it of FGI){ const sx=Math.round((it.x-cam)*1.25*RS); if(sx<-200||sx>HW+200) continue; const sp=fgSprite(it.t); g.drawImage(sp.c,sx-sp.w/2,0); } g.restore(); }

/* =====================================================================
   CÉU E FUNDO DISTANTE (parallax)
   ===================================================================== */
const SKYP={manha:{g:['#4a78c8','#5684cc','#6490d2','#749cd6','#86a8da','#98b4dc','#acc0de','#c2cce0','#d8d6e0','#ecdcd4'],star:null,sol:true,moon:['#fffff4','#fff6d0','#ffe9a6','#f2d27e'],mr:24,mx:200,my:120,glow:'#fff2c4',cloud:['#b8c2dc','#d8e0f0','#f4f6fc','#ffffff'],f1:'#8496bc',f1w:'#b8c8e4',f2:'#56786e',f2w:'#9cb2a2'},
  tarde:{g:['#3a64be','#4670c4','#567ecc','#668ad0','#7a98d4','#90a8d8','#aab6d6','#c8c0cc','#e4c4a8','#f6c88a'],star:null,sol:true,moon:['#fffff2','#fff8d4','#ffeca4','#f8d872'],mr:24,mx:790,my:62,glow:'#fff4ca',cloud:['#c8b8c8','#e8dce4','#fff8f4','#fff0dc'],f1:'#8a86ac',f1w:'#ccc8e2',f2:'#4e6a5a',f2w:'#a8b49a'},
  anoitecer:{g:['#1a1650','#281c62','#3a2472','#502c7e','#6a3282','#863882','#a4447c','#c4566e','#e07258','#f4a04a'],star:'#f0d8ff',ns:60,sol:true,moon:['#fff2c4','#ffc274','#ff9254','#e86a3a'],mr:46,mx:640,my:262,glow:'#ff8a4a',cloud:['#4a2058','#7a3064','#ffb070','#c86070'],f1:'#342462',f1w:'#ffc070',f2:'#1e2038',f2w:'#ffb060'},
  noite:{g:['#040a16','#071020','#0b162a','#101c34','#16243e','#1c2c4a','#243656','#2e4060','#3a4a6a','#465672'],star:'#e0ecff',moon:['#fffbe8','#efe8cc','#cfc6a6','#a89e84'],mr:30,mx:700,my:78,glow:'#8ab0ff',cloud:['#18243c','#22304a','#34425e','#4e5c7a'],f1:'#1c2846',f1w:'#d8c080',f2:'#13282a',f2w:'#f0b060'},
  lua:{g:['#0c0206','#160308','#22050c','#300810','#400c14','#521018','#66161c','#7c1e22','#922a28','#a8382e'],star:'#ffd0c8',moon:['#ffa47a','#f0603e','#c4342a','#86181a'],mr:62,mx:700,my:112,glow:'#ff4a3a',cloud:['#2a0610','#40101a','#5c1822','#82282c'],f1:'#3a0c18',f1w:'#ff8a5a',f2:'#24060c',f2w:'#ffa060'}};
const skyCache={};
// sol (manhã, tarde e anoitecer): disco em faixas de pixel com núcleo claro e uma coroa de raios em pixel
function sol(g,P,mx,my,mr){ const S=P.moon; ell(g,mx,my,mr+3,mr+3,S[3]); ell(g,mx,my,mr,mr,S[2]); ell(g,mx-mr*.08,my-mr*.08,mr*.84,mr*.84,S[1]); ell(g,mx-mr*.2,my-mr*.2,mr*.5,mr*.5,S[0]);
  for(let k=0;k<16;k++){ const a=k/16*Math.PI*2, r0=mr+8+(k%2)*4, r1=r0+6+(k%3)*4; for(let r=r0;r<r1;r+=2) R(g,Math.round(mx+Math.cos(a)*r),Math.round(my+Math.sin(a)*r),2,2,k%2?S[2]:S[1]); } }
function skyCanvas(mode){ if(skyCache[mode]) return skyCache[mode]; const P=SKYP[mode], [c,g]=mk(HW,HB+20), n=P.g.length, bh=(HB+20)/n;
  for(let i=0;i<n;i++){ R(g,0,i*bh,HW,bh+1,P.g[i]); if(i<n-1){ g.fillStyle=P.g[i+1]; for(let y=Math.round((i+1)*bh)-4;y<Math.round((i+1)*bh);y++) for(let x=(y%2)*2;x<HW;x+=(y%4<2?4:2)) g.fillRect(x,y,2,1); } }
  const NS=P.ns??(P.star?220:0); for(let i=0;i<NS;i++){ const x=Math.floor(hsh(i*3.1)*HW), y=Math.floor(Math.pow(hsh(i*7.3),1.6)*230), v=hsh(i*1.9); g.fillStyle=v>.85?'#ffffff':v>.5?P.star:mix(P.star,P.g[3],.5); g.fillRect(x,y,v>.7?2:1,v>.7?2:1);
    if(v>.95){ g.fillRect(x-2,y,6,1); g.fillRect(x,y-2,1,6); g.fillStyle=mix(P.star,P.g[2],.5); g.fillRect(x-4,y,2,1); g.fillRect(x+4,y,2,1); } }
  // nebulosa sutil
  for(let i=0;i<10;i++){ const cx=hsh(i*5.1)*HW, cy=30+hsh(i*2.7)*150; g.save(); g.globalAlpha=.05; ell(g,cx,cy,120+hsh(i)*120,30+hsh(i*3)*30,P.cloud[3]); g.restore(); }
  const mx=P.mx, my=P.my, mr=P.mr; g.save(); g.globalCompositeOperation='lighter'; for(let k=6;k>=1;k--){ g.globalAlpha=P.sol?.06:.035; ell(g,mx,my,mr*(1+k*(P.sol?.7:.45)),mr*(1+k*(P.sol?.7:.45)),P.glow); } g.restore();
  if(P.sol){ sol(g,P,mx,my,mr); return skyCache[mode]=c; }
  ell(g,mx,my,mr,mr,P.moon[1]); ell(g,mx-mr*.15,my-mr*.15,mr*.82,mr*.82,P.moon[0]); for(let dy=-mr;dy<=mr;dy++){ const hw=Math.sqrt(mr*mr-dy*dy); R(g,mx+hw*.55,my+dy,hw*.45,1,P.moon[2]); R(g,mx+hw*.85,my+dy,hw*.15,1,P.moon[3]); }
  [[-.3,-.25,.34,.2],[.05,.1,.22,.3],[-.45,.3,.16,.12],[.35,-.3,.12,.1]].forEach(([dx,dy,rx,ry])=>{ ell(g,mx+dx*mr,my+dy*mr,rx*mr,ry*mr+2,P.moon[2]); ell(g,mx+dx*mr+rx*mr*.2,my+dy*mr+1,rx*mr*.6,ry*mr*.6+1,mix(P.moon[2],P.moon[3],.5)); });
  [[.25,.55,.07],[-.1,-.6,.05],[.6,.2,.06]].forEach(([dx,dy,r])=>{ const x=mx+dx*mr, y=my+dy*mr, rr=r*mr; ell(g,x,y,rr,rr,P.moon[3]); R(g,x-rr*.6,y+rr*.7,rr*1.2,1,P.moon[0]); });
  return skyCache[mode]=c; }
const stripCache={};
function cloudStrip(mode){ const k='c'+mode; if(stripCache[k]) return stripCache[k]; const P=SKYP[mode], W0=2400, [c,g]=mk(W0,HB);
  for(let i=0;i<16;i++){ const cx=hsh(i*4.3)*W0, cy=50+hsh(i*7.1)*150, w=140+hsh(i*2.2)*220, h=12+hsh(i*3.9)*16; for(const off of [0,-W0,W0]){ const x=cx+off;
    ell(g,x,cy,w*.5,h,P.cloud[0]); ell(g,x-w*.15,cy-h*.6,w*.3,h*.9,P.cloud[0]); ell(g,x+w*.18,cy-h*.4,w*.25,h*.8,P.cloud[0]); R(g,x-w*.5,cy+h*.4,w,h*.6,P.cloud[0]);
    ell(g,x-w*.15,cy-h*.9,w*.24,h*.5,P.cloud[1]); ell(g,x+w*.18,cy-h*.7,w*.18,h*.4,P.cloud[1]); R(g,x-w*.32,cy-h*1.25,w*.3,2,P.cloud[2]); R(g,x+w*.05,cy-h*1.05,w*.24,2,P.cloud[2]); g.clearRect(x-w*.6,cy+h,w*1.2,h*2); } }
  return stripCache[k]=c; }
function strip(g,cv,off,y){ const w=cv.width, o=((Math.round(off)%w)+w)%w; g.drawImage(cv,-o,y); if(w-o<HW) g.drawImage(cv,w-o,y); }
const scratch={};
function drawSky(g,mode,cam,t){ if(!built) build(); const P=SKYP[mode]||SKYP.noite; mode=SKYP[mode]?mode:'noite'; const T=g.getTransform();
  g.save(); g.setTransform(1,0,0,1,T.e,T.f); g.imageSmoothingEnabled=false; R(g,0,0,HW,HH,P.g[P.g.length-1]);
  g.drawImage(skyCanvas(mode),0,0); strip(g,cloudStrip(mode),cam*RS*.03+(t||0)*3,0);
  strip(g,farStrip(mode,1),cam*RS*.08,0); strip(g,farStrip(mode,2),cam*RS*.22,0);
  g.restore();
  if(!engineDM){ // motor antigo: desenha o mid aqui mesmo, já com a tinta do modo
    if(!scratch.c){ [scratch.c,scratch.g]=mk(HW,HH); } const S=scratch.g; S.setTransform(1,0,0,1,0,0); S.clearRect(0,0,HW,HH);
    fromSky=true; drawMid(S,cam); fromSky=false; S.globalCompositeOperation='source-atop'; S.fillStyle=TINT[mode]; S.fillRect(0,0,HW,HH); S.globalCompositeOperation='source-over';
    g.save(); g.setTransform(1,0,0,1,T.e,T.f); g.drawImage(scratch.c,0,0); g.restore(); }
}

/* luzes aditivas (opcional): halos de postes, arandelas, lâmpadas e neon. O motor pode chamar depois das janelas. */
const haloCache={};
function halo(col){ if(haloCache[col]) return haloCache[col]; const [c,g]=mk(128,128); for(let i=0;i<8;i++){ const r=64*(1-i/8); g.globalAlpha=.06+i*.012; ell(g,64,64,r,r,col); } return haloCache[col]=c; }
function drawLights(g,cam,mode,t){ if(mode==='manha'||mode==='tarde') return; const T=g.getTransform(); g.save(); if(mode==='anoitecer') g.globalAlpha=.7; g.setTransform(1,0,0,1,T.e,T.f); g.globalCompositeOperation='lighter'; g.imageSmoothingEnabled=false;
  const warm=mode==='lua'?'#ff7a4a':'#ffc070', fl=1+Math.sin((t||0)*9)*.03;
  for(const L of LAMPS){ let sx, sy=L.y*RS; if(L.fx!=null) sx=(L.fx-cam*1.25)*RS; else sx=(L.x-cam)*RS; if(sx<-200||sx>HW+200) continue; const r=(L.r||24)*RS*fl; g.drawImage(halo(warm),sx-r,sy-r,r*2,r*2); }
  for(const B of BULBS){ const sx=(B.x-cam)*RS; if(sx<-30||sx>HW+30) continue; g.drawImage(halo(B.c||warm),sx-18,B.y*RS-18,36,36); }
  for(const N of NEON){ const sx=(N.x-cam)*RS; if(sx<-200||sx>HW+200) continue; const r=N.w*RS*.8; g.globalAlpha=.8; g.drawImage(halo(N.c),sx-r,N.y*RS-r*.5,r*2,r); g.globalAlpha=1; }
  if(WATER.length){ const tt=t||0; for(const Wt of WATER){ const a=Math.max(Wt.x0,cam), b=Math.min(Wt.x1,cam+W); if(b<=a) continue;
      if(mode==='lua'){ g.globalAlpha=.16; g.fillStyle='#a01020'; g.fillRect(Math.round((a-cam)*RS),HZ+4,Math.round((b-a)*RS),HB-HZ-26); }
      g.fillStyle=mode==='lua'?'#ff6a4a':'#9ab0e8';
      for(let wx=Math.floor(a/23)*23;wx<b;wx+=23){ const v=hsh(wx*.13); if(v<.45) continue; const ph=Math.sin(tt*2.2+v*40); if(ph<.25) continue; g.globalAlpha=ph*.45; g.fillRect(Math.round((wx-cam)*RS+Math.sin(tt*.8+v*9)*5),Math.round(HZ+8+v*(HB-HZ-34)),Math.round(5+v*12),1); }
      g.globalAlpha=1; } }
  g.restore(); }

/* =====================================================================
   BUILD
   ===================================================================== */
const PLACA={relogio:'PRACA DO RELOGIO',acai:'FEIRA DO ACAI',ervas:'FEIRA DAS ERVAS',ferro:'VER-O-PESO',doca:'DOCA',barcos:'TRAPICHE',presepio:'FORTE',docas:'ESTACAO DAS DOCAS',armazem:'ARMAZENS',porto:'PORTO',cais:'CAIS'};
function build(){
  WINDOWS.length=0; LAMPS.length=0; BULBS.length=0; FGI.length=0; NEON.length=0; WATER.length=0; DL.length=0; midTiles.fill(null);
  AREAS.forEach(compose);
  DLs=DL.slice().sort((a,b)=>a.z-b.z||a.i-b.i);
  // primeiro plano
  AREAS.forEach(A=>{ const st=680, palmy=['relogio','docas','presepio'].includes(A.id);
    const KF={relogio:['planta','placa','lixo','grade','paneiro'],acai:['paneiro','lixo','planta','paneiro','placa'],ervas:['paneiro','planta','lixo','placa'],ferro:['paneiro','barril','lixo','placa'],doca:['corda','proa','paneiro','corda','barril'],barcos:['proa','corda','paneiro','proa'],presepio:['planta','grade','placa','planta'],docas:['planta','corda','grade','placa'],armazem:['barril','lixo','grade','guindaste'],porto:['guindaste','corda','barril','corda'],cais:['guindaste','corda','barril','corda']};
    for(let wx=A.x0+170;wx<A.x1-60;wx+=st){ const k=Math.round((wx-A.x0)/st);
      if(A.id!=='cais') FGI.push({t:palmy&&k%2?'palm':'poste',x:wx}); // arena do chefe sem poste no meio da luta
      let t=pick(KF[A.id]||['planta','lixo'],hsh(wx*.37)); if(t==='placa') t='placa:'+(PLACA[A.id]||'VER-O-PESO');
      FGI.push({t,x:wx+st*.5}); } });
  FGI.filter(it=>it.t==='poste').forEach(it=>LAMPS.push({fx:it.x*1.25,y:60/RS+.1,r:30}));
  built=true; engineDM=false;
  // windows/lamps são registrados durante o desenho: executa cada elemento uma vez num contexto mínimo para coletar
  const [c0,g0]=mk(1,1);
  RL='noite'; collecting=true; for(const e of DLs){ g0.setTransform(1,0,0,1,0,0); e.f(g0,e.x0,e.x1); } collecting=false;
  const uniq=(arr,key)=>{ const m=new Map(); arr.forEach(o=>m.set(key(o),o)); return [...m.values()]; };
  const wins=uniq(WINDOWS,o=>o.x.toFixed(1)+','+o.y.toFixed(1)); WINDOWS.length=0; WINDOWS.push(...wins);
  const lm=uniq(LAMPS,o=>(o.fx!=null?'f'+o.fx:o.x.toFixed(1))+','+o.y.toFixed(1)); LAMPS.length=0; LAMPS.push(...lm);
  const bl=uniq(BULBS,o=>o.x.toFixed(1)+','+o.y.toFixed(1)); BULBS.length=0; BULBS.push(...bl);
  const ne=uniq(NEON,o=>o.x.toFixed(1)+','+o.y.toFixed(1)); NEON.length=0; NEON.push(...ne);
  tileAt(0);
}

const TINT={manha:'rgba(255,196,206,.05)',tarde:'rgba(255,184,96,.08)',anoitecer:'rgba(140,40,110,.16)',noite:'rgba(20,14,64,.14)',lua:'rgba(120,10,26,.4)'}; // tinta sugerida pro cenário (a noite já vem pintada)
return {TINT,setLight,light:()=>LIGHT,build,mid,midTiles,drawMid,idle:ms=>{ engineIdle=true; return idle(ms); },warm,drawFG,FGI,drawSky,drawLights,AREAS,AID,WINDOWS,LAMPS,BULBS,W,H,BASE,WORLD,OUT,RS,TILE};
})();
