import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
p='expedicao-body.html'; s=open(p,encoding='utf8').read()
def rep(a,b):
    global s
    assert a in s, 'MISSING '+a[:90]
    s=s.replace(a,b,1)
rep("keys:{comum:1,medico:0,militar:0,raro:0},spots:[],loot:0,boss:null};","keys:{comum:1,medico:0,militar:0,raro:0},keysInit:{comum:1,medico:0,militar:0,raro:0},spots:[],loot:0,bag:{},boss:null,pzOpen:false};")
# pontos por área a partir de OBJ.KINDS[k].areas
rep("function buildSpots(){ S.spots=[]; MAP.AREAS.forEach(A=>{ if(A.id==='travessia'||A.id==='molhe') return;\n  (AREA_OBJ[A.id]||[]).forEach((k,i)=>{ const kind=OBJ_KINDS.includes(k)?k:OBJ_KINDS[i%OBJ_KINDS.length]; S.spots.push({t:'obj',kind,x:A.x0+A.len*(i?0.78:0.28),y:150,state:'normal',done:false}); });\n  (A.chests||[]).forEach(([rel,k])=>{ const tipo=CHEST_MAP[k]||'comum'; S.spots.push({t:'bau',tipo,x:A.x0+A.len*Math.min(0.92,Math.max(0.08,rel)),y:152,state:'trancado',done:false}); }); });",
"""function kindsFor(id,i){ if(!HAS_OBJ) return (AREA_OBJ[id]||OBJ_KINDS)[i%2]; const ks=OBJ_KINDS.filter(k=>(OBJ.KINDS[k].areas||[]).includes(id)); const pool=ks.length?ks:OBJ_KINDS; return pool[(i*3+id.length)%pool.length]; }
function buildSpots(){ S.spots=[]; MAP.AREAS.forEach(A=>{ if(A.id==='travessia'||A.id==='molhe') return;
  const n=(A.n%2)?2:1; for(let i=0;i<n;i++){ const kind=kindsFor(A.id,i); S.spots.push({t:'obj',kind,x:A.x0+A.len*(i?0.86:0.74),y:150,state:'fechado',done:false}); }
  (A.chests||[]).forEach(([rel,k])=>{ const tipo=CHEST_MAP[k]||'comum'; S.spots.push({t:'bau',tipo,x:A.x0+A.len*Math.min(0.92,Math.max(0.08,rel)),y:152,state:'fechado',done:false}); }); });""")
rep("S.zs=[]; S.proj=[]; S.pools=[]; S.warns=[]; S.boss=null; S.kills=0; S.cleared=0; S.loot=0;","S.zs=[]; S.proj=[]; S.pools=[]; S.warns=[]; S.boss=null; S.kills=0; S.cleared=0; S.loot=0; S.bag={}; S.keys=Object.assign({},S.keysInit); S.pzOpen=false; buildKeys();")
# baú: chave / puzzle real com pausa
i=s.index("function openChest(sp){"); j=s.index("function updateSpots(dt){")
s=s[:i]+"""const PZTIPO={comum:'fio',medico:'num',militar:'sym',raro:'sym'};
function openChest(sp){
  const tipo=sp.tipo, has=(S.keys[tipo]||0)>0, nome=HAS_BAU&&BAU.TIPOS[tipo]?BAU.TIPOS[tipo].nome:'Baú '+tipo;
  if(has){ S.keys[tipo]--; buildKeys(); sp.state='abrindo'; sp.anim=0; S.phase='chest'; S.phaseT=1.4; fx('tag','CHAVE · '+nome,sp.x,sp.y-60); log(`${nome} aberto com chave`); return; }
  S.phase='chest'; S.phaseT=99; S.pzOpen=true; ov.style.display='grid'; host.innerHTML='';
  const done=(ok,skip)=>{ if(sp.closed) return; sp.closed=true; S.pzOpen=false; ov.style.display='none'; host.innerHTML='';
    if(ok){ sp.state='abrindo'; sp.anim=0; log(`${nome}: puzzle resolvido`); S.phaseT=1.4; }
    else { sp.state='trancado'; sp.anim=0; log(`${nome}: sem chave, puzzle ${skip?'pulado após 5 s':'errado'}`); fx('tag','TRANCADO',sp.x,sp.y-60); S.phaseT=0.8; } };
  if(HAS_PZ){ try{ PUZZLE.mount(host,{tipo:PZTIPO[tipo]||'fio',tempo:5,bau:nome,auto:true,onDone:r=>done(!!(r&&r.ok),!!(r&&r.skip))}); return; }catch(e){ console.warn(e); } }
  let left=5; host.innerHTML=`<b>${nome}</b><br>sem chave · puzzle<div class="t" id="pzT">5</div><small>pula sozinho sem resposta</small>`;
  const iv=setInterval(()=>{ left-=1; const el=document.getElementById('pzT'); if(el) el.textContent=left; if(left<=0){ clearInterval(iv); done(false,true); } },1000);
}
"""+s[j:]
# vasculhar: tempo do objeto, loot real, anel de progresso
rep("if(sp.t==='obj'){ S.phase='search'; S.phaseT=1.4; sp.state='vasculhando'; sp.anim=0; fx('bubble','vasculhando…',sp.x,sp.y-56); } else openChest(sp); } }",
    "if(sp.t==='obj'){ const tm=(HAS_OBJ&&OBJ.KINDS[sp.kind].tempo||1)*1.4; S.phase='search'; S.phaseT=tm; sp.tm=tm; sp.state='vasculhando'; sp.anim=0; log('Vasculhando: '+(HAS_OBJ?OBJ.KINDS[sp.kind].nome:sp.kind)); } else openChest(sp); } }")
rep("if(sp){ sp.state='vasculhado'; const it=['+3 sucata','+1 atadura','+12 moedas','nada…','+1 lata de comida'][Math.floor(Math.random()*5)]; fx('tag',it,sp.x,sp.y-60); S.loot++;",
    "if(sp){ sp.state='vasculhado'; const L=HAS_OBJ?OBJ.KINDS[sp.kind].loot:['sucata','comida','moedas']; const it=Math.random()<0.15?null:L[Math.floor(Math.random()*L.length)]; if(it){ S.bag[it]=(S.bag[it]||0)+1; fx('tag','+1 '+it,sp.x,sp.y-60); } else fx('tag','nada…',sp.x,sp.y-60); S.loot++;")
rep("if(s.anim>0.8){ s.state='aberto'; const L=HAS_BAU&&BAU.TIPOS[s.tipo]?BAU.TIPOS[s.tipo].loot:['loot']; fx('tag',L[Math.floor(Math.random()*L.length)],s.x,s.y-64); } } });",
    "if(s.anim>1){ s.state='aberto'; const L=HAS_BAU&&BAU.TIPOS[s.tipo]?BAU.TIPOS[s.tipo].loot:['loot']; const it=L[Math.floor(Math.random()*L.length)]; S.bag[it]=(S.bag[it]||0)+1; fx('tag',it,s.x,s.y-64); } } if(s.state==='trancado') s.anim=(s.anim||0)+dt; });")
# desenho com ANCHOR + anel de progresso
rep("    let cv=null; try{ if(sp.t==='obj'&&HAS_OBJ) cv=OBJ.frame(sp.kind,sp.state==='normal'?'normal':sp.state,Math.floor((sp.anim||0)*8)%4,5); if(sp.t==='bau'&&HAS_BAU) cv=BAU.frame(sp.tipo,sp.state,Math.min(3,Math.floor((sp.anim||0)*5)),5); }catch(e){ cv=null; }\n    if(cv){ c.drawImage(cv,sx-Math.round(cv.width/2),Math.round(sp.y)-cv.height+4); }",
"""    let cv=null, an=null; try{ if(sp.t==='obj'&&HAS_OBJ){ cv=OBJ.frame(sp.kind,sp.state,Math.floor((sp.anim||0)*8)%4,5); an=OBJ.ANCHOR(sp.kind); }
      if(sp.t==='bau'&&HAS_BAU){ const f=sp.state==='abrindo'?Math.min(4,Math.floor((sp.anim||0)*5)):sp.state==='trancado'?(sp.anim<0.6?Math.floor(sp.anim*10)%3:0):0; cv=BAU.frame(sp.tipo,sp.state,f,5); an=BAU.ANCHOR(sp.tipo); } }catch(e){ cv=null; }
    if(cv){ c.drawImage(cv,sx-Math.round(an?an.ax:cv.width/2),Math.round(sp.y)-Math.round(an?an.gy:cv.height)); }
    if(sp.state==='vasculhando' && sp.tm){ const pr=Math.min(1,(sp.anim||0)/sp.tm), top=Math.round(sp.y-(cv&&cv._top!=null?(an.gy-cv._top):40)-12); c.strokeStyle='#170b1c'; c.lineWidth=3; c.beginPath(); c.arc(sx,top,6,0,Math.PI*2); c.stroke(); c.strokeStyle='#3ed4ff'; c.lineWidth=2; c.beginPath(); c.arc(sx,top,6,-Math.PI/2,-Math.PI/2+pr*Math.PI*2); c.stroke(); }""")
# pausa durante o puzzle
rep("  if(!S.paused){ const steps=","  if(!S.paused && !S.pzOpen){ const steps=")
# HUD do loot e chaves iniciais
rep('<span id="hInfo">—</span></div>','<span id="hInfo">—</span><br><span id="hBag" style="color:var(--toxic)">mochila vazia</span></div>')
rep("  const bb=document.getElementById('bossbar');","  const bag=Object.entries(S.bag); document.getElementById('hBag').textContent=bag.length?'mochila: '+bag.map(([k,v])=>k+' ×'+v).join(' · '):'mochila vazia';\n  const bb=document.getElementById('bossbar');")
rep('<span class="lbl">Chaves na mochila</span>','<span class="lbl">Chaves iniciais (clique: +1, volta a 0 depois de 3)</span>')
rep("function buildKeys(){ document.getElementById('keys').innerHTML=Object.keys(S.keys).map(k=>`<button data-k=\"${k}\" aria-pressed=\"false\" title=\"clique pra +1\">${k} ×${S.keys[k]}</button>`).join(''); document.querySelectorAll('#keys button').forEach(b=>b.onclick=()=>{ S.keys[b.dataset.k]++; buildKeys(); }); }",
    "function buildKeys(){ document.getElementById('keys').innerHTML=Object.keys(S.keys).map(k=>`<button data-k=\"${k}\" aria-pressed=\"${S.keysInit[k]>0}\" title=\"início: ${S.keysInit[k]} · agora: ${S.keys[k]}\">${k} ${S.keys[k]}/${S.keysInit[k]}</button>`).join(''); document.querySelectorAll('#keys button').forEach(b=>b.onclick=()=>{ const k=b.dataset.k; S.keysInit[k]=(S.keysInit[k]+1)%4; S.keys[k]=S.keysInit[k]; buildKeys(); }); }")
open(p,'w',encoding='utf8').write(s); print('ok')
