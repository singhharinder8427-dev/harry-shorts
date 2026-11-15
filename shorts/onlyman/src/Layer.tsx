import React, {createContext, useContext} from 'react';
import {AbsoluteFill} from 'remotion';
import type {Cam} from './math';
const KCtx = createContext(1);
export const useK = () => useContext(KCtx);
/** set the outline scale for children drawn inside a scale(k) transform outside a Layer (billboards, screen-space scenes) */
export const KScale: React.FC<{k: number; children?: React.ReactNode}> = ({k, children}) => <KCtx.Provider value={k}>{children}</KCtx.Provider>;
/** One flat layer at depth z, seen by the multiplane camera. Stroke widths: write px / useK() for constant screen weight. */
export const Layer: React.FC<{cam: Cam; z: number; blur?: number; minDepth?: number; children?: React.ReactNode}> = ({cam, z, blur = 0, minDepth = 300, children}) => {
  const d = z - cam.z;
  if (d < minDepth) return null;
  const k = 1000 / d;
  return (
    <AbsoluteFill style={{filter: blur ? `blur(${blur}px)` : undefined}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', overflow: 'visible'}}>
        <g transform={`translate(540 960) scale(${k}) translate(${-cam.x} ${-cam.y})`}>
          <KCtx.Provider value={k}>{children}</KCtx.Provider>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
