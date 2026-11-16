/* Sets for "Why can't you tickle yourself?" - every place is real 3D meshes (World3D), the cast stays flat.
 * Places: the living room (afternoon / golden hour / a grey copy for the split stage), the brain space (cutaways),
 * the London lab at dusk (robot arms, a tickle gauge, rain on the window). */
import React, {useMemo} from 'react';
import * as THREE from 'three';
import timing from './timing.json';
import {Ball, Box, Cyl, Ground, Instances, Light, V3, tex} from './World3D';
import {clamp, lerp, rnd} from './math';
import {mix} from './color';

const T = timing as any;
export const DUR = T.duration as number;
/** whole cycles over the video (loop-safe idle motion) */
export const loopS = (t: number, n: number, ph = 0) => Math.sin(2 * Math.PI * (n * t / DUR + ph));
export const cycles = (hz: number) => Math.max(1, Math.round(DUR * hz));

// ------------------------------------------------------------------------------------------------ light presets
export const AFTERNOON: Light = {sun: [-3, 5.5, 4], sunColor: '#FFF1D8', sunI: 2.3, sky: '#E9F1FF', bounce: '#C9A27E', ambI: 1.25, fog: ['#F3D9C4', 14, 40], focus: [0, 0, 0], span: 5};
export const GOLDEN: Light = {sun: [-4, 2.6, 4], sunColor: '#FFB766', sunI: 2.7, sky: '#FFD6A8', bounce: '#C27A4A', ambI: 1.05, fog: ['#F2B98C', 14, 40], focus: [0, 0, 0], span: 5};
export const GREYROOM: Light = {sun: [-3, 5.5, 4], sunColor: '#E4EAF2', sunI: 1.6, sky: '#D5DEEA', bounce: '#8C96A3', ambI: 1.3, fog: ['#B9C2CE', 14, 40], focus: [0, 0, 0], span: 5};
export const BRAINLIGHT: Light = {sun: [2, 5, 5], sunColor: '#FFF4EC', sunI: 2.2, sky: '#C9D3FF', bounce: '#3A3060', ambI: 1.15, fog: ['#101634', 10, 30], focus: [0, 1.2, 0], span: 4};
export const LABLIGHT: Light = {sun: [2.5, 6, 3.5], sunColor: '#FFF6EA', sunI: 2.3, sky: '#E2EEF8', bounce: '#8A8A80', ambI: 1.55, fog: ['#2B3A48', 12, 34], focus: [0, 0, 0], span: 5};
export const SKY = {room: ['#F0C9A8', '#F6DCC4'] as [string, string], golden: ['#E89C6A', '#F5C496'] as [string, string], grey: ['#B9C0CA', '#CDD3DB'] as [string, string],
  brain: ['#070B24', '#1B2556'] as [string, string], lab: ['#1D2A36', '#2E3F4D'] as [string, string]};

// ------------------------------------------------------------------------------------------------ living room
export const SOFA_Z = -0.25;               // front edge of the seat cushions
export const SEAT_Y = 0.46;
/** the living room around the mustard sofa. tone: 'day' | 'golden' | 'grey'. ox shifts the whole room (split stage). */
export const LivingRoom: React.FC<{t: number; tone?: 'day' | 'golden' | 'grey'; ox?: number; noWindow?: boolean; w?: number}> = ({t, tone = 'day', ox = 0, noWindow = false, w = 9}) => {
  const g = tone === 'grey';
  const c = (day: string, grey: string) => (g ? grey : day);
  const wall = c(tone === 'golden' ? '#F2B48C' : '#F1C4A2', '#B8C0CB'), floor = c('#C98E5A', '#8D939B'), sofa = c('#E8B33A', '#9AA1AA'), sofaDark = c('#C9932A', '#858C95');
  const rug = c('#2E4A86', '#5E6670'), plant = c('#3E9B57', '#7C858E'), frameIn = c('#5BB8C9', '#9AA3AD');
  const books = useMemo(() => Array.from({length: 24}, (_, i) => ({p: [1.55 + (i % 8) * 0.085, 0.95 + Math.floor(i / 8) * 0.42, -1.42] as V3, s: [0.07, 0.26 + rnd(i) * 0.1, 0.22] as V3,
    c: ['#E5484D', '#3F7FD9', '#F2C94C', '#8E5BD6', '#4CAF50', '#F2994A'][i % 6]})), []);
  const leaves = useMemo(() => Array.from({length: 26}, (_, i) => { const a = rnd(i + 2) * Math.PI * 2, h = 0.5 + rnd(i + 7) * 0.75, r = 0.08 + rnd(i + 11) * 0.22;
    return {p: [Math.cos(a) * r, h, Math.sin(a) * r] as V3, r: [rnd(i) * 1.2 - 0.6, a, rnd(i + 3) - 0.5] as V3, s: [0.16, 0.03, 0.07] as V3}; }), []);
  const sway = 0.04 * loopS(t, 5, 0.2);
  return (<group position={[ox, 0, 0]}>
    <Ground size={[w, 7]} at={[0, 0.5]} color={floor} map={tex('planks', [Math.round(w * 0.55), 4], 4)} rough={0.7} />
    <Box pos={[0, 0, -1.6]} size={[w, 3.2, 0.12]} r={0} color={wall} map={tex('speckle', [4, 2], 9)} />
    <Box pos={[0, 0, -1.53]} size={[w, 0.14, 0.04]} r={0.01} color={c('#FFFFFF', '#D9DEE4')} />
    {/* window (left) with a bright pane and curtains */}
    {!noWindow && <group position={[-1.35, 0, -1.5]}>
      <Box pos={[0, 0.95, 0]} size={[1.1, 1.45, 0.06]} r={0.01} color={c('#FFFFFF', '#DDE2E8')} />
      <Box pos={[0, 1.02, 0.02]} size={[0.96, 1.3, 0.04]} r={0} color={c(tone === 'golden' ? '#FFD9A0' : '#CFE8FF', '#E4E8EC')} emissive={c(tone === 'golden' ? '#FFB45C' : '#BFE2FF', '#C8CED6')} glow={0.9} />
      <Box pos={[0, 1.62, 0.04]} size={[0.96, 0.04, 0.05]} r={0} color="#FFFFFF" /><Box pos={[0, 1.02, 0.04]} size={[0.04, 1.3, 0.05]} r={0} color="#FFFFFF" />
      {[-1, 1].map((s) => <Box key={s} pos={[s * 0.68, 0.0, 0.08]} size={[0.26, 2.45, 0.06]} r={0.03} color={c('#E5484D', '#8E96A0')} map={tex('stripes', [2, 1], 3)} rot={[0, 0, s * 0.02]} />)}
      <Box pos={[0, 2.45, 0.12]} size={[1.7, 0.05, 0.05]} r={0.02} color="#8A5A35" />
    </group>}
    {/* two pictures on the wall */}
    {[[0.35, 1.75, 0.5, 0.38], [0.95, 1.85, 0.32, 0.42]].map(([x, y, w, h], i) => <group key={i} position={[x, y, -1.53]}>
      <Box size={[w, h, 0.04]} r={0.01} color={c('#3A2A20', '#5A6068')} /><Box pos={[0, 0.04, 0.02]} size={[w - 0.08, h - 0.08, 0.02]} r={0} color={i ? c('#F2994A', '#A3ABB4') : frameIn} />
      {i === 0 && <Ball pos={[0.06, h * 0.55, 0.04]} r={0.06} color={c('#FFE27A', '#C9CED4')} />}</group>)}
    {/* bookshelf (right) */}
    <Box pos={[1.88, 0, -1.4]} size={[0.8, 2.0, 0.32]} r={0.02} color={c('#9A6B43', '#7E848C')} map={tex('planks', [1, 2], 5)} />
    {[0.9, 1.32, 1.74].map((y) => <Box key={y} pos={[1.88, y, -1.24]} size={[0.72, 0.03, 0.04]} r={0} color={c('#7A5232', '#6E747C')} />)}
    <Instances k={'books' + tone} geo={() => new THREE.BoxGeometry(1, 1, 1)} items={books.map((b) => ({...b, c: g ? mix(b.c, '#9AA0A8', 0.75) : b.c, p: [b.p[0], b.p[1] + (b.s as V3)[1] / 2, b.p[2]] as V3}))} rough={0.8} />
    {/* rug, sofa */}
    <Cyl pos={[0, 0.002, 0.45]} r={1.25} h={0.015} color={rug} map={tex('stripes', [6, 1], 2)} scale={[1.25, 1, 0.75]} cast={false} />
    <group position={[0, 0, SOFA_Z - 0.4]}>
      <Box pos={[0, 0.1, 0]} size={[2.0, 0.3, 0.85]} r={0.08} color={sofaDark} map={tex('speckle', [3, 2], 2)} />
      <Box pos={[0, 0.1, -0.33]} size={[2.0, 0.8, 0.22]} r={0.1} color={sofa} map={tex('speckle', [3, 2], 3)} />
      {[-0.45, 0.45].map((x) => <Box key={x} pos={[x, 0.36, 0.06]} size={[0.86, 0.14, 0.7]} r={0.06} color={sofa} map={tex('speckle', [2, 2], 4)} />)}
      {[-1, 1].map((s) => <Box key={s} pos={[s * 1.04, 0.1, 0.02]} size={[0.22, 0.55, 0.85]} r={0.1} color={sofa} map={tex('speckle', [1, 2], 6)} />)}
      {[[-0.72, 0.48, -0.16, 0.3], [0.78, 0.5, -0.16, -0.25]].map(([x, y, z, rz], i) => <Ball key={i} pos={[x, y + 0.12, z]} r={0.17} scale={[1, 1, 0.45]} rot={[0, 0, rz]} color={c(i ? '#E5484D' : '#3F7FD9', '#A8AFB8')} rough={0.9} />)}
      {[-0.9, 0.9].map((x) => [-1, 1].map((s) => <Cyl key={x + '' + s} pos={[x, 0, s * 0.34]} r={0.03} h={0.1} color="#5A3A22" />))}
    </group>
    {/* floor lamp (right of sofa) and a plant (left) */}
    <group position={[1.25, 0, -0.85]}>
      <Cyl r={0.16} h={0.03} color="#3A3A3E" /><Cyl r={0.018} h={1.55} color="#3A3A3E" metal={0.4} rough={0.4} />
      <Cyl pos={[0, 1.45, 0]} r={0.24} rTop={0.13} h={0.3} color={c('#FFF4D6', '#E0E4E8')} emissive={c('#FFD58A', '#B8BEC6')} glow={tone === 'golden' ? 0.8 : 0.35} />
    </group>
    <group position={[-1.3, 0, -0.95]} rotation={[0, 0, sway]}>
      <Cyl r={0.17} rTop={0.21} h={0.42} color={c('#D9643A', '#8E959E')} map={tex('speckle', [2, 1], 8)} />
      <Instances k={'leaves' + tone} geo={() => new THREE.SphereGeometry(1, 12, 8)} items={leaves.map((l) => ({...l, p: [l.p[0], l.p[1] + 0.2, l.p[2]] as V3}))} color={plant} rough={0.8} />
    </group>
    {/* a side table with a mug at the left end of the sofa */}
    <group position={[-1.35, 0, -0.1]}>
      <Cyl r={0.2} h={0.03} pos={[0, 0.5, 0]} color={c('#F7F2E8', '#C7CCD2')} /><Cyl r={0.025} h={0.5} color="#5A3A22" /><Cyl r={0.14} h={0.02} color="#5A3A22" />
      <Cyl pos={[0.02, 0.53, 0]} r={0.045} h={0.1} color={c('#3F7FD9', '#9AA1AA')} rough={0.4} />
    </group>
  </group>);
};

// ------------------------------------------------------------------------------------------------ the brain (3D prop)
type BrainProps = {pos?: V3; s?: number; glow?: number; dim?: number; cereb?: number; rotY?: number};
const LOBES = Array.from({length: 150}, (_, i) => {          // small folds on two hemispheres, with a groove down the middle
  const side = i % 2 ? 1 : -1, u = rnd(i * 3 + 1), v = rnd(i * 5 + 2);
  const th = lerp(0.12, Math.PI * 0.62, u), ph = lerp(-0.1, Math.PI + 0.1, v);
  const n = new THREE.Vector3(Math.sin(th) * Math.sin(ph) * 0.95, Math.cos(th), Math.sin(th) * Math.cos(ph));
  const p: V3 = [side * (0.2 + 0.27 * n.x), 0.06 + 0.31 * n.y, 0.49 * n.z];
  return {p, s: [0.075 + rnd(i * 7) * 0.035, 0.045, 0.11 + rnd(i * 11) * 0.05] as V3, r: [Math.atan2(n.z, n.y) * 0.6, rnd(i) * 3, side * 0.4] as V3};
});
/** a glossy cartoon brain: two lumpy pink hemispheres, a ribbed cerebellum at the back-bottom, a brain stem.
 *  glow 0..1 lights it up (emissive pink), dim 0..1 greys it, cereb 0..1 makes the cerebellum glow yellow. */
export const Brain: React.FC<BrainProps> = ({pos = [0, 0, 0], s = 1, glow = 0, dim = 0, cereb = 0, rotY = 0}) => {
  const pink = mix('#F28CA6', '#8D8F99', dim), deep = mix('#D9607F', '#6E707A', dim);
  return (<group position={pos} scale={s} rotation={[0, rotY, 0]}>
    <Instances k={'lobes' + dim.toFixed(2) + glow.toFixed(2)} geo={() => new THREE.SphereGeometry(1, 16, 10)} items={LOBES.map((l) => ({p: l.p, s: l.s, r: l.r}))} color={mix(pink, '#FFFFFF', 0.12)} rough={0.4} emissive="#FF5F95" glow={0.55 * glow} cast />
    {[-1, 1].map((sd) => <Ball key={sd} pos={[sd * 0.2, 0.06, 0]} r={0.33} scale={[0.8, 0.95, 1.5]} color={pink} rough={0.4} emissive="#FF5F95" glow={0.55 * glow} />)}
    {/* cerebellum: stacked ribs at the back-bottom */}
    <group position={[0, -0.27, -0.42]}>
      {[0, 1, 2, 3].map((i) => <Ball key={i} pos={[0, 0.08 - i * 0.055, -i * 0.012]} r={0.2 - i * 0.02} scale={[1.45, 0.42, 1]} color={mix(deep, '#FFD23F', cereb)} rough={0.4} emissive="#FFC23D" glow={1.3 * cereb} />)}
    </group>
    <Cyl pos={[0, -0.75, -0.18]} r={0.07} rTop={0.11} h={0.5} color={deep} rough={0.45} rot={[0.25, 0, 0]} />
  </group>);
};
/** world position of the cerebellum for a Brain at pos with scale s */
export const BRAIN_ROT = -0.55;
export const cerebAt = (pos: V3, s = 1, rot = BRAIN_ROT): V3 => [pos[0] - 0.48 * s * Math.sin(rot), pos[1] - 0.3 * s, pos[2] - 0.48 * s * Math.cos(rot)];

// ------------------------------------------------------------------------------------------------ brain space
export const BRAIN_POS: V3 = [0, 2.75, 0];
export const HAND_POS: V3 = [0.6, 0.38, 0.55];
/** the nerve cable from the brain stem down to the hand */
export const NERVE = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 2.0, -0.1), new THREE.Vector3(0.35, 1.55, 0.25), new THREE.Vector3(-0.15, 1.0, 0.45), new THREE.Vector3(0.5, 0.25, 0.5), new THREE.Vector3(HAND_POS[0], HAND_POS[1] - 0.3 * 1.3, HAND_POS[2] - 0.05)]);
export const nerveAt = (u: number): V3 => { const p = NERVE.getPoint(clamp(u)); return [p.x, p.y, p.z]; };
/** a big white cartoon hand standing up (palm toward the lens, four fingers up, thumb out). wiggle 0..1 curls the fingers. */
export const Hand3: React.FC<{pos: V3; wiggle?: number; t?: number; s?: number}> = ({pos, wiggle = 0, t = 0, s = 1}) => (
  <group position={pos} scale={s}>
    <Box pos={[0, -0.02, 0]} size={[0.3, 0.3, 0.1]} r={0.05} color="#FFFFFF" rough={0.6} />
    {[-0.105, -0.035, 0.035, 0.105].map((x, i) => { const L = [0.17, 0.21, 0.2, 0.16][i];
      return <group key={i} position={[x, 0.26, 0]} rotation={[wiggle * 0.9 * (0.5 + 0.5 * Math.sin(t * 18 + i * 1.3)), 0, -x * 0.6]}>
        <Cyl pos={[0, 0, 0]} r={0.03} h={L} color="#FFFFFF" rough={0.6} /><Ball pos={[0, L, 0]} r={0.03} color="#FFFFFF" rough={0.6} /></group>; })}
    <group position={[-0.15, 0.08, 0]} rotation={[0, 0, 0.9 + wiggle * 0.3 * Math.sin(t * 15)]}><Cyl r={0.032} h={0.15} color="#FFFFFF" rough={0.6} /><Ball pos={[0, 0.15, 0]} r={0.032} color="#FFFFFF" rough={0.6} /></group>
    <Cyl pos={[0, -0.3, 0]} r={0.07} h={0.14} color="#FFFFFF" rough={0.6} />
  </group>);
/** a golden 3D feather (the "prediction" inside its glass bubble, and the tickling feather elsewhere) */
export const Feather: React.FC<{pos: V3; s?: number; rot?: V3; color?: string; glow?: number}> = ({pos, s = 1, rot = [0, 0, 0], color = '#FFD23F', glow = 0.6}) => (
  <group position={pos} scale={s} rotation={rot}>
    <Ball r={0.16} scale={[0.45, 1, 0.08]} color={color} emissive={color} glow={glow} rough={0.6} />
    <Cyl pos={[0, -0.24, 0]} r={0.008} h={0.42} color="#FFF4C8" emissive="#FFF4C8" glow={glow * 0.5} />
  </group>);
/** glowing pulse ball (a nerve signal) */
export const Pulse: React.FC<{pos: V3; r?: number; color: string; glow?: number}> = ({pos, r = 0.07, color, glow = 1.6}) => r <= 0.002 ? null :
  <Ball pos={pos} r={r} color={color} emissive={color} glow={glow} rough={0.3} cast={false} />;
/** spiky red "touch" signal */
export const Spiky: React.FC<{pos: V3; s: number; t: number; color?: string}> = ({pos, s, t, color = '#FF3B3B'}) => s <= 0.003 ? null : (
  <group position={pos} scale={s} rotation={[t * 3, t * 4, 0]}>
    <mesh><icosahedronGeometry args={[0.1, 0]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} roughness={0.4} /></mesh>
    {Array.from({length: 12}, (_, i) => { const v = new THREE.Vector3(Math.cos(i * 2.4) * Math.sin(i * 0.9 + 0.4), Math.cos(i * 0.9 + 0.4), Math.sin(i * 2.4) * Math.sin(i * 0.9 + 0.4)).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), v), e = new THREE.Euler().setFromQuaternion(q);
      return <mesh key={i} position={[v.x * 0.11, v.y * 0.11, v.z * 0.11]} rotation={e}><coneGeometry args={[0.035, 0.08, 6]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} roughness={0.4} /></mesh>; })}
  </group>);
const SPECKS = Array.from({length: 90}, (_, i) => ({p: [(rnd(i) - 0.5) * 16, rnd(i + 50) * 9 - 1.5, -3 - rnd(i + 99) * 10] as V3, s: 0.015 + rnd(i + 7) * 0.03}));
/** the deep blue space around the brain: floating specks, a glossy disc to stand on, the nerve cable and the hand */
export const BrainSpace: React.FC<{t: number; glow?: number; dim?: number; cereb?: number; brainS?: number; wiggle?: number; cable?: number}> = ({t, glow = 0, dim = 0, cereb = 0, brainS = 1, wiggle = 0, cable = 1}) => {
  const tube = useMemo(() => new THREE.TubeGeometry(NERVE, 80, 0.045, 12, false), []);
  const tw = 0.6 + 0.4 * loopS(t, cycles(0.5), 0.1);
  return (<group>
    <Instances k="specks" geo={() => new THREE.SphereGeometry(1, 8, 6)} items={SPECKS.map((s, i) => ({p: [s.p[0], s.p[1] + 0.15 * loopS(t, 1, i * 0.07), s.p[2]] as V3, s: s.s * (0.7 + 0.5 * tw)}))} color="#BFD2FF" emissive="#9FB8FF" glow={1.4} cast={false} receive={false} />
    <Cyl pos={[-0.7, 0.36, 0.6]} r={0.42} h={0.06} color="#2B3880" rough={0.3} metal={0.2} emissive="#3B4FD0" glow={0.25} />
    <Cyl pos={[0.5, -0.06, 0.4]} r={0.75} h={0.06} color="#2B3880" rough={0.3} metal={0.2} emissive="#3B4FD0" glow={0.25} />
    <Ground size={[40, 40]} y={-0.5} color="#141C46" rough={0.9} />
    {brainS > 0.01 && <Brain pos={BRAIN_POS} s={brainS} glow={glow} dim={dim} cereb={cereb} rotY={BRAIN_ROT} />}
    {cable > 0.01 && <mesh geometry={tube}><meshStandardMaterial color="#9FB4FF" emissive="#5E78FF" emissiveIntensity={0.55} roughness={0.25} transparent opacity={0.55 * cable} /></mesh>}
    <Hand3 pos={HAND_POS} wiggle={wiggle} t={t} s={1.3} />
  </group>);
};

// ------------------------------------------------------------------------------------------------ the London lab
export type ArmPose = {base: V3; target: V3; tip?: string; lights?: number; pole?: number};
const L1 = 0.42, L2 = 0.4;
/** a white desk robot arm with orange joints that reaches its tip to `target` (2-link IK in its vertical plane) */
export const RobotArm: React.FC<ArmPose> = ({base, target, tip = '#FFE27A', lights = 0}) => {
  const sh: V3 = [base[0], base[1] + 0.22, base[2]];
  const dx = target[0] - sh[0], dz = target[2] - sh[2], dy = target[1] - sh[1];
  const yaw = Math.atan2(dx, dz), hd0 = Math.hypot(dx, dz), d0 = Math.max(1e-4, Math.hypot(hd0, dy)), d = clamp(d0, 0.05, L1 + L2 - 0.01);
  const hd = hd0 * d / d0, vy = dy * d / d0;                        // target in the arm's plane (clamped to its reach)
  const a = Math.atan2(vy, hd), b = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  const up = a + b;                                                  // elbow up: upper-arm angle above horizontal
  const fa = Math.atan2(vy - Math.sin(up) * L1, hd - Math.cos(up) * L1);   // forearm angle above horizontal
  const white = '#F3F5F8', orange = '#F2994A';
  return (<group position={base}>
    <Cyl r={0.13} rTop={0.11} h={0.1} color="#3B4450" rough={0.5} metal={0.3} />
    <group position={[0, 0.1, 0]} rotation={[0, yaw, 0]}>
      <Cyl r={0.07} h={0.12} color={white} rough={0.35} />
      <Ball pos={[0, 0.12, 0]} r={0.075} color={orange} rough={0.4} />
      <group position={[0, 0.12, 0]} rotation={[Math.PI / 2 - up, 0, 0]}>
        <Box pos={[0, 0, 0]} size={[0.08, L1, 0.08]} r={0.035} color={white} rough={0.35} />
        <Ball pos={[0.045, L1 * 0.55, 0]} r={0.016} color={lights > 0.5 ? '#5CC8FF' : '#2E3A48'} emissive="#5CC8FF" glow={2 * lights} cast={false} />
        <group position={[0, L1, 0]} rotation={[up - fa, 0, 0]}>
          <Ball r={0.06} color={orange} rough={0.4} />
          <Box size={[0.065, L2, 0.065]} r={0.03} color={white} rough={0.35} />
          <Ball pos={[0.04, L2 * 0.5, 0]} r={0.014} color={lights > 0.5 ? '#5CC8FF' : '#2E3A48'} emissive="#5CC8FF" glow={2 * lights} cast={false} />
          <Ball pos={[0, L2 + 0.03, 0]} r={0.05} color={tip} rough={0.95} />
        </group>
      </group>
    </group>
  </group>);
};
const RAIN = Array.from({length: 60}, (_, i) => ({x: (rnd(i) - 0.5) * 1.3, y0: rnd(i + 40), sp: 0.5 + rnd(i + 80) * 0.5, l: 0.05 + rnd(i + 9) * 0.09}));
/** gauge: a dial with a needle (0..1) on a short stand */
export const Gauge: React.FC<{pos: V3; v: number; s?: number}> = ({pos, v, s = 1}) => (
  <group position={pos} scale={s}>
    <Cyl r={0.05} h={0.5} color="#3B4450" metal={0.3} rough={0.5} />
    <group position={[0, 0.66, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <Cyl r={0.2} h={0.06} pos={[0, -0.03, 0]} color="#2E3A48" rough={0.4} />
      <Cyl r={0.17} h={0.02} pos={[0, 0.02, 0]} color="#FFFFFF" rough={0.6} />
    </group>
    {/* coloured scale: green -> yellow -> red arcs as little blocks */}
    {Array.from({length: 9}, (_, i) => { const ang = lerp(Math.PI * 0.85, Math.PI * 0.15, i / 8);
      return <Box key={i} pos={[Math.cos(ang) * 0.13, 0.66 + Math.sin(ang) * 0.13 - 0.01, 0.045]} rot={[0, 0, ang - Math.PI / 2]} size={[0.05, 0.022, 0.01]} r={0} color={i < 3 ? '#4CAF50' : i < 6 ? '#F2C94C' : '#E5484D'} cast={false} />; })}
    <group position={[0, 0.66, 0.05]} rotation={[0, 0, lerp(Math.PI * 0.35, -Math.PI * 0.35, clamp(v))]}>
      <Box pos={[0, 0, 0]} size={[0.014, 0.14, 0.012]} r={0} color="#E5484D" cast={false} />
    </group>
    <Ball pos={[0, 0.66, 0.06]} r={0.02} color="#151515" cast={false} />
  </group>);
/** the lab: panelled walls, a rainy window with a clock tower outside, a control box with a big dial, two pedestals */
export const Lab: React.FC<{t: number; dial?: number; lightsOn?: number; gauge?: number}> = ({t, dial = 0, lightsOn = 1, gauge = 0}) => {
  const rain = RAIN.map((r, i) => { const y = 1 - ((r.y0 + t * r.sp) % 1); return {p: [-1.25 + r.x, 0.95 + y * 1.35, -1.47] as V3, s: [0.006, r.l, 0.006] as V3}; });
  return (<group>
    <Ground size={[9, 7]} at={[0, 0.5]} color="#3E4A52" map={tex('tiles', [8, 6], 3)} rough={0.55} />
    <Box pos={[0, 0, -1.6]} size={[9, 3.2, 0.12]} r={0} color="#5B8784" map={tex('panels', [6, 2], 4)} />
    {/* rainy window with the night city: a clock tower and street lights */}
    <group position={[-1.25, 0, -1.55]}>
      <Box pos={[0, 0.85, 0]} size={[1.45, 1.6, 0.06]} r={0.01} color="#C9D2DA" metal={0.3} rough={0.4} />
      <Box pos={[0, 0.93, 0.01]} size={[1.32, 1.44, 0.02]} r={0} color="#1E3050" emissive="#26406A" glow={0.6} />
    </group>
    <group position={[-1.3, 0, -1.5]}>
      <Box pos={[0.15, 0.93, 0.02]} size={[0.2, 1.05, 0.01]} r={0} color="#0D1520" />
      <Cyl pos={[0.15, 1.98, 0.02]} r={0.14} rTop={0} h={0.3} seg={4} color="#0D1520" />
      <Cyl pos={[0.15, 1.78, 0.03]} r={0.065} h={0.01} rot={[Math.PI / 2, 0, 0]} color="#FFE7A8" emissive="#FFD27A" glow={1.6} cast={false} />
      {[-0.5, -0.25, 0.45].map((x, i) => <Box key={i} pos={[x, 0.93, 0.02]} size={[0.24, 0.3 + i * 0.12, 0.01]} r={0} color="#121C2A" />)}
      {[-0.4, 0.05, 0.5].map((x, i) => <Ball key={i} pos={[x, 1.05 + i * 0.06, 0.03]} r={0.025} color="#FFB45C" emissive="#FF9A3C" glow={2} cast={false} />)}
    </group>
    <Instances k="rain" geo={() => new THREE.BoxGeometry(1, 1, 1)} items={rain} color="#BFD6FF" emissive="#9EC2FF" glow={0.6} cast={false} receive={false} />
    {/* ceiling lamp glow + a wall clock-free poster of a hand */}
    <Box pos={[1.1, 1.25, -1.53]} size={[0.62, 0.8, 0.02]} r={0} color="#F4EFE3" />
    <Hand3 pos={[1.1, 1.62, -1.48]} s={0.9} />
    {/* pedestals for the two robot arms + the control box with a big red dial */}
    <Box pos={[-0.85, 0, 0.15]} size={[0.5, 0.78, 0.5]} r={0.03} color="#E9EDF1" map={tex('panels', [1, 1], 2)} />
    <Box pos={[0.3, 0, 0.15]} size={[0.5, 0.78, 0.5]} r={0.03} color="#E9EDF1" map={tex('panels', [1, 1], 2)} />
    <group position={[1.05, 0, 0.1]}>
      <Box size={[0.55, 0.95, 0.42]} r={0.03} color="#5E6A74" map={tex('panels', [1, 1], 7)} rough={0.5} />
      <Box pos={[0, 0.95, 0]} size={[0.5, 0.05, 0.38]} r={0.02} color="#3B4450" />
      <group position={[0.13, 1.0, 0.05]} rotation={[0, dial * Math.PI * 1.2, 0]}>
        <Cyl r={0.11} h={0.07} color="#E5484D" rough={0.35} /><Box pos={[0, 0.07, 0.06]} size={[0.025, 0.012, 0.09]} r={0} color="#FFFFFF" />
      </group>
      <Gauge pos={[-0.12, 0.98, -0.02]} v={gauge} s={0.62} />
      {[0.0, 0.0].map((x, i) => <Ball key={i} pos={[x, 1.0, 0.08 + i * 0.08]} r={0.022} color={lightsOn > 0.5 ? (i ? '#4CAF50' : '#F2C94C') : '#2E3A48'} emissive={i ? '#4CAF50' : '#F2C94C'} glow={2 * lightsOn} cast={false} />)}
    </group>
  </group>);
};
