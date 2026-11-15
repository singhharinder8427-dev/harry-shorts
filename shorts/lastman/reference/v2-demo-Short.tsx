/* v2 demo: every new helper in one 8-second composition (fake-3D perspective ground with a forward dolly, haze,
 * sun glow, long shadows, always-moving camera drift, a costumed cast with colour-emotion gags, story props,
 * a whip transition with speed lines, one-word safe-area captions, Shorts UI guides). Copy patterns, not the content. */
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Captions, SafeGuides} from './Captions';
import {Person} from './Cast';
import {Banner, Newspaper, Sign} from './Story';
import {Billboard, Foreground, HazeDefs, LongShadow, PCam, PerspGround, SunGlow, Whip, drift, proj} from './Depth';
import {Puff} from './Bits';
import {INK} from './color';
import {kfs, pick, pop, rnd} from './math';
export const DURATION = 8;
const SKY = '#BFE3FF';
const Tree: React.FC = () => (<g><rect x={-14} y={-160} width={28} height={160} fill="#8B5A2B" stroke={INK} strokeWidth={8} />
  <Puff c={[[-50, -190, 60], [45, -200, 58], [0, -250, 70]]} fill="#6DB85A" ow={8} /></g>);
const House: React.FC<{c: string}> = ({c}) => (<g><rect x={-120} y={-200} width={240} height={200} fill={c} stroke={INK} strokeWidth={9} />
  <path d="M -145 -196 L 0 -320 L 145 -196 Z" fill="#D9534F" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
  <rect x={-80} y={-150} width={50} height={50} fill="#7FA6C9" stroke={INK} strokeWidth={7} /><rect x={30} y={-150} width={50} height={50} fill="#7FA6C9" stroke={INK} strokeWidth={7} /></g>);

const RoadScene: React.FC<{t: number}> = ({t}) => {
  const dr = drift(t, DURATION, 1.2);
  const c: PCam = {horizon: 760 + dr.dy, h: 260, f: 900, x: dr.dx * 0.6, z: t * 380};          // dolly forward at 380 u/s
  const angry = kfs(t, [[1.6, 0], [2.0, 1]]);
  const props = Array.from({length: 18}, (_, i) => ({X: (i % 2 ? 1 : -1) * (520 + rnd(i) * 300), Z: 600 + i * 520, kind: i % 3}));
  const guyZ = c.z + 760, me = proj(c, 0, guyZ)!;
  return (<AbsoluteFill style={{background: `linear-gradient(#7CC8FF 0%, ${SKY} 40%)`, transform: `rotate(${dr.rot}deg) scale(${dr.zoom})`}}>
    <SunGlow x={820} y={420} r={70} t={t} />
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <HazeDefs sky={SKY} />
      <PerspGround c={c} ground="#D9A26A" far="#E9CFA8" kind="road" w={240} />
      {props.filter((p) => p.Z > c.z + 60).sort((a, b) => b.Z - a.Z).map((p, i) => (
        <Billboard key={i} c={c} X={p.X} Z={p.Z}>{p.kind === 0 ? <House c={['#F3E3C3', '#CFE3F2', '#F6C9A8'][i % 3]} /> : <Tree />}</Billboard>))}
      <g transform={`translate(${me.x} ${me.y}) scale(${me.s * 1.9})`}>
        <LongShadow angle={160} len={300} />
        <Person id="worker" t={t} outfit={{shirt: '#F4F1EA', vest: '#2FA58C', hat: 'cap', hatColor: '#3D5A99', hair: '#7A4A2A', bandana: '#D9534F'}}
          eyes={angry > 0.5 ? 'dot' : pick(t, [[0, 'dot'], [1.0, 'ring']])} mouth={angry > 0.5 ? 'teeth' : 'smile'} brow={angry * 1.2}
          tint="red" tintAmt={angry} steam={angry} handR={[110, -260]} blink={t > 0.8 && t < 0.95 ? 1 : 0} />
      </g>
    </svg>
    <Foreground blur={6}>{(() => { const x = 1300 - ((t * 900) % 2200); return <rect x={x} y={-100} width={70} height={2200} fill="#6B4A2E" stroke={INK} strokeWidth={10} />; })()}</Foreground>
  </AbsoluteFill>);
};
const RailScene: React.FC<{t: number}> = ({t}) => {
  const dr = drift(t, DURATION, 1.0);
  const c: PCam = {horizon: 820 + dr.dy, h: 180, f: 1000, x: 60 + dr.dx * 0.6, z: (t - 4) * 160};
  const sign = proj(c, 520, c.z + 1500)!, boss = proj(c, -170, c.z + 1150)!;
  return (<AbsoluteFill style={{background: 'linear-gradient(#FFB36B 0%, #FFD9A8 45%)', transform: `rotate(${dr.rot}deg) scale(${dr.zoom})`}}>
    <SunGlow x={260} y={600} r={80} color="#FFE7B0" t={t} />
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <HazeDefs sky="#FFD9A8" />
      <PerspGround c={c} ground="#B9744A" far="#E8B48A" kind="rails" w={110} period={160} />
      <g transform={`translate(${sign.x} ${sign.y}) scale(${sign.s * 1.5})`}><Sign w={420} h={200} lines={['FIRST TO', 'FINISH WINS']} /></g>
      <g transform={`translate(${boss.x} ${boss.y}) scale(${boss.s * 1.6})`}>
        <Person id="boss" t={t} outfit={{shirt: '#F4F1EA', vest: '#D9A63A', hat: 'bowler', hatColor: '#2E2E33', hair: '#B9B9B9', mustache: true, buttons: true}}
          eyes="smug" mouth="smirk" brow={0.6} handL={[-60, -300]} handR={[60, -300]} />
        <g transform={`translate(0 -150) scale(${pop(t, 4.4, 0.35)})`}><Newspaper name="The Daily Gazette" headline={['RAILS DONE', 'EARLY!']} w={200} /></g>
      </g>
      <g transform="translate(540 300)"><Banner w={560} text="GRAND OPENING" size={50} /></g>
    </svg>
  </AbsoluteFill>);
};
export const Short: React.FC<{voice?: boolean; captions?: boolean; guides?: boolean}> = ({captions = true, guides = false}) => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps;
  return (<AbsoluteFill style={{background: '#000'}}>
    <Whip t={t} at={4} dur={0.55} dir="left" a={<RoadScene t={t} />} b={<RailScene t={t} />} />
    {captions && <Captions t={t} />}
    {guides && <SafeGuides />}
  </AbsoluteFill>);
};
export const Thumb: React.FC<{variant: 'A' | 'B' | 'C'}> = () => <RoadScene t={2.5} />;
