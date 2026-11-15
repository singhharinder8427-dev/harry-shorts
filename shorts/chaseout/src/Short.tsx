/* "The chase-out room" - harry-animator v3.
 * Flat 2D cel cast (Ken = you, Taro = the man in the corner, the boss, co-workers) acting in two code-built 3D places:
 * a warm open-plan office and, through a grey door at the end of its aisle, a tiny bare sage-grey room.
 * Cutaways (one layer deep, no text): the bare desk, the empty drawer, the clock, the phone's inbox, the photo frame,
 * the double-locked slot that a pink slip can't get through, the desk being emptied, the city of offices. */
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import * as THREE from 'three';
import timing from './timing.json';
import {Captions, SafeGuides} from './Captions';
import {Outfit, Person, PersonPose} from './Cast';
import {Cta, ThumbText} from './Cta';
import {Sparkle} from './Bits';
import {Ball, Box, Cam3, Cel, Cuts, Cyl, Ground, Light, V3, World, cam3At, celPoint, tex} from './World3D';
import {bump, clamp, kfs, lerp, pick, pop, prog, rnd, smooth, spring} from './math';

const T = timing as any; const K = T.keys as Record<string, number>; const CHS = T.chunks as {start: number; end: number}[];
export const DURATION = T.duration as number; const END = DURATION;
const CH = (i: number) => CHS[i].start - 0.12;                 // clean cut just before caption chunk i
const loopS = (t: number, n: number, ph = 0) => Math.sin(2 * Math.PI * (n * t / DURATION + ph));   // whole cycles (loop-safe)

// ---------------------------------------------------------------- cast (fixed for the whole video)
const KEN: Outfit = {shirt: '#1FA5A0', hair: '#1E1B1A', hairStyle: 'short'};
const TARO: Outfit = {shirt: '#C8433A', buttons: true, hair: '#A7A7A7', hairStyle: 'sides', glasses: true};
const BOSS: Outfit = {shirt: '#A9C7E8', vest: '#4A5468', hair: '#222222', hairStyle: 'short'};
const CO = [{shirt: '#E2A93B', hair: '#5A3B26', hairStyle: 'bun'}, {shirt: '#9B8BD9', hair: '#1E1B1A', hairStyle: 'short'},
  {shirt: '#F08A6B', hair: '#3B2A20', hairStyle: 'long'}, {shirt: '#6CB86A', hair: '#1E1B1A', hairStyle: 'short'}] as Outfit[];
const Ken: React.FC<PP> = (p) => <Person {...p} id={p.id ?? 'ken'} outfit={KEN} />;
const Taro: React.FC<PP> = (p) => <Person {...p} id={p.id ?? 'taro'} outfit={TARO} />;
type PP = Omit<PersonPose, "id"> & {id?: string};
const Boss: React.FC<PP> = (p) => <Person {...p} id={p.id ?? 'boss'} outfit={BOSS} />;
/** seated: legs forward toward the desk the character faces (dir 1 = facing screen right) */
const seat = (dir: number) => ({footL: [dir * 78, -6] as [number, number], footR: [dir * 104, -6] as [number, number]});
/** feet up on the desk in front, leaning back */
const feetUp = (dir: number, u = 1) => ({footL: [dir * lerp(78, 150, u), lerp(-6, -186, u)] as [number, number], footR: [dir * lerp(104, 188, u), lerp(-6, -200, u)] as [number, number], lean: -dir * 9 * u});
/** walk cycle: feet alternate with the distance travelled, small bounce */
const walk = (ph: number, on: boolean, stride = 24) => { const s = on ? Math.sin(ph) : 0;
  return {bounce: Math.abs(s) * 8, footL: [-30 + s * stride, -5 - Math.max(0, s) * 13] as [number, number], footR: [30 - s * stride, -5 - Math.max(0, -s) * 13] as [number, number], s}; };

// ---------------------------------------------------------------- light (one per place / time)
const OFFICE: Light = {sun: [-6, 7, 3], sunColor: '#FFF1DA', sunI: 2.3, sky: '#FFF6E8', bounce: '#B9A88F', ambI: 1.35, fog: ['#F2E9DA', 16, 60], focus: [0, 0, -1], span: 9};
const ROOM: Light = {sun: [-5, 6, 2], sunColor: '#EEF6F2', sunI: 1.9, sky: '#E4ECE8', bounce: '#8E978F', ambI: 1.25, fog: ['#C9D1CB', 10, 40], focus: [0.3, 0, -12.2], span: 4.5};
const ROOM_EVE: Light = {sun: [-6, 2.4, 1], sunColor: '#FFB46B', sunI: 2.4, sky: '#F2D3B5', bounce: '#8F7E70', ambI: 1.05, fog: ['#C9B6A4', 10, 40], focus: [0.3, 0, -12.2], span: 4.5};
const ROOM_MON: Light = {sun: [-5, 5, 2], sunColor: '#CFE0FF', sunI: 1.5, sky: '#C6D4E6', bounce: '#7A8494', ambI: 1.1, fog: ['#AEB9C8', 10, 40], focus: [0.3, 0, -12.2], span: 4.5};
const CITY: Light = {sun: [-5, 8, 4], sunColor: '#FFF2DC', sunI: 2.6, sky: '#CFE6FF', bounce: '#B7AE9E', ambI: 1.2, fog: ['#DCE8F3', 70, 230], focus: [0, 0, 0], span: 30};
const STUDIO: Light = {sun: [-4, 6, 5], sunColor: '#FFF1DA', sunI: 2.3, sky: '#FFF6E8', bounce: '#B9A88F', ambI: 1.3, fog: ['#EFE2CF', 12, 50], focus: [0, 0, 0], span: 4};
const SKY_OFFICE: [string, string] = ['#EFE6D6', '#EFE6D6'], SKY_ROOM: [string, string] = ['#AEB8AC', '#AEB8AC'];

// ---------------------------------------------------------------- code-drawn picture textures (photo, phone screen)
const picCache = new Map<string, THREE.CanvasTexture>();
const pic = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  const hit = picCache.get(key); if (hit) return hit;
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d')!);
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; picCache.set(key, tx); return tx;
};
/** a stranger's family photo: three flat figures on a beach-blue background */
const familyPic = () => pic('family', 256, 320, (g) => {
  g.fillStyle = '#8FD0F2'; g.fillRect(0, 0, 256, 320); g.fillStyle = '#F2D38F'; g.fillRect(0, 230, 256, 90);
  g.lineWidth = 6; g.strokeStyle = '#151515';
  const fig = (x: number, y: number, s: number, shirt: string) => { g.fillStyle = shirt; g.beginPath(); g.ellipse(x, y + 62 * s, 26 * s, 40 * s, 0, 0, 7); g.fill(); g.stroke();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, 30 * s, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#151515';
    g.beginPath(); g.ellipse(x - 10 * s, y - 3 * s, 4 * s, 6 * s, 0, 0, 7); g.ellipse(x + 10 * s, y - 3 * s, 4 * s, 6 * s, 0, 0, 7); g.fill();
    g.beginPath(); g.arc(x, y + 8 * s, 10 * s, 0.2, Math.PI - 0.2); g.stroke(); };
  fig(70, 120, 1.15, '#E2A93B'); fig(186, 112, 1.25, '#3F7FD9'); fig(128, 176, 0.8, '#E5484D');
});

// ---------------------------------------------------------------- props
const WOOD = '#C99A6B', DESK = '#EDE7DC';
const Mug: React.FC<{pos: V3; color?: string; s?: number}> = ({pos, color = '#F4F1EA', s = 1}) => (<group position={pos} scale={s}>
  <Cyl r={0.045} h={0.1} color={color} rough={0.4} />
  <mesh position={[0.05, 0.05, 0]} rotation={[0, 0, Math.PI / 2]} castShadow><torusGeometry args={[0.025, 0.008, 8, 16]} /><meshStandardMaterial color={color} roughness={0.4} /></mesh>
</group>);
const Monitor: React.FC<{pos: V3; face: number; on?: boolean; hue?: string}> = ({pos, face, on = true, hue = '#9FD3F5'}) => (<group position={pos} rotation={[0, face, 0]}>
  <Box pos={[0, 0, 0]} size={[0.22, 0.02, 0.16]} color="#2B2F36" /><Box pos={[0, 0.02, 0]} size={[0.04, 0.2, 0.03]} color="#2B2F36" />
  <Box pos={[0, 0.16, 0.02]} size={[0.6, 0.36, 0.04]} r={0.012} color="#2B2F36" rough={0.5} />
  <Box pos={[0, 0.18, 0.043]} size={[0.55, 0.32, 0.004]} r={0.001} color={on ? hue : '#1C2026'} emissive={on ? hue : '#000000'} glow={on ? 0.75 : 0} cast={false} />
</group>);
/** office desk seen from the aisle: the worker sits on the aisle side (x = side * 0.95) facing outward */
const OfficeDesk: React.FC<{z: number; side: number; stuff?: boolean; photo?: boolean; hue?: string; empty?: boolean; take?: number}> = ({z, side, stuff = true, photo = false, hue, empty = false, take = 0}) => {
  const x = side * 1.7, gone = (i: number) => clamp(take * 5 - i);         // take: items slide away one by one
  return (<group>
    <Box pos={[x, 0.7, z]} size={[0.75, 0.04, 1.35]} color={DESK} map={tex('speckle', [2, 3], 3)} rough={0.6} />
    {[-1, 1].map((e) => <Box key={e} pos={[x, 0, z + e * 0.62]} size={[0.7, 0.7, 0.04]} color="#B8BDC4" />)}
    <Box pos={[x + side * 0.36, 0.72, z]} size={[0.04, 0.36, 1.35]} color="#7E93A8" map={tex('speckle', [2, 2], 9)} />
    {!empty && <group position={[x + side * 0.16 + side * 1.4 * gone(0), 0.72, z]}><Monitor pos={[0, 0, 0]} face={-side * Math.PI / 2} hue={hue} /></group>}
    {stuff && !empty && <>
      <group position={[side * 1.4 * gone(1), 0, 0]}><Box pos={[x - side * 0.08, 0.72, z - 0.42]} size={[0.24, 0.05, 0.32]} color="#E2A93B" rot={[0, 0.2, 0]} /><Box pos={[x - side * 0.08, 0.77, z - 0.42]} size={[0.24, 0.04, 0.32]} color="#4E9BD6" rot={[0, 0.05, 0]} /></group>
      <group position={[side * 1.4 * gone(2), 0, 0]}><Mug pos={[x - side * 0.1, 0.72, z + 0.44]} color={side > 0 ? '#E5484D' : '#F4F1EA'} /></group>
      <group position={[side * 1.4 * gone(3), 0, 0]}><Box pos={[x - side * 0.2, 0.72, z + 0.05]} size={[0.16, 0.015, 0.42]} color="#3A3F48" /></group>
    </>}
    {photo && <group position={[x + side * 0.12, 0.72, z + 0.42]} rotation={[0, -side * 1.15, 0]}>
      <Box size={[0.2, 0.25, 0.02]} color="#8B5E3C" rough={0.5} />
      <mesh position={[0, 0.125, 0.012]}><planeGeometry args={[0.16, 0.2]} /><meshStandardMaterial map={familyPic()} roughness={0.7} /></mesh>
      <Box pos={[0, 0, -0.04]} rot={[-0.4, 0, 0]} size={[0.04, 0.16, 0.01]} color="#8B5E3C" />
    </group>}
    <OfficeChair pos={[side * 0.95, 0, z]} side={side} />
  </group>);
};
const OfficeChair: React.FC<{pos: V3; side: number; pushed?: number}> = ({pos, side, pushed = 0}) => (<group position={[pos[0] + side * pushed, pos[1], pos[2]]}>
  <Cyl r={0.24} h={0.03} color="#2B2F36" /><Cyl r={0.025} h={0.42} color="#555B63" />
  <Box pos={[0, 0.42, 0]} size={[0.46, 0.07, 0.46]} r={0.03} color="#334155" />
  <Box pos={[-side * 0.22, 0.48, 0]} size={[0.06, 0.5, 0.44]} r={0.03} color="#334155" />
</group>);
const Plant: React.FC<{pos: V3; s?: number; t: number; dead?: boolean}> = ({pos, s = 1, t, dead}) => (<group position={pos} scale={s}>
  <Cyl r={0.17} rTop={0.2} h={0.36} color={dead ? '#9A8F84' : '#D9774A'} map={tex('speckle', [2, 1], 13)} />
  <group position={[0, 0.36, 0]} rotation={[0, 0, 0.03 * loopS(t, 6)]}>
    {(dead ? [[0, 0.2, 0, 0.1]] : [[0, 0.36, 0, 0.26], [-0.16, 0.24, 0.05, 0.2], [0.16, 0.26, -0.04, 0.21], [0.02, 0.56, 0.02, 0.18]]).map(([x, y, z, r], i) =>
      <Ball key={i} pos={[x, y, z]} r={r} color={dead ? '#8C7B4E' : ['#3E8E4A', '#347A3F', '#4AA357'][i % 3]} map={tex('speckle', [3, 3], 70 + i)} />)}
  </group>
</group>);
/** wall clock facing +z. hours = 12-h clock time as a float; sec = the ticking second hand (whole seconds) */
const Clock: React.FC<{pos: V3; hours: number; sec: number; r?: number}> = ({pos, hours, sec, r = 0.28}) => {
  const hand = (ang: number, len: number, w: number, c: string, z: number) => <group position={[0, 0, z]} rotation={[0, 0, -ang]}><Box size={[w, len, 0.008]} r={0.002} color={c} cast={false} /></group>;
  return (<group position={pos}>
    <group rotation={[Math.PI / 2, 0, 0]}><Cyl r={r} h={0.05} color="#FFFFFF" rough={0.5} emissive="#FFFFFF" glow={0.35} /></group>
    <mesh position={[0, 0, 0.05]}><torusGeometry args={[r, 0.035, 12, 48]} /><meshStandardMaterial color="#2B2F36" roughness={0.4} /></mesh>
    {Array.from({length: 12}, (_, i) => <group key={i} rotation={[0, 0, -i * Math.PI / 6]}><Box pos={[0, r * 0.74, 0.052]} size={[i % 3 ? 0.014 : 0.028, r * 0.14, 0.006]} r={0} color="#2B2F36" cast={false} /></group>)}
    {hand(hours / 12 * 2 * Math.PI, r * 0.5, 0.045, '#2B2F36', 0.056)}
    {hand((hours % 1) * 2 * Math.PI, r * 0.76, 0.03, '#2B2F36', 0.062)}
    {hand(sec / 60 * 2 * Math.PI, r * 0.84, 0.012, '#E5484D', 0.068)}
    <Cyl pos={[0, 0, 0.07]} rot={[Math.PI / 2, 0, 0]} r={0.018} h={0.01} color="#E5484D" cast={false} />
  </group>);
};
/** a ticking second: jumps once a second with a tiny settle */
const tick = (t: number) => Math.floor(t) + Math.min(1, (t % 1) / 0.08) + 0.06 * spring(t % 1, 0.08, 6, 14);
/** door in the office back wall (z = -10, opening x -0.48..0.48), hinge on the left, opens INTO the room (angle 0..1.7) */
const Door: React.FC<{open: number}> = ({open}) => (<group position={[0.47, 0, -10]} rotation={[0, -open, 0]}>
  <Box pos={[-0.47, 0, -0.03]} size={[0.92, 2.08, 0.05]} r={0.01} color="#8E979E" map={tex('panels', [1, 2], 5)} />
  <Ball pos={[-0.82, 1.0, 0.01]} r={0.035} color="#D9D2C2" rough={0.3} metal={0.5} />
</group>);

// ---------------------------------------------------------------- the office (warm, busy) + the tiny room behind it
const Office: React.FC<{t: number; oldDeskStranger?: boolean; take?: number; door?: number; clock?: number; room?: React.ReactNode; hideBack?: boolean}> = ({t, oldDeskStranger, take = 0, door = 0, clock, room, hideBack}) => (<>
  <Ground size={[8.2, 22.4]} at={[0, 1.1]} color="#5E7184" map={tex('speckle', [24, 64], 2)} rough={0.95} />
  <Ground size={[1.0, 22.4]} at={[0, 1.1]} y={0.004} color="#6E8296" map={tex('speckle', [3, 52], 8)} />
  {/* walls: window wall left, cream wall right, back wall with the grey door */}
  <Box pos={[-4.1, 0, 1.1]} size={[0.2, 3.1, 22.4]} color="#EFE6D6" cast={false} />
  {[-8, -4.6, -1.2, 2.2, 5.6, 9.0].map((z, i) => <group key={i}><Box pos={[-3.99, 0.95, z]} size={[0.03, 1.55, 2.6]} r={0.005} color="#DDEFFF" emissive="#DDEFFF" glow={0.9} cast={false} />
    {[-0.65, 0.65].map((d) => <Box key={d} pos={[-3.97, 0.95, z + d]} size={[0.04, 1.55, 0.06]} color="#F6F2EA" cast={false} />)}</group>)}
  <Box pos={[4.1, 0, 1.1]} size={[0.2, 3.1, 22.4]} color="#EBDFC9" map={tex('speckle', [6, 3], 4)} cast={false} />
  {!hideBack && <>
  <Box pos={[-2.3, 0, -10.1]} size={[3.64, 3.1, 0.2]} color="#E9DECB" map={tex('speckle', [6, 3], 6)} cast={false} />
  <Box pos={[2.3, 0, -10.1]} size={[3.64, 3.1, 0.2]} color="#E9DECB" map={tex('speckle', [6, 3], 6)} cast={false} />
  <Box pos={[0, 2.1, -10.1]} size={[0.96, 1.0, 0.2]} color="#E9DECB" cast={false} />
  {[-0.53, 0.53].map((x) => <Box key={x} pos={[x, 0, -9.98]} size={[0.08, 2.14, 0.06]} color="#6F777E" cast={false} />)}
  <Box pos={[0, 2.1, -9.98]} size={[1.14, 0.08, 0.06]} color="#6F777E" cast={false} />
  <Door open={door} />
  </>}
  {clock !== undefined && <Clock pos={[0, 2.6, -9.96]} hours={clock} sec={tick(t)} r={0.2} />}
  <Box pos={[0, 3.05, 1.1]} size={[8.4, 0.1, 22.4]} color="#F4F1EA" cast={false} receive={false} />
  {[-7.5, -4.5, -1.5, 1.5, 4.5, 7.5, 10.5].map((z) => [-1.7, 1.7].map((x) => <Box key={x + '' + z} pos={[x, 3.0, z]} size={[1.1, 0.03, 0.5]} r={0.005} color="#FFFDF5" emissive="#FFFDF5" glow={1} cast={false} receive={false} />))}
  {/* rows of desks; Ken's old desk is right-front (z 1.5) */}
  {[1.5, -1.5, -4.5, -7.3].map((z, i) => [-1, 1].map((side) =>
    <OfficeDesk key={i + '' + side} z={z} side={side} hue={['#9FD3F5', '#BDE7C4', '#F6D58E'][(i + (side > 0 ? 1 : 0)) % 3]}
      photo={oldDeskStranger && i === 0 && side > 0} take={i === 1 && side > 0 ? take : 0} />))}
  <Plant pos={[-3.5, 0, -9.3]} s={1.4} t={t} /><Plant pos={[3.5, 0, -9.3]} s={1.3} t={t} /><Plant pos={[3.5, 0, 4.6]} s={1.2} t={t} />
  {/* printer and water cooler by the right wall */}
  <Box pos={[3.55, 0, -2.9]} size={[0.7, 0.85, 0.55]} color="#D8D8D4" map={tex('panels', [1, 1], 3)} /><Box pos={[3.55, 0.85, -2.9]} size={[0.6, 0.18, 0.45]} color="#BFC3C7" />
  <Box pos={[3.6, 0, -6.1]} size={[0.34, 1.0, 0.34]} color="#F2F2EE" /><Cyl pos={[3.6, 1.0, -6.1]} r={0.15} h={0.42} color="#8FC9F0" opacity={0.75} rough={0.2} />
  {room}
</>);

// the tiny room: x -3..3, z -17..-10, ceiling 2.9 m; Ken's desk and Taro's desk along the right wall (x 2.55)
const KCH: V3 = [1.8, 0, -12.2], TCH: V3 = [1.8, 0, -15.6];     // the two chairs (characters sit here facing +x)
const KDESK_Z = -12.2, TDESK_Z = -15.6, CLOCK: V3 = [-0.9, 2.1, -16.94], DX = 2.55;
const RoomDesk: React.FC<{z: number; dust?: boolean; drawer?: number; tray?: boolean; clutter?: number}> = ({z, dust, drawer = 0, tray = true, clutter = 0}) => (<group>
  <Box pos={[DX, 0.7, z]} size={[0.72, 0.04, 1.25]} color="#CFC8BA" map={tex('speckle', [2, 3], 21)} rough={0.7} />
  <Box pos={[DX, 0, z + 0.58]} size={[0.68, 0.7, 0.04]} color="#9CA39C" />
  {/* drawer pedestal on the near end, the drawer slides toward the room (-x) */}
  <Box pos={[DX, 0, z - 0.4]} size={[0.66, 0.7, 0.42]} color="#A9B0A8" map={tex('panels', [1, 2], 7)} />
  <group position={[-0.42 * drawer, 0, 0]}><Box pos={[DX - 0.35, 0.42, z - 0.4]} size={[0.06, 0.2, 0.38]} color="#B7BEB6" /><Box pos={[DX - 0.37, 0.5, z - 0.4]} size={[0.02, 0.03, 0.12]} color="#4A4F55" />
    {drawer > 0.02 && <><Box pos={[DX - 0.08, 0.42, z - 0.4]} size={[0.5, 0.02, 0.36]} color="#6E756D" /><Box pos={[DX - 0.08, 0.42, z - 0.58]} size={[0.5, 0.16, 0.02]} color="#9AA198" /><Box pos={[DX - 0.08, 0.42, z - 0.22]} size={[0.5, 0.16, 0.02]} color="#9AA198" /></>}
  </group>
  {dust && <group position={[DX + 0.16, 0.722, z]}>
    {/* where a monitor used to stand: a clean pale rectangle in the dust, and the unplugged cable */}
    <Box size={[0.26, 0.002, 0.64]} r={0.0005} color="#F3EFE6" cast={false} />
    {[[-0.13, 0, 0.004, 0.64], [0.13, 0, 0.004, 0.64]].map(([x, z2, w, l], i) => <Box key={i} pos={[x, 0, z2]} size={[w, 0.003, l]} r={0.0005} color="#8C877C" cast={false} />)}
    {[-0.32, 0.32].map((z2) => <Box key={z2} pos={[0, 0, z2]} size={[0.26, 0.003, 0.004]} r={0.0005} color="#8C877C" cast={false} />)}
    <mesh position={[-0.2, 0.012, 0.42]} rotation={[Math.PI / 2, 0, 0]} castShadow><torusGeometry args={[0.07, 0.009, 6, 24, 5.2]} /><meshStandardMaterial color="#2B2F36" /></mesh>
    <Box pos={[-0.32, 0.0, 0.47]} size={[0.05, 0.025, 0.03]} r={0.004} color="#2B2F36" />
  </group>}
  {tray && <group position={[DX - 0.16, 0.72, z + 0.36]}><Box size={[0.3, 0.012, 0.24]} color="#7E93A8" /><Box pos={[0, 0, -0.12]} size={[0.3, 0.06, 0.012]} color="#7E93A8" /><Box pos={[0, 0, 0.12]} size={[0.3, 0.06, 0.012]} color="#7E93A8" /><Box pos={[0.15, 0, 0]} size={[0.012, 0.06, 0.24]} color="#7E93A8" /></group>}
  {clutter > 0 && <>
    {/* years: a huge cactus and a tall stack of finished puzzle books */}
    <group position={[DX + 0.12, 0.72, z + 0.36]}><Cyl r={0.1} rTop={0.12} h={0.16} color="#D9774A" /><Cyl pos={[0, 0.16, 0]} r={0.07} rTop={0.06} h={0.62 * clutter} color="#5BAA5F" map={tex('stripes', [4, 1], 4)} />
      <Cyl pos={[0.09, 0.4, 0]} rot={[0, 0, -0.9]} r={0.035} h={0.16 * clutter} color="#5BAA5F" /><Ball pos={[0, 0.16 + 0.62 * clutter, 0]} r={0.065} color="#5BAA5F" /><Ball pos={[0, 0.2 + 0.62 * clutter, 0]} r={0.03} color="#F08AB0" /></group>
    {Array.from({length: Math.round(16 * clutter)}, (_, i) => <Box key={i} pos={[DX + 0.07 + (rnd(i) - 0.5) * 0.03, 0.72 + i * 0.035, z - 0.16]} rot={[0, (rnd(i + 9) - 0.5) * 0.4, 0]} size={[0.24, 0.033, 0.32]} r={0.004}
      color={['#E2A93B', '#4E9BD6', '#E5484D', '#F4F1EA', '#6CB86A'][i % 5]} />)}
    <Mug pos={[DX - 0.18, 0.72, z - 0.45]} color="#C8433A" />
  </>}
</group>);
const RoomChair: React.FC<{pos: V3; pushed?: number}> = ({pos, pushed = 0}) => (<group position={[pos[0] + 0.4 * pushed, 0, pos[2]]}>
  {[[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]].map(([x, z], i) => <Cyl key={i} pos={[x, 0, z]} r={0.018} h={0.44} color="#6B6F73" />)}
  <Box pos={[0, 0.44, 0]} size={[0.44, 0.05, 0.44]} r={0.02} color="#7C8A82" />
  <Box pos={[-0.21, 0.48, 0]} size={[0.04, 0.42, 0.42]} r={0.02} color="#7C8A82" />
</group>);
const Room: React.FC<{t: number; taro?: 'full' | 'cleared'; drawer?: number; clock?: number; beam?: number; years?: number; pushed?: number}> = ({t, taro = 'full', drawer = 0, clock = 3.7, beam = 0, years = 1, pushed = 0}) => (<group>
  <Ground size={[6, 7]} at={[0, -13.5]} y={0.003} color="#A3A89D" map={tex('tiles', [8, 9], 12)} rough={0.8} />
  <Box pos={[-3.1, 0, -13.5]} size={[0.2, 3.0, 7.2]} color="#B8C1B5" map={tex('speckle', [5, 3], 31)} cast={false} />
  <Box pos={[3.1, 0, -13.5]} size={[0.2, 3.0, 7.2]} color="#B8C1B5" map={tex('speckle', [5, 3], 32)} cast={false} />
  <Box pos={[0, 0, -17.1]} size={[6.4, 3.0, 0.2]} color="#B3BCB0" map={tex('speckle', [5, 3], 33)} cast={false} />
  <Box pos={[0, 0, -17.0]} size={[6.0, 0.12, 0.04]} color="#8E978F" cast={false} />
  <Box pos={[0, 2.95, -13.5]} size={[6.4, 0.1, 7.2]} color="#C9CFC9" cast={false} receive={false} />
  {[-12, -15].map((z) => <Box key={z} pos={[0.4, 2.9, z]} size={[1.1, 0.03, 0.32]} color="#F3FAF7" emissive="#F3FAF7" glow={0.8} cast={false} receive={false} />)}
  {/* high frosted window on the left wall + its sunbeam */}
  <Box pos={[-2.99, 1.8, -13.0]} size={[0.03, 0.75, 1.4]} r={0.005} color="#E9F6FF" emissive="#E9F6FF" glow={0.9} cast={false} />
  {beam > 0.01 && <mesh position={[-0.4, 1.3, -12.6]} rotation={[0, 0, -0.95]}><boxGeometry args={[0.7, 4.6, 1.3]} /><meshBasicMaterial color="#FFF1C4" transparent opacity={0.16 * beam} depthWrite={false} /></mesh>}
  <Clock pos={CLOCK} hours={clock} sec={tick(t)} r={0.36} />
  <Plant pos={[-2.5, 0, -16.5]} s={0.9} t={t} dead />
  <Cyl pos={[-2.5, 0, -10.6]} r={0.15} rTop={0.17} h={0.34} color="#6B6F73" />
  <Box pos={[-2.95, 1.6, -15.0]} size={[0.06, 0.06, 0.5]} color="#6B6F73" />
  <RoomDesk z={KDESK_Z} dust drawer={drawer} />
  <RoomDesk z={TDESK_Z} tray={false} clutter={taro === 'full' ? years : 0} />
  <RoomChair pos={KCH} /><RoomChair pos={TCH} pushed={taro === 'cleared' ? 1 : pushed} />
</group>);

/** the room alone (with its front wall + door frame) for shots that never look out through the doorway */
const RoomOnly: React.FC<{children?: React.ReactNode; open?: boolean}> = ({children, open}) => (<>
  {open ? <><Ground size={[6, 5]} at={[0, -7.5]} y={0.003} color="#A3A89D" map={tex('tiles', [8, 6], 12)} rough={0.8} />
    <Box pos={[-3.1, 0, -8.0]} size={[0.2, 3.0, 4.2]} color="#B8C1B5" cast={false} /><Box pos={[3.1, 0, -8.0]} size={[0.2, 3.0, 4.2]} color="#B8C1B5" cast={false} />
    <Box pos={[0, 2.95, -8.0]} size={[6.4, 0.1, 4.2]} color="#C9CFC9" cast={false} receive={false} /></> : <>
  <Box pos={[-2.3, 0, -10.1]} size={[3.64, 3.1, 0.2]} color="#B8C1B5" cast={false} /><Box pos={[2.3, 0, -10.1]} size={[3.64, 3.1, 0.2]} color="#B8C1B5" cast={false} />
  <Box pos={[0, 2.1, -10.1]} size={[0.96, 1.0, 0.2]} color="#B8C1B5" cast={false} /><Door open={0} /></>}
  {children}
</>);

// ---------------------------------------------------------------- A0 / ending: office wide (frame 0 = last frame)
const KEN_DESK: V3 = [0.95, 0, 1.5], BOSS_HOME: V3 = [0.32, 0, 2.05];
const CAM0: Cam3 = {pos: [1.75, 1.62, 6.0], look: [0.55, 1.08, 1.0], fov: 38};
const OfficeOpen: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[0, CAM0], [K.walking + 0.2, {pos: [1.6, 1.65, 5.8], look: [0.4, 1.05, -0.5], fov: 38}], [CH(2), {pos: [0.8, 1.68, 5.2], look: [0.05, 1.05, -4], fov: 37}]]);
  const up = smooth(prog(t, K.walking - 0.3, K.walking + 0.15)), go = prog(t, K.walking + 0.1, CH(2) + 0.6), walking = go > 0;
  const kAt: V3 = [lerp(KEN_DESK[0], 0.2, up), 0, KEN_DESK[2] - 1.5 * go], bAt: V3 = [lerp(BOSS_HOME[0], -0.32, smooth(prog(t, K.walking - 0.2, K.walking + 0.2))), 0, BOSS_HOME[2] - 1.5 * go];
  const wk = walk(go * 5 * Math.PI, walking), wb = walk(go * 5 * Math.PI + 1.2, walking);
  return (<World cam={cam} light={OFFICE} sky={SKY_OFFICE} scene={<Office t={t} />}>
    <Coworkers t={t} far />
    <Cel at={kAt}><Ken view={walking ? 'back' : up > 0.5 ? 'front' : 'right'} {...(walking ? wk : up > 0.5 ? {} : seat(1))} handL={[-74, -128]} handR={up > 0.5 ? [74, -128] : [108, -190 + 6 * Math.sin(t * 22)]}
      faceDx={up > 0.5 ? 0 : -10} lookX={up > 0.3 && !walking ? -6 : 0} eyes={up > 0.2 && !walking ? 'wide' : 'dot'} mouth={up > 0.2 ? 'flat' : 'smile'} browUp={up > 0.2 ? 0.7 : 0}
      blink={bump(t, 0.35, 0.5)} /></Cel>
    <Cel at={bAt} h={1.76}><Boss view={walking ? 'back' : 'front'} {...(walking ? wb : {})} handR={walking ? [74, -128] : [150, -230]} handL={walking ? [-74, -128] : [-74, -128]} mouth="grin" eyes={t > 0.9 && !walking ? 'closed' : 'dot'}
      headTilt={walking ? 0 : 5} /></Cel>
  </World>);
};
/** office co-workers at their desks (seated, facing their monitors; `stare` turns them toward the aisle) */
const Coworkers: React.FC<{t: number; stare?: number; old?: boolean; far?: boolean}> = ({t, stare = -1, old = false, far = false}) => {
  const P: [V3, number, number][] = [[[-0.95, 0, 1.5], -1, 1], [[-0.95, 0, -1.5], -1, 0], [[0.95, 0, -1.5], 1, 3], [[-0.95, 0, -4.5], -1, 3], [[0.95, 0, -4.5], 1, 1], [[0.95, 0, -7.3], 1, 0], [[-0.95, 0, -7.3], -1, 2]];
  if (old) P.push([[0.95, 0, 1.5], 1, 2]);
  if (far) P.splice(0, 5);
  return (<>{P.map(([at, side, o], i) => {
    const s = stare >= 0 && t > stare + i * 0.09; const ty = Math.sin(t * 19 + i * 2) * 5;
    return (<Cel key={i} at={at} h={1.66}>
      <Person id={'co' + i} outfit={CO[o]} view={s ? 'front' : side > 0 ? 'right' : 'left'} {...seat(s ? side * 0.6 : side)} handL={s ? [-74, -128] : [side * 104, -192 + (side < 0 ? ty : -ty)]} handR={s ? [74, -128] : [side * 112, -188 + (side > 0 ? ty : -ty)]}
        faceDx={s ? -side * 26 : 0} lookX={s ? -side * 8 : 0} eyes={s ? 'wide' : 'dot'} brow={s ? 0.6 : 0} mouth={s ? 'flat' : 'smile'} blink={bump((t + i * 0.7) % 4, 1, 1.15)} />
    </Cel>);
  })}</>);
};

// ---------------------------------------------------------------- A1: inside the room, the door opens on them
const DoorShot: React.FC<{t: number; t0: number; t1: number; light?: Light; monday?: boolean}> = ({t, t0, t1, light = ROOM, monday = false}) => {
  const cam = cam3At(t, [[t0, {pos: [-1.7, 1.55, -16.6], look: [0.05, 1.15, -10.2], fov: 38}], [t1, {pos: [-1.5, 1.52, -16.0], look: [0.05, 1.12, -10.4], fov: 37}]]);
  const open = 2.85 * smooth(prog(t, t0 + 0.05, t0 + 0.5));
  const inB = smooth(prog(t, t0 + 0.35, t0 + 1.0)), inK = smooth(prog(t, t0 + (monday ? 0.35 : 0.5), t0 + (monday ? 1.0 : 1.2)));
  const look = t > t0 + 1.0;
  return (<World cam={cam} light={light} sky={SKY_ROOM} scene={<><Office t={t} door={open} room={<Room t={t} taro={monday ? 'cleared' : 'full'} />} /></>}>
    {!monday && <Cel at={[lerp(0.05, 0.42, inB), 0, lerp(-9.5, -11.2, inB)]} h={1.76}><Boss view={inB < 1 ? 'front' : 'left'} {...walk(inB * 4 * Math.PI, inB > 0 && inB < 1)} handL={inB >= 1 ? [-160, -240] : [-74, -128]} mouth="grin" eyes="closed" /></Cel>}
    <Cel at={[lerp(0.0, monday ? 0.0 : -0.32, inK), 0, lerp(-9.3, -11.4, inK)]}><Ken view="front" {...walk(inK * 4 * Math.PI, inK > 0 && inK < 1)} handR={monday ? [70, -200] : [74, -128]}
      eyes={look && !monday ? 'wide' : 'dot'} mouth={monday ? 'smile' : look ? 'flat' : 'smile'} lookX={look && !monday ? -6 + 10 * Math.sin((t - t0) * 2.4) : 0} faceDx={look && !monday ? 18 * Math.sin((t - t0) * 2.4) : 0} browUp={look && !monday ? 0.8 : 0} /></Cel>
  </World>);
};

// ---------------------------------------------------------------- A2 / A3: the bare desk inserts (no computer, no work)
const DeskInsert: React.FC<{t: number; t0: number; t1: number; drawerAt?: number}> = ({t, t0, t1, drawerAt}) => {
  const work = drawerAt !== undefined;
  const cam = work ? cam3At(t, [[t0, {pos: [1.0, 1.35, -11.3], look: [2.15, 0.45, -12.6], fov: 36}], [t1, {pos: [1.15, 1.3, -11.5], look: [2.15, 0.45, -12.6], fov: 34}]])
    : cam3At(t, [[t0, {pos: [1.25, 2.25, -11.0], look: [2.6, 0.72, -12.2], fov: 36}], [t1, {pos: [1.45, 2.05, -11.2], look: [2.62, 0.72, -12.2], fov: 34}]]);
  const drawer = work ? smooth(prog(t, drawerAt! - 0.2, drawerAt! + 0.25)) + 0.1 * spring(t, drawerAt! + 0.25, 3, 6) : 0;
  return <World cam={cam} light={{...ROOM, focus: [2.4, 0.6, -12.3], span: 2}} sky={SKY_ROOM} scene={<><RoomOnly><Room t={t} drawer={drawer} /></RoomOnly></>} />;
};

// ---------------------------------------------------------------- A4 / A5: the ticking clock, then the man in the corner
const ClockShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[CH(5), {pos: [-0.6, 1.75, -12.2], look: [CLOCK[0], CLOCK[1] - 0.25, CLOCK[2]], fov: 30}], [CH(6), {pos: [-0.65, 1.8, -12.9], look: [CLOCK[0], CLOCK[1] - 0.2, CLOCK[2]], fov: 29}]]);
  return <World cam={cam} light={ROOM} sky={SKY_ROOM} scene={<><RoomOnly><Room t={t} /></RoomOnly></>} />;
};
/** Taro reclining, feet up on his desk, scrolling his phone (held as a 3D prop in his flat hand) */
const PHONE_HAND: [number, number] = [70, -282];
const Phone: React.FC<{pos: V3; rot?: V3; s?: number; rows?: number; dim?: boolean}> = ({pos, rot = [0, 0, 0], s = 1, rows = 0, dim}) => (<group position={pos} rotation={rot} scale={s}>
  <Box pos={[0, -0.075, 0]} size={[0.075, 0.15, 0.012]} r={0.006} color="#1F2328" rough={0.4} />
  <Box pos={[0, -0.069, 0.0062]} size={[0.064, 0.136, 0.001]} r={0.0004} color={dim ? '#20262E' : '#CDE6FA'} emissive={dim ? '#000000' : '#CDE6FA'} glow={dim ? 0 : 0.7} cast={false} />
  {Array.from({length: 5}, (_, i) => { const u = clamp(rows - i); return u <= 0.01 ? null : <group key={i} position={[0, 0.045 - i * 0.025, 0.0072]} scale={[u, u, 1]}>
    <Box pos={[0.006, -0.008, 0]} size={[0.044, 0.016, 0.001]} r={0.0004} color="#FFFFFF" emissive="#FFFFFF" glow={0.3} cast={false} />
    <Cyl pos={[-0.024, 0, 0]} rot={[Math.PI / 2, 0, 0]} r={0.0045} h={0.001} color="#3F7FD9" emissive="#3F7FD9" glow={0.5} cast={false} /></group>; })}
</group>);
const TaroCel: React.FC<{t: number; cam: Cam3; asleep?: boolean; wave?: number; h?: number}> = ({t, cam, asleep, wave = 0}) => {
  const scroll = Math.sin(t * 5) > 0.6 ? 6 : 0;
  return (<Cel at={TCH} h={1.64}><Taro view="right" {...feetUp(1)} handR={[PHONE_HAND[0], PHONE_HAND[1] + scroll]} handL={wave > 0 ? [-60, -380 - 18 * Math.sin(t * 14) * wave] : [40, -250]}
    eyes={asleep ? 'closed' : 'dot'} mouth={asleep ? 'smile' : 'smile'} faceDx={asleep ? 0 : 8} lookY={asleep ? 0 : 7} blink={bump(t % 3.3, 1.4, 1.55)} headTilt={-4} /></Cel>);
};
const TaroShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[CH(6), {pos: [-1.7, 1.85, -12.4], look: [-1.0, 1.95, -16.9], fov: 32}], [K.corner + 0.25, {pos: [-1.55, 1.5, -11.0], look: [1.75, 0.92, -15.5], fov: 34}], [CH(8), {pos: [-1.2, 1.42, -11.6], look: [1.8, 0.9, -15.5], fov: 32}]]);
  const hp = celPoint(cam, TCH, 1.64, [PHONE_HAND[0] + 2, PHONE_HAND[1] - 4]);
  return (<World cam={cam} light={ROOM} sky={SKY_ROOM} scene={<><RoomOnly><Room t={t} /></RoomOnly></>} front={<Phone pos={hp} rot={[0.35, -0.6, 0]} rows={5} />}>
    <TaroCel t={t} cam={cam} wave={bump(t, K.feet + 0.1, K.feet + 0.9)} />
  </World>);
};

// ---------------------------------------------------------------- A6 / A7: "your new job is nothing", "sit here until six"
const B_AT: V3 = [-0.5, 0, -13.0], K_AT: V3 = [0.45, 0, -13.2];
const JobShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[CH(8), {pos: [0.0, 1.55, -7.6], look: [0.0, 1.12, -13.1], fov: 36}], [K.nothing - 0.3, {pos: [0.0, 1.52, -8.2], look: [0.0, 1.12, -13.1], fov: 35}], [K.nothing + 0.35, {pos: [0.4, 1.42, -10.4], look: [0.42, 1.2, -13.2], fov: 31}], [CH(11), {pos: [0.42, 1.42, -10.6], look: [0.42, 1.2, -13.2], fov: 30}]]);
  const says = t > K.nothing - 1.0 - 0.1, nothing = t > K.nothing - 0.05;
  return (<World cam={cam} light={ROOM} sky={SKY_ROOM} scene={<><RoomOnly open><Room t={t} /></RoomOnly></>}>
    <TaroCel t={t} cam={cam} />
    <Cel at={B_AT} h={1.76}><Boss view="right" faceDx={-20} handL={nothing ? [-170, -250] : [-74, -128]} handR={nothing ? [170, -250] : says ? [120, -300] : [74, -128]} mouth="grin" eyes={nothing ? 'closed' : 'dot'}
      bounce={4 * spring(t, K.nothing - 0.05, 3, 5)} headTilt={nothing ? -6 : 0} /></Cel>
    <Cel at={K_AT}><Ken view="left" faceDx={18} eyes={nothing ? 'wide' : 'dot'} mouth={nothing ? 'o' : 'flat'} browUp={nothing ? 1.1 : 0.2} headTilt={nothing ? 4 * spring(t, K.nothing, 2.5, 4) : 0}
      blink={bump(t, CH(8) + 0.6, CH(8) + 0.75)} /></Cel>
  </World>);
};
const SixShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[CH(11), {pos: [0.6, 1.05, -9.0], look: [-0.6, 1.6, -16.9], fov: 40}], [CH(12), {pos: [0.45, 1.1, -9.7], look: [-0.62, 1.62, -16.9], fov: 38}]]);
  const point = t > CH(11) + 0.35, sweep = smooth(prog(t, K.six - 0.35, K.six + 0.3));
  return (<World cam={cam} light={ROOM} sky={SKY_ROOM} scene={<><RoomOnly open><Room t={t} clock={lerp(3.7, 6.0, sweep)} /></RoomOnly></>}>
    <TaroCel t={t} cam={cam} />
    <Cel at={[0.35, 0, -14.6]} h={1.76}><Boss view="left" handL={point ? [-150, -470] : [-74, -128]} handR={t < CH(11) + 0.35 ? [10, -200] : [74, -128]} faceDy={point ? -10 : 0} lookY={point ? -6 : 0} mouth="grin" /></Cel>
  </World>);
};

// ---------------------------------------------------------------- A8: at first it feels like a holiday
const HolidayShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[CH(12), {pos: [-1.4, 1.35, -8.9], look: [1.75, 1.0, -12.3], fov: 34}], [K.holiday + 0.1, {pos: [-1.0, 1.3, -9.7], look: [1.78, 1.02, -12.25], fov: 32}], [CH(14), {pos: [-0.85, 1.3, -10.0], look: [1.78, 1.02, -12.25], fov: 31}]]);
  const st = smooth(prog(t, K.holiday - 0.35, K.holiday + 0.15)), happy = t > K.holiday - 0.2;
  const sp = [[-150, -560, 0], [150, -520, 0.15], [0, -620, 0.3]] as [number, number, number][];
  return (<World cam={cam} light={ROOM} sky={SKY_ROOM} scene={<><RoomOnly open><Room t={t} beam={1} /></RoomOnly></>}>
    <Cel at={KCH}><Ken view={happy ? 'front' : 'right'} {...seat(happy ? 0.6 : 1)} handL={[lerp(-74, -100, st), lerp(-128, -400, st)]} handR={[lerp(74, 100, st), lerp(-128, -400, st)]}
      eyes={happy ? 'closed' : 'dot'} mouth={happy ? 'grin' : 'flat'} lookX={happy ? 0 : -6 + 8 * Math.sin(t * 3)} headTilt={happy ? 6 * Math.sin((t - K.holiday) * 2.5) : 0} bounce={happy ? 4 * spring(t, K.holiday, 2, 3) : 0} />
      {sp.map(([x, y, d], i) => { const s = pop(t, K.holiday + d, 0.3) * (1 - smooth(prog(t, K.holiday + 1.1 + d, K.holiday + 1.4 + d))); return <Sparkle key={i} x={x} y={y + 10 * Math.sin(t * 6 + i)} r={34 * s} fill="#FFE14D" />; })}
    </Cel>
  </World>);
};

// ---------------------------------------------------------------- A9: then co-workers start staring
const StareShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[CH(14), {pos: [0.15, 1.5, -0.6], look: [0.0, 1.05, -9], fov: 34}], [CH(16), {pos: [0.12, 1.45, -1.6], look: [0.0, 1.05, -9], fov: 33}]]);
  const u = prog(t, CH(14), CH(16) + 0.3), z = lerp(-9.3, -6.8, u);
  const s = t > K.staring - 0.15;
  return (<World cam={cam} light={OFFICE} sky={SKY_OFFICE} scene={<Office t={t} door={0} />}>
    <Coworkers t={t} stare={K.staring - 0.5} />
    <Cel at={[0.0, 0, z]}><Ken view="front" {...walk(u * 6 * Math.PI, true, 20)} handR={[70, -200]} eyes={s ? 'dot' : 'dot'} mouth={s ? 'wavy' : 'smile'} lookX={s ? 6 * Math.sin(t * 5) : 0} sweat={s ? smooth(prog(t, K.staring, K.staring + 0.3)) : 0} brow={s ? -0.6 : 0} /></Cel>
  </World>);
};

// ---------------------------------------------------------------- A10: the emails stop (his phone on the bare desk)
const EmailShot: React.FC<{t: number}> = ({t}) => {
  const p: V3 = [2.36, 0.74, -12.5];
  const cam = cam3At(t, [[CH(16), {pos: [1.75, 1.45, -11.9], look: [2.38, 0.74, -12.42], fov: 32}], [CH(17), {pos: [1.85, 1.32, -12.0], look: [2.38, 0.74, -12.42], fov: 30}]]);
  const rows = 5 - 5 * prog(t, K.emails - 0.1, K.emails + 0.6);
  return <World cam={cam} light={{...ROOM, focus: [2.4, 0.7, -12.0], span: 1.5}} sky={SKY_ROOM} scene={<><RoomOnly><Room t={t} /></RoomOnly><Phone pos={[p[0], p[1] + 0.008, p[2] + 0.075]} rot={[-Math.PI / 2, 0, 0.3]} rows={rows} s={1.25} /></>} />;
};

// ---------------------------------------------------------------- A11: his old desk, someone else's photos
const OldDeskShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[CH(17), {pos: [1.3, 1.55, 7.6], look: [0.5, 1.0, 1.6], fov: 34}], [K.photos - 0.2, {pos: [1.2, 1.5, 6.9], look: [0.6, 1.0, 1.6], fov: 33}]]);
  const stop = t > K.desk - 0.1; const at: V3 = [lerp(-0.45, 0.15, smooth(prog(t, CH(17), K.desk))), 0, 2.9];
  return (<World cam={cam} light={OFFICE} sky={SKY_OFFICE} scene={<Office t={t} oldDeskStranger />}>
    <Coworkers t={t} old />
    <Cel at={at}><Ken view={stop ? 'right' : 'right'} {...walk(t * 9, !stop)} handR={[70, -200]} eyes={stop ? 'wide' : 'dot'} mouth={stop ? 'o' : 'smile'} browUp={stop ? 0.9 : 0} /></Cel>
  </World>);
};
const PhotoShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[K.photos - 0.2, {pos: [0.95, 1.12, 2.5], look: [1.82, 0.84, 1.92], fov: 30}], [CH(19), {pos: [1.2, 1.02, 2.3], look: [1.82, 0.84, 1.92], fov: 28}]]);
  return (<World cam={cam} light={{...OFFICE, focus: [1.7, 0.7, 1.7], span: 2}} sky={SKY_OFFICE} scene={<Office t={t} oldDeskStranger />}>
    <Coworkers t={t} old />
  </World>);
};

// ---------------------------------------------------------------- A12-A14: every Friday the boss leans in, smiling
const FridayShot: React.FC<{t: number; t0: number; t1: number; light: Light; again?: boolean}> = ({t, t0, t1, light, again}) => {
  const cam = cam3At(t, [[t0, {pos: [0.6, 1.55, -16.2], look: [0.0, 1.25, -10.1], fov: 35}], [again ? t1 : K.smiling - 0.3, {pos: [0.5, 1.55, -15.6], look: [0.0, 1.28, -10.1], fov: 34}], ...(again ? [] : [[K.smiling + 0.3, {pos: [0.55, 1.52, -13.0], look: [0.15, 1.4, -10.3], fov: 35}] as [number, Cam3], [t1, {pos: [0.5, 1.52, -12.85], look: [0.15, 1.4, -10.3], fov: 34}] as [number, Cam3]])]);
  const open = again ? 2.85 : 2.85 * smooth(prog(t, t0 + 0.1, t0 + 0.5)), lean = again ? 1 : smooth(prog(t, t0 + 0.4, t0 + 0.9));
  const grin = again || t > K.smiling - 0.2;
  return (<World cam={cam} light={light} sky={SKY_ROOM} scene={<><Office t={t} door={open} room={<Room t={t} />} /></>}
    front={<><Box pos={[-2.3, 0, -10.1]} size={[3.64, 3.1, 0.2]} color="#E9DECB" map={tex('speckle', [6, 3], 6)} cast={false} /><Box pos={[-0.53, 0, -9.98]} size={[0.08, 2.14, 0.06]} color="#6F777E" cast={false} /></>}>
    <Cel at={[lerp(-0.8, -0.05, lean), 0, -10.3]} h={1.76}><Boss view="left" lean={-16 * lean} faceDx={-6} mouth={grin ? 'grin' : 'smile'} eyes={grin ? 'closed' : 'dot'} handL={grin ? [-120, -330 + 8 * Math.sin(t * 8)] : [-74, -128]} browUp={grin ? 0.8 : 0}
      headTilt={grin ? -8 + 3 * Math.sin(t * 4) : 0} /></Cel>
  </World>);
};
const ForcedSmile: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[CH(21), {pos: [-0.3, 1.45, -9.5], look: [1.8, 1.12, -12.2], fov: 30}], [CH(22), {pos: [-0.15, 1.45, -9.7], look: [1.8, 1.14, -12.2], fov: 29}]]);
  const up = smooth(prog(t, K.enjoying - 0.2, K.enjoying + 0.15));
  return (<World cam={cam} light={ROOM} sky={SKY_ROOM} scene={<><RoomOnly open><Room t={t} /></RoomOnly></>}>
    <Cel at={KCH}><Ken view="front" {...seat(0.6)} mouth="teeth" eyes="dot" brow={-0.7} browUp={0.4} sweat={up} handR={[lerp(74, 110, up), lerp(-128, -300, up)]} headTilt={3 * Math.sin(t * 7) * up} faceDx={-10} lookX={-5} /></Cel>
  </World>);
};

// ---------------------------------------------------------------- A15 / A16: years in the corner; so you put your feet up too
const YearsShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[CH(23), {pos: [0.7, 2.5, -13.4], look: [2.6, 1.2, -15.3], fov: 32}], [CH(25), {pos: [-0.3, 1.5, -12.2], look: [1.9, 0.95, -15.5], fov: 33}]]);
  const hp = celPoint(cam, TCH, 1.64, [PHONE_HAND[0] + 2, PHONE_HAND[1] - 4]);
  return (<World cam={cam} light={ROOM} sky={SKY_ROOM} scene={<><RoomOnly><Room t={t} /></RoomOnly></>} front={<Phone pos={hp} rot={[0.35, -0.6, 0]} rows={0} dim />}>
    <TaroCel t={t} cam={cam} asleep />
  </World>);
};
const FeetUpShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[CH(25), {pos: [-0.9, 1.32, -7.6], look: [1.9, 0.85, -13.9], fov: 44}], [CH(26), {pos: [-0.85, 1.3, -8.0], look: [1.9, 0.85, -13.9], fov: 43}]]);
  const u = smooth(prog(t, K.feet2 - 0.3, K.feet2 + 0.25));
  const hp = celPoint(cam, TCH, 1.64, [PHONE_HAND[0] + 2, PHONE_HAND[1] - 4]);
  return (<World cam={cam} light={ROOM} sky={SKY_ROOM} scene={<><RoomOnly open><Room t={t} /></RoomOnly></>} front={<Phone pos={hp} rot={[0.35, -0.6, 0]} rows={5} />}>
    <TaroCel t={t} cam={cam} />
    <Cel at={KCH}><Ken view="right" {...(u > 0 ? feetUp(1, u) : seat(1))} handL={[lerp(-74, -70, u), lerp(-128, -360, u)]} handR={[lerp(74, 70, u), lerp(-128, -360, u)]} handsBack={u > 0.5}
      eyes={u > 0.6 ? 'closed' : 'dot'} mouth={u > 0.6 ? 'smile' : 'flat'} faceDx={u > 0.6 ? 0 : -12} lookX={u > 0.6 ? 0 : -6} /></Cel>
  </World>);
};

// ---------------------------------------------------------------- A17-A19: one Monday the chair is empty, the desk cleared
const EmptyChair: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[CH(27), {pos: [-1.5, 1.4, -11.5], look: [1.9, 0.75, -15.6], fov: 33}], [CH(28), {pos: [-0.6, 1.25, -12.6], look: [2.0, 0.72, -15.6], fov: 30}]]);
  return <World cam={cam} light={ROOM_MON} sky={SKY_ROOM} scene={<><RoomOnly><Room t={t} taro="cleared" /></RoomOnly></>} />;
};
const ClearedShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[CH(28), {pos: [-0.7, 1.45, -11.2], look: [1.5, 0.95, -15.2], fov: 36}], [K.cleared + 0.3, {pos: [-0.35, 1.42, -11.9], look: [1.3, 1.05, -15.0], fov: 33}], [CH(29), {pos: [-0.3, 1.42, -12.0], look: [1.3, 1.07, -15.0], fov: 32}]]);
  const pale = smooth(prog(t, K.cleared - 0.1, K.cleared + 0.3));
  return (<World cam={cam} light={{...ROOM_MON, focus: [1.2, 0, -15.4], span: 3}} sky={SKY_ROOM} scene={<><RoomOnly><Room t={t} taro="cleared" /></RoomOnly></>}>
    <Cel at={[0.95, 0, -14.75]}><Ken view="front" tint="#BFE3FF" tintAmt={pale} faceDx={pale > 0.5 ? 0 : 24} lookX={pale > 0.5 ? 0 : 7} eyes={pale > 0.5 ? 'wide' : 'dot'} mouth={pale > 0.5 ? 'wavy' : 'smile'} browUp={pale > 0.5 ? 1 : 0} brow={pale > 0.5 ? -0.8 : 0}
      handR={[74, -128]} sweat={pale} bounce={-3 * pale} /></Cel>
  </World>);
};

// ---------------------------------------------------------------- A20: in Japan (a city of offices from above)
const CityShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[CH(29), {pos: [-34, 58, 52], look: [0, 0, 0], fov: 30}], [CH(30), {pos: [-29, 51, 45], look: [0, 0, 0], fov: 30}]]);
  const B: React.ReactNode[] = [];
  for (let i = -4; i <= 4; i++) for (let j = -4; j <= 4; j++) {
    const n = (i + 4) * 9 + j + 4, h = 4 + rnd(n) * 12 + (i === 0 && j === 0 ? 6 : 0);
    B.push(<Box key={n} pos={[i * 6.5, 0, j * 6.5]} size={[4.2, h, 4.2]} r={0.1} color={['#D7DCE2', '#C5CED8', '#E8DCC8', '#B8C4CF'][n % 4]} map={tex('panels', [3, Math.round(h / 1.4)], 3 + (n % 5))} />);
  }
  return (<World cam={cam} light={CITY} sky={['#7FC0F5', '#E6F1FA']} scene={<>
    <Ground size={[200, 200]} color="#8E959C" map={tex('speckle', [60, 60], 2)} />
    {Array.from({length: 8}, (_, i) => <Ground key={'r' + i} size={[2.3, 60]} at={[(i - 3.5) * 6.5, 0]} y={0.02} color="#5B6168" />)}
    {Array.from({length: 8}, (_, i) => <Ground key={'c' + i} size={[60, 2.3]} at={[0, (i - 3.5) * 6.5]} y={0.025} color="#5B6168" />)}
    {B}
    {Array.from({length: 24}, (_, i) => <Ball key={'t' + i} pos={[(Math.floor(rnd(i) * 8) - 3.5) * 6.5 + 1.4, 0.8, (rnd(i + 40) - 0.5) * 44]} r={0.8} color="#4AA357" map={tex('speckle', [2, 2], 80 + i)} />)}
  </>} />);
};

// ---------------------------------------------------------------- A21: firing someone without a strong reason is very hard
const LOCKS: V3 = [0.45, 0, -0.6];
const Padlock: React.FC<{pos: V3; jig: number}> = ({pos, jig}) => (<group position={pos} rotation={[0, 0, 0.12 * jig]}>
  <mesh position={[0, 0.2, 0]} castShadow><torusGeometry args={[0.1, 0.025, 10, 24, Math.PI]} /><meshStandardMaterial color="#B8BEC6" metalness={0.6} roughness={0.3} /></mesh>
  <Box pos={[0, 0.0, 0]} size={[0.3, 0.24, 0.1]} r={0.03} color="#E6B23A" rough={0.35} metal={0.4} />
  <Cyl pos={[0, 0.1, 0.05]} rot={[Math.PI / 2, 0, 0]} r={0.025} h={0.02} color="#3A3A3E" cast={false} />
</group>);
const LockShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[CH(30), {pos: [-0.7, 1.5, 5.4], look: [0.15, 1.1, -0.5], fov: 36}], [K.hard, {pos: [-0.55, 1.45, 4.7], look: [0.15, 1.1, -0.5], fov: 35}], [CH(33), {pos: [-0.5, 1.42, 4.5], look: [0.15, 1.08, -0.5], fov: 34}]]);
  const bAt: V3 = [-0.42, 0, -0.15];
  const push = smooth(prog(t, K.firing - 0.1, K.firing + 0.45)), bounce = prog(t, K.hard - 0.45, K.hard + 0.1), fail = t > K.hard - 0.45;
  const hand: [number, number] = fail ? [-60, -400] : [lerp(90, 180, push), -260];
  const hp = celPoint(cam, bAt, 1.76, [hand[0] + 14, hand[1] - 4]);
  const slot: V3 = [LOCKS[0] - 0.05, 1.12, LOCKS[2] + 0.08];
  // the slip: in his hand, pushed at the slot, bounces back and falls on an arc
  const slip: V3 = !fail ? [lerp(hp[0], slot[0], push * 0.85), lerp(hp[1], slot[1], push * 0.85), lerp(hp[2], slot[2], push * 0.85)]
    : [lerp(slot[0], slot[0] - 0.75, bounce), Math.max(0.02, slot[1] + 0.35 * Math.sin(Math.PI * Math.min(1, bounce * 1.4)) - 1.1 * bounce * bounce), lerp(slot[2], slot[2] + 0.35, bounce)];
  const jig = spring(t, K.hard - 0.45, 4, 5);
  return (<World cam={cam} light={STUDIO} sky={['#EFE2CF', '#EFE2CF']} scene={<>
    <Ground size={[20, 20]} color="#C9A27A" map={tex('planks', [6, 12], 5)} rough={0.8} />
    <Box pos={[0, 0, -1.2]} size={[8, 3.2, 0.2]} color="#D9CBB5" map={tex('bricks', [5, 4], 9)} cast={false} />
    {/* a tall steel cabinet with one slot and two big padlocks: two tests the law requires */}
    <Box pos={[LOCKS[0], 0, LOCKS[2] - 0.3]} size={[1.3, 2.2, 0.55]} r={0.04} color="#5C7A99" map={tex('panels', [1, 3], 2)} rough={0.5} metal={0.3} />
    <Box pos={[slot[0], slot[1] - 0.03, LOCKS[2] - 0.01]} size={[0.42, 0.06, 0.02]} r={0.005} color="#1C1F24" cast={false} />
    <Padlock pos={[LOCKS[0] - 0.36, 0.72, LOCKS[2] + 0.06]} jig={jig} /><Padlock pos={[LOCKS[0] + 0.3, 0.72, LOCKS[2] + 0.06]} jig={-jig} />
  </>} front={<Box pos={slip} rot={[0, 0.25, fail ? bounce * 5 : 0.0]} size={[0.24, 0.17, 0.004]} r={0.001} color="#F49AC1" rough={0.6} />}>
    <Cel at={bAt} h={1.76}><Boss view="right" handR={hand} handL={fail ? [-74, -128] : [-74, -128]} lean={fail ? 0 : 6 * push} mouth={fail ? 'frown' : 'smile'} eyes={fail ? 'dot' : 'dot'} brow={fail ? -0.7 : 0.5}
      sweat={fail ? smooth(prog(t, K.hard - 0.2, K.hard + 0.2)) : 0} headTilt={fail ? 8 * Math.sin((t - K.hard) * 3) : 0} faceDx={fail ? -30 : 0} lookX={fail ? -4 : 0} /></Cel>
  </World>);
};

// ---------------------------------------------------------------- A22: so some companies take away the work
const TakeShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[CH(33), {pos: [0.95, 2.7, 0.4], look: [1.7, 0.72, -1.5], fov: 34}], [CH(35), {pos: [1.0, 2.5, 0.1], look: [1.7, 0.72, -1.5], fov: 33}]]);
  const take = prog(t, K.takeaway - 0.15, K.takeaway + 0.9);
  return <World cam={cam} light={{...OFFICE, focus: [1.6, 0.7, -1.5], span: 3}} sky={SKY_OFFICE} scene={<Office t={t} take={take} />} />;
};

// ---------------------------------------------------------------- A23 / A24: wait for you to leave; chase-out rooms
const WaitShot: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[CH(35), {pos: [-1.5, 1.6, -2.6], look: [0.3, 1.2, -10], fov: 36}], [CH(36), {pos: [-1.2, 1.55, -3.6], look: [0.3, 1.2, -10], fov: 35}]]);
  const out = smooth(prog(t, K.leave - 0.35, CH(36) + 0.3)), stand = t > K.leave - 0.2;
  const spin = lerp(3.0, 3.0 + 9 * smooth(prog(t, K.wait - 0.2, K.leave)), 1);
  const kAt: V3 = [lerp(0.0, -0.35, out), 0, lerp(-10.4, -8.7, out)];
  return (<World cam={cam} light={OFFICE} sky={SKY_OFFICE} scene={<><Office t={t} door={2.85} clock={spin} room={<Room t={t} />} /><OfficeChair pos={[1.05, 0, -9.45]} side={1} /></>}
    front={out > 0 ? <Box pos={celPoint(cam, kAt, 1.7, [0, -176])} size={[0.46, 0.3, 0.34]} r={0.01} color="#C8955E" map={tex('speckle', [2, 2], 14)} /> : null}>
    <Cel at={[1.0, 0, -9.35]} h={1.76}><Boss view={stand ? 'front' : 'left'} {...(stand ? {} : seat(-1))} handL={stand ? [-74, -128] : [-30, -250]} handR={stand ? [150, -250] : [-60, -230]}
      mouth={stand ? 'grin' : 'flat'} eyes={stand ? 'closed' : 'dot'} faceDy={stand ? 0 : 8} lookY={stand ? 0 : 6} bounce={stand ? 4 * spring(t, K.leave - 0.2, 3, 5) : 0} /></Cel>
    {out > 0 && <Cel at={kAt}><Ken view="front" {...walk(out * 4 * Math.PI, out < 1)} handL={[-96, -170]} handR={[96, -170]} eyes="dot" mouth="frown" brow={-0.6} /></Cel>}
  </World>);
};
const DoorCloses: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[CH(36), {pos: [0.0, 1.55, -1.0], look: [0.0, 1.1, -10], fov: 36}], [CH(38), {pos: [0.0, 1.45, -4.2], look: [0.0, 1.05, -10], fov: 34}]]);
  const open = 2.85 * (1 - smooth(prog(t, K.chaseout - 0.5, K.chaseout + 0.4)));
  return <World cam={cam} light={OFFICE} sky={SKY_OFFICE} scene={<Office t={t} door={open} room={<Room t={t} />} />} />;
};

// ---------------------------------------------------------------- ending: back to frame 0 under the subscribe button
const Ending: React.FC<{t: number}> = ({t}) => {
  const cam = cam3At(t, [[CH(38), {pos: [2.0, 1.75, 7.2], look: [0.55, 1.15, 1.0], fov: 38}], [K.subscribe + 0.9, CAM0]]);
  const look = t > K.subscribe && t < END - 0.85;
  return (<World cam={cam} light={OFFICE} sky={SKY_OFFICE} scene={<Office t={t} />}>
    <Coworkers t={t} far />
    <Cel at={KEN_DESK}><Ken view={look ? 'front' : 'right'} {...seat(look ? 0.6 : 1)} handL={[-74, -128]} handR={look ? [74, -128] : [108, -190 + 6 * Math.sin(t * 22)]} faceDx={look ? 0 : -10}
      faceDy={look ? -14 : 0} lookY={look ? -8 : 0} browUp={look ? 0.8 : 0} mouth="smile" eyes="dot" blink={bump(t, END - 0.6, END - 0.45)} /></Cel>
    <Cel at={BOSS_HOME} h={1.76}><Boss view="front" handR={[150, -230]} handL={[-74, -128]} mouth="grin" eyes={t > END - 0.5 || !look ? 'dot' : 'closed'} faceDy={look ? -12 : 0} lookY={look ? -6 : 0} headTilt={5} /></Cel>
  </World>);
};

// ---------------------------------------------------------------- composition
const Scenes: React.FC<{t: number}> = ({t}) => (
  <Cuts t={t} shots={[
    [0, <OfficeOpen t={t} />], [CH(2), <DoorShot t={t} t0={CH(2)} t1={CH(3)} />], [CH(3), <DeskInsert t={t} t0={CH(3)} t1={CH(4)} />], [CH(4), <DeskInsert t={t} t0={CH(4)} t1={CH(5)} drawerAt={K.work} />],
    [CH(5), <ClockShot t={t} />], [CH(6), <TaroShot t={t} />], [CH(8), <JobShot t={t} />], [CH(11), <SixShot t={t} />], [CH(12), <HolidayShot t={t} />],
    [CH(14), <StareShot t={t} />], [CH(16), <EmailShot t={t} />], [CH(17), <OldDeskShot t={t} />], [K.photos - 0.2, <PhotoShot t={t} />],
    [CH(19), <FridayShot t={t} t0={CH(19)} t1={CH(21)} light={ROOM} />], [CH(21), <ForcedSmile t={t} />], [CH(22), <FridayShot t={t} t0={CH(22)} t1={CH(23)} light={ROOM_EVE} again />],
    [CH(23), <YearsShot t={t} />], [CH(25), <FeetUpShot t={t} />], [CH(26), <DoorShot t={t} t0={CH(26)} t1={CH(27)} light={ROOM_MON} monday />], [CH(27), <EmptyChair t={t} />],
    [CH(28), <ClearedShot t={t} />], [CH(29), <CityShot t={t} />], [CH(30), <LockShot t={t} />], [CH(33), <TakeShot t={t} />], [CH(35), <WaitShot t={t} />],
    [CH(36), <DoorCloses t={t} />], [CH(38), <Ending t={t} />]]} />);
export const Short: React.FC<{voice?: boolean; captions?: boolean; guides?: boolean}> = ({voice = false, captions = true, guides = false}) => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps;
  return (<AbsoluteFill style={{background: '#000'}}>
    <Scenes t={t} />
    <Cta t={t} tIn={K.subscribe - 0.1} tClick={K.strange + 0.05} tBell={K.this} tOut={END - 0.8} y={330} />
    {captions && <Captions t={t} />}
    {guides && <SafeGuides />}
    <Audio src={staticFile(`${T.short}/sfx.wav`)} volume={0.42} />
    <Audio src={staticFile(`${T.short}/bed.wav`)} volume={0.2} />
    {voice && <Sequence from={Math.round(Math.max(0, T.voiceOffset) * fps)} layout="none"><Audio src={staticFile(`${T.short}/vo.wav`)} /></Sequence>}
  </AbsoluteFill>);
};

// ---------------------------------------------------------------- thumbnails (frames of the video + text)
export const Thumb: React.FC<{variant: 'A' | 'B' | 'C'}> = ({variant}) => {
  const cfg = {A: {t: K.feet + 0.5, l1: 'PAID TO DO', l2: 'NOTHING'}, B: {t: K.cleared + 0.5, l1: 'THEN ONE MONDAY', l2: 'HE WAS GONE'}, C: {t: K.nothing + 0.4, l1: "JAPAN'S", l2: 'CHASE-OUT ROOM'}}[variant];
  return (<AbsoluteFill><Scenes t={cfg.t} /><ThumbText l1={cfg.l1} l2={cfg.l2} top={210} /></AbsoluteFill>);
};
