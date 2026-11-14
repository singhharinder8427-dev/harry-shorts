import React from 'react';
import {AbsoluteFill} from 'remotion';
import timing from './timing.json';
const T = timing as any;
export const Captions: React.FC<{t: number}> = ({t}) => {
  const ch = T.chunks as {text: string; w0: number; w1: number; start: number; end: number}[];
  let idx = -1;
  for (let i = 0; i < ch.length; i++) {
    const next = ch[i + 1];
    const until = next ? Math.min(next.start - 0.04, ch[i].end + 0.6) : ch[i].end + 0.6;
    if (t >= ch[i].start - 0.06 && t < until) idx = i;
  }
  if (idx < 0) return null;
  const c = ch[idx];
  const words = T.words.slice(c.w0, c.w1 + 1);
  const age = t - (c.start - 0.06);
  const s = age < 0.1 ? 0.88 + 1.2 * age : 1;
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', top: 1385, height: 230, bottom: 'auto'}}>
      <div style={{fontFamily: 'Inter', fontWeight: 900, fontSize: 78, lineHeight: 1.08, textAlign: 'center', width: 940,
        color: 'white', WebkitTextStroke: '15px #111', paintOrder: 'stroke fill', transform: `scale(${s})`, letterSpacing: -0.5}}>
        {words.map((w: any, i: number) => (
          <span key={i} style={{color: t >= w.start - 0.03 && t < (words[i + 1]?.start ?? 999) ? '#FFE14D' : 'white'}}>{w.w}{i < words.length - 1 ? ' ' : ''}</span>
        ))}
      </div>
    </AbsoluteFill>
  );
};
