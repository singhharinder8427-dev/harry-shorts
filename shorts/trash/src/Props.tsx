import React from 'react';
import {useK} from './Layer';
import {INK, mix} from './color';

// ---------------------------------------------------------------- the trash bag (main object with a face)
export type BagFace = {
  eyes?: 'open' | 'wide' | 'squeeze' | 'smug'; mouth?: 'smile' | 'o' | 'grin' | 'wavy' | 'smirk' | 'flat';
  lookX?: number; lookY?: number; blink?: number; sweat?: number; brow?: number; browUp?: number;
};
const BAG_D = 'M -66 0 C -96 -6 -100 -62 -88 -100 C -78 -132 -46 -150 -20 -152 L -15 -160 C -34 -176 -44 -198 -26 -205 C -12 -210 -4 -194 0 -180 C 4 -194 12 -210 26 -205 C 44 -198 34 -176 15 -160 L 20 -152 C 46 -150 78 -132 88 -100 C 100 -62 96 -6 66 0 Z';
export const BAG_COLOR = '#56627C';
export const Bag: React.FC<BagFace & {sx?: number; sy?: number; rot?: number; id: string}> = (p) => {
  const k = useK(); const ow = 9 / k;
  const {eyes = 'open', mouth = 'smile', lookX = 0, lookY = 0, blink = 0, sweat = 0, brow = 0, browUp = 0, sx = 1, sy = 1, rot = 0, id} = p;
  const eye = (sgn: number) => {
    const ex = sgn * 28, ey = -92;
    if (eyes === 'squeeze') return <path key={sgn} d={`M ${ex - sgn * 13} ${ey - 13} L ${ex + sgn * 9} ${ey} L ${ex - sgn * 13} ${ey + 13}`} stroke={INK} strokeWidth={ow * 0.95} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    const big = eyes === 'wide' ? 1.18 : 1, rx = 18 * big, ry = 23 * big * (1 - 0.9 * blink);
    const px = ex + lookX * 8, py = ey + 3 + lookY * 9;
    return (<g key={sgn}>
      <clipPath id={`${id}-e${sgn}`}><ellipse cx={ex} cy={ey} rx={rx} ry={ry} /></clipPath>
      <ellipse cx={ex} cy={ey} rx={rx} ry={ry} fill="white" stroke={INK} strokeWidth={ow * 0.75} />
      <g clipPath={`url(#${id}-e${sgn})`}>
        <circle cx={px} cy={py} r={eyes === 'wide' ? 7.5 : 9.5} fill={INK} />
        <circle cx={px + 3.5} cy={py - 4} r={3.4} fill="white" />
        {eyes === 'smug' && <rect x={ex - rx - 4} y={ey - ry - 4} width={rx * 2 + 8} height={ry + 2} fill={BAG_COLOR} />}
      </g>
      {eyes === 'smug' && <path d={`M ${ex - rx} ${ey - 2} L ${ex + rx} ${ey - 2}`} stroke={INK} strokeWidth={ow * 0.75} strokeLinecap="round" />}
    </g>);
  };
  const browD = (sgn: number) => {
    const bx = sgn * 30, by = -126 - browUp * 9, a = brow * 0.4 * sgn, dx = Math.cos(a) * 14, dy = Math.sin(a) * 14;
    return <path key={sgn} d={`M ${bx - dx * sgn} ${by + dy} Q ${bx} ${by - 5} ${bx + dx * sgn} ${by - dy}`} stroke={INK} strokeWidth={ow * 1.1} fill="none" strokeLinecap="round" />;
  };
  const my = -52;
  let m: React.ReactNode;
  if (mouth === 'smile') m = <path d={`M -20 ${my - 3} Q 0 ${my + 14} 20 ${my - 3}`} stroke={INK} strokeWidth={ow * 0.85} fill="none" strokeLinecap="round" />;
  else if (mouth === 'grin') {
    const d = `M -26 ${my - 6} Q 0 ${my + 34} 26 ${my - 6} Z`;
    m = (<g><clipPath id={`${id}-m`}><path d={d} /></clipPath><path d={d} fill={INK} />
      <ellipse cx={0} cy={my + 20} rx={14} ry={9} fill="#FF7FA0" clipPath={`url(#${id}-m)`} />
      <path d={d} fill="none" stroke={INK} strokeWidth={ow * 0.8} strokeLinejoin="round" /></g>);
  } else if (mouth === 'o') m = <ellipse cx={0} cy={my + 4} rx={10} ry={14} fill={INK} />;
  else if (mouth === 'wavy') m = <path d={`M -22 ${my} q 7 -8 14 0 t 15 0 t 15 0`} stroke={INK} strokeWidth={ow * 0.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  else if (mouth === 'smirk') m = <path d={`M -20 ${my + 4} Q 4 ${my + 14} 24 ${my - 8}`} stroke={INK} strokeWidth={ow * 0.9} fill="none" strokeLinecap="round" />;
  else m = <path d={`M -16 ${my + 2} L 16 ${my + 2}`} stroke={INK} strokeWidth={ow * 0.85} strokeLinecap="round" />;
  return (
    <g transform={`rotate(${rot}) scale(${sx} ${sy})`}>
      <path d={BAG_D} fill={BAG_COLOR} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
      <path d="M -66 -30 C -76 -64 -66 -104 -42 -126" stroke="#7F8CA8" strokeWidth={11} fill="none" strokeLinecap="round" />
      <path d="M -18 -152 Q 0 -144 18 -152" stroke={INK} strokeWidth={ow * 0.8} fill="none" strokeLinecap="round" />
      <path d="M 50 -8 Q 62 -40 58 -70" stroke="#47526A" strokeWidth={8} fill="none" strokeLinecap="round" />
      {eye(-1)}{eye(1)}{browD(-1)}{browD(1)}{m}
      {sweat > 0.01 && <g transform={`translate(84 -132) scale(${sweat})`}>
        <path d="M 0 -24 C 9 -9 15 0 15 8 A 15 15 0 0 1 -15 8 C -15 0 -9 -9 0 -24 Z" fill="#8FD3FF" stroke={INK} strokeWidth={ow * 0.8} strokeLinejoin="round" />
        <ellipse cx={-5} cy={6} rx={3.5} ry={6} fill="white" /></g>}
    </g>
  );
};

// ---------------------------------------------------------------- small junk
export const JUNK_COLORS = ['#56627C', '#EDEDED', '#5B9BD5', '#3A3A3E', '#E7C64A', '#7BC46A'];
export const Junk: React.FC<{type: number; c?: string; s?: number; rot?: number; burnt?: number}> = ({type, c = '#56627C', s = 1, rot = 0, burnt = 0}) => {
  const k = useK(); const ow = 7 / k; if (s <= 0.01) return null;
  const A = '#77736E';
  const f = (x: string) => mix(x, A, burnt);
  let el: React.ReactNode;
  switch (type % 5) {
    case 0: el = (<g><path d="M -34 18 C -46 10 -44 -20 -26 -28 L -8 -32 L -12 -42 L 0 -36 L 12 -42 L 8 -32 L 26 -28 C 44 -20 46 10 34 18 Z" fill={f(c)} stroke={INK} strokeWidth={ow} strokeLinejoin="round" /></g>); break;
    case 1: el = (<g><rect x={-16} y={-26} width={32} height={52} rx={6} fill={f('#E5483C')} stroke={INK} strokeWidth={ow} />
      <rect x={-16} y={-8} width={32} height={14} fill={f('#F4F4F4')} /><rect x={-16} y={-26} width={32} height={52} rx={6} fill="none" stroke={INK} strokeWidth={ow} /></g>); break;
    case 2: el = (<g><rect x={-30} y={-26} width={60} height={50} rx={4} fill={f('#C9925A')} stroke={INK} strokeWidth={ow} />
      <path d="M -30 -10 L 30 -10" stroke={f('#A8743F')} strokeWidth={8} /><rect x={-30} y={-26} width={60} height={50} rx={4} fill="none" stroke={INK} strokeWidth={ow} /></g>); break;
    case 3: el = (<g><path d="M -12 30 L -12 -6 Q -12 -16 -6 -20 L -6 -34 L 6 -34 L 6 -20 Q 12 -16 12 -6 L 12 30 Z" fill={f('#66C07A')} stroke={INK} strokeWidth={ow} strokeLinejoin="round" /></g>); break;
    default: el = (<g><path d="M -4 -22 Q 4 -30 10 -24 Q 30 -6 26 22 Q 14 6 6 4 Q 0 26 -14 30 Q -6 8 -16 -2 Q -30 2 -36 16 Q -36 -10 -4 -22 Z" fill={f('#F2D24B')} stroke={INK} strokeWidth={ow} strokeLinejoin="round" /></g>);
  }
  return <g transform={`rotate(${rot}) scale(${s})`}>{el}</g>;
};

// ---------------------------------------------------------------- flame (flat two-tone teardrop, flickers by morphing numbers)
export const Flame: React.FC<{s: number; t: number; i: number}> = ({s, t, i}) => {
  const k = useK(); if (s <= 0.01) return null; const ow = 7 / k;
  const f = 1 + 0.13 * Math.sin(t * 13 + i * 2.1) + 0.06 * Math.sin(t * 23 + i);
  const sw = Math.sin(t * 9 + i * 1.7) * 9;
  const d = (h: number, w: number) => `M ${-w} 0 C ${-w * 1.35} ${-h * 0.25} ${-w * 0.9} ${-h * 0.5} ${-w * 0.5} ${-h * 0.62} C ${-w * 0.25} ${-h * 0.72} ${sw * 0.4} ${-h * 0.8} ${sw} ${-h} C ${w * 0.3 + sw * 0.3} ${-h * 0.78} ${w * 0.8} ${-h * 0.62} ${w * 0.9} ${-h * 0.45} C ${w * 1.3} ${-h * 0.25} ${w * 1.1} ${-h * 0.05} ${w} 0 Z`;
  return (<g transform={`scale(${s})`}>
    <path d={d(150 * f, 40)} fill="#FF7A22" stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
    <path d={d(86 * (2 - f), 22)} fill="#FFD23F" />
  </g>);
};

// ---------------------------------------------------------------- a house with a face (windows = eyes)
export const House: React.FC<{lit: number; warm: number; lookX?: number; color?: string; roof?: string; blink?: number; id: string}> = ({lit, warm, lookX = 0, color = '#F3E3C3', roof = '#D9534F', blink = 0, id}) => {
  const k = useK(); const ow = 8 / k;
  const win = mix('#6E8FB0', '#FFE066', lit);
  return (<g>
    <rect x={-90} y={-160} width={180} height={160} fill={color} stroke={INK} strokeWidth={ow} />
    <path d="M -112 -156 L 0 -262 L 112 -156 Z" fill={roof} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
    {[-1, 1].map((sgn) => {
      const cx = sgn * 42, cy = -108, h = 46 * (1 - 0.85 * blink);
      return (<g key={sgn}>
        <rect x={cx - 23} y={cy - h / 2} width={46} height={h} rx={6} fill={win} stroke={INK} strokeWidth={ow} />
        {blink < 0.5 && <circle cx={cx + lookX * 8} cy={cy + 4} r={8} fill={INK} />}
      </g>);
    })}
    <rect x={-18} y={-44} width={36} height={44} rx={4} fill="#9A6A3E" stroke={INK} strokeWidth={ow} />
    <path d={`M -26 -66 Q 0 ${-66 + 6 + warm * 12} 26 -66`} stroke={INK} strokeWidth={ow * 0.9} fill="none" strokeLinecap="round" />
    {warm > 0.01 && <g opacity={warm}><ellipse cx={-62} cy={-64} rx={13} ry={7} fill="#FF9DB0" /><ellipse cx={62} cy={-64} rx={13} ry={7} fill="#FF9DB0" /></g>}
    <rect x={44} y={-250} width={26} height={60} fill="#B9B2A8" stroke={INK} strokeWidth={ow} />
    <defs><clipPath id={`${id}-c`}><rect x={-90} y={-160} width={180} height={160} /></clipPath></defs>
  </g>);
};

/** orange wavy heat arrow pointing up (black underlay) */
export const HeatArrow: React.FC<{s: number; t: number; i: number}> = ({s, t, i}) => {
  const k = useK(); if (s <= 0.01) return null;
  const n = 8, L = 70;
  const pts = Array.from({length: n + 1}, (_, j) => { const u = j / n; return [Math.sin(u * Math.PI * 3 + t * 6 + i) * 8, -u * L]; });
  const d = pts.map(([x, y], j) => `${j ? 'L' : 'M'} ${x} ${y}`).join(' ');
  const hx = pts[n][0];
  const head = `M ${hx - 14} ${-L + 4} L ${hx} ${-L - 16} L ${hx + 14} ${-L + 4} Z`;
  return (<g transform={`scale(${s})`}>
    <path d={d} stroke={INK} strokeWidth={11 + 10 / k} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d={head} fill={INK} stroke={INK} strokeWidth={10 / k} strokeLinejoin="round" />
    <path d={d} stroke="#FF7A2B" strokeWidth={11} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d={head} fill="#FF7A2B" />
  </g>);
};
