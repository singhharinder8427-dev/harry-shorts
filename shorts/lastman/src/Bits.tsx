import React from 'react';
import {useK} from './Layer';
import {INK} from './color';
/** cluster of circles with one merged outline (cloud / puff) */
export const Puff: React.FC<{c: [number, number, number][]; fill?: string; ow?: number}> = ({c, fill = 'white', ow = 8}) => {
  const k = useK(); const o = ow / k;
  return (<g>{c.map(([x, y, r], i) => <circle key={'i' + i} cx={x} cy={y} r={r + o} fill={INK} />)}
    {c.map(([x, y, r], i) => <circle key={'f' + i} cx={x} cy={y} r={r} fill={fill} />)}</g>);
};
/** white pill label, constant screen size */
export const Pill: React.FC<{x: number; y: number; text: string; s?: number; size?: number; color?: string; bg?: string}> = ({x, y, text, s = 1, size = 44, color = INK, bg = 'white'}) => {
  const k = useK(); if (s <= 0.001) return null;
  const fs = size / k, w = text.length * fs * 0.6 + fs * 1.2, h = fs * 1.55;
  return (<g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={bg} stroke={INK} strokeWidth={7 / k} />
    <text x={0} y={fs * 0.36} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={fs} fill={color}>{text}</text>
  </g>);
};
/** measurement bracket between two points, revealed by u (0..1) */
export const Bracket: React.FC<{x1: number; y1: number; x2: number; y2: number; u: number; color?: string}> = ({x1, y1, x2, y2, u, color = 'white'}) => {
  const k = useK(); if (u <= 0) return null;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const ax = mx + (x1 - mx) * u, ay = my + (y1 - my) * u, bx = mx + (x2 - mx) * u, by = my + (y2 - my) * u;
  const L = Math.hypot(x2 - x1, y2 - y1), nx = -(y2 - y1) / L, ny = (x2 - x1) / L, tk = 22 / k;
  const d = `M ${ax} ${ay} L ${bx} ${by} M ${ax - nx * tk} ${ay - ny * tk} L ${ax + nx * tk} ${ay + ny * tk} M ${bx - nx * tk} ${by - ny * tk} L ${bx + nx * tk} ${by + ny * tk}`;
  return (<g><path d={d} stroke={INK} strokeWidth={14 / k} strokeLinecap="round" fill="none" />
    <path d={d} stroke={color} strokeWidth={6 / k} strokeLinecap="round" fill="none" /></g>);
};
/** 4-point sparkle */
export const Sparkle: React.FC<{x: number; y: number; r: number; fill?: string}> = ({x, y, r, fill = 'white'}) => {
  const k = useK(); if (r <= 0) return null; const q = r * 0.28;
  return <path d={`M ${x} ${y - r} Q ${x + q} ${y - q} ${x + r} ${y} Q ${x + q} ${y + q} ${x} ${y + r} Q ${x - q} ${y + q} ${x - r} ${y} Q ${x - q} ${y - q} ${x} ${y - r} Z`} fill={fill} stroke={INK} strokeWidth={5 / k} strokeLinejoin="round" />;
};
