import React, {useId} from 'react';
import {AbsoluteFill} from 'remotion';
import * as THREE from 'three';
import {Cam3, Cam3Key, H, W, cam3At} from './World3D';
import {clamp, ein, eout, rnd} from './math';

/* Fast-move accents (owner's amendment, 16 Nov 2026): slam zooms, fly-through and smear transitions with motion blur.
 * They are ACCENTS: at most one every ~5-8 s, each move <= 0.5 s, always settling into a smooth held shot.
 *
 * Cost: everything here is a 2D post effect on the already-rendered frame (CSS transform / SVG filter / SVG lines).
 * It never adds 3D geometry, never renders a second World, and on frames without fast motion it renders NOTHING
 * extra (no filter element at all), so holds and normal moves render at exactly the old speed. */

// ------------------------------------------------------------------------------------------------ eases for fast moves
/** pass as the 3rd element of a cam3At key: the ease of the move INTO that key */
export const EASE = {
  /** rush: starts at full speed, brakes hard into the key (the slam into a face) */
  slam: (u: number) => 1 - Math.pow(1 - clamp(u), 5),
  /** dive: slow start, accelerates INTO the key (the camera flying into an object before a fly-through cut) */
  dive: (u: number) => Math.pow(clamp(u), 4),
  /** whip: almost all motion in the middle (expo in-out) - a fast pan / track between two held framings */
  whip: (u: number) => { u = clamp(u); if (u === 0 || u === 1) return u; return u < 0.5 ? Math.pow(2, 20 * u - 10) / 2 : (2 - Math.pow(2, -20 * u + 10)) / 2; },
  /** slam with a small overshoot and settle (punchy push-in on a key word) */
  punch: (u: number) => { u = clamp(u); const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); },
};

// ------------------------------------------------------------------------------------------------ camera speed -> blur
export type Blur = {x: number; y: number; zoom: number};      // screen motion this frame, design px per frame (60 fps)
const basis = (c: Cam3) => {
  const cam = new THREE.PerspectiveCamera(c.fov, W / H, 0.1, 400); cam.position.set(...c.pos); cam.lookAt(...c.look); cam.updateMatrixWorld();
  const e = cam.matrixWorld.elements; return {r: new THREE.Vector3(e[0], e[1], e[2]), u: new THREE.Vector3(e[4], e[5], e[6]), f: new THREE.Vector3(-e[8], -e[9], -e[10])};
};
/** how fast the picture moves on screen at time t for a camera given as cam3At keys (or any cam(t) function).
 *  Feed the result to <MotionBlur>. Normal glides (2-10 px/frame) stay under its threshold; only fast moves blur. */
export const camBlur = (t: number, cam: Cam3Key[] | ((t: number) => Cam3), fps = 60): Blur => {
  const at = typeof cam === 'function' ? cam : (tt: number) => cam3At(tt, cam);
  const a = at(t - 1 / fps), b = at(t);
  const B = basis(b), A = basis(a), dist = Math.max(0.3, Math.hypot(b.look[0] - b.pos[0], b.look[1] - b.pos[1], b.look[2] - b.pos[2]));
  const focal = (H / 2) / Math.tan(b.fov * Math.PI / 360);
  const dp = new THREE.Vector3(b.pos[0] - a.pos[0], b.pos[1] - a.pos[1], b.pos[2] - a.pos[2]);
  const df = A.f.clone().sub(B.f);                                  // change of view direction (radians, small-angle)
  // screen motion of what the camera looks at: turning and sliding cancel on an orbit around the subject (it stays sharp)
  const x = (df.dot(B.r) - dp.dot(B.r) / dist) * focal;
  const y = (dp.dot(B.u) / dist - df.dot(B.u)) * focal;
  const zoom = (dp.dot(B.f) / dist + (a.fov - b.fov) / b.fov) * (H / 2);
  return {x, y, zoom};
};
export const NO_BLUR: Blur = {x: 0, y: 0, zoom: 0};
const addBlur = (p: Blur, q: Blur): Blur => ({x: p.x + q.x, y: p.y + q.y, zoom: p.zoom + q.zoom});

// ------------------------------------------------------------------------------------------------ the post effects
/** radial speed streaks from the centre (zoom moves). amt 0..1. Plain SVG lines, deterministic. */
export const SpeedLines: React.FC<{amt: number; color?: string; seed?: number; cx?: number; cy?: number; n?: number}> = ({amt, color = '#FFFFFF', seed = 1, cx = W / 2, cy = H * 0.42, n = 44}) => {
  if (amt <= 0.02) return null;
  return (<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
    {Array.from({length: n}, (_, i) => {
      const a = (i / n) * Math.PI * 2 + rnd(seed * 31 + i) * 0.12, r0 = 420 + rnd(seed * 7 + i) * 380, len = (160 + rnd(seed + i * 3) * 420) * amt;
      const c = Math.cos(a), s = Math.sin(a);
      return <line key={i} x1={cx + c * r0} y1={cy + s * r0} x2={cx + c * (r0 + len)} y2={cy + s * (r0 + len)} stroke={color} strokeOpacity={0.55 * amt} strokeWidth={3 + rnd(i + seed * 11) * 5} strokeLinecap="round" />;
    })}
  </svg>);
};
/** Motion blur on whatever is inside (wrap the SCENE only - never captions, CTA or cards that must stay readable).
 *  blur = camBlur(...) (+ any extra). Only motion FASTER than `thr` px/frame blurs (normal glides move 2-10 px/frame and
 *  stay sharp, so they render at the old speed - a blurred frame costs ~2x a sharp one on software WebGL); above it,
 *  stdDev = (motion - thr) * shutter, so blur fades in smoothly. shutter 0.5 = 180-degree shutter. */
export const MotionBlur: React.FC<{blur: Blur; shutter?: number; max?: number; min?: number; thr?: number; lines?: boolean; children?: React.ReactNode}> = ({blur, shutter = 0.5, max = 26, min = 1, thr = 14, lines = true, children}) => {
  const id = 'mb' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const over = (v: number) => Math.max(0, Math.abs(v) - thr) * shutter;
  const sx = Math.min(max, over(blur.x)), sy = Math.min(max, over(blur.y)), sz = Math.min(max, over(blur.zoom * 0.45));
  const dx = Math.max(sx, sz * 0.6), dy = Math.max(sy, sz * 0.6);
  if (dx < min && dy < min) return <>{children}</>;                 // normal frames: untouched, zero extra cost
  // zoom moves: a uniform soft blur + a slight scale "stretch" + speed lines; pans: blur along the motion only
  const stretch = 1 + Math.min(0.06, sz * 0.002) * Math.sign(blur.zoom || 1);
  return (<AbsoluteFill>
    <svg width={0} height={0} style={{position: 'absolute'}}><defs><filter id={id} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
      <feGaussianBlur stdDeviation={`${(dx / 2).toFixed(2)} ${(dy / 2).toFixed(2)}`} edgeMode="duplicate" /></filter></defs></svg>
    <AbsoluteFill style={{filter: `url(#${id})`, transform: `scale(${stretch})`, transformOrigin: '50% 42%'}}>{children}</AbsoluteFill>
    {lines && <SpeedLines amt={clamp((sz - 3) / 14)} />}
  </AbsoluteFill>);
};

// ------------------------------------------------------------------------------------------------ transitions (no overlap)
/** A fast transition between two shots at time `at`. Only ONE shot is ever rendered (a before `at`, b after), so it
 *  costs nothing extra. Put a <MotionBlur> camera blur INSIDE a and b if their cameras also move fast.
 *  kind:
 *   'fly'   - fly-through: a pushes in hard (zoom blur, speed lines), white flash on the cut, b settles out of the push.
 *             Pair with a camera in a that DIVES into an object (EASE.dive) so we "go through" it into b.
 *   'smear' - whip / smear cut: a whips sideways into a horizontal blur, b arrives from the other side and settles.
 *   'flash' - a plain clean cut hidden under a quick white (or coloured) flash. Use for a big reveal or impact.
 *  dur = total length (default 0.4 s, centred on `at`). */
export const Transition: React.FC<{t: number; at: number; kind: 'fly' | 'smear' | 'flash'; a: React.ReactNode; b: React.ReactNode; dur?: number; dir?: 1 | -1; color?: string}> = ({t, at, kind, a, b, dur = 0.4, dir = 1, color = '#FFFFFF'}) => {
  const h = dur / 2, before = t < at;
  const u = before ? clamp((t - (at - h)) / h) : clamp(1 - (t - at) / h);   // 0 far from the cut -> 1 at the cut
  if (u <= 0) return <>{before ? a : b}</>;
  const shot = before ? a : b;
  let blur: Blur = NO_BLUR, transform = '', flash = 0;
  if (kind === 'fly') {
    const k = before ? ein(u) : eout(u) * 0.8;
    blur = {x: 0, y: 0, zoom: 40 + 80 * k}; transform = `scale(${1 + (before ? 0.32 : 0.18) * k})`; flash = Math.pow(u, before ? 3 : 1.6);
  } else if (kind === 'smear') {
    const k = before ? ein(u) : eout(u);
    blur = {x: 14 + 90 * k, y: 0, zoom: 0}; transform = `translateX(${(before ? -1 : 1) * dir * 0.08 * W * k}px) scale(${1 + 0.2 * k})`; flash = 0.25 * Math.pow(u, 3);
  } else {
    flash = before ? Math.pow(u, 4) : Math.pow(u, 1.3);
  }
  return (<AbsoluteFill>
    <AbsoluteFill style={{transform, transformOrigin: '50% 42%'}}>{kind === 'flash' ? shot : <MotionBlur blur={blur} max={34}>{shot}</MotionBlur>}</AbsoluteFill>
    {flash > 0.01 && <AbsoluteFill style={{background: color, opacity: clamp(flash)}} />}
  </AbsoluteFill>);
};
/** camera blur for a shot (helper): <ShotBlur t={t} cam={KEYS}>...</ShotBlur> = MotionBlur driven by that camera. */
export const ShotBlur: React.FC<{t: number; cam: Cam3Key[] | ((t: number) => Cam3); extra?: Blur; children?: React.ReactNode}> = ({t, cam, extra = NO_BLUR, children}) =>
  <MotionBlur blur={addBlur(camBlur(t, cam), extra)}>{children}</MotionBlur>;
