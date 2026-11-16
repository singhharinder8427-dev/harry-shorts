/* Named poses + expressions for the flat cast (Cast.tsx -> Person), and helpers to blend between them.
 * A pose sets the body (hands, feet, joints, lean, bounce, head tilt, view); an expression sets the face
 * (eyes, brows, mouth, look, face colour). Use them together:  <Person id="blob" outfit={BLOB} {...act(t, ...)} />
 * Units: feet at (0,0), head centre (0,-330), shoulders (±34,-204), hips (±18,-112). Negative x = screen left. */
import {PersonPose, jointsFor} from './Cast';
import {clamp, lerp, eio} from './math';

export type Pose = Partial<Omit<PersonPose, 'id' | 'outfit'>>;
type P2 = [number, number];

// ---------------------------------------------------------------- body poses
export const POSES: Record<string, Pose> = {
  stand:       {handL: [-78, -120], handR: [78, -120], footL: [-30, -5], footR: [30, -5]},
  relaxed:     {handL: [-60, -112], handR: [66, -116], footL: [-34, -5], footR: [28, -5], lean: 2, headTilt: 3},
  wave:        {handL: [-72, -118], handR: [128, -340], footL: [-30, -5], footR: [30, -5], headTilt: 5},
  point:       {handL: [-72, -120], handR: [178, -222], footL: [-34, -5], footR: [36, -5], lean: 4, view: 'right'},
  pointUp:     {handL: [-72, -120], handR: [70, -392], footL: [-30, -5], footR: [30, -5], headTilt: -4},
  explain:     {handL: [-118, -168], handR: [124, -176], footL: [-32, -5], footR: [32, -5], headTilt: 4},
  shrug:       {handL: [-128, -214], handR: [128, -214], elbowL: [-82, -168], elbowR: [82, -168], footL: [-30, -5], footR: [30, -5], headTilt: 9, bounce: 4},
  facepalm:    {handL: [-70, -118], handR: [14, -318], footL: [-30, -5], footR: [30, -5], headTilt: -12, lean: -3},
  handsOnHead: {handL: [-62, -432], handR: [62, -432], elbowL: [-120, -320], elbowR: [120, -320], footL: [-34, -5], footR: [34, -5]},
  think:       {handL: [16, -160], handR: [30, -236], elbowL: [-50, -150], elbowR: [72, -168], footL: [-30, -5], footR: [30, -5], headTilt: 7},
  crossArms:   {handL: [58, -176], handR: [-58, -168], elbowL: [-64, -136], elbowR: [64, -132], footL: [-34, -5], footR: [34, -5], headTilt: -3},
  holdFront:   {handL: [-26, -150], handR: [26, -150], footL: [-30, -5], footR: [30, -5]},
  reach:       {handL: [-80, -150], handR: [196, -262], footL: [-40, -5], footR: [40, -5], lean: 9, view: 'right'},
  cheer:       {handL: [-118, -410], handR: [118, -410], footL: [-38, -5], footR: [38, -5], bounce: 10, headTilt: -4},
  sad:         {handL: [-42, -98], handR: [42, -98], footL: [-24, -5], footR: [24, -5], bounce: -8, headTilt: 10, lean: 2},
  scared:      {handL: [-40, -262], handR: [40, -262], elbowL: [-92, -200], elbowR: [92, -200], footL: [-46, -5], footR: [46, -5], bounce: -22, lean: -4},
  crouch:      {handL: [-58, -66], handR: [58, -66], footL: [-52, -5], footR: [52, -5], bounce: -64},
  // side-view poses (view 'right'; mirror with mirrorPose for 'left')
  sit:         {view: 'right', bounce: -56, kneeL: [64, -62], kneeR: [80, -60], footL: [66, -5], footR: [82, -5], handL: [50, -70], handR: [70, -68]},
  sitThink:    {view: 'right', bounce: -56, kneeL: [64, -62], kneeR: [80, -60], footL: [66, -5], footR: [82, -5], handL: [58, -70], handR: [34, -190], elbowR: [70, -118], headTilt: 8},
  kneel:       {view: 'right', bounce: -52, kneeL: [-30, -10], footL: [-92, -12], kneeR: [62, -70], footR: [66, -5], handL: [-44, -104], handR: [58, -78]},
  kick:        {view: 'right', handL: [-118, -196], handR: [70, -236], footL: [-26, -5], footR: [142, -122], kneeR: [64, -96], lean: -10},
  jump:        {handL: [-120, -380], handR: [120, -380], footL: [-46, -54], footR: [46, -54], kneeL: [-58, -82], kneeR: [58, -82], bounce: 0},
  fall:        {handL: [-150, -320], handR: [154, -276], footL: [-40, -5], footR: [78, -64], lean: 22, headTilt: 14},
  run:         {view: 'right', handL: [-56, -150], handR: [78, -200], elbowL: [-60, -188], elbowR: [70, -150], footL: [-70, -36], footR: [52, -5], kneeL: [-34, -60], kneeR: [44, -54], lean: 10},
};
/** mirror a side-view pose (right <-> left) */
export const mirrorPose = (p: Pose): Pose => {
  const m = (v?: P2) => (v ? [-v[0], v[1]] as P2 : undefined), o: Pose = {...p};
  o.handL = m(p.handR); o.handR = m(p.handL); o.footL = m(p.footR); o.footR = m(p.footL);
  o.elbowL = m(p.elbowR); o.elbowR = m(p.elbowL); o.kneeL = m(p.kneeR); o.kneeR = m(p.kneeL);
  o.view = p.view === 'right' ? 'left' : p.view === 'left' ? 'right' : p.view;
  if (p.lean) o.lean = -p.lean; if (p.headTilt) o.headTilt = -p.headTilt;
  return o;
};

// ---------------------------------------------------------------- expressions (face only)
export const EXPR: Record<string, Pose> = {
  neutral:    {eyes: 'dot', mouth: 'flat', brow: 0, browUp: 0},
  happy:      {eyes: 'dot', mouth: 'smile', brow: 0, browUp: 0.2},
  joy:        {eyes: 'closed', mouth: 'grin', brow: 0, browUp: 0.5},
  shocked:    {eyes: 'wide', mouth: 'o', brow: 0, browUp: 1},
  scared:     {eyes: 'wide', mouth: 'wavy', brow: -1, browUp: 0.6, sweat: 1, tint: '#BFE6FF', tintAmt: 0.55},
  angry:      {eyes: 'dot', mouth: 'flat', brow: 1, browUp: -0.2},
  furious:    {eyes: 'squeeze', mouth: 'teeth', brow: 1, browUp: -0.3, tint: '#F2564E', tintAmt: 1, steam: 1},
  sad:        {eyes: 'dot', mouth: 'frown', brow: -1, browUp: 0.3, faceDy: 10, lookY: 6},
  sick:       {eyes: 'squeeze', mouth: 'wavy', brow: -0.6, browUp: 0.2, tint: '#7BD66A', tintAmt: 0.9},
  smug:       {eyes: 'closed', mouth: 'smirk', brow: 0.2, browUp: 0.3},
  confused:   {eyes: 'dot', mouth: 'wavy', brow: -0.5, browUp: 0.4, lookX: 6},
  thinking:   {eyes: 'dot', mouth: 'flat', brow: 0, browUp: 0.6, lookX: 10, lookY: -12, faceDy: -6},
  nervous:    {eyes: 'dot', mouth: 'wavy', brow: -0.7, browUp: 0.4, sweat: 1},
  sleepy:     {eyes: 'closed', mouth: 'flat', brow: 0, browUp: -0.2},
  determined: {eyes: 'dot', mouth: 'flat', brow: 0.8, browUp: -0.2},
  freezing:   {eyes: 'squeeze', mouth: 'teeth', brow: -0.6, browUp: 0.3, tint: '#A9DBFF', tintAmt: 1},
  awe:        {eyes: 'wide', mouth: 'o', brow: -0.2, browUp: 0.8, lookY: -14, faceDy: -10},
  grin:       {eyes: 'dot', mouth: 'grin', brow: 0, browUp: 0.4},
};

// ---------------------------------------------------------------- blending
const DISCRETE = new Set(['view', 'eyes', 'mouth', 'handsBack', 'tint', 'joints']);
const resolve = (p: Pose): Pose => ({...p, ...jointsFor(p)});          // fill every joint so joints always blend smoothly
/** blend two poses (names or objects), k 0..1; numbers and points interpolate, view / eyes / mouth switch at k = 0.5 */
export const blendPose = (a: Pose | string, b: Pose | string, k: number): Pose => {
  const A = resolve(typeof a === 'string' ? POSES[a] ?? EXPR[a] : a), B = resolve(typeof b === 'string' ? POSES[b] ?? EXPR[b] : b);
  k = clamp(k); const out: any = {};
  for (const key of new Set([...Object.keys(A), ...Object.keys(B)])) {
    const va: any = (A as any)[key], vb: any = (B as any)[key];
    if (DISCRETE.has(key)) { out[key] = k < 0.5 ? (va ?? vb) : (vb ?? va); continue; }
    if (Array.isArray(va) || Array.isArray(vb)) { const x = va ?? vb, y = vb ?? va; out[key] = [lerp(x[0], y[0], k), lerp(x[1], y[1], k)]; continue; }
    if (typeof va === 'number' || typeof vb === 'number') { out[key] = lerp(va ?? 0, vb ?? 0, k); continue; }
    out[key] = k < 0.5 ? (va ?? vb) : (vb ?? va);
  }
  if (out.tint && (A.tint !== B.tint)) out.tintAmt = A.tint && B.tint ? out.tintAmt : (A.tint ? (A.tintAmt ?? 0) * (1 - k) : (B.tintAmt ?? 0) * k);   // face colour fades, never pops
  if (!A.tint && B.tint) out.tint = B.tint; if (A.tint && !B.tint) out.tint = A.tint;
  return out;
};
/** step through keyed poses over time: posesAt(t, [[0, 'stand'], [1.2, 'shrug'], ...], 0.3) — each change blends over `dur` s */
export const posesAt = (t: number, keys: [number, Pose | string][], dur = 0.3): Pose => {
  let cur: Pose | string = keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [ti, p] = keys[i]; if (t < ti) break;
    const k = (t - ti) / dur; if (k < 1) return blendPose(cur, p, eio(k));
    cur = p;
  }
  return typeof cur === 'string' ? resolve(POSES[cur] ?? EXPR[cur]) : resolve(cur);
};
/** body + face together: act(t, bodyKeys, faceKeys) */
export const act = (t: number, body: [number, Pose | string][], face: [number, Pose | string][] = [[0, 'happy']], dur = 0.3): Pose =>
  ({...posesAt(t, body, dur), ...posesAt(t, face, dur * 0.8)});
/** small life on any held pose: breathing bounce and a slight head sway (whole cycles, so loops stay clean) */
export const breathe = (p: Pose, t: number, amt = 1): Pose => ({...p, bounce: (p.bounce ?? 0) + Math.sin(t * 2 * Math.PI * 0.5) * 2.5 * amt, headTilt: (p.headTilt ?? 0) + Math.sin(t * 2 * Math.PI * 0.25) * 1.5 * amt});
/** walk / run cycle seen from the side. phase advances 2*PI per stride pair (one left + one right step). */
export const walk = (phase: number, o: {stride?: number; lift?: number; run?: boolean; view?: 'right' | 'left'} = {}): Pose => {
  const run = !!o.run, S = o.stride ?? (run ? 58 : 50), L = o.lift ?? (run ? 46 : 30), view = o.view ?? 'right', d = view === 'right' ? 1 : -1;
  const foot = (ph: number): P2 => [d * S * Math.sin(ph), -5 - L * Math.max(0, Math.cos(ph))];
  const hand = (ph: number): P2 => run ? [d * (20 + 46 * Math.sin(ph)), -170 - 30 * Math.max(0, Math.sin(ph))] : [d * 52 * Math.sin(ph), -122 + 8 * Math.cos(2 * ph)];
  return {view, footL: foot(phase), footR: foot(phase + Math.PI), handL: hand(phase + Math.PI), handR: hand(phase),
    bounce: (run ? 10 : 5) * Math.abs(Math.cos(phase)) - (run ? 8 : 0), lean: d * (run ? 9 : 2)};
};
