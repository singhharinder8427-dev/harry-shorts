/* Fast-move accents + pop-up cards demo (5 s, a MoveTest composition: <Composition id="MoveTest" component={MoveTest} durationInFrames={300} fps={60} width={1080} height={1920} />).
 * 0.8 s slam zoom into the face (EASE.slam + ShotBlur) -> post card -> 1.7 s camera dives into the box (EASE.dive) ->
 * 2.0 s fly-through Transition into a room -> counting BigNumber -> Headline -> 3.6 s smear Transition back outside.
 * fx={false} renders the same shots without the effects (used for the render-speed comparison). Copy patterns, not content. */
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Person} from './Cast';
import {Box, Cam3Key, Cel, Ground, Light, World, cam3At, tex} from './World3D';
import {EASE, ShotBlur, Transition} from './Moves';
import {BigNumber, Headline, PostCard, cardIn} from './Cards';
const BLOB = {shirt: '#1FA6A0', hair: '#151515', hairStyle: 'short' as const};
const NIGHT: Light = {sun: [-3, 6, 4], sunColor: '#C9D4FF', sunI: 1.6, sky: '#6A5ACD', bounce: '#3A2F5E', ambI: 1.1, fog: ['#2A2350', 18, 70], focus: [0, 0, 0], span: 10};
const City: React.FC = () => (<>
  <Ground color="#4B3F7A" map={tex('tiles', [30, 30])} />
  {[-6, -3.5, 3.5, 6, -8, 8].map((x, i) => <group key={i}><Box pos={[x, 0, -6 - (i % 3) * 3]} size={[2, 5 + (i % 3) * 3, 2]} color="#2E2A5A" />
    {[1, 2, 3, 4].map((j) => <Box key={j} pos={[x, j * 1.4, -4.98 - (i % 3) * 3]} size={[1.6, 0.12, 0.05]} color="#000" emissive={j % 2 ? '#FF4FD8' : '#38E1FF'} glow={2} cast={false} />)}</group>)}
  <Box pos={[0, 0, -3]} size={[1.4, 1.2, 1.4]} color="#FFC83D" map={tex('panels', [1, 1])} />
</>);
const Room: React.FC = () => (<>
  <Ground color="#E8D9B8" map={tex('planks', [12, 12])} />
  <Box pos={[0, 0, -4]} size={[12, 5, 0.3]} color="#6FA8DC" map={tex('speckle', [4, 2])} />
  <Box pos={[1.5, 0, -2.5]} size={[1.6, 0.9, 0.9]} color="#8B5A2B" map={tex('planks', [2, 1])} />
</>);
const KA: Cam3Key[] = [[0, {pos: [0, 2.2, 9], look: [0, 1.2, 0], fov: 38}], [0.8, {pos: [0.2, 2.0, 8.2], look: [0, 1.2, 0], fov: 37}],
  [1.2, {pos: [0.1, 1.45, 2.6], look: [0, 1.35, 0], fov: 30}, EASE.slam], [1.7, {pos: [0.1, 1.45, 2.4], look: [0, 1.35, 0], fov: 30}], [2.0, {pos: [0, 0.8, -1.2], look: [0, 0.6, -3], fov: 30}, EASE.dive]];
const KB: Cam3Key[] = [[2.0, {pos: [0, 2.6, 4], look: [0, 1.2, -1], fov: 36}], [3.6, {pos: [0.8, 2.1, 6.4], look: [0, 1.1, -1], fov: 36}]];
const KC: Cam3Key[] = [[3.6, {pos: [-3, 1.8, 6], look: [0, 1.2, 0], fov: 34}], [5, {pos: [-2.2, 1.7, 5.4], look: [0, 1.2, 0], fov: 33}]];
export const MoveTest: React.FC<{fx?: boolean}> = ({fx = true}) => {
  const f = useCurrentFrame(), {fps} = useVideoConfig(), t = f / fps;
  const wrapCam = (keys: Cam3Key[], node: React.ReactNode) => fx ? <ShotBlur t={t} cam={keys}>{node}</ShotBlur> : <>{node}</>;
  const A = wrapCam(KA, <World cam={cam3At(t, KA)} light={NIGHT} sky={['#120E2E', '#4A2F7A']} scene={<City />}>
    <Cel at={[0, 0, 0]} h={1.7}><Person id="b" outfit={BLOB} t={t} eyes={t > 1.2 ? 'wide' : 'dot'} mouth={t > 1.2 ? 'o' : 'smile'} browUp={t > 1.2 ? 1 : 0} /></Cel>
    {fx && <PostCard x={540} y={520} {...cardIn(t, 1.3, 1.85)} name="Sam Rivera" handle="@samrivera" text="Nobody saw this coming. Not even the experts." likes="12K" />}
  </World>);
  const B = wrapCam(KB, <World cam={cam3At(t, KB)} light={{sun: [-4, 7, 4]}} sky={['#9CC9F5', '#F3E8D6']} scene={<Room />}>
    <Cel at={[-0.6, 0, -1]} h={1.7}><Person id="b2" outfit={BLOB} t={t} mouth="grin" handR={[120, -330]} /></Cel>
    {fx && <BigNumber x={540} y={480} {...cardIn(t, 2.3, 2.95)} to={3500000} count={(t - 2.3) / 0.6} sub="people a day" />}
    {fx && <Headline x={560} y={600} {...cardIn(t, 3.0, 3.55)} rot={-6} paper="The Daily Circuit" title="Is the race already over?" />}
  </World>);
  const C = wrapCam(KC, <World cam={cam3At(t, KC)} light={NIGHT} sky={['#120E2E', '#4A2F7A']} scene={<City />}>
    <Cel at={[0, 0, 0]} h={1.7}><Person id="b3" outfit={BLOB} t={t} eyes="closed" mouth="smirk" /></Cel></World>);
  const AB = fx ? <Transition t={t} at={2.0} kind="fly" a={A} b={B} /> : (t < 2 ? A : B);
  return <AbsoluteFill style={{background: '#000'}}>{t < 2.8 ? AB : fx ? <Transition t={t} at={3.6} kind="smear" a={B} b={C} /> : (t < 3.6 ? B : C)}</AbsoluteFill>;
};
