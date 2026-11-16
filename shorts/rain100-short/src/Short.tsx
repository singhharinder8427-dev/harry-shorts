/* "What if it rained for 100 years straight?" - v3 look: FLAT 2D cel cast (Dana) in STYLIZED 3D worlds.
 * Places: rainy US main street (wet asphalt, brick shops, diner, mailbox, hydrant), a school science room (jars),
 * a sunny coast pier, a dark space shot. Every cut sits on a caption chunk start; every action on a key word. */
import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {Captions, SafeGuides} from './Captions';
import {Person, Outfit, PersonPose} from './Cast';
import {Cta, Tag, ThumbText} from './Cta';
import {Ball, Box, Cam3, Cel, Cuts, Cyl, Ground, Light, V3, World, cam3At, tex} from './World3D';
import {bump, clamp, eio, kfs, pick, pop, rnd, spring} from './math';
import timing from './timing.json';

const T = timing as any;
export const DURATION: number = T.duration;
const K: Record<string, number> = T.keys;
const CH: number[] = T.chunks.map((c: any) => c.start);
const cs = (i: number) => CH[i] - 0.04;                       // cut a hair before the first word of chunk i
const TAU = Math.PI * 2;
const cyc = (t: number, n: number) => (t / DURATION) * n;    // n whole cycles over the video -> seamless loop
const breathe = (t: number) => 2.5 * Math.sin(TAU * cyc(t, 21));

// ---- cast: one character, same clothes in every shot
const DANA: Outfit = {shirt: '#F2B705', hair: '#3B2A20', hairStyle: 'bun'};
const D = (at: V3, p: Partial<PersonPose>, h = 1.7) => <Cel at={at} h={h}><Person id="dana" outfit={DANA} {...p} /></Cel>;

// ---- falling rain: one InstancedMesh, deterministic, whole cycles over the video (loops exactly)
const Rain: React.FC<{t: number; n?: number; c?: V3; w?: number; d?: number; top?: number; h?: number; cycles?: number; color?: string; op?: number}> =
  ({t, n = 700, c = [0, 0, 0], w = 14, d = 14, top = 9, h = 9, cycles = 84, color = '#D5E6F7', op = 0.75}) => {
    const ref = useRef<THREE.InstancedMesh>(null); const o = useMemo(() => new THREE.Object3D(), []);
    useLayoutEffect(() => {
      const m = ref.current; if (!m) return;
      for (let i = 0; i < n; i++) {
        const ph = (rnd(i * 3 + 1) + cyc(t, cycles)) % 1;
        o.position.set(c[0] + (rnd(i * 3 + 2) - 0.5) * w, c[1] + top - ph * h, c[2] + (rnd(i * 3 + 3) - 0.5) * d); o.updateMatrix(); m.setMatrixAt(i, o.matrix);
      }
      m.instanceMatrix.needsUpdate = true;
    });
    return <instancedMesh ref={ref} args={[undefined, undefined, n]} frustumCulled={false}>
      <boxGeometry args={[0.014, 0.55, 0.014]} /><meshBasicMaterial color={color} transparent opacity={op} /></instancedMesh>;
  };

// =============================================================================================== place 1: main street
const STREET: Light = {sun: [-3, 8, 4], sunColor: '#DCE6F2', sunI: 1.3, sky: '#B9C7D6', bounce: '#7D8794', ambI: 1.5, fog: ['#9AA6B4', 16, 60], focus: [0, 0, -2], span: 12};
const STREET_SKY: [string, string] = ['#74808E', '#B7C1CB'];
const Shop: React.FC<{x: number; z: number; w: number; h: number; c: string; awn?: string}> = ({x, z, w, h, c, awn}) => (<group position={[x, 0, z]}>
  <Box size={[w, h, 5]} color={c} map={tex('bricks', [w / 2, h / 2])} r={0.05} />
  <Box pos={[0, h, 0]} size={[w + 0.4, 0.4, 5.4]} color="#4B4F57" r={0.06} />
  {[-1, 1].map((s) => <Box key={s} pos={[s * w * 0.26, 1.1, 2.5]} size={[w * 0.3, 1.8, 0.1]} color="#F7D58A" rough={0.25} emissive="#F7D58A" glow={0.5} />)}
  {Array.from({length: Math.floor(h / 3.2)}, (_, i) => [-1, 1].map((s) => <Box key={i + '_' + s} pos={[s * w * 0.26, 3.4 + i * 3, 2.5]} size={[w * 0.22, 1.5, 0.1]} color="#7FA3C2" rough={0.2} />))}
  {awn && <Box pos={[0, 2.9, 3.0]} rot={[0.35, 0, 0]} size={[w * 0.9, 0.1, 1.6]} color={awn} map={tex('stripes', [8, 1])} />}
</group>);
const Town: React.FC<{t: number}> = ({t}) => (<>
  <Ground color="#8E9A8C" map={tex('grass', [40, 40])} />
  <Ground size={[8, 90]} at={[0, -25]} y={0.01} color="#4A4F57" map={tex('speckle', [4, 40], 4)} rough={0.35} />
  {[-12, -6, 0, 6, 12].map((z) => <Box key={z} pos={[0, 0.012, z - 14]} size={[0.16, 0.01, 2.6]} color="#F2C230" r={0} />)}
  <Ground size={[3.2, 90]} at={[-5.6, -25]} y={0.02} color="#B9BDBF" map={tex('tiles', [3, 40])} /><Ground size={[3.2, 90]} at={[5.6, -25]} y={0.02} color="#B9BDBF" map={tex('tiles', [3, 40])} />
  <Shop x={-9.4} z={-5} w={6} h={7} c="#B5573F" awn="#2E7D4F" /><Shop x={-9.6} z={-12} w={6} h={9.5} c="#D9B38C" /><Shop x={-9.5} z={-20} w={6} h={7.5} c="#8F4A3C" awn="#C8453A" />
  <Shop x={9.4} z={-5} w={6} h={5.5} c="#C9CBC4" awn="#D94A38" /><Shop x={9.6} z={-12} w={6} h={8.5} c="#9C5A45" /><Shop x={9.5} z={-20} w={6} h={7} c="#C79E6E" awn="#1F5C99" />
  {/* mailbox, hydrant, streetlight, parked pickup (right side) */}
  <group position={[4.3, 0, 0.6]}><Cyl r={0.05} h={0.9} color="#555B63" /><Box pos={[0, 0.9, 0]} size={[0.5, 0.4, 0.38]} color="#2459A8" r={0.14} /></group>
  <group position={[-4.3, 0, 1.4]}><Cyl r={0.16} h={0.55} color="#D23A2E" /><Ball pos={[0, 0.62, 0]} r={0.17} color="#D23A2E" /><Box pos={[0, 0.36, 0]} size={[0.5, 0.1, 0.12]} color="#D23A2E" /></group>
  <group position={[-4.6, 0, -4]}><Cyl r={0.07} h={4.6} color="#3E434A" /><Box pos={[0.5, 4.5, 0]} size={[1.1, 0.12, 0.3]} color="#3E434A" /><Box pos={[1.0, 4.36, 0]} size={[0.4, 0.14, 0.3]} color="#FFE9A8" emissive="#FFE9A8" glow={1.2} /></group>
  <group position={[3.2, 0, -7]} rotation={[0, 0.06, 0]}><Box size={[1.9, 0.7, 4.2]} color="#B33A2E" rough={0.4} /><Box pos={[0, 0.7, 0.4]} size={[1.7, 0.6, 2]} color="#8FB6D6" rough={0.2} />
    {[[-0.95, 1.3], [0.95, 1.3], [-0.95, -1.3], [0.95, -1.3]].map(([x, z], i) => <Cyl key={i} pos={[x, 0.32, z]} rot={[0, 0, Math.PI / 2]} r={0.32} h={0.22} color="#222" />)}</group>
  <Rain t={t} n={800} c={[0, 0, -2]} w={16} d={22} top={10} h={10} />
</>);
const FloodFront: React.FC<{lvl: number}> = ({lvl}) => lvl < 0.01 ? null : <Box pos={[0, 0, -4]} size={[40, lvl, 40]} color="#3F8FC9" opacity={0.5} rough={0.15} cast={false} receive={false} r={0} />;
const FloodSheet: React.FC<{lvl: number}> = ({lvl}) => lvl < 0.01 ? null : <Ground size={[120, 120]} y={lvl} color="#4E9AD0" opacity={0.85} rough={0.1} />;
const START_CAM: Cam3 = {pos: [3, 2.3, 11], look: [0, 1.1, 0], fov: 36};
const IDLE = (t: number): Partial<PersonPose> => ({bounce: breathe(t), blink: bump(t % 3.3, 3.0, 3.16)});
const WET = 0.1;                                                  // ankle-deep water on the street from the first frame

const S1: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[0, START_CAM], [cs(1), {pos: [0.7, 1.7, 7], look: [0, 1.1, 0], fov: 34}]]);
  const up = kfs(t, [[K.rained - 0.1, 0], [K.rained + 0.4, 1]]);
  return (<World cam={cam} light={STREET} sky={STREET_SKY} scene={<><Town t={t} /><FloodSheet lvl={WET} /></>} front={<FloodFront lvl={WET} />}>
    {D([0, 0, 0.4], {...IDLE(t), view: 'front', handL: [-84, -230 + 20 * up], handR: [84, -230 + 20 * up], eyes: 'dot', mouth: 'smile', faceDy: -10 * up, lookY: -10 * up, browUp: 0.3 * up})}
  </World>);
};
const S2: React.FC<{t: number}> = ({t}) => {                      // c1: medium, she catches the rain, counts the years
  const u = t - cs(1);
  const cam = cam3At(u, [[0, {pos: [0.5, 1.5, 4.8], look: [0, 1.3, 0], fov: 30}], [CH[2] - cs(1), {pos: [0.2, 1.45, 4.1], look: [0, 1.3, 0], fov: 28}]]);
  return (<World cam={cam} light={STREET} sky={STREET_SKY} scene={<><Town t={t} /><FloodSheet lvl={WET} /></>} front={<FloodFront lvl={WET} />}>
    {D([0, 0, 0.4], {bounce: breathe(t), view: 'front', handL: [-70, -170 - 70 * bump(u, 0.2, 1.2)], handR: [78, -230 + 30 * Math.sin(u * 5)], eyes: 'wide', mouth: pick(t, [[0, 'o'], [K.hundred, 'open']]), browUp: 0.9, faceDy: -8, lookY: -10, headTilt: 4 * Math.sin(u * 2)})}
  </World>);
};
const S3: React.FC<{t: number}> = ({t}) => {                      // c2: low angle, the cloud bulges - "the sky couldn't hold it"
  const u = t - cs(2), sq = 1 + 0.07 * bump(u, 0.6, 1.8) + 0.02 * Math.sin(u * 9);
  const cam = cam3At(u, [[0, {pos: [0, 0.7, 6.2], look: [0, 4.2, -1], fov: 48}], [2.2, {pos: [0, 0.8, 5.4], look: [0, 4.6, -1], fov: 46}]]);
  const cl = (x: number, y: number, r: number, c: string) => <Ball key={x + '_' + y} pos={[x, y, -1]} r={r} color={c} scale={[sq, sq * 0.9, sq]} map={tex('speckle', [3, 2], 5)} rough={1} />;
  return (<World cam={cam} light={STREET} sky={STREET_SKY} scene={<><Town t={t} /><FloodSheet lvl={WET} />
    <group position={[0, 8.2, 0]}>{[cl(-2.2, 0, 1.5, '#6C7886'), cl(-0.8, 0.5, 1.9, '#7A8694'), cl(1, 0.4, 2, '#68737F'), cl(2.5, -0.1, 1.4, '#7A8694'), cl(0, -0.5, 1.6, '#5C6672')]}</group>
    <Rain t={t} n={500} c={[0, 0, -1]} w={7} d={4} top={7.5} h={7.5} />
  </>} front={<FloodFront lvl={WET} />}>
    {D([0, 0, 1.2], {bounce: breathe(t), view: 'front', handL: [-70, -150], handR: [70, -150], eyes: 'wide', mouth: 'o', browUp: 1, faceDy: -14, lookY: -14, headTilt: -5})}
  </World>);
};

// =============================================================================================== place 2: science room
const ROOM: Light = {sun: [3, 7, 6], sunColor: '#FFF1DA', sunI: 2.3, sky: '#FFF6E8', bounce: '#B98B68', ambI: 1.5, fog: ['#CDE7E1', 24, 70], focus: [0, 0, 0], span: 7};
const Room: React.FC = () => (<>
  <Ground size={[16, 16]} color="#D9C4A2" map={tex('checker', [16, 16])} />
  <Box pos={[0, 0, -3]} size={[14, 5, 0.2]} color="#7FC4B5" map={tex('speckle', [8, 3], 11)} r={0} />
  <Box pos={[-5, 0, 0]} rot={[0, Math.PI / 2, 0]} size={[10, 5, 0.2]} color="#74B9AA" map={tex('speckle', [6, 3], 12)} r={0} />
  <Box pos={[2.6, 1.7, -2.88]} size={[2.2, 1.7, 0.08]} color="#CFEAFF" rough={0.2} emissive="#CFEAFF" glow={0.4} /><Box pos={[2.6, 2.5, -2.82]} size={[2.4, 0.08, 0.12]} color="#F3E9DA" />
  <Box pos={[0, 0, -0.8]} size={[5.6, 0.95, 1.6]} color="#C98B5A" map={tex('planks', [4, 1])} r={0.04} />
</>);
const Jar: React.FC<{x?: number; z?: number; s?: number; level: number; H?: number; r?: number; vap?: number; t: number}> = ({x = 0, z = -0.8, s = 1, level, H = 2.1, r = 0.46, vap = 0, t}) => (
  <group position={[x, 0.95, z]} scale={s}>
    <Cyl r={r + 0.03} h={H} color="#CFEFFF" opacity={0.22} rough={0.08} cast={false} />
    {level > 0.004 && <Cyl r={r - 0.01} h={level} color="#3FA7F5" opacity={0.9} rough={0.2} cast={false} />}
    {vap > 0 && Array.from({length: 7}, (_, i) => { const ph = (rnd(i + 3) + cyc(t, 12)) % 1; return <Ball key={i} pos={[(rnd(i) - 0.5) * r * 1.2, 0.2 + ph * (H - 0.5), (rnd(i + 9) - 0.5) * r]} r={0.08 + 0.05 * rnd(i + 1)} color="#FFFFFF" opacity={0.55 * vap} cast={false} />; })}
    <Box pos={[r + 0.12, 0, 0]} size={[0.07, H, 0.05]} color="#F4E9D2" map={tex('stripes', [1, 11])} r={0.01} />
  </group>);
const S4: React.FC<{t: number}> = ({t}) => {                      // c3-c5: "the whole atmosphere carries only about one inch of water"
  const u = t - cs(3), s = pop(t, CH[3] + 0.1, 0.5);
  const lvl = kfs(t, [[CH[5] - 0.1, 0], [CH[5] + 0.7, 0.09]]);
  const push = kfs(t, [[CH[5] - 0.2, 0], [CH[5] + 1.0, 1]]);
  const cam = cam3At(u, [[0, {pos: [0.3, 2.3, 7.4], look: [0.4, 1.9, -0.8], fov: 34}], [CH[5] - cs(3) - 0.2, {pos: [0.3, 2.0, 6.0], look: [0.4, 1.9, -0.8], fov: 32}], [CH[5] - cs(3) + 1.0, {pos: [0.7, 1.15, 3.6], look: [0.55, 1.15, -0.8], fov: 26}]]);
  return (<World cam={cam} light={ROOM} sky={['#A9D8CE', '#CDE7E1']} scene={<><Room /><Jar x={0.7} level={lvl} s={Math.max(0.001, s)} vap={s > 0.5 ? 1 : 0} t={t} /></>}>
    {D([-0.7, 0.95, -0.2], {bounce: breathe(t), view: 'right', handL: [-60, -150], handR: [70 + 20 * push, -230 + 30 * push], eyes: 'dot', mouth: pick(t, [[0, 'smile'], [CH[5], 'o']]), browUp: 0.8 * push, faceDx: 18, lookX: 8})}
    <Tag text="not to scale" show={pop(t, CH[5] + 0.6, 0.3)} />
  </World>);
};
const S6: React.FC<{t: number}> = ({t}) => {                      // c6-c7: it falls out; nine days tick by
  const u = t - cs(6), end = CH[7] + 1.6;
  const lvl = 0.09 * (1 - kfs(t, [[cs(6), 0], [K.nine - 0.3, 1]]));
  const tray = 0.06 * kfs(t, [[cs(6) + 0.2, 0], [K.nine + 0.6, 1]]);
  const cam = cam3At(u, [[0, {pos: [0.5, 1.5, 4.4], look: [0.1, 1.3, -0.6], fov: 32}], [end - cs(6), {pos: [0.3, 1.9, 5.6], look: [0.1, 1.5, -0.6], fov: 34}]]);
  const nine = Array.from({length: 9}, (_, i) => pop(t, cs(6) + 0.5 + i * ((K.nine + 0.7 - cs(6) - 0.5) / 9), 0.3));
  return (<World cam={cam} light={ROOM} sky={['#A9D8CE', '#CDE7E1']} scene={<><Room /><Jar x={0.5} level={lvl} t={t} vap={0.6} />
    <Cyl pos={[0.5, 0.95, 0.15]} r={0.9} h={0.05 + tray} color="#3FA7F5" opacity={0.85} rough={0.2} cast={false} />
    {nine.map((p, i) => p > 0.01 && <group key={i} position={[-1.6 + i * 0.4, 2.7, -2.5]}><Ball r={0.15 * p} color="#FFD23F" emissive="#FFC400" glow={0.9} cast={false} /></group>)}
    <Rain t={t} n={120} c={[0.5, 0.95, 0.15]} w={0.6} d={0.6} top={1.9} h={1.9} cycles={42} color="#8FD0FF" />
  </>}>
    {D([-0.9, 0.95, 0.3], {bounce: breathe(t), view: 'right', handR: [60, -170], handL: [-64, -140], eyes: 'dot', mouth: 'o', browUp: 0.6, faceDx: 16, headTilt: 3 * Math.sin(u * 2)})}
  </World>);
};

// =============================================================================================== place 3: sunny coast
const COAST: Light = {sun: [-6, 5, -4], sunColor: '#FFE2B0', sunI: 2.8, sky: '#CFE8FF', bounce: '#8AB8D8', ambI: 1.2, fog: ['#D9ECF7', 22, 90], focus: [0, 0, -3], span: 12};
const Coast: React.FC<{t: number; cam: Cam3; sunGlow?: number; dana?: Partial<PersonPose>; cloudsOn?: boolean}> = ({t, cam, sunGlow = 1, dana = {}}) => {
  const N = 26, PER = 14;
  return (<World cam={cam} light={COAST} sky={['#6FB5EE', '#FBE7C8']} scene={<>
    <Ground color="#2F8FC4" rough={0.25} map={tex('stripes', [1, 60], 3)} />
    {[0, 1, 2, 3].map((i) => <Box key={i} pos={[0, 0.03, -3 - ((cyc(t, 6) + i / 4) % 1) * 14]} size={[40, 0.03, 0.14]} color="#EAF6FF" r={0} cast={false} />)}
    <Box pos={[0, 0.5, 0]} size={[2.6, 0.22, 16]} color="#B88A5C" map={tex('planks', [1, 8])} r={0.02} />
    {[-1.1, 1.1].map((x) => [-6, -2, 2, 6].map((z) => <Cyl key={x + '_' + z} pos={[x, -0.4, z]} r={0.1} h={1.0} color="#7A5A3A" />))}
    <Ball pos={[-9, 5.5, -22]} r={3} color="#FFD54A" emissive="#FFC83A" glow={1.4 * sunGlow} cast={false} /><Ball pos={[-9, 5.5, -22.2]} r={4.4} color="#FFE9A8" opacity={0.28} cast={false} />
    <group position={[0, 8.6, -7]}>{[[-3, 0, 1.6], [-1, 0.5, 2.1], [1.2, 0.3, 2.2], [3.2, -0.1, 1.5]].map(([x, y, r], i) => <Ball key={i} pos={[x, y, 0]} r={r} color="#E9EEF3" map={tex('speckle', [3, 2], 8)} rough={1} />)}</group>
    {Array.from({length: N}, (_, i) => { const ph = (rnd(i + 1) * 0 + i / N + cyc(t, PER)) % 1; return <Ball key={i} pos={[(rnd(i) - 0.5) * 9, 0.4 + ph * 7.8, -7 + (rnd(i + 5) - 0.5) * 3]} r={0.1 + 0.12 * ph} color="#FFFFFF" opacity={0.7 * Math.sin(Math.PI * ph)} cast={false} />; })}
    <Rain t={t} n={260} c={[0, 0, -7]} w={8} d={3} top={8.2} h={8.2} cycles={42} color="#F2F8FF" op={0.6} />
  </>}>
    {D([0, 0.61, 0.5], {bounce: breathe(t), view: 'front', ...dana})}
  </World>);
};
const S7: React.FC<{t: number}> = ({t}) => {                      // c8-c10: sea and rain
  const u = t - cs(8);
  const cam = cam3At(u, [[0, {pos: [2.2, 2.4, 8.6], look: [0, 3.0, -4], fov: 38}], [cs(11) - cs(8), {pos: [1.2, 2.0, 7.2], look: [0, 3.2, -4], fov: 36}]]);
  return <Coast t={t} cam={cam} dana={{view: 'front', eyes: 'dot', mouth: 'smile', handR: [90, -300], handL: [-70, -140], faceDy: -10, lookY: -10}} />;
};
const S8: React.FC<{t: number}> = ({t}) => {                      // c11: high angle on the loop
  const u = t - cs(11);
  const cam = cam3At(u, [[0, {pos: [4, 9, 6], look: [0, 3, -5], fov: 42}], [CH[12] - cs(11), {pos: [-2, 10, 5], look: [0, 3, -5], fov: 44}]]);
  return <Coast t={t} cam={cam} dana={{view: 'front', eyes: 'wide', mouth: 'grin', handR: [80, -250], handL: [-80, -250], browUp: 0.5}} />;
};

// =============================================================================================== place 4: Earth in space
const SPACE: Light = {sun: [6, 3, 5], sunColor: '#FFF3DC', sunI: 3.0, sky: '#3A4A8C', bounce: '#0B1033', ambI: 0.8, fog: ['#0B1033', 40, 120], focus: [0, 0, 0], span: 6};
const S9a: React.FC<{t: number}> = ({t}) => {                     // c12: Earth does it already
  const u = t - cs(12);
  const cam = cam3At(u, [[0, {pos: [0, 0.3, 9], look: [0, 0, 0], fov: 34}], [CH[13] - cs(12), {pos: [0, 0.2, 7.2], look: [0, 0, 0], fov: 34}]]);
  const spin = u * 0.7;
  return (<World cam={cam} light={SPACE} sky={['#070A24', '#1C2A6B']} scene={<>
    <group rotation={[0.3, spin, 0]}><Ball r={2.2} color="#2E7FD0" rough={0.5} map={tex('speckle', [6, 3], 21)} />
      {[[1.4, 1.2, 1.2, 0.6], [-1.2, 0.2, 1.8, 0.8], [0.2, -1.4, 1.7, 0.7], [-0.4, 1.6, -1.5, 0.55], [1.7, -0.5, -1.3, 0.7]].map(([x, y, z, s], i) => <Ball key={i} pos={[x, y, z]} r={s} color="#4FA457" scale={[1, 0.35, 1]} rough={0.9} cast={false} />)}</group>
    <group rotation={[0.3, -spin * 1.6, 0]}>{Array.from({length: 14}, (_, i) => <Ball key={i} pos={[Math.cos(i * 0.9) * 2.5, Math.sin(i * 1.7) * 1.7, Math.sin(i * 0.9) * 2.5]} r={0.28} color="#FFFFFF" scale={[1.4, 0.7, 1]} cast={false} opacity={0.9} />)}</group>
  </>} />);
};
const S9b: React.FC<{t: number}> = ({t}) => {                     // c13: forty refills, one jar each
  const u = t - cs(13), t0 = cs(13) + 0.2;
  const cam = cam3At(u, [[0, {pos: [0, 2.6, 8.4], look: [0, 2.5, 0], fov: 40}], [CH[14] - cs(13), {pos: [0, 2.7, 7.6], look: [0, 2.5, 0], fov: 38}]]);
  return (<World cam={cam} light={ROOM} sky={['#A9D8CE', '#CDE7E1']} scene={<>
    <Ground size={[16, 16]} color="#D9C4A2" map={tex('checker', [16, 16])} />
    <Box pos={[0, 0, -0.6]} size={[3.1, 5.3, 0.15]} color="#74B9AA" map={tex('speckle', [3, 5], 15)} r={0.04} />
    {Array.from({length: 40}, (_, i) => { const c = i % 5, r = Math.floor(i / 5), f = clamp((t - (t0 + i * 0.05)) / 0.25), x = (c - 2) * 0.55, y = 0.35 + r * 0.62;
      return (<group key={i} position={[x, y, 0]}><Cyl r={0.16} h={0.52} color="#CFEFFF" opacity={0.3} rough={0.1} cast={false} />{f > 0.01 && <Cyl r={0.14} h={0.46 * f} color="#3FA7F5" opacity={0.95} cast={false} />}</group>); })}
  </>} />);
};

// =============================================================================================== place 1 again: the flood
const S10: React.FC<{t: number}> = ({t}) => {                     // c14-c15: three and a half feet
  const u = t - cs(14), lvl = WET + (1.07 - WET) * eio((t - (CH[15] - 0.1)) / 1.6);
  const cam = cam3At(u, [[0, {pos: [1.0, 1.1, 5.0], look: [0, 0.9, 0], fov: 32}], [CH[16] - cs(14), {pos: [0.4, 1.0, 4.2], look: [0, 0.85, 0], fov: 30}]]);
  return (<World cam={cam} light={STREET} sky={STREET_SKY} scene={<><Town t={t} /><FloodSheet lvl={lvl} />
    <group position={[0.85, 0, 0.5]}><Box size={[0.14, 1.07, 0.14]} color="#F5F0E0" map={tex('stripes', [1, 3.5])} r={0.02} /></group></>} front={<FloodFront lvl={lvl} />}>
    {D([0, 0, 0.4], {bounce: breathe(t), view: 'front', handL: [-60, -150 + 50 * bump(t, K.feet, K.feet + 1.2)], handR: [64, -150], eyes: 'dot', mouth: pick(t, [[0, 'flat'], [K.feet, 'o']]), browUp: pick(t, [[0, 0], [K.feet, 0.8]]), sweat: kfs(t, [[K.feet, 0], [K.feet + 0.6, 1]])})}
  </World>);
};
const Tower: React.FC<{t: number; t0: number}> = ({t, t0}) => (<>{Array.from({length: 100}, (_, i) => { const s = clamp((t - (t0 + i * 0.011)) / 0.1);
  return s > 0.01 ? <Box key={i} pos={[0, i * 0.17, 0]} size={[1.3, 0.16, 1.3]} scale={[1, s, 1]} color={i % 2 ? '#3F8FC9' : '#5AA6DD'} map={tex('stripes', [4, 1])} r={0.02} /> : null; })}</>);
const S11a: React.FC<{t: number}> = ({t}) => {                   // c16: a century of year-blocks
  const u = t - cs(16), t0 = cs(16) + 0.15;
  const cam = cam3At(u, [[0, {pos: [3.2, 1.2, 8.5], look: [0, 1.5, 0], fov: 38}], [CH[17] - cs(16), {pos: [3.0, 7.5, 13], look: [0, 7.5, 0], fov: 40}]]);
  return (<World cam={cam} light={STREET} sky={STREET_SKY} scene={<><Town t={t} /><FloodSheet lvl={WET} /><group position={[0, 0, -1]}><Tower t={t} t0={t0} /></group></>} front={<FloodFront lvl={WET} />}>
    {D([-1.6, 0, 1.2], {bounce: breathe(t), view: 'right', handR: [70, -290], handL: [-60, -140], eyes: 'wide', mouth: 'o', browUp: 0.9, faceDy: -8, lookY: -10})}
  </World>);
};
const S11b: React.FC<{t: number}> = ({t}) => {                   // c17-c18: the same water, falling again and again
  const u = t - cs(17), lvl = 0.1 + 2.6 * kfs(t, [[cs(17), 0], [CH[19] - 0.05, 1]]);
  const cam = cam3At(u, [[0, {pos: [0.4, 2.0, 7.4], look: [0, 1.7, 0], fov: 38}], [CH[19] - cs(17), {pos: [0.2, 2.0, 6.2], look: [0, 1.7, 0], fov: 36}]]);
  return (<World cam={cam} light={ROOM} sky={['#A9D8CE', '#CDE7E1']} scene={<><Room />
    <group position={[0, 0.95, -0.8]}><Box size={[2.6, 3.0, 1.3]} color="#CFEFFF" opacity={0.2} rough={0.08} cast={false} r={0.02} /><Box pos={[0, 0.02, 0]} size={[2.5, lvl, 1.2]} color="#3FA7F5" opacity={0.9} rough={0.2} cast={false} r={0} /></group>
    <Rain t={t} n={900} c={[0, 0.95, -0.8]} w={2.4} d={1.1} top={3.2} h={3.2} cycles={126} color="#9AD7FF" op={0.9} /></>}>
    {D([-1.9, 0.95, 0.4], {bounce: breathe(t), view: 'right', handR: [66, -230 + 20 * Math.sin(u * 4)], handL: [-60, -140], eyes: 'wide', mouth: 'open', browUp: 0.9, faceDx: 14})}
  </World>);
};
const POLE_H = 112;
const S12: React.FC<{t: number}> = ({t}) => {                    // c19-c21: three hundred and forty feet deep
  const L = 104 * eio((t - cs(19)) / (CH[21] - cs(19) - 0.1));
  const wob = 0.1 * Math.sin(TAU * cyc(t, 63));
  const u = t - cs(21), crane = kfs(t, [[CH[21] - 0.1, 0], [CH[22] - 0.25, 1]]);
  const cam = cam3At(t, [[cs(19), {pos: [2.4, 2.4, 6.0], look: [0, 1.4, 0], fov: 34}]]);
  const c: Cam3 = {pos: [2.4 + 6 * crane, L + 2.0 + 30 * crane, 6 + 14 * crane], look: [0, L + 1.2 - 4 * crane, 0], fov: 34 + 6 * crane};
  void cam; void u;
  return (<World cam={c} light={STREET} sky={['#7FB0DB', '#C9DFEE']} scene={<><Town t={t} /><FloodSheet lvl={L} />
    <Box pos={[1.6, 0, 0.4]} size={[0.3, POLE_H, 0.3]} color="#F5F0E0" map={tex('stripes', [1, POLE_H / 2])} r={0.03} />
    <Cyl pos={[0, L + wob, 0.4]} r={1.0} h={0.3} color="#F28C28" rough={0.5} />
    {[[-9, 0.4, -10], [8, 0.3, -14], [-5, 0.5, -20]].map(([x, y, z], i) => <Ball key={i} pos={[x, L + 0.2, z]} r={0.4} color="#FFFFFF" cast={false} />)}</>}>
    {D([0, L + 0.3 + wob, 0.4], {bounce: breathe(t), view: 'front', handL: [-70, -150], handR: [70, -150], eyes: pick(t, [[0, 'dot'], [K.deep, 'wide']]), mouth: pick(t, [[0, 'flat'], [K.deep, 'o']]), browUp: pick(t, [[0, 0.2], [K.deep, 1]])})}
  </World>);
};
const S13: React.FC<{t: number}> = ({t}) => {                    // c22: "Rain isn't a supply" - reaction close-up
  const u = t - cs(22), L = 104;
  const cam = cam3At(u, [[0, {pos: [0.3, L + 1.6, 3.6], look: [0, L + 1.3, 0], fov: 24}], [CH[23] - cs(22), {pos: [0.1, L + 1.55, 3.2], look: [0, L + 1.3, 0], fov: 23}]]);
  return (<World cam={cam} light={STREET} sky={['#7FB0DB', '#C9DFEE']} scene={<><FloodSheet lvl={L} /><Cyl pos={[0, L, 0.4]} r={1.0} h={0.3} color="#F28C28" rough={0.5} /></>}>
    {D([0, L + 0.3, 0.4], {bounce: breathe(t), view: 'front', handL: [-110 - 10 * spring(t, K.supply, 3, 4), -210 + 10 * spring(t, K.supply, 3, 4)], handR: [110 + 10 * spring(t, K.supply, 3, 4), -210], eyes: 'closed', mouth: 'smirk', browUp: 0.7, headTilt: 7 * kfs(t, [[K.supply - 0.2, 0], [K.supply + 0.4, 1]]), blink: 0})}
  </World>);
};
const S14: React.FC<{t: number}> = ({t}) => {                    // c23-c24: a loop, run by the Sun
  const u = t - cs(23), glow = 1 + 0.8 * bump(t, K.sun - 0.1, K.sun + 0.9);
  const cam = cam3At(u, [[0, {pos: [5, 4.5, 9], look: [-1, 4.5, -8], fov: 44}], [CH[25] - cs(23), {pos: [-3.5, 3.8, 8.5], look: [-3, 5, -10], fov: 44}]]);
  return <Coast t={t} cam={cam} sunGlow={glow} dana={{view: 'front', eyes: 'dot', mouth: 'smile', handR: [92, -300], handL: [-70, -140], faceDy: -8, lookY: -8, browUp: 0.3}} />;
};
const S15: React.FC<{t: number}> = ({t}) => {                    // c25-c26: back on the street - the last frame equals frame 0
  const s = cs(25), look = bump(t, K.subscribe, DURATION - 0.55) > 0 ? kfs(t, [[K.subscribe, 0], [K.subscribe + 0.3, 1], [DURATION - 1.0, 1], [DURATION - 0.6, 0]]) : 0;
  const cam = cam3At(t, [[s, {pos: [0.7, 1.7, 7], look: [0, 1.1, 0], fov: 34}], [DURATION - 2.0, {pos: [1.2, 1.9, 8.6], look: [0, 1.1, 0], fov: 35}], [DURATION, START_CAM]]);
  return (<World cam={cam} light={STREET} sky={STREET_SKY} scene={<><Town t={t} /><FloodSheet lvl={WET} /></>} front={<FloodFront lvl={WET} />}>
    {D([0, 0, 0.4], {...IDLE(t), view: 'front', handL: [-84, -230], handR: [84, -230], eyes: 'dot', mouth: 'smile', faceDy: -22 * look, lookY: -22 * look, browUp: 0.9 * look})}
  </World>);
};

export const Short: React.FC<{voice?: boolean; captions?: boolean; guides?: boolean}> = ({captions = true, guides = false}) => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps;
  return (<AbsoluteFill style={{background: '#000'}}>
    <Cuts t={t} shots={[[0, <S1 t={t} />], [cs(1), <S2 t={t} />], [cs(2), <S3 t={t} />], [cs(3), <S4 t={t} />], [cs(6), <S6 t={t} />], [cs(8), <S7 t={t} />], [cs(11), <S8 t={t} />],
      [cs(12), <S9a t={t} />], [cs(13), <S9b t={t} />], [cs(14), <S10 t={t} />], [cs(16), <S11a t={t} />], [cs(17), <S11b t={t} />], [cs(19), <S12 t={t} />], [cs(22), <S13 t={t} />],
      [cs(23), <S14 t={t} />], [cs(25), <S15 t={t} />]]} />
    <Cta t={t} tIn={K.subscribe} tClick={K.whatif} tBell={K.whatif + 0.5} tOut={DURATION - 0.75} />
    {captions && <Captions t={t} />}
    {guides && <SafeGuides />}
  </AbsoluteFill>);
};
export const Thumb: React.FC<{variant: 'A' | 'B' | 'C'}> = ({variant}) => (<AbsoluteFill style={{background: '#000'}}>
  {variant === 'A' ? <S2 t={cs(1) + 0.9} /> : variant === 'B' ? <S13 t={cs(22) + 1.0} /> : <S12 t={CH[21] + 0.6} />}
  {variant === 'A' && <ThumbText l1="100 YEARS" l2="OF RAIN?" />}{variant === 'B' && <ThumbText l1="IT'S A" l2="LOOP" />}{variant === 'C' && <ThumbText l1="340 FEET" l2="DEEP" />}
</AbsoluteFill>);
