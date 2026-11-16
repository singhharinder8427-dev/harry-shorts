/* "Why can't you tickle yourself?" - harry-animator v3.
 * Flat 2D cel cast (Blob, his friend Nia, Dr Ray) in stylized 3D sets: a living room, a brain space, a London lab. */
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import timing from './timing.json';
import {Captions, SafeGuides} from './Captions';
import {Person, PersonPose} from './Cast';
import {Cta} from './Cta';
import {BLOB, role} from './Roles';
import {EXPR, Pose, act, blendPose} from './Poses';
import {Ball, Cam3, Cam3Key, Cel, Cuts, V3, World, cam3At, celPoint, toScreen} from './World3D';
import {EASE, Mood, ShotBlur, Transition} from './Moves';
import {BigNumber, cardIn} from './Cards';
import {Sparkle} from './Bits';
import {ThumbFrame, Ring, Arrow} from './ThumbKit';
import {bump, clamp, kfs, lerp, pop, prog, smooth, spring} from './math';
import {AFTERNOON, BRAINLIGHT, BRAIN_POS, Brain, BrainSpace, Feather, GOLDEN, Gauge, HAND_POS, LABLIGHT, Lab, LivingRoom, Pulse, RobotArm, SKY, Spiky, cerebAt, cycles, loopS, nerveAt} from './Sets';

const T = timing as any; const K = T.keys as Record<string, number>;
export const DURATION = T.duration as number; const END = DURATION;

// ---------------------------------------------------------------- cast (fixed for the whole video)
const H = 1.6;
const NIA = {...role('friend', 'tickle').outfit, hold: undefined};
const RAY = {...role('scientist', 'tickle').outfit, hold: undefined};
type PP = Omit<PersonPose, 'id' | 'outfit'>;
const Blob: React.FC<PP> = (p) => <Person {...p} id="blob" outfit={BLOB} />;
const Nia: React.FC<PP> = (p) => <Person {...p} id="nia" outfit={NIA} />;
const Ray: React.FC<PP> = (p) => <Person {...p} id="ray" outfit={RAY} />;
const breath = (p: Pose, t: number, ph = 0, amt = 1): Pose => ({...p, bounce: (p.bounce ?? 0) + 2.5 * amt * loopS(t, cycles(0.45), ph), headTilt: (p.headTilt ?? 0) + 1.5 * amt * loopS(t, cycles(0.22), ph + 0.3)});
const blinkAt = (t: number, ...at: number[]) => Math.max(0, ...at.map((a) => bump(t, a, a + 0.16)));

// ---------------------------------------------------------------- living-room staging
const B_AT: V3 = [0, 0, -0.12];             // Blob sits on the sofa (feet dangle: lift)
const LIFT = 0.2;
const N_AT: V3 = [1.0, 0, 0.05];            // Nia beside the sofa, a little nearer the lens
const SIT: Pose = {bounce: -34, footL: [-46, -8], footR: [46, -8], kneeL: [-54, -60], kneeR: [54, -60]};
const ribsWiggle = (t: number, amp = 1): Pose => { const w = Math.sin(t * 48) * 9 * amp, v = Math.cos(t * 41) * 7 * amp;
  return {handL: [-34 + w, -168 + v], handR: [34 - v, -164 + w], elbowL: [-78, -156], elbowR: [78, -152]}; };
const SELF_FACE: Pose = {eyes: 'dot', mouth: 'flat', brow: 0, browUp: -0.1};
/** Blob laughing while tickled (loop-safe: whole cycles) */
const laugh = (t: number, amt = 1): Pose => {
  const sh = loopS(t, cycles(3.2)), sw = loopS(t, cycles(1.3), 0.25);
  return {...SIT, handL: [-52 + 6 * sh, -150], handR: [40 + 6 * sh, -138], elbowL: [-82, -170], elbowR: [76, -166], lean: -7 * amt + 4 * sw, headTilt: 9 * sw,
    bounce: -34 + 6 * Math.abs(sh) * amt, eyes: 'squeeze', mouth: 'open', brow: -0.5, browUp: 0.7, tint: '#FF6A55', tintAmt: 0.8 * amt, sweat: 0};
};
/** Nia tickling Blob's side (loop-safe) */
const tickling = (t: number): Pose => {
  const a = loopS(t, cycles(5)), b = loopS(t, cycles(5), 0.5);
  return {view: 'left', joints: false, handL: [-218 + 6 * a, -232 + 10 * b], handR: [-206 + 6 * b, -186 + 10 * a], lean: -5, headTilt: -6 + 3 * loopS(t, cycles(1.3)), bounce: 2 * a,
    eyes: 'closed', mouth: 'grin', brow: 0, browUp: 0.5, lookX: -6};
};
const HOOK0: Cam3 = {pos: [0.5, 1.36, 4.9], look: [0.47, 1.02, -0.3], fov: 34};
const HOOK1: Cam3 = {pos: [0.6, 1.62, 7.0], look: [0.42, 0.98, -0.5], fov: 36};
const ROOM_LIGHT = {...AFTERNOON, focus: [0, 0, -0.3] as V3, span: 4};
const GOLD_LIGHT = {...GOLDEN, focus: [0, 0, -0.3] as V3, span: 4};

/** the flash-forward / finale picture: Nia tickles Blob on the sofa at golden hour.
 *  sneak 0..1 = Nia walks in from the right (1 = in place), hit 0..1 = Blob laughing. up = Nia glances at the CTA. */
const TickleScene: React.FC<{t: number; cam: Cam3; sneak?: number; hit?: number; up?: number}> = ({t, cam, sneak = 1, hit = 1, up = 0}) => {
  const nx = lerp(1.75, N_AT[0], smooth(sneak));
  const step = Math.sin(sneak * Math.PI * 6) * (sneak < 1 ? 1 : 0);
  const sneakPose: Pose = {view: 'left', handL: [-70, -250], handR: [-30, -240], elbowL: [-60, -190], elbowR: [10, -200], lean: -4, bounce: -14 + 6 * Math.abs(step),
    footL: [-30 + 16 * step, -5 - Math.max(0, step) * 16], footR: [30 - 16 * step, -5 - Math.max(0, -step) * 16], eyes: 'dot', mouth: 'smirk', brow: 0.6, browUp: 0, lookX: -8};
  const niaP = hit > 0 ? blendPose(sneakPose, tickling(t), clamp(hit * 2)) : sneakPose;
  const blobCalm: Pose = {...breath({...SIT, handL: [-62, -126], handR: [62, -126]}, t), ...EXPR.happy};
  const blobP = hit >= 1 ? laugh(t) : hit > 0 ? blendPose(blobCalm, laugh(t, hit), smooth(clamp(hit * 1.6))) : blobCalm;
  return (<World cam={cam} light={GOLD_LIGHT} sky={SKY.golden} scene={<LivingRoom t={t} tone="golden" />}>
    <Cel at={B_AT} h={H} lift={LIFT}><Blob {...blobP} /></Cel>
    <Cel at={[nx, 0, N_AT[2]]} h={H}><Nia {...niaP} lookY={-12 * up} faceDy={-12 * up} browUp={(niaP.browUp ?? 0) + 0.6 * up} eyes={up > 0.5 ? 'dot' : niaP.eyes} /></Cel>
  </World>);
};

// ---------------------------------------------------------------- shot 1: flash-forward hook (frame 0 = the finale picture)
const Hook: React.FC<{t: number}> = ({t}) => <TickleScene t={t} cam={cam3At(t, [[0, HOOK0], [0.25, HOOK0], [K.yourself - 0.05, HOOK1]])} />;

// ---------------------------------------------------------------- shots 2-4: Blob alone, tickling himself (afternoon)
const SelfRoom: React.FC<{t: number; cam: Cam3; pose: Pose}> = ({t, cam, pose}) => (
  <World cam={cam} light={ROOM_LIGHT} sky={SKY.room} scene={<LivingRoom t={t} />}>
    <Cel at={B_AT} h={H} lift={LIFT}><Blob {...pose} /></Cel>
  </World>);
const C = {
  self: K.yourself, fingers: K.fingers - 0.25, spot: K.spot - 0.2, nothing: K.nothing - 0.3, brain: K.brain - 0.12, move: K.move - 0.35, cereb: K.cerebellum - 0.3,
  touch: K.touch - 0.45, lab: K.scientists - 0.15, moved: K.moved - 0.3, touched: K.touched - 0.3, hardly: K.hardly - 0.3, delay: K.delay - 0.35, back: K.tickle7 - 0.3,
  split: K.only - 0.25, finale: K.coming - 0.45,
};
const Self: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.self, {pos: [0.05, 1.3, 4.2], look: [0, 0.98, -0.2], fov: 34}], [C.fingers, {pos: [0.05, 1.28, 3.6], look: [0, 0.98, -0.2], fov: 34}]]);
  const start = smooth(prog(t, C.self, C.self + 0.35));
  return <SelfRoom t={t} cam={cam} pose={{...breath({...SIT, ...blendPose({handL: [-62, -126], handR: [62, -126]}, ribsWiggle(t), start)}, t), ...SELF_FACE, lookY: 4, faceDy: 4, blink: blinkAt(t, C.self + 0.7)}} />;
};
const Fingers: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.fingers, {pos: [0.8, 2.6, 2.9], look: [0.02, 0.95, -0.12], fov: 32}], [C.spot, {pos: [0.65, 2.5, 2.65], look: [0.02, 0.95, -0.12], fov: 32}]]);
  return <SelfRoom t={t} cam={cam} pose={{...SIT, ...ribsWiggle(t, 1.6), ...SELF_FACE, lookY: 10, faceDy: 10}} />;
};
const Spot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.spot, {pos: [-0.45, 1.35, 4.6], look: [0, 0.95, -0.25], fov: 34}], [C.nothing, {pos: [-0.3, 1.33, 4.2], look: [0, 0.97, -0.25], fov: 34}]]);
  const w = Math.sin(t * 46) * 10;                       // both hands in the armpits now, tickling hard, bouncing
  const hard: Pose = {...SIT, handL: [-50 + w, -214], handR: [50 - w, -210], elbowL: [-104, -176], elbowR: [104, -176], bounce: -34 + 7 * Math.abs(Math.sin(t * 23)), headTilt: 4 * Math.sin(t * 9)};
  const k = smooth(prog(t, C.spot, C.spot + 0.3));
  return <SelfRoom t={t} cam={cam} pose={{...blendPose({...SIT, ...ribsWiggle(t)}, hard, k), ...SELF_FACE, brow: 0.5, mouth: 'flat'}} />;
};
const NOTHING_KEYS: Cam3Key[] = [[C.nothing, {pos: [0, 1.3, 6.4], look: [0, 1.25, -0.12], fov: 30}], [C.nothing + 0.38, {pos: [0, 1.42, 3.9], look: [0, 1.16, -0.12], fov: 28}, EASE.slam],
  [C.brain - 0.45, {pos: [0, 1.42, 3.7], look: [0, 1.17, -0.12], fov: 28}], [C.brain + 0.02, {pos: [0, 1.48, 0.25], look: [0, 1.48, -0.12], fov: 28}, EASE.dive]];
const Nothing: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, NOTHING_KEYS);
  const sat = lerp(1, 0.35, smooth(prog(t, K.nothing - 0.05, K.nothing + 0.35)));
  return (<Mood sat={sat}><ShotBlur t={t} cam={NOTHING_KEYS}>
    <SelfRoom t={t} cam={cam} pose={{...SIT, handL: [-46, -150], handR: [46, -150], ...SELF_FACE, eyes: 'dot', blink: blinkAt(t, K.nothing + 0.55), browUp: -0.3, brow: 0.2, mouth: 'flat', headTilt: 6 * smooth(prog(t, K.nothing + 0.7, K.nothing + 1.1))}} />
  </ShotBlur></Mood>);
};

// ---------------------------------------------------------------- shots 5-9: inside - the brain space (cutaways, no text)
const TINY: V3 = [-0.7, 0, 0.6];
const TinyBlob: React.FC<{p: Pose}> = ({p}) => <Cel at={TINY} h={0.95} lift={0.42}><Blob {...p} /></Cel>;
const Bubble: React.FC<{pos: V3; s: number; t: number; wob?: number}> = ({pos, s, t, wob = 0}) => s <= 0.01 ? null : (<group position={pos} scale={s}>
  <Ball r={0.22} color="#DDF3FF" opacity={0.32} rough={0.08} metal={0.1} emissive="#9FD8FF" glow={0.25} cast={false} />
  <Feather pos={[0, 0.02, 0]} s={0.75} rot={[0, 0.4, 0.5 + 0.5 * wob * Math.sin(t * 9)]} />
</group>);
const BUB_HOME = (): V3 => [BRAIN_POS[0] - 0.85, BRAIN_POS[1] - 0.3, 0.3];
const arc = (a: V3, b: V3, u: number, h = 0.4): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u) + h * Math.sin(Math.PI * u), lerp(a[2], b[2], u)];
/** everything that happens in the brain space, as a function of time (one continuous little story across shots 5-9) */
const brainState = (t: number) => {
  const brainS = pop(t, K.brain - 0.05, 0.45);
  const glowIn = smooth(prog(t, K.brain + 0.1, K.brain + 0.5)) * (1 - smooth(prog(t, K.move - 0.4, K.move - 0.1)));
  const glowMove = bump(t, K.move - 0.05, K.move + 0.7) * 0.8;
  const dim = smooth(prog(t, K.down - 0.1, K.arrives + 0.2));
  const cereb = bump(t, K.copy + 0.25, K.predicts + 0.3) * 0.6 + smooth(prog(t, K.cerebellum - 0.1, K.cerebellum + 0.25)) * (1 - smooth(prog(t, K.sends + 0.6, K.touch)));
  // race on "one step ahead": red behind, yellow hops ahead on "ahead"
  const race = prog(t, K.step - 0.25, K.move - 0.45);
  const redU = 0.75 * smooth(race), yelU = Math.min(0.98, redU + 0.06 + 0.22 * smooth(prog(t, K.ahead - 0.05, K.ahead + 0.25)));
  const raceOn = t > K.step - 0.25 && t < K.move - 0.4;
  // command pulse down the cable (move), its copy curls back into the cerebellum (copy)
  const cmdU = prog(t, K.copy - 0.2, K.command + 0.15);
  const copyU = prog(t, K.copy + 0.02, K.command - 0.05);
  const wiggle = bump(t, K.command + 0.1, K.command + 1.0) + 0.6 * bump(t, K.feel - 0.1, K.feel + 0.8);
  // prediction bubble: forms (predicts), sent down the cable (sends) to the middle, meets the touch (down)
  const bubS = pop(t, K.predicts - 0.05, 0.45) * (1 - smooth(prog(t, K.down - 0.05, K.down + 0.12)));
  const sendU = smooth(prog(t, K.sends - 0.05, K.touch - 0.1));
  const home = BUB_HOME(), mid = nerveAt(0.55);
  const bubPos: V3 = sendU <= 0 ? home : sendU < 0.35 ? arc(home, nerveAt(0.05), sendU / 0.35, 0.25) : nerveAt(lerp(0.05, 0.55, (sendU - 0.35) / 0.65));
  // touch: a spiky red ball comes up from the hand, shrinks to a grey pebble on contact, the pebble reaches the brain
  const touchU = lerp(1, 0.58, smooth(prog(t, K.touch - 0.05, K.down - 0.05)));
  const pebU = lerp(0.58, 0, smooth(prog(t, K.down + 0.1, K.arrives + 0.05)));
  const shrink = smooth(prog(t, K.down - 0.08, K.down + 0.2));
  const spikyOn = t > K.touch - 0.1 && t < K.arrives + 0.3;
  return {brainS, glow: Math.max(glowIn, glowMove), dim, cereb, redU, yelU, raceOn, cmdU, copyU, wiggle, bubS, bubPos, mid, touchU, pebU, shrink, spikyOn,
    copyPos: arc(nerveAt(0), cerebAt(BRAIN_POS), copyU, 0.25)};
};
const BrainShot: React.FC<{t: number; keys: Cam3Key[]}> = ({t, keys}) => {
  const cam = cam3At(t, keys), s = brainState(t);
  const moveArm = bump(t, K.move - 0.15, K.copy + 0.4);
  const shrug = smooth(prog(t, K.arrives - 0.1, K.arrives + 0.2));
  const awe = t < K.move - 0.2;
  const tinyPose: Pose = shrug > 0 ? blendPose(act(t, [[0, 'stand']], [[0, 'confused']]), {...act(t, [[0, 'shrug']], [[0, 'confused']])}, shrug)
    : moveArm > 0.02 ? {...act(t, [[0, 'stand']], [[0, 'happy']]), handR: [lerp(78, 120, moveArm), lerp(-120, -340, moveArm)]}
    : awe ? {...breath(act(t, [[0, 'stand']], [[0, 'awe']]), t)} : {...breath(act(t, [[0, 'stand']], [[0, 'thinking']]), t), lookX: 12};
  const sp = s.spikyOn ? (s.shrink < 1 ? nerveAt(s.touchU) : nerveAt(s.pebU)) : null;
  const pk = toScreen(cam, s.mid);
  const popU = prog(t, K.down - 0.02, K.down + 0.45);
  return (<ShotBlur t={t} cam={keys}><World cam={cam} light={BRAINLIGHT} sky={SKY.brain} scene={<>
      <BrainSpace t={t} glow={s.glow} dim={s.dim} cereb={s.cereb} brainS={s.brainS} wiggle={s.wiggle} />
      {s.raceOn && <><Pulse pos={nerveAt(s.redU)} color="#FF5A4E" r={0.075} /><Pulse pos={nerveAt(s.yelU)} color="#FFD23F" r={0.085} /></>}
      {s.cmdU > 0 && s.cmdU < 1 && <Pulse pos={nerveAt(s.cmdU)} color="#FF9A3C" r={0.085} />}
      {s.copyU > 0 && s.copyU < 1 && <Pulse pos={s.copyPos} color="#FF9A3C" r={0.07} />}
      <Bubble pos={s.bubPos} s={s.bubS} t={t} wob={t > K.feel - 0.2 ? 1 : 0} />
      {sp && <Spiky pos={sp} s={lerp(1.1, 0.0001, s.shrink) + 0.0001} t={t} />}
      {sp && s.shrink > 0.3 && <Ball pos={sp} r={0.05 * s.shrink} color="#8C8F96" rough={0.9} cast={false} />}
    </>}>
    <TinyBlob p={tinyPose} />
    {pk && popU > 0 && popU < 1 && [0, 1, 2, 3, 4, 5].map((i) => { const a = i * Math.PI / 3 + 0.3, r = (40 + 120 * popU) * pk.s / 260;
      return <Sparkle key={i} x={pk.x + Math.cos(a) * r} y={pk.y + Math.sin(a) * r} r={26 * Math.sin(Math.PI * popU)} fill="#DDF3FF" />; })}
  </World></ShotBlur>);
};
const B_CLOSE: Cam3 = {pos: [0.2, 2.95, 3.0], look: [0, 2.72, 0], fov: 36};
const B_WIDE: Cam3 = {pos: [-0.1, 1.65, 6.4], look: [-0.15, 1.55, 0], fov: 36};
const BRAIN1: Cam3Key[] = [[C.brain, {pos: [0.0, 2.85, 2.2], look: [0, 2.75, 0], fov: 36}], [K.brain + 0.5, B_CLOSE], [K.step - 0.2, {pos: [0.9, 2.9, 2.85], look: [0, 2.7, 0], fov: 36}], [K.ahead + 0.5, B_WIDE], [C.move, {pos: [-0.15, 1.62, 6.2], look: [-0.15, 1.55, 0], fov: 36}]];
const BRAIN2: Cam3Key[] = [[C.move, {pos: [-0.3, 1.7, 6.0], look: [-0.2, 1.6, 0], fov: 36}], [K.copy, {pos: [-0.25, 1.85, 5.6], look: [-0.15, 1.75, 0], fov: 36}], [K.predicts + 0.3, {pos: [-0.4, 1.85, 5.5], look: [-0.25, 1.8, 0], fov: 36}], [C.cereb, {pos: [-0.45, 1.85, 5.3], look: [-0.25, 1.8, 0], fov: 36}]];
const CB = cerebAt(BRAIN_POS);
const BRAIN3: Cam3Key[] = [[C.cereb, {pos: [2.5, 2.6, 0.6], look: [CB[0] + 0.1, CB[1], CB[2]], fov: 34}], [K.cerebellum + 0.4, {pos: [2.3, 2.55, 0.8], look: [CB[0] + 0.05, CB[1] + 0.1, CB[2]], fov: 34}, EASE.punch],
  [K.sends + 0.2, {pos: [-1.0, 2.5, 2.6], look: [-0.3, 2.1, 0.1], fov: 36}], [C.touch, {pos: [0.45, 1.4, 3.8], look: [0.15, 1.1, 0.35], fov: 36}]];
const BRAIN4: Cam3Key[] = [[C.touch, {pos: [0.4, 1.2, 3.6], look: [0.12, 0.95, 0.35], fov: 36}], [K.down + 0.2, {pos: [0.35, 1.45, 4.0], look: [0.1, 1.2, 0.3], fov: 36}], [K.arrives + 0.1, B_WIDE], [C.lab, {pos: [-0.1, 1.7, 6.6], look: [-0.15, 1.55, 0], fov: 36}]];

// ---------------------------------------------------------------- shots 10-16: the London lab (dusk)
const LB: V3 = [-0.3, 0, 0.55];            // Blob stands between the two robot pedestals
const LR: V3 = [1.58, 0, 0.42];             // Dr Ray beside the control box
const LAB_L = {...LABLIGHT, focus: [0, 0, 0] as V3, span: 3.5};
const A1_BASE: V3 = [-0.85, 0.78, 0.15], A2_BASE: V3 = [0.3, 0.78, 0.15];
const REST1: V3 = [-0.72, 1.05, 0.42], REST2: V3 = [0.15, 1.05, 0.42];
type LabState = {blobP: Pose; rayP: Pose; dial: number; lights: number; gauge: number; lag: number; push: number; laughK: number};
const labState = (t: number): LabState => {
  const lights = smooth(prog(t, K.robots - 0.1, K.robots + 0.2));
  const pushOn = smooth(prog(t, K.moved - 0.3, K.moved + 0.1));
  const push = pushOn * Math.sin((t - K.moved) * 6.2);                                   // Blob moves robot one's handle back and forth
  const lag = 0.2 * smooth(prog(t, K.fifth - 0.2, K.fifth + 0.3));                      // the delay, in seconds (a fifth of a second)
  const laughK = smooth(prog(t, K.back - 0.12, K.back + 0.25));
  const gauge = laughK > 0 ? lerp(0.12, 1, laughK) + 0.04 * spring(t, K.back + 0.25, 2.5, 4) : 0.12 * smooth(prog(t, K.hardly - 0.1, K.hardly + 0.4)) + 0.25 * smooth(prog(t, K.tickle7 - 0.1, K.tickle7 + 0.4));
  const palmUp = smooth(prog(t, K.touched - 0.4, K.touched - 0.05));
  const handL: [number, number] = [-118 + 14 * push * (t > K.moved - 0.3 ? 1 : 0), -200 + 10 * push];
  const handR: [number, number] = [lerp(78, 122, palmUp), lerp(-120, -212, palmUp)];
  const face = laughK > 0 ? {eyes: 'squeeze' as const, mouth: 'open' as const, brow: -0.5, browUp: 0.7, tint: '#FF6A55', tintAmt: 0.85 * laughK}
    : t > K.hardly - 0.2 ? {...SELF_FACE, browUp: -0.2, brow: 0.3, lookX: 6} : t > K.robots - 0.1 ? {...EXPR.awe, lookX: 10, lookY: 0, faceDy: 0} : {...EXPR.happy};
  const shake = laughK * loopS(t, cycles(3.2));
  const blobP: Pose = {...breath({handL: laughK > 0.5 ? [-60, -150] : handL, handR: laughK > 0.5 ? [60, -148] : handR, footL: [-30, -5], footR: [30, -5], lean: -5 * laughK + 3 * shake, bounce: 8 * Math.abs(shake), headTilt: 7 * shake}, t, 0.3), ...face};
  const turn = bump(t, K.delay - 0.2, K.fifth + 0.35);
  const rayP: Pose = t < K.robots - 0.2 ? {...act(t, [[0, 'stand'], [K.scientists - 0.1, 'wave']], [[0, 'happy'], [K.scientists - 0.1, 'grin']]), view: 'front'}
    : turn > 0 ? {...act(t, [[0, 'stand']], [[0, 'determined']]), view: 'left', handL: [-102, -262 + 6 * Math.sin((t - K.delay) * 12)], handR: [50, -130], lookX: -10, lookY: 10, faceDy: 6}
    : laughK > 0 ? {...act(t, [[0, 'stand']], [[0, 'joy']]), handL: [-60, -150], handR: [60, -150]} : {...breath(act(t, [[0, 'stand']], [[0, 'thinking']]), t, 0.6), view: 'left', lookX: -12};
  return {blobP, rayP, dial: smooth(prog(t, K.delay - 0.1, K.fifth + 0.2)), lights, gauge, lag, push, laughK};
};
const LabShot: React.FC<{t: number; keys: Cam3Key[]; card?: boolean}> = ({t, keys, card = false}) => {
  const cam = cam3At(t, keys), s = labState(t);
  const ready = smooth(prog(t, K.robots - 0.1, K.robots + 0.5));
  const hl = s.blobP.handL ?? [-118, -200], hr = s.blobP.handR ?? [78, -120];
  const handLw = celPoint(cam, LB, H, [hl[0], hl[1]]);
  // robot two copies robot one's motion - instantly, then a fifth of a second late
  const lagPush = s.push === 0 ? 0 : Math.sin((t - s.lag - K.moved) * 6.2) * smooth(prog(t - s.lag, K.moved - 0.3, K.moved + 0.1));
  const palm = celPoint(cam, LB, H, [hr[0] + 6, hr[1] - 16]);
  const stroke = smooth(prog(t, K.touched - 0.35, K.touched)) * (1 - s.laughK * 0.5);
  const t2: V3 = [lerp(REST2[0], palm[0] + 0.03 * lagPush, stroke), lerp(REST2[1], palm[1] + 0.02, stroke) + 0.01 * Math.abs(lagPush), lerp(REST2[2], palm[2] + 0.04 * lagPush, stroke)];
  const holdK = smooth(prog(t, K.moved - 0.45, K.moved - 0.1));
  const t1: V3 = [lerp(REST1[0], handLw[0], holdK), lerp(REST1[1] - 0.25 * (1 - ready), handLw[1], holdK), lerp(REST1[2], handLw[2], holdK)];
  const sync = t > K.same - 0.15 && t < K.hardly + 0.2 ? (Math.sin((t - K.same) * 16) > 0 ? 1 : 0.15) : s.lights;
  const c = card ? cardIn(t, K.fifth - 0.08, K.tickle7 - 0.25) : {s: 0, rot: 0};
  return (<ShotBlur t={t} cam={keys}><World cam={cam} light={LAB_L} sky={SKY.lab} scene={<>
      <Lab t={t} dial={s.dial} lightsOn={s.lights} gauge={s.gauge} />
      <RobotArm base={A1_BASE} target={[t1[0], lerp(t1[1] - 0.25, t1[1], ready), t1[2]]} lights={sync} tip="#F2994A" />
      <RobotArm base={A2_BASE} target={[t2[0], lerp(t2[1] - 0.25, t2[1], ready), t2[2]]} lights={sync} />
    </>}>
    <Cel at={LB} h={H}><Blob {...s.blobP} /></Cel>
    <Cel at={LR} h={H}><Ray {...s.rayP} /></Cel>
    {c.s > 0 && <BigNumber x={360} y={520} s={c.s} rot={c.rot} text="1/5" sub="of a second" size={190} />}
  </World></ShotBlur>);
};
const LAB1: Cam3Key[] = [[C.lab, {pos: [-1.45, 1.75, 3.0], look: [-1.45, 1.42, -1.5], fov: 34}], [K.london + 0.3, {pos: [-0.6, 1.85, 5.0], look: [-0.7, 1.2, -0.6], fov: 38}], [K.robots + 0.1, {pos: [1.1, 2.4, 8.2], look: [0.35, 1.0, 0.1], fov: 38}], [C.moved, {pos: [1.05, 2.35, 7.9], look: [0.35, 1.0, 0.1], fov: 38}]];
const LAB2: Cam3Key[] = [[C.moved, {pos: [-0.75, 1.42, 4.1], look: [-0.6, 0.98, 0.3], fov: 34}], [C.touched, {pos: [-0.7, 1.4, 3.8], look: [-0.58, 0.98, 0.3], fov: 34}]];
const LAB3: Cam3Key[] = [[C.touched, {pos: [0.0, 1.38, 3.7], look: [-0.05, 0.98, 0.35], fov: 32}], [K.same - 0.2, {pos: [-0.02, 1.4, 3.6], look: [-0.06, 0.98, 0.35], fov: 32}], [C.hardly, {pos: [-0.3, 1.75, 5.0], look: [-0.3, 0.98, 0.3], fov: 36}]];
const LAB4: Cam3Key[] = [[C.hardly, {pos: [-0.28, 1.36, 4.0], look: [-0.26, 1.1, 0.55], fov: 30}], [C.delay, {pos: [-0.28, 1.35, 3.8], look: [-0.26, 1.1, 0.55], fov: 30}]];
const LAB5: Cam3Key[] = [[C.delay, {pos: [1.6, 1.6, 4.0], look: [1.35, 1.1, 0.2], fov: 34}], [K.fifth + 0.3, {pos: [1.5, 1.65, 4.3], look: [1.3, 1.05, 0.2], fov: 36}], [C.back, {pos: [1.45, 1.65, 4.4], look: [1.25, 1.05, 0.2], fov: 36}]];
const GAUGE_CAM: Cam3 = {pos: [0.7, 1.52, 1.55], look: [0.93, 1.38, 0.06], fov: 30};
const LAB6: Cam3Key[] = [[C.back, GAUGE_CAM], [K.back - 0.12, {...GAUGE_CAM, pos: [0.72, 1.5, 1.4]}], [K.back + 0.25, {pos: [-0.3, 1.32, 3.6], look: [-0.28, 1.1, 0.55], fov: 30}, EASE.whip], [C.split, {pos: [-0.3, 1.3, 3.4], look: [-0.28, 1.1, 0.55], fov: 30}]];

// ---------------------------------------------------------------- shot 17: the "why" split stage (no text)
const SPLIT_X = 2.9;
const camHalf = (x: number): Cam3 => ({pos: [x + 0.25, 1.55, 5.4], look: [x + 0.22, 1.25, -0.3], fov: 36});
const SPLIT: Cam3Key[] = [[C.split, camHalf(-SPLIT_X)], [K.feel8 - 0.22, {...camHalf(-SPLIT_X), pos: [-SPLIT_X + 0.2, 1.55, 5.1]}], [K.feel8 + 0.2, camHalf(SPLIT_X), EASE.whip], [C.finale, {...camHalf(SPLIT_X), pos: [SPLIT_X + 0.25, 1.5, 5.0]}]];
const Split: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, SPLIT);
  const head = (x: number): V3 => [x, 2.2, -0.12];
  const glowR = smooth(prog(t, K.feel8, K.feel8 + 0.3));
  return (<ShotBlur t={t} cam={SPLIT}><World cam={cam} light={{...AFTERNOON, focus: [0, 0, -0.3], span: 6}} sky={SKY.room} scene={<>
      <LivingRoom t={t} tone="grey" ox={-SPLIT_X} w={5.6} noWindow />
      <LivingRoom t={t} tone="day" ox={SPLIT_X} w={5.6} />
      <group position={[0, 0, 0]}><mesh position={[0, 1.6, 0.6]} castShadow receiveShadow><boxGeometry args={[0.16, 3.2, 4.4]} /><meshStandardMaterial color="#FFFFFF" roughness={0.8} /></mesh></group>
      <Brain pos={head(-SPLIT_X)} s={0.32} dim={0.85} />
      <Brain pos={head(SPLIT_X)} s={0.32 * (1 + 0.12 * bump(t, K.feel8, K.feel8 + 0.4))} glow={glowR} />
    </>}>
    <Cel at={[-SPLIT_X, 0, B_AT[2]]} h={H} lift={LIFT}><Blob {...SIT} {...ribsWiggle(t)} {...SELF_FACE} lookY={4} faceDy={4} /></Cel>
    <Cel at={[SPLIT_X, 0, B_AT[2]]} h={H} lift={LIFT}><Blob {...laugh(t)} /></Cel>
    <Cel at={[SPLIT_X + N_AT[0], 0, N_AT[2]]} h={H}><Nia {...tickling(t)} /></Cel>
  </World></ShotBlur>);
};

// ---------------------------------------------------------------- shot 18: the finale - Nia sneaks in, the hook returns, CTA, loop
const FIN: Cam3Key[] = [[C.finale, {pos: [0.7, 1.5, 5.6], look: [0.5, 1.0, -0.3], fov: 36}], [K.coming + 0.1, {pos: [0.4, 1.42, 4.4], look: [0.3, 1.0, -0.3], fov: 35}], [K.subscribe + 0.4, HOOK0]];
const Finale: React.FC<{t: number}> = ({t}) => {
  const sneak = prog(t, C.finale, K.coming + 0.05), hit = prog(t, K.coming + 0.05, K.coming + 0.4);
  const up = smooth(prog(t, K.subscribe - 0.05, K.subscribe + 0.3)) * (1 - smooth(prog(t, END - 0.95, END - 0.6)));
  return <TickleScene t={t} cam={cam3At(t, FIN)} sneak={sneak} hit={hit} up={up} />;
};

// ---------------------------------------------------------------- edit
const Scenes: React.FC<{t: number}> = ({t}) => {
  const tr = (at: number, kind: 'fly' | 'smear' | 'flash', a: React.ReactNode, b: React.ReactNode, color?: string) => <Transition t={t} at={at} kind={kind} a={a} b={b} color={color} />;
  return (<Cuts t={t} shots={[
    [0, <Hook t={t} />], [C.self - 0.2, tr(C.self, 'flash', <Hook t={t} />, <Self t={t} />)], [C.self + 0.2, <Self t={t} />],
    [C.fingers, <Fingers t={t} />], [C.spot, <Spot t={t} />], [C.nothing, <Nothing t={t} />],
    [C.brain - 0.2, tr(C.brain, 'fly', <Nothing t={t} />, <BrainShot t={t} keys={BRAIN1} />)], [C.brain + 0.2, <BrainShot t={t} keys={BRAIN1} />],
    [C.move, <BrainShot t={t} keys={BRAIN2} />], [C.cereb, <BrainShot t={t} keys={BRAIN3} />], [C.touch, <BrainShot t={t} keys={BRAIN4} />],
    [C.lab - 0.2, tr(C.lab, 'smear', <BrainShot t={t} keys={BRAIN4} />, <LabShot t={t} keys={LAB1} />)], [C.lab + 0.2, <LabShot t={t} keys={LAB1} />],
    [C.moved, <LabShot t={t} keys={LAB2} />], [C.touched, <LabShot t={t} keys={LAB3} />], [C.hardly, <LabShot t={t} keys={LAB4} />], [C.delay, <LabShot t={t} keys={LAB5} card />],
    [C.back, <LabShot t={t} keys={LAB6} />], [C.split, <Split t={t} />],
    [C.finale - 0.2, tr(C.finale, 'flash', <Split t={t} />, <Finale t={t} />, '#FFE2B0')], [C.finale + 0.2, <Finale t={t} />],
  ]} />);
};
export const Short: React.FC<{voice?: boolean; captions?: boolean; guides?: boolean}> = ({voice = false, captions = true, guides = false}) => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps;
  return (<AbsoluteFill style={{background: '#000'}}>
    <Scenes t={t} />
    <Cta t={t} tIn={K.subscribe - 0.1} tClick={K.facts + 0.05} tBell={K.body} tOut={END - 0.8} y={330} />
    {captions && <Captions t={t} />}
    {guides && <SafeGuides />}
    <Audio src={staticFile(`${T.short}/sfx.wav`)} volume={0.42} />
    <Audio src={staticFile(`${T.short}/bed.wav`)} volume={0.2} />
    {voice && <Sequence from={Math.round(Math.max(0, T.voiceOffset) * fps)} layout="none"><Audio src={staticFile(`${T.short}/vo.wav`)} /></Sequence>}
  </AbsoluteFill>);
};

// ---------------------------------------------------------------- thumbnails (each its own staged World)
const ThumbA: React.FC = () => {      // the mystery: Blob tickles himself, totally unbothered - circled hands
  const t = 3;
  const cam: Cam3 = {pos: [0.1, 1.2, 3.0], look: [0, 1.02, -0.12], fov: 40};
  const ring = toScreen(cam, [0, 0.62 + LIFT, -0.12]);
  return (<World cam={cam} light={ROOM_LIGHT} sky={SKY.room} scene={<LivingRoom t={t} />}>
    <Cel at={B_AT} h={H} lift={LIFT}><Blob {...SIT} {...ribsWiggle(0.3, 1.4)} {...EXPR.confused} brow={-0.7} browUp={0.6} lookX={0} /></Cel>
    {ring && <><Ring x={ring.x} y={ring.y} r={170} /><Arrow x1={ring.x + 340} y1={ring.y + 470} x2={ring.x + 150} y2={ring.y + 200} /></>}
  </World>);
};
const ThumbB: React.FC = () => {      // the payoff: Blob's huge red laughing face, Nia's fingers at his side
  const t = 3;
  const cam: Cam3 = {pos: [0.36, 1.32, 3.55], look: [0.34, 1.1, -0.12], fov: 40};
  return (<World cam={cam} light={GOLD_LIGHT} sky={SKY.golden} scene={<LivingRoom t={t} tone="golden" />}>
    <Cel at={B_AT} h={H} lift={LIFT}><Blob {...laugh(t)} /></Cel>
    <Cel at={N_AT} h={H}><Nia {...tickling(t)} /></Cel>
  </World>);
};
const ThumbC: React.FC = () => {      // the stakes: the tickle robot huge in the foreground, a nervous Blob holding out his palm
  const t = 26;
  const cam: Cam3 = {pos: [0.95, 1.25, 2.75], look: [0.0, 1.02, 0.45], fov: 40};
  const palm = celPoint(cam, LB, H, [128, -226]);
  return (<World cam={cam} light={LAB_L} sky={SKY.lab} scene={<>
      <Lab t={t} lightsOn={1} gauge={0.9} />
      <RobotArm base={A2_BASE} target={[palm[0] + 0.05, palm[1] + 0.06, palm[2]]} lights={1} />
    </>}>
    <Cel at={LB} h={H}><Blob {...EXPR.nervous} handL={[-70, -150]} handR={[122, -212]} lookX={14} faceDx={10} browUp={0.8} mouth="teeth" /></Cel>
  </World>);
};
export const Thumb: React.FC<{variant: 'A' | 'B' | 'C'}> = ({variant}) => {
  if (variant === 'A') return <ThumbFrame scene={<ThumbA />} l1="WHY DOESN'T" l2="THIS WORK?" />;
  if (variant === 'B') return <ThumbFrame scene={<ThumbB />} l1="ONLY OTHERS" l2="CAN DO THIS" />;
  return <ThumbFrame scene={<ThumbC />} l1="THE TICKLE" l2="ROBOT TEST" />;
};
