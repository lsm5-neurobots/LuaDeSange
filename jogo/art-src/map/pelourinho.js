/* PELOURINHO — fonte de arte (editável). Build: npm run art
   Cenário da fase Pelourinho · Salvador (BA) no mesmo contrato do MAP/OLINDA: RS=2.5 → 960×540 px por tela,
   "mid" em tiles de 2048 px renderizados sob demanda (drawMid), céu/fundo em parallax (drawSky), primeiro plano (drawFG)
   e halos aditivos (drawLights, com o facho giratório do Farol da Barra). Coordenadas públicas (AREAS, WINDOWS, LAMPS,
   BULBS, BEACONS, FGI) em unidades lógicas 384×216. Modos de céu: manha · tarde · anoitecer · noite · lua (+ clima
   'chuva'/'neblina' no mesmo texto: 'noite+chuva'); drawWeather(g,cam,mode,t) opcional por cima de tudo.
   Primitivas, fachadas, chão e props: cópia local do kit do Marco Zero/Olinda (cada factory é isolada); o que é de
   Salvador (casario baiano, encosta, baía, farol, Mercado Modelo, Plano Inclinado, Rosário, chafariz, Elevador) está
   nas seções "SALVADOR"/"MARCOS DE SALVADOR". Ids das áreas = src/data/maps/pelourinho.ts. */
const PELOURINHO=(function(){
const W=384, H=216, BASE=118, OUT='#170b1c', SC=3, RS=2.5;
const DEF=[
  {id:'farol', name:'Farol da Barra', short:'Farol', len:768, floor:'granito', back:'mar', fights:[14,18], chests:[], puzzle:null,
   ref:'Farol da Barra · Forte de Santo Antônio da Barra', desc:'Entrada da fase: o forte de pedra com a casa caiada e o farol de faixas pretas e brancas, a calçada da orla e o mar aberto. Na Lua de Sangue o facho gira vermelho.',
   chao:'Lajes de pedra da orla', inim:'Errantes na calçada · Rastejante na mureta', bau:'Nenhum'},
  {id:'comercio', name:'Comércio · Av. da França', short:'Comércio', len:768, floor:'asfalto', back:'rua', fights:[16,20], chests:[[.6,'comum']], puzzle:null,
   ref:'Cidade Baixa · Av. da França · prédios comerciais', desc:'Rua larga da Cidade Baixa: sobrados ecléticos, um prédio de escritórios de pano de vidro, sobrados de azulejo e ônibus largados. No fim, a estação do Plano Inclinado.',
   chao:'Asfalto rachado com trilho de bonde', inim:'Corredor entre os ônibus · Cuspidor na marquise', bau:'Baú comum no balcão de uma loja'},
  {id:'modelo', name:'Mercado Modelo', short:'Mercado', len:768, floor:'portuguesa', back:'cais', fights:[18,22], chests:[[.55,'médico']], puzzle:.2,
   ref:'Mercado Modelo · Praça Visconde de Cairu', desc:'O mercado amarelo-manteiga de frontão triangular, portas de cantaria e lojas acesas lá dentro; barracas de artesanato no pátio de pedra portuguesa. Ao fundo, a encosta e a torre do Elevador.',
   chao:'Pedra portuguesa em ondas', inim:'Gritador nas barracas · Rastejantes debaixo das bancas', bau:'Baú médico numa loja · puzzle de símbolos'},
  {id:'plano', name:'Plano Inclinado Gonçalves', short:'Plano', len:768, floor:'paralelo', back:'ladeira', fights:[18,22], chests:[[.5,'comum']], puzzle:null,
   ref:'Plano Inclinado Gonçalves', desc:'O bondinho de trilho subindo a encosta, com a cabine parada no meio e cipós nos trilhos; muro de arrimo de arcos e o casario da Cidade Alta lá em cima.',
   chao:'Paralelepípedo', inim:'Estreia do Estalador · Saltador no muro', bau:'Baú comum na cabine do bondinho'},
  {id:'ladeiras', name:'Ladeiras do Pelourinho', short:'Ladeiras', len:768, floor:'paralelo2', back:'ladeira', fights:[18,24], chests:[[.4,'escondido']], puzzle:.8,
   ref:'Ladeira do Carmo · Ladeira do Pelourinho', desc:'Casarões de dois e três andares colados, cunhais e molduras brancas, portas verde-escuras, bandeirolas e becos de escada subindo entre as casas.',
   chao:'Paralelepípedo de basalto com poças', inim:'Corredores na ladeira · Estalador no beco', bau:'Baú escondido num beco (faro do pet) · puzzle de fio'},
  {id:'largo', name:'Largo do Pelourinho', short:'Largo', len:768, floor:'paralelo', back:'praca', fights:[22,28], chests:[[.5,'raro']], puzzle:.15,
   ref:'Largo do Pelourinho · casarões coloridos', desc:'O coração do mapa: o largo de pedra subindo em perspectiva até os casarões amarelo e azul, casario de três andares dos dois lados, um palco de rua largado e um varal de lâmpadas. Lugar de memória: cenário, nunca alvo.',
   chao:'Paralelepípedo irregular', inim:'Percussionista no palco · Errantes no largo', bau:'Baú raro no palco de rua'},
  {id:'rosario', name:'Igreja do Rosário dos Pretos', short:'Rosário', len:768, floor:'paralelo', back:'praca', fights:[18,22], chests:[[.62,'médico']], puzzle:null,
   ref:'Igreja de N. Sra. do Rosário dos Pretos · escadaria', desc:'A igreja azul de cantaria bege e torres com cúpulas brancas em camadas, no alto de uma escadaria larga. Só cenário e mirante: nunca arena, nunca inimiga.',
   chao:'Paralelepípedo e degraus de pedra', inim:'Estalador na escadaria · Barrigudo no largo', bau:'Baú médico ao pé da escadaria'},
  {id:'casaroes', name:'Casarões e Ateliês', short:'Ateliês', len:768, floor:'paralelo', back:'ladeira', fights:[20,24], chests:[[.45,'militar']], puzzle:.8,
   ref:'Rua Gregório de Mattos · casarões e ateliês', desc:'Rua de ateliês: telas e esculturas largadas na calçada, tinta derramada no chão, treliças de madeira nas sacadas e varais de lâmpadas.',
   chao:'Paralelepípedo com tinta derramada', inim:'Saltadores das sacadas · Gritador no ateliê', bau:'Baú militar atrás de uma barricada · puzzle de fio'},
  {id:'terreiro', name:'Terreiro de Jesus', short:'Terreiro', len:768, floor:'portuguesa', back:'praca', fights:[18,26], chests:[[.4,'militar']], puzzle:.15,
   ref:'Terreiro de Jesus · Catedral Basílica · chafariz', desc:'Praça ampla de pedra portuguesa com o chafariz de ferro e o gradil coberto de fitas, palmeiras-imperiais, a Catedral Basílica e a igreja de São Pedro ao fundo. O Vendedor de Fitas espera no chafariz.',
   chao:'Pedra portuguesa em ondas', inim:'Mini boss: O Vendedor de Fitas', bau:'Baú militar num quiosque'},
  {id:'tome', name:'Praça Tomé de Sousa', short:'Tomé de Sousa', len:768, floor:'granito', back:'cais', fights:[20,26], chests:[[.55,'raro']], puzzle:.12,
   ref:'Praça Tomé de Sousa · Palácio Rio Branco · Elevador Lacerda', desc:'O largo de granito no alto: o Palácio Rio Branco de cúpula, a balaustrada com a baía e as luzes da Cidade Baixa lá embaixo, e a chegada Art Déco do Elevador Lacerda.',
   chao:'Lajes de granito', inim:'Estaladores na balaustrada · Barrigudo no palácio', bau:'Baú raro na balaustrada'},
  {id:'elevador', name:'Topo do Elevador Lacerda', short:'Elevador', len:640, floor:'granito', back:'torre', fights:[90], chests:[[.9,'chefe']], puzzle:null,
   ref:'Elevador Lacerda · terraço de observação', desc:'Arena do chefe: o terraço no alto do Elevador, as portas das cabines abertas, o pórtico de cabos e a torre caindo até a baía. Lá longe o Farol da Barra gira. O Ascensorista sobe na última cabine.',
   chao:'Granito liso com cabos cruzando', inim:'Chefe: O Ascensorista', bau:'Baú do chefe'},
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
const WINDOWS=[], LAMPS=[], BULBS=[], FGI=[], NEON=[], BEACONS=[];
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
  const words=['FUJA!','SOS','NAO ENTRE','SALVADOR VIVE','BAHIA','BA','TEM GENTE','SOCORRO','LUA DE SANGUE','ABRIGO >'], w0=pick(words,hsh(s)), col=pick(['#d8283a','#e8e0d0','#ffd23f','#3ad8c8','#ff5a9a'],hsh(s*3)), sc=hsh(s*5)>.6?3:2;
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
  textSh(g,'SALVADOR',x+200,top+100,2,c[3],w2[3]); for(let i=0;i<10;i++) blob(g,x+hsh(x+i)*L*.9,top+40+hsh(x*7+i)*80,10+hsh(i)*14,6,mix(c[3],'#8a4a2a',.6));
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
   CASARIO COLONIAL (kit de Olinda: casa térrea/sobrado, telhado, muxarabi)
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


/* =====================================================================
   IGREJAS BARROCAS (cal branca, cantaria, frontão de volutas)
   ===================================================================== */
function frontao(g,xa,xb,y,fh,wl,st,kind,o){ const fw=xb-xa, cx=(xa+xb)/2, N=64, P=[];
  for(let i=0;i<=N;i++){ const t=i/N, u=Math.abs(t-.5)*2; let h;
    if(kind==='triangulo') h=1-u;
    else if(kind==='reto') h=u<.7?.35:.35*(1-(u-.7)/.3);
    else { if(u<.16) h=1-(u/.16)**2*.08; else if(u<.5){ const q=(u-.16)/.34; h=.92-.42*(.5-.5*Math.cos(q*Math.PI)); } else if(u<.62) h=.5; else { const q=(u-.62)/.38; h=.5*Math.pow(1-q,1.6); } }
    P.push([xa+fw*t,y-fh*h]); }
  const Q=P.concat([[xb,y+2],[xa,y+2]]); poly(g,Q.map(p=>[p[0],p[1]-3]),st[4]); poly(g,Q,wl[2]);
  shade(g,xa,y-fh,fw*.35,fh,'#fff4dc',.05); shade(g,cx+fw*.2,y-fh,fw*.3,fh,'#1a0c30',.07);
  for(let i=0;i<N;i++){ const [px,py]=P[i], [qx,qy]=P[i+1]; line(g,px,py,qx,qy,st[2],3); line(g,px,py-1,qx,qy-1,st[0]); }
  if(kind==='voluta'){ for(const sx of [-1,1]){ const vx=cx+sx*fw*.25, vy=y-fh*.5+3; ell(g,vx,vy,9,9,st[4]); ell(g,vx,vy,7,7,st[1]); ell(g,vx+sx,vy+1,4,4,st[3]); ell(g,vx+sx,vy+1,2,2,st[1]);
      const ex=cx+sx*fw*.49; R(g,ex-3,y-10,6,10,st[3]); ell(g,ex,y-14,5,6,st[1]); R(g,ex-1,y-22,2,6,st[1]); } }
  const oy=y-fh*.45;
  if(o.brasao){ const bw=Math.min(70,fw*.22); ell(g,cx,oy+2,bw+4,fh*.36+4,st[4]); ell(g,cx,oy+2,bw,fh*.36,st[2]); ell(g,cx-bw*.3,oy-fh*.08,bw*.5,fh*.18,st[1]); ell(g,cx,oy+2,bw*.55,fh*.24,st[3]); ell(g,cx,oy+2,bw*.42,fh*.18,st[1]);
    for(let k=0;k<10;k++){ const a=k/10*Math.PI*2; ell(g,cx+Math.cos(a)*bw*.82,oy+2+Math.sin(a)*fh*.3,5,4,st[k%2?1:3]); } R(g,cx-2,oy-fh*.14,4,fh*.3,st[4]); R(g,cx-10,oy-fh*.04,20,4,st[4]); }
  else if(o.oculo){ const r=Math.min(fh*.28,24); ell(g,cx,oy,r+5,r+5,st[4]); ell(g,cx,oy,r+3,r+3,st[1]); ell(g,cx,oy,r,r,GLASS[3]); for(let k=0;k<8;k++){ const a=k/8*Math.PI*2; line(g,cx,oy,cx+Math.cos(a)*r,oy+Math.sin(a)*r,st[2]); } ell(g,cx,oy,4,4,st[1]);
    if(o.lit) emitW(g,g=>{ ell(g,cx,oy,r-2,r-2,'#d8783a'); for(let k=0;k<8;k++){ const a=k/8*Math.PI*2; line(g,cx,oy,cx+Math.cos(a)*r,oy+Math.sin(a)*r,'#5a2a1a'); } ell(g,cx,oy,4,4,'#ffd890'); }); }
  else { ell(g,cx,oy+2,16,fh*.24,st[4]); archF(g,cx-11,oy-fh*.14,22,fh*.34,'#1a1230'); R(g,cx-4,oy-fh*.06,8,fh*.24,wl[3]); ell(g,cx,oy-fh*.1,4,4,wl[2]); R(g,cx-12,oy+fh*.18,24,3,st[1]); }
  const ty=y-fh*(kind==='reto'?.35:1); R(g,cx-2,ty-28,5,26,st[4]); R(g,cx-10,ty-20,21,5,st[4]); R(g,cx-1,ty-27,2,24,st[1]); R(g,cx-9,ty-19,18,2,st[1]); R(g,cx-6,ty-4,13,4,st[3]); }
function portaIgreja(g,cx,yb,w,h,st,wd,s,open){ const x=Math.round(cx-w/2), r=w/2;
  archF(g,x-13,yb-h-13,w+26,h+13,st[5]); archF(g,x-11,yb-h-11,w+22,h+11,st[2]); R(g,x-11,yb-h+r,3,h-r,st[1]); R(g,x+w+8,yb-h+r,3,h-r,st[4]);
  for(let k=0;k<3;k++) R(g,x-11,yb-h+r+k*(h-r)/3,w+22,1,st[3]);
  R(g,cx-6,yb-h-15,12,13,st[1]); R(g,cx-6,yb-h-15,12,2,st[0]); R(g,cx+4,yb-h-13,2,11,st[3]);
  archF(g,x,yb-h,w,h,wd[5]);
  if(open){ archF(g,x+3,yb-h+3,w-6,h-3,'#120a1e'); emit(g,g=>{ for(let k=0;k<5;k++){ const fx=x+8+k*(w-16)/4, fy=yb-34-hsh(k+s)*14; R(g,fx,fy,2,8,'#f0e0c0'); R(g,fx,fy-3,2,3,'#ffd060'); } }); glow(g,cx,yb-30,w,'#ff9a40',.05,3);
    R(g,x+3,yb-h+r,6,h-r,wd[2]); R(g,x+w-9,yb-h+r,6,h-r,wd[3]); return; }
  archF(g,x+2,yb-h+2,w-4,h-2,wd[2]); R(g,cx-1,yb-h+r*.3,2,h-r*.3,wd[5]);
  for(let l=0;l<2;l++){ const lx=x+3+l*(w/2-2), lw=w/2-4; for(let k=0;k<3;k++){ const ph=(h-r-14)/3, py=yb-h+r+4+k*(ph+3); R(g,lx+3,py,lw-6,ph,wd[3]); R(g,lx+4,py+1,lw-8,ph-2,wd[1]); R(g,lx+6,py+3,lw-12,ph-6,wd[2]); } }
  for(let k=0;k<8;k++) R(g,x+6+((k*7)%(w-12)),yb-h+r+6+((k*13)%(h-r-12)),2,2,'#c8a050');
  R(g,cx-6,yb-h*.42,3,5,'#e8c860'); R(g,cx+3,yb-h*.42,3,5,'#e8c860'); R(g,x+2,yb-6,w-4,6,wd[4]);
  if(hsh(s*9)>.5){ streak(g,x+w*.3,yb-h*.5,18,4,'#5a0e18'); streak(g,x+w*.6,yb-h*.4,12,3,'#5a0e18'); } }
function bulbo(g,cx,yb,r,wl,st){ R(g,cx-r-6,yb-14,2*r+12,14,wl[2]); R(g,cx-r-6,yb-14,2*r+12,2,wl[0]); R(g,cx+r,yb-12,6,12,wl[4]); for(const k of [-1,0,1]) archF(g,cx+k*r*.6-3,yb-11,6,9,'#1a1230');
  R(g,cx-r-8,yb-18,2*r+16,4,st[1]); R(g,cx-r-8,yb-18,2*r+16,1,st[0]);
  const h=Math.round(r*1.9), b=yb-18, HW=t=>r*Math.pow(Math.max(0,Math.sin(Math.PI*Math.min(1,(t+.1)/1.1))),.75)*(1-.3*t);
  for(let dy=0;dy<h;dy++){ const t=dy/h, hw=Math.round(HW(t)); if(hw<1) continue; const y=b-dy;
    R(g,cx-hw-1,y,hw*2+2,1,wl[5]); R(g,cx-hw,y,hw*2,1,wl[2]); R(g,cx-hw,y,Math.round(hw*.5),1,wl[1]); R(g,cx-hw+1,y,Math.max(1,Math.round(hw*.2)),1,wl[0]); R(g,cx+Math.round(hw*.4),y,Math.round(hw*.6),1,wl[3]); R(g,cx+Math.round(hw*.78),y,Math.max(1,Math.round(hw*.22)),1,wl[4]); }
  for(const k of [-.5,0,.5]) for(let dy=3;dy<h-6;dy++){ const t=dy/h; R(g,cx+Math.round(k*HW(t)),b-dy,1,1,wl[3]); }
  const ty=b-h; R(g,cx-1,ty-24,3,26,st[3]); R(g,cx-7,ty-17,15,3,st[3]); R(g,cx-1,ty-24,1,26,st[1]); ell(g,cx,ty-1,4,3,st[2]); }
function piramide(g,cx,yb,w,h,st,wl){ poly(g,[[cx-w/2-2,yb+1],[cx,yb-h-2],[cx+w/2+2,yb+1]],wl[5]); poly(g,[[cx-w/2,yb],[cx,yb-h],[cx,yb]],wl[1]); poly(g,[[cx,yb-h],[cx+w/2,yb],[cx,yb]],wl[3]);
  line(g,cx,yb-h,cx,yb,wl[4]); for(let k=1;k<7;k++){ const f=k/7; R(g,cx-w/2*f,yb-h+h*f,w/2*f,1,mix(wl[1],wl[3],.5)); R(g,cx,yb-h+h*f,w/2*f,1,wl[4]); }
  R(g,cx-w/2-5,yb-2,w+10,5,st[2]); R(g,cx-w/2-5,yb-2,w+10,1,st[0]); ell(g,cx,yb-h-3,3,3,st[1]); R(g,cx-1,yb-h-22,3,19,st[3]); R(g,cx-6,yb-h-16,13,3,st[3]); R(g,cx-1,yb-h-22,1,19,st[1]); }
function lanterna(g,cx,yb,w,wl,st){ R(g,cx-w/2,yb-34,w,34,wl[2]); R(g,cx-w/2,yb-34,4,34,st[2]); R(g,cx+w/2-4,yb-34,4,34,st[3]); archF(g,cx-7,yb-28,14,22,'#140a20');
  R(g,cx-w/2-4,yb-38,w+8,5,st[1]); R(g,cx-w/2-4,yb-38,w+8,1,st[0]); const dh=Math.round(w*.45);
  for(let dy=0;dy<dh;dy++){ const t=dy/dh, hw=Math.round(w/2*Math.sqrt(1-t*t)); R(g,cx-hw,yb-38-dy,hw*2,1,wl[2]); R(g,cx-hw,yb-38-dy,Math.round(hw*.5),1,wl[1]); R(g,cx+Math.round(hw*.5),yb-38-dy,Math.round(hw*.5),1,wl[3]); }
  const ty=yb-38-dh; R(g,cx-1,ty-18,3,18,st[3]); R(g,cx-6,ty-13,13,3,st[3]); R(g,cx-1,ty-18,1,18,st[1]);
  for(const px of [cx-w/2-2,cx+w/2-2]){ ell(g,px+2,yb-44,4,6,st[1]); R(g,px+1,yb-52,2,6,st[1]); } }
function torre(g,tx,ty,yb,tw0,wl,st,cap,s,o={}){
  R(g,tx,ty,tw0,yb-ty,wl[2]); for(let i=0;i<4;i++) blob(g,tx+12+hsh(s+i)*(tw0-44),ty+80+hsh(s*3+i)*Math.max(10,yb-ty-150),18+hsh(i+s)*16,26+hsh(i*2+s)*30,hsh(i*5+s)>.5?wl[1]:wl[3]);
  shade(g,tx,ty,tw0*.35,yb-ty,'#fff4dc',.07); shade(g,tx+tw0*.66,ty,tw0*.34,yb-ty,'#1a0c30',.12);
  if(o.mofo) for(let i=0;i<5;i++) umidade(g,tx+10+hsh(s*7+i)*(tw0-30),ty+20+i*40,14+hsh(i)*14,40+hsh(i*3)*50,wl,s+i);
  R(g,tx,ty,12,yb-ty,st[2]); R(g,tx,ty,2,yb-ty,st[0]); R(g,tx+tw0-12,ty,12,yb-ty,st[3]); R(g,tx+tw0-3,ty,3,yb-ty,st[4]);
  const bh=66, cx=tx+tw0/2; cornice(g,tx-5,ty+bh+8,tw0+10,st,true);
  archF(g,cx-19,ty+14,38,bh-10,st[4]); archF(g,cx-17,ty+16,34,bh-12,'#120a20'); R(g,cx-13,ty+30,26,3,IRON[2]); ell(g,cx,ty+44,9,11,'#7a5a26'); ell(g,cx-2,ty+42,5,6,'#c8a04a'); R(g,cx-10,ty+54,20,2,'#5a4020');
  janela(g,cx-10,ty+bh+46,20,34,{c:wl,sh:rmp(o.shut||'#2f6a4a'),s,st:hsh(s)>.6?'escura':'fechada',arch:true,fr:st});
  if(o.clock){ const cy=ty+bh+130; ell(g,cx,cy,15,15,st[4]); ell(g,cx,cy,13,13,'#ece6d4'); R(g,cx,cy-9,1,9,'#2a1a2a'); R(g,cx,cy-1,6,1,'#2a1a2a'); for(let k=0;k<12;k++){ const a=k/12*Math.PI*2; R(g,cx+Math.cos(a)*10,cy+Math.sin(a)*10,1,1,'#3a2a3a'); } }
  else if(yb-ty>260) janela(g,cx-8,ty+bh+130,16,26,{c:wl,sh:rmp(o.shut||'#2f6a4a'),s:s+3,st:'escura',fr:st});
  cornice(g,tx-5,ty+6,tw0+10,st,true);
  for(const px of [tx+1,tx+tw0-7]){ R(g,px+1,ty-12,4,8,st[3]); ell(g,px+3,ty-16,5,6,st[1]); R(g,px+2,ty-22,2,5,st[1]); }
  if(cap==='piramide') piramide(g,cx,ty-6,tw0-8,Math.round(tw0*.72),st,wl); else if(cap==='baiano') cupulaBaiana(g,cx,ty-6,tw0-4); else if(cap==='bulbo') bulbo(g,cx,ty-6,Math.round(tw0*.27),wl,st); else lanterna(g,cx,ty-6,Math.round(tw0*.5),wl,st);
  for(let i=0;i<3;i++) streak(g,tx+14+hsh(tx+i)*(tw0-28),ty+bh+12,16+hsh(i*tx)*36,3,wl[3]); }
function igreja(g,x,o){
  const yb=o.yb??HB, wl=rmp(o.wall||'#f2ece0'), st=rmp(o.trim||'#b8a888'), w=o.w, tw0=o.tw||100, s=o.seed||7, dw=rmp(o.door||'#2f6a4a');
  const TL=o.towers==='two'||o.towers==='left', TR=o.towers==='two'||o.towers==='right';
  const nx0=x+(TL?tw0:0), nx1=x+w-(TR?tw0:0), nw=nx1-nx0, cx=Math.round((nx0+nx1)/2), nh=o.nh||170, ny=yb-nh, dH=Math.min(o.dH||100,nh-84), fh=o.fh||60;
  R(g,nx0,ny,nw,nh,wl[2]);
  for(let i=0;i<8;i++){ const bw=30+hsh(s+i*3.1)*60, bh=20+hsh(s+i*5.3)*50; blob(g,nx0+hsh(s+i*7.7)*(nw-bw),ny+hsh(s+i*9.9)*(nh-bh),bw,bh,hsh(s+i*2.2)>.55?wl[1]:wl[3]); }
  if(o.mofo) for(let i=0;i<7;i++) umidade(g,nx0+10+hsh(s*5+i)*(nw-50),ny+4+hsh(s*9+i)*30,30+hsh(i+s)*40,60+hsh(i*3+s)*80,wl,s+i*3);
  shade(g,nx0,ny,nw*.35,nh,'#fff4dc',.07); shade(g,nx0+nw*.72,ny,nw*.28,nh,'#1a0c30',.09);
  const pils=nw>300?[nx0,nx0+Math.round(nw*.25)-6,nx1-Math.round(nw*.25)-6,nx1-12]:[nx0,nx1-12];
  for(const px of pils){ R(g,px,ny,12,nh,st[2]); R(g,px,ny,2,nh,st[0]); R(g,px+10,ny,2,nh,st[4]); for(let yy=ny+18;yy<yb-30;yy+=22) R(g,px,yy,12,1,st[3]); R(g,px-3,yb-30,18,30,st[3]); R(g,px-3,yb-30,18,2,st[1]); }
  cornice(g,nx0-6,ny+10,nw+12,st,true);
  frontao(g,nx0-4,nx1+4,ny-2,fh,wl,st,o.front||'voluta',{brasao:o.brasao,oculo:o.oculo,lit:o.lit});
  if(o.sineira){ const bx=cx-16, by=ny-fh-34; R(g,bx,by,32,34,wl[2]); archF(g,bx+6,by+4,20,26,'#120a20'); ell(g,cx,by+20,6,7,'#8a6a2a'); R(g,bx-3,by-4,38,5,st[1]); poly(g,[[bx-2,by-4],[cx,by-18],[bx+34,by-4]],st[2]); }
  // janelas do coro
  const wy=ny+22, ws=nw>300?[-1,0,1]:[0];
  for(const k of ws){ const wx=cx+k*Math.round(nw*.25)-12; if(o.oculo&&k===0&&o.front==='triangulo') continue; janela(g,wx,wy,24,36,{c:wl,sh:rmp(o.shut||'#2f6a4a'),s:s+k,st:k===0&&o.lit?'acesa':'fechada',arch:true,fr:st}); if(nw>260) sacada(g,wx-10,wy+38,44,wl); }
  if(o.galile){ const gx0=nx0+18, gx1=nx1-18, gw=gx1-gx0, gh=112, gy=yb-gh; R(g,gx0,gy,gw,gh,wl[2]); R(g,gx0,gy,gw,4,st[1]); R(g,gx0,gy,gw,1,st[0]); cornice(g,gx0-4,gy+8,gw+8,st,false); shade(g,gx0,gy,gw*.3,gh,'#fff4dc',.06);
    for(let k=0;k<3;k++){ const ax=gx0+Math.round((k+.5)*gw/3), aw=Math.round(gw/3)-34; archF(g,ax-aw/2-6,gy+22,aw+12,gh-22,st[4]); archF(g,ax-aw/2-4,gy+24,aw+8,gh-24,st[2]); archF(g,ax-aw/2,gy+28,aw,gh-28,'#140c22'); R(g,ax-aw/2,yb-18,aw,18,'#1e1630');
      if(k===1){ const dx=ax; archF(g,dx-16,gy+44,32,gh-44,dw[4]); R(g,dx-1,gy+60,2,gh-60,dw[5]); emitW(g,g=>{ R(g,dx-3,gy+56,6,4,'#e8a050'); }); } }
    for(let k=0;k<=3;k++){ const px=gx0+Math.round(k*gw/3)-(k===3?14:k===0?0:7); R(g,px,gy+10,14,gh-10,st[2]); R(g,px,gy+10,2,gh-10,st[0]); R(g,px+12,gy+10,2,gh-10,st[4]); } }
  else { portaIgreja(g,cx,yb,o.dW||54,dH,st,dw,s,o.open); if(nw>300&&!o.oneDoor) for(const k of [-1,1]) portaIgreja(g,cx+k*Math.round(nw*.25),yb,34,74,st,dw,s+k,false); }
  if(TL) torre(g,x,o.ty??ny-34,yb,tw0,wl,st,o.cap,s+1,{shut:o.shut,mofo:o.mofo,clock:o.clock});
  if(TR) torre(g,x+w-tw0,o.ty??ny-34,yb,tw0,wl,st,o.cap,s+2,{shut:o.shut,mofo:o.mofo,clock:o.clock&&!TL});
  R(g,x,yb-12,w,12,st[3]); R(g,x,yb-12,w,2,st[1]); R(g,x,yb-3,w,3,st[5]);
  crack(g,nx0+30+hsh(s)*40,ny+40,18,wl[4],s); crack(g,nx1-50,ny+20,14,wl[4],s+3); if(hsh(s*3)>.3) reboco(g,nx0+nw*.6,ny+nh*.55,32,18,wl,s);
  for(let i=0;i<3;i++) planta(g,nx0+20+i*(nw-40)/2,ny+4,s+i*7);
  if(hsh(s*5)>.4) tag(g,nx0+24,yb-56,s*7);
  if(o.name) placaTur(g,x+w-tw(o.name,1)-30,yb+2,o.name);
}
function morro(g,x0,x1,ytop,s){ const gr=rmp('#3e7a46'), st=rmp('#a8a094');
  poly(g,[[x0-90,HB+2],[x0+30,ytop],[x1-30,ytop],[x1+90,HB+2]],gr[4]);
  for(let y=ytop;y<HB;y+=3){ const f=(y-ytop)/(HB-ytop), xa=x0+30-120*f, xb=x1-30+120*f; for(let xx=Math.floor(xa);xx<xb;xx+=5){ const v=hsh(xx*.31+y*1.7+s); if(v>.62) R(g,xx,y,2,2,v>.92?gr[1]:gr[2]); else if(v<.1) R(g,xx,y,3,1,gr[5]); } }
  R(g,x0+30,ytop,x1-x0-60,2,gr[2]); R(g,x0+30,ytop,x1-x0-60,1,gr[1]);
  R(g,x0-90,HB-10,x1-x0+180,12,st[3]); R(g,x0-90,HB-10,x1-x0+180,2,st[1]); for(let xx=x0-90;xx<x1+90;xx+=24) R(g,xx,HB-8,1,8,st[4]); }
function escadaria(g,cx,w0,w1,ytop,yb){ const st=rmp('#b0a898'), n=Math.max(4,Math.round((yb-ytop)/7)), h=(yb-ytop)/n;
  for(let i=0;i<n;i++){ const y=ytop+i*h, f=i/(n-1), w=w0+(w1-w0)*f; R(g,cx-w/2-3,y,w+6,h+1,st[5]); R(g,cx-w/2,y,w,h,st[3]); R(g,cx-w/2,y,w,2,st[1]); R(g,cx-w/2,y,w,1,st[0]); R(g,cx-w/2,y+h-1,w,1,st[4]);
    for(let k=0;k<w/40;k++) if(hsh(i*7+k)>.7) R(g,cx-w/2+hsh(k+i)*w,y+2,6,1,'#4e6a3a'); }
  for(const sx of [-1,1]) for(let i=0;i<n;i++){ const y=ytop+i*h, f=i/(n-1), w=w0+(w1-w0)*f; R(g,cx+sx*(w/2+2)-(sx<0?6:0),y,6,h+1,st[2]); } }
function cruzeiro(g,x,yb){ const st=rmp('#c8c0b0'); R(g,x-30,yb-14,60,14,st[3]); R(g,x-30,yb-14,60,2,st[1]); R(g,x-22,yb-28,44,14,st[2]); R(g,x-22,yb-28,44,2,st[1]); R(g,x-12,yb-62,24,34,st[2]); R(g,x-12,yb-62,6,34,st[1]); R(g,x+8,yb-62,4,34,st[4]);
  R(g,x-5,yb-160,10,98,st[2]); R(g,x-5,yb-160,3,98,st[1]); R(g,x+3,yb-160,2,98,st[4]); R(g,x-32,yb-136,64,10,st[2]); R(g,x-32,yb-136,64,2,st[0]); R(g,x+28,yb-134,4,8,st[4]); R(g,x-32,yb-128,64,2,st[4]); streak(g,x-2,yb-120,20,3,st[3]); }
function alaConvento(g,x,w,o){ const s=o.seed, c=rmp(o.col||'#f0eadc'), st=rmp(o.trim||'#a8a090'), fl=o.fl||2, gH=104, uH=86, top=HB-gH-(fl-1)*uH, sh=rmp(o.shut||'#2f6a4a');
  telhado(g,x,top-34,w,o.roofH||30,s,o.telha);
  R(g,x,top,w,HB-top,c[2]); for(let i=0;i<Math.round(w/60);i++){ const bw=30+hsh(s+i*3.1)*60, bh=20+hsh(s+i*5.3)*40; blob(g,x+hsh(s+i*7.7)*(w-bw),top+hsh(s+i*9.9)*(HB-top-bh),bw,bh,hsh(s+i*2.2)>.6?c[1]:c[3]); }
  if(o.mofo) for(let i=0;i<w/120;i++) umidade(g,x+10+hsh(s*5+i)*(w-50),top+4,30+hsh(i+s)*40,50+hsh(i*3+s)*60,c,s+i*3);
  shade(g,x,top,w*.3,HB-top,'#fff4dc',.05); shade(g,x+w*.75,top,w*.25,HB-top,'#1a0c30',.07);
  for(const px of [x,x+w-12]){ R(g,px,top,12,HB-top,st[2]); R(g,px,top,2,HB-top,st[0]); R(g,px+10,top,2,HB-top,st[4]); }
  if(fl>1){ const fy=HB-gH; R(g,x-2,fy-6,w+4,7,st[2]); R(g,x-2,fy-6,w+4,1,st[0]); R(g,x-2,fy+1,w+4,2,c[4]); }
  const n=Math.max(2,Math.round(w/(o.step||66))), cxk=k=>x+12+Math.round((k+.5)*(w-24)/n);
  for(let f=1;f<fl;f++){ const y0=HB-gH-f*uH; for(let k=0;k<n;k++){ const v=hsh(s*1.7+f*5.3+k*2.9); janela(g,cxk(k)-12,y0+22,24,uH-44,{c,sh,s:s+f*10+k,st:pick(['fechada','fechada','escura','acesa','fechada','quebrada','fechada'],v),fr:st}); } }
  const dk=o.door??-1; for(let k=0;k<n;k++){ const cx=cxk(k); if(k===dk){ porta(g,cx-18,HB-gH+30,36,gH-44,{c,s:s+k,kind:'madeira',wood:o.shut||'#2f6a4a',transom:true}); continue; }
    janela(g,cx-12,HB-gH+34,24,40,{c,sh,s:s+k+77,st:pick(['fechada','escura','fechada','tabuas'],hsh(s*2.3+k)),fr:st}); for(let b=cx-12;b<cx+12;b+=4) R(g,b,HB-gH+34,1,40,IRON[3]); }
  R(g,x,HB-14,w,14,st[3]); R(g,x,HB-14,w,2,st[1]); R(g,x,HB-3,w,3,st[5]); limo(g,x,HB-14,w,c,s);
  for(let i=0;i<w/90;i++) streak(g,x+10+hsh(s*3+i)*(w-20),top+4,12+hsh(s*i)*30,3,c[3]);
  for(let i=0;i<w/300;i++){ reboco(g,x+30+hsh(s*29+i)*(w-90),top+30+hsh(s*31+i)*60,30,18,c,s+i); }
  beiral(g,x,top,w,c); R(g,x+w,top+6,2,HB-top-6,'#1a1028'); return top; }
function muroAdro(g,x0,x1,h,s){ const c=rmp('#ece6d8'), st=rmp('#a8a090'), y=HB-h; R(g,x0,y,x1-x0,h,c[2]); R(g,x0,y,x1-x0,5,c[1]); R(g,x0,y,x1-x0,1,c[0]); R(g,x0,y+5,x1-x0,2,c[4]); shade(g,x0,y+7,x1-x0,h-7,'#1a0c30',.06);
  for(let x=x0;x<x1;x+=110){ R(g,x,y-8,14,h+8,st[2]); R(g,x,y-8,2,h+8,st[0]); R(g,x+12,y-8,2,h+8,st[4]); ell(g,x+7,y-12,7,5,st[1]); }
  for(let i=0;i<(x1-x0)/80;i++) streak(g,x0+hsh(s+i)*(x1-x0),y+6,8+hsh(i)*10,3,c[3]); limo(g,x0,HB-4,x1-x0,c,s); }
/* ---------- props auxiliares (do kit de Olinda) ---------- */
function recife(g,a,b,base){ for(let k=Math.floor(a/22)-1;k<b/22+1;k++){ const v=hsh(k*3.3+7); if(v<.25) continue; const x=k*22+Math.round(hsh(k*1.7)*8), w=10+Math.round(hsh(k*2.3)*12), h=18+Math.round(Math.pow(hsh(k*4.9),2)*72);
  R(g,x,base-h,w,h,'#2c2650'); R(g,x,base-h,1,h,'#40386c'); R(g,x+w-2,base-h,2,h,'#221c40');
  for(let yy=base-h+3;yy<base-2;yy+=4) for(let xx=x+2;xx<x+w-2;xx+=3) if(hsh(xx*1.3+yy*.7)>.84){ const X=xx, Y=yy; emit(g,g=>R(g,X,Y,1,2,'#f0c070')); }
  if(h>70){ R(g,x+w/2,base-h-8,1,8,'#2c2650'); const X=x+w/2, Y=base-h-9; emit(g,g=>R(g,X,Y,2,2,'#ff3a3a')); } } }
function mureta(g,a,b,y,s){ const c=rmp('#e8e2d4'); R(g,a,y,b-a,HB-y,c[3]); R(g,a,y,b-a,6,c[1]); R(g,a,y,b-a,1,c[0]); R(g,a,y+6,b-a,2,c[4]); shade(g,a,y+8,b-a,HB-y-8,'#1a0c30',.1);
  for(let x=Math.floor(a/130)*130;x<b;x+=130){ R(g,x,y-8,16,HB-y+8,c[2]); R(g,x,y-8,16,2,c[0]); R(g,x+14,y-6,2,HB-y+6,c[4]); }
  for(let x=Math.floor(a/50)*50;x<b;x+=50) if(hsh(x+s)>.6) streak(g,x+hsh(x*3)*30,y+8,6+hsh(x)*8,3,c[4]); limo(g,a,HB-2,b-a,c,s); }
function barracaArt(g,x,yb,col,s,lbl){ const c=rmp(col), wd=rmp('#7a5a3a'), w=150, cx=x+w/2;
  ell(g,cx,yb,w/2+14,6,'rgba(10,6,20,.5)');
  for(const px of [x+4,x+w-8]){ R(g,px,yb-122,4,122,wd[3]); R(g,px,yb-122,1,122,wd[1]); }
  for(let k=0;k<3;k++){ const px=x+10+k*46, ph=34+hsh(s+k)*10, pc=rmp(pick(['#e84a3a','#ffd23f','#3a8ae8','#4ac860','#ff8ad0','#f2f2f2','#8a5ad8'],hsh(s*3+k))); R(g,px,yb-112,30,ph,pc[2]); R(g,px,yb-112,30,2,pc[1]); for(let yy=yb-104;yy<yb-112+ph;yy+=6) R(g,px,yy,30,2,pc[3]); for(let xx=px;xx<px+30;xx+=4) R(g,xx,yb-112+ph,2,4,pc[2]); }
  poly(g,[[x-14,yb-114],[cx,yb-152],[x+w+14,yb-114]],c[5]); poly(g,[[x-12,yb-115],[cx,yb-150],[cx,yb-115]],c[1]); poly(g,[[cx,yb-150],[x+w+12,yb-115],[cx,yb-115]],c[3]); line(g,cx,yb-150,cx,yb-115,c[4]);
  R(g,x-14,yb-116,w+28,10,c[2]); R(g,x-14,yb-116,w+28,2,c[0]); for(let xx=x-14;xx<x+w+14;xx+=8) poly(g,[[xx,yb-106],[xx+8,yb-106],[xx+4,yb-100]],c[3]);
  if(hsh(s)>.45) poly(g,[[cx+10,yb-140],[cx+34,yb-122],[cx+24,yb-116],[cx+16,yb-128]],'#140a1e');
  R(g,x,yb-46,w,6,wd[2]); R(g,x,yb-46,w,1,wd[0]); const tc=rmp(pick(['#e84a3a','#3a8ae8','#ffd23f','#4ac860'],hsh(s*5)));
  R(g,x,yb-40,w,26,tc[2]); for(let xx=x;xx<x+w;xx+=12) R(g,xx,yb-40,6,26,tc[3]); R(g,x,yb-40,w,2,tc[1]); for(const lx of [x+6,x+w-10]) R(g,lx,yb-14,4,14,wd[4]);
  for(let k=0;k<7;k++){ const ix=x+8+k*20, ih=10+Math.round(hsh(s+k)*14), ic=rmp(pick(['#e84a3a','#ffd23f','#3a8ae8','#4ac860','#ff8ad0','#f2f2f2'],hsh(s*3+k*1.7))), by=yb-46;
    if(k%3===0){ R(g,ix,by-ih,14,ih,ic[2]); R(g,ix,by-ih,4,ih,ic[1]); poly(g,[[ix-2,by-ih],[ix+7,by-ih-6],[ix+16,by-ih]],TERRA[2]); R(g,ix+5,by-6,4,6,'#2a1a2a'); }
    else if(k%3===1){ R(g,ix+3,by-ih,9,ih,ic[2]); R(g,ix+3,by-ih,3,ih,ic[1]); ell(g,ix+7,by-ih-4,4,4,'#e0a070'); R(g,ix+4,by-ih-8,7,2,'#2a1a12'); }
    else { const cs=['#e83a3a','#ffd23f','#3a8ae8','#4ac860']; for(let q=0;q<4;q++) poly(g,[[ix+7,by-ih-6],[ix+q*4-1,by-ih+1],[ix+q*4+3,by-ih+1]],cs[q]); R(g,ix+7,by-ih,1,ih,'#2a2030'); } }
  const lx=cx, ly=yb-104; R(g,lx-1,ly-6,2,6,'#2a2030'); emitW(g,g=>{ ell(g,lx,ly+3,4,5,'#ffd890'); R(g,lx-1,ly,1,3,'#ffffff'); }); glow(g,lx,ly+4,60,'#ffb060',.06,4); reg(BULBS,{x:lx/RS,y:(ly+4)/RS,c:'#ffc070'});
  if(lbl){ const lw=tw(lbl,1)+10; R(g,cx-lw/2,yb-136,lw,13,'#f2eee0'); R(g,cx-lw/2,yb-136,lw,1,'#ffffff'); text(g,lbl,cx-lw/2+5,yb-133,1,'#c8283a'); } }
function fitas(g,a,b,y,span,sagv,s){ const cols=['#e83a3a','#ffd23f','#3a8ae8','#4ac860','#ff8ad0','#f2f2f2'];
  for(let x=Math.floor(a/span)*span;x<b;x+=span){ sag(g,x,y,x+span,y,sagv,'#1a1024',1,(px,py,i)=>{ if(i%23===7){ const L=14+hsh(px*.7+s)*30, cc=pick(cols,hsh(px*.31+s)); for(let k=0;k<L;k+=2) R(g,px+Math.round(Math.sin(k*.35+px)*2),py+k,2,2,cc); } }); } }
function bandLine(g,xa,xb,y,sagv,s){ const cols=['#e83a3a','#ffd23f','#3a8ae8','#4ac860','#ff8ad0','#ff8a3a','#ffffff']; sag(g,xa,y,xb,y,sagv,'#1a1024',1,(px,py,i)=>{ if(i%10===4){ const cc=rmp(pick(cols,hsh(px*.37+s))); poly(g,[[px-4,py+1],[px+4,py+1],[px,py+10]],cc[2]); R(g,px-3,py+1,6,1,cc[0]); } }); }
function placaTur(g,x,yb,txt){ const w=tw(txt,1)+14, wd=rmp('#5a3a22'); R(g,x+6,yb-46,3,46,wd[4]); R(g,x+w-9,yb-46,3,46,wd[4]); R(g,x-1,yb-62,w+2,22,'#1a1022'); R(g,x,yb-61,w,20,wd[2]); R(g,x,yb-61,w,2,wd[0]); R(g,x,yb-43,w,2,wd[4]); textSh(g,txt,x+7,yb-55,1,'#f2dca0','#2a160c'); }
function placaRua(g,x,y,txt){ const w=tw(txt,1)+12; R(g,x-1,y-1,w+2,16,'#ece8f0'); R(g,x,y,w,14,'#2a4a9a'); R(g,x,y,w,1,'#6a8ad8'); text(g,txt,x+6,y+4,1,'#f0f0ff'); R(g,x+w/2-1,y+14,2,6,IRON[3]); }
function gramado(g,a,b,y,s){ const gr=rmp('#3e7a46'); R(g,a,y,b-a,HB-y,gr[4]); for(let yy=y;yy<HB;yy+=3) for(let x=Math.floor(a/5)*5;x<b;x+=5){ const v=hsh(x*.31+yy*1.7+s); if(v>.6) R(g,x,yy,2,2,v>.92?gr[1]:gr[2]); }
  R(g,a,y,b-a,2,gr[2]); const st=rmp('#b0a898'); R(g,a,HB-8,b-a,10,st[3]); R(g,a,HB-8,b-a,2,st[1]); for(let x=Math.floor(a/30)*30;x<b;x+=30) R(g,x,HB-6,1,8,st[4]); }
function barrilFogo(g,x,yb,s){ const c=rmp('#5a4a6a'); ell(g,x,yb,26,5,'rgba(10,6,20,.55)'); R(g,x-16,yb-44,32,44,c[5]); R(g,x-15,yb-43,30,42,c[2]); R(g,x-15,yb-43,8,42,c[1]); for(const yy of [yb-36,yb-14]) R(g,x-16,yy,32,3,c[4]); streak(g,x-6,yb-40,16,3,'#8a4a2a');
  emit(g,g=>{ for(let i=0;i<9;i++){ const fx=x-12+i*3, fh=14+hsh(i+s)*26; poly(g,[[fx-4,yb-44],[fx+4,yb-44],[fx+1,yb-44-fh]],i%3?'#ff8a2a':'#ffd23f'); } ell(g,x,yb-46,14,4,'#fff0a0'); });
  glow(g,x,yb-60,110,'#ff8a3a',.08,5); reg(LAMPS,{x:x/RS,y:(yb-60)/RS,r:26,mid:true}); }
function confete(g,a,b,s){ const cols=['#e83a3a','#ffd23f','#3a8ae8','#4ac860','#ff8ad0','#f2f2f2']; for(let k=Math.floor(a/9);k<b/9;k++){ const v=hsh(k*1.31+s); if(v<.55) continue; const x=k*9+v*6, y=ST+hsh(k*2.7+s)*(HH-ST-10); R(g,x,y,2,1+(y>440?1:0),pick(cols,hsh(k*5.1))); } }

/* =====================================================================
   SALVADOR · PALETA, CASARIO E ENCOSTA
   ===================================================================== */
// MAP-17: azul-anil, amarelo-manteiga, rosa-salmão, verde-água (+ variações dos casarões do Pelô)
const SAL=['#2f5fa8','#e8b84a','#d9747a','#5aa88a','#6ab4e0','#f0d070','#e8906a','#8ac8a8','#c8708e','#f2e6c8','#9a84d0','#e2603e','#4a9ad0','#f4c890'];
const SSH=['#2a4a3a','#23413a','#1f3a52','#3a2a24','#2a5a4a','#4a2a2a'];
function casarioSSA(X0,X1,seed,o={}){ let x=X0, i=0; // casarões de 1–3 pavimentos, cunhais e molduras brancas, portas verde-escuras
  while(x<X1-100){ const s=seed+i*13.7+x*.01, w0=Math.round((o.wMin||170)+hsh(s)*(o.wVar||120)), w=X1-x-w0<120?X1-x:Math.min(w0,X1-x), v=hsh(s*2.3), xx=x;
    const p3=o.p3??.3, p2=o.p2??.5, fl=v<p3?3:v<p3+p2?2:1;
    const oo={seed:s,col:pick(o.cols||SAL,hsh(s*7)),fl,roof:hsh(s*3)<(o.plat??.15)?'plat':'beiral',par:pick(['reta','curva','reta'],hsh(s*5)),shut:pick(SSH,hsh(s*2.7)),cunhal:'#f4eee0',
      muxa:fl>=2&&w>180&&hsh(s*11)<(o.muxa??.1),muxaC:pick(['#6a4a2a','#2f4a3a','#5a2a1e'],hsh(s*17)),lamp:hsh(s*13)>.4,dark:o.dark,
      sign:hsh(s*19)<(o.signs??.25)?pick(o.signList||['ATELIE','POUSADA','ARTESANATO','BAR','ACARAJE','GALERIA','MERCEARIA','FARMACIA','RESTAURANTE','CAFE','MUSICA','SEBO'],hsh(s*23)):null};
    if(o.dark) oo.col=mix(oo.col,'#4a5a6a',.38);
    add(xx,xx+w,1,g=>casaOlinda(g,xx,w,oo)); x+=w; i++; } }

/* ---------- encosta entre a Cidade Baixa e a Alta: casario no alto, muro de arrimo de arcos, mato ---------- */
function escarpa(g,a,b,top,s){ const st=rmp('#6e6258'), gr=rmp('#3e6a46');
  for(let k=Math.floor(a/64)-1;k<b/64+1;k++){ const x=k*64+Math.round(hsh(k*1.7+s)*14), w=56+Math.round(hsh(k*3.1+s)*50), h=30+Math.round(hsh(k*5.3+s)*70), c=rmp(mix(pick(SAL,hsh(k*2.9+s)),'#2a3a5a',.45));
    R(g,x,top-h,w,h+4,c[3]); R(g,x,top-h,w,2,c[1]); R(g,x+w-4,top-h,4,h,c[4]);
    if(hsh(k*7.1+s)<.5) poly(g,[[x-4,top-h+1],[x+w+4,top-h+1],[x+w-6,top-h-10],[x+6,top-h-10]],mix(TERRA[3],'#2a2a4a',.4));
    for(let yy=top-h+8;yy<top-6;yy+=14) for(let xx=x+6;xx<x+w-8;xx+=12){ R(g,xx,yy,5,8,c[5]); if(hsh(xx*.37+yy*1.3)>.82){ const X=xx,Y=yy; emit(g,g=>{ R(g,X,Y,5,8,'#f0a858'); R(g,X+1,Y+1,2,3,'#ffe0a0'); }); } } }
  const wy=top, wh=Math.round((HB-top)*.42);
  R(g,a,wy,b-a,wh,st[3]); R(g,a,wy,b-a,3,st[1]); R(g,a,wy,b-a,1,st[0]);
  for(let x=Math.floor(a/56)*56;x<b;x+=56){ archF(g,x+10,wy+12,36,wh-16,st[5]); archF(g,x+12,wy+14,32,wh-18,'#161226'); R(g,x,wy+4,8,wh-4,st[2]); R(g,x,wy+4,2,wh-4,st[1]);
    if(hsh(x*.13+s)>.86){ const X=x; emit(g,g=>archF(g,X+16,wy+24,24,wh-28,'#c87a40')); } }
  for(let yy=wy+6;yy<wy+wh;yy+=7) for(let x=Math.floor(a/18)*18+((yy/7)%2)*9;x<b;x+=18) if(hsh(x*.7+yy)>.7) R(g,x,yy,10,1,st[4]);
  const sy=wy+wh; R(g,a,sy,b-a,HB-sy,gr[4]);
  for(let yy=sy;yy<HB;yy+=3) for(let x=Math.floor(a/6)*6;x<b;x+=6){ const v=hsh(x*.31+yy*1.7+s); if(v>.64) R(g,x,yy,3,2,v>.93?gr[1]:gr[2]); else if(v<.08) R(g,x,yy,4,2,st[3]); }
  for(let k=Math.floor(a/40)-1;k<b/40+1;k++){ const x=k*40+hsh(k+s)*20, y=sy+6+hsh(k*3+s)*(HB-sy-20), r=10+hsh(k*5+s)*14; ell(g,x,y,r,r*.65,gr[3]); ell(g,x-r*.3,y-r*.25,r*.5,r*.32,gr[2]); }
  R(g,a,sy,b-a,2,gr[2]); shade(g,a,sy,b-a,10,'#0a0618',.3); }

/* ---------- Baía de Todos os Santos ---------- */
function baia(g,a,b,s,o={}){ const hz=o.hz||222, cols=['#3a5a7a','#30506e','#284662','#203c56','#1a324a','#152a40'];
  for(let i=0;i<6;i++) R(g,a,hz+(HB-hz)*i/6,b-a,(HB-hz)/6+1,cols[i]);
  for(let y=hz+2;y<HB;y+=2){ const d=(y-hz)/(HB-hz), L=4+d*20; for(let k=Math.floor(a/23)-1;k<b/23+1;k++){ const v=hsh(k*3.7+y*.91); if(v>.6) R(g,k*23+v*16,y,L*(v-.4),1,v>.88?'#8ab4c8':'#4a7890'); } }
  R(g,a,hz,b-a,1,'#7aa0b8');
  if(o.ilha!==false) for(let x=Math.floor(a/4)*4;x<b;x+=4){ const h=Math.round(5+Math.sin(x*.0021+s)*5+Math.sin(x*.0063)*3); if(h>0){ R(g,x,hz-h,4,h,'#22344a'); if(hsh(x*.9)>.97){ const X=x; emit(g,g=>R(g,X,hz-h+1,2,1,'#f0c070')); } } }
  if(o.city) cidadeBaixa(g,a,b,hz+1,s);
  for(let x=Math.floor(a/18)*18;x<b;x+=18) if(hsh(x*.7+s)>.78) reflexo(g,x,hz+8,HB-6,'#5a86a0',6);
  if(o.boats) for(let k=Math.floor(a/420);k<b/420+1;k++){ if(hsh(k*3.1+s)<.5) continue; const bx=k*420+hsh(k)*200, by=hz+18+hsh(k*7)*(HB-hz-50); barquinho(g,bx,by,.6+(by-hz)/(HB-hz)*.6,s+k); } }
function cidadeBaixa(g,a,b,base,s){ // luzes do porto e da Cidade Baixa vistas do alto
  for(let k=Math.floor(a/26)-1;k<b/26+1;k++){ const v=hsh(k*3.3+s); if(v<.2) continue; const x=k*26+Math.round(hsh(k*1.7)*8), w=12+Math.round(hsh(k*2.3)*14), h=10+Math.round(Math.pow(hsh(k*4.9),2)*40);
    R(g,x,base-h,w,h,'#1e3046'); R(g,x,base-h,1,h,'#2e4660');
    for(let yy=base-h+3;yy<base-2;yy+=4) for(let xx=x+2;xx<x+w-2;xx+=3) if(hsh(xx*1.3+yy*.7)>.8){ const X=xx, Y=yy; emit(g,g=>R(g,X,Y,1,2,'#f0c070')); } }
  for(let k=Math.floor(a/300);k<b/300+1;k++){ if(hsh(k*5.1+s)<.5) continue; const x=k*300+hsh(k)*120, h=40+hsh(k*3)*30; R(g,x,base-h,3,h,'#24384e'); line(g,x,base-h,x+50,base-h+4,'#24384e',2); const X=x; emit(g,g=>R(g,X,base-h-2,2,2,'#ff3a3a')); } }
function barquinho(g,x,y,k,s){ const c=rmp(pick(['#e8e4dc','#2f5fa8','#e8b84a','#5aa88a'],hsh(s))), w=50*k, h=10*k;
  poly(g,[[x-w/2,y-h],[x+w/2,y-h-2*k],[x+w/2-6*k,y],[x-w/2+6*k,y]],c[2]); R(g,x-w/2,y-h,w,2,c[0]); R(g,x-w*.2,y-h-12*k,w*.36,12*k,'#e8e4dc'); R(g,x-w*.2,y-h-12*k,w*.36,2,'#2f5fa8');
  R(g,x-1,y-h-30*k,2,18*k,'#3a3448'); reflexo(g,x,y+2,y+20*k,c[3],w*.6); }

/* =====================================================================
   MARCOS DE SALVADOR
   ===================================================================== */
function farolBarra(g,cx,yb,top){ const wh=rmp('#f2f0ea'), bk=rmp('#2a2838'), tw0=38; // torre de faixas preta e branca (Farol da Barra)
  R(g,cx-tw0/2-10,yb-14,tw0+20,14,wh[3]); R(g,cx-tw0/2-10,yb-14,tw0+20,2,wh[1]);
  const n=4, bh=(yb-14-top)/n; for(let k=0;k<n;k++){ const y=yb-14-(k+1)*bh, c=k%2?bk:wh; R(g,cx-tw0/2,y,tw0,bh+1,c[2]); R(g,cx-tw0/2,y,tw0*.3,bh+1,c[1]); R(g,cx+tw0*.2,y,tw0*.3,bh+1,c[3]); R(g,cx-tw0/2,y,2,bh+1,c[0]); }
  for(let k=1;k<n;k++) R(g,cx-tw0/2-1,yb-14-k*bh,tw0+2,1,'#141020');
  R(g,cx-4,yb-14-bh*1.6,8,12,'#1a1428');
  R(g,cx-tw0/2-8,top-6,tw0+16,6,bk[1]); for(let xx=cx-tw0/2-6;xx<cx+tw0/2+8;xx+=4) R(g,xx,top-16,1,10,bk[2]); R(g,cx-tw0/2-8,top-17,tw0+16,2,bk[1]);
  R(g,cx-12,top-36,24,20,bk[3]); emit(g,g=>{ R(g,cx-9,top-33,18,15,'#fff2c0'); R(g,cx-7,top-31,5,11,'#ffffff'); }); for(const px of [cx-4,cx+4]) R(g,px,top-36,1,20,bk[4]);
  poly(g,[[cx-15,top-36],[cx,top-52],[cx+15,top-36]],bk[2]); poly(g,[[cx,top-52],[cx+15,top-36],[cx,top-36]],bk[4]); R(g,cx-1,top-60,2,8,bk[1]);
  glow(g,cx,top-26,70,'#fff0b0',.07,5); reg(BEACONS,{x:cx/RS,y:(top-26)/RS,len:1100,ph:0}); }
function forteBarra(g,x,w){ const st=rmp('#7e6e5c'), wl=rmp('#f2eee4'), fy=HB-70; // Forte de Santo Antônio da Barra
  poly(g,[[x-30,HB],[x,fy],[x+w,fy],[x+w+30,HB]],st[5]); poly(g,[[x-28,HB],[x+2,fy+2],[x+w-2,fy+2],[x+w+28,HB]],st[2]);
  for(let yy=fy+6;yy<HB;yy+=8){ const f=(yy-fy)/(HB-fy), xa=x+2-30*f, xb=x+w-2+30*f; for(let xx=xa+((yy/8)%2)*11;xx<xb-8;xx+=22){ const v=hsh(xx*.3+yy); R(g,xx,yy,20,7,v>.7?st[1]:v<.25?st[3]:st[2]); R(g,xx,yy+6,20,1,st[4]); } }
  R(g,x,fy,w,6,st[1]); R(g,x,fy,w,1,st[0]); shade(g,x-30,fy,w*.3,HB-fy,'#fff0d0',.05); shade(g,x+w*.7,fy,w*.3+30,HB-fy,'#100624',.12);
  const hx=x+80, hw=w-160, hh=50, hy=fy-hh; telhado(g,hx,hy,hw,18,77,'#b4562c'); R(g,hx,hy,hw,hh,wl[2]); R(g,hx,hy,hw,3,wl[0]); R(g,hx+hw-14,hy,14,hh,wl[3]); shade(g,hx,hy,hw*.3,hh,'#fff4dc',.06);
  for(let px=hx+30;px<hx+hw-30;px+=70){ R(g,px,hy+14,16,20,'#1a1430'); R(g,px-2,hy+12,20,3,st[1]); if(hsh(px)>.7){ const X=px; emit(g,g=>R(g,X+2,hy+16,12,16,'#e8a050')); } }
  for(let i=0;i<4;i++) umidade(g,hx+20+hsh(i*3.3)*(hw-60),hy+4,20+hsh(i)*30,30+hsh(i*5)*20,wl,77+i);
  for(const gx of [x+6,x+w-38]){ R(g,gx,fy-30,32,32,wl[2]); R(g,gx+24,fy-30,8,32,wl[3]); ell(g,gx+16,fy-32,18,9,wl[1]); ell(g,gx+12,fy-35,8,4,wl[0]); R(g,gx+12,fy-22,8,12,'#1a1428'); R(g,gx+15,fy-46,2,8,wl[3]); }
  const gx=x+w*.36; R(g,gx-34,fy-12,68,HB-fy+12,st[3]); R(g,gx-34,fy-12,68,2,st[1]); archF(g,gx-20,fy+16,40,HB-fy-16,'#120a1c'); R(g,gx-38,fy-16,76,6,st[1]);
  ell(g,gx,fy+2,12,12,st[1]); ell(g,gx,fy+2,8,9,'#c8a04a'); R(g,gx-1,fy-4,2,12,st[4]); tag(g,x+w*.6,fy+30,903);
  farolBarra(g,x+w*.58,hy-2,70); placaTur(g,x+w-tw('FAROL DA BARRA',1)-40,HB+2,'FAROL DA BARRA'); }

function predioModerno(g,x,w,s){ const c=rmp('#a8a4b0'), top=14; // prédio de escritórios de pano de vidro (Comércio)
  R(g,x,top,w,HB-top,c[3]); R(g,x,top,w,3,c[1]); R(g,x+w-10,top,10,HB-top,c[4]); shade(g,x,top,w*.25,HB-top,'#fff0d0',.05);
  for(let yy=top+10;yy<HB-80;yy+=22){ R(g,x+6,yy+16,w-16,4,c[2]); R(g,x+6,yy+16,w-16,1,c[0]);
    for(let xx=x+10;xx<x+w-24;xx+=18){ const v=hsh(xx*.31+yy*1.7+s); R(g,xx,yy,14,15,v>.86?'#0e0a18':GLASS[2]); R(g,xx,yy,14,3,GLASS[1]);
      if(v>.94){ const X=xx,Y=yy; emit(g,g=>R(g,X+1,Y+1,12,13,'#e8b060')); } else if(v<.1){ R(g,xx+3,yy+4,7,7,'#0e0a18'); line(g,xx,yy,xx+14,yy+15,GLASS[0]); } } }
  R(g,x,HB-80,w,80,c[4]); R(g,x,HB-80,w,4,c[1]); for(let xx=x+20;xx<x+w-80;xx+=100) porta(g,xx,HB-64,64,64,{c,s:s+xx,kind:'aco',transom:false});
  for(let i=0;i<8;i++) streak(g,x+10+hsh(s+i)*(w-20),top+20+hsh(i)*180,20+hsh(i*3)*40,3,c[4]); tag(g,x+40,HB-120,s); placa(g,x+w/2-tw('ESCRITORIOS',1)/2-6,HB-100,'ESCRITORIOS','#2a2a4a','#e8e0d0',1); }
function estacao(g,x,w,h,col,label){ const c=rmp(col), top=HB-h; // estação Art Déco (Plano Inclinado)
  R(g,x,top,w,h,c[2]); shade(g,x,top,w*.3,h,'#fff0d0',.06); R(g,x+w-10,top,10,h,c[3]);
  for(let k=0;k<3;k++){ const px=x+10+k*(w-28)/2; R(g,px,top-12,8,h+12,c[1]); R(g,px,top-12,2,h+12,c[0]); R(g,px+6,top-12,2,h+12,c[4]); }
  R(g,x-4,top-8,w+8,8,c[1]); R(g,x-4,top-8,w+8,1,c[0]); R(g,x+w*.3,top-22,w*.4,14,c[2]); R(g,x+w*.3,top-22,w*.4,2,c[0]);
  R(g,x+w*.2,HB-74,w*.6,74,'#140c1e'); const X=x; emit(g,g=>{ R(g,X+w*.22,HB-70,w*.56,44,'#c8803e'); R(g,X+w*.3,HB-64,w*.2,22,'#f0b860'); }); glow(g,x+w/2,HB-50,w*.7,'#ffb060',.05,3);
  reg(WINDOWS,{x:(x+w*.22)/RS,y:(HB-70)/RS,w:(w*.56)/RS,h:44/RS,lit:true,warm:true});
  if(label) placa(g,x+w/2-tw(label,1)/2-6,top+12,label,'#2a3a6a','#f0e8d0',1); streak(g,x+w*.7,top+4,30,3,c[3]); }
function planoInclinado(g,x,w,top){ // trilho em rampa da Cidade Baixa (esq.) à Alta (dir.), cabine parada no meio, cipós
  const y0=HB-8, y1=top+8, slope=(y1-y0)/w, Y=px=>y0+(px-x)*slope, cn=rmp('#a8a094'), ir=IRON;
  for(let px=x+60;px<x+w-20;px+=90){ const py=Y(px); R(g,px-8,py+12,16,HB-py-12,cn[4]); R(g,px-6,py+12,12,HB-py-12,cn[2]); R(g,px-6,py+12,3,HB-py-12,cn[1]); }
  poly(g,[[x,y0],[x+w,y1],[x+w,y1+20],[x,y0+20]],cn[4]); poly(g,[[x,y0],[x+w,y1],[x+w,y1+13],[x,y0+13]],cn[2]); line(g,x,y0,x+w,y1,cn[0],2);
  for(let px=x;px<x+w;px+=26){ const py=Y(px)+22; R(g,px,py,26,5,cn[3]); R(g,px,py,26,1,cn[1]); }
  for(let px=x;px<x+w;px+=10){ const py=Y(px); R(g,px,py-4,6,4,WOODR[3]); R(g,px,py-4,6,1,WOODR[1]); }
  line(g,x,y0-7,x+w,y1-7,ir[1],2); line(g,x,y0-3,x+w,y1-3,ir[2],2);
  for(let px=x+40;px<x+w;px+=160){ const py=Y(px); R(g,px,py-60,4,60,ir[3]); R(g,px,py-60,1,60,ir[1]); }
  line(g,x+40,Y(x+40)-58,x+w,y1-58,'#1a1428',1);
  const gr=rmp('#3e7a46'); for(let i=0;i<30;i++){ const px=x+hsh(i*3.3)*w, py=Y(px); blob(g,px-6,py-8,10+hsh(i)*16,6+hsh(i*2)*5,hsh(i*5)>.5?gr[2]:gr[3]); if(hsh(i*7)>.5) for(let k=0;k<10+hsh(i)*20;k+=2) R(g,px+Math.sin(k*.4)*2,py+k,2,2,gr[3]); }
  const cx=x+w*.48, cw=150, ch=76, P=(u,v)=>[cx+u,Y(cx+u)-10-v], body=rmp('#e8c040'), bl=rmp('#2f5fa8');
  poly(g,[P(-cw/2-3,-3),P(cw/2+3,-3),P(cw/2+3,ch+3),P(-cw/2-3,ch+3)],'#140c1e');
  poly(g,[P(-cw/2,0),P(cw/2,0),P(cw/2,ch),P(-cw/2,ch)],body[2]); poly(g,[P(-cw/2,0),P(cw/2,0),P(cw/2,12),P(-cw/2,12)],bl[2]); poly(g,[P(-cw/2,ch-8),P(cw/2,ch-8),P(cw/2,ch),P(-cw/2,ch)],body[1]);
  poly(g,[P(-cw/2,0),P(-cw/2+5,0),P(-cw/2+5,ch),P(-cw/2,ch)],body[0]); poly(g,[P(cw/2-6,0),P(cw/2,0),P(cw/2,ch),P(cw/2-6,ch)],body[4]);
  for(let k=0;k<4;k++){ const u0=-cw/2+10+k*35; poly(g,[P(u0,22),P(u0+26,22),P(u0+26,ch-14),P(u0,ch-14)],k===1?'#1a1430':GLASS[2]); if(k!==1) poly(g,[P(u0,ch-34),P(u0+10,ch-14),P(u0,ch-14)],GLASS[1]);
    if(k===2){ const q=[P(u0+2,24),P(u0+24,24),P(u0+24,ch-16),P(u0+2,ch-16)]; emit(g,g=>poly(g,q,'#d8903e')); } }
  for(const u of [-cw/2+12,cw/2-28]) poly(g,[P(u,-2),P(u+16,-2),P(u+16,-12),P(u,-12)],'#2a2030');
  const [lx,ly]=P(0,ch*.6); glow(g,lx,ly,70,'#ffb060',.05,3); tag(g,P(-30,30)[0],P(-30,30)[1],411); }

function mercadoModelo(g,x,w){ const c=rmp('#ecc860'), wt=rmp('#f4f0e6'), st=rmp('#a8a094'), s=303, top=HB-200, mid=HB-100, pk=top-74; // Mercado Modelo
  R(g,x,top,w,HB-top,c[2]); for(let i=0;i<12;i++){ const bw=40+hsh(s+i)*80, bh=20+hsh(s*3+i)*40; blob(g,x+hsh(s*5+i)*(w-bw),top+hsh(s*7+i)*(HB-top-bh),bw,bh,hsh(s+i*2)>.5?c[1]:c[3]); }
  shade(g,x,top,w*.3,HB-top,'#fff0d0',.06); shade(g,x+w*.75,top,w*.25,HB-top,'#1a0c30',.08);
  for(let yy=mid+8;yy<HB-14;yy+=10){ R(g,x,yy,w,1,c[4]); for(let xx=x+((yy/10)%2)*20;xx<x+w;xx+=40) R(g,xx,yy,1,10,c[3]); }
  R(g,x,HB-14,w,14,'#5a6080'); R(g,x,HB-14,w,2,'#8a90b0');
  R(g,x-2,mid,w+4,8,wt[2]); R(g,x-2,mid,w+4,2,wt[0]); R(g,x-2,mid+8,w+4,2,c[4]);
  cornice(g,x-6,top+8,w+12,wt,true);
  poly(g,[[x-16,top-2],[x+w/2,pk-8],[x+w+16,top-2]],wt[4]); poly(g,[[x-8,top-4],[x+w/2,pk],[x+w+8,top-4]],c[2]); shade(g,x,pk,w*.4,top-pk,'#fff0d0',.05);
  line(g,x-12,top-3,x+w/2,pk-5,wt[1],4); line(g,x+w/2,pk-5,x+w+12,top-3,wt[2],4); line(g,x-12,top-3,x+w/2,pk-5,wt[0],1);
  const ox=x+w*.42, oy=top-40; ell(g,ox,oy,26,22,wt[3]); ell(g,ox,oy,22,18,wt[1]); ell(g,ox,oy,17,14,c[2]); ell(g,ox,oy,7,8,'#e8e4dc'); R(g,ox-4,oy-4,8,9,'#3a6a4a');
  line(g,ox+24,oy-10,x+w*.7,oy+2,wt[1],3); line(g,ox+24,oy+12,x+w*.7,oy+2,wt[1],3);
  const t='MERCADO MODELO'; textSh(g,t,x+w/2-tw(t,2)/2,top-17,2,'#24283a',c[4]);
  R(g,ox-1,oy-60,2,60,'#c8c8d0'); // mastro vazio
  const n=Math.max(4,Math.round(w/170));
  for(let k=0;k<n;k++){ const cx=Math.round(x+(k+.5)*w/n);
    const wy=top+28, ww=34, wh=48; R(g,cx-ww/2-8,wy-10,ww+16,6,st[1]); R(g,cx-ww/2-5,wy-4,ww+10,wh+8,st[2]); R(g,cx-ww/2,wy,ww,wh,'#141020');
    const lit=hsh(s+k)>.7; for(let yy=wy+2;yy<wy+wh;yy+=5) for(let xx=cx-ww/2+((yy/5)%2)*2;xx<cx+ww/2;xx+=5) R(g,xx,yy,1,1,'#3a5a4a');
    if(lit){ const X=cx; emit(g,g=>{ for(let yy=wy+2;yy<wy+wh;yy+=5) for(let xx=X-ww/2+((yy/5)%2)*2;xx<X+ww/2;xx+=5) R(g,xx,yy,2,2,'#e8a050'); }); }
    R(g,cx-ww/2-8,wy+wh+4,ww+16,4,st[1]);
    const arch=k===0||k===n-1, dw=arch?56:46, dy=mid+26, dh=HB-14-dy;
    if(arch){ archF(g,cx-dw/2-8,dy-8,dw+16,dh+8,st[3]); archF(g,cx-dw/2-6,dy-6,dw+12,dh+6,st[2]); archF(g,cx-dw/2,dy,dw,dh,'#120a1c'); }
    else { R(g,cx-dw/2-7,dy-8,dw+14,dh+8,st[3]); R(g,cx-dw/2-5,dy-6,dw+10,dh+6,st[2]); R(g,cx-dw/2,dy,dw,dh,'#120a1c'); }
    if(k%2===0||arch){ const X=cx, o0=arch?dw/2:4; emit(g,g=>{ R(g,X-dw/2+3,dy+o0,dw-6,dh-o0,'#9a5030'); R(g,X-dw/2+6,dy+8+o0,dw-12,dh*.4,'#e09048');
        const cs=['#e83a3a','#ffd23f','#3a8ae8','#4ac860','#ff8ad0','#f2f2f2']; for(let q=0;q<6;q++) R(g,X-dw/2+6+q*((dw-12)/6),dy+12+o0,3,14+hsh(q+X)*12,cs[q]); for(let q=0;q<3;q++) ell(g,X-dw/2+12+q*12,HB-28,5,8,'#c86a3a'); });
      glow(g,cx,HB-50,60,'#ffa040',.05,3); reg(WINDOWS,{x:(cx-dw/2+3)/RS,y:(dy+o0)/RS,w:(dw-6)/RS,h:(dh-o0)/RS,lit:true,warm:true}); }
    else { R(g,cx-dw/2+2,dy+2,dw-4,dh-2,'#1c1430'); for(let yy=dy+3;yy<HB-16;yy+=4) R(g,cx-dw/2+2,yy,dw-4,1,METAL[3]); R(g,cx-dw/2+2,dy+2,dw-4,2,METAL[1]); } }
  for(const [qx,side] of [[x-4,0],[x+w-18,1]]) for(let yy=top;yy<HB-14;yy+=14){ const ww=((yy-top)/14)%2?22:16, px=side?qx+22-ww:qx; R(g,px,yy,ww,13,st[2]); R(g,px,yy,ww,1,st[1]); R(g,px,yy+12,ww,1,st[4]); }
  for(let i=0;i<7;i++) streak(g,x+20+hsh(s*3+i)*(w-40),top+10,14+hsh(i)*30,3,c[3]); for(let i=0;i<3;i++) reboco(g,x+60+hsh(s*29+i)*(w-160),top+20+hsh(i)*40,30,14,c,s+i);
  pixo(g,x+w*.62,HB-18,s,'#1a1020'); tag(g,x+w*.18,mid+40,s*7); limo(g,x,HB-14,w,c,s); }

function elevadorTorre(g,x,top,yb,k){ k=k||1; const c=rmp('#e8dcb0'), w=Math.round(78*k), cx=x+w/2, sh=top+40*k; // torre Art Déco do Elevador Lacerda
  R(g,x,sh,w,yb-sh,c[2]); R(g,x,sh,w*.3,yb-sh,c[1]); R(g,x+w*.72,sh,w*.28,yb-sh,c[3]);
  for(let i=1;i<6;i++){ const px=x+Math.round(i*w/6); R(g,px-1,sh+10*k,2,yb-sh-10*k,c[4]); R(g,px+1,sh+10*k,1,yb-sh-10*k,c[1]); }
  for(let yy=sh+40*k;yy<yb-10;yy+=Math.round(46*k)) for(let i=0;i<3;i++){ const px=x+Math.round((i+.5)*w/3)-2; R(g,px,yy,Math.max(2,4*k),12*k,'#1a1630'); if(hsh(px*.37+yy)>.45){ const X=px,Y=yy; emitW(g,g=>R(g,X,Y,Math.max(2,4*k),12*k,'#f0b060')); } }
  emitW(g,g=>{ g.save(); g.globalAlpha=.5; R(g,x,sh,1,yb-sh,'#b0c4ff'); R(g,x,sh,w,1,'#c4d4ff'); g.restore(); }); glow(g,cx,yb-40,w*.7,'#ffb460',.05,4,140);
  const hw=Math.round(124*k), hx=cx-hw/2; R(g,hx,top+8*k,hw,32*k,c[4]); R(g,hx+2,top+11*k,hw-4,26*k,'#24304a');
  for(let px=hx+6;px<hx+hw-6;px+=Math.round(14*k)){ R(g,px,top+11*k,2,26*k,c[2]); if(hsh(px*.7)>.6){ const X=px; emit(g,g=>R(g,X+3,top+15*k,8*k,18*k,'#e8b060')); } }
  R(g,hx-4,top+6*k,hw+8,4*k,c[1]); R(g,hx-4,top+6*k,hw+8,1,c[0]); R(g,hx-4,top+40*k,hw+8,4*k,c[1]);
  R(g,cx-w*.35,top-30*k,w*.7,38*k,c[2]); R(g,cx-w*.35,top-30*k,w*.2,38*k,c[1]); R(g,cx-w*.22,top-48*k,w*.44,20*k,c[2]); R(g,cx-w*.22,top-48*k,w*.44,2,c[0]); R(g,cx-1,top-80*k,2,34*k,'#3a3448');
  for(let i=0;i<4;i++) R(g,cx-w*.3+i*w*.2,top-26*k,2,30*k,c[4]);
  emit(g,g=>R(g,cx-2,top-82*k,4,4,'#ff3a3a')); glow(g,cx,top-80*k,24,'#ff3a3a',.08,3);
  for(let i=0;i<4;i++) streak(g,x+6+hsh(i+x)*(w-12),sh+20+hsh(i*3)*80,20+hsh(i*7)*40,3,c[3]); }
// volume Art Déco: bloco com face frontal (luz da lua à esquerda), face lateral em sombra, aresta de recorte fria e sombra projetada
function decoBloco(g,x,y,w,h,c,side){ side=side||6; R(g,x,y,w,h,c[2]); R(g,x,y,Math.round(w*.18),h,c[1]); R(g,x+w-side,y,side,h,c[4]); R(g,x+w-side,y,1,h,c[5]);
  R(g,x,y,w,2,c[0]); R(g,x,y+h-2,w,2,c[3]); shade(g,x+w,y+4,8,h-4,'#0e0626',.35);
  emitW(g,g=>{ g.save(); g.globalAlpha=.5; R(g,x,y,w-side,1,'#c4d4ff'); R(g,x,y,1,h,'#a8bcff'); g.restore(); }); }
function decoFriso(g,x,y,w,c){ // friso de ziguezague em relevo + régua de dentículos
  R(g,x,y,w,12,c[3]); R(g,x,y,w,1,c[0]); R(g,x,y+11,w,1,c[5]);
  for(let px=x;px<x+w-8;px+=10){ poly(g,[[px,y+10],[px+5,y+2],[px+10,y+10]],c[1]); poly(g,[[px+5,y+2],[px+10,y+10],[px+7,y+10]],c[4]); R(g,px+4,y+2,2,1,c[0]); }
  for(let px=x+2;px<x+w-3;px+=6){ R(g,px,y+13,3,3,c[2]); R(g,px,y+16,3,1,c[5]); } shade(g,x,y+16,w,6,'#0e0626',.3); }
function cabecaElevador(g,x,w,open){ const c=rmp('#e4c486'), top=HB-190, s=505; // edifício de chegada das cabines na Praça Tomé de Sousa (Art Déco, 1930)
  const cx=x+w/2, GL=['#2a3a66','#1e2a50','#151c3a'];
  // corpo + pavilhões de canto e torreão central escalonado
  R(g,x,top,w,HB-top,c[2]); R(g,x,top,w,HB-top,c[2]); shade(g,x+w*.62,top,w*.38,HB-top,'#1a0c40',.16);
  decoBloco(g,x-8,top-34,74,HB-top+34,c,8); decoBloco(g,x+w-66,top-34,74,HB-top+34,c,10);
  for(const [px,ww] of [[x-8,74],[x+w-66,74]]){ for(let i=0;i<3;i++){ const lx=px+14+i*18; R(g,lx,top-22,8,HB-top-10,c[4]); R(g,lx+1,top-22,6,HB-top-10,'#2a2440'); R(g,lx,top-22,8,1,c[0]);
      emitW(g,g=>{ for(let yy=top-18;yy<HB-48;yy+=18) if(hsh(lx*.3+yy)>.45){ R(g,lx+1,yy,6,12,'#f2b060'); R(g,lx+1,yy,6,2,'#ffe4a8'); } }); }
    R(g,px+4,top-42,ww-8,8,c[1]); R(g,px+4,top-42,ww-8,1,c[0]); R(g,px+14,top-50,ww-28,8,c[2]); R(g,px+14,top-50,ww-28,1,c[0]); }
  const tw0=Math.round(w*.36), tx=cx-tw0/2;
  decoBloco(g,tx,top-46,tw0,46,c,10); decoBloco(g,tx+tw0*.14,top-72,tw0*.72,28,c,8); decoBloco(g,tx+tw0*.3,top-92,tw0*.4,22,c,6);
  for(let i=0;i<5;i++){ const fx=tx+tw0*.18+i*tw0*.16; R(g,fx,top-70,4,24,c[4]); R(g,fx,top-70,1,24,c[0]); }
  R(g,cx-1,top-124,3,34,'#3a3448'); R(g,cx-1,top-124,1,34,'#7a7090'); emit(g,g=>R(g,cx-2,top-127,5,5,'#ff3a3a')); glow(g,cx,top-125,26,'#ff3a3a',.1,3);
  // letreiro retroiluminado
  const t='ELEVADOR LACERDA', ls=2, lw=tw(t,ls); R(g,cx-lw/2-10,top-42,lw+20,24,'#1a1428'); R(g,cx-lw/2-8,top-40,lw+16,20,'#2a2034'); R(g,cx-lw/2-10,top-42,lw+20,1,c[0]);
  text(g,t,cx-lw/2+1,top-36,ls,RL==='dia'?'#d8c49a':'#3a2a20'); emitW(g,g=>{ text(g,t,cx-lw/2,top-37,ls,'#ffe2a0'); }); glow(g,cx,top-30,lw*.6,'#ffc070',.07,3,18);
  // platibanda + cornija com dentículos
  R(g,x+60,top-10,w-120,12,c[1]); R(g,x+60,top-10,w-120,1,c[0]); R(g,x+60,top+2,w-120,2,c[4]); for(let px=x+64;px<x+w-64;px+=8){ R(g,px,top+4,4,4,c[3]); R(g,px,top+8,4,1,c[5]); } shade(g,x+60,top+9,w-120,8,'#0e0626',.35);
  // faixa de janelas verticais entre aletas (algumas acesas)
  const BW=46; for(let px=x+72;px+BW<=x+w-66;px+=BW){ const wx=px+8, ww=BW-16;
    R(g,wx-2,top+14,ww+4,34,c[4]); R(g,wx,top+16,ww,30,GL[1]); R(g,wx,top+16,ww,8,GL[0]); R(g,wx+ww/2-1,top+16,2,30,c[3]); R(g,wx,top+30,ww,2,c[3]);
    poly(g,[[wx+2,top+44],[wx+10,top+18],[wx+13,top+18],[wx+5,top+44]],'#3a4c80');
    const lit=hsh(px*.13+s)>.5; if(lit){ const X=wx; emitW(g,g=>{ R(g,X,top+16,ww,30,'#e8a050'); R(g,X,top+16,ww,8,'#ffd890'); R(g,X+ww/2-1,top+16,2,30,'#7a4a2a'); R(g,X,top+30,ww,2,'#7a4a2a'); R(g,X+3,top+34,6,12,'#5a3020'); }); reg(WINDOWS,{x:wx/RS,y:(top+16)/RS,w:ww/RS,h:30/RS,lit:true,warm:true}); }
    R(g,wx-2,top+48,ww+4,3,c[1]); R(g,wx-2,top+51,ww+4,1,c[5]);
    // aleta (pilastra-lâmina) com 3 tons e sombra projetada à direita
    const fx=px+BW-4; R(g,fx-1,top-4,8,HB-top-26,c[5]); R(g,fx,top-4,6,HB-top-26,c[2]); R(g,fx,top-4,2,HB-top-26,c[0]); R(g,fx+5,top-4,1,HB-top-26,c[4]); shade(g,fx+7,top+2,6,HB-top-32,'#0e0626',.3);
    R(g,fx-2,top-8,10,4,c[1]); R(g,fx-2,top-8,10,1,c[0]); }
  decoFriso(g,x+66,top+54,w-132,c);
  // caneluras da parede de baixo + embasamento de granito
  for(let px=x+70;px<x+w-66;px+=12){ R(g,px,top+76,2,HB-top-108,c[3]); R(g,px+2,top+76,1,HB-top-108,c[1]); }
  R(g,x,HB-30,w,30,c[4]); R(g,x,HB-30,w,3,c[1]); R(g,x,HB-27,w,1,c[0]); for(let px=x+4;px<x+w;px+=40) R(g,px,HB-27,1,27,c[5]); R(g,x,HB-14,w,1,c[5]);
  const nd=Math.max(2,Math.floor(w/150)); for(let k=0;k<nd;k++){ const dx=x+Math.round((k+.5)*w/nd), dw=72, dh=112, dy=HB-dh;
    // portal escalonado Art Déco
    R(g,dx-dw/2-18,dy-24,dw+36,dh+24,c[1]); R(g,dx-dw/2-18,dy-24,dw+36,2,c[0]); R(g,dx+dw/2+12,dy-24,6,dh+24,c[4]); R(g,dx-dw/2-13,dy-19,dw+26,dh+19,c[3]); R(g,dx-dw/2-13,dy-19,dw+26,1,c[5]);
    for(const sx of [-1,1]){ R(g,dx+sx*(dw/2+15)-2,dy-34,4,10,c[1]); R(g,dx+sx*(dw/2+15)-2,dy-34,4,1,c[0]); }
    R(g,dx-dw/2-9,dy-16,dw+18,dh+16,c[4]); R(g,dx-dw/2-6,dy-12,dw+12,dh+12,METAL[2]); R(g,dx-dw/2-6,dy-12,dw+12,2,METAL[0]); R(g,dx-dw/2,dy,dw,dh,'#100a1a');
    if(open||k===0){ const X=dx; emit(g,g=>{ R(g,X-dw/2+10,dy+4,dw-20,dh-4,'#c88a48'); R(g,X-dw/2+14,dy+8,dw-28,18,'#ffe0a0'); R(g,X-dw/2+10,HB-18,dw-20,18,'#7a4a2a'); R(g,X-6,dy+40,12,30,'#5a2a1a'); });
      glow(g,dx,dy+50,90,'#ffb060',.06,4); reg(WINDOWS,{x:(dx-dw/2+10)/RS,y:(dy+4)/RS,w:(dw-20)/RS,h:(dh-4)/RS,lit:true,warm:true}); R(g,dx-dw/2,dy,10,dh,METAL[1]); R(g,dx+dw/2-10,dy,10,dh,METAL[3]); }
    else { R(g,dx-dw/2,dy,dw/2-1,dh,METAL[2]); R(g,dx+1,dy,dw/2-1,dh,METAL[3]); R(g,dx-dw/2,dy,2,dh,METAL[0]); for(let yy=dy+10;yy<HB;yy+=14) R(g,dx-dw/2+4,yy,dw-8,1,METAL[4]); poly(g,[[dx-10,dy+30],[dx+8,dy+44],[dx-2,dy+60]],'#2a1a2a'); }
    R(g,dx-14,dy-11,28,8,'#1a1428'); emit(g,g=>text(g,k%2?'2':'1',dx-2,dy-10,1,'#ff5a3a')); }
  for(let i=0;i<5;i++) streak(g,x+80+hsh(s+i)*(w-160),top+56,16+hsh(i*3)*30,3,c[3]); tag(g,x+90,HB-70,s); pixo(g,x+w*.55,HB-12,s*3,'#1a1020');
  // refletores no embasamento lavando a fachada de baixo pra cima (luz quente) + reflexo frio da lua no topo
  for(let k=0;k<=nd;k++){ const ux=x+Math.round(k*w/nd); if(ux<x+30||ux>x+w-30) continue; R(g,ux-5,HB-8,10,6,'#2a2438'); emitW(g,g=>R(g,ux-3,HB-8,6,2,'#fff0c0')); glow(g,ux,HB-60,50,'#ffb460',.085,5,120); }
  for(const ux of [x+29,x+w-29]) glow(g,ux,HB-90,40,'#ffb460',.07,4,130);
  glow(g,cx,top-70,tw0*.5,'#6a8aff',.035,3,40); }
function porticoCabos(g,x,w,s){ const ir=rmp('#4a4e62'), top=60; // pórtico de aço com os cabos das cabines
  for(const px of [x,x+w-14]){ R(g,px,top,14,HB-top,ir[4]); R(g,px+2,top,10,HB-top,ir[2]); R(g,px+2,top,3,HB-top,ir[1]); for(let yy=top+10;yy<HB-10;yy+=24) line(g,px,yy,px+14,yy+24,ir[3]); }
  R(g,x-10,top-12,w+20,14,ir[3]); R(g,x-10,top-12,w+20,3,ir[1]); for(let xx=x;xx<x+w;xx+=16) line(g,xx,top-10,xx+16,top,ir[4]);
  for(const px of [x+w*.3,x+w*.5,x+w*.7]){ ell(g,px,top+6,12,12,ir[4]); ell(g,px,top+6,8,8,ir[1]); ell(g,px,top+6,3,3,ir[4]); for(const d of [-9,9]) line(g,px+d,top+8,px+d+(d<0?-220:300),HB+40,'#1a1428',2); }
  emit(g,g=>R(g,x+w/2-2,top-16,4,4,'#ff3a3a')); glow(g,x+w/2,top-14,28,'#ff3a3a',.08,3); }

function igrejaRosario(g,x){ const w=440, yb=HB-40; // Igreja de N. Sra. do Rosário dos Pretos: azul, cantaria bege, cúpulas brancas em camadas
  igreja(g,x,{w,yb,towers:'two',tw:88,nh:146,fh:60,cap:'baiano',wall:'#6ab4e0',trim:'#c8b08a',door:'#2a4a3a',shut:'#2a4a3a',seed:71,front:'voluta',oculo:true,ty:yb-188,lit:true});
  escadaria(g,x+w/2,300,w+60,yb,HB); placaTur(g,x+w+20,HB+2,'IGREJA DO ROSARIO DOS PRETOS'); }
function cupulaBaiana(g,cx,yb,w){ const wt=rmp('#f2eee4'), az=rmp('#b8a888'); // remate de torre: bulbo branco em camadas + 4 pináculos com chama de barro
  R(g,cx-w/2,yb-14,w,14,az[3]); R(g,cx-w/2,yb-14,w,2,az[1]); for(let xx=cx-w/2+3;xx<cx+w/2-3;xx+=6) R(g,xx,yb-11,4,8,'#3a6aa0');
  const tiers=[[w*.46,22],[w*.34,17],[w*.24,13],[w*.15,10]]; let y=yb-14;
  for(const [r,h] of tiers){ for(let dy=0;dy<h;dy++){ const t=dy/h, hw=Math.max(1,Math.round(r*Math.sin(Math.PI*(.3+t*.7))*(1-.12*t))), yy=y-dy; R(g,cx-hw-1,yy,hw*2+2,1,wt[5]); R(g,cx-hw,yy,hw*2,1,wt[2]); R(g,cx-hw,yy,Math.round(hw*.5),1,wt[1]); R(g,cx-hw+1,yy,Math.max(1,Math.round(hw*.18)),1,wt[0]); R(g,cx+Math.round(hw*.45),yy,Math.round(hw*.55),1,wt[3]); }
    R(g,cx-r*.7,y-h,r*1.4,2,wt[4]); y-=h; }
  ell(g,cx,y-3,4,4,wt[1]); R(g,cx-1,y-16,2,12,wt[3]); R(g,cx-5,y-12,10,2,wt[3]);
  for(const sx of [-1,1]){ const px=cx+sx*(w/2-4); R(g,px-4,yb-30,8,18,wt[2]); R(g,px-4,yb-30,3,18,wt[1]); ell(g,px,yb-32,6,6,wt[1]); R(g,px-2,yb-42,4,8,wt[2]); for(let k=0;k<4;k++) poly(g,[[px-4+k*2.5,yb-42],[px-2.5+k*2.5,yb-51-hsh(k+px)*4],[px-1+k*2.5,yb-42]],k%2?'#c86a3a':'#e08a4a'); } }

function chafariz(g,cx,yb,s){ const ir=rmp('#3e4458'), st=rmp('#c8c0b0'); // chafariz de ferro do Terreiro de Jesus, gradil cheio de fitas
  ell(g,cx,yb,200,16,'rgba(10,6,20,.5)');
  R(g,cx-176,yb-42,352,42,st[3]); R(g,cx-176,yb-42,352,4,st[1]); R(g,cx-176,yb-8,352,8,st[4]); for(let xx=cx-170;xx<cx+170;xx+=44) R(g,xx,yb-38,1,30,st[4]);
  ell(g,cx,yb-96,112,16,ir[4]); ell(g,cx,yb-98,106,12,ir[2]); ell(g,cx-30,yb-101,40,4,ir[1]); for(let k=-100;k<=100;k+=14) R(g,cx+k,yb-94,8,6,ir[3]);
  R(g,cx-32,yb-96,64,56,ir[3]); R(g,cx-32,yb-96,12,56,ir[2]);
  for(let k=0;k<3;k++){ blob(g,cx-52+k*36,yb-82,24,42,ir[2]); ell(g,cx-40+k*36,yb-86,7,8,ir[1]); R(g,cx-46+k*36,yb-74,2,30,'#7a80a0'); }
  R(g,cx-10,yb-152,20,58,ir[3]); R(g,cx-10,yb-152,5,58,ir[2]); ell(g,cx,yb-152,58,10,ir[4]); ell(g,cx,yb-154,54,7,ir[2]); ell(g,cx-16,yb-156,20,3,ir[1]); for(let k=-50;k<=50;k+=10) ell(g,cx+k,yb-147,4,4,ir[3]);
  R(g,cx-6,yb-198,12,46,ir[3]); R(g,cx-6,yb-198,3,46,ir[2]); ell(g,cx,yb-198,26,6,ir[2]); ell(g,cx,yb-178,11,8,ir[2]);
  R(g,cx-6,yb-238,12,40,ir[2]); R(g,cx-6,yb-238,3,40,ir[1]); ell(g,cx,yb-244,6,7,ir[1]); line(g,cx+5,yb-234,cx+12,yb-254,ir[2],3); line(g,cx-5,yb-232,cx-14,yb-216,ir[2],3); R(g,cx-6,yb-238,1,40,'#8a90b0');
  for(let i=0;i<5;i++) streak(g,cx-90+i*40,yb-92,10+hsh(i+s)*16,3,'#3a5a4a');
  gradilFitas(g,cx-206,cx+206,yb+8,s); }
function gradilFitas(g,a,b,yb,s){ const ir=rmp('#3a3e50'), cs=['#e83a3a','#ffd23f','#3a8ae8','#4ac860','#ff8ad0','#f2f2f2','#ff8a3a','#8a5ad8'];
  R(g,a,yb-46,b-a,3,ir[1]); R(g,a,yb-4,b-a,4,ir[2]); R(g,a,yb-24,b-a,2,ir[3]);
  for(let x=a;x<b;x+=8){ R(g,x,yb-48,2,46,ir[2]); R(g,x,yb-48,1,46,ir[0]); poly(g,[[x-1,yb-48],[x+1,yb-55],[x+3,yb-48]],ir[1]);
    for(let k=0;k<3;k++){ if(hsh(x*.3+k+s)<.3) continue; const fy=yb-44+k*7, L=10+hsh(x+k*7)*18, cc=pick(cs,hsh(x*.17+k*3.1+s)); for(let j=0;j<L;j+=2) R(g,x+1+Math.round(Math.sin(j*.5+x)*1.5),fy+j,2,2,cc); } } }

function palco(g,x,yb,s){ const w=360, ir=rmp('#4a4658'), wd=rmp('#5a3a2a'); // palco de rua do Largo, largado
  ell(g,x+w/2,yb,w/2+20,8,'rgba(10,6,20,.5)'); R(g,x,yb-40,w,40,wd[4]); R(g,x,yb-40,w,4,wd[1]); for(let xx=x;xx<x+w;xx+=24) R(g,xx,yb-36,1,36,wd[5]);
  for(const px of [x+4,x+w-12]){ R(g,px,yb-222,8,182,ir[3]); R(g,px,yb-222,2,182,ir[1]); for(let yy=yb-216;yy<yb-50;yy+=12) line(g,px,yy,px+8,yy+12,ir[2]); }
  R(g,x,yb-228,w,10,ir[3]); R(g,x,yb-228,w,2,ir[1]); for(let xx=x;xx<x+w;xx+=12) line(g,xx,yb-226,xx+12,yb-218,ir[2]);
  poly(g,[[x+14,yb-216],[x+w-14,yb-216],[x+w-30,yb-150],[x+w*.6,yb-172],[x+w*.42,yb-138],[x+14,yb-162]],'#24346a'); poly(g,[[x+14,yb-216],[x+w-14,yb-216],[x+w-14,yb-210],[x+14,yb-210]],'#3a4c8a');
  for(let k=0;k<5;k++) R(g,x+40+k*60,yb-200,30,4,pick(['#e8b84a','#d9747a','#5aa88a','#f2e6c8'],k/5));
  for(const px of [x+20,x+w-70]){ R(g,px,yb-112,50,72,'#1e1c2a'); R(g,px,yb-112,50,2,'#3a3848'); ell(g,px+25,yb-70,16,16,'#3a3848'); ell(g,px+25,yb-70,9,9,'#14121c'); ell(g,px+25,yb-98,7,7,'#3a3848'); }
  for(let k=0;k<4;k++){ const lx=x+70+k*72; R(g,lx-6,yb-216,12,10,ir[2]); if(k%2){ emit(g,g=>ell(g,lx,yb-204,4,3,'#fff0c0')); glow(g,lx,yb-200,50,'#ffd890',.06,3); } else R(g,lx-4,yb-206,8,3,'#2a2030'); }
  const sx=x+w*.48; ell(g,sx,yb-60,20,7,'#e8e0d0'); R(g,sx-20,yb-60,40,18,'#c83a3a'); R(g,sx-20,yb-60,40,2,'#e86a5a'); ell(g,sx,yb-42,20,6,'#8a2a2a'); line(g,sx-16,yb-58,sx+16,yb-44,'#e8c040',1); line(g,sx+24,yb-48,sx+40,yb-70,'#c8a070',2);
  line(g,x+w-40,yb-40,x+w+30,yb-6,'#140c18',2); tag(g,x+30,yb-30,s); }
function fachadaFundo(g,x,yb,w,h,col,s){ const c=rmp(col), wt=rmp('#f2eee4'); // casarão no alto do Largo (vista em perspectiva)
  R(g,x,yb-h,w,h,c[2]); shade(g,x,yb-h,w*.3,h,'#fff0d0',.06); R(g,x,yb-h,w,3,wt[1]);
  poly(g,[[x+w*.25,yb-h],[x+w/2,yb-h-18],[x+w*.75,yb-h]],c[2]); line(g,x+w*.25,yb-h,x+w/2,yb-h-18,wt[1],2); line(g,x+w/2,yb-h-18,x+w*.75,yb-h,wt[1],2);
  R(g,x,yb-h,4,h,wt[2]); R(g,x+w-4,yb-h,4,h,wt[3]);
  for(let f=0;f<3;f++) for(let k=0;k<6;k++){ const ww=Math.round((w-16)/6)-6, wh=Math.round((h-10)/3)-10, wx=Math.round(x+8+k*(w-16)/6+3), wy=Math.round(yb-h+10+f*(h-10)/3); archF(g,wx-1,wy-1,ww+2,wh+2,wt[2]); archF(g,wx,wy,ww,wh,'#1a1430');
    if(hsh(s+f*7+k)>.62){ const X=wx,Y=wy; emit(g,g=>archF(g,X+1,Y+1,ww-2,wh-1,'#e8a050')); } }
  R(g,x,yb-h+(h-10)/3+6,w,2,wt[2]); R(g,x,yb-3,w,3,c[4]); }
function largoVista(g,x,w,s){ const vx=x+w/2, vy=HB-96, N=x, F=x+w, HN=240, HV=70; // o Largo do Pelourinho subindo em perspectiva
  const lerp=(p,q,t)=>p+(q-p)*t, X=(side,f)=>lerp(vx+side*86,side<0?N:F,f), Y=f=>lerp(vy,HB,f), Hh=f=>lerp(HV,HN,f);
  fachadaFundo(g,vx-150,vy+2,148,94,'#e8b84a',s); fachadaFundo(g,vx-4,vy+2,160,112,'#4a7ac0',s+1);
  poly(g,[[N,HB],[F,HB],[vx+86,vy],[vx-86,vy]],'#4a4456');
  for(let i=1;i<18;i++){ const f=Math.pow(i/18,1.6), y=Y(f), hw=lerp(86,w/2,f); R(g,vx-hw,y,hw*2,1,'#2e2a3c'); for(let xx=vx-hw;xx<vx+hw;xx+=6+f*18) if(hsh(xx*.3+i)>.4) R(g,xx,y+1,3+f*8,1,'#6a6478'); }
  for(const side of [-1,1]){ let f0=1, k=0; while(f0>.1){ const f1=f0*.68, col=rmp(mix(pick(SAL,hsh(k*3.7+side*1.3+s)),'#3a4a6a',.28));
      const xa=X(side,f0), xb=X(side,f1), ya=Y(f0), yb=Y(f1), ha=Hh(f0), hb=Hh(f1);
      poly(g,[[xa,ya],[xa,ya-ha],[xb,yb-hb],[xb,yb]],col[side<0?2:3]); line(g,xa,ya-ha,xb,yb-hb,'#f2eee4',Math.max(1,Math.round(4*f0)));
      poly(g,[[xa,ya-ha],[xb,yb-hb],[xb,yb-hb-12*f1],[xa,ya-ha-14*f0]],mix('#b4562c','#2a2a4a',.3));
      for(const u of [.3,.7]) for(const vv of [.82,.5]){ const fu=lerp(f0,f1,u), xu=X(side,fu), yu=Y(fu), hu=Hh(fu), ww=Math.max(2,Math.abs(xb-xa)*.16); R(g,xu-ww/2-1,yu-hu*vv-1,ww+2,hu*.24+2,'#e8e4dc'); R(g,xu-ww/2,yu-hu*vv,ww,hu*.24,col[5]);
        if(hsh(k*7+u*3+vv*5+side)>.6){ const X0=xu, Y0=yu-hu*vv, H0=hu*.24, W0=ww; emit(g,g=>R(g,X0-W0/2,Y0,W0,H0,'#e89a50')); } }
      line(g,xa,ya,xa,ya-ha,'#f2eee4',Math.max(1,Math.round(3*f0))); f0=f1; k++; } }
  for(const f of [.4,.72]){ const y=Y(f)-Hh(f)*.92; bandLine(g,X(-1,f),X(1,f),y,14*f,s+f*10); }
  for(const f of [.35,.62]){ for(const side of [-1,1]){ const lx=X(side,f)-side*14*f, ly=Y(f)-Hh(f)*.62; R(g,lx-1,ly,Math.max(1,3*f),4,'#2a2440'); emit(g,g=>ell(g,lx,ly+4*f,3*f+1,3*f+1,'#ffe0a0')); glow(g,lx,ly+4,40*f,'#ffb860',.06,3); } }
  placaTur(g,vx-tw('LARGO DO PELOURINHO',1)/2-7,HB+2,'LARGO DO PELOURINHO'); shade(g,N,vy-20,w,HB-vy+20,'#0a0626',.1); }

function beco(g,x,w,s){ const st=rmp('#6e6672'), wl=rmp('#5a4a62'); // beco com escadaria subindo entre os casarões (perspectiva)
  const cx=x+w/2, top=HB-176, tw0=Math.round(w*.26), n=16;
  R(g,x,0,w,HB,'#0e0a1a'); R(g,cx-tw0/2,0,tw0,top,'#1a2234'); // fresta de céu e fundo do beco
  const lerp=(p,q,t)=>p+(q-p)*t;
  for(let i=0;i<n;i++){ const f0=i/n, f1=(i+1)/n, y0=lerp(HB,top,Math.pow(f0,.8)), y1=lerp(HB,top,Math.pow(f1,.8)), w0=lerp(w-28,tw0,f0), h=y0-y1;
    R(g,cx-w0/2,y1,w0,h,st[3]); R(g,cx-w0/2,y1,w0,Math.max(1,h*.3),st[1]); R(g,cx-w0/2,y0-1,w0,1,st[5]); }
  for(const sd of [-1,1]){ const xo=sd<0?x:x+w, xi=cx+sd*tw0/2; poly(g,[[xo,0],[xi,0],[xi,top],[xo,HB]],sd<0?wl[3]:wl[4]); line(g,xi,0,xi,top,wl[1]);
    for(let k=0;k<4;k++){ const f=.2+k*.2, yy=lerp(HB-40,top+20,f), xx=lerp(xo,xi,f*.9); R(g,Math.min(xx,xx-sd*10),yy-50*(1-f*.6),10*(1-f*.5),26*(1-f*.5),'#1a1428'); } }
  const ly=top+20; R(g,cx-1,ly-14,2,14,IRON[3]); emit(g,g=>R(g,cx-3,ly,6,8,'#ffe0a0')); glow(g,cx,ly+4,50,'#ffb060',.07,4); reg(LAMPS,{x:cx/RS,y:(ly+4)/RS,r:12,mid:true});
  sag(g,x+8,HB-220,x+w-8,HB-214,10,'#1a1024',1,(px,py,i)=>{ if(i%14===5) R(g,px-4,py,8,12,pick(['#e83a3a','#f2f2f2','#3a8ae8','#ffd23f'],hsh(px+s))); }); }
function telas(g,x,yb,s){ const cs=['#e83a3a','#ffd23f','#3a8ae8','#4ac860','#ff8ad0','#8a5ad8','#ff8a3a']; // telas de ateliê largadas na calçada
  for(let k=0;k<3;k++){ const w=40+hsh(s+k)*30, h=50+hsh(s*3+k)*30, px=x+k*46, lean=6+k*2; poly(g,[[px,yb],[px+w,yb],[px+w+lean,yb-h],[px+lean,yb-h]],'#5a3a1a'); poly(g,[[px+4,yb-4],[px+w-4,yb-4],[px+w+lean-5,yb-h+4],[px+lean+3,yb-h+4]],pick(cs,hsh(s*5+k)));
    for(let q=0;q<4;q++){ const qy=yb-12-hsh(s*9+q+k)*(h-26), qx=px+8+hsh(s+k*7+q)*(w-24)+lean*(yb-qy)/h; blob(g,qx,qy,8+hsh(q)*10,6+hsh(q*3)*8,pick(cs,hsh(s*11+q+k))); } }
  R(g,x+150,yb-34,12,34,'#e8e4dc'); ell(g,x+156,yb-40,8,8,'#e8e4dc'); R(g,x+150,yb-34,4,34,'#f8f4ec'); }
function tinta(g,x,y,s){ const c=pick(['#e83a3a','#3a8ae8','#ffd23f','#4ac860'],hsh(s)); ell(g,x,y,30+hsh(s)*30,6+hsh(s*2)*5,mix(c,'#1a1024',.35)); ell(g,x-6,y-1,16,3,mix(c,'#ffffff',.1)); R(g,x+24,y-8,10,9,'#8a8aa0'); R(g,x+24,y-8,10,2,'#c8c8d8'); }
function farolLonge(g,x,y){ const wh='#c8c8d0', bk='#2a2838'; for(let k=0;k<4;k++) R(g,x-4,y-k*7-7,8,7,k%2?bk:wh); R(g,x-6,y-32,12,4,bk); emit(g,g=>R(g,x-3,y-38,6,6,'#fff2c0')); glow(g,x,y-35,30,'#fff0b0',.06,3); reg(BEACONS,{x:x/RS,y:(y-35)/RS,len:900,ph:1.3}); }

/* =====================================================================
   COMPOSIÇÃO POR ÁREA
   ===================================================================== */
function compose(A){ const X0=A.x0*RS, X1=A.x1*RS, L=X1-X0, s=A.n*1000;
  const rua=(irr,walk,col,back)=>walkStreet(X0,X1,walk||'cimento',col||'#7a7488',s,irr!==false,back===true);
  const palms=(xs,k)=>xs.forEach((r,i)=>{ const x=X0+r; add(x-160,x+160,1,g=>palmMid(g,x,HB-4,(k||1)*(.92+hsh(i+s)*.16))); });
  const band=(a,b,y,sp,sg)=>add(a,b,2,(g,lo,hi)=>bandeirinhas(g,Math.max(lo,a),Math.min(hi,b),y,sp,sg,s));
  const lajes=(col)=>{ add(X0,X1,3,(g,lo,hi)=>{ const a=Math.max(lo,X0), b=Math.min(hi,X1); fSlabs(g,a,b,col||'#b0a8a4',s,HB,X0); shade(g,a,HB,b-a,6,'#140a24',.45); }); add(X0,X1,4,(g,lo,hi)=>manchasChao(g,Math.max(lo,X0),Math.min(hi,X1),ST,s)); };
  const portuguesa=()=>{ add(X0,X1,3,(g,lo,hi)=>{ const a=Math.max(lo,X0), b=Math.min(hi,X1); fPortuguesa(g,a,b,HB,s,true); shade(g,a,HB,b-a,6,'#140a24',.45); }); add(X0,X1,4,(g,lo,hi)=>manchasChao(g,Math.max(lo,X0),Math.min(hi,X1),ST,s)); };
  const bancas=(list)=>list.forEach(([r,c,l],i)=>{ const x=X0+r; add(x-30,x+180,5,g=>barracaArt(g,x,HB+52+(i%2)*10,c,s+i*3,l)); });
  switch(A.id){
  case 'farol':
    chaoExtras(X0,X1,s+3,{faixa:false,patch:false}); acidentes(X0,X1,s,['racha','sangue','poca']); borda(X0,X1,s+7,['barraca','carro','entulho']);
    add(X0,X1,0,(g,lo,hi)=>baia(g,Math.max(lo,X0),Math.min(hi,X1),s,{boats:true}));
    add(X0,X0+2260,1,(g,lo,hi)=>mureta(g,Math.max(lo,X0),Math.min(hi,X0+2260),HB-44,s));
    add(X0+2200,X0+3760,1,g=>forteBarra(g,X0+2300,1340));
    add(X0+3700,X1,1,(g,lo,hi)=>mureta(g,Math.max(lo,X0+3700),Math.min(hi,X1),HB-44,s+5));
    palms([260,860,1460,1960,3980,4560,5240],1.02);
    bancas([[1100,'#2f5fa8','SOUVENIR'],[4300,'#d9747a','FITAS'],[5000,'#5aa88a','COCO']]);
    lajes('#b4aca6'); lampRow(X0,X1,700,true,350); decals(X0,X1,s,{holes:false,stones:false}); break;
  case 'comercio':
    chaoExtras(X0,X1,s+3,{}); acidentes(X0,X1,s,['buraco','racha','sangue','poca']); borda(X0,X1,s+7,['carro','capotado','lixo','barricada']);
    add(X0,X0+4560,0,(g,lo,hi)=>fundoTelhados(g,Math.max(lo,X0),Math.min(hi,X0+4560),s));
    casarioRow(X0,X0+2300,'eclet',s); add(X0+2300,X0+2900,1,g=>predioModerno(g,X0+2300,600,s)); casarioRow(X0+2900,X0+4560,'bj',s+30);
    add(X0+4560,X1,0,(g,lo,hi)=>escarpa(g,Math.max(lo,X0+4560),Math.min(hi,X1),150,s)); add(X0+4600,X1,0,g=>planoInclinado(g,X0+4980,1400,150));
    add(X0+4600,X0+5000,1,g=>estacao(g,X0+4620,360,150,'#e8dcb0','PLANO INCLINADO'));
    for(const r of [.18,.44,.7]){ const x=X0+L*r; add(x-20,x+340,5,g=>onibus(g,x,HB+56,pick(['#e8b84a','#2f5fa8','#d9747a'],hsh(r*7)),'COMERCIO')); }
    walkStreet(X0,X1,'cimento','asfalto',s,false,false); lampRow(X0,X1,640,true,300); decals(X0,X1,s,{trilho:true}); fiosAdd(X0,X0+4560,s); break;
  case 'modelo':
    chaoExtras(X0,X1,s+3,{faixa:false,slabs:false,patch:false}); acidentes(X0,X1,s,['racha','sangue','poca']); borda(X0,X1,s+7,['barraca','tenda','lixo']);
    add(X0,X1,0,(g,lo,hi)=>escarpa(g,Math.max(lo,X0),Math.min(hi,X1),150,s)); add(X0+3500,X0+3800,0,g=>elevadorTorre(g,X0+3600,30,HB-10,.9));
    casarioSSA(X0,X0+900,s,{p3:.2,p2:.5,signs:.5,signList:['ARTESANATO','RESTAURANTE','BAR','LEMBRANCAS','ACARAJE']});
    add(X0+900,X0+3100,1,g=>mercadoModelo(g,X0+1000,2000));
    casarioSSA(X0+4600,X1,s+40,{p3:.3,p2:.5});
    palms([3260,4300],1.05); for(const r of [3500,4000]){ const x=X0+r; add(x-150,x+150,1,g=>arvore(g,x,HB-6,x,1.05)); }
    bancas([[1300,'#2f5fa8','ARTESANATO'],[1800,'#d9747a','RENDAS'],[2400,'#5aa88a',null],[2800,'#e8b84a','BERIMBAU'],[3700,'#d9747a','COCADA']]);
    portuguesa(); lampRow(X0,X1,700,true,350); decals(X0,X1,s,{holes:false,stones:false}); fiosAdd(X0,X0+900,s); fiosAdd(X0+4600,X1,s); break;
  case 'plano':
    chaoExtras(X0,X1,s+3,{faixa:false}); acidentes(X0,X1,s,['buraco','racha','sangue']); borda(X0,X1,s+7,['entulho','carro','lixo']);
    add(X0,X1,0,(g,lo,hi)=>escarpa(g,Math.max(lo,X0),Math.min(hi,X1),140,s));
    add(X0+1800,X0+2900,0,g=>planoInclinado(g,X0+1900,900,150));
    add(X0+200,X0+700,1,g=>estacao(g,X0+220,380,150,'#e8dcb0','PLANO INCLINADO'));
    add(X0+4200,X0+4500,0,g=>estacao(g,X0+4240,240,HB-150,'#d8ccb0',null));
    casarioSSA(X0+4500,X1,s+20,{p3:.35,p2:.45});
    for(const r of [.3,.62]){ const x=X0+L*r; add(x-20,x+320,5,g=>carro(g,x,HB+64,pick(['#c8c0b0','#3a3a5a','#8a3a3a'],hsh(r*9)),{broken:true,open:r>.5})); }
    rua(true,'cimento','#6e6878'); lampRow(X0,X1,760,false,250); decals(X0,X1,s,{}); fiosAdd(X0+4500,X1,s); break;
  case 'ladeiras':
    chaoExtras(X0,X1,s+3,{faixa:false,slabs:false}); acidentes(X0,X1,s,['buraco','poca','sangue','racha']); borda(X0,X1,s+7,['lixo','barricada','entulho']);
    casarioSSA(X0,X0+1900,s,{p3:.35,p2:.45}); add(X0+1900,X0+2080,1,g=>beco(g,X0+1900,180,s));
    casarioSSA(X0+2080,X0+3900,s+30,{p3:.4,p2:.4,muxa:.2}); add(X0+3900,X0+4080,1,g=>beco(g,X0+3900,180,s+9));
    casarioSSA(X0+4080,X1,s+60,{p3:.4,p2:.4});
    band(X0,X1,58,300,34); band(X0+150,X1,98,300,28);
    rua(true,'cimento','#6a6476',true); lampRow(X0,X1,700,false,250); decals(X0,X1,s,{}); fiosAdd(X0,X1,s); break;
  case 'largo':
    chaoExtras(X0,X1,s+3,{faixa:false,slabs:false,patch:false}); acidentes(X0,X1,s,['racha','sangue','poca']); borda(X0,X1,s+7,['barricada','lixo','tenda']);
    casarioSSA(X0,X0+1700,s,{p3:.6,p2:.4,signs:.35}); add(X0+1700,X0+2800,1,g=>largoVista(g,X0+1700,1100,s)); casarioSSA(X0+2800,X1,s+40,{p3:.6,p2:.4,signs:.35});
    add(X0+3300,X0+3700,5,g=>palco(g,X0+3320,HB+46,s));
    add(X0,X1,2,(g,lo,hi)=>{ const a=Math.max(lo,X0), b=Math.min(hi,X1); varalLuz(g,a,b,52,420,30); bandeirinhas(g,a,b,90,300,26,s); });
    rua(true,'cimento','#6a6476',true); lampRow(X0,X1,640,true,260); decals(X0,X1,s,{}); fiosAdd(X0,X0+1700,s); fiosAdd(X0+2800,X1,s); break;
  case 'rosario':
    chaoExtras(X0,X1,s+3,{faixa:false,slabs:false}); acidentes(X0,X1,s,['racha','sangue','poca']); borda(X0,X1,s+7,['lixo','barricada','entulho']);
    casarioSSA(X0,X0+1700,s,{p3:.4,p2:.4}); add(X0+1700,X0+2000,1,g=>casaOlinda(g,X0+1700,300,{seed:717,col:'#6ab4e0',fl:2,roof:'beiral',shut:'#2a4a3a',cunhal:'#c8b08a',lamp:true}));
    add(X0+1960,X0+2560,1,g=>igrejaRosario(g,X0+2000)); casarioSSA(X0+2440,X1,s+40,{p3:.4,p2:.4});
    rua(true,'cimento','#6e6878',true); lampRow(X0,X1,700,true,300); decals(X0,X1,s,{}); fiosAdd(X0,X0+1700,s); fiosAdd(X0+2700,X1,s); break;
  case 'casaroes':
    chaoExtras(X0,X1,s+3,{faixa:false}); acidentes(X0,X1,s,['buraco','racha','sangue','poca']); borda(X0,X1,s+7,['barricada','entulho','lixo']);
    casarioSSA(X0,X1,s,{p3:.45,p2:.45,muxa:.4,signs:.55,signList:['ATELIE','GALERIA','ARTE','MOLDURAS','ATELIE','TELAS','ESCULTURA']});
    for(const r of [.12,.4,.66,.9]){ const x=X0+L*r; add(x-10,x+200,5,g=>telas(g,x,HB+44,s+r*100)); }
    for(let i=0;i<6;i++){ const x=X0+hsh(s+i*3)*L, y=380+hsh(s*5+i)*100; add(x-70,x+70,4,g=>tinta(g,x,y,s+i)); }
    add(X0,X1,2,(g,lo,hi)=>varalLuz(g,Math.max(lo,X0),Math.min(hi,X1),60,380,26));
    rua(true,'cimento','#706a7c',true); lampRow(X0,X1,700,false,300); decals(X0,X1,s,{}); fiosAdd(X0,X1,s); break;
  case 'terreiro':
    chaoExtras(X0,X1,s+3,{faixa:false,slabs:false,patch:false}); acidentes(X0,X1,s,['racha','sangue']); borda(X0,X1,s+7,['tenda','barricada']);
    add(X0+160,X0+900,1,g=>igreja(g,X0+180,{w:620,towers:'two',tw:100,nh:170,fh:56,cap:'lanterna',wall:'#f0ece0',trim:'#c8b890',door:'#3a2418',shut:'#2f4a3a',seed:91,front:'voluta',oculo:true,lit:true,name:'CATEDRAL BASILICA',ty:HB-206}));
    casarioSSA(X0,X0+180,s,{p3:.5}); casarioSSA(X0+800,X0+2000,s+20,{p3:.6,p2:.4});
    add(X0+2000,X0+2420,1,g=>igreja(g,X0+2000,{w:420,towers:'left',tw:90,nh:150,fh:52,cap:'piramide',wall:'#f2ece0',trim:'#a8a090',door:'#2a3a5a',shut:'#2a3a5a',seed:93,front:'voluta',oculo:false,ty:HB-196}));
    casarioSSA(X0+2420,X1,s+40,{p3:.6,p2:.4,signs:.3});
    palms([1100,1700,3500,4200],1.12); add(X0+2560,X0+3160,5,g=>chafariz(g,X0+2860,HB+34,s));
    bancas([[1300,'#d9747a','FITAS'],[4500,'#2f5fa8','SOUVENIR']]);
    portuguesa(); lampRow(X0,X1,640,true,280); decals(X0,X1,s,{holes:false,stones:false}); break;
  case 'tome':
    chaoExtras(X0,X1,s+3,{faixa:false,slabs:false,patch:false}); acidentes(X0,X1,s,['racha','sangue','poca']); borda(X0,X1,s+7,['carro','barricada','entulho']);
    add(X0,X0+1300,0,(g,lo,hi)=>fundoTelhados(g,Math.max(lo,X0),Math.min(hi,X0+1300),s));
    add(X0,X0+1300,1,g=>{ ecletico(g,X0,1300,{seed:611,col:'#efe2b4',fl:3,par:'balaustre',dome:'c',domeC:'#e8e4dc',shut:'#2f4a3a',arcade:true}); placaTur(g,X0+900,HB+2,'PALACIO RIO BRANCO'); });
    add(X0+1300,X0+4300,0,(g,lo,hi)=>baia(g,Math.max(lo,X0+1300),Math.min(hi,X0+4300),s,{city:true,boats:true,hz:214}));
    add(X0+3980,X0+4200,0,g=>elevadorTorre(g,X0+4000,26,HB,1.15));
    add(X0+1300,X0+4300,1,(g,lo,hi)=>balaustrada(g,Math.max(lo,X0+1300),Math.min(hi,X0+4300)));
    add(X0+4300,X0+4900,1,g=>cabecaElevador(g,X0+4300,600,false)); casarioSSA(X0+4900,X1,s+50,{p3:.5});
    palms([1500,2300,3100],1.0); band(X0+1300,X0+4300,40,320,30);
    lajes('#aca6a8'); lampRow(X0,X1,700,true,350); decals(X0,X1,s,{holes:false,stones:false}); break;
  case 'elevador':
    chaoExtras(X0,X1,s+3,{faixa:false,slabs:false,patch:false}); acidentes(X0,X0+2400,s,['racha','sangue']);
    add(X0,X1,0,(g,lo,hi)=>baia(g,Math.max(lo,X0),Math.min(hi,X1),s,{city:true,boats:true,hz:206}));
    add(X0+300,X0+500,0,g=>farolLonge(g,X0+400,206));
    add(X0+1500,X0+1800,0,g=>elevadorTorre(g,X0+1520,24,HB,1.25));
    add(X0,X0+2500,1,(g,lo,hi)=>balaustrada(g,Math.max(lo,X0),Math.min(hi,X0+2500)));
    add(X0+2440,X0+3260,1,g=>porticoCabos(g,X0+2500,700,s)); add(X0+3260,X0+4200,1,g=>cabecaElevador(g,X0+3300,860,true));
    add(X0+4200,X1,1,(g,lo,hi)=>balaustrada(g,Math.max(lo,X0+4200),Math.min(hi,X1)));
    add(X0,X1,4,(g,lo,hi)=>{ for(const [y0,y1] of [[380,470],[400,520]]) line(g,Math.max(lo,X0+1800),y0,Math.min(hi,X0+4000),y1,'#14101e',3); });
    lajes('#a8a2a6'); lampRow(X0,X1,760,true,300); decals(X0,X0+2400,s,{holes:false,stones:false,wet:false}); break;
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
const GRADE=[[0,'#8a92d6'],[.3,'#828ace'],[.5,'#6e76b8'],[.546,'#585f9a'],[.556,'#868cc6'],[.68,'#959cce'],[.86,'#7c82b8'],[1,'#4e5488']]; // noite mais funda (contraste tipo Cosmic Invasion)
// luz do cenário (dia e clima, DN-03): 'noite' (noite/madrugada/Lua de Sangue), 'dusk' (anoitecer: postes acesos) e 'dia' (manhã/tarde: sem emissivos)
const GRADES={noite:GRADE,dusk:[[0,'#f4d4e2'],[.3,'#e8c6dc'],[.5,'#d4b0d0'],[.546,'#ba94bc'],[.556,'#dcbcd6'],[.68,'#e4c8de'],[.86,'#ccacce'],[1,'#9e7eae']],
  dia:[[0,'#fffaf2'],[.3,'#fcf6f2'],[.5,'#f6eef0'],[.546,'#e4dcea'],[.556,'#f8f0f2'],[.68,'#faf2f2'],[.86,'#ece4ee'],[1,'#d6cee4']]};
let LIGHT='noite', RL='noite', PREV=null;
const lightOf=m=>m==='manha'||m==='tarde'||m==='dia'?'dia':m==='anoitecer'||m==='dusk'?'dusk':'noite';
/* troca a luz dos tiles: os tiles da luz antiga continuam na tela até os novos ficarem prontos (gerados aos poucos
   no idle do motor) e então somem num fade curto, sem engasgo. */
function setLight(m,now){ const l=lightOf(m); if(l===LIGHT) return; PREV=!now&&midTiles.some(Boolean)?{t:midTiles.slice(),a:1,ready:false}:null; midTiles.fill(null); job=null; LIGHT=l; }
const LAY={}, SATK={noite:.32,dusk:.2,dia:.14};
function gradeLayer(c,g){ // gradação noturna (multiply) preservando o alfa da camada
  if(!MASK.c) [MASK.c,MASK.g]=mk(TILE,HH); MASK.g.clearRect(0,0,TILE,HH); MASK.g.drawImage(c,0,0);
  g.globalCompositeOperation='saturation'; g.globalAlpha=SATK[RL]||0; g.fillStyle='#ff2a2a'; if(g.globalAlpha>0) g.fillRect(0,0,TILE,HH); g.globalAlpha=1; // reforço de saturação (materiais vivos como no Cosmic Invasion; cinzas ficam cinzas)
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
function fgFitas(g,w){ fgGrade(g,w); const cs=['#e83a3a','#ffd23f','#3a8ae8','#4ac860','#ff8ad0','#f2f2f2'], y0=HH-86; // gradil com fitas amarradas
  for(let x=6;x<w;x+=16) for(let k=0;k<2;k++){ if(hsh(x+k*7)<.3) continue; const L=20+hsh(x*3+k)*30, c=mix(pick(cs,hsh(x*.7+k)),'#0c0618',.6); for(let j=0;j<L;j+=2) R(g,x+2+Math.round(Math.sin(j*.4+x)*2),y0+6+k*12+j,2,2,c); } }
function fgSprite(t){ if(fgCache[t]) return fgCache[t]; let w=80, c, g;
  if(t==='grade'){ w=300; [c,g]=mk(w,HH); fgGrade(g,w); return fgCache[t]={c,w}; }
  if(t==='fitas'){ w=300; [c,g]=mk(w,HH); fgFitas(g,w); return fgCache[t]={c,w}; }
  if(t==='planta'){ w=280; [c,g]=mk(w,HH); fgPlanta(g,w); return fgCache[t]={c,w}; }
  if(t==='barril'){ w=130; [c,g]=mk(w,HH); fgBarril(g,w); return fgCache[t]={c,w}; }
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
function drawFG(g,cam){ const T=g.getTransform(); g.save(); g.setTransform(1,0,0,1,T.e,T.f); g.imageSmoothingEnabled=false;
  for(const it of FGI){ const sx=Math.round((it.x-cam)*1.25*RS); if(sx<-200||sx>HW+200) continue; const sp=fgSprite(it.t); g.drawImage(sp.c,sx-sp.w/2,0); } g.restore(); }

/* =====================================================================
   CÉU E FUNDO DISTANTE (parallax)
   Modos (mesmo contrato do MAP/OLINDA, DN-03): manha · tarde · anoitecer · noite · lua. O clima (chuva, neblina…)
   vem por cima, das camadas de art-src/shared/clima.js; aqui só a neblina baixa da baía (MAP-17).
   ===================================================================== */
const SKYP={
  manha:{g:['#3a7ad0','#4686d6','#5492dc','#629ee2','#74aae6','#88b6ea','#9cc2ec','#b4ceee','#ccdaec','#e2e2e4'],star:null,sol:true,moon:['#fffff4','#fff6d0','#ffe9a6','#f2d27e'],mr:26,mx:200,my:110,glow:'#fff2c4',cloud:['#c6d2ea','#e2eaf6','#ffffff','#ffffff'],f1:'#7a94b8',f1w:null,f2:'#5a74a0',f2w:null,fog:'#e8eef4',fogA:.18},
  tarde:{g:['#2c62c4','#3a70ca','#4a7ed0','#5a8cd4','#6e9ad6','#84a8d6','#9eb4d2','#bcbec8','#dac6b2','#f2ca94'],star:null,sol:true,moon:['#fffff2','#fff8d4','#ffeca4','#f8d872'],mr:24,mx:780,my:58,glow:'#fff4ca',cloud:['#d2c8d6','#ece8ee','#ffffff','#fff0e0'],f1:'#7e8aaa',f1w:null,f2:'#606c92',f2w:null,fog:'#f2e2cc',fogA:.16},
  anoitecer:{g:['#16184a','#22205c','#34286c','#4a3076','#64367c','#80407c','#a04c74','#c05e66','#dc7a58','#f0a050'],star:'#f0d8ff',ns:60,sol:true,moon:['#fff2c4','#ffc274','#ff9254','#e86a3a'],mr:46,mx:660,my:262,glow:'#ff8a4a',cloud:['#3e2258','#6a3064','#ffb070','#c86070'],f1:'#33285e',f1w:'#ffc070',f2:'#221a48',f2w:'#ffb060',fog:'#d08a7a',fogA:.14},
  // noite azul-petróleo (MAP-17)
  noite:{g:['#030a14','#06101e','#0a1828','#0e2032','#13283c','#193246','#203c50','#284658','#325060','#3c5a68'],star:'#e0f0ff',moon:['#fffbe8','#efe8cc','#cfc6a6','#a89e84'],mr:34,mx:740,my:84,glow:'#8ab8ff',cloud:['#0e1c2c','#16283a','#22384c','#344c62'],f1:'#1c3448',f1w:'#e8c080',f2:'#11233a',f2w:'#f0b860',fog:'#4a6a7a',fogA:.16},
  lua:{g:['#0c0206','#160308','#22050c','#300810','#400c14','#521018','#66161c','#7c1e22','#922a28','#a8382e'],star:'#ffd0c8',moon:['#ffa47a','#f0603e','#c4342a','#86181a'],mr:62,mx:720,my:116,glow:'#ff4a3a',cloud:['#2a0610','#40101a','#5c1822','#82282c'],f1:'#4a0e1a',f1w:'#ff8a5a',f2:'#2a060e',f2w:'#ffa060',fog:'#7a2028',fogA:.18}};
const skyCache={};
function sol(g,P,mx,my,mr){ const S=P.moon; ell(g,mx,my,mr+3,mr+3,S[3]); ell(g,mx,my,mr,mr,S[2]); ell(g,mx-mr*.08,my-mr*.08,mr*.84,mr*.84,S[1]); ell(g,mx-mr*.2,my-mr*.2,mr*.5,mr*.5,S[0]);
  for(let k=0;k<16;k++){ const a=k/16*Math.PI*2, r0=mr+8+(k%2)*4, r1=r0+6+(k%3)*4; for(let r=r0;r<r1;r+=2) R(g,Math.round(mx+Math.cos(a)*r),Math.round(my+Math.sin(a)*r),2,2,k%2?S[2]:S[1]); } }
function skyCanvas(mode){ if(skyCache[mode]) return skyCache[mode]; const P=SKYP[mode], [c,g]=mk(HW,HB+20), n=P.g.length, bh=(HB+20)/n;
  for(let i=0;i<n;i++){ R(g,0,i*bh,HW,bh+1,P.g[i]); if(i<n-1){ g.fillStyle=P.g[i+1]; for(let y=Math.round((i+1)*bh)-4;y<Math.round((i+1)*bh);y++) for(let x=(y%2)*2;x<HW;x+=(y%4<2?4:2)) g.fillRect(x,y,2,1); } }
  const NS=P.ns??(P.star?220:0); for(let i=0;i<NS;i++){ const x=Math.floor(hsh(i*3.1)*HW), y=Math.floor(Math.pow(hsh(i*7.3),1.6)*230), v=hsh(i*1.9); g.fillStyle=v>.85?'#ffffff':v>.5?P.star:mix(P.star,P.g[3],.5); g.fillRect(x,y,v>.7?2:1,v>.7?2:1);
    if(v>.95){ g.fillRect(x-2,y,6,1); g.fillRect(x,y-2,1,6); g.fillStyle=mix(P.star,P.g[2],.5); g.fillRect(x-4,y,2,1); g.fillRect(x+4,y,2,1); } }
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
/* fundo distante de Salvador: nível 1 = espigões e morros do outro lado; nível 2 = telhados e torres do Centro Histórico */
function farStrip(mode,lvl){ const k='f'+lvl+mode; if(stripCache[k]) return stripCache[k]; const P=SKYP[mode], W0=lvl===1?2880:2400, [c,g]=mk(W0,HB);
  const col=lvl===1?P.f1:P.f2, wc=lvl===1?P.f1w:P.f2w, cc=rmp(col), TP=Math.PI*2;
  const hy=lvl===1?(x=>176+Math.sin(x/W0*TP*3)*16+Math.sin(x/W0*TP*7+1)*8):(x=>204+Math.sin(x/W0*TP*4+2)*12+Math.sin(x/W0*TP*9)*6);
  for(let x=0;x<W0;x+=2){ const y=Math.round(hy(x)); R(g,x,y,2,HB-y,cc[2]); R(g,x,y,2,1,cc[1]); }
  if(lvl===1){ for(let i=0;i<W0/34;i++){ const x=i*34+hsh(i*3.7)*20; if(hsh(i*1.9)<.35||x>W0-30) continue; const w=12+hsh(i*5.1)*16, h=30+Math.pow(hsh(i*7.7),1.5)*90, y=hy(x)-h+10;
      R(g,x,y,w,h,cc[3]); R(g,x,y,1,h,cc[1]); R(g,x+w-2,y,2,h,cc[4]); if(wc) for(let yy=y+3;yy<y+h-4;yy+=5) for(let xx=x+2;xx<x+w-2;xx+=3) if(hsh(xx*1.7+yy*.9)>.82){ g.fillStyle=wc; g.fillRect(xx,yy,1,2); }
      if(h>100){ R(g,x+w/2,y-10,1,10,cc[3]); if(wc){ g.fillStyle='#ff4a3a'; g.fillRect(x+w/2,y-11,2,2); } } } }
  else { for(let i=0;i<W0/22;i++){ const x=i*22+hsh(i*3.1)*10, y=hy(x)+4+hsh(i*5.1)*30; if(hsh(i*2.7)<.25||x>W0-26) continue; const w=18, h=10;
      R(g,x,y,w,h,cc[3]); R(g,x-1,y-3,w+2,3,mix(col,'#b4562c',.4)); if(wc&&hsh(i*9.1)>.55){ g.fillStyle=wc; g.fillRect(x+3,y+3,2,3); g.fillRect(x+11,y+3,2,3); } }
    for(let j=0;j<3;j++){ const x=Math.round((j+.4+hsh(j*3.3)*.2)*W0/3), y=hy(x)+4, wl=rmp(mix(col,'#c8d0e0',.32)), sc=.62;
      const w=Math.round(80*sc), h=Math.round(60*sc), tw0=Math.round(22*sc), th=Math.round(100*sc);
      R(g,x,y-h,w,h+30,wl[2]); R(g,x+w*.6,y-h,w*.4,h+30,wl[3]); poly(g,[[x,y-h],[x+w/2,y-h-Math.round(20*sc)],[x+w,y-h]],wl[2]);
      for(const tx of [x-tw0,x+w]){ R(g,tx,y-th,tw0,th+30,wl[2]); R(g,tx+tw0-3,y-th,3,th+30,wl[4]); for(let q=0;q<3;q++) ell(g,tx+tw0/2,y-th-3-q*5,tw0/2-q*3,4,wl[1]); if(wc){ g.fillStyle=wc; g.fillRect(tx+tw0/2-1,y-th+6,2,3); } }
      if(wc){ g.fillStyle=wc; g.fillRect(x+w/2-2,y-8,4,6); } }
    for(let i=0;i<W0/120;i++){ const x=i*120+hsh(i*5.7)*70; if(hsh(i*1.3)<.5||x<40||x>W0-60) continue; palmSil(g,x,hy(x)+26,.3,mix(col,'#000010',.2)); } }
  return stripCache[k]=c; }
function strip(g,cv,off,y){ const w=cv.width, o=((Math.round(off)%w)+w)%w; g.drawImage(cv,-o,y); if(w-o<HW) g.drawImage(cv,w-o,y); }
const fogCache={};
function fogBand(col,a){ const k=col+a; if(fogCache[k]) return fogCache[k]; const [c,g]=mk(HW,120); for(let y=0;y<120;y+=2){ const u=y/120; g.globalAlpha=a*Math.sin(u*Math.PI); R(g,0,y,HW,2,col); } return fogCache[k]=c; }
const scratch={};
function drawSky(g,mode,cam,t){ if(!built) build(); const P=SKYP[mode]||SKYP.noite; mode=SKYP[mode]?mode:'noite'; const T=g.getTransform();
  g.save(); g.setTransform(1,0,0,1,T.e,T.f); g.imageSmoothingEnabled=false; R(g,0,0,HW,HH,P.g[P.g.length-1]);
  g.drawImage(skyCanvas(mode),0,0); strip(g,cloudStrip(mode),cam*RS*.03+(t||0)*3,0);
  strip(g,farStrip(mode,1),cam*RS*.08,0); strip(g,farStrip(mode,2),cam*RS*.22,0);
  g.drawImage(fogBand(P.fog,P.fogA),0,HB-110); // neblina baixa sobre a baía (MAP-17)
  g.restore();
  if(!engineDM){ // motor antigo: desenha o mid aqui mesmo, já com a tinta do modo
    if(!scratch.c){ [scratch.c,scratch.g]=mk(HW,HH); } const S=scratch.g; S.setTransform(1,0,0,1,0,0); S.clearRect(0,0,HW,HH);
    fromSky=true; drawMid(S,cam); fromSky=false; S.globalCompositeOperation='source-atop'; S.fillStyle=TINT[mode]; S.fillRect(0,0,HW,HH); S.globalCompositeOperation='source-over';
    g.save(); g.setTransform(1,0,0,1,T.e,T.f); g.drawImage(scratch.c,0,0); g.restore(); }
}

/* luzes aditivas: halos de postes, arandelas, lâmpadas, neon e o facho giratório do Farol da Barra (vermelho na Lua de Sangue, MAP-18). */
const haloCache={};
function halo(col){ if(haloCache[col]) return haloCache[col]; const [c,g]=mk(128,128); for(let i=0;i<8;i++){ const r=64*(1-i/8); g.globalAlpha=.06+i*.012; ell(g,64,64,r,r,col); } return haloCache[col]=c; }
function drawLights(g,cam,mode,t){ if(mode==='manha'||mode==='tarde') return; const T=g.getTransform(), A0=mode==='anoitecer'?.7:1; g.save(); g.globalAlpha=A0; g.setTransform(1,0,0,1,T.e,T.f); g.globalCompositeOperation='lighter'; g.imageSmoothingEnabled=false;
  const warm=mode==='lua'?'#ff7a4a':'#ffc070', fl=1+Math.sin((t||0)*9)*.03;
  for(const L of LAMPS){ let sx, sy=L.y*RS; if(L.fx!=null) sx=(L.fx-cam*1.25)*RS; else sx=(L.x-cam)*RS; if(sx<-200||sx>HW+200) continue; const r=(L.r||24)*RS*fl; g.drawImage(halo(warm),sx-r,sy-r,r*2,r*2); }
  for(const B of BULBS){ const sx=(B.x-cam)*RS; if(sx<-30||sx>HW+30) continue; g.drawImage(halo(B.c||warm),sx-18,B.y*RS-18,36,36); }
  for(const N of NEON){ const sx=(N.x-cam)*RS; if(sx<-200||sx>HW+200) continue; const r=N.w*RS*.8; g.globalAlpha=.8*A0; g.drawImage(halo(N.c),sx-r,N.y*RS-r*.5,r*2,r); g.globalAlpha=A0; }
  const bc=mode==='lua'?'#ff3a2a':'#fff0c0';
  for(const B of BEACONS){ const sx=(B.x-cam)*RS, sy=B.y*RS, len=B.len||900; if(sx<-len||sx>HW+len) continue; const a=(t||0)*1.1+(B.ph||0), L=Math.cos(a)*len, wd=14+Math.abs(Math.sin(a))*26;
    g.globalAlpha=.13*A0; g.fillStyle=bc; g.beginPath(); g.moveTo(sx,sy-3); g.lineTo(sx+L,sy-wd); g.lineTo(sx+L,sy+wd*.5); g.lineTo(sx,sy+3); g.closePath(); g.fill();
    const f=Math.pow(Math.max(0,Math.sin(a)),8); if(f>.02){ g.globalAlpha=f*.8*A0; g.drawImage(halo(bc),sx-90,sy-90,180,180); }
    g.globalAlpha=A0; g.drawImage(halo(bc),sx-26,sy-26,52,52); }
  g.restore(); }

/* =====================================================================
   BUILD
   ===================================================================== */
const PLACA={farol:'FAROL DA BARRA',comercio:'AV. DA FRANCA',modelo:'MERCADO MODELO',plano:'PLANO INCLINADO',ladeiras:'LADEIRA',largo:'PELOURINHO',rosario:'ROSARIO',casaroes:'R. G. DE MATOS',terreiro:'TERREIRO JESUS',tome:'PCA TOME SOUSA',elevador:'ELEVADOR'};
function build(){
  WINDOWS.length=0; LAMPS.length=0; BULBS.length=0; FGI.length=0; NEON.length=0; BEACONS.length=0; DL.length=0; midTiles.fill(null);
  AREAS.forEach(compose);
  DLs=DL.slice().sort((a,b)=>a.z-b.z||a.i-b.i);
  AREAS.forEach(A=>{ const st=680, palmy=['farol','modelo','terreiro','tome'].includes(A.id);
    for(let wx=A.x0+170;wx<A.x1-60;wx+=st){ const k=Math.round((wx-A.x0)/st);
      FGI.push({t:palmy&&k%2?'palm':'poste',x:wx});
      const kinds=A.id==='terreiro'?['fitas','planta','placa','fitas']:['farol','tome','elevador'].includes(A.id)?['grade','planta','barril','placa']:A.id==='comercio'?['lixo','barril','placa','planta']:['planta','lixo','barril','placa','grade','planta'];
      let t=pick(kinds,hsh(wx*.37)); if(t==='placa') t='placa:'+(PLACA[A.id]||'SALVADOR');
      FGI.push({t,x:wx+st*.5}); } });
  FGI.filter(it=>it.t==='poste').forEach(it=>LAMPS.push({fx:it.x*1.25,y:60/RS+.1,r:30}));
  built=true; engineDM=false;
  const [c0,g0]=mk(1,1);
  RL='noite'; collecting=true; for(const e of DLs){ g0.setTransform(1,0,0,1,0,0); e.f(g0,e.x0,e.x1); } collecting=false;
  const uniq=(arr,key)=>{ const m=new Map(); arr.forEach(o=>m.set(key(o),o)); return [...m.values()]; };
  const wins=uniq(WINDOWS,o=>o.x.toFixed(1)+','+o.y.toFixed(1)); WINDOWS.length=0; WINDOWS.push(...wins);
  const lm=uniq(LAMPS,o=>(o.fx!=null?'f'+o.fx:o.x.toFixed(1))+','+o.y.toFixed(1)); LAMPS.length=0; LAMPS.push(...lm);
  const bl=uniq(BULBS,o=>o.x.toFixed(1)+','+o.y.toFixed(1)); BULBS.length=0; BULBS.push(...bl);
  const ne=uniq(NEON,o=>o.x.toFixed(1)+','+o.y.toFixed(1)); NEON.length=0; NEON.push(...ne);
  const be=uniq(BEACONS,o=>o.x.toFixed(1)+','+o.y.toFixed(1)); BEACONS.length=0; BEACONS.push(...be);
  tileAt(0);
}

// tinta sugerida por modo (a noite já vem pintada no mid; os modos de dia clareiam por cima com 'source-atop')
const TINT={manha:'rgba(255,214,190,.05)',tarde:'rgba(255,184,96,.08)',anoitecer:'rgba(140,40,110,.16)',noite:'rgba(14,30,64,.14)',lua:'rgba(120,10,26,.4)'}; // tinta sugerida pro cenário (a noite já vem pintada)
const MODES=Object.keys(SKYP);
return {TINT,MODES,setLight,light:()=>LIGHT,build,mid,midTiles,drawMid,idle:ms=>{ engineIdle=true; return idle(ms); },warm,drawFG,FGI,drawSky,drawLights,AREAS,AID,WINDOWS,LAMPS,BULBS,BEACONS,W,H,BASE,WORLD,OUT,RS,TILE};
})();
