import React from 'react';
import {AbsoluteFill, Composition} from 'remotion';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';
import {Water, Thumb, DURATION} from './Water';
const Water2K: React.FC<{voice?: boolean; captions?: boolean}> = (p) => (
  <AbsoluteFill style={{background: '#14244F'}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transform: 'scale(1.3333333333)', transformOrigin: '0 0'}}><Water {...p} /></div>
  </AbsoluteFill>);
export const Root: React.FC = () => (<>
  <Composition id="Water" component={Water} durationInFrames={Math.round(DURATION * 60)} fps={60} width={1080} height={1920} defaultProps={{voice: false, captions: true}} />
  <Composition id="Water2K" component={Water2K} durationInFrames={Math.round(DURATION * 60)} fps={60} width={1440} height={2560} defaultProps={{voice: true, captions: true}} />
  <Composition id="Thumb" component={Thumb} durationInFrames={1} fps={60} width={1080} height={1920} defaultProps={{variant: 'C' as const}} />
</>);
