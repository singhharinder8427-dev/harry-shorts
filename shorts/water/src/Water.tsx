import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import timing from './timing.json';
import {Layer, useK} from './Layer';
import {Captions} from './Captions';
import {Character, Flower} from './Character';
import {Earth, R} from './Earth';
import {Bracket, Pill, Puff, Sparkle} from './Bits';
import {INK, WATER, WATER_DEEP, mix} from './color';
import {Cam, CamKey, bump, camAt, clamp, eio, ein, eout, kfs, lerp, pick, pop, popOut, prog, rnd, smooth, spring} from './math';

const T = timing as any;
const K = T.keys as Record<string, number>;
const KE = T.keyEnd as Record<string, number>;
const S = T.sentences as {start: number; end: number}[];
export const DURATION = T.duration as number;
const CUT1 = K.you - 0.04;          // space -> ground
const CUT2 = S[4].start - 0.08;      // ground -> space ("And water vapor")
const END = DURATION;

// ---------------------------------------------------------------- shared
const Stars: React.FC<{t: number}> = ({t}) => {
  const k = useK();
  return (<g>{Array.from({length: 70}, (_, i) => {
    const x = (rnd(i) - 0.5) * 2600, y = (rnd(i + 99) - 0.5) * 4200, r = 2 + rnd(i + 7) * 4;
    const tw = 0.55 + 0.45 * Math.sin((2 * Math.PI * (3 + (i % 4)) * t) / END + i);
    return <circle key={i} cx={x} cy={y} r={r / k * 0.35 + r * 0.5} fill="#FFF7D6" opacity={tw} />;
  })}</g>);
};
export const Tag: React.FC<{text: string; show: number}> = ({text, show}) => show <= 0 ? null : (
  <AbsoluteFill style={{top: 250, height: 80, bottom: 'auto', alignItems: 'center', justifyContent: 'center'}}>
    <div style={{fontFamily: 'Inter', fontWeight: 800, fontSize: 34, color: 'white', background: 'rgba(17,17,17,0.72)',
      padding: '8px 22px', borderRadius: 40, transform: `scale(${show})`, letterSpacing: 0.3}}>{text}</div>
  </AbsoluteFill>);

// ---------------------------------------------------------------- SPACE
const Squiggle: React.FC<{a: number; r: number; s: number; dir: number}> = ({a, r, s, dir}) => {
  const k = useK(); if (s <= 0.01) return null;
  const L = 70, n = 8;
  const pts = Array.from({length: n + 1}, (_, i) => { const u = i / n; return [u * L - L / 2, Math.sin(u * Math.PI * 3) * 9]; });
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'} ${x} ${y}`).join(' ');
  const head = dir > 0 ? `M ${L / 2 - 4} -14 L ${L / 2 + 16} 0 L ${L / 2 - 4} 14 Z` : `M ${-L / 2 + 4} -14 L ${-L / 2 - 16} 0 L ${-L / 2 + 4} 14 Z`;
  return (<g transform={`rotate(${a * 57.3}) translate(${r} 0) scale(${s})`}>
    <path d={d} stroke={INK} strokeWidth={12 + 10 / k} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d={head} fill={INK} stroke={INK} strokeWidth={10 / k} strokeLinejoin="round" />
    <path d={d} stroke="#FF7A2B" strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d={head} fill="#FF7A2B" /></g>);
};
const WaterBall: React.FC<{r: number; t: number; look?: number; happy?: number}> = ({r, t, look = 0, happy = 0}) => {
  const k = useK(); if (r <= 0.5) return null; const ow = 7 / k;
  return (<g>
    <circle r={r} fill={WATER} stroke={INK} strokeWidth={ow} />
    <ellipse cx={-r * 0.38} cy={-r * 0.42} rx={r * 0.22} ry={r * 0.13} fill="white" opacity={0.85} transform={`rotate(-35 ${-r * 0.38} ${-r * 0.42})`} />
    {r > 12 && <g>
      <ellipse cx={-r * 0.28 + look * r * 0.1} cy={-r * 0.02} rx={r * 0.09} ry={r * 0.14} fill={INK} />
      <ellipse cx={r * 0.28 + look * r * 0.1} cy={-r * 0.02} rx={r * 0.09} ry={r * 0.14} fill={INK} />
      <path d={`M ${-r * 0.2} ${r * 0.3} Q 0 ${r * (0.45 + happy * 0.15)} ${r * 0.2} ${r * 0.3}`} stroke={INK} strokeWidth={ow * 0.7} fill="none" strokeLinecap="round" />
    </g>}
  </g>);
};
const BALL_R = R / 9.2;                         // 1,385 km vs 12,742 km
const BALL: [number, number] = [470, 10];
const ROW_Y = -R - 150;

export const Space: React.FC<{t: number; noTag?: boolean}> = ({t, noTag}) => {
  const phase2 = t >= CUT2;
  // camera
  const cam: Cam = !phase2 ? camAt(t, [
    [0, {x: 0, y: 40, s: 1}], [K.drop, {x: 0, y: 40, s: 1}], [K.vanished + 0.4, {x: 0, y: 30, s: 1.1}],
    [K.vanished + 0.55, {x: 0, y: 30, s: 1.1}], [CUT1, {x: 0, y: 10, s: 1.7}]], eio)
    : camAt(t, [
      [CUT2, {x: 0, y: 30, s: 0.94}], [K.strange - 0.15, {x: 0, y: 30, s: 0.94}], [K.strange + 0.7, {x: 150, y: 20, s: 1}],
      [K.nine - 0.35, {x: 150, y: 20, s: 1}], [K.nine + 0.35, {x: 110, y: -60, s: 0.95}],
      [K.depends + 0.3, {x: 110, y: -60, s: 0.95}], [K.subscribe + 0.2, {x: 0, y: 40, s: 1}], [END, {x: 0, y: 40, s: 1}]]);
  // dive-in at the end of shot 1 uses the camera; shake on the drain
  const shake = !phase2 ? bump(t, K.vanished, K.vanished + 0.7) * 5 : 0;
  const c2 = {...cam, x: cam.x + shake * Math.sin(t * 83), y: cam.y + shake * Math.sin(t * 61)};

  // water state
  const ocean = !phase2 ? kfs(t, [[K.vanished - 0.02, 1], [K.vanished + 0.85, 0]], eio)
    : kfs(t, [[K.depends + 0.42, 0], [K.depends + 1.35, 1]], eio);
  const cloudsA = [0, 1, 2].map((i) => !phase2 ? popOut(t, K.vanished + 0.08 + i * 0.09, 0.28) : pop(t, K.depends + 0.95 + i * 0.12, 0.4));
  const night = phase2 ? kfs(t, [[K.night - 0.25, 0], [K.night + 0.3, 1], [K.strange - 0.2, 1], [K.strange + 0.35, 0]]) : 0;
  const desert = phase2 ? kfs(t, [[K.desert - 0.1, 0], [K.desert + 0.45, 1], [K.depends + 0.6, 1], [K.depends + 1.4, 0]]) : 0;
  const cacti = phase2 ? [0, 1, 2, 3, 4, 5, 6, 7].map((i) => Math.min(pop(t, K.desert + 0.05 + i * 0.06, 0.35), popOut(t, K.depends + 0.5 + i * 0.04, 0.25))) : [];
  const shiver = phase2 ? kfs(t, [[K.night - 0.1, 0], [K.night + 0.15, 1], [K.strange - 0.15, 1], [K.strange + 0.05, 0]]) : 0;

  // face
  let face: any;
  if (!phase2) {
    const shock = t >= K.vanished;
    face = {eyes: shock ? 'wide' : 'open', mouth: shock ? 'o' : 'grin', browUp: kfs(t, [[K.vanished, 0], [K.vanished + 0.15, 1]]),
      lookY: kfs(t, [[K.drop - 0.1, 0], [K.drop + 0.2, 0.45], [K.vanished - 0.1, 0.45], [K.vanished + 0.1, 0]]),
      blink: bump(t, 0.25, 0.41) + bump(t, K.drop + 0.55, K.drop + 0.71)};
  } else {
    const st = pick<string>(t, [[CUT2, 'cozy'], [K.without - 0.05, 'shock'], [K.night - 0.1, 'cold'], [K.strange - 0.1, 'curious'],
      [K.planet - 0.05, 'wow'], [K.depends - 0.05, 'happy'], [K.depends + 1.1, 'home'], [K.subscribe + 0.75, 'yay'], [K.whatif + 0.35, 'home']]);
    const lookBall = t >= K.strange ? kfs(t, [[K.strange, 0], [K.strange + 0.3, 0.9], [K.planet - 0.1, 0.9], [K.planet + 0.2, -0.1], [K.wider, -0.1], [K.wider + 0.3, 0.8], [K.depends + 0.2, 0.8], [K.depends + 0.6, 0]]) : 0;
    face = {
      cozy: {eyes: 'open', mouth: 'smile', lids: 1, lookY: 0.1},
      shock: {eyes: 'wide', mouth: 'o', browUp: 1},
      cold: {eyes: 'open', mouth: 'chatter', brow: -1, browUp: 0.4, lookX: Math.sin(t * 3) * 0.3},
      curious: {eyes: 'open', mouth: 'smirk', browSide: 1, lookX: lookBall},
      wow: {eyes: 'wide', mouth: 'o', browUp: 0.8, lookX: lookBall, lookY: t < K.wider ? -0.7 : 0},
      happy: {eyes: 'squeeze', mouth: 'grin'},
      home: {eyes: 'open', mouth: 'grin', lookY: kfs(t, [[K.subscribe - 0.1, 0], [K.subscribe + 0.2, -0.75], [END - 0.9, -0.75], [END - 0.5, 0]])},
      yay: {eyes: 'squeeze', mouth: 'grin'},
    }[st];
    face.blink = bump(t, K.half + 0.4, K.half + 0.56) + bump(t, K.rolled - 0.3, K.rolled - 0.14);
  }
  const earthScale = 1 + (phase2 ? 0.05 * spring(t, K.depends + 0.42, 2.2, 4) + 0.04 * spring(t, K.without, 2.5, 5) : 0.04 * spring(t, K.vanished, 2.5, 4));

  // vapour blanket + heat
  const blanket = phase2 ? Math.min(pop(t, K.vapor - 0.1, 0.45), popOut(t, K.without + 0.05, 0.35)) : 0;
  const trapped = phase2 && t > K.trapper - 0.35 && t < K.without + 0.1;
  const squigs: React.ReactNode[] = [];
  if (phase2) for (let i = 0; i < 9; i++) {
    const a = -Math.PI / 2 + (i - 4) * 0.42 + (i % 2) * 0.1;
    if (trapped) {
      const ph = ((t - K.trapper + 0.35) / 1.15 + i * 0.37) % 1;
      const out = ph < 0.5; const u = out ? ph / 0.5 : (ph - 0.5) / 0.5;
      const r = out ? lerp(R + 30, R + 78, smooth(u)) : lerp(R + 78, R + 30, smooth(u));
      const s = Math.min(1, prog(t, K.trapper - 0.35, K.trapper)) * (1 - prog(t, K.without - 0.05, K.without + 0.1)) * 0.75;
      squigs.push(<Squiggle key={i} a={a} r={r} s={s} dir={out ? 1 : -1} />);
    }
    const t0 = K.escape - 0.25 + i * 0.11 + rnd(i) * 0.1;
    if (t > t0 && t < t0 + 1.6) {
      const u = (t - t0) / 1.6; const r = R + 40 + eout(u) * 900;
      squigs.push(<Squiggle key={'e' + i} a={a + (rnd(i + 3) - 0.5) * 0.3} r={r} s={0.9 * Math.min(1, u * 6) * (1 - prog(u, 0.6, 1))} dir={1} />);
    }
  }
  // droplets rolling into the ball
  const drops: React.ReactNode[] = [];
  if (phase2) for (let i = 0; i < 9; i++) {
    const t0 = K.rolled - 0.05 + i * 0.07, d = 0.65; if (t < t0 || t > t0 + d) continue;
    const u = eio((t - t0) / d), a = rnd(i + 20) * Math.PI * 2, r0 = 120 + rnd(i + 40) * 160;
    const x0 = Math.cos(a) * r0, y0 = Math.sin(a) * r0;
    const x = lerp(x0, BALL[0], u), y = lerp(y0, BALL[1], u) - Math.sin(u * Math.PI) * (140 + rnd(i) * 80);
    drops.push(<g key={i} transform={`translate(${x} ${y})`}><WaterBall r={14 * (1 - 0.4 * u)} t={t} /></g>);
  }
  const ballGrow = phase2 ? clamp((t - (K.rolled + 0.5)) / (K.ball + 0.25 - K.rolled - 0.5)) : 0;
  const into = phase2 ? prog(t, K.depends + 0.05, K.depends + 0.5) : 0;
  let ballR = phase2 && t < K.depends + 0.5 ? BALL_R * (pop(t, K.rolled + 0.45, 0.3) * (0.45 + 0.55 * smooth(ballGrow))) : 0;
  const bx = lerp(BALL[0], 0, eio(into)), by = lerp(BALL[1], 0, eio(into)) - Math.sin(into * Math.PI) * 160;
  if (into > 0) ballR *= 1 - 0.3 * into;
  const ballPill = phase2 ? Math.min(pop(t, K.under - 0.05, 0.35), popOut(t, K.depends - 0.1, 0.25)) : 0;
  const row = phase2 ? [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => Math.min(pop(t, K.nine - 0.05 + i * 0.075, 0.28), popOut(t, K.depends - 0.05 + i * 0.03, 0.22))) : [];
  const rowBr = phase2 ? Math.min(eout(prog(t, K.wider - 0.2, K.wider + 0.3)), 1 - prog(t, K.depends - 0.05, K.depends + 0.2)) : 0;
  const pillV = phase2 ? Math.min(pop(t, K.vapor + 0.05, 0.35), popOut(t, K.without - 0.05, 0.25)) : 0;
  const pillH = phase2 ? Math.min(pop(t, K.half - 0.05, 0.35), popOut(t, K.without - 0.05, 0.25)) : 0;
  const sky = mix('#14244F', '#070C22', night);
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 45%, ${mix('#24407E', '#0C1638', night)} 0%, ${sky} 70%)`}}>
      <Layer cam={c2} z={5000}><Stars t={t} /></Layer>
      <Layer cam={c2} z={1000}>
        {blanket > 0 && <g transform={`scale(${blanket})`}>
          <circle r={R + 82} fill="rgba(150,215,255,0.32)" />
          <circle r={R + 82} fill="none" stroke="#CDEBFF" strokeWidth={6} strokeDasharray="18 16" opacity={0.9} />
        </g>}
        {squigs}
        <g transform={`scale(${earthScale})`}>
          <Earth t={t} ocean={ocean} clouds={cloudsA} desert={desert} night={night} shiver={shiver} cacti={cacti} frost={night} {...face} />
        </g>
        {pillV > 0 && <Pill x={0} y={-R - 150} text="water vapor" s={pillV} size={46} color="#1E6FC2" />}
        {pillH > 0 && <Pill x={0} y={-R - 236} text="≈ half the greenhouse effect" s={pillH} size={40} />}
        {drops}
        {ballR > 0 && <g transform={`translate(${bx} ${by})`}><WaterBall r={ballR} t={t} look={-1} happy={t > K.nine ? 1 : 0} /></g>}
        {ballPill > 0 && <g>
          <Bracket x1={BALL[0] - BALL_R} y1={BALL[1] + BALL_R + 28} x2={BALL[0] + BALL_R} y2={BALL[1] + BALL_R + 28} u={ballPill} />
          <Pill x={BALL[0]} y={BALL[1] + BALL_R + 100} text="under 1,400 km" s={ballPill} size={38} color="#1E6FC2" />
        </g>}
        {row.map((s, i) => s > 0 && <g key={i} transform={`translate(${-R + BALL_R + i * BALL_R * 2} ${ROW_Y}) scale(${s})`}>
          <circle r={BALL_R - 1} fill="rgba(63,167,245,0.55)" stroke="white" strokeWidth={4} strokeDasharray="8 6" />
        </g>)}
        {rowBr > 0 && <g>
          <Bracket x1={-R} y1={ROW_Y - BALL_R - 26} x2={R} y2={ROW_Y - BALL_R - 26} u={rowBr} />
          <Pill x={0} y={ROW_Y - BALL_R - 100} text="Earth ≈ 9× wider" s={rowBr} size={44} />
        </g>}
      </Layer>
      {!noTag && <Cta t={t} />}
      <Tag text="Earth and water ball drawn to scale" show={phase2 && !noTag ? Math.min(pop(t, K.ball, 0.3), popOut(t, K.depends + 0.2, 0.25)) : 0} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- GROUND
const PROFILE: [number, number][] = [[-5000, 0], [340, 0], [400, 40], [570, 150], [720, 300], [870, 700], [1020, 1500], [1170, 1950], [1280, 2000], [5000, 2000]];
const floorAt = (x: number) => { for (let i = 0; i < PROFILE.length - 1; i++) { const [x0, y0] = PROFILE[i], [x1, y1] = PROFILE[i + 1]; if (x <= x1) return lerp(y0, y1, (x - x0) / (x1 - x0)); } return 2000; };
const SEA0 = 22;
const Boat: React.FC<{t: number}> = () => {
  const k = useK(); const ow = 8 / k;
  return (<g>
    <path d="M 0 -10 L 0 -150" stroke={INK} strokeWidth={8 + ow * 2} strokeLinecap="round" />
    <path d="M 0 -10 L 0 -150" stroke="#8B5A2B" strokeWidth={8} strokeLinecap="round" />
    <path d="M 6 -145 L 6 -30 L 80 -30 Z" fill="white" stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
    <path d="M -90 -20 L 90 -20 L 62 20 L -62 20 Z" fill="#F0533F" stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
    <path d="M -80 -6 L 80 -6" stroke="white" strokeWidth={6} />
  </g>);
};
const Fish: React.FC<{flop: number}> = ({flop}) => {
  const k = useK(); const ow = 7 / k;
  return (<g transform={`rotate(${flop})`}>
    <path d="M 40 0 L 75 -26 L 70 0 L 75 26 Z" fill="#FFA63D" stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
    <ellipse rx={52} ry={30} fill="#FFB84D" stroke={INK} strokeWidth={ow} />
    <circle cx={-26} cy={-6} r={6} fill={INK} />
    <path d="M -46 10 Q -40 14 -34 10" stroke={INK} strokeWidth={ow * 0.6} fill="none" />
  </g>);
};
const CloudFace: React.FC<{s: number; squeeze: boolean; t: number; i: number}> = ({s, squeeze, t, i}) => {
  const k = useK(); if (s <= 0.001) return null; const ow = 8 / k;
  return (<g transform={`scale(${s * 1.6})`}>
    <Puff c={[[-80, 10, 50], [-25, -25, 66], [45, -10, 56], [95, 15, 38], [10, 25, 48], [-115, 28, 30]]} />
    {squeeze ? <g stroke={INK} strokeWidth={ow * 0.8} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M -40 -6 L -20 4 L -40 14" /><path d="M 40 -6 L 20 4 L 40 14" /></g>
      : <g fill={INK}><ellipse cx={-28} cy={4} rx={8} ry={12 * (1 - 0.9 * bump(t, 1.1 + i * 3.1 % 4, 1.26 + i * 3.1 % 4))} /><ellipse cx={28} cy={4} rx={8} ry={12} /></g>}
    <path d={squeeze ? 'M -12 32 Q 0 24 12 32' : 'M -14 28 Q 0 40 14 28'} stroke={INK} strokeWidth={ow * 0.7} fill="none" strokeLinecap="round" />
  </g>);
};
const CLOUDS_G: [number, number][] = [[-260, -1500], [480, -1230], [1180, -1640]];

export const Ground: React.FC<{t: number}> = ({t}) => {
  const cam = camAt(t, [
    [CUT1, {x: 60, y: -235, s: 1.5}], [K.sixty - 0.35, {x: 60, y: -235, s: 1.5}], [K.sixty + 0.4, {x: 20, y: -225, s: 1.72}],
    [K.person - 0.4, {x: 20, y: -225, s: 1.72}], [K.person + 0.35, {x: 105, y: -215, s: 1.38}],
    [K.shrivel + 0.75, {x: 105, y: -215, s: 1.38}], [K.oceans + 0.35, {x: 880, y: 1000, s: 0.47}],
    [K.clouds - 0.45, {x: 880, y: 1000, s: 0.47}], [K.clouds + 0.3, {x: 520, y: -650, s: 0.56}], [CUT2 + 1, {x: 520, y: -650, s: 0.56}]]);
  const LV0 = K.oceans + 0.3, LV1 = Math.max(K.basins + 0.95, LV0 + 1.3);
  const lvl = kfs(t, [[LV0, SEA0], [LV1, 2080]], eio);
  // character
  const shr = kfs(t, [[K.shrivel - 0.05, 0], [K.shrivel + 0.4, 1]], eio);
  const water = kfs(t, [[K.sixty - 0.15, 0], [K.sixty + 0.75, 0.6], [K.shrivel - 0.05, 0.6], [K.shrivel + 0.35, 0]]);
  const wAlpha = Math.min(1, prog(t, K.sixty - 0.25, K.sixty - 0.05)) * (1 - prog(t, K.shrivel + 0.25, K.shrivel + 0.45));
  const scared = t >= K.survive - 0.08 && t < K.sixty - 0.3;
  const handsUp = kfs(t, [[K.survive - 0.15, 0], [K.survive + 0.1, 1], [K.sixty - 0.45, 1], [K.sixty - 0.15, 0]]);
  const lookDown = kfs(t, [[K.sixty - 0.1, 0], [K.sixty + 0.2, 1], [K.body + 0.4, 1], [K.body + 0.7, 0]]);
  const lookSea = kfs(t, [[K.oceans, 0], [K.oceans + 0.4, 1]]);
  const lookUp = kfs(t, [[K.clouds - 0.4, 0], [K.clouds - 0.1, 1]]);
  const breath = 1 + 0.008 * Math.sin(2 * Math.PI * 0.6 * t);
  const squashHit = spring(t, K.shrivel + 0.35, 3, 6) * 0.06;
  const pose = {
    t, id: 'guy', water, waterAlpha: wAlpha, shrivel: shr,
    sx: lerp(1, 0.84, shr) * (1 + squashHit), sy: lerp(1, 0.6, shr) * breath * (1 - squashHit),
    eyes: (shr > 0.3 ? 'squeeze' : scared ? 'wide' : 'dot') as any,
    mouth: (shr > 0.3 ? 'wavy' : scared ? 'o' : t >= K.sixty - 0.1 && t < K.body + 0.2 ? 'o' : 'smile') as any,
    browUp: scared ? 1 : lookDown * 0.5, brow: shr > 0.3 ? -1 : 0,
    faceDy: lookDown * 14 - lookUp * 18, lookY: lookDown * 5 - lookUp * 5, faceDx: lookSea * 18 * (1 - lookUp), lookX: lookSea * 6 * (1 - lookUp),
    blink: bump(t, CUT1 + 0.3, CUT1 + 0.46) + bump(t, K.plant - 0.2, K.plant - 0.04),
    handL: [lerp(-98, -120, handsUp), lerp(-112, -300, handsUp)] as [number, number],
    handR: [lerp(98, 120, handsUp), lerp(-112, -300, handsUp)] as [number, number],
    sweat: Math.min(pop(t, K.survive + 0.1, 0.3), popOut(t, K.sixty - 0.4, 0.2)) + Math.min(pop(t, K.oceans + 0.6, 0.3), popOut(t, K.clouds - 0.3, 0.2)),
  };
  const droop = kfs(t, [[K.shrivel - 0.02, 0], [K.shrivel + 0.5, 1]], eio);
  const pill60 = Math.min(pop(t, K.sixty, 0.35), popOut(t, K.person - 0.3, 0.25));
  // boat & fish
  const boatX = 720, boatFloor = floorAt(boatX) - 18;
  const boatY = Math.min(lvl - 2, boatFloor), grounded = lvl - 2 >= boatFloor;
  const tg = LV0 + 0.45;
  const boatRot = grounded ? 16 + spring(t, tg, 2, 4) * 6 : Math.sin(t * 2.4) * 3;
  const fishX = 1450, fishFloor = 2000 - 26;
  const fishY = Math.min(Math.max(900 + Math.sin(t * 2) * 20, lvl + 60), fishFloor);
  const fishDown = fishY >= fishFloor - 0.5;
  const flop = fishDown ? Math.sin(t * 9) * 25 * (bump(t, LV1 - 0.2, LV1 + 0.9) + 0.15) + 85 : Math.sin(t * 4) * 8;
  const deepPill = pop(t, K.three - 0.05, 0.35);
  const labelsOut = popOut(t, K.clouds - 0.5, 0.25);
  const bracketU = eout(prog(t, K.three - 0.2, K.three + 0.4));
  const cloudS = [0, 1, 2].map((i) => popOut(t, K.disappear + 0.05 + i * 0.12, 0.32));
  const squeeze = t >= K.disappear - 0.25;
  const landD = PROFILE.map(([x, y], i) => `${i ? 'L' : 'M'} ${x} ${y}`).join(' ');
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#7CC8FF 0%, #BDE6FF 60%, #DDF3FF 100%)'}}>
      <Layer cam={cam} z={1600}>
        {CLOUDS_G.map(([x, y], i) => <g key={i} transform={`translate(${x + Math.sin(t * 0.5 + i) * 10} ${y})`}><CloudFace s={cloudS[i]} squeeze={squeeze} t={t} i={i} /></g>)}
        {[0, 1, 2].map((i) => { const u = prog(t, K.disappear + 0.3 + i * 0.12, K.disappear + 0.75 + i * 0.12);
          return u > 0 && u < 1 && <Sparkle key={i} x={CLOUDS_G[i][0]} y={CLOUDS_G[i][1]} r={90 * Math.sin(u * Math.PI)} />; })}
      </Layer>
      <Layer cam={cam} z={1000}>
        <defs><clipPath id="basin"><path d={`${landD} L 5000 -3000 L -5000 -3000 Z`} /></clipPath></defs>
        <g clipPath="url(#basin)">
          <rect x={300} y={lvl} width={4700} height={2200} fill={WATER} />
          <rect x={300} y={lvl} width={4700} height={10} fill="#BFE6FF" />
          {lvl < 1990 && [0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M ${700 + i * 420 + Math.sin(t + i) * 20} ${lvl + 60 + (i % 2) * 70} q 20 -14 40 0 t 40 0`} stroke="#BFE6FF" strokeWidth={6} fill="none" strokeLinecap="round" />)}
        </g>
        <path d={`${landD} L 5000 4000 L -5000 4000 Z`} fill="#C9905C" />
        <path d={`M -5000 0 L 350 0`} stroke="#9AD36B" strokeWidth={40} />
        <path d={landD} fill="none" stroke={INK} strokeWidth={9 / 0.5} strokeLinejoin="round" />
        {[[ -300, 260, 36], [ 200, 520, 28], [1500, 2380, 44], [2200, 2600, 36], [700, 900, 30]].map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y} rx={r * 1.6} ry={r} fill="#B37C49" />)}
        {lvl > SEA0 + 40 && labelsOut > 0 && <g opacity={clamp((lvl - 200) / 300) * labelsOut}>
          <path d={`M 360 ${SEA0} L 5000 ${SEA0}`} stroke="white" strokeWidth={9} strokeDasharray="40 30" />
          <Pill x={1350} y={SEA0 - 85} text="old sea level" s={1} size={34} />
        </g>}
        <Bracket x1={1790} y1={SEA0} x2={1790} y2={2000} u={bracketU * labelsOut} />
        {deepPill > 0 && <Pill x={1300} y={980} text="avg ≈ 3.7 km deep" s={deepPill * labelsOut} size={46} />}
        <g transform={`translate(${boatX} ${boatY}) rotate(${boatRot})`}><Boat t={t} /></g>
        <g transform={`translate(${fishX} ${fishY})`}><Fish flop={flop} /></g>
        <g transform="translate(225 0)"><Flower droop={droop} t={t} /></g>
        <Character {...pose} />
        {pill60 > 0 && <Pill x={20} y={-480} text="up to 60% water" s={pill60} size={44} color="#1E6FC2" />}
      </Layer>
      <Tag text="not to scale" show={Math.min(pop(t, K.basins, 0.3), popOut(t, K.clouds - 0.3, 0.25))} />
    </AbsoluteFill>
  );
};


// ---------------------------------------------------------------- subscribe call to action
const Cta: React.FC<{t: number}> = ({t}) => {
  const t0 = K.subscribe - 0.12, click = K.never + 0.05, out = END - 0.75;
  const sIn = pop(t, t0, 0.4), sOut = popOut(t, out, 0.3); const s = Math.min(sIn, sOut);
  if (s <= 0.001) return null;
  const done = t >= click;
  const press = 1 - 0.1 * bump(t, click - 0.06, click + 0.1) + 0.07 * spring(t, click + 0.1, 3, 6);
  const bellA = t >= K.next - 0.05 ? spring(t, K.next - 0.05, 4, 3.5) * 28 : 0;
  // cursor: flies in from lower right, lands on the button at the click, then leaves
  const cu = eio(prog(t, t0 + 0.25, click - 0.05)), cl = ein(prog(t, click + 0.35, click + 0.8));
  const cx = lerp(980, 640, cu) + cl * 420, cy = lerp(760, 452, cu) + cl * 260;
  const csc = 1 - 0.15 * bump(t, click - 0.06, click + 0.1);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 360, display: 'flex', justifyContent: 'center', transform: `scale(${s * press})`, transformOrigin: '540px 70px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
          <div style={{background: done ? '#4A4A4A' : '#E52D27', color: 'white', fontFamily: 'Inter', fontWeight: 900, fontSize: 64, letterSpacing: 1,
            padding: '22px 46px', borderRadius: 26, border: '7px solid #111', boxShadow: '0 9px 0 #111'}}>{done ? 'SUBSCRIBED ✓' : 'SUBSCRIBE'}</div>
          <svg width={116} height={116} viewBox="-58 -58 116 116" style={{overflow: 'visible'}}>
            <circle r={52} fill="white" stroke="#111" strokeWidth={7} />
            <g transform={`rotate(${bellA}) translate(0 -2)`}>
              <path d="M -24 16 C -24 -6 -22 -26 0 -28 C 22 -26 24 -6 24 16 L 30 22 L -30 22 Z" fill={done ? '#FFD23F' : '#DDD'} stroke="#111" strokeWidth={6} strokeLinejoin="round" />
              <circle cy={-31} r={5} fill="#111" /><circle cy={28} r={7} fill="#111" />
            </g>
            {bellA !== 0 && [-1, 1].map((d) => <path key={d} d={`M ${d * 40} -20 q ${d * 8} 14 0 28`} stroke="#111" strokeWidth={5} fill="none" strokeLinecap="round" opacity={Math.min(1, Math.abs(bellA) / 10)} />)}
          </svg>
        </div>
      </div>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const u = prog(t, click + 0.02, click + 0.55); if (u <= 0 || u >= 1) return null;
        const a = i * Math.PI / 4 + 0.3, r = 150 + eout(u) * 190;
        return <svg key={i} width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}><g transform={`translate(${540 + Math.cos(a) * r * 1.6} ${430 + Math.sin(a) * r * 0.6})`}>
          <path d={`M 0 -24 Q 6 -6 24 0 Q 6 6 0 24 Q -6 6 -24 0 Q -6 -6 0 -24 Z`} transform={`scale(${Math.sin(u * Math.PI)})`} fill="#FFE14D" stroke="#111" strokeWidth={5} strokeLinejoin="round" /></g></svg>;
      })}
      {t > t0 + 0.2 && cl < 1 && <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <g transform={`translate(${cx} ${cy}) scale(${csc * 1.5})`}>
          <path d="M 0 0 L 0 46 L 12 35 L 21 55 L 30 51 L 21 32 L 37 32 Z" fill="white" stroke="#111" strokeWidth={4.5} strokeLinejoin="round" />
        </g></svg>}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- composition
export const Water: React.FC<{voice?: boolean; captions?: boolean}> = ({voice = false, captions = true}) => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps;
  return (
    <AbsoluteFill style={{background: '#14244F'}}>
      {t < CUT1 || t >= CUT2 ? <Space t={t} /> : <Ground t={t} />}
      {captions && <Captions t={t} />}
      <Audio src={staticFile('water/sfx.wav')} volume={0.42} />
      {voice && <Sequence from={Math.round(Math.max(0, T.voiceOffset) * fps)} layout="none"><Audio src={staticFile('water/vo.wav')} /></Sequence>}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- thumbnails
export const Thumb: React.FC<{variant: 'A' | 'B' | 'C'}> = ({variant}) => {
  const cfg = {
    A: {t: K.vanished + 0.38, ground: false, l1: 'ALL WATER', l2: 'GONE?', tag: ''},
    B: {t: K.shrivel + 0.75, ground: true, l1: 'NO WATER?', l2: "YOU'D SHRIVEL", tag: ''},
    C: {t: K.under + 0.7, ground: false, l1: "ALL EARTH'S WATER", l2: 'THIS SMALL?', tag: 'drawn to scale'},
  }[variant];
  return (
    <AbsoluteFill>
      {cfg.ground ? <Ground t={cfg.t} /> : <Space t={cfg.t} noTag />}
      <AbsoluteFill style={{top: 250, height: 330, bottom: 'auto', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
        {[cfg.l1, cfg.l2].map((l, i) => <div key={i} style={{fontFamily: 'Inter', fontWeight: 900, fontSize: l.length > 12 ? 92 : 118, lineHeight: 1.04, whiteSpace: 'nowrap',
          color: i ? '#FFE14D' : 'white', WebkitTextStroke: '28px #111', paintOrder: 'stroke fill', textAlign: 'center', width: 900,
          filter: 'drop-shadow(0 8px 0 rgba(0,0,0,0.35))', letterSpacing: -1}}>{l}</div>)}
      </AbsoluteFill>
      {cfg.tag && <AbsoluteFill style={{top: 1560, height: 70, bottom: 'auto', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontFamily: 'Inter', fontWeight: 800, fontSize: 36, color: 'white', background: 'rgba(17,17,17,0.75)', padding: '8px 24px', borderRadius: 40}}>{cfg.tag}</div>
      </AbsoluteFill>}
    </AbsoluteFill>
  );
};
