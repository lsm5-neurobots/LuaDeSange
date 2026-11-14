/* MAP — fonte de arte (editável). Build: npm run art
   Cenário da fase Marco Zero (Recife Antigo) em alta resolução: RS=2.5 → 960×540 px por tela.
   WORLD*RS passa do limite de largura de canvas, então o "mid" vive em tiles de 2048 px renderizados
   sob demanda (MAP.midTiles) e o motor deve chamar MAP.drawMid(ctx, cam) com o contexto já escalado por RS.
   (Enquanto o motor ainda usa MAP.mid, drawSky desenha o mid sozinho como fallback.)
   Coordenadas públicas (AREAS, WINDOWS, LAMPS, BULBS, FGI) continuam em unidades lógicas 384×216. */
const MAP=(function(){

const W=384, H=216, BASE=118, OUT='#170b1c', SC=3, RS=2.5;
const DEF=[
  {id:'ponte', name:'Ponte Maurício de Nassau', short:'Ponte', len:768, floor:'asfalto', back:'ponte', fights:[12,16], chests:[], puzzle:null,
   ref:'Ponte Maurício de Nassau · rio Capibaribe', desc:'Entrada da fase, vindo de Santo Antônio. Balaustrada de concreto, postes de ferro e o rio aberto atrás com o casario do outro lado. Área de aquecimento: hordas pequenas pra IA do squad se organizar.',
   chao:'Asfalto da ponte com calçada', inim:'Errantes espalhados · 1 Corredor atravessando a ponte', bau:'Nenhum'},
  {id:'alfandega', name:'Cais da Alfândega', short:'Alfândega', len:768, floor:'granito', back:'cais', fights:[16,20], chests:[[.62,'comum']], puzzle:null,
   ref:'Igreja Madre de Deus · Paço Alfândega', desc:'Primeiro trecho do bairro: a Igreja Madre de Deus com as duas torres e, ao lado, o prédio grande do Paço Alfândega com arcadas no térreo. Chão de granito largo do cais.',
   chao:'Lajes de granito', inim:'Errantes saindo da igreja · Rastejante no adro', bau:'Baú comum na porta lateral'},
  {id:'feira', name:'Rua do Bom Jesus · feirinha', short:'Bom Jesus I', len:768, floor:'paralelo', back:'rua', fights:[16,18], chests:[[.3,'comum']], puzzle:null,
   ref:'Rua do Bom Jesus (feira de domingo)', desc:'Começo da rua mais famosa do bairro: casario colorido, bandeirinhas e a feirinha de artesanato com barracas virando cobertura e obstáculo.',
   chao:'Paralelepípedo, calçada estreita', inim:'Horda de Errantes entre as barracas · 2 Rastejantes fingindo de morto', bau:'Baú comum numa barraca'},
  {id:'bomjesus', name:'Rua do Bom Jesus · sinagoga', short:'Bom Jesus II', len:768, floor:'paralelo', back:'rua', fights:[18,22], chests:[[.56,'escondido']], puzzle:.2,
   ref:'Sinagoga Kahal Zur Israel · Embaixada dos Bonecos Gigantes', desc:'O trecho dos marcos: a sinagoga (primeira das Américas) e a Embaixada dos Bonecos Gigantes, com um boneco de carnaval enorme na porta.',
   chao:'Paralelepípedo', inim:'Errantes + Corredores · Gritador na porta da embaixada', bau:'Baú escondido atrás do boneco (faro do pet) · puzzle de símbolos'},
  {id:'apolo', name:'Rua do Apolo', short:'Apolo', len:768, floor:'paralelo', back:'rua', fights:[16,20], chests:[[.7,'médico']], puzzle:null,
   ref:'Rua do Apolo · Teatro Apolo', desc:'Rua mais estreita e escura, com o Teatro Apolo (fachada neoclássica de colunas) e um sobrado em obra, coberto de andaime e tela verde.',
   chao:'Paralelepípedo com entulho', inim:'Cuspidor no andaime · Errantes', bau:'Baú médico no foyer do teatro'},
  {id:'moeda', name:'Rua da Moeda', short:'Moeda', len:768, floor:'paralelo2', back:'rua', fights:[20,24], chests:[[.4,'médico']], puzzle:.8,
   ref:'Rua da Moeda · berço do Manguebeat', desc:'Rua dos bares: casarões mais escuros, toldos, mesas de plástico na calçada e varal de lâmpadas. O muro com o grafite do caranguejo com antena marca o meio da área.',
   chao:'Paralelepípedo irregular com poças', inim:'Horda média: Errantes + Corredores saindo dos bares · Cuspidor no fundo', bau:'Baú médico num bar · puzzle de fio no quadro de luz'},
  {id:'arsenal', name:'Praça do Arsenal · Torre Malakoff', short:'Arsenal', len:768, floor:'paralelo', back:'eclet', fights:[18,28], chests:[[.55,'militar']], puzzle:.18,
   ref:'Rua da Guia · Praça do Arsenal · Torre Malakoff', desc:'O casario vira prédio eclético. A Torre Malakoff, com portão em arco, relógio e observatório no topo, é o marco. Viatura abandonada no meio da praça.',
   chao:'Paralelepípedo da praça', inim:'Mini-chefe: Brutamonte no portão da Malakoff', bau:'Baú militar na viatura · puzzle de símbolos no portão'},
  {id:'riobranco', name:'Av. Rio Branco · Paço do Frevo', short:'Rio Branco', len:768, floor:'asfalto', back:'eclet', fights:[18,20], chests:[[.75,'comum']], puzzle:null,
   ref:'Av. Rio Branco · Paço do Frevo', desc:'Avenida larga de prédios com cúpula descendo até o Marco Zero. O casarão do Paço do Frevo tem sombrinhas coloridas penduradas na sacada. Carros abandonados no asfalto.',
   chao:'Asfalto com faixa', inim:'Errantes + Blindado', bau:'Baú comum num carro'},
  {id:'marco', name:'Praça do Marco Zero', short:'Marco Zero', len:768, floor:'portuguesa', back:'praca', fights:[22,30], chests:[[.42,'raro']], puzzle:.12,
   ref:'Praça Rio Branco (Marco Zero)', desc:'O coração da fase: letreiro colorido MARCO ZERO, estátua no pedestal e a rosa dos ventos gigante no chão. Os prédios acabam e o cais se abre pro mar, com o molhe e a Torre de Cristal no horizonte.',
   chao:'Pedra portuguesa com rosa dos ventos', inim:'Maior horda da fase cercando a rosa dos ventos · Gritador chama reforço', bau:'Baú raro na estátua (só drop) · puzzle numérico na placa do km 0'},
  {id:'sertao', name:'Cais do Sertão · Armazéns', short:'Armazéns', len:768, floor:'granito', back:'armazens', fights:[18,22], chests:[[.5,'militar']], puzzle:null,
   ref:'Armazéns do Porto · Cais do Sertão · Centro de Artesanato', desc:'Os armazéns do porto na Av. Alfredo Lisboa, com portões verdes em arco e um guindaste antigo entre eles. Cabeços de amarração no primeiro plano. O squad chega no embarque.',
   chao:'Granito do cais', inim:'Barrigudo explode perto dos armazéns · Errantes', bau:'Baú militar num contêiner'},
  {id:'travessia', name:'Travessia de barco', short:'Barco', len:512, floor:'agua', back:'mar', fights:[20], chests:[], puzzle:null,
   ref:'Barco Marco Zero → Parque das Esculturas', desc:'Respiro antes do chefe. O squad atravessa no barquinho e Saltadores pulam da água no convés. A Torre de Cristal cresce à frente.',
   chao:'Convés do barco', inim:'2–3 Saltadores', bau:'Nenhum'},
  {id:'molhe', name:'Molhe · Parque das Esculturas', short:'Molhe', len:512, floor:'molhe', back:'molhe', fights:[84], chests:[[.9,'chefe']], puzzle:null,
   ref:'Parque das Esculturas Francisco Brennand', desc:'Arena do chefe no molhe, com mar dos dois lados, as esculturas (ovos, serpente, totem) e a Torre de Cristal. O Açougueiro chega pelo fim do molhe.',
   chao:'Concreto com pedras nas bordas', inim:'Chefe: O Açougueiro (3 fases) · na Lua de Sangue, +2 Brutamontes', bau:'Baú do chefe (recompensa)'},
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
function rmp(h){ let r=RC.get(h); if(!r){ r=[mix(h,'#fff0c4',.55),mix(h,'#ffdc9c',.24),h,mix(h,'#3a4c9c',.3),mix(h,'#1c2a7a',.52),mix(h,'#0a1234',.72)]; RC.set(h,r); } return r; }
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
const BARES=['BAR','BOTECO','CHOPP','FORRO','SAMBA','PETISCOS','CERVEJA','BAR DA ESQUINA','MANGUE BAR','CALDINHO','ESPETINHO','TIRA-GOSTO'];

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
  const words=['FUJA!','SOS','NAO ENTRE','RECIFE VIVE','MANGUE','PE','TEM GENTE','SOCORRO','LUA DE SANGUE','ABRIGO >'], w0=pick(words,hsh(s)), col=pick(['#d8283a','#e8e0d0','#ffd23f','#3ad8c8','#ff5a9a'],hsh(s*3)), sc=hsh(s*5)>.6?3:2;
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

/* =====================================================================
   MARCOS DO RECIFE ANTIGO
   ===================================================================== */
function igrejaMadreDeDeus(g,x){ // barroca: duas torres, frontão com volutas
  const wl=rmp('#f0e8d8'), st=rmp('#a89880'), w=560, tw0=118, cx=x+w/2;
  const ny=70; R(g,x+tw0,ny,w-2*tw0,HB-ny,wl[2]); shade(g,x+tw0,ny,(w-2*tw0)*.4,HB-ny,'#fff4dc',.06);
  // pilastras de cantaria
  for(const px of [x+tw0,x+tw0+70,x+w-tw0-80,x+w-tw0-10]){ R(g,px,ny,10,HB-ny,st[2]); R(g,px,ny,2,HB-ny,st[1]); R(g,px+8,ny,2,HB-ny,st[4]); }
  cornice(g,x+tw0,ny+110,w-2*tw0,st,true);
  // frontão barroco
  const fw=w-2*tw0+10, P=[]; for(let i=0;i<=40;i++){ const t=i/40, px=x+tw0-5+fw*t, u=Math.abs(t-.5)*2; const yy=ny-8-(u<.35?60:u<.75?60-(u-.35)/.4*44:16-(u-.75)/.25*16)-Math.sin(t*Math.PI*6)*(u>.35&&u<.75?4:0); P.push([px,yy]); }
  P.push([x+w-tw0+5,ny+2],[x+tw0-5,ny+2]); poly(g,P.map(p=>[p[0],p[1]-3]),st[4]); poly(g,P,wl[2]); for(let i=0;i<40;i++) R(g,P[i][0],P[i][1],fw/40+1,3,st[1]);
  ell(g,cx,ny-28,22,18,st[4]); ell(g,cx,ny-28,20,16,wl[1]); ell(g,cx,ny-28,12,10,st[3]); ell(g,cx,ny-28,10,8,GLASS[3]); for(let k=0;k<6;k++){ const a=k/6*Math.PI*2; line(g,cx,ny-28,cx+Math.cos(a)*10,ny-28+Math.sin(a)*8,st[2]); }
  R(g,cx-2,ny-92,4,26,st[4]); R(g,cx-9,ny-84,18,4,st[4]); R(g,cx-1,ny-92,2,26,st[1]); R(g,cx-8,ny-83,16,2,st[1]);
  for(const sx of [-1,1]){ ell(g,cx+sx*80,ny-24,8,8,st[4]); ell(g,cx+sx*80,ny-24,6,6,st[1]); R(g,cx+sx*80-1,ny-38,3,10,st[2]); ell(g,cx+sx*80,ny-40,4,5,st[1]); }
  // portada principal
  R(g,cx-40,HB-130,80,130,st[4]); R(g,cx-38,HB-128,76,128,st[2]); R(g,cx-38,HB-128,76,3,st[1]); for(let k=0;k<5;k++) R(g,cx-38+k*2,HB-150+k*2,76-k*4,2,k%2?st[1]:st[3]);
  ell(g,cx,HB-148,30,12,st[1]); ell(g,cx,HB-150,10,6,st[3]);
  porta(g,cx-26,HB-104,52,104,{c:wl,s:7,kind:'madeira',wood:'#2f6a6a'});
  for(const sx of [-1,1]){ porta(g,cx+sx*70-14,HB-82,28,82,{c:wl,s:9+sx,kind:'madeira',wood:'#2f6a6a'}); }
  for(const sx of [-1,0,1]){ const wx=cx+sx*70-12; janela(g,wx,ny+44,24,50,{c:wl,sh:rmp('#2f6a6a'),s:21+sx,st:sx===0?'acesa':'escura',arch:true}); sacada(g,wx-10,ny+95,44,wl); }
  // torres
  for(const tx of [x,x+w-tw0]){ const ty=56; R(g,tx,ty,tw0,HB-ty,wl[2]); R(g,tx,ty,tw0,HB-ty,wl[2]); shade(g,tx,ty,tw0*.35,HB-ty,'#fff4dc',.06); shade(g,tx+tw0*.7,ty,tw0*.3,HB-ty,'#1a0c30',.1);
    R(g,tx,ty,12,HB-ty,st[2]); R(g,tx,ty,2,HB-ty,st[1]); R(g,tx+tw0-12,ty,12,HB-ty,st[3]); R(g,tx+tw0-3,ty,3,HB-ty,st[4]);
    cornice(g,tx-4,ty+44,tw0+8,st,true); cornice(g,tx-4,ty+124,tw0+8,st,false);
    archF(g,tx+tw0/2-17,ty+2,34,40,st[4]); archF(g,tx+tw0/2-15,ty+4,30,38,'#140c22'); R(g,tx+tw0/2-11,ty+18,22,4,IRON[2]); ell(g,tx+tw0/2,ty+30,8,10,'#8a6a2a'); ell(g,tx+tw0/2-2,ty+28,4,5,'#c8a04a');
    janela(g,tx+tw0/2-11,ty+70,22,36,{c:wl,sh:rmp('#2f6a6a'),s:tx,st:'fechada',arch:true}); janela(g,tx+tw0/2-9,ty+150,18,30,{c:wl,sh:rmp('#2f6a6a'),s:tx+3,st:'escura'});
    ell(g,tx+tw0/2,ty+200,9,9,st[3]); ell(g,tx+tw0/2,ty+200,7,7,'#f0e8d0'); R(g,tx+tw0/2,ty+195,1,5,'#2a1a2a'); R(g,tx+tw0/2,ty+200,4,1,'#2a1a2a');
    cupulaTorre(g,tx+tw0/2,ty+2,tw0);
    for(let i=0;i<4;i++) streak(g,tx+14+hsh(tx+i)*(tw0-28),ty+46,20+hsh(i*tx)*40,3,wl[3]); }
  R(g,x,HB-14,w,14,st[3]); R(g,x,HB-14,w,2,st[1]); R(g,x,HB-4,w,4,st[5]);
  crack(g,x+tw0+30,ny+130,20,wl[4],5); crack(g,x+w-tw0-40,ny+20,16,wl[4],9); peel(g,x+tw0+90,ny+150,26,14,wl,3);
  for(let i=0;i<4;i++) planta(g,x+tw0+20+i*90,ny+105,i*7);
  placa(g,cx-tw('IGREJA MADRE DE DEUS',1)/2-6,ny+120,'IGREJA MADRE DE DEUS','#2a2440','#e8dcc0',1);
}
function pacoAlfandega(g,x,w){ // Paço Alfândega: ocre com pilastras brancas, térreo em arcos, janelas em arco, frontão curvo com estátua
  const c=rmp('#e09e38'), wt=rmp('#f2ece0'), sh=rmp('#2f6a5a'), gH=86, uH=64, top=HB-gH-2*uH-24; // topo baixo o bastante pra estátua do frontão caber na tela
  R(g,x,top,w,HB-top,c[2]); for(let i=0;i<12;i++){ const bw=40+hsh(i*3.1)*90, bh=20+hsh(i*5.3)*50; blob(g,x+hsh(i*7.7)*(w-bw),top+30+hsh(i*9.9)*(HB-top-80),bw,bh,hsh(i*2.2)>.6?c[1]:c[3]); }
  shade(g,x,top,w*.3,HB-top,'#fff0d0',.06); shade(g,x+w*.75,top,w*.25,HB-top,'#1a0c30',.08);
  const n=Math.round(w/100), bw=w/n;
  for(let k=0;k<n;k++){ const cx=Math.round(x+(k+.5)*bw), y0=HB-gH;
    R(g,cx-25,y0+18,50,gH-30,wt[4]); archF(g,cx-23,y0+20,46,gH-32,wt[1]); archF(g,cx-18,y0+25,36,gH-37,'#1a1228');
    if(hsh(k*3.3)>.5){ archF(g,cx-17,y0+26,34,gH-38,'#4a2c1a'); for(let yy=y0+46;yy<HB-14;yy+=9) R(g,cx-15,yy,30,1,'#2a180e'); R(g,cx-1,y0+30,2,gH-42,'#2a180e'); R(g,cx-5,y0+gH*.6,3,4,'#e8c860'); }
    else { R(g,cx-15,y0+52,30,gH-64,'#241a36'); if(hsh(k*5.1)>.55) emitW(g,g=>{ archF(g,cx-15,y0+28,30,gH-42,'#c87838'); archF(g,cx-11,y0+32,22,20,'#f0b060'); R(g,cx-1,y0+28,2,gH-42,'#5a2c1c'); }); }
    for(let f=1;f<3;f++){ const yf=HB-gH-f*uH; janela(g,cx-12,yf+24,24,uH-38,{c,sh,fr:wt,s:k*7+f,st:pick(['fechada','vidro','acesa','escura','vidro','quebrada','fechada'],hsh(k*2.7+f*5.1)),arch:true}); } }
  for(let p=0;p<=n;p++){ const px=Math.round(x+p*bw)-(p===n?12:p===0?0:6); R(g,px,top+24,12,HB-top-38,wt[2]); R(g,px,top+24,3,HB-top-38,wt[0]); R(g,px+10,top+24,2,HB-top-38,wt[4]); }
  for(let f=1;f<3;f++) cornice(g,x-3,HB-gH-(f-1)*uH,w+6,wt,f===1);
  R(g,x-4,top,w+8,24,wt[2]); R(g,x-4,top,w+8,3,wt[0]); cornice(g,x-6,top+24,w+12,wt,true);
  for(let bx=x+8;bx<x+w-8;bx+=10){ R(g,bx,top+6,5,13,wt[3]); R(g,bx,top+6,3,13,wt[1]); }
  const cx=x+w/2, gw=240, gh=24, P=[]; for(let i=0;i<=30;i++){ const t=i/30; P.push([cx-gw/2+gw*t,top-Math.pow(Math.sin(t*Math.PI),.55)*gh]); } P.push([cx+gw/2,top+2],[cx-gw/2,top+2]);
  poly(g,P.map(p=>[p[0]+(p[0]<cx?-3:3),p[1]-3]),wt[4]); poly(g,P.map(p=>[p[0]+(p[0]<cx?-1:1),p[1]-1]),wt[1]); poly(g,P.map(p=>[cx+(p[0]-cx)*.9,top-(top-p[1])*.78+2]),c[2]);
  ell(g,cx,top-11,11,9,wt[4]); ell(g,cx,top-11,9,7,wt[1]); ell(g,cx,top-11,5,4,GLASS[3]);
  for(const sx of [-1,1]){ R(g,cx+sx*(gw/2+4)-4,top-14,8,14,wt[2]); ell(g,cx+sx*(gw/2+4),top-18,5,6,wt[1]); }
  const sy=top-gh; R(g,cx-8,sy-4,16,6,wt[2]); R(g,cx-8,sy-4,16,1,wt[0]); R(g,cx-3,sy-18,7,14,'#6a6a72'); poly(g,[[cx-5,sy-4],[cx-3,sy-12],[cx+4,sy-12],[cx+6,sy-4]],'#5a5a64'); ell(g,cx,sy-21,3,3,'#6a6a72'); line(g,cx+3,sy-15,cx+8,sy-26,'#6a6a72',2); R(g,cx-2,sy-18,2,13,'#9a9aa2'); R(g,cx-1,sy-23,1,2,'#9a9aa2');
  const t='PACO ALFANDEGA', s=2; R(g,cx-tw(t,s)/2-8,top+3,tw(t,s)+16,19,'#2a2236'); textSh(g,t,cx-tw(t,s)/2,top+6,s,'#f2dca0','#0e0816');
  R(g,x,HB-14,w,14,wt[3]); R(g,x,HB-14,w,2,wt[1]); R(g,x,HB-4,w,4,wt[5]);
  for(let i=0;i<12;i++) streak(g,x+10+hsh(i*3.7)*(w-20),top+30+hsh(i)*120,12+hsh(i*5)*30,3,c[3]); limo(g,x,HB-14,w,c,41);
  for(let i=0;i<3;i++) umidade(g,x+40+hsh(i*7.3)*(w-120),HB-gH-2*uH+2,40+hsh(i)*40,60+hsh(i*3)*50,c,i+5);
  poster(g,x+66,HB-74,5); tag(g,x+w-280,HB-64,12); pixo(g,x+w*.45,HB-18,91,'#1a1020');
  for(let k=0;k<3;k++) arandela(g,x+bw-4+k*(w-2*bw)/2,HB-gH-2,k!==1);
  R(g,x+w,top,2,HB-top,'#1a1028'); }
function sinagoga(g,x){ // Kahal Zur Israel: sobrado creme, 5 portas e 5 janelas em arco vermelhas, sacadas de ferro, letreiro no friso
  const w=280, c=rmp('#efe4c8'), wt=rmp('#f6f2e6'), rd=rmp('#b8323a'), gH=112, uH=96, top=HB-gH-uH-30;
  R(g,x,top,w,HB-top,c[2]); for(let i=0;i<6;i++) blob(g,x+hsh(i*3.1+9)*(w-60),top+30+hsh(i*5.3)*(HB-top-80),40+hsh(i)*40,20+hsh(i*7)*30,hsh(i*2.2)>.5?c[1]:c[3]);
  shade(g,x,top,w*.3,HB-top,'#fff0d0',.06); R(g,x,top,10,HB-top,wt[1]); R(g,x,top,2,HB-top,wt[0]); R(g,x+w-10,top,10,HB-top,wt[3]);
  R(g,x-4,top,w+8,30,wt[2]); R(g,x-4,top,w+8,3,wt[0]); cornice(g,x-6,top+30,w+12,wt,true);
  cornice(g,x-4,HB-gH,w+8,wt,true); R(g,x+20,HB-gH+3,w-40,13,wt[1]); const t='SINAGOGA KAHAL ZUR ISRAEL'; text(g,t,x+w/2-tw(t,1)/2,HB-gH+6,1,'#4a3a3a');
  for(let k=0;k<5;k++){ const cx=Math.round(x+30+k*(w-60)/4), ww=30, wy=top+58, wh=uH-46;
    R(g,cx-ww/2-6,wy-ww/2-6,ww+12,wh+ww/2+6,wt[4]); archF(g,cx-ww/2-5,wy-ww/2-5,ww+10,wh+ww/2+5,wt[1]); archF(g,cx-ww/2,wy-ww/2,ww,wh+ww/2,rd[4]); archF(g,cx-ww/2+2,wy-ww/2+2,ww-4,wh+ww/2-2,rd[2]);
    for(let yy=wy+4;yy<wy+wh;yy+=7) R(g,cx-ww/2+3,yy,ww-6,1,rd[4]); R(g,cx-1,wy-ww/2+3,2,wh+ww/2-3,rd[5]); ell(g,cx,wy-3,ww/2-5,ww/2-7,GLASS[3]); R(g,cx-ww/2+3,wy-ww/2+6,2,wh,rd[1]);
    if(k===1||k===4) emitW(g,g=>{ archF(g,cx-ww/2+3,wy-ww/2+3,ww-6,wh+ww/2-3,'#e8a050'); archF(g,cx-ww/2+6,wy-ww/2+6,ww-12,ww/2,'#ffd890'); R(g,cx-1,wy-ww/2+3,2,wh+ww/2-3,'#6a2a18'); });
    sacada(g,cx-ww/2-8,wy+wh+1,ww+16,c); }
  for(let k=0;k<5;k++){ const cx=Math.round(x+30+k*(w-60)/4), dw=34, dy=HB-gH+38, dh=gH-50;
    R(g,cx-dw/2-6,dy-dw/2-6,dw+12,dh+dw/2+6,wt[4]); archF(g,cx-dw/2-5,dy-dw/2-5,dw+10,dh+dw/2+5,wt[1]); archF(g,cx-dw/2,dy-dw/2,dw,dh+dw/2,rd[4]); archF(g,cx-dw/2+2,dy-dw/2+2,dw-4,dh+dw/2-2,rd[2]);
    ell(g,cx,dy-4,dw/2-6,dw/2-8,GLASS[3]); R(g,cx-1,dy,2,dh,rd[5]); for(const yy of [dy+6,dy+dh/2+2]){ R(g,cx-dw/2+5,yy,dw/2-7,dh/2-10,rd[3]); R(g,cx-dw/2+6,yy+1,dw/2-9,dh/2-12,rd[1]); R(g,cx+3,yy,dw/2-7,dh/2-10,rd[3]); R(g,cx+4,yy+1,dw/2-9,dh/2-12,rd[2]); }
    R(g,cx-5,dy+dh/2,2,4,'#e8c860'); R(g,cx+3,dy+dh/2,2,4,'#e8c860'); if(k===2) streak(g,cx-6,dy+14,16,4,'#5a0e18'); }
  R(g,x,HB-12,w,12,c[3]); R(g,x,HB-12,w,2,c[1]); R(g,x,HB-4,w,4,c[5]);
  for(let i=0;i<6;i++) streak(g,x+10+hsh(i*4.1)*(w-20),top+34,12+hsh(i)*26,3,c[3]); limo(g,x,HB-12,w,c,17); crack(g,x+w-40,top+60,16,c[4],3); umidade(g,x+60,top+34,50,60,c,9);
  const sx=x+w/2, sy=top+15; poly(g,[[sx,sy-8],[sx+7,sy+4],[sx-7,sy+4]],'#3a4a7a'); poly(g,[[sx,sy+8],[sx+7,sy-4],[sx-7,sy-4]],'#3a4a7a'); poly(g,[[sx,sy-5],[sx+4,sy+2],[sx-4,sy+2]],wt[2]); poly(g,[[sx,sy+5],[sx+4,sy-2],[sx-4,sy-2]],wt[2]);
  placa(g,x+w-58,HB-58,'1636','#5a4a2a','#f0e0b0',1); arandela(g,x+4,HB-gH-4,true);
  R(g,x+w,top,2,HB-top,'#1a1028'); }
function bonecos(g,x){ const w=320; sobrado(g,x,w,{seed:777,col:'#e683a4',fl:3,shut:'#3a6ad0',par:'escalonada',awning:['#ffd23f','#e85a3a'],door:1});
  placa(g,x+w/2-tw('EMBAIXADA DOS BONECOS GIGANTES',1)/2-6,HB-232,'EMBAIXADA DOS BONECOS GIGANTES','#2a1a4a','#ffe27a',1); }
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
function teatroApolo(g,x){ const w=440, c=rmp('#efd99a'), top=60;
  R(g,x,top,w,HB-top,c[2]); shade(g,x,top,w*.35,HB-top,'#fff0d0',.06);
  for(let yy=HB-110;yy<HB-14;yy+=10){ R(g,x,yy,w,1,c[4]); R(g,x,yy+1,w,1,c[1]); }
  cornice(g,x-4,HB-110,w+8,c,true); cornice(g,x-6,top+40,w+12,c,true);
  // frontão triangular com tímpano
  poly(g,[[x-8,top+30],[x+w/2,top-34],[x+w+8,top+30]],c[4]); poly(g,[[x-4,top+28],[x+w/2,top-30],[x+w+4,top+28]],c[1]); poly(g,[[x+20,top+24],[x+w/2,top-18],[x+w-20,top+24]],c[3]); poly(g,[[x+26,top+23],[x+w/2,top-14],[x+w-26,top+23]],c[2]);
  ell(g,x+w/2,top+8,18,12,c[4]); ell(g,x+w/2,top+8,16,10,c[1]); for(let k=0;k<5;k++) line(g,x+w/2,top+16,x+w/2-14+k*7,top+2,c[3]);
  for(const sx of [x+30,x+w-50]) { R(g,sx,top+14,20,10,c[1]); R(g,sx+4,top+6,12,8,c[1]); }
  const t='TEATRO APOLO', s=3; R(g,x+w/2-tw(t,s)/2-10,top+42,tw(t,s)+20,30,'#3a2a1a'); R(g,x+w/2-tw(t,s)/2-8,top+44,tw(t,s)+16,26,'#5a4020'); textSh(g,t,x+w/2-tw(t,s)/2,top+48,s,'#ffe9a8','#1a1008');
  // colunas jônicas
  for(let k=0;k<6;k++){ const cx=x+30+k*(w-60)/5; R(g,cx-10,top+76,20,HB-110-top-76,c[4]); R(g,cx-9,top+76,18,HB-110-top-76,c[1]); R(g,cx-9,top+76,4,HB-110-top-76,c[0]); R(g,cx+4,top+76,5,HB-110-top-76,c[3]);
    for(let f=cx-5;f<cx+5;f+=3) R(g,f,top+80,1,HB-110-top-84,c[2]); ell(g,cx-10,top+78,5,5,c[3]); ell(g,cx+10,top+78,5,5,c[3]); ell(g,cx-10,top+78,3,3,c[1]); ell(g,cx+10,top+78,3,3,c[1]); R(g,cx-14,top+72,28,4,c[1]); R(g,cx-12,HB-116,24,6,c[1]); }
  for(let k=0;k<5;k++){ const wx=x+30+(k+.5)*(w-60)/5-12; janela(g,wx,top+108,24,48,{c,sh:rmp('#6a3a2a'),s:k+50,st:pick(['acesa','escura','fechada','vidro','acesa'],k/5),arch:true}); sacada(g,wx-10,top+157,44,c); }
  for(let k=0;k<3;k++){ const dx=x+w/2-130+k*130; porta(g,dx-22,HB-92,44,78,{c,s:600+k,kind:k===1?'aberta':'madeira',wood:'#6a2a2a'}); for(let b=dx-22;b<dx+22;b+=4) R(g,b,HB-92,1,78,IRON[2]); R(g,dx-22,HB-60,44,2,IRON[1]); }
  R(g,x,HB-14,w,14,c[3]); R(g,x,HB-14,w,2,c[1]); R(g,x,HB-5,w,5,c[5]);
  for(let i=0;i<8;i++) streak(g,x+10+hsh(i*3.3)*(w-20),top+40,14+hsh(i)*40,3,c[3]); peel(g,x+60,HB-150,28,16,c,61); crack(g,x+w-70,top+100,22,c[4],13);
  poster(g,x+w/2-80,HB-84,3); poster(g,x+w/2+60,HB-80,8);
  R(g,x+w,top,2,HB-top,'#1a1028');
}
function andaime(g,x,w){ const top=sobrado(g,x,w,{seed:1234,col:'#cbbca6',fl:3,par:'reta',dark:true});
  const p=rmp('#9a9cac'), wd=rmp('#b8884a');
  for(let py=top+16;py<HB;py+=60){ R(g,x-14,py,w+28,6,wd[4]); R(g,x-14,py,w+28,5,wd[2]); R(g,x-14,py,w+28,1,wd[0]); for(let xx=x-14;xx<x+w+14;xx+=30) R(g,xx,py,1,5,wd[4]); R(g,x-14,py+6,w+28,3,'#140a20'); }
  for(let px=x-10;px<=x+w+10;px+=56){ R(g,px,top-10,4,HB-top+10,p[4]); R(g,px,top-10,3,HB-top+10,p[2]); R(g,px,top-10,1,HB-top+10,p[0]); }
  for(let py=top+16;py<HB-40;py+=60) for(let px=x-10;px<x+w;px+=56) line(g,px+2,py+6,px+58,py+60,p[3],2);
  // tela verde rasgada
  const nx=x+w*.38, nw=w*.62+14; g.save(); g.globalAlpha=.72; R(g,nx,top-6,nw,HB-top-40,'#2e8a54'); g.restore();
  for(let yy=top-6;yy<HB-46;yy+=4) R(g,nx,yy,nw,1,'rgba(14,60,30,.6)'); for(let xx=nx;xx<nx+nw;xx+=4) R(g,xx,top-6,1,HB-top-40,'rgba(60,170,100,.35)');
  poly(g,[[nx+20,HB-46],[nx+60,HB-46],[nx+44,HB-90],[nx+30,HB-70]],'#1a1028'); R(g,nx,top-6,nw,3,'#1a5a34');
  placa(g,x+20,HB-62,'OBRA','#e8c03a','#1a1020',2); for(let k=0;k<6;k++){ R(g,x+w-70+k*10,HB-40,8,26,k%2?'#e83a3a':'#f2f2f2'); } }
function grafiteMangue(g,x){ const w=440, h=150, y=HB-h, wl=rmp('#8e8898');
  R(g,x,y,w,h,wl[2]); for(let yy=y+10;yy<HB;yy+=10){ R(g,x,yy,w,1,wl[3]); for(let xx=x+((yy/10)%2)*14;xx<x+w;xx+=28) R(g,xx,yy-9,1,9,wl[3]); }
  R(g,x-4,y-6,w+8,7,wl[1]); R(g,x-4,y-6,w+8,1,wl[0]); R(g,x-4,y+1,w+8,2,wl[4]);
  // fundo do grafite
  blob(g,x+30,y+14,w-60,h-28,'#1e1640'); for(let k=0;k<14;k++){ ell(g,x+50+k*26,y+30+Math.sin(k)*14,14,10,pick(['#2ad8c8','#ffd23f','#ff4a8a','#5a3ad8'],k/14)); }
  for(let k=0;k<30;k++) R(g,x+40+hsh(k)*(w-80),y+20+hsh(k*3)*(h-40),3,3,'#fff2b0');
  // caranguejo com antena (design próprio)
  const cx=x+w/2, cy=y+90, cr=rmp('#e8443a');
  for(const sx of [-1,1]){ for(let k=0;k<3;k++){ line(g,cx+sx*36,cy+4+k*8,cx+sx*(58+k*6),cy+16+k*10,'#1a0a14',5); line(g,cx+sx*36,cy+4+k*8,cx+sx*(58+k*6),cy+16+k*10,cr[2],3); }
    line(g,cx+sx*30,cy-10,cx+sx*58,cy-34,'#1a0a14',7); line(g,cx+sx*30,cy-10,cx+sx*58,cy-34,cr[2],4);
    ell(g,cx+sx*66,cy-46,16,13,'#1a0a14'); ell(g,cx+sx*66,cy-46,14,11,cr[2]); ell(g,cx+sx*62,cy-50,7,5,cr[1]); poly(g,[[cx+sx*60,cy-54],[cx+sx*80,cy-66],[cx+sx*72,cy-48]],'#1e1640'); }
  ell(g,cx,cy,42,24,'#1a0a14'); ell(g,cx,cy,40,22,cr[2]); ell(g,cx-10,cy-8,24,10,cr[1]); ell(g,cx+12,cy+8,24,10,cr[3]);
  for(const sx of [-1,1]){ R(g,cx+sx*12-2,cy-34,4,14,'#1a0a14'); ell(g,cx+sx*12,cy-36,7,7,'#1a0a14'); ell(g,cx+sx*12,cy-36,5,5,'#ffffff'); ell(g,cx+sx*13,cy-35,2,2,'#1a0a14'); }
  R(g,cx-1,cy-62,3,40,'#1a0a14'); R(g,cx,cy-62,1,40,'#d8d8e8'); ell(g,cx+4,cy-66,14,7,'#1a0a14'); ell(g,cx+4,cy-67,12,5,'#d8dce8'); R(g,cx+2,cy-72,3,3,'#ffd23f');
  for(let k=0;k<3;k++){ ell(g,cx+18,cy-72-k*8,8+k*5,3+k*2,'#ffd23f'); ell(g,cx+18,cy-72-k*8,6+k*5,2+k*2,'#1e1640'); }
  textSh(g,'MANGUE',x+46,y+108,4,'#2ad8c8','#0e0820'); textSh(g,'BEAT',x+w-150,y+108,4,'#ffd23f','#0e0820');
  for(let k=0;k<8;k++) R(g,x+50+hsh(k*7)*(w-100),y+136,2,6+hsh(k)*12,pick(['#2ad8c8','#ffd23f','#ff4a8a'],hsh(k*3)));
  pixo(g,x+20,HB-6,55,'#1a1020'); pixo(g,x+w-110,HB-8,77,'#e8e0d0'); poster(g,x+10,y+20,4); poster(g,x+w-36,y+40,9);
  R(g,x,HB-8,w,8,wl[4]); R(g,x,HB-2,w,2,wl[5]);
  // casario continua atrás do muro
}
function malakoff(g,x){ const c=rmp('#f0e2b0'), w=380, bh=150, by=HB-bh, cx=x+w/2, tw0=150, ty=40;
  R(g,x,by,w,bh,c[2]); shade(g,x,by,w*.3,bh,'#fff0d0',.06); for(let yy=by+10;yy<HB-14;yy+=9){ R(g,x,yy,w,1,c[4]); R(g,x,yy+1,w,1,c[1]); }
  cornice(g,x-4,by+10,w+8,c,true); for(let k=0;k<w;k+=14){ R(g,x+k,by-12,8,12,c[1]); R(g,x+k,by-12,8,1,c[0]); R(g,x+k+6,by-12,2,12,c[3]); }
  for(const sx of [x+20,x+w-70]) for(let k=0;k<2;k++){ janela(g,sx+k*30,by+46,22,40,{c,sh:rmp('#3a5a4a'),s:sx+k,st:k?'fechada':'acesa',arch:true}); janela(g,sx+k*30,by+112,22,34,{c,sh:rmp('#3a5a4a'),s:sx+k+5,st:'escura'}); }
  // torre
  R(g,cx-tw0/2,ty,tw0,HB-ty,c[2]); shade(g,cx-tw0/2,ty,tw0*.35,HB-ty,'#fff0d0',.07); R(g,cx-tw0/2,ty,10,HB-ty,c[1]); R(g,cx+tw0/2-10,ty,10,HB-ty,c[3]); R(g,cx+tw0/2-3,ty,3,HB-ty,c[4]);
  for(const yy of [ty+70,ty+140]) cornice(g,cx-tw0/2-5,yy,tw0+10,c,true);
  for(let k=0;k<tw0;k+=12){ R(g,cx-tw0/2+k,ty-14,8,14,c[1]); R(g,cx-tw0/2+k,ty-14,8,1,c[0]); R(g,cx-tw0/2+k+6,ty-14,2,14,c[4]); }
  // portão em arco
  R(g,cx-50,HB-150,100,150,c[4]); archF(g,cx-48,HB-148,96,148,c[1]); archF(g,cx-40,HB-140,80,140,'#120a1e'); for(let k=0;k<9;k++){ const a=Math.PI*(k/8); R(g,cx-Math.cos(a)*44-3,HB-100-Math.sin(a)*44-3,6,6,c[k%2?3:0]); }
  for(let b=cx-38;b<cx+40;b+=6) R(g,b,HB-110,2,110,IRON[1]); R(g,cx-40,HB-70,80,3,IRON[0]); R(g,cx-40,HB-30,80,3,IRON[2]); R(g,cx-6,HB-74,12,10,'#c8a03a');
  // relógio
  ell(g,cx,ty+104,20,20,c[4]); ell(g,cx,ty+104,18,18,c[1]); ell(g,cx,ty+104,14,14,'#f6f0de'); line(g,cx,ty+104,cx,ty+93,'#1a1020',2); line(g,cx,ty+104,cx+8,ty+108,'#1a1020',2); for(let k=0;k<12;k++){ const a=k/12*Math.PI*2; R(g,cx+Math.cos(a)*12,ty+104+Math.sin(a)*12,1,1,'#3a2a3a'); }
  janela(g,cx-34,ty+18,22,38,{c,sh:rmp('#3a5a4a'),s:71,st:'escura',arch:true}); janela(g,cx+12,ty+18,22,38,{c,sh:rmp('#3a5a4a'),s:72,st:'acesa',arch:true});
  // observatório
  const d=rmp('#8a9cc0'); R(g,cx-30,ty-40,60,26,c[2]); R(g,cx-30,ty-40,60,2,c[1]); R(g,cx+22,ty-40,8,26,c[4]); for(let dy=0;dy<30;dy++){ const hw=Math.round(32*Math.sqrt(1-(dy/30)**2)); R(g,cx-hw,ty-40-dy,hw*2,1,d[2]); R(g,cx-hw,ty-40-dy,Math.round(hw*.5),1,d[1]); R(g,cx+Math.round(hw*.5),ty-40-dy,Math.round(hw*.5),1,d[4]); }
  R(g,cx-4,ty-70,8,30,'#140c22'); R(g,cx-2,ty-70,1,30,d[0]); R(g,cx+12,ty-96,2,30,IRON[2]); poly(g,[[cx+14,ty-96],[cx+36,ty-90],[cx+14,ty-84]],'#d83a3a');
  const t='TORRE MALAKOFF', s=2; R(g,cx-tw(t,s)/2-8,ty+150,tw(t,s)+16,22,'#2a2a3a'); textSh(g,t,cx-tw(t,s)/2,ty+154,s,'#f2e2b0','#0e0816');
  R(g,x,HB-14,w,14,c[3]); R(g,x,HB-14,w,2,c[1]); R(g,x,HB-5,w,5,c[5]);
  for(let i=0;i<7;i++) streak(g,x+10+hsh(i*5.5)*(w-20),by+12,14+hsh(i)*30,3,c[3]); crack(g,cx+40,ty+30,24,c[4],4); peel(g,x+40,by+60,24,14,c,8);
  arandela(g,cx-70,HB-120,true); arandela(g,cx+52,HB-120,true);
}
function pacoFrevo(g,x){ // Paço do Frevo: bloco branco de 4 pavimentos, janelas verdes, sombrinhas de frevo em varais na fachada
  const w=360, c=rmp('#eeece6'), sh=rmp('#2f7a4e'), gH=88, uH=60, fl=4, top=HB-gH-(fl-1)*uH-24;
  R(g,x,top,w,HB-top,c[2]); for(let i=0;i<8;i++) blob(g,x+hsh(i*3.3+1)*(w-60),top+30+hsh(i*5.1)*(HB-top-80),40+hsh(i)*50,20+hsh(i*7)*30,hsh(i*2.2)>.5?c[1]:c[3]);
  shade(g,x,top,w*.3,HB-top,'#fff6e0',.07); shade(g,x+w*.7,top,w*.3,HB-top,'#1a0c30',.1);
  R(g,x,top,9,HB-top,c[1]); R(g,x,top,2,HB-top,c[0]); R(g,x+w-9,top,9,HB-top,c[3]);
  R(g,x-4,top,w+8,24,c[2]); R(g,x-4,top,w+8,3,c[0]); cornice(g,x-6,top+24,w+12,c,true);
  for(let f=1;f<fl;f++) cornice(g,x-3,HB-gH-(f-1)*uH,w+6,c,f===1);
  const n=7, bw=w/n;
  for(let f=1;f<fl;f++){ const y0=HB-gH-f*uH; for(let k=0;k<n;k++){ const cx=Math.round(x+(k+.5)*bw); janela(g,cx-11,y0+20,22,uH-34,{c,sh,s:k*5+f*11+3,st:pick(['fechada','fechada','acesa','fechada','escura','fechada','quebrada'],hsh(k*1.9+f*3.7))}); if(f===1) sacada(g,cx-16,y0+20+uH-34+1,32,c); } }
  const gy=HB-gH; for(let k=0;k<n;k++){ const cx=Math.round(x+(k+.5)*bw); if(k===3) porta(g,cx-18,gy+30,36,gH-44,{c,s:91,kind:'aberta'}); else janela(g,cx-12,gy+32,24,gH-52,{c,sh,s:k+300,st:k%2?'fechada':'escura'}); }
  const cols=['#ff3a5a','#ffd23f','#3ab0ff','#4ad86a','#ff8a3a','#c04ae8'];
  for(let row=0;row<3;row++){ const y0=top+36+row*uH; sag(g,x-30,y0,x+w+30,y0+4,16,'#1a1020',1,(px,py,i)=>{ if(i%34===10+row*11) sombrinha(g,px,py+15,13+(i%3),cols,i+row); }); }
  R(g,x+w-40,top+40,24,140,'#c8303a'); R(g,x+w-40,top+40,24,2,'#ff6a6a'); R(g,x+w-18,top+40,2,140,'#7a1a20'); for(let i=0;i<5;i++) text(g,'FREVO'[i],x+w-31,top+52+i*12,1,'#fff0c0');
  const t='PACO DO FREVO', s=2; R(g,x+w/2-tw(t,s)/2-10,gy+4,tw(t,s)+20,22,'#b8303a'); R(g,x+w/2-tw(t,s)/2-10,gy+4,tw(t,s)+20,2,'#ff7a6a'); textSh(g,t,x+w/2-tw(t,s)/2,gy+8,s,'#fff0c0','#4a0a14');
  R(g,x,HB-14,w,14,c[3]); R(g,x,HB-14,w,2,c[1]); R(g,x,HB-5,w,5,c[5]); for(let i=0;i<9;i++) streak(g,x+10+hsh(i*4.4)*(w-20),top+30+hsh(i)*120,10+hsh(i*3)*26,3,c[3]); limo(g,x,HB-14,w,c,77);
  for(let i=0;i<2;i++) umidade(g,x+40+i*170,HB-gH-2*uH+2,50,50,c,i+3);
  R(g,x+w,top,2,HB-top,'#1a1028'); }
function armazem(g,x,w,num,o={}){ const c=rmp(o.col||'#e4d6b2'), h=150, y=HB-h, dc=rmp('#3e8a6e');
  R(g,x,y,w,h,c[2]); shade(g,x,y,w*.3,h,'#fff0d0',.05); for(let i=0;i<8;i++) blob(g,x+hsh(x+i)*(w-60),y+20+hsh(x*3+i)*(h-60),40+hsh(i)*40,20+hsh(i*3)*20,hsh(x+i*7)>.5?c[1]:c[3]);
  // frontão escalonado central
  const cx=x+w/2; R(g,cx-130,y-24,260,26,c[2]); R(g,cx-134,y-27,268,4,c[1]); R(g,cx-134,y-27,268,1,c[0]); R(g,cx-60,y-46,120,24,c[2]); R(g,cx-64,y-49,128,4,c[1]); R(g,cx-64,y-49,128,1,c[0]);
  cornice(g,x-4,y+8,w+8,c,true); R(g,x-3,y-4,w+6,4,c[1]);
  const t=num, s=3; R(g,cx-tw(t,s)/2-10,y-42,tw(t,s)+20,32,c[4]); R(g,cx-tw(t,s)/2-8,y-40,tw(t,s)+16,28,c[3]); textSh(g,t,cx-tw(t,s)/2,y-35,s,'#f6ecd0','#2a1a2a');
  const n=Math.floor((w-40)/120); for(let k=0;k<n;k++){ const dx=x+20+(k+.5)*(w-40)/n-48, dw=96, dh=118;
    R(g,dx-8,HB-dh-8,dw+16,dh+8,c[4]); archF(g,dx-6,HB-dh-6,dw+12,dh+6,c[1]); archF(g,dx,HB-dh,dw,dh,dc[2]);
    const open=hsh(x+k*5)>.65; if(open){ archF(g,dx+6,HB-dh+20,dw-12,dh-20,'#120a1c'); R(g,dx+6,HB-30,dw-12,30,'#1c1430'); }
    else { for(let xx=dx+3;xx<dx+dw;xx+=6){ R(g,xx,HB-dh+16,1,dh-16,dc[4]); R(g,xx+1,HB-dh+16,1,dh-16,dc[1]); } R(g,dx+dw/2-1,HB-dh+10,2,dh-10,dc[5]); R(g,dx,HB-dh/2,dw,3,dc[3]); R(g,dx+dw/2-8,HB-dh/2-2,6,8,'#c8a03a'); }
    for(let r=0;r<4;r++){ const a=Math.PI*(r+.5)/4; line(g,dx+dw/2,HB-dh+dw/2,dx+dw/2-Math.cos(a)*dw/2,HB-dh+dw/2-Math.sin(a)*dw/2,dc[4],2); } R(g,dx,HB-dh+dw/2-1,dw,3,dc[3]);
    for(let i=0;i<3;i++) streak(g,dx+10+i*30,HB-dh+30,10+hsh(dx+i)*30,3,mix(dc[3],'#8a5a3a',.5));
    janela(g,dx+dw+14,y+44,14,24,{c,sh:dc,s:dx,st:hsh(dx)>.6?'acesa':'fechada'}); }
  R(g,x,HB-12,w,12,c[3]); R(g,x,HB-12,w,2,c[1]); R(g,x,HB-4,w,4,c[5]);
  for(let i=0;i<10;i++) streak(g,x+10+hsh(x+i*3.3)*(w-20),y+10,14+hsh(i)*30,3,c[3]);
  if(o.sign) placa(g,x+40,y+20,o.sign,'#1e4a3a','#f2ecd0',2);
  pixo(g,x+60,HB-16,x,'#1a1020'); tag(g,x+w-160,HB-60,x*3); poster(g,x+w-70,HB-80,x);
  R(g,x+w,y,2,h,'#1a1028');
}
function guindaste(g,x){ // guindaste de pórtico do porto, amarelo enferrujado
  const c=rmp('#d89a3a'), r=rmp('#8a4a2a'), top=30, lw=16;
  const leg=(lx)=>{ R(g,lx-2,top+70,lw+4,HB-top-70,c[5]); R(g,lx,top+70,lw,HB-top-70,c[2]); R(g,lx,top+70,4,HB-top-70,c[1]); R(g,lx+lw-4,top+70,4,HB-top-70,c[4]);
    for(let yy=top+80;yy<HB-10;yy+=22){ line(g,lx+2,yy,lx+lw-2,yy+20,c[4],2); line(g,lx+lw-2,yy,lx+2,yy+20,c[4],2); R(g,lx,yy,lw,2,c[3]); } for(let k=0;k<4;k++) blob(g,lx+1,top+90+hsh(lx+k)*180,lw-2,10,r[2]); };
  leg(x); leg(x+150);
  R(g,x-4,HB-40,174,10,c[5]); R(g,x-2,HB-38,170,6,c[2]); R(g,x-2,HB-38,170,1,c[1]);
  for(const wx of [x+8,x+158]){ ell(g,wx,HB-6,9,9,'#16121e'); ell(g,wx,HB-6,4,4,METAL[2]); }
  // cabine e casa de máquinas
  R(g,x-20,top+40,206,34,c[5]); R(g,x-18,top+42,202,30,c[2]); R(g,x-18,top+42,202,4,c[1]); for(let k=x-10;k<x+180;k+=16) R(g,k,top+50,2,18,c[3]);
  R(g,x+110,top+10,70,34,c[5]); R(g,x+112,top+12,66,30,c[2]); R(g,x+112,top+12,66,3,c[1]); R(g,x+120,top+18,22,16,GLASS[2]); R(g,x+122,top+20,8,12,GLASS[1]); emit(g,g=>R(g,x+146,top+18,22,16,'#e8a050'));
  for(let k=0;k<6;k++) blob(g,x-10+hsh(k+x)*180,top+44+hsh(k*3)*20,12,6,r[2]);
  textSh(g,'CDP',x+20,top+50,2,c[0],c[4]);
  // lança treliçada
  for(let k=0;k<340;k+=2){ const bx=x+150+k, by=top+12-Math.round(k*.2); R(g,bx,by,3,4,c[5]); R(g,bx,by+1,2,2,(k/2)%8<4?c[2]:c[1]); R(g,bx,by+18,3,3,c[5]); }
  for(let k=0;k<340;k+=18){ line(g,x+150+k,top+14-k*.2,x+159+k,top+31-k*.2-2,c[4],2); line(g,x+159+k,top+31-k*.2-2,x+168+k,top+14-(k+18)*.2,c[4],2); }
  line(g,x+170,top+10,x+490,top-56,'#1a1020'); R(g,x+486,top-52,2,180,'#1a1020'); R(g,x+476,top+128,22,12,'#1a1020'); R(g,x+478,top+129,18,9,METAL[2]); line(g,x+480,top+140,x+487,top+152,'#1a1020',2); line(g,x+494,top+140,x+487,top+152,'#1a1020',2);
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
function haze(col,y,y0,y1,amt){ return mix(col,'#4c5a8a',Math.max(0,1-(y-y0)/(y1-y0))*amt); }
function lowf(x,y,s){ return (Math.sin(x*.0061+s)+Math.sin(x*.0137+y*.021+s*2)+Math.sin(y*.033-x*.0029+s))/3; }
function stoneDome(g,xs,ys,W2,H2,c,t){ const r=H2>8?2:1, tb=Math.max(1,Math.round(H2*.14)), bb=Math.max(1,Math.round(H2*.2));
  R(g,xs+r,ys,W2-2*r,H2,c[t]); R(g,xs,ys+r,W2,H2-2*r,c[t]); R(g,xs+r,ys,W2-2*r,tb,c[t-1]); if(H2>6) R(g,xs+2,ys+1,Math.round(W2*.3),1,c[Math.max(0,t-2)]); if(H2>8) R(g,xs+1,ys+tb+1,Math.max(1,Math.round(W2*.12)),H2-tb-bb-1,mix(c[t],c[t-1],.5));
  R(g,xs+r,ys+H2-bb,W2-2*r,bb,c[Math.min(5,t+1)]); R(g,xs+r,ys+H2-1,W2-2*r,1,c[Math.min(5,t+2)]); R(g,xs+W2-1,ys+r,1,H2-2*r,c[Math.min(5,t+1)]); }
function fCobble(g,a,b,col,s,irr,X0){ col=mix(col,'#7e8ca2',.34); R(g,a,ST,b-a,HH-ST,mix(col,'#140c22',.62));
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
function sombrinha(g,cx,cy,r,cols,s){ for(let dy=0;dy<r;dy++){ const hw=Math.round(Math.sqrt(r*r-(r-dy)**2)*1.25); for(let k=-hw;k<hw;k++){ const seg=Math.floor((Math.atan2(dy-r,k)+Math.PI)/(Math.PI/6)); R(g,cx+k,cy-r+dy,1,1,cols[(seg+s)%cols.length]); } }
  R(g,cx-Math.round(r*1.25),cy,Math.round(r*2.5),1,'#1a1020'); R(g,cx,cy,1,Math.round(r*.9),'#1a1020'); R(g,cx-1,cy-r-3,2,3,'#1a1020'); }
function cupulaTorre(g,cx,yb,w){ // cúpula bulbosa de pedra das torres da Madre de Deus, com pináculos
  const d=rmp('#7e7464'), wl=rmp('#f0e8d8'), st=rmp('#a89880');
  R(g,cx-w/2-2,yb-10,w+4,10,st[2]); R(g,cx-w/2-2,yb-10,w+4,2,st[1]); R(g,cx-w/2-2,yb-2,w+4,2,st[4]);
  for(const px of [cx-w/2+1,cx+w/2-9]){ R(g,px,yb-24,8,14,wl[2]); R(g,px,yb-24,2,14,wl[0]); ell(g,px+4,yb-28,5,5,wl[1]); R(g,px+3,yb-40,2,9,wl[2]); ell(g,px+4,yb-42,2,2,wl[1]); }
  const r=Math.round(w*.36), hh=Math.round(r*1.4), base=yb-10; R(g,cx-r-4,base-10,r*2+8,10,wl[2]); R(g,cx-r-4,base-10,r*2+8,2,wl[0]); for(let k=0;k<4;k++){ ell(g,cx-r+6+k*(2*r-12)/3,base-5,3,3,'#1a1430'); }
  const b2=base-10; for(let dy=0;dy<hh;dy++){ const t=dy/hh, hw=Math.round(r*Math.sqrt(Math.max(0,1-t*t))*(1+.14*Math.sin(t*Math.PI))); const y=b2-dy;
    R(g,cx-hw-1,y,hw*2+2,1,d[5]); R(g,cx-hw,y,hw*2,1,d[2]); R(g,cx-hw,y,Math.round(hw*.5),1,d[1]); R(g,cx-hw+2,y,Math.max(1,Math.round(hw*.15)),1,d[0]); R(g,cx+Math.round(hw*.45),y,Math.round(hw*.55),1,d[3]); R(g,cx+Math.round(hw*.8),y,Math.round(hw*.2),1,d[4]); }
  for(let k=-2;k<=2;k++) for(let dy=3;dy<hh-3;dy++){ const t=dy/hh, hw=r*Math.sqrt(1-t*t)*(1+.14*Math.sin(t*Math.PI)); R(g,cx+Math.round(k/3*hw),b2-dy,1,1,d[4]); }
  for(let i=0;i<3;i++) blob(g,cx-r*.6+hsh(cx+i)*r,b2-hh*.6+hsh(i*3)*hh*.4,8,5,'#4e6a4a');
  const ly=b2-hh; R(g,cx-6,ly-14,12,14,wl[2]); R(g,cx-6,ly-14,3,14,wl[1]); R(g,cx-2,ly-10,4,6,'#1a1430'); ell(g,cx,ly-16,8,3,d[2]);
  R(g,cx-1,ly-36,3,20,st[4]); R(g,cx-6,ly-30,13,3,st[4]); R(g,cx,ly-36,1,20,st[1]); }
function espiral(g,cx,cy,r,dir,c,t){ for(let a=0;a<Math.PI*3.2;a+=.1){ const rr=r*(1-a/(Math.PI*3.6)); R(g,cx+Math.cos(a)*rr*dir,cy+Math.sin(a)*rr,t,t,c); } }
function posteNassau(g,x,yb,h,lit){ // poste de ferro da ponte: braços em voluta e duas lanternas
  const ir=IRON; R(g,x-10,yb-26,20,26,ir[4]); R(g,x-9,yb-25,18,24,ir[2]); R(g,x-9,yb-25,4,24,ir[1]); R(g,x-12,yb-28,24,4,ir[1]); R(g,x-12,yb-28,24,1,ir[0]);
  R(g,x-3,yb-h,6,h-26,ir[4]); R(g,x-2,yb-h,4,h-26,ir[2]); R(g,x-2,yb-h,1,h-26,ir[0]); for(const yy of [yb-50,yb-h*.55]){ R(g,x-5,yy,10,5,ir[2]); R(g,x-5,yy,10,1,ir[0]); }
  const ty=yb-h;
  for(const sx of [-1,1]){ line(g,x,ty+12,x+sx*28,ty+2,ir[3],3); espiral(g,x+sx*12,ty+22,9,sx,ir[3],2); espiral(g,x+sx*24,ty+10,5,-sx,ir[3],2);
    const lx=x+sx*30; R(g,lx-1,ty-6,2,9,ir[3]);
    poly(g,[[lx-8,ty-4],[lx+8,ty-4],[lx+6,ty-26],[lx-6,ty-26]],ir[4]); poly(g,[[lx-6,ty-6],[lx+6,ty-6],[lx+5,ty-24],[lx-5,ty-24]],'#3a3450');
    if(lit) emitW(g,g=>{ poly(g,[[lx-6,ty-6],[lx+6,ty-6],[lx+5,ty-24],[lx-5,ty-24]],'#ffe6a0'); R(g,lx-2,ty-22,3,14,'#fffbe8'); });
    R(g,lx-1,ty-26,2,22,ir[4]); poly(g,[[lx-10,ty-26],[lx,ty-36],[lx+10,ty-26]],ir[3]); R(g,lx-1,ty-41,2,6,ir[2]);
    if(lit){ glow(g,lx,ty-15,58,'#ffb860',.06,5); reg(LAMPS,{x:lx/RS,y:(ty-15)/RS,r:20,mid:true}); } }
  R(g,x-2,ty-18,4,30,ir[2]); ell(g,x,ty-20,4,4,ir[1]); R(g,x-1,ty-30,2,10,ir[3]); }
function posteGlobo(g,x,yb,h,lit){ // candelabro de ferro com três globos (Bom Jesus, Rio Branco)
  const ir=IRON; R(g,x-11,yb-30,22,30,ir[4]); R(g,x-10,yb-29,20,28,ir[2]); R(g,x-10,yb-29,5,28,ir[1]); R(g,x-13,yb-6,26,6,ir[3]); ell(g,x,yb-32,12,4,ir[2]); ell(g,x-3,yb-33,5,2,ir[0]);
  R(g,x-3,yb-h,6,h-30,ir[4]); R(g,x-2,yb-h,4,h-30,ir[2]); R(g,x-2,yb-h,1,h-30,ir[0]); for(const yy of [yb-56,yb-h*.55]){ R(g,x-5,yy,10,4,ir[2]); R(g,x-5,yy,10,1,ir[0]); }
  const ty=yb-h;
  for(const [dx,dy] of [[0,-20],[-28,6],[28,6]]){ if(dx){ sag(g,x,ty+16,x+dx,ty+dy+12,-9,ir[3],3); espiral(g,x+dx*.45,ty+24,5,dx>0?1:-1,ir[3],2); }
    const gx=x+dx, gy=ty+dy; R(g,gx-4,gy+8,8,4,ir[2]); R(g,gx-3,gy+11,6,3,ir[3]); ell(g,gx,gy,10,11,'#262236'); ell(g,gx,gy,9,10,'#6a6a8a'); ell(g,gx-3,gy-3,3,4,'#9a9ab8');
    if(lit) emitW(g,g=>{ ell(g,gx,gy,9,10,'#ffeec0'); ell(g,gx-2,gy-3,5,5,'#ffffff'); R(g,gx-9,gy+4,18,2,'#f0c070'); });
    if(lit){ glow(g,gx,gy,50,'#ffc070',.06,5); reg(LAMPS,{x:gx/RS,y:gy/RS,r:16,mid:true}); } } }
function parapeitoPonte(g,a,b){ // parapeito da ponte: pilaretes creme e painéis vermelhos com medalhão
  const c=rmp('#e2d8c4'), r=rmp('#b8443a'), y0=262, yb=HB+6, mh=(y0+yb)/2;
  R(g,a,y0,b-a,yb-y0,c[3]);
  for(let x=Math.floor(a/64)*64-64;x<b+64;x+=64){
    R(g,x+10,y0+11,44,yb-y0-20,c[4]); R(g,x+12,y0+13,40,yb-y0-24,r[2]); R(g,x+12,y0+13,40,2,r[1]); R(g,x+12,y0+13,2,yb-y0-24,r[1]); R(g,x+50,y0+13,2,yb-y0-24,r[4]); R(g,x+12,yb-13,40,2,r[4]);
    ell(g,x+32,mh,8,7,c[4]); ell(g,x+32,mh,7,6,c[1]); ell(g,x+32,mh,4,3,r[3]);
    R(g,x,y0+8,10,yb-y0-8,c[2]); R(g,x,y0+8,3,yb-y0-8,c[1]); R(g,x+8,y0+8,2,yb-y0-8,c[4]);
    if(hsh(x*.7)>.55) streak(g,x+14+hsh(x)*30,y0+14,8+hsh(x*3)*12,3,r[4]); if(hsh(x*.31)>.8) tag(g,x+14,y0+16,x); }
  R(g,a,y0,b-a,9,c[2]); R(g,a,y0,b-a,2,c[0]); R(g,a,y0+2,b-a,1,c[1]); R(g,a,y0+8,b-a,2,c[4]);
  R(g,a,yb-6,b-a,8,c[3]); R(g,a,yb-6,b-a,1,c[1]); R(g,a,yb+1,b-a,2,c[5]);
  for(let x=Math.floor(a/576)*576+96;x<b+60;x+=576){ R(g,x-16,y0-6,32,yb-y0+6,c[4]); R(g,x-15,y0-5,30,yb-y0+5,c[2]); R(g,x-15,y0-5,7,yb-y0+5,c[1]); R(g,x+9,y0-5,6,yb-y0+5,c[3]); R(g,x-18,y0-8,36,4,c[1]); R(g,x-18,y0-8,36,1,c[0]); } }
function torresFundo(g,a,b,base,s){ // prédios altos de Santo Antônio / São José do outro lado do rio
  for(let k=Math.floor(a/86)-1;k<b/86+1;k++){ const v=hsh(k*5.3+s); if(v<.3) continue; const x=k*86+Math.round(hsh(k*1.7)*26), w=36+Math.round(hsh(k*2.1)*44), h=80+Math.round(Math.pow(hsh(k*3.3),1.4)*150), c=rmp(pick(['#5e6a96','#6e6894','#566290','#7a789c','#8a7a90'],hsh(k*9)));
    R(g,x,base-h,w,h,c[3]); R(g,x,base-h,Math.round(w*.3),h,c[2]); R(g,x+w-5,base-h,5,h,c[4]); R(g,x,base-h,w,2,c[1]);
    const glass=hsh(k*11)>.5; for(let yy=base-h+6;yy<base-4;yy+=glass?5:7) for(let xx=x+3;xx<x+w-6;xx+=glass?4:6){ const lv=hsh(xx*1.3+yy*.7); R(g,xx,yy,3,glass?2:3,c[4]); if(lv>.88) emit(g,g=>R(g,xx,yy,3,glass?2:3,lv>.97?'#fff2d0':'#f0c070')); }
    if(hsh(k*13)>.6){ R(g,x+w/2-1,base-h-18,2,18,c[4]); emit(g,g=>R(g,x+w/2-1,base-h-20,2,2,'#ff3a3a')); }
    if(hsh(k*17)>.85){ R(g,x+4,base-h-10,w-8,10,c[3]); R(g,x+6,base-h-14,w-12,4,c[2]); } } }
function torreVidro(g,x,w){ // torre cilíndrica de vidro escuro na esquina da praça
  const top=-12, gl=['#a2b4e4','#7488c4','#50609e','#36427a','#242c56','#181e3e'];
  for(let i=0;i<w;i++){ const u=i/w*2-1, k=Math.min(5,Math.max(0,Math.round((u+1)*2.3-(u<-.55?1.2:0)))); R(g,x+i,top,1,HB-40-top,gl[k]); }
  for(let y=top+6;y<HB-40;y+=14){ R(g,x,y,w,4,'#2a2c40'); R(g,x,y,w,1,'#5a5e7a'); for(let i=0;i<w;i+=2){ const u=i/w*2-1; if(u<-.25&&u>-.75) R(g,x+i,y+1,2,1,'#9aa0c0'); } }
  for(let i=9;i<w;i+=18) R(g,x+i,top,1,HB-40-top,'#141830');
  for(let y=top+10;y<HB-44;y+=14) for(let i=10;i<w-10;i+=18) if(hsh(i*1.7+y*.3)>.9){ const X=x+i+1, Y=y; emit(g,g=>R(g,X,Y,16,8,'#d8a058')); }
  for(let k=0;k<4;k++){ const qx=x+20+hsh(k*7)*(w-60), qy=40+hsh(k*3)*180; poly(g,[[qx,qy],[qx+14,qy-6],[qx+22,qy+8],[qx+6,qy+14]],'#0e0a1c'); line(g,qx+22,qy+8,qx+30,qy+20,'#c8d0f0'); }
  R(g,x+4,HB-40,w-8,40,'#1a1424'); for(let i=x+14;i<x+w-10;i+=36){ R(g,i,HB-40,8,40,'#3a3448'); R(g,i,HB-40,2,40,'#5a5468'); }
  R(g,x,HB-44,w,4,'#4a4458'); R(g,x,HB-44,w,1,'#7a7488'); R(g,x+w,top,2,HB-top,'#0e0a18'); tag(g,x+30,HB-34,77); }
function telhado(g,x,top,w){ const t=TERRA; poly(g,[[x+8,top+3],[x+34,top-20],[x+w-34,top-20],[x+w-8,top+3]],t[4]); poly(g,[[x+10,top+2],[x+35,top-18],[x+w-35,top-18],[x+w-10,top+2]],t[2]);
  for(let yy=top-16;yy<top;yy+=4) R(g,x+12,yy,w-24,1,t[3]); R(g,x+35,top-18,w-70,2,t[1]); }
function ellClear(g,cx,cy,rx,ry){ const RY=Math.max(1,Math.round(ry)); for(let dy=-RY;dy<=RY;dy++){ const hw=Math.round(rx*Math.sqrt(Math.max(0,1-(dy/(RY+.5))**2))); if(hw>0) g.clearRect(Math.round(cx-hw),Math.round(cy+dy),hw*2,1); } }
function concreto(g,x,y,w,h,c,s){ // concreto aparente com fôrma de tábua e manchas de umidade
  R(g,x,y,w,h,c[2]); for(let yy=y+3;yy<y+h;yy+=5){ R(g,x,yy,w,1,mix(c[2],c[3],.5)); for(let xx=x+Math.floor(hsh(yy+s)*90);xx<x+w;xx+=70+Math.floor(hsh(xx*.3+yy)*80)) R(g,xx,yy-4,1,4,c[3]); }
  for(let i=0;i<Math.max(2,w/70);i++){ const bx=x+hsh(s+i*3.1)*(w-30), bw=16+hsh(s*2+i)*50; R(g,bx,y,bw,h*(.3+hsh(i+s)*.6),hsh(i*7+s)>.5?c[3]:mix(c[2],c[1],.5)); }
  for(let i=0;i<w/40;i++) streak(g,x+hsh(s*5+i)*w,y+1,6+hsh(i*9+s)*Math.min(30,h*.6),2,c[4]); }
function caisSertao(g,x,w){ // Cais do Sertão: armazém-museu, marquise de concreto aparente com o grande vão oval e a praça coberta embaixo
  const c=rmp('#a69a88'), wl=rmp('#e4dccb'), my=92, fh=30, sb0=my+fh, sh0=58, sb=sb0+sh0, mx0=x+400, mx1=x+w+110, ox=x+1060, orx=236, ory=24, ocy=sb0+30;
  // fundo da praça: armazém vizinho baixo (chapa) à esquerda e o mar aberto à direita, por baixo da marquise
  const bw0=x+600, bw1=x+1300, by=206; R(g,bw0,by,bw1-bw0,HB-by,'#6c6e7c'); for(let xx=bw0;xx<bw1;xx+=6) R(g,xx,by,2,HB-by,'#5a5c6a'); R(g,bw0,by,bw1-bw0,3,'#9a9caa');
  textSh(g,'SERTAO . CULTURA . LAZER',bw0+60,by+18,2,'#d8d2c0','#3a3a48');
  for(let xx=bw1;xx<mx1-20;xx+=14){ R(g,xx,HB-30,2,22,IRON[3]); } R(g,bw1,HB-30,mx1-20-bw1,2,IRON[2]); R(g,bw1,HB-20,mx1-20-bw1,1,IRON[3]);
  // armazém-museu: bloco branco com pilares escuros e térreo de vidro
  const h=152, y=HB-h; R(g,x,y,620,h,wl[2]); shade(g,x,y,200,h,'#fff0d0',.06); for(let i=0;i<8;i++) blob(g,x+hsh(i*3+x)*560,y+10+hsh(i*5)*(h-60),46,18,hsh(i*7)>.5?wl[1]:wl[3]);
  for(let px=x+10;px<x+620;px+=62){ R(g,px,y,14,h,'#3a3c4c'); R(g,px,y,3,h,'#5a5c6e'); R(g,px+12,y,2,h,'#22222e'); }
  for(let px=x+24;px<x+600;px+=62){ R(g,px,HB-70,48,58,'#1a1e34'); R(g,px+2,HB-68,44,54,GLASS[2]); R(g,px+2,HB-68,10,54,GLASS[1]); R(g,px+23,HB-68,2,54,'#3a3c4c'); if(hsh(px)>.6){ const X=px; emitW(g,g=>{ R(g,X+2,HB-68,44,54,'#c88a4c'); R(g,X+4,HB-66,40,20,'#f0b866'); R(g,X+23,HB-68,2,54,'#5a2c1c'); }); pushWin(px+2,HB-68,44,54); } }
  R(g,x,y,620,4,wl[0]); R(g,x,HB-12,620,12,wl[3]); limo(g,x,HB-12,620,wl,x); tag(g,x+120,HB-110,x); poster(g,x+470,HB-100,x);
  // praça coberta: sombra da marquise, pilares de concreto, banco de tábua e o canteiro redondo com a árvore sob o vão
  shade(g,x+620,sb,mx1-x-620,HB-sb,'#0a1234',.42); shade(g,x+620,sb,mx1-x-620,26,'#0a1234',.3);
  for(const [px,pw] of [[x+620,90],[x+1440,96]]){ concreto(g,px,sb,pw,HB-sb,c,px); R(g,px,sb,pw,6,c[4]); R(g,px+pw-6,sb,6,HB-sb,c[4]); R(g,px,sb,3,HB-sb,c[1]); shade(g,px,sb,pw,HB-sb,'#0a1234',.18); }
  shade(g,ox-orx*.75,sb,orx*1.5,HB-sb,'#e8ecff',.06); poly(g,[[ox-orx*.8,ocy+ory],[ox+orx*.8,ocy+ory],[ox+orx*.55,HB],[ox-orx*.55,HB]],'rgba(200,214,255,.07)'); // facho de luz pelo vão
  const pt=rmp('#8a6844'), pw2=220, ph=36, pyT=HB-ph; ell(g,ox,HB,pw2/2+10,7,'rgba(6,10,30,.5)');
  { const lf=[rmp('#2e7a4a'),rmp('#3e8a4a'),rmp('#4a9a54')]; R(g,ox-4,pyT-60,8,60,'#5a4030'); for(let k=0;k<26;k++){ const a=hsh(k*3.3)*Math.PI*2, r=hsh(k*5.1)*70; const L=lf[k%3]; blob(g,ox+Math.cos(a)*r*1.3-16,pyT-90+Math.sin(a)*r*.45-10,32,22,L[k%2?3:2]); } for(let k=0;k<14;k++){ const a=hsh(k*7.7)*Math.PI*2, r=hsh(k*2.9)*60; blob(g,ox+Math.cos(a)*r*1.2-9,pyT-104+Math.sin(a)*r*.4,18,10,lf[2][1]); } }
  R(g,ox-pw2/2,pyT,pw2,ph,pt[2]); for(let xx=ox-pw2/2;xx<ox+pw2/2;xx+=8){ const u=(xx-ox)/(pw2/2); R(g,xx,pyT,7,ph,u<-.5?pt[1]:u>.5?pt[4]:pt[2]); R(g,xx+7,pyT,1,ph,pt[4]); } ell(g,ox,pyT,pw2/2,6,pt[1]); ell(g,ox,pyT,pw2/2-8,4,'#3a2a1c');
  R(g,ox-pw2/2-12,HB-12,pw2+24,4,pt[1]); R(g,ox-pw2/2-12,HB-8,pw2+24,3,pt[4]);
  // escultura colorida (galo) na praça
  { const gx=x+800, gy=HB-6, cs=['#e83a3a','#ffd23f','#3a8ae8','#4ac860','#ff8a3a']; R(g,gx-22,gy-6,44,6,'#e8b030'); R(g,gx-3,gy-30,6,24,'#e8b030'); ell(g,gx,gy-50,22,18,cs[0]); ell(g,gx-6,gy-54,10,8,cs[1]); ell(g,gx+6,gy-44,8,6,cs[2]); ell(g,gx+18,gy-74,8,9,cs[0]); R(g,gx+24,gy-76,7,3,'#ffd23f'); R(g,gx+14,gy-86,6,6,'#e83a3a'); for(let k=0;k<5;k++) line(g,gx-18,gy-52,gx-34-k*3,gy-82+k*6,cs[k],3); }
  // a laje: testeira de concreto aparente, intradorso em perspectiva, vão oval vazado (céu atravessa) com a parede curva aparecendo
  concreto(g,mx0,my,mx1-mx0,fh,c,x+7); R(g,mx0,my,mx1-mx0,3,c[0]); R(g,mx0,my+3,mx1-mx0,1,c[1]); R(g,mx0,my+fh-3,mx1-mx0,3,c[4]);
  for(let i=0;i<sh0;i++){ const d=i/sh0; R(g,mx0+Math.round(d*30),sb0+i,mx1-mx0-Math.round(d*30),1,mix(c[3],c[5],.25+d*.45)); }
  for(let yy=sb0+4;yy<sb;yy+=6) R(g,mx0+30,yy,mx1-mx0-40,1,mix(c[4],c[5],.35));
  ell(g,ox,ocy,orx+6,ory+3,c[5]); ell(g,ox,ocy,orx,ory,c[2]); ell(g,ox,ocy+2,orx-4,ory-2,c[1]); for(let k=-orx;k<orx;k+=26) R(g,ox+k,ocy+ory-8,1,6,c[3]); ellClear(g,ox,ocy-7,orx-3,ory-2);
  { const lf=rmp('#3e8a4a'); for(let k=0;k<9;k++){ const fx=ox-70+k*17+hsh(k*3.7)*8, fy=ocy-6+hsh(k*5.3)*8; blob(g,fx-12,fy,24,ory-2,k%2?lf[3]:lf[2]); blob(g,fx-7,fy-2,12,6,lf[1]); } } // a copa atravessa o vão
  R(g,mx0,sb-2,mx1-mx0,2,c[5]); R(g,mx1-8,my,8,fh,c[4]); R(g,mx0,my,4,fh+sh0,c[1]);
  for(let xx=mx0+60;xx<mx1-40;xx+=150){ if(Math.abs(xx-ox)<orx+20) continue; const X=xx; emitW(g,g=>{ R(g,X,sb-6,16,3,'#ffe0a0'); R(g,X+4,sb-5,8,1,'#fff6d8'); }); glow(g,xx+8,sb+30,46,'#ffb860',.05,4,30); }
  textSh(g,'CAIS DO SERTAO',mx0+120,my+8,2,'#f2e6c8','#2a2430'); text(g,'MUSEU',mx0+120,my+24-2,1,'#5a5248');
  R(g,mx1,my,2,fh+sh0,'#1a1028'); }
function centroArtesanato(g,x,w){ // Centro de Artesanato: galpão branco de empena, fachada de vidro e letras coloridas
  const c=rmp('#ecebe6'), h=168, y=HB-h, cx=x+w/2;
  poly(g,[[x-8,y+32],[cx,y-30],[x+w+8,y+32]],c[4]); poly(g,[[x-2,y+30],[cx,y-24],[x+w+2,y+30]],c[2]); poly(g,[[cx,y-24],[x+w+2,y+30],[cx,y+30]],c[3]); line(g,x-2,y+30,cx,y-24,c[0],2);
  R(g,x,y+30,w,h-30,c[2]); shade(g,x,y,w*.3,h,'#fff6e0',.07); R(g,x,y+30,w,3,c[4]);
  const gx0=cx-w*.18, gw=w*.46; R(g,gx0-3,y+48,gw+6,h-58,c[4]); R(g,gx0,y+50,gw,h-62,'#1a1430');
  for(let xx=gx0+2;xx<gx0+gw-4;xx+=24) R(g,xx,y+52,22,h-66,GLASS[2]); for(let yy=y+52;yy<HB-12;yy+=28) R(g,gx0,yy,gw,2,c[3]);
  emitW(g,g=>{ for(let xx=gx0+2;xx<gx0+gw-4;xx+=24) if(hsh(xx)>.45) R(g,xx,y+82,22,h-96,'#d88a48'); });
  const cols=['#e83a5a','#3a8ae8','#f2c43a','#4ac860','#e8803a','#c04ae8']; text(g,'ARTESANATO DE',x+14,y+44,1,'#3a3040');
  ['PER','NAM','BUCO'].forEach((wd,j)=>{ let lx=x+14; for(let i=0;i<wd.length;i++){ textSh(g,wd[i],lx,y+58+j*26,3,cols[(i+j*3)%cols.length],'#2a2030'); lx+=18; } });
  R(g,x,HB-12,w,12,c[3]); R(g,x,HB-12,w,2,c[1]); for(let i=0;i<6;i++) streak(g,x+10+hsh(i*5.5)*(w-20),y+34,10+hsh(i)*20,3,c[3]); tag(g,x+w-130,HB-56,x*2); limo(g,x,HB-12,w,c,x);
  R(g,x+w,y,2,h,'#1a1028'); }
function colunaB(g,cx,yb,s,v){ // coluna cerâmica do Parque das Esculturas
  const c=rmp(pick(['#9a5a3a','#b07048','#8a6a52','#c8b490','#7a5040'],v)), w=Math.max(3,Math.round(14*s)), h=Math.round((120+v*90)*s), y=yb-h, b=Math.max(1,Math.round(6*s));
  R(g,cx-w*.8,yb-b,w*1.6,b,c[4]); R(g,cx-w/2-1,y,w+2,h-b,c[5]); R(g,cx-w/2,y,w,h-b,c[2]); R(g,cx-w/2,y,Math.max(1,w*.3),h-b,c[1]); R(g,cx+w*.2,y,Math.max(1,w*.3),h-b,c[4]);
  if(s>.4) for(let yy=y+10*s;yy<yb-10*s;yy+=18*s) R(g,cx-w/2,yy,w,Math.max(1,2*s),c[4]);
  R(g,cx-w*.75,y-4*s,w*1.5,Math.max(1,5*s),c[3]); R(g,cx-w*.75,y-4*s,w*1.5,Math.max(1,s),c[1]);
  if(v>.5){ ell(g,cx,y-10*s,w*.6,Math.max(1,7*s),c[3]); ell(g,cx-w*.15,y-12*s,w*.25,Math.max(1,3*s),c[1]); } }
function bola(g,x,yb){ const c=rmp('#cac4bc'); ell(g,x,yb,15,4,'rgba(10,6,20,.5)'); ell(g,x,yb-13,14,14,c[5]); ell(g,x,yb-13,13,13,c[2]); ell(g,x-4,yb-17,7,7,c[1]); ell(g,x-6,yb-19,3,3,c[0]); ell(g,x+5,yb-9,6,5,c[3]); R(g,x-10,yb-2,20,3,c[4]); }
function busto(g,x,yb){ const p=rmp('#9a9488'), br=rmp('#5e6a52'); ell(g,x,yb,30,5,'rgba(10,6,20,.5)'); R(g,x-22,yb-10,44,10,p[4]); R(g,x-20,yb-10,40,8,p[2]); R(g,x-14,yb-70,28,60,p[5]); R(g,x-13,yb-70,26,60,p[2]); R(g,x-13,yb-70,7,60,p[1]); R(g,x+7,yb-70,6,60,p[3]); R(g,x-16,yb-74,32,5,p[1]);
  R(g,x-8,yb-50,16,12,'#3a3020'); R(g,x-6,yb-48,12,8,'#6a5a2a'); ell(g,x,yb-82,14,9,br[5]); ell(g,x,yb-82,13,8,br[2]); ell(g,x,yb-98,8,10,br[5]); ell(g,x,yb-98,7,9,br[2]); ell(g,x-2,yb-101,3,4,br[1]); streak(g,x-6,yb-86,10,2,'#4a7a62'); }
function canoa(g,x,y,col){ const c=rmp(col||'#e8e4d8'); poly(g,[[x-50,y-10],[x+50,y-10],[x+42,y],[x-44,y]],c[5]); poly(g,[[x-48,y-10],[x+48,y-10],[x+41,y-2],[x-43,y-2]],c[2]); R(g,x-48,y-10,96,2,c[0]); R(g,x-40,y-6,80,2,'#d8b83a'); for(let k=-30;k<=30;k+=20) R(g,x+k,y-14,3,5,c[3]); R(g,x-56,y+1,112,1,'#8a90d0'); R(g,x-40,y+4,80,1,'#4a52a0'); }
/* ---------- esculturas do Parque (Brennand) com detalhe ---------- */
function torreCristal(g,cx,base,s){ // Torre de Cristal (Brennand): coluna verde-escura com trama clara, guardas e botão no topo, sobre pedestal de tijolo
  const dk=rmp('#2c5e5a'), cr=rmp('#e8e0c8'), br=rmp('#8a5a40'), u1=Math.max(1,Math.round(s));
  const pw=Math.round(46*s), ph=Math.round(40*s), cw=Math.max(4,Math.round(22*s)), th=Math.round(214*s);
  R(g,cx-pw/2-8*s,base-6*s,pw+16*s,6*s,br[4]); R(g,cx-pw/2-8*s,base-6*s,pw+16*s,u1,br[1]);
  const py=base-6*s-ph; R(g,cx-pw/2-1,py-1,pw+2,ph+1,br[5]); R(g,cx-pw/2,py,pw,ph,br[2]); R(g,cx-pw/2,py,pw*.3,ph,br[1]); R(g,cx+pw*.2,py,pw*.3,ph,br[4]);
  if(s>.5) for(let yy=py+4,r=0;yy<py+ph-2;yy+=Math.round(5*s),r++) for(let xx=cx-pw/2+(r%2)*5*s;xx<cx+pw/2-4;xx+=10*s) R(g,xx,yy,1,Math.round(4*s),br[4]);
  R(g,cx-pw/2-3*s,py-4*s,pw+6*s,5*s,cr[3]); R(g,cx-pw/2-3*s,py-4*s,pw+6*s,u1,cr[1]);
  const y=py-4*s-th; R(g,cx-cw/2-1,y,cw+2,th,dk[5]); R(g,cx-cw/2,y,cw,th,dk[2]); R(g,cx-cw/2,y,Math.max(1,cw*.28),th,dk[1]); R(g,cx+cw*.2,y,cw*.3,th,dk[4]);
  const lw=Math.max(1,Math.round(2*s)), per=Math.max(8,22*s);
  for(let yy=y+2;yy<y+th;yy++){ const u=(yy-y)/per; for(const ph0 of [0,Math.PI]){ const xx=cx+Math.sin(u*Math.PI+ph0)*cw*.34; R(g,xx-lw/2,yy,lw,1,xx<cx?cr[1]:cr[3]); } }
  if(s>.35) for(let k=0;k<th/per;k++) ell(g,cx,y+k*per+per/2,cw*.16,3.5*s,dk[5]);
  for(const f of [.2,.48,.76]){ const yy=y+th*f; R(g,cx-cw*.9,yy,cw*1.8,Math.max(2,3*s),cr[3]); R(g,cx-cw*.9,yy,cw*1.8,u1,cr[0]);
    for(const sx of [-1,1]) poly(g,[[cx+sx*cw*.9,yy-1],[cx+sx*cw*1.45,yy+1.5*s],[cx+sx*cw*.9,yy+3*s]],cr[2]); }
  R(g,cx-cw*.7,y-4*s,cw*1.4,5*s,cr[3]); R(g,cx-cw*.7,y-4*s,cw*1.4,u1,cr[1]);
  const brx=cw*.62, bry=cw*1.3, by=y-4*s-bry; ell(g,cx,by,brx+1,bry+1,dk[5]); ell(g,cx,by,brx,bry,cr[2]); ell(g,cx-brx*.3,by-bry*.2,brx*.4,bry*.6,cr[1]); ell(g,cx+brx*.4,by+bry*.2,brx*.3,bry*.5,cr[3]);
  if(s>.3) for(let r=-3;r<=3;r++) for(let q=-2;q<=2;q++){ const yy=by+r*bry*.28, xx=cx+q*brx*.36+(r%2?brx*.18:0); if(Math.abs(xx-cx)/brx+Math.abs(yy-by)/bry<.9) R(g,xx,yy,Math.max(1,s*2),Math.max(1,s*2),dk[3]); }
  R(g,cx-u1/2,by-bry-10*s,Math.max(2,2*s),10*s,cr[3]); glow(g,cx,by,cw*3,'#6ad0c0',.03,3);
  for(let i=0;i<4;i++) streak(g,cx-cw/2+hsh(cx+i)*cw,y+30*s+i*50*s,10*s,lw,dk[4]); }
function ovo(g,cx,yb,s,col){ const c=rmp(col), rx=Math.round(18*s), ry=Math.round(26*s), cy=yb-ry-12*s;
  R(g,cx-rx*.9,yb-12*s,rx*1.8,12*s,'#5e5868'); R(g,cx-rx*.9,yb-12*s,rx*1.8,2*s,'#8a8494'); R(g,cx+rx*.4,yb-12*s,rx*.5,12*s,'#4a4456');
  for(let dy=-ry;dy<=ry;dy++){ const t=dy/ry, hw=Math.round(rx*Math.sqrt(1-t*t)*(t<0?.82+.18*(1+t):1)); R(g,cx-hw-1,cy+dy,hw*2+2,1,c[5]); R(g,cx-hw,cy+dy,hw*2,1,c[2]); R(g,cx-hw,cy+dy,Math.round(hw*.55),1,c[1]); R(g,cx-hw+2,cy+dy,Math.round(hw*.2),1,c[0]); R(g,cx+Math.round(hw*.35),cy+dy,Math.round(hw*.65),1,c[3]); R(g,cx+Math.round(hw*.75),cy+dy,Math.round(hw*.25),1,c[4]); }
  // faixa ornamental e craquelado
  const by=cy+ry*.15; for(let dx=-rx+2;dx<rx-2;dx+=1){ const t=dx/rx, yy=by+Math.round((1-t*t)*3*s); R(g,cx+dx,yy,1,Math.max(2,3*s),dx%Math.max(3,Math.round(5*s))<2?'#2a3a6a':c[4]); }
  for(let i=0;i<6;i++){ let x=cx-rx*.6+hsh(cx+i)*rx*1.2, y=cy-ry*.6+hsh(cx*3+i)*ry*1.1; for(let j=0;j<8*s;j++){ R(g,x,y,1,1,c[4]); x+=hsh(i+j)>.5?1:-1; y+=1; } }
  ell(g,cx-rx*.4,cy-ry*.45,rx*.18,ry*.12,'#fff8e8'); }
function serpente(g,cx,yb,s){ const c=rmp('#4e7a5e'), sc=rmp('#c8a03a'); R(g,cx-12*s,yb-16*s,24*s,16*s,'#5e5868'); R(g,cx-12*s,yb-16*s,24*s,2*s,'#8a8494');
  for(let k=0;k<26;k++){ const yy=yb-18*s-k*7*s, xx=cx+Math.sin(k*.6)*14*s; ell(g,xx,yy,10*s,6.5*s,c[5]); ell(g,xx,yy,9*s,5.5*s,c[2]); ell(g,xx-3*s,yy-2*s,4*s,2.5*s,c[1]); ell(g,xx+4*s,yy+1*s,4*s,2.5*s,c[4]); if(k%2) R(g,xx-2*s,yy-1*s,4*s,2*s,sc[2]); }
  const hy=yb-18*s-26*7*s, hx=cx+Math.sin(26*.6)*14*s; ell(g,hx+8*s,hy,16*s,10*s,c[5]); ell(g,hx+8*s,hy,15*s,9*s,c[2]); ell(g,hx+4*s,hy-3*s,8*s,4*s,c[1]); poly(g,[[hx+18*s,hy+2*s],[hx+28*s,hy+4*s],[hx+18*s,hy+6*s]],'#2a1018');
  emitW(g,g=>{ R(g,hx+12*s,hy-4*s,3*s,3*s,'#ffd23f'); }); glow(g,hx+13*s,hy-3*s,16*s,'#ffd23f',.05,3); }
function totem(g,cx,yb,s){ const cols=['#b0603a','#ddd0b2','#5c6e5c','#c88a4a','#8a5ab0']; R(g,cx-22*s,yb-22*s,44*s,22*s,'#5e5868'); R(g,cx-22*s,yb-22*s,44*s,2*s,'#8a8494');
  for(let k=0;k<5;k++){ const c=rmp(cols[k%5]), yy=yb-22*s-(k+1)*27*s, w0=(32-k*1.5)*s;
    R(g,cx-w0/2-1,yy-1,w0+2,27*s+1,c[5]); R(g,cx-w0/2,yy,w0,26*s,c[2]); R(g,cx-w0/2,yy,w0*.3,26*s,c[1]); R(g,cx-w0/2,yy,Math.max(1,s),26*s,c[0]); R(g,cx+w0*.2,yy,w0*.3,26*s,c[4]);
    R(g,cx-w0/2,yy,w0,2*s,c[1]); R(g,cx-w0/2,yy+24*s,w0,2*s,c[5]);
    // rosto entalhado
    R(g,cx-10*s,yy+6*s,7*s,3*s,c[4]); R(g,cx+3*s,yy+6*s,7*s,3*s,c[4]); R(g,cx-9*s,yy+9*s,5*s,3*s,c[5]); R(g,cx+4*s,yy+9*s,5*s,3*s,c[5]); if(k===2) emit(g,g=>{ R(g,cx-8*s,yy+10*s,2*s,2*s,'#ff5a3a'); R(g,cx+5*s,yy+10*s,2*s,2*s,'#ff5a3a'); });
    poly(g,[[cx-1*s,yy+10*s],[cx+2*s,yy+16*s],[cx-3*s,yy+16*s]],c[3]); R(g,cx-6*s,yy+19*s,12*s,2*s,c[5]); R(g,cx-6*s,yy+21*s,12*s,1,c[1]); } }
function passaro(g,cx,yb,s){ const c=rmp('#ddd0b2'); R(g,cx-6*s,yb-90*s,12*s,90*s,'#6a6476'); R(g,cx-6*s,yb-90*s,4*s,90*s,'#8a8494'); const y=yb-90*s;
  poly(g,[[cx-30*s,y-4*s],[cx-6*s,y-30*s],[cx+16*s,y-26*s],[cx+34*s,y-34*s],[cx+26*s,y-18*s],[cx+10*s,y],[cx-20*s,y+2*s]],c[5]); poly(g,[[cx-28*s,y-5*s],[cx-6*s,y-28*s],[cx+15*s,y-25*s],[cx+31*s,y-32*s],[cx+24*s,y-18*s],[cx+9*s,y-1*s],[cx-18*s,y]],c[2]);
  poly(g,[[cx-6*s,y-28*s],[cx+15*s,y-25*s],[cx+4*s,y-12*s]],c[1]); R(g,cx+22*s,y-30*s,3*s,3*s,'#1a1020'); }

/* ---------- primeiro plano: silhuetas escuras ---------- */
const SIL='#150d22', SILM='#22183a', RIM='#5a4a8e';
function fgCarcaca(g,w){ const y=HH-96; poly(g,[[0,HH],[0,y+20],[40,y],[w-60,y+6],[w,y+40],[w,HH]],SIL); R(g,40,y,w-100,2,RIM); poly(g,[[60,y+8],[140,y-36],[w-120,y-36],[w-80,y+8]],SIL); line(g,140,y-36,w-120,y-36,RIM,2);
  ell(g,90,HH-6,40,40,SILM); ell(g,90,HH-6,26,26,SIL); R(g,w-40,y+26,16,8,'#3a2030'); }
function fgPlaca(g,w,txt){ R(g,w/2-3,60,6,HH-60,SIL); R(g,w/2-3,60,1,HH-60,RIM); R(g,w/2-50,70,100,28,'#1a3a6a'); R(g,w/2-50,70,100,2,'#4a6aa0'); R(g,w/2-48,72,96,24,'#22488a'); text(g,txt,w/2-tw(txt,1)/2,80,1,'#e8e8f0'); R(g,w/2-6,HH-20,12,20,SIL); }
/* ---------- fundo distante mais rico ---------- */
function farStrip(mode,lvl){ const k='f'+lvl+mode; if(stripCache[k]) return stripCache[k]; const P=SKYP[mode], W0=lvl===1?2880:2400, [c,g]=mk(W0,HB);
  const col=lvl===1?P.f1:P.f2, wc=lvl===1?P.f1w:P.f2w, cc=rmp(col), base=lvl===1?246:256;
  if(lvl===1){ for(let x=0;x<W0;){ const v=hsh(x*.013+1), w=28+Math.floor(hsh(x*.07)*56), h=v>.85?180+hsh(x)*40:50+Math.floor(hsh(x*.031)*120); if(v>.25){
      const side=Math.round(w*.22); R(g,x,base-h,w,h,cc[2]); R(g,x+w-side,base-h,side,h,cc[3]); R(g,x,base-h,2,h,cc[1]); R(g,x,base-h,w-side,2,cc[1]);
      for(let yy=base-h+5;yy<base;yy+=5) R(g,x+2,yy,w-side-2,1,mix(cc[2],cc[3],.4));
      const pat=hsh(x*.9); for(let yy=base-h+6;yy<base-4;yy+=5) for(let xx=x+4;xx<x+w-side-2;xx+=4){ const lv=hsh(xx*1.7+yy*.31); const on=pat>.6?(lv>.8&&((yy/5)%3<1)):lv>.9; if(on){ g.fillStyle=lv>.97?'#ffffff':mix(wc,col,.25); g.fillRect(xx,yy,2,2); } }
      if(v>.6){ R(g,x+4,base-h-8,w*.3,8,cc[3]); R(g,x+w*.5,base-h-14,6,14,cc[3]); } if(v>.75&&v<.85){ R(g,x+w*.15,base-h-10,w*.7,10,cc[2]); R(g,x+w*.3,base-h-18,w*.4,8,cc[2]); }
      if(h>140){ R(g,x+w/2,base-h-30,2,30,cc[3]); R(g,x+w/2-6,base-h-20,14,1,cc[3]); R(g,x+w/2,base-h-32,2,2,'#ff3a3a'); } } x+=w+Math.floor(hsh(x*.17)*16); } }
  else { for(let x=0;x<W0;){ const v=hsh(x*.021+3), w=40+Math.floor(hsh(x*.05)*70), h=30+Math.floor(hsh(x*.09)*50);
      R(g,x,base-h,w,h,cc[2]); R(g,x,base-h,w,2,cc[1]); R(g,x+w-5,base-h,5,h,cc[3]);
      if(v<.5){ poly(g,[[x-3,base-h],[x+w/2,base-h-16],[x+w+3,base-h]],cc[3]); line(g,x-3,base-h,x+w/2,base-h-16,cc[1]); for(let r=1;r<4;r++) line(g,x+r*w/8,base-h-r*4,x+w-r*w/8,base-h-r*4,cc[4]); }
      for(let yy=base-h+8;yy<base-6;yy+=10) for(let xx=x+6;xx<x+w-8;xx+=10){ R(g,xx,yy,4,5,cc[4]); if(hsh(xx*.7+yy*1.3)>.78){ g.fillStyle=wc; g.fillRect(xx,yy,4,5); g.fillStyle=mix(wc,'#ffffff',.4); g.fillRect(xx,yy,2,2); } }
      if(v>.9){ for(const tx of [x+6,x+w-20]){ R(g,tx,base-h-74,14,74,cc[2]); R(g,tx+10,base-h-74,4,74,cc[3]); R(g,tx,base-h-74,2,74,cc[1]); poly(g,[[tx-2,base-h-74],[tx+7,base-h-96],[tx+16,base-h-74]],cc[3]); archF(g,tx+4,base-h-64,6,10,'#0e0a1e'); R(g,tx+6,base-h-104,2,8,cc[3]); R(g,tx+3,base-h-101,8,2,cc[3]); } }
      else if(v>.84){ const dx=x+w/2; for(let dy=0;dy<22;dy++){ const hw=Math.round(Math.sqrt(1-(dy/22)**2)*20); R(g,dx-hw,base-h-dy,hw*2,1,dy<2?cc[1]:cc[2]); R(g,dx+hw*.4,base-h-dy,hw*.6,1,cc[3]); } R(g,dx-1,base-h-34,2,12,cc[3]); }
      else if(v>.76){ R(g,x+w/2-12,base-h-30,24,22,cc[3]); R(g,x+w/2-12,base-h-30,24,2,cc[1]); R(g,x+w/2-9,base-h-8,3,8,cc[3]); R(g,x+w/2+6,base-h-8,3,8,cc[3]); }
      else if(v<.14){ R(g,x+w/2,base-h-64,4,64,cc[3]); for(let j=0;j<8;j++){ const a=-2.95+j*.42; line(g,x+w/2+2,base-h-64,x+w/2+2+Math.cos(a)*28,base-h-64+Math.sin(a)*14+12,cc[3],2); } }
      else if(v<.22){ R(g,x+w*.3,base-h-28,2,28,cc[3]); R(g,x+w*.3-8,base-h-22,18,1,cc[3]); R(g,x+w*.3-5,base-h-16,12,1,cc[3]); }
      x+=w; } }
  return stripCache[k]=c; }
/* ---------- passe 3: chão como superfície única ---------- */
function luzRua(g,a,b,y0,X0,step,phase){ // escurece entre os postes (sombra fria) e na borda da frente
  for(let x=Math.floor(a/6)*6;x<b;x+=6){ let d=1; if(step){ const u=(((x-X0-phase)%step)+step)%step; d=Math.min(u,step-u)/(step/2); } const al=.30*Math.pow(d,1.4);
    if(al>.02) shade(g,x,y0,6,HH-y0,'#06123c',al); }
  for(let i=0;i<8;i++) shade(g,a,HH-90+i*11,b-a,11,'#040c26',.05+i*.035);
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
    if(style==='eclet'||style==='eclet2'){ const o={seed:s,col:pick(['#eadcb0','#e8c050','#f0e6d0','#e09a8a','#e8a8c0','#9ac8b0','#e6c8a0','#a8c0e0','#d8a060'],hsh(s*7)),fl:style==='eclet2'?2:(v>.5?3:2),par:pick(['balaustre','reta','curva'],hsh(s*3)),dome:v<.5&&hsh(s*5)>.35?pick(['l','r','c'],hsh(s*9)):null,domeC:pick(['#4f8a7a','#5a5a78','#8a5a4a'],hsh(s*11))}; add(xx,xx+w,1,g=>ecletico(g,xx,w,o)); }
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
    vol.push({x:xx,w,top:style==='eclet2'?HB-96-74-40:style==='eclet'?HB-96-((v>.5?3:2)-1)*74-40:style==='bj'?(v>.45?HB-96-3*62-22:HB-96-2*78-28):HB-96-((v>.55?3:2)-1)*78-30,d:hsh(s*61)>.5?1:0,col:style==='eclet'?null:null,s}); x+=w; i++; }
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

function compose(A){ const X0=A.x0*RS, X1=A.x1*RS, L=X1-X0, s=A.n*1000;
  switch(A.id){
  case 'ponte':
    chaoExtras(X0,X1,s+3,{slabs:false});
    acidentes(X0,X1,s,['racha','poca','sangue','buraco']); borda(X0,X1,s+7,['capotado','barricada','entulho']);
    add(X0,X1,0,(g,lo,hi)=>{ const a=Math.max(lo,X0), b=Math.min(hi,X1); seaBand(g,a,b,HZ,HB,true); torresFundo(g,a,b,HZ+2,s); farBank(g,a,b,HZ+2); });
    add(X0,X1,1,(g,lo,hi)=>parapeitoPonte(g,Math.max(lo,X0),Math.min(hi,X1)));
    for(let x=X0+96;x<X1;x+=576){ const xx=x; add(xx-50,xx+50,2,g=>{ posteNassau(g,xx,HB+2,150,true); }); add(xx-260,xx+260,4,g=>luzChao(g,xx,HB+30,250,'#ffb860',.035)); }
    add(X0,X1,4,(g,lo,hi)=>{ const a=Math.max(lo,X0), b=Math.min(hi,X1), y=ST+6; R(g,a,y,b-a,20,'#8a3a3a'); R(g,a,y,b-a,1,'#b85a50'); R(g,a,y+20,b-a,3,'#e8e4d8'); for(let x=Math.floor(a/700)*700+300;x<b;x+=700){ const X=x; R(g,X,y+5,30,2,'#e8e4d8'); R(g,X+12,y+2,2,14,'#e8e4d8'); } });
    add(X0+L*.3,X0+L*.3+120,2,g=>{ const x=X0+L*.3; R(g,x,262,120,30,'#4a3a2a'); R(g,x+2,264,116,26,'#8a6a3a'); R(g,x+2,264,116,2,'#c8a05a'); text(g,'PONTE MAURICIO',x+8,268,1,'#f0d890'); text(g,'DE NASSAU',x+28,278,1,'#f0d890'); });
    walkStreet(X0,X1,'cimento','asfalto',s,false,false); add(X0,X1,4,(g,lo,hi)=>luzRua(g,Math.max(lo,X0),Math.min(hi,X1),HB+40,X0,576,96));
    [[.12,'#c8c0b0',{broken:true}],[.82,'#8a3a3a',{}]].forEach(([r,c,o])=>{ const x=X0+L*r; add(x-20,x+320,5,g=>carro(g,x,HB+64,c,o)); });
    add(X0+L*.36,X0+L*.36+580,5,g=>onibus(g,X0+L*.36,HB+66,'#e8a83a','BOA VIAGEM')); add(X0+L*.6,X0+L*.6+340,5,g=>caminhao(g,X0+L*.6,HB+60)); add(X0+L*.58-100,X0+L*.58+60,5,g=>sacos(g,X0+L*.58-100,HB+64,5));
    decals(X0,X1,s,{holes:false}); break;
  case 'alfandega':
    chaoExtras(X0,X1,s+3,{faixa:false,slabs:false});
    acidentes(X0,X1,s,['racha','poca','sangue']); borda(X0,X1,s+7,['barricada','entulho','tenda']);
    casarioRow(X0,X0+700,'casa',s); add(X0+700,X0+1260,1,g=>igrejaMadreDeDeus(g,X0+700)); add(X0+1260,X0+2460,1,g=>pacoAlfandega(g,X0+1260,1200)); casarioRow(X0+2460,X1,'casa',s+50);
    add(X0,X1,3,(g,lo,hi)=>{ const a=Math.max(lo,X0), b=Math.min(hi,X1); fSlabs(g,a,b,'#b4aca6',s,HB,X0); shade(g,a,HB,b-a,6,'#140a24',.45); });
    add(X0,X1,0,(g,lo,hi)=>fundoTelhados(g,Math.max(lo,X0),Math.min(hi,X1),s));
    lampRow(X0,X1,640,true,300); decals(X0,X1,s,{holes:false});
    for(const r of [.08,.47,.62,.93]){ const x=X0+L*r; add(x-130,x+130,5,g=>arvore(g,x,HB+42,x,1)); }
    for(let x=X0+80;x<X1;x+=150){ const xx=x; add(xx-16,xx+16,5,g=>bola(g,xx,HB+30)); }
    add(X0+940,X0+1020,5,g=>banco(g,X0+940,HB+30)); add(X0+2700,X0+2800,5,g=>orelhao(g,X0+2720,HB+26)); add(X0+3300,X0+3640,5,g=>carro(g,X0+3300,HB+66,'#d8d0c0',{broken:true}));
    fiosAdd(X0,X1,s); break;
  case 'feira':
    chaoExtras(X0,X1,s+3,{});
    acidentes(X0,X1,s,['buraco','poca','sangue','racha']); borda(X0,X1,s+7,['lixo','capotado','entulho']);
    casarioRow(X0,X1,'bj',s); walkStreet(X0,X1,'portuguesa','#8e8698',s);
    for(let k=0;k<12;k++){ const x=X0+160+k*460+hsh(k)*60; if(k===5) continue; const col=pick(['#e84a3a','#3a8ae8','#4ac860','#ffd23f','#ff8ad0','#8a5ad8'],hsh(k*7)); add(x-10,x+170,5,g=>barraca(g,x,HB+58,col,k)); }
    add(X0,X1,2,(g,lo,hi)=>{ bandeirinhas(g,Math.max(lo,X0),Math.min(hi,X1),60,300,40,s); bandeirinhas(g,Math.max(lo,X0)+150,Math.min(hi,X1),100,300,30,s+5); });
    lampRow(X0,X1,700,false,420,'globo'); decals(X0,X1,s,{trilho:true}); fiosAdd(X0,X1,s); break;
  case 'bomjesus':
    chaoExtras(X0,X1,s+3,{});
    acidentes(X0,X1,s,['buraco','poca','racha','sangue']); borda(X0,X1,s+7,['lixo','carro','barricada','entulho']);
    casarioRow(X0,X0+1700,'bj',s); add(X0+1700,X0+1980,1,g=>sinagoga(g,X0+1700)); casarioRow(X0+1980,X0+3900,'bj',s+30); add(X0+3900,X0+4220,1,g=>bonecos(g,X0+3900)); casarioRow(X0+4220,X1,'bj',s+60);
    for(const r of [.04,.24,.52,.86]){ const x=X0+L*r; add(x-130,x+130,5,g=>palmMid(g,x,HB+36,1.25)); }
    walkStreet(X0,X1,'portuguesa','#8e8698',s);
    add(X0+4000,X0+4140,5,g=>{ bonecoGigante(g,X0+4010,HB+40,{body:'#3a6ad0',skin:'#e0a070',hair:'#2a1a12',acc:'#e83a4a',hat:true,stach:true}); bonecoGigante(g,X0+4120,HB+34,{body:'#e8a03a',skin:'#9a5a3a',hair:'#1a1210',acc:'#4ac860',h:200}); });
    for(const r of [.08,.14]){ const x=X0+L*r; add(x-10,x+170,5,g=>barraca(g,x,HB+58,'#3a8ae8',x)); }
    add(X0,X1,2,(g,lo,hi)=>bandeirinhas(g,Math.max(lo,X0),Math.min(X0+1600,hi),70,300,36,s));
    lampRow(X0,X1,700,false,250,'globo'); decals(X0,X1,s,{trilho:true}); fiosAdd(X0,X1,s); break;
  case 'apolo':
    chaoExtras(X0,X1,s+3,{faixa:false});
    acidentes(X0,X1,s,['buraco','racha','poca']); borda(X0,X1,s+7,['entulho','barricada','lixo','capotado']);
    casarioRow(X0,X0+1700,'dark',s); add(X0+1700,X0+2140,1,g=>teatroApolo(g,X0+1700)); casarioRow(X0+2140,X0+3900,'dark',s+30); add(X0+3900,X0+4180,1,g=>andaime(g,X0+3900,280)); casarioRow(X0+4180,X1,'dark',s+60);
    walkStreet(X0,X1,'cimento','#7e7890',s,true);
    for(const r of [.12,.7,.74,.9]){ const x=X0+L*r; add(x-10,x+120,5,g=>entulho(g,x,HB+70,x)); }
    add(X0+L*.45,X0+L*.45+120,5,g=>barricada(g,X0+L*.45,HB+60)); add(X0+4000,X0+4060,5,g=>{ cone(g,X0+4000,HB+50); cone(g,X0+4040,HB+56,true); });
    lampRow(X0,X1,900,false,600); decals(X0,X1,s,{}); fiosAdd(X0,X1,s); break;
  case 'moeda':
    chaoExtras(X0,X1,s+3,{});
    acidentes(X0,X1,s,['poca','buraco','sangue']); borda(X0,X1,s+7,['lixo','capotado','entulho']);
    casarioRow(X0,X0+2600,'bar',s); add(X0+2600,X0+3040,1,g=>grafiteMangue(g,X0+2600)); casarioRow(X0+3040,X1,'bar',s+40);
    add(X0+2600,X0+3040,0,g=>{ for(let k=0;k<3;k++){ const bx=X0+2600+k*150; sobrado(g,bx,150,{seed:s+k*9,col:mix(pick(CASA,k/3),'#5a4a6a',.3),fl:3,par:'reta',dark:true}); } });
    walkStreet(X0,X1,'cimento','#7a7488',s,true);
    for(let x=X0+120;x<X1-100;x+=170){ if(x>X0+2560&&x<X0+3080) continue; const xx=x; add(xx-60,xx+60,5,g=>mesaBar(g,xx,HB+44+hsh(xx)*14,xx)); if(hsh(x*3)>.6) add(xx+50,xx+90,5,g=>engradado(g,xx+50,HB+36,1+Math.floor(hsh(xx)*3))); }
    add(X0,X1,2,(g,lo,hi)=>varalLuz(g,Math.max(lo,X0),Math.min(hi,X1),50,360,34));
    for(let k=0;k<9;k++){ const x=X0+300+k*620, y=ST+40+hsh(k)*120; add(x-80,x+80,4,g=>poca(g,x,y,90+hsh(k*3)*50,k,true)); }
    lampRow(X0,X1,800,false,500); decals(X0,X1,s,{trilho:true}); fiosAdd(X0,X1,s); break;
  case 'arsenal':
    chaoExtras(X0,X1,s+3,{});
    acidentes(X0,X1,s,['buraco','racha','sangue']); borda(X0,X1,s+7,['barricada','capotado','tenda']);
    casarioRow(X0,X0+1100,'eclet',s); casarioRow(X0+1100,X0+1500,'eclet2',s+9); add(X0+1500,X0+1880,1,g=>malakoff(g,X0+1500)); casarioRow(X0+1880,X0+2300,'eclet2',s+21); casarioRow(X0+2300,X1,'eclet',s+30);
    walkStreet(X0,X1,'portuguesa','#948c9c',s);
    add(X0+3400,X0+3740,5,g=>carro(g,X0+3400,HB+70,'#2a3a6a',{police:true,broken:true})); add(X0+3800,X0+3910,5,g=>barricada(g,X0+3800,HB+56));
    for(const r of [.15,.4,.85]){ const x=X0+L*r; add(x,x+80,5,g=>banco(g,x,HB+28)); }
    for(const r of [.06,.2,.47,.6,.78,.95]){ const x=X0+L*r; add(x-130,x+130,5,g=>palmMid(g,x,HB+34,1.3)); }
    add(X0+L*.68-40,X0+L*.68+40,5,g=>busto(g,X0+L*.68,HB+40));
    lampRow(X0,X1,640,true,320); decals(X0,X1,s,{}); fiosAdd(X0,X1,s); break;
  case 'riobranco':
    chaoExtras(X0,X1,s+3,{slabs:false});
    acidentes(X0,X1,s,['buraco','racha','poca']); borda(X0,X1,s+7,['barricada','entulho']);
    casarioRow(X0,X0+2500,'eclet',s); add(X0+2500,X0+2830,1,g=>pacoFrevo(g,X0+2500)); casarioRow(X0+2830,X1,'eclet',s+30);
    walkStreet(X0,X1,'portuguesa','asfalto',s);
    add(X0+3350,X0+3350+580,5,g=>onibus(g,X0+3350,HB+70,'#3a8a5a','RIO BRANCO'));
    [[.06,'#c8c0b0',{}],[.3,'#3a6ab8',{broken:true}],[.7,'#e8c03a',{open:true}],[.88,'#5a8a4a',{blood:true}]].forEach(([r,c,o])=>{ const x=X0+L*r; add(x-20,x+320,5,g=>carro(g,x,HB+66,c,o)); });
    lampRow(X0,X1,640,true,200,'globo'); decals(X0,X1,s,{}); fiosAdd(X0,X1,s); break;
  case 'marco':
    chaoExtras(X0,X1,s+3,{faixa:false,slabs:false,patch:false});
    acidentes(X0,X1,s,['racha','sangue','poca']); borda(X0,X1,s+7,['tenda','barricada','entulho']); {
    const sea=X0+2500;
    add(X0,sea,0,(g,lo,hi)=>fundoTelhados(g,Math.max(lo,X0),Math.min(hi,sea),s));
    casarioRow(X0,X0+300,'eclet',s);
    add(X0+300,X0+580,1,g=>torreVidro(g,X0+300,270));
    add(X0+600,X0+940,1,g=>{ ecletico(g,X0+600,330,{seed:s+11,col:'#e8e6de',fl:2,par:'balaustre',dome:'l',domeC:'#6a9a94',shut:'#3a6a6a'}); });
    add(X0+960,X0+1280,1,g=>{ const c=rmp('#6aa88a'), t=ecletico(g,X0+960,310,{seed:s+23,col:'#6aa88a',fl:2,par:'curva',shut:'#2a4a3a'}); cupula(g,X0+1012,t,62,'#4a4a5c',c); cupula(g,X0+1228,t,62,'#4a4a5c',c); });
    add(X0+1300,X0+1840,1,g=>{ const c=rmp('#eedca0'); telhado(g,X0+1300,HB-96-74-40,530); const t=ecletico(g,X0+1300,530,{seed:s+37,col:'#eedca0',fl:2,par:'balaustre',shut:'#4a5a3a',arcade:true}); cupula(g,X0+1384,t,72,'#b08a50',c); cupula(g,X0+1746,t,72,'#b08a50',c); });
    casarioRow(X0+1840,sea,'eclet',s+60); add(sea-4,sea+60,1,g=>empena(g,sea,40));
    add(sea,X1,0,(g,lo,hi)=>{ const a=Math.max(lo,sea), b=Math.min(hi,X1); seaBand(g,a,b,HZ,HB-14,false);
      R(g,a,HZ+10,b-a,5,'#4a4458'); R(g,a,HZ+10,b-a,1,'#6a6478'); for(let x=Math.floor(a/9)*9;x<b;x+=9) blob(g,x,HZ+7+hsh(x)*3,8,5,'#545068');
      for(let x=Math.floor(a/18)*18;x<b;x+=18) if(hsh(x*.7)>.7) reflexo(g,x,HZ+18,HB-16,'#5a5aa0',6);
      // muralha de pedra do cais com degraus até a água
      R(g,a,HB-22,b-a,24,'#5e5868'); for(let y=HB-22;y<HB;y+=6) for(let x=Math.floor(a/26)*26+((y/6)%2)*13;x<b;x+=26){ R(g,x,y,25,5,hsh(x*.3+y)>.5?'#6e6878':'#645e70'); R(g,x,y,25,1,'#8a8496'); }
      R(g,a,HB-24,b-a,3,'#a8a2b0'); R(g,a,HB-21,b-a,1,'#3a3448');
      for(let x=Math.floor(a/1100)*1100+500;x<b;x+=1100){ for(let k=0;k<5;k++) R(g,x+k*8,HB-22+k*4,60-k*8,4,'#7a7488'); } });
    add(sea,X1,0,(g,lo,hi)=>arrecife(g,Math.max(lo,sea),Math.min(hi,X1),HZ+2)); add(X1-760,X1-460,0,g=>farol(g,X1-600,HZ+4));
    add(X1-2400,X1-1000,0,g=>{ R(g,X1-2380,HZ+5,1360,6,'#3a3650'); for(let k=0;k<18;k++){ const cx=X1-2340+k*72+hsh(k)*20; colunaB(g,cx,HZ+9,.18+hsh(k*3)*.06,hsh(k*7)); } torreCristal(g,X1-1700,HZ+9,.42); ovo(g,X1-1820,HZ+9,.2,'#d8ccb0'); totem(g,X1-1560,HZ+9,.2); ovo(g,X1-2100,HZ+9,.16,'#c8a070'); });
    add(sea+200,sea+1600,0,g=>{ canoa(g,sea+400,HB-30,'#e8e4d8'); canoa(g,sea+1300,HB-36,'#3a6ab8'); });
    add(X0,X1,3,(g,lo,hi)=>{ const a=Math.max(lo,X0), b=Math.min(hi,X1); fSlabs(g,a,b,'#e09a80',s,HB,X0); shade(g,a,HB,Math.min(b,sea)-a,6,'#140a24',.45); });
    add(X0+3280,X0+4220,4,g=>rosaVentos(g,X0+3750,446));
    add(X0+900,X0+1400,5,g=>letreiro(g,X0+920,HB+44)); add(X0+2050,X0+2200,5,g=>estatua(g,X0+2120,HB+40));
    for(let x=sea+150;x<X1;x+=420){ const xx=x; add(xx-20,xx+20,5,g=>cabecoMid(g,xx,HB+8)); }
    for(const [r,k] of [[.05,1],[.16,1.1],[.27,.95],[.33,1.05],[.39,1],[.78,1.1],[.96,.95]]){ const x=X0+L*r; add(x-150,x+150,5,g=>palmMid(g,x,HB+40,k*1.15)); }
    for(const r of [.1,.22,.55,.72,.83]){ const x=X0+L*r; add(x-10,x+80,5,g=>banco(g,x,HB+56)); }
    add(X0+L*.49,X0+L*.49+330,5,g=>carro(g,X0+L*.49,HB+70,'#c83a3a',{broken:true,open:true})); add(X0+L*.92-340,X0+L*.92,5,g=>capotado(g,X0+L*.92-330,HB+70,'#3a6ab8'));
    add(X0+L*.58,X0+L*.58+260,5,g=>{ barricada(g,X0+L*.58,HB+62); sacos(g,X0+L*.58+110,HB+66,4); });
    add(X0,X1,4,(g,lo,hi)=>luzRua(g,Math.max(lo,X0),Math.min(hi,X1),HB+20,X0,640,240));
    add(X0+1500,X0+1640,5,g=>quiosque(g,X0+1500,HB+50)); add(X0+2380,X0+2720,5,g=>caminhao(g,X0+2380,HB+66));
    for(const r of [.62,.66,.86,.9]){ const x=X0+L*r; add(x-40,x+200,5,g=>tenda(g,x,HB+44,x)); } add(X0+L*.7,X0+L*.7+200,5,g=>sacos(g,X0+L*.7,HB+60,6));
    lampRow(X0,sea,640,true,240,'globo'); for(let x=sea+300;x<X1;x+=700){ const xx=x; add(xx-60,xx+60,5,g=>posteColonial(g,xx,HB+4,170,true,true)); add(xx-260,xx+260,4,g=>luzChao(g,xx,HB+30,240,'#ffb860',.035)); }
    decals(X0,X1,s,{wet:false,holes:false,stones:false}); fiosAdd(X0,sea,s); break; }
  case 'sertao':
    chaoExtras(X0,X1,s+3,{faixa:false,slabs:false});
    acidentes(X0,X1,s,['racha','poca','sangue']); borda(X0,X1,s+7,['conteiner','capotado','barricada']);
    add(X0,X1,0,(g,lo,hi)=>{ const a=Math.max(lo,X0), b=Math.min(hi,X1); seaBand(g,a,b,HZ,HB,false); });
    add(X0,X0+1300,1,g=>{ armazem(g,X0,700,'ARMAZEM 11',{col:'#e0d2ae'}); centroArtesanato(g,X0+740,560); }); add(X0+1320,X0+1880,1,g=>guindaste(g,X0+1380));
    add(X0+1640,X0+3390,1,g=>caisSertao(g,X0+1700,1560)); add(X0+3320,X0+3900,1,g=>guindaste(g,X0+3400)); add(X0+3700,X1,1,g=>armazem(g,X0+3700,L-3700,'ARMAZEM 14',{col:'#e6d8b8'}));
    add(X0,X1,3,(g,lo,hi)=>{ const a=Math.max(lo,X0), b=Math.min(hi,X1); fSlabs(g,a,b,'#aaa4a2',s,HB,X0); shade(g,a,HB,b-a,6,'#140a24',.45); trilhosBonde(g,a,b); });
    add(X0+500,X0+760,5,g=>{ conteiner(g,X0+500,HB+50,'#c84a3a',250,'LUA'); }); add(X0+2300,X0+2560,5,g=>conteiner(g,X0+2300,HB+56,'#3a7ab8',250,'PORTO')); add(X0+4300,X0+4560,5,g=>{ conteiner(g,X0+4300,HB+50,'#4a8a4a',250); conteiner(g,X0+4330,HB+50-110,'#e8a03a',200); });
    for(let x=X0+300;x<X1;x+=600){ const xx=x; add(xx-20,xx+20,5,g=>cabecoMid(g,xx,HB+26)); }
    lampRow(X0,X1,760,true,400); decals(X0,X1,s,{holes:false}); break;
  case 'travessia':
    add(X0,X1,0,(g,lo,hi)=>{ const a=Math.max(lo,X0), b=Math.min(hi,X1); seaBand(g,a,b,HZ,HB,false); R(g,a,HZ+8,b-a,4,'#3a3650'); });
    add(X1-1400,X1-400,0,g=>{ torreCristal(g,X1-900,HZ+10,.5); ovo(g,X1-1000,HZ+11,.3,'#d8ccb0'); serpente(g,X1-780,HZ+11,.28); });
    for(let x=X0+400;x<X1;x+=900){ const xx=x; add(xx-20,xx+20,0,g=>{ R(g,xx-4,HZ+18,8,12,'#d83a3a'); R(g,xx-4,HZ+18,8,2,'#ff8a6a'); R(g,xx-1,HZ+10,2,8,'#2a2030'); R(g,xx-6,HZ+30,12,3,'#1a1428'); }); }
    add(X0,X1,3,(g,lo,hi)=>fAgua(g,Math.max(lo,X0),Math.min(hi,X1)));
    for(let i=0;i<16;i++){ const x=X0+hsh(i*3.3)*L, y=HB+16+hsh(i*7.1)*120; add(x-50,x+50,4,g=>flutuante(g,x,y,i)); }
    add(X0,X1,0,(g,lo,hi)=>arrecife(g,Math.max(lo,X0),Math.min(hi,X1),HZ+4)); add(X0+500,X0+760,0,g=>farol(g,X0+620,HZ+6)); add(X0+1500,X0+1900,0,g=>navio(g,X0+1650,HZ+24));
    add(X1-1700,X1,0,(g,lo,hi)=>{ R(g,X1-1700,HZ+6,1700,10,'#2c2840'); for(let x=X1-1700;x<X1;x+=14) blob(g,x,HZ+2+hsh(x)*4,12,8,'#3a3450'); for(let k=0;k<20;k++) colunaB(g,X1-1660+k*80+hsh(k)*30,HZ+8,.26+hsh(k*3)*.1,hsh(k*7)); totem(g,X1-1300,HZ+8,.35); ovo(g,X1-1150,HZ+8,.4,'#c8a070'); passaro(g,X1-500,HZ+8,.35); });
    for(let i=0;i<5;i++){ const x=X0+300+i*700, by=HZ+16+hsh(i)*24; add(x-60,x+60,0,g=>{ const w=40+hsh(i*3)*40; poly(g,[[x,by],[x+8,by+8],[x+w-6,by+8],[x+w,by]],'#1c1a3a'); R(g,x+w*.3,by-10,w*.35,10,'#26224c'); R(g,x+w*.5,by-30,1,20,'#26224c'); emit(g,g=>R(g,x+w*.4,by-7,3,3,'#f0b060')); reflexo(g,x+w/2,by+10,HB-4,'#3a3a7a',w*.5); }); }
    add(X0,X1,4,(g,lo,hi)=>{ for(let x=Math.floor(Math.max(lo,X0)/37)*37;x<Math.min(hi,X1);x+=37) if(hsh(x*.13)>.72){ const xx=x; emit(g,g=>reflexo(g,xx,HB+2,HB+70,pick(['#c8904a','#8a8ad0','#e8b060'],hsh(xx)),5)); } }); break;
  case 'molhe':
    chaoExtras(X0,X1,s+3,{faixa:false,slabs:false});
    acidentes(X0,X1,s,['racha','sangue','poca']);
    add(X0,X1,0,(g,lo,hi)=>{ const a=Math.max(lo,X0), b=Math.min(hi,X1); seaBand(g,a,b,HZ,HB,false); });
    add(X0,X1,3,(g,lo,hi)=>fMolhe(g,Math.max(lo,X0),Math.min(hi,X1))); add(X0,X1,4,(g,lo,hi)=>luzRua(g,Math.max(lo,X0),Math.min(hi,X1),HB+30,X0,520,180)); for(let x=X0+180;x<X1;x+=520){ const xx=x; add(xx-320,xx+320,4,g=>{ luzChao(g,xx,HB+50,240,'#ffb860',.04); luzChao(g,xx+20,HB+130,320,'#ffa850',.03); }); }
    add(X0+200,X0+1100,1,g=>{ ovo(g,X0+300,HB+14,2.2,'#d8ccb0'); ovo(g,X0+470,HB+12,1.6,'#c8a070'); ovo(g,X0+620,HB+16,2.6,'#e0d4bc'); totem(g,X0+900,HB+14,2.0); });
    add(X0+1250,X0+1650,1,g=>serpente(g,X0+1450,HB+14,1.5)); add(X0+1700,X0+2300,1,g=>{ ovo(g,X0+1800,HB+14,1.5,'#e0d4bc'); totem(g,X0+1990,HB+12,1.7); ovo(g,X0+2180,HB+16,2.3,'#c8a070'); }); add(X0+2350,X0+2950,1,g=>torreCristal(g,X0+2650,HB+16,.92)); add(X0+3150,X0+3700,1,g=>{ totem(g,X0+3300,HB+12,1.9); ovo(g,X0+3520,HB+14,2.0,'#c8a070'); });
    for(let x=X0+180;x<X1;x+=520){ const xx=x; add(xx-60,xx+60,5,g=>posteColonial(g,xx,HB+22,170,true,false)); }
    add(X0+1050,X0+1250,1,g=>passaro(g,X0+1150,HB+14,1.4)); add(X0+3000,X0+3150,1,g=>passaro(g,X0+3080,HB+12,1.2)); add(X0+2950,X0+3050,1,g=>ovo(g,X0+2990,HB+14,1.2,'#7a9ab8'));
    add(X0+3600,X0+3860,5,g=>barcoEncalhado(g,X0+3600,HB+28));
    add(X0,X1,0,(g,lo,hi)=>{ for(let x=Math.floor(Math.max(lo,X0)/150)*150+40;x<Math.min(hi,X1)+60;x+=150){ const v=hsh(x*.37); if(Math.abs(x-(X0+2650))<260) continue; colunaB(g,x,HB-2,.55+v*.25,v); } });
    for(let i=0;i<5;i++){ const x=X0+400+i*760; add(x-120,x+120,4,g=>{ poca(g,x,400+hsh(i)*80,160,i,true); }); }
    for(let i=0;i<8;i++){ const x=X0+200+i*460, y=360+hsh(i)*120; add(x-40,x+40,4,g=>sangue(g,x,y,i,hsh(i*3)>.5)); }
    break;
  }
}
function fiosAdd(X0,X1,s){ add(X0,X1,2,(g,lo,hi)=>fios(g,Math.max(lo,X0)-420,Math.min(hi,X1)+420,s)); }
function empena(g,x,w){ const c=rmp('#a8988a'), top=40; R(g,x,top,w,HB-top,c[3]); R(g,x,top,3,HB-top,c[4]); for(let i=0;i<5;i++) blob(g,x+4+hsh(i)*(w-14),top+20+hsh(i*3)*200,10+hsh(i*5)*12,20+hsh(i*7)*30,hsh(i*9)>.5?c[4]:c[2]);
  R(g,x+w-8,top,4,HB-top,METAL[3]); R(g,x+w-8,top,1,HB-top,METAL[1]); for(let y=top+30;y<HB;y+=60) R(g,x+w-10,y,8,3,METAL[4]); R(g,x,HB-14,w,14,c[4]); R(g,x+w,top,2,HB-top,'#120a1c'); pixo(g,x+4,HB-30,33,'#1a1020'); streak(g,x+10,top,40,4,c[4]); }
function trilhos(g,a,b){ for(const y of [402,470]){ const h=y<450?4:6; R(g,a,y,b-a,h,'#5a5668'); R(g,a,y,b-a,1,'#b8b4c8'); R(g,a,y+h,b-a,2,'#1a1424'); } for(let x=Math.floor(a/120)*120;x<b;x+=120) if(hsh(x)>.6) streak(g,x,406,4,6,'#7a4a2a'); }
function rosaVentos(g,cx,cy){ // piso da Praça do Marco Zero: anel azul, faixa clara e rosa colorida (inspirada em Cícero Dias), marco de bronze no centro
  const rx=440, ky=.2, P=(u,v)=>[cx+u,cy+v*ky], ring=(r,col,dy)=>ell(g,cx,cy+(dy||0),r,r*ky,col);
  ring(rx+14,'#2a1e30',3); ring(rx+12,'#3a6ad0'); ring(rx+2,'#2c56b0'); ring(rx-2,'#e09a80');
  ring(rx*.84,'#f4ead8'); ring(rx*.6,'#3a3040'); ring(rx*.59,'#fbf4e8'); ring(rx*.55,'#52c8a0');
  const cols=['#f49478','#f6d040','#3a78e0','#ea5a4a','#f8e2a8','#7ad890'];
  for(let k=0;k<16;k++){ const a=k/16*Math.PI*2, a1=(k+1)/16*Math.PI*2, r0=rx*.16, r1=rx*(k%2?.38:.53), am=(a+a1)/2;
    poly(g,[P(Math.cos(a)*r0,Math.sin(a)*r0),P(Math.cos(am)*r1,Math.sin(am)*r1),P(Math.cos(a1)*r0,Math.sin(a1)*r0)],cols[k%cols.length]);
    const tip=P(Math.cos(am)*r1,Math.sin(am)*r1); line(g,cx,cy,tip[0],tip[1],mix(cols[k%cols.length],'#ffffff',.35)); }
  for(let k=0;k<8;k++){ const a=k/8*Math.PI*2+Math.PI/8, p=P(Math.cos(a)*rx*.46,Math.sin(a)*rx*.46); poly(g,[[p[0]-22,p[1]],[p[0],p[1]-6],[p[0]+22,p[1]],[p[0],p[1]+6]],cols[(k+2)%cols.length]); }
  ring(rx*.16,'#ece4d8');
  ell(g,cx,cy+3,60,60*ky+3,'#1a1218'); ell(g,cx,cy,58,58*ky,'#7a5a2a'); ell(g,cx,cy,54,54*ky,'#c8a050'); ell(g,cx,cy,42,42*ky,'#a07a34'); ell(g,cx,cy,38,38*ky,'#d8b464'); ell(g,cx-10,cy-3,16,16*ky,'#f0d890');
  R(g,cx-22,cy-1,44,2,'#7a5420'); R(g,cx-1,cy-8,2,16,'#7a5420'); for(let k=0;k<28;k++){ const a=k/28*Math.PI*2; R(g,cx+Math.cos(a)*48,cy+Math.sin(a)*48*ky,2,1,'#7a5420'); }
  g.save(); g.beginPath(); g.ellipse(cx,cy,rx+12,(rx+12)*ky,0,0,Math.PI*2); g.clip(); g.globalAlpha=.22;
  rowsC('sl'+HB,HB,HH,11,.17).forEach(([y])=>R(g,cx-rx-14,y,rx*2+28,1,'#3a2a34')); for(let x=cx-rx;x<cx+rx;x+=46) R(g,x+Math.round(hsh(x)*8),cy-rx*ky-14,1,rx*ky*2+28,'#3a2a34');
  g.globalAlpha=.16; for(let i=0;i<9;i++) ell(g,cx-rx*.8+hsh(i*3.3)*rx*1.6,cy-rx*ky*.6+hsh(i*7)*rx*ky*1.2,40+hsh(i)*70,6+hsh(i*5)*6,'#2a1a30'); g.restore(); }
function letreiro(g,x,yb){ const cols=['#e83a3a','#3a8ae8','#ffd23f','#4ac860','#e8803a','#c04ae8','#3ad0d0','#ff6aa0','#ffd23f','#3a8ae8'], word='MARCO ZERO', s=7; let cx=x, ci=0;
  R(g,x-14,yb-14,tw(word,s)+28,14,'#4a4458'); R(g,x-14,yb-14,tw(word,s)+28,2,'#7a7488'); R(g,x-14,yb-2,tw(word,s)+28,4,'#1a1424');
  emit(g,g=>{ let cx=x, ci=0;
  for(const ch of word){ if(ch===' '){ cx+=6*s; continue; } const c=rmp(mix(cols[ci++],'#ffffff',.1)), G=FONT[ch];
    for(let r=0;r<7;r++) for(let b=0;b<5;b++) if(G[r]&(16>>b)) R(g,cx+b*s+5,yb-14-7*s+r*s+5,s,s,c[4]);
    for(let r=0;r<7;r++) for(let b=0;b<5;b++) if(G[r]&(16>>b)){ R(g,cx+b*s,yb-14-7*s+r*s,s,s,c[2]); R(g,cx+b*s,yb-14-7*s+r*s,s,2,c[1]); if(r===0||!(G[r-1]&(16>>b))) R(g,cx+b*s,yb-14-7*s+r*s,s,2,c[0]); }
    cx+=6*s; } }); for(let k=0;k<9;k++) glow(g,x+20+k*48,yb-40,44,cols[k],.035,3); }
function estatua(g,x,yb){ // estátua de bronze sobre pedestal alto de granito
  const p=rmp('#c8c0b0'), br=rmp('#6e6a3e');
  ell(g,x,yb,56,7,'rgba(10,6,20,.5)'); R(g,x-50,yb-16,100,16,p[4]); R(g,x-48,yb-16,96,14,p[2]); R(g,x-48,yb-16,96,2,p[1]); R(g,x-40,yb-30,80,14,p[3]); R(g,x-40,yb-30,80,2,p[1]);
  poly(g,[[x-26,yb-30],[x-18,yb-150],[x+18,yb-150],[x+26,yb-30]],p[5]); poly(g,[[x-25,yb-30],[x-17,yb-149],[x+17,yb-149],[x+25,yb-30]],p[2]); poly(g,[[x-25,yb-30],[x-17,yb-149],[x-9,yb-149],[x-12,yb-30]],p[1]); poly(g,[[x+10,yb-30],[x+11,yb-149],[x+17,yb-149],[x+25,yb-30]],p[3]);
  R(g,x-24,yb-158,48,9,p[1]); R(g,x-24,yb-158,48,1,p[0]); R(g,x-22,yb-149,44,2,p[4]);
  R(g,x-12,yb-90,24,14,'#4a3a1a'); R(g,x-10,yb-88,20,10,'#6a5a2a'); for(let k=0;k<3;k++) R(g,x-8,yb-86+k*3,16-k*4,1,'#d8c890');
  const fy=yb-158; R(g,x-12,fy-62,24,62,br[5]); R(g,x-11,fy-62,22,62,br[2]); R(g,x-11,fy-62,6,62,br[1]); R(g,x+5,fy-62,6,62,br[3]); poly(g,[[x-14,fy],[x-11,fy-30],[x+11,fy-30],[x+16,fy]],br[2]); poly(g,[[x+3,fy],[x+11,fy-30],[x+16,fy]],br[3]);
  ell(g,x,fy-72,9,10,br[5]); ell(g,x,fy-72,8,9,br[2]); ell(g,x-2,fy-75,3,4,br[1]); R(g,x+10,fy-58,14,5,br[5]); R(g,x+11,fy-57,12,3,br[2]); R(g,x-19,fy-58,8,24,br[5]); R(g,x-18,fy-57,6,22,br[3]);
  R(g,x-11,fy-62,22,2,br[0]); for(let k=0;k<4;k++) streak(g,x-9+k*6,fy-48,12,2,'#4a7a62'); streak(g,x-16,yb-140,30,3,p[4]); tag(g,x-20,yb-60,51); }
function marcoKm0(g,x,yb){ const p=rmp('#d8d0c0'); R(g,x-12,yb-60,24,60,p[5]); R(g,x-11,yb-59,22,59,p[2]); R(g,x-11,yb-59,6,59,p[1]); R(g,x+6,yb-59,5,59,p[3]); poly(g,[[x-13,yb-60],[x,yb-72],[x+13,yb-60]],p[1]); R(g,x-8,yb-48,16,14,'#3a3a5a'); text(g,'KM',x-6,yb-46,1,'#e8e0c0'); text(g,'0',x-2,yb-38,1,'#ffd23f'); }

/* =====================================================================
   TILES DO MID
   ===================================================================== */
const TILE=2048, NT=Math.ceil(WORLD*RS/TILE), midTiles=new Array(NT).fill(null);
const [mid]=mk(1,1); // compat: o mid de um canvas só não cabe; quem desenha é drawMid
let built=false, engineDM=false, fromSky=false, pend=-1;
const MASK={};
const GRADE=[[0,'#c6ceff'],[.3,'#bec8fc'],[.5,'#acb8f0'],[.546,'#96a2de'],[.556,'#b2bcec'],[.68,'#b4bee8'],[.86,'#9ca8da'],[1,'#7682bc']];
// luz do cenário (dia e clima, DN-03): 'noite' (noite/madrugada/Lua de Sangue), 'dusk' (anoitecer: postes acesos) e 'dia' (manhã/tarde: sem emissivos)
const GRADES={noite:GRADE,dusk:[[0,'#f4d4e2'],[.3,'#e8c6dc'],[.5,'#d4b0d0'],[.546,'#ba94bc'],[.556,'#dcbcd6'],[.68,'#e4c8de'],[.86,'#ccacce'],[1,'#9e7eae']],
  dia:[[0,'#fffaf2'],[.3,'#fcf6f2'],[.5,'#f6eef0'],[.546,'#e4dcea'],[.556,'#f8f0f2'],[.68,'#faf2f2'],[.86,'#ece4ee'],[1,'#d6cee4']]};
let LIGHT='noite', RL='noite', PREV=null;
const lightOf=m=>m==='manha'||m==='tarde'||m==='dia'?'dia':m==='anoitecer'||m==='dusk'?'dusk':'noite';
/* troca a luz dos tiles: os tiles da luz antiga continuam na tela até os novos ficarem prontos (gerados aos poucos
   no idle do motor) e então somem num fade curto, sem engasgo. */
function setLight(m,now){ const l=lightOf(m); if(l===LIGHT) return; PREV=!now&&midTiles.some(Boolean)?{t:midTiles.slice(),a:1,ready:false}:null; midTiles.fill(null); job=null; LIGHT=l; }
const LAY={};
function gradeLayer(c,g){ // gradação noturna (multiply) preservando o alfa da camada
  if(!MASK.c) [MASK.c,MASK.g]=mk(TILE,HH); MASK.g.clearRect(0,0,TILE,HH); MASK.g.drawImage(c,0,0);
  g.globalCompositeOperation='multiply'; const gk='gr'+RL; if(!LAY[gk]){ LAY[gk]=g.createLinearGradient(0,0,0,HH); (GRADES[RL]||GRADE).forEach(([o,col])=>LAY[gk].addColorStop(o,col)); } g.fillStyle=LAY[gk]; g.fillRect(0,0,TILE,HH);
  g.globalCompositeOperation='destination-in'; g.drawImage(MASK.c,0,0);
  g.globalCompositeOperation='source-over'; }
const POP={noite:.45,dusk:.3,dia:.18};
function popTile(c,g){ const pop=POP[RL]; if(!pop) return; if(!MASK.c) [MASK.c,MASK.g]=mk(TILE,HH); // contraste/saturação: overlay do tile pronto sobre ele mesmo (uma vez por tile)
  g.save(); g.setTransform(1,0,0,1,0,0); MASK.g.clearRect(0,0,TILE,HH); MASK.g.drawImage(c,0,0); g.globalCompositeOperation='overlay'; g.globalAlpha=pop; g.drawImage(MASK.c,0,0); g.restore(); }
// tile em etapas (uma camada z por etapa): o pré-carregamento do próximo tile se espalha por vários quadros
function tileJob(i){ const [c,g]=mk(TILE,HH), tx=i*TILE, lo=tx, hi=tx+TILE; if(!LAY.c) [LAY.c,LAY.g]=mk(TILE,HH); const L=LAY.g;
  const els=DLs.filter(e=>e.x1>lo&&e.x0<hi), zs=[...new Set(els.map(e=>e.z))]; let n=0; const lt=LIGHT;
  return {i,c,lt,done:()=>n>=zs.length,step(){ const z=zs[n++]; RL=lt;
    L.setTransform(1,0,0,1,0,0); L.clearRect(0,0,TILE,HH); L.translate(-tx,0); LQ=[];
    for(const e of els) if(e.z===z) e.f(L,lo,hi);
    const q=LQ; LQ=null; L.setTransform(1,0,0,1,0,0); gradeLayer(LAY.c,L); L.translate(-tx,0);
    for(const [k,fn] of q) if(k===0) fn(L);
    g.setTransform(1,0,0,1,0,0); g.drawImage(LAY.c,0,0); g.translate(-tx,0);
    if(n>=zs.length) popTile(c,g);
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
function fgSprite(t){ if(fgCache[t]) return fgCache[t]; let w=80, c, g;
  if(t==='grade'){ w=300; [c,g]=mk(w,HH); fgGrade(g,w); return fgCache[t]={c,w}; }
  if(t==='planta'){ w=280; [c,g]=mk(w,HH); fgPlanta(g,w); return fgCache[t]={c,w}; }
  if(t==='carcaca'){ w=380; [c,g]=mk(w,HH); fgCarcaca(g,w); return fgCache[t]={c,w}; }
  if(t==='barril'){ w=130; [c,g]=mk(w,HH); fgBarril(g,w); return fgCache[t]={c,w}; }
  if(t.startsWith('placa:')){ w=140; [c,g]=mk(w,HH); fgPlaca(g,w,t.slice(6)); return fgCache[t]={c,w}; }
  if(t==='palm'){ w=320; [c,g]=mk(w,HH); palmeira(g,w/2); } else if(t==='cab'){ [c,g]=mk(w,HH); cabeco(g,w/2); } else if(t==='lixo'){ w=160; [c,g]=mk(w,HH); lixo(g,40,HH+4,77); lixo(g,90,HH+8,31); } else { [c,g]=mk(w,HH); posteFG(g,w/2); }
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
const SKYP={
  manha:{g:['#3c6ad6','#4878de','#5686e4','#6696ea','#78a6ee','#8cb4f0','#a2c2f0','#bccef0','#d8d4ec','#f2d6d6'],star:null,sol:true,moon:['#fffff4','#fff6d0','#ffe9a6','#f2d27e'],mr:26,mx:190,my:118,glow:'#fff2c4',cloud:['#c6cdea','#e6eaf8','#ffffff','#ffffff'],f1:'#7c8ec2',f1w:'#b4c8ec',f2:'#5c6caa',f2w:'#9cb2e2'},
  tarde:{g:['#2c5cca','#3a6ad2','#4a7ad8','#5a88de','#6e98e2','#84a8e4','#9eb6e2','#bec2dc','#dec6ba','#f6c892'],star:null,sol:true,moon:['#fffff2','#fff8d4','#ffeca4','#f8d872'],mr:24,mx:780,my:58,glow:'#fff4ca',cloud:['#d6c6d6','#f2eaf0','#ffffff','#fff0e0'],f1:'#8a88b8',f1w:'#ccc8ea',f2:'#6a68a2',f2w:'#b2b0da'},
  anoitecer:{g:['#1a1450','#2a1a64','#3e2274','#562a80','#702e84','#8c3484','#aa3e7e','#c84e70','#e46a5a','#f89a4a'],star:'#f0d8ff',ns:60,sol:true,moon:['#fff2c4','#ffc274','#ff9254','#e86a3a'],mr:46,mx:640,my:262,glow:'#ff8a4a',cloud:['#4a2058','#7a3064','#ffb070','#c86070'],f1:'#3a2462',f1w:'#ffc070',f2:'#26184a',f2w:'#ffb060'},
  noite:{g:['#05041a','#090a26','#0d1032','#12163e','#181d4a','#202558','#2a2e66','#363874','#444280','#544c8c'],star:'#e8e0ff',moon:['#fffbe8','#efe8cc','#cfc6a6','#a89e84'],mr:34,mx:740,my:84,glow:'#8a90ff',cloud:['#1e1a40','#2a2452','#3c3468','#5a5288'],f1:'#2e2458',f1w:'#d8b878',f2:'#1c1640',f2w:'#f0b860'},
  lua:{g:['#0c0206','#160308','#22050c','#300810','#400c14','#521018','#66161c','#7c1e22','#922a28','#a8382e'],star:'#ffd0c8',moon:['#ffa47a','#f0603e','#c4342a','#86181a'],mr:62,mx:720,my:116,glow:'#ff4a3a',cloud:['#2a0610','#40101a','#5c1822','#82282c'],f1:'#4a0e1a',f1w:'#ff8a5a',f2:'#2a060e',f2w:'#ffa060'}};
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
// horizonte aberto do mar (Marco Zero, armazéns, travessia, molhe): névoa sobre a linha d'água, Olinda no alto ao norte, navios ao largo
function seaStrip(mode){ const k='s'+mode; if(stripCache[k]) return stripCache[k]; const P=SKYP[mode], W0=2400, [c,g]=mk(W0,HB), n=P.g.length, dk=P.f2, hz=HZ+2;
  const hazeC=mix(P.g[n-1],P.glow,.28); for(let i=0;i<10;i++){ g.globalAlpha=.07+i*.035; R(g,0,hz-70+i*7,W0,70-i*7,hazeC); } g.globalAlpha=1;
  // Olinda: morro com casario e torres de igreja recortados, luzinhas quentes (ao norte)
  const ox=260, ow=760, cc=rmp(dk);
  for(let x=0;x<ow;x+=2){ const u=x/ow, h=Math.round(Math.pow(Math.sin(u*Math.PI),.8)*24+Math.sin(u*19)*3); R(g,ox+x,hz-h,2,h,mix(dk,P.g[n-1],.25)); }
  for(let x=40;x<ow-40;x+=10+Math.floor(hsh(x)*8)){ const u=x/ow, h0=Math.round(Math.pow(Math.sin(u*Math.PI),.8)*24), bh=6+Math.floor(hsh(x*1.7)*8); R(g,ox+x,hz-h0-bh+3,9,bh,dk); if(hsh(x*3.1)>.55){ g.fillStyle=mix(P.f1w,'#ffffff',.2); g.fillRect(ox+x+3,hz-h0-bh+6,2,2); } }
  for(const [u,tw2] of [[.38,.6],[.52,.8],[.64,.55]]){ const x=ox+u*ow, h0=Math.round(Math.pow(Math.sin(u*Math.PI),.8)*24)+8; R(g,x-8*tw2,hz-h0-16*tw2,16*tw2,16*tw2,dk); for(const sx of [-1,1]){ R(g,x+sx*7*tw2-3,hz-h0-28*tw2,6,13*tw2,dk); R(g,x+sx*7*tw2-1,hz-h0-32*tw2,2,4,dk); } }
  R(g,ox+ow*.8,hz-30,3,22,dk); R(g,ox+ow*.8-2,hz-32,7,3,dk); // farol de Olinda
  // navios e barcos ao largo
  for(const [x,w] of [[1350,120],[1900,70],[2250,46]]){ R(g,x,hz-7,w,7,dk); R(g,x+w*.6,hz-15,w*.25,8,dk); R(g,x+w*.7,hz-24,3,9,dk); g.fillStyle=P.f2w; for(let k2=0;k2<w*.5;k2+=9) if(hsh(x+k2)>.4) g.fillRect(x+6+k2,hz-5,2,2); g.fillStyle='#ff4a3a'; g.fillRect(x+w*.7,hz-26,2,2); }
  R(g,0,hz-1,W0,1,mix(hazeC,'#ffffff',.25));
  return stripCache[k]=c; }
function strip(g,cv,off,y){ const w=cv.width, o=((Math.round(off)%w)+w)%w; g.drawImage(cv,-o,y); if(w-o<HW) g.drawImage(cv,w-o,y); }
const scratch={};
function drawSky(g,mode,cam,t){ if(!built) build(); const P=SKYP[mode]||SKYP.noite; mode=SKYP[mode]?mode:'noite'; const T=g.getTransform();
  g.save(); g.setTransform(1,0,0,1,T.e,T.f); g.imageSmoothingEnabled=false; R(g,0,0,HW,HH,P.g[P.g.length-1]);
  g.drawImage(skyCanvas(mode),0,0); strip(g,cloudStrip(mode),cam*RS*.03+(t||0)*3,0);
  const sx=Math.round((AID.marco.x0+2500/RS-cam)*RS); // onde o casario acaba e o cais abre pro mar
  if(sx>0){ if(sx<HW){ g.save(); g.beginPath(); g.rect(0,0,sx,HH); g.clip(); } strip(g,farStrip(mode,1),cam*RS*.08,0); strip(g,farStrip(mode,2),cam*RS*.22,0); if(sx<HW) g.restore(); }
  if(sx<HW){ g.save(); g.beginPath(); g.rect(Math.max(0,sx),0,HW,HH); g.clip(); strip(g,seaStrip(mode),cam*RS*.05,0); g.restore(); }
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
  g.restore(); }

/* =====================================================================
   BUILD
   ===================================================================== */
function build(){
  WINDOWS.length=0; LAMPS.length=0; BULBS.length=0; FGI.length=0; NEON.length=0; DL.length=0; midTiles.fill(null);
  AREAS.forEach(compose);
  DLs=DL.slice().sort((a,b)=>a.z-b.z||a.i-b.i);
  // primeiro plano
  AREAS.forEach(A=>{ if(A.id==='travessia') return; const st=A.id==='ponte'?576:680;
    for(let wx=A.x0+170;wx<A.x1-60;wx+=st){ const k=Math.round((wx-A.x0)/st);
      if(A.id==='molhe'||A.id==='sertao') FGI.push({t:'cab',x:wx});
      else if(A.id==='marco'||A.id==='riobranco') FGI.push({t:k%2?'palm':'poste',x:wx});
      else FGI.push({t:'poste',x:wx});
      if(A.id!=='molhe'){ const kinds=A.id==='marco'?['planta','grade','barril']:A.id==='sertao'?['barril','grade','planta']:A.id==='ponte'?['grade','barril','grade']:['planta','lixo','barril','grade','placa','planta'];
        let t=pick(kinds,hsh(wx*.37)); if(t==='placa') t='placa:'+({alfandega:'CAIS DA ALFANDEGA',feira:'R. DO BOM JESUS',bomjesus:'R. DO BOM JESUS',apolo:'R. DO APOLO',moeda:'R. DA MOEDA',arsenal:'R. DA GUIA',riobranco:'AV. RIO BRANCO'}[A.id]||'RECIFE ANTIGO');
        FGI.push({t,x:wx+st*.5}); } } });
  for(let wx=AID.marco.x0+1000;wx<AID.marco.x1;wx+=260) FGI.push({t:'cab',x:wx});
  FGI.filter(it=>it.t==='poste').forEach(it=>LAMPS.push({fx:it.x*1.25,y:60/RS+.1,r:30}));
  built=true; engineDM=false;
  // windows/lamps são registrados durante o desenho: renderiza tudo uma vez só para coletar, sem guardar tiles
  const seen=new Set(); const [c0,g0]=mk(1,1); const W0=WINDOWS.length;
  // coleta: executa cada elemento uma vez num contexto mínimo
  RL='noite'; collecting=true; for(const e of DLs){ g0.setTransform(1,0,0,1,0,0); e.f(g0,e.x0,e.x1); } collecting=false;
  const uniq=(arr,key)=>{ const m=new Map(); arr.forEach(o=>m.set(key(o),o)); return [...m.values()]; };
  const wins=uniq(WINDOWS,o=>o.x.toFixed(1)+','+o.y.toFixed(1)); WINDOWS.length=0; WINDOWS.push(...wins);
  const lm=uniq(LAMPS,o=>(o.fx!=null?'f'+o.fx:o.x.toFixed(1))+','+o.y.toFixed(1)); LAMPS.length=0; LAMPS.push(...lm);
  const bl=uniq(BULBS,o=>o.x.toFixed(1)+','+o.y.toFixed(1)); BULBS.length=0; BULBS.push(...bl);
  const ne=uniq(NEON,o=>o.x.toFixed(1)+','+o.y.toFixed(1)); NEON.length=0; NEON.push(...ne);
  tileAt(0);
}

const TINT={manha:'rgba(255,196,206,.05)',tarde:'rgba(255,184,96,.08)',anoitecer:'rgba(140,40,110,.16)',noite:'rgba(8,18,60,.05)',lua:'rgba(120,10,26,.4)'}; // tinta sugerida pro cenário (a noite já vem pintada)
return {TINT,setLight,light:()=>LIGHT,build,mid,midTiles,drawMid,idle:ms=>{ engineIdle=true; return idle(ms); },warm,drawFG,FGI,drawSky,drawLights,AREAS,AID,WINDOWS,LAMPS,BULBS,W,H,BASE,WORLD,OUT,RS,TILE};
})();
