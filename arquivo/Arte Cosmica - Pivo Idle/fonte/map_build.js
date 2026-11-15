function fillCasario(from,to,style){
  let x=from, i=0;
  while(x<to-30){ const s=x*0.13+i, w=40+Math.floor(hsh(s)*18);
    if(style==='eclet'){ const ww=Math.min(w+16,to-x-2); if(ww<30) break; ecletico(M,x,ww,86+Math.floor(hsh(s*2)*20),['#eadcb0','#e8c050','#f0e6d0','#d8b8a0','#e8a8a0'][i%5],s,hsh(s*3)>.6?(hsh(s*5)>.5?'l':'r'):null); x+=ww+2; }
    else { const ww=Math.min(w,to-x-2); if(ww<30) break;
      if(style==='bar'){ const col=mix(CASA[Math.floor(hsh(s*7)*CASA.length)],'#5a4a6a',.25); casa(M,x,ww,78+Math.floor(hsh(s*2)*22),col,s,{awning:hsh(s*4)>.4?[['#e84a3a','#3a8ae8','#4ac860'][i%3],'#f6eedc']:null, sign:hsh(s*6)>.5?['#2a1a2a','#ff4a8a','#ffd23f']:null}); }
      else if(style==='dark'){ const col=mix(CASA[Math.floor(hsh(s*7)*CASA.length)],'#4a4060',.35); casa(M,x,ww,80+Math.floor(hsh(s*2)*20),col,s,{pediment:hsh(s*9)>.6}); }
      else casa(M,x,ww,78+Math.floor(hsh(s*2)*24),CASA[Math.floor(hsh(s*7)*CASA.length)],s,{pediment:hsh(s*9)>.7, awning:hsh(s*4)>.75?[['#e84a3a','#3a8ae8'][i%2],'#f6eedc']:null});
      x+=ww+2; }
    i++; }
}
// primeiro plano: sprites pequenos desenhados por quadro (o mundo é largo demais pra um canvas só)
const FGI=[], fgCache={};
function fgSprite(t){ if(fgCache[t]) return fgCache[t]; const w=t==='palm'?100:24; const [c,cg]=mk(w,H); withS(1,()=>{ if(t==='poste') poste(cg,12); else if(t==='palm') palmeira(cg,50); else cabeco(cg,12); }); return fgCache[t]={c,w}; }
function drawFG(g,cam){ FGI.forEach(it=>{ const sp=fgSprite(it.t), sx=Math.round((it.x-cam)*1.25); if(sx<-sp.w||sx>W+sp.w) return; g.drawImage(sp.c,sx-sp.w/2,0); }); }
function build(){
  SCALE=SC; WINDOWS.length=0; LAMPS.length=0; BULBS.length=0; FGI.length=0;
  M.clearRect(0,0,WORLD,H);
  AREAS.forEach(A=>{ const X=A.x0/SC, X1=A.x1/SC, PX=A.x0, PX1=A.x1;
    switch(A.id){
      case 'ponte': withS(1,()=>{ waterBack(M,PX,PX1,92,true); farBank(M,PX,PX1,94); }); withS(2,()=>balaustrada(M,PX/2,PX1/2)); break;
      case 'alfandega': fillCasario(X+2,X+100,'casa'); igreja(M,X+102); alfandegaPaco(M,X+212); fillCasario(X+446,X1,'casa'); break;
      case 'feira': fillCasario(X+2,X1,'casa'); break;
      case 'bomjesus': fillCasario(X+2,X+200,'casa'); sinagoga(M,X+202); fillCasario(X+262,X+460,'casa'); bonecos(M,X+462); fillCasario(X+526,X1,'casa'); break;
      case 'apolo': fillCasario(X+2,X+200,'dark'); apolo(M,X+202); fillCasario(X+314,X+480,'dark'); andaime(M,X+482,96,90); fillCasario(X+582,X1,'dark'); break;
      case 'moeda': fillCasario(X+2,X+320,'bar'); grafite(M,X+322); fillCasario(X+414,X1,'bar'); break;
      case 'arsenal': fillCasario(X+2,X+160,'eclet'); malakoff(M,X+162); fillCasario(X+244,X1,'eclet'); break;
      case 'riobranco': fillCasario(X+2,X+300,'eclet'); frevo(M,X+302); fillCasario(X+416,X1,'eclet'); break;
      case 'marco': ecletico(M,X+4,70,100,'#e8c050',9,'r'); ecletico(M,X+80,88,108,'#f0e6d0',10,'l'); ecletico(M,X+174,60,94,'#e88a6a',11,null); ecletico(M,X+240,84,104,'#eadcb0',12,'r'); ecletico(M,X+330,96,100,'#d8b8a0',13,'l');
        withS(1,()=>{ const wx=(X+430)*SC; waterBack(M,wx,PX1,92); molheFar(M,wx+90,PX1,90); torreCristal(M,PX1-220,92,0.35); R(M,wx,BASE-8,PX1-wx,8,ramp('#9a9488')[1]); R(M,wx,BASE-8,PX1-wx,1,ramp('#9a9488')[0]); }); break;
      case 'sertao': armazem(M,X+10,300,'#f2ecd8'); guindaste(M,X+330); armazem(M,X+430,330,'#ffe2a8'); break;
      case 'travessia': withS(1,()=>{ waterBack(M,PX,PX1,92); molheFar(M,PX+400,PX1,90); torreCristal(M,PX1-80,92,0.55); }); break;
      case 'molhe': withS(1,()=>waterBack(M,PX,PX1,92)); torreCristal(M,X+260,BASE,1.15); esculturas(M,X); break;
    }
    withS(1,()=>{
      if(A.floor==='paralelo'){ sidewalk(M,PX,PX1,'#c8beb0'); floorStones(M,PX,PX1,'#8a8290',BASE+13,false); }
      if(A.floor==='paralelo2'){ sidewalk(M,PX,PX1,'#a89eae'); floorStones(M,PX,PX1,'#76707e',BASE+13,true);
        for(let k=0;k<7;k++){ const px=PX+240+k*300, py=150+Math.floor(hsh(k)*40); for(let yy=0;yy<6;yy++){ const hw=Math.floor(28*Math.sqrt(Math.max(0,1-((yy-2.5)/3)**2))); R(M,px-hw,py+yy,hw*2,1,'#3a4a6a'); } R(M,px-8,py+1,10,1,'#6a8ac0'); } }
      if(A.floor==='asfalto') floorAsfalto(M,PX,PX1);
      if(A.floor==='granito') floorSlabs(M,PX,PX1,'#a8a4a0');
      if(A.floor==='portuguesa'){ floorPortuguesa(M,PX,PX1); rosaVentos(M,(X+380)*SC,172); }
      if(A.floor==='agua') floorAgua(M,PX,PX1);
      if(A.floor==='molhe') floorMolhe(M,PX,PX1);
    });
  });
  const P=id=>AID[id].x0/SC;
  [40,75,110,145,300,335,370,520,555,590,700].forEach((r,k)=>barraca(M,P('feira')+r,['#e84a3a','#3a8ae8','#4ac860','#ffd23f','#ff8ad0'][k%5]));
  [70,105].forEach((r,k)=>barraca(M,P('bomjesus')+r,['#3a8ae8','#e84a3a'][k]));
  bonecoGigante(M,P('bomjesus')+494,BASE+4);
  entulho(M,P('apolo')+120); entulho(M,P('apolo')+500); entulho(M,P('apolo')+540);
  for(let x=P('moeda')+30;x<AID.moeda.x1/SC-30;x+=60) if(x<P('moeda')+310||x>P('moeda')+420) mesa(M,x);
  carro(M,P('arsenal')+420,'#4a5a3a',true); carro(M,P('riobranco')+150,'#c8c0b0',false); carro(M,P('riobranco')+560,'#3a6ab8',false);
  letreiro(M,P('marco')+70,BASE-6); estatua(M,P('marco')+300,BASE+16);
  conteiner(M,P('sertao')+200,'#c84a3a'); conteiner(M,P('sertao')+600,'#3a7ab8');
  withS(1,()=>{
    stringLine(M,AID.moeda.x0,AID.moeda.x1,144,22,14,(x,k,y)=>{ if(k%24===12){ R(M,x+k-1,y+1,3,3,OUT); R(M,x+k,y+2,1,1,['#ffd23f','#ff6a8a','#6ae8ff'][(x/144+k)%3|0]); BULBS.push({x:x+k,y:y+2}); } });
    stringLine(M,AID.feira.x0,AID.bomjesus.x1,180,14,12,(x,k,y)=>{ if(k%9===4){ const c=['#e83a3a','#ffd23f','#3a8ae8','#4ac860','#ff8ad0'][(x/9+k)%5|0]; R(M,x+k-1,y+1,5,1,OUT); R(M,x+k,y+1,3,3,c); R(M,x+k+1,y+4,1,1,c); } });
  });
  AREAS.forEach(A=>{ if(A.id==='travessia') return; const st=A.id==='ponte'?576:660;
    for(let wx=A.x0+180;wx<A.x1;wx+=st){
      if(A.id==='molhe'||A.id==='sertao') FGI.push({t:'cab',x:wx});
      else if(A.id==='arsenal'||A.id==='marco'||A.id==='riobranco') FGI.push({t:((wx-A.x0)/st|0)%2?'palm':'poste',x:wx});
      else FGI.push({t:'poste',x:wx}); } });
  for(let wx=AID.marco.x0+(430+20)*SC;wx<AID.marco.x1;wx+=210) FGI.push({t:'cab',x:wx});
  FGI.filter(it=>it.t==='poste').forEach(it=>LAMPS.push({fx:it.x*1.25,y:36}));
  SCALE=1;
}
