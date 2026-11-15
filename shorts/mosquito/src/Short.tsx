/* "Why mosquitoes pick you and ignore your friend" - harry-animator v3.
 * Flat 2D cel cast (Mia, Otto, flat mosquitoes, a lab crowd) composited into stylized 3D sets: a golden-hour patio, a bright lab, a skin cross-section. */
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import timing from './timing.json';
import {Captions, SafeGuides} from './Captions';
import {Person, PersonPose} from './Cast';
import {Cta, ThumbText} from './Cta';
import {Ball, Box, Cam3, Cel, Cuts, Cyl, Ground, Light, V3, World, cam3At, celPoint, tex} from './World3D';
import * as THREE from 'three';
import {useK} from './Layer';
import {INK, mix} from './color';
import {bump, clamp, kfs, lerp, pop, prog, rnd, smooth, spring} from './math';

const T = timing as any; const K = T.keys as Record<string, number>; const S = T.sentences as {start: number; end: number}[];
export const DURATION = T.duration as number; const END = DURATION;
const TAU = Math.PI * 2;
const loopS = (t: number, n: number, ph = 0) => Math.sin(TAU * (n * t / DURATION + ph));      // whole cycles over the video (loop-safe)

// ---- cuts: each lands just before its phrase
const C = {
  otto: K.ignore - 0.1, mia: S[1].start - 0.1, labWide: S[2].start - 0.1, swarm: K.single - 0.1, least: K.least - 0.25,
  skin: S[3].start - 0.1, bact: S[4].start - 0.1, sniff: K.personal - 0.1, lab2: S[5].start - 0.1, three: K.three - 0.1, crowd: K.nineteen - 0.85,
  nobody: S[6].start - 0.1, scents: S[7].start - 0.1, magnet: S[8].start - 0.1, wide2: K.which - 0.15, tonight: K.tonight - 0.15, end: K.subscribe - 0.2,
};

// ---------------------------------------------------------------- cast (fixed for the whole video)
const MIA = {shirt: '#E4572E', hair: '#4A2C1E', hairStyle: 'ponytail' as const};
const OTTO = {shirt: '#2F6FD6', vest: '#F2C230', hat: 'beanie' as const, hatColor: '#1F2F5C', glasses: true, hair: '#8A8A90', hairStyle: 'short' as const};
const Mia: React.FC<PersonPose> = (p) => <Person {...p} id={p.id} outfit={MIA} />;
const Otto: React.FC<PersonPose> = (p) => <Person {...p} id={p.id} outfit={OTTO} />;
const CROWD = ['#7C4DFF', '#2BAE66', '#F2C230', '#E85D9A', '#16A5B8', '#8D6E63', '#EF8A17', '#5B7BD6'];
const HAIRS = ['#1F1B1A', '#C9822B', '#4A2C1E', '#E8C766', '#2B2B33'];

/** flat cartoon mosquito (feet at (0,0), body about y -130, faces right; flip with <Cel flip>) */
const Skeeter: React.FC<{color: string; flap: number; sniff?: number}> = ({color, flap, sniff = 0}) => {
  const k = useK(); const ow = 8 / k; const dk = mix(color, '#000000', 0.38); const wy = 0.25 + 0.75 * Math.abs(flap);
  return (<g>
    <g stroke={INK} strokeWidth={ow * 0.55} fill="none" strokeLinecap="round" strokeLinejoin="round">
      {[[34, -112, 62, -40, 84, -6], [14, -108, 24, -44, 20, -4], [-6, -108, -34, -46, -52, -8]].map((l, i) => <path key={i} d={`M ${l[0]} ${l[1]} L ${l[2]} ${l[3]} L ${l[4]} ${l[5]}`} />)}
      <path d={`M 84 -150 Q ${104 + sniff * 6} ${-186} ${124 + sniff * 10} ${-190 - sniff * 6}`} /><path d={`M 76 -152 Q ${88 + sniff * 4} ${-196} ${104 + sniff * 8} ${-212 - sniff * 4}`} />
    </g>
    {[-1, 1].map((s) => <ellipse key={s} cx={s < 0 ? -2 : 26} cy={-168} rx={76} ry={26} transform={`rotate(${s < 0 ? -18 : -42} ${s < 0 ? -2 : 26} -168) translate(0 -168) scale(1 ${wy}) translate(0 168)`} fill="#FFFFFF" stroke={INK} strokeWidth={ow * 0.7} opacity={s < 0 ? 0.92 : 1} />)}
    <ellipse cx={-34} cy={-124} rx={66} ry={23} fill={color} stroke={INK} strokeWidth={ow} />
    {[-10, -40, -68].map((x) => <path key={x} d={`M ${x} ${-144} Q ${x + 6} ${-124} ${x} ${-104}`} stroke={dk} strokeWidth={ow * 0.8} fill="none" strokeLinecap="round" />)}
    <circle cx={40} cy={-132} r={30} fill={color} stroke={INK} strokeWidth={ow} />
    <circle cx={80} cy={-134} r={22} fill={color} stroke={INK} strokeWidth={ow} />
    <ellipse cx={86} cy={-140} rx={8} ry={11} fill={INK} />
    <path d={`M 98 -130 L ${170 + sniff * 6} ${-112 + sniff * 6}`} stroke={INK} strokeWidth={ow * 0.7} strokeLinecap="round" />
  </g>);
};
type Path = [number, V3][];
const pathAt = (t: number, ks: Path): V3 => [0, 1, 2].map((i) => kfs(t, ks.map(([tt, v]) => [tt, v[i]] as [number, number]))) as V3;
const SK = {red: '#D9453D', green: '#4DAA57', yellow: '#F2C230', grey: '#7E8794'};
/** a mosquito hovering at `at` (body centre height), facing `dir` */
const Fly: React.FC<{at: V3; t: number; color: string; h?: number; dir?: 1 | -1; sniff?: number; seed?: number; tilt?: number}> = ({at, t, color, h = 0.42, dir = 1, sniff = 0, seed = 0, tilt = 0}) => {
  const bob = 0.03 * loopS(t, 65, seed * 0.13); const base = at[1] - 0.3 * h + bob;
  return (<Cel at={[at[0], 0, at[2]]} lift={base} h={h} flip={dir < 0} shadow={false}>
    <g transform={`rotate(${tilt * dir} 0 -130)`}><Skeeter color={color} flap={loopS(t, 520, seed * 0.07)} sniff={sniff} /></g>
  </Cel>);
};

// ---------------------------------------------------------------- the patio (golden hour; Shot 1 and the ending)
const PATIO: Light = {sun: [-6, 4.2, 4.5], sunColor: '#FFD8A0', sunI: 2.7, sky: '#CFE3FF', bounce: '#B9C98B', ambI: 1.25, fog: ['#F8DDB5', 22, 80], focus: [0, 0, -1], span: 10};
const SKY_PATIO: [string, string] = ['#79B6EE', '#FBDDB8'];
const Patio: React.FC<{t: number}> = ({t}) => (<>
  <Ground size={[200, 200]} color="#6FA84A" map={tex('grass', [70, 70], 3)} />
  <Box pos={[0, 0, -1.4]} size={[7.4, 0.07, 5.2]} color="#D2C3A8" map={tex('tiles', [6, 4], 5)} r={0.02} />
  {Array.from({length: 26}, (_, i) => <Box key={i} pos={[-6.2 + i * 0.5, 0, -6.2]} size={[0.44, 1.9 + 0.12 * rnd(i), 0.08]} color="#B07A48" map={tex('planks', [1, 2], 20 + i)} r={0.01} />)}
  {[[-3.8, -9.5, 1.1], [3.9, -9, 1.3]].map(([x, z, s], i) => (<group key={i} position={[x, 0, z]} scale={s}>
    <Cyl r={0.3} rTop={0.2} h={3.0} color="#7A5A3A" map={tex('planks', [2, 3], 11)} />
    {[[0, 3.9, 0, 1.7], [-1.1, 3.4, 0.3, 1.2], [1.2, 3.5, 0, 1.25], [0.1, 4.6, -0.3, 1.0]].map(([a, b, c, r], j) => <Ball key={j} pos={[a, b, c]} r={r} scale={[1, 0.85, 1]} color={['#3E8F3E', '#357F37', '#47A044'][j % 3]} map={tex('speckle', [6, 4], 30 + j)} rough={0.9} />)}
  </group>))}
  {[[-3.3, -5.4, 0.8], [-1.6, -5.5, 0.6], [2.2, -5.5, 0.75], [3.6, -5.3, 0.9]].map(([x, z, r], i) => <Ball key={i} pos={[x, r * 0.7, z]} r={r} scale={[1.2, 0.85, 1]} color={['#3B8A3A', '#4A9B45'][i % 2]} map={tex('speckle', [4, 3], 50 + i)} />)}
  {[[-0.8, -4.4], [0.9, -4.8], [2.6, -4.3]].map(([x, z], i) => <group key={i} position={[x, 0, z]}><Cyl r={0.16} rTop={0.2} h={0.3} color="#B5532F" /><Ball pos={[0, 0.42, 0]} r={0.2} color={['#E85D9A', '#F2C230', '#FFFFFF'][i]} rough={0.8} /></group>)}
  {Array.from({length: 15}, (_, i) => { const u = i / 14; return <Ball key={i} pos={[-4.2 + 8.4 * u, 2.7 - 0.5 * Math.sin(Math.PI * u), -4.2]} r={0.07} color="#FFF3C4" emissive="#FFE08A" glow={2} cast={false} />; })}
  <Box pos={[3.6, 0, -2.2]} size={[0.5, 0.55, 0.5]} color="#8A8F98" map={tex('speckle', [2, 2], 9)} />
</>);
const TABLE_Z = -0.15; const MIA_AT: V3 = [-0.68, 0, -0.95], OTTO_AT: V3 = [0.68, 0, -0.95];
const GLASS: V3 = [0.95, 0.7, TABLE_Z];
const Table: React.FC = () => (<group position={[0, 0, TABLE_Z]}>
  <Box pos={[0, 0.7, 0]} size={[2.7, 0.06, 1.05]} color="#C98A52" map={tex('planks', [3, 1], 8)} r={0.015} />
  <Box pos={[0, 0, 0.03]} size={[2.6, 0.7, 0.95]} color="#EB6A5E" map={tex('checker', [6, 2], 2)} r={0.02} />
  <Cyl pos={[GLASS[0], 0.76, 0]} r={0.075} rTop={0.09} h={0.2} color="#FFE27A" rough={0.2} opacity={0.82} cast={false} />
  <Cyl pos={[-1.0, 0.76, 0.05]} r={0.17} rTop={0.2} h={0.05} color="#F5F0E6" rough={0.4} />
  <Ball pos={[-1.0, 0.86, 0.05]} r={0.1} color="#E5533D" rough={0.5} />
</group>);
const CAM0: Cam3 = {pos: [0.0, 1.5, 6.6], look: [0, 0.62, -0.8], fov: 36};
const swat = (t: number) => loopS(t, 59);
const redAmt = (t: number) => kfs(t, [[0, 1], [C.mia + 0.05, 1], [C.mia + 0.5, 0], [END - 1.15, 0], [END - 0.45, 1]]);
const MiaPat: React.FC<{t: number; angry?: boolean; mood?: 'hook' | 'puzzle' | 'smug'}> = ({t, mood = 'hook'}) => {
  const r = redAmt(t); const sw = swat(t) * (mood === 'hook' ? 1 : 0); const hook = mood === 'hook';
  return <Mia id="mia" spots={1} tint="#E5484D" tintAmt={r} steam={r} t={(t / DURATION) * 58 / 1.6}
    view="front" eyes={hook ? 'squeeze' : mood === 'puzzle' ? 'wide' : 'closed'} mouth={hook ? 'teeth' : mood === 'puzzle' ? 'o' : 'smirk'} brow={hook ? 1 : mood === 'puzzle' ? -0.6 : 0} browUp={mood === 'puzzle' ? 1 : 0}
    handR={hook ? [96 + 26 * sw, -318 + 52 * sw] : mood === 'puzzle' ? [100, -250] : [74, -128]} handL={hook ? [-80, -140] : mood === 'puzzle' ? [-100, -250] : [-74, -128]}
    headTilt={hook ? 3 * sw : mood === 'puzzle' ? 7 : -4} bounce={hook ? 3 * Math.abs(sw) : 0} sweat={r > 0.8 ? 0 : 0} />;
};
const OttoPat: React.FC<{t: number; frozen?: number}> = ({t, frozen = 0}) => (
  <Otto id="otto" view="front" eyes={frozen > 0.5 ? 'wide' : 'closed'} mouth={frozen > 0.5 ? 'wavy' : 'smile'} browUp={frozen > 0.5 ? 1 : 0.2}
    handR={[80, -178]} handL={[-74, -128]} headTilt={frozen > 0.5 ? 0 : -3 + 2 * loopS(t, 3)} sweat={frozen} bounce={frozen > 0.5 ? 0 : 2 + 2 * loopS(t, 14)} />);
const glassAt = (cam: Cam3): V3 => celPoint(cam, OTTO_AT, 1.7, [80, -178]);

// frame-0 mosquito: it hovers by Mia's face, and returns there at the end (loop)
const M0: V3 = [-0.28, 1.72, -0.35];
const mosqShot1 = (t: number): V3 => pathAt(t, [[0, M0], [K.pick - 0.35, [-0.15, 1.95, -0.3]], [K.pick + 0.3, [-0.55, 1.5, -0.2]], [K.ignore - 0.15, [0.0, 1.95, -0.3]], [K.ignore + 0.5, [1.0, 1.8, -0.3]]]);
const Shot1: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[0, CAM0], [C.otto, {pos: [0.0, 1.45, 5.8], look: [0, 0.7, -0.8], fov: 33}]]);
  const m = mosqShot1(t); const g = glassAt(cam);
  return (<World cam={cam} light={PATIO} sky={SKY_PATIO} scene={<Patio t={t} />} front={<Table />}>
    <Cel at={MIA_AT}><MiaPat t={t} /></Cel>
    <Cel at={OTTO_AT}><OttoPat t={t} /></Cel>
    <Fly at={m} t={t} color={SK.grey} dir={t > K.pick + 0.35 ? 1 : 1} tilt={-8} />
  </World>);
};
const OttoClose: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.otto, {pos: [0.2, 1.45, 5.0], look: [0.78, 0.9, -0.9], fov: 30}], [C.mia, {pos: [0.45, 1.4, 4.0], look: [0.78, 1.0, -0.9], fov: 28}]]);
  const m = pathAt(t, [[C.otto, [-1.0, 1.8, -0.3]], [C.mia, [1.9, 1.8, -0.3]]]);
  return (<World cam={cam} light={{...PATIO, focus: [0.8, 1, -0.8], span: 6}} sky={SKY_PATIO} scene={<Patio t={t} />} front={<Table />}>
    <Cel at={OTTO_AT}><OttoPat t={t} /></Cel>
    <Fly at={m} t={t} color={SK.grey} h={0.5} tilt={-6} />
  </World>);
};
const MiaClose: React.FC<{t: number; from: number; to: number}> = ({t, from, to}) => {
  const cam = cam3At(t, [[from, {pos: [-1.3, 1.5, 5.0], look: [-0.68, 0.95, -0.95], fov: 30}], [to, {pos: [-1.1, 1.45, 4.1], look: [-0.68, 1.0, -0.95], fov: 28}]]);
  return (<World cam={cam} light={{...PATIO, focus: [-0.8, 1, -0.8], span: 6}} sky={SKY_PATIO} scene={<Patio t={t} />} front={<Table />}>
    <Cel at={MIA_AT}><MiaPat t={t} mood="puzzle" /></Cel>
  </World>);
};

// ---------------------------------------------------------------- the lab
const LAB: Light = {sun: [5, 8, 6], sunColor: '#F4FBFF', sunI: 2.3, sky: '#E2F4F6', bounce: '#DDE6E8', ambI: 1.55, fog: ['#E6F4F6', 24, 90], focus: [0, 0, -1], span: 9};
const SKY_LAB: [string, string] = ['#CDEBEC', '#EAF6F6'];
const Lab: React.FC = () => (<>
  <Ground size={[40, 40]} color="#EEF3F4" map={tex('tiles', [20, 20], 4)} rough={0.4} />
  <Box pos={[0, 0, -4.6]} size={[18, 4.4, 0.3]} color="#3FB3B0" map={tex('panels', [8, 2], 6)} />
  <Box pos={[-2.6, 0.95, -4.35]} size={[2.2, 1.2, 0.1]} color="#BDE9F7" emissive="#BDE9F7" glow={0.9} cast={false} />
  <Box pos={[2.4, 0.95, -4.35]} size={[2.2, 1.2, 0.1]} color="#BDE9F7" emissive="#BDE9F7" glow={0.9} cast={false} />
  <Box pos={[0, 0, -3.9]} size={[7.5, 0.95, 0.9]} color="#C9D1D6" rough={0.35} metal={0.35} />
  {[['#E85D9A', -2.8, 0.2], ['#F2C230', -2.2, 0.26], ['#4DAA57', 2.1, 0.22], ['#7C4DFF', 2.7, 0.18], ['#E4572E', 3.2, 0.24]].map(([c, x, r], i) =>
    <Cyl key={i} pos={[x as number, 0.95, -3.95]} r={r as number} h={0.45 + 0.1 * i} color={c as string} rough={0.2} opacity={0.82} cast={false} />)}
  <Box pos={[0, 0.95, -3.85]} size={[1.5, 0.08, 0.7]} color="#F7FBFC" rough={0.3} />
</>);
const Swarm: React.FC<{t: number; c: V3; R: number; n: number}> = ({t, c, R, n}) => {
  const N = 90;
  const mesh = React.useMemo(() => { const m = new THREE.InstancedMesh(new THREE.SphereGeometry(0.036, 8, 6), new THREE.MeshStandardMaterial({color: '#1B1B1F', roughness: 0.8}), N); m.frustumCulled = false; return m; }, []);
  const d = new THREE.Object3D();
  for (let i = 0; i < N; i++) {
    const a = TAU * ((30 + Math.floor(rnd(i) * 50)) * t / DURATION + rnd(i + 3)), rr = R * (0.45 + 0.55 * rnd(i + 9)), y = c[1] + (rnd(i + 4) - 0.5) * R * 1.9 + 0.1 * Math.sin(TAU * (7 * t / DURATION + rnd(i)));
    d.position.set(c[0] + Math.cos(a) * rr, y, c[2] + Math.sin(a) * rr * 0.5); d.scale.setScalar(i < n ? 1 : 0); d.updateMatrix(); mesh.setMatrixAt(i, d.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true; return <primitive object={mesh} />;
};
const LabWide: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.labWide, {pos: [0.2, 1.6, 7.4], look: [0, 0.75, -1.0], fov: 36}], [C.swarm, {pos: [0.1, 1.6, 6.4], look: [0, 0.75, -1.0], fov: 36}]]);
  return (<World cam={cam} light={LAB} sky={SKY_LAB} scene={<Lab />}>
    <Cel at={[-0.7, 0, -1.2]}><Mia id="mia" spots={0} eyes="dot" mouth="smile" handL={[-74, -128]} handR={[74, -128]} blink={bump(t, C.labWide + 0.5, C.labWide + 0.66)} /></Cel>
    <Cel at={[0.7, 0, -1.2]}><Otto id="otto" eyes="dot" mouth="smile" handL={[-74, -128]} handR={[74, -128]} /></Cel>
  </World>);
};
const SwarmShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.swarm, {pos: [0.0, 1.6, 5.9], look: [0, 0.8, -1.0], fov: 36}], [K.hundred + 0.2, {pos: [0.0, 1.8, 6.6], look: [0, 0.85, -1.0], fov: 38}], [C.least, {pos: [0.0, 1.8, 6.6], look: [0, 0.85, -1.0], fov: 37}]]);
  const n = kfs(t, [[K.single, 3], [K.hundred - 0.3, 14], [K.hundred + 0.9, 70]]);
  const swatI = kfs(t, [[K.hundred, 0], [K.hundred + 0.7, 1]]);
  return (<World cam={cam} light={LAB} sky={SKY_LAB} scene={<><Lab /><Swarm t={t} c={[-0.75, 1.15, -1.0]} R={0.7} n={n} /><Swarm t={t + 3} c={[0.75, 1.35, -1.0]} R={0.01} n={1} /></>}>
    <Cel at={[-0.75, 0, -1.2]}><Mia id="mia" spots={swatI} eyes={swatI > 0.2 ? 'squeeze' : 'wide'} mouth={swatI > 0.2 ? 'wavy' : 'o'} browUp={0.8} brow={swatI > 0.2 ? 0.8 : 0}
      handL={[-70 - 18 * loopS(t, 59), -170 + 70 * swatI]} handR={[70 + 18 * loopS(t, 59, 0.25), -200 + 90 * swatI]} headTilt={swatI > 0.2 ? 4 * loopS(t, 59) : 0} sweat={swatI} /></Cel>
    <Cel at={[0.75, 0, -1.2]}><Otto id="otto" eyes="dot" mouth="smile" browUp={0.2} handL={[-74, -128]} handR={[74, -128]} blink={bump(t, C.swarm + 0.9, C.swarm + 1.06)} /></Cel>
  </World>);
};
const LeastShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.least, {pos: [0.9, 1.5, 5.0], look: [0.9, 1.0, -1.0], fov: 29}], [C.skin, {pos: [0.7, 1.5, 4.4], look: [0.9, 1.0, -1.0], fov: 27}]]);
  const m = pathAt(t, [[C.least, [1.3, 1.9, -0.6]], [C.least + 0.8, [1.0, 1.75, -0.6]], [C.skin, [1.25, 1.95, -0.6]]]);
  return (<World cam={cam} light={{...LAB, focus: [0.9, 1, -1], span: 6}} sky={SKY_LAB} scene={<Lab />}>
    <Cel at={[0.9, 0, -1.2]}><Otto id="otto" eyes="dot" mouth="smirk" handL={[-74, -128]} handR={[74, -128]} browUp={0.3} headTilt={-4} blink={bump(t, C.least + 1.0, C.least + 1.16)} /></Cel>
    <Fly at={m} t={t} color={SK.grey} h={0.42} dir={-1} tilt={6} />
  </World>);
};

// ---------------------------------------------------------------- skin cross-section (macro, one layer deep)
const SKIN_L: Light = {sun: [-3, 6, 5], sunColor: '#FFE9D0', sunI: 2.4, sky: '#FFE4DA', bounce: '#B77E78', ambI: 1.35, fog: ['#6A4A5C', 9, 30], focus: [0, 0.6, 0], span: 6};
const SKY_SKIN: [string, string] = ['#4B3548', '#7A5668'];
const DROPS: [number, number][] = [[-1.1, 0.4], [-0.5, -0.3], [0.1, 0.5], [0.7, -0.1], [1.2, 0.35], [-0.2, -0.65], [0.55, 0.75], [-0.85, -0.6]];
const Skin: React.FC<{t: number; bacteriaOn?: number}> = ({t, bacteriaOn = 0}) => {
  const eat = clamp((t - K.bacteria - 0.5) / 1.8);
  return (<>
    <Ground size={[60, 60]} color="#5C4256" rough={1} />
    <Box pos={[0, 0, 0]} size={[3.6, 0.5, 2.4]} color="#F6D7A8" map={tex('speckle', [4, 3], 2)} />
    <Box pos={[0, 0.5, 0]} size={[3.6, 0.36, 2.4]} color="#E88E8A" map={tex('speckle', [4, 2], 3)} />
    <Box pos={[0, 0.86, 0]} size={[3.6, 0.14, 2.4]} color="#F2B59B" map={tex('speckle', [6, 3], 4)} />
    {[[-1.5, -0.8], [1.45, 0.75], [1.5, -0.7]].map(([x, z], i) => <Cyl key={i} pos={[x, 0.98, z]} r={0.022} rTop={0.012} h={0.6} rot={[0, 0, 0.12]} color="#3B2418" />)}
    {DROPS.map(([x, z], i) => { const s = pop(t, K.fatty - 0.2 + i * 0.12, 0.3) * (1 - 0.9 * eat * bacteriaOn);
      return s > 0.02 ? <Ball key={i} pos={[x, 1.03, z]} r={0.14 * s} scale={[1, 0.5, 1]} color="#FF9B1F" emissive="#FF9B1F" glow={0.5} rough={0.25} cast={false} /> : null; })}
    {bacteriaOn > 0 && DROPS.map(([x, z], i) => { const u = pop(t, K.bacteria - 0.1 + i * 0.1, 0.3); return u > 0.02 ?
      <Ball key={'b' + i} pos={[x + 0.12, 1.1 + 0.015 * Math.sin(t * 9 + i), z + 0.1]} r={0.12 * u} scale={[1 + 0.12 * Math.sin(t * 11 + i), 1, 1 - 0.1 * Math.sin(t * 11 + i)]} color="#52C23E" map={tex('speckle', [2, 2], 8 + i)} rough={0.5} /> : null; })}
    {bacteriaOn > 0 && Array.from({length: 14}, (_, i) => { const age = t - (K.bacteria + 0.7) - i * 0.17; if (age <= 0) return null; const a = (age % 2.6) / 2.6;
      return <Ball key={'s' + i} pos={[-1.0 + 2.0 * rnd(i + 20) + a * 0.55, 1.25 + a * 1.7, -0.6 + rnd(i + 40) * 1.0]} r={0.1 + a * 0.26} color="#B07CE8" emissive="#8B5BD1" glow={0.5} opacity={0.88 - a * 0.55} rough={1} cast={false} receive={false} />; })}
  </>);
};
const SkinShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.skin, {pos: [0.6, 4.2, 4.8], look: [0, 0.9, 0.1], fov: 34}], [K.skin + 0.6, {pos: [0.2, 3.3, 4.5], look: [0, 1.0, 0.0], fov: 32}], [C.bact, {pos: [0.0, 3.1, 4.3], look: [0, 1.0, 0.0], fov: 32}]]);
  return <World cam={cam} light={SKIN_L} sky={SKY_SKIN} scene={<Skin t={t} />} />;
};
const BactShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.bact, {pos: [-0.6, 3.1, 4.3], look: [0, 1.1, 0.0], fov: 32}], [C.sniff, {pos: [-0.2, 3.0, 4.2], look: [0.1, 1.5, 0.0], fov: 32}]]);
  return <World cam={cam} light={SKIN_L} sky={SKY_SKIN} scene={<Skin t={t} bacteriaOn={1} />} />;
};
const SniffShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.sniff, {pos: [0.4, 2.7, 4.6], look: [0.3, 1.9, 0.2], fov: 32}], [C.lab2, {pos: [0.6, 2.6, 4.0], look: [0.5, 2.0, 0.2], fov: 30}]]);
  const m = pathAt(t, [[C.sniff, [2.0, 3.1, 1.2]], [K.personal + 0.6, [0.7, 2.35, 1.1]], [C.lab2, [0.65, 2.35, 1.1]]]);
  return (<World cam={cam} light={SKIN_L} sky={SKY_SKIN} scene={<Skin t={t} bacteriaOn={1} />}>
    <Fly at={m} t={t} color={SK.grey} h={0.8} dir={-1} sniff={0.5 + 0.5 * loopS(t, 40)} tilt={-10} />
  </World>);
};

// ---------------------------------------------------------------- the 2026 study (three species, a crowd of volunteers)
const Lab2: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.lab2, {pos: [0.0, 1.8, 9.0], look: [0, 0.85, -1.0], fov: 38}], [C.three, {pos: [0.0, 1.8, 8.0], look: [0, 0.85, -1.0], fov: 37}]]);
  return (<World cam={cam} light={LAB} sky={SKY_LAB} scene={<Lab />}>
    {[-2.0, -1.0, 0, 1.0, 2.0].map((x, i) => <Cel key={i} at={[x, 0, -1.4 + 0.15 * (i % 2)]} h={1.45}><Person id={'v' + i} outfit={{shirt: CROWD[i], hair: HAIRS[i % 5], hairStyle: (['short', 'bun', 'sides', 'ponytail', 'short'] as const)[i]}} eyes="dot" mouth="smile" handL={[-74, -128]} handR={[74, -128]} blink={bump(t, C.lab2 + 0.4 + i * 0.2, C.lab2 + 0.56 + i * 0.2)} /></Cel>)}
  </World>);
};
const ThreeShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.three, {pos: [0.0, 1.9, 5.3], look: [0, 1.55, -1.0], fov: 32}], [C.crowd, {pos: [0.0, 1.9, 4.9], look: [0, 1.55, -1.0], fov: 31}]]);
  const cols = [SK.red, SK.green, SK.yellow]; const xs = [-0.62, 0, 0.62];
  return (<World cam={cam} light={LAB} sky={SKY_LAB} scene={<Lab />}>
    {cols.map((c, i) => { const u = pop(t, K.three - 0.05 + i * 0.22, 0.3); return u > 0.02 ? <Fly key={i} at={[xs[i], 1.9 + 0.1 * Math.sin(t * 5 + i), -0.8]} t={t} color={c} h={0.8 * u} dir={i === 2 ? -1 : 1} seed={i} tilt={i === 1 ? 0 : -6} /> : null; })}
  </World>);
};
const CrowdShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.crowd, {pos: [0.0, 3.8, 10.8], look: [0, 0.7, -1.4], fov: 38}], [C.nobody, {pos: [0.0, 3.6, 9.6], look: [0, 0.7, -1.4], fov: 38}]]);
  const rows = [[-0.2, 8], [-1.5, 8], [-2.8, 8]] as [number, number][];
  return (<World cam={cam} light={LAB} sky={SKY_LAB} scene={<Lab />}>
    {rows.map(([z, n], r) => Array.from({length: n}, (_, i) => { const idx = r * n + i; const u = pop(t, K.nineteen - 0.7 + idx * 0.045, 0.28); if (u < 0.02) return null;
      return <Cel key={idx} at={[-2.15 + i * 0.62 + (r % 2) * 0.2, 0, z]} h={1.2}><Person id={'c' + idx} outfit={{shirt: CROWD[(idx * 3) % 8], hair: HAIRS[idx % 5], hairStyle: (['short', 'bun', 'sides', 'ponytail', 'short'] as const)[idx % 5]}}
        sx={u} sy={u} eyes="dot" mouth={idx % 3 ? 'smile' : 'flat'} handL={[-74, -128]} handR={[74, -128]} bounce={2 * Math.abs(loopS(t, 14, idx / 24))} /></Cel>; }))}
  </World>);
};

// ---------------------------------------------------------------- nobody attracted all three
const XMark: React.FC<{pos: V3; s: number}> = ({pos, s}) => (<group position={pos} scale={s}>
  {[0.785, -0.785].map((a, i) => <Box key={i} pos={[0, -0.02, 0]} rot={[0, 0, a]} size={[0.5, 0.09, 0.08]} color="#E5242B" r={0.03} emissive="#E5242B" glow={0.4} cast={false} />)}</group>);
const NobodyShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.nobody, {pos: [0.0, 1.5, 5.2], look: [0, 0.9, -1.0], fov: 32}], [C.scents, {pos: [0.0, 1.5, 4.7], look: [0, 0.95, -1.0], fov: 30}]]);
  const red = pathAt(t, [[C.nobody, [-1.6, 2.4, -0.6]], [K.nobody + 0.6, [-0.42, 1.04, -0.6]]]);
  const grn = pathAt(t, [[C.nobody, [1.8, 2.6, -0.6]], [K.nobody + 0.8, [0.34, 1.34, -0.7]]]);
  const yel = pathAt(t, [[C.nobody, [-1.4, 2.8, -0.6]], [K.nobody + 0.7, [-0.3, 1.9, -0.6]], [K.nobody + 1.0, [-0.3, 1.9, -0.6]], [K.nobody + 1.7, [1.6, 2.7, -0.6]]]);
  const away = t > K.nobody + 1.0;
  return (<World cam={cam} light={LAB} sky={SKY_LAB} scene={<Lab />} front={<XMark pos={[0.9, 2.25, -0.4]} s={pop(t, K.nobody + 1.35, 0.3)} />}>
    <Cel at={[0, 0, -1.0]}><Otto id="otto" eyes="dot" mouth={away ? 'smirk' : 'smile'} browUp={away ? 0.6 : 0.1} handL={[-74, -128]} handR={[74, -128]} headTilt={away ? 5 : 0} blink={bump(t, C.nobody + 1.4, C.nobody + 1.56)} /></Cel>
    <Fly at={red} t={t} color={SK.red} h={0.38} dir={1} seed={1} tilt={-6} />
    <Fly at={grn} t={t} color={SK.green} h={0.38} dir={-1} seed={2} tilt={-6} />
    <Fly at={yel} t={t} color={SK.yellow} h={0.38} dir={away ? 1 : 1} seed={3} tilt={away ? 14 : -4} />
  </World>);
};

// ---------------------------------------------------------------- each species, a different scent
const Cloud: React.FC<{c: V3; color: string; u: number; t: number}> = ({c, color, u, t}) => u < 0.02 ? null : (<group position={c} scale={u}>
  {[[0, 0, 0, 0.3], [-0.26, -0.04, 0.05, 0.22], [0.26, -0.02, 0, 0.24], [0.04, 0.2, 0, 0.2]].map(([x, y, z, r], i) =>
    <Ball key={i} pos={[x + 0.02 * Math.sin(t * 3 + i), y, z]} r={r} color={color} emissive={color} glow={0.45} opacity={0.82} rough={1} cast={false} receive={false} />)}</group>);
const ScentFront: React.FC<{t: number}> = ({t}) => <>{[-0.8, 0, 0.8].map((x, i) => <Cloud key={i} c={[x, 2.05, -0.7]} color={['#E85D9A', '#35C9A0', '#F28B1C'][i]} u={pop(t, K.each + 0.1 + i * 0.25, 0.3)} t={t} />)}</>;

// ---------------------------------------------------------------- the ending: the patio again
const MagnetShot: React.FC<{t: number}> = ({t}) => <MiaClose t={t} from={C.magnet} to={C.wide2} />;
const Ending: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.wide2, {pos: [0.0, 1.5, 7.2], look: [0, 0.62, -0.8], fov: 36}], [C.tonight, {pos: [0.0, 1.5, 6.9], look: [0, 0.62, -0.8], fov: 36}], [K.subscribe + 1.3, CAM0], [END, CAM0]]);
  const yel = pathAt(t, [[C.wide2, [2.4, 2.9, -0.4]], [C.tonight, [1.5, 1.7, -0.3]], [K.tonight + 0.45, [1.05, 1.02, -0.2]], [K.subscribe + 0.9, [1.05, 1.02, -0.2]], [END - 1.6, [0.4, 1.9, -0.3]], [END - 0.6, M0], [END, M0]]);
  const landed = t >= K.tonight + 0.45 && t < END - 1.6; const frozen = kfs(t, [[K.tonight + 0.3, 0], [K.tonight + 0.55, 1], [END - 2.0, 1], [END - 1.5, 0]]);
  const mia = t > END - 1.15 ? 'hook' : 'smug' as const;
  return (<World cam={cam} light={PATIO} sky={SKY_PATIO} scene={<Patio t={t} />} front={<Table />}>
    <Cel at={MIA_AT}><MiaPat t={t} mood={mia} /></Cel>
    <Cel at={OTTO_AT}><OttoPat t={t} frozen={frozen} /></Cel>
    <Fly at={yel} t={t} color={t > END - 1.7 ? SK.grey : SK.yellow} dir={t > END - 1.7 ? 1 : -1} tilt={landed ? 0 : -8} h={0.42} />
  </World>);
};

// ---------------------------------------------------------------- composition
const Scenes: React.FC<{t: number}> = ({t}) => (
  <Cuts t={t} shots={[[0, <Shot1 t={t} />], [C.otto, <OttoClose t={t} />], [C.mia, <MiaClose t={t} from={C.mia} to={C.labWide} />], [C.labWide, <LabWide t={t} />], [C.swarm, <SwarmShot t={t} />], [C.least, <LeastShot t={t} />],
    [C.skin, <SkinShot t={t} />], [C.bact, <BactShot t={t} />], [C.sniff, <SniffShot t={t} />], [C.lab2, <Lab2 t={t} />], [C.three, <ThreeShot t={t} />], [C.crowd, <CrowdShot t={t} />],
    [C.nobody, <NobodyShot t={t} />], [C.scents, <ScentWrap t={t} />], [C.magnet, <MagnetShot t={t} />], [C.wide2, <Ending t={t} />]]} />);
const ScentWrap: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.scents, {pos: [-0.2, 1.6, 7.0], look: [0, 1.0, -1.0], fov: 34}], [C.magnet, {pos: [0.2, 1.6, 6.7], look: [0, 1.0, -1.0], fov: 34}]]);
  const xs = [-0.8, 0, 0.8], cols = [SK.red, SK.green, SK.yellow];
  return (<World cam={cam} light={LAB} sky={SKY_LAB} scene={<Lab />} front={<ScentFront t={t} />}>
    {xs.map((x, i) => <Cel key={i} at={[x, 0, -1.2]} h={1.5}><Person id={'s' + i} outfit={{shirt: CROWD[(i * 2 + 1) % 8], hair: HAIRS[(i + 1) % 5], hairStyle: (['bun', 'short', 'ponytail'] as const)[i]}} eyes={t > K.different + 0.5 ? 'closed' : 'dot'} mouth="smile" handL={[-74, -128]} handR={[74, -128]} /></Cel>)}
    {xs.map((x, i) => { const f = smooth(prog(t, K.different - 0.2 + i * 0.2, K.scent + 0.7 + i * 0.2));
      const from: V3 = ([[-1.6, 3.2, -0.4], [0.0, 3.5, -0.4], [1.7, 3.2, -0.4]] as V3[])[i]; const m: V3 = [lerp(from[0], x, f), lerp(from[1], 2.3, f), -0.4];
      return <Fly key={i} at={m} t={t} color={cols[i]} h={0.5} dir={i === 2 ? -1 : 1} seed={i} tilt={-8} />; })}
  </World>);
};
export const Short: React.FC<{voice?: boolean; captions?: boolean; guides?: boolean}> = ({voice = false, captions = true, guides = false}) => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps;
  return (<AbsoluteFill style={{background: '#000'}}>
    <Scenes t={t} />
    <Cta t={t} tIn={K.subscribe - 0.1} tClick={K.facts + 0.05} tBell={K.this} tOut={END - 0.8} />
    {captions && <Captions t={t} />}
    {guides && <SafeGuides />}
    <Audio src={staticFile(`${T.short}/sfx.wav`)} volume={0.42} />
    <Audio src={staticFile(`${T.short}/bed.wav`)} volume={0.2} />
    {voice && <Sequence from={Math.round(Math.max(0, T.voiceOffset) * fps)} layout="none"><Audio src={staticFile(`${T.short}/vo.wav`)} /></Sequence>}
  </AbsoluteFill>);
};

// ---------------------------------------------------------------- thumbnails (frames of the video + text)
export const Thumb: React.FC<{variant: 'A' | 'B' | 'C'}> = ({variant}) => {
  const cfg = {A: {t: 0.2, l1: 'WHY ME?', l2: 'MOSQUITOES PICK YOU', top: 250}, B: {t: K.ignore + 0.5, l1: 'THEY', l2: 'SKIP YOUR FRIEND', top: 205}, C: {t: K.hundred + 0.9, l1: '100X MORE', l2: 'BITES', top: 250}}[variant];
  return (<AbsoluteFill><Scenes t={cfg.t} /><ThumbText l1={cfg.l1} l2={cfg.l2} top={cfg.top} /></AbsoluteFill>);
};
