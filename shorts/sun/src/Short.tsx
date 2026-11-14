import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import timing from './timing.json';
import {Layer, Scale, useK} from './Layer';
import {Captions} from './Captions';
import {Character} from './Character';
import {Earth, R} from './Earth';
import {Sun, SR} from './Sun';
import {Pill, Puff, Sparkle} from './Bits';
import {INK, WATER, WATER_DEEP, mix} from './color';
import {Cam, bump, clamp, eio, ein, eout, kfs, lerp, pick, pop, popOut, prog, rnd, spring} from './math';

const T = timing as any;
const K = T.keys as Record<string, number>;
const S = T.sentences as {start: number; end: number}[];
export const DURATION = T.duration as number;
const END = DURATION;
const TV = K.vanished;               // the Sun pops
const TF = K.dark;                   // last light + last gravity reach Earth
const S2 = S[2].start;               // "Earth would even keep circling"
const RET = S[5].end + 0.05;          // everything comes back
const D = 560;                       // orbit radius (drawing units, not to scale)
const ES = 0.42;                     // Earth drawing scale
const ER = R * ES;
const TH0 = Math.PI / 2, SWEEP = (135 * Math.PI) / 180;
const P0: [number, number] = [D * Math.cos(TH0 + SWEEP), D * Math.sin(TH0 + SWEEP)];
const DIR: [number, number] = [-Math.sin(TH0 + SWEEP), Math.cos(TH0 + SWEEP)];
const SPEED = (D * SWEEP) / TF;      // same speed on the orbit and on the straight line

const earthPos = (t: number): [number, number] => {
  if (t <= TF) { const a = TH0 + (SWEEP * t) / TF; return [D * Math.cos(a), D * Math.sin(a)]; }
  const fx = P0[0] + DIR[0] * SPEED * (t - TF), fy = P0[1] + DIR[1] * SPEED * (t - TF);
  const u = eio(prog(t, RET, RET + 1.0));
  return [lerp(fx, 0, u), lerp(fy, D, u)];
};
const camera = (t: number): Cam => {
  const f = kfs(t, [[K.so - 0.4, 0], [K.so + 0.6, 1], [S2 - 0.35, 1], [S2 + 0.75, 0], [K.flies - 0.2, 0], [K.flies + 1.0, 1], [RET, 1], [RET + 1.0, 0]], eio);
  const wideS = kfs(t, [[S2 - 0.35, Math.log(0.82)], [S2 + 0.75, Math.log(0.74)], [K.flies + 1.2, Math.log(0.74)], [K.flies + 2.2, Math.log(0.82)]], eio);
  const wideY = kfs(t, [[S2 - 0.35, 250], [S2 + 0.75, 120], [K.flies + 1.2, 120], [K.flies + 2.2, 250]], eio);
  const ls = kfs(t, [[S2 + 1, Math.log(1.25)], [S2 + 1.01, Math.log(1.05)], [K.week - 0.45, Math.log(1.05)], [K.week + 0.45, Math.log(1.42)],
    [K.oceans - 0.3, Math.log(1.42)], [K.oceans + 0.7, Math.log(1.25)]], eio);
  const sx = kfs(t, [[K.week - 0.45, 540], [K.week + 0.45, 430], [K.oceans - 0.3, 430], [K.oceans + 0.7, 540]], eio);
  const sy = kfs(t, [[S2 + 1, 1110], [S2 + 1.01, 1000], [K.week - 0.45, 1000], [K.week + 0.45, 1010], [K.oceans - 0.3, 1010], [K.oceans + 0.7, 1110]], eio);
  const sf = Math.exp(ls); const [ex, ey] = earthPos(t);
  const s = Math.exp(lerp(wideS, ls, f));
  return {x: lerp(0, ex - (sx - 540) / sf, f), y: lerp(wideY, ey - (sy - 960) / sf, f), z: 1000 - 1000 / s};
};

// ---------------------------------------------------------------- pieces
const Stars: React.FC<{t: number}> = ({t}) => {
  const k = useK();
  return (<g>{Array.from({length: 150}, (_, i) => {
    const x = (rnd(i) - 0.5) * 9000, y = (rnd(i + 99) - 0.5) * 14000, r = 2 + rnd(i + 7) * 4;
    const tw = 0.55 + 0.45 * Math.sin((2 * Math.PI * (3 + (i % 4)) * t) / END + i);
    return <circle key={i} cx={x} cy={y} r={(r * 0.9) / k} fill="#FFF7D6" opacity={tw} />;
  })}</g>);
};
export const Tag: React.FC<{text: string; show: number}> = ({text, show}) => show <= 0 ? null : (
  <AbsoluteFill style={{top: 250, height: 80, bottom: 'auto', alignItems: 'center', justifyContent: 'center'}}>
    <div style={{fontFamily: 'Inter', fontWeight: 800, fontSize: 34, color: 'white', background: 'rgba(17,17,17,0.72)',
      padding: '8px 22px', borderRadius: 40, transform: `scale(${show})`, letterSpacing: 0.3}}>{text}</div>
  </AbsoluteFill>);
const TimePill: React.FC<{text: string; sub?: string; s: number; hot?: boolean}> = ({text, sub, s, hot}) => s <= 0.001 ? null : (
  <AbsoluteFill style={{top: 338, height: 100, bottom: 'auto', alignItems: 'center', justifyContent: 'center'}}>
    <div style={{display: 'flex', alignItems: 'baseline', gap: 16, background: 'white', border: '7px solid #151515', borderRadius: 60,
      padding: '4px 34px 8px', transform: `scale(${s})`, fontFamily: 'Inter', whiteSpace: 'nowrap'}}>
      <span style={{fontWeight: 900, fontSize: 58, color: hot ? '#E52D27' : '#151515', fontVariantNumeric: 'tabular-nums'}}>{text}</span>
      {sub && <span style={{fontWeight: 800, fontSize: 30, color: '#555'}}>{sub}</span>}
    </div>
  </AbsoluteFill>);
const Thermo: React.FC<{level: number}> = ({level}) => {
  const k = useK(); const ow = 8 / k; const H = 230, W = 40, ZERO = 0.45;
  const y = (u: number) => -H * u; const cold = level < ZERO; const col = cold ? '#4AA8FF' : '#F0533F';
  return (<g>
    <rect x={-W / 2 - ow} y={-H - 18 - ow} width={W + ow * 2} height={H + 30 + ow * 2} rx={W / 2 + ow} fill={INK} />
    <circle cy={34} r={40 + ow} fill={INK} />
    <rect x={-W / 2} y={-H - 18} width={W} height={H + 30} rx={W / 2} fill="white" />
    <circle cy={34} r={40} fill={col} />
    <rect x={-11} y={y(level)} width={22} height={H * level + 20} rx={11} fill={col} />
    <ellipse cx={-14} cy={22} rx={8} ry={12} fill="white" opacity={0.75} />
    {[0.15, 0.3, 0.6, 0.75, 0.9].map((u) => <path key={u} d={`M ${W / 2 - 14} ${y(u)} h 10`} stroke={INK} strokeWidth={ow * 0.5} strokeLinecap="round" />)}
    <path d={`M ${W / 2 - 16} ${y(ZERO)} h 46`} stroke={INK} strokeWidth={ow * 0.8} strokeLinecap="round" />
    <text x={W / 2 + 40} y={y(ZERO) + 12 / k} fontFamily="Inter" fontWeight={900} fontSize={36 / k} fill="white" stroke={INK} strokeWidth={9 / k} paintOrder="stroke fill" strokeLinejoin="round">0°C</text>
  </g>);
};
const Fish: React.FC = () => (<g>
  <path d="M 40 0 L 75 -26 L 70 0 L 75 26 Z" fill="#FFA63D" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
  <ellipse rx={52} ry={30} fill="#FFB84D" stroke={INK} strokeWidth={7} />
  <circle cx={-26} cy={-6} r={6} fill={INK} />
  <path d="M -46 8 Q -38 17 -29 10" stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />
</g>);
const HeatUp: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => {
  if (s <= 0.01) return null;
  const d = 'M 0 30 q -12 -10 0 -20 t 0 -20 t 0 -20', head = 'M -13 -26 L 0 -46 L 13 -26 Z';
  return (<g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d={d} stroke={INK} strokeWidth={19} fill="none" strokeLinecap="round" /><path d={head} fill={INK} stroke={INK} strokeWidth={9} strokeLinejoin="round" />
    <path d={d} stroke="#FF7A2B" strokeWidth={10} fill="none" strokeLinecap="round" /><path d={head} fill="#FF7A2B" /></g>);
};
const BUB: [number, number] = [540, 656]; const BR = 215;
/** round screen-space inset (a thought bubble from Earth) */
const Bubble: React.FC<{s: number; id: string; children?: React.ReactNode}> = ({s, id, children}) => s <= 0.001 ? null : (
  <AbsoluteFill><svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute'}}>
    <circle cx={BUB[0] - 26} cy={BUB[1] + BR + 34} r={19 * Math.min(1, s)} fill="white" stroke={INK} strokeWidth={8} />
    <circle cx={BUB[0] - 12} cy={BUB[1] + BR + 72} r={10 * Math.min(1, s)} fill="white" stroke={INK} strokeWidth={7} />
    <g transform={`translate(${BUB[0]} ${BUB[1]}) scale(${s})`}>
      <clipPath id={id}><circle r={BR} /></clipPath>
      <circle r={BR + 9} fill={INK} />
      <g clipPath={`url(#${id})`}>{children}</g>
      <circle r={BR} fill="none" stroke={INK} strokeWidth={9} />
    </g>
  </svg></AbsoluteFill>);
const SkyView: React.FC<{t: number}> = ({t}) => (<g>
  <rect x={-240} y={-240} width={480} height={480} fill="#7CC8FF" />
  <g transform="translate(112 -128) scale(0.62)"><Puff c={[[-38, 6, 26], [-8, -10, 34], [28, -2, 28], [50, 10, 20], [8, 14, 24], [-56, 16, 16]]} ow={11} /></g>
  <g transform="translate(-82 -84)"><Scale s={0.3}><Sun t={t} id="bsun" lookX={0.6} lookY={0.6} blink={bump(t, K.keep + 0.6, K.keep + 0.76)} /></Scale></g>
  <ellipse cx={0} cy={335} rx={390} ry={205} fill="#7FD05A" stroke={INK} strokeWidth={9} />
  <g transform="translate(64 152)"><Scale s={0.52}>
    <Character id="bguy" t={t} mouth="grin" faceDx={-16} faceDy={-12} lookX={-5} lookY={-5} browUp={0.6}
      handL={[-118 + Math.sin(t * 10) * 16, -318]} blink={bump(t, K.sky - 0.1, K.sky + 0.06)} />
  </Scale></g>
</g>);
const SeaView: React.FC<{t: number}> = ({t}) => {
  const hs = pop(t, K.warmed - 0.05, 0.3); const ph0 = (t - K.warmed) * 0.8;
  const fx = Math.sin(t * 1.3) * 78, right = Math.cos(t * 1.3) > 0;
  return (<g>
    <rect x={-240} y={-240} width={480} height={480} fill="#101B45" />
    {[[-120, -150, 5], [-30, -185, 4], [70, -140, 6], [150, -110, 4], [-170, -105, 4]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#FFF7D6" />)}
    <rect x={-240} y={-10} width={480} height={160} fill={WATER} />
    <rect x={-240} y={72} width={480} height={80} fill={WATER_DEEP} />
    <path d="M -250 -74 q 40 -9 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 L 250 -6 q -30 12 -62 0 t -62 0 t -62 0 t -62 0 t -62 0 t -62 0 t -62 0 t -62 0 Z" fill="#E6F5FF" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <path d="M -150 -44 l 26 -8 l 16 10 M 40 -36 l 30 -9 M 130 -50 l 18 8 l 22 -6" stroke="#9CC9E8" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    {[0, 1, 2].map((i) => { const ph = (((ph0 + i * 0.33) % 1) + 1) % 1; return <HeatUp key={i} x={-112 + i * 112} y={lerp(120, 44, ph)} s={hs * Math.sin(Math.PI * ph) * 0.8} />; })}
    <path d="M -250 150 L -250 138 q 40 -22 90 -8 t 90 4 t 90 -10 t 90 8 t 90 -6 L 250 250 L -250 250 Z" fill="#B37C49" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <g transform={`translate(${fx} ${78 + Math.sin(t * 2.3) * 7}) scale(${right ? -0.58 : 0.58} 0.58)`}><Fish /></g>
    <Pill x={112} y={-110} text="ice" size={30} />
    <Pill x={-52} y={24} text="liquid water" size={30} color="#1E6FC2" />
  </g>);
};

// ---------------------------------------------------------------- the scene (one continuous shot)
export const Scene: React.FC<{t: number; thumb?: boolean}> = ({t, thumb}) => {
  const cam = camera(t);
  const shake = bump(t, TV, TV + 0.5) * 5 + bump(t, TF, TF + 0.5) * 4;
  const c2 = {...cam, x: cam.x + shake * Math.sin(t * 83), y: cam.y + shake * Math.sin(t * 61)};
  const [ex, ey] = earthPos(t);
  // light: a dark hole spreads from the empty spot at light speed; it reaches Earth at TF
  const rF = t < TV ? 0 : (D * (t - TV)) / (TF - TV);
  const rN = t < RET + 0.25 ? 0 : eout(prog(t, RET + 0.25, RET + 1.25)) * 2800;
  const ringW = Math.min(pop(t, TV + 0.08, 0.3), popOut(t, RET, 0.3));
  const gravW = pop(t, K.gravity - 0.1, 0.4);
  const night = kfs(t, [[TF - 0.03, 0], [TF + 0.35, 1], [RET + 0.35, 1], [RET + 0.85, 0]]);
  // the Sun
  const sunS = t < RET ? (1 + 0.06 * bump(t, TV - 0.28, TV)) * popOut(t, TV, 0.28) : pop(t, RET + 0.2, 0.45);
  const sunFace = t < TV + 0.5 ? (t < TV - 0.32 ? {} : {eyes: 'wide' as const, mouth: 'o' as const, browUp: 1})
    : (t < RET + 1.1 ? {eyes: 'squeeze' as const} : {});
  const sunLook = t < TV ? kfs(t, [[TV - 0.4, 0.7], [TV - 0.25, 0]])
    : kfs(t, [[RET + 1.2, 0.7], [K.subscribe + 0.3, 0.7], [K.subscribe + 0.6, -0.8], [END - 0.9, -0.8], [END - 0.5, 0.7]]);
  const spotS = Math.min(pop(t, TV + 0.16, 0.35), popOut(t, RET + 0.15, 0.25));
  const spotPill = Math.min(pop(t, K.empty - 0.05, 0.35), popOut(t, K.flies + 0.25, 0.25));
  const lightPill = Math.min(pop(t, K.light - 0.05, 0.35), popOut(t, K.so - 0.25, 0.25)) + Math.min(pop(t, S2 + 0.75, 0.35), popOut(t, K.speed - 0.15, 0.25));
  const gravPill = Math.min(pop(t, K.gravity - 0.05, 0.35), popOut(t, K.speed - 0.15, 0.25));
  // Earth
  const shiver = kfs(t, [[K.week - 0.1, 0], [K.week + 0.25, 0.75], [RET, 0.75], [RET + 0.3, 0]]);
  const frost = kfs(t, [[K.temperature - 0.1, 0], [K.temperature + 0.4, 1], [RET + 0.2, 1], [RET + 0.6, 0]]);
  const ice = kfs(t, [[K.freeze - 0.1, 0], [K.freeze + 0.8, 1], [RET + 0.4, 1], [RET + 1.1, 0]]);
  const st = pick<string>(t, [[0, 'home'], [TV + 0.25, 'oblivious'], [K.notice - 0.12, 'cozy'], [K.light - 0.1, 'curious'], [K.keep - 0.05, 'happy'],
    [S2 - 0.2, 'cruise'], [TF, 'shock'], [K.week - 0.05, 'cold'], [K.warmed - 0.05, 'hope'], [RET + 0.3, 'yay'], [RET + 1.2, 'home']]);
  const face: any = {
    home: {eyes: 'open', mouth: 'grin', lookY: -0.75},
    oblivious: {eyes: 'open', mouth: 'grin', lookY: kfs(t, [[TV + 0.25, -0.75], [TV + 0.5, 0]])},
    cozy: {eyes: 'open', mouth: 'smile', lids: 1, lookY: 0.1},
    curious: {eyes: 'open', mouth: 'smirk', browSide: 1, lookY: -0.75, lookX: 0.2},
    happy: {eyes: 'open', mouth: 'grin', lookY: -0.85},
    cruise: {eyes: 'open', mouth: 'smile', lids: 0.6, lookX: kfs(t, [[S2, 0], [S2 + 0.5, -0.5], [K.gravity - 0.2, -0.5], [K.gravity + 0.2, 0.8]]), lookY: kfs(t, [[K.gravity - 0.2, 0], [K.gravity + 0.2, 0.3]])},
    shock: {eyes: 'wide', mouth: 'o', browUp: 1, lookX: kfs(t, [[K.flies - 0.1, 0], [K.flies + 0.3, 0.7]]), lookY: kfs(t, [[K.flies - 0.1, 0], [K.flies + 0.3, -0.6]])},
    cold: {eyes: 'open', mouth: 'chatter', brow: -1, browUp: 0.4,
      lookX: kfs(t, [[K.week, 0], [K.week + 0.4, 0.9], [K.oceans - 0.2, 0.9], [K.oceans + 0.2, 0]]), lookY: kfs(t, [[K.liquid - 0.1, 0], [K.liquid + 0.2, -0.85]])},
    hope: {eyes: 'open', mouth: 'smile', brow: -1, browUp: 0.5, lookY: -0.85},
    yay: {eyes: 'squeeze', mouth: 'grin'},
  }[st];
  face.blink = bump(t, TV + 0.3, TV + 0.46) + bump(t, K.reach, K.reach + 0.16) + bump(t, K.circling + 0.3, K.circling + 0.46) + bump(t, K.thirty + 0.5, K.thirty + 0.66);
  const earthScale = 1 + 0.06 * spring(t, TF, 2.5, 4) + 0.05 * spring(t, RET + 0.4, 2.2, 4);
  // labels + props around Earth
  const trail = t > TF ? Math.min(1, popOut(t, RET, 0.3)) : 0;
  const arrow = Math.min(pop(t, K.straight - 0.05, 0.3), popOut(t, K.week - 0.35, 0.25));
  const speedPill = Math.min(pop(t, K.thirty - 0.05, 0.35), popOut(t, K.week - 0.35, 0.25));
  const thS = Math.min(pop(t, K.week + 0.2, 0.35), popOut(t, K.oceans - 0.15, 0.25));
  const thLevel = kfs(t, [[K.temperature - 0.1, 0.82], [K.freezing + 0.25, 0.2]], eio);
  // screen overlays
  const tu = clamp((t - TV) / (TF - TV)); const sec = Math.round(500 * tu);
  const timerS = Math.min(pop(t, K.eight - 0.05, 0.35), popOut(t, K.flies + 0.7, 0.25)) * (1 + 0.12 * bump(t, TF, TF + 0.3));
  const weekS = Math.min(pop(t, K.week - 0.05, 0.35), popOut(t, K.oceans - 0.1, 0.25));
  const yearsS = Math.min(pop(t, K.thousands - 0.05, 0.35), popOut(t, RET - 0.05, 0.25));
  const bub1 = Math.min(pop(t, K.keep - 0.1, 0.4), popOut(t, S2 - 0.3, 0.25));
  const bub2 = Math.min(pop(t, K.liquid - 0.15, 0.4), popOut(t, RET - 0.1, 0.25));
  const tagS = Math.min(pop(t, TV + 0.3, 0.3), popOut(t, RET, 0.25));
  const la = (-55 * Math.PI) / 180, ga = (60 * Math.PI) / 180;
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 45%, ${mix('#24407E', '#0C1638', night)} 0%, ${mix('#14244F', '#070C22', night)} 70%)`}}>
      <Layer cam={c2} z={5000}><Stars t={t} /></Layer>
      <Layer cam={c2} z={1000}>
        <defs>
          <radialGradient id="sunglow"><stop offset="0" stopColor="#FFD75E" stopOpacity={0.62} /><stop offset="0.3" stopColor="#FFCB4A" stopOpacity={0.3} />
            <stop offset="0.65" stopColor="#FFC23C" stopOpacity={0.1} /><stop offset="1" stopColor="#FFC23C" stopOpacity={0} /></radialGradient>
          <mask id="lit" maskUnits="userSpaceOnUse" x={-3000} y={-3000} width={6000} height={6000}>
            <circle r={2900} fill="white" />{rF > 0 && <circle r={rF} fill="black" />}{rN > 0 && <circle r={rN} fill="white" />}
          </mask>
        </defs>
        <circle r={1500} fill="url(#sunglow)" mask="url(#lit)" />
        <circle r={D} fill="none" stroke="white" strokeWidth={5 / useKLayer(c2)} strokeDasharray="6 26" strokeLinecap="round" opacity={0.5} />
        {trail > 0 && <path d={`M ${P0[0]} ${P0[1]} L ${ex} ${ey}`} stroke="#FFE14D" strokeWidth={(7 * trail) / useKLayer(c2)} strokeDasharray="22 22" strokeLinecap="round" />}
        {spotS > 0 && <g transform={`scale(${spotS})`}><circle r={SR} fill="rgba(7,12,34,0.35)" stroke="white" strokeWidth={7 / useKLayer(c2)} strokeDasharray="20 18" strokeLinecap="round" /></g>}
        {ringW > 0 && rF > 4 && <g fill="none">
          <circle r={rF} stroke={INK} strokeWidth={(22 * ringW) / useKLayer(c2)} /><circle r={rF} stroke="#FFE14D" strokeWidth={(11 * ringW) / useKLayer(c2)} />
          {gravW > 0 && rF > 40 && <g><circle r={rF - 26 / useKLayer(c2)} stroke={INK} strokeWidth={(20 * gravW) / useKLayer(c2)} />
            <circle r={rF - 26 / useKLayer(c2)} stroke="#C09BFF" strokeWidth={(10 * gravW) / useKLayer(c2)} strokeDasharray="34 20" /></g>}
        </g>}
        {sunS > 0.001 && <g transform={`scale(${sunS})`}><Sun t={t} lookY={sunLook} {...sunFace} /></g>}
        {t > TV && t < TV + 0.5 && [0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const u = prog(t, TV + 0.02, TV + 0.5), a = i * Math.PI / 4 + 0.2, r = 120 + eout(u) * 230;
          return <Sparkle key={i} x={Math.cos(a) * r} y={Math.sin(a) * r} r={34 * Math.sin(u * Math.PI)} fill="#FFE14D" />; })}
        {spotPill > 0 && <Pill x={0} y={SR + 78} text="empty spot" s={spotPill} size={38} />}
        {lightPill > 0 && <Pill x={Math.cos(la) * (rF + 105)} y={Math.sin(la) * (rF + 105)} text="last sunlight" s={Math.min(1.2, lightPill)} size={36} color="#B07A00" />}
        {gravPill > 0 && <Pill x={Math.cos(ga) * (rF + 100)} y={Math.sin(ga) * (rF + 100)} text="last gravity" s={gravPill} size={36} color="#6B3FD1" />}
        <g transform={`translate(${ex} ${ey})`}>
          {arrow > 0 && <g transform={`rotate(${Math.atan2(DIR[1], DIR[0]) * 57.2958}) translate(${ER + 44} 0) scale(${arrow})`}>
            <path d="M 0 0 L 92 0 M 62 -30 L 100 0 L 62 30" stroke={INK} strokeWidth={30 / useKLayer(c2)} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 0 0 L 92 0 M 62 -30 L 100 0 L 62 30" stroke="white" strokeWidth={14 / useKLayer(c2)} fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>}
          <g transform={`scale(${earthScale})`}><Scale s={ES}>
            <Earth t={t} ocean={1} clouds={[1, 1, 1]} night={night} shiver={shiver} frost={frost} ice={ice} {...face} />
          </Scale></g>
          {speedPill > 0 && <Pill x={-150} y={-ER - 92} text="≈ 30 km/s" s={speedPill} size={44} />}
          {thS > 0 && <g transform={`translate(${ER + 112} 62) scale(${thS})`}><Thermo level={thLevel} /></g>}
        </g>
      </Layer>
      <Bubble s={bub1} id="bub1"><SkyView t={t} /></Bubble>
      <Bubble s={bub2} id="bub2"><SeaView t={t} /></Bubble>
      {!thumb && <TimePill text={`${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`} sub="since the Sun vanished" s={timerS} hot={t >= TF} />}
      {!thumb && <TimePill text="1 week later" s={weekS} />}
      {!thumb && <TimePill text="thousands of years" s={yearsS} />}
      {!thumb && <Cta t={t} />}
      <Tag text="sizes and distances not to scale" show={thumb ? 0 : tagS} />
    </AbsoluteFill>
  );
};
/** scale of the Z 1000 layer for this camera (stroke widths outside components) */
const useKLayer = (c: Cam) => 1000 / (1000 - c.z);

// ---------------------------------------------------------------- subscribe call to action
const Cta: React.FC<{t: number}> = ({t}) => {
  const t0 = K.subscribe - 0.12, click = K.more + 0.05, out = END - 0.75, bell = K.whatifs + 0.1;
  const sIn = pop(t, t0, 0.4), sOut = popOut(t, out, 0.3); const s = Math.min(sIn, sOut);
  if (s <= 0.001) return null;
  const done = t >= click;
  const press = 1 - 0.1 * bump(t, click - 0.06, click + 0.1) + 0.07 * spring(t, click + 0.1, 3, 6);
  const bellA = t >= bell ? spring(t, bell, 4, 3.5) * 28 : 0;
  const cu = eio(prog(t, t0 + 0.2, click - 0.05)), cl = ein(prog(t, click + 0.35, click + 0.8));
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
      {t > t0 + 0.15 && cl < 1 && <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <g transform={`translate(${cx} ${cy}) scale(${csc * 1.5})`}>
          <path d="M 0 0 L 0 46 L 12 35 L 21 55 L 30 51 L 21 32 L 37 32 Z" fill="white" stroke="#111" strokeWidth={4.5} strokeLinejoin="round" />
        </g></svg>}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- composition
export const Short: React.FC<{voice?: boolean; captions?: boolean}> = ({voice = false, captions = true}) => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps;
  return (
    <AbsoluteFill style={{background: '#14244F'}}>
      <Scene t={t} />
      {captions && <Captions t={t} />}
      <Audio src={staticFile(`${T.short}/sfx.wav`)} volume={0.42} />
      {voice && <Sequence from={Math.round(Math.max(0, T.voiceOffset) * fps)} layout="none"><Audio src={staticFile(`${T.short}/vo.wav`)} /></Sequence>}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- thumbnails
export const Thumb: React.FC<{variant: 'A' | 'B' | 'C'}> = ({variant}) => {
  const cfg = {
    A: {t: TV - 0.1, l1: 'SUN GONE?', l2: "YOU WON'T NOTICE"},
    B: {t: K.freezing + 0.7, l1: 'NO SUN?', l2: 'FREEZING IN DAYS'},
    C: {t: K.speed + 0.5, l1: '8 MIN 20 SEC', l2: 'OF OLD SUNLIGHT'},
  }[variant];
  return (
    <AbsoluteFill>
      <Scene t={cfg.t} thumb />
      <AbsoluteFill style={{top: 250, height: 330, bottom: 'auto', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
        {[cfg.l1, cfg.l2].map((l, i) => <div key={i} style={{fontFamily: 'Inter', fontWeight: 900, fontSize: l.length > 12 ? 92 : 118, lineHeight: 1.04, whiteSpace: 'nowrap',
          color: i ? '#FFE14D' : 'white', WebkitTextStroke: '28px #111', paintOrder: 'stroke fill', textAlign: 'center', width: 900,
          filter: 'drop-shadow(0 8px 0 rgba(0,0,0,0.35))', letterSpacing: -1}}>{l}</div>)}
      </AbsoluteFill>
      <AbsoluteFill style={{top: 1560, height: 70, bottom: 'auto', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontFamily: 'Inter', fontWeight: 800, fontSize: 36, color: 'white', background: 'rgba(17,17,17,0.75)', padding: '8px 24px', borderRadius: 40}}>not to scale</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
