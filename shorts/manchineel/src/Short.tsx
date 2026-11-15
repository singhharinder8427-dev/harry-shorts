/* "The beach tree you should never sit under" - harry-animator v3.
 * Flat 2D cel cast (Finn the castaway, a crab) composited into one stylized 3D beach seen at five times of day. */
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import timing from './timing.json';
import {Captions, SafeGuides} from './Captions';
import {Person, PersonPose} from './Cast';
import {Cta, ThumbText} from './Cta';
import {Ball, Box, Cam3, Cel, Cuts, Cyl, Ground, Light, V3, World, cam3At, celPoint, tex} from './World3D';
import * as THREE from 'three';
import {useK} from './Layer';
import {INK} from './color';
import {bump, clamp, kfs, lerp, pick, prog, rnd, smooth, spring} from './math';

const T = timing as any; const K = T.keys as Record<string, number>; const S = T.sentences as {start: number; end: number}[];
export const DURATION = T.duration as number; const END = DURATION;
// clean cuts, each just before its sentence
const C1 = S[2].start - 0.15, C2 = S[5].start - 0.2, C3 = S[7].start - 0.12, C4 = S[8].start - 0.15, C5 = S[11].start - 0.15,
  C6 = S[12].start - 0.15, C7 = S[14].start - 0.15, C8 = S[16].start - 0.15;
const loopS = (t: number, n: number, ph = 0) => Math.sin(2 * Math.PI * (n * t / DURATION + ph));     // whole cycles over the video (loop-safe)

// ---------------------------------------------------------------- cast (fixed for the whole video)
const FINN = {shirt: '#8E44AD', hair: '#1F1B1A', hairStyle: 'short' as const};
const Finn: React.FC<PersonPose> = (p) => <Person {...p} id={p.id} outfit={FINN} />;
/** flat red crab: feet at (0,0), about 430 units wide drawing scaled by <Cel h unitsTall> */
const Crab: React.FC<{step: number; scared: number}> = ({step, scared}) => {
  const k = useK(); const ow = 9 / k;
  return (<g>
    <g stroke={INK} strokeWidth={ow * 0.8} fill="none" strokeLinecap="round">
      {[-1, 1].map((s) => [0, 1, 2].map((i) => <path key={s + '-' + i} d={`M ${s * 110} -110 Q ${s * (190 + i * 30)} ${-170 + i * 20} ${s * (210 + i * 34 + (i % 2 ? step : -step) * 14)} -4`} />))}
      {[-1, 1].map((s) => <path key={'a' + s} d={`M ${s * 120} -170 Q ${s * 200} -250 ${s * 190} ${-300 - scared * 50}`} />)}
      {[-1, 1].map((s) => <path key={'e' + s} d={`M ${s * 50} -220 L ${s * 56} -290`} />)}
    </g>
    <ellipse cx={0} cy={-135} rx={150} ry={100} fill="#E5533D" stroke={INK} strokeWidth={ow} />
    {[-1, 1].map((s) => <circle key={'c' + s} cx={s * 190} cy={-320 - scared * 50} r={44} fill="#E5533D" stroke={INK} strokeWidth={ow} />)}
    {[-1, 1].map((s) => <ellipse key={'p' + s} cx={s * 56} cy={-305} rx={scared > 0.5 ? 22 : 17} ry={scared > 0.5 ? 30 : 24} fill={INK} />)}
    <path d={scared > 0.5 ? 'M -30 -110 Q 0 -140 30 -110' : 'M -34 -120 Q 0 -96 34 -120'} stroke={INK} strokeWidth={ow * 0.8} fill="none" strokeLinecap="round" />
  </g>);
};

// ---------------------------------------------------------------- light per time of day (same beach, same sun path)
const DAY: Light = {sun: [-5, 7, 4], sunColor: '#FFF2D6', sunI: 2.6, sky: '#D6ECFF', bounce: '#E8C88F', ambI: 1.3, fog: ['#F4E6CF', 32, 130], focus: [0, 0, -1], span: 13};
const STORM: Light = {sun: [4, 6, 3], sunColor: '#AEB9CC', sunI: 0.9, sky: '#8E9BB0', bounce: '#6F6A66', ambI: 1.0, fog: ['#77818F', 12, 60], focus: [0, 0, -1], span: 11};
const MORNING: Light = {sun: [6, 3.6, 3], sunColor: '#FFE2B0', sunI: 2.4, sky: '#DCEBFF', bounce: '#E8C88F', ambI: 1.2, fog: ['#FBE9C2', 28, 120], focus: [0, 0, -1], span: 10};
const NIGHT: Light = {sun: [-4, 6, 3], sunColor: '#7F9BD9', sunI: 1.2, sky: '#5466A0', bounce: '#3A3340', ambI: 1.0, fog: ['#141B33', 14, 70], focus: [0, 0, 0], span: 9};
const SKY = {day: ['#4FA8E8', '#F7E9D0'], storm: ['#3E4756', '#8A93A0'], morning: ['#8FC7F0', '#FBE9C2'], night: ['#0B1026', '#232B52']} as Record<string, [string, string]>;

// ---------------------------------------------------------------- the beach (3D set)
const TX = 1.1, TZ = -2;                                           // the manchineel's trunk
const APPLES: V3[] = [[-0.9, 2.62, 0.9], [-0.3, 2.5, 1.25], [0.5, 2.56, 1.2], [1.0, 2.7, 0.7], [-1.3, 2.75, 0.2], [0.1, 2.48, 0.7], [1.35, 2.8, -0.1], [-0.65, 2.55, 0.4], [0.75, 2.5, 0.35]];
const Apple: React.FC<{pos: V3; r?: number; bitten?: boolean}> = ({pos, r = 0.085, bitten}) => (<group position={pos}>
  <Ball r={r} color="#9BD14B" rough={0.5} map={tex('speckle', [2, 2], 4)} />
  <Cyl pos={[0, r * 0.8, 0]} r={r * 0.09} h={r * 0.7} color="#5A4630" cast={false} />
  {bitten && <Ball pos={[r * 0.55, r * 0.3, r * 0.6]} r={r * 0.62} color="#F6F1CF" rough={0.7} cast={false} />}
</group>);
const Tree: React.FC<{t: number; hide?: number}> = ({t, hide = -1}) => {
  const sway = 0.02 * loopS(t, 14);
  return (<group position={[TX, 0, TZ]}>
    <group rotation={[0, 0, 0.06]}>
      <Cyl r={0.32} rTop={0.22} h={2.9} color="#8B7B6B" map={tex('planks', [2, 3], 11)} />
      <Cyl pos={[0, 1.0, 0]} r={0.325} rTop={0.315} h={0.32} color="#D62828" rough={0.6} />
    </group>
    {[[-0.7, 0.4], [0.75, -0.2], [0.1, 0.9]].map(([a, b], i) => <Cyl key={i} pos={[-0.16, 2.5, 0]} rot={[b, 0, a]} r={0.13} rTop={0.07} h={1.6} color="#8B7B6B" map={tex('planks', [1, 2], 11)} />)}
    <group position={[-0.15, 3.9, 0]} rotation={[0, 0, sway]}>
      {[[0, 0.3, 0, 1.55], [-1.25, -0.1, 0.3, 1.15], [1.3, -0.05, 0.1, 1.2], [0.2, -0.2, 1.0, 1.1], [-0.4, 0.75, -0.5, 1.1], [0.7, 0.6, -0.6, 1.0], [-0.6, -0.35, 0.95, 0.85]].map(([x, y, z, r], i) =>
        <Ball key={i} pos={[x, y, z]} r={r} scale={[1, 0.82, 1]} color={['#2F7D3A', '#2A7034', '#35873F'][i % 3]} map={tex('speckle', [6, 4], 20 + i)} rough={0.9} />)}
    </group>
    {APPLES.map((a, i) => i === hide ? null : <group key={i} position={[a[0] - 0.15, a[1] + 0.02 * loopS(t, 14, i / 9), a[2]]}><Apple pos={[0, 0, 0]} /></group>)}
  </group>);
};
const Beach: React.FC<{t: number; hideApple?: number; boulder?: boolean}> = ({t, hideApple, boulder = true}) => (<>
  <Ground size={[300, 300]} color="#EBCB96" map={tex('speckle', [170, 170], 2)} />
  <Ground size={[300, 3]} at={[0, -11.6]} y={0.012} color="#CDAA78" map={tex('speckle', [150, 2], 5)} />
  <Ground size={[300, 140]} at={[0, -82.6]} y={0.02} color="#2FB5C9" rough={0.25} map={tex('stripes', [1, 60], 3)} />
  <Ground size={[300, 0.7]} at={[0, -12.6 + 0.12 * loopS(t, 9)]} y={0.03} color="#F4FBFF" rough={0.5} />
  {[[-3.4, -4.5, 0.9], [4.2, -6.5, 1.3], [-5.5, -8, 1.0], [3.4, 1.2, 0.5], [-4.6, 0.6, 0.42]].map(([x, z, r], i) =>
    <Ball key={i} pos={[x, r * 0.32, z]} r={r} scale={[1.15, 0.62, 0.95]} color={i % 2 ? '#8C8F96' : '#9A9DA3'} map={tex('speckle', [5, 3], 30 + i)} />)}
  {boulder && <Boulder />}
  {/* the wrecked raft and driftwood: how Finn got here */}
  <group position={[-3.3, 0, 3.2]} rotation={[0, 0.5, 0]}>
    {[0, 1, 2, 3].map((i) => <Box key={i} pos={[0, 0, i * 0.34 - 0.5]} rot={[0, i === 3 ? 0.25 : 0, 0]} size={[2.1, 0.09, 0.3]} color="#B58A5A" map={tex('planks', [2, 1], 7 + i)} />)}
    <Cyl pos={[0.3, 0.09, 0]} r={0.05} h={1.5} rot={[0, 0, 0.5]} color="#7B5A3C" />
  </group>
  <Cyl pos={[2.9, 0.08, 2.4]} r={0.09} rTop={0.06} h={1.5} rot={[Math.PI / 2, 0, 0.9]} color="#A08462" map={tex('planks', [1, 2], 9)} />
  <Tree t={t} hide={hideApple} />
</>);
const BOULDER: V3 = [-2.7, 0, -0.9];
const Boulder: React.FC = () => <Ball pos={[BOULDER[0], 0.42, BOULDER[2]]} r={1.0} scale={[1.25, 0.72, 0.8]} color="#9A9DA3" map={tex('speckle', [6, 4], 41)} />;

// ---------------------------------------------------------------- shot 1: wide beach, Finn heads for the tree
const HOME: V3 = [-1.5, 0, 1.6];                                    // where Finn stands on frame 0 and on the last frame
const CAM0: Cam3 = {pos: [-0.5, 3.3, 12.6], look: [0.2, 0.75, -1], fov: 40};
const Wide: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[0, CAM0], [K.dont + 0.3, {pos: [-0.2, 3.0, 10.2], look: [0.25, 0.7, -1], fov: 39}]]);
  const u = smooth(prog(t, 0.55, K.dont - 0.25)), walking = u > 0 && u < 1;
  const to: V3 = [0.25, 0, -1.0]; const at: V3 = [lerp(HOME[0], to[0], u), 0, lerp(HOME[2], to[2], u)];
  const st = walking ? Math.sin(u * 7 * Math.PI) : 0; const stop = t >= K.dont - 0.25;
  return (<World cam={cam} light={DAY} sky={SKY.day} scene={<Beach t={t} />}>
    <Cel at={at}>
      <Finn id="finn" view={walking ? 'right' : 'front'} bounce={Math.abs(st) * 9} footL={[-30 + st * 24, -5 - Math.max(0, st) * 14]} footR={[30 - st * 24, -5 - Math.max(0, -st) * 14]}
        handL={stop ? [-96, -250] : [-74 - st * 22, -128]} handR={stop ? [96, -250] : [74 + st * 22, -128]}
        eyes={stop ? 'wide' : 'dot'} mouth={stop ? 'o' : 'smile'} browUp={stop ? 1 : 0} headTilt={stop ? 5 * spring(t, K.dont - 0.25, 3, 5) : 0} lean={stop ? -4 * spring(t, K.dont - 0.25, 2.5, 4) : 0}
        blink={bump(t, 0.2, 0.36)} />
    </Cel>
  </World>);
};

// ---------------------------------------------------------------- shot 2: the tree itself (crane up, push-in on the band)
const TreeShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C1, {pos: [0.1, 1.0, 3.4], look: [TX - 0.1, 1.0, TZ], fov: 36}], [K.apples + 0.5, {pos: [-0.3, 1.5, 4.4], look: [TX - 0.25, 3.0, TZ + 0.6], fov: 36}],
    [K.band - 0.5, {pos: [-0.3, 1.5, 4.4], look: [TX - 0.25, 2.9, TZ + 0.6], fov: 35}], [K.band + 0.9, {pos: [0.5, 1.25, 1.3], look: [TX, 1.15, TZ], fov: 31}], [C2, {pos: [0.6, 1.22, 0.9], look: [TX, 1.15, TZ], fov: 30}]]);
  return <World cam={cam} light={{...DAY, focus: [TX, 1, TZ], span: 7}} sky={SKY.day} scene={<Beach t={t} />} />;
};

// ---------------------------------------------------------------- shot 3: the storm (rain, milky drops)
/** rain as ONE instanced mesh (150 separate meshes made the storm shots several times slower to render) */
const Rain: React.FC<{t: number; n?: number}> = ({t, n = 150}) => {
  const mesh = React.useMemo(() => { const m = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.011, 0.011, 0.55, 5),
    new THREE.MeshStandardMaterial({color: '#CFDBEA', transparent: true, opacity: 0.55, roughness: 0.6}), n); m.frustumCulled = false; return m; }, [n]);
  const d = new THREE.Object3D();
  for (let i = 0; i < n; i++) {
    const x = -7 + rnd(i) * 14, z = -9 + rnd(i + 500) * 15, y = 8 - ((t * (9 + rnd(i + 900) * 3) + rnd(i + 300) * 8) % 8);
    d.position.set(x + y * 0.06, y + 0.275, z); d.rotation.set(0, 0, -0.06); d.updateMatrix(); mesh.setMatrixAt(i, d.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  return <primitive object={mesh} />;
};
const UNDER: V3 = [0.35, 0, -1.25];
const Storm: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C2, {pos: [-2.2, 1.9, 8.6], look: [0.2, 1.25, -1.4], fov: 38}], [K.sap, {pos: [-1.0, 1.7, 6.8], look: [0.35, 1.2, -1.4], fov: 37}], [C3, {pos: [-0.4, 1.6, 5.8], look: [0.35, 1.15, -1.4], fov: 36}]]);
  const u = smooth(prog(t, C2 + 0.1, K.shelter + 0.2)), running = u < 1; const at: V3 = [lerp(-3.4, UNDER[0], u), 0, lerp(1.2, UNDER[2], u)];
  const st = running ? Math.sin(u * 9 * Math.PI) : 0; const hit = t > K.drips + 0.35;
  const drops = Array.from({length: 9}, (_, i) => {
    const grow = clamp((t - (K.sap - 0.3) - i * 0.05) / 0.5), fall = clamp(((t - K.drips + 0.1 - i * 0.13) % 1.1) / 0.45), falling = t > K.drips - 0.1 + i * 0.13;
    const x = UNDER[0] - 0.35 + rnd(i + 70) * 0.7, z = UNDER[2] - 0.1 + rnd(i + 80) * 0.5;
    return grow <= 0 ? null : <Ball key={i} pos={[x, falling ? lerp(2.5, 1.5, fall * fall) : 2.5, z]} r={0.065 * grow} scale={[1, falling ? 1.5 : 1.15, 1]} color="#FFFFFF" emissive="#FFFFFF" glow={0.75} rough={0.3} cast={false} />;
  });
  return (<World cam={cam} light={STORM} sky={SKY.storm} scene={<><Beach t={t} /><Rain t={t} /></>} front={<>{drops}</>}>
    <Cel at={at}>
      <Finn id="finn" view={running ? 'right' : 'front'} bounce={Math.abs(st) * 12} lean={running ? 8 : 0} footL={[-30 + st * 30, -5 - Math.max(0, st) * 18]} footR={[30 - st * 30, -5 - Math.max(0, -st) * 18]}
        handL={running ? [-40, -440] : hit ? [-60, -400 + 8 * Math.sin(t * 20)] : [-74, -128]} handR={running ? [50, -440] : hit ? [60, -400 - 8 * Math.sin(t * 20)] : [74, -128]}
        eyes={running ? 'squeeze' : hit ? 'wide' : 'dot'} mouth={running ? 'teeth' : hit ? 'wavy' : t > K.shelter + 0.3 && t < K.sap ? 'smile' : 'flat'}
        faceDy={!running && t > K.sap - 0.2 && !hit ? -14 : 0} lookY={!running && t > K.sap - 0.2 && !hit ? -8 : 0} browUp={hit ? 1 : 0} brow={hit ? -0.8 : 0} headTilt={hit ? 4 * Math.sin(t * 9) : 0} />
    </Cel>
  </World>);
};

// ---------------------------------------------------------------- shot 4: reaction close-up, blisters
const Blisters: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C3, {pos: [0.1, 1.2, 3.6], look: [UNDER[0], 0.98, UNDER[2]], fov: 28}], [C4, {pos: [0.2, 1.2, 3.1], look: [UNDER[0], 0.98, UNDER[2]], fov: 27}]]);
  const sp = kfs(t, [[K.blisters - 0.35, 0], [K.blisters + 0.6, 1]]), ow = t > K.blisters + 0.1;
  return (<World cam={cam} light={{...STORM, focus: [UNDER[0], 1, UNDER[2]], span: 6}} sky={SKY.storm} scene={<><Beach t={t} /><Rain t={t} n={110} /></>}>
    <Cel at={UNDER}>
      <Finn id="finn" spots={sp} eyes={ow ? 'squeeze' : 'wide'} mouth={ow ? 'teeth' : 'wavy'} brow={ow ? -1 : -0.5} browUp={0.6} handL={[-92, -250 + 10 * Math.sin(t * 17)]} handR={[92, -250 - 10 * Math.sin(t * 17)]}
        headTilt={3 * Math.sin(t * 13)} sweat={ow ? 1 : 0} />
    </Cel>
  </World>);
};

// ---------------------------------------------------------------- shot 5: morning, the apple
const PICK = 5;                                                     // index of the apple he picks
const AppleShot: React.FC<{t: number}> = ({t}) => {
  const at: V3 = [0.55, 0, -1.05];
  const cam = cam3At(t, [[C4, {pos: [-0.9, 1.5, 5.6], look: [0.6, 1.2, -1.1], fov: 36}], [K.bite, {pos: [-0.5, 1.4, 4.5], look: [0.58, 1.1, -1.1], fov: 33}], [C5, {pos: [-0.3, 1.3, 3.9], look: [0.56, 1.02, -1.1], fov: 30}]]);
  const reach = smooth(prog(t, K.starving + 0.9, K.bite - 0.75)), toMouth = smooth(prog(t, K.bite - 0.6, K.bite - 0.08)), burn = t >= K.burns - 0.25, drop = prog(t, K.burns - 0.2, K.burns + 0.35);
  const up: [number, number] = [78, -440], mouthP: [number, number] = [34, -296];
  const hand: [number, number] = burn ? [26, -232] : toMouth > 0 ? [lerp(up[0], mouthP[0], toMouth), lerp(up[1], mouthP[1], toMouth)] : [lerp(74, up[0], reach), lerp(-128, up[1], reach)];
  const hungry = t < K.starving + 0.9; const picked = t >= K.bite - 0.6; const bitten = t >= K.bite + 0.05;
  const hw = celPoint(cam, at, 1.7, [hand[0] + 6, hand[1] - 20]);
  // the hanging apple sits exactly where the raised hand closes on it; after the burn it falls and rolls
  const hang = celPoint(cam, at, 1.7, [up[0] + 6, up[1] - 20]);
  const applePos: V3 = !picked ? hang : drop > 0 ? [hw[0] + 0.25 * drop, Math.max(0.085, lerp(celPoint(cam, at, 1.7, [mouthP[0] + 6, mouthP[1] - 20])[1], 0.085, drop * drop)), hw[2] + 0.3 * drop] : hw;
  return (<World cam={cam} light={MORNING} sky={SKY.morning} scene={<><Beach t={t} hideApple={PICK} />
      {!picked && <Cyl pos={[hang[0], hang[1] + 0.07, hang[2]]} r={0.012} h={0.75} color="#5A4630" cast={false} />}</>}
    front={<group rotation={[0, 0, 0]}><Apple pos={applePos} bitten={bitten} /></group>}>
    <Cel at={at}>
      <Finn id="finn" spots={1} handR={hand} handL={burn ? [-26, -228] : hungry ? [-14, -160] : [-74, -128]}
        faceDy={!picked && !burn ? -12 : 0} lookY={!picked ? -8 : 0} lookX={!picked ? 5 : 0}
        eyes={burn ? 'wide' : bitten ? 'closed' : hungry ? 'dot' : 'wide'} mouth={burn ? (t > K.burns + 0.5 ? 'wavy' : 'o') : bitten ? 'grin' : hungry ? 'frown' : 'open'}
        brow={hungry ? -0.7 : burn ? -1 : 0} browUp={burn ? 1 : 0} sweat={burn ? smooth(prog(t, K.burns, K.burns + 0.3)) : 0}
        bounce={burn ? 6 * Math.abs(Math.sin((t - K.burns) * 9)) : 0} headTilt={burn ? 5 * Math.sin((t - K.burns) * 8) : bitten ? -5 : 0} blink={bump(t, C4 + 0.5, C4 + 0.66)} />
    </Cel>
  </World>);
};

// ---------------------------------------------------------------- shot 6: high-angle insert, the bitten apple and a crab
const Insert: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C5, {pos: [0.3, 2.5, 1.7], look: [0.15, 0, -0.55], fov: 31}], [C6, {pos: [0.25, 2.1, 1.35], look: [0.15, 0, -0.55], fov: 29}]]);
  const inn = smooth(prog(t, C5 + 0.1, K.spanish + 1.1)), flee = smooth(prog(t, K.death - 0.15, K.death + 0.55));
  const x = lerp(-0.85, -0.2, inn) - flee * 1.7, scared = t > K.death - 0.3 ? 1 : 0; const moving = (inn > 0 && inn < 1) || (flee > 0 && flee < 1);
  return (<World cam={cam} light={{...MORNING, focus: [0, 0, -0.5], span: 5}} sky={SKY.morning} scene={<><Beach t={t} hideApple={PICK} /><Apple pos={[0.3, 0.1, -0.6]} r={0.1} bitten /></>}>
    <Cel at={[x, 0, -0.45]} h={0.36}><Crab step={moving ? Math.sin(t * 30) : 0} scared={scared} /></Cel>
  </World>);
};

// ---------------------------------------------------------------- shot 7: behind the boulder
const Leaves: React.FC<{pos: V3}> = ({pos}) => (<group position={pos}>{[-0.5, 0, 0.5].map((a, i) =>
  <Ball key={i} pos={[a * 0.09, 0.07 + (i === 1 ? 0.03 : 0), 0]} r={0.1} scale={[0.55, 1.2, 0.12]} rot={[0, 0, -a * 0.8]} color="#3C9447" map={tex('speckle', [2, 2], 60 + i)} cast={false} />)}</group>);
const BoulderShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C6, {pos: [BOULDER[0] + 1.6, 1.5, BOULDER[2] + 6.6], look: [BOULDER[0] + 0.7, 0.75, BOULDER[2]], fov: 34}], [K.same, {pos: [BOULDER[0] + 0.6, 1.5, BOULDER[2] + 5.6], look: [BOULDER[0] + 0.1, 0.75, BOULDER[2]], fov: 33}], [C7, {pos: [BOULDER[0] + 1.6, 1.5, BOULDER[2] + 6.4], look: [BOULDER[0] + 1.3, 0.8, BOULDER[2]], fov: 34}]]);
  const hideX = BOULDER[0], z = BOULDER[2] - 0.75;
  const inn = smooth(prog(t, C6 + 0.1, K.later + 1.1)), down = smooth(prog(t, K.later + 1.1, K.later + 1.6)), jump = t >= K.same + 0.75;
  const hopT = Math.max(0, t - (K.worse - 0.35)), out = smooth(prog(t, K.worse - 0.35, C7 + 0.3));
  const x = jump && hopT > 0 ? lerp(hideX, hideX + 3.6, out) : lerp(hideX + 2.9, hideX, inn);
  const lift = jump ? (hopT > 0 ? 0.32 * Math.abs(Math.sin(hopT * 9)) : 0.5 * bump(t, K.same + 0.75, K.worse - 0.35)) : -0.14 * down;
  const st = inn < 1 ? Math.sin(inn * 6 * Math.PI) : 0; const grab = smooth(prog(t, K.grab - 0.3, K.grab + 0.1)) * (1 - smooth(prog(t, K.same - 0.6, K.same - 0.2)));
  const hand: [number, number] = [-70, lerp(-150, -410, grab)]; const at: V3 = [x, 0, z];
  const lw = celPoint(cam, at, 1.7, [hand[0], hand[1] - 20]);
  const sting = t >= K.same + 0.35;
  return (<World cam={cam} light={DAY} sky={SKY.day} scene={<Beach t={t} hideApple={PICK} />} front={<>{x < hideX + 1.3 && <Boulder />}{grab > 0.05 && <Leaves pos={[lw[0], lw[1] + lift, lw[2] + 0.05]} />}</>}>
    <Cel at={at} lift={lift} shadow={down < 0.5 || jump}>
      <Finn id="finn" spots={1} view={jump ? 'right' : inn < 1 ? 'left' : 'front'} bounce={Math.abs(st) * 5} footL={[-30 + st * 16, -5 - Math.max(0, st) * 20]} footR={[30 - st * 16, -5 - Math.max(0, -st) * 20]}
        handL={jump ? [-34, -118] : hand} handR={jump ? [-10, -112] : [70, -150]} handsBack={jump}
        eyes={jump ? 'squeeze' : sting ? 'wide' : grab > 0.3 ? 'closed' : 'dot'} mouth={jump ? 'teeth' : sting ? 'o' : grab > 0.3 ? 'smile' : inn < 1 ? 'wavy' : 'flat'}
        browUp={sting ? 1 : 0} brow={jump ? -1 : inn < 1 ? -0.5 : 0} lookX={inn < 1 ? -6 : 0} sweat={jump ? 1 : 0} lean={jump && hopT > 0 ? 10 : 0} headTilt={sting && !jump ? 6 * spring(t, K.same + 0.35, 3, 4) : 0} />
    </Cel>
  </World>);
};

// ---------------------------------------------------------------- shot 8: night, the fire and the smoke
const FIRE: V3 = [-0.3, 0, 0.5];
const Fire: React.FC<{t: number; on: number}> = ({t, on}) => (<group position={FIRE}>
  {[0, 1, 2, 3].map((i) => <Cyl key={i} pos={[Math.cos(i * 1.6) * 0.16, 0.07, Math.sin(i * 1.6) * 0.16]} rot={[Math.PI / 2, 0, i * 0.8]} r={0.07} h={0.75} color="#8B7B6B" map={tex('planks', [1, 2], 11)} />)}
  {on > 0.01 && [[0, 0, 0.5, '#FF8A1F'], [-0.12, 0.05, 0.36, '#FFB224'], [0.13, -0.04, 0.4, '#FF6A1A'], [0.02, 0.08, 0.26, '#FFE08A']].map(([x, z, h, c], i) =>
    <Cyl key={'f' + i} pos={[x as number, 0.1, z as number]} r={0.13} rTop={0} h={(h as number) * on * (1 + 0.16 * Math.sin(t * (11 + i * 3) + i))} seg={10} color={c as string} emissive={c as string} glow={1.6} rough={1} cast={false} receive={false} />)}
  {on > 0.01 && <pointLight position={[0, 0.6, 0.2]} color="#FF9A3C" intensity={9 * on * (1 + 0.1 * Math.sin(t * 13))} distance={9} decay={1.6} />}
</group>);
const NightShot: React.FC<{t: number}> = ({t}) => {
  const at: V3 = [0.7, 0, 0.1];
  const cam = cam3At(t, [[C7, {pos: [0.2, 1.5, 6.8], look: [0.15, 0.85, 0.2], fov: 34}], [K.smoke, {pos: [0.25, 1.45, 5.8], look: [0.3, 0.85, 0.2], fov: 33}], [C8, {pos: [0.4, 1.4, 5.1], look: [0.5, 0.9, 0.2], fov: 32}]]);
  const on = smooth(prog(t, K.light - 0.1, K.light + 0.5)), lit = t >= K.light + 0.15, blind = t >= K.smoke + 0.75, bend = bump(t, K.light - 0.9, K.light + 0.3);
  const smoke = Array.from({length: 12}, (_, i) => {
    const age = t - (K.light + 0.5) - i * 0.28; if (age <= 0) return null; const a = (age % 3.4) / 3.4;
    return <Ball key={i} pos={[FIRE[0] + a * (1.0 + rnd(i) * 0.5) * clamp((t - K.smoke + 0.8) / 0.8, 0.25, 1), 0.5 + a * 2.4, FIRE[2] - 0.1 + rnd(i + 9) * 0.3]} r={0.14 + a * 0.36} color="#A9ACB3" emissive="#8C8F96" glow={0.45} opacity={0.9 - a * 0.5} rough={1} cast={false} receive={false} />;
  });
  const grope = blind ? Math.sin((t - K.smoke) * 5) : 0;
  return (<World cam={cam} light={NIGHT} sky={SKY.night} scene={<><Beach t={t} hideApple={PICK} /><Fire t={t} on={on} /></>} front={<>{smoke}</>}>
    <Cel at={[at[0] + (blind ? 0.12 * Math.sin((t - K.smoke) * 2.2) : 0), 0, at[2]]}>
      <Finn id="finn" spots={1} view={blind ? 'front' : 'left'} lean={-10 * bend} bounce={!lit ? 3 * Math.sin(t * 24) : 0}
        handL={blind ? [-110, -230 + grope * 30] : lit ? [-96, -170] : bend > 0.2 ? [-110, -90] : [26, -186]} handR={blind ? [110, -230 - grope * 30] : lit ? [-70, -200] : bend > 0.2 ? [-80, -70] : [-26, -180]}
        eyes={blind ? 'squeeze' : lit ? 'closed' : 'dot'} mouth={blind ? 'wavy' : lit ? 'smile' : 'teeth'} brow={blind ? -1 : !lit ? -0.6 : 0}
        sweat={blind ? 1 : 0} headTilt={blind ? 6 * Math.sin((t - K.smoke) * 4) : 0} footL={[-30 + (blind ? grope * 10 : 0), -5]} footR={[30 + (blind ? grope * 10 : 0), -5]} />
    </Cel>
  </World>);
};

// ---------------------------------------------------------------- shot 9: just sit in the sand (ends on frame 0)
const tUp = () => K.subscribe - 0.05;
const Ending: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C8, {pos: [-1.2, 1.6, 7.4], look: [-1.1, 0.75, 0.4], fov: 34}], [K.subscribe + 0.2, {pos: [-1.1, 1.8, 8.2], look: [-0.9, 0.9, 0.2], fov: 35}], [K.subscribe + 1.1, CAM0]]);
  const sit = 1 - smooth(prog(t, tUp(), tUp() + 0.55)), look = bump(t, K.subscribe + 0.1, END - 0.7) > 0.05 && t < END - 0.85;
  return (<World cam={cam} light={DAY} sky={SKY.day} scene={<Beach t={t} />}>
    <Cel at={HOME}>
      <Finn id="finn" bounce={-104 * sit + 5 * spring(t, tUp() + 0.55, 3, 5)} footL={[lerp(-30, -84, sit), -5]} footR={[lerp(30, 84, sit), -5]}
        handL={sit > 0.5 ? [-96, -40] : [-74, -128]} handR={sit > 0.5 ? [96, -40] : t > K.natures && t < END - 0.9 ? [100, -300] : [74, -128]}
        eyes={sit > 0.5 && t > K.sit - 0.2 ? 'closed' : 'dot'} mouth={look && t > K.natures ? 'grin' : 'smile'} faceDy={look ? -14 : 0} lookY={look ? -8 : 0} browUp={look ? 0.8 : 0}
        headTilt={sit > 0.5 ? 4 * Math.sin((t - C8) * 2) * sit : 0} />
    </Cel>
  </World>);
};

// ---------------------------------------------------------------- composition
const Scenes: React.FC<{t: number}> = ({t}) => (
  <Cuts t={t} shots={[[0, <Wide t={t} />], [C1, <TreeShot t={t} />], [C2, <Storm t={t} />], [C3, <Blisters t={t} />], [C4, <AppleShot t={t} />],
    [C5, <Insert t={t} />], [C6, <BoulderShot t={t} />], [C7, <NightShot t={t} />], [C8, <Ending t={t} />]]} />);
export const Short: React.FC<{voice?: boolean; captions?: boolean; guides?: boolean}> = ({voice = false, captions = true, guides = false}) => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps;
  return (<AbsoluteFill style={{background: '#000'}}>
    <Scenes t={t} />
    <Cta t={t} tIn={K.subscribe - 0.1} tClick={K.natures + 0.05} tBell={K.warnings} tOut={END - 0.8} />
    {captions && <Captions t={t} />}
    {guides && <SafeGuides />}
    <Audio src={staticFile(`${T.short}/sfx.wav`)} volume={0.42} />
    <Audio src={staticFile(`${T.short}/bed.wav`)} volume={0.2} />
    {voice && <Sequence from={Math.round(Math.max(0, T.voiceOffset) * fps)} layout="none"><Audio src={staticFile(`${T.short}/vo.wav`)} /></Sequence>}
  </AbsoluteFill>);
};

// ---------------------------------------------------------------- thumbnails (frames of the video + text)
export const Thumb: React.FC<{variant: 'A' | 'B' | 'C'}> = ({variant}) => {
  const cfg = {A: {t: K.dont + 0.25, l1: 'NEVER SIT', l2: 'UNDER THIS TREE'}, B: {t: K.blisters + 0.9, l1: 'EVEN ITS RAIN', l2: 'BURNS'}, C: {t: K.burns + 0.3, l1: "DON'T EAT", l2: 'THIS APPLE'}}[variant];
  return (<AbsoluteFill><Scenes t={cfg.t} /><ThumbText l1={cfg.l1} l2={cfg.l2} top={variant === 'B' ? 1380 : 250} /></AbsoluteFill>);
};
