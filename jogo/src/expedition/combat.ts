// Dano, derrubada, morte e criação de zumbis (compartilhado por lutadores e IA).
import type { ZombieId } from '../data/zombies';
import { LOOT_TO_RES } from '../data/resources';
import { zMult, PRIMEIRA_FACIL } from '../data/balance';
import { arenaDrop, dropItem } from './pickups';
import { settings } from '../core/settings';
import { FMUL, clampY, rnd, setAnim, spawnFx, type Fighter, type Form, type World, type Zombie } from './world';

/** Multiplicador de vida dos zumbis comuns (dificuldade base). */
export const ZHP = 1.0;

export function formFor(w: World, k: ZombieId): Form {
  if (w.zk[k]!.boss) return 'normal';
  if (w.mode !== 'lua') return 'comum';
  // Lua de Sangue (LUA-08): comum 30% · enluarado 45% · plenilunar 25%
  const r = rnd();
  return r < 0.45 ? 'enluarado' : r < 0.7 ? 'plenilunar' : 'comum';
}

export function mkZ(w: World, k: ZombieId, x: number, y: number, face: 1 | -1, state: string, anim = 'idle'): Zombie {
  const K = w.zk[k]!, form = formFor(w, k), fm = FMUL[form], boss = !!K.boss;
  // dificuldade pelo MAPA e pela ARENA (data/balance.ts), não pelos dias corridos
  const em = zMult(w.cfg.mapId, w.ai, K.boss);
  const fac = w.cfg.primeira ? PRIMEIRA_FACIL : 1;
  const hp = K.hp * fm.hp * (boss ? 1 : ZHP) * em.hp * fac;
  const z: Zombie = {
    uid: ++w.uid, kind: k, K, form, x, y: clampY(y), z: 0, face, hp, maxhp: hp, dmgMul: fm.dmg * em.dmg * fac, state, anim, fi: 0, acc: 0, done: false,
    cd: 1, stun: 0, poise: 0, dead: false, deadT: 0, down: null, air: null, react: null, flash: 0, boss, tg: null, tgT: 0,
  };
  w.zs.push(z);
  return z;
}

export function bloodOf(w: World, z: Zombie): string[] {
  return z._bc || (z._bc = w.A.GORE.color(z.K.F, z.form, z.kind === 'cuspidor' ? 'cu' : z.kind));
}
export function bleed(w: World, z: Zombie, dir: number, power: number): void {
  if (settings.q.gore) w.A.GORE.hit(z.x, z.y, z.y - (z.z || 0) - z.K.top * 0.62, dir, power, bloodOf(w, z), z.y < 162, w.BASE);
}
export function burst(w: World, z: Zombie): void {
  if (settings.q.gore) w.A.GORE.burst(z.x, z.y, z.y - (z.z || 0) - z.K.top * 0.5, bloodOf(w, z), z.deathK === 'apart' || z.boss);
}

export function launch(z: Zombie, dir: number, v: number): void {
  if (z.boss || z.kind === 'rastejante' || z.dead) return;
  z.air = { vz: v, vx: dir * 26, spin: z.air ? z.air.spin : 0 };
  z.z = z.z || 0; z.state = 'air'; z.down = null; z.stun = 0; z.anim = 'hurt';
  z.fi = Math.min(2, (z.K.F.ANIMS.hurt.n || 3) - 1); z.acc = 0;
}

export function knock(w: World, z: Zombie, dir: number): void {
  bleed(w, z, dir, 1);
  z.down = { t: 0, dir }; z.state = 'down'; z.stun = 0; z.poise = 0;
  spawnFx(w, 'dust', z.x + dir * 6, z.y, dir > 0 ? 1 : -1);
  if (z.K.F.ANIMS.fall) setAnim(z, 'fall'); // arte nova: derrubada animada (sem girar o sprite)
  else { z.anim = 'hurt'; z.fi = Math.min(2, (z.K.F.ANIMS.hurt.n || 3) - 1); }
  w.shake = Math.max(w.shake, 0.12);
}

function addLoot(w: World, item: string, n = 1): string {
  const r = LOOT_TO_RES[item] ?? 'sucata';
  w.bag[r] = (w.bag[r] ?? 0) + n;
  return r;
}

export function killZ(w: World, z: Zombie, by?: Fighter | null): void {
  z.hp = 0;
  w.kills++;
  w.killsBy[z.kind] = (w.killsBy[z.kind] ?? 0) + 1;
  { const kf = (w.killsForm ??= {}); const forms = z.boss ? (z.fury ? ['normal', 'furia'] : ['normal']) : [z.form]; for (const f of forms) kf[z.kind + ':' + f] = (kf[z.kind + ':' + f] ?? 0) + 1; }
  z.deathK = z.boss ? 'back' : ['back', 'face', 'apart', 'back', 'face'][Math.floor(rnd() * 5)];
  z.deathDir = Math.sign(z.x - (by?.x ?? z.x - 1)) || 1;
  z.dv = z.deathK === 'apart' ? 0 : z.deathDir * 34;
  z.air = null;
  burst(w, z);
  // drop
  for (const [res, p] of Object.entries(z.K.drop ?? {})) if (rnd() < (p ?? 0)) { const q = p! >= 1 ? Math.round(p!) : 1; addLoot(w, res, q); dropItem(w, LOOT_TO_RES[res] ?? res, q, z.x, z.y); }
  arenaDrop(w, z.x, z.y);
  if (z.kind === 'barrigudo') { z.state = 'boom'; setAnim(z, 'explode'); return; }
  z.dead = true; z.deadT = 0;
  if (z.K.F.ANIMS.death && z.deathK !== 'apart') setAnim(z, 'death');
  w.log(`${z.K.nome} abatido`);
  if (z === w.boss) {
    w.boss = null;
    if (z.K.boss === 'mini') {
      w.miniBoss = true;
      w.banner('MINI BOSS DERROTADO', 2);
      w.log(`${z.K.nome} derrubado! +1 chave militar`);
      w.keys.militar = (w.keys.militar ?? 0) + 1;
      for (const [r, v] of Object.entries(w.map.loot.miniBoss)) { w.bag[r as keyof typeof w.bag] = (w.bag[r as keyof typeof w.bag] ?? 0) + (v ?? 0); dropItem(w, r, v ?? 1, z.x, z.y, 2); }
      dropItem(w, 'chave', 1, z.x, z.y, 2);
    } else {
      w.chefe = true;
      w.phase = 'victory'; w.phaseT = 6;
      w.banner('EXPEDIÇÃO CONCLUÍDA', 6);
      w.log(`${z.K.nome} caiu. EXPEDIÇÃO CONCLUÍDA!`);
    }
  }
}

/** Defesa por tipo (ex.: escudo do Blindado): devolve o dano que passa ou null se o golpe foi todo absorvido. */
export type Guard = (w: World, z: Zombie, dmg: number, n: number, by?: Fighter | null) => number | null;
export const GUARDS: Partial<Record<ZombieId, Guard>> = {};

export function damageZ(w: World, z: Zombie, dmg: number, n: number, by?: Fighter | null): void {
  if (z.dead) return;
  const guard = GUARDS[z.kind];
  if (guard) { const r = guard(w, z, dmg, n, by); if (r == null) return; dmg = r; }
  const boss = z.boss;
  if (boss && z.state === 'dazed') dmg *= 1.6;
  if (boss && z.vuln) dmg *= 1.5;
  dmg = Math.max(1, Math.round(dmg));
  z.hp -= dmg;
  const dir = Math.sign(z.x - (by?.x ?? z.x - 1)) || 1;
  w.fx('dmg' + (n === 3 ? ' big' : ''), String(dmg), z.x, z.y - (z.z || 0) - z.K.top - 6);
  { // estrela de impacto no ponto do golpe (metade da altura do zumbi, voltada pra quem bateu)
    const hx = z.x - dir * Math.min(10, z.K.w * 0.25), hy = z.y - (z.z || 0) - z.K.top * 0.28;
    spawnFx(w, n === 3 ? 'impactBig' : 'impact', hx, hy, dir > 0 ? 1 : -1, undefined, n === 3 ? 20 : 26);
    if (boss || by?.fam === 'bastao' && by.tier !== 'comum') spawnFx(w, 'hitspark', hx, hy, dir > 0 ? 1 : -1);
  }
  bleed(w, z, dir, n === 3 ? 1.4 : 0.7);
  if (z.kind === 'rastejante' && z.state === 'dead') z.state = 'crawl';
  if (z.hp <= 0) { killZ(w, z, by); return; }
  if (z.air) return;
  if (z.state === 'grabbed') { z.flash = 0.035; return; } // agarrado: só pisca (quem segura decide)
  if (boss) {
    z.flash = 0.035;
    if (z.hp < z.maxhp * 0.5 && !z.fury) {
      z.fury = true; z.form = 'furia';
      if (z.K.F.ANIMS.rage) { z.state = 'rage'; setAnim(z, 'rage'); }
      w.banner('FÚRIA!', 1.4, 'furia');
      w.log(z.K.nome + ' entrou em FÚRIA');
      w.shake = 0.3;
    }
    return;
  }
  z.poise += dmg;
  if ((n === 3 && z.poise >= z.maxhp * 0.35) || z.poise >= z.maxhp * 0.6) knock(w, z, dir);
  else if (n === 3 || z.state === 'miss') {
    if (z.state !== 'hurt') z.prev = z.state;
    z.state = 'hurt'; setAnim(z, z.K.F.ANIMS.hurtB && rnd() < 0.5 ? 'hurtB' : 'hurt');
    z.react = { k: ['back', 'gut', 'spin'][Math.floor(rnd() * 3)], t: 0, dur: 0.38 };
    if (n === 3) z.stun = Math.max(z.stun, { comum: 0.3, incomum: 0.3, raro: 0.6, lunar: 0.8 }[(by?.tier ?? 'comum') as 'comum'] ?? 0.3);
  } else {
    z.flash = 0.035;
    z.react = { k: rnd() < 0.5 ? 'twitch' : 'back', t: 0, dur: 0.18 };
  }
}
