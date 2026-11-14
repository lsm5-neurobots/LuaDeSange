/* ===== PUZZLE: overlay DOM de 5 s (fio / número / símbolo) com skip automático ===== */
const PUZZLE=(function(){
  const CSS=`.pz{position:absolute;inset:0;display:grid;place-items:center;background:rgba(8,4,16,.62);z-index:20;font-family:"Pixelify Sans","Courier New",monospace}
.pz .box{width:min(380px,94%);background:#1e1333;border:3px solid #ffd23f;border-radius:10px;box-shadow:6px 6px 0 #000;padding:12px;display:grid;gap:10px;color:#f5eefe}
.pz .hd{display:flex;align-items:center;gap:8px;justify-content:space-between}
.pz .hd b{font-family:"Bungee",Impact,sans-serif;font-weight:400;color:#ffd23f;font-size:clamp(14px,3.4vw,18px)}
.pz .hd span{font-size:13px;color:#ac9dca}
.pz .bar{height:10px;border:2px solid #000;background:#2a1b46;border-radius:3px;overflow:hidden}
.pz .bar i{display:block;height:100%;background:linear-gradient(#8bff6a,#2fb04a)}
.pz .bar.low i{background:linear-gradient(#ff8a7a,#e8323a)}
.pz .q{font-size:clamp(13px,3.2vw,15px);text-align:center;color:#dcd2f0;margin:0}
.pz button{font-family:inherit;font-weight:700;cursor:pointer;border:2px solid #000;border-radius:6px;background:#2a1b46;color:#f5eefe;min-height:40px;font-size:clamp(15px,4vw,19px)}
.pz button:focus-visible{outline:3px solid #ffd23f;outline-offset:2px}
.pz button[aria-pressed="true"]{background:#ffd23f;color:#1a0d00}
.pz button.ok{background:#2fb04a;color:#fff} .pz button.err{background:#e8323a;color:#fff}
.pz .wires{display:grid;grid-template-columns:1fr 1fr;gap:8px 30px}
.pz .wires button{display:flex;align-items:center;gap:8px;padding:0 10px}
.pz .wires i{display:inline-block;width:26px;height:10px;border:2px solid #000;border-radius:3px}
.pz .code{display:flex;justify-content:center;gap:8px}
.pz .code span{width:38px;height:44px;display:grid;place-items:center;border:2px solid #000;border-radius:6px;background:#0d0818;font-size:24px;color:#ffd23f}
.pz .pad{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}
.pz .seq{display:flex;justify-content:center;gap:8px;font-size:26px}
.pz .seq span{width:40px;height:40px;display:grid;place-items:center;border:2px solid #000;border-radius:6px;background:#0d0818}
.pz .seq span.done{background:#2fb04a}
.pz .opts{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
.pz .ft{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:12px;color:#ac9dca}
.pz .ft button{min-height:30px;font-size:13px;padding:0 10px}
.pz .stamp{position:absolute;font-family:"Bungee",Impact,sans-serif;font-size:clamp(26px,7vw,46px);color:#ffd23f;-webkit-text-stroke:1.5px #000;text-shadow:3px 3px 0 #000;transform:rotate(-8deg)}
.pz .stamp.bad{color:#ff4a5a}
.pz.shake .box{animation:pzsh .25s}
@keyframes pzsh{25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
@media (prefers-reduced-motion:reduce){.pz.shake .box{animation:none}}`;
  function css(){ if(document.getElementById('pz-css')) return; const s=document.createElement('style'); s.id='pz-css'; s.textContent=CSS; document.head.appendChild(s); }
  const NOMES={comum:'Baú comum',medico:'Baú médico',militar:'Baú militar',raro:'Baú raro'};
  const shuffle=a=>{ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
  function mount(host,o){
    css(); o=Object.assign({tipo:'fio',tempo:5,bau:'comum',onDone:()=>{},auto:false},o);
    if(getComputedStyle(host).position==='static') host.style.position='relative';
    const el=document.createElement('div'); el.className='pz'; el.setAttribute('role','dialog'); el.setAttribute('aria-label','Puzzle do baú');
    const titles={fio:'Ligue os fios da mesma cor',num:'Descubra o código de 3 dígitos',sym:'Toque os símbolos na ordem'};
    el.innerHTML=`<div class="box"><div class="hd"><b>${NOMES[o.bau]||'Baú'} trancado</b><span class="t" aria-live="polite">${o.tempo.toFixed(1)} s</span></div>
      <div class="bar"><i></i></div><p class="q">${titles[o.tipo]}</p><div class="body"></div>
      <div class="ft"><span>${o.auto?'Squad tentando sozinho…':'Sem resposta em '+o.tempo+' s, o baú é pulado.'}</span><button type="button" class="skipb">Pular</button></div></div>`;
    host.appendChild(el);
    const body=el.querySelector('.body'), barI=el.querySelector('.bar i'), bar=el.querySelector('.bar'), tEl=el.querySelector('.t');
    const t0=performance.now(); let done=false, raf=0, autoT=null;
    function finish(ok,skip){ if(done) return; done=true; cancelAnimationFrame(raf); clearTimeout(autoT);
      const st=document.createElement('div'); st.className='stamp'+(ok?'':' bad'); st.textContent=ok?'ABRIU!':(skip?'PULOU':'ERROU'); el.appendChild(st);
      el.querySelectorAll('button').forEach(b=>b.disabled=true);
      setTimeout(()=>{ el.remove(); o.onDone({ok,skip,ms:Math.round(performance.now()-t0)}); },650); }
    function err(){ el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
    function tick(){ if(done) return; const left=Math.max(0,o.tempo-(performance.now()-t0)/1000); barI.style.width=(left/o.tempo*100)+'%'; bar.classList.toggle('low',left<1.6); tEl.textContent=left.toFixed(1)+' s';
      if(left<=0){ finish(false,true); return; } raf=requestAnimationFrame(tick); }
    el.querySelector('.skipb').onclick=()=>finish(false,true);
    let solve=null;
    if(o.tipo==='fio'){
      const C=[['vermelho','#e8323a'],['azul','#3a8ae8'],['amarelo','#ffd23f']];
      const L=shuffle(C), Rr=shuffle(C); let sel=null, ok=0;
      body.innerHTML=`<div class="wires">${L.map((c,i)=>`<button type="button" data-l="${c[0]}" aria-label="fio ${c[0]}"><i style="background:${c[1]}"></i>${i+1}</button>`).join('')}${''}</div>`;
      const w=body.querySelector('.wires'); w.innerHTML='';
      for(let i=0;i<3;i++){ w.insertAdjacentHTML('beforeend',`<button type="button" data-l="${L[i][0]}" aria-label="fio ${L[i][0]}"><i style="background:${L[i][1]}"></i>fio</button><button type="button" data-r="${Rr[i][0]}" aria-label="terminal ${Rr[i][0]}"><i style="background:${Rr[i][1]}"></i>terminal</button>`); }
      w.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{ if(b.classList.contains('ok')) return; w.querySelectorAll('[data-l]').forEach(x=>x.setAttribute('aria-pressed','false')); b.setAttribute('aria-pressed','true'); sel=b; });
      w.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{ if(!sel||b.classList.contains('ok')) return; if(sel.dataset.l===b.dataset.r){ sel.classList.add('ok'); b.classList.add('ok'); sel.setAttribute('aria-pressed','false'); sel=null; if(++ok===3) finish(true,false); } else { err(); } });
      solve=()=>finish(true,false);
    }
    if(o.tipo==='num'){
      const a=1+Math.floor(Math.random()*4), b=a*2, c=Math.max(0,b-1); const code=''+a+b+c; let cur='';
      body.innerHTML=`<p class="q">Pista: o 1º é <b>${a}</b>, o 2º é o dobro do 1º e o 3º é 1 a menos que o 2º.</p><div class="code"><span></span><span></span><span></span></div><div class="pad">${[1,2,3,4,5,6,7,8,9,0].map(n=>`<button type="button" data-n="${n}">${n}</button>`).join('')}</div>`;
      const cells=body.querySelectorAll('.code span');
      const push=n=>{ if(done) return; cur+=n; cells.forEach((s,i)=>s.textContent=cur[i]||''); if(cur.length===3){ if(cur===code) finish(true,false); else { err(); cur=''; setTimeout(()=>cells.forEach(s=>s.textContent=''),200); } } };
      body.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>push(b.dataset.n));
      el.addEventListener('keydown',e=>{ if(/^[0-9]$/.test(e.key)) push(e.key); });
      solve=()=>finish(true,false);
    }
    if(o.tipo==='sym'){
      const S=['▲','●','■','◆','★','✚']; const seq=shuffle(S).slice(0,4); let k=0;
      body.innerHTML=`<div class="seq">${seq.map(s=>`<span>${s}</span>`).join('')}</div><div class="opts">${shuffle(seq).map(s=>`<button type="button" data-s="${s}" aria-label="símbolo ${s}">${s}</button>`).join('')}</div>`;
      const marks=body.querySelectorAll('.seq span');
      body.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{ if(b.dataset.s===seq[k]){ marks[k].classList.add('done'); b.classList.add('ok'); b.disabled=true; if(++k===4) finish(true,false); } else { err(); k=0; marks.forEach(m=>m.classList.remove('done')); body.querySelectorAll('[data-s]').forEach(x=>{ x.classList.remove('ok'); x.disabled=false; }); } });
      solve=()=>finish(true,false);
    }
    if(o.auto){ const willSolve=Math.random()<0.55; if(willSolve) autoT=setTimeout(solve,(1.4+Math.random()*(o.tempo-2))*1000); }
    setTimeout(()=>{ const f=el.querySelector('.body button'); if(f && !o.auto) f.focus({preventScroll:true}); },30);
    raf=requestAnimationFrame(tick);
    return {cancel(){ if(done) return; done=true; cancelAnimationFrame(raf); clearTimeout(autoT); el.remove(); }};
  }
  return {mount};
})();
