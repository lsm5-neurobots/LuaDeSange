/* CUSP — fonte de arte (editável). Build: npm run art
   Cuspidor: zumbi inchado e corcunda, papo de ácido pendurado no pescoço que brilha; cospe em arco.
   Regata listrada rubro-negra desbotada, bermuda jeans, um chinelo só (o outro pé descalço). */
const CUSP=(function(){
  const {rad,lp,lerp,P2,mkPen,compose}=PIX;
  const FW=178, FH=150, GROUND=142, AX=88, TS=1.2, HS=1.34;
  const RIM={comum:'#d4f0b0', enluarado:'#a8f0ff', plenilunar:'#ffb27a'};
  function mats(form){
    const m={
      skin:['#dfe8b0','#a2ae70','#5e684c','#2e2c3c'],
      rot:['#b4ac74','#7e7450','#524a3a','#2e2830'],
      flesh:['#f0a08c','#c0605c','#7e3044','#44182c'],
      acid:['#f8ffc8','#c6f53e','#6cc21c','#2a6a1a'],
      sacm:['#e8f4b0','#b0c46a','#748c44','#3e5034'],
      shirt:['#ffb46a','#f07a26','#a84618','#5a2010'],
      stripe:['#f4f8ff','#b8c4d0','#76829a','#3c4258'],
      jeans:['#94b2d8','#5e7cae','#3e527e','#222e4c'],
      strap:['#a8dcff','#3a7ae0','#244c96','#14285a'],
      sole:['#fff8e6','#d4ccb4','#948a74','#524a40'],
      hair:['#6e6454','#423a2e','#2a241c','#16120e'],
      eye:['#ffffe0','#f4e04a','#b89422','#6a5010'],
      milk:['#f4f4e8','#c8ccbc','#8e9486','#545a52'],
      mouth:['#8a4048','#4e1c26','#2c0c16','#16060a'],
      teeth:['#f4ecc0','#ccb87e','#8e7c4e','#544628'],
      nail:['#5a5046','#302822','#1c1612','#0c0806'],
      blood:['#a85a40','#7a2e22','#4e1a16','#2c0c0c'],
    };
    if(form==='enluarado'){
      m.skin=['#cad8f6','#8a98d0','#565e98','#2c2e5e']; m.rot=['#a8a4d8','#7470a8','#4c4878','#2a2648'];
      m.acid=['#effffc','#62f2e6','#18acb4','#0a5468']; m.sacm=['#dcf6ff','#94c4e4','#5a84aa','#30466a'];
      m.shirt=['#c4a0e0','#8a64b8','#583c86','#2e2052']; m.stripe=['#f0f8ff','#a8c8dc','#6888a8','#344660'];
      m.eye=['#ffffff','#bff4ff','#62c8e8','#2a7aa8']; m.flesh=['#e8a0c8','#b0609a','#703a70','#3c1c44'];
      m.blood=['#7a6ab0','#4a3e80','#2e2656','#1a1430']; m.jeans=['#86c0bc','#4a8486','#30585e','#1a3038'];
    }
    if(form==='plenilunar'){
      m.skin=['#f6b892','#c8724e','#8a3c34','#4e1a24']; m.rot=['#d89a6a','#a05a3a','#6a3028','#3a1418'];
      m.acid=['#fffcc4','#ffd23a','#f0761a','#9a2a10']; m.sacm=['#ffe4a8','#e8a05a','#a85a34','#5e2a20'];
      m.shirt=['#ff9a5a','#d8502a','#8e2620','#4a1012']; m.stripe=['#fff4d8','#d8b890','#9a7458','#4e3428']; m.eye=['#fffbe0','#ffd23f','#ff7a1a','#b8300e'];
      m.flesh=['#ffa880','#e05a3a','#9a2a24','#561018']; m.blood=['#d8442a','#9a1e14','#5e0e0c','#320606'];
    }
    return punch(m);
  }
  function sat(h,k){ const [r,g,b]=PIX.hexRgb(h), y=(r+g+b)/3; return PIX.toHex(y+(r-y)*k,y+(g-y)*k,y+(b-y)*k); }
  const NOPUNCH={acid:1,sacm:1,eye:1};
  function punch(m){ const o={}; for(const k in m){ const r=m[k]; o[k]=NOPUNCH[k]?[r[0],sat(r[1],1.08),r[2],PIX.mix(r[3],'#140a24',0.2)]:[sat(r[0],1.1),sat(r[1],1.16),PIX.mix(sat(r[2],1.12),'#2a1a4c',0.24),PIX.mix(r[3],'#140a24',0.4)]; } return o; }
  const NAMES={skin:'Pele',rot:'Podridão',flesh:'Carne',acid:'Ácido',sacm:'Papo',shirt:'Regata de gari',stripe:'Faixa refletiva',jeans:'Bermuda',strap:'Chinelo',sole:'Sola',eye:'Olho',teeth:'Dentes',blood:'Sangue'};

  /* ---------- poses ---------- */
  const REST={hx:0,lift:0,rot:0,lean:34,head:-24,jaw:6,sac:0.25,sacY:0,breath:0,aFs:2,aFe:30,aBs:-6,aBe:6,oF:0,lFh:12,lFk:-2,lBh:-10,lBk:-18,fF:0,fB:0,flash:0,spit:0,drip:0,burst:0,eyeG:0,shiver:0};
  const W8=(i,n)=>i/n*Math.PI*2;
  const ANIMS={
    idle:{nome:'Parado (papo pulsando)',n:8,dur:()=>150,pose:i=>{ const p=W8(i,8), s=Math.sin(p);
      return {sac:0.24+0.12*(Math.sin(p)+1)/2, sacY:0.6*Math.sin(p-0.9), breath:(s+1)/2, lean:34+1.4*s, head:-24+2.2*Math.sin(p-0.7), jaw:6+4*Math.max(0,Math.sin(p-1.2)),
        aFs:2+2.5*Math.sin(p-0.5), aFe:30+5*Math.sin(p-0.9), aBs:-6+2*Math.sin(p-0.6), aBe:6+3*Math.sin(p-1), drip:i%4, lFh:12, lFk:-2+1.2*s}; }},
    walk:{nome:'Andar (arrastado)',n:8,dur:()=>130,pose:i=>{ const p=W8(i,8);
      const lFh=6+15*Math.sin(p), lBh=6+15*Math.sin(p+Math.PI);
      return {lFh, lFk:lFh-22*Math.max(0,Math.cos(p))-6, lBh, lBk:lBh-22*Math.max(0,Math.cos(p+Math.PI))-6,
        fF:-10*Math.max(0,-Math.cos(p))+14*Math.max(0,Math.cos(p))*Math.max(0,-Math.sin(p)), fB:-10*Math.max(0,-Math.cos(p+Math.PI))+14*Math.max(0,Math.cos(p+Math.PI))*Math.max(0,-Math.sin(p+Math.PI)),
        lean:35+3*Math.abs(Math.sin(p)), head:-24+3.5*Math.sin(2*p-0.8), sac:0.26+0.05*Math.sin(2*p-1.2), sacY:1.4*Math.sin(2*p-1.6),
        aFs:2-12*Math.sin(p), aFe:30-10*Math.sin(p-0.5), aBs:-4+12*Math.sin(p), aBe:8+10*Math.sin(p-0.5), jaw:7+2*Math.sin(2*p), drip:i%4, breath:0.5+0.5*Math.sin(2*p)}; }},
    attack:{nome:'Cuspir (papo infla e dispara)',n:9,spitAt:4,hit:4,dur:i=>[170,170,190,150,70,150,150,150,140][i],pose:i=>[
      {sac:0.5,head:-32,lean:30,jaw:2,hx:-1,aFs:-4,aFe:6,aBs:-10,breath:0.6},
      {sac:0.8,head:-42,lean:24,jaw:0,hx:-2,lFh:15,lBh:-14,aFs:-12,aFe:2,aBs:-16,aBe:0,breath:1,eyeG:1},
      {sac:1.08,head:-50,lean:18,jaw:1,hx:-4,rot:-4,lFh:18,lFk:0,lBh:-18,lBk:-24,aFs:-20,aFe:-8,aBs:-22,aBe:-6,breath:1,eyeG:1},
      {sac:1.2,head:-54,lean:16,jaw:4,hx:-4,rot:-5,lFh:18,lFk:0,lBh:-18,lBk:-24,aFs:-22,aFe:-10,aBs:-24,aBe:-8,breath:1,eyeG:1,shiver:1},
      {sac:0.32,head:-62,lean:40,jaw:32,hx:5,rot:2,spit:1,lFh:24,lFk:8,lBh:-22,lBk:-30,aFs:34,aFe:46,aBs:-30,aBe:-24,oF:1,eyeG:1},
      {sac:0.16,head:-50,lean:42,jaw:26,hx:5,rot:2,lFh:24,lFk:8,lBh:-22,lBk:-30,aFs:28,aFe:40,aBs:-22,aBe:-14,oF:1,drip:3},
      {sac:0.14,head:-36,lean:38,jaw:16,hx:3,lFh:18,lFk:4,lBh:-16,lBk:-24,aFs:16,aFe:26,drip:2},
      {sac:0.18,head:-28,lean:35,jaw:10,hx:1,aFs:8,aFe:18,drip:1},
      {sac:0.22,head:-25,lean:34,jaw:7}][i]},
    // ---- ataques extras ----
    spitJet:{nome:'Jato em linha (de perto)',n:9,hit:4,reach:90,warn:[1,2,3],dur:i=>[140,140,150,60,90,90,110,140,140][i],pose:i=>[
      {sac:0.6,head:-30,lean:30,jaw:2,hx:-1,aFs:-6,aFe:4,aBs:-12,breath:0.7},
      {sac:1.0,head:-36,lean:22,jaw:0,hx:-3,rot:-3,lFh:16,lBh:-16,lBk:-22,aFs:-16,aFe:-2,aBs:-20,aBe:-4,breath:1,eyeG:1,shiver:1},
      {sac:1.25,head:-40,lean:18,jaw:1,hx:-5,rot:-4,lFh:18,lBh:-18,lBk:-24,aFs:-22,aFe:-8,aBs:-24,aBe:-8,breath:1,eyeG:1,shiver:1},
      {sac:0.8,head:-34,lean:44,jaw:34,hx:6,rot:1,spit:2,lFh:26,lFk:8,lBh:-24,lBk:-32,aFs:30,aFe:40,aBs:-30,aBe:-24,oF:1,eyeG:1},
      {sac:0.5,head:-32,lean:46,jaw:36,hx:7,rot:1,spit:3,lFh:26,lFk:8,lBh:-24,lBk:-32,aFs:30,aFe:40,aBs:-30,aBe:-24,oF:1,eyeG:1},
      {sac:0.24,head:-34,lean:44,jaw:30,hx:6,rot:1,spit:2,lFh:24,lFk:8,lBh:-22,lBk:-30,aFs:26,aFe:36,aBs:-24,aBe:-16,oF:1},
      {sac:0.12,head:-40,lean:40,jaw:20,hx:4,lFh:20,lFk:4,lBh:-18,lBk:-26,aFs:16,aFe:26,drip:3},
      {sac:0.16,head:-30,lean:36,jaw:12,hx:2,aFs:8,aFe:18,drip:2},
      {sac:0.22,head:-25,lean:34,jaw:7}][i]},
    neckSlam:{nome:'Pancada com o papo inchado',n:8,hit:4,reach:34,dur:i=>[150,150,170,60,120,150,140,150][i],pose:i=>[
      {sac:0.5,head:-34,lean:28,jaw:4,hx:-1,aFs:-4,aFe:8,aBs:-10,breath:0.6},
      {sac:0.9,head:-56,lean:10,jaw:2,hx:-4,rot:-4,lFh:16,lBh:-16,lBk:-22,aFs:-30,aFe:-14,aBs:-34,aBe:-18,breath:1,eyeG:1},
      {sac:1.15,head:-66,lean:2,jaw:2,hx:-6,rot:-6,lFh:18,lBh:-18,lBk:-24,aFs:-40,aFe:-20,aBs:-44,aBe:-26,breath:1,eyeG:1,shiver:1},
      {sac:1.1,head:-10,lean:56,jaw:12,hx:8,rot:3,lFh:30,lFk:10,lBh:-26,lBk:-34,aFs:-50,aFe:-30,aBs:-56,aBe:-36,eyeG:1},
      {sac:0.9,head:6,lean:64,jaw:22,hx:12,rot:4,lFh:32,lFk:12,lBh:-28,lBk:-36,aFs:-56,aFe:-36,aBs:-60,aBe:-40,drip:3,eyeG:1},
      {sac:0.6,head:-12,lean:56,jaw:18,hx:10,lFh:28,lFk:8,lBh:-24,lBk:-32,aFs:-30,aFe:-10,aBs:-36,aBe:-16,drip:2},
      {sac:0.3,head:-24,lean:42,jaw:10,hx:5,lFh:18,lFk:4,lBh:-16,lBk:-24,aFs:-6,aFe:14},
      {sac:0.24,head:-25,lean:34,jaw:7}][i]},
    hurt:{nome:'Dano (cabeça)',n:4,dur:i=>[70,110,120,150][i],pose:i=>[
      {lean:12,head:-44,jaw:22,hx:-6,rot:-6,flash:1,aFs:-34,aFe:-22,aBs:-40,aBe:-30,sac:0.36,sacY:-2,lFh:4,lBh:-18,oF:1},
      {lean:16,head:-40,jaw:20,hx:-6,rot:-5,aFs:-28,aFe:-14,aBs:-32,aBe:-22,sac:0.34,sacY:-1,lFh:4,lBh:-18,oF:1},
      {lean:26,head:-30,jaw:14,hx:-3,rot:-2,aFs:-6,aFe:6,sac:0.3,sacY:1.5},
      {lean:32,head:-26,jaw:8,hx:-1,sacY:0.6}][i]},
    hurtB:{nome:'Dano (barriga)',n:4,dur:i=>[70,120,130,150][i],pose:i=>[
      {lean:58,head:-6,jaw:26,hx:-5,flash:1,aFs:30,aFe:60,aBs:24,aBe:50,sac:0.08,sacY:3,lFh:-4,lFk:-16,lBh:-20,lBk:-34,drip:3,oF:1},
      {lean:56,head:-8,jaw:24,hx:-5,aFs:26,aFe:56,aBs:20,aBe:46,sac:0.1,sacY:3,lFh:-4,lFk:-16,lBh:-20,lBk:-34,drip:3,oF:1},
      {lean:46,head:-16,jaw:16,hx:-2,aFs:16,aFe:34,sac:0.16,sacY:2,drip:2},
      {lean:36,head:-22,jaw:9,sacY:0.8,drip:1}][i]},
    fall:{nome:'Derrubado',n:5,dur:i=>[90,110,110,140,260][i],pose:i=>[
      {rot:-18,lean:22,head:-40,jaw:22,hx:-4,flash:1,aFs:-40,aFe:-24,aBs:-50,aBe:-34,lFh:20,lFk:4,lBh:-6,lBk:-10,sac:0.3,sacY:-2,oF:1},
      {rot:-50,lift:12,lean:12,head:-34,jaw:24,hx:0,aFs:40,aFe:70,aBs:20,aBe:50,lFh:40,lFk:10,lBh:24,lBk:0,sac:0.32,sacY:-3,oF:1},
      {rot:-80,lift:6,lean:6,head:-22,jaw:22,hx:6,aFs:110,aFe:140,aBs:90,aBe:120,lFh:36,lFk:0,lBh:22,lBk:-6,sac:0.3,sacY:-1,oF:1},
      {rot:-92,lean:0,head:-8,jaw:18,hx:10,aFs:160,aFe:170,aBs:140,aBe:150,lFh:26,lFk:-8,lBh:12,lBk:-4,sac:0.28,sacY:2,oF:1},
      {rot:-92,lean:0,head:-4,jaw:12,hx:10,aFs:166,aFe:178,aBs:146,aBe:158,lFh:22,lFk:-10,lBh:10,lBk:-6,sac:0.26,sacY:3}][i]},
    getup:{nome:'Levantar',n:5,dur:i=>[200,160,150,140,140][i],pose:i=>[
      {rot:-90,lean:2,head:-6,jaw:10,hx:10,aFs:150,aFe:160,aBs:130,aBe:140,lFh:30,lFk:-20,lBh:16,lBk:-10,sac:0.26,sacY:3},
      {rot:-58,lean:44,head:-40,jaw:12,hx:8,aFs:50,aFe:30,aBs:-60,aBe:-40,lFh:96,lFk:-30,lBh:80,lBk:-50,sac:0.26,sacY:1},
      {rot:-22,lean:52,head:-36,jaw:10,hx:5,aFs:40,aFe:20,aBs:10,aBe:0,lFh:76,lFk:-30,lBh:-10,lBk:-96,sac:0.24},
      {rot:-4,lean:44,head:-30,jaw:8,hx:2,aFs:22,aFe:24,aBs:6,aBe:10,lFh:34,lFk:-24,lBh:-12,lBk:-44,sac:0.24},
      {lean:36,head:-25,jaw:7,sac:0.25}][i]},
    death:{nome:'Morte (papo estoura)',n:8,dur:i=>[90,140,150,90,120,130,200,400][i],pose:i=>[
      {lean:16,head:-46,jaw:24,hx:-5,rot:-6,flash:1,aFs:-30,aFe:-20,aBs:-36,aBe:-26,sac:0.6,oF:1},
      {lean:20,head:-56,jaw:18,hx:-4,rot:-4,aFs:-60,aFe:-90,aBs:-50,aBe:-80,sac:1.3,eyeG:1,shiver:1,oF:1},
      {lean:14,head:-64,jaw:30,hx:-4,rot:-6,aFs:-80,aFe:-120,aBs:-70,aBe:-110,sac:1.55,eyeG:1,shiver:1,oF:1},
      {lean:10,head:-60,jaw:34,hx:-5,rot:-10,aFs:-50,aFe:-30,aBs:-60,aBe:-40,sac:0.2,burst:1,oF:1},
      {lean:6,head:-40,jaw:30,hx:-2,rot:-42,lift:8,aFs:40,aFe:70,aBs:20,aBe:50,lFh:34,lFk:10,lBh:16,lBk:-4,sac:0.1,burst:2,oF:1},
      {lean:2,head:-16,jaw:26,hx:6,rot:-82,lift:3,aFs:120,aFe:150,aBs:100,aBe:130,lFh:30,lFk:0,lBh:18,lBk:-6,sac:0.06,burst:3,oF:1},
      {lean:0,head:-4,jaw:22,hx:10,rot:-93,aFs:162,aFe:174,aBs:142,aBe:154,lFh:24,lFk:-8,lBh:12,lBk:-6,sac:0.04,burst:4},
      {lean:0,head:0,jaw:20,hx:10,rot:-93,aFs:168,aFe:180,aBs:146,aBe:160,lFh:20,lFk:-12,lBh:8,lBk:-8,sac:0.04,burst:5}][i]},
  };
  const EXK=['hx','lean','head','aFs','aFe','aBs','aBe','lFh','lFk','lBh','lBk','sac'];
  const EXF={idle:1.15,walk:1.15,attack:1.3,spitJet:1.25,neckSlam:1.25,hurt:1.3,hurtB:1.25,fall:1.1,getup:1.05,death:1.15};
  function exag(P,f){ if(f===1||Math.abs(P.rot)>4) return P; EXK.forEach(k=>{ P[k]=REST[k]+(P[k]-REST[k])*f; }); P.jaw=Math.min(44,REST.jaw+(P.jaw-REST.jaw)*f); P.sac=Math.max(0.02,P.sac); return P; }
  ZREACT.add(ANIMS,REST,{moves:{bite:["lunge","Bote de mordida (pescoço esticado)"]}}); // reações (voando, agarrado) + golpe extra — art-src/shared/zreact.js
  function poseOf(anim,i){ return exag(Object.assign({},REST,ANIMS[anim].pose(i)),EXF[anim]||1); }
  function heavyOutline(cv){ const g=cv.getContext('2d'), W=cv.width, H=cv.height, im=PIX.pix(cv), d=im.data;
    const isO=i=>d[i+3]===255&&d[i]===0x17&&d[i+1]===0x0b&&d[i+2]===0x1c, fill=i=>d[i+3]===255&&!isO(i);
    const add=[]; for(let y=2;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(d[i+3]) continue; const u=((y-1)*W+x)*4, u2=((y-2)*W+x)*4; if(isO(u)&&fill(u2)) add.push(i); }
    add.forEach(i=>{ d[i]=0x17; d[i+1]=0x0b; d[i+2]=0x1c; d[i+3]=255; }); g.putImageData(im,0,0); }

  /* ---------- esqueleto: espaço do corpo (quadril na origem) → mundo (giro total + apoio no chão) ---------- */
  function skeleton(P){
    const lean=rad(P.lean), lc=Math.cos(lean), ls=Math.sin(lean);
    const T=(lx,ly)=>({x:(lx*lc-ly*ls)*TS, y:(lx*ls+ly*lc)*TS});
    const hipF={x:2,y:0}, hipB={x:-4,y:-1};
    const kneeF=lp(hipF,P.lFh,25), ankleF=lp(kneeF,P.lFk,24), kneeB=lp(hipB,P.lBh,25), ankleB=lp(kneeB,P.lBk,24);
    const neckB=T(6,-36), shF=T(5,-33), shB=T(1,-30);
    const hpv=T(15,-38);
    const ha=lean+rad(P.head), hc=Math.cos(ha), hs=Math.sin(ha);
    const Hb=(lx,ly)=>({x:hpv.x+(lx*hc-ly*hs)*HS, y:hpv.y+(lx*hs+ly*hc)*HS});
    const elF=lp(shF,P.aFs,17), wrF=lp(elF,P.aFe,16), elB=lp(shB,P.aBs,17), wrB=lp(elB,P.aBe,16);
    const pts={hipF,hipB,kneeF,ankleF,kneeB,ankleB,neckB,shF,shB,hpv,elF,wrF,elB,wrB,
      throat:Hb(3,3), mouth:Hb(13,-3), eye:Hb(8,-10),
      c1:T(-17,-32), c2:T(-9,-43), c3:T(16,-14), c4:T(-12,-4), c5:Hb(1,-11), c6:Hb(-8,-8)};
    const R=rad(P.rot), rc=Math.cos(R), rs=Math.sin(R);
    const hip0={x:AX+P.hx, y:0};
    const W={}; for(const k in pts){ const q=pts[k]; W[k]={x:hip0.x+q.x*rc-q.y*rs, y:q.x*rs+q.y*rc}; }
    W.hip={x:hip0.x,y:0};
    const footOff=R=>({x:-Math.sin(R)*8.2, y:Math.cos(R)*8.2});
    const fo=footOff(R);
    const cands=[W.ankleF.y+fo.y, W.ankleB.y+fo.y, W.c1.y+10, W.c2.y+10, W.c3.y+10, W.c4.y+9, W.c5.y+12, W.c6.y+7, W.kneeF.y+5, W.kneeB.y+5, W.wrF.y+3, W.wrB.y+3, W.elF.y+3, W.elB.y+3];
    const dy=GROUND-Math.max(...cands)-P.lift;
    for(const k in W) W[k].y+=dy;
    const sk=W; sk.a=lean+R; sk.ha=ha+R; sk.R=R;
    const c=Math.cos(sk.ha), s=Math.sin(sk.ha);
    sk.H=(lx,ly)=>({x:sk.hpv.x+(lx*c-ly*s)*HS, y:sk.hpv.y+(lx*s+ly*c)*HS});
    const ta=sk.a, tc=Math.cos(ta), ts=Math.sin(ta);
    sk.T=(lx,ly)=>({x:sk.hip.x+(lx*tc-ly*ts)*TS, y:sk.hip.y+(lx*ts+ly*tc)*TS});
    return sk;
  }

  /* ---------- caneta com recorte ---------- */
  function pen(c,u){ const p=mkPen(c,u); p.c=c;
    p.clip=pts=>{ c.beginPath(); pts.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])); c.closePath(); c.clip(); };
    p.clipE=(x,y,rx,ry)=>{ c.beginPath(); c.ellipse(x,y,rx,ry,0,0,Math.PI*2); c.clip(); };
    p.ln=(a,b,w)=>p.cap(a,b,w,w);
    p.save=()=>c.save(); p.restore=()=>c.restore();
    return p; }

  /* ---------- tronco: corcunda, barriga, regata listrada ---------- */
  const BODY=b=>[[11,3],[14+b,-6],[16+b,-15],[15+b*0.6,-24],[12,-31],[7,-36],[0,-40],[-6,-43],[-12,-42],[-17,-36],[-19,-27],[-18,-17],[-15,-8],[-11,1]];
  // regata listrada: listras em aro (perpendiculares à coluna), curvadas pra dar volume de barril
  function hoop(p,y0,h,cv){ const pts=[]; for(let x=-24;x<=22;x+=2){ const u=x/21; pts.push([x,y0+cv*(1-u*u)]); } for(let x=22;x>=-24;x-=2){ const u=x/21; pts.push([x,y0+h+cv*(1-u*u)]); } p.poly(pts); }
  function fabric(p,M,pts,t){ p.save(); p.clip(pts); p.F(M.shirt[t]); p.rect(-30,-60,60,70);
    p.F(M.stripe[t]); [-33,-21].forEach(y=>hoop(p,y,3.6,2.4)); p.F(M.shirt[3]); [-33,-21].forEach(y=>{ hoop(p,y-0.9,0.8,2.4); hoop(p,y+3.6,0.8,2.4); }); p.restore(); }
  function drawTorso(p,M,sk,P,form){
    p.xf(sk.a,sk.hip.x,sk.hip.y); p.c.scale(TS,TS);
    const b=P.breath*1.2, body=BODY(b);
    p.F(M.skin[1]); p.poly(body);
    // bermuda (cós) por baixo da barriga
    p.F(M.jeans[1]); p.poly([[-12,-5],[12.5,-5],[13,4],[-11.5,4]]);
    p.F(M.jeans[2]); p.rect(-12,-1,25,1); p.F(M.jeans[0]); p.rect(-6,-4.6,1.4,3.4); p.rect(5,-4.6,1.4,3.4);
    p.F(M.stripe[2]); p.rect(-12,-5.4,25,1.2);
    // pele: corcunda e ombros
    p.F(M.skin[2]); p.poly([[-19,-27],[-17,-36],[-12,-42],[-8,-42],[-13,-37],[-16,-28],[-16,-18],[-18,-17]]);
    p.F(M.skin[0]); p.poly([[-5,-42.6],[2,-40],[-2,-38.6],[-8,-40.6]]);
    p.F(M.rot[1]); p.ell(-11,-38,2.4,1.6);
    // regata
    const top=[[-24,-40],[-17,-41],[-12,-43],[-8,-40.6],[-3,-38.4],[1,-37.4],[4.6,-38],[8,-35],[12,-31],[20,-28],[20,-9+b*0.2],[15,-7.4],[9,-8.6],[4,-6.6],[-2,-8],[-8,-6],[-13,-7.6],[-22,-6]];
    p.save(); p.clip(body);
    fabric(p,M,top,1);
    // planos de luz e sombra do pano (luz vem de cima: topo da corcunda claro; costas e barriga por baixo escuros)
    fabric(p,M,[[-24,-44],[-15,-42],[-11,-34],[-9,-24],[-8,-16],[-4,-10],[4,-12],[12,-16],[20,-17],[20,-6],[-24,-6]],2);
    fabric(p,M,[[-24,-50],[6,-50],[6,-41],[0,-39.4],[-6,-41.4],[-12,-40.6],[-16,-38],[-24,-36]],0);
    fabric(p,M,[[-24,-30],[-18,-30],[-15,-20],[-13,-12],[-8,-8],[6,-9],[20,-10],[20,-6],[-24,-6]],3);
    // sombra projetada do papo no peito
    fabric(p,M,[[6,-36],[14,-33],[18,-24],[12,-21],[7,-28]],3);
    p.restore();
    // dobras / costura / rasgos
    p.F(M.shirt[3]); p.ln(P2(-6,-28),P2(2,-22),0.9); p.ln(P2(-4,-20),P2(5,-16),0.9); p.ln(P2(-8,-14),P2(-1,-11),0.8);
    p.F(M.shirt[0]); p.ln(P2(-5,-27),P2(2,-21.4),0.6);
    // barra desfiada e barriga aparecendo
    p.F(M.skin[1]); p.poly([[2,-7],[14,-8.6],[13.4,-5],[3,-4.6]]);
    p.F(M.skin[2]); p.rect(4,-5.6,9,1); p.F(M.skin[3]); p.ell(9,-6.6,0.8,0.7);
    p.F(M.shirt[2]); [[-12,-7.6],[-7,-6.2],[-2,-8],[3,-7]].forEach(([x,y])=>p.poly([[x,y],[x+2.4,y-0.4],[x+1.2,y+2.2]]));
    // rasgo com queimadura de ácido
    p.F(M.flesh[2]); p.ell(-4,-31,3.6,2.4); p.F(M.flesh[1]); p.ell(-4,-31.4,2.6,1.6); p.F(M.acid[2]); p.ell(-4.6,-30.8,1.2,0.8);
    p.F(M.rot[2]); p.ell(-12,-19,2.6,3.2); p.F(M.skin[2]); p.ell(-12,-19.4,1.7,2.2); p.F(M.rot[1]); p.rect(-12.6,-20.6,1,1);
    // manchas de baba ácida escorrida no peito
    p.F(M.acid[2]); p.poly([[10,-30],[12,-29],[11.6,-20],[10.6,-18],[10.2,-24]]); p.F(M.acid[1]); p.rect(10.6,-28,0.9,4);
    if(form==='plenilunar'){ p.F(M.flesh[2]); p.ell(-14,-30,2.4,1.8); }
    p.id();
  }

  /* ---------- membro com planos de luz: base, metade de sombra (lado oposto à luz), filete de luz ---------- */
  function limb(p,R,a,b,wa,wb,sh=0.5){
    p.F(R[1]); p.cap(a,b,wa,wb);
    const L=Math.hypot(b.x-a.x,b.y-a.y)||1; let nx=-(b.y-a.y)/L, ny=(b.x-a.x)/L; if(nx*-0.7+ny*0.7<0){ nx=-nx; ny=-ny; }
    const q=(P,w,t)=>P2(P.x+nx*w*t,P.y+ny*w*t);
    p.F(R[2]); p.poly([[q(a,wa,0.5-sh).x,q(a,wa,0.5-sh).y],[q(b,wb,0.5-sh).x,q(b,wb,0.5-sh).y],[q(b,wb,0.5).x,q(b,wb,0.5).y],[q(a,wa,0.5).x,q(a,wa,0.5).y]]);
    p.circle(q(b,wb,0.5-sh*0.5),wb*sh*0.5);
    p.F(R[3]); p.poly([[q(a,wa,0.34).x,q(a,wa,0.34).y],[q(b,wb,0.34).x,q(b,wb,0.34).y],[q(b,wb,0.5).x,q(b,wb,0.5).y],[q(a,wa,0.5).x,q(a,wa,0.5).y]]);
    p.F(R[0]); p.ln(q(lerp(a,b,0.12),wa,-0.3),q(lerp(a,b,0.7),wb,-0.3),Math.max(0.9,wa*0.12));
    return {nx,ny};
  }

  /* ---------- pernas: bermuda jeans, canela inchada, chinelo ---------- */
  function drawLeg(p,M,sk,hip,knee,ankle,fa,front){
    p.id();
    // canela com batata da perna inchada
    const cf=lerp(knee,ankle,0.32);
    const n=limb(p,M.skin,knee,ankle,10,8.2,0.6);
    p.F(M.skin[1]); p.circle(P2(cf.x+n.nx*1.4,cf.y+n.ny*1.4),4.2); p.F(M.skin[2]); p.circle(P2(cf.x+n.nx*2.4,cf.y+n.ny*2.4),2.8);
    p.F(M.skin[0]); p.rect(knee.x-n.nx*2.2,knee.y+2,1.2,2.4);
    p.F(M.rot[1]); const v=lerp(knee,ankle,0.55); p.ln(P2(v.x-n.nx*1.2,v.y-2),P2(v.x-n.nx*1.6+0.6,v.y+2),0.8); p.ln(P2(v.x-n.nx*1.6+0.6,v.y+2),P2(v.x-n.nx*0.6,v.y+4),0.7);
    p.F(M.rot[2]); p.ell(lerp(knee,ankle,0.75).x,lerp(knee,ankle,0.75).y,1.3,1.6);
    // bermuda: coxa com dobra, costura e barra desfiada larga
    limb(p,M.jeans,hip,knee,15.6,13.6,0.55);
    const km=lerp(hip,knee,1.06), ang=Math.atan2(knee.y-hip.y,knee.x-hip.x);
    p.xf(ang,km.x,km.y);
    p.F(M.jeans[1]); p.poly([[-4,-6.8],[1.4,-7],[2.8,-4.4],[1.6,-1.6],[3.2,1],[1.6,4],[2.6,6.8],[-4,6.4]]);
    p.F(M.jeans[2]); p.poly([[-4,1],[2.4,1.4],[1.6,4],[2.6,6.8],[-4,6.4]]);
    p.F(M.sole[1]); p.rect(1.4,-6.2,1.6,0.7); p.rect(1.8,-0.6,1.8,0.7); p.rect(1.2,3.6,1.8,0.7); p.rect(2.2,5.4,1.2,0.7);
    p.F(M.jeans[3]); p.rect(-2.6,-6.4,0.9,12.8);
    p.F(M.jeans[0]); p.rect(-4,-6.2,1,5);
    p.id();
    p.F(M.jeans[3]); p.ln(lerp(hip,knee,0.2),lerp(hip,knee,0.55),0.8);
    const cr=lerp(hip,knee,0.6); p.F(M.jeans[2]); p.ln(P2(cr.x-3,cr.y-1),P2(cr.x+3,cr.y+1.2),0.9); p.F(M.jeans[0]); p.ln(P2(cr.x-2.6,cr.y-2.2),P2(cr.x+2.6,cr.y-0.4),0.6);
    if(front){ const q=lerp(hip,knee,0.36); p.F(M.jeans[3]); p.ell(q.x+1.6,q.y,2.6,1.6); p.F(M.skin[2]); p.ell(q.x+1.6,q.y+0.2,1.8,1); p.F(M.sole[1]); p.rect(q.x+3.4,q.y-1.2,1.4,0.6); p.rect(q.x-0.6,q.y+1,1.2,0.6); }
    // pé
    p.xf(sk.R+rad(fa),ankle.x,ankle.y); p.c.scale(1.5,1.5);
    p.F(M.skin[1]); p.poly([[-3.8,-2.6],[2.4,-2.8],[7.6,0.4],[9.8,2.2],[9.8,3.9],[-4.2,3.9],[-4.6,0]]);
    p.F(M.skin[2]); p.poly([[-4.4,0.4],[-1,1],[3,2.2],[9.8,2.6],[9.8,3.9],[-4.2,3.9]]); p.F(M.skin[0]); p.rect(1.6,-1.6,3.2,0.9); p.rect(6,0.4,1.6,0.8);
    p.F(M.skin[3]); p.rect(5.6,2.2,0.7,1.4); p.rect(7.6,2.4,0.7,1.2);
    p.F(M.nail[1]); p.rect(8.6,2.2,1,1); p.rect(6.6,2.4,1,1);
    if(front){
      p.F(M.sole[1]); p.poly([[-5.2,3.6],[10.6,3.6],[11,5.6],[-5.6,5.6]]); p.F(M.sole[3]); p.rect(-5.6,5,16.6,0.7); p.F(M.sole[0]); p.rect(-4.6,3.6,13,0.7);
      p.F(M.strap[1]); p.poly([[5.4,1.6],[6.4,2.4],[1,0],[-2.4,3.8],[-3.6,3.4],[0.4,-1.2]]); p.F(M.strap[0]); p.rect(-0.2,-0.8,2.2,0.8); p.F(M.strap[3]); p.rect(-3,3,1.4,0.8);
    } else { p.F(M.rot[2]); p.rect(-4,3.2,13.6,0.8); p.F(M.blood[2]); p.rect(0,3.4,2,0.6); }
    p.id();
  }

  /* ---------- braço: ombro nu, bíceps flácido, mão grande de garras ---------- */
  function drawArm(p,M,sh,el,wr,front,open){
    p.id();
    const nf=limb(p,M.skin,el,wr,10.6,8.6,0.6);
    const n=limb(p,M.skin,sh,el,13.4,10.4,0.6), nx=-n.nx, ny=-n.ny;
    // bíceps caído (papada do braço) do lado de baixo
    const bz=lerp(sh,el,0.5); p.F(M.skin[2]); p.ell(bz.x+n.nx*2.6,bz.y+n.ny*2.6,3.4,2.4,Math.atan2(el.y-sh.y,el.x-sh.x));
    p.F(M.skin[3]); p.circle(el,1.4); p.F(M.skin[0]); p.circle(P2(el.x+nx*1.6,el.y+ny*1.6),0.9);
    p.F(M.rot[1]); p.ell(bz.x+nx*1.4,bz.y+ny*1.4,2,1.4); p.F(M.rot[2]); p.rect(bz.x+nx*1.4-0.5,bz.y+ny*1.4-0.5,1,1);
    const fz=lerp(el,wr,0.5); p.F(M.rot[2]); p.ell(fz.x-nf.nx*0.6,fz.y-nf.ny*0.6,1.2,1.6); if(front){ p.F(M.flesh[2]); p.ell(fz.x+nf.nx*1.6,fz.y+nf.ny*1.6,1.6,1.1); p.F(M.flesh[1]); p.rect(fz.x+nf.nx*1.6-0.5,fz.y+nf.ny*1.6-0.5,1,1); }
    // veias saltadas e manchas
    p.F(M.skin[3]); const v0=lerp(el,wr,0.15), v1=lerp(el,wr,0.6), v2=lerp(el,wr,0.9); p.ln(P2(v0.x-nf.nx*1.6,v0.y-nf.ny*1.6),P2(v1.x-nf.nx*0.6,v1.y-nf.ny*0.6),0.6); p.ln(P2(v1.x-nf.nx*0.6,v1.y-nf.ny*0.6),P2(v2.x-nf.nx*1.8,v2.y-nf.ny*1.8),0.55);
    p.F(M.rot[2]); const s1=lerp(sh,el,0.3); p.rect(s1.x-n.nx*2.4,s1.y-n.ny*2.4,1,1); p.rect(s1.x-n.nx*0.6+1,s1.y+2,0.9,0.9);
    // tendões do antebraço
    p.F(M.skin[2]); p.ln(lerp(el,wr,0.25),lerp(el,wr,0.85),0.7);
    // alça da regata no ombro
    p.F(M.shirt[2]); p.ln(P2(sh.x-2.4,sh.y-4.2),P2(sh.x+3,sh.y-3.4),2.4); p.F(M.stripe[2]); p.rect(sh.x-0.6,sh.y-5.2,1.4,2.2);
    const ang=Math.atan2(wr.y-el.y,wr.x-el.x); p.xf(ang,wr.x,wr.y); p.c.scale(1.55,1.55);
    // mão grande: palma, nós dos dedos, 4 dedos com garras, polegar
    p.F(M.skin[1]); p.poly([[-1,-3.6],[5.2,-4.2],[6.6,3.8],[-1,3.6]]);
    p.F(M.skin[2]); p.poly([[-1,0.8],[6.2,1.2],[6.6,3.8],[-1,3.6]]);
    const curl=open?0.4:1.6;
    for(let k=0;k<4;k++){ const y0=-3.3+k*2.25, m=P2(9+(k===0||k===3?-0.4:0.3),y0+curl*0.3+k*0.12), t=P2(11.2+(open?1.2:0)-(k===3?1:0),y0+curl+k*0.2);
      p.F(M.skin[3]); p.cap(P2(5.6,y0),m,2.3,2.1); p.cap(m,t,2.1,1.8);
      p.F(M.skin[k<2?1:2]); p.cap(P2(5.6,y0-0.15),m,1.7,1.5); p.cap(m,P2(t.x-0.2,t.y-0.1),1.5,1.2);
      p.F(M.skin[0]); p.rect(5.2,y0-0.9,1.2,0.8); p.rect(m.x-0.4,m.y-0.9,0.9,0.7);
      p.F(M.teeth[2]); p.poly([[t.x-0.8,t.y-0.9],[t.x+1.6,t.y-0.1],[t.x+2,t.y+2.2],[t.x-0.6,t.y+1]]);
      p.F(M.teeth[0]); p.poly([[t.x-0.6,t.y-0.8],[t.x+1.2,t.y-0.2],[t.x+0.6,t.y+0.6]]); }
    p.F(M.skin[1]); p.cap(P2(1.6,-3.4),P2(4.6,-6.4),2.4,2); p.cap(P2(4.6,-6.4),P2(6.6,-6.8),2,1.6);
    p.F(M.teeth[1]); p.rect(6.8,-7.6,1.2,1.2); p.F(M.skin[0]); p.rect(2.6,-5,1.4,0.8);
    p.id();
  }

  /* ---------- cabeça ---------- */
  function drawHead(p,M,sk,P,form){
    // pescoço grosso
    p.id(); p.F(M.skin[1]); p.cap(sk.neckB,sk.hpv,10,8.4);
    p.F(M.skin[2]); p.ln(lerp(sk.neckB,sk.hpv,0.1),lerp(sk.neckB,sk.hpv,0.9),1.2);
    p.xf(sk.ha,sk.hpv.x,sk.hpv.y); p.c.scale(HS,HS);
    p.F(M.skin[1]); p.ell(1,-11,10.2,10.4); p.poly([[2,-6],[12.4,-8],[14,-5],[12.6,-1.4],[3,0.6],[-4,-1]]);
    // plano de sombra da nuca e luz no topo
    p.F(M.skin[2]); p.poly([[-9,-14],[-6,-19],[-4,-15],[-5,-8],[-3,-2],[-7,-4],[-9.4,-9]]);
    p.F(M.skin[0]); p.ell(4,-18,5,2.4); p.rect(8,-15,3,1);
    // cabelo ralo
    p.F(M.hair[1]); p.poly([[-9,-12],[-8,-17],[-4,-20.6],[0,-21.4],[-3,-19.4],[-5.4,-16],[-6.4,-11]]);
    p.poly([[-1,-21],[3,-21.6],[0.6,-19.6]]); p.F(M.hair[2]); p.poly([[-8.4,-12],[-10.6,-9],[-7.6,-10]]);
    // orelha
    p.F(M.skin[1]); p.ell(-4.6,-8.6,2.6,3.4); p.F(M.skin[3]); p.ell(-4.4,-8.4,1,1.8);
    // sobrancelha pesada
    p.F(M.skin[1]); p.poly([[3,-15],[12.4,-14.4],[12.6,-12.6],[4,-12.4]]);
    p.F(M.skin[3]); p.poly([[4,-12.6],[11.6,-12.8],[11,-11.6],[5,-11.6]]);
    // olho fundo brilhando + olho leitoso
    p.F(M.skin[3]); p.ell(7.8,-10,3.2,2.6);
    const eg=P.eyeG?1.25:1;
    p.F(M.eye[2]); p.ell(8,-10,2.2*eg,1.9*eg); p.F(M.eye[1]); p.ell(8.2,-10.2,1.5*eg,1.3*eg); p.F(M.eye[0]); p.rect(8.4,-10.8,0.9,0.9);
    p.F(M.skin[3]); p.ell(12.4,-10,1.2,1.6); p.F(M.milk[1]); p.ell(12.4,-10.2,0.8,1.1);
    // nariz podre
    p.F(M.skin[1]); p.poly([[11,-10],[14.4,-6.8],[13.6,-5.4],[11,-6]]); p.F(M.skin[3]); p.rect(12.6,-6.2,1,0.9);
    p.F(M.skin[0]); p.rect(12,-9,1,1.4);
    // bochecha inchada / podridão
    p.F(M.rot[1]); p.ell(2,-5,2.8,2); p.F(M.rot[2]); p.ell(2.4,-4.8,1.4,1); p.F(M.skin[0]); p.ell(6,-6.4,1.6,1);
    p.F(M.flesh[2]); p.ell(-1,-15,1.6,1.2);
    // textura: veias na têmpora, cicatriz costurada no crânio, poros podres
    p.F(M.skin[3]); p.ln(P2(0,-12),P2(2.4,-9.6),0.6); p.ln(P2(2.4,-9.6),P2(1.6,-7),0.55); p.ln(P2(2.4,-9.6),P2(4.4,-8.6),0.5);
    p.F(M.flesh[3]); p.ln(P2(-6,-15),P2(1,-19.6),0.8); p.F(M.teeth[2]); [[-5,-16.6],[-3,-17.8],[-1,-19]].forEach(([x,y])=>p.ln(P2(x-0.7,y-1),P2(x+0.7,y+1),0.5));
    p.F(M.rot[2]); [[5,-15.4],[-2.6,-6],[8.6,-3]].forEach(([x,y])=>p.rect(x,y,0.9,0.9)); p.F(M.rot[1]); p.ell(-6,-11,1.4,1.8);
    // boca (lábio de cima + dentes)
    p.F(M.mouth[1]); p.poly([[5,-4.2],[13,-4.6],[13.4,-1.4],[5,-1]]);
    p.F(M.teeth[1]); p.rect(7,-4.6,1.4,1.8); p.rect(9.2,-4.7,1.4,1.6); p.rect(11.2,-4.6,1.2,1.4);
    p.F(M.teeth[2]); p.rect(7.1,-3.2,1.2,0.5);
    p.id();
  }
  function drawJaw(p,M,sk,P){
    const h=sk.H(3,-2); p.xf(sk.ha+rad(P.jaw),h.x,h.y); p.c.scale(HS,HS);
    p.F(M.skin[1]); p.poly([[-3,-1],[10.6,-0.6],[11.2,1.6],[9.4,5],[3,6],[-3,3]]);
    p.F(M.mouth[2]); p.poly([[2,-1],[10.4,-0.8],[10,1],[2.4,1.2]]);
    p.F(M.teeth[1]); p.rect(4,-1.8,1.3,1.8); p.rect(6.2,-1.9,1.3,1.8); p.rect(8.4,-1.7,1.2,1.6);
    p.F(M.skin[2]); p.rect(1,4.4,7,1.1); p.F(M.skin[0]); p.rect(7,1.8,2.4,0.9);
    p.F(M.acid[1]); const L=2+P.drip*1.4+(P.jaw>14?3:0); p.poly([[8.6,4.4],[10.4,4],[9.8,4.4+L],[9.2,5.4+L]]); p.F(M.acid[0]); p.rect(9.2,4.6,0.8,Math.max(1,L*0.5));
    p.F(M.acid[1]); p.ell(9.5,5.6+L,1.1,1.2);
    p.id();
  }

  /* ---------- papo de ácido (sem sombreamento automático: brilho próprio) ---------- */
  function sacGeom(sk,P){ const s=P.sac, rx=13.4+s*7.6, ry=12+s*7.8; const t=sk.throat; return {rx,ry,c:{x:t.x+1.4+s*1.2,y:t.y+ry*0.62+1.6+P.sacY}}; }
  function drawSac(p,M,sk,P,form,fi){
    p.id();
    if(P.burst){ drawBurst(p,M,sk,P); return; }
    const g=sacGeom(sk,P), c=g.c, rx=g.rx, ry=g.ry, sh=P.shiver?((fi%2)?0.7:-0.7):0;
    const cx=c.x+sh, cy=c.y;
    // pescoço do papo (pele esticada que liga à garganta)
    p.F(M.sacm[1]); p.cap(sk.throat,P2(cx-1,cy-ry*0.5),9.6,rx*1.3);
    p.F(M.sacm[2]); p.ln(P2(sk.throat.x-3,sk.throat.y+1),P2(cx-rx*0.7,cy-ry*0.3),1);
    // bolsa
    const bag=(d)=>{ p.ell(cx,cy+ry*0.12,Math.max(1,rx-d),Math.max(1,ry*0.88-d)); p.ell(cx-0.6,cy-ry*0.42,Math.max(1,rx*0.72-d),Math.max(1,ry*0.56-d)); };
    p.F(M.sacm[2]); bag(0);
    p.F(M.acid[3]); bag(1.3);
    p.F(M.acid[2]); p.ell(cx+0.6,cy+ry*0.06,rx-2.6,ry*0.8-2.4);
    p.F(M.acid[1]); p.ell(cx+1.2,cy-ry*0.12,rx*0.62,ry*0.58);
    p.F(M.acid[0]); p.ell(cx+rx*0.22,cy-ry*0.22,rx*0.26,ry*0.24);
    // pele do topo do papo (opaca)
    p.F(M.sacm[1]); p.poly([[cx-rx*0.96,cy-ry*0.24],[cx-rx*0.5,cy-ry*0.86],[cx+rx*0.2,cy-ry],[cx+rx*0.7,cy-ry*0.74],[cx+rx*0.2,cy-ry*0.56],[cx-rx*0.4,cy-ry*0.42]]);
    p.F(M.sacm[0]); p.poly([[cx-rx*0.2,cy-ry*0.92],[cx+rx*0.4,cy-ry*0.88],[cx+rx*0.1,cy-ry*0.74]]);
    // veias por cima
    p.F(M.sacm[3]);
    p.ln(P2(cx-rx*0.7,cy-ry*0.4),P2(cx-rx*0.3,cy+ry*0.1),0.8); p.ln(P2(cx-rx*0.3,cy+ry*0.1),P2(cx-rx*0.45,cy+ry*0.6),0.7);
    p.ln(P2(cx-rx*0.3,cy+ry*0.1),P2(cx+rx*0.1,cy+ry*0.35),0.7);
    p.ln(P2(cx+rx*0.5,cy-ry*0.55),P2(cx+rx*0.75,cy+ry*0.05),0.8); p.ln(P2(cx+rx*0.75,cy+ry*0.05),P2(cx+rx*0.55,cy+ry*0.5),0.7);
    // bolhas
    const bb=(fi*1.3)%3;
    p.F(M.acid[0]); p.circle(P2(cx-rx*0.25,cy+ry*0.25-bb),Math.max(0.7,rx*0.08)); p.circle(P2(cx+rx*0.35,cy+ry*0.45-bb*0.6),0.7);
    // reflexo molhado
    p.F(M.sacm[0]); p.ln(P2(cx+rx*0.55,cy-ry*0.25),P2(cx+rx*0.72,cy+ry*0.15),1); p.rect(cx+rx*0.5,cy-ry*0.42,1,1);
    // sedimento no fundo
    p.F(M.acid[3]); p.poly([[cx-rx*0.7,cy+ry*0.6],[cx+rx*0.7,cy+ry*0.6],[cx+rx*0.3,cy+ry*0.9],[cx-rx*0.3,cy+ry*0.9]]);
    // gota pendurada
    if(P.drip!==1){ const L=1+(P.drip%3)*1.4; p.F(M.acid[1]); p.poly([[cx-1,cy+ry-0.6],[cx+1,cy+ry-0.6],[cx+0.4,cy+ry+L],[cx-0.4,cy+ry+L]]); p.F(M.acid[1]); p.circle(P2(cx,cy+ry+L+0.8),1.1); }
    // pústulas extras (plenilunar)
    if(form==='plenilunar'){ [[-15,-34,3],[-8,-42,2.4],[13,-12,2.6]].forEach(([x,y,r])=>{ const q=sk.T(x,y); p.F(M.sacm[2]); p.circle(q,r+0.8); p.F(M.acid[2]); p.circle(q,r); p.F(M.acid[1]); p.circle(P2(q.x+0.3,q.y-0.3),r*0.6); p.F(M.acid[0]); p.rect(q.x+r*0.2,q.y-r*0.5,1,1); }); }
    if(form==='enluarado'){ [[-14,-26],[-6,-40]].forEach(([x,y])=>{ const q=sk.T(x,y); p.F(M.acid[1]); p.ln(q,P2(q.x+2,q.y+3),0.9); p.F(M.acid[0]); p.rect(q.x,q.y,0.9,0.9); }); }
    // cuspe saindo da boca
    if(P.spit){ const m=sk.mouth, a=sk.ha-0.35; const d=(k)=>P2(m.x+Math.cos(a)*k,m.y+Math.sin(a)*k);
      p.F(M.acid[2]); p.ell(d(6).x,d(6).y,6,4.2,a); p.F(M.acid[1]); p.ell(d(7).x,d(7).y,4.4,3,a); p.F(M.acid[0]); p.ell(d(8).x,d(8).y,2,1.4,a);
      [[13,-3,1.6],[15,3,1.2],[11,5,1.1],[17,0,0.9]].forEach(([k,o,r])=>{ const q=d(k); p.F(M.acid[1]); p.circle(P2(q.x-Math.sin(a)*o,q.y+Math.cos(a)*o),r); });
      if(P.spit>=2){ const L=P.spit>=3?44:30; for(let k=8;k<L;k+=2.2){ const w=3.4-1.6*k/L, q=d(k), o=Math.sin(k*0.9)*0.8; p.F(M.acid[2]); p.ell(q.x,q.y+o,w+1.2,w+0.6,a); p.F(M.acid[1]); p.ell(q.x,q.y+o-0.4,w,w*0.7,a); p.F(M.acid[0]); p.rect(q.x-0.5,q.y+o-w*0.6,1,0.8); } } }
  }
  function drawBurst(p,M,sk,P){
    const g=sacGeom(sk,{sac:0.6,sacY:0}), b=P.burst, t=sk.throat;
    if(b===1){ // estouro: respingo em estrela
      const c={x:t.x+3,y:t.y+8};
      p.F(M.acid[2]); for(let k=0;k<9;k++){ const a=k/9*Math.PI*2+0.3, L=22+(k%3)*7; p.poly([[c.x+Math.cos(a-0.24)*9,c.y+Math.sin(a-0.24)*9],[c.x+Math.cos(a)*L,c.y+Math.sin(a)*L],[c.x+Math.cos(a+0.24)*9,c.y+Math.sin(a+0.24)*9]]); }
      p.F(M.acid[3]); p.circle(c,14); p.F(M.acid[1]); p.circle(c,12); p.F(M.acid[0]); p.circle(c,7); p.F(M.sacm[2]); [[-10,-6],[8,-9],[10,7],[-6,10]].forEach(([x,y])=>p.poly([[c.x+x,c.y+y],[c.x+x*1.5+2,c.y+y*1.5],[c.x+x*1.4,c.y+y*1.4+2]]));
      p.F(M.acid[1]); [[28,-14,2.4],[-20,-8,2.2],[14,22,2],[-12,20,1.8],[30,8,1.6]].forEach(([x,y,r])=>p.circle(P2(c.x+x,c.y+y),r));
      return; }
    // retalhos do papo murcho pendurados na garganta
    p.F(M.sacm[2]); p.poly([[t.x-4,t.y],[t.x+4,t.y],[t.x+3,t.y+5],[t.x+1,t.y+3],[t.x-1,t.y+6],[t.x-3,t.y+3]]);
    p.F(M.flesh[2]); p.circle(P2(t.x,t.y+1.6),1.6);
    // poça no chão
    const w=Math.min(1,(b-1)/3), cx=t.x+2;
    p.F(M.acid[3]); p.ell(cx,GROUND-0.4,8+w*18,1.6+w*1.6);
    p.F(M.acid[2]); p.ell(cx+1,GROUND-0.8,6+w*14,1+w*1.2);
    p.F(M.acid[1]); p.ell(cx+3,GROUND-1.2,2+w*6,0.6+w*0.5);
    if(b<5){ p.F(M.acid[1]); [[-8,-6],[6,-10],[14,-4]].forEach(([x,y],k)=>p.circle(P2(cx+x*(1+w),GROUND+y*(1-w)-2),1.2)); }
  }

  const cache=PIX.cache();
  function frame(form,anim,fi,step=5,Pov,pk){
    const K=PIX.getK(), key=(pk!=null?'#'+pk+'|'+form:form+anim+fi+step)+'@'+K; if(cache.has(key)) return cache.get(key);
    const P=Pov||poseOf(anim,fi), M=mats(form), sk=skeleton(P), f=fi|0;
    const parts=[
      {back:true, draw:(c,u)=>drawArm(pen(c,u),M,sk.shB,sk.elB,sk.wrB,false,P.oF)},
      {back:true, draw:(c,u)=>drawLeg(pen(c,u),M,sk,sk.hipB,sk.kneeB,sk.ankleB,P.fB,false)},
      {draw:(c,u)=>drawTorso(pen(c,u),M,sk,P,form)},
      {draw:(c,u)=>drawLeg(pen(c,u),M,sk,sk.hipF,sk.kneeF,sk.ankleF,P.fF,true)},
      {draw:(c,u)=>drawHead(pen(c,u),M,sk,P,form)},
      {draw:(c,u)=>drawArm(pen(c,u),M,sk.shF,sk.elF,sk.wrF,true,P.oF)},
      {noShade:true, draw:(c,u)=>drawSac(pen(c,u),M,sk,P,form,f)},
      {draw:(c,u)=>drawJaw(pen(c,u),M,sk,P)},
    ];
    const cv=compose({FW:Math.round(FW*K),FH:Math.round(FH*K),GROUND:GROUND*K,parts,M,step,flash:P.flash,rim:RIM[form]}); if(step>=4) heavyOutline(cv);
    const sc=q=>({x:q.x*K,y:q.y*K}), g=sacGeom(sk,P); cv._sac=sc(g.c); cv._mouth=sc(sk.mouth); cv._eye=sc(sk.eye); cv._sacR=g.rx*K;
    cache.set(key,cv); return cv;
  }
  return {FW,FH,GROUND,AX,ANIMS,NAMES,RIM,mats,poseOf,frame,framePose:function(form,anim,P,key){ if(cache.size>1400) cache.delete(cache.keys().next().value); return frame(form,anim,0,5,P,key); }};
})();
