/* "$20 an hour to $1 million" - harry-animator v3, delivered 1080x1920 at 30 fps (owner's test format).
 * US audience. Flat 2D cel cast (Blob, the tax man, a yoga student + a crowd of viewers) in two stylized 3D places:
 * the MONEY STAGE (treadmill under a giant clock, a glass money jar, a gold bar chart drawn to scale) and the YOGA STUDIO.
 * Story beats: see story.json "beats". Every visual change is keyed on a word time from timing.json. */
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import timing from './timing.json';
import {Captions, SafeGuides} from './Captions';
import {Person, PersonPose, Outfit} from './Cast';
import {Cta, Tag} from './Cta';
import {BLOB, costume, role} from './Roles';
import {act, EXPR, Pose, walk, POSES, mirrorPose} from './Poses';
import {Cam3, Cam3Key, Cel, Cuts, Light, V3, World, cam3At, celPoint, toScreen} from './World3D';
import {EASE, Mood, ShotBlur, Transition} from './Moves';
import {BigNumber, HookText} from './Cards';
import {EquationCard, PriceTag, SourceTag, YearsCard, cardPop} from './Charts';
import {BARS, Bill, Bulb, Coin, CoinHeap, CoinRain, GroceryBag, JAR, Jar, LIGHT_DAY, LIGHT_GOLD, LIGHT_GREY, LIGHT_YOGA, PAL, Pie, SKY_GOLD, SKY_STAGE, SKY_YOGA,
  StageSet, TREAD, TimeRateBars, Treadmill, VIEWERS, WallClock, YOGA, YogaSet, BarChart, mixLight, mixSky} from './Money';
import {Pill, Sparkle} from './Bits';
import {Box} from './World3D';
import {bump, clamp, eout, kfs, lerp, pick, pop, popOut, prog, smooth, spring} from './math';
import {ThumbFrame, Ring, Arrow} from './ThumbKit';
import {lvl} from './detail';

const T = timing as any; const K = T.keys as Record<string, number>;
export const DURATION = T.duration as number; const END = DURATION;

// ---------------------------------------------------------------- cast (fixed for the whole video)
const TAXMAN: Outfit = {...role('boss', 'hourly').outfit, coat: '#24324F', tie: PAL.red, hold: 'clipboard', sunglasses: false, hat: 'none', hair: '#8E8E8E', hairStyle: 'short'};
const STUDENT: Outfit = {...role('friend', 'hourly-yoga').outfit, hold: undefined, hat: 'none', sunglasses: false, glasses: false, hairStyle: 'ponytail', hair: '#6B4423', shirt: '#E85D9E'};
const YOGI_BLOB: Outfit = costume('athlete');
const VIEW_SHIRTS = ['#E5484D', '#3F7FD9', '#8E5BD6', '#F2994A', '#E85D9E', '#4CAF50', '#F2C94C', '#56CCF2'];
const VIEW_HAIR = ['#151515', '#3B2416', '#6B4423', '#A0522D', '#D9A441'];
type PP = Omit<PersonPose, 'id' | 'outfit'>;
const Blob: React.FC<PP & {yogi?: boolean}> = ({yogi, ...p}) => <Person {...p} id="blob" outfit={yogi ? YOGI_BLOB : BLOB} />;
const Taxman: React.FC<PP> = (p) => <Person {...p} id="tax" outfit={TAXMAN} />;
const Student: React.FC<PP> = (p) => <Person {...p} id="stu" outfit={STUDENT} />;
/** loop-safe idle life: whole cycles over the video */
const loopS = (t: number, n: number, ph = 0) => Math.sin(2 * Math.PI * (n * t / DURATION + ph));
const idle = (p: Pose, t: number, ph = 0, amt = 1): Pose => ({...p, bounce: (p.bounce ?? 0) + 2.5 * amt * loopS(t, 20, ph), headTilt: (p.headTilt ?? 0) + 1.5 * amt * loopS(t, 10, ph + 0.3)});
const blink = (t: number, ...at: number[]) => Math.max(0, ...at.map((a) => bump(t, a, a + 0.16)));
/** running on the treadmill: cycles per second chosen so the cycle closes over the video (loop) */
const RUN_N = Math.round(DURATION * 2.4);
const runPhase = (t: number) => 2 * Math.PI * RUN_N * t / DURATION;
const BELT_V = 3.0;

// ---------------------------------------------------------------- cuts (just before their word)
const C = {
  jar: K.million - 0.25, bar1: K.twentyfour - 0.3, full: K.full - 0.3, cent: K.cent - 0.35, taxes: K.taxes - 0.3, pie: K.rent - 0.3,
  bar3: K.hundred - 0.25, prices: K.prices - 0.3, rigged: K.rigged - 0.35, isnt: K.isnt - 0.05, wrong: K.wrong - 0.3, salary: K.salary - 0.3,
  other: K.other - 0.3, noceil: K.noceiling - 0.3, yoga: K.yoga - 0.3, film: K.film - 0.22, hall: K.thousands - 0.12, game: K.game - 0.3,
  lane: K.game + 1.15, crown: K.half - 0.3, loop: END - 0.42,
};
/** coins in the jar over the story: one bill at "million", every cent saved, taxes take a cut, inflation halves it */
const jarFill = (t: number) => kfs(t, [[K.cent - 0.2, 0], [K.cent + 0.9, 0.24], [K.taxes, 0.24], [K.taxes + 0.5, 0.17], [K.double - 0.1, 0.17], [K.double + 0.5, 0.085]]);

// ---------------------------------------------------------------- the money stage, one World per shot
const Stage: React.FC<{t: number; cam: Cam3; light?: Light; sky?: [string, string]; extra?: React.ReactNode; front?: React.ReactNode; belt?: number; hours?: number;
  jar?: number; bill?: number; bars?: [number, number, number]; children?: React.ReactNode}> =
  ({t, cam, light = LIGHT_DAY, sky = SKY_STAGE, extra, front, belt = 0, hours = 2, jar = 0, bill = 0, bars = [0, 0, 0], children}) =>
  <World cam={cam} light={light} sky={sky} front={front} scene={<>
    <StageSet /><Treadmill belt={belt} /><WallClock hours={hours} /><Jar fill={jar} bill={bill} /><BarChart years={bars} />{extra}</>}>{children}</World>;
const BLOB_TREAD: V3 = [TREAD.x - 0.2, TREAD.top, TREAD.z];
/** Blob running on the treadmill (side view, facing +x) */
const runner = (t: number, faster = 0): Pose => ({...walk(runPhase(t) * (1 + faster), {run: true, view: 'right'}), ...EXPR.determined});

// ---- shot 1 (frame 0): already sprinting under the racing clock; a $20 bill pops out of the console each step pair
const HOOK_CAM: Cam3 = {pos: [-1.55, 1.55, 4.7], look: [-1.78, 1.55, -1.2], fov: 40};
const Hook: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[0, HOOK_CAM], [C.jar, {pos: [-1.55, 1.52, 4.3], look: [-1.78, 1.55, -1.2], fov: 40}]]);
  const bills = [0, 1, 2, 3].map((i) => { const ph = ((t * 1.2 + i / 4) % 1); return {x: TREAD.x + 0.9 + ph * 1.6, y: 1.3 + ph * 1.2 - 2.4 * ph * ph, r: ph * 6 + i}; });
  return (<Stage t={t} cam={cam} belt={t * BELT_V} hours={3 + t * 2.5} jar={0} extra={<>{bills.map((b, i) => <Bill key={i} pos={[b.x, b.y, TREAD.z + 0.3]} rot={[b.r, b.r * 0.7, 0.4]} s={0.8} />)}</>}>
    <Cel at={BLOB_TREAD}><Blob {...runner(t)} sweat={0.6} /></Cel>
  </Stage>);
};
// ---- shot 2: "a million dollars" - one lonely $20 bill drops into the huge empty jar
const JarShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.jar, {pos: [0.05, 1.6, 4.5], look: [0.1, 1.05, -0.8], fov: 38}], [C.bar1, {pos: [0.05, 1.55, 4.1], look: [0.1, 1.05, -0.8], fov: 38}]]);
  const u = prog(t, K.million - 0.1, K.million + 0.55), fall = u > 0 && u < 1;
  const bp = toScreen(cam, [JAR.x, 2.25, JAR.z]);
  const cp = cardPop(t, K.million + 0.05, C.bar1 - 0.05);
  return (<Stage t={t} cam={cam} hours={5} bill={u >= 1 ? 1 : 0}
    extra={fall ? <Bill pos={[JAR.x + Math.sin(u * 9) * 0.2, lerp(2.4, 0.16, eout(u)), JAR.z + 0.05]} rot={[Math.sin(u * 12) * 0.5, u * 4, Math.cos(u * 10) * 0.4]} s={0.85} /> : null}>
    <Cel at={[-0.4, 0, -0.2]}><Blob {...idle(act(t, [[0, 'stand'], [K.million + 0.4, 'shrug']], [[0, 'thinking'], [K.million + 0.45, 'confused']]), t)} view="right" lookX={10} /></Cel>
    {bp && <BigNumber x={540} y={clamp(bp.y - 120, 430, 900)} s={cp.s} rot={cp.rot} text="$1,000,000" size={118} color="#7CE08F" />}
  </Stage>);
};
// ---- shot 3: "twenty-four years" - the first gold bar shoots up
const BarCam1 = (t: number) => cam3At(t, [[C.bar1, {pos: [1.6, 1.6, 5.6], look: [1.75, 1.3, -2.4], fov: 40}], [C.full, {pos: [1.6, 1.62, 5.2], look: [1.75, 1.32, -2.4], fov: 40}]]);
const Bar1: React.FC<{t: number}> = ({t}) => {
  const cam = BarCam1(t), y1 = 24 * eout(prog(t, K.twentyfour - 0.15, K.twentyfour + 0.55));
  const top = toScreen(cam, [BARS.x[0], y1 * BARS.perYear + 0.1, BARS.z]);
  return (<Stage t={t} cam={cam} hours={7} bars={[y1, 0, 0]}>
    <Cel at={[0.95, 0, -0.9]}><Blob {...idle(act(t, [[0, 'stand'], [K.twentyfour, 'point']], [[0, 'neutral'], [K.twentyfour + 0.1, 'shocked']]), t)} lookY={-12} faceDy={-10} /></Cel>
    {top && <YearsCard x={top.x} y={Math.min(top.y - 110, 760)} s={pop(t, K.twentyfour, 0.35)} to={24} count={prog(t, K.twentyfour, K.twentyfour + 0.7)} />}
  </Stage>);
};
// ---- shot 4: "full time" - the clock blurs through a 40-hour week over the runner
const FullTime: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.full, {pos: [-1.72, 2.0, 6.3], look: [-1.8, 2.25, -5.0], fov: 42}], [C.cent, {pos: [-1.72, 2.02, 5.8], look: [-1.8, 2.27, -5.0], fov: 42}]]);
  const hrs = 5 + 40 * smooth(prog(t, K.full - 0.1, K.full + 1.1));
  const cp = cardPop(t, K.full + 0.1, C.cent - 0.05);
  return (<Stage t={t} cam={cam} belt={t * BELT_V} hours={hrs}>
    <Cel at={BLOB_TREAD}><Blob {...runner(t)} {...EXPR.nervous} sweat={1} /></Cel>
    <BigNumber x={540} y={760} s={cp.s} rot={cp.rot} text="40 HRS" sub="every week" size={120} />
  </Stage>);
};
// ---- shot 5: "saving every cent" - pockets out, every coin into the jar
const CentShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.cent, {pos: [0.05, 1.55, 4.5], look: [0.1, 1.0, -0.7], fov: 38}], [C.taxes, {pos: [0.05, 1.55, 4.1], look: [0.12, 1.0, -0.7], fov: 38}]]);
  const at: V3 = [-0.4, 0, -0.2]; const hand = celPoint(cam, at, 1.7, [120, -300]);
  const coins = [0, 1, 2, 3, 4, 5].map((i) => { const u = prog(t, K.cent - 0.25 + i * 0.13, K.cent + 0.2 + i * 0.13); if (u <= 0 || u >= 1) return null;
    return <Coin key={i} pos={[lerp(hand[0], JAR.x, u), lerp(hand[1], 0.4 + jarFill(t) * 1.4, u) + Math.sin(Math.PI * u) * 0.5, lerp(hand[2], JAR.z, u)]} rot={[u * 9, u * 3, 0]} s={0.9} />; });
  return (<Stage t={t} cam={cam} hours={6} jar={jarFill(t)} extra={<>{coins}</>}>
    <Cel at={at}><Blob {...idle(act(t, [[0, 'holdFront'], [K.cent - 0.3, {...POSES.reach, view: 'right', handR: [120, -300]}], [K.cent + 1.0, 'shrug']],
      [[0, 'determined'], [K.cent + 1.0, 'sad']]), t)} /></Cel>
  </Stage>);
};
// ---- shot 6: "pay your taxes: twenty-eight years" - the tax man scoops coins out; bar 2 rises
const TaxShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.taxes, {pos: [0.95, 1.8, 7.2], look: [1.05, 1.2, -1.2], fov: 46}], [C.pie, {pos: [0.97, 1.78, 6.8], look: [1.07, 1.2, -1.2], fov: 46}]]);
  const take = smooth(prog(t, K.taxes - 0.05, K.taxes + 0.6));
  const tAt: V3 = [lerp(0.95, 1.25, take), 0, 0.35];
  const stack = celPoint(cam, tAt, 1.75, [0, -150]);
  const y2 = 28 * eout(prog(t, K.twentyeight - 0.1, K.twentyeight + 0.5));
  const top = toScreen(cam, [BARS.x[1], y2 * BARS.perYear + 0.1, BARS.z]);
  return (<Stage t={t} cam={cam} hours={7} jar={jarFill(t)} bars={[24, y2, 0]}
    front={take > 0.05 ? <CoinHeap at={[stack[0], stack[1] - 0.05, stack[2] + 0.1]} n={12} r={0.16} h={0.12} seed={8} k="tax" /> : null}>
    <Cel at={[-0.15, 0, 0.3]}><Blob {...idle(act(t, [[0, 'stand'], [K.taxes + 0.2, 'handsOnHead']], [[0, 'neutral'], [K.taxes + 0.2, 'shocked']]), t)} view="right" /></Cel>
    <Cel at={tAt} h={1.75}><Taxman {...idle(act(t, [[0, 'holdFront']], [[0, 'smug']]), t, 0.3)} view="right" /></Cel>
    {top && <YearsCard x={top.x} y={Math.min(top.y - 110, 760)} s={pop(t, K.twentyeight, 0.35)} to={28} count={prog(t, K.twentyeight, K.twentyeight + 0.6)} color="#F29A30" />}
    <SourceTag t={t} t0={K.taxes + 0.1} t1={C.pie} text="IRS 2026 brackets + FICA, single" />
  </Stage>);
};
// ---- shot 7: "pay rent and save a normal twenty percent" - the 3D pie: 80% slides away, 20% stays
const PIE_AT: V3 = [0.0, 1.05, 1.3];
const PieShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.pie, {pos: [0.35, 2.7, 6.3], look: [0.35, 1.0, 0.7], fov: 38}], [C.bar3, {pos: [0.35, 2.65, 5.9], look: [0.35, 1.0, 0.7], fov: 38}]]);
  const slide = smooth(prog(t, K.rent - 0.05, K.save + 0.4)), glow = prog(t, K.percent - 0.1, K.percent + 0.3);
  const pp = toScreen(cam, [PIE_AT[0], PIE_AT[1] + 0.4, PIE_AT[2]]);
  const cp = cardPop(t, K.percent, C.bar3 - 0.05);
  return (<Stage t={t} cam={cam} hours={8} jar={jarFill(t)} bars={[24, 28, 0]} extra={<Pie at={PIE_AT} slide={slide} glow={glow} r={0.58} />}>
    <Cel at={[0.85, 0, 0.2]}><Blob {...idle(act(t, [[0, 'think'], [K.rent, mirrorPose(POSES.point)], [K.percent + 0.2, 'shrug']], [[0, 'thinking'], [K.rent + 0.1, 'sad'], [K.percent + 0.2, 'nervous']]), t)} /></Cel>
    {pp && <BigNumber x={pp.x + 60} y={pp.y - 170} s={cp.s} rot={cp.rot} text="20%" sub="saved" size={140} color="#7CE08F" />}
  </Stage>);
};
// ---- shot 8: "a hundred and forty" - bar 3 rockets up through the frame, crane up (accent), drawn to scale
const BAR3_KEYS: Cam3Key[] = [[C.bar3, {pos: [1.6, 1.55, 5.4], look: [1.75, 1.3, -2.4], fov: 40}], [K.forty - 0.15, {pos: [1.6, 1.58, 5.0], look: [1.75, 1.4, -2.4], fov: 40}],
  [K.forty + 0.35, {pos: [1.6, 5.4, 11.5], look: [2.15, 5.0, -2.4], fov: 46}, EASE.slam], [C.prices, {pos: [1.6, 5.5, 12.0], look: [2.15, 5.0, -2.4], fov: 46}]];
const Bar3: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, BAR3_KEYS), y3 = 140 * smooth(prog(t, K.hundred, K.forty + 0.3));
  const top = toScreen(cam, [BARS.x[2], y3 * BARS.perYear + 0.1, BARS.z]);
  return (<ShotBlur t={t} cam={BAR3_KEYS}><Stage t={t} cam={cam} hours={9} jar={jarFill(t)} bars={[24, 28, y3]}>
    <Cel at={[0.95, 0, -0.9]}><Blob {...idle(act(t, [[0, 'stand'], [K.forty, 'handsOnHead']], [[0, 'nervous'], [K.forty, 'shocked']]), t)} lookY={-14} faceDy={-12} /></Cel>
    {top && t > K.forty + 0.2 && <YearsCard x={clamp(top.x, 230, 850)} y={clamp(top.y - 100, 500, 900)} s={pop(t, K.forty + 0.25, 0.35)} to={140} count={1} color="#E5484D" />}
  </Stage></ShotBlur>);
};
// ---- shot 9: "meanwhile, prices roughly double" - the price tag flips $5 -> $10, the coins in the jar shrink to half
const PriceShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.prices, {pos: [-0.05, 1.5, 4.3], look: [0.05, 1.0, -0.6], fov: 38}], [C.rigged, {pos: [-0.05, 1.5, 3.9], look: [0.08, 1.0, -0.6], fov: 38}]]);
  const at: V3 = [-0.4, 0, -0.1]; const hand = celPoint(cam, at, 1.7, [96, -160]);
  const bag = toScreen(cam, [hand[0], hand[1] + 0.42, hand[2] + 0.1]);
  return (<Stage t={t} cam={cam} hours={10} jar={jarFill(t)} front={<GroceryBag pos={[hand[0], hand[1] - 0.18, hand[2] + 0.1]} s={1.05} />}>
    <Cel at={at}><Blob {...idle(act(t, [[0, {...POSES.holdFront, handR: [96, -160], handL: [-60, -130]}]], [[0, 'happy'], [K.double, 'shocked']]), t)} view="right" lookX={8} /></Cel>
    {bag && <PriceTag t={t} at={K.double} x={bag.x + 70} y={bag.y - 60} a="$5" b="$10" s={1.15} />}
    <SourceTag t={t} t0={K.prices + 0.1} t1={C.rigged} text="BLS CPI: ~3% a year, long-run" />
  </Stage>);
};
// ---- shots 10-11: "feels like a rigged game, right?" grey, the belt speeds up / "It isn't." flash: the belt stops, colour back
const TreadClose = (t: number, a: number): Cam3 => cam3At(t, [[a, {pos: [-1.6, 1.5, 4.4], look: [-1.85, 1.35, -0.6], fov: 38}], [a + 2.2, {pos: [-1.62, 1.5, 3.9], look: [-1.85, 1.38, -0.6], fov: 38}]]);
const Rigged: React.FC<{t: number}> = ({t}) => {
  const sp = 1 + 0.9 * smooth(prog(t, K.rigged - 0.2, K.right)), belt = t * BELT_V * sp, slip = -0.45 * smooth(prog(t, K.rigged, K.right + 0.4));
  return (<Mood sat={0.3}><Stage t={t} cam={TreadClose(t, C.rigged)} light={LIGHT_GREY} sky={['#4A4E58', '#3A3E48']} belt={belt} hours={12 + t * 6}>
    <Cel at={[BLOB_TREAD[0] + slip, BLOB_TREAD[1], BLOB_TREAD[2]]}><Blob {...runner(t, 0.6 * smooth(prog(t, K.rigged - 0.2, K.right)))} {...EXPR.nervous} sweat={1} tint="#F2564E" tintAmt={0.45 * prog(t, K.rigged, K.right)} /></Cel>
  </Stage></Mood>);
};
const Isnt: React.FC<{t: number}> = ({t}) => {
  const stop = K.isnt - 0.05, sat = kfs(t, [[stop, 0.3], [stop + 0.35, 1]]);
  const belt = (stop * BELT_V * 1.9) + 0.4 * eout(prog(t, stop, stop + 0.3));
  return (<Mood sat={sat}><Stage t={t} cam={TreadClose(t, C.isnt)} light={mixLight(LIGHT_GREY, LIGHT_DAY, sat)} sky={mixSky(['#4A4E58', '#3A3E48'], SKY_STAGE, sat)} belt={belt} hours={14}>
    <Cel at={[BLOB_TREAD[0] - 0.45 + 0.3 * eout(prog(t, stop, stop + 0.4)), BLOB_TREAD[1], BLOB_TREAD[2]]}>
      <Blob {...idle(act(t, [[0, {...POSES.fall, lean: -14, view: 'right'}], [stop + 0.35, 'stand']], [[0, 'shocked'], [stop + 0.4, 'confused']]), t)} blink={blink(t, stop + 0.9)} /></Cel>
  </Stage></Mood>);
};
// ---- shot 12: "you're using the wrong equation" - MONEY = HOURS x RATE slams in, a red X stamps on it
const WRONG_KEYS: Cam3Key[] = [[C.wrong, {pos: [0.1, 1.4, 7.4], look: [0.1, 1.3, -0.5], fov: 38}], [K.wrong + 0.05, {pos: [0.1, 1.4, 6.3], look: [0.1, 1.28, -0.5], fov: 38}, EASE.punch], [C.salary, {pos: [0.1, 1.4, 6.0], look: [0.1, 1.28, -0.5], fov: 38}]];
const EQ1 = [{t: 'MONEY', c: '#7CE08F'}, {t: '='}, {t: 'HOURS', c: '#9CC2FF'}, {t: '×'}, {t: 'RATE', c: '#FFD97A'}];
const EQ2 = [{t: 'MONEY', c: '#7CE08F'}, {t: '='}, {t: 'PROBLEMS SOLVED', c: '#FFD97A'}, {t: '×'}, {t: 'PEOPLE REACHED', c: '#FFB3D1'}];
const Wrong: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, WRONG_KEYS), cp = cardPop(t, K.wrong - 0.05, C.salary - 0.05);
  return (<ShotBlur t={t} cam={WRONG_KEYS}><Stage t={t} cam={cam} hours={2} jar={0.085} bars={[24, 28, 140]}>
    <Cel at={[0.1, 0, 0.9]}><Blob {...idle(act(t, [[0, 'stand'], [K.wrong, 'shrug'], [K.equation + 0.4, 'facepalm']], [[0, 'confused'], [K.equation + 0.4, 'sad']]), t)} lookY={-10} faceDy={-8} /></Cel>
  </Stage></ShotBlur>);
};
const WrongCard: React.FC<{t: number}> = ({t}) => { const cp = cardPop(t, K.wrong - 0.05, C.salary - 0.05);
  return <EquationCard x={540} y={560} s={cp.s} rot={cp.rot} terms={EQ1} xMark={prog(t, K.equation + 0.3, K.equation + 0.55)} />; };
// ---- shots 13 + 15: two bars (TIME clock, RATE coin) rise into a glass ceiling; later it shatters and a gold bar shoots through
const BARS_AT: V3 = [-0.25, 0, 0.7];
const SAL_KEYS: Cam3Key[] = [[C.salary, {pos: [0.2, 1.85, 7.8], look: [0.2, 1.35, 0.4], fov: 42}], [C.other, {pos: [0.2, 1.85, 7.2], look: [0.2, 1.35, 0.4], fov: 42}]];
const CeilingShot: React.FC<{t: number; free?: boolean}> = ({t, free = false}) => {
  const hT = 1.55 * eout(prog(t, K.salary, K.times + 0.3)), hR = 1.55 * eout(prog(t, K.rate - 0.1, K.rate + 0.4));
  const ceilY = free ? 2.0 : lerp(3.6, 2.0, smooth(prog(t, K.ceiling - 0.45, K.ceiling)));
  const bonk = free ? 0 : bump(t, K.ceiling - 0.02, K.ceiling + 0.25);
  const shatter = free ? prog(t, K.noceiling - 0.05, K.noceiling + 1.0) : 0;
  const third = free ? 5.5 * eout(prog(t, K.noceiling - 0.1, K.noceiling + 0.5)) : 0;
  const keys: Cam3Key[] = free ? [[C.noceil, {pos: [0.2, 1.85, 7.4], look: [0.2, 1.35, 0.4], fov: 42}], [K.noceiling + 0.4, {pos: [0.7, 3.4, 10.2], look: [0.8, 2.7, 0.5], fov: 46}, EASE.punch],
    [C.yoga, {pos: [0.7, 3.45, 10.4], look: [0.8, 2.75, 0.5], fov: 46}]] : SAL_KEYS;
  const cam = cam3At(t, keys);
  const lbl = (dx: number) => toScreen(cam, [BARS_AT[0] + dx, 0.0, BARS_AT[2] + 0.4]);
  const lt = lbl(-0.55), lr = lbl(0.55);
  return (<ShotBlur t={t} cam={keys}><Stage t={t} cam={cam} hours={3} jar={0.085} bars={free ? [0, 0, 0] : [24, 28, 140]}
    extra={<TimeRateBars at={BARS_AT} hT={free ? 1.55 : hT} hR={free ? 1.55 : hR} bonk={bonk} ceilY={ceilY} ceilShow={free ? 1 : prog(t, K.rate + 0.2, K.ceiling - 0.4)} shatter={shatter} third={third} />}>
    <Cel at={[1.2, 0, 1.6]}><Blob {...idle(free ? act(t, [[0, 'stand'], [K.noceiling, 'cheer']], [[0, 'neutral'], [K.noceiling, 'joy']])
      : act(t, [[0, 'stand'], [K.ceiling, 'crossArms']], [[0, 'neutral'], [K.ceiling + 0.05, 'angry']]), t)} view="left" lookY={-8} /></Cel>
    {!free && lt && hT > 0.1 && <Pill x={lt.x} y={lt.y + 40} text="TIME" s={pop(t, K.salary + 0.1)} size={40} bg="#9CC2FF" />}
    {!free && lr && hR > 0.1 && <Pill x={lr.x} y={lr.y + 40} text="RATE" s={pop(t, K.rate)} size={40} bg="#FFD97A" />}
  </Stage></ShotBlur>);
};
// ---- shot 14: "problems solved times people reached" - a bulb lights, little people multiply
const RING: V3[] = (() => { const o: V3[] = []; [[1.5, 3], [2.2, 7], [3.0, 12]].forEach(([r, n], ri) => { for (let i = 0; i < n; i++) { const a = Math.PI * (0.15 + 0.7 * (i + 0.5) / n) + ri * 0.1; o.push([Math.cos(a) * r * -1, 0, 0.2 - Math.sin(a) * r]); } }); return o; })();
const OtherShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[C.other, {pos: [0.0, 1.7, 6.2], look: [0.0, 1.05, -0.4], fov: 42}], [C.noceil, {pos: [0.0, 1.75, 5.6], look: [0.0, 1.05, -0.4], fov: 42}]]);
  const at: V3 = [0.0, 0, 1.0]; const hand = celPoint(cam, at, 1.7, [80, -330]);
  const glow = prog(t, K.problems - 0.05, K.problems + 0.25);
  const nShow = Math.floor(RING.length * smooth(prog(t, K.people - 0.1, K.people + 1.0)));
  return (<Stage t={t} cam={cam} hours={4} jar={0.085} bars={[24, 28, 140]} front={<Bulb pos={[hand[0], hand[1] - 0.05, hand[2] + 0.05]} glow={glow} s={1.3} />}>
    <Cel at={at}><Blob {...idle(act(t, [[0, 'stand'], [K.problems - 0.3, {...POSES.pointUp, handR: [80, -330]}]], [[0, 'thinking'], [K.problems, 'happy']]), t)} /></Cel>
    {RING.slice(0, nShow).map((p, i) => <Cel key={i} at={p} h={0.85}><Person id={'v' + i} outfit={{shirt: VIEW_SHIRTS[i % 8], hair: VIEW_HAIR[i % 5], hairStyle: i % 3 ? 'short' : 'ponytail'}}
      {...act(t, [[0, 'cheer']], [[0, 'happy']])} sy={pop(t, K.people - 0.1 + i * 0.045, 0.3)} sx={pop(t, K.people - 0.1 + i * 0.045, 0.3)} /></Cel>)}
    {glow > 0 && [0, 1, 2, 3].map((i) => { const b = toScreen(cam, [hand[0], hand[1] + 0.25, hand[2]]); if (!b) return null; const a = i * Math.PI / 2 + 0.6;
      return <Sparkle key={i} x={b.x + Math.cos(a) * 110} y={b.y + Math.sin(a) * 110} r={22 * bump(t, K.problems + i * 0.06, K.problems + 0.7 + i * 0.06)} fill="#FFE27A" />; })}
  </Stage>);
};
const OtherCard: React.FC<{t: number}> = ({t}) => { const cp = cardPop(t, K.other + 0.05, C.noceil - 0.05);
  return <EquationCard x={540} y={470} s={cp.s} rot={cp.rot} terms={EQ2} />; };
// ---- shots 16-18: the yoga studio. Live class (left) -> whip to the camera on the tripod -> the hall of thousands
const yogaPose = (t: number, ph = 0): Pose => pick(t, [[0, 0], [1, 1]]) === 0 ? POSES.cheer : POSES.cheer;
const YOGA_KEYS: Cam3Key[] = [
  [C.yoga, {pos: [-0.95, 1.6, 6.4], look: [-0.95, 1.1, -0.5], fov: 36}], [C.film, {pos: [-0.95, 1.6, 5.9], look: [-0.95, 1.1, -0.5], fov: 36}],
  [K.film + 0.12, {pos: [1.75, 1.6, 3.9], look: [-1.75, 1.15, -0.4], fov: 34}, EASE.whip], [C.hall, {pos: [1.7, 1.6, 3.6], look: [-1.75, 1.15, -0.4], fov: 34}],
  [C.hall + 0.001, {pos: [3.8, 6.8, 6.6], look: [0.6, 0.0, -5.2], fov: 44}], [C.game, {pos: [3.8, 7.6, 7.6], look: [0.6, 0.0, -5.6], fov: 44}]];
const YogaShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, YOGA_KEYS), hall = t >= C.hall ? smooth(prog(t, C.hall, C.hall + 1.1)) : 0;
  const flow: Pose = act(t, [[0, 'cheer'], [K.yoga + 0.6, {...POSES.cheer, lean: 10, handL: [-160, -330], handR: [60, -420]}], [K.sells, 'cheer'], [K.film + 0.3, {...POSES.cheer, lean: -10, handR: [160, -330], handL: [-60, -420]}]], [[0, 'happy'], [K.sells, 'nervous'], [K.film + 0.3, 'grin']]);
  const coinU = prog(t, K.sells, K.sells + 0.5);
  const cp = cardPop(t, K.hundred2 - 0.05, C.film - 0.05);
  const bp = toScreen(cam, [YOGA.blob[0], 2.4, YOGA.blob[2]]);
  return (<ShotBlur t={t} cam={YOGA_KEYS}><World cam={cam} light={LIGHT_YOGA} sky={hall > 0 ? ['#F7E9CF', '#F1E2C6'] : SKY_YOGA}
    scene={<><YogaSet t={t} hall={hall} rec={t > K.film ? (Math.floor(t * 3) % 2 ? 1 : 0.15) : 0} />
      {hall > 0 && <><CoinRain at={[-2.7, 0, 0.5]} u={t - (C.hall + 0.3)} n={lvl(40, 80)} spread={1.6} /><CoinHeap at={[-2.7, 0, 0.5]} n={lvl(90, 180)} r={0.45 + 0.5 * hall} h={0.25 + 0.5 * hall} seed={21} k={'yp' + Math.round(hall * 8)} /></>}
      {coinU > 0 && coinU < 1 && <Coin pos={[-1.15, lerp(2.0, 0.05, coinU * coinU), -0.9]} rot={[coinU * 8, 0, 0]} />}</>}>
    <Cel at={YOGA.blob}><Blob yogi {...idle(flow, t)} /></Cel>
    {hall < 0.05 && <Cel at={YOGA.student}><Student {...idle(mirrorPose(flow), t, 0.4)} view="front" /></Cel>}
    {hall > 0 && VIEWERS.slice(0, Math.round(hall * VIEWERS.length)).map((p, i) => <Cel key={i} at={[p[0], 0, p[2] + 0.2]} h={1.5}>
      <Person id={'y' + i} outfit={{shirt: VIEW_SHIRTS[i % 8], hair: VIEW_HAIR[(i * 3) % 5], hairStyle: i % 4 ? 'short' : 'ponytail'}} {...(i % 2 ? mirrorPose(flow) : flow)} eyes="closed" mouth="smile" /></Cel>)}
    {bp && t < C.film && <BigNumber x={540} y={560} s={cp.s} rot={cp.rot} text="$100/HR" sub="one class at a time" size={110} color="#7CE08F" />}
    {hall > 0.25 && <BigNumber x={540} y={500} s={pop(t, K.thousands + 0.15, 0.4) * popOut(t, C.game - 0.1)} text="THOUSANDS" sub="same class, filmed once" size={112} color="#FFC83D" />}
  </World></ShotBlur>);
};
// ---- shots 19-21: finale. Aerial on a diagonal: the old lane (treadmill + one bill) vs the coin mountain -> slam to the
// lane -> slam to Blob crowned on the mountain, the second half of the equation lit; the CTA plays; light back to frame 0
const MOUNT: V3 = [2.15, 0, -2.4]; const MOUNT_H = 1.45;
const FIN_KEYS: Cam3Key[] = [
  [C.game, {pos: [5.2, 7.2, 7.8], look: [0.2, 0.4, -1.6], fov: 44}], [C.lane - 0.35, {pos: [5.0, 7.4, 7.2], look: [0.1, 0.4, -1.6], fov: 44}],
  [C.lane, {pos: [-0.35, 1.25, 2.7], look: [-0.4, 0.45, 0.3], fov: 36}, EASE.slam], [C.crown - 0.35, {pos: [-0.35, 1.22, 2.5], look: [-0.4, 0.45, 0.3], fov: 36}],
  [C.crown, {pos: [2.25, 2.55, 3.1], look: [2.15, 2.4, -2.4], fov: 40}, EASE.slam], [END - 0.45, {pos: [2.2, 2.5, 3.4], look: [2.15, 2.35, -2.4], fov: 40}]];
const Finale: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, FIN_KEYS), back = smooth(prog(t, K.subscribe + 0.4, END - 0.5));
  const line = smooth(prog(t, C.game + 0.2, C.game + 1.0));
  const up = t > K.subscribe - 0.1 && t < END - 0.8;
  const cardP = cardPop(t, K.half - 0.15, K.subscribe - 0.2);
  return (<ShotBlur t={t} cam={FIN_KEYS}><World cam={cam} light={mixLight(LIGHT_GOLD, LIGHT_DAY, back)} sky={mixSky(SKY_GOLD, SKY_STAGE, back)} scene={<>
      <StageSet /><Treadmill belt={0} /><WallClock hours={2} /><Jar fill={0} bill={1} x={-0.35} z={0.3} r={0.32} h={0.8} />
      <mesh position={[MOUNT[0], MOUNT_H / 2 - 0.1, MOUNT[2]]} castShadow receiveShadow><coneGeometry args={[1.35, MOUNT_H, 48]} /><meshStandardMaterial color={PAL.gold} roughness={0.38} metalness={0.5} /></mesh>
      <group position={[0, -MOUNT_H / 2, 0]}><CoinHeap at={[MOUNT[0], MOUNT_H / 2, MOUNT[2]]} n={lvl(160, 360)} r={1.3} h={MOUNT_H * 0.95} seed={31} k="mount" /></group>
      <Box pos={[0.65 - 1.2 * (1 - line), 0, -0.9]} rot={[0, -0.75, 0]} size={[Math.max(0.01, 5.2 * line), 0.012, 0.07]} color="#FFFFFF" glow={0.6} emissive="#FFFFFF" r={0} cast={false} />
    </>}>
    <Cel at={[MOUNT[0], 0, MOUNT[2] + 0.1]} lift={MOUNT_H - 0.05} shadow={false}><Blob {...idle(act(t, [[0, 'cheer'], [K.half - 0.2, {...POSES.pointUp, view: 'front'}], [K.subscribe, 'crossArms'], [END - 0.9, 'stand']],
      [[0, 'joy'], [K.half - 0.2, 'smug'], [END - 0.9, 'happy']]), t)} lookY={up ? -12 : 0} faceDy={up ? -14 : 0} browUp={up ? 0.9 : undefined} /></Cel>
    {t > K.game && t < C.crown && [0, 1, 2, 3, 4].map((i) => { const b = toScreen(cam, [MOUNT[0], MOUNT_H + 0.2, MOUNT[2]]); if (!b) return null; const a = i * 1.26;
      return <Sparkle key={i} x={b.x + Math.cos(a) * b.s * 0.9} y={b.y + Math.sin(a) * b.s * 0.6} r={18 * Math.max(0, loopS(t, 30, i * 0.2))} fill="#FFE27A" />; })}
    <EquationCard x={540} y={420} s={cardP.s * 0.82} rot={cardP.rot} terms={EQ2} lit={prog(t, K.half, K.half + 0.4)} />
  </World></ShotBlur>);
};

// ---------------------------------------------------------------- all shots, cut on the words
const Scenes: React.FC<{t: number}> = ({t}) => {
  const tau = t >= C.loop ? t - END : t;     // the last 0.42 s replays the frame-0 shot so the video loops
  return (<Cuts t={t} shots={[
    [0, <Hook t={t} />], [C.jar, <JarShot t={t} />], [C.bar1, <Bar1 t={t} />], [C.full, <FullTime t={t} />], [C.cent, <CentShot t={t} />],
    [C.taxes, <TaxShot t={t} />], [C.pie, <PieShot t={t} />], [C.bar3, <Bar3 t={t} />], [C.prices, <PriceShot t={t} />], [C.rigged, <Rigged t={t} />],
    [C.isnt - 0.2, <Transition t={t} at={C.isnt} kind="flash" a={<Rigged t={t} />} b={<Isnt t={t} />} dur={0.36} />], [C.isnt + 0.2, <Isnt t={t} />],
    [C.wrong, <Wrong t={t} />], [C.salary, <CeilingShot t={t} />], [C.other, <OtherShot t={t} />], [C.noceil, <CeilingShot t={t} free />],
    [C.yoga, <YogaShot t={t} />], [C.hall - 0.2, <Transition t={t} at={C.hall} kind="flash" a={<YogaShot t={Math.min(t, C.hall - 0.001)} />} b={<YogaShot t={Math.max(t, C.hall)} />} dur={0.34} />],
    [C.hall + 0.18, <YogaShot t={t} />], [C.game, <Finale t={t} />],
    [C.loop - 0.2, <Transition t={t} at={C.loop} kind="flash" a={<Finale t={t} />} b={<Hook t={tau} />} dur={0.3} />], [C.loop + 0.16, <Hook t={tau} />],
  ]} />);
};
/** screen overlays that must stay sharp (outside any blur): hook text, the equation cards, honesty tag */
const Overlays: React.FC<{t: number}> = ({t}) => (<AbsoluteFill><svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute'}}>
  {t < 2.6 && <HookText t={t} text="$20 AN HOUR, $1 MILLION TAKES 24 YEARS" tOut={Math.min(2.2, K.million + 0.2)} keys={['$20', '$1', 'MILLION', '24']} />}
  {t >= C.loop && <HookText t={t - END} text="$20 AN HOUR, $1 MILLION TAKES 24 YEARS" tOut={2.2} keys={['$20', '$1', 'MILLION', '24']} />}
  {t >= C.wrong && t < C.salary && <WrongCard t={t} />}
  {t >= C.other && t < C.noceil && <OtherCard t={t} />}
</svg>
  <Tag text="drawn to scale" show={t > K.forty + 0.3 && t < C.prices ? 1 : 0} />
</AbsoluteFill>);

export const Short: React.FC<{voice?: boolean; captions?: boolean; guides?: boolean}> = ({voice = false, captions = true, guides = false}) => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps;
  return (<AbsoluteFill style={{background: '#000'}}>
    <Scenes t={t} />
    <Overlays t={t} />
    <Cta t={t} tIn={K.subscribe - 0.1} tClick={K.otherhalf - 0.25} tBell={K.otherhalf + 0.2} tOut={END - 0.8} y={330} />
    {captions && <Captions t={t} />}
    {guides && <SafeGuides />}
    <Audio src={staticFile(`${T.short}/sfx.wav`)} volume={0.42} />
    <Audio src={staticFile(`${T.short}/bed.wav`)} volume={0.2} />
    {voice && <Sequence from={Math.round(Math.max(0, T.voiceOffset) * fps)} layout="none"><Audio src={staticFile(`${T.short}/vo.wav`)} /></Sequence>}
  </AbsoluteFill>);
};

// ---------------------------------------------------------------- thumbnails (first drafts; refined in the thumbnail step)
const ThumbA: React.FC = () => {      // the stakes: Blob shocked under the 140-year bar, circled
  const cam: Cam3 = {pos: [1.35, 1.75, 3.6], look: [1.8, 2.6, -2.4], fov: 46};
  const ring = toScreen(cam, [BARS.x[2], 3.6, BARS.z]);
  return (<Stage t={10} cam={cam} hours={9} jar={0.085} bars={[24, 28, 140]}>
    <Cel at={[1.05, 0, 0.4]}><Blob {...act(10, [[0, 'handsOnHead']], [[0, 'shocked']])} lookY={-14} faceDy={-12} /></Cel>
    {ring && <><Ring x={ring.x} y={ring.y} r={170} /><Arrow x1={ring.x - 200} y1={ring.y + 420} x2={ring.x - 60} y2={ring.y + 190} /></>}
  </Stage>);
};
const ThumbB: React.FC = () => (<Stage t={10} cam={{pos: [-1.0, 1.55, 3.2], look: [-1.3, 1.6, -1.2], fov: 40}} belt={1} hours={9}>
  <Cel at={BLOB_TREAD}><Blob {...runner(0.3)} {...EXPR.nervous} sweat={1} tint="#F2564E" tintAmt={0.4} /></Cel></Stage>);
const ThumbC: React.FC = () => (<Stage t={10} cam={{pos: [0.1, 1.45, 4.4], look: [0.1, 1.42, -0.5], fov: 38}} hours={2} jar={0.085} bars={[24, 28, 140]}>
  <Cel at={[0.1, 0, 0.9]}><Blob {...act(10, [[0, 'shrug']], [[0, 'confused']])} /></Cel></Stage>);
export const Thumb: React.FC<{variant: 'A' | 'B' | 'C'}> = ({variant}) => {
  if (variant === 'A') return <ThumbFrame scene={<ThumbA />} l1="$20 AN HOUR" l2="140 YEARS?" />;
  if (variant === 'B') return <ThumbFrame scene={<ThumbB />} l1="WORK HARDER?" l2="WRONG MATH" />;
  return <ThumbFrame scene={<ThumbC />} l1="THE MILLION" l2="EQUATION" />;
};
