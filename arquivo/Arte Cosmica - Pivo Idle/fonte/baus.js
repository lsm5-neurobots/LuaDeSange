/* ===== BAU: 4 baús com chave própria, hi-bit (pipeline PIX) ===== */
const BAU=(function(){
  const {rad,mkPen,compose,P2}=PIX;
  const FW=72, FH=64, GY=58, AX=36;
  const TIPOS={
    comum:{nome:'Baú comum', cor:'#b9b0a0', chave:'chave_comum', preco:'20 moedas', loot:['Sucata ×3–6','Moedas 10–25','Comida enlatada','Chance 10%: peça de arma comum']},
    medico:{nome:'Baú médico', cor:'#e85a5a', chave:'chave_medica', preco:'35 moedas', loot:['Kit curativo ×1–2','Atadura ×2–4','Antídoto (veneno do Cuspidor)','Chance 15%: seringa de adrenalina']},
    militar:{nome:'Baú militar', cor:'#7a9a4a', chave:'chave_militar', preco:'50 moedas', loot:['Munição/peças ×4–8','Colete leve','Granada de efeito','Chance 12%: bastão de alumínio (raro)']},
    raro:{nome:'Baú raro', cor:'#c8323a', chave:'chave_rara', preco:'só cai (não compra)', loot:['Moedas 80–150','Item lunar garantido','Cristal da Lua de Sangue','Chance 5%: bastão da Lua de Sangue']},
  };
  function mats(t){
    const base={
      out:['#3a3040','#241c2a','#16101a','#0a060c'],
      dark:['#2a1a22','#160c12','#0c060a','#060204'],
      glow:['#fffbe0','#ffe27a','#f2c230','#a07a14'],
      coin:['#fff2a0','#f2c230','#a07a14','#5a420a'],
    };
    if(t==='comum') Object.assign(base,{wood:['#c8905a','#8a5a32','#5a3a20','#341f10'],band:['#b8bcc8','#7a7e8e','#4e5262','#2c2e3c'],lock:['#d8dce8','#9a9eae','#5e6274','#363a4a']});
    if(t==='medico') Object.assign(base,{wood:['#ffffff','#dcdce4','#a0a0b0','#5e5e70'],band:['#ff8a8a','#d83a3a','#8a1a22','#4a0a12'],lock:['#d8dce8','#9a9eae','#5e6274','#363a4a']});
    if(t==='militar') Object.assign(base,{wood:['#a8b878','#6e7e46','#48542e','#2a321a'],band:['#ffe27a','#d8b040','#8a6a18','#4a380c'],lock:['#c8ccd4','#8a8ea0','#565a6c','#30323e']});
    if(t==='raro') Object.assign(base,{wood:['#7a4a5a','#4a2434','#2e1420','#1a0a12'],band:['#ffe27a','#f2c230','#a07a14','#5a420a'],lock:['#ff8a7a','#c8323a','#7a141c','#42080e']});
    return base;
  }
  function drawBase(p,M,t,open){
    // corpo (frente + lateral em 3/4)
    p.F(M.wood[1]); p.poly([[12,32],[56,32],[56,58],[12,58]]);
    p.F(M.wood[2]); p.poly([[56,32],[62,28],[62,54],[56,58]]);
    if(open){ p.F(M.dark[1]); p.poly([[13,32],[56,32],[61,29],[18,29]]); }
    if(t==='comum'){ p.F(M.wood[2]); [38,44,50].forEach(y=>p.rect(13,y,42,0.9)); p.F(M.band[1]); p.rect(16,32,4,26); p.rect(48,32,4,26); p.F(M.band[0]); p.rect(16,32,1,26); p.rect(48,32,1,26); p.F(M.band[2]); [36,46,54].forEach(y=>{ p.rect(17,y,1.4,1.4); p.rect(49,y,1.4,1.4); }); }
    if(t==='medico'){ p.F(M.band[1]); p.rect(30,38,8,16); p.rect(26,42,16,8); p.F(M.wood[2]); p.rect(12,56,44,2); p.F(M.lock[1]); p.rect(20,33,3,4); p.rect(45,33,3,4); }
    if(t==='militar'){ p.F(M.wood[2]); p.rect(12,44,44,1); p.F(M.band[1]); p.poly([[14,54],[22,46],[25,46],[17,54]]); p.poly([[44,54],[52,46],[55,46],[47,54]]); p.F(M.wood[0]); [[20,37],[23,37],[26,37],[32,37],[35,37],[38,37]].forEach(([x,y])=>p.rect(x,y,2,3)); p.F(M.lock[1]); p.rect(14,34,4,6); p.rect(50,34,4,6); }
    if(t==='raro'){ p.F(M.band[1]); p.rect(12,32,44,2.4); p.rect(12,55,44,3); p.rect(12,32,2.4,26); p.rect(53.6,32,2.4,26); p.F(M.band[0]); [[18,40],[46,40],[18,50],[46,50]].forEach(([x,y])=>p.ell(x,y,2,2)); p.F(M.wood[0]); p.rect(16,44,36,0.9); }
    // fechadura
    if(t!=='medico'){ p.F(M.lock[1]); p.rect(30,33,8,9); p.F(M.lock[0]); p.rect(30,33,8,1.4); p.F(M.dark[1]); p.ell(34,38,1.3,1.3); p.rect(33.4,38,1.2,2.6); }
    else { p.F(M.lock[1]); p.rect(31,33,6,4); }
  }
  function drawLid(p,M,t,fi,open){
    const ang=open?[0,-14,-30,-48,-62][Math.min(4,fi)]:0, lift=open?[0,2,4,5,5][Math.min(4,fi)]:0;
    p.xf(rad(ang),12,32-lift);
    if(t==='comum'||t==='raro'){ p.F(M.wood[1]); p.poly([[0,0],[44,0],[44,-8],[40,-12],[4,-12],[0,-8]]); p.F(M.wood[2]); p.poly([[44,0],[50,-4],[50,-12],[46,-15],[40,-12],[44,-8]]); p.F(M.wood[0]); p.rect(4,-11,36,1.2); }
    else { p.F(M.wood[1]); p.poly([[0,0],[44,0],[44,-9],[0,-9]]); p.F(M.wood[2]); p.poly([[44,0],[50,-4],[50,-13],[44,-9]]); p.F(M.wood[0]); p.rect(0,-9,44,1.2); }
    if(t==='comum'){ p.F(M.band[1]); p.rect(4,-12,4,12); p.rect(36,-12,4,12); }
    if(t==='medico'){ p.F(M.band[1]); p.rect(19,-8,6,7); p.rect(16,-6,12,3); p.F(M.lock[1]); p.rect(16,-12,12,2.4); }
    if(t==='militar'){ p.F(M.band[1]); p.rect(0,-3,44,1.6); p.F(M.lock[1]); p.rect(19,-12,6,2.6); }
    if(t==='raro'){ p.F(M.band[1]); p.rect(0,-2,44,2); p.rect(20,-12,4,12); p.F(M.lock[1]); p.ell(22,-7,2.6,2.6); p.F(M.lock[0]); p.rect(21,-8.6,1.2,1.2); }
    p.id();
  }
  function drawLoot(p,M,t,fi){
    const h=[0,0,3,7,9][Math.min(4,fi)]; if(!h) return;
    p.F(M.coin[1]); p.ell(28,31-h,3,3); p.ell(36,30-h*0.8,3,3); p.F(M.coin[0]); p.rect(27,29-h,2,1);
    p.F(t==='medico'?M.band[1]:t==='militar'?M.wood[0]:t==='raro'?M.lock[1]:M.band[1]); p.rect(41,27-h,5,6);
  }
  const cache=new Map();
  function frame(tipo,state,fi=0,step=5){
    const K=PIX.getK(), key=tipo+state+fi+step+'@'+K; if(cache.has(key)) return cache.get(key);
    const M=mats(tipo), open=state==='abrindo'||state==='aberto', f=state==='aberto'?4:fi;
    const shake=state==='trancado'?[-1,1,0][fi%3]:0;
    const sh=(fn)=>(c,u)=>{ const p=mkPen(c,u); const ox=p.xf; p.xf=(a,x,y)=>ox(a,x+shake,y); p.xf(0,0,0); fn(p); };
    const parts=[{draw:sh(p=>drawBase(p,M,tipo,open))}];
    if(open) parts.push({draw:sh(p=>drawLoot(p,M,tipo,f)),noRim:true});
    parts.push({draw:sh(p=>drawLid(p,M,tipo,f,open))});
    if(state==='trancado' && fi%2===0) parts.push({noShade:true,draw:sh(p=>{ p.F(M.glow[1]); p.rect(29,32,10,1); p.F('#ff4a4a'); p.rect(33,34,2,6); })});
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GY*K,parts,M,step,rim:'#a9c8f0'});
    cv._glow=open?{x:36*K,y:28*K,r:(10+f*3)*K}:null;
    cache.set(key,cv); return cv;
  }
  function ANCHOR(tipo){ const K=PIX.getK(); return {ax:AX*K, gy:GY*K}; }
  const kcache=new Map();
  function chave(tipo,step=5){
    const key=tipo+step; if(kcache.has(key)) return kcache.get(key);
    const M=mats(tipo), K0=PIX.getK(); PIX.setK(1);
    const metal=tipo==='raro'?M.band:tipo==='comum'?M.lock:tipo==='medico'?M.wood:M.lock;
    const cv=compose({FW:28,FH:28,GROUND:40,M:Object.assign({},M,{metal}),step,rim:'#a9c8f0',parts:[{draw:(c,u)=>{ const p=mkPen(c,u); p.xf(-Math.PI/4,9,19);
      p.F(metal[1]); p.ell(0,0,5.4,5.4); p.F(M.dark[1]); p.ell(0,0,2.2,2.2);
      p.F(metal[1]); p.rect(4,-1.4,16,2.8); p.rect(14,1,2.4,4); p.rect(18,1,2.4,3);
      if(tipo==='medico'){ p.F(M.band[1]); p.rect(-1,-4,2,8); p.rect(-4,-1,8,2); }
      if(tipo==='militar'){ p.F(M.band[1]); p.rect(6,-1.4,4,2.8); }
      if(tipo==='raro'){ p.F(M.lock[1]); p.ell(0,0,1.8,1.8); }
      p.id(); }}]});
    PIX.setK(K0); kcache.set(key,cv); return cv;
  }
  return {TIPOS,frame,ANCHOR,chave,mats,FW,FH,GY,AX};
})();
