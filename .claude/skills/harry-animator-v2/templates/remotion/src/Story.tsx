import React from 'react';
import {useK} from './Layer';
import {INK, mix} from './color';
/* v2 story props: the world tells the story with writing on things (signs, banners, newspapers, notes).
 * Text is drawn in world units so it lives in the scene and moves with the camera; keep it readable at the shot's scale
 * (at least ~34 px on screen) and only true statements (or clearly in-story lines). */
export const Sign: React.FC<{w: number; h: number; lines: string[]; board?: string; ink?: string; post?: boolean; size?: number; tilt?: number}> = ({w, h, lines, board = '#F3E3C3', ink = INK, post = true, size, tilt = 0}) => {
  const k = useK(); const ow = 8 / k; const fs = size ?? (h / (lines.length + 0.8));
  return (<g transform={`rotate(${tilt})`}>
    {post && <><rect x={-w * 0.32 - 9} y={-h * 0.2} width={18} height={h * 1.4} fill="#8B5A2B" stroke={INK} strokeWidth={ow} /><rect x={w * 0.32 - 9} y={-h * 0.2} width={18} height={h * 1.4} fill="#8B5A2B" stroke={INK} strokeWidth={ow} /></>}
    <rect x={-w / 2} y={-h} width={w} height={h} rx={10} fill={board} stroke={INK} strokeWidth={ow} />
    <rect x={-w / 2 + 10} y={-h + 10} width={w - 20} height={h - 20} rx={6} fill="none" stroke={mix(board, '#000000', 0.25)} strokeWidth={ow * 0.5} />
    {lines.map((l, i) => <text key={i} x={0} y={-h + fs * 0.4 + (i + 0.85) * fs * 1.05} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={fs * 0.82} fill={ink}>{l}</text>)}
  </g>);
};
export const Banner: React.FC<{w: number; text: string; color?: string; ink?: string; size?: number}> = ({w, text, color = '#D9534F', ink = 'white', size = 54}) => {
  const k = useK(); const ow = 8 / k; const h = size * 1.6;
  return (<g>
    <path d={`M ${-w / 2 - 50} ${h * 0.25} L ${-w / 2} ${h * 0.25} L ${-w / 2} ${h * 1.05} L ${-w / 2 - 50} ${h * 1.05} L ${-w / 2 - 28} ${h * 0.65} Z`} fill={mix(color, '#000000', 0.25)} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
    <path d={`M ${w / 2 + 50} ${h * 0.25} L ${w / 2} ${h * 0.25} L ${w / 2} ${h * 1.05} L ${w / 2 + 50} ${h * 1.05} L ${w / 2 + 28} ${h * 0.65} Z`} fill={mix(color, '#000000', 0.25)} stroke={INK} strokeWidth={ow} strokeLinejoin="round" />
    <rect x={-w / 2} y={0} width={w} height={h} fill={color} stroke={INK} strokeWidth={ow} />
    <text x={0} y={h * 0.68} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={size} fill={ink}>{text}</text>
  </g>);
};
/** newspaper held up or lying down: masthead, big headline (1-2 lines), a doodle box and fake text lines */
export const Newspaper: React.FC<{name: string; headline: string[]; w?: number; doodle?: React.ReactNode}> = ({name, headline, w = 360, doodle}) => {
  const k = useK(); const ow = 7 / k; const h = w * 1.3;
  return (<g>
    <rect x={-w / 2} y={-h} width={w} height={h} fill="#F4EEDC" stroke={INK} strokeWidth={ow} />
    <text x={0} y={-h + w * 0.12} textAnchor="middle" fontFamily="Georgia, serif" fontSize={w * 0.075} fill={INK}>{name}</text>
    <path d={`M ${-w * 0.44} ${-h + w * 0.16} L ${w * 0.44} ${-h + w * 0.16}`} stroke={INK} strokeWidth={ow * 0.6} />
    {headline.map((l, i) => <text key={i} x={0} y={-h + w * (0.29 + i * 0.12)} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={700} fontSize={w * 0.105} fill={INK}>{l}</text>)}
    <rect x={-w * 0.4} y={-h + w * (0.36 + headline.length * 0.12)} width={w * 0.8} height={w * 0.42} fill="white" stroke={INK} strokeWidth={ow * 0.6} />
    <g transform={`translate(0 ${-h + w * (0.57 + headline.length * 0.12)})`}>{doodle}</g>
    {Array.from({length: 4}, (_, i) => <path key={i} d={`M ${-w * 0.4} ${-w * 0.12 - i * w * 0.05} L ${w * 0.4} ${-w * 0.12 - i * w * 0.05}`} stroke="#9A9384" strokeWidth={ow * 0.6} />)}
  </g>);
};
/** sticky note / paper tag with a short handwritten-style line */
export const Note: React.FC<{text: string; w?: number; color?: string; tilt?: number}> = ({text, w = 220, color = '#FFE98A', tilt = -4}) => {
  const k = useK(); const ow = 6 / k;
  return (<g transform={`rotate(${tilt})`}><rect x={-w / 2} y={-w * 0.45} width={w} height={w * 0.9} fill={color} stroke={INK} strokeWidth={ow} />
    <text x={0} y={w * 0.05} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={w * 0.16} fill={INK}>{text}</text></g>);
};
