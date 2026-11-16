import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Ball, Box, Cyl, Ground, Light, V3, tex} from './World3D';
import {mix} from './color';
import {clamp, lerp, rnd} from './math';
import timing from './timing.json';

/* The village: one stylized 3D set seen at every time of day. Three plots in a row (screen left -> right):
 * Ned (x -3.6), Sara (x 0), Blob (x 3.6). Houses stand behind each plot, wheat fields behind the houses,
 * green hills far away. Everything here is a shaded 3D mesh; the cast (Cast.tsx, Birds.tsx) stays flat. */
export const DUR = (timing as any).duration as number;
export const loopS = (t: number, n: number, ph = 0) => Math.sin(2 * Math.PI * (n * t / DUR + ph));   // whole cycles (loop-safe)
export const PLOT = {ned: -3.6, sara: 0, blob: 3.6};
export const BENCH = {v: 'full'};
export const HOUSE_Z = -3.6;
export const COINS: V3 = [0.75, 0, 1.45];
/** Blob's mountain of eggs and coins (the rich ending, and the flash-forward hook) */
export const PILE: V3 = [3.45, 0, 1.0];
export const PILE_H = 1.2;

// ------------------------------------------------------------------------------------------------ light by time of day
export const DAY: Required<Light> = {sun: [-5, 6.5, 4.5], sunColor: '#FFEBC8', sunI: 2.6, sky: '#D8ECFF', bounce: '#D9B27A', ambI: 1.3, fog: ['#F7E6C9', 26, 120], focus: [0, 0, -1], span: 12};
export const NIGHT: Required<Light> = {sun: [4, 6, 3], sunColor: '#8FA6E0', sunI: 1.0, sky: '#4E5E96', bounce: '#3A3044', ambI: 0.95, fog: ['#161D38', 18, 80], focus: [0, 0, -1], span: 12};
export const DAWN: Required<Light> = {sun: [6, 3, 4], sunColor: '#FFC99A', sunI: 2.2, sky: '#F3D6E6', bounce: '#C99A7A', ambI: 1.15, fog: ['#F6CDB8', 22, 110], focus: [0, 0, -1], span: 12};
export const SUNSET: Required<Light> = {sun: [5, 2.6, 5], sunColor: '#FFB46A', sunI: 2.7, sky: '#FFD9B8', bounce: '#D9905A', ambI: 1.2, fog: ['#F7B98A', 24, 110], focus: [2, 0, -0.5], span: 13};
export const GREY: Required<Light> = {sun: [-4, 7, 3], sunColor: '#E4E6EA', sunI: 1.6, sky: '#C9CDD6', bounce: '#9A9590', ambI: 1.35, fog: ['#C9CCD2', 18, 90], focus: [0, 0, -1], span: 12};
export const SKY = {day: ['#5BAEEA', '#FBEBD0'], night: ['#0A1030', '#27306A'], dawn: ['#8DA7E0', '#FFD2B0'], sunset: ['#6E7FD0', '#FFB27A'], grey: ['#9DA6B5', '#D9DCE2']} as Record<string, [string, string]>;
const mixV = (a: V3, b: V3, u: number): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
/** blend two lights (time-lapse) */
export const mixLight = (a: Required<Light>, b: Required<Light>, u: number, focus?: V3, span?: number): Light => ({
  sun: mixV(a.sun, b.sun, u), sunColor: mix(a.sunColor, b.sunColor, u), sunI: lerp(a.sunI, b.sunI, u), sky: mix(a.sky, b.sky, u), bounce: mix(a.bounce, b.bounce, u),
  ambI: lerp(a.ambI, b.ambI, u), fog: [mix(a.fog[0], b.fog[0], u), lerp(a.fog[1], b.fog[1], u), lerp(a.fog[2], b.fog[2], u)], focus: focus ?? a.focus, span: span ?? a.span});
export const mixSky = (a: [string, string], b: [string, string], u: number): [string, string] => [mix(a[0], b[0], u), mix(a[1], b[1], u)];
/** night amount 0..1 -> light + sky */
export const timeOfDay = (night: number, focus?: V3, span?: number) => ({light: mixLight(DAY, NIGHT, clamp(night), focus, span), sky: mixSky(SKY.day, SKY.night, clamp(night))});

// ------------------------------------------------------------------------------------------------ instanced helpers
const useInst = (geo: THREE.BufferGeometry, mat: THREE.Material, n: number) => useMemo(() => { const m = new THREE.InstancedMesh(geo, mat, n); m.castShadow = false; m.receiveShadow = true; m.frustumCulled = false; return m; }, []);
const D = new THREE.Object3D(), C = new THREE.Color();
/** many copies of one shape as ONE draw call (software WebGL pays per draw call, not per triangle) */
export type Inst = {p: V3; s?: V3 | number; r?: V3; c?: string};
export const Instances: React.FC<{geo: () => THREE.BufferGeometry; items: Inst[]; color?: string; map?: THREE.Texture; rough?: number; metal?: number; emissive?: string; glow?: number; cast?: boolean; receive?: boolean; k?: string}> =
  ({geo, items, color = '#FFFFFF', map, rough = 0.85, metal = 0, emissive = '#000000', glow = 0, cast = true, receive = true, k = ''}) => {
  const n = Math.max(1, items.length);
  const mesh = useMemo(() => { const m = new THREE.InstancedMesh(geo(), new THREE.MeshStandardMaterial({color: '#FFFFFF', map: map ?? null, roughness: rough, metalness: metal, emissive: new THREE.Color(emissive), emissiveIntensity: glow}), n);
    m.frustumCulled = false; return m; }, [n, k]);
  mesh.castShadow = cast; mesh.receiveShadow = receive; mesh.count = items.length;
  items.forEach((it, i) => { const sc = it.s ?? 1; D.position.set(...it.p); D.rotation.set(...(it.r ?? [0, 0, 0] as V3)); if (typeof sc === 'number') D.scale.setScalar(sc); else D.scale.set(...sc);
    D.updateMatrix(); mesh.setMatrixAt(i, D.matrix); C.set(it.c ?? color); mesh.setColorAt(i, C); });
  mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  return <primitive object={mesh} />;
};
const SPH = () => new THREE.SphereGeometry(1, 24, 16);


/** a leafy tree: trunk + branches + a crown of ~260 individual leaf cards (one InstancedMesh) + fruit. autumn 0..1 turns leaves orange. */
export const LeafTree: React.FC<{pos: V3; s?: number; seed?: number; t: number; autumn?: number}> = ({pos, s = 1, seed = 1, t, autumn = 0}) => {
  const N = 220;
  const mesh = useMemo(() => {                                       // leaf cards are placed ONCE (static); only colours change with the season
    const m = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.36, 0.24), new THREE.MeshStandardMaterial({side: THREE.DoubleSide, roughness: 0.85}), N);
    m.castShadow = false; m.receiveShadow = true; m.frustumCulled = false;
    for (let i = 0; i < N; i++) {
      const a = rnd(seed * 100 + i) * Math.PI * 2, b = Math.acos(2 * rnd(seed * 200 + i) - 1), r = 1.15 + rnd(seed * 300 + i) * 0.35;
      const cx = [0, -0.8, 0.8, 0.1][i % 4], cy = [0, -0.35, -0.3, 0.55][i % 4], cr = [1, 0.75, 0.75, 0.7][i % 4];
      D.position.set(cx + Math.sin(b) * Math.cos(a) * r * cr, 3.2 + cy + Math.cos(b) * r * cr * 0.85, Math.sin(b) * Math.sin(a) * r * cr);
      D.rotation.set(rnd(i + 7) * 3, rnd(i + 9) * 3, rnd(i + 11) * 3); D.scale.setScalar(0.8 + rnd(i + 13) * 0.5); D.updateMatrix(); m.setMatrixAt(i, D.matrix);
    }
    return m;
  }, [seed]);
  const aKey = Math.round(autumn * 20) / 20;
  useMemo(() => {
    const greens = ['#3E8E3A', '#56A445', '#2F7A34'], fall = ['#E58A2B', '#D9612A', '#F2B33D'];
    for (let i = 0; i < N; i++) { C.set(mix(greens[i % 3], fall[i % 3], clamp(aKey * 1.4 - rnd(i + 17) * 0.4))); mesh.setColorAt(i, C); }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [aKey, mesh]);
  const sway = 0.03 * loopS(t, 10, seed * 0.1);
  return (<group position={pos} scale={s}>
    <Cyl r={0.2} rTop={0.13} h={2.6} color="#7B5236" map={tex('planks', [1, 2], 5)} />

    <group rotation={[0, 0, sway]}>
      <Instances k={'crown' + seed} geo={SPH} map={tex('speckle', [4, 3], seed)} rough={0.95}
        items={[[0, 3.2, 0, 1.05], [-0.8, 2.85, 0, 0.75], [0.8, 2.9, 0, 0.75], [0.1, 3.75, 0, 0.7]].map(([x, y, z, r], i) => ({p: [x, y, z] as V3, s: r, c: mix(['#3B8A37', '#4A9A40'][i % 2], '#D9772B', aKey * 0.8)}))} />
      <primitive object={mesh} />
      <Instances k={'fruit' + seed} geo={SPH} rough={0.5} cast={false} color="#E5484D" items={aKey < 0.5 ? [[0.6, 2.6, 0.7], [-0.5, 2.7, 0.8], [0.2, 3.0, 1.0]].map((p) => ({p: p as V3, s: 0.1})) : []} />
    </group>
  </group>);
};

/** scattered pebbles and grass tufts (instanced) over an area */
const Scatter: React.FC<{seed?: number; n?: number; area: [number, number, number, number]}> = ({seed = 3, n = 70, area}) => {
  const mesh = useInst(useMemo(() => new THREE.IcosahedronGeometry(0.07, 0), []), useMemo(() => new THREE.MeshStandardMaterial({roughness: 0.9}), []), n);
  for (let i = 0; i < n; i++) {
    const tuft = i % 3 === 0;
    D.position.set(lerp(area[0], area[1], rnd(seed + i)), tuft ? 0.05 : 0.02, lerp(area[2], area[3], rnd(seed + i + 400)));
    D.scale.set(tuft ? 0.6 : 0.6 + rnd(i) * 0.9, tuft ? 2.2 : 0.5, tuft ? 0.6 : 0.7 + rnd(i + 3) * 0.6); D.rotation.set(0, rnd(i + 5) * 3, 0); D.updateMatrix(); mesh.setMatrixAt(i, D.matrix);
    C.set(tuft ? (i % 2 ? '#6FA544' : '#5C9A3C') : ['#A89A8A', '#C2B6A4', '#8F8579'][i % 3]); mesh.setColorAt(i, C);
  }
  mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  return <primitive object={mesh} />;
};

/** a wheat field: rows of stalk clusters (instanced). grow 0..1 = height (0 = bare soil). */
const Field: React.FC<{at: [number, number]; w: number; d: number; grow: number; seed?: number}> = ({at, w, d, grow, seed = 1}) => {
  const rows = 9, per = 22, n = rows * per;
  const mesh = useInst(useMemo(() => new THREE.ConeGeometry(0.12, 1, 5), []), useMemo(() => new THREE.MeshStandardMaterial({roughness: 0.8}), []), n);
  for (let i = 0; i < n; i++) {
    const r = Math.floor(i / per), c = i % per, h = Math.max(0.001, grow * (0.75 + rnd(seed + i) * 0.35));
    D.position.set(at[0] - w / 2 + (c + 0.5) * w / per + (rnd(i + 2) - 0.5) * 0.08, h / 2, at[1] - d / 2 + (r + 0.5) * d / rows);
    D.scale.set(1, h, 1); D.rotation.set(0, rnd(i) * 3, 0); D.updateMatrix(); mesh.setMatrixAt(i, D.matrix);
    C.set(r % 2 ? '#E2B94A' : '#D4A93C'); mesh.setColorAt(i, C);
  }
  mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  return (<group>
    <Ground size={[w + 0.6, d + 0.6]} at={at} y={0.006} color="#8A5E3B" map={tex('stripes', [1, rows])} />
    {grow > 0.01 && <primitive object={mesh} />}
  </group>);
};

/** Sara's front door in its frame (hinge on the right edge). x = the house centre. */
export const DOOR_Z = HOUSE_Z + 1.3 + 0.07;
export const Door: React.FC<{x: number; open?: number; frame?: boolean}> = ({x, open = 0, frame = true}) => (<group>
  <group position={[x + 0.3, 0, DOOR_Z]} rotation={[0, open * 1.6, 0]}>
    <Box pos={[-0.45, 0, 0]} size={[0.9, 1.8, 0.1]} color="#7A4A2A" map={tex('planks', [1, 3], 4)} r={0.02} />
    <Ball pos={[-0.78, 0.95, 0.07]} r={0.05} color="#F2C94C" rough={0.3} metal={0.5} />
  </group>
  {frame && <><Box pos={[x - 0.15, 1.8, DOOR_Z]} size={[1.08, 0.1, 0.16]} color="#5E3A22" />
    {[-1, 1].map((sd) => <Box key={sd} pos={[x - 0.15 + sd * 0.5, 0, DOOR_Z]} size={[0.08, 1.85, 0.16]} color="#5E3A22" />)}</>}
</group>);
/** a cottage: cream walls, gable roof, a window, a chimney, a door. up 0..1 (0 = sunk into the ground). keepDoor = the
 *  front door stays standing when the house is gone (Sara's gag). doorOpen 0..1 swings it open. */
export const House: React.FC<{x: number; z?: number; up: number; wall: string; roof: string; keepDoor?: boolean; doorOpen?: number}> = ({x, z = HOUSE_Z, up, wall, roof, keepDoor, doorOpen = 0}) => {
  const W = 3.0, H = 2.4, Dp = 2.6, sink = (1 - up) * 4.6;
  return (<group>
    {up > 0.01 && <group position={[0, -sink, 0]}>
      <Box pos={[x, 0, z]} size={[W, H, Dp]} color={wall} map={tex('speckle', [3, 2], 8)} r={0.05} />
      {[-1, 1].map((sd) => <Box key={sd} pos={[x, H - 0.02 + 0.55, z + sd * 0.7]} rot={[sd * 0.62, 0, 0]} size={[W + 0.4, 0.14, 1.9]} color={roof} map={tex('stripes', [12, 1], 2)} r={0.03} />)}
      <Box pos={[x + 0.85, 0.95, z + Dp / 2]} size={[0.7, 0.65, 0.1]} color="#9CC9EE" rough={0.25} />
      <Box pos={[x + 0.85, 0.9, z + Dp / 2 + 0.05]} size={[0.86, 0.08, 0.12]} color="#FFFFFF" />
      <Box pos={[x - 1.05, 0, z - 0.4]} size={[0.36, 3.6, 0.36]} color="#B7AFA6" map={tex('bricks', [1, 4], 3)} r={0.02} />
      {!keepDoor && <Door x={x} frame={false} />}
    </group>}
    {keepDoor && <Door x={x} open={doorOpen} />}
  </group>);
};

/** a stack pile of gold coins; amt 0..1 */
const COIN_ITEMS: Inst[] = ([[0, 0, 0, 7], [0.24, 0, 0.12, 5], [-0.2, 0, 0.14, 4], [0.05, 0, -0.22, 6], [-0.05, 0, 0.3, 2]] as number[][]).flatMap(([x, y, z, n], i) =>
  Array.from({length: n}, (_, j) => ({p: [x + (rnd(i * 9 + j) - 0.5) * 0.02, y + j * 0.045 + 0.021, z] as V3})));
export const Coins: React.FC<{pos: V3; amt: number}> = ({pos, amt}) => amt <= 0.01 ? null : (<group position={pos} scale={[1, amt, 1]}>
  <Instances k="coins" geo={() => new THREE.CylinderGeometry(0.1, 0.1, 0.042, 20)} items={COIN_ITEMS} color="#F2C230" rough={0.35} metal={0.6} />
</group>);

/** sky dressing: drifting clouds, the sun disc or the moon on an arc. dayPhase: 0 = noon, 0.5 = midnight (for time-lapses). */
export const SkyDress: React.FC<{t: number; night: number; dayPhase?: number}> = ({t, night, dayPhase}) => {
  const ph = dayPhase ?? (night > 0.5 ? 0.5 : 0);
  const a = ph * Math.PI * 2;                                          // sun arc angle (0 = high)
  const sun: V3 = [Math.sin(a) * 40, 26 + Math.cos(a) * 22, -70], moon: V3 = [-Math.sin(a) * 40, 26 - Math.cos(a) * 22, -70];
  const drift = (i: number) => 6 * loopS(t, 1, i * 0.21);
  return (<group>
    <Instances k="clouds" geo={SPH} cast={false} receive={false} rough={1} color={mix('#FFFFFF', '#5A6488', night * 0.8)}
      items={[[-14, 17, -48, 1.3], [12, 19, -55, 1.6], [2, 23, -70, 2.0], [-26, 21, -62, 1.4], [26, 15, -45, 1.1]].flatMap(([x, y, z, sc], i) =>
        [[0, 0, 0, 1.6], [1.5, -0.3, 0.2, 1.2], [-1.5, -0.35, 0, 1.1], [0.6, 0.8, -0.2, 1.1], [-0.7, 0.6, 0.1, 1.0]].map(([a, b, c, r]) =>
          ({p: [x + drift(i) + a * sc, y + b * sc, z + c * sc] as V3, s: r * sc, c: mix('#FFFFFF', '#5A6488', night * 0.8)})))} />
    {sun[1] > 2 && <Ball pos={sun} r={3.2} color="#FFF3C4" emissive="#FFE08A" glow={1.4} cast={false} receive={false} />}
    {moon[1] > 2 && night > 0.2 && <Ball pos={moon} r={2.4} color="#F2F0E6" emissive="#E8E6DA" glow={1.1 * night} cast={false} receive={false} />}
  </group>);
};

// ------------------------------------------------------------------------------------------------ farm pieces (later in the story)
/** Blob's chicken coop: grows in (0..1) */
export const Coop: React.FC<{pos: V3; grow: number; big?: number}> = ({pos, grow, big = 0}) => grow <= 0.01 ? null : (<group position={pos} scale={grow * (1 + big * 0.6)}>
  <Box pos={[0, 0.3, 0]} size={[2.0, 1.3, 1.5]} color="#C0533A" map={tex('planks', [3, 2], 6)} r={0.04} />
  {[0, 1, 2, 3].map((i) => <Cyl key={i} pos={[(i % 2 ? 0.9 : -0.9), 0, (i < 2 ? 0.65 : -0.65)]} r={0.06} h={0.32} color="#7B5236" />)}
  {[-1, 1].map((sd) => <Box key={sd} pos={[0, 1.78, sd * 0.42]} rot={[sd * 0.7, 0, 0]} size={[2.3, 0.1, 1.15]} color="#F2EBDD" map={tex('stripes', [10, 1], 2)} r={0.02} />)}
  <Box pos={[0.35, 0.45, 0.76]} size={[0.5, 0.55, 0.06]} color="#4A2A1A" r={0.02} />
  <Box pos={[0.35, 0.02, 1.15]} rot={[-0.55, 0, 0]} size={[0.42, 0.04, 0.9]} color="#B58A5A" map={tex('planks', [1, 3], 3)} r={0.01} />
</group>);
/** Sara's small hut (comfortable): grows in (0..1) */
export const Hut: React.FC<{pos: V3; grow: number}> = ({pos, grow}) => grow <= 0.01 ? null : (<group position={pos} scale={grow}>
  <Box size={[1.9, 1.6, 1.6]} color="#E9D3A8" map={tex('planks', [2, 2], 9)} r={0.04} />
  {[-1, 1].map((sd) => <Box key={sd} pos={[0, 1.62 + 0.36, sd * 0.45]} rot={[sd * 0.68, 0, 0]} size={[2.2, 0.12, 1.25]} color="#C7A04A" map={tex('grass', [3, 2], 4)} r={0.02} />)}
  <Box pos={[-0.45, 0.6, 0.81]} size={[0.5, 0.42, 0.06]} color="#9CC9EE" rough={0.25} />
</group>);
/** a straw basket of eggs */
export const Basket: React.FC<{pos: V3; eggs: number; s?: number}> = ({pos, eggs, s = 1}) => (<group position={pos} scale={s}>
  <Cyl r={0.22} rTop={0.28} h={0.2} color="#C99A55" map={tex('planks', [6, 1], 5)} />
  {Array.from({length: Math.round(eggs)}, (_, i) => <Egg key={i} pos={[Math.cos(i * 2.4) * 0.11 * Math.min(1, i / 2), 0.2 + (i > 5 ? 0.06 : 0), Math.sin(i * 2.4) * 0.11 * Math.min(1, i / 2)]} />)}
</group>);
export const Egg: React.FC<{pos: V3; s?: number; color?: string; glow?: number}> = ({pos, s = 1, color = '#F6EBD9', glow = 0}) =>
  <Ball pos={pos} r={0.055 * s} scale={[1, 1.28, 1]} color={color} rough={0.45} emissive="#FFD27A" glow={glow} />;
/** campfire with a 3D pot (Ned's dinner). on 0..1 = flames, pot = show the pot */
export const Campfire: React.FC<{pos: V3; t: number; on: number; pot?: boolean}> = ({pos, t, on, pot = true}) => (<group position={pos}>
  {[0, 1, 2, 3, 4, 5].map((i) => <Ball key={'s' + i} pos={[Math.cos(i * 1.05) * 0.42, 0.06, Math.sin(i * 1.05) * 0.42]} r={0.11} scale={[1, 0.7, 1]} color="#8F8A84" map={tex('speckle', [2, 2], 30 + i)} />)}
  {[0, 1, 2, 3].map((i) => <Cyl key={i} pos={[Math.cos(i * 1.6) * 0.14, 0.06, Math.sin(i * 1.6) * 0.14]} rot={[Math.PI / 2, 0, i * 0.8]} r={0.05} h={0.6} color="#5E4330" map={tex('planks', [1, 2], 11)} />)}
  {on > 0.01 && [[0, 0, 0.5, '#FF8A1F'], [-0.1, 0.05, 0.36, '#FFB224'], [0.11, -0.04, 0.4, '#FF6A1A'], [0.02, 0.08, 0.26, '#FFE08A']].map(([x, z, h, c], i) =>
    <Cyl key={'f' + i} pos={[x as number, 0.08, z as number]} r={0.11} rTop={0} h={(h as number) * on * (1 + 0.16 * Math.sin(t * (11 + i * 3) + i))} seg={10} color={c as string} emissive={c as string} glow={1.7} rough={1} cast={false} receive={false} />)}
  {on > 0.01 && <pointLight position={[0, 0.7, 0.3]} color="#FF9A3C" intensity={10 * on * (1 + 0.1 * Math.sin(t * 13))} distance={8} decay={1.5} />}
  {pot && <group>
    {[-1, 1].map((sd) => <Cyl key={sd} pos={[sd * 0.4, 0, 0]} r={0.025} h={0.9} color="#3A2A20" />)}
    <Cyl pos={[0, 0.88, 0]} rot={[0, 0, Math.PI / 2]} r={0.02} h={0.84} color="#3A2A20" />
    <Cyl pos={[0, 0.42, 0]} r={0.2} rTop={0.24} h={0.3} color="#3B3F46" rough={0.4} metal={0.5} />
  </group>}
</group>);


// ------------------------------------------------------------------------------------------------ the rich ending props
const PILE_ITEMS: {p: V3; coin: boolean; r: V3}[] = Array.from({length: 260}, (_, i) => {
  const h = Math.pow(rnd(i * 3 + 1), 0.75), a = rnd(i * 7 + 2) * Math.PI * 2, rad = (1 - h) * 1.35 + 0.06;
  return {p: [Math.cos(a) * rad, h * PILE_H + 0.04, Math.sin(a) * rad] as V3, coin: i % 3 === 0, r: [rnd(i) * 3, rnd(i + 1) * 3, rnd(i + 2) * 3] as V3};
});
/** a mountain of eggs with coins mixed in. fly 0..1 = everything blows up into the sky (the reset). */
export const EggPile: React.FC<{amt?: number; fly?: number}> = ({amt = 1, fly = 0}) => amt <= 0.01 ? null : (<group position={PILE} scale={[1, amt, 1]}>
  {fly < 0.35 && <Cyl r={1.38} rTop={0.1} h={PILE_H * (1 - fly * 2)} color="#EBD9B4" map={tex('speckle', [4, 2], 21)} rough={0.7} />}
  {[false, true].map((coin) => <Instances key={String(coin)} k={'pile' + coin} geo={coin ? () => new THREE.CylinderGeometry(0.075, 0.075, 0.03, 16) : SPH} rough={coin ? 0.35 : 0.45} metal={coin ? 0.6 : 0}
    color={coin ? '#F2C230' : '#F6EBD9'} items={PILE_ITEMS.filter((it) => it.coin === coin).map((it, i) => { const f = clamp(fly * 1.6 - rnd(i + 40) * 0.6);
      return {p: [it.p[0] * (1 + f * 3), it.p[1] + f * f * 14, it.p[2] * (1 + f * 3)] as V3, r: [it.r[0] + f * 9, it.r[1], it.r[2] + f * 7] as V3, s: coin ? 1.3 : [0.07, 0.09, 0.07] as V3}; })} />)}
</group>);
const COOPS: [number, number, number][] = [[5.6, -1.4, 0.15], [5.9, -3.6, 0.3], [3.0, -3.9, 0.45], [7.4, -2.5, 0.6], [1.9, -2.6, 0.75], [7.3, 0.2, 0.9]];
/** the farm grows: extra coops pop in as n goes 0..1 */
export const MoreCoops: React.FC<{n: number}> = ({n}) => <>{COOPS.map(([x, z, at], i) => n > at ? <Coop key={i} pos={[x, 0, z]} grow={Math.min(1, (n - at) * 8)} /> : null)}</>;
/** the white lines that split the village into three plots (grow 0..1) */
export const PlotLines: React.FC<{grow: number}> = ({grow}) => grow <= 0.01 ? null : <>{[-1.8, 1.8].map((x) =>
  <Box key={x} pos={[x, 0.012, 3 - 4.5 * grow]} size={[0.07, 0.02, 9 * grow]} r={0} color="#FFFFFF" emissive="#FFFFFF" glow={0.5} cast={false} />)}</>;
/** Sara's small picket fence (comfortable) */
export const Fence: React.FC<{grow: number}> = ({grow}) => grow <= 0.01 ? null : (<group position={[PLOT.sara - 0.4, 0, 1.75]} scale={[1, grow, 1]}>
  {Array.from({length: 9}, (_, i) => <Box key={i} pos={[-1.6 + i * 0.4, 0, 0]} size={[0.07, 0.5, 0.05]} r={0.01} color="#FFFFFF" />)}
  <Box pos={[0, 0.32, 0]} size={[3.3, 0.06, 0.04]} r={0} color="#FFFFFF" />
</group>);

// ------------------------------------------------------------------------------------------------ the whole village
export type VState = {houses?: number; saraHouse?: number; coins?: number; fields?: number; night?: number; dayPhase?: number; autumn?: number;
  coop?: number; coopBig?: number; hut?: number; doorOpen?: number; fire?: number; firePot?: boolean; pile?: number; pileFly?: number; coops?: number; lines?: number; fence?: number};
export const Village: React.FC<{t: number; s?: VState}> = ({t, s = {}}) => {
  const {houses = 1, saraHouse, coins = 1, fields = 1, night = 0, dayPhase, autumn = 0, coop = 0, coopBig = 0, hut = 0, doorOpen = 0, fire = -1, firePot = true, pile = 0, pileFly = 0, coops = 0, lines = 0, fence = 0} = s;
  if (BENCH.v === 'empty') return <Ground size={[260, 260]} color="#86B94F" />;
  return (<>
    <Ground size={[260, 260]} color="#86B94F" map={tex('grass', [90, 90], 2)} />
    <Ground size={[16, 9]} at={[0, -1.4]} y={0.008} color="#D9B27C" map={tex('speckle', [16, 9], 4)} />
    <Ground size={[16, 1.3]} at={[0, 2.6]} y={0.01} color="#C99E68" map={tex('speckle', [16, 2], 6)} />
    {BENCH.v !== 'noscatter' && <Scatter area={[-8, 8, -5.5, 3]} n={80} />}
    {BENCH.v !== 'nohouses' && <><House x={PLOT.ned} up={houses} wall="#F1DDBA" roof="#C8553D" />
    <House x={PLOT.sara} up={saraHouse ?? houses} wall="#E8E2D2" roof="#8C5A7A" keepDoor doorOpen={doorOpen} />
    <House x={PLOT.blob} up={houses} wall="#F4D0A6" roof="#4F7FA8" /></>}
    {BENCH.v !== 'nofields' && <><Field at={[-4.5, -10.5]} w={7.5} d={6} grow={fields} seed={1} />
    <Field at={[4.5, -10.5]} w={7.5} d={6} grow={fields} seed={2} /></>}
    {BENCH.v !== 'notrees' && <><LeafTree pos={[-7.6, 0, -4.4]} s={1.15} seed={3} t={t} autumn={autumn} />
    <LeafTree pos={[7.8, 0, -5.2]} s={1.25} seed={5} t={t} autumn={autumn} />
    <LeafTree pos={[-1.8, 0, -7.2]} s={0.95} seed={7} t={t} autumn={autumn} />
    <LeafTree pos={[11, 0, -12]} s={1.4} seed={9} t={t} autumn={autumn} /></>}
    <Instances k="hills" geo={SPH} map={tex('speckle', [8, 4], 50)} cast={false} items={[[-30, -60, 18], [10, -75, 24], [42, -64, 20], [-55, -80, 26]].map(([x, z, r], i) => ({p: [x, -r * 0.55, z] as V3, s: [r * 1.6, r, r] as V3, c: ['#7FB25A', '#6FA650', '#8ABD62', '#76AA55'][i]}))} />
    <Coins pos={COINS} amt={coins} />
    {BENCH.v !== 'nosky' && <SkyDress t={t} night={night} dayPhase={dayPhase} />}
    {fire >= 0 && <Campfire pos={[PLOT.ned + 0.7, 0, 0.2]} t={t} on={fire} pot={firePot} />}
    <Coop pos={[PLOT.blob + 0.2, 0, -1.6]} grow={coop} big={coopBig} />
    <Hut pos={[PLOT.sara - 1.5, 0, -1.9]} grow={hut} />
    <EggPile amt={pile} fly={pileFly} />
    <MoreCoops n={coops} />
    <PlotLines grow={lines} />
    <Fence grow={fence} />
  </>);
};
