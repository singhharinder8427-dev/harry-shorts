import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Captions} from './Captions';
import {Town} from './Town';
import {Plant} from './Plant';
import {bump, ein, eio, eout, lerp, pop, popOut, prog, spring} from './math';
import {CUT1, CUT3, DURATION, END, K, T} from './shared';
export {DURATION};

// ---------------------------------------------------------------- subscribe call to action
const Cta: React.FC<{t: number}> = ({t}) => {
  const t0 = K.subscribe - 0.12, click = K.everyday + 0.05, out = END - 0.75;
  const sIn = pop(t, t0, 0.4), sOut = popOut(t, out, 0.3); const s = Math.min(sIn, sOut);
  if (s <= 0.001) return null;
  const done = t >= click;
  const press = 1 - 0.1 * bump(t, click - 0.06, click + 0.1) + 0.07 * spring(t, click + 0.1, 3, 6);
  const bellA = t >= K.work - 0.05 ? spring(t, K.work - 0.05, 4, 3.5) * 28 : 0;
  // cursor: flies in from lower right, lands on the button at the click, then leaves
  const cu = eio(prog(t, t0 + 0.25, click - 0.05)), cl = ein(prog(t, click + 0.35, click + 0.8));
  const cx = lerp(980, 640, cu) + cl * 420, cy = lerp(760, 452, cu) + cl * 260;
  const csc = 1 - 0.15 * bump(t, click - 0.06, click + 0.1);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 360, display: 'flex', justifyContent: 'center', transform: `scale(${s * press})`, transformOrigin: '540px 70px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
          <div style={{background: done ? '#4A4A4A' : '#E52D27', color: 'white', fontFamily: 'Inter', fontWeight: 900, fontSize: 64, letterSpacing: 1,
            padding: '22px 46px', borderRadius: 26, border: '7px solid #111', boxShadow: '0 9px 0 #111'}}>{done ? 'SUBSCRIBED ✓' : 'SUBSCRIBE'}</div>
          <svg width={116} height={116} viewBox="-58 -58 116 116" style={{overflow: 'visible'}}>
            <circle r={52} fill="white" stroke="#111" strokeWidth={7} />
            <g transform={`rotate(${bellA}) translate(0 -2)`}>
              <path d="M -24 16 C -24 -6 -22 -26 0 -28 C 22 -26 24 -6 24 16 L 30 22 L -30 22 Z" fill={done ? '#FFD23F' : '#DDD'} stroke="#111" strokeWidth={6} strokeLinejoin="round" />
              <circle cy={-31} r={5} fill="#111" /><circle cy={28} r={7} fill="#111" />
            </g>
            {bellA !== 0 && [-1, 1].map((d) => <path key={d} d={`M ${d * 40} -20 q ${d * 8} 14 0 28`} stroke="#111" strokeWidth={5} fill="none" strokeLinecap="round" opacity={Math.min(1, Math.abs(bellA) / 10)} />)}
          </svg>
        </div>
      </div>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const u = prog(t, click + 0.02, click + 0.55); if (u <= 0 || u >= 1) return null;
        const a = i * Math.PI / 4 + 0.3, r = 150 + eout(u) * 190;
        return <svg key={i} width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}><g transform={`translate(${540 + Math.cos(a) * r * 1.6} ${430 + Math.sin(a) * r * 0.6})`}>
          <path d={`M 0 -24 Q 6 -6 24 0 Q 6 6 0 24 Q -6 6 -24 0 Q -6 -6 0 -24 Z`} transform={`scale(${Math.sin(u * Math.PI)})`} fill="#FFE14D" stroke="#111" strokeWidth={5} strokeLinejoin="round" /></g></svg>;
      })}
      {t > t0 + 0.2 && cl < 1 && <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <g transform={`translate(${cx} ${cy}) scale(${csc * 1.5})`}>
          <path d="M 0 0 L 0 46 L 12 35 L 21 55 L 30 51 L 21 32 L 37 32 Z" fill="white" stroke="#111" strokeWidth={4.5} strokeLinejoin="round" />
        </g></svg>}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- composition
export const Scene: React.FC<{t: number}> = ({t}) => (t < CUT1 || t >= CUT3) ? <Town t={t} /> : <Plant t={t} />;
export const Short: React.FC<{voice?: boolean; captions?: boolean}> = ({voice = false, captions = true}) => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps;
  return (
    <AbsoluteFill style={{background: '#7CC8FF'}}>
      <Scene t={t} />
      <Cta t={t} />
      {captions && <Captions t={t} />}
      <Audio src={staticFile(`${T.short}/sfx.wav`)} volume={0.42} />
      {voice && <Sequence from={Math.round(Math.max(0, T.voiceOffset) * fps)} layout="none"><Audio src={staticFile(`${T.short}/vo.wav`)} /></Sequence>}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- thumbnails
export const Thumb: React.FC<{variant: 'A' | 'B' | 'C'}> = ({variant}) => {
  const cfg = {
    A: {t: K.burn + 1.0, plant: false, l1: 'WHERE DOES', l2: 'YOUR TRASH GO?', tag: ''},
    B: {t: K.stinking + 0.6, plant: false, l1: "IT DOESN'T", l2: 'VANISH', tag: ''},
    C: {t: K.homes - 0.1, plant: true, l1: 'BURNING TRASH', l2: '= POWER + HEAT?', tag: 'simplified, not to scale'},
  }[variant];
  return (
    <AbsoluteFill>
      {cfg.plant ? <Plant t={cfg.t} noTag /> : <AbsoluteFill style={{transform: 'scale(1.4)', transformOrigin: '250px 1330px'}}><Town t={cfg.t} /></AbsoluteFill>}
      <AbsoluteFill style={{top: 250, height: 330, bottom: 'auto', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
        {[cfg.l1, cfg.l2].map((l, i) => <div key={i} style={{fontFamily: 'Inter', fontWeight: 900, fontSize: l.length > 12 ? 92 : 118, lineHeight: 1.04, whiteSpace: 'nowrap',
          color: i ? '#FFE14D' : 'white', WebkitTextStroke: '28px #111', paintOrder: 'stroke fill', textAlign: 'center', width: 900,
          filter: 'drop-shadow(0 8px 0 rgba(0,0,0,0.35))', letterSpacing: -1}}>{l}</div>)}
      </AbsoluteFill>
      {cfg.tag && <AbsoluteFill style={{top: 1560, height: 70, bottom: 'auto', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontFamily: 'Inter', fontWeight: 800, fontSize: 36, color: 'white', background: 'rgba(17,17,17,0.75)', padding: '8px 24px', borderRadius: 40}}>{cfg.tag}</div>
      </AbsoluteFill>}
    </AbsoluteFill>
  );
};
