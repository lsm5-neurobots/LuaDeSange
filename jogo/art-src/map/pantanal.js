/* PANTANAL — fonte de arte (editável). Build: npm run art
   Cenário do mapa Pantanal (MT/MS) no mesmo contrato do MAP/LAPA: RS=2.5 → 960×540 px por tela, "mid" em tiles de 2048 px
   renderizados sob demanda (drawMid), céu/horizonte em parallax (drawSky), primeiro plano (drawFG) e halos aditivos (drawLights).
   Coordenadas públicas em unidades lógicas 384×216.
   Diferença do kit urbano: o horizonte é baixo e a água é um BURACO no mid. O drawSky pinta abaixo do horizonte o céu
   espelhado (gradiente, sol/lua, nuvens e mata do horizonte refletidos e quebrados em marolas) para cada modo de luz;
   onde o mid não desenha (alagado, corixo, baía, rio, poças da estrada) aparece o espelho d'água do modo atual.
   Nada semitransparente vai para os tiles (a gradação noturna multiplicaria errado): água é furo, reflexo de objeto é
   cópia invertida opaca em linhas, com falhas por onde o espelho aparece. */
const PANTANAL=(function(){
const W=384, H=216, BASE=118, OUT='#170b1c', SC=3, RS=2.5;
const DEF=[
  {id:'transpantaneira', name:'Transpantaneira', short:'Transpantaneira', len:768, floor:'terra', back:'estrada', fights:[14,18], chests:[], puzzle:null,
   ref:'Estrada-parque Transpantaneira · portal de madeira · pontes de tábua · valas alagadas', desc:'Entrada do mapa. A estrada de terra vermelha elevada corta o alagado: o portal de madeira com a placa da estrada-parque, a placa do KM 0, a vala cheia dos dois lados com jacarés no barranco e tuiuiú pescando, ipês floridos, postes de madeira e, adiante, a estrada vira ponte de tábua sobre um corixo.',
   chao:'Terra batida avermelhada com sulcos, poças e uma ponte de tábuas', inim:'Errantes e Corredores na estrada · Peão · Queixada · Tuiuiú', bau:'Nenhum'},
  {id:'porteira', name:'Porteira da Fazenda', short:'Porteira', len:768, floor:'capim', back:'fazenda', fights:[16,20], chests:[[.42,'comum']], puzzle:null,
   ref:'Porteira de tronco · casa-sede térrea de varanda corrida · mangueira · joão-de-barro', desc:'A porteira de tronco da Fazenda Lua Cheia (nome fictício), a cerca de arame e mourões, a casa-sede térrea caiada com varanda corrida de esteios e telha de barro, a carroça largada no terreiro, a mangueira enorme e o poste com ninho de joão-de-barro. Cavalos e gado pastam ao fundo.',
   chao:'Terreiro de terra e capim', inim:'Peões da fazenda · Queixadas · Blindado na varanda', bau:'Baú comum na varanda'},
  {id:'curral', name:'Curral', short:'Curral', len:768, floor:'lama', back:'curral', fights:[18,22], chests:[[.6,'comum']], puzzle:null,
   ref:'Mangueira de aroeira lascada · tronco de contenção · poço · couro esticado · berrante', desc:'A mangueira de madeira lascada cercando o gado branco, o tronco de contenção, o poço de tijolo com sarilho, o couro esticado secando, o berrante e o laço pendurados no esteio e o galpão de telha com fardos de feno.',
   chao:'Lama pisoteada com palha e marcas de casco', inim:'Peões em bando · Queixadas · Blindado', bau:'Baú de ferramentas no galpão'},
  {id:'campoalagado', name:'Campo Alagado', short:'Alagado', len:768, floor:'agua', back:'alagado', fights:[18,22], chests:[[.5,'comum']], puzzle:null,
   ref:'Mar raso de capim e aguapé · cervos-do-pantanal · tuiuiús pescando · ponte baixa', desc:'A planície coberta d\'água até o horizonte: ilhotas de capim e aguapé florido, capões e carandás espelhados, cervos-do-pantanal com água pela barriga, tuiuiús pescando, araras passando e uma ponte baixa de madeira cruzando o alagado.',
   chao:'Água rasa até o tornozelo, com capim e aguapé', inim:'Tuiuiús · Ariranhas emergindo · Piranhas · Queixadas', bau:'Baú comum numa ilhota'},
  {id:'corixo', name:'Corixo', short:'Corixo', len:768, floor:'margem', back:'corixo', fights:[18,24], chests:[[.55,'escondido']], puzzle:null,
   ref:'Canal estreito de água escura · mata ciliar · taboas · vitória-régia · pinguela', desc:'Um canal estreito de água escura sob a mata ciliar fechada: cipós pendurados, taboas e vitórias-régias, a pinguela de tronco atravessando, capivaras na margem, uma sucuri-amarela enrolada no barranco e a canoa virada.',
   chao:'Margem de lama e raízes', inim:'Ariranhas em família · Piranhas · Rastejante', bau:'Baú escondido nas taboas (faro do pet)'},
  {id:'baia', name:'Baía', short:'Baía', len:768, floor:'areia', back:'baia', fights:[20,26], chests:[[.5,'médico']], puzzle:null,
   ref:'Lagoa de água clara · aguapé · árvore solitária espelhada · jacarés boiando', desc:'A baía aberta de água parada espelhando o céu, com a árvore solitária na ilha e seu reflexo, a franja de aguapé florido, jacarés boiando só com olhos e dorso de fora, ninhos no capim da margem e o barco a remo amarrado.',
   chao:'Areia lamacenta e capim de margem', inim:'Piranhas · Ariranhas · Tuiuiús · Blindado', bau:'Baú médico no barco a remo'},
  {id:'salina', name:'Salina', short:'Salina', len:768, floor:'sal', back:'salina', fights:[20,26], chests:[[.5,'comum']], puzzle:.8,
   ref:'Lagoa salobra · crosta branca de sal · carandazal · colhereiros · cocho de sal', desc:'A lagoa salobra de borda branca de sal, o barro rachado, o carandazal de palmeiras-leque, o gado no cocho de sal e colhereiros cor-de-rosa ciscando na água rasa.',
   chao:'Areia clara, crosta de sal e barro rachado', inim:'Queixadas em bando · Peões · Blindados', bau:'Baú comum no cocho · puzzle de símbolos'},
  {id:'cordilheira', name:'Cordilheira', short:'Cordilheira', len:768, floor:'folhas', back:'mata', fights:[20,95], chests:[[.2,'militar']], puzzle:null,
   ref:'Capão de mato alto · ipê-amarelo · piúva · acuri · bocaiuva · cupinzeiros', desc:'O capão de mato seco e alto: troncos de ipê-amarelo e piúva floridos, acuris e bocaiuvas, bromélias nos troncos, teias entre os galhos e cupinzeiros altos no chão. No fim da trilha a clareira onde O Tamanduá-Bandeira se levanta.',
   chao:'Terra seca com folhas e raízes', inim:'Mini boss: O Tamanduá-Bandeira · Queixadas · Peões', bau:'Baú militar (ranger) num tronco oco'},
  {id:'ninhal', name:'Ninhal de Tuiuiús', short:'Ninhal', len:768, floor:'guano', back:'ninhal', fights:[20,26], chests:[[.62,'escondido']], puzzle:null,
   ref:'Árvores secas com ninhos gigantes de gravetos · colônia de tuiuiús · garças · colhereiros', desc:'A colônia: árvores secas e brancas de guano com ninhos de gravetos de um metro e meio no alto, dezenas de tuiuiús nos ninhos e nos galhos, garças e colhereiros, filhotes espiando e o chão coberto de gravetos, penas e cascas de ovo.',
   chao:'Guano, gravetos e cascas de ovo', inim:'Tuiuiús em bando · Onça na arena forte · Peões', bau:'Baú escondido sob um ninho caído (faro do pet)'},
  {id:'jofre', name:'Porto Jofre', short:'Porto Jofre', len:768, floor:'doca', back:'porto', fights:[20,26], chests:[[.12,'militar']], puzzle:.3,
   ref:'Ancoradouro de madeira · chalana · posto desativado · barcos de pesca · rio Cuiabá', desc:'O fim da Transpantaneira: o posto de combustível desativado, a placa do porto, o ancoradouro de tábuas sobre o rio, a chalana atracada com o convés de cima, barcos de alumínio com tuiuiús pousados na proa e a rampa de barranco vermelho.',
   chao:'Tábuas do ancoradouro e barro vermelho', inim:'Peões · Ariranhas · Onça na arena forte · Blindados', bau:'Baú militar no posto · puzzle de fio'},
  {id:'pontequebrada', name:'Ponte Quebrada', short:'Ponte', len:768, floor:'ponte', back:'ponte', fights:[20,26], chests:[[.5,'raro']], puzzle:null,
   ref:'Ponte de madeira partida sobre corixo largo · pilares podres · tábuas boiando', desc:'Uma das pontes de tábua da Transpantaneira, partida sobre um corixo largo: o tabuleiro com vãos abertos para a água, os pilares podres, o corrimão quebrado, tábuas boiando e o resto da ponte desabado ao fundo.',
   chao:'Tábuas da ponte com vãos sobre a água', inim:'Piranhas nos vãos · Ariranhas · Peões', bau:'Baú raro preso no corrimão'},
  {id:'rio', name:'Rio Cuiabá', short:'Rio', len:640, floor:'praia', back:'rio', fights:[95], chests:[], puzzle:null,
   ref:'Margem do rio Cuiabá · barranco de areia · banco de areia · esqueleto de chalana', desc:'Arena do chefe: a praia de areia clara na margem do rio Cuiabá, a água larga e lenta com um banco de areia no meio, a lua baixa, o esqueleto de uma chalana encalhada, ossos de boi na areia e tuiuiús em silhueta. O Rei Jacaré sobe do rio.',
   chao:'Areia úmida e capim de margem', inim:'Chefe: O Rei Jacaré', bau:'Nenhum'},
];

let acc=0; const AREAS=DEF.map((d,i)=>{ const L=d.len*SC; const a=Object.assign({},d,{n:i+1,x0:acc,x1:acc+L,len:L,ulen:d.len}); acc+=L; return a; });
const WORLD=acc, AID=Object.fromEntries(AREAS.map(a=>[a.id,a]));

/* ---------- medidas em pixels de alta resolução ---------- */
const HW=Math.round(W*RS), HH=Math.round(H*RS), HB=Math.round(BASE*RS); // 960 · 540 · 295
const HZ=186, MB=330; // horizonte (35% da tela) · borda de trás do chão jogável

/* ---------- cor ---------- */
function hx(h){ const n=parseInt(h.slice(1),16); return [(n>>16)&255,(n>>8)&255,n&255]; }
function toHex(r,g,b){ return '#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join(''); }
function mix(a,b,t){ const A=hx(a),B=hx(b); return toHex(A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,A[2]+(B[2]-A[2])*t); }
const RC=new Map();
// rampa de 6 tons com hue shift: [0] brilho quente · [1] luz · [2] base · [3] meia-sombra · [4] sombra roxa · [5] fundo
function rmp(h){ let r=RC.get(h); if(!r){ r=[mix(h,'#fff0c4',.55),mix(h,'#ffdc9c',.24),h,mix(h,'#3e2e86',.3),mix(h,'#221766',.54),mix(h,'#100828',.74)]; RC.set(h,r); } return r; }
function hsh(n){ n=Math.sin(n*127.1+311.7)*43758.5453; return n-Math.floor(n); }
const pick=(arr,v)=>arr[Math.floor(v*arr.length)%arr.length];
const HAZE='#9eacd0';
const hzc=(c,t)=>t>0?mix(c,HAZE,t):c; // névoa de distância
const RHC=new Map(); const rmpH=(c,t)=>{ if(!(t>0)) return rmp(c); const key=c+t.toFixed(2); let r=RHC.get(key); if(!r){ const b=hzc(c,t); r=rmp(b).map((x,i)=>i>=3?mix(x,b,Math.min(.75,t*1.1)):x); RHC.set(key,r); } return r; };

/* ---------- primitivas (pixels inteiros) ---------- */
function mk(w,h){ const c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d'); g.imageSmoothingEnabled=false; return [c,g]; }
function R(g,x,y,w,h,c){ if(w<=0||h<=0) return; g.fillStyle=c; const X=Math.round(x), Y=Math.round(y); g.fillRect(X,Y,Math.max(1,Math.round(x+w)-X),Math.max(1,Math.round(y+h)-Y)); }
function ell(g,cx,cy,rx,ry,c){ g.fillStyle=c; const RY=Math.max(1,Math.round(ry)); for(let dy=-RY;dy<=RY;dy++){ const hw=Math.round(rx*Math.sqrt(Math.max(0,1-(dy/(RY+.5))**2))); if(hw>0) g.fillRect(Math.round(cx-hw),Math.round(cy+dy),hw*2,1); } }
function poly(g,P,c){ g.fillStyle=c; let y0=1e9,y1=-1e9; for(const p of P){ if(p[1]<y0) y0=p[1]; if(p[1]>y1) y1=p[1]; }
  for(let y=Math.floor(y0);y<Math.ceil(y1);y++){ const yc=y+.5, xs=[]; for(let i=0;i<P.length;i++){ const a=P[i], b=P[(i+1)%P.length]; if((a[1]<=yc&&b[1]>yc)||(b[1]<=yc&&a[1]>yc)) xs.push(a[0]+(yc-a[1])/(b[1]-a[1])*(b[0]-a[0])); }
    xs.sort((p,q)=>p-q); for(let i=0;i+1<xs.length;i+=2){ const xa=Math.round(xs[i]), xb=Math.round(xs[i+1]); if(xb>xa) g.fillRect(xa,y,xb-xa,1); } } }
function line(g,x0,y0,x1,y1,c,t=1){ const n=Math.max(1,Math.ceil(Math.max(Math.abs(x1-x0),Math.abs(y1-y0)))); g.fillStyle=c; for(let i=0;i<=n;i++) g.fillRect(Math.round(x0+(x1-x0)*i/n),Math.round(y0+(y1-y0)*i/n),t,t); }
function sag(g,x0,y0,x1,y1,s,c,t=1){ const n=Math.max(1,Math.ceil(Math.abs(x1-x0))); g.fillStyle=c; let py=null;
  for(let i=0;i<=n;i++){ const u=i/n, x=Math.round(x0+(x1-x0)*u), y=Math.round(y0+(y1-y0)*u+Math.sin(u*Math.PI)*s); if(py!==null&&Math.abs(y-py)>1) g.fillRect(x,Math.min(y,py),t,Math.abs(y-py)); g.fillRect(x,y,t,t); py=y; } }
function blob(g,x,y,w,h,c){ const k=Math.max(1,Math.min(4,Math.floor(Math.min(w,h)/4))); R(g,x+k,y,w-2*k,h,c); R(g,x,y+k,w,h-2*k,c); R(g,x+k/2,y+k/2,w-k,h-k,c); }
function bezL(g,P,c,t){ // curva quadrática por pontos (galho/cipó)
  const [a,b,d]=P, n=Math.ceil(Math.hypot(d[0]-a[0],d[1]-a[1])); for(let i=0;i<=n;i++){ const u=i/n, x=(1-u)*(1-u)*a[0]+2*(1-u)*u*b[0]+u*u*d[0], y=(1-u)*(1-u)*a[1]+2*(1-u)*u*b[1]+u*u*d[1]; R(g,x-t/2,y-t/2,t,t,c); } }
function hole(g,fn){ g.save(); g.globalCompositeOperation='destination-out'; fn(g); g.restore(); } // furo no mid: o espelho d'água aparece
let LQ=null; // fila de luz do tile: emissivos e halos são desenhados depois da gradação noturna
function emit(g,fn){ if(LQ) LQ.push([0,fn,g.getTransform()]); else fn(g); }
function emitW(g,fn){ if(RL!=='dia') emit(g,fn); }
function glow(g,cx,cy,r,col,a,steps,ry){ if(LQ){ LQ.push([1,G=>glowNow(G,cx,cy,r,col,a,steps,ry),g.getTransform()]); return; } glowNow(g,cx,cy,r,col,a,steps,ry); }
function glowNow(g,cx,cy,r,col,a,steps,ry){ g.save(); g.globalCompositeOperation='lighter'; g.globalAlpha=a; for(let i=0;i<steps;i++){ const f=1-i/steps; ell(g,cx,cy,r*f,(ry||r)*f,col); } g.restore(); }
function shade(g,x,y,w,h,c,a){ g.save(); g.globalAlpha=a; R(g,x,y,w,h,c); g.restore(); } // só sobre pixel opaco
function lowf(x,y,s){ return (Math.sin(x*.0061+s)+Math.sin(x*.0137+y*.021+s*2)+Math.sin(x*.029-y*.013+s*3))/3; }
function rowsP(y0,y1,h0,k){ const r=[]; let y=y0; while(y<y1){ const h=Math.max(2,Math.round(h0+(y-y0)*k)); r.push([y,Math.min(h,y1-y)]); y+=h; } return r; }
const pk=y=>.55+Math.max(0,(y-MB))/(HH-MB)*.9; // escala de perspectiva no chão

/* ---------- fonte 5×7 pra placas ---------- */
const FONT={A:[14,17,17,31,17,17,17],B:[30,17,17,30,17,17,30],C:[14,17,16,16,16,17,14],D:[30,17,17,17,17,17,30],E:[31,16,16,30,16,16,31],F:[31,16,16,30,16,16,16],G:[14,17,16,23,17,17,15],H:[17,17,17,31,17,17,17],I:[14,4,4,4,4,4,14],J:[7,2,2,2,2,18,12],K:[17,18,20,24,20,18,17],L:[16,16,16,16,16,16,31],M:[17,27,21,21,17,17,17],N:[17,17,25,21,19,17,17],O:[14,17,17,17,17,17,14],P:[30,17,17,30,16,16,16],Q:[14,17,17,17,21,18,13],R:[30,17,17,30,20,18,17],S:[15,16,16,14,1,1,30],T:[31,4,4,4,4,4,4],U:[17,17,17,17,17,17,14],V:[17,17,17,17,17,10,4],W:[17,17,17,21,21,21,10],X:[17,17,10,4,10,17,17],Y:[17,17,17,10,4,4,4],Z:[31,1,2,4,8,16,31],
  '0':[14,17,19,21,25,17,14],'1':[4,12,4,4,4,4,14],'2':[14,17,1,2,4,8,31],'3':[31,2,4,2,1,17,14],'4':[2,6,10,18,31,2,2],'5':[31,16,30,1,1,17,14],'6':[6,8,16,30,17,17,14],'7':[31,1,2,4,8,8,8],'8':[14,17,17,14,17,17,14],'9':[14,17,17,15,1,2,12],'.':[0,0,0,0,0,12,12],'-':[0,0,0,31,0,0,0],'!':[4,4,4,4,4,0,4],"'":[4,4,0,0,0,0,0],'/':[1,1,2,4,8,16,16],' ':[0,0,0,0,0,0,0]};
const norm=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase();
function text(g,str,x,y,s,c){ str=norm(str); let cx=x; g.fillStyle=c; for(const ch of str){ const G=FONT[ch]||FONT[' ']; for(let r=0;r<7;r++){ const row=G[r]; for(let b=0;b<5;b++) if(row&(16>>b)) g.fillRect(cx+b*s,y+r*s,s,s); } cx+=6*s; } return cx-x-s; }
const tw=(str,s)=>norm(str).length*6*s-s;
function textSh(g,str,x,y,s,c,sh){ text(g,str,x+Math.max(1,s>>1),y+Math.max(1,s>>1),s,sh); text(g,str,x,y,s,c); }

/* ---------- listas públicas ---------- */
const WINDOWS=[], LAMPS=[], BULBS=[], FGI=[], WATER=[], FIREF=[], EYES=[];
let collecting=false; const reg=(arr,o)=>{ if(collecting) arr.push(o); };
const pushWin=(x,y,w,h)=>reg(WINDOWS,{x:x/RS,y:y/RS,w:w/RS,h:h/RS,lit:true,warm:true});

/* ---------- lista de desenho do mid (pixels de alta resolução, coordenadas do mundo) ---------- */
const DL=[]; let DLs=null;
function add(x0,x1,z,f){ DL.push({x0:Math.floor(x0),x1:Math.ceil(x1),z,f,i:DL.length}); }

/* reflexo de objeto na água: desenha fn (coordenadas do mundo) e uma cópia invertida abaixo de yw, escurecida,
   ondulada e com linhas faltando (por onde aparece o espelho do céu). */
const RF={};
function rfC(k,w,h){ let o=RF[k]; if(!o||o.c.width<w||o.c.height<h){ const [c,g]=mk(Math.max(w,o?o.c.width:0),Math.max(h,o?o.c.height:0)); o=RF[k]={c,g}; } o.g.setTransform(1,0,0,1,0,0); o.g.globalCompositeOperation='source-over'; o.g.globalAlpha=1; o.g.clearRect(0,0,o.c.width,o.c.height); return o; }
function refl(g,x0,x1,ytop,yw,fn,o){ o=o||{}; if(collecting){ fn(g); return; }
  x0=Math.floor(x0); ytop=Math.floor(ytop); const w=Math.ceil(x1-x0), h=Math.ceil(yw-ytop); if(w<=0||h<=0){ fn(g); return; }
  const A=rfC('a',w,h); A.g.translate(-x0,-ytop); const lq=LQ; LQ=null; fn(A.g); LQ=lq;
  if(!o.only) fn(g);
  const sq=o.sq||.8, dmax=Math.min(Math.round(h*sq),o.d||9999), B=rfC('b',w+8,dmax+2);
  for(let r=0;r<dmax;r++){ if((r%4===3&&hsh(r*.71+x0*.013)>.25)||(r>dmax*.6&&r%2&&hsh(r+x0)>.5)) continue; const sy=h-1-Math.floor(r/sq); if(sy<0) break;
    const off=Math.round(Math.sin(r*.55+x0*.01)*(1+r*.05)); B.g.drawImage(A.c,0,sy,w,1,4+off,r,w,1); }
  B.g.globalCompositeOperation='source-atop'; B.g.fillStyle=o.tint||'#1e3442'; B.g.globalAlpha=o.ta||.5; B.g.fillRect(0,0,w+8,dmax+2); B.g.globalAlpha=1; B.g.globalCompositeOperation='source-over';
  g.drawImage(B.c,0,0,w+8,dmax+2,x0-4,yw,w+8,dmax+2); }

/* =====================================================================
   VEGETAÇÃO
   ===================================================================== */
const GREEN='#5e8a3e', GREEN2='#4a7a46', GDARK='#3a6040', SECO='#b89a52', BARK='#6a5444', BARKC='#a8a094';
// tufo de folhagem: sombra embaixo-direita, base, meia-luz e brilho no alto-esquerda, borda recortada em folhas
function puff(g,x,y,r,c,s){ const ry=r*.8; s=s||x*.37+y*.71;
  ell(g,x+1,y+2,r,ry,c[5]); ell(g,x,y,r*.92,ry*.9,c[4]); const nb=r>6?7:4; for(let k=0;k<nb;k++){ const a=hsh(s+k)*6.28, rr=r*(.32+hsh(s*2+k)*.2); ell(g,x+Math.cos(a)*r*.72,y+Math.sin(a)*ry*.7,rr,rr*.85,Math.sin(a)>.2?c[4]:c[3]); }
  ell(g,x-r*.12,y-r*.16,r*.74,ry*.68,c[3]); for(let k=0;k<3;k++){ const a=-2.2+k*.7+hsh(s*3+k)*.4; ell(g,x-r*.2+Math.cos(a)*r*.4,y-r*.25+Math.sin(a)*ry*.35,r*.32,ry*.26,c[2]); } if(r>4){ ell(g,x-r*.36,y-r*.46,r*.24,ry*.18,c[1]); R(g,x-r*.5,y-r*.55,Math.max(1,r*.18),1,c[0]); }
  if(r>5){ for(let k=0;k<5;k++){ const a=-2.9+k*.6, px=x+Math.cos(a)*r*.98, py=y+Math.sin(a)*ry*.98; R(g,px-1,py-1,2,2,k<2?c[2]:c[3]); } for(let k=0;k<3;k++) R(g,x+(hsh(s+k*5)-.5)*r,y+(hsh(s+k*9)-.2)*ry,2,1,c[5]); } }
// copa: tufos espalhados numa elipse, de trás pra frente; os de baixo um tom mais escuros
function foliage(g,cx,cy,rx,ry,c,s,rmin,rmax){ rmin=rmin||6; rmax=rmax||12; const ra=(rmin+rmax)/2, n=Math.max(4,Math.round(rx*ry/(ra*ra)*1.5)), P=[];
  for(let i=0;i<n;i++){ const a=hsh(s+i*1.7)*Math.PI*2, d=Math.sqrt(hsh(s*3+i*2.3))*.94; P.push([cx+Math.cos(a)*rx*d,cy+Math.sin(a)*ry*d,rmin+hsh(s*5+i*.7)*(rmax-rmin)]); }
  P.sort((p,q)=>p[1]-q[1]); const cd=[c[2],c[3],c[4],c[5],c[5],c[5]], cm=[c[1],c[2],c[3],c[4],c[5],c[5]];
  ell(g,cx,cy+ry*.12,rx*.88,ry*.84,c[5]);
  for(const p of P){ const t=(p[1]-cy)/ry+(p[0]-cx)/rx*.25; puff(g,p[0],p[1],p[2],t>.4?cd:t>-.15?cm:c,s+p[0]); }
  const nl=Math.round(rx*ry/30); for(let i=0;i<nl;i++){ const a=hsh(s*7+i*1.1)*6.28, d=Math.sqrt(hsh(s*11+i*1.9)), x=cx+Math.cos(a)*rx*d, y=cy+Math.sin(a)*ry*d, up=Math.sin(a)<0&&Math.cos(a)<.4;
    if(up){ R(g,x,y,3,1,c[1]); R(g,x+1,y-1,1,1,c[0]); } else if(d>.5){ R(g,x,y,2,2,c[5]); R(g,x+2,y,1,1,c[4]); } }
  for(let i=0;i<Math.round(rx/5);i++){ const a=.4+hsh(s+i*3.3)*2.3, x=cx+Math.cos(a)*rx*.95, y=cy+Math.sin(a)*ry*.92; R(g,x,y,1,2+hsh(i)*3,c[4]); } }
function galho(g,x0,y0,x1,y1,t,c){ for(let k=0;k<t;k++) line(g,x0+k-t/2,y0,x1+k*.6-t*.3,y1,k<1?c[1]:k>=t-1?c[4]:c[3]); }
function tronco(g,x,yb,h,w0,w1,c,s,lean){ lean=lean||0; for(let y=0;y<h;y++){ const t=y/h, w=Math.max(2,Math.round(w0+(w1-w0)*t)), xx=Math.round(x+lean*t*t+Math.sin(t*4+s)*w0*.12), X=xx-w/2;
    R(g,X,yb-y,w,1,c[3]); R(g,X,yb-y,Math.max(1,Math.round(w*.28)),1,c[2]); R(g,X,yb-y,1,1,c[1]); R(g,X+w-Math.max(1,Math.round(w*.3)),yb-y,Math.max(1,Math.round(w*.3)),1,c[4]);
    if(w>5&&hsh(s+y*.37)>.82) R(g,X+2+hsh(y+s)*(w-5),yb-y,2,3,c[4]); if(w>7&&hsh(s*2+y*.21)>.93) R(g,X+1+hsh(y*2)*(w-4),yb-y,3,1,c[1]); }
  for(let k=-2;k<3;k++) R(g,x+k*w0*.45-2,yb-2,5,3,c[4]); }
// árvore de copa larga (piúva/cambará/figueira): tronco, galhos e 3–4 copas
function arvore(g,x,yb,k,s,o){ o=o||{}; const hz=o.hz||0, c=o.c||rmpH(pick([GREEN,GREEN2,'#6a8a3a','#4e7c4a'],hsh(s)),hz), tr=rmpH(o.bark||BARK,hz), h=Math.round((150+hsh(s*3)*50)*k), cy=yb-h;
  tronco(g,x,yb,h*.62,10*k+2,6*k+1,tr,s,(hsh(s*7)-.5)*14*k);
  const br=[[-1,.55,.8],[1,.45,.7],[-.4,.3,1],[.6,.75,.6]]; for(const [dx,yy,l] of br){ const y0=yb-h*yy; galho(g,x,y0,x+dx*48*k*l,y0-34*k*l,Math.max(2,Math.round(4*k)),tr); }
  const rx=(60+hsh(s*5)*30)*k, ry=(34+hsh(s*9)*10)*k;
  foliage(g,x-rx*.45,cy+ry*.35,rx*.6,ry*.75,c,s+1,5*k+2,10*k+3); foliage(g,x+rx*.5,cy+ry*.45,rx*.55,ry*.7,c,s+2,5*k+2,10*k+3); foliage(g,x,cy,rx*.75,ry,c,s+3,6*k+2,12*k+3);
  if(o.flor){ const f=rmp(o.flor); for(let i=0;i<Math.round(30*k);i++){ const a=hsh(s+i*3.1)*6.28, d=Math.sqrt(hsh(s+i*5.3)); puff(g,x+Math.cos(a)*rx*d*.9,cy+Math.sin(a)*ry*d*.8,(3+hsh(i)*3)*k+1,f); } } }
// ipê: tronco torto escuro, galhos abertos e copa só de flor (amarelo ou roxo), flores caídas no chão
function ipe(g,x,yb,k,s,col,hz){ hz=hz||0; const tr=rmpH('#4a3a34',hz), f=rmpH(col,hz), h=Math.round((170+hsh(s)*40)*k), cy=yb-h;
  tronco(g,x,yb,h*.55,9*k+2,6*k+1,tr,s,(hsh(s*3)-.5)*20*k);
  const tx=x+(hsh(s*3)-.5)*20*k*.3, ty=yb-h*.55;
  for(const [dx,dy] of [[-70,-40],[-40,-80],[10,-95],[55,-70],[80,-30],[-90,-10]]) galho(g,tx,ty,tx+dx*k,ty+dy*k,Math.max(2,Math.round(3.4*k)),tr);
  const rx=95*k, ry=48*k; ell(g,tx,cy+ry*.2,rx*.8,ry*.7,f[5]);
  for(let i=0;i<Math.round(46*k)+6;i++){ const a=hsh(s+i*1.3)*6.28, d=Math.sqrt(hsh(s*7+i*2.1)); puff(g,tx+Math.cos(a)*rx*d,cy+Math.sin(a)*ry*d+ry*.1,(5+hsh(s+i)*6)*k+1,(Math.sin(a)>.4)?[f[2],f[3],f[4],f[5],f[5],f[5]]:f); }
  for(const [dx,dy] of [[-60,-30],[30,-60],[70,-20]]) line(g,tx+dx*k*.6,ty+dy*k*.7,tx+dx*k*.9,ty+dy*k,tr[4],Math.max(1,Math.round(2*k)));
  for(let i=0;i<Math.round(14*k);i++){ const fx=x+(hsh(s+i*9.7)-.5)*rx*1.6, fy=yb-2+hsh(s+i*4.1)*6*k; R(g,fx,fy,2,1,f[1]); R(g,fx+1,fy+1,1,1,f[3]); } }
// carandá: palmeira-leque de tronco fino, copa redonda de leques e saia de folhas secas
function caranda(g,x,yb,k,s,hz){ hz=hz||0; const tr=rmpH('#8a7a66',hz), lf=rmpH('#7aa25a',hz), dd=rmpH('#a8864e',hz), h=Math.round((150+hsh(s)*70)*k), lean=(hsh(s*3)-.5)*40*k;
  for(let y=0;y<h;y++){ const t=y/h, xx=Math.round(x+lean*t*t), w=Math.max(2,Math.round((7-2.5*t)*k)); R(g,xx-w/2,yb-y,w,1,tr[3]); R(g,xx-w/2,yb-y,1,1,tr[1]); R(g,xx+w/2-1,yb-y,1,1,tr[4]); if((y+Math.round(s*10))%Math.max(3,Math.round(6*k))===0) R(g,xx-w/2,yb-y,w,1,tr[4]); }
  const cx=Math.round(x+lean), cy=yb-h, r=Math.round(24*k)+3;
  for(let i=0;i<12;i++){ const a=Math.PI*.12+i/11*Math.PI*.76, L=(16+hsh(s+i)*10)*k; line(g,cx,cy+3,cx+Math.cos(a)*L*.7,cy+3+Math.sin(a)*L,dd[i%3+2],Math.max(1,Math.round(2*k))); }
  const fan=(a,L,c,sh)=>{ const P=[[cx,cy]]; for(let j=0;j<=6;j++){ const b=a-.32+j/6*.64, l=L*(j%2?1:.86); P.push([cx+Math.cos(b)*l,cy+Math.sin(b)*l*.86]); } poly(g,P,c[sh]); for(let j=1;j<6;j++){ const b=a-.32+j/6*.64; line(g,cx+Math.cos(b)*L*.25,cy+Math.sin(b)*L*.22,cx+Math.cos(b)*L*.9,cy+Math.sin(b)*L*.78,c[Math.max(0,sh-1)]); } };
  const fans=[]; for(let i=0;i<13;i++){ const a=-Math.PI+i/12*Math.PI*2+hsh(s+i)*.2; fans.push([a,(r*(.85+hsh(s*2+i)*.3))]); }
  fans.sort((p,q)=>Math.sin(p[0])-Math.sin(q[0])); for(const [a,L] of fans){ const sy=Math.sin(a); fan(a,L,lf,sy<-.4?2:sy<.3?3:4); }
  ell(g,cx,cy,3*k+1,3*k+1,lf[4]); R(g,cx-r*.4,cy-r*.62,Math.max(2,r*.3),2,lf[0]); }
// acuri / bocaiuva: palmeira de folha penada arqueada (tronco grosso com bainhas de folha velha)
function acuri(g,x,yb,k,s,o){ o=o||{}; const hz=o.hz||0, tr=rmpH(o.boc?'#6a6058':'#7a6a52',hz), lf=rmpH(o.boc?'#5a8a4a':'#4e8a44',hz), h=Math.round((o.boc?170:120)*k*(.9+hsh(s)*.2)), w0=Math.round((o.boc?8:15)*k)+2;
  for(let y=0;y<h;y++){ const t=y/h, w=Math.round(w0*(1-t*.15)), xx=x-w/2; R(g,xx,yb-y,w,1,tr[3]); R(g,xx,yb-y,Math.round(w*.3),1,tr[2]); R(g,xx+w-Math.round(w*.3),yb-y,Math.round(w*.3),1,tr[4]);
    if(!o.boc){ const ph=(y+Math.round(s*9))%Math.round(9*k+3); if(ph<2){ for(let xx2=0;xx2<w;xx2+=Math.round(6*k)+2) R(g,xx+xx2+(ph?1:0),yb-y,3,1,tr[1]); } if(ph===3) R(g,xx,yb-y,w,1,tr[4]); } else if(hsh(y*.7+s)>.8) R(g,xx+hsh(y)*w,yb-y,1,1,tr[1]); }
  const cx=x, cy=yb-h;
  if(!o.boc) for(let i=0;i<6;i++) ell(g,cx-6*k+i*2.4*k,cy+6*k+hsh(i)*4,3*k,4*k,i%2?tr[3]:tr[2]);
  const n=o.boc?10:13; for(let f=0;f<n;f++){ const a=-Math.PI+(f+.5)/n*Math.PI+(hsh(s+f)-.5)*.3, len=(o.boc?80:105)*k*(.75+hsh(s*3+f)*.4), dead=hsh(s*5+f)>.86;
    const c=dead?rmpH(SECO,hz):lf, droop=1/(150*k);
    for(let r=0;r<len;r+=2){ const px=cx+Math.cos(a)*r, py=cy+Math.sin(a)*r*.55+r*r*droop*(dead?2.2:1); R(g,px-1,py-1,3,3,c[5]);
      for(const side of [-1,1]){ const L=Math.max(0,(1-r/len)*(o.boc?14:20)*k); if(L>1) line(g,px,py+1,px+side*2+Math.cos(a+side*1.3)*L*.4,py+L,(r/2)%3?c[3]:c[2]); }
      R(g,px,py,2,2,c[1]); } }
  if(!o.boc&&hsh(s*13)>.3){ for(let i=0;i<9;i++) ell(g,cx+6*k+(i%3)*4*k,cy+10*k+Math.floor(i/3)*4*k,2.6*k,2.6*k,i%2?'#c88a3a':'#a86a2a'); } }
// capão: ilha de mata (várias copas + palmeiras furando por cima); hz = névoa de distância
function capao(g,x,w,yb,k,s,hz){ hz=hz||0; const n=Math.max(2,Math.round(w/(70*k)));
  for(let i=0;i<n;i++){ const xx=x+(i+.5)*w/n+(hsh(s+i)-.5)*30*k; if(hsh(s*3+i)>.72) acuri(g,xx,yb-6*k,k*.85,s+i,{hz}); else if(hsh(s*7+i)>.8) caranda(g,xx,yb-4*k,k,s+i,hz); }
  for(let i=0;i<n;i++){ const xx=x+(i+.5)*w/n+(hsh(s+i*1.3)-.5)*24*k, hh=(40+hsh(s+i*5)*50)*k, c=rmpH(pick([GREEN,GREEN2,'#6a8a3a',GDARK],hsh(s+i*2)),hz);
    if(hsh(s+i*9)>.5){ const tr=rmpH(BARK,hz); R(g,xx-2*k,yb-hh*.6,4*k,hh*.6,tr[4]); }
    foliage(g,xx,yb-hh*.75,(w/n)*.75+10*k,hh*.55,c,s+i*11,Math.max(3,5*k),Math.max(5,11*k)); }
  const c0=rmpH(GDARK,hz); for(let xx=x;xx<x+w;xx+=4){ const hh=4+hsh(xx*.3+s)*7*k; R(g,xx,yb-hh,4,hh,c0[4]); R(g,xx,yb-hh,2,2,c0[3]); } R(g,x,yb-2,w,3,c0[5]); }
function arvoreSeca(g,x,yb,k,s,o){ o=o||{}; const c=rmpH(o.col||'#a8a098',o.hz||0), h=Math.round(200*k);
  tronco(g,x,yb,h*.5,12*k+2,7*k+1,c,s,(hsh(s)-.5)*16*k); const ends=[];
  const br=(x0,y0,a,len,t,d)=>{ const x1=x0+Math.cos(a)*len, y1=y0+Math.sin(a)*len; galho(g,x0,y0,x1,y1,Math.max(1,Math.round(t*1.5)),c); if(d<=0||len<8){ ends.push([x1,y1]); return; }
    br(x1,y1,a-.35-hsh(s+d*3+x0)*.3,len*.7,t*.66,d-1); br(x1,y1,a+.3+hsh(s+d*7+y0)*.35,len*.66,t*.62,d-1); if(hsh(s+x1)>.6) br(x1,y1,a+(hsh(y1)-.5)*.4,len*.55,t*.5,d-2); };
  const tx=x+(hsh(s)-.5)*16*k*.25, ty=yb-h*.5; br(tx,ty,-1.57-.5,55*k,6*k,3); br(tx,ty,-1.57+.55,58*k,6*k,3); br(tx,ty+10*k,-1.57+.05,70*k,6*k,3);
  if(o.guano) for(let i=0;i<40;i++){ const y0=yb-hsh(s+i)*h*.95, xx=x+(hsh(s*3+i)-.5)*30*k*(1-(yb-y0)/h); R(g,xx,y0,2,3+hsh(i)*6,'#ece8e0'); }
  return ends; }
function ninho(g,x,y,k,s){ const c=rmp('#7a5a3a'); ell(g,x,y+4*k,34*k,10*k,c[5]); ell(g,x,y,32*k,12*k,c[4]); ell(g,x,y-3*k,28*k,8*k,c[3]); ell(g,x,y-6*k,22*k,4*k,c[5]);
  for(let i=0;i<40;i++){ const a=hsh(s+i)*6.28, r=(20+hsh(s*2+i)*14)*k, x0=x+Math.cos(a)*r*.8, y0=y+Math.sin(a)*r*.3; line(g,x0,y0,x0+(hsh(i+s)-.5)*26*k,y0+(hsh(i*3)-.5)*10*k,i%3?c[2]:c[1]); }
  for(let i=0;i<10;i++){ const a=hsh(s*5+i)*3.14; line(g,x+Math.cos(a)*30*k,y+4*k,x+Math.cos(a)*38*k,y+14*k+hsh(i)*8*k,c[3]); } }
function taboa(g,x,yb,k,s){ const c=rmp('#6a8a3a'), b=rmp('#7a4a2a'); for(let i=0;i<9;i++){ const xx=x+(hsh(s+i)-.5)*30*k, h=(50+hsh(s*2+i)*40)*k, lean=(hsh(s*3+i)-.5)*16*k;
    line(g,xx,yb,xx+lean,yb-h,i%2?c[3]:c[2],Math.max(1,Math.round(2*k))); if(hsh(s*5+i)>.45){ const tx=xx+lean*.9, ty=yb-h*.9; R(g,tx-2*k,ty,4*k+1,12*k,b[3]); R(g,tx-2*k,ty,1.5*k+1,12*k,b[1]); R(g,tx-.5,ty-6*k,1,6*k,c[3]); } }
  for(let i=0;i<7;i++){ const xx=x+(hsh(s*7+i)-.5)*34*k; bezL(g,[[xx,yb],[xx+(hsh(i)-.5)*30*k,yb-40*k],[xx+(hsh(i*3)-.5)*50*k,yb-(30+hsh(i*5)*30)*k]],i%2?c[1]:c[3],Math.max(1,Math.round(1.5*k))); } }
// capim alto em touceira (lâminas em V com três tons e pendão de semente)
function touceira(g,x,yb,k,s,col){ const c=rmp(col||'#8aa24a'), n=Math.round(9+k*6);
  for(let i=0;i<n;i++){ const a=-Math.PI/2+(hsh(s+i)-.5)*1.5, L=(18+hsh(s*3+i)*22)*k, x1=x+Math.cos(a)*L, y1=yb+Math.sin(a)*L; line(g,x+(i-n/2)*.8,yb,x1,y1,i%3===0?c[1]:i%3===1?c[3]:c[2],Math.max(1,Math.round(k)));
    if(hsh(s*9+i)>.8){ R(g,x1-1,y1-4*k,2,5*k,mix(c[1],'#e8d8a0',.5)); } } R(g,x-5*k,yb-1,10*k,2,c[5]); }
function aguape(g,x,y,k,s,flor){ const c=rmp('#4e8a3a'); // roseta de folhas redondas brilhantes + espiga lilás
  for(let i=0;i<6;i++){ const a=hsh(s+i)*6.28, r=(5+hsh(s*2+i)*4)*k, px=x+Math.cos(a)*7*k, py=y+Math.sin(a)*2.5*k-2*k; ell(g,px,py,r,r*.62,c[4]); ell(g,px-1,py-1,r*.8,r*.48,c[2]); R(g,px-r*.4,py-r*.4,Math.max(1,r*.4),1,c[0]); }
  if(flor!==false&&hsh(s*7)>.35){ const f=rmp('#a478d4'), h=(12+hsh(s)*6)*k; line(g,x,y-3*k,x,y-h,c[3],1); for(let j=0;j<5;j++){ ell(g,x+(j%2?2:-2)*k,y-h+j*2.4*k,2.2*k+.5,1.6*k+.5,j%2?f[1]:f[2]); R(g,x,y-h+j*2.4*k,1,1,'#f4e060'); } } }
function vitoria(g,x,y,k,s){ const g0=rmp('#5a9a3a'), r=rmp('#a83a3a'), rx=(26+hsh(s)*14)*k, ry=rx*.32; ell(g,x,y+2,rx+2,ry+2,r[3]); ell(g,x,y,rx+1,ry+1,r[2]); ell(g,x,y,rx-1,ry-1,g0[3]);
  for(let i=0;i<10;i++){ const a=i/10*6.28; line(g,x,y,x+Math.cos(a)*rx*.9,y+Math.sin(a)*ry*.9,g0[4]); } ell(g,x-rx*.25,y-ry*.3,rx*.4,ry*.3,g0[2]); R(g,x-rx*.4,y-ry*.5,rx*.3,1,g0[1]);
  if(hsh(s*3)>.75){ ell(g,x+rx*.3,y-4*k,5*k,4*k,'#f4eef0'); ell(g,x+rx*.3,y-6*k,3*k,3*k,'#fff8fa'); R(g,x+rx*.3-1,y-5*k,2,2,'#f0a8c0'); } }
function cupinzeiro(g,x,yb,k,s){ const c=rmp('#a8683a'), h=(60+hsh(s)*50)*k, w=26*k; const P=[[x-w,yb],[x-w*.7,yb-h*.4],[x-w*.4,yb-h*.8],[x-w*.1,yb-h],[x+w*.3,yb-h*.85],[x+w*.5,yb-h*.5],[x+w*.6,yb-h*.6],[x+w*.75,yb-h*.3],[x+w,yb]];
  poly(g,P,c[3]); poly(g,P.map(p=>[x+(p[0]-x)*.6-w*.15,p[1]+(yb-p[1])*.05]),c[2]); for(let i=0;i<20;i++){ const yy=yb-hsh(s+i)*h*.9, xx=x+(hsh(s*3+i)-.6)*w*1.2*(1-(yb-yy)/h); ell(g,xx,yy,3*k,2*k,hsh(i)>.5?c[1]:c[4]); }
  for(let i=0;i<6;i++){ const yy=yb-hsh(s*5+i)*h*.8; R(g,x+(hsh(i)-.5)*w,yy,2,2,c[5]); } R(g,x-w-2,yb-2,w*2+4,3,c[5]); }
function bromelia(g,x,y,k,s){ const c=rmp('#6a9a3a'), r=rmp('#d8402a'); for(let i=0;i<7;i++){ const a=-Math.PI+i/6*Math.PI; line(g,x,y,x+Math.cos(a)*10*k,y+Math.sin(a)*8*k-2,i%2?c[2]:c[3],Math.max(1,Math.round(1.5*k))); } ell(g,x,y-3*k,2.5*k,4*k,r[2]); R(g,x-1,y-6*k,1,2,r[0]); }
function teia(g,x,y,r,s){ const c='#d8dce8'; for(let i=0;i<8;i++){ const a=i/8*6.28; line(g,x,y,x+Math.cos(a)*r,y+Math.sin(a)*r,c); } for(let j=1;j<4;j++){ const rr=r*j/4; for(let i=0;i<8;i++){ const a=i/8*6.28, b=(i+1)/8*6.28; line(g,x+Math.cos(a)*rr,y+Math.sin(a)*rr,x+Math.cos(b)*rr,y+Math.sin(b)*rr,c); } } }

/* =====================================================================
   FAUNA DE CENÁRIO (vista de lado, pequena: só ambientação)
   ===================================================================== */
function tuiuiu(g,x,y,k,s,o){ o=o||{}; const W0=rmp('#f4f1ea'), B='#1a1a22', B2='#34343e', RD=rmp('#d8242c'), f=o.f||1; // y = pé
  const L=Math.round(20*k); line(g,x-2*k,y,x-2*k,y-L,B,Math.max(1,Math.round(1.4*k))); line(g,x+3*k,y,x+2*k,y-L,B2,Math.max(1,Math.round(1.4*k))); R(g,x-5*k,y,5*k,1,B); R(g,x+1*k,y,5*k,1,B);
  const by=y-L-7*k; ell(g,x,by,11*k,7*k,W0[4]); ell(g,x-1*k,by-1*k,10*k,6*k,W0[2]); ell(g,x-3*k,by-3*k,6*k,3*k,W0[0]); poly(g,[[x-10*k*f,by-1*k],[x-17*k*f,by+3*k],[x-8*k*f,by+4*k]],B2); R(g,x-11*k*f+(f<0?-2:0),by+1*k,9*k,2*k,B);
  if(o.pesca){ const nx=x+8*k*f; R(g,x+6*k*f-(f<0?2*k:0),by-3*k,4*k,3*k,RD[2]); line(g,x+7*k*f,by-2*k,nx+4*k*f,by+10*k,B,Math.max(2,Math.round(2*k))); ell(g,nx+5*k*f,by+12*k,3*k,2.4*k,B); line(g,nx+6*k*f,by+13*k,nx+8*k*f,by+24*k,'#2a2a30',Math.max(1,Math.round(1.3*k))); return; }
  const nx=x+6*k*f, ny=by-20*k; R(g,x+5*k*f-(f<0?4*k:0),by-5*k,4*k,4*k,RD[2]); R(g,x+5*k*f-(f<0?4*k:0),by-5*k,4*k,1,RD[1]);
  bezL(g,[[x+6*k*f,by-5*k],[x+3*k*f,by-13*k],[nx,ny]],B,Math.max(2,Math.round(3*k))); ell(g,nx+1*k*f,ny-1*k,3.4*k,3*k,B); R(g,nx+1*k*f,ny-2*k,1,1,'#e8e8f4');
  line(g,nx+3*k*f,ny,nx+16*k*f,ny+3*k,'#2a2a30',Math.max(1,Math.round(2*k))); line(g,nx+3*k*f,ny+1,nx+15*k*f,ny+4*k,'#121218',1); }
function tuiuiuVoo(g,x,y,k,s){ const W0='#f0ece4', B='#16161e', w=32*k, fl=Math.sin(s*3)*.5;
  for(const sd of [-1,1]){ const P=[[x,y],[x+sd*w*.5,y-6*k-fl*8*k],[x+sd*w,y-2*k-fl*10*k],[x+sd*w*.9,y+3*k],[x+sd*w*.3,y+3*k]]; poly(g,P,W0); poly(g,[[x+sd*w*.62,y-4*k-fl*9*k],[x+sd*w,y-2*k-fl*10*k],[x+sd*w*.9,y+3*k],[x+sd*w*.6,y+2*k]],B); }
  ell(g,x,y+1*k,6*k,3*k,W0); line(g,x+5*k,y,x+16*k,y-1*k,B,Math.max(1,Math.round(2*k))); R(g,x+5*k,y-1*k,3*k,2*k,'#c82028'); line(g,x+16*k,y-1*k,x+26*k,y,B,1); line(g,x-5*k,y+1*k,x-14*k,y+3*k,B,1); }
function garca(g,x,y,k,s,col){ const W0=rmp(col||'#f6f4ee'), Y='#e8b830'; line(g,x,y,x,y-16*k,'#2a2a30',1); line(g,x+2*k,y,x+2*k,y-16*k,'#2a2a30',1);
  ell(g,x,y-20*k,6*k,4*k,W0[3]); ell(g,x-1,y-21*k,5*k,3*k,W0[1]); bezL(g,[[x+4*k,y-22*k],[x+1*k,y-30*k],[x+5*k,y-36*k]],W0[2],Math.max(1,Math.round(1.6*k))); ell(g,x+6*k,y-37*k,2.4*k,2*k,W0[1]);
  if(col) { line(g,x+7*k,y-37*k,x+14*k,y-36*k,'#c8b8a0',Math.max(1,Math.round(1.6*k))); ell(g,x+14*k,y-36*k,2*k,1.4*k,'#c8b8a0'); } else line(g,x+7*k,y-37*k,x+14*k,y-36*k,Y,1); }
function jacare(g,x,y,k,s,o){ o=o||{}; const c=rmp('#5f6a3a'), f=o.f||1, L=70*k; // y = linha do chão/da água
  if(o.boia){ ell(g,x,y,L*.42,3*k,c[4]); for(let i=0;i<7;i++) R(g,x-L*.3+i*L*.09,y-2*k-(i%2)*k,3*k,2*k,c[3]); ell(g,x+L*.42*f,y-1*k,8*k,3*k,c[3]); ell(g,x+L*.34*f,y-3*k,2.4*k,2.4*k,c[2]); R(g,x+L*.34*f-1,y-4*k,2,1,'#c9a43a'); R(g,x+L*.5*f,y-2*k,2,1,c[4]); return; }
  ell(g,x,y-4*k,L*.34,6*k,c[4]); ell(g,x-1,y-6*k,L*.3,4.5*k,c[3]); for(let i=0;i<9;i++) R(g,x-L*.28+i*L*.07,y-10*k-(i%2),3*k,2*k,c[2]);
  poly(g,[[x-L*.3*f,y-6*k],[x-L*.75*f,y-2*k],[x-L*.3*f,y-1*k]],c[4]); poly(g,[[x-L*.3*f,y-8*k],[x-L*.7*f,y-3*k],[x-L*.3*f,y-4*k]],c[3]);
  const hx0=x+L*.32*f; if(o.boca){ poly(g,[[hx0,y-6*k],[hx0+24*k*f,y-12*k],[hx0+26*k*f,y-9*k],[hx0+4*k*f,y-4*k]],c[3]); poly(g,[[hx0,y-3*k],[hx0+24*k*f,y-1*k],[hx0+22*k*f,y+1*k],[hx0,y]],c[4]); poly(g,[[hx0+4*k*f,y-4*k],[hx0+22*k*f,y-8*k],[hx0+21*k*f,y-1*k],[hx0+4*k*f,y-2*k]],'#d98a7a'); for(let i=0;i<6;i++) R(g,hx0+(6+i*3)*k*f,y-7*k+i*.6*k,1,2,'#f0ead0'); }
  else { poly(g,[[hx0,y-8*k],[hx0+24*k*f,y-5*k],[hx0+24*k*f,y-1*k],[hx0,y-1*k]],c[3]); R(g,hx0,y-3*k,22*k*f,1,c[5]); }
  ell(g,hx0+4*k*f,y-9*k,2.4*k,2*k,c[2]); R(g,hx0+4*k*f,y-10*k,1,1,'#c9a43a'); for(const lx of [-.2,.2]) R(g,x+L*lx,y-2*k,4*k,3*k,c[4]); R(g,x-L*.3,y-1,L*.6,1,c[5]); }
function gado(g,x,y,k,s,o){ o=o||{}; const c=rmp(o.col||(hsh(s)>.8?'#b89a7a':'#e4e0d6')), f=o.f||(hsh(s*3)>.5?1:-1), dw=34*k; // nelore branco de cupim
  for(const lx of [-.7,-.45,.5,.75]) { R(g,x+lx*dw-1.5*k,y-16*k,3*k,16*k,lx<0?c[4]:c[3]); R(g,x+lx*dw-1.5*k,y-2*k,3*k,2*k,'#2a2224'); }
  ell(g,x,y-22*k,dw,9*k,c[4]); ell(g,x-1,y-24*k,dw-2,7*k,c[2]); ell(g,x-dw*.2,y-27*k,dw*.6,3*k,c[1]); ell(g,x+dw*.55*f,y-31*k,7*k,5*k,c[2]); R(g,x+dw*.4*f-(f<0?6*k:0),y-30*k,6*k,2*k,c[1]);
  R(g,x,y-14*k,dw*.6*f,3*k,c[4]); line(g,x-dw*f,y-24*k,x-(dw+3*k)*f,y-12*k,c[3],1);
  const hx0=x+dw*1.05*f, hy=y-(o.pasta?14:24)*k; poly(g,[[x+dw*.75*f,y-28*k],[hx0,hy-4*k],[hx0+8*k*f,hy+2*k],[hx0+2*k*f,hy+6*k],[x+dw*.7*f,y-18*k]],c[3]); ell(g,hx0+5*k*f,hy+3*k,4*k,3*k,c[3]); R(g,hx0+7*k*f,hy+4*k,2*k,2*k,'#3a2a2a');
  R(g,hx0-2*k*f,hy-5*k,2*k,4*k,c[5]); R(g,hx0+1*k*f,hy-6*k,3*k*f,2*k,'#d8d0c0'); R(g,hx0+1*k*f,hy+1*k,1,1,'#120a10'); }
function cavalo(g,x,y,k,s){ const c=rmp(pick(['#8a5a34','#5a3a2a','#c8b8a0'],hsh(s))), f=hsh(s*3)>.5?1:-1, dw=30*k;
  for(const lx of [-.7,-.5,.55,.75]) R(g,x+lx*dw-1.2*k,y-22*k,2.4*k,22*k,lx<0?c[4]:c[3]); ell(g,x,y-28*k,dw,8*k,c[3]); ell(g,x-1,y-30*k,dw-2,6*k,c[2]);
  poly(g,[[x+dw*.7*f,y-32*k],[x+dw*1.05*f,y-48*k],[x+dw*1.25*f,y-46*k],[x+dw*.95*f,y-26*k]],c[3]); poly(g,[[x+dw*1.05*f,y-48*k],[x+dw*1.45*f,y-38*k],[x+dw*1.35*f,y-35*k],[x+dw*1.15*f,y-44*k]],c[3]);
  line(g,x+dw*.85*f,y-34*k,x+dw*1.05*f,y-49*k,c[5],Math.max(1,Math.round(2*k))); line(g,x-dw*f,y-30*k,x-dw*1.15*f,y-14*k,c[5],Math.max(1,Math.round(2*k))); }
function cervo(g,x,y,k,s,agua){ const c=rmp('#a85a2e'), f=hsh(s)>.5?1:-1, dw=22*k; // cervo-do-pantanal (y = linha d'água se agua)
  if(!agua) for(const lx of [-.6,.6]) R(g,x+lx*dw-1,y-22*k,2*k,22*k,'#1a1410');
  ell(g,x,y-26*k,dw,7*k,c[3]); ell(g,x-1,y-28*k,dw-2,5*k,c[2]); poly(g,[[x+dw*.7*f,y-30*k],[x+dw*.95*f,y-44*k],[x+dw*1.1*f,y-42*k],[x+dw*.95*f,y-26*k]],c[3]);
  ell(g,x+dw*1.15*f,y-44*k,5*k,3*k,c[3]); R(g,x+dw*1.35*f,y-44*k,2,2,'#1a1410'); R(g,x+dw*1.1*f,y-45*k,2*k,1,'#e8e0d0');
  for(const sd of [-1,1]){ const ax=x+dw*1.02*f+sd*2; line(g,ax,y-47*k,ax+sd*6*k,y-58*k,'#c8b090',1); line(g,ax+sd*3*k,y-52*k,ax+sd*9*k,y-54*k,'#c8b090',1); }
  if(agua){ R(g,x-dw-3,y-1,dw*2+6,2,'#d8e8f0'); R(g,x-dw*.6,y+2,dw*1.2,1,'#a8c0d0'); } }
function capivara(g,x,y,k,s){ const c=rmp('#7a5a3a'), f=hsh(s)>.5?1:-1; ell(g,x,y-8*k,14*k,7*k,c[4]); ell(g,x-1,y-9*k,13*k,6*k,c[2]); ell(g,x-3*k,y-12*k,7*k,2*k,c[1]);
  ell(g,x+13*k*f,y-11*k,6*k,5*k,c[2]); R(g,x+17*k*f,y-12*k,1,1,'#1a1010'); R(g,x+10*k*f,y-16*k,2*k,2*k,c[4]); for(const lx of [-8,6]) R(g,x+lx*k,y-3*k,3*k,3*k,c[4]); }
function arara(g,x,y,k,s){ const c=rmp('#2a3fa8'); line(g,x,y,x-16*k,y+5*k,c[3],Math.max(1,Math.round(2*k))); for(const sd of [-1,1]) poly(g,[[x,y],[x+5*k,y-sd*12*k],[x+9*k,y-sd*10*k],[x+4*k,y]],c[2]); ell(g,x+4*k,y,5*k,2.4*k,c[2]); ell(g,x+9*k,y-1,2.4*k,2.4*k,c[1]); R(g,x+10*k,y-1,2,2,'#f0c820'); }
function passaros(g,x,y,n,s,col){ for(let i=0;i<n;i++){ const px=x+(hsh(s+i)-.3)*120, py=y+(hsh(s*3+i)-.5)*40, w=3+hsh(i)*3; line(g,px-w,py-2,px,py,col,1); line(g,px,py,px+w,py-2,col,1); } }
function colhereiro(g,x,y,k,s){ garca(g,x,y,k,s,'#f0a0b8'); }
function sucuri(g,x,y,k,s){ const c=rmp('#c9b45a'); for(let i=0;i<3;i++){ const rx=(22-i*6)*k, ry=(6-i*1.2)*k; ell(g,x,y-i*4*k,rx,ry,c[4]); ell(g,x,y-i*4*k-1,rx-2,ry-1.5,c[2]); for(let j=0;j<8;j++){ const a=j/8*6.28; R(g,x+Math.cos(a)*rx*.8,y-i*4*k+Math.sin(a)*ry*.6-1,3*k,2*k,'#4a3a1a'); } }
  ell(g,x+10*k,y-14*k,5*k,3*k,c[2]); R(g,x+12*k,y-15*k,1,1,'#1a1208'); line(g,x+9*k,y-15*k,x+14*k,y-15*k,'#4a3a1a',1); }
function ariranhaSil(g,x,y,k){ const c=rmp('#4a3022'); ell(g,x,y-10*k,4*k,10*k,c[3]); ell(g,x,y-21*k,4*k,3.4*k,c[2]); R(g,x-2*k,y-14*k,4*k,4*k,'#e8dcc0'); R(g,x+1*k,y-22*k,1,1,'#1a1210'); R(g,x-6*k,y,12*k,1,'#d8e8f0'); }

/* =====================================================================
   CONSTRUÇÕES E OBJETOS
   ===================================================================== */
const WOOD=rmp('#8a6a44'), WOODG=rmp('#9a8e7a'), CAL=rmp('#ece4d2'), TELHA=rmp('#b8603a'), FERR=rmp('#7a7a86');
function tabua(g,x,y,w,h,c,s){ R(g,x,y,w,h,c[2]); R(g,x,y,w,1,c[1]); R(g,x,y+h-1,w,1,c[4]); for(let i=0;i<w/14;i++) if(hsh(s+i)>.5) R(g,x+i*14+hsh(i+s)*8,y+1+hsh(s*i)*(h-3),5+hsh(i)*8,1,c[3]); if(hsh(s*3)>.7) ell(g,x+hsh(s)*w,y+h/2,2,1,c[4]); }
function mourao(g,x,yb,h,s,c){ c=c||WOODG; const w=7+Math.round(hsh(s)*3); R(g,x-w/2-1,yb-h-1,w+2,h+1,c[5]); R(g,x-w/2,yb-h,w,h,c[3]); R(g,x-w/2,yb-h,2,h,c[1]); R(g,x+w/2-2,yb-h,2,h,c[4]); R(g,x-w/2,yb-h,w,2,c[2]);
  for(let y=yb-h+6;y<yb;y+=7) if(hsh(s+y)>.55) R(g,x-w/2+2,y,w-4,1,c[4]); R(g,x-w/2-2,yb-2,w+4,3,'#2a2018'); }
function cerca(g,a,b,yb,s,o){ o=o||{}; const step=o.step||70, h=o.h||46, c=o.c||WOODG; for(let x=Math.floor(a/step)*step;x<b+step;x+=step){ mourao(g,x,yb,h+(hsh(x*.3)-.5)*6,x+s,c);
    for(let k=0;k<(o.fios||4);k++){ const y=yb-h+6+k*(h-12)/((o.fios||4)-1); sag(g,x+4,y,x+step-4,y+(hsh(x+k)-.5)*2,1+hsh(x*.7+k)*2,'#5a5a66',1); if(!o.liso) for(let xx=x+12;xx<x+step-6;xx+=12) R(g,xx,y+1,2,1,'#3a3a44'); } } }
function cercaBranca(g,a,b,yb,s){ const c=rmp('#ecebe4'); for(let x=Math.floor(a/90)*90;x<b+90;x+=90){ R(g,x-4,yb-44,8,44,c[3]); R(g,x-4,yb-44,2,44,c[1]); R(g,x+2,yb-44,2,44,c[4]); R(g,x-5,yb-46,10,3,c[2]);
    for(const yy of [yb-38,yb-24,yb-12]){ R(g,x+4,yy,86,5,c[2]); R(g,x+4,yy,86,1,c[0]); R(g,x+4,yy+4,86,1,c[4]); } } }
function poste(g,x,yb,h,s){ const c=rmp('#6a5a4a'); R(g,x-4,yb-h,8,h,c[3]); R(g,x-4,yb-h,2,h,c[1]); R(g,x+2,yb-h,2,h,c[4]); R(g,x-22,yb-h+12,44,5,c[3]); R(g,x-22,yb-h+12,44,1,c[1]); for(const dx of [-18,-6,6,18]) { R(g,x+dx-1,yb-h+8,3,4,'#e8e4dc'); } line(g,x-14,yb-h+17,x,yb-h+30,c[4],2); line(g,x+14,yb-h+17,x,yb-h+30,c[4],2); }
function fiosPoste(g,a,b,yb,h,step){ for(let x=Math.floor(a/step)*step;x<b+step;x+=step) for(const dx of [-18,-6,6,18]) sag(g,x+dx,yb-h+8,x+step+dx,yb-h+8,16,'#2a2630',1); }
function placaMadeira(g,x,y,lines,s,o){ o=o||{}; const sc=o.s||2, w=Math.max(...lines.map(t=>tw(t,sc)))+20, h=lines.length*(7*sc+5)+10, c=rmp(o.col||'#6a4a2e');
  if(o.postes!==false){ for(const px of [x+8,x+w-12]) mourao(g,px+2,o.yb||y+h+60,(o.yb||y+h+60)-y+4,s+px,WOOD); }
  R(g,x-2,y-2,w+4,h+4,c[5]); R(g,x,y,w,h,c[3]); for(let yy=y+2;yy<y+h-2;yy+=7) R(g,x+2,yy,w-4,1,c[4]); R(g,x,y,w,2,c[1]); R(g,x,y,2,h,c[2]); R(g,x+w-2,y,2,h,c[4]);
  lines.forEach((t,i)=>{ const sc2=i===0?sc:Math.max(1,sc-1), tx=x+(w-tw(t,sc2))/2, ty=y+6+i*(7*sc+5)+(i?Math.round(sc/2):0); text(g,t,tx+1,ty+1,sc2,c[5]); text(g,t,tx,ty,sc2,o.fg||'#f0e8d4'); }); return w; }
function placaTur(g,x,yb,lines){ const c=rmp('#8a4a26'), w=Math.max(...lines.map(t=>tw(t,1)))+14, h=lines.length*10+10; R(g,x+w/2-2,yb-h-50,4,h+50,'#e8e4dc'); R(g,x+w/2+1,yb-h-50,1,h+50,'#a8a4a0');
  R(g,x-1,yb-h-61,w+2,h+2,'#f0ece4'); R(g,x,yb-h-60,w,h,c[2]); R(g,x,yb-h-60,w,1,c[1]); lines.forEach((t,i)=>text(g,t,x+(w-tw(t,1))/2,yb-h-55+i*10,1,'#f8f0e0')); }
function portal(g,x,yb,s){ const c=rmp('#7a5a3a'), w=430, h=230; // portal de tronco da estrada-parque (placa pendurada)
  for(const px of [x,x+w]){ R(g,px-11,yb-h,22,h,c[4]); R(g,px-10,yb-h,20,h,c[3]); R(g,px-10,yb-h,6,h,c[2]); R(g,px-10,yb-h,2,h,c[1]); R(g,px+5,yb-h,5,h,c[4]); for(let y=yb-h;y<yb;y+=9) if(hsh(px+y)>.6) R(g,px-6,y,10,2,c[4]); R(g,px-14,yb-4,28,6,'#2a2018'); }
  R(g,x-30,yb-h-14,w+60,18,c[4]); R(g,x-30,yb-h-14,w+60,14,c[3]); R(g,x-30,yb-h-14,w+60,3,c[1]); for(let xx=x-26;xx<x+w+26;xx+=17) R(g,xx,yb-h-9,9,2,c[4]);
  placaMadeira(g,x+w/2-60,yb-h-34,['ESTRADA PARQUE'],s,{s:1,postes:false,col:'#5a3e26'});
  for(const px of [x+60,x+w-60]){ R(g,px,yb-h+4,2,22,'#3a3030'); }
  placaMadeira(g,x+w/2-144,yb-h+24,['TRANSPANTANEIRA','PANTANAL - MATO GROSSO'],s+1,{s:3,postes:false,col:'#4a3020'});
  for(const [px,t] of [[x-118,['HERE BEGINS','THE PANTANAL']],[x+w+14,['AQUI COMECA','O PANTANAL']]]){ const c2=rmp('#5a3e28'); R(g,px,yb-h+30,104,30,c2[3]); R(g,px,yb-h+30,104,1,c2[1]); text(g,t[0],px+52-tw(t[0],1)/2,yb-h+36,1,'#efe6d0'); text(g,t[1],px+52-tw(t[1],1)/2,yb-h+47,1,'#efe6d0'); R(g,px+50,yb-h+60,4,h-60,c2[4]); } }
// ponte de madeira da Transpantaneira (vigas, tabuleiro e pilares em X) vista de lado — k = escala de distância
function ponteMadeira(g,a,b,yd,k,s,o){ o=o||{}; const c=rmpH('#6a5236',o.hz||0), cc=rmpH('#8a6e4a',o.hz||0), step=Math.round(90*k), ph=Math.round((o.pil||46)*k);
  for(let x=Math.floor(a/step)*step;x<b+step;x+=step){ if(o.quebra&&o.quebra(x)) continue; for(const dx of [-8*k,8*k]){ R(g,x+dx-3*k,yd,6*k,ph,c[4]); R(g,x+dx-3*k,yd,2*k,ph,c[3]); }
    line(g,x-8*k,yd+4*k,x+8*k,yd+ph-2*k,c[4],Math.max(1,Math.round(2*k))); line(g,x+8*k,yd+4*k,x-8*k,yd+ph-2*k,c[3],Math.max(1,Math.round(2*k))); }
  const seg=(x0,x1,dy)=>{ R(g,x0,yd-4*k+dy,x1-x0,9*k,c[3]); R(g,x0,yd-4*k+dy,x1-x0,2*k,cc[1]); R(g,x0,yd+3*k+dy,x1-x0,2*k,c[5]);
    for(let x=Math.ceil(x0/(9*k))*9*k;x<x1;x+=9*k) R(g,x,yd-4*k+dy,1,3*k,c[4]); for(let x=Math.floor(x0/(45*k))*45*k;x<x1;x+=45*k){ if(x<x0) continue; R(g,x,yd-18*k+dy,3*k,14*k,cc[3]); R(g,x,yd-18*k+dy,1,14*k,cc[1]); } R(g,x0,yd-18*k+dy,x1-x0,2*k,cc[2]); R(g,x0,yd-11*k+dy,x1-x0,1,cc[3]); };
  if(o.quebra){ let x=a; while(x<b){ let x1=x; while(x1<b&&!o.quebra(x1)) x1+=step; if(x1>x) seg(x,x1,0); x=x1+step; } } else seg(a,b,0); }
function sede(g,x,w,yb,s){ const top=yb-120, eave=yb-96, c=CAL, t=TELHA, wd=WOOD; // casa-sede térrea caiada, telha de barro, varanda corrida de esteios
  poly(g,[[x+30,top+22],[x+120,top-30],[x+w-120,top-30],[x+w-30,top+22]],t[4]);
  for(let y=top-28;y<top+22;y+=5){ const u=(y-(top-30))/52, xa=x+120-90*u, xb=x+w-120+90*u; for(let xx=xa;xx<xb;xx+=8){ R(g,xx,y,7,5,t[3]); R(g,xx+1,y,5,4,hsh(xx*.3+y)>.88?t[1]:t[2]); R(g,xx+1,y,5,1,t[1]); } }
  R(g,x+120,top-32,w-240,4,t[1]); for(let k=0;k<5;k++) blob(g,x+150+hsh(s+k)*(w-300),top-20+hsh(k*3)*30,10+hsh(k)*10,4,'#55703c');
  R(g,x+20,top+22,w-40,yb-top-22,c[2]); R(g,x+20,top+22,w-40,8,c[4]); for(let i=0;i<12;i++){ const bw=30+hsh(s+i*3.1)*60; blob(g,x+30+hsh(s+i*7.7)*(w-100),top+40+hsh(s+i*9.9)*40,bw,10+hsh(i)*16,hsh(s+i*2.2)>.6?c[1]:c[3]); }
  R(g,x+20,yb-22,w-40,22,mix(c[3],'#8a6a4a',.5)); R(g,x+20,yb-22,w-40,2,c[4]); for(let xx=x+24;xx<x+w-30;xx+=26) if(hsh(xx)>.5) R(g,xx,yb-20,10+hsh(xx*3)*16,14,mix(c[3],'#6a4a30',.6));
  const nw=Math.floor((w-120)/120); for(let i=0;i<nw;i++){ const wx=x+70+i*(w-140)/nw+((w-140)/nw-44)/2, door=i===Math.floor(nw/2);
    if(door){ R(g,wx-2,yb-82,48,82,c[4]); const d=rmp('#3a6a8a'); R(g,wx,yb-80,44,80,d[2]); R(g,wx+21,yb-80,2,80,d[4]); for(const dy of [8,44]){ R(g,wx+4,yb-80+dy,14,26,d[3]); R(g,wx+26,yb-80+dy,14,26,d[3]); } R(g,wx,yb-80,44,2,d[1]); }
    else { R(g,wx-3,yb-78,50,48,c[4]); R(g,wx,yb-76,44,42,'#1c1626'); const lit=hsh(s+i*3)>.45, sh=rmp(pick(['#3a6a8a','#3a7a5a'],hsh(s))); if(lit){ emitW(g,G=>{ R(G,wx,yb-76,44,42,'#e09848'); R(G,wx+4,yb-72,36,18,'#f4c070'); }); pushWin(wx,yb-76,44,42); glow(g,wx+22,yb-56,46,'#ffb060',.04,3,30); }
      R(g,wx-14,yb-78,14,46,sh[2]); R(g,wx+44,yb-78,14,46,sh[3]); for(let yy=yb-74;yy<yb-34;yy+=4){ R(g,wx-12,yy,10,1,sh[4]); R(g,wx+46,yy,10,1,sh[4]); } R(g,wx-4,yb-30,52,4,c[1]); } }
  // varanda: piso de tábua, esteios, beiral avançado e rede
  R(g,x,eave-6,w,8,t[3]); R(g,x,eave-6,w,2,t[1]); for(let xx=x;xx<x+w;xx+=8) { ell(g,xx+4,eave+2,4,2,t[3]); R(g,xx+3,eave+2,2,1,t[4]); }
  shade(g,x+20,eave+4,w-40,40,'#1a0c30',.32);
  for(let xx=x+12;xx<x+w;xx+=Math.round((w-24)/8)){ R(g,xx-4,eave+3,8,yb-eave-3,wd[3]); R(g,xx-4,eave+3,2,yb-eave-3,wd[1]); R(g,xx+2,eave+3,2,yb-eave-3,wd[4]); }
  R(g,x,yb-4,w,6,wd[2]); R(g,x,yb-4,w,1,wd[1]); R(g,x,yb+1,w,2,wd[5]);
  const hx0=x+w*.22; sag(g,hx0,eave+16,hx0+110,eave+16,26,'#c84a3a',3); sag(g,hx0,eave+19,hx0+110,eave+19,24,'#e8b84a',2);
  if(hsh(s*3)>-1){ R(g,x+w*.7,eave+6,2,10,'#3a3030'); R(g,x+w*.7-5,eave+16,12,14,'#3a3a44'); emitW(g,G=>{ R(G,x+w*.7-3,eave+18,8,10,'#ffe0a0'); }); glow(g,x+w*.7+1,eave+24,60,'#ffb060',.06,5); reg(LAMPS,{x:(x+w*.7+1)/RS,y:(eave+24)/RS,r:18}); }
  const pl=placaMadeira(g,x+w/2-80,top-4,['FAZENDA LUA CHEIA'],s,{s:1,postes:false}); return pl; }
function porteira(g,x,yb,s){ const c=WOOD, cg=WOODG; // dois troncos grossos + folha de tábuas com mão-francesa
  for(const px of [x,x+190]){ R(g,px-12,yb-120,24,120,cg[4]); R(g,px-11,yb-120,22,120,cg[3]); R(g,px-11,yb-120,6,120,cg[1]); R(g,px+5,yb-120,6,120,cg[4]); ell(g,px,yb-120,11,4,cg[2]); ell(g,px,yb-120,7,2,cg[4]); }
  const gx=x+16, gw=168, gy=yb-82; for(let i=0;i<5;i++) tabua(g,gx,gy+i*16,gw,8,c,s+i); for(const dx of [0,gw-8]) R(g,gx+dx,gy-4,8,80,c[3]);
  line(g,gx+6,gy+74,gx+gw-8,gy+2,c[3],6); line(g,gx+6,gy+73,gx+gw-8,gy+1,c[1],1); R(g,gx+gw-2,gy+30,10,8,FERR[3]); R(g,x-12,yb-2,24,4,'#2a2018'); }
function mangueiraArv(g,x,yb,k,s){ const tr=rmp('#4a3a30'), c=rmp('#2e6a3a'); tronco(g,x,yb,110*k,24*k,16*k,tr,s,10*k);
  for(const [dx,dy] of [[-80,-70],[70,-80],[-30,-110],[40,-40]]) galho(g,x,yb-90*k,x+dx*k,yb-90*k+dy*k,Math.round(8*k),tr);
  foliage(g,x-90*k,yb-170*k,90*k,60*k,c,s,8*k,15*k); foliage(g,x+95*k,yb-175*k,85*k,58*k,c,s+5,8*k,15*k); foliage(g,x,yb-230*k,120*k,70*k,c,s+9,9*k,17*k);
  for(let i=0;i<10;i++) ell(g,x+(hsh(s+i)-.5)*220*k,yb-140*k-hsh(i*3)*80*k,3*k,4*k,i%2?'#e8a030':'#c86a2a'); }
function joaoBarro(g,x,yb,s){ mourao(g,x,yb,150,s); const c=rmp('#a8703a'); ell(g,x,yb-158,15,11,c[4]); ell(g,x-1,yb-160,13,9,c[2]); ell(g,x-4,yb-163,6,4,c[1]); ell(g,x+5,yb-156,4,4,'#1a1010'); }
function carroca(g,x,yb,s){ const c=WOOD; R(g,x,yb-58,170,10,c[3]); R(g,x,yb-58,170,2,c[1]); for(let i=0;i<3;i++) tabua(g,x,yb-84+i*9,170,7,c,s+i); line(g,x+170,yb-50,x+270,yb-30,c[3],4); line(g,x+170,yb-51,x+270,yb-31,c[1],1);
  for(const wx of [x+50]){ ell(g,wx,yb-30,30,30,c[5]); ell(g,wx,yb-30,27,27,c[3]); ell(g,wx,yb-30,22,22,'#2a2018'); for(let a=0;a<6.28;a+=.52) line(g,wx,yb-30,wx+Math.cos(a)*22,yb-30+Math.sin(a)*22,c[2],2); ell(g,wx,yb-30,5,5,c[1]); } }
function curralCerca(g,a,b,yb,h,s){ const c=rmp('#8a7660'); // mangueira de aroeira: lascas verticais juntas + travessas
  for(let x=Math.floor(a/9)*9;x<b+9;x+=9){ const hh=h+(hsh(x*.7)-.5)*14, w=7+hsh(x)*3; R(g,x,yb-hh,w,hh,c[3]); R(g,x,yb-hh,2,hh,c[1]); R(g,x+w-2,yb-hh,2,hh,c[4]); poly(g,[[x,yb-hh],[x+w/2,yb-hh-4-hsh(x*3)*5],[x+w,yb-hh]],c[2]); if(hsh(x*1.3)>.7) R(g,x+2,yb-hh*.6,w-4,2,c[4]); }
  for(const dy of [.3,.7]) { R(g,a,yb-h*dy-4,b-a,8,c[4]); R(g,a,yb-h*dy-4,b-a,2,c[2]); } R(g,a,yb-2,b-a,3,'#2a2018'); }
function troncoContencao(g,x,yb,s){ const c=rmp('#7a6650'); for(const px of [x,x+60,x+180,x+240]){ R(g,px-6,yb-130,12,130,c[3]); R(g,px-6,yb-130,3,130,c[1]); R(g,px+3,yb-130,3,130,c[4]); }
  R(g,x-8,yb-136,256,10,c[3]); R(g,x-8,yb-136,256,2,c[1]); for(let i=0;i<5;i++) tabua(g,x+6,yb-112+i*20,234,9,rmp('#8a7458'),s+i); R(g,x+100,yb-150,40,16,c[4]); R(g,x+104,yb-148,32,12,c[2]); }
function poco(g,x,yb,s){ const b=rmp('#a8583e'), c=WOOD; ell(g,x,yb-36,44,10,b[4]); R(g,x-44,yb-36,88,36,b[3]); for(let y=yb-34;y<yb;y+=6) for(let xx=x-44+((y/6)%2)*6;xx<x+44;xx+=12) R(g,xx+1,y+1,10,4,hsh(xx+y)>.6?b[1]:b[2]); ell(g,x,yb-36,40,8,'#140c18'); R(g,x-44,yb-38,88,3,b[1]);
  for(const px of [x-38,x+38]){ R(g,px-3,yb-120,6,84,c[3]); R(g,px-3,yb-120,2,84,c[1]); } R(g,x-40,yb-96,80,6,c[3]); R(g,x-40,yb-96,80,2,c[1]); line(g,x,yb-93,x,yb-60,'#5a5a66',1); R(g,x-7,yb-62,14,14,FERR[3]); R(g,x-7,yb-62,14,2,FERR[1]);
  poly(g,[[x-56,yb-118],[x,yb-150],[x+56,yb-118]],TELHA[3]); poly(g,[[x-56,yb-118],[x,yb-150],[x,yb-118]],TELHA[2]); R(g,x-56,yb-120,112,4,TELHA[4]); }
function couro(g,x,yb,s){ const c=WOOD, l=rmp('#b88a5a'); R(g,x-50,yb-140,6,140,c[3]); R(g,x+50,yb-140,6,140,c[3]); R(g,x-52,yb-140,110,6,c[3]); R(g,x-52,yb-140,110,1,c[1]);
  const P=[[x-36,yb-128],[x,yb-134],[x+40,yb-126],[x+44,yb-90],[x+30,yb-60],[x+4,yb-54],[x-30,yb-62],[x-42,yb-96]]; poly(g,P,l[3]); poly(g,P.map(p=>[x+(p[0]-x)*.8,yb-94+(p[1]-yb+94)*.8]),l[2]); ell(g,x-10,yb-104,10,8,l[1]); for(let i=0;i<8;i++){ line(g,P[i][0],P[i][1],P[i][0]+(P[i][0]-x)*.18,P[i][1]+(P[i][1]+94-yb)*.18,'#3a2a20',1); } }
function berranteLaco(g,x,yb,s){ mourao(g,x,yb,150,s,WOOD); const b=rmp('#d8c8a0'); bezL(g,[[x+4,yb-118],[x+30,yb-104],[x+40,yb-80]],b[2],5); bezL(g,[[x+4,yb-120],[x+30,yb-106],[x+40,yb-82]],b[0],1); for(const t of [.3,.7]) R(g,x+8+t*30,yb-114+t*30,5,3,FERR[2]);
  const l=rmp('#b08a5a'); for(let i=0;i<3;i++){ ell(g,x-6,yb-90+i*3,16-i*2,20-i*2,l[4]); ell(g,x-6,yb-90+i*3,13-i*2,17-i*2,'#00000000'); } for(let a=0;a<6.28;a+=.1){ R(g,x-6+Math.cos(a)*14,yb-88+Math.sin(a)*18,2,2,l[2]); R(g,x-6+Math.cos(a)*11,yb-88+Math.sin(a)*15,2,2,l[3]); } }
function galpao(g,x,w,yb,s){ const c=WOOD; poly(g,[[x-20,yb-140],[x+w+20,yb-140],[x+w+30,yb-110],[x-30,yb-110]],TELHA[3]); for(let y=yb-138;y<yb-112;y+=5) for(let xx=x-24;xx<x+w+24;xx+=8) { R(g,xx,y,7,4,TELHA[2]); R(g,xx,y,7,1,TELHA[1]); } R(g,x-30,yb-112,w+60,4,TELHA[4]);
  R(g,x,yb-108,w,108,'#1c1428'); shade(g,x,yb-108,w,108,'#000',0); for(let xx=x;xx<=x+w;xx+=w/4){ R(g,xx-5,yb-108,10,108,c[3]); R(g,xx-5,yb-108,3,108,c[1]); }
  const f=rmp('#d8b860'); for(let i=0;i<7;i++){ const fx=x+20+(i%4)*50, fy=yb-28-Math.floor(i/4)*26; R(g,fx,fy,46,26,f[3]); R(g,fx,fy,46,3,f[1]); for(let j=0;j<6;j++) R(g,fx+2,fy+5+j*3,42,1,j%2?f[2]:f[4]); R(g,fx+14,fy,2,26,'#7a5a3a'); R(g,fx+30,fy,2,26,'#7a5a3a'); } }
function cocho(g,x,yb,w,s,sal){ const c=WOOD; R(g,x,yb-26,w,20,c[4]); R(g,x+2,yb-26,w-4,16,c[2]); R(g,x+2,yb-26,w-4,2,c[1]); if(sal){ R(g,x+4,yb-28,w-8,5,'#f0f0f4'); R(g,x+4,yb-28,w-8,1,'#ffffff'); } for(const lx of [x+6,x+w-12]) R(g,lx,yb-8,6,8,c[4]); }
function chalana(g,x,yb,s){ const L=560, w2=rmp('#eeeae0'), bl=rmp('#2a5a9a'), rd=rmp('#c83a2a'), wd=WOOD; // barco-hotel de casco chato e dois conveses
  poly(g,[[x,yb-40],[x+L,yb-40],[x+L+40,yb-60],[x+L+30,yb-12],[x+L-10,yb],[x+20,yb],[x-6,yb-20]],bl[4]); poly(g,[[x,yb-40],[x+L,yb-40],[x+L+40,yb-60],[x+L+34,yb-40],[x+L-8,yb-26],[x+10,yb-26]],bl[2]); R(g,x,yb-42,L+36,4,w2[1]); R(g,x+4,yb-30,L,3,rd[2]);
  text(g,'CHALANA PANTANEIRA',x+60,yb-22,1,w2[1]);
  R(g,x+40,yb-110,L-90,70,w2[2]); R(g,x+40,yb-110,L-90,3,w2[0]); for(let i=0;i<8;i++){ const wx=x+60+i*58; R(g,wx,yb-96,40,26,'#1e2638'); if(hsh(s+i)>.6){ emitW(g,G=>R(G,wx,yb-96,40,26,'#e8a050')); pushWin(wx,yb-96,40,26); } R(g,wx,yb-96,40,2,'#4a5a7a'); }
  R(g,x+30,yb-118,L-70,8,bl[2]); R(g,x+30,yb-118,L-70,2,bl[1]); R(g,x+60,yb-170,L-170,52,w2[2]); R(g,x+60,yb-170,L-170,3,w2[0]); for(let i=0;i<6;i++){ const wx=x+80+i*60; R(g,wx,yb-160,42,22,'#1e2638'); R(g,wx,yb-160,42,2,'#4a5a7a'); }
  R(g,x+50,yb-178,L-150,8,bl[3]); R(g,x+50,yb-178,L-150,2,bl[1]); for(let xx=x+56;xx<x+L-100;xx+=14) R(g,xx,yb-196,2,18,w2[3]); R(g,x+56,yb-198,L-160,2,w2[2]);
  R(g,x+L-60,yb-140,40,22,w2[3]); R(g,x+L-50,yb-210,6,70,wd[3]); line(g,x+L-46,yb-208,x+L+30,yb-60,'#4a4a56',1); }
function barco(g,x,yb,s,tuiu){ const m=rmp('#9aa0ac'), L=150; poly(g,[[x,yb-20],[x+L,yb-24],[x+L-10,yb],[x+10,yb]],m[3]); R(g,x,yb-22,L,3,m[1]); poly(g,[[x+L-4,yb-24],[x+L+16,yb-30],[x+L-6,yb-4]],m[2]); R(g,x+20,yb-34,10,12,'#3a3a46'); R(g,x+16,yb-38,18,6,'#2a2a34');
  if(tuiu) tuiuiu(g,x+L+6,yb-28,.9,s,{f:1}); }
function doca(g,a,b,yd,s){ const c=WOOD; for(let x=Math.floor(a/70)*70;x<b+70;x+=70){ R(g,x-5,yd-30,10,90,c[4]); R(g,x-5,yd-30,3,90,c[2]); ell(g,x,yd-30,5,2,c[1]); }
  for(let i=0;i<3;i++) tabua(g,a,yd+i*9,b-a,8,c,s+i*13); R(g,a,yd+27,b-a,4,c[5]); }
function posto(g,x,yb,s){ const c=rmp('#d8d4c8'), r=rmp('#c84a2a'); for(const px of [x+30,x+250]){ R(g,px-6,yb-170,12,170,c[3]); R(g,px-6,yb-170,3,170,c[1]); }
  R(g,x-20,yb-196,320,30,r[3]); R(g,x-20,yb-196,320,4,r[1]); R(g,x-20,yb-170,320,4,r[5]); text(g,'POSTO',x+100,yb-188,3,mix('#f0ece4',r[3],.25)); for(let i=0;i<5;i++) R(g,x+hsh(s+i)*300-20,yb-196+hsh(i)*20,6+hsh(i*3)*10,4,r[4]);
  for(const px of [x+100,x+180]){ R(g,px-12,yb-70,24,70,r[3]); R(g,px-12,yb-70,24,3,r[1]); R(g,px-8,yb-60,16,14,'#2a2834'); R(g,px-8,yb-40,16,4,c[2]); line(g,px+12,yb-50,px+22,yb-20,'#1a1a22',2); R(g,px-14,yb-4,28,4,'#3a3440'); }
  R(g,x+300,yb-110,150,110,c[2]); R(g,x+300,yb-110,150,4,c[0]); R(g,x+320,yb-80,40,50,'#1c1626'); R(g,x+380,yb-90,50,90,'#2a2434'); for(let i=0;i<4;i++) line(g,x+384,yb-86+i*20,x+426,yb-74+i*20,WOOD[3],4);
  R(g,x+296,yb-116,158,8,r[3]); placaMadeira(g,x+306,yb-140,['GASOLINA'],s,{s:1,postes:false,col:'#3a3a46'}); }
function canoa(g,x,yb,s){ const c=rmp('#6a4a30'); ell(g,x+70,yb-8,74,12,c[4]); ell(g,x+70,yb-11,70,9,c[2]); R(g,x+4,yb-12,132,2,c[1]); for(let i=0;i<5;i++) R(g,x+18+i*24,yb-18,2,10,c[3]); R(g,x,yb-2,140,3,'#2a2018'); }
function barcoRemo(g,x,yb,s){ const c=rmp('#3a7a8a'), w=rmp('#e8e4d8'); poly(g,[[x,yb-22],[x+170,yb-22],[x+150,yb],[x+18,yb]],c[3]); R(g,x,yb-24,170,4,w[1]); R(g,x+10,yb-16,150,2,w[3]); for(const bx of [x+50,x+110]) R(g,bx,yb-24,8,10,WOOD[2]); line(g,x+40,yb-30,x-30,yb-4,WOOD[3],3); line(g,x+170,yb-18,x+230,yb+2,'#c8b890',1); }
function ossada(g,x,yb,s){ const b=rmp('#e8e0c8'); ell(g,x,yb-8,14,9,b[3]); ell(g,x-1,yb-10,12,7,b[1]); ell(g,x-4,yb-10,3,3,'#2a2020'); ell(g,x+4,yb-10,3,3,'#2a2020'); R(g,x-3,yb-2,6,6,b[2]); bezL(g,[[x-10,yb-14],[x-26,yb-18],[x-30,yb-30]],b[2],3); bezL(g,[[x+10,yb-14],[x+26,yb-18],[x+30,yb-30]],b[2],3);
  for(let i=0;i<5;i++) bezL(g,[[x+30+i*12,yb-2],[x+34+i*12,yb-18],[x+44+i*12,yb-20]],b[2],2); R(g,x+28,yb-4,64,3,b[3]); }
function esqueletoChalana(g,x,yb,s){ const c=rmp('#5a4a3a'); R(g,x,yb-14,420,8,c[4]); R(g,x,yb-14,420,2,c[2]); for(let i=0;i<14;i++){ const xx=x+12+i*30, h=50+Math.sin(i/13*Math.PI)*40-(hsh(s+i)>.75?30:0); bezL(g,[[xx,yb-10],[xx-6,yb-10-h*.6],[xx+4,yb-10-h]],c[3],5); bezL(g,[[xx+1,yb-10],[xx-5,yb-10-h*.6],[xx+5,yb-10-h]],c[1],1); }
  line(g,x+20,yb-60,x+260,yb-70,c[3],4); line(g,x+300,yb-40,x+410,yb-20,c[3],4); }
function caminhonete(g,x,yb,s){ const c=rmp('#d8c89a'), T='#16121e'; g.save(); g.translate(x+120,yb); g.rotate(-.22); // caída na beira da vala
  poly(g,[[-120,-30],[-118,-70],[-40,-74],[-20,-110],[50,-112],[70,-74],[120,-70],[122,-30]],c[3]); poly(g,[[-118,-70],[-40,-74],[-20,-108],[50,-110],[68,-74],[118,-68],[118,-60],[-118,-62]],c[2]); R(g,-14,-104,28,26,'#1e2434'); R(g,24,-104,22,26,'#1e2434'); R(g,-118,-48,240,6,c[1]);
  for(const wx of [-70,80]){ ell(g,wx,-26,24,24,T); ell(g,wx,-26,12,12,'#6a6a76'); } R(g,90,-56,30,10,'#e8e4c8'); g.restore(); }
function pneuTrator(g,x,yb){ ell(g,x,yb-12,40,14,'#1a1620'); ell(g,x,yb-14,38,12,'#2a2630'); ell(g,x,yb-15,18,5,'#100c16'); for(let a=0;a<6.28;a+=.35) R(g,x+Math.cos(a)*32,yb-14+Math.sin(a)*10,4,2,'#3a3640'); }
function morrariaDist(g,a,b,yb,s,c){ for(let x=a;x<b;x+=2){ const u=(x-a)/(b-a), y=yb-Math.round(Math.sin(u*Math.PI)*60*(1+.3*Math.sin(u*9+s))+lowf(x,0,s)*10); R(g,x,y,2,yb-y,c); } }

/* =====================================================================
   CHÃO JOGÁVEL (y de MB até HH) — tudo ancorado na grade do mundo (sem emenda entre tiles)
   ===================================================================== */

// mancha irregular (polígono de borda ruidosa) com miolo deslocado: variação grande de tom no chão
function mancha(g,x,y,w,h,c1,c2,s){ const P=[]; for(let k=0;k<14;k++){ const a=k/14*6.28, r=.7+hsh(s+k*.9)*.4; P.push([x+Math.cos(a)*w*.5*r,y+Math.sin(a)*h*.5*r]); } poly(g,P,c1); if(c2) poly(g,P.map(p=>[x+(p[0]-x)*.6-w*.08,y+(p[1]-y)*.55-h*.1]),c2); }
function manchas(g,a,b,y0,s,cA,cB,cC,step){ step=(step||70)*1.8; g.save(); for(let x=Math.floor(a/step)*step-step*2;x<b+step*2;x+=step) for(let j=0;j<5;j++){ const y=y0+16+hsh(x*.13+j*7.7+s)*(HH-y0), v=lowf(x,y,s+j); if(Math.abs(v)<.15) continue; const k=pk(y), w=(110+Math.abs(v)*260)*k*(.6+hsh(x+j)), h=(16+Math.abs(v)*30)*k, xx=x+(hsh(x*.7+j)-.5)*step;
    g.globalAlpha=.32; if(v>0) mancha(g,xx,y,w,h,cA,cB,x+j); else mancha(g,xx,y,w,h,cC,null,x*3+j); } g.restore(); }
// textura miúda: grãos claros com brilho e grãos escuros com sombra, escala de perspectiva
function tex(g,a,b,y0,c,s,dens){ for(let y=y0+4;y<HH;){ const k=pk(y), sy=Math.max(3,Math.round(5*k)), st=Math.max(4,Math.round(7*k)); for(let x=Math.floor(a/st)*st;x<b;x+=st){ const v=hsh(x*.731+y*1.37+s); if(v>dens) continue; const w=Math.max(1,Math.round((1+hsh(x*1.1+y)*2.6)*k)), xx=x+Math.round(hsh(x+y*.3)*st*.6);
    if(v<dens*.45){ R(g,xx,y,w,1,c[1]); R(g,xx+1,y-1,Math.max(1,w-2),1,c[0]); } else { R(g,xx,y,w,Math.max(1,Math.round(k)),c[3]); R(g,xx,y+Math.max(1,Math.round(k)),w,1,c[4]); } } y+=sy; } }
function base(g,a,b,y0,cTop,cFar,cNear){ for(const [y,h] of rowsP(y0,HH,2,.04)){ const t=(y-y0)/(HH-y0); R(g,a,y,b-a,h,t<.03?cTop:mix(cFar,cNear,Math.min(1,t*1.4))); } }
function anel(g,x,y,rx,ry,c){ for(let a=-3.1;a<.1;a+=Math.max(.06,2.2/rx)) R(g,x+Math.cos(a)*rx,y+Math.sin(a)*ry,2,1,c); }
function glint(g,x,y,w,c){ R(g,x,y,w,1,c); R(g,x+w*.2,y+2,w*.5,1,c); }
function pocaHole(g,x,y,w,s,c){ const h=Math.max(4,w*.2), P=[]; for(let k=0;k<16;k++){ const a=k/16*6.28, r=.75+hsh(s+k*.7)*.35; P.push([x+Math.cos(a)*w*.5*r,y+Math.sin(a)*h*.5*r]); }
  poly(g,P.map(p=>[x+(p[0]-x)*1.14,y+(p[1]-y)*1.3+1]),c[4]); poly(g,P.map(p=>[x+(p[0]-x)*1.06,y+(p[1]-y)*1.12-1]),c[3]); hole(g,G=>poly(G,P,'#000'));
  R(g,x-w*.3,y-h*.15,w*.35,1,'#e8f0f4'); R(g,x+w*.05,y+h*.12,w*.18,1,'#b8d0dc'); R(g,x-w*.42,y-h*.38,w*.84,1,c[5]); }
function capimBorda(g,a,b,y,s,cols,k){ k=k||.7; for(let x=Math.floor(a/13)*13-13;x<b+13;x+=13){ const v=hsh(x*.37+s); if(v<.25) continue; touceira(g,x+hsh(x)*8,y+hsh(x*3)*6,k*(.6+v*.6),x+s,pick(cols,hsh(x*.91))); } }
function fTerra(g,a,b,y0,s,col){ const c=rmp(col||'#b0703c');
  base(g,a,b,y0,c[4],mix(c[3],c[2],.5),c[2]); manchas(g,a,b,y0,s,mix(c[2],c[1],.5),c[1],mix(c[2],c[3],.7),80); tex(g,a,b,y0,c,s,.32);
  for(const [ty,th] of [[404,12],[476,17]]) for(let x=Math.floor(a/4)*4;x<b;x+=4){ if(hsh(Math.floor(x/48)*.71+ty)>.84) continue; const yy=ty+Math.round(Math.sin(x*.0031+s)*5+Math.sin(x*.011)*2+lowf(x,ty,s)*4), tk=Math.max(4,Math.round(th*(.55+.5*(lowf(x*1.7,ty,s+2)+1)/2)+(hsh(x*.37)-.5)*4)); R(g,x,yy,4,tk,mix(c[2],c[3],.55)); R(g,x,yy+Math.round(hsh(x*.9)*2),4,2,c[4]); R(g,x,yy+tk-2,4,2,mix(c[2],c[1],.6)); if(hsh(x*.13)>.7) R(g,x,yy+3+hsh(x)*(tk-6),3,1,c[4]); if(hsh(x*.29)>.82){ R(g,x+1,yy+tk*.4,3,2,c[1]); R(g,x+1,yy+tk*.4+2,3,1,c[5]); } }
  for(let x=Math.floor(a/7)*7;x<b;x+=7){ const v=hsh(x*.71+s); if(v<.45) continue; const y=y0+10+hsh(x*1.37+s)*(HH-y0-12), k=pk(y), w=Math.max(1,Math.round((1+v*2.6)*k)); R(g,x,y,w+1,Math.max(1,w-1),c[1]); R(g,x+1,y+Math.max(1,w-1),w,1,c[4]); }
  detalhe(g,a,b,y0,s,c,{torrao:.42,gado:.6,racha:.25,capim:['#8aa24a','#9aaa50']}); espalha(g,a,b,y0,s,{pedra:'#a08a74',touc:['#8aa24a','#b8a858'],poca:col||'#b0703c'});
  for(let x=Math.floor(a/260)*260;x<b+260;x+=260){ if(hsh(x*.3+s)<.5) continue; let px=x, py=y0+30+hsh(x)*150; for(let i=0;i<24;i++){ R(g,px,py,2,1,c[4]); px+=3; py+=hsh(x+i)>.5?1:-1; } }
  capimBorda(g,a,b,y0+2,s,['#9aa848','#b8a858','#7a9a44'],.75); R(g,a,y0,b-a,2,c[5]); }
function fLama(g,a,b,y0,s){ const c=rmp('#7a6046');
  base(g,a,b,y0,c[4],c[3],mix(c[3],c[2],.6)); manchas(g,a,b,y0,s+5,c[2],c[1],mix(c[4],'#3a3a30',.3),70); tex(g,a,b,y0,c,s,.3);
  for(let x=Math.floor(a/23)*23;x<b;x+=23){ const v=hsh(x*.53+s); if(v<.3) continue; const y=y0+14+hsh(x*1.9+s)*(HH-y0-20), k=pk(y); for(const d of [0,1]){ const px=x+d*5*k; ell(g,px,y,2.4*k,1.6*k,c[5]); R(g,px-2*k,y-2*k,4*k,1,c[1]); } }
  for(let x=Math.floor(a/11)*11;x<b;x+=11){ const v=hsh(x*.97+s); if(v<.55) continue; const y=y0+8+hsh(x*2.3)*(HH-y0-10), k=pk(y); line(g,x,y,x+(6+v*8)*k,y+(hsh(x)-.5)*4,v>.8?'#e8d080':'#c8a858',1); }
  for(let x=Math.floor(a/700)*700;x<b+700;x+=700){ const v=hsh(x*.13+s); if(v<.35) continue; pocaHole(g,x+hsh(x)*400,y0+70+v*120,90+v*120,x,c); }
  detalhe(g,a,b,y0,s,c,{torrao:.5,gado:.9,racha:.35}); espalha(g,a,b,y0,s,{pedra:'#8a7a68',poca:'#7a6046'});
  capimBorda(g,a,b,y0+2,s,['#8a9a48','#a89a50'],.6); R(g,a,y0,b-a,2,c[5]); }
function fCapim(g,a,b,y0,s,o){ o=o||{}; const c=rmp(o.col||'#7a8a42'), d=rmp('#a8784a');
  base(g,a,b,y0,c[4],c[3],mix(c[3],c[2],.7)); manchas(g,a,b,y0,s+9,c[2],c[1],c[4],80); tex(g,a,b,y0,c,s,.25);
  if(o.trilha!==false) for(let x=Math.floor(a/4)*4;x<b;x+=4){ const yc=430+Math.sin(x*.0021+s)*30, hw=Math.round(34+Math.sin(x*.005)*10+lowf(x,9,s)*7+(hsh(x*.3)-.5)*5); R(g,x,yc-hw,4,hw*2,d[2]); R(g,x,yc-hw,4,2,d[3]); R(g,x,yc+hw-2,4,2,d[1]); if(hsh(x*.7)>.7) R(g,x,yc-hw+4+hsh(x)*(hw*2-8),3,1,d[3]); }
  for(let x=Math.floor(a/60)*60-60;x<b+60;x+=60) for(let y=y0+20;y<HH;y+=26){ const v=lowf(x,y,s+9); if(v>.3) mancha(g,x+hsh(x+y)*30,y,(40+v*60)*pk(y),(8+v*10)*pk(y),mix(c[2],c[1],.45),null,x+y); }
  for(let x=Math.floor(a/6)*6;x<b;x+=6) for(let j=0;j<2;j++){ const v=hsh(x*.61+j*7.3+s); if(v<.35) continue; const y=y0+6+hsh(x*1.13+j*3.1+s)*(HH-y0-8), k=pk(y); if(o.trilha!==false&&Math.abs(y-(430+Math.sin(x*.0021+s)*30))<30) continue;
    const h=(4+v*7)*k, col=v>.85?c[0]:v>.6?c[1]:c[3]; line(g,x,y,x-2*k,y-h,col,1); line(g,x+2,y,x+3*k,y-h*.8,v>.7?c[2]:c[4],1); if(v>.93) R(g,x,y-h-2,2,2,pick(['#f4d040','#f0f0e8','#d878c8'],hsh(x))); }
  detalhe(g,a,b,y0,s,c,{torrao:.18,gado:.5,capim:['#7a9a44','#9aaa50','#6a8a3e']}); espalha(g,a,b,y0,s,{pedra:'#a89a88',touc:['#7a9a44','#9aaa50']});
  capimBorda(g,a,b,y0+2,s,['#7a9a44','#9aaa50'],.75); R(g,a,y0,b-a,2,c[5]); }
// água rasa jogável: o chão é furo (espelho do céu) com fundo de capim submerso, touceiras, aguapé e marolas por cima
function fAgua(g,a,b,y0,s,o){ o=o||{}; const sub=rmp('#3e5a3a'), lm=rmp('#5a5038');
  for(let x=Math.floor(a/52)*52-104;x<b+52;x+=52) for(let y=y0+14;y<HH;y+=22){ const v=lowf(x,y,s+3); if(v<.08) continue; const k=pk(y), w=(30+v*90)*k, h=(4+v*7)*k, xx=x+hsh(x*.7+y)*26;
    mancha(g,xx+w/2,y,w,h*1.6,v>.4?sub[4]:lm[4],v>.4?sub[3]:lm[3],x+y); R(g,xx+w*.3,y-h*.4,w*.3,1,v>.4?sub[2]:lm[2]); }
  for(let x=Math.floor(a/17)*17;x<b;x+=17){ const v=hsh(x*.43+s); if(v<.35) continue; const y=y0+10+hsh(x*1.71+s)*(HH-y0-12), k=pk(y);
    if(v>.78&&o.aguape!==false) aguape(g,x,y,k*.9,x+s); else { touceira(g,x,y,k*(.45+v*.4),x,pick(['#7a9a44','#9aaa50','#6a8a3e'],hsh(x*.3))); R(g,x-6*k,y+1,12*k,1,'#2a3a3a'); R(g,x-4*k,y+3,8*k,1,'#2a3a3a'); }
    anel(g,x,y+1,(10+v*8)*k,(2.4+v)*k,'#d8e8ee'); }
  for(let x=Math.floor(a/9)*9;x<b;x+=9){ const v=hsh(x*.29+s+1); if(v<.55) continue; const y=y0+4+hsh(x*2.1)*(HH-y0-6), k=pk(y); glint(g,x,y,(6+v*14)*k,v>.85?'#f4f8f8':'#b8ccd8'); }
  if(o.vit) for(let x=Math.floor(a/150)*150;x<b+150;x+=150){ const v=hsh(x*.19+s); if(v<.5) continue; const y=y0+30+hsh(x)*170; vitoria(g,x+hsh(x*3)*60,y,pk(y),x); } }
function fMargem(g,a,b,y0,s){ const c=rmp('#5e4a34'), r=rmp('#7a5e40');
  base(g,a,b,y0,c[5],c[3],mix(c[3],c[2],.6)); manchas(g,a,b,y0,s+1,c[2],c[1],mix(c[4],'#2a3a34',.4),70); tex(g,a,b,y0,c,s,.3);
  for(let x=Math.floor(a/180)*180-180;x<b+180;x+=180){ const v=hsh(x*.17+s); if(v<.3) continue; const y=y0+20+v*170, k=pk(y), L=(120+v*120)*k; const P=[[x,y],[x+L*.4,y-14*k*(hsh(x)-.3)],[x+L,y+8*k]];
    bezL(g,P,r[4],Math.max(3,6*k)); bezL(g,P.map(p=>[p[0],p[1]-1]),r[3],Math.max(2,4*k)); bezL(g,P.map(p=>[p[0],p[1]-Math.max(2,3*k)]),r[1],1); }
  for(let x=Math.floor(a/7)*7;x<b;x+=7){ const v=hsh(x*.83+s); if(v<.5) continue; const y=y0+8+hsh(x*1.7+s)*(HH-y0-10), k=pk(y); R(g,x,y,3*k,2*k,pick(['#8a6a2a','#a8803a','#6a5a2a','#4a6a30'],hsh(x*3))); R(g,x,y+2*k,3*k,1,c[5]); }
  for(let x=Math.floor(a/520)*520;x<b+520;x+=520){ const v=hsh(x*.31+s); if(v<.4) continue; pocaHole(g,x+v*200,y0+90+v*110,80+v*90,x,c); }
  detalhe(g,a,b,y0,s,c,{torrao:.35,gado:.3,capim:['#5e8a3e']}); espalha(g,a,b,y0,s,{graveto:true,touc:['#5e8a3e']});
  capimBorda(g,a,b,y0+3,s,['#5e8a3e','#7a9a44'],.8); for(let x=Math.floor(a/40)*40;x<b+40;x+=40) if(hsh(x*.7+s)>.6) aguape(g,x,y0+6,.7,x,false); R(g,a,y0,b-a,2,c[5]); }
function fAreia(g,a,b,y0,s,o){ o=o||{}; const c=rmp(o.col||'#d8c49a'), wt=rmp('#a89a78');
  for(const [y,h] of rowsP(y0,HH,2,.03)){ const t=(y-y0)/(HH-y0); R(g,a,y,b-a,h,t<.1?wt[3]:t<.22?mix(wt[2],c[2],(t-.1)/.12):mix(c[2],c[1],.2+.2*Math.sin(t*4+s))); }
  for(let x=Math.floor(a/6)*6;x<b;x+=6){ for(let y=y0+30;y<HH;y+=Math.round(14*pk(y))){ const yy=y+Math.round(Math.sin(x*.05+y*.3+s)*2*pk(y)); if(hsh(x*.1+y)>.25){ R(g,x,yy,6,1,c[3]); R(g,x,yy+1,6,1,c[0]); } } }
  manchas(g,a,b,y0+20,s+2,c[1],c[0],c[3],90); tex(g,a,b,y0+24,c,s,.2);
  for(let x=Math.floor(a/13)*13;x<b;x+=13){ const v=hsh(x*.77+s); if(v<.7) continue; const y=y0+20+hsh(x*1.3)*(HH-y0-22), k=pk(y); ell(g,x,y,2*k,1.2*k,v>.9?'#f0ece4':c[4]); }
  if(o.pegadas) for(let x=Math.floor(a/30)*30;x<b;x+=30){ const y=440+Math.sin(x*.004+s)*30+(Math.floor(x/30)%2)*10, k=pk(y); ell(g,x,y,3*k,1.6*k,c[4]); R(g,x-2*k,y-2*k,4*k,1,c[0]); }
  if(o.molhada) areiaMolhada(g,a,b,y0,s); detalhe(g,a,b,y0,s,c,{torrao:.15}); if(o.rastros){ const wc=['#d8c8a8','#e0d0b0','#b09a78','#8a7454','#7a6448','#5a4632']; for(let x=Math.floor(a/300)*300-300;x<b+300;x+=300){ const v=hsh(x*.37+s); if(v<.35) continue; rastroJacare(g,x,y0+6,x+(hsh(x*1.9)-.5)*260,y0+90+v*120,wc); } } espalha(g,a,b,y0,s,{graveto:true,pedra:'#c8b8a0'});
  if(o.capim!==false) capimBorda(g,a,b,y0+2,s,['#8aa24a','#a8a858'],.7); R(g,a,y0,b-a,2,wt[5]); }
function fSal(g,a,b,y0,s){ const c=rmp('#d8ccb0'), w=rmp('#f4f2ee'), m=rmp('#b8a480');
  for(const [y,h] of rowsP(y0,HH,2,.03)){ const t=(y-y0)/(HH-y0); R(g,a,y,b-a,h,mix(m[2],c[2],Math.min(1,t*3))); }
  g.save(); g.globalAlpha=.5; manchas(g,a,b,y0,s+7,w[1],w[0],m[3],60); g.restore();
  for(let x=Math.floor(a/120)*120-240;x<b+240;x+=120) for(let j=0;j<4;j++){ const y=y0+14+hsh(x*.31+j*5.3+s)*(HH-y0-20), k=pk(y), v=lowf(x,y,s+11); if(v<-.05) continue; const cw=(80+hsh(x+j)*160)*k, ch=(12+hsh(x*2+j)*20)*k, xx=x+hsh(x*.9+j)*120;
    mancha(g,xx,y+2,cw,ch,w[4],null,x+j); mancha(g,xx,y,cw,ch,w[2],w[1],x+j); for(let i=0;i<4;i++){ const a0=hsh(x+j+i*3)*6.28; line(g,xx,y,xx+Math.cos(a0)*cw*.45,y+Math.sin(a0)*ch*.45,w[3],1); } R(g,xx-cw*.2,y-ch*.3,cw*.25,1,'#ffffff'); }
  for(let x=Math.floor(a/40)*40-40;x<b+40;x+=40) for(let j=0;j<5;j++){ const y=y0+10+hsh(x*.7+j*3.1+s)*(HH-y0-12), k=pk(y); let px=x+hsh(x+j)*40, py=y; for(let i=0;i<5;i++){ const nx=px+(8+hsh(px+i)*10)*k, ny=py+(hsh(py+i)-.5)*8*k; line(g,px,py,nx,ny,m[4],1); px=nx; py=ny; } }
  espalha(g,a,b,y0,s,{pedra:'#c8bca8'});
  capimBorda(g,a,b,y0+2,s,['#a8a858','#c8b060'],.6); R(g,a,y0,b-a,2,m[5]); }
function fFolhas(g,a,b,y0,s){ const c=rmp('#5e4632'), r=rmp('#7a5a3e');
  base(g,a,b,y0,c[5],mix(c[3],c[4],.5),c[3]); manchas(g,a,b,y0,s+4,mix(c[2],'#c8a058',.2),mix(c[1],'#e8c070',.3),mix(c[3],'#3a2a1a',.5),80); tex(g,a,b,y0,c,s,.3);
  for(let x=Math.floor(a/200)*200-200;x<b+200;x+=200){ const v=hsh(x*.29+s); if(v<.35) continue; const y=y0+16+v*180, k=pk(y), L=(140+v*140)*k, P=[[x,y],[x+L*.5,y+(hsh(x)-.5)*30*k],[x+L,y+10*k]];
    bezL(g,P,r[4],Math.max(3,7*k)); bezL(g,P.map(p=>[p[0],p[1]-1]),r[3],Math.max(2,5*k)); bezL(g,P.map(p=>[p[0],p[1]-Math.max(2,4*k)]),r[1],1); }
  for(let x=Math.floor(a/5)*5;x<b;x+=5) for(let j=0;j<2;j++){ const v=hsh(x*.67+j*4.1+s); if(v<.35) continue; const y=y0+6+hsh(x*1.9+j*2.7+s)*(HH-y0-8), k=pk(y), col=pick(['#c87a2a','#e8a838','#a8582a','#7a5a2a','#d8b04a','#8a3a22','#6a7a34'],hsh(x*.13+j));
    const w=Math.max(2,Math.round(3*k)), h=Math.max(1,Math.round(1.6*k)); R(g,x,y,w,h,col); R(g,x+1,y-1,w-1,1,mix(col,'#fff0c4',.3)); R(g,x,y+h,w,1,c[5]); }
  detalhe(g,a,b,y0,s,c,{torrao:.3,racha:.4}); espalha(g,a,b,y0,s,{graveto:true,pedra:'#8a8070'});
  capimBorda(g,a,b,y0+2,s,['#5e7a3a','#6a5a2e'],.6); R(g,a,y0,b-a,2,c[5]); }
function fGuano(g,a,b,y0,s){ const c=rmp('#8a7e66');
  base(g,a,b,y0,c[4],c[3],c[2]); manchas(g,a,b,y0,s+6,c[1],c[0],c[3],80); tex(g,a,b,y0,c,s,.28);
  for(let x=Math.floor(a/14)*14;x<b;x+=14){ const v=hsh(x*.59+s); if(v<.3) continue; const y=y0+8+hsh(x*1.3+s)*(HH-y0-10), k=pk(y), r=(2+v*6)*k; blob(g,x,y,r*2,r*.7,'#d8d4cc'); blob(g,x+1,y,r*1.6,r*.5,'#f4f2ec'); if(v>.8) R(g,x+r,y+r*.5,1,r,'#e8e6e0'); }
  for(let x=Math.floor(a/9)*9;x<b;x+=9){ const v=hsh(x*.91+s+2); if(v<.5) continue; const y=y0+6+hsh(x*2.3)*(HH-y0-8), k=pk(y); line(g,x,y,x+(10+v*14)*k,y+(hsh(x)-.5)*8*k,v>.8?'#9a7a5a':'#5a4432',1); }
  for(let x=Math.floor(a/60)*60;x<b;x+=60){ const v=hsh(x*.33+s); if(v<.6) continue; const y=y0+30+hsh(x)*170, k=pk(y); ell(g,x,y,4*k,3*k,'#f0ead8'); R(g,x-4*k,y-1,8*k,1,'#c8c0a8'); if(v>.85){ line(g,x+12*k,y-2,x+24*k,y-6*k,'#f8f8f4',2); line(g,x+14*k,y-1,x+22*k,y-4*k,'#d8d8d0',1); } }
  detalhe(g,a,b,y0,s,c,{torrao:.3,racha:.3}); espalha(g,a,b,y0,s,{graveto:true});
  capimBorda(g,a,b,y0+2,s,['#8a9a48','#a8a058'],.6); R(g,a,y0,b-a,2,c[5]); }
// tábuas atravessadas da ponte (com vãos de água) · gap(x) → true onde falta tábua
function fPonte(g,a,b,y0,s,gap){ fDoca(g,a,b,y0,s,{col:'#8a7e6a',gap,v:'#6a5a46'}); }
function fDoca(g,a,b,y0,s,o){ o=o||{}; const c=rmp(o.col||'#8a6e4c'), vg=rmp(o.v||'#4a3a2a'), gap=o.gap; let i=0;
  for(const [y,h] of rowsP(y0,HH,9,.07)){ i++; const by=y, bh=h-2;
    for(let x=Math.floor(a/220)*220-220+(i%2)*110;x<b+220;x+=220){ const v=hsh(x*.13+i*7.1+s), col=rmp(mix(o.col||'#8a6e4c',pick(['#a08a6a','#7a6a52','#9a8e78','#6a5a44','#b09a78'],v),.55));
      if(v>.95&&!gap){ hole(g,G=>R(G,x+2,by,216,bh,'#000')); R(g,x+2,by+bh,216,2,'#1a1210'); continue; }
      R(g,x,by,218,bh,col[2]); R(g,x,by,218,1,col[1]); R(g,x,by+bh-1,218,1,col[4]); R(g,x,by+1,2,bh-2,col[3]);
      for(let k=0;k<6;k++) if(hsh(x+k*3+i)>.45){ const gx=x+10+hsh(x*k+i)*180, gw=12+hsh(k+x)*30; R(g,gx,by+1+hsh(k+i)*(bh-3),gw,1,col[3]); if(hsh(k*x)>.7) R(g,gx+gw,by+2,4,1,col[1]); }
      if(hsh(x*.9+i)>.75) ell(g,x+40+hsh(x)*140,by+bh/2,3,Math.max(1,bh*.2),col[4]);
      R(g,x+6,by+bh/2-1,2,2,'#2a2830'); R(g,x+6,by+bh/2-1,1,1,'#a8a8b8'); R(g,x+210,by+bh/2-1,2,2,'#2a2830'); R(g,x+218,by,2,bh,'#1e160e'); }
    R(g,a,by+bh,b-a,2,'#1a1210'); }
  if(gap) for(let x=Math.floor(a/6)*6;x<b;x+=6){ if(!gap(x)) continue; const edge=!gap(x-6)||!gap(x+6); hole(g,G=>R(G,x,y0+4,6,HH-y0-4,'#000'));
    for(const by of [400,470]){ R(g,x,by,6,16,vg[3]); R(g,x,by,6,3,vg[1]); R(g,x,by+14,6,2,vg[5]); }
    if(edge){ for(let y=y0+4;y<HH;y+=6){ const jx=Math.round((hsh(y*.7+x)-.5)*10); R(g,x+(gap(x-6)?0:-6)+jx,y,8,6,c[3]); R(g,x+(gap(x-6)?0:-6)+jx,y,8,1,c[1]); } } }
  R(g,a,y0,b-a,4,vg[3]); R(g,a,y0,b-a,1,vg[1]); }
// detalhes espalhados no chão: pedras, touceiras, gravetos, poças
function espalha(g,a,b,y0,s,o){ const c=rmp(o.pedra||'#9a8a78');
  for(let x=Math.floor(a/37)*37;x<b;x+=37){ const v=hsh(x*.41+s); if(v<.62) continue; const y=y0+18+hsh(x*1.9+s)*(HH-y0-22), k=pk(y);
    if(o.touc&&v>.8){ touceira(g,x,y,k*.6,x,pick(o.touc,hsh(x))); continue; }
    if(o.pedra){ const n=1+Math.floor(hsh(x)*3); for(let j=0;j<n;j++){ const px=x+j*7*k, r=(3+hsh(x+j)*4)*k; ell(g,px+1,y+1,r+1,r*.6+1,c[5]); ell(g,px,y,r,r*.6,c[3]); ell(g,px-r*.25,y-r*.2,r*.6,r*.35,c[2]); R(g,px-r*.5,y-r*.4,Math.max(1,r*.4),1,c[0]); } }
    else if(o.graveto){ line(g,x,y,x+(20+v*20)*k,y-(hsh(x)-.5)*10*k,'#5a4430',Math.max(1,Math.round(2*k))); line(g,x+10*k,y,x+14*k,y-6*k,'#5a4430',1); } }
  if(o.poca) for(let x=Math.floor(a/900)*900;x<b+900;x+=900){ const v=hsh(x*.17+s+9); if(v<.3) continue; pocaHole(g,x+v*500,y0+60+v*130,100+v*110,x,rmp(o.poca)); } }

/* =====================================================================
   FAIXA DO MEIO (horizonte → MB): campo, água, mata
   ===================================================================== */
// campo de capim até o horizonte (opaco), com lagoas (furo), touceiras e arbustos; cut(g,a,b) roda no fim, na mesma camada (valas/lagoas)
function midCampo(g,a,b,s,o){ o=o||{}; const y0=HZ, y1=o.y1||MB, base=o.seco?'#a8a058':'#6e9446';
  for(const [y,h] of rowsP(y0,y1,1,.05)){ const t=(y-y0)/(y1-y0), col=mix(hzc(base,.55),mix(base,o.seco?'#c8b060':'#88a64a',.3),Math.pow(t,.7)); R(g,a,y,b-a,h,col); }
  for(let x=Math.floor(a/5)*5;x<b;x+=5){ const v=hsh(x*.47+s); const y=y0+Math.pow(hsh(x*1.31+s),.8)*(y1-y0), t=(y-y0)/(y1-y0); if(v<.25) continue; const c=rmp(mix(hzc(base,.5*(1-t)),'#4e7a3a',v*.4)); const h=1+t*8*v; R(g,x,y-h,1,h,c[1]); R(g,x+1,y-h*.6,1,h*.6,c[3]); }
  for(let x=Math.floor(a/90)*90-90;x<b+90;x+=90){ const v=hsh(x*.21+s+3); if(v<.35) continue; const y=y0+6+Math.pow(hsh(x*.77+s),1.3)*(y1-y0-16), t=(y-y0)/(y1-y0), k=.25+t*.8;
    if(o.lagoa!==false&&v>.72){ const w=(90+v*200)*k, h=Math.max(3,(6+v*10)*k); ell(g,x,y+1,w*.55,h*.7,rmpH('#4e6a3a',.4*(1-t))[3]); hole(g,G=>ell(G,x,y,w*.5,h*.5,'#000')); R(g,x-w*.25,y-h*.2,w*.3,1,'#d0e0e8'); continue; }
    foliage(g,x,y-6*k,(10+v*14)*k+3,(5+v*5)*k+2,rmpH(pick([GREEN,GREEN2,'#7a9a44'],v),.5*(1-t)),x,Math.max(2,3*k),Math.max(3,6*k)); }
  if(o.cut) o.cut(g,a,b); }
// água aberta até o horizonte (furo) com marolas, ilhotas de capim e aguapé boiando; y1 = limite de baixo
function midAgua(g,a,b,s,o){ o=o||{}; const y0=o.y0||HZ, y1=o.y1||MB, light='#dce8ee', dark='#2a3e4a';
  for(let x=Math.floor(a/7)*7;x<b;x+=7){ const v=hsh(x*.53+s); if(v<.4) continue; const y=y0+2+Math.pow(hsh(x*1.7+s),1.25)*(y1-y0-2), t=(y-y0)/(y1-y0), w=Math.round((3+v*10)*(.3+t)); R(g,x,y,w,1,v>.75?light:dark); }
  if(o.ilhas!==false) for(let x=Math.floor(a/130)*130-130;x<b+130;x+=130){ const v=hsh(x*.27+s+1); if(v<.4) continue; const y=y0+4+Math.pow(hsh(x*.61+s),1.2)*(y1-y0-6), t=(y-y0)/(y1-y0), k=.2+t*.9, w=(40+v*120)*k, hz=.5*(1-t);
    const c=rmpH(pick(['#7a9a44','#8aa24a','#6a8a3e'],v),hz); R(g,x-w/2,y-1,w,2,c[4]); for(let xx=x-w/2;xx<x+w/2;xx+=2){ const hh=(2+hsh(xx*.7)*9*(1-Math.abs(xx-x)/(w/2)))*k+1; R(g,xx,y-hh,2,hh,hsh(xx*1.3)>.6?c[1]:c[3]); }
    R(g,x-w/2+2,y+1,w-4,1,c[5]); if(t>.3&&hsh(x)>.5) for(let i=0;i<4;i++) aguape(g,x-w/2+hsh(x+i)*w,y,k*.8,x+i); }
  if(o.aguape!==false) for(let x=Math.floor(a/46)*46;x<b;x+=46){ const v=hsh(x*.39+s+5); if(v<.5) continue; const y=y0+(y1-y0)*(.4+hsh(x*2.3)*.6), t=(y-y0)/(y1-y0); aguape(g,x,y,.3+t*.6,x,v>.7); } }
function barranco(g,a,b,y,s,col){ const c=rmp(col||'#6a5236'); for(let x=Math.floor(a/4)*4;x<b;x+=4){ const yy=y+Math.round(Math.sin(x*.013+s)*2+lowf(x,0,s)*3); R(g,x,yy-3,4,9,c[3]); R(g,x,yy-3,4,2,c[1]); R(g,x,yy+5,4,3,c[5]); } capimBorda(g,a,b,y-2,s+3,['#7a9a44','#8aa24a','#6a8a3e'],.55); }
// mata densa até o alto (cordilheira/corixo): troncos e copas em camadas, céu aparecendo em frestas
function mataFundo(g,a,b,yb,s,o){ o=o||{}; const top=o.top||40;
  for(let x=Math.floor(a/50)*50-100;x<b+100;x+=50){ const v=hsh(x*.17+s); foliage(g,x,yb-50-v*110,46+v*30,40+v*24,rmpH(pick([GDARK,GREEN2,'#3a5a3e'],v),.35),x,6,12); }
  for(let x=Math.floor(a/120)*120-120;x<b+120;x+=120){ const v=hsh(x*.29+s+2), xx=x+v*50, tr=rmpH(pick([BARK,'#5a4a40','#7a6a5a'],v),.15); tronco(g,xx,yb,yb-top-30,16+v*10,10+v*4,tr,x,(v-.5)*30); galho(g,xx,yb-150-v*60,xx+(v-.5)*160,yb-230-v*40,5,tr); }
  for(let x=Math.floor(a/70)*70-140;x<b+140;x+=70){ const v=hsh(x*.41+s+4); foliage(g,x,top+v*50,58+v*30,46+v*20,rmp(pick([GDARK,GREEN2,'#4a6a3a','#2e5a3e'],v)),x+7,7,13); }
  for(let x=Math.floor(a/60)*60-60;x<b+60;x+=60){ const v=hsh(x*.53+s+6); foliage(g,x,yb-14-v*12,30+v*24,16+v*8,rmp(pick(['#3e6a3a','#4e7a3e'],v)),x+3,4,8); }
  if(o.cipo) for(let x=Math.floor(a/70)*70;x<b+70;x+=70){ const v=hsh(x*.73+s); if(v<.4) continue; const L=60+v*140; bezL(g,[[x,top+20],[x+10,top+20+L*.6],[x+(v-.5)*30,top+20+L]],'#3a5a2e',2); for(let i=0;i<7;i++) ell(g,x+(v-.5)*30*(i/7)+(i%2?3:-3),top+20+L*i/7,3,2,'#5a8a3a'); } }
/* =====================================================================
   DETALHES DE CHÃO E PEÇAS DO RIO CUIABÁ
   ===================================================================== */
function hoof(g,x,y,k,c){ const r=Math.max(1,1.5*k); ell(g,x-r,y,r*.8,r*1.1,c[5]); ell(g,x+r,y,r*.8,r*1.1,c[5]); R(g,x-r*2,y-r*1.4,r*4,1,c[1]); }
function racha(g,x,y,k,s,c,n){ let px=x,py=y; const d=hsh(s)>.5?1:-1; for(let i=0;i<n;i++){ const nx=px+(6+hsh(s+i*1.7)*12)*k*d, ny=py+(hsh(s+i*2.3)-.5)*7*k; line(g,px,py,nx,ny,c[5],1); line(g,px,py+1,nx,ny+1,c[1],1); if(hsh(s+i*3.1)>.65){ const bx=nx+(hsh(s+i)-.5)*12*k, by=ny+(4+hsh(s+i*5)*6)*k; line(g,nx,ny,bx,by,c[5],1); } px=nx; py=ny; } }
// torrões (sombra + luz), trilhas de pegadas de gado, rachaduras em manchas secas e tufos de capim
function detalhe(g,a,b,y0,s,c,o){ o=o||{}; const nt=o.torrao==null?.4:o.torrao;
  if(o.racha) for(let x=Math.floor(a/70)*70-140;x<b+70;x+=70) for(let j=0;j<3;j++){ const y=y0+14+hsh(x*.37+j*4.1+s)*(HH-y0-18); if(lowf(x,y,s+21)<o.racha) continue; racha(g,x+hsh(x+j)*50,y,pk(y),x*1.1+j,c,4+Math.floor(hsh(x*j+s)*4)); }
  for(let x=Math.floor(a/13)*13;x<b;x+=13){ const v=hsh(x*.57+s+3); if(v>nt) continue; const y=y0+10+hsh(x*1.23+s+1)*(HH-y0-12), k=pk(y), r=(1.6+hsh(x*2.1)*3.4)*k;
    ell(g,x+1,y+r*.55,r+1,r*.4+1,c[5]); ell(g,x,y,r,r*.62,c[3]); ell(g,x-r*.2,y-r*.25,r*.62,r*.34,c[2]); R(g,x-r*.45,y-r*.5,Math.max(1,r*.5),1,c[0]); }
  if(o.gado) for(let x=Math.floor(a/380)*380-760;x<b+380;x+=380){ if(hsh(x*.21+s)<1-o.gado) continue; let px=x+hsh(x)*120, py=y0+26+hsh(x*.7+s)*(HH-y0-50), dy=(hsh(x*1.3)-.5)*.5;
    for(let i=0;i<26;i++){ const k=pk(py); if(px>a-30&&px<b+30){ hoof(g,px,py-3*k,k,c); hoof(g,px+7*k,py+3*k,k,c); } px+=15*k; py+=dy*15*k+(hsh(x+i*1.9)-.5)*4; if(py<y0+16||py>HH-10) dy=-dy; } }
  if(o.capim) for(let x=Math.floor(a/31)*31;x<b;x+=31){ const v=hsh(x*.83+s+7); if(v<.72) continue; const y=y0+16+hsh(x*1.47+s)*(HH-y0-20), k=pk(y); touceira(g,x,y,k*(.35+v*.3),x+s,pick(o.capim,hsh(x*.3))); } }
// areia molhada escura junto da água, borda irregular, brilhos e poças
function areiaMolhada(g,a,b,y0,s){ const w=['#c8b8a0','#a89070','#8a7454','#6e5a40','#5a4632','#4a3a28'];
  for(let x=Math.floor(a/4)*4;x<b;x+=4){ const wy=y0+30+Math.round(lowf(x,4,s)*14+Math.sin(x*.013+s)*5+hsh(x*.3)*3);
    for(let y=y0;y<wy;y+=2){ const t=(y-y0)/(wy-y0); R(g,x,y,4,2,mix(w[4],w[2],t*t)); }
    R(g,x,wy,4,2,w[1]); R(g,x,wy+2,4,1,w[3]);
    if(hsh(x*.91+s)>.7){ const yy=y0+4+hsh(x*1.7)*(wy-y0-6); R(g,x,yy,3+hsh(x)*8,1,'#b8b0a0'); } }
  for(let x=Math.floor(a/600)*600;x<b+600;x+=600){ const v=hsh(x*.23+s); if(v<.4) continue; pocaHole(g,x+v*300,y0+16+v*8,50+v*50,x,w); } }
// rastro de jacaré: arrasto da cauda serpenteando + pegadas dos dois lados
function rastroJacare(g,x0,y0,x1,y1,c){ const n=Math.ceil(Math.hypot(x1-x0,y1-y0)/3); for(let i=0;i<=n;i++){ const t=i/n, y=y0+(y1-y0)*t, k=pk(y), x=x0+(x1-x0)*t+Math.sin(t*14)*5*k; R(g,x-k,y,Math.max(2,3*k),1,c[5]); R(g,x-k,y-1,Math.max(2,3*k),1,c[1]); }
  const m=Math.ceil(n/7); for(let i=0;i<m;i++){ const t=(i+.5)/m, y=y0+(y1-y0)*t, k=pk(y), x=x0+(x1-x0)*t; for(const sd of [-1,1]){ const fx=x+sd*12*k+(i%2)*4*k*sd, fy=y+sd*3*k; ell(g,fx,fy,2.2*k,1.3*k,c[5]); for(let d=-1.5;d<=1.5;d+=1) R(g,fx+d*2*k-sd*3*k,fy-2*k,1,Math.max(1,2*k),c[5]); } } }
// rio barrento opaco: correnteza em traços, manchas de lama, reflexo da mata sob o barranco, espuma na beira
function rioAgua(g,a,b,s,y0,y1){ const fa='#a88a62', ne='#6e4e30';
  for(const [y,h] of rowsP(y0,y1,1,.03)){ const t=(y-y0)/(y1-y0); R(g,a,y,b-a,h,mix(fa,ne,Math.pow(t,.8))); }
  for(let y=y0;y<y0+26;y++){ const t=(y-y0)/26; if((y-y0)%3===2) continue; for(let x=Math.floor(a/6)*6;x<b;x+=6){ const v=hsh(x*.31+y*1.7); if(v<t*.8) continue; R(g,x+Math.round(Math.sin(y*.9+x*.01)*2),y,6,1,mix('#3a3a22','#5a4a30',t)); } }
  for(let x=Math.floor(a/140)*140-140;x<b+140;x+=140) for(let j=0;j<3;j++){ const y=y0+30+hsh(x*.3+j*3.3+s)*(y1-y0-36), t=(y-y0)/(y1-y0), w=(120+hsh(x+j)*260)*(.4+t), v=lowf(x,y,s+5); g.save(); g.globalAlpha=.35; mancha(g,x+hsh(x*j)*80,y,w,4+t*8,v>0?'#b8986a':'#5a3e24',null,x+j); g.restore(); }
  for(let x=Math.floor(a/9)*9;x<b;x+=9){ const v=hsh(x*.53+s); if(v<.35) continue; const y=y0+26+Math.pow(hsh(x*1.7+s),1.1)*(y1-y0-28), t=(y-y0)/(y1-y0), L=(10+v*40)*(.35+t*1.2);
    const col=v>.8?'#e0c89a':v>.6?'#c4a676':'#4a321c'; R(g,x,y,L,1,col); if(v>.7) R(g,x+L*.6,y-1,L*.5,1,col); if(v>.9) R(g,x+L+3,y,L*.3,1,'#f0e0c0'); }
  for(let x=Math.floor(a/170)*170;x<b+170;x+=170){ const v=hsh(x*.41+s+2); if(v<.55) continue; const y=y0+40+hsh(x*.9)*(y1-y0-50), t=(y-y0)/(y1-y0), k=.4+t*.8;
    if(v>.8){ line(g,x,y,x+40*k,y-2*k,'#3a2818',Math.max(2,Math.round(3*k))); line(g,x+30*k,y-1,x+40*k,y-8*k,'#3a2818',1); R(g,x-6,y+2,50*k,1,'#d8c49a'); } else for(let i=0;i<5;i++) aguape(g,x+i*9*k,y+hsh(x+i)*3,k*.7,x+i,false); }
  for(let x=Math.floor(a/4)*4;x<b;x+=4){ const yy=y1-3+Math.round(Math.sin(x*.02+s)*2+lowf(x,1,s)*2); R(g,x,yy,4,2,hsh(x*.7)>.4?'#e8d8b8':'#b8a078'); R(g,x,yy+2,4,1,'#4a321c'); } }
// redemoinho em espiral, achatado na perspectiva, onde o jacaré mergulha e emerge
function redemoinho(g,x,y,r,s){ ell(g,x,y,r*1.15,r*.34,'#4a301a'); ell(g,x,y,r*.9,r*.26,'#5e3e22');
  for(let arm=0;arm<3;arm++) for(let th=0;th<7.5;th+=.05){ const rr=r*(1-th/8), an=th+arm*2.09, px=x+Math.cos(an)*rr, py=y+Math.sin(an)*rr*.3; R(g,px,py,th<3?3:2,1,th<2?'#f0e0c0':th<4.5?'#d0b484':'#9a7a50'); }
  ell(g,x,y,r*.22,r*.07+1,'#1e120a'); ell(g,x-r*.05,y-1,r*.14,r*.04+1,'#120a06');
  for(let i=0;i<28;i++){ const an=hsh(s+i)*6.28, rr=r*(1.05+hsh(s+i*2)*.5); R(g,x+Math.cos(an)*rr,y+Math.sin(an)*rr*.32,2+hsh(i)*6,1,i%3?'#e8d8b8':'#c8ac80'); } }
// barranco da outra margem: terra em veios irregulares com raízes expostas pendendo até a água
function barrancoRaiz(g,a,b,yt,yb,s){ const c=rmp('#8a5a36');
  for(let x=Math.floor(a/2)*2;x<b;x+=2){ const top=yt+Math.round(lowf(x,0,s)*4+Math.sin(x*.07)), bot=yb+Math.round(lowf(x,2,s)*2); for(let y=top;y<bot;y++){ const t=(y-top)/Math.max(1,bot-top), v=lowf(x*.6,y*3,s+4); R(g,x,y,2,1,v>.25?c[1]:v>-.1?mix(c[2],c[3],t):v>-.4?c[3]:c[4]); } R(g,x,top,2,1,c[0]); R(g,x,bot-2,2,2,c[5]); }
  for(let x=Math.floor(a/9)*9-18;x<b+18;x+=9){ const v=hsh(x*.67+s); if(v<.3) continue; const top=yt+Math.round(lowf(x,0,s)*4), L=(yb-top)*(v>.85?1.1:.2+v*.5), dx=(hsh(x*3)-.5)*40, P=[[x,top],[x+dx*.2+(hsh(x*5)-.5)*16,top+L*.5],[x+dx,top+L]];
    bezL(g,P,'#2e1c10',v>.9?3:v>.7?2:1); bezL(g,P.map(p=>[p[0]-1,p[1]]),'#7a5a3a',1);
    if(v>.7) for(let i=0;i<3;i++){ const yy=top+L*(.3+i*.2); line(g,x+dx*(.3+i*.2),yy,x+dx*(.3+i*.2)+(hsh(x+i)-.5)*14,yy+6+hsh(i+x)*8,'#3a2414',1); } } }
// mata ciliar densa em faixa: copas em camadas, palmeiras e árvores emergentes, cipós
function ciliar(g,a,b,yb,s){ for(let x=Math.floor(a/44)*44-88;x<b+88;x+=44){ const v=hsh(x*.19+s); foliage(g,x,yb-44-v*26,36+v*20,24+v*12,rmpH(pick([GDARK,GREEN2,'#3a5a3e'],v),.35),x,6,12); }
  for(let x=Math.floor(a/260)*260-260;x<b+260;x+=260){ const v=hsh(x*.43+s+1), xx=x+v*120; if(v>.7) acuri(g,xx,yb-6,.6,x,{hz:.25}); else if(v>.45) caranda(g,xx,yb-6,.6,x,.3); else arvore(g,xx,yb-6,.55,x,{hz:.25}); }
  for(let x=Math.floor(a/34)*34-68;x<b+68;x+=34){ const v=hsh(x*.29+s+3); foliage(g,x,yb-20-v*16,26+v*16,16+v*10,rmp(pick([GDARK,'#2e5a3e','#3e6a3a',GREEN2],v)),x+3,5,10); }
  for(let x=Math.floor(a/57)*57;x<b+57;x+=57){ const v=hsh(x*.61+s+5); if(v<.5) continue; bezL(g,[[x,yb-40-v*20],[x+6,yb-20],[x-2,yb+4]],'#2a4a2a',2); }
  for(let x=Math.floor(a/26)*26-26;x<b+26;x+=26){ const v=hsh(x*.73+s+7); foliage(g,x,yb-6,18+v*14,8+v*5,rmp(pick(['#3e6a3a','#4e7a3e','#2e5a3e'],v)),x+9,4,7); } }
// costelas soltas no chão
function costelas(g,x,yb,k,s){ const b=rmp('#e8e0c8'); line(g,x-30*k,yb-4*k,x+30*k,yb-6*k,b[2],Math.max(2,Math.round(3*k))); for(let i=0;i<7;i++){ const xx=x-24*k+i*8*k; bezL(g,[[xx,yb-5*k],[xx+4*k,yb-16*k],[xx+10*k,yb-2*k+hsh(s+i)*3]],i%2?b[1]:b[2],Math.max(1,Math.round(2*k))); } }
// tempestade sobre o rio (céu da arena final): teto escuro, bigorna de cúmulo-nimbo com borda acesa e fachos de luz
function stormCanvas(mode){ const k='st'+mode; if(stripCache[k]) return stripCache[k]; const P=SKYP[mode], [c,g]=mk(HW,HZ+4), C=P.cloud, D=C.map((x,i)=>i<2?mix(x,'#140c1c',.6):i===2?mix(x,'#3a2a40',.3):x), PD=Object.assign({},P,{cloud:D});
  for(let y=0;y<HZ;y++){ g.globalAlpha=.6*Math.pow(1-y/HZ,1.3); R(g,0,y,HW,1,mix(C[0],'#0a0610',.5)); } g.globalAlpha=1;
  if(P.sol||mode==='lua'){ g.globalCompositeOperation='lighter'; for(let i=0;i<6;i++){ const x0=120+i*150+hsh(i*3.1)*60, w=18+hsh(i)*30; g.globalAlpha=.05+hsh(i*7)*.04; poly(g,[[x0,96],[x0+w,96],[x0+w+130,HZ],[x0+90,HZ]],P.glow); } g.globalCompositeOperation='source-over'; g.globalAlpha=1; }
  cumulus(g,HW*.28,128,460,150,PD,91); cumulus(g,HW*.78,110,380,120,PD,93);
  for(let i=0;i<9;i++) cumulus(g,i*120+hsh(i*5.3)*50,70+hsh(i*2.9)*36,240,54,PD,i+77);
  
  return stripCache[k]=c; }

/* =====================================================================
   COMPOSIÇÃO DAS ÁREAS
   ===================================================================== */
function compose(A){ const X0=A.x0*RS, X1=A.x1*RS, L=X1-X0, s=A.n*1000;
  const zf=(z,fn)=>add(X0,X1,z,(g,lo,hi)=>{ const a=Math.max(lo,X0), b=Math.min(hi,X1); if(b>a) fn(g,a,b); });
  const at=(r,w,z,fn)=>{ const x=X0+L*r; add(x-w,x+w,z,g=>fn(g,x)); };
  const seg=(r0,r1,z,fn)=>{ const a0=X0+L*r0, a1=X0+L*r1; add(a0,a1,z,(g,lo,hi)=>{ const a=Math.max(lo,a0), b=Math.min(hi,a1); if(b>a) fn(g,a,b); }); };
  const voo=(n,big)=>{ for(let i=0;i<n;i++){ const x=X0+hsh(s+i*3.3)*L, y=30+hsh(s*2+i)*110; add(x-130,x+130,0,g=>big?tuiuiuVoo(g,x,y,.5+hsh(i)*.4,i):passaros(g,x,y,5,s+i,'#1e1a26')); } };
  const araras=(n)=>{ for(let i=0;i<n;i++){ const x=X0+hsh(s+i*5.1)*L, y=50+hsh(s+i*1.7)*70; add(x-30,x+40,0,g=>{ arara(g,x,y,.7,i); arara(g,x+22,y+6,.7,i+1); }); } };
  // capões e carandás no horizonte (com reflexo quando a faixa é água)
  const capoes=(n,y0,y1,agua,sd)=>{ for(let i=0;i<n;i++){ const x=X0+(i+hsh(s+sd+i))*L/n, yb=y0+hsh(s*3+sd+i)*(y1-y0), t=(yb-HZ)/(MB-HZ), k=.3+t*.7, w=(120+hsh(i+sd)*260)*k, hz=.55*(1-t)+.1;
    const fn=G=>{ if(hsh(i*7+sd)>.7) for(let j=0;j<3;j++) caranda(G,x-w*.3+j*w*.3,yb,k*.9,i+j,hz); else capao(G,x-w/2,w,yb,k,s+i+sd,hz); };
    add(x-w,x+w,0,g=>agua?refl(g,x-w*.7,x+w*.7,yb-260*k,yb,fn,{d:90*k+10}):fn(g)); } };
  const fire=(n)=>{ for(let i=0;i<n;i++) FIREF.push({x:(X0+hsh(s+i*2.9)*L)/RS,y:(MB-50+hsh(s+i*4.3)*200)/RS,p:hsh(i)*6}); };
  const eyes=(n,y0,y1)=>{ for(let i=0;i<n;i++) EYES.push({x:(X0+hsh(s+i*6.1)*L)/RS,y:(y0+hsh(s+i*3.7)*(y1-y0))/RS}); };
  const water=(r0,r1,y0,y1)=>WATER.push({x0:(X0+L*r0)/RS,x1:(X0+L*r1)/RS,y0,y1});
  switch(A.id){
  case 'transpantaneira': {
    const vt=x=>{ const u=(x-X0)/L, br=Math.max(0,1-Math.abs(u-.55)/.08); return MB-58-br*70+Math.round(Math.sin(x*.011)*2+lowf(x,0,s)*4); };
    zf(0,(g,a,b)=>midCampo(g,a,b,s,{cut:(g,a,b)=>{ for(let x=Math.floor(a/4)*4;x<b;x+=4){ const yt=vt(x); R(g,x,yt-4,4,4,'#4a3a26'); hole(g,G=>R(G,x,yt,4,MB-4-yt,'#000')); }
      barranco(g,a,b,MB-2,s,'#7a5236'); for(let x=Math.floor(a/24)*24;x<b;x+=24) if(hsh(x*.7)>.55) touceira(g,x,vt(x),.6,x,'#7a9a44'); }}));
    capoes(9,HZ+3,HZ+40,false,1); voo(4); voo(2,true); araras(1);
    at(.06,380,1,(g,x)=>portal(g,x-215,MB-46,s)); seg(.0,.03,1,(g,a,b)=>cercaBranca(g,a,b,MB-46,s)); seg(.105,.14,1,(g,a,b)=>cercaBranca(g,a,b,MB-46,s));
    at(.145,140,1,(g,x)=>placaTur(g,x-48,MB-44,['AQUI COMECA','O PANTANAL','MATO-GROSSENSE']));
    at(.215,120,1,(g,x)=>placaMadeira(g,x-42,MB-120,['KM 0'],s,{s:3,yb:MB-44}));
    for(let x=X0+L*.2;x<X1-100;x+=640){ const xx=x; add(xx-30,xx+30,1,g=>poste(g,xx,MB-48,230)); } seg(.2,1,2,(g,a,b)=>fiosPoste(g,Math.max(a,X0+L*.2),b,MB-48,230,640));
    const tree=(r,fn,w)=>at(r,w,1,(g,x)=>refl(g,x-w,x+w,MB-330,vt(x)+2,G=>fn(G,x),{d:40}));
    tree(.27,(G,x)=>ipe(G,x,vt(x)-2,1.05,s+1,'#c058a8'),140); tree(.36,(G,x)=>capao(G,x-260,520,vt(x)-2,1.05,s+3),300); tree(.44,(G,x)=>{ caranda(G,x,vt(x)-2,1.1,s+4); caranda(G,x+70,vt(x)-2,.9,s+5); },140);
    tree(.7,(G,x)=>ipe(G,x,vt(x)-2,1.15,s+6,'#f4c820'),150); tree(.82,(G,x)=>arvore(G,x,vt(x)-2,1.1,s+7),150); tree(.93,(G,x)=>acuri(G,x,vt(x)-2,1.1,s+8),140);
    at(.55,700,1,(g,x)=>refl(g,x-500,x+500,HZ+40,HZ+86,G=>ponteMadeira(G,x-480,x+480,HZ+66,.5,s,{hz:.25,pil:22}),{d:30}));
    at(.31,60,1,(g,x)=>jacare(g,x,MB-6,1,s,{boca:true,f:-1})); at(.335,60,1,(g,x)=>jacare(g,x,MB-4,.9,s+1)); at(.53,60,1,(g,x)=>jacare(g,x,MB-56,1,s,{boia:true}));
    at(.24,40,1,(g,x)=>tuiuiu(g,x,MB-18,1.1,s,{pesca:true})); at(.6,40,1,(g,x)=>tuiuiu(g,x,MB-40,1.2,s,{f:-1})); at(.86,40,1,(g,x)=>garca(g,x,MB-20,1.1,s));
    const br0=X0+L*.5, br1=X0+L*.6, gapB=x=>false;
    zf(3,(g,a,b)=>{ if(a<br0) fTerra(g,a,Math.min(b,br0),MB,s); if(b>br1) fTerra(g,Math.max(a,br1),b,MB,s); if(b>br0&&a<br1) fPonte(g,Math.max(a,br0),Math.min(b,br1),MB,s,gapB); });
    seg(.5,.6,4,(g,a,b)=>{ for(let x=Math.floor(a/90)*90;x<b+90;x+=90) if(x>=br0&&x<=br1){ mourao(g,x,MB+4,44,x,WOODG); } R(g,Math.max(a,br0),MB-36,Math.min(b,br1)-Math.max(a,br0),5,WOODG[2]); R(g,Math.max(a,br0),MB-36,Math.min(b,br1)-Math.max(a,br0),1,WOODG[0]); });
    at(.32,60,5,(g,x)=>pneuTrator(g,x,MB+30)); at(.8,200,5,(g,x)=>caminhonete(g,x,MB+56,s));
    fire(26); eyes(5,MB-40,MB-10); water(.45,.65,HZ+70,MB); break; }
  case 'porteira':
    zf(0,(g,a,b)=>midCampo(g,a,b,s,{})); capoes(8,HZ+3,HZ+36,false,2); voo(3); araras(2);
    for(const [r,y] of [[.78,HZ+64],[.83,HZ+70],[.9,HZ+58]]) at(r,60,0,(g,x)=>cavalo(g,x,y,.7,x));
    for(const [r,y] of [[.04,HZ+50],[.07,HZ+56],[.48,HZ+44],[.52,HZ+48]]) at(r,50,0,(g,x)=>gado(g,x,y,.55,x,{pasta:hsh(x)>.5}));
    at(.72,320,1,(g,x)=>mangueiraArv(g,x,MB-12,1.15,s)); at(.93,140,1,(g,x)=>acuri(g,x,MB-14,1.15,s)); at(.97,80,1,(g,x)=>caranda(g,x,MB-20,1,s+3));
    at(.465,900,1,(g,x)=>sede(g,x-780,1560,MB-10,s));
    seg(0,.125,1,(g,a,b)=>cerca(g,a,b,MB-6,s)); seg(.205,.31,1,(g,a,b)=>cerca(g,a,b,MB-6,s)); seg(.62,1,1,(g,a,b)=>cerca(g,a,b,MB-6,s));
    at(.14,130,1,(g,x)=>porteira(g,x-96,MB-4,s)); at(.655,30,1,(g,x)=>joaoBarro(g,x,MB-4,s));
    zf(3,(g,a,b)=>fCapim(g,a,b,MB,s)); at(.6,280,5,(g,x)=>carroca(g,x,MB+52,s)); at(.24,60,5,(g,x)=>cocho(g,x,MB+36,90,s));
    fire(30); break;
  case 'curral':
    zf(0,(g,a,b)=>midCampo(g,a,b,s,{seco:true})); capoes(8,HZ+3,HZ+34,false,3); voo(3);
    for(let i=0;i<14;i++){ const r=.03+i*.07+hsh(i)*.03, y=MB-24-hsh(i*3)*20; at(r,60,1,(g,x)=>gado(g,x,y,1,x+i)); }
    at(.8,300,1,(g,x)=>galpao(g,x-200,400,MB-22,s));
    seg(0,1,1,(g,a,b)=>{ const t0=X0+L*.3-10, t1=t0+260; if(a<t0) curralCerca(g,a,Math.min(b,t0),MB-6,100,s); if(b>t1) curralCerca(g,Math.max(a,t1),b,MB-6,100,s); });
    at(.3,280,1,(g,x)=>troncoContencao(g,x,MB-6,s)); at(.45,60,1,(g,x)=>berranteLaco(g,x,MB-2,s)); at(.66,70,1,(g,x)=>couro(g,x,MB-2,s)); at(.55,70,1,(g,x)=>poco(g,x,MB+6,s));
    zf(3,(g,a,b)=>fLama(g,a,b,MB,s)); at(.18,70,5,(g,x)=>cocho(g,x,MB+40,110,s)); at(.9,70,5,(g,x)=>cocho(g,x,MB+30,80,s+1));
    fire(18); break;
  case 'campoalagado':
    zf(0,(g,a,b)=>midAgua(g,a,b,s,{})); capoes(10,HZ+2,HZ+40,true,4); voo(3); voo(3,true); araras(2);
    at(.65,1300,0,(g,x)=>refl(g,x-1200,x+1200,HZ+40,HZ+86,G=>ponteMadeira(G,x-1150,x+1150,HZ+66,.55,s,{hz:.2,pil:20}),{d:34}));
    for(const [r,y,k] of [[.3,HZ+80,.8],[.33,HZ+84,.75],[.62,HZ+96,.9]]) at(r,40,1,(g,x)=>refl(g,x-30,x+30,y-60*k,y,G=>cervo(G,x,y,k,x,true),{d:30}));
    for(const [r,y,k] of [[.18,MB-26,1.1],[.5,HZ+110,.9],[.78,MB-40,1.15]]) at(r,40,1,(g,x)=>refl(g,x-30,x+30,y-70*k,y,G=>tuiuiu(G,x,y,k,x,{pesca:true,f:hsh(x)>.5?1:-1}),{d:24}));
    for(const r of [.08,.42,.9]) at(r,20,1,(g,x)=>garca(g,x,HZ+70+hsh(x)*40,.8,x));
    at(.95,160,1,(g,x)=>refl(g,x-150,x+150,MB-300,MB-34,G=>{ ell(G,x,MB-34,90,8,'#6a8a3e'); ipe(G,x,MB-36,1,s,'#f4c820'); },{d:50}));
    zf(3,(g,a,b)=>fAgua(g,a,b,MB,s,{})); fire(20); eyes(8,HZ+60,MB); water(0,1,HZ,HH); break;
  case 'corixo': {
    const cy=HZ+70; zf(0,(g,a,b)=>{ refl(g,a-60,b+60,cy-110,cy,G=>mataFundo(G,a-60,b+60,cy,s,{cipo:true,top:30}),{d:120,sq:.9}); midAgua(g,a,b,s,{y0:cy+4,ilhas:false}); });
    for(let i=0;i<10;i++){ const r=hsh(s+i*2.1), y=cy+20+hsh(i*5)*(MB-cy-30); at(r,60,1,(g,x)=>vitoria(g,x,y,.5+(y-cy)/(MB-cy)*.6,x)); }
    for(let i=0;i<9;i++){ const r=(i+hsh(i))/9; at(r,60,1,(g,x)=>taboa(g,x,MB-4,1.2,x)); } for(const r of [.12,.5,.88]) at(r,40,1,(g,x)=>taboa(g,x,cy+6,.6,x));
    at(.45,200,1,(g,x)=>{ const P=[[x,cy+2],[x+50,cy+40],[x+150,MB-2]]; bezL(g,P,'#3a2a20',12); bezL(g,P.map(p=>[p[0],p[1]-2]),'#6a5038',9); bezL(g,P.map(p=>[p[0],p[1]-5]),'#9a7a58',2); });
    at(.3,60,1,(g,x)=>{ capivara(g,x,cy+2,1,s); capivara(g,x+40,cy+4,.8,s+1); capivara(g,x-30,cy+3,.6,s+2); }); at(.62,40,1,(g,x)=>sucuri(g,x,cy+4,1,s));
    at(.77,40,1,(g,x)=>{ ariranhaSil(g,x,cy+60,1); ariranhaSil(g,x+40,cy+70,1.1); }); voo(2);
    zf(3,(g,a,b)=>fMargem(g,a,b,MB,s)); at(.2,90,5,(g,x)=>canoa(g,x,MB+34,s)); fire(34); eyes(6,cy+20,MB); water(0,1,cy,MB); break; }
  case 'baia':
    zf(0,(g,a,b)=>midAgua(g,a,b,s,{ilhas:false})); capoes(12,HZ+1,HZ+12,true,5); voo(4); araras(1);
    at(.42,200,1,(g,x)=>refl(g,x-190,x+190,HZ-120,HZ+56,G=>{ ell(G,x,HZ+56,120,6,'#5e7a3a'); ell(G,x,HZ+54,100,4,'#7a9a44'); arvore(G,x,HZ+54,.75,s+9,{c:rmp('#4e7c4a')}); },{d:90,sq:.9}));
    for(const [r,y,k] of [[.3,HZ+90,.8],[.55,HZ+70,.7],[.7,MB-30,1.1],[.15,MB-50,1]]) at(r,60,1,(g,x)=>jacare(g,x,y,k,x,{boia:true,f:hsh(x)>.5?1:-1}));
    seg(0,1,1,(g,a,b)=>{ for(let x=Math.floor(a/18)*18;x<b+18;x+=18) aguape(g,x+hsh(x)*10,MB-8-hsh(x*3)*16,1,x,hsh(x*5)>.4); });
    at(.08,40,1,(g,x)=>ninho(g,x,MB-18,.5,s)); at(.88,40,1,(g,x)=>tuiuiu(g,x,MB-14,1.1,s,{f:-1}));
    zf(3,(g,a,b)=>fAreia(g,a,b,MB,s,{col:'#bca88a',pegadas:true})); at(.47,240,5,(g,x)=>barcoRemo(g,x,MB+22,s));
    fire(16); eyes(10,HZ+40,MB-20); water(0,1,HZ,MB); break;
  case 'salina': {
    const ly0=HZ+30, ly1=HZ+86;
    zf(0,(g,a,b)=>midCampo(g,a,b,s,{seco:true,lagoa:false,cut:(g,a,b)=>{ for(let x=Math.floor(a/4)*4;x<b;x+=4){ const t0=ly0+Math.round(lowf(x,1,s)*8), t1=ly1+Math.round(lowf(x,2,s)*10); R(g,x,t0-8,4,10,'#f2f0ea'); R(g,x,t0-8,4,2,'#ffffff'); R(g,x,t1-2,4,14,'#e8e4dc'); R(g,x,t1+10,4,3,'#c8c4bc'); hole(g,G=>R(G,x,t0,4,t1-t0,'#000')); } }}));
    capoes(6,HZ+2,HZ+20,false,6); voo(3);
    for(const [r0,r1] of [[.02,.3],[.6,.86]]) for(let i=0;i<9;i++){ const r=r0+(i+hsh(i+r0*10))*(r1-r0)/9, y=ly1+20+hsh(i*3+r0)*(MB-ly1-30), k=.6+(y-ly1)/(MB-ly1)*.6; at(r,90,1,(g,x)=>caranda(g,x,y,k,x)); }
    for(const r of [.36,.4,.52]) at(r,30,1,(g,x)=>refl(g,x-20,x+20,ly0+10,ly0+36,G=>colhereiro(G,x,ly0+36,.8,x),{d:16}));
    at(.45,160,1,(g,x)=>{ gado(g,x-60,MB-14,1,s,{pasta:true,f:1}); cocho(g,x-10,MB-6,110,s,true); gado(g,x+120,MB-18,1,s+1,{pasta:true,f:-1}); });
    zf(3,(g,a,b)=>fSal(g,a,b,MB,s)); at(.7,60,5,(g,x)=>ossada(g,x,MB+40,s)); fire(14); water(0,1,ly0,ly1); break; }
  case 'cordilheira':
    zf(0,(g,a,b)=>{ R(g,a,HZ-20,b-a,MB-HZ+20,'#24301e'); mataFundo(g,a,b,MB-8,s,{cipo:true,top:10}); });
    at(.2,170,1,(g,x)=>ipe(g,x,MB-6,1.25,s,'#f4c820')); at(.52,170,1,(g,x)=>ipe(g,x,MB-6,1.2,s+1,'#c058a8')); at(.78,160,1,(g,x)=>arvore(g,x,MB-6,1.3,s+2,{flor:'#f0e0a0'}));
    for(const r of [.08,.36,.66]) at(r,150,1,(g,x)=>acuri(g,x,MB-8,1.25,x)); at(.88,110,1,(g,x)=>acuri(g,x,MB-8,1.1,x,{boc:true})); at(.44,110,1,(g,x)=>acuri(g,x,MB-8,1,x,{boc:true}));
    for(let i=0;i<10;i++){ const r=hsh(s+i*1.9), y=MB-40-hsh(i*7)*150; at(r,20,1,(g,x)=>bromelia(g,x,y,1.1,x)); }
    for(const [r,y] of [[.14,200],[.3,150],[.6,220],[.72,170]]) at(r,40,2,(g,x)=>teia(g,x,y,18+hsh(x)*12,x));
    zf(3,(g,a,b)=>fFolhas(g,a,b,MB,s)); for(const r of [.27,.62]) at(r,40,5,(g,x)=>cupinzeiro(g,x,MB+34,1.1,x)); at(.12,40,5,(g,x)=>cupinzeiro(g,x,MB+20,.8,x));
    fire(46); break;
  case 'ninhal':
    zf(0,(g,a,b)=>midAgua(g,a,b,s,{})); capoes(9,HZ+2,HZ+30,true,7); voo(2); voo(7,true);
    for(const [r,k] of [[.14,1.25],[.37,1.4],[.6,1.2],[.84,1.35]]) at(r,240,1,(g,x)=>{ ell(g,x,MB-12,150,10,'#6a6a4a'); ell(g,x,MB-14,130,6,'#8a8a5a'); const ends=arvoreSeca(g,x,MB-12,k,x,{guano:true});
      ends.forEach((e,i)=>{ const v=hsh(x+i*3.7); if(v>.55){ ninho(g,e[0],e[1]+4,.8,x+i); tuiuiu(g,e[0]-8,e[1]-2,.9,x+i,{f:v>.75?1:-1}); if(v>.8) tuiuiu(g,e[0]+12,e[1]-1,.8,x+i+1,{f:-1}); } else if(v>.35) garca(g,e[0],e[1],.8,x+i); else if(v>.25) colhereiro(g,e[0],e[1],.8,x+i); }); });
    for(const r of [.25,.5,.72,.95]) at(r,40,1,(g,x)=>tuiuiu(g,x,MB-20,1.1,x,{f:hsh(x)>.5?1:-1}));
    zf(3,(g,a,b)=>fGuano(g,a,b,MB,s)); at(.62,60,5,(g,x)=>ninho(g,x,MB+40,.9,s)); fire(20); water(0,1,HZ,MB-30); break;
  case 'jofre': {
    const land=(g,a,b)=>{ for(const [y,h] of rowsP(HZ+90,MB,2,.06)){ const t=(y-HZ-90)/(MB-HZ-90); R(g,a,y,b-a,h,mix('#8a5a3a','#b0703c',t)); } R(g,a,HZ+88,b-a,3,'#5a3a26'); capimBorda(g,a,b,HZ+92,s,['#7a9a44'],.5); };
    zf(0,(g,a,b)=>{ midAgua(g,a,b,s,{ilhas:false}); const l1=X0+L*.3, l2=X0+L*.7; if(a<l1) land(g,a,Math.min(b,l1)); if(b>l2) land(g,Math.max(a,l2),b); });
    capoes(12,HZ+1,HZ+12,true,8); voo(3); voo(2,true);
    at(.47,360,1,(g,x)=>refl(g,x-300,x+320,MB-250,MB-28,G=>chalana(G,x-280,MB-28,s),{d:40}));
    at(.49,600,1,(g,x)=>doca(g,x-560,x+560,MB-26,s)); for(const r of [.33,.48,.63]) at(r,30,1,(g,x)=>{ mourao(g,x,MB-20,90,x); R(g,x-10,MB-118,20,14,'#2a2a34'); emitW(g,G=>R(G,x-7,MB-115,14,9,'#ffe0a0')); glow(g,x,MB-110,50,'#ffb060',.06,5); reg(LAMPS,{x:x/RS,y:(MB-110)/RS,r:20}); });
    at(.68,170,1,(g,x)=>refl(g,x-20,x+190,MB-90,MB-34,G=>barco(G,x,MB-34,s,true),{d:20})); at(.62,170,1,(g,x)=>refl(g,x-20,x+190,HZ+70,HZ+110,G=>barco(G,x,HZ+110,s+1,true),{d:16}));
    at(.12,460,1,(g,x)=>posto(g,x-200,MB-8,s)); at(.26,120,1,(g,x)=>placaMadeira(g,x-60,MB-130,['PORTO JOFRE','TRANSPANTANEIRA KM 147'],s,{s:2,yb:MB-6}));
    at(.86,140,1,(g,x)=>arvore(g,x,MB-10,1.15,s)); at(.96,90,1,(g,x)=>caranda(g,x,MB-10,1.1,s));
    const d0=X0+L*.3, d1=X0+L*.68; zf(3,(g,a,b)=>{ if(a<d0) fTerra(g,a,Math.min(b,d0),MB,s,'#a8603a'); if(b>d1) fTerra(g,Math.max(a,d1),b,MB,s,'#a8603a'); if(b>d0&&a<d1) fDoca(g,Math.max(a,d0),Math.min(b,d1),MB,s); });
    fire(14); eyes(6,HZ+40,MB-40); water(.28,.72,HZ,HH); break; }
  case 'pontequebrada': {
    const gaps=[[.2,.236],[.47,.5],[.73,.766]], gap=x=>gaps.some(([p,q])=>x>=X0+L*p&&x<X0+L*q);
    zf(0,(g,a,b)=>midAgua(g,a,b,s,{})); capoes(11,HZ+1,HZ+16,true,9); voo(4);
    at(.5,3000,1,(g,x)=>refl(g,x-2900,x+2900,HZ+50,HZ+98,G=>ponteMadeira(G,x-2880,x+2880,HZ+76,.7,s,{hz:.15,pil:22,quebra:xx=>hsh(Math.floor(xx/400)*1.7)>.7}),{d:40}));
    for(let i=0;i<8;i++){ const r=hsh(s+i*2.7), y=HZ+90+hsh(i*3)*80; at(r,40,1,(g,x)=>{ g.save(); tabua(g,x,y,50+hsh(x)*40,6,WOODG,x); g.restore(); R(g,x,y+7,60,1,'#d8e8f0'); }); }
    seg(0,1,1,(g,a,b)=>{ for(let x=Math.floor(a/90)*90;x<b+90;x+=90){ if(gap(x)||gap(x+90)) { if(!gap(x)) { mourao(g,x,MB+4,30,x); line(g,x,MB-26,x+30,MB-4,WOODG[3],4); } continue; } mourao(g,x,MB+4,46,x); tabua(g,x,MB-40,90,6,WOODG,x); } });
    zf(3,(g,a,b)=>fPonte(g,a,b,MB,s,gap)); for(const [p,q] of gaps) for(let i=0;i<3;i++){ const x=X0+L*(p+(q-p)*hsh(i+p*10)*.6), y=MB+40+i*55; add(x-10,x+120,5,g=>{ tabua(g,x,y,40+hsh(i)*50,5,WOODG,x+i); R(g,x-4,y+6,70,1,'#d8e8f0'); }); }
    eyes(8,HZ+40,MB-30); water(0,1,HZ,HH); break; }
  case 'rio': {
    const bt=HZ+4, bw=HZ+34, wy1=MB-2;
    zf(0,(g,a,b)=>{ ciliar(g,a,b,bt+2,s); barrancoRaiz(g,a,b,bt,bw,s); rioAgua(g,a,b,s,bw,wy1); });
    voo(2); voo(5,true);
    for(const [r,w] of [[.28,260],[.6,190]]) at(r,w+60,1,(g,x)=>{ ell(g,x,bw+3,w*.5,7,'#7a5a3a'); ell(g,x,bw+1,w*.48,5,'#c8a878'); ell(g,x-w*.1,bw-1,w*.3,2,'#e0c898'); for(let i=0;i<3;i++){ const dx=(i-1)*w*.3+hsh(x+i)*20; jacare(g,x+dx,bw+1,.5+hsh(x+i*3)*.1,x+i,{boca:i!==1,f:i%2?1:-1}); } tuiuiu(g,x+w*.42,bw+1,.5,x); garca(g,x-w*.45,bw+1,.45,x); });
    at(.45,240,1,(g,x)=>{ esqueletoChalana(g,x-210,MB-50,s); for(let y=MB-58;y<MB-46;y+=2) for(let xx=x-216;xx<x+216;xx+=6) if(hsh(xx*.3+y)>.3) R(g,xx,y,6,1,hsh(xx+y)>.8?'#d8c49a':'#7a5a3a'); });
    at(.8,200,1,(g,x)=>redemoinho(g,x,MB-46,84,s)); at(.8,220,1,(g,x)=>{ jacare(g,x-150,MB-26,.75,s,{boia:true,f:1}); jacare(g,x+170,MB-62,.6,s+1,{boia:true,f:-1}); });
    at(.12,120,5,(g,x)=>{ canoa(g,x-70,MB+22,s); R(g,x-70,MB+20,140,2,'#3a2a1a'); mourao(g,x+110,MB+40,40,x,WOODG); bezL(g,[[x+64,MB+8],[x+90,MB+30],[x+110,MB+6]],'#c8b080',1); line(g,x-90,MB+34,x-30,MB+4,'#5a4430',3); ell(g,x-92,MB+36,8,3,'#5a4430'); });
    for(const [r,y] of [[.05,MB+70],[.22,MB+44],[.37,MB+120],[.56,MB+64],[.67,MB+160],[.94,MB+96]]) at(r,60,5,(g,x)=>ossada(g,x,y,x));
    for(const [r,y,k] of [[.16,MB+130,1],[.5,MB+36,.8],[.73,MB+90,1.1],[.88,MB+180,1.25],[.3,MB+190,1.2]]) at(r,60,5,(g,x)=>costelas(g,x,y,k,x));
    zf(3,(g,a,b)=>fAreia(g,a,b,MB,s,{col:'#c8b088',capim:false,molhada:true,rastros:true}));
    eyes(14,bw+10,MB-20); water(0,1,bw,MB); break; }
  }
}

/* =====================================================================
   TILES DO MID
   ===================================================================== */
const TILE=2048, NT=Math.ceil(WORLD*RS/TILE), midTiles=new Array(NT).fill(null);
const [mid]=mk(1,1);
let built=false, engineDM=false, fromSky=false;
const MASK={};
const GRADE=[[0,'#9088d6'],[.3,'#8880ce'],[.5,'#746cb8'],[.546,'#5e569a'],[.556,'#8c84c6'],[.68,'#9c94ce'],[.86,'#827ab8'],[1,'#544c88']];
const GRADES={noite:GRADE,dusk:[[0,'#f8d8d8'],[.3,'#f0c8cc'],[.5,'#e0b0bc'],[.6,'#d8a8b8'],[.68,'#e8c0c4'],[.86,'#d4a8b4'],[1,'#a880a0']],
  dia:[[0,'#fffaf2'],[.3,'#fcf6f2'],[.5,'#f8f2f0'],[.6,'#f2ecee'],[.68,'#faf4f0'],[.86,'#f0e8ec'],[1,'#dcd4e4']]};
let LIGHT='noite', RL='noite', PREV=null;
const lightOf=m=>m==='manha'||m==='tarde'||m==='dia'?'dia':m==='anoitecer'||m==='dusk'?'dusk':'noite';
function setLight(m,now){ const l=lightOf(m); if(l===LIGHT) return; PREV=!now&&midTiles.some(Boolean)?{t:midTiles.slice(),a:1,ready:false}:null; midTiles.fill(null); job=null; LIGHT=l; }
const LAY={}, SATK={noite:.26,dusk:.18,dia:.14};
function gradeLayer(c,g){ if(!MASK.c) [MASK.c,MASK.g]=mk(TILE,HH); MASK.g.clearRect(0,0,TILE,HH); MASK.g.drawImage(c,0,0);
  g.globalCompositeOperation='saturation'; g.globalAlpha=SATK[RL]||0; g.fillStyle='#ff2a2a'; if(g.globalAlpha>0) g.fillRect(0,0,TILE,HH); g.globalAlpha=1;
  g.globalCompositeOperation='multiply'; const gk='gr'+RL; if(!LAY[gk]){ LAY[gk]=g.createLinearGradient(0,0,0,HH); (GRADES[RL]||GRADE).forEach(([o,col])=>LAY[gk].addColorStop(o,col)); } g.fillStyle=LAY[gk]; g.fillRect(0,0,TILE,HH);
  g.globalCompositeOperation='destination-in'; g.drawImage(MASK.c,0,0); g.globalCompositeOperation='source-over'; }
function tileJob(i){ const [c,g]=mk(TILE,HH), tx=i*TILE, lo=tx, hi=tx+TILE; if(!LAY.c) [LAY.c,LAY.g]=mk(TILE,HH); const Lg=LAY.g;
  const els=DLs.filter(e=>e.x1>lo&&e.x0<hi), zs=[...new Set(els.map(e=>e.z))]; let n=0; const lt=LIGHT;
  return {i,c,lt,done:()=>n>=zs.length,step(){ const z=zs[n++]; RL=lt;
    Lg.setTransform(1,0,0,1,0,0); Lg.clearRect(0,0,TILE,HH); Lg.translate(-tx,0); LQ=[];
    for(const e of els) if(e.z===z) e.f(Lg,lo,hi);
    const q=LQ; LQ=null; Lg.setTransform(1,0,0,1,0,0); gradeLayer(LAY.c,Lg); Lg.translate(-tx,0);
    for(const [k,fn,T] of q) if(k===0){ Lg.save(); if(T) Lg.setTransform(T); fn(Lg); Lg.restore(); }
    g.setTransform(1,0,0,1,0,0); g.drawImage(LAY.c,0,0); g.translate(-tx,0);
    for(const [k,fn,T] of q) if(k===1&&lt!=='dia'){ g.save(); if(T) g.setTransform(T); fn(g); g.restore(); } RL='noite'; }}; }
let job=null;
function renderTile(i){ const J=(job&&job.i===i&&job.lt===LIGHT)?job:tileJob(i); if(J===job) job=null; while(!J.done()) J.step(); return J.c; }
function tileAt(i){ if(!midTiles[i]) midTiles[i]=renderTile(i); return midTiles[i]; }
function idle(ms){ const t0=performance.now(); while(job && performance.now()-t0<ms){ if(midTiles[job.i]){ job=null; break; } job.step(); if(job.done()){ if(job.lt===LIGHT) midTiles[job.i]=job.c; job=null; } } return !!job; }
function warm(cam){ if(!built) build(); const px=Math.round(cam*RS), i0=Math.max(0,Math.floor(px/TILE)), i1=Math.min(NT-1,Math.floor((px+HW-1)/TILE)); for(let i=i0;i<=i1;i++) tileAt(i); }
function drawMid(g,cam){ if(!built) build(); if(!fromSky) engineDM=true;
  const px=Math.round(cam*RS), T=g.getTransform(); g.save(); g.setTransform(1,0,0,1,T.e,T.f); g.imageSmoothingEnabled=false;
  const i0=Math.max(0,Math.floor(px/TILE)), i1=Math.min(NT-1,Math.floor((px+HW-1)/TILE)); let ok=true;
  for(let i=i0;i<=i1;i++){ const P=PREV&&PREV.t[i];
    if(P&&!midTiles[i]){ ok=false; g.drawImage(P,i*TILE-px,0); if(!job) job=tileJob(i); continue; }
    g.drawImage(tileAt(i),i*TILE-px,0); if(P&&PREV.ready){ g.globalAlpha=Math.max(0,PREV.a); g.drawImage(P,i*TILE-px,0); g.globalAlpha=1; } }
  g.restore();
  if(PREV){ if(ok){ PREV.ready=true; PREV.a-=.04; if(PREV.a<=0) PREV=null; } else if(!engineIdle) setTimeout(()=>idle(1e9),0); }
  for(let i=0;i<NT;i++) if(midTiles[i]&&(i<i0-1||i>i1+2)) midTiles[i]=null;
  const nx=i1+1; if(!PREV&&nx<NT&&!midTiles[nx]&&(!job||job.i!==nx)){ job=tileJob(nx); if(!engineIdle) setTimeout(()=>idle(1e9),0); } }
let engineIdle=false;

/* =====================================================================
   CÉU, HORIZONTE E ESPELHO D'ÁGUA (por modo)
   ===================================================================== */
const SKYP={
  manha:{g:['#4a8ad0','#5a98d8','#6aa6e0','#7cb4e6','#90c2ec','#a6ceee','#bcd8ee','#d2e0e8','#e8e4d8','#f6e0b0'],sol:true,moon:['#fffff4','#fff6d0','#ffe9a6','#f6d47e'],mr:22,mx:210,my:118,glow:'#fff0c0',
    cloud:['#b8b4cc','#dcdcea','#fbf6ee','#fff4d8'],lx:-1,f1:'#8aa0c0',f1w:'#d8e0e8',f2:'#5e7a8a',f2w:'#c8d8c0',water:'#6a9aa8',wa:.34,mist:'#f4ece0'},
  tarde:{g:['#2a68c8','#3474ce','#4282d6','#5290dc','#62a0e2','#76aee6','#8cbcea','#a4caec','#bcd6ec','#d0e0ec'],sol:true,moon:['#fffff4','#fffad8','#fff0b0','#f8dc80'],mr:22,mx:780,my:48,glow:'#fff6d0',
    cloud:['#a8acc8','#d8dcec','#f8f8fc','#ffffff'],lx:1,f1:'#7e96bc',f1w:'#c8d4e6',f2:'#4e6a5a',f2w:'#a8c09a',water:'#4a86a8',wa:.36},
  anoitecer:{g:['#241c58','#342266','#4a2a72','#66327a','#86407c','#a84a78','#c85a68','#e07050','#f08a3e','#f8b048'],star:'#f0d8ff',ns:50,sol:true,moon:['#fff6d0','#ffd078','#ff9a4a','#e8683a'],mr:40,mx:560,my:HZ-14,glow:'#ff9a4a',
    cloud:['#4a2458','#8a3a6a','#ff9a5a','#ffd080'],lx:0,under:true,f1:'#4a3060',f1w:'#ff9a5a',f2:'#2a1a34',f2w:'#ff8a4a',water:'#5a2a3a',wa:.24},
  noite:{g:['#040818','#060c22','#0a1230','#0e1838','#121e42','#16244a','#1a2a52','#1e3058','#24365c','#2c3c60'],star:'#e0e8ff',ns:240,milky:true,moon:['#fffbe8','#efe8cc','#cfc6a6','#a89e84'],mr:24,mx:700,my:66,glow:'#8aa8ff',
    cloud:['#0e1430','#182040','#283456','#3e4a6e'],lx:-1,f1:'#141c38',f1w:'#4a5a8a',f2:'#0a1020',f2w:'#3a4a7a',water:'#0e1830',wa:.4},
  lua:{g:['#120206','#1e0408','#2a060c','#3a0a10','#4c0e14','#601218','#74181c','#882020','#9a2a26','#a8382c'],star:'#ffd0c8',ns:120,moon:['#ffb08a','#f0603e','#c4342a','#86181a'],mr:60,mx:640,my:96,glow:'#ff4a3a',
    cloud:['#2a0610','#40101a','#5c1822','#86302c'],lx:-1,f1:'#3a0c18',f1w:'#ff7a5a',f2:'#1e040c',f2w:'#ff5a3a',water:'#3a0810',wa:.42}};
const skyCache={}, stripCache={};
function skyRowCol(P,y){ const n=P.g.length, f=Math.max(0,Math.min(n-1.001,y/(HZ+2)*n)), i=Math.floor(f); return mix(P.g[i],P.g[Math.min(n-1,i+1)],f-i); }
function sol(g,P,mx,my,mr){ const S=P.moon; ell(g,mx,my,mr+3,mr+3,S[3]); ell(g,mx,my,mr,mr,S[2]); ell(g,mx-mr*.08,my-mr*.08,mr*.84,mr*.84,S[1]); ell(g,mx-mr*.2,my-mr*.2,mr*.5,mr*.5,S[0]); }
function lua(g,P,mx,my,mr){ ell(g,mx,my,mr,mr,P.moon[1]); ell(g,mx-mr*.15,my-mr*.15,mr*.82,mr*.82,P.moon[0]); for(let dy=-mr;dy<=mr;dy++){ const hw=Math.sqrt(mr*mr-dy*dy); R(g,mx+hw*.55,my+dy,hw*.45,1,P.moon[2]); R(g,mx+hw*.85,my+dy,hw*.15,1,P.moon[3]); }
  [[-.3,-.25,.34,.2],[.05,.1,.22,.3],[-.45,.3,.16,.12],[.35,-.3,.12,.1]].forEach(([dx,dy,rx,ry])=>ell(g,mx+dx*mr,my+dy*mr,rx*mr,ry*mr+2,P.moon[2])); }
function skyCanvas(mode){ if(skyCache[mode]) return skyCache[mode]; const P=SKYP[mode], [c,g]=mk(HW,HZ+4), n=P.g.length, bh=(HZ+4)/n;
  for(let i=0;i<n;i++){ R(g,0,i*bh,HW,bh+1,P.g[i]); if(i<n-1){ g.fillStyle=P.g[i+1]; for(let y=Math.round((i+1)*bh)-4;y<Math.round((i+1)*bh);y++) for(let x=(y%2)*2;x<HW;x+=(y%4<2?4:2)) g.fillRect(x,y,2,1); } }
  if(P.milky){ for(let i=0;i<14;i++){ const u=i/13, cx=80+u*820, cy=150-u*130; g.save(); g.globalAlpha=.05; ell(g,cx,cy,90,30,'#8a9ad8'); g.globalAlpha=.04; ell(g,cx,cy,50,16,'#c8d0f0'); g.restore(); }
    for(let i=0;i<500;i++){ const u=hsh(i*1.37), cx=80+u*820, cy=150-u*130+(hsh(i*2.9)-.5)*60*(1-Math.abs(hsh(i*5.1)-.5)); g.fillStyle=hsh(i*3.3)>.7?'#e8ecff':'#8a94c0'; g.fillRect(cx,cy,1,1); } }
  const NS=P.ns||0; for(let i=0;i<NS;i++){ const x=Math.floor(hsh(i*3.1)*HW), y=Math.floor(Math.pow(hsh(i*7.3),1.5)*(HZ-20)), v=hsh(i*1.9); g.fillStyle=v>.85?'#ffffff':v>.5?P.star:mix(P.star,P.g[3],.5); g.fillRect(x,y,v>.7?2:1,v>.7?2:1); if(v>.96){ g.fillRect(x-2,y,6,1); g.fillRect(x,y-2,1,6); } }
  const mx=P.mx, my=P.my, mr=P.mr; g.save(); g.globalCompositeOperation='lighter'; for(let k=7;k>=1;k--){ g.globalAlpha=P.sol?.035:.03; ell(g,mx,my,mr*(1+k*(P.sol?.8:.5)),mr*(1+k*(P.sol?.6:.5)),P.glow); } g.restore();
  if(P.sol) sol(g,P,mx,my,mr); else lua(g,P,mx,my,mr);
  if(mode==='anoitecer'){ R(g,0,HZ-3,HW,7,'#ffc060'); for(let x=0;x<HW;x+=2) if(hsh(x)>.5) R(g,x,HZ-5,2,2,'#ffd890'); }
  return skyCache[mode]=c; }
// cúmulo: silhueta de sombra, corpo e luz deslocados pro lado do sol; anoitecer acende a barriga
function cumulus(g,x,yb,w,h,P,s){ const C=P.cloud, lx=P.lx||0, pf=[], n=Math.max(5,Math.round(w/18));
  for(let i=0;i<n;i++){ const u=hsh(s+i*1.3), env=Math.sin(Math.PI*u), r=h*(.25+.55*env*(.5+hsh(s*3+i)*.7)); pf.push([x-w/2+w*u,yb-r*.6-env*h*.5*hsh(s*7+i),r]); }
  pf.sort((p,q)=>q[1]-p[1]);
  for(const [px,py,r] of pf) ell(g,px,py,r,r*.8,C[0]); R(g,x-w*.42,yb-h*.22,w*.84,h*.22,C[0]);
  for(const [px,py,r] of pf) ell(g,px+lx*r*.12,py-r*.16,r*.84,r*.62,C[1]);
  for(const [px,py,r] of pf) if(py<yb-h*.25) ell(g,px+lx*r*.26,py-r*.34,r*.52,r*.38,C[2]);
  for(const [px,py,r] of pf) if(py<yb-h*.45&&hsh(px)>.3) ell(g,px+lx*r*.36,py-r*.5,r*.24,r*.16,C[3]);
  if(P.under){ for(const [px,py,r] of pf) if(py>yb-h*.5) ell(g,px,py+r*.42,r*.7,r*.2,C[2]); R(g,x-w*.4,yb-3,w*.8,3,C[3]); R(g,x-w*.25,yb-1,w*.5,1,'#fff0c0'); }
  else R(g,x-w*.4,yb-2,w*.8,2,mix(C[0],C[1],.4)); }
function streak(g,x,y,len,c,c2){ R(g,x,y,len,2,c); R(g,x+len*.15,y-2,len*.6,2,c2||c); R(g,x-len*.1,y+2,len*.4,1,c); }function cloudStrip(mode,lvl){ const k='c'+lvl+mode; if(stripCache[k]) return stripCache[k]; const P=SKYP[mode], W0=lvl===1?2600:2200, [c,g]=mk(W0,HZ);
  const N=lvl===1?9:14; for(let i=0;i<N;i++){ const cx=hsh(i*4.3+lvl)*W0, cy=lvl===1?50+hsh(i*7.1)*70:HZ-20-hsh(i*7.1)*50, w=lvl===1?160+hsh(i*2.2)*240:80+hsh(i*2.2)*140, h=lvl===1?30+hsh(i*3.9)*30:12+hsh(i*3.9)*14;
    for(const off of [0,-W0,W0]) cumulus(g,cx+off,cy,w,h,P,i+lvl*31); }
  if(lvl===2||mode==='anoitecer'||mode==='manha') for(let i=0;i<20;i++){ const x=hsh(i*5.7)*W0, y=lvl===1?30+hsh(i*3.1)*90:HZ-60-hsh(i*3.1)*60, len=80+hsh(i)*220; for(const off of [0,-W0,W0]) streak(g,x+off,y,len,P.cloud[mode==='anoitecer'?2:1],P.cloud[3]); }
  return stripCache[k]=c; }
function farStrip(mode,lvl){ const k='f'+lvl+mode; if(stripCache[k]) return stripCache[k]; const P=SKYP[mode], W0=lvl===1?2880:2400, [c,g]=mk(W0,HZ+1), cc=rmp(lvl===1?P.f1:P.f2), wc=lvl===1?P.f1w:P.f2w;
  if(lvl===1){ for(const [px,w,h] of [[300,520,46],[1500,700,62],[2400,360,30]]) for(const o of [0,W0,-W0]) morrariaDist(g,px+o-w/2,px+o+w/2,HZ,px,mix(cc[2],P.g[8],.35));
    for(let x=0;x<W0;x+=2){ const y=Math.round(HZ-5-Math.abs(lowf(x,3,1))*9-(hsh(Math.floor(x/14))>.8?3:0)); R(g,x,y,2,HZ+1-y,cc[2]); if(hsh(x*.7)>.6) R(g,x,y,2,1,wc); }
    for(let i=0;i<40;i++){ const x=hsh(i*3.3)*W0, h=10+hsh(i)*10, y=HZ-6; R(g,x,y-h,1,h,cc[2]); ell(g,x,y-h,3,2,cc[2]); } }
  else { for(let x=0;x<W0;x+=2){ const v=lowf(x,7,2), y=Math.round(HZ-4-Math.max(0,v+.2)*30-Math.abs(Math.sin(x*.05))*3); if(v<-.35) continue; R(g,x,y,2,HZ+1-y,cc[2]); }
    for(let i=0;i<W0/24;i++){ const x=i*24+hsh(i*3.7)*12, v=lowf(x,7,2); if(v<-.3) continue; const yy=HZ-6-Math.max(0,v+.2)*30; ell(g,x,yy,10+hsh(i)*8,6+hsh(i*3)*4,cc[2]); ell(g,x-3,yy-3,6,3,mix(cc[2],wc,.35)); }
    for(let i=0;i<30;i++){ const x=hsh(i*9.1)*W0, h=30+hsh(i*2)*28, y=HZ-3; R(g,x,y-h,2,h,cc[2]); for(let a=0;a<6.28;a+=.4) line(g,x,y-h,x+Math.cos(a)*9,y-h+Math.sin(a)*6,cc[2]); R(g,x-4,y-h-4,4,1,wc); } }
  return stripCache[k]=c; }
function farRefl(mode,lvl){ const k='r'+lvl+mode; if(stripCache[k]) return stripCache[k]; const src=farStrip(mode,lvl), P=SKYP[mode], [c,g]=mk(src.width,src.height);
  for(let y=0;y<src.height;y++){ const dd=HZ-y; if(dd%3===2) continue; g.drawImage(src,0,y,src.width,1,Math.round(Math.sin(dd*.7)*2),y,src.width,1); }
  g.globalCompositeOperation='source-atop'; g.globalAlpha=.4; g.fillStyle=P.water; g.fillRect(0,0,c.width,c.height); return stripCache[k]=c; }
// espelho: gradiente refletido comprimido (perto = zênite), cor de água crescendo pra perto, coluna de brilho do sol/lua e marolas
function reflCanvas(mode){ const k='w'+mode; if(stripCache[k]) return stripCache[k]; const P=SKYP[mode], h=HH-HZ, [c,g]=mk(HW,h), kk=(HZ-6)/h;
  for(let y=0;y<h;y++){ const t=y/h, col=mix(skyRowCol(P,HZ-1-y*kk*(.4+.6*t)),P.water,P.wa+t*.32); R(g,0,y,HW,1,col); if(y%5===3) R(g,0,y,HW,1,mix(col,P.water,.25)); }
  const mx=P.mx, gl=P.moon[1];
  for(let y=1;y<h;y+=2){ const t=y/h, ww=(P.sol?(mode==='anoitecer'?60:24):18)*(1+t*2.6)*(P.mr/30); for(let j=0;j<3;j++){ const v=hsh(y*3.1+j), x=mx+(v-.5)*ww*2, w=4+hsh(y+j*7)*ww*.5*(1-Math.abs(v-.5)); g.globalAlpha=Math.max(0,(1-t*.7))*(.5+v*.5); R(g,x-w/2,y,w,1,j?gl:P.moon[0]); } }
  g.globalAlpha=1; for(let i=0;i<900;i++){ const y=Math.floor(Math.pow(hsh(i*1.3),1.3)*h), x=hsh(i*2.7)*HW, w=4+hsh(i*5.1)*(10+y*.12); R(g,x,y,w,1,hsh(i*7)>.5?mix(P.water,'#ffffff',.18):mix(P.water,'#000010',.2)); }
  return stripCache[k]=c; }
function strip(g,cv,off,y){ const w=cv.width, o=((Math.round(off)%w)+w)%w; g.drawImage(cv,-o,y); if(w-o<HW) g.drawImage(cv,w-o,y); }
const scratch={};
function drawSky(g,mode,cam,t){ if(!built) build(); mode=SKYP[mode]?mode:'noite'; const P=SKYP[mode], T=g.getTransform();
  g.save(); g.setTransform(1,0,0,1,T.e,T.f); g.imageSmoothingEnabled=false;
  g.drawImage(skyCanvas(mode),0,0); const cn=cam*RS*.045+(t||0)*3, cf=cam*RS*.02+(t||0)*1.2, f1=cam*RS*.06, f2=cam*RS*.15;
  strip(g,cloudStrip(mode,2),cf,0); strip(g,cloudStrip(mode,1),cn,0); strip(g,farStrip(mode,1),f1,0); strip(g,farStrip(mode,2),f2,0);
  { const RA=AID.rio, wR=Math.max(0,Math.min(1,(cam+W*.5-(RA.x0-240))/420)); if(wR>0){ g.globalAlpha=wR; g.drawImage(stormCanvas(mode),0,0); g.globalAlpha=1; } }
  g.drawImage(reflCanvas(mode),0,HZ);
  g.save(); g.beginPath(); g.rect(0,HZ,HW,HH-HZ); g.clip(); g.translate(0,2*HZ); g.scale(1,-1);
  g.globalAlpha=.32; strip(g,cloudStrip(mode,2),cf,0); strip(g,cloudStrip(mode,1),cn,0); g.globalAlpha=.85; strip(g,farRefl(mode,1),f1,0); strip(g,farRefl(mode,2),f2,0); g.restore();
  if(P.mist){ g.globalAlpha=.16; R(g,0,HZ-8,HW,18,P.mist); g.globalAlpha=.1; R(g,0,HZ-16,HW,34,P.mist); g.globalAlpha=1; }
  g.restore();
  if(!engineDM){ if(!scratch.c){ [scratch.c,scratch.g]=mk(HW,HH); } const S=scratch.g; S.setTransform(1,0,0,1,0,0); S.clearRect(0,0,HW,HH);
    fromSky=true; drawMid(S,cam); fromSky=false; S.globalCompositeOperation='source-atop'; S.fillStyle=TINT[mode]; S.fillRect(0,0,HW,HH); S.globalCompositeOperation='source-over';
    g.save(); g.setTransform(1,0,0,1,T.e,T.f); g.drawImage(scratch.c,0,0); g.restore(); } }

/* =====================================================================
   LUZES (aditivas): lampiões, vaga-lumes, olhos de jacaré, brilho e rastro da lua na água
   ===================================================================== */
const haloCache={};
function halo(col){ if(haloCache[col]) return haloCache[col]; const [c,g]=mk(128,128); for(let i=0;i<8;i++){ const r=64*(1-i/8); g.globalAlpha=.06+i*.012; ell(g,64,64,r,r,col); } return haloCache[col]=c; }
function drawLights(g,cam,mode,t){ if(mode==='manha'||mode==='tarde') return; const T=g.getTransform(); g.save(); if(mode==='anoitecer') g.globalAlpha=.7; g.setTransform(1,0,0,1,T.e,T.f); g.globalCompositeOperation='lighter'; g.imageSmoothingEnabled=false;
  const tt=t||0, warm=mode==='lua'?'#ff7a4a':'#ffc070', fl=1+Math.sin(tt*9)*.03, base=mode==='anoitecer'?.7:1;
  for(const Lp of LAMPS){ let sx=(Lp.fx!=null?Lp.fx-cam*1.25:Lp.x-cam)*RS; if(sx<-200||sx>HW+200) continue; const r=(Lp.r||24)*RS*fl, sy=Lp.y*RS; g.drawImage(halo(warm),sx-r,sy-r,r*2,r*2); }
  if(mode!=='anoitecer'){ for(const F of FIREF){ const sx=(F.x-cam)*RS; if(sx<-20||sx>HW+20) continue; const ph=Math.sin(tt*2.3+F.p*7); if(ph<.2) continue; const dx=Math.sin(tt*.7+F.p)*10, dy=Math.cos(tt*.5+F.p*2)*6;
      g.globalAlpha=base*ph; g.drawImage(halo(mode==='lua'?'#ffb070':'#c8ff70'),sx+dx-9,F.y*RS+dy-9,18,18); g.fillStyle='#f4ffc0'; g.fillRect(Math.round(sx+dx),Math.round(F.y*RS+dy),2,2); }
    for(const E of EYES){ const sx=(E.x-cam)*RS; if(sx<-20||sx>HW+20) continue; const ph=Math.sin(tt*.4+E.x); if(ph<-.6) continue; g.globalAlpha=.9; g.drawImage(halo('#ff3a2a'),sx-10,E.y*RS-8,20,16); g.fillStyle='#ff6a4a'; g.fillRect(Math.round(sx-4),Math.round(E.y*RS),2,1); g.fillRect(Math.round(sx+3),Math.round(E.y*RS),2,1); } }
  const PM=SKYP[mode]; for(const Wt of WATER){ const a=Math.max(Wt.x0,cam), b=Math.min(Wt.x1,cam+W); if(b<=a) continue; const y0=Wt.y0, y1=Wt.y1;
    if(mode==='lua'){ g.globalAlpha=.14; g.fillStyle='#a01020'; g.fillRect(Math.round((a-cam)*RS),y0+2,Math.round((b-a)*RS),y1-y0-2); }
    g.fillStyle=mode==='lua'?'#ff6a4a':mode==='anoitecer'?'#ffb070':'#9ab0e8';
    for(let wx=Math.floor(a/19)*19;wx<b;wx+=19){ const v=hsh(wx*.13); if(v<.4) continue; const ph=Math.sin(tt*2.2+v*40); if(ph<.25) continue; g.globalAlpha=ph*.4; g.fillRect(Math.round((wx-cam)*RS+Math.sin(tt*.8+v*9)*5),Math.round(y0+6+v*(y1-y0-10)),Math.round(5+v*12),1); }
    const mxs=PM.mx, ax=(a-cam)*RS, bx=(b-cam)*RS; if(mxs>ax&&mxs<bx){ g.fillStyle=PM.moon[0]; for(let y=y0+2;y<y1;y+=2){ const v=hsh(y*1.7), ph=Math.sin(tt*2+y*.3), ww=(8+v*22)*(.6+(y-HZ)/(HH-HZ)*1.6)*(PM.mr/30); g.globalAlpha=Math.max(0,.16+.12*ph)*base; g.fillRect(Math.round(mxs-ww/2+Math.sin(tt*.9+y*.21)*5),y,Math.round(ww),1); } }
    g.globalAlpha=1; }
  g.restore(); }

/* =====================================================================
   PRIMEIRO PLANO (parallax 1.25) — vegetação pantaneira em silhueta
   ===================================================================== */
const SIL='#0c120e', SILM='#18221a', RIM='#4a6a6a';
const fgCache={};
function silFill(g,w){ for(let y=0;y<HH;y+=2) R(g,0,y,w,2,mix('#26302a',SIL,Math.min(1,y/HH*1.4+.25))); }
function fgClip(w,draw){ const [c,g]=mk(w,HH); g.save(); g.beginPath(); draw(g); g.clip(); silFill(g,w); g.restore(); return [c,g]; }
function fgSprite(t){ if(fgCache[t]) return fgCache[t]; let w=200, c, g;
  if(t==='capim'){ w=260; [c,g]=mk(w,HH); for(let i=0;i<42;i++){ const x=w/2+(hsh(i)-.5)*180, h=90+hsh(i*3)*170, lean=(hsh(i*5)-.5)*120; for(let k=0;k<5;k++) line(g,x+k-2,HH,x+lean*(1-k*.1),HH-h,k===0&&lean<0?RIM:mix(SILM,SIL,hsh(i+k)),1); if(hsh(i*7)>.75) { R(g,x+lean-1,HH-h-10,3,12,SILM); } } }
  else if(t==='aguape'){ w=240; [c,g]=mk(w,HH); for(let i=0;i<14;i++){ const x=20+hsh(i)*200, y=HH-6-hsh(i*3)*40, r=12+hsh(i*5)*12; ell(g,x,y,r,r*.6,SIL); for(let a=-3;a<-.3;a+=.15) R(g,x+Math.cos(a)*r,y+Math.sin(a)*r*.6,2,1,mix(RIM,SIL,.4)); } for(let i=0;i<4;i++){ const x=40+hsh(i*7)*160, y=HH-40; line(g,x,y,x+3,y-60,SIL,3); for(let j=0;j<6;j++) ell(g,x+3+(j%2?5:-5),y-60+j*6,5,3,'#1e1228'); } }
  else if(t==='mourao'){ w=260; [c,g]=fgClip(w,G=>{ G.rect(w/2-13,HH-300,26,300); }); R(g,w/2-13,HH-300,1,300,RIM); R(g,w/2-15,HH-304,30,6,SIL); for(const y of [HH-270,HH-200,HH-130]){ sag(g,0,y,w/2-13,y+5,5,SIL,2); sag(g,w/2+13,y+5,w,y+1,5,SIL,2); for(let x=6;x<w;x+=18) R(g,x,y+3,3,2,SIL); } }
  else if(t==='acuri'){ w=460; [c,g]=mk(w,HH); const S=[SIL,SIL,SIL,SILM,SIL,SIL]; foliage(g,60,40,150,90,S,7,14,26); foliage(g,w-40,70,120,110,S,9,14,26); for(let i=0;i<14;i++){ const x=hsh(i*3.3)*w, L=60+hsh(i)*120; bezL(g,[[x,60],[x+8,60+L*.5],[x-4,60+L]],SIL,3); for(let j=0;j<6;j++) ell(g,x+(j%2?6:-6),60+L*j/6,7,3,SIL); } for(let i=0;i<40;i++){ const a=hsh(i*7.1)*3.14, x=60+Math.cos(a)*150*hsh(i), y=40+Math.sin(a)*90*hsh(i*2); if(y<40) R(g,x,y,4,1,RIM); } }
  else if(t==='caranda'){ w=240; [c,g]=fgClip(w,G=>{ G.rect(w/2-12,0,24,HH); }); R(g,w/2-12,0,1,HH,RIM); for(let y=10;y<HH;y+=16) R(g,w/2-12,y,24,3,'#060a08'); }
  else if(t==='taboa'){ w=200; [c,g]=mk(w,HH); for(let i=0;i<16;i++){ const x=w/2+(hsh(i)-.5)*150, h=150+hsh(i*3)*200, lean=(hsh(i*5)-.5)*60; line(g,x,HH,x+lean,HH-h,SIL,3); if(hsh(i*7)>.5){ R(g,x+lean*.9-5,HH-h*.9,10,34,'#1a100c'); R(g,x+lean*.9-5,HH-h*.9,1,34,RIM); } } }
  else if(t==='galho'){ w=360; [c,g]=mk(w,HH); const br=(x0,y0,a,len,th,d)=>{ const x1=x0+Math.cos(a)*len, y1=y0+Math.sin(a)*len; for(let k=0;k<th;k++) line(g,x0+k,y0,x1+k*.5,y1,k===0?RIM:SIL,1); if(d>0){ br(x1,y1,a-.5,len*.7,Math.max(1,th*.6),d-1); br(x1,y1,a+.4,len*.65,Math.max(1,th*.6),d-1); } }; br(0,30,.35,140,12,4); }
  else if(t==='cipo'){ w=160; [c,g]=mk(w,HH); for(let i=0;i<5;i++){ const x=20+i*30, L=180+hsh(i)*220; bezL(g,[[x,0],[x+20,L*.5],[x-10,L]],SIL,3); for(let j=0;j<10;j++){ const yy=L*j/10; ell(g,x+(j%2?8:-6),yy,7,4,SILM); } } }
  else if(t.startsWith('placa:')){ w=200; const txt=t.slice(6); [c,g]=fgClip(w,G=>{ G.rect(w/2-6,60,12,HH-60); }); const pw=Math.max(110,tw(txt,1)+18); R(g,w/2-pw/2,70,pw,30,'#2a1c12'); R(g,w/2-pw/2,70,pw,2,'#5a4430'); R(g,w/2-pw/2+2,73,pw-4,25,'#3a2818'); text(g,txt,w/2-tw(txt,1)/2,82,1,'#a89878'); }
  else { [c,g]=mk(w,HH); }
  return fgCache[t]={c,w}; }
function drawFG(g,cam){ const T=g.getTransform(); g.save(); g.setTransform(1,0,0,1,T.e,T.f); g.imageSmoothingEnabled=false;
  for(const it of FGI){ const sx=Math.round((it.x-cam)*1.25*RS); if(sx<-260||sx>HW+260) continue; const sp=fgSprite(it.t); g.drawImage(sp.c,sx-sp.w/2,0); } g.restore(); }

/* =====================================================================
   BUILD
   ===================================================================== */
const PLACA={transpantaneira:'TRANSPANTANEIRA',porteira:'FAZ. LUA CHEIA',curral:'CURRAL',campoalagado:'TRANSPANTANEIRA',corixo:'CORIXO',baia:'BAIA',salina:'SALINA',cordilheira:'CORDILHEIRA',ninhal:'NINHAL',jofre:'PORTO JOFRE',pontequebrada:'PONTE KM 120',rio:'RIO CUIABA'};
const FGW=new Set(['campoalagado','corixo','baia','pontequebrada','ninhal','rio']);
const PLACA0=new Set(['porteira','curral','corixo','baia','salina','cordilheira','ninhal','pontequebrada','rio']);
const KF={transpantaneira:['capim','mourao','','caranda'],porteira:['mourao','','capim',''],curral:['mourao','','capim','mourao'],campoalagado:['taboa','','capim',''],
  corixo:['taboa','cipo','','galho'],baia:['taboa','','capim',''],salina:['caranda','','capim',''],cordilheira:['cipo','','galho','cipo'],ninhal:['galho','','taboa',''],
  jofre:['mourao','','capim',''],pontequebrada:['mourao','taboa','','galho'],rio:['galho','','taboa','']};
function build(){
  WINDOWS.length=0; LAMPS.length=0; BULBS.length=0; FGI.length=0; WATER.length=0; FIREF.length=0; EYES.length=0; DL.length=0; midTiles.fill(null);
  AREAS.forEach(compose);
  DLs=DL.slice().sort((a,b)=>a.z-b.z||a.i-b.i);
  AREAS.forEach(A=>{ if(PLACA0.has(A.id)) FGI.push({t:'placa:'+PLACA[A.id],x:A.x0+30}); let lT=-1e9, lC=-1e9; const st=640;
    for(let wx=A.x0+300;wx<A.x1-80;wx+=st){ const u=(wx-A.x0)/(A.x1-A.x0); if(A.id==='rio'&&u>.55&&u<.98) continue;
      const t=pick(KF[A.id]||['capim'],hsh(wx*.37)); if(!t) continue; if(t==='taboa'){ if(!FGW.has(A.id)||wx-lT<1600) continue; lT=wx; } if(t==='capim'){ if(wx-lC<1300) continue; lC=wx; } FGI.push({t,x:wx+hsh(wx)*120}); } });
  built=true; engineDM=false;
  const [c0,g0]=mk(1,1); RL='noite'; collecting=true; for(const e of DLs){ g0.setTransform(1,0,0,1,0,0); e.f(g0,e.x0,e.x1); } collecting=false;
  const uniq=(arr,key)=>{ const m=new Map(); arr.forEach(o=>m.set(key(o),o)); return [...m.values()]; };
  const wins=uniq(WINDOWS,o=>o.x.toFixed(1)+','+o.y.toFixed(1)); WINDOWS.length=0; WINDOWS.push(...wins);
  const lm=uniq(LAMPS,o=>(o.fx!=null?'f'+o.fx:o.x.toFixed(1))+','+o.y.toFixed(1)); LAMPS.length=0; LAMPS.push(...lm);
  tileAt(0);
}

const TINT={manha:'rgba(255,214,190,.05)',tarde:'rgba(255,190,110,.06)',anoitecer:'rgba(150,50,90,.14)',noite:'rgba(20,14,64,.14)',lua:'rgba(120,10,26,.4)'};
return {TINT,setLight,light:()=>LIGHT,build,mid,midTiles,drawMid,idle:ms=>{ engineIdle=true; return idle(ms); },warm,drawFG,FGI,drawSky,drawLights,AREAS,AID,WINDOWS,LAMPS,BULBS,W,H,BASE,WORLD,OUT,RS,TILE};
})();
