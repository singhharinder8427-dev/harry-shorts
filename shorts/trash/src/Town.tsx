import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Layer, useK} from './Layer';
import {Character} from './Character';
import {Puff} from './Bits';
import {Bag, BagFace, Flame, Junk, JUNK_COLORS} from './Props';
import {INK, mix} from './color';
import {bump, clamp, ein, eio, eout, kfs, lerp, pick, pop, popOut, prog, rnd, smooth, spring} from './math';
import {CUT1, CUT3, END, K, camKeys, loopSin, toCam} from './shared';

export const HOME = {x: -40, y: -250, s: 1.35};
const GX = -170, BS = 0.85;
const HOLD: [number, number] = [125, -215];
const MX = 470, MW = 560, MH = 640;
const surf = (x: number, g: number) => { const u = (x - MX) / MW; if (Math.abs(u) >= 1) return 0; return -MH * g * Math.pow(1 - u * u, 0.75); };
const N = 34;
const ITEMS = Array.from({length: N}, (_, j) => {
  const f = (j + 0.5) / N, bound = Math.sqrt(Math.max(0, 1 - Math.pow(f * 0.92, 4 / 3)));
  const u = (rnd(j * 3 + 1) * 2 - 1) * bound * 0.92;
  return {f, x: MX + u * MW, y: -f * MH * 0.92 + 6, type: j, c: JUNK_COLORS[j % JUNK_COLORS.length], rot: (rnd(j + 50) - 0.5) * 120, s: 1.25 + rnd(j + 9) * 0.5};
});
const FL = Array.from({length: 9}, (_, i) => { const x = MX + (-0.78 + i * 0.195) * MW; return {x, y: surf(x, 1) + 14, s: 0.9 + 0.4 * rnd(i + 3)}; });
const SMOKE_C: [number, number, number][] = [[-50, 10, 44], [0, -20, 58], [52, 0, 46], [10, 26, 40], [-30, -40, 30]];

const FarTown: React.FC<{d: number}> = ({d}) => {
  const k = useK(); const ow = 8 / k;
  const cols = ['#F3E3C3', '#CFE3F2', '#F6C9A8', '#E3EFC9', '#F3D6E0'], roofs = ['#D9534F', '#4F7CC2', '#8C5A3C', '#5EA35A'];
  return (<g>
    {Array.from({length: 17}, (_, i) => {
      const x = -1800 + i * 270 + rnd(i) * 60, w = 150 + rnd(i + 4) * 60, h = 140 + rnd(i + 8) * 120;
      return (<g key={i} transform={`translate(${x} 350)`}>
        <rect x={-w / 2} y={-h} width={w} height={h} fill={cols[i % 5]} stroke={INK} strokeWidth={ow} />
        <path d={`M ${-w / 2 - 14} ${-h + 2} L 0 ${-h - 80} L ${w / 2 + 14} ${-h + 2} Z`} fill={roofs[i % 4]} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
        <rect x={-w / 4 - 14} y={-h + 40} width={28} height={30} fill="#7FA6C9" stroke={INK} strokeWidth={ow * 0.8} />
        <rect x={w / 4 - 14} y={-h + 40} width={28} height={30} fill="#7FA6C9" stroke={INK} strokeWidth={ow * 0.8} />
      </g>);
    })}
    {Array.from({length: 9}, (_, i) => { const x = -1660 + i * 520 + rnd(i + 30) * 80;
      return <g key={'t' + i}><rect x={x - 9} y={270} width={18} height={80} fill="#8B5A2B" stroke={INK} strokeWidth={ow} />
        <Puff c={[[x - 30, 250, 40], [x + 28, 246, 38], [x, 210, 46]]} fill="#6DB85A" ow={8} /></g>; })}
    <rect x={-6000} y={350} width={12000} height={4000} fill="#8FCB6A" />
    <path d="M -6000 350 L 6000 350" stroke={INK} strokeWidth={ow} />
    {d > 0 && <rect x={-6000} y={-6000} width={12000} height={12000} fill="#2B2828" opacity={d * 0.42} />}
  </g>);
};

export const Town: React.FC<{t: number}> = ({t}) => {
  const C = t >= CUT3;  // closing shot (CTA, loops to frame 0)
  const c = C ? HOME : camKeys(t, [
    [0, HOME], [0.55, HOME], [1.75, {x: 190, y: -250, s: 1.12}], [K.piles - 0.35, {x: 190, y: -250, s: 1.12}],
    [K.piles + 0.95, {x: 450, y: -600, s: 0.55}], [K.black - 0.6, {x: 450, y: -600, s: 0.55}], [CUT1, {x: 450, y: -760, s: 0.5}]]);
  const shake = C ? 0 : bump(t, K.black - 0.1, K.black + 0.8) * 4;
  const cam = toCam({x: c.x + shake * Math.sin(t * 71), y: c.y + shake * Math.sin(t * 53), s: c.s});
  const d = C ? 0 : kfs(t, [[K.black - 0.5, 0], [K.black + 0.5, 1]]);
  const g = C ? 0 : clamp((t - (K.piles - 0.15)) / 1.5);
  const breath = 1 + 0.008 * loopSin(t, Math.round(0.6 * END));

  // ---------------- guy
  let handR: [number, number] = HOLD, handL: [number, number] = [-98, -112], lean = 0;
  let gface: any = {eyes: 'dot', mouth: 'smile'};
  let sweat = 0, cough = 0;
  if (!C) {
    if (t < 0.5) handR = [lerp(HOLD[0], 150, smooth(prog(t, 0.15, 0.5))), lerp(HOLD[1], -130, smooth(prog(t, 0.15, 0.5)))];
    else if (t < 0.75) handR = [lerp(150, 130, eout(prog(t, 0.5, 0.75))), lerp(-130, -370, eout(prog(t, 0.5, 0.75)))];
    else handR = [lerp(130, 98, smooth(prog(t, 1.1, 1.5))), lerp(-370, -112, smooth(prog(t, 1.1, 1.5)))];
    lean = kfs(t, [[0.15, 0], [0.5, -6], [0.75, 8], [1.25, 0]]);
    const look = kfs(t, [[0.7, 0], [1.0, 1]]);
    const st = pick<string>(t, [[0, 'home'], [K.vanish - 0.1, 'huh'], [K.piles - 0.2, 'wow'], [K.stinking - 0.1, 'stink'], [K.burn - 0.15, 'scared'], [K.black - 0.05, 'cough']]);
    const pinch = kfs(t, [[K.stinking - 0.15, 0], [K.stinking + 0.1, 1], [K.burn - 0.3, 1], [K.burn - 0.05, 0]]);
    handR = [lerp(handR[0], 22 + 18 * look, pinch), lerp(handR[1], -296, pinch)];
    const cm = kfs(t, [[K.black - 0.1, 0], [K.black + 0.15, 1]]);
    handL = [lerp(-98, 14, cm), lerp(-112, -262, cm)];
    cough = st === 'cough' ? Math.max(0, Math.sin((t - K.black) * 2 * Math.PI * 2.2)) : 0;
    sweat = Math.min(pop(t, K.burn + 0.05, 0.3), 1);
    gface = {
      home: {eyes: 'dot', mouth: 'smile'},
      huh: {eyes: 'dot', mouth: 'flat', browUp: 0.7},
      wow: {eyes: 'wide', mouth: 'o', browUp: 1},
      stink: {eyes: 'squeeze', mouth: 'wavy', brow: -1},
      scared: {eyes: 'wide', mouth: 'o', browUp: 1, brow: -0.6},
      cough: {eyes: 'squeeze', mouth: 'o', brow: -1},
    }[st];
    gface.faceDx = 18 * look; gface.lookX = 6 * look * (st === 'stink' || st === 'cough' ? 0 : 1);
    gface.faceDy = st === 'wow' ? -12 : 0; gface.lookY = st === 'wow' ? -5 : 0;
    gface.blink = bump(t, 2.0, 2.16);
  } else {
    const up = kfs(t, [[K.subscribe - 0.1, 0], [K.subscribe + 0.2, 1], [END - 0.9, 1], [END - 0.5, 0]]);
    const yay = t >= K.everyday + 0.05 && t < K.work + 0.35;
    gface = {eyes: yay ? 'squeeze' : 'dot', mouth: yay ? 'grin' : 'smile', faceDy: -16 * up, lookY: -5 * up, faceDx: 6 * up, browUp: up * 0.4,
      blink: bump(t, CUT3 + 0.25, CUT3 + 0.41)};
  }
  const guy = {t, id: 'guy', lean: lean + cough * 3, sx: 1 + cough * 0.03, sy: breath * (1 - cough * 0.05), handL, handR, sweat, ...gface};

  // ---------------- bag
  let bx = GX + HOLD[0], by = HOLD[1] + 205 * BS - 12, brot = 0, bsx = 1, bsy = 1;
  let bface: BagFace = {eyes: 'open', mouth: 'smile'};
  const held = C || t < 0.75;
  if (held) { bx = GX + handR[0]; by = handR[1] + 205 * BS - 12; brot = C ? 0 : lean * 0.6; }
  else if (t < 1.6) {
    const u = prog(t, 0.75, 1.6), x0 = GX + 130, y0 = -370 + 205 * BS - 12;
    bx = lerp(x0, 430, u); by = lerp(y0, 0, u) - 430 * 4 * Math.pow(u, 0.8) * (1 - Math.pow(u, 0.8)); brot = 360 * eio(u);
  } else if (t < K.piles - 0.15) { bx = 430; by = 0; }
  else { const gg = smooth(g); bx = lerp(430, MX, gg); by = surf(MX, g) + 10; }
  const land = spring(t, 1.6, 3, 6) * 0.16;
  bsx = 1 + land; bsy = 1 - land;
  const hop = !C && t > K.burn ? Math.abs(Math.sin((t - K.burn) * 9)) * 46 * Math.min(1, (t - K.burn) * 3) : 0;
  if (!C) {
    const st = pick<string>(t, [[0, 'home'], [0.62, 'whee'], [1.6, 'dizzy'], [K.vanish - 0.1, 'smug'], [K.piles - 0.2, 'wow'], [K.stinking - 0.1, 'stink'], [K.burn - 0.1, 'hot'], [K.black + 0.2, 'ugh']]);
    bface = {
      home: {eyes: 'open', mouth: 'smile'}, whee: {eyes: 'squeeze', mouth: 'grin'}, dizzy: {eyes: 'open', mouth: 'flat', lookX: Math.sin(t * 8) * 0.6},
      smug: {eyes: 'smug', mouth: 'smirk', browUp: 0.6}, wow: {eyes: 'wide', mouth: 'o', lookY: -0.8, browUp: 1},
      stink: {eyes: 'squeeze', mouth: 'wavy', brow: -1}, hot: {eyes: 'wide', mouth: 'o', browUp: 1, sweat: 1}, ugh: {eyes: 'squeeze', mouth: 'wavy', brow: -1, sweat: 1},
    }[st] as BagFace;
    bface.blink = bump(t, 2.05, 2.2);
  } else {
    const up = kfs(t, [[K.subscribe - 0.1, 0], [K.subscribe + 0.2, 1], [END - 0.9, 1], [END - 0.5, 0]]);
    const yay = t >= K.everyday + 0.05 && t < K.work + 0.35;
    bface = {eyes: yay ? 'squeeze' : 'open', mouth: yay ? 'grin' : 'smile', lookY: -0.85 * up, lookX: 0.2 * up, browUp: up * 0.5};
  }
  const bagScale = BS * (held ? 1 : 1);

  // ---------------- mountain, stink, fire, smoke
  const moundD = g > 0.005 ? Array.from({length: 49}, (_, i) => {
    const x = MX + (-1 + (2 * i) / 48) * MW, u = (x - MX) / MW;
    const y = surf(x, g) - 12 * g * (Math.sin(x / 31) + 0.6 * Math.sin(x / 17 + 1)) * (1 - u * u);
    return `${i ? 'L' : 'M'} ${x} ${y}`;
  }).join(' ') + ` L ${MX + MW} 6 L ${MX - MW} 6 Z` : '';
  const stink = C ? 0 : Math.min(pop(t, K.stinking - 0.1, 0.35), popOut(t, K.burn + 0.1, 0.3));
  const top = surf(MX, g);
  const smoke: React.ReactNode[] = [];
  if (!C) for (let i = 0; i < 30; i++) {
    const tb = K.burn + 0.12 + i * 0.1, L = 2.4, u = (t - tb) / L;
    if (u <= 0 || u >= 1) continue;
    const f = FL[(i * 4) % 9];
    const x = f.x + Math.sin(i * 1.3) * 70 * u + (i % 2 ? 1 : -1) * 90 * u, y = f.y - 110 - 1300 * Math.pow(u, 0.8);
    const sc = (0.45 + 1.5 * u) * Math.min(1, u * 8) * (u > 0.75 ? 1 - ein((u - 0.75) / 0.25) : 1);
    const col = mix('#8C8782', '#2E2C2E', prog(tb, K.burn + 0.2, K.black - 0.2));
    smoke.push(<g key={i} transform={`translate(${x} ${y}) scale(${sc})`}><Puff c={SMOKE_C} fill={col} ow={8} /></g>);
  }
  const ceiling = C ? [] : Array.from({length: 10}, (_, i) => pop(t, K.black - 0.35 + i * 0.06, 0.5));

  const skyTop = mix('#7CC8FF', '#3A3738', d), skyBot = mix('#DDF3FF', '#7A726B', d);
  return (
    <AbsoluteFill style={{background: `linear-gradient(${skyTop} 0%, ${skyBot} 75%)`}}>
      <Layer cam={cam} z={2600}>
        {[[-900, -1150, 1.2], [300, -1500, 1.5], [1500, -1100, 1.1], [2400, -1600, 1.3]].map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x + 14 * loopSin(t, 1, i)} ${y}) scale(${s})`}>
            <Puff c={[[-80, 10, 50], [-25, -25, 66], [45, -10, 56], [95, 15, 38], [10, 25, 48]]} fill={mix('#FFFFFF', '#8E8780', d)} ow={8} /></g>))}
      </Layer>
      <Layer cam={cam} z={1800}><FarTown d={d} /></Layer>
      <Layer cam={cam} z={1000}>
        {/* road */}
        <rect x={-6000} y={0} width={12000} height={40} fill="#C9C4BA" />
        <rect x={-6000} y={40} width={12000} height={380} fill="#6F6F75" />
        <path d="M -6000 230 L 6000 230" stroke="white" strokeWidth={14} strokeDasharray="70 60" />
        <rect x={-6000} y={420} width={12000} height={4000} fill="#8FCB6A" />
        <path d="M -6000 40 L 6000 40 M -6000 420 L 6000 420" stroke={INK} strokeWidth={6 / c.s} opacity={0.35} />
        <path d="M -6000 0 L 6000 0" stroke={INK} strokeWidth={9 / c.s} />
        {/* mountain */}
        {moundD && <path d={moundD} fill="#6F6253" stroke={INK} strokeWidth={9 / c.s} strokeLinejoin="round" />}
        {!C && ITEMS.map((it, j) => {
          const tl = K.piles - 0.15 + it.f * 1.5; if (t < tl - 0.5) return null;
          const y = t < tl ? lerp(-2100, it.y, ein(prog(t, tl - 0.5, tl))) : it.y;
          const burnt = prog(t, K.burn + 0.2, K.black + 0.6) * 0.6;
          return <g key={j} transform={`translate(${it.x} ${y})`}><Junk type={it.type} c={it.c} s={it.s} rot={it.rot + (t < tl ? (t - tl) * 300 : 0)} burnt={burnt} /></g>;
        })}
        {stink > 0 && [[-140, -60], [10, -150], [160, -70]].map(([dx, dy], i) => {
          const pts = Array.from({length: 9}, (_, j) => { const u = j / 8; return `${j ? 'L' : 'M'} ${MX + dx + Math.sin(u * 7 + t * 5 + i) * 16} ${top + dy - u * 200}`; }).join(' ');
          return <g key={i} transform={`translate(${MX + dx} ${top + dy}) scale(${stink}) translate(${-(MX + dx)} ${-(top + dy)})`}>
            <path d={pts} stroke={INK} strokeWidth={22 + 18 / c.s} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d={pts} stroke="#8BD34B" strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>;
        })}
        {stink > 0 && [0, 1, 2].map((i) => {
          const x = MX + Math.cos(t * 5 + i * 2.1) * (180 + i * 40), y = top - 140 + Math.sin(t * 7.3 + i) * 60;
          return <g key={'f' + i} transform={`translate(${x} ${y}) scale(${stink})`}>
            <ellipse cx={-8} cy={-14} rx={12} ry={8} fill="white" stroke={INK} strokeWidth={5 / c.s} opacity={0.9} />
            <ellipse cx={8} cy={-14} rx={12} ry={8} fill="white" stroke={INK} strokeWidth={5 / c.s} opacity={0.9} />
            <circle r={13} fill={INK} /></g>;
        })}
        {!C && FL.map((f, i) => <g key={'fl' + i} transform={`translate(${f.x} ${f.y})`}>
          <Flame s={pop(t, K.burn + i * 0.05, 0.35) * f.s * (1.4 + 0.5 * prog(t, K.black - 0.3, K.black + 0.3))} t={t} i={i} /></g>)}
        {/* the bag */}
        <g transform={`translate(${bx} ${by - hop}) scale(${bagScale})`}>
          <Bag id="hero" sx={bsx} sy={bsy} rot={brot} {...bface} />
        </g>
        {smoke}
        {ceiling.map((s, i) => s > 0 && <g key={'c' + i} transform={`translate(${-500 + i * 230} ${-1750 - rnd(i + 70) * 450}) scale(${s * 2.6})`}>
          <Puff c={SMOKE_C} fill="#2E2C2E" ow={8} /></g>)}
        {/* the guy (drawn last on the road, in front of the mountain base) */}
        <g transform={`translate(${GX} 0)`}><Character {...guy} /></g>
      </Layer>
    </AbsoluteFill>
  );
};
