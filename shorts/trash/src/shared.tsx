import React from 'react';
import {AbsoluteFill} from 'remotion';
import timing from './timing.json';
import {CamKey, clamp, eio, lerp} from './math';
export const T = timing as any;
export const K = T.keys as Record<string, number>;
export const S = T.sentences as {start: number; end: number}[];
export const DURATION = T.duration as number;
export const END = DURATION;
export const CUT1 = S[3].start - 0.08;   // town -> plant ("So a crane")
export const CUT3 = S[9].start - 0.08;   // plant -> town ("Subscribe")
/** breathing etc.: n whole cycles over the duration so the loop is seamless */
export const loopSin = (t: number, n: number, ph = 0) => Math.sin((2 * Math.PI * n * t) / END + ph);
/** camera keys -> {x, y, s}; keys forced to increase; scale interpolated in log space */
export const camKeys = (t: number, ks: CamKey[]) => {
  const q = ks.map((k) => [k[0], k[1]] as CamKey);
  for (let i = 1; i < q.length; i++) if (q[i][0] <= q[i - 1][0]) q[i][0] = q[i - 1][0] + 0.05;
  let a = q[0], b = q[0], u = 0;
  if (t >= q[q.length - 1][0]) a = b = q[q.length - 1];
  else for (let i = 0; i < q.length - 1; i++) if (t >= q[i][0] && t < q[i + 1][0]) { a = q[i]; b = q[i + 1]; u = eio((t - a[0]) / (b[0] - a[0])); break; }
  return {x: lerp(a[1].x, b[1].x, u), y: lerp(a[1].y, b[1].y, u), s: Math.exp(lerp(Math.log(a[1].s), Math.log(b[1].s), u))};
};
export const toCam = (c: {x: number; y: number; s: number}) => ({x: c.x, y: c.y, z: 1000 - 1000 / c.s});
export const Tag: React.FC<{text: string; show: number}> = ({text, show}) => show <= 0.001 ? null : (
  <AbsoluteFill style={{top: 250, height: 80, bottom: 'auto', alignItems: 'center', justifyContent: 'center'}}>
    <div style={{fontFamily: 'Inter', fontWeight: 800, fontSize: 34, color: 'white', background: 'rgba(17,17,17,0.72)',
      padding: '8px 22px', borderRadius: 40, transform: `scale(${clamp(show, 0, 2)})`, letterSpacing: 0.3}}>{text}</div>
  </AbsoluteFill>);
