/* Screen-space math cards for "$20 an hour to $1 million" (flat SVG, drawn in a World's SVG layer or a full-frame overlay).
 * Every word on a card matches the narration at that moment; numbers exactly as spoken; US format ($, commas).
 * SourceTag = the small reference line for a fact (agency + dataset), not a logo. One big card at a time. */
import React from 'react';
import {INK} from './color';
import {clamp, eout, pop, popOut, spring} from './math';

const FONT = 'Inter, sans-serif';
const txt = (size: number, fill: string, sw: number) => ({fontFamily: FONT, fontWeight: 900, fontSize: size, fill, stroke: INK, strokeWidth: sw, paintOrder: 'stroke' as const, strokeLinejoin: 'round' as const});
type Place = {x: number; y: number; s: number; rot?: number};

/** small reference tag (top-left area): "SOURCE" chip + one line of text. Slides in from the left. */
export const SourceTag: React.FC<{t: number; t0: number; t1: number; text: string; y?: number}> = ({t, t0, t1, text, y = 228}) => {
  const u = eout(clamp((t - t0) / 0.3)) * (1 - eout(clamp((t - t1) / 0.25))); if (u <= 0.001) return null;
  const w = 150 + text.length * 15.2;
  return (<g transform={`translate(${-w + u * (w + 110)} ${y})`}>
    <rect x={0} y={0} width={w} height={58} rx={14} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
    <rect x={8} y={8} width={124} height={42} rx={10} fill="#1E3557" />
    <text x={70} y={38} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill="#FFC83D" letterSpacing={1.5}>SOURCE</text>
    <text x={146} y={39} fontFamily={FONT} fontWeight={800} fontSize={26} fill={INK}>{text}</text>
  </g>);
};
/** years card above a bar: "24 YEARS" counting up from 0 (count 0..1) */
export const YearsCard: React.FC<Place & {to: number; count: number; color?: string}> = ({x, y, s, rot = 0, to, count, color = '#FFC83D'}) => {
  if (s <= 0.001) return null; const n = Math.round(to * eout(clamp(count)));
  return (<g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-170} y={-92} width={340} height={150} rx={26} fill="#FFFFFF" stroke={INK} strokeWidth={8} />
    <text y={10} textAnchor="middle" {...txt(104, color, 14)}>{n}</text>
    <text y={44} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={INK} letterSpacing={4}>YEARS</text>
  </g>);
};
/** an equation card: rows of [text, style] pills joined by = and x; `xMark` 0..1 stamps a red X over it, `lit` glows it */
export type Term = {t: string; c?: string};
export const EquationCard: React.FC<Place & {terms: Term[]; xMark?: number; lit?: number; w?: number; dim?: number}> = ({x, y, s, rot = 0, terms, xMark = 0, lit = 0, w = 860, dim = 0}) => {
  if (s <= 0.001) return null;
  // lay the terms out on up to two lines so the text stays >= 54 px
  const size = 52, lw = (str: string) => str.length * size * 0.66 + 34;
  const lines: Term[][] = [[]]; let cur = 0;
  for (const tm of terms) { const ww = lw(tm.t); if (cur + ww > w - 60 && lines[lines.length - 1].length) { lines.push([]); cur = 0; } lines[lines.length - 1].push(tm); cur += ww + 16; }
  const h = 70 + lines.length * 96;
  return (<g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={1 - 0.55 * dim}>
    {lit > 0.01 && <rect x={-w / 2 - 18} y={-h / 2 - 18} width={w + 36} height={h + 36} rx={46} fill="#FFC83D" opacity={0.55 * lit} />}
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={34} fill="#1E3557" stroke={INK} strokeWidth={9} />
    <rect x={-w / 2 + 12} y={-h / 2 + 12} width={w - 24} height={h - 24} rx={26} fill="none" stroke="#FFC83D" strokeWidth={4} opacity={0.8} />
    {lines.map((ln, li) => { const tot = ln.reduce((a, tm) => a + lw(tm.t) + 16, -16); let cx = -tot / 2;
      return <g key={li} transform={`translate(0 ${-h / 2 + 35 + 96 * li + 48})`}>{ln.map((tm, i) => { const ww = lw(tm.t), x0 = cx; cx += ww + 16;
        const op = tm.t === '=' || tm.t === '×';
        return <g key={i}>{!op && <rect x={x0} y={-40} width={ww} height={80} rx={18} fill={tm.c ?? '#FFFFFF'} stroke={INK} strokeWidth={5} />}
          <text x={x0 + ww / 2} y={size * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={op ? size * 1.15 : size} fill={op ? '#FFFFFF' : INK}>{tm.t}</text></g>; })}</g>; })}
    {xMark > 0.01 && (() => { const k = eout(clamp(xMark)), sc = 1.5 - 0.5 * k; return (<g transform={`scale(${sc})`} opacity={k}>
      {[[-1, 1], [1, 1]].map(([a], i) => <g key={i}><path d={`M ${-170 * a} ${-110} L ${170 * a} ${110}`} stroke={INK} strokeWidth={62} strokeLinecap="round" />
        <path d={`M ${-170 * a} ${-110} L ${170 * a} ${110}`} stroke="#E5484D" strokeWidth={42} strokeLinecap="round" /></g>)}</g>); })()}
  </g>);
};
/** a price tag hanging from a string; flips (scaleY through 0) from `a` to `b` around time `at` */
export const PriceTag: React.FC<{t: number; at: number; x: number; y: number; a: string; b: string; s?: number}> = ({t, at, x, y, a, b, s = 1}) => {
  const u = clamp((t - (at - 0.15)) / 0.3), fy = Math.abs(Math.cos(u * Math.PI)), label = u < 0.5 ? a : b, hot = u >= 0.5;
  const sw = spring(t, at + 0.15, 2.4, 4) * 10;
  return (<g transform={`translate(${x} ${y}) scale(${s}) rotate(${sw})`}>
    <path d="M 0 -70 L 0 -8" stroke={INK} strokeWidth={5} />
    <g transform={`scale(1 ${Math.max(0.04, fy)})`}>
      <path d="M -78 34 L 0 -6 L 78 34 L 78 136 L -78 136 Z" fill={hot ? '#E5484D' : '#FFFFFF'} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <circle cx={0} cy={14} r={9} fill={INK} />
      <text y={92} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={58} fill={hot ? '#FFFFFF' : INK}>{label}</text>
    </g>
  </g>);
};
/** the standard card entrance (pop + tilt) */
export const cardPop = (t: number, t0: number, t1 = Infinity) => ({s: pop(t, t0, 0.38) * popOut(t, t1, 0.28), rot: spring(t, t0, 2.2, 4.5) * 6});
