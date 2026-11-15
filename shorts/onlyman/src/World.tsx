import React from 'react';
import {useK} from './Layer';
import {Puff} from './Bits';
import {INK, mix} from './color';
import {shades} from './Depth';
import {rnd} from './math';

// ---------------------------------------------------------------- highway
/** abandoned car seen from behind, feet at (0,0), ~360 wide */
export const CarRear: React.FC<{color: string; door?: boolean}> = ({color, door}) => {
  const k = useK(); const ow = 8 / k; const [lit, base, dark] = shades(color);
  return (<g>
    <ellipse cx={0} cy={0} rx={200} ry={22} fill="rgba(40,28,70,0.25)" />
    <rect x={-160} y={-40} width={56} height={44} rx={10} fill={INK} /><rect x={104} y={-40} width={56} height={44} rx={10} fill={INK} />
    <path d="M -175 -40 L -170 -150 Q -160 -175 -130 -178 L 130 -178 Q 160 -175 170 -150 L 175 -40 Z" fill={base} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
    <path d="M -120 -178 L -95 -260 Q -88 -272 -70 -272 L 70 -272 Q 88 -272 95 -260 L 120 -178 Z" fill={dark} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
    <path d="M -96 -186 L -78 -250 L 78 -250 L 96 -186 Z" fill="#9CC9E8" stroke={INK} strokeWidth={ow * 0.8} strokeLinejoin="round" />
    <path d="M -60 -246 L -76 -192" stroke="white" strokeWidth={10} opacity={0.6} strokeLinecap="round" />
    <rect x={-160} y={-140} width={46} height={30} rx={6} fill="#E5483C" stroke={INK} strokeWidth={ow * 0.8} />
    <rect x={114} y={-140} width={46} height={30} rx={6} fill="#E5483C" stroke={INK} strokeWidth={ow * 0.8} />
    <rect x={-50} y={-110} width={100} height={34} rx={4} fill="#F4F1EA" stroke={INK} strokeWidth={ow * 0.8} />
    <path d="M -170 -150 L 170 -150" stroke={lit} strokeWidth={8} />
    {door && <path d="M 175 -150 L 250 -120 L 250 -50 L 175 -50 Z" fill={dark} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />}
  </g>);
};
export const Lamp: React.FC<{on?: number; side?: number}> = ({on = 0, side = 1}) => {
  const k = useK(); const ow = 8 / k;
  return (<g>
    <rect x={-10} y={-560} width={20} height={560} fill="#8A949E" stroke={INK} strokeWidth={ow} />
    <path d={`M 0 -550 Q ${-side * 30} -600 ${-side * 110} -590`} stroke={INK} strokeWidth={16 + ow * 2} fill="none" strokeLinecap="round" />
    <path d={`M 0 -550 Q ${-side * 30} -600 ${-side * 110} -590`} stroke="#8A949E" strokeWidth={16} fill="none" strokeLinecap="round" />
    <rect x={-side * 110 - 34} y={-596} width={68} height={22} rx={8} fill={on > 0 ? mix('#CFCFCF', '#FFE98A', on) : '#CFCFCF'} stroke={INK} strokeWidth={ow} />
  </g>);
};
export const HwySign: React.FC<{lines: string[]}> = ({lines}) => {
  const k = useK(); const ow = 8 / k;
  return (<g>
    <rect x={-190} y={-620} width={20} height={620} fill="#8A949E" stroke={INK} strokeWidth={ow} /><rect x={170} y={-620} width={20} height={620} fill="#8A949E" stroke={INK} strokeWidth={ow} />
    <rect x={-240} y={-820} width={480} height={220} rx={16} fill="#1F7A4A" stroke={INK} strokeWidth={ow} />
    <rect x={-226} y={-806} width={452} height={192} rx={10} fill="none" stroke="white" strokeWidth={6} />
    {lines.map((l, i) => <text key={i} x={0} y={-735 + i * 80} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={66} fill="white">{l}</text>)}
  </g>);
};
/** screen-space city skyline sitting on y = base; lit windows fade out with `lights` (0..1) */
export const Skyline: React.FC<{base: number; dx?: number; color: string; win?: string; lights?: number; seed?: number; h?: number; n?: number; x0?: number; w?: number; litOrder?: (i: number) => number}> = ({base, dx = 0, color, win = '#FFE38A', lights = 0, seed = 1, h = 260, n = 14, x0 = -200, w = 1480, litOrder}) => {
  const out: React.ReactNode[] = [];
  let x = x0 + dx;
  for (let i = 0; i < n; i++) {
    const bw = 70 + rnd(seed * 7 + i) * 90, bh = h * (0.35 + rnd(seed * 3 + i) * 0.75);
    const L = litOrder ? Math.max(0, Math.min(1, lights * 3 - litOrder(i) * 2)) : lights;
    out.push(<g key={i}><rect x={x} y={base - bh} width={bw} height={bh + 4} fill={color} />
      {L > 0.01 && Array.from({length: Math.floor(bh / 34)}, (_, r) => Array.from({length: Math.floor(bw / 26)}, (_, c2) => rnd(i * 31 + r * 7 + c2) < 0.55 ? <rect key={`${r}-${c2}`} x={x + 8 + c2 * 26} y={base - bh + 10 + r * 34} width={12} height={16} fill={win} opacity={L} /> : null))}</g>);
    x += bw + 6 + rnd(seed + i) * 20; if (x > x0 + dx + w) break;
  }
  return <g>{out}</g>;
};

// ---------------------------------------------------------------- power plant
export const Plant: React.FC<{lights: number}> = ({lights}) => {
  const k = useK(); const ow = 9 / k;
  const tower = (x: number, s: number) => {
    const [lit, base, dark] = shades('#C9C4BC');
    const d = `M ${x - 200 * s} 0 C ${x - 140 * s} ${-300 * s} ${x - 130 * s} ${-520 * s} ${x - 165 * s} ${-720 * s} L ${x + 165 * s} ${-720 * s} C ${x + 130 * s} ${-520 * s} ${x + 140 * s} ${-300 * s} ${x + 200 * s} 0 Z`;
    return (<g><path d={d} fill={base} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
      <path d={`M ${x + 40 * s} 0 C ${x + 80 * s} ${-300 * s} ${x + 85 * s} ${-520 * s} ${x + 60 * s} ${-718 * s} L ${x + 165 * s} ${-720 * s} C ${x + 130 * s} ${-520 * s} ${x + 140 * s} ${-300 * s} ${x + 200 * s} 0 Z`} fill={dark} />
      <path d={`M ${x - 170 * s} -2 C ${x - 120 * s} ${-300 * s} ${x - 112 * s} ${-520 * s} ${x - 140 * s} ${-716 * s}`} stroke={lit} strokeWidth={14 * s} fill="none" />
      <path d={d} fill="none" stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
      <ellipse cx={x} cy={-720 * s} rx={165 * s} ry={26 * s} fill={dark} stroke={INK} strokeWidth={ow} /></g>);
  };
  const [lit, base, dark] = shades('#D8CDB8');
  return (<g>
    <rect x={-520} y={-1100} width={60} height={1100} fill="#E8E1D5" stroke={INK} strokeWidth={ow} />
    <rect x={-520} y={-1040} width={60} height={50} fill="#D9534F" /><rect x={-520} y={-900} width={60} height={50} fill="#D9534F" />
    <rect x={-520} y={-1100} width={60} height={1100} fill="none" stroke={INK} strokeWidth={ow} />
    {tower(-80, 1)}{tower(330, 0.85)}
    <rect x={-640} y={-360} width={520} height={360} fill={base} stroke={INK} strokeWidth={ow} />
    <rect x={-640} y={-360} width={120} height={360} fill={lit} /><rect x={-640} y={-360} width={520} height={360} fill="none" stroke={INK} strokeWidth={ow} />
    <path d="M -660 -360 L -100 -360 L -140 -410 L -620 -410 Z" fill={dark} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
    {Array.from({length: 8}, (_, i) => <rect key={i} x={-600 + (i % 4) * 115} y={-320 + Math.floor(i / 4) * 140} width={70} height={90} fill={mix('#5A6B85', '#FFE38A', lights)} stroke={INK} strokeWidth={ow * 0.8} />)}
  </g>);
};
/** big wall sign with a lever: lever = 0 (ON, up-left) .. 1 (OFF, down-right) */
export const ShutdownSign: React.FC<{lever: number}> = ({lever}) => {
  const k = useK(); const ow = 8 / k;
  return (<g>
    <rect x={-330} y={-80} width={24} height={80} fill="#8A949E" stroke={INK} strokeWidth={ow} /><rect x={306} y={-80} width={24} height={80} fill="#8A949E" stroke={INK} strokeWidth={ow} />
    <rect x={-360} y={-420} width={720} height={350} rx={18} fill="#F2B33D" stroke={INK} strokeWidth={ow} />
    <rect x={-340} y={-400} width={680} height={310} rx={12} fill="none" stroke={INK} strokeWidth={ow * 0.5} strokeDasharray="30 20" />
    <text x={-60} y={-300} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={70} fill={INK}>AUTO</text>
    <text x={-60} y={-215} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={70} fill={INK}>SHUTDOWN</text>
    <text x={220} y={-345} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={40} fill="#2E8B57">ON</text>
    <text x={220} y={-120} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={40} fill="#C0392B">OFF</text>
    <rect x={196} y={-330} width={48} height={190} rx={24} fill="#3A3A3E" stroke={INK} strokeWidth={ow} />
    <g transform={`translate(220 -235) rotate(${-50 + 100 * lever})`}>
      <rect x={-10} y={-120} width={20} height={120} rx={8} fill="#B8C2CC" stroke={INK} strokeWidth={ow} />
      <circle cx={0} cy={-124} r={26} fill={lever > 0.5 ? '#E5483C' : '#5FB86A'} stroke={INK} strokeWidth={ow} />
    </g>
  </g>);
};

// ---------------------------------------------------------------- subway
export const Pump: React.FC<{on: number; t: number; sad: number}> = ({on, t, sad}) => {
  const k = useK(); const ow = 8 / k;
  const shake = on * Math.sin(t * 40) * 3;
  return (<g transform={`translate(${shake} 0)`}>
    <rect x={-150} y={-260} width={300} height={260} rx={24} fill="#4F7CC2" stroke={INK} strokeWidth={ow} />
    <rect x={-150} y={-260} width={70} height={260} rx={20} fill="#6E96D6" />
    <rect x={-150} y={-260} width={300} height={260} rx={24} fill="none" stroke={INK} strokeWidth={ow} />
    <rect x={-60} y={-330} width={120} height={70} rx={10} fill="#3A3A3E" stroke={INK} strokeWidth={ow} />
    <text x={0} y={-282} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={36} fill="white">PUMP</text>
    {[-1, 1].map((s) => sad > 0.5
      ? <path key={s} d={`M ${s * 50 - s * 16} -158 L ${s * 50 + s * 8} -145 L ${s * 50 - s * 16} -132`} stroke={INK} strokeWidth={ow} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      : <g key={s}><ellipse cx={s * 50} cy={-145} rx={24} ry={30} fill="white" stroke={INK} strokeWidth={ow * 0.8} /><circle cx={s * 50 + 4} cy={-140} r={11} fill={INK} /></g>)}
    {sad > 0.5 ? <path d="M -30 -60 Q 0 -86 30 -60" stroke={INK} strokeWidth={ow} fill="none" strokeLinecap="round" />
      : <path d="M -34 -78 Q 0 -40 34 -78 Z" fill={INK} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />}
  </g>);
};
export const Rat: React.FC<{t: number}> = ({t}) => {
  const k = useK(); const ow = 7 / k;
  return (<g transform={`rotate(${Math.sin(t * 3) * 6})`}>
    <rect x={-150} y={-24} width={300} height={34} rx={10} fill="#A8743F" stroke={INK} strokeWidth={ow} />
    <path d="M 60 -40 Q 130 -60 150 -110" stroke={INK} strokeWidth={6 + ow} fill="none" strokeLinecap="round" />
    <ellipse cx={0} cy={-70} rx={70} ry={52} fill="#9A9AA6" stroke={INK} strokeWidth={ow} />
    <circle cx={-50} cy={-128} r={26} fill="#B9B9C6" stroke={INK} strokeWidth={ow} /><circle cx={30} cy={-128} r={26} fill="#B9B9C6" stroke={INK} strokeWidth={ow} />
    <circle cx={-26} cy={-80} r={9} fill={INK} /><circle cx={16} cy={-80} r={9} fill={INK} />
    <ellipse cx={-6} cy={-58} rx={10} ry={7} fill="#FF8FA8" stroke={INK} strokeWidth={ow * 0.6} />
    <path d="M -20 -40 Q -6 -32 8 -40" stroke={INK} strokeWidth={ow * 0.7} fill="none" strokeLinecap="round" />
  </g>);
};

// ---------------------------------------------------------------- store
export const CAN_COLORS = ['#E5483C', '#F2B33D', '#5FB86A', '#4F7CC2', '#E07A3C'];
export const Can: React.FC<{c: string}> = ({c}) => {
  const k = useK(); const ow = 6 / k;
  return (<g>
    <rect x={-30} y={-80} width={60} height={80} rx={6} fill="#C9CED6" stroke={INK} strokeWidth={ow} />
    <rect x={-30} y={-62} width={60} height={44} fill={c} stroke={INK} strokeWidth={ow * 0.7} />
    <ellipse cx={0} cy={-80} rx={30} ry={8} fill="#E3E7EC" stroke={INK} strokeWidth={ow} />
  </g>);
};
/** pyramid of cans, `rows` rows; g (0..1) pops rows in bottom-up */
export const CanPyramid: React.FC<{rows: number; g: number}> = ({rows, g}) => {
  const out: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    const n = rows - r, s = Math.max(0, Math.min(1, g * rows - r));
    if (s <= 0) continue;
    for (let i = 0; i < n; i++) out.push(<g key={`${r}-${i}`} transform={`translate(${(i - (n - 1) / 2) * 64} ${-r * 82}) scale(${s})`}><Can c={CAN_COLORS[(r * 3 + i) % 5]} /></g>);
  }
  return <g>{out}</g>;
};
export const Cart: React.FC<{full: number}> = ({full}) => {
  const k = useK(); const ow = 8 / k;
  return (<g>
    {[-110, 110].map((x) => <circle key={x} cx={x} cy={-18} r={18} fill={INK} />)}
    {full > 0 && <g transform={`translate(0 -150) scale(${full})`}>{[[-80, 0], [-15, 0], [50, 0], [-50, -70], [15, -70], [80, -10], [-10, -140]].map(([x, y], i) => <g key={i} transform={`translate(${x} ${y})`}><Can c={CAN_COLORS[i % 5]} /></g>)}</g>}
    <path d="M -170 -260 L 170 -260 L 140 -60 L -140 -60 Z" fill="rgba(200,206,214,0.35)" stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
    {[-100, -30, 40, 110].map((x) => <path key={x} d={`M ${x} -260 L ${x * 0.85} -60`} stroke={INK} strokeWidth={ow * 0.5} />)}
    <path d="M -160 -190 L 160 -190 M -150 -125 L 150 -125" stroke={INK} strokeWidth={ow * 0.5} />
    <path d="M -140 -60 L -120 -30 L 120 -30 L 140 -60" stroke={INK} strokeWidth={ow} fill="none" />
  </g>);
};

// ---------------------------------------------------------------- night city
export const Gauge: React.FC<{v: number; label: string[]}> = ({v, label}) => {
  const k = useK(); const ow = 9 / k;
  const a = Math.PI * (1 - v), nx = Math.cos(a) * 180, ny = -Math.sin(a) * 180;
  return (<g>
    <rect x={-40} y={-120} width={80} height={120} fill="#5A6070" stroke={INK} strokeWidth={ow} />
    <rect x={-300} y={-560} width={600} height={460} rx={24} fill="#F4F1EA" stroke={INK} strokeWidth={ow} />
    {[['#5FB86A', 0, 0.33], ['#F2B33D', 0.33, 0.66], ['#E5483C', 0.66, 1]].map(([c, a0, a1], i) => {
      const A0 = Math.PI * (1 - (a0 as number)), A1 = Math.PI * (1 - (a1 as number)), R = 220, r = 160;
      return <path key={i} d={`M ${Math.cos(A0) * R} ${-260 - Math.sin(A0) * R} A ${R} ${R} 0 0 1 ${Math.cos(A1) * R} ${-260 - Math.sin(A1) * R} L ${Math.cos(A1) * r} ${-260 - Math.sin(A1) * r} A ${r} ${r} 0 0 0 ${Math.cos(A0) * r} ${-260 - Math.sin(A0) * r} Z`} fill={c as string} stroke={INK} strokeWidth={ow * 0.7} />;
    })}
    <path d={`M 0 -260 L ${nx} ${-260 + ny}`} stroke={INK} strokeWidth={16} strokeLinecap="round" />
    <circle cx={0} cy={-260} r={22} fill={INK} />
    {label.map((l, i) => <text key={i} x={0} y={-190 + i * 52} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={46} fill={INK}>{l}</text>)}
  </g>);
};
export const Moon: React.FC = () => {
  const k = useK(); const ow = 8 / k;
  return (<g><circle r={330} fill="#FFF6D6" opacity={0.12} /><circle r={200} fill="#FFF6D6" opacity={0.18} />
    <circle r={110} fill="#FFF3C4" stroke={INK} strokeWidth={ow} /><circle cx={-30} cy={-20} r={20} fill="#EADFB0" /><circle cx={35} cy={30} r={14} fill="#EADFB0" /></g>);
};
export const steamPuff = (x: number, y: number, s: number, key: string) => <g key={key} transform={`translate(${x} ${y}) scale(${s})`}><Puff c={[[-60, 10, 60], [0, -30, 80], [64, 0, 64], [10, 40, 56]]} ow={8} /></g>;
