import React from 'react';
import {useK} from './Layer';
import {INK, WATER, WATER_DEEP, mix} from './color';
import {Puff, Sparkle} from './Bits';
import {rnd} from './math';
export const R = 330;
import timing from './timing.json';
const LOOP = (timing as any).duration as number;
export const LANDS = [
  'M -250 -120 C -235 -205 -125 -262 -62 -242 C -12 -226 -38 -172 -92 -152 C -132 -137 -150 -84 -198 -62 C -240 -48 -264 -80 -250 -120 Z',
  'M 172 -204 C 242 -172 302 -92 312 -22 C 320 40 272 82 232 62 C 202 46 212 2 182 -30 C 152 -62 122 -110 140 -160 C 148 -186 160 -208 172 -204 Z',
  'M -182 150 C -122 120 -42 160 18 190 C 80 220 122 252 92 290 C 42 322 -60 322 -130 282 C -182 252 -222 182 -182 150 Z',
];
const BASINS: [number, number, number, number][] = [[-205, 40, 70, 42], [235, 175, 62, 40], [30, -295, 58, 26], [-10, 230, 50, 22]];
export const CLOUDS: [number, number][] = [[-170, -235], [215, -100], [-40, 255]];
export type EarthProps = {
  t: number; ocean: number; clouds: number[]; desert?: number; night?: number; shiver?: number; cacti?: number[];
  eyes?: 'open' | 'wide' | 'squeeze'; lookX?: number; lookY?: number; blink?: number; brow?: number; browUp?: number;
  browSide?: number; mouth?: 'grin' | 'smile' | 'o' | 'chatter' | 'flat' | 'smirk'; lids?: number; frost?: number;
};
export const Earth: React.FC<EarthProps> = (p) => {
  const k = useK(); const ow = 9 / k;
  const {t, ocean, clouds, desert = 0, night = 0, shiver = 0, cacti = [], eyes = 'open', lookX = 0, lookY = 0, blink = 0,
    brow = 0, browUp = 0, browSide = 0, mouth = 'grin', lids = 0, frost = 0} = p;
  const jx = shiver * (Math.sin(t * 71) * 3 + Math.sin(t * 43) * 2), jy = shiver * Math.sin(t * 57) * 2;
  const rr = R * 1.18 * ocean;
  const drain = ocean >= 0.999 ? null : Array.from({length: 49}, (_, i) => {
    const a = (i / 48) * Math.PI * 2, r = rr * (1 + 0.05 * Math.sin(5 * a + t * 3) + 0.03 * Math.sin(9 * a - t * 4));
    return `${i ? 'L' : 'M'} ${Math.cos(a) * r} ${Math.sin(a) * r}`;
  }).join(' ') + ' Z';
  const land = mix('#6CC24A', '#E9C77B', desert), landDk = mix('#4FA637', '#D2AC5E', desert);
  const fx = 0, fy = 10;
  const eye = (sgn: number) => {
    const ex = fx + sgn * 78, ey = fy - 28;
    if (eyes === 'squeeze') return <path key={sgn} d={`M ${ex - sgn * 22} ${ey - 20} L ${ex + sgn * 14} ${ey} L ${ex - sgn * 22} ${ey + 20}`} stroke={INK} strokeWidth={ow * 1.1} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    const big = eyes === 'wide' ? 1.18 : 1; const rx = 37 * big, ry = 45 * big * (1 - 0.92 * blink);
    return (<g key={sgn}>
      <clipPath id={`eye${sgn}`}><ellipse cx={ex} cy={ey} rx={rx} ry={ry} /></clipPath>
      <ellipse cx={ex} cy={ey} rx={rx} ry={ry} fill="white" stroke={INK} strokeWidth={ow} />
      <g clipPath={`url(#eye${sgn})`}>
        <circle cx={ex + lookX * 16} cy={ey + 6 + lookY * 16} r={eyes === 'wide' ? 15 : 19} fill={INK} />
        <circle cx={ex + lookX * 16 + 6} cy={ey - 2 + lookY * 16} r={6} fill="white" />
        {lids > 0 && <rect x={ex - rx - 5} y={ey - ry - 5} width={rx * 2 + 10} height={(ry * 2 + 10) * lids * 0.55} fill={mix(WATER, '#C9905C', 1 - ocean)} />}
      </g>
      {lids > 0 && <path d={`M ${ex - rx} ${ey - ry + (ry * 2 + 10) * lids * 0.55 - 5} L ${ex + rx} ${ey - ry + (ry * 2 + 10) * lids * 0.55 - 5}`} stroke={INK} strokeWidth={ow} strokeLinecap="round" />}
      {blink <= 0.05 && null}
    </g>);
  };
  const browD = (sgn: number) => {
    const bx = fx + sgn * 80, by = fy - 98 - browUp * 18 - (sgn === browSide ? 16 : 0);
    const a = brow * 0.4 * sgn, dx = Math.cos(a) * 30, dy = Math.sin(a) * 30;
    return <path key={sgn} d={`M ${bx - dx * sgn} ${by + dy} Q ${bx} ${by - 10} ${bx + dx * sgn} ${by - dy}`} stroke={INK} strokeWidth={ow * 1.6} fill="none" strokeLinecap="round" />;
  };
  const my = fy + 62;
  let mouthEl: React.ReactNode;
  if (mouth === 'grin' || mouth === 'smile') {
    const d = mouth === 'grin' ? `M ${fx - 52} ${my - 8} Q ${fx} ${my + 70} ${fx + 52} ${my - 8} Z` : `M ${fx - 40} ${my} Q ${fx} ${my + 40} ${fx + 40} ${my} Z`;
    mouthEl = (<g><clipPath id="emouth"><path d={d} /></clipPath><path d={d} fill={INK} />
      <ellipse cx={fx} cy={my + (mouth === 'grin' ? 48 : 30)} rx={28} ry={18} fill="#FF7FA0" clipPath="url(#emouth)" />
      <path d={d} fill="none" stroke={INK} strokeWidth={ow} strokeLinejoin="round" /></g>);
  } else if (mouth === 'o') mouthEl = <ellipse cx={fx} cy={my + 18} rx={22} ry={30} fill={INK} />;
  else if (mouth === 'chatter') {
    const o = 6 + Math.abs(Math.sin(t * 38)) * 10;
    mouthEl = (<g><rect x={fx - 44} y={my + 10 - o / 2} width={88} height={26 + o} rx={12} fill={INK} />
      <rect x={fx - 38} y={my + 14 - o / 2} width={76} height={11} rx={4} fill="white" /><rect x={fx - 38} y={my + 27 + o / 2} width={76} height={11} rx={4} fill="white" />
      <path d={`M ${fx - 13} ${my + 14 - o / 2} v 11 M ${fx + 13} ${my + 14 - o / 2} v 11 M ${fx - 13} ${my + 27 + o / 2} v 11 M ${fx + 13} ${my + 27 + o / 2} v 11`} stroke={INK} strokeWidth={ow * 0.5} /></g>);
  } else if (mouth === 'smirk') mouthEl = <path d={`M ${fx - 34} ${my + 14} Q ${fx + 4} ${my + 32} ${fx + 38} ${my + 4}`} stroke={INK} strokeWidth={ow * 1.1} fill="none" strokeLinecap="round" />;
  else mouthEl = <path d={`M ${fx - 30} ${my + 18} L ${fx + 30} ${my + 18}`} stroke={INK} strokeWidth={ow * 1.1} strokeLinecap="round" />;
  return (
    <g transform={`translate(${jx} ${jy})`}>
      <defs><clipPath id="globe"><circle r={R} /></clipPath></defs>
      {cacti.map((c, i) => {
        if (c <= 0) return null; const a = [-128, -95, -58, 42, 78, 118, 150, 205][i] * Math.PI / 180;
        return (<g key={i} transform={`rotate(${a * 57.3 + 90}) translate(0 ${-R + 4}) scale(${c})`}>
          <path d="M 0 6 L 0 -84 M 0 -34 Q -30 -34 -30 -60 M 0 -48 Q 28 -48 28 -74" stroke={INK} strokeWidth={17 + ow * 2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M 0 6 L 0 -84 M 0 -34 Q -30 -34 -30 -60 M 0 -48 Q 28 -48 28 -74" stroke="#58B544" strokeWidth={17} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M -4 -10 L -4 -76" stroke="#3E9A33" strokeWidth={4} strokeLinecap="round" />
        </g>);
      })}
      <circle r={R + ow} fill={INK} />
      <circle r={R} fill="#C9905C" />
      <g clipPath="url(#globe)">
        {BASINS.map(([x, y, rx, ry], i) => <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill="#A8723F" />)}
        {drain === null ? <circle r={R} fill={WATER} /> : rr > 1 && <path d={drain} fill={WATER} />}
        {ocean > 0.05 && <circle r={R} fill="none" stroke={WATER_DEEP} strokeWidth={26} opacity={ocean >= 0.999 ? 1 : 0} />}
        {LANDS.map((d, i) => <g key={i}><path d={d} fill={land} stroke={INK} strokeWidth={ow * 0.9} strokeLinejoin="round" />
          <path d={d} fill={landDk} transform="translate(8 10) scale(0.9)" opacity={0.0} /></g>)}
        <path fillRule="evenodd" d={`M ${-R} 0 A ${R} ${R} 0 1 0 ${R} 0 A ${R} ${R} 0 1 0 ${-R} 0 Z M ${-R - 34} -34 A ${R} ${R} 0 1 1 ${R - 34} -34 A ${R} ${R} 0 1 1 ${-R - 34} -34 Z`} fill="rgba(20,30,90,0.16)" />
        {night > 0 && <circle r={R} fill="#0B1640" opacity={night * 0.42} />}
      </g>
      <circle r={R} fill="none" stroke={INK} strokeWidth={ow} />
      {CLOUDS.map(([x, y], i) => clouds[i] > 0.001 && (
        <g key={i} transform={`translate(${x + Math.sin((2 * Math.PI * 3 * t) / LOOP + i) * 4} ${y}) scale(${clouds[i]})`}>
          <Puff c={[[-38, 6, 26], [-8, -10, 34], [28, -2, 28], [50, 10, 20], [8, 14, 24], [-56, 16, 16]]} />
        </g>))}
      {eye(-1)}{eye(1)}{browD(-1)}{browD(1)}{mouthEl}
      {frost > 0 && [0, 1, 2, 3, 4, 5].map((i) => {
        const a = i * 1.05 + 0.4, r = R + 40 + rnd(i) * 50, tw = 0.6 + 0.4 * Math.sin(t * 6 + i * 2);
        return <Sparkle key={i} x={Math.cos(a) * r} y={Math.sin(a) * r} r={16 * frost * tw} fill="#DDF3FF" />;
      })}
    </g>
  );
};
