import React from 'react';
import {useK} from './Layer';
import {INK} from './color';
import timing from './timing.json';
const LOOP = (timing as any).duration as number;
export const SR = 190;
export type SunProps = {
  t: number; id?: string; eyes?: 'open' | 'wide' | 'squeeze'; mouth?: 'grin' | 'smile' | 'o'; lookX?: number; lookY?: number;
  blink?: number; browUp?: number;
};
/** the Sun: yellow disc, twelve rays with one merged outline, a face */
export const Sun: React.FC<SunProps> = ({t, id = 'sun', eyes = 'open', mouth = 'grin', lookX = 0, lookY = 0, blink = 0, browUp = 0}) => {
  const k = useK(); const ow = 9 / k;
  const rot = (t / LOOP) * 60 * Math.max(1, Math.round(LOOP / 10));   // rays alternate long/short: whole 60-degree steps over the loop
  const rays = Array.from({length: 12}, (_, i) => {
    const a = (i / 12) * Math.PI * 2, w = 0.15, r0 = SR - 12, r1 = SR + 62 + (i % 2) * 14;
    const p = (ang: number, r: number) => `${Math.cos(ang) * r} ${Math.sin(ang) * r}`;
    return `M ${p(a - w, r0)} L ${p(a, r1)} L ${p(a + w, r0)} Z`;
  }).join(' ');
  const eye = (sgn: number) => {
    const ex = sgn * 66, ey = -24;
    if (eyes === 'squeeze') return <path key={sgn} d={`M ${ex - sgn * 20} ${ey - 18} L ${ex + sgn * 13} ${ey} L ${ex - sgn * 20} ${ey + 18}`} stroke={INK} strokeWidth={ow * 1.1} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    const big = eyes === 'wide' ? 1.2 : 1; const rx = 31 * big, ry = 39 * big * (1 - 0.92 * blink);
    return (<g key={sgn}>
      <clipPath id={`${id}-eye${sgn}`}><ellipse cx={ex} cy={ey} rx={rx} ry={ry} /></clipPath>
      <ellipse cx={ex} cy={ey} rx={rx} ry={ry} fill="white" stroke={INK} strokeWidth={ow} />
      <g clipPath={`url(#${id}-eye${sgn})`}>
        <circle cx={ex + lookX * 13} cy={ey + 4 + lookY * 14} r={eyes === 'wide' ? 12 : 16} fill={INK} />
        <circle cx={ex + lookX * 13 + 5} cy={ey - 3 + lookY * 14} r={5} fill="white" />
      </g>
    </g>);
  };
  const brow = (sgn: number) => {
    const bx = sgn * 68, by = -84 - browUp * 16;
    return <path key={sgn} d={`M ${bx - 24} ${by + 2} Q ${bx} ${by - 9} ${bx + 24} ${by + 2}`} stroke={INK} strokeWidth={ow * 1.5} fill="none" strokeLinecap="round" />;
  };
  const my = 46;
  let mouthEl: React.ReactNode;
  if (mouth === 'o') mouthEl = <ellipse cx={0} cy={my + 16} rx={19} ry={26} fill={INK} />;
  else {
    const d = mouth === 'grin' ? `M -46 ${my - 6} Q 0 ${my + 62} 46 ${my - 6} Z` : `M -34 ${my} Q 0 ${my + 36} 34 ${my} Z`;
    mouthEl = (<g><clipPath id={`${id}-mouth`}><path d={d} /></clipPath><path d={d} fill={INK} />
      <ellipse cx={0} cy={my + (mouth === 'grin' ? 42 : 27)} rx={24} ry={15} fill="#FF7FA0" clipPath={`url(#${id}-mouth)`} />
      <path d={d} fill="none" stroke={INK} strokeWidth={ow} strokeLinejoin="round" /></g>);
  }
  return (
    <g>
      <g transform={`rotate(${rot})`}>
        <path d={rays} fill={INK} stroke={INK} strokeWidth={ow * 2} strokeLinejoin="round" />
      </g>
      <circle r={SR + ow} fill={INK} />
      <g transform={`rotate(${rot})`}><path d={rays} fill="#FFA928" /></g>
      <clipPath id={`${id}-disc`}><circle r={SR} /></clipPath>
      <g clipPath={`url(#${id}-disc)`}><circle r={SR} fill="#F5B625" /><circle cx={-18} cy={-18} r={SR} fill="#FFD23F" /></g>
      <ellipse cx={-112} cy={34} rx={24} ry={14} fill="#FFA05A" /><ellipse cx={112} cy={34} rx={24} ry={14} fill="#FFA05A" />
      {eye(-1)}{eye(1)}{brow(-1)}{brow(1)}{mouthEl}
    </g>
  );
};
