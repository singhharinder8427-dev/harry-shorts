import React from 'react';
import {useK} from './Layer';
import {INK, mix} from './color';

/** v3 cast member: a STRICTLY FLAT 2D cel. Solid white circular face, thick consistent dark outline, flat black oval
 *  eyes, separate graphic eyebrows, a simple drawn mouth, flat solid-colour hair and clothes, a small narrow torso,
 *  extremely thin black line arms and legs, small flat rounded hands, minimal feet.
 *  NO gradients, highlights, shading, tints, textures or thickness here - ever. Shadows come from the 3D world.
 *  Feet at (0,0); head centre (0,-330), r 100; about 430 units tall. Strokes are px / k (constant screen weight).
 *  Turns are REDRAWN poses (`view`), never a rotated solid: front, left, right, back. */
export type Outfit = {
  shirt?: string; vest?: string; hat?: 'cap' | 'bowler' | 'top' | 'hardhat' | 'beanie' | 'none'; hatColor?: string;
  hair?: string; hairStyle?: 'short' | 'sides' | 'long' | 'bun' | 'ponytail'; mustache?: boolean; glasses?: boolean; scarf?: string; buttons?: boolean;
};
export type PersonPose = {
  id: string; outfit?: Outfit; view?: 'front' | 'left' | 'right' | 'back';
  lean?: number; sx?: number; sy?: number; bounce?: number;                 // lean = whole-body tilt (deg); bounce = lift of the body (units), feet stay
  headTilt?: number; faceDx?: number; faceDy?: number;                      // head tilt (deg) about the neck; face slides on the head = look direction
  lookX?: number; lookY?: number; blink?: number; brow?: number; browUp?: number;   // brow: + = inner end down (angry), - = inner end up (worried)
  eyes?: 'dot' | 'wide' | 'squeeze' | 'closed'; mouth?: 'smile' | 'flat' | 'o' | 'open' | 'grin' | 'teeth' | 'wavy' | 'smirk' | 'frown';
  handL?: [number, number]; handR?: [number, number]; footL?: [number, number]; footR?: [number, number];
  sweat?: number; handsBack?: boolean;
};
const HY = -330, HR = 100;
const TORSO = 'M -40 -118 C -52 -166 -44 -226 0 -230 C 44 -226 52 -166 40 -118 Q 0 -104 -40 -118 Z';
export const Person: React.FC<PersonPose> = (p) => {
  const k = useK(); const ow = 9 / k;
  const {id, outfit = {}, view = 'front', lean = 0, sx = 1, sy = 1, bounce = 0, headTilt = 0, faceDx = 0, faceDy = 0, lookX = 0, lookY = 0, blink = 0, brow = 0, browUp = 0,
    eyes = 'dot', mouth = 'smile', handL = [-78, -120], handR = [78, -120], footL = [-30, -5], footR = [30, -5], sweat = 0, handsBack = false} = p;
  const o = {shirt: '#3F7FD9', vest: undefined as string | undefined, hat: 'none' as Outfit['hat'], hatColor: '#3A3A3E', hair: undefined as string | undefined, hairStyle: 'short' as Outfit['hairStyle'], ...outfit};
  const dir = view === 'left' ? -1 : view === 'right' ? 1 : 0, back = view === 'back';
  const fx = faceDx + dir * 40, fy = HY + faceDy;
  const limb = ow * 0.72;                                                    // extremely thin line limbs
  const arm = (s: [number, number], h: [number, number], side: number) => `M ${s[0]} ${s[1] - bounce} Q ${(s[0] + h[0]) / 2 + side * 20} ${(s[1] - bounce + h[1]) / 2 + 12} ${h[0]} ${h[1]}`;
  const eye = (sgn: number) => {
    const far = dir !== 0 && sgn === dir;                                    // in a side view the eye nearer the edge is drawn narrower
    const ex = fx + sgn * (dir ? 27 : 34) + lookX, ey = fy - 10 + lookY, w = far ? 0.68 : 1;
    if (eyes === 'squeeze') return <path key={'sq' + sgn} d={`M ${ex - sgn * 13} ${ey - 12} L ${ex + sgn * 9} ${ey} L ${ex - sgn * 13} ${ey + 12}`} stroke={INK} strokeWidth={ow * 0.9} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    if (eyes === 'closed') return <path key={'cl' + sgn} d={`M ${ex - 14 * w} ${ey - 2} Q ${ex} ${ey + 8} ${ex + 14 * w} ${ey - 2}`} stroke={INK} strokeWidth={ow} fill="none" strokeLinecap="round" />;
    if (eyes === 'wide') return <ellipse key={'wide' + sgn} cx={ex} cy={ey} rx={13.5 * w} ry={20 * (1 - 0.85 * blink)} fill={INK} />;
    return <ellipse key={'dot' + sgn} cx={ex} cy={ey} rx={10.5 * w} ry={15 * (1 - 0.85 * blink)} fill={INK} />;
  };
  const browD = (sgn: number) => {
    const bx = fx + sgn * (dir ? 29 : 36), by = fy - 50 - browUp * 14, a = brow * 0.38 * sgn, dx = Math.cos(a) * 20, dy = Math.sin(a) * 20;
    return <path key={sgn} d={`M ${bx - dx * sgn} ${by + dy} Q ${bx} ${by - 6} ${bx + dx * sgn} ${by - dy}`} stroke={INK} strokeWidth={ow * 1.15} fill="none" strokeLinecap="round" />;
  };
  const mx = fx + dir * 6, my = fy + 40;
  const line = (d: string, w = 0.85) => <path d={d} stroke={INK} strokeWidth={ow * w} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  let m: React.ReactNode = null;
  if (mouth === 'smile') m = line(`M ${mx - 22} ${my - 4} Q ${mx} ${my + 15} ${mx + 22} ${my - 4}`);
  else if (mouth === 'frown') m = line(`M ${mx - 20} ${my + 10} Q ${mx} ${my - 8} ${mx + 20} ${my + 10}`);
  else if (mouth === 'flat') m = line(`M ${mx - 17} ${my + 2} L ${mx + 17} ${my + 2}`);
  else if (mouth === 'wavy') m = line(`M ${mx - 22} ${my + 4} q 7 -8 14 0 t 15 0 t 15 0`, 0.8);
  else if (mouth === 'smirk') m = line(`M ${mx - 20} ${my + 4} Q ${mx + 4} ${my + 14} ${mx + 24} ${my - 8}`, 0.9);
  else if (mouth === 'o') m = <ellipse cx={mx} cy={my + 6} rx={12} ry={16} fill={INK} />;
  else if (mouth === 'teeth') m = (<g><rect x={mx - 30} y={my - 8} width={60} height={28} rx={10} fill="white" stroke={INK} strokeWidth={ow * 0.85} />
    {[-15, 0, 15].map((d) => <path key={d} d={`M ${mx + d} ${my - 8} L ${mx + d} ${my + 20}`} stroke={INK} strokeWidth={ow * 0.5} />)}
    <path d={`M ${mx - 30} ${my + 6} L ${mx + 30} ${my + 6}`} stroke={INK} strokeWidth={ow * 0.5} /></g>);
  else m = <path d={mouth === 'open' ? `M ${mx - 24} ${my - 4} Q ${mx} ${my + 44} ${mx + 24} ${my - 4} Z` : `M ${mx - 28} ${my - 6} Q ${mx} ${my + 34} ${mx + 28} ${my - 6} Z`} fill={INK} stroke={INK} strokeWidth={ow * 0.7} strokeLinejoin="round" />;
  const hc = o.hatColor, top = HY - HR, hx = dir * 6;
  const hatEl = (() => {
    const peak = dir || 1;                                                   // a cap's peak points where the character faces
    switch (o.hat) {
      case 'cap': return <g><path d={`M ${hx - 98} ${top + 46} C ${hx - 96} ${top - 24} ${hx + 96} ${top - 24} ${hx + 98} ${top + 46} Z`} fill={hc} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
        {!back && <path d={`M ${hx + peak * 30} ${top + 44} Q ${hx + peak * 110} ${top + 36} ${hx + peak * 132} ${top + 56} Q ${hx + peak * 80} ${top + 62} ${hx + peak * 30} ${top + 56} Z`} fill={hc} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />}</g>;
      case 'bowler': return <g><ellipse cx={hx} cy={top + 34} rx={124} ry={22} fill={hc} stroke={INK} strokeWidth={ow} />
        <path d={`M ${hx - 80} ${top + 34} C ${hx - 82} ${top - 56} ${hx + 82} ${top - 56} ${hx + 80} ${top + 34} Z`} fill={hc} stroke={INK} strokeWidth={ow} strokeLinejoin="round" /></g>;
      case 'top': return <g><rect x={hx - 66} y={top - 110} width={132} height={150} rx={8} fill={hc} stroke={INK} strokeWidth={ow} />
        <ellipse cx={hx} cy={top + 40} rx={118} ry={18} fill={hc} stroke={INK} strokeWidth={ow} /></g>;
      case 'hardhat': return <g><path d={`M ${hx - 92} ${top + 40} C ${hx - 92} ${top - 44} ${hx + 92} ${top - 44} ${hx + 92} ${top + 40} Z`} fill={hc} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
        <rect x={hx - 122} y={top + 32} width={244} height={20} rx={10} fill={hc} stroke={INK} strokeWidth={ow} /></g>;
      case 'beanie': return <g><path d={`M ${hx - 96} ${top + 50} C ${hx - 96} ${top - 40} ${hx + 96} ${top - 40} ${hx + 96} ${top + 50} Z`} fill={hc} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
        <rect x={hx - 100} y={top + 30} width={200} height={30} rx={12} fill={mix(hc, '#000000', 0.15)} stroke={INK} strokeWidth={ow} /><circle cx={hx} cy={top - 22} r={20} fill={hc} stroke={INK} strokeWidth={ow} /></g>;
      default: return null;
    }
  })();
  const noHat = !o.hat || o.hat === 'none';
  const hand = (h: [number, number], i: number) => <circle key={'h' + i} cx={h[0]} cy={h[1]} r={13} fill="#FFFFFF" stroke={INK} strokeWidth={ow * 0.7} />;
  const tailSide = dir ? -dir : 1;                                           // ponytail hangs behind the head
  return (
    <g transform={`rotate(${lean}) scale(${sx} ${sy})`}>
      {/* thin line limbs */}
      <g stroke={INK} strokeWidth={limb} fill="none" strokeLinecap="round">
        <path d={`M -18 ${-112 - bounce} Q -22 -60 ${footL[0]} ${footL[1] - 4}`} /><path d={`M 18 ${-112 - bounce} Q 22 -60 ${footR[0]} ${footR[1] - 4}`} />
        <path d={arm([-34, -204], handL, -1)} /><path d={arm([34, -204], handR, 1)} />
      </g>
      {handsBack && [handL, handR].map(hand)}
      {/* minimal feet, pointing where the character faces */}
      <ellipse cx={footL[0] + (dir || -1) * 8} cy={footL[1]} rx={17} ry={7.5} fill={INK} /><ellipse cx={footR[0] + (dir || 1) * 8} cy={footR[1]} rx={17} ry={7.5} fill={INK} />
      <g transform={`translate(0 ${-bounce})`}>
        {/* small narrow torso, flat colour */}
        <path d={TORSO} fill={o.shirt} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
        {o.vest && !back && <g fill={o.vest} stroke={INK} strokeWidth={ow * 0.8} strokeLinejoin="round">
          <path d="M -40 -118 C -52 -166 -44 -226 -10 -229 L -6 -110 Q -24 -110 -40 -118 Z" /><path d="M 40 -118 C 52 -166 44 -226 10 -229 L 6 -110 Q 24 -110 40 -118 Z" /></g>}
        {o.vest && back && <path d={TORSO} fill={o.vest} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />}
        {o.buttons && !back && [-190, -160, -130].map((y) => <circle key={y} cx={o.vest ? 16 : 0} cy={y} r={5} fill={INK} />)}
        {o.scarf && <path d="M -30 -232 Q 0 -214 30 -232 L 26 -206 Q 0 -192 -26 -206 Z" fill={o.scarf} stroke={INK} strokeWidth={ow * 0.8} strokeLinejoin="round" />}
        {/* head: one solid white disc, one outline */}
        <g transform={`rotate(${headTilt} 0 ${HY + HR})`}>
          {o.hair && o.hairStyle === 'sides' && [-1, 1].map((s) => <ellipse key={s} cx={s * 90} cy={HY + 8} rx={24} ry={42} fill={o.hair} stroke={INK} strokeWidth={ow} />)}
          {o.hair && o.hairStyle === 'long' && <path d={`M -108 ${HY - 20} C -132 ${HY + 80} -122 ${HY + 150} -84 ${HY + 160} L 84 ${HY + 160} C 122 ${HY + 150} 132 ${HY + 80} 108 ${HY - 20} Z`} fill={o.hair} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />}
          {o.hair && o.hairStyle === 'ponytail' && <path d={`M ${tailSide * 70} ${HY - 60} C ${tailSide * 170} ${HY - 40} ${tailSide * 170} ${HY + 80} ${tailSide * 130} ${HY + 140} C ${tailSide * 120} ${HY + 80} ${tailSide * 110} ${HY + 20} ${tailSide * 60} ${HY - 10} Z`} fill={o.hair} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />}
          {o.hair && o.hairStyle === 'bun' && <circle cx={0} cy={HY - 118} r={44} fill={o.hair} stroke={INK} strokeWidth={ow} />}
          <circle cx={0} cy={HY} r={HR} fill={back && o.hair ? o.hair : '#FFFFFF'} stroke={INK} strokeWidth={ow} />
          <defs><clipPath id={`${id}-head`}><circle cx={0} cy={HY} r={HR} /></clipPath></defs>
          {!back && o.hair && o.hairStyle !== 'sides' && noHat && <g clipPath={`url(#${id}-head)`}><path d={`M -120 ${HY - 16} L -120 ${HY - 130} L 120 ${HY - 130} L 120 ${HY - 16} L 100 ${HY - 16} C ${70 + dir * 10} ${HY - 70} ${10 + dir * 30} ${HY - 82} ${-30 + dir * 30} ${HY - 60} C ${-60 + dir * 20} ${HY - 72} -86 ${HY - 52} -100 ${HY - 16} Z`} fill={o.hair} stroke={INK} strokeWidth={ow} strokeLinejoin="round" /></g>}
          {!back && o.hair && o.hairStyle !== 'sides' && noHat && <circle cx={0} cy={HY} r={HR} fill="none" stroke={INK} strokeWidth={ow} />}
          {!back && <>
            {eye(-1)}{eye(1)}{browD(-1)}{browD(1)}
            {o.glasses && [-1, 1].map((s) => <circle key={'g' + s} cx={fx + s * (dir ? 27 : 34)} cy={fy - 10} r={26} fill="none" stroke={INK} strokeWidth={ow * 0.7} />)}
            {o.mustache && <path d={`M ${mx} ${my - 12} C ${mx - 10} ${my - 22} ${mx - 34} ${my - 20} ${mx - 38} ${my - 6} C ${mx - 24} ${my - 10} ${mx - 10} ${my - 6} ${mx} ${my - 8} C ${mx + 10} ${my - 6} ${mx + 24} ${my - 10} ${mx + 38} ${my - 6} C ${mx + 34} ${my - 20} ${mx + 10} ${my - 22} ${mx} ${my - 12} Z`} fill={o.hair ?? INK} stroke={INK} strokeWidth={ow * 0.5} />}
            <g key={'mouth-' + mouth}>{m}</g>
          </>}
          {hatEl}
          {sweat > 0.01 && !back && <g transform={`translate(${fx + 92} ${HY - 50}) scale(${sweat})`}>
            <path d="M 0 -26 C 10 -10 16 0 16 8 A 16 16 0 0 1 -16 8 C -16 0 -10 -10 0 -26 Z" fill="#8FD3FF" stroke={INK} strokeWidth={ow * 0.8} strokeLinejoin="round" /></g>}
        </g>
      </g>
      {!handsBack && [handL, handR].map(hand)}
    </g>
  );
};
