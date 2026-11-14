/* PUZZLE — fonte de arte (editável). Build: npm run art
   Minigame "abrir a fechadura do baú": fechadura/tampa em canvas pixelado (cores de BAU.mats), fios com volume,
   teclado de metal, runas. API: PUZZLE.mount(host,{tipo:'fio'|'num'|'sym',tempo,bau,auto,onDone}) -> {cancel} */
const PUZZLE=(function(){
  const CSS=`.pz{position:absolute;inset:0;display:grid;place-items:center;background:rgba(10,5,20,.62);z-index:20;font-family:"Pixelify Sans","Courier New",monospace;--ac:#ffd23f;--ac2:#fff0a0;--ac3:#5a420a;--wd:#62391e}
.pz *{box-sizing:border-box}
.pz .box{position:relative;width:min(380px,calc(100% - 16px));max-height:calc(100% - 8px);overflow:hidden;background:#1e1333;border:3px solid #000;border-radius:10px;box-shadow:6px 6px 0 #000,inset 0 0 0 2px #3d2a62;padding:8px 10px 10px;display:grid;gap:6px;color:#f5eefe}
.pz .box::before{content:"";position:absolute;left:0;right:0;top:0;height:5px;background:var(--ac);box-shadow:0 2px 0 #000}
.pz .hd{display:flex;align-items:center;gap:8px;justify-content:space-between;margin-top:5px}
.pz .hd b{font-family:"Bungee",Impact,sans-serif;font-weight:400;color:#ffd23f;font-size:clamp(12px,3.3vw,16px);text-shadow:2px 2px 0 #000;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pz .hd span{font-family:"Bungee",Impact,sans-serif;font-size:clamp(12px,3.2vw,15px);color:#3ed4ff;text-shadow:2px 2px 0 #000;min-width:4.2em;text-align:right}
.pz.low .hd span{color:#ff2e4d;animation:pzbl .4s steps(2) infinite}
.pz .bar{height:12px;border:2px solid #000;background:#120a1f;border-radius:3px;overflow:hidden;position:relative}
.pz .bar i{display:block;height:100%;background:linear-gradient(#b8ff9a 0 30%,#4ad86a 30% 70%,#1f8a3c 70%)}
.pz.low .bar i{background:linear-gradient(#ffb0a0 0 30%,#ff2e4d 30% 70%,#a01428 70%)}
.pz .bar::after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0 9px,rgba(0,0,0,.55) 9px 11px)}
.pz canvas{display:block;image-rendering:pixelated;image-rendering:crisp-edges;width:100%}
.pz .lock{height:auto;aspect-ratio:80/30;max-height:92px;width:auto;margin:0 auto;max-width:100%}
.pz .q{font-size:clamp(12px,3.1vw,14px);line-height:1.25;text-align:center;color:#dcd2f0;margin:0}
.pz .q b{color:#ffd23f;font-weight:700}
.pz button{font-family:inherit;font-weight:700;cursor:pointer;color:#f5eefe;padding:0;-webkit-tap-highlight-color:transparent}
.pz button:focus-visible{outline:3px solid #ffd23f;outline-offset:1px}
.pz button:disabled{cursor:default}
.pz .wb{position:relative;width:100%;aspect-ratio:100/54;max-height:132px;margin:0 auto}
.pz .wb canvas{position:absolute;inset:0;height:100%}
.pz .wb button{position:absolute;width:24%;height:29%;background:transparent;border:0;border-radius:6px}
.pz .wb button.l{left:0}.pz .wb button.r{right:0}
.pz .code{display:flex;justify-content:center;gap:6px}
.pz .code span{width:40px;height:44px;display:grid;place-items:center;border:2px solid #000;border-radius:5px;background:#07140d;box-shadow:inset 0 3px 0 rgba(0,0,0,.6),inset 0 -2px 0 rgba(120,255,160,.12);font-family:"Bungee",Impact,sans-serif;font-size:24px;color:#6fff98;text-shadow:0 0 6px #2fe064}
.pz .code span:empty::after{content:"_";color:#1f5a34;text-shadow:none}
.pz .pad{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}
.pz .key{min-height:38px;font-family:"Bungee",Impact,sans-serif;font-weight:400;font-size:clamp(15px,4.2vw,19px);border:2px solid #000;border-radius:5px;color:#1c1233;text-shadow:0 1px 0 rgba(255,255,255,.5);
  background:linear-gradient(#f0f4fa 0 12%,#b4bccc 12% 58%,#8c94a8 58% 88%,#50566a 88%);box-shadow:0 3px 0 #000,inset 1px 0 0 #fff,inset -1px 0 0 #6a7288}
.pz .key:active:not(:disabled){transform:translateY(3px);box-shadow:0 0 0 #000,inset 1px 0 0 #fff}
.pz .key.hit{background:linear-gradient(#fff6b0 0 12%,#ffd23f 12% 58%,#c8961a 58% 88%,#7a5410 88%)}
.pz .seq{display:flex;justify-content:center;gap:6px}
.pz .seq span{width:42px;height:42px;display:grid;place-items:center;border:2px solid #000;border-radius:5px;background:#0d0818;box-shadow:inset 0 3px 0 rgba(0,0,0,.6);transition:none}
.pz .seq span canvas{width:28px;height:28px;opacity:.45}
.pz .seq span.done{background:#1c3a2a;box-shadow:inset 0 0 0 2px #4ad86a,0 0 8px #4ad86a}
.pz .seq span.done canvas{opacity:1}
.pz .opts{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
.pz .rune{min-height:46px;display:grid;place-items:center;border:2px solid #000;border-radius:5px;background:linear-gradient(#4a3a74 0 10%,#2a1b46 10%);box-shadow:0 3px 0 #000,inset 1px 0 0 #6a58a0}
.pz .rune canvas{width:32px;height:32px}
.pz .rune:active:not(:disabled){transform:translateY(3px);box-shadow:0 0 0 #000}
.pz .rune.ok{background:#1c3a2a;box-shadow:0 3px 0 #000,inset 0 0 0 2px #4ad86a;opacity:.55}
.pz .ft{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:12px;color:#ac9dca}
.pz .ft button{min-height:28px;font-size:13px;padding:0 10px;border:2px solid #000;border-radius:5px;background:#2a1b46;box-shadow:0 2px 0 #000}
.pz .stamp{position:absolute;left:50%;top:50%;font-family:"Bungee",Impact,sans-serif;font-size:clamp(26px,8vw,44px);color:#ffd23f;-webkit-text-stroke:1.5px #000;text-shadow:3px 3px 0 #000;white-space:nowrap;pointer-events:none;animation:pzst .5s steps(5) forwards}
.pz .stamp.bad{color:#ff4a5a}
@keyframes pzst{from{transform:translate(-50%,-50%) rotate(-8deg) scale(2);opacity:0}to{transform:translate(-50%,-50%) rotate(-8deg) scale(1);opacity:1}}
@keyframes pzbl{50%{opacity:.45}}
@keyframes pzsh{12%{transform:translateX(-7px)}37%{transform:translateX(6px)}62%{transform:translateX(-4px)}87%{transform:translateX(3px)}}
.pz.shake .box{animation:pzsh .3s steps(8)}
.pz.shake .box{box-shadow:6px 6px 0 #000,inset 0 0 0 2px #ff2e4d}
@media (max-width:420px){.pz .box{padding:6px 8px 8px;gap:5px}.pz .code span{width:36px;height:40px}.pz .lock{max-height:72px}}
.pz.tight .box{gap:4px;padding:5px 8px 7px}.pz.tight .lock{max-height:44px}.pz.tight>.box>.q{display:none}.pz.tight .wb{max-height:104px}
.pz.tight .q{font-size:11px}.pz.tight .code span{width:32px;height:32px;font-size:19px}.pz.tight .key{min-height:27px;font-size:14px;box-shadow:0 2px 0 #000}.pz.tight .pad{gap:4px}
.pz.tight .rune{min-height:38px}.pz.tight .seq span{width:34px;height:34px}.pz.tight .seq span canvas{width:24px;height:24px}.pz.tight .ft>span{display:none}.pz.tight .ft{justify-content:flex-end}
.pz.tight .ft button{min-height:24px;font-size:12px}
@media (prefers-reduced-motion:reduce){.pz.shake .box{animation:none}.pz.low .hd span{animation:none}.pz .stamp{animation:none;transform:translate(-50%,-50%) rotate(-8deg)}}`;
  function css(){ if(document.getElementById('pz-css')) return; const s=document.createElement('style'); s.id='pz-css'; s.textContent=CSS; document.head.appendChild(s); }
  const NOMES={comum:'Baú comum',medico:'Baú médico',militar:'Baú militar',raro:'Baú raro'};
  const FX={comum:['#fff4c0','#ffd24a'],medico:['#ffe0e0','#ff7a7a'],militar:['#f2ffc0','#b8e060'],raro:['#ffd0f0','#ff4a8a']};
  const shuffle=a=>{ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
  function tipoBau(b){ if(NOMES[b]) return b; for(const k in NOMES) if(NOMES[k]===b||(b&&String(b).toLowerCase().indexOf(k)>=0)) return k; return 'comum'; }
  function mats(t){
    try{ if(typeof BAU!=='undefined'&&BAU.mats) return BAU.mats(t); }catch(e){}
    const r=c=>[c,c,c,c]; return {wood:r('#9a6234'),band:r('#c8ccd8'),lock:r('#a0a6b8'),gem:r('#ff3a5a'),steel:r('#b4bccc'),dark:r('#100810')};
  }
  const RUNAS=[
    ['..###..','.##....','##.....','##.....','##.....','.##....','..###..'],
    ['...#...','..###..','.#.#.#.','#..#..#','...#...','...#...','...#...'],
    ['...#...','..#.#..','.#...#.','#..#..#','.#...#.','..#.#..','...#...'],
    ['#######','......#','.....#.','..###..','.#.....','#......','#######'],
    ['#.....#','.#...#.','..#.#..','...#...','..#.#..','.#...#.','#.....#'],
    ['#..#..#','#..#..#','#..#..#','.#.#.#.','..###..','...#...','...#...']];
  function runa(i,col){ const c=document.createElement('canvas'); c.width=c.height=9; const g=c.getContext('2d'); const R=RUNAS[i];
    [['#000',1],[col,0]].forEach(([f,o])=>{ g.fillStyle=f; for(let y=0;y<7;y++) for(let x=0;x<7;x++) if(R[y][x]==='#') g.fillRect(x+o+(o?0:0),y+o,1,1); });
    g.fillStyle=col; for(let y=0;y<7;y++) for(let x=0;x<7;x++) if(R[y][x]==='#') g.fillRect(x,y,1,1);
    return c; }
  const hsh=(i,s)=>{ const v=Math.sin(i*12.9898+s*78.233)*43758.5453; return v-Math.floor(v); };

  // ---------- fechadura / tampa do baú (80x30 px lógicos)
  function drawLock(cv,M,t,S){
    const g=cv.getContext('2d'), W=80, H=30; g.clearRect(0,0,W,H);
    const R=(c,x,y,w,h)=>{ g.fillStyle=c; g.fillRect(Math.round(x),Math.round(y),w,h); };
    const o=S.open, fx=FX[t];
    // brilho atrás (abriu)
    if(o>0){ const pul=0.75+0.25*Math.sin(S.t*8); g.globalAlpha=0.5*o*pul; R(fx[1],26,10,28,20); g.globalAlpha=0.35*o*pul; R(fx[0],30,6,20,24); g.globalAlpha=1;
      g.globalAlpha=0.55*o; for(let i=0;i<5;i++){ const x=34+i*3; R(fx[0],x,Math.max(0,3-o*3),1,10); } g.globalAlpha=1; }
    // tampa: madeira + faixas (topo curvo)
    R('#000',1,5,78,25); R(M.wood[3],2,6,76,23); R(M.wood[1],2,7,76,19); R(M.wood[0],2,6,76,2); R(M.wood[2],2,22,76,4); R(M.wood[3],2,26,76,3);
    for(let i=0;i<14;i++){ R(M.wood[2],4+Math.floor(hsh(i,3)*70),9+Math.floor(hsh(i,5)*12),5,1); }
    for(let i=0;i<8;i++){ R(M.wood[0],4+Math.floor(hsh(i,7)*70),10+Math.floor(hsh(i,9)*11),3,1); }
    // faixas verticais
    const strap=x=>{ R('#000',x-1,5,10,25); R(M.band[1],x,6,8,23); R(M.band[0],x,6,2,23); R(M.band[3],x+7,6,1,23); R(M.band[2],x,26,8,3); R(M.band[3],x+2,12,1,1); R(M.band[0],x+4,10,1,1); [9,24].forEach(y=>{ R(M.band[0],x+3,y,2,2); R(M.band[3],x+4,y+1,1,1); }); };
    strap(8); strap(64);
    if(t==='medico'){ R(M.band[1],14,13,6,2); R(M.band[1],16,11,2,6); R(M.band[0],14,13,6,1); R(M.band[1],60,13,0,0); R(M.band[1],56-2,13,6,2); R(M.band[1],58-2,11,2,6); }
    if(t==='militar'){ for(let k=0;k<3;k++){ R(M.band[1],20+k*3,22,2,4); R(M.band[1],54+k*3,22,2,4); } R(M.wood[3],20,26,9,1); R(M.wood[3],54,26,9,1); }
    if(t==='raro'){ R('#000',2,5,76,1); R(M.band[1],2,6,76,2); R(M.band[0],2,6,76,1); R(M.band[3],2,8,76,1); [[22,16],[58,16]].forEach(([x,y])=>{ R(M.band[1],x-1,y-1,4,4); R(M.gem[1],x,y,2,2); R(M.gem[0],x,y,1,1); }); }
    // placa da fechadura
    const lx=29, ly=11;
    R('#000',lx-1,ly-1,24,20); R(M.lock[2],lx,ly,22,18); R(M.lock[1],lx,ly,21,17); R(M.lock[0],lx,ly,21,1); R(M.lock[0],lx,ly,1,17); R(M.lock[3],lx+21,ly,1,18); R(M.lock[3],lx,ly+17,22,1);
    R(M.lock[3],lx+2,ly+2,1,1); R(M.lock[3],lx+19,ly+2,1,1); R(M.lock[3],lx+2,ly+14,1,1); R(M.lock[3],lx+19,ly+14,1,1);
    // haste (arco de aço): sobe ao abrir
    const up=Math.round(5*o), sx=lx+4;
    const arc=(dy)=>{ R('#000',sx-1,ly-9+dy,15,10); R(M.steel[2],sx,ly-8+dy,13,9); R(M.dark[1],sx+3,ly-5+dy,7,8);
      R(M.steel[1],sx,ly-8+dy,13,2); R(M.steel[0],sx+1,ly-8+dy,10,1); R(M.steel[0],sx,ly-8+dy,2,9); R(M.steel[3],sx+11,ly-6+dy,2,7); R(M.steel[3],sx+3,ly-3+dy,1,1); };
    if(o>0.05){ R(M.dark[0],sx+8,ly-1,5,2); }
    arc(-up);
    // buraco da chave / gema
    const cx=lx+11, cy=ly+8;
    if(t==='raro'){ R('#000',cx-4,cy-4,9,9); R(M.gem[2],cx-3,cy-3,7,7); R(M.gem[1],cx-3,cy-3,6,6); R(M.gem[0],cx-2,cy-2,2,2); if(o>0){ g.globalAlpha=o; R('#fff',cx-1,cy-1,3,3); g.globalAlpha=1; } }
    else { R('#000',cx-2,cy-3,5,5); R(M.dark[2],cx-1,cy-2,3,3); R('#000',cx-1,cy+1,3,5); R(M.dark[3],cx,cy+1,1,4); if(o>0){ g.globalAlpha=o; R(fx[0],cx-1,cy-2,3,3); g.globalAlpha=1; } }
    // erro: tinta vermelha + piscar
    if(S.err>0){ g.globalAlpha=Math.min(1,S.err)*0.4; R('#ff2e4d',1,0,78,30); g.globalAlpha=1; }
    // fagulhas
    S.p.forEach(q=>{ g.globalAlpha=Math.max(0,Math.min(1,q.l*2)); R(q.c,q.x,q.y,q.s,q.s); }); g.globalAlpha=1;
  }

  // ---------- fios (100x54 px lógicos)
  function drawWires(cv,S){
    const g=cv.getContext('2d'), W=100, H=54; g.clearRect(0,0,W,H);
    const R=(c,x,y,w,h)=>{ g.fillStyle=c; g.fillRect(Math.round(x),Math.round(y),w,h); };
    // painel de fundo (placa metálica escura)
    R('#000',0,0,W,H); R('#241a3a',1,1,W-2,H-2); R('#1a1230',1,H-4,W-2,3); R('#3d2a62',1,1,W-2,1);
    for(let i=0;i<30;i++){ R('#2e2250',2+Math.floor(hsh(i,2)*94),3+Math.floor(hsh(i,4)*46),2,1); }
    [[3,3],[W-5,3],[3,H-5],[W-5,H-5]].forEach(([x,y])=>{ R('#000',x-1,y-1,4,4); R('#b4bccc',x,y,2,2); R('#343a4e',x+1,y+1,1,1); });
    const ys=[10,27,44], L=S.L, Rr=S.Rr;
    const wire=(x0,y0,x1,y1,sag,col,ph)=>{
      const n=Math.max(1,Math.ceil(Math.abs(x1-x0)*1.5)), pts=[];
      for(let i=0;i<=n;i++){ const s=i/n, e=s*s*(3-2*s); pts.push([x0+(x1-x0)*s, y0+(y1-y0)*e+Math.sin(Math.PI*s)*sag+(ph?Math.sin(s*9+ph)*1.4*Math.sin(Math.PI*s):0)]); }
      pts.forEach(([x,y])=>R('#000',x-2,y-2,5,5));
      pts.forEach(([x,y])=>R(col[2],x-1,y-1,3,3));
      pts.forEach(([x,y])=>R(col[1],x-1,y-1,3,2));
      pts.forEach(([x,y],i)=>{ R(col[0],x-1,y-1,2,1); if(i%5===0) R(col[3],x,y+1,1,1); });
    };
    for(let i=0;i<3;i++){
      const y=ys[i], lc=L[i].c, rc=Rr[i].c, conn=S.conn[L[i].n], sel=S.sel===i;
      // soquete direito
      R('#000',84,y-7,14,15); R('#50566a',85,y-6,12,13); R('#8c92a4',85,y-6,12,2); R('#30344a',85,y+5,12,2); R('#0a060c',84+3,y-4,5,9); R(rc[1],93,y-5,3,11); R(rc[0],93,y-5,1,11);
      // plugue esquerdo
      R('#000',2,y-7,14,15); R('#50566a',3,y-6,12,13); R('#8c92a4',3,y-6,12,2); R('#30344a',3,y+5,12,2); R(lc[2],3,y-4,4,9); R(lc[0],3,y-4,1,9); R('#b4bccc',7,y-2,8,5); R('#f0f4fa',7,y-2,8,1);
      if(conn){ const j=Rr.findIndex(r=>r.n===L[i].n); wire(15,y,85,ys[j],6+i*0.0,lc,0);
        const f=S.flash[L[i].n]||0; if(f>0){ g.globalAlpha=f; R('#fff',46,(y+ys[j])/2-1,4,4); g.globalAlpha=1; }
      } else {
        const ex=sel?58:34; wire(15,y,ex,y+(sel?-3:7),sel?3:4,lc,sel?S.t*6:0);
        R('#b4bccc',ex,y+(sel?-3:7)-1,2,3); R('#343a4e',ex+1,y+(sel?-3:7)+1,1,1);
      }
      if(sel){ g.globalAlpha=0.6+0.4*Math.sin(S.t*10); R('#ffd23f',1,y-8,16,1); R('#ffd23f',1,y+8,16,1); R('#ffd23f',1,y-8,1,17); R('#ffd23f',16,y-8,1,17); g.globalAlpha=1; }
      // LED de ligação
      R('#000',83,y-9,0,0); const on=conn; R('#000',18,y-9,0,0); R(on?'#6fff98':'#50566a',96,y-6,2,2);
    }
    if(S.errF>0){ g.globalAlpha=Math.min(1,S.errF)*0.35; R('#ff2e4d',0,0,W,H); g.globalAlpha=1; }
    S.p.forEach(q=>{ g.globalAlpha=Math.max(0,Math.min(1,q.l*2)); R(q.c,q.x,q.y,q.s,q.s); }); g.globalAlpha=1;
  }

  function mount(host,o){
    css(); o=Object.assign({tipo:'fio',tempo:5,bau:'comum',onDone:()=>{},auto:false},o);
    if(getComputedStyle(host).position==='static') host.style.position='relative';
    const T=tipoBau(o.bau), M=mats(T), nome=NOMES[o.bau]||o.bau||NOMES[T];
    const el=document.createElement('div'); el.className='pz'; el.setAttribute('role','dialog'); el.setAttribute('aria-label','Puzzle do baú');
    el.style.setProperty('--ac',M.band[1]);
    const titles={fio:'Ligue cada plugue ao terminal da mesma cor',num:'Descubra o código de 3 dígitos',sym:'Toque as runas na ordem do selo'};
    el.innerHTML=`<div class="box"><div class="hd"><b>${nome} trancado</b><span class="t" aria-live="off">${o.tempo.toFixed(1)} s</span></div>
      <canvas class="lock" width="80" height="30"></canvas><div class="bar"><i></i></div><p class="q">${titles[o.tipo]||''}</p><div class="body"></div>
      <div class="ft"><span>${o.auto?'Squad tentando sozinho…':'Sem resposta em '+o.tempo+' s, o baú é pulado.'}</span><button type="button" class="skipb">Pular</button></div></div>`;
    host.appendChild(el); if(host.clientHeight&&host.clientHeight<340) el.classList.add('tight');
    const body=el.querySelector('.body'), barI=el.querySelector('.bar i'), tEl=el.querySelector('.t'), lockCv=el.querySelector('.lock');
    const t0=performance.now(); let done=false, raf=0, autoT=null, lraf=0, last=performance.now(), removed=false;
    const S={open:0,err:0,t:0,p:[]}; let opening=false; const WS={sel:-1,conn:{},flash:{},t:0,errF:0,p:S.p,L:[],Rr:[]}; let wireCv=null;
    function spark(n,cols,x,y,sp){ for(let i=0;i<n;i++){ const a=Math.random()*Math.PI*2, v=(0.4+Math.random())*sp; S.p.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-sp*0.4,l:0.5+Math.random()*0.5,c:cols[i%cols.length],s:1+(Math.random()<0.3?1:0)}); } }
    function loop(now){ if(removed) return; const dt=Math.min(0.05,(now-last)/1000); last=now; S.t+=dt; WS.t=S.t;
      if(opening) S.open=Math.min(1,S.open+dt*4);
      S.err=Math.max(0,S.err-dt*2.5); WS.errF=S.err;
      for(const k in WS.flash) WS.flash[k]=Math.max(0,WS.flash[k]-dt*3);
      S.p=S.p.filter(q=>{ q.x+=q.vx*dt*30; q.y+=q.vy*dt*30; q.vy+=dt*40; q.l-=dt*1.4; return q.l>0; }); WS.p=S.p;
      drawLock(lockCv,M,T,S); if(wireCv) drawWires(wireCv,WS);
      lraf=requestAnimationFrame(loop); }
    lraf=requestAnimationFrame(loop);
    function finish(ok,skip){ if(done) return; done=true; cancelAnimationFrame(raf); clearTimeout(autoT);
      if(ok){ opening=true; spark(26,FX[T].concat(['#fff']),40,18,3); } else if(!skip){ S.err=1; }
      const st=document.createElement('div'); st.className='stamp'+(ok?'':' bad'); st.textContent=ok?'ABRIU!':(skip?'PULOU':'ERROU'); el.querySelector('.box').appendChild(st);
      el.querySelectorAll('button').forEach(b=>b.disabled=true);
      setTimeout(()=>{ removed=true; cancelAnimationFrame(lraf); el.remove(); o.onDone({ok,skip,ms:Math.round(performance.now()-t0)}); },650); }
    function err(){ S.err=1; spark(14,['#ff2e4d','#ffb030','#fff'],40,18,2.6); el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
    function tick(){ if(done) return; const left=Math.max(0,o.tempo-(performance.now()-t0)/1000); barI.style.width=(left/o.tempo*100)+'%'; el.classList.toggle('low',left<1.6); tEl.textContent=left.toFixed(1)+' s';
      if(left<=0){ finish(false,true); return; } raf=requestAnimationFrame(tick); }
    el.querySelector('.skipb').onclick=()=>finish(false,true);
    let solve=null;
    if(o.tipo==='fio'){
      const C=[{n:'vermelho',c:['#ffb0b0','#e8323a','#a01428','#5a0820']},{n:'azul',c:['#b0e0ff','#3a8ae8','#1c4a9a','#0a2458']},{n:'amarelo',c:['#fff6b0','#ffd23f','#c8961a','#6a4a08']}];
      const L=shuffle(C), Rr=shuffle(C); WS.L=L; WS.Rr=Rr; let ok=0;
      body.innerHTML=`<div class="wb"><canvas width="100" height="54"></canvas></div>`;
      const wb=body.querySelector('.wb'); wireCv=wb.querySelector('canvas');
      const ys=[10,27,44];
      L.forEach((c,i)=>{ const b=document.createElement('button'); b.type='button'; b.className='l'; b.dataset.l=c.n; b.style.top=((ys[i]-8)/54*100)+'%'; b.setAttribute('aria-label','plugue '+c.n); wb.appendChild(b);
        b.onclick=()=>{ if(done||WS.conn[c.n]) return; WS.sel=WS.sel===i?-1:i; }; });
      Rr.forEach((c,i)=>{ const b=document.createElement('button'); b.type='button'; b.className='r'; b.dataset.r=c.n; b.style.top=((ys[i]-8)/54*100)+'%'; b.setAttribute('aria-label','terminal '+c.n); wb.appendChild(b);
        b.onclick=()=>{ if(done||WS.sel<0||WS.conn[c.n]) return; const l=L[WS.sel];
          if(l.n===c.n){ WS.conn[c.n]=1; WS.flash[c.n]=1; WS.sel=-1; spark(8,[c.c[0],c.c[1],'#fff'],84,ys[i],2); if(++ok===3) finish(true,false); } else { err(); WS.sel=-1; } }; });
      solve=()=>{ [0,1,2].forEach(i=>{ WS.conn[C[i].n]=1; }); finish(true,false); };
    }
    if(o.tipo==='num'){
      const a=1+Math.floor(Math.random()*4), b=a*2, c=Math.max(0,b-1); const code=''+a+b+c; let cur='';
      body.innerHTML=`<p class="q">Pista: o 1º é <b>${a}</b>, o 2º é o dobro do 1º e o 3º é 1 a menos que o 2º.</p><div class="code"><span></span><span></span><span></span></div><div class="pad">${[1,2,3,4,5,6,7,8,9,0].map(n=>`<button type="button" class="key" data-n="${n}">${n}</button>`).join('')}</div>`;
      const cells=body.querySelectorAll('.code span');
      const push=n=>{ if(done||cur.length>=3) return; cur+=n; cells.forEach((s,i)=>s.textContent=cur[i]||''); if(cur.length===3){ if(cur===code) finish(true,false); else { err(); setTimeout(()=>{ cur=''; cells.forEach(s=>s.textContent=''); },260); } } };
      body.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>{ b.classList.add('hit'); setTimeout(()=>b.classList.remove('hit'),120); push(b.dataset.n); });
      el.addEventListener('keydown',e=>{ if(/^[0-9]$/.test(e.key)) push(e.key); });
      solve=()=>finish(true,false);
    }
    if(o.tipo==='sym'){
      const seq=shuffle([0,1,2,3,4,5]).slice(0,4); let k=0; const acc=FX[T][1];
      body.innerHTML=`<div class="seq">${seq.map(()=>'<span></span>').join('')}</div><div class="opts">${shuffle(seq).map(s=>`<button type="button" class="rune" data-s="${s}" aria-label="runa ${s+1}"></button>`).join('')}</div>`;
      const marks=body.querySelectorAll('.seq span');
      marks.forEach((m,i)=>m.appendChild(runa(seq[i],'#ac9dca')));
      const btns=body.querySelectorAll('[data-s]'); btns.forEach(b=>b.appendChild(runa(+b.dataset.s,'#3ed4ff')));
      const reset=()=>{ k=0; marks.forEach((m,i)=>{ m.classList.remove('done'); m.replaceChild(runa(seq[i],'#ac9dca'),m.firstChild); }); btns.forEach(x=>{ x.classList.remove('ok'); x.disabled=false; }); };
      btns.forEach(b=>b.onclick=()=>{ if(done) return; if(+b.dataset.s===seq[k]){ marks[k].classList.add('done'); marks[k].replaceChild(runa(seq[k],acc),marks[k].firstChild); b.classList.add('ok'); b.disabled=true; spark(4,[acc,'#fff'],20+k*14,18,1.6); if(++k===4) finish(true,false); } else { err(); reset(); } });
      solve=()=>finish(true,false);
    }
    if(o.auto){ const willSolve=Math.random()<0.55; if(willSolve) autoT=setTimeout(solve,(1.4+Math.random()*(o.tempo-2))*1000); }
    setTimeout(()=>{ const f=el.querySelector('.body button'); if(f && !o.auto) f.focus({preventScroll:true}); },30);
    raf=requestAnimationFrame(tick);
    return {cancel(){ if(done) return; done=true; removed=true; cancelAnimationFrame(raf); cancelAnimationFrame(lraf); clearTimeout(autoT); el.remove(); }};
  }
  return {mount};
})();
