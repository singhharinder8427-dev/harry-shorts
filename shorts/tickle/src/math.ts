export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
export const smooth = (u: number) => { u = clamp(u); return u * u * (3 - 2 * u); };
export const eio = (u: number) => { u = clamp(u); return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; };
export const eout = (u: number) => 1 - Math.pow(1 - clamp(u), 3);
export const ein = (u: number) => Math.pow(clamp(u), 3);
export const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
/** smoothstep keyframes [[time, value], ...] */
export const kfs = (t: number, ks: [number, number][], ease = smooth) => {
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 0; i < ks.length - 1; i++) {
    const [t0, v0] = ks[i], [t1, v1] = ks[i + 1];
    if (t <= t1) return lerp(v0, v1, ease((t - t0) / Math.max(1e-6, t1 - t0)));
  }
  return ks[ks.length - 1][1];
};
/** step keyframes: value of the last key at or before t */
export const pick = <T,>(t: number, ks: [number, T][]): T => { let v = ks[0][1]; for (const [tt, vv] of ks) if (t >= tt) v = vv; return v; };
/** pop-in scale with overshoot (easeOutBack), 0 before t0 */
export const pop = (t: number, t0: number, d = 0.35) => {
  if (t < t0) return 0; const u = (t - t0) / d; if (u >= 1) return 1;
  const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2);
};
/** pop out (1 -> 0) with a small anticipation swell, ends at t0 + d */
export const popOut = (t: number, t0: number, d = 0.3) => {
  if (t < t0) return 1; const u = (t - t0) / d; if (u >= 1) return 0;
  return (1 + 0.18 * Math.sin(Math.PI * Math.min(1, u * 2.2))) * (1 - ein(u));
};
/** damped spring impulse at t0 (0 at rest) */
export const spring = (t: number, t0: number, f = 3, damp = 5) => t < t0 ? 0 : Math.sin((t - t0) * f * 2 * Math.PI) * Math.exp(-(t - t0) * damp);
/** bump 0->1->0 over [a, b] */
export const bump = (t: number, a: number, b: number) => (t < a || t > b) ? 0 : Math.sin(Math.PI * (t - a) / (b - a));
export const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export type Cam = {x: number; y: number; z: number};
export type CamKey = [number, {x: number; y: number; s: number}];
/** camera from keys (time, {x, y, s = scale of the Z=1000 layer}); scale interpolated in log space */
export const camAt = (t: number, ks: CamKey[], ease = eio): Cam => {
  let a = ks[0], b = ks[0], u = 0;
  if (t >= ks[ks.length - 1][0]) { a = b = ks[ks.length - 1]; }
  else for (let i = 0; i < ks.length - 1; i++) if (t >= ks[i][0] && t < ks[i + 1][0]) { a = ks[i]; b = ks[i + 1]; u = ease((t - a[0]) / (b[0] - a[0])); break; }
  const s = Math.exp(lerp(Math.log(a[1].s), Math.log(b[1].s), u));
  return {x: lerp(a[1].x, b[1].x, u), y: lerp(a[1].y, b[1].y, u), z: 1000 - 1000 / s};
};
