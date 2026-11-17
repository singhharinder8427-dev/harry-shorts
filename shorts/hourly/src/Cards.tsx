import React from 'react';
import {INK} from './color';
import {clamp, eout, pop, popOut, spring} from './math';

/* Pop-up cards (owner's amendment, 16 Nov 2026): text that lives IN the scene for a beat - a social post, a newspaper,
 * a big number. Screen-space SVG: put them as children of <World> (its SVG layer) or in a full-frame <svg> overlay.
 * Rules: invented names / handles / papers only - NO real logos or platform marks; a card that quotes a real person
 * must quote something they really said (sourced in the fact sheet); the words match the narration at that moment
 * (numbers exactly as spoken); one card at a time, on screen <= ~2.5 s; inside x 140-900, y 250-1100, never over the
 * main face or the caption box. Cost: a few SVG shapes - no effect on render speed. */

const FONT = 'Inter, sans-serif';
/** rough word wrap for Inter at `size` px into lines of at most `w` px */
export const wrap = (text: string, w: number, size: number, k = 0.56) => {
  const max = Math.max(4, Math.floor(w / (size * k))), out: string[] = []; let line = '';
  for (const word of text.split(/\s+/)) { if ((line + ' ' + word).trim().length > max && line) { out.push(line); line = word; } else line = (line + ' ' + word).trim(); }
  if (line) out.push(line); return out;
};
/** standard entrance / exit for a card: pops in at t0 with overshoot, a small tilt spring, pops out at t1 */
export const cardIn = (t: number, t0: number, t1 = Infinity) => ({s: pop(t, t0, 0.38) * popOut(t, t1, 0.28), rot: spring(t, t0, 2.2, 4.5) * 7});
/** fly in from a side (dir -1 = from the left) instead of popping: returns an x offset to add */
export const flyX = (t: number, t0: number, dir: -1 | 1 = 1, d = 0.35) => dir * 900 * (1 - eout(clamp((t - t0) / d)));

type Place = {x: number; y: number; s: number; rot?: number};
/** a generic social-media post (no platform logo): avatar, display name, handle, text, a heart count */
export const PostCard: React.FC<Place & {name: string; handle: string; text: string; avatar?: string; initial?: string; likes?: string; w?: number; verified?: boolean}> =
  ({x, y, s, rot = 0, name, handle, text, avatar = '#5B8DEF', initial, likes, w = 700, verified = false}) => {
  if (s <= 0.001) return null;
  const fs = 40, lines = wrap(text, w - 80, fs), h = 150 + lines.length * fs * 1.28 + (likes ? 70 : 24);
  return (<g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s}) translate(${-w / 2} ${-h / 2})`}>
    <rect x={10} y={14} width={w} height={h} rx={34} fill="#000" opacity={0.22} />
    <rect width={w} height={h} rx={34} fill="#FFFFFF" stroke={INK} strokeWidth={7} />
    <circle cx={78} cy={78} r={40} fill={avatar} stroke={INK} strokeWidth={5} />
    <text x={78} y={92} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38} fill="#FFFFFF">{(initial ?? name[0] ?? '').toUpperCase()}</text>
    <text x={136} y={70} fontFamily={FONT} fontWeight={900} fontSize={36} fill={INK}>{name}</text>
    {verified && <g transform={`translate(${146 + name.length * 21} 58)`}><circle r={15} fill="#3D8BFD" /><path d="M -7 0 L -2 5 L 8 -6" stroke="#fff" strokeWidth={4.5} fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>}
    <text x={136} y={110} fontFamily={FONT} fontWeight={800} fontSize={28} fill="#7A7F88">{handle}</text>
    {lines.map((l, i) => <text key={i} x={40} y={170 + i * fs * 1.28} fontFamily={FONT} fontWeight={800} fontSize={fs} fill={INK}>{l}</text>)}
    {likes && <g transform={`translate(40 ${h - 34})`}>
      <path d="M 0 -6 C -4 -18 -22 -16 -20 -2 C -18 8 -4 14 0 20 C 4 14 18 8 20 -2 C 22 -16 4 -18 0 -6 Z" transform="translate(20 -4) scale(0.9)" fill="#E5484D" />
      <text x={50} y={8} fontFamily={FONT} fontWeight={800} fontSize={28} fill="#7A7F88">{likes}</text></g>}
  </g>);
};
/** a newspaper front page with an invented masthead: big headline, a picture box, grey text lines */
export const Headline: React.FC<Place & {paper: string; title: string; w?: number; tone?: string}> = ({x, y, s, rot = 0, paper, title, w = 560, tone = '#F4EFE3'}) => {
  if (s <= 0.001) return null;
  const fs = 54, lines = wrap(title.toUpperCase(), w - 60, fs, 0.62), hh = 120 + lines.length * fs * 1.08, h = hh + 250;
  return (<g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s}) translate(${-w / 2} ${-h / 2})`}>
    <rect x={10} y={14} width={w} height={h} fill="#000" opacity={0.22} />
    <rect width={w} height={h} fill={tone} stroke={INK} strokeWidth={6} />
    <text x={w / 2} y={62} textAnchor="middle" fontFamily="Georgia, 'DejaVu Serif', serif" fontWeight={700} fontSize={40} fill={INK}>{paper}</text>
    <path d={`M 24 82 L ${w - 24} 82 M 24 92 L ${w - 24} 92`} stroke={INK} strokeWidth={3} />
    {lines.map((l, i) => <text key={i} x={30} y={150 + i * fs * 1.08} fontFamily={FONT} fontWeight={900} fontSize={fs} fill={INK}>{l}</text>)}
    <rect x={30} y={hh + 10} width={w * 0.42} height={200} fill="#C9C2B2" stroke={INK} strokeWidth={4} />
    {Array.from({length: 9}, (_, i) => <rect key={i} x={w * 0.42 + 50} y={hh + 16 + i * 22} width={(w * 0.58 - 80) * (i % 4 === 3 ? 0.6 : 1)} height={9} rx={4} fill="#A8A296" />)}
  </g>);
};
/** a big pop-up number (or short word) with a thick outline; `count` 0..1 counts up from `from` to `to` */
export const BigNumber: React.FC<Place & {text?: string; to?: number; from?: number; count?: number; format?: (n: number) => string; sub?: string; color?: string; size?: number}> =
  ({x, y, s, rot = 0, text, to, from = 0, count = 1, format = (n) => Math.round(n).toLocaleString('en-US'), sub, color = '#FFE14D', size = 150}) => {
  if (s <= 0.001) return null;
  const label = text ?? format(from + ((to ?? 0) - from) * eout(clamp(count)));
  const st = {fontFamily: FONT, fontWeight: 900, textAnchor: 'middle' as const, paintOrder: 'stroke' as const, stroke: INK, strokeLinejoin: 'round' as const};
  return (<g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <text y={size * 0.36 + 10} fontSize={size} fill="#000" opacity={0.25} {...st} strokeWidth={size * 0.16}>{label}</text>
    <text y={size * 0.36} fontSize={size} fill={color} {...st} strokeWidth={size * 0.16}>{label}</text>
    {sub && <text y={size * 0.36 + size * 0.55} fontSize={size * 0.32} fill="#FFFFFF" {...st} strokeWidth={size * 0.07}>{sub.toUpperCase()}</text>}
  </g>);
};

/* Hook text (owner's amendment, 17 Nov 2026): the ONE on-screen hook line on frame 0. 6-8 words, up to 3 lines, huge
 * (>= 96 px in design space - cut words rather than shrink), top zone x 90-990, y 250-700, never over Blob's face,
 * the strange thing or the caption box. Visible at full size ON FRAME 0 (no pop-in from nothing - the first frame must
 * already read), a small breathing scale so it isn't static, pops out at `tOut` (about 2-2.5 s, or the first story
 * word). `keys` words (upper-case match) are drawn in brand yellow. Render it in a full-frame overlay outside ShotBlur. */
export const HookText: React.FC<{t: number; text: string; tOut?: number; keys?: string[]; y?: number; size?: number}> =
  ({t, text, tOut = 2.2, keys = [], y = 330, size = 124}) => {
  const words = text.trim().split(/\s+/);
  if (words.length < 6 || words.length > 8) console.warn(`HookText: ${words.length} words - keep it to 6-8`);
  const s = popOut(t, tOut, 0.28) * (1 + 0.02 * Math.sin(t * 5)); // full size at t=0, gentle pulse, pop out
  if (s <= 0.001) return null;
  // 1-3 balanced lines; pick the split that gives the biggest type inside x 90-990 (900 px). Widths in em of Inter 900
  // caps (measured), + 0.17 em for the stroke.
  const EM: Record<string, number> = {A: .81, B: .67, C: .75, D: .72, E: .61, F: .58, G: .75, H: .75, I: .29, J: .6, K: .76, L: .57, M: .96,
    N: .77, O: .78, P: .66, Q: .79, R: .67, S: .67, T: .69, U: .72, V: .81, W: 1.1, X: .79, Y: .78, Z: .69, ' ': .25, "'": .37, '1': .45};
  const em = (l: string[]) => [...l.join(' ').toUpperCase()].reduce((a, c) => a + (EM[c] ?? .68), 0.17);
  const splits: string[][][] = [[words]];
  for (let i = 1; i < words.length; i++) {
    splits.push([words.slice(0, i), words.slice(i)]);
    for (let j = i + 1; j < words.length; j++) splits.push([words.slice(0, i), words.slice(i, j), words.slice(j)]);
  }
  const fit = (ls: string[][]) => Math.min(size, 900 / Math.max(...ls.map(em)));
  const lines = splits.reduce((best, ls) => (fit(ls) > fit(best) + 0.5 ? ls : best));
  const fs = Math.max(96, fit(lines));
  if (fit(lines) < 96) console.warn(`HookText: "${text}" only fits at ${Math.round(fit(lines))} px - cut words`);
  const isKey = (w: string) => keys.map((k) => k.toUpperCase()).includes(w.toUpperCase().replace(/[^A-Z0-9']/g, ''));
  const st = {fontFamily: FONT, fontWeight: 900, textAnchor: 'middle' as const, paintOrder: 'stroke' as const, stroke: INK, strokeLinejoin: 'round' as const, strokeWidth: fs * 0.17};
  return (<g transform={`translate(520 ${y}) scale(${s})`}>
    {lines.map((l, i) => (<g key={i} transform={`translate(0 ${i * fs * 1.08})`}>
      <text y={10} fontSize={fs} fill="#000" opacity={0.28} {...st}>{l.join(' ').toUpperCase()}</text>
      <text fontSize={fs} {...st}>{l.map((w, j) => <tspan key={j} fill={isKey(w) ? '#FFC83D' : '#FFFFFF'}>{(j ? ' ' : '') + w.toUpperCase()}</tspan>)}</text>
    </g>))}
  </g>);
};
