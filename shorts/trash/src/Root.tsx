import React from 'react';
import {AbsoluteFill, Composition} from 'remotion';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';
import {Short, Thumb, DURATION} from './Short';
// Design space is always 1080x1920. Short2K draws the same scene at 4/3 -> 1440x2560 (an even size; --scale 1.333 gives 1439.99 px and fails).
const Short2K: React.FC<{voice?: boolean; captions?: boolean}> = (p) => (
  <AbsoluteFill style={{background: '#000'}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transform: 'scale(1.3333333333)', transformOrigin: '0 0'}}><Short {...p} /></div>
  </AbsoluteFill>);
export const Root: React.FC = () => (<>
  <Composition id="Short" component={Short} durationInFrames={Math.round(DURATION * 60)} fps={60} width={1080} height={1920} defaultProps={{voice: false, captions: true}} />
  <Composition id="Short2K" component={Short2K} durationInFrames={Math.round(DURATION * 60)} fps={60} width={1440} height={2560} defaultProps={{voice: true, captions: true}} />
  <Composition id="Thumb" component={Thumb} durationInFrames={1} fps={60} width={1080} height={1920} defaultProps={{variant: 'C' as const}} />
</>);
