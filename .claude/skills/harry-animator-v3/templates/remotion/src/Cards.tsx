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
