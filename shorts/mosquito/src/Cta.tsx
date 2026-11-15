import React from 'react';
import {AbsoluteFill} from 'remotion';
import {bump, ein, eio, eout, lerp, pop, popOut, prog, spring} from './math';
/** Subscribe call to action (screen overlay, not part of the world): a generic red SUBSCRIBE button + bell pops in at
 *  tIn, a cursor flies in and clicks at tClick (button squashes, flips to grey SUBSCRIBED, sparkles), the bell rings at
 *  tBell, everything pops away at tOut (at least 0.75 s before the end so the last frame equals frame 0).
 *  Keep it inside y 300-700, x 140-900. Sounds: pop at tIn, click + chime at tClick, bell dings at tBell. */
export const Cta: React.FC<{t: number; tIn: number; tClick: number; tBell: number; tOut: number; y?: number}> = ({t, tIn, tClick, tBell, tOut, y = 360}) => {
  const s = Math.min(pop(t, tIn, 0.4), popOut(t, tOut, 0.3)); if (s <= 0.001) return null;
  const done = t >= tClick;
  const press = 1 - 0.1 * bump(t, tClick - 0.06, tClick + 0.1) + 0.07 * spring(t, tClick + 0.1, 3, 6);
  const bellA = t >= tBell ? spring(t, tBell, 4, 3.5) * 28 : 0;
  const cu = eio(prog(t, tIn + 0.25, tClick - 0.05)), cl = ein(prog(t, tClick + 0.35, tClick + 0.8));
  const cx = lerp(980, 640, cu) + cl * 420, cy = lerp(y + 400, y + 92, cu) + cl * 260, csc = 1 - 0.15 * bump(t, tClick - 0.06, tClick + 0.1);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', transform: `scale(${s * press})`, transformOrigin: '540px 70px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
          <div style={{background: done ? '#4A4A4A' : '#E52D27', color: 'white', fontFamily: 'Inter', fontWeight: 900, fontSize: 64, letterSpacing: 1,
            padding: '22px 46px', borderRadius: 26, border: '7px solid #111', boxShadow: '0 9px 0 #111'}}>{done ? 'SUBSCRIBED ✓' : 'SUBSCRIBE'}</div>
          <svg width={116} height={116} viewBox="-58 -58 116 116" style={{overflow: 'visible'}}>
            <circle r={52} fill="white" stroke="#111" strokeWidth={7} />
            <g transform={`rotate(${bellA}) translate(0 -2)`}>
              <path d="M -24 16 C -24 -6 -22 -26 0 -28 C 22 -26 24 -6 24 16 L 30 22 L -30 22 Z" fill={done ? '#FFD23F' : '#DDD'} stroke="#111" strokeWidth={6} strokeLinejoin="round" />
              <circle cy={-31} r={5} fill="#111" /><circle cy={28} r={7} fill="#111" />
            </g>
          </svg>
        </div>
      </div>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const u = prog(t, tClick + 0.02, tClick + 0.55); if (u <= 0 || u >= 1) return null;
        const a = i * Math.PI / 4 + 0.3, r = 150 + eout(u) * 190;
        return <svg key={i} width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}><g transform={`translate(${540 + Math.cos(a) * r * 1.6} ${y + 70 + Math.sin(a) * r * 0.6})`}>
          <path d="M 0 -24 Q 6 -6 24 0 Q 6 6 0 24 Q -6 6 -24 0 Q -6 -6 0 -24 Z" transform={`scale(${Math.sin(u * Math.PI)})`} fill="#FFE14D" stroke="#111" strokeWidth={5} strokeLinejoin="round" /></g></svg>;
      })}
      {t > tIn + 0.2 && cl < 1 && <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <g transform={`translate(${cx} ${cy}) scale(${csc * 1.5})`}><path d="M 0 0 L 0 46 L 12 35 L 21 55 L 30 51 L 21 32 L 37 32 Z" fill="white" stroke="#111" strokeWidth={4.5} strokeLinejoin="round" /></g></svg>}
    </AbsoluteFill>
  );
};
/** thumbnail text: at most five words over two lines (white line + yellow line), inside the safe zone, never over a face */
export const ThumbText: React.FC<{l1: string; l2: string; top?: number}> = ({l1, l2, top = 250}) => (
  <AbsoluteFill style={{top, height: 330, bottom: 'auto', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
    {[l1, l2].map((l, i) => <div key={i} style={{fontFamily: 'Inter', fontWeight: 900, fontSize: l.length > 12 ? 92 : 118, lineHeight: 1.04, whiteSpace: 'nowrap',
      color: i ? '#FFE14D' : 'white', WebkitTextStroke: '28px #111', paintOrder: 'stroke fill', textAlign: 'center', width: 900,
      filter: 'drop-shadow(0 8px 0 rgba(0,0,0,0.35))', letterSpacing: -1}}>{l}</div>)}
  </AbsoluteFill>);
/** small honesty tag at the top ("not to scale" / "drawn to scale"); the only floating text allowed in a scene */
export const Tag: React.FC<{text: string; show: number}> = ({text, show}) => show <= 0 ? null : (
  <AbsoluteFill style={{top: 236, height: 70, bottom: 'auto', alignItems: 'center', justifyContent: 'center', opacity: Math.min(1, show)}}>
    <div style={{fontFamily: 'Inter', fontWeight: 800, fontSize: 34, color: 'white', background: 'rgba(17,17,17,0.75)', padding: '8px 24px', borderRadius: 40}}>{text}</div>
  </AbsoluteFill>);
