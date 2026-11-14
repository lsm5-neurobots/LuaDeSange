/* AMAZONIA — fonte de arte (editável). Build: npm run art
   Cenário da fase Floresta Amazônica (Manaus → floresta, AM) no mesmo contrato do MAP/LAPA: RS=2.5 → 960×540 px por tela,
   "mid" em tiles de 2048 px renderizados sob demanda (drawMid), céu/fundo em parallax (drawSky, com faixa distante de cidade
   nas áreas de Manaus e de copa nas áreas de mata), primeiro plano (drawFG) e halos aditivos (drawLights: lamparinas, raios de
   luz pela copa, vagalumes, brilho do rio e rio vinho na Lua de Sangue). Coordenadas públicas em unidades lógicas 384×216.
   Primitivas, fachadas genéricas e chão urbano são cópia local do kit da Lapa (cada factory é isolada); o que é do Amazonas
   (porto flutuante e barcos regionais, Mercado Adolpho Lisboa, Teatro Amazonas, Encontro das Águas, palafitas, igarapé,
   terra firme, samaúma e sapopemas, seringal, garimpo, igapó e várzea) está em "AMAZÔNIA · MANAUS E FLORESTA". */
const AMAZONIA=(function(){
const W=384, H=216, BASE=118, OUT='#0f1a14', SC=3, RS=2.5;
const DEF=[
  {id:'porto', name:'Porto de Manaus', short:'Porto', len:768, floor:'tabuas', back:'porto', fights:[22,24], chests:[[.55,'comum']], puzzle:null,
   ref:'Porto flutuante de Manaus · Alfândega e torre do relógio · barcos regionais de dois andares', desc:'Entrada da fase. O cais flutuante de tábua e ferro sobre o Rio Negro, a Alfândega de tijolo e a torre do relógio do porto, os barcos regionais de casco branco e azul com as redes armadas no convés, o galpão flutuante e o guindaste. Isopor, sacas e boias largados no cais.',
   chao:'Tábuas do cais flutuante com poças de água preta', inim:'Errantes no cais · Barqueiros dominando os barcos', bau:'Baú de convés no cais'},
  {id:'adolpho', name:'Mercado Adolpho Lisboa', short:'Mercado', len:768, floor:'ladrilho', back:'mercado', fights:[22,24], chests:[[.5,'médico']], puzzle:.82,
   ref:'Mercado Municipal Adolpho Lisboa (1883) · pavilhão de alvenaria · galpão de ferro Art Nouveau com vitrais', desc:'O pavilhão de alvenaria amarelo e vermelho com o frontão e as torrinhas, e o galpão de ferro verde importado, com os arcos, as rosáceas de vitral e as bancas lá dentro. Na frente, bancas de peixe com pirarucu pendurado, paneiros de açaí, cestos de castanha e balanças de feira.',
   chao:'Ladrilho hidráulico com água de gelo e escama', inim:'Estreia do Seringueiro · Errantes entre as bancas', bau:'Baú médico num balcão · puzzle'},
  {id:'teatro', name:'Teatro Amazonas', short:'Teatro', len:768, floor:'ondas', back:'teatro', fights:[22,26], chests:[[.6,'raro']], puzzle:null,
   ref:'Teatro Amazonas (1896) · cúpula de telhas esmaltadas verde, amarelo e azul · Largo de São Sebastião', desc:'O Largo de São Sebastião com a calçada de ondas pretas e brancas e, no meio, o Teatro Amazonas cor-de-rosa com as colunas brancas, a escadaria e a cúpula de mosaico verde, amarelo e azul, iluminada de baixo à noite. Casarões coloridos e mangueiras em volta.',
   chao:'Calçada de ondas pretas e brancas com raízes rachando', inim:'Primeiros Garimpeiros · Saltador nos bancos', bau:'Baú raro na bilheteria'},
  {id:'encontro', name:'Encontro das Águas', short:'Encontro', len:768, floor:'chapa', back:'rio', fights:[22,26], chests:[[.5,'militar']], puzzle:null,
   ref:'Encontro das Águas · Rio Negro preto e Solimões barrento lado a lado · convés da balsa', desc:'O convés de ferro da balsa no meio do rio: atrás da grade, a água preta do Rio Negro corre ao lado da água barrenta do Solimões sem se misturar, com a linha de espuma no meio, botos aparecendo e a margem verde baixa com Manaus ao longe.',
   chao:'Convés de chapa com poças e faixa amarela', inim:'Barqueiros em maioria · Cardume no costado', bau:'Baú do capitão no convés'},
  {id:'ribeirinha', name:'Comunidade Ribeirinha', short:'Ribeirinha', len:768, floor:'tabuas', back:'palafitas', fights:[22,26], chests:[[.5,'comum']], puzzle:null,
   ref:'Palafitas e casas flutuantes · passarelas de tábua · canoas e rabetas · açaizais', desc:'As casas de palafita de tábua pintada em azul, branco, rosa e verde, com telhado de zinco e varanda, sobre a água preta, ligadas por passarelas. Canoas e rabetas amarradas, redes na varanda, açaizeiros e buritis atrás e a mata fechando o horizonte.',
   chao:'Passarela de tábuas com frestas sobre a água', inim:'Errantes nas passarelas · Barqueiro e Seringueiro', bau:'Baú de madeira numa casa'},
  {id:'igarape', name:'Igarapé', short:'Igarapé', len:768, floor:'lama', back:'mata', fights:[22,26], chests:[[.4,'escondido']], puzzle:null,
   ref:'Igarapé de água preta · tronco caído de ponte · vitórias-régias · cipós', desc:'A mata fecha por cima: troncos com sapopemas, cipós caindo, açaizeiros e samambaias. O igarapé de água preta corre atrás, com um tronco caído servindo de ponte e folhas de vitória-régia, e o chão de lama tem poças onde o cardume de piranhas nada.',
   chao:'Lama, folhas e poças de água preta', inim:'Estreia do Cardume de Piranhas · Rastejante na lama', bau:'Baú enterrado na lama (faro do pet)'},
  {id:'terrafirme', name:'Terra Firme', short:'Terra Firme', len:768, floor:'serapilheira', back:'mata', fights:[22,26], chests:[[.55,'médico']], puzzle:null,
   ref:'Floresta de terra firme · castanheiras e angelins · patauá · sub-bosque escuro', desc:'Mata alta e escura: troncos retos que somem na copa, cipós, palmeiras de patauá, cupinzeiros e fungos. A luz entra em feixes pela copa e o chão é um tapete de folhas secas, raízes e cogumelos.',
   chao:'Serapilheira, raízes e cogumelos', inim:'Estreia do Bugio: urro e salto das árvores', bau:'Baú de pesquisador num tronco'},
  {id:'samauma', name:'Samaúma Gigante', short:'Samaúma', len:768, floor:'clareira', back:'samauma', fights:[24,95], chests:[[.22,'militar']], puzzle:null,
   ref:'Samaúma (Ceiba pentandra) · sapopemas como paredes · clareira com feixe de luz', desc:'A clareira aos pés da samaúma: o tronco cinza de espinhos sobe para fora da tela e as sapopemas, altas como paredes, formam baias onde A Onça-Pintada espreita. Um feixe único de luz cai no meio, cipós e ninhos de arara no tronco.',
   chao:'Clareira de terra, folhas e ossadas', inim:'Mini boss: A Onça-Pintada · Bugios no tronco', bau:'Baú da equipe científica'},
  {id:'seringal', name:'Seringal Abandonado', short:'Seringal', len:768, floor:'terra', back:'seringal', fights:[24,26], chests:[[.5,'raro']], puzzle:.2,
   ref:'Seringal do ciclo da borracha · seringueiras com cortes em espinha · barracão · defumador', desc:'A estrada de seringa entre as seringueiras de casca cinza, com os cortes em espinha escorrendo látex nas tigelas. O barracão de madeira com varanda e telhado de palha, o defumador fumegando e as bolas de borracha preta empilhadas.',
   chao:'Terra batida com poças de látex', inim:'Seringueiros dominam · Bugio no barracão', bau:'Baú do patrão no barracão · puzzle'},
  {id:'garimpo', name:'Garimpo', short:'Garimpo', len:768, floor:'barro', back:'garimpo', fights:[24,26], chests:[[.45,'militar']], puzzle:null,
   ref:'Garimpo · clareira devastada de lama laranja · cava em degraus · draga e lona preta', desc:'A clareira aberta no meio da mata: lama laranja, tocos e árvores caídas, a cava em degraus com a água parada no fundo, a draga com o cano de sucção, os barracos de lona preta e azul e os tonéis. Poças de mercúrio prateadas refletem o céu.',
   chao:'Lama laranja com poças de mercúrio', inim:'Garimpeiros em dupla com Seringueiros', bau:'Baú do capataz no barraco'},
  {id:'igapo', name:'Igapó', short:'Igapó', len:768, floor:'agua', back:'igapo', fights:[24,26], chests:[[.5,'médico']], puzzle:.78,
   ref:'Igapó · floresta alagada do Rio Negro · troncos na água espelhada · névoa', desc:'A floresta alagada de água preta: os troncos saem da água espelhada e se repetem no reflexo, a névoa corre baixa entre eles, troncos caídos viram ponte e a canoa ficou encalhada nas raízes. Folhas boiando e vitórias-régias nas clareiras.',
   chao:'Água rasa espelhada com troncos e folhas', inim:'Piranhas por toda parte · Garimpeiro e Bugio', bau:'Baú preso nas raízes · puzzle'},
  {id:'varzea', name:'Várzea', short:'Várzea', len:640, floor:'lamacal', back:'varzea', fights:[95], chests:[], puzzle:null,
   ref:'Várzea do Solimões · água barrenta · aguapés · palafita em ruínas · remanso', desc:'Arena do chefe: a planície alagada de água barrenta até o horizonte, ilhas de capim e aguapé boiando, embaúbas e troncos secos e uma palafita em ruínas. No remanso fundo do meio, A Cobra-Grande espera com os olhos de lua.',
   chao:'Lamaçal raso com o poço do remanso', inim:'Chefe: A Cobra-Grande', bau:'Nenhum'},
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
function emit(g,fn){ if(LQ) LQ.push([0,fn,g.getTransform()]); else fn(g); }
function emitW(g,fn){ if(RL!=='dia') emit(g,fn); } // luz de janela/poste/reflexo: apagada de dia
function glow(g,cx,cy,r,col,a,steps,ry){ if(LQ){ LQ.push([1,G=>glowNow(G,cx,cy,r,col,a,steps,ry),g.getTransform()]); return; } glowNow(g,cx,cy,r,col,a,steps,ry); }
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
let collecting=false, OFFY=0; const reg=(arr,o)=>{ if(collecting){ if(OFFY&&o.y!=null) o.y-=OFFY/RS; arr.push(o); } }; // OFFY: desenho deslocado (casarões da ladeira)
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
  const words=['FUJA!','SOS','NAO ENTRE','LAPA VIVE','SAMBA','RJ','TEM GENTE','SOCORRO','LUA DE SANGUE','ABRIGO >'], w0=pick(words,hsh(s)), col=pick(['#d8283a','#e8e0d0','#ffd23f','#3ad8c8','#ff5a9a'],hsh(s*3)), sc=hsh(s*5)>.6?3:2;
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
function sangue(g,x,y,s,big){ const r=big?28:14; blob(g,x-r,y-r*.25,r*2,r*.5,'#3e0610'); blob(g,x-r*.7,y-r*.18,r*1.4,r*.36,'#5a0a16'); for(let i=0;i<7;i++) R(g,x-r*1.4+hsh(s+i)*r*2.8,y-r*.4+hsh(s*3+i)*r*.8,2+hsh(i)*3,2,'#4a0812');
  if(hsh(s*5)>.5){ for(let i=0;i<6;i++) R(g,x+r+i*7,y-1+Math.sin(i)*2,6,2,'#3e0610'); } }
function poca(g,x,y,w,s,lamp){ const h=Math.max(5,w*.17), P=[]; for(let k=0;k<18;k++){ const a=k/18*Math.PI*2, r=1+(hsh(s+k*2.3)-.5)*.45; P.push([x+Math.cos(a)*w/2*r,y+Math.sin(a)*h/2*r]); }
  poly(g,P.map(p=>[p[0],p[1]+2]),'#120c1c'); poly(g,P,'#262a5c'); poly(g,P.map(p=>[x+(p[0]-x)*.8,y+(p[1]-y)*.6-1]),'#2e3468');
  for(let k=0;k<4;k++){ const ry=y-h*.3+k*h*.18, rw=w*(.5-k*.08); R(g,x-rw/2+hsh(s+k)*w*.1,ry,rw,1,k%2?'#4a50a0':'#6a6ac0'); }
  R(g,x-w*.32,y-h*.32,w*.22,1,'#a8a8e8');
  if(lamp) emitW(g,g=>{ R(g,x-3,y-h*.42,5,h*.7,'#e8a050'); R(g,x-1,y-h*.36,2,h*.5,'#fff0c0'); }); }
function papel(g,x,y,s){ for(let i=0;i<4;i++) R(g,x+hsh(s+i)*60,y+hsh(s*3+i)*30,5+hsh(i)*4,3,pick(['#e8e0d0','#d8c8a0','#c8d0e0'],hsh(s+i*7))); }
function umidade(g,x,y,w,h,c,s){ // mancha de umidade escorrendo de uma cornija/peitoril, borda de baixo irregular
  const col=mix(c[4],'#2a4a3a',.35); g.save(); for(let k=0;k<3;k++){ g.globalAlpha=.28+k*.1; const ww=w*(1-k*.25), xx=x+(w-ww)/2;
    for(let i=0;i<ww;i+=3){ const hh=h*(1-k*.3)*(.45+hsh(s+i*.37+k)*.55); R(g,xx+i,y,3,hh,col); } } g.restore(); R(g,x,y,w,2,c[4]); }
function limo(g,x,y,w,c,s){ g.save(); for(let i=0;i<w;i+=2){ const hh=6+hsh(s+i*.29)*26*(.5+.5*Math.sin(i/23+s)); g.globalAlpha=.6; R(g,x+i,y-hh,2,hh,'#2e4a34'); g.globalAlpha=.3; if(hh>10) R(g,x+i,y-hh-2,2,2,'#4a7a44'); } g.restore(); }
function reboco(g,x,y,w,h,c,s){ // reboco caído: borda clara quebrada, tijolo, sombra
  const P=[]; for(let i=0;i<14;i++){ const a=i/14*Math.PI*2, r=1+(hsh(s+i*1.9)-.5)*.5; P.push([x+w/2+Math.cos(a)*w/2*r,y+h/2+Math.sin(a)*h/2*r]); }
  poly(g,P.map(p=>[p[0]-1,p[1]-2]),c[1]); poly(g,P.map(p=>[p[0]+1,p[1]+2]),c[4]); g.save(); g.beginPath(); g.moveTo(P[0][0],P[0][1]); P.forEach(p=>g.lineTo(p[0],p[1])); g.closePath(); g.clip(); brick(g,x-4,y-4,w+8,h+8,s,mix('#8a5040',c[3],.45)); shade(g,x-4,y-4,w+8,6,'#100624',.35); g.restore(); }

/* =====================================================================
   AMAZÔNIA · MANAUS E FLORESTA
   ===================================================================== */
const RAYS=[], FIRE=[], WATER=[]; // feixes de luz pela copa · trechos com vagalumes · trechos de rio com brilho (unidades lógicas)
const FOG='#a2c6b2', HZC=182; // névoa da mata · linha d'água do rio ao fundo nas áreas de Manaus
const LITTER=['#7a5434','#8e6a3e','#6a4a2e','#9a7a48','#5e4a2c','#a0643a','#6e6a34','#b08850'];
const BRANCO=rmp('#ece6d6'), AZULB=rmp('#2a5aa8'), AMAR=rmp('#f0c23a'), VERM=rmp('#c8382a'), MAD=rmp('#c9a06a'), MADV=rmp('#6e5238'), IRONV=rmp('#3a5a48'), ZINCO=rmp('#8a9aa0');
const dep=(col,k)=>k?mix(col,FOG,k):col;
const RCB=new Map(); // rampa de casca/pedra: sombra puxa pro roxo-acastanhado (menos azul que rmp), luz pro creme
function rmpB(h){ let r=RCB.get(h); if(!r){ r=[mix(h,'#fff0c8',.42),mix(h,'#ffe4b0',.2),h,mix(h,'#3a2a46',.32),mix(h,'#1e1428',.52),mix(h,'#0c0810',.72)]; RCB.set(h,r); } return r; }
function hz2(col,y,y0,amt){ return mix(col,'#6a8a7e',Math.max(0,1-(y-y0)/(HH-y0))*amt); }
function folha(g,x,y,a,len,c1,c2){ const ca=Math.cos(a), sa=Math.sin(a); for(let t=0;t<len;t++){ const w=t<len*.65?2:1; R(g,x+ca*t,y+sa*t,w,w,t<len*.45?c1:c2); } }
// aglomerado de folhas: massa escura, tufos em 4 tons com hue shift e borda serrilhada de folhas soltas
function folhagem(g,cx,cy,r,base,s,fog){ const c=rmp(dep(base,fog)), n=Math.max(5,Math.round(r/5));
  ell(g,cx,cy+r*.1,r,r*.7,c[4]);
  const T=[]; for(let i=0;i<n;i++){ const a=hsh(s+i*1.7)*Math.PI*2, d=Math.sqrt(hsh(s*3+i*1.1))*r*.72; T.push([cx+Math.cos(a)*d,cy+Math.sin(a)*d*.6,r*(.22+hsh(s+i*5.3)*.2)]); }
  T.sort((p,q)=>q[1]-p[1]);
  for(const [px,py,rr] of T) ell(g,px,py+rr*.2,rr,rr*.78,c[3]);
  for(const [px,py,rr] of T){ if(py>cy+r*.32) continue; ell(g,px-rr*.16,py-rr*.12,rr*.74,rr*.54,c[2]); if(py<cy+r*.05) ell(g,px-rr*.32,py-rr*.3,rr*.4,rr*.27,c[1]); }
  for(let i=0;i<n*4;i++){ const a=hsh(s*7+i*.37)*Math.PI*2, px=cx+Math.cos(a)*r*(.86+hsh(i+s)*.16), py=cy+r*.1+Math.sin(a)*r*.66, up=py<cy;
    folha(g,px,py,a+(hsh(i*3+s)-.5)*.9,3+hsh(s+i)*5,up?c[2]:c[4],up?c[1]:c[3]); }
  for(let i=0;i<n*2;i++){ const px=cx+(hsh(s*11+i)-.5)*r*1.3, py=cy-r*.55+hsh(s*13+i)*r*.55; if(((px-cx)/r)**2+((py-cy)/(r*.62))**2>.75) continue; R(g,px,py,2,1,c[0]); }
}
function copa(g,a,b,y,r,base,s,fog,gap,nofill){ const c=rmp(dep(base,fog)), st=r*1.15, L=[];
  for(let k=Math.floor(a/st)-1;k<b/st+2;k++){ const v=hsh(k*3.1+s); if(gap&&v<gap) continue; L.push([k*st+(hsh(k*7.3+s)-.5)*r*.5, y+(hsh(k*5.9+s)-.5)*r*.7, r*(.85+hsh(k*2.3+s)*.35), k]); }
  if(!nofill) for(const [x,yy,rr] of L) R(g,x-st*.72,0,st*1.44,Math.max(0,yy-rr*.2),c[4]);
  L.sort((p,q)=>p[1]-q[1]); for(const [x,yy,rr,k] of L) folhagem(g,x,yy,rr,base,s+k*13,fog); }
// tronco com casca, fissuras, líquen e musgo do lado úmido
function tronco(g,x,yt,yb,w,base,s,o={}){ const c=rmpB(dep(base,o.fog)), h=Math.max(1,yb-yt), bend=o.bend||0, fl=o.flare??.6;
  const cx=y=>x+Math.round(Math.sin((y-yt)/h*Math.PI*.8+s)*bend), wd=y=>Math.max(2,Math.round(w*(1+Math.pow(Math.max(0,(y-yt)/h),8)*fl)));
  for(let y=yt;y<yb;y+=2){ const xx=cx(y), ww=wd(y), l=xx-ww/2;
    R(g,l-1,y,ww+2,2,c[5]); R(g,l,y,ww,2,c[2]); R(g,l,y,Math.max(1,Math.round(ww*.24)),2,c[1]); if(ww>6) R(g,l+1,y,Math.max(1,Math.round(ww*.07)),2,c[0]);
    R(g,l+Math.round(ww*.58),y,Math.round(ww*.26),2,c[3]); R(g,l+Math.round(ww*.84),y,Math.ceil(ww*.16),2,c[4]); }
  if(w>=10){
    for(let i=0;i<w/4;i++){ const u=hsh(s+i*3.7), y0=yt+hsh(s*2+i)*h, len=16+hsh(s*5+i)*70; for(let y=y0;y<Math.min(yb,y0+len);y+=2){ const ww=wd(y); R(g,cx(y)-ww/2+u*ww+Math.sin(y*.06+i)*1.2,y,1,2,u<.3?c[3]:c[4]); } }
    for(let i=0;i<w/8;i++){ const y0=yt+hsh(s*9+i)*h, ww=wd(y0), px=cx(y0)-ww/2+hsh(s*11+i)*ww*.75; blob(g,px,y0,4+hsh(i+s)*w*.22,3+hsh(i*3+s)*8,hsh(s+i*7)>.5?mix(c[2],'#8a9a6a',.4):mix(c[1],'#d0ccb0',.3)); }
    if(w>60) for(let i=0;i<w/14;i++){ const u=.08+hsh(s*17+i)*.84, y0=yt+hsh(s*19+i)*h*.5; for(let y=y0;y<yb;y+=2){ const ww=wd(y), px=cx(y)-ww/2+u*ww+Math.sin(y*.02+i)*3; R(g,px,y,3,2,u<.45?c[1]:c[3]); R(g,px+3,y,2,2,u<.45?c[2]:c[4]); } } // costelas/dobras de tronco grande
    if(o.moss!==false){ const ms=Math.min(36,6+w*.18); for(let y=yt;y<yb;y+=Math.max(4,ms*.5)){ for(let j=0;j<Math.max(1,w/40);j++){ const lf=lowf(x+j*53,y,s+j)-(w>120?.18:0); if(lf<.25||hsh(y*.71+j+s)<.35) continue; y+=hsh(y+j)*3; const ww=wd(y), px=cx(y)-ww/2+hsh(y*.3+j+s)*ww*.45, bw=ms*(lf+.2), bh=bw*.5;
      blob(g,px,y,bw,bh,dep('#3e6a2a',o.fog)); blob(g,px+1,y,bw*.7,bh*.5,dep('#5a8a34',o.fog)); R(g,px+2,y,Math.max(2,bw*.4),1,dep('#8ab84a',o.fog)); } } }
  }
  return {cx,wd}; }
// sapopemas (raízes tabulares): paredes finas que abrem do tronco até o chão, borda côncava com luz no fio
function sapopemas(g,x,yb,w,hgt,base,s,n,fog){ const c=rmpB(dep(base,fog));
  const F=[]; for(let i=0;i<n;i++){ const side=i%2?1:-1, k=Math.floor(i/2); F.push({side,k,reach:w*(.6+k*.55+hsh(s+i)*.5),top:yb-hgt*(.5+hsh(s*3+i)*.5)*(1-k*.12),root:x+side*w*(.2+k*.06)}); }
  F.sort((p,q)=>q.k-p.k);
  for(const f of F){ const {side,reach,top,root}=f, far=root+side*(w*.35+reach), E=[];
    for(let j=0;j<=14;j++){ const t=j/14; E.push([root+(far-root)*t, top+(yb-top)*Math.pow(t,.5)]); }
    const lit=side<0; poly(g,[...E,[root,yb]],lit?c[2]:c[3]);
    poly(g,[...E.map(p=>[p[0],p[1]]),...E.slice().reverse().map(p=>[p[0]-side*3,p[1]+4])],lit?c[1]:c[4]);
    for(let j=0;j<E.length-1;j++) line(g,E[j][0],E[j][1],E[j+1][0],E[j+1][1],lit?c[0]:c[2]);
    for(let i=0;i<reach/10;i++){ const t=hsh(s+i*2.1+f.k), px=root+(far-root)*t*.95, py0=top+(yb-top)*Math.pow(t,.5)+4; for(let y=py0;y<yb-2;y+=2) R(g,px+Math.sin(y*.08+i)*1,y,1,2,lit?c[3]:c[4]); }
    shade(g,Math.min(root,far),yb-10,Math.abs(far-root),10,'#0c1408',.35);
    for(let i=0;i<4;i++){ const t=.2+hsh(s*7+i+f.k)*.7, px=root+(far-root)*t, py=top+(yb-top)*Math.pow(t,.5); blob(g,px-6,py,12+hsh(i)*10,4,dep('#4e7a2e',fog)); }
  } }
// sapopemas que vêm na direção de quem olha: cunhas estreitas na frente do tronco, face clara e face escura (desenhar depois do tronco)
function sapFrente(g,x,yb,w,hgt,base,s,n,fog){ const c=rmpB(dep(base,fog)); for(let i=0;i<Math.floor(n/3);i++){ const fx=x+(i-(n/3-1)/2)*w*.45+(hsh(s*23+i)-.5)*w*.15, ft=yb-hgt*(.45+hsh(s*29+i)*.35), fw=w*.12+6, by=yb+4+i*3;
    poly(g,[[fx-2,ft],[fx+2,ft],[fx+fw,by],[fx-fw*1.3,by]],c[5]); poly(g,[[fx-2,ft],[fx,ft],[fx,by],[fx-fw*1.2,by]],c[1]); poly(g,[[fx,ft],[fx+2,ft],[fx+fw-2,by],[fx,by]],c[3]);
    line(g,fx-1,ft,fx-fw*1.2,by,c[0]); for(let y=ft+10;y<by;y+=7) R(g,fx-(y-ft)/(by-ft)*fw*.9,y,(y-ft)/(by-ft)*fw*.7,1,c[2]); blob(g,fx-fw*.6,by-12,fw*1.2,6,dep('#4e7a2e',fog)); }
}
function cipo(g,x0,y0,x1,y1,sg,s,fog){ const c=rmp(dep('#5a6a2e',fog)), lf=rmp(dep('#4d8a3c',fog));
  sag(g,x0,y0,x1,y1,sg,c[4],3,(x,y,i)=>{ R(g,x,y,1,1,c[1]); if(i%11===0&&hsh(s+i)>.35){ folha(g,x,y+2,1.1+hsh(i+s),5+hsh(i)*5,lf[2],lf[1]); folha(g,x,y+2,2.2-hsh(i*3+s),4+hsh(i*2)*4,lf[3],lf[2]); } }); }
function cipoV(g,x,y0,len,s,fog){ const c=rmp(dep('#4e6a2a',fog)), lf=rmp(dep('#4d8a3c',fog));
  for(let y=y0;y<y0+len;y+=2){ const px=x+Math.sin(y*.03+s)*3; R(g,px-1,y,3,2,c[4]); R(g,px-1,y,1,2,c[2]); if(((y-y0)>>1)%6===0){ const sd=((y>>1)%12)<6; folha(g,px,y,sd?.5:2.6,6+hsh(s+y)*5,lf[2],lf[1]); } }
  const ey=y0+len; for(let k=0;k<5;k++) folha(g,x+Math.sin(ey*.03+s)*3,ey,1.2+k*.18,6+k,lf[3],lf[2]); }
function acai(g,x,yb,h,s,fog){ const tr=rmp(dep('#8a7a62',fog)), lf=rmp(dep('#4d8a3c',fog)), lean=(hsh(s)-.5)*70;
  let tx=x, ty=yb; for(let y=0;y<h;y+=2){ const t=y/h; tx=x+lean*t*t; ty=yb-y; R(g,tx-2,ty,5,2,tr[4]); R(g,tx-2,ty,2,2,tr[1]); R(g,tx,ty,1,2,tr[2]); if(y%12===0) R(g,tx-2,ty,5,1,tr[3]); }
  R(g,tx-3,ty-16,6,18,lf[3]); R(g,tx-3,ty-16,2,18,lf[2]);
  for(let i=0;i<9;i++) R(g,tx+3+hsh(s+i)*7,ty+2+hsh(s*2+i)*9,3,3,dep(i%3?'#3a1a3a':'#5a2a5a',fog));
  for(let k=0;k<9;k++){ const a=-Math.PI*.98+(k/8)*Math.PI*.96+(hsh(s+k)-.5)*.3, len=38+hsh(s*3+k)*30, ox=tx, oy=ty-14;
    for(let r=0;r<len;r+=2){ const px=ox+Math.cos(a)*r, py=oy+Math.sin(a)*r*.7+r*r/(len*1.2); R(g,px,py,2,2,lf[4]); if(r>4){ const L=(1-r/len)*9+3; line(g,px,py+1,px-2,py+L,((r>>1)%2)?lf[2]:lf[1]); line(g,px+1,py+1,px+3,py+L,lf[3]); } } } }
function buriti(g,x,yb,h,s,fog){ const tr=rmp(dep('#7a6a58',fog)), lf=rmp(dep('#5a8a3a',fog)); // palmeira de leque
  for(let y=0;y<h;y+=2){ const ww=12-y/h*3; R(g,x-ww/2,yb-y,ww,2,tr[2]); R(g,x-ww/2,yb-y,3,2,tr[1]); R(g,x+ww/2-3,yb-y,3,2,tr[4]); if(y%10===0) R(g,x-ww/2,yb-y,ww,1,tr[3]); }
  const ty=yb-h; for(let k=0;k<7;k++){ const a=-Math.PI+.25+k*.45+(hsh(s+k)-.5)*.2, cx=x+Math.cos(a)*30, cy=ty+Math.sin(a)*22;
    line(g,x,ty,cx,cy,lf[4],2); for(let j=-6;j<=6;j++){ const aa=a+j*.09; line(g,cx,cy,cx+Math.cos(aa)*26,cy+Math.sin(aa)*22+Math.abs(j)*1.5,j<0?lf[1]:lf[2]); } }
  for(let k=0;k<3;k++){ const cx=x-14+k*14; line(g,x,ty,cx,ty+30,tr[3],2); for(let j=-4;j<=4;j++) line(g,cx,ty+30,cx+j*3,ty+52,tr[2]); } }
function samambaia(g,x,yb,sz,s,base){ const lf=rmp(base||'#4a8a3a'); for(let k=0;k<7;k++){ const a=-Math.PI/2+(k-3)*.4+(hsh(s+k)-.5)*.2, len=sz*(.6+hsh(s*2+k)*.5);
  for(let r=0;r<len;r+=2){ const px=x+Math.cos(a)*r, py=yb+Math.sin(a)*r+r*r/len*.7; R(g,px,py,2,2,lf[4]); if(r>2){ const L=(1-r/len)*sz*.17+1; line(g,px,py,px+Math.cos(a-1.4)*L,py+Math.sin(a-1.4)*L,lf[2]); line(g,px,py,px+Math.cos(a+1.4)*L,py+Math.sin(a+1.4)*L,lf[1]); } } } }
function folhaGrande(g,x,yb,len,a,s,base){ const c=rmp(base||'#3e8a44'); const ca=Math.cos(a), sa=Math.sin(a), nx=-sa, ny=ca; // folha de bananeira/helicônia com nervura
  line(g,x,yb,x+ca*len*.3,yb+sa*len*.3,c[4],3);
  for(let t=.25;t<1;t+=.02){ const px=x+ca*len*t, py=yb+sa*len*t+t*t*len*.15, wd=Math.sin((t-.25)/.75*Math.PI)*len*.18;
    line(g,px,py,px+nx*wd,py+ny*wd,hsh(t*99+s)>.85?c[4]:c[2]); line(g,px,py,px-nx*wd,py-ny*wd,c[1]); R(g,px,py,2,2,c[3]); }
}
function heliconia(g,x,yb,s){ const st=rmp('#3e7a3a'); line(g,x,yb,x+2,yb-60,st[3],2); for(let k=0;k<5;k++){ const y=yb-60+k*9, sd=k%2?1:-1; poly(g,[[x+2,y],[x+2+sd*14,y-6],[x+2+sd*4,y+4]],k%2?'#e8402a':'#d8302a'); R(g,x+2+sd*12,y-6,2,2,'#f2c230'); }
  folhaGrande(g,x,yb-6,46,-2.3,s,'#3e8a44'); folhaGrande(g,x,yb-10,42,-.9,s+1,'#468a3e'); }
function cogumelos(g,x,yb,s,glowC){ for(let i=0;i<4;i++){ const px=x+i*7+hsh(s+i)*4, h=4+hsh(s*2+i)*6, r=3+hsh(i+s)*4; R(g,px,yb-h,2,h,'#e8dcc0'); ell(g,px+1,yb-h,r,r*.5,'#c8a878'); R(g,px+1-r*.6,yb-h-1,r*.8,1,'#f0e0c0');
  if(glowC){ const X=px,Y=yb-h,RR=r; emitW(g,g=>{ ell(g,X+1,Y,RR,RR*.5,glowC); R(g,X,Y-1,2,1,'#ffffff'); }); glow(g,px,yb-h,18,glowC,.08,4); } } }
function pedraMusgo(g,x,yb,w,s){ const r=rmp('#6a6a5e'); blob(g,x-1,yb-w*.45-1,w+2,w*.45+2,r[5]); blob(g,x,yb-w*.45,w,w*.45,r[2]); blob(g,x+2,yb-w*.45+1,w*.5,w*.15,r[1]); blob(g,x+w*.1,yb-w*.48,w*.7,w*.14,'#4e7a2e'); R(g,x+w*.2,yb-w*.48,w*.3,1,'#86b23e'); }
function galho(g,x,y,len,s){ const c=rmp('#6a4a30'); for(let t=0;t<len;t+=2){ const yy=y+Math.sin(t*.05+s)*3; R(g,x+t,yy,2,3,c[3]); R(g,x+t,yy,2,1,c[1]); if(t>8&&hsh(s+t)>.93){ line(g,x+t,yy,x+t+10,yy-6-hsh(t)*6,c[3],2); } } }
function raiz(g,x,y,len,s,col){ const c=rmp(col||'#6e5238'); for(let t=0;t<len;t+=2){ const yy=y+Math.sin(t*.022+s)*7+Math.sin(t*.07+s*2)*2, w=Math.max(2,Math.round(8*(1-t/len)+2)); R(g,x+t,yy-w/2,2,w,c[3]); R(g,x+t,yy-w/2,2,1,c[1]); R(g,x+t,yy+w/2-1,2,2,c[5]); if(w>5) R(g,x+t,yy-w/2+1,2,1,c[2]); } }
function tocoArv(g,x,yb,w,s){ const c=rmp('#8a6a4a'); R(g,x,yb-w*.7,w,w*.7,c[2]); R(g,x,yb-w*.7,w*.3,w*.7,c[1]); R(g,x+w*.75,yb-w*.7,w*.25,w*.7,c[4]); ell(g,x+w/2,yb-w*.7,w/2,w*.18,'#d8b888'); ell(g,x+w/2,yb-w*.7,w*.32,w*.11,'#c09868'); ell(g,x+w/2,yb-w*.7,w*.12,w*.05,'#a07848');
  for(const sd of [-1,1]) poly(g,[[x+w/2+sd*w*.4,yb-w*.3],[x+w/2+sd*w*.8,yb],[x+w/2+sd*w*.3,yb]],sd<0?c[2]:c[3]); }
function troncoCaido(g,x,yb,len,w,s,fog){ const c=rmp(dep('#7a5a40',fog)); for(let t=0;t<len;t+=2){ const yy=yb-w+Math.sin(t*.01+s)*2; R(g,x+t,yy,2,w,c[2]); R(g,x+t,yy,2,w*.3,c[1]); R(g,x+t,yy+w*.7,2,w*.3,c[4]); if(hsh(s+t*.3)>.9) R(g,x+t,yy+2,1,w-4,c[4]); if(lowf(x+t,yb,s)>.3) R(g,x+t,yy-1,2,3,dep('#5a8a34',fog)); }
  ell(g,x,yb-w/2,w*.25,w/2,c[3]); ell(g,x,yb-w/2,w*.18,w*.38,'#c8a070'); ell(g,x,yb-w/2,w*.08,w*.16,c[4]); }
function cupinzeiro(g,x,yb,h,s){ const c=rmp('#8a5a3a'); for(let y=0;y<h;y+=2){ const ww=h*.55*Math.sqrt(1-y/h)+Math.sin(y*.3+s)*3; R(g,x-ww/2,yb-y,ww,2,c[2]); R(g,x-ww/2,yb-y,ww*.3,2,c[1]); R(g,x+ww*.2,yb-y,ww*.3,2,c[3]); }
  for(let i=0;i<h/3;i++) ell(g,x+(hsh(s+i)-.5)*h*.4,yb-hsh(s*2+i)*h*.9,2,1.5,c[4]); }
// chão da mata: serapilheira em perspectiva com folhas secas, manchas úmidas e brotos
function fMata(g,a,b,s,o={}){ const base=o.base||'#6a4a30', y0=o.y0||HB, pal=o.pal||LITTER; R(g,a,y0,b-a,HH-y0,mix(base,'#140c10',.45));
  rowsC('mt'+y0,y0,HH,5,.055).forEach(([y,h],ri)=>{ const d=(y-y0)/(HH-y0);
    for(let x=Math.floor(a/8)*8;x<b;x+=8){ const lf=lowf(x,y,s)+(hsh(x*.13+ri)-.5)*.18, col=lf>.42?mix(base,'#2a1c14',.38):lf>.2?mix(base,'#2a1c14',.18):lf<-.42?mix(base,o.lite||'#a8844e',.32):lf<-.2?mix(base,o.lite||'#a8844e',.15):base; R(g,x,y,8,h,hz2(col,y,y0,.4)); }
    const step=Math.max(3,Math.round(9-d*5));
    for(let k=Math.floor(a/step)-1;k<b/step+1;k++){ const v=hsh(k*1.37+ri*9.1+s); if(v<.35) continue; const x=k*step+hsh(v*7)*step, yy=y+hsh(v*13)*h, sz=1+d*3.5, col=hz2(pick(pal,hsh(v*31)),y,y0,.35), cc=rmp(col);
      if(v>.9){ R(g,x,yy,sz*2+1,Math.max(1,sz*.6),cc[1]); } else { R(g,x,yy,sz*2,Math.max(1,sz*.8),cc[2]); R(g,x,yy,sz*2,1,cc[1]); if(sz>2) R(g,x+1,yy+Math.max(1,sz*.8),sz*2-1,1,cc[4]); } }
    if(o.broto!==false) for(let k=Math.floor(a/41);k<b/41+1;k++){ const v=hsh(k*5.3+ri*3.7+s); if(v>.93&&d>.1){ const x=k*41+v*20, gc=rmp('#4e8a3a'); for(let j=0;j<3;j++) folha(g,x,y+h,-1.57+(j-1)*.6,4+d*8,gc[2],gc[1]); } }
  });
  if(o.pedras!==false) for(let k=Math.floor(a/37);k<b/37+1;k++){ const v=hsh(k*4.1+s*1.3); if(v<.8) continue; const x=k*37+v*20, y=y0+12+hsh(k*7.7+s)*(HH-y0-20), d=(y-y0)/(HH-y0), w=4+d*10+v*6, r=rmpB(hz2(pick(['#7a7466','#6a6a5c','#8a7a62'],v),y,y0,.35));
    blob(g,x-1,y-w*.4-1,w+2,w*.45+2,r[5]); blob(g,x,y-w*.4,w,w*.42,r[2]); R(g,x+1,y-w*.4,w*.5,1,r[0]); R(g,x+w*.5,y-w*.1,w*.4,w*.1,r[3]); if(v>.93) R(g,x,y-w*.42,w*.6,2,'#5a8a34'); }
  if(o.luz!==false) for(let k=Math.floor(a/520);k<b/520+1;k++){ const v=hsh(k*9.3+s); if(v<.5) continue; const x=k*520+v*200, y=y0+40+hsh(k*3.1+s)*150; g.save(); g.globalAlpha=RL==='dia'?.08:.03; ell(g,x,y,90+v*80,16+v*10,'#ffe8b0'); ell(g,x,y,50+v*40,9+v*5,'#fff4d0'); g.restore(); }
  shade(g,a,y0,b-a,8,'#0a0c08',.4); }
function fBarro(g,a,b,s){ fMata(g,a,b,s,{base:'#b4642c',lite:'#d88a48',pal:['#c8743a','#9a5226','#d8904c','#8a4a22','#e0a060'],broto:false,luz:false});
  rowsC('mt'+HB,HB,HH,5,.055).forEach(([y,h],ri)=>{ for(let k=Math.floor(a/90);k<b/90+1;k++){ const v=hsh(k*2.7+ri*5.1+s); if(v>.82) R(g,k*90+v*60,y+h-1,30+v*50,1,'#e8a868'); else if(v<.1) R(g,k*90,y,40,1,'#6a3418'); } });
  for(let k=Math.floor(a/600);k<b/600+1;k++){ const x0=k*600+hsh(k)*200, y0=HB+60+hsh(k*3)*150; for(let i=0;i<10;i++){ const px=x0+i*26, py=y0+Math.sin(i)*4; ell(g,px,py,5,3,'#6a3418'); ell(g,px,py-1,4,2,'#8a4a22'); } }
  for(let k=Math.floor(a/900);k<b/900+1;k++){ const y=HB+40+hsh(k*7)*190; for(let x=k*900;x<k*900+700;x+=2){ R(g,x,y+Math.sin(x*.004+k)*10,2,3,'#7a3c1a'); R(g,x,y+26+Math.sin(x*.004+k)*10,2,3,'#7a3c1a'); } } }
// poça de água preta/barrenta/mercúrio/látex (reflete o céu conforme a luz)
function poca2(g,x,y,w,s,kind){ const h=Math.max(6,w*.2), P=[]; for(let k=0;k<20;k++){ const a=k/20*Math.PI*2, r=1+(hsh(s+k*2.3)-.5)*.5; P.push([x+Math.cos(a)*w/2*r,y+Math.sin(a)*h/2*r]); }
  const sky=RL==='dia'?'#9ec4d4':RL==='dusk'?'#e8906a':'#3a4a70';
  const C=kind==='mercurio'?['#5a6066','#a8b0b8','#d8e0e6','#ffffff']:kind==='latex'?['#a8a494','#e8e4d6','#f6f2e8','#ffffff']:kind==='barro'?['#4a3018','#7a5a30','#9a7a48',sky]:['#1a1610','#2a261e',mix('#3a362c',sky,.35),sky];
  poly(g,P.map(p=>[p[0],p[1]+2]),mix(C[0],'#000000',.3)); poly(g,P,C[0]); poly(g,P.map(p=>[x+(p[0]-x)*.85,y+(p[1]-y)*.7]),C[1]);
  for(let k=0;k<4;k++){ const ry=y-h*.25+k*h*.17, rw=w*(.5-k*.09); R(g,x-rw/2+hsh(s+k)*w*.1,ry,rw,1,k%2?C[2]:mix(C[2],C[3],.5)); }
  R(g,x-w*.3,y-h*.3,w*.2,1,C[3]); if(kind!=='latex'&&kind!=='mercurio') for(let k=0;k<3;k++){ const lx=x+(hsh(s*3+k)-.5)*w*.6, ly=y+(hsh(s*5+k)-.5)*h*.5; ell(g,lx,ly,3,1.5,pick(LITTER,hsh(s+k))); } }
// água de fundo (faixa de rio): chá-preto do Rio Negro ou barro do Solimões, ondinhas e reflexo do céu na faixa de cima
const WPAL={negro:['#3a3a38','#2c2924','#221e18','#1c1812','#16130e','#120f0a'],barro:['#a08052','#927448','#846840','#785c38','#6a5032','#5c462c'],barroC:['#8a6e46','#7a603c','#6c5434','#5e482c','#523e26','#463420']};
function skyRefl(){ return RL==='dia'?'#b8d4e0':RL==='dusk'?'#f0a070':'#4a5a88'; }
function rio(g,a,b,y0,y1,kind,s,seam){ const P=WPAL[kind], n=P.length, sk=skyRefl();
  rowsC('ri'+y0+'_'+y1,y0,y1,2,.05).forEach(([y,h],ri)=>{ const d=(y-y0)/Math.max(1,y1-y0); R(g,a,y,b-a,h,mix(P[Math.min(n-1,Math.floor(d*n))],sk,Math.max(0,.35-d*.6)));
    const L=6+d*40; for(let k=Math.floor(a/26)-1;k<b/26+1;k++){ const v=hsh(k*2.3+ri*5.1+s); if(v>.62){ const x=k*26+v*18; R(g,x,y,L*(v-.45),1,mix(P[0],sk,.45+(v>.92?.4:0))); if(h>2) R(g,x+2,y+1,L*(v-.45)-4,1,P[n-1]); } } });
  R(g,a,y0,b-a,1,mix(P[0],sk,.6)); }
// água rasa como chão (igapó, várzea, poças grandes): espelho do céu, ondulação, folhas boiando
function fAguaChao(g,a,b,s,kind,y0){ y0=y0||HB; const P=WPAL[kind], n=P.length, sk=skyRefl();
  rowsC('ag'+y0+kind,y0,HH,3,.05).forEach(([y,h],ri)=>{ const d=(y-y0)/(HH-y0); let wc=mix(P[Math.min(n-1,1+Math.floor(d*(n-1)))],sk,Math.max(0,(kind==='barroC'?.5:.22)-d*.6)); if(kind==='negro'||kind==='negroC') wc=mix(wc,kind==='negroC'?'#58805c':'#3e5e48',Math.max(0,(kind==='negroC'?.6:.4)-d*.9)); R(g,a,y,b-a,h,wc);
    if(kind==='barroC') for(let x=Math.floor(a/40)*40;x<b;x+=40){ const lf=lowf(x,y*2,s); if(lf>.3) R(g,x,y,40,h,mix(wc,sk,.18)); else if(lf<-.35) R(g,x,y,40,h,mix(wc,'#2a1e12',.15)); }
    const L=10+d*60; for(let k=Math.floor(a/34)-1;k<b/34+1;k++){ const v=hsh(k*2.9+ri*4.3+s); if(v>(kind==='barroC'?.45:.58)){ const x=k*34+v*22; R(g,x,y,L*(v-.45),1,mix(P[0],sk,.35+(v>.93?.35:0))); R(g,x+3,y+1,L*(v-.45)-6,1,P[n-1]); } }
    for(let k=Math.floor(a/23)-1;k<b/23+1;k++){ const v=hsh(k*7.1+ri*1.3+s*2); if(v>.965){ const x=k*23, sz=2+d*4; ell(g,x,y+h/2,sz*1.4,sz*.5,pick(LITTER,hsh(v*9))); R(g,x-sz,y+h/2-1,sz,1,'#c8a870'); } } }); }
function vitoria(g,x,y,r,s){ const c=rmp('#4e8a34'); ell(g,x,y+1,r+1,r*.32+1,'#1a2a14'); ell(g,x,y,r,r*.32,c[2]); ell(g,x-r*.15,y-r*.05,r*.7,r*.2,c[1]); poly(g,[[x,y],[x+r,y-r*.06],[x+r,y+r*.08]],'#1a2a14');
  for(let a=0;a<Math.PI*2;a+=.25) R(g,x+Math.cos(a)*r,y+Math.sin(a)*r*.32-1,2,2,c[3]); R(g,x-r,y-1,r*2,1,mix(c[2],'#c84a3a',.3));
  if(hsh(s)>.7){ ell(g,x-r*.3,y-r*.25,4,3,'#f4e8f0'); R(g,x-r*.3-1,y-r*.3,2,2,'#e888b0'); } }
function aguape(g,x,y,w,s){ const c=rmp('#4a8a3e'); for(let i=0;i<w/6;i++){ const px=x+hsh(s+i)*w, py=y-hsh(s*2+i)*8; ell(g,px,py,5,4,c[3]); ell(g,px-1,py-1,4,3,c[2]); R(g,px-2,py-3,2,1,c[1]); }
  for(let i=0;i<w/30;i++){ const px=x+hsh(s*5+i)*w, py=y-10-hsh(s*7+i)*6; R(g,px,py,1,8,c[3]); for(let j=0;j<3;j++) R(g,px-2+j*2,py-2-j*2,3,2,j===1?'#c8a0e8':'#a87ad8'); } }
// tábuas em perspectiva (cais, passarelas, convés de madeira); com água aparecendo nas frestas
function fTabuas(g,a,b,s,col,y0,agua){ y0=y0||HB; R(g,a,y0,b-a,HH-y0,agua?WPAL.negro[4]:'#1a120c');
  rowsC('tb'+y0,y0,HH,9,.1).forEach(([y,h],ri)=>{ const d=(y-y0)/(HH-y0); let x=a-Math.round(hsh(ri*3.1+s)*260), k=0;
    while(x<b){ const v=hsh(k*9.3+ri*41.7+s), sw=Math.round(120+hsh(v*5)*240);
      if(v>.965&&agua){ x+=sw; k++; continue; }
      const c=rmp(hz2(v>.7?mix(col,'#a08060',.3):v<.25?mix(col,'#5a4a3a',.3):col,y,y0,.3)), hh=h-(agua?2:1);
      R(g,x+1,y,sw-2,hh,c[2]); R(g,x+1,y,sw-2,1,c[1]); if(hh>5) R(g,x+1,y+hh-1,sw-2,1,c[4]); R(g,x+sw-2,y,1,hh,c[4]);
      for(let i=0;i<3;i++){ const gy=y+2+hsh(v*7+i)*(hh-3); R(g,x+6+hsh(v*11+i)*sw*.3,gy,sw*(.2+hsh(i+v)*.4),1,c[3]); }
      if(hh>6) for(const nx of [x+5,x+sw-8]){ R(g,nx,y+2,2,2,c[5]); R(g,nx,y+hh-4,2,2,c[5]); R(g,nx,y+2,1,1,c[0]); }
      if(v>.82&&hh>8) blob(g,x+10+v*sw*.4,y+2,sw*.3,hh-4,mix(c[2],'#2a3a2a',.25));
      x+=sw; k++; }
    if(agua) R(g,a,y+h-2,b-a,2,mix(WPAL.negro[2],skyRefl(),.15)); else R(g,a,y+h-1,b-a,1,'#120c08'); });
  shade(g,a,y0,b-a,8,'#0a0806',.45); }
function fChapa(g,a,b,s){ const c=rmp('#7a8a86'); R(g,a,HB,b-a,HH-HB,c[3]);
  rowsC('ch',HB,HH,16,.14).forEach(([y,h],ri)=>{ const pw=Math.round(180+h*4), off=(ri%2)*pw/2;
    for(let k=Math.floor((a-off)/pw)-1;k<(b-off)/pw+1;k++){ const x=off+k*pw, v=hsh(k*3.3+ri*7.1+s), cc=rmp(hz2(v>.75?'#86968e':v<.2?'#6a7a78':'#7a8a86',y,HB,.3));
      R(g,x+1,y+1,pw-2,h-2,cc[2]); R(g,x+1,y+1,pw-2,1,cc[1]); R(g,x+1,y+h-2,pw-2,1,cc[4]); for(let i=x+8;i<x+pw-6;i+=24){ R(g,i,y+3,2,2,cc[4]); R(g,i,y+h-5,2,2,cc[4]); R(g,i,y+3,1,1,cc[0]); }
      for(let i=0;i<pw/14;i++){ R(g,x+hsh(v*7+i)*pw,y+2+hsh(v*9+i)*(h-4),4+hsh(i)*8,1,hsh(i+v)>.5?cc[3]:cc[1]); }
      if(v>.7){ blob(g,x+v*pw*.6,y+3,30+v*60,h-6,mix(cc[2],'#9a5a2a',.45)); streak(g,x+v*pw*.6+10,y+2,h-4,3,'#8a4a22'); } } });
  R(g,a,HB+14,b-a,6,'#d8b030'); for(let x=Math.floor(a/40)*40;x<b;x+=40) poly(g,[[x,HB+14],[x+14,HB+14],[x+6,HB+20],[x-8,HB+20]],'#2a2420');
  shade(g,a,HB,b-a,8,'#0a0c10',.45); }
function fLadrilho(g,a,b,s){ R(g,a,HB,b-a,HH-HB,'#3a2a2a');
  rowsC('ld',HB,HH,10,.11).forEach(([y,h],ri)=>{ const tw0=Math.round(h*1.6+6);
    for(let k=Math.floor(a/tw0)-1;k<b/tw0+1;k++){ const x=k*tw0, v=hsh(k*3.7+ri*5.3+s), alt=(k+ri)%2, cA=rmp(hz2(alt?'#b8a88e':'#8a4a3e',y,HB,.3)), cB=rmp(hz2(alt?'#4a6a5a':'#c8b898',y,HB,.3));
      if(v>.97){ R(g,x+1,y+1,tw0-2,h-2,'#2a1e1e'); continue; }
      R(g,x+1,y+1,tw0-2,h-2,cA[2]); R(g,x+1,y+1,tw0-2,1,cA[1]); ell(g,x+tw0/2,y+h/2,tw0*.28,h*.28,cB[2]); R(g,x+tw0/2-1,y+2,2,h-4,cB[3]); R(g,x+3,y+h/2,tw0-6,1,cB[3]);
      if(v>.85) crack(g,x+4+v*(tw0-8),y+1,Math.floor(h/2),cA[4],k); if(v<.08) blob(g,x+2,y+2,tw0*.6,h*.5,'#a8b8c0'); } });
  shade(g,a,HB,b-a,8,'#100a14',.4); }

/* ---------- Manaus ---------- */
function torreRelogio(g,x,yb,s){ const c=rmp('#e0b070'), st=rmp('#a8583a'), w=78, top=yb-300;
  R(g,x,top+60,w,yb-top-60,c[2]); R(g,x,top+60,10,yb-top-60,c[1]); R(g,x+w-12,top+60,12,yb-top-60,c[4]);
  for(let y=top+70;y<yb;y+=18){ R(g,x,y,w,6,st[2]); R(g,x,y,w,1,st[1]); R(g,x+w-12,y,12,6,st[4]); }
  for(let y=top+120;y<yb-40;y+=60){ archF(g,x+w/2-9,y,18,30,'#1e1630'); R(g,x+w/2-11,y-2,22,3,c[0]); }
  cornice(g,x-6,top+66,w+12,c,true); const cy=top+36; R(g,x-4,top+6,w+8,60,c[2]); R(g,x-4,top+6,w+8,3,c[0]); R(g,x+w-8,top+6,12,60,c[4]);
  ell(g,x+w/2,cy,22,22,c[5]); ell(g,x+w/2,cy,20,20,'#f4ecd8'); ell(g,x+w/2-3,cy-3,14,14,'#fffaf0'); for(let k=0;k<12;k++){ const aa=k/12*Math.PI*2; R(g,x+w/2+Math.cos(aa)*16,cy+Math.sin(aa)*16,2,2,'#2a2030'); }
  line(g,x+w/2,cy,x+w/2+9,cy-6,'#1a1020',2); line(g,x+w/2,cy,x+w/2-2,cy-14,'#1a1020',2); if(RL!=='dia'){ glow(g,x+w/2,cy,40,'#ffe0a0',.06,4); emit(g,g=>{ g.save(); g.globalAlpha=.35; ell(g,x+w/2,cy,19,19,'#fff0b0'); g.restore(); }); }
  cornice(g,x-8,top+8,w+16,c,true); const d=rmp('#4a7a6a'); poly(g,[[x-4,top+4],[x+w/2,top-50],[x+w+4,top+4]],d[4]); poly(g,[[x,top+3],[x+w/2,top-46],[x+w/2,top+3]],d[2]); poly(g,[[x+w/2,top-46],[x+w,top+3],[x+w/2,top+3]],d[3]);
  for(let y=top-40;y<top;y+=6) R(g,x+w/2-(y-top+50)*.7,y,(y-top+50)*1.4,1,d[4]); R(g,x+w/2-1,top-70,2,24,IRON[2]); ell(g,x+w/2,top-62,3,3,'#d8b050'); }
function guindaste(g,x,yb,s){ const c=rmp('#e0a830'); const h=250; for(const sx of [0,40]){ R(g,x+sx,yb-h,5,h,c[3]); R(g,x+sx,yb-h,2,h,c[1]); }
  for(let y=yb-h;y<yb;y+=24){ line(g,x,y,x+44,y+24,c[3]); line(g,x+44,y,x,y+24,c[3]); R(g,x,y,45,2,c[2]); }
  R(g,x-30,yb-h-10,260,8,c[2]); R(g,x-30,yb-h-10,260,2,c[0]); for(let k=x-30;k<x+230;k+=16){ line(g,k,yb-h-2,k+8,yb-h-20,c[3]); } R(g,x-30,yb-h-22,260,3,c[3]);
  R(g,x+10,yb-h-36,26,26,c[2]); R(g,x+14,yb-h-32,10,8,GLASS[2]); line(g,x+200,yb-h-2,x+200,yb-h+90,'#2a2a30',1); R(g,x+194,yb-h+90,12,8,'#3a3a40'); R(g,x-40,yb-h-12,20,14,'#5a5a60'); }
function galpaoFlutuante(g,x,w,yw,s){ const c=rmp('#d8d4c4'), rf=rmp('#3a7a5a'), hb=rmp('#8a3a2a'), top=yw-120;
  R(g,x-10,yw-22,w+20,26,hb[2]); R(g,x-10,yw-22,w+20,3,hb[1]); R(g,x-10,yw,w+20,4,hb[4]); for(let k=x;k<x+w;k+=60){ ell(g,k+20,yw-10,8,8,'#1a1a1e'); ell(g,k+20,yw-10,4,4,'#3a3a40'); }
  R(g,x,top,w,98,c[2]); for(let k=x;k<x+w;k+=6){ R(g,k,top,1,98,c[3]); R(g,k+1,top,1,98,c[1]); } R(g,x,top,w,4,c[1]); R(g,x+w-10,top,10,98,c[4]);
  for(let k=x+30;k<x+w-60;k+=110){ porta(g,k,top+38,60,58,{c,s:s+k,kind:hsh(k)>.5?'aco':'aberta',transom:false,metal:'#6a7a7a'}); }
  poly(g,[[x-16,top+2],[x+w/2,top-34],[x+w+16,top+2]],rf[4]); for(let k=x-16;k<x+w+16;k+=8){ const t=Math.abs((k-(x+w/2))/(w/2+16)), y=top-34+34*t; R(g,k,y,6,top+2-y,(k/8)%2?rf[2]:rf[3]); R(g,k,y,6,1,rf[1]); } R(g,x-16,top,w+32,4,rf[4]);
  for(let i=0;i<6;i++) streak(g,x+hsh(s+i)*w,top+4,20+hsh(i)*40,3,mix(c[3],'#8a5a3a',.5)); }
function cabeco(g,x,yb){ const c=rmp('#3a3a44'); R(g,x-8,yb-14,16,14,c[2]); R(g,x-8,yb-14,4,14,c[1]); ell(g,x,yb-14,11,4,c[3]); ell(g,x,yb-15,10,3,c[1]); R(g,x-12,yb-2,24,3,c[4]); }
// barco regional de dois andares (casco de madeira branco e azul, redes armadas no convés, casario de comando na proa)
function barco(g,x,yw,L,s,o={}){ const cs=rmp(o.casco||'#ece6d6'), fx=rmp(o.faixa||'#2a5aa8'), tr=rmp(o.friso||'#c8382a'), hh=50;
  const hull=[[x,yw-hh],[x+L-60,yw-hh],[x+L+20,yw-hh-16],[x+L-10,yw-6],[x+L-50,yw+2],[x+10,yw+2],[x,yw-8]];
  poly(g,hull.map(p=>[p[0],p[1]+2]),'#141018'); poly(g,hull,cs[2]); R(g,x,yw-hh,L-50,4,cs[0]);
  poly(g,[[x,yw-hh+8],[x+L-56,yw-hh+8],[x+L+8,yw-hh-6],[x+L+2,yw-hh+4],[x+L-50,yw-hh+20],[x,yw-hh+20]],fx[2]); R(g,x,yw-hh+8,L-56,2,fx[1]);
  poly(g,[[x+6,yw-8],[x+L-46,yw-8],[x+L-22,yw-14],[x+L-14,yw-6],[x+L-50,yw+2],[x+10,yw+2]],tr[3]); R(g,x+6,yw-8,L-52,2,tr[1]);
  for(let k=x+8;k<x+L-60;k+=12) R(g,k,yw-hh+24,1,18,cs[3]); shade(g,x,yw-20,L,20,'#1a1420',.25);
  for(let k=x+20;k<x+L-80;k+=70){ ell(g,k,yw-hh+30,8,8,'#16141a'); ell(g,k,yw-hh+30,4,4,'#3a3840'); }
  for(let i=0;i<5;i++) streak(g,x+20+hsh(s+i)*(L-80),yw-hh+22,10+hsh(i+s)*12,2,mix(cs[3],'#7a5a3a',.6));
  // 1º convés aberto com redes
  const d1=yw-hh, r1=d1-62; R(g,x+4,r1,L-70,62,'#1a1420'); R(g,x+4,r1,L-70,62,mix('#2a2030',cs[4],.3));
  for(let k=0;k<(L-90)/34;k++){ const hx=x+20+k*34, col=pick(['#e8402a','#f2c230','#3a9a5a','#2a6ad8','#e86ab0','#f08a2a','#8a4ad8'],hsh(s+k*3.3)), hc=rmp(col);
    sag(g,hx,r1+14,hx+30,r1+16,14,hc[3],5); sag(g,hx,r1+13,hx+30,r1+15,13,hc[1],2); for(let j=0;j<5;j++) R(g,hx+4+j*5,r1+24+Math.sin(j)*2,2,4,hc[2]); }
  for(let k=x+6;k<x+L-66;k+=52){ R(g,k,r1,5,62,cs[2]); R(g,k,r1,2,62,cs[0]); R(g,k+4,r1,1,62,cs[4]); }
  R(g,x+4,d1-14,L-70,3,cs[1]); for(let k=x+6;k<x+L-66;k+=8) R(g,k,d1-14,2,14,cs[3]);
  R(g,x-4,r1-8,L-58,9,cs[2]); R(g,x-4,r1-8,L-58,2,cs[0]); R(g,x-4,r1-1,L-58,2,fx[3]);
  // 2º convés com cabines e casa de comando
  const r2=r1-50; R(g,x+40,r2,L-150,42,cs[2]); R(g,x+40,r2,L-150,2,cs[0]); R(g,x+L-120,r2,10,42,cs[4]);
  for(let k=x+56;k<x+L-130;k+=34){ R(g,k,r2+10,18,14,GLASS[3]); R(g,k,r2+10,18,2,GLASS[1]); if(hsh(k+s)>.5) emitW(g,g=>R(g,k+1,r2+12,16,11,'#f0b060')); if(hsh(k+s)>.5) pushWin(k+1,r2+12,16,11); }
  R(g,x+L-150,r2-30,70,72,cs[2]); R(g,x+L-150,r2-30,70,3,cs[0]); R(g,x+L-142,r2-20,54,16,GLASS[2]); R(g,x+L-142,r2-20,54,3,GLASS[1]); line(g,x+L-142,r2-4,x+L-88,r2-20,GLASS[0]);
  R(g,x+30,r2-8,L-140,8,cs[1]); R(g,x+30,r2-8,L-140,2,cs[0]); R(g,x+30,r2-1,L-140,2,fx[3]); for(let k=x+32;k<x+L-112;k+=7) R(g,k,r2-20,2,12,cs[3]); R(g,x+30,r2-21,L-142,2,cs[2]);
  R(g,x+L-154,r2-36,78,7,fx[2]); R(g,x+L-154,r2-36,78,2,fx[1]);
  R(g,x+L-120,r2-80,3,46,IRON[3]); poly(g,[[x+L-117,r2-80],[x+L-92,r2-74],[x+L-117,r2-68]],o.band||'#2e9a4a'); R(g,x+L-115,r2-76,6,3,'#f2c230');
  ell(g,x+L-70,d1-30,9,9,'#e8602a'); ell(g,x+L-70,d1-30,5,5,cs[2]); R(g,x+L-79,d1-31,4,2,'#f2f2f2'); R(g,x+L-63,d1-31,4,2,'#f2f2f2');
  for(let k=0;k<8;k++) R(g,x+L-210+k*8,yw-hh+12,5,4,mix(fx[0],'#ffffff',.3)); // nome ilegível pintado no casco
}
function lancha(g,x,yw,s){ const c=rmp('#e8e2d2'); poly(g,[[x,yw-18],[x+150,yw-18],[x+180,yw-28],[x+168,yw],[x+8,yw]],c[2]); R(g,x,yw-18,150,3,c[0]); R(g,x+6,yw-6,160,4,'#c8382a'); R(g,x+40,yw-44,60,26,c[2]); R(g,x+46,yw-40,48,10,GLASS[2]); R(g,x+36,yw-48,70,5,'#2a5aa8'); }
function isopor(g,x,yb,s){ const c=rmp('#f2f0ea'); R(g,x,yb-30,52,30,c[2]); R(g,x,yb-30,52,3,c[0]); R(g,x+44,yb-30,8,30,c[3]); R(g,x-2,yb-34,56,6,c[1]); R(g,x-2,yb-34,56,1,c[0]); R(g,x+4,yb-26,20,3,'#2a6ad8'); R(g,x,yb-2,52,2,c[4]); if(hsh(s)>.5){ for(let i=0;i<3;i++) R(g,x+8+i*10,yb-36,8,3,'#a8c8d8'); } }
function sacas(g,x,yb,n,s){ const c=rmp('#e0d0a0'); for(let i=0;i<n;i++){ const px=x+(i%3)*30+(Math.floor(i/3)%2)*15, py=yb-Math.floor(i/3)*16; blob(g,px-1,py-17,34,18,c[5]); blob(g,px,py-16,32,16,c[2]); blob(g,px+2,py-15,14,5,c[1]); R(g,px+6,py-10,18,2,'#3a6a3a'); R(g,px+26,py-14,3,10,c[4]); } }
function caixote(g,x,yb,w,s){ const c=rmp('#a8804e'); R(g,x,yb-w*.8,w,w*.8,c[2]); for(let y=yb-w*.8;y<yb;y+=w*.2){ R(g,x,y,w,1,c[4]); R(g,x,y+1,w,1,c[1]); } R(g,x,yb-w*.8,3,w*.8,c[3]); R(g,x+w-3,yb-w*.8,3,w*.8,c[4]); line(g,x+3,yb-w*.78,x+w-3,yb-2,c[3],2); }
function boia(g,x,yb){ ell(g,x,yb-14,14,14,'#e8602a'); ell(g,x,yb-14,7,7,'#2a1a14'); R(g,x-14,yb-15,5,3,'#f2f2f2'); R(g,x+9,yb-15,5,3,'#f2f2f2'); R(g,x-2,yb-28,4,4,'#f2f2f2'); ell(g,x-5,yb-20,4,2,'#ff9a5a'); }
function tambor(g,x,yb,col){ const c=rmp(col||'#2a5aa8'); R(g,x,yb-44,30,44,c[2]); R(g,x,yb-44,8,44,c[1]); R(g,x+22,yb-44,8,44,c[4]); for(const y of [yb-34,yb-14]) R(g,x,y,30,3,c[3]); ell(g,x+15,yb-44,15,4,c[3]); ell(g,x+15,yb-45,13,3,c[1]); streak(g,x+12,yb-40,14,3,'#8a4a22'); }
function rede(g,x,yb,s){ const c=rmp('#5a7a6a'); blob(g,x,yb-18,90,18,c[3]); for(let i=0;i<90;i+=5) for(let j=0;j<16;j+=5) R(g,x+i+(j%2)*2,yb-16+j,2,1,c[1]); for(let i=0;i<4;i++) ell(g,x+10+i*22,yb-16,3,3,'#e8b030'); }
function pirarucuBanca(g,x,yb,s){ const t=rmp('#8a5a3a'), aw=['#e8402a','#f2f2e8']; R(g,x,yb-36,150,8,t[2]); R(g,x,yb-36,150,2,t[1]); for(const lx of [x+4,x+140]) R(g,lx,yb-110,5,110,t[3]);
  toldo(g,x-8,yb-130,166,aw); R(g,x+4,yb-108,140,3,IRON[3]);
  for(let i=0;i<3;i++){ const px=x+24+i*44, fc=rmp(i===1?'#a8542a':'#6a6a5a'); R(g,px+6,yb-106,2,8,IRON[2]); ell(g,px+7,yb-84,8,18,fc[3]); ell(g,px+6,yb-86,6,15,fc[2]); for(let k=0;k<5;k++) R(g,px+2,yb-96+k*6,9,1,i===1?'#c83a2a':fc[1]); poly(g,[[px+2,yb-66],[px+12,yb-66],[px+16,yb-58],[px-2,yb-58]],fc[4]); }
  for(let i=0;i<6;i++){ const fx=x+14+i*22; ell(g,fx,yb-40,10,4,'#5a6a6a'); ell(g,fx-2,yb-41,7,2,'#a8b8b8'); R(g,fx+8,yb-42,3,3,'#3a4848'); }
  R(g,x+6,yb-28,138,28,t[3]); for(let k=x+10;k<x+140;k+=16) R(g,k,yb-26,1,24,t[4]); }
function paneiro(g,x,yb,s){ const c=rmp('#b8904a'); for(let y=0;y<30;y+=3){ const ww=30-y*.2; R(g,x-ww/2,yb-y-3,ww,3,(y/3)%2?c[2]:c[3]); } ell(g,x,yb-32,15,4,'#3a1a3a'); for(let i=0;i<10;i++) R(g,x-12+hsh(s+i)*24,yb-36+hsh(i)*4,3,3,'#5a2a5a'); }
function cestoCastanha(g,x,yb,s){ const c=rmp('#a8804e'); ell(g,x,yb-10,24,10,c[3]); R(g,x-24,yb-20,48,12,c[2]); for(let k=x-22;k<x+22;k+=4) R(g,k,yb-20,1,12,c[4]); ell(g,x,yb-20,24,6,c[1]); for(let i=0;i<14;i++) ell(g,x-18+hsh(s+i)*36,yb-22+hsh(s*2+i)*5,3,2,i%2?'#7a4a2a':'#5a3220'); }
function balanca(g,x,yb){ const c=METAL; R(g,x-2,yb-50,4,50,c[3]); R(g,x-30,yb-52,60,3,c[2]); for(const sx of [-1,1]){ line(g,x+sx*28,yb-50,x+sx*20,yb-30,c[4]); line(g,x+sx*28,yb-50,x+sx*36,yb-30,c[4]); ell(g,x+sx*28,yb-28,10,3,c[1]); } R(g,x-12,yb-4,24,4,c[4]); }
function bancaFeira(g,x,yb,s){ const c=rmp('#8a5a3a'), cols=pick([['#f2c230','#2e9a4a'],['#2a6ad8','#f2f2e8'],['#e8402a','#f2c230'],['#3a9a5a','#f2f2e8']],hsh(s));
  for(const lx of [x+2,x+124]) R(g,lx,yb-96,4,96,c[3]); toldo(g,x-6,yb-110,142,cols); R(g,x,yb-40,130,6,c[2]); R(g,x,yb-40,130,2,c[1]); R(g,x+4,yb-34,122,34,c[3]); for(let k=x+8;k<x+126;k+=14) R(g,k,yb-32,1,30,c[4]);
  const kind=Math.floor(hsh(s*3)*4); for(let i=0;i<9;i++){ const px=x+10+i*13, py=yb-44; if(kind===0){ ell(g,px,py,6,4,'#f2c230'); R(g,px-4,py-2,6,1,'#fff0a0'); } else if(kind===1){ ell(g,px,py,6,5,'#3a1a3a'); R(g,px-2,py-3,2,1,'#8a5a9a'); } else if(kind===2){ ell(g,px,py,6,4,'#e85a2a'); R(g,px-3,py-3,3,1,'#ffb080'); } else { ell(g,px,py,6,3,'#c8b088'); R(g,px-4,py-2,6,1,'#f0e0c0'); } }
  for(let i=0;i<4;i++){ const px=x+16+i*30; R(g,px,yb-92,1,14,'#2a2020'); if(kind<2){ for(let j=0;j<4;j++) ell(g,px+(j%2?3:-2),yb-76+j*4,4,3,j%2?'#e8c830':'#c8a820'); } else { ell(g,px,yb-72,5,9,'#a83a2a'); R(g,px-2,yb-78,2,6,'#e86a4a'); } } }
// Mercado Adolpho Lisboa: pavilhão de alvenaria (amarelo e vermelho) e galpão de ferro Art Nouveau com rosáceas de vitral
function mercadoPav(g,x,w,s){ const c=rmp('#e8b03a'), rd=rmp('#c8382a'), top=HB-240;
  R(g,x,top,w,HB-top,c[2]); for(let y=top+10;y<HB-20;y+=14){ R(g,x,y,w,5,rd[2]); R(g,x,y,w,1,rd[1]); }
  const n=5, bw=w/n; for(let k=0;k<=n;k++){ const px=x+k*bw-(k===n?14:k?7:0); R(g,px,top,14,HB-top,c[1]); R(g,px,top,3,HB-top,c[0]); R(g,px+11,top,3,HB-top,c[3]); for(let y=top+6;y<HB;y+=10){ R(g,px,y,14,4,rd[2]); R(g,px,y,14,1,rd[1]); } }
  for(let k=0;k<n;k++){ const cx=x+(k+.5)*bw; janela(g,cx-16,top+60,32,62,{c,sh:rmp('#2e6a4a'),s:s+k,st:pick(['vidro','escura','fechada','acesa'],hsh(s+k)),arch:true});
    if(k===2) porta(g,cx-24,HB-100,48,100,{c,s:s+k,kind:'aberta'}); else janela(g,cx-16,HB-92,32,58,{c,sh:rmp('#2e6a4a'),s:s+k*7,st:pick(['fechada','vidro','acesa'],hsh(s*3+k)),arch:true}); }
  cornice(g,x-4,top+30,w+8,c,true); cornice(g,x-4,HB-120,w+8,c,false);
  const cx=x+w/2; poly(g,[[cx-110,top+2],[cx,top-56],[cx+110,top+2]],c[4]); poly(g,[[cx-102,top],[cx,top-50],[cx+102,top]],c[2]); poly(g,[[cx-80,top-4],[cx,top-40],[cx+80,top-4]],rd[2]);
  ell(g,cx,top-14,16,16,c[5]); ell(g,cx,top-14,14,14,'#f4ecd8'); line(g,cx,top-14,cx+8,top-18,'#2a2030',2); line(g,cx,top-14,cx,top-24,'#2a2030',2);
  for(const tx of [x+6,x+w-34]){ R(g,tx,top-60,28,64,c[2]); R(g,tx,top-60,6,64,c[1]); R(g,tx+22,top-60,6,64,c[4]); for(let y=top-54;y<top;y+=10) R(g,tx,y,28,4,rd[2]); archF(g,tx+8,top-48,12,20,'#1e1630');
    poly(g,[[tx-4,top-60],[tx+14,top-96],[tx+32,top-60]],IRONV[3]); poly(g,[[tx,top-60],[tx+14,top-92],[tx+14,top-60]],IRONV[2]); R(g,tx+13,top-108,2,14,IRON[2]); ell(g,tx+14,top-104,3,3,'#d8b050'); }
  platibanda(g,x,top-4,w,10,c,{par:'balaustre',s}); limo(g,x,HB-14,w,c,s); for(let i=0;i<6;i++) streak(g,x+hsh(s+i)*w,top+40+hsh(i)*100,20+hsh(i*3)*40,3,c[3]); }
function vitral(g,cx,cy,r,s){ const cols=['#2a6ad8','#e8a030','#3a9a5a','#c83a3a','#8a4ad8','#e8d040'].map(c=>mix(c,'#4a6a6a',.38));
  for(let dy=-r;dy<=0;dy++){ const hw=Math.round(Math.sqrt(r*r-dy*dy)); for(let dx=-hw;dx<hw;dx++){ const a=Math.atan2(dy,dx), d=Math.sqrt(dx*dx+dy*dy)/r, seg=Math.floor((a+Math.PI)/(Math.PI/8)), ring=Math.floor(d*3); g.fillStyle=(dx%6===0||dy%6===0)?'#1e2e28':cols[(seg+ring*2)%cols.length]; g.fillRect(cx+dx,cy+dy,1,1); } }
  for(let k=0;k<=8;k++){ const a=Math.PI+k*Math.PI/8; line(g,cx,cy,cx+Math.cos(a)*r,cy+Math.sin(a)*r,IRONV[4],2); } for(const rr of [r*.33,r*.66,r]) for(let a=Math.PI;a<=Math.PI*2;a+=.02) R(g,cx+Math.cos(a)*rr,cy+Math.sin(a)*rr,2,2,IRONV[3]);
  ell(g,cx,cy,r*.14,r*.14,IRONV[2]); R(g,cx-r,cy,r*2,4,IRONV[2]); }
function mercadoFerro(g,x,w,s){ const ir=IRONV, top=HB-170, bays=Math.max(3,Math.round(w/180)), bw=w/bays;
  R(g,x,top,w,HB-top,'#141c18');
  for(let k=0;k<bays;k++){ const bx=x+k*bw;
    R(g,bx+6,top+90,bw-12,HB-top-90,'#1a1814'); const lit=hsh(s+k)>.3;
    for(let i=0;i<3;i++){ const px=bx+20+i*(bw-40)/3; R(g,px,HB-46,(bw-50)/3,30,'#3a2a20'); R(g,px,HB-46,(bw-50)/3,3,'#6a4a30'); for(let j=0;j<5;j++) ell(g,px+6+j*8,HB-50,4,3,pick(['#e8a030','#c83a3a','#3a9a5a','#f2e0a0'],hsh(s+k*7+i*3+j))); }
    if(lit){ for(let i=0;i<3;i++){ const lx=bx+bw*(.25+i*.25); R(g,lx,top+100,1,30,'#2a2a2a'); emitW(g,g=>{ ell(g,lx,top+132,5,4,'#ffe0a0'); }); glow(g,lx,top+136,50,'#ffc070',.07,4); reg(BULBS,{x:lx/RS,y:(top+134)/RS}); } shade(g,bx+6,top+110,bw-12,HB-top-110,'#ffb060',RL==='dia'?0:.06); }
    archF(g,bx+10,top+16,bw-20,80,ir[4]); vitral(g,Math.round(bx+bw/2),top+16+Math.round((bw-20)/2)+2,Math.round((bw-20)/2)-6,s+k);
    for(let i=0;i<5;i++){ const lx=bx+14+i*(bw-28)/4; R(g,lx,top+96,2,HB-top-96,ir[3]); }
    R(g,bx,top+90,bw,8,ir[2]); R(g,bx,top+90,bw,2,ir[0]); for(let i=bx+4;i<bx+bw-4;i+=10){ ell(g,i+5,top+94,3,2,ir[4]); } }
  for(let k=0;k<=bays;k++){ const px=x+k*bw-(k===bays?12:k?6:0); R(g,px,top-10,12,HB-top+10,ir[2]); R(g,px,top-10,3,HB-top+10,ir[0]); R(g,px+9,top-10,3,HB-top+10,ir[4]); for(let y=top+20;y<HB;y+=40){ ell(g,px+6,y,6,4,ir[1]); } R(g,px-4,HB-12,20,12,ir[3]); poly(g,[[px-10,top-10],[px+6,top-34],[px+22,top-10]],ir[3]); R(g,px+5,top-46,2,14,ir[1]); }
  const rf=ZINCO; for(let k=x-10;k<x+w+10;k+=6){ R(g,k,top-34,5,24,(k/6)%2?rf[2]:rf[3]); R(g,k,top-34,5,1,rf[0]); } R(g,x-12,top-12,w+24,4,ir[3]); R(g,x-12,top-38,w+24,4,rf[1]);
  const cx=x+w/2; archF(g,cx-96,top-84,192,90,ir[4]); vitral(g,Math.round(cx),top+8,88,s*3); R(g,cx-100,top-4,200,8,ir[2]); R(g,cx-100,top-4,200,2,ir[0]);
  for(let a=Math.PI;a<=Math.PI*2;a+=.014){ R(g,cx+Math.cos(a)*96,top+8+Math.sin(a)*96,4,4,ir[2]); R(g,cx+Math.cos(a)*97,top+7+Math.sin(a)*97,2,2,ir[0]); }
  for(let i=0;i<4;i++) streak(g,x+hsh(s*5+i)*w,top+100,30,2,'#7a4a2a'); }
// Teatro Amazonas: fachada rosa, colunas brancas, cúpula de telhas esmaltadas verde-amarelo-azul
function cupulaTeatro(g,cx,yb,r,s){ const T=['#2e9a4a','#f2c230','#2a52b0'], hh=r*.82;
  const dr=rmp('#e8d8c0'); R(g,cx-r-8,yb-30,2*r+16,30,dr[2]); R(g,cx-r-8,yb-30,2*r+16,3,dr[0]); R(g,cx+r-4,yb-30,12,30,dr[4]); for(let k=0;k<9;k++){ const wx=cx-r+8+k*(2*r-16)/8; archF(g,wx-4,yb-24,8,16,'#2a2040'); R(g,wx-6,yb-26,12,2,dr[1]); }
  R(g,cx-r-12,yb-35,2*r+24,6,dr[1]); R(g,cx-r-12,yb-35,2*r+24,1,dr[0]);
  const base=yb-35; for(let dy=0;dy<hh;dy++){ const t=dy/hh, hw=Math.round(r*Math.sqrt(Math.max(0,1-t*t))), y=base-dy;
    for(let dx=-hw;dx<hw;dx+=2){ const u=dx/Math.max(1,hw), lat=Math.asin(Math.min(1,t)), lon=Math.asin(Math.max(-1,Math.min(1,u))), A=Math.floor((lon*7+lat*7)), B=Math.floor((lon*7-lat*7)), ci=((A+B)%3+3)%3;
      const sk=u<-.4?0:u>.5?2:1, col=rmp(T[ci])[sk+1]; g.fillStyle=((A+B)&1)?col:mix(col,'#ffffff',.14); g.fillRect(cx+dx,y,2,1); if(t>.2&&u<-.55&&u>-.7) { g.fillStyle=mix(col,'#ffffff',.4); g.fillRect(cx+dx,y,2,1); } }
    R(g,cx-hw-1,y,2,1,'#1a1830'); R(g,cx+hw-1,y,2,1,'#1a1830'); }
  for(let k=-5;k<=5;k++) for(let dy=0;dy<hh-4;dy+=2){ const t=dy/hh, hw=r*Math.sqrt(1-t*t); R(g,cx+Math.round(Math.sin(k/6*Math.PI/2)*hw),base-dy,2,2,'#f0e8d0'); }
  const ly=base-hh; R(g,cx-11,ly-20,22,22,dr[2]); R(g,cx-11,ly-20,5,22,dr[1]); for(let k=0;k<3;k++) archF(g,cx-8+k*6,ly-16,4,9,'#2a2040'); ell(g,cx,ly-22,13,5,T[0]); ell(g,cx,ly-25,8,5,T[1]); R(g,cx-1,ly-42,2,18,IRON[2]); ell(g,cx,ly-34,3,3,'#e8c050');
  if(RL!=='dia'){ glow(g,cx,base-hh*.4,r*1.3,'#ffe6b0',.05,5,hh*.8); emitW(g,g=>{ g.save(); g.globalAlpha=.16; g.globalCompositeOperation='lighter'; ell(g,cx,base-hh*.35,r*.9,hh*.6,'#fff0c8'); g.restore(); }); } }
function teatro(g,cx,s){ const c=rmp('#d89a8a'), wh=BRANCO, W2=420, top=HB-140, x=cx-W2/2, sh=rmp('#5a3a3a');
  cupulaTeatro(g,cx,top-12,98,s);
  for(const sd of [-1,1]){ const wx=sd<0?x-210:x+W2, ww=210, wt=HB-112; R(g,wx,wt,ww,HB-wt,c[2]); R(g,wx,wt,ww,5,c[1]); if(sd>0) R(g,wx+ww-10,wt,10,HB-wt,c[4]); else R(g,wx,wt,8,HB-wt,c[1]);
    for(let k=0;k<4;k++){ const wx2=wx+22+k*48; janela(g,wx2,wt+22,22,30,{c,fr:wh,sh,s:s+k*3+sd,st:pick(['vidro','acesa','escura','fechada'],hsh(s+k+sd*7)),arch:true}); janela(g,wx2,HB-50,22,34,{c,fr:wh,sh,s:s+k*5+sd,st:pick(['vidro','escura','acesa'],hsh(s*3+k+sd)),arch:true}); }
    cornice(g,wx-4,wt+8,ww+8,c,true); platibanda(g,wx,wt-18,ww,18,c,{par:'balaustre',s:s+sd}); cornice(g,wx-2,HB-64,ww+4,c,false); limo(g,wx,HB-10,ww,c,s+sd); }
  R(g,x,top,W2,HB-top,c[2]); R(g,x,top,8,HB-top,c[1]); R(g,x+W2-8,top,8,HB-top,c[3]); for(let y=HB-80;y<HB-6;y+=8){ R(g,x,y,W2,1,c[3]); R(g,x,y+1,W2,1,c[1]); }
  for(let k=0;k<5;k++){ const ax=x+22+k*78; R(g,ax-4,HB-80,64,80,c[3]); archF(g,ax,HB-74,56,74,'#1a1428'); archF(g,ax+5,HB-69,46,69,'#241a36'); if(hsh(s+k)>.35){ emitW(g,g=>{ archF(g,ax+8,HB-64,40,64,'#e8a060'); R(g,ax+12,HB-40,32,40,'#f0c080'); }); pushWin(ax+8,HB-64,40,64); } R(g,ax-6,HB-82,68,3,wh[1]); }
  cornice(g,x-6,HB-84,W2+12,c,true);
  const cy0=top+16, cy1=HB-92; for(let k=0;k<6;k++){ const px=x+10+k*(W2-36)/5; for(const o of [0,16]){ R(g,px+o,cy0,10,cy1-cy0,wh[2]); R(g,px+o,cy0,3,cy1-cy0,wh[0]); R(g,px+o+8,cy0,2,cy1-cy0,wh[3]); for(let y=cy0+4;y<cy1-4;y+=4) R(g,px+o+5,y,1,2,wh[3]); R(g,px+o-2,cy0,14,5,wh[1]); R(g,px+o-2,cy1-5,14,5,wh[3]); } }
  for(let k=0;k<5;k++){ const wx=x+48+k*(W2-36)/5; janela(g,wx,cy0+16,26,cy1-cy0-30,{c,fr:wh,sh,s:s+k*11,st:pick(['acesa','vidro','acesa','escura'],hsh(s*7+k)),arch:true}); }
  sacada(g,x+8,cy1+2,W2-16,c);
  cornice(g,x-8,top+12,W2+16,c,true); platibanda(g,x,top-20,W2,20,c,{par:'balaustre',s});
  const pc=rmp('#e8c8b8'); for(let dy=0;dy<30;dy++){ const hw=Math.round(110*Math.sqrt(1-(dy/30)**2)); R(g,cx-hw,top-20-dy,hw*2,1,dy<2?wh[0]:dy>26?wh[1]:pc[2]); } R(g,cx-24,top-42,48,16,c[3]); ell(g,cx,top-36,9,6,wh[1]); R(g,cx-112,top-21,224,2,wh[1]);
  for(const sx of [x+12,x+W2-28,cx-84,cx+68]){ R(g,sx,top-34,16,14,wh[2]); ell(g,sx+8,top-40,5,7,wh[1]); R(g,sx+6,top-48,4,5,wh[1]); }
  limo(g,x,HB-10,W2,c,s); for(let i=0;i<6;i++) streak(g,x+hsh(s+i)*W2,top+14,16+hsh(i*3)*30,3,c[3]);
  const st=rmp('#d8d4cc'); for(let k=0;k<5;k++){ const sy=HB-10+k*2; R(g,x-30-k*10,sy,W2+60+k*20,2,k%2?st[2]:st[1]); }
  if(RL!=='dia') for(const hx of [cx-180,cx+180]) glow(g,hx,HB-6,140,'#ffd8a0',.05,5,170); }
function arvoreCopa(g,x,yb,s,k){ k=k||1; tronco(g,x,yb-150*k,yb,14*k,'#5a4632',s,{bend:8,flare:1.2}); for(let i=0;i<4;i++){ const a=-2.6+i*.55; line(g,x,yb-120*k,x+Math.cos(a)*70*k,yb-120*k+Math.sin(a)*60*k,rmp('#5a4632')[3],5); }
  for(let i=0;i<7;i++){ const px=x+(hsh(s+i)-.5)*180*k, py=yb-190*k+hsh(s*3+i)*70*k; folhagem(g,px,py,(40+hsh(s*5+i)*24)*k,'#3a7a3a',s+i*7,0); } }
function banco2(g,x,yb){ const w=MAD, ir=IRON; for(const lx of [x+4,x+60]){ R(g,lx,yb-20,4,20,ir[3]); } for(let i=0;i<3;i++) R(g,x,yb-24+i*5-(i>1?16:0),70,3,i%2?w[2]:w[1]); R(g,x,yb-38,70,3,w[2]); R(g,x,yb-30,70,3,w[1]); }
function pipoca(g,x,yb,s){ const c=rmp('#c8382a'); R(g,x,yb-60,54,40,c[2]); R(g,x,yb-60,54,3,c[1]); R(g,x+6,yb-56,42,26,'#f2e8c0'); for(let i=0;i<20;i++) R(g,x+8+hsh(s+i)*38,yb-46+hsh(i)*14,3,3,'#fff8e0'); poly(g,[[x-4,yb-60],[x+27,yb-82],[x+58,yb-60]],'#f2c230'); for(const wx of [x+8,x+46]){ ell(g,wx,yb-10,9,9,'#1a1a1e'); ell(g,wx,yb-10,4,4,METAL[1]); } }
// palafita: casa de tábua pintada sobre esteios, telhado de zinco em duas águas, varanda
function palafita(g,x,yw,w,s,o={}){ const pal=o.cor||pick(['#2a5aa8','#ece6d6','#c8382a','#3a9a6a','#e88aa0','#f0c23a','#4ab0c8'],hsh(s)), c=rmp(pal), wd=MADV, st=o.st??46, fy=yw-st, H0=o.h||86, top=fy-6-H0, ruina=o.ruina;
  for(let px=x+4;px<=x+w-6;px+=Math.max(30,w/6)){ R(g,px,fy,7,st+6,wd[4]); R(g,px,fy,2,st+6,wd[2]); R(g,px,yw-6,7,4,mix(wd[4],'#2a3a2a',.5)); }
  line(g,x+8,fy+4,x+w*.4,yw-4,wd[3],2); line(g,x+w-8,fy+4,x+w*.6,yw-4,wd[3],2);
  R(g,x-14,fy-6,w+28,8,wd[2]); R(g,x-14,fy-6,w+28,2,wd[1]); R(g,x-14,fy+2,w+28,2,wd[5]);
  R(g,x,top,w,H0,c[2]); for(let bx=x;bx<x+w;bx+=7){ R(g,bx,top,1,H0,c[3]); R(g,bx+1,top,1,H0,c[1]); if(hsh(s+bx*.3)>.82){ const py=top+hsh(bx)*H0*.7; R(g,bx+2,py,5,8+hsh(bx*3)*20,MAD[3]); } }
  R(g,x+w-8,top,8,H0,c[4]); shade(g,x,top,w,10,'#100a14',.35);
  const nw=Math.max(1,Math.floor((w-40)/60)); for(let k=0;k<nw;k++){ const wx=x+20+k*60+(w-40-nw*60)/2+16, lit=!ruina&&hsh(s*3+k)>.35;
    R(g,wx-3,top+22,34,34,c[4]); R(g,wx,top+25,28,28,lit?'#2a1a14':'#1a1420'); if(lit){ emitW(g,g=>{ R(g,wx,top+25,28,28,'#e89848'); R(g,wx+4,top+29,20,14,'#ffd080'); R(g,wx+13,top+25,2,28,'#5a2c1c'); }); pushWin(wx,top+25,28,28); glow(g,wx+14,top+40,40,'#ffb050',.05,4); }
    const sh=rmp(pick(['#2a5aa8','#c8382a','#3a9a6a','#f0c23a','#ece6d6'],hsh(s+k*5))); R(g,wx-14,top+24,12,30,sh[2]); R(g,wx-14,top+24,12,2,sh[1]); for(let y=top+28;y<top+52;y+=4) R(g,wx-13,y,10,1,sh[3]); }
  if(!ruina){ const dx=x+w-46; R(g,dx,top+30,26,H0-30,'#1a1018'); R(g,dx,top+30,26,2,c[1]); }
  R(g,x-14,fy-28,w+28,3,wd[1]); for(let px=x-12;px<x+w+14;px+=10) R(g,px,fy-26,2,20,wd[3]);
  if(o.redes!==false&&hsh(s*9)>.4){ const hc=rmp(pick(['#e8402a','#f2c230','#3a9a5a','#2a6ad8'],hsh(s*11))); sag(g,x+10,fy-40,x+60,fy-38,14,hc[2],4); }
  const zi=ZINCO, rt=top-40; if(ruina){ poly(g,[[x-10,top+2],[x+w*.4,rt],[x+w*.55,top-10],[x+w*.7,top+2]],zi[4]); for(let k=x-10;k<x+w*.7;k+=7) R(g,k,top-((k<x+w*.4)?(k-x+10)/(w*.4+10)*40:(x+w*.7-k)/(w*.3)*40)+2,2,6,zi[2]); }
  else { poly(g,[[x-16,top+4],[x+w/2,rt],[x+w+16,top+4]],zi[5]); for(let k=x-14;k<x+w+16;k+=6){ const t=Math.abs(k-(x+w/2))/(w/2+16), y=rt+40*t+1; R(g,k,y,4,top+3-y,(k/6)%2?zi[2]:zi[3]); R(g,k,y,4,1,zi[1]); }
    for(let i=0;i<4;i++){ const rx=x+hsh(s+i*7)*w; streak(g,rx,top+3-((Math.abs(rx-(x+w/2))<w/2)?0:0),10+hsh(i)*16,3,'#8a4a22'); } R(g,x-16,top+2,w+32,3,zi[4]); }
  if(o.lamp&&!ruina){ const lx=x+w-10, ly=fy-34; R(g,lx,ly,6,10,'#3a3020'); emitW(g,g=>{ R(g,lx+1,ly+2,4,6,'#ffd070'); }); glow(g,lx+3,ly+5,40,'#ffb050',.08,4); reg(LAMPS,{x:(lx+3)/RS,y:(ly+5)/RS,r:14,mid:true}); }
  if(o.escada!==false){ for(let k=0;k<5;k++) R(g,x+w+4,fy+k*9,16,2,wd[2]); R(g,x+w+2,fy,2,st,wd[3]); R(g,x+w+20,fy,2,st,wd[3]); } }
function canoa(g,x,yw,len,s){ const c=rmp(hsh(s)>.5?'#6e4a30':'#2a6aa8'); poly(g,[[x,yw-12],[x+len,yw-14],[x+len-14,yw],[x+12,yw]],c[3]); R(g,x+6,yw-12,len-10,3,c[1]); R(g,x+10,yw-9,len-22,2,'#1a120c'); line(g,x+len*.3,yw-12,x+len*.2,yw-30,MAD[3],2); }
function rabeta(g,x,yw,s){ canoa(g,x,yw,150,s); R(g,x-14,yw-26,22,16,'#3a3a40'); R(g,x-12,yw-24,8,6,'#e8402a'); line(g,x-4,yw-14,x-40,yw-2,'#2a2a30',2); }
function boto(g,x,yw,s){ const c=rmp('#e7a9a3'); for(let i=0;i<30;i++){ const t=i/29, y=yw-Math.sin(t*Math.PI)*14; R(g,x+i*2,y,3,Math.sin(t*Math.PI)*14+1,i<15?c[1]:c[2]); } poly(g,[[x+26,yw-14],[x+32,yw-24],[x+38,yw-13]],c[3]); R(g,x,yw,62,2,mix(c[4],'#ffffff',.3)); }
function grade(g,a,b,yb,h){ const c=rmp('#e8e2d2'); R(g,a,yb-h,b-a,4,c[1]); R(g,a,yb-h,b-a,1,c[0]); R(g,a,yb-h+4,b-a,1,c[4]); R(g,a,yb-h*.5,b-a,2,c[2]);
  for(let x=Math.floor(a/48)*48;x<b;x+=48){ R(g,x,yb-h,5,h,c[2]); R(g,x,yb-h,2,h,c[0]); R(g,x+4,yb-h,1,h,c[4]); } for(let x=Math.floor(a/12)*12;x<b;x+=12) R(g,x,yb-h*.5,2,h*.5,c[3]); }
function cabineBalsa(g,x,w,s){ const c=BRANCO, fx=AZULB, top=HB-210; R(g,x,top,w,HB-top,c[2]); R(g,x,top,w,3,c[0]); R(g,x+w-10,top,10,HB-top,c[4]);
  R(g,x,top+60,w,10,fx[2]); R(g,x,top+60,w,2,fx[1]); R(g,x,HB-40,w,12,fx[2]);
  for(let k=x+24;k<x+w-40;k+=46){ R(g,k,top+20,30,26,GLASS[3]); R(g,k,top+20,30,3,GLASS[1]); line(g,k,top+44,k+20,top+22,GLASS[0]); ell(g,k+15,top+100,12,12,c[4]); ell(g,k+15,top+100,10,10,GLASS[2]); R(g,k+8,top+94,4,3,GLASS[0]); if(hsh(k+s)>.4){ emitW(g,g=>R(g,k+2,top+23,26,20,'#f0b060')); pushWin(k+2,top+23,26,20); } }
  porta(g,x+w-90,HB-118,44,78,{c,s,kind:'aco',transom:false,metal:'#c8c8c8'}); R(g,x-6,top-12,w+12,14,c[1]); R(g,x-6,top-12,w+12,2,c[0]);
  R(g,x+40,top-70,26,60,'#c8382a'); R(g,x+40,top-70,26,8,'#1a1a1e'); for(let i=0;i<3;i++){ g.save(); g.globalAlpha=.25-i*.06; ell(g,x+53+i*16,top-86-i*20,14+i*8,10+i*5,'#d8d8d8'); g.restore(); }
  for(let k=0;k<3;k++) boia(g,x+90+k*120,top+170); }
// seringueira com cortes em espinha e tigela de látex
function seringueira(g,x,yt,yb,w,s,fog){ const T=tronco(g,x,yt,yb,w,'#9a9484',s,{fog,flare:.8}); const c=rmp(dep('#9a9484',fog));
  for(let i=0;i<6;i++){ const y=yb-150+i*14; if(y<yt+40) continue; const cx=T.cx(y), ww=T.wd(y); line(g,cx-ww*.42,y-8,cx+ww*.3,y,'#3a2a20',2); line(g,cx-ww*.42,y-7,cx+ww*.3,y+1,'#f2efe4'); }
  const cy=yb-60, cx=T.cx(cy); line(g,cx+w*.3,yb-150,cx+w*.2,cy-6,'#f2efe4'); R(g,cx+w*.1,cy-4,14,10,'#4a4a50'); R(g,cx+w*.1,cy-4,14,3,'#f2efe4'); R(g,cx+w*.1-2,cy-6,18,2,'#2a2a30'); R(g,cx+w*.1+2,cy-8,1,6,'#3a2a20'); }
function barracao(g,x,w,s){ const c=rmp('#8a7a62'), wd=MADV, st=40, fy=HB-st, top=fy-110;
  for(let px=x;px<=x+w;px+=70){ R(g,px,fy,8,st,wd[4]); R(g,px,fy,2,st,wd[2]); }
  R(g,x-10,fy-6,w+20,8,wd[2]); R(g,x-10,fy-6,w+20,2,wd[1]);
  R(g,x+40,top,w-80,104,c[2]); for(let bx=x+40;bx<x+w-40;bx+=8){ R(g,bx,top,1,104,c[3]); R(g,bx+1,top,1,104,c[1]); } R(g,x+w-48,top,8,104,c[4]);
  for(let k=0;k<3;k++){ const wx=x+80+k*((w-160)/3); const lit=hsh(s+k)>.4; R(g,wx,top+30,40,34,lit?'#2a1a14':'#14101a'); if(lit){ emitW(g,g=>{ R(g,wx,top+30,40,34,'#e09040'); R(g,wx+6,top+36,28,14,'#ffd080'); }); pushWin(wx,top+30,40,34); } R(g,wx-2,top+28,44,3,wd[2]); }
  porta(g,x+w/2-24,top+44,48,60,{c,s,kind:'aberta',transom:false,wood:'#6e5238'});
  for(let px=x-6;px<x+w+10;px+=40){ R(g,px,top-6,6,110,wd[3]); R(g,px,top-6,2,110,wd[1]); } R(g,x-10,fy-36,w+20,3,wd[1]); for(let px=x-8;px<x+w+10;px+=12) R(g,px,fy-34,2,28,wd[3]);
  const pl=rmp('#c8a860'), rt=top-90; poly(g,[[x-50,top+6],[x+w/2,rt],[x+w+50,top+6]],pl[5]);
  for(let y=rt;y<top+6;y+=3){ const t=(y-rt)/(top+6-rt), hw=(w/2+50)*t; for(let k=x+w/2-hw;k<x+w/2+hw;k+=3){ const v=hsh(k*.37+y*1.3); R(g,k,y,2,4+v*3,v>.8?pl[1]:v<.2?pl[4]:t<.3?pl[3]:pl[2]); } }
  for(let k=x-50;k<x+w+50;k+=4) R(g,k,top+4,3,6+hsh(k)*8,pl[3]);
  const lx=x+60, ly=fy-60; R(g,lx,ly,8,12,'#2a2018'); emitW(g,g=>R(g,lx+2,ly+3,4,7,'#ffd070')); glow(g,lx+4,ly+6,46,'#ffb050',.08,4); reg(LAMPS,{x:(lx+4)/RS,y:(ly+6)/RS,r:16,mid:true}); }
function defumador(g,x,yb,s){ const c=rmp('#8a5a3a'); for(let y=0;y<70;y+=2){ const ww=60-y*.6; R(g,x-ww/2,yb-y,ww,2,c[2]); R(g,x-ww/2,yb-y,ww*.25,2,c[1]); R(g,x+ww*.2,yb-y,ww*.3,2,c[4]); } archF(g,x-10,yb-26,20,26,'#1a0c08'); emit(g,g=>{ archF(g,x-7,yb-18,14,18,'#e8602a'); R(g,x-3,yb-10,6,10,'#ffc040'); }); glow(g,x,yb-10,40,'#ff8030',.1,4);
  for(let i=0;i<7;i++){ g.save(); g.globalAlpha=.32-i*.035; const px=x+Math.sin(i*.8+s)*16+i*6, py=yb-78-i*26; ell(g,px,py,12+i*6,9+i*4,'#c8c4b8'); ell(g,px-4,py-3,8+i*4,6+i*3,'#e8e4d8'); g.restore(); } }
function bolasBorracha(g,x,yb,n,s){ for(let i=0;i<n;i++){ const row=Math.floor(i/4), px=x+(i%4)*28+row*14, py=yb-row*22; ell(g,px,py-12,14,12,'#1a120c'); ell(g,px-3,py-15,9,7,'#2e2018'); R(g,px-6,py-19,4,2,'#5a4a3a'); } }
function tigelas(g,x,yb,s){ for(let i=0;i<5;i++){ const px=x+i*16; ell(g,px,yb-4,7,4,'#4a4a50'); ell(g,px,yb-6,6,2,'#f2efe4'); } }
// garimpo
function cava(g,a,b,cx,s){ const steps=5, yTop=HB-118, yBot=HB-16, dh=(yBot-yTop)/steps, c=rmpB('#c8743a');
  R(g,a,yTop,b-a,HB-yTop,c[2]); for(let x=Math.floor(a/6)*6;x<b;x+=6){ const v=hsh(x*.17+s); if(v>.6) R(g,x,yTop+hsh(x*.7)*(HB-yTop),4+v*6,1,v>.85?c[1]:c[3]); } R(g,a,yTop,b-a,2,c[1]);
  for(let i=0;i<steps;i++){ const y=yTop+i*dh, hw=680-i*100, hw2=hw-50; if(cx+hw<a-20||cx-hw>b+20) continue;
    poly(g,[[cx-hw,y],[cx+hw,y],[cx+hw2,y+dh+1],[cx-hw2,y+dh+1]],c[3]);
    poly(g,[[cx-hw,y],[cx+hw,y],[cx+hw-5,y+4],[cx-hw+5,y+4]],c[1]); R(g,cx-hw+5,y+4,(hw-5)*2,1,c[4]);
    for(let k=0;k<hw/7;k++){ const px=cx-hw2+hsh(s+i*13+k)*hw2*2, L=4+hsh(k*3+i)*(dh-6); R(g,px,y+5,1,L,c[4]); if(hsh(k+i*7)>.7) R(g,px+1,y+5,1,L*.6,c[2]); }
    R(g,cx-hw2,y+dh*.55,hw2*2,2,mix(c[3],'#e8b070',.35)); R(g,cx-hw2,y+dh*.8,hw2*2,1,mix(c[3],'#8a3a1a',.3));
    poly(g,[[cx-hw,y],[cx-hw2,y+dh+1],[cx-hw2-12,y+dh+1]],c[2]); poly(g,[[cx+hw,y],[cx+hw2,y+dh+1],[cx+hw2+12,y+dh+1]],c[5]); }
  const hwB=680-steps*100+50; R(g,cx-hwB,yBot,hwB*2,HB-yBot,'#34524e'); R(g,cx-hwB,yBot,hwB*2,2,mix('#9ab8b4',skyRefl(),.4)); for(let k=0;k<14;k++) R(g,cx-hwB+hsh(k+s)*hwB*2,yBot+4+hsh(k*3)*10,14+hsh(k)*20,1,mix('#6a8a88',skyRefl(),.3));
  for(let i=0;i<3;i++){ const lx=cx-240+i*200, ly=yTop+i*dh; for(let k=0;k<7;k++) R(g,lx,ly+k*6,16,2,MAD[2]); R(g,lx,ly,2,dh+4,MAD[3]); R(g,lx+14,ly,2,dh+4,MAD[3]); }
  for(let i=0;i<3;i++){ const px=cx-500+i*420; pa(g,px,yTop+2); } }
function mataCortada(g,a,b,y,s){ for(let yy=y;yy<HB-118;yy+=3) R(g,a,yy,b-a,3,dep('#24442c',.5)); copa(g,a,b,y,44,'#3f6a32',s,.4,.15,true); for(let k=Math.floor(a/60);k<b/60+1;k++){ const v=hsh(k*3.3+s); if(v>.5){ const x=k*60+v*30; tronco(g,x,y-40-v*60,HB-122,6+v*6,'#5a4a3a',k,{fog:.3,moss:false}); for(let j=0;j<3;j++) line(g,x,y-30-v*40+j*16,x+(j%2?18:-18),y-44-v*40+j*16,mix('#5a4a3a',FOG,.3),2); } }
  R(g,a,HB-132,b-a,16,'#4a5a32'); for(let x=Math.floor(a/8)*8;x<b;x+=8) folha(g,x,HB-124+hsh(x)*6,-1.57+(hsh(x*3)-.5),8+hsh(x*7)*12,'#4a6a32','#6a8a3e'); }
function barracoLona(g,x,yb,s){ const lc=rmp(hsh(s)>.5?'#16161a':'#2a5aa8'); for(const px of [x,x+120]){ R(g,px,yb-90,5,90,MADV[3]); } poly(g,[[x-30,yb-70],[x+62,yb-110],[x+155,yb-70],[x+150,yb-60],[x-24,yb-60]],lc[3]); poly(g,[[x-30,yb-70],[x+62,yb-110],[x+62,yb-60],[x-24,yb-60]],lc[2]); line(g,x-30,yb-70,x+62,yb-110,lc[1]); R(g,x+10,yb-56,110,56,'#100c10'); R(g,x+16,yb-30,40,30,'#3a2a20'); R(g,x+70,yb-40,30,40,lc[4]);
  if(RL!=='dia'){ emitW(g,g=>R(g,x+64,yb-50,6,8,'#ffd070')); glow(g,x+67,yb-46,50,'#ffb050',.08,4); reg(LAMPS,{x:(x+67)/RS,y:(yb-46)/RS,r:16,mid:true}); } }
function draga(g,x,yw,s){ const c=rmp('#8a8a7a'); R(g,x,yw-20,260,20,'#3a3a3e'); R(g,x,yw-20,260,3,'#6a6a70'); R(g,x+30,yw-90,140,70,c[2]); R(g,x+30,yw-90,140,3,c[1]); R(g,x+150,yw-90,20,70,c[4]); R(g,x+50,yw-74,30,20,GLASS[3]);
  poly(g,[[x+20,yw-90],[x+100,yw-110],[x+180,yw-90]],'#16161a'); R(g,x+120,yw-130,10,40,'#4a4a50'); for(let i=0;i<4;i++){ g.save(); g.globalAlpha=.25-i*.05; ell(g,x+125+i*10,yw-140-i*18,8+i*6,6+i*4,'#5a5a5a'); g.restore(); }
  for(let t=0;t<200;t+=3){ const px=x+230+t, py=yw-30+t*.15+Math.sin(t*.05)*4; R(g,px,py,4,8,'#2a2a2e'); R(g,px,py,4,2,'#5a5a60'); } }
function bateia(g,x,yb){ ell(g,x,yb-4,16,5,'#6a7478'); ell(g,x,yb-6,13,3,'#9aa4a8'); ell(g,x,yb-6,6,2,'#c8d0d6'); R(g,x-2,yb-7,2,1,'#f2c230'); }
function pa(g,x,yb){ line(g,x,yb,x+30,yb-60,'#8a6a4a',3); poly(g,[[x-6,yb],[x+6,yb-4],[x+4,yb+10],[x-8,yb+8]],'#6c7478'); }
// tronco de igapó com raízes escora e marca d'água
function troncoAgua(g,x,yt,yw,w,s,fog){ tronco(g,x,yt,yw,w,'#6a5a4a',s,{fog,flare:1.6}); const c=rmp(dep('#6a5a4a',fog)); for(let k=-2;k<=2;k++){ if(!k) continue; const rx=x+k*w*.5; line(g,x+k*w*.2,yw-30-Math.abs(k)*6,rx,yw,c[3],3); line(g,x+k*w*.2,yw-31-Math.abs(k)*6,rx,yw-1,c[1]); }
  shade(g,x-w,yw-60,w*2,60,'#3a3020',fog?.15:.3); R(g,x-w*.6,yw-62,w*1.2,2,dep('#a89a7a',fog)); }
function reflexoTronco(g,x,w,yw,len,s){ const c=WPAL.negro; for(let y=yw;y<yw+len;y+=2){ const d=(y-yw)/len, off=Math.sin(y*.15+s)*3*(1+d*2), ww=w*(1+d*.3); if(hsh(y*.31+s)<.12) continue; g.save(); g.globalAlpha=.55*(1-d); R(g,x-ww/2+off,y,ww,2,'#0a0806'); R(g,x-ww/2+off,y,ww*.2,2,'#5a4a3a'); g.restore(); } }
function embauba(g,x,yb,h,s,fog){ const tr=rmp(dep('#c8c0b0',fog)), lf=rmp(dep('#7a9a6a',fog)); tronco(g,x,yb-h,yb,8,'#c8c0b0',s,{fog,moss:false,flare:.3}); for(let k=0;k<5;k++){ const a=-2.8+k*.6, ex=x+Math.cos(a)*50, ey=yb-h+Math.sin(a)*30; line(g,x,yb-h,ex,ey,tr[3],2); for(let j=0;j<7;j++){ const aa=j/7*Math.PI*2; folha(g,ex,ey,aa,12,lf[2],lf[1]); } ell(g,ex,ey,5,3,lf[3]); } }
function ilhaCapim(g,x,yw,w,s){ const c=rmp('#8aa04a'); R(g,x,yw-6,w,8,'#3a3a20'); for(let k=0;k<w;k+=3){ const h=8+hsh(s+k)*22; line(g,x+k,yw-4,x+k+(hsh(k*3+s)-.5)*8,yw-4-h,hsh(k+s)>.6?c[1]:c[2]); } }
// ---------------- polimento: várzea (arena do chefe), encontro das águas, igapó ----------------
// paletas pré-calculadas (mix é caro em laço por pixel)
const PALC={};
function palRows(key,P,n,sk,amt){ const k=key+sk+n; if(PALC[k]) return PALC[k]; const out=[]; for(let i=0;i<n;i++){ const d=i/(n-1); out.push(mix(P[Math.min(P.length-1,Math.floor(d*P.length))],sk,Math.max(0,amt-d*.6))); } return PALC[k]=out; }
WPAL.negroE=['#3a4a5c','#243040','#18202c','#121822','#0e131c','#0b0f16']; WPAL.barroE=['#f0bc74','#e4ac62','#d89e56','#cc904c','#c08444','#b4783c'];
WPAL.negroC=['#6a6250','#585040','#4a4234','#3e3628','#342c20','#2a2418'];

// árvore de várzea: tronco reto com marca d'água clara (linha da cheia), raízes-escora e reflexo no rio
function arvVarzea(g,x,yt,yw,w,s,fog,mk){ const c=rmpB(dep(pick(['#5a4a3a','#4e4236','#665240'],hsh(s)),fog)), m=rmpB(dep('#a8987a',fog)), h=yw-yt;
  for(let y=yt;y<yw;y++){ const t=(y-yt)/h, ww=Math.round(w*(1+Math.max(0,t-.8)*2.2)), x0=Math.round(x-ww/2), wet=y>yw-mk; const P=wet?m:c;
    R(g,x0,y,ww,1,P[2]); R(g,x0,y,Math.max(1,ww*.22),1,P[1]); R(g,x0+ww-Math.max(1,ww*.3),y,Math.max(1,ww*.3),1,P[4]);
    if(ww>8&&((y+Math.round(hsh(s)*9))%7===0)) R(g,x0+ww*.3+hsh(y+s)*ww*.3,y,2,1,P[3]); }
  const ym=yw-mk; R(g,x-w*.6,ym,w*1.2,1,m[0]); R(g,x-w*.6,ym+1,w*1.2,1,c[4]); for(let k=0;k<w/3;k++) R(g,x-w/2+hsh(s+k)*w,ym+2,1,2+hsh(k*3+s)*5,m[3]);
  if(w>9) for(const sd of [-1,1]){ line(g,x+sd*w*.3,yw-mk*.7,x+sd*w*1.1,yw,c[3],2); line(g,x+sd*w*.3,yw-mk*.7-1,x+sd*w*1.1,yw-1,m[1]); }
  for(let y=yw+1;y<yw+mk*1.4;y+=2){ if(hsh(y*.37+s)<.2) continue; const d=(y-yw)/(mk*1.4), off=Math.sin(y*.3+s)*2*(1+d*2); g.save(); g.globalAlpha=.45*(1-d); R(g,x-w*.6+off,y,w*1.2,1,'#2a1e12'); g.restore(); } }
// estaca torta (palafita abandonada, cerca de pesca)
function estaca(g,x,yb,h,tilt,s,col){ const c=rmp(col||MADV[3]); for(let t=0;t<h;t++){ const xx=x+tilt*t/h+Math.sin(t*.09+s)*1.2, ww=t>h-6?3:5; R(g,xx,yb-t,ww,1,c[2]); R(g,xx,yb-t,1,1,c[1]); R(g,xx+ww-1,yb-t,1,1,c[4]); }
  R(g,x-3,yb-2,11,3,mix(c[4],'#2a1e12',.5)); R(g,x-1,yb-14,8,3,mix(c[3],'#8a7a5a',.4)); }
// redemoinho do remanso (onde a cobra-grande sobe): anéis em espiral, centro fundo, espuma
function redemoinho(g,cx,cy,rx,s,P){ const ry=rx*.26; for(let i=0;i<7;i++){ const f=1-i/7; ell(g,cx,cy,rx*f,ry*f,mix(P[2],P[5],i/7)); }
  ell(g,cx,cy,rx*.12,ry*.14,'#1a120a');
  for(let k=0;k<7;k++){ const r0=rx*(.16+k*.12); for(let t=0;t<Math.PI*1.35;t+=.02){ const a=t+k*1.3+s, rr=r0*(1+t*.06); const px=cx+Math.cos(a)*rr, py=cy+Math.sin(a)*rr*.26, f=t/(Math.PI*1.35);
      g.fillStyle=f<.5?P[0]:mix(P[0],P[2],(f-.5)*2); g.fillRect(Math.round(px),Math.round(py),k<2?2:3,1); } }
  for(let k=0;k<26;k++){ const a=hsh(s+k)*Math.PI*2, rr=rx*(.2+hsh(k*3+s)*.8); ell(g,cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*.26,2+hsh(k)*3,1,'#e8dcc0'); }
  for(let k=0;k<5;k++){ const a=hsh(s*2+k)*Math.PI*2, rr=rx*(.3+hsh(k*5)*.5), px=cx+Math.cos(a)*rr, py=cy+Math.sin(a)*rr*.26; ell(g,px,py,6,3,'#3e6a2e'); R(g,px-3,py-2,3,1,'#6a9a4a'); } }
// lama molhada: textura de célula, brilho úmido em manchas orgânicas, rastros, capim
function fLama(g,a,b,s){ fMata(g,a,b,s,{base:'#5e4428',lite:'#8a6c46',pal:['#6a4c2e','#4a341e','#7a5c38','#3a5a28','#8a7048','#2e4a20'],broto:false,luz:false,pedras:false});
  const sk=skyRefl(), wet=mix('#54391f',sk,.06), wet2=mix('#4a321b',sk,.04), hi=mix('#8a6c46',sk,.55);
  for(let y=HB+6;y<HH;y+=3){ for(let x=Math.floor(a/6)*6;x<b;x+=6){ const lf=lowf(x*1.7,y*3.1,s+5)+(hsh(x*.31+y*.7)-.5)*.1; if(lf>.5){ R(g,x,y,6,3,lf>.6?wet2:wet); if(lf<.54) R(g,x,y,6,1,hi); else if(lf>.66&&hsh(x*1.3+y)>.8) R(g,x+1,y+1,4,1,hi); } } }
  for(let k=Math.floor(a/170);k<b/170+1;k++){ const v=hsh(k*6.1+s); if(v<.55) continue; const x=k*170+v*90, y=HB+30+hsh(k*2.3+s)*190, d=(y-HB)/(HH-HB); for(let i=0;i<3;i++){ const px=x+i*(16+d*14), py=y+(i%2)*6; ell(g,px,py,3+d*3,1.5+d,'#2e2014'); R(g,px-2,py-2-d,3+d*3,1,'#8a6c46'); } }
  for(let k=Math.floor(a/53);k<b/53+1;k++){ const v=hsh(k*3.9+s*2); if(v<.78) continue; const x=k*53+v*30, y=HB+12+hsh(k*8.1+s)*(HH-HB-20), d=(y-HB)/(HH-HB), gc=rmp('#6a8a3a'); for(let j=0;j<6;j++) line(g,x+j*2,y,x+j*2+(hsh(j+k)-.5)*8,y-(5+d*12)*(.6+hsh(j*3+k)*.6),j%2?gc[1]:gc[2]); }
  R(g,a,HB,b-a,3,mix('#3a2a18',sk,.2)); for(let x=Math.floor(a/9)*9;x<b;x+=9){ if(hsh(x*.7+s)>.55) R(g,x,HB+2+hsh(x)*3,5+hsh(x*3)*8,1,'#d8ccb0'); }
  shade(g,a,HB,b-a,10,'#0a0806',.35); }
// rastro da cobra-grande: sulco sinuoso na lama até o remanso
function rastroCobra(g,x0,x1,y0,y1,s){ for(let x=x0;x<x1;x+=2){ const t=(x-x0)/(x1-x0), y=y0+(y1-y0)*t+Math.sin(t*9+s)*16, w=10+t*10; R(g,x,y-w/2,2,w,'#3e2a18'); R(g,x,y-w/2+1,2,w*.35,'#33220f'); R(g,x,y-w/2-1,2,1,'#8a6c46'); R(g,x,y+w/2,2,1,'#6a5034'); if(hsh(x*.3)>.7) R(g,x,y-w*.2,2,1,'#4a3a26'); } }
// poça de remanso no chão (barroC) com borda de lama
function remanso(g,cx,cy,rx,ry,s){ const P=WPAL.barroC, sk=skyRefl(), pts=[]; for(let k=0;k<28;k++){ const a=k/28*Math.PI*2, r=1+Math.sin(k*.9+s)*.06+(hsh(s+k*1.7)-.5)*.06; pts.push([cx+Math.cos(a)*rx*r,cy+Math.sin(a)*ry*r]); }
  poly(g,pts.map(p=>[cx+(p[0]-cx)*1.05,cy+(p[1]-cy)*1.1+3]),'#2a1c10'); poly(g,pts,mix(P[1],sk,.32));
  for(let i=0;i<6;i++){ const f=1-i*.13; poly(g,pts.map(p=>[cx+(p[0]-cx)*f,cy+(p[1]-cy)*f]),mix(P[Math.min(5,1+i)],sk,Math.max(0,.42-i*.06))); }
  g.save(); g.globalAlpha=.4; poly(g,pts.map(p=>[p[0],cy-ry+(p[1]-cy+ry)*.25]),'#22301e'); g.restore();
  for(let k=0;k<60;k++){ const a=hsh(k*2.1+s)*Math.PI*2, rr=.3+hsh(k*5.3+s)*.6; R(g,cx+Math.cos(a)*rx*rr,cy+Math.sin(a)*ry*rr,6+hsh(k)*14,1,mix(P[0],sk,.45)); }
  redemoinho(g,cx,cy,rx*.55,s,P.map(c=>mix(c,sk,.12)));
  for(let k=0;k<28;k++){ const p=pts[k]; if(hsh(k+s)>.5) R(g,p[0]-4,p[1]-1,8+hsh(k*3)*10,1,'#d8ccb0'); } }

// Encontro das Águas: Rio Negro (escuro) e Solimões (barro) lado a lado, linha de mistura ondulada com línguas e redemoinhos
function rioEncontro(g,a,b,y0,y1,cx,s){ const sk=skyRefl(), n=Math.round((y1-y0)/2);
  const PN=palRows('enN',WPAL.negroE,n,sk,.14), PB=palRows('enB',WPAL.barroE,n,sk,.12), PM=[]; for(let i=0;i<n;i++) PM.push([mix(PN[i],PB[i],.3),mix(PN[i],PB[i],.7),mix(PB[i],'#f4ead0',.45)]);
  for(let i=0;i<n;i++){ const y=y0+i*2, d=i/(n-1), sx=cx+(y-y0)*2.6+Math.sin(y*.09+s)*18*(.3+d), fy=y0+10+d*0;
    for(let x=Math.floor(a/4)*4;x<b;x+=4){ const nz=lowf(x*1.9,y*4,s)*42*(.4+d)+Math.sin(x*.021+y*.17+s)*14*(.3+d);
      const fx=x-sx+nz, ff=(x<sx?(y0+14+Math.sin(x*.008+s)*5+lowf(x,y,s)*6)-y:-99), t=Math.max(fx,ff*6), Z=26+d*14;
      let c; if(t>Z) c=PB[i]; else if(t<-Z) c=PN[i]; else { const sw=Math.sin(x*.06+y*.45+s+t*.18)+Math.sin(x*.023-y*.3)*.5; c=t>Z*.45?(sw>.1?PB[i]:PM[i][1]):t<-Z*.45?(sw>.5?PM[i][0]:PN[i]):(sw>.9?PM[i][2]:sw>-.1?PM[i][1]:PM[i][0]); }
      if(Math.abs(t)<3&&hsh(x*.7+y)>.35) c=PM[i][2]; g.fillStyle=c; g.fillRect(x,y,4,2); } }
  for(let i=0;i<n;i+=1){ const y=y0+i*2, d=i/(n-1), L=6+d*40; for(let k=Math.floor(a/26)-1;k<b/26+1;k++){ const v=hsh(k*2.3+i*5.1+s); if(v>.66){ const x=k*26+v*18; R(g,x,y,L*(v-.5),1,x<cx+(y-y0)*2.6?mix(WPAL.negroE[0],sk,.35):mix(WPAL.barroE[0],'#fff4d8',.4)); } } }
  R(g,a,y0,b-a,1,mix(WPAL.barroE[0],sk,.5)); }
// convés de balsa: tábuas calafetadas sobre vigas de aço rebitadas, ferrugem escorrendo, desgaste
function fConves(g,a,b,s){ fTabuas(g,a,b,s,'#8a6a48',HB,false); const st=rmp('#6a7470');
  rowsC('tb'+HB,HB,HH,9,.1).forEach(([y,h],ri)=>{ const d=(y-HB)/(HH-HB);
    if(ri%4===2){ R(g,a,y,b-a,h,st[2]); R(g,a,y,b-a,1,st[0]); R(g,a,y+1,b-a,1,st[1]); R(g,a,y+h-1,b-a,1,st[5]); const rs=Math.max(10,Math.round(12+d*14));
      for(let x=Math.floor(a/rs)*rs;x<b;x+=rs){ const rv=Math.max(1,Math.round(1+d*2)); R(g,x,y+h*.5-rv/2,rv+1,rv+1,st[4]); R(g,x,y+h*.5-rv/2,rv,rv,st[1]); }
      for(let k=Math.floor(a/140);k<b/140+1;k++){ const v=hsh(k*3.7+ri+s); if(v<.4) continue; const x=k*140+v*80; blob(g,x,y+1,20+v*40,h-2,mix(st[2],'#8a4a22',.55)); R(g,x+4,y+2,10+v*20,1,'#b86a32');
        g.save(); g.globalAlpha=.55; streak(g,x+8,y+h,8+d*26+v*10,2+Math.round(d*2),'#7a3e1c'); if(v>.7) streak(g,x+22,y+h,6+d*16,2,'#8a4a22'); g.restore(); } }
    else { for(let k=Math.floor(a/90);k<b/90+1;k++){ const v=hsh(k*1.9+ri*7.3+s); if(v>.86){ const x=k*90+v*40; g.save(); g.globalAlpha=.18; R(g,x,y+1,40+v*60,h-2,'#e8d8b8'); g.restore(); } else if(v<.06){ R(g,k*90,y+2,2+d*2,h-4,'#1a120c'); } } } });
  R(g,a,HB,b-a,8,st[3]); R(g,a,HB,b-a,1,st[0]); for(let x=Math.floor(a/18)*18;x<b;x+=18) R(g,x,HB+3,2,2,st[1]);
  R(g,a,HB+8,b-a,6,'#d8b030'); for(let x=Math.floor(a/40)*40;x<b;x+=40) poly(g,[[x,HB+8],[x+14,HB+8],[x+6,HB+14],[x-8,HB+14]],'#2a2420');
  shade(g,a,HB,b-a,6,'#0a0c10',.4); }
function corda(g,x,y,r,s){ const c=rmp('#c8a868'); for(let i=0;i<4;i++){ const rr=r-i*r*.2; ell(g,x,y,rr,rr*.32,c[4]); ell(g,x,y-1,rr-1,rr*.32-1,i%2?c[2]:c[1]); } ell(g,x,y,r*.25,r*.08,'#2a1e12'); line(g,x+r,y,x+r+20,y+6,c[2],2); }
function escotilha(g,x,y,w){ const c=rmp('#5a6460'), h=w*.32; R(g,x-2,y-2,w+4,h+4,c[5]); R(g,x,y,w,h,c[2]); R(g,x,y,w,2,c[0]); R(g,x,y+h-2,w,2,c[4]); for(let k=x+6;k<x+w-4;k+=10){ R(g,k,y+3,2,2,c[4]); R(g,k,y+h-5,2,2,c[4]); } R(g,x+w*.4,y+h*.3,w*.2,3,c[1]); blob(g,x+w*.6,y+4,w*.3,h-8,mix(c[2],'#8a4a22',.5)); }

/* =====================================================================
   COMPOSIÇÃO POR ÁREA
   ===================================================================== */
// mata em camadas: copa distante enevoada, troncos finos ao longe, névoa, copa e troncos do meio, sub-bosque
function mata(X0,X1,s,o={}){ const base=o.base||'#3f7a35', bark=o.bark||'#6a5644', gap=o.gap??.12, yC=o.yC??70;
  add(X0-200,X1+200,0,(g,lo,hi)=>{ const a=Math.max(lo,X0-200), b=Math.min(hi,X1+200); if(b<=a) return;
    for(let y=yC+6;y<HB;y+=3) R(g,a,y,b-a,3,mix(dep('#24442c',.62),dep('#1c3624',.42),Math.min(1,(y-yC)/(HB-yC)))); // fundo de mata enevoado: só a copa deixa ver o céu
    copa(g,a,b,yC-10,40,base,s,.62,gap+.15);
    for(let k=Math.floor(a/30)-1;k<b/30+1;k++){ const v=hsh(k*3.7+s); if(v<.4) continue; const x=k*30+v*14; tronco(g,x,yC+10,HB-20,4+v*7,bark,k,{fog:.58,moss:false,flare:.4}); }
    shade(g,a,yC,b-a,HB-yC,FOG,.22);
    for(let k=Math.floor(a/170)-1;k<b/170+1;k++){ const v=hsh(k*5.1+s+3); if(v<.25) continue; const x=k*170+v*60; for(let j=0;j<2;j++) cipoV(g,x+j*14,yC+10,60+hsh(k+j)*120,k+j,.4); }
    copa(g,a,b,yC+20,56,base,s+7,.36,gap);
    for(let k=Math.floor(a/120)-1;k<b/120+1;k++){ const v=hsh(k*2.9+s+9); if(v<.3) continue; const x=k*120+v*50, w=14+v*16; tronco(g,x,yC+30,HB-6,w,bark,k*7,{fog:.32,flare:.9}); }
    if(o.palms) for(let k=Math.floor(a/260)-1;k<b/260+1;k++){ const v=hsh(k*4.3+s+1); if(v<.4) continue; acai(g,k*260+v*100,HB-6,150+v*70,k*3,.28); }
    shade(g,a,yC+40,b-a,HB-yC-40,FOG,.12);
    subBosque(g,a,b,HB+4,70,base,s,.2); });
  // árvores grandes de perto com sapopemas, palmeiras e cipós
  const T=o.trees||[.08,.3,.55,.78,.95], L=X1-X0;
  T.forEach((r,i)=>{ const x=X0+L*r+(hsh(s+i)-.5)*120, w=40+hsh(s*3+i)*34, sap=o.sap!==false&&hsh(s*7+i)>.3;
    add(x-w*4,x+w*4,1,g=>{ if(sap) sapopemas(g,x,HB+6,w,90+hsh(s+i*5)*70,bark,s+i*11,6); tronco(g,x,-10,HB+8,w,bark,s+i*3,{flare:sap?1.4:.9});
      for(let j=0;j<3;j++){ const tx=x+(j-1)*w*.3; cipoV(g,tx,40+hsh(s+i+j)*60,120+hsh(s*2+i+j)*120,s+i*5+j,0); } }); });
  if(o.palms) for(let i=0;i<Math.round(L/900);i++){ const x=X0+hsh(s*13+i)*L; add(x-120,x+120,1,g=>{ acai(g,x,HB+4,190+hsh(s+i)*60,s+i*7,0); acai(g,x+26,HB+4,160+hsh(s*2+i)*60,s+i*9,0); }); }
  // copa de perto pendendo do topo + cipós entre as árvores
  add(X0-200,X1+200,2,(g,lo,hi)=>{ const a=Math.max(lo,X0-200), b=Math.min(hi,X1+200); if(b<=a) return; copa(g,a,b,o.yTop??-6,62,base,s+21,0,o.gapTop??.2);
    for(let k=Math.floor(a/240)-1;k<b/240+1;k++){ const v=hsh(k*6.1+s); if(v<.35) continue; const x=k*240+v*80; cipo(g,x,20+v*40,x+180+v*120,30+hsh(k)*50,60+v*80,k); }
    for(let k=Math.floor(a/90)-1;k<b/90+1;k++){ const v=hsh(k*8.3+s+5); if(v<.55) continue; cipoV(g,k*90+v*40,10,80+v*140,k,0); } });
  FIRE.push({x0:X0/RS,x1:X1/RS});
}
function subBosque(g,a,b,yb,hm,base,s,fog){ const c=rmp(dep(base,fog)), c2=rmp(dep('#5a8a3a',fog));
  for(let x=Math.floor(a/10)*10-10;x<b+10;x+=10){ const h=hm*(.45+.55*Math.abs(lowf(x,yb,s))); R(g,x,yb-h*.45,10,h*.45+2,c[4]); }
  for(let k=Math.floor(a/16)-2;k<b/16+2;k++){ const v=hsh(k*1.9+s), x=k*16+v*10, h=hm*(.45+.55*Math.abs(lowf(x,yb,s)));
    for(let j=0;j<6;j++){ const an=-1.57+(hsh(v*7+j)-.5)*2.2, L=h*(.35+hsh(v*11+j)*.6); folha(g,x,yb-h*.35,an,L,j<3?c[3]:c[2],j<3?c[2]:c[1]); }
    if(v>.8) folhaGrande(g,x,yb-6,30+v*20,-1.57+(v-.9)*4,k,dep('#3e8a44',fog)); if(v<.06) samambaia(g,x,yb,26,k,dep('#4a8a3a',fog)); } }
function decalMata(X0,X1,s,o={}){ const L=X1-X0;
  for(let i=0;i<Math.round(L/700);i++){ const x=X0+hsh(s+i*3.1)*L, y=HB+16+hsh(s*2+i)*60; add(x-20,x+320,4,g=>raiz(g,x,y,180+hsh(s+i)*140,s+i,o.raiz)); }
  for(let i=0;i<Math.round(L/500);i++){ const x=X0+hsh(s*5+i*1.7)*L, y=HB+40+hsh(s*7+i)*190; add(x-10,x+120,4,g=>galho(g,x,y,40+hsh(i+s)*80,s+i)); }
  if(o.pocas) for(let i=0;i<o.pocas;i++){ const x=X0+L*(.1+i*.8/o.pocas)+hsh(s+i*9)*200, y=HB+70+hsh(s*3+i*5)*150; const pw=(o.kind==='latex'?70:180)+hsh(s+i)*(o.kind==='latex'?90:260); add(x-240,x+240,4,g=>poca2(g,x,y,pw,s+i,o.kind||'negra')); }
  if(o.cog!==false) for(let i=0;i<Math.round(L/1100);i++){ const x=X0+hsh(s*9+i*2.3)*L, y=HB+14+hsh(s*11+i)*40; add(x-30,x+60,4,g=>cogumelos(g,x,y,s+i,o.glow?'#a6f03a':null)); }
  for(let i=0;i<Math.round(L/1600);i++){ const x=X0+hsh(s*13+i*2.9)*L, y=HB+150+hsh(s*15+i)*120; add(x-60,x+80,4,g=>sangue(g,x,y,s+i,hsh(i+s)>.6)); }
}
function compose(A){ const X0=A.x0*RS, X1=A.x1*RS, L=X1-X0, s=A.n*1000;
  const chao=(fn)=>add(X0,X1,3,(g,lo,hi)=>{ const a=Math.max(lo,X0), b=Math.min(hi,X1); if(b>a) fn(g,a,b); });
  const prop=(r,w,fn)=>{ const x=X0+L*r; add(x-60,x+w+60,5,g=>fn(g,x)); };
  const at=(r,w,z,fn)=>{ const x=X0+L*r; add(x-80,x+w+80,z,g=>fn(g,x)); };
  const band=(z,fn,a0,b0)=>{ const A0=a0??X0, B0=b0??X1; add(A0,B0,z,(g,lo,hi)=>{ const a=Math.max(lo,A0), b=Math.min(hi,B0); if(b>a) fn(g,a,b); }); };
  const poste=(rs)=>rs.forEach(r=>{ const x=X0+L*r; add(x-40,x+40,1,g=>posteColonial(g,x,HB+4,170,true,true)); });
  const casas=(a0,b0,sd,o={})=>{ let x=a0, i=0; while(x<b0-120){ const w=Math.min(b0-x,170+Math.round(hsh(sd+i*3.1)*120)), xx=x, col=pick(['#f2c84a','#4aa8d8','#e8708e','#7ac86a','#f0a050','#f4e6c0','#9a7ad8','#3ab0a0','#e8e070','#d8524a'],hsh(sd+i*7.7));
      add(xx,xx+w+4,1,g=>sobrado(g,xx,w,{seed:sd+i,col,fl:2+Math.floor(hsh(sd+i*5)*2),par:pick(['beiral','reta','balaustre','curva'],hsh(sd+i*9)),balc:hsh(sd+i*11)>.5,arch:hsh(sd+i*13)>.6,lamp:true,shop:o.shop&&hsh(sd+i*15)>.4})); x+=w; i++; } };
  switch(A.id){
  case 'porto': {
    band(0,(g,a,b)=>rio(g,a,b,HZC,HB,'negro',s)); WATER.push({x0:X0/RS,x1:X1/RS,hz:HZC});
    at(.27,260,0,(g,x)=>guindaste(g,x,HZC+8,s));
    at(.30,1100,0,(g,x)=>galpaoFlutuante(g,x,1000,HB-14,s));
    band(0,(g,a,b)=>fundoTelhados(g,a,b,s),X0,X0+1700);
    add(X0,X0+1700,1,g=>{ ecletico(g,X0+20,620,{seed:s+3,col:'#d8843a',fl:3,par:'balaustre',arch:true}); torreRelogio(g,X0+700,HB,s); ecletico(g,X0+800,560,{seed:s+9,col:'#c86a4a',fl:3,par:'balaustre',arch:true,dome:'r',domeC:'#4a7a6a'}); });
    add(X0,X0+1400,1,(g,lo,hi)=>{ const a=Math.max(lo,X0), b=Math.min(hi,X0+1400); for(let x=Math.floor(a/30)*30;x<b;x+=30){ R(g,x,HB-8,30,10,'#7a7468'); R(g,x,HB-8,30,1,'#a8a090'); R(g,x+29,HB-8,1,10,'#4a4640'); } });
    for(const [r,Lb,o] of [[.36,520,{}],[.47,560,{faixa:'#2e9a4a',friso:'#f0c23a',band:'#2a52b0'}],[.62,480,{faixa:'#c8382a',friso:'#2a5aa8'}],[.75,540,{casco:'#f0c23a',faixa:'#2a5aa8',friso:'#c8382a'}]]) at(r,Lb+40,1,(g,x)=>barco(g,x,HB-4,Lb,s+r*100,o));
    at(.88,190,1,(g,x)=>lancha(g,x,HB-4,s));
    chao((g,a,b)=>{ fTabuas(g,a,b,s,'#8a6a4a'); R(g,a,HB,b-a,14,'#2a1e18'); R(g,a,HB,b-a,2,'#5a4a3a'); for(let x=Math.floor(a/90)*90;x<b;x+=90){ ell(g,x+40,HB+8,9,7,'#141216'); ell(g,x+40,HB+8,5,4,'#2e2c34'); } });
    for(const r of [.32,.43,.55,.69,.82]){ const x=X0+L*r; add(x-20,x+200,4,g=>{ cabeco(g,x,HB+30); sag(g,x,HB+18,x+160,HB-40,14,'#c8b888',2); }); }
    for(let i=0;i<5;i++){ const x=X0+hsh(s+i)*L, y=HB+80+hsh(s*2+i)*140; add(x-200,x+200,4,g=>poca2(g,x,y,160+hsh(i)*160,s+i,'negra')); }
    decalMata(X0,X1,s,{cog:false}); poste([.06,.2,.92]);
    prop(.1,60,(g,x)=>{ isopor(g,x,HB+70,s); isopor(g,x+6,HB+40,s+1); }); prop(.17,120,(g,x)=>sacas(g,x,HB+80,7,s));
    prop(.4,60,(g,x)=>{ caixote(g,x,HB+64,44,s); caixote(g,x+50,HB+66,40,s+1); caixote(g,x+22,HB+30,40,s+2); }); prop(.52,40,(g,x)=>boia(g,x,HB+56)); prop(.58,40,(g,x)=>tambor(g,x,HB+60,'#2a5aa8'));
    prop(.66,100,(g,x)=>rede(g,x,HB+66,s)); prop(.8,60,(g,x)=>{ isopor(g,x,HB+76,s+5); tambor(g,x+64,HB+70,'#c8382a'); }); prop(.95,120,(g,x)=>sacas(g,x,HB+70,5,s+3));
    break; }
  case 'adolpho': {
    band(0,(g,a,b)=>fundoTelhados(g,a,b,s));
    casas(X0,X0+1000,s+40,{shop:true}); add(X0+1000,X0+2000,1,g=>mercadoPav(g,X0+1020,960,s));
    add(X0+2000,X0+4700,1,g=>mercadoFerro(g,X0+2000,2700,s)); casas(X0+4700,X1,s+80,{shop:true});
    chao((g,a,b)=>fLadrilho(g,a,b,s)); poste([.04,.36,.88]);
    for(let i=0;i<6;i++){ const x=X0+hsh(s+i*3)*L, y=HB+60+hsh(s*2+i)*160; add(x-150,x+150,4,g=>poca2(g,x,y,120+hsh(i)*120,s+i,'negra')); }
    decalMata(X0,X1,s,{cog:false});
    prop(.08,150,(g,x)=>bancaFeira(g,x,HB+64,s)); prop(.24,160,(g,x)=>pirarucuBanca(g,x,HB+70,s)); prop(.44,150,(g,x)=>bancaFeira(g,x,HB+60,s+3)); prop(.6,160,(g,x)=>pirarucuBanca(g,x,HB+66,s+5)); prop(.76,150,(g,x)=>bancaFeira(g,x,HB+64,s+7));
    for(const r of [.16,.34,.52,.68,.9]) prop(r,40,(g,x)=>{ paneiro(g,x,HB+96,s+r*9); cestoCastanha(g,x+50,HB+100,s+r*3); });
    prop(.4,40,(g,x)=>balanca(g,x,HB+92)); prop(.84,60,(g,x)=>{ caixote(g,x,HB+90,40,s); caixote(g,x+44,HB+92,36,s+1); });
    break; }
  case 'teatro': {
    band(0,(g,a,b)=>fundoTelhados(g,a,b,s));
    casas(X0,X0+1500,s+40); casas(X0+4100,X1,s+80);
    add(X0+1300,X0+4300,1,g=>teatro(g,X0+2800,s));
    for(const r of [.06,.2,.78,.92]){ const x=X0+L*r; add(x-260,x+260,1,g=>arvoreCopa(g,x,HB+4,s+r*100,1.1)); }
    chao((g,a,b)=>{ fPortuguesa(g,a,b,HB,s,true); shade(g,a,HB,b-a,8,'#100a14',.4); });
    for(let i=0;i<6;i++){ const x=X0+hsh(s*3+i)*L, y=HB+30+hsh(s*5+i)*100; add(x-20,x+300,4,g=>raiz(g,x,y,160+hsh(i)*120,s+i,'#5a4632')); }
    for(let i=0;i<4;i++){ const x=X0+hsh(s+i*7)*L, y=HB+80+hsh(s*2+i)*140; add(x-150,x+150,4,g=>poca2(g,x,y,140+hsh(i)*120,s+i,'negra')); }
    decalMata(X0,X1,s,{cog:false}); poste([.14,.3,.7,.86]);
    for(const r of [.1,.42,.64,.96]) prop(r,70,(g,x)=>banco2(g,x,HB+44)); prop(.26,60,(g,x)=>pipoca(g,x,HB+70,s)); prop(.74,60,(g,x)=>pipoca(g,x,HB+66,s+1));
    break; }
  case 'encontro': {
    band(0,(g,a,b)=>rioEncontro(g,a,b,160,HB,X0+L*.5-220,s));
    WATER.push({x0:X0/RS,x1:X1/RS,hz:160,enc:true});
    for(const r of [.2,.5,.81]) at(r,70,0,(g,x)=>boto(g,x,236+hsh(r*9)*30,s));
    at(.66,200,0,(g,x)=>{ g.save(); g.globalAlpha=.55; lancha(g,x,172,s); g.restore(); });
    add(X0,X0+1000,1,g=>cabineBalsa(g,X0+30,900,s));
    band(1,(g,a,b)=>grade(g,a,b,HB+2,46),X0+930,X1);
    for(const r of [.36,.58,.8]){ const x=X0+L*r; add(x-20,x+20,1,g=>boia(g,x,HB-8)); }
    chao((g,a,b)=>fConves(g,a,b,s));
    for(let i=0;i<4;i++){ const x=X0+hsh(s+i*5)*L, y=HB+70+hsh(s*2+i)*140; add(x-120,x+120,4,g=>poca2(g,x,y,70+hsh(i)*80,s+i,'negra')); }
    for(let i=0;i<3;i++){ const x=X0+hsh(s*3+i)*L, y=HB+150+hsh(i)*90; add(x-60,x+80,4,g=>sangue(g,x,y,s+i,true)); }
    for(const r of [.27,.52,.77,.97]) prop(r,60,(g,x)=>{ cabeco(g,x,HB+44); sag(g,x+6,HB+30,x+70,HB-30,10,'#c8a868',2); });
    prop(.32,60,(g,x)=>corda(g,x,HB+120,26,s)); prop(.72,60,(g,x)=>corda(g,x,HB+170,32,s+3));
    prop(.44,140,(g,x)=>escotilha(g,x,HB+96,130));
    prop(.12,60,(g,x)=>{ isopor(g,x,HB+70,s); isopor(g,x+56,HB+74,s+2); }); prop(.6,40,(g,x)=>{ tambor(g,x,HB+70,'#c8382a'); tambor(g,x+34,HB+72,'#2a5aa8'); });
    prop(.86,60,(g,x)=>caixote(g,x,HB+80,40,s)); prop(.9,40,(g,x)=>boia(g,x,HB+150));
    break; }
  case 'ribeirinha': {
    band(0,(g,a,b)=>{ copa(g,a,b,206,30,'#3f7a35',s,.5,.1,true); R(g,a,214,b-a,20,dep('#2a4a2e',.5)); shade(g,a,150,b-a,90,FOG,.18); rio(g,a,b,232,HB,'negro',s); });
    WATER.push({x0:X0/RS,x1:X1/RS,hz:232});
    for(let i=0;i<Math.round(L/160);i++){ const x=X0+hsh(s+i*2.7)*L; add(x-100,x+100,0,g=>{ if(hsh(s*3+i)>.5) acai(g,x,236,120+hsh(i+s)*60,s+i,.25); else buriti(g,x,236,110+hsh(i*3+s)*50,s+i,.25); }); }
    let x=X0+60, i=0; while(x<X1-200){ const w=200+Math.round(hsh(s+i*3)*120), xx=x, ii=i; add(xx-30,xx+w+40,1,g=>palafita(g,xx,HB-2,w,s+ii*17,{lamp:hsh(s+ii)>.5,st:36+Math.round(hsh(s*2+ii)*20)}));
      if(hsh(s*5+i)>.4){ const cx=xx+w+30; add(cx-10,cx+180,1,g=>(hsh(s+ii*3)>.5?canoa(g,cx,HB-4,120,s+ii):rabeta(g,cx+20,HB-4,s+ii))); }
      add(xx+w,xx+w+90,1,g=>{ R(g,xx+w,HB-44,90,6,MADV[2]); R(g,xx+w,HB-44,90,1,MADV[1]); for(let k=0;k<3;k++) R(g,xx+w+10+k*30,HB-40,4,40,MADV[4]); });
      x+=w+100+Math.round(hsh(s*7+i)*140); i++; }
    chao((g,a,b)=>fTabuas(g,a,b,s,'#9a7a54',HB,true));
    decalMata(X0,X1,s,{cog:false});
    for(const r of [.06,.22,.4,.58,.74,.9]) prop(r,40,(g,x)=>{ paneiro(g,x,HB+60+hsh(r*7)*30,s+r*9); });
    prop(.14,60,(g,x)=>{ R(g,x,HB+70,30,18,'#2a2a2e'); ell(g,x+15,HB+70,15,4,'#3a3a40'); }); prop(.48,100,(g,x)=>rede(g,x,HB+74,s)); prop(.66,60,(g,x)=>caixote(g,x,HB+82,40,s));
    prop(.31,20,(g,x)=>{ R(g,x,HB+40,8,14,'#3a3020'); emitW(g,g=>R(g,x+2,HB+43,4,8,'#ffd070')); glow(g,x+4,HB+47,40,'#ffb050',.09,4); reg(LAMPS,{x:(x+4)/RS,y:(HB+47)/RS,r:14,mid:true}); });
    break; }
  case 'igarape': {
    mata(X0,X1,s,{palms:true,gap:.18});
    band(0,(g,a,b)=>{ rio(g,a,b,HB-40,HB+2,'negro',s); for(let k=Math.floor(a/110);k<b/110+1;k++){ if(hsh(k*3.3+s)>.45) vitoria(g,k*110+hsh(k)*50,HB-16+hsh(k*7)*14,10+hsh(k*5)*10,k); } });
    WATER.push({x0:X0/RS,x1:X1/RS,hz:HB-40});
    at(.42,620,0,(g,x)=>{ const c=rmp('#7a5a40'); for(let t=0;t<600;t+=2){ const y=HB-70+t*.06+Math.sin(t*.01)*6; R(g,x+t,y,2,18,c[2]); R(g,x+t,y,2,4,c[1]); R(g,x+t,y+14,2,4,c[4]); if(lowf(x+t,y,s)>.2) R(g,x+t,y-2,2,3,'#5a8a34'); } for(let k=0;k<5;k++) line(g,x+60+k*120,HB-60,x+50+k*120,HB-10,c[3],3); });
    chao((g,a,b)=>fMata(g,a,b,s,{base:'#4a3a2a',lite:'#7a6a4a'}));
    decalMata(X0,X1,s,{pocas:5,kind:'negra',glow:true});
    for(const r of [.14,.5,.86]){ const x=X0+L*r, y=HB+120+hsh(r*9)*80; add(x-320,x+320,4,g=>{ poca2(g,x,y,560,s+r*7,'negra'); for(let k=0;k<4;k++) vitoria(g,x-180+k*110,y-6+hsh(k+r)*12,10+hsh(k*3)*6,k); }); }
    for(const r of [.04,.27,.63,.96]) prop(r,60,(g,x)=>samambaia(g,x,HB+50,52,s+r*11)); for(const r of [.2,.7]) prop(r,60,(g,x)=>heliconia(g,x,HB+46,s+r));
    prop(.36,120,(g,x)=>troncoCaido(g,x,HB+60,180,26,s)); prop(.8,60,(g,x)=>pedraMusgo(g,x,HB+70,50,s)); prop(.56,40,(g,x)=>{ R(g,x,HB+70,34,20,'#8a6a3a'); for(let k=0;k<34;k+=4) R(g,x+k,HB+70,1,20,'#5a4020'); ell(g,x+17,HB+70,17,4,'#6a5030'); });
    break; }
  case 'terrafirme': {
    mata(X0,X1,s,{bark:'#5a4838',base:'#2f6a30',gap:.06,yC:50,trees:[.05,.2,.36,.52,.68,.84,.97],palms:true});
    for(const r of [.12,.44,.6,.9]) RAYS.push({x:(X0+L*r)/RS,w:14+hsh(r*7)*14});
    chao((g,a,b)=>fMata(g,a,b,s,{base:'#5e4430'}));
    decalMata(X0,X1,s,{glow:true});
    for(const r of [.1,.48,.78]) at(r,80,1,(g,x)=>cupinzeiro(g,x,HB+8,90,s+r*7));
    for(const r of [.03,.18,.33,.58,.73,.88]) prop(r,60,(g,x)=>samambaia(g,x,HB+44+hsh(r*5)*20,48,s+r*11)); for(const r of [.26,.66]) prop(r,60,(g,x)=>heliconia(g,x,HB+44,s+r));
    prop(.4,140,(g,x)=>{ troncoCaido(g,x,HB+70,220,30,s); cogumelos(g,x+60,HB+42,s,'#a6f03a'); cogumelos(g,x+140,HB+44,s+3,'#7af4ff'); }); prop(.94,60,(g,x)=>pedraMusgo(g,x,HB+64,56,s));
    break; }
  case 'samauma': {
    mata(X0,X1,s,{bark:'#5a4838',base:'#2f6a30',gap:.05,yC:50,trees:[.04,.18,.86,.98],sap:true});
    const cx=X0+L*.5; RAYS.push({x:cx/RS-6,w:46,big:true}); RAYS.push({x:(X0+L*.2)/RS,w:12}); RAYS.push({x:(X0+L*.8)/RS,w:14});
    add(cx-1000,cx+1000,1,g=>{ sapopemas(g,cx,HB+10,260,250,'#a89c84',s,8); const T=tronco(g,cx,-20,HB+12,260,'#a89c84',s,{flare:1.6,bend:10}); sapFrente(g,cx,HB+10,260,250,'#a89c84',s,9);
      for(let i=0;i<70;i++){ const y=hsh(s+i)*(HB-20), ww=T.wd(y), px=T.cx(y)-ww/2+ww*(.1+hsh(s*3+i)*.8); poly(g,[[px,y],[px+5,y-3],[px+5,y+3]],'#d0c8b0'); R(g,px,y,2,1,'#706858'); }
      for(let j=0;j<6;j++) cipoV(g,cx-110+j*44,0,180+hsh(s+j)*120,s+j,0); ell(g,cx+50,110,16,22,'#1a1410'); ell(g,cx+50,112,12,18,'#0e0a08'); for(let k=0;k<5;k++) R(g,cx+40+k*5,128,4,2,pick(['#d62d20','#f2c230','#2255c4'],hsh(k+s))); });
    chao((g,a,b)=>fMata(g,a,b,s,{base:'#6a5034'}));
    band(4,(g,a,b)=>{ g.save(); g.globalAlpha=.18; ell(g,cx,HB+130,640,110,'#e8c890'); g.restore(); },cx-700,cx+700);
    decalMata(X0,X1,s,{glow:true});
    for(const r of [.3,.62,.72]) prop(r,60,(g,x)=>{ const c=rmp('#e8e0cc'); for(let k=0;k<5;k++){ R(g,x+k*9,HB+80+hsh(k+r)*10,14,3,c[2]); ell(g,x+k*9,HB+80+hsh(k+r)*10,3,3,c[1]); } ell(g,x+50,HB+84,8,7,c[2]); R(g,x+46,HB+82,3,3,'#1a1410'); });
    for(const r of [.08,.24,.78,.94]) prop(r,60,(g,x)=>samambaia(g,x,HB+48,54,s+r*11));
    break; }
  case 'seringal': {
    mata(X0,X1,s,{gap:.25,yC:60,trees:[.03,.97],sap:false,yTop:-30,gapTop:.4});
    for(let i=0;i<9;i++){ const x=X0+L*(.06+i*.11)+hsh(s+i)*40; if(x>X0+L*.3&&x<X0+L*.45) continue; add(x-60,x+60,1,g=>seringueira(g,x,-10,HB+6,30+hsh(s+i)*12,s+i*7,0)); }
    for(let i=0;i<8;i++){ const x=X0+hsh(s*3+i)*L; add(x-40,x+40,0,g=>seringueira(g,x,40,HB-4,18,s+i*5,.32)); }
    add(X0+L*.3-40,X0+L*.45+80,1,g=>barracao(g,X0+L*.3,L*.15,s));
    at(.56,60,1,(g,x)=>defumador(g,x,HB+8,s)); RAYS.push({x:(X0+L*.64)/RS,w:18}); RAYS.push({x:(X0+L*.16)/RS,w:12});
    chao((g,a,b)=>fMata(g,a,b,s,{base:'#7a5a3a',lite:'#b08a5a'}));
    band(4,(g,a,b)=>{ for(let x=Math.floor(a/2)*2;x<b;x+=2){ const y=HB+110+Math.sin(x*.002+s)*16; R(g,x,y,2,60,'#9a7a50'); R(g,x,y,2,2,'#b8986a'); if(hsh(x*.3)>.9) R(g,x,y+10+hsh(x)*40,4,2,'#6a4a30'); } });
    decalMata(X0,X1,s,{pocas:4,kind:'latex'});
    prop(.48,120,(g,x)=>bolasBorracha(g,x,HB+70,10,s)); prop(.7,120,(g,x)=>bolasBorracha(g,x,HB+64,7,s+3)); for(const r of [.12,.62,.86]) prop(r,90,(g,x)=>tigelas(g,x,HB+80,s));
    for(const r of [.2,.9]) prop(r,40,(g,x)=>{ R(g,x,HB+60,26,30,'#8c9498'); R(g,x,HB+60,26,3,'#f2efe4'); ell(g,x+13,HB+60,13,4,'#f2efe4'); }); for(const r of [.05,.38,.8]) prop(r,60,(g,x)=>samambaia(g,x,HB+44,40,s+r));
    break; }
  case 'garimpo': {
    band(0,(g,a,b)=>{ mataCortada(g,a,b,160,s); cava(g,a,b,X0+L*.5,s); }); WATER.push({x0:(X0+L*.5-150)/RS,x1:(X0+L*.5+150)/RS,hz:HB-22});
    at(.47,500,1,(g,x)=>draga(g,x,HB-12,s));
    for(const r of [.08,.22,.72,.88]) at(r,200,1,(g,x)=>barracoLona(g,x,HB+6,s+r*9));
    for(const r of [.03,.16,.32,.64,.8,.95]) at(r,80,1,(g,x)=>tocoArv(g,x,HB+4,40+hsh(r*7)*20,s+r));
    chao((g,a,b)=>fBarro(g,a,b,s));
    decalMata(X0,X1,s,{pocas:5,kind:'mercurio',cog:false,raiz:'#7a5038'});
    for(const r of [.12,.58]) prop(r,240,(g,x)=>troncoCaido(g,x,HB+76,260,32,s+r));
    for(const r of [.27,.5,.84]) prop(r,60,(g,x)=>{ tambor(g,x,HB+70,'#2a2a2e'); tambor(g,x+34,HB+76,'#c8382a'); }); for(const r of [.2,.4,.68,.92]) prop(r,40,(g,x)=>{ bateia(g,x,HB+96); pa(g,x+30,HB+90); });
    break; }
  case 'igapo': {
    mata(X0,X1,s,{bark:'#6a5a4a',base:'#2f6a30',gap:.15,yC:60,trees:[],sap:false});
    const TR=[]; for(let i=0;i<8;i++) TR.push([X0+L*(.04+i*.13)+hsh(s+i)*80,26+hsh(s*3+i)*30]);
    TR.forEach(([x,w],i)=>{ add(x-w*3,x+w*3,1,g=>{ troncoAgua(g,x,-10,HB+2,w,s+i*7,0); cipoV(g,x+w*.2,60,160,s+i,0); }); add(x-w*2,x+w*2,4,g=>reflexoTronco(g,x,w*1.3,HB,170,s+i)); });
    band(0,(g,a,b)=>{ for(let k=Math.floor(a/60)-1;k<b/60+1;k++){ const v=hsh(k*3.7+s+2); if(v<.4) continue; const x=k*60+v*30; troncoAgua(g,x,60,HB-6,8+v*10,k,.45); } shade(g,a,HB-80,b-a,80,FOG,.28); });
    chao((g,a,b)=>fAguaChao(g,a,b,s,'negroC')); WATER.push({x0:X0/RS,x1:X1/RS,hz:HB+6,chao:true});
    for(const r of [.2,.5,.8]) RAYS.push({x:(X0+L*r)/RS,w:16});
    for(let i=0;i<6;i++){ const x=X0+hsh(s+i*3)*L, y=HB+60+hsh(s*2+i)*170; add(x-60,x+60,4,g=>vitoria(g,x,y,14+hsh(i)*12,s+i)); }
    for(const r of [.15,.45,.75]) prop(r,260,(g,x)=>troncoCaido(g,x,HB+90+hsh(r*3)*60,240,24,s+r));
    prop(.6,160,(g,x)=>canoa(g,x,HB+56,150,s)); for(const r of [.08,.34,.9]) prop(r,80,(g,x)=>aguape(g,x,HB+70,70,s+r));
    break; }
  case 'varzea': {
    const yw=228, cxR=X0+L*.8;
    band(0,(g,a,b)=>{ copa(g,a,b,158,22,'#2a4c30',s,.45,.03,true); R(g,a,166,b-a,yw-166,dep('#1e3624',.42));
      rio(g,a,b,yw,HB,'barro',s); for(let y=yw;y<yw+34;y+=2){ g.save(); g.globalAlpha=.62*(1-(y-yw)/34); R(g,a,y,b-a,2,'#1c2a1a'); g.restore(); } for(let k=Math.floor(a/40);k<b/40+1;k++){ const v=hsh(k*5.9+s); if(v<.5) continue; g.save(); g.globalAlpha=.25; R(g,k*40+v*20,yw+2,3+v*6,26+v*20,'#121a10'); g.restore(); }
      for(let k=Math.floor(a/20)-1;k<b/20+1;k++){ const v=hsh(k*2.9+s); if(v<.3) continue; arvVarzea(g,k*20+v*10,172,yw,3+v*4,k,.42,6); }
      shade(g,a,170,b-a,yw-170,FOG,.1);
      copa(g,a,b,176,30,'#2f5a36',s+7,.22,.3,true);
      for(let k=Math.floor(a/64)-1;k<b/64+1;k++){ const v=hsh(k*4.3+s+1); if(v<.4) continue; arvVarzea(g,k*64+v*36,186,yw+2,8+v*9,k+50,.12,11); }
      for(let k=Math.floor(a/90)-1;k<b/90+1;k++){ const v=hsh(k*7.7+s); if(v<.35) continue; const x=k*90+v*50, y=yw+8+hsh(k*3.1)*50; g.save(); g.globalAlpha=.55; R(g,x,y,50+v*110,1,'#e0d0a8'); R(g,x+20,y+2,30+v*50,1,'#c8b48a'); g.restore(); }
      for(let k=Math.floor(a/150)-1;k<b/150+1;k++){ const v=hsh(k*3.1+s+4); if(v<.45) continue; const x=k*150+v*60, y=yw+12+hsh(k*7)*44; if(v>.75) ilhaCapim(g,x,y,40+v*70,k); else aguape(g,x,y,40+v*50,k); }
      if(cxR>a-200&&cxR<b+200) redemoinho(g,cxR,yw+36,130,s,WPAL.barro.map(c=>mix(c,skyRefl(),.12))); });
    WATER.push({x0:X0/RS,x1:X1/RS,hz:yw});
    for(const r of [.12,.5,.64,.95]) at(r,100,0,(g,x)=>embauba(g,x,yw+4,70+hsh(r*7)*40,s+r*9,.15));
    at(.3,260,1,(g,x)=>{ palafita(g,x,HB-2,220,s,{ruina:true,cor:'#4ab0c8',st:50,escada:false,redes:false});
      for(let i=0;i<9;i++) estaca(g,x-90+i*30+hsh(s+i)*10,HB-2-(i%3)*3,30+hsh(s*2+i)*44,(hsh(s*5+i)-.5)*30,s+i);
      for(let i=0;i<6;i++) estaca(g,x+260+i*34,HB-4,20+hsh(i*3+s)*30,(hsh(i*7+s)-.5)*24,s+i*3);
      const top=HB-2-50-6-86; for(let i=0;i<5;i++){ const hx=x+20+hsh(s*9+i)*180, hy=top+10+hsh(s*4+i)*60; R(g,hx,hy,8+hsh(i)*10,4+hsh(i*3)*10,'#141018'); } R(g,x+150,HB-60,70,8,'#141018'); line(g,x+150,HB-60,x+226,HB-34,MADV[3],3); });
    for(const r of [.05,.58]) at(r,40,1,(g,x)=>{ tronco(g,x,HB-170,HB,10,'#8a8070',s+r*5,{moss:false,flare:.5}); line(g,x,HB-120,x+30,HB-150,'#8a8070',3); line(g,x,HB-90,x-24,HB-110,'#8a8070',2); });
    chao((g,a,b)=>fLama(g,a,b,s));
    add(X0+L*.3,X0+L*.72,4,g=>rastroCobra(g,X0+L*.34,X0+L*.68,HB+170,HB+110,s));
    add(cxR-360,cxR+360,4,g=>remanso(g,cxR,HB+95,310,72,s));
    for(let i=0;i<6;i++){ const x=X0+hsh(s+i*3)*L*.6, y=HB+50+hsh(s*2+i)*170; add(x-120,x+120,4,g=>poca2(g,x,y,80+hsh(i)*120,s+i,'barro')); }
    for(let i=0;i<6;i++){ const x=cxR-330+hsh(s*4+i)*660, y=HB+30+hsh(s*6+i)*130; add(x-60,x+120,4,g=>aguape(g,x,y,50+hsh(i)*60,s+i)); }
    for(const r of [.1,.44]) prop(r,260,(g,x)=>troncoCaido(g,x,HB+150+hsh(r*3)*50,220,20,s+r));
    break; }
  }
}

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
    for(const [k,fn,T] of q) if(k===0){ L.save(); if(T) L.setTransform(T); fn(L); L.restore(); }
    g.setTransform(1,0,0,1,0,0); g.drawImage(LAY.c,0,0); g.translate(-tx,0);
    for(const [k,fn,T] of q) if(k===1&&lt!=='dia'){ g.save(); if(T) g.setTransform(T); fn(g); g.restore(); } RL='noite'; }}; }
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
function posteFG(g,x){ const ir=rmp('#3e3656'), H0=HH; R(g,x-15,H0-60,30,60,ir[5]); R(g,x-14,H0-59,28,59,ir[2]); R(g,x-14,H0-59,6,59,ir[1]); R(g,x+8,H0-59,6,59,ir[4]); for(const yy of [H0-60,H0-30]){ R(g,x-18,yy,36,6,ir[2]); R(g,x-18,yy,36,1,ir[0]); R(g,x-18,yy+5,36,1,ir[5]); }
  R(g,x-7,90,14,H0-150,ir[5]); R(g,x-6,90,12,H0-150,ir[2]); R(g,x-6,90,3,H0-150,ir[1]); R(g,x+3,90,3,H0-150,ir[4]); for(let k=x-3;k<x+3;k+=3) R(g,k,96,1,H0-160,ir[3]);
  for(const yy of [140,H0-110]){ R(g,x-10,yy,20,8,ir[2]); R(g,x-10,yy,20,2,ir[0]); ell(g,x,yy+12,9,4,ir[3]); }
  R(g,x-16,80,32,6,ir[2]); R(g,x-16,80,32,1,ir[0]); for(const sx of [-1,1]){ line(g,x,96,x+sx*24,84,ir[3],3); ell(g,x+sx*14,100,6,5,ir[4]); }
  poly(g,[[x-14,40],[x+14,40],[x+11,78],[x-11,78]],ir[5]); poly(g,[[x-11,42],[x+11,42],[x+9,76],[x-9,76]],'#ffe6a0'); R(g,x-5,46,4,28,'#fffbe8'); R(g,x-1,42,2,34,ir[3]);
  poly(g,[[x-18,40],[x,22],[x+18,40]],ir[4]); poly(g,[[x-16,39],[x,24],[x,39]],ir[2]); R(g,x-2,12,4,12,ir[3]); ell(g,x,12,4,4,ir[2]); R(g,x-13,77,26,4,ir[2]); }
function drawFG(g,cam){ const T=g.getTransform(); g.save(); g.setTransform(1,0,0,1,T.e,T.f); g.imageSmoothingEnabled=false;
  for(const it of FGI){ const sx=Math.round((it.x-cam)*1.25*RS); if(sx<-260||sx>HW+260) continue; const sp=fgSprite(it.t); g.drawImage(sp.c,sx-sp.w/2,0); } g.restore(); }

/* =====================================================================
   PRIMEIRO PLANO (parallax 1.25) — mata em silhueta: troncos, folhas gigantes, cipós, sapopemas
   ===================================================================== */
const SILA='#08100c', SILB='#16241c', RIMV='#4a6a5a', RIMC='#5a4a8e';
function silFill(g,y0,y1,w){ for(let y=y0;y<y1;y+=2){ g.fillStyle=mix(SILB,SILA,Math.min(1,Math.max(0,(y-y0)/(y1-y0)*1.4))); g.fillRect(0,y,w,2); } }
function fgClip(g,w,path,y0,y1){ g.save(); g.beginPath(); path(g); g.clip(); silFill(g,y0,y1,w); g.restore(); }
function fgTronco(g,w){ const x=w/2, tw=86; fgClip(g,w,G=>{ for(let y=0;y<HH;y+=4){ const ww=tw+Math.pow(y/HH,6)*120, xx=x+Math.sin(y*.006)*10; G.rect(xx-ww/2,y,ww,4); } },0,HH);
  for(let y=0;y<HH;y+=2){ const ww=tw+Math.pow(y/HH,6)*120, xx=x+Math.sin(y*.006)*10; R(g,xx-ww/2,y,2,2,RIMV); if(lowf(x,y,7)>.3) R(g,xx-ww/2+2,y,6,2,'#24382a'); if(hsh(y*.37)>.93) R(g,xx-ww/2+10+hsh(y)*ww*.6,y,1,8,'#1e2e24'); }
  for(let k=0;k<3;k++){ const vx=x-20+k*22; for(let y=60+k*30;y<300+k*40;y+=2){ R(g,vx+Math.sin(y*.04+k)*3,y,3,2,'#0e1a12'); if((y>>1)%9===0) folha(g,vx,y,k%2?.4:2.7,12,'#14241a','#1e3426'); } } }
function fgFolhas(g,w){ const leaves=[[w*.3,HH,170,-1.95],[w*.55,HH,190,-1.25],[w*.2,HH,140,-2.5],[w*.72,HH,150,-.8],[w*.45,HH,120,-1.6]];
  for(const [x,y,len,a] of leaves){ const ca=Math.cos(a), sa=Math.sin(a), nx=-sa, ny=ca; for(let t=0;t<1;t+=.01){ const px=x+ca*len*t, py=y+sa*len*t+t*t*len*.25, wd=Math.sin(t*Math.PI)*len*.2;
      line(g,px+nx*wd,py+ny*wd,px-nx*wd,py-ny*wd,mix(SILB,SILA,.3+t*.4),2); }
    for(let t=0;t<1;t+=.01){ const px=x+ca*len*t, py=y+sa*len*t+t*t*len*.25; R(g,px,py,2,2,'#1e3024'); const wd=Math.sin(t*Math.PI)*len*.2; R(g,px-nx*wd,py-ny*wd,2,1,RIMV); if(((t*100)|0)%7===0){ line(g,px,py,px+nx*wd*.9,py+ny*wd*.9+4,'#0c160f'); } } } }
function fgCabeco(g,w){ const x=w/2; fgClip(g,w,G=>{ G.rect(x-26,HH-70,52,70); G.ellipse(x,HH-70,36,12,0,0,Math.PI*2); },HH-90,HH); R(g,x-36,HH-72,2,6,RIMC); for(let k=0;k<4;k++) sag(g,x-30,HH-56+k*8,x+30,HH-54+k*8,4,'#1a1a24',3); sag(g,x+20,HH-50,w,HH-120,30,'#141420',3); }
function fgCipo(g,w){
  for(let k=0;k<5;k++){ const vx=20+k*(w-40)/4, len=160+hsh(k*7.7)*200; for(let y=40;y<len;y+=2){ R(g,vx+Math.sin(y*.03+k)*5,y,3,2,SILA); if((y>>1)%7===0) folha(g,vx+Math.sin(y*.03+k)*5,y,(y>>1)%14?.5:2.6,14,'#0e1a12','#1a2a20'); } for(let j=0;j<6;j++) folha(g,vx,len,1.2+j*.15,16,'#0e1a12','#1a2a20'); }
  for(let i=0;i<40;i++){ const a=hsh(i*1.3)*Math.PI, x=hsh(i*2.9)*w, y=60+hsh(i*4.1)*60; folha(g,x,y,a,12+hsh(i)*12,SILA,SILB); } }
function fgRaiz(g,w){ fgClip(g,w,G=>{ G.moveTo(w*.5-30,HH-170); G.quadraticCurveTo(w*.6,HH-40,w,HH); G.lineTo(0,HH); G.quadraticCurveTo(w*.4,HH-40,w*.5-30,HH-170); G.closePath(); },HH-180,HH);
  for(let t=0;t<1;t+=.01){ const x=w*.5-30+(w*.5+30)*t, y=HH-170+170*Math.pow(t,.5); R(g,x,y,2,2,RIMV); } }
function fgSamambaia(g,w){ for(let k=0;k<9;k++){ const a=-Math.PI/2+(k-4)*.32, len=140+hsh(k*3)*60, x=w/2, y=HH;
  for(let r=0;r<len;r+=2){ const px=x+Math.cos(a)*r, py=y+Math.sin(a)*r+r*r/len*.8; R(g,px,py,3,3,SILA); if(r>4){ const L=(1-r/len)*30+3; line(g,px,py,px+Math.cos(a-1.3)*L,py+Math.sin(a-1.3)*L,SILB,2); line(g,px,py,px+Math.cos(a+1.3)*L,py+Math.sin(a+1.3)*L,SILA,2); if(r%6===0) R(g,px+Math.cos(a-1.3)*L,py+Math.sin(a-1.3)*L,2,1,RIMV); } } } }
function fgPalmeira(g,x){ const tr=rmp('#7a6a58'), lf=rmp('#2e6a3e'), H0=HH;
  for(let y=60;y<H0;y+=2){ const xx=x+Math.round(Math.sin(y/110)*10), w=Math.round(14+(y-60)/H0*8); R(g,xx-w/2-1,y,w+2,2,tr[5]); R(g,xx-w/2,y,w,2,tr[2]); R(g,xx-w/2,y,Math.round(w*.3),2,tr[1]); R(g,xx+Math.round(w*.15),y,Math.round(w*.35),2,tr[3]); if(y%14===0) R(g,xx-w/2,y,w,2,tr[4]); }
  for(let k=0;k<11;k++){ const a=-Math.PI+k*(Math.PI/10)+(hsh(k)-.5)*.2, len=110+hsh(k*3)*40;
    for(let r=0;r<len;r+=2){ const px=x+Math.cos(a)*r, py=50+Math.sin(a)*r*.55+r*r/220; R(g,px-1,py-1,4,4,lf[5]); for(const side of [-1,1]){ const L=Math.max(0,(1-r/len)*20); line(g,px,py+1,px+side*3+Math.cos(a+side*1.2)*L*.4,py+L,(r/2)%3?lf[2]:lf[1]); } R(g,px,py,2,2,lf[1]); } }
  for(let k=0;k<6;k++) ell(g,x-12+k*5,74,4,5,'#3a1a3a'); }
function fgPlaca(g,w){ R(g,w/2-3,60,6,HH-60,SILA); R(g,w/2-3,60,1,HH-60,RIMC); R(g,w/2-50,70,100,28,'#1a3a2a'); R(g,w/2-50,70,100,2,'#4a7a5a'); R(g,w/2-48,72,96,24,'#1e4430');
  for(let i=0;i<8;i++) R(g,w/2-40+i*10,80,6+hsh(i)*3,1+((i%3)?6:3),'#b8d0c0'); R(g,w/2-6,HH-20,12,20,SILA); } // placa de rua com letreiro ilegível (MAP-09)
function fgBarril(g,w){ const x=w/2-34; g.save(); g.beginPath(); g.rect(x,HH-110,68,110); g.clip(); silFill(g,HH-110,HH,w); g.restore(); for(const y of [HH-90,HH-40]) R(g,x,y,68,4,'#1e2a2a'); R(g,x,HH-110,2,110,RIMC); }
function fgSprite(t){ if(fgCache[t]) return fgCache[t]; let w=80, c, g;
  const mkS=(ww,fn)=>{ w=ww; [c,g]=mk(w,HH); fn(g,w); return fgCache[t]={c,w}; };
  if(t==='tronco') return mkS(240,fgTronco); if(t==='folhas') return mkS(320,fgFolhas); if(t==='cipo') return mkS(300,fgCipo); if(t==='raiz') return mkS(300,fgRaiz);
  if(t==='samambaia') return mkS(300,fgSamambaia); if(t==='placa') return mkS(160,fgPlaca); if(t==='cabeco') return mkS(200,fgCabeco);
  if(t==='palm') return mkS(320,(g,w)=>fgPalmeira(g,w/2));
  return mkS(80,(g,w)=>posteFG(g,w/2)); }
const fgCache={};

/* =====================================================================
   CÉU E FUNDO DISTANTE (parallax): margem do rio com Manaus nas áreas da cidade, copa da floresta nas áreas de mata
   ===================================================================== */
const skyCache={};
function sol(g,P,mx,my,mr){ const S=P.moon; ell(g,mx,my,mr+3,mr+3,S[3]); ell(g,mx,my,mr,mr,S[2]); ell(g,mx-mr*.08,my-mr*.08,mr*.84,mr*.84,S[1]); ell(g,mx-mr*.2,my-mr*.2,mr*.5,mr*.5,S[0]);
  for(let k=0;k<16;k++){ const a=k/16*Math.PI*2, r0=mr+8+(k%2)*4, r1=r0+6+(k%3)*4; for(let r=r0;r<r1;r+=2) R(g,Math.round(mx+Math.cos(a)*r),Math.round(my+Math.sin(a)*r),2,2,k%2?S[2]:S[1]); } }
function skyCanvas(mode){ if(skyCache[mode]) return skyCache[mode]; const P=SKYP[mode], [c,g]=mk(HW,HB+20), n=P.g.length, bh=(HB+20)/n;
  for(let i=0;i<n;i++){ R(g,0,i*bh,HW,bh+1,P.g[i]); if(i<n-1){ g.fillStyle=P.g[i+1]; for(let y=Math.round((i+1)*bh)-4;y<Math.round((i+1)*bh);y++) for(let x=(y%2)*2;x<HW;x+=(y%4<2?4:2)) g.fillRect(x,y,2,1); } }
  const NS=P.ns??(P.star?220:0); for(let i=0;i<NS;i++){ const x=Math.floor(hsh(i*3.1)*HW), y=Math.floor(Math.pow(hsh(i*7.3),1.6)*230), v=hsh(i*1.9); g.fillStyle=v>.85?'#ffffff':v>.5?P.star:mix(P.star,P.g[3],.5); g.fillRect(x,y,v>.7?2:1,v>.7?2:1);
    if(v>.95){ g.fillRect(x-2,y,6,1); g.fillRect(x,y-2,1,6); } }
  if(P.star&&mode==='noite'){ g.save(); for(let i=0;i<120;i++){ const t=hsh(i*1.7), x=t*HW, y=40+t*120+Math.sin(t*9)*20+(hsh(i*3.3)-.5)*40; g.globalAlpha=.05; ell(g,x,y,20+hsh(i)*30,6+hsh(i*5)*8,'#8a9ad8'); } g.restore(); } // via láctea rala
  for(let i=0;i<10;i++){ const cx=hsh(i*5.1)*HW, cy=30+hsh(i*2.7)*150; g.save(); g.globalAlpha=.05; ell(g,cx,cy,120+hsh(i)*120,30+hsh(i*3)*30,P.cloud[3]); g.restore(); }
  const mx=P.mx, my=P.my, mr=P.mr; g.save(); g.globalCompositeOperation='lighter'; for(let k=6;k>=1;k--){ g.globalAlpha=P.sol?.06:.035; ell(g,mx,my,mr*(1+k*(P.sol?.7:.45)),mr*(1+k*(P.sol?.7:.45)),P.glow); } g.restore();
  if(P.sol){ sol(g,P,mx,my,mr); return skyCache[mode]=c; }
  ell(g,mx,my,mr,mr,P.moon[1]); ell(g,mx-mr*.15,my-mr*.15,mr*.82,mr*.82,P.moon[0]); for(let dy=-mr;dy<=mr;dy++){ const hw=Math.sqrt(mr*mr-dy*dy); R(g,mx+hw*.55,my+dy,hw*.45,1,P.moon[2]); R(g,mx+hw*.85,my+dy,hw*.15,1,P.moon[3]); }
  [[-.3,-.25,.34,.2],[.05,.1,.22,.3],[-.45,.3,.16,.12],[.35,-.3,.12,.1]].forEach(([dx,dy,rx,ry])=>{ ell(g,mx+dx*mr,my+dy*mr,rx*mr,ry*mr+2,P.moon[2]); ell(g,mx+dx*mr+rx*mr*.2,my+dy*mr+1,rx*mr*.6,ry*mr*.6+1,mix(P.moon[2],P.moon[3],.5)); });
  return skyCache[mode]=c; }
const stripCache={};
function cloudStrip(mode){ const k='c'+mode; if(stripCache[k]) return stripCache[k]; const P=SKYP[mode], W0=2400, [c,g]=mk(W0,HB);
  for(let i=0;i<14;i++){ const cx=hsh(i*4.3)*W0, cy=40+hsh(i*7.1)*120, w=160+hsh(i*2.2)*260, h=16+hsh(i*3.9)*26; for(const off of [0,-W0,W0]){ const x=cx+off; // cúmulos amazônicos: torres altas
    ell(g,x,cy,w*.5,h,P.cloud[0]); ell(g,x-w*.15,cy-h*.7,w*.3,h*1.1,P.cloud[0]); ell(g,x+w*.18,cy-h*.5,w*.25,h,P.cloud[0]); ell(g,x,cy-h*1.4,w*.2,h*.9,P.cloud[0]); R(g,x-w*.5,cy+h*.4,w,h*.6,P.cloud[0]);
    ell(g,x-w*.15,cy-h*1.1,w*.24,h*.6,P.cloud[1]); ell(g,x+w*.18,cy-h*.8,w*.18,h*.5,P.cloud[1]); ell(g,x-w*.02,cy-h*1.7,w*.14,h*.5,P.cloud[2]); R(g,x-w*.32,cy-h*1.45,w*.3,2,P.cloud[2]); R(g,x+w*.05,cy-h*1.2,w*.24,2,P.cloud[2]);
    ell(g,x+w*.05,cy+h*.2,w*.42,h*.4,P.cloud[3]===P.cloud[0]?P.cloud[0]:mix(P.cloud[0],P.g[4],.35)); g.clearRect(x-w*.6,cy+h,w*1.2,h*2); } }
  return stripCache[k]=c; }
function strip(g,cv,off,y){ const w=cv.width, o=((Math.round(off)%w)+w)%w; g.drawImage(cv,-o,y); if(w-o<HW) g.drawImage(cv,w-o,y); }
function crowns(g,W0,hz,n,rMin,rMax,lift,cc,s,gapP){ const L=[]; for(let i=0;i<n;i++){ const x=hsh(i*3.3+s)*W0, r=rMin+hsh(i*7.1+s)*(rMax-rMin), em=hsh(i*1.9+s)>.86; if(gapP&&hsh(Math.floor(x/400)*5.7+s)<gapP) continue; L.push([x,hz-lift*hsh(i*5.3+s)-(em?r*1.2:0)-r*.4,em?r*1.4:r]); }
  L.sort((p,q)=>p[1]-q[1]);
  for(const [x,y,r] of L) for(const o of [0,W0,-W0]){ const X=x+o; if(X<-r*2||X>W0+r*2) continue; R(g,X-r*.9,y,r*1.8,hz-y+40,cc[3]); ell(g,X,y,r,r*.72,cc[3]); ell(g,X-r*.18,y-r*.16,r*.72,r*.48,cc[2]); ell(g,X-r*.34,y-r*.3,r*.34,r*.22,cc[1]);
    for(let k=0;k<6;k++){ const a=Math.PI+k/5*Math.PI, px=X+Math.cos(a)*r*.9, py=y+Math.sin(a)*r*.65; ell(g,px,py,r*.22,r*.16,k<3?cc[2]:cc[3]); } } }
function farStrip(mode,lvl,zone){ const k='f'+lvl+zone+mode; if(stripCache[k]) return stripCache[k]; const P=SKYP[mode], W0=lvl===1?2880:2400, [c,g]=mk(W0,HB);
  const col=lvl===1?P.f1:P.f2, wc=lvl===1?P.f1w:P.f2w, cc=rmp(col);
  if(zone==='rio'){ const bc=rmp(mix(col,'#8a96ac',.5)), hz=161;
    if(lvl===2){ crowns(g,W0,hz,300,4,9,4,cc,1,0); R(g,0,hz-3,W0,6,cc[3]); }
    else { for(let i=0;i<W0/22;i++){ const x=i*22+hsh(i*3.1)*8; if(hsh(Math.floor(x/500)*2.1)<.35) continue; const w=8+hsh(i*5.3)*12, h=10+Math.pow(hsh(i*2.9),1.5)*42; R(g,x,hz-4-h,w,h,bc[2]); R(g,x,hz-4-h,w,1,bc[1]); R(g,x+w-2,hz-4-h,2,h,bc[3]);
        if(wc) for(let yy=hz-h;yy<hz-6;yy+=4) for(let xx=x+2;xx<x+w-2;xx+=3) if(hsh(xx*1.3+yy*.7)>.8){ g.fillStyle=wc; g.fillRect(xx,yy,1,2); } } }
    return stripCache[k]=c; }
  if(zone==='cidade'){
    const bc=rmp(mix(col,'#8a96ac',.42));
    if(lvl===1){ const hz=HZC+2; crowns(g,W0,hz,260,6,14,8,cc,1,0); R(g,0,hz-4,W0,8,cc[3]);
      for(let i=0;i<W0/26;i++){ const x=i*26+hsh(i*3.1)*10; if(x<700||x>1700) continue; const w=10+hsh(i*5.3)*16, h=20+Math.pow(hsh(i*2.9),1.3)*80; R(g,x,hz-h,w,h,bc[2]); R(g,x,hz-h,w,1,bc[1]); R(g,x+w-3,hz-h,3,h,bc[3]);
        if(wc) for(let yy=hz-h+4;yy<hz-4;yy+=5) for(let xx=x+2;xx<x+w-3;xx+=4) if(hsh(xx*1.3+yy*.7)>.8){ g.fillStyle=wc; g.fillRect(xx,yy,2,2); } } }
    else { const hz=HZC+4; for(let i=0;i<W0/40;i++){ const x=i*40+hsh(i*3.1)*16; if(hsh(Math.floor(x/600)*2.1)<.5) continue; const w=18+hsh(i*5.3)*26, h=50+Math.pow(hsh(i*2.9),1.4)*130; R(g,x,hz-h,w,h,bc[2]); R(g,x,hz-h,w,1,bc[1]); R(g,x+w-4,hz-h,4,h,bc[3]);
        for(let yy=hz-h+5;yy<hz-4;yy+=6) for(let xx=x+3;xx<x+w-4;xx+=5){ g.fillStyle=wc&&hsh(xx*1.3+yy*.7)>.82?wc:bc[3]; g.fillRect(xx,yy,2,3); } if(hsh(i*7.7)>.85){ R(g,x+w/2,hz-h-14,2,14,cc[2]); g.fillStyle='#ff4a3a'; g.fillRect(x+w/2,hz-h-15,2,2); } } }
  } else { const hz=252;
    if(lvl===1){ crowns(g,W0,hz,240,10,24,24,cc,3,0); R(g,0,hz-6,W0,40,cc[3]); }
    else crowns(g,W0,hz+10,120,24,46,70,cc,9,.3); }
  return stripCache[k]=c; }
const STORM={manha:['#4a5868','#5e6c7c','#8a96a4'],tarde:['#3e4656','#565e6e','#a89a90'],anoitecer:['#3a2a3c','#5a3a48','#c8704a'],noite:['#0c0e18','#181c2c','#2e3450'],lua:['#2a0a12','#4a1218','#a03a2a']};
function stormStrip(mode){ const k='st'+mode; if(stripCache[k]) return stripCache[k]; const C=STORM[mode]||STORM.noite, W0=2400, [c,g]=mk(W0,HB), Cm=mix(C[0],C[1],.45);
  // teto de tempestade: massa contínua; bordas iluminadas só como crescentes finos no alto de cada bojo; franja irregular embaixo; chuva ao longe
  R(g,0,0,W0,110,C[0]);
  const B=[]; for(let i=0;i<46;i++) B.push([hsh(i*3.3+1)*W0,40+hsh(i*5.1)*90,50+hsh(i*7.7)*90]); B.sort((p,q)=>p[1]-q[1]);
  for(const [x,y,r] of B) for(const off of [0,-W0,W0]){ const X=x+off; if(X<-r*2||X>W0+r*2) continue; const lit=hsh(x*.01+y)>.45;
    ell(g,X,y,r,r*.36,lit?Cm:C[0]); if(lit){ ell(g,X+r*.06,y+3,r*.97,r*.34,C[0]); R(g,X-r*.35,y-r*.36+1,r*.4,1,C[2]); } }
  for(let i=0;i<W0/10;i++){ const x=i*10, h=4+Math.abs(Math.sin(i*.37)+Math.sin(i*.13))*12+hsh(i)*6; R(g,x,130,10,h,C[0]); }
  g.globalAlpha=.28; for(let i=0;i<10;i++){ const x0=hsh(i*9.1)*W0, ww=50+hsh(i*4.4)*110; for(let kk=0;kk<ww;kk+=3) line(g,x0+kk,140+hsh(kk+i)*10,x0+kk-14,HB-70,C[1]); } g.globalAlpha=1;
  return stripCache[k]=c; }
const stormW=cam=>{ const A=AID.varzea; return A?Math.max(0,Math.min(1,(cam+W-A.x0)/(W*.8))):0; };
const scratch={};
const zoneAt=cam=>{ const A=AREAS.find(a=>cam+W/2>=a.x0&&cam+W/2<a.x1)||AREAS[0]; return A.id==='encontro'?'rio':A.n<=4?'cidade':'mata'; };
function drawSky(g,mode,cam,t){ if(!built) build(); const P=SKYP[mode]||SKYP.noite; mode=SKYP[mode]?mode:'noite'; const T=g.getTransform(), zn=zoneAt(cam);
  g.save(); g.setTransform(1,0,0,1,T.e,T.f); g.imageSmoothingEnabled=false; R(g,0,0,HW,HH,P.g[P.g.length-1]);
  g.drawImage(skyCanvas(mode),0,0); const wv=stormW(cam); if(wv<1){ g.globalAlpha=1-wv; strip(g,cloudStrip(mode),cam*RS*.03+(t||0)*3,0); g.globalAlpha=1; }
  if(wv>0){ const C=STORM[mode]||STORM.noite; g.fillStyle=C[0]; for(let i=0;i<6;i++){ g.globalAlpha=wv*(.75-i*.05); g.fillRect(0,Math.floor(i*HB/6),HW,Math.ceil(HB/6)+1); } g.globalAlpha=wv; strip(g,stormStrip(mode),cam*RS*.05+(t||0)*5,0); g.globalAlpha=1; }
  strip(g,farStrip(mode,1,zn),cam*RS*.08,0); strip(g,farStrip(mode,2,zn),cam*RS*.2,0);
  g.restore();
  if(!engineDM){ if(!scratch.c){ [scratch.c,scratch.g]=mk(HW,HH); } const S=scratch.g; S.setTransform(1,0,0,1,0,0); S.clearRect(0,0,HW,HH);
    fromSky=true; drawMid(S,cam); fromSky=false; S.globalCompositeOperation='source-atop'; S.fillStyle=TINT[mode]; S.fillRect(0,0,HW,HH); S.globalCompositeOperation='source-over';
    g.save(); g.setTransform(1,0,0,1,T.e,T.f); g.drawImage(scratch.c,0,0); g.restore(); }
}

const haloCache={};
function halo(col){ if(haloCache[col]) return haloCache[col]; const [c,g]=mk(128,128); for(let i=0;i<8;i++){ const r=64*(1-i/8); g.globalAlpha=.06+i*.012; ell(g,64,64,r,r,col); } return haloCache[col]=c; }
const RAYC={manha:'#ffe0a0',tarde:'#fff2cc',anoitecer:'#ff9a5a',noite:'#a8c8f0',lua:'#ff5a4a'}, RAYA={manha:.07,tarde:.05,anoitecer:.05,noite:.03,lua:.05};
function drawLights(g,cam,mode,t){ const T=g.getTransform(); g.save(); g.setTransform(1,0,0,1,T.e,T.f); g.globalCompositeOperation='lighter'; g.imageSmoothingEnabled=false; const tt=t||0;
  // feixes de luz pela copa (god rays): faixas inclinadas em degraus de alfa
  g.fillStyle=RAYC[mode]||'#ffffff';
  for(const Ry of RAYS){ const sx=(Ry.x-cam)*RS; if(sx<-400||sx>HW+300) continue; const ww=Ry.w*RS, sk=Ry.big?60:110, yb=Ry.big?HH-40:HB+120, br=1+Math.sin(tt*.6+Ry.x)*.12;
    for(let k=0;k<4;k++){ const f=1-k*.25; g.globalAlpha=(RAYA[mode]||.04)*br*(Ry.big?1.5:1); g.beginPath(); g.moveTo(sx+ww*(1-f)/2,0); g.lineTo(sx+ww*(1+f)/2,0); g.lineTo(sx+sk+ww*(1+f)/2*1.6,yb); g.lineTo(sx+sk+ww*(1-f)/2*1.6,yb); g.closePath(); g.fill(); }
    if(mode==='manha'||mode==='tarde'){ for(let i=0;i<8;i++){ const px=sx+20+hsh(i*3.1+Ry.x)*ww+((tt*8+i*30)%120)*.5, py=40+((tt*10+i*47)%(yb-60)); g.globalAlpha=.35; g.fillRect(Math.round(px),Math.round(py),2,2); } } }
  g.globalAlpha=1;
  if(mode!=='manha'&&mode!=='tarde'){ if(mode==='anoitecer') g.globalAlpha=.7;
    const warm=mode==='lua'?'#ff7a4a':'#ffc070', fl=1+Math.sin(tt*9)*.03;
    for(const L of LAMPS){ let sx, sy=L.y*RS; if(L.fx!=null) sx=(L.fx-cam*1.25)*RS; else sx=(L.x-cam)*RS; if(sx<-200||sx>HW+200) continue; const r=(L.r||24)*RS*fl*(1+Math.sin(tt*7+L.x)*.04); g.drawImage(halo(warm),sx-r,sy-r,r*2,r*2); }
    for(const B of BULBS){ const sx=(B.x-cam)*RS; if(sx<-30||sx>HW+30) continue; g.drawImage(halo(B.c||warm),sx-18,B.y*RS-18,36,36); }
    for(const N of NEON){ const sx=(N.x-cam)*RS; if(sx<-200||sx>HW+200) continue; const r=N.w*RS*.8; g.drawImage(halo(N.c),sx-r,N.y*RS-r*.5,r*2,r); }
    // vagalumes (brasas na Lua de Sangue)
    const fc=mode==='lua'?'#ff6a3a':'#d8ff7a';
    for(const F of FIRE){ const a=Math.max(F.x0,cam-10), b=Math.min(F.x1,cam+W+10); if(b<=a) continue;
      for(let wx=Math.floor(a/9)*9;wx<b;wx+=9){ const v=hsh(wx*.37); if(v<.55) continue; const ph=Math.sin(tt*(1.5+v*2)+v*30); if(ph<0) continue;
        const px=(wx-cam)*RS+Math.sin(tt*.7+v*20)*14, py=160+hsh(wx*.71)*300+Math.cos(tt*.5+v*12)*10; g.globalAlpha=ph*.85; g.fillStyle=fc; g.fillRect(Math.round(px),Math.round(py),2,2); g.globalAlpha=ph*.5; g.drawImage(halo(fc),px-8,py-8,18,18); } }
    g.globalAlpha=1; }
  // brilho do rio (e rio vinho na Lua de Sangue)
  if(WATER.length){ for(const Wt of WATER){ const a=Math.max(Wt.x0,cam), b=Math.min(Wt.x1,cam+W); if(b<=a) continue; const hz=Wt.hz, yEnd=Wt.chao?HH:HB;
      if(mode==='lua'&&!Wt.enc){ g.globalAlpha=Wt.chao?.12:.18; g.fillStyle='#a01020'; g.fillRect(Math.round((a-cam)*RS),hz+2,Math.round((b-a)*RS),yEnd-hz-2); }
      g.fillStyle=mode==='lua'?'#ff6a4a':mode==='manha'||mode==='tarde'?'#f4f8ff':mode==='anoitecer'?'#ffb070':'#9ab0e8';
      for(let wx=Math.floor(a/19)*19;wx<b;wx+=19){ const v=hsh(wx*.13+hz); if(v<.45) continue; const ph=Math.sin(tt*2.2+v*40); if(ph<.25) continue; g.globalAlpha=ph*(mode==='manha'||mode==='tarde'?.3:.4); g.fillRect(Math.round((wx-cam)*RS+Math.sin(tt*.8+v*9)*5),Math.round(hz+6+v*(yEnd-hz-14)),Math.round(5+v*14),1); }
      const PM=SKYP[mode]; if(PM&&!Wt.chao){ const ax=(a-cam)*RS, bx=(b-cam)*RS, mxs=PM.mx; if(mxs>ax+10&&mxs<bx-10){ g.fillStyle=mode==='lua'?'#ff7a5a':PM.sol?'#fff0c0':'#e8e4c8';
          for(let y=hz+3;y<yEnd-4;y+=2){ const v=hsh(y*1.7), ph=Math.sin(tt*2+y*.3), ww=(8+v*22)*(.6+(y-hz)/(yEnd-hz)*.6); g.globalAlpha=Math.max(0,.2+.14*ph); g.fillRect(Math.round(mxs-ww/2+Math.sin(tt*.9+y*.21)*4),y,Math.round(ww),1); } } }
      g.globalAlpha=1; } }
  { const wv=stormW(cam); if(wv>0&&mode!=='manha'&&mode!=='tarde'){ const k=Math.floor(tt*3); if(hsh(k*.77)>.96){ g.globalAlpha=.1*wv; g.fillStyle=mode==='lua'?'#ffb0a0':'#c8d4ff'; g.fillRect(0,0,HW,HB); } } g.globalAlpha=1; }
  if(mode==='lua'){ g.globalCompositeOperation='source-over'; g.globalAlpha=.1; g.fillStyle='#ff5a6a'; for(let i=0;i<3;i++){ const y=HB+20+i*40+Math.sin(tt*.4+i)*6; g.fillRect(0,y,HW,26); } } // névoa rosada baixa
  g.restore(); }

const SKYP={manha:{g:['#5aa6d0','#66aed4','#74b6d8','#82bedc','#90c6de','#a0cee0','#b2d4e0','#c6dade','#dcdcd8','#ecdcd0'],star:null,sol:true,moon:['#fffff4','#fff6d0','#ffe9a6','#f2d27e'],mr:24,mx:170,my:150,glow:'#fff2c4',cloud:['#d2dceb','#e6eef6','#f8fafc','#ffffff'],f1:'#6a9a8a',f1w:null,f2:'#4e806e',f2w:null},
  tarde:{g:['#2a86c8','#3490cc','#409ad0','#4ea4d4','#5cacd6','#6eb6d8','#84c0da','#9ccadc','#b8d6de','#d0e2e0'],star:null,sol:true,moon:['#fffff2','#fff8d4','#ffeca4','#f8d872'],mr:24,mx:780,my:58,glow:'#fff4ca',cloud:['#d8dee8','#eef2f6','#fcfdfe','#ffffff'],f1:'#4e8a6a',f1w:null,f2:'#3a7456',f2w:null},
  anoitecer:{g:['#2a1a50','#3a2260','#4a2a66','#6a3270','#8a3e74','#b04c74','#d85a7a','#e8706a','#f08a3a','#f6a84a'],star:'#f0d8ff',ns:50,sol:true,moon:['#fff2c4','#ffc274','#ff9254','#e86a3a'],mr:44,mx:690,my:250,glow:'#ff8a4a',cloud:['#4a2050','#7a3060','#ffb070','#c86070'],f1:'#3a2a50',f1w:'#ffc070',f2:'#2a1e3e',f2w:'#ffb060'},
  noite:{g:['#060a18','#081020','#0c1428','#0e182e','#121c34','#16203a','#1a2640','#1e2c44','#243248','#2a384c'],star:'#e0e8ff',ns:200,moon:['#fbfdff','#e4ecf8','#bcc8dc','#94a0b8'],mr:28,mx:680,my:70,glow:'#8aa8ff',cloud:['#121a2e','#1a2438','#283248','#3a4460'],f1:'#0e1c22',f1w:'#f0c080',f2:'#0a161a',f2w:'#f8c070'},
  lua:{g:['#14040a','#1e060e','#2a0a18','#360c1a','#44101e','#521420','#621822','#7a1a22','#8a2226','#9a2c2a'],star:'#ffd0c8',moon:['#ffa47a','#ff5a4a','#c4342a','#86181a'],mr:66,mx:690,my:120,glow:'#ff4a3a',cloud:['#2a0610','#40101a','#5c1822','#82282c'],f1:'#2a0814',f1w:'#ff8a5a',f2:'#200610',f2w:'#ffa060'}};

/* =====================================================================
   BUILD
   ===================================================================== */
function build(){
  WINDOWS.length=0; LAMPS.length=0; BULBS.length=0; FGI.length=0; NEON.length=0; WATER.length=0; RAYS.length=0; FIRE.length=0; DL.length=0; midTiles.fill(null);
  AREAS.forEach(compose);
  DLs=DL.slice().sort((a,b)=>a.z-b.z||a.i-b.i);
  AREAS.forEach(A=>{ const st=680, cidade=A.n<=5;
    const KF={porto:['cabeco','placa','cabeco'],adolpho:['placa','palm'],teatro:['placa','placa'],encontro:['cabeco','cabeco'],ribeirinha:['palm','samambaia','folhas'],
      igarape:['folhas','samambaia','cipo'],terrafirme:['folhas','cipo','samambaia'],samauma:['folhas','cipo','samambaia'],seringal:['folhas','samambaia','cipo'],garimpo:['folhas','samambaia'],igapo:['cipo','folhas'],varzea:['samambaia','folhas']};
    for(let wx=A.x0+170;wx<A.x1-60;wx+=st){ const k=Math.round((wx-A.x0)/st), u=(wx-A.x0)/(A.x1-A.x0);
      if(A.id!=='varzea'&&A.id!=='samauma'||u<.3||u>.92){ if(cidade){ if(A.id!=='encontro'&&A.id!=='ribeirinha') FGI.push({t:'poste',x:wx}); } else FGI.push({t:k%2?'tronco':'cipo',x:wx}); }
      FGI.push({t:pick(KF[A.id]||['folhas'],hsh(wx*.37)),x:wx+st*.5}); } });
  FGI.filter(it=>it.t==='poste').forEach(it=>LAMPS.push({fx:it.x*1.25,y:60/RS+.1,r:30}));
  built=true; engineDM=false;
  const [c0,g0]=mk(1,1);
  RL='noite'; collecting=true; for(const e of DLs){ g0.setTransform(1,0,0,1,0,0); e.f(g0,e.x0,e.x1); } collecting=false; OFFY=0;
  const uniq=(arr,key)=>{ const m=new Map(); arr.forEach(o=>m.set(key(o),o)); return [...m.values()]; };
  const wins=uniq(WINDOWS,o=>o.x.toFixed(1)+','+o.y.toFixed(1)); WINDOWS.length=0; WINDOWS.push(...wins);
  const lm=uniq(LAMPS,o=>(o.fx!=null?'f'+o.fx:o.x.toFixed(1))+','+o.y.toFixed(1)); LAMPS.length=0; LAMPS.push(...lm);
  const bl=uniq(BULBS,o=>o.x.toFixed(1)+','+o.y.toFixed(1)); BULBS.length=0; BULBS.push(...bl);
  const ne=uniq(NEON,o=>o.x.toFixed(1)+','+o.y.toFixed(1)); NEON.length=0; NEON.push(...ne);
  const wt=uniq(WATER,o=>o.x0+','+o.hz); WATER.length=0; WATER.push(...wt);
  tileAt(0);
}

const TINT={manha:'rgba(255,226,180,.05)',tarde:'rgba(255,240,200,.04)',anoitecer:'rgba(140,40,110,.16)',noite:'rgba(14,24,64,.16)',lua:'rgba(120,10,26,.4)'};
return {TINT,setLight,light:()=>LIGHT,build,mid,midTiles,drawMid,idle:ms=>{ engineIdle=true; return idle(ms); },warm,drawFG,FGI,drawSky,drawLights,AREAS,AID,WINDOWS,LAMPS,BULBS,W,H,BASE,WORLD,OUT,RS,TILE};
})();
