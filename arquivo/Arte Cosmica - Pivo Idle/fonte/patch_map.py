import sys
p=sys.argv[1]; s=open(p,encoding='utf8').read()
def rep(old,new):
    global s
    assert old in s, 'MISSING: '+old[:90]
    s=s.replace(old,new,1)
rep("const W=384, H=216, BASE=118, OUT='#170b1c', SPEED=32;","const W=384, H=216, BASE=118, OUT='#170b1c', SPEED=64, SC=3; let SCALE=SC;")
s=s.replace("len:1152,","len:768,").replace("len:768, floor:'agua'","len:512, floor:'agua'").replace("len:768, floor:'molhe'","len:512, floor:'molhe'")
rep("fights:[90]","fights:[78]")
rep("let acc=0; const AREAS=DEF.map((d,i)=>{ const a=Object.assign({n:i+1,x0:acc,x1:acc+d.len},d); acc+=d.len; return a; });",
    "let acc=0; const AREAS=DEF.map((d,i)=>{ const L=d.len*SC; const a=Object.assign({},d,{n:i+1,x0:acc,x1:acc+L,len:L,ulen:d.len}); acc+=L; return a; });")
rep("const FGW=Math.ceil(WORLD*1.25)+W;\nconst [fg,F]=mk(FGW,H);\n","")
rep("const R=(g,x,y,w,h,c)=>{ g.fillStyle=c; g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h)); };",
"""const R=(g,x,y,w,h,c)=>{ g.fillStyle=c; if(SCALE===1){ g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h)); return; }
  const k=SCALE; let x0=x*k, x1=(x+w)*k, y0=BASE+(y-BASE)*k, y1=BASE+(y+h-BASE)*k;
  if(c===OUT){ const d=k-1; x0+=d; x1-=d; y0+=d; y1-=d; if(x1-x0<1){ const m=(x0+x1)/2; x0=m-0.5; x1=m+0.5; } if(y1-y0<1){ const m=(y0+y1)/2; y0=m-0.5; y1=m+0.5; } }
  const X0=Math.round(x0), Y0=Math.round(y0); g.fillRect(X0,Y0,Math.max(1,Math.round(x1)-X0),Math.max(1,Math.round(y1)-Y0)); };
const TW=(x,y,w,h,lit,warm)=>({x:x*SCALE,y:BASE+(y-BASE)*SCALE,w:w*SCALE,h:h*SCALE,lit,warm});
function withS(k,fn){ const o=SCALE; SCALE=k; fn(); SCALE=o; }""")
rep("WINDOWS.push({x:x+1,y:y+1,w:w-2,h:h-2,lit:hsh(x*3.1+y*7.7)>.55, warm:hsh(x+y)>.3});","WINDOWS.push(TW(x+1,y+1,w-2,h-2,hsh(x*3.1+y*7.7)>.55,hsh(x+y)>.3));")
rep("WINDOWS.push({x:cx-5,y:y-11,w:10,h:6,lit:true,warm:true});","WINDOWS.push(TW(cx-5,y-11,10,6,true,true));")
i=s.index("  g.fillStyle='rgba(40,140,80,.55)';"); j=s.index("\n",i)
s=s[:i]+"  R(g,x+w*0.45,BASE-h-4,w*0.55+4,h-24,'rgba(40,140,80,.55)'); for(let yy=BASE-h-4;yy<BASE-28;yy+=3) R(g,x+w*0.45,yy,w*0.55+4,1,'rgba(20,80,40,.5)');"+s[j:]
rep("const sx=x0+500;","const sx=x0+330;"); rep("const tx=x0+620;","const tx=x0+440;")
rep("function rosaVentos(g,cx,cy){ const rx=78, ry=18;","function rosaVentos(g,cx,cy){ const rx=150, ry=26;")
rep("  LAMPS.push({fx:x,y:36}); }","  }")
i=s.index("function fillCasario("); j=s.index("function fightDur(")
s=s[:i]+open(sys.argv[2],encoding='utf8').read()+"\n"+s[j:]
rep("  FC.drawImage(fg,Math.round(cam*1.25),0,W,H,0,0,W,H);","  drawFG(FC,cam);")
rep("fig(cx+lunge,ramp('#c84a3a'),ramp('#c88a5a'),'#3a2a1a',88);","fig(cx+lunge,ramp('#c84a3a'),ramp('#c88a5a'),'#3a2a1a',76);")
rep("fig(cx+40+(lunge?0:3),ramp('#3a8a6a'),ramp('#8a5a3a'),null,84);","fig(cx+40+(lunge?0:3),ramp('#3a8a6a'),ramp('#8a5a3a'),null,72);")
rep("O squad caminha a 32 px/s (cerca de 2 m/s em escala). Cada área de rua tem 1152 px (3 telas) = 36 s de caminhada.","O squad caminha a 64 px/s (personagem de ~76 px, porta de ~84 px). Cada área de rua tem 2304 px (6 telas) = 36 s de caminhada.")
open(p,'w',encoding='utf8').write(s)
print('ok')
