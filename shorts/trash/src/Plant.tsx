import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Layer, useK} from './Layer';
import {Pill, Puff, Sparkle} from './Bits';
import {Bag, BagFace, Flame, HeatArrow, House, Junk, JUNK_COLORS} from './Props';
import {INK, WATER, mix} from './color';
import {bump, clamp, ein, eio, eout, kfs, lerp, pick, pop, popOut, prog, rnd, smooth, spring} from './math';
import {CUT1, CUT3, K, Tag, camKeys, loopSin, toCam} from './shared';

const GROUND = 300;
const stepTop = (n: number) => -40 + n * 52;
const stepX0 = (n: number) => -370 + n * 118;
const HX = [1400, 1620, 1840];
const SP: [number, number][] = [[170, -1252], [360, -1252], [360, 60], [452, 60]];       // steam pipe
const WIRE: [number, number][] = [[820, 20], [820, -380], [1250, -380]];                  // power line to the pole
const HEAT = 'M 640 240 L 640 410 L 1840 410 M 1400 410 L 1400 290 M 1620 410 L 1620 290 M 1840 410 L 1840 290';
const BAGX = (b: number) => 668 + b * 64;
const ROW = 520;                                      // centre height of items on the ash conveyor

const along = (pts: [number, number][], u: number): [number, number] => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const L = seg.reduce((a, b) => a + b, 0); let d = clamp(u) * L;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i] || i === seg.length - 1) { const v = seg[i] ? d / seg[i] : 0; return [lerp(pts[i][0], pts[i + 1][0], v), lerp(pts[i][1], pts[i + 1][1], v)]; }
    d -= seg[i];
  }
  return pts[pts.length - 1];
};
const plen = (pts: [number, number][]) => pts.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
const poly = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'} ${x} ${y}`).join(' ');
/** periodic emitter: calls fn(i, ts, age) for every live particle */
const emit = (t: number, T0: number, T1: number, dt: number, life: number, fn: (i: number, ts: number, age: number) => React.ReactNode) => {
  const out: React.ReactNode[] = [];
  const i0 = Math.max(0, Math.floor((t - life - T0) / dt)), i1 = Math.floor((t - T0) / dt);
  for (let i = i0; i <= i1; i++) { const ts = T0 + i * dt; if (ts > T1) break; const age = t - ts; if (age < 0 || age > life) continue; out.push(fn(i, ts, age)); }
  return out;
};
/** fat pipe: ink, metal, optional cut-open channel */
const Pipe: React.FC<{d: string; w: number; color: string; inner?: string}> = ({d, w, color, inner}) => {
  const k = useK(); const ow = 8 / k;
  return (<g fill="none" strokeLinejoin="round">
    <path d={d} stroke={INK} strokeWidth={w + ow * 2} strokeLinecap="butt" />
    <path d={d} stroke={color} strokeWidth={w} strokeLinecap="butt" />
    {inner && <path d={d} stroke={inner} strokeWidth={w * 0.55} />}
  </g>);
};
const Claw: React.FC<{open: number; load: boolean}> = ({open, load}) => {
  const k = useK(); const ow = 8 / k;
  const jaw = 'M -10 -10 C -70 0 -84 60 -40 104 L -26 92 C -58 56 -50 14 -4 4 Z';
  return (<g>
    {load && [[-22, 52, 0], [18, 60, 1], [0, 30, 2], [-6, 78, 3]].map(([x, y, j]) => <g key={j} transform={`translate(${x} ${y})`}><Junk type={j} c={JUNK_COLORS[j]} s={0.9} rot={j * 40} /></g>)}
    <g transform={`rotate(${32 * open} -10 -10)`}><path d={jaw} fill="#E39B1E" stroke={INK} strokeWidth={ow} strokeLinejoin="round" /></g>
    <g transform={`scale(-1 1) rotate(${32 * open} -10 -10)`}><path d={jaw} fill="#E39B1E" stroke={INK} strokeWidth={ow} strokeLinejoin="round" /></g>
    <rect x={-42} y={-62} width={84} height={56} rx={10} fill="#F2B33D" stroke={INK} strokeWidth={ow} />
    <circle cx={0} cy={-34} r={10} fill={INK} />
  </g>);
};

const PlantArt: React.FC<{t: number}> = ({t}) => {
  const k = useK(); const ow = 9 / k, ow7 = 7 / k;
  // ---------------- crane
  const cx = kfs(t, [[K.crane + 0.85, -950], [K.furnace - 0.15, -520]], eio);
  const cy = kfs(t, [[K.crane - 0.5, -520], [K.crane + 0.05, 92], [K.crane + 0.35, 92], [K.crane + 0.85, -640]], eio);
  const open = kfs(t, [[K.crane - 0.5, 0], [K.crane - 0.2, 1], [K.crane + 0.05, 1], [K.crane + 0.3, 0], [K.furnace - 0.1, 0], [K.furnace + 0.08, 1]]);
  const holding = t >= K.crane + 0.25 && t < K.furnace - 0.02;
  // pit bag (a close call)
  const pst = pick<string>(t, [[0, 'look'], [K.crane - 0.55, 'eek'], [K.crane + 0.6, 'phew'], [K.furnace - 0.4, 'watch']]);
  const pface = ({look: {eyes: 'open', mouth: 'smile', lookY: -0.7}, eek: {eyes: 'wide', mouth: 'o', browUp: 1, lookX: -0.9, lookY: -0.4, sweat: 1},
    phew: {eyes: 'squeeze', mouth: 'grin', sweat: 1}, watch: {eyes: 'open', mouth: 'flat', lookX: 0.9, lookY: -0.6}} as any)[pst] as BagFace;
  const plean = kfs(t, [[K.crane - 0.5, 0], [K.crane - 0.2, 14], [K.crane + 0.5, 14], [K.crane + 0.8, 0]]);
  // ---------------- fire / air / water / steam
  const air = kfs(t, [[K.air - 0.1, 0], [K.air + 0.4, 1]]);
  const fire = clamp((t - K.furnace - 0.4) / 0.5);
  const boil = kfs(t, [[K.boils - 0.2, 0], [K.boils + 0.6, 1]]);
  const arrows = Math.min(pop(t, K.air - 0.15, 0.35), popOut(t, K.boils + 0.6, 0.3));
  // turbine spin
  const t0 = K.turbine - 0.35, R = 0.8, W = 2.2 * 360;
  const ang = t < t0 ? 0 : t < t0 + R ? W * (t - t0) ** 2 / (2 * R) : W * ((t - t0) - R / 2);
  // power
  const wireL = plen(WIRE), bolt = prog(t, K.power - 0.05, K.power + 0.4);
  const houseArrive = HX.map((_, i) => K.power + 0.4 + 0.12 + i * 0.12);
  const lit = HX.map((_, i) => prog(t, houseArrive[i], houseArrive[i] + 0.12));
  const warm = HX.map((_, i) => kfs(t, [[K.leftover + 0.35 + i * 0.1, 0], [K.leftover + 0.7 + i * 0.1, 1]]));
  const heatOn = prog(t, K.leftover - 0.1, K.leftover + 0.4);
  const gen = t >= K.power - 0.05;
  // ---------------- chimney
  const plumeOn = t >= K.plume - 0.15;
  const wink = t >= K.vapor && t < K.vapor + 0.45;

  // ---------------- tumbling trash on the grate
  const tumb: React.ReactNode[] = [];
  for (let j = 0; j < 80; j++) {
    const load = j < 5;
    const ts = load ? K.furnace - 0.05 + j * 0.05 : K.furnace + 0.6 + (j - 5) * 0.42;
    if (ts > CUT3 || t < ts) continue;
    const arrive = ts + (load ? 0.6 : 0.5);
    const tstart = Math.max(arrive + 0.1, K.tumbles - 0.15 + j * 0.13);
    const dur = 2.6;
    let x: number, y: number, rot = j * 47, sc = 1.15, burnt = 0;
    if (t < arrive) {
      const u = ein(prog(t, ts, arrive));
      const path: [number, number][] = load ? [[cx + (j - 2) * 18, cy + 50], [-520, -470], [-505, -150], [-340, -64]] : [[-520, -520], [-505, -150], [-340, -64]];
      [x, y] = along(path, u); rot += u * 90;
    } else if (t < tstart) { x = -340 + (j % 5) * 22; y = stepTop(0) - 24 - (j % 2) * 18; }
    else {
      const p = 5 * prog(t, tstart, tstart + dur);
      if (p >= 5) continue;
      const n = Math.floor(p), f = p - n;
      x = -330 + p * 118 + (j % 3) * 12;
      y = stepTop(n) + (n < 4 ? 52 * ein(clamp((f - 0.65) / 0.35)) : 0) - 26 - 22 * Math.sin(Math.PI * clamp(f / 0.65));
      rot += 140 * p; burnt = prog(t, tstart + 0.3, tstart + dur - 0.2); sc *= 1 - 0.35 * burnt;
      if (n === 4 && f > 0.75) sc *= 1 - (f - 0.75) / 0.25;
    }
    tumb.push(<g key={j} transform={`translate(${x} ${y})`}><Junk type={j} c={JUNK_COLORS[j % 6]} s={sc} rot={rot} burnt={burnt} /></g>);
  }
  // ---------------- smoke rising in the furnace to the flue
  const fsmoke = emit(t, K.furnace + 0.6, CUT3, 0.26, 2.0, (i, ts, age) => {
    const u = age / 2.0, x0 = -200 + rnd(i) * 400;
    const x = lerp(x0, 285, ein(u)), y = lerp(-170, -1030, u);
    const sc = (0.55 + 0.5 * u) * Math.min(1, u * 6) * (u > 0.85 ? 1 - (u - 0.85) / 0.15 : 1);
    return <g key={'fs' + i} transform={`translate(${x} ${y}) scale(${sc})`}><Puff c={[[-22, 4, 22], [6, -8, 26], [26, 6, 18]]} fill="#7E746C" ow={6} /></g>;
  });
  // ---------------- flue gas particles (soot, acid, mercury/dioxin specks, lime, carbon) -> fabric bags
  const V = 200;
  const parts: React.ReactNode[] = [];
  const bagParts: React.ReactNode[] = [];
  const toBags = (key: string, i: number, ta: number, yIn: number, r: number, fill: string, stroke = true) => {
    // particle reached the baghouse at time ta; returns element or null
    const age = t - ta;
    if (ta < K.bags - 0.25 || ta > K.plume + 1.0) {
      const s = 1 - clamp(age / 0.25); if (s <= 0) return null;
      return <circle key={key} cx={620 + age * 160} cy={yIn} r={r * s} fill={fill} stroke={stroke ? INK : 'none'} strokeWidth={ow7 * 0.6} />;
    }
    const b = (i * 3 + key.length) % 5, side = rnd(i * 7 + key.length) < 0.5 ? -1 : 1;
    const inflate = 0.55 + 0.45 * pop(t, K.bags - 0.1, 0.45);
    const sx = BAGX(b) + side * (22 * inflate + r * 0.5), sy = -1180 + rnd(i * 13 + key.length * 3) * 330;
    const u = eout(clamp(age / 0.55));
    bagParts.push(<circle key={key + i} cx={lerp(620, sx, u)} cy={lerp(yIn, sy, u) - Math.sin(u * Math.PI) * 40} r={r} fill={fill} stroke={stroke ? INK : 'none'} strokeWidth={ow7 * 0.6} />);
    return null;
  };
  const LIFE = 290 / V;
  parts.push(...emit(t, CUT1 - 3, CUT3, 0.08, 40, (i, ts, age) => {
    const y = -1030 + 22 * Math.sin(i * 2.3) + 5 * Math.sin(age * 5 + i);
    if (age < LIFE) return <circle key={'d' + i} cx={330 + age * V} cy={y} r={9} fill="#8F8882" />;
    return toBags('d', i, ts + LIFE, y, 9, '#8F8882', false);
  }));
  parts.push(...emit(t, CUT1 - 3, K.acid + 0.8, 0.21, LIFE + 0.3, (i, ts, age) => {
    const y = -1030 + 26 * Math.sin(i * 3.7 + 1), x = 330 + age * V;
    const popAt = Math.max(K.acid + rnd(i) * 0.35, ts + 0.45 + rnd(i + 5) * 0.2);
    if (age >= LIFE) { const s = 1 - clamp((age - LIFE) / 0.25); return s > 0 ? <circle key={'a' + i} cx={620} cy={y} r={12 * s} fill="#9BE34B" stroke={INK} strokeWidth={ow7 * 0.7} /> : null; }
    if (t >= popAt) { const s = popOut(t, popAt, 0.22); const u = prog(t, popAt, popAt + 0.35);
      return <g key={'a' + i}>{s > 0 && <circle cx={x} cy={y} r={12 * s} fill="#9BE34B" stroke={INK} strokeWidth={ow7 * 0.7} />}
        {u > 0 && u < 1 && <Sparkle x={x} y={y} r={20 * Math.sin(u * Math.PI)} fill="white" />}</g>; }
    return <circle key={'a' + i} cx={x} cy={y} r={12} fill="#9BE34B" stroke={INK} strokeWidth={ow7 * 0.7} />;
  }));
  parts.push(...emit(t, CUT1 - 3, K.carbon + 0.9, 0.26, 40, (i, ts, age) => {
    const y = -1030 + 26 * Math.sin(i * 5.1 + 2);
    const grab = Math.max(K.carbon + 0.35 + rnd(i) * 0.4, ts + 1.0);
    const caught = t >= grab;
    const fill = caught ? '#2A2A2A' : '#A066D8';
    if (age < LIFE) return <g key={'m' + i}><circle cx={330 + age * V} cy={y} r={caught ? 11 : 8} fill={fill} stroke={INK} strokeWidth={ow7 * 0.6} />
      {caught && <circle cx={330 + age * V} cy={y} r={4} fill="#A066D8" />}</g>;
    return caught ? toBags('mm', i, ts + LIFE, y, 11, '#2A2A2A') : (age - LIFE < 0.25 ? <circle key={'m' + i} cx={620} cy={y} r={8 * (1 - (age - LIFE) / 0.25)} fill={fill} /> : null);
  }));
  const spout = (x0: number, T0: number, key: string, fill: string, r: number) => emit(t, T0, CUT3, key === 'l' ? 0.05 : 0.06, 40, (i, ts, age) => {
    const yy = -1030 + 30 * Math.sin(i * 1.9 + x0);
    if (age < 0.2) return <circle key={key + i} cx={x0 + (rnd(i) - 0.5) * 12} cy={lerp(-1090, yy, age / 0.2)} r={r} fill={fill} stroke={INK} strokeWidth={ow7 * 0.5} />;
    const x = x0 + (age - 0.2) * V;
    if (x < 620) return <circle key={key + i} cx={x} cy={yy} r={r} fill={fill} stroke={INK} strokeWidth={ow7 * 0.5} />;
    return toBags(key, i, ts + 0.2 + (620 - x0) / V, yy, r, fill);
  });
  if (t >= K.lime - 0.1) parts.push(...spout(430, K.lime - 0.1, 'l', '#FFFFFF', 8));
  if (t >= K.carbon - 0.1) parts.push(...spout(550, K.carbon - 0.1, 'c', '#2A2A2A', 7));
  const inflate = 0.55 + 0.45 * pop(t, K.bags - 0.1, 0.45);
  const bagShake = spring(t, K.dust, 4, 5) * 6;

  // ---------------- steam puffs
  const spL = plen(SP);
  const steamPuffs = t > K.steam - 0.25 ? Array.from({length: 12}, (_, i) => {
    const front = (t - (K.steam - 0.25)) * 900 / spL;
    const u = ((t - (K.steam - 0.25)) * 900 / spL + i / 12) % 1;
    if ((t - (K.steam - 0.25)) * 900 / spL < 1 && u > front) return null;
    const [x, y] = along(SP, u);
    return <g key={i} transform={`translate(${x} ${y})`}><Puff c={[[-9, 0, 11], [7, -4, 12], [8, 7, 9]]} ow={5} /></g>;
  }) : [];
  // drum puffs while boiling
  const drumPuffs = emit(t, K.boils + 0.1, K.steam + 0.6, 0.18, 1.0, (i, ts, age) => {
    const u = age, x = -150 + rnd(i) * 260, y = -1150 - u * 160;
    const sc = (0.5 + 0.6 * u) * Math.min(1, u * 8) * (u > 0.7 ? 1 - (u - 0.7) / 0.3 : 1);
    return <g key={'dp' + i} transform={`translate(${x} ${y}) scale(${sc})`}><Puff c={[[-14, 0, 16], [8, -6, 18], [12, 8, 13]]} ow={6} /></g>;
  });
  // ---------------- ash conveyor + magnet
  const magS = pop(t, K.magnets, 0.4);
  const magOn = K.magnets + 0.35;
  const ash: React.ReactNode[] = [];
  let stuck = 0;
  const RIDE = (840 - 260) / 170;
  for (let i = Math.max(0, Math.floor((t - RIDE - 0.5 - (CUT1 - 4)) / 0.16) - 40); ; i++) {
    const ts = CUT1 - 4 + i * 0.16; if (ts > t || ts > CUT3) break;
    const metal = rnd(i * 11 + 3) < 0.32;
    const tLift = ts + (500 - 260) / 170;
    const lifted = metal && tLift > magOn;
    if (lifted && t >= tLift) {
      const kk = stuck++; if (kk > 13) continue;
      const side = kk % 2 ? 1 : -1, row = Math.floor(kk / 2);
      const sx = 530 + side * (62 + row * 22), sy = 492 + (row % 2) * 10;
      const u = eout(prog(t, tLift, tLift + 0.25));
      ash.push(<g key={'s' + i} transform={`translate(${lerp(500, sx, u)} ${lerp(ROW, sy, u) - Math.sin(u * Math.PI) * 30}) rotate(${i * 50 + u * 200})`}>
        <rect x={-14} y={-20} width={28} height={40} rx={5} fill="#A9B4C0" stroke={INK} strokeWidth={ow7} /><path d="M -14 -4 L 14 -4" stroke="#6E7B8A" strokeWidth={6} /></g>);
      continue;
    }
    const age = t - ts;
    if (age < RIDE) {
      const x = 260 + age * 170;
      ash.push(metal ? <g key={'a' + i} transform={`translate(${x} ${ROW}) rotate(${i * 50})`}><rect x={-14} y={-20} width={28} height={40} rx={5} fill="#A9B4C0" stroke={INK} strokeWidth={ow7} /><path d="M -14 -4 L 14 -4" stroke="#6E7B8A" strokeWidth={6} /></g>
        : <g key={'a' + i} transform={`translate(${x} ${ROW + 4})`}><Puff c={[[-10, 0, 13], [8, -3, 12], [2, 6, 10]]} fill={mix('#7D7A76', '#A39E97', rnd(i))} ow={5} /></g>);
    } else if (age < RIDE + 0.45) {
      const u = (age - RIDE) / 0.45, x = 840 + 70 * u, y = ROW + 180 * u * u, s = u > 0.7 ? 1 - (u - 0.7) / 0.3 : 1;
      ash.push(<g key={'a' + i} transform={`translate(${x} ${y}) scale(${s})`}>{metal ? <rect x={-14} y={-20} width={28} height={40} rx={5} fill="#A9B4C0" stroke={INK} strokeWidth={ow7} />
        : <Puff c={[[-10, 0, 13], [8, -3, 12], [2, 6, 10]]} fill="#8E8A84" ow={5} />}</g>);
    }
  }
  const g2 = kfs(t, [[K.rest - 0.3, 0.45], [K.gravel + 0.3, 1]]);
  const belt = (t * 170) % 40;

  return (<g>
    <defs>
      <radialGradient id="glow"><stop offset="0%" stopColor="#FFB347" stopOpacity={0.55} /><stop offset="100%" stopColor="#FFB347" stopOpacity={0} /></radialGradient>
      <clipPath id="chamber"><rect x={-370} y={-1160} width={670} height={450 + 1000} /></clipPath>
    </defs>
    {/* dirt, grass, building */}
    <rect x={-6000} y={GROUND} width={12000} height={6000} fill="#B98A5C" />
    <rect x={-6000} y={GROUND - 4} width={12000} height={26} fill="#8FCB6A" />
    <path d={`M -6000 ${GROUND} L 6000 ${GROUND}`} stroke={INK} strokeWidth={ow} />
    {[[1500, 620, 40], [2100, 900, 34], [-1500, 700, 44], [1250, 1000, 30]].map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y} rx={r * 1.6} ry={r} fill="#A87A4E" />)}
    <rect x={-1250} y={-1360} width={2260} height={2090} fill="#EDE1C8" stroke={INK} strokeWidth={ow} />
    <rect x={-1250} y={GROUND + 30} width={2260} height={400} fill="#E3D4B7" />
    <rect x={-700} y={GROUND} width={1710} height={30} fill="#A8A29A" stroke={INK} strokeWidth={ow7} />
    <rect x={-1250} y={GROUND} width={50} height={30} fill="#A8A29A" stroke={INK} strokeWidth={ow7} />
    <rect x={-1250} y={710} width={2260} height={20} fill="#A8A29A" stroke={INK} strokeWidth={ow7} />
    <rect x={-1250} y={-1360} width={2260} height={2090} fill="none" stroke={INK} strokeWidth={ow} />
    {/* pit */}
    <rect x={-1200} y={-60} width={500} height={720} fill="#9C9CA3" stroke={INK} strokeWidth={ow} />
    <rect x={-1170} y={-60} width={440} height={690} fill="#6F7079" />
    <path d={`M -1170 630 L -1170 160 ${Array.from({length: 12}, (_, i) => `Q ${-1170 + i * 36.7 + 18} ${132 + (i % 3) * 10} ${-1170 + (i + 1) * 36.7} ${158 + (i % 2) * 8}`).join(' ')} L -730 630 Z`} fill="#5E5448" />
    {Array.from({length: 14}, (_, i) => <g key={i} transform={`translate(${-1150 + i * 31} ${170 + (i % 3) * 40 + rnd(i) * 20})`}><Junk type={i + 2} c={JUNK_COLORS[(i + 1) % 6]} s={1.1} rot={(rnd(i + 3) - 0.5) * 140} /></g>)}
    {Array.from({length: 10}, (_, i) => <g key={'b' + i} transform={`translate(${-1140 + i * 44} ${330 + (i % 2) * 90 + rnd(i + 8) * 60})`}><Junk type={i} c={JUNK_COLORS[i % 6]} s={1.0} rot={rnd(i) * 180} burnt={0.15} /></g>)}
    <rect x={-1200} y={-60} width={500} height={720} fill="none" stroke={INK} strokeWidth={ow} />
    <g transform={`translate(-840 168) scale(0.8)`}><Bag id="pit" rot={plean} {...pface} blink={bump(t, K.crane + 1.4, K.crane + 1.56)} /></g>
    {/* furnace */}
    <rect x={-400} y={-1190} width={730} height={1490} fill="#B4553A" stroke={INK} strokeWidth={ow} />
    <rect x={-370} y={-1160} width={670} height={1450} fill="#5A2E25" />
    <ellipse cx={-60} cy={20} rx={520 * (0.6 + 0.4 * fire)} ry={420} fill="url(#glow)" opacity={fire * (0.6 + 0.4 * air)} />
    {/* wall tubes */}
    {[[-370, -1128, 32, 1030], [268, -1128, 32, 1030], [-370, -1160, 670, 32]].map(([x, y, w, h], i) => (
      <g key={'tb' + i}><rect x={x} y={y} width={w} height={h} fill={mix(WATER, '#CFEFFF', boil * 0.7)} stroke={INK} strokeWidth={ow7} />
        {i < 2 ? [10, 21].map((dx) => <path key={dx} d={`M ${x + dx} ${y} L ${x + dx} ${y + h}`} stroke={INK} strokeWidth={ow7 * 0.5} opacity={0.6} />)
          : [10, 21].map((dy) => <path key={dy} d={`M ${x} ${y + dy} L ${x + w} ${y + dy}`} stroke={INK} strokeWidth={ow7 * 0.5} opacity={0.6} />)}</g>))}
    {boil > 0 && [-354, 284].map((bx2, s) => Array.from({length: 12}, (_, i) => {
      const y = -110 - ((t * 300 + i * 89 + s * 40) % 1010);
      return <circle key={`bb${s}-${i}`} cx={bx2 + Math.sin(i * 2 + t * 6) * 5} cy={y} r={(5 + 3 * rnd(i + s * 20)) * boil} fill="white" stroke={INK} strokeWidth={ow7 * 0.4} />;
    }))}
    {/* steam drum */}
    {[-200, -60, 80].map((x) => <path key={x} d={`M ${x} -1205 L ${x} -1160`} stroke={INK} strokeWidth={22 + ow * 2} />)}
    {[-200, -60, 80].map((x) => <path key={'s' + x} d={`M ${x} -1205 L ${x} -1160`} stroke="#9FB4C7" strokeWidth={22} />)}
    <rect x={-270} y={-1300} width={440} height={95} rx={46} fill="#A9B9C8" stroke={INK} strokeWidth={ow} />
    {drumPuffs}
    {/* grate + air */}
    <rect x={-370} y={205} width={590} height={85} fill="#2E3440" />
    {[0, 1, 2, 3, 4].map((n) => {
      const x0 = stepX0(n), y0 = stepTop(n), sh = Math.sin(t * 5 + n * 1.4) * 7;
      return (<g key={'g' + n}>
        <path d={`M ${x0} ${y0} L ${x0 + 118} ${y0} L ${x0 + 118} 205 L ${x0} 205 Z`} fill="#3B3B40" stroke={INK} strokeWidth={ow7} />
        {[18, 46, 74, 102].map((dx) => <rect key={dx} x={x0 + dx + sh - 6} y={y0 - 9} width={14} height={11} rx={3} fill="#5C5C63" stroke={INK} strokeWidth={ow7 * 0.6} />)}
      </g>);
    })}
    {arrows > 0 && [0, 1, 2, 3, 4, 5].map((i) => {
      const ph = ((t * 1.5 + i * 0.37) % 1), x = -320 + i * 95, y = 285 - ph * 260, s = arrows * Math.sin(Math.PI * ph) * 1.1;
      return <g key={'ar' + i} transform={`translate(${x} ${y}) scale(${s})`}>
        <path d="M -12 30 L -12 -6 L -28 -6 L 0 -40 L 28 -6 L 12 -6 L 12 30 Z" fill="#7FD0FF" stroke={INK} strokeWidth={ow7} strokeLinejoin="round" /></g>;
    })}
    {tumb}
    {[0, 1, 2, 3, 4, 5].map((i) => {
      const x = -320 + i * 100, n = clamp(Math.floor((x + 370) / 118), 0, 4);
      return <g key={'fl' + i} transform={`translate(${x} ${stepTop(n) - 4})`}><Flame s={pop(t, K.furnace + 0.45 + i * 0.07, 0.35) * (0.85 + 0.6 * air)} t={t} i={i} /></g>;
    })}
    {fsmoke}
    {/* ash chute */}
    <rect x={225} y={205} width={70} height={315} fill="#4A4A50" stroke={INK} strokeWidth={ow7} />
    {/* hopper / chute (cut open) */}
    {(() => { const d = 'M -640 -480 L -400 -480 L -450 -380 L -450 -130 L -370 -130 L -370 -40 L -560 -40 L -560 -380 Z';
      return <g><path d={d} fill="none" stroke={INK} strokeWidth={36 + ow * 2} strokeLinejoin="round" /><path d={d} fill="none" stroke="#8C8C94" strokeWidth={36} strokeLinejoin="round" />
        <path d={d} fill="#4A4A50" /></g>; })()}
    {tumb.length > 0 && null}
    {/* crane */}
    <rect x={-1240} y={-1250} width={950} height={40} fill="#F2B33D" stroke={INK} strokeWidth={ow} />
    <path d={`M ${cx} -1160 L ${cx} ${cy - 60}`} stroke={INK} strokeWidth={8 + ow * 2} />
    <path d={`M ${cx} -1160 L ${cx} ${cy - 60}`} stroke="#9AA0A8" strokeWidth={8} />
    <rect x={cx - 70} y={-1214} width={140} height={60} rx={10} fill="#E39B1E" stroke={INK} strokeWidth={ow} />
    <g transform={`translate(${cx} ${cy})`}><Claw open={open} load={holding} /></g>
    {/* turbine + generator */}
    <Pipe d={HEAT} w={30} color="#E8603C" inner={heatOn > 0 ? '#FFB27A' : undefined} />
    {heatOn > 0 && <path d={HEAT} stroke="#FFE2B8" strokeWidth={8} fill="none" strokeDasharray="22 26" strokeDashoffset={-t * 160} opacity={heatOn} />}
    <rect x={480} y={240} width={200} height={60} fill="#8A949E" stroke={INK} strokeWidth={ow} />
    <path d="M 455 20 L 700 -30 L 700 250 L 455 200 Z" fill="#C9D3DC" stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
    <circle cx={578} cy={110} r={92} fill="#3C4650" stroke={INK} strokeWidth={ow} />
    <g transform={`translate(578 110) rotate(${ang})`}>
      {Array.from({length: 8}, (_, i) => <ellipse key={i} cx={0} cy={-46} rx={15} ry={40} transform={`rotate(${i * 45})`} fill="#E8EDF2" stroke={INK} strokeWidth={ow7} />)}
      <circle r={18} fill="#9AA0A8" stroke={INK} strokeWidth={ow7} />
    </g>
    <rect x={700} y={96} width={42} height={28} fill="#8A949E" stroke={INK} strokeWidth={ow7} />
    <rect x={740} y={20} width={165} height={280} rx={22} fill="#5FB86A" stroke={INK} strokeWidth={ow} />
    <path d="M 828 46 L 806 92 L 824 92 L 812 128 L 846 80 L 828 80 L 840 46 Z" fill="#FFE14D" stroke={INK} strokeWidth={ow7 * 0.8} strokeLinejoin="round" />
    {[-1, 1].map((sg) => <g key={sg}><ellipse cx={822 + sg * 30} cy={178} rx={gen ? 16 : 14} ry={gen ? 21 : 18} fill="white" stroke={INK} strokeWidth={ow7} />
      <circle cx={822 + sg * 30 + (gen ? 0 : -4)} cy={182} r={8} fill={INK} /><circle cx={826 + sg * 30} cy={177} r={3} fill="white" /></g>)}
    {gen ? <path d="M 798 222 Q 822 256 846 222 Z" fill={INK} stroke={INK} strokeWidth={ow7} strokeLinejoin="round" /> : <path d="M 806 226 Q 822 236 838 226" stroke={INK} strokeWidth={ow7} fill="none" strokeLinecap="round" />}
    {/* steam pipe (over the flue duct) */}
    {/* flue duct */}
    <rect x={330} y={-1080} width={290} height={100} fill="#A79E92" stroke={INK} strokeWidth={ow} />
    <rect x={330} y={-1068} width={290} height={76} fill="#6B5F57" />
    {[[430, 'LIME', '#F4F1EA'], [550, 'CARBON', '#3A3A3E']].map(([x, , col]) => <g key={x as number}>
      <path d={`M ${(x as number) - 45} -1250 L ${(x as number) + 45} -1250 L ${(x as number) + 45} -1150 L ${(x as number) + 14} -1100 L ${(x as number) + 14} -1078 L ${(x as number) - 14} -1078 L ${(x as number) - 14} -1100 L ${(x as number) - 45} -1150 Z`} fill={col as string} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
    </g>)}
    {parts}
    <Pipe d={poly(SP)} w={34} color="#B8C2CC" inner="#EAF2F8" />
    {steamPuffs}
    {/* baghouse */}
    <rect x={620} y={-1310} width={340} height={550} fill="#B7AEA2" stroke={INK} strokeWidth={ow} />
    <rect x={640} y={-1290} width={300} height={510} fill="#DCD3C4" />
    <rect x={640} y={-1250} width={300} height={16} fill="#8F877C" />
    {[0, 1, 2, 3, 4].map((b) => { const w = 44 * inflate, x = BAGX(b) + bagShake * (b % 2 ? 1 : -1);
      return <rect key={b} x={x - w / 2} y={-1236} width={w} height={400} rx={w / 2} fill="#FBF6EA" stroke={INK} strokeWidth={ow7} />; })}
    {bagParts}
    <path d="M 620 -760 L 960 -760 L 830 -690 L 750 -690 Z" fill="#B7AEA2" stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
    <rect x={960} y={-1300} width={110} height={90} fill="#A79E92" stroke={INK} strokeWidth={ow} />
    {/* power line + pole */}
    <path d={poly(WIRE)} stroke={INK} strokeWidth={10 + ow * 2} fill="none" strokeLinejoin="round" />
    <path d={poly(WIRE)} stroke={bolt > 0 ? '#FFE14D' : '#555'} strokeWidth={10} fill="none" strokeLinejoin="round" strokeDasharray={`${wireL * bolt} ${wireL * 2}`} />
    <rect x={1240} y={-400} width={20} height={GROUND + 400} fill="#8B5A2B" stroke={INK} strokeWidth={ow7} />
    <rect x={1205} y={-400} width={90} height={16} fill="#8B5A2B" stroke={INK} strokeWidth={ow7} />
    {HX.map((hx, i) => {
      const d = `M 1250 -385 Q ${(1250 + hx) / 2} ${(-385 + GROUND - 250) / 2 + 70} ${hx} ${GROUND - 250}`;
      const u = prog(t, K.power + 0.4, houseArrive[i]);
      return <g key={'w' + i}><path d={d} stroke={INK} strokeWidth={5 + ow * 2} fill="none" /><path d={d} stroke={u > 0 ? '#FFE14D' : '#555'} strokeWidth={5} fill="none" strokeDasharray={u > 0 ? `${u * 1200} 3000` : undefined} /></g>;
    })}
    {bolt > 0 && bolt < 1 && (() => { const [x, y] = along(WIRE, bolt);
      return <path transform={`translate(${x} ${y}) scale(1.2)`} d="M 6 -34 L -16 4 L 0 4 L -8 34 L 18 -6 L 2 -6 L 12 -34 Z" fill="#FFE14D" stroke={INK} strokeWidth={ow7} strokeLinejoin="round" />; })()}
    {/* chimney */}
    <path d="M 1055 300 L 1205 300 L 1190 -2350 L 1070 -2350 Z" fill="#E8E1D5" stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
    <path d="M 1071 -2260 L 1189 -2260 L 1189 -2215 L 1071 -2215 Z M 1072 -2140 L 1188 -2140 L 1188 -2100 L 1072 -2100 Z" fill="#D9534F" stroke={INK} strokeWidth={ow7} />
    <rect x={1060} y={-2392} width={140} height={44} rx={6} fill="#CFC7BA" stroke={INK} strokeWidth={ow} />
    {[-1, 1].map((sg) => (wink && sg === 1)
      ? <path key={sg} d="M 1144 -1998 L 1168 -1988 L 1144 -1976" stroke={INK} strokeWidth={ow} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      : <g key={sg}><ellipse cx={1130 + sg * 26} cy={-1988} rx={17} ry={22 * (1 - 0.9 * bump(t, K.plume + 1.2, K.plume + 1.36))} fill="white" stroke={INK} strokeWidth={ow7} />
        <circle cx={1130 + sg * 26 + 2} cy={-1988 - (plumeOn ? 8 : 0)} r={8} fill={INK} /></g>)}
    {plumeOn ? <path d="M 1100 -1952 Q 1130 -1912 1160 -1952 Z" fill={INK} stroke={INK} strokeWidth={ow7} strokeLinejoin="round" />
      : <path d="M 1112 -1948 L 1148 -1948" stroke={INK} strokeWidth={ow7} strokeLinecap="round" />}
    {plumeOn && emit(t, K.plume - 0.15, CUT3, 0.2, 2.6, (i, ts, age) => {
      const u = age / 2.6, x = 1130 + 230 * u + Math.sin(i * 1.7) * 40 * u, y = -2410 - 680 * Math.pow(u, 0.8);
      const sc = (0.5 + 1.6 * u) * Math.min(1, u * 7) * (u > 0.7 ? 1 - ein((u - 0.7) / 0.3) : 1) * (i === 0 ? 1.4 : 1);
      return <g key={'pl' + i} transform={`translate(${x} ${y}) scale(${sc})`}><Puff c={[[-40, 8, 34], [0, -14, 44], [40, 4, 36], [6, 22, 30]]} ow={8} /></g>;
    })}
    {/* houses */}
    {HX.map((hx, i) => <g key={'h' + i} transform={`translate(${hx} ${GROUND})`}>
      <House id={'h' + i} lit={lit[i]} warm={warm[i]} lookX={t < K.power ? -1 : 0} color={['#F3E3C3', '#CFE3F2', '#F6C9A8'][i]} roof={['#D9534F', '#4F7CC2', '#8C5A3C'][i]}
        blink={bump(t, K.homes + 0.2 + i * 0.1, K.homes + 0.36 + i * 0.1)} />
      {[0, 1].map((j) => { const s = Math.min(pop(t, K.leftover + 0.4 + i * 0.1 + j * 0.25, 0.35), popOut(t, K.lime, 0.3));
        return <g key={j} transform={`translate(${57 + (j - 0.5) * 50} ${-280 - ((t * 60 + j * 40) % 50)})`}><HeatArrow s={s * 0.8} t={t} i={i + j} /></g>; })}
    </g>)}
    {/* ash line, magnet, gravel */}
    <rect x={180} y={540} width={660} height={26} rx={13} fill="#3C3C42" stroke={INK} strokeWidth={ow7} />
    <path d="M 196 553 L 824 553" stroke="#6A6A72" strokeWidth={6} strokeDasharray="20 20" strokeDashoffset={-belt} />
    {[200, 820].map((x) => <circle key={x} cx={x} cy={553} r={20} fill="#8A949E" stroke={INK} strokeWidth={ow7} />)}
    {[260, 520, 780].map((x) => <rect key={x} x={x - 8} y={566} width={16} height={144} fill="#8A949E" stroke={INK} strokeWidth={ow7} />)}
    <path d={`M ${920 - 120 * g2} 712 Q 920 ${712 - 190 * g2} ${920 + 120 * g2} 712 Z`} fill="#8F8B85" stroke={INK} strokeWidth={ow7} strokeLinejoin="round" />
    {Array.from({length: 10}, (_, i) => <circle key={'gr' + i} cx={920 + (rnd(i) - 0.5) * 150 * g2} cy={700 - rnd(i + 4) * 60 * g2} r={6} fill="#6E6A65" />)}
    {ash}
    {magS > 0 && <g>
      <path d="M 530 330 L 530 300" stroke={INK} strokeWidth={6} />
      <path d={`M 530 330 L 530 ${380 - 70 * magS}`} stroke={INK} strokeWidth={8 + ow * 2} /><path d={`M 530 330 L 530 ${380 - 70 * magS}`} stroke="#9AA0A8" strokeWidth={8} />
      <g transform={`translate(530 380) scale(${magS})`}>
        <path d="M -70 90 L -70 0 A 70 70 0 0 1 70 0 L 70 90" stroke={INK} strokeWidth={56 + ow * 2} fill="none" />
        <path d="M -70 90 L -70 0 A 70 70 0 0 1 70 0 L 70 90" stroke="#E5483C" strokeWidth={56} fill="none" />
        <rect x={-98} y={56} width={56} height={34} fill="#D9DEE5" stroke={INK} strokeWidth={ow7} /><rect x={42} y={56} width={56} height={34} fill="#D9DEE5" stroke={INK} strokeWidth={ow7} />
        {[-1, 1].map((sg) => <g key={sg}><ellipse cx={sg * 20} cy={-76} rx={11} ry={14 * (1 - 0.9 * bump(t, K.rest + 0.3, K.rest + 0.45))} fill="white" stroke={INK} strokeWidth={ow7 * 0.8} />
          <circle cx={sg * 20} cy={-72} r={5.5} fill={INK} /></g>)}
        <path d="M -20 -54 Q 0 -36 20 -54 Z" fill={INK} stroke={INK} strokeWidth={ow7 * 0.8} strokeLinejoin="round" />
      </g>
      {[0, 1, 2].map((i) => { const u = prog(t, K.magnets + 0.3 + i * 0.12, K.magnets + 0.75 + i * 0.12);
        return u > 0 && u < 1 && <Sparkle key={i} x={530 + (i - 1) * 110} y={420 - i * 20} r={22 * Math.sin(u * Math.PI)} fill="#FFE14D" />; })}
    </g>}
    {/* labels (constant screen size) */}
    <Pill x={-60} y={-340} text="moving grate" size={40} s={Math.min(pop(t, K.tumbles - 0.05, 0.35), popOut(t, K.air - 0.2, 0.25))} />
    <Pill x={-60} y={-760} text="water pipes" size={40} color="#1E6FC2" s={Math.min(pop(t, K.boils - 0.05, 0.35), popOut(t, K.steam - 0.2, 0.25))} />
    <Pill x={540} y={-720} text="steam" size={40} color="#1E6FC2" s={Math.min(pop(t, K.steam, 0.35), popOut(t, K.power - 0.25, 0.25))} />
    <Pill x={578} y={-110} text="turbine" size={40} s={Math.min(pop(t, K.turbine, 0.35), popOut(t, K.power - 0.15, 0.25))} />
    <Pill x={430} y={-1400} text="lime" size={40} s={Math.min(pop(t, K.lime, 0.35), popOut(t, K.carbon - 0.15, 0.25))} />
    <Pill x={550} y={-1490} text="carbon" size={40} s={Math.min(pop(t, K.carbon, 0.35), popOut(t, K.bags - 0.15, 0.25))} />
    <Pill x={790} y={-1420} text="fabric filter bags" size={40} s={Math.min(pop(t, K.bags, 0.35), popOut(t, K.plume - 0.8, 0.25))} />
    <Pill x={880} y={-2640} text="mostly water vapor" size={40} color="#1E6FC2" s={Math.min(pop(t, K.plume + 0.5, 0.35), popOut(t, K.vapor + 0.2, 0.25))} />
    <Pill x={760} y={390} text="metal" size={40} s={Math.min(pop(t, K.magnets + 0.45, 0.35), popOut(t, K.rest - 0.1, 0.25))} />
    <Pill x={880} y={470} text="road gravel" size={42} s={pop(t, K.gravel - 0.05, 0.35)} />
  </g>);
};

export const Plant: React.FC<{t: number; noTag?: boolean}> = ({t, noTag}) => {
  const c = camKeys(t, [
    [CUT1, {x: -820, y: -60, s: 1.1}], [K.crane + 0.85, {x: -820, y: -60, s: 1.1}],
    [K.tumbles - 0.1, {x: -150, y: -120, s: 1.0}], [K.boils - 0.5, {x: -150, y: -120, s: 1.0}],
    [K.boils + 0.5, {x: -60, y: -460, s: 0.74}], [K.steam - 0.1, {x: -60, y: -460, s: 0.74}],
    [K.turbine + 0.25, {x: 420, y: -250, s: 0.78}], [K.power - 0.05, {x: 420, y: -250, s: 0.78}],
    [K.power + 0.95, {x: 1260, y: -200, s: 0.68}], [K.homes, {x: 1260, y: -200, s: 0.68}],
    [K.lime + 0.35, {x: 650, y: -1000, s: 1.2}], [K.dust + 0.25, {x: 650, y: -1000, s: 1.2}],
    [K.plume + 0.15, {x: 1110, y: -2180, s: 0.8}], [K.vapor + 0.15, {x: 1110, y: -2180, s: 0.8}],
    [K.magnets + 0.4, {x: 600, y: 420, s: 0.95}], [CUT3, {x: 600, y: 420, s: 0.95}]]);
  const dip = 1 - 0.5 * bump(t, K.vapor + 0.15, K.magnets + 0.4);
  const cam = toCam({...c, s: c.s * dip});
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#7CC8FF 0%, #BDE6FF 60%, #DDF3FF 100%)'}}>
      <Layer cam={cam} z={2400}>
        {[[-1400, -1900, 1.3], [200, -2600, 1.6], [1900, -1700, 1.2], [3000, -2700, 1.4]].map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x + 14 * loopSin(t, 1, i)} ${y}) scale(${s})`}>
            <Puff c={[[-80, 10, 50], [-25, -25, 66], [45, -10, 56], [95, 15, 38], [10, 25, 48]]} ow={8} /></g>))}
        <path d="M -5000 520 Q -3000 200 -1200 420 Q 600 160 2200 400 Q 3600 220 5000 420 L 5000 4000 L -5000 4000 Z" fill="#9ED37A" />
      </Layer>
      <Layer cam={cam} z={1000}><PlantArt t={t} /></Layer>
      {!noTag && <Tag text="simplified, not to scale" show={Math.min(pop(t, CUT1 + 0.4, 0.3), popOut(t, CUT3 - 0.35, 0.25))} />}
    </AbsoluteFill>
  );
};
