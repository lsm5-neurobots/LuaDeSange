import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
def edit(p,pairs):
    s=open(p,encoding='utf8').read()
    for a,b in pairs:
        if a not in s and b in s: continue
        assert a in s, p+' MISSING '+a[:80]
        s=s.replace(a,b)
    open(p,'w',encoding='utf8').write(s)

edit('build.js',[
("return {build,mid,fg,drawSky,AREAS,AID,WINDOWS,LAMPS,BULBS,W,H,BASE,WORLD,OUT};","return {build,mid,drawFG,FGI,drawSky,AREAS,AID,WINDOWS,LAMPS,BULBS,W,H,BASE,WORLD,OUT};"),
("  const cut=s.indexOf('/* ---------- stage background'); if(cut<0) throw new Error('marker '+file);",
"""  if(scaleK){ const m=s.match(/const FW=(\\d+), FH=(\\d+), GROUND=(\\d+);/); if(!m) throw new Error('FW '+file);
    s=s.replace(m[0],'const K='+scaleK+', FW0='+m[1]+', FH0='+m[2]+', GROUND='+m[3]+', FW=Math.round(FW0*K), FH=Math.round(FH0*K);');
    const xf='const xf=(a,ox,oy)=>{ const c=Math.cos(a), s=Math.sin(a); ctx.setTransform(c,s,-s,c,ox,oy); };', id='const id=()=>ctx.setTransform(1,0,0,1,0,0);';
    if(!s.includes(xf)||!s.includes(id)) throw new Error('pen '+file);
    s=s.replace(xf,'const xf=(a,ox,oy)=>{ const c=Math.cos(a), s=Math.sin(a); ctx.setTransform(c*K,s*K,-s*K,c*K,ox*K,oy*K); };').replace(id,'const id=()=>ctx.setTransform(K,0,0,K,0,0);');
    s=s.replace(/y<(GROUND|G)-(\\d+)/g,'y<($1-$2)*K'); }
  const cut=s.indexOf('/* ---------- stage background'); if(cut<0) throw new Error('marker '+file);"""),
("function zombieFactory(file,name){","function zombieFactory(file,name,scaleK){"),
("ERR:zombieFactory('errante-cosmic.html','ERR'),RAS:zombieFactory('rastejante-cosmic.html','RAS'),COR:zombieFactory('corredor-cosmic.html','COR')",
 "ERR:zombieFactory('errante-cosmic.html','ERR',0.7),RAS:zombieFactory('rastejante-cosmic.html','RAS',0.7),COR:zombieFactory('corredor-cosmic.html','COR',0.7)"),
])
edit('pix.js',[
("  const OUTLINE='#170b1c';","  const OUTLINE='#170b1c'; let K=1; const setK=k=>{K=k;}, getK=()=>K;"),
("const xf=(a,ox,oy)=>{ const c=Math.cos(a), s=Math.sin(a); ctx.setTransform(c,s,-s,c,ox,oy); };\n    const id=()=>ctx.setTransform(1,0,0,1,0,0);",
 "const xf=(a,ox,oy)=>{ const c=Math.cos(a), s=Math.sin(a); ctx.setTransform(c*K,s*K,-s*K,c*K,ox*K,oy*K); };\n    const id=()=>ctx.setTransform(K,0,0,K,0,0);"),
("return {OUTLINE,rad,","return {setK,getK,OUTLINE,rad,"),
])
edit('vigia.js',[
("const key=skin+tier+anim+fi+step;","const K=PIX.getK(), key=skin+tier+anim+fi+step+'@'+K;"),
("const cv=compose({FW,FH,GROUND,parts,M,step,flash:P.flash,rim:RIM});","const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM});"),
("cv._tip=tip; cv._hand=sk.wrF; cv._mouth=sk.H(16,-5); cv._head=sk.H(4,-30); cv._hip=sk.hip;","const sc=q=>({x:q.x*K,y:q.y*K}); cv._tip=sc(tip); cv._hand=sc(sk.wrF); cv._mouth=sc(sk.H(16,-5)); cv._head=sc(sk.H(4,-30)); cv._hip=sc(sk.hip);"),
])
edit('demo-page.html',[
("const W=MAP.W, H=MAP.H, BASE=MAP.BASE, OUT=MAP.OUT;","const W=MAP.W, H=MAP.H, BASE=MAP.BASE, OUT=MAP.OUT, KS=0.7; PIX.setK(KS); const VAX=VIGIA.AX*KS, VG=VIGIA.GROUND*KS;"),
("  e:{F:ERR,ax:46,G:114,top:100,hp:30,dmg:6,w:12,name:'Errante'},\n  r:{F:RAS,ax:60,G:70,top:34,hp:22,dmg:4,w:34,name:'Rastejante'},\n  c:{F:COR,ax:48,G:114,top:104,hp:18,dmg:8,w:12,name:'Corredor'},",
 "  e:{F:ERR,ax:46*KS,G:114*KS,top:100*KS,hp:30,dmg:6,w:12*KS,name:'Errante'},\n  r:{F:RAS,ax:60*KS,G:70*KS,top:34*KS,hp:22,dmg:4,w:34*KS,name:'Rastejante'},\n  c:{F:COR,ax:48*KS,G:114*KS,top:104*KS,hp:18,dmg:8,w:12*KS,name:'Corredor'},"),
("function arenaCams(){ const A=MAP.AID[S.area]; return [A.x0, A.x0+384, A.x0+768]; }","function arenaCams(){ const A=MAP.AID[S.area]; return [A.x0, A.x0+960, A.x1-W]; }"),
("fx('hurt','-'+Math.round(dmg),V.x,V.y-112);","fx('hurt','-'+Math.round(dmg),V.x,V.y-80);"),
("base=T.stats.dano*(n===3?2:1), reach=n===3?60:56;","base=T.stats.dano*(n===3?2:1), reach=n===3?44:40;"),
("z.x+=V.face*(n===3?(S.tier==='raro'?40:24):5);","z.x+=V.face*(n===3?(S.tier==='raro'?30:18):4);"),
("S.rings.push({x:V.x+V.face*16,y:V.y-100,t:0}); fx('bubble','PRIIII!',V.x+V.face*40,V.y-130);","S.rings.push({x:V.x+V.face*12,y:V.y-70,t:0}); fx('bubble','PRIIII!',V.x+V.face*30,V.y-92);"),
("if(Math.hypot(z.x-V.x,(z.y-V.y)*2)<120){","if(Math.hypot(z.x-V.x,(z.y-V.y)*2)<100){"),
("fx('tag','LEVANTA!',V.x,V.y-120);","fx('tag','LEVANTA!',V.x,V.y-86);"),
("V.face=1; V.x+=42*dt;","V.face=1; V.x+=64*dt;"),
("const near=zs.filter(z=>Math.hypot(z.x-V.x,(z.y-V.y)*2)<110 && z.state!=='dead');","const near=zs.filter(z=>Math.hypot(z.x-V.x,(z.y-V.y)*2)<95 && z.state!=='dead');"),
("const reach=36+K[t.kind].w/2,","const reach=26+K[t.kind].w/2,"),
("Math.min(dx-reach,52*dt)","Math.min(dx-reach,46*dt)"),
("if(dx<40 && dy<12){ hurtV(K.e.dmg*z.dmgMul); fx('burst','NHAC!',(V.x+z.x)/2,V.y-80); }","if(dx<30 && dy<12){ hurtV(K.e.dmg*z.dmgMul); fx('burst','NHAC!',(V.x+z.x)/2,V.y-58); }"),
("const hx=z.x+z.face*34; if(Math.abs(V.x-hx)<22","const hx=z.x+z.face*24; if(Math.abs(V.x-hx)<18"),
("fx('burst','PEGOU!',hx,V.y-40); fx('tag','PRESO 1 s',V.x,V.y-124);","fx('burst','PEGOU!',hx,V.y-30); fx('tag','PRESO 1 s',V.x,V.y-90);"),
("if(dx<30 && dy<12){ hurtV(K.c.dmg*z.dmgMul); fx('burst','SHRAK!',V.x,V.y-90);","if(dx<24 && dy<12){ hurtV(K.c.dmg*z.dmgMul); fx('burst','SHRAK!',V.x,V.y-64);"),
("if(adx<190){ z.state='alert';","if(adx<170){ z.state='alert';"),
("if(adx<34 && Math.abs(dy)<8){ z.state='attack';","if(adx<26 && Math.abs(dy)<8){ z.state='attack';"),
("z.x+=Math.sign(dx)*Math.min(Math.max(0,adx-28),17*dt);","z.x+=Math.sign(dx)*Math.min(Math.max(0,adx-22),14*dt);"),
("const hx=z.x+z.face*30; if(Math.abs(V.x-hx)<40 && Math.abs(dy)<14){","const hx=z.x+z.face*22; if(Math.abs(V.x-hx)<30 && Math.abs(dy)<14){"),
("z.face=Math.sign(dx)||z.face; const hx=z.x+z.face*30;","z.face=Math.sign(dx)||z.face; const hx=z.x+z.face*22;"),
("if(z.cd<=0 && Math.abs(V.x-hx)<26 && Math.abs(dy)<12)","if(z.cd<=0 && Math.abs(V.x-hx)<20 && Math.abs(dy)<12)"),
("if(z.fi>=1&&z.fi<=3) z.x+=z.face*150*dt;","if(z.fi>=1&&z.fi<=3) z.x+=z.face*110*dt;"),
("fx('tag','TROPEÇOU · 0,6 s',z.x,z.y-118);","fx('tag','TROPEÇOU · 0,6 s',z.x,z.y-86);"),
("if(z.cd<=0 && adx<74 && adx>34 && Math.abs(dy)<9)","if(z.cd<=0 && adx<58 && adx>26 && Math.abs(dy)<9)"),
("const spd=adx>40?78:0; z.x+=Math.sign(dx)*Math.min(spd*dt,Math.max(0,adx-30));","const spd=adx>30?62:0; z.x+=Math.sign(dx)*Math.min(spd*dt,Math.max(0,adx-24));"),
("const cv=frameOf(e), isV=e===V, ax=isV?VIGIA.AX:K[e.kind].ax, G=isV?VIGIA.GROUND:K[e.kind].G,","const cv=frameOf(e), isV=e===V, ax=isV?VAX:K[e.kind].ax, G=isV?VG:K[e.kind].G,"),
("const w=e===V?18:(e.kind==='r'?36:16);","const w=e===V?13:(e.kind==='r'?26:11);"),
("const r=V.anim==='combo'?60:56;","const r=V.anim==='combo'?44:40;"),
("top=Math.round(V.y-118);","top=Math.round(V.y-84);"),
("FG.clearRect(0,0,W,H); FG.drawImage(MAP.fg,Math.round(cam*1.25),0,W,H,0,0,W,H);","FG.clearRect(0,0,W,H); MAP.drawFG(FG,cam);"),
("S.cam=Math.min(next,Math.max(S.cam,V.x-150));","S.cam=Math.min(next,Math.max(S.cam,V.x-140));"),
])
print('ok')
