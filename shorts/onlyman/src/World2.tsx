import React from 'react';
import {useK} from './Layer';
import {Puff, Sparkle} from './Bits';
import {INK, mix} from './color';
import {shades} from './Depth';
import {rnd} from './math';

// ---------------------------------------------------------------- street
export const Tree: React.FC<{c?: string; s?: number; sway?: number}> = ({c = '#5FB04E', s = 1, sway = 0}) => {
  const k = useK(); const ow = 8 / k; const [lit, , dark] = shades(c);
  return (<g transform={`scale(${s})`}>
    <ellipse cx={0} cy={0} rx={110} ry={16} fill="rgba(40,28,70,0.22)" />
    <path d="M -16 0 L -12 -230 L 12 -230 L 16 0 Z" fill="#8B5A2B" stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
    <g transform={`rotate(${sway} 0 -230)`}>
      <Puff c={[[-80, -300, 80], [70, -310, 84], [0, -400, 100], [-30, -250, 70], [50, -240, 64]]} fill={c} ow={8} />
      <circle cx={50} cy={-330} r={60} fill={dark} opacity={0.35} /><circle cx={-40} cy={-410} r={44} fill={lit} opacity={0.5} />
    </g>
  </g>);
};
export const HouseB: React.FC<{c: string; roof: string; flip?: boolean}> = ({c, roof, flip}) => {
  const k = useK(); const ow = 8 / k; const [lit, base, dark] = shades(c);
  return (<g transform={flip ? 'scale(-1 1)' : undefined}>
    <rect x={-200} y={-300} width={400} height={300} fill={base} stroke={INK} strokeWidth={ow} />
    <rect x={120} y={-300} width={80} height={300} fill={dark} />
    <rect x={-200} y={-300} width={400} height={300} fill="none" stroke={INK} strokeWidth={ow} />
    <path d="M -235 -294 L 0 -470 L 235 -294 Z" fill={roof} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
    <path d="M -235 -294 L 0 -470" stroke={mix(roof, '#FFFFFF', 0.3)} strokeWidth={10} />
    {[-120, 40].map((x) => <rect key={x} x={x} y={-230} width={80} height={80} fill="#9CC9E8" stroke={INK} strokeWidth={ow} />)}
    <rect x={-40} y={-140} width={80} height={140} fill="#9A6A3E" stroke={INK} strokeWidth={ow} />
    <rect x={-200} y={-20} width={400} height={20} fill={lit} opacity={0.3} />
  </g>);
};
export const Cat: React.FC<{t: number; yawn?: number; lookX?: number; blink?: number}> = ({t, yawn = 0, lookX = 0, blink = 0}) => {
  const k = useK(); const ow = 7 / k; const tail = Math.sin(t * 3) * 14;
  return (<g>
    <ellipse cx={0} cy={0} rx={70} ry={12} fill="rgba(40,28,70,0.22)" />
    <path d={`M 40 -20 Q 110 ${-30 + tail} 100 ${-110 + tail}`} stroke={INK} strokeWidth={22 + ow * 2} fill="none" strokeLinecap="round" />
    <path d={`M 40 -20 Q 110 ${-30 + tail} 100 ${-110 + tail}`} stroke="#F2994A" strokeWidth={22} fill="none" strokeLinecap="round" />
    <path d="M -55 0 C -70 -60 -50 -120 0 -124 C 50 -120 70 -60 55 0 Z" fill="#F2994A" stroke={INK} strokeWidth={ow} />
    <circle cx={0} cy={-150} r={58} fill="#F2994A" stroke={INK} strokeWidth={ow} />
    <path d="M -52 -170 L -40 -228 L -10 -196 Z M 52 -170 L 40 -228 L 10 -196 Z" fill="#F2994A" stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
    <path d="M -28 -186 L -18 -170 M 0 -192 L 0 -174 M 28 -186 L 18 -170" stroke="#C26A24" strokeWidth={6} strokeLinecap="round" />
    {yawn > 0.5 ? <g><path d="M -32 -160 L -14 -154 M 32 -160 L 14 -154" stroke={INK} strokeWidth={ow} strokeLinecap="round" /><ellipse cx={0} cy={-122} rx={16} ry={20} fill={INK} /></g>
      : <g>{[-1, 1].map((s) => <ellipse key={s} cx={s * 22 + lookX * 6} cy={-158} rx={8} ry={12 * (1 - 0.9 * blink)} fill={INK} />)}
        <path d="M -6 -136 L 0 -130 L 6 -136" stroke={INK} strokeWidth={ow * 0.7} fill="none" strokeLinejoin="round" /></g>}
    {[-1, 1].map((s) => <path key={'w' + s} d={`M ${s * 20} -134 L ${s * 70} -140 M ${s * 20} -128 L ${s * 70} -122`} stroke={INK} strokeWidth={3} />)}
  </g>);
};
export const Crown: React.FC = () => {
  const k = useK(); const ow = 8 / k;
  return (<g><path d="M -80 0 L -90 -90 L -45 -50 L 0 -110 L 45 -50 L 90 -90 L 80 0 Z" fill="#FFD23F" stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
    <rect x={-82} y={-22} width={164} height={22} fill="#E8B21E" stroke={INK} strokeWidth={ow * 0.8} />
    {[-45, 0, 45].map((x) => <circle key={x} cx={x} cy={-11} r={8} fill="#E5483C" stroke={INK} strokeWidth={ow * 0.6} />)}
    <circle cx={0} cy={-110} r={10} fill="#5FB86A" stroke={INK} strokeWidth={ow * 0.6} /></g>);
};
/** a pair of empty shoes with a hat on top: where a man vanished */
export const Empty: React.FC<{c?: string}> = ({c = '#3A3A3E'}) => {
  const k = useK(); const ow = 7 / k;
  return (<g><ellipse cx={-30} cy={-10} rx={34} ry={14} fill="#4A3322" stroke={INK} strokeWidth={ow} /><ellipse cx={34} cy={-10} rx={34} ry={14} fill="#4A3322" stroke={INK} strokeWidth={ow} />
    <ellipse cx={0} cy={-34} rx={60} ry={12} fill={c} stroke={INK} strokeWidth={ow} /><path d="M -36 -34 C -36 -80 36 -80 36 -34 Z" fill={c} stroke={INK} strokeWidth={ow} /></g>);
};

// ---------------------------------------------------------------- New York
export const Dalmatian: React.FC<{t: number; look?: number}> = ({t, look = 0}) => {
  const k = useK(); const ow = 7 / k; const tail = Math.sin(t * 6) * 18;
  return (<g>
    <ellipse cx={0} cy={0} rx={90} ry={14} fill="rgba(40,28,70,0.22)" />
    <path d={`M 50 -40 Q 120 ${-50 + tail} 120 ${-120 + tail}`} stroke={INK} strokeWidth={16 + ow * 2} fill="none" strokeLinecap="round" />
    <path d={`M 50 -40 Q 120 ${-50 + tail} 120 ${-120 + tail}`} stroke="white" strokeWidth={16} fill="none" strokeLinecap="round" />
    <path d="M -60 0 C -76 -70 -54 -140 0 -144 C 54 -140 76 -70 60 0 Z" fill="white" stroke={INK} strokeWidth={ow} />
    {[[-30, -60, 12], [24, -90, 10], [10, -30, 9], [-14, -110, 8]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={INK} />)}
    <ellipse cx={0} cy={-190} rx={66} ry={60} fill="white" stroke={INK} strokeWidth={ow} />
    <path d="M -60 -220 C -96 -200 -96 -140 -70 -130 C -60 -160 -56 -190 -50 -210 Z M 60 -220 C 96 -200 96 -140 70 -130 C 60 -160 56 -190 50 -210 Z" fill={INK} />
    {[-1, 1].map((s) => <g key={s}><ellipse cx={s * 24 + look * 8} cy={-200} rx={10} ry={13} fill={INK} /><circle cx={s * 24 + look * 8 + 3} cy={-204} r={3.5} fill="white" /></g>)}
    <ellipse cx={0} cy={-170} rx={14} ry={10} fill={INK} />
    <path d="M -16 -150 Q 0 -138 16 -150" stroke={INK} strokeWidth={ow * 0.7} fill="none" strokeLinecap="round" />
    <circle cx={30} cy={-230} r={7} fill={INK} />
  </g>);
};
export const Helmet: React.FC<{c?: string}> = ({c = '#C0392B'}) => {
  const k = useK(); const ow = 6 / k;
  return (<g><path d="M -46 0 C -46 -56 46 -56 46 0 L 62 6 L -62 6 Z" fill={c} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
    <path d="M 0 -50 L 0 -4" stroke={mix(c, '#000000', 0.25)} strokeWidth={8} /><rect x={-14} y={-38} width={28} height={22} rx={4} fill="#FFD23F" stroke={INK} strokeWidth={ow * 0.7} /></g>);
};
/** wall of 50 helmet hooks; helmets i (0..49) visible with scale s[i] */
export const HelmetWall: React.FC<{s: number[]}> = ({s}) => {
  const k = useK(); const ow = 8 / k;
  return (<g>
    <rect x={-560} y={-520} width={1120} height={520} rx={14} fill="#8B5A2B" stroke={INK} strokeWidth={ow} />
    <rect x={-540} y={-500} width={1080} height={480} rx={8} fill="#A8743F" />
    <text x={0} y={-450} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={46} fill="white" stroke={INK} strokeWidth={6} paintOrder="stroke">FIREFIGHTERS ON DUTY</text>
    {Array.from({length: 50}, (_, i) => { const x = -486 + (i % 10) * 108, y = -350 + Math.floor(i / 10) * 72;
      return <g key={i}><circle cx={x} cy={y - 40} r={5} fill={INK} />{s[i] > 0.01 && <g transform={`translate(${x} ${y}) scale(${s[i] * 0.78})`}><Helmet c={i === 22 ? '#F2B33D' : '#C0392B'} /></g>}</g>; })}
  </g>);
};
export const FireStation: React.FC<{t: number}> = ({t}) => {
  const k = useK(); const ow = 9 / k; const [lit, base, dark] = shades('#B5473A');
  return (<g>
    <rect x={-420} y={-760} width={840} height={760} fill={base} stroke={INK} strokeWidth={ow} />
    <rect x={260} y={-760} width={160} height={760} fill={dark} /><rect x={-420} y={-760} width={120} height={760} fill={lit} opacity={0.5} />
    <rect x={-420} y={-760} width={840} height={760} fill="none" stroke={INK} strokeWidth={ow} />
    <rect x={-300} y={-720} width={600} height={110} rx={10} fill="#F4F1EA" stroke={INK} strokeWidth={ow} />
    <text x={0} y={-648} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={64} fill="#B5473A">FIRE DEPT.</text>
    <rect x={-300} y={-520} width={600} height={520} fill="#2A2A30" stroke={INK} strokeWidth={ow} />
    {/* fire truck front */}
    <g transform="translate(0 0)">
      <rect x={-250} y={-420} width={500} height={380} rx={20} fill="#D63A2F" stroke={INK} strokeWidth={ow} />
      <rect x={-210} y={-390} width={420} height={150} rx={12} fill="#9CC9E8" stroke={INK} strokeWidth={ow} />
      <rect x={-250} y={-200} width={500} height={50} fill="#E0E3E8" stroke={INK} strokeWidth={ow * 0.8} />
      {[-200, 200].map((x) => <circle key={x} cx={x} cy={-110} r={34} fill="#FFE38A" stroke={INK} strokeWidth={ow} />)}
      <rect x={-110} y={-450} width={220} height={36} rx={10} fill={Math.sin(t * 8) > 0 ? '#FF5A4A' : '#5A8DEE'} stroke={INK} strokeWidth={ow} />
      {[-180, 180].map((x) => <rect key={'w' + x} x={x - 40} y={-40} width={80} height={40} rx={8} fill={INK} />)}
    </g>
  </g>);
};
/** screen-space skyscraper canyon wall (left or right) using a perspective camera's projector */
export const towerWindows = (x0: number, y0: number, x1: number, y1: number, cols: number, rows: number, color: string, seed: number) => (
  <g>{Array.from({length: cols * rows}, (_, i) => { const c = i % cols, r = Math.floor(i / cols); if (rnd(seed + i) < 0.15) return null;
    const x = x0 + (c + 0.25) * (x1 - x0) / cols, y = y0 + (r + 0.2) * (y1 - y0) / rows;
    return <rect key={i} x={x} y={y} width={(x1 - x0) / cols * 0.5} height={(y1 - y0) / rows * 0.55} fill={color} />; })}</g>);

// ---------------------------------------------------------------- America at dusk
export const Pole: React.FC = () => {
  const k = useK(); const ow = 8 / k;
  return (<g><rect x={-12} y={-760} width={24} height={760} fill="#7A5634" stroke={INK} strokeWidth={ow} />
    <rect x={-120} y={-720} width={240} height={20} fill="#7A5634" stroke={INK} strokeWidth={ow} />
    {[-100, 0, 100].map((x) => <rect key={x} x={x - 8} y={-736} width={16} height={18} fill="#9CC9E8" stroke={INK} strokeWidth={ow * 0.6} />)}</g>);
};
export const Toolbox: React.FC = () => {
  const k = useK(); const ow = 7 / k;
  return (<g><rect x={-60} y={-60} width={120} height={60} rx={6} fill="#E5483C" stroke={INK} strokeWidth={ow} />
    <path d="M -28 -60 L -28 -82 L 28 -82 L 28 -60" stroke={INK} strokeWidth={ow * 1.4} fill="none" /><rect x={-60} y={-40} width={120} height={8} fill="#B5302A" /></g>);
};
export const Spark: React.FC<{t: number; s: number}> = ({t, s}) => s <= 0.01 ? null : (
  <g transform={`scale(${s})`}>{Array.from({length: 6}, (_, i) => { const a = i * 1.05 + t * 9, r = 30 + (i % 2) * 20;
    return <path key={i} d={`M 0 0 L ${Math.cos(a) * r} ${Math.sin(a) * r}`} stroke="#FFE14D" strokeWidth={8} strokeLinecap="round" />; })}<circle r={14} fill="#FFF6C4" /></g>);

// ---------------------------------------------------------------- Rwanda
export const Parliament: React.FC = () => {
  const k = useK(); const ow = 9 / k; const [lit, base, dark] = shades('#F1ECE2');
  return (<g>
    <rect x={-560} y={-60} width={1120} height={60} fill="#D8D0C2" stroke={INK} strokeWidth={ow} />
    <rect x={-500} y={-120} width={1000} height={60} fill="#E2DACC" stroke={INK} strokeWidth={ow} />
    <rect x={-460} y={-520} width={920} height={400} fill={base} stroke={INK} strokeWidth={ow} />
    <rect x={300} y={-520} width={160} height={400} fill={dark} opacity={0.5} />
    {Array.from({length: 8}, (_, i) => <rect key={i} x={-410 + i * 112} y={-500} width={44} height={380} fill={i < 2 ? lit : '#FFFFFF'} stroke={INK} strokeWidth={ow * 0.7} />)}
    <path d="M -500 -520 L 0 -680 L 500 -520 Z" fill={base} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
    <path d="M -140 -640 C -140 -820 140 -820 140 -640 Z" fill="#7DB0D8" stroke={INK} strokeWidth={ow} />
    <rect x={-6} y={-880} width={12} height={110} fill={INK} /><path d="M 6 -880 L 90 -860 L 6 -838 Z" fill="#3FA7F5" stroke={INK} strokeWidth={ow * 0.6} />
  </g>);
};

// ---------------------------------------------------------------- future
export const Freezer: React.FC<{open: number; t: number}> = ({open, t}) => {
  const k = useK(); const ow = 9 / k; const [lit, base, dark] = shades('#C9D3DC');
  return (<g>
    <rect x={-300} y={-900} width={600} height={900} rx={30} fill={base} stroke={INK} strokeWidth={ow} />
    <rect x={-300} y={-900} width={110} height={900} rx={30} fill={lit} opacity={0.6} />
    <rect x={-250} y={-850} width={500} height={800} rx={16} fill="#2E3A4A" stroke={INK} strokeWidth={ow} />
    {Array.from({length: 4}, (_, r) => <g key={r}><rect x={-230} y={-820 + r * 190} width={460} height={14} fill="#8A949E" />
      {Array.from({length: 9}, (_, c) => <g key={c}><rect x={-212 + c * 50} y={-800 + r * 190} width={26} height={90} rx={8} fill="#DCEBF5" stroke={INK} strokeWidth={ow * 0.5} />
        <rect x={-212 + c * 50} y={-806 + r * 190} width={26} height={20} rx={5} fill={['#4F7CC2', '#5FB86A', '#F2B33D'][(r + c) % 3]} stroke={INK} strokeWidth={ow * 0.5} /></g>)}</g>)}
    <g transform={`translate(-250 0) scale(${1 - open * 0.9} 1) translate(250 0)`}>
      <rect x={-250} y={-850} width={500} height={800} rx={16} fill={dark} stroke={INK} strokeWidth={ow} />
      <rect x={160} y={-520} width={30} height={160} rx={12} fill="#8A949E" stroke={INK} strokeWidth={ow} />
      {[[-150, -700, 40], [80, -300, 30], [-60, -200, 24], [120, -760, 26]].map(([x, y, r], i) => <Sparkle key={i} x={x} y={y} r={r * (0.7 + 0.3 * Math.sin(t * 4 + i))} fill="#E6F6FF" />)}
    </g>
    <rect x={-200} y={-960} width={400} height={70} rx={12} fill="#F4F1EA" stroke={INK} strokeWidth={ow} />
    <text x={0} y={-912} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={40} fill="#2E5B8A">FROZEN SAMPLES</text>
    <path d="M -300 -900 Q -200 -930 -100 -905 Q 0 -935 100 -905 Q 200 -930 300 -900" stroke="white" strokeWidth={18} fill="none" strokeLinecap="round" />
  </g>);
};
export const Baby: React.FC<{blink?: number; smile?: boolean}> = ({blink = 0, smile = true}) => {
  const k = useK(); const ow = 7 / k;
  return (<g>
    <path d="M -80 0 C -90 -60 -70 -110 0 -112 C 70 -110 90 -60 80 0 Z" fill="#BFE0F5" stroke={INK} strokeWidth={ow} />
    <circle cx={0} cy={-160} r={62} fill="white" stroke={INK} strokeWidth={ow} />
    <path d="M -60 -170 C -56 -236 56 -236 60 -170 C 30 -196 -30 -196 -60 -170 Z" fill="#7FB8F0" stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
    {[-1, 1].map((s) => <ellipse key={s} cx={s * 22} cy={-156} rx={7} ry={9 * (1 - 0.9 * blink)} fill={INK} />)}
    {smile ? <path d="M -14 -134 Q 0 -122 14 -134" stroke={INK} strokeWidth={ow * 0.8} fill="none" strokeLinecap="round" /> : <ellipse cx={0} cy={-130} rx={6} ry={7} fill={INK} />}
    <ellipse cx={-36} cy={-140} rx={9} ry={5} fill="#FF9DB0" /><ellipse cx={36} cy={-140} rx={9} ry={5} fill="#FF9DB0" />
  </g>);
};
export const Crib: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const k = useK(); const ow = 8 / k;
  return (<g>
    <rect x={-170} y={-150} width={340} height={150} fill="#F4F1EA" stroke={INK} strokeWidth={ow} />
    {children}
    <rect x={-190} y={-150} width={380} height={24} rx={8} fill="#E8D3B0" stroke={INK} strokeWidth={ow} />
    {Array.from({length: 7}, (_, i) => <rect key={i} x={-160 + i * 52} y={-126} width={12} height={110} fill="#E8D3B0" stroke={INK} strokeWidth={ow * 0.6} />)}
    <rect x={-190} y={-20} width={380} height={20} fill="#E8D3B0" stroke={INK} strokeWidth={ow} />
  </g>);
};
export const Calendar: React.FC<{month: number}> = ({month}) => {
  const k = useK(); const ow = 8 / k; const M = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return (<g><rect x={-120} y={-300} width={240} height={300} rx={12} fill="white" stroke={INK} strokeWidth={ow} />
    <rect x={-120} y={-300} width={240} height={80} rx={12} fill="#E5483C" stroke={INK} strokeWidth={ow} />
    <text x={0} y={-240} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={52} fill="white">{M[Math.max(0, Math.min(11, month))]}</text>
    {Array.from({length: 20}, (_, i) => <rect key={i} x={-96 + (i % 5) * 40} y={-196 + Math.floor(i / 5) * 44} width={28} height={28} rx={4} fill={i < (month + 1) * 1.6 ? '#FFD9D6' : '#EEE'} />)}
  </g>);
};
