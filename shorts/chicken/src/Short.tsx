/* "One chicken explains why the rich get richer" - harry-animator v3.
 * Flat 2D cel cast (Blob, his neighbours Ned and Sara, flat chickens) in one stylized 3D village seen at every time of day. */
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import * as THREE from 'three';
import timing from './timing.json';
import {Captions, SafeGuides} from './Captions';
import {Person, PersonPose} from './Cast';
import {Cta} from './Cta';
import {Bird, BirdPose} from './Birds';
import {BLOB, role} from './Roles';
import {act, EXPR, Pose} from './Poses';
import {Ball, Box, Cam3, Cam3Key, Cel, Cuts, Cyl, Ground, V3, World, cam3At, celPoint, tex} from './World3D';
import {EASE, ShotBlur, Transition} from './Moves';
import {BENCH, Basket, COINS, Door, DAWN, DAY, DOOR_Z, Egg, PLOT, SKY, Village, VState, loopS, mixLight, mixSky, timeOfDay} from './Village';
import {Puff} from './Bits';
import {bump, clamp, kfs, lerp, pick, pop, prog, rnd, smooth, spring} from './math';
import {ThumbFrame, Ring, Arrow} from './ThumbKit';
import {toScreen} from './World3D';

const T = timing as any; const K = T.keys as Record<string, number>; const S = T.sentences as {start: number; end: number}[];
export const DURATION = T.duration as number; const END = DURATION;

// ---------------------------------------------------------------- cast (fixed for the whole video)
const NED = {...role('friend', 'chicken-a').outfit, hold: undefined, hairStyle: 'short' as const, hair: '#3B2416'};
const SARA = {...role('friend', 'chicken').outfit, hold: undefined};
const NED_HEN: BirdPose = {kind: 'hen', body: '#B8682F'};
const SARA_HEN: BirdPose = {kind: 'hen'};
const ROOSTER: BirdPose = {kind: 'rooster'};
const IDLE_N = Math.max(1, Math.round(DURATION / 2.2));
/** loop-safe life on a held pose: breathing + small head sway, whole cycles over the video */
const idle = (p: Pose, t: number, ph = 0, amt = 1): Pose => ({...p, bounce: (p.bounce ?? 0) + 2.5 * amt * loopS(t, IDLE_N, ph), headTilt: (p.headTilt ?? 0) + 1.5 * amt * loopS(t, Math.max(1, Math.round(IDLE_N / 2)), ph + 0.3)});
const blink = (t: number, ...at: number[]) => Math.max(0, ...at.map((a) => bump(t, a, a + 0.16)));
type PP = Omit<PersonPose, 'id' | 'outfit'>;
const Blob: React.FC<PP> = (p) => <Person {...p} id="blob" outfit={BLOB} />;
const Ned: React.FC<PP> = (p) => <Person {...p} id="ned" outfit={NED} />;
const Sara: React.FC<PP> = (p) => <Person {...p} id="sara" outfit={SARA} />;
/** a bird held in the arms (drawn in the Person's units, in front of the torso). y = extra offset (falling in). */
const Held: React.FC<{b: BirdPose; y?: number; x?: number; s?: number}> = ({b, y = 0, x = 0, s = 0.78}) =>
  <g transform={`translate(${x} ${-112 + y}) scale(${s})`}><Bird {...b} ks={s} /></g>;
const HOLD: Pose = {handL: [-66, -150], handR: [66, -150]};
const walkFeet = (ph: number, amt = 1) => { const st = Math.sin(ph) * amt;
  return {bounce: Math.abs(st) * 9, footL: [-30 + st * 24, -5 - Math.max(0, st) * 14] as [number, number], footR: [30 - st * 24, -5 - Math.max(0, -st) * 14] as [number, number], st}; };
const SITF: Pose = {bounce: -104, footL: [-86, -5], footR: [86, -5], handL: [-96, -44], handR: [96, -44]};

// ---------------------------------------------------------------- cuts (each just before its word)
const C = {
  wide: K.money - 0.3, gone: K.gone - 0.2, days: K.hungry - 0.5, gets: K.chicken - 0.95, cook: K.first - 0.25, best: K.best - 0.15, last: K.last - 0.25,
  second: K.second - 0.2, egg: K.egg - 0.4, rooster: K.rooster - 0.2, noeggs: K.noeggs - 0.25, knock: K.knocks - 0.6, meet: K.meet - 0.3, share: K.share - 0.25,
  wanted: K.wanted - 0.2, chicks: K.chicks - 0.2, weeks: K.weeks - 0.25, hatch: K.hatch - 0.2, months: K.months - 0.25, laying: K.laying - 0.25,
  fills: K.fills - 0.3, keep: K.keep - 0.35, hires: K.hires - 0.3, pays: K.pays - 0.2, same: K.same1 - 0.2, poor: K.poor - 0.3, end: K.subscribe - 0.15,
};

// ---------------------------------------------------------------- shot 1: frame 0 = the premise (and the ending)
const POS = {ned: [-1.25, 0, 0.8] as V3, blob: [0, 0, 1.0] as V3, sara: [1.25, 0, 0.8] as V3};
const CAM0: Cam3 = {pos: [0, 1.9, 8.6], look: [0, 1.12, -0.4], fov: 36};
const Intro: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[0, CAM0], [C.wide, {pos: [0.1, 1.8, 7.6], look: [0.05, 1.1, -0.4], fov: 35}]]);
  const night = kfs(t, [[K.lose - 0.15, 0], [K.lose + 0.6, 1]]);
  const tod = timeOfDay(night);
  const scared = t > K.lose + 0.15;
  const faceB = act(t, [[0, 'wave'], [K.lose - 0.2, 'handsOnHead']], [[0, 'happy'], [K.lose - 0.2, 'shocked'], [K.lose + 0.7, 'nervous']]);
  const faceN = act(t, [[0, 'relaxed'], [K.lose - 0.1, 'scared']], [[0, 'happy'], [K.lose - 0.1, 'shocked']]);
  const faceS = act(t, [[0, 'stand'], [K.lose, 'scared']], [[0, 'grin'], [K.lose, 'shocked']]);
  return (<World cam={cam} light={tod.light} sky={tod.sky} scene={<Village t={t} s={{night, dayPhase: night * 0.5}} />}>
    <Cel at={POS.ned}><Ned {...idle(faceN, t, 0.1)} lookY={scared ? -10 : 0} faceDy={scared ? -10 : 0} blink={blink(t, 0.9)} /></Cel>
    <Cel at={POS.blob}><Blob {...idle(faceB, t)} handR={t < K.lose - 0.2 ? [128, -340 + 14 * loopS(t, IDLE_N * 2)] : faceB.handR} blink={blink(t, 0.6)} /></Cel>
    <Cel at={POS.sara}><Sara {...idle(faceS, t, 0.4)} lookY={scared ? -10 : 0} faceDy={scared ? -10 : 0} blink={blink(t, 1.2)} /></Cel>
  </World>);
};

// ---------------------------------------------------------------- shot 2: money, houses, fields - all gone (wide, at night)
const Dust: React.FC<{pos: V3; t: number; t0: number; s?: number}> = ({pos, t, t0, s = 1}) => {
  const u = prog(t, t0, t0 + 0.9); if (u <= 0 || u >= 1) return null;
  return (<group position={pos}>{[0, 1, 2, 3, 4, 5].map((i) => { const a = i * 1.05;
    return <Ball key={i} pos={[Math.cos(a) * (0.6 + u * 1.2) * s, 0.25 + u * 0.8 * s, Math.sin(a) * (0.4 + u * 0.7) * s]} r={(0.35 + u * 0.4) * s * Math.sin(Math.PI * u)} color="#E3D6C2" emissive="#7A6E5C" glow={0.5} rough={1} cast={false} />; })}</group>);
};
const Vanish: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.wide, {pos: [8.2, 4.3, 7.8], look: [-1.2, 0.9, -3.4], fov: 40}], [C.gone, {pos: [7.4, 3.9, 7.0], look: [-1.2, 0.9, -3.6], fov: 40}]]);
  const coins = 1 - smooth(prog(t, K.money - 0.08, K.money + 0.3));
  const houses = 1 - smooth(prog(t, K.houses - 0.12, K.houses + 0.5));
  const fields = 1 - smooth(prog(t, K.fields - 0.12, K.fields + 0.45));
  const tod = timeOfDay(1, [0, 0, -2], 14);
  return (<World cam={cam} light={tod.light} sky={tod.sky} scene={<>
      <Village t={t} s={{night: 1, dayPhase: 0.5, coins, houses, fields}} />
      <Dust pos={COINS} t={t} t0={K.money - 0.1} s={0.5} />
      {[PLOT.ned, PLOT.sara, PLOT.blob].map((x) => <Dust key={x} pos={[x, 0, -3.6]} t={t} t0={K.houses - 0.15} s={1.05} />)}
      <Dust pos={[-4.5, 0, -10]} t={t} t0={K.fields - 0.1} s={2} /><Dust pos={[4.5, 0, -10]} t={t} t0={K.fields - 0.1} s={2} />
    </>}>
    <Cel at={POS.ned}><Ned {...act(t, [[0, 'scared']], [[0, 'shocked']])} view="left" blink={0} /></Cel>
    <Cel at={POS.blob}><Blob {...act(t, [[0, 'handsOnHead']], [[0, 'shocked'], [K.houses, 'scared']])} /></Cel>
    <Cel at={POS.sara}><Sara {...act(t, [[0, 'scared'], [K.houses, 'handsOnHead']], [[0, 'shocked']])} view="left" /></Cel>
  </World>);
};
const GONE_STATE: VState = {houses: 0, coins: 0, fields: 0};

// ---------------------------------------------------------------- shot 3: all gone - bare land at dawn, a tumbleweed
const Tumble: React.FC<{t: number; t0: number; t1: number; z: number}> = ({t, t0, t1, z}) => {
  const u = prog(t, t0, t1); if (u <= 0 || u >= 1) return null; const x = lerp(-3.5, 3.5, u);
  return (<group position={[x, 0.32 + 0.08 * Math.abs(Math.sin(u * 14)), z]} rotation={[0, 0, -x / 0.32]}>
    {[0, 1, 2].map((i) => <mesh key={i} rotation={[i * 1.05, i * 0.7, 0]} castShadow><torusGeometry args={[0.3, 0.025, 6, 24]} /><meshStandardMaterial color="#A88A5A" roughness={1} /></mesh>)}
  </group>);
};
const AllGone: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.gone, {pos: [0, 1.45, 5.9], look: [0, 1.0, 0.2], fov: 34}], [C.days, {pos: [0, 1.75, 7.6], look: [0, 1.0, 0.2], fov: 35}]]);
  const L = mixLight(DAWN, DAY, prog(t, C.gone, C.days) * 0.5);
  const sag = smooth(prog(t, K.gone - 0.1, K.gone + 0.35));
  const sadB = act(t, [[0, 'stand'], [K.gone - 0.1, 'sad']], [[0, 'shocked'], [K.gone - 0.1, 'sad']]);
  return (<World cam={cam} light={L} sky={mixSky(SKY.dawn, SKY.day, 0.3)} scene={<><Village t={t} s={{...GONE_STATE, dayPhase: 0.25}} /><Tumble t={t} t0={K.gone + 0.1} t1={C.days + 0.3} z={1.8} /></>}>
    <Cel at={POS.ned}><Ned {...idle(act(t, [[0, 'stand'], [K.gone, 'sad']], [[0, 'shocked'], [K.gone, 'sad']]), t, 0.2)} lookX={-6 * sag} /></Cel>
    <Cel at={POS.blob}><Blob {...idle(sadB, t)} blink={blink(t, K.gone + 0.6)} /></Cel>
    <Cel at={POS.sara}><Sara {...idle(act(t, [[0, 'stand'], [K.gone + 0.05, 'sad']], [[0, 'shocked'], [K.gone + 0.05, 'sad']]), t, 0.5)} /></Cel>
  </World>);
};

// ---------------------------------------------------------------- shot 4: three hungry days (time-lapse, sitting)
const Days: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.days, {pos: [0, 1.3, 8.4], look: [0, 0.62, 0.6], fov: 32}], [C.gets, {pos: [0, 1.2, 7.6], look: [0, 0.6, 0.6], fov: 32}]]);
  const dp = 3 * smooth(prog(t, C.days + 0.05, C.gets - 0.05)), night = (1 - Math.cos(2 * Math.PI * dp)) / 2;
  const tod = timeOfDay(night);
  const weak = prog(t, C.days, C.gets);
  const sit = (p: Pose, ph: number): Pose => ({...SITF, ...p, bounce: -104 - 6 * weak + 2 * loopS(t, IDLE_N, ph), handL: [-34, -120], handR: [34, -120], headTilt: 8 * weak * (ph > 0.3 ? -1 : 1)});
  const face: Pose = {eyes: weak > 0.6 ? 'closed' : 'dot', mouth: 'wavy', brow: -0.8, browUp: 0.4, sweat: weak > 0.5 ? 1 : 0, tint: '#E8E2A8', tintAmt: 0.5 * weak};
  return (<World cam={cam} light={tod.light} sky={tod.sky} scene={<Village t={t} s={{...GONE_STATE, night, dayPhase: dp}} />}>
    <Cel at={[-0.92, 0, 0.75]}><Ned {...sit(face, 0.1)} /></Cel>
    <Cel at={[0, 0, 0.95]}><Blob {...sit(face, 0.0)} /></Cel>
    <Cel at={[0.92, 0, 0.75]}><Sara {...sit(face, 0.4)} /></Cel>
  </World>);
};

// ---------------------------------------------------------------- shot 5: one chicken each (also the "same start" memory)
const SAME0: Cam3 = {pos: [0, 1.55, 9.3], look: [0, 1.02, 0.6], fov: 34};
const Gets: React.FC<{t: number; memory?: boolean}> = ({t, memory = false}) => {
  const t0 = memory ? C.same : C.gets;
  const cam = memory
    ? cam3At(t, [[C.same, SAME0], [K.same2 - 0.3, {pos: [0, 1.52, 8.9], look: [0, 1.0, 0.6], fov: 33}], [K.same2 + 0.35, {pos: [0, 1.1, 7.4], look: [0, 0.92, 0.6], fov: 30}, EASE.punch], [C.poor, {pos: [0, 1.1, 7.2], look: [0, 0.92, 0.6], fov: 30}]])
    : cam3At(t, [[C.gets, SAME0], [C.cook, {pos: [0, 1.5, 8.5], look: [0, 1.0, 0.6], fov: 33}]]);
  const land = (i: number) => memory ? 1 : smooth(prog(t, K.chicken - 0.55 + i * 0.22, K.chicken - 0.2 + i * 0.22));
  const fallY = (i: number) => -1500 * (1 - land(i)) * (1 - land(i));
  const got = (i: number) => memory || t > K.chicken - 0.2 + i * 0.22;
  const pose = (i: number, ph: number): Pose => {
    const g = got(i);
    return idle(g ? {...act(t, [[0, 'holdFront']], [[0, 'joy']]), ...HOLD, bounce: 6 * spring(t, K.chicken - 0.2 + i * 0.22, 3, 5)}
      : {...act(t, [[0, 'reach']], [[0, 'awe']]), view: 'front', handL: [-70, -300], handR: [70, -300]}, t, ph);
  };
  const L = memory ? DAY : mixLight(DAY, DAY, 0);
  return (<World cam={cam} light={L} sky={SKY.day} scene={<Village t={t} s={GONE_STATE} />}>
    <Cel at={[-1.02, 0, 0.75]}><Ned {...pose(0, 0.1)} /><Held b={{...NED_HEN, dir: 1, flap: got(0) ? bump(t, K.chicken - 0.2, K.chicken + 0.3) : 1}} y={fallY(0)} /></Cel>
    <Cel at={[0, 0, 0.95]}><Blob {...pose(2, 0)} /><Held b={{...ROOSTER, dir: -1, flap: got(2) ? bump(t, K.chicken + 0.24, K.chicken + 0.7) : 1}} y={fallY(2)} /></Cel>
    <Cel at={[1.02, 0, 0.75]}><Sara {...pose(1, 0.4)} /><Held b={{...SARA_HEN, dir: -1, flap: got(1) ? bump(t, K.chicken + 0.02, K.chicken + 0.5) : 1}} y={fallY(1)} /></Cel>
    {!memory && [0, 1, 2].map((i) => { const u = prog(t, K.chicken - 0.2 + i * 0.22, K.chicken + 0.5 + i * 0.22); if (u <= 0 || u >= 1) return null;
      const x = [-1.02, 1.02, 0][i], p = toScreen(cam, [x, 0.62, [0.75, 0.75, 0.95][i]]); if (!p) return null;
      return <g key={i} transform={`translate(${p.x} ${p.y}) scale(${(p.s / 260) * Math.sin(Math.PI * u)})`}><Puff c={[[-60, -10, 22], [60, -20, 18], [0, -50, 20]]} ow={6} /></g>; })}
    {void t0}
  </World>);
};

// ---------------------------------------------------------------- shots 6-8: Ned cooks his chicken (night)
const NED_AT: V3 = [PLOT.ned - 0.25, 0, 0.6];
const Steam: React.FC<{pos: V3; t: number; n?: number; amt?: number}> = ({pos, t, n = 6, amt = 1}) => amt <= 0.01 ? null : (<group position={pos}>
  {Array.from({length: n}, (_, i) => { const a = ((t * 0.6 + i / n) % 1);
    return <Ball key={i} pos={[0.08 * Math.sin(a * 6 + i), a * 0.9, 0.05 * Math.cos(a * 5 + i)]} r={(0.05 + a * 0.12) * amt} color="#F4F4F4" opacity={0.75 * (1 - a)} rough={1} cast={false} receive={false} />; })}
</group>);
const NIGHT_NED = timeOfDay(1, [PLOT.ned, 0, 0], 6);
const Cook: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.cook, {pos: [PLOT.ned + 0.35, 1.5, 5.0], look: [PLOT.ned + 0.3, 0.9, 0.3], fov: 34}], [C.best, {pos: [PLOT.ned + 0.4, 1.4, 4.3], look: [PLOT.ned + 0.3, 0.9, 0.3], fov: 33}]]);
  const stir = Math.sin((t - C.cook) * 9);
  const feather = prog(t, K.cooks + 0.2, C.best);
  return (<World cam={cam} light={NIGHT_NED.light} sky={NIGHT_NED.sky} scene={<>
      <Village t={t} s={{...GONE_STATE, night: 1, dayPhase: 0.5, fire: 1}} />
      <Steam pos={[PLOT.ned + 0.7, 0.75, 0.2]} t={t} />
      {feather > 0 && feather < 1 && <Ball pos={[PLOT.ned + 0.55 + 0.15 * Math.sin(feather * 9), lerp(1.7, 0.05, feather), 0.5]} r={0.07} scale={[1, 0.25, 0.5]} rot={[0, 0, 0.6 * Math.sin(feather * 9)]} color="#B8682F" rough={1} />}
    </>}>
    <Cel at={NED_AT}><Ned {...act(t, [[0, 'holdFront']], [[0, 'grin']])} view="right" handR={[96 + 10 * stir, -200 + 6 * Math.cos((t - C.cook) * 9)]} handL={[40, -150]} bounce={3 * Math.abs(stir)} lookY={8} faceDy={6} /></Cel>
  </World>);
};
const Best: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.best, {pos: [PLOT.ned - 0.2, 1.42, 5.0], look: [PLOT.ned - 0.25, 1.22, 0.6], fov: 28}], [C.last, {pos: [PLOT.ned - 0.22, 1.4, 4.6], look: [PLOT.ned - 0.25, 1.22, 0.6], fov: 28}]]);
  const sip = bump(t, K.best + 0.1, K.best + 0.9) + bump(t, K.best + 1.1, K.best + 1.8);
  const hand: [number, number] = [0, -170 - 60 * sip];
  const bowl = celPoint(cam, NED_AT, 1.7, [0, hand[1] + 6]);
  return (<World cam={cam} light={NIGHT_NED.light} sky={NIGHT_NED.sky} scene={<Village t={t} s={{...GONE_STATE, night: 1, dayPhase: 0.5, fire: 1}} />}
    front={<><Cyl pos={[bowl[0], bowl[1] - 0.05, bowl[2] + 0.06]} r={0.1} rTop={0.15} h={0.12} color="#D9A066" map={tex('planks', [6, 1], 3)} rough={0.6} /><Steam pos={[bowl[0], bowl[1] + 0.06, bowl[2] + 0.06]} t={t} n={4} amt={0.5} /></>}>
    <Cel at={NED_AT}><Ned eyes="closed" mouth="grin" browUp={0.6} handL={[-34, hand[1] + 16]} handR={[34, hand[1] + 16]} bounce={5 * Math.abs(Math.sin((t - C.best) * 7))} headTilt={6 * Math.sin((t - C.best) * 3.5)} tint="#FFB08A" tintAmt={0.35} /></Cel>
  </World>);
};
const Last: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.last, {pos: [PLOT.ned + 0.1, 1.45, 3.6], look: [PLOT.ned, 1.0, 0.5], fov: 30}], [C.second, {pos: [PLOT.ned + 0.4, 2.2, 6.6], look: [PLOT.ned + 0.1, 0.85, 0.4], fov: 34}]]);
  const fire = 1 - smooth(prog(t, K.last - 0.15, K.last + 0.3));
  const smoke = prog(t, K.last, K.last + 1.4);
  const bowl = celPoint(cam, NED_AT, 1.7, [0, -164]);
  const sad = t > K.last - 0.1;
  return (<World cam={cam} light={mixLight(NIGHT_NED.light as any, {...NIGHT_NED.light, ambI: 0.75, sunI: 0.8} as any, 1 - fire)} sky={NIGHT_NED.sky}
    scene={<><Village t={t} s={{...GONE_STATE, night: 1, dayPhase: 0.5, fire, firePot: true}} />
      {smoke > 0 && smoke < 1 && [0, 1, 2].map((i) => <Ball key={i} pos={[PLOT.ned + 0.7 + i * 0.1, 0.3 + smoke * 1.6 + i * 0.3, 0.2]} r={0.12 + smoke * 0.3} color="#8C8F96" opacity={0.85 * (1 - smoke)} rough={1} cast={false} receive={false} />)}</>}
    front={<Cyl pos={[bowl[0], bowl[1] - 0.05, bowl[2] + 0.06]} r={0.1} rTop={0.15} h={0.12} color="#D9A066" map={tex('planks', [6, 1], 3)} rough={0.6} />}>
    <Cel at={NED_AT}><Ned {...act(t, [[0, 'holdFront'], [K.last - 0.1, 'sad']], [[0, 'smug'], [K.last - 0.1, 'sad']])} handL={[-34, -150]} handR={[34, -150]} lookY={sad ? 10 : 0} faceDy={sad ? 10 : 0} /></Cel>
  </World>);
};

// ---------------------------------------------------------------- shots 9-10: Sara and her hen (morning)
const SARA_AT: V3 = [-0.75, 0, 0.55];
const HEN_AT: V3 = [0.2, 0, 0.9];
const Second: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.second, {pos: [-0.35, 1.4, 5.4], look: [-0.25, 0.9, -0.3], fov: 34}], [C.egg, {pos: [-0.15, 1.35, 4.7], look: [-0.2, 0.88, -0.3], fov: 33}]]);
  const L = mixLight(DAWN, DAY, 0.5 + 0.5 * prog(t, C.second, C.egg));
  const peck = Math.max(0, Math.sin((t - C.second) * 7)) * (t > K.hen + 0.2 ? 1 : 0);
  return (<World cam={cam} light={L} sky={mixSky(SKY.dawn, SKY.day, 0.7)} scene={<Village t={t} s={GONE_STATE} />}>
    <Cel at={SARA_AT}><Sara {...idle(act(t, [[0, 'relaxed'], [K.hen - 0.1, 'point']], [[0, 'happy'], [K.hen - 0.1, 'grin']]), t, 0.4)} view="front" handR={t > K.hen - 0.1 ? [150, -150] : [66, -116]} /></Cel>
    <Cel at={HEN_AT} h={0.46} unitsTall={200}><Bird {...SARA_HEN} dir={-1} peck={peck} step={0} /></Cel>
  </World>);
};
const EggShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.egg, {pos: [-0.2, 0.95, 4.0], look: [-0.2, 0.58, 0.8], fov: 31}], [C.rooster, {pos: [-0.15, 0.92, 3.7], look: [-0.2, 0.58, 0.8], fov: 31}]]);
  const sit1 = 1 - smooth(prog(t, K.egg - 0.25, K.egg)), cyc = prog(t, K.egg + 0.95, K.egg + 1.6), sit2 = bump(t, K.egg + 0.95, C.rooster - 0.1) > 0.15 ? 1 : 0;
  const night = Math.sin(Math.PI * cyc) * 0.9;
  const reach = smooth(prog(t, K.egg + 0.15, K.egg + 0.45)), lift = smooth(prog(t, K.egg + 0.5, K.egg + 0.8));
  const at: V3 = [-0.55, 0, 0.55];
  const eggPos: V3 = [HEN_AT[0] - 0.05, 0.065, HEN_AT[2] + 0.05];
  const handGround: [number, number] = [ (HEN_AT[0] - 0.05 - at[0]) / 1.7 * 430, -40 ];
  const hand: [number, number] = lift > 0 ? [lerp(handGround[0], 70, lift), lerp(-40, -250, lift)] : [lerp(60, handGround[0], reach), lerp(-80, -40, reach)];
  const hw = celPoint(cam, at, 1.7, [hand[0], hand[1] - 14]);
  const egg1 = t >= K.egg - 0.05 && cyc < 0.5, carried = reach >= 1;
  const egg2 = t > C.rooster - 0.35;
  const tod = mixLight(DAY, timeOfDay(1).light as any, night);
  return (<World cam={cam} light={tod} sky={mixSky(SKY.day, SKY.night, night)} scene={<><Village t={t} s={{...GONE_STATE, dayPhase: cyc}} />
      {egg2 && <Egg pos={eggPos} s={1.2 * pop(t, C.rooster - 0.35)} />}</>}
    front={<>{egg1 && <Egg pos={carried ? hw : eggPos} s={1.2 * pop(t, K.egg - 0.05)} />}</>}>
    <Cel at={at}><Sara {...act(t, [[0, 'crouch']], [[0, 'happy'], [K.egg, 'shocked'], [K.egg + 0.55, 'joy']])} view="front" handR={hand} handL={[-58, -66]} lookX={6} lookY={t < K.egg + 0.5 ? 10 : 0} faceDy={t < K.egg + 0.5 ? 8 : 0} /></Cel>
    <Cel at={HEN_AT} h={0.46} unitsTall={200}><Bird {...SARA_HEN} dir={-1} sit={Math.max(sit1, sit2)} flap={bump(t, K.egg - 0.25, K.egg + 0.1)} eyes={sit1 > 0.5 ? 'closed' : 'dot'} /></Cel>
  </World>);
};

// ---------------------------------------------------------------- shots 11-12: Blob's rooster - no eggs at all
const BLOB_AT: V3 = [PLOT.blob - 0.2, 0, 0.6];
const RoosterShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.rooster, {pos: [PLOT.blob - 0.2, 1.4, 5.2], look: [PLOT.blob - 0.2, 1.12, 0.6], fov: 29}], [C.noeggs, {pos: [PLOT.blob - 0.2, 1.38, 4.8], look: [PLOT.blob - 0.2, 1.1, 0.6], fov: 29}]]);
  const crow = bump(t, K.rooster + 0.1, K.rooster + 0.75);
  return (<World cam={cam} light={DAY} sky={SKY.day} scene={<Village t={t} s={GONE_STATE} />}>
    <Cel at={BLOB_AT}><Blob {...idle(act(t, [[0, 'holdFront']], [[0, 'happy'], [K.rooster - 0.1, 'grin']]), t)} {...HOLD} bounce={4 * crow} /><Held b={{...ROOSTER, dir: 1, crow, flap: crow * 0.8}} /></Cel>
  </World>);
};
const NoEggs: React.FC<{t: number}> = ({t}) => {
  const rAt: V3 = [PLOT.blob + 0.3, 0, 1.05], bAt: V3 = [PLOT.blob - 0.35, 0, 0.55];
  const KEYS: Cam3Key[] = [[C.noeggs, {pos: [PLOT.blob, 2.6, 3.3], look: [PLOT.blob, 0.3, 0.75], fov: 32}], [K.noeggs + 0.35, {pos: [PLOT.blob, 2.5, 3.2], look: [PLOT.blob, 0.3, 0.75], fov: 32}],
    [K.noeggs + 0.72, {pos: [PLOT.blob - 0.15, 1.0, 4.4], look: [PLOT.blob - 0.2, 0.82, 0.55], fov: 28}, EASE.punch], [C.knock, {pos: [PLOT.blob - 0.15, 1.0, 4.3], look: [PLOT.blob - 0.2, 0.82, 0.55], fov: 28}]];
  const cam = cam3At(t, KEYS);
  const sit = 1 - smooth(prog(t, K.noeggs - 0.2, K.noeggs + 0.05));
  const shrug = smooth(prog(t, K.noeggs + 0.8, K.noeggs + 1.1));
  return (<ShotBlur t={t} cam={KEYS}><World cam={cam} light={DAY} sky={SKY.day} scene={<Village t={t} s={GONE_STATE} />}>
    <Cel at={bAt}><Blob {...act(t, [[0, 'crouch']], [[0, 'thinking'], [K.noeggs + 0.05, 'confused']])} handR={[54, -100]} handL={[-70, -110]} lookX={10} lookY={t < K.noeggs + 0.5 ? 12 : 0} faceDy={t < K.noeggs + 0.5 ? 8 : 0} headTilt={t > K.noeggs + 0.6 ? 12 : 0} /></Cel>
    <Cel at={rAt} h={0.6} unitsTall={200}><Bird {...ROOSTER} dir={-1} sit={sit} shrug={shrug} eyes={t > K.noeggs + 0.7 ? 'wide' : 'dot'} /></Cel>
  </World></ShotBlur>);
};

// ---------------------------------------------------------------- shots 13-16: the deal at Sara's door
const DOOR_X = PLOT.sara;
const KNOCK_AT: V3 = [-1.05, 0, DOOR_Z + 0.55];
const SARA_DOOR: V3 = [-0.1, 0, DOOR_Z - 0.3];
const Knock: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.knock, {pos: [-0.7, 1.5, 2.6], look: [-0.5, 1.0, DOOR_Z], fov: 34}], [C.meet, {pos: [-0.62, 1.45, 1.9], look: [-0.5, 1.0, DOOR_Z], fov: 33}]]);
  const walkU = smooth(prog(t, C.knock, K.knocks - 0.1)), x = lerp(-2.7, KNOCK_AT[0], walkU), walking = walkU > 0 && walkU < 1;
  const ph = 2 * Math.PI * (x + 2.7) / (4 * 50 * 1.7 / 430);
  const wf = walkFeet(ph, walking ? 1 : 0);
  const knock = t > K.knocks - 0.1 && t < K.knocks + 0.5 ? Math.abs(Math.sin((t - K.knocks + 0.1) * Math.PI / 0.2)) : 0;
  const open = smooth(prog(t, K.knocks + 0.5, K.knocks + 0.9));
  const deal = t > K.deal - 0.25;
  const dx = ((DOOR_X - 0.6) - KNOCK_AT[0]) / 1.7 * 430;
  return (<World cam={cam} light={DAY} sky={SKY.day} scene={<Village t={t} s={{...GONE_STATE, doorOpen: open}} />} front={open < 0.98 ? <Door x={DOOR_X} open={open} /> : undefined}>
    <Cel at={SARA_DOOR}><Sara {...act(t, [[0, 'stand'], [K.deal - 0.2, 'crossArms']], [[0, 'neutral'], [K.knocks + 0.8, 'confused'], [K.deal, 'thinking']])} view={open > 0.5 ? 'left' : 'front'} /></Cel>
    <Cel at={[x, 0, KNOCK_AT[2]]}><Blob {...act(t, [[0, 'holdFront'], [K.deal - 0.25, 'explain']], [[0, 'happy'], [K.deal - 0.25, 'grin']])} view={deal ? 'right' : 'right'}
      bounce={wf.bounce} footL={wf.footL} footR={wf.footR} handL={deal ? [-60, -150] : [-66, -150]} handR={deal ? [150, -250] : t > K.knocks - 0.15 && t < K.knocks + 0.6 ? [dx - 10 * knock, -250] : [66, -150]} />
      <Held b={{...ROOSTER, dir: 1}} x={deal ? -10 : 0} /></Cel>
  </World>);
};
const Meet: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.meet, {pos: [-0.3, 0.55, 1.15], look: [-0.3, 0.34, DOOR_Z + 0.85], fov: 30}], [C.share, {pos: [-0.3, 0.52, 0.9], look: [-0.3, 0.34, DOOR_Z + 0.85], fov: 30}]]);
  const close = smooth(prog(t, C.meet + 0.1, K.meet + 0.2));
  const heart = smooth(prog(t, K.meet + 0.2, K.meet + 0.55));
  return (<World cam={cam} light={DAY} sky={SKY.day} scene={<Village t={t} s={{...GONE_STATE, doorOpen: 1}} />}>
    <Cel at={[lerp(-0.95, -0.55, close), 0, DOOR_Z + 0.85]} h={0.6} unitsTall={200}><Bird {...ROOSTER} dir={1} step={close < 1 ? (t - C.meet) * 14 : 0} heart={heart} /></Cel>
    <Cel at={[lerp(0.35, -0.05, close), 0, DOOR_Z + 0.85]} h={0.46} unitsTall={200}><Bird {...SARA_HEN} dir={-1} step={close < 1 ? (t - C.meet) * 14 : 0} eyes={heart > 0.5 ? 'closed' : 'dot'} heart={heart * 0.8} /></Cel>
  </World>);
};
const SHARE_B: V3 = [-0.75, 0, DOOR_Z + 0.6], SHARE_S: V3 = [0.2, 0, DOOR_Z + 0.5];
const Share: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.share, {pos: [-0.27, 1.42, 3.9], look: [-0.27, 1.12, DOOR_Z + 0.55], fov: 32}], [C.wanted, {pos: [-0.27, 1.4, 3.55], look: [-0.27, 1.12, DOOR_Z + 0.55], fov: 32}]]);
  const shake = t > K.share - 0.1 ? 14 * Math.sin((t - K.share) * 16) * clamp(1 - (t - K.share - 0.6) / 0.4) : 0;
  const midX = (SHARE_B[0] + SHARE_S[0]) / 2, bx = (midX - SHARE_B[0]) / 1.7 * 430, sx = (midX - SHARE_S[0]) / 1.7 * 430;
  const reach = smooth(prog(t, C.share, K.share - 0.1));
  return (<World cam={cam} light={DAY} sky={SKY.day} scene={<><Village t={t} s={{...GONE_STATE, doorOpen: 1}} />
      <Basket pos={[midX, 0, DOOR_Z + 0.95]} eggs={pop(t, K.eggs ?? K.share + 0.45) > 0 ? 4 : 0} s={1.1 * pop(t, K.share + 0.4)} /></>}>
    <Cel at={SHARE_S}><Sara {...idle(act(t, [[0, 'stand']], [[0, 'thinking'], [K.share - 0.1, 'happy']]), t, 0.4)} view="left" handL={[lerp(-66, sx, reach), lerp(-140, -170, reach) + shake]} /></Cel>
    <Cel at={SHARE_B}><Blob {...idle(act(t, [[0, 'stand']], [[0, 'grin'], [K.share, 'joy']]), t)} view="right" handR={[lerp(66, bx, reach), lerp(-140, -170, reach) + shake]} /></Cel>
  </World>);
};
const Wanted: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.wanted, {pos: [0.2, 1.4, DOOR_Z + 4.8], look: [0.2, 1.28, DOOR_Z + 0.5], fov: 28}], [C.chicks, {pos: [0.2, 1.38, DOOR_Z + 4.5], look: [0.2, 1.28, DOOR_Z + 0.5], fov: 28}]]);
  const hand: [number, number] = [60, -250 + 8 * Math.sin((t - C.wanted) * 6)];
  const e = celPoint(cam, SHARE_S, 1.7, [hand[0] + 2, hand[1] - 22]);
  return (<World cam={cam} light={DAY} sky={SKY.day} scene={<Village t={t} s={{...GONE_STATE, doorOpen: 1}} />} front={<Egg pos={e} s={1.25} />}>
    <Cel at={SHARE_S}><Sara {...act(t, [[0, 'stand']], [[0, 'happy'], [K.wanted - 0.1, 'joy']])} handR={hand} handL={[-66, -140]} headTilt={5 * Math.sin((t - C.wanted) * 4)} bounce={4 * Math.abs(Math.sin((t - C.wanted) * 6))} /></Cel>
  </World>);
};
const EGG_HAND: [number, number] = [74, -400];
const ChicksShot: React.FC<{t: number}> = ({t}) => {
  const e = (c: Cam3) => celPoint(c, SHARE_B, 1.7, [EGG_HAND[0] + 2, EGG_HAND[1] - 22]);
  const base: Cam3 = {pos: [-0.72, 1.45, DOOR_Z + 4.9], look: [-0.72, 1.36, DOOR_Z + 0.6], fov: 28};
  const ep = e(base);
  const KEYS: Cam3Key[] = [[C.chicks, base], [C.weeks - 0.42, {pos: [-0.7, 1.5, DOOR_Z + 4.4], look: [ep[0], ep[1] - 0.15, ep[2]], fov: 28}], [C.weeks, {pos: [ep[0], ep[1], ep[2] + 0.22], look: ep, fov: 22}, EASE.dive]];
  const cam = cam3At(t, KEYS);
  const glow = smooth(prog(t, K.chicks, K.chicks + 0.4));
  return (<ShotBlur t={t} cam={KEYS}><World cam={cam} light={DAY} sky={SKY.day} scene={<Village t={t} s={{...GONE_STATE, doorOpen: 1}} />} front={<Egg pos={ep} s={1.3} glow={glow * 0.9} color="#FFF4DA" />}>
    <Cel at={SHARE_B}><Blob {...act(t, [[0, 'stand']], [[0, 'happy'], [K.chicks - 0.1, 'smug']])} handR={EGG_HAND} handL={[-66, -140]} lookX={8} lookY={-8} faceDy={-4} /></Cel>
  </World></ShotBlur>);
};

// ---------------------------------------------------------------- shot 17: inside the egg (one layer deep) - three weeks
const HalfShell: React.FC<{r: number; pos?: V3; rot?: V3; upper?: boolean; full?: boolean}> = ({r, pos = [0, 0, 0], rot = [0, 0, 0], upper, full}) => (<group position={pos} rotation={rot} scale={[1, 1.28, 1]}>
  <mesh castShadow receiveShadow>
    {full ? <sphereGeometry args={[r, 40, 28]} /> : upper === undefined ? <sphereGeometry args={[r, 48, 32, Math.PI, Math.PI]} /> : <sphereGeometry args={[r, 40, 20, 0, Math.PI * 2, upper ? 0 : Math.PI * 0.55, upper ? Math.PI * 0.55 : Math.PI * 0.45]} />}
    <meshStandardMaterial color="#F6EBD9" roughness={0.5} side={THREE.DoubleSide} />
  </mesh>
  {upper === undefined && !full && <mesh rotation={[0, 0, 0]}><ringGeometry args={[r * 0.94, r, 48]} /><meshStandardMaterial color="#E9DCC4" roughness={0.6} side={THREE.DoubleSide} /></mesh>}
</group>);
const Nest: React.FC<{pos: V3; s?: number}> = ({pos, s = 1}) => (<group position={pos} scale={s}>
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]} castShadow receiveShadow><torusGeometry args={[0.32, 0.1, 10, 28]} /><meshStandardMaterial color="#D9B25A" map={tex('grass', [6, 1], 8)} roughness={1} /></mesh>
  <Cyl r={0.33} h={0.05} color="#C9A04E" map={tex('grass', [3, 3], 9)} />
</group>);
const Inside: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.weeks, {pos: [0, 0.5, 2.15], look: [0, 0.34, 0], fov: 32}], [C.hatch, {pos: [0, 0.46, 1.8], look: [0, 0.34, 0], fov: 32}]]);
  const u = smooth(prog(t, C.weeks + 0.1, C.hatch - 0.1));
  const dp = 7 * u, night = (1 - Math.cos(2 * Math.PI * dp)) / 2 * 0.85;
  const L = mixLight({...DAY, focus: [0, 0.3, 0], span: 2} as any, {...timeOfDay(1).light, focus: [0, 0.3, 0], span: 2} as any, night);
  return (<World cam={cam} light={L} sky={mixSky(['#F6D9A8', '#F2C27A'], ['#2A2550', '#4A3A6A'], night)} scene={<>
      <Ground size={[8, 8]} color="#C9A04E" map={tex('grass', [8, 8], 3)} />
      <Box pos={[0, 0, -1.4]} size={[6, 3, 0.2]} color="#B5743F" map={tex('planks', [6, 3], 2)} r={0} />
      <Nest pos={[0, 0, 0]} s={1.3} />
      <HalfShell r={0.24} pos={[0, 0.36, 0]} />
      <Ball pos={[0.04, 0.3, -0.14]} r={0.1 * (1 - 0.7 * u)} color="#F2B43A" rough={0.4} />
    </>}>
    <Cel at={[-0.02, 0.17, 0.03]} h={0.2 * (0.35 + 0.65 * u)} unitsTall={140} shadow={false}><Bird kind="chick" eyes="closed" peck={0.8} /></Cel>
  </World>);
};

// ---------------------------------------------------------------- shot 18: the first chicks hatch
const NEST_AT: V3 = [PLOT.blob, 0, 1.0];
const EGGS4: [number, number][] = [[-0.13, 0.05], [0.13, 0.06], [-0.02, -0.1], [0.06, 0.16]];
const Hatch: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.hatch, {pos: [PLOT.blob, 1.2, 4.5], look: [PLOT.blob, 0.62, 0.5], fov: 32}], [C.months, {pos: [PLOT.blob, 1.15, 4.1], look: [PLOT.blob, 0.62, 0.5], fov: 32}]]);
  const crack = (i: number) => prog(t, K.hatch - 0.05 + i * 0.16, K.hatch + 0.3 + i * 0.16);
  return (<World cam={cam} light={{...DAY, focus: NEST_AT, span: 5}} sky={SKY.day} scene={<><Village t={t} s={GONE_STATE} /><Nest pos={NEST_AT} />
      {EGGS4.map(([x, z], i) => { const c = crack(i), p: V3 = [NEST_AT[0] + x, 0.12, NEST_AT[2] + z];
        return c <= 0 ? <HalfShell key={i} r={0.06} pos={[p[0], p[1] + 0.06 + 0.006 * Math.sin(t * 40 + i) * (t > K.hatch - 0.5 ? 1 : 0), p[2]]} full />
          : <group key={i}><HalfShell r={0.06} pos={[p[0], p[1] + 0.06, p[2]]} upper={false} /><HalfShell r={0.06} pos={[p[0] + 0.05 * c, p[1] + 0.06 + 0.12 * Math.sin(Math.PI * Math.min(1, c * 1.2)), p[2]]} rot={[0, 0, -1.4 * c]} upper /></group>; })}</>}>
    <Cel at={[PLOT.blob, 0, 0.35]}><Blob {...act(t, [[0, 'crouch']], [[0, 'awe'], [K.hatch + 0.1, 'joy']])} handL={[-90, -150]} handR={[90, -150]} bounce={-64 + 6 * spring(t, K.hatch + 0.1, 3, 5)} /></Cel>
    {EGGS4.map(([x, z], i) => { const c = crack(i); if (c <= 0.2) return null;
      return <Cel key={i} at={[NEST_AT[0] + x, 0.12, NEST_AT[2] + z + 0.02]} h={0.13 * pop(t, K.hatch + 0.05 + i * 0.16)} unitsTall={140} shadow={false}><Bird kind="chick" flap={bump(t, K.hatch + 0.1 + i * 0.16, K.hatch + 0.5 + i * 0.16)} dir={i % 2 ? -1 : 1} /></Cel>; })}
  </World>);
};

// ---------------------------------------------------------------- shots 19-20: five months later - laying eggs too
const FLOCK4: V3[] = [[PLOT.blob - 0.75, 0, 1.15], [PLOT.blob - 0.25, 0, 1.3], [PLOT.blob + 0.25, 0, 1.2], [PLOT.blob + 0.75, 0, 1.35]];
const Months: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.months, {pos: [PLOT.blob + 0.1, 1.4, 6.0], look: [PLOT.blob + 0.1, 0.82, 0.4], fov: 34}], [C.laying, {pos: [PLOT.blob + 0.1, 1.35, 5.5], look: [PLOT.blob + 0.1, 0.8, 0.4], fov: 34}]]);
  const g = smooth(prog(t, C.months + 0.15, C.laying - 0.25)), dp = 5 * g, night = (1 - Math.cos(2 * Math.PI * dp)) / 2 * 0.8;
  const tod = timeOfDay(night);
  return (<World cam={cam} light={tod.light} sky={tod.sky} scene={<Village t={t} s={{...GONE_STATE, autumn: g, dayPhase: dp, night}} />}>
    <Cel at={[PLOT.blob - 0.15, 0, 0.3]}><Blob {...idle(act(t, [[0, 'think'], [C.laying - 0.6, 'cheer']], [[0, 'thinking'], [C.laying - 0.6, 'joy']]), t)} /></Cel>
    {FLOCK4.map((p, i) => { const grown = g > 0.45 + i * 0.05; const sz = grown ? lerp(0.32, 0.46, smooth((g - 0.45) / 0.5)) : lerp(0.13, 0.3, g / 0.45);
      return <Cel key={i} at={p} h={sz} unitsTall={grown ? 200 : 140}><Bird kind={grown ? 'hen' : 'chick'} body={i % 2 ? '#B8682F' : undefined} dir={i % 2 ? 1 : -1} peck={Math.max(0, Math.sin(t * 5 + i * 1.7))} /></Cel>; })}
  </World>);
};
const Laying: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.laying, {pos: [PLOT.blob, 1.05, 4.9], look: [PLOT.blob, 0.65, 0.7], fov: 32}], [C.fills, {pos: [PLOT.blob, 1.0, 4.6], look: [PLOT.blob, 0.65, 0.7], fov: 32}]]);
  const lay = (i: number) => K.laying - 0.05 + i * 0.22;
  return (<World cam={cam} light={DAY} sky={SKY.day} scene={<><Village t={t} s={{...GONE_STATE, autumn: 1}} />
      {FLOCK4.map((p, i) => t > lay(i) ? <Egg key={i} pos={[p[0] - 0.04, 0.07, p[2] + 0.06]} s={1.2 * pop(t, lay(i))} /> : null)}</>}>
    <Cel at={[PLOT.blob - 0.1, 0, 0.2]}><Blob {...act(t, [[0, 'stand'], [lay(3) + 0.1, 'cheer']], [[0, 'awe'], [lay(3) + 0.1, 'joy']])} /></Cel>
    {FLOCK4.map((p, i) => <Cel key={i} at={[p[0], 0, p[2] - 0.08]} h={0.46} unitsTall={200}><Bird kind="hen" body={i % 2 ? '#B8682F' : undefined} dir={i % 2 ? 1 : -1}
      sit={t < lay(i) ? 1 - smooth(prog(t, lay(i) - 0.3, lay(i))) : 0} flap={bump(t, lay(i) - 0.15, lay(i) + 0.2)} eyes={t > lay(i) - 0.1 && t < lay(i) + 0.4 ? 'wide' : 'dot'} /></Cel>)}
  </World>);
};

// ---------------------------------------------------------------- shots 21-22: the yard fills up - he can't keep up
const FLOCK: V3[] = Array.from({length: 32}, (_, i) => [PLOT.blob - 2.2 + rnd(i * 3 + 1) * 4.4, 0, -0.9 + rnd(i * 5 + 2) * 2.8]);
const flockN = (t: number) => t < K.fills ? 4 : t < K.fills + 0.35 ? 8 : t < K.fills + 0.7 ? 16 : 32;
const Flock: React.FC<{t: number; n: number; t0?: number; skipNear?: V3; front?: number}> = ({t, n, t0 = -1, skipNear, front = 0}) => <>{FLOCK.slice(0, n).map((p, i) => {
  if (skipNear && (Math.hypot(p[0] - skipNear[0], p[2] - skipNear[2]) < 0.45 || (front > 0 && Math.abs(p[0] - skipNear[0]) < 0.6 && p[2] - skipNear[2] > -1.6 && p[2] - skipNear[2] < front))) return null;
  const born = i < 4 ? -1 : i < 8 ? K.fills : i < 16 ? K.fills + 0.35 : K.fills + 0.7;
  const s = t0 >= 0 && born > 0 ? pop(t, born, 0.3) : 1; if (s <= 0) return null;
  return <Cel key={i} at={p} h={0.46 * s} unitsTall={200}><Bird kind="hen" body={i % 3 === 1 ? '#B8682F' : i % 5 === 2 ? '#2B2B30' : undefined} wing={i % 5 === 2 ? '#46464E' : undefined} dir={rnd(i) > 0.5 ? 1 : -1} peck={Math.max(0, Math.sin(t * 4 + i * 1.3))} step={0} /></Cel>; })}</>;
const Fills: React.FC<{t: number}> = ({t}) => {
  const KEYS: Cam3Key[] = [[C.fills, {pos: [PLOT.blob, 1.5, 4.4], look: [PLOT.blob, 0.65, 0.2], fov: 34}], [K.fills + 0.15, {pos: [PLOT.blob, 1.55, 4.5], look: [PLOT.blob, 0.65, 0.2], fov: 34}],
    [K.fills + 0.6, {pos: [PLOT.blob + 0.4, 5.6, 8.0], look: [PLOT.blob, 0.2, -0.4], fov: 38}, EASE.slam], [C.keep, {pos: [PLOT.blob + 0.45, 5.7, 8.2], look: [PLOT.blob, 0.2, -0.4], fov: 38}]];
  const cam = cam3At(t, KEYS);
  return (<ShotBlur t={t} cam={KEYS}><World cam={cam} light={{...DAY, focus: [PLOT.blob, 0, 0], span: 7}} sky={SKY.day} scene={<Village t={t} s={{...GONE_STATE, coop: pop(t, K.fills + 0.1, 0.45)}} />}>
    <Cel at={[PLOT.blob - 0.1, 0, 1.2]}><Blob {...act(t, [[0, 'stand'], [K.fills + 0.3, 'handsOnHead']], [[0, 'happy'], [K.fills + 0.3, 'shocked']])} /></Cel>
    <Flock t={t} n={flockN(t)} t0={C.fills} skipNear={[PLOT.blob - 0.1, 0, 1.2]} front={2.5} />
  </World></ShotBlur>);
};
const EGGS_GROUND: V3[] = Array.from({length: 14}, (_, i) => [PLOT.blob - 2 + rnd(i * 7 + 3) * 4, 0.065, -0.6 + rnd(i * 11 + 4) * 2.2]);
const Keep: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.keep, {pos: [PLOT.blob, 1.5, 6.6], look: [PLOT.blob, 0.85, 0.3], fov: 34}], [C.hires, {pos: [PLOT.blob - 0.2, 1.5, 6.2], look: [PLOT.blob - 0.1, 0.85, 0.3], fov: 34}]]);
  const u = (t - C.keep) / (C.hires - C.keep);
  const x = PLOT.blob + 1.1 * Math.sin(u * Math.PI * 2.4), vx = Math.cos(u * Math.PI * 2.4);
  const run = act(t, [[0, 'stand']], [[0, 'scared']]);
  const ph = (t - C.keep) * 15, wf = walkFeet(ph, 1.2);
  return (<World cam={cam} light={DAY} sky={SKY.day} scene={<><Village t={t} s={{...GONE_STATE, coop: 1}} />{EGGS_GROUND.map((p, i) => <Egg key={i} pos={p} s={1.1} />)}</>}>
    <Cel at={[x, 0, 0.9]}><Blob {...run} view={vx > 0 ? 'right' : 'left'} lean={vx > 0 ? 9 : -9} {...wf} handL={[-50, -380 + 20 * Math.sin(ph)]} handR={[50, -380 - 20 * Math.sin(ph)]} /></Cel>
    <Flock t={t} n={32} skipNear={[x, 0, 0.9]} />
  </World>);
};

// ---------------------------------------------------------------- shots 23-24: he hires Ned - paid in eggs
const HIRE_N: V3 = [PLOT.blob - 1.55, 0, 0.6], HIRE_B: V3 = [PLOT.blob - 0.45, 0, 0.6];
const Hires: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.hires, {pos: [PLOT.blob - 1.0, 1.45, 7.0], look: [PLOT.blob - 1.0, 1.05, 0.3], fov: 34}], [C.pays, {pos: [PLOT.blob - 1.0, 1.42, 6.5], look: [PLOT.blob - 1.0, 1.05, 0.3], fov: 34}]]);
  const wu = smooth(prog(t, C.hires, K.hires + 0.35)), x = lerp(PLOT.blob - 3.3, HIRE_N[0], wu), walking = wu > 0 && wu < 1;
  const wf = walkFeet(2 * Math.PI * (x - PLOT.blob + 3.3) / (4 * 50 * 1.7 / 430), walking ? 1 : 0);
  return (<World cam={cam} light={DAY} sky={SKY.day} scene={<Village t={t} s={{...GONE_STATE, coop: 1}} />}>
    <Cel at={[x, 0, HIRE_N[2]]}><Ned {...act(t, [[0, 'sad'], [K.hires + 0.45, 'stand']], [[0, 'sad'], [K.hires + 0.5, 'confused'], [K.hires + 0.9, 'happy']])} view={walking ? 'right' : 'right'} bounce={wf.bounce} footL={wf.footL} footR={wf.footR} tint="#D9D3F0" tintAmt={0.4 * (1 - prog(t, K.hires + 0.5, K.hires + 1))} /></Cel>
    <Cel at={HIRE_B}><Blob {...idle(act(t, [[0, 'stand'], [K.hires - 0.2, 'wave'], [K.hires + 0.5, 'point']], [[0, 'happy'], [K.hires, 'grin']]), t)} view={t > K.hires + 0.45 ? 'right' : 'left'} /></Cel>
    <Flock t={t} n={20} skipNear={HIRE_B} />
  </World>);
};
const Pays: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.pays, {pos: [PLOT.blob - 1.0, 1.32, 7.0], look: [PLOT.blob - 1.0, 1.08, 0.6], fov: 30}], [C.same, {pos: [PLOT.blob - 1.0, 1.3, 6.6], look: [PLOT.blob - 1.0, 1.08, 0.6], fov: 30}]]);
  const bk = celPoint(cam, HIRE_N, 1.7, [70, -150]);
  const drops = [0, 1, 2].map((i) => prog(t, K.pays - 0.1 + i * 0.3, K.pays + 0.2 + i * 0.3));
  const give = celPoint(cam, HIRE_B, 1.7, [-90, -190]);
  return (<World cam={cam} light={DAY} sky={SKY.day} scene={<Village t={t} s={{...GONE_STATE, coop: 1}} />}
    front={<><Basket pos={[bk[0], bk[1] - 0.12, bk[2] + 0.1]} eggs={drops.filter((d) => d >= 1).length} s={0.75} />
      {drops.map((d, i) => d > 0 && d < 1 ? <Egg key={i} pos={[lerp(give[0], bk[0], d), lerp(give[1], bk[1], d) + 0.15 * Math.sin(Math.PI * d), lerp(give[2], bk[2] + 0.1, d)]} s={1.1} /> : null)}</>}>
    <Cel at={HIRE_N}><Ned {...act(t, [[0, 'holdFront']], [[0, 'neutral'], [K.pays + 0.5, 'happy']])} view="right" handL={[30, -150]} handR={[96, -150]} lookX={6} lookY={6} /></Cel>
    <Cel at={HIRE_B}><Blob {...act(t, [[0, 'stand']], [[0, 'happy']])} view="left" handL={[-90 + 8 * Math.sin((t - C.pays) * 10), -190]} /></Cel>
  </World>);
};

// ---------------------------------------------------------------- shot 26: poor, comfortable, rich (track across the plots)
const NED_POOR: V3 = [PLOT.ned - 0.2, 0, 0.7], SARA_OK: V3 = [PLOT.sara - 0.55, 0, 0.7], BLOB_RICH: V3 = [PLOT.blob - 0.1, 0, 1.1];
const Split: React.FC<{t: number}> = ({t}) => {
  const KEYS: Cam3Key[] = [[C.poor, {pos: [PLOT.ned + 0.1, 1.35, 6.0], look: [PLOT.ned + 0.05, 0.85, 0.3], fov: 34}], [K.comfortable - 0.75, {pos: [PLOT.ned + 0.1, 1.35, 5.7], look: [PLOT.ned + 0.05, 0.85, 0.3], fov: 34}],
    [K.comfortable + 0.25, {pos: [PLOT.sara - 0.15, 1.4, 6.2], look: [PLOT.sara - 0.2, 0.9, 0.0], fov: 34}], [K.rich - 0.32, {pos: [PLOT.sara - 0.15, 1.4, 5.9], look: [PLOT.sara - 0.2, 0.9, 0.0], fov: 34}],
    [K.rich + 0.08, {pos: [PLOT.blob + 0.2, 1.8, 7.4], look: [PLOT.blob + 0.1, 1.0, -0.2], fov: 36}, EASE.whip], [C.end, {pos: [PLOT.blob + 0.2, 1.7, 6.7], look: [PLOT.blob + 0.1, 1.0, -0.2], fov: 36}]];
  const cam = cam3At(t, KEYS);
  return (<ShotBlur t={t} cam={KEYS}><World cam={cam} light={{...DAY, span: 14}} sky={SKY.day} scene={<><Village t={t} s={{...GONE_STATE, coop: 1, coopBig: 1, hut: 1, fire: 0, firePot: false}} />
      <Basket pos={[SARA_OK[0] + 0.55, 0, 1.05]} eggs={6} />{EGGS_GROUND.slice(0, 8).map((p, i) => <Egg key={i} pos={[p[0], p[1], p[2] + 0.2]} s={1.1} />)}</>}>
    <Cel at={NED_POOR}><Ned {...idle({...SITF, ...EXPR.sad, handL: [-40, -100], handR: [40, -100], headTilt: 8}, t, 0.2)} /></Cel>
    <Cel at={SARA_OK}><Sara {...idle(act(t, [[0, 'relaxed']], [[0, 'happy']]), t, 0.4)} handR={[96, -180]} /></Cel>
    <Cel at={[SARA_OK[0] + 0.85, 0, 0.95]} h={0.46} unitsTall={200}><Bird {...SARA_HEN} dir={-1} peck={Math.max(0, Math.sin(t * 4))} /></Cel>
    <Cel at={BLOB_RICH}><Blob {...idle(act(t, [[0, 'crossArms']], [[0, 'smug']]), t)} /></Cel>
    <Flock t={t} n={32} skipNear={BLOB_RICH} />
  </World></ShotBlur>);
};

// ---------------------------------------------------------------- ending: back to frame 0 for the next lesson (CTA)
const Ending: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.end, {pos: [0.15, 2.0, 9.4], look: [0.05, 1.15, -0.4], fov: 36}], [END - 0.95, CAM0]]);
  const look = t > K.subscribe + 0.1 && t < END - 0.85;
  return (<World cam={cam} light={DAY} sky={SKY.day} scene={<Village t={t} s={{}} />}>
    <Cel at={POS.ned}><Ned {...idle(act(t, [[0, 'relaxed']], [[0, 'happy']]), t, 0.1)} lookY={look ? -10 : 0} faceDy={look ? -10 : 0} /></Cel>
    <Cel at={POS.blob}><Blob {...idle(act(t, [[0, 'wave']], [[0, 'happy']]), t)} handR={[128, -340 + 14 * loopS(t, IDLE_N * 2)]} lookY={look ? -10 : 0} faceDy={look ? -14 : 0} browUp={look ? 0.8 : 0.2} /></Cel>
    <Cel at={POS.sara}><Sara {...idle(act(t, [[0, 'stand']], [[0, 'grin']]), t, 0.4)} lookY={look ? -10 : 0} faceDy={look ? -10 : 0} /></Cel>
  </World>);
};

// ---------------------------------------------------------------- composition
const Scenes: React.FC<{t: number}> = ({t}) => {
  const tr = (at: number, kind: 'fly' | 'smear' | 'flash', a: React.ReactNode, b: React.ReactNode, color?: string) => <Transition t={t} at={at} kind={kind} a={a} b={b} color={color} />;
  return (<Cuts t={t} shots={[
    [0, <Intro t={t} />], [C.wide, <Vanish t={t} />], [C.gone, <AllGone t={t} />], [C.days, <Days t={t} />], [C.gets, <Gets t={t} />],
    [C.cook - 0.2, tr(C.cook, 'smear', <Gets t={t} />, <Cook t={t} />)], [C.cook + 0.2, <Cook t={t} />],
    [C.best, <Best t={t} />], [C.last, <Last t={t} />], [C.second, <Second t={t} />], [C.egg, <EggShot t={t} />], [C.rooster, <RoosterShot t={t} />],
    [C.noeggs, <NoEggs t={t} />], [C.knock, <Knock t={t} />], [C.meet, <Meet t={t} />], [C.share, <Share t={t} />], [C.wanted, <Wanted t={t} />],
    [C.chicks, <ChicksShot t={t} />], [C.weeks - 0.2, tr(C.weeks, 'fly', <ChicksShot t={t} />, <Inside t={t} />)], [C.weeks + 0.2, <Inside t={t} />],
    [C.hatch - 0.2, tr(C.hatch, 'flash', <Inside t={t} />, <Hatch t={t} />)], [C.hatch + 0.2, <Hatch t={t} />],
    [C.months, <Months t={t} />], [C.laying, <Laying t={t} />], [C.fills, <Fills t={t} />], [C.keep, <Keep t={t} />], [C.hires, <Hires t={t} />], [C.pays, <Pays t={t} />],
    [C.same - 0.2, tr(C.same, 'flash', <Pays t={t} />, <Gets t={t} memory />, '#FFF2C4')], [C.same + 0.2, <Gets t={t} memory />],
    [C.poor, <Split t={t} />],
    [C.end - 0.2, tr(C.end, 'flash', <Split t={t} />, <Ending t={t} />)], [C.end + 0.2, <Ending t={t} />],
  ]} />);
};
export const Short: React.FC<{voice?: boolean; captions?: boolean; guides?: boolean; bench?: string}> = ({voice = false, captions = true, guides = false, bench = 'full'}) => {
  BENCH.v = bench;
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps;
  return (<AbsoluteFill style={{background: '#000'}}>
    <Scenes t={t} />
    <Cta t={t} tIn={K.subscribe - 0.1} tClick={K.miss + 0.05} tBell={K.lesson} tOut={END - 0.8} y={330} />
    {captions && <Captions t={t} />}
    {guides && <SafeGuides />}
    <Audio src={staticFile(`${T.short}/sfx.wav`)} volume={0.42} />
    <Audio src={staticFile(`${T.short}/bed.wav`)} volume={0.2} />
    {voice && <Sequence from={Math.round(Math.max(0, T.voiceOffset) * fps)} layout="none"><Audio src={staticFile(`${T.short}/vo.wav`)} /></Sequence>}
  </AbsoluteFill>);
};

// ---------------------------------------------------------------- thumbnails (each its own staged World; same cast, same village)
const ThumbA: React.FC = () => {      // the mystery: Ned's worried face up close, Blob's huge flock behind him, circled
  const t = 10, nAt: V3 = [PLOT.blob - 0.78, 0, 3.75];
  const cam: Cam3 = {pos: [PLOT.blob - 0.5, 1.45, 6.6], look: [PLOT.blob - 0.15, 0.95, 0.6], fov: 40};
  const ring = toScreen(cam, [PLOT.blob + 0.45, 0.72, -0.1]);
  return (<World cam={cam} light={{...DAY, focus: [PLOT.blob, 0, 0], span: 9}} sky={SKY.day} scene={<Village t={t} s={{...GONE_STATE, coop: 1, coopBig: 1}} />}>
    <Cel at={nAt}><Ned {...EXPR.nervous} handL={[-30, -150]} handR={[30, -150]} lookX={12} faceDx={10} /></Cel>
    <Cel at={[PLOT.blob + 0.5, 0, -0.1]}><Blob {...act(t, [[0, 'crossArms']], [[0, 'smug']])} /></Cel>
    <Flock t={t} n={32} skipNear={[PLOT.blob + 0.5, 0, -0.1]} />
    {ring && <><Ring x={ring.x} y={ring.y} r={250} /><Arrow x1={ring.x - 60} y1={1640} x2={ring.x - 20} y2={ring.y + 265} /></>}
  </World>);
};
const ThumbB: React.FC = () => {      // the smug winner: Blob's big face, arms crossed, flock all around
  const t = 10, bAt: V3 = [PLOT.blob, 0, 1.1];
  const cam: Cam3 = {pos: [PLOT.blob + 0.15, 1.3, 4.3], look: [PLOT.blob, 1.05, 1.1], fov: 40};
  return (<World cam={cam} light={{...DAY, focus: [PLOT.blob, 0, 0], span: 8}} sky={SKY.day} scene={<Village t={t} s={{...GONE_STATE, coop: 1, coopBig: 1}} />}>
    <Cel at={bAt}><Blob {...act(t, [[0, 'crossArms']], [[0, 'smug']])} headTilt={-6} /></Cel>
    <Flock t={t} n={32} skipNear={bAt} />
  </World>);
};
const ThumbC: React.FC = () => {      // the stakes: Ned eats his only chicken - a night close-up by the fire
  const t = 10;
  const cam: Cam3 = {pos: [PLOT.ned - 0.05, 1.3, 4.3], look: [PLOT.ned - 0.02, 1.02, 0.6], fov: 40};
  const bowl = celPoint(cam, NED_AT, 1.7, [0, -170]);
  return (<World cam={cam} light={NIGHT_NED.light} sky={NIGHT_NED.sky} scene={<><Village t={t} s={{...GONE_STATE, night: 1, dayPhase: 0.5, fire: 1}} /><Steam pos={[PLOT.ned + 0.7, 0.75, 0.2]} t={t} /></>}
    front={<Cyl pos={[bowl[0], bowl[1] - 0.05, bowl[2] + 0.06]} r={0.1} rTop={0.15} h={0.12} color="#D9A066" map={tex('planks', [6, 1], 3)} rough={0.6} />}>
    <Cel at={NED_AT}><Ned eyes="closed" mouth="grin" browUp={0.7} handL={[-34, -154]} handR={[34, -154]} headTilt={-6} tint="#FFB08A" tintAmt={0.35} /></Cel>
  </World>);
};
export const Thumb: React.FC<{variant: 'A' | 'B' | 'C'}> = ({variant}) => {
  if (variant === 'A') return <ThumbFrame scene={<ThumbA />} l1="SAME CHICKEN" l2="WHY IS HE RICH?" />;
  if (variant === 'B') return <ThumbFrame scene={<ThumbB />} l1="ONE CHICKEN" l2="BECAME THIS" />;
  return <ThumbFrame scene={<ThumbC />} l1="HE ATE HIS" l2="ONLY CHICKEN" />;
};
void [Box, Ground, pick, rnd, DOOR_X];
