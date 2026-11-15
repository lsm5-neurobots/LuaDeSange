import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
p='demo-page.html'; s=open(p,encoding='utf8').read()
def rep(a,b):
    global s
    assert a in s, 'MISSING '+a[:90]
    s=s.replace(a,b,1)
# vida e dano
rep("hp:30,dmg:6,","hp:80,dmg:10,"); rep("hp:22,dmg:4,","hp:55,dmg:8,"); rep("hp:18,dmg:8,","hp:45,dmg:12,")
# estado
rep("const S={mode:'noite',","const S={attempts:1,best:0,cleared:0,mode:'noite',")
# escala das ondas
rep("const list=WAVES[S.wave%WAVES.length]; S.wave++;","const list=WAVES[S.wave%WAVES.length].slice(); S.wave++; if(S.wave>3) list.push('e'); const wm=1+0.08*(S.wave-1);")
rep("const z={kind:k,form,hp:K[k].hp*f.hp,maxhp:K[k].hp*f.hp,","const z={kind:k,form,poise:0,down:null,hp:K[k].hp*f.hp*wm,maxhp:K[k].hp*f.hp*wm,")
# golpes: não acerta caído, derrubada por acúmulo
rep("alive().forEach(z=>{ const dx=(z.x-V.x)*V.face, dy=Math.abs(z.y-V.y), w=K[z.kind].w;","alive().forEach(z=>{ if(z.down) return; const dx=(z.x-V.x)*V.face, dy=Math.abs(z.y-V.y), w=K[z.kind].w;")
rep("      else { z.prev=z.state==='hurt'?z.prev:z.state; z.state='hurt'; setAnim(z,'hurt'); if(n===3) z.stun=Math.max(z.stun,{comum:.3,incomum:.3,raro:.6,lunar:.8}[S.tier]); } } });",
    "      else { z.poise+=dmg; if((n===3 && z.poise>=z.maxhp*0.22) || z.poise>=z.maxhp*0.45) knock(z,V.face); else { z.prev=z.state==='hurt'?z.prev:z.state; z.state='hurt'; setAnim(z,'hurt'); if(n===3) z.stun=Math.max(z.stun,{comum:.3,incomum:.3,raro:.6,lunar:.8}[S.tier]); } } } });")
rep("if(any){ V.sp=Math.min(100,V.sp+9);","if(any){ V.sp=Math.min(100,V.sp+6);")
rep("let n=0; alive().forEach(z=>{ if(Math.hypot(z.x-V.x,(z.y-V.y)*2)<100){","let n=0; alive().forEach(z=>{ if(!z.down && Math.hypot(z.x-V.x,(z.y-V.y)*2)<100){")
# derrubada
rep("function burst(z){","function knock(z,dir){ z.down={t:0,dir}; z.state='down'; z.stun=0; z.poise=0; z.anim='hurt'; z.fi=2; S.shake=Math.max(S.shake,0.12); fx('burst','PÁ!',z.x,z.y-K[z.kind].top*0.6); for(let i=0;i<8;i++) S.sparks.push({x:z.x+(Math.random()-.5)*24,y:z.y-2,vx:(Math.random()-.5)*60,vy:-20-Math.random()*30,t:0,c:'#b8a8a0'}); log(K[z.kind].name+' foi derrubado'); }\nfunction burst(z){")
rep("  if(z.dead){ z.deadT+=dt; return; }",
"""  if(z.dead){ z.deadT+=dt; return; }
  if(z.state==='down'){ const d=z.down; d.t+=dt; if(d.t<0.3) z.x+=d.dir*70*dt; z.anim=d.t<1.1?'hurt':'idle'; z.fi=d.t<1.1?2:0;
    if(d.t>=1.55){ z.down=null; z.state=z.kind==='e'?'chase':z.kind==='r'?'crawl':'run'; setAnim(z,'walk'); fx('tag','LEVANTOU',z.x,z.y-K[z.kind].top-8); } return; }""")
# IA: ignora caídos
rep("const near=zs.filter(z=>Math.hypot(z.x-V.x,(z.y-V.y)*2)<95 && z.state!=='dead');","const near=zs.filter(z=>!z.down && Math.hypot(z.x-V.x,(z.y-V.y)*2)<95 && z.state!=='dead');")
rep("const cand=zs.filter(z=>z.state!=='dead'); const pool=cand.length?cand:zs;",
    "const up=zs.filter(z=>!z.down); if(!up.length){ setAnim(V,'guard'); step(V,dt); setIA('todos no chão · esperando levantar'); return; } const cand=up.filter(z=>z.state!=='dead'); const pool=cand.length?cand:up;")
# desenho: queda/levantar girando no pé, morte cai antes de sumir
rep("  const alpha=e.dead?Math.max(0,1-e.deadT/0.6):1; if(alpha<=0) return;",
"""  const alpha=e.dead?(e.deadT<0.5?1:Math.max(0,1-(e.deadT-0.5)/0.5)):1; if(alpha<=0) return;
  let r=0; if(e.down){ const t=e.down.t; r=t<0.25?t/0.25:t<1.1?1:Math.max(0,1-(t-1.1)/0.45); } else if(e.dead) r=Math.min(1,e.deadT/0.25);
  const ang=e===V?0:r*(e.kind==='r'?0.25:Math.PI/2)*(-e.face);""")
i=s.index("  c.save(); c.globalAlpha=alpha;"); j=s.index("  c.restore();",i)+len("  c.restore();")
s=s[:i]+"  c.save(); c.globalAlpha=alpha; c.translate(sx,Math.round(e.y)); if(ang) c.rotate(ang); if(e.face<0) c.scale(-1,1); c.drawImage(cv,-ax,-G); c.restore();"+s[j:]
rep("S.zs.every(z=>z.deadT>0.6)","S.zs.every(z=>z.deadT>1)")
rep("if(e.dead&&e.deadT>0.6) return;","if(e.dead&&e.deadT>1) return;")
rep("if(z.stun>0){ for","if(z.stun>0 && !z.down){ for")
# derrota: sem ressurreição
rep("  if(V.hp<=0){ V.hp=0; V.state='down'; V.downT=1.6; setAnim(V,'hurt'); V.fi=3; V.hold=true; log('Vigia caiu!'); return; }",
    "  if(V.hp<=0){ V.hp=0; V.state='down'; setAnim(V,'hurt'); V.fi=3; V.hold=true; S.phase='failed'; S.phaseT=4; S.best=Math.max(S.best,S.cleared); log(`EXPEDIÇÃO FALHOU · ${S.cleared} arena(s) limpa(s), ${S.kills} abates`); return; }")
rep("  if(V.state==='down'){ V.downT-=dt; if(V.downT<=0){ V.hp=60; V.state='guard'; V.hold=false; setAnim(V,'guard'); fx('tag','LEVANTA!',V.x,V.y-86); } return; }",
    "  if(V.state==='down'){ return; }")
rep("V.hp=Math.min(100,V.hp+15);","V.hp=Math.min(100,V.hp+8); S.cleared++;")
rep("  else if(S.phase==='go'){","  else if(S.phase==='failed'){ S.phaseT-=dt; S.fade=Math.max(0,Math.min(0.6,(4-S.phaseT)*0.3)); if(S.phaseT<=0){ S.attempts++; S.wave=0; S.kills=0; S.cleared=0; V.hp=100; V.sp=0; V.hold=false; S.fade=0; resetArea(); log('Nova tentativa #'+S.attempts); } }\n  else if(S.phase==='go'){")
rep("document.getElementById('hInfo').textContent=`zumbis: ${alive().length} · abates: ${S.kills}`;",
    "document.getElementById('hInfo').textContent=`zumbis: ${alive().length} · abates: ${S.kills} · tentativa ${S.attempts} · recorde ${S.best} arena(s)`;")
rep("  else if(V.state==='down'){ bn.className='banner'; bn.textContent='VIGIA CAIU'; bn.style.display='block'; }",
    "  else if(S.phase==='failed'){ bn.className='banner'; bn.textContent='EXPEDIÇÃO FALHOU'; bn.style.display='block'; }")
# textos da página
rep("<li><b>Errante</b> (30 de vida)","<li><b>Errante</b> (80 de vida)")
rep("<li><b>Rastejante</b> (22)","<li><b>Rastejante</b> (55)")
rep("<li><b>Corredor</b> (18)","<li><b>Corredor</b> (45)")
rep("<li><b>Lua de Sangue:</b>","<li><b>Cair e levantar:</b> o 3º golpe ou dano acumulado derruba. No chão o zumbi não leva dano e levanta em ~1,5 s.</li>\n        <li><b>Difícil de propósito:</b> se o Vigia cai, a expedição falha e recomeça. Cada onda tem +8% de vida, e a partir da 4ª entra um zumbi extra.</li>\n        <li><b>Lua de Sangue:</b>")
open(p,'w',encoding='utf8').write(s); print('ok')
