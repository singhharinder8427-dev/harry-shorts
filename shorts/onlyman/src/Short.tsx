import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import timing from './timing.json';
import {Captions, SafeGuides} from './Captions';
import {Person, PersonPose, Outfit} from './Cast';
import {Billboard, Foreground, HazeDefs, LongShadow, PCam, PerspGround, SunGlow, Whip, drift, hazeAt, proj} from './Depth';
import {KScale} from './Layer';
import {Banner} from './Story';
import {Pill, Puff, Sparkle} from './Bits';
import {Lamp, Moon, Skyline} from './World';
import {Baby, Calendar, Cat, Crib, Crown, Dalmatian, Empty, FireStation, Freezer, HelmetWall, HouseB, Parliament, Pole, Spark, Toolbox, Tree, towerWindows} from './World2';
import {INK, mix} from './color';
import {bump, clamp, ein, eio, eout, kfs, lerp, pick, pop, popOut, prog, rnd, spring} from './math';

const T = timing as any;
const K = T.keys as Record<string, number>;
const S = T.sentences as {start: number; end: number}[];
export const DURATION = T.duration as number;
const END = DURATION;
export const W = [S[3].start - 0.05, S[4].start - 0.05, S[5].start - 0.05, S[6].start - 0.05, S[7].start - 0.05, K.boys - 0.35, S[9].start - 0.05];
const DIRS = ['right', 'left', 'left', 'up', 'down', 'right', 'left'] as const;
const RAY: Outfit = {shirt: '#3E8ED0', hat: 'beanie', hatColor: '#F28C28', hair: '#6B4423'};
const MAYA: Outfit = {shirt: '#D9534F', hair: '#3B2A20', hairStyle: 'long'};
const SVG: React.FC<{children?: React.ReactNode}> = ({children}) => <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>{children}</svg>;
const Stand: React.FC<{c: PCam; X: number; Z: number; lift?: number; scale?: number; children?: React.ReactNode}> = ({c, X, Z, lift = 0, scale = 1, children}) => {
  const p = proj(c, X, Z); if (!p) return null; const s = p.s * scale;
  return <g transform={`translate(${p.x} ${p.y - lift * p.s})`}><g transform={`scale(${s})`}><KScale k={s}>{children}</KScale></g></g>;
};
const walkFeet = (t: number, t0: number, on: number): Partial<PersonPose> => {
  if (on <= 0) return {};
  const ph = (t - t0) * 2.4 * 2 * Math.PI;
  return {footL: [-36, -6 - Math.max(0, Math.sin(ph)) * 30 * on], footR: [36, -6 - Math.max(0, Math.sin(ph + Math.PI)) * 30 * on]};
};
const loopSin = (t: number, n: number, ph = 0) => Math.sin((2 * Math.PI * n * t) / END + ph);
const Clouds: React.FC<{t: number; fill?: string; y?: number}> = ({t, fill = 'white', y = 0}) => (<SVG>
  {[[160, 330, 1.0], [700, 250, 1.3], [1000, 420, 0.8]].map(([x, yy, s], i) => <g key={i} transform={`translate(${x + 20 * loopSin(t, 1, i)} ${yy + y}) scale(${s})`}>
    <Puff c={[[-70, 10, 44], [-20, -20, 58], [40, -8, 50], [84, 14, 34], [10, 22, 42]]} fill={fill} ow={7} /></g>)}</SVG>);

// ================================================================= street (open / Maya two-shot / end)
const PILES: [number, number][] = [[-380, 1300], [400, 2100], [-360, 3200], [380, 4400], [-400, 5600]];
const Street: React.FC<{t: number; mode: 'open' | 'two' | 'end'}> = ({t, mode}) => {
  const dr = drift(t, END, 1.0);
  let cx = 0, z = 0;
  if (mode === 'open') z = kfs(t, [[0, 0], [K.ray - 0.1, 0], [K.ray + 0.5, 40], [K.gone - 0.3, 40], [K.gone + 0.7, -480], [W[0], -440]]);
  else if (mode === 'two') { cx = 170; z = -260 + (t - W[0]) * 25; }
  else { cx = kfs(t, [[W[6], 170], [K.good + 1.0, 170], [K.subscribe + 0.3, 0]]); z = kfs(t, [[W[6], -260], [K.good + 1.0, -260], [K.subscribe + 0.3, 0]]); }
  const c: PCam = {horizon: 820 + dr.dy * 0.6, h: 220, f: 900, x: cx + dr.dx * 0.6, z};
  // Ray
  let ray: Partial<PersonPose> = {eyes: 'dot', mouth: 'smile'};
  let crown = 0, crownFall = 0;
  if (mode === 'open') {
    const st = pick<string>(t, [[0, 'home'], [K.gone - 0.15, 'look'], [K.big - 0.1, 'smug']]);
    const wave = bump(t, K.ray - 0.1, K.ray + 1.0), hips = kfs(t, [[K.big - 0.15, 0], [K.big + 0.15, 1]]);
    ray = ({home: {eyes: 'dot', mouth: 'smile', blink: bump(t, K.ray + 1.3, K.ray + 1.46)},
      look: {eyes: 'ring', mouth: 'o', lookX: Math.sin((t - K.gone) * 5) * 8, faceDx: Math.sin((t - K.gone) * 5) * 16, browUp: 1},
      smug: {eyes: 'smug', mouth: 'grin', brow: 0.3, lean: -3}} as any)[st];
    ray.handR = [lerp(lerp(92, 125, wave), 66, hips), lerp(lerp(-120, -340 + Math.sin(t * 16) * 18 * wave, wave), -150, hips)];
    ray.handL = [lerp(-92, -66, hips), lerp(-120, -150, hips)];
    crown = pop(t, K.big - 0.05, 0.4);
  } else if (mode === 'two') {
    ray = {eyes: 'smug', mouth: 'grin', faceDx: 16, lookX: 6, handL: [-66, -150], handR: [66, -150]}; crown = 1;
  } else {
    const st = pick<string>(t, [[0, 'proud'], [K.special - 0.05, 'deflate'], [K.subscribe - 0.1, 'up'], [K.whatifs - 0.05, 'yay'], [K.whatifs + 0.5, 'up'], [END - 0.9, 'home']]);
    const up = kfs(t, [[K.subscribe - 0.1, 0], [K.subscribe + 0.2, 1], [END - 0.9, 1], [END - 0.5, 0]]);
    ray = ({proud: {eyes: 'smug', mouth: 'grin', handL: [-66, -150], handR: [66, -150]}, deflate: {eyes: 'dot', mouth: 'wavy', brow: -0.9, sy: 1 - 0.06 * clamp((t - K.special) * 3) + 0.03 * spring(t, K.special + 0.3, 3, 5), faceDx: 12, lookX: 5},
      up: {eyes: 'dot', mouth: 'smile'}, yay: {eyes: 'squeeze', mouth: 'grin'}, home: {eyes: 'dot', mouth: 'smile'}} as any)[st];
    ray.faceDy = (ray.faceDy ?? 0) - 16 * up; ray.lookY = -6 * up;
    crown = t < K.special - 0.05 ? 1 : 0; crownFall = t >= K.special - 0.05 ? 1 : 0;
  }
  // crown physics in the end shot: slips off, bounces on the ground, the cat swats it out of frame
  let crownEl: React.ReactNode = null;
  if (crownFall) {
    const a = t - (K.special - 0.05), sw = t - (K.good + 0.35);
    let X = 0, Y = 470, rot = 0;
    if (a < 0.6) { const u = a / 0.6; X = lerp(0, 150, u); Y = lerp(470, 0, ein(u)) + Math.sin(Math.PI * u) * 80; rot = 200 * u; }
    else { X = 150; Y = Math.abs(Math.sin((a - 0.6) * 9)) * 30 * Math.exp(-(a - 0.6) * 5); rot = 200; }
    if (sw > 0) { X = 150 + ein(clamp(sw / 0.7)) * 1500; rot += sw * 500; }
    X = Math.min(X, 1500);
    if (X < 1400) crownEl = <Stand c={c} X={X} Z={480} lift={Y}><g transform={`rotate(${rot} 0 -50) scale(0.8)`}><Crown /></g></Stand>;
  }
  // Maya
  let maya: React.ReactNode = null;
  if (mode === 'two' || (mode === 'end' && t < K.good + 2.4)) {
    let X = 330, pose: Partial<PersonPose> = {};
    if (mode === 'two') {
      X = kfs(t, [[W[0], 950], [K.maya + 0.3, 330]], eout);
      const st = pick<string>(t, [[0, 'walk'], [K.maya + 0.3, 'flat'], [K.impressed - 0.1, 'roll']]);
      pose = ({walk: {eyes: 'dot', mouth: 'flat', ...walkFeet(t, W[0], 1)}, flat: {eyes: 'dot', mouth: 'flat', faceDx: -14, lookX: -6},
        roll: {eyes: 'dot', mouth: 'flat', faceDx: -6, faceDy: -10, lookY: -8, lookX: 4, brow: 0.5, handL: [34, -175], handR: [-34, -175]}} as any)[st];
    } else {
      X = kfs(t, [[K.good + 0.7, 330], [K.good + 2.3, 1300]]);
      const walking = t > K.good + 0.7;
      pose = t < K.good - 0.1 ? {eyes: 'dot', mouth: 'smirk', faceDx: -12, lookX: -6, handL: [34, -175], handR: [-34, -175]}
        : {eyes: 'squeeze', mouth: 'grin', handL: [-66, -150], handR: [66, -150], ...walkFeet(t, K.good + 0.7, walking ? 1 : 0)};
    }
    maya = <Stand c={c} X={X} Z={540}><LongShadow angle={200} len={300} /><Person id="maya" t={t} outfit={MAYA} {...pose} /></Stand>;
  }
  const catSwat = mode === 'end' ? bump(t, K.good + 0.25, K.good + 0.6) : 0;
  const props = [
    ...Array.from({length: 12}, (_, i) => { const side = i % 2 ? 1 : -1, Z = 900 + i * 650; const cols = ['#F3E3C3', '#CFE3F2', '#F6C9A8', '#E3EFC9', '#F3D6E0'], roofs = ['#D9534F', '#4F7CC2', '#8C5A3C', '#5EA35A'];
      return {Z, el: <Billboard key={'h' + i} c={c} X={side * 760} Z={Z}><HouseB c={cols[i % 5]} roof={roofs[i % 4]} flip={side > 0} /></Billboard>}; }),
    ...Array.from({length: 12}, (_, i) => { const side = i % 2 ? -1 : 1, Z = 650 + i * 650; return {Z, el: <Billboard key={'t' + i} c={c} X={side * 470} Z={Z}><Tree c={['#5FB04E', '#4FA04A', '#6CBF55'][i % 3]} sway={Math.sin(t * 1.3 + i) * 2} /></Billboard>}; }),
    ...PILES.map(([X, Z], i) => ({Z, el: <Billboard key={'p' + i} c={c} X={X} Z={Z}>{(() => { const s = mode === 'open' ? pop(t, K.gone + i * 0.12, 0.35) : 1;
      const u = mode === 'open' ? prog(t, K.gone + i * 0.12, K.gone + 0.5 + i * 0.12) : 1;
      return <g>{s > 0 && <g transform={`scale(${s * 1.3})`}><Empty c={['#3A3A3E', '#4F7CC2', '#8C5A3C'][i % 3]} /></g>}{u > 0 && u < 1 && <Sparkle x={0} y={-60} r={70 * Math.sin(u * Math.PI)} fill="#FFF6C4" />}</g>; })()}</Billboard>})),
  ].filter((p) => p.Z > c.z + 60).sort((a, b) => b.Z - a.Z);
  const confetti = mode === 'open' && t > K.big - 0.05 && t < K.big + 2 ? Array.from({length: 30}, (_, i) => {
    const a = t - (K.big - 0.05), x = rnd(i) * 1080 + Math.sin(a * 3 + i) * 30, y = -60 + a * (380 + rnd(i + 4) * 300);
    return <rect key={i} x={x} y={y} width={18} height={10} rx={2} fill={['#FFD23F', '#E5483C', '#3E8ED0', '#5FB86A'][i % 4]} transform={`rotate(${a * 400 + i * 40} ${x} ${y})`} />; }) : null;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#6CB8F0 0%, #BFE0F5 30%, #FFE7C2 43%)', transform: `rotate(${dr.rot}deg) scale(${dr.zoom})`}}>
      <SunGlow x={800} y={520} r={62} t={t} />
      <Clouds t={t} />
      <SVG>
        <HazeDefs sky="#F3DCC0" />
        <PerspGround c={c} ground="#8FC66A" far="#D8E6B8" kind="road" w={300} />
        {(() => { const q = (X: number, Z: number) => proj(c, X, Z)!; const near = c.z + 45, far = c.z + 16000;
          return [[300, 420], [-420, -300]].map(([a, b], i) => <path key={i} d={`M ${q(a, near).x} ${q(a, near).y} L ${q(b, near).x} ${q(b, near).y} L ${q(b, far).x} ${q(b, far).y} L ${q(a, far).x} ${q(a, far).y} Z`} fill="#D9D3C7" />); })()}
        {props.map((p) => p.el)}
        <Stand c={c} X={190} Z={560} scale={0.72}><g transform={`rotate(${catSwat * -12})`}><Cat t={t} yawn={mode === 'open' && t > K.big + 0.3 && t < K.big + 1.2 ? 1 : 0} lookX={mode === 'end' && t > K.special ? 1 : 0} blink={bump(t, 2.6, 2.75)} /></g></Stand>
        {crownEl}
        <Stand c={c} X={0} Z={520}><LongShadow angle={200} len={330} /><Person id="ray" t={t} outfit={RAY} {...ray} />
          {crown > 0.01 && <g transform={`translate(0 -470) scale(${crown * 0.8})`}><Crown /></g>}</Stand>
        {maya}
      </SVG>
      <SVG>{confetti}</SVG>
      <Foreground blur={7}>
        <g transform={`translate(${-30 + dr.dx * 2} 1890)`}><Puff c={[[0, 0, 90], [110, 20, 70], [-60, 30, 60]]} fill="#6FAE4E" ow={9} /></g>
        <g transform={`translate(${1110 + dr.dx * 2} 1900)`}><Puff c={[[0, 0, 90], [-110, 20, 70]]} fill="#6FAE4E" ow={9} /></g>
      </Foreground>
    </AbsoluteFill>
  );
};

// ================================================================= New York: the fire department
const NYC: React.FC<{t: number}> = ({t}) => {
  const dr = drift(t, END, 1.0), u = t - W[1];
  const c: PCam = {horizon: 860 + dr.dy * 0.6, h: 220, f: 820, x: dr.dx * 0.6, z: u * 25};
  const order = Array.from({length: 50}, (_, i) => rnd(i * 3 + 7));
  const hs = Array.from({length: 50}, (_, i) => i === 22 ? 1 : popOut(t, K.lost - 0.1 + order[i] * 1.3, 0.25));
  const towers = Array.from({length: 10}, (_, i) => { const side = i % 2 ? 1 : -1, Z = 1500 + i * 900;
    const col = ['#8C9BB5', '#B5A58C', '#9AA8A0', '#A79AB5'][i % 4], H = 1800 + rnd(i) * 1400;
    return {Z, el: <Billboard key={'tw' + i} c={c} X={side * 900} Z={Z}><g><rect x={-330} y={-H} width={660} height={H} fill={col} stroke={INK} strokeWidth={8} />
      {towerWindows(-300, -H + 30, 300, -40, 8, Math.floor(H / 120), mix(col, '#FFFFFF', 0.45), i * 13)}</g></Billboard>}; }).filter((p) => p.Z > c.z + 60).sort((a, b) => b.Z - a.Z);
  const ff = pick<string>(t, [[0, 'calm'], [K.lost + 0.2, 'shock'], [K.two, 'shrug']]);
  const ffPose = ({calm: {eyes: 'dot', mouth: 'smile'}, shock: {eyes: 'ring', mouth: 'o', browUp: 1, faceDx: 18, lookX: 7},
    shrug: {eyes: 'dot', mouth: 'flat', brow: -0.5, handL: [-120, -230], handR: [120, -230], sweat: 1}} as any)[ff];
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#5DA9E9 0%, #A9D4F5 35%, #E9E1D8 45%)', transform: `rotate(${dr.rot}deg) scale(${dr.zoom})`}}>
      <SunGlow x={560} y={300} r={56} t={t} />
      <SVG>
        <HazeDefs sky="#D8DCE6" />
        <Skyline base={c.horizon + 2} dx={-c.x * 0.05} color="#A8B3C9" seed={11} h={520} n={20} />
        <PerspGround c={c} ground="#B9B5AE" far="#D8D6D2" kind="road" w={320} surface="#5E5E66" line="#FFD23F" />
        {towers.map((p) => p.el)}
        <Billboard c={c} X={560} Z={1900}><FireStation t={t} /></Billboard>
        <Stand c={c} X={40} Z={1000} scale={0.62}><HelmetWall s={hs} /></Stand>
        <Stand c={c} X={-290} Z={820}><LongShadow angle={160} len={260} /><Person id="ff" t={t} outfit={{shirt: '#C9A15A', hat: 'hardhat', hatColor: '#C0392B', hair: '#2E2018', hairStyle: 'ponytail'}} {...ffPose} /></Stand>
        <Stand c={c} X={170} Z={860} scale={0.9}><Dalmatian t={t} look={Math.sin(t * 2.2) * 1.0} /></Stand>
      </SVG>
      <SVG><Pill x={520} y={560} text="under 2% of NYC firefighters are women" size={30} s={Math.min(pop(t, K.two - 0.05, 0.35), popOut(t, W[2] - 0.35, 0.25))} /></SVG>
      <Foreground blur={8}><rect x={1060 - u * 30} y={-100} width={120} height={2200} fill="#6E7280" stroke={INK} strokeWidth={10} /></Foreground>
    </AbsoluteFill>
  );
};

// ================================================================= America at dusk: power lines
const DuskRoad: React.FC<{t: number}> = ({t}) => {
  const dr = drift(t, END, 1.0), u = t - W[2];
  const d = kfs(t, [[W[2], 0.3], [K.fast + 0.4, 1]]);
  const c: PCam = {horizon: 880 + dr.dy * 0.6, h: 240, f: 860, x: 60 + dr.dx * 0.6, z: u * 40};
  const on = (i: number) => prog(t, K.fast + i * 0.09, K.fast + 0.1 + i * 0.09);
  const poles = Array.from({length: 12}, (_, i) => 500 + i * 900);
  const wires: React.ReactNode[] = [];
  for (let i = 0; i < poles.length - 1; i++) {
    const a = proj(c, -560, poles[i]), b = proj(c, -560, poles[i + 1]); if (!a || !b) continue;
    [-100, 0, 100].forEach((dx, j) => { const ax = a.x + dx * a.s, ay = a.y - 740 * a.s, bx = b.x + dx * b.s, by = b.y - 740 * b.s;
      wires.push(<path key={`${i}-${j}`} d={`M ${ax} ${ay} Q ${(ax + bx) / 2} ${(ay + by) / 2 + 30 * a.s} ${bx} ${by}`} stroke="#222" strokeWidth={Math.max(1.5, 4 * a.s)} fill="none" />); });
  }
  const st = pick<string>(t, [[0, 'look'], [K.toolbox - 0.1, 'tool'], [K.fast - 0.1, 'fix'], [K.fast + 0.4, 'proud']]);
  const hat = pop(t, K.toolbox - 0.05, 0.35);
  const pose = ({look: {eyes: 'dot', mouth: 'o', faceDx: 18, lookX: 6, faceDy: -8, lookY: -5}, tool: {eyes: 'dot', mouth: 'smirk', brow: 0.4, handR: [110, -110]},
    fix: {eyes: 'squeeze', mouth: 'teeth', handR: [130, -430]}, proud: {eyes: 'dot', mouth: 'grin', handL: [-66, -150], handR: [110, -110]}} as any)[st];
  const outfit: Outfit = {...MAYA, hat: hat > 0.5 ? 'hardhat' : 'none', hatColor: '#FFD23F'};
  const skyTop = mix('#4A5AA8', '#0E1330', d), skyMid = mix('#E79A8C', '#1E2550', d), hor = mix('#FFB070', '#3A3060', d);
  return (
    <AbsoluteFill style={{background: `linear-gradient(${skyTop} 0%, ${skyMid} 30%, ${hor} 46%)`, transform: `rotate(${dr.rot}deg) scale(${dr.zoom})`}}>
      <SVG>
        {Array.from({length: 50}, (_, i) => <circle key={i} cx={rnd(i) * 1080} cy={rnd(i + 5) * 760} r={2 + rnd(i + 2) * 3} fill="#FFF7D6" opacity={clamp(d * 1.4 - 0.4) * (0.5 + 0.5 * Math.sin(t * 3 + i))} />)}
        <g transform={`translate(820 ${520 - d * 140}) scale(0.7)`}><KScale k={0.7}><Moon /></KScale></g>
      </SVG>
      <SVG>
        <HazeDefs sky={hor} />
        <Skyline base={c.horizon + 2} dx={-c.x * 0.05} color={mix('#8C7FA8', '#252A48', d)} seed={5} h={160} n={22} lights={d} litOrder={(i) => (i % 5) / 5} />
        <PerspGround c={c} ground={mix('#7A8F4E', '#24303A', d)} far={mix('#C9A88A', '#3A3550', d)} kind="road" w={300} surface={mix('#6F6F75', '#2E3038', d)} />
        {poles.filter((Z) => Z > c.z + 60).sort((a, b) => b - a).map((Z) => <Billboard key={'po' + Z} c={c} X={-560} Z={Z}><Pole /></Billboard>)}
        {wires}
        {Array.from({length: 10}, (_, i) => 900 + i * 800).filter((Z) => Z > c.z + 60).sort((a, b) => b - a).map((Z, j, arr) => {
          const i = arr.length - 1 - j;
          return <Billboard key={'la' + Z} c={c} X={380} Z={Z}><Lamp side={1} on={on(i)} />
            {on(i) > 0 && <ellipse cx={-110} cy={-560} rx={150} ry={150} fill="#FFE98A" opacity={0.18 * on(i)} />}
            {i === 0 && t < K.fast && <g transform="translate(-110 -580)"><Spark t={t} s={0.6 + 0.4 * Math.abs(Math.sin(t * 13))} /></g>}</Billboard>;
        })}
        <Stand c={c} X={-60} Z={c.z + 900}><LongShadow angle={20} len={260} /><Person id="mayaD" t={t} outfit={outfit} {...pose} />
          {t > K.toolbox - 0.05 && <g transform={`translate(${(pose.handR ?? [92, -120])[0]} ${(pose.handR ?? [92, -120])[1] + 70}) scale(${pop(t, K.toolbox - 0.05, 0.3)})`}><Toolbox /></g>}</Stand>
        {d > 0.35 && <rect x={-200} y={-200} width={1480} height={2400} fill="#0E1330" opacity={(d - 0.35) * 0.3} />}
      </SVG>
      <SVG><Pill x={520} y={560} text="~97% of US electricians are men" size={32} s={Math.min(pop(t, K.electricians - 0.05, 0.35), popOut(t, K.fast + 0.6, 0.25))} /></SVG>
    </AbsoluteFill>
  );
};

// ================================================================= Rwanda: parliament in the sun
const MPS: Outfit[] = [{shirt: '#3E8ED0', hair: '#1E1410', hairStyle: 'bun'}, {shirt: '#F2B33D', hair: '#1E1410', hairStyle: 'long'}, {shirt: '#5FB86A', hair: '#1E1410', hairStyle: 'ponytail'}];
const Rwanda: React.FC<{t: number}> = ({t}) => {
  const dr = drift(t, END, 1.0), u = t - W[3];
  const c: PCam = {horizon: 900 + dr.dy * 0.6, h: 240, f: 860, x: dr.dx * 0.6 - u * 15, z: u * 60};
  const hills = [[820, '#A9D98A', 0.03], [870, '#8CCB6C', 0.06], [905, '#79BE5A', 0.1]] as const;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#4FAEF0 0%, #9ED3F7 32%, #E6F4FF 46%)', transform: `rotate(${dr.rot}deg) scale(${dr.zoom})`}}>
      <SunGlow x={260} y={380} r={70} t={t} />
      <Clouds t={t} y={-60} />
      <SVG>
        <HazeDefs sky="#E6F4FF" />
        {hills.map(([y, col, p], i) => { const dx = -c.x * p; return <path key={i} d={`M -300 ${y} ${Array.from({length: 9}, (_, j) => `Q ${-300 + j * 220 + 110 + dx} ${y - 90 - (j % 3) * 30} ${-300 + (j + 1) * 220 + dx} ${y}`).join(' ')} L 1500 1920 L -300 1920 Z`} fill={col} />; })}
        <PerspGround c={c} ground="#6FB64E" far="#9ED07E" kind="road" w={220} surface="#D9C49A" line="#F4E8CC" />
        {Array.from({length: 14}, (_, i) => { const side = i % 2 ? 1 : -1, Z = 900 + i * 500; return {Z, X: side * (520 + rnd(i) * 200), i}; })
          .filter((p) => p.Z > c.z + 60).sort((a, b) => b.Z - a.Z).map((p) => <Billboard key={'tr' + p.i} c={c} X={p.X} Z={p.Z}><Tree c={['#4FA04A', '#5FB04E', '#3E8E3E'][p.i % 3]} sway={Math.sin(t * 1.4 + p.i) * 2.5} s={1.1} /></Billboard>)}
        <Billboard c={c} X={0} Z={1900}><Parliament /></Billboard>
        <Stand c={c} X={0} Z={1880} lift={980}><Banner w={620} text="PARLIAMENT" size={70} color="#2E6B4F" /></Stand>
        {MPS.map((o, i) => { const s = pop(t, K.parliament - 0.2 + i * 0.18, 0.4); const wave = t > K.working - 0.2 ? Math.sin(t * 10 + i) : 0;
          return s > 0 && <Stand key={i} c={c} X={-280 + i * 280} Z={1250} scale={s}><LongShadow angle={20} len={240} /><Person id={'mp' + i} t={t} outfit={o} eyes="dot" mouth={t > K.working - 0.2 ? 'grin' : 'smile'}
            handR={t > K.working - 0.2 ? [110, -380 + wave * 20] : [92, -120]} blink={bump(t, K.parliament + 0.8 + i * 0.3, K.parliament + 0.95 + i * 0.3)} /></Stand>; })}
        {Array.from({length: 4}, (_, i) => { const x = ((t * 70 + i * 260) % 1400) - 200, y = 300 + i * 40 + Math.sin(t * 2 + i) * 10;
          return <path key={'b' + i} d={`M ${x - 18} ${y} Q ${x - 9} ${y - 10 - Math.abs(Math.sin(t * 8 + i)) * 8} ${x} ${y} Q ${x + 9} ${y - 10 - Math.abs(Math.sin(t * 8 + i)) * 8} ${x + 18} ${y}`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />; })}
      </SVG>
      <SVG><Pill x={520} y={560} text="Rwanda: ~64% of MPs are women (2024)" size={30} s={Math.min(pop(t, K.working - 0.05, 0.35), popOut(t, W[4] - 0.3, 0.25))} /></SVG>
      <Foreground blur={7}><g transform={`translate(${1060 - u * 20} 1880)`}><Puff c={[[0, 0, 100], [-110, 30, 80]]} fill="#4F9A3E" ow={9} /></g></Foreground>
    </AbsoluteFill>
  );
};

// ================================================================= the freezer
const FreezerScene: React.FC<{t: number}> = ({t}) => {
  const dr = drift(t, END, 0.8), u = t - W[4];
  const c: PCam = {horizon: 860 + dr.dy * 0.6, h: 240, f: 900, x: dr.dx * 0.6, z: u * 70};
  const open = eout(prog(t, K.frozen - 0.15, K.frozen + 0.35));
  const mist = t > K.frozen ? Array.from({length: 10}, (_, i) => { const a = ((t - K.frozen) * 0.7 + i / 10) % 1;
    return <g key={i} transform={`translate(${(rnd(i) - 0.5) * 500} ${-60 - a * 160}) scale(${(0.6 + a) * Math.sin(a * Math.PI)})`}><Puff c={[[-30, 0, 34], [10, -14, 40], [40, 6, 28]]} fill="#F4FBFF" ow={6} /></g>; }) : null;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#CFE2F0 0%, #E6F0F7 44%)', transform: `rotate(${dr.rot}deg) scale(${dr.zoom})`}}>
      <SVG>
        <PerspGround c={c} ground="#B7CCDC" far="#DCE8F0" kind="none" />
        {Array.from({length: 30}, (_, i) => { const Z = Math.ceil((c.z + 45) / 300) * 300 + i * 300, a = proj(c, -900, Z)!, b = proj(c, 900, Z)!; return <path key={i} d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} stroke="#A9BFD0" strokeWidth={2} />; })}
        <Stand c={c} X={0} Z={1000} scale={0.6}><Freezer open={open} t={t} />{mist}</Stand>
        {Array.from({length: 8}, (_, i) => <Sparkle key={i} x={160 + rnd(i) * 760} y={300 + rnd(i + 3) * 700} r={16 * (0.5 + 0.5 * Math.sin(t * 5 + i * 2))} fill="#FFFFFF" />)}
      </SVG>
      <SVG><Pill x={520} y={560} text="frozen 20-40 years: still healthy babies" size={30} s={Math.min(pop(t, K.decades - 0.05, 0.35), popOut(t, W[5] - 0.3, 0.25))} /></SVG>
    </AbsoluteFill>
  );
};

// ================================================================= nursery at night
const Nursery: React.FC<{t: number}> = ({t}) => {
  const dr = drift(t, END, 0.8), u = t - W[5];
  const c: PCam = {horizon: 900 + dr.dy * 0.6, h: 240, f: 900, x: dr.dx * 0.6, z: u * 50};
  const month = Math.floor(11.99 * prog(t, K.year - 1.5, K.year + 0.1));
  return (
    <AbsoluteFill style={{background: '#33416B', transform: `rotate(${dr.rot}deg) scale(${dr.zoom})`}}>
      <SVG>
        <rect x={240} y={210} width={600} height={520} rx={20} fill="#0E1330" stroke={INK} strokeWidth={14} />
        <defs><clipPath id="win"><rect x={240} y={210} width={600} height={520} rx={20} /></clipPath></defs>
        <g clipPath="url(#win)">
          <rect x={240} y={210} width={600} height={520} fill="url(#nsky)" />
          <defs><linearGradient id="nsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0E1330" /><stop offset="1" stopColor="#3A4A80" /></linearGradient></defs>
          {Array.from({length: 30}, (_, i) => <circle key={i} cx={260 + rnd(i) * 560} cy={230 + rnd(i + 7) * 460} r={2 + rnd(i + 3) * 3} fill="#FFF7D6" opacity={0.5 + 0.5 * Math.sin(t * 3 + i)} />)}
          <g transform="translate(700 340) scale(0.6)"><KScale k={0.6}><Moon /></KScale></g>
          <Skyline base={735} color="#1A2142" seed={9} h={160} n={10} x0={240} w={600} lights={0.6} />
        </g>
        <path d="M 540 210 L 540 730 M 240 470 L 840 470" stroke={INK} strokeWidth={12} />
        <path d="M 200 190 Q 260 460 220 760 L 160 760 L 160 190 Z M 880 190 Q 820 460 860 760 L 920 760 L 920 190 Z" fill="#E8B4C8" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
        <PerspGround c={c} ground="#C9A27A" far="#B08A64" kind="none" />
        {Array.from({length: 14}, (_, i) => { const x = -700 + i * 110, a = proj(c, x, c.z + 45)!, b = proj(c, x, c.z + 8000)!; return <path key={i} d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} stroke="#A9825C" strokeWidth={3} />; })}
        <Stand c={c} X={400} Z={1100} lift={520}><Calendar month={month} /></Stand>
        {[-330, 0, 330].map((X, i) => { const s = pop(t, K.boys - 0.1 + i * 0.15, 0.4);
          return <Stand key={i} c={c} X={X * 0.78} Z={700} scale={0.82}><Crib>{s > 0 && <g transform={`translate(0 -60) scale(${s * 0.95})`}><Baby blink={bump(t, K.boys + 1.0 + i * 0.4, K.boys + 1.15 + i * 0.4)} smile={i !== 1} /></g>}</Crib></Stand>; })}
        <Stand c={c} X={0} Z={680} lift={560}><g transform={`rotate(${Math.sin(t * 1.5) * 6})`}><path d="M 0 -200 L 0 -60" stroke={INK} strokeWidth={6} />
          <path d="M -160 -60 L 160 -60" stroke={INK} strokeWidth={6} />{[-160, 0, 160].map((x) => <g key={x}><path d={`M ${x} -60 L ${x} 0`} stroke={INK} strokeWidth={4} /><Sparkle x={x} y={20} r={30} fill="#FFE14D" /></g>)}</g></Stand>
      </SVG>
    </AbsoluteFill>
  );
};

// ================================================================= composition
const SCENES = [(t: number) => <Street t={t} mode="open" />, (t: number) => <Street t={t} mode="two" />, (t: number) => <NYC t={t} />, (t: number) => <DuskRoad t={t} />,
  (t: number) => <Rwanda t={t} />, (t: number) => <FreezerScene t={t} />, (t: number) => <Nursery t={t} />, (t: number) => <Street t={t} mode="end" />];
export const Scene: React.FC<{t: number}> = ({t}) => {
  const DUR = 0.5;
  for (let i = 0; i < W.length; i++) if (Math.abs(t - W[i]) < DUR / 2) return <Whip t={t} at={W[i]} dur={DUR} dir={DIRS[i]} a={SCENES[i](t)} b={SCENES[i + 1](t)} />;
  let k = 0; for (let i = 0; i < W.length; i++) if (t >= W[i]) k = i + 1;
  return SCENES[k](t);
};
const Cta: React.FC<{t: number}> = ({t}) => {
  const t0 = K.subscribe - 0.12, click = K.whatifs - 0.05, out = END - 0.75;
  const s = Math.min(pop(t, t0, 0.4), popOut(t, out, 0.3));
  if (s <= 0.001) return null;
  const done = t >= click;
  const press = 1 - 0.1 * bump(t, click - 0.06, click + 0.1) + 0.07 * spring(t, click + 0.1, 3, 6);
  const bellA = t >= click + 0.25 ? spring(t, click + 0.25, 4, 3.5) * 28 : 0;
  const cu = eio(prog(t, t0 + 0.25, click - 0.05)), cl = ein(prog(t, click + 0.35, click + 0.8));
  const cx = lerp(900, 600, cu) + cl * 420, cy = lerp(760, 452, cu) + cl * 260, csc = 1 - 0.15 * bump(t, click - 0.06, click + 0.1);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, width: 1040, top: 360, display: 'flex', justifyContent: 'center', transform: `scale(${s * press})`, transformOrigin: '520px 70px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
          <div style={{background: done ? '#4A4A4A' : '#E52D27', color: 'white', fontFamily: 'Inter', fontWeight: 900, fontSize: 60, letterSpacing: 1,
            padding: '20px 42px', borderRadius: 26, border: '7px solid #111', boxShadow: '0 9px 0 #111'}}>{done ? 'SUBSCRIBED ✓' : 'SUBSCRIBE'}</div>
          <svg width={110} height={110} viewBox="-58 -58 116 116" style={{overflow: 'visible'}}>
            <circle r={52} fill="white" stroke="#111" strokeWidth={7} />
            <g transform={`rotate(${bellA}) translate(0 -2)`}><path d="M -24 16 C -24 -6 -22 -26 0 -28 C 22 -26 24 -6 24 16 L 30 22 L -30 22 Z" fill={done ? '#FFD23F' : '#DDD'} stroke="#111" strokeWidth={6} strokeLinejoin="round" />
              <circle cy={-31} r={5} fill="#111" /><circle cy={28} r={7} fill="#111" /></g>
          </svg>
        </div>
      </div>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const u = prog(t, click + 0.02, click + 0.55); if (u <= 0 || u >= 1) return null; const a = i * Math.PI / 4 + 0.3, r = 150 + eout(u) * 170;
        return <svg key={i} width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}><g transform={`translate(${520 + Math.cos(a) * r * 1.5} ${430 + Math.sin(a) * r * 0.6})`}>
          <path d="M 0 -24 Q 6 -6 24 0 Q 6 6 0 24 Q -6 6 -24 0 Q -6 -6 0 -24 Z" transform={`scale(${Math.sin(u * Math.PI)})`} fill="#FFE14D" stroke="#111" strokeWidth={5} strokeLinejoin="round" /></g></svg>; })}
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
  const cfg = {A: {t: K.big + 0.7, l1: 'THE ONLY MAN', l2: 'LEFT ON EARTH?'}, B: {t: K.impressed + 0.4, l1: "HE THINKS HE'S", l2: 'A BIG DEAL'}, C: {t: K.two + 0.3, l1: 'NEW YORK FIRE DEPT.', l2: 'ALMOST EMPTY?'}}[variant];
  return (
    <AbsoluteFill>
      <Scene t={cfg.t} />
      <AbsoluteFill style={{top: 220, height: 330, bottom: 'auto', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
        {[cfg.l1, cfg.l2].map((l, i) => <div key={i} style={{fontFamily: 'Inter', fontWeight: 900, fontSize: l.length > 15 ? 80 : l.length > 11 ? 96 : 118, lineHeight: 1.04, whiteSpace: 'nowrap',
          color: i ? '#FFE14D' : 'white', WebkitTextStroke: '28px #111', paintOrder: 'stroke fill', textAlign: 'center', width: 900,
          filter: 'drop-shadow(0 8px 0 rgba(0,0,0,0.35))', letterSpacing: -1}}>{l}</div>)}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
