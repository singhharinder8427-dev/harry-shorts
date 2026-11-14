import React from 'react';
import {useK} from './Layer';
import {INK, WATER, mix} from './color';
export type Pose = {
  lean?: number; sx?: number; sy?: number; faceDx?: number; faceDy?: number; lookX?: number; lookY?: number;
  blink?: number; brow?: number; browUp?: number; mouth?: 'smile' | 'flat' | 'o' | 'open' | 'wavy' | 'grin';
  eyes?: 'dot' | 'squeeze' | 'wide'; handL?: [number, number]; handR?: [number, number];
  water?: number; waterAlpha?: number; shrivel?: number; sweat?: number; t?: number; id?: string;
};
const HY = -305, HR = 100, OW = 9;
const TORSO = 'M -50 -112 C -64 -160 -50 -212 0 -214 C 50 -212 64 -160 50 -112 Q 0 -94 -50 -112 Z';
export const Character: React.FC<Pose> = (p) => {
  const k = useK(); const ow = OW / k;
  const {lean = 0, sx = 1, sy = 1, faceDx = 0, faceDy = 0, lookX = 0, lookY = 0, blink = 0, brow = 0, browUp = 0,
    mouth = 'smile', eyes = 'dot', handL = [-98, -112], handR = [98, -112], water = 0, waterAlpha = 0, shrivel = 0,
    sweat = 0, t = 0, id = 'c'} = p;
  const shL: [number, number] = [-40, -192], shR: [number, number] = [40, -192];
  const arm = (s: [number, number], h: [number, number], side: number) => {
    const mx = (s[0] + h[0]) / 2 + side * 26, my = (s[1] + h[1]) / 2 + 10;
    return `M ${s[0]} ${s[1]} Q ${mx} ${my} ${h[0]} ${h[1]}`;
  };
  const parts = (fill: string, extra: number) => (
    <g>
      <path d="M -24 -108 Q -30 -60 -36 -16" stroke={fill} strokeWidth={22 + extra * 2} fill="none" strokeLinecap="round" />
      <path d="M 24 -108 Q 30 -60 36 -16" stroke={fill} strokeWidth={22 + extra * 2} fill="none" strokeLinecap="round" />
      <ellipse cx={-44} cy={-12} rx={30 + extra} ry={15 + extra} fill={fill} />
      <ellipse cx={44} cy={-12} rx={30 + extra} ry={15 + extra} fill={fill} />
      <path d={arm(shL, handL, -1)} stroke={fill} strokeWidth={17 + extra * 2} fill="none" strokeLinecap="round" />
      <path d={arm(shR, handR, 1)} stroke={fill} strokeWidth={17 + extra * 2} fill="none" strokeLinecap="round" />
      <path d={TORSO} fill={fill} stroke={fill} strokeWidth={extra * 2} strokeLinejoin="round" />
      <circle cx={0} cy={HY} r={HR + extra} fill={fill} />
    </g>
  );
  const fx = faceDx, fy = HY + faceDy;
  const top = -415, lvl = -water * 415;
  const wave = Array.from({length: 13}, (_, i) => {
    const x = -160 + i * 26.6; return `${i ? 'L' : 'M'} ${x} ${lvl + Math.sin(x / 22 + t * 7) * 5}`;
  }).join(' ') + ` L 160 20 L -160 20 Z`;
  const eyeRy = 15 * (1 - 0.85 * blink);
  const browL = (sgn: number) => {
    const bx = fx + sgn * 34, by = fy - 48 - browUp * 14;
    const a = brow * 0.35 * sgn; // + brow = inner end down (angry/squint), - = worried
    const dx = Math.cos(a) * 18, dy = Math.sin(a) * 18;
    return `M ${bx - dx * sgn} ${by + dy} Q ${bx} ${by - 6} ${bx + dx * sgn} ${by - dy}`;
  };
  const my = fy + 38;
  let mouthEl: React.ReactNode = null;
  if (mouth === 'smile') mouthEl = <path d={`M ${fx - 20} ${my - 4} Q ${fx} ${my + 14} ${fx + 20} ${my - 4}`} stroke={INK} strokeWidth={ow * 0.8} fill="none" strokeLinecap="round" />;
  if (mouth === 'flat') mouthEl = <path d={`M ${fx - 16} ${my + 2} L ${fx + 16} ${my + 2}`} stroke={INK} strokeWidth={ow * 0.8} strokeLinecap="round" />;
  if (mouth === 'wavy') mouthEl = <path d={`M ${fx - 22} ${my + 4} q 7 -8 14 0 t 15 0 t 15 0`} stroke={INK} strokeWidth={ow * 0.75} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  if (mouth === 'o') mouthEl = <ellipse cx={fx} cy={my + 6} rx={11} ry={15} fill={INK} />;
  if (mouth === 'open' || mouth === 'grin') {
    const d = mouth === 'open' ? `M ${fx - 24} ${my - 4} Q ${fx} ${my + 44} ${fx + 24} ${my - 4} Z` : `M ${fx - 28} ${my - 6} Q ${fx} ${my + 34} ${fx + 28} ${my - 6} Z`;
    mouthEl = (<g><clipPath id={`${id}-m`}><path d={d} /></clipPath>
      <path d={d} fill={INK} /><ellipse cx={fx} cy={my + 30} rx={16} ry={11} fill="#FF7FA0" clipPath={`url(#${id}-m)`} />
      <path d={d} fill="none" stroke={INK} strokeWidth={ow * 0.7} strokeLinejoin="round" /></g>);
  }
  const eye = (sgn: number) => {
    const ex = fx + sgn * 32 + lookX, ey = fy - 12 + lookY;
    if (eyes === 'squeeze') return <path d={`M ${ex - sgn * 12} ${ey - 11} L ${ex + sgn * 8} ${ey} L ${ex - sgn * 12} ${ey + 11}`} stroke={INK} strokeWidth={ow * 0.85} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    if (eyes === 'wide') return <g><ellipse cx={ex} cy={ey} rx={14} ry={19 * (1 - 0.85 * blink)} fill={INK} /><circle cx={ex + 4} cy={ey - 7} r={4} fill="white" /></g>;
    return <ellipse cx={ex} cy={ey} rx={10.5} ry={eyeRy} fill={INK} />;
  };
  const skin = mix('#FFFFFF', '#E6D4A8', shrivel * 0.9);
  return (
    <g transform={`rotate(${lean}) scale(${sx} ${sy})`}>
      <ellipse cx={0} cy={0} rx={95} ry={16} fill="rgba(72,54,42,0.26)" style={{filter: 'blur(3px)'}} />
      <defs><mask id={`${id}-body`} maskUnits="userSpaceOnUse" x={-400} y={-600} width={800} height={700}>{parts('white', 0)}</mask>
        <clipPath id={`${id}-head`}><circle cx={0} cy={HY} r={HR} /></clipPath></defs>
      {parts(INK, ow)}
      {parts(skin, 0)}
      <g clipPath={`url(#${id}-head)`}><circle cx={0} cy={HY} r={HR} fill={mix('#E4E7EC', '#CDB483', shrivel)} /><circle cx={-16} cy={HY - 16} r={HR} fill={skin} /></g>
      {waterAlpha > 0 && <g mask={`url(#${id}-body)`} opacity={waterAlpha}>
        <path d={wave} fill={WATER} opacity={0.82} />
        <path d={wave} fill="none" stroke="#BFE6FF" strokeWidth={ow * 0.8} opacity={0.9} transform="translate(0 4)" />
      </g>}
      {shrivel > 0.02 && <g opacity={Math.min(1, shrivel * 1.4)} stroke={mix('#FFFFFF', '#8A6F45', 1)} strokeWidth={ow * 0.55} fill="none" strokeLinecap="round">
        <path d={`M -70 ${HY - 40} q 12 -8 24 0`} /><path d={`M 48 ${HY - 52} q 12 -8 24 0`} />
        <path d={`M -82 ${HY + 18} q 10 -7 20 0 t 20 0`} /><path d={`M 60 ${HY + 30} q 10 -7 20 0`} />
        <path d={`M -30 -170 q 10 -7 20 0 t 20 0`} /><path d={`M -20 -140 q 10 7 20 0 t 20 0`} />
      </g>}
      <circle cx={0} cy={HY} r={HR} fill="none" stroke={INK} strokeWidth={0} />
      {eye(-1)}{eye(1)}
      <path d={browL(-1)} stroke={INK} strokeWidth={ow * 0.85} fill="none" strokeLinecap="round" />
      <path d={browL(1)} stroke={INK} strokeWidth={ow * 0.85} fill="none" strokeLinecap="round" />
      {mouthEl}
      {[handL, handR].map((h, i) => <circle key={i} cx={h[0]} cy={h[1]} r={17} fill={skin} stroke={INK} strokeWidth={ow} />)}
      {sweat > 0 && <g transform={`translate(${86} ${HY - 40 + (1 - sweat) * 0}) scale(${sweat})`}>
        <path d="M 0 -26 C 10 -10 16 0 16 8 A 16 16 0 0 1 -16 8 C -16 0 -10 -10 0 -26 Z" fill="#8FD3FF" stroke={INK} strokeWidth={ow * 0.8} strokeLinejoin="round" />
        <ellipse cx={-5} cy={6} rx={3.5} ry={6} fill="white" /></g>}
    </g>
  );
};
export const Flower: React.FC<{droop: number; t: number}> = ({droop, t}) => {
  const k = useK(); const ow = 8 / k;
  const sway = Math.sin(t * 2.1) * 2 * (1 - droop);
  const ang = (sway + droop * 115) * Math.PI / 180, L = 160 - droop * 25;
  const tx = Math.sin(ang) * L * 0.9, ty = -Math.cos(ang) * L;
  const cx = Math.sin(ang * 0.35) * L * 0.55, cy = -L * 0.75;
  const petal = mix('#FF7BAC', '#B98A52', droop), leaf = mix('#62C04A', '#A88B45', droop);
  const head = 1 - droop * 0.3;
  return (
    <g>
      <ellipse cx={0} cy={0} rx={45} ry={9} fill="rgba(72,54,42,0.22)" />
      <path d={`M 0 0 Q ${cx} ${cy} ${tx} ${ty}`} stroke={INK} strokeWidth={10 + ow * 2} fill="none" strokeLinecap="round" />
      <path d={`M 0 0 Q ${cx} ${cy} ${tx} ${ty}`} stroke={leaf} strokeWidth={10} fill="none" strokeLinecap="round" />
      {[[-1, 0.35], [1, 0.55]].map(([s, f], i) => {
        const px = cx * f * 1.2, py = cy * f * 1.1;
        return <ellipse key={i} cx={px + s * 22} cy={py - droop * 6} rx={24} ry={11 - droop * 4} transform={`rotate(${s * (-28 + droop * 70)} ${px + s * 22} ${py})`} fill={leaf} stroke={INK} strokeWidth={ow} />;
      })}
      <g transform={`translate(${tx} ${ty}) rotate(${ang * 57.3}) scale(${head})`}>
        {Array.from({length: 6}, (_, i) => { const a = i * Math.PI / 3; return <circle key={i} cx={Math.cos(a) * 24} cy={Math.sin(a) * 24} r={17} fill={petal} stroke={INK} strokeWidth={ow} />; })}
        <circle r={17} fill={mix('#FFD84D', '#9C7A40', droop)} stroke={INK} strokeWidth={ow} />
      </g>
    </g>
  );
};
