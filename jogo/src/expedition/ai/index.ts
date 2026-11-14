// IA de zumbis: parte comum (morte, ar, derrubada, atordoamento, dano) + comportamento por tipo (registro).
// Zumbi novo = arquivo novo aqui + entrada em REGISTRY + data/zombies.ts.
import type { ZombieDef } from '../../data/zombies';
import { clampY, setAnim, stepAnim, targetOf, type Fighter, type World, type Zombie } from '../world';
import { killZ, knock, bloodOf, damageZ } from '../combat';
import { releaseZ, thrownHits } from '../moveset';
import { spawnFx, animFrac } from '../world';
import { errante } from './errante';
import { tacticalChase, onHurtEnd } from './tactics';
import { rastejante } from './rastejante';
import { corredor } from './corredor';
import { cuspidor } from './cuspidor';
import { brutamonte } from './brutamonte';
import { acougueiro } from './acougueiro';
import { gritador } from './gritador';
import { barrigudo } from './barrigudo';
import { saltador } from './saltador';
import { chorona } from './chorona';
import { meianoite } from './meianoite';
import { estalador } from './estalador';
import { blindado } from './blindado';

import { estivador } from './estivador';
import { ascensorista } from './ascensorista';
import { vendedorfitas } from './vendedorfitas';
import { erveira } from './erveira';
import { percussionista, hasteK } from './percussionista';
import { barqueiro } from './barqueiro';
import { malandro } from './malandro';
import { passista } from './passista';
import { maquinista } from './maquinista';
import { cobragrande } from './cobragrande';
import { reijacare } from './reijacare';
import { garcom } from './garcom';
import { tamandua } from './tamandua';
import { seresteiro } from './seresteiro';
import { frevista } from './frevista';
import { acaizeiro } from './acaizeiro';
import { onca } from './onca';
import { turista } from './turista';
import { baiana } from './baiana';
import { peixeiro } from './peixeiro';
import { grafiteiro } from './grafiteiro';
import { seringueiro } from './seringueiro';
import { garimpeiro } from './garimpeiro';
import { bugio } from './bugio';
import { piranha } from './piranha';
import { peao } from './peao';
import { tuiuiu } from './tuiuiu';
import { queixada } from './queixada';
import { ariranha } from './ariranha';
export interface ZCtx {
  w: World; z: Zombie; dt: number; V: Fighter;
  dx: number; adx: number; dy: number;
  /** avança a animação (com eventos de quadro do comportamento) */
  step(withFrames?: boolean): void;
  /** persegue o alvo com velocidade e distância de parada */
  chase(spd: number, stop: number): void;
}

export interface ZombieAI {
  /** estado padrão ao levantar / sair do dano */
  rest: string;
  update(c: ZCtx): void;
  onFrame?(c: ZCtx, fi: number): void;
  /** como entra na arena */
  spawn?(w: World, i: number, fromLeft: boolean): { x: number; y: number; face: 1 | -1; state: string; anim: string };
}

export const REGISTRY: Record<string, ZombieAI> = { errante, rastejante, corredor, cuspidor, brutamonte, acougueiro, gritador, barrigudo, saltador, chorona, meianoite, estalador, blindado, estivador, ascensorista, vendedorfitas, erveira, percussionista, barqueiro, malandro, passista, maquinista, turista, baiana, peixeiro, grafiteiro, seringueiro, garimpeiro, bugio, piranha, peao, tuiuiu, queixada, ariranha, onca, acaizeiro, frevista, seresteiro, tamandua, garcom, reijacare, cobragrande };

export function aiOf(K: ZombieDef): ZombieAI {
  return REGISTRY[K.ai] ?? errante;
}

export function updateZombie(w: World, z: Zombie, dt: number): void {
  if (z.dead) {
    z.deadT += dt;
    if (z.anim === 'death') { stepAnim(z, z.K.F.ANIMS.death, dt); if (z.done && z.deathEnd == null) z.deathEnd = z.deadT; }
    if (z.dv) { z.x += z.dv * dt; z.dv *= Math.pow(0.02, dt); }
    if (z.z > 0) { z.vzD = (z.vzD || 0) - 420 * dt; z.z = Math.max(0, z.z + z.vzD * dt); }
    return;
  }
  if (z.state === 'grabbed') { // nas mãos de um lutador: só esperneia (posição vem de moveset.updateHeld)
    const g = z.grabbedBy as Fighter | null;
    if (!g || g.held !== z || g.down) { releaseZ(z); return; }
    stepAnim(z, z.K.F.ANIMS[z.anim], dt);
    return;
  }
  if (z.air) {
    const a = z.air;
    z.z += a.vz * dt; a.vz -= 420 * dt; z.x += a.vx * dt; a.spin += dt;
    if (z.K.F.ANIMS.tumble) { if (z.anim !== 'tumble') setAnim(z, 'tumble'); stepAnim(z, z.K.F.ANIMS.tumble, dt); } // voando: esperneia girando
    thrownHits(w, z); // arremessado: derruba quem estiver no caminho
    z.x = Math.max(w.cam + 16, Math.min(w.cam + w.W - 16, z.x));
    if (z.z <= 0 && a.vz < 0) {
      z.z = 0;
      if (Math.abs(a.vz) > 120 && !a.bounced) { a.vz = -a.vz * 0.3; a.bounced = true; w.shake = Math.max(w.shake, a.thrown ? 0.14 : 0.06); w.A.GORE.stain(z.x, z.y, 6, bloodOf(w, z)); spawnFx(w, 'dust', z.x, z.y, (Math.sign(a.vx) || 1) as 1 | -1); }
      else {
        const th = a as any; z.air = null; z.z = 0;
        if (th.thrown && th.dmg && z.hp > 0) damageZ(w, z, th.dmg * 0.6, 3, th.by); // arremessado: o chão também bate
        if (z.dead) return;
        if (z.hp <= 0) killZ(w, z); else knock(w, z, Math.sign(a.vx) || 1);
      }
    }
    return;
  }
  const AI = aiOf(z.K), A = z.K.F.ANIMS;
  const V = targetOf(w, z, dt);
  if (!V) { setAnim(z, 'idle'); stepAnim(z, A[z.anim], dt); return; }
  const dx = V.x - z.x, dy = V.y - z.y;
  const hk = hasteK(w, z, dt); // ritmo do Percussionista: anda e recarrega mais rápido
  const c: ZCtx = {
    w, z, dt, V, dx, adx: Math.abs(dx), dy,
    step: (withFrames) => stepAnim(z, A[z.anim], dt, withFrames && AI.onFrame ? (_e, fi) => AI.onFrame!(c, fi) : undefined),
    // perseguição tática (cerco, revezamento, contorno, separação) — ver tactics.ts
    chase: (spd, stop) => tacticalChase(w, z, V, dt, spd * hk, stop, () => c.step()),
  };
  if (z.state === 'boom') { c.step(true); if (z.done) { z.dead = true; z.deadT = 0.6; } return; }
  if (z.state === 'down') {
    const d = z.down!;
    d.t += dt;
    if (d.t < 0.3) z.x += d.dir * 70 * dt;
    z.x = Math.max(w.cam + 20, Math.min(w.cam + w.W - 20, z.x));
    if (z.anim === 'fall') stepAnim(z, A.fall, dt);
    if (d.t >= 1.15 && A.getup && z.anim !== 'getup') setAnim(z, 'getup');
    if (z.anim === 'getup') stepAnim(z, A.getup, dt);
    if (d.t >= 1.55 && (!A.getup || z.done)) { z.down = null; z.state = AI.rest; setAnim(z, 'walk'); w.fx('tag', 'LEVANTOU', z.x, z.y - z.K.top * 0.5 - 8); }
    return;
  }
  if (!z.boss) { if (z.x > w.cam + w.W - 14) z.x -= 40 * dt; if (z.x < w.cam + 14) z.x += 40 * dt; }
  if (z.stun > 0 && z.state !== 'hurt') { z.stun -= dt; z.anim = 'hurt'; z.fi = Math.min(2, A.hurt.n - 1); return; }
  if (z.state === 'hurt') {
    c.step();
    if (z.done) {
      onHurtEnd(z);
      z.state = z.prev && !['hurt', 'attack', 'miss', 'leap', 'burp', 'claw', 'wail', 'dash', 'summon', 'stomp', 'spin', 'clock', 'berrante', 'laco', 'howl', 'throw', 'open', 'perch', 'maul', 'stuck', 'vanish', 'hidden', 'appear', 'dive', 'sub', 'coil', 'gaze'].includes(z.prev) ? z.prev : AI.rest;
      setAnim(z, (z.kind === 'rastejante' && z.state === 'dead') || z.state === 'wander' ? 'idle' : 'walk');
    }
    return;
  }
  z.cd = Math.max(0, z.cd - dt * hk);
  AI.update(c);
  if (z.state === 'attack' && !z.air) { const AA = A[z.anim]; z.z = AA?.z ? w.A.TWEEN.track(AA.z, z.fi, animFrac(z, AA), 0) : 0; } // golpes com pulo
}
