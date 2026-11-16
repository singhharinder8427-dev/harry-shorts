/* "What if today was Earth's last day?" - harry-animator v3.
 * Flat 2D cel cast (Blob the scientist, a corrupt boss, a thief, a beachgoer, a dinosaur) in stylized 3D sets:
 * a city street, the boss's office, deep space, a ruler track, an impact cross-section, a coast, a prehistoric valley,
 * an observatory, the DART asteroids and a split "why" stage. Telemetry counts the rock down. */
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import * as THREE from 'three';
import timing from './timing.json';
import {Captions, SafeGuides} from './Captions';
import {Person, PersonPose} from './Cast';
import {Cta, Tag} from './Cta';
import {BLOB, costume, role} from './Roles';
import {act, EXPR, Pose, walk} from './Poses';
import {Ball, Box, Cam3, Cam3Key, Cel, Cuts, Cyl, Instances, V3, World, cam3At, celPoint, toScreen} from './World3D';
import {EASE, Mood, ShotBlur, Transition} from './Moves';
import {BigNumber, cardIn} from './Cards';
import {Bullet, CASH, City, Coast, Craft, CrossSection, DUR, Desk, Earth, FRONT_X, LT, Moon, Observatory, Office, Prehist, Rock, SHOP_Z, SKIES, Stage, Stars, Track, loopS, mixLight, mixSky} from './Sets';
import {Sparkle} from './Bits';
import {INK, mix} from './color';
import {bump, clamp, kfs, lerp, pop, prog, rnd, smooth, spring} from './math';
import {ThumbFrame, Ring, Arrow} from './ThumbKit';

const T = timing as any; const K = T.keys as Record<string, number>; const CHK = T.chunks as {start: number; end: number}[];
export const DURATION = T.duration as number; const END = DURATION;
const CH = (i: number) => CHK[i].start - 0.15;            // cut just before a caption phrase starts

// ---------------------------------------------------------------- cast (fixed for the whole video)
const SCI = costume('scientist');
const BOSS = {...role('boss', 'lastday').outfit, sunglasses: false};
const THIEF = role('thief', 'lastday').outfit;
const BEACH = {...role('friend', 'lastday').outfit, hat: 'cap' as const, hatColor: '#F2994A'};
type PP = Omit<PersonPose, 'id' | 'outfit'>;
const Blob: React.FC<PP> = (p) => <Person {...p} id="blob" outfit={SCI} />;
const Boss: React.FC<PP> = (p) => <Person {...p} id="boss" outfit={BOSS} />;
const Thief: React.FC<PP> = (p) => <Person {...p} id="thief" outfit={THIEF} />;
const Beach: React.FC<PP> = (p) => <Person {...p} id="beach" outfit={BEACH} />;
const BOSS_H = 1.7 * 1.05, THIEF_H = 1.7 * 0.98;
const IDLE_N = Math.max(1, Math.round(DUR / 2.2));
const idle = (p: Pose, t: number, ph = 0, amt = 1): Pose => ({...p, bounce: (p.bounce ?? 0) + 2.5 * amt * loopS(t, IDLE_N, ph), headTilt: (p.headTilt ?? 0) + 1.5 * amt * loopS(t, Math.max(1, Math.round(IDLE_N / 2)), ph + 0.3)});
const UP: Pose = {lookY: -12, faceDy: -12};
const SIT: Pose = {bounce: -104, footL: [-86, -5], footR: [86, -5], handL: [-96, -44], handR: [96, -44]};

// ---------------------------------------------------------------- cuts (each just before its phrase)
const C = {money: CH(1), robs: CH(2), story: CH(3), rock: CH(5), falls: CH(7), kmps: CH(8), race: CH(9), moon: CH(11), buy: CH(13), run: CH(15), neither: CH(16),
  impact: CH(17), dust: CH(20), waves: CH(22), dino: CH(25), lab: CH(26), dart: CH(28), orbit: CH(31), why: CH(33), fin: CH(36), loop: END - 0.75};

// ---------------------------------------------------------------- telemetry: distance + time to impact (story clock, 12 km/s)
const SPEED = 12;                                           // km per second (the dinosaur impactor: about 12 km/s or more)
const DIST_KEYS: [number, number][] = [[K.rock + 0.6, 2000000], [K.moon, 384400], [K.helps + 0.4, 1800], [C.impact, 900]];
const distAt = (t: number) => { const ks = DIST_KEYS; if (t <= ks[0][0]) return ks[0][1];
  for (let i = 0; i < ks.length - 1; i++) { const [a, va] = ks[i], [b, vb] = ks[i + 1]; if (t <= b) { const u = (t - a) / (b - a); return Math.exp(lerp(Math.log(va), Math.log(vb), u)); } }
  return ks[ks.length - 1][1]; };
const hms = (s: number) => { s = Math.max(0, Math.round(s)); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`; };
const MOON_KM = 384400;
const Telemetry: React.FC<{t: number; km: number; s: number; alarm?: boolean}> = ({t, km, s, alarm = false}) => {
  if (s <= 0.001) return null;
  const nearMoon = Math.abs(km - MOON_KM) < 6000;
  const label = nearMoon ? MOON_KM : km;
  const blink = alarm ? (Math.sin(t * Math.PI * 6) > 0 ? 1 : 0.35) : 1;
  const F = {fontFamily: 'Inter, sans-serif', fontWeight: 900} as const;
  return (<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
    <g transform={`translate(540 345) scale(${s}) translate(-330 -105)`}>
      <rect x={8} y={10} width={660} height={210} rx={28} fill="#000" opacity={0.3} />
      <rect width={660} height={210} rx={28} fill="#0B1024" opacity={0.86} stroke={mix('#FF4A3A', '#FFB0A0', 1 - blink)} strokeWidth={6} />
      <circle cx={44} cy={44} r={11} fill="#FF4A3A" opacity={blink} />
      <text x={66} y={56} {...F} fontSize={30} fill="#FF8A7A" letterSpacing={3}>DISTANCE TO IMPACT</text>
      <text x={34} y={140} {...F} fontSize={86} fill="#FFFFFF">{Math.round(label).toLocaleString('en-US')} <tspan fontSize={50} fill="#FFD23F">KM</tspan></text>
      <text x={36} y={190} {...F} fontSize={30} fill="#9FB0E0" letterSpacing={2}>TIME TO IMPACT  <tspan fill="#FFFFFF">{hms((nearMoon ? MOON_KM : km) / SPEED)}</tspan></text>
    </g>
  </svg>);
};

// ---------------------------------------------------------------- shared props
const Bills: React.FC<{from: V3; to: V3; t: number; t0: number; n?: number; dur?: number}> = ({from, to, t, t0, n = 14, dur = 1.6}) => {
  const items = Array.from({length: n}, (_, i) => { const u = prog(t, t0 + i * 0.07, t0 + i * 0.07 + dur); if (u <= 0 || u >= 1) return null;
    return {p: [lerp(from[0], to[0], u) + 0.35 * Math.sin(u * 7 + i), lerp(from[1], to[1], u) + 0.6 * Math.sin(Math.PI * u) + (rnd(i) - 0.5) * 0.5 * u, lerp(from[2], to[2], u) + (rnd(i + 3) - 0.5) * u] as V3,
      r: [u * 9 + i, u * 5, u * 7 + i] as V3, s: [1.2, 1, 1.2] as V3}; }).filter(Boolean) as {p: V3; r: V3; s: V3}[];
  return items.length ? <Instances k={'bills' + n} geo={() => new THREE.BoxGeometry(0.16, 0.004, 0.08)} items={items} color="#7CC870" rough={0.9} cast={false} /> : null;
};
const Coins: React.FC<{at: V3; t: number; t0: number}> = ({at, t, t0}) => {
  const items = Array.from({length: 12}, (_, i) => { const u = prog(t, t0 + i * 0.03, t0 + i * 0.03 + 0.7); if (u <= 0) return null; const a = rnd(i) * Math.PI * 2, v = 0.6 + rnd(i * 3);
    const y = Math.max(0.02, at[1] + 2.2 * u * v * 0.6 - 4.9 * u * u * 0.5); return {p: [at[0] + Math.cos(a) * 0.5 * u, y, at[2] + Math.sin(a) * 0.4 * u] as V3, r: [u * 10, i, 0] as V3}; }).filter(Boolean) as {p: V3; r: V3}[];
  return items.length ? <Instances k="coins" geo={() => new THREE.CylinderGeometry(0.035, 0.035, 0.008, 14)} items={items} color="#F2C230" rough={0.35} metal={0.6} cast={false} /> : null;
};
/** a flat green dinosaur cel (feet at 0,0; about 400 units tall). shock 0..1 = jaw drop + wide eyes */
const Dino: React.FC<{shock: number; look?: number}> = ({shock, look = 0}) => {
  const ow = 9, G = '#7CC86A';
  return (<g>
    <path d="M -150 -150 C -260 -150 -330 -110 -380 -60 C -310 -95 -250 -100 -160 -95 Z" fill={G} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
    {[-90, -40, 40, 90].map((x, i) => <path key={i} d={`M ${x} -110 L ${x + (i % 2 ? 6 : -6)} -6`} stroke={INK} strokeWidth={ow * 2.6} strokeLinecap="round" />)}
    {[-90, -40, 40, 90].map((x, i) => <path key={'g' + i} d={`M ${x} -110 L ${x + (i % 2 ? 6 : -6)} -6`} stroke={G} strokeWidth={ow * 1.4} strokeLinecap="round" />)}
    <ellipse cx={0} cy={-150} rx={170} ry={90} fill={G} stroke={INK} strokeWidth={ow} />
    <path d="M 110 -190 C 150 -260 150 -330 140 -380 L 200 -380 C 210 -320 200 -240 170 -160 Z" fill={G} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
    <g transform={`translate(170 -400) rotate(${-12 * look})`}>
      <ellipse cx={20} cy={0} rx={78} ry={52} fill={G} stroke={INK} strokeWidth={ow} />
      <ellipse cx={34} cy={-14} rx={shock > 0.5 ? 13 : 10} ry={shock > 0.5 ? 19 : 15} fill={INK} key={shock > 0.5 ? 'w' : 'd'} />
      <path d={`M 10 -42 Q 34 ${-52 - 10 * shock} 56 -42`} stroke={INK} strokeWidth={ow * 1.1} fill="none" strokeLinecap="round" />
      {shock > 0.5 ? <ellipse key="o" cx={70} cy={22} rx={14} ry={18} fill={INK} /> : <path key="s" d="M 50 22 Q 70 32 90 18" stroke={INK} strokeWidth={ow} fill="none" strokeLinecap="round" />}
    </g>
    {[-60, 0, 60].map((x) => <circle key={x} cx={x} cy={-190} r={14} fill="#5AA84A" />)}
  </g>);
};

// ---------------------------------------------------------------- HOOK (frame 0 and the last frame): the doomed street
const ROCK_SKY: V3 = [0.4, 11, -46];
const HOOK0: Cam3 = {pos: [0, 1.2, 6.4], look: [0, 2.6, -20], fov: 46};
const HOOK1: Cam3 = {pos: [0, 1.6, 9.0], look: [0, 3.0, -20], fov: 50};
const Hook: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[0, HOOK0], [0.15, HOOK0], [C.money, HOOK1]]);
  return (<World cam={cam} light={{...LT.doom, focus: [0, 0, -2]}} sky={SKIES.doom} scene={<><City t={t} mode="doom" fires={1} /><Rock pos={ROCK_SKY} r={10} heat={1} trail={0.6} dir={[0.1, -0.4, 1]} /></>}>
    <Cel at={[-0.62, 0, 0]} h={BOSS_H}><Boss {...idle({...act(0, [[0, 'scared']], [[0, 'scared']])}, t, 0.1, 0.6)} lookX={-6} /></Cel>
    <Cel at={[0.62, 0, 0.2]} h={THIEF_H}><Thief {...idle({...act(0, [[0, 'handsOnHead']], [[0, 'shocked']]), tint: '#BFE6FF', tintAmt: 0.5}, t, 0.4, 0.6)} lookX={6} /></Cel>
  </World>);
};

// ---------------------------------------------------------------- 1. the boss counts stolen money
const BOSS_DESK: V3 = [0, 0, -0.3];
const MoneyShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.money, {pos: [0.2, 1.55, 5.6], look: [0, 1.15, -0.6], fov: 32}], [C.robs, {pos: [0.15, 1.5, 4.9], look: [0, 1.15, -0.6], fov: 32}]]);
  const cash = 0.35 + 0.65 * smooth(prog(t, K.counts - 0.1, K.money + 0.2));
  const count = Math.sin((t - C.money) * 14);
  const fan = t > K.money - 0.1;
  return (<World cam={cam} light={LT.office} sky={['#0E1430', '#2A3060']} scene={<Office t={t} />} front={<Desk cash={cash} />}>
    <Cel at={BOSS_DESK} h={BOSS_H}><Boss {...act(t, [[0, 'holdFront'], [K.money - 0.1, 'shrug']], [[0, 'smug'], [K.money - 0.1, 'grin']])} mouth={fan ? 'smile' : 'smirk'}
      handL={fan ? undefined : [-30, -150 + 6 * count]} handR={fan ? undefined : [40 + 10 * count, -158]} lookY={fan ? 0 : 10} faceDy={fan ? 0 : 8} /></Cel>
    <Bills from={[0, 1.15, -0.1]} to={[0, 1.9, -0.2]} t={t} t0={K.money - 0.05} n={10} dur={0.9} />
  </World>);
};

// ---------------------------------------------------------------- 2. the thief robs the street (dusk): he grabs the loot at the shop and runs down the sidewalk
const RobShot: React.FC<{t: number}> = ({t}) => {
  const u = smooth(prog(t, K.robs + 0.1, C.story)), z = lerp(SHOP_Z + 0.2, SHOP_Z - 3.2, u), x = FRONT_X - 1.0, running = u > 0.02 && u < 0.98;
  const cam = cam3At(t, [[C.robs, {pos: [2.0, 1.45, 5.4], look: [x + 0.15, 1.0, SHOP_Z - 0.3], fov: 38}], [C.story, {pos: [1.9, 1.5, 3.4], look: [x + 0.15, 1.0, SHOP_Z - 2.8], fov: 38}]]);
  const ph = 2 * Math.PI * (SHOP_Z + 0.2 - z) / (4 * 58 * THIEF_H / 430);
  const body = running ? walk(ph, {run: true, view: 'right'}) : act(t, [[0, 'reach'], [K.robs - 0.05, 'holdFront']], [[0, 'grin']]);
  return (<World cam={cam} light={{...LT.dusk, focus: [x, 0, SHOP_Z - 1]}} sky={SKIES.dusk} scene={<><City t={t} mode="dusk" /><Coins at={[x + 0.25, 0.7, SHOP_Z + 0.1]} t={t} t0={K.robs} /></>}>
    <Cel at={[x, 0, z]} h={THIEF_H}><Thief {...body} {...EXPR.grin} /></Cel>
  </World>);
};

// ---------------------------------------------------------------- 3. "in this story, God has seen enough": the sky over the city
const Clouds: React.FC<{t: number; dark: number}> = ({t, dark}) => {
  const items = Array.from({length: 40}, (_, i) => { const a = (i / 40) * Math.PI * 2 + 0.25 * t * 0.3, r = 7 + (i % 4) * 3.6;
    return {p: [ROCK_SKY[0] + Math.cos(a) * r, 20 + (i % 3) * 1.6 + rnd(i) * 1.5, -46 + Math.sin(a) * r * 0.5] as V3, s: 2.2 + rnd(i * 3) * 2.4, c: mix('#8A90A8', '#2A2838', dark * (0.6 + 0.4 * rnd(i)))}; });
  return <Instances k="clouds" geo={() => new THREE.SphereGeometry(1, 16, 12)} items={items} rough={1} cast={false} />;
};
const SkyShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.story, {pos: [0, 1.6, 6.5], look: [0, 1.8, -12], fov: 42}], [K.god - 0.1, {pos: [0, 2.0, 7.2], look: [0, 12, -40], fov: 44}], [C.rock, {pos: [0, 2.1, 7.4], look: [0.3, 14.5, -44], fov: 42}]]);
  const bolt = bump(t, K.enough - 0.05, K.enough + 0.35);
  const star = pop(t, K.enough + 0.05, 0.4);
  const beam = smooth(prog(t, K.god - 0.4, K.god + 0.3)) * (1 - smooth(prog(t, K.enough, K.enough + 0.4)));
  const L = mixLight(LT.night, {...LT.night, sunI: 4, sunColor: '#E8F0FF', ambI: 2.2}, bolt);
  const segs: V3[] = [[-1, 23, -40], [0.8, 18, -40], [-0.6, 13, -40], [1.5, 8, -40], [0.2, 3, -40]];
  return (<World cam={cam} light={L} sky={mixSky(SKIES.night, ['#3A3060', '#8A80C0'], bolt)} scene={<>
      <City t={t} mode="night" /><Clouds t={t} dark={0.6 + 0.4 * prog(t, K.god, K.enough)} /><Stars n={120} R={120} />
      {beam > 0.01 && <Cyl pos={[ROCK_SKY[0], 0, -46]} r={7} rTop={3} h={21} color="#FFE7A0" emissive="#FFD060" glow={1.4} opacity={0.22 * beam} cast={false} receive={false} />}
      {bolt > 0.05 && segs.slice(0, -1).map((a, i) => { const b = segs[i + 1], m: V3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, a[2]], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        return <Box key={i} pos={[m[0], m[1] - len / 2, m[2]]} size={[0.35, len, 0.35]} r={0} rot={[0, 0, Math.atan2(b[0] - a[0], -(b[1] - a[1])) * -1]} color="#FFFFFF" emissive="#C8E0FF" glow={3} cast={false} />; })}
      {star > 0 && <Rock pos={ROCK_SKY} r={1.2 * star} heat={1} seed={3} />}
    </>} />);
};

// ---------------------------------------------------------------- 4. the rock turns toward Earth (deep space)
const EARTH_FAR: V3 = [-1.5, -1, -46];
const TurnShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.rock, {pos: [0, 0.5, 13], look: [0, 0, 0], fov: 38}], [C.falls, {pos: [-0.8, 0.8, 11], look: [-0.4, 0, -4], fov: 36}]]);
  const tu = smooth(prog(t, K.turns - 0.3, K.turns + 0.6));
  const p: V3 = [lerp(1.5, 0.9, tu), lerp(2.2, -1.4, tu), lerp(3, 2.2, tu)];
  const wide = pop(t, K.wide - 0.1, 0.35);
  return (<World cam={cam} light={LT.space} sky={SKIES.space} scene={<>
      <Stars /><Earth pos={EARTH_FAR} R={7} spin={t * 0.05} />
      <Rock pos={p} r={1.25} rot={[0.3 + t * 0.15, 1.2 + tu * 2.2, 0.2]} color="#4E443E" />
      {/* honesty of scale: ten kilometres = a tiny ruler bar that pops beside the rock on "wide" */}
      {wide > 0 && <Box pos={[p[0] - 1.45, p[1] - 1.6, p[2]]} size={[2.9 * wide, 0.08, 0.08]} r={0.02} color="#FFD23F" emissive="#FFB020" glow={1} cast={false} />}
    </>} />);
};

// ---------------------------------------------------------------- 5. it falls (slam past the rock) + ten km every second + the bullet race
const STREAK_KEYS: Cam3Key[] = [[0, {pos: [0, 3, 34], look: [0, 0, 0], fov: 40}]];
const StreakShot: React.FC<{t: number}> = ({t}) => {
  const KEYS: Cam3Key[] = [[C.falls, {pos: [0.5, 3, 30], look: [0, 0, 0], fov: 40}], [K.falls - 0.05, {pos: [0.5, 3, 29], look: [0, 0, 0], fov: 40}],
    [K.falls + 0.4, {pos: [3.6, 1.6, 9.5], look: [0, 0, -1], fov: 36}, EASE.slam], [C.kmps, {pos: [3.4, 1.5, 8.6], look: [0, -0.2, -1.5], fov: 36}]];
  const cam = cam3At(t, KEYS);
  return (<ShotBlur t={t} cam={KEYS}><World cam={cam} light={LT.space} sky={SKIES.space} scene={<>
      <Stars /><Earth pos={[-3, -4, -70]} R={10} spin={t * 0.05} />
      <Rock pos={[0, 0, 0]} r={1.0} rot={[t * 0.6, t * 0.4, 0]} heat={0.15} trail={0.2} dir={[0.05, -0.05, -1]} />
    </>} /></ShotBlur>);
};
void STREAK_KEYS;
const KmpsShot: React.FC<{t: number}> = ({t}) => {
  const start = C.kmps + 0.25, rate = 1.6;                    // posts (one per "kilometre") passed per real second
  const x = -3 + Math.max(0, t - start) * rate * 2.2;
  const cam = cam3At(t, [[C.kmps, {pos: [-5.2, 1.6, 2.4], look: [1, 0.1, 0.3], fov: 38}], [C.race, {pos: [-4.4, 1.7, 2.4], look: [2, 0.1, 0.3], fov: 38}]]);
  return (<World cam={cam} light={LT.stage} sky={SKIES.stage} scene={<><Track /><Rock pos={[x, 0.35, 0]} r={0.3} rot={[t * 3, t * 2, 0]} heat={0.3} trail={0.5} dir={[1, 0, 0]} /></>} />);
};
const RaceShot: React.FC<{t: number}> = ({t}) => {
  const go = C.race + 0.35, u = prog(t, go, K.bullet + 0.2);
  const cam = cam3At(t, [[C.race, {pos: [-5.6, 2.6, 3.2], look: [2.5, 0, 0.5], fov: 40}], [C.moon, {pos: [-5.2, 2.5, 3.0], look: [3, 0, 0.5], fov: 40}]]);
  return (<World cam={cam} light={LT.stage} sky={SKIES.stage} scene={<><Track />
      <Rock pos={[-3 + 10 * u, 0.35, 0]} r={0.3} rot={[t * 3, t * 2, 0]} heat={0.3} trail={u > 0 && u < 1 ? 0.5 : 0} dir={[1, 0, 0]} />
      <Bullet pos={[-3 + 1 * u, 0.25, 1.2]} s={2.4} />
    </>} />);
};

// ---------------------------------------------------------------- 6. from the Moon's distance (diagonal: Moon near, Earth far)
const MOON_P: V3 = [-1.4, 1.9, 0], EARTH_P: V3 = [1.6, -4.2, -32];
const MoonShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.moon, {pos: [0.3, 0.3, 9.5], look: [0, -0.6, -6], fov: 44}], [C.buy, {pos: [0.2, 0.2, 8.8], look: [0, -0.7, -6], fov: 44}]]);
  const u = smooth(prog(t, K.moon - 0.2, C.buy + 0.4));
  const path = (k: number): V3 => [lerp(MOON_P[0] + 1.3, EARTH_P[0], k), lerp(MOON_P[1] - 0.9, EARTH_P[1] + 4, k), lerp(MOON_P[2], EARTH_P[2], k)];
  const draw = smooth(prog(t, K.moon, K.impact));
  const dots = Array.from({length: 22}, (_, i) => i / 21).filter((k) => k <= draw).map((k, i) => { const p = toScreen(cam, path(k)); return p ? <circle key={i} cx={p.x} cy={p.y} r={Math.max(3, p.s * 0.06)} fill="#FFD23F" stroke={INK} strokeWidth={3} /> : null; });
  const rp = path(u * 0.35);
  return (<World cam={cam} light={LT.space} sky={SKIES.space} scene={<><Stars /><Moon pos={MOON_P} R={1.5} /><Earth pos={EARTH_P} R={6} spin={t * 0.05} />
      <Rock pos={rp} r={0.55} rot={[t, t * 0.7, 0]} heat={0.2} trail={0.7} dir={[EARTH_P[0] - MOON_P[0], EARTH_P[1] - MOON_P[1], EARTH_P[2] - MOON_P[2]]} /></>}>
    {dots}
  </World>);
};

// ---------------------------------------------------------------- 7. the boss tries to buy his way out (office window, the rock outside)
const WIN_AT: V3 = [-0.2, 0, -1.55];
const BuyShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.buy, {pos: [2.6, 1.55, 3.9], look: [-0.2, 1.4, -2.2], fov: 36}], [C.run, {pos: [2.2, 1.55, 3.3], look: [-0.2, 1.45, -2.2], fov: 36}]]);
  const offer = t > K.buy - 0.15;
  const L = mixLight(LT.office, LT.doom, 0.55, {span: 6, focus: [0, 0, -1]});
  const hand = celPoint(cam, WIN_AT, BOSS_H, [-150, -215]);
  return (<World cam={cam} light={L} sky={['#2A0A10', '#C8402A']} scene={<><Office t={t} /><Box pos={[2.4, 0, 0.1]} size={[2.2, 0.8, 0.8]} r={0.04} color="#4A2E1E" />
      <Rock pos={[2.5, 1.5, -16]} r={2.6} heat={1} trail={0.5} dir={[0.2, -0.4, 1]} />
      <Bills from={hand} to={[hand[0] - 0.4, hand[1] + 1.4, -4.5]} t={t} t0={K.out - 0.2} n={16} dur={1.3} /></>}
    front={offer ? <group position={hand}><Box pos={[0, -0.18, 0]} size={[0.5, 0.34, 0.14]} r={0.03} color="#7A4A2A" rough={0.5} /><Box pos={[0, 0.16, -0.12]} rot={[-1.1, 0, 0]} size={[0.5, 0.34, 0.05]} r={0.02} color="#8C5A34" rough={0.5} /><Instances k="bcash" geo={CASH} items={[0, 1, 2, 3].map((i) => ({p: [-0.15 + i * 0.1, 0.0, 0.0] as V3, s: 1.2}))} color="#6FB66A" /></group> : undefined}>
    <Cel at={WIN_AT} h={BOSS_H}><Boss {...act(t, [[0, 'holdFront'], [K.buy - 0.15, 'reach']], [[0, 'scared'], [K.buy - 0.15, 'nervous'], [K.out + 0.3, 'scared']])} view={offer ? 'left' : 'front'}
      handR={offer ? [-150, -230] : [30, -150]} handL={offer ? [-100, -205] : [-30, -150]} /></Cel>
    {void 0}
  </World>);
};

// ---------------------------------------------------------------- 8. the thief tries to run (doom street, the rock down the street behind him)
const RunShot: React.FC<{t: number}> = ({t}) => {
  const u = prog(t, C.run, C.neither + 0.2), x = lerp(2.0, -1.8, u);
  const cam = cam3At(t, [[C.run, {pos: [0.3, 1.15, 5.6], look: [0, 3.2, -20], fov: 46}], [C.neither, {pos: [-0.2, 1.15, 5.2], look: [-0.3, 3.4, -20], fov: 46}]]);
  const ph = 2 * Math.PI * (2.0 - x) / (4 * 58 * THIEF_H / 430);
  return (<World cam={cam} light={{...LT.doom, focus: [0, 0, -2]}} sky={SKIES.doom} scene={<><City t={t} mode="doom" fires={0.8} /><Rock pos={[-1, 15, -46]} r={9} heat={1} trail={0.6} dir={[0.1, -0.4, 1]} /></>}>
    <Cel at={[x, 0, 0.6]} h={THIEF_H}><Thief {...walk(ph, {run: true, view: 'left'})} {...EXPR.scared} /></Cel>
  </World>);
};

// ---------------------------------------------------------------- 9. neither helps (both from behind, the rock fills the end of the street, its shadow falls)
const NeitherShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.neither, {pos: [0.2, 1.0, 6.2], look: [0, 4.2, -20], fov: 48}], [C.impact, {pos: [0.1, 0.9, 5.4], look: [0, 4.6, -20], fov: 48}]]);
  const shade = smooth(prog(t, K.helps - 0.2, K.helps + 0.4));
  const L = mixLight(LT.doom, {...LT.doom, sunI: 0.7, ambI: 0.6}, shade, {focus: [0, 0, -2]});
  const grow = 1 + 0.25 * smooth(prog(t, C.neither, C.impact));
  return (<World cam={cam} light={L} sky={mixSky(SKIES.doom, ['#14060A', '#7A2A1A'], shade)} scene={<><City t={t} mode="doom" fires={0.9} /><Rock pos={[0.3, 16, -44]} r={11 * grow} heat={1} trail={0.4} dir={[0.1, -0.4, 1]} /></>}>
    <Cel at={[-0.7, 0, 0.4]} h={BOSS_H}><Boss {...act(t, [[0, 'stand'], [K.helps - 0.1, 'handsOnHead']], [[0, 'neutral']])} view="back" /></Cel>
    <Cel at={[0.7, 0, 0.6]} h={THIEF_H}><Thief {...act(t, [[0, 'stand'], [K.helps - 0.05, 'handsOnHead']], [[0, 'neutral']])} view="back" /></Cel>
  </World>);
};

// ---------------------------------------------------------------- 10. a rock this size once... vapour, five thousand degrees (cross-section)
const ImpactShot: React.FC<{t: number}> = ({t}) => {
  const fall = prog(t, C.impact + 0.2, K.vapour - 0.05);
  const boom = smooth(prog(t, K.vapour - 0.05, K.vapour + 0.5));
  const heat = smooth(prog(t, K.vapour, K.degrees + 0.3));
  const cam = cam3At(t, [[C.impact, {pos: [0.6, -0.4, 15.5], look: [0.6, -1.6, 0], fov: 40}], [K.vapour - 0.1, {pos: [0.6, -0.5, 14.5], look: [0.6, -1.7, 0], fov: 40}], [K.degrees - 0.2, {pos: [3.4, 1.4, 8.5], look: [3.4, 0.8, 0], fov: 40}], [C.dust, {pos: [3.6, 1.6, 8.0], look: [3.6, 1.0, 0], fov: 40}]]);
  const flash = bump(t, K.vapour - 0.05, K.vapour + 0.3);
  return (<AbsoluteFill><World cam={cam} light={mixLight(LT.ground, {...LT.ground, sunColor: '#FFB070', ambI: 1.8}, heat)} sky={mixSky(SKIES.ground, ['#5A2A1A', '#FF8A40'], heat)} scene={<>
      <CrossSection t={t} boom={boom} heat={heat} />
      {fall < 1 && <Rock pos={[lerp(-8, 0, fall), lerp(12, 0.6, fall), 0]} r={1.1} heat={1} trail={1} dir={[0.6, -1, 0]} />}
    </>} />
    {flash > 0.01 && <AbsoluteFill style={{background: '#FFF6E0', opacity: flash * 0.9}} />}
  </AbsoluteFill>);
};

// ---------------------------------------------------------------- 11. dust wraps the planet within hours
const DustShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.dust, {pos: [0, 1.6, 25], look: [0, 0, 0], fov: 38}], [C.waves, {pos: [0.6, 1.4, 22.5], look: [0, 0, 0], fov: 38}]]);
  const d = smooth(prog(t, K.dust - 0.25, C.waves + 0.1));
  return (<World cam={cam} light={LT.space} sky={SKIES.space} scene={<><Stars /><Earth pos={[0, 0, 0]} R={3.2} spin={-0.6 + t * 0.12} dust={d} hit={[0.1, 0.5, 0.86]} tilt={0.1} /></>} />);
};

// ---------------------------------------------------------------- 12. giant waves reach the coast
const WaveShot: React.FC<{t: number}> = ({t}) => {
  const w = smooth(prog(t, K.waves - 0.35, C.dino - 0.05));
  const houses = 1 - smooth(prog(t, C.dino - 0.75, C.dino - 0.1));
  const cam = cam3At(t, [[C.waves, {pos: [0, 1.5, 9], look: [0, 1.6, -6], fov: 40}], [C.dino, {pos: [0, 2.1, 10.5], look: [0, 3.2, -6], fov: 42}]]);
  const L = mixLight(LT.coast, {...LT.coast, sunI: 1.4, ambI: 1.0, sky: '#9AA8B8'}, w * 0.6);
  return (<World cam={cam} light={L} sky={mixSky(SKIES.coast, ['#5A6878', '#B8C4CC'], w * 0.7)} scene={<Coast t={t} wave={w} houses={houses} />}>
    <Cel at={[0.5, 0, 4.2]} h={1.7}><Beach {...act(t, [[0, 'relaxed'], [K.waves + 0.1, 'scared'], [K.coastlines, 'handsOnHead']], [[0, 'happy'], [K.waves + 0.1, 'shocked'], [K.coastlines, 'scared']])} view={t > K.coastlines + 0.4 ? 'left' : 'front'} /></Cel>
  </World>);
};

// ---------------------------------------------------------------- 13. it ended the dinosaurs (sepia memory)
const DinoShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.dino, {pos: [1.2, 1.6, 7.5], look: [-0.8, 2.6, -6], fov: 44}], [C.lab, {pos: [0.9, 1.5, 6.6], look: [-0.8, 2.8, -6], fov: 44}]]);
  const ball = prog(t, C.dino - 0.2, C.lab + 0.3);
  const shock = t > K.dinosaurs - 0.1 ? 1 : 0;
  return (<Mood sat={0.55} sepia={0.45}><World cam={cam} light={LT.prehist} sky={SKIES.prehist} scene={<Prehist t={t} ball={ball} />}>
    <Cel at={[0.6, 0, -0.6]} h={2.6} unitsTall={480}><Dino shock={shock} look={shock} /></Cel>
  </World></Mood>);
};

// ---------------------------------------------------------------- 14. but one scientist has a plan (observatory)
const BLOB_OBS: V3 = [-0.75, 0, -1.0];
const LabShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.lab, {pos: [-0.3, 1.5, 3.9], look: [-0.2, 1.5, -3], fov: 40}], [K.plan - 0.2, {pos: [-0.45, 1.5, 3.6], look: [-0.35, 1.5, -3], fov: 40}], [K.plan + 0.35, {pos: [-0.5, 1.7, 3.3], look: [-0.4, 1.85, -3], fov: 40}, EASE.punch], [C.dart, {pos: [-0.5, 1.7, 3.2], look: [-0.4, 1.9, -3], fov: 40}]]);
  const open = smooth(prog(t, K.plan - 0.05, K.plan + 0.8));
  const sat = lerp(0.55, 1, smooth(prog(t, C.lab, C.lab + 0.5))), sep = lerp(0.45, 0, smooth(prog(t, C.lab, C.lab + 0.5)));
  const turned = t > K.scientist - 0.2;
  return (<Mood sat={sat} sepia={sep}><World cam={cam} light={LT.lab} sky={['#0A0E22', '#1E2448']} scene={<Observatory t={t} open={open} aim={open} />}>
    <Cel at={BLOB_OBS}><Blob {...idle(act(t, [[0, 'think'], [K.scientist - 0.2, 'stand'], [K.plan - 0.15, 'pointUp']], [[0, 'thinking'], [K.scientist - 0.2, 'determined'], [K.plan, 'grin']]), t)}
      view={turned ? 'front' : 'right'} /></Cel>
  </World></Mood>);
};

// ---------------------------------------------------------------- 15. NASA crashed DART into an asteroid (2022)
const ORB = 4.2, ORB2 = 3.75, W0 = 0.9;
const dimAt = (t: number, r = ORB): V3 => [Math.cos(W0 * t) * r, 0.2 * Math.sin(W0 * t), Math.sin(W0 * t) * r];
const HIT = K.asteroid;
const DartShot: React.FC<{t: number}> = ({t}) => {
  const dHit = dimAt(HIT), p0: V3 = [dHit[0] + 9, dHit[1] + 2.5, dHit[2] + 12];
  const u = prog(t, C.dart, HIT), cp: V3 = [lerp(p0[0], dHit[0], u), lerp(p0[1], dHit[1], u), lerp(p0[2], dHit[2], u)];
  const cam = (tt: number): Cam3 => { const uu = prog(tt, C.dart, HIT), c: V3 = [lerp(p0[0], dHit[0], uu), lerp(p0[1], dHit[1], uu), lerp(p0[2], dHit[2], uu)];
    const follow: Cam3 = {pos: [c[0] + 1.6, c[1] + 0.9, c[2] + 3.4], look: [lerp(c[0], dHit[0], 0.4), c[1], lerp(c[2], dHit[2], 0.4)], fov: 38};
    const wide: Cam3 = {pos: [dHit[0] + 5, 3.5, dHit[2] + 11], look: [dHit[0] * 0.6, 0, dHit[2] * 0.6], fov: 40};
    const k = smooth(prog(tt, HIT - 0.55, HIT - 0.15)); return {pos: [lerp(follow.pos[0], wide.pos[0], k), lerp(follow.pos[1], wide.pos[1], k), lerp(follow.pos[2], wide.pos[2], k)], look: [lerp(follow.look[0], wide.look[0], k), lerp(follow.look[1], wide.look[1], k), lerp(follow.look[2], wide.look[2], k)], fov: lerp(38, 40, k)}; };
  const c = cam(t);
  const plume = prog(t, HIT, HIT + 1.4);
  const flash = bump(t, HIT - 0.02, HIT + 0.25);
  const dm = dimAt(t);
  const debris = plume > 0 && plume < 1 ? Array.from({length: 30}, (_, i) => { const n = new THREE.Vector3(rnd(i) - 0.3, rnd(i * 3) - 0.5, rnd(i * 7) - 0.1).normalize(); const d = plume * (0.8 + rnd(i * 5) * 2.4);
    return {p: [dm[0] + n.x * d, dm[1] + n.y * d, dm[2] + n.z * d] as V3, s: 0.05 + rnd(i * 11) * 0.1}; }) : [];
  return (<ShotBlur t={t} cam={cam}><AbsoluteFill><World cam={c} light={LT.space} sky={SKIES.space} scene={<><Stars />
      <Rock pos={[0, 0, 0]} r={2.2} rot={[0.2, t * 0.3, 0]} seed={11} color="#8A7A6A" />
      <Rock pos={dm} r={0.55} rot={[t * 0.5, t * 0.2, 0]} seed={5} color="#7A6E64" />
      {t < HIT && <Craft pos={cp} rot={[0.2, Math.atan2(p0[0] - dHit[0], p0[2] - dHit[2]), 0]} s={0.45} />}
      {debris.length > 0 && <Instances k="debris" geo={() => new THREE.IcosahedronGeometry(1, 0)} items={debris} color="#9A8E80" rough={1} cast={false} />}
    </>} />
    {flash > 0.01 && <AbsoluteFill style={{background: '#FFFFFF', opacity: flash * 0.85}} />}
  </AbsoluteFill></ShotBlur>);
};

// ---------------------------------------------------------------- 16. shifted its orbit by thirty-two minutes (top view, not to scale)
const OrbitShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.orbit, {pos: [0.3, 12, 7], look: [0, 0, -0.5], fov: 40}], [C.why, {pos: [0.2, 11, 6], look: [0, 0, -0.5], fov: 40}]]);
  const draw = smooth(prog(t, K.shifted - 0.1, K.shifted + 0.8));
  const ring = (r: number, k: number, color: string, dash: boolean, key: string) => { const pts = Array.from({length: 72}, (_, i) => i / 71).filter((q) => q <= k).map((q) => { const p = toScreen(cam, [Math.cos(q * Math.PI * 2) * r, 0, Math.sin(q * Math.PI * 2) * r]); return p ? `${p.x.toFixed(1)},${p.y.toFixed(1)}` : ''; }).filter(Boolean);
    return pts.length > 1 ? <polyline key={key} points={pts.join(' ')} fill="none" stroke={color} strokeWidth={7} strokeDasharray={dash ? '18 16' : undefined} strokeLinecap="round" opacity={0.9} /> : null; };
  const r = lerp(ORB, ORB2, draw);
  const card = cardIn(t, K.minutes - 0.2, C.why - 0.3);
  return (<World cam={cam} light={LT.space} sky={SKIES.space} scene={<><Stars /><Rock pos={[0, 0, 0]} r={2.2} rot={[0.2, t * 0.3, 0]} seed={11} color="#8A7A6A" /><Rock pos={dimAt(t * 1.6, r)} r={0.55} rot={[t * 0.5, t * 0.2, 0]} seed={5} color="#7A6E64" /></>}>
    {ring(ORB, 1, '#FFFFFF', true, 'old')}
    {ring(ORB2, draw, '#FFD23F', false, 'new')}
    <BigNumber x={540} y={420} s={card.s} rot={card.rot} text="32" sub="minutes shorter" size={150} />
  </World>);
};

// ---------------------------------------------------------------- 17. the why: found late (hits) vs found early (a small push = a miss)
const L_EARTH: V3 = [-1.45, 0.55, 0.3], R_EARTH: V3 = [1.45, 0.55, 0.3];
const WhyShot: React.FC<{t: number}> = ({t}) => {
  const KEYS: Cam3Key[] = [[C.why, {pos: [-1.45, 3.4, 5.2], look: [-1.45, 0.2, -2.6], fov: 40}], [K.early - 0.25, {pos: [-1.45, 3.3, 4.9], look: [-1.45, 0.2, -2.6], fov: 40}],
    [K.early + 0.2, {pos: [1.45, 3.4, 5.2], look: [1.45, 0.2, -2.6], fov: 40}, EASE.whip], [C.fin, {pos: [1.45, 3.3, 4.8], look: [1.45, 0.2, -2.8], fov: 40}]];
  const cam = cam3At(t, KEYS);
  const lu = smooth(prog(t, C.why + 0.1, K.early - 0.3));          // left: found late, straight in
  const lStart: V3 = [-1.45, 0.55, -6.5];
  const lp: V3 = [lStart[0], 0.55, lerp(lStart[2], L_EARTH[2] - 0.45, lu)];
  const hit = t > K.early - 0.32;
  const ru = smooth(prog(t, K.early + 0.15, C.fin - 0.05));      // right: tapped far away, bends past
  const rStart: V3 = [1.45, 0.55, -6.5], tap = K.push - 0.1, bend = smooth(prog(t, tap, tap + 0.8));
  const rPath = (k: number, b: number): V3 => [rStart[0] + b * 1.6 * k * k, 0.55, lerp(rStart[2], R_EARTH[2] + 1.2, k)];
  const rp = rPath(ru, bend);
  const craftU = prog(t, K.early + 0.2, tap);
  const line = (a: V3, b: V3, color: string, dash: boolean, key: string, w = 6) => { const A = toScreen(cam, a), B = toScreen(cam, b); return A && B ? <line key={key} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={color} strokeWidth={w} strokeDasharray={dash ? '16 14' : undefined} strokeLinecap="round" /> : null; };
  const curve = (b: number, color: string, key: string) => { const pts = Array.from({length: 24}, (_, i) => rPath(i / 23, b)).map((p) => toScreen(cam, p)).filter(Boolean).map((p) => `${p!.x.toFixed(1)},${p!.y.toFixed(1)}`); return <polyline key={key} points={pts.join(' ')} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" />; };
  return (<ShotBlur t={t} cam={KEYS}><World cam={cam} light={LT.stage} sky={SKIES.stage} scene={<>
      <Stage />
      <Earth pos={L_EARTH} R={0.45} spin={t * 0.3} tilt={0.2} /><Earth pos={R_EARTH} R={0.45} spin={t * 0.3} tilt={0.2} />
      {!hit ? <Rock pos={lp} r={0.22} rot={[t, t, 0]} heat={0.4} trail={0.5} dir={[0, 0, 1]} /> :
        <Ball pos={[L_EARTH[0], 0.75, L_EARTH[2] - 0.35]} r={0.25 + 0.5 * prog(t, K.early - 0.32, K.early + 0.2)} color="#FFB060" emissive="#FF5A10" glow={2} opacity={0.8 * (1 - prog(t, K.early, K.early + 0.6))} cast={false} />}
      <Rock pos={t > K.early ? rp : rStart} r={0.22} rot={[t, t, 0]} heat={0.2} trail={ru > 0.01 ? 0.4 : 0} dir={[0, 0, 1]} />
      {craftU > 0 && craftU < 1 && <Craft pos={[lerp(-0.2, rStart[0] - 0.15, craftU), 0.62, lerp(-4, rStart[2] + 0.5, craftU)]} rot={[0, -0.8, 0]} s={0.16} />}
    </>}>
    {line(lStart, [L_EARTH[0], 0.55, L_EARTH[2]], '#FF5A4A', false, 'l1')}
    {curve(0, 'rgba(255,255,255,0.55)', 'r0')}
    {t > tap && curve(bend, '#FFD23F', 'r1')}
    <Cel at={[0.85, 0, 0.5]} h={1.25}><Blob {...act(t, [[0, 'stand'], [K.push - 0.2, 'explain']], [[0, 'happy'], [K.enough2, 'smug']])} view="right" /></Cel>
  </World></ShotBlur>);
};

// ---------------------------------------------------------------- 18. finale: sunrise street, the rock streaks away; boss and thief with nothing; Blob crowned
const BLOB_FIN: V3 = [0, 0, 0.4], CRATE_H = 0.5;
const FIN_CLOSE: Cam3 = {pos: [0, 2.0, 5.0], look: [0, 1.85, 0.4], fov: 38};
const Finale: React.FC<{t: number}> = ({t}) => {
  const KEYS: Cam3Key[] = [[C.fin, {pos: [3.2, 7.5, 10], look: [0, 1.2, -4], fov: 46}], [K.subscribe + 0.05, {pos: [3.0, 7.2, 9.6], look: [0, 1.2, -4], fov: 46}], [K.subscribe + 0.45, FIN_CLOSE, EASE.slam], [END, {...FIN_CLOSE, pos: [0, 2.0, 4.8]}]];
  const cam = cam3At(t, KEYS);
  const up = t > K.subscribe + 0.5 && t < C.loop - 0.1;
  const rs = prog(t, C.fin - 0.5, END);
  const bp = toScreen(cam, [BLOB_FIN[0], CRATE_H + 1.2, BLOB_FIN[2]]);
  return (<ShotBlur t={t} cam={KEYS}><World cam={cam} light={{...LT.sunrise, focus: [0, 0, -1], span: 9}} sky={SKIES.sunrise} scene={<>
      <City t={t} mode="sunrise" />
      <Rock pos={[lerp(-14, 22, rs), lerp(20, 26, rs), -60]} r={2.6} heat={0.6} trail={0.8} dir={[1, 0.2, 0]} />
      <Box pos={[BLOB_FIN[0], 0, BLOB_FIN[2]]} size={[0.9, CRATE_H, 0.7]} r={0.03} color="#C9A06A" map={undefined} />
      <Box pos={[-2.6, 0.16, -0.75]} size={[0.5, 0.36, 0.14]} r={0.03} color="#7A4A2A" />
      <Ball pos={[2.6, 0.36, -0.9]} r={0.22} scale={[1.2, 0.6, 1]} color="#B8865A" />
      <Ball pos={[0, 2.2, -4.5]} r={1.6} color="#FFE2A0" emissive="#FFC060" glow={2.2} opacity={0.5} cast={false} receive={false} />
    </>}>
    <Cel at={[-2.6, 0.16, -0.6]} h={BOSS_H}><Boss {...idle({...SIT, ...EXPR.sad, handL: [-40, -110], handR: [40, -110], bounce: -150}, t, 0.2)} /></Cel>
    <Cel at={[2.6, 0.16, -0.8]} h={THIEF_H}><Thief {...idle({...SIT, ...EXPR.sad, bounce: -140, handL: [-40, -100], handR: [40, -100]}, t, 0.5)} /></Cel>
    <Cel at={BLOB_FIN} lift={CRATE_H} shadow={false}><Blob {...idle(act(t, [[0, 'stand'], [C.fin + 0.2, 'cheer']], [[0, 'happy'], [C.fin + 0.2, 'joy']]), t)} {...(up ? {lookY: -12, faceDy: -14, eyes: 'dot' as const, mouth: 'grin' as const, browUp: 0.9} : {})} /></Cel>
    {bp && [[-210, -260, 0], [220, -200, 0.25], [-260, 40, 0.5], [250, 90, 0.75], [0, -380, 0.9]].map(([x, y, ph], i) => <Sparkle key={i} x={bp.x + x * bp.s / 260} y={bp.y + y * bp.s / 260} r={Math.max(0, loopS(t, Math.round(DUR * 0.6), ph)) * 26} fill="#FFE27A" />)}
  </World></ShotBlur>);
};

// ---------------------------------------------------------------- composition
const Scenes: React.FC<{t: number}> = ({t}) => {
  const tr = (at: number, kind: 'fly' | 'smear' | 'flash', a: React.ReactNode, b: React.ReactNode, color?: string, dir: 1 | -1 = 1) => <Transition t={t} at={at} kind={kind} a={a} b={b} color={color} dir={dir} />;
  const sat = t < C.dust ? 1 : 1;
  void sat;
  return (<Cuts t={t} shots={[
    [0, <Hook t={t} />], [C.money - 0.2, tr(C.money, 'flash', <Hook t={t} />, <MoneyShot t={t} />)], [C.money + 0.2, <MoneyShot t={t} />],
    [C.robs, <RobShot t={t} />], [C.story, <SkyShot t={t} />],
    [C.rock - 0.2, tr(C.rock, 'fly', <SkyShot t={t} />, <TurnShot t={t} />)], [C.rock + 0.2, <TurnShot t={t} />],
    [C.falls, <StreakShot t={t} />], [C.kmps, <KmpsShot t={t} />], [C.race, <RaceShot t={t} />], [C.moon, <MoonShot t={t} />],
    [C.buy, <BuyShot t={t} />], [C.run, <RunShot t={t} />], [C.neither, <NeitherShot t={t} />],
    [C.impact - 0.2, tr(C.impact, 'smear', <NeitherShot t={t} />, <ImpactShot t={t} />)], [C.impact + 0.2, <ImpactShot t={t} />],
    [C.dust, <DustShot t={t} />], [C.waves, <WaveShot t={t} />], [C.dino, <DinoShot t={t} />], [C.lab, <LabShot t={t} />],
    [C.dart - 0.2, tr(C.dart, 'smear', <LabShot t={t} />, <DartShot t={t} />)], [C.dart + 0.2, <DartShot t={t} />],
    [C.orbit, <OrbitShot t={t} />], [C.why, <WhyShot t={t} />],
    [C.fin - 0.2, tr(C.fin, 'flash', <WhyShot t={t} />, <Finale t={t} />, '#FFF2C4')], [C.fin + 0.2, <Finale t={t} />],
    [C.loop - 0.2, tr(C.loop, 'flash', <Finale t={t} />, <Hook t={0} />)], [C.loop + 0.2, <Hook t={0} />],
  ]} />);
};
export const Short: React.FC<{voice?: boolean; captions?: boolean; guides?: boolean}> = ({voice = false, captions = true, guides = false}) => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps;
  const hookT = t < C.money ? 1 : t > C.loop ? 1 : 0;
  const telS = hookT ? (t < C.money ? 1 - smooth(prog(t, C.money - 0.25, C.money)) : smooth(prog(t, C.loop + 0.1, C.loop + 0.2))) : Math.min(pop(t, K.turns - 0.1, 0.35), 1 - smooth(prog(t, C.impact - 0.25, C.impact)));
  const km = hookT ? 36 : distAt(t);
  return (<AbsoluteFill style={{background: '#000'}}>
    <Scenes t={t} />
    <Telemetry t={t} km={km} s={telS} alarm={hookT === 1 || t > K.tries} />
    {t > C.orbit && t < C.why && <AbsoluteFill><Tag text="not to scale" show={1} /></AbsoluteFill>}
    <Cta t={t} tIn={K.subscribe - 0.1} tClick={K.whatifs + 0.05} tBell={K.whatifs + 0.5} tOut={C.loop - 0.25} y={330} />
    {captions && <Captions t={t} />}
    {guides && <SafeGuides />}
    <Audio src={staticFile(`${T.short}/sfx.wav`)} volume={0.42} />
    <Audio src={staticFile(`${T.short}/bed.wav`)} volume={0.2} />
    {voice && <Sequence from={Math.round(Math.max(0, T.voiceOffset) * fps)} layout="none"><Audio src={staticFile(`${T.short}/vo.wav`)} /></Sequence>}
  </AbsoluteFill>);
};

// ---------------------------------------------------------------- thumbnails (each its own staged World; same cast, same sets)
const ThumbA: React.FC = () => {      // the mystery: the thief's terrified face up close, the rock filling the sky, circled
  const t = 10, cam: Cam3 = {pos: [0.5, 1.35, 4.4], look: [0.2, 4.6, -20], fov: 46};
  const ring = toScreen(cam, ROCK_SKY);
  return (<World cam={cam} light={LT.doom} sky={SKIES.doom} scene={<><City t={t} mode="doom" fires={1} /><Rock pos={ROCK_SKY} r={10} heat={1} trail={0.6} dir={[0.1, -0.4, 1]} /></>}>
    <Cel at={[0.25, 0, 0.6]} h={THIEF_H}><Thief {...act(0, [[0, 'handsOnHead']], [[0, 'scared']])} {...UP} sweat={1} /></Cel>
    {ring && <><Ring x={ring.x} y={ring.y} r={230} /><Arrow x1={ring.x + 260} y1={ring.y + 420} x2={ring.x + 120} y2={ring.y + 230} /></>}
  </World>);
};
const ThumbB: React.FC = () => {      // the smug winner: Blob the scientist pointing up, observatory open
  const t = 40, cam: Cam3 = {pos: [-0.5, 1.6, 2.2], look: [-0.45, 1.75, -3], fov: 40};
  return (<World cam={cam} light={LT.lab} sky={['#0A0E22', '#1E2448']} scene={<Observatory t={t} open={1} aim={1} />}>
    <Cel at={BLOB_OBS}><Blob {...act(0, [[0, 'pointUp']], [[0, 'smug']])} /></Cel>
  </World>);
};
const ThumbC: React.FC = () => {      // the stakes: the boss offers his cash to the falling rock
  const t = 20, cam: Cam3 = {pos: [1.6, 1.5, 2.6], look: [-0.4, 1.7, -2.2], fov: 40};
  return (<World cam={cam} light={mixLight(LT.office, LT.doom, 0.6, {span: 6})} sky={['#2A0A10', '#C8402A']} scene={<><Office t={t} /><Rock pos={[-0.9, 2.0, -14]} r={2.6} heat={1} trail={0.5} dir={[0.2, -0.4, 1]} /></>}>
    <Cel at={WIN_AT} h={BOSS_H}><Boss {...act(0, [[0, 'reach']], [[0, 'scared']])} view="left" eyes="wide" mouth="o" browUp={1} handR={[-150, -230]} handL={[-100, -205]} sweat={1} /></Cel>
  </World>);
};
export const Thumb: React.FC<{variant: 'A' | 'B' | 'C'}> = ({variant}) => {
  if (variant === 'A') return <ThumbFrame scene={<ThumbA />} l1="9 HOURS LEFT" l2="CAN WE STOP IT?" />;
  if (variant === 'B') return <ThumbFrame scene={<ThumbB />} l1="HE HAS" l2="A PLAN" />;
  return <ThumbFrame scene={<ThumbC />} l1="MONEY" l2="WON'T SAVE YOU" />;
};
void [Cyl, kfs, clamp, spring, BLOB, rnd, CASH, Moon, Earth, Desk];
