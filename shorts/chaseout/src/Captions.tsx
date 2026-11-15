import React from 'react';
import {AbsoluteFill} from 'remotion';
import timing from './timing.json';
const T = timing as any;
/* v2 captions: ONE WORD at a time, inside the strict Shorts safe area.
 * Safe box for the caption (design space 1080x1920): x 140..900, y 1150..1330. Nothing may go lower:
 * the Shorts title / channel / description sit at y > ~1400 and the action buttons at x > ~930.
 * Key words (story.json "keys") are yellow; everything else white with a 12 px black stroke. */
export const CAP = {cx: 520, cy: 1240, maxW: 760, size: 76, minSize: 46};
export const Captions: React.FC<{t: number}> = ({t}) => {
  const W = T.words as {w: string; start: number; end: number}[];
  const keyStarts = new Set(Object.values(T.keys as Record<string, number>).map((v) => v.toFixed(3)));
  let i = -1;
  for (let j = 0; j < W.length; j++) {
    const nxt = W[j + 1]; const until = nxt ? Math.min(nxt.start - 0.02, W[j].end + 0.45) : W[j].end + 0.6;
    if (t >= W[j].start - 0.03 && t < until) i = j;
  }
  if (i < 0) return null;
  const w = W[i], word = w.w;
  const age = t - (w.start - 0.03);
  const s = age < 0.06 ? 0.78 + age * 5 : age < 0.12 ? 1.08 - (age - 0.06) * 1.33 : 1;   // quick pop
  const size = Math.max(CAP.minSize, Math.min(CAP.size, CAP.maxW / (word.length * 0.62)));
  const key = keyStarts.has(w.start.toFixed(3));
  return (
    <AbsoluteFill style={{left: CAP.cx - CAP.maxW / 2, width: CAP.maxW, top: CAP.cy - 90, height: 180, justifyContent: 'center', alignItems: 'center'}}>
      <div style={{fontFamily: 'Inter', fontWeight: 900, fontSize: size, lineHeight: 1, whiteSpace: 'nowrap', color: key ? '#FFE14D' : 'white',
        WebkitTextStroke: '12px #111', paintOrder: 'stroke fill', transform: `scale(${s})`, letterSpacing: -0.5,
        filter: 'drop-shadow(0 5px 0 rgba(0,0,0,0.35))'}}>{word}</div>
    </AbsoluteFill>
  );
};
/** debug overlay of the Shorts UI (render stills with PROPS='{"guides":true}'): red = covered by the app, green = caption box */
export const SafeGuides: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <svg width={1080} height={1920}>
      <rect x={0} y={0} width={1080} height={200} fill="rgba(255,0,0,0.25)" />
      <rect x={0} y={1400} width={1080} height={520} fill="rgba(255,0,0,0.25)" />
      <rect x={930} y={860} width={150} height={540} fill="rgba(255,0,0,0.25)" />
      <rect x={140} y={1150} width={760} height={180} fill="none" stroke="#00D26A" strokeWidth={5} strokeDasharray="16 10" />
      <text x={24} y={1450} fontFamily="Inter" fontWeight={800} fontSize={30} fill="white">Shorts title / channel / description</text>
    </svg>
  </AbsoluteFill>);
