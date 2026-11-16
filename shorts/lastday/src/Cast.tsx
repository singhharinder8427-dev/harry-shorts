import React from 'react';
import {useK} from './Layer';
import {INK, mix} from './color';
import {Puff} from './Bits';

/** v3 cast member: a STRICTLY FLAT 2D cel. Solid white circular face, thick consistent dark outline, flat black oval
 *  eyes, separate graphic eyebrows, a simple drawn mouth, flat solid-colour hair and clothes, a small narrow torso,
 *  extremely thin black line arms and legs, small flat rounded hands, minimal feet.
 *  NO gradients, highlights, shading, textures or thickness here - ever. Shadows come from the 3D world.
 *  The face is white at rest and takes ONE flat colour when the situation calls for it (`tint`, `tintAmt`): green =
 *  poisoned, red + `steam` = burning / furious, pale blue = freezing / scared. Ramp it in and out; never a gradient.
 *  Feet at (0,0); head centre (0,-330), r 100; about 430 units tall. Strokes are px / k (constant screen weight).
 *  Turns are REDRAWN poses (`view`), never a rotated solid: front, left, right, back. */
export type Outfit = {
  shirt?: string; vest?: string; hat?: 'cap' | 'bowler' | 'top' | 'hardhat' | 'beanie' | 'fedora' | 'police' | 'helmet' | 'none'; hatColor?: string;
  hair?: string; hairStyle?: 'short' | 'sides' | 'long' | 'bun' | 'ponytail'; mustache?: boolean; glasses?: boolean; scarf?: string; buttons?: boolean;
  coat?: string; coatStyle?: 'lab' | 'suit' | 'trench';   // long open lab coat, suit jacket with a white V, or a belted trench coat
  headband?: string;                                     // sports headband with two ribbon tails
  sunglasses?: boolean; glassesColor?: string; cigarette?: boolean;
  hold?: 'gun' | 'magnifier' | 'clipboard' | 'briefcase' | 'coffee' | 'phone' | 'wrench' | 'sack';   // prop held in the right hand
  mask?: string;                                         // robber's eye mask (a band across the eyes with eye holes)
  tie?: string; apron?: string; badge?: string; belt?: string;   // flat extras: tie, front apron, small star badge on the chest, waist belt
};
export type PersonPose = {
  id: string; outfit?: Outfit; view?: 'front' | 'left' | 'right' | 'back';
  lean?: number; sx?: number; sy?: number; bounce?: number;                 // lean = whole-body tilt (deg); bounce = lift of the body (units), feet stay
  headTilt?: number; faceDx?: number; faceDy?: number;                      // head tilt (deg) about the neck; face slides on the head = look direction
  lookX?: number; lookY?: number; blink?: number; brow?: number; browUp?: number;   // brow: + = inner end down (angry), - = inner end up (worried)
  eyes?: 'dot' | 'wide' | 'squeeze' | 'closed'; mouth?: 'smile' | 'flat' | 'o' | 'open' | 'grin' | 'teeth' | 'wavy' | 'smirk' | 'frown';
  handL?: [number, number]; handR?: [number, number]; footL?: [number, number]; footR?: [number, number];
  sweat?: number; handsBack?: boolean;
  elbowL?: [number, number]; elbowR?: [number, number]; kneeL?: [number, number]; kneeR?: [number, number];   // optional explicit joints (else auto-bent)
  joints?: boolean;                                                         // false = the old single-curve limbs
  tint?: string; tintAmt?: number; steam?: number; t?: number;              // flat face colour for the situation (hex), 0..1; steam puffs 0..1 (pass t for their motion)
  spots?: number;                                                           // 0..1 flat red spots popping out on the face one by one (rash, blisters, stings)
};

/** Two-segment limbs. Upper arm + forearm 48 + 48, thigh + shin 52 + 52 (limbs hang straight at rest, bend only when a hand or foot comes closer) (units). A joint the pose doesn't set is solved:
 *  elbows bend outward (away from the body), knees bend toward where the character faces (outward in a front view). */
export const ARM = 48, LEG = 52;
const ik = (a: [number, number], b: [number, number], L: number, pickBetter: (q: [number, number]) => number): [number, number] => {
  const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.max(1e-3, Math.min(Math.hypot(dx, dy), 2 * L - 0.01));
  const base = Math.atan2(dy, dx), off = Math.acos(Math.max(-1, Math.min(1, d / (2 * L))));
  const c1: [number, number] = [a[0] + Math.cos(base + off) * L, a[1] + Math.sin(base + off) * L];
  const c2: [number, number] = [a[0] + Math.cos(base - off) * L, a[1] + Math.sin(base - off) * L];
  return pickBetter(c1) >= pickBetter(c2) ? c1 : c2;
};
export const jointsFor = (p: Partial<PersonPose>) => {
  const bounce = p.bounce ?? 0, dir = p.view === 'left' ? -1 : p.view === 'right' ? 1 : 0;
  const hL = p.handL ?? [-78, -120], hR = p.handR ?? [78, -120], fL = p.footL ?? [-30, -5], fR = p.footR ?? [30, -5];
  const kneePick = (side: number) => (q: [number, number]) => (dir ? q[0] * dir : q[0] * side) - q[1] * 0.01;
  return {
    elbowL: p.elbowL ?? ik([-34, -204 - bounce], hL, ARM, (q) => -q[0] + q[1] * 0.15),
    elbowR: p.elbowR ?? ik([34, -204 - bounce], hR, ARM, (q) => q[0] + q[1] * 0.15),
    kneeL: p.kneeL ?? ik([-18, -112 - bounce], [fL[0], fL[1] - 4], LEG, kneePick(-1)),
    kneeR: p.kneeR ?? ik([18, -112 - bounce], [fR[0], fR[1] - 4], LEG, kneePick(1)),
  };
};
const HY = -330, HR = 100;
const SPOTS: [number, number, number][] = [[-64, -54, 11], [60, -60, 9], [-72, 20, 9], [68, 24, 12], [-46, 62, 8], [50, 64, 10], [2, -76, 9]];
const TORSO = 'M -40 -118 C -52 -166 -44 -226 0 -230 C 44 -226 52 -166 40 -118 Q 0 -104 -40 -118 Z';
export const Person: React.FC<PersonPose> = (p) => {
  const k = useK(); const ow = 9 / k;
  const {id, outfit = {}, view = 'front', lean = 0, sx = 1, sy = 1, bounce = 0, headTilt = 0, faceDx = 0, faceDy = 0, lookX = 0, lookY = 0, blink = 0, brow = 0, browUp = 0,
    eyes = 'dot', mouth = 'smile', handL = [-78, -120], handR = [78, -120], footL = [-30, -5], footR = [30, -5], sweat = 0, handsBack = false, spots = 0, tint, tintAmt = 0, steam = 0, t = 0, joints = true} = p;
  const J = jointsFor(p);
  const face = tint ? mix('#FFFFFF', tint, tintAmt) : '#FFFFFF';
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
      case 'fedora': return <g><ellipse cx={hx} cy={top + 40} rx={136} ry={20} fill={hc} stroke={INK} strokeWidth={ow} />
        <path d={`M ${hx - 74} ${top + 40} L ${hx - 64} ${top - 34} Q ${hx} ${top - 12} ${hx + 64} ${top - 34} L ${hx + 74} ${top + 40} Z`} fill={hc} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
        <path d={`M ${hx - 72} ${top + 14} L ${hx + 72} ${top + 14} L ${hx + 74} ${top + 36} L ${hx - 74} ${top + 36} Z`} fill={mix(hc, '#000000', 0.45)} stroke={INK} strokeWidth={ow * 0.8} strokeLinejoin="round" /></g>;
      case 'police': return <g><path d={`M ${hx - 102} ${top + 42} L ${hx - 116} ${top - 4} Q ${hx} ${top - 50} ${hx + 116} ${top - 4} L ${hx + 102} ${top + 42} Z`} fill={hc} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
        <rect x={hx - 100} y={top + 22} width={200} height={20} rx={6} fill={mix(hc, '#000000', 0.45)} stroke={INK} strokeWidth={ow * 0.8} />
        {!back && <path d={`M ${hx - 84} ${top + 42} Q ${hx + (dir || 0) * 20} ${top + 80} ${hx + 84} ${top + 42} Z`} fill={INK} stroke={INK} strokeWidth={ow * 0.6} strokeLinejoin="round" />}
        {!back && <circle cx={hx} cy={top + 2} r={15} fill="#F2C94C" stroke={INK} strokeWidth={ow * 0.6} />}</g>;
      case 'helmet': return <g><circle cx={0} cy={HY} r={140} fill="#CFEFFF" fillOpacity={0.32} stroke={INK} strokeWidth={ow} />
        <rect x={-92} y={HY + 112} width={184} height={30} rx={12} fill="#DADFE6" stroke={INK} strokeWidth={ow} /></g>;
      default: return null;
    }
  })();
  const noHat = !o.hat || o.hat === 'none' || o.hat === 'helmet';
  const hand = (h: [number, number], i: number) => <circle key={'h' + i} cx={h[0]} cy={h[1]} r={13} fill="#FFFFFF" stroke={INK} strokeWidth={ow * 0.7} />;
  const tailSide = dir ? -dir : 1;                                           // ponytail hangs behind the head
  return (
    <g transform={`rotate(${lean}) scale(${sx} ${sy})`}>
      {/* thin line limbs */}
      <g stroke={INK} strokeWidth={limb} fill="none" strokeLinecap="round" strokeLinejoin="round">
        {joints ? <>
          <path d={`M -18 ${-112 - bounce} L ${J.kneeL[0]} ${J.kneeL[1]} L ${footL[0]} ${footL[1] - 4}`} /><path d={`M 18 ${-112 - bounce} L ${J.kneeR[0]} ${J.kneeR[1]} L ${footR[0]} ${footR[1] - 4}`} />
          <path d={`M -34 ${-204 - bounce} L ${J.elbowL[0]} ${J.elbowL[1]} L ${handL[0]} ${handL[1]}`} /><path d={`M 34 ${-204 - bounce} L ${J.elbowR[0]} ${J.elbowR[1]} L ${handR[0]} ${handR[1]}`} />
        </> : <>
          <path d={`M -18 ${-112 - bounce} Q -22 -60 ${footL[0]} ${footL[1] - 4}`} /><path d={`M 18 ${-112 - bounce} Q 22 -60 ${footR[0]} ${footR[1] - 4}`} />
          <path d={arm([-34, -204], handL, -1)} /><path d={arm([34, -204], handR, 1)} />
        </>}
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
        {o.belt && <path d="M -41 -128 Q 0 -116 41 -128 L 40 -116 Q 0 -104 -40 -116 Z" fill={o.belt} stroke={INK} strokeWidth={ow * 0.7} strokeLinejoin="round" />}
        {o.coat && (o.coatStyle === 'lab' || o.coatStyle === 'trench') && <g strokeLinejoin="round">
          <path d="M -47 -92 C -60 -166 -50 -227 0 -233 C 50 -227 60 -166 47 -92 Q 0 -82 -47 -92 Z" fill={o.coat} stroke={INK} strokeWidth={ow} />
          {!back && <><path d="M -15 -229 L 15 -229 L 0 -168 Z" fill={o.shirt} stroke={INK} strokeWidth={ow * 0.7} />
            <path d="M 0 -168 L 0 -88" stroke={INK} strokeWidth={ow * 0.6} fill="none" />
            <path d="M -15 -229 L -26 -196 L -6 -186" stroke={INK} strokeWidth={ow * 0.6} fill="none" /><path d="M 15 -229 L 26 -196 L 6 -186" stroke={INK} strokeWidth={ow * 0.6} fill="none" />
            {o.coatStyle === 'lab' ? <rect x={14} y={-150} width={20} height={16} rx={3} fill="none" stroke={INK} strokeWidth={ow * 0.55} />
              : <>{[-176, -152].map((y) => [-1, 1].map((sd) => <circle key={y + '' + sd} cx={sd * 14} cy={y} r={4} fill={INK} />))}</>}</>}
          {o.coatStyle === 'trench' && <path d="M -52 -136 Q 0 -124 52 -136 L 51 -122 Q 0 -110 -51 -122 Z" fill={mix(o.coat, '#000000', 0.3)} stroke={INK} strokeWidth={ow * 0.7} />}</g>}
        {o.coat && o.coatStyle === 'suit' && <g strokeLinejoin="round">
          <path d={TORSO} fill={o.coat} stroke={INK} strokeWidth={ow} />
          {!back && <><path d="M -16 -229 L 16 -229 L 0 -160 Z" fill="#FFFFFF" stroke={INK} strokeWidth={ow * 0.7} />
            {o.tie && <path d="M -6 -226 L 6 -226 L 8 -216 L 4 -214 L 9 -176 L 0 -164 L -9 -176 L -4 -214 L -8 -216 Z" fill={o.tie} stroke={INK} strokeWidth={ow * 0.5} />}
            <path d="M -16 -229 L -30 -200 L -8 -182" stroke={INK} strokeWidth={ow * 0.6} fill="none" /><path d="M 16 -229 L 30 -200 L 8 -182" stroke={INK} strokeWidth={ow * 0.6} fill="none" />
            {[-148, -130].map((y) => <circle key={y} cx={6} cy={y} r={4.5} fill={INK} />)}</>}</g>}
        {o.apron && !back && <g strokeLinejoin="round"><path d="M -14 -224 L -22 -192 M 14 -224 L 22 -192" stroke={INK} strokeWidth={ow * 0.55} fill="none" />
          <path d="M -24 -194 L 24 -194 L 30 -112 Q 0 -102 -30 -112 Z" fill={o.apron} stroke={INK} strokeWidth={ow * 0.8} />
          <rect x={-12} y={-160} width={24} height={16} rx={3} fill="none" stroke={INK} strokeWidth={ow * 0.5} /></g>}
        {o.tie && !o.coat && !back && <path d="M -6 -228 L 6 -228 L 8 -218 L 4 -216 L 10 -160 L 0 -146 L -10 -160 L -4 -216 L -8 -218 Z" fill={o.tie} stroke={INK} strokeWidth={ow * 0.55} strokeLinejoin="round" />}
        {o.badge && !back && <path d={(() => { const cx = -20, cy = -186, R = 16, r = 6.6; return [...Array(10)].map((_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5, q = i % 2 ? r : R; return `${i ? 'L' : 'M'} ${(cx + Math.cos(a) * q).toFixed(1)} ${(cy + Math.sin(a) * q).toFixed(1)}`; }).join(' ') + ' Z'; })()}
          fill={o.badge} stroke={INK} strokeWidth={ow * 0.45} strokeLinejoin="round" />}
        {/* head: one solid white disc, one outline */}
        <g transform={`rotate(${headTilt} 0 ${HY + HR})`}>
          {o.hair && o.hairStyle === 'sides' && [-1, 1].map((s) => <ellipse key={s} cx={s * 90} cy={HY + 8} rx={24} ry={42} fill={o.hair} stroke={INK} strokeWidth={ow} />)}
          {o.hair && o.hairStyle === 'long' && <path d={`M -108 ${HY - 20} C -130 ${HY + 60} -124 ${HY + 100} -92 ${HY + 112} L 92 ${HY + 112} C 124 ${HY + 100} 130 ${HY + 60} 108 ${HY - 20} Z`} fill={o.hair} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />}
          {o.hair && o.hairStyle === 'ponytail' && <path d={`M ${tailSide * 70} ${HY - 60} C ${tailSide * 170} ${HY - 40} ${tailSide * 170} ${HY + 80} ${tailSide * 130} ${HY + 140} C ${tailSide * 120} ${HY + 80} ${tailSide * 110} ${HY + 20} ${tailSide * 60} ${HY - 10} Z`} fill={o.hair} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />}
          {o.hair && o.hairStyle === 'bun' && <circle cx={0} cy={HY - 118} r={44} fill={o.hair} stroke={INK} strokeWidth={ow} />}
          <circle cx={0} cy={HY} r={HR} fill={back && o.hair ? o.hair : face} stroke={INK} strokeWidth={ow} />
          <defs><clipPath id={`${id}-head`}><circle cx={0} cy={HY} r={HR} /></clipPath></defs>
          {!back && o.hair && o.hairStyle !== 'sides' && noHat && <g clipPath={`url(#${id}-head)`}><path d={`M -120 ${HY - 16} L -120 ${HY - 130} L 120 ${HY - 130} L 120 ${HY - 16} L 100 ${HY - 16} C ${70 + dir * 10} ${HY - 70} ${10 + dir * 30} ${HY - 82} ${-30 + dir * 30} ${HY - 60} C ${-60 + dir * 20} ${HY - 72} -86 ${HY - 52} -100 ${HY - 16} Z`} fill={o.hair} stroke={INK} strokeWidth={ow} strokeLinejoin="round" /></g>}
          {!back && o.hair && o.hairStyle !== 'sides' && noHat && <circle cx={0} cy={HY} r={HR} fill="none" stroke={INK} strokeWidth={ow} />}
          {!back && <>
            {o.mask && <g><g clipPath={`url(#${id}-head)`}><rect x={-110} y={fy - 40} width={220} height={58} rx={10} fill={o.mask} stroke={INK} strokeWidth={ow * 0.8} /></g>
              {[-1, 1].map((s) => <ellipse key={'mh' + s} cx={fx + s * (dir ? 27 : 34) + lookX * 0.5} cy={fy - 10} rx={(dir !== 0 && s === dir ? 0.7 : 1) * 19} ry={22} fill="#FFFFFF" />)}
              <circle cx={0} cy={HY} r={HR} fill="none" stroke={INK} strokeWidth={ow} /></g>}
            {!o.sunglasses && <>{eye(-1)}{eye(1)}</>}{browD(-1)}{browD(1)}
            {o.sunglasses && <g>{[-1, 1].map((s) => { const ex = fx + s * (dir ? 27 : 34), w = dir !== 0 && s === dir ? 0.72 : 1;
              return <rect key={'sg' + s} x={ex - 27 * w} y={fy - 30} width={54 * w} height={36} rx={12} fill={INK} stroke={INK} strokeWidth={ow * 0.6} />; })}
              <path d={`M ${fx - (dir ? 4 : 8)} ${fy - 18} L ${fx + (dir ? 4 : 8)} ${fy - 18}`} stroke={INK} strokeWidth={ow * 0.7} /></g>}
            {o.glasses && !o.sunglasses && [-1, 1].map((s) => <circle key={'g' + s} cx={fx + s * (dir ? 27 : 34)} cy={fy - 10} r={26} fill="none" stroke={o.glassesColor ?? INK} strokeWidth={ow * (o.glassesColor ? 0.95 : 0.7)} />)}
            {o.mustache && <path d={`M ${mx} ${my - 12} C ${mx - 10} ${my - 22} ${mx - 34} ${my - 20} ${mx - 38} ${my - 6} C ${mx - 24} ${my - 10} ${mx - 10} ${my - 6} ${mx} ${my - 8} C ${mx + 10} ${my - 6} ${mx + 24} ${my - 10} ${mx + 38} ${my - 6} C ${mx + 34} ${my - 20} ${mx + 10} ${my - 22} ${mx} ${my - 12} Z`} fill={o.hair ?? INK} stroke={INK} strokeWidth={ow * 0.5} />}
            <g key={'mouth-' + mouth}>{m}</g>
            {o.cigarette && (() => { const sd = dir || 1; return <g transform={`translate(${mx + sd * 18} ${my + 6}) scale(${sd} 1) rotate(14)`}>
              <rect x={0} y={-4.5} width={46} height={9} rx={3} fill="#FFFFFF" stroke={INK} strokeWidth={ow * 0.45} /><rect x={38} y={-4.5} width={8} height={9} rx={2} fill="#FF7A2F" /></g>; })()}
            {spots > 0.01 && SPOTS.map(([x, y, r], i) => { const u = Math.max(0, Math.min(1, spots * SPOTS.length - i)); return u <= 0 ? null :
              <circle key={'sp' + i} cx={x + dir * 14} cy={HY + y} r={r * (u < 1 ? u * 1.25 : 1)} fill="#E5484D" stroke={INK} strokeWidth={ow * 0.45} />; })}
          </>}
          {o.headband && noHat && (() => { const ts = dir ? -dir : -1; return <g>
            <path d={`M ${ts * 88} ${HY - 50} C ${ts * 130} ${HY - 60} ${ts * 150} ${HY - 30} ${ts * 172} ${HY - 4} L ${ts * 154} ${HY + 6} C ${ts * 138} ${HY - 18} ${ts * 120} ${HY - 34} ${ts * 92} ${HY - 34} Z`} fill={o.headband} stroke={INK} strokeWidth={ow * 0.8} strokeLinejoin="round" />
            <path d={`M ${ts * 90} ${HY - 42} C ${ts * 126} ${HY - 30} ${ts * 140} ${HY + 2} ${ts * 150} ${HY + 34} L ${ts * 132} ${HY + 38} C ${ts * 124} ${HY + 8} ${ts * 112} ${HY - 18} ${ts * 92} ${HY - 28} Z`} fill={o.headband} stroke={INK} strokeWidth={ow * 0.8} strokeLinejoin="round" />
            <g clipPath={`url(#${id}-head)`}><rect x={-110} y={HY - 72} width={220} height={36} fill={o.headband} stroke={INK} strokeWidth={ow * 0.8} /></g>
            <circle cx={0} cy={HY} r={HR} fill="none" stroke={INK} strokeWidth={ow} /></g>; })()}
          {hatEl}
          {steam > 0.01 && [-1, 1].map((sd) => { const ph = (t * 1.6 + (sd > 0 ? 0.5 : 0)) % 1, sc = steam * Math.sin(Math.PI * ph);
            return <g key={'st' + sd} transform={`translate(${sd * (112 + ph * 36)} ${HY - 30 - ph * 80}) scale(${sc})`}><Puff c={[[-18, 0, 20], [8, -10, 24], [20, 8, 16]]} ow={7} /></g>; })}
          {sweat > 0.01 && !back && <g transform={`translate(${fx + 92} ${HY - 50}) scale(${sweat})`}>
            <path d="M 0 -26 C 10 -10 16 0 16 8 A 16 16 0 0 1 -16 8 C -16 0 -10 -10 0 -26 Z" fill="#8FD3FF" stroke={INK} strokeWidth={ow * 0.8} strokeLinejoin="round" /></g>}
        </g>
      </g>
      {o.hold && !handsBack && (() => { const sd = dir || 1, [px, py] = handR, k = o.hold;
        const st = {stroke: INK, strokeWidth: ow * 0.7, strokeLinejoin: 'round' as const};
        return <g transform={`translate(${px} ${py}) scale(${sd} 1)`}>
          {k === 'gun' && <path d="M -8 -26 L 58 -26 L 58 -10 L 16 -10 L 12 12 L -8 12 Z" fill="#33353B" {...st} />}
          {k === 'magnifier' && <><path d="M 0 0 L 24 -34" stroke={INK} strokeWidth={ow * 1.3} strokeLinecap="round" /><circle cx={42} cy={-58} r={28} fill="#DFF3FF" {...st} strokeWidth={ow * 1.1} /></>}
          {k === 'clipboard' && <><rect x={-6} y={-70} width={58} height={76} rx={6} fill="#B98552" {...st} /><rect x={2} y={-58} width={42} height={58} fill="#FFFFFF" {...st} strokeWidth={ow * 0.5} />
            <rect x={12} y={-76} width={22} height={12} rx={3} fill="#9AA0A6" {...st} strokeWidth={ow * 0.5} />{[-44, -32, -20].map((y) => <path key={y} d={`M 9 ${y} L 37 ${y}`} stroke={INK} strokeWidth={ow * 0.4} />)}</>}
          {k === 'briefcase' && <><path d="M 4 6 Q 4 -8 18 -8 L 30 -8 Q 44 -8 44 6" fill="none" stroke={INK} strokeWidth={ow * 0.8} /><rect x={-14} y={6} width={76} height={52} rx={8} fill="#7A4A2A" {...st} />
            <path d="M -14 26 L 62 26" stroke={INK} strokeWidth={ow * 0.5} /></>}
          {k === 'coffee' && <><path d="M -10 -44 L 26 -44 L 22 8 L -6 8 Z" fill="#FFFFFF" {...st} /><rect x={-12} y={-50} width={40} height={10} rx={3} fill="#5B3A29" {...st} strokeWidth={ow * 0.5} />
            <rect x={-8} y={-26} width={32} height={14} fill="#C9A27A" stroke="none" /></>}
          {k === 'phone' && <rect x={-4} y={-44} width={24} height={44} rx={5} fill="#2B2B30" {...st} />}
          {k === 'sack' && <><path d="M -10 -6 C -30 10 -46 60 -30 96 Q 16 118 62 96 C 78 60 60 10 36 -6 Z" fill="#B8865A" {...st} /><path d="M -12 -6 Q 12 6 38 -6" stroke={INK} strokeWidth={ow * 0.7} fill="none" />
            <text x={16} y={70} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={900} fontSize={44} fill={INK}>$</text></>}
          {k === 'wrench' && <path d="M -4 6 L 40 -38 M 34 -48 A 14 14 0 1 0 52 -30" stroke="#8C939B" strokeWidth={ow * 1.6} fill="none" strokeLinecap="round" />}
        </g>; })()}
      {!handsBack && [handL, handR].map(hand)}
    </g>
  );
};
