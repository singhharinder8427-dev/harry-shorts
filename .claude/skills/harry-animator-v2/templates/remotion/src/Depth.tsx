import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, mix} from './color';
import {KScale} from './Layer';
import {clamp, eio, rnd} from './math';

/* ======================================================================================================
 * v2 "fake 3D" toolkit. Everything is still flat SVG; depth comes from perspective maths, parallax,
 * haze, light and motion. Characters stay flat cut-outs.
 * ====================================================================================================== */

// ---------------------------------------------------------------- perspective ground camera (screen space)
/** horizon = screen y of the horizon; h = camera height above the ground (world units); f = focal length (px);
 *  x = camera lateral position; z = distance travelled forward (dolly); roll in degrees (applied by the caller). */
export type PCam = {horizon: number; h: number; f: number; x: number; z: number};
export const NEAR = 40;
/** project a ground point (X lateral, Z forward) -> screen {x, y, s = px per world unit, d = depth} or null if behind */
export const proj = (c: PCam, X: number, Z: number) => {
  const d = Z - c.z; if (d < NEAR) return null;
  const s = c.f / d; return {x: 540 + (X - c.x) * s, y: c.horizon + c.h * s, s, d};
};
/** haze amount 0..1 for a depth (far things fade toward the sky colour) */
export const hazeAt = (d: number, start = 400, end = 6000) => clamp((d - start) / (end - start)) ** 0.8;

/** SVG filters haze0..haze10 that blend whatever they wrap toward `sky` (use on far billboards / layers) */
export const HazeDefs: React.FC<{sky: string}> = ({sky}) => (
  <defs>{Array.from({length: 11}, (_, i) => (
    <filter key={i} id={`haze${i}`} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
      <feFlood floodColor={sky} result="f" /><feComposite in="f" in2="SourceAlpha" operator="in" result="fa" />
      <feComposite in="SourceGraphic" in2="fa" operator="arithmetic" k1={0} k2={1 - i / 10 * 0.85} k3={i / 10 * 0.85} k4={0} />
    </filter>))}</defs>);
export const hazeFilter = (h: number) => `url(#haze${Math.round(clamp(h) * 10)})`;

/** Perspective ground: sky-to-ground fill, a road (or rails) converging to the vanishing point, scrolling dashes /
 *  sleepers so a forward dolly reads as real motion. Draw it in a full-frame screen-space <svg>. */
export const PerspGround: React.FC<{c: PCam; ground: string; far: string; kind?: 'road' | 'rails' | 'none'; w?: number;
  surface?: string; line?: string; period?: number; zMax?: number}> = ({c, ground, far, kind = 'road', w = 260, surface = '#6F6F75', line = 'white', period = 400, zMax = 20000}) => {
  const id = 'pg' + Math.round(c.horizon);
  const n0 = proj(c, -w, c.z + NEAR + 1)!, n1 = proj(c, w, c.z + NEAR + 1)!, f0 = proj(c, -w, c.z + zMax)!, f1 = proj(c, w, c.z + zMax)!;
  const marks: React.ReactNode[] = [];
  const first = Math.ceil((c.z + NEAR) / period) - 1;
  for (let i = first; i < first + 60; i++) {
    const Z = i * period, a = proj(c, 0, Math.max(Z, c.z + NEAR + 1)); if (!a || a.y < c.horizon + 1) continue;
    if (kind === 'road') {
      const b = proj(c, 0, Z + period * 0.45); if (!b || Z + period * 0.45 <= c.z + NEAR + 1) continue;   // near end clipped, no pop
      const wa = 9 * a.s, wb = 9 * b.s;
      marks.push(<path key={i} d={`M ${a.x - wa} ${a.y} L ${a.x + wa} ${a.y} L ${b.x + wb} ${b.y} L ${b.x - wb} ${b.y} Z`} fill={line} opacity={1 - hazeAt(a.d) * 0.8} />);
    } else if (kind === 'rails') {
      const l = proj(c, -w * 1.35, Z)!, r = proj(c, w * 1.35, Z)!, th = Math.max(1, 26 * a.s);
      marks.push(<rect key={i} x={l.x} y={a.y - th / 2} width={r.x - l.x} height={th} fill={mix('#7A5634', far, hazeAt(a.d))} stroke={INK} strokeWidth={Math.min(4, 2 + a.s * 2)} />);
    }
  }
  const rail = (X: number) => { const a = proj(c, X, c.z + NEAR + 1)!, b = proj(c, X, c.z + zMax)!; return `M ${a.x} ${a.y} L ${b.x} ${b.y}`; };
  return (<g>
    <defs><linearGradient id={id} x1="0" y1={c.horizon} x2="0" y2={1920} gradientUnits="userSpaceOnUse">
      <stop offset="0" stopColor={far} /><stop offset="0.35" stopColor={ground} /><stop offset="1" stopColor={ground} /></linearGradient></defs>
    <rect x={-400} y={c.horizon} width={1880} height={3000} fill={`url(#${id})`} />
    {kind === 'road' && <path d={`M ${n0.x} ${n0.y} L ${n1.x} ${n1.y} L ${f1.x} ${f1.y} L ${f0.x} ${f0.y} Z`} fill={surface} />}
    {marks}
    {kind === 'rails' && [-w, w].map((X) => <g key={X}><path d={rail(X)} stroke={INK} strokeWidth={14} /><path d={rail(X)} stroke="#C9CED6" strokeWidth={7} /></g>)}
    {kind === 'road' && [-w, w].map((X) => <path key={X} d={rail(X)} stroke={INK} strokeWidth={5} opacity={0.6} />)}
  </g>);
};
/** place a flat cut-out standing on the ground at (X, Z): children are drawn in world units with feet at (0,0) */
export const Billboard: React.FC<{c: PCam; X: number; Z: number; children?: React.ReactNode; haze?: boolean}> = ({c, X, Z, children, haze = true}) => {
  const p = proj(c, X, Z); if (!p) return null;
  return <g transform={`translate(${p.x} ${p.y}) scale(${p.s})`} filter={haze ? hazeFilter(hazeAt(p.d)) : undefined}><KScale k={p.s}>{children}</KScale></g>;
};

// ---------------------------------------------------------------- always-moving camera
/** smooth hand-held drift: integer cycles over `dur` so a looping Short stays seamless. amp 1 = a few px. */
export const drift = (t: number, dur: number, amp = 1) => {
  const w = (n: number, ph: number) => Math.sin((2 * Math.PI * n * t) / dur + ph);
  const cyc = (sec: number) => Math.max(1, Math.round(dur / sec));
  return {dx: amp * (7 * w(cyc(9), 0.3) + 3 * w(cyc(4.1), 1.7)), dy: amp * (5 * w(cyc(7.3), 2.1) + 2 * w(cyc(3.3), 0.4)),
    rot: amp * 0.35 * w(cyc(11), 1.1), zoom: 1 + amp * 0.008 * w(cyc(13), 0.9)};
};

// ---------------------------------------------------------------- whip / fly-through transition between two scenes
const WhipDefs: React.FC = () => (
  <svg width={0} height={0} style={{position: 'absolute'}}><defs>
    {Array.from({length: 11}, (_, i) => <filter key={i} id={`wb${i}`} x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation={`${i * 6} ${i * 0.4}`} /></filter>)}
    {Array.from({length: 11}, (_, i) => <filter key={'v' + i} id={`wv${i}`} x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation={`${i * 0.4} ${i * 6}`} /></filter>)}
  </defs></svg>);
/** Whip: scene `a` before `at`, scene `b` after; during [at - dur/2, at + dur/2] `a` rushes out and `b` rushes in,
 *  with directional blur and speed lines only during the move. dir: 'left' | 'right' | 'up' | 'down'. */
export const Whip: React.FC<{t: number; at: number; dur?: number; dir?: 'left' | 'right' | 'up' | 'down'; a: React.ReactNode; b: React.ReactNode}> = ({t, at, dur = 0.5, dir = 'left', a, b}) => {
  const t0 = at - dur / 2, t1 = at + dur / 2;
  if (t < t0) return <>{a}</>;
  if (t >= t1) return <>{b}</>;
  // the two scenes move together as one strip (no gap): a slides out, b slides in right behind it
  const horiz = dir === 'left' || dir === 'right', sgn = dir === 'left' || dir === 'up' ? -1 : 1, D = horiz ? 1080 : 1920;
  const u = (t - t0) / dur, shift = D * eio(u), speed = Math.sin(Math.PI * u), bi = Math.round(clamp(speed) * 10);
  const tr = (o: number) => horiz ? `translateX(${o}px)` : `translateY(${o}px)`;
  const f = `url(#${horiz ? 'wb' : 'wv'}${bi})`;
  return (<AbsoluteFill style={{overflow: 'hidden'}}>
    <WhipDefs />
    <AbsoluteFill style={{transform: tr(sgn * shift), filter: f}}>{a}</AbsoluteFill>
    <AbsoluteFill style={{transform: tr(sgn * shift - sgn * D), filter: f}}>{b}</AbsoluteFill>
    <SpeedLines u={speed} horiz={horiz} seed={Math.round(at * 10)} />
  </AbsoluteFill>);
};
/** white streaks across the frame (whips) or radiating from the centre (dives: radial) */
export const SpeedLines: React.FC<{u: number; horiz?: boolean; radial?: boolean; seed?: number}> = ({u, horiz = true, radial = false, seed = 0}) => {
  if (u <= 0.02) return null;
  return (<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
    {Array.from({length: 22}, (_, i) => {
      const r = (k: number) => rnd(seed * 31 + i * 7 + k);
      if (radial) { const a = r(1) * Math.PI * 2, r0 = 380 + r(2) * 300, L = 200 + r(3) * 400 * u;
        return <path key={i} d={`M ${540 + Math.cos(a) * r0} ${960 + Math.sin(a) * r0} l ${Math.cos(a) * L} ${Math.sin(a) * L}`} stroke="white" strokeWidth={4 + r(4) * 6} strokeLinecap="round" opacity={0.55 * u} />; }
      const p = r(1) * (horiz ? 1920 : 1080), q = r(2) * (horiz ? 1080 : 1920), L = 160 + r(3) * 520 * u;
      return horiz ? <path key={i} d={`M ${q} ${p} l ${L} 0`} stroke="white" strokeWidth={3 + r(4) * 6} strokeLinecap="round" opacity={0.5 * u} />
        : <path key={i} d={`M ${p} ${q} l 0 ${L}`} stroke="white" strokeWidth={3 + r(4) * 6} strokeLinecap="round" opacity={0.5 * u} />;
    })}
  </svg>);
};

// ---------------------------------------------------------------- light and air
/** sun disc + soft glow + faint rays, screen space */
export const SunGlow: React.FC<{x: number; y: number; r?: number; color?: string; t?: number}> = ({x, y, r = 90, color = '#FFF3C4', t = 0}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
    <defs><radialGradient id="sunglow"><stop offset="0" stopColor={color} stopOpacity={0.85} /><stop offset="0.35" stopColor={color} stopOpacity={0.3} /><stop offset="1" stopColor={color} stopOpacity={0} /></radialGradient></defs>
    <circle cx={x} cy={y} r={r * 6} fill="url(#sunglow)" />
    {Array.from({length: 10}, (_, i) => { const a = i * 0.628 + t * 0.05; return <path key={i} d={`M ${x} ${y} L ${x + Math.cos(a - 0.05) * r * 9} ${y + Math.sin(a - 0.05) * r * 9} L ${x + Math.cos(a + 0.05) * r * 9} ${y + Math.sin(a + 0.05) * r * 9} Z`} fill={color} opacity={0.07} />; })}
    <circle cx={x} cy={y} r={r} fill={color} />
  </svg>);
/** long soft cast shadow on the ground, pointing away from the sun (angle in degrees, 0 = to the right) */
export const LongShadow: React.FC<{w?: number; len?: number; angle?: number; opacity?: number}> = ({w = 90, len = 360, angle = 20, opacity = 0.24}) => (
  <g transform={`rotate(${angle})`} style={{filter: 'blur(4px)'}}>
    <path d={`M 0 ${-w * 0.18} C ${len * 0.5} ${-w * 0.5} ${len} ${-w * 0.35} ${len} 0 C ${len} ${w * 0.35} ${len * 0.5} ${w * 0.5} 0 ${w * 0.18} Z`} fill={`rgba(40,28,70,${opacity})`} />
  </g>);
/** lit side + shadow side for world objects (not characters): returns [lit, base, dark] colours */
export const shades = (base: string) => [mix(base, '#FFF4D6', 0.28), base, mix(base, '#2A1F3D', 0.3)] as const;
/** code texture: speckles (gravel, rock, sand) inside a box */
export const Speckle: React.FC<{x: number; y: number; w: number; h: number; n?: number; seed?: number; color?: string; r?: number}> = ({x, y, w, h, n = 60, seed = 1, color = 'rgba(0,0,0,0.18)', r = 6}) => (
  <g>{Array.from({length: n}, (_, i) => <ellipse key={i} cx={x + rnd(seed * 13 + i) * w} cy={y + rnd(seed * 17 + i * 3) * h} rx={r * (0.5 + rnd(i + seed))} ry={r * 0.6 * (0.5 + rnd(i + seed + 9))} fill={color} />)}</g>);
/** horizontal strata stripes (cliffs, canyon walls, wood grain) */
export const Strata: React.FC<{x: number; y: number; w: number; h: number; colors: string[]; seed?: number}> = ({x, y, w, h, colors, seed = 2}) => {
  let yy = y; const out: React.ReactNode[] = []; let i = 0;
  while (yy < y + h) { const bh = 18 + rnd(seed + i) * 46; const wob = (j: number) => Math.sin(j * 0.9 + i * 2.1 + seed) * 8;
    out.push(<path key={i} d={`M ${x} ${yy + wob(0)} ${Array.from({length: 9}, (_, j) => `L ${x + (w * (j + 1)) / 9} ${yy + wob(j + 1)}`).join(' ')} L ${x + w} ${yy + bh} L ${x} ${yy + bh} Z`} fill={colors[i % colors.length]} />);
    yy += bh; i++; }
  return <g>{out}</g>;
};
/** something close to the lens (pole, leaf, rail bolt): drawn big and slightly blurred = cheap strong depth cue */
export const Foreground: React.FC<{blur?: number; children?: React.ReactNode}> = ({blur = 5, children}) => (
  <AbsoluteFill style={{filter: `blur(${blur}px)`}}><svg width={1080} height={1920} style={{position: 'absolute', overflow: 'visible'}}>{children}</svg></AbsoluteFill>);
