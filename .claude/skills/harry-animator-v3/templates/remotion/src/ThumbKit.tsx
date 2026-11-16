import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ThumbText} from './Cta';
/* Thumbnail kit (see SKILL.md section 12 and examples/thumbnails/reference-feed.jpg).
 * A thumbnail is a re-staged frame of the video: same cast, same 3D set, but ONE huge expressive face, a punchier
 * camera, saturated colour, at most 2-3 words and (optionally) one red circle + arrow on the mystery object. */
export const POP = 'saturate(1.45) contrast(1.12) brightness(1.04)';      // colour boost applied to the scene only (not the text)
/** flat red arrow from (x1,y1) to (x2,y2), design-space px. Put it inside <World> children (its SVG layer) or in <ThumbOverlay>. */
export const Arrow: React.FC<{x1: number; y1: number; x2: number; y2: number}> = ({x1, y1, x2, y2}) => {
  const a = Math.atan2(y2 - y1, x2 - x1), L = Math.hypot(x2 - x1, y2 - y1);
  const d = `M 0 -22 L ${L - 90} -22 L ${L - 90} -62 L ${L} 0 L ${L - 90} 62 L ${L - 90} 22 L 0 22 Z`;
  return <g transform={`translate(${x1} ${y1}) rotate(${a * 180 / Math.PI})`}><path d={d} fill="#FF2A2A" stroke="#111" strokeWidth={12} strokeLinejoin="round" /></g>;
};
/** red ring around the thing the viewer must look at (place it with toScreen(cam, worldPoint) so it follows the camera) */
export const Ring: React.FC<{x: number; y: number; r: number}> = ({x, y, r}) =>
  <g><circle cx={x} cy={y} r={r} fill="none" stroke="#111" strokeWidth={30} /><circle cx={x} cy={y} r={r} fill="none" stroke="#FF2A2A" strokeWidth={16} /></g>;
export const ThumbOverlay: React.FC<{children: React.ReactNode}> = ({children}) =>
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>{children}</svg>;
/** frame = colour-boosted scene + optional overlay + the two-line text */
export const ThumbFrame: React.FC<{scene: React.ReactNode; l1: string; l2: string; top?: number; overlay?: React.ReactNode}> = ({scene, l1, l2, top = 190, overlay}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <AbsoluteFill style={{filter: POP}}>{scene}</AbsoluteFill>
    {overlay ? <ThumbOverlay>{overlay}</ThumbOverlay> : null}
    <ThumbText l1={l1} l2={l2} top={top} />
  </AbsoluteFill>);
