import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import timing from './timing.json';
import {Captions, SafeGuides} from './Captions';
import {Person, PersonPose} from './Cast';
import {Billboard, Foreground, HazeDefs, LongShadow, PCam, PerspGround, SunGlow, Whip, drift, hazeAt, proj} from './Depth';
import {Layer, KScale} from './Layer';
import {Note, Sign} from './Story';
import {Pill, Puff, Sparkle} from './Bits';
import {CarRear, CanPyramid, Can, CAN_COLORS, Cart, Gauge, HwySign, Lamp, Moon, Plant, Pump, Rat, ShutdownSign, Skyline, steamPuff} from './World';
import {INK, mix} from './color';
import {bump, camAt, clamp, ein, eio, eout, kfs, lerp, pick, pop, popOut, prog, rnd, spring} from './math';

const T = timing as any;
const K = T.keys as Record<string, number>;
const S = T.sentences as {start: number; end: number}[];
export const DURATION = T.duration as number;
const END = DURATION;
export const W = [S[3].start - 0.05, S[4].start - 0.05, S[5].start - 0.05, S[7].start - 0.05, S[9].start - 0.05];
const DIRS = ['left', 'down', 'left', 'up', 'left'] as const;
const RAY = {shirt: '#3E8ED0', hat: 'beanie' as const, hatColor: '#F28C28', hair: '#6B4423'};
const SVG: React.FC<{children?: React.ReactNode}> = ({children}) => <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>{children}</svg>;
/** a cast member standing at ground (X, Z) of a perspective scene, lifted by `lift` world units */
const Stand: React.FC<{c: PCam; X: number; Z: number; lift?: number; scale?: number; children?: React.ReactNode}> = ({c, X, Z, lift = 0, scale = 1, children}) => {
  const p = proj(c, X, Z); if (!p) return null; const s = p.s * scale;
  return <g transform={`translate(${p.x} ${p.y - lift * p.s})`}><g transform={`scale(${s})`}><KScale k={s}>{children}</KScale></g></g>;
};
const walkFeet = (t: number, t0: number, on: number): Partial<PersonPose> => {
  if (on <= 0) return {};
  const ph = (t - t0) * 2.4 * 2 * Math.PI;
  return {footL: [-36, -6 - Math.max(0, Math.sin(ph)) * 30 * on], footR: [36, -6 - Math.max(0, Math.sin(ph + Math.PI)) * 30 * on], sy: 1 + 0.015 * Math.abs(Math.sin(ph)) * on};
};

// ================================================================= A / G  highway
const CARS: [number, number, string, boolean][] = [[-150, 1500, '#E5483C', true], [165, 2700, '#4F7CC2', false], [-170, 4300, '#F2B33D', false], [150, 6200, '#5FB86A', true], [-140, 8200, '#9B5BD6', false]];
export const Highway: React.FC<{t: number; end?: boolean}> = ({t, end = false}) => {
  const dr = drift(t, END, 1.0);
  const t0 = K.traffic - 0.3, walk = !end && t > t0 ? (t - t0) * 300 : 0;
  const z = end ? kfs(t, [[W[4], -320], [K.okay + 0.4, 0]]) : kfs(t, [[0, 0], [K.ray - 0.1, 0], [K.ray + 0.5, 40], [K.gone - 0.3, 40], [K.gone + 0.7, -520]]) + walk;
  const c: PCam = {horizon: 820 + dr.dy * 0.6, h: 220, f: 900, x: dr.dx * 0.6, z};
  const RZ = 520 + walk;
  let pose: Partial<PersonPose> = {eyes: 'dot', mouth: 'smile'};
  if (!end) {
    const st = pick<string>(t, [[0, 'home'], [K.wakes - 0.1, 'yawn'], [K.gone - 0.15, 'look'], [K.finally - 0.1, 'smug']]);
    const wave = bump(t, K.ray - 0.1, K.ray + 1.0);
    const stretch = kfs(t, [[K.wakes - 0.15, 0], [K.wakes + 0.2, 1], [K.wakes + 1.1, 1], [K.wakes + 1.5, 0]]);
    const behind = kfs(t, [[K.finally - 0.15, 0], [K.finally + 0.15, 1]]);
    let hl: [number, number] = [-92, -120], hr: [number, number] = [lerp(92, 125, wave), lerp(-120, -340 + Math.sin(t * 16) * 18 * wave, wave)];
    hl = [lerp(hl[0], -70, stretch), lerp(hl[1], -480, stretch)]; hr = [lerp(hr[0], 70, stretch), lerp(hr[1], -480, stretch)];
    hl = [lerp(hl[0], -96, behind), lerp(hl[1], -370, behind)]; hr = [lerp(hr[0], 96, behind), lerp(hr[1], -370, behind)];
    pose = ({
      home: {eyes: 'dot', mouth: 'smile', blink: bump(t, K.ray + 1.2, K.ray + 1.36)},
      yawn: {eyes: 'squeeze', mouth: 'open', sy: 1 + 0.04 * stretch},
      look: {eyes: 'ring', mouth: 'o', lookX: Math.sin((t - K.gone) * 5) * 8, faceDx: Math.sin((t - K.gone) * 5) * 16, browUp: 1},
      smug: {eyes: 'smug', mouth: 'smirk', lean: -4, brow: 0.3, handsBack: true},
    } as any)[st];
    pose.handL = hl; pose.handR = hr;
    Object.assign(pose, walkFeet(t, t0, t > t0 ? Math.min(1, (t - t0) * 4) : 0));
  } else {
    const st = pick<string>(t, [[0, 'sheep'], [K.subscribe - 0.1, 'up'], [K.whatifs + 0.05, 'yay'], [K.whatifs + 0.6, 'up'], [END - 0.9, 'home']]);
    const scratch = kfs(t, [[K.okay - 0.1, 0], [K.okay + 0.2, 1], [K.subscribe - 0.3, 1], [K.subscribe, 0]]);
    const up = kfs(t, [[K.subscribe - 0.1, 0], [K.subscribe + 0.2, 1], [END - 0.9, 1], [END - 0.5, 0]]);
    pose = ({
      sheep: {eyes: 'dot', mouth: 'wavy', brow: -0.9, sweat: Math.min(pop(t, K.okay, 0.3), popOut(t, K.subscribe - 0.2, 0.25))},
      up: {eyes: 'dot', mouth: 'smile'}, yay: {eyes: 'squeeze', mouth: 'grin'}, home: {eyes: 'dot', mouth: 'smile'},
    } as any)[st];
    pose.faceDy = -16 * up; pose.lookY = -6 * up;
    pose.handR = [lerp(92, 78, scratch), lerp(-120, -440 + Math.sin(t * 14) * 10 * scratch, scratch)];
  }
  const props = [
    ...CARS.map(([X, Z, col, door], i) => ({Z, el: <Billboard key={'car' + i} c={c} X={X} Z={Z}><CarRear color={col} door={door} /></Billboard>})),
    ...Array.from({length: 14}, (_, i) => { const side = i % 2 ? 1 : -1, Z = 700 + i * 760; return {Z, el: <Billboard key={'l' + i} c={c} X={side * 540} Z={Z}><Lamp side={side} /></Billboard>}; }),
    {Z: 3600, el: <Billboard key="hs" c={c} X={660} Z={3600}><HwySign lines={['DOWNTOWN', 'EXIT 12']} /></Billboard>},
  ].filter((p) => p.Z > c.z + 60).sort((a, b) => b.Z - a.Z);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#6CB8F0 0%, #BFE0F5 32%, #FFE2B8 44%)', transform: `rotate(${dr.rot}deg) scale(${dr.zoom})`}}>
      <SunGlow x={820} y={560} r={62} t={t} />
      <SVG>
        <HazeDefs sky="#F3DCC0" />
        <Skyline base={c.horizon + 2} dx={-c.x * 0.05} color="#C7B3C9" seed={3} h={210} n={18} />
        <PerspGround c={c} ground="#C9B48A" far="#E9D6B4" kind="road" w={330} />
        {props.map((p) => p.el)}
        <Stand c={c} X={0} Z={RZ}><LongShadow angle={200} len={330} /><Person id="ray" t={t} outfit={RAY} {...pose} /></Stand>
      </SVG>
      <Foreground blur={7}>
        <g transform={`translate(${-30 + dr.dx * 2} 1890)`}><Puff c={[[0, 0, 90], [110, 20, 70], [-60, 30, 60]]} fill="#8FB561" ow={9} /></g>
        <g transform={`translate(${1110 + dr.dx * 2} 1900)`}><Puff c={[[0, 0, 90], [-110, 20, 70]]} fill="#8FB561" ow={9} /></g>
      </Foreground>
    </AbsoluteFill>
  );
};

// ================================================================= B  power plant at dusk
const PlantScene: React.FC<{t: number}> = ({t}) => {
  const dr = drift(t, END, 1.0), u = t - W[0];
  const d = kfs(t, [[K.down, 0], [K.nobody + 0.7, 1]]);
  const c: PCam = {horizon: 900 + dr.dy * 0.6, h: 300, f: 820, x: 60 + dr.dx * 0.6 - u * 18, z: u * 50};
  const lever = clamp(eout(prog(t, K.down - 0.2, K.down + 0.05)) + spring(t, K.down + 0.05, 3, 6) * 0.08, 0, 1.08);
  const city = 1 - prog(t, K.nobody - 0.1, K.nobody + 1.0);
  const plantLights = 1 - prog(t, K.down, K.down + 0.3);
  const st = pick<string>(t, [[0, 'curious'], [K.down - 0.05, 'o'], [K.nobody - 0.1, 'scared']]);
  const scared = kfs(t, [[K.nobody - 0.15, 0], [K.nobody + 0.15, 1]]);
  const pose = ({curious: {eyes: 'dot', mouth: 'smile', faceDx: 22, lookX: 7}, o: {eyes: 'dot', mouth: 'o', faceDx: 22, lookX: 7, browUp: 0.8},
    scared: {eyes: 'ring', mouth: 'o', browUp: 1, brow: -0.6, lookX: Math.sin(t * 9) * 5, sweat: pop(t, K.nobody + 0.1, 0.3), lean: Math.sin(t * 31) * 1.2}} as any)[st];
  pose.handL = [lerp(-92, -64, scared), lerp(-120, -300, scared)]; pose.handR = [lerp(92, 64, scared), lerp(-120, -300, scared)];
  const steam: React.ReactNode[] = [];
  for (let i = 0; i < 26; i++) {
    const ts = W[0] - 2.5 + i * 0.22; if (ts > K.down) break;
    const a = t - ts, L = 2.4; if (a < 0 || a > L) continue; const v = a / L;
    const [tx, ty] = i % 2 ? [-80, -720] : [330, -612];
    const sc = (0.7 + 1.4 * v) * Math.min(1, v * 6) * (v > 0.7 ? 1 - ein((v - 0.7) / 0.3) : 1);
    steam.push(steamPuff(tx + v * 120, ty - v * 520, sc, 's' + i));
  }
  const skyTop = mix('#6A7BC4', '#141B3A', d), skyMid = mix('#E9A0A0', '#2A2D55', d), hor = mix('#FFB070', '#3A2E5A', d);
  return (
    <AbsoluteFill style={{background: `linear-gradient(${skyTop} 0%, ${skyMid} 30%, ${hor} 47%)`, transform: `rotate(${dr.rot}deg) scale(${dr.zoom})`}}>
      <SunGlow x={300} y={860} r={70 * (1 - d)} color="#FFC48A" t={t} />
      <SVG>
        <HazeDefs sky={hor} />
        <Skyline base={c.horizon + 2} dx={-c.x * 0.08} x0={360} w={1000} color={mix('#9C8FB5', '#2A2F4A', d)} lights={city} seed={7} h={300} n={14} litOrder={(i) => Math.abs(i - 3) / 8} />
        <PerspGround c={c} ground={mix('#6E8B4E', '#2A3540', d)} far={mix('#C9A88A', '#3A3550', d)} kind="road" w={160} surface={mix('#6F6F75', '#2E3038', d)} />
        <Billboard c={c} X={110} Z={3300}><Plant lights={plantLights} />{steam}</Billboard>
        <Stand c={c} X={200} Z={1300} scale={0.7}><ShutdownSign lever={lever} /></Stand>
        <Stand c={c} X={-150} Z={c.z + 560}><LongShadow angle={20} len={300} /><Person id="rayB" t={t} outfit={RAY} {...pose} /></Stand>
        {d > 0 && <rect x={-200} y={-200} width={1480} height={2400} fill="#141B3A" opacity={d * 0.32} />}
      </SVG>
      <Foreground blur={8}><g transform={`translate(${1010 - u * 22} 1850)`}><Puff c={[[0, 0, 110], [-120, 30, 80], [90, 40, 70]]} fill={mix('#5E7A44', '#1E2A30', d)} ow={9} /></g></Foreground>
    </AbsoluteFill>
  );
};

// ================================================================= D  subway tunnel
const SubwayScene: React.FC<{t: number}> = ({t}) => {
  const dr = drift(t, END, 0.9), u = t - W[1];
  const c: PCam = {horizon: 860 + dr.dy * 0.6, h: 240, f: 850, x: dr.dx * 0.6, z: u * 110};
  const lamps = 1 - prog(t, K.stop, K.stop + 0.15);
  const Hw = kfs(t, [[K.flood - 0.4, 0], [K.days + 0.6, 170]], eio);
  const near = c.z + 45, far = c.z + 16000;
  const pq = (X: number, Z: number, H: number) => { const p = proj(c, X, Z)!; return [p.x, p.y - H * p.s] as const; };
  const quad = (a: readonly number[], b: readonly number[], cc: readonly number[], dd: readonly number[]) => `M ${a[0]} ${a[1]} L ${b[0]} ${b[1]} L ${cc[0]} ${cc[1]} L ${dd[0]} ${dd[1]} Z`;
  const WX = 520, WH = 620, dim = 1 - 0.45 * (1 - lamps);
  const wall = mix('#2C3140', '#4F566B', dim), ceil = mix('#22262F', '#3D4354', dim);
  const rings: React.ReactNode[] = [];
  for (let i = Math.ceil(near / 600) + 24; i >= Math.ceil(near / 600); i--) {
    const Z = i * 600, p = proj(c, 0, Z); if (!p) continue; const s = p.s, hz = hazeAt(p.d, 300, 9000);
    const xL = p.x - (WX + c.x * 0) * s, xR = p.x + WX * s, yg = p.y, yt = p.y - WH * s;
    const col = mix(mix('#8A90A3', '#1A1D26', hz), '#1A1D26', 1 - dim);
    rings.push(<path key={i} d={`M ${xL} ${yg} L ${xL} ${yt + 120 * s} Q ${xL} ${yt} ${xL + 140 * s} ${yt} L ${xR - 140 * s} ${yt} Q ${xR} ${yt} ${xR} ${yt + 120 * s} L ${xR} ${yg}`} stroke={col} strokeWidth={Math.max(2, 22 * s)} fill="none" />);
    if (lamps > 0) rings.push(<rect key={'lp' + i} x={xL + 14 * s} y={yt + 160 * s} width={30 * s} height={44 * s} fill="#FFE38A" opacity={lamps * (1 - hz)} />);
    else rings.push(<rect key={'lp' + i} x={xL + 14 * s} y={yt + 160 * s} width={30 * s} height={44 * s} fill="#E5483C" opacity={(0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 6))) * (1 - hz) * (i % 3 === 0 ? 1 : 0)} />);
  }
  const wy = (Z: number) => proj(c, 0, Z)!.y - Hw * proj(c, 0, Z)!.s;
  const pumpZ = 1500, pumpOn = t < K.stop ? 1 : 0, sad = t >= K.stop ? 1 : 0;
  const jets = t < K.stop ? [0, 1, 2, 3, 4, 5].map((i) => { const ph = (t * 2.4 + i / 6) % 1; return {ph, i}; }) : [];
  const ratS = pop(t, K.flood + 0.5, 0.4);
  const ratZ = c.z + 1000;
  const noteS = pop(t, K.days, 0.35);
  return (
    <AbsoluteFill style={{background: '#14161D', transform: `rotate(${dr.rot}deg) scale(${dr.zoom})`}}>
      <SVG>
        <path d={quad(pq(-WX, near, 0), pq(-WX, near, WH), pq(-WX, far, WH), pq(-WX, far, 0))} fill={wall} />
        <path d={quad(pq(WX, near, 0), pq(WX, near, WH), pq(WX, far, WH), pq(WX, far, 0))} fill={wall} />
        <path d={quad(pq(-WX, near, WH), pq(WX, near, WH), pq(WX, far, WH), pq(-WX, far, WH))} fill={ceil} />
        <PerspGround c={c} ground={mix('#2A2C34', '#4A4A52', dim)} far="#1A1D26" kind="rails" w={110} period={180} />
        {rings}
        <Stand c={c} X={-WX + 170} Z={pumpZ}><Pump on={pumpOn} t={t} sad={sad} />
          {jets.map(({ph, i}) => <circle key={i} cx={150 + ph * 160} cy={-120 + ph * ph * 200} r={14 * (1 - ph * 0.5)} fill="#7FC4F5" stroke={INK} strokeWidth={4} />)}
          {t >= K.stop && t < K.stop + 1.2 && steamPuff(0, -360 - (t - K.stop) * 200, Math.sin(Math.PI * clamp((t - K.stop) / 1.2)) * 0.8, 'pp')}
        </Stand>
        <Stand c={c} X={WX - 40} Z={2500} lift={330}><Sign w={420} h={130} lines={['UPTOWN']} post={false} board="#2E6B4F" ink="white" /></Stand>
        {noteS > 0 && <Stand c={c} X={-WX + 40} Z={c.z + 700} lift={330} scale={noteS}><Note text="DAY 2" w={240} /></Stand>}
        {Hw > 0.5 && <g>
          <path d={`M ${proj(c, -WX, near)!.x} ${wy(near)} L ${proj(c, WX, near)!.x} ${wy(near)} L ${proj(c, WX, far)!.x} ${wy(far)} L ${proj(c, -WX, far)!.x} ${wy(far)} Z`} fill="#2F7FC0" opacity={0.88} />
          {Array.from({length: 14}, (_, i) => { const Z = c.z + 300 + i * 380, p = proj(c, (rnd(i) - 0.5) * 700, Z)!; const y = p.y - Hw * p.s;
            return <path key={i} d={`M ${p.x - 40 * p.s} ${y} q ${20 * p.s} ${-12 * p.s} ${40 * p.s} 0 t ${40 * p.s} 0`} stroke="#BFE6FF" strokeWidth={Math.max(2, 7 * p.s)} fill="none" strokeLinecap="round" />; })}
        </g>}
        {ratS > 0 && <Stand c={c} X={90} Z={ratZ} lift={Hw - 8 + Math.sin(t * 3) * 6} scale={ratS * 1.4}><Rat t={t} /></Stand>}
      </SVG>
      <SVG><Pill x={520} y={560} text="flooded in ~2 days (one estimate)" size={34} s={Math.min(pop(t, K.days + 0.1, 0.35), popOut(t, W[2] - 0.35, 0.25))} /></SVG>
      <Foreground blur={8}><rect x={1110 - u * 40} y={-100} width={140} height={2200} fill="#2A2E38" stroke={INK} strokeWidth={10} /></Foreground>
    </AbsoluteFill>
  );
};

// ================================================================= E  supermarket aisle
const StoreScene: React.FC<{t: number}> = ({t}) => {
  const dr = drift(t, END, 0.9), u = t - W[2];
  const tilt = 300 * eio(prog(t, K.food - 0.3, K.food + 0.4));
  const c: PCam = {horizon: 820 + tilt + dr.dy * 0.6, h: 240, f: 850, x: dr.dx * 0.6, z: u * 40};
  const near = c.z + 45, far = c.z + 14000, SX = 430, SH = 560;
  const pq = (X: number, Z: number, H: number) => { const p = proj(c, X, Z)!; return [p.x, p.y - H * p.s] as const; };
  const lines: React.ReactNode[] = [];
  for (let i = Math.ceil(near / 300); i < Math.ceil(near / 300) + 46; i++) { const a = pq(-SX, i * 300, 0), b = pq(SX, i * 300, 0); lines.push(<path key={'t' + i} d={`M ${a[0]} ${a[1]} L ${b[0]} ${b[1]}`} stroke="#D3C6AE" strokeWidth={3} />); }
  for (let x = -SX + 172; x < SX; x += 172) { const a = pq(x, near, 0), b = pq(x, far, 0); lines.push(<path key={'x' + x} d={`M ${a[0]} ${a[1]} L ${b[0]} ${b[1]}`} stroke="#D3C6AE" strokeWidth={3} />); }
  const shelf = (side: number) => {
    const X = side * SX, out: React.ReactNode[] = [];
    out.push(<path key="f" d={`M ${pq(X, near, 0)} L ${pq(X, near, SH)} L ${pq(X, far, SH)} L ${pq(X, far, 0)} Z`.replace(/,/g, ' ')} fill={side < 0 ? '#BFC9D4' : '#AEB9C6'} />);
    [140, 290, 440].forEach((H) => out.push(<path key={'b' + H} d={`M ${pq(X, near, H)} L ${pq(X, far, H)}`.replace(/,/g, ' ')} stroke="#8A949E" strokeWidth={8} />));
    for (let j = Math.ceil(near / 130) + 1; j < Math.ceil(near / 130) + 70; j++) {
      const Z = j * 130;
      [0, 1, 2].forEach((lv) => { const p = proj(c, X - side * 40, Z); if (!p) return; const s = p.s * 0.9; const hz = hazeAt(p.d, 600, 9000);
        if (hz > 0.92) return;
        out.push(<g key={`${j}-${lv}`} transform={`translate(${p.x} ${p.y - [142, 292, 442][lv] * p.s}) scale(${s})`} opacity={1 - hz * 0.7}><KScale k={s}><Can c={CAN_COLORS[(j + lv * 2 + (side > 0 ? 1 : 0)) % 5]} /></KScale></g>); });
    }
    return out;
  };
  const cartOut = eio(prog(t, K.food - 0.35, K.food + 0.1));
  const pyr = prog(t, K.food - 0.25, K.food + 0.35);
  const lift = 3 * 82 * clamp(pyr * 1.0);
  const st = pick<string>(t, [[0, 'look'], [K.cans - 0.05, 'happy'], [K.quality - 0.1, 'read'], [K.food - 0.1, 'yay'], [K.problem + 0.2, 'smug']]);
  const pose = ({look: {eyes: 'dot', mouth: 'smile', faceDx: -14, lookX: -6}, happy: {eyes: 'squeeze', mouth: 'grin'}, read: {eyes: 'dot', mouth: 'o', faceDy: -18, lookY: -7, browUp: 0.6},
    yay: {eyes: 'squeeze', mouth: 'grin', handL: [-110, -470], handR: [110, -470]}, smug: {eyes: 'smug', mouth: 'smirk', handL: [-96, -370], handR: [96, -370], handsBack: true}} as any)[st];
  if (!pose.handL) { pose.handL = [-150, -200]; pose.handR = [150, -200]; }
  const signS = pop(t, K.quality - 0.05, 0.4);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#EFE8DA 0%, #F7F2E8 40%)', transform: `rotate(${dr.rot}deg) scale(${dr.zoom})`}}>
      <SVG>
        <HazeDefs sky="#F3EDE0" />
        <path d={`M ${pq(-SX, near, SH + 260)} L ${pq(SX, near, SH + 260)} L ${pq(SX, far, SH + 260)} L ${pq(-SX, far, SH + 260)} Z`.replace(/,/g, ' ')} fill="#E6DFD0" />
        {Array.from({length: 14}, (_, i) => { const Z = Math.ceil(near / 700) * 700 + i * 700, a = pq(-120, Z, SH + 255), b = pq(120, Z, SH + 255), p = proj(c, 0, Z)!;
          return <rect key={i} x={a[0]} y={a[1]} width={b[0] - a[0]} height={Math.max(2, 22 * p.s)} fill="#FFFFFF" stroke="#C9C2B4" strokeWidth={2} />; })}
        <PerspGround c={c} ground="#E8DDC8" far="#F3EDE0" kind="none" />
        {lines}
        {shelf(-1)}{shelf(1)}
        <Stand c={c} X={0} Z={1250} lift={700}><Sign w={520} h={140} lines={['CANNED FOOD']} post={false} board="#D9534F" ink="white" /></Stand>
        {signS > 0 && <Stand c={c} X={-250} Z={900} lift={600} scale={signS * 0.8}><Sign w={460} h={210} lines={['BEST QUALITY', '2–5 YEARS']} post={false} board="#FFE98A" /></Stand>}
        {pyr > 0 && <Stand c={c} X={40} Z={620}><CanPyramid rows={3} g={pyr} /></Stand>}
        <Stand c={c} X={40} Z={600} lift={lift}><LongShadow angle={-30} len={200} opacity={0.18} /><Person id="rayE" t={t} outfit={RAY} {...pose} /></Stand>
        {cartOut < 1 && <Stand c={c} X={-170 - cartOut * 1100} Z={540}><Cart full={pop(t, K.cans - 0.05, 0.4)} /></Stand>}
        {[0, 1, 2].map((i) => { const v = prog(t, K.food + 0.25 + i * 0.1, K.food + 0.7 + i * 0.1); const p = proj(c, 40 + (i - 1) * 220, 600)!;
          return v > 0 && v < 1 && <Sparkle key={i} x={p.x} y={p.y - (lift + 520) * p.s + i * 30} r={40 * Math.sin(v * Math.PI)} fill="#FFE14D" />; })}
      </SVG>
      <Foreground blur={7}><g transform="translate(60 1820)"><Can c="#E5483C" /></g></Foreground>
    </AbsoluteFill>
  );
};

// ================================================================= F  lonely rooftop at night (multiplane)
const RoofScene: React.FC<{t: number}> = ({t}) => {
  const c0 = camAt(t, [[W[3], {x: 0, y: -300, s: 1.5}], [K.loneliness + 0.3, {x: 0, y: -320, s: 1.55}], [K.cut - 0.2, {x: 0, y: -320, s: 1.55}],
    [K.cut + 1.4, {x: 280, y: -620, s: 0.42}], [W[4], {x: 300, y: -630, s: 0.44}]]);
  const dr = drift(t, END, 0.8);
  const ks = 1000 / (1000 - c0.z);
  const cam = {x: c0.x + dr.dx / ks, y: c0.y + dr.dy / ks, z: c0.z};
  const blue = kfs(t, [[K.loneliness - 0.1, 0], [K.loneliness + 0.3, 1]]);
  const gaugeS = pop(t, K.risk - 0.15, 0.45);
  const needle = kfs(t, [[K.risk, 0.12], [K.risk + 1.2, 0.86]], eio) + Math.sin(t * 9) * 0.01;
  const pose: Partial<PersonPose> = blue > 0.5 ? {eyes: 'dot', mouth: 'wavy', brow: -1, faceDy: 8, lookY: 4} : {eyes: 'dot', mouth: 'flat', faceDy: -12, lookY: -5, faceDx: 10};
  const bld = (x: number, w: number, top: number, col: string, seed: number, win = true) => (<g key={seed}>
    <rect x={x} y={top} width={w} height={4000} fill={col} />
    {win && Array.from({length: Math.floor(w / 60)}, (_, i) => Array.from({length: 18}, (_, r) => <rect key={`${i}-${r}`} x={x + 20 + i * 60} y={top + 30 + r * 80} width={26} height={36} fill={rnd(seed * 31 + i * 7 + r) < 0.08 ? '#4A4F70' : mix(col, '#000000', 0.25)} />))}
  </g>);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#0E1330 0%, #1C2550 55%, #34406E 100%)'}}>
      <Layer cam={cam} z={5000}>
        {Array.from({length: 60}, (_, i) => <circle key={i} cx={(rnd(i) - 0.5) * 3000} cy={-400 - rnd(i + 9) * 2600} r={3 + rnd(i + 4) * 4} fill="#FFF7D6" opacity={0.5 + 0.5 * Math.sin((2 * Math.PI * (2 + (i % 3)) * t) / END + i)} />)}
        <g transform="translate(700 -1500)"><Moon /></g>
      </Layer>
      <Layer cam={cam} z={2600}>{Array.from({length: 16}, (_, i) => bld(-2200 + i * 290, 240, -200 - rnd(i) * 700, '#2B3560', i + 100))}</Layer>
      <Layer cam={cam} z={1600}>{Array.from({length: 10}, (_, i) => bld(-1700 + i * 380, 300, 100 - rnd(i + 3) * 600, '#222B50', i + 200))}</Layer>
      <Layer cam={cam} z={1000}>
        {bld(-460, 840, 30, '#1A2142', 300)}
        <rect x={-480} y={0} width={880} height={40} fill="#3A4266" stroke={INK} strokeWidth={9 / ks} />
        <g transform="translate(260 0)"><rect x={-70} y={-300} width={140} height={210} rx={20} fill="#6B4A2E" stroke={INK} strokeWidth={9 / ks} />
          {[-50, 50].map((x) => <rect key={x} x={x - 8} y={-90} width={16} height={90} fill="#4A3322" stroke={INK} strokeWidth={7 / ks} />)}</g>
        {bld(500, 620, -500, '#1A2142', 301)}
        <rect x={490} y={-530} width={640} height={36} fill="#3A4266" stroke={INK} strokeWidth={9 / ks} />
        {gaugeS > 0 && <g transform={`translate(810 -530) scale(${1.8 * gaugeS})`}><KScale k={ks * 1.8}><Gauge v={needle} label={['EARLY-DEATH', 'RISK']} /></KScale></g>}
        <g transform="translate(-60 0)"><Person id="rayF" t={t} outfit={RAY} tint="blue" tintAmt={blue * 0.85} {...pose} sy={1 + 0.008 * Math.sin((2 * Math.PI * Math.round(0.4 * END) * t) / END)} /></g>
      </Layer>
      <SVG><Pill x={520} y={600} text="≈ smoking up to 15 cigarettes/day" size={34} s={Math.min(pop(t, K.smoking - 0.05, 0.35), popOut(t, W[4] - 0.3, 0.25))} /></SVG>
    </AbsoluteFill>
  );
};

// ================================================================= composition
const SCENES = [(t: number) => <Highway t={t} />, (t: number) => <PlantScene t={t} />, (t: number) => <SubwayScene t={t} />, (t: number) => <StoreScene t={t} />,
  (t: number) => <RoofScene t={t} />, (t: number) => <Highway t={t} end />];
export const Scene: React.FC<{t: number}> = ({t}) => {
  const DUR = 0.5;
  for (let i = 0; i < W.length; i++) if (Math.abs(t - W[i]) < DUR / 2) return <Whip t={t} at={W[i]} dur={DUR} dir={DIRS[i]} a={SCENES[i](t)} b={SCENES[i + 1](t)} />;
  let k = 0; for (let i = 0; i < W.length; i++) if (t >= W[i]) k = i + 1;
  return SCENES[k](t);
};

const Cta: React.FC<{t: number}> = ({t}) => {
  const t0 = K.subscribe - 0.12, click = K.whatifs - 0.05, out = END - 0.75;
  const sIn = pop(t, t0, 0.4), sOut = popOut(t, out, 0.3); const s = Math.min(sIn, sOut);
  if (s <= 0.001) return null;
  const done = t >= click;
  const press = 1 - 0.1 * bump(t, click - 0.06, click + 0.1) + 0.07 * spring(t, click + 0.1, 3, 6);
  const bellA = t >= click + 0.25 ? spring(t, click + 0.25, 4, 3.5) * 28 : 0;
  const cu = eio(prog(t, t0 + 0.25, click - 0.05)), cl = ein(prog(t, click + 0.35, click + 0.8));
  const cx = lerp(900, 600, cu) + cl * 420, cy = lerp(760, 452, cu) + cl * 260;
  const csc = 1 - 0.15 * bump(t, click - 0.06, click + 0.1);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, width: 1040, top: 360, display: 'flex', justifyContent: 'center', transform: `scale(${s * press})`, transformOrigin: '520px 70px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
          <div style={{background: done ? '#4A4A4A' : '#E52D27', color: 'white', fontFamily: 'Inter', fontWeight: 900, fontSize: 60, letterSpacing: 1,
            padding: '20px 42px', borderRadius: 26, border: '7px solid #111', boxShadow: '0 9px 0 #111'}}>{done ? 'SUBSCRIBED ✓' : 'SUBSCRIBE'}</div>
          <svg width={110} height={110} viewBox="-58 -58 116 116" style={{overflow: 'visible'}}>
            <circle r={52} fill="white" stroke="#111" strokeWidth={7} />
            <g transform={`rotate(${bellA}) translate(0 -2)`}>
              <path d="M -24 16 C -24 -6 -22 -26 0 -28 C 22 -26 24 -6 24 16 L 30 22 L -30 22 Z" fill={done ? '#FFD23F' : '#DDD'} stroke="#111" strokeWidth={6} strokeLinejoin="round" />
              <circle cy={-31} r={5} fill="#111" /><circle cy={28} r={7} fill="#111" />
            </g>
          </svg>
        </div>
      </div>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const u = prog(t, click + 0.02, click + 0.55); if (u <= 0 || u >= 1) return null;
        const a = i * Math.PI / 4 + 0.3, r = 150 + eout(u) * 170;
        return <svg key={i} width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}><g transform={`translate(${520 + Math.cos(a) * r * 1.5} ${430 + Math.sin(a) * r * 0.6})`}>
          <path d="M 0 -24 Q 6 -6 24 0 Q 6 6 0 24 Q -6 6 -24 0 Q -6 -6 0 -24 Z" transform={`scale(${Math.sin(u * Math.PI)})`} fill="#FFE14D" stroke="#111" strokeWidth={5} strokeLinejoin="round" /></g></svg>;
      })}
      {t > t0 + 0.2 && cl < 1 && <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <g transform={`translate(${cx} ${cy}) scale(${csc * 1.5})`}><path d="M 0 0 L 0 46 L 12 35 L 21 55 L 30 51 L 21 32 L 37 32 Z" fill="white" stroke="#111" strokeWidth={4.5} strokeLinejoin="round" /></g></svg>}
    </AbsoluteFill>
  );
};

export const Short: React.FC<{voice?: boolean; captions?: boolean; guides?: boolean}> = ({voice = false, captions = true, guides = false}) => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Scene t={t} />
      <Cta t={t} />
      {captions && <Captions t={t} />}
      {guides && <SafeGuides />}
      <Audio src={staticFile(`${T.short}/sfx.wav`)} volume={0.42} />
      <Audio src={staticFile(`${T.short}/bed.wav`)} volume={0.2} />
      {voice && <Sequence from={Math.round(Math.max(0, T.voiceOffset) * fps)} layout="none"><Audio src={staticFile(`${T.short}/vo.wav`)} /></Sequence>}
    </AbsoluteFill>
  );
};

export const Thumb: React.FC<{variant: 'A' | 'B' | 'C'}> = ({variant}) => {
  const cfg = {A: {t: K.finally + 0.6, l1: 'LAST PERSON', l2: 'ON EARTH?', tag: ''}, B: {t: K.cut - 0.3, l1: 'THE REAL', l2: 'DANGER?', tag: ''},
    C: {t: K.days + 0.4, l1: 'SUBWAY FLOODS', l2: 'IN 2 DAYS?', tag: 'one estimate'}}[variant];
  return (
    <AbsoluteFill>
      <Scene t={cfg.t} />
      <AbsoluteFill style={{top: 230, height: 330, bottom: 'auto', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
        {[cfg.l1, cfg.l2].map((l, i) => <div key={i} style={{fontFamily: 'Inter', fontWeight: 900, fontSize: l.length > 11 ? 96 : 118, lineHeight: 1.04, whiteSpace: 'nowrap',
          color: i ? '#FFE14D' : 'white', WebkitTextStroke: '28px #111', paintOrder: 'stroke fill', textAlign: 'center', width: 900,
          filter: 'drop-shadow(0 8px 0 rgba(0,0,0,0.35))', letterSpacing: -1}}>{l}</div>)}
      </AbsoluteFill>
      {cfg.tag && <AbsoluteFill style={{top: 1180, height: 70, bottom: 'auto', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontFamily: 'Inter', fontWeight: 800, fontSize: 36, color: 'white', background: 'rgba(17,17,17,0.75)', padding: '8px 24px', borderRadius: 40}}>{cfg.tag}</div>
      </AbsoluteFill>}
    </AbsoluteFill>
  );
};
