import React from 'react';
import {useK} from './Layer';
import {INK, mix} from './color';

/* Flat 2D chickens for the v3 cast: flat solid shapes, one thick dark outline, black oval eyes, thin black line legs.
 * No gradients, highlights or shading. Feet at (0,0), drawn facing RIGHT, about 200 units tall (hen).
 * Place in the world with <Cel at h={0.42} unitsTall={200}>, or inside a Person's Cel with a transform and `ks`
 * (the extra scale applied around it, so the outline keeps its on-screen weight). */
export type BirdKind = 'hen' | 'rooster' | 'chick';
export type BirdPose = {
  kind?: BirdKind; body?: string; wing?: string; tail?: string;
  dir?: 1 | -1;                 // 1 = faces right, -1 = faces left (a redrawn mirror, never a rotation)
  peck?: number;                // 0..1 head down to the ground
  crow?: number;                // 0..1 head up, beak open
  flap?: number;                // 0..1 wing raised
  sit?: number;                 // 0..1 legs folded, body down (brooding)
  step?: number;                // walk phase (radians)
  bob?: number;                 // small body lift (units)
  eyes?: 'dot' | 'wide' | 'closed' | 'squeeze';
  shrug?: number;               // 0..1 both wings out
  ks?: number;                  // extra scale around the drawing (for outline weight)
  heart?: number;               // 0..1 flat red heart above the head (a mark, not text)
};
const HEN_BODY = '#FFFFFF', COMB = '#E5484D', BEAK = '#F2A93B';

export const Bird: React.FC<BirdPose> = ({kind = 'hen', body, wing, tail, dir = 1, peck = 0, crow = 0, flap = 0, sit = 0, step = 0, bob = 0, eyes = 'dot', shrug = 0, ks = 1, heart = 0}) => {
  const k = useK(); const ow = 9 / (k * ks);
  if (kind === 'chick') return <Chick dir={dir} peck={peck} step={step} bob={bob} flap={flap} ow={ow} eyes={eyes} />;
  const R = kind === 'rooster';
  const bc = body ?? (R ? '#D9762B' : HEN_BODY), wc = wing ?? mix(bc, '#000000', R ? 0.22 : 0.1), tc = tail ?? (R ? '#2B4A36' : bc);
  const legH = 58 * (1 - sit), by = -legH - 64 - bob;             // body centre y
  const hx = 62 + 26 * peck - 6 * crow, hy = by - 62 + 70 * peck - 22 * crow;   // head centre
  const lift = (ph: number) => Math.max(0, Math.sin(ph)) * 14;
  const leg = (x: number, ph: number) => legH > 2 && <path d={`M ${x} ${by + 48} L ${x + Math.sin(ph) * 10} ${-lift(ph) - 2} M ${x + Math.sin(ph) * 10 - 10} ${-lift(ph)} L ${x + Math.sin(ph) * 10 + 16} ${-lift(ph)}`}
    stroke={INK} strokeWidth={ow * 0.75} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  const st = {stroke: INK, strokeWidth: ow, strokeLinejoin: 'round' as const};
  const beakOpen = crow * 18;
  return (<g transform={`scale(${dir} 1)`}>
    {leg(-14, step)}{leg(18, step + Math.PI)}
    {/* tail */}
    {R ? <g fill={tc} {...st}>
        <path d={`M -58 ${by - 6} C -110 ${by - 96} -150 ${by - 70} -136 ${by - 10} C -120 ${by - 50} -96 ${by - 52} -70 ${by + 10} Z`} />
        <path d={`M -62 ${by + 4} C -128 ${by - 40} -150 ${by + 20} -124 ${by + 52} C -116 ${by + 12} -92 ${by + 4} -64 ${by + 24} Z`} fill={mix(tc, '#C0392B', 0.35)} />
      </g>
      : <path d={`M -60 ${by - 4} L -104 ${by - 52} L -96 ${by + 6} L -110 ${by - 18} L -76 ${by + 28} Z`} fill={tc} {...st} />}
    {/* body */}
    <path d={`M -74 ${by} C -74 ${by - 54} -30 ${by - 66} 20 ${by - 52} C 54 ${by - 42} 74 ${by - 22} 74 ${by + 6} C 74 ${by + 50} 30 ${by + 64} -8 ${by + 62} C -50 ${by + 60} -74 ${by + 40} -74 ${by} Z`} fill={bc} {...st} />
    {/* neck to head */}
    <path d={`M 30 ${by - 40} C 40 ${by - 60} ${hx - 26} ${hy + 16} ${hx - 22} ${hy + 4} L ${hx + 18} ${hy + 14} C ${hx + 10} ${hy + 34} 70 ${by - 20} 64 ${by - 8} Z`} fill={R ? '#F2B33D' : bc} stroke="none" />
    {/* wing */}
    <g transform={`rotate(${-flap * 55 - shrug * 70} -18 ${by - 18})`}><path d={`M -40 ${by - 10} C -30 ${by - 40} 22 ${by - 40} 34 ${by - 6} C 20 ${by + 26} -26 ${by + 30} -40 ${by - 10} Z`} fill={wc} {...st} strokeWidth={ow * 0.8} /></g>
    {shrug > 0.01 && <g transform={`rotate(${shrug * 60} 30 ${by - 18})`}><path d={`M 30 ${by - 14} C 50 ${by - 40} 86 ${by - 30} 92 ${by - 6} C 74 ${by + 10} 44 ${by + 6} 30 ${by - 14} Z`} fill={wc} {...st} strokeWidth={ow * 0.8} /></g>}
    {/* head */}
    <g>
      {/* comb */}
      <path d={R ? `M ${hx - 30} ${hy - 22} C ${hx - 34} ${hy - 50} ${hx - 18} ${hy - 58} ${hx - 12} ${hy - 40} C ${hx - 8} ${hy - 64} ${hx + 12} ${hy - 64} ${hx + 8} ${hy - 40} C ${hx + 18} ${hy - 58} ${hx + 34} ${hy - 46} ${hx + 22} ${hy - 22} Z`
        : `M ${hx - 22} ${hy - 26} C ${hx - 24} ${hy - 44} ${hx - 10} ${hy - 48} ${hx - 6} ${hy - 34} C ${hx - 2} ${hy - 48} ${hx + 14} ${hy - 46} ${hx + 12} ${hy - 26} Z`} fill={COMB} {...st} strokeWidth={ow * 0.8} />
      <circle cx={hx} cy={hy} r={R ? 34 : 30} fill={R ? '#F2B33D' : bc} {...st} />
      {/* beak (upper + lower jaw) */}
      <path d={`M ${hx + 24} ${hy - 6} L ${hx + 52} ${hy + 2 - beakOpen * 0.3} L ${hx + 24} ${hy + 8} Z`} fill={BEAK} {...st} strokeWidth={ow * 0.7} />
      {crow > 0.05 && <path d={`M ${hx + 24} ${hy + 8} L ${hx + 46} ${hy + 10 + beakOpen} L ${hx + 22} ${hy + 16} Z`} fill={BEAK} {...st} strokeWidth={ow * 0.7} />}
      {/* wattle */}
      <path d={`M ${hx + 18} ${hy + 14} C ${hx + 14} ${hy + 40} ${hx + 34} ${hy + 40} ${hx + 30} ${hy + 14} Z`} fill={COMB} {...st} strokeWidth={ow * 0.7} />
      {eyes === 'closed' ? <path d={`M ${hx} ${hy - 6} Q ${hx + 9} ${hy} ${hx + 18} ${hy - 6}`} stroke={INK} strokeWidth={ow * 0.8} fill="none" strokeLinecap="round" />
        : eyes === 'squeeze' ? <path d={`M ${hx + 2} ${hy - 14} L ${hx + 14} ${hy - 6} L ${hx + 2} ${hy + 2}`} stroke={INK} strokeWidth={ow * 0.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        : <ellipse cx={hx + 9} cy={hy - 6} rx={eyes === 'wide' ? 8 : 6} ry={eyes === 'wide' ? 12 : 9} fill={INK} />}
    </g>
    {heart > 0.01 && <g transform={`translate(${hx + 10} ${hy - 110 - heart * 30}) scale(${heart})`}>
      <path d="M 0 22 C -40 -6 -30 -40 0 -22 C 30 -40 40 -6 0 22 Z" fill="#E5484D" stroke={INK} strokeWidth={ow * 0.8} strokeLinejoin="round" /></g>}
  </g>);
};
const Chick: React.FC<{dir: 1 | -1; peck: number; step: number; bob: number; flap: number; ow: number; eyes: BirdPose['eyes']}> = ({dir, peck, step, bob, flap, ow, eyes}) => {
  const by = -62 - bob, hx = 30 + 12 * peck, hy = by - 46 + 40 * peck;
  const st = {stroke: INK, strokeWidth: ow, strokeLinejoin: 'round' as const};
  return (<g transform={`scale(${dir} 1)`}>
    {[-10, 12].map((x, i) => { const ph = step + i * Math.PI, l = Math.max(0, Math.sin(ph)) * 8;
      return <path key={i} d={`M ${x} ${by + 34} L ${x + Math.sin(ph) * 6} ${-l - 2} M ${x + Math.sin(ph) * 6 - 7} ${-l} L ${x + Math.sin(ph) * 6 + 11} ${-l}`} stroke={INK} strokeWidth={ow * 0.65} fill="none" strokeLinecap="round" />; })}
    <ellipse cx={0} cy={by} rx={44} ry={38} fill="#FFD84A" {...st} />
    <g transform={`rotate(${-flap * 50} -10 ${by - 6})`}><path d={`M -24 ${by - 4} C -12 ${by - 22} 16 ${by - 18} 18 ${by + 2} C 4 ${by + 16} -18 ${by + 14} -24 ${by - 4} Z`} fill="#F2C230" {...st} strokeWidth={ow * 0.7} /></g>
    <circle cx={hx} cy={hy} r={26} fill="#FFD84A" {...st} />
    <path d={`M ${hx + 22} ${hy - 4} L ${hx + 40} ${hy + 2} L ${hx + 22} ${hy + 8} Z`} fill={BEAK} {...st} strokeWidth={ow * 0.6} />
    {eyes === 'closed' ? <path d={`M ${hx} ${hy - 6} Q ${hx + 7} ${hy - 1} ${hx + 14} ${hy - 6}`} stroke={INK} strokeWidth={ow * 0.7} fill="none" strokeLinecap="round" />
      : <ellipse cx={hx + 7} cy={hy - 5} rx={5} ry={7.5} fill={INK} />}
  </g>);
};
