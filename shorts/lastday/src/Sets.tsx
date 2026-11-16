import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Ball, Box, Cyl, Ground, Instances, Inst, Light, V3, tex} from './World3D';
import {mix} from './color';
import {clamp, lerp, rnd} from './math';
import timing from './timing.json';

/* "Last day on Earth" sets. Everything here is a shaded 3D mesh; the cast stays flat (Cast.tsx).
 * Places: a city street (night / doom red / dusk / sunrise), the boss's office, deep space (Earth, Moon, the rock),
 * a ruler track, an impact cross-section, a coast, a prehistoric valley, an observatory, the DART asteroids, a split stage. */
export const DUR = (timing as any).duration as number;
export const loopS = (t: number, n: number, ph = 0) => Math.sin(2 * Math.PI * (n * t / DUR + ph));   // whole cycles over the video (loop-safe)
const SPH = () => new THREE.SphereGeometry(1, 20, 14);
const BOX = () => new THREE.BoxGeometry(1, 1, 1);

// ------------------------------------------------------------------------------------------------ lights + skies
type L = Required<Light>;
const mk = (o: Partial<L>): L => ({sun: [-4, 7, 4], sunColor: '#FFF3DC', sunI: 2.4, sky: '#DCEBFF', bounce: '#B9A894', ambI: 1.25, fog: ['#DDE8F5', 30, 140], focus: [0, 0, 0], span: 12, ...o});
export const LT = {
  night:   mk({sun: [3, 6, 5], sunColor: '#A9B8FF', sunI: 1.1, sky: '#5868A8', bounce: '#3A2A3A', ambI: 1.0, fog: ['#1A1F3A', 22, 95]}),
  doom:    mk({sun: [0.5, 7, 6], sunColor: '#FF8A4A', sunI: 2.6, sky: '#D0503A', bounce: '#5A1A1A', ambI: 1.05, fog: ['#4A140F', 20, 85]}),
  dusk:    mk({sun: [6, 2.6, 4], sunColor: '#FFB070', sunI: 2.3, sky: '#C9A0D0', bounce: '#B07A5A', ambI: 1.15, fog: ['#C98A9A', 24, 100]}),
  sunrise: mk({sun: [5, 2.4, 5], sunColor: '#FFC27A', sunI: 2.8, sky: '#FFD9B0', bounce: '#D99A6A', ambI: 1.25, fog: ['#F7C49A', 26, 120]}),
  office:  mk({sun: [-3, 4, 5], sunColor: '#FFE2B0', sunI: 2.0, sky: '#7080B8', bounce: '#7A5434', ambI: 1.05, fog: ['#141830', 30, 90], span: 6}),
  space:   mk({sun: [-6, 2.5, 5], sunColor: '#FFF6E8', sunI: 3.3, sky: '#2A3A70', bounce: '#0A0A18', ambI: 0.4, fog: ['#000000', 380, 400], span: 30}),
  lab:     mk({sun: [3, 6, 5], sunColor: '#C8D8FF', sunI: 1.5, sky: '#6070A8', bounce: '#3A3448', ambI: 1.1, fog: ['#10142A', 25, 80], span: 7}),
  coast:   mk({sun: [-5, 6, 4], sunColor: '#FFF0D0', sunI: 2.6, sky: '#CDE8FF', bounce: '#E0C890', ambI: 1.25, fog: ['#E8F2FA', 30, 150], span: 16}),
  prehist: mk({sun: [5, 4, 4], sunColor: '#FFB070', sunI: 2.5, sky: '#FFB890', bounce: '#B0703A', ambI: 1.15, fog: ['#E89060', 26, 110], span: 10}),
  stage:   mk({sun: [-3, 7, 5], sunColor: '#FFFFFF', sunI: 2.0, sky: '#C8D2F0', bounce: '#3A3A50', ambI: 1.0, fog: ['#141828', 40, 120], span: 9}),
  ground:  mk({sun: [-4, 6, 5], sunColor: '#FFF0D8', sunI: 2.4, sky: '#CFE2FF', bounce: '#B08A60', ambI: 1.2, fog: ['#F0E4D0', 30, 120], span: 8}),
};
export const SKIES = {night: ['#070B22', '#28306A'], doom: ['#2A0A10', '#FF5A2A'], dusk: ['#4A3E8E', '#FFB08A'], sunrise: ['#5E7FD0', '#FFC48A'],
  space: ['#02030A', '#0A1030'], coast: ['#3E9EEA', '#EAF4FA'], prehist: ['#B0401E', '#FFC070'], stage: ['#10131F', '#262B44'], ground: ['#7DB8F0', '#F4E6CC']} as Record<string, [string, string]>;
const mixV = (a: V3, b: V3, u: number): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
export const mixLight = (a: L, b: L, u: number, over: Partial<L> = {}): Light => ({
  sun: mixV(a.sun, b.sun, u), sunColor: mix(a.sunColor, b.sunColor, u), sunI: lerp(a.sunI, b.sunI, u), sky: mix(a.sky, b.sky, u), bounce: mix(a.bounce, b.bounce, u),
  ambI: lerp(a.ambI, b.ambI, u), fog: [mix(a.fog[0], b.fog[0], u), lerp(a.fog[1], b.fog[1], u), lerp(a.fog[2], b.fog[2], u)], focus: a.focus, span: a.span, ...over});
export const mixSky = (a: [string, string], b: [string, string], u: number): [string, string] => [mix(a[0], b[0], u), mix(a[1], b[1], u)];

// ------------------------------------------------------------------------------------------------ the rock (lumpy, cratered)
const lumpyGeo = (seed: number) => { const g = new THREE.IcosahedronGeometry(1, 4); const p = g.attributes.position as THREE.BufferAttribute, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const n = v.clone().normalize();
    const d = 1 + 0.16 * Math.sin(n.x * 3.1 + seed) * Math.cos(n.y * 2.7 + seed * 2) + 0.09 * Math.sin(n.z * 5.3 + n.x * 2 + seed * 3) + 0.05 * Math.sin(n.y * 9 + seed);
    v.copy(n).multiplyScalar(d); p.setXYZ(i, v.x * 1.15, v.y * 0.9, v.z); }
  g.computeVertexNormals(); return g; };
const geoCache = new Map<string, THREE.BufferGeometry>();
const cachedGeo = (k: string, f: () => THREE.BufferGeometry) => { let g = geoCache.get(k); if (!g) { g = f(); geoCache.set(k, g); } return g; };
const onSphere = (i: number, seed: number): THREE.Vector3 => { const a = rnd(seed + i * 3.1) * Math.PI * 2, z = rnd(seed + i * 7.7) * 2 - 1, r = Math.sqrt(1 - z * z); return new THREE.Vector3(r * Math.cos(a), z, r * Math.sin(a)); };
const eulerTo = (n: THREE.Vector3): V3 => { const e = new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), n)); return [e.x, e.y, e.z]; };
/** heat 0..1: the rock glows orange-white as it hits the air; trail 0..1: a glowing tail behind it (pointing -dir) */
export const Rock: React.FC<{pos: V3; r: number; rot?: V3; heat?: number; seed?: number; trail?: number; dir?: V3; color?: string}> = ({pos, r, rot = [0, 0, 0], heat = 0, seed = 3, trail = 0, dir = [0, -1, 0.4], color = '#6E5E52'}) => {
  const geo = cachedGeo('rock' + seed, () => lumpyGeo(seed));
  const craters = useMemo(() => Array.from({length: 14}, (_, i) => { const n = onSphere(i, seed * 13); const s = 0.12 + rnd(i + seed) * 0.16;
    return {p: [n.x * 1.06, n.y * 0.84, n.z * 0.95] as V3, s: [s, s * 0.35, s] as V3, r: eulerTo(n)}; }), [seed]);
  const D = new THREE.Vector3(...dir).normalize();
  const tailQ = eulerTo(D.clone().multiplyScalar(-1));
  return (<group position={pos}>
    <group rotation={rot} scale={r}>
      <mesh geometry={geo} castShadow receiveShadow><meshStandardMaterial color={mix(color, '#FFB060', heat * 0.6)} roughness={0.95} emissive={new THREE.Color('#FF6A1A')} emissiveIntensity={heat * 1.4} /></mesh>
      <Instances k={'cr' + seed} geo={SPH} items={craters} color={mix('#3E342E', '#FF9A40', heat * 0.7)} rough={1} cast={false} />
    </group>
    {trail > 0.01 && <group rotation={tailQ}>
      <Cyl pos={[0, r * 0.2, 0]} r={r * 1.05} rTop={0.02} h={r * 7 * trail} color="#FFB060" emissive="#FF7A20" glow={2.2} opacity={0.55} cast={false} receive={false} />
      <Cyl pos={[0, r * 0.2, 0]} r={r * 0.7} rTop={0.01} h={r * 4.5 * trail} color="#FFF2C0" emissive="#FFE080" glow={2.5} opacity={0.6} cast={false} receive={false} />
    </group>}
    {heat > 0.3 && <Ball pos={[0, 0, 0]} r={r * 1.35} color="#FF9A40" emissive="#FF6A1A" glow={1.5} opacity={0.22 * heat} cast={false} receive={false} />}
  </group>);
};

// ------------------------------------------------------------------------------------------------ Earth, Moon, stars
export const Stars: React.FC<{n?: number; R?: number; seed?: number}> = ({n = 260, R = 150, seed = 5}) => {
  const items = useMemo(() => Array.from({length: n}, (_, i) => { const v = onSphere(i, seed); return {p: [v.x * R, v.y * R, v.z * R] as V3, s: 0.12 + rnd(i * 3 + seed) * 0.28, c: i % 9 === 0 ? '#FFD9A8' : '#FFFFFF'}; }), [n, R, seed]);
  return <Instances k={'stars' + n} geo={SPH} items={items} emissive="#FFFFFF" glow={1.6} cast={false} receive={false} />;
};
const CONT: [number, number, number][] = [[0.3, 0.4, 0.9], [-0.8, 0.2, 0.5], [0.9, -0.3, 0.2], [-0.2, -0.7, 0.6], [0.1, 0.85, -0.3], [-0.6, -0.1, -0.8]];
/** dust 0..1: a dark shell spreading from `hit` (a unit vector on the globe) around the planet; spin = turns (radians) */
export const Earth: React.FC<{pos: V3; R: number; spin?: number; dust?: number; hit?: V3; tilt?: number}> = ({pos, R, spin = 0, dust = 0, hit = [0.3, 0.5, 0.8], tilt = 0.35}) => {
  const land = useMemo(() => { const out: Inst[] = []; CONT.forEach(([x, y, z], ci) => { const c = new THREE.Vector3(x, y, z).normalize();
    for (let i = 0; i < 16; i++) { const n = c.clone().add(new THREE.Vector3(rnd(ci * 31 + i) - 0.5, rnd(ci * 17 + i) - 0.5, rnd(ci * 7 + i) - 0.5).multiplyScalar(0.5)).normalize();
      const s = 0.1 + rnd(ci * 5 + i) * 0.07; out.push({p: [n.x * 0.995, n.y * 0.995, n.z * 0.995], s: [s, 0.025, s], r: eulerTo(n), c: i % 7 === 3 && ci % 2 ? '#C9B26A' : i % 3 ? '#4FA548' : '#3E9440'}); } });
    return out; }, []);
  const clouds = useMemo(() => Array.from({length: 26}, (_, i) => { const n = onSphere(i, 77); const s = 0.06 + rnd(i * 5) * 0.06; return {p: [n.x * 1.012, n.y * 1.012, n.z * 1.012] as V3, s: [s * 1.8, 0.012, s] as V3, r: eulerTo(n)}; }), []);
  const H = new THREE.Vector3(...hit).normalize();
  const dustItems = useMemo(() => Array.from({length: 220}, (_, i) => ({n: onSphere(i, 311), s: 0.09 + rnd(i * 9) * 0.05})), []);
  const ds = dustItems.filter((d) => (1 - d.n.dot(H)) / 2 < dust * 1.05).map((d, i) => { const k = clamp(dust * 1.05 - (1 - d.n.dot(H)) / 2, 0, 0.3) / 0.3;
    return {p: [d.n.x * 1.02, d.n.y * 1.02, d.n.z * 1.02] as V3, s: [d.s * k, 0.035 * k, d.s * k] as V3, r: eulerTo(d.n), c: i % 3 ? '#4A3A30' : '#6A584A'}; });
  return (<group position={pos} rotation={[tilt, 0, 0.2]}>
    <group rotation={[0, spin, 0]} scale={R}>
      <Ball r={1} color={mix('#2F7FD8', '#3A3A44', dust * 0.6)} rough={0.55} />
      <Instances k="land" geo={SPH} items={land.map((l) => ({...l, c: mix(l.c!, '#5A4A40', dust * 0.7)}))} rough={0.9} cast={false} />
      <Instances k="clouds" geo={SPH} items={clouds} color="#FFFFFF" rough={1} cast={false} />
      {dust > 0.01 && <Instances k="dust" geo={SPH} items={ds.length ? ds : [{p: [0, 0, 0], s: 0}]} color="#4A3A30" rough={1} cast={false} />}
      {dust > 0.6 && <Ball r={1.03} color="#3E3028" rough={1} opacity={clamp((dust - 0.6) * 2) * 0.85} cast={false} receive={false} />}
    </group>
    <Ball r={R * 1.045} color="#8FD0FF" emissive="#5AA8FF" glow={0.35} opacity={0.16} cast={false} receive={false} />
  </group>);
};
export const Moon: React.FC<{pos: V3; R: number}> = ({pos, R}) => {
  const cr = useMemo(() => Array.from({length: 22}, (_, i) => { const n = onSphere(i, 41); const s = 0.08 + rnd(i * 3) * 0.18; return {p: [n.x * 0.99, n.y * 0.99, n.z * 0.99] as V3, s: [s, 0.03, s] as V3, r: eulerTo(n), c: i % 3 ? '#8E8E94' : '#7A7A80'}; }), []);
  return (<group position={pos} scale={R}><Ball r={1} color="#C8C8CC" rough={0.95} map={tex('speckle', [4, 2], 9)} /><Instances k="mooncr" geo={SPH} items={cr} rough={1} cast={false} /></group>);
};

// ------------------------------------------------------------------------------------------------ the city street
/* The street runs AWAY from the camera (along -z) so a vertical frame sees the sky down the middle.
 * Building fronts at x = -4.5 (left) and x = +4.5 (right), from z = +6 to z = -64. The shop is on the right at z ~ -0.5. */
const FACADES = ['#7A4E46', '#5E6A7E', '#8A7058', '#4E5E58', '#6E5A78', '#8C5C4A', '#5A5248'];
type Bld = {side: -1 | 1; z: number; w: number; h: number; c: string};
const BLDS: Bld[] = (() => { const out: Bld[] = []; ([-1, 1] as const).forEach((side) => { let z = 6; let i = side > 0 ? 50 : 0;
  while (z > -64) { const w = 3 + rnd(i * 3 + 1) * 2.4; out.push({side, z: z - w / 2, w, h: 5 + rnd(i * 7 + 2) * 8 + Math.max(0, -z) * 0.08, c: FACADES[i % FACADES.length]}); z -= w + 0.1; i++; } }); return out; })();
export const SHOP_Z = -0.5, FRONT_X = 4.5;
export const City: React.FC<{t: number; mode: 'night' | 'doom' | 'dusk' | 'sunrise'; fires?: number}> = ({t, mode, fires = 0}) => {
  const night = mode === 'night' || mode === 'doom';
  const wins = useMemo(() => { const out: Inst[] = []; BLDS.forEach((b, bi) => { const cols = Math.max(2, Math.floor(b.w / 0.95)), rows = Math.floor((b.h - 2.4) / 1.3);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const z = b.z - b.w / 2 + (c + 0.5) * b.w / cols, y = 2.7 + r * 1.3;
      if (b.side > 0 && r === 0 && Math.abs(z - SHOP_Z) < 2) continue;
      out.push({p: [b.side * (FRONT_X - 0.03), y, z], s: [0.04, 0.74, 0.5], c: rnd(bi * 50 + r * 7 + c) > 0.38 ? 'lit' : 'dark'}); } }); return out; }, []);
  const winItems = wins.map((w) => ({...w, c: w.c === 'lit' ? (night ? '#FFD27A' : mode === 'dusk' ? '#F2C080' : '#A8C0E0') : (night ? '#2A3048' : '#4A5878')}));
  const sky = useMemo(() => Array.from({length: 30}, (_, i) => ({p: [-26 + i * 1.8 + rnd(i) * 1.2, 0, -70 - rnd(i * 3) * 18] as V3, s: [2 + rnd(i * 5) * 2.5, 10 + rnd(i * 7) * 26, 2.5] as V3})), []);
  const skyWins = useMemo(() => { const out: Inst[] = []; sky.forEach((b, i) => { const sx = (b.s as V3)[0], sy = (b.s as V3)[1];
    for (let k = 0; k < 10; k++) out.push({p: [b.p[0] + (rnd(i * 31 + k) - 0.5) * sx * 0.8, 1.5 + rnd(i * 13 + k) * (sy - 2), b.p[2] + 1.27], s: [0.4, 0.6, 0.05]}); }); return out; }, []);
  const dashes = useMemo(() => Array.from({length: 26}, (_, i) => ({p: [0, 0.012, 6 - i * 2.6] as V3, s: [0.14, 0.01, 1.2] as V3})), []);
  const lamps = [2, -6, -14, -22, -30];
  const fireSpots: V3[] = [[-4.3, 4.2, -3], [4.3, 7.0, -9], [-4.3, 3.0, -15], [4.3, 5.5, -1.8], [-4.3, 8.5, -24], [4.3, 3.6, -28]];
  const facade = night ? 0.45 : mode === 'dusk' ? 0.15 : 0;
  const walk = night ? '#5A5A62' : '#9A9AA2';
  return (<group>
    <Ground size={[120, 160]} color={night ? '#2C2C34' : '#4A4A52'} map={tex('speckle', [40, 50], 2)} />
    {[-1, 1].map((sd) => <Box key={sd} pos={[sd * 3.75, 0, -29]} size={[1.5, 0.16, 70]} r={0.02} color={walk} map={tex('tiles', [1, 46], 3 + sd)} />)}
    <Instances k="dash" geo={BOX} items={dashes} color="#E8D27A" rough={0.7} cast={false} />
    {BLDS.map((b, i) => <Box key={i} pos={[b.side * (FRONT_X + 3), 0, b.z]} size={[6, b.h, b.w]} r={0.04} color={mix(b.c, '#151828', facade)} map={tex(i % 3 === 0 ? 'bricks' : 'panels', [Math.round(b.w), Math.round(b.h / 1.2)], 10 + (i % 12))} />)}
    {BLDS.map((b, i) => <Box key={'c' + i} pos={[b.side * (FRONT_X + 3), b.h, b.z]} size={[6.14, 0.22, b.w + 0.1]} r={0.02} color={mix('#D8D0C4', '#151828', facade)} cast={false} />)}
    <Instances k="wins" geo={BOX} items={winItems} emissive={night ? '#FFB050' : '#000000'} glow={night ? 0.9 : 0} rough={0.4} cast={false} />
    {/* the shop (right side): awning, door, glowing display window */}
    <Box pos={[FRONT_X - 0.4, 2.25, SHOP_Z]} size={[0.9, 0.12, 2.8]} r={0.02} rot={[0, 0, 0.25]} color="#D84A3A" map={tex('stripes', [1, 6], 5)} />
    <Box pos={[FRONT_X - 0.03, 0.16, SHOP_Z + 0.75]} size={[0.06, 1.9, 0.9]} r={0.02} color="#6A3E2A" map={tex('planks', [3, 1], 8)} />
    <Box pos={[FRONT_X - 0.02, 0.5, SHOP_Z - 0.6]} size={[0.05, 1.3, 1.1]} r={0.02} color="#FFE2A0" emissive="#FFB050" glow={night ? 1.2 : 0.4} rough={0.3} cast={false} />
    {lamps.flatMap((z) => [-1, 1].map((sd) => <group key={z + '' + sd}><Cyl pos={[sd * 3.3, 0, z + (sd > 0 ? 3 : 0)]} r={0.06} h={3.4} color="#2A2E38" metal={0.4} rough={0.5} />
      <Ball pos={[sd * 3.3, 3.45, z + (sd > 0 ? 3 : 0)]} r={0.2} color="#FFE8B0" emissive="#FFC060" glow={night || mode === 'dusk' ? 2 : 0.3} cast={false} /></group>))}
    <Instances k="sky" geo={BOX} items={sky.map((b) => ({...b, p: [b.p[0], (b.s as V3)[1] / 2, b.p[2]] as V3, c: night ? '#232842' : mode === 'dusk' ? '#6A5A8A' : '#8A9AC0'}))} rough={0.9} cast={false} />
    {night && <Instances k="skyw" geo={BOX} items={skyWins} emissive="#FFC060" glow={1} cast={false} receive={false} />}
    {fires > 0.01 && fireSpots.map((p, i) => { const f = 0.85 + 0.15 * loopS(t, 40, i * 0.2), sd = Math.sign(p[0]);
      return <group key={'f' + i}><Ball pos={p} r={0.6 * fires * f} scale={[0.5, 1, 1.3]} color="#FFB040" emissive="#FF6010" glow={2.4} cast={false} />
        {[0, 1, 2].map((k) => { const a = (((t / DUR) * Math.round(DUR * 0.35) + k / 3 + i * 0.13) % 1); return <Ball key={k} pos={[p[0] - sd * 0.5, p[1] + 0.6 + a * 3.4, p[2] + 0.3 * Math.sin(a * 5 + i)]} r={(0.35 + a * 0.9) * fires} color="#2A2024" opacity={0.75 * (1 - a)} rough={1} cast={false} receive={false} />; })}</group>; })}
  </group>);
};

// ------------------------------------------------------------------------------------------------ the boss's office (top floor, night)
export const CASH = () => new THREE.BoxGeometry(0.16, 0.035, 0.08);
export const Office: React.FC<{t: number}> = ({t}) => {
  const sky = useMemo(() => { const out: Inst[] = []; for (let i = 0; i < 18; i++) { const x = -12 + i * 1.5 + rnd(i) * 0.6, h = 6 + rnd(i * 3) * 14, z = -9 - rnd(i * 7) * 10;
    out.push({p: [x, -14 + h / 2, z], s: [1.1 + rnd(i * 5), h, 1.2], c: '#1E2440'}); } return out; }, []);
  const lights = useMemo(() => { const out: Inst[] = []; sky.forEach((b, i) => { for (let k = 0; k < 14; k++) out.push({p: [b.p[0] + (rnd(i * 17 + k) - 0.5) * 0.9, -12 + rnd(i * 23 + k) * ((b.s as V3)[1] - 2), b.p[2] + 0.62], s: [0.18, 0.26, 0.02]}); }); return out; }, []);
  return (<group>
    <Ground size={[30, 30]} color="#6A4A34" map={tex('planks', [12, 12], 4)} />
    <Box pos={[-0.6, 0, -1.2]} size={[6, 0.02, 3]} r={0} color="#8A2A2A" map={tex('speckle', [6, 3], 6)} cast={false} />
    {/* back wall with a wide window (built around the opening) */}
    <Box pos={[0, 0, -2.2]} size={[12, 0.7, 0.2]} r={0} color="#3A4458" map={tex('panels', [6, 1], 7)} />
    <Box pos={[0, 2.9, -2.2]} size={[12, 1.3, 0.2]} r={0} color="#3A4458" map={tex('panels', [6, 1], 8)} />
    <Box pos={[-4.25, 0.7, -2.2]} size={[3.5, 2.2, 0.2]} r={0} color="#3A4458" map={tex('panels', [2, 1], 9)} />
    <Box pos={[4.25, 0.7, -2.2]} size={[3.5, 2.2, 0.2]} r={0} color="#3A4458" map={tex('panels', [2, 1], 10)} />
    {[-2.5, -0.85, 0.85, 2.5].map((x) => <Box key={x} pos={[x, 0.7, -2.2]} size={[0.08, 2.2, 0.24]} r={0.01} color="#1E2230" metal={0.5} rough={0.4} />)}
    <Box pos={[-5.8, 0, -1.2]} size={[0.2, 4.2, 6]} r={0} color="#3A4458" map={tex('panels', [3, 2], 11)} />
    <Instances k="osky" geo={BOX} items={sky} rough={0.9} cast={false} />
    <Instances k="olit" geo={BOX} items={lights} color="#FFD890" emissive="#FFB050" glow={1.1} cast={false} receive={false} />
    {/* bookcase + plant + lamp */}
    <Box pos={[-4.4, 0, -1.6]} size={[1.6, 2.6, 0.5]} r={0.03} color="#5A3A26" map={tex('planks', [2, 4], 12)} />
    {[0.5, 1.15, 1.8].map((y, i) => <Instances key={y} k={'books' + i} geo={BOX} items={Array.from({length: 8}, (_, j) => ({p: [-5.05 + j * 0.17, y + 0.22, -1.45] as V3, s: [0.12, 0.42 + rnd(j + i * 9) * 0.12, 0.3] as V3, c: ['#B03A2E', '#2E5A9A', '#D9A441', '#3E7A4A'][(j + i) % 4]}))} cast={false} />)}
    <Cyl pos={[3.9, 0, -1.4]} r={0.28} rTop={0.34} h={0.6} color="#C9A27A" />
    <Ball pos={[3.9, 1.0, -1.4]} r={0.5} color="#3E8E3A" map={tex('grass', [3, 3], 13)} />
    <Cyl pos={[1.5, 0.78, 0.35]} r={0.12} h={0.04} color="#2A2A30" metal={0.6} rough={0.4} />
    <Cyl pos={[1.5, 0.8, 0.35]} r={0.015} h={0.45} color="#2A2A30" metal={0.6} rough={0.4} />
    <Cyl pos={[1.5, 1.2, 0.35]} r={0.16} rTop={0.06} h={0.18} color="#2E6A4A" emissive="#FFD080" glow={0.4} />
    {void t}
  </group>);
};
/** the desk (goes in `front` so it covers the boss's legs) + piles of cash on it. cash = stacks count 0..1 */
export const Desk: React.FC<{cash: number; briefcase?: boolean}> = ({cash, briefcase = true}) => {
  const n = Math.round(cash * 24);
  const items = useMemo(() => Array.from({length: 24}, (_, i) => ({p: [-0.75 + (i % 6) * 0.18, 0.82 + Math.floor(i / 12) * 0.036, 0.15 + (Math.floor(i / 6) % 2) * 0.1] as V3, r: [0, (rnd(i) - 0.5) * 0.3, 0] as V3})), []);
  return (<group>
    <Box pos={[0, 0, 0.3]} size={[2.2, 0.8, 0.8]} r={0.04} color="#4A2E1E" map={tex('planks', [3, 1], 14)} rough={0.5} />
    <Box pos={[0, 0.06, 0.71]} size={[2.0, 0.6, 0.02]} r={0.01} color="#3A2416" map={tex('panels', [3, 1], 15)} rough={0.5} />
    {n > 0 && <Instances k={'cash' + n} geo={CASH} items={items.slice(0, n)} color="#6FB66A" rough={0.8} />}
    {briefcase && <Box pos={[0.55, 0.8, 0.25]} size={[0.5, 0.36, 0.14]} r={0.03} color="#7A4A2A" rough={0.5} />}
  </group>);
};

// ------------------------------------------------------------------------------------------------ comparison track (bullet vs rock)
export const Track: React.FC = () => {
  const posts = useMemo(() => Array.from({length: 13}, (_, i) => ({p: [-3 + i * 1.0, 0, 0] as V3, s: [0.06, i % 5 === 0 ? 0.55 : 0.3, 0.06] as V3, c: i % 5 === 0 ? '#FFD23F' : '#FFFFFF'})), []);
  return (<group>
    <Ground size={[60, 60]} color="#1C2238" map={tex('checker', [30, 30], 3)} />
    <Box pos={[3, 0, 0]} size={[13.5, 0.06, 0.5]} r={0.02} color="#E8E8EE" map={tex('stripes', [13, 1], 2)} />
    <Box pos={[3, 0, 1.2]} size={[13.5, 0.06, 0.5]} r={0.02} color="#E8E8EE" map={tex('stripes', [13, 1], 3)} />
    <Instances k="posts" geo={() => { const g = new THREE.BoxGeometry(1, 1, 1); g.translate(0, 0.5, 0); return g; }} items={posts.flatMap((p) => [{...p, p: [p.p[0], 0, -0.35] as V3}, {...p, p: [p.p[0], 0, 0.85] as V3}])} rough={0.6} />
  </group>);
};
export const Bullet: React.FC<{pos: V3; s?: number}> = ({pos, s = 1}) => (<group position={pos} rotation={[0, 0, -Math.PI / 2]} scale={s}>
  <Cyl pos={[0, -0.12, 0]} r={0.06} h={0.18} color="#C08A3A" metal={0.8} rough={0.3} /><Cyl pos={[0, 0.06, 0]} r={0.06} rTop={0.012} h={0.12} color="#D9A24A" metal={0.8} rough={0.3} />
</group>);

// ------------------------------------------------------------------------------------------------ impact cross-section (one layer deep)
export const CrossSection: React.FC<{t: number; boom: number; heat: number}> = ({boom, heat}) => {
  const layers: [number, number, string, string][] = [[0, 2.2, '#5A4A44', 'speckle'], [2.2, 1.6, '#8A6A4A', 'speckle'], [3.8, 0.9, '#B08A5A', 'speckle'], [4.7, 0.3, '#5AA04A', 'grass']];
  return (<group>
    <Box pos={[0, -12, -8]} size={[80, 40, 0.5]} r={0} color="#2A2A3A" cast={false} />
    {layers.map(([y, h, c, k], i) => <Box key={i} pos={[0, y - 5, 0]} size={[12, h, 3]} r={0.02} color={mix(c, '#FF7A30', heat * (i === 3 ? 0.9 : 0.4 / (4 - i)))} map={tex(k as any, [6, 2], 30 + i)} />)}
    {/* the crater bowl + vapour dome */}
    {boom > 0.01 && <><Ball pos={[0, 0, 0]} r={2.4 * boom} scale={[1, 0.75, 0.6]} color="#FFF4D8" emissive="#FFB050" glow={2.6 * (1 - boom * 0.4)} opacity={0.92} cast={false} />
      <Ball pos={[0, 0.2, 0]} r={3.3 * boom} scale={[1, 0.8, 0.6]} color="#FF8A40" emissive="#FF5A10" glow={1.6} opacity={0.35} cast={false} receive={false} /></>}
    {/* heat gauge: a glass tube with a rising red bar */}
    <group position={[4.4, 0, 1.1]}>
      <Cyl pos={[0, -0.2, 0]} r={0.32} h={0.3} color="#E8E8EE" metal={0.3} rough={0.4} />
      <Cyl pos={[0, 0.1, 0]} r={0.18} h={4.6} color="#DDEEFF" opacity={0.35} rough={0.2} cast={false} />
      <Cyl pos={[0, 0.1, 0]} r={0.12} h={0.2 + 4.3 * heat} color={mix('#FF5A3A', '#FFE07A', heat)} emissive="#FF3A10" glow={1.2} />
      {[0, 1, 2, 3, 4].map((i) => <Box key={i} pos={[-0.2, 0.6 + i * 0.95, 0]} size={[0.12, 0.04, 0.04]} r={0} color="#FFFFFF" cast={false} />)}
    </group>
  </group>);
};

// ------------------------------------------------------------------------------------------------ the coast (the wave)
export const Coast: React.FC<{t: number; wave: number; houses: number}> = ({t, wave, houses}) => {
  const palms: V3[] = [[-3.2, 0, 0.2], [3.0, 0, -0.6], [-5.5, 0, -2.5], [5.6, 0, -1.8]];
  const foam = useMemo(() => Array.from({length: 40}, (_, i) => ({p: [-12 + i * 0.62, 0, 0] as V3, s: 0.35 + rnd(i) * 0.3})), []);
  const wz = lerp(-40, 1.6, wave), wh = lerp(1.5, 9, Math.min(1, wave * 1.4));
  return (<group>
    <Ground size={[120, 60]} at={[0, 18]} color="#EAD49A" map={tex('speckle', [40, 20], 3)} />
    <Ground size={[160, 120]} at={[0, -62]} y={0.02} color="#2A8AD8" rough={0.35} map={tex('speckle', [40, 30], 4)} />
    {[-6, -14, -24].map((z, i) => <Box key={z} pos={[0, 0.02, z + 0.4 * loopS(t, 12, i * 0.3)]} size={[80, 0.03, 0.35]} r={0} color="#EAF6FF" rough={0.6} cast={false} />)}
    {palms.map((p, i) => <group key={i} position={p} rotation={[0, i * 1.3, 0.1 * (i % 2 ? 1 : -1)]}>
      <Cyl r={0.14} rTop={0.09} h={3.4} color="#9A7048" map={tex('bricks', [1, 6], 20 + i)} />
      {[0, 1, 2, 3, 4, 5].map((k) => <group key={k} position={[0, 3.4, 0]} rotation={[0, k * 1.05, 0.9 + 0.08 * loopS(t, 14, k * 0.1 + i)]}><Box pos={[0, 0, 0]} size={[0.28, 1.5, 0.05]} r={0.02} color={k % 2 ? '#3E9A48' : '#2F8A3A'} /></group>)}
    </group>)}
    {[-2.2, 0.4, 2.8].map((x, i) => { const s = clamp(houses), tip = (1 - s) * 1.4;
      return <group key={x} position={[x, 0, 1.6 - i * 0.6]} rotation={[tip * 0.6, 0, tip * (i % 2 ? 0.5 : -0.5)]} scale={[1, Math.max(0.05, s), 1]}>
        <Box size={[1.4, 1.1, 1.2]} r={0.04} color={['#F2D0A0', '#A8D8E8', '#F2A8A0'][i]} map={tex('planks', [2, 2], 40 + i)} />
        <Cyl pos={[0, 1.1, 0]} r={1.05} rTop={0.01} h={0.7} seg={4} rot={[0, Math.PI / 4, 0]} color="#C0503A" />
        <Box pos={[0, 0, 0.61]} size={[0.32, 0.65, 0.02]} r={0.01} color="#6A3E2A" cast={false} /></group>; })}
    {wave > 0.01 && <group position={[0, 0, wz]} rotation={[0.18, 0, 0]}>
      <Box pos={[0, 0, 0]} size={[80, wh, 2.4]} r={1.1} color="#1A62A8" rough={0.3} />
      <Box pos={[0, wh * 0.55, 1.0]} size={[80, wh * 0.45, 0.8]} r={0.35} color="#2E86D0" rough={0.3} cast={false} />
      <Instances k="foam" geo={SPH} items={foam.map((f) => ({...f, p: [f.p[0] * 3.3, wh, 1.0] as V3, s: (f.s as number) * Math.max(1, wh * 0.18)}))} color="#F4FBFF" rough={0.8} cast={false} />
    </group>}
  </group>);
};

// ------------------------------------------------------------------------------------------------ prehistoric valley (sepia memory)
export const Prehist: React.FC<{t: number; ball: number}> = ({t, ball}) => {
  const ferns = useMemo(() => Array.from({length: 26}, (_, i) => ({p: [-8 + rnd(i * 3) * 16, 0, -1 - rnd(i * 7) * 10] as V3, s: [0.5 + rnd(i) * 0.6, 0.9 + rnd(i * 5) * 1.4, 0.5 + rnd(i) * 0.6] as V3, c: i % 3 ? '#4E8A3A' : '#6AA048'})), []);
  return (<group>
    <Ground size={[120, 120]} color="#A88A50" map={tex('grass', [40, 40], 5)} />
    <Instances k="ferns" geo={() => { const g = new THREE.ConeGeometry(1, 1, 7); g.translate(0, 0.5, 0); return g; }} items={ferns} rough={0.9} />
    <Cyl pos={[5, 0, -22]} r={9} rTop={2} h={8} color="#6A4A3A" map={tex('speckle', [6, 3], 6)} />
    <Ball pos={[5, 8.1, -22]} r={2.2} scale={[1, 0.3, 1]} color="#FF8A30" emissive="#FF5010" glow={2} cast={false} />
    {[0, 1, 2].map((k) => { const a = ((t * 0.3 + k / 3) % 1); return <Ball key={k} pos={[5 + a * 2, 9 + a * 6, -22]} r={1.5 + a * 2.5} color="#5A4A44" opacity={0.7 * (1 - a)} cast={false} receive={false} />; })}
    {[-6, 6.5].map((x, i) => <group key={x} position={[x, 0, -3 - i]}><Cyl r={0.25} rTop={0.18} h={3} color="#7A5A3A" map={tex('bricks', [1, 5], 50)} />
      {[0, 1, 2, 3, 4].map((k) => <group key={k} position={[0, 3, 0]} rotation={[0, k * 1.25, 1.0]}><Box size={[0.3, 1.7, 0.05]} r={0.02} color="#3E7A30" /></group>)}</group>)}
    <Rock pos={[lerp(-14, -3, ball), lerp(20, 9, ball), -14]} r={1.4} heat={1} trail={1} dir={[0.9, -0.95, 0.2]} seed={7} />
  </group>);
};

// ------------------------------------------------------------------------------------------------ observatory interior
export const Observatory: React.FC<{t: number; open: number; aim?: number}> = ({t, open, aim = 0}) => {
  const ring = useMemo(() => Array.from({length: 24}, (_, i) => { const a = (i / 24) * Math.PI * 2; return {p: [Math.cos(a) * 6, 0, Math.sin(a) * 6 - 2] as V3, r: [0, -a + Math.PI / 2, 0] as V3, s: [1.65, 4.2, 0.2] as V3, c: i % 2 ? '#3E4A6A' : '#46527A'}; }), []);
  return (<group>
    <Ground size={[40, 40]} color="#5A6078" map={tex('tiles', [16, 16], 3)} />
    <Instances k="obsw" geo={() => { const g = new THREE.BoxGeometry(1, 1, 1); g.translate(0, 0.5, 0); return g; }} items={ring} map={tex('panels', [1, 2], 4)} rough={0.8} />
    {/* the dome slit in the back wall: a shutter slides up to reveal the night sky */}
    <Box pos={[0, 4.2, -8.05]} size={[2.4, 6, 0.1]} r={0} color="#0A0E26" emissive="#101640" glow={0.6} cast={false} />
    <Instances k="slitstars" geo={SPH} items={Array.from({length: 30}, (_, i) => ({p: [(rnd(i) - 0.5) * 2.2, 4.4 + rnd(i * 3) * 5.6, -7.98] as V3, s: 0.03 + rnd(i * 7) * 0.04}))} emissive="#FFFFFF" glow={2} cast={false} receive={false} />
    <Ball pos={[0.5, 8.5, -7.96]} r={0.09} color="#FF6A3A" emissive="#FF4A1A" glow={2.5} cast={false} />
    <Box pos={[0, 4.2 + open * 5.8, -7.9]} size={[2.6, 6, 0.2]} r={0.02} color="#9AA4C0" map={tex('panels', [1, 3], 5)} metal={0.3} rough={0.5} />
    {/* the telescope on its mount */}
    <Cyl pos={[0.6, 0, -2.2]} r={0.5} rTop={0.35} h={1.0} color="#E8EAF0" metal={0.2} rough={0.5} />
    <Cyl pos={[0.6, 1.0, -2.2]} r={0.18} h={0.5} color="#C8CCD8" metal={0.4} rough={0.4} />
    <group position={[0.6, 1.6, -2.2]} rotation={[-0.85 - aim * 0.25, 0, 0]}>
      <Cyl pos={[0, -1.2, 0]} r={0.36} h={3.6} color="#F2F4F8" metal={0.2} rough={0.45} />
      <Cyl pos={[0, 2.4, 0]} r={0.4} h={0.25} color="#2A3048" metal={0.5} rough={0.4} />
      <Cyl pos={[0, -1.45, 0]} r={0.39} h={0.18} color="#2A3048" metal={0.5} rough={0.4} />
    </group>
    <Box pos={[-2.6, 0, -1.6]} size={[1.4, 0.8, 0.7]} r={0.03} color="#5A6A8A" map={tex('panels', [2, 1], 6)} />
    {[0, 1, 2].map((i) => <Box key={i} pos={[-3.0 + i * 0.4, 0.8, -1.5]} size={[0.3, 0.22 + 0.1 * loopS(t, 30, i * 0.3) * 0, 0.02]} r={0.01} color="#7AF0C0" emissive="#3AE0A0" glow={1.2} cast={false} />)}
  </group>);
};

// ------------------------------------------------------------------------------------------------ the DART test: Didymos + Dimorphos + the craft
export const Craft: React.FC<{pos: V3; rot?: V3; s?: number}> = ({pos, rot = [0, 0, 0], s = 1}) => (<group position={pos} rotation={rot} scale={s}>
  <Box pos={[0, -0.25, 0]} size={[0.5, 0.5, 0.5]} r={0.03} color="#D9A23A" metal={0.7} rough={0.35} />
  {[-1, 1].map((d) => <group key={d}><Box pos={[d * 0.95, -0.03, 0]} size={[1.3, 0.06, 0.42]} r={0.01} color="#1E3A7A" map={tex('panels', [4, 1], 7)} metal={0.5} rough={0.3} />
    <Cyl pos={[d * 0.3, 0, 0]} rot={[0, 0, Math.PI / 2]} r={0.02} h={0.2} color="#C8C8D0" /></group>)}
  <Cyl pos={[0, 0, 0]} r={0.12} rTop={0.2} h={0.12} color="#E8E8EE" metal={0.5} rough={0.3} />
</group>);

// ------------------------------------------------------------------------------------------------ split stage for the "why" shot
export const Stage: React.FC = () => (<group>
  <Ground size={[60, 60]} at={[-30, 0]} color="#3A2A3E" map={tex('speckle', [20, 20], 3)} />
  <Ground size={[60, 60]} at={[30, 0]} y={0.002} color="#1E3A4E" map={tex('speckle', [20, 20], 4)} />
  <Box pos={[0, 0, -2]} size={[0.14, 2.6, 9]} r={0.02} color="#F4F4F8" />
</group>);
