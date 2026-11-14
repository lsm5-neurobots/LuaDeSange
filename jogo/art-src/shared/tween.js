/* TWEEN — fonte de arte (editável). Build: npm run art */
const TWEEN=(function(){
  const DISCRETE={inhand:1,mouth:1,brow:1,smear:1,flash:1,whistle:1,impact:1,spit:1,air:1};
  const ease=t=>t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2;           // ease-in-out quad
  function lerpVal(a,b,t,k){
    if(typeof a==='number' && typeof b==='number') return DISCRETE[k]?(t<0.5?a:b):a+(b-a)*t;
    if(a && b && typeof a==='object' && typeof b==='object'){ const o={}; for(const kk in a) o[kk]=lerpVal(a[kk],b[kk]!==undefined?b[kk]:a[kk],t,kk); return o; }
    return t<0.5?a:(b===undefined?a:b);
  }
  function lerpPose(a,b,t){ const o={}; for(const k in a) o[k]=lerpVal(a[k],b[k]!==undefined?b[k]:a[k],t,k); for(const k in b) if(!(k in o)) o[k]=b[k]; return o; }
  // F: factory com poseOf/ANIMS; fi: quadro atual; frac 0..1 dentro do quadro; loop: volta pro 0 no fim
  function poseAt(F,anim,fi,frac,loop){
    const A=F.ANIMS[anim]; if(!A) return F.poseOf(anim,fi);
    const n=A.n, j=fi+1<n?fi+1:(loop?0:fi);
    const a=F.poseOf(anim,fi); if(j===fi||frac<=0) return a;
    return lerpPose(a,F.poseOf(anim,j),ease(Math.min(1,frac)));
  }
  // valor de trilha por quadro (z, giro, squash) interpolado
  function track(arr,fi,frac,def){ if(!arr) return def; const a=arr[Math.min(fi,arr.length-1)], b=arr[Math.min(fi+1,arr.length-1)]; return a+(b-a)*ease(Math.min(1,frac)); }
  // cache LRU simples
  function lru(max){ const m=new Map(); return { get(k){ const v=m.get(k); if(v!==undefined){ m.delete(k); m.set(k,v); } return v; }, set(k,v){ m.set(k,v); if(m.size>max) m.delete(m.keys().next().value); }, size:()=>m.size }; }
  const Q=4; const quant=f=>Math.floor(f*Q)/Q;                   // 4 sub-quadros por quadro
  return {ease,lerpPose,poseAt,track,lru,quant,Q};
})();

/* ===== GORE: sangue em partículas pixel, decalques no chão e na parede ===== */
