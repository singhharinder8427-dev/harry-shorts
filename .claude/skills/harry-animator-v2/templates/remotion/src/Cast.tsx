import React from 'react';
import {useK} from './Layer';
import {Puff} from './Bits';
import {INK, mix} from './color';

/** v2 cast member: flat cut-out person with a costume, stick limbs, a big expressive face and colour-emotion gags.
 *  Feet at (0,0); head centre (0,-330), r 100. All strokes are px / k (constant screen weight). */
export type Outfit = {
  shirt?: string; vest?: string; hat?: 'cap' | 'bowler' | 'top' | 'hardhat' | 'beanie' | 'none'; hatColor?: string;
  hair?: string; hairStyle?: 'sides' | 'long' | 'bun' | 'ponytail'; mustache?: boolean; glasses?: boolean; bandana?: string; buttons?: boolean;
};
export type Emotion = 'red' | 'purple' | 'blue' | 'green';
export const EMOTION: Record<Emotion, string> = {red: '#F0605A', purple: '#9B5BD6', blue: '#A9D8FF', green: '#9BD67A'};
export type PersonPose = {
  t?: number; id: string; outfit?: Outfit; lean?: number; sx?: number; sy?: number;
  faceDx?: number; faceDy?: number; lookX?: number; lookY?: number; blink?: number; brow?: number; browUp?: number;
  eyes?: 'dot' | 'wide' | 'squeeze' | 'ring' | 'smug'; mouth?: 'smile' | 'flat' | 'o' | 'open' | 'grin' | 'teeth' | 'wavy' | 'smirk';
  handL?: [number, number]; handR?: [number, number]; footL?: [number, number]; footR?: [number, number];
  tint?: Emotion; tintAmt?: number; steam?: number; sweat?: number; shadow?: boolean; handsBack?: boolean;  // handsBack: hands behind the head/body (drawn before it)
};
const HY = -330, HR = 100;
const TORSO = 'M -56 -118 C -72 -170 -60 -230 0 -234 C 60 -230 72 -170 56 -118 Q 0 -100 -56 -118 Z';
export const Person: React.FC<PersonPose> = (p) => {
  const k = useK(); const ow = 9 / k;
  const {t = 0, id, outfit = {}, lean = 0, sx = 1, sy = 1, faceDx = 0, faceDy = 0, lookX = 0, lookY = 0, blink = 0, brow = 0, browUp = 0,
    eyes = 'dot', mouth = 'smile', handL = [-92, -120], handR = [92, -120], footL = [-36, -6], footR = [36, -6],
    tint, tintAmt = 0, steam = 0, sweat = 0, shadow = true, handsBack = false} = p;
  const o = {shirt: '#F4F1EA', vest: undefined as string | undefined, hat: 'none' as Outfit['hat'], hatColor: '#3A3A3E', hair: undefined as string | undefined, ...outfit};
  const skin = tint ? mix('#FFFFFF', EMOTION[tint], tintAmt) : '#FFFFFF';
  const shade = tint ? mix('#E4E7EC', mix(EMOTION[tint], '#000000', 0.15), tintAmt) : '#E4E7EC';
  const fx = faceDx, fy = HY + faceDy;
  const arm = (s: [number, number], h: [number, number], side: number) => `M ${s[0]} ${s[1]} Q ${(s[0] + h[0]) / 2 + side * 22} ${(s[1] + h[1]) / 2 + 12} ${h[0]} ${h[1]}`;
  const eye = (sgn: number) => {
    const ex = fx + sgn * 34 + lookX, ey = fy - 10 + lookY;
    if (eyes === 'squeeze') return <path key={'sq' + sgn} d={`M ${ex - sgn * 13} ${ey - 12} L ${ex + sgn * 9} ${ey} L ${ex - sgn * 13} ${ey + 12}`} stroke={INK} strokeWidth={ow * 0.9} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    if (eyes === 'ring') return (<g key={'ring' + sgn}><ellipse cx={ex} cy={ey} rx={20} ry={23 * (1 - 0.85 * blink)} fill="white" stroke={INK} strokeWidth={ow * 0.8} />
      <circle cx={ex + lookX * 0.4} cy={ey + lookY * 0.4} r={7} fill={INK} /></g>);
    if (eyes === 'wide') return <g key={'wide' + sgn}><ellipse cx={ex} cy={ey} rx={14} ry={19 * (1 - 0.85 * blink)} fill={INK} /><circle cx={ex + 4} cy={ey - 7} r={4} fill="white" /></g>;
    if (eyes === 'smug') return <path key={'smug' + sgn} d={`M ${ex - 14} ${ey - 2} Q ${ex} ${ey + 8} ${ex + 14} ${ey - 2}`} stroke={INK} strokeWidth={ow * 1.1} fill="none" strokeLinecap="round" />;
    return <ellipse key={'dot' + sgn} cx={ex} cy={ey} rx={10.5} ry={15 * (1 - 0.85 * blink)} fill={INK} />;
  };
  const browD = (sgn: number) => {
    const bx = fx + sgn * 36, by = fy - 50 - browUp * 14, a = brow * 0.38 * sgn, dx = Math.cos(a) * 20, dy = Math.sin(a) * 20;
    return <path key={sgn} d={`M ${bx - dx * sgn} ${by + dy} Q ${bx} ${by - 6} ${bx + dx * sgn} ${by - dy}`} stroke={INK} strokeWidth={ow * 1.15} fill="none" strokeLinecap="round" />;
  };
  const my = fy + 40;
  let m: React.ReactNode = null;
  if (mouth === 'smile') m = <path d={`M ${fx - 22} ${my - 4} Q ${fx} ${my + 15} ${fx + 22} ${my - 4}`} stroke={INK} strokeWidth={ow * 0.85} fill="none" strokeLinecap="round" />;
  else if (mouth === 'flat') m = <path d={`M ${fx - 17} ${my + 2} L ${fx + 17} ${my + 2}`} stroke={INK} strokeWidth={ow * 0.85} strokeLinecap="round" />;
  else if (mouth === 'wavy') m = <path d={`M ${fx - 22} ${my + 4} q 7 -8 14 0 t 15 0 t 15 0`} stroke={INK} strokeWidth={ow * 0.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  else if (mouth === 'smirk') m = <path d={`M ${fx - 20} ${my + 4} Q ${fx + 4} ${my + 14} ${fx + 24} ${my - 8}`} stroke={INK} strokeWidth={ow * 0.9} fill="none" strokeLinecap="round" />;
  else if (mouth === 'o') m = <ellipse cx={fx} cy={my + 6} rx={12} ry={16} fill={INK} />;
  else if (mouth === 'teeth') m = (<g><rect x={fx - 30} y={my - 8} width={60} height={28} rx={10} fill="white" stroke={INK} strokeWidth={ow * 0.85} />
    {[-15, 0, 15].map((d) => <path key={d} d={`M ${fx + d} ${my - 8} L ${fx + d} ${my + 20}`} stroke={INK} strokeWidth={ow * 0.5} />)}
    <path d={`M ${fx - 30} ${my + 6} L ${fx + 30} ${my + 6}`} stroke={INK} strokeWidth={ow * 0.5} /></g>);
  else {
    const d = mouth === 'open' ? `M ${fx - 24} ${my - 4} Q ${fx} ${my + 44} ${fx + 24} ${my - 4} Z` : `M ${fx - 28} ${my - 6} Q ${fx} ${my + 34} ${fx + 28} ${my - 6} Z`;
    m = (<g><clipPath id={`${id}-m`}><path d={d} /></clipPath><path d={d} fill={INK} />
      <ellipse cx={fx} cy={my + 30} rx={16} ry={11} fill="#FF7FA0" clipPath={`url(#${id}-m)`} />
      <path d={d} fill="none" stroke={INK} strokeWidth={ow * 0.7} strokeLinejoin="round" /></g>);
  }
  const hatEl = (() => {
    const hc = o.hatColor, hx = fx * 0.35, top = HY - HR;
    switch (o.hat) {
      case 'cap': return <g><path d={`M ${hx - 98} ${top + 46} C ${hx - 96} ${top - 24} ${hx + 96} ${top - 24} ${hx + 98} ${top + 46} Z`} fill={hc} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
        <path d={`M ${hx + 30} ${top + 44} Q ${hx + 110} ${top + 36} ${hx + 132} ${top + 56} Q ${hx + 80} ${top + 62} ${hx + 30} ${top + 56} Z`} fill={hc} stroke={INK} strokeWidth={ow} strokeLinejoin="round" /></g>;
      case 'bowler': return <g><ellipse cx={hx} cy={top + 34} rx={124} ry={22} fill={hc} stroke={INK} strokeWidth={ow} />
        <path d={`M ${hx - 80} ${top + 34} C ${hx - 82} ${top - 56} ${hx + 82} ${top - 56} ${hx + 80} ${top + 34} Z`} fill={hc} stroke={INK} strokeWidth={ow} strokeLinejoin="round" /></g>;
      case 'top': return <g><rect x={hx - 66} y={top - 110} width={132} height={150} rx={8} fill={hc} stroke={INK} strokeWidth={ow} />
        <rect x={hx - 66} y={top + 4} width={132} height={22} fill="#C0392B" /><ellipse cx={hx} cy={top + 40} rx={118} ry={18} fill={hc} stroke={INK} strokeWidth={ow} /></g>;
      case 'hardhat': return <g><path d={`M ${hx - 92} ${top + 40} C ${hx - 92} ${top - 44} ${hx + 92} ${top - 44} ${hx + 92} ${top + 40} Z`} fill={hc} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
        <rect x={hx - 122} y={top + 32} width={244} height={20} rx={10} fill={hc} stroke={INK} strokeWidth={ow} /><path d={`M ${hx} ${top - 22} L ${hx} ${top + 32}`} stroke={INK} strokeWidth={ow * 0.7} /></g>;
      case 'beanie': return <g><path d={`M ${hx - 96} ${top + 50} C ${hx - 96} ${top - 40} ${hx + 96} ${top - 40} ${hx + 96} ${top + 50} Z`} fill={hc} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
        <rect x={hx - 100} y={top + 30} width={200} height={30} rx={12} fill={mix(hc, '#000000', 0.15)} stroke={INK} strokeWidth={ow} /><circle cx={hx} cy={top - 22} r={20} fill={hc} stroke={INK} strokeWidth={ow} /></g>;
      default: return null;
    }
  })();
  return (
    <g transform={`rotate(${lean}) scale(${sx} ${sy})`}>
      {shadow && <ellipse cx={0} cy={0} rx={95} ry={16} fill="rgba(72,54,42,0.26)" style={{filter: 'blur(3px)'}} />}
      {/* stick limbs (thin ink) */}
      <g stroke={INK} strokeWidth={ow * 1.15} fill="none" strokeLinecap="round">
        <path d={`M -22 -112 Q -26 -60 ${footL[0] + 6} ${footL[1] - 6}`} /><path d={`M 22 -112 Q 26 -60 ${footR[0] - 6} ${footR[1] - 6}`} />
        <path d={arm([-48, -204], handL, -1)} /><path d={arm([48, -204], handR, 1)} />
      </g>
      {handsBack && [handL, handR].map((h, i) => <circle key={'hb' + i} cx={h[0]} cy={h[1]} r={12} fill={INK} />)}
      <ellipse cx={footL[0]} cy={footL[1]} rx={24} ry={11} fill={INK} /><ellipse cx={footR[0]} cy={footR[1]} rx={24} ry={11} fill={INK} />
      {/* clothed torso */}
      <path d={TORSO} fill={o.shirt} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
      {o.vest && <g fill={o.vest} stroke={INK} strokeWidth={ow * 0.8} strokeLinejoin="round">
        <path d="M -56 -118 C -72 -170 -60 -230 -14 -233 L -8 -112 Q -32 -108 -56 -118 Z" /><path d="M 56 -118 C 72 -170 60 -230 14 -233 L 8 -112 Q 32 -108 56 -118 Z" /></g>}
      {o.buttons && [-190, -160, -130].map((y) => <circle key={y} cx={o.vest ? 22 : 0} cy={y} r={5} fill={INK} />)}
      {o.bandana && <path d="M -30 -230 L 30 -230 L 0 -196 Z" fill={o.bandana} stroke={INK} strokeWidth={ow * 0.8} strokeLinejoin="round" />}
      {/* head */}
      {o.hair && (o.hairStyle ?? 'sides') === 'sides' && [-1, 1].map((s) => <ellipse key={s} cx={s * 90} cy={HY + 8} rx={24} ry={42} fill={o.hair} stroke={INK} strokeWidth={ow} />)}
      {o.hair && o.hairStyle === 'long' && <path d={`M -108 ${HY - 20} C -132 ${HY + 80} -122 ${HY + 150} -84 ${HY + 160} L 84 ${HY + 160} C 122 ${HY + 150} 132 ${HY + 80} 108 ${HY - 20} Z`} fill={o.hair} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />}
      {o.hair && o.hairStyle === 'ponytail' && <path d={`M 70 ${HY - 60} C 170 ${HY - 40} 170 ${HY + 80} 130 ${HY + 140} C 120 ${HY + 80} 110 ${HY + 20} 60 ${HY - 10} Z`} fill={o.hair} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />}
      {o.hair && o.hairStyle === 'bun' && <circle cx={0} cy={HY - 118} r={44} fill={o.hair} stroke={INK} strokeWidth={ow} />}
      <circle cx={0} cy={HY} r={HR + ow} fill={INK} />
      <defs><clipPath id={`${id}-head`}><circle cx={0} cy={HY} r={HR} /></clipPath></defs>
      <g clipPath={`url(#${id}-head)`}><circle cx={0} cy={HY} r={HR} fill={shade} /><circle cx={-16} cy={HY - 16} r={HR} fill={skin} /></g>
      {o.hair && o.hairStyle && o.hairStyle !== 'sides' && (!o.hat || o.hat === 'none') && <path d={`M -102 ${HY - 22} C -96 ${HY - 122} 96 ${HY - 122} 102 ${HY - 22} C 70 ${HY - 70} 10 ${HY - 78} -30 ${HY - 52} C -60 ${HY - 66} -86 ${HY - 50} -102 ${HY - 22} Z`} fill={o.hair} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />}
      {eye(-1)}{eye(1)}{browD(-1)}{browD(1)}
      {o.glasses && [-1, 1].map((s) => <circle key={'g' + s} cx={fx + s * 34} cy={fy - 10} r={27} fill="none" stroke={INK} strokeWidth={ow * 0.7} />)}
      {o.mustache && <path d={`M ${fx} ${my - 12} C ${fx - 10} ${my - 22} ${fx - 34} ${my - 20} ${fx - 38} ${my - 6} C ${fx - 24} ${my - 10} ${fx - 10} ${my - 6} ${fx} ${my - 8} C ${fx + 10} ${my - 6} ${fx + 24} ${my - 10} ${fx + 38} ${my - 6} C ${fx + 34} ${my - 20} ${fx + 10} ${my - 22} ${fx} ${my - 12} Z`} fill={o.hair ?? INK} stroke={INK} strokeWidth={ow * 0.5} />}
      <g key={'mouth-' + mouth}>{m}</g>
      {hatEl}
      {!handsBack && [handL, handR].map((h, i) => <circle key={i} cx={h[0]} cy={h[1]} r={12} fill={INK} />)}
      {sweat > 0.01 && <g transform={`translate(${fx + 92} ${HY - 50}) scale(${sweat})`}>
        <path d="M 0 -26 C 10 -10 16 0 16 8 A 16 16 0 0 1 -16 8 C -16 0 -10 -10 0 -26 Z" fill="#8FD3FF" stroke={INK} strokeWidth={ow * 0.8} strokeLinejoin="round" />
        <ellipse cx={-5} cy={6} rx={3.5} ry={6} fill="white" /></g>}
      {steam > 0.01 && [-1, 1].map((s) => {
        const ph = (t * 2.2 + (s > 0 ? 0.5 : 0)) % 1, sc = steam * Math.sin(Math.PI * ph) * 1.1;
        return <g key={'st' + s} transform={`translate(${s * (118 + ph * 40)} ${HY - 10 - ph * 70}) scale(${sc})`}>
          <Puff c={[[-18, 0, 20], [8, -10, 24], [20, 8, 16]]} ow={7} /></g>;
      })}
    </g>
  );
};
