/* "$20 an hour to $1 million" - the 3D sets and props (stylized 3D: modelled, textured, lit, shadowed).
 * US-only money: green dollar bills and gold coins with a $ mark (stylized, not copies of real banknotes).
 * Places: the MONEY STAGE (treadmill + wall clock, glass jar, gold bar chart drawn to scale) and the YOGA STUDIO. */
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Ball, Box, Cyl, Ground, Instances, Inst, Light, V3, tex} from './World3D';
import {clamp, eout, lerp, prog, rnd, smooth} from './math';
import {lvl} from './detail';

// ---------------------------------------------------------------- palette (one per place)
export const PAL = {
  navy: '#1E3557', navyDeep: '#152844', gold: '#F2C230', goldDeep: '#C9971C', cream: '#F4EBDD', green: '#2E9E5B', bill: '#8CC08A',
  red: '#E5484D', glass: '#CFEFFF', steel: '#AEB6C2', rubber: '#2B2E35',
  wood: '#C99A62', sage: '#B9CDB0', sageDeep: '#8FAE86', mat: ['#E85D9E', '#56CCF2', '#F2994A', '#8E5BD6', '#4CAF50'],
};
export const LIGHT_DAY: Light = {sun: [-4, 8, 6], sunColor: '#FFF4E0', sunI: 2.5, sky: '#E4EEFF', bounce: '#D9C9B0', ambI: 1.3, fog: ['#E6EDF7', 30, 120], focus: [0, 0, -1], span: 12};
export const LIGHT_GREY: Light = {sun: [-4, 8, 6], sunColor: '#E8E8EE', sunI: 1.6, sky: '#C9CDD6', bounce: '#9A9AA2', ambI: 1.05, fog: ['#C9CDD6', 24, 90], focus: [-1.6, 0, 0], span: 9};
export const LIGHT_GOLD: Light = {sun: [5, 3.6, 6], sunColor: '#FFC27A', sunI: 2.9, sky: '#FFE2B8', bounce: '#E0A86A', ambI: 1.5, fog: ['#FFD9A8', 28, 110], focus: [1, 0, -2], span: 16};
export const LIGHT_YOGA: Light = {sun: [6, 6, 4], sunColor: '#FFE9C4', sunI: 2.4, sky: '#F4F1E6', bounce: '#D8B88C', ambI: 1.25, fog: ['#F1E8D8', 26, 110], focus: [0, 0, -1], span: 12};
export const SKY_STAGE: [string, string] = ['#2A4A75', '#1E3557'];
export const SKY_GOLD: [string, string] = ['#F7A95C', '#FFE0B0'];
export const SKY_YOGA: [string, string] = ['#C9DCC2', '#EFE6D4'];
/** mix two lights (finale -> frame-0 look during the CTA glide) */
export const mixLight = (a: Light, b: Light, u: number): Light => {
  const c = (x?: string, y?: string) => { const p = new THREE.Color(x), q = new THREE.Color(y); return '#' + p.lerp(q, u).getHexString(); };
  const v = (x?: V3, y?: V3): V3 => [lerp(x![0], y![0], u), lerp(x![1], y![1], u), lerp(x![2], y![2], u)];
  return {sun: v(a.sun, b.sun), sunColor: c(a.sunColor, b.sunColor), sunI: lerp(a.sunI!, b.sunI!, u), sky: c(a.sky, b.sky), bounce: c(a.bounce, b.bounce), ambI: lerp(a.ambI!, b.ambI!, u),
    fog: [c(a.fog![0], b.fog![0]), lerp(a.fog![1], b.fog![1], u), lerp(a.fog![2], b.fog![2], u)], focus: v(a.focus, b.focus), span: lerp(a.span!, b.span!, u)};
};
export const mixSky = (a: [string, string], b: [string, string], u: number): [string, string] => {
  const c = (x: string, y: string) => '#' + new THREE.Color(x).lerp(new THREE.Color(y), u).getHexString(); return [c(a[0], b[0]), c(a[1], b[1])];
};

// ---------------------------------------------------------------- money textures (code-drawn; stylized US look)
const cache = new Map<string, THREE.CanvasTexture>();
const canvasTex = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  const hit = cache.get(key); if (hit) return hit;
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d')!);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; cache.set(key, t); return t;
};
/** a green bill: border, an oval portrait frame (empty), a big $ and "20" corners - stylized, not a real note */
export const billTex = (val = '20') => canvasTex('bill' + val, 512, 220, (g) => {
  g.fillStyle = '#B9D9A8'; g.fillRect(0, 0, 512, 220);
  g.strokeStyle = '#3E7A4A'; g.lineWidth = 10; g.strokeRect(10, 10, 492, 200); g.lineWidth = 3; g.strokeRect(24, 24, 464, 172);
  g.fillStyle = '#9CC98A'; g.beginPath(); g.ellipse(256, 110, 62, 74, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#3E7A4A'; g.lineWidth = 5; g.stroke();
  g.fillStyle = '#2F6B3C'; g.font = '900 96px Inter, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('$', 256, 114);
  g.font = '900 46px Inter, sans-serif'; g.fillText(val, 70, 62); g.fillText(val, 442, 62); g.fillText(val, 70, 160); g.fillText(val, 442, 160);
});
/** coin face: gold disc with a raised ring and a $ */
export const coinTex = () => canvasTex('coin', 256, 256, (g) => {
  g.fillStyle = '#F2C230'; g.fillRect(0, 0, 256, 256);
  g.strokeStyle = '#B98A14'; g.lineWidth = 12; g.beginPath(); g.arc(128, 128, 108, 0, Math.PI * 2); g.stroke();
  g.fillStyle = '#B98A14'; g.font = '900 150px Inter, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('$', 128, 136);
});
/** clock face: cream with 12 bold ticks */
const clockTex = () => canvasTex('clock', 512, 512, (g) => {
  g.fillStyle = '#FFF8EA'; g.fillRect(0, 0, 512, 512);
  g.strokeStyle = '#1E3557'; g.lineCap = 'round';
  for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2, big = i % 5 === 0, r0 = big ? 200 : 222;
    g.lineWidth = big ? 16 : 5; g.beginPath(); g.moveTo(256 + Math.sin(a) * r0, 256 - Math.cos(a) * r0); g.lineTo(256 + Math.sin(a) * 240, 256 - Math.cos(a) * 240); g.stroke(); }
});
const COIN_GEO = () => { const gm = new THREE.CylinderGeometry(0.11, 0.11, 0.035, 28); return gm; };

/** one coin (faces textured) lying flat or spinning */
export const Coin: React.FC<{pos: V3; rot?: V3; s?: number}> = ({pos, rot = [0, 0, 0], s = 1}) => {
  const face = coinTex();
  return (<group position={pos} rotation={rot} scale={s}>
    <mesh castShadow receiveShadow><cylinderGeometry args={[0.11, 0.11, 0.035, 32]} />
      <meshStandardMaterial attach="material-0" color="#D9A81E" roughness={0.35} metalness={0.6} />
      <meshStandardMaterial attach="material-1" map={face} roughness={0.35} metalness={0.45} />
      <meshStandardMaterial attach="material-2" map={face} roughness={0.35} metalness={0.45} />
    </mesh></group>);
};
/** a $20 bill (flat box with the bill texture on top) */
export const Bill: React.FC<{pos: V3; rot?: V3; s?: number; val?: string}> = ({pos, rot = [0, 0, 0], s = 1, val = '20'}) =>
  <group position={pos} rotation={rot} scale={s}><mesh castShadow receiveShadow><boxGeometry args={[0.62, 0.006, 0.27]} />
    {[0, 1].map((i) => <meshStandardMaterial key={i} attach={`material-${i}`} color="#9CC98A" roughness={0.9} />)}
    <meshStandardMaterial attach="material-2" map={billTex(val)} roughness={0.9} /><meshStandardMaterial attach="material-3" map={billTex(val)} roughness={0.9} />
    {[4, 5].map((i) => <meshStandardMaterial key={i} attach={`material-${i}`} color="#9CC98A" roughness={0.9} />)}
  </mesh></group>;
/** a pile of coins (instanced): `n` coins in a rough heap around `at`, radius r */
export const CoinHeap: React.FC<{at: V3; n: number; r: number; h?: number; seed?: number; k?: string}> = ({at, n, r, h = 0.5, seed = 1, k = 'heap'}) => {
  const items = useMemo<Inst[]>(() => Array.from({length: n}, (_, i) => {
    const a = rnd(i * 3 + seed) * Math.PI * 2, d = Math.sqrt(rnd(i * 7 + seed)) * r, y = h * (1 - (d / r) ** 2) * rnd(i * 11 + seed) ** 0.5;
    return {p: [at[0] + Math.cos(a) * d, at[1] + 0.02 + y, at[2] + Math.sin(a) * d] as V3, r: [(rnd(i + 5) - 0.5) * 0.8, rnd(i) * 6, (rnd(i + 9) - 0.5) * 0.8] as V3};
  }), [n, r, h, seed, at[0], at[1], at[2]]);
  return <Instances k={k + n} geo={COIN_GEO} map={coinTex()} color="#F2C230" rough={0.35} metal={0.55} items={items} />;
};

// ---------------------------------------------------------------- the money stage
export const TREAD = {x: -1.6, z: 0.2, top: 0.2};        // treadmill: Blob runs facing +x on its belt (top at y 0.2)
export const CLOCK = {x: -1.6, y: 3.25, z: -5.75, r: 1.05};
export const JAR = {x: 0.5, z: -0.9, r: 0.62, h: 1.7};
export const BARS = {x: [1.55, 2.15, 2.75], z: -2.4, w: 0.5, perYear: 1.7 / 24};   // to scale: 24 y = 1.7 m, 28 = 1.98 m, 140 = 9.9 m
export type StageState = {
  belt?: number;          // belt travel (metres) - drives the slats
  clockT?: number;        // clock hours shown (hands)
  jar?: number;           // 0..1 coin fill of the jar
  jarBill?: number;       // 0..1 the single $20 bill lying in the jar (visible > 0)
  bars?: [number, number, number];   // years shown by each bar (0 = hidden)
  barsOn?: boolean;
  treadOn?: boolean; jarOn?: boolean;
};
const Slats: React.FC<{belt: number}> = ({belt}) => {
  const L = 2.0, n = 14, items: Inst[] = [];
  for (let i = 0; i < n; i++) { const x = ((i / n * L - belt) % L + L) % L - L / 2; items.push({p: [TREAD.x + x, TREAD.top - 0.005, TREAD.z], s: [1, 1, 1]}); }
  return <Instances k="slats" geo={() => new THREE.BoxGeometry(0.06, 0.012, 0.66)} color="#3A3E47" rough={0.7} items={items} cast={false} />;
};
export const Treadmill: React.FC<{belt: number}> = ({belt}) => (<group>
  <Box pos={[TREAD.x, 0, TREAD.z]} size={[2.3, 0.14, 0.95]} color={PAL.steel} rough={0.45} metal={0.3} r={0.05} />
  <Box pos={[TREAD.x, 0.13, TREAD.z]} size={[2.1, 0.06, 0.72]} color={PAL.rubber} rough={0.8} r={0.02} />
  <Slats belt={belt} />
  {[-0.4, 0.4].map((dz) => <Cyl key={dz} pos={[TREAD.x + 1.0, 0.14, TREAD.z + dz]} r={0.035} h={1.05} color={PAL.steel} rough={0.4} metal={0.4} />)}
  <Box pos={[TREAD.x + 1.0, 1.16, TREAD.z]} size={[0.16, 0.08, 0.95]} color={PAL.steel} rough={0.4} metal={0.4} r={0.03} />
  <Box pos={[TREAD.x + 1.05, 1.12, TREAD.z]} size={[0.32, 0.26, 0.6]} rot={[0, 0, 0.35]} color="#2B3E5E" rough={0.5} r={0.04} />
  <Box pos={[TREAD.x + 0.98, 1.24, TREAD.z]} size={[0.02, 0.12, 0.42]} rot={[0, 0, 0.35]} color="#58E0A4" emissive="#58E0A4" glow={0.9} r={0.005} cast={false} />
</group>);
export const WallClock: React.FC<{hours: number; x?: number; y?: number; z?: number; r?: number}> = ({hours, x = CLOCK.x, y = CLOCK.y, z = CLOCK.z, r = CLOCK.r}) => {
  const hA = -(hours / 12) * Math.PI * 2, mA = -(hours % 1) * Math.PI * 2;
  return (<group position={[x, y, z]}>
    <mesh rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[r + 0.08, r + 0.08, 0.14, 64]} /><meshStandardMaterial color={PAL.gold} roughness={0.35} metalness={0.6} /></mesh>
    <mesh position={[0, 0, 0.075]}><circleGeometry args={[r, 64]} /><meshStandardMaterial map={clockTex()} roughness={0.8} /></mesh>
    <group position={[0, 0, 0.1]} rotation={[0, 0, hA]}><mesh position={[0, r * 0.26, 0]}><boxGeometry args={[0.09, r * 0.55, 0.03]} /><meshStandardMaterial color={PAL.navyDeep} roughness={0.6} /></mesh></group>
    <group position={[0, 0, 0.12]} rotation={[0, 0, mA]}><mesh position={[0, r * 0.38, 0]}><boxGeometry args={[0.055, r * 0.8, 0.03]} /><meshStandardMaterial color={PAL.red} roughness={0.6} /></mesh></group>
    <mesh position={[0, 0, 0.14]}><cylinderGeometry args={[0.07, 0.07, 0.04, 24]} /><meshStandardMaterial color={PAL.gold} metalness={0.6} roughness={0.35} /></mesh>
  </group>);
};
/** big glass jar with a coin fill (0..1) */
export const Jar: React.FC<{fill: number; bill?: number; x?: number; z?: number; r?: number; h?: number}> = ({fill, bill = 0, x = JAR.x, z = JAR.z, r = JAR.r, h = JAR.h}) => {
  const fh = clamp(fill) * (h - 0.25);
  return (<group>
    <Cyl pos={[x, 0, z]} r={r + 0.06} h={0.12} color={PAL.navyDeep} rough={0.5} />
    {fh > 0.01 && <><Cyl pos={[x, 0.12, z]} r={r - 0.03} h={fh} color={PAL.gold} map={tex('speckle', [3, 2], 4)} rough={0.4} metal={0.45} />
      <CoinHeap at={[x, 0.12 + fh, z]} n={lvl(14, 26)} r={r - 0.12} h={0.06} seed={3} k={'top' + Math.round(fh * 20)} /></>}
    {bill > 0 && <Bill pos={[x + 0.05, 0.14 + fh, z + 0.05]} rot={[0, 0.5, 0]} s={0.85} />}
    <mesh position={[x, 0.12 + h / 2, z]} castShadow={false} renderOrder={5}><cylinderGeometry args={[r, r, h, 48, 1, true]} />
      <meshStandardMaterial color={PAL.glass} transparent opacity={0.22} roughness={0.08} metalness={0.1} side={THREE.DoubleSide} depthWrite={false} /></mesh>
    <mesh position={[x, 0.12 + h, z]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[r, 0.035, 10, 48]} /><meshStandardMaterial color="#E6F6FF" transparent opacity={0.6} roughness={0.1} /></mesh>
  </group>);
};
/** the gold bar chart, to scale (years -> metres). Bars grow from the floor. */
export const BarChart: React.FC<{years: [number, number, number]; colors?: string[]}> = ({years, colors = [PAL.gold, '#F29A30', PAL.red]}) => (<group>
  <Box pos={[BARS.x[1], 0, BARS.z]} size={[2.0, 0.08, 0.9]} color={PAL.navyDeep} rough={0.5} r={0.03} />
  {years.map((y, i) => y <= 0.01 ? null : <Box key={i} pos={[BARS.x[i], 0.08, BARS.z]} size={[BARS.w, Math.max(0.02, y * BARS.perYear), BARS.w]} color={colors[i]} rough={0.35} metal={0.35} r={0.04} map={tex('speckle', [1, 4], 9 + i)} />)}
</group>);
/** the stage itself: cream tile floor, navy panelled back wall with gold trim, side wall, ceiling lights */
export const StageSet: React.FC = () => {
  const pc = lvl(false, true);
  return (<group>
    <Ground color={PAL.cream} map={tex('tiles', [26, 26], 5)} rough={0.55} size={[60, 60]} />
    <Box pos={[0, 0, -6.2]} size={[22, 9, 0.3]} color={PAL.navy} map={tex('panels', [11, 4], 2)} rough={0.7} r={0} />
    {[0.06, 2.6, 5.6].map((y) => <Box key={y} pos={[0, y, -6.02]} size={[22, 0.08, 0.06]} color={PAL.gold} rough={0.3} metal={0.6} r={0.01} />)}
    <Box pos={[-7.5, 0, -1]} size={[0.3, 9, 14]} color={PAL.navyDeep} map={tex('panels', [6, 4], 3)} rough={0.7} r={0} />
    <Box pos={[0, 0, -5.9]} size={[22, 0.4, 0.3]} color={PAL.navyDeep} rough={0.6} r={0.02} />
    {/* big $ coin medallions on the back wall + spotlights */}
    {[4.6, -4.4].map((x) => <group key={x}><Coin pos={[x, 4.1, -5.95]} rot={[Math.PI / 2, 0, 0]} s={4.2} /></group>)}
    {(pc ? [-5, -2.5, 0, 2.5, 5] : [-3, 0, 3]).map((x) => <group key={'l' + x}><Cyl pos={[x, 6.4, -5.6]} r={0.16} h={0.22} color="#2B2E35" rough={0.5} />
      <Ball pos={[x, 6.36, -5.45]} r={0.1} color="#FFF4D0" emissive="#FFE6A0" glow={1.4} cast={false} /></group>)}
    {pc && <>{/* plant + rope barrier posts for a fuller set */}
      {[-5.2, 5.4].map((x) => <group key={'p' + x}><Cyl pos={[x, 0, -4.8]} r={0.32} rTop={0.4} h={0.6} color={PAL.navyDeep} rough={0.6} />
        {[0, 1, 2, 3, 4].map((i) => <Ball key={i} pos={[x + Math.cos(i * 1.3) * 0.25, 0.95 + (i % 3) * 0.22, -4.8 + Math.sin(i * 1.3) * 0.2]} r={0.32} color={i % 2 ? '#3E8E5A' : '#4FA86A'} rough={0.9} />)}</group>)}
      {[-4, -2, 0, 2, 4].map((x) => <group key={'b' + x}><Cyl pos={[x, 0, 3.6]} r={0.12} h={0.06} color={PAL.gold} metal={0.6} rough={0.3} /><Cyl pos={[x, 0, 3.6]} r={0.035} h={0.95} color={PAL.gold} metal={0.6} rough={0.3} /></group>)}
    </>}
  </group>);
};

// ---------------------------------------------------------------- explanation props
/** a 3D pie chart on a pedestal: the big slice (rent, food) slides away, the 20% slice stays and glows */
export const Pie: React.FC<{at: V3; slide: number; glow: number; r?: number}> = ({at, slide, glow, r = 0.55}) => {
  const big = 0.8 * Math.PI * 2, dir = 0.8 * Math.PI;     // the big slice's mid-angle
  const off = slide * 2.2;
  return (<group position={at}>
    <Cyl pos={[0, -1.0, 0]} r={0.24} rTop={0.16} h={0.86} color={PAL.navyDeep} rough={0.5} />
    <group position={[Math.sin(dir) * off, -slide * 0.3, Math.cos(dir) * off]} rotation={[0, 0, slide * 0.4]}>
      <mesh castShadow receiveShadow><cylinderGeometry args={[r, r, 0.26, 48, 1, false, 0, big]} /><meshStandardMaterial color="#6F7C93" roughness={0.6} /></mesh>
      {/* a little house + a grocery bag ride on the big slice: rent and food */}
      <Box pos={[Math.sin(dir) * r * 0.5, 0.11, Math.cos(dir) * r * 0.5]} size={[0.22, 0.16, 0.2]} color="#F2F0EA" r={0.01} />
      <mesh position={[Math.sin(dir) * r * 0.5, 0.33, Math.cos(dir) * r * 0.5]} rotation={[0, Math.PI / 4, 0]}><coneGeometry args={[0.19, 0.14, 4]} /><meshStandardMaterial color={PAL.red} roughness={0.7} /></mesh>
      <Box pos={[Math.sin(dir + 0.9) * r * 0.55, 0.11, Math.cos(dir + 0.9) * r * 0.55]} size={[0.16, 0.2, 0.12]} color="#C9A06A" r={0.01} />
      <Ball pos={[Math.sin(dir + 0.9) * r * 0.55, 0.34, Math.cos(dir + 0.9) * r * 0.55]} r={0.06} color={PAL.red} />
    </group>
    <mesh castShadow receiveShadow><cylinderGeometry args={[r * 1.02, r * 1.02, 0.3, 24, 1, false, big, Math.PI * 2 - big]} />
      <meshStandardMaterial color={PAL.green} emissive={PAL.green} emissiveIntensity={0.15 + 0.5 * glow} roughness={0.45} /></mesh>
  </group>);
};
/** a paper grocery bag with bread + apple, for "prices double" */
export const GroceryBag: React.FC<{pos: V3; s?: number}> = ({pos, s = 1}) => (<group position={pos} scale={s}>
  <Box size={[0.3, 0.34, 0.2]} color="#C9A06A" map={tex('speckle', [1, 1], 11)} r={0.01} />
  <Box pos={[-0.06, 0.3, 0]} size={[0.1, 0.16, 0.08]} color="#E8B868" r={0.03} rot={[0, 0, 0.2]} />
  <Ball pos={[0.07, 0.36, 0.02]} r={0.065} color={PAL.red} />
  <Cyl pos={[0.04, 0.3, -0.05]} r={0.04} h={0.2} color="#F4F4F4" />
</group>);
/** two bars capped by icons (a clock = time, a coin = rate) that rise into a glass ceiling */
export const TimeRateBars: React.FC<{at: V3; hT: number; hR: number; bonk: number; ceilY: number; ceilShow: number; shatter: number; third?: number}> =
  ({at, hT, hR, bonk, ceilY, ceilShow, shatter, third = 0}) => {
  const sq = 1 - 0.12 * bonk;
  return (<group position={at}>
    <Box pos={[-0.55, 0, 0]} size={[0.44, Math.max(0.02, hT * sq), 0.44]} color="#5B8DEF" rough={0.4} metal={0.2} r={0.04} />
    <WallClock hours={2.2} x={-0.55} y={Math.max(0.02, hT * sq) + 0.24} z={0} r={0.2} />
    <Box pos={[0.55, 0, 0]} size={[0.44, Math.max(0.02, hR * sq), 0.44]} color={PAL.green} rough={0.4} metal={0.2} r={0.04} />
    <Coin pos={[0.55, Math.max(0.02, hR * sq) + 0.24, 0]} rot={[Math.PI / 2, 0, 0]} s={1.9} />
    {third > 0.01 && <Box pos={[1.75, 0, 0]} size={[0.5, third, 0.5]} color={PAL.gold} rough={0.3} metal={0.45} r={0.05} map={tex('speckle', [1, 6], 13)} />}
    {ceilShow > 0.01 && shatter < 1 && (shatter <= 0
      ? <Box pos={[0.6, ceilY, 0]} size={[3.4, 0.07, 1.4]} color={PAL.glass} opacity={0.45 * ceilShow} rough={0.05} r={0.02} cast={false} />
      : <Instances k="shards" geo={() => new THREE.BoxGeometry(0.22, 0.04, 0.18)} color={PAL.glass} rough={0.05} cast={false} items={Array.from({length: 40}, (_, i) => {
          const sx = (rnd(i) - 0.5) * 3.2 + 0.6, sz = (rnd(i + 40) - 0.5) * 1.3, u = shatter, out = 1 + u * 2.4;
          return {p: [0.6 + (sx - 0.6) * out, ceilY + u * 2.0 - 4 * u * u * (0.3 + rnd(i + 80)), sz * out] as V3, r: [u * 9 * rnd(i + 3), u * 7, u * 5 * rnd(i + 7)] as V3, s: 1 - u * 0.5};
        })} />)}
  </group>);
};
/** a light bulb on a little base (a problem solved); glow 0..1 */
export const Bulb: React.FC<{pos: V3; glow: number; s?: number}> = ({pos, glow, s = 1}) => (<group position={pos} scale={s}>
  <Cyl r={0.07} h={0.1} color={PAL.steel} metal={0.5} rough={0.35} />
  <Ball pos={[0, 0.2, 0]} r={0.13} color={glow > 0.2 ? '#FFF2A6' : '#E8EEF3'} emissive="#FFD84A" glow={2.2 * glow} cast={false} />
</group>);

// ---------------------------------------------------------------- the yoga studio (why shot)
export const YOGA = {blob: [-1.75, 0, -0.4] as V3, student: [-0.15, 0, -0.5] as V3, tripod: [0.85, 0, 2.2] as V3, hallZ0: -3.0};
/** viewer mats along a diagonal hall behind the studio (instanced), revealed by `n` (0..count) */
export const VIEWERS: V3[] = (() => { const out: V3[] = []; for (let r = 0; r < 9; r++) for (let c = 0; c < 6; c++) out.push([-2.2 + c * 1.05 + r * 0.55, 0, YOGA.hallZ0 - r * 1.25]); return out; })();
export const YogaSet: React.FC<{t: number; hall: number; rec: number}> = ({t, hall, rec}) => {
  const pc = lvl(false, true);
  const shown = Math.round(hall * VIEWERS.length);
  return (<group>
    <Ground color={PAL.wood} map={tex('planks', [14, 30], 4)} rough={0.7} size={[40, 60]} at={[2, -12]} />
    <Box pos={[-4.2, 0, -1]} size={[0.25, 5, 10]} color={PAL.sage} map={tex('speckle', [4, 3], 6)} rough={0.9} r={0} />
    {hall < 0.05 && <Box pos={[0, 0, -2.6]} size={[12, 5, 0.25]} color={PAL.sage} map={tex('speckle', [6, 3], 7)} rough={0.9} r={0} />}
    {hall < 0.05 && <><Box pos={[1.6, 1.0, -2.45]} size={[2.2, 1.8, 0.08]} color="#FFF3D6" emissive="#FFE9B8" glow={0.6} r={0.02} cast={false} />
      <Box pos={[1.6, 1.88, -2.42]} size={[2.3, 0.08, 0.12]} color="#F7F7F2" r={0.02} /><Box pos={[1.6, 0.98, -2.42]} size={[0.06, 1.8, 0.12]} color="#F7F7F2" r={0.01} />
      <WallClock hours={t * 0.6} x={-0.95} y={2.75} z={-2.4} r={0.34} /></>}
    {/* the live class: two mats */}
    <Box pos={[YOGA.blob[0], 0, YOGA.blob[2]]} size={[0.7, 0.015, 1.7]} color={PAL.mat[1]} rough={0.8} r={0.006} />
    <Box pos={[YOGA.student[0], 0, YOGA.student[2]]} size={[0.7, 0.015, 1.7]} color={PAL.mat[0]} rough={0.8} r={0.006} />
    {[-3.4, 3.4].map((x, i) => (pc || i === 0) && <group key={x}><Cyl pos={[x, 0, -2.0]} r={0.26} rTop={0.32} h={0.5} color="#E8DCC6" rough={0.8} />
      {[0, 1, 2, 3, 4, 5].map((j) => <Ball key={j} pos={[x + Math.cos(j * 1.1) * 0.22, 0.75 + (j % 3) * 0.18, -2.0 + Math.sin(j * 1.1) * 0.18]} r={0.24} color={j % 2 ? '#3E8E5A' : '#5DB56F'} rough={0.9} />)}</group>)}
    {/* rolled mats in a corner */}
    {pc && [0, 1, 2].map((i) => <Cyl key={'r' + i} pos={[-3.7, 0.12, 0.4 + i * 0.3]} rot={[Math.PI / 2, 0, 0]} r={0.12} h={0.7} color={PAL.mat[i + 2]} rough={0.8} />)}
    {/* camera on a tripod, filming the class */}
    <group position={YOGA.tripod}>
      {[0, 2.1, 4.2].map((a) => <Cyl key={a} pos={[Math.sin(a) * 0.22, 0, Math.cos(a) * 0.22]} rot={[Math.cos(a) * -0.2, 0, Math.sin(a) * 0.2]} r={0.018} h={1.25} color="#2B2E35" rough={0.5} />)}
      <Box pos={[0, 1.2, 0]} size={[0.34, 0.24, 0.22]} color="#2B2E35" rough={0.45} r={0.03} />
      <Cyl pos={[-0.17, 1.32, 0]} rot={[0, 0, Math.PI / 2]} r={0.08} h={0.16} color="#1A1C21" rough={0.3} />
      <Ball pos={[0.1, 1.48, 0.12]} r={0.035} color="#FF3B3B" emissive="#FF3B3B" glow={rec * 2.5} cast={false} />
    </group>
    {/* the hall of viewers' mats (thousands, shown as a long diagonal of mats) */}
    {shown > 0 && <Instances k={'vm' + shown} geo={() => new THREE.BoxGeometry(0.62, 0.015, 1.1)} rough={0.8} cast={false}
      items={VIEWERS.slice(0, shown).map((p, i) => ({p: [p[0], 0.008, p[2]] as V3, c: PAL.mat[i % 5]}))} />}
  </group>);
};
/** coins raining into a pile (yoga payoff, finale) - instanced; u = time since start */
export const CoinRain: React.FC<{at: V3; u: number; n?: number; spread?: number; k?: string}> = ({at, u, n = 40, spread = 1.4, k = 'rain'}) => {
  if (u <= 0) return null;
  const items: Inst[] = [];
  for (let i = 0; i < n; i++) { const st = rnd(i * 5) * 1.6, v = Math.max(0, u - st);   // fixed count: not-yet-falling coins at scale 0
    const y = Math.max(0.05, 3.6 - 9.8 * 0.5 * v * v), x = at[0] + (rnd(i) - 0.5) * spread, z = at[2] + (rnd(i + 99) - 0.5) * spread * 0.6;
    items.push({p: [x, at[1] + y, z], r: [v * 8 + i, v * 5, i], s: u - st < 0 ? 0.0001 : 1}); }
  return <Instances k={k} geo={COIN_GEO} map={coinTex()} color="#F2C230" rough={0.35} metal={0.55} items={items} />;
};
export {prog, smooth, eout};
