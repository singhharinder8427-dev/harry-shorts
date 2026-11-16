/* "Why does an airplane window have a tiny hole?" - harry-animator v3.
 * Flat 2D cel cast (Mia, Otto) composited into stylized 3D sets: an airliner cabin, a high sky, and a dark cutaway stage. */
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import * as THREE from 'three';
import timing from './timing.json';
import {Captions, SafeGuides} from './Captions';
import {Person, PersonPose} from './Cast';
import {Cta, ThumbText} from './Cta';
import {mix} from './color';
import {Ball, Box, Cam3, Cel, Cuts, Cyl, Ground, Light, V3, World, cam3At, tex} from './World3D';
import {bump, clamp, kfs, lerp, pick, prog, rnd, smooth, spring} from './math';

const T = timing as any; const K = T.keys as Record<string, number>; const CH = (T.chunks as {start: number}[]).map((c) => c.start);
export const DURATION = T.duration as number; const END = DURATION;
const C = (i: number) => CH[i] - 0.12;                                                     // clean cut just before chunk i
const loopS = (t: number, n: number, ph = 0) => Math.sin(2 * Math.PI * (n * t / DURATION + ph));   // whole cycles over the video (loop-safe)

// ---------------------------------------------------------------- cast (fixed for the whole video)
const MIA_O = {shirt: '#F2B134', hair: '#1E1A1A', hairStyle: 'bun' as const};
const OTTO_O = {shirt: '#6B8E4E', hair: '#6B4A2E', hairStyle: 'sides' as const, glasses: true};
const Mia: React.FC<Partial<PersonPose>> = (p) => <Person {...p} id="mia" outfit={MIA_O} />;
const Otto: React.FC<Partial<PersonPose>> = (p) => <Person {...p} id="otto" outfit={OTTO_O} />;
const PM: V3 = [-0.62, 0, -0.55], PO: V3 = [0.62, 0, -0.55];
const idle = (t: number, n = 17) => 2.5 * (1 + loopS(t, n));                                  // breath: 0 at t=0 and t=END

// the opening / closing pose (the last frame equals frame 0)
const MIA0: Partial<PersonPose> = {view: 'right', handR: [108, -272], handL: [-70, -128], eyes: 'dot', mouth: 'smile', browUp: 0.3};
const OTTO0: Partial<PersonPose> = {view: 'left', handL: [24, -168], handR: [-24, -162], eyes: 'dot', mouth: 'flat', brow: 0.5};

// ---------------------------------------------------------------- the cabin (3D set)
const WALLZ = -1.2;
const CAB: Light = {sun: [3, 5, 4], sunColor: '#FFF1DC', sunI: 2.1, sky: '#FFF6E8', bounce: '#8FA8A6', ambI: 1.5, fog: ['#EADFCB', 16, 50], focus: [0, 0.8, -0.5], span: 5};
const CAB_SKY: [string, string] = ['#EFE6D3', '#EFE6D3'];
const Win: React.FC<{x?: number; hole?: boolean; haze?: number; sc?: number}> = ({x = 0, hole = true, haze = 0, sc = 1}) => (<group position={[x, 0, WALLZ]} scale={sc}>
  <Box pos={[0, 0.88, 0.02]} size={[0.62, 0.8, 0.06]} color="#E4DCCB" r={0.14} rough={0.6} />
  <Box pos={[0, 0.93, 0.07]} size={[0.44, 0.68, 0.04]} color="#74B8EE" r={0.1} rough={0.2} emissive="#9ED3F7" glow={0.75} />
  <Box pos={[0, 0.93, 0.1]} size={[0.44, 0.68, 0.01]} color="#D6ECFB" opacity={0.3} r={0.1} rough={0.1} cast={false} />
  {hole && <Cyl pos={[0, 1.12, 0.112]} rot={[Math.PI / 2, 0, 0]} r={0.02} h={0.012} color="#0B0B0D" cast={false} />}
  {haze > 0.01 && <Box pos={[0, 0.93, 0.125]} size={[0.44, 0.68, 0.01]} color="#F4F7FA" opacity={haze} r={0.1} cast={false} />}
</group>);
const Cabin: React.FC<{wins?: number[]; haze?: number; hole?: boolean; sc?: number; seats?: boolean}> = ({wins = [0], haze = 0, hole = true, sc = 1, seats = true}) => (<>
  <Ground size={[16, 16]} color="#6E767C" map={tex('speckle', [24, 24], 5)} />
  <Box pos={[0, 0, WALLZ - 0.12]} size={[16, 3.4, 0.2]} color="#EFE6D3" map={tex('speckle', [10, 3], 8)} r={0} />
  <Box pos={[0, 0, WALLZ - 0.03]} size={[16, 0.62, 0.08]} color="#BDB09A" map={tex('panels', [14, 1], 3)} r={0.02} />
  <Box pos={[0, 2.2, WALLZ + 0.25]} size={[16, 0.8, 0.5]} color="#F7F2E8" map={tex('panels', [12, 1], 4)} r={0.12} />
  {wins.map((x, i) => <Win key={i} x={x} hole={hole} haze={haze} sc={sc} />)}
  {seats && [PM, PO].map((p, i) => <group key={i}>
    <Box pos={[p[0], 0, -0.98]} size={[0.8, 1.22, 0.2]} color="#1F8A8A" map={tex('speckle', [3, 3], 12)} r={0.1} />
    <Box pos={[p[0], 1.02, -0.98]} size={[0.5, 0.3, 0.22]} color="#E9E3D4" r={0.08} /></group>)}
</>);
const Cushions: React.FC = () => (<>{[PM, PO].map((p, i) => <Box key={i} pos={[p[0], 0, -0.3]} size={[0.8, 0.5, 0.52]} color="#1F8A8A" map={tex('speckle', [3, 3], 14)} r={0.1} />)}</>);

// ---------------------------------------------------------------- shot 1: the opening two-shot (also the closing one)
const CAM0: Cam3 = {pos: [0, 1.55, 5.4], look: [0, 0.95, -0.8], fov: 34};
const Open: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[0, CAM0], [C(1), {pos: [0.05, 1.5, 4.7], look: [0, 1.0, -0.8], fov: 33}]]);
  const hot = t > K.hole + 0.1;
  return (<World cam={cam} light={CAB} sky={CAB_SKY} scene={<Cabin />} front={<Cushions />}>
    <Cel at={PM}><Mia {...MIA0} bounce={idle(t)} eyes={hot ? 'wide' : 'dot'} browUp={hot ? 0.9 : 0.3} mouth={hot ? 'o' : 'smile'} headTilt={hot ? 4 * spring(t, K.hole, 2.5, 4) : 0} blink={bump(t, 0.9, 1.06)} /></Cel>
    <Cel at={PO}><Otto {...OTTO0} bounce={idle(t, 19)} eyes={hot ? 'squeeze' : 'dot'} brow={0.5} headTilt={hot ? -3 : 0} /></Cel>
  </World>);
};
// ---------------------------------------------------------------- shot 2: macro on the hole
const Macro: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C(1), {pos: [0.04, 1.32, 0.9], look: [0, 1.24, WALLZ], fov: 30}], [C(2), {pos: [0.01, 1.28, 0.45], look: [0, 1.16, WALLZ], fov: 28}]]);
  return <World cam={cam} light={{...CAB, focus: [0, 1.2, -1], span: 3}} sky={CAB_SKY} scene={<Cabin seats={false} />} />;
};
// ---------------------------------------------------------------- shot 3: Otto is sure it is a mistake
const OttoSure: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C(2), {pos: [1.0, 1.45, 3.9], look: [0.62, 1.1, -0.55], fov: 30}], [C(4), {pos: [0.9, 1.4, 3.5], look: [0.62, 1.12, -0.55], fov: 29}]]);
  const red = kfs(t, [[K.sure - 0.25, 0], [K.sure + 0.25, 0.9]]);
  return (<World cam={cam} light={{...CAB, focus: [0.4, 1, -0.5], span: 4}} sky={CAB_SKY} scene={<Cabin />} front={<Cushions />}>
    <Cel at={PO}><Otto view="left" handL={[24, -168]} handR={[-24, -162]} eyes="squeeze" mouth="teeth" brow={0.9} tint="#E5483D" tintAmt={red} steam={red} t={t}
      bounce={idle(t, 19) + 3 * bump(t, K.mistake - 0.1, K.mistake + 0.4)} headTilt={-4 * spring(t, K.sure, 2, 3)} /></Cel>
  </World>);
};
// ---------------------------------------------------------------- shot 4: Mia, smug, "It isn't."
const MiaSmug: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C(4), {pos: [-0.5, 1.35, 3.2], look: [-0.62, 1.1, -0.55], fov: 28}], [C(5), {pos: [-0.55, 1.33, 2.95], look: [-0.62, 1.1, -0.55], fov: 27}]]);
  const up = t > K.isnt - 0.05;
  return (<World cam={cam} light={{...CAB, focus: [-0.5, 1, -0.5], span: 4}} sky={CAB_SKY} scene={<Cabin />} front={<Cushions />}>
    <Cel at={PM}><Mia view="front" handR={up ? [70, -330 + 6 * Math.sin(t * 9)] : [78, -120]} handL={[-74, -126]} eyes={up ? 'closed' : 'dot'} mouth={up ? 'smirk' : 'smile'} browUp={0.5}
      headTilt={up ? 5 * spring(t, K.isnt - 0.05, 2.5, 4) : 0} bounce={idle(t)} /></Cel>
  </World>);
};

// ---------------------------------------------------------------- the high sky (3D set)
const SKYL: Light = {sun: [-4, 5, 4], sunColor: '#FFF5E0', sunI: 2.5, sky: '#CFE4FF', bounce: '#F2F7FF', ambI: 1.4, fog: ['#CFE3F7', 40, 140], focus: [0, 0, 0], span: 9};
const Cloud: React.FC<{x: number; y: number; z: number; s?: number}> = ({x, y, z, s = 1}) => (<group position={[x, y, z]} scale={s}>
  {[[0, 0, 0, 1.0], [-1.0, -0.15, 0.2, 0.75], [1.0, -0.1, 0, 0.8], [0.4, 0.4, 0.3, 0.7], [-0.5, 0.35, -0.2, 0.65]].map(([a, b, c, r], i) =>
    <Ball key={i} pos={[a, b, c]} r={r} scale={[1.2, 0.8, 1]} color="#FFFFFF" rough={1} cast={false} />)}
</group>);
const Plane: React.FC<{pos: V3; s?: number}> = ({pos, s = 1}) => (<group position={pos} scale={s}>
  <Cyl pos={[-2.5, 0, 0]} rot={[0, 0, -Math.PI / 2]} r={0.46} rTop={0.4} h={5} color="#F4F6F8" rough={0.4} />
  <Ball pos={[2.5, 0, 0]} r={0.43} scale={[1.5, 1, 1]} color="#F4F6F8" rough={0.4} />
  <Box pos={[0.3, -0.22, 0]} size={[0.9, 0.06, 4.0]} color="#9AA3AD" rough={0.5} r={0.02} />
  <Box pos={[-2.2, 0.3, 0]} size={[0.7, 1.0, 0.07]} color="#D8403B" rough={0.5} r={0.02} />
  <Box pos={[-2.2, 0.08, 0]} size={[0.5, 0.05, 1.5]} color="#9AA3AD" rough={0.5} r={0.02} />
  {[0.8, -0.8].map((z, i) => <Cyl key={i} pos={[0.55, -0.62, z]} rot={[0, 0, -Math.PI / 2]} r={0.2} h={0.8} color="#7A828C" rough={0.4} />)}
  {Array.from({length: 14}, (_, i) => <Ball key={i} pos={[-1.7 + i * 0.26, 0.1, 0.43]} r={0.055} scale={[1, 1.2, 0.3]} color="#2B4A73" rough={0.3} cast={false} />)}
</group>);
const SkyScene: React.FC<{t: number; plane?: V3; ps?: number}> = ({t, plane = [0, 0, -4], ps = 1}) => (<>
  <Ground size={[300, 300]} y={-3.4} color="#EAF2FB" rough={1} map={tex('speckle', [90, 90], 6)} />
  {[[-6, -2.4, -8, 2.2], [5, -2.6, -12, 2.8], [-9, -2.2, -18, 3.2], [8, -2.4, -4, 1.6], [0, -2.8, -24, 3.5], [-3, -2.7, 4, 1.4]].map(([x, y, z, s], i) => <Cloud key={i} x={x} y={y} z={z} s={s} />)}
  <Ball pos={[-14, 9, -60]} r={3.2} color="#FFF2C9" emissive="#FFE9A8" glow={1} cast={false} />
  <Plane pos={plane} s={ps} />
</>);
const SKY_C: [string, string] = ['#2F78C8', '#CFE6F7'];
const SkyWide: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C(5), {pos: [0, 1.4, 12], look: [0, 0.4, 0], fov: 36}], [C(6), {pos: [0.3, 1.2, 12], look: [0.3, 0.4, 0], fov: 35}]]);
  const x = kfs(t, [[C(5), -2.2], [C(6), 1.0]]);
  return <World cam={cam} light={SKYL} sky={SKY_C} scene={<SkyScene t={t} plane={[x, 0.2, -1]} ps={0.85} />} />;
};
const OttoThin: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C(6), {pos: [0.2, 1.7, 7.4], look: [0.1, 1.55, 0], fov: 34}], [C(7), {pos: [0.1, 1.7, 6.6], look: [0.1, 1.55, 0], fov: 33}]]);
  const blue = kfs(t, [[K.thin - 0.7, 0], [K.thin - 0.3, 0.85]]);
  return (<World cam={cam} light={{...SKYL, focus: [0, 1, 0], span: 6}} sky={SKY_C} scene={<SkyScene t={t} plane={[-3.5, 1.4, -9]} ps={1.1} />}>
    <Cel at={[0.1, 0, 0]} lift={1.1} shadow={false}><Otto view="front" tint="#8CC4F2" tintAmt={blue} handL={[-26, -300 + 8 * Math.sin(t * 17)]} handR={[26, -300 - 8 * Math.sin(t * 17)]} eyes="wide" mouth="o"
      brow={-0.9} browUp={0.8} headTilt={5 * Math.sin(t * 8)} bounce={4 * Math.abs(Math.sin(t * 6))} footL={[-34, -5 + 12 * Math.sin(t * 5)]} footR={[34, -5 - 12 * Math.sin(t * 5)]} /></Cel>
  </World>);
};

// ---------------------------------------------------------------- the cutaway stage (3D set, dark navy)
const STAGE: Light = {sun: [-3, 6, 4], sunColor: '#FFFFFF', sunI: 2.1, sky: '#9DB4FF', bounce: '#2A3166', ambI: 1.25, fog: ['#141B3E', 10, 34], focus: [0, 0.6, 0], span: 4.5};
const STAGE_SKY: [string, string] = ['#0F1733', '#243061'];
const Stage: React.FC = () => (<>
  <Ground size={[40, 40]} color="#1B2447" rough={0.7} map={tex('tiles', [30, 30], 9)} />
  <Box pos={[0, 0, -2.4]} size={[30, 8, 0.2]} color="#243061" map={tex('speckle', [10, 4], 5)} r={0} />
</>);
const Dots: React.FC<{pts: V3[]; r?: number; color: string; glow?: number}> = ({pts, r = 0.03, color, glow = 0.45}) => {
  const mesh = React.useMemo(() => { const m = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshStandardMaterial({color, emissive: color, emissiveIntensity: glow, roughness: 0.5}), pts.length); m.frustumCulled = false; return m; }, [pts.length, color, glow]);
  const d = new THREE.Object3D();
  pts.forEach((p, i) => { d.position.set(p[0], p[1], p[2]); d.scale.setScalar(r); d.updateMatrix(); mesh.setMatrixAt(i, d.matrix); });
  mesh.instanceMatrix.needsUpdate = true; return <primitive object={mesh} />;
};
/** a cloud of n points in a box, wobbling a little (loop-safe) */
const cloudPts = (n: number, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, seed: number, t: number, amp = 0.025): V3[] =>
  Array.from({length: n}, (_, i) => [lerp(x0, x1, rnd(seed + i)) + amp * loopS(t, 40 + (i % 7), rnd(i)), lerp(y0, y1, rnd(seed + 300 + i)) + amp * loopS(t, 37 + (i % 5), rnd(i + 9)), lerp(z0, z1, rnd(seed + 600 + i)) + amp * loopS(t, 33 + (i % 3), rnd(i + 5))] as V3);
const Arrow: React.FC<{pos: V3; rot: V3; len: number; s?: number; color?: string}> = ({pos, rot, len, s = 1, color = '#FFD23F'}) => s <= 0.01 ? null : (<group position={pos} rotation={rot} scale={s}>
  <Cyl r={0.035} h={len} color={color} emissive={color} glow={0.8} cast={false} />
  <Cyl pos={[0, len, 0]} r={0.1} rTop={0} h={0.2} color={color} emissive={color} glow={0.8} cast={false} />
</group>);
const POINT_L = -Math.PI / 2 * -1;                                                           // rotation about z that makes an arrow point to -x
const POINT_R = -Math.PI / 2;                                                                // ... to +x

// shots 6-7: the wall: sparse air outside, crowded air inside
const WallCut: React.FC<{t: number; a0: number; a1: number; push?: number}> = ({t, a0, a1, push = 0}) => {
  const cam = cam3At(t, [[a0, {pos: [1.3, 1.7, 4.8], look: [0.45, 0.8, 0], fov: 40}], [a1, {pos: [1.0, 1.6, 4.1], look: [0.45, 0.8, 0], fov: 38}]]);
  const s = (i: number) => smooth(prog(t, K.pushes - 0.1 + i * 0.12, K.pushes + 0.35 + i * 0.12)) * (1 + 0.14 * Math.sin(t * 7 + i)) * (push > 0 ? 1 : 0);
  return (<World cam={cam} light={STAGE} sky={STAGE_SKY} scene={<><Stage />
      <Box pos={[0, 0, -0.8]} size={[0.12, 2.0, 1.6]} color="#EFE6D3" map={tex('panels', [1, 2], 3)} r={0.03} />
      <Dots pts={cloudPts(7, -1.6, -0.15, 0.1, 1.9, -0.7, 0.7, 20, t)} r={0.04} color="#9DB4FF" />
      <Dots pts={cloudPts(80, 0.2, 1.7, 0.1, 1.9, -0.7, 0.7, 50, t)} r={0.04} color="#FFFFFF" />
      {[0.5, 1.0, 1.5].map((y, i) => <Arrow key={i} pos={[0.85, y, -0.1]} rot={[0, 0, POINT_L]} len={0.55} s={s(i)} />)}
    </>}>
    <Cel at={[0.85, 0, 0.2]} h={1.15}><Mia view="front" eyes={t > K.pressurized ? 'closed' : 'dot'} mouth="smile" bounce={idle(t)} headTilt={3 * Math.sin(t * 2)} /></Cel>
  </World>);
};
// shot 9: the row of windows, arrows pushing on each
const RowShot: React.FC<{t: number}> = ({t}) => {
  const a = C(9), b = C(11); const x = kfs(t, [[a, -1.6], [b, 1.6]]);
  const cam: Cam3 = {pos: [x + 0.9, 1.3, 2.6], look: [x, 1.2, WALLZ], fov: 36};
  const wins = [-3.2, -2.4, -1.6, -0.8, 0, 0.8, 1.6, 2.4, 3.2];
  return (<World cam={cam} light={{...CAB, focus: [x, 1, -0.5], span: 4}} sky={CAB_SKY} scene={<><Cabin wins={wins} seats={false} />
    {wins.map((w, i) => <Arrow key={i} pos={[w, 1.28, -0.5 + 0.05 * Math.sin(t * 6 + i)]} rot={[-Math.PI / 2, 0, 0]} len={0.42} s={smooth(prog(t, a + 0.1 + i * 0.1, a + 0.5 + i * 0.1))} />)}</>} />);
};
// shots 10-14: the window cross-section
const GlassP: React.FC<{x: number; holed?: boolean; hot?: number; flex?: number}> = ({x, holed = false, hot = 0, flex = 0}) => {
  const col = mix('#BFE6FF', '#FF8A3D', hot), m = {color: col, opacity: 0.62 + 0.2 * hot, rough: 0.15, emissive: col, glow: 0.25 + 0.7 * hot, r: 0.01};
  return (<group position={[x, 0, 0]} rotation={[0, 0, flex]}>
    {holed ? <><Box size={[0.06, 0.56, 0.9]} {...m} /><Box pos={[0, 0.66, 0]} size={[0.06, 0.54, 0.9]} {...m} /></> : <Box size={[0.06, 1.2, 0.9]} {...m} />}
  </group>);
};
const PaneStage: React.FC<{t: number; cam: Cam3; spread: number; holed: boolean; hot?: number; flex?: number; children?: React.ReactNode; cels?: React.ReactNode}> = ({t, cam, spread, holed, hot = 0, flex = 0, children}) => (
  <World cam={cam} light={STAGE} sky={STAGE_SKY} scene={<><Stage />
    <GlassP x={-0.5 * spread} hot={hot} flex={flex} /><GlassP x={0} holed={holed} /><GlassP x={0.5 * spread} />{children}</>} />);
const PC = (a: number, b: number): Cam3 => ({pos: [lerp(0.9, 0.7, a), 1.35, lerp(3.9, 3.3, a)], look: [0, 0.38, 0], fov: lerp(36, 33, b)});
const Panes1: React.FC<{t: number}> = ({t}) => {
  const a = C(11), b = C(12); const spread = kfs(t, [[a, 0.12], [K.panes - 0.25, 0.12], [K.panes + 0.6, 1]]);
  return <PaneStage t={t} cam={cam3At(t, [[a, PC(0, 0)], [b, PC(0.5, 0.5)]])} spread={spread} holed={false} />;
};
const Drill: React.FC<{t: number}> = ({t}) => {
  const a = C(12), b = C(14); const tip = kfs(t, [[a, 1.5], [K.drilled - 0.5, 1.5], [K.drilled + 0.15, 0.04], [K.drilled + 0.55, 1.5]]);
  const holed = t > K.drilled + 0.05, spin = 0.5 + 0.5 * Math.sin(t * 60);
  const cam = cam3At(t, [[a, PC(0.5, 0.5)], [K.middle, {pos: [0.8, 1.0, 2.9], look: [0, 0.55, 0], fov: 30}], [b, {pos: [0.7, 0.95, 2.6], look: [0, 0.55, 0], fov: 29}]]);
  return (<PaneStage t={t} cam={cam} spread={1} holed={holed}>
    <group position={[tip + 0.5, 0.61, 0]}><Cyl rot={[0, 0, Math.PI / 2]} r={0.035} rTop={0.008} h={0.5} color="#C9CED6" metal={0.6} rough={0.3 + 0.1 * spin} />
      <Cyl pos={[-0.3, 0, 0]} rot={[0, 0, Math.PI / 2]} r={0.09} h={0.34} color="#E4572E" rough={0.5} /></group>
  </PaneStage>);
};
const GapFlow: React.FC<{t: number}> = ({t}) => {
  const a = C(14), b = C(16); const cam = cam3At(t, [[a, {pos: [0.5, 1.0, 3.6], look: [-0.05, 0.55, 0], fov: 33}], [b, {pos: [0.2, 0.95, 3.1], look: [-0.15, 0.55, 0], fov: 31}]]);
  const balls = Array.from({length: 9}, (_, i) => {
    const u = clamp((t - (K.lets - 0.05) - i * 0.2) / 0.95); if (u <= 0 && t < K.lets - 0.05) return null;
    const x = lerp(0.85, -0.12 - rnd(i + 3) * 0.3, smooth(u)), yy = 0.15 + rnd(i) * 1.0, z = -0.25 + rnd(i + 30) * 0.5;
    const y = x > 0 ? 0.61 + (yy - 0.61) * clamp(x * 1.6) : 0.61 + (0.2 + rnd(i + 7) * 0.9 - 0.61) * clamp(-x * 2.6);
    return <Ball key={i} pos={[x, y, z]} r={0.045} color="#FFFFFF" emissive="#FFFFFF" glow={0.6} cast={false} />;
  });
  return <PaneStage t={t} cam={cam} spread={1} holed>{balls}
    <Dots pts={cloudPts(36, 0.1, 1.2, 0.08, 1.12, -0.35, 0.35, 90, t)} r={0.03} color="#FFFFFF" />
    <Dots pts={cloudPts(5, -1.3, -0.6, 0.1, 1.1, -0.35, 0.35, 70, t)} r={0.03} color="#9DB4FF" /></PaneStage>;
};
const LoadShot: React.FC<{t: number}> = ({t}) => {
  const a = C(16), b = C(18); const hot = smooth(prog(t, K.outer - 0.1, K.outer + 0.5));
  const cam = cam3At(t, [[a, {pos: [-0.2, 1.1, 3.4], look: [-0.35, 0.58, 0], fov: 32}], [b, {pos: [-0.05, 1.05, 3.0], look: [-0.3, 0.58, 0], fov: 30}]]);
  const pr = (i: number) => smooth(prog(t, K.load - 0.5 + i * 0.1, K.load - 0.1 + i * 0.1)) * (1 + 0.12 * Math.sin(t * 8 + i));
  return <PaneStage t={t} cam={cam} spread={1} holed hot={hot} flex={-0.012 * hot * Math.sin(t * 9)}>
    {[0.3, 0.6, 0.9].map((y, i) => <Arrow key={i} pos={[-0.12, y, 0]} rot={[0, 0, POINT_L]} len={0.28} s={pr(i)} color="#FF8A3D" />)}
    <Dots pts={cloudPts(18, -0.42, -0.08, 0.08, 1.12, -0.35, 0.35, 120, t)} r={0.03} color="#FFFFFF" />
    <Dots pts={cloudPts(30, 0.1, 1.2, 0.08, 1.12, -0.35, 0.35, 90, t)} r={0.03} color="#FFFFFF" /></PaneStage>;
};
const Moist: React.FC<{t: number}> = ({t}) => {
  const a = C(18), b = C(19); const cam = cam3At(t, [[a, {pos: [0.6, 1.0, 3.6], look: [0.0, 0.55, 0], fov: 33}], [b, {pos: [0.3, 0.95, 3.1], look: [0.0, 0.55, 0], fov: 31}]]);
  const drops = Array.from({length: 10}, (_, i) => {
    const u = clamp((t - (K.moisture - 0.1) - i * 0.17) / 1.2), x0 = -0.15 - rnd(i + 3) * 0.3, yy = 0.15 + rnd(i) * 1.0;
    const x = u < 0.5 ? lerp(x0, 0, smooth(u * 2)) : lerp(0, 0.95, smooth((u - 0.5) * 2)), y = u < 0.5 ? lerp(yy, 0.61, smooth(u * 2)) : lerp(0.61, 0.35 + rnd(i + 8) * 0.6, smooth((u - 0.5) * 2));
    return <Ball key={i} pos={[x, y, -0.2 + rnd(i + 30) * 0.4]} r={0.055 * (u > 0.9 ? 1 - (u - 0.9) * 10 : 1)} scale={[1, 1.25, 1]} color="#4DA3FF" emissive="#4DA3FF" glow={0.6} cast={false} />;
  });
  return <PaneStage t={t} cam={cam} spread={1} holed>{drops}</PaneStage>;
};
// shot 15: two windows, one fogs, one stays clear
const FogShot: React.FC<{t: number}> = ({t}) => {
  const a = C(19), b = C(20); const cam = cam3At(t, [[a, {pos: [0, 1.3, 3.6], look: [0, 1.24, WALLZ], fov: 36}], [b, {pos: [0, 1.28, 3.1], look: [0, 1.22, WALLZ], fov: 35}]]);
  const haze = 0.92 * smooth(prog(t, K.fog - 0.5, K.fog + 1.0));
  return (<World cam={cam} light={{...CAB, focus: [0, 1.2, -1], span: 3}} sky={CAB_SKY} scene={<><Cabin seats={false} wins={[]} />
    <Win x={-0.34} hole={false} haze={haze} sc={0.9} /><Win x={0.34} hole sc={0.9} /></>} />);
};
// shots 16-18: Otto leans in, squints, Mia smiles
const OttoLean: React.FC<{t: number}> = ({t}) => {
  const a = C(20), b = C(21); const u = smooth(prog(t, K.leans - 0.1, K.leans + 0.7));
  const cam = cam3At(t, [[a, {pos: [0.35, 1.45, 4.5], look: [0.3, 1.1, -0.7], fov: 32}], [b, {pos: [0.3, 1.4, 4.0], look: [0.25, 1.1, -0.7], fov: 30}]]);
  return (<World cam={cam} light={{...CAB, focus: [0.2, 1, -0.5], span: 4}} sky={CAB_SKY} scene={<Cabin />} front={<Cushions />}>
    <Cel at={[lerp(PO[0], 0.36, u), 0, PO[2]]}><Otto view="left" lean={-12 * u} handL={[lerp(24, -40, u), lerp(-168, -150, u)]} handR={[lerp(-24, -70, u), lerp(-162, -150, u)]} eyes={u > 0.4 ? 'squeeze' : 'dot'} mouth="flat" brow={0.4} bounce={idle(t, 19)} /></Cel>
  </World>);
};
const OttoQuiet: React.FC<{t: number}> = ({t}) => {
  const a = C(21), b = C(22); const cam = cam3At(t, [[a, {pos: [0.78, 1.3, 3.2], look: [0.62, 1.1, -0.55], fov: 27}], [b, {pos: [0.72, 1.28, 2.95], look: [0.62, 1.1, -0.55], fov: 26}]]);
  const blush = kfs(t, [[K.quiet - 0.9, 0], [K.quiet - 0.3, 0.7]]);
  return (<World cam={cam} light={{...CAB, focus: [0.5, 1, -0.5], span: 4}} sky={CAB_SKY} scene={<Cabin />} front={<Cushions />}>
    <Cel at={PO}><Otto view="front" tint="#F59AA3" tintAmt={blush} eyes={t > K.quiet - 0.6 ? 'closed' : 'squeeze'} mouth="flat" brow={-0.5} sweat={smooth(prog(t, K.quiet - 0.8, K.quiet - 0.4))} bounce={idle(t, 19)} headTilt={-4 * spring(t, K.quiet - 0.5, 2, 3)} /></Cel>
  </World>);
};
const MiaSmile: React.FC<{t: number}> = ({t}) => {
  const a = C(22), b = C(23); const cam = cam3At(t, [[a, {pos: [-0.5, 1.35, 3.2], look: [-0.62, 1.1, -0.55], fov: 28}], [b, {pos: [-0.55, 1.33, 2.95], look: [-0.62, 1.1, -0.55], fov: 27}]]);
  return (<World cam={cam} light={{...CAB, focus: [-0.5, 1, -0.5], span: 4}} sky={CAB_SKY} scene={<Cabin />} front={<Cushions />}>
    <Cel at={PM}><Mia view="front" eyes="closed" mouth="smirk" browUp={0.5} headTilt={5 * spring(t, K.smiles, 2.5, 4)} bounce={idle(t)} /></Cel>
  </World>);
};
// shot 19: back to the opening two-shot; the subscribe button appears above Mia
const Ending: React.FC<{t: number}> = ({t}) => {
  const a = C(23); const back = END - 1.0;
  const cam = cam3At(t, [[a, {pos: [0.15, 1.5, 4.6], look: [0, 1.0, -0.8], fov: 33}], [K.subscribe + 0.1, {pos: [0.05, 1.52, 5.0], look: [0, 1.0, -0.8], fov: 34}], [back, CAM0]]);
  const look = t > K.subscribe - 0.05 && t < END - 0.85, smug = t < K.subscribe - 0.05;
  const mia: Partial<PersonPose> = t < END - 0.85 ? {view: smug ? 'right' : 'front', handR: smug ? [108, -272] : [78, -120], eyes: smug ? 'closed' : 'dot', mouth: 'smile', faceDy: look ? -14 : 0, lookY: look ? -8 : 0, browUp: look ? 0.9 : 0.5,
    headTilt: look ? 4 * spring(t, K.subscribe, 2, 4) : 0} : MIA0;
  return (<World cam={cam} light={CAB} sky={CAB_SKY} scene={<Cabin />} front={<Cushions />}>
    <Cel at={PM}><Mia {...MIA0} {...mia} handL={[-70, -128]} bounce={idle(t)} /></Cel>
    <Cel at={PO}><Otto {...OTTO0} bounce={idle(t, 19)} /></Cel>
  </World>);
};

// ---------------------------------------------------------------- composition
const Scenes: React.FC<{t: number}> = ({t}) => (
  <Cuts t={t} shots={[[0, <Open t={t} />], [C(1), <Macro t={t} />], [C(2), <OttoSure t={t} />], [C(4), <MiaSmug t={t} />], [C(5), <SkyWide t={t} />], [C(6), <OttoThin t={t} />],
    [C(7), <WallCut t={t} a0={C(7)} a1={C(8)} />], [C(8), <WallCut t={t} a0={C(8)} a1={C(9)} push={1} />], [C(9), <RowShot t={t} />], [C(11), <Panes1 t={t} />], [C(12), <Drill t={t} />],
    [C(14), <GapFlow t={t} />], [C(16), <LoadShot t={t} />], [C(18), <Moist t={t} />], [C(19), <FogShot t={t} />], [C(20), <OttoLean t={t} />], [C(21), <OttoQuiet t={t} />],
    [C(22), <MiaSmile t={t} />], [C(23), <Ending t={t} />]]} />);
export const Short: React.FC<{voice?: boolean; captions?: boolean; guides?: boolean}> = ({voice = false, captions = true, guides = false}) => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps;
  return (<AbsoluteFill style={{background: '#000'}}>
    <Scenes t={t} />
    <Cta t={t} tIn={K.subscribe - 0.1} tClick={K.strange + 0.05} tBell={K.fact} tOut={END - 0.8} />
    {captions && <Captions t={t} />}
    {guides && <SafeGuides />}
    <Audio src={staticFile(`${T.short}/sfx.wav`)} volume={0.42} />
    <Audio src={staticFile(`${T.short}/bed.wav`)} volume={0.2} />
    {voice && <Sequence from={Math.round(Math.max(0, T.voiceOffset) * fps)} layout="none"><Audio src={staticFile(`${T.short}/vo.wav`)} /></Sequence>}
  </AbsoluteFill>);
};

// ---------------------------------------------------------------- thumbnails (frames of the video + text)
export const Thumb: React.FC<{variant: 'A' | 'B' | 'C'}> = ({variant}) => {
  const cfg = {A: {t: K.hole + 0.15, l1: 'WHY THE', l2: 'TINY HOLE?', top: 250}, B: {t: K.sure + 0.6, l1: 'A MISTAKE?', l2: 'NOPE', top: 130}, C: {t: K.gap + 0.5, l1: 'THE REAL', l2: 'REASON', top: 205}}[variant];
  return (<AbsoluteFill><Scenes t={cfg.t} /><ThumbText l1={cfg.l1} l2={cfg.l2} top={cfg.top} /></AbsoluteFill>);
};
