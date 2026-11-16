/* v3 demo (8 s): the permanent look in one file - FLAT 2D cel characters composited into a STYLIZED 3D world.
 * Shot 1: a market street (dolly + gentle push-in). Clean cut on the action. Shot 2: a kitchen (high-angle insert ->
 * reaction close-up), a table edge passing in front of the character (`front`), a 3D prop in a flat hand (`celPoint`).
 * Copy the patterns, never the content: every video gets its own cast, clothes, place and palette. */
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Captions, SafeGuides} from './Captions';
import {Person} from './Cast';
import {Ball, Box, Cam3, Cel, Cuts, Cyl, Ground, Light, World, cam3At, celPoint, tex} from './World3D';
import {bump, kfs, pick, spring} from './math';
export const DURATION = 8;
const CUT = 4;
// ---- the video's cast (fixed for the whole video): role colours, hair, one accessory each
const MIA = {shirt: '#E4572E', hair: '#3B2A20', hairStyle: 'ponytail' as const};
const OTTO = {shirt: '#2E86AB', vest: '#F6C453', hair: '#8A8F98', hairStyle: 'sides' as const, hat: 'cap' as const, hatColor: '#2F4858', mustache: true};

// ---------------------------------------------------------------- shot 1: market street (3D set)
const STREET: Light = {sun: [-5, 6, 3], sunColor: '#FFE9C4', sunI: 2.6, sky: '#CFE6FF', bounce: '#C9A27A', ambI: 1.2, fog: ['#F3E2CF', 22, 90], focus: [0, 0, -2], span: 12};
const House: React.FC<{x: number; z: number; w: number; h: number; c: string; roof: string}> = ({x, z, w, h, c, roof}) => (<group position={[x, 0, z]}>
  <Box size={[w, h, 4]} color={c} map={tex('speckle', [3, 3])} r={0.06} />
  <Box pos={[0, h, 0]} size={[w + 0.5, 0.35, 4.5]} color={roof} map={tex('stripes', [10, 1])} r={0.08} />
  {[-1, 1].map((s) => <Box key={s} pos={[s * w * 0.24, h * 0.5, 2.0]} size={[w * 0.24, h * 0.24, 0.12]} color="#5E7FA3" rough={0.3} />)}
  <Box pos={[0, 0, 2.0]} size={[1.0, 2.1, 0.12]} color="#7A4E2D" map={tex('planks', [1, 2])} />
</group>);
const Stall: React.FC = () => (<group position={[1.9, 0, -3.2]} rotation={[0, -0.3, 0]}>
  <Box size={[2.4, 0.9, 1.1]} color="#B9824F" map={tex('planks', [2, 1])} />
  {[-1.1, 1.1].map((x) => <Cyl key={x} pos={[x, 0.9, -0.45]} r={0.04} h={1.5} color="#6B4A2E" />)}
  <Box pos={[0, 2.35, 0]} rot={[0.22, 0, 0]} size={[2.8, 0.08, 1.7]} color="#E63946" map={tex('stripes', [6, 1])} />
  {Array.from({length: 12}, (_, i) => <Ball key={i} pos={[-0.9 + (i % 6) * 0.36, 1.02 + Math.floor(i / 6) * 0.02, -0.15 + Math.floor(i / 6) * 0.34]} r={0.15} color={i % 3 ? '#F4A52B' : '#D7372F'} rough={0.55} />)}
</group>);
const Tree: React.FC<{x: number; z: number; s?: number}> = ({x, z, s = 1}) => (<group position={[x, 0, z]} scale={s}>
  <Cyl r={0.2} rTop={0.13} h={2.2} color="#7B5236" map={tex('planks', [1, 2])} />
  <Ball pos={[0, 3.1, 0]} r={1.25} color="#5FA85B" map={tex('speckle', [4, 3], 3)} /><Ball pos={[0.8, 2.6, 0.3]} r={0.8} color="#6DB85A" map={tex('speckle', [3, 2], 5)} /><Ball pos={[-0.8, 2.7, -0.2]} r={0.85} color="#549A53" map={tex('speckle', [3, 2], 9)} />
</group>);
const Street: React.FC<{t: number}> = ({t}) => {
  const cam: Cam3 = cam3At(t, [[0, {pos: [1.6, 2.3, 13], look: [0, 1.2, 0], fov: 36}], [2.6, {pos: [0.3, 1.7, 8.2], look: [0.05, 1.1, 0], fov: 34}], [CUT, {pos: [0, 1.6, 7.4], look: [0.05, 1.1, 0], fov: 33}]]);
  const walk = kfs(t, [[0.2, -3.0], [2.2, -0.5]]), step = t < 2.2 ? Math.sin(t * 11) : 0;       // Mia walks in from the left
  const surprised = t > 2.9;
  return (<World cam={cam} light={STREET} sky={['#6DB7F2', '#F6E7D2']}
    scene={<>
      <Ground color="#D9B48A" map={tex('speckle', [60, 60])} />
      <Ground size={[5, 80]} at={[0, -20]} y={0.01} color="#B8B2A7" map={tex('tiles', [5, 80])} />
      <House x={-5.2} z={-6} w={5} h={4.6} c="#F2D6B3" roof="#C8553D" /><House x={5.6} z={-9} w={5.5} h={5.4} c="#BFD8D2" roof="#7A5C61" /><House x={-6} z={-15} w={6} h={6.2} c="#F6C6A8" roof="#8A5A44" />
      <Tree x={-3.4} z={-1.5} /><Tree x={4.8} z={-4.5} s={1.2} /><Tree x={-4.2} z={-10} s={1.3} />
      <Stall />
    </>}>
    <Cel at={[walk, 0, 0.4]}>
      <Person id="mia" outfit={MIA} view={t < 2.2 ? 'right' : 'front'} bounce={Math.abs(step) * 10} footL={[-30 + step * 26, -5 - Math.max(0, step) * 16]} footR={[30 - step * 26, -5 - Math.max(0, -step) * 16]}
        handL={[-70 - step * 24, -130]} handR={surprised ? [96, -300] : [70 + step * 24, -130]} eyes={surprised ? 'wide' : 'dot'} mouth={surprised ? 'o' : 'smile'} browUp={surprised ? 1 : 0}
        headTilt={surprised ? -6 + 3 * spring(t, 2.9, 3, 5) : 0} blink={bump(t, 1.2, 1.36)} />
    </Cel>
    <Cel at={[0.62, 0, -0.9]}>
      <Person id="otto" outfit={OTTO} view="left" eyes={pick(t, [[0, 'dot'], [3.0, 'closed']])} mouth="smile" handL={[-96, -250 + 14 * Math.sin(t * 6)]} headTilt={4 * Math.sin(t * 1.57)} />
    </Cel>
  </World>);
};

// ---------------------------------------------------------------- shot 2: kitchen (3D set, different palette)
const KITCHEN: Light = {sun: [4, 6, 5], sunColor: '#FFF1DA', sunI: 2.2, sky: '#FFF4E3', bounce: '#C98F6B', ambI: 1.45, fog: ['#F3D9BF', 30, 80], focus: [0, 0, 0], span: 7};
const Kitchen: React.FC<{t: number}> = ({t}) => {
  const u = t - CUT;
  // high-angle insert on the table, then a smooth move down into a reaction close-up
  const cam: Cam3 = cam3At(u, [[0, {pos: [0.4, 4.2, 3.4], look: [0, 0.9, 0.6], fov: 34}], [1.3, {pos: [0.4, 4.0, 3.3], look: [0, 0.9, 0.6], fov: 33}], [2.6, {pos: [0.1, 1.5, 4.6], look: [0, 1.22, 0], fov: 27}], [4, {pos: [0, 1.48, 4.3], look: [0, 1.22, 0], fov: 26}]]);
  const lift = bump(u, 0.5, 1.3);                                                          // she lifts the mug: joint rotation of the arm, the prop follows the hand
  const hand: [number, number] = [84, -200 - 70 * lift];
  const at: [number, number, number] = [0, 0, 0];
  const mug = celPoint(cam, at, 1.7, [hand[0] + 4, hand[1] - 18]);
  const table = <><Box pos={[0, 0.78, 1.05]} size={[2.6, 0.09, 1.2]} color="#C98B5A" map={tex('planks', [2, 1])} r={0.03} />
    {[[-1.15, 0.55], [1.15, 0.55], [-1.15, 1.55], [1.15, 1.55]].map(([x, z], i) => <Cyl key={i} pos={[x, 0, z]} r={0.05} h={0.78} color="#8A5A38" />)}
    <Cyl pos={[-0.6, 0.87, 1.0]} r={0.2} h={0.03} color="#F4F1EA" rough={0.4} /><Ball pos={[-0.6, 0.98, 1.0]} r={0.11} color="#D7372F" rough={0.5} /></>;
  return (<World cam={cam} light={KITCHEN} sky={['#F7E3C8', '#F7E3C8']}
    scene={<>
      <Ground size={[14, 14]} color="#E9C9A0" map={tex('checker', [14, 14])} />
      <Box pos={[0, 0, -2.2]} size={[12, 4.4, 0.2]} color="#8FBFA8" map={tex('speckle', [8, 3])} r={0} />
      <Box pos={[-4, 0, 0]} rot={[0, Math.PI / 2, 0]} size={[8, 4.4, 0.2]} color="#84B39D" map={tex('speckle', [6, 3])} r={0} />
      <Box pos={[1.6, 0, -1.8]} size={[2.6, 0.95, 0.7]} color="#F3E9DA" map={tex('panels', [3, 1])} /><Box pos={[1.6, 0.95, -1.8]} size={[2.7, 0.06, 0.76]} color="#6E7B8B" rough={0.35} />
      <Box pos={[-1.4, 1.5, -2.08]} size={[1.5, 1.3, 0.08]} color="#BFE3FF" rough={0.2} glow={0.35} emissive="#BFE3FF" /><Box pos={[-1.4, 1.42, -2.04]} size={[1.66, 0.08, 0.12]} color="#F3E9DA" />
      <Cyl pos={[2.3, 1.01, -1.8]} r={0.16} h={0.3} color="#E4572E" rough={0.5} />
    </>}
    front={<>{table}<Cyl pos={[mug[0], mug[1], mug[2] + 0.02]} r={0.07} h={0.13} color="#2E86AB" rough={0.45} /></>}>
    <Cel at={at}>
      <Person id="mia" outfit={MIA} handR={hand} handL={[-74, -150]} eyes={u > 2.7 ? 'wide' : 'dot'} mouth={u > 2.7 ? 'grin' : 'flat'} browUp={u > 2.7 ? 0.9 : 0} brow={u < 2.4 ? 0.4 : 0}
        lookY={u < 2.2 ? 8 : 0} faceDy={u < 2.2 ? 8 : 0} headTilt={u > 2.7 ? 5 * spring(u, 2.7, 2.5, 4) : 0} blink={bump(u, 1.7, 1.86)} />
    </Cel>
  </World>);
};

export const Short: React.FC<{voice?: boolean; captions?: boolean; guides?: boolean}> = ({captions = true, guides = false}) => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps;
  return (<AbsoluteFill style={{background: '#000'}}>
    <Cuts t={t} shots={[[0, <Street t={t} />], [CUT, <Kitchen t={t} />]]} />
    {captions && <Captions t={t} />}
    {guides && <SafeGuides />}
  </AbsoluteFill>);
};
export const Thumb: React.FC<{variant: 'A' | 'B' | 'C'}> = () => <Street t={3.2} />;
