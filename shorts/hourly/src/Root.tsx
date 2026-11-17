import React from 'react';
import {AbsoluteFill, Composition} from 'remotion';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';
import {Short, Thumb, DURATION} from './Short';
import {FPS} from './fps';
// Delivery: the 'Short' composition itself = 1080x1920 Full HD, 30 fps (owner's format; no 2K composition in this Short).
export const Root: React.FC = () => (<>
  <Composition id="Short" component={Short} durationInFrames={Math.round(DURATION * FPS)} fps={FPS} width={1080} height={1920} defaultProps={{voice: false, captions: true, guides: false}} />
  <Composition id="Thumb" component={Thumb} durationInFrames={1} fps={FPS} width={1080} height={1920} defaultProps={{variant: 'C' as const}} />
</>);
