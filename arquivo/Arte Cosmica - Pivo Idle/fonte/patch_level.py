import os,sys
os.chdir(os.path.dirname(os.path.abspath(__file__)))
p='demo-page.html'; s=open(p,encoding='utf8').read()
def rep(a,b):
    global s
    assert a in s, 'MISSING '+a[:90]
    s=s.replace(a,b,1)
ZHP=sys.argv[1] if len(sys.argv)>1 else '1'
rep("const S={attempts:1,","const S={level:1,zhp:"+ZHP+",attempts:1,")
rep("const V={x:0,y:176,face:1,hp:100,","const VMAX=()=>60+12*(S.level-1), LMUL=()=>1+0.12*(S.level-1);\nconst V={x:0,y:176,face:1,hp:60,")
rep("hp:K[k].hp*f.hp*wm,maxhp:K[k].hp*f.hp*wm,","hp:K[k].hp*f.hp*wm*S.zhp,maxhp:K[k].hp*f.hp*wm*S.zhp,")
rep("base=T.stats.dano*(n===3?2:1),","base=T.stats.dano*(n===3?2:1)*LMUL(),")
rep("let dmg=base*(z.state==='miss'?2:1)*","let dmg=base*(z.state==='miss'?2:1)*")
rep("if((n===3 && z.poise>=z.maxhp*0.22) || z.poise>=z.maxhp*0.45) knock(z,V.face); else { z.prev=z.state==='hurt'?z.prev:z.state; z.state='hurt'; setAnim(z,'hurt'); if(n===3) z.stun=Math.max(z.stun,{comum:.3,incomum:.3,raro:.6,lunar:.8}[S.tier]); }",
    "if((n===3 && z.poise>=z.maxhp*0.35) || z.poise>=z.maxhp*0.6) knock(z,V.face); else if(n===3 || z.state==='miss'){ z.prev=z.state==='hurt'?z.prev:z.state; z.state='hurt'; setAnim(z,'hurt'); if(n===3) z.stun=Math.max(z.stun,{comum:.3,incomum:.3,raro:.6,lunar:.8}[S.tier]); } else { z.flash=0.09; }")
rep("V.hp=Math.min(100,V.hp+8); S.cleared++;","V.hp=Math.min(VMAX(),V.hp+8); S.cleared++;")
rep("S.attempts++; S.wave=0; S.kills=0; S.cleared=0; V.hp=100;","S.attempts++; S.wave=0; S.kills=0; S.cleared=0; V.hp=VMAX();")
rep("document.getElementById('hpBar').style.width=V.hp+'%';","document.getElementById('hpBar').style.width=(V.hp/VMAX()*100)+'%'; document.getElementById('hLvl').textContent='nv '+S.level;")
rep("<b>VIGIA EDSON</b> · nv 3","<b>VIGIA EDSON</b> · <span id=\"hLvl\">nv 1</span>")
# flash branco nos golpes que não interrompem
rep("  if(isV){ const t=cv._tip;","  if(!isV && e.flash>0){ e.flash-=0.016; c.save(); c.globalCompositeOperation='lighter'; c.globalAlpha=0.6; c.translate(sx,Math.round(e.y)); if(e.face<0) c.scale(-1,1); c.drawImage(cv,-ax,-G); c.restore(); }\n  if(isV){ const t=cv._tip;")
# seletor de nível
rep('<div class="grp"><span class="lbl">Jogo</span>','<div class="grp"><span class="lbl">Nível do recruta</span><div class="seg" id="levels"><button data-lv="1" aria-pressed="true">nv 1</button><button data-lv="5" aria-pressed="false">nv 5</button><button data-lv="10" aria-pressed="false">nv 10</button><button data-lv="20" aria-pressed="false">nv 20</button></div></div>\n      <div class="grp"><span class="lbl">Jogo</span>')
rep("const tog=(id,fn)=>","document.querySelectorAll('#levels button').forEach(b=>b.onclick=()=>{ S.level=+b.dataset.lv; press('levels','lv',S.level); S.attempts++; S.wave=0; S.kills=0; S.cleared=0; V.hp=VMAX(); V.sp=0; V.state='idle'; V.hold=false; resetArea(); log('Recruta nível '+S.level+': nova tentativa'); });\nconst tog=(id,fn)=>")
open(p,'w',encoding='utf8').write(s); print('ok')
